/**
 * 软件自更新服务：对接自建更新后台（update.php / download.php）
 *
 * - update.php：GET 查询参数检查更新（platform=windows / channel=stable / version=当前版本）
 * - download.php：流式下载安装包（支持进度），下载后按后台返回的 sha256 校验完整性
 * - 校验通过后：静默运行安装器（NSIS /S）并退出应用，实现升级
 *
 * 流程状态统一通过 IPC.UpdaterStatePush 推送给所有窗口（渲染层据此更新按钮/弹窗）。
 * 服务器地址复用授权服务器配置（由用户登录页"设置"填写，默认不内置）。
 */
import { app, BrowserWindow, ipcMain, net } from 'electron'
import { createHash } from 'crypto'
import { createWriteStream, createReadStream, existsSync, mkdirSync, readdirSync, rmSync, appendFileSync } from 'fs'
import { join } from 'path'
import { spawn } from 'child_process'
import {
  IPC,
  type UpdateRelease,
  type UpdaterCheckResult,
  type UpdaterState,
  type UpdaterStatus,
} from '../../shared/types'
import { getAuthConfig } from './auth'
import { netRequest } from './net-request'
import { killAllSignalsNow } from './signal-manager'
import { killAllMessengerNow } from './messenger-window-manager'

const UPDATER_CHANNEL = 'stable'

/**
 * 上报给更新后台的平台标识（后台据此返回对应平台的安装包）。
 * macOS 必须区别于 windows：后台只认 'windows' 时会把 .exe 发回来，
 * client 端再去 spawn 一个 .exe 必然失败。
 */
const UPDATER_PLATFORM = process.platform === 'darwin' ? 'macos' : process.platform === 'win32' ? 'windows' : 'linux'

/** 本平台安装包的扩展名（清理历史安装包时用） */
const INSTALLER_EXT = process.platform === 'darwin' ? '.zip' : '.exe'

/** macOS 上 app bundle 的名字，用于替换 /Applications 下的旧版本 */
function currentAppBundleName(): string {
  return `${app.getName()}.app`
}

// ---------------------------------------------------------------------------
// 状态
// ---------------------------------------------------------------------------

/** 最近一次检查到的最新版本信息 */
let latest: UpdateRelease | null = null
/** 当前状态 */
let status: UpdaterStatus = 'idle'
/** 下载进度（百分比 0-100） */
let progressPercent = 0
let downloadedBytes = 0
let totalBytes = 0
/** 已校验通过的安装包绝对路径 */
let installerPath: string | null = null
/** 下载/安装进行中（防重入） */
let busy = false
/** 当前进行中的下载请求（用于取消） */
let activeDownloadReq: Electron.ClientRequest | null = null
/** 用户是否主动取消了本次下载 */
let cancelRequested = false

// 进度推送节流
let lastPushTime = 0
let lastPushPercent = -1

// ---------------------------------------------------------------------------
// 工具
// ---------------------------------------------------------------------------

function serverBase(): string {
  const c = getAuthConfig()
  // 不内置默认服务器 IP；host 由授权设置提供，为空时无更新源（更新检查自然失败/跳过）
  const host = c.host && !/^https?:\/\//i.test(c.host) ? `http://${c.host}` : c.host || ''
  return host ? `${host}:${c.port}` : ''
}

function resolveDownloadUrl(u: string): string {
  if (/^https?:\/\//i.test(u)) return u
  return serverBase() + (u.startsWith('/') ? u : `/${u}`)
}

function currentState(): UpdaterState {
  return {
    status,
    currentVersion: app.getVersion(),
    latestVersion: latest?.version,
    progress: progressPercent,
    downloadedBytes,
    totalBytes,
    releaseNotes: latest?.release_notes,
    isForce: latest?.is_force,
    fileSize: latest?.file_size,
  }
}

function pushState(message?: string): void {
  const payload = currentState()
  if (message) payload.message = message
  for (const w of BrowserWindow.getAllWindows()) {
    // 退出/关窗过程中窗口可能已销毁，向已销毁的 webContents send 会抛异常导致闪退
    if (w.isDestroyed() || w.webContents.isDestroyed()) continue
    w.webContents.send(IPC.UpdaterStatePush, payload)
  }
}

function setStatus(s: UpdaterStatus, message?: string): void {
  status = s
  if (s !== 'downloading') {
    progressPercent = 0
    downloadedBytes = 0
    totalBytes = 0
  }
  pushState(message)
}

function setError(message: string): void {
  busy = false
  status = 'error'
  pushState(message)
}

/** updater 关键动作日志：userData/updater.log（打包后 console 不可见，落盘便于排查） */
function ulog(line: string): void {
  try {
    appendFileSync(join(app.getPath('userData'), 'updater.log'), `${new Date().toISOString()} ${line}\n`)
  } catch {
    /* ignore */
  }
  console.log(`[updater] ${line}`)
}

/** 安装包目录（与 updater.log 同级的 userData/updates） */
function updatesDir(): string {
  return join(app.getPath('userData'), 'updates')
}

/** 本地安装包文件名；downloadUpdate 写入与安装时读取都用它，保证可复用 */
function installerNameOf(version: string): string {
  if (process.platform === 'darwin') {
    return `cyht-mac-${process.arch}-${version}.zip`
  }
  return `cyht-setup-${version}.exe`
}

/** 流式计算文件 sha256（仅在新版本复用校验时调用，200MB 约 0.3~1s） */
function sha256OfFile(file: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256')
    const rs = createReadStream(file)
    rs.on('data', (chunk) => hash.update(chunk))
    rs.on('error', reject)
    rs.on('end', () => resolve(hash.digest('hex').toLowerCase()))
  })
}

/**
 * 尝试复用本地已下载的安装包。
 *
 * 修复"更新失败后重开应用又从头下载一遍"：只要本地存在同版本、且 sha256 与
 * 服务器返回一致的安装包，就直接拿来用，不再走一次完整下载。
 * sha256 不一致（下载被截断/文件被替换）时删除该文件并返回 null，让调用方正常重下。
 */
async function tryReuseLocalInstaller(rel: UpdateRelease): Promise<string | null> {
  const expect = (rel.sha256 || '').toLowerCase()
  if (!expect) return null
  const file = join(updatesDir(), installerNameOf(rel.version))
  try {
    if (!existsSync(file)) return null
    const actual = await sha256OfFile(file)
    if (actual !== expect) {
      ulog(`reuse 本地包校验不通过，删除 file=${file}`)
      rmSync(file, { force: true })
      return null
    }
    ulog(`reuse 命中本地安装包 file=${file}`)
    return file
  } catch (e) {
    ulog(`reuse 检查异常: ${e instanceof Error ? e.message : String(e)}`)
    return null
  }
}

// ---------------------------------------------------------------------------
// 检查更新
// ---------------------------------------------------------------------------

/**
 * 立即检查更新（update.php）。结果同时推送给渲染层（update-found / no-update / error）。
 */
export async function checkForUpdates(): Promise<UpdaterCheckResult> {
  if (busy || status === 'installing') {
    return { hasUpdate: false, error: '更新正在进行中，请稍候' }
  }
  // 未配置授权/更新服务器地址时直接跳过（安装包不含默认服务器 IP）
  if (!serverBase()) {
    return { hasUpdate: false, error: '' }
  }
  status = 'checking'
  pushState('正在检查更新…')
  latest = null
  ulog(`checkForUpdates base=${serverBase()} curVer=${app.getVersion()}`)
  try {
    const url = `${serverBase()}/api/update.php?platform=${UPDATER_PLATFORM}&channel=${UPDATER_CHANNEL}&version=${encodeURIComponent(app.getVersion())}`
    const res = await netRequest({ url, method: 'GET', timeoutMs: 15000 })
    if (res.status !== 200) {
      setError(`更新服务器异常（HTTP ${res.status}）`)
      return { hasUpdate: false, error: `HTTP ${res.status}` }
    }
    let data: unknown
    try {
      data = JSON.parse(res.body)
    } catch {
      setError('更新服务器响应格式错误')
      return { hasUpdate: false, error: '响应不是有效 JSON' }
    }
    const d = data as { code?: number; msg?: string; data?: { has_update?: boolean; latest?: UpdateRelease | null } }
    if (d.code !== 0) {
      setError(d.msg || '检查更新失败')
      return { hasUpdate: false, error: d.msg || `业务错误 ${d.code}` }
    }
    const hasUpdate = !!d.data?.has_update && !!d.data?.latest
    if (!hasUpdate) {
      status = 'no-update'
      pushState('当前已是最新版本')
      return { hasUpdate: false, latest: null }
    }
    const rel = d.data!.latest!
    latest = rel
    // 版本号相同视为无需更新（防御后台状态不一致）
    if (rel.version === app.getVersion()) {
      latest = null
      status = 'no-update'
      pushState('当前已是最新版本')
      return { hasUpdate: false, latest: null }
    }
    status = 'update-found'
    pushState(`发现新版本 ${rel.version}`)
    ulog(`checkForUpdates found newVer=${rel.version} file=${rel.file_size || ''} sha=${(rel.sha256 || '').slice(0, 8)}`)
    // 本地已有同版本、校验通过的安装包时直接进入"可安装"，避免重复下载
    const reused = await tryReuseLocalInstaller(rel)
    if (reused) {
      installerPath = reused
      status = 'verified'
      progressPercent = 100
      pushState('安装包已就绪，可直接安装')
    } else {
      installerPath = null
    }
    return { hasUpdate: true, latest: rel }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    setError(`无法连接更新服务器：${msg}`)
    return { hasUpdate: false, error: msg }
  }
}

// ---------------------------------------------------------------------------
// 下载（流式 + sha256 校验）
// ---------------------------------------------------------------------------

/**
 * 下载最新安装包（download.php）并做 sha256 校验。
 * 成功后状态为 verified，installerPath 指向已校验通过的安装包。
 */
export async function downloadUpdate(): Promise<{ ok: boolean; error?: string }> {
  if (!latest) return { ok: false, error: '尚未检查到可用更新' }
  if (busy || status === 'installing') return { ok: false, error: '更新正在进行中，请稍候' }
  if (status === 'verified' && installerPath && existsSync(installerPath)) return { ok: true }

  const rel = latest
  const dir = updatesDir()
  const targetName = installerNameOf(rel.version)
  const target = join(dir, targetName)
  try {
    mkdirSync(dir, { recursive: true })
    // 清理**其它版本**的历史安装包，避免积压占用磁盘；
    // 保留本次目标包，这样安装失败后重开应用无需重新下载。
    for (const f of readdirSync(dir)) {
      if (!f.toLowerCase().endsWith(INSTALLER_EXT) || f === targetName) continue
      try {
        rmSync(join(dir, f), { force: true })
      } catch {
        /* 忽略单个清理失败 */
      }
    }
  } catch {
    /* 目录不可用时下载阶段会报错 */
  }

  // 本地已有同版本且 sha256 校验通过的安装包：直接复用，不再走一次完整下载
  const reused = await tryReuseLocalInstaller(rel)
  if (reused) {
    installerPath = reused
    status = 'verified'
    progressPercent = 100
    pushState('安装包已就绪（使用本地已下载文件），可直接安装')
    ulog(`downloadUpdate reuse ok file=${reused}`)
    return { ok: true }
  }

  installerPath = target
  busy = true
  progressPercent = 0
  downloadedBytes = 0
  totalBytes = 0
  status = 'downloading'
  pushState('开始下载更新包…')

  return new Promise((resolve) => {
    let req: Electron.ClientRequest
    try {
      req = net.request({ method: 'GET', url: resolveDownloadUrl(rel.download_url) })
    } catch (e) {
      busy = false
      setError(`无法发起下载请求：${e instanceof Error ? e.message : String(e)}`)
      resolve({ ok: false, error: String(e) })
      return
    }
    try {
      req.setHeader('User-Agent', `cyht-translator-app/${app.getVersion()}`)
    } catch {
      /* 忽略 */
    }

    activeDownloadReq = req
    cancelRequested = false

    const fail = (msg: string, err?: unknown): void => {
      if (activeDownloadReq === req) activeDownloadReq = null
      busy = false
      try {
        rmSync(target, { force: true })
      } catch {
        /* 忽略 */
      }
      if (cancelRequested) {
        // 用户主动取消：回到 idle（不报错），等 renderer 关闭弹窗
        cancelRequested = false
        status = 'idle'
        pushState('已取消下载')
        resolve({ ok: false, error: '已取消' })
        return
      }
      setError(msg)
      resolve({ ok: false, error: err instanceof Error ? err.message : msg })
    }

    req.on('response', (response) => {
      const httpStatus = response.statusCode ?? 0
      if (httpStatus !== 200) {
        // 丢弃非 200 响应体（download.php 对不可下载的包返回 404 纯文本）
        response.on('data', () => {})
        fail(`下载失败（HTTP ${httpStatus}）`)
        return
      }
      const ws = createWriteStream(target)
      const hash = createHash('sha256')
      totalBytes = Number(response.headers['content-length'] ?? 0) || 0
      let received = 0
      let writeClosed = false

      const maybePush = (): void => {
        const now = Date.now()
        const pct = totalBytes ? Math.min(100, Math.round((received / totalBytes) * 100)) : 0
        progressPercent = pct
        downloadedBytes = received
        if (now - lastPushTime >= 300 || pct - lastPushPercent >= 2) {
          lastPushTime = now
          lastPushPercent = pct
          pushState()
        }
      }

      response.on('data', (chunk: Buffer) => {
        received += chunk.length
        hash.update(chunk)
        void ws.write(chunk)
        maybePush()
      })

      response.on('end', () => {
        if (writeClosed) return
        writeClosed = true
        ws.end(() => {
          if (activeDownloadReq === req) activeDownloadReq = null
          // 校验 sha256
          const actual = hash.digest('hex').toLowerCase()
          const expect = (rel.sha256 || '').toLowerCase()
          if (expect && actual !== expect) {
            fail('安装包校验失败（sha256 不匹配），已删除，请重新下载')
            return
          }
          busy = false
          progressPercent = 100
          status = 'verified'
          pushState('下载完成，校验通过，可以安装')
          ulog(`downloadUpdate verified ok bytes=${totalBytes} sha=${(rel.sha256 || '').slice(0, 8)}`)
          resolve({ ok: true })
        })
      })

      response.on('error', (e) => fail('下载中断', e))
      response.on('aborted', () => fail('下载已中断'))

      ws.on('error', (e) => fail('写入文件失败', e))
    })

    req.on('error', (e) => fail('下载请求失败', e))
    req.end()
  })
}

/** 取消正在进行的下载（下载中 renderer"稍后再说"可取消并关闭弹窗） */
export function cancelDownload(): void {
  if (activeDownloadReq) {
    cancelRequested = true
    try {
      activeDownloadReq.abort()
    } catch {
      /* 忽略 */
    }
    activeDownloadReq = null
  } else {
    // 无进行中请求：直接回 idle
    busy = false
    cancelRequested = false
    setStatus('idle', '已取消下载')
  }
}

// ---------------------------------------------------------------------------
// 安装（静默运行安装器并退出）
// ---------------------------------------------------------------------------

/** 运行一条外部命令；非 0 退出码或启动失败都 reject */
function runCmd(file: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const child = spawn(file, args, { stdio: 'ignore' })
      child.on('error', (e) => reject(e))
      child.on('exit', (code) => {
        if (code === 0) resolve()
        else reject(new Error(`${file} 退出码 ${code ?? '?'}`))
      })
    } catch (e) {
      reject(e instanceof Error ? e : new Error(String(e)))
    }
  })
}

/**
 * macOS 安装：把下载好的 zip 解到临时目录，然后替换 /Applications/<产品名>.app。
 *
 * 用 ditto 而不是 unzip/cp：ditto -x -k 处理 macOS zip 里的元数据与符号链接，
 * ditto src dst 也会带上资源 fork，替换后的 app 仍保留原有签名/权限结构。
 *
 * 失败时会先把备份的旧版本放回去（替换到一半失败时不能把用户的应用弄没了），
 * 再把原因回给界面，引导用户手动拖入「应用程序」文件夹。
 */
async function installOnMacOs(zipPath: string): Promise<void> {
  const bundle = currentAppBundleName()
  const target = join('/Applications', bundle)
  const staging = join(app.getPath('temp'), `cyht-update-${Date.now()}`)

  ulog(`installOnMacOs start zip=${zipPath} target=${target}`)

  rmSync(staging, { recursive: true, force: true })
  mkdirSync(staging, { recursive: true })
  pushState('正在解压安装包…')
  await runCmd('/usr/bin/ditto', ['-x', '-k', zipPath, staging])

  const entry = readdirSync(staging).find((n) => n.toLowerCase().endsWith('.app'))
  if (!entry) throw new Error('安装包里没有找到 .app 应用包，请手动解压安装')
  const srcApp = join(staging, entry)

  pushState('正在替换应用程序…')
  /** 旧版本临时挪到 .old-<ts>；替换失败时把它搬回来 */
  let backup = ''
  if (existsSync(target)) {
    backup = `${target}.old-${Date.now()}`
    try {
      await runCmd('/bin/mv', [target, backup])
    } catch (e) {
      throw new Error(`无法写入 /Applications（${e instanceof Error ? e.message : String(e)}）。请手动把安装包解压后拖入「应用程序」文件夹`)
    }
  }

  try {
    await runCmd('/usr/bin/ditto', [srcApp, target])
  } catch (e) {
    if (backup) {
      await runCmd('/bin/mv', [backup, target]).catch(() => {
        /* 还原失败也要把 staging 清掉，下面统一处理 */
      })
      backup = ''
    }
    rmSync(staging, { recursive: true, force: true })
    throw new Error(`替换 ${bundle} 失败：${e instanceof Error ? e.message : String(e)}。请手动安装`)
  }

  // 去隔离属性：ad-hoc 签名的包替换后再被打上 quarantine 会被 Gatekeeper 拦住
  await runCmd('/usr/bin/xattr', ['-dr', 'com.apple.quarantine', target]).catch(() => {
    /* 非关键 */
  })

  rmSync(staging, { recursive: true, force: true })
  if (backup) rmSync(backup, { recursive: true, force: true })
  ulog(`installOnMacOs 替换完成 ${target}`)

  // 拉起新版，再退出旧进程（退出前同样要收掉 Signal / Messenger 的 detached 子进程）
  pushState('正在重启应用…')
  try {
    const opener = spawn('/usr/bin/open', ['-n', '-a', target], { detached: true, stdio: 'ignore' })
    opener.on('error', () => {
      /* ignore */
    })
    opener.unref()
  } catch {
    /* ignore */
  }
  try {
    killAllSignalsNow()
    killAllMessengerNow()
  } catch {
    /* ignore */
  }
  await new Promise((r) => setTimeout(r, 1500))
  ulog('installOnMacOs app.exit(0)')
  app.exit(0)
}

/**
 * 启动安装器（NSIS 更新模式 + 静默安装），随后退出当前应用进程。
 *
 * 关键点：
 * 1) 必须带 `--updated`。electron-builder 的 NSIS 模板用 `${isUpdated}` 区分
 *    "升级"与"全新安装"：不带该参数时安装器会按首次安装处理（重建快捷方式、
 *    不复用原安装目录），并且检测到旧进程仍在运行时只做一次强杀尝试；带上之后
 *    它会先给旧进程 1.3s 优雅退出时间再强杀，正是"点按钮后退出"的场景。
 * 2) 退出前必须确认安装器**真的活着**。旧实现固定等 1.2s 就 app.exit(0)，
 *    若安装器因 UAC 被拒 / 被安全软件拦截 / 立即报错而秒退，应用照样关闭，
 *    用户看到的就是"软件关了但什么都没装"，重开后又得重新下载。
 *    这里改为观察一小段窗口期：安装器提前非正常退出则**不退出应用**，
 *    把失败原因（含安装包路径）回抛给界面，用户可以手动双击安装包。
 */
export function installUpdate(): Promise<void> {
  return new Promise((resolve) => {
    if (status !== 'verified' || !installerPath) {
      ulog(`installUpdate EARLY-RETURN status=${status} hasInstaller=${!!installerPath} (renderer 点了安装但主进程状态已非 verified)`)
      setStatus('error', '安装包尚未就绪，无法安装')
      resolve()
      return
    }
    if (!existsSync(installerPath)) {
      ulog(`installUpdate EARLY-RETURN 安装包已不存在: ${installerPath}`)
      installerPath = null
      setStatus('error', '安装包已不存在，请重新下载')
      resolve()
      return
    }
    status = 'installing'
    busy = true
    pushState('正在启动安装程序…')
    ulog(`installUpdate begin installer=${installerPath} ver=${latest?.version || ''}`)

    // macOS 没有可执行安装器：走「解压 zip → 替换 /Applications 下的 app bundle」路线
    if (process.platform === 'darwin') {
      installOnMacOs(installerPath)
        .then(() => resolve())
        .catch((e) => {
          const msg = e instanceof Error ? e.message : String(e)
          ulog(`installUpdate macOS EXC: ${msg}`)
          busy = false
          setStatus('error', msg)
          resolve()
        })
      return
    }

    let spawned = false
    /** 是否已就"是否退出应用"做出决定，避免 exit / error / timer 重复处理 */
    let settled = false
    /** 观察窗口定时器（先声明，供下方事件回调清理） */
    let timer: ReturnType<typeof setTimeout> | null = null
    let child: ReturnType<typeof spawn>
    try {
      // --updated：升级语义（复用安装目录、跳过冗余页面、宽容等待旧进程退出）
      // /S：静默安装，安装期间不需要用户交互
      child = spawn(installerPath, ['--updated', '/S'], { detached: true, stdio: 'ignore' })
      ulog('installUpdate spawn called args=[--updated, /S]')
    } catch (e) {
      ulog(`installUpdate spawn EXC: ${e instanceof Error ? e.message : String(e)}`)
      setStatus('error', `启动安装程序失败：${e instanceof Error ? e.message : String(e)}`)
      resolve()
      return
    }

    const quitApp = (): void => {
      // app.exit 不触发 before-quit：这里同样要显式结束 Signal / Messenger
      // 的 detached 子进程，否则升级安装期间它们会残留占用旧文件。
      try {
        killAllSignalsNow()
        killAllMessengerNow()
      } catch {
        /* ignore */
      }
      ulog('installUpdate calling app.exit(0)')
      app.exit(0)
    }

    child.once('spawn', () => {
      spawned = true
      try {
        child.unref()
      } catch {
        /* ignore */
      }
      ulog(`installUpdate spawned=true pid=${child.pid ?? '?'}`)
    })
    child.on('error', (e) => {
      ulog(`installUpdate child error spawned=${spawned}: ${e.message}`)
      if (settled) return
      if (!spawned) {
        settled = true
        if (timer) clearTimeout(timer)
        setStatus('error', `启动安装程序失败：${e.message}`)
        resolve()
      }
    })
    child.on('exit', (code, sig) => {
      ulog(`installUpdate child exit code=${code} sig=${String(sig ?? '')} spawned=${spawned} settled=${settled}`)
      if (settled || !spawned) return
      // 安装器在观察窗口内就结束了：静默安装 200MB 的包不可能这么快完成，
      // 基本可判定"安装没有真正进行"（UAC 被拒 / 被拦截 / 参数被拒等）。
      // 此时绝不能关掉应用，否则用户只会看到"软件莫名其妙关了"。
      settled = true
      if (timer) clearTimeout(timer)
      if (code === 0) {
        // 退出码 0：可能是安装器已把工作交给提权后的新进程，按正常流程退出
        ulog('installUpdate 安装器提前正常结束（code=0），仍按正常流程退出应用')
        resolve()
        quitApp()
        return
      }
      setStatus(
        'error',
        `安装程序未能继续（退出码 ${code ?? '?'}）。可手动打开安装包完成安装：${installerPath}`,
      )
      resolve()
    })
    // 观察窗口：安装器持续存活超过该时长即视为"已进入安装流程"，此时退出应用让出文件锁
    timer = setTimeout(() => {
      if (settled) return
      settled = true
      ulog(`installUpdate 观察窗口结束 spawned=${spawned} → 退出应用`)
      if (!spawned) {
        setStatus('error', '启动安装程序失败（进程未创建）')
        resolve()
        return
      }
      resolve()
      quitApp()
    }, 2500)
  })
}

// ---------------------------------------------------------------------------
// IPC 注册
// ---------------------------------------------------------------------------

export function registerUpdaterIpc(): void {
  ipcMain.handle(IPC.UpdaterCheck, () => checkForUpdates())
  ipcMain.handle(IPC.UpdaterDownload, () => {
    ulog('UpdaterInstall? no — UpdaterDownload invoked')
    return downloadUpdate()
  })
  ipcMain.handle(IPC.UpdaterInstall, () => {
    ulog(`UpdaterInstall invoked status=${status}`)
    return installUpdate()
  })
  ipcMain.handle(IPC.UpdaterCancel, () => {
    cancelDownload()
  })
}
