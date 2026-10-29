/** 临时测试：验证 koffi 3.x 嵌入所需 user32 API（验证后删除） */
const { app } = require('electron')

app.whenReady().then(() => {
  try {
    const koffi = require('koffi')
    const user32 = koffi.load('user32.dll')

    const FindWindowA = user32.func('uintptr_t FindWindowA(const char* cls, const char* name)')
    const IsWindow = user32.func('bool IsWindow(uintptr_t hwnd)')
    const SetParent = user32.func('uintptr_t SetParent(uintptr_t child, uintptr_t parent)')
    const MoveWindow = user32.func('bool MoveWindow(uintptr_t hwnd, int x, int y, int w, int h, bool repaint)')
    const ShowWindow = user32.func('bool ShowWindow(uintptr_t hwnd, int nCmdShow)')
    const GetDesktopWindow = user32.func('uintptr_t GetDesktopWindow()')

    const desktop = GetDesktopWindow()
    console.log('[koffi] GetDesktopWindow =', desktop)
    console.log('[koffi] IsWindow(desktop) =', IsWindow(desktop))
    console.log('[koffi] SetParent(0, desktop) =', SetParent(0, desktop))
    console.log('[koffi] ShowWindow(0, 5) =', ShowWindow(0, 5))
    console.log('[koffi] MoveWindow(0,0,0,100,100,true) =', MoveWindow(0, 0, 0, 100, 100, true))
    console.log('[koffi] FindWindowA(Signal) =', FindWindowA(null, 'Signal'))

    console.log('[koffi] SUCCESS')
    app.exit(0)
  } catch (e) {
    console.error('[koffi] FAIL:', e)
    app.exit(1)
  }
})
