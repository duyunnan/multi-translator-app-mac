/**
 * 基于 Electron net.request（Chromium 网络栈）的通用 HTTPS 请求封装。
 *
 * 与 Node https.request 的关键区别：
 *  - 自动遵循系统代理（Windows 系统代理 / V2Ray / Clash 等设置了系统代理时，
 *    无需在应用内显式配置代理即可正常访问 Google 等被墙服务）
 *  - 自动解压 gzip/br
 *
 * 仅限 Electron 主进程使用（net 模块）。
 */
import { net } from 'electron'

export interface NetRequestOptions {
  url: string
  method?: string
  headers?: Record<string, string>
  body?: string | Buffer
  timeoutMs?: number
}

export interface NetRequestResult {
  status: number
  headers: Record<string, string>
  body: string
}

export function netRequest(options: NetRequestOptions): Promise<NetRequestResult> {
  return new Promise((resolve, reject) => {
    let settled = false
    let timer: NodeJS.Timeout | undefined
    const finish = (fn: () => void) => {
      if (settled) return
      settled = true
      if (timer) clearTimeout(timer)
      fn()
    }

    let req: Electron.ClientRequest
    try {
      req = net.request({ method: options.method ?? 'GET', url: options.url })
    } catch (e) {
      reject(e)
      return
    }

    // Chromium 不允许手动设置以下头（会报 net::ERR_INVALID_ARGUMENT），必须跳过
    const RESERVED_HEADERS = new Set([
      'content-length',
      'host',
      'connection',
      'transfer-encoding',
      'expect',
      'upgrade',
      'keep-alive',
      'proxy-authorization',
    ])
    for (const [k, v] of Object.entries(options.headers ?? {})) {
      if (RESERVED_HEADERS.has(k.toLowerCase())) continue
      try {
        req.setHeader(k, v)
      } catch {
        // 忽略非法头
      }
    }

    // Content-Length 由 Chromium 在 write() 时自动计算，无需（也不能）手动设置
    const rawBody =
      options.body == null ? undefined : Buffer.isBuffer(options.body) ? options.body : Buffer.from(options.body)

    req.on('response', (response) => {
      const status = response.statusCode ?? 0
      const headers: Record<string, string> = {}
      for (const [k, v] of Object.entries(response.headers ?? {})) {
        headers[k] = Array.isArray(v) ? v.join(', ') : String(v)
      }
      const chunks: Buffer[] = []
      response.on('data', (chunk) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
      })
      response.on('end', () =>
        finish(() => resolve({ status, headers, body: Buffer.concat(chunks).toString('utf8') }))
      )
      response.on('error', (e) => finish(() => reject(e)))
      response.on('aborted', () => finish(() => reject(new Error('request aborted'))))
    })
    req.on('error', (e) => finish(() => reject(e)))

    if (options.timeoutMs && options.timeoutMs > 0) {
      timer = setTimeout(() => {
        finish(() => {
          try {
            req.abort()
          } catch {
            // 忽略
          }
          reject(new Error('request timeout'))
        })
      }, options.timeoutMs)
    }

    try {
      if (rawBody) req.write(rawBody)
      req.end()
    } catch (e) {
      finish(() => reject(e))
    }
  })
}
