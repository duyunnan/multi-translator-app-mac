/**
 * 崩溃日志上报（后台 POST /api/crash.php）。
 *
 * 1) 实时上报：渲染/GPU 等子进程崩溃、主进程未捕获异常 —— 进程还活着，立刻发请求；
 * 2) 启动补报：被原生崩溃带走时（"删除账号后闪退"）没有任何执行机会，请求根本发不出去；
 *    因此正常退出会写 .clean-exit 标记，下次启动若标记缺失且 crash.log 有新增 [crash] 记录则补报。
 *
 * 所有失败路径只写本地 crash.log，绝不抛出（崩溃链里再抛会递归崩溃）。
 * 未登录也上报；带 token 时后台自动关联账号与设备编码。
 */
import { app } from 'electron'
import * as os from 'os'
import { existsSync, readFileSync, rmSync, statSync, writeFileSync } from 'fs'
import { join } from 'path'
import { netRequest } from './net-request'
import { getMachineCode, getOsInfo, getServerBase } from './auth'
import { store } from './store'
import { logCrashSync } from './debug-log'

export type CrashType = 'crash' | 'hang' | 'error'

export interface CrashReportInput {
  crashType: CrashType
  /** 异常类型（如 TypeError / RenderProcessGone），后台据此归类统计 */
  errorType?: string
  message: string
  stackTrace?: string
  extra?: Record<string, unknown>
}

/** 单次运行最多上报条数：崩溃风暴时既不把后台打爆，也不让主进程卡在发请求上 */
const MAX_REPORTS_PER_RUN = 8
/** 启动补报最多读取的日志字节数（只报尾部，避免 payload 过大） */
const MAX_RECOVER_BYTES = 16 * 1024
const REQUEST_TIMEOUT_MS = 6000
/** 上报地址与登录/心跳同源，跟随用户在登录页设置的服务器 */
const SERVER_PATH = '/api/crash.php'

let sentCount = 0
/** 同一错误反复触发只报一次（unhandledRejection 可能高频重复） */
const sentKeys = new Set<string>()

function ufile(name: string): string {
  return join(app.getPath('userData'), name)
}
const crashLogFile = (): string => ufile('crash.log')
/** 正常退出标记：存在 = 上次干净退出，无需补报 */
const cleanExitFile = (): string => ufile('.clean-exit')
/** 已上报到的 crash.log 字节偏移，避免同一段崩溃日志重复上报 */
const offsetFile = (): string => ufile('.crash-report-offset')

function platformName(): string {
  return process.platform === 'win32' ? 'windows' : process.platform === 'darwin' ? 'macos' : 'linux'
}

function formatClientTime(d: Date): string {
  const p = (n: number): string => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

function parseCode(body: string): number {
  try {
    const j = JSON.parse(body) as { code?: unknown }
    return typeof j?.code === 'number' ? j.code : -2
  } catch {
    return -2
  }
}

function readOffset(): number {
  try {
    const n = Number(readFileSync(offsetFile(), 'utf8').trim())
    return Number.isFinite(n) && n >= 0 ? n : 0
  } catch {
    return 0
  }
}

function writeOffset(n: number): void {
  try {
    writeFileSync(offsetFile(), String(n), 'utf8')
  } catch {
    /* ignore */
  }
}

/** 上报一条崩溃日志。调用方可 `void reportCrash(...)` fire-and-forget */
export async function reportCrash(input: CrashReportInput): Promise<boolean> {
  try {
    const message = (input.message ?? '').slice(0, 4000)
    const stackTrace = (input.stackTrace ?? '').slice(0, MAX_RECOVER_BYTES)
    // 服务端要求 message 与 stack_trace 至少一项（否则 code 1001）
    if (!message && !stackTrace) return false
    if (sentCount >= MAX_REPORTS_PER_RUN) return false

    const key = `${input.crashType}|${input.errorType ?? ''}|${message.slice(0, 200)}`
    if (sentKeys.has(key)) return false

    let token: string | undefined
    try {
      token = store.getAuth()?.token || undefined
    } catch {
      token = undefined
    }

    const payload = {
      token,
      machine_code: getMachineCode(),
      platform: platformName(),
      app_version: app.getVersion(),
      os_info: getOsInfo(),
      crash_type: input.crashType,
      error_type: input.errorType || 'Error',
      message,
      stack_trace: stackTrace,
      extra: { hostname: os.hostname(), pid: process.pid, ...(input.extra ?? {}) },
      client_time: formatClientTime(new Date()),
    }

    sentCount += 1
    sentKeys.add(key)

    const url = getServerBase() + SERVER_PATH
    const res = await netRequest({
      url,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      timeoutMs: REQUEST_TIMEOUT_MS,
    })
    const ok = res.status === 200 && parseCode(res.body) === 0
    logCrashSync(
      ok
        ? `[report] 上报成功 ${url} resp=${res.body.slice(0, 120)}`
        : `[report] 上报失败 ${url} http=${res.status} resp=${res.body.slice(0, 200)}`,
    )
    return ok
  } catch (e) {
    try {
      logCrashSync(`[report] 上报异常 ${String(e)}`)
    } catch {
      /* ignore */
    }
    return false
  }
}

/** 正常退出时调用：写"干净退出"标记，下次启动据此判断上次是否异常终止 */
export function markCleanExit(): void {
  try {
    writeFileSync(cleanExitFile(), String(Date.now()), 'utf8')
  } catch {
    /* ignore */
  }
}

/** 启动后调用（延迟几秒，避开启动高峰）：补报上次异常退出的崩溃日志 */
export async function reportPendingCrash(): Promise<void> {
  try {
    const wasClean = existsSync(cleanExitFile())
    // 立刻清标记：本次运行若崩溃，下次启动才能识别出来
    try {
      rmSync(cleanExitFile(), { force: true })
    } catch {
      /* ignore */
    }
    if (wasClean) return

    const log = crashLogFile()
    if (!existsSync(log)) return
    const size = statSync(log).size
    let offset = readOffset()
    if (offset < 0 || offset > size) offset = 0
    if (size <= offset) return

    const chunk = readFileSync(log)
      .subarray(offset, Math.min(size, offset + MAX_RECOVER_BYTES))
      .toString('utf8')
    // 没有崩溃记录（如被任务管理器强杀）：记下偏移，不必每次启动重读
    if (!chunk.includes('[crash]')) {
      writeOffset(size)
      return
    }

    const crashLine = chunk.split(/\r?\n/).find((l) => l.includes('[crash]')) ?? '上次运行异常退出'
    const ok = await reportCrash({
      crashType: 'crash',
      errorType: 'NativeCrash',
      message: `上次运行异常退出：${crashLine.trim()}`,
      stackTrace: chunk,
      extra: { kind: 'last-run', clean_exit: false, log_file: log, log_bytes: size },
    })
    if (ok) writeOffset(size)
  } catch (e) {
    try {
      logCrashSync(`[report] 补报异常 ${String(e)}`)
    } catch {
      /* ignore */
    }
  }
}
