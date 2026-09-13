/**
 * renderer 构建。
 *
 * CSP 用占位符 %NOFY_CSP% 由插件按 command 注入：build 拿严格策略，
 * serve 额外放开 React Refresh 的内联前导脚本与 HMR websocket。
 * 把 'unsafe-inline' 永久写进 index.html 是最常见的「开发期临时放开忘了收回」。
 */
import { defineConfig } from "vite";
import type { Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("./renderer", import.meta.url));
const outDir = fileURLToPath(new URL("./dist/renderer", import.meta.url));

/** 生产：只有本文件来源的脚本；样式放开 inline（CSS-in-JS 与注入样式的常见需要）。 */
const PROD_CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join("; ");

/** 开发：多放开内联/eval（React Refresh 前导）与 localhost 的 ws/http。 */
const DEV_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "connect-src 'self' ws://127.0.0.1:5183 http://127.0.0.1:5183 ws://localhost:5183 http://localhost:5183",
  "object-src 'none'",
  "base-uri 'none'",
].join("; ");

function nofyCsp(): Plugin {
  let csp = PROD_CSP;
  return {
    name: "nofy:csp",
    configResolved(cfg) {
      if (cfg.command === "serve") csp = DEV_CSP;
    },
    transformIndexHtml(html) {
      return html.replace("%NOFY_CSP%", csp);
    },
  };
}

export default defineConfig({
  root,
  // file:// 加载时用相对路径，否则资源会去根目录找
  base: "./",
  plugins: [react(), nofyCsp()],
  resolve: {
    // 工作区包是 TS 源码（exports 指向 src/index.ts），不参与预打包，
    // 让 vite 直接按源码转换——否则 esbuild 预打包会因为 .ts 扩展名报错。
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    exclude: ["@nofy-desktop/acp"],
  },
  build: {
    outDir,
    emptyOutDir: true,
    sourcemap: true,
    target: "es2023",
    // esbuild 默认按 target 把 oklch()/color-mix() 降级成 lab()，丢精度（实测 dist 里
    // oklch 0 处、lab 1 处）。Electron 44 的 Chromium 原生支持这些色函数，抬高 cssTarget
    // 让 authored 值逐字保留——深浅色与活壳逐字对齐的前提。
    cssTarget: "chrome136",
  },
  server: {
    port: 5183,
    strictPort: true,
    host: "127.0.0.1",
  },
});
