/**
 * 本机代理自动发现。
 *
 * 背景：Signal Desktop 的"关联设备"页必须先与 chat.signal.org 建好 provisioning
 * WebSocket 才会渲染二维码，而该域名在国内会被 DNS 污染 + TCP 阻断（实测解析到
 * Facebook 的 IP 段并连接超时，见 signal-embed.log / Signal main.log 的
 * "createHTTPSAgent.connect: connection timed out"）。所以 Signal 子进程必须走代理。
 *
 * 但让用户自己去翻 Clash / v2rayN 的监听端口再手填体验很差，因此这里提供
 * "没配代理时自动找一遍"的能力：
 *   1) Windows 系统代理（注册表 Internet Settings 的 ProxyEnable / ProxyServer）
 *   2) 常见代理客户端的本地监听端口（Clash / Mihomo / v2rayN / sing-box / SSR / Tor）
 * 候选必须真的能通过 SOCKS5 CONNECT 到探测目标才算可用，避免把恰好监听在常见端口
 * 上的其它本地服务误当成代理。探测目标默认 chat.signal.org，调用方可以指定
 * （OpenAI 链路传 api.openai.com，顺便把出口地区受限的节点也排除掉）。
 */
import { spawnSync } from 'child_process'
import { connect } from 'net'
import { Socks5 } from './socks5-impl'
import { socks5HttpsRequest } from './socks5'
import type { Socks5Config } from './socks5'

export interface DetectedProxy extends Socks5Config {
  /** 来源说明，仅用于日志 */
  source: string
  /** true 表示只能完成 SOCKS5 握手，但当前到不了探测目标 */
  weak?: boolean
}

interface Candidate {
  host: string
  port: number
  source: string
}

/** 探测目标：二维码与联系人同步真正依赖的域名 */
const PROBE_TARGET = { host: 'chat.signal.org', port: 443 }
/** SOCKS5 握手 + CONNECT 超时：本机代理应很快应答，迟迟不答的多半不是 SOCKS5 端口 */
const CONNECT_TIMEOUT_MS = 1500
/** 单个候选的端到端 HTTPS 验证超时 */
const VERIFY_TIMEOUT_MS = 3000
/** 本机端口预筛超时（未监听会立刻 ECONNREFUSED，这里只兜底防火墙丢包） */
const PORT_PROBE_TIMEOUT_MS = 200
/** 探测总超时，避免个别候选拖慢 Signal 启动 */
const OVERALL_TIMEOUT_MS = 9000
/** 命中结果缓存时长 */
const HIT_CACHE_TTL_MS = 10 * 60 * 1000

/** 常见代理客户端的本地 SOCKS5 监听端口（Clash 类多为 http/socks 混合端口） */
const COMMON_LOCAL_PORTS = [
  1080, 1081, 1086, 1087, // Shadowsocks / SSR / 通用
  10808, 10809, // v2rayN（socks / http）
  2080, 2081, // sing-box / hysteria
  7890, 7891, 7892, 7897, 7898, // Clash / Mihomo / Clash Verge
  2801, // Netch
  6152, 6153, // 常见订阅客户端
  9050, 9150, // Tor
  20171, 20172, 8889, 12333,
]

/** 探测结果缓存：按探测目标分开存（Signal 与 OpenAI 目标不同），命中与未命中都缓存 */
const cache = new Map<string, { at: number; value: DetectedProxy | null }>()
/** 未命中的缓存时长：避免翻译这类高频链路每次都重跑一轮探测 */
const MISS_CACHE_TTL_MS = 30 * 1000

export function clearProxyDetectCache(): void {
  cache.clear()
}

export interface DetectProxyOptions {
  /** 探测目标域名，默认 Signal（二维码与联系人同步依赖它） */
  targetHost?: string
  targetPort?: number
  /** 探测总超时，默认 9s；高频链路可传更小值避免拖慢请求 */
  overallTimeoutMs?: number
}

/**
 * 探测本机可用代理。
 * 优先返回第一个端到端能到达探测目标的候选；都到不了目标时，退回「至少 SOCKS5 可用」的
 * weak 候选（总比直连强）；一个都没有则返回 null。
 */
export async function detectLocalProxy(options: DetectProxyOptions = {}): Promise<DetectedProxy | null> {
  const target: Candidate = {
    host: options.targetHost || PROBE_TARGET.host,
    port: options.targetPort || PROBE_TARGET.port,
    source: 'probe-target',
  }
  const key = `${target.host}:${target.port}`
  const cached = cache.get(key)
  if (cached) {
    const ttl = cached.value ? HIT_CACHE_TTL_MS : MISS_CACHE_TTL_MS
    if (Date.now() - cached.at < ttl) return cached.value
  }

  const candidates = collectCandidates()
  if (!candidates.length) {
    cache.set(key, { at: Date.now(), value: null })
    return null
  }

  let overallTimer: NodeJS.Timeout | undefined
  const timeout = new Promise<null>((resolve) => {
    overallTimer = setTimeout(() => resolve(null), options.overallTimeoutMs ?? OVERALL_TIMEOUT_MS)
    overallTimer.unref?.()
  })

  const found = await Promise.race([probeAll(candidates, target), timeout])
  if (overallTimer) clearTimeout(overallTimer)
  cache.set(key, { at: Date.now(), value: found })
  return found
}

async function probeAll(candidates: Candidate[], target: Candidate): Promise<DetectedProxy | null> {
  // 1) 先做本机 TCP 预筛，把大概率不存在的端口快速排掉
  const probed = await Promise.all(
    candidates.map(async (c) => ((await isPortOpen(c.host, c.port)) ? c : null))
  )
  const alive = probed.filter((c): c is Candidate => !!c)
  if (!alive.length) return null

  // 2) 并发确认：先看它是不是能用的 SOCKS5（握手 + CONNECT，几百毫秒出结果），
  //    再看它是不是真能到达探测目标（要真过一遍 TLS）。
  return await firstReachable(alive, target)
}

/**
 * 优先返回端到端能到达 Signal 的候选；一个都没有时，退回到"至少 SOCKS5 可用"的那个——
 * 代理节点暂时没放行 Signal（分流规则走了直连、节点被限速等）时，走它也比直连强。
 *
 * 不能用 Promise.all 后取首个：像 v2rayN 的 10809 是纯 HTTP 代理端口，SOCKS5 握手
 * 不会应答，只能等满超时，会把几百毫秒就能确定的结果拖到数秒。
 */
function firstReachable(alive: Candidate[], target: Candidate): Promise<DetectedProxy | null> {
  return new Promise((resolve) => {
    let pending = alive.length
    let settled = false
    let fallback: DetectedProxy | null = null

    for (const c of alive) {
      void (async () => {
        const hit: DetectedProxy = { host: c.host, port: c.port, source: c.source }
        try {
          if (!(await verifySocks5Connect(c, target))) return
          if (!fallback) fallback = { ...hit, weak: true }
          if (await verifySocks5Reachable(c, target)) {
            if (!settled) {
              settled = true
              resolve(hit)
            }
          }
        } finally {
          pending -= 1
          if (pending === 0 && !settled) {
            settled = true
            resolve(fallback)
          }
        }
      })()
    }
  })
}

/** 汇总候选：系统代理优先（用户自己配过），其后是常见本地端口 */
function collectCandidates(): Candidate[] {
  const list: Candidate[] = []
  const seen = new Set<string>()

  const push = (host: string, port: number, source: string, allowRemote = false): void => {
    const h = normalizeHost(host)
    if (!h || !Number.isFinite(port) || port <= 0 || port > 65535) return
    if (!allowRemote && !isLoopback(h)) return
    const key = `${h}:${port}`
    if (seen.has(key)) return
    seen.add(key)
    list.push({ host: h, port, source })
  }

  // 系统代理可能指向局域网内的机器，属于用户显式配置，允许非回环地址
  for (const p of readWindowsSystemProxy()) push(p.host, p.port, p.source, true)
  for (const port of COMMON_LOCAL_PORTS) push('127.0.0.1', port, '常见代理端口')

  return list
}

/** 读取 Windows 系统代理（IE/Internet 选项），socks 类优先 */
function readWindowsSystemProxy(): { host: string; port: number; source: string }[] {
  if (process.platform !== 'win32') return []
  let out = ''
  try {
    const r = spawnSync(
      'reg',
      ['query', 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings'],
      { encoding: 'utf-8', windowsHide: true, timeout: 3000 }
    )
    out = r.stdout || ''
  } catch {
    return []
  }

  const serverLine = /^\s*ProxyServer\s+REG_SZ\s+(.+?)\s*$/im.exec(out)
  if (!serverLine) return []
  // ProxyEnable=0 时仍作为候选尝试（不少客户端关掉"系统代理"后端口依旧在监听）
  const enabled = /^\s*ProxyEnable\s+REG_DWORD\s+0x0*1\s*$/im.test(out)

  const res: { host: string; port: number; source: string; socks: boolean }[] = []
  for (const item of serverLine[1].split(';')) {
    const m = /^(?:([a-z0-9]+)=)?([^:\s]+):(\d+)$/i.exec(item.trim())
    if (!m) continue
    const scheme = (m[1] || '').toLowerCase()
    res.push({
      host: m[2],
      port: Number(m[3]),
      socks: scheme.startsWith('socks') || scheme === '',
      source: `Windows 系统代理${scheme ? `(${scheme})` : ''}${enabled ? '' : '（系统代理已关闭，仍作候选尝试）'}`,
    })
  }
  res.sort((a, b) => Number(b.socks) - Number(a.socks))
  return res.map(({ host, port, source }) => ({ host, port, source }))
}

function normalizeHost(host: string): string {
  const h = (host || '').trim().replace(/^\[|\]$/g, '')
  if (!h) return ''
  if (h.toLowerCase() === 'localhost') return '127.0.0.1'
  return h
}

function isLoopback(host: string): boolean {
  return host === '127.0.0.1' || host === '::1' || host.startsWith('127.')
}

function isPortOpen(host: string, port: number, timeoutMs = PORT_PROBE_TIMEOUT_MS): Promise<boolean> {
  return new Promise((resolve) => {
    const sock = connect({ host, port })
    let settled = false
    const done = (ok: boolean): void => {
      if (settled) return
      settled = true
      sock.destroy()
      resolve(ok)
    }
    sock.setTimeout(timeoutMs)
    sock.once('connect', () => done(true))
    sock.once('error', () => done(false))
    sock.once('timeout', () => done(false))
  })
}

/** 出口地区受限的响应特征：这种代理能握上手，但对 OpenAI 之类服务毫无用处 */
const REGION_BLOCK_PATTERN = /unsupported_country_region_territory|request_forbidden/i

/** 第一步：确认这个端口是一个能正常握手的 SOCKS5 代理 */
async function verifySocks5Connect(cfg: Socks5Config, target: Candidate): Promise<boolean> {
  const client = new Socks5(cfg)
  let timer: NodeJS.Timeout | undefined
  try {
    await Promise.race([
      client.connect({ hostname: target.host, port: target.port }),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('socks5 handshake timeout')), CONNECT_TIMEOUT_MS)
      }),
    ])
    return true
  } catch {
    return false
  } finally {
    if (timer) clearTimeout(timer)
    try {
      client.close()
    } catch {
      /* ignore */
    }
  }
}

/**
 * 第二步：通过该代理向探测目标发一次 HTTPS 请求并拿到响应。
 *
 * 只做 SOCKS5 CONNECT 是不够的：不少代理收到 CONNECT 会立刻回 success，之后才
 * 异步去连上游，失败也不会再告诉我们（分流规则把目标判成直连时正是如此，
 * TLS 会直接被墙干扰）；必须看到 HTTP 响应才算真的通。域名交给代理解析，不受
 * 本机 DNS 污染影响。
 */
async function verifySocks5Reachable(cfg: Socks5Config, target: Candidate): Promise<boolean> {
  let timer: NodeJS.Timeout | undefined
  try {
    const res = await Promise.race([
      socks5HttpsRequest(cfg, {
        hostname: target.host,
        port: target.port,
        path: '/',
        method: 'GET',
        headers: { 'Accept-Encoding': 'identity', 'User-Agent': 'Mozilla/5.0' },
        timeoutMs: VERIFY_TIMEOUT_MS,
      }),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('proxy probe timeout')), VERIFY_TIMEOUT_MS)
      }),
    ])
    if (res.status <= 0) return false
    // 拿到响应也可能"不可用"：节点出口落在服务不支持的地区会被直接拒绝
    if (res.status === 403 && REGION_BLOCK_PATTERN.test(res.body)) return false
    return true
  } catch {
    return false
  } finally {
    if (timer) clearTimeout(timer)
  }
}
