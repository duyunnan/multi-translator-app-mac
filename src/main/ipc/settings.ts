/**
 * 设置读写 / OpenAI 连通性测试 / 代理测试 IPC
 */
import { ipcMain } from 'electron'
import { IPC, type Settings } from '../../shared/types'
import { store } from '../services/store'
import { testOpenAIConnection, testDeepSeekConnection } from '../services/translator/openai'
import { testSocks5Proxy } from '../services/socks5'
import { detectLocalProxy } from '../services/proxy-detect'

/** 代理测试返回：message 为成功时的一句话结论 */
interface ProxyTestResult {
  success: boolean
  error?: string
  message?: string
}

export function registerSettingsIpc(): void {
  ipcMain.handle(IPC.SettingsGet, (): Settings => store.getSettings())

  ipcMain.handle(IPC.SettingsSet, (_e, patch: Partial<Settings>): Settings => {
    const next = store.setSettings(patch)
    // 译文显示设置变化时，实时同步到已打开的 LINE 会话译文徽章
    try {
      const { pushLineBadgeStyle } = require('../services/line-manager') as typeof import('../services/line-manager')
      if (typeof pushLineBadgeStyle === 'function') pushLineBadgeStyle()
    } catch {
      /* ignore */
    }
    return next
  })

  ipcMain.handle(IPC.OpenAITest, async () => {
    return await testOpenAIConnection(store.getSettings())
  })

  ipcMain.handle(IPC.DeepSeekTest, async () => {
    return await testDeepSeekConnection(store.getSettings())
  })

  ipcMain.handle(
    IPC.ProxyTest,
    async (
      _e,
      proxyArg?: { host: string; port: number; username?: string; password?: string }
    ): Promise<ProxyTestResult> => {
      const s = store.getSettings()
      // 优先使用传入的表单当前值，未传时用已保存的设置
      const host = proxyArg?.host || s.proxyHost
      const port = proxyArg?.port || s.proxyPort
      if (!host || !port) {
        // 表单与设置都没填 → 测的就是"自动检测"实际会用的那个代理，只回答通不通
        if (s.proxyAutoDetect === false) {
          return { success: false, error: '未填写代理' }
        }
        const auto = await detectLocalProxy()
        if (!auto) {
          return { success: false, error: '未检测到可用代理' }
        }
        return { success: true, message: `${auto.host}:${auto.port} 可用` }
      }
      const r = await Promise.race<{ success: boolean; error?: string }>([
        testSocks5Proxy({
          host,
          port,
          username: proxyArg?.username ?? (s.proxyUsername || undefined),
          password: proxyArg?.password ?? (s.proxyPassword || undefined),
        }),
        new Promise<{ success: false; error: string }>((resolve) =>
          setTimeout(
            () => resolve({ success: false, error: '代理连接超时（请检查 V2Ray 是否运行、端口是否正确）' }),
            10000
          )
        ),
      ])
      return { ...r, message: r.success ? `${host}:${port} 可用` : undefined }
    }
  )
}
