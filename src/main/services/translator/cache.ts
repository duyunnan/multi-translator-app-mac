/**
 * 翻译缓存：磁盘 JSON 持久化（userData/translation-cache.json），
 * 键 = hash(原文 + 目标语言)，命中即零延迟返回。
 *
 * 容量与写盘策略（长时间运行 / 多开时不拖累主进程）：
 * - 淘汰走 **Map 插入序**（load 时已按 ts 升序重建，故插入序即"最旧在前"），
 *   单个删除 O(1)；不再对整表排序 —— 旧写法在每次超限时都要排序 2 万条，
 *   属于主进程同步阻塞，缓存写满后会表现为界面整体卡顿。
 * - 超限一次性淘汰到 90% 水位，避免"加一条删一条"的抖动。
 * - 定时写盘改为异步（fs.promises + 临时文件 rename），2 万条 JSON 不再同步阻塞
 *   主进程 IPC/窗口响应；退出时 flush() 仍走同步路径，确保数据不丢。
 */
import { app } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, mkdirSync, renameSync, existsSync, promises as fsp } from 'fs'
import { createHash } from 'crypto'
import type { CacheStats } from '../../../shared/types'

interface CacheEntry {
  translated: string
  ts: number
}

const MAX_ENTRIES = 20000
/** 超限时一次性淘汰到容量的 90% */
const EVICT_DOWN_TO = 0.9
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000 // 30 天

let map = new Map<string, CacheEntry>()
let loaded = false
let hits = 0
let misses = 0
let dirty = false
let filePath = ''
let saveTimer: NodeJS.Timeout | null = null
let writing = false
let writeAgain = false

function getFile(): string {
  if (!filePath) {
    filePath = join(app.getPath('userData'), 'translation-cache.json')
  }
  return filePath
}

export function keyOf(text: string, targetLang: string): string {
  return createHash('sha1').update(text + '\u0001' + targetLang).digest('hex')
}

function load(): void {
  const file = getFile()
  if (!existsSync(file)) return
  try {
    const raw = JSON.parse(readFileSync(file, 'utf-8')) as Record<string, CacheEntry>
    const now = Date.now()
    // 按写入时间升序重建：Map 的插入序此后即等于"最旧在前"，淘汰无需再排序
    Object.entries(raw)
      .filter(([, e]) => e && typeof e.ts === 'number' && now - e.ts <= MAX_AGE_MS)
      .sort((a, b) => a[1].ts - b[1].ts)
      .forEach(([k, e]) => map.set(k, e))
  } catch (e) {
    console.error('[cache] load failed', e)
  }
}

/** 只加载一次：避免 clear() 之后被 get/set 重新从磁盘"复活"旧数据 */
function ensureLoaded(): void {
  if (loaded) return
  loaded = true
  load()
}

function serialize(): string {
  const obj: Record<string, CacheEntry> = {}
  map.forEach((v, k) => {
    obj[k] = v
  })
  return JSON.stringify(obj)
}

/** 同步落盘：仅退出 / 清空时使用，保证调用返回时数据已在磁盘上 */
function persistSync(): void {
  if (!dirty) return
  dirty = false
  try {
    mkdirSync(app.getPath('userData'), { recursive: true })
    const tmp = getFile() + '.tmp'
    writeFileSync(tmp, serialize(), 'utf-8')
    renameSync(tmp, getFile())
  } catch (e) {
    console.error('[cache] persist failed', e)
  }
}

/** 异步落盘：定时保存用，避免 2 万条序列化 + 写盘阻塞主进程 */
async function persistAsync(): Promise<void> {
  if (!dirty) return
  // 已有写入在进行：标记"待补写"，写完后再补一次，避免并发写坏临时文件
  if (writing) {
    writeAgain = true
    return
  }
  dirty = false
  writing = true
  const json = serialize()
  try {
    await fsp.mkdir(app.getPath('userData'), { recursive: true })
    const tmp = getFile() + '.tmp'
    await fsp.writeFile(tmp, json, 'utf-8')
    await fsp.rename(tmp, getFile())
  } catch (e) {
    console.error('[cache] persist failed', e)
  } finally {
    writing = false
    if (writeAgain) {
      writeAgain = false
      void persistAsync()
    }
  }
}

function scheduleSave(): void {
  dirty = true
  if (saveTimer) return
  saveTimer = setTimeout(() => {
    saveTimer = null
    void persistAsync()
  }, 3000)
}

/**
 * 超限淘汰：从最旧（Map 头部）开始删除，删到 90% 水位为止。
 * 复杂度只与「本次需要删除的条数」相关，不随缓存总量增长。
 */
function evictIfNeeded(): void {
  if (map.size <= MAX_ENTRIES) return
  let drop = map.size - Math.floor(MAX_ENTRIES * EVICT_DOWN_TO)
  for (const k of map.keys()) {
    if (drop <= 0) break
    map.delete(k)
    drop--
  }
}

export const cache = {
  get(text: string, targetLang: string): string | null {
    ensureLoaded()
    const k = keyOf(text, targetLang)
    const e = map.get(k)
    if (e) {
      // 过滤历史脏数据（解析兜底残留的前导引号），避免把坏翻译返回给用户
      if (typeof e.translated === 'string' && e.translated.startsWith('"')) {
        map.delete(k)
        dirty = true
        scheduleSave()
        misses++
        return null
      }
      hits++
      return e.translated
    }
    misses++
    return null
  },
  set(text: string, targetLang: string, translated: string): void {
    ensureLoaded()
    const k = keyOf(text, targetLang)
    // 已存在的键先删再插：让插入序同时承担"LRU"语义，
    // 否则长期复用的条目会一直排在最前，被优先淘汰
    if (map.has(k)) map.delete(k)
    map.set(k, { translated, ts: Date.now() })
    evictIfNeeded()
    scheduleSave()
  },
  stats(): CacheStats {
    ensureLoaded()
    return { hits, misses, size: map.size }
  },
  flush(): void {
    if (saveTimer) {
      clearTimeout(saveTimer)
      saveTimer = null
    }
    persistSync()
  },
  clear(): CacheStats {
    ensureLoaded()
    map.clear()
    hits = 0
    misses = 0
    dirty = true
    persistSync()
    return { hits, misses, size: 0 }
  },
}
