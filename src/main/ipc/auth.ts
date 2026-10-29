/**
 * 授权登录 IPC 注册
 */
import { ipcMain } from 'electron'
import { IPC, type AuthConfig } from '../../shared/types'
import { getStatus, login, logout, getRawAuthConfig, setAuthConfig } from '../services/auth'

export function registerAuthIpc(): void {
  ipcMain.handle(IPC.AuthStatus, () => getStatus())
  ipcMain.handle(IPC.AuthLogin, (_e, username: string, password: string) => login(username, password))
  ipcMain.handle(IPC.AuthLogout, () => logout())
  // 返回用户原始配置（host 可为空，空即使用系统默认 api/端口），供登录页"服务器设置"弹窗展示
  ipcMain.handle(IPC.AuthConfigGet, (): AuthConfig => getRawAuthConfig())
  ipcMain.handle(IPC.AuthConfigSet, (_e, cfg: AuthConfig): AuthConfig => setAuthConfig(cfg))
}
