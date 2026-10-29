/**
 * Signal 子进程 IPC：启动 / 嵌入 / 重定位 / 退出 / 健康检查 / 未读设置。
 * 实际逻辑在 services/signal-manager.ts。
 */
import { ipcMain } from 'electron'
import { IPC, type SignalState } from '../../shared/types'
import { getAccount } from '../services/account-manager'
import * as signalMgr from '../services/signal-manager'

export function registerSignalIpc(): void {
  ipcMain.handle(IPC.SignalLaunch, async (_e, accountId: string): Promise<SignalState> => {
    const acc = getAccount(accountId)
    if (!acc) {
      return { accountId, status: 'error', pid: null, unread: 0, embedded: false, error: '账号不存在' }
    }
    return signalMgr.launch(accountId)
  })

  ipcMain.handle(IPC.SignalEmbed, async (_e, accountId: string): Promise<SignalState> => {
    return signalMgr.embed(accountId)
  })

  ipcMain.handle(
    IPC.SignalRelocate,
    (_e, accountId: string, bounds: { x: number; y: number; width: number; height: number }): SignalState => {
      return signalMgr.relocate(accountId, bounds)
    }
  )

  ipcMain.handle(IPC.SignalReset, async (_e, accountId: string): Promise<SignalState> => {
    return signalMgr.reset(accountId)
  })

  // 重启 Signal（保留 profile / 登录态）：代理等启动参数改动后需要重启才生效
  ipcMain.handle(IPC.SignalRelaunch, async (_e, accountId: string): Promise<SignalState> => {
    return signalMgr.relaunch(accountId)
  })

  // 删除账号用：强杀 Signal 进程树并立即返回（对齐鑫五洋"删除几乎同时关闭"）
  ipcMain.handle(IPC.SignalKill, async (_e, accountId: string): Promise<SignalState> => {
    return signalMgr.killNow(accountId)
  })

  ipcMain.handle(IPC.SignalDetach, (_e, accountId: string): SignalState => {
    return signalMgr.detach(accountId)
  })

  ipcMain.handle(IPC.SignalHealth, (_e, accountId: string): SignalState => {
    return signalMgr.health(accountId)
  })

  ipcMain.handle(IPC.SignalSetUnread, (_e, accountId: string, n: number): SignalState => {
    return signalMgr.setUnread(accountId, n)
  })
}
