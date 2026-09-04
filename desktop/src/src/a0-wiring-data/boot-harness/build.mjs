// A1 Track F boot harness builder (successor of the A0-S5 /tmp/a0-s5-boot build).
// Three-stage bundle + scratch renderer farm:
//   stage 1  facade/srcChunkFacade.ts          -> scratch assets/src-HCld2afU.js
//            (replaces the original src chunk; styles/IntlProvider/logger/skillStore
//             chunks link against the reconstructed tree)
//   stage 2  facade/intlProviderChunkFacade.ts -> scratch assets/IntlProvider-C321H7m8.js
//            (replaces the original IntlProvider chunk; single reconstructed i18n instance)
//   stage 3  modules/rendererEntry.tsx         -> scratch assets/boot-entry.js
//            (./I18n redirected to the IntlProvider facade chunk via shims/i18n-facade.mjs)
// Farm: symlinks of all original out/renderer/assets except the two replaced chunks;
// index.html copy with only the entry script line swapped. out/ is never written.
//
// Single-instance discipline: react / jsx-runtime / react-dom(/client) resolve to the
// ORIGINAL chunks via shims/react*.mjs; the i18n surface resolves to the IntlProvider
// facade chunk for both the boot entry and the styles chunk.
import { build } from '/Users/mac/nofy-build/desktop/src/src/node_modules/esbuild/lib/main.js';
import path from 'node:path';
import fs from 'node:fs';

const SRC = '/Users/mac/nofy-build/desktop/src/src';

// ★cwd 守卫（A1-R175）：esbuild 把「模块相对路径」写进产物两处——`// <path>` 横幅注释
//   与 `__esm({ "<path>"() {…} })` 之惰性注册表字符串键——而该相对路径係按 **process.cwd()**
//   计算，故本脚本之产物字节**随调用 cwd 而变**，源码一字未动亦然。
//   实测（HEAD 639bfa8，五种 cwd，三尺寸 src-facade / IntlProvider / boot-entry）：
//     desktop/src/src                426613 / 736955 / 580622  ← 规范值，历批记录所本
//     desktop/src                    426729 / 736975 / 581442
//     …/boot-harness                 426753 / 736917 / 581682
//     仓库根                          427077 / 737035 / 583902
//     /tmp                            427860 / 737170 / 589437
//   boot-entry 跨度达 8,815 字节。⇒ 若从错误 cwd 构建，门 g 之「三 bundle md5 与前批
//   逐字节全等」硬判据（R158 立）会**假报漂移**（误判本批动了值位文本），或反向假报全等。
//   与 R170 环工具 cwd 陷阱同族：os.walk/相对路径型工具在错误 cwd 下**静默**产出貌似合理之结果。
//   规约：一律 `cd desktop/src/src && node a0-wiring-data/boot-harness/build.mjs`。
//   注：A1_BOOT_DIR 之**目录名**不入产物（同深度即同相对路径），故历批换端口无碍。
const _CWD = process.cwd();
if (!(_CWD === SRC || _CWD === '/private' + SRC)) {
  console.error(`cwd 须为 ${SRC}，实为 ${_CWD}`);
  console.error('产物字节随 cwd 而变（见上方注释），从错误 cwd 构建会污染门 g 之 md5 判据。');
  process.exit(3);
}

const ASSETS = '/Users/mac/nofy-build/desktop/src/out/renderer/assets';
const OUTDIR = process.env.A1_BOOT_DIR || '/tmp/a1-f1-boot';
const RENDERER = path.join(OUTDIR, 'renderer');
const SHIMS = '/Users/mac/nofy-build/desktop/src/src/a0-wiring-data/boot-harness/shims';
const REPLACED = new Set(['src-HCld2afU.js', 'IntlProvider-C321H7m8.js']);
const assetFiles = new Set(fs.readdirSync(ASSETS));

const reactSingleInstance = {
  name: 'react-single-instance',
  setup(b) {
    b.onResolve({ filter: /^react$/ }, () => ({ path: path.join(SHIMS, 'react.mjs') }));
    b.onResolve({ filter: /^react\/jsx-runtime$/ }, () => ({ path: path.join(SHIMS, 'jsx-runtime.mjs') }));
    b.onResolve({ filter: /^react\/jsx-dev-runtime$/ }, () => ({ path: path.join(SHIMS, 'jsx-runtime.mjs') }));
    b.onResolve({ filter: /^react-dom$/ }, () => ({ path: path.join(SHIMS, 'react-dom.mjs') }));
    b.onResolve({ filter: /^react-dom\/client$/ }, () => ({ path: path.join(SHIMS, 'react-dom-client.mjs') }));
  },
};

// i18n single-instance via the IntlProvider facade chunk (stage 3 only — the facade
// build itself must keep the real ./modules/I18n source).
const i18nFacadeRedirect = {
  name: 'i18n-facade-redirect',
  setup(b) {
    b.onResolve({ filter: /(^|\/)I18n$/ }, (a) => {
      if (a.importer.includes('/desktop/src/src/')) return { path: path.join(SHIMS, 'i18n-facade.mjs') };
      return null;
    });
  },
};

const assetExternalPlugin = {
  name: 'original-asset-externals',
  setup(b) {
    // Explicit imports of original bundle assets (e.g. styles mega-chunk) -> external ./basename
    b.onResolve({ filter: /out\/renderer\/assets\/.+\.js$/ }, (a) => ({
      path: './' + path.basename(a.path), external: true,
    }));
    // Imports whose basename is an original asset file (incl. scratch facade chunks)
    b.onResolve({ filter: /\.js(\?.*)?$/ }, (a) => {
      const base = path.basename(a.path.split('?')[0]);
      if (assetFiles.has(base)) return { path: './' + base, external: true };
      return null;
    });
  },
};

const COMMON = {
  bundle: true, format: 'esm', target: 'es2022', platform: 'browser',
  jsx: 'automatic', logLevel: 'warning', legalComments: 'none',
};

async function run(stage, entry, outfile, plugins) {
  const res = await build({ ...COMMON, entryPoints: [entry], outfile, plugins });
  if (res.errors.length) { console.error(stage, 'ERRORS', res.errors); process.exit(1); }
  const st = fs.statSync(outfile);
  console.log(`${stage}: ${path.basename(outfile)} ${st.size} bytes, warnings=${res.warnings.length}`);
  for (const w of res.warnings.slice(0, 6)) console.warn('  -', w.text.slice(0, 200));
}

/* ── farm ── */
fs.rmSync(RENDERER, { recursive: true, force: true });
fs.mkdirSync(path.join(RENDERER, 'assets'), { recursive: true });
let linked = 0;
for (const f of assetFiles) {
  if (REPLACED.has(f)) continue;
  fs.symlinkSync(path.join(ASSETS, f), path.join(RENDERER, 'assets', f));
  linked += 1;
}
for (const html of fs.readdirSync('/Users/mac/nofy-build/desktop/src/out/renderer').filter(f => f.endsWith('.html'))) {
  let text = fs.readFileSync(path.join('/Users/mac/nofy-build/desktop/src/out/renderer', html), 'utf8');
  if (html === 'index.html') {
    text = text.replace('./assets/index-ABImDspU.js', './assets/boot-entry.js');
    if (!text.includes('./assets/boot-entry.js')) throw new Error('index.html entry line not found');
  }
  fs.writeFileSync(path.join(RENDERER, html), text);
}
console.log(`farm: ${linked} symlinked assets + ${REPLACED.size} facade bundles (pending) + boot-entry (pending)`);

/* ── stages ── */
await run('stage1 src-facade', path.join(SRC, 'facade/srcChunkFacade.ts'),
  path.join(RENDERER, 'assets/src-HCld2afU.js'),
  [reactSingleInstance, assetExternalPlugin]);
await run('stage2 intl-facade', path.join(SRC, 'facade/intlProviderChunkFacade.ts'),
  path.join(RENDERER, 'assets/IntlProvider-C321H7m8.js'),
  [reactSingleInstance, assetExternalPlugin]);
await run('stage3 boot-entry', path.join(SRC, 'modules/rendererEntry.tsx'),
  path.join(RENDERER, 'assets/boot-entry.js'),
  [reactSingleInstance, i18nFacadeRedirect, assetExternalPlugin]);

console.log('boot harness ready:', RENDERER);
