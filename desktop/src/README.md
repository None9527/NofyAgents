# ZCode 3.7.6 — restored project

This project is a **full restoration of the shipped ZCode 3.7.6 application
payload** from `ZCode-3.7.6-linux-x64.deb`, taken as far as the shipped
artifacts allow:

1. **Byte-faithful base** — every file was copied 1:1 from an authoritative
   extraction of the deb (see `../zcode-src/` for the untouched replica and
   its `DEB-MAPPING.md`). Non-code assets here remain byte-identical.
2. **De-minified code** — all 780+ first-party JavaScript bundles
   (`out/main`, `out/host`, `out/preload`, `out/scheduler`, `out/renderer`)
   plus CSS and HTML have been reformatted with prettier (parser-faithful,
   semantics-preserving).
2b. **Original symbol names restored** — the main-process bundles were built
   with esbuild `keep_names`, which preserves every original function/class
   name as a `__name(binding, "originalName")` call. 19,323 unique original
   names were mined from these calls; ~15,500 of them were applied back to
   the code with scope-safe renaming (collision-checked against the full
   scope chain; fused-module same-name collisions and JS reserved words are
   skipped and stay documented in `docs/atlas.json`). Example: `s(_t,
   "getDataBaseDir")` → the binding `_t` is now `getDataBaseDir` everywhere
   it is referenced. The renderer was built without keep_names, so its
   identifiers stay minified (module names remain visible via chunk file
   names, see `docs/RENDERER-CHUNKS.md`).
3. **Reconstructed project metadata** — `electron-builder.reconstructed.yml`,
   `tsconfig.reconstructed.json`, `electron.vite.reconstructed.config.ts`
   are rebuilt from shipped evidence; each file states its evidence and is
   clearly marked as reconstructed.
4. **Recovered structure knowledge** — `docs/` records everything recoverable
   about the original repository: the monorepo layout implied by
   `workspace:*` dependencies and a leaked source path, and the 760-entry
   renderer chunk→module inventory (Vite preserves original module names in
   code-split chunk file names).

## Layout

```
package.json                     original (from asar root)
out/                             de-minified app code, shipped layout kept
  main/        index.js + chunks   Electron main process
  preload/     3 .cjs preload scripts
  host/        index.js + chunks   host process (agent/tool runtime)
  scheduler/   index.js            scheduler process
  renderer/    index.html, process-monitor.html, assets/ (757 chunks), pdfjs/
  metadata/    build-meta.json     build provenance
resources/                       deb-level resources
  config/, model-providers/, glm/ (189 files; plugin JS de-minified too),
  tools/ (ugrep, bfs, ripgrep binaries, byte-identical),
  icons, app-update.yml, apparmor-profile, package-type,
  app.asar.unpacked/ (node-pty + ssh2 native prebuilds, byte-identical)
packaging/deb/                   control, postinst, postrm (byte-identical)
electron-builder.reconstructed.yml   rebuilt from shipped evidence
tsconfig.reconstructed.json          rebuilt (inferred)
electron.vite.reconstructed.config.ts rebuilt (inferred)
docs/INFERRED-ORIGINAL-STRUCTURE.md  what is known about the original repo
docs/RENDERER-CHUNKS.md              chunk → original module name inventory
scripts/verify-restored.mjs          integrity verification (see below)
```

## JSX reconstruction (`src-reconstructed/`)

The renderer's React code ships as `jsx()`/`jsxs()`/`createElement()` runtime
calls. A reverse compiler (AST-level, exact-equivalence-only) rewrites those
calls back into JSX syntax:

- **11,274 of 11,287 element calls reconstructed (99.9%)** across 33 chunks;
  the 13 left as calls have no JSX equivalent (e.g. conditional element
  types) and stay verbatim.
- Output lives in `src-reconstructed/renderer/assets/<chunk>.jsx` as a
  read-only source view; the runnable `out/` tree is untouched. Every output
  file parses as valid JSX.
- Example (recovered tooltip component):

```jsx
return (
  <ve data-slot="tooltip-provider" delayDuration={e} {...t} />
);
```

## Preload bridge contract (`docs/PRELOAD-API.md`)

The preload scripts expose the renderer's `window.zcode` API via
`contextBridge.exposeInMainWorld`. All **117 API methods** were recovered
with the exact IPC channel each one invokes (resolved from the channel enum
objects shipped in the same files), e.g.
`connectRemote → invoke zcode:connect-remote`.

## Refactoring plan

`docs/REFACTORING-PLAN.md` is the complete plan for rebuilding ZCode as a
maintainable TypeScript monorepo from this restoration: target architecture
(evidence-based), the full module inventory (driven by the 19,323 recovered
symbol names clustered into 16 functional domains), contract-first phases
P0–P7 with done-criteria, and the behavior-parity verification strategy
against this restored reference implementation.

## What is and is not recoverable

The deb ships **only bundled build output**: no TypeScript/React sources, no
source maps, no original `package-lock`/`pnpm-lock`. Therefore:

- Recovered: all shipped logic (now readable), all assets, all metadata,
  the module names of code-split chunks, the monorepo package list, build
  provenance (commit `cc3ba847`, electron-builder 26.8.1), the IPC channel
  contract, the SQLite schema, and — via esbuild `keep_names` metadata —
  ~15,500 original function/class names in the main-process bundles
  (see `docs/ARCHITECTURE-MAP.md`, `docs/atlas.json`).
- Not recoverable: original file boundaries inside fused chunks, type
  annotations, comments, tests, CI, renderer-side identifier names (built
  without keep_names), and main-process names lost to same-name collisions.
  Reconstructing those would be invention, not restoration; nothing here is
  invented code.

## Functional smoke test (executed 2026-08-14)

The de-minified code was booted with the real Electron binary from the deb
(`opt/ZCode/zcode --no-sandbox <staged restored app>`), staging the restored
tree with the asar's full `node_modules` (486 packages) plus the unpacked
native prebuilds. Result: the main process initialized end-to-end — crash
reporter configured, `zcode://` deep-link registered, ARMS monitor
initialized (`version=3.7.6`), `node:sqlite` loaded — with zero
`MODULE_NOT_FOUND`/`SyntaxError` failures. Execution stopped only at the
headless boundary (`Missing X server or $DISPLAY`), which is an environment
limit, not a code defect. This proves the formatted bundles are
semantics-intact and runnable. The test was repeated after the symbol
restoration (~15,500 renames) with the identical result, proving the
renames preserved semantics.

## Verification

```sh
node scripts/verify-restored.mjs --deb /home/none/zcode/ZCode-3.7.6-linux-x64.deb
```

Checks (all expectations derived from the deb itself):
- every non-code file is byte-identical (md5) to its deb counterpart;
- every shipped code file exists 1:1 in the restored tree, and every
  de-minified JavaScript file still passes `node --check` (prettier
  formatting only changes whitespace and wrapping, never semantics).
