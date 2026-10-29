/**
 * 翻译主流程：缓存优先 → Google Translate → OpenAI 兜底。
 */
import { googleTranslate } from './google'
import {
  openaiTranslate,
  deepseekTranslate,
  generateReply as openaiGenerateReply,
  deepseekGenerateReply,
  type ReplyMessage,
} from './openai'
import { cache } from './cache'
import type { Settings, TranslateResult, GenerateReplyResult } from '../../../shared/types'

/** 目标语言规范化（zh -> zh-CN 等） */
export function normalizeTargetLang(lang: string): string {
  const map: Record<string, string> = {
    zh: 'zh-CN',
    zhcn: 'zh-CN',
    'zh-cn': 'zh-CN',
    chinese: 'zh-CN',
    'zh-hans': 'zh-CN',
    'zh-hant': 'zh-TW',
    'zh-tw': 'zh-TW',
    tw: 'zh-TW',
    enus: 'en',
    en: 'en',
  }
  return map[lang?.toLowerCase()] || lang || 'zh-CN'
}

/**
 * 决定 AI 兜底通道：优先 aiProvider 指向的引擎；若它没配 key 而另一个引擎配了，
 * 自动改用"已配置 key"的那个（避免 Google 失败后明明配了 DeepSeek 却报"未配置 OpenAI"）。
 */
export function pickFallbackAi(settings: Settings): 'openai' | 'deepseek' {
  if (settings.aiProvider === 'deepseek' && settings.deepseekApiKey) return 'deepseek'
  if (settings.aiProvider === 'openai' && settings.openaiApiKey) return 'openai'
  if (settings.deepseekApiKey && !settings.openaiApiKey) return 'deepseek'
  if (settings.openaiApiKey && !settings.deepseekApiKey) return 'openai'
  return settings.aiProvider === 'deepseek' ? 'deepseek' : 'openai'
}

/* ==================== Google 熔断 ==================== */
/** 连续失败 N 次后进入冷却期，冷却期内直接跳过 Google 走 AI，避免每次傻等超时 */
let googleFailStreak = 0
let googleCooldownUntil = 0
const GOOGLE_FAIL_LIMIT = 3
const GOOGLE_COOLDOWN_MS = 5 * 60 * 1000

function googleAvailable(): boolean {
  return Date.now() >= googleCooldownUntil
}

function recordGoogleFail(): void {
  googleFailStreak++
  if (googleFailStreak >= GOOGLE_FAIL_LIMIT) {
    googleCooldownUntil = Date.now() + GOOGLE_COOLDOWN_MS
    console.warn(
      `[translator] Google 连续失败 ${googleFailStreak} 次，进入 ${GOOGLE_COOLDOWN_MS / 60000} 分钟冷却期，期间直接走 AI 通道`
    )
  }
}

function recordGoogleSuccess(): void {
  googleFailStreak = 0
  googleCooldownUntil = 0
}

export async function doTranslate(
  text: string,
  targetLang: string,
  settings: Settings,
  opts?: { bypassCache?: boolean }
): Promise<TranslateResult> {
  const t = targetLang || settings.defaultTargetLang || 'zh-CN'
  const lang = normalizeTargetLang(t)

  // 1) 缓存（重新翻译时跳过）
  if (!opts?.bypassCache) {
    const cached = cache.get(text, lang)
    if (cached != null) {
      return { success: true, translated: cached, fromCache: true, source: 'cache' }
    }
  }

  const engine = settings.translateEngine || 'google'

  // 2) 指定 AI 引擎（openai / deepseek）：直接使用，不再等待 Google
  if (engine === 'openai' || engine === 'deepseek') {
    try {
      const translated =
        engine === 'deepseek'
          ? await deepseekTranslate(text, lang, settings)
          : await openaiTranslate(text, lang, settings)
      if (translated) {
        if (translated !== text) cache.set(text, lang, translated)
        return { success: true, translated, fromCache: false, source: engine }
      }
    } catch (e) {
      console.warn('[translator] ai translate failed:', (e as Error).message)
      return { success: false, error: (e as Error).message }
    }
    return { success: false, error: '翻译失败：AI 引擎无输出' }
  }

  // 3) Google 主通道（连续失败进入冷却期时直接跳过，避免每次傻等超时）
  if (googleAvailable()) {
    try {
      const translated = await googleTranslate(text, lang, { settings })
      if (translated) {
        recordGoogleSuccess()
        if (translated !== text) cache.set(text, lang, translated)
        return { success: true, translated, fromCache: false, source: 'google' }
      }
    } catch (e) {
      recordGoogleFail()
      console.warn('[translator] google failed, fallback to ai:', (e as Error).message)
    }
  } else {
    console.log('[translator] google 处于冷却期，直接走 AI 通道')
  }

  // 4) AI 兜底（OpenAI 或 DeepSeek）：优先 aiProvider 指向；若其没配 key 则自动用已配 key 的那个
  const fallbackEngine = pickFallbackAi(settings)
  const isDeepSeek = fallbackEngine === 'deepseek'
  try {
    const translated = isDeepSeek
      ? await deepseekTranslate(text, lang, settings)
      : await openaiTranslate(text, lang, settings)
    if (translated) {
      if (translated !== text) cache.set(text, lang, translated)
      return { success: true, translated, fromCache: false, source: isDeepSeek ? 'deepseek' : 'openai' }
    }
  } catch (e) {
    console.warn('[translator] ai fallback failed:', (e as Error).message)
    return { success: false, error: (e as Error).message }
  }

  return { success: false, error: '翻译失败：所有通道均无输出' }
}

export async function doGenerateReply(messages: ReplyMessage[], settings: Settings): Promise<GenerateReplyResult> {
  try {
    const reply =
      pickFallbackAi(settings) === 'deepseek'
        ? await deepseekGenerateReply(messages, settings)
        : await openaiGenerateReply(messages, settings)
    return { success: true, reply }
  } catch (e) {
    return { success: false, error: (e as Error).message }
  }
}

export { cache as translationCache }
