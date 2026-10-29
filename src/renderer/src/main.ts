/**
 * 渲染层主逻辑 —— 财运亨通翻译器
 * 布局：顶部栏 + 世界时钟 + 分类标签 + 账号条 + 主视图（主页 / 设置 / WebView 容器）
 * 能力：多账号管理、WebView 会话、Signal 窗口嵌入、手动/自动翻译、性能监控
 */
import {
  DEFAULT_SETTINGS,
  type Account,
  type CacheStats,
  type MemoryInfo,
  type LineState,
  type Platform,
  type Settings,
  type SignalState,
  type UpdaterState,
  type UpdaterStatus,
  type WebviewConfig,
  type WebviewUnread,
} from '../../shared/types'

/* ==================== 工具 ==================== */
const $ = <T extends HTMLElement = HTMLElement>(sel: string): T | null =>
  document.querySelector<T>(sel)
const $$ = <T extends HTMLElement = HTMLElement>(sel: string): T[] =>
  Array.from(document.querySelectorAll<T>(sel))

const esc = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const PLATFORM_LABEL: Record<Platform, string> = {
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  messenger: 'Messenger',
  signal: 'Signal',
  line: 'LINE',
}

const PLATFORM_COLOR: Record<Platform, string> = {
  whatsapp: '#25D366',
  telegram: '#2196F3',
  messenger: '#0084FF',
  signal: '#6C4AB6',
  line: '#06C755',
}

/** 平台品牌图标（账号头像 / 分类标签用，fill:currentColor 随容器着色） */
const PLATFORM_ICONS: Record<Platform, string> = {
  whatsapp:
    '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>',
  telegram:
    '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71l-4.14-3.06-2 1.93c-.24.23-.42.42-.82.42z"/></svg>',
  messenger:
    '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 0C5.24 0 0 4.95 0 11.64c0 3.5 1.44 6.53 3.78 8.62.2.18.32.43.32.7l.06 2.14c.02.68.72 1.13 1.35.86l2.39-1.05c.21-.09.44-.11.66-.05 1.1.3 2.27.47 3.44.47 6.76 0 12-4.95 12-11.64C24 4.95 18.76 0 12 0zm7.2 8.93l-3.52 5.59c-.56.89-1.77 1.11-2.61.48l-2.8-2.1a.72.72 0 00-.86 0l-3.78 2.87c-.5.38-1.16-.22-.82-.75l3.52-5.59c.56-.89 1.77-1.11 2.61-.48l2.8 2.1c.26.19.6.19.86 0l3.78-2.87c.5-.38 1.16.22.82.75z"/></svg>',
  signal:
    '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13zm0 2.25a4.25 4.25 0 1 0 0 8.5 4.25 4.25 0 0 0 0-8.5z"/></svg>',
  line:
    '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 2C6.48 2 2 6.24 2 10.97c0 2.72 1.4 5.13 3.62 6.72-.08.51-.34 1.54-.56 2.07-.13.32.09.58.4.4 1.48-.82 2.82-1.71 3.3-2.07.71.17 1.47.26 2.24.26 5.52 0 10-4.23 10-7.38S17.52 2 12 2zm-.8 9.05c0 .28-.22.5-.5.5h-2.7v.75h2.42c.27 0 .5.22.5.5s-.22.5-.5.5H7.66c-.27 0-.5-.22-.5-.5V8.56c0-.28.22-.5.5-.5h3.44c.27 0 .5.22.5.5s-.22.5-.5.5H8.16v1.24h2.55c.27 0 .5.22.5.5-.01.25.01.25-.01.25zm4.1 2.03c0 .27-.22.5-.5.5s-.5-.22-.5-.5V9.06l-1.6 2.3c-.1.15-.27.24-.45.24h-.15c-.18 0-.35-.09-.45-.24l-1.6-2.3v4.02c0 .27-.22.5-.5.5s-.5-.22-.5-.5V8.56c0-.21.1-.4.27-.5.16-.11.37-.11.53 0l2.35 3.36 2.35-3.36c.16-.12.37-.12.53 0 .17.11.27.29.27.5v4.52z"/></svg>',
}

/** 分类标签图标（"全部"用网格，其余复用平台图标，14px） */
const CATEGORY_ICONS: Record<'all' | Platform, string> = {
  all:
    '<svg viewBox="0 0 24 24" width="14" height="14"><path fill="currentColor" d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z"/></svg>',
  whatsapp: PLATFORM_ICONS.whatsapp,
  telegram: PLATFORM_ICONS.telegram,
  messenger: PLATFORM_ICONS.messenger,
  signal: PLATFORM_ICONS.signal,
  line: PLATFORM_ICONS.line,
}

/* WebView 元素（Electron <webview> 标签在 TS 中无原生类型） */
interface MtWebview extends HTMLElement {
  src: string
  preload: string
  partition: string
  getURL(): string
  reload(): void
  /** 停止当前导航（guest 未就绪时可能不存在，调用方需容错） */
  stop?(): void
  openDevTools(): void
  executeJavaScript(code: string): Promise<unknown>
  send(channel: string, ...args: unknown[]): void
  /** dom-ready 之后才可用；未就绪时调用会抛异常（外层已 try/catch） */
  getWebContentsId?(): number
}

/* ==================== 全局状态 ==================== */
let accounts: Account[] = []
let settings: Settings = { ...DEFAULT_SETTINGS }
let activeAccountId: string | null = null
let currentCategory: 'all' | Platform = 'all'
/** 当前顶层视图：home=首页 / settings=设置 / account=账号会话页（webview 容器） */
let currentView: 'home' | 'settings' | 'account' = 'home'
let webviewWrappers = new Map<string, HTMLElement>() // accountId -> wrapper
let signalStateMap = new Map<string, SignalState>()
let lineStateMap = new Map<string, LineState>()
/** 每个 Signal 账号的嵌入补试定时器（同一账号只保留一条补试链，避免切来切去叠加） */
let signalRetryTimers = new Map<string, number>()
/** 每个 Signal 账号的补试链是否在跑（含 await embed 期间，防止并发重复补试） */
let signalRetryActive = new Map<string, boolean>()
// 账号级翻译开关（webview 顶部工具栏）
let accountAutoTranslate = new Map<string, boolean>()
let accountSendTranslate = new Map<string, boolean>()
let perfHistory: { time: string; cpu: number; rss: number }[] = []
let translatePanelOpen = false
let pendingPlatform: Platform | null = null
let relocateTimer: number | null = null
/** 同一帧内的多次布局变化只上报一次 */
let embedRaf = 0
/** 观察嵌入区自身尺寸变化（侧栏折叠等不会改变 window 尺寸的场景） */
let embedAreaObserver: ResizeObserver | null = null
let embedAreaTarget: HTMLElement | null = null
let embedResizeBound = false
let translateBusy = false
let topBarTimer: number | null = null
let clockTimer: number | null = null
let perfTimer: number | null = null
// 等待后台加载完成后才切换的账号（避免切换时会话先隐藏再显示）
let pendingSwitchAccountId: string | null = null

/* ==================== 多开内存管理（LRU 休眠） ==================== */
/**
 * 常驻 webview 上限：超过后把「最久未访问」的账号 webview 温和卸载（休眠）以释放内存。
 * 6 表示 6 个以内完全不受影响（日常多开档位）；被休眠账号的登录态保留在 persist: 分区里，
 * 切回时重新加载页面即可，**不需要重新登录**（代价只是几秒加载）。
 */
const MAX_RESIDENT_WEBVIEWS = 6
/** 内存压力 high：收紧到 4 个常驻 */
const MAX_RESIDENT_UNDER_PRESSURE = 4
/** 内存压力 critical：只保留 2 个常驻 */
const MAX_RESIDENT_UNDER_CRITICAL = 2
/** 账号最近一次进入前台的时刻（accountId -> 时间戳），休眠时按此排序淘汰 */
const accountLastAccess = new Map<string, number>()
/** 切卡「等后台加载完再切」的超时兜底定时器：超时后强制切界面，避免点了没反应 */
let pendingSwitchTimer: number | null = null
/** 兜底超时：超过这个时间还没 dom-ready，就先切过去（页面继续在后台加载） */
const PENDING_SWITCH_TIMEOUT_MS = 12000

/* ==================== Toast ==================== */
function showToast(msg: string, type: 'success' | 'error' | 'info' = 'info'): void {
  const toast = $('#toast')
  if (!toast) return
  toast.textContent = msg
  toast.className = `toast visible ${type}`
  clearTimeout((toast as HTMLElement & { _t?: number })._t)
  ;(toast as HTMLElement & { _t?: number })._t = window.setTimeout(() => {
    toast.className = 'toast hidden'
  }, 2600)
}

/* ==================== 视图切换 ==================== */
function switchView(view: 'home' | 'settings'): void {
  currentView = view
  $$('.view').forEach((v) => v.classList.toggle('active', v.id === `view-${view}`))
  $('#webview-container')?.classList.remove('active')
  $$<HTMLElement>('.nav-btn[data-view]').forEach((b) =>
    b.classList.toggle('active', b.dataset.view === view),
  )
  // 离开账号视图：所有 guest 都不可见，全部暂停扫描并开后环节流（多开省 CPU）
  pauseAllWebviews()
  // 离开账号视图时，将嵌入中的 Signal / LINE 还原为独立窗口
  if (activeAccountId) {
    const acc = accounts.find((a) => a.id === activeAccountId)
    if (acc?.platform === 'signal') {
      // 必须先掐断补试链：detach 会推一次 onState(running)，订阅里会立刻安排
      // 1200ms 后重试 embed，把刚隐藏的原生窗口又 show 出来盖住首页/设置页。
      cancelSignalRetry(acc.id)
      const st = signalStateMap.get(acc.id)
      if (st?.status === 'embedded') {
        void window.api.signal.detach(acc.id)
      }
    } else if (acc?.platform === 'line') {
      const st = lineStateMap.get(acc.id)
      if (st?.status === 'embedded') {
        void window.api.line.detach(acc.id)
      }
    }
  }
}

/** 显示 WebView 容器（隐藏主页/设置视图） */
function showWebview(): void {
  currentView = 'account'
  $$('.view').forEach((v) => v.classList.remove('active'))
  $('#webview-container')?.classList.add('active')
  $$<HTMLElement>('.nav-btn[data-view]').forEach((b) => b.classList.remove('active'))
}

/* ==================== 多开性能：后台账号节流 ==================== */
/**
 * 动态调整某账号 guest 的后台节流，并通知 guest 暂停/恢复 DOM 扫描。
 * 多开不卡死的关键：非激活账号既被 Chromium 降频（setBackgroundThrottling），
 * 又被显式暂停扫描（mt-host-pause），不再和前台账号抢 CPU。
 */
function applyWebviewRuntimeThrottle(accountId: string, throttle: boolean): void {
  const wv = webviewWrappers.get(accountId)?.querySelector<MtWebview>('webview')
  if (!wv) return
  // 1) guest 进程级后台节流（dom-ready 前 getWebContentsId 会抛异常，已兜底）
  try {
    const id = wv.getWebContentsId?.()
    if (id) void window.api.webview.setThrottle(id, throttle).catch(() => undefined)
  } catch {
    /* guest 尚未就绪 */
  }
  // 2) 通知注入脚本停/启扫描
  try {
    wv.send(throttle ? 'mt-host-pause' : 'mt-soft-wake', {})
  } catch {
    /* guest 尚未就绪 */
  }
}

/** 除当前激活账号外，全部暂停并开启后台节流 */
function pauseAllInactiveWebviews(): void {
  webviewWrappers.forEach((_wrapper, id) => {
    if (id === activeAccountId) return
    applyWebviewRuntimeThrottle(id, true)
  })
}

/** 暂停全部（窗口最小化 / 离开账号视图：没有任何 guest 需要实时工作） */
function pauseAllWebviews(): void {
  webviewWrappers.forEach((_wrapper, id) => applyWebviewRuntimeThrottle(id, true))
}

/** 恢复当前激活账号满速（窗口恢复可见 / 回到账号视图时） */
function resumeActiveWebview(): void {
  if (!activeAccountId) return
  applyWebviewRuntimeThrottle(activeAccountId, false)
}

/* ==================== 多开内存：LRU 休眠 ==================== */
/** 记录账号最近一次进入前台的时刻（休眠淘汰排序依据） */
function touchAccount(accountId: string): void {
  accountLastAccess.set(accountId, Date.now())
}

/** 只有通用 <webview> 账号可休眠；Signal / LINE 是宿主上的原生窗口，不参与 */
function isSuspendable(accountId: string): boolean {
  const acc = accounts.find((a) => a.id === accountId)
  return Boolean(acc && acc.platform !== 'signal' && acc.platform !== 'line')
}

/**
 * 休眠一个账号：温和卸载它的 <webview>（先让注入脚本静止 → 导到 about:blank → 摘除节点）。
 * 与「删除账号」的区别：不删账号数据、不清分区 —— persist: 分区保留登录态，
 * 内存释放效果等同于关闭该会话；切回时 activateAccount 会重建节点并重新加载。
 */
async function suspendWebview(accountId: string, reason: 'lru' | 'pressure'): Promise<void> {
  if (accountId === activeAccountId) return
  if (pendingSwitchAccountId === accountId) return
  if (!webviewWrappers.has(accountId)) return
  if (!isSuspendable(accountId)) return
  window.api.dbgSync(`mem:suspend:${reason} ${accountId}`)
  await detachWebviewNode(accountId, 'mem')
  accountLastAccess.delete(accountId)
}

/**
 * 把常驻 webview 压到 limit 个：优先休眠「最久未进入前台」的账号。
 * 当前激活账号与正在等待切换的账号永不休眠，避免切卡过程中被拆掉。
 *
 * 名额只统计「可休眠的通用 webview 账号」：Signal / LINE 的原生窗口 wrapper 同样在
 * webviewWrappers 里，但它们既不能被休眠（isSuspendable=false），也不占用 <webview>
 * 渲染进程 —— 若把它们算进 size，几个 Signal + 一个 LINE 就会把 6 个额度占满，
 * 结果每次切账号都把仅有的 WhatsApp/Telegram/Messenger 当溢出对象拆掉（表现为
 * 「切回这些账号总是重新加载，只有 LINE 不会」）。
 */
function enforceResidentBudget(limit: number): void {
  const resident = [...webviewWrappers.keys()].filter(isSuspendable)
  const overflow = resident.length - limit
  if (overflow <= 0) return
  const candidates = resident.filter(
    (id) => id !== activeAccountId && id !== pendingSwitchAccountId,
  )
  if (candidates.length === 0) return
  candidates.sort((a, b) => (accountLastAccess.get(a) ?? 0) - (accountLastAccess.get(b) ?? 0))
  const victims = candidates.slice(0, Math.min(overflow, candidates.length))
  victims.forEach((id) => void suspendWebview(id, 'lru'))
  // 不再弹提示：从第 7 个账号起每次添加都会触发一次自动休眠，这个 toast 会盖住
  // 「账号已添加」等成功反馈；休眠本身是无感的后台行为（登录态保留、切回即时恢复），
  // 无需打扰用户。需要排查时看 debug.log 里的 mem:suspend:lru 记录。
}

/* ==================== 切卡兜底 ==================== */
function clearPendingSwitchTimer(): void {
  if (pendingSwitchTimer === null) return
  clearTimeout(pendingSwitchTimer)
  pendingSwitchTimer = null
}

/**
 * 切卡兜底：首次加载走「后台加载完再切」时，若 guest 迟迟不返回 dom-ready
 * （网络慢、页面被站点阻塞、did-fail-load 被忽略），界面就会一直停在上一个账号 ——
 * 用户感知为「点了切换没反应/切不过去」。这里加硬超时：到点先切界面，页面继续后台加载。
 */
function armPendingSwitchFallback(accountId: string): void {
  clearPendingSwitchTimer()
  pendingSwitchTimer = window.setTimeout(() => {
    pendingSwitchTimer = null
    if (pendingSwitchAccountId !== accountId) return
    pendingSwitchAccountId = null
    // 强制完成切换：把目标 wrapper 置为可见（页面可能还在加载，会显示自己的加载占位）
    webviewWrappers.forEach((w) => w.classList.remove('active'))
    webviewWrappers.get(accountId)?.classList.add('active')
    applyWebviewRuntimeThrottle(accountId, false)
    pauseAllInactiveWebviews()
    renderAccountList()
    window.api.dbgSync(`switch:fallback-timeout ${accountId}`)
    showToast('该账号加载较慢，已先切换界面（正在后台继续加载）', 'info')
  }, PENDING_SWITCH_TIMEOUT_MS)
}

/* ==================== 世界时钟 ==================== */
function updateWorldClocks(): void {
  $$<HTMLElement>('.world-clock-card[data-tz]').forEach((card) => {
    const tz = card.dataset.tz
    if (!tz) return
    const timeEl = card.querySelector<HTMLElement>('.world-clock-time')
    const dateEl = card.querySelector<HTMLElement>('.world-clock-date')
    if (!timeEl || !dateEl) return
    const now = new Date()
    try {
      timeEl.textContent = new Intl.DateTimeFormat('zh-CN', {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(now)
      dateEl.textContent = new Intl.DateTimeFormat('zh-CN', {
        timeZone: tz,
        month: 'numeric',
        day: 'numeric',
        weekday: 'short',
      }).format(now)
    } catch {
      /* 时区无效时保持占位 */
    }
  })
}

/* ==================== 顶部栏 / 性能监控 ==================== */
let lastPerfSample = 0

async function refreshTopBar(): Promise<void> {
  try {
    const [mem, cache] = await Promise.all([window.api.getMemoryInfo(), window.api.cacheStats()])
    const memEl = $('#memory-text')
    const cpuEl = $('#cpu-text')
    if (memEl) memEl.textContent = `内存: ${mem.rss}MB`
    if (cpuEl) {
      cpuEl.textContent = `CPU: ${mem.cpu}%`
      // CPU 分级配色：高负载红色系 / 中等橙色系 / 空闲淡绿色
      cpuEl.classList.remove('cpu-low', 'cpu-mid', 'cpu-high')
      cpuEl.classList.add(mem.cpu >= 60 ? 'cpu-high' : mem.cpu >= 30 ? 'cpu-mid' : 'cpu-low')
    }
    const cacheEl = $('#cache-text')
    if (cacheEl) cacheEl.textContent = `缓存: ${cache.size}条`
    const hitEl = $('#hitrate-text')
    if (hitEl) {
      const total = cache.hits + cache.misses
      const rate = total > 0 ? Math.round((cache.hits / total) * 100) : 0
      hitEl.textContent = `命中率: ${rate}%`
      // 命中率分级配色：>=80 绿 / >=50 橙 / 其余红，无数据半透明
      hitEl.classList.remove('hitrate-good', 'hitrate-mid', 'hitrate-bad', 'hitrate-cold')
      if (total === 0) hitEl.classList.add('hitrate-cold')
      else if (rate >= 80) hitEl.classList.add('hitrate-good')
      else if (rate >= 50) hitEl.classList.add('hitrate-mid')
      else hitEl.classList.add('hitrate-bad')
    }
    const sm = $('#settings-memory')
    if (sm) sm.textContent = `${mem.rss}MB`
    const now = Date.now()
    if (now - lastPerfSample > 5000) {
      lastPerfSample = now
      renderPerfPanel(mem)
      perfHistory.push({
        time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
        cpu: mem.cpu,
        rss: mem.rss,
      })
      if (perfHistory.length > 60) perfHistory.shift()
    }
  } catch {
    /* 主进程尚未就绪时忽略 */
  }
}

function renderPerfPanel(mem: MemoryInfo): void {
  const cpuBar = $('#perf-cpu-bar')
  if (cpuBar) cpuBar.style.width = `${Math.min(100, mem.cpu)}%`
  const cpuText = $('#perf-cpu')
  if (cpuText) cpuText.textContent = `CPU: ${mem.cpu}%`
  const memBar = $('#perf-mem-bar')
  const memPct = mem.totalMem > 0 ? Math.round((mem.rss / mem.totalMem) * 100) : 0
  if (memBar) memBar.style.width = `${Math.min(100, memPct)}%`
  const rssEl = $('#perf-rss')
  if (rssEl) {
    // 同时给出触发释放的阈值：超过它主进程会推送内存压力、休眠不活跃账号
    rssEl.textContent = mem.thresholdMB
      ? `RSS: ${mem.rss}MB / 阈值 ${mem.thresholdMB}MB`
      : `RSS: ${mem.rss}MB`
  }
  const heapEl = $('#perf-heap')
  if (heapEl) heapEl.textContent = `${mem.heapUsed}/${mem.heapTotal}MB`
  const extEl = $('#perf-external')
  if (extEl) extEl.textContent = `${mem.external}MB`
  const lagEl = $('#perf-el-lag')
  if (lagEl) {
    const t0 = performance.now()
    setTimeout(() => {
      if (lagEl) lagEl.textContent = `${Math.round(performance.now() - t0)}ms`
    }, 0)
  }
  const procEl = $('#perf-proc-count')
  if (procEl) procEl.textContent = String(mem.processCount)
  const totalEl = $('#perf-total-mem')
  if (totalEl) totalEl.textContent = `${mem.totalMem}MB`
  const table = $('#perf-process-table')
  if (table && mem.processes.length > 0) {
    table.innerHTML =
      '<tr style="opacity:.7"><th>PID</th><th>类型</th><th>CPU</th><th>内存</th></tr>' +
      mem.processes
        .map(
          (p) =>
            `<tr><td>${p.pid}</td><td>${esc(p.type)}</td><td>${p.cpu}%</td><td>${p.memory}MB</td></tr>`,
        )
        .join('')
  }
}

function exportPerfHistory(): void {
  const blob = JSON.stringify(perfHistory, null, 2)
  void navigator.clipboard.writeText(blob).then(
    () => showToast('性能历史已复制到剪贴板', 'success'),
    () => showToast('复制失败', 'error'),
  )
}

/* ==================== 分类标签 ==================== */
function renderCategoryTabs(): void {
  const list = $('#category-tabs-list')
  if (!list) return
  // 固定渲染全部四种平台类型（账号数为 0 时仍显示，便于快速添加/切换）
  const cats: ('all' | Platform)[] = ['all', 'whatsapp', 'telegram', 'signal', 'messenger', 'line']
  list.innerHTML = cats
    .map((cat) => {
      const count =
        cat === 'all'
          ? accounts.filter((a) => !a.isHidden).length
          : accounts.filter((a) => a.platform === cat && !a.isHidden).length
      return `<button class="category-tab ${currentCategory === cat ? 'active' : ''}" data-cat="${cat}">
        <span class="cat-tab-icon">${CATEGORY_ICONS[cat]}</span>
        <span class="cat-tab-label">${cat === 'all' ? '全部' : PLATFORM_LABEL[cat]}</span>
        <span class="cat-tab-count">${count}</span>
      </button>`
    })
    .join('')
  $$<HTMLElement>('.category-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentCategory = (btn.dataset.cat as 'all' | Platform) || 'all'
      renderCategoryTabs()
      renderAccountList()
    })
  })
}

/* ==================== 账号条 ==================== */
/** webview 账号未读数（注入脚本统计上报） */
const accountUnread = new Map<string, number>()
/** webview 账号最后收到消息时间（注入脚本检测入站消息上报，渲染层显示"X分钟前收到消息"） */
const accountActivity = new Map<string, number>()

function accountBadgeText(acc: Account): string {
  const n =
    acc.platform === 'signal'
      ? signalStateMap.get(acc.id)?.unread || 0
      : acc.platform === 'line'
        ? lineStateMap.get(acc.id)?.unread || 0
        : accountUnread.get(acc.id) || 0
  return n > 0 ? (n > 99 ? '99+' : String(n)) : ''
}

/** 相对时间：刚刚 / X分钟前 / X小时前 / X天前 / 日期 */
function formatRelativeTime(ts?: number | null): string {
  if (!ts) return ''
  const diff = Date.now() - ts
  if (diff < 60_000) return '刚刚'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}分钟前`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}小时前`
  if (diff < 7 * 86_400_000) return `${Math.floor(diff / 86_400_000)}天前`
  const d = new Date(ts)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

/** 账号最后消息时间：注入脚本实时值优先，回退到持久化字段 */
function activityLastTime(acc: Account): number | undefined {
  return accountActivity.get(acc.id) ?? acc.lastMessageTime
}

/** 账号卡片时间行文案：signal/line 显示运行状态，webview 显示最后消息相对时间（无消息时显示占位，避免空白） */
function accountTimerText(acc: Account): string {
  if (acc.platform === 'signal') return signalStatusText(acc.id)
  if (acc.platform === 'line') return lineStatusText(acc.id)
  return formatRelativeTime(activityLastTime(acc)) || '暂无消息'
}

/** 账号卡片时间行加载状态（切换会话 / 刷新时显示"正在加载..."，加载完成清除） */
function setAccountLoadingState(accountId: string, text: string): void {
  const el = document.getElementById(`timer-${accountId}`)
  if (!el) return
  if (text) {
    el.dataset.loading = '1'
    el.textContent = text
    el.classList.add('active')
  } else {
    delete el.dataset.loading
    const acc = accounts.find((a) => a.id === accountId)
    el.textContent = acc ? accountTimerText(acc) : ''
    el.classList.toggle('active', Boolean(acc && accountTimerText(acc)))
  }
}



/** 每分钟刷新所有账号卡片的相对时间 */
let messageTimer: number | null = null
function startMessageTimer(): void {
  if (messageTimer) return
  messageTimer = window.setInterval(() => {
    $$<HTMLElement>('.account-timer').forEach((el) => {
      if (el.dataset.loading === '1') return
      const card = el.closest<HTMLElement>('.account-card')
      const id = card?.dataset.accountId
      if (!id) return
      const acc = accounts.find((a) => a.id === id)
      if (!acc) return
      el.textContent = accountTimerText(acc)
      el.classList.toggle('active', Boolean(accountTimerText(acc)))
    })
  }, 60_000)
}

function createAccountCardHTML(acc: Account): string {
  const active = activeAccountId === acc.id ? ' active actions-open' : ''
  const pinned = acc.pinned ? ' pinned' : ''
  const badge = accountBadgeText(acc)
  // 头像：优先显示账号保存的头像图片，否则显示平台品牌图标
  const avatarHtml = acc.avatarUrl
    ? `<img src="${esc(acc.avatarUrl)}" alt="">`
    : PLATFORM_ICONS[acc.platform]
  // 子标题：账号所属的类型名称
  // 时间行：signal 显示运行状态，webview 显示"X分钟前收到消息"（加载中会被 setAccountLoadingState 覆盖）
  const timerText = accountTimerText(acc)
  return `<div class="account-card${active}${pinned}" data-account-id="${esc(acc.id)}">
    <div class="account-avatar ${acc.platform}">${avatarHtml}</div>
    <div class="account-info">
      <div class="account-name">${esc(acc.name)}</div>
      <div class="account-type ${acc.platform}">${PLATFORM_LABEL[acc.platform]}</div>
      <div class="account-timer${timerText ? ' active' : ''}" id="timer-${esc(acc.id)}">${esc(timerText)}</div>
    </div>
    ${badge ? `<div class="account-badge visible">${badge}</div>` : '<div class="account-badge"></div>'}
    <div class="account-actions">
      <button class="btn-account-action" data-action="rename" title="重命名">
        <svg viewBox="0 0 24 24" width="14" height="14"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.996.996 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/></svg>
      </button>
      <button class="btn-account-action" data-action="pin" title="${acc.pinned ? '取消置顶' : '置顶'}">
        <svg viewBox="0 0 24 24" width="14" height="14"><path d="M17 4h-8V2H7v2H4v2h11.5l-1.6 4H5v2h1.8l1.6 4H5v2h7v3h2v-3h2v-2h-2l-1.6-4H17V8h1V4h-1z" fill="currentColor"/></svg>
      </button>
      <button class="btn-account-action danger" data-action="delete" title="删除账号">
        <svg viewBox="0 0 24 24" width="14" height="14"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/></svg>
      </button>
    </div>
  </div>`
}

/** 账号列表结构签名（内容一致则跳过整表重建） */
let lastAccountListSignature = ''
function accountListSignatureOf(sorted: Account[]): string {
  const body = sorted
    .map(
      (a) =>
        `${a.id}|${a.name}|${a.platform}|${a.pinned ? 1 : 0}|${a.avatarUrl || ''}|${accountBadgeText(a)}`,
    )
    .join('§')
  return `${body}#${activeAccountId || ''}#${currentCategory}`
}

function renderAccountList(): void {
  const list = $('#account-list')
  if (!list) return
  const filtered = accounts.filter(
    (a) => !a.isHidden && (currentCategory === 'all' || a.platform === currentCategory),
  )
  // 排序：置顶账号在最前，且置顶组内后置顶的排最前（与主进程 listAccounts 保持一致）
  const sorted = [...filtered].sort((a, b) => {
    if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1
    if (a.pinned) {
      const byPinTime = (b.pinnedAt ?? 0) - (a.pinnedAt ?? 0)
      if (byPinTime !== 0) return byPinTime
    }
    return a.sortOrder - b.sortOrder
  })
  // 多开性能：内容未变化时跳过重建（原实现每 8s 无条件 innerHTML 重建 + 重绑全部事件，
  // 账号一多就是持续的重排/垃圾回收压力）。卡片相对时间由 startMessageTimer() 独立刷新，
  // 不依赖本函数重建。
  const signature = accountListSignatureOf(sorted)
  if (signature === lastAccountListSignature) return
  lastAccountListSignature = signature
  const addAccountCardHTML = (isEmpty: boolean): string => `
    <div class="account-add-card${isEmpty ? ' is-empty' : ''}" title="添加账号">
      <span class="account-add-plus">
        <svg viewBox="0 0 24 24" width="14" height="14"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/></svg>
      </span>
      <span class="account-add-text">${isEmpty ? '暂无账号，点击添加' : '添加账号'}</span>
    </div>`
  if (sorted.length === 0) {
    list.innerHTML = addAccountCardHTML(true)
  } else {
    list.innerHTML = sorted.map(createAccountCardHTML).join('') + addAccountCardHTML(false)
  }
  $$<HTMLElement>('.account-card').forEach((card) => {
    const id = card.dataset.accountId || ''
    card.addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      if (target.closest('.btn-account-action')) return
      switchToAccount(id)
    })
    card.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      showAccountMenu(e.clientX, e.clientY, id)
    })
  })
  $$<HTMLElement>('.btn-account-action').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      const card = btn.closest<HTMLElement>('.account-card')
      const id = card?.dataset.accountId || ''
      const action = btn.dataset.action
      if (action === 'rename') startRename(id)
      else if (action === 'pin') void togglePinAccount(id)
      else if (action === 'delete') void deleteAccount(id)
    })
  })
  // 列表末尾"添加账号"框
  const addCard = list.querySelector<HTMLElement>('.account-add-card')
  addCard?.addEventListener('click', () => openAddAccountModal())
}

/* 简易右键菜单（原生实现，避免额外 DOM） */
function showAccountMenu(x: number, y: number, accountId: string): void {
  const menu = document.createElement('div')
  menu.className = 'context-menu'
  const acc = accounts.find((a) => a.id === accountId)
  const items = [
    { label: '重命名', fn: () => startRename(accountId) },
    { label: acc?.pinned ? '取消置顶' : '置顶', fn: () => void togglePinAccount(accountId) },
    { label: '删除账号', fn: () => void deleteAccount(accountId) },
  ]
  menu.innerHTML = items
    .map((it) => `<div class="context-menu-item">${esc(it.label)}</div>`)
    .join('')
  menu.style.left = `${Math.min(x, window.innerWidth - 150)}px`
  menu.style.top = `${Math.min(y, window.innerHeight - 120)}px`
  document.body.appendChild(menu)
  const close = (): void => menu.remove()
  menu.querySelectorAll<HTMLElement>('.context-menu-item').forEach((item, i) => {
    item.addEventListener('click', () => {
      close()
      items[i]?.fn()
    })
  })
  setTimeout(() => {
    window.addEventListener('mousedown', close, { once: true })
  }, 0)
}

/* ==================== 账号操作 ==================== */
function signalStatusText(accountId: string): string {
  const st = signalStateMap.get(accountId)
  if (!st) return '未启动'
  switch (st.status) {
    case 'starting':
    case 'starting_embedded':
    case 'embedding':
      return '启动中…'
    case 'running':
      return '运行中'
    case 'embedded':
      return '已嵌入'
    case 'crashed':
      return '已崩溃'
    case 'error':
      return st.error || '错误'
    default:
      return '未启动'
  }
}

function lineStatusText(accountId: string): string {
  const st = lineStateMap.get(accountId)
  if (!st) return '未启动'
  switch (st.status) {
    case 'starting':
    case 'starting_embedded':
    case 'embedding':
      return '启动中…'
    case 'running':
      return '运行中'
    case 'embedded':
      return '已嵌入'
    case 'crashed':
      return '已崩溃'
    case 'error':
      return st.error || '错误'
    default:
      return '未启动'
  }
}

let pendingRenameId = ''

function startRename(accountId: string): void {
  const acc = accounts.find((a) => a.id === accountId)
  if (!acc) return
  pendingRenameId = accountId
  const input = $('#input-rename-name') as HTMLInputElement | null
  if (input) {
    input.value = acc.name
    input.focus()
    input.select()
  }
  $('#modal-rename-account')?.classList.remove('hidden')
}

function confirmRename(): void {
  const input = $('#input-rename-name') as HTMLInputElement | null
  const name = input?.value.trim() || ''
  if (!name || !pendingRenameId) return
  const accountId = pendingRenameId
  pendingRenameId = ''
  closeRenameModal()
  void window.api.accounts.rename(accountId, name).then(() => {
    showToast('账号已重命名', 'success')
    void refreshAccounts()
  })
}

function closeRenameModal(): void {
  $('#modal-rename-account')?.classList.add('hidden')
  pendingRenameId = ''
}

async function togglePinAccount(accountId: string): Promise<void> {
  const acc = accounts.find((a) => a.id === accountId)
  if (!acc) return
  await window.api.accounts.togglePin(accountId)
  void refreshAccounts()
}

/**
 * 温和拆除账号的 <webview> 节点。
 * 直接 remove() 会让 Chromium 在 guest 仍在加载/运行（WhatsApp 长连接、Service Worker、
 * 注入脚本的定时扫描）时销毁原生视图，Windows 上会触发宿主渲染进程崩溃 ——
 * 表现就是"删除 WhatsApp 账号后软件直接闪退"。
 * 这里先 stop() 并导航到 about:blank 卸载页面，待 guest 释放（dom-ready / destroyed）
 * 或超时后再摘除 DOM 节点；同时先从 webviewWrappers 摘除引用，避免拆除期间回调再次操作它。
 *
 * @param tag 日志前缀：'del' = 删除账号，'mem' = 内存优化休眠（仅日志区分，流程一致）
 */
async function detachWebviewNode(accountId: string, tag = 'del'): Promise<void> {
  const wrapper = webviewWrappers.get(accountId)
  if (!wrapper) {
    window.api.dbgSync(`${tag}:teardown:no-wrapper ${accountId}`)
    return
  }
  webviewWrappers.delete(accountId)
  const wv = wrapper.querySelector<MtWebview>('webview')
  window.api.dbgSync(`${tag}:teardown:begin ${accountId} hasWebview=${!!wv}`)
  if (wv) {
    // 1) 先让 guest 内的注入脚本彻底静止（停未读轮询定时器 / 断开 MutationObserver / 清空队列）：
    //    销毁瞬间页面上还有回调在跑，是放大原生崩溃概率的主因
    try {
      wv.send('mt-host-teardown')
    } catch {
      /* ignore */
    }
    await new Promise<void>((r) => window.setTimeout(r, 200))
    // 2) 停止导航并卸载页面（about:blank）：断开 WhatsApp/Telegram 长连接与页面级资源
    try {
      wv.stop?.()
    } catch {
      /* ignore */
    }
    window.api.dbgSync(`${tag}:teardown:blanking ${accountId}`)
    await new Promise<void>((resolve) => {
      let settled = false
      const done = (): void => {
        if (settled) return
        settled = true
        resolve()
      }
      try {
        wv.addEventListener('destroyed', done, { once: true })
        wv.addEventListener('dom-ready', done, { once: true })
      } catch {
        /* ignore */
      }
      try {
        wv.setAttribute('src', 'about:blank')
      } catch {
        /* ignore */
      }
      // 兜底超时：guest 未及时释放也不阻塞删除流程
      window.setTimeout(done, 600)
    })
  }
  window.api.dbgSync(`${tag}:teardown:removing ${accountId}`)
  try {
    wrapper.remove()
  } catch {
    /* ignore */
  }
  window.api.dbgSync(`${tag}:teardown:done ${accountId}`)
}

/** 删除账号时的拆除入口（保留原日志前缀，便于对照崩溃日志） */
async function teardownWebview(accountId: string): Promise<void> {
  await detachWebviewNode(accountId, 'del')
}

async function deleteAccount(accountId: string): Promise<void> {
  const acc = accounts.find((a) => a.id === accountId)
  if (!acc) return
  if (!window.confirm(`确定删除账号「${acc.name}」？`)) return
  // 关键路径取证：删除会销毁 webview guest，若进程被原生崩溃带走，异步 debug.log 会一起丢，
  // 这里每一步都同步落盘到 crash.log，确保能看到崩溃前执行到哪一步
  window.api.dbgSync(`del:begin ${accountId} platform=${acc.platform} active=${activeAccountId === accountId}`)
  // 该账号若还在后台加载等待切换，一并取消，避免它的 dom-ready 回调再去操作其它会话
  if (pendingSwitchAccountId === accountId) {
    pendingSwitchAccountId = null
    clearPendingSwitchTimer()
  }
  // 删除当前激活账号时先切回首页（与顶部栏「首页」一致）：
  // 避免"视图仍指向该账号"与"拆除 webview"交叉执行
  if (activeAccountId === accountId) {
    activeAccountId = null
    switchView('home')
  }
  if (acc.platform === 'signal') {
    // 删除账号：先停掉嵌入补试链，避免其继续对该账号调 embed
    cancelSignalRetry(accountId)
    // 删除账号：强杀该 Signal 进程树并立即返回（对齐鑫五洋"删除几乎同时关闭"，不等 2.5s 优雅退出）
    await window.api.signal.kill(accountId)
    signalStateMap.delete(accountId)
  } else if (acc.platform === 'line') {
    await window.api.line.reset(accountId)
    lineStateMap.delete(accountId)
  } else if (acc.platform === 'messenger') {
    // 关闭该账号的 messenger webview 分区会话（通用容器，WebContentsView/子进程已废弃）
    void window.api.messengerWindow.close(accountId)
  }
  // WhatsApp / Telegram / Messenger 共用通用 <webview>：必须先卸载 guest 再摘除节点
  await teardownWebview(accountId)
  window.api.dbgSync(`del:ipc-before ${accountId}`)
  await window.api.accounts.remove(accountId)
  window.api.dbgSync(`del:ipc-after ${accountId}`)
  // 清理该账号的运行时状态（webview 引用已在 teardownWebview 中摘除）
  signalStateMap.delete(accountId)
  lineStateMap.delete(accountId)
  accountUnread.delete(accountId)
  accountActivity.delete(accountId)
  accountAutoTranslate.delete(accountId)
  accountSendTranslate.delete(accountId)
  showToast(
    acc.platform === 'line' ? '账号已删除，LINE 登录数据已保留（重新添加可免扫码恢复）' : '账号已删除',
    'success'
  )
  void refreshAccounts()
}

/* ==================== 账号激活 / WebView ==================== */
function switchToAccount(accountId: string): void {
  // 从首页再次点击同一账号时也需重新显示聊天页，故不做同账号早退
  const prev = activeAccountId ? accounts.find((a) => a.id === activeAccountId) : null
  if (prev && prev.id !== accountId && prev.platform === 'signal') {
    const st = signalStateMap.get(prev.id)
    if (st?.status === 'embedded') void window.api.signal.detach(prev.id)
  } else if (prev && prev.id !== accountId && prev.platform === 'line') {
    const st = lineStateMap.get(prev.id)
    if (st?.status === 'embedded') void window.api.line.detach(prev.id)
  }
  activeAccountId = accountId
  // 记录访问时刻：内存吃紧时按此顺序休眠（最久未访问的先休眠）
  touchAccount(accountId)
  showWebview()
  activateAccount(accountId)
}

function activateAccount(accountId: string): void {
  const acc = accounts.find((a) => a.id === accountId)
  if (!acc) return
  const container = $('#webview-container')
  if (!container) return

  let wrapper = webviewWrappers.get(accountId)
  if (!wrapper) {
    if (acc.platform === 'signal') wrapper = buildSignalWrapper(acc)
    else if (acc.platform === 'line') wrapper = buildLineWrapper(acc)
    else wrapper = buildWebviewWrapper(acc) // WhatsApp / Telegram / Messenger 共用通用 webview 容器
    if (wrapper) {
      webviewWrappers.set(accountId, wrapper)
      container.appendChild(wrapper)
    }
  }

  // 首次加载的非 signal/line 账号（含 messenger 的 <webview>）：保持当前会话可见，
  // 新会话后台加载完成后再切换，避免"会话先隐藏（白屏）再显示"的闪烁。
  const wv = wrapper?.querySelector<MtWebview>('webview')
  const needsLoad = acc.platform !== 'signal' && acc.platform !== 'line' && Boolean(wv && !wv.getAttribute('src'))
  const hasVisible = [...webviewWrappers.values()].some((w) => w.classList.contains('active'))
  // 该 guest 从未渲染过内容（新建节点，或内存优化休眠后重建）：此时不存在"先隐藏再显示"的闪烁
  // 问题，直接切过去并显示加载占位即可 —— 否则用户点了被休眠的账号要干等十几秒兜底才切界面。
  const neverRendered = !wv || wv.dataset.mtReady !== '1'
  if (needsLoad && hasVisible && wv && !neverRendered) {
    pendingSwitchAccountId = accountId
    // 硬超时兜底：guest 迟迟不 dom-ready（网络慢/站点阻塞）时也要把界面切过去，
    // 否则用户看到的就是「点了切换一直没反应」
    armPendingSwitchFallback(accountId)
    void loadWebview(acc, wv)
    return
  }

  // 直接切换（已加载账号 / signal / line / 当前无可见会话）
  pendingSwitchAccountId = null
  clearPendingSwitchTimer()
  // 隐藏所有 wrapper
  webviewWrappers.forEach((w) => w.classList.remove('active'))
  wrapper?.classList.add('active')

  // 多开性能：本账号恢复满速，其余账号暂停扫描 + 开后环节流
  applyWebviewRuntimeThrottle(accountId, false)
  pauseAllInactiveWebviews()

  // 触发该账号的加载 / 嵌入
  if (acc.platform === 'signal') {
    void ensureSignalEmbedded(accountId)
  } else if (acc.platform === 'line') {
    void ensureLineEmbedded(accountId)
  } else if (wv && !wv.getAttribute('src')) {
    void loadWebview(acc, wv)
  } else if (wv) {
    wv.focus()
  }
  // 工具栏按钮文本反映持久化状态
  updateAutoTranslateButtons(accountId)
  updateAutoSendTranslateButtons(accountId)
  renderAccountList()
  // 多开内存：常驻 webview 超过上限时休眠最久未访问的账号（默认 6 个以内不触发）
  enforceResidentBudget(MAX_RESIDENT_WEBVIEWS)
}

/** 创建 WebView 包装（工具栏 + <webview> + 加载/错误占位） */
function buildWebviewWrapper(acc: Account): HTMLElement {
  const wrapper = document.createElement('div')
  wrapper.className = 'webview-wrapper'
  wrapper.dataset.accountId = acc.id
  wrapper.innerHTML = `
    <div class="webview-toolbar">
      <span class="toolbar-dot" style="background:${PLATFORM_COLOR[acc.platform]}"></span>
      <span class="toolbar-title">${esc(acc.name)}</span>
      <button class="toolbar-auto-translate" data-act="auto-translate">自动翻译</button>
      <button class="toolbar-send-translate" data-act="send-translate">发送翻译关</button>
      <button class="toolbar-btn toolbar-auto-reply" title="智能回复" data-act="auto-reply">
        <svg viewBox="0 0 24 24" width="16" height="16"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12zM7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z" fill="currentColor"/></svg>
      </button>
      <button class="toolbar-btn" title="刷新" data-act="reload">
        <svg viewBox="0 0 24 24" width="16" height="16"><path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="currentColor"/></svg>
      </button>
      <button class="toolbar-btn" title="调试（DevTools）" data-act="devtools">
        <svg viewBox="0 0 24 24" width="16" height="16"><path d="M19.14 12.94a7.07 7.07 0 000-1.88l2.03-1.58a.5.5 0 00.12-.64l-1.92-3.32a.5.5 0 00-.61-.22l-2.39.96a7.05 7.05 0 00-1.62-.94l-.36-2.54a.5.5 0 00-.5-.42h-3.84a.5.5 0 00-.5.42l-.36 2.54c-.59.24-1.13.55-1.62.94l-2.39-.96a.5.5 0 00-.61.22L2.7 8.84a.5.5 0 00.12.64l2.03 1.58c-.05.31-.08.63-.08.94s.03.63.08.94l-2.03 1.58a.5.5 0 00-.12.64l1.92 3.32c.13.22.39.3.61.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.26.42.5.42h3.84c.24 0 .45-.18.5-.42l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.48 0 .61-.22l1.92-3.32a.5.5 0 00-.12-.64l-2.03-1.58zM12 15.5A3.5 3.5 0 1112 8.5a3.5 3.5 0 010 7z" fill="currentColor"/></svg>
      </button>
    </div>
    <div class="webview-loading">正在加载 ${esc(PLATFORM_LABEL[acc.platform])}…</div>
    <div class="webview-error hidden">加载失败，请检查网络后刷新重试</div>
  `
  wrapper.querySelector<HTMLButtonElement>('.toolbar-auto-translate')?.addEventListener('click', () => {
    toggleAutoTranslate(acc.id)
  })
  wrapper.querySelector<HTMLButtonElement>('.toolbar-send-translate')?.addEventListener('click', () => {
    toggleAutoSendTranslate(acc.id)
  })
  wrapper.querySelector<HTMLButtonElement>('.toolbar-btn[data-act="auto-reply"]')?.addEventListener('click', () => {
    generateAutoReply(acc.id)
  })
  wrapper.querySelector<HTMLButtonElement>('.toolbar-btn[data-act="reload"]')?.addEventListener('click', () => {
    reloadWebview(acc.id)
  })
  const wv = document.createElement('webview') as unknown as MtWebview
  wrapper.appendChild(wv)
  // 调试按钮：直接弹出该 WebView（如 Messenger 页面）的 DevTools
  wrapper.querySelector<HTMLButtonElement>('.toolbar-btn[data-act="devtools"]')?.addEventListener('click', () => {
    try {
      wv.openDevTools()
    } catch (e) {
      showToast('无法打开调试器：' + (e as Error).message, 'error')
    }
  })
  return wrapper
}

async function loadWebview(acc: Account, wv: MtWebview): Promise<void> {
  try {
    const cfg: WebviewConfig = await window.api.webview.getConfig(acc.platform, acc.id)
    const loading = wv.parentElement?.querySelector<HTMLElement>('.webview-loading')
    const errEl = wv.parentElement?.querySelector<HTMLElement>('.webview-error')
    errEl?.classList.add('hidden')
    // 账号卡片时间行显示"正在加载..."（dom-ready 后恢复为相对时间）
    setAccountLoadingState(acc.id, '正在加载...')

    // 注意：useragent / webpreferences 等属性必须在设置 src 之前赋值，
    // 否则导航已开始、属性不生效（WhatsApp 等会因 UA 带 Electron 标识拒绝加载）。
    wv.partition = `persist:${acc.id}`
    wv.setAttribute('useragent', cfg.userAgent)
    wv.setAttribute('allowpopups', '')
    // 对齐已验证可正常收发 messenger 的参考实现：显式关沙箱。Electron ≥20 的 <webview> 默认沙箱开启，
    // 会限制 guest 的 Service Worker / CacheStorage / worker，可能使 Messenger 消息线程一直"加载中"、
    // 无法发送（参考实现 messenger 的 webview 均设 sandbox=no）。对本应用所有 webview 生效，与 WA/TG 一致。
    // 关键修复：Messenger 的 E2EE / PIN 流程依赖 WebGL。此前这里对所有平台统一设 webgl=no，
    // 会让 messenger 的 guest 完全拿不到 WebGL，导致 E2EE worker 脚本加载失败（控制台报
    // Failed to fetch a worker script.），消息线程一直停在「正在加载…」、无法收发消息。
    // 主进程已用 --enable-unsafe-swiftshader 兜底（仅在硬件 GPU 不可用时 Chromium 才回退软 WebGL），
    // 这里必须对 messenger 放开 webgl（其它平台维持禁用，避免无谓的 GPU 开销）。
    // 注意：绝不能再全局开 --use-angle=swiftshader —— 那会让所有账号页面的合成/光栅化走 CPU，
    // 多开时直接卡死（本次修复的核心）。
    const webglPref = acc.platform === 'messenger' ? 'webgl=yes' : 'webgl=no'
    // backgroundThrottling 改为默认开启（yes）：此前对所有账号写死 no，后台账号也满速跑
    // DOM 扫描/未读轮询，多开时 CPU 被打满 → 界面卡死。现在只对「当前激活账号」通过
    // applyWebviewRuntimeThrottle() 动态关节流，其余账号由 Chromium 降频。
    wv.setAttribute(
      'webpreferences',
      `contextIsolation=no, sandbox=no, backgroundThrottling=yes, spellcheck=no, javascript=yes, images=yes, ${webglPref}`,
    )
    if (cfg.preloadPath) {
      // webview 的 preload 必须是 file:// 或 asar:// 协议
      // Messenger 也注入 webview-preload（发送翻译/回车翻译 + 自动翻译 + 未读上报）。
      // 早前曾担心 preload 干扰登录输入框而跳过；现已确认 preload 在登录页不 attach 发送拦截器
      // （interceptorAttached=false），登录页可正常输入，故恢复注入以支持回车翻译。
      const raw = cfg.preloadPath.replace(/\\/g, '/')
      wv.preload = raw.startsWith('file://') ? raw : `file:///${raw}`
    }
    // 最后才设置 src 触发导航（附加账号 id，注入脚本据此上报未读数）
    const homeUrl = new URL(cfg.homeUrl)
    homeUrl.searchParams.set('__mt_account', acc.id)
    wv.src = homeUrl.toString()

    const handleDomReady = (): void => {
      const domReady = wv.dataset.mtReady === '1'
      wv.dataset.mtReady = '1'
      loading?.classList.remove('active')
      errEl?.classList.add('hidden')
      // 加载完成：卡片时间行恢复为相对时间
      setAccountLoadingState(acc.id, '')
      // 若该账号在后台加载等待切换，就绪后平滑切换
      if (pendingSwitchAccountId === acc.id) {
        pendingSwitchAccountId = null
        clearPendingSwitchTimer()
        webviewWrappers.forEach((w) => w.classList.remove('active'))
        wv.parentElement?.classList.add('active')
        updateAutoTranslateButtons(acc.id)
        updateAutoSendTranslateButtons(acc.id)
        renderAccountList()
        // 多开性能：后台加载完成后正式接管前台，恢复满速并暂停其他账号
        applyWebviewRuntimeThrottle(acc.id, false)
        pauseAllInactiveWebviews()
      }
      // 多开性能：dom-ready 后才可下发指令。非激活账号（预加载/后台）立即暂停扫描并节流，
      // 否则每个账号加载完都会满速跑 DOM 扫描；激活账号则显式关节流，确保消息实时。
      if (activeAccountId !== acc.id) applyWebviewRuntimeThrottle(acc.id, true)
      else applyWebviewRuntimeThrottle(acc.id, false)
      if (!domReady) {
        void window.api.webview.domReady(acc.id, wv.getURL())
      }
      // 常规 webview 账号：让嵌入的 guest 页面获得焦点。Messenger/Facebook 在页面
      // document.hasFocus() 为 false 时会禁用输入框/按钮（登录页无法输入、点不动），
      // 首次加载/登录页就绪后主动聚焦即可恢复交互。
      if (acc.platform !== 'signal' && acc.platform !== 'line') {
        wv.focus()
      }
      // 同步账号级翻译开关（等待 preload 就绪后推送）
      setTimeout(() => {
        sendTranslationState(wv, acc.id, { translateNow: true })
        sendAutoSendTranslateState(wv, acc.id)
        // 再聚焦一次：登录页某些状态切换后焦点会被抢走，延迟补偿可避免输入/按钮失效
        if (acc.platform !== 'signal' && acc.platform !== 'line') {
          try {
            wv.focus()
          } catch {
            /* ignore */
          }
        }
      }, 300)
    }
    wv.addEventListener('dom-ready', handleDomReady)
    wv.addEventListener('did-fail-load', (e) => {
      const ev = e as Event & { errorCode?: number }
      if (ev.errorCode !== -3) {
        loading?.classList.remove('active')
        errEl?.classList.remove('hidden')
        setAccountLoadingState(acc.id, '')
        // 加载失败也完成切换，展示错误占位便于刷新重试
        if (pendingSwitchAccountId === acc.id) {
          pendingSwitchAccountId = null
          webviewWrappers.forEach((w) => w.classList.remove('active'))
          wv.parentElement?.classList.add('active')
          renderAccountList()
        }
      }
    })
    wv.addEventListener('destroyed', () => {
      loading?.classList.remove('active')
      setAccountLoadingState(acc.id, '')
      if (pendingSwitchAccountId === acc.id) {
        pendingSwitchAccountId = null
        clearPendingSwitchTimer()
      }
    })
    // 同步徽章样式配置
    if (cfg.autoTranslate) {
      const code = `window.translator && window.translator.updateStyle(${cfg.fontSize}, ${JSON.stringify(cfg.badgeColor)}, ${JSON.stringify(cfg.badgeBgColor)})`
      wv.addEventListener('dom-ready', () => {
        void wv.executeJavaScript(code).catch(() => undefined)
      })
    }
  } catch {
    showToast('WebView 初始化失败', 'error')
  }
}

/* ==================== 顶部工具栏（自动翻译 / 发送翻译 / 智能回复 / 刷新） ==================== */

function getTargetLang(): string {
  return settings.defaultTargetLang || DEFAULT_SETTINGS.defaultTargetLang
}

function isAccountAutoTranslateEnabled(accountId: string): boolean {
  // 账号未显式设置时跟随全局开关（默认开启自动翻译）
  return (
    accountAutoTranslate.get(accountId) ??
    accounts.find((a) => a.id === accountId)?.autoTranslate ??
    settings.autoTranslateEnabled ??
    true
  )
}

function isAccountSendTranslateEnabled(accountId: string): boolean {
  return (
    accountSendTranslate.get(accountId) ??
    accounts.find((a) => a.id === accountId)?.autoSendTranslate ??
    true
  )
}

/** 通过 wv.send 推送消息；若 webview 未就绪则改用 executeJavaScript 调用 preload 全局函数兜底 */
function safeSendToWebview(wv: MtWebview, channel: string, data: Record<string, unknown>): void {
  try {
    wv.send(channel, data)
    return
  } catch {
    // fall through 到 executeJavaScript
  }
  let code = ''
  if (channel === 'mt-toggle-translation') {
    code = `window.__mt_setTranslationEnabled && window.__mt_setTranslationEnabled(${JSON.stringify(Boolean(data.enabled))}, ${JSON.stringify(String(data.targetLang || ''))}, ${JSON.stringify(Boolean(data.translateNow))})`
  } else if (channel === 'mt-toggle-send-translation') {
    code = `window.__mt_setSendTranslationEnabled && window.__mt_setSendTranslationEnabled(${JSON.stringify(Boolean(data.enabled))})`
  } else if (channel === 'mt-generate-reply') {
    code = `window.__mt_generateReply && window.__mt_generateReply()`
  } else if (channel === 'mt-translate-all-visible') {
    code = `window.__mt_translateAll && window.__mt_translateAll(${JSON.stringify(String(data.targetLang || ''))})`
  } else if (channel === 'mt-settings-updated') {
    code = `window.__mt_updateConfig && window.__mt_updateConfig(${JSON.stringify(data)})`
  }
  if (code) void wv.executeJavaScript(code).catch(() => undefined)
}

function sendTranslationState(wv: MtWebview, accountId: string, opts: { translateNow?: boolean } = {}): void {
  safeSendToWebview(wv, 'mt-toggle-translation', {
    enabled: isAccountAutoTranslateEnabled(accountId),
    targetLang: getTargetLang(),
    translateNow: Boolean(opts.translateNow),
  })
}

function sendAutoSendTranslateState(wv: MtWebview, accountId: string): void {
  safeSendToWebview(wv, 'mt-toggle-send-translation', {
    enabled: isAccountSendTranslateEnabled(accountId),
  })
}

async function setAccountAutoTranslateEnabled(accountId: string, enabled: boolean, translateNow = false): Promise<void> {
  accountAutoTranslate.set(accountId, enabled)
  updateAutoTranslateButtons(accountId)
  showToast(enabled ? '已开启自动翻译' : '已关闭自动翻译', 'info')
  const wv = webviewWrappers.get(accountId)?.querySelector<MtWebview>('webview')
  if (wv) sendTranslationState(wv, accountId, { translateNow })
  try {
    await window.api.accounts.update(accountId, { autoTranslate: enabled })
  } catch {
    // 持久化失败不影响本次生效
  }
}

async function setAccountSendTranslateEnabled(accountId: string, enabled: boolean): Promise<void> {
  accountSendTranslate.set(accountId, enabled)
  updateAutoSendTranslateButtons(accountId)
  showToast(enabled ? '已开启发送翻译' : '已关闭发送翻译', 'info')
  const wv = webviewWrappers.get(accountId)?.querySelector<MtWebview>('webview')
  if (wv) sendAutoSendTranslateState(wv, accountId)
  try {
    await window.api.accounts.update(accountId, { autoSendTranslate: enabled })
  } catch {
    // 忽略
  }
}

function toggleAutoTranslate(accountId: string): void {
  void setAccountAutoTranslateEnabled(accountId, !isAccountAutoTranslateEnabled(accountId), true)
}

function toggleAutoSendTranslate(accountId: string): void {
  void setAccountSendTranslateEnabled(accountId, !isAccountSendTranslateEnabled(accountId))
}

function updateAutoTranslateButtons(accountId?: string): void {
  const ids = accountId ? [accountId] : Array.from(webviewWrappers.keys())
  for (const id of ids) {
    const btn = webviewWrappers.get(id)?.querySelector<HTMLElement>('.toolbar-auto-translate')
    if (!btn) continue
    const on = isAccountAutoTranslateEnabled(id)
    btn.textContent = on ? '翻译中…' : '自动翻译'
    btn.classList.toggle('active', on)
  }
}

function updateAutoSendTranslateButtons(accountId?: string): void {
  const ids = accountId ? [accountId] : Array.from(webviewWrappers.keys())
  for (const id of ids) {
    const btn = webviewWrappers.get(id)?.querySelector<HTMLElement>('.toolbar-send-translate')
    if (!btn) continue
    const on = isAccountSendTranslateEnabled(id)
    btn.textContent = on ? '发送翻译开' : '发送翻译关'
    btn.classList.toggle('active', on)
  }
}

function reloadWebview(accountId: string): void {
  const wv = webviewWrappers.get(accountId)?.querySelector<MtWebview>('webview')
  if (!wv) return
  const errEl = wv.parentElement?.querySelector<HTMLElement>('.webview-error')
  errEl?.classList.add('hidden')
  // 卡片时间行显示"正在刷新..."（dom-ready 后恢复）
  setAccountLoadingState(accountId, '正在刷新...')
  try {
    wv.reload()
  } catch {
    // 忽略
  }
}

function generateAutoReply(accountId: string): void {
  const wv = webviewWrappers.get(accountId)?.querySelector<MtWebview>('webview')
  if (!wv) return
  const btn = webviewWrappers.get(accountId)?.querySelector<HTMLButtonElement>('.toolbar-auto-reply')
  if (btn) btn.disabled = true
  safeSendToWebview(wv, 'mt-generate-reply', {})
  window.setTimeout(() => {
    if (btn) btn.disabled = false
  }, 8000)
}

/* ==================== LINE（混合运行时：独立 Electron 22 子进程 + 窗口嵌入） ==================== */
/** 复用 Signal 的 panel/embed-area/translate-bar 样式类（同一时间只显示一个账号，无冲突） */
function buildLineWrapper(acc: Account): HTMLElement {
  const wrapper = document.createElement('div')
  wrapper.className = 'webview-wrapper'
  wrapper.dataset.accountId = acc.id
  wrapper.innerHTML = `
    <div class="signal-panel">
      <div class="signal-panel-header">
        <span class="signal-status-dot"></span>
        <span class="signal-status-text">未启动</span>
        <div class="signal-actions">
          <button class="signal-btn" data-act="restart">重启</button>
        </div>
      </div>
      <div class="signal-embed-area signal-launch-view">
        <div class="signal-loading">
          <!-- 图标对齐 LINE 登录页 logo：不画图形，直接用「LINE」单词（品牌绿、粗体） -->
          <div style="margin-bottom:14px;font-family:'Segoe UI','Microsoft YaHei',Arial,sans-serif;font-size:28px;font-weight:800;letter-spacing:1.5px;line-height:1;color:#06C755;">LINE</div>
          <div style="font-size:14px;color:#666;margin-bottom:8px;">正在启动 LINE...</div>
          <div style="font-size:12px;color:#999;">LINE 窗口将嵌入此区域，首次启动请先扫码/登录</div>
          <button class="signal-launch-btn">启动 LINE</button>
        </div>
      </div>
    </div>
  `
  const st = lineStateMap.get(acc.id)
  const isEmbedded = st?.status === 'embedded'
  const loadingEl = wrapper.querySelector<HTMLElement>('.signal-loading')
  if (loadingEl) loadingEl.style.display = isEmbedded ? 'none' : 'flex'

  wrapper.querySelector<HTMLButtonElement>('.signal-launch-btn')?.addEventListener('click', () => {
    void launchLine(acc.id)
  })
  wrapper.querySelector<HTMLButtonElement>('.signal-btn[data-act="restart"]')?.addEventListener('click', () => {
    void restartLine(acc.id)
  })
  return wrapper
}

async function launchLine(accountId: string): Promise<void> {
  const acc = accounts.find((a) => a.id === accountId)
  if (!acc || acc.platform !== 'line') return
  let st = await window.api.line.launch(accountId)
  lineStateMap.set(accountId, st)
  updateLinePanelUI(accountId)
  if (st.status !== 'error' && st.status !== 'idle') {
    // 主进程 launch 已等待窗口并嵌入；此处兜底再 embed 一次（幂等）
    st = await window.api.line.embed(accountId)
    lineStateMap.set(accountId, st)
    updateLinePanelUI(accountId)
    startRelocateLoop()
    // 立即定位一次，避免首次嵌入（lastBounds 为空）窗口乱位
    setTimeout(() => {
      const w = webviewWrappers.get(accountId)
      const area = w?.querySelector<HTMLElement>('.signal-embed-area')
      if (area) {
        const rect = area.getBoundingClientRect()
        void window.api.line.relocate(accountId, {
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        })
      }
    }, 120)
  }
}

async function ensureLineEmbedded(accountId: string): Promise<void> {
  const st = await window.api.line.health(accountId)
  lineStateMap.set(accountId, st)
  updateLinePanelUI(accountId)
  if (st.status === 'running' || st.status === 'starting') {
    await window.api.line.embed(accountId)
    startRelocateLoop()
  } else if (st.status === 'idle') {
    // 未启动：直接自动启动（无需再手动点「启动 LINE」），免登 / 扫码页自动呈现
    void launchLine(accountId)
  }
}

async function restartLine(accountId: string): Promise<void> {
  await window.api.line.reset(accountId)
  await new Promise((r) => setTimeout(r, 400))
  let st = await window.api.line.launch(accountId)
  lineStateMap.set(accountId, st)
  updateLinePanelUI(accountId)
  if (st.status !== 'error' && st.status !== 'idle') {
    st = await window.api.line.embed(accountId)
    lineStateMap.set(accountId, st)
    updateLinePanelUI(accountId)
    startRelocateLoop()
  }
}

async function quitLine(accountId: string): Promise<void> {
  await window.api.line.reset(accountId)
  lineStateMap.set(accountId, {
    accountId,
    status: 'idle',
    pid: null,
    unread: 0,
    embedded: false,
    error: undefined,
  })
  updateLinePanelUI(accountId)
}

function updateLinePanelUI(accountId: string): void {
  const st = lineStateMap.get(accountId)
  const wrapper = webviewWrappers.get(accountId)
  console.log(`[renderer] updateLinePanelUI account=${accountId} status=${st?.status} wrapper=${!!wrapper}`)
  if (!wrapper) return
  const dot = wrapper.querySelector<HTMLElement>('.signal-status-dot')
  const text = wrapper.querySelector<HTMLElement>('.signal-status-text')
  const loadingEl = wrapper.querySelector<HTMLElement>('.signal-loading')
  if (text) text.textContent = lineStatusText(accountId)
  if (dot) {
    dot.className = 'signal-status-dot'
    if (st) dot.classList.add(`st-${st.status}`)
  }
  if (loadingEl) {
    const launchBtn = loadingEl.querySelector<HTMLButtonElement>('.signal-launch-btn')
    if (st?.status === 'starting') {
      loadingEl.style.display = 'flex'
      if (launchBtn) {
        launchBtn.disabled = true
        launchBtn.textContent = '正在启动...'
      }
    } else {
      loadingEl.style.display =
        st?.status === 'embedded' || st?.status === 'running' ? 'none' : 'flex'
      if (launchBtn) {
        launchBtn.disabled = false
        launchBtn.textContent = '启动 LINE'
      }
    }
  }
  renderAccountList()
}

/* ==================== Signal ==================== */
function buildSignalWrapper(acc: Account): HTMLElement {
  const wrapper = document.createElement('div')
  wrapper.className = 'webview-wrapper'
  wrapper.dataset.accountId = acc.id
  wrapper.innerHTML = `
    <div class="signal-panel">
      <div class="signal-panel-header">
        <span class="signal-status-dot"></span>
        <span class="signal-status-text">未启动</span>
        <div class="signal-actions">
          <button class="signal-btn" data-act="restart">重启</button>
          <button class="signal-btn" data-act="clear">清除重登</button>
        </div>
      </div>
      <div class="signal-embed-area signal-launch-view">
        <div class="signal-loading">
          <!-- 图标 + 提示文案对齐鑫五洋参考版（Signal 圆形图标 / 正在启动 / 将嵌入此区域） -->
          <svg viewBox="0 0 24 24" width="48" height="48" style="margin-bottom:12px;">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 1.5c5.815 0 10.5 4.685 10.5 10.5S17.815 22.5 12 22.5 1.5 17.815 1.5 12 6.185 1.5 12 1.5zm-.75 3v2.25h1.5V4.5h-1.5zM12 7.5A4.5 4.5 0 0 0 7.5 12 4.5 4.5 0 0 0 12 16.5 4.5 4.5 0 0 0 16.5 12 4.5 4.5 0 0 0 12 7.5zm0 1.5a3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1 3-3zm-.75 7.5v2.25h1.5V16.5h-1.5z" fill="#3A76F0"/>
          </svg>
          <div style="font-size:14px;color:#666;margin-bottom:8px;">正在启动 Signal Desktop...</div>
          <div style="font-size:12px;color:#999;">Signal 窗口将嵌入此区域</div>
          <button class="signal-launch-btn">启动 Signal</button>
        </div>
      </div>
      <div class="signal-translate-bar" id="signal-translate-bar-${acc.id}">
        <div class="signal-translate-preview" id="signal-translate-preview-${acc.id}">
          <span class="signal-preview-text" id="signal-preview-text-${acc.id}"></span>
          <button class="signal-copy-btn" data-act="copy">📋 复制</button>
        </div>
        <div class="signal-translate-input-row">
          <input type="text" class="signal-translate-input" id="signal-translate-input-${acc.id}"
            placeholder="输入要翻译的文本，回车翻译后复制，粘贴到 Signal 输入框">
        </div>
      </div>
    </div>
  `
  const st = signalStateMap.get(acc.id)
  const isEmbedded = st?.status === 'embedded'
  const loadingEl = wrapper.querySelector<HTMLElement>('.signal-loading')
  if (loadingEl) loadingEl.style.display = isEmbedded ? 'none' : 'flex'

  wrapper.querySelector<HTMLButtonElement>('.signal-launch-btn')?.addEventListener('click', () => {
    void launchSignal(acc.id)
  })
  wrapper.querySelector<HTMLButtonElement>('.signal-btn[data-act="restart"]')?.addEventListener('click', () => {
    void restartSignal(acc.id)
  })
  wrapper.querySelector<HTMLButtonElement>('.signal-btn[data-act="clear"]')?.addEventListener('click', () => {
    void clearSignalData(acc.id)
  })
  wrapper.querySelector<HTMLInputElement>(`#signal-translate-input-${acc.id}`)?.addEventListener('keydown', (e) => {
    void handleSignalTranslateKey(e, acc.id)
  })
  wrapper.querySelector<HTMLInputElement>(`#signal-translate-input-${acc.id}`)?.addEventListener('input', () => {
    hideSignalTranslatePreview(acc.id)
  })
  wrapper.querySelector<HTMLButtonElement>('.signal-copy-btn')?.addEventListener('click', () => {
    void copySignalTranslation(acc.id)
  })
  return wrapper
}

function hideSignalTranslatePreview(accountId: string): void {
  const wrapper = webviewWrappers.get(accountId)
  if (!wrapper) return
  const input = wrapper.querySelector<HTMLInputElement>(`#signal-translate-input-${accountId}`)
  if (input && input.value.trim() !== '') return
  const previewEl = wrapper.querySelector<HTMLElement>(`#signal-translate-preview-${accountId}`)
  const previewText = wrapper.querySelector<HTMLElement>(`#signal-preview-text-${accountId}`)
  if (previewEl) previewEl.style.display = 'none'
  if (previewText) {
    previewText.textContent = ''
    delete previewText.dataset.translated
  }
}

// ===== Signal 底部翻译输入条 =====
async function handleSignalTranslateKey(event: KeyboardEvent, accountId: string): Promise<void> {
  if (event.key !== 'Enter') return
  const wrapper = webviewWrappers.get(accountId)
  if (!wrapper) return
  const input = wrapper.querySelector<HTMLInputElement>(`#signal-translate-input-${accountId}`)
  const previewEl = wrapper.querySelector<HTMLElement>(`#signal-translate-preview-${accountId}`)
  const previewText = wrapper.querySelector<HTMLElement>(`#signal-preview-text-${accountId}`)
  if (!input || !previewEl || !previewText) return
  const text = input.value.trim()
  if (!text) return
  previewText.textContent = '翻译中...'
  previewEl.style.display = 'flex'
  try {
    // 含中文译为英文，否则译为中文（与输入内容语言自动切换）
    const hasChinese = /[\u4e00-\u9fff\u3400-\u4dbf]/.test(text)
    const targetLang = hasChinese ? 'en' : 'zh-CN'
    const result = await window.api.translate(text, targetLang)
    if (result.success && result.translated) {
      previewText.textContent = '📝 译文预览：' + result.translated
      previewText.dataset.translated = result.translated
    } else {
      previewText.textContent = '翻译失败: ' + (result.error || '未知错误')
      delete previewText.dataset.translated
    }
  } catch (e) {
    previewText.textContent = '翻译出错: ' + (e instanceof Error ? e.message : String(e))
    delete previewText.dataset.translated
  }
}

async function copySignalTranslation(accountId: string): Promise<void> {
  const wrapper = webviewWrappers.get(accountId)
  if (!wrapper) return
  const previewText = wrapper.querySelector<HTMLElement>(`#signal-preview-text-${accountId}`)
  const translated = previewText?.dataset.translated
  if (!translated) {
    showToast('没有可复制的译文')
    return
  }
  try {
    await navigator.clipboard.writeText(translated)
    showToast('译文已复制到剪贴板，请粘贴到 Signal 输入框')
  } catch (e) {
    showToast('复制失败: ' + (e instanceof Error ? e.message : String(e)))
  }
}

async function launchSignal(accountId: string): Promise<void> {
  const acc = accounts.find((a) => a.id === accountId)
  if (!acc || acc.platform !== 'signal') return
  const st = await window.api.signal.launch(accountId)
  signalStateMap.set(accountId, st)
  updateSignalPanelUI(accountId)
  // 直接触发嵌入：manager 内部 waitForSignalWindow 会等待窗口出现（登录/扫码页/主窗）后 attach。
  // 若首次尚未成功（窗口还没出现），由 scheduleSignalRetry 定期补试，直至嵌入。
  await ensureSignalEmbedded(accountId)
  scheduleSignalRetry(accountId)
}

async function ensureSignalEmbedded(accountId: string): Promise<void> {
  // 不在账号视图（首页/设置）时绝不 embed：Signal 是独立顶层原生窗口，
  // 一旦 show 出来就会盖住当前页面，而且会一直留在最上面。
  if (currentView !== 'account') return
  const st = await window.api.signal.health(accountId)
  signalStateMap.set(accountId, st)
  updateSignalPanelUI(accountId)
  if (st.status === 'running' || st.status === 'embedded' || st.status === 'starting') {
    // 运行中（含仍 starting/窗口未现）：都调 embed，embed 内部 waitForSignalWindow 等窗口出现后 attach
    const e = await window.api.signal.embed(accountId)
    signalStateMap.set(accountId, e)
    updateSignalPanelUI(accountId)
    startRelocateLoop()
    // 未成功嵌入（窗口/登录页还没出现、或子进程刚被拉起）→ 起补试链，直到嵌入成功
    if (e.status !== 'embedded') scheduleSignalRetry(accountId)
  } else if (st.status === 'idle') {
    // 切到该 Signal 账号即自动启动（对齐鑫五洋 / LINE 行为），无需手动点"启动"
    await launchSignal(accountId)
  } else {
    // crashed / error：主进程会自愈重启，这里持续补试，避免切回账号后一直空白
    scheduleSignalRetry(accountId)
  }
}

/** 取消某账号的嵌入补试链（删除账号 / 显式关闭时调用） */
function cancelSignalRetry(accountId: string): void {
  const t = signalRetryTimers.get(accountId)
  if (t != null) window.clearTimeout(t)
  signalRetryTimers.delete(accountId)
  signalRetryActive.delete(accountId)
}

/**
 * 兜底：定期重试嵌入，直到嵌入成功、或该账号不再激活。
 * 覆盖「切回 Signal 账号时子进程已被自愈重启但窗口尚未出现」「登录页稍后才出现」等场景，
 * 避免切回账号后永久空白。同一账号只保留一条补试链，防止反复切号叠加。
 */
function scheduleSignalRetry(accountId: string): void {
  if (signalRetryActive.get(accountId)) return
  signalRetryActive.set(accountId, true)
  let attempt = 0
  const tryOnce = async (): Promise<void> => {
    signalRetryTimers.delete(accountId)
    // 账号已切走 / 已删除 / 补试链被取消：停止
    if (!signalRetryActive.get(accountId)) return
    if (activeAccountId !== accountId || !accounts.some((a) => a.id === accountId)) {
      signalRetryActive.delete(accountId)
      return
    }
    // 用户已切到首页/设置：停止补试（embed 会把原生窗口 show 出来盖住页面）
    if (currentView !== 'account') {
      signalRetryActive.delete(accountId)
      return
    }
    const st = signalStateMap.get(accountId)
    if (st?.status === 'embedded') {
      signalRetryActive.delete(accountId)
      return
    }
    const e = await window.api.signal.embed(accountId).catch(() => null)
    if (!signalRetryActive.get(accountId)) return
    if (e) {
      signalStateMap.set(accountId, e)
      updateSignalPanelUI(accountId)
      if (e.status === 'embedded') {
        startRelocateLoop()
        signalRetryActive.delete(accountId)
        return
      }
    }
    attempt++
    if (attempt > 60) {
      // 长时间仍失败（如子进程反复拉起失败）：停止空转，交由 UI 提示 / 用户手动重启
      signalRetryActive.delete(accountId)
      return
    }
    const delay = attempt <= 3 ? 1500 : 4000
    signalRetryTimers.set(accountId, window.setTimeout(() => void tryOnce(), delay))
  }
  signalRetryTimers.set(accountId, window.setTimeout(() => void tryOnce(), 1200))
}

/**
 * 重启 Signal（保留登录态 / 聊天记录）。
 * 代理（SOCKS5）是通过启动参数/环境变量注入的，改完设置后必须重启子进程才生效，
 * 所以在"一直卡在正在同步联系人和群组"时，配好代理后点这个即可重新连接。
 */
async function restartSignal(accountId: string): Promise<void> {
  showToast('正在重启 Signal（保留登录态）…')
  const st = await window.api.signal.relaunch(accountId)
  signalStateMap.set(accountId, st)
  updateSignalPanelUI(accountId)
  await ensureSignalEmbedded(accountId)
  scheduleSignalRetry(accountId)
}

/** 清除本机 Signal 登录数据（删除 profile 目录），随后重新拉起等待重新扫码 */
async function clearSignalData(accountId: string): Promise<void> {
  if (
    !window.confirm('将清除本机 Signal 登录数据（聊天记录不保留），需要重新用手机扫码关联。确定继续？')
  ) {
    return
  }
  // reset 会删除该账号的 profile 目录
  await window.api.signal.reset(accountId)
  signalStateMap.set(accountId, {
    accountId,
    status: 'idle',
    pid: null,
    unread: 0,
    embedded: false,
    error: undefined,
  })
  updateSignalPanelUI(accountId)
  await new Promise((r) => setTimeout(r, 400))
  const st = await window.api.signal.launch(accountId)
  signalStateMap.set(accountId, st)
  updateSignalPanelUI(accountId)
  await ensureSignalEmbedded(accountId)
  scheduleSignalRetry(accountId)
}

function updateSignalPanelUI(accountId: string): void {
  const st = signalStateMap.get(accountId)
  const wrapper = webviewWrappers.get(accountId)
  if (!wrapper) return
  const dot = wrapper.querySelector<HTMLElement>('.signal-status-dot')
  const text = wrapper.querySelector<HTMLElement>('.signal-status-text')
  const loadingEl = wrapper.querySelector<HTMLElement>('.signal-loading')
  if (text) text.textContent = signalStatusText(accountId)
  if (dot) {
    dot.className = 'signal-status-dot'
    if (st) dot.classList.add(`st-${st.status}`)
  }
  if (loadingEl) {
    // 只有"确实已嵌入"才隐藏占位：running 但窗口尚未收进主窗口时仍显示"启动中"，
    // 否则内嵌区会是一块纯空白（外壳 UI 正常，看起来像卡死）。
    loadingEl.style.display = st?.embedded ? 'none' : 'flex'
  }
  renderAccountList()
}

/**
 * 立即上报一次当前账号的嵌入区 rect。
 * 心跳 / window resize / 嵌入区尺寸变化都会调用它；主进程会比较换算后的屏幕坐标，
 * 值没变就直接跳过，所以重复调用是廉价且安全的。
 */
function reportEmbedBounds(): void {
  const acc = accounts.find((a) => a.id === activeAccountId)
  if (!acc || (acc.platform !== 'signal' && acc.platform !== 'line')) return
  // 不在账号视图时容器已隐藏（rect 为 0），也不该让主进程重新 show 原生窗口
  if (currentView !== 'account') return
  const isLine = acc.platform === 'line'
  const st = isLine ? lineStateMap.get(acc.id) : signalStateMap.get(acc.id)
  if (!st || (st.status !== 'embedded' && st.status !== 'running')) return
  const wrapper = webviewWrappers.get(acc.id)
  const area = wrapper?.querySelector<HTMLElement>('.signal-embed-area')
  if (!area) return
  const rect = area.getBoundingClientRect()
  // 布局未完成时不要把原生窗口摆到 0 尺寸
  if (rect.width < 40 || rect.height < 40) return
  const bounds = {
    x: Math.round(rect.x),
    y: Math.round(rect.y),
    width: Math.round(rect.width),
    height: Math.round(rect.height),
  }
  if (isLine) void window.api.line.relocate(acc.id, bounds)
  else void window.api.signal.relocate(acc.id, bounds)
}

/** 合并同一帧内的多次布局变化后再上报 */
function scheduleEmbedBounds(): void {
  if (embedRaf) return
  embedRaf = requestAnimationFrame(() => {
    embedRaf = 0
    reportEmbedBounds()
  })
}

function startRelocateLoop(): void {
  // 窗口缩放/拖动引起的内嵌区变化由 resize 事件立即上报（rAF 合并），不再依赖高频定时器
  if (!embedResizeBound) {
    embedResizeBound = true
    window.addEventListener('resize', scheduleEmbedBounds)
  }
  if (embedAreaObserver == null && typeof ResizeObserver !== 'undefined') {
    embedAreaObserver = new ResizeObserver(() => scheduleEmbedBounds())
  }
  if (relocateTimer == null) {
    // 兜底心跳：只补漏（切账号、异步布局完成等）；主进程侧会去重，不会造成抖动
    relocateTimer = window.setInterval(reportEmbedBounds, 1500)
  }
  const wrapper = activeAccountId ? webviewWrappers.get(activeAccountId) : null
  const area = wrapper?.querySelector<HTMLElement>('.signal-embed-area') || null
  if (embedAreaObserver && area !== embedAreaTarget) {
    embedAreaObserver.disconnect()
    embedAreaTarget = area
    if (area) embedAreaObserver.observe(area)
  }
  // 刚嵌入时布局可能还没稳定，补两次延迟上报
  for (const d of [300, 1200]) window.setTimeout(reportEmbedBounds, d)
}

/* ==================== 翻译面板 ==================== */
function toggleTranslationPanel(): void {
  translatePanelOpen = !translatePanelOpen
  const panel = $('#translation-panel')
  if (panel) panel.classList.toggle('hidden', !translatePanelOpen)
}

async function doManualTranslate(): Promise<void> {
  const input = $('#translate-input') as HTMLTextAreaElement | null
  const output = $('#translate-output')
  if (!input || !output || translateBusy) return
  const text = input.value.trim()
  if (!text) {
    showToast('请输入要翻译的文本', 'error')
    return
  }
  translateBusy = true
  output.textContent = '翻译中…'
  try {
    const result = await window.api.translate(text, settings.defaultTargetLang || 'zh-CN')
    if (result.success) {
      output.textContent = result.translated || '（无译文）'
      if (result.fromCache) showToast('命中缓存', 'info')
    } else {
      output.textContent = result.error || '翻译失败'
      showToast(result.error || '翻译失败', 'error')
    }
  } catch (e) {
    output.textContent = '翻译失败'
    showToast(e instanceof Error ? e.message : '翻译失败', 'error')
  } finally {
    translateBusy = false
  }
}

/* ==================== 添加账号 ==================== */
function openAddAccountModal(): void {
  const modal = $('#modal-add-account')
  // 顶部当前选中的平台分类作为默认类型（仅当不是"全部"时）
  const preset: Platform | null =
    currentCategory !== 'all' ? currentCategory : null
  pendingPlatform = preset
  if (modal) {
    modal.classList.remove('hidden')
    const nameInput = $('#input-account-name') as HTMLInputElement | null
    if (nameInput) nameInput.value = ''
    $$<HTMLElement>('.platform-btn').forEach((b) =>
      b.classList.toggle('selected', b.dataset.type === preset),
    )
  }
}

/** 首页快捷添加：直接创建账号并打开，无需弹框输入名称 */
function quickAddAccount(platform: string): void {
  const p = platform as Platform
  const count = accounts.filter((a) => a.platform === p).length + 1
  const name = `${PLATFORM_LABEL[p]} ${count}`
  void window.api.accounts
    .add({ platform: p, name })
    .then(async (acc) => {
      currentCategory = 'all'
      renderCategoryTabs()
      // 先刷新列表（accounts 数组包含新账号），再切换，否则激活逻辑找不到该账号
      await refreshAccounts()
      showToast(`已添加 ${acc.name}`, 'success')
      switchToAccount(acc.id)
    })
    .catch((e) => {
      showToast(e instanceof Error ? e.message : '添加失败', 'error')
    })
}

function selectPlatform(type: string): void {
  pendingPlatform = type as Platform
  $$<HTMLElement>('.platform-btn').forEach((b) =>
    b.classList.toggle('selected', b.dataset.type === type),
  )
}

async function confirmAddAccount(): Promise<void> {
  if (!pendingPlatform) {
    showToast('请先选择平台类型', 'error')
    return
  }
  const nameInput = $('#input-account-name') as HTMLInputElement | null
  const name = nameInput?.value.trim() || ''
  try {
    const acc = await window.api.accounts.add({ platform: pendingPlatform, name })
    pendingPlatform = null
    closeAddAccountModal()
    showToast(`已添加 ${PLATFORM_LABEL[acc.platform]} 账号`, 'success')
    currentCategory = 'all'
    renderCategoryTabs()
    await refreshAccounts()
    switchToAccount(acc.id)
  } catch (e) {
    showToast(e instanceof Error ? e.message : '添加失败', 'error')
  }
}

function closeAddAccountModal(): void {
  $('#modal-add-account')?.classList.add('hidden')
}

/* ==================== 设置 ==================== */
function loadSettingsIntoForm(): void {
  const auto = $('#auto-translate') as HTMLInputElement | null
  if (auto) auto.checked = settings.autoTranslateEnabled
  const target = $('#target-lang') as HTMLSelectElement | null
  if (target) target.value = settings.defaultTargetLang || 'zh-CN'
  const key = $('#openai-api-key') as HTMLInputElement | null
  if (key) key.value = settings.openaiApiKey
  const base = $('#openai-base-url') as HTMLInputElement | null
  if (base) base.value = settings.openaiBaseUrl
  const model = $('#openai-model') as HTMLInputElement | null
  if (model) model.value = settings.openaiModel
  const sendTargetInput = $('#send-target-lang') as HTMLSelectElement | null
  if (sendTargetInput) sendTargetInput.value = settings.sendTargetLang || 'en'
  const engineSel = $('#translate-engine') as HTMLSelectElement | null
  if (engineSel) engineSel.value = settings.translateEngine || 'google'
  const provider = $('#ai-provider') as HTMLSelectElement | null
  if (provider) provider.value = settings.aiProvider || 'openai'
  const dKey = $('#deepseek-api-key') as HTMLInputElement | null
  if (dKey) dKey.value = settings.deepseekApiKey
  const dBase = $('#deepseek-base-url') as HTMLInputElement | null
  if (dBase) dBase.value = settings.deepseekBaseUrl
  const dModel = $('#deepseek-model') as HTMLInputElement | null
  if (dModel) dModel.value = settings.deepseekModel
  const proxy = $('#openai-proxy') as HTMLInputElement | null
  if (proxy) proxy.value = settings.proxyHost ? `${settings.proxyHost}:${settings.proxyPort || 0}` : ''
  const proxyAuto = $('#openai-proxy-autodetect') as HTMLInputElement | null
  if (proxyAuto) proxyAuto.checked = settings.proxyAutoDetect !== false
  const pu = $('#openai-proxy-username') as HTMLInputElement | null
  if (pu) pu.value = settings.proxyUsername
  const pp = $('#openai-proxy-password') as HTMLInputElement | null
  if (pp) pp.value = settings.proxyPassword
  const sttModel = $('#stt-model') as HTMLInputElement | null
  if (sttModel) sttModel.value = settings.sttModel
  const sttKey = $('#stt-openai-key') as HTMLInputElement | null
  if (sttKey) sttKey.value = settings.sttApiKey
  const fsInput = $('#translation-font-size') as HTMLInputElement | null
  if (fsInput) {
    fsInput.value = String(settings.fontSize)
    const v = $('#translation-font-size-value')
    if (v) v.textContent = `${settings.fontSize}px`
  }
  const fc = $('#translation-font-color') as HTMLSelectElement | null
  if (fc) fc.value = settings.badgeColor
  const bc = $('#translation-bg-color') as HTMLSelectElement | null
  if (bc) bc.value = settings.badgeBgColor
  const notif = $('#desktop-notifications') as HTMLInputElement | null
  if (notif) notif.checked = settings.notificationsEnabled
}

function bindSettingsEvents(): void {
  const fsInput = $('#translation-font-size') as HTMLInputElement | null
  fsInput?.addEventListener('input', () => {
    const v = $('#translation-font-size-value')
    if (v) v.textContent = `${fsInput.value}px`
  })
  const auto = $('#auto-translate') as HTMLInputElement | null
  auto?.addEventListener('change', () => {
    void saveSettings({ autoTranslateEnabled: auto.checked })
    showToast('自动翻译设置已保存', 'success')
  })
  const target = $('#target-lang') as HTMLSelectElement | null
  target?.addEventListener('change', () => {
    void saveSettings({ defaultTargetLang: target.value })
    showToast('目标语言已更新', 'success')
  })
  const sendTarget = $('#send-target-lang') as HTMLSelectElement | null
  sendTarget?.addEventListener('change', () => {
    const v = (sendTarget.value.trim() || 'en') as string
    void saveSettings({ sendTargetLang: v }).then(() => {
      showToast(`发送翻译语言已更新为 ${v}`, 'success')
      // 同步到所有已打开的聊天页（不重启应用立即生效）
      webviewWrappers.forEach((wrapper) => {
        const wv = wrapper.querySelector<MtWebview>('webview')
        if (wv) safeSendToWebview(wv, 'mt-settings-updated', { sendLang: v })
      })
    })
  })
  const notif = $('#desktop-notifications') as HTMLInputElement | null
  notif?.addEventListener('change', () => {
    void saveSettings({ notificationsEnabled: notif.checked })
    showToast('通知设置已保存', 'success')
  })

  const engineSel = $('#translate-engine') as HTMLSelectElement | null
  engineSel?.addEventListener('change', () => {
    const v = (['google', 'openai', 'deepseek'] as const).includes(engineSel.value as never)
      ? (engineSel.value as 'google' | 'openai' | 'deepseek')
      : 'google'
    void saveSettings({ translateEngine: v }).then(() => {
      showToast(`默认翻译引擎已切换为 ${v === 'google' ? 'Google' : v === 'deepseek' ? 'DeepSeek' : 'OpenAI'}`, 'success')
    })
  })

  const providerSel = $('#ai-provider') as HTMLSelectElement | null
  providerSel?.addEventListener('change', () => {
    const v = providerSel.value === 'deepseek' ? 'deepseek' : 'openai'
    void saveSettings({ aiProvider: v }).then(() => {
      showToast(`AI 兜底引擎已切换为 ${v === 'deepseek' ? 'DeepSeek' : 'OpenAI'}`, 'success')
    })
  })
}

function saveSettings(partial: Partial<Settings>): Promise<Settings> {
  settings = { ...settings, ...partial }
  return window.api.settings.set(partial).then((s) => {
    settings = s
    return s
  })
}

async function saveDeepSeekConfig(): Promise<void> {
  const status = $('#deepseek-config-status')
  const key = ($('#deepseek-api-key') as HTMLInputElement | null)?.value.trim() || ''
  const base = ($('#deepseek-base-url') as HTMLInputElement | null)?.value.trim() || ''
  const model = ($('#deepseek-model') as HTMLInputElement | null)?.value.trim() || ''
  try {
    await saveSettings({ deepseekApiKey: key, deepseekBaseUrl: base, deepseekModel: model })
    if (status) {
      status.textContent = '已保存'
      status.style.color = '#4caf50'
    }
    showToast('DeepSeek 配置已保存', 'success')
  } catch (e) {
    if (status) {
      status.textContent = e instanceof Error ? e.message : '保存失败'
      status.style.color = '#f44336'
    }
  }
}

async function testDeepSeekConnection(): Promise<void> {
  const status = $('#deepseek-config-status')
  const key = ($('#deepseek-api-key') as HTMLInputElement | null)?.value.trim() || ''
  const base = ($('#deepseek-base-url') as HTMLInputElement | null)?.value.trim() || ''
  const model = ($('#deepseek-model') as HTMLInputElement | null)?.value.trim() || ''
  // 先用当前表单值保存，确保用最新配置测试
  await saveSettings({ deepseekApiKey: key, deepseekBaseUrl: base, deepseekModel: model })
  if (status) {
    status.textContent = '测试中…'
    status.style.color = '#ffa726'
  }
  try {
    const result = await window.api.settings.testDeepSeek()
    if (status) {
      status.textContent = result.success ? `连接正常（${result.latencyMs}ms）` : `失败: ${result.error || ''}`
      status.style.color = result.success ? '#4caf50' : '#f44336'
    }
  } catch (e) {
    if (status) {
      status.textContent = e instanceof Error ? e.message : '测试失败'
      status.style.color = '#f44336'
    }
  }
}

async function saveOpenAIConfig(): Promise<void> {
  const status = $('#openai-config-status')
  const key = ($('#openai-api-key') as HTMLInputElement | null)?.value.trim() || ''
  const base = ($('#openai-base-url') as HTMLInputElement | null)?.value.trim() || ''
  const model = ($('#openai-model') as HTMLInputElement | null)?.value.trim() || ''
  const proxyStr = ($('#openai-proxy') as HTMLInputElement | null)?.value.trim() || ''
  const username = ($('#openai-proxy-username') as HTMLInputElement | null)?.value.trim() || ''
  const password = ($('#openai-proxy-password') as HTMLInputElement | null)?.value || ''
  const [host, portStr] = proxyStr.split(':')
  const port = portStr ? Number(portStr) || 0 : 0
  try {
    await saveSettings({
      openaiApiKey: key,
      openaiBaseUrl: base,
      openaiModel: model,
      proxyHost: host || '',
      proxyPort: port,
      proxyUsername: username,
      proxyPassword: password,
      proxyAutoDetect: ($('#openai-proxy-autodetect') as HTMLInputElement | null)?.checked ?? true,
    })
    if (status) {
      status.textContent = '已保存'
      status.style.color = '#4caf50'
    }
    showToast('OpenAI / SOCKS5 配置已保存；若 Signal 已在运行，请在账号面板点“重启”让代理生效', 'success')
  } catch (e) {
    if (status) {
      status.textContent = e instanceof Error ? e.message : '保存失败'
      status.style.color = '#f44336'
    }
  }
}

async function testOpenAIConnection(): Promise<void> {
  const status = $('#openai-config-status')
  const key = ($('#openai-api-key') as HTMLInputElement | null)?.value.trim() || ''
  const base = ($('#openai-base-url') as HTMLInputElement | null)?.value.trim() || ''
  const model = ($('#openai-model') as HTMLInputElement | null)?.value.trim() || ''
  const proxyStr = ($('#openai-proxy') as HTMLInputElement | null)?.value.trim() || ''
  const username = ($('#openai-proxy-username') as HTMLInputElement | null)?.value.trim() || ''
  const password = ($('#openai-proxy-password') as HTMLInputElement | null)?.value || ''
  const [host, portStr] = proxyStr.split(':')
  const port = portStr ? Number(portStr) || 0 : 0
  // 先用当前表单值保存，确保用最新配置（含代理）测试
  await saveSettings({
    openaiApiKey: key,
    openaiBaseUrl: base,
    openaiModel: model,
    proxyHost: host || '',
    proxyPort: port,
    proxyUsername: username,
    proxyPassword: password,
    proxyAutoDetect: ($('#openai-proxy-autodetect') as HTMLInputElement | null)?.checked ?? true,
  })
  if (status) {
    status.textContent = '测试中…'
    status.style.color = '#ffa726'
  }
  try {
    const result = await window.api.settings.testOpenAI()
    if (status) {
      status.textContent = result.success ? `连接正常（${result.latencyMs}ms）` : `失败: ${result.error || ''}`
      status.style.color = result.success ? '#4caf50' : '#f44336'
    }
  } catch (e) {
    if (status) {
      status.textContent = e instanceof Error ? e.message : '测试失败'
      status.style.color = '#f44336'
    }
  }
}

async function testProxyConnection(): Promise<void> {
  const status = $('#openai-config-status')
  const proxyStr = ($('#openai-proxy') as HTMLInputElement | null)?.value.trim() || ''
  const username = ($('#openai-proxy-username') as HTMLInputElement | null)?.value.trim() || ''
  const password = ($('#openai-proxy-password') as HTMLInputElement | null)?.value || ''
  const [host, portStr] = proxyStr.split(':')
  const port = portStr ? Number(portStr) || 0 : 0
  if (status) {
    status.textContent = '测试中…'
    status.style.color = '#ffa726'
  }
  try {
    const result = await window.api.settings.testProxy(
      host && port ? { host, port, username, password } : undefined
    )
    if (status) {
      status.textContent = result.success
        ? result.message || '代理连接正常'
        : `失败: ${result.error || ''}`
      status.style.color = result.success ? '#4caf50' : '#f44336'
    }
  } catch (e) {
    if (status) {
      status.textContent = e instanceof Error ? e.message : '测试失败'
      status.style.color = '#f44336'
    }
  }
}

async function saveSttConfig(): Promise<void> {
  const status = $('#stt-config-status')
  const model = ($('#stt-model') as HTMLInputElement | null)?.value.trim() || ''
  const key = ($('#stt-openai-key') as HTMLInputElement | null)?.value.trim() || ''
  await saveSettings({ sttModel: model, sttApiKey: key })
  if (status) {
    status.textContent = '已保存'
    status.style.color = '#4caf50'
  }
  showToast('语音识别设置已保存', 'success')
}

async function saveFontConfig(): Promise<void> {
  const status = $('#font-config-status')
  const size = Number(($('#translation-font-size') as HTMLInputElement | null)?.value) || 13
  const color = ($('#translation-font-color') as HTMLSelectElement | null)?.value || '#c62828'
  const bgColor = ($('#translation-bg-color') as HTMLSelectElement | null)?.value || 'rgba(255, 235, 238, 0.95)'
  try {
    await saveSettings({ fontSize: size, badgeColor: color, badgeBgColor: bgColor })
    if (status) {
      status.textContent = '已保存并生效'
      status.style.color = '#4caf50'
    }
    // 同步到所有已打开的 WebView
    const code = `window.translator && window.translator.updateStyle(${size}, ${JSON.stringify(color)}, ${JSON.stringify(bgColor)})`
    webviewWrappers.forEach((wrapper) => {
      const wv = wrapper.querySelector<MtWebview>('webview')
      if (wv) void wv.executeJavaScript(code).catch(() => undefined)
    })
    showToast('译文显示设置已保存', 'success')
  } catch (e) {
    if (status) {
      status.textContent = e instanceof Error ? e.message : '保存失败'
      status.style.color = '#f44336'
    }
  }
}

async function clearAllCaches(): Promise<void> {
  try {
    const stats: CacheStats = await window.api.cacheClear()
    showToast(`已清理缓存（当前 ${stats.size} 条）`, 'success')
  } catch (e) {
    showToast(e instanceof Error ? e.message : '清理失败', 'error')
  }
}

/* ==================== 数据加载 ==================== */
async function refreshAccounts(): Promise<void> {
  accounts = await window.api.accounts.list()
  // 初始化账号级翻译开关（保留当前运行时覆盖值）
  for (const a of accounts) {
    if (!accountAutoTranslate.has(a.id)) {
      accountAutoTranslate.set(a.id, typeof a.autoTranslate === 'boolean' ? a.autoTranslate : Boolean(settings.autoTranslateEnabled))
    }
    if (!accountSendTranslate.has(a.id)) accountSendTranslate.set(a.id, a.autoSendTranslate !== false)
  }
  renderCategoryTabs()
  renderAccountList()
  updateAutoTranslateButtons()
  updateAutoSendTranslateButtons()
}

/* ==================== Signal 状态订阅 ==================== */
function subscribeSignalStates(): void {
  window.api.signal.onState((s: SignalState) => {
    signalStateMap.set(s.accountId, s)
    updateSignalPanelUI(s.accountId)
    // 若该账号为当前激活账号，重新定位
    if (s.accountId === activeAccountId && (s.status === 'embedded' || s.status === 'running')) {
      // 不在账号视图时只更新状态：切页面时 detach 会推一次 running，
      // 若在这里补试/定位，原生窗口会被重新 show 出来盖住首页/设置页
      if (currentView !== 'account') return
      startRelocateLoop()
      // 运行中但尚未嵌入（窗口被重建 / 子进程被自愈重启）：主动补试，避免停在空白
      if (!s.embedded) scheduleSignalRetry(s.accountId)
    }
  })
  window.api.line.onState((s: LineState) => {
    console.log(`[renderer] line onState status=${s.status} embedded=${s.embedded} account=${s.accountId} active=${activeAccountId}`)
    lineStateMap.set(s.accountId, s)
    updateLinePanelUI(s.accountId)
    if (s.status === 'embedded') {
      setTimeout(() => {
        const w = webviewWrappers.get(s.accountId)
        const loading = w?.querySelector('.signal-loading') as HTMLElement | null
        const area = w?.querySelector('.signal-embed-area') as HTMLElement | null
        const panel = w?.querySelector('.signal-panel') as HTMLElement | null
        console.log('[renderer] diag-loading', JSON.stringify({
          wrapper: !!w,
          panelDisplay: panel ? getComputedStyle(panel).display : 'no-panel',
          loadingDisplay: loading ? getComputedStyle(loading).display : 'no-el',
          loadingInline: loading?.style.display ?? 'no-el',
          areaDisplay: area ? getComputedStyle(area).display : 'no-el',
          areaRect: area ? `${area.getBoundingClientRect().width}x${area.getBoundingClientRect().height}` : 'no-el',
        }))
      }, 600)
    }
    // 若该账号为当前激活账号，重新定位
    if (s.accountId === activeAccountId && (s.status === 'embedded' || s.status === 'running')) {
      startRelocateLoop()
    }
  })
}

/* ==================== WebView 未读订阅 ==================== */
/** 只更新单个账号卡片角标（避免全量重绘打断加载状态/时间行） */
function updateAccountBadge(accountId: string): void {
  const card = document.querySelector<HTMLElement>(
    `.account-card[data-account-id="${CSS.escape(accountId)}"]`,
  )
  if (!card) return
  const acc = accounts.find((a) => a.id === accountId)
  if (!acc) return
  const badgeEl = card.querySelector<HTMLElement>('.account-badge')
  if (badgeEl) {
    const text = accountBadgeText(acc)
    badgeEl.textContent = text
    badgeEl.classList.toggle('visible', Boolean(text))
  }
}

function subscribeWebviewUnread(): void {
  window.api.webview.onUnread((u: WebviewUnread) => {
    accountUnread.set(u.accountId, u.unread)
    updateAccountBadge(u.accountId)
  })
}

/* ==================== WebView 活动订阅（最后消息时间） ==================== */
function subscribeWebviewActivity(): void {
  // 旧版 preload 可能尚未暴露 onActivity，防御性检查避免阻塞启动
  if (typeof window.api.webview.onActivity !== 'function') return
  window.api.webview.onActivity((a) => {
    if (!a || !a.accountId || !Number.isFinite(a.lastMessageTime)) return
    accountActivity.set(a.accountId, a.lastMessageTime)
    // 仅更新时间行，避免全量重绘打断加载状态/交互
    const el = document.getElementById(`timer-${a.accountId}`)
    if (el && el.dataset.loading !== '1') {
      const acc = accounts.find((x) => x.id === a.accountId)
      el.textContent = acc ? accountTimerText(acc) : formatRelativeTime(a.lastMessageTime)
      el.classList.toggle('active', Boolean(acc && accountTimerText(acc)))
    }
  })
}

/* ==================== 原生视图遮挡协调 ==================== */
/** 宿主 DOM 浮层（modal 等）打开时通知主进程暂停 LINE/Signal 原生视图，避免其遮挡浮层 */
let overlayGateActive = false
function syncOverlayGate(): void {
  const on =
    !!document.querySelector('.modal:not(.hidden)') ||
    !!document.querySelector('.login-gate:not(.hidden)') ||
    !!document.querySelector('#auth-pop:not(.hidden)')
  if (on === overlayGateActive) return
  overlayGateActive = on
  void window.api.nativeOverlay.set(on).catch(() => {})
}
function startOverlayGate(): void {
  syncOverlayGate()
  const mo = new MutationObserver(() => syncOverlayGate())
  mo.observe(document.body, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['class'],
  })
}

/* ==================== 登录认证门 ==================== */
let appBooted = false
let authBound = false

/* ---- 授权错误码 → 提示文案 ---- */
const AUTH_CODE_MSG: Record<number, string> = {
  1001: '参数缺失或格式错误，请检查账号、密码是否填写完整',
  1002: '账号不存在，请确认账号是否正确',
  1003: '账号或密码错误，请重新输入',
  1004: '账号已被停用，请联系管理员',
  1005: '授权已过期，请联系管理员续期',
  1006: '连续登录失败次数过多，账号已被临时锁定，请稍后再试',
  2001: '登录已失效（被踢下线或已登出），请重新登录',
  2002: '登录令牌与设备不匹配，请重新登录',
  5000: '服务器异常，请稍后重试',
}
function authErrorText(code: number | undefined, fallback?: string): string {
  if (code != null && AUTH_CODE_MSG[code]) return AUTH_CODE_MSG[code]
  return fallback && fallback.trim() ? fallback : '登录失败，请重试'
}

/* ---- 顶栏授权用户信息（用户名 / 到期 / 剩余天数 / 退出） ---- */
interface AuthUserView {
  username?: string
  expireAt?: number | null
  daysLeft?: number
}
function fmtAuthExpire(ts: number): string {
  const d = new Date(ts)
  const p = (n: number): string => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}
function authExpireState(expireAt: number | null | undefined): {
  text: string
  cls: 'ok' | 'warn' | 'exp'
  daysText: string
} {
  if (expireAt == null) return { text: '长期授权', cls: 'ok', daysText: '长期有效' }
  const remainMs = expireAt - Date.now()
  if (remainMs <= 0) return { text: '已过期', cls: 'exp', daysText: '已过期' }
  const days = Math.ceil(remainMs / 86400000)
  if (days <= 1) return { text: '今日到期', cls: 'warn', daysText: '今天到期' }
  if (days <= 3) return { text: `剩余 ${days} 天`, cls: 'warn', daysText: `${days} 天` }
  return { text: '授权正常', cls: 'ok', daysText: `${days} 天` }
}
function fillAuthPop(u: AuthUserView): void {
  const st = authExpireState(u.expireAt)
  const uname = $('#auth-pop-username')
  if (uname) uname.textContent = u.username || ''
  const statusEl = $('#auth-pop-status')
  if (statusEl) {
    statusEl.textContent = st.text
    statusEl.className = `auth-pop-status ${st.cls}`
  }
  const expireEl = $('#auth-pop-expire')
  if (expireEl) expireEl.textContent = u.expireAt != null ? fmtAuthExpire(u.expireAt) : '长期有效'
  const daysEl = $('#auth-pop-days')
  if (daysEl) daysEl.textContent = st.daysText
}
function renderAuthUser(u: AuthUserView | null | undefined): void {
  const chip = $('#auth-chip')
  const nameEl = $('#auth-chip-name')
  if (!chip || !nameEl) return
  if (!u || !u.username) {
    hideAuthUser()
    return
  }
  nameEl.textContent = u.username
  nameEl.title = u.username
  chip.classList.remove('hidden')
  fillAuthPop(u)
}
function hideAuthUser(): void {
  $('#auth-chip')?.classList.add('hidden')
}
function closeAuthPop(): void {
  $('#auth-pop')?.classList.add('hidden')
}
async function toggleAuthPop(): Promise<void> {
  const pop = $('#auth-pop')
  if (!pop) return
  if (!pop.classList.contains('hidden')) {
    closeAuthPop()
    return
  }
  // 打开前拉一次最新状态（心跳可能在后台刷新过到期信息）
  try {
    const st = await window.api.auth.status()
    if (st.loggedIn && st.username) fillAuthPop(st)
  } catch {
    /* 忽略：以已有内容展示 */
  }
  pop.classList.remove('hidden')
}
async function logoutUser(): Promise<void> {
  try {
    await window.api.auth.logout()
  } catch {
    /* 忽略：服务端上报失败不阻塞本地登出 */
  }
  closeAuthPop()
  hideAuthUser()
  showLoginGate()
  showToast('已退出登录', 'success')
}
function bindAuthUserUi(): void {
  $('#auth-chip')?.addEventListener('click', () => void toggleAuthPop())
  $('#auth-pop-logout')?.addEventListener('click', () => void logoutUser())
  document.addEventListener('mousedown', (e) => {
    const pop = $('#auth-pop')
    if (!pop || pop.classList.contains('hidden')) return
    const t = e.target as Node
    if (pop.contains(t) || $('#auth-chip')?.contains(t)) return
    closeAuthPop()
  })
}

function clearLoginMsg(): void {
  const el = $('#login-msg')
  if (el) {
    el.textContent = ''
    el.classList.add('hidden')
  }
}

function showLoginGate(): void {
  const gate = $('#login-gate')
  if (!gate) return
  const wasHidden = gate.classList.contains('hidden')
  gate.classList.remove('hidden')
  clearLoginMsg()
  bindAuthEvents()
  // 记住账号：有本地记录的用户名则自动回填，光标落到密码框
  const remembered = localStorage.getItem('mt_remembered_user') || ''
  const unameInput = $('#login-username') as HTMLInputElement | null
  if (remembered && unameInput && !unameInput.value) {
    unameInput.value = remembered
  }
  syncOverlayGate()
  if (wasHidden) {
    const pwd = $('#login-password') as HTMLInputElement | null
    const un = $('#login-username') as HTMLInputElement | null
    if (pwd && pwd.value) pwd.focus()
    else if (un && un.value) pwd?.focus()
    else un?.focus()
  }
}

function hideLoginGate(): void {
  const gate = $('#login-gate')
  if (!gate) return
  gate.classList.add('hidden')
  syncOverlayGate()
}

function bindAuthEvents(): void {
  if (authBound) return
  authBound = true
  $('#login-submit')?.addEventListener('click', () => void handleLogin())
  $('#login-username')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') void handleLogin()
  })
  $('#login-password')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') void handleLogin()
  })
  $('#login-settings-open')?.addEventListener('click', () => void openAuthConfigModal())
}

async function handleLogin(): Promise<void> {
  const unameInput = $('#login-username') as HTMLInputElement | null
  const pwdInput = $('#login-password') as HTMLInputElement | null
  if (!unameInput || !pwdInput) return
  const uname = unameInput.value.trim()
  const pwd = pwdInput.value
  if (!uname || !pwd) {
    showToast('请输入用户名和密码', 'error')
    return
  }
  const submit = $('#login-submit') as HTMLButtonElement | null
  if (submit) {
    submit.disabled = true
    submit.textContent = '登录中…'
  }
  try {
    const res = await window.api.auth.login(uname, pwd)
    if (res.ok) {
      // 记住账号：登录成功后保存用户名，下次打开登录门自动回填
      try {
        localStorage.setItem('mt_remembered_user', res.username || uname)
      } catch {
        /* ignore */
      }
      renderAuthUser(res)
      hideLoginGate()
      if (!appBooted) {
        appBooted = true
        void boot()
      }
    } else {
      showToast(authErrorText(res.code, res.error || '登录失败，请重试'), 'error')
    }
  } catch {
    showToast('登录失败，请检查服务器设置', 'error')
  } finally {
    if (submit) {
      submit.disabled = false
      submit.textContent = '登 录'
    }
  }
}

async function openAuthConfigModal(): Promise<void> {
  const hostInput = $('#input-auth-host') as HTMLInputElement | null
  const portInput = $('#input-auth-port') as HTMLInputElement | null
  try {
    const cfg = await window.api.auth.getConfig()
    if (hostInput) hostInput.value = cfg.host
    // port 为 0 表示"未设置"，输入框留空（留空即用默认端口）
    if (portInput) portInput.value = cfg.port > 0 ? String(cfg.port) : ''
  } catch {
    /* 读取失败则保持默认占位符 */
  }
  $('#modal-auth-config')?.classList.remove('hidden')
  syncOverlayGate()
}

function closeAuthConfigModal(): void {
  $('#modal-auth-config')?.classList.add('hidden')
  syncOverlayGate()
}

async function saveAuthConfig(): Promise<void> {
  const host = ((($('#input-auth-host') as HTMLInputElement | null)?.value) || '').trim()
  const portRaw = (($('#input-auth-port') as HTMLInputElement | null)?.value || '').trim()
  // API 地址与端口均可留空；留空即使用系统默认 api(http://103.214.142.112)/端口(1234)。
  // 端口为空时传 0（表示未设置，弹窗下次打开显示空、实际连接用默认端口）。
  let port = 0
  if (portRaw !== '') {
    const p = Number(portRaw)
    if (!Number.isInteger(p) || p <= 0 || p > 65535) {
      showToast('请输入正确的端口号（或留空使用默认 1234）', 'error')
      return
    }
    port = p
  }
  try {
    await window.api.auth.setConfig({ host, port })
    showToast(host || portRaw ? '服务器设置已保存' : '已清空，将使用系统默认服务器', 'success')
    closeAuthConfigModal()
  } catch {
    showToast('保存失败', 'error')
  }
}

async function startApp(): Promise<void> {
  let loggedIn = false
  try {
    const st = await window.api.auth.status()
    loggedIn = !!st.loggedIn
    // 心跳检测到登录失效（后台停用/到期/被踢）→ 自动退出回登录界面并提示原因
    window.api.auth.onExpired((info) => {
      if (!appBooted) return
      hideAuthUser()
      closeAuthPop()
      showLoginGate()
      showToast(authErrorText(info?.code, '登录已失效，请重新登录'), 'error')
    })
  } catch {
    loggedIn = false
  }
  if (loggedIn) {
    hideLoginGate()
    appBooted = true
    await boot()
  } else {
    showLoginGate()
  }
}

/* ==================== 初始化 ==================== */
async function boot(): Promise<void> {
  try {
    const [accs, cfg] = await Promise.all([
      window.api.accounts.list(),
      window.api.settings.get(),
    ])
    accounts = accs
    settings = cfg
  } catch {
    accounts = []
    settings = { ...DEFAULT_SETTINGS }
  }

  loadSettingsIntoForm()
  bindSettingsEvents()
  initUpdater()
  startOverlayGate()
  // 授权用户信息（顶栏 chip / 下拉详情 / 退出登录）
  bindAuthUserUi()
  try {
    const authSt = await window.api.auth.status()
    if (authSt.loggedIn) renderAuthUser(authSt)
  } catch {
    /* 忽略：不影响主流程 */
  }
  renderCategoryTabs()
  renderAccountList()
  subscribeSignalStates()
  subscribeWebviewUnread()
  // 主进程内存哨兵推送：按「最久未访问」休眠不活跃账号 —— 真正把 webview 渲染进程的内存还回去。
  // （旧版只弹一句 toast 就结束了，没有任何释放动作；阈值也只看主进程 heap，多开时永不触发。）
  try {
    window.api.onMemoryPressure?.((info) => {
      const limit =
        info.level === 'critical' ? MAX_RESIDENT_UNDER_CRITICAL : MAX_RESIDENT_UNDER_PRESSURE
      window.api.dbgSync(
        `mem:pressure:${info.level} total=${info.totalMB}MB/${info.totalMemMB}MB limit=${limit}`,
      )
      // 先停掉所有后台 guest 的扫描（省 CPU），再按预算休眠最久未访问的账号（释放内存）
      pauseAllInactiveWebviews()
      enforceResidentBudget(limit)
      showToast(
        `内存占用 ${info.totalMB}MB 偏高，已休眠不活跃账号以释放内存（切回自动恢复）`,
        'info',
      )
    })
  } catch {
    /* 旧 preload 未提供该 API：静默降级，不影响其它功能 */
  }
  // 多开性能：窗口最小化/被隐藏时暂停全部 guest 扫描；恢复可见时只放行当前激活账号。
  // （Electron <webview> 的 document.hidden 语义不可靠，故以宿主窗口可见性为准显式暂停）
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pauseAllWebviews()
    else resumeActiveWebview()
  })
  // 新特性订阅单独隔离：旧产物中相关 API 可能缺失，绝不阻塞顶部栏初始化
  try {
    subscribeWebviewActivity()
    startMessageTimer()
  } catch {
    /* 忽略：不影响核心功能 */
  }

  // 顶部栏按钮
  $$<HTMLElement>('.nav-btn[data-view]').forEach((btn) => {
    btn.addEventListener('click', () => switchView((btn.dataset.view as 'home' | 'settings') || 'home'))
  })
  const clockBtn = $('#btn-world-clock')
  clockBtn?.addEventListener('click', () => {
    $('#world-clock-panel')?.classList.toggle('hidden')
  })
  // 工具窗口：美国之音 / 天气 / DeepSeek 对话
  $('#btn-news')?.addEventListener('click', () => {
    void window.api.tools.openNewsReader()
  })
  $('#btn-weather')?.addEventListener('click', () => {
    void window.api.tools.openWeather()
  })
  $('#btn-gpt')?.addEventListener('click', () => {
    void window.api.tools.openGptChat()
  })
  $('#btn-openai')?.addEventListener('click', () => {
    void window.api.tools.openOpenAIChat()
  })
  const renameInput = $('#input-rename-name') as HTMLInputElement | null
  renameInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') confirmRename()
    else if (e.key === 'Escape') closeRenameModal()
  })

  // 世界时钟（窗口隐藏时无需刷新，省 CPU）
  updateWorldClocks()
  clockTimer = window.setInterval(() => {
    if (document.hidden) return
    updateWorldClocks()
  }, 1000)

  // 顶部栏 / 性能监控（隐藏时跳过，避免每 2s 白跑两次 IPC 取样）
  void refreshTopBar()
  topBarTimer = window.setInterval(() => {
    if (document.hidden) return
    void refreshTopBar()
  }, 2000)

  // 登录态/未读轮询（WebView 账号状态显示）：8s → 12s；renderAccountList 内部已有内容签名
  // 缓存，无变化时不重建 DOM。窗口隐藏时直接跳过。
  setInterval(() => {
    if (document.hidden) return
    renderAccountList()
  }, 12000)

  // 主进程崩溃重启后，Signal 嵌入需要重新连接
  const acc = activeAccountId ? accounts.find((a) => a.id === activeAccountId) : undefined
  if (!acc || !activeAccountId) return
  if (acc.platform === 'signal') {
    const st = signalStateMap.get(activeAccountId)
    if (st && (st.status === 'embedded' || st.status === 'running')) startRelocateLoop()
  } else if (acc.platform === 'line') {
    const st = lineStateMap.get(activeAccountId)
    if (st && (st.status === 'embedded' || st.status === 'running')) startRelocateLoop()
  }
}

/* ==================== 软件更新（自建后台 update.php / download.php） ==================== */
let updaterState: UpdaterState | null = null
let updaterManualCheck = false
/** 用户是否主动点过"下载/安装"（此时出错需要明确 toast，不能只静默变按钮） */
let updaterUserAction = false
/** installing 状态的 toast 只提示一次，避免状态多次推送时反复弹提示 */
let installingToastShown = false
let updaterInited = false

function initUpdater(): void {
  if (updaterInited) return
  updaterInited = true
  if (!window.api.updater?.onState) {
    // 主进程/preload 较旧、尚未提供更新 API：静默降级，不阻塞界面初始化
    return
  }
  window.api.updater.onState((s) => applyUpdaterState(s))
  // 登录后延迟 2 秒静默检查一次：非强制更新不弹窗，仅更新按钮文案；强制更新自动弹窗
  window.setTimeout(() => {
    void window.api.updater.check().catch(() => {
      resetUpdateButton()
      if (updaterManualCheck) showToast('检查更新失败', 'error')
    })
  }, 2000)
}

function resetUpdateButton(): void {
  const btn = $('#btn-check-update') as HTMLButtonElement | null
  if (!btn) return
  btn.disabled = false
  if (updaterState && (updaterState.status === 'update-found' || updaterState.status === 'verified')) {
    btn.textContent = '发现新版本，点击安装'
    btn.style.borderColor = '#1a73e8'
    btn.style.color = '#4fc3f7'
  } else {
    btn.textContent = '检查更新'
    btn.style.borderColor = ''
    btn.style.color = ''
  }
}

function applyUpdaterState(s: UpdaterState): void {
  const wasManual = updaterManualCheck
  updaterManualCheck = false
  updaterState = s
  const verEl = $('#app-version')
  if (verEl && s.currentVersion) verEl.textContent = `v${s.currentVersion}`
  const line = $('#update-status-line')

  switch (s.status) {
    case 'checking': {
      const btn = $('#btn-check-update') as HTMLButtonElement | null
      if (btn) {
        btn.disabled = true
        btn.textContent = '检查中…'
      }
      break
    }
    case 'no-update': {
      resetUpdateButton()
      if (line) line.textContent = '当前已是最新版本'
      if (wasManual) showToast('当前已是最新版本', 'success')
      break
    }
    case 'update-found': {
      resetUpdateButton()
      if (line) line.textContent = `发现新版本 ${s.latestVersion || ''}`
      // 手动检查或强制更新时自动弹窗；后台静默检查仅更新按钮提示
      if (wasManual || s.isForce) openUpdateModal()
      break
    }
    case 'downloading':
      // 重新下载：允许下一次进入 installing 时再提示一次
      installingToastShown = false
      openUpdateModal()
      updateProgressUi()
      break
    case 'verified':
      openUpdateModal()
      updateProgressUi()
      resetUpdateButton()
      break
    case 'installing': {
      const prim = $('#update-primary-btn') as HTMLButtonElement | null
      if (prim) {
        prim.disabled = true
        prim.textContent = '正在安装…'
      }
      // 静默安装没有可见窗口，必须明确告知用户"应用会退出、稍后手动打开"，
      // 否则用户会以为更新没反应，在安装过程中反复重开应用。
      if (!installingToastShown) {
        installingToastShown = true
        showToast('安装程序已启动，应用即将退出并自动完成安装；安装完成后请重新打开软件', 'success')
      }
      break
    }
    case 'error': {
      const prim = $('#update-primary-btn') as HTMLButtonElement | null
      if (prim) {
        prim.disabled = false
        prim.textContent = '重试'
      }
      // 安装失败后允许用户重试时再次看到"正在安装"提示
      installingToastShown = false
      resetUpdateButton()
      // 用户主动检查 / 点过下载/安装时出错要明确提示（避免静默后台检查也打扰）
      if (wasManual || updaterUserAction) {
        updaterUserAction = false
        showToast(s.message || '更新失败', 'error')
      }
      break
    }
    default:
      resetUpdateButton()
      break
  }
  // 统一让弹窗主按钮文字/可用态始终跟随当前 updaterState.status，避免状态变化后
  // 按钮仍显示旧文案（如 update-found 时还写着"重启并安装"，点击却误走下载）。
  const primBtn = $('#update-primary-btn') as HTMLButtonElement | null
  if (primBtn && s.status !== 'idle' && s.status !== 'checking') {
    primBtn.disabled = s.status === 'downloading' || s.status === 'installing'
    primBtn.textContent = primaryActionText(s.status)
  }
  updateProgressUi()
}

/** 点击"检查更新"（index.html 内联 onclick） */
function checkUpdateNow(): void {
  const s = updaterState
  // 已发现新版本 / 已下载校验完成：直接弹窗让用户下载或安装，无需重新检查
  if (s && (s.status === 'update-found' || s.status === 'verified')) {
    openUpdateModal()
    return
  }
  updaterManualCheck = true
  const btn = $('#btn-check-update') as HTMLButtonElement | null
  if (btn) {
    btn.disabled = true
    btn.textContent = '检查中…'
  }
  const checker = window.api.updater?.check
  if (!checker) {
    // 主进程/preload 较旧、尚未提供更新 API：恢复按钮并提示，避免一直"检查中"
    updaterManualCheck = false
    if (btn) {
      btn.disabled = false
      btn.textContent = '检查更新'
    }
    showToast('当前版本不支持在线检查更新', 'error')
    return
  }
  void checker.call(window.api.updater).catch(() => {
    updaterManualCheck = false
    resetUpdateButton()
    showToast('检查更新失败，请稍后重试', 'error')
  })
}

function openUpdateModal(): void {
  const modal = $('#modal-update')
  if (!modal) return
  modal.classList.remove('hidden')
  const s = updaterState
  const verLine = $('#update-version-line')
  if (verLine) {
    verLine.textContent = s
      ? `新版本 v${s.latestVersion || ''}（当前 v${s.currentVersion || ''}）`
      : '发现新版本'
  }
  const notes = $('#update-release-notes')
  if (notes) notes.textContent = s?.releaseNotes ? `更新内容：\n${s.releaseNotes}` : '（暂无更新说明）'
  const later = $('#update-later-btn') as HTMLButtonElement | null
  if (later) later.style.display = s?.isForce ? 'none' : ''
  const prim = $('#update-primary-btn') as HTMLButtonElement | null
  if (prim) prim.textContent = primaryActionText(s?.status)
}

/** 关闭更新弹窗。下载中点击"稍后再说"会先取消下载再关闭；安装 / 强制更新仍不允许关闭 */
function closeUpdateModal(): void {
  const s = updaterState
  if (!s) return
  if (s.status === 'installing') return
  if (s.status === 'update-found' && s.isForce) return
  if (s.status === 'downloading') {
    // 中途取消下载：通知主进程中止下载，随后关闭弹窗
    void window.api.updater.cancel().then(() => {
      updaterState = null
      $('#modal-update')?.classList.add('hidden')
    })
    return
  }
  $('#modal-update')?.classList.add('hidden')
}

function primaryActionText(st?: UpdaterStatus): string {
  switch (st) {
    case 'downloading':
      return '正在下载…'
    case 'verified':
      return '重启并安装'
    case 'installing':
      return '正在安装…'
    case 'error':
      return '重试'
    default:
      return '立即下载'
  }
}

/** 弹窗主按钮动作：未下载 -> 下载；校验通过 -> 安装（index.html 内联 onclick） */
function updatePrimaryAction(): void {
  const s = updaterState
  if (!s) return
  const prim = $('#update-primary-btn') as HTMLButtonElement | null
  if (s.status === 'verified') {
    updaterUserAction = true
    if (prim) {
      prim.disabled = true
      prim.textContent = '正在安装…'
    }
    const msgEl = $('#update-message')
    if (msgEl) {
      msgEl.style.color = '#ffb74d'
      msgEl.textContent = '正在启动安装程序…（应用即将退出并静默安装）'
    }
    console.log('[update] 点重启并安装，调用 updater.install()')
    window.api.updater
      .install()
      .then(() => {
        console.log('[update] updater.install() resolved')
      })
      .catch((e) => {
        console.error('[update] updater.install() failed:', e)
        updaterUserAction = false
        if (prim) {
          prim.disabled = false
          prim.textContent = '重试'
        }
        showToast('启动安装失败: ' + (e instanceof Error ? e.message : String(e)), 'error')
      })
  } else if (s.status === 'update-found' || s.status === 'error') {
    updaterUserAction = true
    if (prim) {
      prim.disabled = true
      prim.textContent = '正在下载…'
    }
    void window.api.updater.download().then((r) => {
      if (!r.ok && r.error) showToast(r.error, 'error')
    })
  }
}

function updateProgressUi(): void {
  const s = updaterState
  if (!s) return
  const wrap = $('#update-progress-wrap')
  if (!wrap) return
  const showProg = s.status === 'downloading' || s.status === 'verified'
  wrap.style.display = showProg ? '' : 'none'
  const pct = s.status === 'verified' ? 100 : s.progress || 0
  const fill = $('#update-progress-fill') as HTMLElement | null
  if (fill) fill.style.width = `${pct}%`
  const txt = $('#update-progress-text')
  if (txt) txt.textContent = `${pct}%`
  const msgEl = $('#update-message')
  if (msgEl) {
    msgEl.style.color = s.status === 'error' ? '#ff5252' : ''
    msgEl.textContent = s.message || ''
  }
}

/* ==================== 全局函数（index.html 内联 onclick 引用） ==================== */
declare global {
  interface Window {
    quickAddAccount: (platform: string) => void
    confirmRename: () => void
    closeRenameModal: () => void
    saveOpenAIConfig: () => Promise<void>
    saveDeepSeekConfig: () => Promise<void>
    testDeepSeekConnection: () => Promise<void>
    testOpenAIConnection: () => Promise<void>
    testProxyConnection: () => Promise<void>
    saveSttConfig: () => Promise<void>
    saveFontConfig: () => Promise<void>
    clearAllCaches: () => Promise<void>
    exportPerfHistory: () => void
    toggleTranslationPanel: () => void
    doManualTranslate: () => Promise<void>
    closeAddAccountModal: () => void
    selectPlatform: (type: string) => void
    confirmAddAccount: () => Promise<void>
    closeAuthConfigModal: () => void
    saveAuthConfig: () => Promise<void>
    checkUpdateNow: () => void
    closeUpdateModal: () => void
    updatePrimaryAction: () => void
  }
}

Object.assign(window, {
  quickAddAccount,
  confirmRename,
  closeRenameModal,
  saveOpenAIConfig,
  saveDeepSeekConfig,
  testDeepSeekConnection,
  testOpenAIConnection,
  testProxyConnection,
  saveSttConfig,
  saveFontConfig,
  clearAllCaches,
  exportPerfHistory,
  toggleTranslationPanel,
  doManualTranslate,
  closeAddAccountModal,
  selectPlatform,
  confirmAddAccount,
  closeAuthConfigModal,
  saveAuthConfig,
  checkUpdateNow,
  closeUpdateModal,
  updatePrimaryAction
});
void startApp();