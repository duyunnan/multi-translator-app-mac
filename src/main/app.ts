/**
 * 主进程入口：单实例锁、主窗口、托盘、IPC 注册、本地服务器启动。
 */
import { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, shell } from 'electron'
import { cpus, release } from 'os'
import { join } from 'path'
import { IPC } from '../shared/types'
import { flushDebugLogSync, logCrashSync, logDebug } from './services/debug-log'
import { markCleanExit, reportCrash, reportPendingCrash } from './services/crash-reporter'
import { registerAccountsIpc } from './ipc/accounts'
import { registerTranslateIpc } from './ipc/translate'
import { registerSettingsIpc } from './ipc/settings'
import { registerServerIpc } from './ipc/server'
import { registerSignalIpc } from './ipc/signal'
import { registerLineIpc } from './ipc/line'
import { registerOverlayIpc } from './ipc/overlay'
import { registerWebviewIpc } from './ipc/webview'
import { registerMemoryIpc } from './ipc/memory'
import { startMemoryGuard, stopMemoryGuard } from './services/memory-guard'
import { registerToolsIpc, setToolsMainWindowGetter } from './services/tools'
import { registerUpdaterIpc } from './services/updater'
import { startLocalServer, stopLocalServer } from './services/local-server'
import { translationCache } from './services/translator'
import { registerAuthIpc } from './ipc/auth'
import { initAuth, logout } from './services/auth'
import {
  bindHostWindow,
  cleanupAllSignals,
  cleanupStaleProfileTrash,
  killAllSignalsNow,
  relocateAllEmbedded,
} from './services/signal-manager'
import {
  bindLineHost,
  cleanupAllLines,
  relocateAllLineEmbedded,
  reconcileOrphanLinePartitions,
} from './services/line-manager'
import { registerMessengerIpc } from './ipc/messenger'
import {
  bindMessengerWindowHost,
  cleanupAllMessengerWindows,
  killAllMessengerNow,
  relocateAllMessengerEmbedded,
} from './services/messenger-window-manager'

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
// 是否正在真正退出（托盘「退出」/app.quit）。为 false 时点击关闭按钮只隐藏到托盘，
// 避免销毁主窗口后 Signal/Messenger 等独立原生窗口失去宿主而残留在桌面。
let isQuitting = false
// 退出清理是否已启动（before-quit 会被多次触发，只允许跑一次清理流程）
let quitCleanupStarted = false

// 关键：让 App 使用英文 userData 目录。productName 为中文「财运亨通翻译器」会导致
// Electron 默认 userData = %APPDATA%\财运亨通翻译器（中文路径）；Facebook/Messenger 重度依赖
// Chromium 的 File System / Service Worker / IndexedDB 存储，中文字符路径下无法正常加锁
// （报 "File System/Origins/LOCK: Access denied"），导致 messenger 登录后验证码"请重试"、
// 聊天无法加载/收发。鑫五洋因 app.name 为英文 multi-translator-app 而全程正常。
// 这里在 app ready 前把 userData 固定到英文目录 %APPDATA%\cyht-translator-app。
// （旧中文目录下的账号/登录态需一次性迁移到该英文目录，见仓库说明/迁移步骤。）
try {
  app.setPath('userData', join(app.getPath('appData'), 'cyht-translator-app'))
} catch {
  /* ignore */
}

const gotLock = app.requestSingleInstanceLock()
if (!gotLock) {
  app.quit()
} else {
  // ── 渲染管线（多开防卡关键，对齐鑫五洋已验证配置）─────────────────────────────
  // 1) 绝不全局 use-angle=swiftshader：那会让**所有**账号 webview 的页面合成/光栅化走 CPU，
  //    多开几个账号时 CPU 直接打满 → 界面卡死/白屏（本站历史卡顿的根因）。
  //    只保留 enable-unsafe-swiftshader，让 Chromium 在确实拿不到硬件 WebGL 时才回退软渲染，
  //    保住 Messenger E2EE/PIN 依赖的 WebGL 能力。
  // 2) 开启硬件光栅化 + 按核数限制光栅线程，降低多 webview 合成开销。
  // 3) 关闭窗口遮挡（occlusion）计算：多账号窗口互相遮挡/叠放时该计算本身很吃 CPU。
  // 4) Win10/Server 让 GPU 进程内联进浏览器进程，避免 GPU 进程崩溃导致整窗白屏。
  // 5) **不再全局 disable-renderer-backgrounding**：该开关会让所有后台账号的渲染进程
  //    始终保持满速（定时器/rAF/DOM 扫描不降频），多开时后台账号继续抢 CPU —— 与省 CPU
  //    的目标相反。改为只对「当前激活账号」按需关节流（IPC.WebviewSetThrottle +
  //    webpreferences backgroundThrottling=yes），其余账号交给 Chromium 正常降频。
  // 需在 app ready 前设置。
  try {
    app.commandLine.appendSwitch('enable-unsafe-swiftshader')
    app.commandLine.appendSwitch('disable-gpu-sandbox')
    app.commandLine.appendSwitch('disable-features', 'HardwareMediaKeyHandling,CalculateNativeWinOcclusion')
    app.commandLine.appendSwitch('disable-renderer-accessibility')
    if (process.platform === 'win32') {
      app.commandLine.appendSwitch('enable-gpu-rasterization')
      app.commandLine.appendSwitch('disk-cache-size', '268435456')
      app.commandLine.appendSwitch('media-cache-size', '67108864')
      const gpuCores = Math.max(1, cpus().length)
      // Win11 判定：内部版本号 ≥ 22000（与鑫五洋一致）
      const isWin11 = Number((release().split('.')[2] || '0')) >= 22000
      if (isWin11) {
        if (gpuCores >= 6) app.commandLine.appendSwitch('num-raster-threads', '4')
      } else {
        // 注意：这里原本在 Win10 上开 in-process-gpu（把 GPU 进程内联进主进程）。
        // 实测代价远大于收益：内联后 GPU 侧任何致命错误（D3D 设备丢失、共享纹理释放、
        // 虚拟显示器驱动异常）都会直接带走**整个应用进程**，表现为"删除账号/webview 后
        // 软件无日志闪退"；而在远程桌面/虚拟显示器（向日葵、ToDesk）环境下尤其容易触发。
        // 改用 Electron 默认的独立 GPU 进程：GPU 崩溃只会重载 GPU 进程并局部重绘，
        // 应用进程与其它账号不受影响。（多开合成开销由上面的光栅线程数控制。）
        if (gpuCores >= 4) app.commandLine.appendSwitch('num-raster-threads', '2')
      }
    }
  } catch {
    /* ignore */
  }

  // Messenger / Facebook 页面的 window.open（登录跳转、外链等）会因 <webview>
  // 设置了 allowpopups 而被放行，弹出独立的 guest 子窗口（表现为"单独弹出
  // Messenger 新窗口"）。这里对承载 messenger 的 webview guest 统一拦截，
  // 阻止新建窗口并改由系统浏览器打开外链，聊天期间不再单独弹窗。
  app.on('web-contents-created', (_event, wc) => {
    // 仅处理内嵌 <webview>（messenger/whatsapp/telegram 账号页）生成的 guest，
    // 不触碰主窗口 / Signal / LINE（它们各有独立窗口策略）。
    if (wc.getType() !== 'webview') return

    // 说明：这里原先用 app.on('did-attach-webview') 做 Messenger session 兜底配置，但 Electron 的
    // app 上并无该事件（tsc 报 TS2769），那段代码从未执行过。该兜底现由 IPC.WebviewGetConfig
    // 承担（渲染层在设置 webview.src 之前调用，见 ipc/webview.ts），时机同样在导航之前且可靠。
    wc.setWindowOpenHandler(({ url }) => {
      const isMessengerPopup =
        /messenger\.com|facebook\.com|m\.me|fb\.me|facebook\.net|messenger\.com/i.test(url) ||
        /messenger\.com|facebook\.com|m\.me/i.test(wc.getURL())
      // 仅对 Messenger/Facebook 会话页的弹窗做拦截，WhatsApp / Telegram 保留原有行为
      if (!isMessengerPopup) return { action: 'allow' }
      if (/^https?:/i.test(url)) void shell.openExternal(url)
      return { action: 'deny' }
    })
  })

  // 崩溃取证 + 上报：渲染进程 / 子进程异常退出时写 **同步** crash.log 并上报后台。
  // "删除账号后软件闪退"此前查不到任何痕迹：崩溃进程不会执行 JS 日志，而 debug.log 又是
  // 250ms 异步缓冲，进程一没就是最后一段日志一起丢。这里统一同步落盘 + 实时上报，
  // 便于区分是主进程退出、渲染进程崩溃还是 GPU/utility 崩溃（"又崩了"的排查全靠它）。
  // 注意：clean-exit / killed 属于正常销毁（关窗、退出、我们主动 kill），不算崩溃，不上报避免噪音。
  app.on('render-process-gone', (_e, wc, details) => {
    let type = 'unknown'
    try {
      type = wc.getType()
    } catch {
      /* 已销毁 */
    }
    logCrashSync(`[crash] render-process-gone type=${type} reason=${details.reason} exitCode=${details.exitCode}`)
    if (details.reason === 'clean-exit' || details.reason === 'killed') return
    void reportCrash({
      crashType: 'crash',
      errorType: 'RenderProcessGone',
      message: `渲染进程异常退出：type=${type} reason=${details.reason} exitCode=${details.exitCode}`,
      extra: { type, reason: details.reason, exitCode: details.exitCode },
    })
  })
  app.on('child-process-gone', (_e, details) => {
    logCrashSync(
      `[crash] child-process-gone type=${details.type} reason=${details.reason} exitCode=${details.exitCode}`,
    )
    if (details.reason === 'clean-exit' || details.reason === 'killed') return
    void reportCrash({
      crashType: 'crash',
      errorType: 'ChildProcessGone',
      message: `子进程异常退出：type=${details.type} reason=${details.reason} exitCode=${details.exitCode}`,
      extra: { type: details.type, reason: details.reason, exitCode: details.exitCode },
    })
  })
  // 主进程未捕获异常 / 未处理 Promise：不记录的话进程可能在毫无痕迹的情况下退出
  process.on('uncaughtException', (err) => {
    logCrashSync(`[crash] uncaughtException ${err?.stack || String(err)}`)
    void reportCrash({
      crashType: 'error',
      errorType: err?.name || 'Error',
      message: err?.message || String(err),
      stackTrace: err?.stack || String(err),
    })
  })
  process.on('unhandledRejection', (reason) => {
    logCrashSync(`[crash] unhandledRejection ${String(reason)}`)
    const err = reason instanceof Error ? reason : null
    void reportCrash({
      crashType: 'error',
      errorType: err?.name || 'UnhandledRejection',
      message: err?.message || String(reason),
      stackTrace: err?.stack || String(reason),
    })
  })

  app.on('second-instance', () => {
    // 再次运行（或点击快捷方式）时恢复/重建主窗口
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.show()
      mainWindow.focus()
    } else {
      createMainWindow()
    }
  })

  app.whenReady().then(() => {
    // 启动即回收历史残留的 LINE 分区（含登录数据者留待重新添加账号时恢复免扫码）
    reconcileOrphanLinePartitions()
    // 回收上次退出时因进程仍占用而没删干净的 Signal profile（.trash-*），
    // 避免磁盘里堆积半残目录
    cleanupStaleProfileTrash()
    registerIpc()
    // 内存哨兵：按全部进程（含每个账号的 webview 渲染进程）的驻留内存判定压力，
    // 超阈值时推送渲染层，由渲染层休眠最久未访问的账号真正释放内存。
    // （旧实现只看主进程 heapUsed，多开时永远不会触发，等于没有监控。）
    startMemoryGuard()
    // 恢复本地登录态并启动心跳（若之前已登录）
    initAuth()
    startLocalServer().then(({ port }) => {
      console.log(`[main] local server ready at ${port}`)
    })
    createMainWindow()
    createTray()
    // 延迟补报上次异常退出的崩溃日志：进程被原生崩溃带走时没机会发请求，只能下次启动补
    setTimeout(() => {
      void reportPendingCrash()
    }, 5000)
  })

  app.on('window-all-closed', () => {
    // 托盘常驻：窗口关闭不退出（除非显式退出）
    if (process.platform !== 'darwin' && !tray) {
      app.quit()
    }
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })

  app.on('before-quit', (e) => {
    isQuitting = true
    // 记录退出起点：crash.log 里若只有退出记录、没有 [crash]，说明是正常退出而非闪退
    logCrashSync('[app] before-quit')
    // 标记正常退出：下次启动据此判断上次是否异常终止（决定要不要补报崩溃日志）
    markCleanExit()
    // 日志已改为 250ms 异步批量写，退出前同步落盘一次，避免缓冲区内容丢失
    flushDebugLogSync()
    if (quitCleanupStarted) return
    quitCleanupStarted = true
    // Signal / Messenger 子进程是 detached 启动的，父进程退出不会自动带走，
    // 之前的 cleanupAllSignals() 是 fire-and-forget（内部还要等子进程优雅关闭，
    // 最多 6s），Electron 不等就退出了 → "完全退出软件后 signal 仍在运行"。
    // 这里先阻止默认退出，跑完清理并同步强杀进程树后再显式退出。
    // 注意：cleanupAllSignals() 只停进程、**保留 Signal profile（登录态）**，
    // 不会销毁 profile —— 退出软件不该让人重新扫码关联。
    e.preventDefault()

    stopLocalServer()
    stopMemoryGuard()
    translationCache.flush()

    const forceKill = (): void => {
      killAllSignalsNow()
      killAllMessengerNow()
    }
    // 硬超时兜底：优雅清理超过 3s 未完成也照杀照退，绝不留残留子进程
    const bail = setTimeout(() => {
      forceKill()
      app.exit(0)
    }, 3000)

    void Promise.allSettled([
      cleanupAllSignals(),
      cleanupAllLines(),
      cleanupAllMessengerWindows(),
    ]).then(() => {
      clearTimeout(bail)
      forceKill()
      app.exit(0)
    })
  })
}

function registerIpc(): void {
  registerAuthIpc()
  registerAccountsIpc()
  registerTranslateIpc()
  registerSettingsIpc()
  registerServerIpc()
  registerSignalIpc()
  registerLineIpc()
  registerMessengerIpc()
  registerWebviewIpc()
  registerMemoryIpc()
  registerOverlayIpc()
  registerToolsIpc()
  registerUpdaterIpc()
  setToolsMainWindowGetter(() => mainWindow)
  // webview DOM ready 通知（供 P2 注入层统计）
  ipcMain.on(IPC.WebviewDomReady, (_e, webviewId: string, url: string) => {
    logDebug(`[webview:${webviewId}] dom-ready ${url}`)
  })
  // 临时调试通道
  ipcMain.on('dbg:input-chain', (_e, msg: string) => {
    logDebug(`[dbg:input-chain] ${msg}`)
  })
  ipcMain.on('dbg', (_e, msg: string) => {
    logDebug(`[dbg] ${msg}`)
  })
  // 同步取证通道：用于删除账号等容易被原生崩溃中断的关键路径（走 logDebug 的异步缓冲会丢）
  ipcMain.on('dbg:sync', (_e, msg: string) => {
    logCrashSync(`[path] ${msg}`)
  })
}

/**
 * leading + trailing 节流：宿主窗口拖动/缩放时 move/resize 事件触发极密集，
 * 直接每次都重定位内嵌原生窗口会抖动；这里限制频率，结束前必定再补一次保证落位准确。
 */
function throttleRelocate(fn: () => void, wait = 100): () => void {
  let last = 0
  let timer: ReturnType<typeof setTimeout> | null = null
  return () => {
    const now = Date.now()
    const run = (): void => {
      last = Date.now()
      timer = null
      fn()
    }
    if (now - last >= wait) {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      run()
    } else if (!timer) {
      timer = setTimeout(run, wait - (now - last))
    }
  }
}

/** 图标文件路径：开发时读取项目 build/ 目录，打包后读取 resources 目录 */
function iconPath(name: string): string {
  return app.isPackaged
    ? join(process.resourcesPath, name)
    : join(__dirname, '../../build', name)
}

function createMainWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    title: '财运亨通翻译器',
    icon: iconPath('icon.png'),
    backgroundColor: '#f5f6fa',
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webviewTag: true,
      sandbox: false,
    },
  })

  // 渲染进程可访问的本地服务器端口（供 webview 注入脚本 fetch）
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow?.webContents.send('server:ready', { port: 17890 })
  })

  // 渲染层 console 转发到主进程日志（便于诊断）
  const onConsole = (e: unknown, details: unknown) => {
    // 兼容 Electron 35 新事件签名：字段可能在 event 上或第二参 details 上
    const a = (typeof details === 'object' && details ? details : e) as unknown as {
      level?: string | number
      message?: string
    }
    const b = e as unknown as { level?: string | number; message?: string }
    const level = a.level ?? b.level ?? 1
    const text = String(a.message ?? b.message ?? '')
    if (text) console.log(`[renderer:${String(level)}] ${text}`)
  }
  // Electron 35 使用新签名 (event, details)；旧签名 (event, level, message, line, sourceId)
  mainWindow.webContents.on('console-message', onConsole as never)

  // 打开外链走系统浏览器
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      void import('electron').then(({ shell }) => shell.openExternal(url))
    }
    return { action: 'deny' }
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Signal 窗口嵌入宿主 + 随宿主移动/缩放重定位（节流 + 结束后补一次）
  bindHostWindow(mainWindow)
  const relocateSignalSoon = throttleRelocate(() => relocateAllEmbedded())
  mainWindow.on('move', relocateSignalSoon)
  mainWindow.on('resize', relocateSignalSoon)
  mainWindow.on('moved', () => relocateAllEmbedded())
  mainWindow.on('resized', () => relocateAllEmbedded())

  // LINE 窗口嵌入宿主（复用同一宿主窗口，互不干扰）
  bindLineHost(mainWindow)
  const relocateLineSoon = throttleRelocate(() => relocateAllLineEmbedded())
  mainWindow.on('move', relocateLineSoon)
  mainWindow.on('resize', relocateLineSoon)
  mainWindow.on('moved', () => relocateAllLineEmbedded())
  mainWindow.on('resized', () => relocateAllLineEmbedded())

  // Messenger 独立窗口宿主（让其贴近主窗口打开）
  bindMessengerWindowHost(mainWindow)
  const relocateMessengerSoon = throttleRelocate(() => relocateAllMessengerEmbedded())
  mainWindow.on('move', relocateMessengerSoon)
  mainWindow.on('resize', relocateMessengerSoon)
  mainWindow.on('moved', () => relocateAllMessengerEmbedded())
  mainWindow.on('resized', () => relocateAllMessengerEmbedded())

  // 点关闭按钮（X）时隐藏到托盘而不是销毁窗口：
  // 销毁宿主会连带失去对 Signal/Messenger 原生窗口的 owner 关系，导致其界面
  // 一直留在桌面。隐藏会触发 'hide' 事件，各 manager 据此同步隐藏内嵌窗口。
  mainWindow.on('close', (e) => {
    if (isQuitting) return
    e.preventDefault()
    mainWindow?.hide()
  })

  mainWindow.on('closed', () => {
    bindHostWindow(null)
    bindLineHost(null)
    bindMessengerWindowHost(null)
    mainWindow = null
  })
}

function createTray(): void {
  // 用 32x32 PNG 加载托盘图标（Windows 会自动适配系统 DPI），
  // 相比内置 base64 图标更清晰可靠。
  const icon = nativeImage.createFromPath(iconPath('icon_32.png'))
  console.log(
    `[tray] icon empty=${icon.isEmpty()} size=${icon.getSize().width}x${icon.getSize().height} path=${iconPath('icon_32.png')}`
  )
  tray = new Tray(icon)
  tray.setToolTip('财运亨通翻译器')
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: '显示主界面', click: () => showMainWindow() },
      { type: 'separator' },
      {
        label: '退出',
        click: () => {
          tray = null
          isQuitting = true
          // 退出前通知授权服务器登出（短超时，失败也照常退出）
          void logout().finally(() => app.quit())
        },
      },
    ])
  )
  tray.on('double-click', () => showMainWindow())
}

function showMainWindow(): void {
  if (!mainWindow) {
    createMainWindow()
    return
  }
  if (mainWindow.isMinimized()) mainWindow.restore()
  mainWindow.show()
  mainWindow.focus()
}
