// A1-P3-B2：会话注册表订阅基建逐字补面（styles js 35443–35454 + 35526–35551，双子区 38 行）。
// 真身基准（只读）：desktop/src/out/renderer/assets/styles-CdEGpc2x.js（md5 48d71d4874b0868d61fd35a328bf6ad5）。
// 属主普查裁定：35405–35523 子区（zS/BS/VS/HS/QAe/XAe/LS/RS）已由 services/sessionIndex.ts（A0-S4-5，
//   原 js 34981–35478 旧版行号）语义重建并经 modules/services 转导出（SessionIndexStore/sessionIndexPoolKey/
//   acquireSessionIndexStore/releaseSessionIndexStore/WorkspaceSubscriptionSet）——不重复立逐字孪生，
//   直连接 canonical；逐字真身缺位面仅余 US/ZAe（35443–35454）与 WS/GS/$Ae/KS/qS/eje（35526–35551），本叶转录。
// 转录机制：AST 精确改名（14 处：自由符 BS 引用 1 + 顶层引用 3 + 顶层声明 8 + 续锚 2），往返核对
//   ROUNDTRIP EXACT（38 行）在案（/tmp/a1r0-p3/p3b2-roundtrip.js）；体内 10 局部保留混淆名（B5 约定）。
// 型缝 10 处全型层 P1（顶层函数参数宽化 :any，真身缺位调用面逐字优先）；缝清单见各参数位。
//
// 〔A1-P3-B3〕US/ZAe 归一：canonical 迁 services/sessionIndex §B5-transport（zS/oAe 同批转录段），
//   本叶 US/ZAe 实体墓碑 + 再导出（导出面不变；同形证据见 A1-P3-B3.report.md §四）。
// 映射表（minified → 语义名 → bundle 定义行）：
//   【区内顶层（US/ZAe 改再导出；余为本叶实体）】
//   US→scopeSubscriptionLabel(35443) | ZAe→sameScopeSubscriptionEntry(35446)
//   WS→sessionScopeWorkspaceKey(35526) | GS→sessionStoreKey(35529) | $Ae→storeKeyOfRegistrySession(35532)
//   KS→resolveSessionScope(35535) | qS→sessionSubscriptionKey(35543) | eje→isSessionStoreHydrating(35546)
//   【真实 import（直连）】
//   BS→sessionIndexPoolKey（services/sessionIndex 499 逐字同形；modules/services 转导出）
//   【同族已语义重建（他叶直连，非本叶）】
//   XAe→SessionIndexStore | VS→acquireSessionIndexStore | HS→releaseSessionIndexStore
//   QAe→WorkspaceSubscriptionSet | zS/oAe→createWorkspaceSessionIndexTransport（sessionIndex 内仍 declare，留批）
/* eslint-disable */
import { sessionIndexPoolKey } from '../../modules/services'; // 原 BS（styles 35408；services/sessionIndex 499 逐字同形）

/* ── tombstone（A1-P3-B3）：scopeSubscriptionLabel/sameScopeSubscriptionEntry（原 US/ZAe，
 *    styles 35443–35454）本地逐字实体删除——canonical 位随 zS/oAe 转录段落 services/sessionIndex
 *    §B5-transport（同区段同真身，避免逐字双实体）；本叶改再导出，导出面不变。 ── */
export { scopeSubscriptionLabel, sameScopeSubscriptionEntry } from '../../services/sessionIndex';
function sessionScopeWorkspaceKey(e: any) {
  return e.workspaceIdentity?.trim() || e.workspacePath;
}
function sessionStoreKey(e: any) {
  return sessionIndexPoolKey({ workspaceKey: sessionScopeWorkspaceKey(e), ...(e.endpointKey ? { endpointKey: e.endpointKey } : {}) });
}
function storeKeyOfRegistrySession(e: any) {
  return sessionStoreKey(e);
}
function resolveSessionScope(e: any) {
  return {
    workspaceKey: sessionScopeWorkspaceKey(e),
    workspacePath: e.workspacePath,
    ...(e.workspaceIdentity ? { workspaceIdentity: e.workspaceIdentity } : {}),
    ...(e.endpointKey ? { endpointKey: e.endpointKey } : {}),
  };
}
function sessionSubscriptionKey(e: any, t: any) {
  return `${sessionIndexPoolKey(resolveSessionScope(e), t)}\0path:${e.workspacePath}`;
}
function isSessionStoreHydrating(e: any) {
  return (
    e.getState().workspaceId === null &&
    (e.getStatus() === `idle` || e.getStatus() === `connecting`)
  );
}

export {
  sessionScopeWorkspaceKey, sessionStoreKey,
  storeKeyOfRegistrySession, resolveSessionScope, sessionSubscriptionKey, isSessionStoreHydrating,
}; // scopeSubscriptionLabel/sameScopeSubscriptionEntry 已于上方再导出（A1-P3-B3 归一）
