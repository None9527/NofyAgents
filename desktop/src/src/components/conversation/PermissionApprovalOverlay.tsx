// A0-S4-4b: 自 modules/ConversationOverlays.tsx §1 Permission 子族 原样迁入（组件单元；原文件现为薄 re-export shim）。
// 迁出体 = §1 全段（230–766）+ §0 声明群分配本族子集（classifyToolCall/extractRawFileSummaries/parseToolCallRaw/isPlainRecord
// 四 declare + InteractionOrigin/PermissionOption/PermissionRequest 模型；后两者补 export 供交互调度族 type import 取回）。
// 导入路径按 components/conversation/ 深度改指 ../../modules/。
/* eslint-disable */
import * as React from "react";
import { Info as IconInfo, Loader as IconLoader, Shield as IconShield } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0
import { ShellToolView, ToolLayout } from '../../modules/Conversation'; // +ToolLayout（A0-D 接线：declare → Conversation canonical）
import { FallbackToolView, FileWriteToolView, SearchToolView, SkillToolView, type FileSummary, type ToolCall, type ToolCallViewProps } from '../../modules/ConversationLeaves'; // +3 type（A0-D 类型收敛：会话流共享类型 canonical = ConversationLeaves）
import { type CodePreviewSettings } from '../../modules/MarkdownIntegration';
import { Badge } from '../../modules/PaymentDeep';
import { buildPermissionRequestViewModel } from '../../modules/SrcSharedB';
import { useSettingsStoreValue as useSettingsSelector } from '../../modules/stores-core'; // A0-CLEANUP3 #49：原 Ao，canonical = stores-core useSettingsStoreValue（styles js 1301）
import { isSwitchModePermissionRequest } from './PermissionRequestModel'; // 〔A1-P1-B11〕Xpt declare 实体化收敛（styles 106564–106655 逐字）
import { useZCodeIntl as useIntlContext } from '../../modules/I18n'; // 原 G（A0-D 接线：declare → I18n canonical）
import { Button } from '../../modules/button'; // 原 H（A0-D 接线：declare → button canonical）
import { cn } from '../../modules/UtilsCn'; // 原 Z（A0-D 接线：declare → UtilsCn canonical）

declare function classifyToolCall(toolCall: ToolCall): { family: string };
declare function extractRawFileSummaries(raw: unknown, toolCall: ToolCall): FileSummary[];
declare function parseToolCallRaw(raw: unknown): Record<string, unknown> | null; // hg
declare function isPlainRecord(value: unknown): value is Record<string, unknown>; // pg

/* --- 交互/快照模型（本族所有子集） --- */

export type InteractionOrigin = { kind: string; agentType?: string } | undefined;

export interface PermissionOption {
  optionId: string;
  kind: string;
  name: string;
  detail?: Record<string, unknown>;
  response?: unknown;
}
export interface PermissionRequest {
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

/* ============================================================================
 * 1. Permission 子族（审批内联覆盖层；chat.permission.*）
 * ==========================================================================*/

/**
 * 原 vxt（js 116752 / jsx 99162）：选项 kind 同义词表
 * （后端/各 provider 的英文表述 → 四类标准动作）。
 */
const PERMISSION_OPTION_KIND_SYNONYMS = {
  allowOnce: new Set([`allow`, `allow once`, `approve`]),
  allowAlways: new Set([`always allow`, `allow always`, `approve always`]),
  rejectOnce: new Set([`deny`, `deny once`, `reject`, `reject once`]),
  rejectAlways: new Set([`always deny`, `deny always`, `always reject`, `reject always`]),
  custom: new Set<string>(),
};

/** 原 yxt（js 116759 / jsx 99169） */
function normalizeOptionKindText(text: string): string {
  return text.trim().replace(/\s+/g, ` `);
}

/** 原 Z1（js 116762 / jsx 99172）：kind 文本 → 四类标准动作 */
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

/** 原 bxt（js 116777 / jsx 99179）：自定义选项 = 名称不在同义词表内（显示原文） */
function isCustomPermissionOption(option: { name: string; kind: string }): boolean {
  const name = normalizeOptionKindText(option.name).toLowerCase();
  if (name.length === 0) return false;
  const kind = classifyPermissionOptionKind(option.kind);
  return kind === `custom` ? true : !PERMISSION_OPTION_KIND_SYNONYMS[kind].has(name);
}

/** 原 xxt（js 116783 / jsx 99185）：排序权重 允许一次<始终允许<拒绝一次<始终拒绝<自定义 */
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

/** 原 Sxt（js 116797 / jsx 99199）：稳定排序（同类保持原序） */
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

/** 原 Ext（js 116812 / jsx 99213）：bash 规则前缀截断（首行 + 160 字符） */
function truncateScopeDisplay(text: string): { display: string; truncated: boolean } {
  const newlineIndex = text.search(/\r?\n/);
  const firstLine = newlineIndex === -1 ? text : text.slice(0, newlineIndex);
  const truncated = newlineIndex !== -1 || firstLine.length > SCOPE_DISPLAY_MAX_LEN;
  return { display: `${firstLine.slice(0, SCOPE_DISPLAY_MAX_LEN - 2).trimEnd()} …`, truncated };
}

/**
 * 原 Dxt（js 116818 / jsx 99222）：从「始终允许」选项的响应里提取
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

/** 原 kxt（js 116850 / jsx 99236）：选项主文案 i18n key */
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

/** 原 Nxt（js 116876 / jsx 99266）：选项说明 i18n key（按动作×作用域） */
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
 * 原 Pxt（js 116897 / jsx 99287）：请求级理由提取
 *（raw 解析后的 description/reason/summary 逐级兜底）。
 */
function resolvePermissionRequestReason(request: PermissionRequest): string | null {
  const parsedRaw = parseToolCallRaw(request.raw);
  const fromParsed = parsedRaw && isPlainRecord(parsedRaw) ? visibleReasonText(trimToNull(parsedRaw.description)) ?? visibleReasonText(trimToNull(parsedRaw.reason)) ?? visibleReasonText(trimToNull(parsedRaw.summary)) : null;
  const fromRaw = isPlainRecord(request.raw) ? visibleReasonText(trimToNull((request.raw as Record<string, unknown>).reason)) : null;
  return fromParsed ?? visibleReasonText(trimToNull(request.description)) ?? fromRaw;
}

/** 原 Fxt（js 116903 / jsx 99293）：mcp__ 前缀工具名 */
function resolveMcpToolName(request: PermissionRequest): string | null {
  const fromRaw = isPlainRecord(request.raw) ? trimToNull((request.raw as Record<string, unknown>).toolName) ?? trimToNull((request.raw as Record<string, unknown>).tool_name) : null;
  const name = trimToNull(request.toolName) ?? fromRaw ?? trimToNull(request.kind) ?? trimToNull(request.title);
  return name?.startsWith(`mcp__`) ? name : null;
}
/** 原 Ixt（js 116908 / jsx 99298） */
function resolveRawReason(request: PermissionRequest): string | null {
  return isPlainRecord(request.raw) ? trimToNull((request.raw as Record<string, unknown>).reason) : null;
}

/** 原 Lxt（js 116911 / jsx 99301）：审批卡内工具预览的视图类型 */
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
/** 原 Rxt（js 116924 / jsx 99306）：edit 可折叠默认收起；其余强制展开 */
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

/** 原 zxt（js 116936 / jsx 99324）：审批请求 → 伪工具调用（供工具视图渲染） */
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

/** 原 Bxt（js 116947 / jsx 99335）：组装工具视图 props（关闭交互入口） */
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

/* ── tombstone〔A1-P1-B11〕：isSwitchModePermissionRequest declare（Xpt）删除——逐字实体化 →
 * ./PermissionRequestModel（styles 106564–106655；roundtrip EXACT，/tmp/a1r0-p1/p11/）。
 * 消费面改文件头真实 import，调用面逐字不变。 ── */
/** 原 Hpt（js 106453 / jsx 91360）：切模式提示（按平台快捷键） */
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


/* 〔A0-S4-4b〕补导出块：原经 ConversationOverlays.tsx §6 导出块对外，迁出后于属主文件本地导出（体不动）。 */
export {
  PermissionApprovalOverlay,
  McpPermissionRow,
  PermissionRuleScopes,
  InteractionOriginBadge,
  sortPermissionOptions,
  classifyPermissionOptionKind,
};
