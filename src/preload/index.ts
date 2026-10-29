/**
 * preload 桥接：通过 contextBridge 暴露类型安全的 window.api。
 */
import { contextBridge, ipcRenderer } from 'electron'
import { IPC, type Account, type Api, type CacheStats, type LineState, type MessengerState, type Settings, type SignalState, type UpdaterCheckResult, type UpdaterState, type WebviewActivity, type WebviewUnread } from '../shared/types'

const api: Api = {
  auth: {
    status: () => ipcRenderer.invoke(IPC.AuthStatus),
    login: (username, password) => ipcRenderer.invoke(IPC.AuthLogin, username, password),
    logout: () => ipcRenderer.invoke(IPC.AuthLogout),
    getConfig: () => ipcRenderer.invoke(IPC.AuthConfigGet),
    setConfig: (config) => ipcRenderer.invoke(IPC.AuthConfigSet, config),
    onExpired: (cb) => {
      ipcRenderer.on(IPC.AuthExpiredPush, (_e, info) => cb(info))
    },
  },
  accounts: {
    list: () => ipcRenderer.invoke(IPC.AccountsList),
    add: (input) =>
      ipcRenderer.invoke(IPC.AccountsAdd, {
        platform: input.platform,
        name: input.name,
        signalAccountId: input.signalAccountId,
      }),
    remove: (id) => ipcRenderer.invoke(IPC.AccountsRemove, id),
    update: (id, patch) => ipcRenderer.invoke(IPC.AccountsUpdate, id, patch),
    rename: (id, name) => ipcRenderer.invoke(IPC.AccountsRename, id, name),
    reorder: (orderedIds) => ipcRenderer.invoke(IPC.AccountsReorder, orderedIds),
    togglePin: (id) => ipcRenderer.invoke(IPC.AccountsTogglePin, id),
    toggleHidden: (id) => ipcRenderer.invoke(IPC.AccountsToggleHidden, id),
  },
  translate: (text, targetLang) => ipcRenderer.invoke(IPC.TranslateText, text, targetLang),
  cacheStats: (): Promise<CacheStats> => ipcRenderer.invoke(IPC.CacheStats),
  cacheClear: (): Promise<CacheStats> => ipcRenderer.invoke(IPC.CacheClear),
  speechRecognize: (audioBase64, mime) =>
    ipcRenderer.invoke(IPC.SpeechRecognize, audioBase64, mime),
  generateReply: (messages) => ipcRenderer.invoke(IPC.GenerateReply, messages),
  settings: {
    get: (): Promise<Settings> => ipcRenderer.invoke(IPC.SettingsGet),
    set: (patch) => ipcRenderer.invoke(IPC.SettingsSet, patch),
    testOpenAI: () => ipcRenderer.invoke(IPC.OpenAITest),
    testDeepSeek: () => ipcRenderer.invoke(IPC.DeepSeekTest),
    testProxy: (proxy?: { host: string; port: number; username?: string; password?: string }) =>
      ipcRenderer.invoke(IPC.ProxyTest, proxy),
  },
  server: {
    status: () => ipcRenderer.invoke(IPC.ServerStatus),
    onReady: (cb) => {
      ipcRenderer.on('server:ready', (_e, port: number) => cb(port))
    },
  },
  webview: {
    domReady: (webviewId, url) => ipcRenderer.send(IPC.WebviewDomReady, webviewId, url),
    getConfig: (platform, accountId) => ipcRenderer.invoke(IPC.WebviewGetConfig, platform, accountId),
    onUnread: (cb) => {
      ipcRenderer.on(IPC.WebviewUnreadPush, (_e, u: WebviewUnread) => cb(u))
    },
    onActivity: (cb) => {
      ipcRenderer.on(IPC.WebviewActivityPush, (_e, a: WebviewActivity) => cb(a))
    },
    setThrottle: (webContentsId, throttle) =>
      ipcRenderer.invoke(IPC.WebviewSetThrottle, webContentsId, throttle),
  },
  signal: {
    launch: (accountId) => ipcRenderer.invoke(IPC.SignalLaunch, accountId),
    embed: (accountId) => ipcRenderer.invoke(IPC.SignalEmbed, accountId),
    relocate: (accountId, bounds) => ipcRenderer.invoke(IPC.SignalRelocate, accountId, bounds),
    reset: (accountId) => ipcRenderer.invoke(IPC.SignalReset, accountId),
    relaunch: (accountId) => ipcRenderer.invoke(IPC.SignalRelaunch, accountId),
    kill: (accountId) => ipcRenderer.invoke(IPC.SignalKill, accountId),
    detach: (accountId) => ipcRenderer.invoke(IPC.SignalDetach, accountId),
    health: (accountId) => ipcRenderer.invoke(IPC.SignalHealth, accountId),
    setUnread: (accountId, n) => ipcRenderer.invoke(IPC.SignalSetUnread, accountId, n),
    onState: (cb) => {
      ipcRenderer.on(IPC.SignalStatePush, (_e, s: SignalState) => cb(s))
    },
  },
  line: {
    launch: (accountId) => ipcRenderer.invoke(IPC.LineLaunch, accountId),
    embed: (accountId) => ipcRenderer.invoke(IPC.LineEmbed, accountId),
    relocate: (accountId, bounds) => ipcRenderer.invoke(IPC.LineRelocate, accountId, bounds),
    reset: (accountId) => ipcRenderer.invoke(IPC.LineReset, accountId),
    detach: (accountId) => ipcRenderer.invoke(IPC.LineDetach, accountId),
    health: (accountId) => ipcRenderer.invoke(IPC.LineHealth, accountId),
    setUnread: (accountId, n) => ipcRenderer.invoke(IPC.LineSetUnread, accountId, n),
    onState: (cb) => {
      ipcRenderer.on(IPC.LineStatePush, (_e, s: LineState) => cb(s))
    },
  },
  messengerWindow: {
    open: (accountId) => ipcRenderer.invoke(IPC.MessengerWindowOpen, accountId),
    hide: (accountId) => ipcRenderer.invoke(IPC.MessengerWindowHide, accountId),
    close: (accountId) => ipcRenderer.invoke(IPC.MessengerWindowClose, accountId),
  },
  messenger: {
    launch: (accountId) => ipcRenderer.invoke(IPC.MessengerLaunch, accountId),
    embed: (accountId) => ipcRenderer.invoke(IPC.MessengerEmbed, accountId),
    relocate: (accountId, bounds) => ipcRenderer.invoke(IPC.MessengerRelocate, accountId, bounds),
    reset: (accountId) => ipcRenderer.invoke(IPC.MessengerReset, accountId),
    detach: (accountId) => ipcRenderer.invoke(IPC.MessengerDetach, accountId),
    health: (accountId) => ipcRenderer.invoke(IPC.MessengerHealth, accountId),
    setUnread: (accountId, n) => ipcRenderer.invoke(IPC.MessengerSetUnread, accountId, n),
    onState: (cb) => {
      ipcRenderer.on(IPC.MessengerStatePush, (_e, s: MessengerState) => cb(s))
    },
  },
  getMemoryInfo: () => ipcRenderer.invoke(IPC.GetMemoryInfo),
  onMemoryPressure: (cb) => {
    ipcRenderer.on(IPC.MemoryPressurePush, (_e, info) => cb(info))
  },
  // 同步取证日志（主进程 appendFileSync 落盘，进程闪退也不丢）
  dbgSync: (msg) => ipcRenderer.send('dbg:sync', msg),
  openExternal: (url) => ipcRenderer.invoke(IPC.OpenExternal, url),
  nativeOverlay: {
    set: (active) => ipcRenderer.invoke(IPC.NativeOverlaySet, active === true),
  },
  tools: {
    openNewsReader: () => ipcRenderer.invoke('open-news-reader'),
    openWeather: () => ipcRenderer.invoke('open-weather'),
    openGptChat: () => ipcRenderer.invoke('open-gpt-chat'),
    openOpenAIChat: () => ipcRenderer.invoke('open-openai-chat'),
  },
  updater: {
    check: (): Promise<UpdaterCheckResult> => ipcRenderer.invoke(IPC.UpdaterCheck),
    download: (): Promise<{ ok: boolean; error?: string }> => ipcRenderer.invoke(IPC.UpdaterDownload),
    install: (): Promise<void> => ipcRenderer.invoke(IPC.UpdaterInstall),
    cancel: (): Promise<void> => ipcRenderer.invoke(IPC.UpdaterCancel),
    onState: (cb: (s: UpdaterState) => void) => {
      ipcRenderer.on(IPC.UpdaterStatePush, (_e, s: UpdaterState) => cb(s))
    },
  },
}

contextBridge.exposeInMainWorld('api', api)

export type { Api }
