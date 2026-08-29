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
 *   b0  → isCaptchaProvider                 (118292 / 100548)
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
 *  - Ao → useSettingsSelector（src-HCld2afU.js）：读取 theme / codePreviewSettings /
 *    notificationEnabled
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
import { ShellToolView, ToolLayout } from './Conversation'; // +ToolLayout（A0-D 接线：declare → Conversation canonical）
import { FallbackToolView, FileWriteToolView, SearchToolView, SkillToolView, type FileSummary, type ToolCall, type ToolCallNode, type ToolCallViewProps } from './ConversationLeaves'; // +4 type（A0-D 类型收敛：会话流共享类型 canonical = ConversationLeaves）
import { Input } from './ImeComposition';
import { type CodePreviewSettings } from './MarkdownIntegration';
import { Badge } from './PaymentDeep';
import { logger } from './SkillStore';
import { buildPermissionRequestViewModel } from './SrcSharedB';
import { useZCodeIntl as useIntlContext, type ZCodeIntl as IntlShape } from './I18n'; // 原 G，IntlProvider-C321H7m8.js（A0-D 接线：declare → I18n canonical）
import { Button } from './button'; // 原 H，button-laUijeDG.js（A0-D 接线：declare → button canonical）
import { cn } from './UtilsCn'; // 原 Z，utils-CEEH0K_K.js（A0-D 接线：declare → UtilsCn canonical）

/* ============================================================================
 * 0. 外部依赖类型声明（重建接口）
 * ==========================================================================*/

/* ── tombstone（A0-D）：cn declare 删除 → import { cn } from './UtilsCn'（canonical）。 ── */
/* ── tombstone（A0-D）：IntlShape/useIntlContext 脚手架删除 → I18n useZCodeIntl（alias）+ type ZCodeIntl as IntlShape。 ── */
/* ── tombstone（A0-D）：ButtonProps/Button declare 删除 → import { Button } from './button'（canonical）。 ── */

/** 原 Ao（src-HCld2afU.js）：设置 store 选择器（theme/codePreviewSettings/notificationEnabled） */
declare function useSettingsSelector<T>(selector: (settings: { theme: string; codePreviewSettings: unknown; notificationEnabled: boolean }) => T, fallback: T): T;

/** 原 A（imeComposition chunk 的 t 导出）：IME 组词回车守卫 */
declare function isImeComposing(event: React.KeyboardEvent): boolean;

declare const IconInfo: React.FC<React.SVGProps<SVGSVGElement>>; // p
declare const IconLoader: React.FC<React.SVGProps<SVGSVGElement>>; // fv
declare const IconSpinner: React.FC<React.SVGProps<SVGSVGElement>>; // M（imeComposition w）
declare const IconShield: React.FC<React.SVGProps<SVGSVGElement>>; // Rbe
declare const IconChevronLeft: React.FC<React.SVGProps<SVGSVGElement>>; // Ea
declare const IconChevronRight: React.FC<React.SVGProps<SVGSVGElement>>; // wa
declare const IconChevronDown: React.FC<React.SVGProps<SVGSVGElement>>; // N_
declare const IconChevronUp: React.FC<React.SVGProps<SVGSVGElement>>; // P_
declare const IconCheck: React.FC<React.SVGProps<SVGSVGElement>>; // M_

/* --- 工具视图复用（Conversation.tsx §4）---
 * ── tombstone（A0-D）：本地 ToolCall/ToolCallNode/ToolCallViewProps 接口删除 →
 *    type import from './ConversationLeaves'（会话流共享类型 canonical）。
 * ── tombstone（A0-D）：ToolLayout declare 删除 → import { ToolLayout } from './Conversation'。 ── */

declare function classifyToolCall(toolCall: ToolCall): { family: string };
declare function extractRawFileSummaries(raw: unknown, toolCall: ToolCall): FileSummary[];
declare function parseToolCallRaw(raw: unknown): Record<string, unknown> | null; // hg
declare function isPlainRecord(value: unknown): value is Record<string, unknown>; // pg

/* --- 命令协议 --- */

interface CommandAck {
  status: "accepted" | "duplicate" | "noop" | "rejected" | "stale";
  reasonCode?: string;
}
declare function buildCommand(args: { type: string; sessionId: string | null; payload: unknown }): {
  type: string;
  commandId: string;
  sessionId: string | null;
  payload: unknown;
}; // OS（js 34582）
declare const pendingCommandLedger: {
  record(command: unknown): void;
  applyAck(command: unknown, ack: CommandAck): void;
}; // K1（js 115710）

/* --- 交互/快照模型 --- */

type InteractionOrigin = { kind: string; agentType?: string } | undefined;

interface PermissionOption {
  optionId: string;
  kind: string;
  name: string;
  detail?: Record<string, unknown>;
  response?: unknown;
}
interface PermissionRequest {
  type: "permission_request";
  taskId: string;
  traceId: string;
  requestId: string;
  description?: string;
  kind?: string;
  title?: string;
  options: PermissionOption[];
  origin?: InteractionOrigin;
  raw: unknown;
  toolName?: string;
}
interface ElicitationQuestion {
  key: string;
  question: string;
  header?: string;
  options: { value: string; label: string; description?: string }[];
  multiSelect?: boolean;
}
interface ElicitationRequest {
  type: "elicitation_request";
  taskId: string;
  traceId: string;
  requestId: string;
  message: string;
  header?: string;
  options: { value: string; label?: string; description?: string }[];
  multiSelect?: boolean;
  questions: { question: string; header?: string; options: { value: string; label?: string; description?: string }[]; multiSelect?: boolean }[];
  currentQuestionIndex?: number;
  answerDrafts?: Record<string, string[]>;
  origin?: InteractionOrigin;
  schema?: unknown;
  freeText?: boolean;
}
interface PendingInteraction {
  interactionId: string;
  autoResolution?: { state: "pending" | "snoozed" | string; deadlineAt?: number; startedAt?: number; snoozedAt?: number };
  payload:
    | { kind: "permission"; toolName: string; summary?: string; options: { optionId: string; kind: string; label: string; response?: unknown }[]; origin?: InteractionOrigin; detail?: Record<string, unknown>; traceId?: string }
    | { kind: "userInput"; toolName?: string; prompt?: string; freeText?: boolean; sensitive?: boolean; options?: { optionId: string; label: string }[]; questions?: ElicitationRequest["questions"]; currentQuestionIndex?: number; answerDrafts?: Record<string, string[]>; origin?: InteractionOrigin; schema?: unknown; traceId?: string; input?: unknown };
}
interface SessionSnapshotForOverlays {
  sessionId: string;
  pendingInteractions: PendingInteraction[];
}

/* ============================================================================
 * 1. Permission 子族（审批内联覆盖层；chat.permission.*）
 * ==========================================================================*/

/**
 * 原 vxt（js 116704 / jsx 99162）：选项 kind 同义词表
 * （后端/各 provider 的英文表述 → 四类标准动作）。
 */
const PERMISSION_OPTION_KIND_SYNONYMS = {
  allowOnce: new Set([`allow`, `allow once`, `approve`]),
  allowAlways: new Set([`always allow`, `allow always`, `approve always`]),
  rejectOnce: new Set([`deny`, `deny once`, `reject`, `reject once`]),
  rejectAlways: new Set([`always deny`, `deny always`, `always reject`, `reject always`]),
  custom: new Set<string>(),
};

/** 原 yxt（js 116711 / jsx 99169） */
function normalizeOptionKindText(text: string): string {
  return text.trim().replace(/\s+/g, ` `);
}

/** 原 Z1（js 116714 / jsx 99172）：kind 文本 → 四类标准动作 */
function classifyPermissionOptionKind(kind: string): "allowOnce" | "allowAlways" | "rejectOnce" | "rejectAlways" | "custom" {
  const normalized = kind.trim().toLowerCase();
  const allow = normalized.includes(`allow`) || normalized.includes(`approve`);
  const reject = normalized.includes(`reject`) || normalized.includes(`deny`);
  const always = normalized.includes(`always`);
  if (allow && always) return `allowAlways`;
  if (allow) return `allowOnce`;
  if (reject && always) return `rejectAlways`;
  if (reject) return `rejectOnce`;
  return `custom`;
}

/** 原 bxt（js 116729 / jsx 99179）：自定义选项 = 名称不在同义词表内（显示原文） */
function isCustomPermissionOption(option: { name: string; kind: string }): boolean {
  const name = normalizeOptionKindText(option.name).toLowerCase();
  if (name.length === 0) return false;
  const kind = classifyPermissionOptionKind(option.kind);
  return kind === `custom` ? true : !PERMISSION_OPTION_KIND_SYNONYMS[kind].has(name);
}

/** 原 xxt（js 116735 / jsx 99185）：排序权重 允许一次<始终允许<拒绝一次<始终拒绝<自定义 */
function permissionOptionSortRank(kind: string): number {
  switch (classifyPermissionOptionKind(kind)) {
    case `allowOnce`:
      return 0;
    case `allowAlways`:
      return 1;
    case `rejectOnce`:
      return 2;
    case `rejectAlways`:
      return 3;
    default:
      return 4;
  }
}

/** 原 Sxt（js 116749 / jsx 99199）：稳定排序（同类保持原序） */
function sortPermissionOptions(options: PermissionOption[]): PermissionOption[] {
  return options
    .map((option, index) => ({ option, index }))
    .sort((a, b) => {
      const rankDelta = permissionOptionSortRank(a.option.kind) - permissionOptionSortRank(b.option.kind);
      return rankDelta === 0 ? a.index - b.index : rankDelta;
    })
    .map(({ option }) => option);
}

/** 权限工具行图标（原 Cxt，js 116758 / jsx 99210） */
const PERMISSION_TOOL_ICON = <IconShield className="size-4 shrink-0 text-foreground-subtle" />;
const SCOPE_DISPLAY_MAX_LEN = 160; // wxt（jsx 99211）
/** 原 Txt（jsx 99212）：无信息量的通用理由（不展示） */
const GENERIC_PERMISSION_REASONS = new Set([`High risk tools require explicit approval`, `Tool has side effects and requires approval`]);

/** 原 Ext（js 116764 / jsx 99213）：bash 规则前缀截断（首行 + 160 字符） */
function truncateScopeDisplay(text: string): { display: string; truncated: boolean } {
  const newlineIndex = text.search(/\r?\n/);
  const firstLine = newlineIndex === -1 ? text : text.slice(0, newlineIndex);
  const truncated = newlineIndex !== -1 || firstLine.length > SCOPE_DISPLAY_MAX_LEN;
  return { display: `${firstLine.slice(0, SCOPE_DISPLAY_MAX_LEN - 2).trimEnd()} …`, truncated };
}

/**
 * 原 Dxt（js 116770 / jsx 99222）：从「始终允许」选项的响应里提取
 * bash 命令前缀规则（ruleContent 以 `:*` 结尾者），最多 5 条。
 */
function extractBashAllowScopes(option: PermissionOption): { display: string; truncated: boolean }[] {
  const scopes: { display: string; truncated: boolean }[] = [];
  const response = option.response as { permissionUpdates?: { type: string; behavior: string; rules: { toolName: string; ruleContent?: string }[] }[] } | undefined;
  for (const update of response?.permissionUpdates ?? []) {
    if (update.type !== `addRules` || update.behavior !== `allow`) continue;
    for (const rule of update.rules) {
      if (rule.toolName.toLowerCase() !== `bash`) continue;
      const content = rule.ruleContent?.trim();
      if (content?.endsWith(`:*`)) scopes.push(truncateScopeDisplay(content.slice(0, -2)));
    }
  }
  return scopes.slice(0, 5);
}

/** 规则前缀列表（原 Oxt，js 116781 / jsx 99231） */
function PermissionRuleScopes({ scopes }: { scopes: { display: string; truncated: boolean }[] }) {
  if (scopes.length === 0) return null;
  return (
    <span className="flex min-w-0 flex-1 basis-48 flex-col gap-1" data-permission-rule-scopes="true" data-permission-rule-prefixes="true">
      {scopes.map((scope, index) => (
        <code
          key={`${scope.display}:${index}`}
          className="min-w-0 whitespace-pre-wrap break-all font-mono text-ui-base leading-5 text-foreground-subtle"
          data-permission-rule-scope="prefix"
          data-permission-rule-scope-truncated={scope.truncated ? `true` : undefined}
        >
          {scope.display}
        </code>
      ))}
    </span>
  );
}

/** 原 kxt（js 116802 / jsx 99236）：选项主文案 i18n key */
function permissionOptionLabelId(kind: string): string | null {
  switch (classifyPermissionOptionKind(kind)) {
    case `allowOnce`:
      return `chat.permission.approve`;
    case `allowAlways`:
      return `chat.permission.approveAlways`;
    case `rejectOnce`:
      return `chat.permission.deny`;
    case `rejectAlways`:
      return `chat.permission.denyAlways`;
    default:
      return null;
  }
}

/** 原 Axt/jxt（js 116816 / jsx 99250）：供应商特有选项文案（codex/glm） */
const PROVIDER_PERMISSION_LABELS: Record<string, Record<string, string>> = {
  codex: {
    "allow for session": `chat.permission.allowForSession`,
    "allow for this session": `chat.permission.allowForSession`,
  },
  glm: {
    "always allow in this project": `chat.permission.allowForProject`,
  },
};
const COMMON_PERMISSION_LABELS: Record<string, string> = {
  "always allow in this project": `chat.permission.allowForProject`,
};
/** 原 Mxt（js 116824 / jsx 99262） */
function resolveProviderPermissionLabel(provider: string | undefined, name: string): string | null {
  const normalized = name.trim().replace(/\s+/g, ` `).toLowerCase();
  return COMMON_PERMISSION_LABELS[normalized] ?? (provider ? PROVIDER_PERMISSION_LABELS[provider]?.[normalized] ?? null : null);
}

/** 原 Nxt（js 116828 / jsx 99266）：选项说明 i18n key（按动作×作用域） */
function permissionOptionDescriptionId(kind: string, scope: string): string | null {
  switch (classifyPermissionOptionKind(kind)) {
    case `allowOnce`:
      return `chat.permission.allowOnce.description`;
    case `allowAlways`:
      return `chat.permission.allowAlways.description.${scope}`;
    case `rejectOnce`:
      return `chat.permission.denyOnce.description`;
    case `rejectAlways`:
      return `chat.permission.denyAlways.description.${scope}`;
    default:
      return null;
  }
}

/** 原 Q1（js 116842 / jsx 99280） */
function trimToNull(value: unknown): string | null {
  return typeof value == `string` && value.trim().length > 0 ? value.trim() : null;
}
/** 原 $1（jsx 99283）：通用理由不展示 */
function visibleReasonText(value: string | null): string | null {
  const trimmed = trimToNull(value);
  return trimmed && !GENERIC_PERMISSION_REASONS.has(trimmed) ? trimmed : null;
}

/**
 * 原 Pxt（js 116849 / jsx 99287）：请求级理由提取
 *（raw 解析后的 description/reason/summary 逐级兜底）。
 */
function resolvePermissionRequestReason(request: PermissionRequest): string | null {
  const parsedRaw = parseToolCallRaw(request.raw);
  const fromParsed = parsedRaw && isPlainRecord(parsedRaw) ? visibleReasonText(trimToNull(parsedRaw.description)) ?? visibleReasonText(trimToNull(parsedRaw.reason)) ?? visibleReasonText(trimToNull(parsedRaw.summary)) : null;
  const fromRaw = isPlainRecord(request.raw) ? visibleReasonText(trimToNull((request.raw as Record<string, unknown>).reason)) : null;
  return fromParsed ?? visibleReasonText(trimToNull(request.description)) ?? fromRaw;
}

/** 原 Fxt（js 116855 / jsx 99293）：mcp__ 前缀工具名 */
function resolveMcpToolName(request: PermissionRequest): string | null {
  const fromRaw = isPlainRecord(request.raw) ? trimToNull((request.raw as Record<string, unknown>).toolName) ?? trimToNull((request.raw as Record<string, unknown>).tool_name) : null;
  const name = trimToNull(request.toolName) ?? fromRaw ?? trimToNull(request.kind) ?? trimToNull(request.title);
  return name?.startsWith(`mcp__`) ? name : null;
}
/** 原 Ixt（js 116860 / jsx 99298） */
function resolveRawReason(request: PermissionRequest): string | null {
  return isPlainRecord(request.raw) ? trimToNull((request.raw as Record<string, unknown>).reason) : null;
}

/** 原 Lxt（js 116863 / jsx 99301）：审批卡内工具预览的视图类型 */
function classifyPermissionToolView(
  model: { command?: string; fileChanges: unknown[] },
  toolCall: ToolCall,
  fileSummaries: FileSummary[],
): "edit" | "mcp" | "skill" | "search" | "execute" | "fallback" {
  if (fileSummaries.length > 0 || model.fileChanges.length > 0) return `edit`;
  const identity = classifyToolCall(toolCall);
  if (resolveMcpToolName({ raw: toolCall.raw } as PermissionRequest)) return `mcp`;
  if (identity.family === `skill`) return `skill`;
  if (identity.family === `search`) return `search`;
  if (model.command) return `execute`;
  return `fallback`;
}
/** 原 Rxt（js 116876 / jsx 99306）：edit 可折叠默认收起；其余强制展开 */
function permissionToolViewToggle(viewKind: "edit" | "mcp" | "skill" | "search" | "execute" | "fallback"): { canToggle: boolean; forceOpen: boolean } {
  switch (viewKind) {
    case `edit`:
      return { canToggle: false, forceOpen: false };
    case `mcp`:
    case `skill`:
    case `search`:
    case `execute`:
    case `fallback`:
      return { canToggle: false, forceOpen: true };
  }
}

/** 原 zxt（js 116888 / jsx 99324）：审批请求 → 伪工具调用（供工具视图渲染） */
function toPermissionToolCall(request: PermissionRequest, model: { title?: string; command?: string }): ToolCall {
  const parsedRaw = parseToolCallRaw(request.raw);
  return {
    toolId: `permission:${request.requestId}`,
    kind: request.kind,
    title: request.title ?? request.description ?? model.title,
    input: parsedRaw ?? model.command ?? request.raw,
    status: `completed`,
    raw: request.raw,
  } as ToolCall; // bundle zxt 116939：伪工具调用无 toolName（canonical ToolCall 必填，断言收敛）
}

/** 原 Bxt（js 116899 / jsx 99335）：组装工具视图 props（关闭交互入口） */
function buildPermissionToolViewProps(
  toolCall: ToolCall,
  fileSummaries: FileSummary[],
  workspacePath: string | undefined,
  viewKind: "edit" | "mcp" | "skill" | "search" | "execute" | "fallback",
  kindLabel: string,
  theme: string,
  codePreviewSettings: unknown,
): ToolCallViewProps {
  const { canToggle, forceOpen } = permissionToolViewToggle(viewKind);
  return {
    toolCallNode: { toolCall, childToolCalls: [] },
    workspacePath,
    theme,
    codePreviewSettings: codePreviewSettings as CodePreviewSettings,
    displayModel: {
      inlinePreview: { type: `none` },
      planResult: null,
      viewerSource: null,
      viewerLabelId: `codeViewer.viewCode`,
      showSummaryFileLink: false,
      showInput: false,
      showOutput: false,
      showKind: false,
    },
    viewerSource: null,
    rawFileSummaries: fileSummaries,
    isRunning: false,
    statusLabel: ``,
    childToolList: null,
    showIcon: true,
    kindLabelOverride: kindLabel,
    canToggle,
    forceOpen,
    onOpenCodeViewer: undefined,
    onOpenBrowserUrl: undefined,
  };
}

/**
 * MCP 工具审批行（原 Vxt，js 116929 / jsx 99373）：
 * mcp__ 工具只显示名称/理由的紧凑行（不可展开）。
 */
function McpPermissionRow(props: ToolCallViewProps) {
  const { toolCall } = props.toolCallNode;
  const mcpName = resolveMcpToolName({ raw: toolCall.raw } as PermissionRequest) ?? toolCall.title ?? toolCall.kind;
  const rawReason = resolveRawReason({ raw: toolCall.raw } as PermissionRequest);
  const hasKindOverride = props.kindLabelOverride != null;
  const primaryText = React.useMemo(
    () =>
      hasKindOverride ? (
        <span className="min-w-0 truncate text-foreground-subtle">{mcpName}</span>
      ) : rawReason ? (
        <span className="min-w-0 truncate text-foreground-subtle">{rawReason}</span>
      ) : null,
    [hasKindOverride, rawReason, mcpName],
  );
  return (
    <ToolLayout
      toolId={toolCall.toolId}
      icon={PERMISSION_TOOL_ICON}
      showIcon={props.showIcon !== false}
      canToggle={false}
      kindLabel={props.kindLabelOverride ?? mcpName}
      primaryText={primaryText}
      isRunning={props.isRunning}
      content={null}
    />
  );
}

/** 交互来源徽章（原 nxt，js 115916 / jsx 98675）：子代理发起时显示徽章 */
function InteractionOriginBadge({ className, origin }: { className?: string; origin: InteractionOrigin }) {
  const { intl } = useIntlContext();
  if (origin?.kind !== `subagent`) return null;
  const label = intl.formatMessage({ id: `chat.interactionOrigin.subagent` });
  return (
    <Badge
      variant={`outline`}
      title={origin.agentType ? intl.formatMessage({ id: `chat.interactionOrigin.subagent.title` }, { agentType: origin.agentType }) : label}
      data-interaction-origin-badge={`subagent`}
      className={cn(`max-w-40 align-baseline text-ui-base truncate`, className)}
    >
      {label}
    </Badge>
  );
}

/** 原 Vte（src-HCld2afU.js 的 l 导出）：审批请求 → 视图模型（标题/命令/文件变更/作用域） */

/** 原 Xpt（js 106604 / jsx 91469）：切换权限模式的请求（转圈占位文案） */
declare function isSwitchModePermissionRequest(request: PermissionRequest): boolean;
/** 原 Hpt（js 106405 / jsx 91360）：切模式提示（按平台快捷键） */
declare const SwitchModeHint: React.FC<{ platform: unknown }>;

/**
 * 审批内联覆盖层（原 Hxt，js 116960 / jsx 99392）。
 * 结构：`标题行（chat.permission.title + 来源徽章）→ 理由 → 待审批工具预览
 * （复用工具视图族）→ 选项列表（1/2/3 数字热键 + 方向键/Tab 导航 + Enter 确认）
 * → 键盘提示 + 确认按钮`。
 * 选项文案：标准四类走 i18n；供应商特有文案（codex/glm）映射；自定义选项显示原文；
 * 「始终允许 bash」选项附命令前缀规则列表。
 */
function PermissionApprovalOverlay({
  request,
  onRespond,
  workspacePath,
  provider,
  platform,
}: {
  request: PermissionRequest;
  onRespond: (requestId: string, option: PermissionOption) => void;
  workspacePath?: string;
  provider?: string;
  platform?: unknown;
}) {
  const { intl } = useIntlContext();
  const theme = useSettingsSelector((settings) => settings.theme, `system`);
  const codePreviewSettings = useSettingsSelector((settings) => settings.codePreviewSettings, null);
  const sortedOptions = React.useMemo(() => sortPermissionOptions(request.options), [request.options]);
  const model = React.useMemo(() => buildPermissionRequestViewModel(request), [request]);
  const toolCall = React.useMemo(() => toPermissionToolCall(request, model), [model, request]);
  const fileSummaries = React.useMemo(
    () => extractRawFileSummaries(toolCall.raw, { ...toolCall }),
    [toolCall],
  );
  const viewKind = React.useMemo(() => classifyPermissionToolView(model, toolCall, fileSummaries), [model, fileSummaries, toolCall]);
  const viewProps = React.useMemo(
    () =>
      buildPermissionToolViewProps(
        toolCall,
        fileSummaries,
        workspacePath,
        viewKind,
        intl.formatMessage({ id: `chat.permission.awaitingApproval` }),
        theme,
        codePreviewSettings,
      ),
    [viewKind, codePreviewSettings, intl, fileSummaries, theme, toolCall, workspacePath],
  );
  const reason = React.useMemo(() => resolvePermissionRequestReason(request), [request]);
  const [focusedIndex, setFocusedIndex] = React.useState(0);
  const optionRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  React.useEffect(() => {
    setFocusedIndex(0);
  }, [request.requestId]);
  React.useEffect(() => {
    if (sortedOptions.length === 0) return;
    const frame = requestAnimationFrame(() => {
      optionRefs.current[focusedIndex]?.focus();
    });
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [sortedOptions.length, request.requestId, focusedIndex]);
  const moveFocus = React.useCallback(
    (delta: number) => {
      if (sortedOptions.length === 0) return;
      setFocusedIndex((previous) => (previous + delta + sortedOptions.length) % sortedOptions.length);
    },
    [sortedOptions.length],
  );
  const confirmFocused = React.useCallback(() => {
    const option = sortedOptions[focusedIndex];
    if (option) onRespond(request.requestId, option);
  }, [onRespond, sortedOptions, focusedIndex, request.requestId]);
  const handleOptionKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === `1` || event.key === `2` || event.key === `3`) {
        const option = sortedOptions[Number(event.key) - 1];
        if (!option) return;
        event.preventDefault();
        setFocusedIndex(Number(event.key) - 1);
        onRespond(request.requestId, option);
        return;
      }
      switch (event.key) {
        case `ArrowUp`:
        case `ArrowLeft`:
          event.preventDefault();
          moveFocus(-1);
          return;
        case `ArrowDown`:
        case `ArrowRight`:
          event.preventDefault();
          moveFocus(1);
          return;
        case `Tab`:
          event.preventDefault();
          moveFocus(event.shiftKey ? -1 : 1);
          return;
        case `Enter`:
          event.preventDefault();
          confirmFocused();
          return;
        default:
          return;
      }
    },
    [confirmFocused, moveFocus, onRespond, request.requestId, sortedOptions],
  );
  const ToolView =
    viewKind === `edit` ? FileWriteToolView : viewKind === `mcp` ? McpPermissionRow : viewKind === `skill` ? SkillToolView : viewKind === `search` ? SearchToolView : viewKind === `execute` ? ShellToolView : FallbackToolView;
  const isSwitchMode = classifyToolCall(toolCall).family === `switch-mode`;
  const showSwitchModeHint = React.useMemo(() => isSwitchModePermissionRequest(request), [request]);
  return (
    <div className="w-full shrink-0 relative z-1">
      <div className="w-full overflow-hidden rounded-2xl border border-border bg-popover shadow-xs">
        <div className="flex flex-col gap-3 p-3">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-ui-base font-medium leading-tight text-foreground-subtle">{intl.formatMessage({ id: `chat.permission.title` })}</p>
              <InteractionOriginBadge origin={request.origin} />
            </div>
            {!isSwitchMode && reason ? <p className="text-ui-base leading-5 text-foreground">{reason}</p> : null}
            {isSwitchMode ? (
              <div className="flex items-center gap-2 text-ui-base text-foreground">
                <IconLoader className={`size-4 shrink-0 animate-spin text-foreground-subtle`} />
                <span className="animated-gradient-text font-medium">{intl.formatMessage({ id: `chat.permission.switchMode.placeholder` })}</span>
              </div>
            ) : (
              <ToolView {...viewProps} />
            )}
            {showSwitchModeHint ? <SwitchModeHint platform={platform} /> : null}
          </div>
          <div role="listbox" aria-label={intl.formatMessage({ id: `chat.permission.title` })} className="space-y-1">
            {sortedOptions.map((option, index) => {
              const isFocused = index === focusedIndex;
              const labelKey = permissionOptionLabelId(option.kind);
              const providerLabelKey = resolveProviderPermissionLabel(provider, option.name);
              const descriptionKey = permissionOptionDescriptionId(option.kind, model.scope);
              const standardLabel = labelKey ? intl.formatMessage({ id: labelKey }) : null;
              const providerLabel = providerLabelKey ? intl.formatMessage({ id: providerLabelKey }) : null;
              const isCustom = isCustomPermissionOption(option);
              const displayLabel = providerLabel ?? (isCustom ? option.name : standardLabel ?? option.name);
              const description = isCustom && !providerLabel || !descriptionKey ? null : intl.formatMessage({ id: descriptionKey });
              const scopes = classifyPermissionOptionKind(option.kind) === `allowAlways` ? extractBashAllowScopes(option) : [];
              return (
                <button
                  key={option.optionId}
                  data-permission-option-kind={classifyPermissionOptionKind(option.kind)}
                  ref={(element) => {
                    optionRefs.current[index] = element;
                  }}
                  type="button"
                  role="option"
                  aria-selected={isFocused}
                  tabIndex={isFocused ? 0 : -1}
                  onClick={() => {
                    if (isFocused) {
                      onRespond(request.requestId, option);
                    } else {
                      setFocusedIndex(index);
                    }
                  }}
                  onFocus={() => setFocusedIndex(index)}
                  onKeyDown={handleOptionKeyDown}
                  className={cn(`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left outline-none transition-colors focus-visible:bg-selected`, isFocused ? `bg-selected` : `hover:bg-hover`)}
                >
                  <span className={cn(`w-5 shrink-0 text-ui-base font-medium self-center`, isFocused ? `text-foreground` : `text-foreground-subtlest`)}>
                    {index + 1}
                    {`.`}
                  </span>
                  <span className="min-w-0 flex flex-1 flex-col">
                    <span className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="text-ui-base font-medium text-foreground">{displayLabel}</span>
                      {scopes.length > 0 ? (
                        <PermissionRuleScopes scopes={scopes} />
                      ) : description ? (
                        <span className="text-ui-base leading-4 text-foreground-subtle">{description}</span>
                      ) : null}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-between gap-2 px-1">
            <p className="flex gap-2 text-ui-base items-center text-foreground-subtle">
              <IconInfo className={`text-foreground size-4 shrink-0`} />
              {intl.formatMessage({ id: `chat.permission.keyboardHint` })}
            </p>
            <Button type="button" size="lg" onClick={confirmFocused} disabled={sortedOptions[focusedIndex] === undefined} className="bg-brand text-foreground-inverse hover:bg-brand/80">
              {intl.formatMessage({ id: `common.confirm` })}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * 2. Elicitation 子族（问题内联覆盖层；chat.elicitation.*）
 * ==========================================================================*/

const AUTO_RESOLUTION_TICK_MS = 6e4; // q1（js 115930 / jsx 98698）
const PLAN_APPROVAL_OPTION_VALUE = `approve`; // J1（js 115931 / jsx 98699）

/** 原 rxt（js 115932 / jsx 98700）：剩余倒计时秒数（snoozed/过期 → null） */
declare function resolveAutoResolutionCountdown(
  autoResolution: PendingInteraction["autoResolution"],
  nowMs: number,
): number | null;
/** 原 ixt（js 115937 / jsx 98705）：下次心跳延迟 */
declare function nextAutoResolutionTickDelay(autoResolution: NonNullable<PendingInteraction["autoResolution"]>, nowMs: number): number | null;

/**
 * 自动结束倒计时钩子（原 axt，js 115945 / jsx 98713）。
 * 页面隐藏时暂停计时（visibilitychange/focus 恢复）。
 */
function useAutoResolutionCountdown(autoResolution: PendingInteraction["autoResolution"]): number | null {
  const [nowMs, setNowMs] = React.useState(Date.now);
  React.useEffect(() => {
    if (!autoResolution || autoResolution.state === `snoozed`) return;
    let timer: number | undefined;
    const tick = () => {
      if (timer !== undefined) window.clearTimeout(timer);
      const current = Date.now();
      setNowMs(current);
      if (document.visibilityState === `hidden`) return;
      const delay = nextAutoResolutionTickDelay(autoResolution, current);
      if (delay !== null) timer = window.setTimeout(tick, delay);
    };
    tick();
    window.addEventListener(`focus`, tick);
    document.addEventListener(`visibilitychange`, tick);
    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
      window.removeEventListener(`focus`, tick);
      document.removeEventListener(`visibilitychange`, tick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoResolution?.state, autoResolution?.startedAt, autoResolution?.state === `snoozed` ? autoResolution.snoozedAt : autoResolution?.deadlineAt]);
  return resolveAutoResolutionCountdown(autoResolution, nowMs);
}

/**
 * 原 oxt（js 115972 / jsx 98730）：输入框键盘映射。
 * Enter：Ctrl/Meta 或 plan 审批或末题 → 提交；否则下一题。
 * Escape：非审批且有上一题 → 上一题；否则关闭。
 * （IME 组词期间全部忽略。）
 */
function mapElicitationKeyDown(args: {
  key: string;
  advanceKind: "next" | "submit";
  ctrlKey: boolean;
  metaKey: boolean;
  compositionActive: boolean;
  nativeEvent: Event;
  isPlanApproval: boolean;
  hasPreviousQuestion: boolean;
}): "advance" | "submit" | "previous" | "dismiss" | null {
  if (isImeComposing(args as unknown as React.KeyboardEvent)) return null;
  if (args.key === `Enter`) {
    return args.ctrlKey || args.metaKey || args.isPlanApproval || args.advanceKind === `submit` ? `submit` : `advance`;
  }
  if (args.key === `Escape`) {
    return !args.isPlanApproval && args.hasPreviousQuestion ? `previous` : `dismiss`;
  }
  return null;
}

/** 原 sxt（js 115985 / jsx 98733）：请求 → 规范问题列表（无 questions 时用顶层字段包一题） */
function normalizeElicitationQuestions(request: ElicitationRequest): ElicitationQuestion[] {
  return (
    request.questions && request.questions.length > 0
      ? request.questions
      : [
          {
            question: request.message,
            header: request.header ?? request.message,
            options: request.options,
            ...(request.multiSelect ? { multiSelect: true } : {}),
          },
        ]
  ).map((question, index) => ({
    key: `${index}:${question.question}`,
    question: question.question,
    header: question.header,
    options: question.options.map((option) => ({ value: option.value, label: option.label || option.value, description: option.description })),
    ...(question.multiSelect ? { multiSelect: true } : {}),
  }));
}

function isPlainObjectValue(value: unknown): value is Record<string, unknown> {
  return typeof value == `object` && !!value && !Array.isArray(value);
}
/** 原 lxt（js 116012 / jsx 98758）：plan 审批 = schema.interaction=plan_approval 且工具为 ExitPlanMode */
function isPlanApprovalRequest(request: ElicitationRequest): boolean {
  const schema = request.schema;
  return isPlainObjectValue(schema) && schema.interaction === `plan_approval` && schema.toolName === `ExitPlanMode`;
}

type AnswerDraft = { selectedValues: string[]; customAnswer: string };
type AnswerDraftMap = Record<string, AnswerDraft>;

/** 原 uxt（js 116016 / jsx 98762）：服务端草稿 → 本地草稿（未知选项值落入自定义答案） */
function buildInitialAnswerDrafts(questions: ElicitationQuestion[], request: ElicitationRequest): AnswerDraftMap {
  return Object.fromEntries(
    questions.map((question, index) => {
      const raw = request.answerDrafts?.[`answer_${index}`] ?? request.answerDrafts?.[String(index)] ?? [];
      const validValues = new Set(question.options.map((option) => option.value));
      const selected = raw.filter((value) => validValues.has(value));
      const custom = raw.filter((value) => !validValues.has(value)).join(`, `);
      return [question.key, { selectedValues: selected, customAnswer: custom }];
    }),
  );
}
/** 原 dxt（js 116027 / jsx 98774）：初始题号（服务端 currentQuestionIndex 钳位） */
function resolveInitialQuestionIndex(request: ElicitationRequest, questions: ElicitationQuestion[]): number {
  if (questions.length === 0) return 0;
  const index = request.currentQuestionIndex;
  return typeof index != `number` || !Number.isInteger(index) ? 0 : Math.max(0, Math.min(index, questions.length - 1));
}
/** 原 fxt（js 116032 / jsx 98779）：焦点槽位 = 选项数 + 自定义输入 */
function optionFocusSlotCount(question: ElicitationQuestion | undefined): number {
  return question ? question.options.length + 1 : 0;
}
/** 原 pxt（js 116035 / jsx 98782）：按草稿恢复焦点槽位 */
function focusIndexForQuestion(question: ElicitationQuestion | undefined, drafts: AnswerDraftMap): number {
  if (!question) return 0;
  const draft = drafts[question.key];
  const firstSelected = draft?.selectedValues[0];
  if (firstSelected) {
    const index = question.options.findIndex((option) => option.value === firstSelected);
    if (index >= 0) return index;
  }
  return draft?.customAnswer.trim() ? question.options.length : -1;
}
/** 原 Y1（js 116045 / jsx 98792）：题目草稿 → 答案数组（选中值 + 自定义文本） */
function collectQuestionAnswers(question: ElicitationQuestion, drafts: AnswerDraftMap): string[] {
  const draft = drafts[question.key] ?? { selectedValues: [], customAnswer: `` };
  const custom = draft.customAnswer.trim();
  return [...draft.selectedValues, ...(custom ? [custom] : [])];
}
/** 原 mxt（js 116050 / jsx 98800）：提交载荷（answers 映射 + answer_N + 单题时的 answer） */
function buildElicitationAnswerPayload(questions: ElicitationQuestion[], drafts: AnswerDraftMap): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    answers: Object.fromEntries(
      questions.flatMap((question) => {
        const values = collectQuestionAnswers(question, drafts);
        return values.length > 0 ? [[question.question, values.join(`, `)]] : [];
      }),
    ),
  };
  questions.forEach((question, index) => {
    const values = collectQuestionAnswers(question, drafts);
    if (values.length > 0) payload[`answer_${index}`] = question.multiSelect ? values : values[0];
  });
  const single = questions.length === 1 ? questions[0] : undefined;
  if (single) {
    const values = collectQuestionAnswers(single, drafts);
    if (values.length > 0) payload.answer = single.multiSelect ? values : values[0];
  }
  return payload;
}
/** 原 hxt（js 116070 / jsx 98818）：单选覆盖 / 多选切换 */
function applyAnswerSelection(drafts: AnswerDraftMap, question: ElicitationQuestion, value: string): AnswerDraftMap {
  const current = drafts[question.key] ?? { selectedValues: [], customAnswer: `` };
  const next = question.multiSelect
    ? {
        ...current,
        selectedValues: current.selectedValues.includes(value) ? current.selectedValues.filter((existing) => existing !== value) : [...current.selectedValues, value],
      }
    : { selectedValues: [value], customAnswer: `` };
  return { ...drafts, [question.key]: next };
}
/** 原 X1（js 116082 / jsx 98835）：末题 → submit，否则 next */
function advanceKindForQuestion(questions: ElicitationQuestion[], questionIndex: number): "next" | "submit" {
  return questionIndex >= questions.length - 1 ? `submit` : `next`;
}

/** 原 gxt（js 116085 / jsx 98838）：按 requestId 强制重挂载对话框 */
function ElicitationDialogKeyed(props: React.ComponentProps<typeof ElicitationDialog>) {
  return <ElicitationDialog key={props.request.requestId} {...props} />;
}

/**
 * 问题内联覆盖层（原 _xt，js 116088 / jsx 98841）。
 * 多题问卷卡片：题头（来源徽章 + 标题徽章 + 问题文本，移动端可折叠）、
 * 计数与导航（上一题/下一题/收起对话框/倒计时暂停）、选项列表
 * （单选=序号+选中背景；多选=复选框；末位自定义输入行）、
 * 页脚（键盘提示 + 关闭 + 继续/提交）。
 * 键盘：方向键/Tab 循环焦点，空格/回车选择，回车推进/提交，Esc 回退/关闭；
 * 输入框内 Ctrl/Cmd+Enter 提交。plan 审批模式下标题/问题文案换成
 * chat.permission.title / switchMode.placeholder，approve 选项文案本地化。
 * 草稿经 onFormDraftChange 持久化（任务 store 按 工作区×会话×请求 存储）。
 */
function ElicitationDialog({
  request,
  autoResolution,
  onRespond,
  onFirstInteraction,
  initialFormDraft,
  onFormDraftChange,
}: {
  request: ElicitationRequest;
  autoResolution?: PendingInteraction["autoResolution"];
  onRespond: (requestId: string, action: "accept" | "decline", answers?: Record<string, unknown>) => void;
  onFirstInteraction?: (kind: "answer" | "navigation" | "countdown" | "panelHover") => Promise<boolean> | boolean;
  initialFormDraft?: { questionIndex: number; drafts: AnswerDraftMap };
  onFormDraftChange?: (requestId: string, draft: { questionIndex: number; drafts: AnswerDraftMap }) => void;
}) {
  const { intl } = useIntlContext();
  const questions = React.useMemo(() => normalizeElicitationQuestions(request), [request]);
  const [questionIndex, setQuestionIndex] = React.useState(() => initialFormDraft?.questionIndex ?? resolveInitialQuestionIndex(request, questions));
  const isPlanApproval = isPlanApprovalRequest(request);
  const [focusSlot, setFocusSlot] = React.useState(() => (isPlanApproval ? 0 : -1));
  const [drafts, setDrafts] = React.useState<AnswerDraftMap>(() => initialFormDraft?.drafts ?? buildInitialAnswerDrafts(questions, request));
  const [questionCollapsed, setQuestionCollapsed] = React.useState(false);
  const [dialogExpanded, setDialogExpanded] = React.useState(true);
  const optionElementRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const customInputRef = React.useRef<HTMLInputElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const compositionActive = React.useRef(false);
  const firstInteractionSent = React.useRef(false);
  const countdownSeconds = useAutoResolutionCountdown(autoResolution);
  React.useEffect(() => {
    onFormDraftChange?.(request.requestId, { questionIndex, drafts });
  }, [drafts, onFormDraftChange, questionIndex, request.requestId]);
  const notifyInteraction = React.useCallback(
    (kind: "answer" | "navigation" | "countdown" | "panelHover") => {
      if (firstInteractionSent.current) return;
      firstInteractionSent.current = true;
      let result: Promise<boolean> | boolean | undefined;
      try {
        result = onFirstInteraction?.(kind);
      } catch {
        firstInteractionSent.current = false;
        return;
      }
      Promise.resolve(result)
        .then((accepted) => {
          if (accepted === false) firstInteractionSent.current = false;
        })
        .catch(() => {
          firstInteractionSent.current = false;
        });
    },
    [onFirstInteraction],
  );
  React.useEffect(() => {
    setQuestionCollapsed(false);
  }, [questionIndex]);
  const currentQuestion = questions[questionIndex];
  const currentDraft = currentQuestion ? drafts[currentQuestion.key] ?? { selectedValues: [], customAnswer: `` } : undefined;
  React.useEffect(() => {
    if (optionFocusSlotCount(currentQuestion) === 0 || focusSlot < 0) return;
    const frame = requestAnimationFrame(() => {
      if (focusSlot < (currentQuestion?.options.length ?? 0)) {
        optionElementRefs.current[focusSlot]?.focus();
        return;
      }
      customInputRef.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [focusSlot, currentQuestion]);
  React.useEffect(() => {
    if (focusSlot < 0) {
      const frame = requestAnimationFrame(() => {
        containerRef.current?.focus();
      });
      return () => cancelAnimationFrame(frame);
    }
    return undefined;
  }, [focusSlot]);
  const updateDraft = React.useCallback((question: ElicitationQuestion, updater: (draft: AnswerDraft) => AnswerDraft) => {
    setDrafts((previous) => ({
      ...previous,
      [question.key]: updater(previous[question.key] ?? { selectedValues: [], customAnswer: `` }),
    }));
  }, []);
  const handleCustomAnswerChange = React.useCallback(
    (question: ElicitationQuestion, value: string) => {
      notifyInteraction(`answer`);
      updateDraft(question, (draft) => ({
        selectedValues: question.multiSelect ? draft.selectedValues : [],
        customAnswer: value,
      }));
    },
    [notifyInteraction, updateDraft],
  );
  const submitAnswers = React.useCallback(
    (answerDrafts: AnswerDraftMap) => {
      const payload = buildElicitationAnswerPayload(questions, answerDrafts);
      onRespond(request.requestId, `accept`, payload);
    },
    [onRespond, questions, request.requestId],
  );
  const advance = React.useCallback(
    (answerDrafts: AnswerDraftMap) => {
      if (advanceKindForQuestion(questions, questionIndex) === `submit`) {
        submitAnswers(answerDrafts);
        return;
      }
      const nextIndex = questionIndex + 1;
      setQuestionIndex(nextIndex);
      const restoredFocus = focusIndexForQuestion(questions[nextIndex], answerDrafts);
      setFocusSlot(isPlanApproval && restoredFocus < 0 ? 0 : restoredFocus);
    },
    [questionIndex, questions, submitAnswers, isPlanApproval],
  );
  const selectOption = React.useCallback(
    (question: ElicitationQuestion, value: string) => {
      notifyInteraction(`answer`);
      const nextDrafts = applyAnswerSelection(drafts, question, value);
      setDrafts(nextDrafts);
      if (!question.multiSelect) advance(nextDrafts);
    },
    [advance, drafts, notifyInteraction],
  );
  const effectiveDraftForAdvance = React.useCallback(() => {
    if (!currentQuestion || currentQuestion.multiSelect || focusSlot < 0) return drafts;
    const draft = drafts[currentQuestion.key];
    if ((draft?.selectedValues.length ?? 0) > 0 || (draft?.customAnswer.trim().length ?? 0) > 0) return drafts;
    const focusedOption = currentQuestion.options[focusSlot];
    return focusedOption ? applyAnswerSelection(drafts, currentQuestion, focusedOption.value) : drafts;
  }, [focusSlot, currentQuestion, drafts]);
  const goPrevious = React.useCallback(() => {
    notifyInteraction(`navigation`);
    const previousIndex = Math.max(questionIndex - 1, 0);
    setQuestionIndex(previousIndex);
    const restoredFocus = focusIndexForQuestion(questions[previousIndex], drafts);
    setFocusSlot(isPlanApproval && restoredFocus < 0 ? 0 : restoredFocus);
  }, [drafts, questionIndex, questions, notifyInteraction, isPlanApproval]);
  const submitAll = React.useCallback(() => {
    notifyInteraction(`answer`);
    submitAnswers(drafts);
  }, [drafts, notifyInteraction, submitAnswers]);
  const decline = React.useCallback(() => {
    notifyInteraction(`answer`);
    onRespond(request.requestId, `decline`);
  }, [onRespond, notifyInteraction, request.requestId]);
  const handlePreviousButton = React.useCallback(() => {
    if (questions.length !== 0) goPrevious();
  }, [goPrevious, questions.length]);
  const handleNextButton = React.useCallback(() => {
    if (questions.length === 0 || questionIndex >= questions.length - 1) return;
    notifyInteraction(`navigation`);
    const effective = effectiveDraftForAdvance();
    if (effective !== drafts) setDrafts(effective);
    advance(effective);
  }, [advance, drafts, effectiveDraftForAdvance, questionIndex, questions.length, notifyInteraction]);
  const handlePrimaryAdvance = React.useCallback(() => {
    if (isPlanApproval && currentQuestion && collectQuestionAnswers(currentQuestion, drafts).length === 0) {
      const approveOption = currentQuestion.options.find((option) => option.value === PLAN_APPROVAL_OPTION_VALUE);
      if (approveOption) {
        selectOption(currentQuestion, approveOption.value);
        return;
      }
    }
    notifyInteraction(`navigation`);
    const effective = effectiveDraftForAdvance();
    if (effective !== drafts) setDrafts(effective);
    advance(effective);
  }, [advance, currentQuestion, drafts, effectiveDraftForAdvance, isPlanApproval, notifyInteraction, selectOption]);
  const cycleFocus = React.useCallback(
    (delta: number) => {
      const slotCount = optionFocusSlotCount(currentQuestion);
      if (slotCount === 0) return;
      notifyInteraction(`navigation`);
      setFocusSlot((previous) => (previous < 0 ? (delta > 0 ? 0 : slotCount - 1) : (previous + delta + slotCount) % slotCount));
    },
    [currentQuestion, notifyInteraction],
  );
  const handleOptionKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (!currentQuestion) return;
      switch (event.key) {
        case `ArrowUp`:
        case `ArrowLeft`:
          event.preventDefault();
          cycleFocus(-1);
          return;
        case `ArrowDown`:
        case `ArrowRight`:
        case `Tab`:
          event.preventDefault();
          cycleFocus(event.shiftKey ? -1 : 1);
          return;
        case ` `:
          event.preventDefault();
          if (focusSlot < 0) return;
          if (focusSlot < currentQuestion.options.length) {
            const option = currentQuestion.options[focusSlot];
            if (option) selectOption(currentQuestion, option.value);
          } else {
            customInputRef.current?.focus();
          }
          return;
        case `Enter`:
          event.preventDefault();
          if (focusSlot < 0) return;
          if (currentQuestion.multiSelect) {
            handlePrimaryAdvance();
          } else if (focusSlot < currentQuestion.options.length) {
            const option = currentQuestion.options[focusSlot];
            if (option) selectOption(currentQuestion, option.value);
          } else {
            customInputRef.current?.focus();
          }
          return;
        case `Escape`:
          event.preventDefault();
          if (!isPlanApproval && questionIndex > 0) {
            goPrevious();
            return;
          }
          decline();
          return;
        default:
          return;
      }
    },
    [focusSlot, handlePrimaryAdvance, currentQuestion, decline, goPrevious, isPlanApproval, cycleFocus, questionIndex, selectOption],
  );
  const handleCustomInputKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      event.stopPropagation();
      const action = mapElicitationKeyDown({
        key: event.key,
        advanceKind: advanceKindForQuestion(questions, questionIndex),
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        compositionActive: compositionActive.current,
        nativeEvent: event.nativeEvent,
        isPlanApproval,
        hasPreviousQuestion: questionIndex > 0,
      });
      if (action) notifyInteraction(`navigation`);
      if (action === `advance`) {
        event.preventDefault();
        if (advanceKindForQuestion(questions, questionIndex) === `next`) advance(drafts);
        return;
      }
      if (action === `submit`) {
        event.preventDefault();
        submitAll();
        return;
      }
      if (action === `previous`) {
        event.preventDefault();
        goPrevious();
        return;
      }
      if (action === `dismiss`) {
        event.preventDefault();
        decline();
      }
    },
    [advance, decline, drafts, goPrevious, isPlanApproval, questionIndex, questions, notifyInteraction, submitAll],
  );
  const renderOption = (question: ElicitationQuestion, option: { value: string; label: string; description?: string }, index: number) => {
    const selected = currentDraft?.selectedValues.includes(option.value) === true;
    const focused = focusSlot >= 0 && focusSlot === index;
    const label = isPlanApproval && option.value === PLAN_APPROVAL_OPTION_VALUE ? intl.formatMessage({ id: `chat.elicitation.planApproval.approve` }) : option.label;
    const description =
      isPlanApproval && option.value === PLAN_APPROVAL_OPTION_VALUE ? intl.formatMessage({ id: `chat.elicitation.planApproval.approveDescription` }) : option.description;
    return (
      <button
        key={option.value}
        ref={(element) => {
          optionElementRefs.current[index] = element;
        }}
        type="button"
        role={question.multiSelect ? `checkbox` : `option`}
        aria-selected={question.multiSelect ? undefined : selected}
        aria-checked={question.multiSelect ? selected : undefined}
        tabIndex={focused || (focusSlot < 0 && index === 0) ? 0 : -1}
        onClick={() => selectOption(question, option.value)}
        onFocus={() => setFocusSlot(index)}
        onKeyDown={handleOptionKeyDown}
        className={cn(`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left outline-none transition-colors focus-visible:bg-hover`, selected ? `bg-selected` : focused ? `bg-hover` : `hover:bg-hover`)}
      >
        {question.multiSelect ? (
          <span className={cn(`flex size-4 shrink-0 items-center justify-center rounded-sm border`, selected ? `border-brand bg-brand text-foreground-inverse` : `border-border text-transparent`)}>
            <IconCheck className="size-3" />
          </span>
        ) : (
          <span className={cn(`w-5 shrink-0 self-center text-ui-base font-medium`, selected ? `text-foreground` : `text-foreground-subtlest`)}>
            {index + 1}
            {`.`}
          </span>
        )}
        <span className="min-w-0 flex-1 text-ui-base leading-5">
          <span className="text-ui-base font-medium leading-5 text-foreground">{label}</span>
          {description ? <span className="ml-2 text-ui-base leading-5 text-foreground-subtle">{description}</span> : null}
        </span>
      </button>
    );
  };
  const renderCustomInput = (question: ElicitationQuestion, index: number) => {
    const hasCustom = (currentDraft?.customAnswer.trim().length ?? 0) > 0;
    const focused = focusSlot >= 0 && focusSlot === index;
    const planSingle = isPlanApproval && !question.multiSelect;
    return (
      <div
        key={`custom-input`}
        role={question.multiSelect ? `checkbox` : undefined}
        aria-checked={question.multiSelect ? hasCustom : undefined}
        onClick={(event) => {
          if (event.target !== customInputRef.current) customInputRef.current?.focus();
        }}
        className={cn(`flex w-full cursor-text items-center gap-3 rounded-xl px-3 py-2 transition-colors`, hasCustom ? `bg-selected` : focused ? `bg-hover` : `hover:bg-hover`)}
      >
        {question.multiSelect ? (
          <span className={cn(`flex size-4 shrink-0 items-center justify-center rounded-sm border`, hasCustom ? `border-brand bg-brand text-foreground-inverse` : `border-border text-transparent`)}>
            <IconCheck className="size-3" />
          </span>
        ) : planSingle ? (
          <span aria-hidden="true" className="w-5 shrink-0" />
        ) : (
          <span className={cn(`w-5 shrink-0 self-center text-ui-base font-medium`, hasCustom ? `text-foreground` : `text-foreground-subtlest`)}>
            {index + 1}
            {`.`}
          </span>
        )}
        <Input
          ref={customInputRef}
          size="lg"
          value={currentDraft?.customAnswer ?? ``}
          placeholder={intl.formatMessage({ id: `chat.elicitation.customAnswer.placeholder` })}
          onFocus={() => setFocusSlot(index)}
          onChange={(event) => handleCustomAnswerChange(question, event.target.value)}
          onCompositionStart={() => {
            compositionActive.current = true;
          }}
          onCompositionEnd={() => {
            compositionActive.current = false;
          }}
          onKeyDown={handleCustomInputKeyDown}
          className="h-5 rounded-none border-transparent bg-transparent px-0 py-0 text-ui-base font-medium shadow-none hover:border-transparent focus-visible:border-transparent focus-visible:bg-transparent"
        />
      </div>
    );
  };
  const hasPrevious = questions.length > 0 && questionIndex > 0;
  const hasNext = questions.length > 0 && questionIndex < questions.length - 1;
  const handleContainerKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (focusSlot >= 0) return;
      switch (event.key) {
        case `ArrowDown`:
          event.preventDefault();
          cycleFocus(1);
          return;
        case `ArrowUp`:
          event.preventDefault();
          cycleFocus(-1);
          return;
        case `Tab`:
          event.preventDefault();
          cycleFocus(event.shiftKey ? -1 : 1);
          return;
        case `Enter`:
          event.preventDefault();
          handlePrimaryAdvance();
          return;
        case `Escape`:
          event.preventDefault();
          if (!isPlanApproval && questionIndex > 0) {
            goPrevious();
          } else {
            decline();
          }
          return;
        default:
          return;
      }
    },
    [focusSlot, cycleFocus, handlePrimaryAdvance, isPlanApproval, questionIndex, goPrevious, decline],
  );
  const primaryLabelId = questions.length === 0 || questionIndex >= questions.length - 1 ? `chat.elicitation.submit` : `chat.elicitation.continue`;
  const titleBadge = isPlanApproval ? intl.formatMessage({ id: `chat.permission.title` }) : currentQuestion?.header;
  const questionText = isPlanApproval
    ? intl.formatMessage({ id: `chat.permission.switchMode.placeholder` })
    : currentQuestion?.question ?? intl.formatMessage({ id: `chat.elicitation.title` });
  const isLongQuestion = questionText.length > 80 || questionText.includes(`\n`);
  const collapseQuestionLabel = intl.formatMessage({ id: questionCollapsed ? `chat.elicitation.collapseQuestion` : `chat.elicitation.expandQuestion` });
  const collapseDialogLabel = intl.formatMessage({ id: dialogExpanded ? `chat.elicitation.collapseDialog` : `chat.elicitation.expandDialog` });
  const stopCountdownLabel = intl.formatMessage({ id: `taskList.stopCountdown` });
  const countdownButton =
    countdownSeconds === null ? null : (
      <Button
        type="button"
        size="xs"
        variant="secondary"
        data-elicitation-countdown-seconds={countdownSeconds}
        aria-label={stopCountdownLabel}
        title={stopCountdownLabel}
        onClick={() => notifyInteraction(`countdown`)}
        className="min-w-10 px-1.5 tabular-nums text-foreground-subtle"
      >
        {intl.formatMessage({ id: `chat.elicitation.countdownSeconds` }, { seconds: String(countdownSeconds) })}
      </Button>
    );
  return (
    <div className="w-full shrink-0">
      <div
        ref={containerRef}
        tabIndex={focusSlot < 0 ? 0 : -1}
        data-elicitation-dialog-card="true"
        className="relative z-1 flex w-full max-h-[min(72dvh,42rem)] flex-col overflow-hidden rounded-2xl border border-border bg-popover shadow-xs outline-none"
        onMouseEnter={() => notifyInteraction(`panelHover`)}
        onKeyDown={handleContainerKeyDown}
      >
        <div className="flex min-h-0 flex-1 flex-col gap-3 p-3">
          <div data-elicitation-dialog-body="true" className={cn(`flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain pr-1`, dialogExpanded ? undefined : `max-md:hidden`)}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 text-ui-base font-medium leading-5">
                <InteractionOriginBadge origin={request.origin} className={`mr-2`} />
                {titleBadge ? (
                  <Badge variant={`outline`} className={`mr-2 max-w-40 align-baseline text-ui-base truncate`}>
                    {titleBadge}
                  </Badge>
                ) : null}
                <span title={questionText} className={cn(`whitespace-pre-wrap break-words leading-6 text-foreground`, isLongQuestion && !questionCollapsed ? `max-md:line-clamp-4` : undefined)}>
                  {questionText}
                </span>
                {isLongQuestion ? (
                  <Button
                    type="button"
                    size="xs"
                    variant="ghost"
                    aria-expanded={questionCollapsed}
                    aria-label={collapseQuestionLabel}
                    title={collapseQuestionLabel}
                    onClick={() => setQuestionCollapsed((previous) => !previous)}
                    className="mt-2 hidden max-md:inline-flex"
                  >
                    {questionCollapsed ? <IconChevronUp className="size-3" /> : <IconChevronDown className="size-3" />}
                    <span>{collapseQuestionLabel}</span>
                  </Button>
                ) : null}
              </div>
              <div className="flex items-center gap-1 text-ui-base font-medium leading-tight text-foreground-subtlest">
                {countdownButton}
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  aria-expanded={dialogExpanded}
                  aria-label={collapseDialogLabel}
                  title={collapseDialogLabel}
                  onClick={() => setDialogExpanded((previous) => !previous)}
                  className="hidden max-md:inline-flex"
                >
                  {dialogExpanded ? <IconChevronDown className="size-3" /> : <IconChevronUp className="size-3" />}
                </Button>
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  disabled={!hasPrevious}
                  title={intl.formatMessage({ id: `chat.elicitation.previousQuestion` })}
                  aria-label={intl.formatMessage({ id: `chat.elicitation.previousQuestion` })}
                  onClick={handlePreviousButton}
                >
                  <IconChevronLeft className="size-3" />
                </Button>
                <span className="min-w-10 text-center">{`${Math.min(questionIndex + 1, Math.max(questions.length, 1))} / ${Math.max(questions.length, 1)}`}</span>
                <Button
                  type="button"
                  size="icon-xs"
                  variant="ghost"
                  disabled={!hasNext}
                  title={intl.formatMessage({ id: `chat.elicitation.nextQuestion` })}
                  aria-label={intl.formatMessage({ id: `chat.elicitation.nextQuestion` })}
                  onClick={handleNextButton}
                >
                  <IconChevronRight className={`size-3`} />
                </Button>
              </div>
            </div>
            {currentQuestion ? (
              <div className="space-y-3">
                <div role={currentQuestion.multiSelect ? `group` : `listbox`} aria-label={questionText} className="space-y-1">
                  {currentQuestion.options.map((option, index) => renderOption(currentQuestion, option, index))}
                  {renderCustomInput(currentQuestion, currentQuestion.options.length)}
                </div>
              </div>
            ) : (
              <p className="px-1 text-ui-base text-foreground-subtle">{intl.formatMessage({ id: `chat.elicitation.noQuestions` })}</p>
            )}
          </div>
          {dialogExpanded ? null : (
            <div className="hidden min-w-0 items-center justify-between gap-2 max-md:flex">
              <button
                type="button"
                onClick={() => setDialogExpanded(true)}
                className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1 py-0.5 text-left text-ui-base font-medium text-foreground hover:bg-hover"
              >
                {titleBadge ? (
                  <Badge variant={`outline`} className={`max-w-32 shrink-0 align-baseline text-ui-base truncate`}>
                    {titleBadge}
                  </Badge>
                ) : null}
                <span className="min-w-0 flex-1 truncate">{questionText}</span>
              </button>
              {countdownButton}
              <span className="shrink-0 text-ui-base font-medium text-foreground-subtlest">{`${Math.min(questionIndex + 1, Math.max(questions.length, 1))} / ${Math.max(questions.length, 1)}`}</span>
              <Button type="button" size="icon-xs" variant="ghost" aria-expanded={dialogExpanded} aria-label={collapseDialogLabel} title={collapseDialogLabel} onClick={() => setDialogExpanded(true)}>
                <IconChevronUp className="size-3" />
              </Button>
            </div>
          )}
          <div data-elicitation-dialog-footer="true" className={cn(`flex shrink-0 items-center justify-between gap-2 px-1 max-sm:flex-wrap`, dialogExpanded ? undefined : `max-md:hidden`)}>
            <p className="flex min-w-0 flex-1 items-center gap-2 text-ui-base text-foreground-subtle max-sm:basis-full">
              <IconInfo className={`size-4 shrink-0 text-foreground`} />
              <span className="min-w-0">{intl.formatMessage({ id: `chat.elicitation.keyboardHint` })}</span>
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <Button type="button" size="lg" variant="outline" onClick={decline}>
                {intl.formatMessage({ id: `chat.elicitation.dismiss` })}
              </Button>
              <Button type="button" size="lg" onClick={questions.length === 0 ? submitAll : handlePrimaryAdvance} className="bg-brand text-foreground-inverse hover:bg-brand/80">
                {intl.formatMessage({ id: primaryLabelId })}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * 3. 交互调度（原 pSt 等，js 117283–117684 / jsx 99619–100033）
 * ==========================================================================*/

/** 原 rSt（js 117400 / jsx 99762）：允许规则内容候选字段 */
const PERMISSION_RULE_FIELDS = [`command`, `url`, `file_path`, `path`, `pattern`];

/** 原 iSt（js 117401 / jsx 99763）：选项 kind → resolveInteraction 应答 */
function buildOptionResponse(kind: string, option: PermissionOption): { decision: "allow" | "deny"; permissionUpdates?: unknown[] } {
  if (kind === `deny` || kind === `rejectOnce` || kind === `rejectAlways`) return { decision: `deny` };
  if (kind === `allowAlways`) {
    const detail = typeof option.detail == `object` && option.detail !== null ? option.detail : {};
    const ruleContent = PERMISSION_RULE_FIELDS.map((field) => detail[field]).find((value): value is string => typeof value == `string` && value.trim().length > 0);
    return {
      decision: `allow`,
      permissionUpdates: [
        {
          behavior: `allow`,
          rules: [
            {
              toolName: (option as unknown as { toolName: string }).toolName,
              ...(ruleContent ? { ruleContent } : {}),
            },
          ],
          type: `addRules`,
        },
      ],
    };
  }
  return { decision: `allow` };
}

/** 原 aSt（js 117419 / jsx 99788）：pendingInteraction(permission) → PermissionRequest */
function toPermissionRequest(sessionId: string, interaction: PendingInteraction & { payload: Extract<PendingInteraction["payload"], { kind: "permission" }> }): PermissionRequest {
  const { payload } = interaction;
  const options = payload.options.map((option) => ({
    optionId: option.optionId,
    kind: option.kind,
    name: option.label,
    response: option.response ?? buildOptionResponse(option.kind, { optionId: option.optionId, kind: option.kind, name: option.label } as PermissionOption),
  }));
  return {
    type: `permission_request`,
    taskId: sessionId,
    traceId: sessionId,
    requestId: interaction.interactionId,
    description: payload.summary,
    kind: payload.toolName,
    title: payload.toolName,
    options,
    ...(payload.origin ? { origin: payload.origin } : {}),
    raw: payload.detail ?? { toolCallId: (payload as { toolCallId?: string }).toolCallId, toolName: payload.toolName },
  };
}

/** 原 oSt（js 117440 / jsx 99816）：pendingInteraction(userInput 简单型) → 通用对话框模型 */
function toGenericInteractionModel(interaction: PendingInteraction & { payload: Extract<PendingInteraction["payload"], { kind: "userInput" }> }) {
  return {
    interactionId: interaction.interactionId,
    prompt: interaction.payload.prompt,
    freeText: interaction.payload.freeText,
    sensitive: interaction.payload.sensitive,
    options: interaction.payload.options ?? [],
  };
}

/** 原 sSt（js 117449 / jsx 99825）：pendingInteraction(userInput 问卷型) → ElicitationRequest */
function toElicitationRequest(sessionId: string, interaction: PendingInteraction & { payload: Extract<PendingInteraction["payload"], { kind: "userInput" }> }): ElicitationRequest | null {
  const { payload } = interaction;
  if (!payload.questions || payload.questions.length === 0) return null;
  const first = payload.questions[0];
  return {
    type: `elicitation_request`,
    taskId: sessionId,
    traceId: payload.traceId ?? sessionId,
    requestId: interaction.interactionId,
    message: first?.question ?? payload.prompt ?? ``,
    header: first?.header,
    options: first?.options ?? [],
    ...(first?.multiSelect ? { multiSelect: true } : {}),
    questions: payload.questions,
    ...(payload.currentQuestionIndex === undefined ? {} : { currentQuestionIndex: payload.currentQuestionIndex }),
    ...(payload.answerDrafts ? { answerDrafts: payload.answerDrafts } : {}),
    ...(payload.origin ? { origin: payload.origin } : {}),
    schema: payload.schema ?? payload.input,
  };
}

/**
 * 通用交互对话框（原 cSt，js 117469 / jsx 99855）。
 * 兜底形态（非问卷的 userInput）：fixed 全屏遮罩 + 提示 + 选项按钮 + 自由输入
 *（sensitive 用 password 输入框）。
 */
function GenericInteractionDialog({
  model,
  onSubmit,
}: {
  model: { prompt?: string; freeText?: boolean; sensitive?: boolean; options: { optionId: string; label: string }[] };
  onSubmit: (answer: { optionId?: string; freeText?: string }) => void;
}) {
  const [freeText, setFreeText] = React.useState(``);
  const submitOption = React.useCallback(
    (optionId: string) => {
      onSubmit({ optionId });
    },
    [onSubmit],
  );
  const submitFreeText = React.useCallback(() => {
    const trimmed = freeText.trim();
    if (!trimmed && model.freeText) return;
    onSubmit(model.freeText ? { freeText: trimmed } : { optionId: model.options[0]?.optionId });
  }, [freeText, model.freeText, model.options, onSubmit]);
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" data-testid="v4-interaction-dialog">
      <div className="w-full max-w-lg rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-lg">
        <p className="mb-3 text-ui-base text-[var(--color-foreground)]">{model.prompt}</p>
        {model.options.length > 0 ? (
          <div className="mb-3 flex flex-col gap-2">
            {model.options.map((option) => (
              <Button key={option.optionId} type="button" variant="outline" data-testid={`v4-interaction-option:${option.optionId}`} onClick={() => submitOption(option.optionId)}>
                {option.label}
              </Button>
            ))}
          </div>
        ) : null}
        {model.freeText ? (
          <div className="flex flex-col gap-2">
            <Input type={model.sensitive ? `password` : `text`} value={freeText} onChange={(event) => setFreeText(event.target.value)} data-testid="v4-interaction-input" />
            <Button type="button" onClick={submitFreeText}>{`提交`}</Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** 原 nSt（js 117366 / jsx ~99705）：暂停交互自动结束（snoozeInteractionAutoResolution 命令） */
async function snoozeInteractionAutoResolution(args: {
  sessionId: string;
  interactionId: string;
  sendCommand: (command: unknown) => Promise<CommandAck>;
  source: string;
  onCommandSettled?: (commandId: string) => void;
}): Promise<boolean> {
  const command = buildCommand({
    type: `snoozeInteractionAutoResolution`,
    sessionId: args.sessionId,
    payload: { interactionId: args.interactionId },
  });
  pendingCommandLedger.record(command);
  try {
    const ack = await args.sendCommand(command);
    pendingCommandLedger.applyAck(command, ack);
    const accepted = ack.status === `accepted` || ack.status === `duplicate` || ack.status === `noop`;
    if (!accepted) {
      logger.warn(`[v4-interaction] 暂停自动结束被拒绝`, {
        interactionId: args.interactionId,
        source: args.source,
        status: ack.status,
        reasonCode: ack.reasonCode,
      });
    }
    return accepted;
  } catch (error) {
    logger.error(`[v4-interaction] 暂停自动结束失败`, { interactionId: args.interactionId, source: args.source, error });
    return false;
  } finally {
    args.onCommandSettled?.(command.commandId);
  }
}

/** 原 fSt（js 117536 / jsx 99884）：snooze 账本（交互过才可暂停，且每次交互只暂停一次） */
function createSnoozeLedger() {
  const interacted = new Set<string>();
  const snoozed = new Set<string>();
  return {
    markInteracted(interactionId: string) {
      interacted.add(interactionId);
    },
    consumeSnooze(interactionId: string, hasAutoResolution: boolean): boolean {
      if (!hasAutoResolution || !interacted.has(interactionId) || snoozed.has(interactionId)) return false;
      snoozed.add(interactionId);
      return true;
    },
    releaseSnooze(interactionId: string) {
      snoozed.delete(interactionId);
    },
  };
}

/** 原 lSt/uSt/dSt（js 117527/117530/117533 / jsx 99875/99878/99881） */
function snapshotForSession(sessionId: string, snapshots: SessionSnapshotForOverlays | null): SessionSnapshotForOverlays | null {
  return snapshots?.sessionId === sessionId ? snapshots : null;
}
function withElicitationOverride(candidate: ElicitationRequest | null, override: ElicitationRequest | null | undefined): ElicitationRequest | null {
  return override && candidate?.requestId === override.requestId ? override : candidate;
}
function elicitationDraftKey(request: ElicitationRequest): string {
  return `${request.requestId}:${request.currentQuestionIndex ?? 0}:${JSON.stringify(request.answerDrafts ?? {})}`;
}

/** 任务 store 草稿选择器（原 xe + te(W(...), sessionId)，skillStore chunk） */
declare function useTaskElicitationDraft(workspacePath: string | undefined, sessionId: string): ElicitationRequest | null;
declare function useTaskElicitationFormDraft(workspacePath: string | undefined, sessionId: string, requestId: string): { questionIndex: number; drafts: AnswerDraftMap } | undefined;
declare function setTaskElicitationFormDraft(
  workspacePath: string | undefined,
  sessionId: string,
  requestId: string,
  draft: { questionIndex: number; drafts: AnswerDraftMap },
  workspaceIdentity?: string | null,
): void;
declare function removeTaskElicitationFormDraft(workspacePath: string | undefined, sessionId: string, requestId: string, workspaceIdentity?: string | null): void;
declare function useNotificationEnabled(): boolean;
declare function useTelemetryPlatform(): unknown | null;
/** 原 tSt（js 117346 / jsx 99703）：新交互出现时的桌面通知（接口保留） */
declare function useSnapshotInteractionToasts(args: {
  snapshot: SessionSnapshotForOverlays | null;
  enabled: boolean;
  platform: unknown;
  formatMessage: IntlShape["formatMessage"];
}): void;

/**
 * 会话交互覆盖层（原 pSt，js 117551 / jsx 99899）。
 * 取快照中第一个 pendingInteraction 分派渲染：
 *   permission → PermissionApprovalOverlay；
 *   userInput（问卷）→ ElicitationDialog（AskUserQuestion/带自动结束者，
 *     首次交互触发 snooze 暂停自动结束）；
 *   其他 userInput → GenericInteractionDialog。
 * 应答统一走 resolveInteraction 命令（账本记账 + ACK 应用）；
 * 草稿按 工作区×会话×请求 持久化到任务 store，交互结束后清理。
 */
function ConversationInteractionsOverlay({
  sessionId,
  workspacePath,
  workspaceIdentity,
  provider,
  snapshot,
  onCommandSettled,
}: {
  sessionId: string;
  workspacePath?: string;
  workspaceIdentity?: string | null;
  provider?: string;
  snapshot: SessionSnapshotForOverlays;
  onCommandSettled?: (commandId: string) => void;
}) {
  const { sendCommand } = useOverlayCommandEnvironment();
  const platform = useTelemetryPlatform();
  const { intl } = useIntlContext();
  const sessionSnapshot = snapshotForSession(sessionId, snapshot);
  const pending = sessionSnapshot?.pendingInteractions[0] ?? null;
  const notificationEnabled = useNotificationEnabled();
  const elicitationOverride = useTaskElicitationDraft(workspacePath, sessionId);
  const initialFormDraft = useTaskElicitationFormDraft(workspacePath, sessionId, pending?.interactionId ?? ``);
  useSnapshotInteractionToasts({ snapshot: sessionSnapshot, enabled: notificationEnabled, platform, formatMessage: intl.formatMessage });
  const snoozeLedger = React.useRef(createSnoozeLedger());
  const autoResolutionPausedFor = React.useRef(new Set<string>());
  const resolveInteraction = React.useCallback(
    async (interactionId: string, answer: unknown) => {
      const command = buildCommand({ type: `resolveInteraction`, sessionId, payload: { interactionId, answer } });
      pendingCommandLedger.record(command);
      try {
        const ack = await sendCommand(command);
        pendingCommandLedger.applyAck(command, ack);
        const accepted = ack.status === `accepted` || ack.status === `duplicate` || ack.status === `noop`;
        if (!accepted) {
          logger.warn(`[v4-interaction] resolveInteraction 被拒绝`, { interactionId, status: ack.status, reasonCode: ack.reasonCode });
        }
        return accepted;
      } catch (error) {
        logger.error(`[v4-interaction] resolveInteraction 失败`, { interactionId, error });
        return false;
      } finally {
        onCommandSettled?.(command.commandId);
      }
    },
    [onCommandSettled, sendCommand, sessionId],
  );
  const snooze = React.useCallback(
    async (interactionId: string) =>
      snoozeInteractionAutoResolution({ sessionId, interactionId, sendCommand, source: `dialog`, onCommandSettled }),
    [onCommandSettled, sendCommand, sessionId],
  );
  const persistFormDraft = React.useCallback(
    (requestId: string, draft: { questionIndex: number; drafts: AnswerDraftMap }) => {
      setTaskElicitationFormDraft(workspacePath, sessionId, requestId, draft, workspaceIdentity);
    },
    [sessionId, workspaceIdentity, workspacePath],
  );
  const discardFormDraft = React.useCallback(
    (requestId: string) => {
      removeTaskElicitationFormDraft(workspacePath, sessionId, requestId, workspaceIdentity);
    },
    [sessionId, workspaceIdentity, workspacePath],
  );
  /* 交互结束后清理残留草稿 */
  React.useEffect(() => {
    if (!sessionSnapshot) return;
    const live = new Set(sessionSnapshot.pendingInteractions.filter((interaction) => interaction.payload.kind === `userInput`).map((interaction) => interaction.interactionId));
    for (const requestId of Object.keys(taskElicitationDraftKeys(workspacePath, sessionId, workspaceIdentity))) {
      if (!live.has(requestId)) discardFormDraft(requestId);
    }
  }, [sessionSnapshot, discardFormDraft, sessionId, workspaceIdentity, workspacePath]);
  const snoozeAfterInteraction = React.useCallback(
    async (interactionId: string, hasAutoResolution: boolean) => {
      if (!hasAutoResolution) return true;
      if (!snoozeLedger.current.consumeSnooze(interactionId, hasAutoResolution)) return true;
      try {
        const ok = await snooze(interactionId);
        if (!ok) snoozeLedger.current.releaseSnooze(interactionId);
        return ok;
      } catch {
        snoozeLedger.current.releaseSnooze(interactionId);
        return false;
      }
    },
    [snooze],
  );
  React.useEffect(() => {
    if (pending) snoozeAfterInteraction(pending.interactionId, !!pending.autoResolution);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending?.autoResolution, pending?.interactionId, snoozeAfterInteraction]);
  if (!pending) return null;
  if (pending.payload.kind === `permission`) {
    const permissionRequest = toPermissionRequest(sessionId, { ...pending, payload: pending.payload });
    return (
      <PermissionApprovalOverlay
        request={permissionRequest}
        workspacePath={workspacePath}
        provider={provider}
        onRespond={(_requestId, option) => {
          resolveInteraction(pending.interactionId, { optionId: option.optionId });
        }}
      />
    );
  }
  const elicitation = withElicitationOverride(
    toElicitationRequest(sessionId, { ...pending, payload: pending.payload as Extract<PendingInteraction["payload"], { kind: "userInput" }> }),
    elicitationOverride,
  );
  if (elicitation) {
    const pauseAutoResolution = pending.payload.toolName?.trim().toLowerCase() === `askuserquestion` || pending.autoResolution !== undefined;
    return (
      <ElicitationDialogKeyed
        key={elicitationDraftKey(elicitation)}
        request={elicitation}
        initialFormDraft={elicitationOverride?.requestId === elicitation.requestId ? undefined : initialFormDraft}
        onFormDraftChange={persistFormDraft}
        autoResolution={pauseAutoResolution ? pending.autoResolution : undefined}
        onFirstInteraction={
          pauseAutoResolution
            ? (kind) => {
                if (!autoResolutionPausedFor.current.has(pending.interactionId)) {
                  autoResolutionPausedFor.current.add(pending.interactionId);
                  logger.debug(`[v4-interaction] AskUserQuestion 请求暂停自动结束`, { interactionId: pending.interactionId, source: kind });
                }
                snoozeLedger.current.markInteracted(pending.interactionId);
                return snoozeAfterInteraction(pending.interactionId, !!pending.autoResolution);
              }
            : undefined
        }
        onRespond={(_requestId, action, answers) => {
          resolveInteraction(pending.interactionId, { action, ...(answers ? { content: answers } : {}) }).then((accepted) => {
            if (accepted) discardFormDraft(pending.interactionId);
          });
        }}
      />
    );
  }
  return (
    <GenericInteractionDialog
      model={toGenericInteractionModel({ ...pending, payload: pending.payload as Extract<PendingInteraction["payload"], { kind: "userInput" }> })}
      onSubmit={(answer) => {
        resolveInteraction(pending.interactionId, answer);
      }}
    />
  );
}
declare function useOverlayCommandEnvironment(): { sendCommand: (command: unknown) => Promise<CommandAck> };
declare function taskElicitationDraftKeys(workspacePath: string | undefined, sessionId: string, workspaceIdentity: string | null | undefined): Record<string, unknown>;

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
/** 原 XSt（jsx 100551） */
const CAPTCHA_VERIFY_FAILED_CODE = `CAPTCHA_VERIFY_FAILED`;

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

/** 原 b0（js 118292 / jsx 100548）：provider 是否需要 captcha（配置判定） */
declare function isCaptchaProvider(provider: unknown): boolean;
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
  /* Permission */
  PermissionApprovalOverlay,
  McpPermissionRow,
  PermissionRuleScopes,
  InteractionOriginBadge,
  sortPermissionOptions,
  classifyPermissionOptionKind,
  /* Elicitation */
  ElicitationDialog,
  ElicitationDialogKeyed,
  normalizeElicitationQuestions,
  isPlanApprovalRequest,
  buildElicitationAnswerPayload,
  /* Interaction */
  ConversationInteractionsOverlay,
  GenericInteractionDialog,
  toPermissionRequest,
  toElicitationRequest,
  toGenericInteractionModel,
  snoozeInteractionAutoResolution,
  /* Captcha / runtime auth */
  RuntimeAuthHeadersControllerImpl as RuntimeAuthHeadersController,
  ALIYUN_CAPTCHA_SCRIPT_URL,
  CAPTCHA_VERIFY_PARAM_HEADER,
  /* Session errors */
  useSessionSubscriptionErrorReporterImpl as useSessionSubscriptionErrorReporter,
  parseFaultKey,
};
