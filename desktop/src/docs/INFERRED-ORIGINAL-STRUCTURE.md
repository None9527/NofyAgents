# Inferred original repository structure

The package ships no sources and no source maps, so the original tree cannot
be recovered exactly. Below is what the shipped artifacts prove or strongly
imply about the original repository.

## Proven facts

| Fact | Evidence |
|---|---|
| App: `@zcode/desktop` 3.7.6, productName ZCode | asar `package.json` |
| Entry `out/main/index.js`, ESM (`"type": "module"`) | asar `package.json` |
| Build: electron-builder 26.8.1, commit `cc3ba847`, 2026-08-10T10:00:17Z | `out/metadata/build-meta.json` |
| Deb package `zcode` version `3.7.6-4691` | DEBIAN/control |
| Renderer framework: React 19 (`react`, `react-dom` deps + `jsx-runtime` chunk) | `package.json`, renderer chunk names |
| Five build entries: main, preload (3 .cjs), host, scheduler, renderer (2 html) | `out/` layout, `.host-build-ready` / `.scheduler-build-ready` markers |
| Native deps unpacked from asar: node-pty (linux-x64 prebuild), ssh2 crypto | `resources/app.asar.unpacked/` |
| Bundled CLI tools: ugrep, bfs, ripgrep | `resources/tools/*` + `.bundle-meta.json` |
| glm plugin system with 7+ plugins | `resources/glm/packages/*` |

## Strongly implied (workspace dependencies named in `package.json`)

The original repository is a **pnpm-style monorepo**. `package.json` depends on
seven `workspace:*` packages, which must have existed as workspace packages:

```
<repo-root>/
├── apps/
│   ├── <desktop-app>/            # this Electron app (@zcode/desktop)
│   └── zcode-cli/
│       └── packages/cli/src/main.ts   # path string leaked into the main bundle
└── packages/
    ├── client/                   # @zcode/client
    ├── e2e-report/               # @zcode/e2e-report
    ├── rpc/                      # @zcode/rpc
    ├── server/                   # @zcode/server
    ├── services/                 # @zcode/services
    ├── shared/                   # @zcode/shared
    └── ui/                       # @zcode/ui
```

The leaked path `apps/zcode-cli/packages/cli/src/main.ts` (found verbatim in
the main-process bundle) proves the `apps/<name>/packages/...` convention.

## Recovered first-party renderer modules (from chunk names)

Code-split chunk file names preserve original module names. First-party app
modules identified (see `RENDERER-CHUNKS.md` for the full 760-entry list):

- **Usage statistics**: `usageStatsUiParts`, `appUsageChartPalette`,
  `AppUsageDailyModelBarChart`, `AppUsageModelUsagePieChart`,
  `CodingPlanUsageLineChart`
- **Office/document preview**: `officeFilePreview`,
  `previewPaneOfficeDocxContent`, `previewPaneOfficeXlsxContent`,
  `previewPaneOfficeLegacyDocContent`, `pptxRendererPreviewEngine`,
  `presentationElementModel`, `presentationPdfPrintExport`
- **Editor support**: `imeComposition`, `keyboardShortcuts`, `diffs.worker`
- **State / app infrastructure**: `skillStore`, `e2eStoreBridgeBootstrap`,
  `IntlProvider`, `defaultLocale`, `logger`, `treeView`
- **Preload scripts**: `index`, `embeddedBrowserJavaScriptDialog`,
  `processMonitor` (also a renderer window: `process-monitor.html`)

Vendored third-party chunks recognizable by name: mermaid diagram types
(`flowDiagram`, `sequenceDiagram`, `ganttDiagram`, …), shiki grammars/themes
(~300 language/theme chunks: `abap`, `typescript`, `andromeeda`, …), `katex`,
`rough.esm` (roughjs), `pdf.worker`, CodeMirror language bundles
(`emacs-lisp`, …).

## Not recoverable

- Original `.ts`/`.tsx` file boundaries inside bundled chunks (Rollup fused
  modules; no source maps ship).
- Type annotations, interfaces, comments, tests, build scripts.
- The `workspace:*` packages' own sources (only their bundled output exists).
