// A1-P1-B15+B16+B17：预览卡链接域逐字重建（styles js 4993–4995 + 109714–110052，共 342 行，41 处改名）。
// 真身基准（只读）：desktop/src/out/renderer/assets/styles-CdEGpc2x.js（md5 48d71d4874b0868d61fd35a328bf6ad5）。
// 〔A1-P1-B16〕扩展（② 链接域余三件 xgt@109771/Egt@109848/jgt@109889 + ③ PreviewCards 余二
//   useWorkspaceScopedServices=Oc@4993→Dc 深链 + isRemoteAwarePath=Ogt）：pgt var 链整句携带（语句不可分）+
//   Egt..Ngt 链 + Oc 薄消费逐字，链接域 109714–109915 统一入本叶；B15 段（Sgt..o1）同叶保留。
// 逐字证明：/tmp/a1r0-p1/p16/p16-roundtrip.js + p16-leafcheck.js（B15/B16 段）；
//   /tmp/a1r0-p1/p17-roundtrip.js（AST 逆映射还原 ≡ bundle 逐字 EXACT，含 109916–110052 段）+
//   p17-leafcheck.js（正则独立路线）。
// 函数体内局部变量保留混淆名（B5 约定）；型缝 `: any` 参数缝见 p16/seams-PreviewCardLinkBlocks.json，
//   B16 新增段缝带〔A1-P1-B16〕，B15 段缝沿用〔A1-P1-B15〕；〔A1-P1-B17〕109916–110052 段缝（8 函数形参
//   + 回调形参 + useAssistantPreviewCards 解构形参 `: any`）见 /tmp/a1r0-p1/p17/seams-PreviewCardLinkBlocks.json。
// 区段切分墓碑：Oc 段左界 = Dc@4955–4992 深链（fs/bc/pc/Kse/oc/Zs/Wse）右界邻接——〔A1-P1-B17〕Dc declare 删除，
//   收敛改指 canonical services/remoteServices useResolvedWorkspaceServices（A0-S4-5 既录，经 modules/services 转导出；
//   WorkspaceShell A1-P2-B2 同符改指先例）；Oc 右界 = Jse@4996 邻接（留批）；pgt 链左界 109714 = 109713 闭包末邻接；
//   xgt@109816 右界接 Sgt@109817（本叶 B15 段）；o1@109847 闭包末接 Egt@109848（B16 统一）；
//   〔A1-P1-B17〕Ngt@109915 右界 = Pgt@109916 起段吸收 [109916,110052]（卡片构建/去重/聚合钩子）；
//   Bgt@110052 右界 = Vgt@110053 permission 域邻接（留批）。
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
//   〔A1-P1-B17〕Pgt→buildPreviewCardFromLink（109916）| Fgt→previewCardDedupeKey（109945）
//   Igt→extractAssistantPreviewCards（109955）| c1→previewCardFilePath（109996）| Lgt→hasPreviewCardFilePath（109999）
//   Rgt→EMPTY_PREVIEW_CARD_LIST（110002）| zgt→joinAssistantTextRows（110003）| Bgt→useAssistantPreviewCards（110008）
// 跨域真实 import：qo→decodeUriSafe | gA→resolveWorkspaceFileLink | Jo→resolveWorkspaceRelativePath | Go→baseName
//   （均 modules/MarkdownIntegration；gA 末行极性〔A1-P1-B16〕⑥ 更正后与束真身一致）；
//   〔A1-P1-B17〕Yo→pathToFileUrl（./PathHelpers，B12 叶 1959）| J→logger（modules/logger 导出 t）
//   Dc→useResolvedWorkspaceServices（modules/services 转导出；canonical 属主 services/remoteServices，A0-S4-5）。
// 深链 declare 收敛〔A1-P1-B17〕：Dc declare（B16 留批）删除 → 改指 canonical useResolvedWorkspaceServices，
//   消费位 = 本叶 useWorkspaceScopedServices 体（≡ bundle 4994 `Dc(e, t, n, r).services`）。
// 消费面收敛〔A1-P1-B16〕：components/conversation/PreviewCards 手写 pgt/t1/n1/r1/i1 双实例 + useWorkspaceScopedServices/
//   isRemoteAwarePath 二 declare 收敛改指本叶（R25 判例）。
// 消费面收敛〔A1-P1-B17〕：Ogt@184892 消费位 = components/shell/WorkspaceShell canOpenPathInEmbeddedBrowser declare
//   改指本叶 isRemoteAwarePath（别名，R1 判例）；xgt@110020/jgt,Mgt@109970/Ngt@109966 消费位 = 本叶
//   useAssistantPreviewCards/extractAssistantPreviewCards 段内实消费（bundle 逐字）；Bgt 消费位 113063/113156
//   = modules/Conversation Rvt/Bvt 重建体（buildAssistantPreviewCards declare 改指，见该文件删碑）。
/* eslint-disable */
import * as React from "react"; // 〔A1-P1-B17〕原 Q（react-BQLj9xdT.js）——useAssistantPreviewCards 钩子面消费
import { decodeUriSafe, resolveWorkspaceFileLink, resolveWorkspaceRelativePath, baseName } from '../../modules/MarkdownIntegration'; // 原 qo/gA/Jo/Go
import { useResolvedWorkspaceServices } from '../../modules/services'; // 〔A1-P1-B17〕原 Dc（styles 4955–4992）canonical（services/remoteServices，A0-S4-5 既录）
import { pathToFileUrl } from './PathHelpers'; // 〔A1-P1-B17〕原 Yo（1959；B12 叶逐字）——Pgt 卡片 website url 面消费
import { t as logger } from '../../modules/logger'; // 〔A1-P1-B17〕原 J——useAssistantPreviewCards 文件变更读取失败告警面消费

/* ── tombstone〔A1-P1-B17〕：declare useWorkspaceConnectionBundle（原 Dc，styles 4955–4992；B16 立、留批）删除 →
 * 一符一家收敛改指 canonical services/remoteServices useResolvedWorkspaceServices（A0-S4-5 逐字重建在案，经
 * modules/services@107/109 转导出；双归属裁决见 modules/WorkspaceTabsDeep 头注 [D]；WorkspaceShell A1-P2-B2
 * 同符改指先例）。消费面实证（1 处）：本叶 useWorkspaceScopedServices 体 ≡ bundle 4994 `Dc(e, t, n, r).services`。
 * 深链 fs/bc/pc/Kse/oc/Zs/Wse 均已在案：useServices（services/serviceContext）/useResolvedRemoteSessionId/
 * useWorkspaceTabStore（WorkspaceTabsDeep）/isRemoteWorkspaceTarget/getDisconnectedServices/
 * useSessionRegistryStore（stores/sessionRegistryStore）——remoteServices 内逐字闭合，本叶零深链 declare。 ── */

/* ── 预览卡链接域（styles 4993–4995 + 109714–110052） ── */
function useWorkspaceScopedServices(e: any, t: any, n: any, r?: any): any { // 〔A1-P1-B17〕型缝：返回面 any（前 declare 同口径；canonical ResolvedBaseServices 型面下 PreviewCards fileService 消费面 FileServiceLike 不兼容）
  return useResolvedWorkspaceServices(e, t, n, r).services;
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

/* ── 预览卡构建域（styles 109916–110052，〔A1-P1-B17〕） ── */
function buildPreviewCardFromLink(e: any) {
  let t: any = matchPreviewKind(e.path); // 〔A1-P1-B17〕型缝：n1 返回面 = 表项 | null，else 分支仅消费 subtitleId（bundle 109941）
  return e.kind === `markdown`
    ? {
        id: `markdown:${e.path}`,
        type: `markdown`,
        kind: `markdown`,
        title: baseName(e.path),
        subtitleId: `chat.previewCards.markdown`,
        path: e.path,
      }
    : e.kind === `html`
      ? {
          id: `website:${pathToFileUrl(e.path)}`,
          type: `website`,
          title: baseName(e.path),
          subtitleId: `chat.previewCards.htmlWebsite`,
          url: pathToFileUrl(e.path),
          filePath: e.path,
        }
      : {
          id: `file:${e.kind}:${e.path}`,
          type: `file`,
          kind: e.kind,
          title: baseName(e.path),
          subtitleId: t.subtitleId,
          path: e.path,
        };
}
function previewCardDedupeKey(e: any) {
  let t = previewCardFilePath(e);
  if (t) return `file:${normalizePathSlashes(t)}`;
  try {
    let t = new URL(e.type === `website` ? e.url : ``);
    return t.pathname === `/` && !t.search && !t.hash ? `url:${t.origin}` : `url:${t.href}`;
  } catch {
    return e.id;
  }
}
function extractAssistantPreviewCards(e: any, t: any, n: any, r: any = {}) {
  if (!e.trim()) return [];
  let i = r.changedFilePaths ?? [],
    a = [],
    o = !1;
  for (let n of e.matchAll(LOCAL_URL_PATTERN)) {
    let r = stripTrailingUrlPunctuation(n[0] ?? ``);
    if (!isEmbeddableBrowserUrl(r)) continue;
    let s = resolveHtmlUrlLinkPath(r, t, i);
    ((o = !0),
      a.push({
        position: n.index ?? 0,
        card: {
          id: `website:${r}`,
          type: `website`,
          title: s === null ? (findMarkdownLinkLabelByPath(e, r) ?? resolveUrlDisplayName(r)) : baseName(s),
          subtitleId: `chat.previewCards.website`,
          url: r,
          ...(s ? { filePath: s } : {}),
        },
      }));
  }
  for (let e of n) {
    if (e.kind === `html` && o) continue;
    let n = e;
    if (e.kind === `markdown` || e.kind === `html`) {
      let r = matchLinkPathAgainstCandidates(e, i, t);
      if (!r) continue;
      n = { ...e, path: r };
    }
    a.push({ position: e.start, card: buildPreviewCardFromLink(n) });
  }
  a.sort((e: any, t: any) => t.position - e.position);
  let s = new Set(),
    c = [];
  for (let e of a) {
    let t = previewCardDedupeKey(e.card);
    if (!s.has(t) && (s.add(t), c.push(e.card), c.length === 15)) break;
  }
  return c;
}
function previewCardFilePath(e: any) {
  return e.type === `website` ? (e.filePath ?? fileUrlToPath(e.url)) : e.path;
}
function hasPreviewCardFilePath(e: any) {
  return previewCardFilePath(e) !== null;
}
var EMPTY_PREVIEW_CARD_LIST: any[] = []; // 〔A1-P1-B17〕型缝：空数组字面量推断面 any[]（bundle 110002 `var Rgt = []`）
function joinAssistantTextRows(e: any) {
  return e.map((e: any) => e.text).filter((e: any) => e.trim().length > 0).join(`

`);
}
function useAssistantPreviewCards({
  row: e,
  assistantTextRows: t,
  latestAssistantTextRow: n,
  workspacePath: r,
  fileChangesTarget: i,
  fileChangesState: a,
  fetchFileChanges: o,
}: any): any { // 〔A1-P1-B17〕型缝：解构形参 + 返回面 any（useMemo 推断面对 modules/Conversation PreviewCardModel[] 消费面 2679/2764 不兼容）
  let s = (0, React.useMemo)(() => joinAssistantTextRows(t), [t]),
    c =
      e !== void 0 && n?.rowId === e.rowId && (e.state === `complete` || e.state === `interrupted`),
    l = (0, React.useMemo)(() => (c ? extractDocumentFileLinks(s, r) : []), [c, s, r]),
    u = l.some((e: any) => e.kind === `markdown` || e.kind === `html`),
    d = (0, React.useMemo)(
      () => (i ? { rowId: i.rowId, entityId: i.entityId } : null),
      [i?.entityId, i?.rowId],
    ),
    f = d ? `${d.rowId}:${d.entityId}:${a ?? `unknown`}` : ``,
    [p, m] = (0, React.useState)<any>(null); // 〔A1-P1-B17〕型缝：泛型面运行期擦除（ConversationPaneCore@202 先例；bundle 110027 `(0, Q.useState)(null)`）
  (0, React.useEffect)(() => {
    if (!u || !o || !d || a === `reverted`) return;
    let e = !1;
    return (
      o(d, { cachePolicy: `terminal`, fileChangesState: a }).then(
        (t: any) => {
          e || m({ key: f, paths: t.state === `reverted` ? [] : t.items.map((e: any) => e.path) });
        },
        (t: any) => {
          e ||
            (logger.warn(`[AssistantPreviewCards] 读取本轮文件变更失败，已抑制 Markdown/HTML 卡片`, {
              error: t instanceof Error ? t.message : String(t),
              rowId: d.rowId,
            }),
            m({ key: f, paths: [] }));
        },
      ),
      () => {
        e = !0;
      }
    );
  }, [o, a, u, f, d]);
  let h = u && p?.key === f ? p.paths : EMPTY_PREVIEW_CARD_LIST;
  return (0, React.useMemo)(() => (c ? extractAssistantPreviewCards(s, r, l, { changedFilePaths: h }) : []), [c, h, l, s, r]);
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
  buildPreviewCardFromLink, previewCardDedupeKey, extractAssistantPreviewCards, previewCardFilePath,
  hasPreviewCardFilePath, EMPTY_PREVIEW_CARD_LIST, joinAssistantTextRows, useAssistantPreviewCards,
};
