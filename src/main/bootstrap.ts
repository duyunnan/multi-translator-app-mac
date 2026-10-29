// 入口调度：
//   argv 含 line-mode.js（line-manager 以 <exe> <line-mode.js> 拉起子进程）
//     → LINE 子进程（line-mode.js）
//   --signal-mode → 以内置 Signal 桌面版启动（signal-mode.js）
//   否则          → 翻译器主程序（app.js）
// 使用运行时 require（非字面量路径）避免打包期静态解析，保证各入口各自独立。
import { join } from 'path'
import { app } from 'electron'
import { desktopChromeUA } from './services/user-agent'

// ★★ 全局默认 UA 兜底：去掉 Electron / 应用名 标识。
// Chromium 默认 UA 会拼成「… 财运亨通翻译器/1.0.2 Chrome/… Electron/35.7.5 Safari/537.36」，
// 而 worker（Messenger E2EE 的 SharedWorker 等）与 WebSocket 握手既不继承 webview 的
// useragent 属性，也不经过 webRequest.onBeforeSendHeaders，只能吃这个默认值。FB 实时通道
// （wss://web-chat-e2ee.facebook.com/ws/chat、wss://edge-chat.messenger.com/chat）对带
// Electron 标识的 UA 一律返回 HTTP 400，导致 E2EE 加密备份 PIN 还原永久卡在
// 「正在验证你的 PIN 码」。这里固定为纯净桌面 Chrome UA，保证任何来源的请求都不带 Electron 标识。
try {
  // 跟随真实平台：mac 上报 Windows NT 会与 navigator.platform / Sec-CH-UA 冲突，
  // 同样是 FB 风控眼中的「可疑环境」信号
  app.userAgentFallback = desktopChromeUA()
} catch {
  /* ignore */
}

// line-manager spawn 时 argv[1] 为 line-mode.js 绝对路径
// （prod: <resources>/line-runtime/line-mode.js；dev: <项目>/out/main/line-mode.js）
const isLineMode = process.argv.some((a) => /line-mode\.js$/i.test(a))
const isMessengerMode = process.argv.includes('--messenger-mode')
const entry = isLineMode
  ? './line-mode.js'
  : isMessengerMode
    ? './messenger-mode.js'
    : process.argv.includes('--signal-mode')
      ? './signal-mode.js'
      : './app.js'
require(join(__dirname, entry))
