/**
 * preload 构建 —— dist/preload/index.mjs。
 *
 * 必须是 .mjs：ESM preload 靠扩展名判定，且要求 sandbox:false
 * （main/index.ts 已设）。preload 里只允许出现 electron 的 contextBridge /
 * ipcRenderer —— 它是 renderer 唯一的对外口子，多一个能力就等于拆边界。
 */
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist/preload",
    emptyOutDir: true,
    minify: false,
    sourcemap: true,
    target: "node22",
    lib: {
      entry: "preload/index.ts",
      formats: ["es"],
      fileName: () => "index.mjs",
    },
    rollupOptions: {
      external: ["electron", /^node:/],
    },
  },
  resolve: { conditions: ["node"] },
});
