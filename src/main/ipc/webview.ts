/**
 * WebView 注入配置 IPC
 */
import { BrowserWindow, ipcMain, shell, webContents } from 'electron'
import { join } from 'path'
import { IPC, type Platform, type WebviewActivity, type WebviewConfig, type WebviewUnread } from '../../shared/types'
import { store } from '../services/store'
import { updateAccountStatus } from '../services/account-manager'
import { prepareMessengerSession } from '../services/webview-session'
import { desktopChromeUA } from '../services/user-agent'

export function registerWebviewIpc(): void {
  ipcMain.handle(IPC.OpenExternal, async (_e, url: string) => {
    if (typeof url === 'string' && /^https?:\/\//i.test(url)) {
      await shell.openExternal(url)
    }
  })

  // webview 注入脚本定期统计未读数后上报，转发给主窗口渲染层显示账号角标
  ipcMain.on('mt-unread', (e, payload: WebviewUnread) => {
    if (!payload || typeof payload.accountId !== 'string' || !Number.isFinite(payload.unread)) return
    // webview 是 guest WebContents，e.sender 无法直接定位宿主窗口，广播到所有主窗口
    BrowserWindow.getAllWindows().forEach((w) => {
      // 删除账号/关窗瞬间窗口可能已销毁：向已销毁的 webContents send 会抛异常，
      // 而 IPC 回调里抛出的未捕获异常会直接带走整个主进程（表现为闪退）
      if (w.isDestroyed() || w.webContents.isDestroyed()) return
      w.webContents.send(IPC.WebviewUnreadPush, { accountId: payload.accountId, unread: Math.max(0, Math.floor(payload.unread)) })
    })
  })

  // webview 注入脚本检测到入站消息后上报最后消息时间，转发给主窗口渲染层显示"X分钟前收到消息"
  ipcMain.on('mt-activity', (e, payload: WebviewActivity) => {
    if (!payload || typeof payload.accountId !== 'string' || !Number.isFinite(payload.lastMessageTime)) return
    const t = Math.floor(payload.lastMessageTime)
    // 持久化最后消息时间：重启后账号卡片仍能显示"X分钟前收到消息"（注入脚本上报有 30s 节流，不会频繁写盘）
    const acc = store.getAccounts().find((a) => a.id === payload.accountId)
    if (acc && acc.lastMessageTime !== t) {
      updateAccountStatus(payload.accountId, { lastMessageTime: t })
    }
    BrowserWindow.getAllWindows().forEach((w) => {
      // 同上：已销毁窗口直接跳过，避免删除账号/关窗瞬间抛异常
      if (w.isDestroyed() || w.webContents.isDestroyed()) return
      w.webContents.send(IPC.WebviewActivityPush, { accountId: payload.accountId, lastMessageTime: t })
    })
  })

  // 动态开关某个 guest 的后台节流（多开不卡死的关键）：
  // 激活账号关节流（消息/角标实时），后台账号开节流（Chromium 降频其定时器与 rAF，省 CPU）。
  // 此前所有 webview 写死 backgroundThrottling=no，后台账号同样满速跑 DOM 扫描/轮询，
  // 多开几个账号就把 CPU 打满 —— 这是界面卡死的主要来源之一。
  ipcMain.handle(IPC.WebviewSetThrottle, (_e, webContentsId: number, throttle: boolean) => {
    const id = Number(webContentsId)
    if (!id) return { ok: false }
    try {
      const wc = webContents.fromId(id)
      if (wc && !wc.isDestroyed() && typeof wc.setBackgroundThrottling === 'function') {
        wc.setBackgroundThrottling(Boolean(throttle))
        return { ok: true }
      }
    } catch {
      /* guest 可能已销毁，忽略即可 */
    }
    return { ok: false }
  })

  ipcMain.handle(IPC.WebviewGetConfig, (_e, platform: Platform, accountId?: string): WebviewConfig => {
    const s = store.getSettings()
    // Messenger：必须在导航开始前对该账号 partition 应用兼容配置（删 CSP / 放行权限 / 纯净 UA）。
    // 注意：调用方此前一直只传 platform，accountId 恒为 undefined，导致这段配置从未生效 ——
    // FB 因而拿不到干净环境（CSP + Electron 标识阻断其 worker/脚本），表现为
    // 「登录后消息一直加载、无法收发」。缺 accountId 时兜底为该平台全部账号预配置，
    // 重复调用由 webview-session 的 prepared 集合去重。
    if (platform === 'messenger') {
      if (typeof accountId === 'string' && accountId) {
        prepareMessengerSession(`persist:${accountId}`)
      } else {
        for (const acc of store.getAccounts()) {
          if (acc.platform === 'messenger') prepareMessengerSession(`persist:${acc.id}`)
        }
      }
    }
    const homeUrl = (() => {
      switch (platform) {
        case 'whatsapp':
          return 'https://web.whatsapp.com/?app_absent=0'
        case 'telegram':
          return 'https://web.telegram.org/k/'
        case 'messenger':
          return 'https://www.messenger.com/'
        default:
          return 'about:blank'
      }
    })()
    // WhatsApp / Telegram / Messenger 统一用纯净桌面 Chrome UA（无 Electron、无应用名）。
    // 对齐鑫五洋：FB/Messenger 会把带 Electron 标识的 UA 当可疑环境，拒绝长连接/媒体，
    // 表现为"能登录但消息一直加载中、SSL 握手失败"；纯净 Chrome UA 则被认作正常浏览器。
    // 保持该调用点历史上锁定的 Chromium 版本，Windows 上输出的字符串一字不变；
    // macOS / Linux 上换成对应平台的 Chrome UA，避免 UA 与 navigator.platform 矛盾
    const userAgent = desktopChromeUA('120.0.0.0')
    return {
      platform,
      homeUrl,
      userAgent,
      preloadPath: join(__dirname, '../preload/webview-preload.js'),
      defaultLang: s.defaultTargetLang,
      sendLang: s.sendTargetLang || 'en',
      autoTranslate: s.autoTranslateEnabled,
      fontSize: s.fontSize,
      badgeColor: s.badgeColor,
      badgeBgColor: s.badgeBgColor,
    }
  })
}
