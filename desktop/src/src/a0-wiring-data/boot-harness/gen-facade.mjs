// A1-F1 facade generator: extracts the original chunk export surfaces, triangulates
// them against the reconstructed owners (SrcSharedA/B §46 export block + a0-symbols.tsv),
// and emits the facade source files under desktop/src/src/facade/.
//
// Usage: node boot-harness/gen-facade.mjs
// Deterministic: fails non-zero on any surface/ownership mismatch.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = '/Users/mac/nofy-build/desktop/src';
const ASSETS = path.join(ROOT, 'out/renderer/assets');
const SRC_TREE = path.join(ROOT, 'src');
const FACADE = path.join(SRC_TREE, 'facade');
const TSV = path.join(SRC_TREE, 'a0-wiring-data/a0-symbols.tsv');

const IDENT = String.raw`[A-Za-z_$][\w$]*`;

/* ── 1. original src chunk: export block + importer surface ── */
const srcChunk = fs.readFileSync(path.join(ASSETS, 'src-HCld2afU.js'), 'utf8');
const expMatch = srcChunk.match(/export\s*\{([^}]*)\}\s*;?\s*$/s);
if (!expMatch) throw new Error('src chunk: trailing export block not found');
// export-name -> internal minified name
const srcExports = new Map();
for (const m of expMatch[1].matchAll(new RegExp(String.raw`(${IDENT})\s+as\s+(${IDENT})`, 'g'))) {
  if (srcExports.has(m[2])) throw new Error(`duplicate export name ${m[2]}`);
  srcExports.set(m[2], m[1]);
}

const SRC_IMPORTERS = ['index-ABImDspU.js', 'IntlProvider-C321H7m8.js', 'logger-PFDwl5Yq.js', 'skillStore-BmeKHDBI.js', 'styles-CdEGpc2x.js'];
// export-name -> [importer chunks]
const srcUsage = new Map();
for (const f of SRC_IMPORTERS) {
  const text = fs.readFileSync(path.join(ASSETS, f), 'utf8');
  for (const im of text.matchAll(new RegExp(String.raw`import\s*\{([^}]*)\}\s*from\s*"\./src-HCld2afU\.js"`, 'g'))) {
    for (const part of im[1].split(',')) {
      const name = part.trim().split(/\s+as\s+/)[0];
      if (!name) continue;
      if (!srcExports.has(name)) throw new Error(`${f} imports unknown src-chunk export ${name}`);
      if (!srcUsage.has(name)) srcUsage.set(name, []);
      srcUsage.get(name).push(f);
    }
  }
}

/* ── 2. reconstructed ownership: SrcSharedB §46 export block (export-name -> source-name) ── */
const srcSharedB = fs.readFileSync(path.join(SRC_TREE, 'modules/SrcSharedB.tsx'), 'utf8');
const exportBlocks = [...srcSharedB.matchAll(/export\s*\{([^}]+)\}\s*;/g)].map(m => m[1]);
const s46 = exportBlocks.sort((a, b) => b.length - a.length)[0];
const reconBlock = new Map(); // export-name -> source-name in SrcSharedB
for (const part of s46.split(',')) {
  const p = part.trim();
  if (!p) continue;
  const m = p.match(new RegExp(String.raw`^(${IDENT})(?:\s+as\s+(${IDENT}))?$`));
  if (!m) throw new Error(`unparseable §46 clause: ${p}`);
  reconBlock.set(m[2] || m[1], m[1]);
}

/* ── 3. a0-symbols.tsv census: internal-name -> { semantic, owner } (SrcShared rows) ── */
const tsvMap = new Map();
for (const line of fs.readFileSync(TSV, 'utf8').split('\n').slice(1)) {
  const r = line.split('\t');
  if (r.length === 5 && (r[4] === 'SrcSharedA.tsx' || r[4] === 'SrcSharedB.tsx')) {
    tsvMap.set(r[2], { semantic: r[1], owner: r[4] });
  }
}

/* ── 4. reconcile + classify ── */
const rows = [];
const missing = [];
for (const [exportName, internalName] of [...srcExports.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
  const census = tsvMap.get(internalName);
  const blockSource = reconBlock.get(exportName);
  if (!census || !blockSource) { missing.push(exportName); continue; }
  const { semantic, owner } = census;
  // §46 source must be either the semantic name or the upper-half obfuscated import alias
  if (blockSource !== semantic && blockSource !== internalName) {
    throw new Error(`mapping conflict at ${exportName}: internal=${internalName} semantic=${semantic} block=${blockSource}`);
  }
  rows.push({
    exportName,
    internalName,
    semantic,
    owner, // SrcSharedA.tsx | SrcSharedB.tsx (reconstructed owner module)
    mode: 'reconstructed',
    usedBy: srcUsage.get(exportName) || [],
  });
}
if (missing.length) throw new Error(`exports without reconstructed owner (passthrough candidates): ${missing.join(', ')}`);

const reconstructed = rows.filter(r => r.mode === 'reconstructed');
const passthrough = rows.filter(r => r.mode === 'passthrough');
console.log(`src chunk surface: ${rows.length} exports; reconstructed ${reconstructed.length}; passthrough ${passthrough.length}; never-imported ${rows.filter(r => r.usedBy.length === 0).length}`);

/* ── 5. IntlProvider chunk surface ── */
const intlChunk = fs.readFileSync(path.join(ASSETS, 'IntlProvider-C321H7m8.js'), 'utf8');
const intlExp = intlChunk.match(/export\s*\{([^}]*)\}\s*;?\s*$/s);
const intlExports = new Map(); // export-name -> internal name
for (const m of intlExp[1].matchAll(new RegExp(String.raw`(${IDENT})\s+as\s+(${IDENT})`, 'g'))) intlExports.set(m[2], m[1]);
// I18n.tsx header §1 canonical mapping (internal -> semantic export of modules/I18n.tsx)
const INTL_MAP = {
  l: 'getWritableStorage', // alias a
  p: 'ZH_CN_MESSAGES', // alias i
  D: 'useZCodeIntl', // alias n
  u: 'readLocalStorageItem', // alias o
  m: 'EN_US_MESSAGES', // alias r
  d: 'writeLocalStorageItem', // alias s
  E: 'ZCodeIntlProvider', // alias t
};
const intlImporters = ['AppUsageDailyModelBarChart-037NXfkz.js', 'AppUsageModelUsagePieChart-_KCE1AAL.js', 'CodingPlanUsageLineChart-BpNLwqMV.js', 'index-ABImDspU.js', 'previewPaneOfficeXlsxContent-XeHwYdMn.js', 'styles-CdEGpc2x.js', 'usageStatsUiParts-CiR7YEhh.js'];
const intlUsage = new Map();
for (const f of intlImporters) {
  const text = fs.readFileSync(path.join(ASSETS, f), 'utf8');
  for (const im of text.matchAll(/import\s*(\{[^}]*\})\s*from\s*"\.\/IntlProvider-C321H7m8\.js"/g)) {
    for (const part of im[1].replace(/[{}]/g, '').split(',')) {
      const name = part.trim().split(/\s+as\s+/)[0];
      if (!name) continue;
      if (!intlExports.has(name)) throw new Error(`${f} imports unknown IntlProvider export ${name}`);
      if (!intlUsage.has(name)) intlUsage.set(name, []);
      intlUsage.get(name).push(f);
    }
  }
}
// side-effect importers (usageStatsUiParts imports without bindings)
for (const f of intlImporters) {
  const text = fs.readFileSync(path.join(ASSETS, f), 'utf8');
  if (/import\s*"\.\/IntlProvider-C321H7m8\.js"/.test(text)) {
    if (!intlUsage.has('(side-effect)')) intlUsage.set('(side-effect)', []);
    intlUsage.get('(side-effect)').push(f);
  }
}

/* ── 6. emit facade sources ── */
fs.mkdirSync(FACADE, { recursive: true });
const stamp = `Generated by a0-wiring-data/boot-harness/gen-facade.mjs — do not edit by hand.`;

// 6a. mapping table (typed, importable)
const mapLines = rows.map(r =>
  `  ${JSON.stringify(r.exportName)}: { internal: ${JSON.stringify(r.internalName)}, semantic: ${JSON.stringify(r.semantic)}, owner: ${JSON.stringify(r.owner)}, mode: ${JSON.stringify(r.mode)}, usedBy: [${r.usedBy.map(u => JSON.stringify(u)).join(', ')}] },`);
fs.writeFileSync(path.join(FACADE, 'srcChunkFacadeMap.generated.ts'), `/**
 * src-HCld2afU.js export surface → reconstructed ownership (A1 Track F1).
 * ${stamp}
 * Surface: ${rows.length} exports = reconstructed ${reconstructed.length} + passthrough ${passthrough.length}.
 */
export interface SrcChunkFacadeEntry {
  /** internal minified name inside the original chunk */
  internal: string;
  /** reconstructed semantic name */
  semantic: string;
  /** reconstructed owner module (modules/ basename) or 'original' for passthrough */
  owner: string;
  /** 'reconstructed' | 'passthrough' */
  mode: 'reconstructed' | 'passthrough';
  /** chunks importing this export (empty = never imported) */
  usedBy: string[];
}
export const SRC_CHUNK_FACADE_MAP: Record<string, SrcChunkFacadeEntry> = {
${mapLines.join('\n')}
};
`);

// 6b. src chunk facade entry
const byOwner = new Map();
for (const r of reconstructed) {
  if (!byOwner.has(r.owner)) byOwner.set(r.owner, []);
  byOwner.get(r.owner).push(r);
}
const ownerImport = { 'SrcSharedA.tsx': '../modules/SrcSharedA', 'SrcSharedB.tsx': '../modules/SrcSharedB' };
let facadeBody = `/**
 * src-chunk facade (A1 Track F1): serves the export surface of the original
 * out/renderer/assets/src-HCld2afU.js (${rows.length} minified aliases) from the
 * reconstructed tree. The harness bundles this file AS ./src-HCld2afU.js so every
 * original chunk (styles / IntlProvider / logger / skillStore) links against the
 * reconstructed modules. Names without a reconstructed owner would be passthrough
 * re-exports from the original asset (hybrid by design); current remainder: ${passthrough.length}.
 * ${stamp}
 */
`;
for (const [owner, list] of [...byOwner.entries()].sort()) {
  const clauses = list.map(r => `${r.semantic} as ${r.exportName}`).join(', ');
  facadeBody += `export { ${clauses} } from '${ownerImport[owner]}';\n`;
}
if (passthrough.length) {
  facadeBody += `// passthrough remainder (no reconstructed owner yet — feeds Track R prioritization)\n`;
  facadeBody += `export { ${passthrough.map(r => r.exportName).join(', ')} } from '../../out/renderer/assets/src-HCld2afU.js';\n`;
}
fs.writeFileSync(path.join(FACADE, 'srcChunkFacade.ts'), facadeBody);

// 6c. IntlProvider chunk facade
const intlRows = [...intlExports.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1));
const intlClauses = intlRows.map(([exportName, internal]) => {
  const sem = INTL_MAP[internal];
  if (!sem) throw new Error(`IntlProvider internal ${internal} (export ${exportName}) has no reconstructed mapping`);
  return `${sem} as ${exportName}`;
});
fs.writeFileSync(path.join(FACADE, 'intlProviderChunkFacade.ts'), `/**
 * IntlProvider chunk facade (A1 Track F2): serves the export surface of the original
 * out/renderer/assets/IntlProvider-C321H7m8.js (7 aliases) from the canonical
 * reconstructed i18n module (modules/I18n.tsx, D9 canonical). The harness bundles this
 * file AS ./IntlProvider-C321H7m8.js and redirects the boot entry's ./I18n imports to
 * the same chunk instance — single-instance discipline: the styles chunk's useZCodeIntl
 * (alias n) and the entry's ZCodeIntlProvider (alias t) share one React context.
 * ${stamp}
 *
 * export surface (internal -> alias -> reconstructed semantic):
${intlRows.map(([e, i]) => ` *   ${i} -> ${e} -> ${INTL_MAP[i]}   usedBy: ${(intlUsage.get(e) || []).join(', ') || '(never imported)'}`).join('\n')}
 *   side-effect importers: ${(intlUsage.get('(side-effect)') || []).join(', ') || '(none)'}
 */
export { ${intlClauses.join(', ')} } from '../modules/I18n';
`);

// 6d. coverage TSV (evidence pack)
const cov = ['chunk\texport_name\tinternal_name\tsemantic_name\towner\tmode\tused_by'];
for (const r of rows) cov.push(['src-HCld2afU.js', r.exportName, r.internalName, r.semantic, r.owner, r.mode, r.usedBy.join('|')].join('\t'));
for (const [e, i] of intlRows) cov.push(['IntlProvider-C321H7m8.js', e, i, INTL_MAP[i], 'I18n.tsx', 'reconstructed', (intlUsage.get(e) || []).join('|')].join('\t'));
fs.writeFileSync(path.join(FACADE, 'facade-coverage.generated.tsv'), cov.join('\n') + '\n');

console.log(`emitted: facade/srcChunkFacadeMap.generated.ts, facade/srcChunkFacade.ts, facade/intlProviderChunkFacade.ts, facade/facade-coverage.generated.tsv`);
console.log(`IntlProvider surface: ${intlExports.size} exports, all reconstructed via modules/I18n.tsx`);
