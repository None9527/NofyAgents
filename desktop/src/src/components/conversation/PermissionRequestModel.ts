// A1-P1-B11：权限请求归一域逐字重建（styles js 106564–106655，共 92 行，42 处改名）。
// 真身基准（只读）：desktop/src/out/renderer/assets/styles-CdEGpc2x.js（md5 48d71d4874b0868d61fd35a328bf6ad5）。
// 落点裁定：新叶（components/conversation/ 域）。消费面 = PermissionApprovalOverlay.tsx Xpt declare → 真实 import 收敛。
// 逐字证明：/tmp/a1r0-p1/p11/p11-roundtrip.js（AST 逆映射还原 ≡ bundle 逐字 EXACT）+ p11-leafcheck.js（正则独立路线）。
// 函数体内局部变量保留混淆名（B5 约定）；型缝 `: any` 参数缝见 p11/PermissionRequestModel.seam-log.txt，均带〔A1-P1-B11〕。
// 区段切分墓碑：Zpt@106656（权限工具图标元素，Rbe=wrench 未实体化）为本区右界；Qpt@106657 权限卡束体未实体化。
//
// 映射表（minified → 语义名 → bundle 定义行 → 属主）：
//   u$→isPlainRecordObject（106564）| d$→trimmedTokenOrNull（106567）| Upt→extractPermissionRawToolName（106570）
//   Wpt→normalizePermissionToken（106578）| Gpt→isZcodeCuaToken（106581）| Kpt→isRequestAccessToken（106585）
//   qpt→collectPermissionIdentityTokens（106588）| Jpt→tryParseJsonText（106591）
//   f$→containsAccessibilityMarker（106601）| p$→containsAccessibilityDenialMarker（106617）
//   Ypt→hasAccessibilityDenialEvidence（106649）| Xpt→isSwitchModePermissionRequest（106652）
/* eslint-disable */

/* ── 权限请求归一域（styles 106564–106655） ── */
function isPlainRecordObject(e: any) {
  return typeof e == `object` && !!e && !Array.isArray(e);
}
function trimmedTokenOrNull(e: any) {
  return typeof e == `string` && e.trim().length > 0 ? e.trim() : null;
}
function extractPermissionRawToolName(e: any) {
  return isPlainRecordObject(e)
    ? (trimmedTokenOrNull(e.toolName) ??
        trimmedTokenOrNull(e.tool_name) ??
        trimmedTokenOrNull(e.name) ??
        (isPlainRecordObject(e._meta) && isPlainRecordObject(e._meta.zcode) ? trimmedTokenOrNull(e._meta.zcode.toolName) : null))
    : null;
}
function normalizePermissionToken(e: any) {
  return e?.trim().toLowerCase().replace(/_/g, `-`) ?? ``;
}
function isZcodeCuaToken(e: any) {
  let t = normalizePermissionToken(e);
  return t === `zcode-cua` || t.startsWith(`mcp--zcode-cua--`);
}
function isRequestAccessToken(e: any) {
  return normalizePermissionToken(e).includes(`request-access`);
}
function collectPermissionIdentityTokens(e: any) {
  return [trimmedTokenOrNull(e.toolName), trimmedTokenOrNull(e.kind), trimmedTokenOrNull(e.title), extractPermissionRawToolName(e.raw)].filter((e: any) => e !== null);
}
function tryParseJsonText(e: any) {
  if (typeof e != `string`) return e;
  let t = e.trim();
  if (!t.startsWith(`{`) && !t.startsWith(`[`)) return e;
  try {
    return JSON.parse(t);
  } catch {
    return e;
  }
}
function containsAccessibilityMarker(e: any, t: any = 0): any {
  if (t > 8 || e == null) return !1;
  let n = tryParseJsonText(e);
  return typeof n == `string`
    ? /accessibility|辅助功能|screen[_ -]?recording|screen[_ -]?capture|屏幕录制/i.test(n)
    : Array.isArray(n)
      ? n.some((e: any) => containsAccessibilityMarker(e, t + 1))
      : isPlainRecordObject(n)
        ? Object.entries(n).some(
            ([e, n]: any) =>
              /accessibility|辅助功能|screen[_ -]?recording|screen[_ -]?capture|屏幕录制/i.test(
                e,
              ) || containsAccessibilityMarker(n, t + 1),
          )
        : !1;
}
function containsAccessibilityDenialMarker(e: any, t: any = 0): any {
  if (t > 8 || e == null) return !1;
  let n = tryParseJsonText(e);
  if (typeof n == `string`)
    return (
      /accessibility|辅助功能|screen[_ -]?recording|screen[_ -]?capture|屏幕录制/i.test(n) &&
      /(denied|not granted|permission|action_required|zcode cua helper|未授权|没有获得)/i.test(n)
    );
  if (Array.isArray(n)) return n.some((e: any) => containsAccessibilityDenialMarker(e, t + 1));
  if (!isPlainRecordObject(n)) return !1;
  for (let [e, r] of Object.entries(n)) {
    let n = typeof r == `string` ? r.toLowerCase() : null,
      i = e.toLowerCase();
    if (
      (i === `accessibility` && r === !1) ||
      (i === `input_permission` && n === `denied`) ||
      (i === `screen_recording` && n !== null && n !== `granted`) ||
      (i === `screen_capture_available` && r === !1) ||
      (i === `status_after` && n === `denied`) ||
      (i === `action_required` && n?.includes(`accessibility`)) ||
      (i === `missing` &&
        Array.isArray(r) &&
        r.some((e: any) => e === `accessibility` || e === `screen_recording`)) ||
      (i === `blocked_by` &&
        Array.isArray(r) &&
        (r.includes(`accessibility`) || r.includes(`screen_recording`))) ||
      containsAccessibilityDenialMarker(r, t + 1)
    )
      return !0;
  }
  return !1;
}
function hasAccessibilityDenialEvidence(e: any) {
  return collectPermissionIdentityTokens(e).some(isZcodeCuaToken) ? containsAccessibilityDenialMarker(e.output) || containsAccessibilityDenialMarker(e.error) : !1;
}
function isSwitchModePermissionRequest(e: any) {
  let t = collectPermissionIdentityTokens({ kind: e.kind, title: e.title, raw: e.raw });
  return t.some(isZcodeCuaToken) ? t.some(isRequestAccessToken) || containsAccessibilityMarker(e.description) || containsAccessibilityMarker(e.raw) : !1;
}

export {
  isPlainRecordObject, trimmedTokenOrNull, extractPermissionRawToolName, normalizePermissionToken, isZcodeCuaToken, isRequestAccessToken,
  collectPermissionIdentityTokens, tryParseJsonText, containsAccessibilityMarker, containsAccessibilityDenialMarker, hasAccessibilityDenialEvidence, isSwitchModePermissionRequest,
};
