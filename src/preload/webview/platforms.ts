/**
 * 平台适配器：WhatsApp / Telegram / Messenger 的消息定位与文本提取。
 * 各平台 DOM 结构会随官方更新变化，统一提供候选选择器 + 容错。
 */
import type { Platform } from '../../shared/types'
import { textHash } from './utils'
import { findBadge } from './badge'

export interface MessageInfo {
  /** 消息气泡/根节点（用于插入徽章与去重） */
  node: Element
  /** 提取到的纯文本 */
  text: string
  /** 发送者（群聊/频道名，无则空） */
  sender: string
  /** 方向 */
  direction: 'in' | 'out'
  /** 是否有语音 */
  hasAudio: boolean
}

export interface PlatformAdapter {
  platform: Platform
  matchHost(hostname: string): boolean
  /** 等待应用就绪（返回是否成功） */
  waitForApp(timeoutMs?: number): Promise<boolean>
  /** 是否已登录（未登录时不启动翻译扫描与按钮注入） */
  isLoggedIn(): boolean
  /** 扫描新消息（返回未处理的消息） */
  scanMessages(): MessageInfo[]
  /**
   * 当前可见消息中最后一条入站消息的时间（毫秒时间戳），无则 undefined。
   * 用于"X分钟前收到消息"：消息即使已被翻译处理过（scanMessages 为空）也要能取到时间。
   */
  lastInMessageTime?(): number | undefined
  /**
   * 页面当前是否存在入站消息节点（轻量判断）。
   * 兜底：时间解析不出时也按当前时间上报，避免"暂无消息"一直不变。
   */
  hasInMessage?(): boolean
  /** 输入框 */
  findInput(): HTMLElement | null
  /** 输入框的兄弟容器（用于注入按钮） */
  inputToolbar(): HTMLElement | null
  /** 当前会话的最近消息（用于 AI 回复），限制条数 */
  recentMessages(limit: number): { role: 'in' | 'out'; text: string }[]
  /** 统计未读消息总数（聊天列表中的未读角标数字求和，用于顶部账号角标） */
  scanUnread(): number
}

// ---------------- 内部工具 ----------------

function textOf(node: Element, selectors: string[]): string {
  for (const sel of selectors) {
    const els = node.querySelectorAll(sel)
    if (els.length) {
      const parts: string[] = []
      els.forEach((e) => {
        const t = (e.textContent || '').trim()
        if (t) parts.push(t)
      })
      if (parts.length) return parts.join(' ')
    }
  }
  return ''
}

function hasAny(node: Element, selectors: string[]): boolean {
  return selectors.some((sel) => node.querySelector(sel) !== null)
}

/**
 * 统计未读总数：对 root 内匹配 selector 的元素解析文本中的数字并求和。
 * 各平台聊天列表的未读角标用 textContent 中的数字表示，行内小徽章互不嵌套。
 */
function unreadFrom(selectors: string, root: ParentNode = document): number {
  let total = 0
  root.querySelectorAll(selectors).forEach((el) => {
    const digits = (el.textContent || '').replace(/[^\d]/g, '')
    if (!digits) return
    const n = parseInt(digits.slice(0, 3), 10)
    if (Number.isFinite(n) && n > 0) total += n
  })
  return total
}

const PROCESSED_ATTR = 'data-mt-processed'

/**
 * 是否已处理过。标记值存文本指纹：
 * 虚拟滚动列表会复用节点，若内容已变化则视为新消息，重新翻译。
 * 标记匹配但节点上已无翻译卡片（切换会话/虚拟滚动卸载后节点被复用或重渲染）
 * 也视为未处理，让 scheduleScan 重新翻译——命中本地缓存会立即恢复卡片，
 * 避免"切走再切回，已翻译的内容消失且不再自动翻译"。
 */
function isProcessed(node: Element, text: string): boolean {
  const own = node.getAttribute(PROCESSED_ATTR)
  if (own) return own === textHash(text) && !!findBadge(node)
  const sub = node.querySelector(`[${PROCESSED_ATTR}]`)
  return !!sub && !!findBadge(node)
}

export function markProcessed(node: Element, text: string): void {
  node.setAttribute(PROCESSED_ATTR, textHash(text))
}

/** 通用等待函数 */
function waitFor(cond: () => boolean, timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    const start = Date.now()
    const check = () => {
      if (cond()) {
        resolve(true)
        return
      }
      if (Date.now() - start > timeoutMs) {
        resolve(false)
        return
      }
      setTimeout(check, 300)
    }
    check()
  })
}

// ---------------- WhatsApp ----------------

/**
 * WhatsApp 新版（2025+）消息容器改为 hash 类名，不再有 message-in/out。
 * 但每条消息保留 div[data-id]，且接收消息靠左、发送消息靠右，用几何位置判断方向。
 */
function waMessageNodes(): NodeListOf<Element> {
  return document.querySelectorAll('#main div[data-id]')
}

function waDirection(node: Element): 'in' | 'out' {
  const main = document.querySelector('#main')
  if (!main) return 'in'
  const mr = main.getBoundingClientRect()
  // 用气泡内容（文本/媒体）定位：消息容器 div[data-id] 占满整行，中心与面板中心重合，无法区分方向
  const target = node.querySelector('.copyable-text') || node.querySelector('img[src^="blob:"], img[src^="data:"], video') || node
  const r = target.getBoundingClientRect()
  if (!mr.width || !r.width) return 'in'
  return r.left + r.width / 2 > mr.left + mr.width / 2 ? 'out' : 'in'
}

function waText(node: Element): string {
  return textOf(node, [
    '.selectable-text.copyable-text > span',
    '.selectable-text.copyable-text',
    'span.selectable-text span',
    '.copyable-text span',
  ])
}

function waSenderOf(node: Element): string {
  const prePlain = node.querySelector('.copyable-text[data-pre-plain-text]')
  if (prePlain) {
    const m = (prePlain.getAttribute('data-pre-plain-text') || '').match(/^\[[^\]]*\] ([^:]+):/)
    if (m) return m[1].trim()
  }
  const s = node.querySelector('header [title], header span[title], [data-testid="conversation-panel-header"] [title]')
  if (s) return (s.getAttribute('title') || '').trim()
  return ''
}

/**
 * 解析 Telegram 消息时间文本（如 "14:30"、"昨天 14:30"、"2024-05-31 14:30"、"5月31日 14:30"、"May 31"）。
 * 无法可靠解析时返回 undefined（不误导）。
 */
function parseTimeText(text: string): number | undefined {
  const s = (text || '').trim()
  if (!s) return undefined
  const timeM = s.match(/(\d{1,2}):(\d{2})/)
  if (!timeM) return undefined
  const hh = Number(timeM[1])
  const mm = Number(timeM[2])
  const now = new Date()
  // 具体日期：2024-05-31 / 2024年5月31日 / 2024/5/31
  const full = s.match(/(\d{4})[-/年](\d{1,2})[-/月](\d{1,2})/)
  if (full) {
    const ts = new Date(Number(full[1]), Number(full[2]) - 1, Number(full[3]), hh, mm).getTime()
    return Number.isFinite(ts) ? ts : undefined
  }
  // 月日：5月31日 / 05-31
  const md = s.match(/(\d{1,2})[-/月](\d{1,2})日?/)
  if (md) {
    const ts = new Date(now.getFullYear(), Number(md[1]) - 1, Number(md[2]), hh, mm).getTime()
    return Number.isFinite(ts) ? ts : undefined
  }
  // 昨天 / Yesterday
  if (/昨天|昨日|yesterday/i.test(s)) {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, hh, mm).getTime()
  }
  // 仅 HH:MM：默认今天，时间晚于当前则视为昨天
  let ts = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm).getTime()
  if (ts > Date.now()) ts -= 24 * 3600 * 1000
  return Number.isFinite(ts) ? ts : undefined
}

/**
 * WhatsApp 消息时间：优先解析 data-pre-plain-text 中的日期（如 "[10:30, 2025/5/31]"）。
 * 无日期时按今天（时间晚于当前则视为昨天，跨零点场景）。
 */
function waMessageTime(node: Element): number | undefined {
  const pre = node.querySelector('.copyable-text[data-pre-plain-text]')
  const attr = pre?.getAttribute('data-pre-plain-text') || ''
  const m = attr.match(/\[(\d{1,2}):(\d{2})(?:,\s*(\d{4})\/(\d{1,2})\/(\d{1,2}))?\]/)
  if (!m) return undefined
  const hh = Number(m[1])
  const mm = Number(m[2])
  let ts: number
  if (m[3]) {
    ts = new Date(Number(m[3]), Number(m[4]) - 1, Number(m[5]), hh, mm).getTime()
  } else {
    const now = new Date()
    ts = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm).getTime()
    if (ts > Date.now()) ts -= 24 * 3600 * 1000 // 晚于当前 → 昨天
  }
  return Number.isFinite(ts) ? ts : undefined
}

const whatsapp: PlatformAdapter = {
  platform: 'whatsapp',
  matchHost(hostname) {
    return hostname.includes('whatsapp')
  },
  waitForApp(timeout = 15000) {
    return waitFor(() => !!document.querySelector('.app, #app, .two'), timeout)
  },
  isLoggedIn() {
    // 登录页特征：landing 界面 / 二维码
    if (document.querySelector('.landing-wrapper, [data-testid="login-page"], .qr-wrapper')) return false
    return !!document.querySelector('.app .two, .two')
  },
  scanMessages() {
    const out: MessageInfo[] = []
    waMessageNodes().forEach((node) => {
      const text = waText(node)
      if (isProcessed(node, text)) return
      // 系统消息（群成员变动等）不翻译
      if (
        node.querySelector(
          '.message-system, span[data-icon="unread-low"], [aria-label*="系统消息"], [aria-label*="加入"], [aria-label*="退出"]'
        )
      ) {
        markProcessed(node, text)
        return
      }
      const hasAudio = hasAny(node, ['audio', 'div[role="button"] audio'])
      if (!text && !hasAudio) {
        markProcessed(node, text)
        return
      }
      out.push({
        node,
        text,
        sender: waSenderOf(node),
        direction: waDirection(node),
        hasAudio,
      })
    })
    return out
  },
  findInput() {
    return (
      document.querySelector('div[contenteditable="true"][data-tab="10"]') ||
      document.querySelector('.copyable-text.selectable-text[contenteditable="true"]') ||
      document.querySelector('footer div[contenteditable="true"]')
    )
  },
  inputToolbar() {
    const input = whatsapp.findInput()
    if (!input) return null
    return input.parentElement?.parentElement || null
  },
  recentMessages(limit) {
    const rows: { role: 'in' | 'out'; text: string }[] = []
    const nodes = waMessageNodes()
    for (let i = nodes.length - 1; i >= 0 && rows.length < limit; i--) {
      const text = waText(nodes[i])
      if (!text) continue
      rows.push({ role: waDirection(nodes[i]), text: text.slice(0, 400) })
    }
    return rows.reverse()
  },
  lastInMessageTime() {
    const nodes = waMessageNodes()
    for (let i = nodes.length - 1; i >= 0; i--) {
      if (waDirection(nodes[i]) !== 'in') continue
      const t = waMessageTime(nodes[i])
      if (t !== undefined) return t
    }
    return undefined
  },
  hasInMessage() {
    const nodes = waMessageNodes()
    for (let i = nodes.length - 1; i >= 0; i--) {
      if (waDirection(nodes[i]) === 'in') return true
    }
    return false
  },
  scanUnread() {
    const list = document.querySelector('#pane-side')
    if (!list) return 0
    // WhatsApp Web 聊天列表未读角标
    return unreadFrom('#pane-side [data-testid="unread-count"], #pane-side [aria-label*="unread"], #pane-side [aria-label*="未读"]', list)
  },
}

// ---------------- Telegram Web K ----------------

const telegram: PlatformAdapter = {
  platform: 'telegram',
  matchHost(hostname) {
    return hostname.includes('telegram') || hostname.includes('t.me')
  },
  waitForApp(timeout = 15000) {
    return waitFor(() => !!document.querySelector('.messages-layout, #column-center, .sidebar'), timeout)
  },
  isLoggedIn() {
    if (document.querySelector('.Auth, .auth-container, #auth-pages, .login-form, .auth-form')) return false
    return !!document.querySelector('.sidebar, .messages-layout, .Message')
  },
  scanMessages() {
    const out: MessageInfo[] = []
    // Telegram Web K 的消息节点是 .bubble；A 版是 .Message
    const nodes = document.querySelectorAll('.bubble, .Message')
    nodes.forEach((node) => {
      // K 版中 .Message 内还包含 .bubble，跳过外层，只处理气泡本身，避免同一消息重复
      if (node.classList.contains('Message') && node.querySelector('.bubble')) return
      const bubble = node.classList.contains('bubble') ? node : node
      // 克隆后移除时间戳、反应、查看数等元数据，只保留消息正文
      const bubbleClone = bubble.cloneNode(true) as Element
      bubbleClone.querySelectorAll('.time, .message-time, .reaction, .views, .post-views').forEach((n) => n.remove())
      const text = textOf(bubbleClone, [
        '.message-content .translatable-message',
        '.message-content .text',
        '.message-content',
        '.message',
        '.text',
      ])
      if (isProcessed(node, text)) return
      if (bubble.classList.contains('is-service')) {
        markProcessed(node, text)
        return
      }
      const hasAudio = hasAny(bubble, ['audio', '.voice', '.audio'])
      if (!text && !hasAudio) {
        markProcessed(node, text)
        return
      }
      const senderEl = bubble.querySelector('.message-title, .peer-title')
      out.push({
        node,
        text,
        sender: (senderEl?.textContent || '').trim(),
        direction: bubble.classList.contains('is-out') || bubble.classList.contains('out') || bubble.classList.contains('message-out') ? 'out' : 'in',
        hasAudio,
      })
    })
    return out
  },
  findInput() {
    return (
      document.querySelector('.input-message-input[contenteditable="true"]') ||
      document.querySelector('div[contenteditable="true"][data-placeholder]') ||
      document.querySelector('#editable-message-text')
    )
  },
  inputToolbar() {
    const input = telegram.findInput()
    if (!input) return null
    return input.parentElement?.parentElement || null
  },
  recentMessages(limit) {
    const rows: { role: 'in' | 'out'; text: string }[] = []
    const nodes = document.querySelectorAll('.bubble, .Message')
    nodes.forEach((node) => {
      const bubble = node.classList.contains('bubble') ? node : node.querySelector('.bubble') || node
      const text = textOf(bubble, ['.message-content .translatable-message', '.message-content .text', '.message', '.text'])
      if (!text) return
      rows.push({
        role: bubble.classList.contains('is-out') || bubble.classList.contains('out') || bubble.classList.contains('message-out') ? 'out' : 'in',
        text: text.slice(0, 400),
      })
    })
    return rows.slice(-limit)
  },
  lastInMessageTime() {
    const nodes = document.querySelectorAll('.bubble, .Message')
    const arr = Array.from(nodes)
    for (let i = arr.length - 1; i >= 0; i--) {
      const node = arr[i]
      if (node.classList.contains('Message') && node.querySelector('.bubble')) continue
      const bubble = node.classList.contains('bubble') ? node : node
      if (bubble.classList.contains('is-out') || bubble.classList.contains('out') || bubble.classList.contains('message-out')) continue
      const timeEl = bubble.querySelector('.time, .message-time')
      const t = parseTimeText(timeEl?.textContent || '')
      if (t !== undefined) return t
    }
    return undefined
  },
  hasInMessage() {
    const nodes = document.querySelectorAll('.bubble, .Message')
    const arr = Array.from(nodes)
    for (let i = arr.length - 1; i >= 0; i--) {
      const node = arr[i]
      if (node.classList.contains('Message') && node.querySelector('.bubble')) continue
      const bubble = node.classList.contains('bubble') ? node : node
      if (!(bubble.classList.contains('is-out') || bubble.classList.contains('out') || bubble.classList.contains('message-out'))) return true
    }
    return false
  },
  scanUnread() {
    // 策略 1：telegram-tt（Web K 版）聊天列表 .chat-list 内的未读角标 .chat-badge
    const chatList = document.querySelector('.chat-list') || document
    const n1 = unreadFrom('.chat-badge', chatList)
    if (n1 > 0) return n1
    // 策略 2：Web A 版（webogram）侧边栏 .dialogs 内的 .badge
    const dialogs = document.querySelector('.dialogs') || document
    const n2 = unreadFrom('.badge', dialogs)
    if (n2 > 0) return n2
    // 策略 3：通用兜底 —— 侧边栏内 class 含 badge 的"叶子"元素
    const root =
      document.querySelector('.chat-list, .sidebar-left-content, .dialogs, #column-left') || document
    const all = Array.from(root.querySelectorAll('[class*="badge"]'))
    // 只统计不被其他 badge 嵌套的叶子元素，避免父容器 + 子元素重复计算
    const leaves = all.filter((el) => !all.some((o) => o !== el && el.contains(o)))
    let total = 0
    leaves.forEach((el) => {
      const text = (el.textContent || '').trim()
      if (!text || text.length > 4) return
      const digits = text.replace(/[^\d]/g, '')
      if (!digits) return
      const n = parseInt(digits.slice(0, 3), 10)
      if (Number.isFinite(n) && n > 0) total += n
    })
    return total
  },
}

// ---------------- Messenger ----------------

/**
 * 新版 messenger.com 消息结构（本地取证，2026-09，实测对话级）：
 *   [role="log"][aria-label="与 X 的对话中的消息"]
 *     └ div.x1qjc9v5                       滚动视口外层（overflow:hidden）
 *        └ div[role="none"].x78zum5        滚动视口（overflow:auto，唯一子节点是内容容器）
 *           └ div.x78zum5.xdt5ytf          内容容器（20 个子节点 = 20 条消息）
 *              ├ div.html-div[role=presentation]   建群/加密提示等条目
 *              └ div（无属性）                单条消息行容器
 *                 └ div[data-virtualized=false]     该条消息本体（每条恰好一个）
 * 旧版每条消息带 data-testid="m-message"，新版已移除（取证 mMessage=0），
 * 故改为「带 data-virtualized 的节点」定位；旧 testid 保留为兜底（灰度/回滚时仍可用）。
 *
 * ⚠ 历史坑：曾按「[role="none"] 的直接子节点即消息行」定位，但 [role="none"] 实际是
 * 滚动视口，其唯一子节点是承载全部消息的内容容器 —— 整段对话被当成「一条消息」：
 * 文本被拼成一整块、翻译卡片被追加到容器末尾，表现为「翻译全部堆在聊天框底部」。
 */
function messengerLogRoot(): Element | null {
  return (
    document.querySelector('[role="log"]') ||
    document.querySelector('[data-pagelet="MWInboxDetail_MessageList"]') ||
    document.querySelector('[data-pagelet="MWMessageList"]')
  )
}

/** 当前会话的全部消息行（旧 testid 优先，命中则说明仍是旧版结构） */
function messengerMessageRows(): Element[] {
  // 旧版：[data-testid="m-message"]
  const legacy = document.querySelectorAll('[data-testid="m-message"]')
  if (legacy.length) return Array.from(legacy)

  const log = messengerLogRoot()
  if (!log) return []

  // 新版：每条消息本体带 FB 的 data-virtualized 标记（实测与消息条数 1:1）。
  // 以该节点为「消息行」，卡片插到它之后即落在该消息的行容器内部：
  // 既显示在这条消息正下方，又不作为列表项的兄弟进入 React 的 diff 范围。
  const virtualized = Array.from(log.querySelectorAll('[data-virtualized]'))
  if (virtualized.length) return virtualized

  // 兜底（更早的结构）：[role="none"] 的直接子节点即消息行。
  // 需先向下穿透「滚动视口 → 唯一子内容容器」的包装层，否则整段对话会被当作一条消息。
  let list: Element | null = log.querySelector('[role="none"]') || log.firstElementChild
  for (let i = 0; i < 3 && list; i++) {
    const ov = getComputedStyle(list).overflowY
    const divKids = Array.from(list.children).filter((el) => el.tagName === 'DIV')
    if ((ov !== 'auto' && ov !== 'scroll') || divKids.length !== 1) break
    list = divKids[0]
  }
  return list ? Array.from(list.children).filter((el) => el.tagName === 'DIV') : []
}

/** 去掉 Messenger 混在正文里的时间戳与「消息由 X 发送于…」无障碍描述 */
function stripMessengerNoise(text: string): string {
  return text
    .replace(/^(周[一二三四五六日]|\d{1,2}月\d{1,2}日)?\s*\d{1,2}:\d{2}\s*/, '')
    .replace(/[，,]?\s*(Enter，)?消息由[^：:]{0,24}?发送于[^：:]{0,40}[：:]/g, '')
    .replace(/\s*(You sent|Sent by you)[^：:]{0,40}[：:]/gi, '')
    .trim()
}

/** 系统提示（端到端加密声明、入群/建群提示等）不是聊天内容，不参与翻译 */
const MESSENGER_SYSTEM_TEXT =
  /^(消息和通话将通过端到端加密|端到端加密|已开启端到端加密|你创建了|你加入了|你退出了|你更改了|Messages and calls are end-to-end encrypted|You created|You joined|You left|You changed)/

/** 单条消息的正文：优先 dir="auto" 文本块，失败再退化为「气泡内最深文本叶子」 */
function messengerRowText(row: Element): string {
  const dirText = textOf(row, ['div[dir="auto"]', 'span[dir="auto"]'])
  if (dirText) return stripMessengerNoise(dirText)
  // 兜底：正文气泡有背景色，只探前 12 个候选，避免 getComputedStyle 遍历带来的卡顿
  const candidates = Array.from(row.querySelectorAll<HTMLElement>('div')).slice(0, 12)
  const bubble = candidates.find((el) => {
    const bg = getComputedStyle(el).backgroundColor
    return !!bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)'
  })
  const scope: Element = bubble || row
  const leaves: string[] = []
  scope.querySelectorAll('div, span').forEach((el) => {
    if (el.children.length) return
    const t = (el.textContent || '').trim()
    if (!t) return
    // 无障碍描述（含发送者/时间，例如「Enter，消息由你发送于…：你好」）整段丢弃，
    // 否则其中的正文副本会被重复计入
    if (/消息由|发送于|You sent|Sent by you/i.test(t)) return
    leaves.push(t)
  })
  const cleaned = leaves
    .map((t) => t.replace(/^(周[一二三四五六日]|\d{1,2}月\d{1,2}日)?\s*\d{1,2}:\d{2}\s*/, '').trim())
    .filter(Boolean)
  return stripMessengerNoise(cleaned.join(' '))
}

/** 方向判定：自己的消息（右对齐）为 out */
function messengerIsOut(row: Element): boolean {
  if (row.closest('[data-testid="m-message-own"]')) return true
  const probe = (row.getAttribute('aria-label') || '') + ' ' + (row.textContent || '').slice(0, 300)
  if (/消息由你发送|你已发送|You sent|Sent by you/i.test(probe)) return true
  // 兜底：气泡相对行容器明显靠右
  const rect = row.getBoundingClientRect()
  const inner = row.querySelector<HTMLElement>('div')
  if (rect.width > 0 && inner) {
    const ir = inner.getBoundingClientRect()
    if (ir.width > 0) return ir.left - rect.left > rect.width * 0.35
  }
  return false
}

const messenger: PlatformAdapter = {
  platform: 'messenger',
  matchHost(hostname) {
    return hostname.includes('messenger') || hostname.includes('facebook')
  },
  waitForApp(timeout = 15000) {
    return waitFor(
      () =>
        !!document.querySelector(
          '[role="log"], [data-pagelet^="MW"], [data-testid="m-message"], div[contenteditable="true"], .messaging, #facebook'
        ),
      timeout
    )
  },
  isLoggedIn() {
    if (document.querySelector('#login_form, [data-testid="login_form"], .login-form, [data-testid="login-page"]')) return false
    // 进入会话后必然有可编辑输入框；收件箱列表页也算已登录（未读角标/后台扫描需要）。
    // 不依赖旧版消息节点 m-message（新版 DOM 可能已移除该 testid，导致 isLoggedIn 永远 false）。
    return !!document.querySelector(
      'div[contenteditable="true"][role="textbox"], div.notranslate[contenteditable="true"], [data-lexical-editor="true"], [role="log"], [data-testid="m-message"], .messaging, [aria-label*="Chats"], [aria-label*="聊天"]'
    )
  },
  scanMessages() {
    const out: MessageInfo[] = []
    messengerMessageRows().forEach((node) => {
      const text = messengerRowText(node)
      if (isProcessed(node, text)) return
      const hasAudio = hasAny(node, ['audio'])
      if (!text && !hasAudio) {
        markProcessed(node, text)
        return
      }
      // 系统提示直接标记为已处理，避免反复尝试翻译
      if (text && MESSENGER_SYSTEM_TEXT.test(text)) {
        markProcessed(node, text)
        return
      }
      out.push({ node, text, sender: '', direction: messengerIsOut(node) ? 'out' : 'in', hasAudio })
    })
    return out
  },
  findInput() {
    return (
      document.querySelector('div[contenteditable="true"][role="textbox"]') ||
      document.querySelector('div.notranslate[contenteditable="true"]') ||
      document.querySelector('[contenteditable="true"][data-lexical-editor="true"]') ||
      document.querySelector('div[contenteditable="true"][data-lexical-editor="true"]')
    )
  },
  inputToolbar() {
    const input = messenger.findInput()
    if (!input) return null
    return input.parentElement?.parentElement || null
  },
  recentMessages(limit) {
    const rows: { role: 'in' | 'out'; text: string }[] = []
    messengerMessageRows().forEach((node) => {
      const text = messengerRowText(node)
      if (!text || MESSENGER_SYSTEM_TEXT.test(text)) return
      rows.push({ role: messengerIsOut(node) ? 'out' : 'in', text: text.slice(0, 400) })
    })
    return rows.slice(-limit)
  },
  scanUnread() {
    const root = document.querySelector('[role="navigation"], [aria-label="Chats"], [aria-label="聊天"]') || document
    // Messenger 对话列表未读角标（data-testid 优先级高，失败时兜底找纯数字小角标）
    const direct = unreadFrom('[data-testid="m-chat-item-unread-count"], [data-testid="chat-bubble-unread-count"], [data-testid="conversation-unread"]', root)
    if (direct > 0) return direct
    return unreadFrom('[role="button"] span[dir="auto"]', root)
  },
}

export const adapters: PlatformAdapter[] = [whatsapp, telegram, messenger]

/** 根据 hostname 选择适配器 */
export function detectAdapter(): PlatformAdapter | null {
  const host = location.hostname.toLowerCase()
  for (const a of adapters) {
    if (a.matchHost(host)) return a
  }
  return null
}
