// A1-P1-B3：R0 ConversationPane 本体逐字重建（styles js 119236–121300，2,065 行，230 内部局部，109 外部消费面）。
// 真身基准（只读）：desktop/src/out/renderer/assets/styles-CdEGpc2x.js（md5 48d71d4874b0868d61fd35a328bf6ad5）。
// 落点裁定：新叶。原 A0 体留守 modules/Conversation.tsx §9.5（4893–5600 段）本批收敛删碑 → 改经本叶再导出。
// 环安全论证：本叶 → modules/Conversation 取 useSessionSnapshot/ConversationMessageList/parseGoalCommand/
//   PaneFloatingHeader/PluginIconGate（均为导出绑定，仅渲染期调用）；modules/Conversation → 本叶仅
//   ConversationPane 再导出（其消费方 SplitLayoutUiDeep 890/1453 亦仅渲染期调用）。双向均无模块求值期
//   访问（函数声明提升 + ESM live binding），环为延迟消费环，esbuild/tsc/运行时三面安全。
// 转录机制：AST 精确改名（仅自由标识符引用位点；声明位点/属性名/解构键/标签不动）——323 处改名，
//   往返核对（逆映射还原 ≡ bundle 逐字）在案（/tmp/a1r0-p1/r0-roundtrip.js）；函数体内 230 局部保留混淆名（B5 约定）。
// 型缝仅一处：119282 props 解构收口 `}) {` → `}: any) {`（调用面 = SplitLayoutUiDeep 890/1453 透传 ~68 props）。
//
// 映射表（minified → 语义名 → bundle 定义行 → 属主）：
//   【真实 import】
//   Q→React | $→jsx-runtime | J→logger（SkillStore）| m→toast（ImeComposition）
//   xe→useTaskStore | Le→writeLastAgentConfig | V→readLastAgentModelConfig | ue→persistLastAgentConfigIfUnchanged
//   se→parseCustomModelId | we→formatCustomModelId | Ie→getCurrentModelValue | de→getCurrentThoughtLevelValue（SkillStore）
//   q→providerIds | Ei→isGlmAgentCliProvider（SrcSharedA）
//   mi→customProviderRef | qr→joinTestidParts | yr→v4SessionPaneTestid | pre→v4RetrySubscribeTestid
//   tt→chatEmptyTestid | Ai→listProviderModelIds（SrcSharedB）
//   G→useIntlContext（I18n useZCodeIntl）| wT→useTelemetrySupervisor | SFe→useIsTelemetryForeground
//   ET→useV4Conversation（services/telemetryScopes）| fs→useServices | Ec→useBaseServices
//   Ks→syncProviderRegistryAndReturn（modules/services）| Ao→useSettingsStoreValue（stores/settingsStore）
//   Mg→parseLooseModelValue | Sit→GreetingHero | kit→OffPeakNewTaskBanner | _it→isEventInsideDialog
//   git→DraftComposerRegionMemo（modules/Home；hit 91174 memo 面）
//   JM→useAppSettings | PUe→useProviderFamilyConnectionSettings | fM→listCodingPlanSources（modules/UsageDeep）
//   VV→useIsMobileTextInputViewport（modules/Composer）| lo→DEFAULT_CODE_PREVIEW_SETTINGS（modules/MarkdownIntegration）
//   oNe→isFirstTurnHeaderMissing（modules/FeedbackCenter）| NCt→useSessionErrorRecovery（modules/ConversationLeaves）
//   wCt→useSessionSubscriptionErrorReporter | vCt→RuntimeAuthHeadersController（modules/ConversationOverlays）
//   tlt→buildSummaryPanelModel | Uct→resolveSummaryPanelVariant | Ilt→ConversationSummaryAside（modules/TopBar；Flt 99533 memo 面）
//   ow→requestSettingsSectionOpen（modules/Settings 别名 requestSettingsSectionNavigation，39380；R0 消费面 120988 直连）
//   Art→useCodingPlanUpgradeDialogOptional（modules/PaymentDeep，89105；R0 消费面 119444 直连）
//   k0→useSessionSnapshot | zbt→ConversationMessageList | m1→parseGoalCommand | jit→PaneFloatingHeader
//   Wbt→PluginIconGate（modules/Conversation；本批补 export）
//   gst→SessionQuotaBanner | _st→PendingCommandBanner（./SessionBanners）| dst→MemoQueuePanel（./QueuePanel）
//   pSt→ConversationInteractionsOverlay（./ConversationInteractionsOverlay）
//   nwt/rwt/iwt/awt/ZCt/QCt/twt/$Ct/ewt（./ConversationPaneHelpers，A1-P1 批 1）| XCt→useSessionQuotaViewModel（./ConversationQuotaModel，A1-P1-B2）
//   av→Hand（lucide-react）
//   【declare 群（属主未导出 / 无树属主，见下方各注）】
//   hw→canLoadOlderRows | K1→pendingCommandLedger | OS→buildCommand | OCt→useRecoverablePendingCommands
//   Wct→shouldShowSummaryPanel | mc→useOptionalTabStore | Bqe→isSlashPanelAvailable | fj→useBillingDiscountCore
//   rN→composeProviderModelLabel | sUe→buildTelemetryScopeKey | OM→isProviderNotReadyError | NM→prepareWorkspaceModelInit
//   JUe→applyWorkspaceDefaultModel | eN→resolveInteractionBehaviorMode | tWe→useDraftModelConfigSession
//   nN→packFollowupModeConfig | rWe→resolveExplicitIntentTransition | iWe→isExplicitIntentTargetSession
//   aWe→matchExplicitIntentConfig | oWe→resolveConfigModelTarget | fWe→useRuntimeModelBinding | pWe→useModelProviderGate
//   PM→buildCodingPlanPurchaseFunnelContext | IM→resolveEntryPlanStateFromSnapshot
//   _oe→selectionScopeKey | voe→dedupeSelectionLoad | yoe→unregisterSelectionSubscriber | boe→setSelectionSubscribed
//   xoe→hasSelectionSubscriber | Soe→onSelectionsChanged | Coe→registerSelectionDialogState
//   Ts→clearSessionSelections | Es→addSelectionReference
//   Bbt→isLiveSessionMatch | Vbt→hasPluginUserInputRows | qbt→createSerialQueue | B1→CONFIG_COMMAND_SUPERSEDED
//   z1→isStaleProtocolAck | Jbt→createSupersedingCommandScheduler | V1→recordCommandAckE2E
/* eslint-disable */
import * as React from "react";
import * as $ from "react/jsx-runtime"; // 原 $（jsx-runtime-B5yMD3-t.js；A1-R15 判例：编译形 JSX 消费面）
import { Hand } from 'lucide-react'; // 原 av（27243：Sa('hand', ...) lucide 工厂面）
import { logger, useTaskStore, writeLastAgentConfig, readLastAgentModelConfig, persistLastAgentConfigIfUnchanged, parseCustomModelId, formatCustomModelId, getCurrentModelValue, getCurrentThoughtLevelValue } from '../../modules/SkillStore'; // 原 J/xe/Le/V/ue/se/we/Ie/de（skillStore-BmeKHDBI.js :: t/h/x/E/S/O/k/w/T）
import { toast } from '../../modules/ImeComposition'; // 原 m（imeComposition-DEYFkwWm.js :: _）
import { providerIds, isGlmAgentCliProvider } from '../../modules/SrcSharedA'; // 原 q（src :: mo）/ Ei（src :: us = Ds）
import { customProviderRef, joinTestidParts, v4SessionPaneTestid, v4RetrySubscribeTestid, chatEmptyTestid, listProviderModelIds } from '../../modules/SrcSharedB'; // 原 mi/qr/yr/pre/tt/Ai（src :: j/Xa/Sa/ya/An/wo）
import { useZCodeIntl as useIntlContext } from '../../modules/I18n'; // 原 G（IntlProvider-C321H7m8.js :: n）
import { useTelemetrySupervisor, useIsTelemetryForeground, useV4Conversation } from '../../services/telemetryScopes'; // 原 wT/SFe/ET（42764/42768/42803）
import { useServices, useBaseServices, syncProviderRegistryAndReturn } from '../../modules/services'; // 原 fs/Ec/Ks（2674/4944/4163=async(e)=>await vse(e)）
import { useSettingsStoreValue } from '../../stores/settingsStore'; // 原 Ao（1300：Oo 上下文 + useSyncExternalStore 缺省面）
import { useAppSettings, useProviderFamilyConnectionSettings, listCodingPlanSources } from '../../modules/UsageDeep'; // 原 JM/PUe/fM（53487/52742/52680）
import { useIsMobileTextInputViewport } from '../../modules/Composer'; // 原 VV（66154）
import { DEFAULT_CODE_PREVIEW_SETTINGS } from '../../modules/MarkdownIntegration'; // 原 lo（1040）
import { isFirstTurnHeaderMissing } from '../../modules/FeedbackCenter'; // 原 oNe（39818）
import { useSessionErrorRecovery } from '../../modules/ConversationLeaves'; // 原 NCt（118778；A1-R14 实体化）
import { RuntimeAuthHeadersController, useSessionSubscriptionErrorReporter } from '../../modules/ConversationOverlays'; // 原 vCt/wCt（118624/118663）
import { buildSummaryPanelModel, resolveSummaryPanelVariant, ConversationSummaryAside } from '../../modules/TopBar'; // 原 tlt/Uct/Ilt（98180/98063/99533=Flt memo 面）
import { GreetingHero, OffPeakNewTaskBanner, isEventInsideDialog, DraftComposerRegionMemo, parseLooseModelValue } from '../../modules/Home'; // 原 Sit/kit/_it/git/Mg（91266/91638/91223/91174/24405）
import { requestSettingsSectionNavigation as requestSettingsSectionOpen } from '../../modules/Settings'; // 原 ow（39380；modules/Settings 187 别名面；R0 120988 `ow('modelProvider')` 直连）
import { useCodingPlanUpgradeDialogOptional } from '../../modules/PaymentDeep'; // 原 Art（89105；R0 119444 `kt = Art()` 直连）
import { useSessionSnapshot, ConversationMessageList, parseGoalCommand, PaneFloatingHeader, PluginIconGate } from '../../modules/Conversation'; // 原 k0/zbt/m1/jit/Wbt（118691/115573/111720/91849/115606；环安全见头注）
import { SessionQuotaBanner, PendingCommandBanner } from './SessionBanners'; // 原 gst/_st（94875/94945）
import { MemoQueuePanel } from './QueuePanel'; // 原 dst（94849 memo 面）
import { ConversationInteractionsOverlay } from './ConversationInteractionsOverlay'; // 原 pSt（117598）
import { dataTransferContainsFiles, isProviderNotInRegistryFailure, buildQueueItemEditDraft, isAckAcceptedOrDuplicate, isImmediateInputRouting, buildSessionErrorKey, buildSessionErrorBannerModel, EMPTY_SUBAGENT_DIRECTORY, INFLIGHT_COMMAND_CACHE_LIMIT, hasBlockingInteractions, hasCompactOrGoalRows } from './ConversationPaneHelpers'; // 原 nwt/rwt/iwt/awt/ZCt/QCt/twt/$Ct/ewt（A1-P1 批 1）+ Vgt/Hgt（〔A1-P1-B4〕实体化收敛）
import { selectionScopeKey, dedupeSelectionLoad, unregisterSelectionSubscriber, setSelectionSubscribed, hasSelectionSubscriber, onSelectionsChanged, registerSelectionDialogState, clearSessionSelections, addSelectionReference } from './ConversationSelectionCore'; // 原 _oe/voe/yoe/boe/xoe/Soe/Coe/Ts/Es（styles 2683–2837；〔A1-P1-B4〕选择域真身叶，declare 群收敛）
import { isSlashPanelAvailable } from '../../modules/Composer'; // 原 Bqe（64184；modules/Composer 1796；〔A1-P1-B4〕export 收敛）
import { useBillingDiscountCore } from '../usage/UsageDeep'; // 原 fj（51912；components/usage/UsageDeep 1861；〔A1-P1-B4〕export 收敛）
import { composeProviderModelLabel } from '../settings/SubagentLeaves'; // 原 rN（53789；components/settings/SubagentLeaves 310；〔A1-P1-B4〕export 收敛）
import { useSessionQuotaViewModel } from './ConversationQuotaModel'; // 原 XCt（119101；A1-P1-B2）

/* ── declare 群（〔A1-P1-B3〕§0）：真身未实体化或属主未导出；各注属主与留批去向。 ── */

/* ── declare 群（〔A1-P1-B3〕§0）：真身未实体化或属主未导出；各注属主与留批去向。
 *    型面一律宽化 any（真身缺位，调用面逐字优先；真身落地批按属主型面收窄）。 ── */

/** 原 hw（js 39813）：窗口首行不属当前首 turn → 可加载更早；canonical 同面 declare modules/Conversation.tsx:4689（该面文件内消费，本面 R0 121260 消费） */
declare function canLoadOlderRows(snapshot: any): boolean;
/** 原 K1（js 115758）：待恢复命令账本（跨会话单例）；canonical 同面 declare modules/Conversation.tsx:4839 / ConversationInteractionsOverlay.tsx:27（各自文件内消费；本面 R0 119487–120297 消费） */
declare const pendingCommandLedger: {
  record(command: any, clientContext?: any): void;
  applyAck(command: any, ack: any): void;
  settle(sessionId: any, sourceCommandId: any): void;
  subscribe(listener: any): any;
  reconcileSnapshot(snapshot: any): void;
  reconcileSession(sessionId: any, queryCommands: any): any;
  listRecoverable(sessionId: any): any[];
  dismissRecovery(sessionId: any, commandId: any): void;
  consumeReplay(args: any): any;
};
/** 原 OS（js 34629）：命令工厂（CAS/row-target 校验 + commandId/clientId/issuedAt 装配）；canonical 同面 declare ConversationInteractionsOverlay.tsx:21 */
declare function buildCommand(args: any): any;
/** 原 OCt（js 118709）：可恢复命令列表钩子（当前会话 + 本工作区草稿会话）；原 declare modules/Conversation.tsx:4865 随 R0 迁出（该面消费仅在 §9.5 A0 体，收敛随删） */
declare function useRecoverablePendingCommands(args: any): any[];
/** 原 Wct（js 98066）：摘要面板布局门控（hasContent && variant!=='mini'）；原 declare modules/Conversation.tsx:4926 随 R0 迁出 */
declare function shouldShowSummaryPanel(args: any): boolean;
/** 原 mc（jsx 3606）：可选 tab store 选择器；canonical 同面 declare components/shell/Sidebar.tsx:1082（未导出） */
declare function useOptionalTabStore(selector: any): any;
/* Bqe/fj/rN：〔A1-P1-B4〕export 收敛——真身 import 见导入面（modules/Composer 1796 / components/usage/UsageDeep 1861 / components/settings/SubagentLeaves 310），declare 删 */
/** 原 sUe（js 52292）：遥测作用域键（workspace::pane::session|task；无树属主，留批） */
declare function buildTelemetryScopeKey(args: any): any;
/** 原 OM（js 52930）：供应商未就绪错误判定（it 归一化面 + Hr=ZCODE_AGENT_PROVIDER_NOT_READY；无树属主，留批） */
declare function isProviderNotReadyError(error: any): boolean;
/** 原 NM（js 52997）：[zcode-model-init] workspace prepare 编排器（无树属主，留批） */
declare function prepareWorkspaceModelInit(args: any): any;
/** 原 JUe（js 53414）：工作区默认模型应用（setWorkspaceDefaultModel + 草稿面；无树属主，留批） */
declare function applyWorkspaceDefaultModel(args: any): any;
/** 原 eN（js 53593）：交互行为模式（zcodeInteractionBehavior guide|queue|null；无树属主，留批） */
declare function resolveInteractionBehaviorMode(settings: any): any;
/** 原 tWe（js 53605）：草稿模型配置会话钩子（draftConfig 族 / handleDraftSelect 族面；无树属主，留批） */
declare function useDraftModelConfigSession(args: any): any;
/** 原 nN（js 53785）：followup 模式配置打包（{config}|{}；无树属主，留批） */
declare function packFollowupModeConfig(e: any, t: any, n?: any): any;
/* Vgt/Hgt：〔A1-P1-B4〕实体化收敛——真身 import 见 ./ConversationPaneHelpers 导入面（js 110053/110060），declare 删 */
/** 原 rWe（js 53831）：显式意图迁移解析（无树属主，留批） */
declare function resolveExplicitIntentTransition(args: any): any;
/** 原 iWe（js 53851）：显式意图目标会话判定（无树属主，留批） */
declare function isExplicitIntentTargetSession(e: any, t: any, n: any): any;
/** 原 aWe（js 53856）：显式意图配置匹配（无树属主，留批） */
declare function matchExplicitIntentConfig(e: any, t: any): any;
/** 原 oWe（js 53865）：配置 → {model, thoughtLevel}|null（无树属主，留批） */
declare function resolveConfigModelTarget(e: any): any;
/** 原 fWe（js 54100）：运行时模型绑定钩子（acquire/onBinding；无树属主，留批） */
declare function useRuntimeModelBinding(args: any): any;
/** 原 pWe（js 54145）：模型供应商门控钩子（gateKey/status checking|ready；无树属主，留批） */
declare function useModelProviderGate(args: any): any;
/** 原 PM（js 53252）：购买漏斗上下文；canonical components/shell/Home.tsx:4327（§U.8 R25 逐字，未导出，导出后收敛） */
declare function buildCodingPlanPurchaseFunnelContext(args: any): any;
/** 原 IM（js 53276）：入口计划态（快照 → no_plan|start_plan|coding_plan）；canonical components/shell/Home.tsx:4364（§U.8 R25 逐字，未导出，导出后收敛） */
declare function resolveEntryPlanStateFromSnapshot(args: any): any;
/* 选区域（bundle 2683–2837）：〔A1-P1-B4〕真身已实体化于 ./ConversationSelectionCore（155 行逐字），九符 declare 群收敛为真实 import */
/* 命令协议谓词族（bundle 115573–115684；无树属主，留批） */
/** 原 Bbt（js 115573） */
declare function isLiveSessionMatch(e: any, t: any, n: any): any;
/** 原 Vbt（js 115576） */
declare function hasPluginUserInputRows(e: any): any;
/** 原 qbt（js 115637） */
declare function createSerialQueue(): any;
/** 原 B1（js 115637） */
declare const CONFIG_COMMAND_SUPERSEDED: any;
/** 原 z1（js 115633） */
declare function isStaleProtocolAck(e: any): any;
/** 原 Jbt（js 115655） */
declare function createSupersedingCommandScheduler(e: any): any;
/** 原 V1（js 115684） */
declare function recordCommandAckE2E(e: any): void;
function ConversationPane({
  paneId: e,
  sessionId: t,
  rootSessionId: n,
  readOnly: r = !1,
  allowWorkspaceFileRewind: i = !1,
  selectionSideChat: a = !1,
  activeSelectionSideChatSessionId: o = null,
  workspacePath: s,
  workspaceIdentity: c,
  remoteSessionId: l,
  compactForRemoteControl: u = !1,
  provider: d,
  onSessionCreated: f,
  onSelectionSideChatUnavailable: p,
  focused: h = !0,
  telemetryVisible: g = !0,
  onSplitRight: _,
  onSplitDown: v,
  onClosePane: y,
  workspaceBadge: b,
  draftComposerHeader: x,
  onDropTargetControllerChange: S,
  gitSummary: C,
  gitDirtyFileCount: w,
  gitWorktreeReviewSourceId: T,
  gitWorktreeChangeSummary: E,
  activeTaskChangeSummary: D,
  summaryPanelVariantOverride: O,
  onSummaryPanelVariantOverrideChange: k,
  onRefreshGit: A,
  onOpenGitReview: j,
  onOpenBrowserUrl: M,
  onOpenAutomationsMain: N,
  onOpenCodeViewer: P,
  onOpenFileLink: F,
  onOpenSubagentSession: I,
  onOpenSubagentDirectory: L,
  onSyncSubagentSessionTabs: R,
  onOpenSelectionSideChat: z,
  onOpenPlanDetail: B,
  conversationFindQuery: H = ``,
  conversationFindActiveIndex: ee = -1,
  onConversationFindMatchStateChange: U,
  searchResultHighlightRequest: te,
  onSearchResultHighlightDone: ne,
}: any) { // 〔A1-P1-B3〕型缝：R0 props ~68 项解构面（bundle 119236–119282）；调用面 = SplitLayoutUiDeep 890/1453 透传
  let {
      layer: re,
      sendCommand: ie,
      attachmentPut: ae,
      attachmentRead: oe,
      onRuntimeRestart: ce,
      fileChanges: le,
      fileRewindPreview: fe,
    } = useV4Conversation() as any,
    { modelProviderService: W, zcodeSessionService: pe, zcodeTaskService: me } = useServices() as any,
    he = useBaseServices(),
    ge = useTelemetrySupervisor({
      workspacePath: s,
      ...(c ? { workspaceIdentity: c } : {}),
      ...(l ? { remoteSessionId: l } : {}),
    }),
    _e = useIsTelemetryForeground({
      workspacePath: s,
      ...(c ? { workspaceIdentity: c } : {}),
      ...(l ? { remoteSessionId: l } : {}),
    }),
    ve = (0, React.useRef)({});
  (0, React.useEffect)(() => {
    if (!(!ge || !_e || !g || !t)) return ge.attachForeground(ve.current, t);
  }, [ge, _e, t, g]);
  let [ye, be] = React.useState<any>(null),
    Se = useSessionSnapshot(ye) as any,
    Ce = Se.snapshot,
    Te = isLiveSessionMatch(Se.status, t, Ce?.sessionId) && hasPluginUserInputRows(Ce?.rows.window ?? []),
    Ee = (0, React.useMemo)(() => new Map(), [le, t, Ce?.logEpoch]),
    [De, Oe] = React.useState<any[]>([]),
    [ke, Ae] = React.useState<any>(null),
    [je, Me] = (0, React.useState)(!1),
    [Ne, Pe] = (0, React.useState)(!1),
    [Fe, Re] = React.useState<any>(null),
    ze = (0, React.useCallback)(
      (e: any) => {
        (Re(e), S?.(e));
      },
      [S],
    ),
    Be = (0, React.useMemo)(
      () => ({
        active: !1,
        kind: null,
        onDragLeave: () => {},
        onDragOver: (e: any) => {
          dataTransferContainsFiles(e.dataTransfer) && (e.preventDefault(), (e.dataTransfer.dropEffect = `none`));
        },
        onDrop: (e: any) => {
          dataTransferContainsFiles(e.dataTransfer) && (e.preventDefault(), e.stopPropagation());
        },
      }),
      [],
    ),
    Ve = r ? Be : Fe,
    He = useIsMobileTextInputViewport(),
    Ue = (0, React.useRef)(Ce),
    We = React.useRef<any>(null);
  Ue.current = Ce;
  let Ge = (0, React.useRef)({ hasContent: !1, busy: !1 }),
    [Ke, qe] = React.useState<any>(null),
    Je = (0, React.useRef)(Ke);
  Je.current = Ke;
  let [Ye, Xe] = React.useState<any>(null),
    Ze = (0, React.useRef)(1),
    Qe = React.useRef<any>(null),
    $e = k ? (O ?? null) : ke,
    et = (0, React.useCallback)(
      (e: any) => {
        if (k) {
          k(e);
          return;
        }
        Ae(e);
      },
      [k],
    ),
    nt = c?.trim() || s,
    rt = useTaskStore((e) => e.getWorkspaceState(s, c).composerTextInsertRequest),
    it = useTaskStore((e) => e.getWorkspaceState(s, c).draftRuntimeInvalidationVersion),
    at = (0, React.useCallback)(
      (e: any) => {
        useTaskStore.getState().clearComposerTextInsertRequest(s, e, c);
      },
      [c, s],
    ),
    ot = (0, React.useRef)({ sessionId: t, workspaceKey: nt });
  ot.current = { sessionId: t, workspaceKey: nt };
  let st = (0, React.useMemo)(() => createSerialQueue(), []),
    ct = (0, React.useMemo)(() => createSupersedingCommandScheduler(st), [st]),
    lt = (0, React.useMemo)(() => createSupersedingCommandScheduler(st), [st]),
    ut = React.useRef<any>(null),
    dt = (0, React.useCallback)(
      (e: any) => {
        let n = ut.current;
        if (!n || !isExplicitIntentTargetSession(n, e?.sessionId, t)) return;
        let r = matchExplicitIntentConfig(n, e?.config);
        r &&
          (logger.debug(`[v4-pane] 权威投影确认模型偏好`, {
            model: r.model,
            targetSessionId: n.targetSessionId ?? null,
            thoughtLevel: r.thoughtLevel,
          }),
          writeLastAgentConfig(d ?? `glm`, s, r, c),
          (ut.current = null));
      },
      [d, t, c, s],
    ),
    ft = (0, React.useCallback)(
      (e: any) => {
        if (!e || ut.current !== e) return;
        let t = resolveConfigModelTarget(e);
        t &&
          (writeLastAgentConfig(d ?? `glm`, s, t, c),
          logger.debug(`[v4-pane] accepted 模型配置偏好已提交，等待权威投影`, {
            model: t.model,
            targetSessionId: e.targetSessionId ?? null,
          }));
      },
      [d, c, s],
    );
  (0, React.useEffect)(() => {
    dt(Ce);
  }, [dt, Ce]);
  let pt = t ? selectionScopeKey(nt, t) : null,
    mt = (0, React.useSyncExternalStore)(
      onSelectionsChanged,
      () => (o ? hasSelectionSubscriber(o) : !1),
      () => !1,
    ),
    ht = buildTelemetryScopeKey({ workspacePath: s, workspaceIdentity: c, paneId: e, sessionId: t, taskId: null }),
    {
      agentStartupAllowed: gt,
      error: _t,
      dismissError: vt,
      ensureReadyForSend: yt,
      markProviderNotReady: bt,
    } = useModelProviderGate({
      workspacePath: s,
      workspaceIdentity: c,
      provider: d,
      sessionId: t,
      modelProviderService: he.modelProviderService,
    }),
    {
      draftConfig: xt,
      draftConfigRef: St,
      resolveInitialDraftConfig: Ct,
      acceptAuthoritativeDraftModelConfig: wt,
      handleDraftSelectModel: Tt,
      handleDraftSelectThought: Et,
      handleDraftSwitchMode: Dt,
    } = useDraftModelConfigSession({
      workspacePath: s,
      workspaceIdentity: c,
      provider: d,
      sessionId: t,
      agentStartupAllowed: gt,
    }),
    { intl: Ot } = useIntlContext(),
    kt = useCodingPlanUpgradeDialogOptional(),
    At = useOptionalTabStore((e: any) => e.openSettingsTab),
    jt = useBillingDiscountCore(he.codingPlanSubscriptionService as any),
    [Mt, K] = React.useState<any>(null),
    Nt = useTaskStore((e) => e.promoteGroupedDraftTask),
    Pt = (0, React.useCallback)(
      (e: any, t: any) => {
        (t &&
          (Nt(s, e, t, c),
          logger.debug(`[v4-pane] grouped draft 已显式提升`, {
            createdSessionId: e,
            draftId: t.draftId,
          })),
          f?.(e));
      },
      [f, Nt, c, s],
    ),
    { settings: Ft } = useAppSettings(),
    It = useProviderFamilyConnectionSettings(Ft?.providerFamilyDomain as any, Ft?.modelProviderFamilySelectedKeys as any, he.usageStatsService as any),
    Lt = resolveInteractionBehaviorMode(Ft),
    Rt = Ft?.messageStreamShowReasoning ?? !1,
    zt = Ft?.messageStreamShowTodos ?? !1,
    Bt = Ce?.sessionId ?? null,
    Vt = Ce?.config.followupMode ?? null,
    Ht = Ce?.revision ?? null,
    Ut = useSettingsStoreValue((e) => e.theme, `system`),
    Wt = useSettingsStoreValue((e) => e.codePreviewSettings, DEFAULT_CODE_PREVIEW_SETTINGS),
    Gt = (0, React.useCallback)(
      (e: any, n: any) => {
        !e || e === t || f?.(e);
      },
      [f, t],
    ),
    Kt = (0, React.useCallback)(
      async (e: any, t: any, n?: any, r?: any, i?: any, a?: any) => {
        let o = buildCommand({
            type: e,
            sessionId: n,
            payload: t,
            ...(r === void 0 ? {} : { baseRevision: r }),
            ...(i ? { baseLogEpoch: i } : {}),
          }),
          l = e === `createSession` ? useTaskStore.getState().getWorkspaceState(s, c).groupedDraftTask : null;
        (pendingCommandLedger.record(
          o,
          e === `createSession`
            ? {
                workspace: { workspacePath: s, ...(c ? { workspaceIdentity: c } : {}) },
                ...(l ? { groupedDraftTask: l } : {}),
              }
            : void 0,
        ),
          ye?.store &&
            e !== `createSession` &&
            ye.store.markCommandPending({
              commandId: o.commandId,
              type: o.type,
              issuedAt: o.issuedAt,
            }));
        let u;
        try {
          u = await ie(o);
        } catch (t: any) {
          throw (
            ye?.store && ye.store.settleCommand(o.commandId),
            isProviderNotReadyError(t) && pendingCommandLedger.settle(o.sessionId, o.commandId),
            recordCommandAckE2E({ type: e, status: `transport-error`, reasonCode: String(t), at: Date.now() }),
            t
          );
        }
        if ((pendingCommandLedger.applyAck(o, u), u.status === `accepted` && a)) {
          let e = n ?? (u.result?.type === `createSession` ? u.result.sessionId : null);
          e && ge?.acceptPromptSeed({ ...a, sessionId: e, sourceCommandId: o.commandId });
        }
        return (
          recordCommandAckE2E({
            type: e,
            status: u.status,
            ...(u.reasonCode ? { reasonCode: u.reasonCode } : {}),
            revisionAtDecision: u.revisionAtDecision,
            at: Date.now(),
          }),
          isStaleProtocolAck(u) && ye?.store?.recoverFromStaleAuthority(),
          ye?.store &&
            e !== `createSession` &&
            u.status !== `accepted` &&
            u.status !== `duplicate` &&
            ye.store.settleCommand(o.commandId),
          u
        );
      },
      [ge, ye, ie, c, s],
    ),
    qt = (0, React.useCallback)(
      (e: any, n: any) => {
        let r = Ue.current;
        if (!t || !r) return Promise.resolve({ files: 0, additions: 0, deletions: 0, items: [] });
        let i = JSON.stringify([
            n.cachePolicy,
            t,
            r.logEpoch,
            n.cachePolicy === `in-flight` ? r.revision : (n.fileChangesState ?? `unknown`),
            e.rowId,
            e.entityId,
          ]),
          a = Ee.get(i);
        if (a) return (Ee.delete(i), Ee.set(i, a), a);
        let o: any;
        for (
          o = le({
            sessionId: t,
            target: e,
            baseRevision: r.revision,
            baseLogEpoch: r.logEpoch,
          }).then(
            (e: any) => (n.cachePolicy === `in-flight` && Ee.get(i) === o && Ee.delete(i), e),
            (e: any) => {
              throw (
                Ee.get(i) === o && Ee.delete(i),
                isStaleProtocolAck(e) && ye?.store?.recoverFromStaleAuthority(),
                e
              );
            },
          ),
            Ee.set(i, o);
          Ee.size > INFLIGHT_COMMAND_CACHE_LIMIT;
        ) {
          let e = Ee.keys().next().value;
          if (e === void 0) break;
          Ee.delete(e);
        }
        return o;
      },
      [le, Ee, ye, t],
    ),
    Jt = (0, React.useCallback)(
      (e: any) => {
        let n = Ue.current;
        return !t || !n
          ? Promise.resolve({ canApply: !1, safeFiles: [], unsafeFiles: [], ignoredFiles: [] })
          : fe({
              sessionId: t,
              target: e,
              baseRevision: n.revision,
              baseLogEpoch: n.logEpoch,
            }).catch((e: any) => {
              throw (isStaleProtocolAck(e) && ye?.store?.recoverFromStaleAuthority(), e);
            });
      },
      [fe, ye, t],
    ),
    Yt = (0, React.useCallback)(
      (e: any) => {
        let n = Ue.current;
        if (!t || !n) throw Error(`Cannot apply file rewind without an active session revision`);
        return Kt(`applyFileRewind`, { target: e }, t, n.revision, n.logEpoch);
      },
      [Kt, t],
    ),
    Xt = (0, React.useCallback)(
      (e: any) => {
        I?.({
          ...e,
          rootSessionId: e.rootSessionId ?? n ?? e.parentSessionId,
          workspacePath: s,
          ...(c ? { workspaceIdentity: c } : {}),
          ...(l ? { remoteSessionId: l } : {}),
        });
      },
      [I, l, n, c, s],
    ),
    Zt = (0, React.useCallback)(
      (e: any) => {
        u ||
          L?.({
            ...e,
            rootSessionId: e.rootSessionId ?? n ?? e.parentSessionId,
            workspacePath: s,
            ...(c ? { workspaceIdentity: c } : {}),
            ...(l ? { remoteSessionId: l } : {}),
          });
      },
      [u, L, l, n, c, s],
    ),
    Qt = (0, React.useCallback)(
      (e: any) => {
        B?.({
          ...e,
          workspacePath: s,
          ...(c ? { workspaceIdentity: c } : {}),
          ...(l ? { remoteSessionId: l } : {}),
        });
      },
      [B, l, c, s],
    ),
    $t = (0, React.useCallback)(
      (e: any) => {
        t && addSelectionReference({ targetSessionId: t, workspaceKey: nt, reference: e });
      },
      [t, nt],
    ),
    en = (0, React.useCallback)(
      async (e: any, n = !1) => {
        if (!(!t || !pt || !z))
          try {
            let r = e && !n ? o : null,
              i;
            if (r)
              try {
                await pe.readSession({
                  workspacePath: s,
                  ...(c ? { workspaceIdentity: c } : {}),
                  sessionId: r,
                  messageLimit: 1,
                });
              } catch (e: any) {
                if (!String(e).includes(`sessionNotFound`)) throw e;
                ((i = r), unregisterSelectionSubscriber(r), clearSessionSelections(r, nt), (r = null));
              }
            if (r) {
              (z({
                workspacePath: s,
                ...(c ? { workspaceIdentity: c } : {}),
                ...(l ? { remoteSessionId: l } : {}),
                parentSessionId: t,
                childSessionId: r,
              }),
                e && addSelectionReference({ targetSessionId: r, workspaceKey: nt, reference: e }));
              return;
            }
            let a = await dedupeSelectionLoad(pt, async () => {
              let e = await Kt(`createSelectionSideSession`, {}, t);
              if (
                (e.status !== `accepted` && e.status !== `duplicate`) ||
                e.result?.type !== `createSelectionSideSession`
              )
                throw Error(e.reasonCode ?? `createSelectionSideSession 被拒绝`);
              return e.result.sessionId;
            });
            (z({
              workspacePath: s,
              ...(c ? { workspaceIdentity: c } : {}),
              ...(l ? { remoteSessionId: l } : {}),
              parentSessionId: t,
              childSessionId: a,
              ...(i ? { replacesChildSessionId: i } : {}),
            }),
              e && addSelectionReference({ targetSessionId: a, workspaceKey: nt, reference: e }));
          } catch (e: any) {
            logger.warn(`[v4-pane] 创建框选副屏会话失败`, {
              error: e instanceof Error ? e.message : String(e),
              parentSessionId: t,
              workspaceKey: nt,
            });
          }
      },
      [o, Kt, z, l, pt, t, c, nt, s, pe],
    );
  (0, React.useEffect)(() => {
    if (!(!pt || !t || r || a || He || !z)) return registerSelectionDialogState(pt, () => en(void 0, !0), h);
  }, [h, en, He, z, r, a, pt, t]);
  let tn = (0, React.useMemo)(() => {
      if (
        !t ||
        !z ||
        !isSlashPanelAvailable({ isDraft: t === null, selectionSideChat: a, readOnly: r, isMobileViewport: He })
      )
        return;
      let e = () => {
          en(void 0, !0);
        },
        n = [`side`, `btw`, `side chat`, `auxiliary`, `辅助对话`, `辅助`, `侧边`],
        i = Ot.formatMessage({ id: `chat.slash.app.side.description` });
      return [
        { value: `side`, description: i, keywords: n, run: e },
        { value: `btw`, description: i, keywords: n, run: e },
      ];
    }, [en, Ot, He, z, r, a, t]),
    nn = hasBlockingInteractions(Ce?.pendingInteractions ?? []),
    rn = hasCompactOrGoalRows(Ce?.control.activeWorks ?? []),
    an = !r || i,
    on = (0, React.useMemo)(
      () => ({
        workspacePath: s,
        workspaceIdentity: c,
        workspaceRemoteSessionId: l ?? void 0,
        logEpoch: Ce?.logEpoch,
        theme: Ut,
        codePreviewSettings: Wt,
        sessionId: t,
        rootSessionId: n ?? t,
        compactForRemoteControl: u,
        chatLoadingBlockedByActiveWork: rn,
        chatLoadingBlockedByInteraction: nn,
        messageStreamShowReasoning: Rt,
        messageStreamShowTodos: zt,
        onNavigateToRow: Gt,
        onOpenBrowserUrl: M,
        onOpenAutomationsMain: N,
        onOpenCodeViewer: P,
        onOpenFileLink: F,
        onOpenSubagentSession: I ? Xt : void 0,
        onOpenPlanDetail: B ? Qt : void 0,
        fetchFileChanges: qt,
        previewFileRewind: an ? Jt : void 0,
        applyFileRewind: an ? Yt : void 0,
        readAttachment: oe,
      }),
      [
        s,
        c,
        l,
        Ce?.logEpoch,
        Ut,
        Wt,
        t,
        n,
        u,
        rn,
        nn,
        Rt,
        zt,
        Gt,
        M,
        N,
        P,
        F,
        I,
        Xt,
        B,
        Qt,
        an,
        qt,
        Jt,
        Yt,
        oe,
      ],
    ),
    sn = (0, React.useCallback)(async () => {
      let e = Ct();
      if (!(!e?.provider || !e.model))
        try {
          return await pe.resolveRuntimeModelForV4({
            workspacePath: s,
            workspaceIdentity: c,
            model: parseLooseModelValue(`${e.provider}/${e.model}`),
            thoughtLevel: e.thought || void 0,
            modelProviderFamilySelectedKeys: Ft?.modelProviderFamilySelectedKeys,
          });
        } catch (t: any) {
          logger.warn(`[v4-pane] 预热会话 runtimeModel 解析失败，回落仅携带 config`, {
            error: t instanceof Error ? t.message : String(t),
            model: e.model,
            provider: e.provider,
            workspaceIdentity: c ?? null,
            workspacePath: s,
          });
          return;
        }
    }, [Ct, Ft?.modelProviderFamilySelectedKeys, c, s, pe]),
    { binding: cn } = useRuntimeModelBinding({
      enabled: t === null && gt,
      workspaceKey: nt,
      paneId: e,
      invalidationVersion: it,
      transportIdentity: re,
      dispatchCommand: Kt,
      resolveInitialConfig: Ct,
      resolveInitialRuntimeModel: sn,
    }),
    ln = (0, React.useRef)(cn);
  ln.current = cn;
  let un = cn?.sessionId ?? null,
    dn = React.useRef<any>(async () => void 0),
    fn = t ?? un,
    pn = (0, React.useCallback)(
      (e: any, n: any) => {
        if (t === null) return;
        let r = e?.provider ?? ``,
          i = e?.model ?? ``,
          a = !!(r && n.provider && r !== n.provider);
        if (!i || !n.model || (i === n.model && !a)) return;
        let o = listCodingPlanSources(),
          s = o.find((e) => e.id === r)?.name ?? r,
          c = o.find((e) => e.id === n.provider)?.name ?? n.provider,
          l = composeProviderModelLabel(r, s, i),
          u = composeProviderModelLabel(n.provider, c, n.model);
        toast(Ot.formatMessage({ id: `chat.modelChangeNotice.changed` }, { fromModel: l, toModel: u }));
      },
      [Ot, t],
    ),
    mn = (0, React.useCallback)(
      (e: any, n: any, r: any) => {
        if (!h || e !== fn) return;
        let i = n.getState().snapshot,
          a = i
            ? {
                sessionId: i.sessionId,
                config: {
                  provider: i.config.provider,
                  model: i.config.model,
                  thought: i.config.thought,
                },
              }
            : null,
          o = resolveExplicitIntentTransition({
            targetSessionId: fn,
            current: a,
            transition: r,
            hasPendingExplicitIntent: !!ut.current,
          });
        if (o) {
          let e = d ?? `glm`,
            n = readLastAgentModelConfig(e, s, c),
            r = n ? parseLooseModelValue(n.model) : null;
          if (n && r?.providerId === o.source.provider && r!.modelId === o.source.model) {
            t === null && a && wt(a.config);
            let r = persistLastAgentConfigIfUnchanged(e, s, n, o.target, c);
            logger.debug(`[v4-pane] 实时模型 fallback 晋升全局偏好`, {
              fromModel: n.model,
              promoted: r,
              sessionId: a?.sessionId ?? null,
              thoughtLevel: o.target.thoughtLevel,
              toModel: o.target.model,
              workspaceKey: nt,
            });
          }
        }
        pn(r.from, r.to);
      },
      [wt, fn, h, d, t, pn, c, nt, s],
    ),
    hn = (0, React.useRef)(mn);
  (0, React.useLayoutEffect)(() => {
    hn.current = mn;
  }, [mn]);
  let gn = useRecoverablePendingCommands({
    layer: re,
    sessionId: fn,
    snapshot: Ce,
    status: Se.status,
    subscriptionId: Se.subscriptionId,
    workspacePath: s,
    workspaceIdentity: c,
  });
  ((0, React.useEffect)(() => {
    if (!fn) {
      be(null);
      return;
    }
    let e = re.acquire(fn),
      t = e.store.onOnlineModelTransition((t: any) => {
        hn.current(fn, e.store, t);
      });
    return (
      be(e),
      () => {
        (t(), e.release());
      }
    );
  }, [re, fn]),
    (0, React.useEffect)(() => {
      !t || !ye || Ce?.sessionId !== t || ye.store.refreshPlans();
    }, [ye, t, Ce?.sessionId, Se.planDirectoryRevision]),
    (0, React.useEffect)(() => {
      t === null &&
        cn &&
        Se.status === `error` &&
        (logger.warn(`[v4-draft-prewarm] 预热会话订阅失败，丢弃回落`, {
          prewarmSessionId: cn.sessionId,
          lastError: Se.lastError ?? null,
        }),
        cn.discard());
    }, [cn, t, Se.lastError, Se.status]),
    (0, React.useEffect)(() => {
      !a || Se.status !== `error` || !Se.lastError?.includes(`sessionNotFound`) || p?.();
    }, [p, a, Se.lastError, Se.status]));
  let _n = (0, React.useCallback)((e: any) => {
      let t = Ue.current;
      if (!(!t || t.sessionId !== e)) for (let n of t.queue.items) pendingCommandLedger.settle(e, n.sourceCommandId);
    }, []),
    vn = (0, React.useCallback)(
      async (e: any, t: any, n?: any, r?: any, i?: any) => {
        let a = null,
          o = {},
          s = !1,
          c = Ue.current?.inputRouting.mode,
          l = e.kind === `compact` && c !== void 0 && c !== `startNow`;
        switch (e.kind) {
          case `compact`:
            a = `compact`;
            break;
          case `sendGoalCommand`:
            ((a = `sendGoalCommand`),
              (o = {
                text: e.objective,
                displayText: e.displayText,
                ...(r ? { heldQueueDisposition: r } : {}),
                ...(i ? { expectedHeldQueueItemIds: i } : {}),
              }));
            break;
          case `resumeGoal`:
            ((a = `resumeGoal`), (s = !0));
            break;
          case `emptyGoal`:
            return (logger.warn(`[v4-pane] /goal 需要目标文本`), !0);
          case `unsupportedGoal`:
            return (logger.warn(`[v4-pane] 暂不支持 /goal ${e.action}`), !0);
          default:
            return !1;
        }
        if (s && n === void 0) return (logger.warn(`[v4-pane] slash ${e.kind} 缺少 baseRevision`), !0);
        let u = await Kt(a, o, t, s ? n : void 0);
        return u.reasonCode === `guard.heldQueueConfirmationStale`
          ? `confirmationRequired`
          : (u.status !== `accepted` && u.status !== `noop`
              ? (logger.warn(`[v4-pane] slash ${e.kind} 被拒绝: ${u.status} ${u.reasonCode ?? ``}`),
                e.kind === `compact` && u.reasonCode === `compactOperationLock`
                  ? toast(Ot.formatMessage({ id: `chat.compact.duplicateBlocked` }))
                  : e.kind === `compact` &&
                    u.reasonCode === `activeTurn` &&
                    toast(Ot.formatMessage({ id: `chat.compact.runningBlocked` })))
              : e.kind === `compact` && l
                ? toast(Ot.formatMessage({ id: `chat.compact.queued` }))
                : r === `clearQueueAndSend` && _n(t),
            !0);
      },
      [Kt, Ot, _n],
    ),
    yn = (0, React.useCallback)(
      async (e: any, n: any) => {
        if (!(await yt())) return `blocked`;
        let r = t === null ? useTaskStore.getState().getWorkspaceState(s, c).groupedDraftTask : null,
          i = n?.heldQueueDisposition,
          a = n?.expectedHeldQueueItemIds,
          o = n?.attachments ?? [],
          l = parseGoalCommand(e, o, { contextAttachmentCount: n?.contextAttachmentCount ?? 0 });
        if (
          (t === null
            ? (St.current.mode ?? Ue.current?.config.mode ?? Ct()?.mode)
            : Ue.current?.config.mode) === `plan` &&
          l !== null &&
          l.kind !== `compact`
        )
          return (toast(Ot.formatMessage({ id: `chat.goal.planModeBlocked` })), `blocked`);
        if (
          Ue.current?.inputRouting.mode === `choice` &&
          !i &&
          (l === null || l.kind === `sendGoalCommand`)
        )
          return `confirmationRequired`;
        let u = t === null ? ln.current?.sessionId : null;
        if ((u && (await dn.current(u)), t && l)) {
          let e = await vn(l, t, Ue.current?.revision, i, a);
          if (e === `confirmationRequired`) return e;
          if (e) return;
        }
        let d =
          l?.kind === `sendGoalCommand` ||
          l?.kind === `resumeGoal` ||
          l?.kind === `emptyGoal` ||
          l?.kind === `unsupportedGoal`
            ? l
            : null;
        if (!t && d) {
          if (d.kind === `emptyGoal` || d.kind === `unsupportedGoal`) {
            await vn(d, ln.current?.sessionId ?? `__draft__`, void 0, i, a);
            return;
          }
          let e = ln.current;
          if (e?.beginPromotion())
            try {
              let t = await vn(d, e.sessionId, 0, i, a);
              if (t === `confirmationRequired`) return t;
              if (t) {
                (e.promote(), Pt(e.sessionId, r));
                return;
              }
            } catch (e: any) {
              throw (
                isProviderNotReadyError(e) ||
                  logger.warn(
                    `[v4-draft-prewarm] 预热会话 slash 结果未知，保留原 command 禁止自动重发: ${String(e)}`,
                  ),
                e
              );
            }
          let t = await Kt(
            `createSession`,
            { workspaceId: nt, ...packFollowupModeConfig(St.current, Lt, Ue.current?.config ?? Ct()) },
            null,
          );
          if (t.status !== `accepted`) throw Error(t.reasonCode ?? `createSession 被拒绝`);
          let n = t.result;
          if (!n || n.type !== `createSession`) throw Error(`createSession 缺少 sessionId`);
          let o = n.sessionId;
          (Pt(o, r), await vn(d, o, 0, i, a));
          return;
        }
        if (!t) {
          let t = ln.current;
          if (t?.beginPromotion())
            try {
              let i = await Kt(
                `sendText`,
                { text: e, ...(o.length > 0 ? { attachments: o } : {}) },
                t.sessionId,
                void 0,
                void 0,
                n?.telemetrySeed,
              );
              if (i.status === `accepted`) {
                (t.promote(), Pt(t.sessionId, r));
                return;
              }
              throw (
                logger.warn(
                  `[v4-draft-prewarm] 预热会话首发未 accepted（${i.reasonCode ?? i.status}），禁止自动重发`,
                ),
                Error(i.reasonCode ?? `预热会话首发未 accepted`)
              );
            } catch (e: any) {
              throw (
                isProviderNotReadyError(e) ||
                  o.length > 0 ||
                  logger.warn(
                    `[v4-draft-prewarm] 预热会话首发未确认成功，保留原 command 禁止自动重发: ${String(e)}`,
                  ),
                e
              );
            }
          let i = packFollowupModeConfig(St.current, Lt, Ue.current?.config ?? Ct());
          if (o.length === 0) {
            let t = await Kt(
              `createSession`,
              { workspaceId: nt, firstInput: { text: e }, ...i },
              null,
              void 0,
              void 0,
              n?.telemetrySeed,
            );
            if (t.status !== `accepted`) throw Error(t.reasonCode ?? `createSession 被拒绝`);
            let a = t.result;
            if (!a || a.type !== `createSession`) throw Error(`createSession 缺少 sessionId`);
            Pt(a.sessionId, r);
            return;
          }
          let a = await Kt(`createSession`, { workspaceId: nt, ...i }, null);
          if (a.status !== `accepted`) throw Error(a.reasonCode ?? `createSession 被拒绝`);
          let s = a.result;
          if (!s || s.type !== `createSession`) throw Error(`createSession 缺少 sessionId`);
          let c = s.sessionId,
            l = await Kt(
              `sendText`,
              { text: e, attachments: o },
              c,
              void 0,
              void 0,
              n?.telemetrySeed,
            );
          if (l.status !== `accepted`) throw Error(l.reasonCode ?? `sendText 被拒绝`);
          Pt(c, r);
          return;
        }
        let f = await Kt(
          `sendText`,
          {
            text: e,
            ...(o.length > 0 ? { attachments: o } : {}),
            ...(i ? { heldQueueDisposition: i } : {}),
            ...(a ? { expectedHeldQueueItemIds: a } : {}),
          },
          t,
          void 0,
          void 0,
          n?.telemetrySeed,
        );
        if (f.reasonCode === `guard.heldQueueConfirmationStale`) return `confirmationRequired`;
        if (f.status !== `accepted`) throw Error(f.reasonCode ?? `sendText 被拒绝`);
        i === `clearQueueAndSend` && _n(t);
      },
      [Kt, vn, yt, Lt, Pt, Ot, Ct, t, _n, c, nt, s],
    ),
    bn = (0, React.useCallback)(
      (e: any, n: any) => (
        ct.seal(),
        lt.seal(),
        st.enqueue(async () => {
          try {
            return await yn(e, n);
          } catch (e: any) {
            if (t === null && isProviderNotReadyError(e)) return (bt(), `blocked`);
            throw e;
          }
        })
      ),
      [st, yn, lt, ct, bt, t],
    ),
    xn = (0, React.useCallback)(() => {
      Qe.current?.();
    }, []),
    Sn = (0, React.useCallback)(
      async (e: any, n: any) => {
        let r = isImmediateInputRouting({
            draftMode: t === null,
            inputRoutingMode: Ue.current?.inputRouting.mode ?? null,
            heldQueueDisposition: n?.heldQueueDisposition,
          }),
          i = await bn(e, n);
        return i === `blocked` || i === `confirmationRequired` ? i : (r && xn(), `sent`);
      },
      [bn, xn, t],
    ),
    Cn = (0, React.useCallback)((e: any) => {
      Ge.current = e;
    }, []),
    wn = (0, React.useCallback)(() => {
      ((Je.current = null), qe(null));
    }, []),
    Tn = (0, React.useCallback)(
      (e: any) => {
        (Xe((t: any) => (t?.requestId === e ? null : t)), wn());
      },
      [wn],
    ),
    En = (0, React.useCallback)(
      (e: any) => {
        let n = Ue.current;
        !t ||
          n === null ||
          Kt(`forkAssistant`, { target: e }, t, n.revision, n.logEpoch).then((e) => {
            if (e.status !== `accepted` && e.status !== `duplicate`) {
              logger.warn(`[v4-pane] fork 被拒绝: ${e.status} ${e.reasonCode ?? ``}`);
              return;
            }
            e.result?.type === `forkAssistant` && f?.(e.result.sessionId);
          });
      },
      [Kt, f, t],
    ),
    Dn = (0, React.useCallback)(
      async (e: any, n: any, r: any, i = `preserve`) => {
        let a = Ue.current;
        if (!t || a === null) return !1;
        if (!n.trim() && (!r || r.length === 0))
          return (logger.warn(`[v4-pane] edit 跳过：行内编辑内容为空且无附件`), !1);
        let o = await Kt(
          `editUserQuery`,
          { target: e, newText: n, workspaceMode: i, ...(r ? { attachments: [...r] } : {}) },
          t,
          a.revision,
          a.logEpoch,
        );
        return o.status !== `accepted` && o.status !== `duplicate`
          ? (logger.warn(`[v4-pane] edit 被拒绝: ${o.status} ${o.reasonCode ?? ``}`), !1)
          : o;
      },
      [Kt, t],
    ),
    On = (0, React.useCallback)(
      async (e: any, n: any) => {
        let r = Ue.current;
        if (!t || r === null) throw Error(`captcha editUserQuery 缺少当前 session 投影`);
        return Kt(
          `editUserQuery`,
          { target: e, newText: n, workspaceMode: `preserve` },
          t,
          r.revision,
          r.logEpoch,
        );
      },
      [Kt, t],
    ),
    kn = (0, React.useCallback)(
      async (e: any) => {
        let n = Ue.current;
        if (!t || n === null) throw Error(`retryTurn 缺少当前 session 投影`);
        return Kt(`retryTurn`, { target: e }, t, n.revision, n.logEpoch);
      },
      [Kt, t],
    ),
    An = (0, React.useCallback)(
      (e: any) => {
        kn(e)
          .then((e) => {
            e.status !== `accepted` &&
              logger.warn(`[v4-pane] retry 被拒绝: ${e.status} ${e.reasonCode ?? ``}`);
          })
          .catch((e) => {
            logger.warn(`[v4-pane] retry 提交失败`, {
              error: e instanceof Error ? e.message : String(e),
            });
          });
      },
      [kn],
    ),
    jn = (0, React.useCallback)(
      async (e: any, n: any) => {
        let r = Ue.current;
        if (!t || r === null) return !1;
        let i = await Kt(
            `setAssistantFeedback`,
            { target: e, feedback: n },
            t,
            r.revision,
            r.logEpoch,
          ),
          a = i.status === `accepted` || i.status === `duplicate`;
        return (
          a || logger.warn(`[v4-pane] assistant 反馈被拒绝: ${i.status} ${i.reasonCode ?? ``}`),
          a
        );
      },
      [Kt, t],
    ),
    Mn = (0, React.useCallback)(
      (e: any) => {
        let n = Ue.current;
        if (!t || n === null) return;
        let r = n.queue.items.find((t: any) => t.queueItemId === e)?.sourceCommandId;
        Kt(`deleteQueueItem`, { queueItemId: e }, t, n.revision).then((e) => {
          if (e.status !== `accepted` && e.status !== `noop`) {
            logger.warn(`[v4-pane] deleteQueueItem 被拒绝: ${e.status} ${e.reasonCode ?? ``}`);
            return;
          }
          r && pendingCommandLedger.settle(t, r);
        });
      },
      [Kt, t],
    ),
    Nn = (0, React.useCallback)(
      async (e: any) => {
        let n = Ue.current;
        if (!t || n === null || Je.current) return;
        if (Ge.current.hasContent || Ge.current.busy) {
          toast(Ot.formatMessage({ id: `chat.queue.editDraftConflict` }));
          return;
        }
        let r = buildQueueItemEditDraft(n, e);
        if (!r) {
          logger.warn(`[v4-pane] queue 撤回编辑跳过：queue item 不存在或不可编辑 ${e}`);
          return;
        }
        let i = { queueItemId: e, sessionId: t, workspaceKey: nt };
        ((Je.current = i), qe(i));
        try {
          let n = await Kt(`deleteQueueItem`, { queueItemId: e }, t, r.baseRevision);
          if (!isAckAcceptedOrDuplicate(n.status)) {
            (logger.warn(`[v4-pane] queue 撤回编辑被拒绝: ${n.status} ${n.reasonCode ?? ``}`),
              toast(Ot.formatMessage({ id: `chat.queue.editRestoreFailed` })),
              wn());
            return;
          }
          pendingCommandLedger.settle(t, r.sourceCommandId);
          let i = ot.current;
          if (i.sessionId !== t || i.workspaceKey !== nt) {
            (logger.warn(`[v4-pane] queue 撤回编辑未恢复：ACK 返回前 composer 已切换`, {
              queueItemId: e,
              sessionId: t,
              workspaceKey: nt,
            }),
              wn());
            return;
          }
          Xe({
            requestId: Ze.current++,
            sessionId: t,
            workspaceKey: nt,
            inputKind: r.inputKind,
            text: r.text,
            attachments: r.attachments,
          });
        } catch (e: any) {
          (logger.warn(`[v4-pane] queue 撤回编辑命令失败`, e),
            toast(Ot.formatMessage({ id: `chat.queue.editRestoreFailed` })),
            wn());
        }
      },
      [wn, Kt, Ot, t, nt],
    ),
    Pn = (0, React.useCallback)(
      (e: any) => {
        let n = Ue.current;
        !t ||
          n === null ||
          (xn(),
          Kt(`sendQueuedNow`, { queueItemId: e }, t, n.revision).then((e) => {
            e.status !== `accepted` &&
              e.status !== `noop` &&
              logger.warn(`[v4-pane] sendQueuedNow 被拒绝: ${e.status} ${e.reasonCode ?? ``}`);
          }));
      },
      [Kt, xn, t],
    ),
    Fn = (0, React.useCallback)(
      (e: any, n: any) => {
        let r = Ue.current;
        !t ||
          r === null ||
          Kt(`reorderQueueItem`, { queueItemId: e, beforeQueueItemId: n }, t, r.revision).then(
            (e) => {
              e.status !== `accepted` &&
                e.status !== `noop` &&
                logger.warn(`[v4-pane] reorderQueueItem 被拒绝: ${e.status} ${e.reasonCode ?? ``}`);
            },
          );
      },
      [Kt, t],
    ),
    In = (0, React.useCallback)(async () => {
      let e = Ue.current;
      if (!t || !e || e.queue.autoDrain || e.queue.items.length === 0) return;
      let n = await Kt(`setAutoDrain`, { autoDrain: !0 }, t, e.revision);
      n.status !== `accepted` &&
        n.status !== `noop` &&
        logger.warn(`[v4-pane] 恢复暂停队列被拒绝: ${n.status} ${n.reasonCode ?? ``}`);
    }, [Kt, t]),
    Ln = (0, React.useCallback)(
      async (e: any, n: any, r?: any) => {
        let i = r?.targetSessionId ?? t ?? ln.current?.sessionId ?? null,
          a = Ue.current;
        if (!i)
          return (
            recordCommandAckE2E({ type: `ui:${e}`, status: `skipped`, reasonCode: `no-session`, at: Date.now() }),
            null
          );
        let o = r?.initialBaseRevision ?? (a?.sessionId === i ? a.revision : 0),
          s = null;
        try {
          for (let t = 0; t < 3; t++) {
            let t = await Kt(e, n, i, o);
            if (((s = t), t.status === `stale`)) {
              o = t.revisionAtDecision;
              continue;
            }
            return (
              t.status !== `accepted` &&
                t.status !== `noop` &&
                logger.warn(`[v4-pane] ${e} 被拒绝: ${t.status} ${t.reasonCode ?? ``}`),
              t
            );
          }
          return (logger.warn(`[v4-pane] ${e} 连续 stale，放弃重试`), s);
        } catch (t: any) {
          if (isProviderNotReadyError(t)) throw t;
          return (
            recordCommandAckE2E({
              type: `ui:${e}`,
              status: `dispatch-error`,
              reasonCode: String(t),
              at: Date.now(),
            }),
            logger.warn(`[v4-pane] ${e} 失败: ${String(t)}`),
            null
          );
        }
      },
      [Kt, t],
    ),
    Rn = (0, React.useCallback)(
      async (e: any, n?: any) => {
        let r = await Ln(`switchModelConfig`, e, n);
        if (!isProviderNotInRegistryFailure(r)) return r;
        let i = n?.targetSessionId ?? t ?? ln.current?.sessionId ?? void 0;
        logger.warn(`[v4-pane] provider 不在 CLI registry，开始同步 registry 并重试一次`, {
          model: e.model,
          provider: e.provider,
          remoteSessionId: l ?? null,
          sessionId: i ?? null,
          workspaceIdentity: c ?? null,
          workspacePath: s,
        });
        try {
          await syncProviderRegistryAndReturn({
            workspacePath: s,
            workspaceIdentity: c,
            remoteSessionId: l,
            localModelProviderService: W,
            remoteZCodeSessionService: pe,
            force: !0,
          });
          let t = await pe.resolveRuntimeModelForV4({
            workspacePath: s,
            workspaceIdentity: c,
            ...(i ? { sessionId: i } : {}),
            model: parseLooseModelValue(`${e.provider}/${e.model}`),
            thoughtLevel: e.thought || void 0,
            modelProviderFamilySelectedKeys: Ft?.modelProviderFamilySelectedKeys,
          });
          if (!t)
            return (
              logger.warn(`[v4-pane] provider registry 已同步，但 runtimeModel 解析为空，放弃自动重试`, {
                model: e.model,
                provider: e.provider,
                sessionId: i ?? null,
                workspacePath: s,
              }),
              r
            );
          let n = await Ln(
            `switchModelConfig`,
            { ...e, runtimeModel: t },
            { initialBaseRevision: r.revisionAtDecision, ...(i ? { targetSessionId: i } : {}) },
          );
          return (
            isProviderNotInRegistryFailure(n) &&
              logger.warn(`[v4-pane] runtimeModel fallback 重试后 provider 仍不在 registry，不再循环`, {
                model: e.model,
                provider: e.provider,
                sessionId: i ?? null,
                workspacePath: s,
              }),
            n ?? r
          );
        } catch (t: any) {
          if (isProviderNotReadyError(t)) throw t;
          return (
            logger.warn(`[v4-pane] provider.notInRegistry 自动恢复失败`, {
              error: t instanceof Error ? t.message : String(t),
              model: e.model,
              provider: e.provider,
              sessionId: i ?? null,
              workspacePath: s,
            }),
            r
          );
        }
      },
      [Ln, W, l, t, Ft?.modelProviderFamilySelectedKeys, c, s, pe],
    );
  dn.current = (0, React.useCallback)(
    async (e: any) => {
      let t = packFollowupModeConfig(St.current, Lt).config;
      if (!t) return;
      let n = Ue.current?.sessionId === e ? Ue.current.config : null,
        r = (e: any, t: any) => {
          if (!(t && (t.status === `accepted` || t.status === `noop` || t.status === `duplicate`)))
            throw Error(
              `${e} 未在首发前收敛: ${t?.status ?? `missing-ack`} ${t?.reasonCode ?? ``}`,
            );
        },
        i = Object.prototype.hasOwnProperty.call(t, `thought`),
        a = t.provider ?? (i ? n?.provider : void 0),
        o = t.model ?? (i ? n?.model : void 0);
      (a &&
        o &&
        (!n || n.provider !== a || n.model !== o || (i && n.thought !== (t.thought ?? ``))) &&
        a &&
        o &&
        r(
          `switchModelConfig`,
          await Rn(
            { provider: a, model: o, thought: i ? (t.thought ?? ``) : `` },
            { targetSessionId: e },
          ),
        ),
        t.mode &&
          t.mode !== n?.mode &&
          r(
            `switchCollaborationMode`,
            await Ln(`switchCollaborationMode`, { mode: t.mode }, { targetSessionId: e }),
          ),
        t.followupMode &&
          t.followupMode !== n?.followupMode &&
          r(
            `setFollowupMode`,
            await Ln(`setFollowupMode`, { mode: t.followupMode }, { targetSessionId: e }),
          ));
    },
    [Lt, Ln, St, Rn],
  );
  let zn = React.useRef<any>(null);
  (0, React.useEffect)(() => {
    let e = t ?? un;
    if (!e || !Lt || Ht === null || Bt !== e) return;
    if (Vt === Lt) {
      zn.current = `${e}:${Lt}:synced`;
      return;
    }
    let n = `${e}:${Lt}:${Ht}`;
    zn.current !== n && ((zn.current = n), st.enqueue(() => Ln(`setFollowupMode`, { mode: Lt })));
  }, [Lt, st, Ln, un, t, Vt, Ht, Bt]);
  let Bn = React.useRef<any>(null);
  (0, React.useEffect)(() => {
    if (t !== null || !un || Ce?.sessionId !== un || Bn.current === un) return;
    let e = St.current,
      n = !!(e.provider && e.model),
      r = !!(e.thought && Ce.config.provider && Ce.config.model),
      i = !!e.mode;
    (!n && !r && !i) ||
      ((Bn.current = un),
      e.provider && e.model
        ? st.enqueue(() =>
            Rn({
              provider: e.provider,
              model: e.model,
              thought: e.thought ?? Ce.config.thought ?? ``,
            }),
          )
        : e.thought &&
          Ce.config.provider &&
          Ce.config.model &&
          st.enqueue(() =>
            Rn({ provider: Ce.config.provider, model: Ce.config.model, thought: e.thought }),
          ),
      e.mode &&
        e.mode !== Ce.config.mode &&
        st.enqueue(() => Ln(`switchCollaborationMode`, { mode: e.mode })));
  }, [St, un, st, t, Ce, Rn]);
  let Vn = (0, React.useCallback)(
      (e: any, n: any, r: any) => {
        let i = Ue.current,
          a = e || i?.config.provider || ``,
          o = i?.config.thought?.trim() ?? ``,
          s = t ?? ln.current?.sessionId ?? void 0,
          c =
            a && n
              ? {
                  provider: a,
                  model: n,
                  sourceSnapshotSessionId: i?.sessionId ?? null,
                  targetSessionId: s ?? null,
                }
              : null;
        if (
          (c && ((ut.current = c), s && dt(i)),
          logger.debug(`[v4-pane] onSelectModel`, {
            modelProvider: e,
            model: n,
            branch: t ? `session-cas` : ln.current ? `draft-prewarm-cas` : `draft-intent-only`,
          }),
          pn(r, { provider: a, model: n }),
          !t)
        ) {
          (Tt(e, n),
            a &&
              n &&
              s &&
              ct
                .schedule(() => Rn({ provider: a, model: n, thought: o }, { targetSessionId: s }))
                .then((e: any) => {
                  if (e === CONFIG_COMMAND_SUPERSEDED) {
                    logger.debug(`[v4-pane] 草稿模型切换意图被后继配置替代`, {
                      targetSessionId: s ?? null,
                    });
                    return;
                  }
                  if (
                    (logger.debug(`[v4-pane] 草稿模型切换 ACK`, {
                      isLatestIntent: ut.current === c,
                      status: e?.status ?? `missing`,
                      targetSessionId: s ?? null,
                    }),
                    e?.status === `accepted` || e?.status === `noop`)
                  ) {
                    (dt(Ue.current), ft(c));
                    return;
                  }
                  s && ut.current === c && (ut.current = null);
                }));
          return;
        }
        if (!a || !n) {
          logger.warn(`[v4-pane] switchModelConfig 跳过：provider/model 为空`);
          return;
        }
        st.enqueue(() => Rn({ provider: a, model: n, thought: o })).then((e: any) => {
          if (e?.status === `accepted` || e?.status === `noop`) {
            (dt(Ue.current), ft(c));
            return;
          }
          ut.current === c && (ut.current = null);
        });
      },
      [dt, st, ct, Tt, ft, t, pn, Rn],
    ),
    Hn = (0, React.useCallback)(
      (e: any, n: any) => {
        let r = Ue.current,
          i = t ?? ln.current?.sessionId ?? null,
          a = {
            provider: n.provider,
            model: n.model,
            thought: e,
            sourceSnapshotSessionId: r?.sessionId ?? null,
            targetSessionId: i,
          };
        if (
          ((ut.current = a),
          a.targetSessionId && dt(r),
          t && r && (r.config.provider !== n.provider || r.config.model !== n.model))
        ) {
          ((ut.current = null),
            logger.warn(`[v4-pane] 思考深度切换跳过：操作模型已过期`, {
              currentModel: r.config.model,
              currentProvider: r.config.provider,
              requestedModel: n.model,
              requestedProvider: n.provider,
            }));
          return;
        }
        if (!t) {
          (Et(e),
            i &&
              n.provider &&
              n.model &&
              ct
                .schedule(() =>
                  Rn({ provider: n.provider, model: n.model, thought: e }, { targetSessionId: i }),
                )
                .then((e: any) => {
                  if (e !== CONFIG_COMMAND_SUPERSEDED) {
                    if (e?.status === `accepted` || e?.status === `noop`) {
                      (dt(Ue.current), ft(a));
                      return;
                    }
                    ut.current === a && (ut.current = null);
                  }
                }));
          return;
        }
        let o = r?.config.provider ?? ``,
          s = r?.config.model ?? ``;
        if (!o || !s) {
          (recordCommandAckE2E({
            type: `ui:selectThought`,
            status: `skipped`,
            reasonCode: `config-empty`,
            at: Date.now(),
          }),
            logger.warn(`[v4-pane] 思考深度切换跳过：当前投影 config 为空（先选模型）`),
            (ut.current = null));
          return;
        }
        st.enqueue(() => Rn({ provider: o, model: s, thought: e })).then((e: any) => {
          if (e?.status === `accepted` || e?.status === `noop`) {
            (dt(Ue.current), ft(a));
            return;
          }
          ut.current === a && (ut.current = null);
        });
      },
      [dt, st, ct, Et, ft, t, Rn],
    ),
    Un = (0, React.useCallback)(
      async (e: any, n: any) => {
        let r = parseCustomModelId(e);
        if (!r?.providerId) return;
        let i = d ?? `glm`,
          a = e;
        if (!r.modelName) {
          let e = listProviderModelIds((await W.getAllCached()).find((e: any) => e.id === r.providerId))[0];
          if (!e) {
            logger.warn(`[v4-pane] custom provider 恢复跳过：provider 没有可用模型`, {
              customProviderId: r.providerId,
              workspacePath: s,
            });
            return;
          }
          a = formatCustomModelId(r.providerId, e);
        }
        let o = parseLooseModelValue(a);
        pn(n, { provider: o.providerId, model: o.modelId });
        let l = useTaskStore.getState();
        (l.setModelSelectionResolution(
          s,
          {
            selectedSupplierKey: customProviderRef(r.providerId),
            isGhostSupplier: !1,
            supplierMismatchReason: null,
          },
          c,
        ),
          l.setConfigOptionsStatus(s, `loading`, c),
          logger.info(`[v4-pane] configOptions error custom provider recovery start`, {
            modelId: o.modelId,
            providerId: o.providerId,
            workspaceIdentity: c ?? null,
            workspacePath: s,
          }));
        try {
          try {
            await applyWorkspaceDefaultModel({
              zcodeTaskService: me,
              zcodeSessionService: pe,
              workspacePath: s,
              workspaceIdentity: c,
              provider: i,
              modelId: a,
              modelRef: o,
              draftSessionId: t ? void 0 : (ln.current?.sessionId ?? void 0),
              preferZCodeSession: isGlmAgentCliProvider(i),
            });
          } catch (e: any) {
            logger.warn(`[v4-pane] custom provider recovery 写 workspace default 失败，继续 prepare`, {
              error: e instanceof Error ? e.message : String(e),
              modelId: o.modelId,
              providerId: o.providerId,
              workspacePath: s,
            });
          }
          await me.restartWorkspaceProcess({
            workspacePath: s,
            workspaceIdentity: c,
            provider: i,
            bumpRuntimeEpoch: !0,
          });
          let e = await prepareWorkspaceModelInit({
              workspacePath: s,
              workspaceIdentity: c,
              provider: i,
              preferredModel: a,
              zcodeSessionService: pe,
            }),
            n = getCurrentModelValue(e.configOptions ?? []),
            r = getCurrentThoughtLevelValue(e.configOptions ?? []);
          (n && parseLooseModelValue(n).modelId === o.modelId && writeLastAgentConfig(i, s, { model: a, thoughtLevel: r }, c),
            l.setConfigOptions(s, e.configOptions ?? [], c),
            l.setConfigOptionsStatus(s, `ready`, c),
            l.setSlashCommands(s, e.slashCommands ?? [], c),
            logger.info(`[v4-pane] configOptions error custom provider recovery done`, {
              configOptionsCount: e.configOptions?.length ?? 0,
              modelId: o.modelId,
              providerId: o.providerId,
              workspacePath: s,
            }));
        } catch (e: any) {
          throw (
            l.setConfigOptionsStatus(s, `error`, c),
            logger.warn(`[v4-pane] configOptions error custom provider recovery failed`, {
              error: e instanceof Error ? e.message : String(e),
              modelId: o.modelId,
              providerId: o.providerId,
              workspacePath: s,
            }),
            e
          );
        }
      },
      [W, d, t, pn, c, s, pe, me],
    ),
    Wn = (0, React.useCallback)(
      (e: any) => {
        if (!t) {
          Dt(e);
          let t = ln.current?.sessionId;
          t &&
            lt.schedule(() => Ln(`switchCollaborationMode`, { mode: e }, { targetSessionId: t }));
          return;
        }
        st.enqueue(() => Ln(`switchCollaborationMode`, { mode: e }));
      },
      [st, Ln, lt, Dt, t],
    ),
    Gn = (0, React.useCallback)(
      (e: any) => {
        if (!t) return;
        let n = parseGoalCommand(e);
        n && vn(n, t, Ue.current?.revision, void 0);
      },
      [vn, t],
    ),
    Kn = (0, React.useCallback)(() => {
      let e = Ue.current;
      if (!t || !e?.control.canStop) return;
      let n = e.control.activeWorks.find((e: any) => e.foregroundExecutionId)?.foregroundExecutionId;
      Kt(`stop`, n ? { expectedForegroundExecutionId: n } : {}, t).catch((e) => {
        logger.warn(`[v4-pane] stop 失败: ${String(e)}`);
      });
    }, [Kt, t]),
    qn = (0, React.useCallback)(() => {
      let e = Ue.current;
      !t ||
        !e?.availability.pauseGoal.allowed ||
        Kt(`pauseGoal`, {}, t, e.revision).then((e) => {
          e.status !== `accepted` &&
            e.status !== `noop` &&
            logger.warn(`[v4-pane] pauseGoal 被拒绝: ${e.status} ${e.reasonCode ?? ``}`);
        });
    }, [Kt, t]),
    Jn = (0, React.useCallback)(() => {
      let e = Ue.current;
      !t ||
        !e?.availability.resumeGoal.allowed ||
        Kt(`resumeGoal`, {}, t, e.revision).then((e) => {
          e.status !== `accepted` &&
            e.status !== `noop` &&
            logger.warn(`[v4-pane] resumeGoal 被拒绝: ${e.status} ${e.reasonCode ?? ``}`);
        });
    }, [Kt, t]),
    Yn = (0, React.useCallback)(
      (e: any) => {
        t &&
          Kt(`cancelBackgroundWork`, { workId: e }, t).then((e) => {
            e.status !== `accepted` &&
              e.status !== `noop` &&
              logger.warn(`[v4-pane] cancelBackgroundWork 被拒绝: ${e.status} ${e.reasonCode ?? ``}`);
          });
      },
      [Kt, t],
    );
  (0, React.useEffect)(() => {
    if (!h || r || !t || !Ce?.control.canStop) return;
    let e = (e: any) => {
      e.key === `Escape` && (isEventInsideDialog(e) || (e.preventDefault(), Kn()));
    };
    return (window.addEventListener(`keydown`, e), () => window.removeEventListener(`keydown`, e));
  }, [h, Kn, r, t, Ce?.control.canStop]);
  let Xn = (0, React.useCallback)(() => {
      ye?.store.retry();
    }, [ye]),
    Zn = (0, React.useCallback)(() => ye?.store.loadOlder(), [ye]),
    Qn = (0, React.useCallback)(
      () =>
        ye
          ? ye.store.loadAllOlder()
          : Promise.resolve({ status: `stale`, logEpoch: Ce?.logEpoch ?? `unknown` }),
      [ye, Ce?.logEpoch],
    );
  (0, React.useEffect)(() => {
    if (!t || !ye?.store || !isFirstTurnHeaderMissing(Ce, Se.loadingOlder)) return;
    let e = Ce?.rows.window[0]?.rowId;
    if (e === void 0) return;
    let n = `${t}:${Se.subscriptionId ?? `connecting`}:${e}`;
    We.current !== n &&
      ((We.current = n),
      logger.debug(`[v4-pane] 冷快照首 turn 不完整，自动补拉更早行`, {
        firstRowId: e,
        sessionId: t,
        turnId: Ce?.rows.window[0]?.turnId,
      }),
      ye.store.loadOlder());
  }, [ye, t, Ce, Se.loadingOlder, Se.subscriptionId]);
  let $n = t !== null && (Se.status === `connecting` || Ce === null),
    er = Ke?.sessionId === t && Ke.workspaceKey === nt,
    tr = t !== null && Se.status === `error`;
  useSessionSubscriptionErrorReporter({ supervisor: ge, sessionId: t, lastError: Se.lastError, visible: tr && g && _e });
  let nr = !r && !a && !!t,
    rr = !r && !a && !!t,
    ir = !r && !a && !!t,
    ar = t === null,
    or = (0, React.useMemo)(() => (ar ? { ...Ct(), ...xt } : void 0), [xt, ar, Ct]),
    sr = Ce?.subagents ?? EMPTY_SUBAGENT_DIRECTORY;
  (0, React.useEffect)(() => {
    !t ||
      sr.revision === 0 ||
      !R ||
      R({ rootSessionId: n ?? t, parentSessionId: t, validChildSessionIds: sr.childSessionIds });
  }, [R, n, t, sr.childSessionIds, sr.revision]);
  let cr = Ce?.pendingInteractions[0]?.interactionId ?? null;
  (0, React.useEffect)(() => {
    if (!(!a || !t)) return (setSelectionSubscribed(t, !!cr), () => setSelectionSubscribed(t, !1));
  }, [cr, a, t]);
  let lr = (0, React.useMemo)(
      () =>
        buildSummaryPanelModel({
          workspacePath: s,
          gitSummary: C,
          gitDirtyFileCount: w,
          gitWorktreeChangeSummary: E,
          goal: a ? null : (Ce?.goal ?? null),
          sessionPlans: Se.sessionPlans,
          plan: Ce?.plan ?? null,
          backgroundWorks: Ce?.backgroundWorks ?? [],
          runningSubagents: sr.running,
        }),
      [w, C, E, Ce?.backgroundWorks, Ce?.goal, Ce?.plan, Se.sessionPlans, a, sr.running, s],
    ),
    ur = lr.runningBashWorks.length + lr.runningSubagentWorks.length,
    dr = lr.runningBashWorks.length,
    fr = lr.runningSubagentWorks.length;
  ((0, React.useEffect)(() => {
    (Me(!1), Pe(!1));
  }, [t]),
    (0, React.useEffect)(() => {
      dr === 0 && Me(!1);
    }, [dr]),
    (0, React.useEffect)(() => {
      fr === 0 && Pe(!1);
    }, [fr]));
  let pr = (0, React.useCallback)(() => {
      ur !== 0 && (Me(dr > 0), Pe(fr > 0), et(`panel`));
    }, [et, fr, ur, dr]),
    mr = resolveSummaryPanelVariant({ variantOverride: $e }),
    hr =
      !ar && shouldShowSummaryPanel({ hasContent: lr.hasContent, variant: mr })
        ? mr === `auto`
          ? `auto`
          : `inline`
        : `none`,
    gr = Ce?.control.lastError ?? null,
    _r = gr ? buildSessionErrorKey(Ce?.sessionId ?? t, gr) : null,
    vr = gr && _r && !De.includes(_r) ? buildSessionErrorBannerModel(Ce?.sessionId ?? t, gr) : null,
    br = useSessionQuotaViewModel({
      error: gr,
      errorKey: _r,
      phase: Ce?.control.phase ?? null,
      providerId: Ce?.config.provider ?? null,
      modelId: Ce?.config.model ?? null,
      usageStatsService: he.usageStatsService,
    }),
    xr = _t ?? Mt ?? (br.takesOverError ? null : vr),
    Sr = (0, React.useCallback)(() => {
      K(null);
    }, []),
    Cr = (0, React.useCallback)(
      (e: any) => {
        K({
          code: e.code,
          message: Ot.formatMessage({ id: `chat.captcha.verifyFailed` }),
          detail: e.message,
          ...(t ? { taskId: t } : {}),
        });
      },
      [Ot, t],
    );
  ((0, React.useEffect)(() => {
    K(null);
  }, [t]),
    useSessionErrorRecovery({
      enabled: ge !== null && _e && g && !u && !r && !a,
      error: gr,
      errorVisible: vr !== null && !br.takesOverError && Mt === null,
      sessionId: t,
      providerId: Ce?.config.provider ?? null,
      rows: Ce?.rows.window ?? [],
      workspacePath: s,
      workspaceIdentity: c,
      dispatchEdit: On,
      onRecoveryStart: Sr,
      onRecoveryError: Cr,
    }));
  let wr = (0, React.useCallback)(() => {
      if (_t) {
        vt();
        return;
      }
      if (Mt) {
        K(null);
        return;
      }
      _r && Oe((e) => (e.includes(_r) ? e : [...e.slice(-19), _r]));
    }, [Mt, _r, vt, _t]),
    Tr = (0, React.useCallback)(() => {
      (requestSettingsSectionOpen(`modelProvider`), At());
    }, [At]),
    Er = (0, React.useCallback)(() => {
      if (!kt) return;
      let e = Ft?.providerFamilyDomain === `bigmodel` ? providerIds.bigmodelCodingPlan : providerIds.zaiCodingPlan;
      kt.openCodingPlanUpgrade({ providerId: e });
    }, [kt, Ft?.providerFamilyDomain]),
    Dr = (0, React.useCallback)(() => {
      let e = br.upgradeProviderId;
      if (!e || !kt) return;
      let t = Ot.formatMessage({ id: br.upgradeActionLabelId });
      kt.openCodingPlanUpgrade({
        providerId: e,
        funnelContext: buildCodingPlanPurchaseFunnelContext({
          providerId: e,
          upgradeSource: `session_quota_alert`,
          eventRegion: `app.session`,
          eventText: t,
          entryPlanState: resolveEntryPlanStateFromSnapshot({ providerId: e, displayStatus: `purchased`, planLevel: `start` }),
        }),
      });
    }, [kt, Ot, br.upgradeActionLabelId, br.upgradeProviderId]),
    Or = gn[0] ?? null,
    kr = (0, React.useCallback)(() => {
      Or && pendingCommandLedger.dismissRecovery(Or.sessionId, Or.commandId);
    }, [Or]),
    Ar = (0, React.useCallback)(() => {
      if (!Or) return;
      let e = pendingCommandLedger.consumeReplay({ sessionId: Or.sessionId, commandId: Or.commandId });
      e &&
        Kt(e.type, e.payload, e.sessionId, e.baseRevision)
          .then((t) => {
            if (
              e.type === `createSession` &&
              (t.status === `accepted` || t.status === `duplicate`) &&
              t.result?.type === `createSession`
            ) {
              let n = e.clientContext?.workspace,
                r = n?.workspaceIdentity?.trim() || n?.workspacePath;
              if (r && r !== nt) {
                logger.error(`[v4-pending-command] 拒绝跨 workspace 提交 createSession 恢复结果`, {
                  originWorkspaceKey: r,
                  workspaceKey: nt,
                });
                return;
              }
              Pt(t.result.sessionId, e.clientContext?.groupedDraftTask);
            }
          })
          .catch((e) => {
            logger.warn(`[v4-pending-command] 用户确认重发失败`, e);
          });
    }, [Kt, Pt, Or, nt]),
    jr = r
      ? null
      : (0, $.jsx)(
          DraftComposerRegionMemo,
          {
            snapshot: Ce,
            sessionId: t,
            draftMode: ar,
            draftConfig: xt,
            telemetryDraftConfig: or,
            contextHeader: ar ? x : void 0,
            centered: ar,
            blockingRequestId: cr,
            listenAddToChatEvents: h,
            externalTextInsertRequest: h && t === null ? rt : null,
            onExternalTextInsertApplied: at,
            autoFocusEnabled: h,
            disabled: $n || er || br.state.blocksSubmit,
            isWebRemoteControl: u,
            workspacePath: s,
            workspaceIdentity: c,
            remoteSessionId: l ?? void 0,
            attachmentSessionId: fn,
            attachmentPut: ae,
            onRuntimeRestart: ce,
            provider: d,
            telemetryVisible: g && _e,
            readPlanIdentitySnapshot: It,
            onSendText: Sn,
            onDraftStateChange: Cn,
            composerRestoreRequest: Ye,
            onComposerRestoreApplied: Tn,
            onStop: Kn,
            onSelectModel: Vn,
            onSelectThought: Hn,
            onSwitchMode: Wn,
            onOpenRunningBackgroundWorks: t && ur > 0 ? pr : void 0,
            runningSubagentCount: sr.running.length,
            onRecoverCustomModelSelection: Un,
            onSendCompressionCommand: Gn,
            error: xr,
            onDismissError: wr,
            onOpenModelSettings: Tr,
            onOpenModelUpgrade: Er,
            onOpenCodeViewer: P,
            suppressGoalCommands: a,
            appSlashCommands: tn,
            onDropTargetControllerChange: ze,
          },
          `conversation-composer`,
        ),
    Mr = r
      ? null
      : (0, $.jsxs)($.Fragment, {
          children: [
            br.state.visible && !br.dismissed && (!vr || br.takesOverError || br.state.blocksSubmit)
              ? (0, $.jsx)(SessionQuotaBanner, {
                  state: br.state,
                  billingDiscountActive: jt.active,
                  billingDiscountConfig: jt.config,
                  upgradeActionLabelId: br.upgradeActionLabelId,
                  onUpgrade: br.upgradeProviderId && kt ? Dr : void 0,
                  onDismiss: br.dismiss,
                })
              : null,
            Or
              ? (0, $.jsx)(PendingCommandBanner, {
                  entry: Or,
                  onResend: Or.replay.kind === `input` ? Ar : void 0,
                  onDismiss: kr,
                })
              : null,
            t && Ce
              ? (0, $.jsx)(
                  MemoQueuePanel,
                  {
                    queue: Ce.queue,
                    onDeleteItem: Mn,
                    onEditItem: Nn,
                    pendingEditQueueItemId: er ? Ke.queueItemId : null,
                    onSendNow: Pn,
                    onMoveItem: Fn,
                    onResume: In,
                  },
                  `conversation-queue`,
                )
              : null,
            t && Ce
              ? (0, $.jsx)(
                  ConversationInteractionsOverlay,
                  {
                    sessionId: t,
                    workspacePath: s,
                    workspaceIdentity: c,
                    provider: d,
                    snapshot: Ce,
                  },
                  `conversation-interactions`,
                )
              : null,
            jr,
            ar && !c && !l ? (0, $.jsx)(OffPeakNewTaskBanner, { ...(N ? { onOpenAutomations: N } : {}) }) : null,
          ],
        });
  return (0, $.jsxs)(`div`, {
    "data-testid": joinTestidParts(v4SessionPaneTestid, e),
    "data-session-id": t ?? `draft`,
    "data-v4-conversation-drop-target": `true`,
    onDragOver: Ve?.onDragOver,
    onDragLeave: Ve?.onDragLeave,
    onDrop: Ve?.onDrop,
    className: `relative flex h-full min-h-0 flex-col`,
    children: [
      Ve?.active
        ? (0, $.jsx)(`div`, {
            className: `pointer-events-none absolute inset-0 z-50 flex items-center justify-center bg-accent/55 backdrop-blur-sm`,
            children: (0, $.jsxs)(`div`, {
              className: `flex items-center gap-2 rounded-full border border-border bg-accent px-4 py-2 text-ui-base text-foreground shadow-sm`,
              children: [
                (0, $.jsx)(Hand, { className: `size-4 text-foreground` }),
                (0, $.jsx)(`span`, {
                  children: Ot.formatMessage({
                    id:
                      Ve.kind === `workspace`
                        ? `chat.composer.workspaceFileDragHint`
                        : `chat.attachments.dragHint`,
                  }),
                }),
              ],
            }),
          })
        : null,
      (0, $.jsx)(PaneFloatingHeader, {
        title: Ce?.meta.title ?? ``,
        onSplitRight: _,
        onSplitDown: v,
        onClosePane: y,
        workspaceBadge: b,
      }),
      (0, $.jsxs)(`div`, {
        className: `@container/conversation relative flex min-h-0 flex-1 flex-col`,
        children: [
          ar
            ? null
            : (0, $.jsx)(ConversationSummaryAside, {
                workspacePath: s,
                workspaceIdentity: c,
                gitSummary: C,
                gitDirtyFileCount: w,
                gitWorktreeReviewSourceId: T,
                gitWorktreeChangeSummary: E,
                activeTaskChangeSummary: D,
                goal: a ? null : (Ce?.goal ?? null),
                sessionPlans: Se.sessionPlans,
                plan: Ce?.plan ?? null,
                backgroundWorks: Ce?.backgroundWorks ?? [],
                runningSubagents: sr.running,
                endedSubagentCount: sr.endedTotal,
                rootSessionId: n ?? t ?? void 0,
                parentSessionId: t ?? void 0,
                layoutMode: hr,
                summaryPanelVariantOverride: $e,
                onVariantChange: et,
                terminalSectionOpen: je,
                onTerminalSectionOpenChange: Me,
                agentSectionOpen: Ne,
                onAgentSectionOpenChange: Pe,
                onRefreshGit: A,
                onOpenGitReview: j,
                onPauseGoal: !r && !a && Ce?.availability.pauseGoal.allowed ? qn : void 0,
                onResumeGoal: !r && !a && Ce?.availability.resumeGoal.allowed ? Jn : void 0,
                onOpenPlanDetail: B ? Qt : void 0,
                onCancelBackgroundWork: r ? void 0 : Yn,
                onOpenSubagentSession: I ? Xt : void 0,
                onOpenSubagentDirectory: L && !u ? Zt : void 0,
              }),
          r && gr
            ? (0, $.jsx)(`div`, {
                role: `alert`,
                "data-testid": `v4-subagent-readonly-error`,
                className: `mx-4 mt-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-hover)] px-3 py-2 text-ui-base text-[var(--color-danger)]`,
                children: gr.message,
              })
            : null,
          tr
            ? (0, $.jsxs)(`div`, {
                className: `flex flex-1 flex-col items-center justify-center gap-2 p-4 text-ui-base`,
                children: [
                  (0, $.jsx)(`p`, {
                    className: `text-[var(--color-danger)]`,
                    children: Se.lastError,
                  }),
                  (0, $.jsx)(`button`, {
                    type: `button`,
                    "data-testid": v4RetrySubscribeTestid,
                    className: `rounded-md border border-[var(--color-border)] px-3 py-1`,
                    onClick: Xn,
                    children: `重新连接`,
                  }),
                ],
              })
            : (0, $.jsx)(PluginIconGate, {
                enabled: Te,
                remoteSessionId: l,
                sessionId: t,
                workspaceIdentity: c,
                workspacePath: s,
                children: (0, $.jsx)(ConversationMessageList, {
                  scrollToBottomActionRef: Qe,
                  rows: ar ? [] : (Ce?.rows.window ?? []),
                  apiRetry: ar ? null : (Ce?.control.apiRetry ?? null),
                  totalCount: ar ? 0 : (Ce?.rows.totalCount ?? 0),
                  sessionKey: t ?? `draft`,
                  scrollMemoryKey: ht,
                  rowContext: on,
                  onFork: rr ? En : void 0,
                  onRetry: nr ? An : void 0,
                  onFeedbackChange: !r && !a && t ? jn : void 0,
                  onEdit: ir ? Dn : void 0,
                  canLoadOlder: !ar && canLoadOlderRows(Ce),
                  loadingOlder: Se.loadingOlder,
                  onLoadOlder: Zn,
                  onLoadAllOlder: Qn,
                  turnNavigatorDirectoryRevision: Se.turnNavigatorDirectoryRevision,
                  bottomDock: Mr,
                  emptyState: ar
                    ? (0, $.jsx)(`div`, {
                        "data-testid": chatEmptyTestid,
                        className: `w-full`,
                        children: (0, $.jsx)(GreetingHero, { compactForRemoteControl: u }),
                      })
                    : null,
                  centerEmptyStateWithDock: ar,
                  compactEmptyStateWithDock: u,
                  summaryPanelLayout: hr,
                  conversationFindQuery: !ar && h ? H : ``,
                  conversationFindActiveIndex: !ar && h ? ee : -1,
                  onConversationFindMatchStateChange: !ar && h ? U : void 0,
                  searchResultHighlightRequest: ar ? null : te,
                  onSearchResultHighlightDone: ne,
                  sessionPhase: ar ? void 0 : Ce?.control.phase,
                  selectionActions:
                    !ar && t && !r && !a && !He
                      ? {
                          enabled: h && !cr,
                          sideActionDisabled: mt,
                          onAddToCurrentTask: $t,
                          onAskInSideChat: en,
                        }
                      : void 0,
                }),
              }),
        ],
      }),
      t && ge !== null
        ? (0, $.jsx)(RuntimeAuthHeadersController, { sessionId: t, workspacePath: s, workspaceIdentity: c })
        : null,
    ],
  });
}

export { ConversationPane };
