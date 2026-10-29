/**
 * webview 账号会话级配置。
 *
 * 核心：强制给 messenger/facebook 域的请求使用**纯净桌面 Chrome UA**。
 * 实测若请求仍带 Electron/中文 app 名（如 "财运亨通翻译器/1.0.0 Electron/35.7.5"），
 * Facebook 服务器会判定为不支持环境，对其 worker/脚本请求返回 HTTP 400，导致
 * Messenger 一直"加载中"、无法收发（日志报 "Failed to fetch a worker script"、
 * "A bad HTTP response code (400)..."）。
 *
 * 同时补 fb 域 Accept-Language 与权限全放行。仅对该账号自己的 partition 生效。
 * 注意：不再做 CSP/trusted-types 放宽（实测会干扰 FB 登录/验证页脚本，详见 prepareMessengerSession）。
 * Messenger 的英文 userData 由主进程 app.ts 启动时固定，使 FB 重度依赖的 File System/SW 存储正常。
 */
import { session } from 'electron'
import { logDebug } from './debug-log'
import { desktopChromeUA } from './user-agent'

/** 会话配置诊断日志：统一走缓冲异步日志（打包后终端不可见，便于线上排查） */
function slog(line: string): void {
  logDebug(line)
}

function isFacebookHost(url: string): boolean {
  return /messenger\.com|facebook\.com|fbcdn\.net|m\.me|fb\.me|facebook\.net/i.test(url)
}

/**
 * Messenger UA：纯净桌面 Chrome UA（无 Electron、无应用名）。
 * 对齐鑫五洋（能正常登录+收发）的做法：FB/Messenger 会把带 Electron/应用名标识的 UA 当
 * 可疑环境，拒绝其长连接/媒体，表现为"能登录但消息一直加载中、SSL 握手失败"。纯净
 * Chrome UA 则被 FB 认作正常桌面浏览器。
 *
 * ★ 注意：只靠 <webview useragent> 属性 / onBeforeSendHeaders 是**不够**的——
 * worker（Messenger E2EE 的 MAWMainV4WebWorkerBundle 等）与 WebSocket 握手既不继承
 * webview 的 useragent 属性，也不经过 webRequest.onBeforeSendHeaders，会退回 Chromium
 * 默认 UA（含「财运亨通翻译器/1.0.2 ... Electron/35.7.5」）。FB 实时通道对带 Electron
 * 标识的 UA 直接返回 HTTP 400：
 *   wss://web-chat-e2ee.facebook.com/ws/chat            → 400
 *   wss://edge-chat.messenger.com/chat?region=hil&sid=… → 400
 * 实时通道连不上 → E2EE 加密备份 PIN 还原永远停在「正在验证你的 PIN 码」。
 * 因此这里额外在 session 级调用 setUserAgent（见 prepareMessengerSession），
 * 并在 bootstrap 里设置 app.userAgentFallback 兜底。
 */
function messengerUA(): string {
  return desktopChromeUA()
}

const prepared = new Set<string>()

/** 为指定 partition 的会话挂载 messenger/facebook 兼容配置，应在该 partition 导航前调用 */
export function prepareMessengerSession(partition: string): void {
  if (!partition || prepared.has(partition)) return
  try {
    const ses = session.fromPartition(partition)
    const ua = messengerUA()

    // ★★ 关键修复（PIN 验证永久卡住的根因）：把纯净 UA 落到 **session 级**。
    // Chromium 里 worker（FB E2EE 的 SharedWorker MAWMainV4WebWorkerBundle）与 WebSocket
    // 握手取的是 session 默认 UA，不受 <webview useragent> 属性影响、也不经过
    // onBeforeSendHeaders；不设就退回 Electron 默认 UA（含应用名 + Electron/35.7.5），
    // FB 的实时通道会以 HTTP 400 拒绝握手，E2EE 加密备份 PIN 还原因此永久卡在
    // 「正在验证你的 PIN 码」。
    ses.setUserAgent(ua, 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7')

    // messenger/facebook 请求 UA 统一为纯净桌面 Chrome（对齐鑫五洋，见 messengerUA），并补 Accept-Language。
    ses.webRequest.onBeforeSendHeaders((details, callback) => {
      if (isFacebookHost(details.url || '')) {
        details.requestHeaders['User-Agent'] = ua
        details.requestHeaders['Accept-Language'] = 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7'
      }
      callback({ requestHeaders: details.requestHeaders })
    })

    // 对齐鑫五洋：对 messenger.com/facebook.com/fbcdn.net 删除 FB 强制的 Trusted-Types/相关 CSP 响应头。
    // FB 若不删，会因我们注入的脚本触发 CSP 违规而阻断页面自身脚本 → 消息一直加载/白屏/发不出。
    if (!(ses as unknown as { __mtCspReady?: boolean }).__mtCspReady) {
      ;(ses as unknown as { __mtCspReady?: boolean }).__mtCspReady = true
      ses.webRequest.onHeadersReceived((details, callback) => {
        try {
          if (isFacebookHost(details.url || '')) {
            const headers = details.responseHeaders || {}
            for (const key of Object.keys(headers)) {
              const lk = key.toLowerCase()
              if (
                lk === 'content-security-policy' ||
                lk === 'content-security-policy-report-only' ||
                lk === 'x-frame-options' ||
                lk === 'require-trusted-types-for'
              ) {
                delete headers[key]
              }
            }
            callback({ responseHeaders: headers })
            return
          }
        } catch (e) {
          /* 落空则放行 */
        }
        callback({})
      })
    }

    ses.setPermissionRequestHandler((_wc, _permission, cb) => cb(true))
    ses.setPermissionCheckHandler(() => true)

    // 注：不对 messenger session 强设 SOCKS5 代理（对齐鑫五洋——它不给 messenger webview 设 SK5，
    // messenger 走 Chromium 默认/系统代理即可连通；强设 socks5 反而可能让部分 TLS 握手失败 -100）。

    prepared.add(partition)
    slog(`[webview-session] messenger-compat(clean UA + CSP relax) prepared partition=${partition} ua="${ua}"`)
  } catch (e) {
    slog('[webview-session] prepare failed: ' + String(e))
  }
}
