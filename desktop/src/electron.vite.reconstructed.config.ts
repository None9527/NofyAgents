// RECONSTRUCTED FILE — not from the original repository.
// Inferred from the shipped output layout, which follows electron-vite
// conventions (out/main, out/preload, out/renderer; .cjs preload outputs
// under a "type": "module" package; content-hashed chunk names).
// host/ and scheduler/ are additional main-process bundles, built as extra
// entries of the same pipeline (evidence: out/.host-build-ready and
// out/.scheduler-build-ready marker files written by the build orchestration).
//
// Entries observed in the shipped artifact:
//   main:      out/main/index.js          (+ chunk-*.js shared chunks)
//   preload:   out/preload/index.cjs
//              out/preload/embeddedBrowserJavaScriptDialog.cjs
//              out/preload/processMonitor.cjs
//   host:      out/host/index.js          (+ chunk-*.js shared chunks)
//   scheduler: out/scheduler/index.js
//   renderer:  out/renderer/index.html, out/renderer/process-monitor.html
//              (+ assets/*.{js,css} code-split chunks)
import { defineConfig } from "electron-vite";

export default defineConfig({
  main: {
    build: {
      outDir: "out/main",
      lib: { entry: "src/main/index.ts" },
      rollupOptions: {
        // Native modules ship unpacked from the asar; keep them external.
        external: ["node-pty", "ssh2"],
      },
    },
  },
  preload: {
    build: {
      outDir: "out/preload",
      rollupOptions: {
        input: {
          index: "src/preload/index.ts",
          embeddedBrowserJavaScriptDialog:
            "src/preload/embeddedBrowserJavaScriptDialog.ts",
          processMonitor: "src/preload/processMonitor.ts",
        },
        output: { format: "cjs" },
      },
    },
  },
  renderer: {
    root: "src/renderer",
    build: {
      outDir: "out/renderer",
      rollupOptions: {
        input: {
          index: "src/renderer/index.html",
          "process-monitor": "src/renderer/process-monitor.html",
        },
      },
    },
  },
});
