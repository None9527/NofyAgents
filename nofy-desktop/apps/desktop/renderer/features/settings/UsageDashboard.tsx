import { tr } from "../../ui/i18n.ts";
import { useLocale } from "../../ui/useLocale.ts";
/**
 * 使用统计面（#7）。块序照活壳使用统计页：五卡 → Token 活动热力（每日/每周/累计）
 * → 时间范围 + 每日 Token 趋势图（按模型拆线）→ 模型用量占比。数据源是本机账本
 * （ui/usageLedger.ts），聚合全走 usageModel.ts 纯函数；图表是自绘 SVG/CSS 网格，
 * 不引图表库（依赖纪律）。
 */
import { useMemo, useState } from "react";
import { IconChart } from "../../ui/icons.tsx";
import type { UsageEntry } from "../../ui/usageLedger.ts";
import {
  bucketize,
  formatMinutes,
  formatWan,
  modelShares,
  shiftDay,
  trendSeries,
  usageStats,
} from "./usageModel.ts";

const LINE_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#a855f7"];

function levelOf(tokens: number, max: number): number {
  if (tokens <= 0 || max <= 0) return 0;
  const r = tokens / max;
  if (r < 0.1) return 1;
  if (r < 0.3) return 2;
  if (r < 0.6) return 3;
  return 4;
}

/** 热力网格：53 周 × 7（周一行起）。返回列数组，每列 7 格（null = 未来日）。 */
function heatGrid(entries: UsageEntry[], todayKey: string): Array<Array<{ day: string | null; tokens: number }>> {
  const byDay = new Map<string, number>();
  for (const e of entries) byDay.set(e.d, (byDay.get(e.d) ?? 0) + e.t);
  // 今天回退到本周一，再退 52 周 = 网格起点
  let cursor = todayKey;
  for (let i = 0; i < 7; i++) {
    const wk = weekStartOf(cursor);
    if (wk === cursor) break;
    cursor = shiftDay(cursor, -1);
    void wk;
  }
  cursor = weekStartOf(todayKey);
  const start = shiftDay(cursor, -52 * 7);
  const cols: Array<Array<{ day: string | null; tokens: number }>> = [];
  let day = start;
  for (let w = 0; w < 53; w++) {
    const col: Array<{ day: string | null; tokens: number }> = [];
    for (let d = 0; d < 7; d++) {
      col.push({ day, tokens: byDay.get(day) ?? 0 });
      day = shiftDay(day, 1);
    }
    cols.push(col);
  }
  // 未来日抹空
  for (const col of cols) {
    for (const cell of col) {
      if (cell.day !== null && cell.day > todayKey) cell.day = null;
    }
  }
  return cols;
}

/** 周一键：dateKey 回退到本周一（纯字符串算术）。 */
function weekStartOf(dateKey: string): string {
  // 儒略日 weekday：(jdn+1)%7，0=周一；回退 weekday 天
  const [y, m, d] = dateKey.split("-").map((x) => Number(x));
  if (y === undefined || m === undefined || d === undefined) return dateKey;
  const a = Math.floor((14 - m) / 12);
  const yy = y - a;
  const mm = m + 12 * a - 3;
  const jdn = d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) + 1721119;
  const weekday = jdn % 7;
  return shiftDay(dateKey, -weekday);
}

export function UsageDashboard({ entries, todayKey }: { entries: UsageEntry[]; todayKey: string }) {
  useLocale();
  const [unit, setUnit] = useState<"day" | "week" | "month">("day");
  const [range, setRange] = useState<7 | 30>(7);
  const stats = useMemo(() => usageStats(entries, todayKey), [entries, todayKey]);
  const grid = useMemo(() => heatGrid(entries, todayKey), [entries, todayKey]);
  const strips = useMemo(() => (unit === "day" ? null : bucketize(entries, unit)), [entries, unit]);
  const series = useMemo(() => trendSeries(entries, todayKey, range), [entries, todayKey, range]);
  const shares = useMemo(() => modelShares(entries), [entries]);

  if (entries.length === 0) {
    return (
      <div className="emptyboard">
        <IconChart className="emptyboard-icon" />
        <p className="emptyboard-hint">{tr("本机账本还没有记录。跑一轮对话，用量就从这里开始攒。")}</p>
      </div>
    );
  }

  const maxCell = Math.max(1, ...grid.flat().map((c) => c.tokens));
  const maxTrend = Math.max(1, ...series.flatMap((s) => s.points.map((p) => p.tokens)));

  return (
    <div className="dash">
      <div className="dash__stats">
        <div className="dash__stat">
          <span className="dash__statvalue">{formatWan(stats.totalTokens)}</span>
          <span className="dash__statlabel">{tr("累计 Token 数")}</span>
        </div>
        <div className="dash__stat">
          <span className="dash__statvalue">{formatWan(stats.peakTokens)}</span>
          <span className="dash__statlabel">{tr("峰值 Token 数")}</span>
        </div>
        <div className="dash__stat">
          <span className="dash__statvalue">{formatMinutes(stats.chatMinutes)}</span>
          <span className="dash__statlabel">{tr("累计聊天时长")}</span>
        </div>
        <div className="dash__stat">
          <span className="dash__statvalue">{String(stats.currentStreak)}{tr("天")}</span>
          <span className="dash__statlabel">{tr("当前连续天数")}</span>
        </div>
        <div className="dash__stat">
          <span className="dash__statvalue">{String(stats.longestStreak)}{tr("天")}</span>
          <span className="dash__statlabel">{tr("最长连续天数")}</span>
        </div>
      </div>

      <section className="dash__card">
        <div className="dash__cardhead">
          <h4 className="dash__cardtitle">{tr("Token 活动")}</h4>
          <div className="dash__tabs">
            {(["day", "week", "month"] as const).map((u) => (
              <button
                type="button"
                key={u}
                className={"dash__tab" + (unit === u ? " dash__tab--on" : "")}
                onClick={() => setUnit(u)}
              >
                {u === "day" ? tr("每日") : u === "week" ? tr("每周") : tr("累计")}
              </button>
            ))}
          </div>
        </div>
        {unit === "day" ? (
          <div className="dash__heat">
            {grid.map((col, ci) => (
              <div className="dash__heatcol" key={ci}>
                {col.map((cell, di) =>
                  cell.day === null ? (
                    <span className="dash__cell dash__cell--void" key={di} />
                  ) : (
                    <span
                      className={"dash__cell dash__cell--l" + String(levelOf(cell.tokens, maxCell))}
                      key={di}
                      title={cell.day + " · " + String(cell.tokens) + " tokens"}
                    />
                  ),
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="dash__strip">
            {(strips ?? []).map((b) => (
              <span
                className={"dash__cell dash__cell--big dash__cell--l" + String(levelOf(b.tokens, Math.max(1, ...(strips ?? []).map((x) => x.tokens))))}
                key={b.key}
                title={b.key + " · " + String(b.tokens) + " tokens"}
              />
            ))}
          </div>
        )}
      </section>

      <section className="dash__card">
        <div className="dash__cardhead">
          <h4 className="dash__cardtitle">{tr("每日 Token 趋势图")}</h4>
          <div className="dash__tabs">
            {([7, 30] as const).map((r) => (
              <button
                type="button"
                key={r}
                className={"dash__tab" + (range === r ? " dash__tab--on" : "")}
                onClick={() => setRange(r)}
              >
                {r === 7 ? tr("近 7 日") : tr("近 30 日")}
              </button>
            ))}
          </div>
        </div>
        <div className="dash__legend">
          {series.map((s, i) => (
            <span className="dash__legenditem" key={s.model}>
              <span className="dash__dot" style={{ background: LINE_COLORS[i % LINE_COLORS.length] }} />
              {s.model}
            </span>
          ))}
        </div>
        <svg className="dash__trend" viewBox="0 0 700 220" role="img" aria-label={tr("每日 Token 趋势")}>
          {[0, 1, 2, 3].map((i) => (
            <line key={i} className="dash__gridline" x1={10} x2={690} y1={20 + i * 60} y2={20 + i * 60} />
          ))}
          {series.map((s, i) => {
            const n = s.points.length;
            if (n === 0) return null;
            const pts = s.points
              .map((p, pi) => {
                const x = n === 1 ? 350 : 10 + (pi / (n - 1)) * 680;
                const y = 200 - (p.tokens / maxTrend) * 180;
                return x.toFixed(1) + "," + y.toFixed(1);
              })
              .join(" ");
            return <polyline key={s.model} className="dash__line" points={pts} style={{ stroke: LINE_COLORS[i % LINE_COLORS.length] }} />;
          })}
          <line className="dash__axis" x1={10} x2={690} y1={200} y2={200} />
        </svg>
        <div className="dash__xlabels">
          <span>{series[0]?.points[0]?.day ?? ""}</span>
          <span>{series[0]?.points[series[0].points.length - 1]?.day ?? ""}</span>
        </div>
      </section>

      <section className="dash__card">
        <h4 className="dash__cardtitle">{tr("模型用量")}</h4>
        <div className="dash__models">
          <svg className="dash__donut" viewBox="0 0 42 42" role="img" aria-label={tr("模型用量占比")}>
            {(() => {
              let acc = 0;
              return shares.map((s, i) => {
                const dash = s.sharePct;
                const off = acc;
                acc += dash;
                return (
                  <circle
                    key={s.model}
                    className="dash__donutseg"
                    cx={21}
                    cy={21}
                    r={15.915}
                    style={{
                      stroke: LINE_COLORS[i % LINE_COLORS.length],
                      strokeDasharray: dash + " " + (100 - dash),
                      strokeDashoffset: 25 - off,
                    }}
                  />
                );
              });
            })()}
          </svg>
          <div className="dash__modelrows">
            {shares.map((s, i) => (
              <div className="dash__modelrow" key={s.model}>
                <span className="dash__dot" style={{ background: LINE_COLORS[i % LINE_COLORS.length] }} />
                <span className="dash__modelname">{s.model}</span>
                <span className="dash__modeltokens">{formatWan(s.tokens)}</span>
                <span className="dash__modelshare">{String(s.sharePct)}%</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
