/**
 * Messenger 主窗口内嵌管理器。
 *
 * ⚠️ 当前 Messenger 的**主路径**是宿主主窗口里的 `<webview>` 容器（与 WhatsApp /
 * Telegram 共用 buildWebviewWrapper，见 src/main/ipc/webview.ts 的配置下发与
 * services/webview-session.ts 的 session 级处理），跨平台，macOS 上同样可用。
 *
 * 本模块是「独立 electron 子进程 + user32 把子进程窗口奴役进宿主」的**旧实现**，
 * 现在只保留两个用途：
 *   1) 删除账号时兜底关闭遗留的子进程会话（renderer 的 messengerWindow.close）
 *   2) 兼容仍在调用这些 IPC 的老逻辑
 * 它依赖 Windows 原生窗口 API，macOS / Linux 上只做「起进程 + 收进程」，不做嵌入。
 */
import { app, BrowserWindow, screen } from 'electron'
import { spawn, type ChildProcess } from 'child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import type { SignalStatus } from '../../shared/types'
import { getAccount } from './account-manager'
import { killProcessTree } from './process-kill'

export const MESSENGER_STATE_CHANNEL = 'messenger:state'

export interface MessengerState {
  accountId: string
  status: SignalStatus
  pid: number | null
  unread: number
  embedded: boolean
  error?: string
}

export interface ScreenBounds {
  x: number
  y: number
  width: number
  height: number
}

/**
 * 旧路径中「把子进程窗口奴役进宿主」的能力开关：依赖 koffi + user32，仅 Windows 有。
 *
 * 注意这只影响上面说的兼容路径 —— Messenger 本体是宿主内的 <webview> 网页容器，
 * 与平台无关，macOS 上照常登录、收发、翻译注入。
 */
const SUPPORTS_EMBED = process.platform === 'win32'

const SW_SHOW = 5
const SW_HIDE = 0
const GWL_STYLE = -16
const GWLP_HWNDPARENT = -8
const WS_CAPTION = 0x00c00000
const WS_THICKFRAME = 0x00040000
const WS_MINIMIZEBOX = 0x00020000
const WS_MAXIMIZEBOX = 0x00010000
const WS_SYSMENU = 0x00080000
const HWND_TOP = 0
const SWP_NOSIZE = 0x0001
const SWP_NOMOVE = 0x0002
const SWP_SHOWWINDOW = 0x0040

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
  SetWindowPos(hwnd: number, insertAfter: number, x: number, y: number, w: number, h: number, flags: number): boolean
  ClientToScreen(hwnd: number, pt: { x: number; y: number }): boolean
  SetForegroundWindow(hwnd: number): boolean
  BringWindowToTop(hwnd: number): boolean
  AttachThreadInput(idAttach: number, idAttachTo: number, fAttach: boolean): boolean
  GetCurrentThreadId(): number
}

let user32: User32Api | null = null

function get32(): User32Api | null {
  if (user32) return user32
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const koffi = require('koffi')
    const lib = koffi.load('user32.dll')
    const kernel32 = koffi.load('kernel32.dll')
    const EnumWindowsProc = koffi.proto('bool __stdcall EnumWindowsProc(uintptr_t hwnd, uintptr_t lParam)')
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
      SetWindowPos: lib.func('SetWindowPos', 'bool', ['uintptr_t', 'uintptr_t', 'int', 'int', 'int', 'int', 'uint']),
      ClientToScreen: lib.func('ClientToScreen', 'bool', ['uintptr_t', koffi.inout(koffi.pointer(POINT))]),
      SetForegroundWindow: lib.func('SetForegroundWindow', 'bool', ['uintptr_t']),
      BringWindowToTop: lib.func('BringWindowToTop', 'bool', ['uintptr_t']),
      AttachThreadInput: lib.func('AttachThreadInput', 'bool', ['uint', 'uint', 'bool']),
      GetCurrentThreadId: kernel32.func('GetCurrentThreadId', 'uint', []),
    }
  } catch (e) {
    console.error('[messenger] user32 加载失败:', e)
    return null
  }
  return user32
}

interface Session {
  accountId: string
  child: ChildProcess | null
  pid: number | null
  hwnd: number
  state: MessengerState
  lastBounds: ScreenBounds | null
}

const sessions = new Map<string, Session>()

let hostWindow: BrowserWindow | null = null
let boundHost: BrowserWindow | null = null

export function bindMessengerWindowHost(win: BrowserWindow | null): void {
  hostWindow = win
  if (boundHost === win) return
  boundHost = win
  if (!win) return

  const hideEmbedded = (): void => {
    const api = get32()
    if (!api) return
    for (const [, s] of sessions) if (s.hwnd) api.ShowWindow(s.hwnd, SW_HIDE)
  }
  const showEmbedded = (): void => {
    if (win.isDestroyed() || win.isMinimized() || !win.isVisible()) return
    const api = get32()
    if (!api) return
    for (const [, s] of sessions) {
      if (!s.hwnd || !s.state.embedded) continue
      api.ShowWindow(s.hwnd, SW_SHOW)
      if (s.lastBounds) relocateWindow(s.accountId)
    }
  }

  // Messenger 与 Signal 同为独立顶层原生窗口，必须手动跟随宿主可见性，
  // 否则最小化/关闭主窗口后其界面会一直留在桌面。
  win.on('minimize', hideEmbedded)
  win.on('hide', hideEmbedded)
  win.on('close', hideEmbedded)
  win.on('closed', hideEmbedded)
  win.on('restore', showEmbedded)
  win.on('show', showEmbedded)
}

function hostHwnd(): number {
  if (!hostWindow || hostWindow.isDestroyed()) return 0
  try {
    const buf = hostWindow.getNativeWindowHandle()
    return Number(buf.readBigUInt64LE(0))
  } catch {
    return 0
  }
}

/** messenger-mode 入口：dev=out/main/messenger-mode.js；打包后放 resources/messenger-runtime */
function messengerModeEntry(): string {
  const dev = join(app.getAppPath(), 'out', 'main', 'messenger-mode.js')
  if (existsSync(dev)) return dev
  return join(process.resourcesPath || '', 'messenger-runtime', 'messenger-mode.js')
}

/** messenger-mode 子进程的英文 userData（子进程内 setName('messenger-desktop') 亦英文） */
function profileDir(accountId: string): string {
  return join(app.getPath('userData'), 'AccountData', 'messenger-' + accountId)
}

function getSession(accountId: string): Session {
  let s = sessions.get(accountId)
  if (!s) {
    s = { accountId, child: null, pid: null, hwnd: 0, state: { accountId, status: 'idle', pid: null, unread: 0, embedded: false }, lastBounds: null }
    sessions.set(accountId, s)
  }
  return s
}

function patchState(accountId: string, patch: Partial<MessengerState>): MessengerState {
  const s = getSession(accountId)
  s.state = { ...s.state, ...patch }
  broadcast(accountId)
  return s.state
}

function broadcast(accountId: string): void {
  if (!hostWindow || hostWindow.isDestroyed()) return
  hostWindow.webContents.send(MESSENGER_STATE_CHANNEL, getSession(accountId).state)
}

function asciiToString(buf: Buffer, len: number): string {
  try {
    return buf.toString('latin1', 0, Math.max(0, Math.min(len, buf.length)))
  } catch {
    return ''
  }
}

function findMessengerWindowByPid(pid: number): number {
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
    for (const hwnd of list) {
      api.GetWindowThreadProcessId(hwnd, pidBuf)
      if (pidBuf[0] !== pid) continue
      const cls = asciiToString(clsBuf, api.GetClassNameA(hwnd, clsBuf, 256))
      if (!cls.includes('Chrome_WidgetWin')) continue
      const title = asciiToString(titleBuf, api.GetWindowTextA(hwnd, titleBuf, 256))
      if (title && !/messenger/i.test(title)) continue
      return hwnd
    }
  } catch {
    /* ignore */
  }
  return 0
}

function waitForMessengerWindow(pid: number, timeoutMs: number): Promise<number> {
  const deadline = Date.now() + timeoutMs
  return new Promise((resolve) => {
    const tick = (): void => {
      const h = findMessengerWindowByPid(pid)
      if (h || Date.now() >= deadline) {
        resolve(h)
        return
      }
      setTimeout(tick, 500)
    }
    tick()
  })
}

function toClientPixels(bounds: ScreenBounds): { x: number; y: number; w: number; h: number } {
  if (!hostWindow || hostWindow.isDestroyed()) return { x: 0, y: 0, w: bounds.width, h: bounds.height }
  const d = screen.getDisplayMatching(hostWindow.getBounds())
  const scale = d.scaleFactor || 1
  return {
    x: Math.round(bounds.x * scale),
    y: Math.round(bounds.y * scale),
    w: Math.round(bounds.width * scale),
    h: Math.round(bounds.height * scale),
  }
}

function slaveWindow(hwnd: number, host: number): void {
  const api = get32()
  if (!api) return
  api.SetWindowLongPtrW(hwnd, GWLP_HWNDPARENT, host)
  const style = api.GetWindowLongW(hwnd, GWL_STYLE)
  api.SetWindowLongW(hwnd, GWL_STYLE, style & ~(WS_CAPTION | WS_THICKFRAME | WS_MINIMIZEBOX | WS_MAXIMIZEBOX | WS_SYSMENU))
  api.ShowWindow(hwnd, SW_SHOW)
  api.SetWindowPos(hwnd, HWND_TOP, 0, 0, 0, 0, SWP_NOSIZE | SWP_NOMOVE | SWP_SHOWWINDOW)
}

function relocateWindow(accountId: string): void {
  const s = getSession(accountId)
  const api = get32()
  const host = hostHwnd()
  if (!api || !host || !s.hwnd || !s.lastBounds) return
  const { x, y, w, h } = toClientPixels(s.lastBounds)
  try {
    const pt = { x, y }
    api.ClientToScreen(host, pt)
    api.MoveWindow(s.hwnd, pt.x, pt.y, w, h, true)
  } catch {
    /* ignore */
  }
}

export async function launch(accountId: string): Promise<MessengerState> {
  const acc = getAccount(accountId)
  if (!acc || acc.platform !== 'messenger') {
    return patchState(accountId, { status: 'error', embedded: false, error: '账号不存在或非 Messenger' })
  }
  const s = getSession(accountId)
  const api = get32()
  if (SUPPORTS_EMBED && !api) {
    // Windows 上 user32 是唯一呈现途径，拿不到就是真故障
    return patchState(accountId, { status: 'error', error: 'user32 不可用（仅支持 Windows）' })
  }
  if (s.child && s.pid) {
    if (s.hwnd) {
      slaveWindow(s.hwnd, hostHwnd())
      relocateWindow(accountId)
      return patchState(accountId, { status: 'embedded', embedded: true, error: undefined })
    }
    // 无嵌入能力时子进程本身就在自己的窗口里跑着，直接复用，不要重启
    if (!SUPPORTS_EMBED) {
      return patchState(accountId, { status: 'running', embedded: false, error: undefined })
    }
    s.child = null
    s.pid = null
  }
  // 先结束旧子进程，确保跑最新 messenger-mode
  if (s.child) {
    try {
      s.child.kill()
    } catch {
      /* ignore */
    }
    s.child = null
    s.pid = null
  }
  patchState(accountId, { status: 'starting', pid: null })
  const args: string[] = []
  if (!app.isPackaged) args.push(app.getAppPath())
  args.push('--messenger-mode')
  args.push(`--user-data-dir=${profileDir(accountId)}`)
  try {
    const child = spawn(process.execPath, args, { detached: true, stdio: ['ignore', 'pipe', 'pipe'] })
    child.unref()
    s.child = child
    s.pid = child.pid ?? null
    s.state.pid = child.pid ?? null
    child.on('exit', () => {
      if (s.pid === (child.pid ?? null)) {
        s.child = null
        s.pid = null
        s.hwnd = 0
        patchState(accountId, { status: 'idle', embedded: false })
      }
    })
    // macOS / Linux：子进程以自己独立的 BrowserWindow 直接显示 messenger.com，
    // 没有 HWND 可枚举，也不具备把它嵌进主窗口的原生能力——功能完整，只是独立窗口。
    if (!SUPPORTS_EMBED) {
      return patchState(accountId, { status: 'running', embedded: false, error: undefined })
    }
    const hwnd = await waitForMessengerWindow(child.pid ?? 0, 20000)
    if (!hwnd) return patchState(accountId, { status: 'error', error: 'messenger 窗口超时' })
    s.hwnd = hwnd
    slaveWindow(hwnd, hostHwnd())
    relocateWindow(accountId)
    return patchState(accountId, { status: 'embedded', embedded: true, error: undefined })
  } catch (e) {
    return patchState(accountId, { status: 'error', error: '启动失败: ' + String((e as Error)?.message || e) })
  }
}

export function embed(accountId: string): MessengerState {
  const s = getSession(accountId)
  if (!s.child || !s.pid) {
    void launch(accountId)
    return s.state
  }
  // 无原生嵌入能力：保证子进程在跑即可（它的窗口由子进程自己管理）
  if (!SUPPORTS_EMBED) return patchState(accountId, { status: 'running', embedded: false, error: undefined })
  if (!s.hwnd) s.hwnd = findMessengerWindowByPid(s.pid)
  if (s.hwnd) {
    slaveWindow(s.hwnd, hostHwnd())
    relocateWindow(accountId)
  }
  return patchState(accountId, { status: 'embedded', embedded: true, error: undefined })
}

export function relocate(accountId: string, bounds: ScreenBounds): MessengerState {
  const s = getSession(accountId)
  s.lastBounds = bounds
  if (s.hwnd && hostWindow && !hostWindow.isDestroyed()) relocateWindow(accountId)
  return s.state
}

export function detach(accountId: string): MessengerState {
  const s = getSession(accountId)
  const api = get32()
  if (s.hwnd && api) {
    try {
      const style = api.GetWindowLongW(s.hwnd, GWL_STYLE)
      api.SetWindowLongW(s.hwnd, GWL_STYLE, style | WS_CAPTION | WS_THICKFRAME)
      api.SetWindowLongPtrW(s.hwnd, GWLP_HWNDPARENT, 0)
      api.ShowWindow(s.hwnd, SW_SHOW)
    } catch {
      /* ignore */
    }
  }
  return patchState(accountId, { status: 'running', embedded: false })
}

export function health(accountId: string): MessengerState {
  return getSession(accountId).state
}

export function setUnread(accountId: string, n: number): MessengerState {
  return patchState(accountId, { unread: n })
}

export function reset(accountId: string): MessengerState {
  close(accountId)
  return getSession(accountId).state
}

export function close(accountId: string): void {
  const s = sessions.get(accountId)
  if (s?.child) {
    try {
      s.child.kill()
    } catch {
      /* ignore */
    }
    // child.kill 只杀主 PID；macOS 的子进程组（GPU/Renderer helper）会残留占着
    // profile 锁，导致下次启动 Messenger 直接失败
    killProcessTree(s.child.pid ?? s.pid ?? 0, false)
  }
  sessions.delete(accountId)
}

export function cleanupAllMessengerWindows(): void {
  for (const accountId of [...sessions.keys()]) close(accountId)
}

/**
 * 退出兜底：**同步**强杀所有 Messenger 子进程树。
 *
 * Messenger 走 `spawn(process.execPath, { detached: true }) + unref()`，
 * 父进程退出后仍会存活，必须显式 taskkill /F /T（Electron 自身的 GPU/Renderer
 * 子进程只有杀整棵树才能清干净）。
 */
export function killAllMessengerNow(): void {
  for (const [, s] of sessions) {
    const pid = s.child?.pid ?? s.pid ?? 0
    if (s.child) {
      try {
        s.child.kill()
      } catch {
        /* ignore */
      }
    }
    if (pid) killProcessTree(pid, true)
    s.child = null
    s.hwnd = 0
  }
}

export function relocateAllMessengerEmbedded(): void {
  for (const [, s] of sessions) {
    if (s.hwnd && s.lastBounds) relocateWindow(s.accountId)
  }
}

/** 兼容旧调用：open = launch */
export function open(accountId: string): void {
  void launch(accountId)
}

/** 隐藏 messenger 子进程窗口（切到其它账号时避免其嵌入窗口遮挡） */
export function hide(accountId: string): void {
  const s = sessions.get(accountId)
  const api = get32()
  if (s?.hwnd && api) {
    try {
      api.ShowWindow(s.hwnd, SW_HIDE)
    } catch {
      /* ignore */
    }
  }
}
