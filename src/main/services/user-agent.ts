/**
 * 纯净桌面 Chrome UA（不含 Electron / 应用名标识）。
 *
 * 为什么需要：FB/Messenger 会把带 Electron 标识的 UA 判为可疑环境并拒绝长连接，
 * 表现为「能登录但消息一直加载中 / SSL 握手失败」；worker（E2EE 的 SharedWorker）
 * 与 WebSocket 握手既不继承 webview 的 useragent 属性，也不经过
 * onBeforeSendHeaders，只吃 session 默认 UA / app.userAgentFallback。
 *
 * 为什么必须跟着真实平台走：UA 里的系统标识一旦和 Electron 实际运行平台不一致
 * （在 mac 上继续报 Windows NT），UA 与 navigator.platform / Sec-CH-UA 就会自相
 * 矛盾，反而是更明显的可疑信号。这里按 process.platform 生成对应平台 Chrome UA，
 * Windows 分支输出的字符串与历史实现逐字一致。
 *
 * @param chromeVersion 覆盖 Chromium 版本（个别调用点历史上锁了旧版本号）
 */
export function desktopChromeUA(chromeVersion?: string): string {
  const cv = chromeVersion || process.versions.chrome || '134.0.0.0'
  const tail = `AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${cv} Safari/537.36`
  switch (process.platform) {
    case 'darwin':
      return `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ${tail}`
    case 'linux':
      return `Mozilla/5.0 (X11; Linux x86_64) ${tail}`
    default:
      return `Mozilla/5.0 (Windows NT 10.0; Win64; x64) ${tail}`
  }
}
