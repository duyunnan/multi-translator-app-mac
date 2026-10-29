/**
 * Messenger 独立运行模式（BrowserWindow 直载 + preload 翻译注入）。
 *
 * messenger 的登录/收发只有在"独立 Electron 进程 + 顶层 BrowserWindow 直接 loadURL"时才稳定
 * （webview guest 里验证码后会跳回登录）。这里 spawn 独立进程、BrowserWindow 直载
 * messenger.com，并给该 webContents 注入翻译 preload（webview-preload.js，发送翻译/自动翻译），
 * preload 通过 ipcRenderer 连到本进程注册的翻译 handler。英文 app name + 独立 user-data-dir。
 */
import { app, BrowserWindow, shell, Menu, ipcMain, net } from 'electron'
import { join } from 'node:path'
import { existsSync, appendFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { prepareMessengerSession } from './services/webview-session'
import { desktopChromeUA } from './services/user-agent'

if (app && typeof app.commandLine === 'object' && app.commandLine) {
  app.commandLine.appendSwitch('disable-gpu')
  app.commandLine.appendSwitch('disable-gpu-compositing')
  app.commandLine.appendSwitch('use-angle', 'swiftshader')
  // 关键：仅设 use-angle=swiftshader 时，Chromium 仍会拒绝把 SwiftShader 用于 WebGL，
  // 而 Messenger 的 E2EE / PIN 验证流程依赖 WebGL，拿不到就表现为「聊天一直转圈、
  // 消息收发不出来」。开启该开关允许软件 WebGL（与 src/main/app.ts 主窗口保持一致）。
  app.commandLine.appendSwitch('enable-unsafe-swiftshader')
}
if (app && typeof app.disableHardwareAcceleration === 'function') {
  app.disableHardwareAcceleration()
}

app.setName('messenger-desktop')

const TARGET_URL = 'https://www.messenger.com/'

function dlog(line: string): void {
  try {
    appendFileSync(join(app.getPath('userData'), 'messenger-sub.log'), `${new Date().toISOString()} ${line}\n`)
  } catch {
    /* ignore */
  }
  console.log(line)
}

/**
 * 纯净桌面 Chrome UA（不含 Electron / 应用名标识）。
 * FB/Messenger 会把带 Electron 标识的 UA 判定为可疑环境并拒绝长连接，表现为
 * 「能登录、但消息一直加载中 / SSL 握手失败」；换成纯净 Chrome UA 即恢复正常。
 * 与 src/main/ipc/webview.ts、src/main/services/webview-session.ts 的策略保持一致。
 */
function chromeUA(): string {
  return desktopChromeUA()
}

/** 翻译 preload：webview-preload.js 编译产物（发送翻译/自动翻译） */
function preloadPath(): string {
  const p = join(app.getAppPath(), 'out', 'preload', 'webview-preload.js')
  return existsSync(p) ? p : ''
}

async function googleTranslate(text: string, tl: string): Promise<string> {
  const url = new URL('https://translate.googleapis.com/translate_a/single')
  url.searchParams.set('client', 'gtx')
  url.searchParams.set('sl', 'auto')
  url.searchParams.set('tl', tl || 'en')
  url.searchParams.set('dt', 't')
  url.searchParams.set('dj', '1')
  const body = `q=${encodeURIComponent(text)}`
  const res = await net.fetch(url.href, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8', 'Accept-Encoding': 'identity' },
    body,
  })
  if (!res.ok) throw new Error('Google HTTP ' + res.status)
  const json = (await res.json()) as { sentences?: { trans?: string }[] }
  if (!json || !Array.isArray(json.sentences)) throw new Error('bad google response')
  return json.sentences.map((s) => s?.trans ?? '').join('').trim()
}

function registerMessengerIpc(): void {
  ipcMain.handle('webview:get-config', () => ({
    platform: 'messenger',
    homeUrl: TARGET_URL,
    userAgent: chromeUA(),
    preloadPath: '',
    defaultLang: 'zh-CN',
    sendLang: 'en',
    autoTranslate: true,
    fontSize: 13,
    badgeColor: '#c62828',
    badgeBgColor: 'rgba(255, 235, 238, 0.95)',
  }))
  ipcMain.handle('translate-text', async (_e, text?: unknown, lang?: unknown, _bypass?: unknown) => {
    const t = String(text ?? '')
    if (!t) return { success: false, error: 'empty' }
    try {
      const translated = await googleTranslate(t, String(lang ?? 'en') || 'en')
      return { success: true, translated }
    } catch (e) {
      return { success: false, error: String((e as Error)?.message || e) }
    }
  })
  ipcMain.handle('generate-reply', () => ({ success: false, error: 'not supported' }))
}

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  // 为该账号分区应用 messenger 兼容配置（删 CSP / 放行权限 / 纯净 UA）。
  // 缺失时 FB 会因自身 CSP 与 Electron 环境标识阻断页面脚本/worker，
  // 表现为「登录后消息一直加载、无法收发」。
  prepareMessengerSession('persist:messenger')

  mainWindow = new BrowserWindow({
    width: 1180,
    height: 840,
    minWidth: 780,
    minHeight: 580,
    autoHideMenuBar: true,
    backgroundColor: '#0084ff',
    title: 'Messenger',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: false, // 翻译 preload 需要与主世界共享 window 做 DOM 注入
      sandbox: false,
      partition: 'persist:messenger',
      preload: preloadPath(),
      spellcheck: false,
    },
  })

  const wc = mainWindow.webContents
  try {
    wc.setUserAgent(chromeUA())
  } catch {
    /* ignore */
  }
  wc.on('console-message' as never, (...a: unknown[]) => {
    try {
      const e = a[0] as { message?: string }
      const m = String((e && e.message) ?? a[1] ?? '')
      if (m && !/favicon|Source map/i.test(m)) dlog('[page:console] ' + m.slice(0, 220))
    } catch {
      /* ignore */
    }
  })
  wc.on('did-finish-load', () => {
    dlog('[page] loaded: ' + wc.getURL())
    // 启用发送翻译与自动翻译（Translator 默认关，需宿主推送开关）
    try {
      wc.send('mt-toggle-send-translation', { enabled: true })
      wc.send('mt-toggle-translation', { enabled: true, targetLang: 'zh-CN' })
    } catch (e) {
      dlog('[page] enable-err: ' + String(e))
    }
    // 探测 preload / translator 是否注入 + dump 消息 DOM 结构（用于重写接收翻译的 scanMessages）
    setTimeout(() => {
      wc.executeJavaScript(`(() => {
        const esc=(s)=>String(s||'').replace(/[\\r\\n]/g,' ').slice(0,90);
        const log=document.querySelector('[role="log"]');
        if(!log) return JSON.stringify({none:true});
        // 递归找"每条消息"容器：优先含 dir=auto 文本的叶子层；这里dump role=log 前3层里含文本的独立节点
        const rec=(el)=>{
          const txtNodes=Array.from(el.querySelectorAll('span[dir="auto"], div[dir="auto"]')).filter(n=>!n.children.length&&(n.textContent||'').trim());
          return txtNodes.map(n=>esc(n.textContent.trim())).slice(0,3);
        };
        const top=Array.from(log.children).slice(0,8);
        const items=[];
        for(const el of top){
          const r=el.getBoundingClientRect();
          const itemsIn=Array.from(el.children).slice(0,6);
          for(const sub of itemsIn){
            const rr=sub.getBoundingClientRect();
            if(rr.width<10)continue;
            const isMsg=!!sub.querySelector('span[dir="auto"],div[dir="auto"]');
            items.push({tag:sub.tagName.toLowerCase(), c:esc(sub.className).slice(0,40), w:Math.round(rr.width), right:Math.round(rr.right), texts:isMsg?rec(sub):[], hasText:isMsg});
          }
        }
        const top2=Array.from(log.querySelectorAll(':scope>div>div>div')).slice(0,12);
        const leaves=[];
        for(const d of top2){ const txt=(d.textContent||'').trim(); if(txt&&d.children.length<=2) leaves.push({c:esc(d.className).slice(0,30),w:Math.round(d.getBoundingClientRect().width),right:Math.round(d.getBoundingClientRect().right),t:esc(txt.slice(0,50))}); }
        return JSON.stringify({roleLog:!!log, mMessage:document.querySelectorAll('[data-testid="m-message"]').length, top:items.slice(0,24), leaves:leaves.slice(0,12)});
      })()`)
        .then((r) => dlog('[page] msgdom2: ' + String(r)))
        .catch((e) => dlog('[page] msgdom2-err: ' + String(e)))
    }, 4000)
  })
  wc.on('did-fail-load', (_e, code, desc, url) => dlog('[page] fail ' + code + ' ' + desc + ' ' + url))

  // 站内 messenger/facebook 留在本窗口，站外走系统浏览器
  wc.on('will-navigate', (event, url) => {
    const allowed = url.startsWith('data:') || url.startsWith('about:') || /messenger\.com|facebook\.com|m\.me/i.test(url)
    if (!allowed) {
      event.preventDefault()
      void shell.openExternal(url)
    }
  })
  wc.setWindowOpenHandler(({ url }) => {
    if (/messenger\.com|facebook\.com|m\.me/i.test(url)) {
      void wc.loadURL(url)
      return { action: 'deny' }
    }
    void shell.openExternal(url)
    return { action: 'deny' }
  })

  void wc.loadURL(TARGET_URL).catch((e) => dlog('[page] load err: ' + String(e)))
  mainWindow.on('closed', () => (mainWindow = null))
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null)
  registerMessengerIpc()
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

dlog('[messenger-mode] start ' + TARGET_URL)
