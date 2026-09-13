/**
 * 用量面纯聚合门禁（#7）。守四件：ISO 周键不漂（跨年周最易错）、日期键 ±1 天
 * 跨月跨年不漂、连续天数/峰值/时长折法、趋势拆线「其他」兜底。
 */
import assert from "node:assert/strict";
import test from "node:test";
import {
  bucketize,
  formatMinutes,
  formatWan,
  modelShares,
  prevDay,
  shiftDay,
  trendSeries,
  usageStats,
  weekKey,
} from "../renderer/features/settings/usageModel.ts";
import type { UsageEntry } from "../renderer/ui/usageLedger.ts";

function entry(day: string, model: string, tokens: number, ms = 60_000, numTurns = 1): UsageEntry {
  return { k: day + model + String(numTurns), d: day, m: model, t: tokens, i: tokens, o: 0, c: 0, r: 0, mc: 1, ms };
}

test("weekKey：ISO 周跨年不漂（12-29 周一属次年 W01）", () => {
  assert.equal(weekKey("2026-01-01"), "2026-W01");
  assert.equal(weekKey("2025-12-29"), "2026-W01");
  assert.equal(weekKey("2025-12-28"), "2025-W52");
  assert.equal(weekKey("2026-09-12"), "2026-W37");
});

test("shiftDay/prevDay：跨月跨年不漂", () => {
  assert.equal(prevDay("2026-03-01"), "2026-02-28");
  assert.equal(prevDay("2026-01-01"), "2025-12-31");
  assert.equal(shiftDay("2025-12-31", 1), "2026-01-01");
  assert.equal(shiftDay("2026-02-28", 1), "2026-03-01"); // 2026 非闰年
});

test("usageStats：五卡折法（连续天数今天没量到从昨天起算）", () => {
  const entries = [
    entry("2026-09-01", "m1", 100),
    entry("2026-09-10", "m1", 200),
    entry("2026-09-11", "m1", 300),
    entry("2026-09-12", "m1", 400, 120_000),
  ];
  const s = usageStats(entries, "2026-09-12");
  assert.equal(s.totalTokens, 1000);
  assert.equal(s.peakTokens, 400);
  assert.equal(s.chatMinutes, 5); // 60s×3 + 120s = 300s = 5 分钟
  assert.equal(s.currentStreak, 3);
  assert.equal(s.longestStreak, 3);
});

test("usageStats：今天没量到时当前连续从昨天起算", () => {
  const entries = [entry("2026-09-10", "m1", 1), entry("2026-09-11", "m1", 1)];
  const s = usageStats(entries, "2026-09-12");
  assert.equal(s.currentStreak, 2);
});

test("bucketize：月桶排序稳定", () => {
  const b = bucketize([entry("2026-08-02", "m", 5), entry("2026-07-02", "m", 5), entry("2026-08-03", "m", 7)], "month");
  assert.deepEqual(b, [
    { key: "2026-07", tokens: 5 },
    { key: "2026-08", tokens: 12 },
  ]);
});

test("trendSeries：前三模型拆线、其余归「其他」", () => {
  const entries = [
    entry("2026-09-12", "a", 10),
    entry("2026-09-12", "b", 9),
    entry("2026-09-12", "c", 8),
    entry("2026-09-12", "d", 7),
  ];
  const series = trendSeries(entries, "2026-09-12", 7);
  assert.deepEqual(series.map((s) => s.model), ["a", "b", "c", "其他"]);
  const other = series[3];
  assert.equal(other?.points[6]?.tokens, 7);
});

test("modelShares：占比一位小数、降序", () => {
  const shares = modelShares([entry("2026-09-12", "a", 700), entry("2026-09-12", "b", 300)]);
  assert.deepEqual(shares.map((s) => [s.model, s.sharePct]), [["a", 70], ["b", 30]]);
});

test("formatWan/formatMinutes：万/亿与小时档", () => {
  assert.equal(formatWan(9999), "9999");
  assert.equal(formatWan(89_338_000), "8933.8 万");
  assert.equal(formatWan(250_000_000), "2.5 亿");
  assert.equal(formatMinutes(45), "45 分钟");
  assert.equal(formatMinutes(125), "2 小时 5 分");
});
