/**
 * Google Translate 免费接口（client=gtx），主翻译通道。
 * 非官方 API，仅适用于个人/小规模使用。
 * 支持直连或走 SOCKS5 代理（与 OpenAI/DeepSeek 共用同一代理设置）。
 */
import { netRequest } from '../net-request'
import { socks5HttpsRequest } from '../socks5'
import type { Settings } from '../../../shared/types'

export interface GoogleTranslateOptions {
  timeoutMs?: number
  settings?: Settings
}

/**
 * 调用 Google Translate。
 * @returns 翻译结果文本；失败抛异常
 */
export async function googleTranslate(
  text: string,
  targetLang: string,
  options: GoogleTranslateOptions = {}
): Promise<string> {
  // 超时缩短到 1s：Google 被墙/限流时快速失败，尽早 fallback 到 AI 通道，减少回车翻译等待
  const timeoutMs = options.timeoutMs ?? 1000
  const settings = options.settings
  const url = new URL('https://translate.googleapis.com/translate_a/single')
  url.searchParams.set('client', 'gtx')
  url.searchParams.set('sl', 'auto')
  url.searchParams.set('tl', targetLang)
  url.searchParams.set('dt', 't')
  url.searchParams.set('dj', '1')

  const body = `q=${encodeURIComponent(text)}`
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    'Content-Length': String(Buffer.byteLength(body)),
    'Accept-Encoding': 'identity',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  }

  // 优先走 SOCKS5 代理（V2Ray 等）；未配置代理时直连
  const proxy =
    settings && settings.proxyHost && settings.proxyPort
      ? {
          host: settings.proxyHost,
          port: settings.proxyPort,
          username: settings.proxyUsername || undefined,
          password: settings.proxyPassword || undefined,
        }
      : null

  const raw = proxy
    ? (
        await socks5HttpsRequest(proxy, {
          hostname: url.hostname,
          port: 443,
          path: url.pathname + url.search,
          method: 'POST',
          headers,
          body,
          timeoutMs,
        })
      ).body
    : await (async () => {
        // 未配置显式代理时走 Electron net.request：自动遵循系统代理（V2Ray 等），无需应用内配代理
        const res = await netRequest({
          url: url.href,
          method: 'POST',
          headers,
          body,
          timeoutMs,
        })
        if (res.status !== 200) {
          throw new Error(`Google translate HTTP ${res.status}`)
        }
        return res.body
      })()

  return parseGtxResponse(raw)
}

/** 解析 gtx + dj=1 响应 */
export function parseGtxResponse(raw: string): string {
  try {
    const json = JSON.parse(raw)
    if (json && Array.isArray(json.sentences)) {
      return json.sentences
        .map((s: any) => s?.trans ?? '')
        .join('')
        .trim()
    }
    throw new Error('no sentences in response')
  } catch (e: any) {
    // 兜底：兼容旧格式数组响应
    const arr = raw.match(/"trans":"([^"]*)"/g)
    if (arr) {
      return arr
        .map((s) => {
          const m = s.match(/^"trans":"(.*)"$/)
          return m ? m[1] : ''
        })
        .join('')
        .trim()
    }
    throw new Error('failed to parse google response: ' + String(e?.message || e))
  }
}
