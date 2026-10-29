/**
 * 主进程统一调试日志。
 *
 * 背景：此前各调用点直接 `appendFileSync(userData/debug.log)`，而 webview 注入脚本的
 * `dbg` 通道在消息变化时会成串触发（实测 0.5s 内十余条，日志已累积到 2.6MB 且只增不减）。
 * 同步写盘会阻塞主进程事件循环，多开账号时表现为界面卡顿/无响应。
 *
 * 现改为：内存缓冲 + 250ms 异步批量写（缓冲超 32KB 立即刷），文件超 8MB 自动轮转为 .1。
 * 退出前调用 flushDebugLogSync() 同步落盘，避免缓冲丢失。
 */
import { app } from 'electron'
import { appendFile, appendFileSync, renameSync, statSync } from 'fs'
import { join } from 'path'

const FLUSH_MS = 250
const MAX_BUFFER_BYTES = 32 * 1024
const ROTATE_BYTES = 8 * 1024 * 1024

let buffer: string[] = []
let bufferBytes = 0
let timer: ReturnType<typeof setTimeout> | null = null

function logFile(): string {
  return join(app.getPath('userData'), 'debug.log')
}

/** 输出到终端，并缓冲待异步落盘 */
export function logDebug(line: string): void {
  console.log(line)
  const entry = `${new Date().toISOString()} ${line}\n`
  buffer.push(entry)
  bufferBytes += entry.length
  if (bufferBytes >= MAX_BUFFER_BYTES) {
    flushDebugLog()
    return
  }
  if (timer) return
  timer = setTimeout(() => {
    timer = null
    flushDebugLog()
  }, FLUSH_MS)
}

/** 取出缓冲区内容（并清掉待刷定时器） */
function takeChunk(): string {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  if (!buffer.length) return ''
  const chunk = buffer.join('')
  buffer = []
  bufferBytes = 0
  return chunk
}

function flushDebugLog(): void {
  const chunk = takeChunk()
  if (!chunk) return
  const file = logFile()
  try {
    if (statSync(file).size > ROTATE_BYTES) renameSync(file, `${file}.1`)
  } catch {
    /* 文件不存在/被占用：跳过轮转，继续追加 */
  }
  // 异步追加：不阻塞主进程事件循环
  appendFile(file, chunk, () => {
    /* 写入失败不影响主流程 */
  })
}

/** 退出前同步落盘，避免缓冲区日志丢失 */
export function flushDebugLogSync(): void {
  const chunk = takeChunk()
  if (!chunk) return
  try {
    appendFileSync(logFile(), chunk)
  } catch {
    /* ignore */
  }
}

/**
 * 崩溃取证日志：**同步**追加到 userData/crash.log。
 *
 * 与 logDebug 的区别：logDebug 是"内存缓冲 + 250ms 异步批量写"（避免频繁同步 IO 卡界面），
 * 进程被原生崩溃带走时缓冲区里最后 250ms~32KB 的内容会连同进程一起消失 ——
 * "删除账号后软件闪退"此前就是这么查不到任何痕迹的。
 * 这里用 appendFileSync 立即落盘，仅用于低频的崩溃/关键路径取证，不影响性能。
 */
export function logCrashSync(line: string): void {
  const entry = `${new Date().toISOString()} ${line}\n`
  try {
    appendFileSync(join(app.getPath('userData'), 'crash.log'), entry)
  } catch {
    /* ignore */
  }
  try {
    console.log(`[crash-log] ${line}`)
  } catch {
    /* ignore */
  }
}
