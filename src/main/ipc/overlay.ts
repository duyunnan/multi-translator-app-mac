/**
 * 宿主浮层 IPC：renderer 的 DOM 浮层（modal 等）打开/关闭时，
 * 通知主进程暂停/恢复 LINE / Signal 原生嵌入视图，避免浮层被原生视图遮挡。
 */
import { ipcMain } from 'electron'
import { IPC } from '../../shared/types'
import { setOverlayPaused as setLineOverlayPaused } from '../services/line-manager'
import { setOverlayPaused as setSignalOverlayPaused } from '../services/signal-manager'

export function registerOverlayIpc(): void {
  ipcMain.handle(IPC.NativeOverlaySet, (_e, active: boolean): void => {
    const paused = active === true
    setLineOverlayPaused(paused)
    setSignalOverlayPaused(paused)
  })
}
