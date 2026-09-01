// A1-P1-B11：交互自动解决倒计时域逐字重建（styles js 115978–115992，共 15 行，7 处改名）。
// 真身基准（只读）：desktop/src/out/renderer/assets/styles-CdEGpc2x.js（md5 48d71d4874b0868d61fd35a328bf6ad5）。
// 落点裁定：新叶（components/conversation/ 域）。消费面 = ElicitationDialog.tsx rxt/ixt 双 declare → 真实 import 收敛。
// 逐字证明：/tmp/a1r0-p1/p11/p11-roundtrip.js（AST 逆映射还原 ≡ bundle 逐字 EXACT）+ p11-leafcheck.js（正则独立路线）。
// 函数体内局部变量保留混淆名（B5 约定）；型缝 `: any` 参数缝见 p11/InteractionCountdown.seam-log.txt，均带〔A1-P1-B11〕。
// 区段切分墓碑：nxt@115964（interaction origin 徽章，G/uJ 依赖）在界外；axt@115993（倒计时 hook，Q/window 依赖）为右界。
//
// 映射表（minified → 语义名 → bundle 定义行 → 属主）：
//   q1→AUTO_RESOLUTION_WINDOW_MS（115978，var 链首）| J1→PLAN_APPROVAL_OPTION_VALUE（115978 链）
//   rxt→resolveAutoResolutionCountdown（115980）| ixt→nextAutoResolutionTickDelay（115985）
/* eslint-disable */

/* ── 交互自动解决倒计时域（styles 115978–115992） ── */
var AUTO_RESOLUTION_WINDOW_MS = 6e4,
  PLAN_APPROVAL_OPTION_VALUE = `approve`;
function resolveAutoResolutionCountdown(e: any, t: any) {
  if (!e || e.state === `snoozed`) return null;
  let n = e.deadlineAt - t;
  return n <= 0 || n >= AUTO_RESOLUTION_WINDOW_MS ? null : Math.max(1, Math.floor(n / 1e3));
}
function nextAutoResolutionTickDelay(e: any, t: any) {
  if (!e || e.state === `snoozed`) return null;
  let n = e.deadlineAt - t;
  if (n <= 0) return null;
  if (n >= AUTO_RESOLUTION_WINDOW_MS) return n - (AUTO_RESOLUTION_WINDOW_MS - 1);
  let r = Math.max(1, Math.floor(n / 1e3));
  return r <= 1 ? n : Math.max(1, n - (r * 1e3 - 1));
}

export {
  AUTO_RESOLUTION_WINDOW_MS, PLAN_APPROVAL_OPTION_VALUE, resolveAutoResolutionCountdown, nextAutoResolutionTickDelay,
};
