/**
 * Signal Desktop 管理器（移植自原项目"巅峰翻译器"的成熟实现）：
 * - 优先以内置的 signal-app.asar 启动（--signal-mode，无需用户安装 Signal Desktop）；
 *   找不到内置资源时回退到系统安装的 Signal.exe
 * - 通过 user32 (koffi FFI) 将 Signal 原生窗口"奴役"进宿主窗口：
 *   SetWindowLongPtr(GWLP_HWNDPARENT) 设置 owner + 去边框 + ClientToScreen 定位，
 *   保持 Signal 为独立顶层窗口（WS_POPUP），跨进程键盘/IME/剪贴板可靠
 * - 按子进程 PID 查找窗口（EnumWindows），多账号互不串扰
 * - 解析子进程 stdout 的 [MT-UNREAD] 未读计数、[MT-RENDER-RECOVER] 渲染恢复
 * - 崩溃监控 + 自动重启 + 重新嵌入（最多连续 3 次）
 */
import { app, BrowserWindow, screen } from 'electron'
import { spawn, type ChildProcess } from 'child_process'
import { appendFileSync, existsSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'fs'
import { join } from 'path'

/** 诊断日志（Signal 嵌入问题排查用） */
function slog(msg: string): void {
  try {
    appendFileSync(join(app.getPath('userData'), 'signal-embed.log'), `${new Date().toISOString()} ${msg}\n`)
  } catch {
    /* ignore */
  }
  console.log('[signal]', msg)
}
import type { SignalStatus, Settings } from '../../shared/types'
import { getAccount, updateAccountStatus } from './account-manager'
import { store } from './store'
import { detectLocalProxy } from './proxy-detect'
import { killProcessTree } from './process-kill'
import { macAutomationAllowed, macHasWindow, macRaiseProcess, macSetProcessVisible, queueMacBounds } from './macos-window-control'

/** 主进程 -> 渲染层 状态推送通道（与 IPC 常量中的 SignalStatePush 保持一致） */
export const SIGNAL_STATE_CHANNEL = 'signal:state'

export interface SignalState {
  accountId: string
  status: SignalStatus
  pid: number | null
  unread: number
  embedded: boolean
  error?: string
}

/** 宿主窗口客户区坐标（DIP，即渲染层 viewport 坐标） */
export interface ScreenBounds {
  x: number
  y: number
  width: number
  height: number
}

const WM_CLOSE = 0x0010
const SW_SHOW = 5
const SW_HIDE = 0
const MAX_RESTART = 3

// 窗口样式常量
const GWL_STYLE = -16
const GWL_EXSTYLE = -20
const GWLP_HWNDPARENT = -8
const WS_CHILD = 0x40000000
const WS_POPUP = 0x80000000
const WS_VISIBLE = 0x10000000
const WS_CAPTION = 0x00c00000
const WS_THICKFRAME = 0x00040000
const WS_MINIMIZEBOX = 0x00020000
const WS_MAXIMIZEBOX = 0x00010000
const WS_SYSMENU = 0x00080000
// 扩展样式：去任务栏独立项 + 允许激活 + 隐藏自绘标题栏的关键（参照鑫五洋 WinEmbed）
const WS_EX_TOOLWINDOW = 0x00000080
const WS_EX_APPWINDOW = 0x00040000
const WS_EX_NOACTIVATE = 0x08000000
const HWND_TOP = 0
const SWP_NOSIZE = 0x0001
const SWP_NOMOVE = 0x0002
const SWP_NOACTIVATE = 0x0010
const SWP_SHOWWINDOW = 0x0040
const SWP_FRAMECHANGED = 0x0020

// ---------- user32 FFI（懒加载，koffi 仅 Windows 可用） ----------

interface User32Api {
  EnumWindows(cb: (hwnd: number, lParam: number) => boolean, lParam: number): boolean
  GetWindowThreadProcessId(hwnd: number, pid: Int32Array): number
  GetClassNameA(hwnd: number, buf: Buffer, maxLen: number): number
  GetWindowTextA(hwnd: number, buf: Buffer, maxLen: number): number
  IsWindow(hwnd: number): boolean
  GetWindowLongW(hwnd: number, index: number): number
  SetWindowLongW(hwnd: number, index: number, value: number): number
  SetWindowLongPtrW(hwnd: number, index: number, value: number): number
  MoveWindow(hwnd: number, x: number, y: number, w: number, h: number, repaint: boolean): boolean
  ShowWindow(hwnd: number, cmd: number): boolean
  PostMessageW(hwnd: number, msg: number, wParam: number, lParam: number): boolean
  SetWindowPos(hwnd: number, insertAfter: number, x: number, y: number, w: number, h: number, flags: number): boolean
  ClientToScreen(hwnd: number, pt: { x: number; y: number }): boolean
  SetForegroundWindow(hwnd: number): boolean
  BringWindowToTop(hwnd: number): boolean
  AttachThreadInput(idAttach: number, idAttachTo: number, fAttach: boolean): boolean
  GetCurrentThreadId(): number
  GetDesktopWindow(): number
}

let user32: User32Api | null = null
/** 保持 koffi 回调类型引用，防止被 GC 导致 EnumWindows 崩溃 */
let enumWindowsProcType: unknown = null

/** kernel32 里进程调度相关的三个调用（多开时把后台账号按下去用） */
interface Kernel32Api {
  OpenProcess(access: number, inherit: boolean, pid: number): number
  SetPriorityClass(handle: number, cls: number): boolean
  CloseHandle(handle: number): boolean
}

let kernel32Api: Kernel32Api | null = null

function getK32(): Kernel32Api | null {
  if (kernel32Api) return kernel32Api
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const koffi = require('koffi')
    const lib = koffi.load('kernel32.dll')
    kernel32Api = {
      OpenProcess: lib.func('OpenProcess', 'uintptr_t', ['uint', 'bool', 'uint']),
      SetPriorityClass: lib.func('SetPriorityClass', 'bool', ['uintptr_t', 'uint']),
      CloseHandle: lib.func('CloseHandle', 'bool', ['uintptr_t']),
    }
  } catch (e) {
    console.error('[signal] kernel32 加载失败:', e)
    return null
  }
  return kernel32Api
}

function get32(): User32Api | null {
  if (user32) return user32
  try {
    // 仅主进程加载（koffi 为 N-API 模块，Electron 主进程可直接 require）
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const koffi = require('koffi')
    const lib = koffi.load('user32.dll')
    const kernel32 = koffi.load('kernel32.dll')
    // koffi 3.x：回调类型用 proto 定义，func 参数需用 koffi.pointer(protoType) 传入
    const EnumWindowsProc = koffi.proto('bool __stdcall EnumWindowsProc(uintptr_t hwnd, uintptr_t lParam)')
    enumWindowsProcType = EnumWindowsProc
    const POINT = koffi.struct('POINT', { x: 'int', y: 'int' })
    user32 = {
      EnumWindows: lib.func('EnumWindows', 'bool', [koffi.pointer(EnumWindowsProc), 'uintptr_t']),
      GetWindowThreadProcessId: lib.func('GetWindowThreadProcessId', 'uint', ['uintptr_t', 'int*']),
      GetClassNameA: lib.func('GetClassNameA', 'int', ['uintptr_t', 'char*', 'int']),
      GetWindowTextA: lib.func('GetWindowTextA', 'int', ['uintptr_t', 'char*', 'int']),
      IsWindow: lib.func('IsWindow', 'bool', ['uintptr_t']),
      GetWindowLongW: lib.func('GetWindowLongW', 'int', ['uintptr_t', 'int']),
      SetWindowLongW: lib.func('SetWindowLongW', 'int', ['uintptr_t', 'int', 'int']),
      SetWindowLongPtrW: lib.func('SetWindowLongPtrW', 'uintptr_t', ['uintptr_t', 'int', 'uintptr_t']),
      MoveWindow: lib.func('MoveWindow', 'bool', ['uintptr_t', 'int', 'int', 'int', 'int', 'bool']),
      ShowWindow: lib.func('ShowWindow', 'bool', ['uintptr_t', 'int']),
      PostMessageW: lib.func('PostMessageW', 'bool', ['uintptr_t', 'uint', 'uintptr_t', 'uintptr_t']),
      SetWindowPos: lib.func('SetWindowPos', 'bool', ['uintptr_t', 'uintptr_t', 'int', 'int', 'int', 'int', 'uint']),
      ClientToScreen: lib.func('ClientToScreen', 'bool', ['uintptr_t', koffi.inout(koffi.pointer(POINT))]),
      SetForegroundWindow: lib.func('SetForegroundWindow', 'bool', ['uintptr_t']),
      BringWindowToTop: lib.func('BringWindowToTop', 'bool', ['uintptr_t']),
      AttachThreadInput: lib.func('AttachThreadInput', 'bool', ['uint', 'uint', 'bool']),
      GetCurrentThreadId: kernel32.func('GetCurrentThreadId', 'uint', []),
      GetDesktopWindow: lib.func('GetDesktopWindow', 'uintptr_t', []),
    }
  } catch (e) {
    console.error('[signal] user32 加载失败:', e)
    return null
  }
  return user32
}

// ---------- 后台进程调度 ----------

const PROCESS_SET_INFORMATION = 0x0200
const PROCESS_QUERY_INFORMATION = 0x0400
/** 进入后台模式：CPU/磁盘 IO 优先级降到最低，工作集页面优先被系统回收 */
const PROCESS_MODE_BACKGROUND_BEGIN = 0x00100000
/** 退出后台模式，恢复正常调度优先级 */
const PROCESS_MODE_BACKGROUND_END = 0x00200000

/**
 * 把被隐藏的 Signal 子进程切进 Windows「后台模式」/切回来。
 *
 * 多开卡的根源：每个账号都是一个完整的 Signal Electron 进程（main + renderer +
 * GPU + utility），宿主切走账号时只能把它的窗口 SW_HIDE，进程本身仍以普通优先级
 * 和前台账号抢 CPU、抢磁盘 IO，内存页面也不会被优先回收。开 3~5 个账号就等于
 * 同时跑 3~5 份 Signal。
 *
 * PROCESS_MODE_BACKGROUND_BEGIN（Vista 起提供）正是为这种场景设计的：把该进程
 * 的 CPU 与磁盘 IO 优先级压到最低，内核同时会优先修剪它的工作集，等于"把后台
 * 账号按下去"；切回前台时 END 立即恢复，界面响应不受影响。
 *
 * 只对**已隐藏**的窗口调 BEGIN：可见的 Signal 进程保持普通优先级，否则打字、
 * 滚动都会明显发涩。
 */
function setProcessBackground(pid: number | null | undefined, on: boolean): void {
  if (!pid) return
  const k = getK32()
  if (!k) return
  try {
    const handle = k.OpenProcess(PROCESS_SET_INFORMATION | PROCESS_QUERY_INFORMATION, false, pid)
    if (!handle) return
    k.SetPriorityClass(handle, on ? PROCESS_MODE_BACKGROUND_BEGIN : PROCESS_MODE_BACKGROUND_END)
    k.CloseHandle(handle)
    slog(`process background=${on} pid=${pid}`)
  } catch (e) {
    console.error('[signal] setProcessBackground 失败:', e)
  }
}

// ---------- 会话状态 ----------

interface Session {
  accountId: string
  child: ChildProcess | null
  signalHwnd: number
  state: SignalState
  lastBounds: ScreenBounds | null
  /** 上次实际下发的屏幕坐标(物理像素)；与本次相同则跳过 MoveWindow，避免稳态周期性抖动 */
  lastApplied: { x: number; y: number; w: number; h: number } | null
  /** 上次 1px nudge 的时间戳，用于给连续 resize 期间的 nudge 限流 */
  lastNudgeAt: number
  restartCount: number
  relaunchTimer: ReturnType<typeof setTimeout> | null
  monitorTimer: ReturnType<typeof setInterval> | null
  /** 正在主动停止/重启子进程：抑制"进程退出 → 崩溃自动重启"逻辑，避免双开 */
  stopping: boolean
}

const sessions = new Map<string, Session>()

let hostWindow: BrowserWindow | null = null
let boundHost: BrowserWindow | null = null

/**
 * 宿主 DOM 浮层（modal / 登录门等）打开期间为 true。
 *
 * 置位后 attachWindow 一律拒绝挂载：补试链、心跳、onState 触发的 embed 都不能把
 * 原生 Signal 窗口重新 show 出来。Signal 是独立顶层窗口（仅以 owner 方式贴靠宿主），
 * 只要 show 就一定盖在宿主 DOM 之上，所以"能不能显示"必须由这里统一裁决。
 */
let overlayPaused = false

/** 绑定宿主窗口（Signal 嵌入到该窗口内） */
export function bindHostWindow(win: BrowserWindow | null): void {
  hostWindow = win
  if (boundHost === win) return
  boundHost = win
  if (!win) return

  const hideEmbedded = (): void => {
    for (const [, s] of sessions) {
      showSignalWindow(s.signalHwnd, false)
      // 宿主最小化到托盘：所有 Signal 都不可见，一并压到后台优先级
      setProcessBackground(s.child?.pid, true)
    }
  }
  const showEmbedded = (): void => {
    if (win.isDestroyed() || win.isMinimized() || !win.isVisible()) return
    if (overlayPaused) return
    for (const [, s] of sessions) {
      if (!s.signalHwnd || !s.state.embedded) continue
      showSignalWindow(s.signalHwnd, true)
      setProcessBackground(s.child?.pid, false)
      relocateWindow(s.accountId, true)
    }
  }

  // Signal 是独立顶层原生窗口（仅以 owner 方式贴靠宿主），不像 LINE 的
  // WebContentsView 会自动跟随宿主。宿主最小化/隐藏/关闭时必须手动同步
  // 隐藏，否则关掉（最小化到托盘）或最小化主窗口后，Signal 界面会一直
  // 留在桌面上。'close' 覆盖点关闭按钮的场景，'hide' 覆盖最小化到托盘。
  win.on('minimize', hideEmbedded)
  win.on('hide', hideEmbedded)
  win.on('close', hideEmbedded)
  win.on('closed', hideEmbedded)
  // 恢复/重新显示宿主时同步显示已嵌入的 Signal 窗口并重新定位
  win.on('restore', showEmbedded)
  win.on('show', showEmbedded)
}

// ---------- 状态工具 ----------

function createSession(accountId: string): Session {
  const session: Session = {
    accountId,
    child: null,
    signalHwnd: 0,
    state: { accountId, status: 'idle', pid: null, unread: 0, embedded: false },
    lastBounds: null,
    lastApplied: null,
    lastNudgeAt: 0,
    restartCount: 0,
    relaunchTimer: null,
    monitorTimer: null,
    stopping: false,
  }
  sessions.set(accountId, session)
  return session
}

function getSession(accountId: string): Session {
  return sessions.get(accountId) || createSession(accountId)
}

export function getSignalState(accountId: string): SignalState {
  return getSession(accountId).state
}

function patchState(accountId: string, patch: Partial<SignalState>): SignalState {
  const session = getSession(accountId)
  session.state = { ...session.state, ...patch }
  // 同步到账号存储（账号卡片渲染）
  updateAccountStatus(accountId, {
    signalStatus: session.state.status,
    signalWindowId: session.state.pid || undefined,
  })
  broadcast(accountId)
  return session.state
}

function broadcast(accountId: string): void {
  if (!hostWindow || hostWindow.isDestroyed()) return
  hostWindow.webContents.send(SIGNAL_STATE_CHANNEL, getSession(accountId).state)
}

// ---------- 内置 Signal 资源定位 ----------

/** 内置 signal-app.asar 路径（打包：resources/；dev：项目根 resources/） */
export function resolveBundledSignalAsar(): string | null {
  // 打包后统一是 <resources>/signal-app.asar（Windows 与 macOS 同名，
  // 由各自平台的 extraResources 分别投放）
  const prod = join(process.resourcesPath, 'signal-app.asar')
  if (existsSync(prod)) return prod
  // dev：macOS 的内置 Signal 放在 resources/mac/ 下，与 Windows 版并存互不覆盖
  const candidates = [
    join(app.getAppPath(), 'resources', 'mac', 'signal-app.asar'),
    join(app.getAppPath(), 'resources', 'signal-app.asar'),
    join(__dirname, '..', '..', 'resources', 'mac', 'signal-app.asar'),
    join(__dirname, '..', '..', 'resources', 'signal-app.asar'),
  ]
  return candidates.find((p) => existsSync(p)) || null
}

/**
 * 内置 Signal 原生模块在磁盘上的位置。
 *
 * asar header 里这几个 .node 是 unpacked 条目，运行时 Electron 直接取这个真实路径加载；
 * 一旦 `#.asar.unpacked` 部署不完整，Signal main 启动时就会抛
 *   ENOENT, node_modules\@signalapp\...\@signalapp+libsignal-client.node not found in signal-app.asar
 */
export function signalNativeProbe(asarPath: string): string {
  // prebuilds 目录名是 <platform>-<arch>，例如 win32-x64 / darwin-arm64 / linux-x64
  const dir = `${process.platform}-${process.arch}`
  return join(
    `${asarPath}.unpacked`,
    'node_modules',
    '@signalapp',
    'libsignal-client',
    'prebuilds',
    dir,
    '@signalapp+libsignal-client.node'
  )
}

// ---------- 窗口定位 ----------

function hostHwnd(): number {
  if (!hostWindow || hostWindow.isDestroyed()) return 0
  // macOS 没有 HWND：跨进程窗口操作一律以 pid 为键（AppleScript / System Events），
  // 这里只需返回一个"宿主存在"的哨兵值，让上层 !host 的短路判断放行。
  if (process.platform !== 'win32') return 1
  try {
    const buf = hostWindow.getNativeWindowHandle()
    // Windows x64: HWND 为 64 位指针
    return Number(buf.readBigUInt64LE(0))
  } catch {
    return 0
  }
}

/**
 * 跨平台显示/隐藏 Signal 窗口。
 * Windows：ShowWindow（hwnd）；macOS：整个 Signal 进程的 visible（hwnd 令牌即 pid）。
 */
function showSignalWindow(hwnd: number, visible: boolean): void {
  if (!hwnd) return
  if (process.platform === 'win32') {
    const api = get32()
    if (api) api.ShowWindow(hwnd, visible ? SW_SHOW : SW_HIDE)
    return
  }
  // macOS：进程级 hide/unhide 是唯一的跨进程"隐藏"手段（AppKit 不支持改别人的窗口样式）
  void macSetProcessVisible(hwnd, visible)
}

function asciiToString(buf: Buffer, len: number): string {
  // 窗口类名/标题为 ASCII，直接用 latin1 截取
  return buf.toString('latin1', 0, len)
}

/** 按 PID 查找 Signal 主窗口（EnumWindows，多账号互不干扰）；优先返回可见主窗 */
function findSignalWindowByPid(pid: number): number {
  const api = get32()
  if (!api || !pid) return 0
  try {
    const list: number[] = []
    api.EnumWindows((hwnd: number) => {
      list.push(hwnd)
      return true
    }, 0)
    const pidBuf = new Int32Array(1)
    const clsBuf = Buffer.alloc(256)
    const titleBuf = Buffer.alloc(256)
    const candidates: string[] = []
    let fallback = 0
    for (const hwnd of list) {
      api.GetWindowThreadProcessId(hwnd, pidBuf)
      if (pidBuf[0] !== pid) continue
      const cls = asciiToString(clsBuf, api.GetClassNameA(hwnd, clsBuf, 256))
      if (!cls.includes('Chrome_WidgetWin')) continue
      const title = asciiToString(titleBuf, api.GetWindowTextA(hwnd, titleBuf, 256))
      const visible = (api.GetWindowLongW(hwnd, GWL_STYLE) & WS_VISIBLE) !== 0
      candidates.push(`hwnd=${hwnd} vis=${visible} title="${title.slice(0, 24)}"`)
      if (title && title.includes('Signal')) {
        if (visible) return hwnd // 优先可见的 Signal 主窗
        if (!fallback) fallback = hwnd
      }
    }
    slog(`findSignalWindowByPid pid=${pid} candidates=[${candidates.join(' | ')}] chosen=${fallback || 0}`)
    return fallback
  } catch (e) {
    console.error('[signal] EnumWindows 失败:', e)
  }
  return 0
}

/**
 * 校验窗口是否属于本账号自己启动的 Signal 进程。
 *
 * 这是防"串号"的最后一道防线：系统里可能同时存在多个 Signal 窗口
 * （用户桌面自己登录的个人版、其它账号的窗口）。只按标题 "Signal" 枚举会把
 * 别人的窗口抓进来，表现为"添加新账号后，嵌进去的是桌面上已登录的那个账号"。
 * 因此只认 pid：窗口的所属进程必须就是本会话 spawn 出来的那个。
 */
function isOwnSignalWindow(hwnd: number, pid: number | null | undefined): boolean {
  // macOS：窗口令牌就是 pid，比对即可（不存在"句柄失效后被别的窗口占用"的情况）
  if (process.platform !== 'win32') return !!hwnd && !!pid && hwnd === pid
  const api = get32()
  if (!api || !hwnd || !pid) return false
  if (!api.IsWindow(hwnd)) return false
  const pidBuf = new Int32Array(1)
  api.GetWindowThreadProcessId(hwnd, pidBuf)
  return pidBuf[0] === pid
}

/**
 * 探测 pid 对应的 Signal 窗口是否可用。
 * Windows 返回 HWND；macOS 没有句柄，返回 pid 本身作为"窗口令牌"（后续操作均以 pid 定位）。
 */
async function probeSignalWindow(pid: number): Promise<number> {
  if (!pid) return 0
  if (process.platform !== 'win32') {
    return (await macHasWindow(pid)) ? pid : 0
  }
  return findSignalWindowByPid(pid)
}

function waitForSignalWindow(pid: number, timeoutMs: number): Promise<number> {
  // pid 缺失（进程没起来）时立即返回：按 pid 找窗口本来就找不到，
  // 空转整个超时只会让用户对着空白界面白等（日志里出现过 45s 超时）。
  if (!pid) return Promise.resolve(0)
  const deadline = Date.now() + timeoutMs
  return new Promise((resolve) => {
    const tick = async (): Promise<void> => {
      const hwnd = await probeSignalWindow(pid)
      if (hwnd || Date.now() >= deadline) {
        resolve(hwnd)
        return
      }
      setTimeout(tick, 500)
    }
    tick()
  })
}

/** 宿主窗口客户区坐标(DIP) -> 物理像素 */
function toClientPixels(bounds: ScreenBounds): { x: number; y: number; w: number; h: number } {
  if (!hostWindow || hostWindow.isDestroyed()) {
    return { x: 0, y: 0, w: bounds.width, h: bounds.height }
  }
  const display = screen.getDisplayMatching(hostWindow.getBounds())
  const scale = display.scaleFactor || 1
  return {
    x: Math.round(bounds.x * scale),
    y: Math.round(bounds.y * scale),
    w: Math.round(bounds.width * scale),
    h: Math.round(bounds.height * scale),
  }
}

// ---------- 窗口奴役（slaving） ----------

/** 激活窗口（AttachThreadInput + SetForegroundWindow + BringWindowToTop） */
function raiseWindow(hwnd: number): void {
  if (process.platform !== 'win32') {
    void macRaiseProcess(hwnd)
    return
  }
  const api = get32()
  if (!api) return
  try {
    const pidBuf = new Int32Array(1)
    const tid = api.GetWindowThreadProcessId(hwnd, pidBuf)
    const curTid = api.GetCurrentThreadId()
    api.AttachThreadInput(curTid, tid, true)
    api.SetForegroundWindow(hwnd)
    api.BringWindowToTop(hwnd)
    api.AttachThreadInput(curTid, tid, false)
  } catch (e) {
    console.error('[signal] raiseWindow 失败:', e)
  }
}

/**
 * 将 Signal 窗口奴役进宿主（owner + 去边框 + 去任务栏独立项）。
 *
 * 参照鑫五洋 WinEmbed 的做法（而非简单地只清标题栏位）：
 * - SetWindowLongPtr(GWLP_HWNDPARENT) = owner（勿用 WS_CHILD SetParent，会破坏 IME/键盘）；
 * - GWL_STYLE：清 CHILD/CAPTION/THICKFRAME/MINIMIZEBOX/MAXIMIZEBOX/SYSMENU，置 POPUP
 *   （不含 WS_VISIBLE：可见性一律交给末尾的 ShowWindow(SW_SHOW)，原因见下方注释）；
 * - GWL_EXSTYLE：置 WS_EX_TOOLWINDOW、清 WS_EX_APPWINDOW（去任务栏独立项的关键）与
 *   WS_EX_NOACTIVATE（保留可激活）；
 * - SetWindowPos(SWP_FRAMECHANGED) 强制刷新非客户区，让去边框立即视觉生效。
 * 保持 Signal 为独立顶层窗口（WS_POPUP）以获得可靠键盘焦点/IME。
 */
function slaveWindow(hwnd: number, host: number): void {
  // macOS：没有 owner 关系也没有边框样式可改，等价于"确保进程可见"；
  // 真正的贴靠由 relocateWindowMac 每次把窗口摆到宿主内容区完成。
  if (process.platform !== 'win32') {
    void macSetProcessVisible(hwnd, true)
    return
  }
  const api = get32()
  if (!api) return
  try {
    const oldOwner = api.SetWindowLongPtrW(hwnd, GWLP_HWNDPARENT, host)
    // 基础样式：去标题栏/可缩放/系统菜单等，只留 POPUP（可见性交给 ShowWindow）
    // 这里不要写 WS_VISIBLE：SetWindowLong 直接改样式位不会给窗口发 WM_SHOWWINDOW，
    // Chromium 的窗口可见性跟踪因此不更新。切走(SW_HIDE)再切回时，窗口虽然"可见"，
    // 但渲染进程仍认为自己被隐藏、不重绘，Signal 界面就一直空白（只剩宿主画的外壳
    // 和工具栏），必须再随便拖一下窗口才恢复。显示统一交给下面的 ShowWindow(SW_SHOW)。
    const styleBefore = api.GetWindowLongW(hwnd, GWL_STYLE)
    api.SetWindowLongW(
      hwnd,
      GWL_STYLE,
      (styleBefore & ~WS_CHILD & ~WS_CAPTION & ~WS_THICKFRAME & ~WS_MINIMIZEBOX & ~WS_MAXIMIZEBOX & ~WS_SYSMENU) |
        WS_POPUP
    )
    const styleAfter = api.GetWindowLongW(hwnd, GWL_STYLE)
    // 扩展样式：去任务栏独立项 + 允许激活（隐藏自绘边框 / 独立成项的关键）
    const exBefore = api.GetWindowLongW(hwnd, GWL_EXSTYLE)
    api.SetWindowLongW(hwnd, GWL_EXSTYLE, (exBefore | WS_EX_TOOLWINDOW) & ~WS_EX_APPWINDOW & ~WS_EX_NOACTIVATE)
    const exAfter = api.GetWindowLongW(hwnd, GWL_EXSTYLE)
    // 去边框后强制刷新非客户区
    api.SetWindowPos(hwnd, HWND_TOP, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE | SWP_FRAMECHANGED)
    api.ShowWindow(hwnd, SW_SHOW)
    slog(
      `slaveWindow hwnd=${hwnd} host=${host} oldOwner=${oldOwner} style 0x${styleBefore.toString(16)}->0x${styleAfter.toString(16)} ex 0x${exBefore.toString(16)}->0x${exAfter.toString(16)}`
    )
  } catch (e) {
    console.error('[signal] slaveWindow 失败:', e)
  }
}

/** 解除奴役：恢复边框、独立 owner 与任务栏项 */
function releaseWindow(hwnd: number): void {
  // macOS：从未真正"奴役"过窗口，也就无需还原；保持可见即可
  if (process.platform !== 'win32') return
  const api = get32()
  if (!api) return
  try {
    const style = api.GetWindowLongW(hwnd, GWL_STYLE)
    api.SetWindowLongW(
      hwnd,
      GWL_STYLE,
      // 同上：不在这里置 WS_VISIBLE，由末尾的 ShowWindow(SW_SHOW) 负责显示
      (style & ~WS_POPUP & ~WS_CHILD) | WS_CAPTION | WS_THICKFRAME | WS_MINIMIZEBOX | WS_MAXIMIZEBOX | WS_SYSMENU
    )
    const ex = api.GetWindowLongW(hwnd, GWL_EXSTYLE)
    api.SetWindowLongW(hwnd, GWL_EXSTYLE, (ex & ~WS_EX_TOOLWINDOW) | WS_EX_APPWINDOW)
    api.SetWindowPos(hwnd, HWND_TOP, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE | SWP_FRAMECHANGED)
    api.SetWindowLongPtrW(hwnd, GWLP_HWNDPARENT, 0)
    api.ShowWindow(hwnd, SW_SHOW)
  } catch (e) {
    console.error('[signal] releaseWindow 失败:', e)
  }
}

/**
 * 把 Signal 原生窗口摆到宿主内对应位置。
 *
 * force=false（默认：心跳/重复上报）时先比较"换算后的屏幕坐标"，与上次完全一致
 * 就直接返回 —— 这是消除稳态下每 500ms 一次强制 MoveWindow 抖动（聊天窗口抖）的关键。
 * 必须在 ClientToScreen 之后比较：宿主窗口移动时客户区坐标不变、但屏幕坐标会变，
 * 那种情况必须真正执行 MoveWindow。
 */
/**
 * macOS 版重定位：把 Signal 窗口摆到宿主内容区所在位置。
 *
 * 坐标系统一性是与 Windows 最大的差别：
 * - Electron 的 getContentBounds() 返回内容区左上角的**屏幕**坐标，单位 DIP，原点在左上角；
 * - System Events 的 window position 同样是屏幕坐标、左上角原点、单位 points；
 * 两者一致，所以**不做** toClientPixels 那样的 scaleFactor 换算（那是 user32 走物理像素才需要）。
 */
function relocateWindowMac(accountId: string, force = false): void {
  const session = getSession(accountId)
  if (!session.signalHwnd || !session.lastBounds) {
    slog(`relocate(mac) skip account=${accountId} token=${session.signalHwnd} lb=${!!session.lastBounds}`)
    return
  }
  if (!hostWindow || hostWindow.isDestroyed()) return
  const b = session.lastBounds
  const content = hostWindow.getContentBounds()
  const x = Math.round(content.x + b.x)
  const y = Math.round(content.y + b.y)
  const w = Math.round(b.width)
  const h = Math.round(b.height)
  if (w < 40 || h < 40) return
  const prev = session.lastApplied
  // 与 Windows 侧同一套去抖：稳态下坐标没变就什么都不做，避免每 3s 心跳抖动窗口
  if (prev && prev.x === x && prev.y === y && prev.w === w && prev.h === h && !force) return
  session.lastApplied = { x, y, w, h }
  slog(`relocate(mac) -> x=${x} y=${y} w=${w} h=${h} token=${session.signalHwnd}`)
  queueMacBounds(session.signalHwnd, { x, y, w, h })
}

function relocateWindow(accountId: string, force = false): void {
  if (process.platform !== 'win32') {
    relocateWindowMac(accountId, force)
    return
  }
  const session = getSession(accountId)
  const api = get32()
  const host = hostHwnd()
  if (!api || !host || !session.signalHwnd || !session.lastBounds) {
    slog(`relocate skip account=${accountId} api=${!!api} host=${host} hwnd=${session.signalHwnd} lb=${!!session.lastBounds}`)
    return
  }
  const { x, y, w, h } = toClientPixels(session.lastBounds)
  try {
    // 宿主客户区坐标 -> 屏幕坐标（Signal 是独立顶层窗口；koffi 自动双向写回）
    const pt = { x, y }
    api.ClientToScreen(host, pt)
    const prev = session.lastApplied
    const same = !!prev && prev.x === pt.x && prev.y === pt.y && prev.w === w && prev.h === h
    if (same && !force) return
    const sizeChanged = !prev || prev.w !== w || prev.h !== h
    session.lastApplied = { x: pt.x, y: pt.y, w, h }
    slog(`relocate -> screen x=${pt.x} y=${pt.y} w=${w} h=${h}${sizeChanged ? ' size' : ''}`)
    api.MoveWindow(session.signalHwnd, pt.x, pt.y, w, h, true)
    // 1px nudge 只在"尺寸变化后"做一次，用于强制 Chromium 重绘（避免去边框/缩放后残留旧非客户区）。
    // 位置变化不做 nudge，否则拖动宿主窗口时会每帧 w→w-1→w 造成抖动；连续 resize 期间再限流。
    if (sizeChanged && w > 2 && h > 2 && Date.now() - session.lastNudgeAt > 250) {
      session.lastNudgeAt = Date.now()
      api.MoveWindow(session.signalHwnd, pt.x, pt.y, w - 1, h, false)
      api.MoveWindow(session.signalHwnd, pt.x, pt.y, w, h, true)
    }
  } catch (e) {
    console.error('[signal] MoveWindow 失败:', e)
  }
}

// ---------- 进程管理 ----------

function findSignalExe(): string | null {
  if (process.platform === 'darwin') {
    // macOS 上 Electron 应用的真实可执行文件在 <App>.app/Contents/MacOS/ 下
    const home = process.env['HOME'] || ''
    const candidates = [
      '/Applications/Signal.app/Contents/MacOS/Signal',
      join(home, 'Applications', 'Signal.app', 'Contents', 'MacOS', 'Signal'),
    ]
    return candidates.find((p) => existsSync(p)) || null
  }
  const local = process.env['LOCALAPPDATA'] || ''
  const pf = process.env['PROGRAMFILES'] || ''
  const candidates = [
    join(local, 'Programs', 'Signal', 'Signal.exe'),
    join(local, 'Programs', 'signal-desktop', 'Signal.exe'),
    join(pf, 'Signal', 'Signal.exe'),
  ]
  return candidates.find((p) => existsSync(p)) || null
}

/**
 * 账号对应的 Signal profile 目录（多账号隔离）。
 *
 * 永远返回独立目录，**绝不**回退到系统默认 Signal 数据目录（%APPDATA%\Signal）：
 * 一旦共享默认目录，新进程就会和用户桌面已登录的 Signal 抢单实例锁，被转发后
 * 立即退出；此时枚举系统窗口就会把桌面那个已登录的个人号当成"本账号窗口"嵌进来。
 * 历史数据里 signalAccountId 可能是 'default'/空（旧版"跟随系统 Signal"语义），
 * 这类账号按账号 id 派生一个独立目录。
 */
function profileDir(accountId: string): string {
  const acc = getAccount(accountId)
  const key =
    acc?.signalAccountId && acc.signalAccountId !== 'default'
      ? acc.signalAccountId
      : `acct-${accountId.replace(/^acc_/, '')}`
  return join(app.getPath('userData'), 'signal-profiles', key)
}

/** 所有内置 profile 的根目录 */
function profilesRoot(): string {
  return join(app.getPath('userData'), 'signal-profiles')
}

/**
 * 原子地整体删除一个 Signal profile 目录。
 *
 * 为什么不能直接 rmSync(dir, { recursive: true, force: true })：
 * Windows 上子进程仍持有 sql/db.sqlite、Local State 等文件句柄时，递归删除会
 * **删掉一部分、剩下被锁的一部分**。典型结果是 Local State（存放 os_crypt 主密钥，
 * SafeStorage 解密 DB 密钥依赖它）已被删掉，而 config.json（存着用旧主密钥加密的
 * encryptedKey）和 db.sqlite 残留。下次启动 Electron 重建 Local State / 主密钥，
 * 旧 encryptedKey 再也解不开，Signal 日志会打出：
 *   getSQLKey: got key from config, but it wasn't a string
 *   key/initialize: Generating new encryption key, since we did not find it on disk
 * 然后拿这把新密钥去开旧库 → SQLITE_NOTADB: file is not a database。
 *
 * 所以改成"先改名走，再删"：同盘 rename 是原子操作，只要还有句柄占用就会
 * EBUSY/EPERM 失败；失败时**一个文件都不删**，profile 保持完整。完整是无害的
 * （下次照常能打开），半残才是致命的。残留的 .trash-* 由后续启动时清理。
 */
function wipeProfileDir(dir: string): void {
  if (!existsSync(dir)) return
  const trash = `${dir}.trash-${Date.now()}`
  try {
    renameSync(dir, trash)
  } catch (e) {
    slog(`wipeProfileDir: rename 失败（进程仍占用句柄），保持 profile 完整、一个都不删: ${String(e)}`)
    return
  }
  try {
    rmSync(trash, { recursive: true, force: true })
  } catch (e) {
    slog(`wipeProfileDir: 删除 .trash 失败，留待下次启动清理: ${String(e)}`)
  }
}

/**
 * 关掉内置 Signal 自己的系统托盘图标。
 *
 * Signal 的 SystemTrayService 启动时会 `new Tray()` 往通知区域注册 NotifyIcon：
 * 我们每个账号都独立 spawn 一个 Signal 进程，托盘里就会冒出多个重复的 Signal
 * 图标；而这些进程常被 taskkill /F 强杀（TerminateProcess 没有清理机会），图标
 * 还会残留在托盘里直到鼠标划过。
 *
 * Signal 读取托盘设置的优先级（bundles/main.js SystemTraySettingCache）：
 *   --start-in-tray  >  --use-tray-icon  >  config.json 的 system-tray-setting
 * 我们不传前两个参数，所以把 config.json 里的这个键写死即可。注意必须在
 * wipeProfileDir **之后**调用——wipe 会把整个目录（含 config.json）一起删掉。
 *
 * 与 signal-packaged-patch 里的 Tray stub 形成双保险（belt-and-suspenders）。
 * 宿主的托盘图标不受影响，那是主程序自己的 Tray，跑在另一个进程里。
 */
function disableSignalSystemTray(dir: string | null): void {
  if (!dir) return
  try {
    const cfgPath = join(dir, 'config.json')
    let cfg: Record<string, unknown> = {}
    if (existsSync(cfgPath)) {
      try {
        cfg = JSON.parse(readFileSync(cfgPath, 'utf8') || '{}') as Record<string, unknown>
      } catch {
        // config.json 写坏了：当成空配置重建，不因为一个键而让 Signal 起不来
        cfg = {}
      }
    }
    // 已设置就跳过，避免每次启动都写盘（config.json 里还有 Signal 自己的其他设置，
    // 这里只增改这一个键，其余原样保留）
    if (cfg['system-tray-setting'] === 'DoNotUseSystemTray') return
    cfg['system-tray-setting'] = 'DoNotUseSystemTray'
    writeFileSync(cfgPath, JSON.stringify(cfg, null, 2), 'utf8')
    slog(`disableSignalSystemTray: 已禁用 Signal 托盘图标 ${cfgPath}`)
  } catch (e) {
    slog(`disableSignalSystemTray: 写入失败（不影响启动）: ${String(e)}`)
  }
}

// 注：内置 Signal 的自动更新**不在这里**关闭。Signal 主进程的更新判断读的是 asar 内
// config/production.json 的 updatesEnabled（npm config 包，bundles/main.js:
// `function ih(){return!f.app.isPackaged||!hd.default.get('updatesEnabled')}`），
// 与 profile 的 config.json 毫无关系。早期在这里写 config.json['updatesEnabled'] 的做法
// 完全无效：实测它仍会静默下载 128MB 官方安装包到 update-cache，再弹"有可用更新，
// 点击重启 Signal"，而 Winstaller 在 asar 环境里起不来，点下去毫无反应。
// 真正的开关由 scripts/patch-signal-asar.js 在打包 signal-app.asar 时就地改为 false。

/**
 * profile 是否已处于"半残"状态：DB 还在，但 os_crypt 主密钥文件（Local State）丢了。
 * 这种 profile 一旦启动必然 SQLITE_NOTADB，且密钥已不可恢复，只能整体清掉
 * 让 Signal 全新初始化（用户重新关联一次），总好过弹崩溃页。
 */
function isProfileBroken(dir: string): boolean {
  // DB 不存在 → 全新 profile，不算异常
  if (!existsSync(join(dir, 'sql', 'db.sqlite'))) return false
  // DB 还在，但解库密钥已经不可用，启动必然 SQLITE_NOTADB：
  //   1) Local State 丢了 —— os_crypt 主密钥没了，config.json 里的 encryptedKey 解不开
  //      （Signal 日志：getSQLKey: got key from config, but it wasn't a string）
  //   2) config.json 丢了 —— encryptedKey 整个没了
  //      （Signal 日志：key/initialize: Generating new encryption key...）
  //   3) config.json 在但 encryptedKey 不是有效字符串（被写坏/写空）
  if (!existsSync(join(dir, 'Local State'))) return true
  try {
    const cfg = JSON.parse(readFileSync(join(dir, 'config.json'), 'utf8')) as {
      encryptedKey?: unknown
    }
    return typeof cfg.encryptedKey !== 'string' || cfg.encryptedKey.length < 32
  } catch {
    return true
  }
}

/** 启动时清理历史遗留的 .trash-* 目录（上次退出时进程还没释放句柄、没删成的） */
export function cleanupStaleProfileTrash(): void {
  const root = profilesRoot()
  let names: string[]
  try {
    names = readdirSync(root)
  } catch {
    return
  }
  for (const name of names) {
    if (!name.includes('.trash-')) continue
    try {
      rmSync(join(root, name), { recursive: true, force: true })
      slog(`cleanupStaleProfileTrash: 已清理 ${name}`)
    } catch {
      /* 仍被占用，下次启动再试 */
    }
  }
}

/**
 * 子进程是否仍在运行。
 *
 * 必须同时看 signalCode：进程被 kill()/taskkill 杀掉时，Node 只填
 * signalCode='SIGTERM'，而 exitCode 保持 null。只看 exitCode 会把"已退出"
 * 误判成"还在跑"，从而走进强杀分支；此时 exit 事件早已触发过，
 * `child.once('exit')` 再也不会被调用，只能等兜底 setTimeout 到点——
 * 这正是删除账号/关闭 Signal 每次白等 3 秒的原因。
 */
function isChildAlive(child: ChildProcess | null | undefined): child is ChildProcess {
  return !!child && child.exitCode === null && child.signalCode === null
}

/** 等待子进程真正退出（文件句柄释放），超时则强杀进程树后再等一轮 */
async function waitForChildExit(child: ChildProcess | null, timeoutMs: number): Promise<void> {
  const pid = child?.pid
  const waitExit = (ms: number): Promise<void> =>
    new Promise((resolve) => {
      if (!isChildAlive(child)) {
        resolve()
        return
      }
      let done = false
      const finish = (): void => {
        if (!done) {
          done = true
          resolve()
        }
      }
      const timer = setTimeout(finish, ms)
      child?.once('exit', () => {
        clearTimeout(timer)
        finish()
      })
    })

  await waitExit(timeoutMs)
  // 这里还活着 = 上面是超时返回（进程没响应 kill），才值得强杀整个进程树
  if (pid && isChildAlive(child)) {
    // 连 GPU/Renderer 子进程一起收掉（它们同样占着 db.sqlite）
    killProcessTree(pid, true)
    await waitExit(3000)
  }
}

/**
 * 由设置里的 SOCKS5 配置构造代理 URL（与翻译请求使用同一套设置）。
 */
function buildProxyUrl(settings: Settings): string | null {
  const host = (settings.proxyHost || '').trim()
  const port = Number(settings.proxyPort) || 0
  if (!host || !port) return null
  const user = (settings.proxyUsername || '').trim()
  const pass = settings.proxyPassword || ''
  const auth = user ? `${encodeURIComponent(user)}:${encodeURIComponent(pass)}@` : ''
  return `socks5://${auth}${host}:${port}`
}

/** 日志里隐藏代理密码 */
function maskProxy(url: string): string {
  return url.replace(/\/\/([^:@/]+):([^@/]*)@/, '//$1:***@')
}

/**
 * 决定本次启动用哪个代理：
 * 1) 设置里填了 SOCKS5 → 用户显式配置优先，不做任何覆盖
 * 2) 没填但开启了"自动检测代理"（默认开启）→ 探测本机代理
 *    （Windows 系统代理 / Clash、v2rayN 等常见端口，见 proxy-detect.ts）
 * 3) 都没命中 → 直连（此时 chat.signal.org 被墙会导致二维码加载不出来）
 *
 * 自动探测结果是纯 loopback 地址、无认证，因此 URL 里不带用户名密码。
 */
async function resolveProxyUrl(settings: Settings): Promise<string | null> {
  const manual = buildProxyUrl(settings)
  if (manual) return manual

  if (settings.proxyAutoDetect === false) {
    slog('proxy: 未配置代理且已关闭自动检测 → 直连')
    return null
  }

  const auto = await detectLocalProxy()
  if (!auto) {
    slog('proxy: 未配置代理，且未探测到可用本地代理 → 直连（若二维码加载不出来请配置代理）')
    return null
  }
  if (auto.weak) {
    slog(
      `proxy: 自动探测到本地代理 ${auto.host}:${auto.port}（${auto.source}），但通过它暂未能连上 chat.signal.org（代理可能没放行 Signal），二维码仍可能加载不出来`
    )
  } else {
    slog(`proxy: 自动探测到本地可用代理 ${auto.host}:${auto.port}（${auto.source}）`)
  }
  return `socks5://${auto.host}:${auto.port}`
}

/**
 * Signal 的网络连接必须走用户配置的 SOCKS5 代理，否则在国内容易出现
 * "扫码关联后一直卡在正在同步联系人和群组"（chat.signal.org /
 * grpc.chat.signal.org 被 DNS 污染或 TCP 拒绝连接）。
 *
 * Signal Desktop 唯一支持的代理入口是环境变量 HTTPS_PROXY
 * （bundles/main.js: proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy），
 * 主进程把它透传给 libsignal 的 Net.setProxyFromUrl()，以及 WebSocket/HTTP agent。
 *
 * 注意：代理在进程启动时注入，改动设置后必须重启 Signal 子进程才生效（见 relaunch）。
 */
function buildChildEnv(proxyUrl: string | null): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...process.env }
  if (!proxyUrl) return env
  env.HTTPS_PROXY = proxyUrl
  env.https_proxy = proxyUrl
  env.HTTP_PROXY = proxyUrl
  env.http_proxy = proxyUrl
  env.ALL_PROXY = proxyUrl
  env.all_proxy = proxyUrl
  env.NO_PROXY = 'localhost,127.0.0.1,::1'
  env.no_proxy = env.NO_PROXY
  return env
}

function stopMonitor(accountId: string): void {
  const session = getSession(accountId)
  if (session.monitorTimer) {
    clearInterval(session.monitorTimer)
    session.monitorTimer = null
  }
  if (session.relaunchTimer) {
    clearTimeout(session.relaunchTimer)
    session.relaunchTimer = null
  }
}

function startMonitor(accountId: string): void {
  const session = getSession(accountId)
  if (session.monitorTimer) return
  session.monitorTimer = setInterval(() => {
    // ⚠️ 进程存活必须**优先**判断，不能放在 signalHwnd 判断之后。
    // 旧实现是 `if (session.signalHwnd && !IsWindow(...))`：句柄一旦被清零，
    // 后续 tick 全部短路，进程之后再退出也永远不会走 handleExit ——
    // 结果就是不重启、不提示，界面永久空白（菜单等外壳 UI 还正常）。
    if (session.child && !isChildAlive(session.child)) {
      handleExit(accountId)
      return
    }
    // 没有子进程却还标着 embedded：假状态，校正为 running 让上层重新走 embed
    if (!session.child) {
      if (session.state.embedded) {
        session.state.embedded = false
        slog(`monitor 校正假 embedded（无子进程）account=${accountId}`)
        patchState(accountId, { status: 'running', embedded: false, pid: null, error: undefined })
      }
      return
    }
    if (!session.signalHwnd) return
    if (get32()?.IsWindow(session.signalHwnd)) return
    // 窗口句柄失效但进程仍在：Signal 的 renderer 崩溃恢复 / 窗口重建会走到这里。
    // 按本会话 pid 找回被重建的窗口并重新挂载（绝不用"按标题枚举任意 Signal 窗口"
    // 兜底，否则会把桌面已登录的 Signal 或其它账号的窗口误嵌进来）。
    const lost = session.signalHwnd
    session.signalHwnd = 0
    session.state.embedded = false
    const pid = session.child.pid || 0
    const hwnd = pid ? findSignalWindowByPid(pid) : 0
    slog(`monitor window lost hwnd=${lost} pid=${pid} reattach=${hwnd}`)
    if (hwnd) {
      session.signalHwnd = hwnd
      attachWindow(accountId)
    } else {
      // 新窗口还没出现：置 running，让渲染层的重试逻辑走 embed 等新窗口
      patchState(accountId, { status: 'running', embedded: false })
    }
  }, 3000)
}

function handleExit(accountId: string): void {
  const session = getSession(accountId)
  // 主动重启/退出中：不要把"我们自己的停止"当成崩溃去自动重启
  if (session.stopping) return
  session.child = null
  session.signalHwnd = 0
  session.state.embedded = false

  // 注意：这里**不再**"按标题抓一个 Signal 窗口来复用"。
  // 子进程退出后它自己的窗口必然随之销毁，此时枚举到的任何 Signal 窗口都属于
  // 别人（用户桌面自己登录的个人版 / 其它账号），嵌进来就是串号。
  session.state.pid = null
  patchState(accountId, { status: 'crashed', error: 'Signal 进程已退出' })

  // 自动重启（最多连续 3 次）
  if (session.restartCount < MAX_RESTART) {
    session.restartCount += 1
    session.relaunchTimer = setTimeout(() => {
      patchState(accountId, { status: 'starting', error: undefined })
      void launch(accountId).then((s) => {
        if (s.status !== 'error') return embed(accountId)
        return s
      })
    }, 2000)
  } else {
    session.restartCount = 0
    patchState(accountId, { status: 'crashed', error: '连续重启失败，请手动处理' })
  }
}

let macAutomationChecked = false

/**
 * macOS 首次挂载时探测一次「自动化」权限，没有就往 signal-embed.log 里写一条人话提示。
 *
 * 这个权限决定了能不能替用户把 Signal 窗口摆到宿主内容区；没有它 Signal 照常能用，
 * 只是窗口停在用户自己放的位置 —— 这是 macOS 上最常见的"Signal 不听话"原因，必须留痕。
 */
async function reportMacAutomationOnce(): Promise<void> {
  if (macAutomationChecked) return
  macAutomationChecked = true
  try {
    const ok = await macAutomationAllowed()
    slog(
      ok
        ? 'macOS: 已获得「自动化」权限，Signal 窗口将跟随宿主内容区'
        : 'macOS: 缺少「自动化」权限（系统设置 → 隐私与安全性 → 自动化 → 本应用 → System Events）。' +
            'Signal 可正常登录与收发，但窗口位置不会自动跟随宿主，需要用户手动摆放。'
    )
  } catch {
    /* 探测本身出问题不影响主流程 */
  }
}

function attachWindow(accountId: string): void {
  const session = getSession(accountId)
  // 宿主有浮层盖在最上面时一律不挂载：继续 slaveWindow/ShowWindow 会让原生窗口
  // 立刻盖住浮层（owner 关系决定它永远在宿主 DOM 之上），浮层关掉后会由
  // setOverlayPaused(false) 统一恢复显示。
  if (overlayPaused) {
    slog(`attachWindow SKIP overlayPaused account=${accountId}`)
    return
  }
  const api = get32()
  const host = hostHwnd()
  slog(`attachWindow account=${accountId} host=${host} hwnd=${session.signalHwnd}`)
  // macOS：窗口/进程有无举动的前提是拿到了 System Events 的「自动化」权限。
  // 没有权限时 Signal 依然能登录收发（翻译走 renderer 注入），只是窗口不跟随宿主。
  if (process.platform !== 'win32') void reportMacAutomationOnce()

  if (process.platform === 'win32' && (!api || !host)) {
    slog(`attachWindow FAIL host unavailable host=${host}`)
    patchState(accountId, { status: 'error', error: '宿主窗口不可用' })
    return
  }
  if (!session.signalHwnd) {
    slog('attachWindow FAIL no signalHwnd')
    patchState(accountId, { status: 'error', error: 'Signal 窗口无效' })
    return
  }
  // 最后一道防线：待嵌入的窗口必须属于本账号自己 spawn 的 Signal 进程。
  // 桌面另开的 Signal、其它账号的窗口一律拒绝，避免"添加账号后显示成桌面已登录账号"。
  if (!isOwnSignalWindow(session.signalHwnd, session.child?.pid)) {
    slog(
      `attachWindow REJECT foreign window hwnd=${session.signalHwnd} pid=${session.child?.pid ?? 'null'}`
    )
    session.signalHwnd = 0
    session.state.embedded = false
    patchState(accountId, { status: 'starting', error: undefined })
    return
  }
  try {
    slaveWindow(session.signalHwnd, host)
    session.state.embedded = true
    patchState(accountId, { status: 'embedded', error: undefined })
    // 前台账号恢复正常调度优先级（它在后台等待嵌入期间被压过）
    setProcessBackground(session.child?.pid, false)
    // 首次嵌入必须强制摆放（此时 lastApplied 为空，尺寸从无到有会触发一次 nudge）
    relocateWindow(accountId, true)
    raiseWindow(session.signalHwnd)
    slog(`attachWindow OK embedded hwnd=${session.signalHwnd} lastBounds=${JSON.stringify(session.lastBounds)}`)
  } catch (e) {
    slog('attachWindow EXC ' + String(e))
    patchState(accountId, { status: 'error', error: '嵌入失败: ' + String(e) })
  }
}

/** 解析 Signal 子进程 stdout 标记：未读计数 / 渲染进程恢复 */
function parseSignalOutput(accountId: string, buf: Buffer): void {
  const text = buf.toString('utf8')
  // 完整记录子进程 stdout（signal-packaged-patch / signal-mode 的 console 输出），用于定位登录/初始化问题
  try {
    appendFileSync(
      join(app.getPath('userData'), `signal-child-${accountId}.log`),
      `${new Date().toISOString()} ${text}`
    )
  } catch {
    /* ignore */
  }
  for (const line of text.split('\n')) {
    const m = line.match(/\[MT-UNREAD\]\s+(\d+)/)
    if (m) {
      setUnread(accountId, Number(m[1]))
      continue
    }
    if (line.includes('[MT-RENDER-RECOVER]')) {
      const session = getSession(accountId)
      setTimeout(() => {
        const pid = session.child?.pid || 0
        if (!session.child || !isChildAlive(session.child) || !pid) return
        // 渲染进程恢复后窗口可能已被重建：旧句柄失效就按 pid 重新找回再挂载。
        // 旧实现要求"signalHwnd 仍然有效"，而句柄一旦被 monitor 清零，
        // 这条自愈就永远不执行 → 窗口重建后再也挂不回去（界面永久空白）。
        // Windows 必须校验句柄仍然有效；macOS 的令牌是 pid，没有失效概念
        const stillValid = process.platform === 'win32' ? !!get32()?.IsWindow(session.signalHwnd) : true
        if (!session.signalHwnd || !stillValid) {
          const hwnd = findSignalWindowByPid(pid)
          slog(`render-recover 重新查找窗口 pid=${pid} hwnd=${hwnd}`)
          if (!hwnd) return
          session.signalHwnd = hwnd
        }
        attachWindow(accountId)
      }, 2500)
    }
  }
}

// ---------- 对外接口（IPC 层调用） ----------

/** 启动 Signal 子进程（优先内置 asar，回退系统安装版） */
export async function launch(accountId: string): Promise<SignalState> {
  const acc = getAccount(accountId)
  if (!acc) {
    return getSession(accountId).state
  }
  const session = getSession(accountId)
  const api = get32()
  // Windows 依赖 user32 做窗口奴役；macOS 用 AppleScript 托管进程窗口，无需 user32
  if (process.platform === 'win32' && !api) {
    return patchState(accountId, { status: 'error', error: 'user32 不可用（仅支持 Windows）' })
  }

  // 已在运行 → 复用 embed 的"等待/嵌入已有窗口"流程：它只认本会话 pid 的窗口，
  // 且进程还活着时不会重复 spawn。此前这里走的 attachWindowAndReturn 用
  // findAnySignalWindow 抓窗口，会把桌面已打开的 Signal 误嵌入本账号。
  if (isChildAlive(session.child)) {
    return embed(accountId)
  }

  // 注意：不再用 findAnySignalWindow() 去"接管任意 Signal 窗口"。
  // 多账号场景下那样会让第二个账号误复用到第一个账号已开的 Signal 窗口，
  // 导致"打开多个 Signal 账号却只显示一个"。每个账号都独立 spawn（各自
  // --user-data-dir profile，Signal 单实例锁基于 userData，故能真正多开）。

  // 启动命令：内置 asar 优先
  const bundled = resolveBundledSignalAsar()
  const args: string[] = []
  if (bundled) {
    if (!app.isPackaged) {
      // dev：electron.exe 需显式指定 app 路径（项目根，加载 out/main/bootstrap.js）
      args.push(app.getAppPath())
    }
    args.push('--signal-mode')
  }
  const dir = profileDir(accountId)
  if (dir) {
    // 半残 profile 自检：DB 还在、但 os_crypt 主密钥文件（Local State）没了 → 必然 NOTADB。
    // 密钥已不可恢复，整体清掉让 Signal 全新初始化，避免用户看到数据库崩溃页。
    if (isProfileBroken(dir)) {
      slog(`launch: 检测到半残 profile（缺 Local State），整体清除后全新初始化: ${dir}`)
      wipeProfileDir(dir)
    }
    // 顺序要紧：wipe 会把 config.json 一并删掉，必须在这之后再写这些设置
    disableSignalSystemTray(dir)
    args.push(`--user-data-dir=${dir}`)
  }

  const exe = bundled ? process.execPath : findSignalExe()
  if (!exe) {
    return patchState(accountId, { status: 'error', error: '未找到 Signal Desktop，请先安装' })
  }

  // 代理：Signal 自己的网络（关联码、消息、联系人同步）走 HTTPS_PROXY 环境变量，
  // 渲染层的图片/媒体/CDN 走 Chromium 的 --proxy-server，两者必须一致；
  // 否则会出现"能登录但一直同步不完"或"头像、附件全部空白"。
  // 设置里没填代理时，自动探测本机可用代理（见 resolveProxyUrl / proxy-detect.ts）
  const proxyUrl = await resolveProxyUrl(store.getSettings())
  const env = buildChildEnv(proxyUrl)
  if (proxyUrl) {
    args.push(`--proxy-server=${proxyUrl}`)
    // 宿主本地翻译服务在 127.0.0.1，必须绕过代理
    args.push('--proxy-bypass-list=localhost;127.0.0.1;<local>')
  }

  patchState(accountId, { status: 'starting', error: undefined, pid: null })
  // 部署自检（只记日志，不阻断）：原生模块缺失时 Signal 必然启动失败，
  // 先在这里写明缺的是哪个文件，省得再去猜 "not found in signal-app.asar"。
  if (bundled && !existsSync(signalNativeProbe(bundled))) {
    slog(`launch 警告: 内置 Signal 原生模块缺失 ${signalNativeProbe(bundled)}（signal-app.asar.unpacked 部署不完整）`)
  }
  slog(
    `launch spawn exe=${exe} args=${JSON.stringify(args.map((a) => maskProxy(a)))} ` +
      `bundled=${!!bundled} proxy=${proxyUrl ? maskProxy(proxyUrl) : 'direct(未配置代理)'}`
  )
  try {
    const child = spawn(exe, args, { detached: true, stdio: ['ignore', 'pipe', 'pipe'], env })
    child.unref()
    session.child = child
    session.state.pid = child.pid ?? null
    slog(`launch spawned pid=${child.pid ?? 'null'}`)
    // 新进程在窗口嵌入前一直是隐藏的：先压到后台优先级，attachWindow 时再恢复，
    // 这样"预启动 / 补试链重试"的账号不会在等待期间和前台账号抢资源。
    setProcessBackground(child.pid, true)
    child.stdout?.on('data', (buf: Buffer) => parseSignalOutput(accountId, buf))
    // Signal 的启动失败原因（asar 定位失败、原生模块、profile 损坏…）基本都走 stderr。
    // 之前完全没监听：既查不到原因，管道写满还会把子进程卡住。这里与 stdout 落到同一个日志。
    child.stderr?.on('data', (buf: Buffer) => {
      const text = buf.toString('utf8')
      try {
        appendFileSync(
          join(app.getPath('userData'), `signal-child-${accountId}.log`),
          `${new Date().toISOString()} [stderr] ${text}`
        )
      } catch {
        /* ignore */
      }
      slog(`signal stderr: ${text.trim().slice(0, 500)}`)
    })
    child.on('error', (err) => {
      slog(`launch child error: ${err.message}`)
      patchState(accountId, { status: 'error', error: '启动失败: ' + err.message })
    })
    child.on('exit', () => {
      // 延迟处理，让已有实例场景的窗口先出现
      setTimeout(() => {
        // 已被重启替换成新进程 → 忽略旧进程的退出事件（否则会把新进程状态清掉/再拉起一个）
        if (session.child !== child) return
        handleExit(accountId)
      }, 1000)
    })
    startMonitor(accountId)
    return session.state
  } catch (e) {
    slog(`launch spawn EXC: ${String(e)}`)
    return patchState(accountId, { status: 'error', error: '启动失败: ' + String(e) })
  }
}

/** 等待窗口出现并嵌入宿主窗口 */
export async function embed(accountId: string): Promise<SignalState> {
  const session = getSession(accountId)
  if (process.platform === 'win32' && !get32()) {
    return patchState(accountId, { status: 'error', error: 'user32 不可用' })
  }
  slog(`embed start account=${accountId} hasHwnd=${!!session.signalHwnd} hasChild=${!!session.child}`)
  // 进程尚未启动则先启动
  if (!isChildAlive(session.child)) {
    await launch(accountId)
  }
  if (session.signalHwnd) {
    // 句柄可能已失效（Signal 的 renderer 恢复会重建窗口）：先校验再走复用，
    // 无效就当场丢弃并落到下面的"等待本账号窗口"流程。
    if (isOwnSignalWindow(session.signalHwnd, session.child?.pid)) {
      slog(`embed reuse existing hwnd=${session.signalHwnd}`)
      attachWindow(accountId)
      if (session.signalHwnd) return session.state
    } else {
      slog(`embed 丢弃失效句柄 hwnd=${session.signalHwnd}（窗口已被 Signal 重建）`)
      session.signalHwnd = 0
      session.state.embedded = false
    }
  }
  patchState(accountId, { status: 'embedding', error: undefined })
  const pid = session.child?.pid
  if (!pid) {
    // 进程没起来就没有窗口可等：立即报错让上层重试，
    // 不要 sleep 整个超时（历史日志里出现过白等 45s 的情况）。
    slog('embed abort: 无子进程 pid（launch 未成功）')
    return patchState(accountId, { status: 'error', error: 'Signal 未启动成功，请重试或检查账号配置' })
  }
  let hwnd = await waitForSignalWindow(pid, 45000)
  slog(`embed waitResult hwnd=${hwnd} pid=${pid}`)
  // 注意：这里**不能**退化成"按标题枚举任意 Signal 窗口"。
  // 那样会把用户桌面已登录的 Signal（或其它账号的窗口）误嵌入本账号——
  // 典型现象就是"添加 Signal 账号后，显示的是桌面上那个已经登录的账号"。
  // 按本会话 pid 找不到窗口就如实报错，由上层重启或提示用户处理。
  if (!hwnd) {
    return patchState(accountId, {
      status: 'error',
      error: '未找到本账号的 Signal 窗口（若系统中已登录其它 Signal，请完全退出后重试）',
    })
  }
  session.signalHwnd = hwnd
  attachWindow(accountId)
  return session.state
}

/** 更新 Signal 窗口在宿主内的位置（bounds 为宿主客户区坐标 DIP） */
export function relocate(accountId: string, bounds: ScreenBounds): SignalState {
  const session = getSession(accountId)
  session.lastBounds = bounds
  relocateWindow(accountId)
  return session.state
}

/**
 * 优雅停掉某个账号的 Signal 子进程，**保留 profile 目录**。
 *
 * 这是所有"停止"路径共用的底层实现（应用退出 / 重启以注入代理 / 重置登录）。
 * 只负责把进程停下来：解除嵌入 → WM_CLOSE 优雅关闭 → 等进程真正退出
 * （文件句柄释放）→ 超时才强杀进程树。**绝不碰 profile 目录**，
 * 登录态、聊天记录、DB 密钥全部原地保留。
 */
async function stopSession(accountId: string): Promise<void> {
  const session = getSession(accountId)
  const api = get32()
  if (api && session.signalHwnd) {
    try {
      releaseWindow(session.signalHwnd)
    } catch {
      /* ignore */
    }
    session.signalHwnd = 0
  }
  session.state.embedded = false

  const aliveChild = session.child
  if (isChildAlive(aliveChild)) {
    // 先发 WM_CLOSE 优雅退出，让 Signal 正常落盘
    const hwnd = findSignalWindowByPid(aliveChild.pid || 0)
    if (api && hwnd) api.PostMessageW(hwnd, WM_CLOSE, 0, 0)
    // 必须等进程真正退出（文件句柄释放）再返回。
    // 之前固定等 2.5s 就 kill，常常 Signal 的 GPU/Renderer 还没退，此时任何触碰
    // profile 的操作都会踩到占用中的文件（递归删目录会删出 "Local State 没了、
    // db.sqlite 还在"的半残 profile → 下次启动 SQLITE_NOTADB）。
    await waitForChildExit(aliveChild, 6000)
  }
  stopMonitor(accountId)
  session.child = null
  session.restartCount = 0
}

/**
 * 解除嵌入、退出 Signal 进程，并**销毁 profile**（下次启动全新初始化，需重新扫码登录）。
 *
 * ⚠️ 破坏性操作：只用于"清除登录数据"/"删除账号"等明确要丢弃登录态的场景。
 * 应用退出、重启进程请用 cleanupAllSignals()/relaunch()，**不要用 reset()**——
 * 历史上 before-quit 误用 reset() 销毁 profile，正是
 * "每次退出软件再打开 Signal 就报 SQLITE_NOTADB" 的根源。
 */
export async function reset(accountId: string): Promise<SignalState> {
  await stopSession(accountId)
  // 内置模式：删除该账号 profile。
  // 用 wipeProfileDir 做原子删除：进程仍占用时宁可一个都不删，也绝不留半残目录。
  const dir = profileDir(accountId)
  if (dir) wipeProfileDir(dir)
  return patchState(accountId, { status: 'idle', pid: null, error: undefined })
}

/**
 * 重启 Signal 子进程（**保留 profile：登录态、聊天记录都在**）。
 *
 * 主要用途：改完 SOCKS5 代理等设置后，让 Signal 重新启动以注入最新代理——
 * HTTPS_PROXY / --proxy-server 只在进程启动时生效，运行中改设置不会作用到已有进程。
 * 与 reset() 的区别：reset 会删掉 profile 目录（需要重新扫码登录），relaunch 不会。
 */
export async function relaunch(accountId: string): Promise<SignalState> {
  const session = getSession(accountId)
  if (!get32()) {
    return patchState(accountId, { status: 'error', error: 'user32 不可用（仅支持 Windows）' })
  }
  session.stopping = true
  try {
    // 只停进程、**保留 profile**：登录态 / 聊天记录 / DB 密钥全部原地不动，
    // 仅换一个进程起来，好让 HTTPS_PROXY、--proxy-server 等启动参数生效。
    await stopSession(accountId)
    patchState(accountId, { status: 'idle', pid: null, embedded: false, error: undefined })
    slog(`relaunch account=${accountId} 旧进程已停止，重新启动并注入最新代理设置`)
    const state = await launch(accountId)
    if (state.status === 'error') return state
    return await embed(accountId)
  } finally {
    session.stopping = false
  }
}

/**
 * 删除 Signal 账号用：强杀该账号 Signal 进程树（taskkill /F /T），然后等进程真正退出
 * （释放 profile 文件句柄）再整体清 profile——宁可留着完整 profile，也不留半残目录
 * （半残会导致 SQLITE_NOTADB）。进程正常几百毫秒内退出，最长等 5s。
 */
export async function killNow(accountId: string): Promise<SignalState> {
  const session = getSession(accountId)
  const api = get32()
  if (api && session.signalHwnd) {
    try {
      releaseWindow(session.signalHwnd)
    } catch {
      /* ignore */
    }
    session.signalHwnd = 0
  }
  session.state.embedded = false

  const child = session.child
  const pid = child?.pid
  if (child) {
    try {
      child.kill()
    } catch {
      /* ignore */
    }
  }
  // 强杀整棵进程树（detached 启动，child.kill 只杀主 PID，GPU/renderer 子进程要连组一起收）
  if (pid) killProcessTree(pid, false)
  stopMonitor(accountId)
  session.child = null
  session.restartCount = 0

  // 强杀是异步的：等进程树真正退出（文件句柄释放）后再整体清 profile，
  // 且用 wipeProfileDir 原子删除——删不干净就一个也不删，绝不留半残目录（半残会导致 NOTADB）
  const dir = profileDir(accountId)
  if (dir) {
    await waitForChildExit(child, 5000)
    wipeProfileDir(dir)
  }

  return patchState(accountId, { status: 'idle', pid: null, error: undefined })
}

/**
 * 切走账号时隐藏嵌入的 Signal（不脱离主窗口）。
 *
 * 对齐鑫五洋做法：切走时**不摘除 owner、不还原独立窗口**，仅把 Signal 窗口隐藏
 * （保持宿主 owner + 去边框 + 仍在主窗口坐标系内），进程与登录态保留；切回时
 * ensureSignalEmbedded → embed → slaveWindow(重新 ShowWindow) + relocate 即恢复。
 * 这样 Signal 不会"切到其它账号就脱离主窗口变成独立浮窗"。
 */
export function detach(accountId: string): SignalState {
  const session = getSession(accountId)
  showSignalWindow(session.signalHwnd, false)
  // 切走的账号：窗口已隐藏，进程同时压到后台优先级（多开时后台账号不再抢 CPU/IO）
  setProcessBackground(session.child?.pid, true)
  session.state.embedded = false
  // status 置 running：Signal 进程仍在跑，只是窗口隐藏；切回时 ensureSignalEmbedded 依 running 重新 embed
  return patchState(accountId, { status: 'running', embedded: false, error: undefined })
}

/** 健康检查：返回当前状态（并校正进程存活） */
export function health(accountId: string): SignalState {
  const session = getSession(accountId)
  if (session.child && !isChildAlive(session.child)) {
    // 进程已退，走退出处理
    handleExit(accountId)
  } else if (!session.child && session.state.embedded) {
    // 没有子进程却还标着 embedded（monitor 短路留下的假状态）：
    // 渲染层会据此认为"已嵌入"而放弃任何恢复动作，必须先校正掉。
    // 置 running 而非 crashed：上层 ensureSignalEmbedded / embed 会重新拉起进程。
    slog(`health 校正假 embedded 状态 account=${accountId}（无子进程）`)
    patchState(accountId, { status: 'running', embedded: false, pid: null, error: undefined })
  }
  return session.state
}

/** 手动/自动设置未读数 */
export function setUnread(accountId: string, n: number): SignalState {
  const unread = Math.max(0, Math.floor(Number.isFinite(n) ? n : 0))
  return patchState(accountId, { unread })
}

/**
 * 应用退出时停掉所有 Signal 进程（**保留 profile / 登录态**）。
 *
 * 注意：Signal 子进程是 detached 启动的，父进程退出**不会**带走它。
 * 因此这里返回 Promise，调用方必须等待（或配合 killAllSignalsNow 兜底），
 * 否则会出现"完全退出软件后 signal 仍在运行"。
 *
 * 这里**只能停进程，绝不能销毁 profile**：退出软件不该丢登录态，否则每次关软件
 * 都要重新扫码关联。历史上这里误用了 reset()（会删 profile），而进程又常常没退
 * 干净，于是删出"Local State 已丢、db.sqlite 残存"的半残目录 → 下次启动 Signal
 * 生成新密钥去开旧库 → SQLITE_NOTADB: file is not a database。
 */
export function cleanupAllSignals(): Promise<void> {
  return Promise.all([...sessions.keys()].map((id) => stopSession(id))).then(() => undefined)
}

/**
 * 退出兜底：**同步**强杀所有 Signal 进程树。
 *
 * 子进程 detached + unref 启动，主进程退出后仍会存活；stopSession() 里的优雅
 * 关闭最多要等 6s（等进程真正退出以释放文件句柄），窗口关闭 / app.exit 时来不及
 * 跑完，必须有一个同步、立即生效的兜底（taskkill /F /T 杀整棵树，覆盖 signal
 * 的 GPU/Renderer 子进程）。
 *
 * 注意：这里只杀进程，**不删 profile**——强杀后句柄仍可能被占用，此时去动 profile
 * 目录正是产生半残目录（→ SQLITE_NOTADB）的根源。profile 留给下次启动自检/清理。
 */
export function killAllSignalsNow(): void {
  for (const [, s] of sessions) {
    const pid = s.child?.pid ?? s.state.pid ?? 0
    stopMonitor(s.accountId)
    if (s.child) {
      try {
        s.child.kill()
      } catch {
        /* ignore */
      }
    }
    if (pid) killProcessTree(pid, true)
    s.child = null
    s.signalHwnd = 0
    s.state.embedded = false
  }
}

/** 宿主窗口移动/缩放时重定位所有已嵌入窗口（force：客户区 DIP 未变但屏幕坐标已变） */
export function relocateAllEmbedded(): void {
  for (const [id, session] of sessions) {
    if (session.signalHwnd && session.state.embedded) {
      relocateWindow(id, true)
    }
  }
}

/** 宿主 DOM 浮层（modal 等）打开时隐藏已嵌入 Signal 窗口；全部关闭后恢复并重新定位。
 *  暂停期间 attachWindow 会被拦截，避免补试链/心跳触发的 embed 让原生窗口重新盖住浮层。 */
export function setOverlayPaused(paused: boolean): void {
  // 先记状态再操作窗口：即使此刻拿不到 user32（api 为空）直接 return，
  // attachWindow 仍能按 paused 拦截，浮层不会在之后被 embed 盖住。
  overlayPaused = paused
  for (const [, s] of sessions) {
    if (!s.signalHwnd || !s.state.embedded) continue
    showSignalWindow(s.signalHwnd, !paused)
    setProcessBackground(s.child?.pid, paused)
    if (!paused) relocateWindow(s.accountId, true)
  }
}


