import { za as Zt } from "./chunk-L6SVKCE4.js";
import {
  Ae as u,
  Ce as L,
  Ec as jt,
  Jc as Wt,
  Oc as Ht,
  Rd as Gt,
  Yb as qt,
  a as x,
  ac as Vt,
  e as Ft,
  i as zt,
  xd as we,
  ye as S,
} from "./chunk-O5YHTQBW.js";
import { a as mo, b as uo, c as fo, e as po } from "./chunk-LB3WAUHR.js";
import { a as go, b as ho, c as Ro, d as yo } from "./chunk-GTLFVMZF.js";
import "./chunk-LMFUAIJT.js";
import { a as i, d as Te, e as Lt, f as Nt, i as Ut } from "./chunk-LVLFJXEE.js";
import { readFile as wo } from "fs/promises";
import { homedir as $o } from "os";
async function createRemoteBackend(e) {
  switch (e.kind) {
    case "ssh": {
      let { SSHBackend: t } = await import("./chunk-VHQLK5BG.js"),
        r;
      if (e.privateKeyPath) {
        let o = e.privateKeyPath.replace(/^~/, $o());
        r = await wo(o);
      }
      return new t({
        host: e.host,
        port: e.port,
        username: e.username,
        password: e.password,
        privateKeyPath: e.privateKeyPath,
        privateKeyPassphrase: e.privateKeyPassphrase,
        privateKey: r,
      });
    }
    case "wsl": {
      let { WSLBackend: t } = await import("./chunk-DAJTZ4HF.js");
      return new t(e);
    }
    case "docker": {
      let { DockerBackend: t } = await import("./chunk-PGLKZT4A.js");
      return new t(e);
    }
    case "server":
      throw new Error(
        "server remote target connects to an existing server and has no deploy backend",
      );
  }
}
i(createRemoteBackend, "createRemoteBackend");
function wrapStdioStream(e) {
  let t = new Te(),
    r = new Te(),
    o = new Te();
  return (
    e.stdout.on("data", (n) => {
      t.fire(Lt.wrap(new Uint8Array(n)));
    }),
    e.stdout.on("end", () => {
      o.fire();
    }),
    e.onClose(() => {
      (r.fire(), o.fire());
    }),
    {
      onData: t.event,
      onClose: r.event,
      onEnd: o.event,
      write(n) {
        e.stdin.write(Buffer.from(n.buffer));
      },
      end() {
        e.stdin.end();
      },
      drain() {
        let n = e.stdin;
        return new Promise((s) => {
          n.writableNeedDrain ? n.once("drain", s) : s();
        });
      },
      dispose() {
        e.stdin.end();
      },
    }
  );
}
i(wrapStdioStream, "wrapStdioStream");
var Kt = 2048;
function performHandshake(e, t, r = 1e4) {
  return new Promise((o, n) => {
    let s = "",
      a = "",
      c = "",
      l = !1,
      m = i((R, y) => {
        l || ((l = !0), p(), n(new Error(formatHandshakeFailure(R, { exitCode: y, stdout: a, stderr: c }))));
      }, "rejectWithDiagnostics"),
      d = setTimeout(() => {
        m("Handshake timeout: no zcode-hello received within timeout");
      }, r),
      f = i((R) => {
        let y = R.toString("utf-8");
        for (s += y, a = appendLimited(a, y); ;) {
          let A = s.indexOf(`
`);
          if (A === -1) break;
          let b = s.slice(0, A).trim();
          if (((s = s.slice(A + 1)), b.startsWith("{")))
            try {
              let C = JSON.parse(b),
                k = Vt.safeParse(C);
              if (k.success) {
                if (l) return;
                ((l = !0), p());
                let _ = { type: "zcode-hello-ack", version: x, clientId: t };
                (e.stdin.write(
                  JSON.stringify(_) +
                    `
`,
                ),
                  o({ hello: k.data, remaining: s.length > 0 ? Buffer.from(s, "utf-8") : null }));
                return;
              }
              if (C && typeof C == "object" && "type" in C && C.type === "zcode-hello") {
                m(`Invalid zcode-hello: ${qt(k.error)}`);
                return;
              }
            } catch {}
        }
      }, "onData"),
      h = i((R) => {
        c = appendLimited(c, R.toString("utf-8"));
      }, "onStderrData");
    (e.stdout.on("data", f), e.stderr.on("data", h));
    let g = e.onClose((R) => {
        m("Stream closed before handshake completed", R);
      }),
      p = i(() => {
        (clearTimeout(d),
          e.stdout.removeListener("data", f),
          e.stderr.removeListener("data", h),
          g.dispose());
      }, "cleanup");
  });
}
i(performHandshake, "performHandshake");
function appendLimited(e, t) {
  let r = e + t;
  return r.length <= Kt ? r : r.slice(r.length - Kt);
}
i(appendLimited, "appendLimited");
function formatHandshakeFailure(e, t) {
  let r = [e];
  t.exitCode !== void 0 && r.push(`exit code ${t.exitCode}`);
  let o = t.stderr.trim();
  o.length > 0 && r.push(`stderr: ${JSON.stringify(o)}`);
  let n = t.stdout.trim();
  return (
    n.length > 0 && r.push(`stdout: ${JSON.stringify(n)}`),
    r.length === 1 ? e : `${e} (${r.slice(1).join("; ")})`
  );
}
i(formatHandshakeFailure, "formatHandshakeFailure");
import { join as oi } from "path";
import { join as Ao } from "path";
import { access as vo } from "fs/promises";
var M = "~/.nofy/server";
async function fileExists(...e) {
  let t = Ao(...e);
  try {
    return (await vo(t), !0);
  } catch {
    return !1;
  }
}
i(fileExists, "fileExists");
function formatOptionalValue(e) {
  return e && e.trim().length > 0 ? e : "<empty>";
}
i(formatOptionalValue, "formatOptionalValue");
function formatOptionalValues(e) {
  let t = e?.map((r) => r.trim()).filter((r) => r.length > 0);
  return t && t.length > 0 ? t.join(", ") : "<empty>";
}
i(formatOptionalValues, "formatOptionalValues");
function buildRemoteMoveCommand(e, t) {
  return `command mv -f ${u(e)} ${u(t)}`;
}
i(buildRemoteMoveCommand, "buildRemoteMoveCommand");
function buildRemoteChmodExecutableCommand(e) {
  return `command chmod +x ${u(e)}`;
}
i(buildRemoteChmodExecutableCommand, "buildRemoteChmodExecutableCommand");
function buildRemoteExecutableReplaceCommand(e, t) {
  return `${buildRemoteChmodExecutableCommand(e)} && ${buildRemoteMoveCommand(e, t)}`;
}
i(buildRemoteExecutableReplaceCommand, "buildRemoteExecutableReplaceCommand");
function createRemoteAssetPlaceholderError(e, t, r) {
  return new Error(
    `[deploy] ${r} missing for ${e}. Development should read from mock-cdn/releases; production should download and cache remote assets from CDN (remoteCdnBaseUrl=${formatOptionalValue(t.remoteCdnBaseUrl)}, remoteCdnBaseUrls=${formatOptionalValues(t.remoteCdnBaseUrls)}, remoteCacheDir=${formatOptionalValue(t.remoteCacheDir)}).`,
  );
}
i(createRemoteAssetPlaceholderError, "createRemoteAssetPlaceholderError");
function waitForClose(e) {
  return new Promise((t, r) => {
    let o = "";
    (e.stderr.on("data", (n) => {
      o.length >= 2048 || (o += n.toString());
    }),
      e.onClose((n) => {
        if (n !== 0) {
          let s = o.trim();
          r(
            new Error(
              s.length > 0
                ? `[deploy] remote command failed with exit code ${n}: ${s}`
                : `[deploy] remote command failed with exit code ${n}`,
            ),
          );
          return;
        }
        t();
      }));
  });
}
i(waitForClose, "waitForClose");
import { createHash as tn, randomUUID as rn } from "crypto";
import { existsSync as pe } from "fs";
import {
  cp as on,
  lstat as nn,
  mkdir as mr,
  mkdtemp as sn,
  readdir as an,
  readFile as dr,
  readlink as ln,
  rm as cn,
} from "fs/promises";
import { tmpdir as mn } from "os";
import { dirname as dn, join as B, resolve as un } from "path";
import { gzip as Eo, gunzip as ko } from "zlib";
import {
  chmod as So,
  lstat as bo,
  mkdir as Pe,
  readFile as er,
  readlink as Mo,
  readdir as _o,
  symlink as To,
  unlink as xo,
  writeFile as tr,
} from "fs/promises";
import {
  dirname as xe,
  isAbsolute as Be,
  join as Bo,
  relative as rr,
  resolve as it,
  sep as or,
  posix as G,
} from "path";
import { promisify as nr } from "util";
var Io = nr(Eo),
  Oo = nr(ko),
  ee = 512,
  Lo = ee * 2;
async function extractTarGzArchive(e, t) {
  let r = it(t);
  await Pe(r, { recursive: !0 });
  let o = await Oo(await er(e)),
    n = 0,
    s = null;
  for (; n + ee <= o.length;) {
    let a = o.subarray(n, n + ee);
    if (((n += ee), isZeroBlock(a))) break;
    let c = parseTarOctal(a, 124, 12),
      l = n,
      m = l + c;
    if (m > o.length) throw new Error(`[remote-assets] truncated tar entry in ${e}`);
    let d = o.subarray(l, m);
    n = l + roundUpToTarBlock(c);
    let f = readTarTypeFlag(a);
    if (f === "L") {
      s = readTarString(d, 0, d.length);
      continue;
    }
    if (f === "x" || f === "g") continue;
    let h = s ?? readTarEntryPath(a);
    s = null;
    let g = normalizeExtractEntryPath(h);
    if (!g) continue;
    let p = resolvePathWithinBase(r, g),
      R = parseTarOctal(a, 100, 8);
    if (f === "5") {
      (await Pe(p, { recursive: !0 }), await applyMode(p, R));
      continue;
    }
    if (f === "0" || f === "\0") {
      (await Pe(xe(p), { recursive: !0 }), await tr(p, d), await applyMode(p, R));
      continue;
    }
    if (f === "2") {
      let y = normalizeExtractSymlinkTarget({ rawLinkTarget: readTarString(a, 157, 100), targetPath: p, targetRoot: r });
      (await Pe(xe(p), { recursive: !0 }), await unlinkIfExists(p), await To(y, p));
      continue;
    }
    throw new Error(`[remote-assets] unsupported tar entry type ${JSON.stringify(f)} for ${h}`);
  }
}
i(extractTarGzArchive, "extractTarGzArchive");
async function createTarGzArchive(e, t) {
  let r = [];
  for (let o of t) await appendTarEntry(r, o.sourcePath, o.archivePath);
  (r.push(Buffer.alloc(Lo)),
    await Pe(xe(e), { recursive: !0 }),
    await tr(e, await Io(Buffer.concat(r))));
}
i(createTarGzArchive, "createTarGzArchive");
async function appendTarEntry(e, t, r) {
  let o = await bo(t),
    n = normalizeCreateEntryPath(r);
  if (o.isDirectory()) {
    let a = ensureTrailingSlash(n);
    e.push(
      createTarHeader({
        entryPath: a,
        mode: 493,
        mtimeSeconds: Math.floor(o.mtimeMs / 1e3),
        size: 0,
        typeFlag: "5",
      }),
    );
    let c = (await _o(t, { withFileTypes: !0 })).sort((l, m) => l.name.localeCompare(m.name));
    for (let l of c) await appendTarEntry(e, Bo(t, l.name), G.join(n, l.name));
    return;
  }
  if (!o.isFile()) {
    if (o.isSymbolicLink()) {
      let a = normalizeCreateSymlinkTarget({ archivePath: n, rawLinkTarget: await Mo(t) });
      e.push(
        createTarHeader({
          entryPath: n,
          linkName: a,
          mode: 511,
          mtimeSeconds: Math.floor(o.mtimeMs / 1e3),
          size: 0,
          typeFlag: "2",
        }),
      );
      return;
    }
    throw new Error(`[remote-assets] unsupported local archive source: ${t}`);
  }
  let s = await er(t);
  e.push(
    createTarHeader({
      entryPath: n,
      mode: o.mode,
      mtimeSeconds: Math.floor(o.mtimeMs / 1e3),
      size: s.length,
      typeFlag: "0",
    }),
    s,
    Buffer.alloc(roundUpToTarBlock(s.length) - s.length),
  );
}
i(appendTarEntry, "appendTarEntry");
function createTarHeader(e) {
  let t = Buffer.alloc(ee),
    { name: r, prefix: o } = splitTarEntryPath(e.entryPath);
  if (
    (writeTarString(t, r, 0, 100),
    writeTarOctal(t, e.mode & 511, 100, 8),
    writeTarOctal(t, 0, 108, 8),
    writeTarOctal(t, 0, 116, 8),
    writeTarOctal(t, e.size, 124, 12),
    writeTarOctal(t, e.mtimeSeconds, 136, 12),
    t.fill(32, 148, 156),
    writeTarString(t, e.typeFlag, 156, 1),
    e.linkName)
  ) {
    if (Buffer.byteLength(e.linkName) > 100)
      throw new Error(`[remote-assets] tar symlink target is too long: ${e.linkName}`);
    writeTarString(t, e.linkName, 157, 100);
  }
  (writeTarString(t, "ustar", 257, 6),
    writeTarString(t, "00", 263, 2),
    writeTarString(t, "zcode", 265, 32),
    writeTarString(t, "zcode", 297, 32),
    writeTarString(t, o, 345, 155));
  let n = 0;
  for (let s of t) n += s;
  return (writeTarChecksum(t, n), t);
}
i(createTarHeader, "createTarHeader");
function splitTarEntryPath(e) {
  if (Buffer.byteLength(e) <= 100) return { name: e, prefix: "" };
  let r = e.split("/");
  for (let o = r.length - 1; o > 0; o -= 1) {
    let n = r.slice(0, o).join("/"),
      s = r.slice(o).join("/");
    if (Buffer.byteLength(n) <= 155 && Buffer.byteLength(s) <= 100) return { name: s, prefix: n };
  }
  throw new Error(`[remote-assets] tar entry path is too long: ${e}`);
}
i(splitTarEntryPath, "splitTarEntryPath");
function readTarEntryPath(e) {
  let t = readTarString(e, 0, 100),
    r = readTarString(e, 345, 155);
  return r ? `${r}/${t}` : t;
}
i(readTarEntryPath, "readTarEntryPath");
function readTarTypeFlag(e) {
  let t = e[156] ?? 0;
  return t === 0 ? "0" : String.fromCharCode(t);
}
i(readTarTypeFlag, "readTarTypeFlag");
function readTarString(e, t, r) {
  let o = e.subarray(t, t + r),
    n = o.indexOf(0);
  return o.subarray(0, n === -1 ? o.length : n).toString("utf8");
}
i(readTarString, "readTarString");
function writeTarString(e, t, r, o) {
  e.write(t, r, o, "utf8");
}
i(writeTarString, "writeTarString");
function parseTarOctal(e, t, r) {
  let o = readTarString(e, t, r).trim();
  return o ? Number.parseInt(o, 8) : 0;
}
i(parseTarOctal, "parseTarOctal");
function writeTarOctal(e, t, r, o) {
  let n = Math.trunc(t)
    .toString(8)
    .padStart(o - 1, "0");
  writeTarString(e, n.slice(-(o - 1)), r, o - 1);
}
i(writeTarOctal, "writeTarOctal");
function writeTarChecksum(e, t) {
  let r = t.toString(8).padStart(6, "0").slice(-6);
  (writeTarString(e, r, 148, 6), (e[154] = 0), (e[155] = 32));
}
i(writeTarChecksum, "writeTarChecksum");
function isZeroBlock(e) {
  return e.every((t) => t === 0);
}
i(isZeroBlock, "isZeroBlock");
function roundUpToTarBlock(e) {
  return Math.ceil(e / ee) * ee;
}
i(roundUpToTarBlock, "roundUpToTarBlock");
function normalizeCreateEntryPath(e) {
  let t = e.replace(/^\.\/+/u, "").replace(/\/+$/u, "");
  if (!t || t === ".") throw new Error("[remote-assets] tar entry path must not be empty");
  return t;
}
i(normalizeCreateEntryPath, "normalizeCreateEntryPath");
function normalizeExtractEntryPath(e) {
  let t = e.trim().replace(/^\.\/+/u, "");
  if (!t || t === ".") return null;
  if (t.includes("\\") || Be(t) || G.isAbsolute(t))
    throw new Error(`[remote-assets] unsafe tar entry path: ${e}`);
  let r = G.normalize(t).replace(/\/+$/u, "");
  if (!r || r === "." || r === ".." || r.startsWith("../") || r.includes("/../"))
    throw new Error(`[remote-assets] unsafe tar entry path: ${e}`);
  return r;
}
i(normalizeExtractEntryPath, "normalizeExtractEntryPath");
function normalizeCreateSymlinkTarget({ archivePath: e, rawLinkTarget: t }) {
  let r = normalizeSymlinkLinkName(t),
    o = G.dirname(e),
    n = G.normalize(G.join(o === "." ? "" : o, r));
  if (!n || n === "." || n === ".." || n.startsWith("../"))
    throw new Error(`[remote-assets] unsafe tar symlink target: ${t}`);
  return r;
}
i(normalizeCreateSymlinkTarget, "normalizeCreateSymlinkTarget");
function normalizeExtractSymlinkTarget({ rawLinkTarget: e, targetPath: t, targetRoot: r }) {
  let o = normalizeSymlinkLinkName(e),
    n = it(xe(t), ...o.split("/")),
    s = rr(r, n);
  if (s === "" || s.startsWith(`..${or}`) || s === ".." || Be(s))
    throw new Error(`[remote-assets] unsafe tar symlink target: ${e}`);
  return o;
}
i(normalizeExtractSymlinkTarget, "normalizeExtractSymlinkTarget");
function normalizeSymlinkLinkName(e) {
  let t = G.normalize(e);
  if (
    !e ||
    !t ||
    t === "." ||
    t.includes("\\") ||
    Be(t) ||
    G.isAbsolute(t) ||
    /^[a-zA-Z]:/u.test(t)
  )
    throw new Error(`[remote-assets] unsafe tar symlink target: ${e}`);
  return t;
}
i(normalizeSymlinkLinkName, "normalizeSymlinkLinkName");
function ensureTrailingSlash(e) {
  return e.endsWith("/") ? e : `${e}/`;
}
i(ensureTrailingSlash, "ensureTrailingSlash");
function resolvePathWithinBase(e, t) {
  let r = it(e, ...t.split("/"));
  return (assertPathInsideBase(e, r, t), r);
}
i(resolvePathWithinBase, "resolvePathWithinBase");
function assertPathInsideBase(e, t, r) {
  let o = rr(e, t);
  if (o === "" || o.startsWith(`..${or}`) || o === ".." || Be(o))
    throw new Error(`[remote-assets] unsafe tar entry path: ${r}`);
}
i(assertPathInsideBase, "assertPathInsideBase");
async function unlinkIfExists(e) {
  try {
    await xo(e);
  } catch (t) {
    if (t.code === "ENOENT") return;
    throw t;
  }
}
i(unlinkIfExists, "unlinkIfExists");
async function applyMode(e, t) {
  if (t)
    try {
      await So(e, t & 511);
    } catch {}
}
i(applyMode, "applyMode");
var ue = "nofy.cjs";
function buildRemoteAgentBundleWrapper(e) {
  return [
    "#!/bin/sh",
    "set -eu",
    'runtime_root="${ZCODE_SERVER_RUNTIME_ROOT:-$HOME/.nofy/server}"',
    `exec "$runtime_root/node" "$HOME/.nofy/server/agents/${e}/${ue}" "$@"`,
    "",
  ].join(`
`);
}
i(buildRemoteAgentBundleWrapper, "buildRemoteAgentBundleWrapper");
function isRemoteAgentBundleWrapperCurrent(e, t) {
  return (
    e.replace(
      /\r\n/g,
      `
`,
    ) === buildRemoteAgentBundleWrapper(t)
  );
}
i(isRemoteAgentBundleWrapperCurrent, "isRemoteAgentBundleWrapperCurrent");
import { writeFile as Yo, rm as Xo } from "fs/promises";
import { tmpdir as Qo } from "os";
import { join as en } from "path";
function isWslBackend(e) {
  return e.kind === "wsl";
}
i(isWslBackend, "isWslBackend");
async function deployRemoteAgentWrapper(e) {
  let t = `${e.remoteWrapperPath}.new`;
  if (isWslBackend(e.backend)) {
    let o = en(Qo(), `nofy-agent-wrapper-${process.pid}-${Date.now()}.sh`);
    try {
      (await Yo(o, e.content, "utf8"), await e.backend.upload(o, t));
      let n = await e.backend.exec(buildRemoteExecutableReplaceCommand(t, e.remoteWrapperPath));
      await waitForClose(n);
    } finally {
      await Xo(o, { force: !0 });
    }
    return;
  }
  let r = await e.backend.exec([L(t, e.content), buildRemoteExecutableReplaceCommand(t, e.remoteWrapperPath)].join(" && "));
  await waitForClose(r);
}
i(deployRemoteAgentWrapper, "deployRemoteAgentWrapper");
import { posix as at } from "path";
var U = "packages",
  Ne = [
    "android-emulator-plugin",
    "browser-use-plugin",
    "document-skills-plugin",
    "ios-simulator-plugin",
    "restore-legacy-sessions-plugin",
    "skill-creator-plugin",
    "zcode-guide-plugin",
  ],
  lt = [
    ".mcp.json",
    ".nofy-plugin",
    "README.md",
    "commands",
    "dist",
    "docs",
    "hooks",
    "output-styles",
    "package.json",
    "scripts",
    "skills",
    "templates",
  ],
  te = [
    ...Ne.map((e) => `${e}/.nofy-plugin/plugin.json`),
    "browser-use-plugin/dist/mcp/server.js",
    "browser-use-plugin/docs/api.json",
    "browser-use-plugin/docs/documents.json",
    "browser-use-plugin/docs/overview.md",
    "browser-use-plugin/docs/workflow.md",
    "browser-use-plugin/scripts/browser-client.mjs",
    "browser-use-plugin/skills/control-browser/SKILL.md",
    "browser-use-plugin/skills/web-gui-tester/SKILL.md",
  ];
function buildRemoteAgentOfficialPluginDir(e) {
  return at.join(e, U);
}
i(buildRemoteAgentOfficialPluginDir, "buildRemoteAgentOfficialPluginDir");
function buildRemoteAgentOfficialPluginSourceRelativePath(e) {
  return at.join(e.runtimeResourceDir, e.platformArch, U);
}
i(buildRemoteAgentOfficialPluginSourceRelativePath, "buildRemoteAgentOfficialPluginSourceRelativePath");
function buildRemoteAgentOfficialPluginRequiredPaths(e) {
  let t = buildRemoteAgentOfficialPluginDir(e);
  return te.map((r) => at.join(t, r));
}
i(buildRemoteAgentOfficialPluginRequiredPaths, "buildRemoteAgentOfficialPluginRequiredPaths");
async function repairLegacyRemoteOfficialPluginDirectoryPermissions(e) {
  e.loggers.logWarn(
    `[nofy-agent-deploy] ${"glm"}: \u68C0\u67E5\u5E76\u4FEE\u590D\u65E7 builtin plugin \u76EE\u5F55\u6743\u9650 ${e.remoteOfficialPluginDir}`,
  );
  let t = u(e.remoteOfficialPluginDir),
    r = await e.backend.exec(`if [ -d ${t} ]; then command chmod -R u+rwX ${t}; fi`);
  try {
    return (await waitForClose(r), !0);
  } catch (o) {
    return (
      e.loggers.logWarn(
        `[nofy-agent-deploy] ${"glm"}: \u4FEE\u590D\u65E7 builtin plugin \u76EE\u5F55\u6743\u9650\u5931\u8D25\uFF0C\u5C06\u7EE7\u7EED\u5C1D\u8BD5\u66FF\u6362 packages: ${o instanceof Error ? o.message : String(o)}`,
      ),
      !1
    );
  }
}
i(repairLegacyRemoteOfficialPluginDirectoryPermissions, "repairLegacyRemoteOfficialPluginDirectoryPermissions");
var fn = "apps/zcode-cli/packages/cli/dist/zcode.cjs",
  pn = "ZCODE_REMOTE_DEV_AGENT_BUNDLE",
  gn = ue,
  hn = ".dev-version";
function findUpward(e) {
  let t = un(process.cwd());
  for (;;) {
    let r = B(t, e);
    if (pe(r)) return { rootDir: t, path: r };
    let o = dn(t);
    if (o === t) return null;
    t = o;
  }
}
i(findUpward, "findUpward");
function shouldUseDevelopmentAgentBundle() {
  if (Wt(process.env) !== "development") return !1;
  let e = process.env[pn]?.trim().toLowerCase();
  return e === "0" || e === "false" ? !1 : e === "1" || e === "true" ? !0 : !process.env.VITEST;
}
i(shouldUseDevelopmentAgentBundle, "shouldUseDevelopmentAgentBundle");
function resolveDevelopmentAgentBundle() {
  if (!shouldUseDevelopmentAgentBundle()) return null;
  let e = findUpward(fn);
  return e ? { repoRoot: e.rootDir, localBundlePath: e.path } : null;
}
i(resolveDevelopmentAgentBundle, "resolveDevelopmentAgentBundle");
async function computeDevelopmentAgentAssetsSha256(e) {
  let t = tn("sha256");
  (t.update(`bundle:zcode.cjs
`),
    t.update(await dr(e.localBundlePath)));
  for (let r of Ne) {
    let o = B(e.repoRoot, "apps", "zcode-cli", "packages", r);
    (t.update(`plugin:${r}
`),
      await hashDevelopmentOfficialPluginPackage(t, o, r));
  }
  return t.digest("hex");
}
i(computeDevelopmentAgentAssetsSha256, "computeDevelopmentAgentAssetsSha256");
async function hashDevelopmentOfficialPluginPackage(e, t, r) {
  let o = B(t, ".nofy-plugin", "plugin.json");
  if (!pe(o)) throw new Error(`[nofy-agent-deploy] missing official plugin manifest: ${o}`);
  assertDevelopmentOfficialPluginRequiredAssets(t, r);
  for (let n of lt) {
    let s = B(t, n);
    pe(s) && (await hashLocalPath(e, s, `${r}/${n}`));
  }
}
i(hashDevelopmentOfficialPluginPackage, "hashDevelopmentOfficialPluginPackage");
async function hashLocalPath(e, t, r) {
  let o = await nn(t);
  if (o.isDirectory()) {
    e.update(`dir:${r}
`);
    let n = (await an(t)).sort((s, a) => s.localeCompare(a, "en"));
    for (let s of n) await hashLocalPath(e, B(t, s), `${r}/${s}`);
    return;
  }
  if (o.isSymbolicLink()) {
    e.update(`symlink:${r}:${await ln(t)}
`);
    return;
  }
  o.isFile() &&
    (e.update(`file:${r}:${o.mode & 511}:${o.size}
`),
    e.update(await dr(t)));
}
i(hashLocalPath, "hashLocalPath");
function assertDevelopmentOfficialPluginRequiredAssets(e, t) {
  let r = `${t}/`;
  for (let o of te) {
    if (!o.startsWith(r)) continue;
    let n = o.slice(r.length),
      s = B(e, ...n.split("/"));
    if (!pe(s))
      throw new Error(`[nofy-agent-deploy] missing official plugin required asset: ${s}`);
  }
}
i(assertDevelopmentOfficialPluginRequiredAssets, "assertDevelopmentOfficialPluginRequiredAssets");
async function findMissingRemoteOfficialPluginAssetPaths(e) {
  let t = [];
  for (let r of buildRemoteAgentOfficialPluginRequiredPaths(e.remoteProviderDir)) (await e.backend.exists(r)) || t.push(r);
  return t;
}
i(findMissingRemoteOfficialPluginAssetPaths, "findMissingRemoteOfficialPluginAssetPaths");
async function shouldSkipDevelopmentZCodeAgentDeploy(e) {
  if (e.force) return !1;
  let t, r;
  try {
    ((t = (await e.backend.readFile(e.remoteVersionFile)).trim()),
      (r = (await e.backend.readFile(e.remoteDevVersionFile)).trim()));
  } catch {
    return !1;
  }
  if (t !== e.runtimeVersion || r !== e.devVersion || !(await e.backend.exists(e.remoteBinaryPath)))
    return !1;
  if (isWslBackend(e.backend))
    try {
      let o = await e.backend.readFile(e.remoteBinaryPath);
      if (!isRemoteAgentBundleWrapperCurrent(o, e.runtimeResourceDir)) return !1;
    } catch {
      return !1;
    }
  return !(await e.backend.exists(e.remoteBundlePath)) ||
    e.missingOfficialPluginAssetPaths.length > 0
    ? !1
    : (e.loggers.log(
        `[nofy-agent-deploy] ${"glm"}: \u5F00\u53D1\u6001 zcode.cjs \u672A\u53D8\u5316\uFF0C\u8DF3\u8FC7`,
      ),
      !0);
}
i(shouldSkipDevelopmentZCodeAgentDeploy, "shouldSkipDevelopmentZCodeAgentDeploy");
async function stageDevelopmentOfficialPluginPackages(e) {
  await mr(e.packagesDir, { recursive: !0 });
  for (let t of Ne) {
    let r = B(e.repoRoot, "apps", "zcode-cli", "packages", t),
      o = B(r, ".nofy-plugin", "plugin.json");
    if (!pe(o)) throw new Error(`[nofy-agent-deploy] missing official plugin manifest: ${o}`);
    assertDevelopmentOfficialPluginRequiredAssets(r, t);
    let n = B(e.packagesDir, t);
    await mr(n, { recursive: !0 });
    for (let s of lt) {
      let a = B(r, s);
      pe(a) && (await on(a, B(n, s), { recursive: !0 }));
    }
  }
}
i(stageDevelopmentOfficialPluginPackages, "stageDevelopmentOfficialPluginPackages");
async function uploadDevelopmentOfficialPluginPackages(e) {
  let t = await sn(B(mn(), "zcode-remote-agent-packages-")),
    r = B(t, U),
    o = B(t, `${U}.tar.gz`);
  try {
    (await stageDevelopmentOfficialPluginPackages({ repoRoot: e.repoRoot, packagesDir: r }),
      await createTarGzArchive(o, [{ sourcePath: r, archivePath: U }]));
    let n = `${Date.now()}-${rn()}`,
      s = `${e.remoteProviderDir}/${U}.tar.gz-${n}`,
      a = `${e.remoteProviderDir}/${U}.extract-${n}`,
      c = `${a}/${U}`,
      l = i(async () => {
        try {
          let m = await e.backend.exec(`rm -f ${u(s)} && rm -rf ${u(a)}`);
          await waitForClose(m);
        } catch (m) {
          e.loggers.logWarn(
            `[nofy-agent-deploy] ${"glm"}: \u6E05\u7406 owner staging \u5931\u8D25 (${n}): ${String(m)}`,
          );
        }
      }, "cleanupRemoteStaging");
    e.loggers.log(
      `[nofy-agent-deploy] ${"glm"}: \u5F00\u53D1\u6001\u4E0A\u4F20\u5B98\u65B9\u63D2\u4EF6\u8D44\u6E90`,
    );
    try {
      (await e.backend.upload(o, s),
        await repairLegacyRemoteOfficialPluginDirectoryPermissions({
          backend: e.backend,
          loggers: e.loggers,
          remoteOfficialPluginDir: buildRemoteAgentOfficialPluginDir(e.remoteProviderDir),
        }));
      let m = await e.backend.exec(
        [
          "set -eu",
          `cleanup_staging() { rm -f ${u(s)}; rm -rf ${u(a)}; }`,
          "trap cleanup_staging EXIT HUP INT TERM",
          `rm -rf ${u(a)}`,
          `mkdir -p ${u(a)} ${u(e.remoteProviderDir)}`,
          `tar -xzf ${u(s)} -C ${u(a)}`,
          `test -d ${u(c)}`,
          `rm -rf ${u(`${e.remoteProviderDir}/${U}`)}`,
          buildRemoteMoveCommand(c, `${e.remoteProviderDir}/${U}`),
          "cleanup_staging",
          "trap - EXIT HUP INT TERM",
        ].join(`
`),
      );
      await waitForClose(m);
    } catch (m) {
      throw (await l(), m);
    }
  } finally {
    await cn(t, { recursive: !0, force: !0 });
  }
}
i(uploadDevelopmentOfficialPluginPackages, "uploadDevelopmentOfficialPluginPackages");
async function deployDevelopmentZCodeAgentRuntime(e, t, r) {
  let o = resolveDevelopmentAgentBundle();
  if (!o) return !1;
  let n = `${t.remoteProviderDir}/${gn}`,
    s = `${t.remoteProviderDir}/${hn}`,
    a = await computeDevelopmentAgentAssetsSha256({ localBundlePath: o.localBundlePath, repoRoot: o.repoRoot }),
    c = await findMissingRemoteOfficialPluginAssetPaths({ backend: e, remoteProviderDir: t.remoteProviderDir });
  if (
    await shouldSkipDevelopmentZCodeAgentDeploy({
      backend: e,
      remoteVersionFile: t.remoteVersionFile,
      remoteDevVersionFile: s,
      remoteBinaryPath: t.remoteBinaryPath,
      remoteBundlePath: n,
      runtimeResourceDir: t.runtimeResourceDir,
      runtimeVersion: t.runtimeVersion,
      devVersion: a,
      force: t.force,
      missingOfficialPluginAssetPaths: c,
      loggers: r,
    })
  )
    return !0;
  r.log(
    `[nofy-agent-deploy] ${"glm"}: \u5F00\u53D1\u6001\u4E0A\u4F20\u672C\u5730 zcode.cjs ${a.slice(0, 12)}`,
  );
  let l = await e.exec(`mkdir -p ${u(t.remoteProviderDir)}`);
  await waitForClose(l);
  let m = `${n}.new`;
  await e.upload(o.localBundlePath, m);
  let d = await e.exec(buildRemoteMoveCommand(m, n));
  (await waitForClose(d),
    await uploadDevelopmentOfficialPluginPackages({
      backend: e,
      repoRoot: o.repoRoot,
      remoteProviderDir: t.remoteProviderDir,
      loggers: r,
    }));
  let f = buildRemoteAgentBundleWrapper(t.runtimeResourceDir),
    h = [L(s, a), L(t.remoteVersionFile, t.runtimeVersion)],
    g;
  if (isWslBackend(e))
    (await deployRemoteAgentWrapper({ backend: e, content: f, remoteWrapperPath: t.remoteBinaryPath }),
      (g = await e.exec(h.join(" && "))));
  else {
    let p = `${t.remoteBinaryPath}.new`;
    g = await e.exec([L(p, f), buildRemoteExecutableReplaceCommand(p, t.remoteBinaryPath), ...h].join(" && "));
  }
  return (
    await waitForClose(g),
    r.log(
      `[nofy-agent-deploy] ${"glm"}: \u5F00\u53D1\u6001\u90E8\u7F72\u5B8C\u6210 ${a.slice(0, 12)}`,
    ),
    !0
  );
}
i(deployDevelopmentZCodeAgentRuntime, "deployDevelopmentZCodeAgentRuntime");
import { readFile as Rs } from "fs/promises";
import { join as ys } from "path";
import { createHash as yr, randomUUID as Ve } from "crypto";
import { constants as Bn, createReadStream as wr, createWriteStream as In } from "fs";
import {
  copyFile as On,
  link as Ln,
  mkdir as z,
  readdir as Me,
  readFile as Ma,
  rename as Nn,
  rm as se,
  stat as Y,
  writeFile as $r,
} from "fs/promises";
import { tmpdir as Ta } from "os";
import { dirname as gt, join as v, resolve as J, sep as Un } from "path";
import { Readable as Fn, Transform as zn } from "stream";
import { pipeline as qn } from "stream/promises";
import { setTimeout as Cr } from "timers/promises";
import { posix as En } from "path";
function resolveRemoteCdnBaseUrls(e) {
  let t = [...(e.remoteCdnBaseUrls ?? []), e.remoteCdnBaseUrl ?? ""]
    .map((r) => r.trim())
    .filter((r) => r.length > 0);
  return Array.from(new Set(t));
}
i(resolveRemoteCdnBaseUrls, "resolveRemoteCdnBaseUrls");
function buildReleaseBaseCandidates(e, t) {
  let r = e.flatMap((o) => {
    let n = o.replace(/\/+$/, "");
    return n.endsWith(`/${t}`) ? [n] : [`${n}/${t}`, n];
  });
  return Array.from(new Set(r));
}
i(buildReleaseBaseCandidates, "buildReleaseBaseCandidates");
function buildReleaseAssetUrlCandidates(e, t) {
  let r = [];
  for (let o of t) {
    let n = normalizeRemoteAssetRelativePath(o, "release asset path");
    for (let s of e) r.push(joinCdnUrl(s, n));
  }
  return Array.from(new Set(r));
}
i(buildReleaseAssetUrlCandidates, "buildReleaseAssetUrlCandidates");
function buildArtifactUrlCandidates(e, t) {
  let r = normalizeRemoteAssetRelativePath(t, "artifactPath"),
    o = e.map((n) => joinCdnUrl(n, r));
  return Array.from(new Set(o));
}
i(buildArtifactUrlCandidates, "buildArtifactUrlCandidates");
function buildComponentArtifactUrlCandidates(e, t, r) {
  return buildArtifactUrlCandidates(buildComponentReleaseBaseCandidates(e, r), t);
}
i(buildComponentArtifactUrlCandidates, "buildComponentArtifactUrlCandidates");
function buildComponentReleaseBaseCandidates(e, t) {
  let r = e.flatMap((o) => {
    let n = o.replace(/\/+$/, "");
    return n.endsWith(`/${t}`) ? [n.slice(0, -t.length - 1), n] : [n];
  });
  return Array.from(new Set(r.filter((o) => o.length > 0)));
}
i(buildComponentReleaseBaseCandidates, "buildComponentReleaseBaseCandidates");
function normalizeRemoteAssetRelativePath(e, t) {
  let r = e.trim();
  if (!r) throw new Error(`[remote-assets] ${t} is empty`);
  if (r.includes("\\")) throw new Error(`[remote-assets] ${t} must not contain backslash: ${e}`);
  if (r.startsWith("/") || /^[A-Za-z]:/u.test(r))
    throw new Error(`[remote-assets] ${t} must be relative path: ${e}`);
  let o = r.split("/");
  if (o.some((a) => a.length === 0))
    throw new Error(`[remote-assets] ${t} contains empty path segment: ${e}`);
  if (o.includes("..")) throw new Error(`[remote-assets] ${t} must not contain '..': ${e}`);
  if (o.includes(".")) throw new Error(`[remote-assets] ${t} must not contain '.': ${e}`);
  let s = En.normalize(r).split("/");
  if (s.some((a) => a.length === 0 || a === "." || a === ".."))
    throw new Error(`[remote-assets] ${t} is invalid after normalize: ${e}`);
  return s.join("/");
}
i(normalizeRemoteAssetRelativePath, "normalizeRemoteAssetRelativePath");
function assertRemoteCdnBaseVersionMatches(e, t) {
  let r = e.flatMap((o) => {
    let n = extractPinnedReleaseVersionFromCdnBaseUrl(o);
    return !n || n === t ? [] : [{ remoteCdnBaseUrl: o, pinnedVersion: n }];
  });
  if (r.length !== 0)
    throw new Error(
      `[remote-assets] remoteCdnBaseUrl \u7248\u672C\u4E0D\u5339\u914D\uFF1A\u5F53\u524D\u5E94\u7528\u7248\u672C\u662F ${t}\uFF0C\u4F46\u4EE5\u4E0B\u57FA\u5740\u56FA\u5B9A\u5728\u5176\u4ED6\u7248\u672C\uFF1A${r.map(({ remoteCdnBaseUrl: o, pinnedVersion: n }) => `${n} (${o})`).join(", ")}\u3002\u8BF7\u5C06 ZCODE_REMOTE_ASSET_CDN_BASE_URL \u6539\u4E3A\u4E0D\u5E26\u7248\u672C\u7684\u53D1\u5E03\u6839\u76EE\u5F55\uFF0C\u6216\u6539\u4E3A ${t} \u5BF9\u5E94\u76EE\u5F55\u3002`,
    );
}
i(assertRemoteCdnBaseVersionMatches, "assertRemoteCdnBaseVersionMatches");
function joinCdnUrl(e, t) {
  let r = e.replace(/\/+$/, ""),
    o = encodeRelativePathForUrl(t);
  return `${r}/${o}`;
}
i(joinCdnUrl, "joinCdnUrl");
function encodeRelativePathForUrl(e) {
  return e
    .split("/")
    .map((t) => encodePathSegment(t))
    .join("/");
}
i(encodeRelativePathForUrl, "encodeRelativePathForUrl");
function encodePathSegment(e) {
  try {
    return encodeURIComponent(decodeURIComponent(e));
  } catch {
    return encodeURIComponent(e);
  }
}
i(encodePathSegment, "encodePathSegment");
function extractPinnedReleaseVersionFromCdnBaseUrl(e) {
  let t = e.replace(/\/+$/, ""),
    s = (tryParseUrlPathname(t) ?? t)
      .split("/")
      .filter((a) => a.length > 0)
      .at(-1);
  return s && isSemverLike(s) ? s : null;
}
i(extractPinnedReleaseVersionFromCdnBaseUrl, "extractPinnedReleaseVersionFromCdnBaseUrl");
function tryParseUrlPathname(e) {
  try {
    return new URL(e).pathname;
  } catch {
    return null;
  }
}
i(tryParseUrlPathname, "tryParseUrlPathname");
function isSemverLike(e) {
  return /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/u.test(e);
}
i(isSemverLike, "isSemverLike");
var Se = "manifest-",
  je = ".ready",
  Vn = ".remote-assets-ready",
  Pr = [je, Vn],
  mt = new Map(),
  ge = new Map(),
  K = new Map(),
  dt = new Map(),
  qe = new Map(),
  jn = 1e4,
  Wn = 1e3,
  Hn = 5,
  pt = { "server-bundle": "server-content", glm: "glm-content" },
  Ar = [50, 100, 200, 400, 800, 1600, 3200],
  vr = {
    "server-bundle": {
      platformScoped: !1,
      resolveExpectedMount: i(() => "server", "resolveExpectedMount"),
    },
    "node-runtime": {
      platformScoped: !0,
      resolveExpectedMount: i((e) => `node/${e}`, "resolveExpectedMount"),
    },
    "node-pty": {
      platformScoped: !0,
      resolveExpectedMount: i((e) => `node-pty/${e}`, "resolveExpectedMount"),
    },
    glm: { platformScoped: !0, resolveExpectedMount: i((e) => `glm/${e}`, "resolveExpectedMount") },
    bfs: {
      platformScoped: !0,
      resolveExpectedMount: i((e) => `tools/${e}/bfs`, "resolveExpectedMount"),
    },
    ripgrep: {
      platformScoped: !0,
      resolveExpectedMount: i((e) => `tools/${e}/ripgrep`, "resolveExpectedMount"),
    },
    ugrep: {
      platformScoped: !0,
      resolveExpectedMount: i((e) => `tools/${e}/ugrep`, "resolveExpectedMount"),
    },
  };
function createRemoteAssetManifestRequestSignal(e = jn) {
  if (!Number.isSafeInteger(e) || e <= 0)
    throw new Error(
      `[remote-assets] manifest request timeout must be a positive safe integer: ${String(e)}`,
    );
  return AbortSignal.timeout(e);
}
i(createRemoteAssetManifestRequestSignal, "createRemoteAssetManifestRequestSignal");
async function ensureRemoteReleaseDirFromCdn(e, t) {
  let r = resolveRemoteCdnBaseUrls(e),
    o = e.remoteCacheDir?.trim(),
    n = e.platformArch?.trim(),
    s = e.version?.trim();
  if (r.length === 0 || !o || !n || !s)
    throw new Error(
      `[deploy] production remote assets require remoteCdnBaseUrl or remoteCdnBaseUrls, remoteCacheDir and platformArch (remoteCdnBaseUrl=${e.remoteCdnBaseUrl ?? "<empty>"}, remoteCdnBaseUrls=${JSON.stringify(e.remoteCdnBaseUrls ?? [])}, remoteCacheDir=${e.remoteCacheDir ?? "<empty>"}, platformArch=${e.platformArch ?? "<empty>"}).`,
    );
  (assertSafePathSegment(s, "appVersion"), assertSafePathSegment(n, "platformArch"), assertRemoteCdnBaseVersionMatches(r, s));
  let a = normalizeRequestedComponentIds(e.componentIds),
    c = a === null || Array.from(a).some((p) => usesRemoteAssetContentAddressedCacheIdentity(p)),
    l = normalizeRequiredReleasePaths(e.requiredReleasePaths),
    m = v(o, "releases", s, n);
  if (!e.forceRefresh && !c && (await isReadyReleaseDirForRequestedPaths(m, n, l))) return m;
  t.logWarn(
    `[remote-assets] download required: component=<release> reason=local cache missing or invalid path=${m}`,
  );
  let d = a ? Array.from(a).sort().join(",") : "<all>",
    f = c ? resolveContentAddressedReleaseSegments(e.manifestRef ? selectManifestComponents(e.manifestRef.manifest, a) : [], a).join("/") : void 0,
    h = [
      J(m),
      d,
      e.manifestRef === null ? "<missing-manifest>" : f || "<unpinned>",
      e.forceRefresh ? "force" : "reuse",
      String(e.manifestRequestTimeoutMs ?? "default"),
    ].join("::");
  for (;;) {
    let p = mt.get(h);
    if (!p) break;
    let R = await p,
      y = await findMissingLocalRelativePaths(R, l);
    if (y.length === 0) return R;
    t.logWarn(
      `[remote-assets] locked release cache still incomplete: missing=${y.join(",")}; redownloading`,
    );
  }
  let g = ensureRemoteReleaseDirFromCdnInternal(
    {
      remoteCdnBaseUrls: r,
      remoteCacheDir: o,
      version: s,
      platformArch: n,
      requestedComponentIds: a,
      requiredReleasePaths: l,
      manifestRef: e.manifestRef,
      forceRefresh: e.forceRefresh,
      manifestRequestTimeoutMs: e.manifestRequestTimeoutMs,
    },
    t,
  ).finally(() => {
    mt.delete(h);
  });
  return (mt.set(h, g), g);
}
i(ensureRemoteReleaseDirFromCdn, "ensureRemoteReleaseDirFromCdn");
async function fetchRemoteAssetManifestFromCdn(e, t) {
  return (await fetchRemoteAssetManifestRefFromCdn(e, t))?.manifest ?? null;
}
i(fetchRemoteAssetManifestFromCdn, "fetchRemoteAssetManifestFromCdn");
async function fetchRemoteAssetManifestRefFromCdn(e, t) {
  let r = resolveRemoteCdnBaseUrls(e),
    o = e.remoteCacheDir?.trim(),
    n = e.platformArch?.trim(),
    s = e.version?.trim();
  if (r.length === 0 || !o || !n || !s) return null;
  (assertSafePathSegment(s, "appVersion"), assertSafePathSegment(n, "platformArch"), assertRemoteCdnBaseVersionMatches(r, s));
  let a = buildReleaseBaseCandidates(r, s),
    c = buildRemoteManifestFileCandidates(n),
    l = c[0] ?? `${Se}${n}.json`,
    m = buildReleaseAssetUrlCandidates(a, c);
  return await fetchRemoteAssetManifest(
    {
      remoteCacheDir: o,
      version: s,
      platformArch: n,
      remoteCdnBaseUrls: r,
      releaseBaseCandidates: a,
      manifestUrlCandidates: m,
      manifestFileName: l,
      manifestRequestTimeoutMs: e.manifestRequestTimeoutMs,
    },
    t,
    e.refreshManifest ? async () => !0 : void 0,
  );
}
i(fetchRemoteAssetManifestRefFromCdn, "fetchRemoteAssetManifestRefFromCdn");
async function ensureRemoteReleaseDirFromCdnInternal(e, t) {
  let r =
      e.requestedComponentIds === null || Array.from(e.requestedComponentIds).some((m) => usesRemoteAssetContentAddressedCacheIdentity(m)),
    o = v(e.remoteCacheDir, "releases", e.version, e.platformArch);
  if (!e.forceRefresh && !r && (await isReadyReleaseDirForRequestedPaths(o, e.platformArch, e.requiredReleasePaths))) return o;
  let n = buildReleaseBaseCandidates(e.remoteCdnBaseUrls, e.version),
    s = buildRemoteManifestFileCandidates(e.platformArch),
    a = s[0] ?? `${Se}${e.platformArch}.json`,
    c = buildReleaseAssetUrlCandidates(n, s);
  if (e.manifestRef)
    return ensureRemoteReleaseDirFromManifest(
      {
        remoteCacheDir: e.remoteCacheDir,
        version: e.version,
        platformArch: e.platformArch,
        releaseBaseCandidatesForComponents: e.manifestRef.releaseBaseCandidatesForComponents,
        requestedComponentIds: e.requestedComponentIds,
        requiredReleasePaths: e.requiredReleasePaths,
        forceRefresh: e.forceRefresh,
      },
      e.manifestRef.manifest,
      t,
    );
  if (e.manifestRef === null)
    throw new Error(`[remote-assets] manifest not found for ${e.platformArch}: ${a}`);
  let l = await fetchRemoteAssetManifest(
    {
      remoteCacheDir: e.remoteCacheDir,
      version: e.version,
      platformArch: e.platformArch,
      remoteCdnBaseUrls: e.remoteCdnBaseUrls,
      releaseBaseCandidates: n,
      manifestUrlCandidates: c,
      manifestFileName: a,
      manifestRequestTimeoutMs: e.manifestRequestTimeoutMs,
    },
    t,
    r
      ? async (m) => {
          let d = selectManifestComponents(m.manifest, e.requestedComponentIds),
            f = resolveContentAddressedReleaseSegments(d, e.requestedComponentIds);
          return f.length > 0
            ? pathExists(
                v(
                  e.remoteCacheDir,
                  "releases",
                  e.version,
                  e.platformArch,
                  ...f,
                  `${Se}${e.platformArch}.json`,
                ),
              )
            : !1;
        }
      : void 0,
  );
  if (l)
    return ensureRemoteReleaseDirFromManifest(
      {
        remoteCacheDir: e.remoteCacheDir,
        version: e.version,
        platformArch: e.platformArch,
        releaseBaseCandidatesForComponents: l.releaseBaseCandidatesForComponents,
        requestedComponentIds: e.requestedComponentIds,
        requiredReleasePaths: e.requiredReleasePaths,
        forceRefresh: e.forceRefresh,
      },
      l.manifest,
      t,
    );
  throw new Error(`[remote-assets] manifest not found for ${e.platformArch}: ${a}`);
}
i(ensureRemoteReleaseDirFromCdnInternal, "ensureRemoteReleaseDirFromCdnInternal");
async function fetchRemoteAssetManifest(e, t, r) {
  let o = [
      J(e.remoteCacheDir),
      e.version,
      e.platformArch,
      String(e.manifestRequestTimeoutMs ?? "default"),
      ...e.remoteCdnBaseUrls,
    ].join("::"),
    n = ge.get(o);
  if (n) {
    let a = K.get(o);
    if (a) return a;
    let c = await n,
      l = K.get(o);
    if (l) return l;
    if (!!!(c && r && (await r(c)))) return c;
    let d = K.get(o);
    if (d) return d;
  }
  let s;
  return (
    (s = fetchRemoteAssetManifestInternal(e, t).then(
      (a) => (!a && ge.get(o) === s && ge.delete(o), a),
      (a) => {
        throw (ge.get(o) === s && ge.delete(o), a);
      },
    )),
    ge.set(o, s),
    r &&
      (K.set(o, s),
      s.then(
        () => {
          K.get(o) === s && K.delete(o);
        },
        () => {
          K.get(o) === s && K.delete(o);
        },
      )),
    s
  );
}
i(fetchRemoteAssetManifest, "fetchRemoteAssetManifest");
async function fetchRemoteAssetManifestInternal(e, t) {
  let r = await fetchFirstAvailableManifestOrNullWhenNotFound({
    candidates: e.manifestUrlCandidates,
    fileLabel: e.manifestFileName,
    version: e.version,
    platformArch: e.platformArch,
    manifestRequestTimeoutMs: e.manifestRequestTimeoutMs,
  });
  if (!r) return null;
  t.log(`[remote-assets] downloading ${r.url}`);
  let o = resolveReleaseBaseByAssetUrl(r.url, e.releaseBaseCandidates),
    n = o ? [o, ...e.releaseBaseCandidates.filter((s) => s !== o)] : e.releaseBaseCandidates;
  return { manifest: r.manifest, releaseBaseCandidatesForComponents: n };
}
i(fetchRemoteAssetManifestInternal, "fetchRemoteAssetManifestInternal");
async function ensureRemoteReleaseDirFromManifest(e, t, r) {
  let o = selectManifestComponents(t, e.requestedComponentIds),
    n = v(
      e.remoteCacheDir,
      "releases",
      e.version,
      e.platformArch,
      ...resolveContentAddressedReleaseSegments(o, e.requestedComponentIds),
    );
  if (!e.forceRefresh && (await isReadyReleaseDirForRequestedPaths(n, e.platformArch, e.requiredReleasePaths))) return n;
  let s = [];
  for (let a of o) {
    let c = await ensureRemoteComponentDirFromCdn(e, a, resolveRequiredComponentPaths(a, e.requiredReleasePaths), r, !!e.forceRefresh);
    s.push({ component: a, componentDir: c });
  }
  return (
    await runWithReleaseMaterializeLock(n, async () => {
      await z(n, { recursive: !0 });
      for (let { component: a, componentDir: c } of s)
        await materializeComponentIntoReleaseDir(a, c, n, e.remoteCacheDir, e.platformArch);
      if (
        (await $r(
          v(n, `${Se}${e.platformArch}.json`),
          `${JSON.stringify(t)}
`,
          "utf8",
        ),
        !e.requestedComponentIds)
      ) {
        if (!(await isValidReleaseDir(n, e.platformArch)))
          throw new Error("[remote-assets] assembled release directory is invalid");
        await writeReadyMarker(n, je);
      }
    }),
    n
  );
}
i(ensureRemoteReleaseDirFromManifest, "ensureRemoteReleaseDirFromManifest");
async function runWithReleaseMaterializeLock(e, t) {
  let r = J(e),
    o = qe.get(r),
    n = (async () => {
      (o && (await o.catch(() => {})), await t());
    })();
  qe.set(r, n);
  try {
    await n;
  } finally {
    qe.get(r) === n && qe.delete(r);
  }
}
i(runWithReleaseMaterializeLock, "runWithReleaseMaterializeLock");
function normalizeRequestedComponentIds(e) {
  if (!e) return null;
  let t = e.map((r) => r.trim()).filter(Boolean);
  if (t.length === 0) return null;
  for (let r of t)
    if (!/^[a-z0-9][a-z0-9-]*$/u.test(r))
      throw new Error(`[remote-assets] component id is invalid: ${r}`);
  return new Set(t);
}
i(normalizeRequestedComponentIds, "normalizeRequestedComponentIds");
function normalizeRequiredReleasePaths(e) {
  return e ? Array.from(new Set(e.map((t) => normalizeRemoteAssetRelativePath(t, "requiredReleasePath")).filter(Boolean))) : [];
}
i(normalizeRequiredReleasePaths, "normalizeRequiredReleasePaths");
function selectRemoteAssetManifestComponents(e, t) {
  return selectManifestComponents(e, normalizeRequestedComponentIds(t));
}
i(selectRemoteAssetManifestComponents, "selectRemoteAssetManifestComponents");
function selectManifestComponents(e, t) {
  if (!t) return e.components;
  let r = e.components.filter((s) => t.has(s.id)),
    o = new Set(r.map((s) => s.id)),
    n = Array.from(t).filter((s) => !o.has(s));
  if (n.length > 0)
    throw new Error(`[remote-assets] manifest is missing requested components: ${n.join(", ")}`);
  return r;
}
i(selectManifestComponents, "selectManifestComponents");
async function materializeComponentIntoReleaseDir(e, t, r, o, n) {
  let s = v(o, "staging");
  await z(s, { recursive: !0 });
  let a = v(s, `remote-release-component-${e.id}-${n}-${process.pid}-${Ve()}`),
    c = v(a, "component");
  await z(c, { recursive: !0 });
  try {
    (await materializeDirectoryContents(t, c),
      await assertExtractedArchiveNotEmpty(c, `[remote-assets] release component is empty for ${e.id}@${e.version}`));
    let l = Pt(r, e.mount, `component ${e.id} mount`);
    await commitStagingDirectoryAtomically(c, l);
  } finally {
    await se(a, { recursive: !0, force: !0 });
  }
}
i(materializeComponentIntoReleaseDir, "materializeComponentIntoReleaseDir");
async function ensureRemoteComponentDirFromCdn(e, t, r, o, n = !1) {
  let s = resolveComponentCacheDir(e.remoteCacheDir, t, e.platformArch);
  if (!n && (await isReadyComponentDirForRequiredPaths(s, r))) return s;
  let a = J(s);
  for (;;) {
    let l = dt.get(a);
    if (!l) break;
    let m = await l,
      d = await findMissingReadyComponentPaths(m, r);
    if (d?.length === 0) return m;
    o.logWarn(
      `[remote-assets] locked component cache still incomplete: component=${t.id} missing=${(d ?? []).join(",")}; redownloading`,
    );
  }
  let c = ensureRemoteComponentDirFromCdnInternal(e, t, r, o, n).finally(() => {
    dt.delete(a);
  });
  return (dt.set(a, c), c);
}
i(ensureRemoteComponentDirFromCdn, "ensureRemoteComponentDirFromCdn");
async function ensureRemoteComponentDirFromCdnInternal(e, t, r, o, n = !1) {
  let s = resolveComponentCacheDir(e.remoteCacheDir, t, e.platformArch);
  n && o.logWarn(`[remote-assets] forced component refresh: component=${t.id} path=${s}`);
  let a = await findMissingReadyComponentPaths(s, r);
  if (!n && a?.length === 0) return s;
  if (
    (!n &&
      a &&
      (o.logWarn(
        `[remote-assets] local component cache incomplete: component=${t.id} missing=${a.join(",")}; redownloading`,
      ),
      await se(s, { recursive: !0, force: !0 })),
    !n && !usesRemoteAssetContentAddressedCacheIdentity(t.id) && (await tryMigrateComponentDirFromHashVersionComponentCache(e, t, s, o)))
  ) {
    let h = await findMissingReadyComponentPaths(s, r);
    if (h?.length === 0) return s;
    (o.logWarn(
      `[remote-assets] migrated local component cache incomplete: component=${t.id} missing=${(h ?? []).join(",")}; redownloading`,
    ),
      await se(s, { recursive: !0, force: !0 }));
  }
  if (!n && !usesRemoteAssetContentAddressedCacheIdentity(t.id) && (await tryMigrateComponentDirFromLegacyReleaseCache(e, t, s, o))) {
    let h = await findMissingReadyComponentPaths(s, r);
    if (h?.length === 0) return s;
    (o.logWarn(
      `[remote-assets] migrated local component cache incomplete: component=${t.id} missing=${(h ?? []).join(",")}; redownloading`,
    ),
      await se(s, { recursive: !0, force: !0 }));
  }
  let c = buildComponentArtifactUrlCandidates(e.releaseBaseCandidatesForComponents, t.artifactPath, e.version),
    l = v(e.remoteCacheDir, "staging");
  await z(l, { recursive: !0 });
  let m = v(l, `remote-component-${t.id}-${e.platformArch}-${t.version}-${process.pid}-${Ve()}`),
    d = v(m, "component.tar.gz"),
    f = v(m, "extract");
  await z(f, { recursive: !0 });
  try {
    let { response: h, url: g } = await fetchFirstAvailableUrl(c, `${t.id}@${t.version}`);
    (o.log(`[remote-assets] downloading ${g}`), await writeResponseBodyToFile(h, d, o));
    let p = await computeFileSha256(d);
    if (p !== t.sha256)
      throw new Error(
        `[remote-assets] sha256 mismatch for ${t.id}@${t.version}: expected=${t.sha256}, actual=${p}`,
      );
    return (
      await extractTarGzArchive(d, f),
      await assertExtractedArchiveNotEmpty(f, `[remote-assets] extracted component archive is empty for ${t.id}@${t.version}`),
      await writeReadyMarker(f, je),
      await commitStagingDirectoryAtomically(f, s),
      s
    );
  } finally {
    await se(m, { recursive: !0, force: !0 });
  }
}
i(ensureRemoteComponentDirFromCdnInternal, "ensureRemoteComponentDirFromCdnInternal");
async function tryMigrateComponentDirFromHashVersionComponentCache(e, t, r, o) {
  let n = resolveRemoteAssetComponentCacheVersion(t.version),
    s = resolveComponentCacheRootDir(e.remoteCacheDir, t, e.platformArch),
    a;
  try {
    a = await Me(s, { withFileTypes: !0 });
  } catch {
    return !1;
  }
  let c = `${n}+`,
    l = [];
  for (let d of a) {
    if (!d.isDirectory() || !d.name.startsWith(c)) continue;
    let f = v(s, d.name);
    if (J(f) === J(r) || !(await isReadyComponentDir(f))) continue;
    let h = await Y(f);
    l.push({ dir: f, version: d.name, mtimeMs: h.mtimeMs });
  }
  l.sort((d, f) => f.mtimeMs - d.mtimeMs);
  let m = l[0];
  return m
    ? (await migrateComponentSourceDir(
        m.dir,
        r,
        t,
        `legacy component cache ${m.version}`,
        e.platformArch,
        e.remoteCacheDir,
        o,
      ),
      !0)
    : !1;
}
i(tryMigrateComponentDirFromHashVersionComponentCache, "tryMigrateComponentDirFromHashVersionComponentCache");
async function tryMigrateComponentDirFromLegacyReleaseCache(e, t, r, o) {
  let n = extractContentHashPrefixFromComponentVersion(t.version);
  if (!n) return !1;
  let s = v(e.remoteCacheDir, "releases"),
    a;
  try {
    a = await Me(s, { withFileTypes: !0 });
  } catch {
    return !1;
  }
  let c = a
    .filter((l) => l.isDirectory() && l.name !== e.version)
    .map((l) => l.name)
    .sort((l, m) => m.localeCompare(l));
  for (let l of c) {
    let m = v(s, l, e.platformArch);
    if (!(await isReadyReleaseDir(m, e.platformArch))) continue;
    let d = Pt(m, t.mount, `legacy component ${t.id} mount`);
    if (!(await isDirectoryPath(d))) continue;
    let f;
    try {
      f = await computePathContentSha256(d);
    } catch (h) {
      o.logWarn(
        `[remote-assets] skip legacy component migration for ${t.id}@${t.version} from ${l}: ${String(h)}`,
      );
      continue;
    }
    if (f.startsWith(n))
      return (await migrateComponentSourceDir(d, r, t, `legacy release ${l}`, e.platformArch, e.remoteCacheDir, o), !0);
  }
  return !1;
}
i(tryMigrateComponentDirFromLegacyReleaseCache, "tryMigrateComponentDirFromLegacyReleaseCache");
async function migrateComponentSourceDir(e, t, r, o, n, s, a) {
  let c = v(s, "staging");
  await z(c, { recursive: !0 });
  let l = v(c, `remote-component-migrate-${r.id}-${n}-${r.version}-${process.pid}-${Ve()}`),
    m = v(l, "component");
  await z(m, { recursive: !0 });
  try {
    (await materializeDirectoryContents(e, m),
      await assertExtractedArchiveNotEmpty(m, `[remote-assets] migrated component source is empty for ${r.id}@${r.version}`),
      await writeReadyMarker(m, je),
      await commitStagingDirectoryAtomically(m, t),
      a.log(`[remote-assets] migrated ${r.id}@${r.version} from ${o}`));
  } finally {
    await se(l, { recursive: !0, force: !0 });
  }
}
i(migrateComponentSourceDir, "migrateComponentSourceDir");
function buildRemoteAssetManifestFileCandidates(e) {
  return buildRemoteManifestFileCandidates(e);
}
i(buildRemoteAssetManifestFileCandidates, "buildRemoteAssetManifestFileCandidates");
function buildRemoteManifestFileCandidates(e) {
  return [`${Se}${e}.json`];
}
i(buildRemoteManifestFileCandidates, "buildRemoteManifestFileCandidates");
function resolveReleaseBaseByAssetUrl(e, t) {
  return (
    t
      .map((o) => o.replace(/\/+$/, ""))
      .filter((o) => o.length > 0 && e.startsWith(`${o}/`))
      .sort((o, n) => n.length - o.length)[0] ?? null
  );
}
i(resolveReleaseBaseByAssetUrl, "resolveReleaseBaseByAssetUrl");
async function fetchFirstAvailableUrl(e, t) {
  let r = [];
  for (let o of e)
    try {
      let n = await fetch(o);
      if (n.ok) return { response: n, url: o };
      r.push(`${o} -> HTTP ${n.status}`);
    } catch (n) {
      r.push(`${o} -> ${String(n)}`);
    }
  throw new Error(`[remote-assets] failed to fetch ${t}: ${r.join("; ")}`);
}
i(fetchFirstAvailableUrl, "fetchFirstAvailableUrl");
async function fetchFirstAvailableManifestOrNullWhenNotFound(e) {
  let t = [];
  for (let r of e.candidates) {
    let o = createRemoteAssetManifestRequestSignal(e.manifestRequestTimeoutMs),
      n;
    try {
      n = await fetch(r, { signal: o });
    } catch (s) {
      t.push(`${r} -> ${String(s)}`);
      continue;
    }
    if (n.status !== 404) {
      if (!n.ok) {
        t.push(`${r} -> HTTP ${n.status}`);
        continue;
      }
      try {
        return { manifest: await parseRemoteAssetManifestFromResponse(n, r, e.version, e.platformArch), url: r };
      } catch (s) {
        if (!o.aborted) throw s;
        t.push(`${r} -> ${String(s)}`);
      }
    }
  }
  if (t.length > 0)
    throw new Error(`[remote-assets] failed to fetch ${e.fileLabel}: ${t.join("; ")}`);
  return null;
}
i(fetchFirstAvailableManifestOrNullWhenNotFound, "fetchFirstAvailableManifestOrNullWhenNotFound");
async function parseRemoteAssetManifestFromResponse(e, t, r, o) {
  let n = await e.text(),
    s;
  try {
    s = JSON.parse(n);
  } catch (h) {
    throw new Error(`[remote-assets] invalid manifest json from ${t}: ${String(h)}`);
  }
  if (!isObjectRecord(s)) throw new Error(`[remote-assets] invalid manifest payload from ${t}: expect object`);
  let a = readRequiredNumber(s, "schemaVersion", "manifest");
  if (!Number.isInteger(a) || a !== 1)
    throw new Error(`[remote-assets] unsupported manifest schemaVersion=${a} from ${t}`);
  let c = readRequiredString(s, "appVersion", "manifest");
  if (c !== r)
    throw new Error(
      `[remote-assets] manifest appVersion mismatch from ${t}: expected=${r}, actual=${c}`,
    );
  let l = readRequiredString(s, "platformArch", "manifest");
  if (l !== o)
    throw new Error(
      `[remote-assets] manifest platformArch mismatch from ${t}: expected=${o}, actual=${l}`,
    );
  let m = s.components;
  if (!Array.isArray(m))
    throw new Error(`[remote-assets] manifest.components must be array from ${t}`);
  if (m.length === 0) throw new Error(`[remote-assets] manifest.components is empty from ${t}`);
  let d = [],
    f = new Set();
  for (let [h, g] of m.entries()) {
    let p = `manifest.components[${h}]`;
    if (!isObjectRecord(g)) throw new Error(`[remote-assets] ${p} must be object`);
    let R = readRequiredString(g, "id", p);
    if (!/^[a-z0-9][a-z0-9-]*$/u.test(R))
      throw new Error(`[remote-assets] ${p}.id is invalid: ${R}`);
    if (f.has(R)) throw new Error(`[remote-assets] duplicate component id in manifest: ${R}`);
    f.add(R);
    let y = vr[R];
    if (!y) continue;
    let A = readRequiredString(g, "version", p);
    assertSafePathSegment(A, `${p}.version`);
    let b = readRequiredString(g, "sha256", p).toLowerCase();
    if (!/^[a-f0-9]{64}$/u.test(b)) throw new Error(`[remote-assets] ${p}.sha256 is invalid`);
    let C = normalizeRemoteAssetRelativePath(readRequiredString(g, "artifactPath", p), `${p}.artifactPath`),
      k = normalizeRemoteAssetRelativePath(readRequiredString(g, "mount", p), `${p}.mount`),
      _ = normalizeRemoteAssetRelativePath(y.resolveExpectedMount(o), `expected mount for ${R}`);
    if (k !== _)
      throw new Error(`[remote-assets] ${p}.mount mismatch for ${R}: expected=${_}, actual=${k}`);
    d.push({ id: R, version: A, sha256: b, artifactPath: C, mount: k });
  }
  return { schemaVersion: a, appVersion: c, platformArch: l, components: d };
}
i(parseRemoteAssetManifestFromResponse, "parseRemoteAssetManifestFromResponse");
function resolveComponentCacheDir(e, t, r) {
  return v(resolveComponentCacheRootDir(e, t, r), usesRemoteAssetContentAddressedCacheIdentity(t.id) ? t.sha256 : resolveRemoteAssetComponentCacheVersion(t.version));
}
i(resolveComponentCacheDir, "resolveComponentCacheDir");
function usesRemoteAssetContentAddressedCacheIdentity(e) {
  return e in pt;
}
i(usesRemoteAssetContentAddressedCacheIdentity, "usesRemoteAssetContentAddressedCacheIdentity");
function resolveContentAddressedReleaseSegments(e, t) {
  let r = [];
  for (let o of Object.keys(pt)) {
    if (t === null ? o !== "glm" : !t.has(o)) continue;
    let n = e.find((a) => a.id === o),
      s = pt[o];
    n && s && r.push(s, n.sha256);
  }
  return r;
}
i(resolveContentAddressedReleaseSegments, "resolveContentAddressedReleaseSegments");
function resolveRemoteAssetComponentCacheVersion(e) {
  let t = extractContentHashPrefixFromComponentVersion(e);
  return t ? e.slice(0, -t.length - 1) : e;
}
i(resolveRemoteAssetComponentCacheVersion, "resolveRemoteAssetComponentCacheVersion");
function resolveComponentCacheRootDir(e, t, r) {
  let o = vr[t.id];
  if (!o) throw new Error(`[remote-assets] component id is not in local whitelist: ${t.id}`);
  return o.platformScoped ? v(e, "components", t.id, r) : v(e, "components", t.id);
}
i(resolveComponentCacheRootDir, "resolveComponentCacheRootDir");
function resolveRequiredComponentPaths(e, t) {
  if (t.length === 0) return [];
  let r = e.mount.replace(/\/+$/u, ""),
    o = [];
  for (let n of t) n !== r && n.startsWith(`${r}/`) && o.push(n.slice(r.length + 1));
  return o;
}
i(resolveRequiredComponentPaths, "resolveRequiredComponentPaths");
async function materializeDirectoryContents(e, t) {
  let r = await Me(e, { withFileTypes: !0 });
  for (let o of r) {
    if (Pr.includes(o.name)) continue;
    let n = v(e, o.name),
      s = v(t, o.name);
    if (o.isSymbolicLink())
      throw new Error(`[remote-assets] symlink is not allowed in component cache: ${n}`);
    if (o.isDirectory()) {
      (await z(s, { recursive: !0 }), await materializeDirectoryContents(n, s));
      continue;
    }
    if (o.isFile()) {
      (await z(gt(s), { recursive: !0 }), await linkOrCopyFile(n, s));
      continue;
    }
    throw new Error(`[remote-assets] unsupported component entry type: ${n}`);
  }
}
i(materializeDirectoryContents, "materializeDirectoryContents");
async function linkOrCopyFile(e, t) {
  try {
    await Ln(e, t);
    return;
  } catch (r) {
    if (!shouldFallbackToCopy(r)) throw r;
  }
  await On(e, t, Bn.COPYFILE_EXCL);
}
i(linkOrCopyFile, "linkOrCopyFile");
function shouldFallbackToCopy(e) {
  let t = e?.code;
  return t === "EXDEV" || t === "EPERM" || t === "EACCES" || t === "EMLINK";
}
i(shouldFallbackToCopy, "shouldFallbackToCopy");
function Pt(e, t, r) {
  let o = normalizeRemoteAssetRelativePath(t, r),
    n = J(e, ...o.split("/")),
    s = J(e);
  if (n !== s && !n.startsWith(`${s}${Un}`))
    throw new Error(`[remote-assets] ${r} escapes base dir: ${t}`);
  return n;
}
i(Pt, "resolvePathWithinBase");
async function commitStagingDirectoryAtomically(e, t) {
  await z(gt(t), { recursive: !0 });
  let o = (await pathExists(t)) ? `${t}.backup-${process.pid}-${Ve()}` : null;
  o && (await renameRemoteAssetDirectoryWithRetry(t, o));
  try {
    await renameRemoteAssetDirectoryWithRetry(e, t);
  } catch (n) {
    if (o)
      try {
        await renameRemoteAssetDirectoryWithRetry(o, t);
      } catch (s) {
        throw new Error(
          `[remote-assets] failed to commit staged directory and failed to restore backup: commit=${String(n)}, restore=${String(s)}`,
        );
      }
    throw n;
  }
  o && (await removeRemoteAssetDirectoryBestEffort(o));
}
i(commitStagingDirectoryAtomically, "commitStagingDirectoryAtomically");
async function removeRemoteAssetDirectoryBestEffort(e) {
  for (let t = 0; ; t += 1)
    try {
      await se(e, { recursive: !0, force: !0 });
      return;
    } catch (r) {
      let o = Ar[t];
      if (o === void 0 || !isRetryableRemoteAssetDirectoryCommitError(r)) return;
      await Cr(o);
    }
}
i(removeRemoteAssetDirectoryBestEffort, "removeRemoteAssetDirectoryBestEffort");
async function renameRemoteAssetDirectoryWithRetry(e, t) {
  for (let r = 0; ; r += 1)
    try {
      await Nn(e, t);
      return;
    } catch (o) {
      let n = Ar[r];
      if (n === void 0 || !isRetryableRemoteAssetDirectoryCommitError(o)) throw o;
      await Cr(n);
    }
}
i(renameRemoteAssetDirectoryWithRetry, "renameRemoteAssetDirectoryWithRetry");
function isRetryableRemoteAssetDirectoryCommitError(e) {
  let t = e?.code;
  return t === "EPERM" || t === "EBUSY" || t === "EACCES" || t === "ENOTEMPTY";
}
i(isRetryableRemoteAssetDirectoryCommitError, "isRetryableRemoteAssetDirectoryCommitError");
async function pathExists(e) {
  try {
    return (await Y(e), !0);
  } catch {
    return !1;
  }
}
i(pathExists, "pathExists");
async function isReadyReleaseDirForRequestedPaths(e, t, r) {
  return (await isReadyReleaseDir(e, t)) ? (await findMissingLocalRelativePaths(e, r)).length === 0 : !1;
}
i(isReadyReleaseDirForRequestedPaths, "isReadyReleaseDirForRequestedPaths");
async function isReadyComponentDirForRequiredPaths(e, t) {
  return (await findMissingReadyComponentPaths(e, t))?.length === 0;
}
i(isReadyComponentDirForRequiredPaths, "isReadyComponentDirForRequiredPaths");
async function findMissingReadyComponentPaths(e, t) {
  return (await isReadyComponentDir(e)) ? findMissingLocalRelativePaths(e, t) : null;
}
i(findMissingReadyComponentPaths, "findMissingReadyComponentPaths");
async function findMissingLocalRelativePaths(e, t) {
  let r = [];
  for (let o of t) {
    let n = Pt(e, o, "required cache path");
    (await pathExists(n)) || r.push(n);
  }
  return r;
}
i(findMissingLocalRelativePaths, "findMissingLocalRelativePaths");
async function writeResponseBodyToFile(e, t, r) {
  if (!e.body) throw new Error("response body is empty");
  await z(gt(t), { recursive: !0 });
  let o = In(t, { flags: "w" }),
    n = createRemoteAssetProgressReporter(parseContentLength(e.headers.get("content-length")), r),
    s = 0,
    a = new zn({
      transform(c, l, m) {
        ((s += c.byteLength), n(s, !1), m(null, c));
      },
    });
  (await qn(Fn.fromWeb(e.body), a, o), n(s, !0));
}
i(writeResponseBodyToFile, "writeResponseBodyToFile");
function parseContentLength(e) {
  if (!e) return null;
  let t = Number.parseInt(e, 10);
  return !Number.isFinite(t) || t <= 0 ? null : t;
}
i(parseContentLength, "parseContentLength");
function createRemoteAssetProgressReporter(e, t) {
  let r = Date.now(),
    o = 0,
    n = 0,
    s = -1;
  return (a, c) => {
    if (!t) return;
    let l = Date.now(),
      m = Math.max((l - r) / 1e3, 0.001),
      d = bytesToMB(a) / m,
      f = bytesToMB(a),
      h = e ? bytesToMB(e) : null,
      g = e ? Math.min((a / e) * 100, 100) : null,
      p = l - o >= Wn,
      R = g != null && g - n >= Hn,
      y = g != null && g >= 100;
    (!c && !p && !R && !y) ||
      (c && a === s && (g == null || g <= n)) ||
      (h != null && g != null
        ? t.log(
            `[remote-assets] download progress: ${g.toFixed(1)}% (${f.toFixed(1)}/${h.toFixed(1)} MB, ${d.toFixed(2)} MB/s)`,
          )
        : t.log(
            `[remote-assets] download progress: ${f.toFixed(1)} MB (total unknown, ${d.toFixed(2)} MB/s)`,
          ),
      (o = l),
      (s = a),
      g != null && (n = g));
  };
}
i(createRemoteAssetProgressReporter, "createRemoteAssetProgressReporter");
function bytesToMB(e) {
  return e / (1024 * 1024);
}
i(bytesToMB, "bytesToMB");
function extractContentHashPrefixFromComponentVersion(e) {
  let t = e.lastIndexOf("+");
  if (t < 0 || t === e.length - 1) return null;
  let r = e.slice(t + 1).toLowerCase();
  return /^[a-f0-9]{12,64}$/u.test(r) ? r : null;
}
i(extractContentHashPrefixFromComponentVersion, "extractContentHashPrefixFromComponentVersion");
async function isDirectoryPath(e) {
  try {
    return (await Y(e)).isDirectory();
  } catch {
    return !1;
  }
}
i(isDirectoryPath, "isDirectoryPath");
async function computePathContentSha256(e) {
  let t = yr("sha256"),
    r = await Y(e);
  if (r.isDirectory())
    (t.update(`root:dir
`),
      await hashDirectoryContent(t, e));
  else if (r.isFile())
    (t.update(`root:file
`),
      await hashFileContent(t, e, "root-file"));
  else throw new Error(`unsupported path type: ${e}`);
  return t.digest("hex");
}
i(computePathContentSha256, "computePathContentSha256");
async function hashDirectoryContent(e, t, r = "") {
  let o = (await Me(t, { withFileTypes: !0 })).sort((n, s) => n.name.localeCompare(s.name));
  for (let n of o) {
    let s = v(t, n.name),
      a = r ? `${r}/${n.name}` : n.name;
    if (n.isDirectory()) {
      let c = await Y(s);
      (e.update(`dir:${a}:${c.mode & 511}
`),
        await hashDirectoryContent(e, s, a));
      continue;
    }
    if (n.isFile()) {
      await hashFileContent(e, s, a);
      continue;
    }
    throw new Error(`unsupported entry type: ${s}`);
  }
}
i(hashDirectoryContent, "hashDirectoryContent");
async function hashFileContent(e, t, r) {
  let o = await Y(t);
  e.update(`file:${r}:${o.mode & 511}:${o.size}
`);
  let n = wr(t);
  for await (let s of n) e.update(s);
}
i(hashFileContent, "hashFileContent");
async function computeFileSha256(e) {
  let t = yr("sha256"),
    r = wr(e);
  for await (let o of r) t.update(o);
  return t.digest("hex");
}
i(computeFileSha256, "computeFileSha256");
async function assertExtractedArchiveNotEmpty(e, t) {
  if ((await Me(e, { withFileTypes: !0 })).length === 0) throw new Error(t);
}
i(assertExtractedArchiveNotEmpty, "assertExtractedArchiveNotEmpty");
async function isReadyReleaseDir(e, t) {
  return (await isValidReleaseDir(e, t)) ? hasReadyMarker(e) : !1;
}
i(isReadyReleaseDir, "isReadyReleaseDir");
async function isValidReleaseDir(e, t) {
  try {
    if (!(await Y(e)).isDirectory()) return !1;
  } catch {
    return !1;
  }
  return !(!(await fileExists(e, "server", "zcode-server.cjs")) || !(await fileExists(e, "node", t, "node")));
}
i(isValidReleaseDir, "isValidReleaseDir");
async function isReadyComponentDir(e) {
  try {
    if (!(await Y(e)).isDirectory()) return !1;
  } catch {
    return !1;
  }
  return hasReadyMarker(e);
}
i(isReadyComponentDir, "isReadyComponentDir");
async function hasReadyMarker(e) {
  for (let t of Pr) if (await fileExists(e, t)) return !0;
  return !1;
}
i(hasReadyMarker, "hasReadyMarker");
async function writeReadyMarker(e, t) {
  await $r(
    v(e, t),
    `${Date.now()}
`,
    "utf8",
  );
}
i(writeReadyMarker, "writeReadyMarker");
function isObjectRecord(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
i(isObjectRecord, "isObjectRecord");
function readRequiredString(e, t, r) {
  let o = e[t];
  if (typeof o != "string") throw new Error(`[remote-assets] ${r}.${t} must be string`);
  let n = o.trim();
  if (!n) throw new Error(`[remote-assets] ${r}.${t} is empty`);
  return n;
}
i(readRequiredString, "readRequiredString");
function readRequiredNumber(e, t, r) {
  let o = e[t];
  if (typeof o != "number" || !Number.isFinite(o))
    throw new Error(`[remote-assets] ${r}.${t} must be finite number`);
  return o;
}
i(readRequiredNumber, "readRequiredNumber");
function assertSafePathSegment(e, t) {
  if (!e.trim()) throw new Error(`[remote-assets] ${t} is empty`);
  if (e.includes("/") || e.includes("\\"))
    throw new Error(`[remote-assets] ${t} must be a single path segment: ${e}`);
  if (e === "." || e === "..") throw new Error(`[remote-assets] ${t} is invalid: ${e}`);
}
i(assertSafePathSegment, "assertSafePathSegment");
var Fr = `${M}/.asset-components`;
function createFreshRemoteAssetManifestRefResolver(e, t, r) {
  let o = null;
  return () => ((o ??= resolveFreshComponentManifest(e, t, r)), o);
}
i(createFreshRemoteAssetManifestRefResolver, "createFreshRemoteAssetManifestRefResolver");
async function checkRemoteAssetComponentIdentity(e, t) {
  let r = await readRemoteAssetComponentMeta(e, t.componentId);
  return r
    ? r.id !== t.componentId
      ? {
          shouldDeploy: !0,
          reason: `remote component id mismatch remote=${r.id} expected=${t.componentId}`,
        }
      : r.platformArch !== t.platformArch
        ? {
            shouldDeploy: !0,
            reason: `remote platform mismatch remote=${r.platformArch} expected=${t.platformArch}`,
          }
        : r.sha256
          ? r.sha256.trim().toLowerCase() !== t.expectedIdentity.sha256.trim().toLowerCase()
            ? {
                shouldDeploy: !0,
                reason: `remote SHA mismatch remote=${r.sha256} expected=${t.expectedIdentity.sha256}`,
              }
            : { shouldDeploy: !1 }
          : {
              shouldDeploy: !0,
              reason: `remote component SHA missing expected=${t.expectedIdentity.sha256}`,
            }
    : {
        shouldDeploy: !0,
        reason: `remote component meta missing expected=${formatIdentity(t.expectedIdentity)}`,
      };
}
i(checkRemoteAssetComponentIdentity, "checkRemoteAssetComponentIdentity");
async function readRemoteAssetComponentMeta(e, t) {
  try {
    let r = await e.readFile(buildRemoteAssetComponentMetaPath(t)),
      o = JSON.parse(r);
    return typeof o.id != "string" ||
      typeof o.platformArch != "string" ||
      (o.version !== void 0 && typeof o.version != "string") ||
      (o.sha256 !== void 0 && typeof o.sha256 != "string") ||
      (o.pendingRefreshAppVersion !== void 0 && typeof o.pendingRefreshAppVersion != "string")
      ? null
      : {
          id: o.id,
          ...(o.version ? { version: o.version } : {}),
          ...(o.sha256 ? { sha256: o.sha256 } : {}),
          ...(o.pendingRefreshAppVersion
            ? { pendingRefreshAppVersion: o.pendingRefreshAppVersion }
            : {}),
          platformArch: o.platformArch,
        };
  } catch {
    return null;
  }
}
i(readRemoteAssetComponentMeta, "readRemoteAssetComponentMeta");
async function writeRemoteAssetComponentMeta(e, t) {
  if (t.version === "unknown" && !t.sha256) return;
  let r = await e.exec(
    [
      `mkdir -p ${u(Fr)}`,
      L(
        buildRemoteAssetComponentMetaPath(t.id),
        `${JSON.stringify(t)}
`,
      ),
    ].join(" && "),
  );
  await waitForClose(r);
}
i(writeRemoteAssetComponentMeta, "writeRemoteAssetComponentMeta");
async function markRemoteAssetComponentRefreshPending(e, t) {
  await writeRemoteAssetComponentMeta(e, {
    id: t.componentId,
    platformArch: t.platformArch,
    pendingRefreshAppVersion: t.appVersion,
  });
}
i(markRemoteAssetComponentRefreshPending, "markRemoteAssetComponentRefreshPending");
async function hasRemoteAssetComponentRefreshPending(e, t) {
  let r = await readRemoteAssetComponentMeta(e, t.componentId);
  return !!(
    r &&
    r.id === t.componentId &&
    r.platformArch === t.platformArch &&
    r.pendingRefreshAppVersion
  );
}
i(hasRemoteAssetComponentRefreshPending, "hasRemoteAssetComponentRefreshPending");
function buildRemoteAssetComponentMetaPath(e) {
  return `${Fr}/${e}.json`;
}
i(buildRemoteAssetComponentMetaPath, "buildRemoteAssetComponentMetaPath");
function formatIdentity(e) {
  return e.sha256;
}
i(formatIdentity, "formatIdentity");
async function resolveFreshComponentManifest(e, t, r) {
  let o = `${t.platform}-${t.arch}`;
  if (e.mockCdnDir)
    try {
      let n = await Rs(ys(e.mockCdnDir, "releases", x, `manifest-${o}.json`), "utf8");
      return { manifest: JSON.parse(n), releaseBaseCandidatesForComponents: buildReleaseBaseCandidates(resolveRemoteCdnBaseUrls(e), x) };
    } catch (n) {
      return (
        r.logWarn(
          `[remote-assets] mock component manifest unavailable, fallback to release checks: ${String(n)}`,
        ),
        null
      );
    }
  try {
    let n = await fetchRemoteAssetManifestRefFromCdn(
        {
          remoteCdnBaseUrl: e.remoteCdnBaseUrl,
          remoteCdnBaseUrls: e.remoteCdnBaseUrls,
          remoteCacheDir: e.remoteCacheDir,
          version: x,
          platformArch: o,
          manifestRequestTimeoutMs: e.manifestRequestTimeoutMs,
          refreshManifest: !0,
        },
        r,
      ),
      s =
        !!e.remoteCacheDir?.trim() &&
        (!!e.remoteCdnBaseUrl?.trim() || !!e.remoteCdnBaseUrls?.some((a) => a.trim().length > 0));
    if (!n && s) throw new Error(`[remote-assets] manifest not found for ${o}: manifest-${o}.json`);
    return n;
  } catch (n) {
    throw (r.logWarn(`[remote-assets] component manifest request failed: ${String(n)}`), n);
  }
}
i(resolveFreshComponentManifest, "resolveFreshComponentManifest");
var Cs = `${M}/agents`;
function isSelectedZCodeAgentComponent(e, t) {
  return !t || t.includes(e);
}
i(isSelectedZCodeAgentComponent, "isSelectedZCodeAgentComponent");
async function shouldSkipZCodeAgentDeploy(e) {
  if (e.force) return !1;
  if (!e.expectedArtifactSha256)
    return (
      e.loggers.logWarn(
        `[remote-assets] ${e.installer.mode === "remote-download" ? "download required" : "upload required"}: component=${e.componentId} reason=manifest SHA unavailable`,
      ),
      !1
    );
  let t = await checkRemoteAssetComponentIdentity(e.backend, {
    componentId: e.componentId,
    platformArch: e.platformArch,
    expectedIdentity: { sha256: e.expectedArtifactSha256 },
  });
  if (t.shouldDeploy)
    return (
      e.loggers.logWarn(
        `[remote-assets] ${e.installer.mode === "remote-download" ? "download required" : "upload required"}: component=${e.componentId} reason=${t.reason}`,
      ),
      !1
    );
  if (!(await e.backend.exists(e.remoteBinaryPath)))
    return (
      e.loggers.logWarn(
        `[remote-assets] ${e.installer.mode === "remote-download" ? "download required" : "upload required"}: component=${e.componentId} reason=remote wrapper missing path=${e.remoteBinaryPath}`,
      ),
      !1
    );
  if (isWslBackend(e.backend))
    try {
      let r = await e.backend.readFile(e.remoteBinaryPath);
      if (!isRemoteAgentBundleWrapperCurrent(r, e.runtimeResourceDir))
        return (
          e.loggers.logWarn(
            `[remote-assets] ${e.installer.mode === "remote-download" ? "download required" : "upload required"}: component=${e.componentId} reason=wsl wrapper stale path=${e.remoteBinaryPath}`,
          ),
          !1
        );
    } catch {
      return !1;
    }
  return (await e.backend.exists(e.remoteBundlePath))
    ? e.missingOfficialPluginAssetPaths.length > 0
      ? (e.loggers.logWarn(
          `[remote-assets] ${e.installer.mode === "remote-download" ? "download required" : "upload required"}: component=${e.componentId} reason=official plugin assets missing paths=${e.missingOfficialPluginAssetPaths.join(",")}`,
        ),
        !1)
      : (e.loggers.log(
          `[nofy-agent-deploy] ${"glm"}: \u5236\u54C1 SHA ${e.expectedArtifactSha256} \u5DF2\u90E8\u7F72\uFF0C\u8DF3\u8FC7`,
        ),
        !0)
    : (e.loggers.logWarn(
        `[remote-assets] ${e.installer.mode === "remote-download" ? "download required" : "upload required"}: component=${e.componentId} reason=remote bundle missing path=${e.remoteBundlePath}`,
      ),
      !1);
}
i(shouldSkipZCodeAgentDeploy, "shouldSkipZCodeAgentDeploy");
async function vs(e, t) {
  let r = [];
  for (let o of buildRemoteAgentOfficialPluginRequiredPaths(t)) (await e.exists(o)) || r.push(o);
  return r;
}
i(vs, "findMissingRemoteOfficialPluginAssetPaths");
async function deployZCodeAgentRuntime(e, t, r, o) {
  let n = "glm",
    s = jt,
    a = n;
  if (!isSelectedZCodeAgentComponent(a, r.selectedResourcePackageIds)) {
    o.log(
      `[nofy-agent-deploy] ${n}: \u672A\u9009\u62E9\u8D44\u6E90\u5305 ${a}\uFF0C\u8DF3\u8FC7\u68C0\u67E5\u548C\u90E8\u7F72`,
    );
    return;
  }
  let c = s.resolveEntrySegments(t.platform).at(-1);
  if (!c) {
    o.logWarn(
      `[nofy-agent-deploy] ${n}: \u65E0\u6CD5\u89E3\u6790 agent \u5165\u53E3\u540D\u79F0\uFF0C\u8DF3\u8FC7\u90E8\u7F72`,
    );
    return;
  }
  let l = `${Cs}/${s.bundledResourceDir}`,
    m = `${l}/.version`,
    d = `${l}/${c}`,
    f = `${l}/${ue}`,
    h = buildRemoteAgentOfficialPluginDir(l),
    g = await vs(e, l);
  if (
    await deployDevelopmentZCodeAgentRuntime(
      e,
      {
        runtimeVersion: s.version,
        runtimeResourceDir: s.bundledResourceDir,
        remoteProviderDir: l,
        remoteVersionFile: m,
        remoteBinaryPath: d,
        force: !!r.force,
      },
      o,
    )
  )
    return;
  let p = null;
  try {
    p = (await r.installer.resolveComponentSha256?.(a)) ?? null;
  } catch (k) {
    o.logWarn(
      `[nofy-agent-deploy] ${n}: \u8BFB\u53D6 manifest SHA \u5931\u8D25\uFF0C\u5C06\u91CD\u65B0\u90E8\u7F72: ${String(k)}`,
    );
  }
  if (
    await shouldSkipZCodeAgentDeploy({
      backend: e,
      remoteBinaryPath: d,
      remoteBundlePath: f,
      runtimeResourceDir: s.bundledResourceDir,
      expectedArtifactSha256: p,
      componentId: a,
      platformArch: r.platformArch,
      force: !!r.force,
      missingOfficialPluginAssetPaths: g,
      installer: r.installer,
      loggers: o,
    })
  )
    return;
  o.log(`[nofy-agent-deploy] ${n}: \u5F00\u59CB\u90E8\u7F72 v${s.version}...`);
  let R = !!r.force,
    y = await repairLegacyRemoteOfficialPluginDirectoryPermissions({ backend: e, loggers: o, remoteOfficialPluginDir: h }),
    A = i(
      () =>
        r.installer.installFile({
          componentId: a,
          sourceRelativePath: `${s.bundledResourceDir}/${r.platformArch}/${ue}`,
          remotePath: f,
          executable: !1,
          forceRefresh: R,
        }),
      "installBundle",
    ),
    b = i(
      () =>
        r.installer.installDirectory({
          componentId: a,
          sourceRelativePath: buildRemoteAgentOfficialPluginSourceRelativePath({
            runtimeResourceDir: s.bundledResourceDir,
            platformArch: r.platformArch,
          }),
          remoteDir: h,
          requiredRelativePaths: [...te],
          forceRefresh: R,
        }),
      "installOfficialPluginPackages",
    );
  (y ? (await A(), await b()) : (await b(), await A()),
    await deployRemoteAgentWrapper({ backend: e, content: buildRemoteAgentBundleWrapper(s.bundledResourceDir), remoteWrapperPath: d }));
  let C = await e.exec(L(m, s.version));
  (await waitForClose(C),
    p && (await writeRemoteAssetComponentMeta(e, { id: a, version: s.version, sha256: p, platformArch: r.platformArch })),
    o.log(`[nofy-agent-deploy] ${n}: \u90E8\u7F72\u5B8C\u6210 v${s.version}`));
}
i(deployZCodeAgentRuntime, "deployZCodeAgentRuntime");
import { createHash as Ds, randomUUID as le } from "crypto";
import { readFileSync as Es, unlinkSync as ks } from "fs";
import { tmpdir as Ss } from "os";
import { basename as jr, join as he, posix as ce } from "path";
function buildRemoteArtifactDownloadCommand(e) {
  let t =
      typeof e.expectedSha256 == "string" &&
      e.expectedSha256.length > 0 &&
      typeof e.sha256Tool == "string",
    r = e.urls.map((o) => {
      let n = u(e.outputPath);
      return e.tool === "curl"
        ? buildRemoteArtifactDownloadAttempt({
            downloadCommand: `curl -fL --retry 2 --connect-timeout 20 -o ${n} ${u(o)}`,
            outputPath: e.outputPath,
            progressLabel: e.progressLabel,
            expectedSha256: t ? e.expectedSha256 : void 0,
            sha256Tool: t ? e.sha256Tool : void 0,
          })
        : buildRemoteArtifactDownloadAttempt({
            downloadCommand: `wget --tries=3 --timeout=20 -O ${n} ${u(o)}`,
            outputPath: e.outputPath,
            progressLabel: e.progressLabel,
            expectedSha256: t ? e.expectedSha256 : void 0,
            sha256Tool: t ? e.sha256Tool : void 0,
          });
    });
  return buildRemoteDownloadWithProgressCommand({
    attemptCommand: r.map((o) => `(${o})`).join(" || "),
    outputPath: e.outputPath,
    progressLabel: e.progressLabel,
    totalBytes: e.totalBytes,
  });
}
i(buildRemoteArtifactDownloadCommand, "buildRemoteArtifactDownloadCommand");
function buildRemoteArtifactDownloadAttempt(e) {
  if (!e.expectedSha256 || !e.sha256Tool) return e.downloadCommand;
  let t = buildRemoteChecksumCommand({ tool: e.sha256Tool, filePath: e.outputPath }),
    r = u(e.outputPath),
    o = S(e.expectedSha256),
    n = S(
      `[remote-assets] sha256 mismatch for ${e.progressLabel}: expected=${e.expectedSha256}, actual=`,
    );
  return [
    `rm -f ${r}`,
    e.downloadCommand,
    `actual_sha=$(${t})`,
    `if [ "$actual_sha" = ${o} ]; then true; else echo ${n}"$actual_sha" >&2; false; fi`,
  ].join(" && ");
}
i(buildRemoteArtifactDownloadAttempt, "buildRemoteArtifactDownloadAttempt");
function buildRemoteDownloadWithProgressCommand(e) {
  let t = u(e.outputPath),
    r = S(e.progressLabel),
    o = normalizeTotalBytes(e.totalBytes),
    n =
      o != null
        ? `awk -v label=${r} -v bytes="$progress_size" -v total=${o} -v elapsed="$progress_elapsed" 'BEGIN { transferred = bytes / 1048576; total_mb = total / 1048576; speed = transferred / elapsed; percent = bytes / total * 100; if (percent > 100) percent = 100; printf "download progress: [%s] %.1f%% (%.1f/%.1f MB, %.2f MB/s)\\n", label, percent, transferred, total_mb, speed; fflush(); }'`
        : `awk -v label=${r} -v bytes="$progress_size" -v elapsed="$progress_elapsed" 'BEGIN { transferred = bytes / 1048576; speed = transferred / elapsed; printf "download progress: [%s] %.1f MB (total unknown, %.2f MB/s)\\n", label, transferred, speed; fflush(); }'`,
    s = `if [ -f ${t} ]; then progress_size=$(wc -c < ${t} 2>/dev/null || printf 0); else progress_size=0; fi; progress_now=$(date +%s); progress_elapsed=$((progress_now - progress_started_at)); if [ "$progress_elapsed" -le 0 ]; then progress_elapsed=1; fi`,
    a = `progress_started_at=$(date +%s); progress_pid=; (last_progress_size=-1; while :; do ${s}; if [ "$progress_size" != "$last_progress_size" ]; then ${n}; last_progress_size="$progress_size"; fi; sleep 1; done) & progress_pid=$!`,
    c = `if [ -n "$progress_pid" ]; then kill "$progress_pid" >/dev/null 2>&1 || true; wait "$progress_pid" 2>/dev/null || true; fi; if [ -f ${t} ]; then ${s}; ${n}; fi`;
  return `set +e; ${a}; ${e.attemptCommand}; download_status=$?; set -e; ${c}; test "$download_status" -eq 0`;
}
i(buildRemoteDownloadWithProgressCommand, "buildRemoteDownloadWithProgressCommand");
function normalizeTotalBytes(e) {
  if (typeof e != "number" || !Number.isFinite(e)) return null;
  let t = Math.floor(e);
  return t > 0 ? t : null;
}
i(normalizeTotalBytes, "normalizeTotalBytes");
function buildRemoteChecksumCommand(e) {
  let t = u(e.filePath);
  return e.tool === "sha256sum"
    ? `sha256sum ${t} | awk '{print $1}'`
    : e.tool === "shasum"
      ? `shasum -a 256 ${t} | awk '{print $1}'`
      : `openssl dgst -sha256 ${t} | awk '{print $NF}'`;
}
i(buildRemoteChecksumCommand, "buildRemoteChecksumCommand");
var me = class {
  constructor(t, r, o) {
    this.backend = t;
    this.options = r;
    this.loggers = o;
  }
  backend;
  options;
  loggers;
  static {
    i(this, "LocalUploadAssetInstaller");
  }
  mode = "local-download-upload";
  async resolveComponentVersion(t) {
    return (await this.resolveManifestComponent(t))?.version ?? null;
  }
  async resolveComponentSha256(t) {
    let r = await this.options.resolveComponentSha256?.(t);
    return r || ((await this.resolveManifestComponent(t))?.sha256 ?? null);
  }
  async resolveManifestComponent(t) {
    let r = this.options.platformArch?.trim(),
      o = this.options.releaseDir?.trim() ?? (await this.options.resolveReleaseDir?.([t]))?.trim();
    if (!r || !o) return null;
    try {
      let n = JSON.parse(Es(he(o, `manifest-${r}.json`), "utf8"));
      return selectRemoteAssetManifestComponents(n, [t])[0] ?? null;
    } catch {
      return null;
    }
  }
  async tryResolveLocalPath(t, r, o, n = !1) {
    let s =
      this.options.releaseDir ??
      (await this.options.resolveReleaseDir?.(t, { forceRefresh: n })) ??
      null;
    if (!s) return null;
    let a = he(s, r);
    if (await fileExists(a)) {
      let d = await findMissingLocalRequiredReleasePaths(s, o);
      if (d.length === 0) return a;
      this.loggers.logWarn(
        `[remote-assets] local release asset incomplete: source=${a} missing=${d.join(",")}; trying CDN cache fallback`,
      );
    }
    let c = await this.tryResolveCdnReleaseDir(t, o, n);
    if (!c) return null;
    let l = he(c, r);
    if (!(await fileExists(l))) return null;
    let m = await findMissingLocalRequiredReleasePaths(c, o);
    return m.length > 0
      ? (this.loggers.logWarn(
          `[remote-assets] CDN release asset incomplete: source=${l} missing=${m.join(",")}`,
        ),
        null)
      : l;
  }
  async resolveLocalPath(t, r, o, n = !1) {
    let s = await this.tryResolveLocalPath(t, r, o, n);
    if (s) return s;
    let a =
      this.options.releaseDir ??
      (await this.options.resolveReleaseDir?.(t, { forceRefresh: n })) ??
      null;
    throw a
      ? new Error(`[deploy] local remote asset not found: ${he(a, r)} (component=${t.join(",")})`)
      : createRemoteAssetPlaceholderError(this.options.platformArch ?? "<unknown>", this.options, t.join(","));
  }
  async installFile(t) {
    let r = await this.resolveLocalPath(
        [t.componentId],
        t.sourceRelativePath,
        void 0,
        !!t.forceRefresh,
      ),
      o = `${t.remotePath}.new-${Date.now()}-${le()}`;
    this.loggers.log(`[remote-assets] uploading ${t.sourceRelativePath} to ${t.remotePath}`);
    let n = await this.backend.exec(`mkdir -p ${u(ce.dirname(t.remotePath))}`);
    (await waitForClose(n), await this.backend.upload(r, o));
    let s = await this.backend.exec(t.executable ? buildRemoteExecutableReplaceCommand(o, t.remotePath) : buildRemoteMoveCommand(o, t.remotePath));
    await waitForClose(s);
  }
  async installDirectory(t) {
    let r = await this.resolveLocalPath(
        [t.componentId],
        t.sourceRelativePath,
        buildRequiredReleasePaths(t.sourceRelativePath, t.requiredRelativePaths),
        !!t.forceRefresh,
      ),
      o = he(Ss(), `zcode-remote-${t.componentId}-${Date.now()}-${le()}.tar.gz`);
    await createTarGzArchive(o, [{ sourcePath: r, archivePath: jr(r) }]);
    let n = `${Date.now()}-${le()}`,
      s = `${t.remoteDir}.tar.gz-${n}`,
      a = `${t.remoteDir}.extract-${n}`,
      c = `${a}/${jr(r)}`,
      l = i(async () => {
        try {
          let m = await this.backend.exec(`rm -f ${u(s)} && rm -rf ${u(a)}`);
          await waitForClose(m);
        } catch (m) {
          this.loggers.logWarn(
            `[remote-assets] failed to clean owned directory staging ${n}: ${String(m)}`,
          );
        }
      }, "cleanupRemoteStaging");
    try {
      this.loggers.log(`[remote-assets] uploading ${t.sourceRelativePath} to ${t.remoteDir}`);
      let m = await this.backend.exec(`mkdir -p ${u(ce.dirname(s))}`);
      (await waitForClose(m), await this.backend.upload(o, s));
      let d = await this.backend.exec(
        [
          "set -eu",
          `cleanup_staging() { rm -f ${u(s)}; rm -rf ${u(a)}; }`,
          "trap cleanup_staging EXIT HUP INT TERM",
          `rm -rf ${u(a)}`,
          `mkdir -p ${u(a)} ${u(ce.dirname(t.remoteDir))}`,
          `tar -xzf ${u(s)} -C ${u(a)}`,
          `test -d ${u(c)}`,
          `rm -rf ${u(t.remoteDir)}`,
          buildRemoteMoveCommand(c, t.remoteDir),
          "cleanup_staging",
          "trap - EXIT HUP INT TERM",
        ].join(`
`),
      );
      await waitForClose(d);
    } catch (m) {
      throw (await l(), m);
    } finally {
      try {
        ks(o);
      } catch {}
    }
  }
  async tryResolveCdnReleaseDir(t, r, o = !1) {
    let n = this.options.platformArch?.trim(),
      s = this.options.version?.trim();
    if (
      !n ||
      !s ||
      !this.options.remoteCacheDir ||
      !(
        !!this.options.remoteCdnBaseUrl?.trim() ||
        (this.options.remoteCdnBaseUrls?.some((c) => c.trim().length > 0) ?? !1)
      )
    )
      return null;
    try {
      return await ensureRemoteReleaseDirFromCdn(
        {
          remoteCdnBaseUrl: this.options.remoteCdnBaseUrl,
          remoteCdnBaseUrls: this.options.remoteCdnBaseUrls,
          remoteCacheDir: this.options.remoteCacheDir,
          version: s,
          platformArch: n,
          componentIds: t,
          requiredReleasePaths: r,
          manifestRequestTimeoutMs: this.options.manifestRequestTimeoutMs,
          forceRefresh: o,
        },
        this.loggers,
      );
    } catch (c) {
      if (
        (this.loggers.logWarn(
          `[remote-assets] local upload CDN fallback failed for ${t.join(",")}: ${String(c)}`,
        ),
        o)
      )
        throw c;
      return null;
    }
  }
};
function buildRequiredReleasePaths(e, t) {
  let r = e.replace(/^\/+|\/+$/gu, "");
  if (!r) return [];
  let o = [r];
  for (let n of t ?? []) {
    let s = n.replace(/^\/+|\/+$/gu, "");
    s && o.push(ce.join(r, s));
  }
  return o;
}
i(buildRequiredReleasePaths, "buildRequiredReleasePaths");
async function findMissingLocalRequiredReleasePaths(e, t) {
  let r = [];
  for (let o of t ?? []) {
    let n = he(e, o);
    (await fileExists(n)) || r.push(n);
  }
  return r;
}
i(findMissingLocalRequiredReleasePaths, "findMissingLocalRequiredReleasePaths");
var Ke = new Map(),
  Je = class {
    constructor(t, r, o, n, s) {
      this.backend = t;
      this.options = r;
      this.tools = o;
      this.loggers = n;
      this.manifestPromise = s ?? fetchRemoteDownloadManifest(r, n);
    }
    backend;
    options;
    tools;
    loggers;
    static {
      i(this, "RemoteDownloadAssetInstaller");
    }
    mode = "remote-download";
    manifestPromise;
    componentCache = new Map();
    forceRefreshComponentTasks = new Map();
    async installFile(t) {
      let r = await this.ensureComponent(t.componentId, [], !!t.forceRefresh),
        o = buildRemoteComponentSourcePath(r, t.sourceRelativePath),
        n = `${t.remotePath}.new-${Date.now()}-${le()}`,
        s = await this.backend.exec(
          [
            `mkdir -p ${u(ce.dirname(t.remotePath))}`,
            `cp -f ${u(o)} ${u(n)}`,
            t.executable ? buildRemoteExecutableReplaceCommand(n, t.remotePath) : buildRemoteMoveCommand(n, t.remotePath),
          ].join(" && "),
        );
      await waitForClose(s);
    }
    async installDirectory(t) {
      let r = await this.ensureComponent(t.componentId, t.requiredRelativePaths, !!t.forceRefresh),
        o = buildRemoteComponentSourcePath(r, t.sourceRelativePath),
        n = `${t.remoteDir}.new-${Date.now()}-${le()}`,
        s = (t.requiredRelativePaths ?? []).map(
          (c) => `test -e ${u(`${t.remoteDir}/${c.replace(/^\/+/u, "")}`)}`,
        ),
        a = await this.backend.exec(
          [
            "set -eu",
            `cleanup_staging() { rm -rf ${u(n)}; }`,
            "trap cleanup_staging EXIT HUP INT TERM",
            `rm -rf ${u(n)}`,
            `mkdir -p ${u(n)} ${u(ce.dirname(t.remoteDir))}`,
            `cp -R ${u(`${o}/.`)} ${u(n)}`,
            `rm -rf ${u(t.remoteDir)}`,
            buildRemoteMoveCommand(n, t.remoteDir),
            ...s,
            "cleanup_staging",
            "trap - EXIT HUP INT TERM",
          ].join(`
`),
        );
      await waitForClose(a);
    }
    async resolveComponentVersion(t) {
      let r = await this.manifestPromise;
      return selectRemoteAssetManifestComponents(r.manifest, [t])[0]?.version ?? null;
    }
    async resolveComponentSha256(t) {
      let r = await this.manifestPromise;
      return selectRemoteAssetManifestComponents(r.manifest, [t])[0]?.sha256 ?? null;
    }
    async ensureComponent(t, r = [], o = !1) {
      let n = o ? this.forceRefreshComponentTasks.get(t) : this.componentCache.get(t);
      if (n) {
        let a = await n;
        return this.ensureComponentHasRequiredPaths(a, r);
      }
      let s = this.ensureComponentInternal(t, o);
      (this.componentCache.set(t, s), o && this.forceRefreshComponentTasks.set(t, s));
      try {
        let a = await s;
        return this.ensureComponentHasRequiredPaths(a, r);
      } catch (a) {
        throw (
          this.componentCache.get(t) === s && this.componentCache.delete(t),
          this.forceRefreshComponentTasks.get(t) === s && this.forceRefreshComponentTasks.delete(t),
          a
        );
      }
    }
    async ensureComponentHasRequiredPaths(t, r) {
      if (r.length === 0) return t;
      let o = await this.findMissingComponentPaths(t.componentDir, r);
      if (o.length === 0 || !t.fromCache) return t;
      (this.loggers.logWarn(
        `[remote-assets] remote component cache incomplete: component=${t.component.id} missing=${o.join(",")}; redownloading`,
      ),
        await this.removeRemoteComponentCache(t.componentDir));
      let n = this.ensureComponentInternal(t.component.id);
      return (this.componentCache.set(t.component.id, n), await n);
    }
    async findMissingComponentPaths(t, r) {
      let o = [];
      for (let n of r) {
        let s = `${t}/${n.replace(/^\/+/u, "")}`;
        (await this.backend.exists(s)) || o.push(s);
      }
      return o;
    }
    async removeRemoteComponentCache(t) {
      let r = await this.backend.exec(`rm -rf ${u(t)}`);
      await waitForClose(r);
    }
    async ensureComponentInternal(t, r = !1) {
      let o = await this.manifestPromise,
        n = selectRemoteAssetManifestComponents(o.manifest, [t])[0];
      if (!n) throw new Error(`[remote-assets] manifest is missing requested component: ${t}`);
      let s = usesRemoteAssetContentAddressedCacheIdentity(n.id) ? n.sha256 : hashRemoteCacheSegment(resolveRemoteAssetComponentCacheVersion(n.version)),
        a = `${M}/asset-cache/components/${quoteSafeSegment(this.options.platformArch)}/${quoteSafeSegment(n.id)}/${s}`,
        c = `${a}/.ready`;
      if (await this.backend.exists(c))
        if (r)
          (this.loggers.logWarn(
            `[remote-assets] download required: component=${n.id} reason=force refresh path=${c}`,
          ),
            await this.removeRemoteComponentCache(a));
        else
          return (
            this.loggers.log(`[remote-assets] remote component cache hit: ${n.id}@${n.version}`),
            { component: n, componentDir: a, fromCache: !0 }
          );
      r ||
        this.loggers.logWarn(
          `[remote-assets] download required: component=${n.id} reason=remote component cache missing path=${c}`,
        );
      let l = buildComponentArtifactUrlCandidates(o.releaseBaseCandidatesForComponents, n.artifactPath, this.options.version),
        m = await resolveRemoteArtifactContentLength(l),
        d = `${M}/asset-cache/staging/${quoteSafeSegment(n.id)}-${Date.now()}-${le()}`,
        f = `${d}/component.tar.gz`,
        h = `${d}/extract`,
        g = `${a}.new-${Date.now()}-${le()}`,
        p = `${a}.lock`,
        R = u(p),
        y = `if [ -n "\${lock_heartbeat_pid:-}" ]; then kill "$lock_heartbeat_pid" >/dev/null 2>&1 || true; wait "$lock_heartbeat_pid" 2>/dev/null || true; fi; rm -rf ${R} ${u(d)} ${u(g)}`,
        A = buildRemoteArtifactDownloadCommand({
          tool: this.tools.download,
          urls: l,
          outputPath: f,
          progressLabel: `${n.id}@${n.version}`,
          totalBytes: m,
          expectedSha256: n.sha256,
          sha256Tool: this.tools.sha256,
        }),
        b = buildRemoteChecksumCommand({ tool: this.tools.sha256, filePath: f }),
        C = `[remote-assets] sha256 mismatch for ${n.id}@${n.version}`,
        k = [
          "set -eu",
          `rm -rf ${u(d)}`,
          `mkdir -p ${u(d)} ${u(ce.dirname(a))}`,
          `while ! mkdir ${R} 2>/dev/null; do if [ -e ${u(c)} ]; then rm -rf ${u(d)}; exit 0; fi; lock_mtime=$({ stat -c %Y ${R} || stat -f %m ${R}; } 2>/dev/null || printf 0); lock_now=$(date +%s); if [ "$lock_mtime" -gt 0 ] && [ $((lock_now - lock_mtime)) -ge 600 ]; then echo ${S(`[remote-assets] stale lock for ${n.id}@${n.version}, retrying`)} >&2; rm -rf ${R}; continue; fi; sleep 1; done`,
          `lock_heartbeat_pid=; (while :; do touch ${R} 2>/dev/null || exit 0; sleep 30; done) & lock_heartbeat_pid=$!`,
          `trap ${S(y)} EXIT`,
          `if [ -e ${u(c)} ]; then exit 0; fi`,
          A,
          `actual_sha=$(${b})`,
          `if [ "$actual_sha" != ${S(n.sha256)} ]; then echo ${S(C)} >&2; exit 1; fi`,
          `mkdir -p ${u(h)}`,
          `${this.tools.tar} -xzf ${u(f)} -C ${u(h)}`,
          `test "$(find ${u(h)} -mindepth 1 -maxdepth 1 | head -n 1)"`,
          `printf ready > ${u(`${h}/.ready`)}`,
          `rm -rf ${u(g)}`,
          buildRemoteMoveCommand(h, g),
          `rm -rf ${u(a)}`,
          buildRemoteMoveCommand(g, a),
          y,
          "trap - EXIT",
        ].join(" && ");
      this.loggers.log(`[remote-assets] remote downloading ${n.id}@${n.version}`);
      let _ = await this.backend.exec(k);
      return (forwardRemoteDownloadProgressLogs(_, this.loggers), await waitForClose(_), { component: n, componentDir: a, fromCache: !1 });
    }
  };
async function fetchRemoteDownloadManifest(e, t) {
  let r = resolveRemoteCdnBaseUrls({ remoteCdnBaseUrl: e.remoteCdnBaseUrl, remoteCdnBaseUrls: e.remoteCdnBaseUrls }),
    o = [e.version, e.platformArch, String(e.manifestRequestTimeoutMs ?? "default"), ...r].join(
      "::",
    ),
    n = Ke.get(o);
  if (n) return n;
  let s;
  return (
    (s = fetchRemoteDownloadManifestInternal(e, r, t).finally(() => {
      Ke.get(o) === s && Ke.delete(o);
    })),
    Ke.set(o, s),
    s
  );
}
i(fetchRemoteDownloadManifest, "fetchRemoteDownloadManifest");
async function fetchRemoteDownloadManifestInternal(e, t, r) {
  let o = buildReleaseBaseCandidates(t, e.version),
    n = buildReleaseAssetUrlCandidates(o, buildRemoteAssetManifestFileCandidates(e.platformArch)),
    s = [];
  for (let a of n) {
    r.log(`[remote-assets] downloading manifest ${a}`);
    let c = createRemoteAssetManifestRequestSignal(e.manifestRequestTimeoutMs),
      l;
    try {
      l = await fetch(a, { signal: c });
    } catch (f) {
      (s.push(`${a} -> ${String(f)}`),
        r.logWarn(`[remote-assets] manifest candidate failed ${a}: ${String(f)}`));
      continue;
    }
    if (!l.ok) {
      l.status !== 404 && s.push(`${a} -> HTTP ${l.status}`);
      continue;
    }
    let m;
    try {
      m = await parseRemoteAssetManifestFromResponse(l, a, e.version, e.platformArch);
    } catch (f) {
      if (!c.aborted) throw f;
      (r.logWarn(`[remote-assets] manifest candidate failed ${a}: ${String(f)}`),
        s.push(`${a} -> ${String(f)}`));
      continue;
    }
    let d = Bs(a, o);
    return {
      manifest: m,
      releaseBaseCandidatesForComponents: d ? [d, ...o.filter((f) => f !== d)] : o,
    };
  }
  throw s.length > 0
    ? new Error(`[remote-assets] failed to fetch manifest for ${e.platformArch}: ${s.join("; ")}`)
    : new Error(`[remote-assets] manifest not found for ${e.platformArch}`);
}
i(fetchRemoteDownloadManifestInternal, "fetchRemoteDownloadManifestInternal");
function buildRemoteComponentSourcePath(e, t) {
  let r = e.component.mount.replace(/\/+$/u, ""),
    o = t.replace(/^\/+|\/+$/gu, ""),
    n = o === r ? "." : o.startsWith(`${r}/`) ? o.slice(r.length + 1) : o;
  return n === "." ? `${e.componentDir}/.` : `${e.componentDir}/${n}`;
}
i(buildRemoteComponentSourcePath, "buildRemoteComponentSourcePath");
function Bs(e, t) {
  return (
    t
      .map((o) => o.replace(/\/+$/u, ""))
      .filter((o) => o.length > 0 && e.startsWith(`${o}/`))
      .sort((o, n) => n.length - o.length)[0] ?? null
  );
}
i(Bs, "resolveReleaseBaseByAssetUrl");
async function resolveRemoteArtifactContentLength(e) {
  for (let t of e)
    try {
      let r = await fetch(t, { method: "HEAD" });
      if (!r.ok) continue;
      let o = Os(r.headers.get("content-length"));
      if (o != null) return o;
    } catch {}
  return null;
}
i(resolveRemoteArtifactContentLength, "resolveRemoteArtifactContentLength");
function Os(e) {
  if (!e) return null;
  let t = Number.parseInt(e, 10);
  return Number.isFinite(t) && t > 0 ? t : null;
}
i(Os, "parseContentLength");
function quoteSafeSegment(e) {
  return e.replace(/[^A-Za-z0-9._+-]/gu, "_");
}
i(quoteSafeSegment, "quoteSafeSegment");
function hashRemoteCacheSegment(e) {
  return Ds("sha256").update(e).digest("hex").slice(0, 16);
}
i(hashRemoteCacheSegment, "hashRemoteCacheSegment");
function forwardRemoteDownloadProgressLogs(e, t) {
  let r = "";
  (e.stdout.on("data", (o) => {
    r += o.toString();
    let n = r.split(/\r?\n/u);
    r = n.pop() ?? "";
    for (let s of n) {
      let a = s.trim();
      /^download progress:/iu.test(a) && t.log(a);
    }
  }),
    e.onClose(() => {
      let o = r.trim();
      /^download progress:/iu.test(o) && t.log(o);
    }));
}
i(forwardRemoteDownloadProgressLogs, "forwardRemoteDownloadProgressLogs");
var Kr = `${M}/build/Release/pty.node`,
  Tt = `${M}/build/Release/spawn-helper`;
function createRemoteComponentVersionResolver(e, t, r) {
  let o = null,
    n = i(() => ((o ??= resolveComponentManifest(e, t, r)), o), "getComponentManifest");
  return async (s) => {
    let a = await n();
    if (!a) return null;
    let c = selectRemoteAssetManifestComponents(a, [s])[0]?.version;
    return c ? resolveRemoteAssetComponentCacheVersion(c) : null;
  };
}
i(createRemoteComponentVersionResolver, "createRemoteComponentVersionResolver");
async function deployNodeRuntime(e, t, r) {
  let { platformArch: o, installer: n } = t,
    s = `${M}/node`,
    a = normalizeDeployExpectedVersion(t.expectedVersion),
    c = await shouldDeployVersionedComponent(e, {
      componentId: "node-runtime",
      platformArch: o,
      remotePath: s,
      expectedVersion: a,
      force: t.force,
      fallbackDeployWhenVersionUnknown: !0,
    });
  if (!c.shouldDeploy) {
    r.log("node runtime already matches, skip");
    return;
  }
  (logDeployRequired({ loggers: r, installer: n, componentId: "node-runtime", reason: c.reason }),
    await n.installFile({
      componentId: "node-runtime",
      sourceRelativePath: `node/${o}/node`,
      remotePath: s,
      executable: !0,
    }),
    await writeRemoteAssetComponentMeta(e, { id: "node-runtime", version: a ?? "unknown", platformArch: o }),
    r.log("node install done"));
}
i(deployNodeRuntime, "deployNodeRuntime");
function normalizeDeployExpectedVersion(e) {
  return e ? resolveRemoteAssetComponentCacheVersion(e) : null;
}
i(normalizeDeployExpectedVersion, "normalizeDeployExpectedVersion");
async function deployNodePtyPrebuilds(e, t, r, o) {
  let { platformArch: n, onlyIfMissing: s, installer: a } = r,
    c = normalizeDeployExpectedVersion(r.expectedVersion),
    l = await shouldDeployVersionedComponent(e, {
      componentId: "node-pty",
      platformArch: n,
      remotePath: Kr,
      expectedVersion: c,
      force: r.force,
      fallbackDeployWhenVersionUnknown: !s,
    });
  if (l.shouldDeploy) {
    let d = `node-pty/${n}/pty.node`;
    a instanceof me && !(await a.tryResolveLocalPath(["node-pty"], d))
      ? (o.logWarn(`WARNING: no node-pty prebuild for ${n}. Terminal will not work.`),
        o.logWarn("Run: node scripts/prepare-prebuilds.mjs to prepare mock-cdn release assets."))
      : (logDeployRequired({ loggers: o, installer: a, componentId: "node-pty", reason: l.reason }),
        o.log("installing node-pty prebuild..."),
        await a.installFile({ componentId: "node-pty", sourceRelativePath: d, remotePath: Kr }),
        await writeRemoteAssetComponentMeta(e, { id: "node-pty", version: c ?? "unknown", platformArch: n }),
        o.log("node-pty install done"));
  } else o.log("node-pty prebuild already exists, skip");
  if (t.platform !== "darwin") return;
  if (l.shouldDeploy || !(await e.exists(Tt))) {
    let d = `node-pty/${n}/spawn-helper`;
    if (a instanceof me && !(await a.tryResolveLocalPath(["node-pty"], d))) {
      (o.logWarn(`WARNING: no node-pty spawn-helper for ${n}. Terminal may fail to start.`),
        o.logWarn("Run: node scripts/prepare-prebuilds.mjs to prepare mock-cdn release assets."));
      return;
    }
    (o.log("installing node-pty spawn-helper..."),
      l.shouldDeploy ||
        logDeployRequired({
          loggers: o,
          installer: a,
          componentId: "node-pty",
          reason: `remote file missing path=${Tt}`,
        }),
      await a.installFile({
        componentId: "node-pty",
        sourceRelativePath: d,
        remotePath: Tt,
        executable: !0,
      }),
      o.log("node-pty spawn-helper install done"));
  } else o.log("node-pty spawn-helper already exists, skip");
}
i(deployNodePtyPrebuilds, "deployNodePtyPrebuilds");
async function shouldDeployVersionedComponent(e, t) {
  if (t.force) return { shouldDeploy: !0, reason: "force deploy requested" };
  if (!(await e.exists(t.remotePath)))
    return { shouldDeploy: !0, reason: `remote file missing path=${t.remotePath}` };
  if (!t.expectedVersion)
    return t.fallbackDeployWhenVersionUnknown
      ? { shouldDeploy: !0, reason: "component version unavailable, using legacy full deploy" }
      : { shouldDeploy: !1 };
  let r = await readRemoteAssetComponentMeta(e, t.componentId);
  return r
    ? r.id !== t.componentId
      ? {
          shouldDeploy: !0,
          reason: `remote component id mismatch remote=${r.id} expected=${t.componentId}`,
        }
      : r.platformArch !== t.platformArch
        ? {
            shouldDeploy: !0,
            reason: `remote platform mismatch remote=${r.platformArch} expected=${t.platformArch}`,
          }
        : normalizeDeployExpectedVersion(r.version) !== normalizeDeployExpectedVersion(t.expectedVersion)
          ? {
              shouldDeploy: !0,
              reason: `remote version mismatch remote=${r.version} expected=${t.expectedVersion}`,
            }
          : { shouldDeploy: !1 }
    : { shouldDeploy: !0, reason: `remote component meta missing expected=${t.expectedVersion}` };
}
i(shouldDeployVersionedComponent, "shouldDeployVersionedComponent");
function logDeployRequired(e) {
  let t = e.installer.mode === "remote-download" ? "download required" : "upload required";
  e.loggers.logWarn(`[remote-assets] ${t}: component=${e.componentId} reason=${e.reason}`);
}
i(logDeployRequired, "logDeployRequired");
async function resolveComponentManifest(e, t, r) {
  if (e.mockCdnDir) return null;
  try {
    return await fetchRemoteAssetManifestFromCdn(
      {
        remoteCdnBaseUrl: e.remoteCdnBaseUrl,
        remoteCdnBaseUrls: e.remoteCdnBaseUrls,
        remoteCacheDir: e.remoteCacheDir,
        version: x,
        platformArch: `${t.platform}-${t.arch}`,
        manifestRequestTimeoutMs: e.manifestRequestTimeoutMs,
      },
      r,
    );
  } catch (o) {
    throw (r.logWarn(`[remote-assets] component manifest request failed: ${String(o)}`), o);
  }
}
i(resolveComponentManifest, "resolveComponentManifest");
var Fs = [
  "skill-sync",
  "mcp-sync",
  "plugin-sync",
  "__zcode_rpc_nested_uint8array_v1",
  "exportMarketplaceSourceArchive",
  "importMarketplaceSourceArchive",
];
async function checkServerBundleRequiredMarkers(e, t, r) {
  let o = `
const fs = require("fs");
const content = fs.readFileSync(process.argv[1], "utf8");
const missing = ${JSON.stringify(Fs)}.filter((marker) => !content.includes(marker));
if (missing.length > 0) {
  console.error("missing required server bundle markers: " + missing.join(","));
  process.exit(2);
}
`,
    n = await e.exec(`${u(t)} -e ${S(o)} ${u(r)}`);
  try {
    return (await waitForDeployCheckClose(n), { shouldDeploy: !1 });
  } catch (s) {
    return {
      shouldDeploy: !0,
      reason: `remote server bundle missing required markers: ${String(s)}`,
    };
  }
}
i(checkServerBundleRequiredMarkers, "checkServerBundleRequiredMarkers");
function waitForDeployCheckClose(e) {
  return new Promise((t, r) => {
    let o = "";
    (e.stderr.on("data", (n) => {
      o.length >= 2048 || (o += n.toString());
    }),
      e.onClose((n) => {
        if (n === 0) {
          t();
          return;
        }
        r(new Error(o.trim() || `remote deploy check exited with code ${n}`));
      }));
  });
}
i(waitForDeployCheckClose, "waitForDeployCheckClose");
var qs = `${M}/tools`;
async function deployRuntimeTools(e, t, r, o) {
  let n = r.platformArch;
  for (let { toolId: s, runtime: a, version: c } of Gt(t.platform)) {
    let l = a.bundledResourceDir;
    if (r.selectedResourcePackageIds && !r.selectedResourcePackageIds.includes(l)) {
      o.log(
        `[tool-deploy] ${s}: \u672A\u9009\u62E9\u8D44\u6E90\u5305 ${l}\uFF0C\u8DF3\u8FC7\u68C0\u67E5\u548C\u90E8\u7F72`,
      );
      continue;
    }
    let m = a.resolveEntrySegments(t.platform),
      d = m[m.length - 1];
    if (!d) {
      o.logWarn(
        `[tool-deploy] ${s}: \u65E0\u6CD5\u89E3\u6790 binary \u540D\u79F0\uFF0C\u8DF3\u8FC7\u90E8\u7F72`,
      );
      continue;
    }
    let f = `${qs}/${a.bundledResourceDir}`,
      h = `${f}/.version`,
      g = `${f}/${d}`,
      p = "";
    try {
      p = (await e.readFile(h)).trim();
    } catch {
      p = "";
    }
    if (p === c) {
      if (await e.exists(g)) {
        o.log(
          `[tool-deploy] ${s}: \u8FDC\u7A0B\u7248\u672C ${c} \u5DF2\u662F\u6700\u65B0\uFF0C\u8DF3\u8FC7`,
        );
        continue;
      }
      o.logWarn(
        `[remote-assets] ${r.installer.mode === "remote-download" ? "download required" : "upload required"}: component=${a.bundledResourceDir} reason=remote binary missing path=${g}`,
      );
    }
    (o.log(`[tool-deploy] ${s}: \u5F00\u59CB\u90E8\u7F72 ${c}`),
      await r.installer.installFile({
        componentId: l,
        sourceRelativePath: `tools/${n}/${a.bundledResourceDir}/${d}`,
        remotePath: g,
        executable: !0,
      }));
    let R = await e.exec(L(h, c));
    (await waitForClose(R), o.log(`[tool-deploy] ${s}: \u90E8\u7F72\u5B8C\u6210 ${c}`));
  }
}
i(deployRuntimeTools, "deployRuntimeTools");
async function detectRemoteAssetTools(e, t) {
  t.log("[remote-assets] preflight: checking remote download tools");
  let r = await e.exec(buildPreflightCommand()),
    o = collectStdout(r);
  await waitForClose(r);
  let n = await o,
    s = parseToolLines(n),
    a = parseDownloadTool(s.download),
    c = s.tar === "tar" ? "tar" : null,
    l = parseSha256Tool(s.sha256);
  if (!a)
    throw new Error(
      "\u8FDC\u7AEF\u670D\u52A1\u5668\u7F3A\u5C11 curl \u6216 wget\uFF0C\u65E0\u6CD5\u76F4\u63A5\u4E0B\u8F7D ZCode \u8FDC\u7A0B\u8D44\u6E90\u3002\u8BF7\u5B89\u88C5 curl/wget\uFF0C\u6216\u5207\u56DE\u201C\u672C\u5730\u4E0B\u8F7D\u540E\u4E0A\u4F20\u201D\u3002",
    );
  if (!c)
    throw new Error(
      "\u8FDC\u7AEF\u670D\u52A1\u5668\u7F3A\u5C11 tar\uFF0C\u65E0\u6CD5\u89E3\u538B ZCode \u8FDC\u7A0B\u8D44\u6E90\u3002\u8BF7\u5B89\u88C5 tar\uFF0C\u6216\u5207\u56DE\u201C\u672C\u5730\u4E0B\u8F7D\u540E\u4E0A\u4F20\u201D\u3002",
    );
  if (!l)
    throw new Error(
      "\u8FDC\u7AEF\u670D\u52A1\u5668\u7F3A\u5C11 sha256sum\u3001shasum \u6216 openssl\uFF0C\u65E0\u6CD5\u6821\u9A8C ZCode \u8FDC\u7A0B\u8D44\u6E90\u3002\u8BF7\u5B89\u88C5\u5176\u4E2D\u4E00\u4E2A\u6821\u9A8C\u5DE5\u5177\uFF0C\u6216\u5207\u56DE\u201C\u672C\u5730\u4E0B\u8F7D\u540E\u4E0A\u4F20\u201D\u3002",
    );
  return (
    t.log(`[remote-assets] preflight: selected tools download=${a} tar=${c} sha256=${l}`),
    { download: a, tar: c, sha256: l }
  );
}
i(detectRemoteAssetTools, "detectRemoteAssetTools");
function buildPreflightCommand() {
  return [
    "download=",
    "if command -v curl >/dev/null 2>&1; then download=curl; elif command -v wget >/dev/null 2>&1; then download=wget; fi",
    "tar_tool=",
    "if command -v tar >/dev/null 2>&1; then tar_tool=tar; fi",
    "sha_tool=",
    "if command -v sha256sum >/dev/null 2>&1; then sha_tool=sha256sum; elif command -v shasum >/dev/null 2>&1; then sha_tool=shasum; elif command -v openssl >/dev/null 2>&1; then sha_tool=openssl; fi",
    `printf 'download=%s
tar=%s
sha256=%s
' "$download" "$tar_tool" "$sha_tool"`,
  ].join("; ");
}
i(buildPreflightCommand, "buildPreflightCommand");
function parseToolLines(e) {
  let t = {};
  for (let r of e.split(`
`)) {
    let o = r.indexOf("=");
    o <= 0 || (t[r.slice(0, o)] = r.slice(o + 1).trim());
  }
  return t;
}
i(parseToolLines, "parseToolLines");
function parseDownloadTool(e) {
  return e === "curl" || e === "wget" ? e : null;
}
i(parseDownloadTool, "parseDownloadTool");
function parseSha256Tool(e) {
  return e === "sha256sum" || e === "shasum" || e === "openssl" ? e : null;
}
i(parseSha256Tool, "parseSha256Tool");
async function collectStdout(e) {
  return new Promise((t) => {
    let r = "",
      o = !1,
      n = null,
      s = i(() => {
        n && (clearTimeout(n), (n = null));
      }, "clearCloseFallback"),
      a = i(() => {
        o || ((o = !0), s(), t(r));
      }, "settle"),
      c = i(() => {
        o || (s(), (n = setTimeout(a, 50)));
      }, "scheduleCloseFallback");
    (e.stdout.on("data", (l) => {
      ((r += l.toString()), n && c());
    }),
      e.stdout.on("end", a),
      e.stdout.on("close", a),
      e.stdout.on("error", a),
      e.onClose(c));
  });
}
i(collectStdout, "collectStdout");
function assertSupportedRemoteEnvironment(e) {
  if (e.platform === "win32")
    throw new Error(
      "\u5F53\u524D remote \u6A21\u5F0F\u4EC5\u652F\u6301 POSIX shell \u73AF\u5883\uFF0C\u6682\u4E0D\u652F\u6301 Windows \u539F\u751F\u8FDC\u7A0B\u4E3B\u673A",
    );
}
i(assertSupportedRemoteEnvironment, "assertSupportedRemoteEnvironment");
import { randomUUID as Zs } from "crypto";
import { posix as oo } from "path";
var Ks = 30,
  Js = 600,
  Ys = 12e4,
  Xs = 5e3,
  to = 4096;
function destroyStreamBestEffort(e) {
  try {
    e.destroy?.();
  } catch {}
}
i(destroyStreamBestEffort, "destroyStreamBestEffort");
function destroyLockStreamBestEffort(e) {
  (destroyStreamBestEffort(e.stdin), destroyStreamBestEffort(e.stdout), destroyStreamBestEffort(e.stderr));
}
i(destroyLockStreamBestEffort, "destroyLockStreamBestEffort");
function buildRemoteDeployLockScript(e, t) {
  let r = `zcode-deploy-lock-acquired:${t}`,
    o = `zcode-deploy-lock-release:${t}`;
  return [
    "set -eu",
    `lock_dir=${u(e)}`,
    `owner_token=${S(t)}`,
    'owner_file="$lock_dir/owner"',
    'stale_dir="$lock_dir.stale-$owner_token"',
    `mkdir -p ${u(oo.dirname(e))}`,
    'while ! mkdir "$lock_dir" 2>/dev/null; do',
    '  lock_mtime=$({ stat -c %Y "$owner_file" || stat -f %m "$owner_file" || stat -c %Y "$lock_dir" || stat -f %m "$lock_dir"; } 2>/dev/null || printf 0)',
    "  lock_now=$(date +%s)",
    `  if [ "$lock_mtime" -gt 0 ] && [ $((lock_now - lock_mtime)) -ge ${Js} ]; then`,
    '    if command mv "$lock_dir" "$stale_dir" 2>/dev/null; then rm -rf "$stale_dir"; fi',
    "    continue",
    "  fi",
    "  sleep 1",
    "done",
    'printf %s "$owner_token" > "$owner_file"',
    "lock_heartbeat_pid=",
    "cleanup_deploy_lock() {",
    '  if [ -n "${lock_heartbeat_pid:-}" ]; then kill "$lock_heartbeat_pid" >/dev/null 2>&1 || true; wait "$lock_heartbeat_pid" 2>/dev/null || true; fi',
    '  current_owner=$(cat "$owner_file" 2>/dev/null || true)',
    '  if [ "$current_owner" = "$owner_token" ]; then rm -rf "$lock_dir"; fi',
    "}",
    "trap cleanup_deploy_lock EXIT HUP INT TERM",
    `(while [ "$(cat "$owner_file" 2>/dev/null || true)" = "$owner_token" ]; do touch "$owner_file" 2>/dev/null || exit 0; sleep ${Ks}; done) &`,
    "lock_heartbeat_pid=$!",
    `printf '%s
' ${S(r)}`,
    "release_marker=",
    "IFS= read -r release_marker || true",
    `if [ "$release_marker" != ${S(o)} ]; then echo ${S("[deploy-lock] invalid release marker")} >&2; exit 1; fi`,
  ].join(`
`);
}
i(buildRemoteDeployLockScript, "buildRemoteDeployLockScript");
function encodePosixOctal(e) {
  return Array.from(Buffer.from(e, "utf8"), (t) => `\\${t.toString(8).padStart(3, "0")}`).join("");
}
i(encodePosixOctal, "encodePosixOctal");
function buildRemoteDeployLockCommand(e, t) {
  let r = `${e}.holder-${t}.sh`,
    o = buildRemoteDeployLockScript(e, t);
  return [
    "set -eu",
    `mkdir -p ${u(oo.dirname(r))}`,
    `printf '%b' ${S(encodePosixOctal(o))} > ${u(r)}`,
    `trap ${S(`rm -f ${u(r)}`)} EXIT HUP INT TERM`,
    `bash ${u(r)}`,
  ].join(`
`);
}
i(buildRemoteDeployLockCommand, "buildRemoteDeployLockCommand");
function createStreamClosePromise(e) {
  let t;
  return {
    promise: new Promise((o) => {
      t = e.onClose((n) => o(n));
    }),
    dispose() {
      t?.dispose();
    },
  };
}
i(createStreamClosePromise, "createStreamClosePromise");
async function acquireRemoteDeployLock(e, t = {}) {
  let r = t.ownerToken?.trim() || Zs(),
    o = t.lockDir?.trim() || `${M}/.deploy.lock`,
    n = Math.max(1, Math.floor(t.acquireTimeoutMs ?? Ys)),
    s = Math.max(1, Math.floor(t.releaseTimeoutMs ?? Xs)),
    a = `zcode-deploy-lock-acquired:${r}`,
    c = `zcode-deploy-lock-release:${r}`,
    l = await e.exec(buildRemoteDeployLockCommand(o, r)),
    m = createStreamClosePromise(l),
    d = "",
    f = i((g) => {
      d = `${d}${g.toString()}`.slice(-to);
    }, "onStderr");
  l.stderr.on("data", f);
  try {
    await new Promise((g, p) => {
      let R = "",
        y = !1,
        A,
        b = i(() => {
          (l.stdout.off("data", C), A && clearTimeout(A));
        }, "cleanup"),
        C = i((_) => {
          ((R = `${R}${_.toString()}`.slice(-to)), !(!R.includes(a) || y) && ((y = !0), b(), g()));
        }, "onStdout");
      ((A = setTimeout(
        i(() => {
          y ||
            ((y = !0),
            b(),
            destroyLockStreamBestEffort(l),
            p(
              new Error(
                `[deploy-lock] lock acquisition timed out after ${n}ms (owner=${r})${d.trim() ? `: ${d.trim()}` : ""}`,
              ),
            ));
        }, "onTimeout"),
        n,
      )),
        l.stdout.on("data", C),
        m.promise.then((_) => {
          y ||
            ((y = !0),
            b(),
            p(
              new Error(
                `[deploy-lock] lock-holder exited before acquisition (code=${_})${d.trim() ? `: ${d.trim()}` : ""}`,
              ),
            ));
        }));
    });
  } catch (g) {
    throw (l.stderr.off("data", f), m.dispose(), g);
  }
  let h = null;
  return {
    ownerToken: r,
    release() {
      return (
        h ||
        ((h = (async () => {
          try {
            (l.stdin.write(`${c}
`),
              l.stdin.end());
            let g,
              p = new Error(
                `[deploy-lock] lock-holder release timed out after ${s}ms (owner=${r})${d.trim() ? `: ${d.trim()}` : ""}`,
              ),
              R;
            try {
              R = await Promise.race([
                m.promise,
                new Promise((y, A) => {
                  g = setTimeout(() => A(p), s);
                }),
              ]);
            } catch (y) {
              throw (y === p && destroyLockStreamBestEffort(l), y);
            } finally {
              g && clearTimeout(g);
            }
            if (R !== 0)
              throw new Error(
                `[deploy-lock] lock-holder release failed (code=${R})${d.trim() ? `: ${d.trim()}` : ""}`,
              );
          } finally {
            (l.stderr.off("data", f), m.dispose());
          }
        })()),
        h)
      );
    },
  };
}
i(acquireRemoteDeployLock, "acquireRemoteDeployLock");
var $ = i((...e) => console.log(we("deploy", process.pid), ...e), "log"),
  I = i((...e) => console.warn(we("deploy", process.pid), ...e), "logWarn"),
  de = "server-bundle";
async function deployServer(e, t, r) {
  let o = `${t.platform}-${t.arch}`;
  assertSupportedRemoteEnvironment(t);
  let n = zt(),
    s = i((w) => n.includes(w), "shouldDeployResourcePackage"),
    a = {
      mockCdnDir: r?.mockCdnDir,
      remoteCdnBaseUrl: r?.remoteCdnBaseUrl,
      remoteCdnBaseUrls: r?.remoteCdnBaseUrls,
      remoteCacheDir: r?.remoteCacheDir,
      manifestRequestTimeoutMs: r?.manifestRequestTimeoutMs,
    },
    c = createFreshRemoteAssetManifestRefResolver(a, t, { log: $, logWarn: I }),
    l = createFreshRemoteAssetManifestRefResolver({ ...a, mockCdnDir: void 0 }, t, { log: $, logWarn: I }),
    m = null,
    d = i(
      () => (
        (m ??= fetchRemoteDownloadManifest(
          {
            version: x,
            platformArch: o,
            remoteCdnBaseUrl: r?.remoteCdnBaseUrl,
            remoteCdnBaseUrls: r?.remoteCdnBaseUrls,
            manifestRequestTimeoutMs: r?.manifestRequestTimeoutMs,
          },
          { log: $, logWarn: I },
        )),
        m
      ),
      "getRemoteManifestRef",
    ),
    f = null,
    h = i(() => ((f ??= c()), f), "getLocalManifestRef"),
    g = i(async (w) => {
      if (r?.assetInstallMode === "remote-download") return d();
      let T = resolveMockCdnReleaseDir(r?.mockCdnDir);
      return T && (await findMissingMockReleasePaths(T, o, w)).length > 0 && hasRemoteAssetCdnFallback(r) ? l() : h();
    }, "getManifestRefForComponents"),
    p = new Map(),
    R = i(async (w, T) => {
      let Q = !!T?.forceRefresh,
        V = buildReleaseDirCacheKey(w, Q);
      if (p.has(V)) return p.get(V) ?? null;
      let tt = await resolveReleaseDir(r, t, { log: $, logWarn: I }, w, await g(w), Q);
      return (
        p.set(V, tt),
        $("releaseDir:", tt ?? "<missing>", "components:", w?.join(",") ?? "<all>"),
        tt
      );
    }, "getReleaseDir"),
    y = i(async (w) => {
      let T = await g([w]);
      return T ? (selectRemoteAssetManifestComponents(T.manifest, [w])[0]?.sha256 ?? null) : null;
    }, "getComponentSha256"),
    A = {
      resolveReleaseDir: R,
      resolveComponentSha256: y,
      remoteCdnBaseUrl: r?.remoteCdnBaseUrl,
      remoteCdnBaseUrls: r?.remoteCdnBaseUrls,
      remoteCacheDir: r?.remoteCacheDir,
      manifestRequestTimeoutMs: r?.manifestRequestTimeoutMs,
    },
    b = createRemoteComponentVersionResolver(a, t, { log: $, logWarn: I }),
    C = createRemoteAssetInstaller(
      e,
      { ...A, platformArch: o, version: x, assetInstallMode: r?.assetInstallMode },
      { log: $, logWarn: I },
      r?.assetInstallMode === "remote-download" ? d : null,
    ),
    k = i(async (w) => {
      if (C.resolveComponentVersion) {
        let T = await C.resolveComponentVersion(w);
        if (T) return T;
      }
      return b(w);
    }, "getExpectedComponentVersion");
  ($("mockCdnDir:", r?.mockCdnDir ?? "<missing>"),
    $("remoteCdnBaseUrl:", formatOptionalValue(r?.remoteCdnBaseUrl)),
    $("remoteCdnBaseUrls:", formatOptionalValues(r?.remoteCdnBaseUrls)),
    $("remoteCacheDir:", formatOptionalValue(r?.remoteCacheDir)),
    $("remote env:", o),
    $("selected remote resource packages:", n.join(",")));
  let _ = i(async (w, T) => {
      let Q = await hasRemoteAssetComponentRefreshPending(e, { componentId: "glm", platformArch: o }),
        V = !!r?.force || Q || (w.shouldDeploy && w.appVersionChanged === !0);
      return (
        V && (await markRemoteAssetComponentRefreshPending(e, { componentId: "glm", platformArch: o, appVersion: x })),
        w.shouldDeploy
          ? (await deployNodeRuntime(
              e,
              {
                ...A,
                platformArch: o,
                force: !!r?.force,
                installer: C,
                expectedVersion: await k("node-runtime"),
              },
              { log: $, logWarn: I },
            ),
            logDeployRequired({ loggers: { logWarn: I }, installer: C, componentId: de, reason: w.reason }),
            await C.installFile({
              componentId: de,
              sourceRelativePath: "server/zcode-server.cjs",
              remotePath: `${M}/zcode-server.cjs`,
              forceRefresh: V,
            }),
            T && (await writeRemoteAssetComponentMeta(e, { id: de, sha256: T, platformArch: o })),
            $("server install done"),
            s("node-pty") &&
              (await deployNodePtyPrebuilds(
                e,
                t,
                {
                  ...A,
                  platformArch: o,
                  force: !!r?.force,
                  onlyIfMissing: !1,
                  installer: C,
                  expectedVersion: await k("node-pty"),
                },
                { log: $, logWarn: I },
              )),
            $("all uploads complete"),
            await deployZCodeAgentRuntime(
              e,
              t,
              { ...A, platformArch: o, installer: C, force: V, selectedResourcePackageIds: n },
              { log: $, logWarn: I },
            ),
            await deployRuntimeTools(
              e,
              t,
              { ...A, platformArch: o, installer: C, selectedResourcePackageIds: n },
              { log: $, logWarn: I },
            ),
            !0)
          : ($("skipped \u2014 remote version matches"),
            s("node-pty") &&
              (await deployNodePtyPrebuilds(
                e,
                t,
                { ...A, platformArch: o, onlyIfMissing: !0, installer: C },
                { log: $, logWarn: I },
              )),
            await deployZCodeAgentRuntime(
              e,
              t,
              { ...A, platformArch: o, installer: C, force: V, selectedResourcePackageIds: n },
              { log: $, logWarn: I },
            ),
            await deployRuntimeTools(
              e,
              t,
              { ...A, platformArch: o, installer: C, selectedResourcePackageIds: n },
              { log: $, logWarn: I },
            ),
            !1)
      );
    }, "deployWithDecision"),
    Re = i(async () => {
      let w = await y(de),
        T = r?.force
          ? { shouldDeploy: !0, reason: "force deploy requested" }
          : await checkServerDeployDecision(e, { platformArch: o, expectedSha256: w });
      return _(T, w);
    }, "deployUsingCurrentRemoteState");
  if (r?.deployLockMode === "caller-serialized") return Re();
  let ye = r?.force
    ? { shouldDeploy: !0, reason: "force deploy requested" }
    : await checkServerDeployDecision(e, { platformArch: o, expectedSha256: null });
  ye.shouldDeploy && $(`waiting for install-root lock: ${ye.reason}`);
  let et = await acquireRemoteDeployLock(e, { acquireTimeoutMs: r?.deployLockAcquireTimeoutMs }),
    D;
  try {
    D = { ok: !0, value: await Re() };
  } catch (w) {
    D = { ok: !1, error: w };
  }
  let O;
  try {
    (await et.release(), (O = { ok: !0 }));
  } catch (w) {
    O = { ok: !1, error: w };
  }
  if (!D.ok && !O.ok)
    throw new AggregateError(
      [D.error, O.error],
      "remote deployment and deploy-lock release both failed",
    );
  if (!D.ok) throw D.error;
  if (!O.ok) throw O.error;
  return D.value;
}
i(deployServer, "deployServer");
async function checkServerDeployDecision(e, t) {
  try {
    $("checking if deploy needed...");
    let r = `${M}/node`,
      o = await e.exists(r);
    if (($("remote node exists:", o), !o))
      return { shouldDeploy: !0, reason: `remote file missing path=${r}` };
    let n = `${M}/zcode-server.cjs`,
      s = await e.exists(n);
    if (($("remote server exists:", s), !s))
      return { shouldDeploy: !0, reason: `remote file missing path=${n}` };
    $("checking remote version...");
    let a = await e.exec(`${u(r)} ${u(n)} --version`),
      c = (await li(a)).trim();
    if (($("remote version:", JSON.stringify(c), "local:", x), c !== x))
      return {
        shouldDeploy: !0,
        reason: `remote server version mismatch remote=${c} expected=${x}`,
        appVersionChanged: !0,
      };
    let l = await checkServerBundleRequiredMarkers(e, r, n);
    if (l.shouldDeploy) return l;
    if (t.expectedSha256) {
      let m = await checkRemoteAssetComponentIdentity(e, {
        componentId: de,
        platformArch: t.platformArch,
        expectedIdentity: { sha256: t.expectedSha256 },
      });
      if (m.shouldDeploy) return m;
    }
    return { shouldDeploy: !1 };
  } catch (r) {
    return (
      $("checkServerDeployDecision error (will deploy):", r),
      { shouldDeploy: !0, reason: `remote deploy check failed: ${String(r)}` }
    );
  }
}
i(checkServerDeployDecision, "checkServerDeployDecision");
function createRemoteAssetInstaller(e, t, r, o = null) {
  if (t.assetInstallMode !== "remote-download") return new me(e, t, r);
  let n = null,
    s = null,
    a = i(() => (o ? o() : (s || (s = fetchRemoteDownloadManifest(t, r)), s)), "getRemoteManifest"),
    c = i(
      async () => (n || (n = detectRemoteAssetTools(e, r).then((l) => new Je(e, t, l, r, a()))), n),
      "getRemoteInstaller",
    );
  return {
    mode: "remote-download",
    async resolveComponentVersion(l) {
      let m = await a();
      return selectRemoteAssetManifestComponents(m.manifest, [l])[0]?.version ?? null;
    },
    async resolveComponentSha256(l) {
      let m = await a();
      return selectRemoteAssetManifestComponents(m.manifest, [l])[0]?.sha256 ?? null;
    },
    async installFile(l) {
      await (await c()).installFile(l);
    },
    async installDirectory(l) {
      await (await c()).installDirectory(l);
    },
  };
}
i(createRemoteAssetInstaller, "createRemoteAssetInstaller");
function buildReleaseDirCacheKey(e, t = !1) {
  return `${e && e.length > 0 ? e.slice().sort().join(",") : "<all>"}:${t ? "force" : "reuse"}`;
}
i(buildReleaseDirCacheKey, "buildReleaseDirCacheKey");
function resolveMockCdnReleaseDir(e) {
  return e ? oi(e, "releases", x) : null;
}
i(resolveMockCdnReleaseDir, "resolveMockCdnReleaseDir");
async function resolveReleaseDir(e, t, r, o, n, s = !1) {
  let a = resolveMockCdnReleaseDir(e?.mockCdnDir),
    c = `${t.platform}-${t.arch}`;
  if (a) {
    let l = await findMissingMockReleasePaths(a, c, o);
    if (
      l.length === 0 ||
      (r.logWarn(`[remote-assets] mock-cdn incomplete for ${c}; missing=${l.join(", ")}`), !hasRemoteAssetCdnFallback(e))
    )
      return a;
    r.logWarn(
      `[remote-assets] fallback to CDN/cache for ${c}; components=${o?.join(",") ?? "<all>"}`,
    );
  }
  return ensureRemoteReleaseDirFromCdn(
    {
      remoteCdnBaseUrl: e?.remoteCdnBaseUrl,
      remoteCdnBaseUrls: e?.remoteCdnBaseUrls,
      remoteCacheDir: e?.remoteCacheDir,
      version: x,
      platformArch: c,
      componentIds: o,
      manifestRef: n,
      forceRefresh: s,
      manifestRequestTimeoutMs: e?.manifestRequestTimeoutMs,
    },
    r,
  );
}
i(resolveReleaseDir, "resolveReleaseDir");
function hasRemoteAssetCdnFallback(e) {
  let t = !!e?.remoteCacheDir?.trim(),
    r = !!e?.remoteCdnBaseUrl?.trim(),
    o = !!e?.remoteCdnBaseUrls?.some((n) => n.trim().length > 0);
  return t && (r || o);
}
i(hasRemoteAssetCdnFallback, "hasRemoteAssetCdnFallback");
async function findMissingMockReleasePaths(e, t, r) {
  let o = [];
  for (let n of resolveRequiredMockReleasePaths(t, r)) (await fileExists(e, ...n.split("/"))) || o.push(n);
  return o;
}
i(findMissingMockReleasePaths, "findMissingMockReleasePaths");
function resolveRequiredMockReleasePaths(e, t) {
  let r = t && t.length > 0 ? t : [de, "node-runtime"],
    o = new Set();
  for (let n of r)
    switch (n) {
      case de:
        o.add("server/zcode-server.cjs");
        break;
      case "node-runtime":
        o.add(`node/${e}/node`);
        break;
      case "node-pty":
        (o.add(`node-pty/${e}/pty.node`),
          e.startsWith("darwin-") && o.add(`node-pty/${e}/spawn-helper`));
        break;
      case "glm":
        o.add(`glm/${e}/zcode.cjs`);
        for (let s of te) o.add(`glm/${e}/packages/${s}`);
        break;
      case "bfs":
        o.add(`tools/${e}/bfs/bfs`);
        break;
      case "ripgrep":
        o.add(`tools/${e}/ripgrep/rg`);
        break;
      case "ugrep":
        o.add(`tools/${e}/ugrep/ugrep`);
        break;
    }
  return [...o];
}
i(resolveRequiredMockReleasePaths, "resolveRequiredMockReleasePaths");
function li(e) {
  return new Promise((t) => {
    let r = "";
    (e.stdout.on("data", (o) => {
      r += o.toString();
    }),
      e.onClose(() => t(r)));
  });
}
i(li, "collectStdout");
var ci = -1,
  mi = [
    "ZCODE_ENV",
    "ZCODE_BASE_URL",
    "ZCODE_ENDPOINT_ORIGIN",
    "ZCODE_TEST_BASE_URL",
    "ZCODE_PRODUCTION_BASE_URL",
    "ZAI_OAUTH_ORIGIN",
    "ZAI_TEST_OAUTH_ORIGIN",
    "ZAI_PRODUCTION_OAUTH_ORIGIN",
    "ZAI_BUSINESS_BASE_URL",
    "ZAI_TEST_BUSINESS_BASE_URL",
    "ZAI_PRODUCTION_BUSINESS_BASE_URL",
    "ZAI_OAUTH_CLIENT_ID",
    "ZAI_TEST_OAUTH_CLIENT_ID",
    "ZAI_PRODUCTION_OAUTH_CLIENT_ID",
  ];
function pickRemoteRuntimeEnv(e) {
  let t = {};
  for (let r of mi) {
    let o = e[r]?.trim();
    o && (t[r] = o);
  }
  return t;
}
i(pickRemoteRuntimeEnv, "pickRemoteRuntimeEnv");
async function connectRemote(e, t) {
  try {
    return await connectRemoteUnchecked(e, t);
  } catch (r) {
    throw (e.dispose(), r);
  }
}
i(connectRemote, "connectRemote");
async function connectRemoteUnchecked(e, t) {
  let r = t?.clientId ?? `desktop-${Date.now()}`,
    o = i((...D) => console.log(we("connectRemote", process.pid), ...D), "log");
  o("detecting remote env...");
  let n = await e.detect();
  (o("detected:", n),
    assertSupportedRemoteEnvironment(n),
    t?.skipDeploy || (o("deploying server..."), await deployServer(e, n, t), o("deploy complete")),
    o("launching remote server..."));
  let s = await e.exec(buildRemoteServerCommand(t));
  (o("remote server exec started"),
    s.stderr.on("data", (D) => {
      console.log(`[remote] ${D.toString().trimEnd()}`);
    }),
    o("performing handshake..."));
  let { hello: a, remaining: c } = await performHandshake(s, r, t?.handshakeTimeout);
  (o("handshake done, server version:", a.version), c && c.length > 0 && s.stdout.unshift(c));
  let l = wrapStdioStream(s),
    m = new Nt(l),
    d = new Ut(m),
    f = new Zt(d),
    h = !1,
    g = !1,
    p,
    R = new Promise((D) => {
      p = D;
    }),
    y = i((D) => {
      h || ((h = !0), t?.onDidRemoteClose?.({ code: D }));
    }, "reportRemoteClose"),
    A = e.onDidDisconnect?.((D) => {
      let O = D.error?.message;
      (o(
        O
          ? `remote backend disconnected: ${D.reason}: ${O}`
          : `remote backend disconnected: ${D.reason}`,
      ),
        y(ci));
    }),
    b = s.onClose((D) => {
      ((g = !0), p(), y(D));
    }),
    C = !1,
    k = !1,
    _ = null,
    Re = i(() => {
      C || ((C = !0), A?.dispose(), d.dispose(), m.dispose(), l.dispose());
    }, "beginDisposal"),
    ye = i(() => {
      k || ((k = !0), b.dispose(), e.dispose());
    }, "disposeBackend"),
    et = i(async () => {
      if (!k) {
        if (((k = !0), b.dispose(), e.disposeAndWait)) {
          await e.disposeAndWait();
          return;
        }
        e.dispose();
      }
    }, "disposeBackendAndWait");
  return {
    services: f,
    client: d,
    dispose() {
      (Re(), ye());
    },
    disposeAndWait(D) {
      if (_) return _;
      if ((Re(), k || g)) return (ye(), Promise.resolve());
      let O = Math.max(D?.timeoutMs ?? 5e3, 0);
      return (
        (_ = (async () => {
          let w,
            T = new Promise((V) => {
              w = setTimeout(() => V("timed-out"), O);
            }),
            Q = await Promise.race([R.then(() => "closed"), T]);
          (w && clearTimeout(w),
            Q === "timed-out" && o(`remote stdio close timed out after ${O}ms`),
            await et());
        })()),
        _
      );
    },
  };
}
i(connectRemoteUnchecked, "connectRemoteUnchecked");
function buildRemoteServerCommand(e) {
  let t = [`${Ht}="desktop-attached-remote"`, 'ZCODE_SERVER_RUNTIME_ROOT="$HOME/.nofy/server"'];
  for (let [o, n] of Object.entries(pickRemoteRuntimeEnv(e?.remoteRuntimeEnv ?? {}))) t.push(`${o}=${S(n)}`);
  let r = e?.appVersion?.trim();
  return (
    r && t.push(`${Ft}=${S(r)}`),
    `${t.join(" ")} ~/.nofy/server/node ~/.nofy/server/zcode-server.cjs`
  );
}
i(buildRemoteServerCommand, "buildRemoteServerCommand");
export {
  yo as DockerBackend,
  po as WSLBackend,
  connectRemote as connectRemote,
  createRemoteBackend as createRemoteBackend,
  deployServer as deployServer,
  ho as isDockerAvailable,
  uo as isWSLAvailable,
  Ro as listDockerContainers,
  fo as listWSLDistros,
  go as parseDockerContainerList,
  mo as parseWSLDistroList,
  performHandshake as performHandshake,
  pickRemoteRuntimeEnv as pickRemoteRuntimeEnv,
  wrapStdioStream as wrapStdioStream,
};
