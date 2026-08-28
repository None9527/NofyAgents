// Headless viewer for the ORIGINAL ZCode renderer (served by zfork-serve on
// 5180 with the nofy bridge injected). Lets us operate the real UI via CDP
// and screenshot every module for source-vs-implementation comparison.
const { app, BrowserWindow } = require("electron");

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 1152,
    height: 800,
    title: "ZCode Original",
    webPreferences: { contextIsolation: false, nodeIntegration: false },
  });
  void win.loadURL(process.env.ZFORK_URL ?? "http://127.0.0.1:5180/");
});
