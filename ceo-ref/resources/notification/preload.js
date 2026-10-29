const { contextBridge, ipcRenderer } = require('electron');

const UPDATE_CHANNEL = 'notification-window:update';
const CLOSE_CHANNEL = 'notification-window:close';

contextBridge.exposeInMainWorld('notification', {
  onUpdate(callback) {
    if (typeof callback !== 'function') return () => {};

    const listener = (_, payload) => callback(payload);
    ipcRenderer.on(UPDATE_CHANNEL, listener);

    return () => {
      ipcRenderer.removeListener(UPDATE_CHANNEL, listener);
    };
  },
  close() {
    return ipcRenderer.invoke(CLOSE_CHANNEL);
  }
});
