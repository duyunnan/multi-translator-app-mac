/**
 * LINE 子进程 IPC：启动 / 嵌入 / 重定位 / 退出 / 健康检查 / 未读设置。
 * 实际逻辑在 services/line-manager.ts（混合运行时：Electron 22 子进程 + 窗口嵌入）。
 */
import { ipcMain } from 'electron'
import { IPC, type LineState } from '../../shared/types'
import { getAccount } from '../services/account-manager'
import * as lineMgr from '../services/line-manager'

export function registerLineIpc(): void {
  ipcMain.handle(IPC.LineLaunch, async (_e, accountId: string): Promise<LineState> => {
    const acc = getAccount(accountId)
    if (!acc) {
      return { accountId, status: 'error', pid: null, unread: 0, embedded: false, error: '账号不存在' }
    }
    return lineMgr.launch(accountId)
  })

  ipcMain.handle(IPC.LineEmbed, async (_e, accountId: string): Promise<LineState> => {
    return lineMgr.embed(accountId)
  })

  ipcMain.handle(
    IPC.LineRelocate,
    (_e, accountId: string, bounds: { x: number; y: number; width: number; height: number }): LineState => {
      return lineMgr.relocate(accountId, bounds)
    }
  )

  ipcMain.handle(IPC.LineReset, async (_e, accountId: string): Promise<LineState> => {
    return lineMgr.reset(accountId)
  })

  ipcMain.handle(IPC.LineDetach, (_e, accountId: string): LineState => {
    return lineMgr.detach(accountId)
  })

  ipcMain.handle(IPC.LineHealth, (_e, accountId: string): LineState => {
    return lineMgr.health(accountId)
  })

  ipcMain.handle(IPC.LineSetUnread, (_e, accountId: string, n: number): LineState => {
    return lineMgr.setUnread(accountId, n)
  })
}
