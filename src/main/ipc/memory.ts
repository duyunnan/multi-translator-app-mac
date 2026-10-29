/**
 * 内存 / CPU 统计 IPC：供顶部栏与性能监控使用。
 *
 * 口径说明（重要）：`rss` 是**全部 Electron 进程驻留内存之和**，不是主进程本身。
 * 多开时内存大头在 webview 的渲染进程，只报主进程会让面板显示 "RSS 80MB"
 * 之类的假象，看不到真实占用，也就无法预警。逐进程明细见 `processes`。
 */
import { ipcMain } from 'electron'
import { IPC, type MemoryInfo } from '../../shared/types'
import { snapshotProcessMemory } from '../services/memory-guard'

let lastCpuUsage = process.cpuUsage()
let lastTime = process.hrtime.bigint()

export function registerMemoryIpc(): void {
  ipcMain.handle(IPC.GetMemoryInfo, async (): Promise<MemoryInfo> => {
    const now = process.hrtime.bigint()
    const elapsedMs = Number(now - lastTime) / 1e6
    const cpuNow = process.cpuUsage()
    const cpuDelta = cpuNow.user - lastCpuUsage.user + (cpuNow.system - lastCpuUsage.system) // 微秒
    lastCpuUsage = cpuNow
    lastTime = now
    const cpu =
      elapsedMs > 0
        ? Math.min(100, Math.max(0, Math.round((cpuDelta / 1000 / elapsedMs) * 100)))
        : 0

    const mem = process.memoryUsage()
    // 逐进程聚合（含每个账号的 webview 渲染进程），已带内存压力阈值
    const snap = snapshotProcessMemory()

    return {
      rss: snap.totalMB,
      cpu,
      heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
      heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
      external: Math.round(mem.external / 1024 / 1024),
      totalMem: snap.totalMemMB,
      processCount: snap.count,
      processes: snap.processes,
      thresholdMB: snap.thresholdMB,
    }
  })
}
