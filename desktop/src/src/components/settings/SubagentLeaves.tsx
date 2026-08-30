// A0-S4-4a: 自 modules/SettingsLeaves.tsx §A 子代理深层叶子 原样迁入（组件单元；原文件现为薄 re-export shim）。
// 迁出体 = §0 声明群子集（SelectItemEntry/SelectGroupEntry/ThoughtLevelSelector/ConfigOption + ModelSelector tombstone）+ §A 全段（373–1352）。导入路径按 components/settings/ 深度改指 ../../modules/。
import * as React from "react";
import { Check as IconCheck, Trash2 as IconTrash, Pencil as IconPencil, Info as IconInfo, Users as IconUsers } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0
import { Button } from '../../modules/button';
import { ModelSelector, type ModelGroup } from '../../modules/Composer';
import { Input } from '../../modules/ImeComposition';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch } from '../../modules/Settings';
import { cn } from '../../modules/UtilsCn';
import { useZCodeIntl as useIntlContext } from '../../modules/I18n';
import {
  joinTestidParts as testidTemplate, // Xa
  subagentRowTestid as TESTID_SUBAGENT_ROW, // Ite
  subagentBuiltInModelTriggerTestid as TESTID_SUBAGENT_MODEL, // Gn
} from '../../modules/SrcSharedB';
/* ============================================================================
 * 0. 外部依赖的类型声明
 * ==========================================================================*/

interface IntlShape {
  formatMessage(descriptor: { id: string }, values?: Record<string, unknown>): string;
}

export interface SelectItemEntry {
  key?: string;
  value: string;
  name?: string;
  [key: string]: unknown;
}
export interface SelectGroupEntry {
  key?: string;
  label?: string;
  items: SelectItemEntry[];
  [key: string]: unknown;
}

declare const ThoughtLevelSelector: React.FC<{
  intl: IntlShape;
  option: ConfigOption;
  provider?: string;
  showInvalidCurrentValue?: boolean;
  disabled?: boolean;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
  restoreFocusSelector?: string | null;
  labelVisibilityClassName?: string;
  indicatorClassName?: string;
  triggerClassName?: string;
  interactionMode?: string;
  onValueChange: (value: string) => void;
}>; // Pq（F08，js 77118）

export interface ConfigOption {
  id: string;
  name: string;
  category: string;
  type: string;
  currentValue?: unknown;
  options?: Array<{ value: string; name: string }>;
  [key: string]: unknown;
}

/* A0-CLEANUP2 item 10：ModelSelector declare 删除 → import { ModelSelector, type ModelGroup } from './Composer'（属主导出，原 vq，js 75527）。
   调用面 SelectGroupEntry[] 与属主 ModelGroup[] 之间按边界 as ModelGroup[] 桥接（单 as 合法，可比性已验证）。 */

/* ============================================================================
 * §A. 子代理分区深层叶子（原 js 196654–197541）
 * ==========================================================================*/

export interface SubagentItem {
  id?: string;
  name: string;
  description?: string;
  model?: string | null;
  modelOverride?: string | null;
  thoughtLevel?: string | null;
  thoughtLevelOverride?: string | null;
  path?: string;
  scope: string;
  source: string;
  enabled: boolean;
  readOnly?: boolean;
  color?: string;
  tools?: string[];
  disallowedTools?: string[];
  skills?: string[];
  permissionMode?: string;
  maxTurns?: number;
  background?: boolean;
  mcpServers?: unknown;
  systemPrompt?: string;
  injectAgentsMd?: boolean;
  [key: string]: unknown;
}

/** 原 q7（196654）：颜色表（WQ 105114 展开） */
export const SUBAGENT_COLORS = ["yellow", "red", "orange", "green", "cyan", "blue", "purple", "pink"] as const;
/** 原 b1t（196655，qft 105115）：颜色 → 类名 */
export const SUBAGENT_COLOR_CLASSES: Record<string, string> = {
  blue: "bg-sky-300 text-sky-900 dark:bg-sky-400/32 dark:text-sky-50",
  cyan: "bg-cyan-300 text-cyan-900 dark:bg-cyan-400/32 dark:text-cyan-50",
  green: "bg-emerald-300 text-emerald-900 dark:bg-emerald-400/32 dark:text-emerald-50",
  orange: "bg-orange-300 text-orange-900 dark:bg-orange-400/32 dark:text-orange-50",
  pink: "bg-pink-300 text-pink-900 dark:bg-pink-400/32 dark:text-pink-50",
  purple: "bg-violet-300 text-violet-900 dark:bg-violet-400/32 dark:text-violet-50",
  red: "bg-rose-300 text-rose-900 dark:bg-rose-400/32 dark:text-rose-50",
  yellow: "bg-amber-300 text-amber-900 dark:bg-amber-300/32 dark:text-amber-50",
};
/** 原 x1t（196656）：模型项锁定判定（子代理域恒否） */
export const subagentModelNeverLocked = (): boolean => false;
/** 原 J7（196657）：继承哨兵值 */
export const SUBAGENT_MODEL_INHERIT = "inherit";
/** 原 Y7（196658）：可选工具全集 */
export const SUBAGENT_TOOL_OPTIONS = ["Read", "Grep", "Glob", "Bash", "Edit", "Write", "WebFetch", "WebSearch", "TodoWrite"];
const SUBAGENT_TOOL_OPTION_SET = new Set(SUBAGENT_TOOL_OPTIONS);
/** 原 C1t（196660）：高关注工具（红点） */
const SUBAGENT_ATTENTION_TOOLS = new Set(["Bash", "Edit", "Write"]);

/** 原 w1t（196661）：可编辑代理集（用户域非插件 + 插件域非工作区） */
export function collectEditableAgents(args: { agents: SubagentItem[]; pluginAgents: SubagentItem[] }): SubagentItem[] {
  return [
    ...args.agents.filter((agent) => agent.scope !== "workspace" && agent.source !== "plugin"),
    ...args.pluginAgents.filter((agent) => agent.scope !== "workspace"),
  ];
}

/** 原 X7（196667）：用户管理判定（user 域 ∧ user 源 ∧ 非只读） */
export function isUserManagedSubagent(agent: SubagentItem): boolean {
  return agent.scope === "user" && agent.source === "user" && agent.readOnly !== true;
}

/** 原 T1t（196670）：内置判定 */
export function isBuiltInSubagent(agent: SubagentItem): boolean {
  return agent.scope === "built-in" || agent.source === "built-in";
}

/** 原 E1t（196673）：内置名（仅 general-purpose/Explore） */
export function builtInSubagentName(agent: SubagentItem): string | null {
  return isBuiltInSubagent(agent) && (agent.name === "general-purpose" || agent.name === "Explore") ? agent.name : null;
}

/** 原 D1t（196676）：已知工具过滤 */
export function filterKnownTools(tools: string[] | undefined): string[] {
  return tools?.filter((tool) => SUBAGENT_TOOL_OPTION_SET.has(tool)) ?? [];
}

/** 原 O1t（196679）：保留工具过滤（未知工具） */
export function filterPreservedTools(tools: string[] | undefined): string[] {
  return tools?.filter((tool) => !SUBAGENT_TOOL_OPTION_SET.has(tool)) ?? [];
}

/** 原 k1t（196682）：工具选择合并（去空去重；空 → undefined） */
export function mergeToolSelections(selected: string[], preserved: string[]): string[] | undefined {
  const merged = [...selected, ...preserved].filter((tool, index, all) => tool.length > 0 && all.indexOf(tool) === index);
  return merged.length > 0 ? merged : undefined;
}

/** 原 A1t（196686）：全工具继承判定（空/缺省/含 `*`） */
export function isInheritAllTools(tools: string[] | undefined): boolean {
  return !tools || tools.length === 0 || tools.some((tool) => tool.trim() === "*");
}

/** 原 j1t（196689）：选中模型归一（非 inherit 的有效值） */
export function normalizeSelectedModel(model: string | null | undefined): string | undefined {
  const normalized = (model ?? "").trim();
  return normalized && normalized !== SUBAGENT_MODEL_INHERIT ? normalized : undefined;
}

/** 原 M1t（196693）：模型引用等价（供应商 ∧ 模型 id；原用 Mg 解析，恒非空） */
export function isSameModelRef(value: string, ref: { providerId?: string; modelId?: string }): boolean {
  const parsed = parseModelRef(value);
  return parsed.providerId === ref.providerId && parsed.modelId === ref.modelId;
}

export interface ThoughtLevelResolution {
  kind: "supported" | "unsupported" | "unknown";
  option: ConfigOption | null;
}

/** 原 N1t（196697）：思考级别选项解析（工作区域走配置项；无工作区走供应商模型表） */
export function resolveThoughtLevelOption(args: {
  hasWorkspace: boolean;
  model: string | undefined;
  modelProviders: Array<{ id: string; [key: string]: unknown }>;
  modelProvidersLoading: boolean;
  thoughtLevel?: string;
  workspaceConfigOptions: ConfigOption[];
  workspaceConfigStatus: string;
}): ThoughtLevelResolution {
  const model = normalizeSelectedModel(args.model);
  if (!model) return { kind: "unsupported", option: null };
  const parsed = parseModelRef(model);
  const thoughtLevel = args.thoughtLevel?.trim();
  if (args.hasWorkspace) {
    if (args.workspaceConfigStatus !== "ready") return { kind: "unknown", option: null };
    const modelOption = args.workspaceConfigOptions
      .find((option) => option.type === "select" && (option.category === "model" || option.id === "model"))
      ?.options?.find((option) => isSameModelRef(option.value, parsed));
    const levels = (modelOption as { modelThoughtLevels?: string[] } | undefined)?.modelThoughtLevels;
    if (levels === undefined) return { kind: "unknown", option: null };
    if (levels.length === 0) return { kind: "unsupported", option: null };
    const defaultLevel = (modelOption as { modelDefaultThoughtLevel?: string } | undefined)?.modelDefaultThoughtLevel;
    const current = defaultLevel && levels.includes(defaultLevel) ? defaultLevel : levels[0];
    return {
      kind: "supported",
      option: {
        id: "thought_level",
        name: "Thought Level",
        category: "thought_level",
        type: "select",
        currentValue: thoughtLevel ?? current,
        options: levels.map((level) => ({ value: level, name: level })),
      },
    };
  }
  if (args.modelProvidersLoading) return { kind: "unknown", option: null };
  const providerOption = resolveProviderThoughtOption(args.modelProviders, parsed.providerId, parsed.modelId);
  return providerOption
    ? { kind: "supported", option: thoughtLevel ? { ...providerOption, currentValue: thoughtLevel } : providerOption }
    : { kind: "unsupported", option: null };
}

/** F12 域助手（原 zrt，89174；接口级）：供应商模型 → 思考级别选项 */
declare function resolveProviderThoughtOption(
  providers: Array<{ id: string; [key: string]: unknown }>,
  providerId: string | undefined,
  modelId: string | undefined,
): ConfigOption | null;

/** 原 P1t（196730）：思考级别可用性（未知态恒可；选项集成员判定） */
export function isThoughtLevelAvailable(resolution: ThoughtLevelResolution, thoughtLevel: string | undefined): boolean {
  const normalized = thoughtLevel?.trim();
  return !normalized || resolution.kind === "unknown"
    ? true
    : !!(resolution.option?.type === "select" && resolution.option.options?.some((option) => option.value === normalized));
}

/** 原 Z7（196736）：模型在组内可用（继承/加载中恒真） */
export function isModelAvailableInGroups(groups: SelectGroupEntry[], model: string | null | undefined, loading = false): boolean {
  const normalized = model?.trim();
  return !normalized || normalized === SUBAGENT_MODEL_INHERIT || loading ? true : groups.some((group) => group.items.some((item) => item.value === normalized));
}

export interface SubagentFormDraft {
  name: string;
  description: string;
  color: string;
  model: string;
  thoughtLevel?: string;
  injectAgentsMd: boolean;
  inheritAllTools: boolean;
  selectedTools: string[];
  preservedTools: string[];
  systemPrompt: string;
}

/** 原 Q7（196740）：表单草稿（缺省：黄/inherit/注入 AGENTS.md/全工具） */
export function subagentFormDraftOf(initial: SubagentItem | undefined): SubagentFormDraft {
  return {
    name: initial?.name ?? "",
    description: initial?.description ?? "",
    color: initial?.color ?? "yellow",
    model: initial?.model?.trim() || SUBAGENT_MODEL_INHERIT,
    thoughtLevel: initial?.thoughtLevel?.trim() || undefined,
    injectAgentsMd: initial?.injectAgentsMd ?? true,
    inheritAllTools: initial?.tools === undefined || initial.tools.length === 0,
    selectedTools: filterKnownTools(initial?.tools),
    preservedTools: filterPreservedTools(initial?.tools),
    systemPrompt: initial?.systemPrompt ?? "",
  };
}

/** 原 F1t（196754）：表单键（id + 草稿序列化；重置侦测用） */
export function subagentFormKeyOf(initial: SubagentItem | undefined): string {
  return JSON.stringify({ id: initial?.id ?? null, ...subagentFormDraftOf(initial) });
}

/** 原 $7（196757）：模型触发器标签（inherit/可用/不可用三支） */
export function resolveModelTriggerLabel(args: {
  inheritLabel: string;
  modelGroups: SelectGroupEntry[];
  model: string | null | undefined;
  modelProvidersLoading: boolean;
  selectModelLabel: string;
}): string {
  const normalized = args.model?.trim();
  return !normalized || normalized === SUBAGENT_MODEL_INHERIT
    ? args.inheritLabel
    : isModelAvailableInGroups(args.modelGroups, normalized, args.modelProvidersLoading)
      ? findModelGroupItemLabel(args.modelGroups, normalized) ?? normalized
      : args.selectModelLabel;
}

/** 组内条目标签查找（原 w6e，F08 域；接口级） */
declare function findModelGroupItemLabel(groups: SelectGroupEntry[], value: string): string | null;

/** 原 dr（src chunk Jx，9036；Wx 别名→规范供应商表，9025）：已知供应商别名解析 */
declare function canonicalProviderIdOf(providerId: string): string | null;

/** 原 rN（styles jsx 48436）：供应商前缀模型名——已知别名供应商不加前缀，否则 `供应商名/模型名` */
function composeProviderModelLabel(providerId: string | null | undefined, providerName: string | null | undefined, modelName: string | undefined): string | undefined {
  if (providerId && canonicalProviderIdOf(providerId)) return modelName;
  const trimmedName = providerName?.trim();
  return trimmedName ? `${trimmedName}/${modelName}` : modelName;
}

/** 原 iN（styles jsx 48441 = js 53795）：规范值全标签——组内命中走 rN 拼接，未命中回退。
 * A1-R11 补 export：R0 簇 51141–53795 之 resolveModelGroupLabel（iN）双实例收敛属主——
 * AutomationEditor 1015 消费面改指本函数（别名保留 resolveModelGroupLabel，调用点逐字不变）。 */
export function resolveModelFullLabel(args: {
  modelGroups: SelectGroupEntry[];
  normalizedValue: string;
  fallbackLabel: string;
  providerId?: string | null;
  providerName?: string | null;
}): string | undefined {
  const group = args.modelGroups.find((entry) => entry.items.some((item) => item.value === args.normalizedValue));
  const item = group?.items.find((entry) => entry.value === args.normalizedValue);
  return !group || !item ? args.fallbackLabel : composeProviderModelLabel(args.providerId, args.providerName, item.name);
}

/** 原 nWe（styles jsx 48452）：composer 模型触发器标签三元面（PaymentDeep ModelSelectMenu 消费） */
export function resolveModelTriggerLabelParts(args: {
  modelGroups: SelectGroupEntry[];
  normalizedValue: string;
  fallbackLabel: string;
  providerId?: string | null;
  providerName?: string | null;
}): { fullLabel: string | undefined; providerPrefix?: string; modelLabel: string | undefined } {
  const fullLabel = resolveModelFullLabel(args);
  const group = args.modelGroups.find((entry) => entry.items.some((item) => item.value === args.normalizedValue));
  const item = group?.items.find((entry) => entry.value === args.normalizedValue);
  if (!group || !item) return { fullLabel: fullLabel, modelLabel: args.fallbackLabel };
  const modelLabel = item.name;
  const providerName = args.providerName?.trim();
  return !providerName || (args.providerId && canonicalProviderIdOf(args.providerId))
    ? { fullLabel: fullLabel, modelLabel: modelLabel }
    : { fullLabel: fullLabel, providerPrefix: `${providerName}/`, modelLabel: modelLabel };
}

/** 原 e9（196765）：表单标签 */
export function SubagentFormLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-ui-base font-medium text-foreground-subtle">{children}</label>;
}

/** 原 I1t（196771）：颜色点 */
export function SubagentColorDot({ color }: { color?: string }) {
  return (
    <span
      className={cn("inline-flex size-2 shrink-0 rounded-full", color ? SUBAGENT_COLOR_CLASSES[color] : "bg-foreground-subtlest")}
      aria-hidden="true"
    />
  );
}

/** 原 t9（196777）：次级徽章 */
export function SubagentBadge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex min-h-5 items-center rounded-md bg-secondary px-1.5 py-0.5 text-ui-base font-medium text-foreground-subtle",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** 原 L1t（196786）：三组分组（user/plugin/builtIn） */
export function groupSubagents(agents: SubagentItem[]): { user: SubagentItem[]; plugin: SubagentItem[]; builtIn: SubagentItem[] } {
  const groups: { user: SubagentItem[]; plugin: SubagentItem[]; builtIn: SubagentItem[] } = { builtIn: [], plugin: [], user: [] };
  for (const agent of agents) {
    if (isUserManagedSubagent(agent)) groups.user.push(agent);
    else if (agent.source === "plugin") groups.plugin.push(agent);
    else groups.builtIn.push(agent);
  }
  return groups;
}

/** 原 R1t（196792）：作用域 i18n key */
export function subagentScopeI18nId(agent: SubagentItem): string {
  return agent.scope === "built-in"
    ? "settings.subagents.scope.builtIn"
    : agent.scope === "workspace"
      ? "settings.subagents.scope.workspace"
      : agent.source === "plugin"
        ? "settings.subagents.scope.plugin"
        : "settings.scope.user";
}

/** 原 z1t（196801）：工具复选行（自绘 checkbox；高关注工具红点） */
export function ToolCheckboxRow({
  checked,
  disabled,
  label,
  onToggle,
}: {
  checked: boolean;
  disabled: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        "flex min-w-0 items-center gap-3 rounded-md px-2 py-2 text-left transition-colors",
        disabled ? "cursor-not-allowed opacity-60" : "hover:bg-surface-hover",
      )}
    >
      <span className="flex size-6 shrink-0 items-center justify-center" aria-hidden="true">
        <span
          className={cn(
            "flex size-4 items-center justify-center rounded-sm border transition-colors",
            checked ? "border-primary bg-primary text-primary-foreground" : "border-input-border bg-input text-transparent",
          )}
        >
          <IconCheck className="size-3.5" />
        </span>
      </span>
      <span className="min-w-0 flex-1 truncate text-ui-base font-medium text-foreground">{label}</span>
      {SUBAGENT_ATTENTION_TOOLS.has(label) ? (
        <span className="size-1.5 shrink-0 rounded-full bg-destructive" aria-hidden="true" />
      ) : null}
    </button>
  );
}

/** 原 Mg（24358，模型域；接口级）：模型引用解析（Zn custom: 前缀 → providerId/modelId；否则按 `/` 拆分，`$` 变体） */
declare function parseModelRef(value: string): { providerId?: string; modelId?: string; variant?: string };

export interface ModelProvider {
  id: string;
  name?: string;
  source?: string;
  [key: string]: unknown;
}

/**
 * 原 n9（196839）：SubagentRow。
 * 头像（颜色点）+ 名称/作用域/模型/工具徽章 + 描述 + 路径；
 * 内置行 → B1t 覆盖控件；用户行 → 开关/编辑/删除。
 */
export function SubagentRow({
  agent,
  hasWorkspace,
  isOperating,
  modelGroups,
  modelProviders,
  modelProvidersLoading,
  modelSelectGroups,
  onBuiltInModelChange,
  onDelete,
  onEdit,
  onToggle,
  workspaceConfigOptions,
  workspaceConfigStatus,
}: {
  agent: SubagentItem;
  hasWorkspace: boolean;
  isOperating: boolean;
  modelGroups: SelectGroupEntry[];
  modelProviders: ModelProvider[];
  modelProvidersLoading: boolean;
  modelSelectGroups: SelectGroupEntry[];
  onBuiltInModelChange: (agent: SubagentItem, override: { model?: string | null; thoughtLevel?: string | null }) => Promise<void>;
  onDelete: (agent: SubagentItem) => Promise<void>;
  onEdit: (agent: SubagentItem) => void;
  onToggle: (agent: SubagentItem, enabled: boolean) => Promise<void>;
  workspaceConfigOptions: ConfigOption[];
  workspaceConfigStatus: string;
}) {
  const { intl } = useIntlContext();
  const userManaged = isUserManagedSubagent(agent);
  const builtInName = builtInSubagentName(agent);
  const notBuiltIn = !isBuiltInSubagent(agent);
  const inheritLabel = intl.formatMessage({ id: "settings.subagents.model.inherit" });
  const selectModelLabel = intl.formatMessage({ id: "settings.subagents.model.select" });
  const modelLabel = resolveModelTriggerLabel({
    inheritLabel,
    modelGroups: modelSelectGroups,
    model: agent.model,
    modelProvidersLoading,
    selectModelLabel,
  });
  const toolCount = agent.tools?.length ?? 0;
  const toolsLabel = isInheritAllTools(agent.tools)
    ? intl.formatMessage({ id: "settings.subagents.tools.all" })
    : intl.formatMessage({ id: "settings.subagents.toolsCount" }, { count: String(toolCount) });
  return (
    <div
      data-testid={testidTemplate(TESTID_SUBAGENT_ROW, agent.name)}
      className={cn(
        "grid items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-hover",
        builtInName
          ? "grid-cols-[auto_minmax(0,1fr)] sm:grid-cols-[auto_minmax(0,1fr)_auto]"
          : "grid-cols-[auto_minmax(0,1fr)_auto]",
      )}
    >
      <div className="relative flex size-8 shrink-0 items-center justify-center rounded-full border border-border text-foreground-subtle" aria-hidden="true">
        <IconUsers className="size-4" />
        {agent.color ? (
          <span className="absolute -bottom-1 -right-1 inline-flex size-3.5 items-center justify-center rounded-full border border-card bg-card p-px leading-none">
            <SubagentColorDot color={agent.color} />
          </span>
        ) : null}
      </div>
      <div className="min-w-0">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="truncate text-ui-base font-medium text-foreground">{agent.name}</span>
          <SubagentBadge>{intl.formatMessage({ id: subagentScopeI18nId(agent) })}</SubagentBadge>
          {notBuiltIn ? <SubagentBadge>{modelLabel}</SubagentBadge> : null}
          <SubagentBadge>{toolsLabel}</SubagentBadge>
        </div>
        <p className="mt-0.5 line-clamp-2 text-ui-base text-foreground-subtle">
          {agent.description || intl.formatMessage({ id: "settings.subagents.noDescription" })}
        </p>
        {agent.path ? <p className="mt-0.5 truncate font-mono text-ui-base text-foreground-subtlest">{agent.path}</p> : null}
      </div>
      <div className={cn("flex items-center gap-2", builtInName ? "col-span-2 min-w-0 justify-end sm:col-span-1 sm:shrink-0" : "shrink-0")}>
        {builtInName ? (
          <BuiltInModelOverrideControl
            agent={agent}
            disabled={isOperating}
            hasWorkspace={hasWorkspace}
            modelGroups={modelGroups}
            modelProviders={modelProviders}
            modelProvidersLoading={modelProvidersLoading}
            onBuiltInModelChange={onBuiltInModelChange}
            workspaceConfigOptions={workspaceConfigOptions}
            workspaceConfigStatus={workspaceConfigStatus}
          />
        ) : null}
        {userManaged ? (
          <Switch
            checked={agent.enabled}
            onCheckedChange={(checked) => void onToggle(agent, checked)}
            disabled={isOperating}
            aria-label={intl.formatMessage({ id: "settings.subagents.toggleAria" }, { name: agent.name })}
          />
        ) : null}
        <div className="flex items-center gap-1">
          {userManaged ? (
            <Button type="button" variant="ghost" size="icon-md" onClick={() => onEdit(agent)} disabled={isOperating} title={intl.formatMessage({ id: "settings.subagents.edit" })}>
              <IconPencil className="size-3.5" aria-hidden="true" />
            </Button>
          ) : null}
          {userManaged ? (
            <Button type="button" variant="ghost" size="icon-md" onClick={() => void onDelete(agent)} disabled={isOperating} title={intl.formatMessage({ id: "common.delete" })}>
              <IconTrash className="size-3.5" aria-hidden="true" />
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（1）：IconUsers → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */

/**
 * 原 B1t（196982）：内置代理模型覆盖控件。
 * 乐观更新（失败回滚）+ 模型/思考双选择 + 思考不可用红字。
 */
export function BuiltInModelOverrideControl({
  agent,
  disabled,
  hasWorkspace,
  modelGroups,
  modelProviders,
  modelProvidersLoading,
  onBuiltInModelChange,
  workspaceConfigOptions,
  workspaceConfigStatus,
}: {
  agent: SubagentItem;
  disabled: boolean;
  hasWorkspace: boolean;
  modelGroups: SelectGroupEntry[];
  modelProviders: ModelProvider[];
  modelProvidersLoading: boolean;
  onBuiltInModelChange: (agent: SubagentItem, override: { model?: string | null; thoughtLevel?: string | null }) => Promise<void>;
  workspaceConfigOptions: ConfigOption[];
  workspaceConfigStatus: string;
}) {
  const { intl } = useIntlContext();
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [override, setOverride] = React.useState<{ model?: string; thoughtLevel?: string }>(() => ({
    model: agent.modelOverride?.trim() || undefined,
    thoughtLevel: agent.thoughtLevelOverride?.trim() || undefined,
  }));
  const defaultMainLabel = intl.formatMessage({ id: "settings.subagents.model.defaultMain" });
  const selectModelLabel = intl.formatMessage({ id: "settings.subagents.model.select" });
  const currentModel = override.model ?? SUBAGENT_MODEL_INHERIT;
  const resolution = resolveThoughtLevelOption({
    hasWorkspace,
    model: currentModel,
    modelProviders,
    modelProvidersLoading,
    thoughtLevel: override.thoughtLevel,
    workspaceConfigOptions,
    workspaceConfigStatus,
  });
  const thoughtOption = resolution.option;
  const modelGroup = findModelGroupEntry(modelGroups, currentModel, modelProvidersLoading);
  const thoughtUnavailable = !!(override.thoughtLevel && modelGroup && !isThoughtLevelAvailable(resolution, override.thoughtLevel));
  const triggerLabel =
    currentModel === SUBAGENT_MODEL_INHERIT
      ? defaultMainLabel
      : resolveModelTriggerLabel({ inheritLabel: defaultMainLabel, modelGroups, model: currentModel, modelProvidersLoading, selectModelLabel });
  React.useEffect(() => {
    setOverride({
      model: agent.modelOverride?.trim() || undefined,
      thoughtLevel: agent.thoughtLevelOverride?.trim() || undefined,
    });
  }, [agent.modelOverride, agent.thoughtLevelOverride]);
  const applyOverride = React.useCallback(
    async (next: { model?: string; thoughtLevel?: string }) => {
      if (saving) return;
      const previous = override;
      setOverride(next);
      setSaving(true);
      try {
        await onBuiltInModelChange(agent, next);
      } catch {
        setOverride(previous);
      } finally {
        setSaving(false);
      }
    },
    [agent, override, onBuiltInModelChange, saving],
  );
  const handleModelChange = React.useCallback(
    (value: string) => {
      const next = value === SUBAGENT_MODEL_INHERIT ? undefined : value;
      if (next !== override.model) applyOverride({ model: next, thoughtLevel: undefined });
    },
    [override.model, applyOverride],
  );
  const footerActions = React.useMemo(
    () => [
      {
        key: "subagent-model:built-in-default",
        label: defaultMainLabel,
        onSelect: () => handleModelChange(SUBAGENT_MODEL_INHERIT),
        selected: currentModel === SUBAGENT_MODEL_INHERIT,
      },
    ],
    [defaultMainLabel, handleModelChange, currentModel],
  );
  return (
    <div className="flex min-w-0 max-w-full flex-col items-end gap-1">
      <div className="flex min-w-0 max-w-full flex-wrap items-center justify-end gap-2">
        <span data-testid={testidTemplate(TESTID_SUBAGENT_MODEL, agent.name)} data-model-current-value={currentModel} className="inline-flex min-w-0">
          <ModelSelector
            modelGroups={modelGroups as ModelGroup[]}
            normalizedValue={currentModel}
            triggerLabel={triggerLabel}
            showManageModelsAction={false}
            lockReasonMessage=""
            isItemLocked={subagentModelNeverLocked}
            onValueChange={handleModelChange}
            footerActions={footerActions}
            manageModelsLabel={intl.formatMessage({ id: "chat.toolbar.model.manageModels" })}
            contentSide="top"
            contentAlign="end"
            focusSelectorOnClose={null}
            labelVisibilityClassName="inline-flex min-w-0"
            triggerClassName="h-8 w-fit max-w-52 min-w-0 justify-between rounded-lg border border-input-border bg-input px-3 py-1.5 text-foreground hover:border-input-border-hover hover:bg-input focus-visible:border-input-border-focused focus-visible:bg-input-focused"
            triggerLabelClassName="inline-flex min-w-0 truncate text-left"
            disabled={disabled || saving}
          />
        </span>
        {thoughtOption ? (
          <ThoughtLevelSelector
            intl={intl}
            option={thoughtOption}
            provider="glm"
            showInvalidCurrentValue
            disabled={disabled || saving}
            triggerRef={triggerRef}
            restoreFocusSelector={null}
            labelVisibilityClassName="hidden sm:inline-flex"
            triggerClassName="h-8 rounded-lg border border-input-border bg-input px-2 py-1.5 text-foreground hover:border-input-border-hover hover:bg-input"
            onValueChange={(value) => {
              if (value !== override.thoughtLevel) applyOverride({ model: override.model, thoughtLevel: value });
            }}
          />
        ) : null}
      </div>
      {thoughtUnavailable ? (
        <span className="text-ui-sm text-destructive">
          {intl.formatMessage({ id: "settings.subagents.form.validation.thoughtLevelUnavailable" })}
        </span>
      ) : null}
    </div>
  );
}

/** 原 Z7 消费助手：按值查找组条目（返回条目供思考联动） */
function findModelGroupEntry(groups: SelectGroupEntry[], value: string, loading: boolean): SelectItemEntry | null {
  if (!isModelAvailableInGroups(groups, value, loading)) return null;
  for (const group of groups) {
    const item = group.items.find((entry) => entry.value === value);
    if (item) return item;
  }
  return null;
}

/**
 * 原 V1t（197122）：SubagentConfigForm。
 * 名称/颜色/模型/描述/工具/系统提示词/AGENTS.md 注入；校验四段（名 3–50 英数横线、描述、提示词、模型可用）。
 */
export function SubagentConfigForm({
  hasWorkspace,
  initial,
  modelProviders,
  modelProvidersLoading,
  modelSelectGroups,
  onManageModels,
  saving,
  onCancel,
  onDelete,
  onSave,
  workspaceConfigOptions,
  workspaceConfigStatus,
}: {
  hasWorkspace: boolean;
  initial?: SubagentItem;
  modelProviders: ModelProvider[];
  modelProvidersLoading: boolean;
  modelSelectGroups: SelectGroupEntry[];
  onManageModels?: () => void;
  saving: boolean;
  onCancel: () => void;
  onDelete: (agent: SubagentItem) => Promise<void>;
  onSave: (config: Record<string, unknown>) => Promise<void>;
  workspaceConfigOptions: ConfigOption[];
  workspaceConfigStatus: string;
}) {
  const { intl } = useIntlContext();
  const formKey = subagentFormKeyOf(initial);
  const draft = React.useMemo(() => subagentFormDraftOf(initial), [initial, formKey]);
  const lastFormKey = React.useRef(formKey);
  const [name, setName] = React.useState(draft.name);
  const [description, setDescription] = React.useState(draft.description);
  const [color, setColor] = React.useState(draft.color);
  const [model, setModel] = React.useState(draft.model);
  const [thoughtLevel, setThoughtLevel] = React.useState<string | undefined>(draft.thoughtLevel);
  const [injectAgentsMd, setInjectAgentsMd] = React.useState(draft.injectAgentsMd);
  const [inheritAllTools, setInheritAllTools] = React.useState(draft.inheritAllTools);
  const [selectedTools, setSelectedTools] = React.useState(draft.selectedTools);
  const [systemPrompt, setSystemPrompt] = React.useState(draft.systemPrompt);
  const [nameError, setNameError] = React.useState<string | null>(null);
  const [descriptionError, setDescriptionError] = React.useState<string | null>(null);
  const [promptError, setPromptError] = React.useState<string | null>(null);
  const [modelError, setModelError] = React.useState<string | null>(null);
  const inheritLabel = intl.formatMessage({ id: "settings.subagents.model.inherit" });
  const selectModelLabel = intl.formatMessage({ id: "settings.subagents.model.select" });
  const handleModelChange = React.useCallback(
    (value: string) => {
      if (value !== model) {
        setModel(value);
        setThoughtLevel(undefined);
        setModelError(null);
      }
    },
    [model],
  );
  const triggerLabel = resolveModelTriggerLabel({
    inheritLabel,
    modelGroups: modelSelectGroups,
    model,
    modelProvidersLoading,
    selectModelLabel,
  });
  const footerActions = React.useMemo(
    () => [{ key: "subagent-model:inherit", label: inheritLabel, onSelect: () => handleModelChange(SUBAGENT_MODEL_INHERIT), selected: model === SUBAGENT_MODEL_INHERIT }],
    [handleModelChange, inheritLabel, model],
  );
  const selectedModel = normalizeSelectedModel(model);
  const modelGroup = findModelGroupEntry(modelSelectGroups, model, modelProvidersLoading);
  const resolution = resolveThoughtLevelOption({
    hasWorkspace,
    model,
    modelProviders,
    modelProvidersLoading,
    thoughtLevel,
    workspaceConfigOptions,
    workspaceConfigStatus,
  });
  const thoughtOption = resolution.option;
  const thoughtUnavailable = !!(selectedModel && thoughtLevel && modelGroup && !isThoughtLevelAvailable(resolution, thoughtLevel));
  const colorIndex = Math.max(0, SUBAGENT_COLORS.indexOf(color as (typeof SUBAGENT_COLORS)[number]));
  const thoughtTriggerRef = React.useRef<HTMLButtonElement | null>(null);
  React.useEffect(() => {
    if (lastFormKey.current === formKey) return;
    lastFormKey.current = formKey;
    const next = subagentFormDraftOf(initial);
    setName(next.name);
    setDescription(next.description);
    setColor(next.color);
    setModel(next.model);
    setThoughtLevel(next.thoughtLevel);
    setInjectAgentsMd(next.injectAgentsMd);
    setInheritAllTools(next.inheritAllTools);
    setSelectedTools(next.selectedTools);
    setSystemPrompt(next.systemPrompt);
    setNameError(null);
    setDescriptionError(null);
    setPromptError(null);
    setModelError(null);
  }, [initial, formKey]);
  const validate = (): boolean => {
    const trimmedName = name.trim();
    let valid = true;
    if (trimmedName.length < 3 || trimmedName.length > 50) {
      setNameError(intl.formatMessage({ id: "settings.subagents.form.validation.nameLength" }, { min: "3", max: "50" }));
      valid = false;
    } else if (/^[a-zA-Z0-9-]+$/u.test(trimmedName)) {
      setNameError(null);
    } else {
      setNameError(intl.formatMessage({ id: "settings.subagents.form.validation.nameCharacters" }));
      valid = false;
    }
    if (description.trim()) setDescriptionError(null);
    else {
      setDescriptionError(intl.formatMessage({ id: "settings.subagents.form.validation.descriptionRequired" }));
      valid = false;
    }
    if (systemPrompt.trim()) setPromptError(null);
    else {
      setPromptError(intl.formatMessage({ id: "settings.subagents.form.validation.promptRequired" }));
      valid = false;
    }
    if (isModelAvailableInGroups(modelSelectGroups, model, modelProvidersLoading)) setModelError(null);
    else {
      setModelError(intl.formatMessage({ id: "settings.subagents.form.validation.modelUnavailable" }));
      valid = false;
    }
    if (thoughtUnavailable) valid = false;
    return valid;
  };
  const toggleTool = (tool: string) => {
    setInheritAllTools(false);
    setSelectedTools((previous) => (previous.includes(tool) ? previous.filter((entry) => entry !== tool) : [...previous, tool]));
  };
  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        if (!validate()) return;
        await onSave({
          name: name.trim(),
          description: description.trim(),
          systemPrompt: systemPrompt.trim(),
          color,
          injectAgentsMd,
          ...(selectedModel ? { model: selectedModel } : {}),
          ...(selectedModel && thoughtLevel ? { thoughtLevel: thoughtLevel.trim() } : {}),
          tools: inheritAllTools ? undefined : mergeToolSelections(selectedTools, draft.preservedTools),
          disallowedTools: initial?.disallowedTools,
          skills: initial?.skills,
          permissionMode: initial?.permissionMode,
          ...(initial?.maxTurns ? { maxTurns: initial.maxTurns } : {}),
          ...(initial?.background === undefined ? {} : { background: initial.background }),
          mcpServers: initial?.mcpServers,
        });
      }}
      className="space-y-3 rounded-xl border border-border p-4"
    >
      <div className="grid gap-3 md:grid-cols-[minmax(12rem,14rem)_auto_minmax(0,1fr)] md:items-start">
        <div className="space-y-1.5">
          <SubagentFormLabel>{intl.formatMessage({ id: "settings.subagents.form.name.label" })}</SubagentFormLabel>
          <Input
            type="text"
            size="lg"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={intl.formatMessage({ id: "settings.subagents.form.name.placeholder" })}
          />
          {nameError ? <p className="text-ui-base text-destructive">{nameError}</p> : null}
        </div>
        <div className="space-y-1.5">
          <SubagentFormLabel>{intl.formatMessage({ id: "settings.subagents.form.color.label" })}</SubagentFormLabel>
          <div role="radiogroup" className="relative inline-grid w-56 grid-cols-8 rounded-lg border border-input-border bg-input p-1">
            <span
              className="pointer-events-none absolute top-1 size-6 rounded-full border border-border-hover bg-surface shadow-xs transition-[left]"
              style={{ left: `calc(0.25rem + ((100% - 0.5rem) / ${SUBAGENT_COLORS.length}) * ${colorIndex})` }}
              aria-hidden="true"
            />
            {SUBAGENT_COLORS.map((entry) => (
              <button
                key={entry}
                type="button"
                role="radio"
                aria-checked={color === entry}
                aria-label={intl.formatMessage({ id: `settings.subagents.color.${entry}` })}
                className="relative z-10 flex size-6 items-center justify-center rounded-full outline-none transition-colors hover:bg-hover focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => setColor(entry)}
              >
                <span className={cn("size-3.5 rounded-full", SUBAGENT_COLOR_CLASSES[entry])} />
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <SubagentFormLabel>{intl.formatMessage({ id: "settings.subagents.form.model.label" })}</SubagentFormLabel>
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <ModelSelector
              modelGroups={modelSelectGroups as ModelGroup[]}
              normalizedValue={model}
              triggerLabel={triggerLabel}
              showManageModelsAction={!!onManageModels}
              lockReasonMessage=""
              isItemLocked={subagentModelNeverLocked}
              onValueChange={handleModelChange}
              footerActions={footerActions}
              manageModelsLabel={intl.formatMessage({ id: "chat.toolbar.model.manageModels" })}
              onManageModels={onManageModels}
              contentSide="bottom"
              focusSelectorOnClose={null}
              labelVisibilityClassName="inline-flex min-w-0"
              triggerClassName="h-8 w-fit max-w-full min-w-0 justify-between rounded-lg border border-input-border bg-input bg-clip-border px-3 py-1.5 text-foreground hover:border-input-border-hover hover:bg-input focus-visible:border-input-border-focused focus-visible:bg-input-focused"
              triggerLabelClassName="inline-flex min-w-0 truncate text-left"
            />
            {thoughtOption ? (
              <ThoughtLevelSelector
                intl={intl}
                option={thoughtOption}
                provider="glm"
                showInvalidCurrentValue
                disabled={saving}
                triggerRef={thoughtTriggerRef}
                restoreFocusSelector={null}
                labelVisibilityClassName="inline-flex min-w-0"
                triggerClassName="h-8 rounded-lg border border-input-border bg-input px-2 py-1.5 text-foreground hover:border-input-border-hover hover:bg-input"
                onValueChange={setThoughtLevel}
              />
            ) : null}
          </div>
          {modelError ? <p className="text-ui-base text-destructive">{modelError}</p> : null}
          {thoughtUnavailable ? (
            <p className="text-ui-base text-destructive">
              {intl.formatMessage({ id: "settings.subagents.form.validation.thoughtLevelUnavailable" })}
            </p>
          ) : null}
        </div>
      </div>
      <div className="space-y-1.5">
        <SubagentFormLabel>{intl.formatMessage({ id: "settings.subagents.form.description.label" })}</SubagentFormLabel>
        <Input
          type="text"
          size="lg"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder={intl.formatMessage({ id: "settings.subagents.form.description.placeholder" })}
        />
        {descriptionError ? <p className="text-ui-base text-destructive">{descriptionError}</p> : null}
      </div>
      <div className="space-y-2 pt-1">
        <SubagentFormLabel>{intl.formatMessage({ id: "settings.subagents.form.tools.label" })}</SubagentFormLabel>
        <div className="flex min-w-0 items-center gap-2">
          <Select
            value={inheritAllTools ? "all" : "custom"}
            onValueChange={(value) => {
              const all = value === "all";
              setInheritAllTools(all);
              if (!all && selectedTools.length === 0) setSelectedTools([...SUBAGENT_TOOL_OPTIONS]);
            }}
          >
            <SelectTrigger size="lg" className="w-fit justify-between">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{intl.formatMessage({ id: "settings.subagents.form.tools.mode.all" })}</SelectItem>
              <SelectItem value="custom">{intl.formatMessage({ id: "settings.subagents.form.tools.mode.custom" })}</SelectItem>
            </SelectContent>
          </Select>
          <span className="min-w-0 text-ui-base font-normal text-foreground-subtle">
            {intl.formatMessage({ id: "settings.subagents.form.tools.card.title" })}
          </span>
        </div>
        {inheritAllTools ? null : (
          <div className="rounded-lg border border-border bg-card p-1">
            <div className="grid max-h-72 gap-1 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
              {SUBAGENT_TOOL_OPTIONS.map((tool) => (
                <ToolCheckboxRow key={tool} checked={selectedTools.includes(tool)} disabled={false} label={tool} onToggle={() => toggleTool(tool)} />
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="space-y-1.5">
        <SubagentFormLabel>{intl.formatMessage({ id: "settings.subagents.form.systemPrompt.label" })}</SubagentFormLabel>
        <textarea
          value={systemPrompt}
          onChange={(event) => setSystemPrompt(event.target.value)}
          rows={3}
          className="max-h-56 min-h-16 resize-y overflow-y-auto text-ui-base w-full rounded-lg border border-input-border bg-input p-2 text-foreground placeholder:text-ui-base placeholder:text-foreground-subtlest focus-visible:border-input-border-focused focus-visible:bg-input-focused"
          placeholder={intl.formatMessage({ id: "settings.subagents.form.systemPrompt.placeholder" })}
        />
        {promptError ? <p className="text-ui-base text-destructive">{promptError}</p> : null}
      </div>
      <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-3 py-2.5">
        <p className="min-w-0 text-ui-base font-medium text-foreground">
          {intl.formatMessage({ id: "settings.subagents.form.injectAgentsMd.label" })}
        </p>
        <Switch checked={injectAgentsMd} onCheckedChange={setInjectAgentsMd} aria-label={intl.formatMessage({ id: "settings.subagents.form.injectAgentsMd.label" })} />
      </div>
      {initial ? null : (
        <div className="flex items-start gap-1.5 text-ui-base leading-6 text-foreground">
          <IconInfo className="mt-1 size-3.5 shrink-0" aria-hidden="true" />
          <span>{intl.formatMessage({ id: "settings.subagents.workspaceScopeUnsupported" })}</span>
        </div>
      )}
      <div className={cn("flex flex-wrap items-center gap-2 pt-1", initial && "justify-between gap-3")}>
        {initial && onDelete ? (
          <Button
            type="button"
            variant="link"
            size="lg"
            className="px-0 text-destructive hover:text-destructive"
            onClick={() => void onDelete(initial)}
            disabled={saving}
          >
            <IconTrash className="size-3.5" aria-hidden="true" />
            {intl.formatMessage({ id: "common.delete" })}
          </Button>
        ) : null}
        <div className="flex items-center gap-2">
          <Button type="submit" variant="default" size="lg" disabled={saving}>
            {saving ? intl.formatMessage({ id: "common.saving" }) : intl.formatMessage({ id: "common.save" })}
          </Button>
          <Button type="button" variant="ghost" size="lg" onClick={onCancel} disabled={saving}>
            {intl.formatMessage({ id: "common.cancel" })}
          </Button>
        </div>
      </div>
    </form>
  );
}
