/**
 * 本机用量账本（#7 用量面的数据源）。
 *
 * 为什么自己记：内核只给**单会话**用量（_nofy/session/usage = 该会话 ledger、
 * turn_completed.usage = 本轮段），没有跨会话/跨天的聚合读路径；活壳使用统计面的
 * 累计/热力/连续天数来自它自己的遥测库。干净室做法＝把自己**亲眼见过**的轮级用量
 * 追加进本机账本（localStorage），聚合全在 usageModel.ts 纯函数里做——不编任何
 * 没见过的数字，账本从装机那天起攒。
 *
 * 住 ui/ 层：dep-guard 只禁 features/ 碰 window/document，localStorage 与
 * prefs.ts / theme.ts 同纪律。
 */

export type UsageEntry = {
  /** 去重键：sessionId + ":" + numTurns（同会话同轮次只记一次）。 */
  k: string;
  /** 本地日期 YYYY-MM-DD。 */
  d: string;
  m: string;
  /** total / input / output / cachedRead / reasoning tokens。 */
  t: number;
  i: number;
  o: number;
  c: number;
  r: number;
  /** 模型调用次数 / 接口耗时 ms。 */
  mc: number;
  ms: number;
};

const STORAGE_KEY = "nofy-desktop:usage-ledger";
const MAX_ENTRIES = 5000;

/** 结构型取 localStorage：tsconfig.json（node 面）也编译本文件，不能裸用 window 标识符。 */
type StorageLike = { getItem(k: string): string | null; setItem(k: string, v: string): void };

function ls(): StorageLike | null {
  const g = globalThis as { localStorage?: StorageLike };
  return g.localStorage ?? null;
}

export function loadUsageLedger(): UsageEntry[] {
  try {
    const store = ls();
    if (store === null) return [];
    const raw = store.getItem(STORAGE_KEY);
    if (raw === null) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const out: UsageEntry[] = [];
    for (const item of parsed) {
      if (typeof item !== "object" || item === null) continue;
      const o = item as Record<string, unknown>;
      if (typeof o["k"] !== "string" || typeof o["d"] !== "string" || typeof o["t"] !== "number") continue;
      out.push({
        k: o["k"],
        d: o["d"],
        m: typeof o["m"] === "string" ? o["m"] : "unknown",
        t: o["t"],
        i: typeof o["i"] === "number" ? o["i"] : 0,
        o: typeof o["o"] === "number" ? o["o"] : 0,
        c: typeof o["c"] === "number" ? o["c"] : 0,
        r: typeof o["r"] === "number" ? o["r"] : 0,
        mc: typeof o["mc"] === "number" ? o["mc"] : 0,
        ms: typeof o["ms"] === "number" ? o["ms"] : 0,
      });
    }
    return out;
  } catch {
    return [];
  }
}

/** 追加一条轮级用量；同键已存在则 no-op。返回是否真的写入了。 */
export function appendUsageLedger(entry: UsageEntry): boolean {
  const cur = loadUsageLedger();
  if (cur.some((e) => e.k === entry.k)) return false;
  const next = [...cur, entry].slice(-MAX_ENTRIES);
  try {
    const store = ls();
    if (store === null) return false;
    store.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    return false;
  }
  return true;
}

/** 本地日期键（账本与聚合共用一个格式，避免时区两套键）。 */
export function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + d;
}
