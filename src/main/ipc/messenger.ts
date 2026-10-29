/**
 * Messenger IPC：messenger 子进程窗口嵌入主窗口（launch/embed/relocate/detach/health/reset）
 * + 兼容旧 open/hide/close。
 * 实际逻辑在 services/messenger-window-manager.ts（spawn messenger-mode + user32 嵌入主窗口）。
 */
import { ipcMain } from 'electron'
import { IPC, type MessengerState } from '../../shared/types'
import * as messengerWin from '../services/messenger-window-manager'

export function registerMessengerIpc(): void {
  ipcMain.handle(IPC.MessengerWindowOpen, (_e, accountId: string): void => {
    messengerWin.open(accountId)
  })
  ipcMain.handle(IPC.MessengerWindowHide, (_e, accountId: string): void => {
    messengerWin.hide(accountId)
  })
  ipcMain.handle(IPC.MessengerWindowClose, (_e, accountId: string): void => {
    messengerWin.close(accountId)
  })

  ipcMain.handle(IPC.MessengerLaunch, async (_e, accountId: string): Promise<MessengerState> => {
    return messengerWin.launch(accountId)
  })
  ipcMain.handle(IPC.MessengerEmbed, async (_e, accountId: string): Promise<MessengerState> => {
    return messengerWin.embed(accountId)
  })
  ipcMain.handle(
    IPC.MessengerRelocate,
    (_e, accountId: string, bounds: { x: number; y: number; width: number; height: number }): MessengerState => {
      return messengerWin.relocate(accountId, bounds)
    }
  )
  ipcMain.handle(IPC.MessengerReset, async (_e, accountId: string): Promise<MessengerState> => {
    return messengerWin.reset(accountId)
  })
  ipcMain.handle(IPC.MessengerDetach, (_e, accountId: string): MessengerState => {
    return messengerWin.detach(accountId)
  })
  ipcMain.handle(IPC.MessengerHealth, (_e, accountId: string): MessengerState => {
    return messengerWin.health(accountId)
  })
  ipcMain.handle(IPC.MessengerSetUnread, (_e, accountId: string, n: number): MessengerState => {
    return messengerWin.setUnread(accountId, n)
  })
}
