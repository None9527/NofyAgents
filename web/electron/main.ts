// Phase 2 stub — NOT wired into any build yet.
// Electron main process entry. When the web app stabilizes, this becomes the
// desktop shell: spawn/load the renderer, own native windows, and bridge the
// agent backend to the renderer via the preload script.
//
// Two backend options (both reuse existing grok interfaces, no new API):
//   1. Connect to `grok serve` over ws:// (same as the browser dev setup).
//   2. Spawn `grok --stdio` as a child process and relay ACP JSON-RPC
//      between stdin/stdout and the renderer's IPC transport.
//
// Planned deps: electron, electron-vite (or plain vite + electron-builder).

import { app, BrowserWindow } from "electron";
import path from "node:path";

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    backgroundColor: "#161616",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Dev: Vite dev server. Prod: the same dist/ built for the web
  // (vite.config.ts uses base "./" exactly so this works).
  if (process.env.VITE_DEV_SERVER_URL) {
    void win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    void win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(createWindow);
