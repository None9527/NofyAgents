/* eslint-disable */
/**
 * ============================================================================
 * ConversationOverlays.tsx — ZCode 3.7.6 会话族 · 覆盖层模块（F03 Stage B 拆分文件 2/2）
 * ============================================================================
 *
 * 来源文件（融合 chunk，213,695 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js
 * 对照文件（pretty-print 版）：
 *   /home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx
 * 规格：/home/none/grok-build/web/docs/zcode-uiux-spec.md §6
 * 主文件：Conversation.tsx（拆分依据见 Conversation.report.md §0）
 *
 * ----------------------------------------------------------------------------
 * 混淆名 → 语义名（js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 *  [Permission 审批内联覆盖层]  chat.permission.*（js 116704–117165 / jsx 99162–99508）
 *   vxt → PERMISSION_OPTION_KIND_SYNONYMS   (116704 / 99162)
 *   yxt → normalizeOptionKindText           (116711 / 99169)
 *   Z1  → classifyPermissionOptionKind      (116714 / 99172)
 *   bxt → isCustomPermissionOption          (116729 / 99179)
 *   xxt → permissionOptionSortRank          (116735 / 99185)
 *   Sxt → sortPermissionOptions             (116749 / 99199)
 *   Cxt → PERMISSION_TOOL_ICON              (116758 / 99210)
 *   wxt/Txt → SCOPE_DISPLAY_MAX_LEN / 通用理由集 (116762 / 99211)
 *   Ext → truncateScopeDisplay              (116764 / 99213)
 *   Dxt → extractBashAllowScopes            (116770 / 99222)
 *   Oxt → PermissionRuleScopes              (116781 / 99231)
 *   kxt → permissionOptionLabelId           (116802 / 99236)
 *   Axt/jxt/Mxt → 供应商选项文案映射/解析     (116816,116824 / 99250,99262)
 *   Nxt → permissionOptionDescriptionId     (116828 / 99266)
 *   Q1/$1 → trimToNull / visibleReasonText  (116842,116845 / 99280,99283)
 *   Pxt → resolvePermissionRequestReason    (116849 / 99287)
 *   Fxt → resolveMcpToolName                (116855 / 99293)
 *   Ixt → resolveRawReason                  (116860 / 99298)
 *   Lxt → classifyPermissionToolView        (116863 / 99301)
 *   Rxt → permissionToolViewToggle          (116876 / 99306)
 *   zxt → toPermissionToolCall              (116888 / 99324)
 *   Bxt → buildPermissionToolViewProps      (116899 / 99335)
 *   Vxt → McpPermissionRow                  (116929 / 99373)
 *   Hxt → PermissionApprovalOverlay         (116960 / 99392)
 *   Xpt → isSwitchModePermissionRequest     (106604 / 91469)
 *   Hpt → SwitchModeHint                    (106405 / 91360)
 *   Vte → buildPermissionRequestModel（src-HCld2afU.js 的 l 导出，跨 chunk）
 *   nxt → InteractionOriginBadge            (115916 / 98675)
 *  [Elicitation 问题内联覆盖层]  chat.elicitation.*（js 115930–116690 / jsx 98698–99161）
 *   q1/J1 → 自动结束心跳 60s / plan 审批值 approve (115930,115931 / 98698,98699)
 *   rxt/ixt → 倒计时解析/下次心跳延迟         (115932,115937 / 98700,98705)
 *   axt → useAutoResolutionCountdown        (115945 / 98713)
 *   oxt → mapElicitationKeyDown             (115972 / 98730)
 *   sxt → normalizeElicitationQuestions     (115985 / 98733)
 *   cxt/lxt → isPlainObject / isPlanApprovalRequest (116009,116012 / 98755,98758)
 *   uxt → buildInitialAnswerDrafts          (116016 / 98762)
 *   dxt → resolveInitialQuestionIndex       (116027 / 98774)
 *   fxt → optionFocusSlotCount              (116032 / 98779)
 *   pxt → focusIndexForQuestion             (116035 / 98782)
 *   Y1  → collectQuestionAnswers            (116045 / 98792)
 *   mxt → buildElicitationAnswerPayload     (116050 / 98800)
 *   hxt → applyAnswerSelection              (116070 / 98818)
 *   X1  → advanceKindForQuestion            (116082 / 98835)
 *   gxt → ElicitationDialogKeyed            (116085 / 98838)
 *   _xt → ElicitationDialog                 (116088 / 98841)
 *  [Interaction 交互调度]（js 117283–117684 / jsx 99619–100033）
 *   eSt → useWorkspaceInteractionToasts     (117283 / 99619)
 *   tSt → useSnapshotInteractionToasts      (117346 / 99703)
 *   nSt → sendSnoozeInteractionCommand      (117414；〔A1-P1-B13〕束真身逐字，手写 snoozeInteractionAutoResolution 墓碑)
 *   rSt → PERMISSION_RULE_FIELDS            (117400 / 99762)
 *   iSt → buildOptionResponse               (117401 / 99763)
 *   aSt → toPermissionRequest               (117419 / 99788)
 *   oSt → toGenericInteractionModel         (117440 / 99816)
 *   sSt → toElicitationRequest              (117449 / 99825)
 *   cSt → GenericInteractionDialog          (117469 / 99855)
 *   lSt/uSt/dSt → 快照定位/请求覆盖/草稿键    (117527,117530,117533 / 99875,99878,99881)
 *   fSt → createSnoozeLedger                (117536 / 99884)
 *   pSt → ConversationInteractionsOverlay   (117551 / 99899)
 *  [Captcha / provider 运行时头]（js 117754–118640 / jsx 100034–100891；A1-R15 行校正，旧注 117706–118608）
 *   mSt → ALIYUN_CAPTCHA_SCRIPT_URL         (117754；A1-R16 本文件副本删碑，canonical = Leaves；旧注 117706)
 *   ASt → handleAliyunSdkFail（Leaves §5）   (117936；A1-R16：AliyunCaptchaWidget declare 删碑，部件真身 wSt=CaptchaHostContainer Leaves 591，消费 212894；旧注 117919)
 *   CSt → CAPTCHA_CONTAINER_ID（Leaves）    (117868；A1-R16 本文件副本删碑)
 *   FSt → CAPTCHA_VERIFY_HEADER（Leaves）   (118231；A1-R16 本文件副本删碑)
 *   RSt → CAPTCHA_ARMS_EVENT_NAME（Leaves）  (118237；A1-R16 本文件误命名副本删碑；R15 勘误在案：ARMS 事件名非存储键)
 *   XSt → CAPTCHA_VERIFY_FAILED             (jsx 100551)
 *   b0  → isCaptchaProvider                 (118309 / 100548；A1-R14 删碑改指 ConversationLeaves，行校正 118292→118309)
 *   aCt → consumeRecoveredCaptchaHeader     (118344 / 100582；A1-R15 删碑改指 ConversationLeaves takeRuntimeProviderHeaders，行校正 118327→118344)
 *   fCt → refreshCaptchaRuntimeHeaders      (118446 / 100618 附近；A1-R15 删碑改指 ConversationLeaves restoreCaptchaVerificationForSend 逐字真身，行校正 118429→118446)
 *   dCt → noteCaptchaCertifyIdForSend（ConversationLeaves §5 既转录；旧注 useCaptchaRecovery 118412 为误读，真身 118429；A1-R15 注释校正)
 *   hCt → runtimeHeadersRequestKey          (118529 / 100763；A1-R15 行校正，旧注 118512)
 *   gCt → respondProviderRuntimeHeadersOnce (118536 / 100766 附近；A1-R15 实体化，行校正 118519→118536)
 *   _Ct → coalescedRuntimeHeadersResponse   (118589 / 100800 附近；A1-R15 实体化，行校正 118572→118589)
 *   vCt → RuntimeAuthHeadersController      (118625 / 100853；A1-R15 行校正，旧注 118608)
 *  [Session 错误]（js 118641–118660 / jsx 100891–100899）
 *   yCt/bCt/xCt/SCt → 订阅错误面/缺省 fault 键/正则 (jsx 100891–100894)
 *   CCt → parseFaultKey                     (118643 / 100895)
 *   wCt → useSessionSubscriptionErrorReporter (118647 / 100899)
 *
 * ----------------------------------------------------------------------------
 * 外部依赖（与 Conversation.tsx 相同部分不重复注释）
 * ----------------------------------------------------------------------------
 *  - cn (utils)、Button/Input (button/imeComposition)、Tooltip/Popover (usageStatsUiParts)、
 *    useIntlContext (IntlProvider)、logger (logger)、toast (imeComposition _)
 *  - Ao → useSettingsStoreValue（stores-core，styles js 1301）：读取 theme /
 *    codePreviewSettings / notificationEnabled
 *  - xe → useTaskStore、te/W → 任务作用域选择器（skillStore-BmeKHDBI.js）：
 *    elicitation 表单草稿按 工作区×会话 持久化
 *  - Vte → buildPermissionRequestModel（src-HCld2afU.js 的 l 导出）
 *  - OS → 命令工厂、K1 → 待恢复命令账本（本 chunk，js 34582 / 115710）
 *  - VS/HS → 交互通知登记（本 chunk，js 32468 / 32498）
 *  - ToolLayout/ToolCallBlock 工具视图族（Conversation.tsx §4）：permission 卡复用
 *    Gft/Vxt/mht/upt/ept/Qpt 渲染待审批工具调用
 * ============================================================================
 */

import * as React from "react";
import { logger } from './SkillStore';
import { isCaptchaProtectedProvider, takeRuntimeProviderHeaders, restoreCaptchaVerificationForSend, type CaptchaConfig } from './ConversationLeaves'; // A1-R15：§4 gCt/_Ct 实体化消费（原 b0 118309 / aCt 118344 / fCt 118446 真身）；环安全：ConversationLeaves 不反引本文件（grep 实证），新边叶向单向

/* ============================================================================
 * 〔A0-S4-4b：components 拆分（conversation/composer 域）——本文件现为薄 re-export shim〕
 * 三个组件族已按族原样迁入，导入方零改动（仍从本文件取符号）：
 *   §1 Permission 子族  → components/conversation/PermissionApprovalOverlay.tsx
 *   §2 Elicitation 子族 → components/conversation/ElicitationDialog.tsx
 *   §3 交互调度         → components/conversation/ConversationInteractionsOverlay.tsx
 * §0 声明群随消费族分配：classifyToolCall/extractRawFileSummaries/parseToolCallRaw/
 * isPlainRecord + InteractionOrigin/PermissionOption/PermissionRequest 随 Permission 族；
 * isImeComposing + ElicitationQuestion/ElicitationRequest 随 Elicitation 族
 * （AnswerDraft/AnswerDraftMap 原 §2 体内私型，补 export 供交互调度族 type import）；
 * CommandAck/buildCommand/pendingCommandLedger + PendingInteraction/
 * SessionSnapshotForOverlays 随交互调度族。跨族型别全部 type-only（编译期擦除，零环）。
 * §4 Captcha 运行时头/§5 会话订阅错误上报为服务管线（非组件单元），留守本文件。
 * ==========================================================================*/
/* ============================================================================
 * 0. 外部依赖类型声明（重建接口）
 * ==========================================================================*/

/* ── tombstone（A0-D）：cn declare 删除 → import { cn } from './UtilsCn'（canonical）。 ── */
/* ── tombstone（A0-D）：IntlShape/useIntlContext 脚手架删除 → I18n useZCodeIntl（alias）+ type ZCodeIntl as IntlShape。 ── */
/* ── tombstone（A0-D）：ButtonProps/Button declare 删除 → import { Button } from './button'（canonical）。 ── */

/* ── tombstone（A0-CLEANUP3 #49）：原 Ao useSettingsSelector declare 删除 →
 *    import { useSettingsStoreValue as useSettingsSelector } from './stores-core'。
 *    属主定位：styles-CdEGpc2x.js js 1301（非 src-HCld2afU.js；该 chunk 3367 的 Ao 为无关对象）。 ── */

/** 原 A（imeComposition chunk 的 t 导出）：IME 组词回车守卫 */
declare function isImeComposing(event: React.KeyboardEvent): boolean;

/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（9）：IconInfo/IconLoader/IconSpinner/IconShield/IconChevronLeft/IconChevronRight/IconChevronDown/IconChevronUp/IconCheck → 真实 import（文件头导入块）：npm lucide-react@1.35.0，其中 button chunk 图标（ChevronLeft/ChevronRight/ZoomIn/ZoomOut）经 './button' pass-1 canonical；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */

/* --- 工具视图复用（Conversation.tsx §4）---
 * ── tombstone（A0-D）：本地 ToolCall/ToolCallNode/ToolCallViewProps 接口删除 →
 *    type import from './ConversationLeaves'（会话流共享类型 canonical）。
 * ── tombstone（A0-D）：ToolLayout declare 删除 → import { ToolLayout } from './Conversation'。 ── */



/* ============================================================================
 * 〔A0-S4-4b〕§1/§2/§3 组件族迁出位——以下为再导出面（原 §1 230–766、
 * §2 767–1501、§3 1502–1883 已按族原样迁入 components/conversation/）
 * ==========================================================================*/

export {
  PermissionApprovalOverlay,
  McpPermissionRow,
  PermissionRuleScopes,
  InteractionOriginBadge,
  sortPermissionOptions,
  classifyPermissionOptionKind,
} from '../components/conversation/PermissionApprovalOverlay';

export {
  ElicitationDialog,
  ElicitationDialogKeyed,
  normalizeElicitationQuestions,
  isPlanApprovalRequest,
  buildElicitationAnswerPayload,
} from '../components/conversation/ElicitationDialog';

export {
  ConversationInteractionsOverlay,
  GenericInteractionDialog,
  toPermissionRequest,
  toElicitationRequest,
  toGenericInteractionModel,
  sendSnoozeInteractionCommand, // 〔A1-P1-B13〕原 nSt 束真身逐字改指（手写 snoozeInteractionAutoResolution 墓碑；下游零消费在案）
} from '../components/conversation/ConversationInteractionsOverlay';
/* ============================================================================
 * 4. Captcha / provider 运行时头（js 117754–118640 / jsx 100034–100891；A1-R16 行校正，旧注 117706–118608）
 * ==========================================================================*/

/* ── tombstone（A1-R16）：const ALIYUN_CAPTCHA_SCRIPT_URL（原 mSt）/ ALIYUN_CAPTCHA_CONTAINER_ID（原 CSt）/
 *    CAPTCHA_VERIFY_PARAM_HEADER（原 FSt）/ CAPTCHA_SESSION_STORAGE_KEY（原 RSt，误命名；真身 = ARMS
 *    事件名）四枚本文件副本删除——bundle 各唯一真身 117754/117868/118231/118237，消费面全在 Leaves §5
 *    （wSt/DSt/LSt/VSt）；本文件副本零外部消费（modules/components/stores/lib/services grep 实证，
 *    含导出面），双实例收敛，canonical = ConversationLeaves（ALIYUN_CAPTCHA_SCRIPT_URL /
 *    CAPTCHA_CONTAINER_ID / CAPTCHA_VERIFY_HEADER / CAPTCHA_ARMS_EVENT_NAME）。 ── */
/* ── tombstone（A1-R14）：const CAPTCHA_VERIFY_FAILED_CODE（原 XSt，js 118312 / jsx 100551）删除——
 *    本文件零代码引用（实测 grep 仅注释提及）；canonical = ConversationLeaves §5
 *    CAPTCHA_VERIFY_FAILED_CODE（与 ZSt 同 var 声明位，A1-R14 NCt 批置入并导出）。
 *    （A1-R16 注：原「AliyunCaptchaWidget 实体化时取回」之约随该 declare 删碑作废——见下碑。） ── */

/* ── tombstone（A1-R16）：declare const AliyunCaptchaWidget（declare 期误映 ASt，jsx 100205–100473 视图
 *    幻影）删除——styles chunk 无该 props 面（providerId/sessionId/onSuccess/onError）对应实体：
 *    部件真身 = wSt@117871 宿主容器 = ConversationLeaves CaptchaHostContainer（591 导出；终端消费
 *    bundle 212894 = AppRootLeaves 1910，既有边在案）；SDK 编排整域 117754–118290 已全勘收敛
 *    （A1-R16：kSt 117929 恒拒门实体化、d0/scriptLoadPromise 删碑）。本树零调用点（grep 实证仅头表/
 *    碑文提及），按死 declare 先例（A1-R8/R9/R14）删碑改指。 ── */

/* ── tombstone（A1-R14）：declare function isCaptchaProvider（原 b0，js 118309 / jsx 100548；旧注 118292 漂移）
 *    删除——本文件零调用点（实测 grep 仅余声明位与头表）；canonical = ConversationLeaves §5
 *    isCaptchaProtectedProvider（既有逐字实体，A1-R14 NCt 批消费面在案）。 ── */
/* ── tombstone（A1-R15）：declare function consumeRecoveredCaptchaHeader（原 aCt，js 118344 / jsx 100582；
 *    declare 期旧注 118327 漂移、「会话存储」描述为误读——真身读取 C0 运行时头账本并取出即清）删除——
 *    canonical = ConversationLeaves takeRuntimeProviderHeaders（既有逐字实体），本文件
 *    respondProviderRuntimeHeadersOnce 转录体经文件头 import 直接消费（调用点 = bundle 118545）。 ── */
/* ── tombstone（A1-R15）：declare function refreshCaptchaRuntimeHeaders（原 fCt，js 118446 / jsx ~100618；
 *    declare 期旧注 118429 漂移、`{ headers } | null` 返回面为近似）删除——canonical = ConversationLeaves
 *    restoreCaptchaVerificationForSend（A1-R15 校正回逐字真身：{ captchaVerifyParam, headers } | undefined，
 *    含 dCt/w0/LSt 三段），经文件头 import 消费（调用点 = bundle 118559）。 ── */

/** 原 hCt（js 118529 / jsx 100763；A1-R15 行校正，旧注 118512）：请求合并键 */
function runtimeHeadersRequestKey(request: { workspace: { workspacePath?: string; workspaceIdentity?: string | null }; sessionId: string | null; requestId: string }): string {
  return [request.workspace.workspaceIdentity?.trim() || request.workspace.workspacePath, request.sessionId, request.requestId].join(`::`);
}
/** 原 O0（jsx 100762）：在途请求表（按键合并，避免重复验证） */
const runtimeHeadersInFlight = new Map<string, Promise<void>>();

/* --- A1-R15：gCt/_Ct 实体化（js 118536–118624，逐字转录） ---
 * 映射表（minified → 语义名 → bundle 行）：
 *   gCt → respondProviderRuntimeHeadersOnce (118536)  处理一次 provider 运行时头请求
 *   _Ct → coalescedRuntimeHeadersResponse   (118589)  按键合并在途请求
 * 行内消费：b0=isCaptchaProtectedProvider / aCt=takeRuntimeProviderHeaders /
 *   fCt=restoreCaptchaVerificationForSend（ConversationLeaves 改指）；hCt=runtimeHeadersRequestKey /
 *   O0=runtimeHeadersInFlight（本文件既转录）；J=logger。
 * 终端消费：本文件 RuntimeAuthHeadersControllerImpl（vCt 实体，= bundle 118635 _Ct 调用点）。 ── */

/** 原 gCt（js 118536 / jsx ~100766）— 逐字；处理一次 provider 运行时头请求：
 * 需要 captcha 的 provider → 优先用已恢复的验证头，否则刷新获取 →
 * respondProviderRuntimeHeaders 回执（headersApplied/errorMessage/runtimeProviderHeaders）。 */
async function respondProviderRuntimeHeadersOnce(e: {
  request: { providerId: string; workspace: { workspacePath?: string; workspaceIdentity?: string | null }; sessionId: string | null; requestId: string };
  zcodeSessionService: { respondProviderRuntimeHeaders(args: object): Promise<void> };
  codingPlanSubscriptionService: { getCaptchaConfig?(): Promise<CaptchaConfig | null>; [method: string]: unknown };
  modelProviderService: { getAllCached(): Promise<{ id: string }[]> };
}): Promise<void> {
  let t = !1,
    n,
    r;
  try {
    let n = (await e.modelProviderService.getAllCached()).find(
      (t) => t.id === e.request.providerId,
    );
    if (isCaptchaProtectedProvider(n)) {
      let i = takeRuntimeProviderHeaders({
        providerId: e.request.providerId,
        workspacePath: e.request.workspace.workspacePath,
        workspaceIdentity: e.request.workspace.workspaceIdentity,
        sessionId: e.request.sessionId,
      });
      if (i)
        ((r = i),
          logger.info(`[captcha] provider runtime headers consumed recovered captcha header`, {
            providerId: e.request.providerId,
            requestId: e.request.requestId,
            sessionId: e.request.sessionId,
          }));
      else {
        let t = await restoreCaptchaVerificationForSend({
          providerId: e.request.providerId,
          providerConfig: n,
          codingPlanSubscriptionService: e.codingPlanSubscriptionService,
          modelProviderService: e.modelProviderService,
        });
        t && (r = t.headers);
      }
      t = !!r;
    }
  } catch (t) {
    ((n = t instanceof Error ? t.message : String(t)),
      logger.warn(`[captcha] provider runtime headers refresh failed`, {
        providerId: e.request.providerId,
        requestId: e.request.requestId,
        error: n,
      }));
  }
  await e.zcodeSessionService.respondProviderRuntimeHeaders({
    workspacePath: e.request.workspace.workspacePath,
    workspaceIdentity: e.request.workspace.workspaceIdentity,
    sessionId: e.request.sessionId,
    requestId: e.request.requestId,
    response: {
      headersApplied: t,
      ...(n ? { errorMessage: n } : {}),
      ...(r ? { runtimeProviderHeaders: r } : {}),
    },
  });
}

/** 原 _Ct（js 118589 / jsx ~100800；A1-R15 行校正，旧注 118587）— 逐字；按键合并在途请求 */
async function coalescedRuntimeHeadersResponse(e: Parameters<typeof respondProviderRuntimeHeadersOnce>[0]): Promise<void> {
  let t = runtimeHeadersRequestKey(e.request),
    n = runtimeHeadersInFlight.get(t);
  if (n) {
    logger.info(`[captcha] provider runtime headers request coalesced`, {
      providerId: e.request.providerId,
      requestId: e.request.requestId,
      sessionId: e.request.sessionId,
    });
    try {
      await n;
    } catch (t) {
      logger.warn(`[captcha] provider runtime headers coalesced response failed`, {
        error: t instanceof Error ? t.message : String(t),
        providerId: e.request.providerId,
        requestId: e.request.requestId,
        sessionId: e.request.sessionId,
      });
    }
    return;
  }
  let r = respondProviderRuntimeHeadersOnce(e).finally(() => {
    runtimeHeadersInFlight.delete(t);
  });
  runtimeHeadersInFlight.set(t, r);
  try {
    await r;
  } catch (t) {
    logger.warn(`[captcha] provider runtime headers response failed`, {
      error: t instanceof Error ? t.message : String(t),
      providerId: e.request.providerId,
      requestId: e.request.requestId,
      sessionId: e.request.sessionId,
    });
  }
}

/**
 * 运行时认证头控制器（原 vCt，js 118625 / jsx 100853；A1-R15 行校正，旧注 118608）。
 * 渲染为 null：仅订阅 onDynamicProviderRuntimeHeadersRequest 事件，
 * 把 provider 运行时头请求转交 captcha 流程处理。
 * 由 ConversationPane（R0）在会话激活时挂载。
 */
function RuntimeAuthHeadersControllerImpl({
  sessionId,
  workspacePath,
  workspaceIdentity,
}: {
  sessionId: string;
  workspacePath?: string;
  workspaceIdentity?: string | null;
}) {
  const { codingPlanSubscriptionService, modelProviderService, zcodeAgentService } = useOverlayServices();
  React.useEffect(() => {
    if (!sessionId) return;
    const subscription = zcodeAgentService.onDynamicProviderRuntimeHeadersRequest({
      workspacePath,
      ...(workspaceIdentity ? { workspaceIdentity } : {}),
      sessionId,
    })((request: Parameters<typeof respondProviderRuntimeHeadersOnce>[0]["request"]) => {
      coalescedRuntimeHeadersResponse({
        request,
        zcodeSessionService: zcodeAgentService,
        codingPlanSubscriptionService,
        modelProviderService,
      }).catch((error) => {
        logger.warn(`[v4-runtime-auth] provider runtime headers response failed`, {
          error: error instanceof Error ? error.message : String(error),
          providerId: request.providerId,
          requestId: request.requestId,
          sessionId: request.sessionId,
        });
      });
    });
    return () => {
      subscription.dispose();
    };
  }, [codingPlanSubscriptionService, modelProviderService, sessionId, workspaceIdentity, workspacePath, zcodeAgentService]);
  return null;
}
declare function useOverlayServices(): {
  codingPlanSubscriptionService: { getCaptchaConfig?(): Promise<CaptchaConfig | null>; [method: string]: unknown }; // A1-R15 型缝：gCt 118561 → fCt codingPlanSubscriptionService 消费面（原 unknown 过窄）
  modelProviderService: { getAllCached(): Promise<{ id: string }[]> };
  zcodeAgentService: {
    onDynamicProviderRuntimeHeadersRequest(scope: object): (handler: (request: Parameters<typeof respondProviderRuntimeHeadersOnce>[0]["request"]) => void) => { dispose(): void };
    respondProviderRuntimeHeaders(args: object): Promise<void>;
  };
};

/* ============================================================================
 * 5. 会话订阅错误上报（js 118641–118660 / jsx 100891–100899）
 * ==========================================================================*/

const SESSION_SUBSCRIPTION_ERROR_SURFACE = `session_subscription_error`; // yCt
const DEFAULT_FAULT_KEY = `fault.subscribe.unknown`; // bCt
const FAULT_KEY_REGEX = /^fault\.[A-Za-z0-9._-]+$/; // xCt
const FAULT_KEY_TAIL_REGEX = /\((fault\.[A-Za-z0-9._-]+)\)\s*$/; // SCt

/** 原 CCt（js 118660 / jsx 100895）：从错误文案提取 fault.* 键（缺省 subscribe.unknown） */
function parseFaultKey(message: string): string {
  const trimmed = message.trim();
  return FAULT_KEY_REGEX.exec(trimmed)?.[0] ?? FAULT_KEY_TAIL_REGEX.exec(trimmed)?.[1] ?? DEFAULT_FAULT_KEY;
}

/**
 * 订阅错误上报钩子（原 wCt，js 118647 / jsx 100899）。
 * 可见的连接错误按 会话:键:文案 去重后上报监督器（遥测面）。
 */
function useSessionSubscriptionErrorReporterImpl({
  supervisor,
  sessionId,
  lastError,
  visible,
}: {
  supervisor: { reportVisibleChatError(report: object): void } | null;
  sessionId: string | null;
  lastError: string | null;
  visible: boolean;
}) {
  const reportedKeys = React.useRef(new Set<string>());
  React.useEffect(() => {
    if (!visible || !supervisor || !sessionId || !lastError) return;
    const faultKey = parseFaultKey(lastError);
    const errorKey = `${sessionId}:${faultKey}:${lastError}`;
    if (reportedKeys.current.has(errorKey)) return;
    reportedKeys.current.add(errorKey);
    supervisor.reportVisibleChatError({
      surface: SESSION_SUBSCRIPTION_ERROR_SURFACE,
      errorKey,
      displayMessage: lastError,
      error: { code: faultKey, message: lastError, taskId: sessionId },
    });
  }, [lastError, sessionId, supervisor, visible]);
}

/* ============================================================================
 * 6. 导出
 * ==========================================================================*/

export {
  /* Captcha / runtime auth */
  RuntimeAuthHeadersControllerImpl as RuntimeAuthHeadersController,
  /* Session errors */
  useSessionSubscriptionErrorReporterImpl as useSessionSubscriptionErrorReporter,
  parseFaultKey,
};
