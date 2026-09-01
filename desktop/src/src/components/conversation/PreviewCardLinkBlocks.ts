// A1-P1-B15：预览卡可嵌入 URL 判定域逐字重建（styles js 109817–109847，共 31 行，6 处改名）。
// 真身基准（只读）：desktop/src/out/renderer/assets/styles-CdEGpc2x.js（md5 48d71d4874b0868d61fd35a328bf6ad5）。
// 落点裁定：新叶（B14 留批「PreviewCards 余五件」重评之 isEmbeddableBrowserUrl 解锁面：自闭合零依赖，可收）。
//   消费面 components/conversation/PreviewCards declare isEmbeddableBrowserUrl（原 o1）墓碑改指本叶。
// 逐字证明：/tmp/a1r0-p1/p15/p15-roundtrip.js（AST 逆映射还原 ≡ bundle 逐字 EXACT）+ p15-leafcheck.js（正则独立路线）。
// 函数体内局部变量保留混淆名（B5 约定）；型缝 `: any` 参数缝见 p15/seams-PreviewCardLinkBlocks.json，均带〔A1-P1-B15〕。
// 区段切分墓碑：左界 Sgt var 链@109817（链接抽取域 xgt@109771 右界邻接，留批）；右界 o1@109847 闭包末
//   （Egt@109848 链接文本域邻接，留批）；Tgt 同 var 链整句携带（消费面 jgt@109889 留批）。
// 映射表（minified → 语义名 → bundle 定义行）：
//   Sgt→LOCAL_URL_PATTERN（109817）| Cgt→EMBEDDABLE_LOCAL_URL_PATTERN（109819）| wgt→EMBEDDABLE_FILE_URL_PATTERN（109821）
//   Tgt→MARKDOWN_LINK_PATTERN（109823）| a1→stripTrailingUrlPunctuation（109824）| o1→isEmbeddableBrowserUrl（109827）
/* eslint-disable */

/* ── 预览卡可嵌入 URL 判定域（styles 109817–109847） ── */
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

export { LOCAL_URL_PATTERN, EMBEDDABLE_LOCAL_URL_PATTERN, EMBEDDABLE_FILE_URL_PATTERN, MARKDOWN_LINK_PATTERN, stripTrailingUrlPunctuation, isEmbeddableBrowserUrl };
