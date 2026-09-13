/**
 * 生态面 #5（市场/插件/技能/MCP）读取器门禁。
 *
 * 形状来源双证据：内核 codegen 型（crates/codegen/nofy-hooks-plugins-types/src/lib.rs
 * camelCase）＋探针实测（docs/contract/ecosystem-shapes.json）。守三件容易走样的事：
 *   1. skills 探针实测键是 snake（user_invocable），codegen 型是 camel——双键都要收；
 *   2. mcp 的 status 旧内核塞在 session 对象里、新内核在顶层——双键兜底不能 regress；
 *   3. 脏条目（缺 name）跳过而不是抛——设置面不因一条坏数据白屏。
 */
import assert from "node:assert/strict";
import test from "node:test";
import {
  readMarketplace,
  readMcpServers,
  readPlugins,
  readSkills,
} from "../renderer/ui/readers.ts";

test("readSkills：camel 与 snake 键都收；缺 name 的脏条目跳过", () => {
  const res = {
    result: {
      skills: [
        {
          name: "code-review",
          description: "Review code",
          path: "/s/code-review/SKILL.md",
          scope: "user",
          enabled: true,
          userInvocable: true,
        },
        {
          name: "legacy",
          description: "",
          path: "/s/legacy/SKILL.md",
          scope: "user",
          enabled: false,
          user_invocable: true,
        },
        { description: "no name", path: "/x" },
      ],
    },
  };
  const rows = readSkills(res);
  assert.equal(rows.length, 2);
  assert.equal(rows[0]?.userInvocable, true);
  assert.equal(rows[1]?.enabled, false);
  assert.equal(rows[1]?.userInvocable, true);
});

test("readPlugins：计数字段缺省落 0；id 缺失回退 name", () => {
  const res = {
    result: {
      plugins: [
        {
          name: "gitnexus",
          id: "user/ab12cd34/gitnexus",
          scope: "user",
          enabled: true,
          version: "1.2.0",
          description: "Graph nav",
          skillCount: 6,
          agentCount: 1,
          mcpServerCount: 1,
          hookStatus: "active",
          marketplaceSource: "claude-plugins-official",
        },
        { name: "bare", enabled: false },
      ],
    },
  };
  const rows = readPlugins(res);
  assert.equal(rows.length, 2);
  assert.equal(rows[0]?.skillCount, 6);
  assert.equal(rows[0]?.marketplaceSource, "claude-plugins-official");
  assert.equal(rows[1]?.id, "bare");
  assert.equal(rows[1]?.skillCount, 0);
  assert.equal(rows[1]?.version, null);
});

test("readMarketplace：sources 族逐字收；error 源保留错误文案", () => {
  const res = {
    result: {
      sources: [
        {
          sourceName: "claude-plugins-official",
          sourceKind: "git",
          sourceUrlOrPath: "https://example/repo.git",
          error: null,
          plugins: [
            {
              name: "superpowers",
              version: "2.0.1",
              description: "Skills pack",
              category: "development",
              author: "Anthropic",
              installStatus: "not_installed",
              skillCount: 14,
              hasHooks: true,
              hasAgents: false,
              hasMcp: false,
            },
          ],
        },
        {
          sourceName: "broken",
          sourceKind: "git",
          sourceUrlOrPath: "https://example/bad.git",
          error: "clone failed",
          plugins: [],
        },
      ],
    },
  };
  const rows = readMarketplace(res);
  assert.equal(rows.length, 2);
  assert.equal(rows[0]?.plugins.length, 1);
  assert.equal(rows[0]?.plugins[0]?.category, "development");
  assert.equal(rows[0]?.plugins[0]?.hasHooks, true);
  assert.equal(rows[1]?.error, "clone failed");
});

test("readMcpServers：status 顶层与 session 内双键兜底；tools 展开", () => {
  const res = {
    result: {
      servers: [
        {
          name: "gitnexus",
          source: "local",
          enabled: true,
          status: "ready",
          toolCount: 2,
          tools: [{ name: "query" }, { name: "context", description: "symbol context" }],
          configSource: "config.toml",
        },
        {
          name: "legacy-server",
          source: "local",
          session: { status: "initializing" },
          tools: [],
        },
      ],
    },
  };
  const rows = readMcpServers(res);
  assert.equal(rows.length, 2);
  assert.equal(rows[0]?.status, "ready");
  assert.equal(rows[0]?.toolCount, 2);
  assert.equal(rows[0]?.tools[1]?.description, "symbol context");
  assert.equal(rows[1]?.status, "initializing");
  assert.equal(rows[1]?.enabled, true); // 旧内核不给 enabled 时按启用显示，不假装禁用
  assert.equal(rows[1]?.toolCount, 0);
});
