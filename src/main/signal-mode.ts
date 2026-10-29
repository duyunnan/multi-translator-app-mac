// --signal-mode 引导：以打包模式加载内置 Signal 桌面版（signal-app.asar）。
// 由 bootstrap.ts 根据 argv 选择加载；本模块加载后由 Signal 自身 main 接管事件循环。
import { app } from 'electron'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import './signal-packaged-patch'

function resolveSignalAsar(): string | null {
  // 打包：Windows 与 macOS 的 extraResources 都投放到 resources 根，同名 signal-app.asar；
  // dev：macOS 版放 resources/mac/，与 Windows 版并存互不覆盖
  const prod = join(process.resourcesPath, 'signal-app.asar')
  if (existsSync(prod)) return prod
  const dev = join(__dirname, '..', '..', 'resources', 'mac', 'signal-app.asar')
  if (existsSync(dev)) return dev
  const devWin = join(__dirname, '..', '..', 'resources', 'signal-app.asar')
  if (existsSync(devWin)) return devWin
  return null
}

const signalAsar = resolveSignalAsar()

// macOS：Signal 子进程会往 Dock 放一个自己的图标，多账号就是一排重复图标。
// Windows 侧对应的是托盘图标（signal-packaged-patch.ts 已 stub 掉 Tray），
// 这里用 dock.hide() 达到同样的效果。Signal 自己仍可能在内部唤起重显，
// 属于外观问题，不影响功能，故放在 try 里、不阻断启动。
if (process.platform === 'darwin') {
  try {
    app.whenReady().then(() => {
      try {
        app.dock?.hide()
      } catch {
        /* ignore */
      }
    })
  } catch {
    /* ignore */
  }
}

if (!signalAsar) {
  console.error('[signal-mode] signal-app.asar 未找到，无法启动内置 Signal')
  app.quit()
} else {
  // 多账号：每个账号独立 userData（--user-data-dir=<profileDir>）
  const userDataArg = process.argv.find((a) => a.startsWith('--user-data-dir='))
  if (userDataArg) app.setPath('userData', userDataArg.slice('--user-data-dir='.length))

  const signalMain = join(signalAsar, 'bundles', 'main.js')
  try {
    // Signal 的原生模块（@signalapp/*、@indutny/*）可能只存在于 asar.unpacked 或
    // asar 内部 node_modules，扩展 resolve 逻辑保证能解析。
    const Module = require('module') as {
      _resolveFilename: (...args: unknown[]) => string
    }
    const signalNodeModules = join(signalAsar, 'node_modules')
    const originalResolveFilename = Module._resolveFilename
    Module._resolveFilename = function (this: unknown, ...args: unknown[]): string {
      const request = String(args[0] ?? '')
      if (request.startsWith('@signalapp/') || request.startsWith('@indutny/')) {
        try {
          return originalResolveFilename.call(this, ...args)
        } catch {
          try {
            return originalResolveFilename.call(this, join(signalNodeModules, request), ...args.slice(1))
          } catch {
            throw new Error(`[signal-mode] cannot resolve ${request}`)
          }
        }
      }
      return originalResolveFilename.call(this, ...args)
    }

    // Signal 从 app.getAppPath() 推导 config 目录；内嵌加载时指向 asar 内 config
    process.env.NODE_CONFIG_DIR = join(signalAsar, 'config')
    process.env.NODE_ENV = 'production'
    process.env.SIGNAL_ENV = 'production'
    ;(app as unknown as { getAppPath: () => string }).getAppPath = () => signalAsar

    // 伪装为真实 Signal 构建，避免服务器拒绝连接
    try {
      const sigPkg = JSON.parse(readFileSync(join(signalAsar, 'package.json'), 'utf8')) as {
        version?: string
        productName?: string
      }
      const sigVersion = sigPkg.version || '8.7.0'
      const sigName = sigPkg.productName || 'Signal'
      try {
        app.setName(sigName)
      } catch {
        /* ignore */
      }
      ;(app as unknown as { getName: () => string }).getName = () => sigName
      ;(app as unknown as { getVersion: () => string }).getVersion = () => sigVersion
      console.log(`[signal-mode] masquerading as ${sigName} ${sigVersion}`)
    } catch (e) {
      console.error('[signal-mode] masquerade failed:', e)
    }

    require(signalMain)
  } catch (err) {
    console.error('[signal-mode] failed to load Signal main:', err)
    const raw = String((err as Error)?.message || err)
    // 原生模块（libsignal / sqlcipher / ringrtc …）是 asar 的 unpacked 条目：运行时取的是
    // 同目录的 `signal-app.asar.unpacked/`。两者不成套时就抛
    //   ENOENT, node_modules\@signalapp\...\@signalapp+libsignal-client.node not found in signal-app.asar
    // 这里补一句人话，免得用户只看到一串英文路径。
    const missingNative =
      raw.includes('not found in') && raw.includes('signal-app.asar')
    app.whenReady().then(() => {
      const { BrowserWindow } = require('electron') as typeof import('electron')
      const win = new BrowserWindow({ width: 640, height: 420, title: 'Signal Error' })
      win.loadURL(
        'data:text/html;charset=utf-8,' +
          encodeURIComponent(
            '<meta charset="utf-8"><h2>Signal 启动失败</h2>' +
              (missingNative
                ? '<p style="color:#c00">内置 Signal 的原生模块没能从安装目录取出：' +
                  'resources 下的 signal-app.asar 与 signal-app.asar.unpacked 必须成套存在。' +
                  '请用最新安装包重新安装（安装目录要与快捷方式指向的目录一致）。</p>'
                : '') +
              '<pre>' +
              raw +
              '</pre>'
          )
      )
    })
  }
}
