// A1-P1-B12：滚动遮罩域逐字重建（styles js 64639–64657，共 19 行，13 处改名）。
// 真身基准（只读）：desktop/src/out/renderer/assets/styles-CdEGpc2x.js（md5 48d71d4874b0868d61fd35a328bf6ad5）。
// 落点裁定：新叶（components/conversation/ 域）。消费面 = ToolCallBlock.tsx computeScrollMask/scrollMaskStyle 双 declare
//   + 手写 EMPTY_SCROLL_MASK const → 真实 import 收敛（ScrollMaskState 接口为类型面遗留，保留）。
// 逐字证明：/tmp/a1r0-p1/p12/p12-roundtrip.js（AST 逆映射还原 ≡ bundle 逐字 EXACT）+ p12-leafcheck.js（正则独立路线）。
// 函数体内局部变量保留混淆名（B5 约定）；型缝 `: any` 参数缝见 p12/ToolScrollMask.seam-log.txt，均带〔A1-P1-B12〕。
// 区段切分墓碑：gV@64636（TokenSource 判定）在界外；pJe@64658（命令面板行高常量族）为右界。
//
// 映射表（minified → 语义名 → bundle 定义行 → 属主）：
//   _V→SCROLL_MASK_FADE_PX（64639 链）| vV→SCROLL_MASK_THRESHOLD_PX（链）| yV→EMPTY_SCROLL_MASK（链）
//   bV→computeScrollMask（64642）| xV→scrollMaskStyle（64646）
/* eslint-disable */

/* ── 滚动遮罩域（styles 64639–64657） ── */
var SCROLL_MASK_FADE_PX = 24,
  SCROLL_MASK_THRESHOLD_PX = 1,
  EMPTY_SCROLL_MASK = { showBottom: !1, showTop: !1 };
function computeScrollMask({ clientHeight: e, scrollHeight: t, scrollTop: n }: any) {
  let r = Math.max(0, t - e);
  return r <= SCROLL_MASK_THRESHOLD_PX ? EMPTY_SCROLL_MASK : { showTop: n > SCROLL_MASK_THRESHOLD_PX, showBottom: n < r - SCROLL_MASK_THRESHOLD_PX };
}
function scrollMaskStyle({ showBottom: e, showTop: t }: any) {
  if (!t && !e) return;
  let n = `linear-gradient(to bottom, ${t ? `transparent 0px, black ${SCROLL_MASK_FADE_PX}px` : `black 0px, black ${SCROLL_MASK_FADE_PX}px`}, ${e ? `black calc(100% - ${SCROLL_MASK_FADE_PX}px), transparent 100%` : `black calc(100% - ${SCROLL_MASK_FADE_PX}px), black 100%`})`;
  return {
    WebkitMaskImage: n,
    maskImage: n,
    WebkitMaskRepeat: `no-repeat`,
    maskRepeat: `no-repeat`,
    WebkitMaskSize: `100% 100%`,
    maskSize: `100% 100%`,
  };
}

export {
  SCROLL_MASK_FADE_PX, SCROLL_MASK_THRESHOLD_PX, EMPTY_SCROLL_MASK, computeScrollMask, scrollMaskStyle,
};
