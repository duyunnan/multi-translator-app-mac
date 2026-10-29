/**
 * 本地服务器状态 IPC
 */
import { ipcMain } from 'electron'
import { IPC } from '../../shared/types'
import { getServerStatus } from '../services/local-server'

export function registerServerIpc(): void {
  ipcMain.handle(IPC.ServerStatus, () => getServerStatus())
}
