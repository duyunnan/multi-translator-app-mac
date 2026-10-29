/**
 * 对话窗口 preload：暴露 window.gptApi。
 * 服务商（deepseek / openai）由主进程创建窗口时通过 additionalArguments 注入，
 * 页面本身不区分，getConfig / sendChat 自动带上 provider。
 */
import { contextBridge, ipcRenderer } from 'electron'

type ChatProvider = 'deepseek' | 'openai'

const providerArg = process.argv.find((a) => a.startsWith('--chat-provider='))
const provider: ChatProvider = providerArg?.split('=')[1] === 'openai' ? 'openai' : 'deepseek'

const gptApi = {
  getConfig: () => ipcRenderer.invoke('gpt-chat-config', { provider }),
  sendChat: (payload: { messages: Array<{ role: string; text?: string; content?: string; image?: string | null }> }) =>
    ipcRenderer.invoke('gpt-chat-send', { provider, messages: payload?.messages ?? [] }),
  clearHistory: () => ipcRenderer.invoke('gpt-chat-clear', { provider }),
}

contextBridge.exposeInMainWorld('gptApi', gptApi)
