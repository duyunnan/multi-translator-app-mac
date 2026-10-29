/**
 * 翻译 / 缓存统计 / 语音识别 IPC
 */
import { ipcMain } from 'electron'
import { IPC } from '../../shared/types'
import { doTranslate, doGenerateReply, translationCache } from '../services/translator'
import { speechRecognize as whisperRecognize } from '../services/translator/openai'
import { store } from '../services/store'

export function registerTranslateIpc(): void {
  ipcMain.handle(IPC.TranslateText, async (_e, text: string, targetLang?: string, bypassCache?: boolean) => {
    if (!text || typeof text !== 'string') {
      return { success: false, error: 'empty text' }
    }
    return await doTranslate(text, targetLang || '', store.getSettings(), { bypassCache: !!bypassCache })
  })

  ipcMain.handle(IPC.CacheStats, () => translationCache.stats())

  ipcMain.handle(IPC.CacheClear, () => translationCache.clear())

  ipcMain.handle(
    IPC.SpeechRecognize,
    async (_e, audioBase64: string, mime: string) => {
      try {
        const text = await whisperRecognize(audioBase64, mime || 'audio/webm', store.getSettings())
        return { success: true, text }
      } catch (e: any) {
        return { success: false, error: String(e?.message || e) }
      }
    }
  )

  ipcMain.handle(
    IPC.GenerateReply,
    async (_e, messages: { role: 'in' | 'out'; text: string }[]) => {
      try {
        return await doGenerateReply(Array.isArray(messages) ? messages : [], store.getSettings())
      } catch (e: any) {
        return { success: false, error: String(e?.message || e) }
      }
    }
  )
}

/** 供本地服务器复用的生成回复逻辑 */
export { doGenerateReply }
