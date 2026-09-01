// A1-P1-B12：路径助手域逐字重建（styles js 1925–1976，共 52 行，20 处改名）。
// 真身基准（只读）：desktop/src/out/renderer/assets/styles-CdEGpc2x.js（md5 48d71d4874b0868d61fd35a328bf6ad5）。
// 落点裁定：新叶（components/conversation/ 域；编排方 B12 准收，横切域消费面只立实体留批登记，不越域改指）。
// 逐字证明：/tmp/a1r0-p1/p12/p12-roundtrip.js（AST 逆映射还原 ≡ bundle 逐字 EXACT）+ p12-leafcheck.js（正则独立路线）。
// 函数体内局部变量保留混淆名（B5 约定）；型缝 `: any` 参数缝见 p12/PathHelpers.seam-log.txt，均带〔A1-P1-B12〕。
// 跨域消费面登记（留批）：ExtendedViews 787/788（isAbsolutePath/pathDirname）、TerminalPane 138（basename）、
//   FileTreePanel 271（pathToFileUrl）、GitReview 389（joinPath「待实体化」在案）。
// 区段切分墓碑：Io 消费函数@1916（workspaceKey 域）在界外；lae@1977（5s 常量）为右界。
//
// 映射表（minified → 语义名 → bundle 定义行 → 属主）：
//   iae→WINDOWS_DRIVE_PATH_RE（1925 链）| aae→UNC_PATH_RE（链）| oae→URI_ENCODED_CHAR_RE（链）
//   Go→basename（1928）| sae→pathDirname（1932）| Ko→isAbsolutePath（1942）| qo→tryDecodeUri（1945）
//   Jo→joinPath（1953）| Yo→pathToFileUrl（1959）| cae→normalizeLinkItem（1968）
/* eslint-disable */

/* ── 路径助手域（styles 1925–1976） ── */
var WINDOWS_DRIVE_PATH_RE = /^[a-zA-Z]:[\\/]/,
  UNC_PATH_RE = /^\\\\/,
  URI_ENCODED_CHAR_RE = /%[0-9A-Fa-f]{2}/;
function basename(e: any) {
  let t = e.replace(/\\/g, `/`).replace(/\/+$/, ``).split(`/`).filter(Boolean);
  return t[t.length - 1] ?? e;
}
function pathDirname(e: any) {
  let t = e.trim().replace(/[\\/]+$/, ``);
  if (!t) return null;
  let n = Math.max(t.lastIndexOf(`/`), t.lastIndexOf(`\\`));
  if (n < 0) return null;
  if (n === 0) return t[0] ?? null;
  let r = t.slice(0, n);
  return /^[A-Za-z]:$/.test(r) ? `${r}${t[n] ?? `\\`}` : r || null;
}
function isAbsolutePath(e: any) {
  return e.startsWith(`/`) || WINDOWS_DRIVE_PATH_RE.test(e) || UNC_PATH_RE.test(e);
}
function tryDecodeUri(e: any) {
  if (!URI_ENCODED_CHAR_RE.test(e)) return e;
  try {
    return decodeURI(e);
  } catch {
    return e;
  }
}
function joinPath(e: any, t: any) {
  if (!t) return e;
  if (isAbsolutePath(t)) return t;
  let n = e.includes(`\\`) && !e.includes(`/`) ? `\\` : `/`;
  return `${e.replace(/[\\/]+$/, ``)}${n}${t.replace(/^[\\/]+/, ``)}`;
}
function pathToFileUrl(e: any) {
  let t = e.replace(/\\/g, `/`);
  return WINDOWS_DRIVE_PATH_RE.test(e)
    ? `file:///${encodeURI(t)}`
    : t.startsWith(`/`)
      ? `file://${encodeURI(t)}`
      : UNC_PATH_RE.test(e)
        ? `file:${encodeURI(t)}`
        : encodeURI(t);
}
function normalizeLinkItem(e: any) {
  let t = tryDecodeUri(e.title);
  if (!(`path` in e) || !e.path) return t === e.title ? e : { ...e, title: t };
  let n = tryDecodeUri(e.path),
    r = basename(e.path),
    i = basename(n),
    a = e.title === r || e.title.trim().length === 0 ? i : t;
  return n === e.path && a === e.title ? e : { ...e, title: a, path: n };
}

export {
  WINDOWS_DRIVE_PATH_RE, UNC_PATH_RE, URI_ENCODED_CHAR_RE, basename, pathDirname, isAbsolutePath,
  tryDecodeUri, joinPath, pathToFileUrl, normalizeLinkItem,
};
