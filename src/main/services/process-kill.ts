import { spawn, spawnSync } from 'child_process'

/**
 * 跨平台「结束进程树」。
 *
 * 项目里 Signal / Messenger 子进程都是 `spawn(..., { detached: true })`：
 * 独立进程组，父进程 exit 后仍存活，会一直占着 profile 的 db.sqlite。
 *
 * - Windows：`taskkill /F /T /PID`（原来各服务里到处手写的一段，现在收敛到这里）
 * - macOS / Linux：`process.kill(-pid)` 杀进程组（detached 进程自成组长），
 *   失败再退化成只杀主 PID
 *
 * 出错一律静默吞掉：清理路径上抛异常没有意义，反而会被 uncaughtException
 * 捕获后写成「崩溃」日志。
 *
 * @param pid 子进程主 PID（Electron 主进程，其下还有 GPU/Renderer 子进程）
 * @param wait true=同步等待命令返回（进程退出前要用），false=派发后立刻返回
 */
export function killProcessTree(pid: number, wait: boolean): void {
  if (!pid) return
  try {
    if (process.platform === 'win32') {
      const args = ['/F', '/T', '/PID', String(pid)]
      if (wait) {
        spawnSync('taskkill', args, { stdio: 'ignore' })
      } else {
        const killer = spawn('taskkill', args, { detached: true, stdio: 'ignore' })
        // 不加 error 监听时 ENOENT 会冒成未捕获异常
        killer.on('error', () => {
          /* ignore */
        })
        killer.unref()
      }
      return
    }
    killPosixTree(pid)
  } catch {
    /* ignore */
  }
}

function killPosixTree(pid: number): void {
  try {
    // 负号 = 整个进程组
    process.kill(-pid, 'SIGKILL')
  } catch {
    try {
      process.kill(pid, 'SIGKILL')
    } catch {
      /* 已退出，或本进程无权 */
    }
  }
}
