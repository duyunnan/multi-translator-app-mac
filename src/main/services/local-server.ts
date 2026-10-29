/**
 * 本地 HTTP 翻译服务器（127.0.0.1:17890，备用 17891）。
 * 供 Signal 子进程内部渲染层调用（Signal 无法使用 Electron IPC）。
 *
 * 端点：
 *   POST /translate        { text, targetLang }        -> { success, translated, error }
 *   POST /generate-reply   { messages, context }       -> { success, reply, error }
 *   GET  /health                                       -> { ok: true }
 */
import { createServer, type Server, type IncomingMessage, type ServerResponse } from 'http'
import { doTranslate, doGenerateReply } from './translator'
import { store } from './store'

const DEFAULT_PORT = 17890
const FALLBACK_PORT = 17891

let server: Server | null = null
let currentPort = 0

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = ''
    const limit = setTimeout(() => {
      req.destroy()
      reject(new Error('body too large'))
    }, 15000)
    req.on('data', (chunk) => (data += chunk))
    req.on('end', () => {
      clearTimeout(limit)
      resolve(data)
    })
    req.on('error', reject)
  })
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function json(res: ServerResponse, code: number, obj: unknown): void {
  const body = JSON.stringify(obj)
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    ...CORS_HEADERS,
    'Content-Length': Buffer.byteLength(body),
  })
  res.end(body)
}

async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    const url = new URL(req.url || '/', 'http://127.0.0.1')
    const path = url.pathname

    // CORS 预检：Signal 渲染层是 file:// 页面（Origin: null），向本服务发
    // Content-Type: application/json 的 POST 属非简单请求，浏览器会先发 OPTIONS。
    // 若不应答（或应答里缺 Allow-Methods / Allow-Headers），浏览器会直接抛
    // TypeError: Failed to fetch，真实请求根本发不出去——界面表现为「回车翻译失败」。
    if (req.method === 'OPTIONS') {
      res.writeHead(204, { ...CORS_HEADERS, 'Access-Control-Max-Age': '86400' })
      res.end()
      return
    }

    if (req.method === 'GET' && path === '/health') {
      json(res, 200, { ok: true })
      return
    }

    if (req.method === 'POST' && path === '/translate') {
      const body = JSON.parse(await readBody(req))
      const text = String(body.text || '')
      if (!text) return json(res, 400, { success: false, error: 'empty text' })
      const settings = store.getSettings()
      const result = await doTranslate(text, body.targetLang || settings.defaultTargetLang, settings)
      if (result.success) {
        json(res, 200, { success: true, translated: result.translated })
      } else {
        json(res, 200, { success: false, error: result.error })
      }
      return
    }

    if (req.method === 'POST' && path === '/generate-reply') {
      const body = JSON.parse(await readBody(req))
      const messages = Array.isArray(body.messages) ? body.messages : []
      const settings = store.getSettings()
      const result = await doGenerateReply(messages, settings)
      if (result.success) {
        json(res, 200, { success: true, reply: result.reply })
      } else {
        json(res, 200, { success: false, error: result.error })
      }
      return
    }

    json(res, 404, { success: false, error: 'not found' })
  } catch (e: any) {
    json(res, 500, { success: false, error: String(e?.message || e) })
  }
}

export async function startLocalServer(): Promise<{ port: number }> {
  if (server) return { port: currentPort }

  const srv = createServer(handler)
  try {
    await new Promise<void>((resolve, reject) => {
      srv.once('error', reject)
      srv.listen(DEFAULT_PORT, '127.0.0.1', () => resolve())
    })
    currentPort = DEFAULT_PORT
  } catch {
    await new Promise<void>((resolve, reject) => {
      srv.once('error', reject)
      srv.listen(FALLBACK_PORT, '127.0.0.1', () => resolve())
    })
    currentPort = FALLBACK_PORT
  }
  server = srv
  console.log(`[local-server] listening on 127.0.0.1:${currentPort}`)
  return { port: currentPort }
}

export function getServerStatus(): { running: boolean; port: number } {
  return { running: !!server, port: currentPort }
}

export function stopLocalServer(): void {
  if (server) {
    server.close()
    server = null
    currentPort = 0
  }
}
