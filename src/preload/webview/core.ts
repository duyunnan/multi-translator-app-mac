/**
 * WebView 注入核心：消息扫描、翻译徽章、自动翻译、发送翻译、AI 回复、语音翻译。
 */
import { ipcRenderer } from 'electron'
import type { TranslateResult, WebviewConfig } from '../../shared/types'
import { markProcessed } from './platforms'
import type { MessageInfo, PlatformAdapter } from './platforms'
import { IPC_W } from './ipc-constants'
import { arrayBufferToBase64, insertTextAtCursor, needsTranslation, textHash, throttle } from './utils'
import {
  ensureStyle,
  findBadge,
  hasBadge,
  injectBadge,
  positionWaCard,
  refreshSlotBackground,
  removeBadge,
  showLoading,
  updateBadgeStyles,
} from './badge'

const BATCH_INTERVAL = 350

/** 各平台发送按钮选择器（点击发送拦截 + 移除预览框共用）
 * 注意：WhatsApp 新版发送按钮为 button[aria-label="Send"]，图标是 span[data-icon="send"]（非 i 标签），
 * 因此 data-icon 选择器不带标签限定；另补 data-tab="11" / title 等 WhatsApp 特征。
 */
const MT_SEND_BTN_SELECTOR =
  '.composer_send_btn, .composer_btn_send, .btn-send, .btn-primary.btn-send, .send-btn, button.send, ' +
  'button[data-testid="send-button"], button[data-testid="composer-send-button"], button[data-testid="send"], ' +
  'button[aria-label="Send"], button[aria-label="Send message"], button[aria-label="Send message to"], ' +
  'button[aria-label="发送"], button[aria-label="发送消息"], button[aria-label="发送消息给"], ' +
  '[data-icon="send"], [data-icon="Send"], [data-icon="发送"], ' +
  '[data-testid="m-send"], [data-testid="send"], ' +
  'div[role="button"][aria-label="Send"], div[role="button"][aria-label="Send message"], div[role="button"][aria-label="发送"], div[role="button"][aria-label="发送消息"], ' +
  'div[aria-label="Send"], div[aria-label="Send message"], div[aria-label="发送"], div[aria-label="发送消息"], ' +
  '[data-testid="conversation-compose-send-button"], [data-testid="conversation-send-button"], [data-testid="m-send-button"], ' +
  'a[aria-label="Send"], a[aria-label="发送"], a[aria-label="发送消息"], ' +
  'button[data-tab="11"], button[title="Send"], button[title="发送"], ' +
  // Messenger 新版：发送按钮是无文本的 div[role="button"]，只带 aria-label（含 "Enter"）
  'div[role="button"][aria-label*="Enter"], div[role="button"][aria-label*="回车"], ' +
  'div[role="button"][aria-label*="发送"], [aria-label*="Press Enter to send"], [aria-label*="按 Enter 发送"]'

export class Translator {
  private cfg: WebviewConfig
  private adapter: PlatformAdapter
  private translating = new WeakSet<Element>()
  private audioHandled = new WeakSet<Element>()
  private pending: MessageInfo[] = []
  private pumping = false
  private observer: MutationObserver | null = null
  private lastScanZeroDiag = 0
  private lastWaDiag = 0
  /** Messenger 接收扫描 DOM 取证节流（新版 messenger.com 结构变化排查用） */
  private lastMessengerScanDiag = 0
  /** 预览框撑高输入框期间暂存的样式，移除预览时恢复（仅 Telegram 等平台使用） */
  private previewAutoGrow: { el: HTMLElement; prop: 'height' | 'maxHeight' | 'overflowY'; value: string }[] = []
  /** 未读统计定时器 */
  private unreadTimer: ReturnType<typeof setInterval> | null = null
  private lastUnread = -1
  private lastUnreadDiag = 0
  /** 宿主是否已暂停该 guest（切到后台账号 / 窗口最小化）：为 true 时停止翻译扫描 */
  private hostPaused = false
  /** 暂停期间未读角标轮询的降频时间戳（角标功能保留，仅放慢到 9s） */
  private lastUnreadHostPausedAt = 0
  /** 最后消息时间上报节流（检测到入站消息时，渲染层显示"X分钟前收到消息"） */
  private lastActivityAt = 0
  /**
   * 账号 id（主窗口在 webview src 上附加 __mt_account 参数传入）。
   * SPA 跳转后查询参数可能丢失，用 sessionStorage 记忆（partition 按账号隔离，可靠）。
   */
  private readonly accountId: string = (() => {
    const fromUrl = new URLSearchParams(location.search).get('__mt_account')
    if (fromUrl) {
      try {
        sessionStorage.setItem('mt:account', fromUrl)
      } catch {
        /* ignore */
      }
      return fromUrl
    }
    try {
      return sessionStorage.getItem('mt:account') || ''
    } catch {
      return ''
    }
  })()

  constructor(cfg: WebviewConfig, adapter: PlatformAdapter) {
    this.cfg = cfg
    this.adapter = adapter
  }

  start(): void {
    ensureStyle({ fontSize: this.cfg.fontSize, color: this.cfg.badgeColor, bgColor: this.cfg.badgeBgColor })
    this.startObserver()
    this.startUnreadWatch()
    void this.bootstrap()
    if (this.adapter.platform === 'messenger') this.diagMessengerLogin()
  }

  /**
   * Messenger 登录页诊断：确认注入已生效 + 输入框真实状态。
   * 排查"登录输入框不能输入"时用于区分：页面自身 readonly/遮挡，还是我方拦截器副作用。
   * 仅 messenger 且一次性采样两次（登录表单可能延迟渲染）。
   */
  private diagMessengerLogin(): void {
    if (this.loginDiagDone) return
    this.loginDiagDone = true
    const snap = (): void => {
      const email = document.querySelector<HTMLInputElement>(
        '#email, input[name="email"], input[type="text"].inputtext'
      )
      const cssOf = (el: HTMLElement | null): string => {
        if (!el) return ''
        const s = getComputedStyle(el)
        return `pe=${s.pointerEvents} us=${s.userSelect} dis=${s.display} vis=${s.visibility} op=${s.opacity} z=${s.zIndex}`
      }
      const info: Record<string, unknown> = {
        url: location.href,
        ready: document.readyState,
        iframe: window.self !== window.top,
        loginInput: !!email,
        emailCss: cssOf(email),
        emailRO: email ? email.readOnly : null,
        emailDisabled: email ? email.disabled : null,
        emailTab: email ? email.tabIndex : null,
        emailType: email ? email.type : null,
        inChat: this.messengerInChat(),
        sendEnabled: this.sendTranslationEnabled,
        interceptorAttached: this.sendInterceptorAttached,
      }
      ipcRenderer.send('dbg', 'messenger-login-diag ' + JSON.stringify(info))
    }
    setTimeout(snap, 1500)
    setTimeout(snap, 6000)
  }

  /** 定期统计聊天列表未读数，变化时上报主进程（渲染层在账号卡片右上角显示红色角标） */
  private startUnreadWatch(): void {
    if (this.unreadTimer) return
    const report = (): void => {
      if (!this.adapter.isLoggedIn()) return
      // 宿主已暂停（后台账号 / 窗口最小化）：未读角标仍需更新，因此只降频（3s → 9s）并停掉诊断日志；
      // 翻译类全量扫描则完全停止（见 scheduleScan 守卫），这是多开省 CPU 的关键。
      if (this.hostPaused) {
        if (Date.now() - this.lastUnreadHostPausedAt < 9000) return
        this.lastUnreadHostPausedAt = Date.now()
      }
      const n = this.adapter.scanUnread()
      if (!this.hostPaused && this.adapter.platform === 'telegram') {
        // 诊断：输出 Telegram 未读角标扫描情况，便于定位 DOM 结构差异
        const now = Date.now()
        if (now - this.lastUnreadDiag > 10000) {
          this.lastUnreadDiag = now
          const info = {
            chatList: !!document.querySelector('.chat-list'),
            chatBadge: document.querySelectorAll('.chat-list .chat-badge').length,
            dialogs: !!document.querySelector('.dialogs'),
            dialogsBadge: document.querySelectorAll('.dialogs .badge').length,
          }
          ipcRenderer.send('dbg', `tg-unread n=${n} ${JSON.stringify(info)}`)
        }
      }
      if (n !== this.lastUnread) {
        this.lastUnread = n
        ipcRenderer.send(IPC_W.UnreadReport, { accountId: this.accountId, unread: n })
      }
    }
    // 启动先报一次，之后每 3 秒轮询
    report()
    this.unreadTimer = setInterval(report, 3000)
  }

  /** 等待登录后启动扫描（最多 3 分钟，超时后持续观察登录态） */
  private async bootstrap(): Promise<void> {
    const deadline = Date.now() + 3 * 60 * 1000
    while (!this.adapter.isLoggedIn() && Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 2000))
    }
    this.scheduleScan()
    // Messenger：发送翻译拦截器在登录页因未登录被暂缓挂载（见 attachSendInterceptor），
    // 登录成功后在此补挂，确保进入会话页后发送翻译功能可用。
    if (this.sendTranslationEnabled) this.attachSendInterceptor()
    // 登录后若会话尚未打开（扫不到消息），轮询兜底：
    // 一旦用户打开聊天页、消息节点出现，立即扫描并翻译全部可见消息，
    // 不依赖 MutationObserver（虚拟滚动/SPA 路由切换可能漏触发）。
    void this.watchForMessages()
  }

  /**
   * 轮询等待聊天消息出现（打开聊天页的兜底触发）。
   * 检测到消息立即 scheduleScan 翻译后即退出，最多观察 5 分钟。
   */
  private async watchForMessages(timeoutMs = 5 * 60 * 1000): Promise<void> {
    const start = Date.now()
    while (Date.now() - start < timeoutMs) {
      if (this.hostPaused) {
        // 宿主已暂停（后台账号/窗口最小化）：不空转轮询，恢复时由 setHostPaused(false) 补扫
        await new Promise((r) => setTimeout(r, 3000))
        continue
      }
      if (!this.adapter.isLoggedIn()) {
        await new Promise((r) => setTimeout(r, 3000))
        continue
      }
      // 兜底补挂发送翻译拦截器（覆盖 bootstrap 等待超时后用户才登录成功的场景）
      if (this.sendTranslationEnabled) this.attachSendInterceptor()
      if (this.adapter.scanMessages().length > 0) {
        this.scheduleScan()
        return
      }
      await new Promise((r) => setTimeout(r, 2000))
    }
  }

  setAutoTranslate(on: boolean): void {
    this.cfg.autoTranslate = on
    if (on) this.scheduleScan()
  }

  /** 工具栏自动翻译开关：切换状态 + 可选立即翻译全部可见消息 */
  setAutoTranslationEnabled(enabled: boolean, targetLang?: string, translateNow = false): void {
    if (targetLang) this.cfg.defaultLang = targetLang
    this.cfg.autoTranslate = enabled
    if (enabled) {
      this.scheduleScan()
      if (translateNow) void this.translateAllVisible()
    }
  }

  setTargetLang(lang: string): void {
    this.cfg.defaultLang = lang
  }

  /** 忽略自动翻译开关，翻译全部可见消息（工具栏「翻译全部」/ 打开自动翻译时使用） */
  async translateAllVisible(): Promise<void> {
    if (!this.adapter.isLoggedIn()) return
    const msgs = this.adapter.scanMessages()
    for (const m of msgs) {
      if (m.hasAudio) {
        this.attachAudioHandler(m)
        continue
      }
      if (m.text) this.pending.push(m)
    }
    await this.pump()
  }

  updateStyle(fontSize: number, color: string, bgColor: string): void {
    this.cfg.fontSize = fontSize
    this.cfg.badgeColor = color
    this.cfg.badgeBgColor = bgColor
    updateBadgeStyles({ fontSize, color, bgColor })
  }

  /** 设置变更热更新：同步发送翻译语言等运行配置到已打开的聊天页 */
  updateConfig(patch: Partial<WebviewConfig>): void {
    Object.assign(this.cfg, patch)
    if (patch.fontSize !== undefined || patch.badgeColor !== undefined || patch.badgeBgColor !== undefined) {
      updateBadgeStyles({
        fontSize: this.cfg.fontSize,
        color: this.cfg.badgeColor,
        bgColor: this.cfg.badgeBgColor,
      })
    }
  }

  // ---------------- 扫描 ----------------

  private startObserver(): void {
    if (!this.observer) {
      this.observer = new MutationObserver(
        throttle(() => {
          // 宿主已暂停（后台账号 / 窗口最小化）时不扫描
          if (this.hostPaused) return
          this.scheduleScan()
        }, 250),
      )
    }
    this.observeNow()
  }

  /**
   * 挂载 / 重挂 MutationObserver。
   * preload 在 document_start 执行时 body 可能尚未创建，observe(null) 会抛
   * "parameter 1 is not of type 'Node'"，访问器直接失效（消息变化不再触发扫描）。这里兜底到
   * documentElement，并在 body 就绪后再挂一次。
   */
  private observeNow(): void {
    if (!this.observer || this.hostPaused) return
    const attach = (): boolean => {
      const target = document.body || document.documentElement
      if (!target) return false
      this.observer!.observe(target, { childList: true, subtree: true, characterData: true })
      return true
    }
    if (!attach()) document.addEventListener('DOMContentLoaded', () => attach(), { once: true })
  }

  /**
   * 宿主暂停/恢复（切到后台账号、窗口最小化时由渲染层下发 mt-host-pause / mt-soft-wake）。
   * 暂停时断开 MutationObserver，并让所有扫描/轮询直接返回 —— 这是多开时后台账号
   * 不再空转占 CPU 的关键；恢复时重挂观察器并立即补扫一次。
   */
  setHostPaused(paused: boolean): void {
    if (this.hostPaused === paused) return
    this.hostPaused = paused
    if (paused) {
      try {
        this.observer?.disconnect()
      } catch {
        /* ignore */
      }
      return
    }
    // 走 startObserver()（内部会复用已存在的 observer 并重挂），兼容 observer 尚未创建的场景
    this.startObserver()
    this.scheduleScan()
  }

  private scheduleScan(): void {
    if (this.hostPaused) return
    if (!this.adapter.isLoggedIn()) return
    this.cleanupOrphanSlots()
    this.repairSlotBackgrounds()
    this.repairWaPositions()
    const msgs = this.adapter.scanMessages()
    // 上报"最后一条入站消息时间"（渲染层账号卡片显示"X分钟前收到消息"），30s 节流。
    // 优先取消息节点时间（消息即使已被翻译处理过，scanMessages 返回空也能取到）；
    // 解析不出但页面存在入站消息时回退为当前时间，避免"暂无消息"一直不变。
    const now = Date.now()
    if (now - this.lastActivityAt > 30_000) {
      const ts = this.adapter.lastInMessageTime?.()
      const hasIn = ts !== undefined || this.adapter.hasInMessage?.() || msgs.some((m) => m.direction === 'in')
      if (hasIn) {
        this.lastActivityAt = now
        ipcRenderer.send(IPC_W.ActivityReport, { accountId: this.accountId, lastMessageTime: ts ?? now })
      }
    }
    // 仅在确实扫到消息时上报日志（原先每次空扫描都发一条，是 debug.log 涨到 2.6MB 的主因）
    if (msgs.length > 0) {
      ipcRenderer.send('dbg', `scheduleScan found=${msgs.length} auto=${this.cfg.autoTranslate} platform=${this.adapter.platform}`)
    }
    if (this.adapter.platform === 'whatsapp' && msgs.length === 0) {
      // 诊断：为什么扫不到消息（会话未打开 / 类名变化 / iframe / 登录态误判），节流 5s
      const now = Date.now()
      if (!this.lastScanZeroDiag || now - this.lastScanZeroDiag > 5000) {
        this.lastScanZeroDiag = now
        const two = document.querySelector('.two')
        let twoPath = ''
        if (two) {
          const chain: string[] = []
          let p: Element | null = two
          for (let i = 0; i < 5 && p; i++) {
            chain.push(p.tagName + '#' + (p.id || '') + '.' + (p.className || '').toString().slice(0, 30))
            p = p.parentElement
          }
          twoPath = chain.join(' < ')
        }
        const copyableSample = (() => {
          const el = document.querySelector('.copyable-text')
          if (!el) return ''
          const chain: string[] = []
          let p: Element | null = el
          for (let i = 0; i < 7 && p; i++) {
            chain.push(p.tagName + '.' + (typeof p.className === 'string' ? p.className.slice(0, 50) : ''))
            p = p.parentElement
          }
          return chain.join(' < ')
        })()
        const twoEl = document.querySelector('.two')
        ipcRenderer.send(
          'dbg',
          'scan-zero ' +
            JSON.stringify({
              url: location.href.slice(0, 100),
              mainExists: !!document.querySelector('#main'),
              allDataIds: document.querySelectorAll('div[data-id]').length,
              mainDataIds: document.querySelectorAll('#main div[data-id]').length,
              msgRow: document.querySelectorAll('[role="row"], [data-testid="conversation-panel-messages"]').length,
              twoKids: twoEl
                ? Array.from(twoEl.children)
                    .map((c) => c.tagName + '.' + (c.className || '').toString().slice(0, 30))
                    .slice(0, 5)
                    .join('|')
                : '',
              copyableChain: copyableSample,
              messageIn: document.querySelectorAll('div.message-in').length,
              messageOut: document.querySelectorAll('div.message-out').length,
              clsMessage: document.querySelectorAll('[class*="message-in"], [class*="message-out"]').length,
              copyable: document.querySelectorAll('.copyable-text').length,
            })
        )
      }
    }
    if (this.adapter.platform === 'messenger' && msgs.length === 0) {
      // Messenger 接收扫描 DOM 取证（新版 messenger.com 结构变化，扫不到消息时输出真实结构）。
      // 取证是重型全 DOM 遍历，登录后页面加载会话列表期间若频繁执行会与页面争抢主线程，
      // 可能把正常加载拖成"一直加载"。因此：
      // 1) 节流 5s -> 60s；2) 仅当页面已渲染出会话/消息结构（而非仍停在加载占位）时才取证。
      const now = Date.now()
      if (!this.lastMessengerScanDiag || now - this.lastMessengerScanDiag > 60000) {
        const renderedChat =
          document.querySelector(
            '[data-testid*="conversation"], [data-testid*="message"], [data-testid*="compose"], [data-testid*="thread"]'
          ) !== null
        if (renderedChat) {
          this.lastMessengerScanDiag = now
          const countBy = (sel: string) => document.querySelectorAll(sel).length
          const sampleAuto = (() => {
            const els = Array.from(document.querySelectorAll('div[dir="auto"]')).filter(
              (el) => el.textContent && el.textContent.trim().length > 2
            )
            return els.slice(0, 6).map((el) => {
              const chain: string[] = []
              let p: Element | null = el
              for (let i = 0; i < 6 && p; i++) {
                const tid = p.getAttribute('data-testid')
                chain.push(
                  p.tagName +
                    (tid ? `[tid=${tid}]` : '') +
                    (typeof p.className === 'string' && p.className
                      ? '.' + p.className.toString().slice(0, 20)
                      : '')
                )
                p = p.parentElement
              }
              return { t: (el.textContent || '').slice(0, 40), c: chain.join(' < ') }
            })
          })()
          const tidMap = new Map<string, number>()
          document.querySelectorAll('[data-testid]').forEach((el) => {
            const tid = el.getAttribute('data-testid')
            if (tid && /message|msg-|compose|input|chat|thread|conversation/i.test(tid)) {
              tidMap.set(tid, (tidMap.get(tid) || 0) + 1)
            }
          })
          const tidCounts: [string, number][] = []
          tidMap.forEach((n, k) => tidCounts.push([k, n]))
          ipcRenderer.send(
            'dbg',
            'messenger-scan-zero ' +
              JSON.stringify({
                url: location.href.slice(0, 120),
                roleLog: countBy('[role="log"]'),
                mMessage: countBy('[data-testid="m-message"]'),
                own: countBy('[data-testid="m-message-own"]'),
                notOwn: countBy('[data-testid="m-message-not-own"]'),
                ce: countBy('div[contenteditable="true"]'),
                composerTid: countBy('[data-testid="conversation-compose-box-input"]'),
                autoDir: sampleAuto,
                msgTids: tidCounts.slice(0, 25),
              })
          )
        }
      }
    }
    if (msgs.length) {
      ipcRenderer.send(
        'dbg',
        `first msgs: ${msgs.slice(0, 3).map((m) => `[${m.direction}] ${m.text.slice(0, 40)}`).join(' | ')}`
      )
      // WhatsApp：诊断消息行/气泡布局与面板边距，确定按钮与卡片定位（节流 15s）
      if (this.adapter.platform === 'whatsapp') {
        const now = Date.now()
        if (!this.lastWaDiag || now - this.lastWaDiag > 15000) {
          this.lastWaDiag = now
          const mainRect = document.querySelector('#main')?.getBoundingClientRect()
          const list = msgs[0]?.node.parentElement
          const listCs = list ? getComputedStyle(list) : null
          const info = msgs.slice(0, 6).map((m) => {
            const n = m.node
            const msg = n.querySelector('[data-testid="msg-container"]')
            const row = msg?.parentElement || null
            const rcs = row ? getComputedStyle(row) : null
            const nr = n.getBoundingClientRect()
            const mr = msg ? msg.getBoundingClientRect() : null
            // 卡片定位校验：卡片右边缘应与气泡右边缘对齐（out，in 则看左边缘）
            const badge = findBadge(n)
            const slotEl = badge?.closest('.mt-slot') as HTMLElement | null
            const cr = badge ? badge.getBoundingClientRect() : null
            const sr = slotEl ? slotEl.getBoundingClientRect() : null
            return {
              dir: m.direction,
              node: nr.left.toFixed(0) + '..' + (nr.left + nr.width).toFixed(0),
              row: row
                ? `${rcs!.display}/${rcs!.flexDirection}/${rcs!.justifyContent}/${rcs!.alignItems}/${rcs!.flexWrap}`
                : null,
              msg: mr ? mr.left.toFixed(0) + '..' + (mr.left + mr.width).toFixed(0) : null,
              card: cr ? cr.left.toFixed(0) + '..' + cr.right.toFixed(0) : null,
              slot: sr ? sr.left.toFixed(0) + '..' + sr.right.toFixed(0) : null,
              // 纵向：用来定位「气泡 → 译文卡片」间距由哪几段构成
              nodeY: nr.top.toFixed(0) + '..' + nr.bottom.toFixed(0),
              msgY: mr ? mr.top.toFixed(0) + '..' + mr.bottom.toFixed(0) : null,
              cardY: cr ? cr.top.toFixed(0) + '..' + cr.bottom.toFixed(0) : null,
              slotY: sr ? sr.top.toFixed(0) + '..' + sr.bottom.toFixed(0) : null,
              kids: row
                ? Array.from(row.children)
                    .map(
                      (c) =>
                        c.tagName + ':' + (c.getAttribute('data-testid') || (c.className || '').toString().slice(0, 12))
                    )
                    .join('|')
                : '',
            }
          })
          ipcRenderer.send(
            'dbg',
            'wa-msg ' +
              JSON.stringify({
                main: mainRect ? mainRect.left.toFixed(0) + '..' + (mainRect.left + mainRect.width).toFixed(0) : null,
                list: listCs ? `${listCs.display} pad=${listCs.paddingLeft}/${listCs.paddingRight}` : null,
                msgs: info,
              })
          )
        }
        // WhatsApp：注册 resize 监听，面板宽度变化时重算按钮/卡片位置
        this.ensureWaResizeHandler()
      }
    }
    for (const m of msgs) {
      if (m.hasAudio) {
        this.attachAudioHandler(m)
        continue
      }
      if (m.text) {
        // 中文/数字/符号等无需翻译的消息不入队，避免一直卡在翻译或失败
        if (this.cfg.autoTranslate && needsTranslation(m.text)) this.pending.push(m)
      }
    }
    if (this.cfg.autoTranslate) void this.pump()
  }

  // ---------------- 注入清理 ----------------

  /** 清理已脱离消息节点（会话切换/消息删除）的残留 slot */
  private cleanupOrphanSlots(): void {
    document.querySelectorAll('.mt-slot').forEach((slot) => {
      // Messenger 新版：slot 挂在消息行容器之后（行是带 data-virtualized 标记的节点，
      // 其父为行容器），既不在 .Message/.bubble 内、前一兄弟也不是消息行，
      // 按旧规则会被误删。
      if (slot.getAttribute('data-mt-host') === 'messenger-row') return
      // Telegram：slot 挂在 .Message/.bubble 容器内部；其它平台：紧跟消息行之后
      const inRow = !!slot.closest('.Message, .bubble')
      const prev = slot.previousElementSibling
      const afterMsg = !!prev?.matches(
        '.Message, .bubble, .message-in, .message-out, [data-testid="m-message"], div[data-id], [data-virtualized]'
      )
      if (!inRow && !afterMsg) slot.remove()
    })
    // 手动翻译图标已下线：清掉页面上残留的旧按钮（旧版本注入的图标不会自行消失）
    document.querySelectorAll('.mt-translate-btn').forEach((btn) => btn.remove())
  }

  /**
   * 兜底修复 slot 底色：Messenger 新版 slot 是消息行容器的兄弟节点，自身没有底色，
   * 需要复制宿主行的整行底色，否则会透出会话面板的渐变/壁纸（表现为卡片旁边拖着一条底色带）。
   * 注入那一刻宿主可能尚未完成布局而放弃上色，或行被虚拟列表回收重渲染后底色丢失，
   * 这里在每次扫描时对仍透明的 slot 重新取色补齐。只处理透明 slot，代价可忽略。
   */
  private repairSlotBackgrounds(): void {
    document.querySelectorAll<HTMLElement>('.mt-slot').forEach((slot) => {
      if (slot.dataset.mtHost !== 'messenger-row') return
      if (getComputedStyle(slot).backgroundColor !== 'rgba(0, 0, 0, 0)') return
      refreshSlotBackground(slot)
    })
  }

  /**
   * WhatsApp：卡片缩进量随气泡坐标变化（滚动条出现/消失、面板宽度变化、虚拟列表回收重渲染、
   * 注入时行尚未完成布局）。旧实现只在 window.resize 时重算，于是先注入的卡片会一直留着
   * 当时算出的缩进，不同消息距右侧的距离就对不上。这里在每次扫描时重算一遍：
   * 量不出布局的 slot 会被 positionWaCard 跳过（保留旧值），由注入时的延迟重试兜底。
   */
  private repairWaPositions(): void {
    if (this.adapter.platform !== 'whatsapp') return
    document.querySelectorAll<HTMLElement>('.mt-slot').forEach((slot) => {
      const dir = slot.dataset.dir
      const node = slot.previousElementSibling
      if (!dir || !node || !node.matches('div[data-id]')) return
      positionWaCard(node, slot, dir === 'out' ? 'out' : 'in')
    })
  }

  /** 已注册"点击发送按钮先移除预览框 + 中文输入翻译后自动发送"的守护 */
  private sendClickGuardAttached = false
  /** 点击发送翻译进行中标记（防并发重复拦截） */
  private sendTranslating = false
  /**
   * 本次点击的发送抑制窗口：拦截发生在 pointerdown 阶段，但 Messenger 的发送动作
   * 可能绑定在后续 click / pointerup。翻译异步完成前输入框仍是中文会被发出去，
   * 翻译完成后英文又会被同一次点击的后续事件发出。因此在拦截后的一段时间内，
   * 对该发送按钮区域产生的所有 pointerup / click 一律阻止。
   */
  private sendSuppressUntil = 0
  private lastSendBtn: Element | null = null
  /** WhatsApp：窗口尺寸变化后重算卡片位置（气泡坐标会随面板宽度变化） */
  private waResizeBound = false
  private ensureWaResizeHandler(): void {
    if (this.waResizeBound) return
    this.waResizeBound = true
    window.addEventListener('resize', () => this.repositionWaInjections())
  }

  private repositionWaInjections(): void {
    document.querySelectorAll('.mt-slot').forEach((s) => {
      const node = s.previousElementSibling
      const dir = (s as HTMLElement).dataset.dir
      if (node?.matches('div[data-id]') && dir) positionWaCard(node, s as HTMLElement, dir as 'in' | 'out')
    })
  }

  // ---------------- 自动翻译 ----------------

  private async pump(): Promise<void> {
    if (this.pumping) return
    this.pumping = true
    try {
      while (this.pending.length > 0) {
        const m = this.pending.shift()!
        // 节点已被虚拟滚动/会话切换卸载：跳过，避免旧消息堵住队列导致新会话迟迟不翻译
        if (!m.node.isConnected) {
          ipcRenderer.send('dbg', 'pump skip disconnected node')
          continue
        }
        // 只有真正发起翻译请求才间隔限速；缓存命中/跳过立即处理，避免切回会话时恢复卡片很慢
        const didRequest = await this.translateMessage(m)
        if (didRequest) await new Promise((r) => setTimeout(r, BATCH_INTERVAL))
      }
    } finally {
      this.pumping = false
      ipcRenderer.send('dbg', 'pump end')
    }
  }

  /** 返回是否发起了翻译请求（供 pump 决定是否限速间隔） */
  private async translateMessage(m: MessageInfo): Promise<boolean> {
    ipcRenderer.send('dbg', `translateMessage enter text=${m.text.slice(0, 30)} translating=${this.translating.has(m.node)} hasBadge=${hasBadge(m.node)}`)
    if (this.translating.has(m.node) || !m.text || !m.node.isConnected) return false
    // 中文/数字/符号等无需翻译：不发请求，避免卡住或失败
    if (!needsTranslation(m.text)) return false
    // 已有卡片：指纹一致才是同一条消息；节点被虚拟滚动复用（内容变化）则移除旧卡片重译
    const existing = findBadge(m.node)
    if (existing) {
      if (existing.dataset.src === textHash(m.text)) return false
      removeBadge(m.node)
    }
    this.translating.add(m.node)
    showLoading(m.node, m.direction)
    try {
      let lastErr = ''
      // 失败自动重试一次（间隔 3s，兼容 Google 限流/临时网络抖动）
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const res = await this.requestTranslate(m.text)
          ipcRenderer.send('dbg', `translate attempt text=${m.text.slice(0, 30)} success=${res.success} translated=${res.translated?.slice(0, 30)} error=${res.error || ''}`)
          if (res.success && res.translated) {
            this.showTranslateCard(m.node, m.direction, m.text, res.translated, res.source)
            markProcessed(m.node, m.text)
            return true
          }
          lastErr = res.error || ''
        } catch (e: any) {
          lastErr = String(e?.message || e)
        }
        if (attempt === 0) await new Promise((r) => setTimeout(r, 3000))
      }
      this.showTranslateCard(m.node, m.direction, m.text, `翻译失败：${lastErr}`, undefined, { error: true })
      return true
    } finally {
      this.translating.delete(m.node)
    }
  }

  private requestTranslate(text: string, lang?: string, bypassCache?: boolean): Promise<TranslateResult> {
    return ipcRenderer.invoke(IPC_W.TranslateText, text, lang || this.cfg.defaultLang, !!bypassCache)
  }

  /** 渲染翻译卡片（含三个操作按钮），供自动翻译与重新翻译复用 */
  private showTranslateCard(
    node: Element,
    direction: 'in' | 'out',
    original: string,
    translated: string,
    source?: string,
    extra?: { error?: boolean }
  ): void {
    injectBadge(node, translated, direction, {
      source,
      error: extra?.error,
      originalText: original,
      callbacks: {
        onRetranslate: (orig) => void this.retranslate(node, direction, orig),
        onSmartReply: (orig, text) => void this.generateSmartReply(orig, text),
      },
    })
  }

  /** 重新翻译（绕过缓存）并更新卡片 */
  private async retranslate(node: Element, direction: 'in' | 'out', original: string): Promise<void> {
    if (this.translating.has(node)) return
    this.translating.add(node)
    showLoading(node, direction)
    try {
      const res = await this.requestTranslate(original, undefined, true)
      if (res.success && res.translated) {
        this.showTranslateCard(node, direction, original, res.translated, res.source)
      } else {
        this.showTranslateCard(node, direction, original, `翻译失败：${res.error || '无输出'}`, undefined, { error: true })
      }
    } catch (e: any) {
      this.showTranslateCard(node, direction, original, `翻译失败：${String(e?.message || e)}`, undefined, { error: true })
    } finally {
      this.translating.delete(node)
    }
  }

  /** 基于该消息原文+翻译，用 AI 生成回复并填入输入框 */
  async generateSmartReply(original: string, translated: string): Promise<void> {
    const input = this.adapter.findInput()
    if (!input) return
    this.showInputNotice('正在生成回复中...', 'info', input)
    const history = this.adapter.recentMessages(10)
    const context: { role: 'in' | 'out'; text: string }[] = [
      ...history,
      { role: 'out', text: `对方消息原文：${original}\n翻译：${translated}\n请用对方的语言生成一句简短、自然、得体的回复，只输出回复内容本身。` },
    ]
    try {
      const res = await ipcRenderer.invoke(IPC_W.GenerateReply, context)
      if (res?.success && res.reply) {
        insertTextAtCursor(input, res.reply)
        this.showInputNotice('回复已生成', 'ok', input)
      } else {
        this.showInputNotice(`生成失败：${res?.error || ''}`, 'err', input)
      }
    } catch (e: any) {
      this.showInputNotice(`生成失败：${String(e?.message || e)}`, 'err', input)
    }
  }

  /** 清理（页面卸载时调用，避免定时器泄漏） */
  dispose(): void {
    this.observer?.disconnect()
    this.observer = null
  }

  /**
   * 宿主即将销毁本 guest（删除账号 / 关闭该账号的 webview 时由渲染层下发 mt-host-teardown）。
   *
   * 让销毁瞬间页面上没有任何在跑的注入逻辑：停掉未读轮询定时器、断开 MutationObserver、
   * 丢弃待处理队列。guest 在"完全静止"状态下被宿主摘除，避免销毁过程中仍有
   * 定时器回调/IPC 上报/观察器回调在跑而放大原生崩溃概率。
   */
  teardown(): void {
    this.hostPaused = true
    if (this.unreadTimer) {
      clearInterval(this.unreadTimer)
      this.unreadTimer = null
    }
    try {
      this.observer?.disconnect()
    } catch {
      /* ignore */
    }
    this.observer = null
    this.pending = []
  }

  // ---------------- 发送翻译拦截 ----------------

  private sendTranslationEnabled = false
  private sendInterceptorAttached = false
  /** 最近一次键盘输入所在的输入框（点击发送按钮时兜底定位用，避免依赖平台选择器） */
  private lastInput: HTMLElement | null = null
  /** 发送按钮未匹配诊断节流时间戳 */
  private lastSendDiag = 0
  /** Messenger 发送按钮命中诊断节流时间戳 */
  private lastSendHitDiag = 0
  /** Messenger 登录页诊断是否已采样过（每 webview 生命周期仅一次） */
  private loginDiagDone = false

  setSendTranslationEnabled(enabled: boolean): void {
    this.sendTranslationEnabled = enabled
    if (enabled) this.attachSendInterceptor()
  }

  getSendTranslationEnabled(): boolean {
    return this.sendTranslationEnabled
  }

  /** 拦截输入框 Enter：输入含中文时先翻译替换，再次 Enter 才真正发送（跨平台通用方案） */
  private attachSendInterceptor(): void {
    if (this.sendInterceptorAttached) return
    // Messenger：仅在真正进入"会话页（存在 composer）"时才挂输入/点击捕获监听。
    // 这些监听注册在 document 捕获阶段，会先于页面自身处理 pointerdown/click/keydown；
    // 登录页（facebook 登录/两步验证）没有 composer，messengerInChat() 为 false，从而绝不挂载，
    // 保证登录框输入与登录按钮点击完全不受干扰。此前用 isLoggedIn() 判定在部分登录页 DOM
    // 下可能误判为已登录而在登录页挂上监听导致无法输入；改用 messengerInChat() 更严格可靠。
    if (this.adapter.platform === 'messenger' && !this.messengerInChat()) return
    this.sendInterceptorAttached = true
    // 点击发送按钮：先移除预览框；输入含中文时拦截点击，翻译后替换输入框（与回车路径一致）
    this.attachSendClickGuard()
    document.addEventListener(
      'keydown',
      (e) => {
        if (!this.sendTranslationEnabled) return
        // 实时守卫：messenger 只在聊天会话页拦截 Enter 发送翻译。退出登录/收件箱/验证页一律放行，
        // 避免登录或其它页面的 Enter/输入被误拦截。
        if (this.adapter.platform === 'messenger' && !this.messengerInChat()) return
        if (e.key !== 'Enter' || e.shiftKey || e.ctrlKey || e.metaKey || e.altKey || e.isComposing)
          return
        const target = e.target as HTMLElement
        if (!target || !this.isEditable(target)) return
        // 记录最近输入框（点击发送按钮时兜底定位，避免依赖平台 findInput 选择器）
        this.lastInput = target.isContentEditable
          ? (target.closest('[contenteditable="true"]') as HTMLElement) || target
          : target
        const text = this.inputValue(target)
        if (!text || !/[\u4e00-\u9fff]/.test(text)) {
          // 非中文输入：正常发送，同时移除翻译预览框
          this.removeSendPreview()
          return
        }
        // 输入含中文 → 拦截本次 Enter，翻译后替换输入框
        e.preventDefault()
        e.stopImmediatePropagation()
        if (this.sendTranslating) return // 防重入：翻译中再按 Enter 不重复翻译
        void this.translateAndFill(target, text, 'enter')
      },
      true
    )
  }

  /**
   * 发送按钮拦截：
   * 主拦截挂在 pointerdown 捕获阶段——WhatsApp 等平台的发送动作若由
   * mousedown/click 触发，preventDefault 会同时阻止 mousedown/click 的生成，
   * 从源头杜绝"原文已发出"的情况；
   * click 捕获阶段作为兜底（清理预览框 + 若 pointerdown 未拦到再拦一次）。
   * 两阶段共用同一判定逻辑，防重入由 sendTranslating 保证。
   */
  private attachSendClickGuard(): void {
    if (this.sendClickGuardAttached) return
    this.sendClickGuardAttached = true
    const handler = (e: Event, via: 'pointerdown' | 'click'): void => {
      const t = e.target as Element | null
      if (!t) return
      // 实时守卫：messenger 只有在"当前仍在聊天会话页"时才可能拦截点击（发送按钮/预览）。
      // 退出登录回到登录页/收件箱后（无 composer），即便拦截器已挂载也绝不干预，避免登录框、
      // 密码框、退出/验证等输入被误 preventDefault/stopPropagation 而无法使用。
      if (this.adapter.platform === 'messenger' && !this.messengerInChat()) return
      // 抑制窗口：这是刚被拦截（中文输入）那次点击的后续 pointerup/click 事件。
      // 此时输入框可能已被翻译结果替换成英文，若放行，Messenger 会在 click/pointerup
      // 阶段把翻译后的英文"自动发出"。窗口内对该发送按钮区域的事件一律阻止，
      // 由用户再次点击发送确认（与 Enter 路径"再按 Enter 发送"体验一致）。
      if (Date.now() < this.sendSuppressUntil && this.lastSendBtn) {
        if (this.lastSendBtn.contains(t) || t.contains(this.lastSendBtn)) {
          e.preventDefault()
          e.stopImmediatePropagation()
          e.stopPropagation()
          return
        }
      }
      let sendBtn = t.closest(MT_SEND_BTN_SELECTOR)
      if (!sendBtn) {
        // Messenger 新版 composer 的发送按钮常无稳定 data-testid/aria-label，
        // 未命中通用选择器时走平台专用兜底（仅 messenger 生效）
        sendBtn = this.messengerSendHit(t)
        if (!sendBtn) {
          // 仍未命中：节流诊断。Messenger 的发送动作常绑定在 pointerdown/mousedown
          // 而非 click，click 兜底诊断会漏，故 messenger 在 pointerdown 阶段也记录
          if (via === 'click' || this.adapter.platform === 'messenger') this.maybeDiagUnmatchedSendClick(t)
          return
        }
      }
      // 点击发送按钮：无条件移除翻译预览框，避免预览文本被一并读取发送
      this.removeSendPreview()
      if (!e.isTrusted) return
      if (!this.sendTranslationEnabled) return
      const input = this.resolveSendInput(t, sendBtn)
      if (!input) {
        // 定不到输入框时不再阻止发送：此前「宁可拦下」的策略在误命中（点到非 composer 发送控件）
        // 或页面结构变化时会让用户彻底发不出消息，改为放行并记录诊断。
        console.warn('[mt] send guard: input not found, pass through')
        return
      }
      const text = this.inputValue(input)
      // Messenger 命中路径诊断（与未命中诊断互补，确认拦截链路真实执行情况）
      if (this.adapter.platform === 'messenger') this.traceMessengerSendHit(t, sendBtn, input, text)
      if (!text || !/[\u4e00-\u9fff]/.test(text)) return
      // 输入含中文 → 拦截本次发送动作，翻译后替换输入框
      e.preventDefault()
      e.stopImmediatePropagation()
      e.stopPropagation()
      // 记录抑制窗口：同一次点击的后续 pointerup/click 若被 Messenger 用于发送，
      // 会在翻译结果替换输入框后把英文"自动发出"。窗口内一律阻止，需用户再次点击确认。
      this.sendSuppressUntil = Date.now() + 3000
      this.lastSendBtn = sendBtn
      if (this.sendTranslating) return // 防重入：翻译中再次发送动作不重复翻译，但保持拦截
      void this.translateAndFill(input, text, 'click')
    }
    document.addEventListener('pointerdown', (e) => handler(e, 'pointerdown'), true)
    document.addEventListener('click', (e) => handler(e, 'click'), true)
    // Messenger 的发送动作可能绑定在 pointerup（pointerdown 的 preventDefault 不会
    // 抑制 pointerup）。在抑制窗口内对同一发送按钮区域的 pointerup 一律阻止。
    document.addEventListener(
      'pointerup',
      (e) => {
        const t = e.target as Element | null
        if (!t || Date.now() >= this.sendSuppressUntil || !this.lastSendBtn) return
        if (this.lastSendBtn.contains(t) || t.contains(this.lastSendBtn)) {
          e.preventDefault()
          e.stopImmediatePropagation()
          e.stopPropagation()
        }
      },
      true
    )
  }

  /** 点击发送按钮时的输入框定位：多级回退，不依赖单一平台选择器 */
  private resolveSendInput(t: Element, sendBtn: Element): HTMLElement | null {
    // 1) 点击目标自身就在输入框内
    const direct = t.closest('[contenteditable="true"], textarea, input[type="text"], input[type="search"]') as HTMLElement | null
    if (direct) return direct
    // 2) 最近一次键盘输入所在的输入框（回车路径已验证可编辑）
    if (this.lastInput && this.lastInput.isConnected) return this.lastInput
    // 3) 从发送按钮所在的 composer/footer 容器内查找输入框
    const scope = sendBtn.closest('footer, form, [data-testid="composer"], .composer, .conversation-panel') as HTMLElement | null
    if (scope) {
      const inner = scope.querySelector('[contenteditable="true"], textarea') as HTMLElement | null
      if (inner) return inner
    }
    // 4) 平台默认选择器
    return this.adapter.findInput()
  }

  /**
   * Messenger 专用发送按钮兜底命中：
   * 新版 messenger.com composer 的发送按钮常无稳定 data-testid / aria-label，
   * 点击目标在 DOM 上常解析为输入框容器 conversation-compose-box-input 或其附近图标。
   * 命中条件（全部满足才视为发送按钮，尽量降低误拦）：
   *  1) 点击发生在 composer 容器 conversation-compose-box 内；
   *  2) 点击点不在 contenteditable 文本区内（点击发送按钮，而非定位光标/选词/拖选文本）；
   *  3) 点击元素无文本内容（纯图标按钮），且不含工具按钮语义（附件/表情/相机等放行）。
   */
  /** Messenger 登录表单特征（Facebook/Messenger 经典登录页：邮箱 + 密码 + login_form） */
  private messengerLoginForm(): boolean {
    return !!document.querySelector(
      '#login_form, [data-testid="login_form"], #email, input[name="email"], #pass, input[type="password"]'
    )
  }

  /** Messenger 是否处于聊天会话页（存在 composer/输入框/消息区）。登录页与收件箱列表不具备这些特征 */
  private messengerInChat(): boolean {
    if (this.messengerLoginForm()) return false
    return !!document.querySelector(
      '[data-testid="conversation-compose-box"], [data-testid="conversation-compose-box-input"], ' +
        'div[contenteditable="true"][role="textbox"], [role="log"], [data-testid="m-message"]'
    )
  }

  private messengerSendHit(t: Element): Element | null {
    if (this.adapter.platform !== 'messenger') return null
    // 仅在聊天会话页启用发送按钮兜底命中。登录页/未进入会话的页面没有 composer，
    // 若不限定，登录表单的 input（"邮箱或电话号码"）会被当成发送按钮命中：
    // 点击登录按钮会因找不到输入框被 preventDefault 拦死、点击输入框也无法正常聚焦。
    if (this.messengerLoginForm()) return null
    if (!this.messengerInChat()) return null
    // composer 容器：新版 messenger 可能只存在 conversation-compose-box-input（输入卡片）；
    // testid 兜底：发送按钮固定在视口底部，点击落在底部区域同样视为 composer 内。
    const box = t.closest(
      '[data-testid="conversation-compose-box"], [data-testid="conversation-compose-box-input"]'
    )
    if (!box) {
      const r = (t as HTMLElement).getBoundingClientRect()
      if (!r || r.bottom < window.innerHeight * 0.65) return null
    }
    // 点击在可编辑文本块本身上（div/p/span 继承 contenteditable）→ 定位光标/选词，放行。
    // 不能用 t.closest('[contenteditable]') 整体排除：Messenger 发送图标若嵌在输入卡片
    // 内（非继承 contenteditable 的 absolute 按钮），此时 t 并非可编辑块，应继续判定。
    if (t instanceof HTMLElement && t.isContentEditable) return null
    // 注意：不能凭 textContent 非空就放行。Messenger 中文界面发送按钮可能带“发送”等
    // 短文本，或点击到“按 Enter 键发送”提示浮层；只有明显的长文本（>20 字符，选词/
    // 阅读文本）才视为文本区点击放行。宽松命中无害：输入框无中文时链路自动放行。
    const btn = t.closest('button, [role="button"]') as Element | null
    const probe = btn || t
    const txt = (probe.textContent || '').trim()
    if (txt.length > 20) return null
    const label =
      (probe.getAttribute('aria-label') || '') +
      ' ' +
      (probe.getAttribute('data-testid') || '') +
      ' ' +
      (probe.getAttribute('title') || '')
    if (
      /attach|media|photo|image|sticker|emoji|gif|pic|camera|voice|audio|video|call|file|more|like|help|附件|媒体|照片|图片|表情|贴纸|动图|相机|语音|音频|通话|文件|更多|点赞|帮助|emoji|search|搜索/i.test(
        label
      )
    ) {
      return null
    }
    return probe
  }

  /** Messenger 命中发送按钮后的链路诊断（节流 1s）：确认拦截链路真实执行到哪一步 */
  private traceMessengerSendHit(t: Element, sendBtn: Element, input: HTMLElement | null, text: string): void {
    const now = Date.now()
    if (now - this.lastSendHitDiag < 1000) return
    this.lastSendHitDiag = now
    const snap = (el: Element | null): string => {
      if (!el) return ''
      const h = el as HTMLElement
      return `<${h.tagName.toLowerCase()} class="${String(h.className || '').slice(0, 90)}" aria="${
        h.getAttribute('aria-label') || ''
      }" role="${h.getAttribute('role') || ''}" testid="${h.getAttribute('data-testid') || ''}" tab="${
        h.getAttribute('data-tab') || ''
      }" title="${h.getAttribute('title') || ''}">`
    }
    const info: Record<string, unknown> = {
      platform: 'messenger',
      hitBtn: snap(sendBtn),
      target: snap(t),
      inputFound: !!input,
      inputTag: input ? input.tagName : null,
      textLen: text.length,
      hasCjk: /[\u4e00-\u9fff]/.test(text),
      enabled: this.sendTranslationEnabled,
    }
    console.warn('[mt] messenger send hit:', info)
    ipcRenderer.send('dbg', 'send-hit-messenger ' + JSON.stringify(info))
  }

  /** 诊断：WhatsApp/Messenger 上点击了 composer 内的按钮类元素但未匹配发送按钮选择器（节流 5s） */
  private maybeDiagUnmatchedSendClick(t: Element): void {
    if (this.adapter.platform !== 'whatsapp' && this.adapter.platform !== 'messenger') return
    // messenger 登录页/非会话页的点击（邮箱/密码框、登录按钮等）不属于发送按钮诊断范围，只在会话页诊断，避免刷屏
    if (this.adapter.platform === 'messenger' && (this.messengerLoginForm() || !this.messengerInChat())) return
    const now = Date.now()
    if (now - this.lastSendDiag < 3000) return
    const isMsg = this.adapter.platform === 'messenger'
    let btn = t.closest('button, [role="button"], [data-icon], [aria-label], [data-tab]') as Element | null
    if (!btn && isMsg) {
      // Messenger 新版发送按钮可能毫无标准特征：放宽为点击目标自身，
      // 但限定在视口底部区域（composer 固定于底部），排除编辑区与长文本点击
      if (t instanceof HTMLElement && t.isContentEditable) return
      const r = (t as HTMLElement).getBoundingClientRect()
      if (!r || r.bottom < window.innerHeight * 0.6) return
      const txt = ((t as HTMLElement).textContent || '').trim()
      if (txt.length > 30) return
      btn = t
    }
    if (!btn) return
    if (!isMsg) {
      if (!btn.closest('footer, [data-testid="composer"], .composer, [data-testid="conversation-compose-box"], [data-testid="conversation-compose-box-input"]')) return
    }
    this.lastSendDiag = now
    const info: Record<string, unknown> = {
      platform: this.adapter.platform,
      tag: btn.tagName,
      cls: String((btn as HTMLElement).className || '').slice(0, 120),
      aria: btn.getAttribute('aria-label'),
      dataIcon: btn.getAttribute('data-icon'),
      dataTestid: btn.getAttribute('data-testid'),
      dataTab: btn.getAttribute('data-tab'),
      title: btn.getAttribute('title'),
    }
    if (this.adapter.platform === 'messenger') {
      // Messenger 附加采样：点击目标自身的 HTML + composer 内可交互候选，便于定位真实发送按钮
      const snap = (el: Element | null): string => {
        if (!el) return ''
        const h = el as HTMLElement
        return `<${h.tagName.toLowerCase()} class="${String(h.className || '').slice(0, 90)}" aria="${
          h.getAttribute('aria-label') || ''
        }" role="${h.getAttribute('role') || ''}" testid="${h.getAttribute('data-testid') || ''}" tab="${
          h.getAttribute('data-tab') || ''
        }">`
      }
      info.target = snap(t) + String((t as HTMLElement).outerHTML || '').slice(0, 260)
      const box = t.closest(
        '[data-testid="conversation-compose-box"], [data-testid="conversation-compose-box-input"]'
      )
      if (box) {
        const cands: string[] = []
        for (const el of Array.from(
          box.querySelectorAll('button, [role="button"], [aria-label], [data-testid], [data-icon], [data-tab]')
        ).slice(0, 14)) {
          const h = el as HTMLElement
          cands.push(
            `<${h.tagName.toLowerCase()} class="${String(h.className || '').slice(0, 70)}" aria="${
              h.getAttribute('aria-label') || ''
            }" testid="${h.getAttribute('data-testid') || ''}" icon="${h.getAttribute('data-icon') || ''}" tab="${
              h.getAttribute('data-tab') || ''
            }">`
          )
        }
        info.composerCands = cands.join(' | ')
      }
    }
    console.warn('[mt] send click in composer not matched:', info)
    ipcRenderer.send('dbg', 'send-btn-unmatched ' + JSON.stringify(info))
  }

  private isEditable(el: HTMLElement): boolean {
    if (el.isContentEditable) return true
    const tag = el.tagName.toUpperCase()
    if (tag === 'TEXTAREA') return true
    if (tag === 'INPUT') {
      const t = (el as HTMLInputElement).type
      return t === 'text' || t === 'search'
    }
    return false
  }

  private inputValue(el: HTMLElement): string {
    if (el.isContentEditable) {
      // 遍历子节点，跳过翻译预览元素（其文本含中文，不应计入待发送内容）
      let text = ''
      for (const node of el.childNodes) {
        if (node instanceof HTMLElement && node.classList.contains('mt-send-preview')) continue
        text += node.textContent || ''
      }
      return text.trim()
    }
    return ((el as HTMLInputElement | HTMLTextAreaElement).value || '').trim()
  }

  /** 语言代码 → 中文名（用于提示文案，如"已替换为日文"） */
  private langLabel(lang: string): string {
    const l = lang.toLowerCase()
    const map: Record<string, string> = {
      en: '英文',
      'zh-cn': '简体中文',
      'zh-tw': '繁体中文',
      ja: '日文',
      ko: '韩文',
      de: '德文',
      es: '西班牙文',
      ar: '阿拉伯文',
      ru: '俄文',
      fr: '法文',
      pt: '葡萄牙文',
      it: '意大利文',
      th: '泰文',
      vi: '越南文',
      id: '印尼文',
      tr: '土耳其文',
      hi: '印地文',
      nl: '荷兰文',
      pl: '波兰文',
      uk: '乌克兰文',
      ms: '马来文',
      fil: '菲律宾文',
    }
    return map[l] || lang
  }

  /** 发送翻译：翻译后替换输入框为译文（与回车/点击两种触发路径一致），由用户再次触发发送 */
  private async translateAndFill(el: HTMLElement, text: string, via: 'enter' | 'click' = 'enter'): Promise<void> {
    // WhatsApp / Messenger 的 keydown target 可能是输入框内部子元素，
    // 统一提升到 contenteditable 根元素再计算位置/操作
    if (el.isContentEditable) {
      const root = el.closest('[contenteditable="true"]')
      if (root) el = root as HTMLElement
    }
    if (this.sendTranslating) return
    this.sendTranslating = true
    // 发送翻译使用独立目标语言（sendLang），避免中文输入被翻译回中文后返回原文
    const lang = this.cfg.sendLang || 'en'
    const again = via === 'click' ? '请再次点击发送' : '再按 Enter 发送'
    this.showInputNotice('翻译中...', 'info', el)
    try {
      const res = await this.requestTranslate(text, lang)
      if (res.success && res.translated) {
        if (res.translated === text) {
          // 译文与原文相同（目标语言可能设成了中文）：提示检查设置，避免死循环
          this.removeSendPreview()
          this.showInputNotice('译文与原文相同，请检查发送翻译的目标语言设置', 'err', el)
          return
        }
        await this.replaceInputText(el, res.translated)
        // 校验替换结果：若编辑器未同步（输入框仍含中文），提示用户，避免死循环/误发
        if (/[\u4e00-\u9fff]/.test(this.inputValue(el))) {
          this.showInputNotice('替换失败，请手动清除中文后再发送', 'err', el)
          return
        }
        this.showSendPreview(text, res.translated, el, res.source)
        this.showInputNotice(`已替换为${this.langLabel(lang)}，${again}`, 'ok', el)
      } else {
        this.removeSendPreview()
        this.showInputNotice(`翻译失败：${res.error || '无输出'}`, 'err', el)
      }
    } catch (e: any) {
      this.removeSendPreview()
      this.showInputNotice(`翻译失败：${String(e?.message || e)}`, 'err', el)
    } finally {
      this.sendTranslating = false
    }
  }

  /** 清空输入框原文并写入译文（替换而非追加） */
  private async replaceInputText(el: HTMLElement, text: string): Promise<void> {
    if (el.isContentEditable) {
      el.focus()
      if (this.adapter.platform === 'whatsapp' || this.adapter.platform === 'messenger') {
        // WhatsApp / Messenger（新版）的 Lexical 编辑器由内部 state 驱动 DOM。
        // 关键点：设置全选选区后必须"立即"执行替换，中间不能 await——
        // 否则 Lexical 会异步把 DOM 选区重置回光标位置，译文会被插入到末尾（追加）而非替换。
        const selectAll = (): void => {
          const sel = window.getSelection()
          const range = document.createRange()
          range.selectNodeContents(el)
          sel?.removeAllRanges()
          sel?.addRange(range)
        }
        // 方案1（主）：execCommand insertText —— 触发原生 beforeinput，Lexical 会同步 state+DOM
        selectAll()
        document.execCommand('insertText', false, text)
        await new Promise((r) => setTimeout(r, 60))
        if ((el.textContent || '').trim() === text) {
          console.log('[' + this.adapter.platform + '] replace ok via execCommand')
          return
        }
        // 方案2：重新全选 + 合成 beforeinput（同样不等待，避免选区被重置）
        selectAll()
        el.dispatchEvent(
          new InputEvent('beforeinput', {
            inputType: 'insertText',
            data: text,
            bubbles: true,
            cancelable: true,
          })
        )
        await new Promise((r) => setTimeout(r, 80))
        if ((el.textContent || '').trim() === text) {
          console.log('[' + this.adapter.platform + '] replace ok via beforeinput')
          return
        }
        // 方案3（兜底）：强制 DOM 赋值 + input 事件
        el.textContent = text
        el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }))
        await new Promise((r) => setTimeout(r, 30))
        const finalText = (el.textContent || '').trim()
        if (finalText !== text) {
          console.warn('[mt] replace mismatch', this.adapter.platform, {
            want: text.slice(0, 40),
            got: finalText.slice(0, 40),
            tag: el.tagName,
            cls: String((el.className || '').toString()).slice(0, 60),
          })
        }
      } else {
        // Telegram 等：先删后插
        const sel = window.getSelection()
        const range = document.createRange()
        range.selectNodeContents(el)
        sel?.removeAllRanges()
        sel?.addRange(range)
        document.execCommand('delete')
        // 兜底：确保完全清空（同时移除残留的预览 span）
        if ((el.textContent || '').trim() !== '') el.textContent = ''
        insertTextAtCursor(el, text)
      }
    } else {
      const input = el as HTMLInputElement | HTMLTextAreaElement
      input.value = text
      input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }))
    }
  }

  /** 翻译通道中文标签 */
  private sourceLabel(source?: string): string {
    if (!source) return ''
    const map: Record<string, string> = { cache: '缓存', google: 'Google', openai: 'OpenAI', deepseek: 'DeepSeek' }
    return map[source] || source
  }

  /** 翻译预览：WhatsApp 显示在输入框上方浮层；Telegram 等 fixed 定位贴在输入框左侧（不写入输入框内容） */
  private showSendPreview(original: string, translated: string, el: HTMLElement, source?: string): void {
    this.removeSendPreview()
    const srcTag = source ? ` · ${this.sourceLabel(source)}通道` : ''
    if (this.adapter.platform === 'whatsapp') {
      // WhatsApp：固定浮层显示在输入框上方，原文小字、译文大字
      // 锚点尽量取视觉输入区域：contenteditable 或其父容器（含边框/padding）
      let anchor: HTMLElement = el
      const p = el.parentElement
      if (p && p.querySelector(':scope > [contenteditable="true"]') === el) anchor = p
      const rect = anchor.getBoundingClientRect()
      const container = document.createElement('div')
      container.className = 'mt-send-preview'
      container.style.cssText =
        `position:fixed;left:${rect.left}px;z-index:2147483647;` +
        `width:${rect.width}px;max-width:${rect.width}px;box-sizing:border-box;` +
        `padding:6px 28px 6px 12px;border-radius:8px;` +
        `background:#e8f4fc;border:1px solid #b8dceb;` +
        `box-shadow:0 4px 16px rgba(0,0,0,.15);` +
        `font-family:system-ui,-apple-system,sans-serif;user-select:none;`

      const header = document.createElement('div')
      header.textContent = `翻译预览（原文：${original}）${srcTag}`
      header.style.cssText = 'font-size:12px;color:#888;line-height:1.4;margin-bottom:3px;'

      const body = document.createElement('div')
      body.textContent = translated
      body.style.cssText = 'font-size:14px;line-height:1.4;color:#0a6fd4;word-break:break-word;'

      const close = document.createElement('button')
      close.textContent = '×'
      close.setAttribute('aria-label', '关闭')
      close.style.cssText =
        `position:absolute;right:6px;top:4px;` +
        `border:none;background:transparent;color:#5a7ab8;` +
        `font-size:16px;line-height:1;cursor:pointer;padding:2px 4px;`
      close.addEventListener('click', (e) => {
        e.stopPropagation()
        this.removeSendPreview()
      })

      container.append(header, body, close)
      document.body.appendChild(container)
      // 默认放在输入框正上方（间距 8px）；上方空间不足时放到输入框下方，保证不遮挡输入框
      const h = container.offsetHeight
      const viewportH = document.documentElement.clientHeight
      let top = rect.top - h - 8
      let pos = 'above'
      if (top < 8) {
        top = rect.bottom + 8
        pos = 'below'
      }
      if (top + h > viewportH - 4) {
        top = Math.max(8, viewportH - h - 8)
        pos = 'bottom'
      }
      container.style.top = `${top}px`
      console.log(
        `[wa] preview pos=${pos} top=${Math.round(top)} h=${Math.round(h)} ` +
          `rect.top=${Math.round(rect.top)} rect.bottom=${Math.round(rect.bottom)} viewport=${Math.round(viewportH)}`
      )

      // 输入框内容被清空时自动关闭预览框（用户删除译文或发送后清空）
      const clearWatcher = new MutationObserver(() => {
        if (!el.textContent || !el.textContent.trim()) this.removeSendPreview()
      })
      clearWatcher.observe(el, { childList: true, subtree: true, characterData: true })
      ;(container as unknown as { __mtCleanup?: () => void }).__mtCleanup = () => {
        clearWatcher.disconnect()
      }
      return
    }

    // Telegram 等：预览框保持"输入框内部左侧"的原视觉位置——fixed 浮层盖在内容起点，
    // 同时给输入框加左侧 padding 把译文向右推挤，译文不被遮挡；
    // 预览框不在输入框 DOM 内，内容不会写入输入框的值，发送时不会被带上
    if (el.isContentEditable) {
      const span = document.createElement('span')
      span.className = 'mt-send-preview'
      span.style.cssText =
        `position:fixed;z-index:2147483647;` +
        `width:160px;max-width:160px;box-sizing:border-box;` +
        `padding:4px 22px 4px 10px;border-radius:8px;` +
        `background:#e8f4fc;border:1px solid #b8dceb;` +
        `box-shadow:0 4px 16px rgba(0,0,0,.15);` +
        `color:#0a6fd4;font-size:13px;line-height:1.4;user-select:none;word-break:break-word;`

      const text = document.createElement('span')
      text.style.cssText = 'display:block;white-space:normal;word-break:break-word;'
      text.textContent = `翻译预览（原文：${original}）${srcTag} ${translated}`

      const close = document.createElement('button')
      close.textContent = '×'
      close.setAttribute('aria-label', '关闭')
      close.style.cssText =
        `position:absolute;right:4px;top:2px;` +
        `border:none;background:transparent;color:#5a7ab8;` +
        `font-size:14px;line-height:1;cursor:pointer;padding:2px 3px;`
      close.addEventListener('click', (e) => {
        e.stopPropagation()
        this.removeSendPreview()
      })

      span.append(text, close)
      document.body.appendChild(span)

      // 记录输入框原始 padding/最小高度，把译文推挤到预览框右侧，视觉与"插在最前面"一致
      const cs = getComputedStyle(el)
      const origPadL = parseFloat(cs.paddingLeft) || 0
      const origPadT = parseFloat(cs.paddingTop) || 0
      const origPadB = parseFloat(cs.paddingBottom) || 0
      const borderL = parseFloat(cs.borderLeftWidth) || 0
      const borderT = parseFloat(cs.borderTopWidth) || 0
      const borderB = parseFloat(cs.borderBottomWidth) || 0
      const origInlinePad = { left: el.style.paddingLeft, right: el.style.paddingRight }
      const origMinH = el.style.minHeight
      el.style.paddingLeft = `${origPadL + 170}px`

      // 定位到输入框内容起点（原插入位置），随输入框位置/尺寸变化自动重算
      const position = () => {
        const r = el.getBoundingClientRect()
        span.style.left = `${r.left + borderL + origPadL + 2}px`
        span.style.top = `${r.top + borderT + origPadT}px`
      }
      position()

      // 用预览框高度把输入框撑高，预览框完整显示在输入框内（多行译文不溢出）
      const applyHeight = () => {
        const need = span.offsetHeight + origPadT + origPadB + borderT + borderB
        el.style.minHeight = `${Math.max(el.offsetHeight, need)}px`
      }
      applyHeight()

      const ro = new ResizeObserver(position)
      ro.observe(el)
      const spanRO = new ResizeObserver(applyHeight)
      spanRO.observe(span)
      const onWinResize = () => {
        position()
        applyHeight()
      }
      window.addEventListener('resize', onWinResize)

      // 兜底：发送成功（输入框被清空）或用户清空输入框时自动删除预览框，
      // 不依赖发送按钮选择器，点击发送/Enter 发送后预览框一定消失
      const clearWatcher = new MutationObserver(() => {
        if (!el.innerText.trim()) this.removeSendPreview()
      })
      clearWatcher.observe(el, { childList: true, subtree: true, characterData: true })

      ;(span as unknown as { __mtCleanup?: () => void }).__mtCleanup = () => {
        ro.disconnect()
        spanRO.disconnect()
        clearWatcher.disconnect()
        window.removeEventListener('resize', onWinResize)
        el.style.paddingLeft = origInlinePad.left
        el.style.paddingRight = origInlinePad.right
        el.style.minHeight = origMinH
      }
      return
    }

    // Telegram 等的 value 型输入框（TEXTAREA/INPUT）无法插入 DOM，退化为显示在输入框上方
    const rect = el.getBoundingClientRect()
    const div = document.createElement('div')
    div.className = 'mt-send-preview'
    div.textContent = `翻译预览（原文：${original}）${srcTag} ${translated}`
    div.style.cssText =
      `position:fixed;left:${rect.left}px;top:${Math.max(8, rect.top - 32)}px;z-index:2147483647;` +
      `width:150px;max-width:150px;box-sizing:border-box;padding:4px 8px;border-radius:8px;` +
      `background:#e8f4fc;border:1px solid #b8dceb;` +
      `box-shadow:0 4px 16px rgba(0,0,0,.15);font:12px/1.5 system-ui,-apple-system,sans-serif;` +
      `color:#0a6fd4;user-select:none;word-break:break-word;`
    document.body.appendChild(div)
  }

  /** 预览期间让输入框随内容自动增高（Telegram 等平台）：移除输入框及其直接容器的高度/overflow 限制 */
  private enableAutoGrow(el: HTMLElement): void {
    let node: HTMLElement | null = el
    for (let i = 0; i < 5 && node; i++) {
      const cs = getComputedStyle(node)
      const h = cs.height
      const mh = cs.maxHeight
      const oy = cs.overflowY
      const fixedH = h && h !== 'auto' && h !== '0px' && parseFloat(h) > 0
      const hasMaxH = mh && mh !== 'none' && mh !== '0px'
      const clipped = oy === 'auto' || oy === 'scroll' || oy === 'hidden'
      // 输入框自身及前两层容器：移除固定高度，改为自动撑高
      if (i < 3 && fixedH) {
        this.previewAutoGrow.push({ el: node, prop: 'height', value: node.style.height })
        node.style.height = 'auto'
      }
      // 滚动/裁剪容器：移除最大高度
      if ((i < 3 || clipped) && hasMaxH) {
        this.previewAutoGrow.push({ el: node, prop: 'maxHeight', value: node.style.maxHeight })
        node.style.maxHeight = 'none'
      }
      // 输入框自身及直接容器：改为可见，避免滚动条/裁剪
      if (i < 3 && clipped) {
        this.previewAutoGrow.push({ el: node, prop: 'overflowY', value: node.style.overflowY })
        node.style.overflowY = 'visible'
      }
      node = node.parentElement
    }
  }

  private removeSendPreview(): void {
    document.querySelectorAll('.mt-send-preview').forEach((n) => {
      ;(n as unknown as { __mtCleanup?: () => void }).__mtCleanup?.()
      n.remove()
    })
    // 恢复输入框原始高度限制（Telegram 等平台）
    for (const item of this.previewAutoGrow) {
      item.el.style[item.prop] = item.value
    }
    this.previewAutoGrow = []
  }

  /** 输入框上方显示短暂提示浮条（ok 绿色 / err 红色 / info 蓝色） */
  private showInputNotice(text: string, kind: 'ok' | 'err' | 'info', el?: HTMLElement): void {
    document.querySelector('.mt-send-notice')?.remove()
    const div = document.createElement('div')
    div.className = 'mt-send-notice'
    div.textContent = text
    const bg =
      kind === 'ok' ? 'rgba(76,175,80,.95)' : kind === 'err' ? 'rgba(198,40,40,.95)' : 'rgba(33,110,180,.95)'
    let left = '50%'
    let top = '12px'
    let transform = 'translateX(-50%)'
    if (el) {
      const r = el.getBoundingClientRect()
      left = `${r.left + r.width / 2}px`
      top = `${Math.max(8, r.top - 36)}px`
    }
    div.style.cssText =
      `position:fixed;left:${left};top:${top};transform:${transform};z-index:2147483647;` +
      `padding:6px 14px;border-radius:8px;font:12px/1.5 system-ui,-apple-system,sans-serif;` +
      `color:#fff;background:${bg};` +
      `box-shadow:0 2px 10px rgba(0,0,0,.25);pointer-events:none;white-space:pre-wrap;max-width:80vw;`
    document.body.appendChild(div)
    setTimeout(() => div.remove(), 3500)
  }

  async generateAiReply(): Promise<void> {
    const input = this.adapter.findInput()
    if (!input) return
    const history = this.adapter.recentMessages(20)
    if (history.length === 0) {
      this.showInputNotice('暂无可用的聊天记录', 'info', input)
      return
    }
    this.showInputNotice('正在生成回复中...', 'info', input)
    try {
      const res = await ipcRenderer.invoke(IPC_W.GenerateReply, history)
      if (res?.success && res.reply) {
        insertTextAtCursor(input, res.reply)
        this.showInputNotice('回复已生成', 'ok', input)
      } else {
        this.showInputNotice(`生成失败：${res?.error || ''}`, 'err', input)
      }
    } catch (e: any) {
      this.showInputNotice(`生成失败：${String(e?.message || e)}`, 'err', input)
    }
  }

  // ---------------- 语音翻译 ----------------

  private attachAudioHandler(m: MessageInfo): void {
    if (this.audioHandled.has(m.node)) return
    this.audioHandled.add(m.node)
    // 点击语音消息时触发识别翻译
    m.node.addEventListener(
      'click',
      (e) => {
        e.stopPropagation()
        void this.translateAudio(m)
      },
      { once: false }
    )
    // 语音消息里的 audio 元素就绪后自动识别
    const audio = m.node.querySelector('audio')
    if (audio && !audio.dataset.mtAuto) {
      audio.dataset.mtAuto = '1'
      audio.addEventListener('loadedmetadata', () => void this.translateAudio(m), { once: true })
    }
  }

  private async translateAudio(m: MessageInfo): Promise<void> {
    if (this.translating.has(m.node)) return
    const audio = m.node.querySelector('audio')
    if (!audio) return
    this.translating.add(m.node)
    showLoading(m.node, m.direction)
    try {
      const src = audio.currentSrc || audio.src
      if (!src) throw new Error('no audio src')
      const resp = await fetch(src)
      if (!resp.ok) throw new Error(`audio fetch ${resp.status}`)
      const blob = await resp.blob()
      const buf = await blob.arrayBuffer()
      const mime = blob.type || 'audio/ogg'
      const res = await ipcRenderer.invoke(IPC_W.SpeechRecognize, arrayBufferToBase64(buf), mime)
      if (res?.success && res.text) {
        injectBadge(m.node, `🎤 ${res.text}`, m.direction, { source: 'whisper' })
      } else {
        injectBadge(m.node, `语音识别失败：${res?.error || ''}`, m.direction, { error: true })
      }
    } catch (e: any) {
      injectBadge(m.node, `语音识别失败：${String(e?.message || e)}`, m.direction, { error: true })
    } finally {
      this.translating.delete(m.node)
    }
  }
}
