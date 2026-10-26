import { tr } from "../../ui/i18n.ts";
/**
 * 用量面纯聚合（#7）。输入 = ui/usageLedger.ts 的本机账本条目 + 「今天」键；
 * 不碰 Date / localStorage，全可门禁。活壳使用统计面的五卡/热力/趋势/模型占比
 * 四块都在这里折，UI 只画。
 */
import type { UsageEntry } from "../../ui/usageLedger.ts";

export type Bucket = { key: string; tokens: number };

/** 日桶：dateKey → tokens（只含有数据的日）。 */
export function dailyBuckets(entries: UsageEntry[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const e of entries) map.set(e.d, (map.get(e.d) ?? 0) + e.t);
  return map;
}

/** ISO 周键（YYYY-Www）：按周四定年定周，纯字符串算术不做 Date。 */
export function weekKey(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map((x) => Number(x));
  if (y === undefined || m === undefined || d === undefined) return dateKey;
  // 儒略日 → 星期（0=周一）与 ISO 周：紧凑整数算法，避免 Date 时区坑
  const a = Math.floor((14 - m) / 12);
  const yy = y - a;
  const mm = m + 12 * a - 3;
  const jdn = d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) + 1721119;
  const weekday = jdn % 7; // JDN mod 7：0=周一 … 6=周日（JDN 2451545=2000-01-01 周六=5 校验）
  const thursday = jdn + 3 - weekday; // 本周周四的儒略日
  // 周四所在年 → 该年 1/4 的儒略日推周序
  const ty = yearOfJdn(thursday);
  const jan4 = jdnOf(ty, 1, 4);
  const jan4Weekday = jan4 % 7;
  const week1Monday = jan4 - jan4Weekday;
  const week = Math.floor((thursday - week1Monday) / 7) + 1;
  return ty + "-W" + String(week).padStart(2, "0");
}

function yearOfJdn(jdn: number): number {
  // JDN → 公历（Fliegel & Van Flandern）
  const l = jdn + 68569;
  const n = Math.floor((4 * l) / 146097);
  const l2 = l - Math.floor((146097 * n + 3) / 4);
  const i = Math.floor((4000 * (l2 + 1)) / 1461001);
  const l3 = l2 - Math.floor((1461 * i) / 4) + 31;
  const j = Math.floor((80 * l3) / 2447);
  const dd = l3 - Math.floor((2447 * j) / 80);
  const l4 = Math.floor(j / 11);
  const mm = j + 2 - 12 * l4;
  const yy = 100 * (n - 49) + i + l4;
  void dd;
  void mm;
  return yy;
}

function jdnOf(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const yy = y - a;
  const mm = m + 12 * a - 3;
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) + 1721119;
}

export function monthKey(dateKey: string): string {
  return dateKey.slice(0, 7);
}

export function bucketize(entries: UsageEntry[], unit: "day" | "week" | "month"): Bucket[] {
  const map = new Map<string, number>();
  for (const e of entries) {
    const key = unit === "day" ? e.d : unit === "week" ? weekKey(e.d) : monthKey(e.d);
    map.set(key, (map.get(key) ?? 0) + e.t);
  }
  return [...map.entries()].map(([key, tokens]) => ({ key, tokens })).sort((a, b) => (a.key < b.key ? -1 : 1));
}

/** 五卡：累计 token / 峰值桶 token / 累计聊天时长 / 当前连续天数 / 最长连续天数。 */
export type UsageStats = {
  totalTokens: number;
  peakTokens: number;
  chatMinutes: number;
  currentStreak: number;
  longestStreak: number;
};

export function usageStats(entries: UsageEntry[], todayKey: string): UsageStats {
  const days = dailyBuckets(entries);
  let totalTokens = 0;
  let chatMs = 0;
  for (const e of entries) {
    totalTokens += e.t;
    chatMs += e.ms;
  }
  let peakTokens = 0;
  for (const v of days.values()) peakTokens = Math.max(peakTokens, v);
  const sortedDays = [...days.keys()].sort();
  let longest = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of sortedDays) {
    run = prev !== null && isNextDay(prev, d) ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = d;
  }
  let current = 0;
  let cursor = todayKey;
  if (!days.has(cursor)) cursor = prevDay(cursor); // 今天还没量到 ⇒ 从昨天起算
  while (days.has(cursor)) {
    current += 1;
    cursor = prevDay(cursor);
  }
  return {
    totalTokens,
    peakTokens,
    chatMinutes: Math.round(chatMs / 60000),
    currentStreak: current,
    longestStreak: longest,
  };
}

/** 日期键 ±1 天：拆键走 Date.UTC（纯函数语义：UTC 算术，无本地时区漂移）。 */
export function prevDay(dateKey: string): string {
  return shiftDay(dateKey, -1);
}

export function shiftDay(dateKey: string, delta: number): string {
  const [y, m, d] = dateKey.split("-").map((x) => Number(x));
  if (y === undefined || m === undefined || d === undefined) return dateKey;
  const t = Date.UTC(y, m - 1, d + delta);
  const dt = new Date(t);
  return (
    dt.getUTCFullYear() + "-" + String(dt.getUTCMonth() + 1).padStart(2, "0") + "-" + String(dt.getUTCDate()).padStart(2, "0")
  );
}

function isNextDay(a: string, b: string): boolean {
  return shiftDay(a, 1) === b;
}

/** 趋势：近 rangeDays 天、按模型拆线（取总量前 topN 模型，其余归「其他」）。 */
export type TrendPoint = { day: string; tokens: number };
export type TrendSeries = { model: string; points: TrendPoint[] };

export function trendSeries(entries: UsageEntry[], todayKey: string, rangeDays: number, topN = 3): TrendSeries[] {
  const days: string[] = [];
  for (let i = rangeDays - 1; i >= 0; i--) days.push(shiftDay(todayKey, -i));
  const totals = new Map<string, number>();
  for (const e of entries) totals.set(e.m, (totals.get(e.m) ?? 0) + e.t);
  const top = [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, topN).map(([m]) => m);
  const models = top.includes(tr("其他")) ? top : [...top];
  const byModel = new Map<string, Map<string, number>>();
  for (const m of models) byModel.set(m, new Map());
  const other = new Map<string, number>();
  for (const e of entries) {
    const target = models.includes(e.m) ? byModel.get(e.m) : other;
    if (target === undefined) continue;
    target.set(e.d, (target.get(e.d) ?? 0) + e.t);
  }
  const out: TrendSeries[] = models.map((m) => ({
    model: m,
    points: days.map((day) => ({ day, tokens: byModel.get(m)?.get(day) ?? 0 })),
  }));
  if (other.size > 0) {
    out.push({ model: tr("其他"), points: days.map((day) => ({ day, tokens: other.get(day) ?? 0 })) });
  }
  return out;
}

/** 模型占比：按总量降序。 */
export function modelShares(entries: UsageEntry[]): Array<{ model: string; tokens: number; sharePct: number }> {
  const map = new Map<string, number>();
  let total = 0;
  for (const e of entries) {
    map.set(e.m, (map.get(e.m) ?? 0) + e.t);
    total += e.t;
  }
  if (total <= 0) return [];
  return [...map.entries()]
    .map(([model, tokens]) => ({ model, tokens, sharePct: Math.round((tokens / total) * 1000) / 10 }))
    .sort((a, b) => b.tokens - a.tokens);
}

/** 大数中文档：≥1e8 亿、≥1e4 万（一位小数），否则原样；与活壳「8933.8 万」同语感。 */
export function formatWan(n: number): string {
  if (n >= 100_000_000) return (n / 100_000_000).toFixed(1) + tr(" 亿");
  if (n >= 10_000) return (n / 10_000).toFixed(1) + tr(" 万");
  return String(n);
}

/** 分钟档：<60 给「N 分钟」，否则「H 小时 M 分」。 */
export function formatMinutes(min: number): string {
  if (min < 60) return String(min) + tr(" 分钟");
  return String(Math.floor(min / 60)) + tr(" 小时 ") + String(min % 60) + tr(" 分");
}
