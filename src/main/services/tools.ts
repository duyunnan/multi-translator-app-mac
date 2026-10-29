/**
 * 工具窗口服务：美国之音 (VOA)、天气、DeepSeek 对话
 * - 顶部工具栏按钮 → 打开独立工具窗口（贴主窗口右侧，一次只保留一个工具窗口）
 * - 每个工具窗口加载本地 shell 页面（out/renderer/*.html），通过独立 preload 桥与主进程通信
 */
import { app, BrowserWindow, ipcMain, screen, WebContentsView } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { logDebug } from './debug-log'
import { store } from './store'
import { hasProxy, openaiChat, type ChatMessageIn } from './translator/openai'
import type { Settings } from '../../shared/types'

/** 对话窗口的服务商：DeepSeek / OpenAI，两者共用同一套对话页面与 IPC */
type ChatProvider = 'deepseek' | 'openai'

function normalizeChatProvider(v: unknown): ChatProvider {
  return v === 'openai' ? 'openai' : 'deepseek'
}

// ---------------------------------------------------------------------------
// 常量
// ---------------------------------------------------------------------------

const NEWS_HOME_URL = 'https://www.voachinese.com/'
const NEWS_ALLOW_DOMAINS = ['voanews.com', 'voachinese.com', 'voacantonese.com']

/** 常用城市（美/中为主）：key/zh/en/lat/lon/timezone */
const COMMON_CITIES: Array<WeatherCity> = [
  { key: 'new-york', zh: '纽约', en: 'New York', lat: 40.7128, lon: -74.006, timezone: 'America/New_York' },
  { key: 'los-angeles', zh: '洛杉矶', en: 'Los Angeles', lat: 34.0522, lon: -118.2437, timezone: 'America/Los_Angeles' },
  { key: 'chicago', zh: '芝加哥', en: 'Chicago', lat: 41.8781, lon: -87.6298, timezone: 'America/Chicago' },
  { key: 'houston', zh: '休斯敦', en: 'Houston', lat: 29.7604, lon: -95.3698, timezone: 'America/Chicago' },
  { key: 'seattle', zh: '西雅图', en: 'Seattle', lat: 47.6062, lon: -122.3321, timezone: 'America/Los_Angeles' },
  { key: 'san-francisco', zh: '旧金山', en: 'San Francisco', lat: 37.7749, lon: -122.4194, timezone: 'America/Los_Angeles' },
  { key: 'washington', zh: '华盛顿', en: 'Washington D.C.', lat: 38.9072, lon: -77.0369, timezone: 'America/New_York' },
  { key: 'boston', zh: '波士顿', en: 'Boston', lat: 42.3601, lon: -71.0589, timezone: 'America/New_York' },
  { key: 'miami', zh: '迈阿密', en: 'Miami', lat: 25.7617, lon: -80.1918, timezone: 'America/New_York' },
  { key: 'atlanta', zh: '亚特兰大', en: 'Atlanta', lat: 33.749, lon: -84.388, timezone: 'America/New_York' },
  { key: 'beijing', zh: '北京', en: 'Beijing', lat: 39.9042, lon: 116.4074, timezone: 'Asia/Shanghai' },
  { key: 'shanghai', zh: '上海', en: 'Shanghai', lat: 31.2304, lon: 121.4737, timezone: 'Asia/Shanghai' },
  { key: 'guangzhou', zh: '广州', en: 'Guangzhou', lat: 23.1291, lon: 113.2644, timezone: 'Asia/Shanghai' },
  { key: 'shenzhen', zh: '深圳', en: 'Shenzhen', lat: 22.5431, lon: 114.0579, timezone: 'Asia/Shanghai' },
  { key: 'hong-kong', zh: '香港', en: 'Hong Kong', lat: 22.3193, lon: 114.1694, timezone: 'Asia/Hong_Kong' },
  { key: 'london', zh: '伦敦', en: 'London', lat: 51.5074, lon: -0.1278, timezone: 'Europe/London' },
  { key: 'paris', zh: '巴黎', en: 'Paris', lat: 48.8566, lon: 2.3522, timezone: 'Europe/Paris' },
  { key: 'tokyo', zh: '东京', en: 'Tokyo', lat: 35.6762, lon: 139.6503, timezone: 'Asia/Tokyo' },
]

/** WMO weather_code → 中文天气 */
const WMO_ZH: Record<number, string> = {
  0: '晴', 1: '基本晴朗', 2: '局部多云', 3: '阴', 45: '雾', 48: '雾凇',
  51: '小毛毛雨', 53: '毛毛雨', 55: '大毛毛雨', 56: '冻毛毛雨', 57: '强冻毛毛雨',
  61: '小雨', 63: '中雨', 65: '大雨', 66: '冻雨', 67: '强冻雨',
  71: '小雪', 73: '中雪', 75: '大雪', 77: '雪粒',
  80: '小阵雨', 81: '阵雨', 82: '强阵雨', 85: '小阵雪', 86: '强阵雪',
  95: '雷暴', 96: '雷暴伴冰雹', 99: '强雷暴伴冰雹',
}

// ---------------------------------------------------------------------------
// 窗口单例
// ---------------------------------------------------------------------------

let newsWindow: BrowserWindow | null = null
let newsView: WebContentsView | null = null
let weatherWindow: BrowserWindow | null = null
/** 对话窗口按服务商各保留一个（DeepSeek / OpenAI 可同时存在） */
const chatWindows: Record<ChatProvider, BrowserWindow | null> = { deepseek: null, openai: null }

/** 主窗口引用：由 app.ts 注入 */
let getMainWindow: () => BrowserWindow | null = () => null
export function setToolsMainWindowGetter(fn: () => BrowserWindow | null): void {
  getMainWindow = fn
}

function toolIconPath(): string {
  return app.isPackaged
    ? join(process.resourcesPath, 'icon_32.png')
    : join(__dirname, '../../build/icon_32.png')
}

/** 工具窗口页面地址：dev 走 vite dev server（public 根），生产走 out/renderer */
function toolPageUrl(file: string): string {
  const dev = process.env['ELECTRON_RENDERER_URL']
  return dev ? `${dev.replace(/\/+$/, '')}/${file}` : join(__dirname, '../renderer', file)
}

function preloadPath(file: string): string {
  return join(__dirname, '../preload', file)
}

/** 关闭除 mainWindow 与 keepWin 之外的所有工具窗口 */
function closeSideToolsExcept(keepWin: BrowserWindow | null): void {
  for (const win of [newsWindow, weatherWindow, chatWindows.deepseek, chatWindows.openai]) {
    if (win && win !== keepWin && !win.isDestroyed()) win.close()
  }
}

/**
 * 贴主窗口右侧的窗口 bounds：x 紧贴主窗口右缘（0 缝隙），y / 高度与主窗口完全一致。
 * 主窗口贴近屏幕右缘放不下时，自动贴到主窗口左侧。
 */
function boundsBesideMain(width: number): { x: number; y: number; width: number; height: number } {
  const main = getMainWindow()
  const mainBounds = main?.getBounds()
  const { workArea } = screen.getDisplayNearestPoint(
    mainBounds ? { x: mainBounds.x, y: mainBounds.y } : { x: 0, y: 0 }
  )
  const mw = mainBounds?.width ?? 1280
  const mx = mainBounds?.x ?? 0
  const my = mainBounds?.y ?? 0
  const mh = mainBounds?.height ?? 800
  let x = mx + mw
  if (x + width > workArea.x + workArea.width && mx - width >= workArea.x) {
    // 主窗口已贴近屏幕右缘 → 放到主窗口左侧
    x = mx - width
  }
  if (x < workArea.x) x = workArea.x
  return { x, y: my, width, height: mh }
}

// ---------------------------------------------------------------------------
// 工具窗口贴靠跟随主窗口（参考安装版行为）
// ---------------------------------------------------------------------------

/**
 * 把工具窗口重新贴到主窗口右缘（0 缝隙、上下沿与主窗口对齐）。
 * 主窗口最大化 / 全屏时不挪动，避免工具窗口被推出屏幕。
 */
function positionToolBesideMain(win: BrowserWindow): void {
  if (!win || win.isDestroyed()) return
  const main = getMainWindow()
  if (!main || main.isDestroyed()) return
  if (main.isMinimized() || main.isMaximized() || main.isFullScreen()) return
  if (win.isMinimized()) return
  const b = boundsBesideMain(win.getBounds().width)
  try {
    win.setBounds(b, false)
  } catch {
    /* ignore */
  }
}

/**
 * 让工具窗口像安装版那样与主窗口“钉”在一起：
 * - 主窗口被拖动 / 缩放时，工具窗口实时紧贴其右缘同步移动（无防抖，
 *   直接 setBounds，拖动主窗口非常顺畅）；
 * - 手动拖走工具窗口后，主窗口下一次移动会把它重新吸回右缘。
 */
function attachToolFollow(win: BrowserWindow): void {
  const main = getMainWindow()
  if (!main || main.isDestroyed()) return
  // 最近一次主窗口拖动/缩放的时刻：用来区分“拖动主窗时被系统连带最小化”与“用户主动最小化工具窗”
  let mainMovedAt = 0
  const reposition = (): void => {
    mainMovedAt = Date.now()
    try {
      positionToolBesideMain(win)
    } catch {
      /* ignore */
    }
  }
  main.on('move', reposition)
  main.on('moved', reposition)
  main.on('resize', reposition)
  main.on('maximize', reposition)
  main.on('unmaximize', () => setTimeout(reposition, 120))
  // Windows 在拖动主窗口标题栏并快速晃动时（Aero Shake）会把其它窗口一起最小化，
  // 导致贴着主窗的工具窗口“自动消失”。这里加护栏：主窗刚拖动过/正在拖动时
  // 工具窗若被最小化，自动还原并重新贴回右缘；用户手动最小化工具窗则不做干预。
  const onWinMinimize = (): void => {
    if (Date.now() - mainMovedAt > 1500) return
    setTimeout(() => {
      try {
        if (!win || win.isDestroyed() || !win.isMinimized()) return
        const m = getMainWindow()
        if (!m || m.isDestroyed() || m.isMinimized() || m.isMaximized() || m.isFullScreen()) return
        win.restore()
        positionToolBesideMain(win)
      } catch {
        /* ignore */
      }
    }, 250)
  }
  win.on('minimize', onWinMinimize)
  const detach = (): void => {
    main.removeListener('move', reposition)
    main.removeListener('moved', reposition)
    main.removeListener('resize', reposition)
    main.removeListener('maximize', reposition)
    win.removeListener('minimize', onWinMinimize)
    win.removeListener('closed', detach)
  }
  win.on('closed', detach)
}

// ---------------------------------------------------------------------------
// 通用工具
// ---------------------------------------------------------------------------

/** 天气置顶持久化：userData/tools-state.json */
interface ToolsState {
  weatherPinnedCity?: WeatherCity | null
}
interface WeatherCity {
  key: string
  zh: string
  en: string
  lat: number
  lon: number
  timezone: string
}

function toolsStateFile(): string {
  return join(app.getPath('userData'), 'tools-state.json')
}
function loadToolsState(): ToolsState {
  try {
    return JSON.parse(readFileSync(toolsStateFile(), 'utf8')) as ToolsState
  } catch {
    return {}
  }
}
function saveToolsState(state: ToolsState): void {
  try {
    mkdirSync(app.getPath('userData'), { recursive: true })
    writeFileSync(toolsStateFile(), JSON.stringify(state, null, 2), 'utf8')
  } catch {
    /* ignore */
  }
}

/** HTTP GET JSON（直连，15s 超时） */
async function fetchJson(url: string, timeoutMs = 15000): Promise<unknown> {
  const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return (await res.json()) as unknown
}

// ---------------------------------------------------------------------------
// 天气
// ---------------------------------------------------------------------------

/** 从载荷解析城市：预设 key / 坐标 / 名称搜索 */
async function resolveWeatherCity(payload: Record<string, unknown>): Promise<WeatherCity> {
  const key = typeof payload.key === 'string' ? payload.key : ''
  if (key) {
    const hit = COMMON_CITIES.find((c) => c.key === key)
    if (hit) return hit
  }
  const lat = Number(payload.lat)
  const lon = Number(payload.lon)
  if (Number.isFinite(lat) && Number.isFinite(lon)) {
    const zh = typeof payload.zh === 'string' ? payload.zh : ''
    const en = typeof payload.en === 'string' ? payload.en : ''
    return {
      key: `${Math.round(lat * 100)},${Math.round(lon * 100)}`,
      zh,
      en,
      lat,
      lon,
      timezone: typeof payload.timezone === 'string' && payload.timezone ? payload.timezone : 'auto',
    }
  }
  // 名称搜索 → open-meteo geocoding
  const q = typeof payload.query === 'string' && payload.query.trim() ? payload.query.trim() : ''
  if (q) {
    const g = (await fetchJson(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=en&format=json`
    )) as { results?: Array<{ latitude: number; longitude: number; name: string; country?: string; admin1?: string }> }
    const r = g.results?.[0]
    if (r) {
      return {
        key: `geo-${Math.round(r.latitude * 100)},${Math.round(r.longitude * 100)}`,
        zh: q,
        en: r.name || q,
        lat: r.latitude,
        lon: r.longitude,
        timezone: 'auto',
      }
    }
    throw new Error(`未找到城市：${q}`)
  }
  // 兜底：纽约
  return COMMON_CITIES[0]
}

function windDirText(deg: number): string {
  const dirs = ['北', '东北', '东', '东南', '南', '西南', '西', '西北']
  return dirs[Math.round(((deg % 360) + 360) % 360 / 45) % 8]
}

function weatherLabel(i: number): string {
  if (i === 0) return '今天'
  if (i === 1) return '明天'
  const names = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const d = new Date(Date.now() + i * 86400000)
  return names[d.getDay()]
}

async function loadWeather(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  const city = await resolveWeatherCity(payload)
  const url =
    'https://api.open-meteo.com/v1/forecast?' +
    `latitude=${city.lat}&longitude=${city.lon}` +
    '&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m' +
    '&daily=weather_code,temperature_2m_max,temperature_2m_min' +
    `&timezone=${encodeURIComponent(city.timezone)}&forecast_days=7` +
    '&temperature_unit=fahrenheit&wind_speed_unit=mph'
  const raw = (await fetchJson(url)) as {
    current: { temperature_2m: number; relative_humidity_2m: number; apparent_temperature: number; weather_code: number; wind_speed_10m: number; wind_direction_10m: number }
    daily: { time: string[]; weather_code: number[]; temperature_2m_max: number[]; temperature_2m_min: number[] }
  }
  const code = raw.current.weather_code
  const condition = WMO_ZH[code] ?? '未知'
  const current = {
    code,
    tempF: Math.round(raw.current.temperature_2m),
    tempC: Math.round(((raw.current.temperature_2m - 32) * 5) / 9),
    feelsLikeF: Math.round(raw.current.apparent_temperature),
    humidity: Math.round(raw.current.relative_humidity_2m),
    windText: `${windDirText(raw.current.wind_direction_10m)}风 ${Math.round(raw.current.wind_speed_10m)} 英里/时`,
    condition,
  }
  const daily = raw.daily.time.map((t, i) => {
    const dc = raw.daily.weather_code[i]
    const minF = Math.round(raw.daily.temperature_2m_min[i])
    const maxF = Math.round(raw.daily.temperature_2m_max[i])
    const cc = WMO_ZH[dc] ?? '未知'
    return {
      label: weatherLabel(i),
      code: dc,
      condition: cc,
      minF,
      maxF,
      tempText: `${Math.round(((maxF - 32) * 5) / 9)}~${Math.round(((minF - 32) * 5) / 9)}°C`,
    }
  })
  const now = new Date()
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  return {
    ok: true,
    key: city.key,
    query: city.en,
    cityZh: city.zh,
    cityEn: city.en,
    lat: city.lat,
    lon: city.lon,
    timezone: city.timezone,
    updatedAt: `${hh}:${mm}`,
    current,
    daily,
  }
}

// ---------------------------------------------------------------------------
// DeepSeek 对话
// ---------------------------------------------------------------------------

async function deepseekChatCompletion(
  settings: Settings,
  messages: Array<{ role?: string; content?: string; text?: string; image?: string | null }>
): Promise<{ content: string; model: string }> {
  const key = settings.deepseekApiKey.trim()
  if (!key) throw new Error('未配置 DeepSeek API Key，请先在设置中填写')
  const model = settings.deepseekModel.trim() || 'deepseek-chat'
  const base = (settings.deepseekBaseUrl.trim().replace(/\/+$/, '') || 'https://api.deepseek.com/v1') + '/chat/completions'
  // 渲染层发的是 { role, text, image }，其他调用方可能传 { role, content }：
  // 必须两种字段名都认，否则正文会被当成空串，接口直接 400。
  const cleaned = messages
    .map((m) => {
      let text = (typeof m.content === 'string' && m.content.trim()) ? m.content : (m.text || '')
      if (!String(text).trim() && m.image) text = '[用户发送了一张图片，DeepSeek 文本模型不支持识图]'
      // 图片附件（dataUrl）统一剥离为文本说明，DeepSeek 文本模型不支持图片
      text = String(text).replace(/!\[[^\]]*\]\(data:[^)]*\)/g, '[图片附件（已忽略，DeepSeek 暂不支持识图）]')
      return { role: m.role === 'assistant' ? 'assistant' : 'user', content: text.trim() }
    })
    .filter((m) => m.content.length > 0)
  if (!cleaned.length) throw new Error('消息内容为空，请输入要发送的文字')
  const res = await fetch(base, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, messages: cleaned, stream: false, temperature: 0.7, max_tokens: 2048 }),
    signal: AbortSignal.timeout(60000),
  })
  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw new Error(`DeepSeek API ${res.status}: ${txt.slice(0, 200)}`)
  }
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> }
  const content = data.choices?.[0]?.message?.content ?? ''
  if (!content) throw new Error('DeepSeek 返回为空')
  return { content, model }
}

// ---------------------------------------------------------------------------
// 窗口：天气
// ---------------------------------------------------------------------------

function createWeatherWindow(): BrowserWindow {
  closeSideToolsExcept(null)
  const win = new BrowserWindow({
    width: 390,
    height: 820,
    minWidth: 320,
    minHeight: 420,
    title: '天气',
    icon: toolIconPath(),
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#0d1b2a',
    webPreferences: {
      preload: preloadPath('tool-weather.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })
  const b = boundsBesideMain(390)
  win.setBounds(b)
  win.once('ready-to-show', () => win.show())
  win.on('closed', () => {
    weatherWindow = null
  })
  void win.loadURL(toolPageUrl('weather-shell.html'))
  attachToolFollow(win)
  return win
}

// ---------------------------------------------------------------------------
// 窗口：美国之音（WebContentsView 内嵌网页）
// ---------------------------------------------------------------------------

function createNewsWindow(): BrowserWindow {
  closeSideToolsExcept(null)
  const win = new BrowserWindow({
    width: 390,
    height: 820,
    minWidth: 320,
    minHeight: 480,
    title: '美国之音 · VOA',
    icon: toolIconPath(),
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#edf0f6',
    webPreferences: {
      preload: preloadPath('tool-news.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })
  const b = boundsBesideMain(390)
  win.setBounds(b)
  win.once('ready-to-show', () => win.show())
  win.on('closed', () => {
    if (newsView && !newsView.webContents.isDestroyed()) {
      newsView.webContents.close()
    }
    newsView = null
    newsWindow = null
  })

  const layoutView = (): void => {
    if (!newsView || win.isDestroyed()) return
    const [w, h] = win.getContentSize()
    newsView.setBounds({ x: 0, y: 48, width: w, height: Math.max(0, h - 48) })
  }
  win.on('resize', layoutView)

  const view = new WebContentsView({
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
      partition: 'persist:news-reader',
    },
  })
  win.contentView.addChildView(view)
  newsView = view
  layoutView()

  const wc = view.webContents
  wc.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      // 在视图内打开站内文章；外域走系统浏览器
      const host = ((): string => {
        try {
          return new URL(url).hostname
        } catch {
          return ''
        }
      })()
      if (NEWS_ALLOW_DOMAINS.some((d) => host === d || host.endsWith('.' + d))) {
        void wc.loadURL(url)
        return { action: 'deny' }
      }
    }
    void import('electron').then(({ shell }) => shell.openExternal(url))
    return { action: 'deny' }
  })

  const emitNav = (): void => {
    if (win.isDestroyed()) return
    win.webContents.send('news-reader-nav', { canGoBack: wc.navigationHistory.canGoBack() })
  }
  wc.on('did-navigate', emitNav)
  wc.on('did-navigate-in-page', emitNav)

  // 加载完成前隐藏视图：避免网页的白底遮住 shell 页面的加载/错误提示
  view.setVisible(false)
  let loadTimer: ReturnType<typeof setTimeout> | null = null
  const clearLoadTimer = (): void => {
    if (loadTimer) {
      clearTimeout(loadTimer)
      loadTimer = null
    }
  }
  const sendPage = (state: Record<string, unknown>): void => {
    if (!win.isDestroyed()) win.webContents.send('news-reader-page', state)
  }

  // 可自动重试的瞬时网络/TLS 失败：VOA 等海外站点首次握手经常被中间网络设备
  // 干扰，这类错误点第二次通常能成功，所以由代码自动替用户点。
  const RETRYABLE_LOAD_ERRORS = new Set([
    -100, // ERR_CONNECTION_CLOSED
    -101, // ERR_CONNECTION_RESET
    -102, // ERR_CONNECTION_REFUSED
    -103, // ERR_CONNECTION_ABORTED
    -104, // ERR_CONNECTION_FAILED
    -107, // ERR_SSL_PROTOCOL_ERROR
    -111, // ERR_TUNNEL_CONNECTION_FAILED
    -112, // ERR_NO_SSL_VERSIONS_SUPPORTED
    -113, // ERR_SSL_VERSION_OR_CIPHER_MISMATCH
    -118, // ERR_CONNECTION_TIMED_OUT
    -324 // ERR_EMPTY_RESPONSE
  ])
  const MAX_LOAD_RETRIES = 5
  let loadRetries = 0
  // 标记当前这次加载是否已经 did-fail-load：加载失败后 Chromium 会加载一个
  // 错误页并再次触发 did-finish-load，不能把它当成“真实成功”去重置重试计数
  let lastLoadFailed = false

  const scheduleRetry = (reason: string, url: string): void => {
    if (loadRetries >= MAX_LOAD_RETRIES) {
      loadRetries = 0
      logDebug(`[news] 已达最大重试次数，最终失败：${reason}`)
      view.setVisible(false)
      sendPage({ loading: false, failed: true, error: reason })
      return
    }
    loadRetries += 1
    logDebug(`[news] ${reason}，自动重试 ${loadRetries}/${MAX_LOAD_RETRIES}`)
    view.setVisible(false)
    sendPage({ loading: true })
    // 第一次立刻重试，后续按 0.5s / 1.5s / 3s / 6s 退避，给网络恢复留出时间
    const delay =
      loadRetries === 1 ? 0 :
      loadRetries === 2 ? 500 :
      loadRetries === 3 ? 1500 :
      loadRetries === 4 ? 3000 : 6000
    setTimeout(() => {
      if (wc.isDestroyed()) return
      void wc.loadURL(url || NEWS_HOME_URL).catch(() => {
        /* did-fail-load 会继续处理 */
      })
    }, delay)
  }

  wc.on('did-start-loading', () => {
    clearLoadTimer()
    lastLoadFailed = false
    sendPage({ loading: true })
    // 网络不可达时 Chromium 可能要等很久才报错 → 45s 超时兜底
    loadTimer = setTimeout(() => {
      if (wc.isDestroyed()) return
      logDebug('[news] 加载 45s 超时，尝试自动重试')
      scheduleRetry('加载超时，请检查网络后点击重试', wc.getURL() || NEWS_HOME_URL)
    }, 45000)
  })
  wc.on('did-stop-loading', () => {
    clearLoadTimer()
    sendPage({ loading: false })
  })
  wc.on('did-fail-load', (_e, code, desc, url, isMainFrame) => {
    if (!isMainFrame || code === -3) return // 仅主 frame；-3 = ERR_ABORTED（跳转取消）忽略
    clearLoadTimer()
    lastLoadFailed = true
    logDebug(`[news] did-fail-load code=${code} desc=${desc} url=${url} retries=${loadRetries}`)
    if (RETRYABLE_LOAD_ERRORS.has(code)) {
      scheduleRetry(`加载失败(${code} ${desc})`, url)
      return
    }
    loadRetries = 0
    view.setVisible(false)
    sendPage({ loading: false, failed: true, error: desc })
  })
  wc.on('did-finish-load', () => {
    clearLoadTimer()
    if (lastLoadFailed) {
      // 失败后错误页加载完成，不是真实成功：保持隐藏，等待下一次重试结果
      view.setVisible(false)
      return
    }
    loadRetries = 0
    view.setVisible(true)
    sendPage({ loading: false, failed: false, error: '' })
  })

  // 主窗口关闭时一并关闭
  const main = getMainWindow()
  main?.on('closed', () => {
    if (!win.isDestroyed()) win.close()
  })

  // 加载自定义工具栏 shell（名称 + 首页/返回按钮）
  void win.loadURL(toolPageUrl('news-shell.html'))
  // 预先加载 VOA（不等窗口显示，减少白屏等待）
  void wc.loadURL(NEWS_HOME_URL)
  win.once('ready-to-show', () => win.show())
  attachToolFollow(win)
  return win
}

function newsReload(): void {
  if (newsView && !newsView.webContents.isDestroyed()) {
    if (newsView.webContents.getURL()) newsView.webContents.reload()
    else void newsView.webContents.loadURL(NEWS_HOME_URL)
  }
}

// ---------------------------------------------------------------------------
// 窗口：对话（DeepSeek / OpenAI 共用页面，用 additionalArguments 区分服务商）
// ---------------------------------------------------------------------------

const CHAT_WINDOW_META: Record<ChatProvider, { title: string; partition: string }> = {
  deepseek: { title: 'DeepSeek 对话', partition: 'persist:gpt-chat' },
  openai: { title: 'OpenAI 对话', partition: 'persist:openai-chat' },
}

function createChatWindow(provider: ChatProvider): BrowserWindow {
  const meta = CHAT_WINDOW_META[provider]
  closeSideToolsExcept(null)
  const win = new BrowserWindow({
    width: 430,
    height: 760,
    minWidth: 360,
    minHeight: 480,
    title: meta.title,
    icon: toolIconPath(),
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#1a1d27',
    webPreferences: {
      preload: preloadPath('tool-gpt.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      partition: meta.partition,
      // preload 从这里读服务商 → getConfig / sendChat 自动带上，页面无需区分
      additionalArguments: [`--chat-provider=${provider}`],
    },
  })
  const b = boundsBesideMain(430)
  win.setBounds(b)
  win.once('ready-to-show', () => win.show())
  win.on('closed', () => {
    chatWindows[provider] = null
  })
  const main = getMainWindow()
  main?.on('closed', () => {
    if (!win.isDestroyed()) win.close()
  })
  void win.loadURL(toolPageUrl('gpt-chat.html'))
  attachToolFollow(win)
  return win
}

/** 打开（或聚焦）指定服务商的对话窗口 */
function openChatWindow(provider: ChatProvider): { ok: boolean } {
  const win = chatWindows[provider]
  if (!win || win.isDestroyed()) {
    chatWindows[provider] = createChatWindow(provider)
  } else {
    win.show()
    win.focus()
  }
  return { ok: true }
}

// ---------------------------------------------------------------------------
// IPC 注册
// ---------------------------------------------------------------------------

export function registerToolsIpc(): void {
  // 打开/聚焦工具窗口（主窗口顶部按钮调用）
  ipcMain.handle('open-weather', () => {
    if (!weatherWindow || weatherWindow.isDestroyed()) weatherWindow = createWeatherWindow()
    else {
      weatherWindow.show()
      weatherWindow.focus()
    }
    return { ok: true }
  })
  ipcMain.handle('open-news-reader', () => {
    if (!newsWindow || newsWindow.isDestroyed()) newsWindow = createNewsWindow()
    else {
      newsWindow.show()
      newsWindow.focus()
    }
    return { ok: true }
  })
  ipcMain.handle('open-gpt-chat', () => openChatWindow('deepseek'))
  ipcMain.handle('open-openai-chat', () => openChatWindow('openai'))

  // 天气
  ipcMain.handle('weather-load-city', async (_e, payload: Record<string, unknown>) => {
    try {
      return await loadWeather(payload ?? {})
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) }
    }
  })
  ipcMain.handle('weather-get-cities', () => ({ ok: true, cities: COMMON_CITIES }))
  ipcMain.handle('weather-pin-city', (_e, payload: Record<string, unknown>) => {
    const state = loadToolsState()
    if (payload && (payload as { unpin?: boolean }).unpin) {
      state.weatherPinnedCity = null
    } else {
      const c = payload as unknown as WeatherCity
      state.weatherPinnedCity = {
        key: String(c.key ?? ''),
        zh: String(c.zh ?? c.en ?? ''),
        en: String(c.en ?? c.zh ?? ''),
        lat: Number(c.lat),
        lon: Number(c.lon),
        timezone: String(c.timezone ?? 'auto'),
      }
    }
    saveToolsState(state)
    return { ok: true, city: state.weatherPinnedCity }
  })
  ipcMain.handle('weather-get-pinned', () => {
    const state = loadToolsState()
    return { ok: true, city: state.weatherPinnedCity ?? null }
  })

  // 美国之音（shell 内 WebContentsView 导航）
  ipcMain.handle('news-reader-go-home', () => {
    if (newsView) {
      newsView.setVisible(true)
      void newsView.webContents.loadURL(NEWS_HOME_URL)
    }
    return { ok: true }
  })
  ipcMain.handle('news-reader-go-back', () => {
    if (newsView && newsView.webContents.navigationHistory.canGoBack()) {
      newsView.webContents.navigationHistory.goBack()
    }
    return { ok: true }
  })
  ipcMain.handle('news-reader-reload', () => {
    newsReload()
    return { ok: true }
  })

  // 对话窗口：DeepSeek / OpenAI（同一套 IPC，按 payload.provider 分发）
  ipcMain.handle('gpt-chat-config', (_e, payload?: { provider?: string }) => {
    const s = store.getSettings()
    const provider = normalizeChatProvider(payload?.provider)
    if (provider === 'openai') {
      return {
        ok: true,
        provider,
        model: s.openaiModel.trim() || 'gpt-4o-mini',
        hasKey: !!s.openaiApiKey.trim(),
        viaProxy: hasProxy(s),
        supportsImage: true,
      }
    }
    return {
      ok: true,
      provider,
      model: s.deepseekModel.trim() || 'deepseek-chat',
      hasKey: !!s.deepseekApiKey.trim(),
      viaProxy: false,
      supportsImage: false,
    }
  })
  ipcMain.handle('gpt-chat-send', async (_e, payload?: { provider?: string; messages?: ChatMessageIn[] }) => {
    const messages = Array.isArray(payload?.messages) ? payload.messages : []
    if (!messages.length) return { success: false, error: '消息为空' }
    const provider = normalizeChatProvider(payload?.provider)
    try {
      const s = store.getSettings()
      if (provider === 'openai') {
        const { content, model, viaProxy } = await openaiChat(messages, s)
        return { success: true, reply: content, model, viaProxy }
      }
      const { content, model } = await deepseekChatCompletion(s, messages)
      return { success: true, reply: content, model }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  })
  ipcMain.handle('gpt-chat-clear', () => ({ ok: true }))
}
