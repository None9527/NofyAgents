/**
 * main 进程构建 —— 单文件 ESM 产物 dist/main/index.mjs。
 *
 * external 只有两类：electron 与 node:* 内置模块。
 * @nofy-desktop/acp **刻意打进产物**：它是工作区里的 TS 源码，
 * 打包后 main 不再依赖 node_modules 的解析路径（打包分发时少一类事故）。
 */
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist/main",
    emptyOutDir: true,
    minify: false,
    sourcemap: true,
    target: "node22",
    lib: {
      entry: "main/index.ts",
      formats: ["es"],
      fileName: () => "index.mjs",
    },
    rollupOptions: {
      external: ["electron", /^node:/],
    },
  },
  resolve: { conditions: ["node"] },
});
