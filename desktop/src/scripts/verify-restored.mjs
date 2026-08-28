#!/usr/bin/env node
// Integrity verification for the RESTORED ZCode project (zcode-restored).
//
// Expectations are derived from the original .deb itself — no hardcoded
// hashes or file lists:
//   1. Extract data + control archives; check the deb's own md5sums.
//   2. Extract resources/app.asar.
//   3. Expected file set = asar first-party files (excl. node_modules)
//      + deb-level resources (excl. the app.asar blob) + packaging files.
//   4. Non-code files must be BYTE-IDENTICAL (md5) in the restored tree.
//   5. Code files (.js/.cjs/.mjs/.css/.html) must exist 1:1 and the
//      JavaScript ones must pass `node --check` after de-minification
//      (prettier formatting is semantics-preserving; this proves the
//      formatted output is still valid JavaScript).
//   6. Scan the restored tree for unexpected extras (restored-project
//      documentation/config files are declared in SELF_FILES).
//
// Usage:
//   node scripts/verify-restored.mjs --deb <path-to.deb> [--workdir DIR]
//        [--deb-extract DIR --ctrl-dir DIR --asar-ref DIR]
// Exit code: 0 only when every check passes.

import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DEFAULT_DEB = '/home/none/zcode/ZCode-3.7.6-linux-x64.deb';
const CODE_EXT = new Set(['.js', '.cjs', '.mjs', '.css', '.html']);
// Files belonging to the restoration project itself, not the deb payload.
const SELF_FILES = new Set([
  'README.md',
  'DEB-MAPPING.md',
  'electron-builder.reconstructed.yml',
  'tsconfig.reconstructed.json',
  'electron.vite.reconstructed.config.ts',
  'docs/INFERRED-ORIGINAL-STRUCTURE.md',
  'docs/RENDERER-CHUNKS.md',
  'docs/ARCHITECTURE-MAP.md',
  'docs/CHUNK-GRAPH.md',
  'docs/PRELOAD-API.md',
  'docs/REFACTORING-PLAN.md',
  'docs/atlas.json',
  'scripts/verify.mjs',
  'scripts/verify-restored.mjs',
]);
const PACKAGING_FILES = ['control', 'postinst', 'postrm'];

function fail(msg) {
  console.error(`verify-restored: ${msg}`);
  process.exit(2);
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) fail(`unexpected argument: ${a}`);
    const key = a.slice(2);
    const val = argv[i + 1];
    if (val === undefined || val.startsWith('--')) fail(`missing value for ${a}`);
    out[key] = val;
    i++;
  }
  return out;
}

function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });
  if (r.error) fail(`${cmd}: ${r.error.message}`);
  if (r.status !== 0) fail(`${cmd} ${args.join(' ')} exited ${r.status}\n${r.stderr}`);
  return r;
}

function md5File(p) {
  return createHash('md5').update(fs.readFileSync(p)).digest('hex');
}

function walk(dir, { skipDir = () => false } = {}) {
  const out = [];
  const rec = (abs, rel) => {
    for (const ent of fs.readdirSync(abs, { withFileTypes: true })) {
      const r = rel ? `${rel}/${ent.name}` : ent.name;
      if (ent.isDirectory()) {
        if (!skipDir(ent.name)) rec(path.join(abs, ent.name), r);
      } else if (ent.isFile()) {
        out.push(r);
      }
    }
  };
  rec(dir, '');
  return out.sort();
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const deb = args.deb ?? DEFAULT_DEB;
  if (!fs.existsSync(deb)) fail(`deb not found: ${deb}`);

  const reuse = Boolean(args['deb-extract'] || args['ctrl-dir'] || args['asar-ref']);
  if (reuse && !(args['deb-extract'] && args['ctrl-dir'] && args['asar-ref'])) {
    fail('--deb-extract, --ctrl-dir and --asar-ref must be given together');
  }

  let dataDir, ctrlDir, asarDir;
  if (reuse) {
    dataDir = path.resolve(args['deb-extract']);
    ctrlDir = path.resolve(args['ctrl-dir']);
    asarDir = path.resolve(args['asar-ref']);
  } else {
    const workdir = args.workdir ?? fs.mkdtempSync(path.join(os.tmpdir(), 'zcode-verifyr-'));
    dataDir = path.join(workdir, 'deb');
    ctrlDir = path.join(workdir, 'ctrl');
    asarDir = path.join(workdir, 'asar-ref');
    fs.mkdirSync(dataDir, { recursive: true });
    fs.mkdirSync(ctrlDir, { recursive: true });
    console.log(`# extracting ${deb} -> ${workdir}`);
    run('dpkg-deb', ['-x', deb, dataDir]);
    run('dpkg-deb', ['-e', deb, ctrlDir]);
    run('npx', ['-y', '@electron/asar', 'extract',
      path.join(dataDir, 'opt/ZCode/resources/app.asar'), asarDir]);
  }

  // md5sums sanity
  let md5Total = 0, md5Ok = 0;
  for (const line of fs.readFileSync(path.join(ctrlDir, 'md5sums'), 'utf8').split('\n')) {
    const m = line.match(/^([0-9a-fA-F]{32})\s{2}(.+)$/);
    if (!m) continue;
    md5Total++;
    const f = path.join(dataDir, m[2]);
    if (fs.existsSync(f) && md5File(f).toLowerCase() === m[1].toLowerCase()) md5Ok++;
  }

  // expected set: [label, sourceAbs, restoredRel, origin]
  const expected = [];
  for (const rel of walk(asarDir, { skipDir: (n) => n === 'node_modules' })) {
    expected.push([rel, path.join(asarDir, rel), rel, 'asar']);
  }
  const resDir = path.join(dataDir, 'opt/ZCode/resources');
  for (const rel of walk(resDir).filter((r) => r !== 'app.asar')) {
    expected.push([`resources/${rel}`, path.join(resDir, rel), `resources/${rel}`, 'deb-resources']);
  }
  for (const f of PACKAGING_FILES) {
    const src = path.join(ctrlDir, f);
    if (fs.existsSync(src)) expected.push([`packaging:${f}`, src, `packaging/deb/${f}`, 'control-archive']);
  }

  let missing = 0, byteMismatch = 0, syntaxFail = 0, okCode = 0, okByte = 0;
  const problems = [];
  const expectedRestoredPaths = new Set();

  for (const [label, src, restoredRel, origin] of expected) {
    expectedRestoredPaths.add(restoredRel);
    const dst = path.join(ROOT, restoredRel);
    if (!fs.existsSync(dst)) {
      missing++;
      problems.push(`MISSING ${label} -> ${restoredRel}`);
      continue;
    }
    const isCode = CODE_EXT.has(path.extname(restoredRel));
    if (!isCode) {
      if (md5File(src) === md5File(dst)) {
        okByte++;
        console.log(`OK-BYTE ${md5File(src)} ${label} [${origin}]`);
      } else {
        byteMismatch++;
        problems.push(`BYTE-MISMATCH ${label} -> ${restoredRel}`);
      }
      continue;
    }
    // code file: 1:1 presence + syntax validity of the formatted output
    const ext = path.extname(dst);
    let syntaxOk = true;
    if (ext === '.js' || ext === '.cjs' || ext === '.mjs') {
      const r = spawnSync(process.execPath, ['--check', dst], { encoding: 'utf8' });
      syntaxOk = r.status === 0;
      if (!syntaxOk) problems.push(`SYNTAX-FAIL ${restoredRel}: ${(r.stderr || '').split('\n')[0]}`);
    }
    if (syntaxOk) {
      okCode++;
      console.log(`OK-CODE ${label} [${origin}]`);
    } else {
      syntaxFail++;
    }
  }

  const restoredFiles = walk(ROOT, { skipDir: (n) => n === '.git' || n === 'node_modules' || n === 'src-reconstructed' });
  const extras = restoredFiles.filter((r) => !expectedRestoredPaths.has(r) && !SELF_FILES.has(r));
  for (const e of extras) console.log(`EXTRA ${e}`);

  const codeCount = expected.filter((e) => CODE_EXT.has(path.extname(e[2]))).length;
  const byteCount = expected.length - codeCount;
  console.log('');
  console.log(`SUMMARY deb=${deb}`);
  console.log(`SUMMARY md5sums entries=${md5Total} ok=${md5Ok}`);
  console.log(`SUMMARY expected total=${expected.length} (byte-identical=${byteCount}, de-minified-code=${codeCount})`);
  console.log(`SUMMARY byte-identical ok=${okByte} mismatch=${byteMismatch}`);
  console.log(`SUMMARY code ok=${okCode} syntax-fail=${syntaxFail}`);
  console.log(`SUMMARY missing=${missing} extra=${extras.length}`);
  const pass = md5Ok === md5Total && missing === 0 && byteMismatch === 0 &&
    syntaxFail === 0 && extras.length === 0;
  console.log(`RESULT ${pass ? 'PASS' : 'FAIL'}`);
  process.exit(pass ? 0 : 1);
}

main();
