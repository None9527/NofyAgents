/**
 * 设置面纯模型门禁（阶段 C UI 批）。守三件：分区表不漂移（组×序）、
 * MCP 状态文案映射不编灯色、插件/市场摘要串全零与表外值回退。
 */
import assert from "node:assert/strict";
import test from "node:test";
import {
  installStatusView,
  isSettingsSection,
  mcpStatusView,
  pluginSummary,
  SETTINGS_GROUPS,
  sectionLabel,
  contextSegments,
  formatMs,
  formatTokens,
} from "../renderer/features/settings/settingsModel.ts";
import type { PluginRow } from "../renderer/ui/readers.ts";

test("分区表标签与可见性判定不漂移", () => {
  assert.equal(sectionLabel("mcp"), "MCP 服务");
  assert.equal(sectionLabel("appearance"), "外观");
  assert.equal(sectionLabel("hooks"), "钩子");
  assert.equal(isSettingsSection("usage"), true);
  assert.equal(isSettingsSection("hooks"), true);
  assert.equal(isSettingsSection("appearance"), true);
  assert.equal(isSettingsSection("general"), true);
  assert.equal(sectionLabel("general"), "常规");
  assert.equal(isSettingsSection("plugins"), true);
});

test("mcpStatusView：停用优先于 status；表外值原样回退", () => {
  assert.deepEqual(mcpStatusView("ready", true), { label: "运行中", tone: "ok" });
  assert.deepEqual(mcpStatusView("ready", false), { label: "已停用", tone: "off" });
  assert.deepEqual(mcpStatusView("initializing", true), { label: "启动中", tone: "busy" });
  assert.deepEqual(mcpStatusView(null, true), { label: "状态未知", tone: "busy" });
  assert.deepEqual(mcpStatusView("weird-state", true), { label: "weird-state", tone: "busy" });
});

test("pluginSummary：只画非零段；全零给「无组件」", () => {
  const row = (over: Partial<PluginRow>): PluginRow => ({
    id: "x",
    name: "x",
    enabled: true,
    scope: "user",
    version: null,
    description: null,
    skillCount: 0,
    agentCount: 0,
    mcpServerCount: 0,
    hookStatus: null,
    marketplaceSource: null,
    ...over,
  });
  assert.equal(pluginSummary(row({})), "无组件");
  assert.equal(pluginSummary(row({ skillCount: 6, mcpServerCount: 1 })), "6 技能 · 1 MCP");
  assert.equal(pluginSummary(row({ skillCount: 1, agentCount: 2, mcpServerCount: 3 })), "1 技能 · 2 智能体 · 3 MCP");
});

test("installStatusView：表内三值人话；表外原样；null 未知", () => {
  assert.equal(installStatusView("installed"), "已安装");
  assert.equal(installStatusView("not_installed"), "未安装");
  assert.equal(installStatusView("update_available"), "可更新");
  assert.equal(installStatusView(null), "状态未知");
  assert.equal(installStatusView("sideloaded"), "sideloaded");
});

test("分区表含用量：数据与统计组挂 usage", () => {
  assert.deepEqual(
    SETTINGS_GROUPS.map((g) => [g.id, g.sections.map((s) => s.id)]),
    [
      ["basics", ["general", "appearance", "models"]],
      ["agentCapabilities", ["plugins", "skills", "mcp", "hooks"]],
      ["dataAndStats", ["usage"]],
    ],
  );
  assert.equal(sectionLabel("usage"), "用量");
});

test("contextSegments：其余 = used − 三段（钳 ≥0）；任一段缺则其余 null 不编数", () => {
  const segs = contextSegments({
    used: 1000,
    systemPromptTokens: 100,
    toolDefinitionsTokens: 300,
    messageTokens: 500,
  });
  assert.deepEqual(segs.map((s) => [s.id, s.tokens]), [
    ["system", 100],
    ["tools", 300],
    ["messages", 500],
    ["rest", 100],
  ]);
  const missing = contextSegments({ used: 1000, systemPromptTokens: 100, toolDefinitionsTokens: null, messageTokens: 500 });
  assert.equal(missing[3]?.tokens, null);
  const over = contextSegments({ used: 100, systemPromptTokens: 80, toolDefinitionsTokens: 30, messageTokens: 50 });
  assert.equal(over[3]?.tokens, 0); // 钳到 0，不出负数
});

test("formatTokens/formatMs：k/M 与 ms/s 档位；null 给破折号", () => {
  assert.equal(formatTokens(null), "—");
  assert.equal(formatTokens(999), "999");
  assert.equal(formatTokens(1500), "1.5k");
  assert.equal(formatTokens(2_500_000), "2.5M");
  assert.equal(formatMs(null), "—");
  assert.equal(formatMs(850), "850 ms");
  assert.equal(formatMs(12_340), "12.3 s");
});
