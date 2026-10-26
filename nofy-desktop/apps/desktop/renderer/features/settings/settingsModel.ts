import { tr } from "../../ui/i18n.ts";
/**
 * 设置面纯模型。分区是否出现只看已接受的 ACP 方法、原生模型 JSON、本窗口偏好或只读清单。
 * Codex 分组保留基础 / 智能体能力 / 数据与统计。没有接受方法的页不进导航。
 */
import type { PluginRow } from "../../ui/readers.ts";

export type SettingsSectionId = "general" | "appearance" | "models" | "plugins" | "skills" | "mcp" | "hooks" | "usage";

export type SettingsSectionDef = { id: SettingsSectionId; label: string };

export type SettingsGroupDef = { id: string; label: string; sections: SettingsSectionDef[] };

/** Generated ACP names. Optional writes stay out of ACCEPTED_SETTINGS_METHODS until a probe accepts them. */
export const SETTINGS_METHODS = {
  pluginsList: "_nofy/plugins/list",
  pluginsAction: "_nofy/plugins/action",
  skillsList: "_nofy/skills/list",
  skillsToggle: "_nofy/skills/toggle",
  skillsAdd: "_nofy/skills/add",
  skillsRemove: "_nofy/skills/remove",
  skillsConfig: "_nofy/skills/config",
  skillsReset: "_nofy/skills/reset",
  mcpList: "_nofy/mcp/list",
  mcpUpsert: "_nofy/mcp/upsert",
  mcpToggle: "_nofy/mcp/toggle",
  mcpDelete: "_nofy/mcp/delete",
  mcpSetup: "_nofy/mcp/setup",
  mcpAuthTrigger: "_nofy/mcp/auth_trigger",
  mcpToggleTool: "_nofy/mcp/toggle_tool",
  hooksList: "_nofy/hooks/list",
  hooksAction: "_nofy/hooks/action",
} as const;

/** 2026-10-08 write probe plus the skill toggle and list methods the sheet already calls. */
export const ACCEPTED_SETTINGS_METHODS: ReadonlySet<string> = new Set([
  SETTINGS_METHODS.pluginsList,
  SETTINGS_METHODS.pluginsAction,
  SETTINGS_METHODS.skillsList,
  SETTINGS_METHODS.skillsToggle,
  SETTINGS_METHODS.mcpList,
  SETTINGS_METHODS.mcpUpsert,
  SETTINGS_METHODS.mcpToggle,
  SETTINGS_METHODS.mcpDelete,
  SETTINGS_METHODS.mcpSetup,
  SETTINGS_METHODS.mcpAuthTrigger,
  SETTINGS_METHODS.hooksList,
]);

export const ABSENT_SETTINGS_TOPICS = [
  "memory",
  "indexing",
  "commands",
  "browser",
  "automations",
  "proxy",
  "scheduler/create",
  "scheduler/list",
  "migration",
  "subagents",
] as const;

const ABSENT_TOPIC_SET = new Set<string>(ABSENT_SETTINGS_TOPICS);

type SettingsGroupId = "basics" | "agentCapabilities" | "dataAndStats";

const SECTION_SPECS: Array<{ id: SettingsSectionId; group: SettingsGroupId; label: () => string; when: (accepted: ReadonlySet<string>) => boolean }> = [
  { id: "general", group: "basics", label: () => tr("常规"), when: () => true },
  { id: "appearance", group: "basics", label: () => tr("外观"), when: () => true },
  { id: "models", group: "basics", label: () => tr("模型"), when: () => true },
  { id: "plugins", group: "agentCapabilities", label: () => tr("插件"), when: (accepted) => accepted.has(SETTINGS_METHODS.pluginsList) },
  { id: "skills", group: "agentCapabilities", label: () => tr("技能"), when: (accepted) => accepted.has(SETTINGS_METHODS.skillsList) },
  { id: "mcp", group: "agentCapabilities", label: () => tr("MCP 服务"), when: (accepted) => accepted.has(SETTINGS_METHODS.mcpList) },
  { id: "hooks", group: "agentCapabilities", label: () => tr("钩子"), when: (accepted) => accepted.has(SETTINGS_METHODS.hooksList) },
  { id: "usage", group: "dataAndStats", label: () => tr("用量"), when: () => true },
];

const GROUP_SPECS: Array<{ id: SettingsGroupId; label: () => string }> = [
  { id: "basics", label: () => tr("基础") },
  { id: "agentCapabilities", label: () => tr("智能体能力") },
  { id: "dataAndStats", label: () => tr("数据与统计") },
];

export function settingsGroups(accepted: ReadonlySet<string>): SettingsGroupDef[] {
  return GROUP_SPECS.flatMap((group) => {
    const sections = SECTION_SPECS.filter((section) => section.group === group.id && section.when(accepted)).map((section) => ({
      id: section.id,
      get label() { return section.label(); },
    }));
    if (sections.length === 0) return [];
    return [{ id: group.id, get label() { return group.label(); }, sections }];
  });
}

export function settingsTopicShown(topic: string, accepted: ReadonlySet<string>): boolean {
  if (ABSENT_TOPIC_SET.has(topic)) return false;
  return settingsGroups(accepted).some((group) => group.sections.some((section) => section.id === topic));
}

export function settingsWriteShown(method: string, accepted: ReadonlySet<string>): boolean {
  return accepted.has(method);
}

/** 组名沿用活壳词汇（settings.sidebar.group.*）：基础 / 智能体能力 / 数据与统计。 */
export const SETTINGS_GROUPS: SettingsGroupDef[] = settingsGroups(ACCEPTED_SETTINGS_METHODS);

export const SETTINGS_SECTION_IDS: SettingsSectionId[] = SETTINGS_GROUPS.flatMap((g) =>
  g.sections.map((s) => s.id),
);

export function isSettingsSection(id: string): id is SettingsSectionId {
  return (SETTINGS_SECTION_IDS as string[]).includes(id);
}

export function sectionLabel(id: SettingsSectionId): string {
  for (const g of SETTINGS_GROUPS) {
    const hit = g.sections.find((s) => s.id === id);
    if (hit !== undefined) return hit.label;
  }
  return id;
}

/** MCP 行状态 → 人话 + 灯色。内核 status 值域见 nofy-hooks-plugins-types McpSessionStatus。 */
export type McpStatusView = { label: string; tone: "ok" | "busy" | "bad" | "off" };

export function mcpStatusView(status: string | null, enabled: boolean): McpStatusView {
  if (!enabled) return { label: tr("已停用"), tone: "off" };
  switch (status) {
    case "ready":
      return { label: tr("运行中"), tone: "ok" };
    case "initializing":
    case "connecting":
      return { label: tr("启动中"), tone: "busy" };
    case "error":
    case "failed":
      return { label: tr("异常"), tone: "bad" };
    case null:
      return { label: tr("状态未知"), tone: "busy" };
    default:
      return { label: status, tone: "busy" };
  }
}

/** 插件行摘要：三计数只画非零段，全零给「无组件」。 */
export function pluginSummary(p: PluginRow): string {
  const parts: string[] = [];
  if (p.skillCount > 0) parts.push(String(p.skillCount) + tr(" 技能"));
  if (p.agentCount > 0) parts.push(String(p.agentCount) + tr(" 智能体"));
  if (p.mcpServerCount > 0) parts.push(String(p.mcpServerCount) + " MCP");
  if (parts.length === 0) return tr("无组件");
  return parts.join(" · ");
}

/** 市场条目安装状态 → 人话。内核 installStatus 是自由串，表外值原样回退。 */
export function installStatusView(status: string | null): string {
  switch (status) {
    case "installed":
      return tr("已安装");
    case "not_installed":
      return tr("未安装");
    case "update_available":
      return tr("可更新");
    case null:
      return tr("状态未知");
    default:
      return status;
  }
}

/* ── 用量面纯函数（#7）：内核给全量，界面只做格式化与分段，不自己算 token ── */

export type ContextSegment = { id: string; label: string; tokens: number | null };

/** 四段分解：系统提示 / 工具定义 / 消息 / 其余。其余 = used − 前三段（钳到 ≥0；
 *  任一段缺失时「其余」也 null，不编数。顺序即展示顺序。 */
export function contextSegments(ctx: {
  used: number;
  systemPromptTokens: number | null;
  toolDefinitionsTokens: number | null;
  messageTokens: number | null;
}): ContextSegment[] {
  const known =
    ctx.systemPromptTokens !== null && ctx.toolDefinitionsTokens !== null && ctx.messageTokens !== null;
  const rest = known
    ? Math.max(0, ctx.used - (ctx.systemPromptTokens ?? 0) - (ctx.toolDefinitionsTokens ?? 0) - (ctx.messageTokens ?? 0))
    : null;
  return [
    { id: "system", label: tr("系统提示"), tokens: ctx.systemPromptTokens },
    { id: "tools", label: tr("工具定义"), tokens: ctx.toolDefinitionsTokens },
    { id: "messages", label: tr("消息"), tokens: ctx.messageTokens },
    { id: "rest", label: tr("其余"), tokens: rest },
  ];
}

/** token 数格式化：≥1000 走 k、≥1e6 走 M，一位小数；null 给「—」。 */
export function formatTokens(n: number | null): string {
  if (n === null) return "—";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(n);
}

/** 毫秒格式化：<1000 给 ms，否则 s 一位小数；null 给「—」。 */
export function formatMs(ms: number | null): string {
  if (ms === null) return "—";
  if (ms < 1000) return String(Math.round(ms)) + " ms";
  return (ms / 1000).toFixed(1) + " s";
}
