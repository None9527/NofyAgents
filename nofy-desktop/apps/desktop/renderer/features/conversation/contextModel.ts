/**
 * contextModel —— 上下文圆环浮层的视图模型（纯函数，node 下可测）。
 *
 * ## 形态依据（逆向树逐字对照）
 *
 * 活壳那枚环点开是 HoverCard（openDelay/closeDelay=0，side=top，sideOffset=2），
 * 内容宽 w-80、rounded-xl、bg-menu、p-3、space-y-3：
 *   标题行  chat.contextUsage.title + 右侧等宽汇总 "used/total (pct%)"
 *   分段条  SegmentedProgress：外框宽 = 用量比，内部分段 flexBasis = 各来源占比，
 *           色阶 = usage-chart-1 与 surface 按 100/78/58/42/28% color-mix
 *   图例行  8px 色块 + 来源名 + 右对齐百分比（tabular-nums）
 * 参照：desktop/src/src/components/shell/Home.tsx:5615-5856（C3e/O3e/k3e/T3e/j3e）
 * 与 components/composer/ModelSelector.tsx:640-687（SegmentedProgress）、:723-783（环与浮层壳）。
 *
 * ## 数据换成内核真字段（一条不造）
 *
 * 活壳的 breakdown 来自它自家后端的 {source, chars} 列表；nofy 的 `_nofy/session/info`
 * 给的是**已算好的 token 数**（session-read-shapes.json 实测）：
 *   messageTokens/messageCount · systemPromptTokens ·
 *   toolDefinitionsTokens/toolDefinitionsCount · usageCategories[] ·
 *   turnCount/toolCallCount/compactionCount · freeTokens · autoCompactThresholdPercent
 * ⇒ 界面不做估算、不解析文本，只做**归类与占比**。
 *
 * ## usageCategories 为什么单列一张表（关键诚实点）
 *
 * 内核源码明写这些行**与 message_tokens 重叠**：
 *   crates/codegen/nofy-shell/src/session/acp_types.rs:160-167
 *   「Once injected, these rows overlap ContextInfo::message_tokens」
 * ⇒ 绝不能把它们塞进同一条堆叠条相加（会重复计数）。
 * 处置：堆叠条只用三个互斥来源（消息 / 系统提示 / 工具定义），
 * usageCategories 另起一列，并标注「已计入消息」。
 */
import type { ContextInfo } from "../../ui/readers.ts";
import type { TurnUsage } from "../../core/store/state.ts";

/** 堆叠条的三个互斥来源。id 沿用活壳 breakdown 的 source 词汇，便于对照。 */
export const SEGMENT_ORDER: Record<string, number> = {
  messages: 0,
  system_prompt: 1,
  system_tool_schemas: 2,
};

export type ContextSegment = {
  id: string;
  label: string;
  tokens: number;
  /** 计数补语（「6 条」/「25 个工具」）；内核没给计数时为 null。 */
  detail: string | null;
  /** 占**已归类总量**的比例（0..1），与活壳 percent 同语义。 */
  percent: number;
  /** 色阶序号 = 排序后的位次（活壳 resolveUsageChartSegmentStyle 同法）。 */
  colorIndex: number;
};

/** usageCategories 的一行（技能/工作流/MCP 服务器清单占位）。 */
export type ContextListing = { id: string; label: string; tokens: number; detail: string | null };

/** 底部统计行（余量、阈值、回合、工具调用、压缩）。 */
export type ContextStat = { id: string; label: string; value: string; strong?: boolean };

/**
 * 提示词缓存三桶（turn_completed.usage 实测 camelCase 三键）：
 *   读 = cachedReadTokens · 建 = cacheCreationTokens · 未缓存 = inputTokens
 * （内核 notification.rs:1048 明写 input_tokens 是 uncached prompt 部分，
 *   三桶互斥且穷尽 prompt 侧 ⇒ 命中率＝读/三桶和，不需要再猜分母。）
 */
export type CacheView = {
  hasData: boolean;
  /** 命中率 0..1；三桶和为 0 时 null（不除零、不编数）。 */
  hit: number | null;
  read: number;
  creation: number;
  uncached: number;
};

export function cacheView(turn: TurnUsage | null): CacheView {
  if (turn === null) return { hasData: false, hit: null, read: 0, creation: 0, uncached: 0 };
  const total = turn.cachedReadTokens + turn.cacheCreationTokens + turn.inputTokens;
  return {
    hasData: true,
    hit: total > 0 ? turn.cachedReadTokens / total : null,
    read: turn.cachedReadTokens,
    creation: turn.cacheCreationTokens,
    uncached: turn.inputTokens,
  };
}

export type ContextView = {
  /** false = 内核还没回传 context 块；此时只画 track 环 + 诚实文案，不编数字。 */
  hasData: boolean;
  title: string;
  /** 等宽汇总："22,026 / 131,072（17%）"。 */
  summary: string;
  /** 环与条的 aria/title 文案。 */
  ringLabel: string;
  /** 用量百分比（内核 usagePct，取整夹逼 0..100）。 */
  pct: number;
  /** 条的几何宽度（0..1，用 used/total 精确值，不取整）。 */
  ratio: number;
  warn: boolean;
  segments: ContextSegment[];
  listings: ContextListing[];
  stats: ContextStat[];
  /** 自动压缩阈值刻度（0..100）；内核没给为 null。 */
  thresholdPct: number | null;
  /** 本轮提示词缓存命中率（内圈弧 + 浮层两行）；无轮级 usage 时 hasData=false。 */
  cache: CacheView;
};

/** 千分位。上下文数字要看精确值（不是「2.2 万」），故不用 usageModel.formatWan。 */
export function formatTokens(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

/**
 * 内核 detail 是英文计数串（"21 skills" / "3 servers"，acp_types.rs:206 count_detail）。
 * 产品文案不出内部术语也不出英文，故按「数字 + 名词」映射；认不出的原样保留（不猜）。
 */
export function localizeDetail(detail: string | null): string | null {
  if (detail === null) return null;
  const m = /^(\d+)\s+(skill|workflow|server)s?$/.exec(detail.trim());
  if (m === null) return detail;
  const noun = m[2] === "skill" ? "个技能" : m[2] === "workflow" ? "个工作流" : "个服务器";
  return m[1] + " " + noun;
}

/** usageCategories 的 label 是内核给的英文显示名；已知三项译中文，未知原样。 */
export function localizeCategoryLabel(label: string): string {
  if (label === "Skills") return "技能清单";
  if (label === "Workflows") return "工作流清单";
  if (label === "MCP servers") return "MCP 服务器清单";
  return label;
}

function clampPct(n: number): number {
  return Math.min(100, Math.max(0, Math.round(n)));
}

/**
 * 三个互斥来源 → 排序后的分段（占比按**已归类总量**，与活壳 aggregateContextUsageBreakdown
 * 同法：先求和，再按 tokens 降序、同量按 SEGMENT_ORDER 稳定排序）。
 */
export function contextSegments(ctx: ContextInfo): ContextSegment[] {
  const raw: Array<{ id: string; label: string; tokens: number | null; detail: string | null }> = [
    {
      id: "messages",
      label: "消息",
      tokens: ctx.messageTokens,
      detail: ctx.messageCount !== null ? ctx.messageCount + " 条" : null,
    },
    { id: "system_prompt", label: "系统提示", tokens: ctx.systemPromptTokens, detail: null },
    {
      id: "system_tool_schemas",
      label: "工具定义",
      tokens: ctx.toolDefinitionsTokens,
      detail: ctx.toolDefinitionsCount !== null ? ctx.toolDefinitionsCount + " 个工具" : null,
    },
  ];
  const kept = raw.filter((r): r is { id: string; label: string; tokens: number; detail: string | null } =>
    typeof r.tokens === "number" && Number.isFinite(r.tokens) && r.tokens > 0,
  );
  const sum = kept.reduce((acc, r) => acc + r.tokens, 0);
  if (sum <= 0) return [];
  return kept
    .map((r) => ({ id: r.id, label: r.label, tokens: r.tokens, detail: r.detail, percent: r.tokens / sum }))
    .sort(
      (a, b) =>
        b.tokens - a.tokens || (SEGMENT_ORDER[a.id] ?? 99) - (SEGMENT_ORDER[b.id] ?? 99),
    )
    .map((s, i) => ({ ...s, colorIndex: Math.min(i, 4) }));
}

export function contextListings(ctx: ContextInfo): ContextListing[] {
  return ctx.usageCategories
    .filter((c) => Number.isFinite(c.tokens) && c.tokens > 0)
    .map((c, i) => ({
      id: c.label + ":" + String(i),
      label: localizeCategoryLabel(c.label),
      tokens: c.tokens,
      detail: localizeDetail(c.detail),
    }));
}

/** 距自动压缩阈值还剩多少 token（内核给了阈值百分比才算；界面不猜默认值）。 */
export function tokensToThreshold(ctx: ContextInfo): number | null {
  if (ctx.thresholdPct === null) return null;
  const limit = (ctx.total * ctx.thresholdPct) / 100;
  return Math.max(0, Math.round(limit - ctx.used));
}

export function contextStats(ctx: ContextInfo): ContextStat[] {
  const out: ContextStat[] = [
    { id: "free", label: "剩余可用", value: formatTokens(ctx.freeTokens) + " tok", strong: true },
  ];
  const gap = tokensToThreshold(ctx);
  if (ctx.thresholdPct !== null) {
    out.push({
      id: "threshold",
      label: "自动压缩阈值",
      value: ctx.thresholdPct + "%" + (gap !== null ? " · 还剩 " + formatTokens(gap) + " tok" : ""),
    });
  }
  if (ctx.turnCount !== null) out.push({ id: "turns", label: "回合", value: String(ctx.turnCount) });
  if (ctx.toolCallCount !== null) out.push({ id: "tools", label: "工具调用", value: String(ctx.toolCallCount) });
  if (ctx.compactionCount !== null) {
    out.push({ id: "compactions", label: "已压缩", value: String(ctx.compactionCount) + " 次" });
  }
  return out;
}

/** 浮层缓存两行：命中率（加粗）+ 三桶明细。hit=null 时命中率画「—」。 */
export function cacheStats(cache: CacheView): ContextStat[] {
  if (!cache.hasData) return [];
  return [
    {
      id: "cache-hit",
      label: "本轮缓存命中",
      value: cache.hit === null ? "—" : String(Math.round(cache.hit * 1000) / 10) + "%",
      strong: true,
    },
    {
      id: "cache-split",
      label: "缓存 读/建/未缓存",
      value:
        formatTokens(cache.read) + " / " + formatTokens(cache.creation) + " / " + formatTokens(cache.uncached),
    },
  ];
}

const EMPTY_LABEL = "上下文用量：等待内核回传（_nofy/session/info 的 context 块）";

/** ctx=null 也要给一个视图：track 环常亮、arc 0、文案诚实（活壳同行为）。 */
export function contextView(ctx: ContextInfo | null, turn: TurnUsage | null = null): ContextView {
  const cache = cacheView(turn);
  if (ctx === null) {
    return {
      hasData: false,
      title: "上下文用量",
      summary: "—",
      ringLabel: EMPTY_LABEL,
      pct: 0,
      ratio: 0,
      warn: false,
      segments: [],
      listings: [],
      stats: cacheStats(cache),
      thresholdPct: null,
      cache,
    };
  }
  const pct = clampPct(ctx.usagePct);
  const ratio = ctx.total > 0 ? Math.min(1, Math.max(0, ctx.used / ctx.total)) : 0;
  const warn = ctx.thresholdPct !== null && pct >= ctx.thresholdPct;
  return {
    hasData: true,
    title: "上下文用量",
    summary: formatTokens(ctx.used) + " / " + formatTokens(ctx.total) + "（" + String(pct) + "%）",
    ringLabel:
      "上下文已用 " + formatTokens(ctx.used) + " / 总量 " + formatTokens(ctx.total) +
      "（" + String(pct) + "%，余 " + formatTokens(ctx.freeTokens) + " tok）" +
      (ctx.thresholdPct !== null ? " · 自动压缩阈值 " + String(ctx.thresholdPct) + "%" : "") +
      (cache.hit !== null ? " · 本轮缓存命中 " + String(Math.round(cache.hit * 1000) / 10) + "%" : ""),
    pct,
    ratio,
    warn,
    segments: contextSegments(ctx),
    listings: contextListings(ctx),
    stats: contextStats(ctx).concat(cacheStats(cache)),
    thresholdPct: ctx.thresholdPct,
    cache,
  };
}
