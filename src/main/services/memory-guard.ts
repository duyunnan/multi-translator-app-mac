/**
 * 主进程内存哨兵。
 *
 * 与「只看 process.memoryUsage().heapUsed」的旧做法相比，这里改看
 * **所有 Electron 进程的实际驻留内存（workingSetSize 之和）**：
 * 多开场景下内存大头在 webview 的渲染进程（每个几百 MB），
 * 主进程 heap 常年只有几十 MB，固定阈值永远不会触发，等于没有监控。
 *
 * 判定阈值取「整机物理内存的 45%」（并有 900MB 下限），
 * 超过后向渲染层推送压力事件，由渲染层按 LRU 休眠不活跃账号来真正释放内存。
 */
import { app, webContents, BrowserWindow } from 'electron'
import { totalmem } from 'os'
import { IPC, type MemoryPressureInfo } from '../../shared/types'
import { logDebug } from './debug-log'

/** 采样间隔：20s。比 30s 更早发现爬升，又不会频繁遍历进程表 */
const CHECK_INTERVAL_MS = 20000
/** 高压力：整机物理内存的 45% */
const PRESSURE_RATIO = 0.45
/** 阈值下限（MB）：小内存机器上比例算出来太小，留足余量 */
const PRESSURE_MIN_MB = 900
/** 严重压力：整机物理内存的 65% */
const CRITICAL_RATIO = 0.65
/** 同一级别重复推送的最小间隔（ms），避免刷屏 */
const PUSH_COOLDOWN_MS = 60000

export interface ProcessMemoryRow {
  pid: number
  type: string
  cpu: number
  memory: number
}

export interface ProcessMemorySnapshot {
  /** 全部进程驻留内存之和（MB） */
  totalMB: number
  /** 整机物理内存（MB） */
  totalMemMB: number
  /** 全部进程 CPU 之和（%） */
  cpu: number
  /** 进程数 */
  count: number
  processes: ProcessMemoryRow[]
  /** 触发释放的阈值（MB） */
  thresholdMB: number
}

let timer: NodeJS.Timeout | null = null
let lastLevel: MemoryPressureInfo['level'] = 'normal'
let lastPushAt = 0

/** 触发释放的阈值（MB）：物理内存比例与下限取大者 */
export function memoryThresholdMB(): number {
  const totalMemMB = Math.round(totalmem() / 1024 / 1024)
  return Math.max(PRESSURE_MIN_MB, Math.round(totalMemMB * PRESSURE_RATIO))
}

/**
 * 建立 pid → 账号标签 的映射，便于在性能面板里区分「哪个账号的 webview 在吃内存」。
 * 账号 id 从 webview URL 上的 __mt_account 参数取（渲染层创建时附加）。
 */
function buildGuestLabels(): Map<number, string> {
  const labels = new Map<number, string>()
  try {
    for (const wc of webContents.getAllWebContents()) {
      if (wc.isDestroyed()) continue
      try {
        if (wc.getType() !== 'webview') continue
        const pid = wc.getOSProcessId()
        if (!pid) continue
        const acc = new URL(wc.getURL()).searchParams.get('__mt_account')
        labels.set(pid, acc ? `webview:${acc.slice(0, 8)}` : 'webview')
      } catch {
        /* 单个 guest 取不到就跳过，不影响整体统计 */
      }
    }
  } catch {
    /* 进程正在退出时 getAllWebContents 可能抛异常 */
  }
  return labels
}

/** 汇总所有 Electron 进程的驻留内存 / CPU */
export function snapshotProcessMemory(): ProcessMemorySnapshot {
  const totalMemMB = Math.round(totalmem() / 1024 / 1024)
  const labels = buildGuestLabels()
  let totalMB = 0
  let cpu = 0
  const processes: ProcessMemoryRow[] = []
  try {
    for (const m of app.getAppMetrics()) {
      // workingSetSize 单位为 KB
      const memory = Math.round((m.memory?.workingSetSize || 0) / 1024)
      const percent = Math.round((m.cpu?.percentCPUUsage || 0) * 10) / 10
      totalMB += memory
      cpu += percent
      // 渲染进程（type=Tab）用 pid 匹配到具体账号，其余用 Electron 给的进程类型名
      const label = labels.get(m.pid) || m.name || m.serviceName || m.type
      processes.push({ pid: m.pid, type: label, cpu: percent, memory })
    }
  } catch {
    /* 非 Electron 环境 / 进程表暂不可用：回退到主进程数据 */
  }
  if (processes.length === 0) {
    const mem = process.memoryUsage()
    processes.push({
      pid: process.pid,
      type: 'main',
      cpu: 0,
      memory: Math.round(mem.rss / 1024 / 1024),
    })
    totalMB = processes[0].memory
  }
  processes.sort((a, b) => b.memory - a.memory)
  return {
    totalMB,
    totalMemMB,
    cpu: Math.round(cpu),
    count: processes.length,
    processes: processes.slice(0, 12),
    thresholdMB: memoryThresholdMB(),
  }
}

/** 广播内存压力给所有窗口（webview guest 无法直接定位宿主，故统一广播） */
function broadcast(info: MemoryPressureInfo): void {
  BrowserWindow.getAllWindows().forEach((w) => {
    // 删除账号/关窗瞬间窗口可能已销毁，向已销毁的 webContents send 会抛异常
    if (w.isDestroyed() || w.webContents.isDestroyed()) return
    w.webContents.send(IPC.MemoryPressurePush, info)
  })
}

function check(): void {
  const snap = snapshotProcessMemory()
  const totalMemMB = snap.totalMemMB || 1
  const ratio = snap.totalMB / totalMemMB
  const level: MemoryPressureInfo['level'] =
    ratio >= CRITICAL_RATIO ? 'critical' : snap.totalMB >= snap.thresholdMB ? 'high' : 'normal'
  const now = Date.now()
  // 恢复正常：重置档位，下次升档可立即推送
  if (level === 'normal') {
    lastLevel = 'normal'
    return
  }
  // 档位未升级且还在冷却期内则不重复打扰
  const escalated = level === 'critical' && lastLevel !== 'critical'
  if (!escalated && now - lastPushAt < PUSH_COOLDOWN_MS) return
  lastLevel = level
  lastPushAt = now
  const info: MemoryPressureInfo = {
    level,
    totalMB: snap.totalMB,
    totalMemMB: snap.totalMemMB,
    thresholdMB: snap.thresholdMB,
    processCount: snap.count,
    top: snap.processes.slice(0, 4).map((p) => `${p.type}=${p.memory}MB`).join(', '),
  }
  logDebug(
    `[memory] pressure=${level} total=${snap.totalMB}MB threshold=${snap.thresholdMB}MB procs=${snap.count} top=${info.top}`,
  )
  broadcast(info)
}

export function startMemoryGuard(): void {
  if (timer) return
  timer = setInterval(check, CHECK_INTERVAL_MS)
  // 定时器不应阻止进程退出
  timer.unref?.()
}

export function stopMemoryGuard(): void {
  if (!timer) return
  clearInterval(timer)
  timer = null
}
