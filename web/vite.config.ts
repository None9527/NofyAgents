import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// `base: "./"` keeps every asset reference relative so the same build output
// can later be loaded from file:// inside Electron (BrowserWindow.loadFile)
// without re-bundling.
export default defineConfig({
  plugins: [react()],
  base: "./",
  server: {
    port: 5173,
    // 无头机 inotify 额度不足，watcher 屡漏写；轮询兜底（施工期可靠性优先）
    watch: { usePolling: true, interval: 400 },
    // Bind all interfaces so the page is reachable from a browser on
    // another machine (dev box is headless).
    host: "0.0.0.0",
    // Same-origin proxy to the Electron CDP port for desktop-view.html
    // (avoids CORS and the 127.0.0.1-only debug binding).
    proxy: {
      "/cdp": {
        target: "http://127.0.0.1:9223",
        rewrite: (p) => p.replace(/^\/cdp/, ""),
        ws: true,
      },
    },
  },
  build: {
    outDir: "dist",
    target: "chrome120",
    sourcemap: true,
    rollupOptions: {
      input: {
        main: "index.html",
        v2: "index2.html",
        z3: "index3.html",
      },
    },
  },
});
