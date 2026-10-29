/**
 * OpenAI 兼容接口：翻译、AI 回复、Whisper 语音识别。
 * 支持直连或走 SOCKS5 代理。
 */
import { netRequest } from '../net-request'
import { socks5HttpsRequest } from '../socks5'
import { detectLocalProxy } from '../proxy-detect'
import type { Settings } from '../../../shared/types'

export interface OpenAIError extends Error {
  status?: number
  /** true 表示被服务端按出口地区拒绝（换代理/节点才有救） */
  regionBlocked?: boolean
}

function requireApiKey(settings: Settings, key: 'openaiApiKey' | 'sttApiKey'): void {
  const v = settings[key]
  if (!v) {
    throw new Error(key === 'openaiApiKey' ? '未配置 OpenAI API Key' : '未配置语音识别 API Key')
  }
}

/** 是否配置了显式 SOCKS5 代理（未配置时请求走 Electron net，自动遵循系统代理） */
export function hasProxy(settings: Settings): boolean {
  return !!(settings.proxyHost && settings.proxyPort)
}

function buildProxy(settings: Settings) {
  if (hasProxy(settings)) {
    return {
      host: settings.proxyHost,
      port: settings.proxyPort,
      username: settings.proxyUsername || undefined,
      password: settings.proxyPassword || undefined,
    }
  }
  return null
}

/** OpenAI 对不支持的出口地区直接回 403，Body 里是 unsupported_country_region_territory */
const REGION_BLOCK_PATTERN = /unsupported_country_region_territory|request_forbidden/i

/** 地区受限的中文指引：把解决办法直接写进错误，省得用户对着英文 body 猜 */
const REGION_BLOCK_HINT =
  'OpenAI 拒绝当前网络出口（该国家/地区不受支持）。请确认代理软件已开启并选中带海外出口的节点，' +
  '且路由规则让 api.openai.com 走代理（而不是直连）；也可以在「设置 → OpenAI」直接填写 SOCKS5 代理后重试。'

/** 自动探测本机代理的超时：比 Signal 路径短，避免拖慢翻译与测试连接 */
const AUTO_PROXY_DETECT_TIMEOUT_MS = 5000

/** 最近一次请求是否经代理（显式 SOCKS5 或自动探测命中），供对话窗口展示代理标识 */
let lastRequestViaProxy = false

interface RawHttpResponse {
  status: number
  body: string
}

/** 直连被服务端按地区拒绝：这类失败换成代理就有救 */
function isRegionBlocked(status: number, body: string): boolean {
  return status === 403 && REGION_BLOCK_PATTERN.test(body)
}

/** 统一的可读错误文案：地区受限给中文指引，其它情况尽量取服务端返回的 message */
function httpErrorMessage(status: number, raw: string): string {
  if (isRegionBlocked(status, raw)) return REGION_BLOCK_HINT
  let detail = ''
  try {
    const j = JSON.parse(raw)
    detail = String(j?.error?.message || '')
  } catch {
    /* 响应不是 JSON */
  }
  return `API HTTP ${status}: ${detail || raw.slice(0, 300)}`
}

/**
 * 按「显式 SOCKS5 → Electron net（跟随系统代理）→ 自动探测本机代理」的顺序发一次请求。
 *
 * 最后一级是为国内用户兜底：很多人开着 Clash / v2rayN 却没打开"系统代理"，Electron net
 * 直连出去会被 OpenAI 按地区拒绝（403 unsupported_country_region_territory）。这里自动
 * 找到本机代理端口再试一次，与 Signal 子进程的做法保持一致。
 */
async function requestWithProxyChain(
  settings: Settings,
  url: URL,
  headers: Record<string, string>,
  body: string | Buffer,
  timeoutMs: number,
  autoProxy: boolean
): Promise<RawHttpResponse> {
  const port = url.port ? parseInt(url.port, 10) : 443
  const path = url.pathname + url.search
  const socksBody = typeof body === 'string' ? body : body.toString('binary')

  // 1) 用户显式配置的 SOCKS5 优先
  const proxy = buildProxy(settings)
  if (proxy) {
    lastRequestViaProxy = true
    const res = await socks5HttpsRequest(proxy, {
      hostname: url.hostname,
      port,
      path,
      method: 'POST',
      headers,
      body: socksBody,
      timeoutMs,
    })
    return { status: res.status, body: res.body }
  }

  // 2) 未显式配置 → 先走 Electron net.request（自动遵循系统代理）
  let directError: unknown = null
  try {
    const res = await netRequest({ url: url.href, method: 'POST', headers, body, timeoutMs })
    if (!(autoProxy && isRegionBlocked(res.status, res.body))) {
      lastRequestViaProxy = false
      return { status: res.status, body: res.body }
    }
    directError = new Error(httpErrorMessage(res.status, res.body))
  } catch (e) {
    if (!autoProxy) throw e
    directError = e
  }

  // 3) 直连失败 → 自动探测本机代理再试一次
  if (settings.proxyAutoDetect === false) throw directError
  const auto = await detectLocalProxy({
    targetHost: url.hostname,
    targetPort: port,
    overallTimeoutMs: AUTO_PROXY_DETECT_TIMEOUT_MS,
  })
  if (auto) {
    const res = await socks5HttpsRequest(
      { host: auto.host, port: auto.port },
      { hostname: url.hostname, port, path, method: 'POST', headers, body: socksBody, timeoutMs }
    )
    lastRequestViaProxy = true
    return { status: res.status, body: res.body }
  }
  throw directError ?? new Error('请求失败')
}

async function openaiRequest(
  settings: Settings,
  baseUrl: string,
  path: string,
  apiKey: string,
  body: unknown,
  timeoutMs: number
): Promise<any> {
  const base = (baseUrl || 'https://api.openai.com/v1').replace(/\/+$/, '')
  const url = new URL(base + path)
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
    'User-Agent': 'multi-translator-app/0.1',
  }

  const res = await requestWithProxyChain(settings, url, headers, JSON.stringify(body), timeoutMs, true)
  if (res.status >= 400) {
    const err: OpenAIError = new Error(httpErrorMessage(res.status, res.body))
    err.status = res.status
    err.regionBlocked = isRegionBlocked(res.status, res.body)
    throw err
  }
  return parseOpenAIResponse(res.body)
}

function parseOpenAIResponse(raw: string): any {
  const json = JSON.parse(raw)
  if (json?.error) {
    const err: OpenAIError = new Error(String(json.error.message || 'OpenAI error'))
    err.status = json.error.code ? Number(json.error.code) || undefined : undefined
    throw err
  }
  return json
}

/** 目标语言代码 → 明确的中英双语名称，避免 AI 把 zh-TW 当成"无需翻译的中文"而原样返回 */
const AI_LANG_LABELS: Record<string, string> = {
  'zh-CN': '简体中文 (Simplified Chinese)',
  'zh-TW': '繁体中文 (Traditional Chinese)',
  en: '英语 (English)',
  ja: '日语 (Japanese)',
  ko: '韩语 (Korean)',
  de: '德语 (German)',
  es: '西班牙语 (Spanish)',
  ar: '阿拉伯语 (Arabic)',
  ru: '俄语 (Russian)',
  fr: '法语 (French)',
  pt: '葡萄牙语 (Portuguese)',
  it: '意大利语 (Italian)',
  th: '泰语 (Thai)',
  vi: '越南语 (Vietnamese)',
  id: '印尼语 (Indonesian)',
  tr: '土耳其语 (Turkish)',
  hi: '印地语 (Hindi)',
  nl: '荷兰语 (Dutch)',
  pl: '波兰语 (Polish)',
  uk: '乌克兰语 (Ukrainian)',
  ms: '马来语 (Malay)',
  fil: '菲律宾语 (Filipino)',
}

const aiLangLabel = (lang: string): string => AI_LANG_LABELS[lang] || lang

/** OpenAI 翻译（保留语气/俚语，支持粤语口语） */
export async function openaiTranslate(
  text: string,
  targetLang: string,
  settings: Settings,
  timeoutMs = 30000
): Promise<string> {
  requireApiKey(settings, 'openaiApiKey')
  const model = settings.openaiModel || 'gpt-4o-mini'
  const json = await openaiRequest(
    settings,
    settings.openaiBaseUrl,
    '/chat/completions',
    settings.openaiApiKey,
    {
      model,
      messages: [
        {
          role: 'system',
          content:
            '你是一个专业翻译引擎。将用户消息翻译成目标语言，保留原文语气、情绪、俚语和口语表达。' +
            '如果原文是粤语/方言口语，先转换成对应语义再翻译。' +
            '特别注意：当原文与目标语言是同一语言的不同书写形式时（如简体中文转繁体中文、繁体转简体），必须执行文字转换，不得原样返回。' +
            '只输出译文，不要解释。',
        },
        { role: 'user', content: `目标语言: ${aiLangLabel(targetLang)}\n原文: ${text}` },
      ],
      temperature: 0.3,
      max_tokens: 2048,
    },
    timeoutMs
  )
  const content: string | undefined = json?.choices?.[0]?.message?.content
  if (!content) throw new Error('OpenAI 翻译无输出')
  return content.trim()
}

export interface ReplyMessage {
  role: 'in' | 'out'
  text: string
}

/** AI 智能回复：根据最近会话生成自然回复 */
export async function generateReply(
  messages: ReplyMessage[],
  settings: Settings,
  timeoutMs = 30000
): Promise<string> {
  requireApiKey(settings, 'openaiApiKey')
  const model = settings.openaiModel || 'gpt-4o-mini'
  const history = (messages || [])
    .map((m) => `${m.role === 'in' ? '对方' : '我'}: ${m.text}`)
    .join('\n')
  const json = await openaiRequest(
    settings,
    settings.openaiBaseUrl,
    '/chat/completions',
    settings.openaiApiKey,
    {
      model,
      messages: [
        {
          role: 'system',
          content:
            '你是一个聊天助手。根据对话上下文生成一条自然、友好、简洁的回复。' +
            '直接输出回复内容，不要加引号或前缀。如果对方用中文，用中文回复；否则用英文回复。',
        },
        { role: 'user', content: `对话上下文:\n${history}` },
      ],
      temperature: 0.8,
      max_tokens: 1024,
    },
    timeoutMs
  )
  const content: string | undefined = json?.choices?.[0]?.message?.content
  if (!content) throw new Error('AI 回复无输出')
  return content.trim()
}

/** Whisper 语音识别 */
export async function speechRecognize(
  audioBase64: string,
  mime: string,
  settings: Settings,
  timeoutMs = 30000
): Promise<string> {
  requireApiKey(settings, 'sttApiKey')
  const base = (settings.sttBaseUrl || settings.openaiBaseUrl || 'https://api.openai.com/v1').replace(/\/+$/, '')
  const model = settings.sttModel || 'whisper-1'
  const ext = mime === 'audio/ogg' ? 'ogg' : mime === 'audio/mp4' || mime === 'audio/mpeg' ? 'mp3' : 'webm'
  const boundary = '----mt' + Date.now().toString(16)
  const audio = Buffer.from(audioBase64, 'base64')
  const buf = Buffer.concat([
    Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="voice.${ext}"\r\nContent-Type: ${mime}\r\n\r\n`
    ),
    audio,
    Buffer.from(`\r\n--${boundary}\r\nContent-Disposition: form-data; name="model"\r\n\r\n${model}\r\n--${boundary}--\r\n`),
  ])

  const url = new URL(base + '/audio/transcriptions')
  const headers: Record<string, string> = {
    'Content-Type': `multipart/form-data; boundary=${boundary}`,
    Authorization: `Bearer ${settings.sttApiKey}`,
  }

  // 与翻译链路共用同一套回退：显式 SOCKS5 → 系统代理 → 自动探测本机代理
  const res = await requestWithProxyChain(settings, url, headers, buf, timeoutMs, true)
  if (res.status >= 400) throw new Error(httpErrorMessage(res.status, res.body))
  const json = parseOpenAIResponse(res.body)

  const text: string | undefined = json?.text
  if (!text) throw new Error('Whisper 无转写结果')
  return text.trim()
}

/**
 * 地区受限时的补充诊断：把"代理到底能不能用"直接测出来，给出可操作结论。
 * 探测目标就用 OpenAI 自己，因此能区分「没有代理」和「有代理但出口同样被拒」。
 */
async function diagnoseRegionBlock(settings: Settings): Promise<string> {
  if (hasProxy(settings)) {
    return `（当前使用的 SOCKS5 代理 ${settings.proxyHost}:${settings.proxyPort} 出口同样被判定为不受支持，请更换节点）`
  }
  const auto = await detectLocalProxy({
    targetHost: 'api.openai.com',
    targetPort: 443,
    overallTimeoutMs: AUTO_PROXY_DETECT_TIMEOUT_MS,
  })
  if (auto) {
    return `（已自动检测到本机代理 ${auto.host}:${auto.port}（${auto.source}），但它的出口也被 OpenAI 拒绝：请在代理软件里更换节点，或把 api.openai.com 的路由规则改为走代理而不是直连）`
  }
  return '（未检测到本机可用代理，请在「设置 → OpenAI」填写 SOCKS5 代理，或打开代理软件的系统代理开关）'
}

/** 测试 OpenAI 连通性（chat/completions 最小请求，各兼容平台均支持） */
export async function testOpenAIConnection(settings: Settings): Promise<{ success: boolean; latencyMs: number; error?: string }> {
  const start = Date.now()
  try {
    requireApiKey(settings, 'openaiApiKey')
    const json = await openaiRequest(
      settings,
      settings.openaiBaseUrl,
      '/chat/completions',
      settings.openaiApiKey,
      {
        model: settings.openaiModel || 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 1,
      },
      8000
    )
    if (!json?.choices) throw new Error('响应格式异常')
    return { success: true, latencyMs: Date.now() - start }
  } catch (e: any) {
    const base = String(e?.message || e)
    // 地区受限时补一句诊断：直接说明是「没有代理」还是「代理出口同样不行」
    const error = e?.regionBlocked ? `${base} ${await diagnoseRegionBlock(settings)}` : base
    return { success: false, latencyMs: Date.now() - start, error }
  }
}

// ---------------- DeepSeek（OpenAI 兼容协议） ----------------

function requireDeepSeekKey(settings: Settings): void {
  if (!settings.deepseekApiKey) throw new Error('未配置 DeepSeek API Key')
}

/** DeepSeek 翻译（保留语气/俚语，支持粤语口语） */
export async function deepseekTranslate(
  text: string,
  targetLang: string,
  settings: Settings,
  timeoutMs = 30000
): Promise<string> {
  requireDeepSeekKey(settings)
  const model = settings.deepseekModel || 'deepseek-chat'
  const json = await openaiRequest(
    settings,
    settings.deepseekBaseUrl,
    '/chat/completions',
    settings.deepseekApiKey,
    {
      model,
      messages: [
        {
          role: 'system',
          content:
            '你是一个专业翻译引擎。将用户消息翻译成目标语言，保留原文语气、情绪、俚语和口语表达。' +
            '如果原文是粤语/方言口语，先转换成对应语义再翻译。' +
            '特别注意：当原文与目标语言是同一语言的不同书写形式时（如简体中文转繁体中文、繁体转简体），必须执行文字转换，不得原样返回。' +
            '只输出译文，不要解释。',
        },
        { role: 'user', content: `目标语言: ${aiLangLabel(targetLang)}\n原文: ${text}` },
      ],
      temperature: 0.3,
      max_tokens: 2048,
    },
    timeoutMs
  )
  const content: string | undefined = json?.choices?.[0]?.message?.content
  if (!content) throw new Error('DeepSeek 翻译无输出')
  return content.trim()
}

/** DeepSeek 智能回复 */
export async function deepseekGenerateReply(
  messages: ReplyMessage[],
  settings: Settings,
  timeoutMs = 30000
): Promise<string> {
  requireDeepSeekKey(settings)
  const model = settings.deepseekModel || 'deepseek-chat'
  const history = (messages || [])
    .map((m) => `${m.role === 'in' ? '对方' : '我'}: ${m.text}`)
    .join('\n')
  const json = await openaiRequest(
    settings,
    settings.deepseekBaseUrl,
    '/chat/completions',
    settings.deepseekApiKey,
    {
      model,
      messages: [
        {
          role: 'system',
          content:
            '你是一个聊天助手。根据对话上下文生成一条自然、友好、简洁的回复。' +
            '直接输出回复内容，不要加引号或前缀。如果对方用中文，用中文回复；否则用英文回复。',
        },
        { role: 'user', content: `对话上下文:\n${history}` },
      ],
      temperature: 0.8,
      max_tokens: 1024,
    },
    timeoutMs
  )
  const content: string | undefined = json?.choices?.[0]?.message?.content
  if (!content) throw new Error('AI 回复无输出')
  return content.trim()
}

/** 测试 DeepSeek 连通性（chat/completions 最小请求） */
export async function testDeepSeekConnection(settings: Settings): Promise<{ success: boolean; latencyMs: number; error?: string }> {
  const start = Date.now()
  try {
    requireDeepSeekKey(settings)
    const json = await openaiRequest(
      settings,
      settings.deepseekBaseUrl,
      '/chat/completions',
      settings.deepseekApiKey,
      {
        model: settings.deepseekModel || 'deepseek-chat',
        messages: [{ role: 'user', content: 'ping' }],
        max_tokens: 1,
      },
      8000
    )
    if (!json?.choices) throw new Error('响应格式异常')
    return { success: true, latencyMs: Date.now() - start }
  } catch (e: any) {
    return { success: false, latencyMs: Date.now() - start, error: String(e?.message || e) }
  }
}

// ---------------- 对话窗口（OpenAI 对话按钮） ----------------

/** 对话窗口渲染层发来的消息：{ role, text, image } 与 { role, content } 两种字段名都要认 */
export interface ChatMessageIn {
  role?: string
  content?: string
  text?: string
  image?: string | null
}

/**
 * 规范成 chat/completions 的 messages：
 * - 带图（dataUrl）时用 vision 的多段 content；
 * - 纯文本消息用字符串 content，兼容所有 OpenAI 协议服务。
 */
function toOpenAIChatMessages(messages: ChatMessageIn[]): Array<{ role: string; content: string | Array<Record<string, unknown>> }> {
  const out: Array<{ role: string; content: string | Array<Record<string, unknown>> }> = []
  for (const m of messages) {
    const role = m.role === 'assistant' ? 'assistant' : 'user'
    const text = String(
      typeof m.content === 'string' && m.content.trim() ? m.content : m.text || ''
    ).trim()
    const image = typeof m.image === 'string' && /^data:image\//i.test(m.image) ? m.image : ''
    if (image) {
      const parts: Array<Record<string, unknown>> = []
      if (text) parts.push({ type: 'text', text })
      parts.push({ type: 'image_url', image_url: { url: image } })
      out.push({ role, content: parts })
      continue
    }
    if (text) out.push({ role, content: text })
  }
  return out
}

/** OpenAI 对话：多轮上下文 + 可选图片（vision），走 SOCKS5 代理或系统代理 */
export async function openaiChat(
  messages: ChatMessageIn[],
  settings: Settings,
  timeoutMs = 60000
): Promise<{ content: string; model: string; viaProxy: boolean }> {
  requireApiKey(settings, 'openaiApiKey')
  const model = settings.openaiModel || 'gpt-4o-mini'
  const cleaned = toOpenAIChatMessages(messages)
  if (!cleaned.length) throw new Error('消息内容为空，请输入要发送的文字')
  const json = await openaiRequest(
    settings,
    settings.openaiBaseUrl,
    '/chat/completions',
    settings.openaiApiKey,
    { model, messages: cleaned, stream: false, temperature: 0.7, max_tokens: 2048 },
    timeoutMs
  )
  const content: string | undefined = json?.choices?.[0]?.message?.content
  if (!content) throw new Error('OpenAI 返回为空')
  // 实际是否走了代理（含自动探测到的本机代理），供对话窗口显示代理标识
  return { content, model, viaProxy: lastRequestViaProxy }
}
