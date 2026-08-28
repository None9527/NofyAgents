// Preload — exposes native window controls + OS capabilities to the renderer.
// The renderer's agent traffic still flows over the ACP WebSocket (same as
// the browser build); native bits (window chrome, fs, shell, dialogs) go IPC.
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("grokDesktop", {
  // window chrome
  minimize: () => ipcRenderer.send("grok:window-minimize"),
  toggleMaximize: () => ipcRenderer.send("grok:window-toggle-maximize"),
  close: () => ipcRenderer.send("grok:window-close"),
  toggleFullscreen: () => ipcRenderer.send("grok:window-toggle-fullscreen"),
  getState: () => ipcRenderer.invoke("grok:window-state"),
  isElectron: true,
  // OS capabilities
  fsList: (dir) => ipcRenderer.invoke("grok:fs-list", dir),
  fsRead: (file) => ipcRenderer.invoke("grok:fs-read", file),
  termExec: (command, cwd) => ipcRenderer.invoke("grok:term-exec", { command, cwd }),
  selectDirectory: () => ipcRenderer.invoke("grok:select-directory"),
});
