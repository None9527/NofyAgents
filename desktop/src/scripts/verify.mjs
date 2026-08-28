#!/usr/bin/env node
// Fidelity verification for the ZCode replica project.
//
// All expectations are derived from the original .deb itself — no hardcoded
// hashes or file lists:
//   1. Extract the control archive and check every entry of its `md5sums`
//      against the extracted data tree.
//   2. Extract `opt/ZCode/resources/app.asar`; every file except third-party
//      `node_modules` is expected in the replica root.
//   3. Every file under `opt/ZCode/resources/` (except the `app.asar` blob)
//      is expected under `resources/` in the replica.
//   4. The control-archive packaging files (control, postinst, postrm) are
//      expected under `packaging/deb/` in the replica.
//   5. md5-compare every expected file against the replica and scan the
//      replica for unexpected extras.
//
// Usage:
//   node scripts/verify.mjs --deb <path-to.deb> [--workdir DIR]
//                           [--deb-extract DIR --ctrl-dir DIR --asar-ref DIR]
// The three reuse flags point at pre-existing authoritative extractions and
// skip the corresponding extraction step (all three must be given together).
//
// Exit code: 0 only when md5sums failures = missing = extra = mismatch = 0.

import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const REPLICA_ROOT = path.resolve(import.meta.dirname, "..");
const DEFAULT_DEB = "/home/none/zcode/ZCode-3.7.6-linux-x64.deb";
// Files that belong to the replica project itself, not to the deb payload.
const SELF_FILES = new Set(["scripts/verify.mjs", "DEB-MAPPING.md"]);
const PACKAGING_FILES = ["control", "postinst", "postrm"];

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) fail(`unexpected argument: ${a}`);
    const key = a.slice(2);
    const val = argv[i + 1];
    if (val === undefined || val.startsWith("--")) fail(`missing value for ${a}`);
    out[key] = val;
    i++;
  }
  return out;
}

function fail(msg) {
  console.error(`verify: ${msg}`);
  process.exit(2);
}

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: ["ignore", "pipe", "pipe"], ...opts });
  if (r.error) fail(`${cmd} ${args.join(" ")}: ${r.error.message}`);
  if (r.status !== 0) {
    fail(`${cmd} ${args.join(" ")} exited ${r.status}\n${r.stderr}`);
  }
  return r;
}

function md5File(p) {
  const h = createHash("md5");
  h.update(fs.readFileSync(p));
  return h.digest("hex");
}

// Recursively list files under dir as sorted relative paths.
// skipDir(name) prunes whole directories; skipFile(rel) prunes single files.
function walk(dir, { skipDir = () => false, skipFile = () => false } = {}) {
  const out = [];
  const rec = (abs, rel) => {
    for (const ent of fs.readdirSync(abs, { withFileTypes: true })) {
      const r = rel ? `${rel}/${ent.name}` : ent.name;
      if (ent.isDirectory()) {
        if (!skipDir(ent.name, r)) rec(path.join(abs, ent.name), r);
      } else if (ent.isFile()) {
        if (!skipFile(r)) out.push(r);
      } else if (ent.isSymbolicLink()) {
        fail(`unexpected symlink in extraction: ${r}`);
      }
    }
  };
  rec(dir, "");
  return out.sort();
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const deb = args.deb ?? DEFAULT_DEB;
  if (!fs.existsSync(deb)) fail(`deb not found: ${deb}`);

  const reuse = Boolean(args["deb-extract"] || args["ctrl-dir"] || args["asar-ref"]);
  if (reuse && !(args["deb-extract"] && args["ctrl-dir"] && args["asar-ref"])) {
    fail("--deb-extract, --ctrl-dir and --asar-ref must be given together");
  }

  const workdir = args.workdir
    ? fs.mkdirSync(args.workdir, { recursive: true }) || args.workdir
    : fs.mkdtempSync(path.join(os.tmpdir(), "zcode-verify-"));

  let dataDir, ctrlDir, asarDir;
  if (reuse) {
    dataDir = path.resolve(args["deb-extract"]);
    ctrlDir = path.resolve(args["ctrl-dir"]);
    asarDir = path.resolve(args["asar-ref"]);
    for (const d of [dataDir, ctrlDir, asarDir]) {
      if (!fs.existsSync(d)) fail(`reuse dir not found: ${d}`);
    }
    console.log(`# reusing authoritative extractions under ${dataDir}`);
  } else {
    dataDir = path.join(workdir, "deb");
    ctrlDir = path.join(workdir, "ctrl");
    asarDir = path.join(workdir, "asar-ref");
    fs.mkdirSync(dataDir, { recursive: true });
    fs.mkdirSync(ctrlDir, { recursive: true });
    console.log(`# extracting ${deb} -> ${workdir}`);
    run("dpkg-deb", ["-x", deb, dataDir]);
    run("dpkg-deb", ["-e", deb, ctrlDir]);
    run("npx", [
      "-y",
      "@electron/asar",
      "extract",
      path.join(dataDir, "opt/ZCode/resources/app.asar"),
      asarDir,
    ]);
  }

  // --- Step 1: deb's own md5sums vs extracted data tree -------------------
  const md5sumsPath = path.join(ctrlDir, "md5sums");
  let md5sumsTotal = 0,
    md5sumsOk = 0;
  const md5sumsFailed = [];
  if (fs.existsSync(md5sumsPath)) {
    for (const line of fs.readFileSync(md5sumsPath, "utf8").split("\n")) {
      const m = line.match(/^([0-9a-fA-F]{32})\s{2}(.+)$/);
      if (!m) continue;
      md5sumsTotal++;
      const file = path.join(dataDir, m[2]);
      if (fs.existsSync(file) && md5File(file).toLowerCase() === m[1].toLowerCase()) {
        md5sumsOk++;
      } else {
        md5sumsFailed.push(m[2]);
      }
    }
  } else {
    fail(`control archive has no md5sums: ${md5sumsPath}`);
  }

  // --- Step 2: build the expected file set from the extractions -----------
  // [expectedRelPath, sourceAbsPath, replicaRelPath, origin]
  const expected = [];
  const asarFiles = walk(asarDir, { skipDir: (name) => name === "node_modules" });
  for (const rel of asarFiles) {
    expected.push([rel, path.join(asarDir, rel), rel, "asar"]);
  }
  const resDir = path.join(dataDir, "opt/ZCode/resources");
  const resFiles = walk(resDir, { skipFile: (rel) => rel === "app.asar" });
  for (const rel of resFiles) {
    expected.push([
      `resources/${rel}`,
      path.join(resDir, rel),
      `resources/${rel}`,
      "deb-resources",
    ]);
  }
  for (const f of PACKAGING_FILES) {
    const src = path.join(ctrlDir, f);
    if (fs.existsSync(src)) {
      expected.push([`packaging:${f}`, src, `packaging/deb/${f}`, "control-archive"]);
    }
  }

  // --- Step 3: compare expected vs replica ---------------------------------
  const expectedReplicaPaths = new Set();
  let missing = 0,
    mismatch = 0,
    ok = 0;
  const problems = [];
  for (const [label, src, replicaRel, origin] of expected) {
    expectedReplicaPaths.add(replicaRel);
    const rep = path.join(REPLICA_ROOT, replicaRel);
    if (!fs.existsSync(rep)) {
      missing++;
      problems.push(`MISSING ${label} -> ${replicaRel}`);
      continue;
    }
    const srcMd5 = md5File(src);
    const repMd5 = md5File(rep);
    if (srcMd5 === repMd5) {
      ok++;
      console.log(`OK ${srcMd5} ${label} [${origin}]`);
    } else {
      mismatch++;
      problems.push(`MISMATCH ${label} -> ${replicaRel} expected=${srcMd5} replica=${repMd5}`);
    }
  }

  // --- Step 4: scan the replica for unexpected extras ----------------------
  const replicaFiles = walk(REPLICA_ROOT, {
    skipDir: (name) => name === ".git" || name === "node_modules",
  });
  const extras = replicaFiles.filter(
    (rel) => !expectedReplicaPaths.has(rel) && !SELF_FILES.has(rel),
  );

  // --- Step 5: report -------------------------------------------------------
  for (const p of problems) console.log(p);
  for (const e of extras) console.log(`EXTRA ${e}`);

  const asarCount = asarFiles.length;
  const resCount = resFiles.length;
  const pkgCount = expected.filter((e) => e[3] === "control-archive").length;
  console.log("");
  console.log(`SUMMARY deb=${deb}`);
  console.log(
    `SUMMARY md5sums entries=${md5sumsTotal} ok=${md5sumsOk} failed=${md5sumsFailed.length}`,
  );
  console.log(`SUMMARY expected asar first-party files (excl. node_modules)=${asarCount}`);
  console.log(`SUMMARY expected deb-level resources files=${resCount}`);
  console.log(`SUMMARY expected packaging files=${pkgCount}`);
  console.log(
    `SUMMARY expected total=${expected.length} ok=${ok} missing=${missing} mismatch=${mismatch}`,
  );
  console.log(
    `SUMMARY replica files scanned=${replicaFiles.length} self=${SELF_FILES.size} extra=${extras.length}`,
  );

  const pass = md5sumsFailed.length === 0 && missing === 0 && mismatch === 0 && extras.length === 0;
  console.log(`RESULT ${pass ? "PASS" : "FAIL"}`);
  process.exit(pass ? 0 : 1);
}

main();
