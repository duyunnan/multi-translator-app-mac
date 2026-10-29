/**
 * WebView 注入脚本入口（在 guest 页面上下文中运行）。
 * 通过 ipcRenderer 与主进程通信完成翻译/语音识别/AI 回复。
 *
 * 平台识别：优先取 URL 中的 __mt_platform 参数（渲染层创建 webview 时附加），
 * 兜底用 hostname 匹配。
 */
import { contextBridge, ipcRenderer } from 'electron'
import type { Platform, WebviewConfig } from '../shared/types'
import { IPC_W } from './webview/ipc-constants'
import { adapters, detectAdapter, type PlatformAdapter } from './webview/platforms'
import { Translator } from './webview/core'

/** 解析适配器：URL 显式平台参数优先（渲染层附加），兜底用 hostname 匹配 */
function resolveAdapter(): PlatformAdapter | null {
  const q = new URLSearchParams(location.search)
  const urlPlatform = q.get('__mt_platform') as Platform | null
  if (urlPlatform) {
    const byName = adapters.find((a) => a.platform === urlPlatform)
    if (byName) return byName
  }
  return detectAdapter()
}

async function main(): Promise<void> {
  const adapter = resolveAdapter()
  if (!adapter) {
    console.log('[mt] no platform adapter for host:', location.hostname)
    return
  }

  const q = new URLSearchParams(location.search)
  const urlPlatform = q.get('__mt_platform') as Platform | null
  const platform: Platform = urlPlatform && adapter.platform === urlPlatform ? urlPlatform : adapter.platform

  // 一并带上账号 ID（渲染层在 webview URL 上附加的 __mt_account 参数）。
  // 主进程需要它来为对应 partition 应用 messenger 兼容配置（删 CSP / 放行权限 / 纯净 UA）；
  // 此前这里只传 platform，主进程的 accountId 恒为 undefined，那段配置从未生效 ——
  // FB 因而在带 Electron 环境/CSP 下阻断自身脚本，表现为「登录后消息一直加载、发不出消息」。
  const accountId = q.get('__mt_account') || undefined
  let cfg: WebviewConfig
  try {
    cfg = await ipcRenderer.invoke(IPC_W.WebviewGetConfig, platform, accountId)
  } catch (e) {
    console.warn('[mt] get config failed:', e)
    cfg = {
      platform,
      homeUrl: location.href,
      userAgent: navigator.userAgent,
      preloadPath: '',
      defaultLang: 'zh-CN',
      sendLang: 'en',
      autoTranslate: true,
      fontSize: 13,
      badgeColor: '#c62828',
      badgeBgColor: 'rgba(255, 235, 238, 0.95)',
    }
  }

  const translator = new Translator(cfg, adapter)

  // ---- 渲染层 wv.send() 通道：必须在 waitForApp 之前注册，
  // 否则登录等待期间渲染层推送的开关状态会丢失，导致发送翻译/自动翻译不生效 ----
  ipcRenderer.on(
    'mt-toggle-translation',
    (_e, payload: { enabled?: boolean; targetLang?: string; translateNow?: boolean }) => {
      translator.setAutoTranslationEnabled(
        Boolean(payload?.enabled),
        payload?.targetLang,
        Boolean(payload?.translateNow)
      )
    }
  )
  ipcRenderer.on(
    'mt-translate-all-visible',
    (_e, payload: { targetLang?: string }) => {
      if (payload?.targetLang) translator.setTargetLang(payload.targetLang)
      void translator.translateAllVisible()
    }
  )
  ipcRenderer.on('mt-toggle-send-translation', (_e, payload: { enabled?: boolean }) => {
    translator.setSendTranslationEnabled(Boolean(payload?.enabled))
  })
  ipcRenderer.on('mt-generate-reply', () => {
    void translator.generateAiReply()
  })
  ipcRenderer.on('mt-settings-updated', (_e, payload: Record<string, unknown>) => {
    translator.updateConfig(payload as never)
  })

  // ---- 宿主暂停/恢复（切到后台账号、窗口最小化时由渲染层下发）----
  // 多开性能关键：后台账号暂停全部 DOM 扫描与未读轮询，不再和前台账号抢 CPU。
  ipcRenderer.on('mt-host-pause', () => translator.setHostPaused(true))
  ipcRenderer.on('mt-soft-wake', () => translator.setHostPaused(false))
  // 宿主即将摘除本 webview（删除账号）：立即让注入逻辑完全静止，配合渲染层的
  // "先卸载页面、再移除节点"流程，避免 guest 在仍有定时器/观察器运行时被销毁而触发原生崩溃。
  ipcRenderer.on('mt-host-teardown', () => translator.teardown())

  // ---- 主世界全局函数（executeJavaScript 后备；webview 配置 contextIsolation=no，preload 与主世界共享 window）----
  const w = window as any
  w.__mt_setTranslationEnabled = (enabled: boolean, targetLang?: string, translateNow?: boolean) =>
    translator.setAutoTranslationEnabled(Boolean(enabled), targetLang, Boolean(translateNow))
  w.__mt_translateAll = (targetLang?: string) => {
    if (targetLang) translator.setTargetLang(targetLang)
    void translator.translateAllVisible()
  }
  w.__mt_setSendTranslationEnabled = (enabled: boolean) =>
    translator.setSendTranslationEnabled(Boolean(enabled))
  w.__mt_generateReply = () => void translator.generateAiReply()
  w.__mt_updateConfig = (patch: Record<string, unknown>) => translator.updateConfig(patch as never)
  w.__mt_getStatus = () => ({
    platform,
    loggedIn: adapter.isLoggedIn(),
    badgeCount: document.querySelectorAll('.mt-badge').length,
  })

  // 登录页 / 首屏未就绪时 waitForApp 会超时。此前超时直接 return，而 preload 只执行一次，
  // 用户随后登录成功也不会重启注入 —— 表现为「登录后翻译、收发消息增强全部无效」。
  // 改为常驻轮询：进入应用态（已登录首屏或登录成功）立即启动，最长等待 30 分钟。
  let ready = await adapter.waitForApp(25000)
  if (!ready) {
    console.log('[mt] app not ready, keep waiting for login...')
    const deadline = Date.now() + 30 * 60 * 1000
    while (!ready && Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 2000))
      ready = await adapter.waitForApp(1500)
    }
  }
  if (!ready) {
    console.log('[mt] app not ready after long wait, skip injection bootstrap')
    return
  }

  translator.start()

  // 暴露调试接口（隔离世界内，主世界不可见）
  ;(window as any).__mt = {
    translator,
    adapter,
    config: cfg,
    setAutoTranslate: (on: boolean) => translator.setAutoTranslate(on),
  }

  // 通过 contextBridge 暴露到主世界（contextIsolation 开启时 executeJavaScript 也能调用）
  try {
    contextBridge.exposeInMainWorld('__mtBridge', {
      setAutoTranslate: (on: boolean) => translator.setAutoTranslate(on),
      setTranslationEnabled: (enabled: boolean, targetLang?: string, translateNow?: boolean) =>
        translator.setAutoTranslationEnabled(Boolean(enabled), targetLang, Boolean(translateNow)),
      translateAll: (targetLang?: string) => {
        if (targetLang) translator.setTargetLang(targetLang)
        void translator.translateAllVisible()
      },
      setSendTranslationEnabled: (enabled: boolean) =>
        translator.setSendTranslationEnabled(Boolean(enabled)),
      generateReply: () => void translator.generateAiReply(),
      updateStyle: (fontSize: number, color: string, bgColor: string) =>
        translator.updateStyle(fontSize, color, bgColor),
      updateConfig: (patch: Record<string, unknown>) => translator.updateConfig(patch as never),
      setTargetLang: (lang: string) => translator.setTargetLang(lang),
      getStatus: () => ({
        platform,
        loggedIn: adapter.isLoggedIn(),
        badgeCount: document.querySelectorAll('.mt-badge').length,
      }),
    })
  } catch {
    // 环境不支持则跳过（不影响翻译功能）
  }
  console.log(`[mt] translator injected for ${platform}`)
}

void main()
