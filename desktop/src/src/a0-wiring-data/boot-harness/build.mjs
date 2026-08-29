// A0-S5 boot bundle builder: reconstructed rendererEntry + npm inlined + original assets external.
import { build } from '/Users/mac/nofy-build/desktop/src/src/node_modules/esbuild/lib/main.js';
import path from 'node:path';
import fs from 'node:fs';

const SRC = '/Users/mac/nofy-build/desktop/src/src';
const ASSETS = '/Users/mac/nofy-build/desktop/src/out/renderer/assets';
const OUTDIR = '/tmp/a0-s5-boot/renderer/assets';
const SHIMS = '/tmp/a0-s5-boot/shims';
const assetFiles = new Set(fs.readdirSync(ASSETS));

const aliasPlugin = {
  name: 'react-single-instance',
  setup(b) {
    b.onResolve({ filter: /(^|\/)I18n$/ }, (a) => {
      if (a.importer.includes('/desktop/src/src/')) return { path: path.join(SHIMS, 'i18n-boot.mjs') };
      return null;
    });
    b.onResolve({ filter: /^react$/ }, () => ({ path: path.join(SHIMS, 'react.mjs') }));
    b.onResolve({ filter: /^react\/jsx-runtime$/ }, () => ({ path: path.join(SHIMS, 'jsx-runtime.mjs') }));
    b.onResolve({ filter: /^react\/jsx-dev-runtime$/ }, () => ({ path: path.join(SHIMS, 'jsx-runtime.mjs') }));
    b.onResolve({ filter: /^react-dom$/ }, () => ({ path: path.join(SHIMS, 'react-dom.mjs') }));
    b.onResolve({ filter: /^react-dom\/client$/ }, () => ({ path: path.join(SHIMS, 'react-dom-client.mjs') }));
  },
};

const assetExternalPlugin = {
  name: 'original-asset-externals',
  setup(b) {
    // Explicit imports of original bundle assets (e.g. styles mega-chunk) -> external ./basename
    b.onResolve({ filter: /out\/renderer\/assets\/.+\.js$/ }, (a) => ({
      path: './' + path.basename(a.path), external: true,
    }));
    // Lazy chunk dynamic imports whose basename is an original asset file
    b.onResolve({ filter: /\.js(\?.*)?$/ }, (a) => {
      const base = path.basename(a.path.split('?')[0]);
      if (assetFiles.has(base)) return { path: './' + base, external: true };
      return null;
    });
  },
};

const res = await build({
  entryPoints: [path.join(SRC, 'modules/rendererEntry.tsx')],
  bundle: true,
  format: 'esm',
  target: 'es2022',
  platform: 'browser',
  jsx: 'automatic',
  outfile: path.join(OUTDIR, 'boot-entry.js'),
  logLevel: 'warning',
  legalComments: 'none',
  plugins: [aliasPlugin, assetExternalPlugin],
});
if (res.errors.length) { console.error('ERRORS', res.errors); process.exit(1); }
console.log('warnings:', res.warnings.length);
for (const w of res.warnings.slice(0, 12)) console.warn('-', w.text.slice(0, 200));
const st = fs.statSync(path.join(OUTDIR, 'boot-entry.js'));
console.log('boot-entry.js bytes:', st.size);
