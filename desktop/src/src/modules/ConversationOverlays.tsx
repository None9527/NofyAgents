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
 *   nSt → snoozeInteractionAutoResolution   (117366 / 99705 附近)
 *   rSt → PERMISSION_RULE_FIELDS            (117400 / 99762)
 *   iSt → buildOptionResponse               (117401 / 99763)
 *   aSt → toPermissionRequest               (117419 / 99788)
 *   oSt → toGenericInteractionModel         (117440 / 99816)
 *   sSt → toElicitationRequest              (117449 / 99825)
 *   cSt → GenericInteractionDialog          (117469 / 99855)
 *   lSt/uSt/dSt → 快照定位/请求覆盖/草稿键    (117527,117530,117533 / 99875,99878,99881)
 *   fSt → createSnoozeLedger                (117536 / 99884)
 *   pSt → ConversationInteractionsOverlay   (117551 / 99899)
 *  [Captcha / provider 运行时头]（js 117706–118608 / jsx 100034–100891）
 *   mSt → ALIYUN_CAPTCHA_SCRIPT_URL         (117706 / 100034)
 *   ASt → AliyunCaptchaWidget（接口级）      (117919 / 100205)
 *   CSt → ALIYUN_CAPTCHA_CONTAINER_ID       (jsx 100132)
 *   FSt → CAPTCHA_VERIFY_PARAM_HEADER       (jsx 100474)
 *   RSt → CAPTCHA_SESSION_STORAGE_KEY       (jsx 100485)
 *   XSt → CAPTCHA_VERIFY_FAILED             (jsx 100551)
 *   b0  → isCaptchaProvider                 (118309 / 100548；A1-R14 删碑改指 ConversationLeaves，行校正 118292→118309)
 *   aCt → consumeRecoveredCaptchaHeader     (118327 / 100582)
 *   fCt → refreshCaptchaRuntimeHeaders      (118429 / 100618 附近)
 *   dCt → useCaptchaRecovery（接口级）       (118412 / 100659)
 *   hCt → runtimeHeadersRequestKey          (118512 / 100763)
 *   gCt → respondProviderRuntimeHeadersOnce (118519 / 100766 附近)
 *   _Ct → coalescedRuntimeHeadersResponse   (118572 / 100800 附近)
 *   vCt → RuntimeAuthHeadersController      (118608 / 100853)
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
  snoozeInteractionAutoResolution,
} from '../components/conversation/ConversationInteractionsOverlay';
/* ============================================================================
 * 4. Captcha / provider 运行时头（js 117706–118608 / jsx 100034–100891）
 * ==========================================================================*/

/** 原 mSt（js 117706 / jsx 100034）：Aliyun 验证码脚本地址 */
const ALIYUN_CAPTCHA_SCRIPT_URL = `https://o.alicdn.com/captcha-frontend/aliyunCaptcha/AliyunCaptcha.js`;
/** 原 CSt（jsx 100132） */
const ALIYUN_CAPTCHA_CONTAINER_ID = `zcode-aliyun-captcha-container`;
/** 原 FSt（jsx 100474） */
const CAPTCHA_VERIFY_PARAM_HEADER = `X-Aliyun-Captcha-Verify-Param`;
/** 原 RSt（jsx 100485） */
const CAPTCHA_SESSION_STORAGE_KEY = `aliyun_captcha_verification`;
/* ── tombstone（A1-R14）：const CAPTCHA_VERIFY_FAILED_CODE（原 XSt，js 118312 / jsx 100551）删除——
 *    本文件零代码引用（实测 grep 仅注释提及）；canonical = ConversationLeaves §5
 *    CAPTCHA_VERIFY_FAILED_CODE（与 ZSt 同 var 声明位，A1-R14 NCt 批置入并导出）。
 *    本文件 AliyunCaptchaWidget declare 实体化时经 ConversationLeaves import 取回。 ── */

/**
 * Aliyun 验证码部件（原 ASt，js 117919 / jsx 100205–100473；接口级）。
 * 动态加载 AliyunCaptcha.js → 容器内渲染滑块/无痕验证 → 成功后把
 * 验证参数写入会话存储（CAPTCHA_SESSION_STORAGE_KEY）并回调
 * （头部注入 CAPTCHA_VERIFY_PARAM_HEADER）。失败回调 CAPTCHA_VERIFY_FAILED_CODE。
 */
declare const AliyunCaptchaWidget: React.FC<{
  providerId: string;
  sessionId: string | null;
  onSuccess: (verifyParam: string) => void;
  onError: (error: { code: string; message?: string }) => void;
}>;

/* ── tombstone（A1-R14）：declare function isCaptchaProvider（原 b0，js 118309 / jsx 100548；旧注 118292 漂移）
 *    删除——本文件零调用点（实测 grep 仅余声明位与头表）；canonical = ConversationLeaves §5
 *    isCaptchaProtectedProvider（既有逐字实体，A1-R14 NCt 批消费面在案）。 ── */
/** 原 aCt（js 118327 / jsx 100582）：读取已恢复的 captcha 头（会话存储） */
declare function consumeRecoveredCaptchaHeader(args: {
  providerId: string;
  workspacePath?: string;
  workspaceIdentity?: string | null;
  sessionId: string | null;
}): Record<string, string> | null;
/** 原 fCt（js 118429 / jsx ~100618）：刷新 captcha 运行时头（订阅服务） */
declare function refreshCaptchaRuntimeHeaders(args: {
  providerId: string;
  providerConfig: unknown;
  codingPlanSubscriptionService: unknown;
  modelProviderService: unknown;
}): Promise<{ headers: Record<string, string> } | null>;

/** 原 hCt（js 118512 / jsx 100763）：请求合并键 */
function runtimeHeadersRequestKey(request: { workspace: { workspacePath?: string; workspaceIdentity?: string | null }; sessionId: string | null; requestId: string }): string {
  return [request.workspace.workspaceIdentity?.trim() || request.workspace.workspacePath, request.sessionId, request.requestId].join(`::`);
}
/** 原 O0（jsx 100762）：在途请求表（按键合并，避免重复验证） */
const runtimeHeadersInFlight = new Map<string, Promise<void>>();

/**
 * 原 gCt（js 118519 / jsx ~100766）：处理一次 provider 运行时头请求：
 * 需要 captcha 的 provider → 优先用已恢复的验证头，否则刷新获取 →
 * respondProviderRuntimeHeaders 回执（headersApplied/errorMessage/runtimeProviderHeaders）。
 */
declare function respondProviderRuntimeHeadersOnce(args: {
  request: { providerId: string; workspace: { workspacePath?: string; workspaceIdentity?: string | null }; sessionId: string | null; requestId: string };
  zcodeSessionService: { respondProviderRuntimeHeaders(args: object): Promise<void> };
  codingPlanSubscriptionService: unknown;
  modelProviderService: { getAllCached(): Promise<{ id: string }[]> };
}): Promise<void>;
/** 原 _Ct（js 118572 / jsx ~100800）：按键合并在途请求 */
declare function coalescedRuntimeHeadersResponse(args: Parameters<typeof respondProviderRuntimeHeadersOnce>[0]): Promise<void>;

/**
 * 运行时认证头控制器（原 vCt，js 118608 / jsx 100853）。
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
  codingPlanSubscriptionService: unknown;
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

/** 原 CCt（js 118643 / jsx 100895）：从错误文案提取 fault.* 键（缺省 subscribe.unknown） */
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
  ALIYUN_CAPTCHA_SCRIPT_URL,
  CAPTCHA_VERIFY_PARAM_HEADER,
  /* Session errors */
  useSessionSubscriptionErrorReporterImpl as useSessionSubscriptionErrorReporter,
  parseFaultKey,
};
