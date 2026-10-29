/**
 * 授权登录服务（主进程）：
 *  - 提供授权服务器的地址配置（登录框"设置"按钮可改）
 *  - 登录 / 退出 / 心跳保活
 *  - 生成稳定的本机机器码（授权校验用）
 *  - 心跳检测到登录失效时，广播给所有窗口并清理本地登录态
 */
import { app, BrowserWindow } from 'electron'
import { createHash } from 'crypto'
import * as os from 'os'
import { IPC, type AuthConfig, type AuthExpiredInfo, type AuthLoginResult, type AuthStatus } from '../../shared/types'
import { store } from './store'
import { netRequest } from './net-request'

// 授权服务器默认地址。host 由用户在登录页"设置"里填写；留空/未配置时回退到该默认服务器。
const DEFAULT_HOST = 'http://103.214.142.112'
const DEFAULT_PORT = 1234

let heartbeatTimer: NodeJS.Timeout | null = null

/* ---------------- 机器信息 ---------------- */

export function getMachineCode(): string {
  const ifaces = Object.values(os.networkInterfaces())
    .flatMap((list) => list ?? [])
    .filter((i) => i && !i.internal && i.mac && i.mac !== '00:00:00:00:00:00')
  const mac = ifaces[0]?.mac ?? 'no-mac'
  const seed = `${mac}|${os.hostname()}`
  const hex = createHash('sha256').update(seed).digest('hex').slice(0, 12).toUpperCase()
  return hex.replace(/(.{4})(?=.)/g, '$1-')
}

export function getOsInfo(): string {
  return `${os.type()} ${os.release()}`
}

/* ---------------- 服务器地址配置 ---------------- */

function normalizeHost(h: string): string {
  let host = (h || '').trim()
  if (!host) return DEFAULT_HOST
  if (!/^https?:\/\//i.test(host)) host = 'http://' + host
  return host.replace(/\/+$/, '')
}

function clampPort(p: number): number {
  const n = Number(p)
  return Number.isInteger(n) && n > 0 && n <= 65535 ? n : DEFAULT_PORT
}

export function getAuthConfig(): AuthConfig {
  const s = store.getSettings()
  return {
    host: s.authServerHost || DEFAULT_HOST,
    port: s.authServerPort || DEFAULT_PORT,
  }
}

/**
 * 返回用户实际填写/存储的原始服务器配置（host 可能为空、port 可能为 0=未设置）。
 * 供登录页"服务器设置"弹窗展示：未填写则为空（留空即使用系统默认 api/端口）。
 */
export function getRawAuthConfig(): AuthConfig {
  const s = store.getSettings()
  return {
    host: s.authServerHost || '',
    // port 存 0 表示"未设置"，弹窗据此显示空（连接时由 getAuthConfig 回退默认 1234）
    port: s.authServerPort || 0,
  }
}

export function setAuthConfig(cfg: AuthConfig): AuthConfig {
  const host = (cfg.host || '').trim()
  const p = Number(cfg.port)
  // host 留空则存空（→ 连接时回退系统默认 api）；非空才归一化(补 http://)存储。
  // port 为空/<=0 则存 0（未设置，弹窗显示空、连接回退默认 1234）；合法则按原值存储。
  store.setSettings({
    authServerHost: host ? normalizeHost(host) : '',
    authServerPort: p > 0 && p <= 65535 ? p : 0,
  })
  return getAuthConfig()
}

/** 授权服务器地址（用户可在登录页"设置"里改），崩溃上报与登录/心跳同源 */
export function getServerBase(): string {
  const c = getAuthConfig()
  return `${normalizeHost(c.host)}:${c.port}`
}

/* ---------------- HTTP 请求 ---------------- */

interface AuthApiResp {
  code: number
  msg?: string
  data?: {
    token?: string
    heartbeat_interval?: number
    server_time?: number
    user?: {
      username?: string
      expire_at?: string | null
      days_left?: number
      expired?: boolean
    }
  }
}

async function apiPost(path: string, body: unknown, timeoutMs = 8000): Promise<AuthApiResp> {
  let resp
  try {
    resp = await netRequest({
      url: getServerBase() + path,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      timeoutMs,
    })
  } catch (e) {
    console.error('[auth] request failed', path, e)
    return { code: -1, msg: '无法连接授权服务器' }
  }
  if (resp.status >= 400) {
    return { code: resp.status, msg: `授权服务器错误（HTTP ${resp.status}）` }
  }
  try {
    const parsed = JSON.parse(resp.body)
    return typeof parsed === 'object' && parsed != null ? (parsed as AuthApiResp) : { code: -2, msg: '响应格式错误' }
  } catch {
    return { code: -2, msg: '授权服务器响应格式错误' }
  }
}

/* ---------------- 到期时间 ---------------- */

function parseExpireAt(s: string | null | undefined): number | null {
  if (!s) return null
  const t = new Date(s.replace(' ', 'T')).getTime()
  return Number.isFinite(t) ? t : null
}

/* ---------------- 登录 / 退出 ---------------- */

export async function login(username: string, password: string): Promise<AuthLoginResult> {
  const name = (username || '').trim()
  const pwd = password || ''
  if (!name) return { ok: false, code: 1001, error: '请输入用户名' }
  if (!pwd) return { ok: false, code: 1001, error: '请输入密码' }

  const resp = await apiPost('/api/login.php', {
    username: name,
    password: pwd,
    machine_code: getMachineCode(),
    hostname: os.hostname(),
    os_info: getOsInfo(),
    app_version: app.getVersion(),
  })

  if (resp.code === -1 || resp.code === -2) {
    return { ok: false, code: resp.code, error: resp.msg || '无法连接授权服务器，请检查服务器设置' }
  }
  if (resp.code !== 0) {
    // 服务端业务错误码（1001~1006 / 2001 / 2002 / 5000 等）原样透传，渲染层按码映射文案
    return { ok: false, code: resp.code, error: resp.msg || '' }
  }
  const d = resp.data ?? {}
  const u = d.user ?? {}
  if (u.expired === true) {
    return { ok: false, code: 1005, error: '账号已过期，请联系管理员续期' }
  }
  if (!d.token) {
    return { ok: false, code: -2, error: '登录响应缺少 token' }
  }

  const expireAt = parseExpireAt(u.expire_at)
  store.setAuth({
    token: d.token,
    username: u.username || name,
    expireAt,
    daysLeft: typeof u.days_left === 'number' ? u.days_left : 0,
    loggedInAt: Date.now(),
  })
  startHeartbeat(typeof d.heartbeat_interval === 'number' ? d.heartbeat_interval : 60)

  return { ok: true, username: u.username || name, expireAt, daysLeft: u.days_left }
}

export async function logout(): Promise<void> {
  const auth = store.getAuth()
  stopHeartbeat()
  if (auth?.token) {
    try {
      // 短超时：退出时通知服务器，失败也不阻塞应用退出
      await apiPost('/api/logout.php', { token: auth.token }, 3000)
    } catch {
      // 忽略退出上报失败
    }
  }
  store.clearAuth()
}

/* ---------------- 登录状态 ---------------- */

export function getStatus(): AuthStatus {
  const auth = store.getAuth()
  if (!auth) return { loggedIn: false }
  if (auth.expireAt != null && Date.now() > auth.expireAt) {
    store.clearAuth()
    stopHeartbeat()
    return { loggedIn: false }
  }
  return {
    loggedIn: true,
    username: auth.username,
    expireAt: auth.expireAt,
    daysLeft: auth.daysLeft,
    expired: false,
  }
}

/* ---------------- 心跳 ---------------- */

export function startHeartbeat(intervalSec: number): void {
  stopHeartbeat()
  const interval = Math.max(15, Math.floor(intervalSec) || 60) * 1000
  heartbeatTimer = setInterval(() => {
    void doHeartbeat()
  }, interval)
}

export function stopHeartbeat(): void {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer)
    heartbeatTimer = null
  }
}

async function doHeartbeat(): Promise<void> {
  const auth = store.getAuth()
  if (!auth) return
  const resp = await apiPost('/api/heartbeat.php', { token: auth.token, machine_code: getMachineCode() })
  if (!resp || resp.code === -1 || resp.code === -2) return // 网络问题：暂不处理，下次再试
  if (resp.code === 0) {
    const u = resp.data?.user
    if (u) {
      const expireAt = parseExpireAt(u.expire_at)
      const changed = {
        ...auth,
        expireAt: expireAt ?? auth.expireAt,
        daysLeft: typeof u.days_left === 'number' ? u.days_left : auth.daysLeft,
      }
      store.setAuth(changed)
      if (u.expired === true || (expireAt != null && Date.now() > expireAt)) {
        forceLogout(1005) // 账号已到期
      }
    }
    return
  }
  // 服务器明确返回失败（2001 被踢 / 2002 设备不匹配 / 1004 停用等）→ 按错误码强制登出
  forceLogout(resp.code)
}

function forceLogout(code?: number): void {
  const hadAuth = !!store.getAuth()
  store.clearAuth()
  stopHeartbeat()
  if (hadAuth) {
    const payload: AuthExpiredInfo = code != null ? { code } : {}
    for (const w of BrowserWindow.getAllWindows()) {
      // 退出/重建窗口过程中窗口可能已销毁，向已销毁的 webContents send 会抛异常导致闪退
      if (w.isDestroyed() || w.webContents.isDestroyed()) continue
      w.webContents.send(IPC.AuthExpiredPush, payload)
    }
  }
}

/* ---------------- 启动恢复 ---------------- */

/** 应用启动时调用：本地已有登录态则恢复心跳，并在短期内校验一次 */
export function initAuth(): void {
  const auth = store.getAuth()
  if (!auth) return
  if (auth.expireAt != null && Date.now() > auth.expireAt) {
    store.clearAuth()
    return
  }
  startHeartbeat(60)
  setTimeout(() => {
    void doHeartbeat()
  }, 15000)
}
