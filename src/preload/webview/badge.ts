/**
 * 翻译卡片注入：样式注入、卡片渲染、去重与动画。
 * 翻译结果显示在消息下方（浅蓝色卡片），带复制 / 重新翻译 / 智能回复按钮。
 */
import type { WebviewConfig } from '../../shared/types'
import { textHash } from './utils'

export interface BadgeStyle {
  fontSize: number
  color: string
  bgColor: string
}

export interface BadgeCallbacks {
  onRetranslate?: (original: string) => void
  onSmartReply?: (original: string, translated: string) => void
}

const BADGE_CLASS = 'mt-badge'
const CSS_ID = 'mt-translator-style'

/** 注入全局样式（幂等） */
export function ensureStyle(cfg: BadgeStyle): void {
  if (document.getElementById(CSS_ID)) return
  const style = document.createElement('style')
  style.id = CSS_ID
  style.textContent = `
/* 消息下方的独立行（包裹卡片/手动按钮，强制换行，不被 flex 布局挤到侧边） */
.mt-slot {
  display: block !important;
  width: 100% !important;
  clear: both !important;
}
/* Telegram：slot 挂在消息行容器 .Message / .bubble 内部末尾。
   容器是 flex 布局，slot 用 flex:0 0 100% + order 独占一行（显示在消息下方），
   并给容器开启 flex-wrap 使 slot 换行。这样 Telegram 插入新消息时，
   新消息始终排在消息行之后，不会被翻译框挤到中间。 */
.Message > .mt-slot,
.bubble > .mt-slot {
  flex: 0 0 100% !important;
  flex-shrink: 0 !important;
  order: 10 !important;
  grid-column: 1 / -1 !important;
}
.Message:has(.mt-slot),
.bubble:has(.mt-slot) {
  flex-wrap: wrap;
}
.${BADGE_CLASS} {
  display: block;
  width: fit-content;
  max-width: 100%;
  margin-top: 6px;
  margin-bottom: 10px;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: ${cfg.fontSize}px;
  line-height: 1.5;
  color: ${cfg.color};
  background: ${cfg.bgColor};
  border: 1px solid ${cfg.bgColor};
  word-break: break-word;
  white-space: pre-wrap;
  animation: mtFadeIn 0.3s ease;
}
.${BADGE_CLASS} .mt-badge-src {
  display: inline-block;
  margin-right: 6px;
  padding: 0 5px;
  border-radius: 3px;
  font-size: 0.75em;
  opacity: 0.75;
  background: rgba(47, 129, 247, 0.15);
}
.${BADGE_CLASS} .mt-badge-actions {
  display: flex;
  gap: 6px;
  margin-top: 6px;
}
.${BADGE_CLASS} .mt-badge-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: 1px solid #b8dceb;
  background: #fff;
  color: #0a6fd4;
  border-radius: 6px;
  padding: 0;
  cursor: pointer;
}
.${BADGE_CLASS} .mt-badge-btn svg {
  width: 14px;
  height: 14px;
}
.${BADGE_CLASS} .mt-badge-btn:hover {
  background: #d9ecfa;
}
.${BADGE_CLASS} .mt-badge-btn.mt-badge-btn-copied {
  color: #2e7d32;
  border-color: #a5d6a7;
  background: #e8f5e9;
}
.${BADGE_CLASS}.mt-badge-out {
  background: ${cfg.bgColor};
  border-color: ${cfg.bgColor};
}
.${BADGE_CLASS}.mt-badge-error {
  color: #c62828;
  background: #fdecea;
  border-color: #f5c6c2;
}
@keyframes mtFadeIn {
  from { opacity: 0; transform: translateY(-3px); }
  to   { opacity: 1; transform: translateY(0); }
}
.mt-spin {
  display: inline-block;
  width: 10px;
  height: 10px;
  border: 2px solid rgba(127,127,127,0.35);
  border-top-color: ${cfg.color};
  border-radius: 50%;
  margin-right: 6px;
  animation: mtRotate 0.8s linear infinite;
  vertical-align: -1px;
}
@keyframes mtRotate { to { transform: rotate(360deg); } }
`
  ;(document.head || document.documentElement).appendChild(style)
}

/**
 * 消息行的根节点（用于在消息正下方插入内容）。
 * - 若 node 是 .bubble（如 Telegram K 版），向上找外层行容器 .Message，
 *   否则直接插到 .bubble 之后会变成 flex item 而显示在消息侧边。
 * - 其余情况返回 node 本身。
 */
export function messageRowNode(node: Element): Element {
  if (node.classList.contains('bubble')) {
    const row = node.closest('.Message')
    if (row) return row
  }
  return node
}

/**
 * Messenger 新版：消息行的「行容器」——data-virtualized 消息本体的父节点。
 * 卡片不放进行容器内部，否则会被 Messenger 消息行的背景框（行内白底、悬停/选中时
 * 整行的高亮底色）一起框住；改为挂在行容器之后，独立成块。
 */
function messengerRowContainer(row: Element): Element | null {
  const v = row.hasAttribute('data-virtualized') ? row : row.closest('[data-virtualized]')
  return v ? v.parentElement : null
}

/** 背景是「实际可见的纯色」：非 transparent、也不是全透明的 rgba */
function isVisibleBg(bg: string): boolean {
  return !!bg && bg !== 'transparent' && !/rgba\([^)]*,\s*0\)$/.test(bg)
}

/**
 * 用「消息行自身的整行底色」填充卡片 slot。
 *
 * 起因：卡片 slot 是行容器的**兄弟节点**，拿不到 Messenger 给每条消息行铺的那层
 * 「铺满整行」的不透明底色（实测 502×45、rgb(255,255,255)）。slot 又是 width:100%
 * 且透明的，于是会话面板自身的背景会从整条 slot 透出来 —— 端到端加密会话的面板正是
 * linear-gradient(#aa00ff, #0070f6) 的紫→蓝渐变，表现为每条卡片旁边都拖着一条渐变带，
 * 看上去像「卡片自带了一层 Messenger 聊天背景」。这里把行底色复制到 slot 上消除它。
 *
 * 只在行内确实存在整行纯色底色时复制：主题会话（面板带壁纸/渐变）里消息行本身没有
 * 底色层，此时保持透明才是正确的 —— 让会话背景与相邻消息行一样正常透出。
 *
 * 返回值表示是否成功上色。宿主尚未完成布局（宽度量不出）或行内暂时量不到底色层时返回
 * false，调用方可稍后重试（见 scheduleSlotPaint / refreshSlotBackground）。
 */
function paintSlotWithRowBg(host: Element, slot: HTMLElement): boolean {
  const hr = host.getBoundingClientRect()
  if (hr.width < 2) return false
  // 行内气泡的底色绝不能当行底色（否则卡片背后会多出一块「聊天气泡色」）
  const bubble = findBubbleIn(host)
  let wide: string | null = null
  let wideW = 0
  for (const el of Array.from(host.querySelectorAll('*'))) {
    const cs = getComputedStyle(el)
    if (cs.backgroundImage !== 'none') continue
    if (!isVisibleBg(cs.backgroundColor)) continue
    if (bubble && (el === bubble || bubble.contains(el))) continue
    const w = el.getBoundingClientRect().width
    // 铺满整行的那一层才是「行底色」
    if (w >= hr.width - 1) {
      slot.style.background = cs.backgroundColor
      return true
    }
    // 退一步：行内最宽的纯色大块（实测有行只有 342px 的正文底色层，
    // 此时若不复制，卡片背后就会露出面板壁纸/渐变，表现为「卡片周围多出一条底色带」）
    if (w > wideW) {
      wideW = w
      wide = cs.backgroundColor
    }
  }
  if (wide && wideW >= hr.width * 0.25) {
    slot.style.background = wide
    return true
  }
  return false
}

/**
 * 注入当下宿主行可能还没完成布局（量不出宽度/量不到底色层），导致 slot 一直保持
 * 透明、透出会话面板渐变。这里在下一帧重试一次，仍失败再延迟 300ms 兜底一次。
 */
function scheduleSlotPaint(slot: HTMLElement): void {
  const tryPaint = (): boolean => {
    if (!slot.isConnected) return true
    const host = slot.previousElementSibling
    return !!host && paintSlotWithRowBg(host, slot)
  }
  requestAnimationFrame(() => {
    if (!tryPaint()) setTimeout(tryPaint, 300)
  })
}

/**
 * 按宿主行的当前底色重新给 slot 上色（幂等）。
 * 供扫描兜底调用：行被虚拟列表回收重渲染、或注入时宿主尚未布局时，slot 会残留为透明，
 * 表现为卡片上下拖着一条面板渐变带。返回是否已处于「已上色」状态。
 */
export function refreshSlotBackground(slot: HTMLElement): boolean {
  if (isVisibleBg(getComputedStyle(slot).backgroundColor)) return true
  const host = slot.previousElementSibling
  return !!host && paintSlotWithRowBg(host, slot)
}

/**
 * 消息行内的「正文气泡」：带圆角的元素里，唯一有不透明底色、且不是背景图的那个
 * （Messenger 把行底色、头像列、时间戳都渲染成圆角为 0 / 底色透明的包装 div；头像用 background-image）。
 */
function findBubbleIn(host: Element): HTMLElement | null {
  let best: HTMLElement | null = null
  let bestWidth = 0
  for (const el of Array.from(host.querySelectorAll<HTMLElement>('div'))) {
    const cs = getComputedStyle(el)
    // 头像/图片气泡用 background-image 的 url(...) 渲染 → 排除（纯色、渐变仍算气泡）
    if (/url\(/i.test(cs.backgroundImage)) continue
    if (!isVisibleBg(cs.backgroundColor)) continue
    // 圆角是气泡的显著特征（实测 18px；包装层一律 0px）
    if (parseFloat(cs.borderTopLeftRadius) < 6 && parseFloat(cs.borderTopRightRadius) < 6) continue
    const r = el.getBoundingClientRect()
    // 行悬停操作条是 24×24 的深色圆角小方块，拿它当参考会把卡片推到行中间
    if (r.width < 36 || r.height < 20) continue
    if (r.width > bestWidth) {
      bestWidth = r.width
      best = el
    }
  }
  return best
}

/**
 * Messenger 新版：让入站卡片与对方气泡左边对齐。
 * 气泡左侧是对方头像列（实测 50px），若卡片沿用 margin-left:0，
 * 就会贴到会话面板最左边、从头像下面开始。
 * 缩进加在 slot 的 padding 上（配合 border-box，宽度 100% 不会溢出），
 * 卡片自身仍是 margin-left:0 + max-width:100%，长翻译不会溢出面板。
 */
function alignCardToBubble(host: Element, slot: HTMLElement): void {
  const hr = host.getBoundingClientRect()
  if (hr.width < 2) return
  const bubble = findBubbleIn(host)
  // 量不到气泡（媒体/系统行）时退回实测的头像列宽；上限 80px 防止误判靠右元素把卡片推到中间
  const raw = bubble ? Math.round(bubble.getBoundingClientRect().left - hr.left) : 50
  const inset = Math.min(80, Math.max(0, raw))
  if (inset <= 0) return
  slot.style.boxSizing = 'border-box'
  slot.style.paddingLeft = inset + 'px'
}

/** Messenger 新版：消息行对应的 slot（挂在行容器之后，作为内容容器的直接子节点） */
function findMessengerSlot(row: Element): Element | null {
  const host = messengerRowContainer(row)
  if (!host) return null
  const next = host.nextElementSibling
  return next && next.classList.contains('mt-slot') ? next : null
}

/** 把元素插到消息行根节点之后，用 slot 包裹并强制独占一行。
 *  Telegram（.Message 行容器 / .bubble 气泡）：挂到容器内部末尾，
 *  避免新消息被插入到翻译框之前；其余平台：作为消息行的兄弟节点插入。 */
function appendBelow(node: Element, el: Element, direction: 'in' | 'out'): void {
  const row = messageRowNode(node)
  const slot = document.createElement('div')
  slot.className = 'mt-slot'
  slot.dataset.dir = direction
  ;(el as HTMLElement).style.marginLeft = direction === 'out' ? 'auto' : '0'
  slot.appendChild(el)
  if (row.classList.contains('Message') || row.classList.contains('bubble')) row.appendChild(slot)
  else if (row.hasAttribute('data-virtualized') || row.parentElement?.getAttribute('role') === 'none') {
    // Messenger 新版：消息行是带 FB data-virtualized 标记的节点，其父节点才是「该消息行的容器」。
    // 卡片挂在**行容器之后**（作为内容容器的直接子节点），而不是行容器内部：卡片由此独立成块，
    // 不会被 Messenger 消息行的背景框（行内白底、悬停/选中高亮）包住，也不会撑高该行。
    // 旧结构（行是 [role="none"] 列表的直接子 div）仍追加到行容器内部。
    // 两种情况都打上 data-mt-host 标记，避免被 cleanupOrphanSlots 当作孤儿 slot 删除。
    slot.dataset.mtHost = 'messenger-row'
    if (row.hasAttribute('data-virtualized')) {
      const host = row.parentElement
      if (host) {
        host.insertAdjacentElement('afterend', slot)
        // slot 是行容器的兄弟节点，需自己带上行底色，否则会透出会话面板背景（见 paintSlotWithRowBg）。
        // 注入当下宿主可能尚未布局，上色失败时下一帧/延时再重试。
        if (!paintSlotWithRowBg(host, slot)) scheduleSlotPaint(slot)
        // 入站卡片：左侧缩进到对方气泡的位置（气泡左边是对方头像列，见 alignCardToBubble）
        if (direction === 'in') alignCardToBubble(host, slot)
      } else row.insertAdjacentElement('afterend', slot)
    } else row.appendChild(slot)
  } else {
    row.insertAdjacentElement('afterend', slot)
    // WhatsApp 新版：消息列表无内边距（行与面板等宽），卡片需按气泡实际位置对齐，避免贴到最左
    if (row.matches('div[data-id]') && row.querySelector('[data-testid="msg-container"]')) {
      scheduleWaCardPosition(row, slot, direction)
    }
  }
}

/**
 * WhatsApp 新版：卡片与气泡左/右对齐。
 *
 * 缩进用 slot 自身的 padding 实现：slot 是 100% 宽的块（border-box），它的 padding box
 * 恰好等于父容器的**内容区**，因此卡片边缘与气泡边缘一一对应。
 *
 * 旧实现是「width: calc(100% - Npx) + marginRight: Npx」，其中 N 用**消息行
 * (div[data-id]) 的 rect** 当参照 —— 只有在「行与容器内容区等宽」时才成立，
 * 一旦 WA 把行渲染成收缩宽度、或行/容器其一尚未完成布局，每条消息算出的缩进就各不相同，
 * 表现为「自己发送的消息距右侧距离不统一」。这里改为直接量容器的内容区边缘。
 *
 * 返回 false 表示当前量不出（布局未就绪 / 该行没有 msg-container）：**不写任何值**，
 * 保留上一次的结果，由调用方稍后重试（见 scheduleWaCardPosition / repairWaPositions）。
 */
export function positionWaCard(node: Element, slot: HTMLElement, direction: 'in' | 'out'): boolean {
  const bubble = node.querySelector('[data-testid="msg-container"]')
  const box = slot.parentElement
  if (!bubble || !box) return false
  const br = bubble.getBoundingClientRect()
  const bx = box.getBoundingClientRect()
  if (br.width < 2 || bx.width < 2) return false
  applyWaVerticalGap(node, slot, br)
  const cs = getComputedStyle(box)
  const padL = parseFloat(cs.paddingLeft) || 0
  const padR = parseFloat(cs.paddingRight) || 0
  const contentLeft = bx.left + box.clientLeft + padL
  const contentRight = bx.left + box.clientLeft + box.clientWidth - padR
  const raw = direction === 'out' ? contentRight - br.right : br.left - contentLeft
  if (!Number.isFinite(raw)) return false
  // 上限 80px：量到无关的靠边元素（媒体行、系统行）时不至于把卡片推到中间
  const gap = Math.min(80, Math.max(0, Math.round(raw)))
  const padLeft = direction === 'out' ? '0px' : `${gap}px`
  const padRight = direction === 'out' ? `${gap}px` : '0px'
  // 已经是对的值就什么都不写，避免每次扫描都触发同步布局
  if (slot.style.boxSizing === 'border-box' && slot.style.paddingLeft === padLeft && slot.style.paddingRight === padRight) {
    return true
  }
  slot.style.boxSizing = 'border-box'
  // 清掉旧实现留下的行内覆盖（否则会与 padding 方案叠加）
  slot.style.marginLeft = '0'
  slot.style.marginRight = '0'
  slot.style.removeProperty('width')
  slot.style.paddingLeft = padLeft
  slot.style.paddingRight = padRight
  return true
}

/** WhatsApp：气泡（或行内其它内容）底部到译文卡片顶部的目标间距 */
const WA_CARD_GAP_PX = 4

/**
 * WhatsApp：把「消息 → 译文卡片」的垂直间距统一到 WA_CARD_GAP_PX。
 *
 * 起因：卡片 slot 是从**消息行底部**开始排的，而行底与气泡底之间还有一段空白
 * （实测 2~12px：行内 padding、addon-bubble-container、分组消息的尾巴），
 * 于是实测间距在 8~18px 之间跳，看上去又松又不统一。
 *
 * 做法：以「行内最后一个有高度的元素」（气泡，或装着表情回应的 addon 容器）的底边为基准，
 * 用 slot 的 margin-top 把卡片拉到基准下方 WA_CARD_GAP_PX 处。这样：
 *   - 行内空白被吃掉，不会压到表情回应等真实内容；
 *   - 每条消息的间距都相同，且不受行高变化影响。
 * 用「当前实测差值」增量修正，不依赖盒模型细节；气泡与卡片同属一条消息行，
 * 卡片上移不改变这条消息自身的量测结果，因此不会来回抖动。
 */
function applyWaVerticalGap(row: Element, slot: HTMLElement, bubbleRect: DOMRect): void {
  const card = slot.querySelector<HTMLElement>(`.${BADGE_CLASS}`)
  if (!card) return
  const cr = card.getBoundingClientRect()
  if (cr.height < 2) return
  let contentBottom = bubbleRect.bottom
  for (const el of Array.from(row.children)) {
    if (el === slot || el.classList.contains('mt-slot')) continue
    const r = el.getBoundingClientRect()
    if (r.height > 1) contentBottom = Math.max(contentBottom, r.bottom)
  }
  const marginNow = parseFloat(slot.style.marginTop) || 0
  const gapNow = cr.top - contentBottom
  const next = Math.round(marginNow + (WA_CARD_GAP_PX - gapNow))
  const css = `${next}px`
  if (slot.style.marginTop !== css) slot.style.marginTop = css
}

/**
 * 注入那一刻宿主行/容器可能还没完成布局（量不出气泡或容器宽度）：下一帧重试一次，
 * 仍失败再延迟 300ms 兜底一次（与 scheduleSlotPaint 同一套路）。
 */
export function scheduleWaCardPosition(node: Element, slot: HTMLElement, direction: 'in' | 'out'): void {
  const tryPosition = (): boolean => {
    if (!slot.isConnected) return true
    return positionWaCard(node, slot, direction)
  }
  requestAnimationFrame(() => {
    if (!tryPosition()) setTimeout(tryPosition, 300)
  })
}

/** 在节点上渲染翻译卡片（同一节点再次调用会覆盖旧卡片） */
export function injectBadge(
  node: Element,
  text: string,
  direction: 'in' | 'out',
  opts?: { source?: string; loading?: boolean; error?: boolean; originalText?: string; callbacks?: BadgeCallbacks }
): void {
  removeBadge(node)
  const badge = document.createElement('div')
  badge.className = `${BADGE_CLASS} ${direction === 'out' ? 'mt-badge-out' : ''}${opts?.error ? ' mt-badge-error' : ''}`
  if (opts?.originalText) badge.dataset.src = textHash(opts.originalText)
  if (opts?.loading) {
    badge.innerHTML = `<span class="mt-spin"></span>翻译中…`
    appendBelow(node, badge, direction)
    return
  }
  const src = opts?.source ? `<span class="mt-badge-src">${opts.source}</span>` : ''
  const textEl = document.createElement('div')
  textEl.innerHTML = src + escapeText(text)
  badge.appendChild(textEl)

  // 三个操作按钮：复制翻译 / 重新翻译（覆盖缓存）/ 智能回复
  if (opts?.originalText && opts?.callbacks) {
    const actions = document.createElement('div')
    actions.className = 'mt-badge-actions'

    const copyBtn = document.createElement('button')
    copyBtn.className = 'mt-badge-btn'
    copyBtn.title = '复制翻译'
    copyBtn.innerHTML = ICONS.copy
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(text)
      } catch {
        const ta = document.createElement('textarea')
        ta.value = text
        ta.style.cssText = 'position:fixed;left:-9999px;'
        document.body.appendChild(ta)
        ta.select()
        try {
          document.execCommand('copy')
        } catch {
          /* ignore */
        }
        ta.remove()
      }
      copyBtn.classList.add('mt-badge-btn-copied')
      copyBtn.innerHTML = ICONS.check
      setTimeout(() => {
        copyBtn.classList.remove('mt-badge-btn-copied')
        copyBtn.innerHTML = ICONS.copy
      }, 1500)
    })

    const retryBtn = document.createElement('button')
    retryBtn.className = 'mt-badge-btn'
    retryBtn.title = '重新翻译（覆盖缓存）'
    retryBtn.innerHTML = ICONS.refresh
    retryBtn.addEventListener('click', () => opts.callbacks!.onRetranslate?.(opts.originalText!))

    const aiBtn = document.createElement('button')
    aiBtn.className = 'mt-badge-btn'
    aiBtn.title = '智能回复'
    aiBtn.innerHTML = ICONS.sparkles
    aiBtn.addEventListener('click', () => opts.callbacks!.onSmartReply?.(opts.originalText!, text))

    actions.append(copyBtn, retryBtn, aiBtn)
    badge.appendChild(actions)
  }
  appendBelow(node, badge, direction)
}

/** 显示翻译中状态 */
export function showLoading(node: Element, direction: 'in' | 'out'): void {
  injectBadge(node, '', direction, { loading: true })
}

/** 判断节点是否已有卡片 */
export function hasBadge(node: Element): boolean {
  return !!findBadge(node)
}

/** 查找节点对应的翻译卡片（位于消息行根节点之后/行容器内部的 slot 内） */
export function findBadge(node: Element): HTMLElement | null {
  const row = messageRowNode(node)
  let slot: Element | null = null
  if (row.classList.contains('Message') || row.classList.contains('bubble')) {
    slot = row.querySelector('.mt-slot')
  } else {
    // Messenger 新版：slot 挂在消息行容器（data-virtualized 节点的父节点）之后
    slot = findMessengerSlot(row)
    if (!slot) {
      const next = row.nextElementSibling
      if (next && next.classList.contains('mt-slot')) slot = next
    }
    if (!slot) slot = row.querySelector('.mt-slot')
  }
  return slot ? slot.querySelector(`.${BADGE_CLASS}`) : null
}

/** 移除消息对应的卡片（连同 slot），并清理卡片节点所在 slot 的孤儿残留 */
export function removeBadge(node: Element): void {
  const badge = findBadge(node)
  if (!badge) return
  const slot = badge.closest('.mt-slot')
  if (slot) slot.remove()
  else badge.remove()
}

/** 按钮用到的内联 SVG 图标（stroke 继承 currentColor） */
const ICONS = {
  copy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
  refresh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><polyline points="21 3 21 9 15 9"/></svg>`,
  sparkles: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
}

function escapeText(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))
}

export function badgeCssText(cfg: BadgeStyle): string {
  return `font-size:${cfg.fontSize}px;color:${cfg.color}`
}

export function updateBadgeStyles(cfg: BadgeStyle): void {
  const style = document.getElementById(CSS_ID)
  if (style) style.remove()
  ensureStyle(cfg)
}

export { BADGE_CLASS }
