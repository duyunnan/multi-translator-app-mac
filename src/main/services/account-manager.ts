/**
 * 账号管理服务：增删改查、排序、置顶、隐藏。
 */
import { randomUUID } from 'crypto'
import { store } from './store'
import type { Account, Platform } from '../../shared/types'

export interface AddAccountInput {
  platform: Platform
  name: string
  signalAccountId?: string
}

export function listAccounts(): Account[] {
  const accounts = store.getAccounts()
  return [...accounts]
    .sort((a, b) => {
      if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1
      // 置顶账号内部：后置顶的排最前（点置顶即插到置顶组第一位）
      if (a.pinned) {
        const byPinTime = (b.pinnedAt ?? 0) - (a.pinnedAt ?? 0)
        if (byPinTime !== 0) return byPinTime
      }
      return (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
    })
    .filter((a) => !a.isHidden)
}

export function addAccount(input: AddAccountInput): Account {
  const accounts = store.getAccounts()
  const id = 'acc_' + randomUUID().replace(/-/g, '').slice(0, 12)
  // Signal 每个账号必须分配独立 signalAccountId（作为 Signal profile/userData 隔离键），
  // 否则多个 Signal 账号会共享同一 Signal 桌面实例、登录态串号（signal-manager.profileDir
  // 依赖它建立独立 user-data-dir）。未显式提供时用账号 id 派生唯一 id。
  const signalAccountId =
    input.platform === 'signal' ? input.signalAccountId || `sig-${id.replace(/^acc_/, '')}` : input.signalAccountId
  const account: Account = {
    id,
    platform: input.platform,
    name: input.name || defaultName(input.platform),
    sortOrder: accounts.length + 1,
    pinned: false,
    isHidden: false,
    createdAt: Date.now(),
    signalAccountId,
    signalStatus: 'idle',
    lineStatus: 'idle',
  }
  accounts.push(account)
  store.setAccounts(accounts)
  return account
}

export function removeAccount(id: string): void {
  store.setAccounts(store.getAccounts().filter((a) => a.id !== id))
}

export function renameAccount(id: string, name: string): void {
  store.setAccounts(
    store.getAccounts().map((a) => (a.id === id ? { ...a, name } : a))
  )
}

export function reorderAccounts(orderedIds: string[]): void {
  const accounts = store.getAccounts()
  const byId = new Map(accounts.map((a) => [a.id, a]))
  const next: Account[] = []
  for (const id of orderedIds) {
    const acc = byId.get(id)
    if (acc) next.push(acc)
  }
  // 追加未出现在列表中的账号
  for (const a of accounts) {
    if (!next.find((x) => x.id === a.id)) next.push(a)
  }
  next.forEach((a, i) => (a.sortOrder = i + 1))
  store.setAccounts(next)
}

export function togglePin(id: string): void {
  store.setAccounts(
    store.getAccounts().map((a) => {
      if (a.id !== id) return a
      const pinned = !a.pinned
      // 置顶时刷新时间戳，保证新置顶的账号排到所有置顶账号的最前面；取消置顶时清零
      return { ...a, pinned, pinnedAt: pinned ? Date.now() : 0 }
    })
  )
}

export function toggleHidden(id: string): void {
  store.setAccounts(
    store.getAccounts().map((a) => (a.id === id ? { ...a, isHidden: !a.isHidden } : a))
  )
}

export function updateAccountStatus(id: string, patch: Partial<Account>): void {
  store.setAccounts(
    store.getAccounts().map((a) => (a.id === id ? { ...a, ...patch } : a))
  )
}

export function getAccount(id: string): Account | undefined {
  return store.getAccounts().find((a) => a.id === id)
}

function defaultName(platform: Platform): string {
  const map: Record<Platform, string> = {
    whatsapp: 'WhatsApp 账号',
    telegram: 'Telegram 账号',
    messenger: 'Messenger 账号',
    signal: 'Signal 账号',
    line: 'LINE 账号',
  }
  return map[platform] + ' ' + (listAccounts().filter((a) => a.platform === platform).length + 1)
}
