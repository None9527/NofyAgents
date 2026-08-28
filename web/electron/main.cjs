// Electron main — phase 2 desktop shell.
// Renderer stays the web build (dist/); it talks to the agent over the same
// ACP WebSocket, so desktop and browser share one code path. Main adds the
// native bits: window controls, single-instance, dev-server loading.
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");

let win = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    backgroundColor: "#161616",
    title: "Grok Build",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    void win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    // inject the repo root as workspace cwd for the file:// renderer
    void win.loadFile(path.join(__dirname, "../dist/index.html"), {
      query: { cwd: path.resolve(__dirname, "../..") },
    });
  }

  win.webContents.on("did-fail-load", (_e, code, desc) => {
    console.error("[main] load failed", code, desc);
  });
}

// ---- native window controls (renderer calls via preload) -----------------
ipcMain.on("grok:window-minimize", () => win?.minimize());
ipcMain.on("grok:window-toggle-maximize", () => {
  if (!win) return;
  if (win.isMaximized()) win.unmaximize();
  else win.maximize();
});
ipcMain.on("grok:window-close", () => win?.close());
ipcMain.handle("grok:window-state", () => ({
  maximized: win?.isMaximized() ?? false,
  fullscreen: win?.isFullScreen() ?? false,
}));
ipcMain.on("grok:window-toggle-fullscreen", () => {
  if (!win) return;
  win.setFullScreen(!win.isFullScreen());
});

// ---- native OS capabilities: fs, shell, dialogs ----------------------------
const fs = require("node:fs");
const path2 = require("node:path");
const { execFile } = require("node:child_process");

ipcMain.handle("grok:fs-list", (_e, dir) => {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    return entries
      .filter((d) => !d.name.startsWith("."))
      .map((d) => ({ name: d.name, isDir: d.isDirectory() }))
      .sort((a, b) => (a.isDir === b.isDir ? a.name.localeCompare(b.name) : a.isDir ? -1 : 1));
  } catch (error) {
    return { error: String(error.message ?? error) };
  }
});

ipcMain.handle("grok:fs-read", (_e, file) => {
  try {
    const stat = fs.statSync(file);
    if (stat.size > 512 * 1024) return { content: null, error: "file too large (>512KB)" };
    return { content: fs.readFileSync(file, "utf8") };
  } catch (error) {
    return { content: null, error: String(error.message ?? error) };
  }
});

ipcMain.handle("grok:term-exec", (_e, { command, cwd }) =>
  new Promise((resolve) => {
    execFile(
      "/bin/bash",
      ["-c", command],
      { cwd: cwd || process.cwd(), timeout: 30000, maxBuffer: 1024 * 1024 },
      (error, stdout, stderr) => {
        resolve({ output: (stdout || "") + (stderr ? `\n${stderr}` : "") + (error ? `\n(exit ${error.code ?? "err"})` : "") });
      },
    );
  }),
);

ipcMain.handle("grok:select-directory", async () => {
  const { dialog } = require("electron");
  const result = await dialog.showOpenDialog(win, { properties: ["openDirectory"] });
  return result.canceled ? null : result.filePaths[0] ?? null;
});

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });
  app.whenReady().then(createWindow);
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
}
