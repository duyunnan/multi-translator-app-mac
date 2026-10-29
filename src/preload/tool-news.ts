/** 美国之音窗口 preload：暴露 window.newsApi */
import { contextBridge, ipcRenderer } from 'electron'

const newsApi = {
  goHome: () => ipcRenderer.invoke('news-reader-go-home'),
  goBack: () => ipcRenderer.invoke('news-reader-go-back'),
  reload: () => ipcRenderer.invoke('news-reader-reload'),
  onNavState: (cb: (state: { canGoBack: boolean }) => void) => {
    ipcRenderer.on('news-reader-nav', (_e, state) => cb(state))
  },
  onPageState: (cb: (state: { loading?: boolean; failed?: boolean; error?: string }) => void) => {
    ipcRenderer.on('news-reader-page', (_e, state) => cb(state))
  },
}

contextBridge.exposeInMainWorld('newsApi', newsApi)
