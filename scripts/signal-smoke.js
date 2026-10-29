/** 临时冒烟测试：验证 user32 窗口嵌入机制（验证后删除） */
const { app, BrowserWindow } = require('electron')

app.disableHardwareAcceleration()

app.whenReady().then(async () => {
  const koffi = require('koffi')
  const user32 = koffi.load('user32.dll')
  const FindWindowA = user32.func('uintptr_t FindWindowA(const char* cls, const char* name)')
  const IsWindow = user32.func('bool IsWindow(uintptr_t hwnd)')
  const IsChild = user32.func('bool IsChild(uintptr_t parent, uintptr_t child)')
  const SetParent = user32.func('uintptr_t SetParent(uintptr_t child, uintptr_t parent)')
  const GetAncestor = user32.func('uintptr_t GetAncestor(uintptr_t hwnd, uint flags)')
  const MoveWindow = user32.func('bool MoveWindow(uintptr_t hwnd, int x, int y, int w, int h, bool repaint)')
  const GetWindowRect = user32.func('bool GetWindowRect(uintptr_t hwnd, void* rect)')
  const GetWindowLongPtrA = user32.func('long GetWindowLongPtrA(uintptr_t hwnd, int idx)')

  const host = new BrowserWindow({ width: 900, height: 700, show: false, title: 'MultiTranslator Host' })
  await host.loadURL('data:text/html,<h1>host</h1>')

  // 模拟 Signal 窗口
  const fakeSignal = new BrowserWindow({ width: 800, height: 600, show: false, title: 'Signal' })
  await fakeSignal.loadURL('data:text/html,<h1>fake signal</h1>')
  fakeSignal.show()

  await new Promise((r) => setTimeout(r, 1000))

  const hwnd = FindWindowA(null, 'Signal')
  console.log('[smoke] FindWindowA(Signal) =', hwnd, 'IsWindow =', IsWindow(hwnd))
  if (!hwnd) {
    console.log('[smoke] FAIL: 未找到 Signal 窗口')
    app.exit(1)
    return
  }

  const hostHwnd = Number(host.getNativeWindowHandle().readBigUInt64LE(0))
  console.log('[smoke] hostHwnd =', hostHwnd)

  host.show()
  fakeSignal.hide()

  const ret = SetParent(hwnd, hostHwnd)
  console.log('[smoke] SetParent 返回(旧父=桌面?) =', ret)
  console.log('[smoke] IsChild(host, hwnd) =', IsChild(hostHwnd, hwnd))
  console.log('[smoke] GetAncestor(hwnd, GA_PARENT) =', GetAncestor(hwnd, 2), '期望 =', hostHwnd)

  const mv = MoveWindow(hwnd, 50, 40, 300, 400, true)
  console.log('[smoke] MoveWindow 返回 =', mv)

  const ok = GetAncestor(hwnd, 2) === hostHwnd
  console.log('[smoke]', ok ? 'PASS' : 'FAIL')

  fakeSignal.destroy()
  host.destroy()
  app.exit(ok ? 0 : 1)
}).catch((e) => {
  console.error('[smoke] fatal:', e)
  app.exit(1)
})
