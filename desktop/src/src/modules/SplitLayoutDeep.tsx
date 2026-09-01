/* eslint-disable */
/**
 * ============================================================================
 * SplitLayoutDeep.tsx — A1-R2：styles chunk 面板布局 + 会话路由引擎逐字重建
 * ============================================================================
 *
 * 来源文件（融合 chunk，本工作区现行 213,979 行，只读未改动）：
 *   desktop/src/out/renderer/assets/styles-CdEGpc2x.js
 * 对照文件（同一 chunk 的 pretty-print 版，170,400 行）：
 *   desktop/src/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx
 *
 * 解码范围（本文件 = 引擎逻辑/store 层；行号 = 现行 out js 行）：
 *   js 121373–121720  面板布局模型 + 持久化 + splitLayoutStore（s2）
 *   js 122201 尾段     nTt/g2/_2/v2（原与 tTt 同 var 链；tTt 分割条 UI 属表现层，
 *                     本批未转录，四常量按原值提出，见 §尾注）
 *   js 122309–122714  会话路由模型 + sessionRouterStore（A2）
 *   js 122716–122819  路由选择器/钩子（ETt…NTt）
 *   js 123197、123207–123219、123309–123316、123411、123457–123484
 *                     远端会话条目判定最小面（WTt/M2/N2/R2）+ persistableTabEntries（sEt）
 *                     + lastWorkspaceSession 读取面（V2/cEt/lEt）
 *
 * 本批未转录（表现层/他域，均不与本文件成环；精确清单见 A1-R2.report.md §尾）：
 *   js 121301–121372  owt=StackedConversationPane（薄壳，依赖外域 wFe(42798)/R0(119236)）
 *   js 121722–121908  布局几何 + 会话拖放（c2…Ywt，仅表现层消费）
 *   js 121909–122198  面板容器/渲染器（Xwt/Zwt/Qwt/$wt/eTt）
 *   js 122198–122201  tTt 分割条拖动组件（nTt/g2/_2/v2 已提出）
 *   js 122820–123136  PTt 工作台 Provider UI + FTt/ITt/LTt context
 *   styles 123139–123193  RTt…HTt last-session 恢复钩子域
 *   js 123222–123306、123362–123405、123411 以外远端条目域余量（JTt…B2、iEt/z2/aEt/oEt）
 *   js 123487 起      uEt/H2/U2 = SSH 对话框 + ConfirmDialog（他域属主；A1-R5 裁决：
 *                     uEt → modules/RemoteConnectionDeep.tsx 转录；H2/U2 canonical =
 *                     components/modals/ConfirmDialog.tsx + stores/confirmDialogStore.ts）
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号格式：现行 out js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 * [A] 面板布局模型（js 121373–121528 / jsx 103128–103283）：
 *   swt → readNavigationEntries          (121373 / 103128)
 *   z0  → isReloadNavigationEntry        (121382 / 103137)  消费侧 declare 名同
 *   B0  → MAIN_PANE_ID                   (121385 / 103140)  `workspace-main`
 *   cwt → MIN_SPLIT_RATIO                (121386 / —)       0.25
 *   lwt → MAX_SPLIT_RATIO                (121387 / —)       0.75
 *   V0  → DEFAULT_SPLIT_RATIO            (121388 / —)       0.5
 *   H0  → clampSplitRatio                (121389 / 103144)
 *   U0  → workspaceScopeKey              (121392 / 103147)
 *   W0  → paneBindingMatchesSession      (121395 / 103150)
 *   G0  → PRIMARY_PANE_LEAF              (121398 / 103153)
 *   K0  → EMPTY_PANE_LAYOUT              (121399 / 103154)  消费侧 declare 名同
 *   q0  → collectLeafPaneIds             (121400 / 103155)
 *   J0  → countLayoutPanes               (121403 / 103158)
 *   Y0  → canAddLayoutPane               (121406 / 103161)  <4
 *   X0  → layoutHasPaneId                (121409 / 103164)
 *   Z0  → focusedPaneId                  (121412 / 103167)  消费侧 declare 名同
 *   uwt → nextLeafPaneId                 (121415 / 103170)
 *   Q0  → collectSplitNodeIds            (121423 / 103178)
 *   dwt → nextSplitNodeId                (121426 / 103181)
 *   $0  → replacePaneNode                (121434 / 103189)
 *   e2  → removePaneNode                 (121440 / 103195)
 *   t2  → setPaneNodeRatio               (121447 / 103202)
 *   fwt → splitPaneInLayout              (121454 / 103209)
 *   n2  → splitPaneBesideInLayout        (121467 / 103222)
 *   pwt → closePaneInLayout              (121483 / 103238)
 *   mwt → bindPaneSessionInLayout        (121492 / 103247)
 *   hwt → replacePaneBindingInLayout     (121498 / 103253)
 *   gwt → findPaneIdBySessionInLayout    (121503 / 103258)
 *   _wt → setLayoutSplitRatio            (121507 / 103262)
 *   r2  → focusLayoutPane                (121511 / 103266)
 *   vwt → confirmRestoredPaneInLayout    (121514 / 103269)
 *   ywt → openSessionInLayout            (121523 / 103278)
 * [B] 布局持久化 + store（js 121529–121720 / jsx 103284–103475）：
 *   bwt → PANE_LAYOUT_STORAGE_KEY_V2     (121529 / 103284)  `zcode-v4-pane-layout:v2`
 *   xwt → PANE_LAYOUT_STORAGE_KEY_V1     (121530 / —)       `zcode-v4-pane-layout:v1`
 *   i2  → LEGACY_SPLIT_PANE_ID           (121531 / —)       `split`
 *   a2  → parsePaneNode                  (121532 / 103287)
 *   Swt → parsePaneWorkspaceScope        (121561 / 103316)
 *   Cwt → parseStoredPaneLayout          (121576 / 103331)
 *   wwt → isAbsoluteWorkspacePath        (121607 / 103362)
 *   Twt → parseLegacyPaneLayout          (121610 / 103365)
 *   Ewt → loadStoredPaneLayout           (121636 / 103391)
 *   o2  → clonePaneNode                  (121646 / 103401)
 *   Dwt → lastSerializedPaneLayout       (121658 / 103413)  模块级缓存
 *   Owt → persistPaneLayout              (121659 / 103414)
 *   kwt → storedPaneLayout               (121681 / 103436)  模块级快照
 *   Awt → restoredPaneLayout             (121682 / —)       reload 时启用
 *   jwt → hasSplitLayoutBindings         (121683 / 103515)  消费侧 declare 名同
 *   s2  → splitLayoutStore               (121686 / 103518)  消费侧 declare 名同
 * [C] 会话路由模型 + store（js 122201 尾 + 122309–122714 / jsx 103975–104445）：
 *   nTt → ROUTER_STORAGE_KEY             (122306 / 103972)  `zcode-v4-session-workbench-groups:v1`
 *   g2  → EMPTY_ROUTER_STATE             (122307 / 103973)
 *   _2  → workbenchClientMode            (122308 / 103974)  模块级（初值 desktop-continuous）
 *   v2  → routerStateHydrated            (122308 / 103974)  模块级
 *   y2  → isWorkbenchRouterEnabled       (122309 / 103975)
 *   b2  → sessionBindingIndexKey         (122312 / 103978)
 *   x2  → paneBindingIndexKey            (122315 / 103981)
 *   S2  → sameSessionBinding             (122318 / 103984)
 *   rTt → toRestorableSessionBinding     (122321 / 103987)
 *   C2  → toSessionBindingOrNull         (122329 / 103999)
 *   w2  → groupSessionBindings           (122339 / 104011)
 *   iTt → groupContainsBinding           (122342 / 104014)
 *   T2  → paneBindingById                (122346 / 104018)  消费侧 declare 名 paneById
 *   E2  → focusedGroupBinding            (122349 / 104021)
 *   aTt → findGroupPaneIdByBinding       (122352 / 104024)
 *   oTt → nextGroupId                    (122357 / 104029)
 *   sTt → createSessionGroup             (122365 / 104037)
 *   cTt → groupFromPaneLayout            (122381 / 104053)
 *   lTt → focusGroupPane                 (122401 / 104073)
 *   uTt → splitGroupPaneBeside           (122405 / 104077)
 *   dTt → closeGroupPane                 (122416 / 104088)
 *   fTt → confirmGroupRestoredSession    (122428 / 104100)
 *   pTt → buildGroupSessionIndex         (122439 / 104111)
 *   D2  → withUpsertedGroup              (122444 / 104147)
 *   mTt → withRemovedGroup               (122448 / 104151)
 *   hTt → withSessionSplitIntoGroup      (122459 / 104162)
 *   gTt → withPromotedPaneLayoutGroup    (122469 / 104172)
 *   _Tt → withFocusedSessionBinding      (122475 / 104178)
 *   vTt → withGroupPaneSessionBound      (122485 / 104188)
 *   yTt → routerSafeLocalStorage         (122505 / 104208)
 *   O2  → isPlainRecord                  (122512 / 104240)
 *   k2  → parseRouterPaneNode            (122515 / 104243)
 *   bTt → parseRouterWorkspaceScope      (122533 / 104261)
 *   xTt → parseRouterRestoredBinding     (122542 / 104270)
 *   STt → parseStoredSessionGroup        (122547 / 104275)
 *   CTt → parseStoredRouterState         (122574 / 104302)
 *   wTt → persistRouterState             (122597 / 104325)
 *   TTt → loadStoredRouterState          (122625 / 104353)
 *   A2  → sessionRouterStore             (122636 / 104365)  消费侧 declare 名同
 * [D] 路由选择器/钩子（js 122716–122819 / jsx 104446–104549）：
 *   ETt → toSessionBindingFromScope      (122716 / 104446)
 *   DTt → hasSplitPaneBindingFor         (122720 / 104450)
 *   OTt → resolveSplitSessionPlan        (122726 / 104456)
 *   kTt → isSplitPlanActionable          (122756 / 104486)
 *   ATt → canOpenSessionInSplit          (122759 / 104489)  消费侧 declare 名同
 *   jTt → openSessionInSplit             (122762 / 104492)  消费侧 declare 名同
 *   MTt → openSessionBesideDraft         (122791 / 104521)  消费侧 declare 名同
 *   NTt → toPersistableSessionBinding    (122812 / 104542)
 * [E] 远端条目最小面 + persistableTabEntries（js 123197–123484 选段）：
 *   WTt → REMOTE_SESSION_HISTORY_LIMIT   (123197 / 104886)  20
 *   M2  → remoteTargetCredentialKeys     (123207 / 104897)
 *   N2  → isRemoteSessionEntry           (123216 / 104900)
 *   R2  → sessionEntryWorkspaceKey       (123306 / 104991)
 *   sEt → persistableTabEntries          (123457 / 105169)  消费侧 declare 名同
 *   V2  → lastWorkspaceSessionEntries    (123475 / 105186)
 *   cEt → lastRemoteSessionEntries       (123478 / 105189)
 *   lEt → sessionEntryMapByKey           (123481 / 105192)
 * [F] 远端条目域余量（styles 123198–123456；A1-R4）：
 *   GTt → remotePasswordCredentialKey    (123198)
 *   KTt → remotePrivateKeyPassphraseCredentialKey (123201)
 *   qTt → remoteServerTokenCredentialKey (123204)
 *   P2  → trimmedRemoteUser              (123219)
 *   JTt → wslConnectionKey               (123222)
 *   YTt → serverDisplayName              (123232)
 *   F2  → serverUrlHost                  (123235)
 *   XTt → remoteTargetDisplayLabel       (123242)  消费侧 declare 名同（TopBar/Home）
 *   ZTt → remoteTargetConnectionAddress  (123256)
 *   QTt → sshDecoratedProjectName        (123268)  消费侧 declare 名同（TopBar/Sidebar）
 *   $Tt → normalizeRemoteEntryPath       (123273)
 *   eEt → remoteTargetConnectionKey      (123277)  server 支真实消费 Je
 *   I2  → buildRemoteWorkspaceKey        (123295)  server 支真实消费 Je
 *   tEt → resolveServerIdentity          (123300)
 *   L2  → resolveEntryWorkspaceIdentity  (123303)
 *   nEt → trimmedOrUndefined             (123309)
 *   rEt → findRemoteSessionEntry         (123312)
 *   iEt → normalizeRemoteTargetForConnection (123316)
 *   z2  → remoteTargetWithSecrets        (123362)
 *   aEt → touchRemoteSessionEntry        (123397)
 *   oEt → removeRemoteSessionEntries     (123403)
 *   B2  → applyRemoteConnectionResult    (123416)
 *   RBt → sshHostLabel                   (158183)  A1-R5：Sidebar 会话行消费面
 *   zBt → resolveSshConnectionInfo       (158186)  A1-R5：同上；RBt ≢ ZTt（含 username、port 恒在）
 *   Hn  →（A1-R7 更正：canonical = SrcSharedA/lib workspaceUtils.sanitizeWorkspaceDescriptor，
 *         A0-S4-1 已落地；R6 §F-R6 重复转录已删除）
 *   V2  → persistedWorkspaceSessions     (styles 123475)  A1-R7：恢复条目读取
 *   cEt → persistedRemoteSessions        (styles 123478)  A1-R7：恢复条目远程过滤
 *   Bne → resolveLastActiveTabIndex      (src 9624–9628 VC，t-as-Bne 两跳；BC 9620–9623 内部助手)  A1-R7
 *
 * ----------------------------------------------------------------------------
 * 二、跨 chunk / 跨区依赖（全部经真实 import，无本文件内 declare）
 * ----------------------------------------------------------------------------
 *   Ae → ../stores/zustand `create`（skillStore chunk q 导出）
 *   oc → ./WorkspaceTabsDeep `isWorkspaceKindTab`（A1-R1 重建，styles js 4487）
 *   J  → ./logger `t`（logger-PFDwl5Yq.js t 导出）
 *   Je → ./SrcSharedB `buildRemoteServerWorkspaceKey`（src chunk xh，js 7963）
 *   环安全：本文件仅被消费侧（AppRootLeaves/WorkspaceShell/OnboardingLoginLeaves；
 *   R3 追加 SplitLayoutUiDeep/stores-session shim 两消费面）单向引用；上述依赖方
 *   均不反向 import 本文件，无成环。
 *   R3 导出宽化（行注各就其位）：H0/W0/q0/J0/Y0/X0/gwt/bwt/xwt/nTt/y2/b2/E2/dTt
 *   由内部转导出，供 stores/splitLayoutStore.ts、stores/sessionRouterStore.ts 之
 *   re-export shim 与 SplitLayoutUiDeep（PTt 域）消费；函数体未动。
 * ============================================================================
 */

import * as React from "react"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { create as createStore } from "../stores/zustand"; // 原 Ae
import { isWorkspaceKindTab } from "./WorkspaceTabsDeep"; // 原 oc（A1-R1）
import { t as logger } from "./logger"; // 原 J
import { buildRemoteServerWorkspaceKey } from "./SrcSharedB"; // 原 Je（src chunk xh）

/* ============================================================================
 * §0. 型别（按 bundle 调用面归纳）
 * ==========================================================================*/

/** 面板工作区作用域（U0/Swt/bTt 返回面）。
 * 型注：用 type 别名（非 interface）以获隐式索引签名，供消费侧宽松面（含
 * [key:string]:any 的本地型）赋值；workspaceIdentity 宽化为 string | null
 * （与消费侧宽松面及 bundle 空合用法一致，内部读取均经 ?./typeof 防御）。 */
export type PaneWorkspaceScope = {
  workspacePath: string;
  workspaceIdentity?: string | null;
  remoteSessionId?: string;
};

/** 面板树节点（叶/分割二元递归）。 */
export type PaneNode =
  | { type: `leaf`; paneId: string }
  | { type: `split`; id: string; direction: `row` | `column`; ratio: number; first: PaneNode; second: PaneNode };

/** 分割布局面板绑定（s2 域；sessionId 可空；readOnly 为 C2 防御读取面）。
 * 型注：type 别名（隐式索引签名，供消费侧宽松面赋值）。 */
export type PaneBinding = {
  workspaceScope: PaneWorkspaceScope;
  sessionId: string | null;
  readOnly?: boolean;
  restoredUnvalidated?: boolean;
};

/** 分割布局状态（K0 面 + s2 store 面）。
 * 型注：type 别名（消费侧 AppRootLeaves/OnboardingLoginLeaves 以含
 * [key:string]:any 的本地宽松面接收 getState()/K0，需隐式索引签名）。 */
export type PaneLayoutState = {
  root: PaneNode;
  panes: Record<string, PaneBinding>;
  focusedPaneId: string;
};

/** 会话绑定（路由域；sessionId 必填）。型注：同上面别名规约。 */
export type SessionBinding = {
  workspaceScope: PaneWorkspaceScope;
  sessionId: string;
  readOnly?: boolean;
  restoredUnvalidated?: boolean;
};

/** 会话路由组。型注：同上面别名规约（消费侧以宽松面接收 groups 值）。 */
export type SessionRouterGroup = {
  id: string;
  primaryBinding: SessionBinding;
  root: PaneNode;
  panes: Record<string, SessionBinding>;
  focusedPaneId: string;
  updatedAt: number;
};

/** 路由状态数据面（g2）。型注：同上面别名规约。 */
export type SessionRouterData = {
  activeGroupId: string | null;
  groups: Record<string, SessionRouterGroup>;
  sessionIndex: Record<string, string>;
};

/** splitLayoutStore（s2）全状态面。型注：交叉别名（保留隐式索引签名）。 */
export type SplitLayoutStoreState = PaneLayoutState & {
  splitPane(paneId: string, direction: `row` | `column`, workspaceScope: PaneWorkspaceScope): void;
  splitPaneWithBinding(anchorPaneId: string, side: string, binding: PaneBinding): void;
  openSessionInNewPane(workspaceScope: PaneWorkspaceScope, sessionId: string): void;
  replacePaneBinding(paneId: string, binding: PaneBinding): void;
  closePane(paneId: string): void;
  focusPane(paneId: string): void;
  bindPaneSession(paneId: string, sessionId: string): void;
  setSplitRatio(splitId: string, ratio: number): void;
  confirmRestoredPaneSession(paneId: string): void;
  resetToPrimaryPane(): void;
};

/** sessionRouterStore（A2）全状态面。型注：交叉别名（保留隐式索引签名）。 */
export type SessionRouterStoreState = SessionRouterData & {
  configureClientMode(mode: string): void;
  openSessionFromSidebar(binding: SessionBinding): void;
  splitSessionIntoGroup(anchorPaneId: string, side: string, binding: SessionBinding, primaryBinding?: SessionBinding): void;
  promotePaneLayoutToGroup(binding: SessionBinding, splitLayout: PaneLayoutState): boolean;
  focusPane(groupId: string, paneId: string): void;
  closePane(groupId: string, paneId: string): void;
  confirmRestoredPaneSession(groupId: string, paneId: string): void;
  bindPaneSession(groupId: string, paneId: string, sessionId: string): void;
  setSplitRatio(groupId: string, splitId: string, ratio: number): void;
  isSessionGrouped(workspaceScope: PaneWorkspaceScope, sessionId: string | null): boolean;
  getActiveContext(): SessionBinding | null;
  deactivateActiveGroup(): void;
  resetWorkbenchGroups(): void;
};

/** 远端会话条目（N2/R2/M2/sEt 消费面）。
 * 型注：type 别名；workspaceIdentity 宽化 string | null（条目数据面可空）。 */
export type RemoteSessionEntry = {
  kind: `remote`;
  workspacePath: string;
  localWorkspacePath?: string;
  workspaceIdentity?: string | null;
  target: RemoteSessionTarget;
  lastOpenedAt: number;
  lastConnectionStatus?: string;
  lastConnectionError?: string;
};

/** 远端目标（判别联合；A1-R4 由最小公共面精化为 bundle 四 kind 真实形状，
 * 依据 iEt/z2/XTt/eEt 逐字段调用面）。 */
export type SshRemoteTarget = {
  kind: `ssh`;
  host: string;
  port?: number;
  username: string;
  sshConfigAlias?: string;
  assetInstallMode?: string;
  privateKeyPath?: string;
  passwordCredentialKey?: string;
  privateKeyPassphraseCredentialKey?: string;
  password?: string;
  privateKeyPassphrase?: string;
};
export type WslRemoteTarget = { kind: `wsl`; distro?: string; user?: string };
export type DockerRemoteTarget = { kind: `docker`; container: string };
export type ServerRemoteTarget = {
  kind: `server`;
  url: string;
  name?: string;
  workspacePath?: string;
  serverId?: string;
  tokenCredentialKey?: string;
  token?: string;
};
export type RemoteSessionTarget = SshRemoteTarget | WslRemoteTarget | DockerRemoteTarget | ServerRemoteTarget;

/** z2 的凭据入参面（bundle 调用面：密码/密钥口令/令牌可空）。 */
export interface RemoteSessionSecrets {
  password?: string | null;
  privateKeyPassphrase?: string | null;
  token?: string | null;
}

/** B2 的入参面（远程连接结果应用）。 */
export interface RemoteConnectionResultInput {
  remoteSessions: RemoteSessionEntry[];
  workspacePath: string;
  workspaceIdentity?: string | null;
  target: RemoteSessionTarget;
  localWorkspacePath?: string | null;
  lastConnectionStatus?: string;
  lastConnectionError?: string | null;
  touchOpenedAt?: boolean;
}

/** B2 的返回面。 */
export interface RemoteConnectionResult {
  entry: RemoteSessionEntry;
  nextRemoteSessions: RemoteSessionEntry[];
  credentialsToSave: Array<{ key: string; value: string }>;
  credentialKeysToDelete: string[];
}

/* ============================================================================
 * §A. 面板布局模型（js 121373–121528）
 * ==========================================================================*/

/** 原 swt：读取 performance 导航条目（失败兜底空数组）。
 * 行注：DOM PerformanceEntry 面不含 type 字段，此处按调用面（仅读 .type）
 * 归一为结构面（非 any 收窄）。 */
function readNavigationEntries(): Array<{ type?: string }> {
  try {
    return typeof globalThis.performance?.getEntriesByType == `function`
      ? (globalThis.performance.getEntriesByType(`navigation`) as Array<{ type?: string }>)
      : [];
  } catch {
    return [];
  }
}

/** 原 z0：本次渲染是否 reload 导航。 */
export function isReloadNavigationEntry(e: Array<{ type?: string }> = readNavigationEntries()): boolean {
  return e[0]?.type === `reload`;
}

/** 原 B0：主面板固定 id。 */
export const MAIN_PANE_ID = `workspace-main`;

var MIN_SPLIT_RATIO = 0.25, // 原 cwt
  MAX_SPLIT_RATIO = 0.75, // 原 lwt
  DEFAULT_SPLIT_RATIO = 0.5; // 原 V0

/** 原 H0：分割比例钳制（非有限值 → 0.5）。（R3 导出：供 stores shim/UI 族消费） */
export function clampSplitRatio(e: number): number {
  return Number.isFinite(e) ? Math.min(MAX_SPLIT_RATIO, Math.max(MIN_SPLIT_RATIO, e)) : DEFAULT_SPLIT_RATIO;
}

/** 原 U0：工作区作用域键（identity 优先，其次路径）。 */
export function workspaceScopeKey(e: PaneWorkspaceScope): string {
  return e.workspaceIdentity?.trim() || e.workspacePath;
}

/** 原 W0：面板绑定是否匹配（作用域键 + 会话 id）。（R3 导出） */
export function paneBindingMatchesSession(e: PaneBinding | null | undefined, t: PaneWorkspaceScope, n: string | null): boolean {
  return e?.sessionId === n && workspaceScopeKey(e!.workspaceScope) === workspaceScopeKey(t);
}

/** 原 G0：主面板叶节点。 */
export const PRIMARY_PANE_LEAF: PaneNode = { type: `leaf`, paneId: MAIN_PANE_ID };

/** 原 K0：空分割布局。 */
export const EMPTY_PANE_LAYOUT: PaneLayoutState = { root: PRIMARY_PANE_LEAF, panes: {}, focusedPaneId: MAIN_PANE_ID };

/** 原 q0：收集叶面板 id（深度优先）。（R3 导出） */
export function collectLeafPaneIds(e: PaneNode): string[] {
  return e.type === `leaf` ? [e.paneId] : [...collectLeafPaneIds(e.first), ...collectLeafPaneIds(e.second)];
}

/** 原 J0：布局面板数。（R3 导出） */
export function countLayoutPanes(e: PaneLayoutState): number {
  return collectLeafPaneIds(e.root).length;
}

/** 原 Y0：是否还能加面板（<4）。（R3 导出） */
export function canAddLayoutPane(e: PaneLayoutState): boolean {
  return countLayoutPanes(e) < 4;
}

/** 原 X0：布局是否含指定面板。（R3 导出） */
export function layoutHasPaneId(e: PaneNode, t: string): boolean {
  return e.type === `leaf` ? e.paneId === t : layoutHasPaneId(e.first, t) || layoutHasPaneId(e.second, t);
}

/** 原 Z0：有效聚焦面板 id（失效回落主面板）。消费侧 declare 名 focusedPaneId。 */
export function focusedPaneId(e: PaneLayoutState): string {
  return layoutHasPaneId(e.root, e.focusedPaneId) ? e.focusedPaneId : MAIN_PANE_ID;
}

/** 原 uwt：下一个叶面板 id（pane-N 递增）。 */
function nextLeafPaneId(e: PaneNode): string {
  let t = 0;
  for (let n of collectLeafPaneIds(e)) {
    let e = /^pane-(\d+)$/.exec(n);
    e && (t = Math.max(t, Number(e[1])));
  }
  return `pane-${t + 1}`;
}

/** 原 Q0：收集分割节点 id。 */
function collectSplitNodeIds(e: PaneNode): string[] {
  return e.type === `leaf` ? [] : [e.id, ...collectSplitNodeIds(e.first), ...collectSplitNodeIds(e.second)];
}

/** 原 dwt：下一个分割节点 id（nN 递增）。 */
function nextSplitNodeId(e: PaneNode): string {
  let t = 0;
  for (let n of collectSplitNodeIds(e)) {
    let e = /^n(\d+)$/.exec(n);
    e && (t = Math.max(t, Number(e[1])));
  }
  return `n${t + 1}`;
}

/** 原 $0：替换指定叶节点（结构共享）。 */
function replacePaneNode(e: PaneNode, t: string, n: PaneNode): PaneNode {
  if (e.type === `leaf`) return e.paneId === t ? n : e;
  let r = replacePaneNode(e.first, t, n),
    i = replacePaneNode(e.second, t, n);
  return r === e.first && i === e.second ? e : { ...e, first: r, second: i };
}

/** 原 e2：删除指定叶面板（返回兄弟子树；不存在 → null）。 */
function removePaneNode(e: PaneNode, t: string): PaneNode | null {
  if (e.type === `leaf`) return e.paneId === t ? null : e;
  let n = removePaneNode(e.first, t);
  if (n === null) return e.second;
  let r = removePaneNode(e.second, t);
  return r === null ? e.first : n === e.first && r === e.second ? e : { ...e, first: n, second: r };
}

/** 原 t2：设置分割节点比例（结构共享）。 */
function setPaneNodeRatio(e: PaneNode, t: string, n: number): PaneNode {
  if (e.type === `leaf`) return e;
  if (e.id === t) return e.ratio === n ? e : { ...e, ratio: n };
  let r = setPaneNodeRatio(e.first, t, n),
    i = setPaneNodeRatio(e.second, t, n);
  return r === e.first && i === e.second ? e : { ...e, first: r, second: i };
}

/** 原 fwt：在指定面板处劈出替换分割（新面板接管焦点）。 */
function splitPaneInLayout(e: PaneLayoutState, t: string, n: `row` | `column`, r: PaneBinding): PaneLayoutState {
  if (!layoutHasPaneId(e.root, t) || !canAddLayoutPane(e)) return e;
  let i = nextLeafPaneId(e.root),
    a: PaneNode = {
      type: `split`,
      id: nextSplitNodeId(e.root),
      direction: n,
      ratio: DEFAULT_SPLIT_RATIO,
      first: { type: `leaf`, paneId: t },
      second: { type: `leaf`, paneId: i },
    };
  return { root: replacePaneNode(e.root, t, a), panes: { ...e.panes, [i]: r }, focusedPaneId: i };
}

/** 原 n2：在指定面板旁侧劈出新面板（side 决定方位）。 */
function splitPaneBesideInLayout(e: PaneLayoutState, t: string, n: string, r: PaneBinding): PaneLayoutState {
  if (!layoutHasPaneId(e.root, t) || !canAddLayoutPane(e)) return e;
  let i = nextLeafPaneId(e.root),
    a: PaneNode = { type: `leaf`, paneId: t },
    o: PaneNode = { type: `leaf`, paneId: i },
    s = n === `left` || n === `up`,
    c: PaneNode = {
      type: `split`,
      id: nextSplitNodeId(e.root),
      direction: n === `left` || n === `right` ? `row` : `column`,
      ratio: DEFAULT_SPLIT_RATIO,
      first: s ? o : a,
      second: s ? a : o,
    };
  return { root: replacePaneNode(e.root, t, c), panes: { ...e.panes, [i]: r }, focusedPaneId: i };
}

/** 原 pwt：关闭面板（主面板不可关；焦点回落主面板）。 */
function closePaneInLayout(e: PaneLayoutState, t: string): PaneLayoutState {
  if (t === `workspace-main` || !layoutHasPaneId(e.root, t)) return e;
  let n = removePaneNode(e.root, t) ?? PRIMARY_PANE_LEAF,
    r = { ...e.panes };
  return (
    delete r[t],
    { root: n, panes: r, focusedPaneId: e.focusedPaneId === t ? MAIN_PANE_ID : e.focusedPaneId }
  );
}

/** 原 mwt：为面板绑定会话（同会话且非恢复态 → 恒等）。 */
function bindPaneSessionInLayout(e: PaneLayoutState, t: string, n: string): PaneLayoutState {
  let r = e.panes[t];
  return !r || (r.sessionId === n && !r.restoredUnvalidated)
    ? e
    : { ...e, panes: { ...e.panes, [t]: { workspaceScope: r.workspaceScope, sessionId: n } } };
}

/** 原 hwt：整替换面板绑定并聚焦。 */
function replacePaneBindingInLayout(e: PaneLayoutState, t: string, n: PaneBinding): PaneLayoutState {
  return !e.panes[t] || t === `workspace-main`
    ? e
    : { ...e, panes: { ...e.panes, [t]: n }, focusedPaneId: t };
}

/** 原 gwt：按（作用域+会话）找面板 id。（R3 导出） */
export function findPaneIdBySessionInLayout(e: PaneLayoutState, t: PaneWorkspaceScope, n: string | null): string | null {
  for (let [r, i] of Object.entries(e.panes)) if (paneBindingMatchesSession(i, t, n)) return r;
  return null;
}

/** 原 _wt：设置分割比例（根不变 → 恒等）。 */
function setLayoutSplitRatio(e: PaneLayoutState, t: string, n: number): PaneLayoutState {
  let r = setPaneNodeRatio(e.root, t, clampSplitRatio(n));
  return r === e.root ? e : { ...e, root: r };
}

/** 原 r2：聚焦面板。 */
function focusLayoutPane(e: PaneLayoutState, t: string): PaneLayoutState {
  return e.focusedPaneId === t || !layoutHasPaneId(e.root, t) ? e : { ...e, focusedPaneId: t };
}

/** 原 vwt：确认恢复态面板会话（摘除 restoredUnvalidated）。 */
function confirmRestoredPaneInLayout(e: PaneLayoutState, t: string): PaneLayoutState {
  let n = e.panes[t];
  return n?.restoredUnvalidated
    ? {
        ...e,
        panes: { ...e.panes, [t]: { workspaceScope: n.workspaceScope, sessionId: n.sessionId } },
      }
    : e;
}

/** 原 ywt：打开会话到布局（已存在 → 聚焦；否则行向劈出）。 */
function openSessionInLayout(e: PaneLayoutState, t: PaneWorkspaceScope, n: string): PaneLayoutState {
  let r = workspaceScopeKey(t);
  for (let [t, i] of Object.entries(e.panes))
    if (i.sessionId === n && workspaceScopeKey(i.workspaceScope) === r) return focusLayoutPane(e, t);
  return splitPaneInLayout(e, focusedPaneId(e), `row`, { workspaceScope: t, sessionId: n });
}

/* ============================================================================
 * §B. 布局持久化 + splitLayoutStore（js 121529–121720）
 * ==========================================================================*/

export var PANE_LAYOUT_STORAGE_KEY_V2 = `zcode-v4-pane-layout:v2`, // 原 bwt（R3 导出）
  PANE_LAYOUT_STORAGE_KEY_V1 = `zcode-v4-pane-layout:v1`, // 原 xwt（R3 导出）
  LEGACY_SPLIT_PANE_ID = `split`; // 原 i2

/** 原 a2：解析面板树节点（非法 → null）。 */
function parsePaneNode(e: unknown): PaneNode | null {
  if (typeof e != `object` || !e) return null;
  let t = e as Record<string, unknown>;
  if (t.type === `leaf`)
    return typeof t.paneId == `string` && (t.paneId as string).length > 0
      ? { type: `leaf`, paneId: t.paneId as string }
      : null;
  if (t.type === `split`) {
    if (
      typeof t.id != `string` ||
      (t.id as string).length === 0 ||
      (t.direction !== `row` && t.direction !== `column`)
    )
      return null;
    let e = parsePaneNode(t.first),
      n = parsePaneNode(t.second);
    return !e || !n
      ? null
      : {
          type: `split`,
          id: t.id as string,
          direction: t.direction as `row` | `column`,
          ratio: clampSplitRatio(typeof t.ratio == `number` ? t.ratio : NaN),
          first: e,
          second: n,
        };
  }
  return null;
}

/** 原 Swt：解析工作区作用域（路径必填）。 */
function parsePaneWorkspaceScope(e: unknown): PaneWorkspaceScope | null {
  if (typeof e != `object` || !e) return null;
  let t = e as Record<string, unknown>;
  return typeof t.workspacePath != `string` || (t.workspacePath as string).length === 0
    ? null
    : {
        workspacePath: t.workspacePath as string,
        ...(typeof t.workspaceIdentity == `string` && (t.workspaceIdentity as string).trim().length > 0
          ? { workspaceIdentity: t.workspaceIdentity as string }
          : {}),
        ...(typeof t.remoteSessionId == `string` && (t.remoteSessionId as string).length > 0
          ? { remoteSessionId: t.remoteSessionId as string }
          : {}),
      };
}

/** 原 Cwt：解析存储布局（面板数/唯一性/主面板校验）。 */
function parseStoredPaneLayout(e: unknown): PaneLayoutState | null {
  if (typeof e != `object` || !e) return null;
  let t = e as Record<string, unknown>,
    n = parsePaneNode(t.root);
  if (!n) return null;
  let r = collectLeafPaneIds(n);
  if (
    r.length > 4 ||
    new Set(r).size !== r.length ||
    r.filter((e) => e === `workspace-main`).length !== 1
  )
    return null;
  let i = typeof t.panes == `object` && t.panes !== null ? (t.panes as Record<string, unknown>) : {},
    a: Record<string, PaneBinding> = {};
  for (let e of r) {
    if (e === `workspace-main`) continue;
    let t = i[e];
    if (typeof t != `object` || !t) return null;
    let n = parsePaneWorkspaceScope((t as Record<string, unknown>).workspaceScope);
    if (!n) return null;
    let r = (t as Record<string, unknown>).sessionId,
      o = typeof r == `string` && (r as string).length > 0 ? (r as string) : null;
    a[e] = { workspaceScope: n, sessionId: o, ...(o === null ? {} : { restoredUnvalidated: !0 }) };
  }
  return {
    root: n,
    panes: a,
    focusedPaneId:
      typeof t.focusedPaneId == `string` && r.includes(t.focusedPaneId as string) ? (t.focusedPaneId as string) : MAIN_PANE_ID,
  };
}

/** 原 wwt：是否绝对路径（POSIX / Windows 盘符）。 */
function isAbsoluteWorkspacePath(e: string): boolean {
  return e.startsWith(`/`) || /^[A-Za-z]:[\\/]/.test(e);
}

/** 原 Twt：v1 旧布局迁移（单 split 面板）。 */
function parseLegacyPaneLayout(e: unknown): PaneLayoutState | null {
  if (typeof e != `object` || !e) return null;
  let t = e as Record<string, unknown>,
    n = (t.splitPane as Record<string, unknown> | undefined)?.workspaceKey;
  if (typeof n != `string` || (n as string).length === 0 || !isAbsoluteWorkspacePath(n as string)) return null;
  let r = (t.splitPane as Record<string, unknown> | undefined)?.sessionId,
    i = typeof r == `string` && (r as string).length > 0 ? (r as string) : null;
  return {
    root: {
      type: `split`,
      id: `n1`,
      direction: `row`,
      ratio: clampSplitRatio(typeof t.splitRatio == `number` ? (t.splitRatio as number) : NaN),
      first: PRIMARY_PANE_LEAF,
      second: { type: `leaf`, paneId: LEGACY_SPLIT_PANE_ID },
    },
    panes: {
      [LEGACY_SPLIT_PANE_ID]: {
        workspaceScope: { workspacePath: n as string },
        sessionId: i,
        ...(i === null ? {} : { restoredUnvalidated: !0 }),
      },
    },
    focusedPaneId: t.focusedPaneId === `split` ? LEGACY_SPLIT_PANE_ID : MAIN_PANE_ID,
  };
}

/** 原 Ewt：读取持久化布局（v2 优先，v1 迁移）。 */
function loadStoredPaneLayout(): PaneLayoutState | null {
  try {
    let e = localStorage.getItem(PANE_LAYOUT_STORAGE_KEY_V2);
    if (e) return parseStoredPaneLayout(JSON.parse(e));
    let t = localStorage.getItem(PANE_LAYOUT_STORAGE_KEY_V1);
    return t ? parseLegacyPaneLayout(JSON.parse(t)) : null;
  } catch {
    return null;
  }
}

/** 原 o2：克隆面板树。 */
function clonePaneNode(e: PaneNode): PaneNode {
  return e.type === `leaf`
    ? { type: `leaf`, paneId: e.paneId }
    : {
        type: `split`,
        id: e.id,
        direction: e.direction,
        ratio: e.ratio,
        first: clonePaneNode(e.first),
        second: clonePaneNode(e.second),
      };
}

var lastSerializedPaneLayout: string | null = null; // 原 Dwt

/** 原 Owt：布局落盘（与上次序列化相同则跳过）。 */
function persistPaneLayout(e: PaneLayoutState): void {
  let t: Record<string, { workspaceScope: PaneWorkspaceScope; sessionId: string | null }> = {};
  for (let [n, r] of Object.entries(e.panes))
    t[n] = {
      workspaceScope: {
        workspacePath: r.workspaceScope.workspacePath,
        ...(r.workspaceScope.workspaceIdentity
          ? { workspaceIdentity: r.workspaceScope.workspaceIdentity }
          : {}),
        ...(r.workspaceScope.remoteSessionId
          ? { remoteSessionId: r.workspaceScope.remoteSessionId }
          : {}),
      },
      sessionId: r.sessionId,
    };
  let n = { root: clonePaneNode(e.root), panes: t, focusedPaneId: e.focusedPaneId };
  try {
    let e = JSON.stringify(n);
    if (e === lastSerializedPaneLayout) return;
    (localStorage.setItem(PANE_LAYOUT_STORAGE_KEY_V2, e), (lastSerializedPaneLayout = e));
  } catch {}
}

var storedPaneLayout = loadStoredPaneLayout(), // 原 kwt
  restoredPaneLayout = isReloadNavigationEntry() ? storedPaneLayout : null; // 原 Awt

/** 原 jwt：是否存在（恢复的）分割绑定。 */
export function hasSplitLayoutBindings(): boolean {
  return storedPaneLayout !== null;
}

/** 原 s2：splitLayoutStore（zustand；订阅落盘）。 */
export const splitLayoutStore = createStore<SplitLayoutStoreState>((e) => ({
  ...(restoredPaneLayout ?? EMPTY_PANE_LAYOUT),
  splitPane: (t, n, r) => {
    e((e) => splitPaneInLayout(e, t, n, { workspaceScope: r, sessionId: null }));
  },
  splitPaneWithBinding: (t, n, r) => {
    e((e) => splitPaneBesideInLayout(e, t, n, r));
  },
  openSessionInNewPane: (t, n) => {
    e((e) => openSessionInLayout(e, t, n));
  },
  replacePaneBinding: (t, n) => {
    e((e) => replacePaneBindingInLayout(e, t, n));
  },
  closePane: (t) => {
    e((e) => closePaneInLayout(e, t));
  },
  focusPane: (t) => {
    e((e) => focusLayoutPane(e, t));
  },
  bindPaneSession: (t, n) => {
    e((e) => bindPaneSessionInLayout(e, t, n));
  },
  setSplitRatio: (t, n) => {
    e((e) => setLayoutSplitRatio(e, t, n));
  },
  confirmRestoredPaneSession: (t) => {
    e((e) => confirmRestoredPaneInLayout(e, t));
  },
  resetToPrimaryPane: () => {
    e(EMPTY_PANE_LAYOUT);
  },
}));
splitLayoutStore.subscribe((e) => {
  persistPaneLayout(e);
});

/* ============================================================================
 * §C. 会话路由模型 + sessionRouterStore（js 122201 尾 + 122309–122714）
 * ==========================================================================*/

export var ROUTER_STORAGE_KEY = `zcode-v4-session-workbench-groups:v1`, // 原 nTt（R3 导出）
  EMPTY_ROUTER_STATE: SessionRouterData = { activeGroupId: null, groups: {}, sessionIndex: {} }, // 原 g2
  workbenchClientMode = `desktop-continuous`, // 原 _2（模块级可变）
  routerStateHydrated = !1; // 原 v2（模块级可变）

/** 原 y2：路由是否启用（web-remote-replayable 下禁用）。（R3 导出） */
export function isWorkbenchRouterEnabled(): boolean {
  return workbenchClientMode !== `web-remote-replayable`;
}

/** 原 b2：（作用域+会话）索引键。（R3 导出） */
export function sessionBindingIndexKey(e: PaneWorkspaceScope, t: string): string {
  return `${workspaceScopeKey(e)}::${t}`;
}

/** 原 x2：面板绑定索引键。 */
function paneBindingIndexKey(e: SessionBinding): string {
  return sessionBindingIndexKey(e.workspaceScope, e.sessionId);
}

/** 原 S2：两会话绑定是否同一会话。 */
function sameSessionBinding(e: SessionBinding, t: SessionBinding): boolean {
  return paneBindingIndexKey(e) === paneBindingIndexKey(t);
}

/** 原 rTt：可恢复会话绑定投影。 */
function toRestorableSessionBinding(e: SessionBinding): SessionBinding {
  return {
    workspaceScope: e.workspaceScope,
    sessionId: e.sessionId,
    ...(e.readOnly ? { readOnly: !0 } : {}),
    ...(e.restoredUnvalidated ? { restoredUnvalidated: !0 } : {}),
  };
}

/** 原 C2：面板绑定 → 会话绑定（无会话 → null）。 */
function toSessionBindingOrNull(e: PaneBinding): SessionBinding | null {
  return typeof e.sessionId == `string`
    ? {
        workspaceScope: e.workspaceScope,
        sessionId: e.sessionId,
        ...(e.readOnly ? { readOnly: !0 } : {}),
        ...(e.restoredUnvalidated ? { restoredUnvalidated: !0 } : {}),
      }
    : null;
}

/** 原 w2：组内全部会话绑定（主绑定 + 面板绑定）。 */
function groupSessionBindings(e: SessionRouterGroup): SessionBinding[] {
  return [e.primaryBinding, ...Object.values(e.panes)];
}

/** 原 iTt：组是否已含该绑定。 */
function groupContainsBinding(e: SessionRouterGroup, t: SessionBinding): boolean {
  let n = paneBindingIndexKey(t);
  return groupSessionBindings(e).some((e) => paneBindingIndexKey(e) === n);
}

/** 原 T2：按面板 id 取组内绑定（主面板 → 主绑定）。消费侧 declare 名 paneById。 */
export function paneBindingById(e: SessionRouterGroup, t: string): SessionBinding | null {
  return t === `workspace-main` ? e.primaryBinding : e.panes[t] ?? null;
}

/** 原 E2：组的聚焦绑定。（R3 导出：供 PTt 域关闭面板时解析下一活动绑定） */
export function focusedGroupBinding(e: SessionRouterGroup): SessionBinding | null {
  return paneBindingById(e, e.focusedPaneId);
}

/** 原 aTt：按绑定找组内面板 id。 */
function findGroupPaneIdByBinding(e: SessionRouterGroup, t: SessionBinding): string | null {
  if (sameSessionBinding(e.primaryBinding, t)) return MAIN_PANE_ID;
  for (let [n, r] of Object.entries(e.panes)) if (sameSessionBinding(r, t)) return n;
  return null;
}

/** 原 oTt：下一个组 id（group-N 递增）。 */
function nextGroupId(e: Record<string, SessionRouterGroup>): string {
  let t = 0;
  for (let n of Object.keys(e)) {
    let e = /^group-(\d+)$/.exec(n);
    e && (t = Math.max(t, Number(e[1])));
  }
  return `group-${t + 1}`;
}

/** 原 sTt：由主绑定 + 目标绑定创建会话组。 */
function createSessionGroup(
  e: SessionBinding,
  t: SessionBinding,
  n: string,
  r: { id?: string; updatedAt?: number } = {},
): SessionRouterGroup {
  let i = splitPaneBesideInLayout(EMPTY_PANE_LAYOUT, MAIN_PANE_ID, n, toRestorableSessionBinding(t)),
    a: Record<string, SessionBinding> = {};
  for (let [e, t] of Object.entries(i.panes)) {
    let n = toSessionBindingOrNull(t);
    n && (a[e] = n);
  }
  return {
    id: r.id ?? `group-1`,
    primaryBinding: e,
    root: i.root,
    panes: a,
    focusedPaneId: i.focusedPaneId,
    updatedAt: r.updatedAt ?? Date.now(),
  };
}

/** 原 cTt：由现有分割布局晋升为会话组（<2 面板 → null）。 */
function groupFromPaneLayout(
  e: SessionBinding,
  t: PaneLayoutState,
  n: { id?: string; updatedAt?: number } = {},
): SessionRouterGroup | null {
  let r = collectLeafPaneIds(t.root);
  if (r.length < 2 || !r.includes(`workspace-main`)) return null;
  let i: Record<string, SessionBinding> = {};
  for (let e of r) {
    if (e === `workspace-main`) continue;
    let n = t.panes[e],
      r = n ? toSessionBindingOrNull(n) : null;
    if (!r) return null;
    i[e] = r;
  }
  return {
    id: n.id ?? `group-1`,
    primaryBinding: e,
    root: t.root,
    panes: i,
    focusedPaneId: focusedPaneId(t),
    updatedAt: n.updatedAt ?? Date.now(),
  };
}

/** 原 lTt：组内聚焦面板（更新时间戳）。 */
function focusGroupPane(e: SessionRouterGroup, t: string, n: number = Date.now()): SessionRouterGroup {
  let r = focusLayoutPane(e, t);
  return r === e ? e : { ...e, focusedPaneId: r.focusedPaneId, updatedAt: n };
}

/** 原 uTt：组内劈出面板绑定目标会话。 */
function splitGroupPaneBeside(
  e: SessionRouterGroup,
  t: string,
  n: string,
  r: SessionBinding,
  i: number = Date.now(),
): SessionRouterGroup {
  if (groupContainsBinding(e, r) || !canAddLayoutPane(e)) return e;
  let a = splitPaneBesideInLayout(e, t, n, toRestorableSessionBinding(r));
  if (a === e) return e;
  let o: Record<string, SessionBinding> = {};
  for (let [e, t] of Object.entries(a.panes)) {
    let n = toSessionBindingOrNull(t);
    n && (o[e] = n);
  }
  return { ...e, root: a.root, panes: o, focusedPaneId: a.focusedPaneId, updatedAt: i };
}

/** 原 dTt：关闭组内面板（剩 <2 → null，调用方删组）。（R3 导出：同上，PTt 关闭预览用纯函数面） */
export function closeGroupPane(e: SessionRouterGroup, t: string, n: number = Date.now()): SessionRouterGroup | null {
  if (t === `workspace-main`) return null;
  let r = closePaneInLayout(e, t);
  if (r === e) return e;
  let i: Record<string, SessionBinding> = {};
  for (let [e, t] of Object.entries(r.panes)) {
    let n = toSessionBindingOrNull(t);
    n && (i[e] = n);
  }
  let a = { ...e, root: r.root, panes: i, focusedPaneId: r.focusedPaneId, updatedAt: n };
  return countLayoutPanes(a) < 2 ? null : a;
}

/** 原 fTt：确认组内恢复态会话（摘除 restoredUnvalidated）。 */
function confirmGroupRestoredSession(e: SessionRouterGroup, t: string): SessionRouterGroup {
  if (t === `workspace-main`) {
    if (!e.primaryBinding.restoredUnvalidated) return e;
    let { restoredUnvalidated: t, ...n } = e.primaryBinding;
    return { ...e, primaryBinding: n };
  }
  let n = e.panes[t];
  if (!n?.restoredUnvalidated) return e;
  let { restoredUnvalidated: r, ...i } = n;
  return { ...e, panes: { ...e.panes, [t]: i } };
}

/** 原 pTt：由组集合重建会话索引。 */
function buildGroupSessionIndex(e: Record<string, SessionRouterGroup>): Record<string, string> {
  let t: Record<string, string> = {};
  for (let n of Object.values(e)) for (let e of groupSessionBindings(n)) t[paneBindingIndexKey(e)] = n.id;
  return t;
}

/** 原 D2：插入/更新组并置为活动。 */
function withUpsertedGroup(e: SessionRouterData, t: SessionRouterGroup): SessionRouterData {
  let n = { ...e.groups, [t.id]: t };
  return { activeGroupId: t.id, groups: n, sessionIndex: buildGroupSessionIndex(n) };
}

/** 原 mTt：删除组。 */
function withRemovedGroup(e: SessionRouterData, t: string): SessionRouterData {
  let n = { ...e.groups };
  return delete n[t], { activeGroupId: e.activeGroupId === t ? null : e.activeGroupId, groups: n, sessionIndex: buildGroupSessionIndex(n) };
}

/** 原 hTt：侧栏会话拆入组（已存在 → 恒等）。 */
function withSessionSplitIntoGroup(
  e: SessionRouterData,
  t: string,
  n: string,
  r: SessionBinding,
  i?: SessionBinding,
): SessionRouterData {
  let a = paneBindingIndexKey(r);
  if (e.sessionIndex[a]) return e;
  let o = e.activeGroupId ? e.groups[e.activeGroupId] : void 0;
  if (o) {
    let i = splitGroupPaneBeside(o, t, n, r);
    return i === o ? e : withUpsertedGroup(e, i);
  }
  return !i || sameSessionBinding(i, r) || e.sessionIndex[paneBindingIndexKey(i)]
    ? e
    : withUpsertedGroup(e, createSessionGroup(i, r, n, { id: nextGroupId(e.groups) }));
}

/** 原 gTt：分割布局晋升为组。 */
function withPromotedPaneLayoutGroup(e: SessionRouterData, t: SessionBinding, n: PaneLayoutState): SessionRouterData {
  let r = groupFromPaneLayout(t, n, { id: nextGroupId(e.groups) });
  if (!r) return e;
  let i = groupSessionBindings(r).map(paneBindingIndexKey);
  return new Set(i).size !== i.length || i.some((t) => !!e.sessionIndex[t]) ? e : withUpsertedGroup(e, r);
}

/** 原 _Tt：聚焦侧栏打开的会话（定位其组与面板）。 */
function withFocusedSessionBinding(e: SessionRouterData, t: SessionBinding): SessionRouterData {
  let n = e.sessionIndex[paneBindingIndexKey(t)];
  if (!n) return e.activeGroupId === null ? e : { ...e, activeGroupId: null };
  let r = e.groups[n];
  if (!r) return { ...e, activeGroupId: null };
  let i = findGroupPaneIdByBinding(r, t);
  if (!i) return e;
  let a = focusGroupPane(r, i);
  return withUpsertedGroup({ ...e, activeGroupId: n }, a);
}

/** 原 vTt：组内面板改绑会话。 */
function withGroupPaneSessionBound(e: SessionRouterData, t: string, n: string, r: string): SessionRouterData {
  let i = e.groups[t],
    a = i ? paneBindingById(i, n) : null;
  if (!i || !a || a.sessionId === r) return e;
  let o: SessionBinding = {
      workspaceScope: a.workspaceScope,
      sessionId: r,
      ...(a.readOnly ? { readOnly: !0 } : {}),
    },
    s = paneBindingIndexKey(o),
    c = e.sessionIndex[s];
  return c && c !== t || (c === t && !sameSessionBinding(a, o))
    ? e
    : withUpsertedGroup(
        e,
        n === `workspace-main`
          ? { ...i, primaryBinding: o, updatedAt: Date.now() }
          : { ...i, panes: { ...i.panes, [n]: o }, updatedAt: Date.now() },
      );
}

/** 原 yTt：安全 localStorage。 */
function routerSafeLocalStorage(): Storage | null {
  try {
    return globalThis.localStorage === void 0 ? null : globalThis.localStorage;
  } catch {
    return null;
  }
}

/** 原 O2：是否普通对象。 */
function isPlainRecord(e: unknown): e is Record<string, unknown> {
  return typeof e == `object` && !!e && !Array.isArray(e);
}

/** 原 k2：解析路由面板树节点。 */
function parseRouterPaneNode(e: unknown): PaneNode | null {
  if (!isPlainRecord(e) || typeof e.type != `string`) return null;
  if (e.type === `leaf`) return typeof e.paneId == `string` ? { type: `leaf`, paneId: e.paneId as string } : null;
  if (e.type !== `split`) return null;
  let t = parseRouterPaneNode(e.first),
    n = parseRouterPaneNode(e.second);
  return !t || !n || typeof e.id != `string` || (e.direction !== `row` && e.direction !== `column`)
    ? null
    : {
        type: `split`,
        id: e.id as string,
        direction: e.direction as `row` | `column`,
        ratio: clampSplitRatio(typeof e.ratio == `number` ? (e.ratio as number) : NaN),
        first: t,
        second: n,
      };
}

/** 原 bTt：解析路由工作区作用域。 */
function parseRouterWorkspaceScope(e: unknown): PaneWorkspaceScope | null {
  return !isPlainRecord(e) || typeof e.workspacePath != `string`
    ? null
    : {
        workspacePath: e.workspacePath as string,
        workspaceIdentity: typeof e.workspaceIdentity == `string` ? (e.workspaceIdentity as string) : void 0,
        remoteSessionId: typeof e.remoteSessionId == `string` ? (e.remoteSessionId as string) : void 0,
      };
}

/** 原 xTt：解析路由恢复态绑定（只读 → 丢弃）。 */
function parseRouterRestoredBinding(e: unknown): SessionBinding | null {
  if (!isPlainRecord(e) || typeof e.sessionId != `string` || e.readOnly === !0) return null;
  let t = parseRouterWorkspaceScope(e.workspaceScope);
  return t ? { workspaceScope: t, sessionId: e.sessionId as string, restoredUnvalidated: !0 } : null;
}

/** 原 STt：解析存储会话组。 */
function parseStoredSessionGroup(e: unknown): SessionRouterGroup | null {
  if (!isPlainRecord(e) || typeof e.id != `string`) return null;
  let t = parseRouterRestoredBinding(e.primaryBinding),
    n = parseRouterPaneNode(e.root);
  if (!t || !n) return null;
  let r = collectLeafPaneIds(n),
    i = new Set(r);
  if (i.size !== r.length || !i.has(`workspace-main`) || r.length > 4) return null;
  let a = isPlainRecord(e.panes) ? (e.panes as Record<string, unknown>) : {},
    o: Record<string, SessionBinding> = {};
  for (let e of r) {
    if (e === `workspace-main`) continue;
    let t = parseRouterRestoredBinding(a[e]);
    if (!t) return null;
    o[e] = t;
  }
  let s = typeof e.focusedPaneId == `string` && i.has(e.focusedPaneId as string) ? (e.focusedPaneId as string) : MAIN_PANE_ID,
    c: SessionRouterGroup = {
      id: e.id as string,
      primaryBinding: t,
      root: n,
      panes: o,
      focusedPaneId: s,
      updatedAt: typeof e.updatedAt == `number` ? (e.updatedAt as number) : 0,
    };
  return countLayoutPanes(c) < 2 ? null : c;
}

/** 原 CTt：解析存储路由状态（去重组 + 索引）。 */
function parseStoredRouterState(e: unknown): SessionRouterData | null {
  if (!isPlainRecord(e)) return null;
  let t = isPlainRecord(e.groups) ? Object.values(e.groups as Record<string, unknown>) : [],
    n: Record<string, SessionRouterGroup> = {},
    r: Record<string, string> = {};
  for (let e of t) {
    let t = parseStoredSessionGroup(e);
    if (!t || n[t.id]) continue;
    let i = groupSessionBindings(t).map(paneBindingIndexKey);
    if (!i.some((e) => r[e])) {
      n[t.id] = t;
      for (let e of i) r[e] = t.id;
    }
  }
  return Object.keys(n).length === 0
    ? null
    : {
        activeGroupId: typeof e.activeGroupId == `string` && n[e.activeGroupId as string] ? (e.activeGroupId as string) : null,
        groups: n,
        sessionIndex: r,
      };
}

/** 原 wTt：路由状态落盘（摘除恢复标记）。 */
function persistRouterState(e: SessionRouterData): void {
  if (!isWorkbenchRouterEnabled()) return;
  let t = routerSafeLocalStorage();
  if (t)
    try {
      let n = Object.fromEntries(
        Object.entries(e.groups).map(([e, t]) => {
          let { restoredUnvalidated: n, ...r } = t.primaryBinding,
            i = Object.fromEntries(
              Object.entries(t.panes).map(([e, t]) => {
                let { restoredUnvalidated: n, ...r } = t;
                return [e, r];
              }),
            );
          return [e, { ...t, primaryBinding: r, panes: i }];
        }),
      );
      t.setItem(
        ROUTER_STORAGE_KEY,
        JSON.stringify({ version: 1, activeGroupId: e.activeGroupId, groups: n, sessionIndex: e.sessionIndex }),
      );
    } catch {}
}

/** 原 TTt：读取存储路由状态。 */
function loadStoredRouterState(): SessionRouterData | null {
  if (!isWorkbenchRouterEnabled()) return null;
  let e = routerSafeLocalStorage();
  if (!e) return null;
  try {
    let t = e.getItem(ROUTER_STORAGE_KEY);
    return t ? parseStoredRouterState(JSON.parse(t)) : null;
  } catch {
    return null;
  }
}

/** 原 A2：sessionRouterStore（zustand；订阅落盘）。 */
export const sessionRouterStore = createStore<SessionRouterStoreState>((e, t) => ({
  ...EMPTY_ROUTER_STATE,
  configureClientMode: (t) => {
    if (t === `web-remote-replayable`) {
      (workbenchClientMode = t), (routerStateHydrated = !1), e(EMPTY_ROUTER_STATE);
      return;
    }
    if (((workbenchClientMode = t), routerStateHydrated)) return;
    routerStateHydrated = !0;
    let n = loadStoredRouterState();
    n && e(n);
  },
  openSessionFromSidebar: (t) => {
    isWorkbenchRouterEnabled() && e((e) => withFocusedSessionBinding(e, t));
  },
  splitSessionIntoGroup: (t, n, r, i) => {
    isWorkbenchRouterEnabled() && e((e) => withSessionSplitIntoGroup(e, t, n, r, i));
  },
  promotePaneLayoutToGroup: (n, r) => {
    if (!isWorkbenchRouterEnabled()) return !1;
    let i = t(),
      a = withPromotedPaneLayoutGroup(i, n, r);
    return a === i ? !1 : (e(a), !0);
  },
  focusPane: (t, n) => {
    isWorkbenchRouterEnabled() &&
      e((e) => {
        let r = e.groups[t];
        if (!r) return e;
        let i = focusGroupPane(r, n);
        return i === r && e.activeGroupId === t ? e : withUpsertedGroup({ ...e, activeGroupId: t }, i);
      });
  },
  closePane: (t, n) => {
    isWorkbenchRouterEnabled() &&
      e((e) => {
        let r = e.groups[t];
        if (!r) return e;
        let i = closeGroupPane(r, n);
        return i ? (i === r ? e : withUpsertedGroup(e, i)) : withRemovedGroup(e, t);
      });
  },
  confirmRestoredPaneSession: (t, n) => {
    isWorkbenchRouterEnabled() &&
      e((e) => {
        let r = e.groups[t];
        if (!r) return e;
        let i = confirmGroupRestoredSession(r, n);
        return i === r ? e : withUpsertedGroup(e, i);
      });
  },
  bindPaneSession: (t, n, r) => {
    isWorkbenchRouterEnabled() && e((e) => withGroupPaneSessionBound(e, t, n, r));
  },
  setSplitRatio: (t, n, r) => {
    isWorkbenchRouterEnabled() &&
      e((e) => {
        let i = e.groups[t];
        if (!i) return e;
        let a = setLayoutSplitRatio(i, n, r);
        return a.root === i.root ? e : withUpsertedGroup(e, { ...i, root: a.root, updatedAt: Date.now() });
      });
  },
  isSessionGrouped: (e, n) => !isWorkbenchRouterEnabled() || !n ? !1 : !!t().sessionIndex[sessionBindingIndexKey(e, n)],
  getActiveContext: () => {
    if (!isWorkbenchRouterEnabled()) return null;
    let e = t(),
      n = e.activeGroupId ? e.groups[e.activeGroupId] : void 0;
    return n ? focusedGroupBinding(n) : null;
  },
  deactivateActiveGroup: () => {
    isWorkbenchRouterEnabled() && e((e) => (e.activeGroupId === null ? e : { ...e, activeGroupId: null }));
  },
  resetWorkbenchGroups: () => {
    e(EMPTY_ROUTER_STATE);
  },
}));
sessionRouterStore.subscribe((e) => {
  isWorkbenchRouterEnabled() && persistRouterState(e);
});

/* ============================================================================
 * §D. 路由选择器/钩子（js 122716–122819）
 * ==========================================================================*/

/** 原 ETt：（作用域+会话）→ 会话绑定。 */
function toSessionBindingFromScope(e: PaneWorkspaceScope & { sessionId: string }): SessionBinding {
  let { sessionId: t, ...n } = e;
  return { workspaceScope: n, sessionId: t };
}

/** 原 DTt：当前分割布局是否已有（匹配）绑定。 */
function hasSplitPaneBindingFor(e: SessionBinding | null): boolean {
  let t = splitLayoutStore.getState();
  return Object.keys(t.panes).length === 0
    ? !1
    : !e || Object.values(t.panes).some((t) => paneBindingMatchesSession(t, e.workspaceScope, e.sessionId));
}

/** 分割会话计划（OTt 返回面）。 */
export type SplitSessionPlan = {
  kind: `blocked` | `focus-group` | `focus-pane` | `split-group` | `split-draft` | `promote-and-split` | `create-group`;
  anchorPaneId: string;
  binding: SessionBinding;
  side: string;
  paneId?: string;
  primaryBinding?: SessionBinding;
};

/** 原 OTt：解析侧栏会话的分割计划。 */
function resolveSplitSessionPlan(
  e: SessionBinding | null,
  t: PaneWorkspaceScope & { sessionId: string },
  n: { anchorPaneId?: string; side: string },
): SplitSessionPlan {
  let r = sessionRouterStore.getState(),
    i = splitLayoutStore.getState(),
    a = r.activeGroupId ? r.groups[r.activeGroupId] : void 0,
    o = a?.focusedPaneId ?? focusedPaneId(i),
    s = !a && o !== `workspace-main` ? i.panes[o] : void 0,
    c: PaneBinding | null = a ? focusedGroupBinding(a) : s?.sessionId ? { workspaceScope: s.workspaceScope, sessionId: s.sessionId } : e,
    l = toSessionBindingFromScope(t),
    u = { anchorPaneId: n.anchorPaneId ?? o, binding: l, side: n.side };
  if (paneBindingMatchesSession(c, t, t.sessionId)) return { kind: `blocked`, ...u };
  if (r.sessionIndex[sessionBindingIndexKey(t, t.sessionId)]) return { kind: `focus-group`, ...u };
  let d = findPaneIdBySessionInLayout(i, t, t.sessionId);
  return d
    ? { kind: `focus-pane`, paneId: d, ...u }
    : canAddLayoutPane(a ?? i)
      ? a
        ? { kind: `split-group`, ...u }
        : hasSplitPaneBindingFor(e) || !e
          ? { kind: `split-draft`, ...u }
          : Object.keys(i.panes).length > 0
            ? { kind: `promote-and-split`, primaryBinding: e, ...u }
            : { kind: `create-group`, anchorPaneId: MAIN_PANE_ID, primaryBinding: e, binding: l, side: n.side }
      : { kind: `blocked`, ...u };
}

/** 原 kTt：计划是否可执行（按模式过滤 focus 类）。 */
function isSplitPlanActionable(e: SplitSessionPlan, t: string): boolean {
  return e.kind !== `blocked` && (t === `context-menu` || !e.kind.startsWith(`focus`));
}

/** 原 ATt：能否在分割中打开会话。消费侧 declare 名 canOpenSessionInSplit。 */
export function canOpenSessionInSplit(
  e: SessionBinding | null,
  t: PaneWorkspaceScope & { sessionId: string },
  n: { anchorPaneId?: string; side: string; mode: string },
): boolean {
  return isSplitPlanActionable(resolveSplitSessionPlan(e, t, n), n.mode);
}

/** 原 jTt：在分割中打开会话。消费侧 declare 名 openSessionInSplit。 */
export function openSessionInSplit(
  e: SessionBinding | null,
  t: PaneWorkspaceScope & { sessionId: string },
  n: { anchorPaneId?: string; side: string; mode: string },
): boolean {
  let r = resolveSplitSessionPlan(e, t, n);
  if (!isSplitPlanActionable(r, n.mode)) return !1;
  let i = sessionRouterStore.getState(),
    a = splitLayoutStore.getState();
  if (r.kind === `focus-group`) i.openSessionFromSidebar(r.binding);
  else if (r.kind === `focus-pane` && r.paneId) a.focusPane(r.paneId), i.openSessionFromSidebar(r.binding);
  else if (r.kind === `split-group`) i.splitSessionIntoGroup(r.anchorPaneId, r.side, r.binding);
  else if (r.kind === `split-draft`)
    return (
      a.splitPaneWithBinding(r.anchorPaneId, r.side, { workspaceScope: r.binding.workspaceScope, sessionId: r.binding.sessionId }),
      logger.debug(`[v4-workbench] session split beside primary draft`, {
        sessionId: r.binding.sessionId,
        workspaceKey: workspaceScopeKey(r.binding.workspaceScope),
      }),
      !1
    );
  else if (r.primaryBinding)
    if (r.kind === `promote-and-split`) {
      if (!i.promotePaneLayoutToGroup(r.primaryBinding, a)) return !1;
      a.resetToPrimaryPane(), sessionRouterStore.getState().splitSessionIntoGroup(r.anchorPaneId, r.side, r.binding);
    } else i.splitSessionIntoGroup(r.anchorPaneId, r.side, r.binding, r.primaryBinding as SessionBinding);
  return !0;
}

/** 原 MTt：草稿旁打开会话。消费侧 declare 名 openSessionBesideDraft。 */
export function openSessionBesideDraft(e: SessionBinding | null, t: PaneWorkspaceScope & { sessionId: string }): void {
  let n = sessionRouterStore.getState(),
    r = splitLayoutStore.getState(),
    i = toSessionBindingFromScope(t);
  if (!n.activeGroupId && !n.sessionIndex[sessionBindingIndexKey(t, t.sessionId)] && hasSplitPaneBindingFor(e)) {
    let e = findPaneIdBySessionInLayout(r, t, t.sessionId),
      n = e ?? focusedPaneId(r);
    if (e) r.focusPane(e);
    else if (n !== `workspace-main` && r.panes[n]) {
      let e = r.panes[n]?.sessionId ?? null;
      r.replacePaneBinding(n, { workspaceScope: i.workspaceScope, sessionId: i.sessionId }),
        logger.debug(`[v4-workbench] draft split focused pane replaced`, {
          paneId: n,
          previousSessionId: e,
          sessionId: i.sessionId,
          workspaceKey: workspaceScopeKey(i.workspaceScope),
        });
    }
  }
  n.openSessionFromSidebar(i);
}

/** 原 NTt：可持久化会话绑定投影。 */
export function toPersistableSessionBinding(e: PaneWorkspaceScope & { sessionId: string }): {
  workspacePath: string;
  workspaceIdentity?: string;
  remoteSessionId?: string;
  sessionId: string;
} {
  return {
    workspacePath: e.workspacePath,
    ...(e.workspaceIdentity?.trim() ? { workspaceIdentity: e.workspaceIdentity } : {}),
    ...(e.remoteSessionId ? { remoteSessionId: e.remoteSessionId } : {}),
    sessionId: e.sessionId,
  };
}

/* ============================================================================
 * §E. 远端条目最小面 + persistableTabEntries（js 123197–123484 选段）
 * ==========================================================================*/

/** 原 WTt：远端会话历史上限。 */
export const REMOTE_SESSION_HISTORY_LIMIT = 20;

/** 原 M2：远端目标的凭据键集合。 */
export function remoteTargetCredentialKeys(e: RemoteSessionTarget): string[] {
  return e.kind === `ssh`
    ? [e.passwordCredentialKey, e.privateKeyPassphraseCredentialKey].filter((e): e is string => typeof e == `string` && e.length > 0)
    : e.kind === `server`
      ? [e.tokenCredentialKey].filter((e): e is string => typeof e == `string` && e.length > 0)
      : [];
}

/** 原 N2：是否远端会话条目。 */
export function isRemoteSessionEntry(e: { remoteSessionId?: string | null; remoteTarget?: unknown; workspaceIdentity?: string | null }): boolean {
  return !!(e.remoteSessionId || e.remoteTarget || e.workspaceIdentity);
}

/** 原 R2：会话条目工作区键（identity 优先，其次路径）。 */
export function sessionEntryWorkspaceKey(e: { workspaceIdentity?: string | null; workspacePath: string }): string {
  return e.workspaceIdentity?.trim() || e.workspacePath;
}

/** persistableTabEntries 的标签消费面（原 sEt 入参元素）。 */
export type PersistableWorkspaceTab = {
  kind?: unknown;
  workspacePath: string;
  workspacePurpose?: string | null;
  remoteSessionId?: string | null;
  remoteTarget?: unknown;
  workspaceIdentity?: string | null;
}

/** 原 sEt：可持久化标签条目（本地直录；远端经 entryMap 换取）。消费侧 declare 名同。
 * 行注（宽化）：第二参/返回按调用面泛化——bundle sEt 对映射值无型别断言（原样 push），
 * 消费侧（OnboardingLoginLeaves O3t）以本地宽松远端条目面流入，故以 T 承之；
 * 返回为 T 值与本地字面量的联合数组（与 bundle 逐字一致）。 */
export function persistableTabEntries<T extends { kind?: unknown; [key: string]: unknown }>(
  e: PersistableWorkspaceTab[],
  t: Map<string, T>,
): Array<T | { kind: `local`; workspacePath: string; workspacePurpose?: string }> {
  return e.reduce((e: Array<T | { kind: `local`; workspacePath: string; workspacePurpose?: string }>, n) => {
    if (!isWorkspaceKindTab(n)) return e;
    if (isRemoteSessionEntry(n)) {
      let r = sessionEntryWorkspaceKey(n),
        i = t.get(r);
      return i && e.push(i), e;
    }
    return (
      e.push({
        kind: `local`,
        workspacePath: n.workspacePath,
        ...(n.workspacePurpose ? { workspacePurpose: n.workspacePurpose } : {}),
      }),
      e
    );
  }, []);
}

/** lastWorkspaceSession 条目面（V2/cEt/lEt 消费面）。 */
export interface LastWorkspaceSessionEntry {
  kind: string;
  workspacePath: string;
  workspaceIdentity?: string | null;
  [key: string]: unknown;
}

/** 原 V2：读取 lastWorkspaceSession 数组。 */
export function lastWorkspaceSessionEntries(e: { lastWorkspaceSession?: unknown[] }): LastWorkspaceSessionEntry[] {
  return (e.lastWorkspaceSession ?? []) as LastWorkspaceSessionEntry[];
}

/** 原 cEt：仅远端 lastWorkspaceSession 条目。 */
export function lastRemoteSessionEntries(e: { lastWorkspaceSession?: unknown[] }): LastWorkspaceSessionEntry[] {
  return ((e.lastWorkspaceSession ?? []) as LastWorkspaceSessionEntry[]).flatMap((e) => (e.kind === `remote` ? [e] : []));
}

/** 原 lEt：按工作区键建会话条目映射。 */
/* 行注（宽化）：按调用面泛化——bundle lEt 对元素无型别断言（仅读 R2 面建键），
 * 消费侧以本地宽松条目面流入，故以 T 承之并原样回值。 */
export function sessionEntryMapByKey<T extends { workspacePath: string; workspaceIdentity?: string | null }>(e: T[]): Map<string, T> {
  return new Map(e.map((e) => [sessionEntryWorkspaceKey(e), e]));
}

/* ============================================================================
 * §F. 远端条目域余量（styles 123198–123456；A1-R4 转录，与 §E 选段合域）
 * ----------------------------------------------------------------------------
 * 凭据键 builder（GTt/KTt/qTt）+ 目标显示/键面（P2…QTt）+ 工作区键
 * （$Tt/eEt/I2/tEt/L2/nEt）+ 条目运算（rEt/iEt/z2/aEt/oEt/B2）。
 * Je=buildRemoteServerWorkspaceKey 自此真实消费（§尾空引用占位随删）。
 * A1-R5 增补：RBt/zBt（js 158183–158195）SSH 连接信息——同域异址（Sidebar
 * 会话行消费面），体例并入本节（见 §F-R5 分节注）。
 * A1-R6 增补 Hn 已于 A1-R7 更正删除（重复 canonical，见 §F-R6 更正注）。
 * A1-R7 增补：V2/cEt（恢复条目读取/远程过滤）+ BC/Bne（活动本地页签索引解析），
 * 见 §F-R7 分节注。
 * ==========================================================================*/

/** 原 GTt：ssh 密码凭据键。 */
export function remotePasswordCredentialKey(e: string): string {
  return `remote-workspace:${e}:password`;
}

/** 原 KTt：ssh 私钥口令凭据键。 */
export function remotePrivateKeyPassphraseCredentialKey(e: string): string {
  return `remote-workspace:${e}:private-key-passphrase`;
}

/** 原 qTt：server 令牌凭据键。 */
export function remoteServerTokenCredentialKey(e: string): string {
  return `remote-workspace:${e}:server-token`;
}

/** 原 P2：wsl 用户（修剪后，空则 undefined）。 */
export function trimmedRemoteUser(e: { user?: string | null }): string | undefined {
  return e.user?.trim() || void 0;
}

/** 原 JTt：wsl 连接键（distro/user 缺省归一）。 */
export function wslConnectionKey(e: { distro?: string; user?: string | null }): string {
  let t = trimmedRemoteUser(e);
  return e.distro
    ? t
      ? `wsl:${e.distro}:${t}`
      : `wsl:${e.distro}`
    : t
      ? `wsl:default:${t}`
      : `wsl`;
}

/** 原 YTt：server 显示名（name→serverId→url host）。 */
export function serverDisplayName(e: { name?: string | null; serverId?: string | null; url: string }): string {
  return e.name?.trim() || e.serverId?.trim() || serverUrlHost(e);
}

/** 原 F2：server url 之 host（解析失败回退原串）。 */
export function serverUrlHost(e: { url: string }): string {
  try {
    return new URL(e.url.trim()).host;
  } catch {
    return e.url.trim();
  }
}

/** 原 XTt：远端目标展示标签。
 * 行注（宽化）：参型为结构面——bundle 仅读 kind/username/host/port/distro/user/
 * container/name/serverId/url；消费侧（TopBar/Home 本地 RemoteTarget 面）皆可赋值。
 * 未知 kind 时 bundle 返回 undefined（无 default 分支），返回面含 undefined。 */
export function remoteTargetDisplayLabel(e: {
  kind?: string;
  host?: string;
  port?: number;
  username?: string;
  distro?: string;
  user?: string | null;
  container?: string;
  name?: string | null;
  serverId?: string | null;
  url?: string;
}): string | undefined {
  switch (e.kind) {
    case `ssh`:
      return `SSH · ${e.username}@${e.host}${e.port ? `:${e.port}` : ``}`;
    case `wsl`: {
      let t = trimmedRemoteUser(e);
      return [`WSL`, e.distro, t].filter(Boolean).join(` · `);
    }
    case `docker`:
      return `Docker · ${e.container}`;
    case `server`:
      return `Server · ${serverDisplayName(e as ServerRemoteTarget)}`; // 分支内 kind 已判别；结构面→联合成员收窄（bundle 仅读 name/serverId/url）
  }
}

/** 原 ZTt：远端目标连接地址。行注（宽化）：参型同 remoteTargetDisplayLabel 结构面。 */
export function remoteTargetConnectionAddress(e: {
  kind?: string;
  host?: string;
  port?: number;
  distro?: string;
  user?: string | null;
  container?: string;
  name?: string | null;
  serverId?: string | null;
  url?: string;
}): string | undefined {
  switch (e.kind) {
    case `ssh`:
      return e.port && e.port !== 22 ? `${e.host}:${e.port}` : e.host;
    case `wsl`:
      return wslConnectionKey(e);
    case `docker`:
      return `docker:${e.container}`;
    case `server`:
      return serverUrlHost(e as ServerRemoteTarget); // 分支内 kind 已判别；结构面→联合成员收窄（bundle 仅读 url）
  }
}

/** 原 QTt：ssh 别名装饰项目名。
 * 行注（宽化）：第二参结构面（仅读 kind/sshConfigAlias）；label 面消费侧可空。 */
export function sshDecoratedProjectName(
  e: string | undefined,
  t: { kind?: unknown; sshConfigAlias?: string | null } | null | undefined,
): string | undefined {
  if (t?.kind !== `ssh`) return e;
  let n = t.sshConfigAlias?.trim();
  return n ? `${e} [SSH: ${n}]` : e;
}

/** 原 $Tt：远端路径归一（反斜杠→斜杠、去尾部斜杠、裸根 `/`）。 */
export function normalizeRemoteEntryPath(e: string): string {
  let t = e.replace(/\\/g, `/`).replace(/\/+$/, ``);
  return t.length > 0 ? t : `/`;
}

/** 原 eEt：远端目标连接键（server 支经 Je 键去前缀/尾 `:/`）。 */
export function remoteTargetConnectionKey(e: RemoteSessionTarget): string {
  switch (e.kind) {
    case `ssh`: {
      let t = e.host.trim().toLowerCase(),
        n = e.username.trim();
      return [`ssh`, t, e.port ?? 22, n].join(`:`);
    }
    case `wsl`: {
      let t = trimmedRemoteUser(e),
        n = [`wsl`, e.distro ?? `default`];
      return t ? [...n, t].join(`:`) : n.join(`:`);
    }
    case `docker`:
      return [`docker`, e.container].join(`:`);
    case `server`:
      return buildRemoteServerWorkspaceKey({ serverId: resolveServerIdentity(e), workspacePath: `/` }).slice(7, -2);
  }
}

/** 原 I2：远端工作区键（server 支走 Je 全键，余者 `remote:<连接键>:<归一路径>`）。 */
export function buildRemoteWorkspaceKey(e: string, t: RemoteSessionTarget): string {
  return t.kind === `server`
    ? buildRemoteServerWorkspaceKey({ serverId: resolveServerIdentity(t), workspacePath: e })
    : `remote:${remoteTargetConnectionKey(t)}:${normalizeRemoteEntryPath(e)}`;
}

/** 原 tEt：server 身份解析（serverId→name→url host）。 */
export function resolveServerIdentity(e: ServerRemoteTarget): string {
  return e.serverId?.trim() || e.name?.trim() || serverUrlHost(e);
}

/** 原 L2：条目工作区身份（identity 优先，其次远端工作区键）。 */
export function resolveEntryWorkspaceIdentity(e: {
  workspaceIdentity?: string | null;
  workspacePath: string;
  target: RemoteSessionTarget;
}): string {
  return e.workspaceIdentity || buildRemoteWorkspaceKey(e.workspacePath, e.target);
}

/** 原 nEt：修剪或 undefined。 */
export function trimmedOrUndefined(e: string | null | undefined): string | undefined {
  return e?.trim() || void 0;
}

/** 原 rEt：按远端工作区键查条目。
 * 行注（宽化）：同 lEt 之泛化口径，以 T 承条目面。 */
export function findRemoteSessionEntry<T extends { workspaceIdentity?: string | null; workspacePath: string; target: RemoteSessionTarget }>(
  e: T[],
  t: string,
  n: RemoteSessionTarget,
): T | null {
  let r = buildRemoteWorkspaceKey(t, n);
  return e.find((e) => resolveEntryWorkspaceIdentity(e) === r) ?? null;
}

/** 原 iEt：连接用远端目标归一（凭据键承继：既有键优先，否则按工作区键派生）。 */
export function normalizeRemoteTargetForConnection(e: string, t: RemoteSessionTarget, n: RemoteSessionTarget | null | undefined): RemoteSessionTarget {
  switch (t.kind) {
    case `ssh`:
      return {
        kind: `ssh`,
        host: t.host,
        port: t.port,
        username: t.username,
        ...(t.sshConfigAlias?.trim() ? { sshConfigAlias: t.sshConfigAlias.trim() } : {}),
        assetInstallMode: t.assetInstallMode,
        privateKeyPath: t.privateKeyPath,
        passwordCredentialKey:
          t.password && t.password.length > 0
            ? n?.kind === `ssh` && n.passwordCredentialKey
              ? n.passwordCredentialKey
              : remotePasswordCredentialKey(e)
            : void 0,
        privateKeyPassphraseCredentialKey:
          t.privateKeyPassphrase && t.privateKeyPassphrase.length > 0
            ? n?.kind === `ssh` && n.privateKeyPassphraseCredentialKey
              ? n.privateKeyPassphraseCredentialKey
              : remotePrivateKeyPassphraseCredentialKey(e)
            : void 0,
      };
    case `wsl`: {
      let e = t.user?.trim();
      return { kind: `wsl`, distro: t.distro, ...(e ? { user: e } : {}) };
    }
    case `docker`:
      return { kind: `docker`, container: t.container };
    case `server`:
      return {
        kind: `server`,
        url: t.url,
        ...(t.name?.trim() ? { name: t.name.trim() } : {}),
        ...(t.workspacePath?.trim() ? { workspacePath: t.workspacePath.trim() } : {}),
        ...(t.serverId?.trim() ? { serverId: t.serverId.trim() } : {}),
        tokenCredentialKey:
          t.token && t.token.length > 0
            ? n?.kind === `server` && n.tokenCredentialKey
              ? n.tokenCredentialKey
              : remoteServerTokenCredentialKey(e)
            : void 0,
      };
  }
}

/** 原 z2：远端目标并凭据明文（条件展开）。 */
export function remoteTargetWithSecrets(e: RemoteSessionTarget, t: RemoteSessionSecrets): RemoteSessionTarget {
  switch (e.kind) {
    case `ssh`:
      return {
        kind: `ssh`,
        host: e.host,
        port: e.port,
        username: e.username,
        ...(e.sshConfigAlias ? { sshConfigAlias: e.sshConfigAlias } : {}),
        ...(e.assetInstallMode ? { assetInstallMode: e.assetInstallMode } : {}),
        ...(e.privateKeyPath ? { privateKeyPath: e.privateKeyPath } : {}),
        ...(t.password ? { password: t.password } : {}),
        ...(t.privateKeyPassphrase ? { privateKeyPassphrase: t.privateKeyPassphrase } : {}),
      };
    case `wsl`:
      return { kind: `wsl`, distro: e.distro, ...(e.user ? { user: e.user } : {}) };
    case `docker`:
      return { kind: `docker`, container: e.container };
    case `server`:
      return {
        kind: `server`,
        url: e.url,
        ...(e.name ? { name: e.name } : {}),
        ...(e.workspacePath ? { workspacePath: e.workspacePath } : {}),
        ...(e.serverId ? { serverId: e.serverId } : {}),
        ...(t.token ? { token: t.token } : {}),
      };
  }
}

/** 原 aEt：触达条目（置顶 + 按 lastOpenedAt 降序 + 历史上限）。 */
export function touchRemoteSessionEntry(e: RemoteSessionEntry[], t: RemoteSessionEntry): RemoteSessionEntry[] {
  let n = sessionEntryWorkspaceKey(t);
  return [t, ...e.filter((e) => sessionEntryWorkspaceKey(e) !== n)]
    .sort((e, t) => t.lastOpenedAt - e.lastOpenedAt)
    .slice(0, REMOTE_SESSION_HISTORY_LIMIT);
}

/** 原 oEt：移除条目并收集待删凭据键。 */
export function removeRemoteSessionEntries(e: RemoteSessionEntry[], t: string[]): { nextRemoteSessions: RemoteSessionEntry[]; credentialKeysToDelete: string[] } {
  let n = new Set(t.map((e) => e.trim()).filter(Boolean)),
    r = new Set<string>(),
    i: RemoteSessionEntry[] = [];
  for (let t of e) {
    let e = sessionEntryWorkspaceKey(t);
    if (!n.has(e)) {
      i.push(t);
      continue;
    }
    for (let e of remoteTargetCredentialKeys(t.target)) r.add(e);
  }
  return { nextRemoteSessions: i, credentialKeysToDelete: [...r] };
}

/** 原 B2：应用远程连接结果（条目触达 + 凭据增删清单）。 */
export function applyRemoteConnectionResult(e: RemoteConnectionResultInput): RemoteConnectionResult {
  let t = findRemoteSessionEntry(e.remoteSessions, e.workspacePath, e.target) ?? null,
    n = e.workspaceIdentity ?? t?.workspaceIdentity ?? buildRemoteWorkspaceKey(e.workspacePath, e.target),
    r = n?.trim() || e.workspacePath,
    i = e.lastConnectionStatus === `failed` && t ? t.target : normalizeRemoteTargetForConnection(r, e.target, t?.target),
    a = trimmedOrUndefined(e.localWorkspacePath ?? t?.localWorkspacePath),
    o: RemoteSessionEntry = {
      kind: `remote`,
      workspacePath: e.workspacePath,
      ...(a ? { localWorkspacePath: a } : {}),
      workspaceIdentity: n,
      target: i,
      lastOpenedAt: e.touchOpenedAt ? Date.now() : (t?.lastOpenedAt ?? Date.now()),
      lastConnectionStatus: e.lastConnectionStatus,
      lastConnectionError:
        e.lastConnectionStatus === `failed`
          ? (e.lastConnectionError ?? t?.lastConnectionError)
          : void 0,
    },
    s = touchRemoteSessionEntry(e.remoteSessions, o),
    c = new Set(s.map((e) => sessionEntryWorkspaceKey(e))),
    l = new Set<string>(),
    u = new Set(t ? remoteTargetCredentialKeys(t.target) : []),
    d = new Set(remoteTargetCredentialKeys(i));
  for (let e of u) d.has(e) || l.add(e);
  for (let t of e.remoteSessions) if (!c.has(sessionEntryWorkspaceKey(t))) for (let e of remoteTargetCredentialKeys(t.target)) l.add(e);
  let f: Array<{ key: string; value: string }> = [];
  return (
    e.target.kind === `ssh` &&
      i.kind === `ssh` &&
      e.target.password &&
      i.passwordCredentialKey &&
      f.push({ key: i.passwordCredentialKey, value: e.target.password }),
    e.target.kind === `ssh` &&
      i.kind === `ssh` &&
      e.target.privateKeyPassphrase &&
      i.privateKeyPassphraseCredentialKey &&
      f.push({ key: i.privateKeyPassphraseCredentialKey, value: e.target.privateKeyPassphrase }),
    e.target.kind === `server` &&
      i.kind === `server` &&
      e.target.token &&
      i.tokenCredentialKey &&
      f.push({ key: i.tokenCredentialKey, value: e.target.token }),
    { entry: o, nextRemoteSessions: s, credentialsToSave: f, credentialKeysToDelete: [...l] }
  );
}

/* ----------------------------------------------------------------------------
 * §F-R5. SSH 连接信息（RBt/zBt，js 158183–158195；A1-R5 转录）
 * ----------------------------------------------------------------------------
 * Sidebar 会话行 SSH 详情面（alias / `user@host:port` / workspacePath）。
 * RBt ≢ ZTt（remoteTargetConnectionAddress）：RBt 恒含 username 与 port（缺省 22），
 * ZTt ssh 支为 `host[:port]`（port 仅非 22 时在）——R4 §8-5「zBt 改指 ZTt」前提
 * 经 bundle 对照作废，RBt/zBt 独立转录。
 * 型别宽化：zBt 参型为结构面（消费侧传本地 RemoteTarget 形）；kind 判定后
 * `as SshRemoteTarget` 收窄（同 XTt/ZTt server 支体例，行注在调用处）。
 * ==========================================================================*/

/** 原 RBt（js 158183）：ssh 连接显示标签 `user@host:port`（port 缺省 22）。 */
export function sshHostLabel(e: { username: string; host: string; port?: number }): string {
  return `${e.username.trim()}@${e.host.trim()}:${e.port ?? 22}`;
}

/** 原 zBt（js 158186）：工作区页签 → SSH 连接信息；非 ssh 返回 null。 */
export function resolveSshConnectionInfo(e: {
  remoteTarget?: { kind?: string; host?: string | null; port?: number | null; username?: string | null; sshConfigAlias?: string | null } | null;
  workspacePath: string;
}): { alias: string | null; hostLabel: string; workspacePath: string } | null {
  return e.remoteTarget?.kind === `ssh`
    ? {
        alias: e.remoteTarget.sshConfigAlias?.trim() || null,
        // A1-R5 型别宽化：kind 已判别，结构面 → SshRemoteTarget 收窄（非 any cast）。
        hostLabel: sshHostLabel(e.remoteTarget as SshRemoteTarget),
        workspacePath: e.workspacePath,
      }
    : null;
}

/* ----------------------------------------------------------------------------
 * §F-R6 → A1-R7 更正：stripRemoteTargetSecrets 重复转录已删除
 * ----------------------------------------------------------------------------
 * A1-R6 曾于此转录 Hn（src-HCld2afU.js 2–13）；A1-R7 侦查发现该符号 canonical
 * 早在 A0-S4-1 已落地：lib/workspaceUtils.ts sanitizeWorkspaceDescriptor
 * （src 本地 t → 导出 Ns → styles 导入 Hn@535，同源符号），经 SrcSharedA/B
 * re-export、facade/srcChunkFacade.ts 登记（Ns→sanitizeWorkspaceDescriptor）。
 * R6 转录属重复 canonical（侦查漏检），本批删除；OnboardingLoginLeaves 之
 * serializeRemoteTarget 改指 SrcSharedA.sanitizeWorkspaceDescriptor。
 * ==========================================================================*/

/* ----------------------------------------------------------------------------
 * §F-R7. 恢复条目读取/解析（V2/cEt + BC/Bne；A1-R7 转录）
 * ----------------------------------------------------------------------------
 * V2（styles 123475）/cEt（styles 123478）：settings.lastWorkspaceSession 之
 * 读取与远程过滤——与本节 sEt(123457)/lEt(123481) 同 bundle 块（123457–123481），
 * 归此成簇。BC/Bne 真形在 src chunk（BC=9620–9623，Bne=VC 9624–9628；styles 经
 * `t as Bne`@774 导入，src 导出 `VC as t`@10014，两跳）——编排域 k3t 恢复流
 * 独消费（208852），与 V2 输出成对，故并入本节。
 * 消费面：OnboardingLoginLeaves 原 persistableWorkspaceTabs /
 * normalizePersistedRemoteSessions / resolveLastActiveTabIndex declare 改指。
 * ==========================================================================*/

/** 原 V2 读取面：持久化页签记录（lastWorkspaceSession 条目，local/remote 混存）。 */
export interface PersistedWorkspaceTabRecord {
  kind?: string;
  workspacePath: string;
  workspaceIdentity?: string | null;
  workspacePurpose?: string;
  remoteSessionId?: string;
  remoteTarget?: unknown;
  [key: string]: unknown;
}

/** 原 V2（styles 123475）：读取 settings.lastWorkspaceSession（缺省空数组）。
 *  型别注：参型带索引签名以纳 AppSettings 面（弱型检查豁免）。 */
export function persistedWorkspaceSessions(e: { lastWorkspaceSession?: PersistedWorkspaceTabRecord[]; [key: string]: unknown }): PersistedWorkspaceTabRecord[] {
  return e.lastWorkspaceSession ?? [];
}

/** 原 cEt（styles 123478）：过滤持久化条目中的远程条目。
 *  A1-R7 宽化行注：持久化远程条目运行期按 RemoteSessionEntry 面消费
 *  （target/lastOpenedAt 由落库面保证；A0 declare 原主张），结构 cast。 */
export function persistedRemoteSessions(e: { lastWorkspaceSession?: PersistedWorkspaceTabRecord[]; [key: string]: unknown }): RemoteSessionEntry[] {
  return (e.lastWorkspaceSession ?? []).flatMap((entry) => (entry.kind === `remote` ? [entry as RemoteSessionEntry] : []));
}

/** 原 BC（src-HCld2afU.js 9620–9623）：区间内寻首个 local 条目索引。 */
function findLocalEntryIndexInRange(e: Array<{ kind?: string }>, t: number, n: number): number | null {
  for (let r = t; r < n; r += 1) if (e[r]?.kind === `local`) return r;
  return null;
}

/** 原 Bne（src-HCld2afU.js 9624–9628 VC，经 t-as-Bne 两跳）：钳位后双向寻活动本地页签索引。 */
export function resolveLastActiveTabIndex(e: Array<{ kind?: string }>, t: number | null | undefined): number | null {
  if (e.length === 0) return null;
  let n = Math.min(Math.max(t ?? 0, 0), e.length - 1);
  return findLocalEntryIndexInRange(e, n, e.length) ?? findLocalEntryIndexInRange(e, 0, n);
}

/* ============================================================================
 * §尾、未用导入占位（保持与 bundle 依赖面一致）
 * ==========================================================================*/

/* ── tombstone（A1-R4）：Je（buildRemoteServerWorkspaceKey）空引用占位（原 `void buildRemoteServerWorkspaceKey;`）
 *    迁除——§F 之 remoteTargetConnectionKey(eEt)/buildRemoteWorkspaceKey(I2) 已真实消费该 import
 *    （js 123290/123298，server 支）。实证：本文件内 `buildRemoteServerWorkspaceKey(` 调用点 ×2。 ── */
void React;

/* ============================================================================
 * 尾部符号总表（原混淆名 → 语义名 → js 行，便于回代核验）
 * ==========================================================================*/
/*
 * [A] swt=readNavigationEntries(121373) z0=isReloadNavigationEntry(121382)
 *     B0=MAIN_PANE_ID(121385) cwt=MIN_SPLIT_RATIO lwt=MAX_SPLIT_RATIO V0=DEFAULT_SPLIT_RATIO(121386-88)
 *     H0=clampSplitRatio(121389) U0=workspaceScopeKey(121392) W0=paneBindingMatchesSession(121395)
 *     G0=PRIMARY_PANE_LEAF(121398) K0=EMPTY_PANE_LAYOUT(121399) q0=collectLeafPaneIds(121400)
 *     J0=countLayoutPanes(121403) Y0=canAddLayoutPane(121406) X0=layoutHasPaneId(121409)
 *     Z0=focusedPaneId(121412) uwt=nextLeafPaneId(121415) Q0=collectSplitNodeIds(121423)
 *     dwt=nextSplitNodeId(121426) $0=replacePaneNode(121434) e2=removePaneNode(121440)
 *     t2=setPaneNodeRatio(121447) fwt=splitPaneInLayout(121454) n2=splitPaneBesideInLayout(121467)
 *     pwt=closePaneInLayout(121483) mwt=bindPaneSessionInLayout(121492) hwt=replacePaneBindingInLayout(121498)
 *     gwt=findPaneIdBySessionInLayout(121503) _wt=setLayoutSplitRatio(121507) r2=focusLayoutPane(121511)
 *     vwt=confirmRestoredPaneInLayout(121514) ywt=openSessionInLayout(121523)
 * [B] bwt=PANE_LAYOUT_STORAGE_KEY_V2 xwt=PANE_LAYOUT_STORAGE_KEY_V1 i2=LEGACY_SPLIT_PANE_ID(121529-31)
 *     a2=parsePaneNode(121532) Swt=parsePaneWorkspaceScope(121561) Cwt=parseStoredPaneLayout(121576)
 *     wwt=isAbsoluteWorkspacePath(121607) Twt=parseLegacyPaneLayout(121610) Ewt=loadStoredPaneLayout(121636)
 *     o2=clonePaneNode(121646) Dwt=lastSerializedPaneLayout(121658) Owt=persistPaneLayout(121659)
 *     kwt=storedPaneLayout Awt=restoredPaneLayout(121681-82) jwt=hasSplitLayoutBindings(121683)
 *     s2=splitLayoutStore(121686)
 * [C] nTt=ROUTER_STORAGE_KEY g2=EMPTY_ROUTER_STATE _2=workbenchClientMode v2=routerStateHydrated(122306-08)
 *     y2=isWorkbenchRouterEnabled(122309) b2=sessionBindingIndexKey(122312) x2=paneBindingIndexKey(122315)
 *     S2=sameSessionBinding(122318) rTt=toRestorableSessionBinding(122321) C2=toSessionBindingOrNull(122329)
 *     w2=groupSessionBindings(122339) iTt=groupContainsBinding(122342) T2=paneBindingById(122346)
 *     E2=focusedGroupBinding(122349) aTt=findGroupPaneIdByBinding(122352) oTt=nextGroupId(122357)
 *     sTt=createSessionGroup(122365) cTt=groupFromPaneLayout(122381) lTt=focusGroupPane(122401)
 *     uTt=splitGroupPaneBeside(122405) dTt=closeGroupPane(122416) fTt=confirmGroupRestoredSession(122428)
 *     pTt=buildGroupSessionIndex(122439) D2=withUpsertedGroup(122444) mTt=withRemovedGroup(122448)
 *     hTt=withSessionSplitIntoGroup(122459) gTt=withPromotedPaneLayoutGroup(122469)
 *     _Tt=withFocusedSessionBinding(122475) vTt=withGroupPaneSessionBound(122485)
 *     yTt=routerSafeLocalStorage(122505) O2=isPlainRecord(122512) k2=parseRouterPaneNode(122515)
 *     bTt=parseRouterWorkspaceScope(122533) xTt=parseRouterRestoredBinding(122542)
 *     STt=parseStoredSessionGroup(122547) CTt=parseStoredRouterState(122574) wTt=persistRouterState(122597)
 *     TTt=loadStoredRouterState(122625) A2=sessionRouterStore(122636)
 * [D] ETt=toSessionBindingFromScope(122716) DTt=hasSplitPaneBindingFor(122720)
 *     OTt=resolveSplitSessionPlan(122726) kTt=isSplitPlanActionable(122756)
 *     ATt=canOpenSessionInSplit(122759) jTt=openSessionInSplit(122762) MTt=openSessionBesideDraft(122791)
 *     NTt=toPersistableSessionBinding(122812)
 * [E] WTt=REMOTE_SESSION_HISTORY_LIMIT(123197) M2=remoteTargetCredentialKeys(123207)
 *     N2=isRemoteSessionEntry(123216) R2=sessionEntryWorkspaceKey(123306) sEt=persistableTabEntries(123457)
 *     V2=lastWorkspaceSessionEntries(123475) cEt=lastRemoteSessionEntries(123478) lEt=sessionEntryMapByKey(123481)
 * [F] GTt=remotePasswordCredentialKey(123198) KTt=remotePrivateKeyPassphraseCredentialKey(123201)
 *     qTt=remoteServerTokenCredentialKey(123204) P2=trimmedRemoteUser(123219) JTt=wslConnectionKey(123222)
 *     YTt=serverDisplayName(123232) F2=serverUrlHost(123235) XTt=remoteTargetDisplayLabel(123242)
 *     ZTt=remoteTargetConnectionAddress(123256) QTt=sshDecoratedProjectName(123268) $Tt=normalizeRemoteEntryPath(123273)
 *     eEt=remoteTargetConnectionKey(123277) I2=buildRemoteWorkspaceKey(123295) tEt=resolveServerIdentity(123300)
 *     L2=resolveEntryWorkspaceIdentity(123303) nEt=trimmedOrUndefined(123309) rEt=findRemoteSessionEntry(123312)
 *     iEt=normalizeRemoteTargetForConnection(123316) z2=remoteTargetWithSecrets(123362)
 *     aEt=touchRemoteSessionEntry(123397) oEt=removeRemoteSessionEntries(123403) B2=applyRemoteConnectionResult(123416)
 *     RBt=sshHostLabel(158183) zBt=resolveSshConnectionInfo(158186)（A1-R5：Sidebar 会话行消费面）
 *     Hn：A1-R7 更正——canonical = SrcSharedA sanitizeWorkspaceDescriptor（A0-S4-1），R6 重复转录删除。
 *     V2=persistedWorkspaceSessions(123475) cEt=persistedRemoteSessions(123478)
 *     Bne=resolveLastActiveTabIndex(src 9624–9628)（A1-R7：恢复条目域，§F-R7）
 * —— uEt(123484) 已于 A1-R5 转录至 modules/RemoteConnectionDeep.tsx（useCancelPendingRemoteConnection）。
 *    H2/U2(123497/123510) canonical 在他域：components/modals/ConfirmDialog.tsx（live 路径，
 *    Modals.tsx 再导出）+ stores/confirmDialogStore.ts（A0-S4-3 并行）——R4 §5「远程域专用确认」
 *    归属作废：bundle 206864–206865 对话框呈现层直接消费 H2，实为全局 ConfirmDialogStore。
 *    RTt…HTt(123139-123193) 已于 A1-R4 转录至 modules/SplitLayoutUiDeep.tsx（表现层域）。 ——
 */

