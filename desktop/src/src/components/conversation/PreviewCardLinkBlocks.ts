// A1-P1-B15+B16：预览卡链接域逐字重建（styles js 4993–4995 + 109714–109915，共 205 行，30 处改名）。
// 真身基准（只读）：desktop/src/out/renderer/assets/styles-CdEGpc2x.js（md5 48d71d4874b0868d61fd35a328bf6ad5）。
// 〔A1-P1-B16〕扩展（② 链接域余三件 xgt@109771/Egt@109848/jgt@109889 + ③ PreviewCards 余二
//   useWorkspaceScopedServices=Oc@4993→Dc 深链 + isRemoteAwarePath=Ogt）：pgt var 链整句携带（语句不可分）+
//   Egt..Ngt 链 + Oc 薄消费逐字，链接域 109714–109915 统一入本叶；B15 段（Sgt..o1）同叶保留。
// 逐字证明：/tmp/a1r0-p1/p16/p16-roundtrip.js（AST 逆映射还原 ≡ bundle 逐字 EXACT）+ p16-leafcheck.js（正则独立路线）。
// 函数体内局部变量保留混淆名（B5 约定）；型缝 `: any` 参数缝见 p16/seams-PreviewCardLinkBlocks.json，
//   B16 新增段缝带〔A1-P1-B16〕，B15 段缝沿用〔A1-P1-B15〕。
// 区段切分墓碑：Oc 段左界 = Dc@4955–4992 深链（fs/bc/pc/Kse/oc/Zs/Wse）右界邻接（Dc 不转录，declare 留批）；
//   Oc 右界 = Jse@4996 邻接（留批）；pgt 链左界 109714 = 109713 闭包末邻接；xgt@109816 右界接 Sgt@109817（本叶 B15 段）；
//   o1@109847 闭包末接 Egt@109848（本批统一）；Ngt@109915 右界 = Pgt@109916 卡片构建器（留批）。
// 映射表（minified → 语义名 → bundle 定义行）：
//   Oc→useWorkspaceScopedServices（4993）| pgt→PREVIEW_KIND_TABLE（109714）| mgt→FILE_URL_SCAN_PATTERN（109722）
//   hgt→MARKDOWN_LINK_SCAN_PATTERN（109723）| ggt→QUOTED_DOC_FILE_PATTERN（109724）| _gt→BARE_DOC_FILE_PATTERN（109725）
//   t1→stripTrailingPunctuation（109727）| n1→matchPreviewKind（109733）| vgt→isHtmlPreviewKind（109737）
//   r1→fileUrlToPath（109740）| i1→resolveReferencePath（109754）| ygt→stripAngleBrackets（109765）
//   bgt→rangesOverlap（109768）| xgt→extractDocumentFileLinks（109771）
//   Sgt→LOCAL_URL_PATTERN（109817）| Cgt→EMBEDDABLE_LOCAL_URL_PATTERN（109819）| wgt→EMBEDDABLE_FILE_URL_PATTERN（109821）
//   Tgt→MARKDOWN_LINK_PATTERN（109823）| a1→stripTrailingUrlPunctuation（109824）| o1→isEmbeddableBrowserUrl（109827）
//   Egt→stripLinkTargetAngleBrackets（109848）| Dgt→sanitizeLinkLabel（109851）| Ogt→isRemoteAwarePath（109862）
//   s1→normalizePathSlashes（109870）| kgt→resolveLinkPathCandidate（109873）| Agt→matchLinkPathAgainstCandidates（109879）
//   jgt→findMarkdownLinkLabelByPath（109889）| Mgt→resolveUrlDisplayName（109897）| Ngt→resolveHtmlUrlLinkPath（109906）
// 跨域真实 import：qo→decodeUriSafe | gA→resolveWorkspaceFileLink | Jo→resolveWorkspaceRelativePath | Go→baseName
//   （均 modules/MarkdownIntegration；gA 末行极性〔A1-P1-B16〕⑥ 更正后与束真身一致）。
// 深链 declare：Dc→useWorkspaceConnectionBundle（留批）。
// 消费面收敛〔A1-P1-B16〕：components/conversation/PreviewCards 手写 pgt/t1/n1/r1/i1 双实例 + useWorkspaceScopedServices/
//   isRemoteAwarePath 二 declare 收敛改指本叶（R25 判例）。留批消费位：xgt@110020、jgt/Mgt@109970、Ogt@184892、Pgt@109915。
/* eslint-disable */
import { decodeUriSafe, resolveWorkspaceFileLink, resolveWorkspaceRelativePath, baseName } from '../../modules/MarkdownIntegration'; // 原 qo/gA/Jo/Go

/** 原 Dc（styles 4955–4992）：工作区连接束（fs/bc/pc/Kse/oc/Zs/Wse 深链），本批不转录，留批 〔A1-P1-B16〕 */
declare function useWorkspaceConnectionBundle(
  workspacePath: any,
  preferredRemoteSessionId: any,
  workspaceIdentity: any,
  extra: any,
): { services: any; remoteSessionId: any; isRemoteTarget: any; connectionKind: string; rpcReady: boolean };

/* ── 预览卡链接域（styles 4993–4995 + 109714–109915） ── */
function useWorkspaceScopedServices(e: any, t: any, n: any, r?: any) {
  return useWorkspaceConnectionBundle(e, t, n, r).services;
}
var PREVIEW_KIND_TABLE = [
    { extensions: [`.md`], kind: `markdown`, subtitleId: `chat.previewCards.markdown` },
    { extensions: [`.html`, `.htm`], kind: `html`, subtitleId: `chat.previewCards.htmlWebsite` },
    { extensions: [`.docx`], kind: `docx`, subtitleId: `chat.previewCards.docx` },
    { extensions: [`.xlsx`], kind: `xlsx`, subtitleId: `chat.previewCards.xlsx` },
    { extensions: [`.pptx`], kind: `pptx`, subtitleId: `chat.previewCards.pptx` },
    { extensions: [`.pdf`], kind: `pdf`, subtitleId: `chat.previewCards.pdf` },
  ],
  FILE_URL_SCAN_PATTERN = /\bfile:\/\/[^\s<>()\]`"'*，。！？；：、]+/gi,
  MARKDOWN_LINK_SCAN_PATTERN = /\[([^\]\n]*)\]\(([^)\n]+)\)/g,
  QUOTED_DOC_FILE_PATTERN = /([`"'])([^`"'\r\n]+?\.(?:md|html?|docx|xlsx|pptx|pdf)(?::\d+(?::\d+)?)?)\1/giu,
  BARE_DOC_FILE_PATTERN =
    /(?:^|[\s("'`,.;:!?，。！？；：、])((?:(?:\.{1,2}[\\/]|[a-zA-Z]:[\\/]|\/|[\p{L}\p{N}\p{M}\p{S}_.@()-]+[\\/])[\p{L}\p{N}\p{M}\p{S}_.@() -]+?(?:[\\/][\p{L}\p{N}\p{M}\p{S}_.@() -]+?)*|[\p{L}\p{N}\p{M}\p{S}_.@()-]+)\.(?:md|html?|docx|xlsx|pptx|pdf)(?::\d+(?::\d+)?)?)(?=$|[\s)"'`,.;:!?，。！？；：、])/giu;
function stripTrailingPunctuation(e: any) {
  return e
    .trim()
    .replace(/[.,;!?，。！？；：、]+$/, ``)
    .replace(/:\d+(?::\d+)?$/, ``);
}
function matchPreviewKind(e: any) {
  let t = stripTrailingPunctuation(e).toLowerCase();
  return PREVIEW_KIND_TABLE.find((e: any) => e.extensions.some((e: any) => t.endsWith(e))) ?? null;
}
function isHtmlPreviewKind(e: any) {
  return matchPreviewKind(e)?.kind === `html`;
}
function fileUrlToPath(e: any) {
  try {
    let t = new URL(e);
    if (t.protocol !== `file:`) return null;
    let n = decodeUriSafe(t.pathname);
    return /^\/[a-zA-Z]:\//.test(n)
      ? n.slice(1)
      : t.hostname && t.hostname !== `localhost`
        ? `//${t.hostname}${n}`
        : n;
  } catch {
    return null;
  }
}
function resolveReferencePath(e: any, t: any) {
  if (/^file:\/\//i.test(t)) return fileUrlToPath(t);
  let n = resolveWorkspaceFileLink(e, t);
  if (n) return n.path;
  let r = stripTrailingPunctuation(t);
  return !r || r.startsWith(`http://`) || r.startsWith(`https://`)
    ? null
    : !r.includes(`/`) && !r.includes(`\\`)
      ? resolveWorkspaceRelativePath(e, r)
      : (resolveWorkspaceFileLink(e, `./${r}`)?.path ?? null);
}
function stripAngleBrackets(e: any) {
  return e.trim().replace(/^<|>$/g, ``);
}
function rangesOverlap(e: any, t: any, n: any) {
  return n.some(([n, r]: any) => e < r && t > n);
}
function extractDocumentFileLinks(e: any, t: any) {
  if (!e.trim()) return [];
  let n = [],
    r = [];
  for (let i of e.matchAll(MARKDOWN_LINK_SCAN_PATTERN)) {
    let e = i[2] ? stripAngleBrackets(i[2]) : ``,
      a = resolveReferencePath(t, e),
      o = a ? matchPreviewKind(a) : null,
      s = i.index ?? 0,
      c = s + (i[0]?.length ?? 0);
    (r.push([s, c]), a && o && n.push({ start: s, end: c, kind: o.kind, path: a, raw: e }));
  }
  for (let t of e.matchAll(FILE_URL_SCAN_PATTERN)) {
    let e = (t[0] ?? ``).replace(/(?:[*_`]+|[.,;:!?，。！？；：、]+)+$/g, ``),
      i = fileUrlToPath(e),
      a = i ? matchPreviewKind(i) : null,
      o = t.index ?? 0,
      s = o + (t[0]?.length ?? 0);
    (r.push([o, s]), i && a && n.push({ start: o, end: s, kind: a.kind, path: i, raw: e }));
  }
  for (let i of e.matchAll(QUOTED_DOC_FILE_PATTERN)) {
    let e = (i[2] ?? ``).trim(),
      a = i[0] ?? e,
      o = i.index ?? 0,
      s = o + a.length;
    if (!e || rangesOverlap(o, s, r)) continue;
    let c = resolveReferencePath(t, e),
      l = c ? matchPreviewKind(c) : null;
    if (c && l) {
      let t = o + a.indexOf(e),
        i = t + e.length;
      (r.push([o, s]), n.push({ start: t, end: i, kind: l.kind, path: c, raw: e }));
    }
  }
  for (let i of e.matchAll(BARE_DOC_FILE_PATTERN)) {
    let e = i[1] ?? ``,
      a = i[0] ?? e,
      o = (i.index ?? 0) + a.lastIndexOf(e),
      s = o + e.length;
    if (rangesOverlap(o, s, r)) continue;
    let c = resolveReferencePath(t, e),
      l = c ? matchPreviewKind(c) : null;
    c && l && n.push({ start: o, end: s, kind: l.kind, path: c, raw: e });
  }
  return n.sort((e: any, t: any) => e.start - t.start || e.end - t.end);
}
var LOCAL_URL_PATTERN =
    /\bhttps?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?(?:[/?#][^\s<>()\]`"'*，。！？；：、]*)?/gi,
  EMBEDDABLE_LOCAL_URL_PATTERN =
    /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d{1,5})?(?:[/?#][^\s<>()\]`"'*，。！？；：、]*)?$/i,
  EMBEDDABLE_FILE_URL_PATTERN =
    /^file:\/\/(?:localhost\/|\/|[^/\s<>()\]`"'*，。！？；：、]+\/)[^\s<>()\]`"'*，。！？；：、]+\.html?(?:[?#][^\s<>()\]`"'*，。！？；：、]*)?$/i,
  MARKDOWN_LINK_PATTERN = /\[([^\]\n]*)\]\(([^)\n]+)\)/g;
function stripTrailingUrlPunctuation(e: any) {
  return e.trim().replace(/(?:[*_`]+|[.,;:!?，。！？；：、]+)+$/g, ``);
}
function isEmbeddableBrowserUrl(e: any) {
  let t = stripTrailingUrlPunctuation(e.trim());
  if (!t) return !1;
  let n = EMBEDDABLE_LOCAL_URL_PATTERN.test(t),
    r = EMBEDDABLE_FILE_URL_PATTERN.test(t);
  if (!n && !r) return !1;
  try {
    let e = new URL(t);
    if (e.protocol === `file:`) return r;
    let n = e.port ? Number.parseInt(e.port, 10) : null;
    return (
      (e.protocol === `http:` || e.protocol === `https:`) &&
      e.username.length === 0 &&
      e.password.length === 0 &&
      (e.hostname === `localhost` || e.hostname === `127.0.0.1`) &&
      (n === null || (n > 0 && n <= 65535))
    );
  } catch {
    return !1;
  }
}
function stripLinkTargetAngleBrackets(e: any) {
  return e.trim().replace(/^<|>$/g, ``);
}
function sanitizeLinkLabel(e: any) {
  let t = e.replace(/\s+/g, ` `).trim();
  return !t ||
    t.length > 80 ||
    /^https?:\/\//i.test(t) ||
    /[*_`[\]<>]/.test(t) ||
    /^[)"'`,.;:!?，。！？；：、）】》]+/.test(t) ||
    !/[a-zA-Z0-9\u4e00-\u9fff]/.test(t)
    ? null
    : t;
}
function isRemoteAwarePath(e: any) {
  return (
    isHtmlPreviewKind(e.path) &&
    e.compactForRemoteControl !== !0 &&
    !e.workspaceIdentity?.trim() &&
    !e.workspaceRemoteSessionId
  );
}
function normalizePathSlashes(e: any) {
  return e.replace(/\\/g, `/`).replace(/\/+/g, `/`).replace(/\/$/, ``);
}
function resolveLinkPathCandidate(e: any, t: any) {
  return /^(?:[a-zA-Z]:[\\/]|\/|\\\\)/.test(t) ? stripTrailingPunctuation(t) : (resolveReferencePath(e, t) ?? t);
}
function matchLinkPathAgainstCandidates(e: any, t: any, n: any) {
  let r = normalizePathSlashes(e.path),
    i = t.map((e: any) => {
      let t = resolveLinkPathCandidate(n, e);
      return { path: t, normalized: normalizePathSlashes(t) };
    }),
    a = i.find((e: any) => e.normalized === r);
  if (a) return a.path;
  let o = stripTrailingPunctuation(e.raw);
  if (o.includes(`/`) || o.includes(`\\`) || /^file:/i.test(o)) return null;
  let s = i.filter((e: any) => baseName(e.normalized) === o);
  return s.length === 1 ? s[0].path : null;
}
function findMarkdownLinkLabelByPath(e: any, t: any) {
  for (let n of e.matchAll(MARKDOWN_LINK_PATTERN)) {
    let e = n[1] ? sanitizeLinkLabel(n[1]) : null,
      r = n[2] ? stripTrailingUrlPunctuation(stripLinkTargetAngleBrackets(n[2])) : ``;
    if (e && r === t && !/^https?:\/\//i.test(e)) return e;
  }
  return null;
}
function resolveUrlDisplayName(e: any) {
  try {
    let t = new URL(e),
      n = baseName(decodeURI(t.pathname));
    return n && n !== `/` ? n : t.host;
  } catch {
    return e;
  }
}
function resolveHtmlUrlLinkPath(e: any, t: any, n: any) {
  try {
    let r = decodeUriSafe(new URL(e).pathname).replace(/^\/+/, ``);
    if (!isHtmlPreviewKind(r)) return null;
    let i = resolveReferencePath(t, r);
    return i ? matchLinkPathAgainstCandidates({ start: 0, end: 0, kind: `html`, path: i, raw: r }, n, t) : null;
  } catch {
    return null;
  }
}

export {
  useWorkspaceScopedServices,
  PREVIEW_KIND_TABLE, FILE_URL_SCAN_PATTERN, MARKDOWN_LINK_SCAN_PATTERN, QUOTED_DOC_FILE_PATTERN, BARE_DOC_FILE_PATTERN,
  stripTrailingPunctuation, matchPreviewKind, isHtmlPreviewKind, fileUrlToPath, resolveReferencePath,
  stripAngleBrackets, rangesOverlap, extractDocumentFileLinks,
  LOCAL_URL_PATTERN, EMBEDDABLE_LOCAL_URL_PATTERN, EMBEDDABLE_FILE_URL_PATTERN, MARKDOWN_LINK_PATTERN,
  stripTrailingUrlPunctuation, isEmbeddableBrowserUrl,
  stripLinkTargetAngleBrackets, sanitizeLinkLabel, isRemoteAwarePath, normalizePathSlashes,
  resolveLinkPathCandidate, matchLinkPathAgainstCandidates, findMarkdownLinkLabelByPath,
  resolveUrlDisplayName, resolveHtmlUrlLinkPath,
};
