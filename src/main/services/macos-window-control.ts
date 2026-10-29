/**
 * macOS 原生窗口控制 —— Windows 侧 user32 方案的对应实现。
 *
 * ## 为什么不能像 Windows 那样"真嵌入"
 *
 * Windows 的做法是 koffi 调 user32：SetWindowLongPtr(GWLP_HWNDPARENT) 把 Signal 顶层窗口
 * 设为宿主的 owner，再改 GWL_STYLE 去掉边框 —— Signal 视觉上就成了主窗口的一块区域。
 *
 * macOS 没有等价能力：
 *   - AppKit 不支持跨进程把另一个 app 的 NSWindow 变成自己的子视图；
 *     Carbon 时代的窗口嵌入在 64 位已被移除。
 *   - 更没有"改别的进程的窗口样式位"这种操作（窗口样式属于对方进程私有状态）。
 *
 * 可行的替代是**进程托管 + 几何同步**：Signal 仍是独立进程/独立窗口，
 * 但由宿主托管它的可见性、前后顺序，并把它的窗口摆到宿主内容区所在位置：
 *   1. 可见性 / 置前 —— AppleScript 操作 System Events 进程，最接近原生行为；
 *   2. 位置 / 尺寸 —— 同上（System Events 的 window position/size 用屏幕坐标、左上角原点、
 *      points 单位，与 Electron 的 BrowserWindow.getContentBounds() 同一坐标系，无需换算 DPR）。
 *
 * ## 权限
 *
 * 上述能力依赖「系统设置 → 隐私与安全性 → 自动化」里授予本机 App 控制 System Events 的权限。
 * 没有权限时所有调用都是 no-op 并返回 false —— Signal 仍可正常登录/收发/翻译
 * （这些走 profile 与 renderer 注入），只是窗口位置由用户自己摆，体验降级而非不可用。
 *
 * ## 性能
 *
 * osascript 一次调用约 30~80ms，而宿主 resize 时 relocate 会被高频触发，
 * 因此对外统一走 `queueMacBounds`：同 pid 只保留最后一次请求（latest-wins），
 * 按帧合并后再真正下发。
 */
import { spawn } from 'child_process'

const OSASCRIPT = '/usr/bin/osascript'

/** 自动化权限是否被拒绝（拒绝后不再反复弹/imgpcoring 用户） */
let automationDenied = false

function runOsa(script: string, timeoutMs = 4000): Promise<{ ok: boolean; stderr: string }> {
  return new Promise((resolve) => {
    let settled = false
    let stderr = ''
    let child: ReturnType<typeof spawn>
    try {
      child = spawn(OSASCRIPT, ['-e', script], { stdio: ['ignore', 'pipe', 'pipe'] })
    } catch (e) {
      resolve({ ok: false, stderr: String(e) })
      return
    }
    const timer = setTimeout(() => {
      if (settled) return
      settled = true
      try {
        child.kill()
      } catch {
        /* ignore */
      }
      resolve({ ok: false, stderr: 'osascript timeout' })
    }, timeoutMs)

    child.stderr?.on('data', (b: Buffer) => {
      stderr += b.toString('utf8')
    })
    child.stdout?.on('data', () => {
      /* System Events 的返回值我们不关心 */
    })
    child.on('error', (e) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolve({ ok: false, stderr: e.message })
    })
    child.on('exit', (code) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolve({ ok: code === 0, stderr })
    })
  })
}

/** AppleScript 里出现这些字样即判定为"自动化权限未授予" */
function looksLikePermissionError(stderr: string): boolean {
  const s = stderr.toLowerCase()
  return (
    s.includes('-1743') ||
    s.includes('not allowed') ||
    s.includes('not authorized') ||
    s.includes('user interaction') ||
    s.includes('128') && s.includes('appleevents')
  )
}

/** 探测是否已获得控制 System Events 的自动化权限（不要每次启动都问，避免骚扰用户） */
export async function macAutomationAllowed(): Promise<boolean> {
  if (automationDenied) return false
  const res = await runOsa('tell application "System Events" to get name of first process', 3000)
  if (!res.ok && looksLikePermissionError(res.stderr)) {
    automationDenied = true
    console.warn('[mac-window] 未获得「自动化」权限，Signal 窗口只能由用户手动摆放')
  }
  return res.ok
}

/** System Events 定位某个 pid 的进程对象 */
function processRef(pid: number): string {
  return `(first process whose unix id is ${Math.floor(pid)})`
}

/** 该 pid 是否已有可见窗口（用于等待 Signal 窗口出现） */
export async function macHasWindow(pid: number): Promise<boolean> {
  if (!pid) return false
  const res = await runOsa(`tell application "System Events" to count windows of ${processRef(pid)}`, 3000)
  if (!res.ok) return false
  // count 结果由 stdout 输出；osascript 退出码 0 但拿不到数字时保守当作有窗口
  return true
}

/** 隐藏/显示整个 Signal 进程（等价于 Windows 侧的 ShowWindow(SW_HIDE/SW_SHOW)） */
export async function macSetProcessVisible(pid: number, visible: boolean): Promise<boolean> {
  if (!pid) return false
  const res = await runOsa(
    `tell application "System Events" to set visible of ${processRef(pid)} to ${visible ? 'true' : 'false'}`,
  )
  if (!res.ok) {
    if (looksLikePermissionError(res.stderr)) automationDenied = true
    return false
  }
  return true
}

/** 把 Signal 拉到最前（等价 Windows 的 SetForegroundWindow / BringWindowToTop） */
export async function macRaiseProcess(pid: number): Promise<boolean> {
  if (!pid) return false
  const res = await runOsa(`tell application "System Events" to set frontmost of ${processRef(pid)} to true`)
  if (!res.ok && looksLikePermissionError(res.stderr)) automationDenied = true
  return res.ok
}

// ---------------------------------------------------------------------------
// 位置/尺寸：合并同 pid 的高频请求后再下发
// ---------------------------------------------------------------------------

interface Bounds {
  x: number
  y: number
  w: number
  h: number
}

const pending = new Map<number, Bounds>()
let flushing = false

/** 宿主 resize 期间 relocate 会每帧触发，这里按 pid 做 latest-wins 合并 */
export function queueMacBounds(pid: number, b: Bounds): void {
  if (!pid) return
  pending.set(pid, b)
  if (flushing) return
  flushing = true
  setTimeout(() => {
    void flush()
  }, 50)
}

async function flush(): Promise<void> {
  const batch = new Map(pending)
  pending.clear()
  flushing = false
  for (const [pid, b] of batch) {
    await macSetBounds(pid, b)
  }
}

/** 直接下发一次窗口几何（屏幕坐标、左上角原点、单位 points） */
export async function macSetBounds(pid: number, b: Bounds): Promise<boolean> {
  if (!pid) return false
  if (b.w < 40 || b.h < 40) return false
  const x = Math.round(b.x)
  const y = Math.round(b.y)
  const w = Math.round(b.w)
  const h = Math.round(b.h)
  const script =
    `tell application "System Events"\n` +
    `  set p to ${processRef(pid)}\n` +
    `  if (count windows of p) > 0 then\n` +
    `    set position of window 1 of p to {${x}, ${y}}\n` +
    `    set size of window 1 of p to {${w}, ${h}}\n` +
    `  end if\n` +
    `end tell`
  const res = await runOsa(script)
  if (!res.ok && looksLikePermissionError(res.stderr)) automationDenied = true
  return res.ok
}
