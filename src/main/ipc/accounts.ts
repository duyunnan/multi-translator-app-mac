/**
 * 账号管理 IPC
 */
import { ipcMain } from 'electron'
import { IPC } from '../../shared/types'
import * as accountManager from '../services/account-manager'
import * as lineMgr from '../services/line-manager'
import { logCrashSync } from '../services/debug-log'
import type { Account } from '../../shared/types'

export function registerAccountsIpc(): void {
  ipcMain.handle(IPC.AccountsList, (): Account[] => accountManager.listAccounts())

  ipcMain.handle(
    IPC.AccountsAdd,
    (_e, input: { platform: Account['platform']; name: string; signalAccountId?: string }) => {
      const acc = accountManager.addAccount({
        platform: input.platform,
        name: input.name,
        signalAccountId: input.signalAccountId,
      })
      // LINE：回收区有登录数据时自动恢复，免重新扫码
      if (acc.platform === 'line') {
        try {
          const restored = lineMgr.tryRestoreLoginData(acc.id)
          if (restored) console.log('[line] 新账号已恢复上次登录数据')
        } catch (e) {
          console.error('[line] 恢复登录数据失败:', e)
        }
      }
      return acc
    }
  )

  ipcMain.handle(IPC.AccountsRemove, async (_e, id: string) => {
    // 同步取证：删除账号若引发原生崩溃，debug.log 的异步缓冲会一起丢，这里逐步落盘 crash.log
    logCrashSync(`[path] main:remove:begin ${id}`)
    // LINE：删除前先把登录态移入回收区（重新添加该账号可免扫码恢复）
    const acc = accountManager.listAccounts().find((a) => a.id === id)
    if (acc?.platform === 'line') {
      // 先彻底销毁视图并等待 Chromium 释放存储句柄，
      // 之后再移动分区数据目录，避免删除仍在使用的分区导致主进程 CHECK 崩溃
      try {
        lineMgr.dispose(id)
      } catch {
        /* ignore */
      }
      await new Promise((r) => setTimeout(r, 350))
      lineMgr.retireAccountData(id)
    }
    accountManager.removeAccount(id)
    logCrashSync(`[path] main:remove:done ${id}`)
  })

  ipcMain.handle(
    IPC.AccountsUpdate,
    (_e, id: string, patch: Partial<Account>): Account => {
      accountManager.updateAccountStatus(id, patch)
      const updated = accountManager.getAccount(id)
      if (!updated) throw new Error('账号不存在')
      return updated
    }
  )

  ipcMain.handle(IPC.AccountsRename, (_e, id: string, name: string) => {
    accountManager.renameAccount(id, name)
  })

  ipcMain.handle(IPC.AccountsReorder, (_e, orderedIds: string[]) => {
    accountManager.reorderAccounts(orderedIds)
  })

  ipcMain.handle(IPC.AccountsTogglePin, (_e, id: string) => {
    accountManager.togglePin(id)
  })

  ipcMain.handle(IPC.AccountsToggleHidden, (_e, id: string) => {
    accountManager.toggleHidden(id)
  })
}
