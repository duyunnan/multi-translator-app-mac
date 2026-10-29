/**
 * 主进程 / preload / 渲染层共用的类型与 IPC 契约
 */

export type Platform = 'whatsapp' | 'telegram' | 'messenger' | 'signal' | 'line'

export type SignalStatus =
  | 'idle'
  | 'starting'
  | 'starting_embedded'
  | 'running'
  | 'embedding'
  | 'embedded'
  | 'crashed'
  | 'error'

export interface Account {
  id: string
  platform: Platform
  name: string
  sortOrder: number
  pinned: boolean
  // 置顶时间戳：存在多个置顶账号时按此倒序排列，最新置顶的排在最前
  pinnedAt?: number
  isHidden: boolean
  createdAt: number
  // 账号级翻译开关（webview 顶部工具栏）
  autoTranslate?: boolean
  autoSendTranslate?: boolean
  // Signal 特有
  signalAccountId?: string
  signalStatus?: SignalStatus
  signalWindowId?: number
  // LINE 特有（混合运行时：独立 Electron 22 子进程 + 窗口嵌入）
  lineStatus?: SignalStatus
  lineWindowId?: number
  // WebView 特有
  avatarUrl?: string
  lastMessageTime?: number
}

export interface Settings {
  // 默认翻译引擎：google / openai / deepseek
  translateEngine: 'google' | 'openai' | 'deepseek'
  // AI 通道选择：openai 或 deepseek（智能回复）
  aiProvider: 'openai' | 'deepseek'
  // OpenAI 翻译 / AI 回复
  openaiApiKey: string
  openaiBaseUrl: string
  openaiModel: string
  // DeepSeek 翻译 / AI 回复
  deepseekApiKey: string
  deepseekBaseUrl: string
  deepseekModel: string
  // 语音识别 (Whisper)
  sttApiKey: string
  sttBaseUrl: string
  sttModel: string
  // SOCKS5 代理
  proxyHost: string
  proxyPort: number
  proxyUsername: string
  proxyPassword: string
  // 上面留空时自动探测本机代理（Windows 系统代理 / 常见客户端端口）
  proxyAutoDetect: boolean
  // 翻译行为
  defaultTargetLang: string
  // 发送翻译目标语言（输入框内容翻译后发出的语言，默认英文）
  sendTargetLang: string
  autoTranslateEnabled: boolean
  // 通知
  notificationsEnabled: boolean
  // 徽章样式
  fontFamily: string
  fontSize: number
  badgeColor: string
  badgeBgColor: string
  // WebView
  webviewConcurrent: number
  // 授权服务器（登录用）
  authServerHost: string
  authServerPort: number
}

export const DEFAULT_SETTINGS: Settings = {
  translateEngine: 'google',
  aiProvider: 'openai',
  openaiApiKey: '',
  openaiBaseUrl: 'https://api.openai.com/v1',
  openaiModel: 'gpt-4o-mini',
  deepseekApiKey: '',
  deepseekBaseUrl: 'https://api.deepseek.com/v1',
  deepseekModel: 'deepseek-chat',
  sttApiKey: '',
  sttBaseUrl: 'https://api.openai.com/v1',
  sttModel: 'whisper-1',
  proxyHost: '',
  proxyPort: 0,
  proxyUsername: '',
  proxyPassword: '',
  proxyAutoDetect: true,
  defaultTargetLang: 'zh-CN',
  sendTargetLang: 'en',
  autoTranslateEnabled: true,
  notificationsEnabled: true,
  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  fontSize: 13,
  badgeColor: '#c62828',
  badgeBgColor: 'rgba(255, 235, 238, 0.95)',
  webviewConcurrent: 2,
  // 授权服务器地址默认留空：登录页"设置"弹窗展示为空；留空保存即使用系统默认
  // 服务器 api(http://103.214.142.112)/端口(1234，见 services/auth.ts DEFAULT_HOST/DEFAULT_PORT)。
  authServerHost: '',
  authServerPort: 1234,
}

export interface TranslateResult {
  success: boolean
  translated?: string
  error?: string
  fromCache?: boolean
  source?: 'google' | 'openai' | 'deepseek' | 'cache'
}

/* ==================== 授权登录 ==================== */

/** 授权服务器返回的账号信息 */
export interface AuthUserInfo {
  username: string
  expireAt: string | null
  daysLeft: number
  expired: boolean
}

/** 本地持久化的登录状态 */
export interface AuthState {
  token: string
  username: string
  /** 到期时间（epoch ms），null 表示永久/未知 */
  expireAt: number | null
  daysLeft: number
  loggedInAt: number
}

/** 渲染层查询登录状态 */
export interface AuthStatus {
  loggedIn: boolean
  username?: string
  expireAt?: number | null
  daysLeft?: number
  /** 是否已到期（true 时前端应回到登录界面） */
  expired?: boolean
}

/** 登录结果（渲染层展示） */
export interface AuthLoginResult {
  ok: boolean
  /** 业务错误码：1001~1006 / 2001~2002 / 5000；-1 网络不可达，-2 响应格式错误 */
  code?: number
  error?: string
  username?: string
  expireAt?: number | null
  daysLeft?: number
}

/** 登录失效推送（主进程心跳检测到，广播给渲染层） */
export interface AuthExpiredInfo {
  /** 失效原因错误码：1004 停用 / 1005 到期 / 2001 被踢 / 2002 设备不匹配 */
  code?: number
}

/** 授权服务器地址配置 */
export interface AuthConfig {
  host: string
  port: number
}

/* ==================== 软件自更新（自建后台 update.php / download.php） ==================== */

/** 更新后台返回的最新安装包信息（对应 data.latest） */
export interface UpdateRelease {
  id: number
  name: string
  version: string
  channel: string
  platform: string
  file_name: string
  file_size: number
  download_url: string
  sha256: string
  release_notes: string
  is_force: boolean
  published_at: string
}

/** 检查更新结果（对应 update.php 的 data.has_update / data.latest；hasUpdate 为 true 时 latest 必存在） */
export interface UpdaterCheckResult {
  hasUpdate: boolean
  latest?: UpdateRelease | null
  /** 网络不可达 / 响应格式错误 / 服务端业务错误等（仅失败时有值） */
  error?: string
}

/** 更新流程状态机 */
export type UpdaterStatus =
  | 'idle' // 初始 / 检查前
  | 'checking' // 正在检查
  | 'no-update' // 已是最新
  | 'update-found' // 发现新版，等待用户下载
  | 'downloading' // 下载中（progress 0-100）
  | 'verified' // 下载完成且 sha256 校验通过，可安装
  | 'installing' // 正在启动安装器并退出
  | 'error' // 出错（message 描述原因）

/** 更新流程状态（主进程推送 / IPC 返回值） */
export interface UpdaterState {
  status: UpdaterStatus
  /** 客户端当前版本 */
  currentVersion?: string
  /** 服务器最新版本 */
  latestVersion?: string
  /** 下载进度 0-100 */
  progress?: number
  downloadedBytes?: number
  totalBytes?: number
  /** 更新说明 */
  releaseNotes?: string
  /** 是否强制更新（强制时渲染层应禁止"稍后"） */
  isForce?: boolean
  /** 安装包大小（字节） */
  fileSize?: number
  /** 可读提示 */
  message?: string
}

export interface GenerateReplyResult {
  success: boolean
  reply?: string
  error?: string
}

export interface SpeechRecognizeResult {
  success: boolean
  text?: string
  error?: string
}

export interface CacheStats {
  hits: number
  misses: number
  size: number
}

/** WebView 注入脚本需要的运行配置 */
export interface WebviewConfig {
  platform: Platform
  /** webview 首页 URL（含原版需要的参数，如 WhatsApp 的 ?app_absent=0） */
  homeUrl: string
  /** 纯净 Chrome UA（去除 Electron 标识，否则 WhatsApp 等站点拒绝访问/返回 404） */
  userAgent: string
  preloadPath: string
  defaultLang: string
  /** 发送翻译目标语言（输入框内容翻译后发出的语言） */
  sendLang: string
  autoTranslate: boolean
  fontSize: number
  badgeColor: string
  badgeBgColor: string
}

/** 顶部栏 / 性能监控的内存与 CPU 统计 */
export interface MemoryInfo {
  rss: number       // MB
  cpu: number       // %（主进程）
  heapUsed: number  // MB
  heapTotal: number // MB
  external: number  // MB
  totalMem: number  // MB
  processCount: number
  processes: { pid: number; type: string; cpu: number; memory: number }[]
  /** 触发内存释放的阈值（MB）：整机物理内存的固定比例，低于其视为正常 */
  thresholdMB?: number
}

/** 主进程 -> 渲染层：内存压力推送（渲染层据此休眠不活跃账号，真正释放内存） */
export interface MemoryPressureInfo {
  level: 'normal' | 'high' | 'critical'
  /** 全部 Electron 进程驻留内存之和（MB） */
  totalMB: number
  /** 整机物理内存（MB） */
  totalMemMB: number
  /** 触发释放的阈值（MB） */
  thresholdMB: number
  processCount: number
  /** 占用最高的几个进程摘要（仅用于日志/排查） */
  top: string
}

export interface AccountUpdate {
  id: string
  patch: Partial<Account>
}

/** WebView 未读数（注入脚本统计上报 -> 渲染层显示角标） */
export interface WebviewUnread {
  accountId: string
  unread: number
}

/** WebView 最后消息时间（注入脚本检测到入站消息后上报 -> 渲染层显示"X分钟前收到消息"） */
export interface WebviewActivity {
  accountId: string
  lastMessageTime: number
}

/** LINE 运行状态（主进程推送 / IPC 返回值），结构复用 SignalState */
export interface LineState {
  accountId: string
  status: SignalStatus
  pid: number | null
  unread: number
  embedded: boolean
  error?: string
}

/** Signal 运行状态（主进程推送 / IPC 返回值） */
export interface SignalState {
  accountId: string
  status: SignalStatus
  pid: number | null
  unread: number
  embedded: boolean
  error?: string
}

/** Messenger 嵌入状态（messenger 子进程窗口嵌入主窗口） */
export interface MessengerState {
  accountId: string
  status: SignalStatus
  pid: number | null
  unread: number
  embedded: boolean
  error?: string
}

/** IPC 通道常量 */
export const IPC = {
  AccountsList: 'accounts:list',
  AccountsAdd: 'accounts:add',
  AccountsRemove: 'accounts:remove',
  AccountsUpdate: 'accounts:update',
  AccountsRename: 'accounts:rename',
  AccountsReorder: 'accounts:reorder',
  AccountsTogglePin: 'accounts:toggle-pin',
  AccountsToggleHidden: 'accounts:toggle-hidden',
  TranslateText: 'translate-text',
  CacheStats: 'translation-cache-stats',
  CacheClear: 'translation-cache-clear',
  SpeechRecognize: 'speech-recognize',
  GenerateReply: 'generate-reply',
  WebviewGetConfig: 'webview:get-config',
  OpenExternal: 'open-external',
  SettingsGet: 'settings:get',
  SettingsSet: 'settings:set',
  OpenAITest: 'openai:test',
  DeepSeekTest: 'deepseek:test',
  ProxyTest: 'proxy:test',
  ServerStatus: 'server:status',
  WebviewDomReady: 'webview:dom-ready',
  /** 渲染层 -> 主进程：动态开关某个 guest 的后台节流（多开省 CPU 的关键） */
  WebviewSetThrottle: 'webview:set-throttle',
  SignalLaunch: 'signal:launch',
  SignalEmbed: 'signal:embed',
  SignalRelocate: 'signal:relocate',
  SignalReset: 'signal:reset',
  /** 重启 Signal 子进程（保留 profile / 登录态） */
  SignalRelaunch: 'signal:relaunch',
  SignalKill: 'signal:kill',
  SignalDetach: 'signal:detach',
  SignalHealth: 'signal:health',
  SignalSetUnread: 'signal:set-unread',
  /** 主进程 -> 渲染层 状态推送通道 */
  SignalStatePush: 'signal:state',
  LineLaunch: 'line:launch',
  LineEmbed: 'line:embed',
  LineRelocate: 'line:relocate',
  LineReset: 'line:reset',
  LineDetach: 'line:detach',
  LineHealth: 'line:health',
  LineSetUnread: 'line:set-unread',
  /** 主进程 -> 渲染层 LINE 状态推送通道 */
  LineStatePush: 'line:state',
  MessengerWindowOpen: 'messenger-window:open',
  MessengerWindowHide: 'messenger-window:hide',
  MessengerWindowClose: 'messenger-window:close',
  MessengerLaunch: 'messenger:launch',
  MessengerEmbed: 'messenger:embed',
  MessengerRelocate: 'messenger:relocate',
  MessengerReset: 'messenger:reset',
  MessengerDetach: 'messenger:detach',
  MessengerHealth: 'messenger:health',
  MessengerSetUnread: 'messenger:set-unread',
  /** 主进程 -> 渲染层 Messenger 状态推送通道 */
  MessengerStatePush: 'messenger:state',
  /** 主进程 -> 渲染层 未读数推送（webview 注入脚本统计上报） */
  WebviewUnreadPush: 'webview:unread',
  /** 主进程 -> 渲染层 最后消息时间推送（webview 注入脚本检测入站消息上报） */
  WebviewActivityPush: 'webview:activity',
  GetMemoryInfo: 'memory:info',
  /** 主进程 -> 渲染层：内存压力推送（超过物理内存阈值，要求释放不活跃账号） */
  MemoryPressurePush: 'memory:pressure',
  /** 宿主 DOM 浮层开合 → 主进程暂停/恢复 LINE/Signal 原生嵌入视图（避免 modal 等被其遮挡） */
  NativeOverlaySet: 'native-overlay:set',
  /** 授权登录 */
  AuthStatus: 'auth:status',
  AuthLogin: 'auth:login',
  AuthLogout: 'auth:logout',
  AuthConfigGet: 'auth:config-get',
  AuthConfigSet: 'auth:config-set',
  /** 主进程 -> 渲染层：登录已失效（心跳检测），需要重新登录 */
  AuthExpiredPush: 'auth:expired',
  /** 软件自更新（自建后台 update.php / download.php） */
  UpdaterCheck: 'updater:check',
  UpdaterDownload: 'updater:download',
  UpdaterInstall: 'updater:install',
  UpdaterCancel: 'updater:cancel',
  /** 主进程 -> 渲染层：更新流程状态推送（检查/进度/可安装/错误） */
  UpdaterStatePush: 'updater:state',
} as const

export interface Api {
  /** 授权登录 */
  auth: {
    /** 查询当前登录状态（含本地未过期判断） */
    status: () => Promise<AuthStatus>
    /** 用户名密码登录 */
    login: (username: string, password: string) => Promise<AuthLoginResult>
    /** 登出（服务端 + 清理本地） */
    logout: () => Promise<void>
    /** 读取授权服务器地址配置 */
    getConfig: () => Promise<AuthConfig>
    /** 保存授权服务器地址配置 */
    setConfig: (config: AuthConfig) => Promise<AuthConfig>
    /** 订阅：登录已失效（主进程心跳检测到），渲染层应回到登录界面 */
    onExpired: (cb: (info: AuthExpiredInfo) => void) => void
  }
  accounts: {
    list: () => Promise<Account[]>
    add: (account: Omit<Account, 'id' | 'createdAt' | 'sortOrder' | 'pinned' | 'isHidden'>) => Promise<Account>
    remove: (id: string) => Promise<void>
    update: (id: string, patch: Partial<Account>) => Promise<Account>
    rename: (id: string, name: string) => Promise<void>
    reorder: (orderedIds: string[]) => Promise<void>
    togglePin: (id: string) => Promise<void>
    toggleHidden: (id: string) => Promise<void>
  }
  translate: (text: string, targetLang?: string) => Promise<TranslateResult>
  cacheStats: () => Promise<CacheStats>
  cacheClear: () => Promise<CacheStats>
  speechRecognize: (audioBase64: string, mime: string) => Promise<SpeechRecognizeResult>
  generateReply: (messages: { role: 'in' | 'out'; text: string }[]) => Promise<GenerateReplyResult>
  settings: {
    get: () => Promise<Settings>
    set: (patch: Partial<Settings>) => Promise<Settings>
    testOpenAI: () => Promise<{ success: boolean; error?: string; latencyMs?: number }>
    testDeepSeek: () => Promise<{ success: boolean; error?: string; latencyMs?: number }>
    testProxy: (proxy?: { host: string; port: number; username?: string; password?: string }) => Promise<{ success: boolean; error?: string; message?: string }>
  }
  server: {
    status: () => Promise<{ running: boolean; port: number }>
    onReady: (cb: (port: number) => void) => void
  }
  webview: {
    domReady: (webviewId: string, url: string) => void
    /** 取 webview 运行配置；accountId 供主进程在导航前对 messenger 账号分区做会话级兼容配置 */
    getConfig: (platform: Platform, accountId?: string) => Promise<WebviewConfig>
    /** 订阅 webview 注入脚本上报的未读消息数 */
    onUnread: (cb: (u: WebviewUnread) => void) => void
    /** 订阅 webview 注入脚本上报的最后消息时间 */
    onActivity: (cb: (a: WebviewActivity) => void) => void
    /**
     * 动态开关某个 guest 的后台节流。
     * 激活账号传 false（满速），后台账号传 true（Chromium 降频定时器，省 CPU）。
     */
    setThrottle: (webContentsId: number, throttle: boolean) => Promise<{ ok: boolean }>
  }
  /** 用系统浏览器打开外部链接 */
  openExternal: (url: string) => Promise<void>
  signal: {
    launch: (accountId: string) => Promise<SignalState>
    embed: (accountId: string) => Promise<SignalState>
    relocate: (accountId: string, bounds: { x: number; y: number; width: number; height: number }) => Promise<SignalState>
    reset: (accountId: string) => Promise<SignalState>
    /** 重启 Signal（保留登录态；代理等启动参数改动后调用） */
    relaunch: (accountId: string) => Promise<SignalState>
    kill: (accountId: string) => Promise<SignalState>
    detach: (accountId: string) => Promise<SignalState>
    health: (accountId: string) => Promise<SignalState>
    setUnread: (accountId: string, n: number) => Promise<SignalState>
    /** 订阅主进程推送的 Signal 状态变化 */
    onState: (cb: (s: SignalState) => void) => void
  }
  line: {
    launch: (accountId: string) => Promise<LineState>
    embed: (accountId: string) => Promise<LineState>
    relocate: (accountId: string, bounds: { x: number; y: number; width: number; height: number }) => Promise<LineState>
    reset: (accountId: string) => Promise<LineState>
    detach: (accountId: string) => Promise<LineState>
    health: (accountId: string) => Promise<LineState>
    setUnread: (accountId: string, n: number) => Promise<LineState>
    /** 订阅主进程推送的 LINE 状态变化 */
    onState: (cb: (s: LineState) => void) => void
  }
  /** Messenger：独立原生 BrowserWindow 打开 messenger.com（复刻 messenger_window） */
  messengerWindow: {
    open: (accountId: string) => Promise<void>
    hide: (accountId: string) => Promise<void>
    close: (accountId: string) => Promise<void>
  }
  /** Messenger：messenger 子进程窗口嵌入主窗口 */
  messenger: {
    launch: (accountId: string) => Promise<MessengerState>
    embed: (accountId: string) => Promise<MessengerState>
    relocate: (accountId: string, bounds: { x: number; y: number; width: number; height: number }) => Promise<MessengerState>
    reset: (accountId: string) => Promise<MessengerState>
    detach: (accountId: string) => Promise<MessengerState>
    health: (accountId: string) => Promise<MessengerState>
    setUnread: (accountId: string, n: number) => Promise<MessengerState>
    /** 订阅主进程推送的 Messenger 状态变化 */
    onState: (cb: (s: MessengerState) => void) => void
  }
  /** 内存 / CPU 统计（顶部栏与性能监控） */
  getMemoryInfo: () => Promise<MemoryInfo>
  /** 订阅：主进程检测到内存压力（渲染层据此休眠最久未访问的账号，释放真实内存） */
  onMemoryPressure: (cb: (info: MemoryPressureInfo) => void) => void
  /**
   * 崩溃取证：把关键路径的进度**同步**写入 userData/crash.log。
   * 删除账号等操作会销毁 webview guest，若进程被原生崩溃带走，异步缓冲的 debug.log
   * 会连同进程一起丢；这里同步落盘，保证能看到崩溃前最后执行到哪一步。
   */
  dbgSync: (msg: string) => void
  /** 宿主 DOM 浮层（modal）打开/关闭 → 暂停/恢复 LINE/Signal 原生视图，避免被其遮挡 */
  nativeOverlay: {
    set: (active: boolean) => Promise<void>
  }
  /** 工具窗口：美国之音 / 天气 / DeepSeek 对话 / OpenAI 对话 */
  tools: {
    openNewsReader: () => Promise<{ ok: boolean }>
    openWeather: () => Promise<{ ok: boolean }>
    openGptChat: () => Promise<{ ok: boolean }>
    openOpenAIChat: () => Promise<{ ok: boolean }>
  }
  /** 软件自更新（自建后台：检查更新 / 下载校验 / 静默安装） */
  updater: {
    /** 立即检查更新；结果同时会通过 onState 推送 */
    check: () => Promise<UpdaterCheckResult>
    /** 下载最新安装包并做 sha256 校验；成功后状态为 verified */
    download: () => Promise<{ ok: boolean; error?: string }>
    /** 启动安装器（静默安装）并退出应用；仅在 verified 状态下有意义 */
    install: () => Promise<void>
    /** 取消正在进行的下载 */
    cancel: () => Promise<void>
    /** 订阅更新流程状态变化（检查 / 下载进度 / 校验完成 / 出错等） */
    onState: (cb: (s: UpdaterState) => void) => void
  }
}
