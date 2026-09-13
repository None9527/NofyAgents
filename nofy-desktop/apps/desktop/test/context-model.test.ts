/**
 * 上下文圆环浮层的视图模型门禁。
 *
 * 三条要钉死的纪律：
 *  1. **界面不自己算 token**——只用内核 _nofy/session/info 给的数（实测形状取自
 *     docs/contract/session-read-shapes.json）；
 *  2. **usageCategories 不进堆叠条**——内核源码明写它们与 message_tokens 重叠
 *     （crates/codegen/nofy-shell/src/session/acp_types.rs:160-167），相加就是重复计数；
 *  3. **没数据不编数字**——ctx=null 时 hasData=false、三段全空、文案说「等待内核回传」。
 */
import assert from "node:assert/strict";
import test from "node:test";
import {
  cacheView,
  contextListings,
  contextSegments,
  contextStats,
  contextView,
  formatTokens,
  localizeCategoryLabel,
  localizeDetail,
  tokensToThreshold,
} from "../renderer/features/conversation/contextModel.ts";
import { readContext } from "../renderer/ui/readers.ts";

/** 实测样本（session-read-shapes.json 的 _nofy/session/info，qwen3-coder-plus，4 回合）。 */
const MEASURED = {
  result: {
    context: {
      used: 22026,
      total: 131072,
      usagePct: 17,
      freeTokens: 109046,
      autoCompactThresholdPercent: 85,
      systemPromptTokens: 1034,
      toolDefinitionsTokens: 7597,
      toolDefinitionsCount: 25,
      messageTokens: 13567,
      messageCount: 6,
      turnCount: 1,
      toolCallCount: 0,
      compactionCount: 0,
      usageCategories: [
        { label: "Skills", tokens: 4200, detail: "21 skills" },
        { label: "MCP servers", tokens: 900, detail: "1 server" },
        { label: "Workflows", tokens: 0, detail: "0 workflows" },
      ],
    },
  },
};

function ctx() {
  const c = readContext(MEASURED);
  assert.ok(c !== null, "实测样本必须能入型");
  return c;
}

test("readContext：usageCategories 入型，缺 label/tokens 的行跳过", () => {
  const c = ctx();
  assert.equal(c.usageCategories.length, 3);
  assert.deepEqual(c.usageCategories[0], { label: "Skills", tokens: 4200, detail: "21 skills" });
  const ragged = readContext({
    result: {
      context: {
        used: 10,
        total: 100,
        usageCategories: [{ tokens: 5 }, { label: "X" }, { label: "Skills", tokens: 7, detail: null }],
      },
    },
  });
  assert.ok(ragged !== null);
  assert.deepEqual(ragged.usageCategories, [{ label: "Skills", tokens: 7, detail: null }]);
});

test("segments：只收 >0 的互斥来源，按 tokens 降序，占比按已归类总量", () => {
  const segs = contextSegments(ctx());
  assert.deepEqual(
    segs.map((s) => s.id),
    ["messages", "system_tool_schemas", "system_prompt"],
  );
  const sum = 13567 + 7597 + 1034;
  assert.equal(Math.round(segs[0]!.percent * 1e6) / 1e6, Math.round((13567 / sum) * 1e6) / 1e6);
  assert.deepEqual(
    segs.map((s) => s.colorIndex),
    [0, 1, 2],
  );
  assert.equal(segs[0]!.detail, "6 条");
  assert.equal(segs[1]!.detail, "25 个工具");
  assert.equal(segs[2]!.detail, null);
});

test("segments：同量按 SEGMENT_ORDER 稳定排序（消息优先）", () => {
  const tie = readContext({
    result: { context: { used: 20, total: 100, systemPromptTokens: 10, messageTokens: 10 } },
  });
  assert.ok(tie !== null);
  assert.deepEqual(
    contextSegments(tie).map((s) => s.id),
    ["messages", "system_prompt"],
  );
});

test("纪律 2：usageCategories 只出现在 listings，绝不混进堆叠条", () => {
  const segs = contextSegments(ctx());
  for (const s of segs) {
    assert.ok(
      ["messages", "system_prompt", "system_tool_schemas"].includes(s.id),
      "堆叠条里出现了清单来源: " + s.id,
    );
  }
  const listings = contextListings(ctx());
  assert.deepEqual(
    listings.map((l) => l.label),
    ["技能清单", "MCP 服务器清单"],
  );
  assert.equal(listings[0]!.detail, "21 个技能");
  assert.equal(listings[1]!.detail, "1 个服务器");
});

test("文案：内核英文计数串译中文，认不出的原样保留（不猜）", () => {
  assert.equal(localizeDetail("3 workflows"), "3 个工作流");
  assert.equal(localizeDetail("1 server"), "1 个服务器");
  assert.equal(localizeDetail("21 skills"), "21 个技能");
  assert.equal(localizeDetail("weird"), "weird");
  assert.equal(localizeDetail(null), null);
  assert.equal(localizeCategoryLabel("Skills"), "技能清单");
  assert.equal(localizeCategoryLabel("Workflows"), "工作流清单");
  assert.equal(localizeCategoryLabel("MCP servers"), "MCP 服务器清单");
  assert.equal(localizeCategoryLabel("Something new"), "Something new");
});

test("阈值：距自动压缩还剩多少 token 由内核百分比算，缺百分比就不算", () => {
  assert.equal(tokensToThreshold(ctx()), Math.round(131072 * 0.85) - 22026);
  const noTh = readContext({ result: { context: { used: 5, total: 100 } } });
  assert.ok(noTh !== null);
  assert.equal(tokensToThreshold(noTh), null);
  const over = readContext({
    result: { context: { used: 99, total: 100, autoCompactThresholdPercent: 85 } },
  });
  assert.ok(over !== null);
  assert.equal(tokensToThreshold(over), 0, "越过阈值不给负数");
});

test("stats：余量打头，阈值行带距离，计数为 0 也照实显示", () => {
  const rows = contextStats(ctx());
  assert.equal(rows[0]!.id, "free");
  assert.equal(rows[0]!.value, "109,046 tok");
  const th = rows.find((r) => r.id === "threshold");
  assert.ok(th !== undefined && th.value.startsWith("85%"));
  assert.ok(th.value.includes("89,385 tok"), th.value);
  assert.equal(rows.find((r) => r.id === "tools")?.value, "0");
  assert.equal(rows.find((r) => r.id === "compactions")?.value, "0 次");
});

test("view：有数据给汇总与告警位；到阈值才 warn", () => {
  const v = contextView(ctx());
  assert.equal(v.hasData, true);
  assert.equal(v.summary, "22,026 / 131,072（17%）");
  assert.equal(v.warn, false);
  assert.equal(v.thresholdPct, 85);
  assert.ok(Math.abs(v.ratio - 22026 / 131072) < 1e-9);
  const hot = readContext({
    result: { context: { used: 90, total: 100, usagePct: 90, autoCompactThresholdPercent: 85 } },
  });
  assert.ok(hot !== null);
  assert.equal(contextView(hot).warn, true);
});

test("纪律 3：ctx=null 只画 track 环，文案说等内核，不编数字", () => {
  const v = contextView(null);
  assert.equal(v.hasData, false);
  assert.equal(v.pct, 0);
  assert.equal(v.ratio, 0);
  assert.equal(v.summary, "—");
  assert.deepEqual(v.segments, []);
  assert.deepEqual(v.listings, []);
  assert.deepEqual(v.stats, []);
  assert.ok(v.ringLabel.includes("等待内核回传"));
});

test("formatTokens：千分位，小数四舍五入", () => {
  assert.equal(formatTokens(0), "0");
  assert.equal(formatTokens(1034), "1,034");
  assert.equal(formatTokens(1048576), "1,048,576");
  assert.equal(formatTokens(12.6), "13");
});

test("E8 缓存命中率：三桶穷尽 prompt 侧做分母；除零给 null；无轮级 usage 不画", () => {
  const turn = {
    inputTokens: 3000,
    outputTokens: 500,
    totalTokens: 4000,
    cachedReadTokens: 12000,
    cacheCreationTokens: 1000,
    reasoningTokens: 0,
    modelCalls: 2,
    apiDurationMs: 1000,
    numTurns: 1,
    modelUsage: null,
  };
  const c = cacheView(turn);
  assert.equal(c.hasData, true);
  assert.equal(c.hit, 12000 / 16000, "读/(读+建+未缓存)");
  const zero = cacheView({ ...turn, inputTokens: 0, cachedReadTokens: 0, cacheCreationTokens: 0 });
  assert.equal(zero.hit, null, "三桶和 0 ⇒ null，不除零不编数");
  assert.equal(cacheView(null).hasData, false);
});

test("E8 浮层两行 + 环 label 带命中率；无轮级 usage 不加行", () => {
  const ctx = readContext({ result: { context: { used: 10, total: 100, usagePct: 10 } } });
  assert.ok(ctx !== null);
  const turn = {
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
    cachedReadTokens: 8,
    cacheCreationTokens: 0,
    reasoningTokens: 0,
    modelCalls: 1,
    apiDurationMs: 1,
    numTurns: 1,
    modelUsage: null,
  };
  const v = contextView(ctx, turn);
  const hit = v.stats.find((s) => s.id === "cache-hit");
  const split = v.stats.find((s) => s.id === "cache-split");
  assert.equal(hit?.value, "100%");
  assert.equal(hit?.strong, true);
  assert.equal(split?.value, "8 / 0 / 0");
  assert.ok(v.ringLabel.includes("缓存命中 100%"));
  assert.equal(v.cache.hit, 1);
  const v2 = contextView(ctx, null);
  assert.equal(v2.stats.some((s) => s.id === "cache-hit"), false);
  assert.equal(v2.cache.hasData, false);
});
