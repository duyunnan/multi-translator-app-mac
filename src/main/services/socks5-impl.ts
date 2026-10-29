/**
 * SOCKS5 协议实现（握手 / 认证 / CONNECT + TLS + HTTP/1.1 请求）。
 * 参考 RFC 1928 / RFC 1929。
 */
import { connect, Socket } from 'net'
import { TLSSocket } from 'tls'

export interface Socks5ProxyConfig {
  host: string
  port: number
  username?: string
  password?: string
}

export interface ConnectTarget {
  hostname: string
  port: number
}

const ATYP_IPV4 = 0x01
const ATYP_DOMAIN = 0x03
const ATYP_IPV6 = 0x04

export class Socks5 {
  private socket: Socket | null = null
  private tlsSocket: TLSSocket | null = null
  private proxy: Socks5ProxyConfig
  private sni = ''
  /** 上次 read 未消费完的残留字节（代理可能一次返回超过请求长度的数据） */
  private readBuf: Buffer<ArrayBufferLike> = Buffer.alloc(0)

  constructor(proxy: Socks5ProxyConfig) {
    this.proxy = proxy
  }

  async connect(target: ConnectTarget): Promise<void> {
    const { host, port, username, password } = this.proxy
    this.sni = target.hostname
    const sock = connect({ host, port })
    this.socket = sock
    sock.setNoDelay(true)
    sock.setTimeout(15000)

    await new Promise<void>((resolve, reject) => {
      // 覆盖 TCP connecting 阶段：黑洞端口/防火墙丢包时 socket idle 超时不生效，必须手动强制超时
      const timer = setTimeout(() => {
        sock.destroy()
        reject(new Error('SOCKS5 connect timeout'))
      }, 15000)
      sock.once('connect', () => {
        clearTimeout(timer)
        resolve()
      })
      sock.once('error', (err) => {
        clearTimeout(timer)
        reject(err)
      })
      sock.once('timeout', () => {
        clearTimeout(timer)
        reject(new Error('SOCKS5 connect timeout'))
      })
    })

    // 1) 握手：提议匿名 + 用户名密码两种方式
    const hasAuth = !!username
    const methods = hasAuth ? [0x00, 0x02] : [0x00]
    sock.write(Buffer.from([0x05, methods.length, ...methods]))
    const methodResp = await this.read(2)
    if (methodResp[0] !== 0x05) throw new Error('SOCKS5: invalid version')
    if (methodResp[1] === 0xff) throw new Error('SOCKS5: no acceptable auth method')

    // 2) 认证（RFC 1929）
    if (methodResp[1] === 0x02) {
      if (!username) throw new Error('SOCKS5: server requires auth but no credentials')
      const u = Buffer.from(username, 'utf-8')
      const p = Buffer.from(password || '', 'utf-8')
      if (u.length > 255 || p.length > 255) throw new Error('SOCKS5: credentials too long')
      sock.write(Buffer.concat([Buffer.from([0x01, u.length]), u, Buffer.from([p.length]), p]))
      const authResp = await this.read(2)
      if (authResp[1] !== 0x00) throw new Error('SOCKS5: auth failed')
    }

    // 3) CONNECT
    const hostBuf = encodeHost(target.hostname)
    const portBuf = Buffer.from([(target.port >> 8) & 0xff, target.port & 0xff])
    sock.write(Buffer.concat([Buffer.from([0x05, 0x01, 0x00]), hostBuf, portBuf]))
    const connResp = await this.read(4)
    if (connResp[0] !== 0x05 || connResp[1] !== 0x00) {
      throw new Error(`SOCKS5: connect failed (rep=${connResp[1]})`)
    }
    // 读取响应中的地址部分
    await this.readReplyAddress(connResp[3])
  }

  private async readReplyAddress(atyp: number): Promise<void> {
    const sock = this.socket!
    switch (atyp) {
      case ATYP_IPV4:
        await this.read(4)
        break
      case ATYP_IPV6:
        await this.read(16)
        break
      case ATYP_DOMAIN: {
        const lenBuf = await this.read(1)
        await this.read(lenBuf[0])
        break
      }
      default:
        throw new Error('SOCKS5: unknown reply ATYP ' + atyp)
    }
    await this.read(2) // port
  }

  private read(n: number): Promise<Buffer> {
    const sock = this.socket!
    return new Promise((resolve, reject) => {
      const onData = (chunk: Buffer) => {
        this.readBuf =
          this.readBuf.length === 0 ? chunk : Buffer.concat([this.readBuf, chunk])
        tryConsume()
      }
      const onError = (err: Error) => {
        cleanup()
        reject(err)
      }
      const onTimeout = () => {
        cleanup()
        reject(new Error('SOCKS5 read timeout'))
      }
      const cleanup = () => {
        sock.removeListener('data', onData)
        sock.removeListener('error', onError)
        sock.removeListener('timeout', onTimeout)
      }
      // 先尝试消费上一次残留的字节（代理可能一次返回超过请求长度的数据）
      const tryConsume = (): boolean => {
        if (this.readBuf.length < n) return false
        const out = this.readBuf.subarray(0, n)
        this.readBuf = this.readBuf.subarray(n)
        cleanup()
        resolve(out)
        return true
      }
      if (tryConsume()) return
      sock.on('data', onData)
      sock.on('error', onError)
      sock.on('timeout', onTimeout)
    })
  }

  async httpsRequest(options: {
    path: string
    method: string
    headers: Record<string, string>
    body?: string
    timeoutMs: number
  }): Promise<{ status: number; headers: Record<string, string>; body: string }> {
    const raw = this.socket!
    const tlsMod = await import('tls')
    const tlsSock = tlsMod.connect({ socket: raw, servername: this.sni })
    this.tlsSocket = tlsSock
    tlsSock.setTimeout(options.timeoutMs)

    await new Promise<void>((resolve, reject) => {
      tlsSock.once('secureConnect', resolve)
      tlsSock.once('error', reject)
      tlsSock.once('timeout', () => reject(new Error('TLS handshake timeout')))
    })

    const head =
      `${options.method} ${options.path} HTTP/1.1\r\n` +
      `Host: ${this.sni}\r\n` +
      `Connection: close\r\n` +
      Object.entries(options.headers)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\r\n') +
      (options.body ? `\r\nContent-Length: ${Buffer.byteLength(options.body)}` : '') +
      '\r\n\r\n' +
      (options.body || '')

    tlsSock.write(head)

    return await new Promise<{ status: number; headers: Record<string, string>; body: string }>(
      (resolve, reject) => {
        let data = ''
        const onData = (chunk: Buffer) => {
          data += chunk.toString('utf-8')
        }
        const onEnd = () => {
          cleanup()
          try {
            resolve(parseHttpResponse(data))
          } catch (e) {
            reject(e)
          }
        }
        const onError = (err: Error) => {
          cleanup()
          reject(err)
        }
        const onTimeout = () => {
          cleanup()
          reject(new Error('HTTP request timeout'))
        }
        const cleanup = () => {
          tlsSock.removeListener('data', onData)
          tlsSock.removeListener('end', onEnd)
          tlsSock.removeListener('error', onError)
          tlsSock.removeListener('timeout', onTimeout)
        }
        tlsSock.on('data', onData)
        tlsSock.on('end', onEnd)
        tlsSock.on('error', onError)
        tlsSock.on('timeout', onTimeout)
      }
    )
  }

  close(): void {
    try {
      this.tlsSocket?.destroy()
    } catch {
      /* ignore */
    }
    try {
      this.socket?.destroy()
    } catch {
      /* ignore */
    }
  }
}

function encodeHost(hostname: string): Buffer {
  const ipv4 = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (ipv4) {
    const bytes = ipv4.slice(1).map((n) => parseInt(n, 10) & 0xff)
    return Buffer.concat([Buffer.from([ATYP_IPV4]), Buffer.from(bytes)])
  }
  if (hostname.includes(':')) {
    const buf = Buffer.alloc(16)
    const parts = expandIpv6(hostname)
    parts.forEach((v, i) => buf.writeUInt8(v, i))
    return Buffer.concat([Buffer.from([ATYP_IPV6]), buf])
  }
  const d = Buffer.from(hostname, 'utf-8')
  if (d.length > 255) throw new Error('SOCKS5: domain too long')
  return Buffer.concat([Buffer.from([ATYP_DOMAIN, d.length]), d])
}

function expandIpv6(addr: string): number[] {
  let head: string[] = []
  let tail: string[] = []
  if (addr.includes('::')) {
    const [h, t] = addr.split('::')
    head = h ? h.split(':') : []
    tail = t ? t.split(':') : []
  } else {
    head = addr.split(':')
  }
  const missing = 8 - head.length - tail.length
  if (missing < 0) throw new Error('SOCKS5: invalid IPv6 address')
  const parts = [...head, ...Array(missing).fill('0'), ...tail]
  const bytes: number[] = []
  for (const part of parts) {
    const v = parseInt(part || '0', 16)
    bytes.push((v >> 8) & 0xff, v & 0xff)
  }
  return bytes
}

function parseHttpResponse(raw: string): { status: number; headers: Record<string, string>; body: string } {
  const idx = raw.indexOf('\r\n\r\n')
  if (idx < 0) throw new Error('Invalid HTTP response (no header separator)')
  const headPart = raw.substring(0, idx)
  let body = raw.substring(idx + 4)
  // HTTP/1.1 分块传输编码需手动解码（Node https 直连会自动解，自研 SOCKS5 通道必须自己解）
  if (/transfer-encoding:\s*chunked/i.test(headPart)) {
    body = decodeChunked(body)
  }
  const lines = headPart.split('\r\n')
  const statusLine = lines[0].split(' ')
  const status = parseInt(statusLine[1], 10)
  const headers: Record<string, string> = {}
  for (let i = 1; i < lines.length; i++) {
    const m = lines[i].match(/^([^:]+):\s*(.*)$/)
    if (m) headers[m[1].toLowerCase()] = m[2]
  }
  return { status, headers, body }
}

/** 解码 HTTP/1.1 chunked 传输编码（支持 chunk 扩展名如 1a;name=value） */
function decodeChunked(raw: string): string {
  let rest = raw
  let out = ''
  for (;;) {
    const lineEnd = rest.indexOf('\r\n')
    if (lineEnd < 0) break
    const sizeStr = rest.substring(0, lineEnd).split(';')[0].trim()
    const size = parseInt(sizeStr, 16)
    if (!Number.isFinite(size) || size < 0) break
    rest = rest.substring(lineEnd + 2)
    if (size === 0) break
    out += rest.substring(0, size)
    rest = rest.substring(size + 2)
  }
  return out
}
