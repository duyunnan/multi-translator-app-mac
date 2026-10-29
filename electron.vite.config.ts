import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import { resolve } from 'path'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'out/main',
      rollupOptions: {
        input: {
          bootstrap: resolve(__dirname, 'src/main/bootstrap.ts'),
          app: resolve(__dirname, 'src/main/app.ts'),
          'signal-mode': resolve(__dirname, 'src/main/signal-mode.ts'),
          'line-mode': resolve(__dirname, 'src/main/line-mode.ts'),
          'messenger-mode': resolve(__dirname, 'src/main/messenger-mode.ts')
        }
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: 'out/preload',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/preload/index.ts'),
          // WebView 注入脚本（guest 页面上下文，CJS）
          'webview-preload': resolve(__dirname, 'src/preload/webview-preload.ts'),
          // 工具窗口：天气 / 美国之音 / DeepSeek 对话
          'tool-weather': resolve(__dirname, 'src/preload/tool-weather.ts'),
          'tool-news': resolve(__dirname, 'src/preload/tool-news.ts'),
          'tool-gpt': resolve(__dirname, 'src/preload/tool-gpt.ts')
        }
      }
    }
  },
  renderer: {
    root: 'src/renderer',
    build: {
      outDir: 'out/renderer',
      rollupOptions: {
        input: { index: resolve(__dirname, 'src/renderer/index.html') }
      }
    }
  }
})
