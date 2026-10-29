/**
 * 轻量 JSON 持久化存储。
 * 数据保存在 app.getPath('userData') 下的 data.json，原子写入。
 */
import { app } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, mkdirSync, renameSync, existsSync } from 'fs'
import type { Account, AuthState, Settings } from '../../shared/types'
import { DEFAULT_SETTINGS } from '../../shared/types'

interface StoreShape {
  accounts: Account[]
  settings: Settings
  auth: AuthState | null
}

let cache: StoreShape | null = null
let filePath = ''

function getFile(): string {
  if (!filePath) {
    filePath = join(app.getPath('userData'), 'data.json')
  }
  return filePath
}

function load(): StoreShape {
  if (cache) return cache
  const file = getFile()
  let data: StoreShape = { accounts: [], settings: { ...DEFAULT_SETTINGS }, auth: null }
  if (existsSync(file)) {
    try {
      const raw = JSON.parse(readFileSync(file, 'utf-8'))
      data = {
        accounts: Array.isArray(raw.accounts) ? raw.accounts : [],
        settings: { ...DEFAULT_SETTINGS, ...(raw.settings || {}) },
        auth:
          raw.auth && typeof raw.auth === 'object' && typeof raw.auth.token === 'string' ? (raw.auth as AuthState) : null,
      }
    } catch (e) {
      console.error('[store] failed to parse data.json, using defaults', e)
    }
  }
  cache = data
  return data
}

function persist(): void {
  const file = getFile()
  try {
    mkdirSync(app.getPath('userData'), { recursive: true })
    const tmp = file + '.tmp'
    writeFileSync(tmp, JSON.stringify(load(), null, 2), 'utf-8')
    renameSync(tmp, file)
  } catch (e) {
    console.error('[store] persist failed', e)
  }
}

export const store = {
  getAccounts(): Account[] {
    return load().accounts
  },
  setAccounts(accounts: Account[]): void {
    load().accounts = accounts
    persist()
  },
  getSettings(): Settings {
    return load().settings
  },
  setSettings(patch: Partial<Settings>): Settings {
    load().settings = { ...load().settings, ...patch }
    persist()
    return load().settings
  },
  getAuth(): AuthState | null {
    return load().auth
  },
  setAuth(auth: AuthState): void {
    load().auth = auth
    persist()
  },
  clearAuth(): void {
    if (load().auth) {
      load().auth = null
      persist()
    }
  },
  /** 供渲染层读取磁盘原始路径（调试用） */
  path(): string {
    return getFile()
  },
}
