/**
 * 手写 SOCKS5 客户端，支持 IPv4 / IPv6 / 域名 与用户名密码认证。
 * 用法：向 http(s).request 传入 createSocks5Agent() 得到的代理即可。
 */
import { Socks5 } from './socks5-impl'

export interface Socks5Config {
  host: string
  port: number
  username?: string
  password?: string
}

/**
 * 通过 SOCKS5 代理发起 HTTPS 请求并返回响应文本。
 * 内部流程：握手 → 认证 → CONNECT → TLS → HTTP/1.1。
 * 保持与 Node https 请求一致的双向字节流语义，简化实现为一次性请求。
 */
export async function socks5HttpsRequest(
  proxy: Socks5Config,
  options: {
    hostname: string
    port?: number
    path?: string
    method?: string
    headers?: Record<string, string>
    body?: string
    timeoutMs?: number
  }
): Promise<{ status: number; headers: Record<string, string>; body: string }> {
  const client = new Socks5(proxy)
  try {
    await client.connect({
      hostname: options.hostname,
      port: options.port ?? 443,
    })
    return await client.httpsRequest({
      path: options.path ?? '/',
      method: options.method ?? 'GET',
      headers: options.headers ?? {},
      body: options.body,
      timeoutMs: options.timeoutMs ?? 15000,
    })
  } finally {
    client.close()
  }
}

/** 测试代理连通性 */
export async function testSocks5Proxy(proxy: Socks5Config): Promise<{ success: boolean; error?: string }> {
  const client = new Socks5(proxy)
  try {
    await client.connect({ hostname: 'www.google.com', port: 443 })
    client.close()
    return { success: true }
  } catch (e: any) {
    client.close()
    return { success: false, error: String(e?.message || e) }
  } finally {
    client.close()
  }
}
