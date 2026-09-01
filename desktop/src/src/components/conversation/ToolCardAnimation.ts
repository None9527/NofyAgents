// A1-P1-B11：工具卡入场动画缓存域逐字重建（styles js 109084–109110，共 27 行，21 处改名）。
// 真身基准（只读）：desktop/src/out/renderer/assets/styles-CdEGpc2x.js（md5 48d71d4874b0868d61fd35a328bf6ad5）。
// 落点裁定：新叶（components/conversation/ 域）。消费面 = ToolCallBlock.tsx §4.3 手写动画缓存整块 → 真实 import 收敛。
// 逐字证明：/tmp/a1r0-p1/p11/p11-roundtrip.js（AST 逆映射还原 ≡ bundle 逐字 EXACT）+ p11-leafcheck.js（正则独立路线）。
// 函数体内局部变量保留混淆名（B5 约定）；型缝 `: any` 参数缝见 p11/ToolCardAnimation.seam-log.txt，均带〔A1-P1-B11〕。
// 区段切分墓碑：Uht@109111（og 分类域依赖，未实体化）为右界；Ght@109153（ToolCallBlock 束体）在界外。
//
// 映射表（minified → 语义名 → bundle 定义行 → 属主）：
//   Fht→TOOL_CHILD_INDENT_CLASS（109084，var 链首）| Iht→STREAMING_ENTRANCE_CACHE_LIMIT（109084 链）
//   Lht→STREAMING_ENTRANCE_DURATION_MS（109084 链）| G$→streamingEntranceSeenCache（109084 链）
//   Rht→pruneStreamingEntranceCache（109088）| zht→normalizeStreamingEntranceKey（109096）
//   Bht→hasSeenStreamingEntrance（109100）| Vht→markStreamingEntranceSeen（109104）| Hht→shouldPlayStreamingEntrance（109108）
/* eslint-disable */

/* ── 工具卡入场动画缓存域（styles 109084–109110） ── */
var TOOL_CHILD_INDENT_CLASS = `ml-2 space-y-2 border-border border-l pl-3.5 border-border`,
  STREAMING_ENTRANCE_CACHE_LIMIT = 800,
  STREAMING_ENTRANCE_DURATION_MS = 1e3,
  streamingEntranceSeenCache = new Map();
function pruneStreamingEntranceCache() {
  if (streamingEntranceSeenCache.size <= STREAMING_ENTRANCE_CACHE_LIMIT) return;
  let e = Array.from(streamingEntranceSeenCache.entries())
    .sort(([, e]: any, [, t]: any) => e - t)
    .slice(0, streamingEntranceSeenCache.size - STREAMING_ENTRANCE_CACHE_LIMIT)
    .map(([e]: any) => e);
  for (let t of e) streamingEntranceSeenCache.delete(t);
}
function normalizeStreamingEntranceKey(e: any) {
  let t = e.trim();
  return t.length > 0 ? t : null;
}
function hasSeenStreamingEntrance(e: any) {
  let t = normalizeStreamingEntranceKey(e);
  return t === null || streamingEntranceSeenCache.has(t);
}
function markStreamingEntranceSeen(e: any) {
  let t = normalizeStreamingEntranceKey(e);
  t !== null && (streamingEntranceSeenCache.set(t, Date.now()), pruneStreamingEntranceCache());
}
function shouldPlayStreamingEntrance(e: any, t: any) {
  return t && !hasSeenStreamingEntrance(e);
}

export {
  TOOL_CHILD_INDENT_CLASS, STREAMING_ENTRANCE_CACHE_LIMIT, STREAMING_ENTRANCE_DURATION_MS, streamingEntranceSeenCache, pruneStreamingEntranceCache, normalizeStreamingEntranceKey,
  hasSeenStreamingEntrance, markStreamingEntranceSeen, shouldPlayStreamingEntrance,
};
