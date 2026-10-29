/**
 * --line-mode 引导：以独立 Electron 子进程加载 LINE 官方 Chrome 扩展（MV3，
 * 取自 CEO-SCRM 内置的 line/3.7.2_0）。
 *
 * 架构 v2：LINE 运行时从 Electron 22 升级为与主应用一致的 Electron 35。
 *   - Electron 22（Chromium 108）实测无法加载 MV3 扩展页
 *     （ERR_BLOCKED_BY_CLIENT / 白屏）；Electron 35（Chromium 134+）可正常
 *     loadExtension + 渲染扩展页（在 test-line-app 中验证：登录页 / 二维码
 *     / createQrCode / checkQrCodeVerified 长轮询均正常）。
 *   - 因此不再打包 electron22（体积 -200MB+）：line-runtime 直接复用主应用
 *     electron.exe（dev: node_modules/electron/dist/electron.exe，
 *     prod: process.execPath），以"独立子进程 + 窗口嵌入"方式运行。
 *
 * 兼容 shim（v13）覆盖 Electron 35 仍缺失的扩展 API（tabs.getZoom /
 * chrome.windows / chrome.cookies / runtime.id / action / notifications /
 * system.display）。关键修复是 chrome.runtime.id：LINE 页面用它判定运行环境
 * （BR = !chrome.runtime?.id），缺失会让登出流程（getProfile 400 → logoutV2
 * → xT().finally 中断）卡住，loginState 停在 LOG_IN_PROGRESSING → 登录页只
 * 转 loading、不发 createQrCode。补丁直接 prepend 到扩展 main.js/background.js
 * 开头（幂等，导航时不会被 Electron 重注入的扩展 API 覆盖）。
 *
 * 本模块由 electron.exe <...>/line-mode.js 启动：
 *   - 解析 LINE 扩展目录（dev: <项目根>/resources/extensions/line/<ver>/，
 *     prod: <resources>/extensions/line/<ver>/）
 *   - session.loadExtension() 加载扩展，然后打开其 index.html
 *   - 注入 CLEANUP_JS（发送翻译 / 消息翻译 / 未读统计），翻译走主应用
 *     local-server（127.0.0.1:17890，备用 17891）
 *   - 未读数经 stdout 的 [MT-UNREAD] 上报给主进程（复用 Signal 协议）
 */
import { app, BrowserWindow, session } from 'electron'
import type { WebContents } from 'electron'
import { existsSync, readdirSync, writeFileSync, readFileSync } from 'fs'
import { join } from 'path'
// 仅用于把主界面"译文显示设置"(badgeColor/badgeBgColor/fontSize/fontFamily)同步给 LINE 译文徽章
import { store } from './services/store'

// 关闭硬件加速，规避嵌入宿主窗口（SetParent）后 Chromium 合成器白屏
app.disableHardwareAcceleration()

// ── 修复 Electron 35 扩展 API 缺失导致的 白屏/卡 loading ───────────────────────
// LINE 扩展 main.js 初始化时按 MV3 Promise 风格调用 chrome.tabs.getZoom()、
// chrome.windows.*、chrome.cookies.* 等，并读取 chrome.action / notifications /
// system.display / runtime.getContexts；Electron 35 支持不全 → 抛未捕获异常。
// 最关键的 chrome.runtime.id：LINE 用它判定运行环境（BR = !chrome.runtime?.id），
// 缺失会让登出流程（getProfile 400 → logoutV2 → xT().finally 里 chrome.cookies
// .remove 抛错）中断 → CT() 不执行 → loginState 卡在 LOG_IN_PROGRESSING →
// 登录页只转 loading 而不发 createQrCode（test-line-app 实测验证）。
// preload 打补丁会被 Electron 导航时重新注入的扩展 API 覆盖；内联 script 又会被
// 扩展页面 CSP（script-src 'self'）拦截。因此把补丁直接 prepend 到
// static/js/main.js / background.js 文件开头，与扩展逻辑同文件执行、时机最可靠。
// 本 shim 为产品版（v13）：只补 API，不含网络 hook/消息等调试日志。
export const LINE_SHIM_MARK = '/*mt-line-shim-v13*/'
export const LINE_SHIM_JS = `(function () {
  try {
    var c = window.chrome || (window.chrome = {})
    if (!c.runtime) c.runtime = {}
    if (!c.runtime.id) c.runtime.id = '__MT_EXT_ID__'
    if (!c.runtime.getContexts) c.runtime.getContexts = function () { return Promise.resolve([]) }
    function evt() { return { addListener: function () {}, removeListener: function () {}, hasListener: function () { return false } } }
    // ---- tabs ----
    if (!c.tabs) c.tabs = {}
    var t = c.tabs
    t.getZoom = t.getZoom || function () { return Promise.resolve(1) }
    t.getZoomSettings = t.getZoomSettings || function () { return Promise.resolve({ mode: "automatic", scope: "per-origin", defaultZoomFactor: 1 }) }
    // ---- action ----
    if (!c.action) c.action = {}
    var a = c.action
    if (!a.onClicked) a.onClicked = evt()
    a.setBadgeText = a.setBadgeText || function () {}
    a.setBadgeBackgroundColor = a.setBadgeBackgroundColor || function () {}
    a.setIcon = a.setIcon || function () {}
    a.setTitle = a.setTitle || function () {}
    a.setPopup = a.setPopup || function () {}
    a.getPopup = a.getPopup || function () { return Promise.resolve("") }
    a.getBadgeText = a.getBadgeText || function () { return Promise.resolve("") }
    a.getBadgeBackgroundColor = a.getBadgeBackgroundColor || function () { return Promise.resolve([0, 0, 0, 0]) }
    // ---- notifications ----
    if (!c.notifications) c.notifications = {}
    var nt = c.notifications
    var nEvents = ["onClicked", "onClosed", "onButtonClicked", "onShown", "onPermissionLevelChanged"]
    for (var i = 0; i < nEvents.length; i++) if (!nt[nEvents[i]]) nt[nEvents[i]] = evt()
    nt.create = nt.create || function () {}
    nt.clear = nt.clear || function () {}
    nt.getAll = nt.getAll || function () { return Promise.resolve({}) }
    nt.getPermissionLevel = nt.getPermissionLevel || function () { return Promise.resolve("granted") }
    // ---- system.display ----
    if (!c.system) c.system = {}
    if (!c.system.display) c.system.display = {}
    var sd = c.system.display
    sd.getDisplays = sd.getDisplays || function () { return Promise.resolve([]) }
    sd.getDisplayLayout = sd.getDisplayLayout || function () { return Promise.resolve([]) }
    sd.getInfo = sd.getInfo || function () { return Promise.resolve([]) }
    // ---- windows（Electron 未实现 windows API，LINE 主界面依赖）----
    if (!c.windows) c.windows = {}
    var w = c.windows
    function lastCb(args) { for (var k = args.length - 1; k >= 0; k--) if (typeof args[k] === "function") return args[k]; return null }
    function wobj(id) { return { id: id || 1, type: "normal", state: "normal", focused: true, top: 0, left: 0, width: 1280, height: 720, alwaysOnTop: false, incognito: false } }
    function pc(cb, v) { if (cb) { cb(v); return undefined } return Promise.resolve(v) }
    w.getCurrent = w.getCurrent || function () { return pc(lastCb(arguments), wobj()) }
    w.getLastFocused = w.getLastFocused || function () { return pc(lastCb(arguments), wobj()) }
    w.getAll = w.getAll || function () { return pc(lastCb(arguments), [wobj()]) }
    w.get = w.get || function (id) { return pc(lastCb(arguments), wobj(id)) }
    w.update = w.update || function (id) { return pc(lastCb(arguments), wobj(id)) }
    w.create = w.create || function () { return pc(lastCb(arguments), wobj(99)) }
    w.remove = w.remove || function (id) { var cb = lastCb(arguments); if (cb) cb(); else return Promise.resolve() }
    var wEvents = ["onCreated", "onRemoved", "onFocusChanged", "onBoundsChanged"]
    for (var j = 0; j < wEvents.length; j++) if (!w[wEvents[j]]) w[wEvents[j]] = evt()
    // ---- cookies（兜底：Electron cookies.remove 无权限时抛错会中断登出流程）----
    if (!c.cookies) c.cookies = {}
    var ck = c.cookies
    if (!ck.remove) {
      ck.remove = function (details) {
        try {
          if (document.cookie) {
            var parts = document.cookie.split(";")
            for (var m = 0; m < parts.length; m++) {
              var kv = parts[m].split("=")
              var nm = (kv[0] || "").trim()
              if (nm) document.cookie = nm + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/"
            }
          }
        } catch (e2) {}
        return Promise.resolve({})
      }
    }
    if (!ck.get) ck.get = function () { return Promise.resolve(null) }
    if (!ck.getAll) ck.getAll = function () { return Promise.resolve([]) }
    if (!ck.set) ck.set = function () { return Promise.resolve({}) }
    window.addEventListener("error", function (e) {
      console.error("[line-mode][page-error]", e.message, "@", (e.filename || "") + ":" + e.lineno)
    })
    console.log("[line-mode] shim v13 active id=" + c.runtime.id)
    return true
  } catch (e) { return false }
})();`

// background.js（Service Worker）补丁：Electron 35 的 SW 环境缺 tabs/windows/
// action/notifications/system.display 事件与 API，事件缺失会导致 SW 崩溃。
export const SW_SHIM_MARK = '/*mt-line-shim-sw-v13*/'
export const SW_SHIM_JS = `(function () {
  try {
    var c = self.chrome || (self.chrome = {})
    if (!c.runtime) c.runtime = {}
    if (!c.runtime.id) c.runtime.id = '__MT_EXT_ID__'
    function evt() { return { addListener: function () {}, removeListener: function () {}, hasListener: function () { return false } } }
    if (!c.tabs) c.tabs = {}
    var tEvents = ["onActivated", "onCreated", "onRemoved", "onUpdated", "onMoved", "onReplaced", "onAttached", "onDetached", "onHighlighted", "onZoomChange"]
    for (var i = 0; i < tEvents.length; i++) if (!c.tabs[tEvents[i]]) c.tabs[tEvents[i]] = evt()
    if (!c.windows) c.windows = {}
    var wEvents = ["onCreated", "onRemoved", "onFocusChanged", "onBoundsChanged"]
    for (var j = 0; j < wEvents.length; j++) if (!c.windows[wEvents[j]]) c.windows[wEvents[j]] = evt()
    if (!c.action) c.action = {}
    var a = c.action
    if (!a.onClicked) a.onClicked = evt()
    a.setBadgeText = a.setBadgeText || function () {}
    a.setBadgeBackgroundColor = a.setBadgeBackgroundColor || function () {}
    a.setIcon = a.setIcon || function () {}
    a.setTitle = a.setTitle || function () {}
    a.setPopup = a.setPopup || function () {}
    a.getPopup = a.getPopup || function () { return Promise.resolve("") }
    a.getBadgeText = a.getBadgeText || function () { return Promise.resolve("") }
    a.getBadgeBackgroundColor = a.getBadgeBackgroundColor || function () { return Promise.resolve([0, 0, 0, 0]) }
    if (!c.notifications) c.notifications = {}
    var nt = c.notifications
    var nEvents = ["onClicked", "onClosed", "onButtonClicked", "onShown", "onPermissionLevelChanged"]
    for (var k = 0; k < nEvents.length; k++) if (!nt[nEvents[k]]) nt[nEvents[k]] = evt()
    nt.create = nt.create || function () {}
    nt.clear = nt.clear || function () {}
    nt.getAll = nt.getAll || function () { return Promise.resolve({}) }
    nt.getPermissionLevel = nt.getPermissionLevel || function () { return Promise.resolve("granted") }
    if (!c.system) c.system = {}
    if (!c.system.display) c.system.display = {}
    var sd = c.system.display
    sd.getDisplays = sd.getDisplays || function () { return Promise.resolve([]) }
    sd.getDisplayLayout = sd.getDisplayLayout || function () { return Promise.resolve([]) }
    sd.getInfo = sd.getInfo || function () { return Promise.resolve([]) }
    console.log("[line-mode] sw-shim v13 active id=" + c.runtime.id)
    return true
  } catch (e) { return false }
})();`

// 移除历史版本/测试阶段注入的 shim 段（v1/v2/v5/v6/v8~v12 等均以 mark 开头、
// 以 `})();` 结束的整块，从文件头连续堆叠）
export function stripOldShims(js: string, kind: 'line' | 'sw' | 'ltsm'): string {
  const re =
    kind === 'line'
      ? /^\/\*mt-line-shim(?:-v\d+)?\*\/[\s\S]*?\}\)\(\);\n?/
      : kind === 'sw'
        ? /^\/\*(?:mt-sw-shim(?:-v\d+)?|mt-line-shim-sw(?:-v\d+)?)\*\/[\s\S]*?\}\)\(\);\n?/
        : /^\/\*mt-ltsm-shim(?:-v\d+)?\*\/[\s\S]*?\}\)\(\);\n?/
  let out = js
  for (;;) {
    const next = out.replace(re, '')
    if (next === out) break
    out = next
  }
  return out
}

export function ensureLineIndexShim(extDir: string, extId: string): void {
  try {
    // 关键：把补丁 prepend 到 main.js 开头 —— 与扩展逻辑同文件执行，
    // 不会像 head/preload 那样被 Electron 导航时重新注入的扩展 API 覆盖
    const mainJsPath = join(extDir, 'static', 'js', 'main.js')
    const js = readFileSync(mainJsPath, 'utf8')
    if (!js.includes(LINE_SHIM_MARK)) {
      const shim = LINE_SHIM_JS.split('__MT_EXT_ID__').join(extId)
      writeFileSync(mainJsPath, LINE_SHIM_MARK + shim + '\n' + stripOldShims(js, 'line'), 'utf8')
      console.log('[line-mode] main.js shim v13 injected (id=' + extId + ')')
    }
  } catch (e) {
    console.error('[line-mode] main.js shim inject failed:', e)
  }
  try {
    // background.js（SW）：Electron 在扩展页首条消息时才实际启动 SW，
    // 此时文件已完成注入 → SW 以带 shim 的代码运行
    const bgPath = join(extDir, 'background.js')
    const bg = readFileSync(bgPath, 'utf8')
    if (!bg.includes(SW_SHIM_MARK)) {
      const shim = SW_SHIM_JS.split('__MT_EXT_ID__').join(extId)
      writeFileSync(bgPath, SW_SHIM_MARK + shim + '\n' + stripOldShims(bg, 'sw'), 'utf8')
      console.log('[line-mode] background.js shim v13 injected')
    }
  } catch (e) {
    console.error('[line-mode] background.js shim inject failed:', e)
  }
  try {
    // ltsmSandbox 不需要 shim，仅清理测试阶段残留（避免诊断日志刷屏）
    const lsPath = join(extDir, 'static', 'js', 'ltsmSandbox.js')
    const ls = readFileSync(lsPath, 'utf8')
    if (/mt-ltsm-shim/.test(ls)) {
      writeFileSync(lsPath, stripOldShims(ls, 'ltsm'), 'utf8')
      console.log('[line-mode] ltsmSandbox.js 旧 shim 已清理')
    }
  } catch (e) {
    console.error('[line-mode] ltsmSandbox cleanup failed:', e)
  }
}

export function resolveLineExtension(): string | null {
  const roots = [
    // prod: <resources>/extensions/line/<ver>/
    join(process.resourcesPath || '', 'extensions', 'line'),
    // dev（由 electron.exe <项目>/out/main/line-mode.js 启动时 app 路径为该目录）
    join(app.getAppPath(), 'resources', 'extensions', 'line'),
    join(__dirname, '..', '..', 'resources', 'extensions', 'line'),
  ]
  for (const root of roots) {
    try {
      if (!existsSync(root)) continue
      const sub = readdirSync(root).find((d) => existsSync(join(root, d, 'manifest.json')))
      if (sub) return join(root, sub)
    } catch {
      /* ignore */
    }
  }
  return null
}

// 宿主主进程 import 复用时仅导出常量/函数与 attachLinePage，不执行任何引导；
// 作为独立子进程入口（line-manager spawn 时携带 --standalone）才走窗口引导。
if (process.argv.includes('--standalone')) {
const lineExtension = resolveLineExtension()

if (!lineExtension) {
  console.error('[line-mode] LINE 扩展未找到，无法启动')
  app.quit()
} else {
  // 多账号：每个账号独立 userData（--user-data-dir=<profileDir>）
  const userDataArg = process.argv.find((a) => a.startsWith('--user-data-dir='))
  if (userDataArg) app.setPath('userData', userDataArg.slice('--user-data-dir='.length))

  app.whenReady().then(async () => {
    try {
      app.setName('LINE')
      const ses = session.fromPartition('persist:line')
      const ext = await ses.loadExtension(lineExtension, { allowFileAccess: true })
      console.log('[line-mode] extension loaded id=' + ext.id + ' v=' + ext.version)
      // 注入 API 兼容 shim（幂等），必须在 loadURL 前完成
      ensureLineIndexShim(lineExtension, ext.id)

      const win = new BrowserWindow({
        width: 1200,
        height: 800,
        show: true,
        backgroundColor: '#ffffff',
        autoHideMenuBar: true,
        webPreferences: {
          partition: 'persist:line',
          contextIsolation: false,
          sandbox: false,
          nodeIntegration: false,
          backgroundThrottling: false,
        },
      })

      // 打开外部链接走系统浏览器（LINE 里的 OAuth/帮助链接等）
      win.webContents.setWindowOpenHandler(({ url }) => {
        const { shell } = require('electron') as typeof import('electron')
        if (url.startsWith('http://') || url.startsWith('https://')) {
          shell.openExternal(url).catch(() => {})
        }
        return { action: 'deny' }
      })

      win.webContents.on('did-finish-load', () => {
        console.log('[line-mode] page loaded')
        // 诊断：确认页面 DOM 是否真实渲染 + 登录状态（区分"白屏/卡 loading/登录页/已登录"）
        setTimeout(() => {
          win.webContents
            .executeJavaScript(
              `(() => {
                if (!document.body) return 'NO_BODY'
                var html = document.body.innerHTML
                var hasLogin = html.indexOf('loginPage-module') >= 0
                var isLoading = html.indexOf('is_loading') >= 0
                var hasQr = html.indexOf('二维码') >= 0 || html.indexOf('扫码') >= 0
                var c = window.chrome || {}
                var id = (c.runtime && c.runtime.id) || null
                return {
                  len: html.length, title: document.title, hasLogin: hasLogin,
                  isLoading: isLoading, hasQr: hasQr, chromeRuntimeId: id,
                  hasCookies: !!(c.cookies)
                }
              })()`
            )
            .then((r: unknown) => console.log('[line-mode] diag ' + JSON.stringify(r)))
            .catch((e: unknown) => console.error('[line-mode] diag error ' + String(e)))
        }, 9000)
        // 页面加载完成后的延迟二次诊断：二维码/登录状态是否稳定
        setTimeout(() => {
          win.webContents
            .executeJavaScript(
              `(() => {
                if (!document.body) return 'NO_BODY'
                var html = document.body.innerHTML
                return {
                  len: html.length,
                  isLoading: html.indexOf('is_loading') >= 0,
                  hasQr: html.indexOf('二维码') >= 0,
                  hasCanvas: !!document.querySelector('canvas'),
                  qrText: (function () {
                    var m = html.match(/二维码登录[^<]{0,120}/)
                    return m ? m[0] : ''
                  })()
                }
              })()`
            )
            .then((r: unknown) => console.log('[line-mode] diag2 ' + JSON.stringify(r)))
            .catch((e: unknown) => console.error('[line-mode] diag2 error ' + String(e)))
        }, 18000)
      })
      const onConsoleMsg = (e: unknown) => {
        // 兼容 Electron 35 新事件对象（旧的位置参数已废弃）
        const p = e as unknown as {
          level?: number | string
          message?: string
          lineNumber?: number
          sourceId?: string
        }
        const level = typeof p.level === 'number' ? p.level : 1
        const msg = String(p.message ?? '')
        const src = String(p.sourceId ?? '')
        const line = typeof p.lineNumber === 'number' ? p.lineNumber : 0
        console.log(`[line-mode] console[${level}] ${msg} (${src}:${line})`)
      }
      win.webContents.on('console-message', onConsoleMsg as never)
      win.webContents.on('render-process-gone', (_e, details) => {
        console.error('[line-mode] renderer gone reason=' + details.reason)
      })
      win.webContents.on('did-fail-load', (_e, code, desc, failedUrl) => {
        console.error('[line-mode] load failed code=' + code + ' desc=' + desc + ' url=' + failedUrl)
        // 某些环境首次加载失败，尝试重新加载
        setTimeout(() => {
          try {
            win.webContents.reload()
          } catch {
            /* ignore */
          }
        }, 800)
      })
      win.on('closed', () => {
        // 宿主请求退出（WM_CLOSE）时结束进程
        setTimeout(() => app.quit(), 200)
      })

      await win.loadURL('chrome-extension://' + ext.id + '/index.html')
    } catch (e) {
      console.error('[line-mode] 启动失败:', e)
      try {
        process.stdout.write('\n[MT-FATAL] ' + String((e as Error).message || e) + '\n')
      } catch {
        /* ignore */
      }
      setTimeout(() => app.quit(), 500)
    }
  })
}
}

// ─────────────────────────────────────────────────────────────────────────────
// CLEANUP_JS：注入 LINE 扩展页面，提供发送翻译 / 消息翻译 / 智能回复 / 未读统计
// ─────────────────────────────────────────────────────────────────────────────
export const CLEANUP_JS = '(' + function mtLineCleanup() {
  if ((window as unknown as { __mtLineCleanup?: boolean }).__mtLineCleanup) return
  ;(window as unknown as { __mtLineCleanup?: boolean }).__mtLineCleanup = true

  const SERVER_PORT = 17890

  function dbg(msg: string): void {
    try {
      console.log('[MT-LINE-DBG] ' + msg)
    } catch {
      /* ignore */
    }
  }

  function isChinese(text: string): boolean {
    if (!text) return false
    const m = text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g)
    return !!(m && m.length > 0)
  }

  function showToast(message: string, duration?: number): void {
    duration = duration || 2500
    let toast = document.getElementById('mt-line-toast') as HTMLDivElement | null
    if (!toast) {
      toast = document.createElement('div')
      toast.id = 'mt-line-toast'
      toast.style.cssText =
        'position:fixed;top:60px;right:20px;background:rgba(6,199,85,0.92);color:white;padding:10px 18px;border-radius:8px;z-index:99999;font-size:14px;font-weight:500;pointer-events:none;white-space:nowrap;transition:opacity 0.4s;box-shadow:0 2px 8px rgba(0,0,0,0.2);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;'
      document.body.appendChild(toast)
    }
    toast.textContent = message
    toast.style.opacity = '1'
    clearTimeout((toast as unknown as { __t?: number }).__t)
    ;(toast as unknown as { __t?: number }).__t = window.setTimeout(() => {
      toast!.style.opacity = '0'
    }, duration)
  }

  async function translateViaLocalServer(text: string, targetLang: string): Promise<{ success: boolean; translated?: string; error?: string }> {
    const tryPort = async (port: number): Promise<{ success: boolean; translated?: string; error?: string }> => {
      const resp = await fetch('http://127.0.0.1:' + port + '/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetLang }),
      })
      if (!resp.ok) throw new Error('HTTP ' + resp.status)
      const data = await resp.json()
      if (data && data.success && data.translated) return { success: true, translated: data.translated }
      return { success: false, error: (data && data.error) || 'Translation failed' }
    }
    try {
      return await tryPort(SERVER_PORT)
    } catch (e) {
      try {
        return await tryPort(SERVER_PORT + 1)
      } catch {
        return { success: false, error: String((e as Error).message) }
      }
    }
  }

  // ── 发送翻译：在输入框按 Enter，检测中文 → 翻译 → 再按 Enter 发送 ──

  // LINE 桌面版的聊天输入框是自定义组件 <textarea-ex>（标签名 TEXTAREA-EX），
  // 内部可能是 Shadow DOM 包裹的原生 textarea。此函数尝试定位真实输入元素。
  function findInnerInput(el: HTMLElement | null): HTMLElement | null {
    if (!el) return null
    const tag = el.tagName.toUpperCase()
    if (tag === 'TEXTAREA' || tag === 'INPUT') return el
    if (el.isContentEditable) return el
    try {
      const root = (el as HTMLElement & { shadowRoot?: ShadowRoot | null }).shadowRoot
      if (root) {
        const inner = root.querySelector<HTMLElement>('textarea, input, [contenteditable="true"]')
        if (inner) return inner
      }
      const inner = el.querySelector<HTMLElement>('textarea, input, [contenteditable="true"]')
      if (inner) return inner
    } catch {
      /* ignore */
    }
    return null
  }

  function getComposeText(el: HTMLElement | null): string {
    if (!el) return ''
    const t = findInnerInput(el) || el
    if (t.tagName === 'TEXTAREA' || t.tagName === 'INPUT') {
      return ((t as HTMLTextAreaElement).value || '').trim()
    }
    if (t.isContentEditable) return (t.textContent || t.innerText || '').trim()
    // 自定义组件可能直接暴露 value
    const v = (el as unknown as { value?: string }).value
    if (typeof v === 'string') return v.trim()
    return (el.textContent || el.innerText || '').trim()
  }

  function setComposeText(el: HTMLElement, text: string): boolean {
    if (!el) return false
    try {
      const t = findInnerInput(el) || el
      if (t.tagName === 'TEXTAREA' || t.tagName === 'INPUT') {
        const proto = t.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype
        const nativeSet = Object.getOwnPropertyDescriptor(proto, 'value')
        if (nativeSet && nativeSet.set) nativeSet.set.call(t, text)
        else (t as HTMLTextAreaElement).value = text
        t.dispatchEvent(new Event('input', { bubbles: true, composed: true }))
        t.dispatchEvent(new Event('change', { bubbles: true, composed: true }))
      } else {
        t.focus()
        document.execCommand('selectAll', false)
        document.execCommand('delete', false)
        document.execCommand('insertText', false, text)
        if (getComposeText(el) !== text) {
          if (t.tagName === 'TEXTAREA' || t.tagName === 'INPUT') {
            (t as HTMLTextAreaElement).value = text
          } else {
            t.textContent = text
          }
          t.dispatchEvent(new Event('input', { bubbles: true, composed: true }))
        }
      }
      return true
    } catch {
      return false
    }
  }

  let mtSendTranslating = false
  let mtSendConfirming = false
  let mtOriginalText = ''
  // 上一次写入输入框的译文。用于判断确认态是否仍然有效：用户在该输入框里
  // 删改内容（例如删掉译文重新输入中文）后，输入框内容不再等于译文，
  // 说明旧确认态已作废，应按新内容重新翻译，而不是误判为"确认发送"。
  let mtTranslatedText = ''

  // LINE 是 SPA，切换聊天/重建界面时输入框 DOM 会被替换。
  // 因此不把 keydown 绑到具体元素上，而是用 document 捕获委托，
  // 每次按键时实时查找“当前可见、正在聚焦的聊天输入框”，
  // 元素重建也不影响拦截。
  function findComposeBox(): HTMLElement | null {
    // LINE 桌面版输入框是自定义组件 <textarea-ex>（标签 TEXTAREA-EX）
    const selectors = [
      'textarea-ex',
      'textarea',
      '[contenteditable="true"][role="textbox"]',
      '.MdArea [contenteditable="true"]',
      '[data-testid="md_input"]',
      '[data-testid="chat-input"]',
      'div[contenteditable="true"]',
    ]
    for (const sel of selectors) {
      const els = document.querySelectorAll<HTMLElement>(sel)
      for (const el of Array.from(els)) {
        if (el.offsetWidth < 20 || el.offsetHeight < 10) continue
        if (el.offsetParent === null && el.getClientRects().length === 0) continue
        return el
      }
    }
    return null
  }

  // 判断按键是否发生在聊天输入框内：直接用 document.activeElement。
  // LINE 的聊天输入框是 <textarea>（chatroomEditor-module__textarea__*），
  // 用户正在打字时焦点必然在该输入框上，元素是否重建都无关紧要。
  function isEventInComposeBox(e: KeyboardEvent): HTMLElement | null {
    const dbgDetail = (why: string): null => {
      try {
        const el = e.target as HTMLElement | null
        const ae = document.activeElement as HTMLElement | null
        const info = (x: HTMLElement | null): string => {
          if (!x) return 'null'
          let r = 0
          try {
            r = x.getClientRects().length
          } catch {
            /* ignore */
          }
          return (
            x.tagName +
            ' ow=' + x.offsetWidth +
            ' oh=' + x.offsetHeight +
            ' op=' + (x.offsetParent ? x.offsetParent.tagName : 'null') +
            ' rects=' + r +
            ' class=' + String((x.className || '').toString()).slice(0, 50)
          )
        }
        dbg('BOX-REJECT ' + why + ' TARGET[' + info(el) + '] ACTIVE[' + info(ae) + ']')
      } catch {
        /* ignore */
      }
      return null
    }
    // 键盘事件目标本身也可能是输入框
    let box = e.target as HTMLElement | null
    if (box && box !== document.activeElement && document.activeElement && document.activeElement !== document.body) {
      box = document.activeElement as HTMLElement
    }
    if (!box || typeof box.tagName !== 'string') return dbgDetail('no-target')

    // 只接受真正可输入的控件 / 可编辑区域
    const tag = box.tagName.toUpperCase()
    const isInputEl =
      tag === 'TEXTAREA' ||
      tag === 'INPUT' ||
      // LINE 桌面版输入框是自定义组件 <textarea-ex>，标签名以 TEXTAREA- 开头
      tag.startsWith('TEXTAREA') ||
      tag.startsWith('INPUT') ||
      box.isContentEditable ||
      (box.getAttribute && box.getAttribute('contenteditable') === 'true')
    if (!isInputEl) {
      // target 可能是输入框内部的子节点（contenteditable 场景）
      if (box.closest) {
        const anc = box.closest<HTMLElement>(
          'textarea, input, [contenteditable="true"], [role="textbox"], textarea-ex, [class*="textarea"]'
        )
        if (anc) box = anc
        else return dbgDetail('no-ancestor')
      } else {
        return dbgDetail('no-closest')
      }
    }
    // 排除隐藏元素 / 不可见元素（防止匹配到隐藏的搜索框或影子输入框）
    if (box.offsetWidth < 20 && box.getClientRects().length === 0) return dbgDetail('hidden')
    if (box.offsetParent === null && box.getClientRects().length === 0) return dbgDetail('no-layout')
    try {
      if ((e as KeyboardEvent).key === 'Enter') {
        const inner = findInnerInput(box)
        dbg(
          'BOX-OK tag=' + box.tagName +
          ' inner=' + (inner ? inner.tagName : 'none') +
          ' text=' + JSON.stringify(getComposeText(box)).slice(0, 60) +
          ' class=' + String((box.className || '').toString()).slice(0, 40)
        )
      }
    } catch {
      /* ignore */
    }
    return box
  }

  function setupSendTranslation(): void {
    // ── Esc 恢复原文必须在最外层拦截 ──
    // LINE 页面自己也监听 Esc（返回"开始新对话"页）。在 document 捕获阶段
    // 拦截已不够：LINE 的监听可能注册在 window 捕获或 document 捕获的更早
    // 位置，甚至走 keyup。因此在 window 捕获阶段（事件最先到达）拦截并阻止
    // 传播，同时在 keyup 阶段短暂抑制，避免 LINE 的快捷键库在 keyup 响应。
    let mtEscHandledAt = 0
    const escActive = (): boolean => mtSendConfirming || Date.now() - mtEscHandledAt < 1500
    const killEvent = (e: KeyboardEvent): void => {
      try {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
      } catch {
        /* ignore */
      }
    }
    const handleEsc = (e: KeyboardEvent): boolean => {
      if (e.key !== 'Escape') return false
      if (mtSendConfirming) {
        dbg('ESC-restore in=' + (e.target as HTMLElement).tagName)
        killEvent(e)
        const box = isEventInComposeBox(e)
        if (box) setComposeText(box, mtOriginalText)
        mtSendConfirming = false
        mtOriginalText = ''
        mtTranslatedText = ''
        mtEscHandledAt = Date.now()
        showToast('已恢复原文')
        return true
      }
      // 刚处理过确认态恢复，紧接着的 keyup 也必须吞掉，防止 LINE 快捷键响应
      if (Date.now() - mtEscHandledAt < 1500 && e.type === 'keyup') {
        killEvent(e)
        return true
      }
      return false
    }
    window.addEventListener('keydown', (e: KeyboardEvent) => handleEsc(e), true)
    window.addEventListener('keyup', (e: KeyboardEvent) => handleEsc(e), true)

    document.addEventListener(
      'keydown',
      (e: KeyboardEvent) => {
        try {
          if (e.key === 'Enter') {
            dbg('KEYDOWN-Enter composing=' + e.isComposing + ' code=' + e.keyCode + ' target=' + (e.target as HTMLElement).tagName + '.' + String((e.target as HTMLElement).className || '').toString().slice(0, 40))
          }
        } catch {
          /* ignore */
        }
        // 翻译进行中：拦截 Enter，防止重复触发
        if (mtSendTranslating) {
          if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
            killEvent(e)
          }
          return
        }
        // Esc（兜底：若 window 层未拦截到）
        if (e.key === 'Escape' && handleEsc(e)) return
        const box = isEventInComposeBox(e)
        if (!box) {
          try {
            if (e.key === 'Enter') dbg('KEYDOWN-Enter box=null')
          } catch {
            /* ignore */
          }
          return
        }

        if (e.key !== 'Enter' || e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) return
        if (e.isComposing || e.keyCode === 229) return

        const text = getComposeText(box)

        // 已在确认态：用户再次按 Enter = 确认发送当前内容（译文），
        // 必须放行给 LINE 并清除确认态，否则状态残留会导致下一次
        // 中文回车被误判为"确认发送"而直接发出原文。
        if (mtSendConfirming) {
          // 但只有在输入框内容仍等于我们写入的译文时才算"确认发送"。
          // 若用户已删改输入框（如删掉译文重新输入中文），旧确认态作废，
          // 继续往下走按新内容翻译，避免中文被直接发出。
          const stillTranslated = !!text && text === mtTranslatedText
          dbg('ENTER-while-confirming same=' + stillTranslated + ' text=' + JSON.stringify(text).slice(0, 60))
          mtSendConfirming = false
          mtOriginalText = ''
          mtTranslatedText = ''
          if (stillTranslated) return
        }

        if (!text || !isChinese(text)) return

        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
        mtSendTranslating = true
        showToast('翻译中...', 8000)
        translateViaLocalServer(text, 'en')
          .then((result) => {
            mtSendTranslating = false
            if (result.success && result.translated) {
              mtOriginalText = text
              setComposeText(box, result.translated)
              mtTranslatedText = result.translated
              mtSendConfirming = true
              showToast('已翻译为英文，再按 Enter 发送（Esc 恢复原文）')
            } else {
              showToast('翻译失败: ' + (result.error || '未知错误'))
            }
          })
          .catch((err: Error) => {
            mtSendTranslating = false
            showToast('翻译失败: ' + err.message)
          })
      },
      true
    )
    // 只有当焦点真正离开输入框（切聊天/点其他区域）时清掉旧的确认态，
    // 避免消息流刷新等 DOM 变化误清状态导致 Esc 无法恢复原文。
    const resetObserver = new MutationObserver(() => {
      try {
        const ae = document.activeElement as HTMLElement | null
        const aeTag = ae ? ae.tagName.toUpperCase() : ''
        const aeIsCompose =
          !!ae &&
          (aeTag === 'TEXTAREA' ||
            aeTag === 'INPUT' ||
            aeTag.startsWith('TEXTAREA') ||
            aeTag.startsWith('INPUT') ||
            ae.isContentEditable)
        if (!aeIsCompose) {
          mtSendConfirming = false
          mtOriginalText = ''
          mtTranslatedText = ''
          mtSendTranslating = false
        }
      } catch {
        /* ignore */
      }
    })
    resetObserver.observe(document.body, { childList: true, subtree: true })
  }

  // ── 消息翻译：在每条消息下追加译文 ──
  const TRANSLATE_QUEUE: { el: HTMLElement; text: string }[] = []
  let translating = false

  function getMessageTextEl(msgEl: HTMLElement): HTMLElement | null {
    return msgEl.querySelector('[data-testid="message-text"], [class*="message-text"], [class*="MessageText"], [dir="auto"]')
  }

  function getMessageRawText(msgEl: HTMLElement): string {
    const el = getMessageTextEl(msgEl)
    return el ? (el.textContent || '').trim() : ''
  }

  function addTranslationBadge(msgEl: HTMLElement, translatedText: string): void {
    if (!msgEl || !translatedText) return
    if (msgEl.querySelector('.mt-line-badge')) return
    const textEl = getMessageTextEl(msgEl)
    const parent = textEl ? textEl.parentElement : msgEl
    if (!parent) return
    const badge = document.createElement('div')
    badge.className = 'mt-line-badge'
    // 译文颜色/字号/字体读取宿主注入的样式配置（window.__mtBadgeStyle，与主界面"译文显示设置"一致）
    const st = (window as unknown as { __mtBadgeStyle?: { color: string; bg: string; fontSize: number; fontFamily: string } }).__mtBadgeStyle || {
      color: '#c62828',
      bg: '',
      fontSize: 13,
      fontFamily: '',
    }
    const family = st.fontFamily ? 'font-family:' + st.fontFamily + ';' : ''
    // 译文必须独占一行、不与原消息同行：块级 + 撑满整行；若父容器是横向 flex 则用
    // flex-basis 100% 强制折到新行。
    const common =
      'display:block;width:100%;box-sizing:border-box;clear:both;flex-basis:100%;font-size:' +
      st.fontSize +
      'px;color:' +
      st.color +
      ';' +
      family +
      'line-height:1.45;word-break:break-word;user-select:text;white-space:pre-wrap;'
    // 与主界面"译文显示设置"一致：设置了背景色则以徽章卡片形式呈现，否则用浅色分隔线
    badge.style.cssText = st.bg
      ? common +
        'background:' +
        st.bg +
        ';border-radius:6px;padding:4px 8px;margin:4px 0;box-shadow:0 1px 2px rgba(0,0,0,0.06);'
      : common + 'margin-top:4px;padding:2px 0;border-top:1px solid rgba(0,0,0,0.08);'
    badge.textContent = translatedText
    const copyBtn = document.createElement('span')
    copyBtn.textContent = ' \u29C9'
    copyBtn.title = '复制翻译'
    copyBtn.style.cssText = 'cursor:pointer;color:#999;font-size:11px;margin-left:4px;'
    copyBtn.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      try {
        navigator.clipboard.writeText(translatedText)
        showToast('已复制')
      } catch {
        /* ignore */
      }
    })
    badge.appendChild(copyBtn)
    if (textEl && textEl.nextSibling) parent.insertBefore(badge, textEl.nextSibling)
    else parent.appendChild(badge)
    msgEl.setAttribute('data-mt-translated', '1')
  }

  async function processTranslateQueue(): Promise<void> {
    if (translating || TRANSLATE_QUEUE.length === 0) return
    translating = true
    while (TRANSLATE_QUEUE.length > 0) {
      const item = TRANSLATE_QUEUE.shift()
      if (!item) continue
      try {
        if (item.el.getAttribute('data-mt-translated') === '1') continue
        if (item.el.querySelector('.mt-line-badge')) {
          item.el.setAttribute('data-mt-translated', '1')
          continue
        }
        const result = await translateViaLocalServer(item.text, 'zh-CN')
        if (result && result.success && result.translated) {
          addTranslationBadge(item.el, result.translated)
        }
      } catch {
        /* skip */
      }
      await new Promise((r) => setTimeout(r, 200))
    }
    translating = false
  }

  function scanMessagesForTranslation(): void {
    try {
      // LINE 文本消息用 CSS modules 哈希类（如 textMessageContent-module__text__EFwEN），
      // 块名前缀稳定：匹配叶子文本元素 __text__，并兜底常见 message-text / testid。
      const msgs = document.querySelectorAll<HTMLElement>(
        '[class*="textMessageContent-module__text"], [class*="MessageBody-module"], [data-testid*="message-text"], [class*="message-text"], [class*="MessageText"]'
      )
      // 诊断：无条件输出扫描结果。found=0 时额外列出文档里疑似消息元素的 class/testid 样本，便于定位 LINE 真实消息 DOM。
      if (msgs.length === 0) {
        const cands: string[] = []
        const roots: Array<Element | Document> = [document]
        try {
          for (const fr of Array.from(document.querySelectorAll('iframe'))) {
            const d = (fr as HTMLIFrameElement).contentDocument
            if (d && d.body) roots.push(d.body)
          }
        } catch {
          /* ignore cross-origin */
        }
        for (const r of roots) {
          for (const el of Array.from((r as Document).querySelectorAll ? (r as Element).querySelectorAll('[class*="message" i], [class*="Message"], [data-testid*="message" i]') : []).slice(0, 8)) {
            const c = String(el.className || el.getAttribute('data-testid') || '').toString().slice(0, 60)
            if (!cands.includes(c)) cands.push(c)
          }
        }
        dbg('SCAN found=0 candidates=[' + cands.join(' | ') + '] frames=' + document.querySelectorAll('iframe').length)
      } else {
        const s = Array.from(msgs).slice(0, 3).map((m) => String(m.className || m.getAttribute('data-testid') || '').toString().slice(0, 50)).join(' | ')
        dbg('SCAN found=' + msgs.length + ' sample=[' + s + ']')
      }
      for (const el of Array.from(msgs)) {
        if (el.getAttribute('data-mt-translated') === '1') continue
        if (el.closest('.mt-line-badge')) continue
        const text = (el.textContent || '').trim()
        if (!text || text.length < 2) continue
        // 跳过已是中文为主的消息
        if (isChinese(text)) {
          const cn = (text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length
          if (cn / text.length > 0.3) {
            el.setAttribute('data-mt-translated', '1')
            continue
          }
        }
        const msgEl = el.closest<HTMLElement>('[data-testid*="message"], [class*="message"], [class*="Message"]') || el
        TRANSLATE_QUEUE.push({ el: msgEl, text })
      }
      void processTranslateQueue()
    } catch {
      /* ignore */
    }
  }

  function setupAutoTranslation(): void {
    scanMessagesForTranslation()
    const debounce = (window as unknown as { __mtScan?: number })
    const observer = new MutationObserver(() => {
      clearTimeout(debounce.__mtScan)
      debounce.__mtScan = window.setTimeout(scanMessagesForTranslation, 800)
    })
    observer.observe(document.body, { childList: true, subtree: true })
    setInterval(scanMessagesForTranslation, 5000)
  }

  // ── 未读统计（聊天列表徽标）──
  function computeUnread(): void {
    try {
      let total = 0
      // LINE 扩展聊天列表未读徽标（待登录后校验补充选择器）
      const selectors = [
        '[data-testid="badge-unread"]',
        '[class*="badge"] [class*="unread"]',
        '[class*="UnreadBadge"]',
      ]
      const badges = document.querySelectorAll(selectors.join(','))
      for (const b of Array.from(badges)) {
        const el = b as HTMLElement
        if (!el.offsetParent && el.offsetWidth === 0 && el.offsetHeight === 0) continue
        const rect = el.getBoundingClientRect()
        if (rect.width === 0 || rect.height === 0) continue
        const t = (el.textContent || '').replace(/[^0-9]/g, '')
        total += t ? Number(t) : 1
      }
      ;(window as unknown as { __mtUnreadCount: number }).__mtUnreadCount = total
    } catch {
      /* ignore */
    }
  }

  function start(): void {
    if (!document.body) {
      setTimeout(start, 300)
      return
    }
    try {
      dbg('INJECTED-v18-confirmReset url=' + location.href + ' frames=' + window.frames.length)
      dbg('editable-inputs=' + document.querySelectorAll('[contenteditable="true"]').length + ' textareas=' + document.querySelectorAll('textarea').length)
      dbg('focus-target body? ' + (document.activeElement === document.body))
    } catch {
      /* ignore */
    }
    ;(window as unknown as { __mtUnreadCount: number }).__mtUnreadCount = 0
    computeUnread()
    setInterval(computeUnread, 2000)
    setupSendTranslation()
    setupAutoTranslation()
  }

  // 全局观察：LINE 在 iframe 里的话顶层 document 收不到按键
  const observeIframes = (): void => {
    try {
      document.addEventListener(
        'focusin',
        () => {
          const ae = document.activeElement
          if (!ae) return
          dbg('FOCUSIN ' + ae.tagName + '.' + String((ae.className || '').toString()).slice(0, 40) + ' editable=' + (ae as HTMLElement).isContentEditable)
        },
        true
      )
    } catch {
      /* ignore */
    }
  }
  observeIframes()
  start()
}.toString() + ')();'

/**
 * 给 LINE 扩展页 webContents 注入 CLEANUP_JS（发送翻译 / 消息翻译 / 未读统计），
 * 并轮询 window.__mtUnreadCount。
 * - 独立子进程模式：未读默认写 stdout [MT-UNREAD] 供 line-manager 解析
 * - 宿主内嵌模式（line-view）：传 onUnread 回调 + forcePoll 直收未读
 */
/**
 * 生成把主界面"译文显示设置"写入 LINE 页面全局 __mtBadgeStyle 的 JS 片段。
 * addTranslationBadge 从该全局取色，使 LINE 译文颜色与设置保持一致。
 */
export function badgeStyleCode(): string {
  try {
    const s = store.getSettings()
    return (
      'window.__mtBadgeStyle=' +
      JSON.stringify({
        color: s.badgeColor || '#c62828',
        bg: s.badgeBgColor || '',
        fontSize: s.fontSize || 13,
        fontFamily: s.fontFamily || '',
      }) +
      ';'
    )
  } catch {
    return ''
  }
}

export function attachLinePage(wc: WebContents, opts?: { onUnread?: (n: number) => void; forcePoll?: boolean }): void {
  const inject = (): void => {
    if (wc.isDestroyed()) return
    const styleCode = badgeStyleCode()
    if (styleCode) wc.executeJavaScript(styleCode).catch(() => {})
    wc.executeJavaScript(CLEANUP_JS).catch(() => {})
  }
  wc.on('dom-ready', inject)

  let lastReported = -1
  let poll: ReturnType<typeof setInterval> | null = null
  try {
    if (opts?.forcePoll || (wc.getType && wc.getType() === 'window')) {
      poll = setInterval(() => {
        if (wc.isDestroyed()) {
          if (poll) clearInterval(poll)
          return
        }
        wc
          .executeJavaScript('window.__mtUnreadCount||0', true)
          .then((count: unknown) => {
            const n = Number(count) || 0
            if (n === lastReported) return
            lastReported = n
            if (opts?.onUnread) opts.onUnread(n)
            else if (process.argv.includes('--standalone')) {
              try {
                process.stdout.write('\n[MT-UNREAD] ' + n + '\n')
              } catch {
                /* ignore */
              }
            }
          })
          .catch(() => {})
      }, 2500)
      wc.on('destroyed', () => {
        if (poll) clearInterval(poll)
      })
    }
  } catch {
    /* ignore */
  }
}

// 独立子进程模式：对自身创建的窗口注入；宿主内嵌模式由 line-view 显式调用
if (process.argv.includes('--standalone')) {
  app.on('web-contents-created', (_e, wc) => {
    attachLinePage(wc)
  })
}
