/** 天气窗口 preload：暴露 window.weatherApi */
import { contextBridge, ipcRenderer } from 'electron'

const weatherApi = {
  loadCity: (payload: Record<string, unknown>) => ipcRenderer.invoke('weather-load-city', payload ?? {}),
  getCities: () => ipcRenderer.invoke('weather-get-cities'),
  pinCity: (city: Record<string, unknown>) => ipcRenderer.invoke('weather-pin-city', city),
  getPinned: () => ipcRenderer.invoke('weather-get-pinned'),
}

contextBridge.exposeInMainWorld('weatherApi', weatherApi)
