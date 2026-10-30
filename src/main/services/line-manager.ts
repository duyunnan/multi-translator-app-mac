/**
 * LINE 主界面内嵌管理器（宿主 WebContentsView 模式）。
 *
 * 不再 spawn line-mode 子进程，也不做跨进程 SetParent/owner 窗口嵌入
 * （实测 Electron 35 / Chromium 会秒级撤销 SetParent，窗口游离/隐藏）。
 * 改为在宿主主进程内直接创建 WebContentsView 加载 LINE MV3 扩展页
 * （chrome-extension://<id>/index.html），作为主窗口 contentView 的
 * 原生子视图 —— LINE 内容真正渲染在宿主主界面内，随宿主缩放 / 移动 /
 * 最小化，键盘焦点可靠，无任何窗口 hack。
 *
 * 每账号使用独立 partition（persist:line-<accountId>）隔离登录态；
 * 扩展 / shim / CLEANUP_JS（翻译 / 未读）注入逻辑复用 line-mode.ts。
 */
import { app, BrowserWindow, WebContentsView, session, shell } from 'electron'
import { join, dirname } from 'node:path'
import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  mkdirSync,
  cpSync,
  rmSync,
  renameSync,
  copyFileSync,
  appendFileSync,
  writeFileSync,
} from 'node:fs'
import type { SignalStatus } from '../../shared/types'
import type { WebContents as ElectronWebContents } from 'electron'
import { getAccount, updateAccountStatus, listAccounts } from './account-manager'

/**
 * line-mode 的按需加载句柄。
 *
 * line-mode.ts 身兼两职：既是 electron.vite.config.ts 里独立的子进程入口
 * （`electron.exe <...>/line-mode.js` 拉起的 LINE 子进程），又被宿主主进程
 * 复用它的 shim / 注入工具。
 *
 * 若在这里静态 import，Rollup 会把 line-mode.js 变成 app.js 的**顶层依赖**，
 * 主进程一启动就必须加载到它。打包环节只要有一点偏差（文件没进 asar），
 * 整个 App 就会在启动阶段崩掉，连其它平台都用不了。
 *
 * 改为运行时按需 require：LINE 未使用时完全不加载，出问题也只降级 LINE 功能。
 */
type LineModeLib = typeof import('../line-mode')
let lineModeCache: LineModeLib | null = null
function loadLineMode(): LineModeLib {
  if (!lineModeCache) {
    // 这里必须用 __dirname 拼接，不能写 '../line-mode'：
    // 源码里 line-manager.ts 在 services/ 下、相对 src/main 是 ../line-mode；
    // 但打包后所有代码都被 bundle 进 <out>/main/app.js，与 line-mode.js 同级，
    // 那条相对路径就变成了 <out>/line-mode（不存在）。Rollup 不会改写 require
    // 里的路径，所以由我们自己按运行时位置拼。
    lineModeCache = require(join(__dirname, 'line-mode.js')) as LineModeLib
  }
  return lineModeCache
}

/** 主进程 -> 渲染层 状态推送通道 */
export const LINE_STATE_CHANNEL = 'line:state'

export interface LineState {
  accountId: string
  status: SignalStatus
  pid: number | null
  unread: number
  embedded: boolean
  error?: string
}

export interface ScreenBounds {
  x: number
  y: number
  width: number
  height: number
}

interface Entry {
  accountId: string
  view: WebContentsView | null
  state: LineState
  lastBounds: ScreenBounds | null
  loaded: boolean
  attached: boolean
  viewGone: boolean
}

const entries = new Map<string, Entry>()
const extIdByPartition = new Map<string, string>()

let hostWindow: BrowserWindow | null = null
let extDirCache: string | null = null

/** LINE 关键操作日志：终端 + userData/line.log（打包后 console 不可见，落盘便于排查） */
function llog(line: string): void {
  try {
    appendFileSync(join(app.getPath('userData'), 'line.log'), `${new Date().toISOString()} ${line}\n`)
  } catch {
    /* ignore */
  }
  console.log(line)
}

/**
 * 登录态竞态兜底：LINE 扩展（SW/页面）可能在分区 Local Storage(leveldb) 尚未就绪时
 * 读取登录态，误判为未登录而停在登录页 —— 磁盘上 lcs_secure_ 数据实际完好。
 * 此时重载页面即可让扩展重读。仅当页面已渲染出"登录 UI"且页面内无 token 时触发。
 */
const LINE_LOGIN_UI_HINTS = [
  'log in', 'login', 'sign in', 'create account', 'register',
  '登入', '登录', '登錄', '登録', 'ログイン',
  'qr code', 'qrcode', '扫码', '掃碼', '電話號碼', '电话号码', 'phone number',
]
function isLineLoginUi(body: string): boolean {
  const b = body.toLowerCase()
  return LINE_LOGIN_UI_HINTS.some((h) => b.includes(h))
}
const authRetryCount = new WeakMap<ElectronWebContents, number>()

// ---------- 会话 Cookie(lct) 备份 / 回灌 ----------
// LINE 扩展免登依赖两件套：Local Storage 的 lcs_secure_ token（leveldb 持久化）
// + HttpOnly 会话 Cookie「lct」(line-chrome-gw.line-apps.com)。lct 是 session cookie
// （仅内存、不落盘，JWT 内 exp 约 7 天），应用完全退出即丢失 → 重启后 LINE 恢复
// 会话失败 → 永远停在扫码页（localStorage 的 token 还在，但缺另一半凭据）。
// 解法：登录成功/退出前把 lct 备份到 userData/line-lct/<accountId>.json，
// 下次启动 loadURL 前回灌回 partition session，即可稳定免登。
const LCT_BACKUP_DIR_NAME = 'line-lct'

function lctBackupDir(): string {
  return join(app.getPath('userData'), LCT_BACKUP_DIR_NAME)
}

/** 备份账号分区中 LINE 域的会话 Cookie（lct）。登录成功后 / 退出前调用（幂等）。 */
export async function backupLineCookies(accountId: string): Promise<void> {
  try {
    const ses = session.fromPartition(partitionFor(accountId))
    const cookies = await ses.cookies.get({})
    const line = cookies.filter(
      (c) =>
        c.name === 'lct' ||
        /line-apps\.com|(^|\.)line\.me$|line\.naver|line\.jp/i.test(String(c.domain || ''))
    )
    if (!line.length) {
      llog(`[line] cookie-backup ${accountId}: 无 LINE 会话 Cookie（未登录或不在线）`)
      return
    }
    const dir = lctBackupDir()
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, accountId + '.json'), JSON.stringify(line, null, 2), 'utf8')
    llog(`[line] cookie-backup ${accountId}: 已备份 ${line.length} 个 Cookie (${line.map((c) => c.name).join(',')})`)
  } catch (e) {
    llog('[line] cookie-backup 失败: ' + (e as Error).message)
  }
}

/** 回灌备份的 LINE 会话 Cookie（须在页面 loadURL 前调用）。 */
async function restoreLineCookies(accountId: string): Promise<void> {
  try {
    const file = join(lctBackupDir(), accountId + '.json')
    if (!existsSync(file)) return
    let list: Electron.Cookie[]
    try {
      list = JSON.parse(readFileSync(file, 'utf8'))
    } catch {
      return
    }
    if (!Array.isArray(list) || !list.length) return
    const ses = session.fromPartition(partitionFor(accountId))
    let ok = 0
    for (const c of list) {
      const host = String(c.domain || '').replace(/^\./, '')
      if (!host || !c.name) continue
      try {
        await ses.cookies.set({
          url: 'https://' + host + (c.path || '/'),
          name: c.name,
          value: c.value,
          path: c.path || '/',
          httpOnly: !!c.httpOnly,
          secure: !!c.secure,
          // Electron 枚举与原值一致（unspecified | no_restriction | lax | strict），直接透传
          sameSite: c.sameSite || 'unspecified',
          // 不设 expirationDate → 保持 session cookie 语义（进程内有效，重启后由本函数再回灌）
        })
        ok++
      } catch {
        /* 单个失败忽略 */
      }
    }
    llog(`[line] cookie-restore ${accountId}: 回灌 ${ok}/${list.length} 个 Cookie`)
  } catch (e) {
    llog('[line] cookie-restore 失败: ' + (e as Error).message)
  }
}

/** 递归复制分区目录。leveldb 的 LOCK 等文件可能被 Chromium 独占读不了，
 *  单个文件失败不应中断整体复制 —— 登录态真正存放在 .log/.ldb/MANIFEST/CURRENT 中。 */
function copyDirRobust(src: string, dst: string): void {
  mkdirSync(dst, { recursive: true })
  for (const name of readdirSync(src)) {
    const s = join(src, name)
    const d = join(dst, name)
    let st: ReturnType<typeof statSync>
    try {
      st = statSync(s)
    } catch {
      continue
    }
    if (st.isDirectory()) {
      copyDirRobust(s, d)
      continue
    }
    try {
      copyFileSync(s, d)
    } catch {
      llog('[line] 复制跳过(文件被占用): ' + s)
    }
  }
}

// ---------- 扩展 / partition ----------

function partitionFor(accountId: string): string {
  return 'persist:line-' + accountId
}

/** LINE 扩展目录：prod 走 resources/extensions/line；dev 走 <项目根>/resources/extensions/line */
function lineExtDir(): string | null {
  if (extDirCache) return extDirCache
  const roots = [
    join(process.resourcesPath, 'extensions', 'line'),
    join(app.getAppPath(), 'resources', 'extensions', 'line'),
  ]
  for (const root of roots) {
    try {
      if (!existsSync(root)) continue
      for (const sub of readdirSync(root)) {
        const dir = join(root, sub)
        if (existsSync(join(dir, 'manifest.json'))) {
          extDirCache = dir
          llog(`[line] 扩展目录=${dir}`)
          return dir
        }
      }
    } catch (e) {
      llog(`[line] 扫描扩展目录失败 root=${root} err=${(e as Error)?.message}`)
    }
  }
  llog(`[line] LINE 扩展目录未找到 resourcesPath=${process.resourcesPath} appPath=${app.getAppPath()}`)
  console.error('[line] LINE 扩展目录未找到')
  return null
}

/** 账号 partition 的 session 加载扩展（每 partition 一次），返回扩展 id */
async function ensureExtensionLoaded(accountId: string): Promise<string | null> {
  const partition = partitionFor(accountId)
  const hit = extIdByPartition.get(partition)
  if (hit) return hit
  const extDir = lineExtDir()
  if (!extDir) return null
  try {
    const ses = session.fromPartition(partition)
    const ext = await ses.loadExtension(extDir, { allowFileAccess: true })
    // shim 注入是文件级的（幂等），首次即可；必须在 loadURL 前完成
    const lineMode = loadLineMode()
    lineMode.ensureLineIndexShim(extDir, ext.id)
    // 打包后若安装目录只读，shim 注入会静默失败 → 页面白屏；这里落盘确认
    const mainJs = join(extDir, 'static', 'js', 'main.js')
    let shimOk = false
    try {
      shimOk = readFileSync(mainJs, 'utf8').includes(lineMode.LINE_SHIM_MARK)
    } catch {
      /* ignore */
    }
    llog(`[line] extension loaded partition=${partition} id=${ext.id} v=${ext.version} shim=${shimOk}`)
    console.log(`[line] extension loaded partition=${partition} id=${ext.id} v=${ext.version}`)
    extIdByPartition.set(partition, ext.id)
    return ext.id
  } catch (e) {
    llog(`[line] loadExtension 失败: ${(e as Error)?.message} extDir=${extDir}`)
    console.error('[line] loadExtension 失败:', e)
    return null
  }
}

// ---------- 状态 ----------

function createEntry(accountId: string): Entry {
  const entry: Entry = {
    accountId,
    view: null,
    state: { accountId, status: 'idle', pid: null, unread: 0, embedded: false },
    lastBounds: null,
    loaded: false,
    attached: false,
    viewGone: false,
  }
  entries.set(accountId, entry)
  return entry
}

function getEntry(accountId: string): Entry {
  return entries.get(accountId) || createEntry(accountId)
}

export function getLineState(accountId: string): LineState {
  return getEntry(accountId).state
}

function patchState(accountId: string, patch: Partial<LineState>): LineState {
  const entry = getEntry(accountId)
  entry.state = { ...entry.state, ...patch }
  updateAccountStatus(accountId, {
    lineStatus: entry.state.status,
    lineWindowId: entry.state.pid || undefined,
  })
  broadcast(accountId)
  return entry.state
}

function broadcast(accountId: string): void {
  if (!hostWindow || hostWindow.isDestroyed()) return
  hostWindow.webContents.send(LINE_STATE_CHANNEL, getEntry(accountId).state)
}

/**
 * 把主界面最新"译文显示设置"实时推给所有已打开的 LINE 会话，
 * 使已注入的译文徽章立即切换颜色（保存译文显示设置后调用）。
 */
export function pushLineBadgeStyle(): void {
  const styleCode = loadLineMode().badgeStyleCode()
  if (!styleCode) return
  for (const entry of entries.values()) {
    const wc = entry.view?.webContents
    if (!wc || wc.isDestroyed()) continue
    wc.executeJavaScript(styleCode).catch(() => {})
  }
}

// ---------- 视图 ----------

function createView(accountId: string): WebContentsView {
  const entry = getEntry(accountId)
  const view = new WebContentsView({
    webPreferences: {
      partition: partitionFor(accountId),
      contextIsolation: false,
      sandbox: false,
      nodeIntegration: false,
      backgroundThrottling: false,
    },
  })
  view.setBackgroundColor('#ffffff')

  const wc = view.webContents
  // LINE 内 OAuth / 帮助等外链走系统浏览器
  wc.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url).catch(() => {})
    }
    return { action: 'deny' }
  })

  // LINE 页面 console 转发到 line.log（诊断注入脚本是否生效）
  const onWcConsole = (...args: unknown[]): void => {
    const first = args[0]
    if (typeof first === 'object' && first !== null) {
      // Electron 新签名 (event, details)：details.message
      const details = first as { message?: unknown }
      if (details.message != null) llog(`[page:console] ${String(details.message)}`)
    } else {
      // 旧签名 (event, level, message, line, sourceId)
      const msg = String(args[1] ?? '')
      if (msg) llog(`[page:console] ${msg}`)
    }
  }
  wc.on('console-message', onWcConsole as never)

  // 注入 CLEANUP_JS（发送翻译 / 消息翻译 / 未读统计）+ 未读轮询回调
  loadLineMode().attachLinePage(wc, {
    forcePoll: true,
    onUnread: (n) => {
      if (entry.viewGone) return
      patchState(accountId, { unread: n })
    },
  })

  wc.on('did-fail-load', (_e, code, desc, url) => {
    if (entry.viewGone) return
    if (code === -3) return // ERR_ABORTED（导航取消，忽略）
    llog(`[line] 页面加载失败(${code}) ${desc} url=${url}`)
    console.error(`[line] 页面加载失败(${code}) ${desc}`)
    patchState(accountId, { status: 'error', embedded: false, error: `LINE 加载失败(${code}) ${desc}` })
  })

  wc.on('render-process-gone', (_e, details) => {
    if (entry.viewGone) return
    llog(`[line] render-process-gone ${details.reason} exitCode=${details.exitCode}`)
    console.error('[line] render-process-gone', details.reason)
    patchState(accountId, { status: 'error', embedded: false, error: 'LINE 页面已崩溃: ' + details.reason })
  })

  // 登录态竞态兜底：冷启动时扩展可能早于 Local Storage(leveldb) 就绪读取登录态 → 误判登出。
  // 若页面已渲染出登录 UI 且页面内无 token（磁盘数据实际完好）→ 重载让扩展重读，最多 2 次。
  wc.on('did-finish-load', () => {
    const attempt = (authRetryCount.get(wc) || 0) + 1
    authRetryCount.set(wc, attempt)
    setTimeout(async () => {
      if (wc.isDestroyed() || entry.viewGone) return
      try {
        const st = (await wc.executeJavaScript(`(() => {
          const keys = Object.keys(localStorage)
          return {
            hash: location.hash,
            hasLcs: keys.some(k => k.startsWith('lcs_secure_')),
            body: (document.body ? document.body.innerText : '').slice(0, 200),
            chromeId: (window.chrome && window.chrome.runtime && window.chrome.runtime.id) || '',
            root: document.getElementById('root') ? document.getElementById('root').childElementCount : -1,
          }
        })()`) as unknown) as { hash: string; hasLcs: boolean; body: string; chromeId: string; root: number }
        // chromeId 非空 = 扩展 main.js 头部 shim 已执行；root 子节点数 = React 是否真正挂载（0 且 body 空即"白屏"）
        llog(`[line] auth-detect ${accountId} attempt=${attempt} hash=${st.hash} hasLcs=${st.hasLcs} chromeId=${st.chromeId} root=${st.root} body="${st.body.replace(/\s+/g, ' ').slice(0, 80)}"`)
        if (st.hasLcs && !isLineLoginUi(st.body)) {
          // 已进入主界面（免登成功）→ 备份会话 Cookie(lct) 供下次启动回灌
          setTimeout(() => void backupLineCookies(accountId), 3000)
        } else if (!st.hasLcs && isLineLoginUi(st.body) && attempt <= 2) {
          llog(`[line] auth-race 触发重载 (attempt=${attempt})`)
          setTimeout(() => {
            if (!wc.isDestroyed() && !entry.viewGone) {
              try {
                wc.reload()
              } catch {
                /* ignore */
              }
            }
          }, 300)
        } else if (isLineLoginUi(st.body)) {
          // 登录页(hasLcs 或无 token)：等待用户扫码成功后进入主界面再备份。
          // SPA 内路由不会触发 did-finish-load，用轻量轮询兜底，最长 90s。
          const poll = setInterval(() => {
            if (wc.isDestroyed() || entry.viewGone) {
              clearInterval(poll)
              return
            }
            wc.executeJavaScript(
              `location.hash + '|' + (document.body ? document.body.innerText.slice(0, 300) : '')`
            )
              .then((raw) => {
                const s = String(raw)
                const hash = s.split('|')[0] || ''
                const body = s.split('|').slice(1).join('|')
                if (hash.includes('friends') || !isLineLoginUi(body)) {
                  clearInterval(poll)
                  setTimeout(() => void backupLineCookies(accountId), 3000)
                  llog(`[line] auth-watch ${accountId}: 检测到进入主界面(hash=${hash})，稍后备份 lct`)
                }
              })
              .catch(() => clearInterval(poll))
          }, 2500)
          setTimeout(() => clearInterval(poll), 90000)
        }
      } catch {
        /* ignore */
      }
    }, 2500)
  })

  entry.view = view
  return view
}

/** 宿主 DOM 浮层（modal 等）打开期间暂停 LINE 视图挂载，避免原生视图遮挡浮层 */
let overlayPaused = false

/** 把某账号的 LINE 视图挂到主窗口并置于前台（其他 LINE 视图先移除）。
 *  幂等：视图已挂载且没有其他视图遮挡时，不再 remove+add（Electron 摘除重挂会
 *  打断页面内输入框/IME 焦点，relocate 每 500ms 调用一次，绝不能重复重挂）。 */
function attachView(accountId: string): boolean {
  if (overlayPaused) return false
  const entry = getEntry(accountId)
  const cv = hostWindow?.contentView
  if (!entry.view || !cv) return false
  try {
    let othersAttached = false
    for (const [id, e] of entries) {
      if (id === accountId || !e.attached || !e.view) continue
      try {
        cv.removeChildView(e.view)
      } catch {
        /* ignore */
      }
      e.attached = false
      othersAttached = true
    }
    if (entry.attached) {
      if (othersAttached) {
        // 有其他视图曾盖在自身之上 → 重挂一次把自身提到最上层
        try {
          cv.removeChildView(entry.view)
        } catch {
          /* ignore */
        }
        entry.attached = false
        cv.addChildView(entry.view)
        entry.attached = true
      }
      if (entry.lastBounds) {
        try {
          entry.view.setBounds({ ...entry.lastBounds })
        } catch {
          /* ignore */
        }
      }
      return true
    }
    cv.addChildView(entry.view)
    entry.attached = true
    if (entry.lastBounds) {
      entry.view.setBounds({ ...entry.lastBounds })
    }
    return true
  } catch (e) {
    console.error('[line] addChildView 失败:', e)
    return false
  }
}

function detachView(accountId: string): void {
  const entry = getEntry(accountId)
  const cv = hostWindow?.contentView
  if (entry.attached && entry.view && cv) {
    try {
      cv.removeChildView(entry.view)
    } catch {
      /* ignore */
    }
    entry.attached = false
  }
}

// ---------- 对外 API（IPC 契约，与 ipc/line.ts 一一对应） ----------

/** 绑定宿主主窗口（LINE 视图挂载到其 contentView） */
export function bindLineHost(win: BrowserWindow | null): void {
  hostWindow = win
  if (!win) return
  win.on('closed', () => {
    hostWindow = null
  })
}

/** 启动账号：创建 WebContentsView + 加载扩展页 + 挂到主窗口 */
export async function launch(accountId: string): Promise<LineState> {
  const acc = getAccount(accountId)
  if (!acc || acc.platform !== 'line') {
    return patchState(accountId, { status: 'error', embedded: false, error: '账号不存在或平台非 LINE' })
  }
  const entry = getEntry(accountId)
  if (entry.view && entry.loaded && !entry.viewGone) {
    // 已在运行：前台化
    attachView(accountId)
    return patchState(accountId, { status: 'embedded', embedded: true, error: undefined })
  }
  if (entry.state.status === 'starting') return entry.state

  patchState(accountId, { status: 'starting', embedded: false, error: undefined })
  const extId = await ensureExtensionLoaded(accountId)
  if (!extId) {
    return patchState(accountId, { status: 'error', embedded: false, error: 'LINE 扩展加载失败' })
  }
  let view = entry.view
  if (!view || entry.viewGone) {
    entry.viewGone = false
    view = createView(accountId)
  }
  entry.loaded = true
  // 回灌会话 Cookie（lct）—— 否则冷启动(内存无 lct)恢复会话失败 → 停在扫码页
  await restoreLineCookies(accountId)
  void view.webContents
    .loadURL('chrome-extension://' + extId + '/index.html')
    .then(() => {
      if (!entry.viewGone) console.log(`[line] 页面加载完成 ${accountId}`)
    })
    .catch((e) => {
      console.error('[line] loadURL 失败:', e)
    })
  attachView(accountId)
  return patchState(accountId, { status: 'embedded', embedded: true, error: undefined })
}

/** 幂等重挂载（launch 后兜底 / 切换回该账号） */
export function embed(accountId: string): LineState {
  const entry = getEntry(accountId)
  if (!entry.view || entry.viewGone) {
    void launch(accountId)
    return entry.state
  }
  attachView(accountId)
  return patchState(accountId, { status: 'embedded', embedded: true, error: undefined })
}

/** 按宿主 UI 内容区 rect（renderer 每 500ms 上报）定位视图 */
export function relocate(accountId: string, bounds: ScreenBounds): LineState {
  const entry = getEntry(accountId)
  entry.lastBounds = bounds
  if (entry.view && !entry.viewGone && hostWindow && !hostWindow.isDestroyed()) {
    attachView(accountId)
    try {
      entry.view.setBounds({ x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height })
    } catch (e) {
      console.error('[line] setBounds 失败:', e)
    }
  }
  return entry.state
}

/** 离开账号视图：从主窗口移除视图（页面保留，切换回时 embed 恢复） */
export function detach(accountId: string): LineState {
  const entry = getEntry(accountId)
  if (entry.state.status === 'embedded') {
    detachView(accountId)
    return patchState(accountId, { status: 'running', embedded: false })
  }
  return entry.state
}

/** 健康检查：返回当前状态 */
export function health(accountId: string): LineState {
  return getEntry(accountId).state
}

/** 未读（宿主内由 attachLinePage 轮询回调驱动；renderer 也可经 IPC 写入） */
export function setUnread(accountId: string, n: number): LineState {
  return patchState(accountId, { unread: n })
}

/** 关闭账号：销毁视图（partition 登录态保留） */
export function reset(accountId: string): LineState {
  const entry = getEntry(accountId)
  detachView(accountId)
  if (entry.view && !entry.viewGone) {
    const wc = entry.view.webContents
    entry.view = null
    entry.loaded = false
    entry.viewGone = true
    try {
      wc.close()
    } catch {
      /* ignore */
    }
  }
  entry.lastBounds = null
  return patchState(accountId, { status: 'idle', pid: null, unread: 0, embedded: false, error: undefined })
}

// ---------- 登录数据回收 / 恢复（删除账号后重新添加可免扫码） ----------

/** 账号分区在磁盘上的目录（persist:line-<id> -> userData/Partitions/line-<id>） */
function partitionStoreDir(accountId: string): string {
  return join(app.getPath('userData'), 'Partitions', 'line-' + accountId)
}

/** 登录数据回收区 */
function lineTrashDir(): string {
  return join(app.getPath('userData'), 'Partitions', '.line-trash')
}

/** Local Storage leveldb 中出现 lcs_secure_ 即视为存在有效 LINE 登录态 */
function hasLineSession(dir: string): boolean {
  const lsDir = join(dir, 'Local Storage', 'leveldb')
  try {
    if (!existsSync(lsDir)) return false
    const needle = Buffer.from('lcs_secure_')
    for (const f of readdirSync(lsDir)) {
      const full = join(lsDir, f)
      const st = statSync(full)
      if (!st.isFile() || st.size === 0) continue
      const buf = readFileSync(full)
      if (buf.includes(needle)) return true
    }
  } catch {
    /* Chromium 占用导致读取失败时视作无效即可 */
  }
  return false
}

/** 删除 LINE 账号时调用：把登录态移入回收区。
 *  注意：这里绝不能同步删除正在被 Chromium 存储线程使用的分区目录，
 *  否则会触发存储层 CHECK（0xC0000409）导致整个主进程闪退。
 *  因此采用「rename 整目录」优先 —— 即使 Chromium 句柄仍指向目录内文件，
 *  移动目录也不会破坏其写入；rename 失败（仍被独占）时降级为复制，且不再删除源目录。 */
export function retireAccountData(accountId: string): void {
  const src = partitionStoreDir(accountId)
  try {
    if (!existsSync(src)) return
    const trash = lineTrashDir()
    mkdirSync(trash, { recursive: true })
    const dst = join(trash, `line-${accountId}-${Date.now()}`)
    try {
      renameSync(src, dst)
      llog('[line] 登录数据已移入回收区: ' + dst)
      return
    } catch (e) {
      llog('[line] rename 失败(分区仍被 Chromium 占用)，改用逐文件复制: ' + (e as Error).message)
    }
    try {
      copyDirRobust(src, dst)
      llog('[line] 登录数据已复制入回收区(源分区保留): ' + dst)
    } catch (e) {
      llog('[line] 回收登录数据失败: ' + (e as Error).message)
    }
  } catch (e) {
    llog('[line] 回收登录数据失败: ' + (e as Error).message)
  }
}

/** 应用启动时调用：把不属于任何账号的残留 LINE 分区（此前删除未回收干净的）移入回收区。
 *  启动阶段尚无 LINE 视图 / Chromium 未占用该目录，移动最可靠。
 *  其中若含登录态（lcs_secure_），之后重新添加 LINE 账号时 tryRestoreLoginData 可自动恢复免扫码。 */
export function reconcileOrphanLinePartitions(): void {
  try {
    const base = join(app.getPath('userData'), 'Partitions')
    if (!existsSync(base)) return
    const active = new Set(
      listAccounts()
        .filter((a) => a.platform === 'line')
        .map((a) => 'line-' + a.id)
    )
    const trash = lineTrashDir()
    mkdirSync(trash, { recursive: true })
    let moved = 0
    for (const name of readdirSync(base)) {
      if (!name.startsWith('line-acc_') || active.has(name)) continue
      const src = join(base, name)
      const dst = join(trash, `${name}-recon-${Date.now()}`)
      try {
        renameSync(src, dst)
        moved++
        llog(`[line] 启动回收孤儿分区 ${name} -> ${dst}`)
      } catch (e) {
        llog('[line] 孤儿分区回收失败(占用): ' + name + ' ' + (e as Error).message)
      }
    }
    if (moved) llog(`[line] 启动共回收孤儿分区 ${moved} 个`)
  } catch (e) {
    llog('[line] 启动回收孤儿分区失败: ' + (e as Error).message)
  }
}

/** 删除账号后调用：清理该账号在内存中的 LINE 运行状态（entry / 扩展映射） */
export function dispose(accountId: string): void {
  try {
    if (entries.has(accountId)) {
      reset(accountId)
    }
    entries.delete(accountId)
  } catch {
    /* ignore */
  }
  // 删除账号时同步清理其 lct 备份，避免残留误回灌到新账号分区
  try {
    const f = join(lctBackupDir(), accountId + '.json')
    if (existsSync(f)) rmSync(f, { force: true })
  } catch {
    /* ignore */
  }
}

/** 添加 LINE 账号后调用：回收区有登录态时取最近一次删除的数据恢复至新账号分区 */
export function tryRestoreLoginData(accountId: string): boolean {
  try {
    const dst = partitionStoreDir(accountId)
    if (existsSync(dst)) return false
    const trash = lineTrashDir()
    if (!existsSync(trash)) return false
    const cands: { p: string; t: number }[] = []
    for (const name of readdirSync(trash)) {
      const p = join(trash, name)
      if (!hasLineSession(p)) continue
      let t = 0
      try {
        t = statSync(p).mtimeMs
      } catch {
        continue
      }
      cands.push({ p, t })
    }
    if (!cands.length) {
      llog(`[line] tryRestore ${accountId}: 回收区无可恢复的登录数据`)
      return false
    }
    // 最近一次删除的最可能对应刚删掉想恢复的账号
    cands.sort((a, b) => b.t - a.t)
    const src = cands[0].p
    mkdirSync(dirname(dst), { recursive: true })
    try {
      cpSync(src, dst, { recursive: true })
    } catch (e) {
      llog(`[line] tryRestore ${accountId}: 复制失败 ${src} -> ${dst} ${(e as Error).message}`)
      return false
    }
    llog(`[line] tryRestore ${accountId}: 已从回收区恢复登录数据 <- ${src}`)
    try {
      rmSync(src, { recursive: true, force: true })
    } catch {
      /* ignore */
    }
    return true
  } catch (e) {
    console.error('[line] 恢复登录数据失败:', e)
    return false
  }
}

/** 宿主退出：销毁所有 LINE 视图 */
export function cleanupAllLines(): void {
  for (const accountId of [...entries.keys()]) {
    // 退出前尽力备份会话 Cookie（异步、不阻塞退出；主保险是登录成功后的备份）
    void backupLineCookies(accountId)
    reset(accountId)
  }
  extIdByPartition.clear()
}

/** 宿主窗口 move / resize 后重定位所有已挂载视图 */
export function relocateAllLineEmbedded(): void {
  for (const [, e] of entries) {
    if (e.attached && e.view && !e.viewGone && e.lastBounds) {
      try {
        e.view.setBounds({ ...e.lastBounds })
      } catch {
        /* ignore */
      }
    }
  }
}

/** 宿主 DOM 浮层（modal 等）打开时暂停 LINE 视图；全部关闭后恢复。
 *  暂停期间 relocate 心跳触发的 attachView 会被拦截，避免 LINE 视图重新盖住浮层。 */
export function setOverlayPaused(paused: boolean): void {
  if (paused === overlayPaused) return
  overlayPaused = paused
  if (paused) {
    for (const [id, e] of entries) {
      if (e.attached && e.view && !e.viewGone) {
        detachView(id)
        return
      }
    }
  } else {
    // 恢复当前处于嵌入式状态的账号视图（attachView 会按 lastBounds 重新定位）
    for (const [id, e] of entries) {
      if (e.state.embedded && e.view && !e.viewGone && e.lastBounds) {
        attachView(id)
        return
      }
    }
  }
}
