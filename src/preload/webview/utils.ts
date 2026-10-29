/** WebView 注入脚本通用工具 */

/** 节流：fn 在 ms 间隔内最多执行一次 */
export function throttle<T extends (...args: any[]) => void>(fn: T, ms: number): T {
  let last = 0
  let timer: ReturnType<typeof setTimeout> | null = null
  let lastArgs: any[] | null = null
  const wrapped = (...args: any[]) => {
    lastArgs = args
    const now = Date.now()
    const wait = ms - (now - last)
    if (wait <= 0) {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      last = now
      fn(...args)
    } else if (!timer) {
      timer = setTimeout(() => {
        timer = null
        last = Date.now()
        if (lastArgs) fn(...lastArgs)
      }, wait)
    }
  }
  return wrapped as T
}

/** 延迟执行，浏览器空闲时 */
export function idle<T>(fn: () => T, timeout = 1200): Promise<T> {
  return new Promise((resolve) => {
    const run = () => {
      try {
        resolve(fn())
      } catch (e) {
        console.warn('[mt] idle task error', e)
        resolve(undefined as T)
      }
    }
    const ric = (window as any).requestIdleCallback as ((cb: () => void, opt?: { timeout: number }) => void) | undefined
    if (ric) ric(run, { timeout })
    else setTimeout(run, 50)
  })
}

/** ArrayBuffer -> base64 */
export function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

/** 数组去重（按引用） */
export function uniqueElements<T>(arr: T[]): T[] {
  return [...new Set(arr)]
}

/** 文本指纹（用于判断节点内容是否变化，识别虚拟滚动复用的节点） */
export function textHash(s: string): string {
  let h = 5381
  const str = s.trim()
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0
  return (h >>> 0).toString(36)
}

/**
 * 判断文本是否真正需要翻译：
 * 去掉空白、标点、符号(含 emoji)、数字(半角/全角)、中文后，
 * 若仍有内容（如英文、日韩文、俄文等）才需要翻译。
 * 纯中文/纯数字/纯符号的消息直接跳过，避免发往翻译接口造成卡住或失败。
 */
export function needsTranslation(text: string): boolean {
  const cleaned = text
    .replace(/\s+/g, '')
    .replace(/[\u3000-\u303f\uFF00-\uFFEF\p{P}\p{S}]/gu, '')
    .replace(/[0-9０-９]+/g, '')
    .replace(/[\u4e00-\u9fff]+/g, '')
  return cleaned.length > 0
}

/** 从节点向上查找符合 selector 的祖先 */
export function closest(el: Element | null | undefined, selector: string): Element | null {
  return el ? el.closest(selector) : null
}

/** 安全地 dispatch InputEvent（IME/React 受控输入兼容） */
export function insertTextAtCursor(target: HTMLElement, text: string): boolean {
  try {
    target.focus()
    const sel = window.getSelection()
    if (!sel) return false
    // 把选区放到输入框末尾
    const range = document.createRange()
    range.selectNodeContents(target)
    range.collapse(false)
    sel.removeAllRanges()
    sel.addRange(range)
    const ok = document.execCommand('insertText', false, text)
    if (!ok) {
      // 兜底：直接赋值 + 触发 input
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'
      if (isInput) {
        const el = target as HTMLInputElement
        el.value = text
      } else {
        target.textContent = text
      }
      target.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }))
    }
    return true
  } catch {
    return false
  }
}
