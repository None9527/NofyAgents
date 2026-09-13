/**
 * 设置面纯模型（阶段 C UI 批）。只放可门禁的纯裁决：分区注册表、状态文案映射、
 * 行摘要串。组件与线路都不住这里（组件在 SettingsSurface.tsx，线路在 core/effects.ts）。
 *
 * 分区表对照逆向树 modules/Settings.tsx:632 的 14 分区注册表（三组：basics /
 * agentCapabilities / dataAndStats）；我们首批只开四个分区，其余不画假入口
 * （与侧栏灰按钮同纪律：没有数据面的分区不出现，而不是点了才说没有）。
 */
import type { PluginRow } from "../../ui/readers.ts";

export type SettingsSectionId = "general" | "plugins" | "skills" | "mcp" | "usage";

export type SettingsSectionDef = { id: SettingsSectionId; label: string };

export type SettingsGroupDef = { id: string; label: string; sections: SettingsSectionDef[] };

/** 组名沿用活壳词汇（settings.sidebar.group.*）：基础 / 智能体能力。 */
export const SETTINGS_GROUPS: SettingsGroupDef[] = [
  { id: "basics", label: "基础", sections: [{ id: "general", label: "通用" }] },
  {
    id: "agentCapabilities",
    label: "智能体能力",
    sections: [
      { id: "plugins", label: "插件" },
      { id: "skills", label: "技能" },
      { id: "mcp", label: "MCP 服务" },
    ],
  },
  {
    id: "dataAndStats",
    label: "数据与统计",
    sections: [{ id: "usage", label: "用量" }],
  },
];

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
  if (!enabled) return { label: "已停用", tone: "off" };
  switch (status) {
    case "ready":
      return { label: "运行中", tone: "ok" };
    case "initializing":
    case "connecting":
      return { label: "启动中", tone: "busy" };
    case "error":
    case "failed":
      return { label: "异常", tone: "bad" };
    case null:
      return { label: "状态未知", tone: "busy" };
    default:
      return { label: status, tone: "busy" };
  }
}

/** 插件行摘要：三计数只画非零段，全零给「无组件」。 */
export function pluginSummary(p: PluginRow): string {
  const parts: string[] = [];
  if (p.skillCount > 0) parts.push(String(p.skillCount) + " 技能");
  if (p.agentCount > 0) parts.push(String(p.agentCount) + " 智能体");
  if (p.mcpServerCount > 0) parts.push(String(p.mcpServerCount) + " MCP");
  if (parts.length === 0) return "无组件";
  return parts.join(" · ");
}

/** 市场条目安装状态 → 人话。内核 installStatus 是自由串，表外值原样回退。 */
export function installStatusView(status: string | null): string {
  switch (status) {
    case "installed":
      return "已安装";
    case "not_installed":
      return "未安装";
    case "update_available":
      return "可更新";
    case null:
      return "状态未知";
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
    { id: "system", label: "系统提示", tokens: ctx.systemPromptTokens },
    { id: "tools", label: "工具定义", tokens: ctx.toolDefinitionsTokens },
    { id: "messages", label: "消息", tokens: ctx.messageTokens },
    { id: "rest", label: "其余", tokens: rest },
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
