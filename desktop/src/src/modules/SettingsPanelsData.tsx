/* eslint-disable */
/**
 * ============================================================================
 * SettingsPanelsData.tsx — ZCode 3.7.6 Settings 大体量叶子分区（D8 Stage B3 · 第三批）
 *   用量分区（p1t，图表消费装配）/ 迁移分区（V2t）/ 记忆预览与代码块渲染器（U8/gk）
 * ============================================================================
 *
 * 来源文件（融合 chunk，213,695 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js
 * 对照文件（同一 chunk 的 pretty-print 版）：
 *   /home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx
 *
 * 说明（用量分区图表消费面）：图表本体位于独立异步 chunk，已在先前批次恢复为
 *   modules/appUsageDailyModelBarChart.tsx、modules/appUsageModelUsagePieChart.tsx、
 *   modules/codingPlanUsageLineChart.tsx、modules/appUsageChartPalette.tsx。
 * 本文件只重建 styles 内的消费装配：lazy 包装（Q$t/$$t/i1t）、ErrorBoundary+Suspense
 *   壳（U7）、快照/错误/空态/刷新编排（e1t/a1t/…）。
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号格式：融合chunk js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 * A. 用量分区（p1t，js 195890–195991 / jsx 157519–157534；消费面 157119–157518）
 *   p1t  → UsageSettingsSection           分区根（app|codingPlan 分派）(195890 / 157519)
 *   e1t  → AppUsageDashboard              app 用量仪表盘 (195350 / 157165)
 *   a1t  → CodingPlanUsageDashboard       Coding Plan 仪表盘 (195530 / 157259)
 *   U7   → UsageChartBoundary             ErrorBoundary(p4)+Suspense 壳 (jsx 157119)
 *   W7   → UsageErrorBanner              凭证/通用错误横幅 (jsx 157148)
 *   Y$t  → USAGE_CREDENTIAL_ERROR_PATTERNS (jsx 157137)
 *   X$t  → isCredentialError              (jsx 157138)
 *   Z$t  → usageErrorMessage              (jsx 157141)
 *   G7   → AppUsageRangeTabs              7d|30d… 区间切换 (jsx 157225)
 *   s1t  → CodingPlanRangeTabs            today|7d|30d (jsx 157360)
 *   c1t  → CodingPlanQuotaCards           5h/周/月 MCP 配额卡 (jsx 157378)
 *   l1t  → CodingPlanTrendsSection        趋势区（区间+刷新+双图）(jsx 157424)
 *   u1t  → CodingPlanModelUsageSection    (jsx 157447)
 *   d1t  → CodingPlanToolUsageSection     (jsx 157479)
 *   f1t  → UsageSummaryStatGrid           4 格统计 (jsx 157512)
 *   t1t  → shortModelName                 (jsx 157222)
 *   n1t  → modelSeriesOf                  (jsx 157244)
 *   r1t  → toolSeriesOf                   (jsx 157250)
 *   o1t  → resolveSourceProviderName      (jsx 157353)
 *   Q$t  → LazyAppUsageDailyModelBarChart  ← AppUsageDailyModelBarChart-037NXfkz.js (jsx 157159)
 *   $$t  → LazyAppUsageModelUsagePieChart  ← AppUsageModelUsagePieChart-_KCE1AAL.js (jsx 157161)
 *   i1t  → LazyCodingPlanUsageLineChart    ← CodingPlanUsageLineChart-BpNLwqMV.js (jsx 157256)
 *   （接口级）：p4 ErrorBoundary (129952 / jsx 109217)、q$t useAppUsageStats (jsx 156996)、
 *    J$t useCodingPlanUsageStats (jsx 157047)、Fa LoadingPlaceholder、Pa StatCard、
 *    Zre UsageHeatmap、Da/Aa/Qre/Jre 格式化、$j 订阅快照、rM 缓存键 (47401)、
 *    Sq/Cq/wq/$4e 配额助手、iw 分区跳转 (35393)、ai 区间枚举、
 *    Mye/yv/vv/j_/cye/y_/Mv 图标
 *
 * B. 迁移分区（V2t，js 203587–203929 / jsx 162409–162541；z9 导入族）
 *   V2t  → MigrationSettingsSection       分区根 (203587 / 162409)
 *   I2t  → useClaudeMigration             扫描/导入状态机 (203145 / 162189)
 *   z2t  → MigrationCandidatesCard        候选会话卡 (203332 / 162321)
 *   R2t  → MigrationResultItemList        跳过/失败明细 (jsx 162310)
 *   L2t  → migrationSkipReasonLabel       (jsx 162301)
 *   B2t  → MIGRATION_RANGES               [7d,30d,90d,all] (jsx 162408)
 *   （接口级）：F2t/P2t/N2t/k2t 过滤与限额助手 (162186/162181/162178/162170)、
 *    Qie 导入后刷新 (945)、hc useWorkspaceTabsStore (3609)、
 *    B3/V3 Card/CardContent（Settings.tsx 已抽取）、bMt/xMt/SMt/CMt CardHeader 族
 *    (jsx 113720–113743)、S9/w9/C9 Alert 族（Settings.tsx 已抽取）
 *
 * C. 渲染器（跨族叶子）
 *   U8   → MemoryFilePreview              记忆文件预览（Markdown 包装）(160323 / 132773)
 *   gk   → CodeBlock                      代码块（shiki+mermaid+换行）(48634 / 43829)
 *   _k   → CodeBlockWrapLinesButton       (jsx 43898)
 *   iBe  → CodeBlockMermaidPreviewButton  (jsx 43907)
 *   vk   → CodeBlockCopyButton            (jsx 43934)
 *   （接口级）：cj MarkdownRenderer（F19，Markdown.tsx 已抽取）、nBe 代码块壳、
 *    fk CodeBlockContext (jsx 43775)、BO MermaidPreview、MO ShikiHighlight、
 *    Oze/Pze/Mze mermaid 判定、Qze 预览对话框、Tbe/mv/W_/M_ 图标
 * ============================================================================
 */

import * as React from "react";
import { Input } from './ImeComposition';
import { CodeBlockFrame, MarkdownRenderer, documentVisibilityState, isMermaidBlock } from './MarkdownIntegration';
import { MIGRATION_DEFAULT_LIMIT, modifiedSinceOfRange, parseScanLimit, resolveWorkspaceFilterMode } from './McpHelpers';
import { Badge } from './PaymentDeep';
import { Alert, AlertDescription, SelectContent, SelectItem, SelectTrigger, SelectValue, Tabs, TabsList, TabsTrigger } from './Settings';
import { findQuotaLimit, formatQuotaResetTime, formatQuotaUsage, providerCacheKey, quotaPercent, useAppUsageStats, useCodingPlanUsageStats, useSubscriptionSnapshot } from './UsageDeep';
import { UsageHeatmap, formatPercent } from './UsageStatsUiParts';
import { cn } from './UtilsCn';
import { useZCodeIntl as useIntlContext } from './I18n';
import { t as logger } from './logger';
import { InfoTooltip as Tooltip, UsageEmptyState as LoadingPlaceholder, UsageStatCard as StatCard, formatTokens as formatTokenCount, formatCountCompact as formatInteger, resolveModelLabel as modelDisplayName } from './UsageStatsUiParts'; // Ia / Fa / Pa / Da / Aa / Jre
import { SettingsCard as Card, SettingsCardContent as CardContent, requestSettingsSectionNavigation as navigateToSettingsSection } from './Settings'; // B3 / V3 / iw（35393）
import { MermaidInlinePreview as MermaidPreview, mermaidAutoRenderGate as evaluateMermaidAutoRender, useDocumentVisibilityTick as mermaidAutoRenderDependency } from './MarkdownIntegration'; // BO / Pze / tBe
import { HighlightedCodeBlock as ShikiHighlight } from './HighlightedCodeBlock'; // MO
import { MermaidFullscreenDialog as MermaidPreviewDialog } from './PreviewCards'; // Qze
import { type CodePreviewSettings } from './stores-core';

/* ============================================================================
 * 0. 外部依赖的类型声明
 * ==========================================================================*/

interface IntlShape {
  formatMessage(descriptor: { id: string }, values?: Record<string, unknown>): string;
}


declare const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "secondary" | "ghost" | "outline" | "link" | "destructive";
    size?: "xs" | "sm" | "lg" | "icon-sm" | "icon-md";
  }
>;
declare const SpinnerIcon: React.FC<React.SVGProps<SVGSVGElement>>;
declare const SelectRoot: React.FC<{
  value: string;
  onValueChange: (v: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}>;

declare const TokensIcon: React.FC<React.SVGProps<SVGSVGElement>>; // Mye
declare const BoltIcon: React.FC<React.SVGProps<SVGSVGElement>>; // yv
declare const MessageIcon: React.FC<React.SVGProps<SVGSVGElement>>; // vv
declare const CalendarIcon: React.FC<React.SVGProps<SVGSVGElement>>; // j_
declare const FlameIcon: React.FC<React.SVGProps<SVGSVGElement>>; // cye
declare const StarIcon: React.FC<React.SVGProps<SVGSVGElement>>; // y_
declare const RefreshIcon: React.FC<React.SVGProps<SVGSVGElement>>; // Mv
declare const AlertIcon: React.FC<React.SVGProps<SVGSVGElement>>; // N
declare const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>>; // M_
declare const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>>; // G_

/* ============================================================================
 * 1. 用量分区（原 p1t 及消费面，jsx 157119–157534）
 * ==========================================================================*/

/* --- 数据层（接口级；行号见头部映射 §A） --- */

export interface AppUsageSnapshot {
  range: string;
  generatedAt: number;
  summary: {
    totalTokens: number;
    totalSessions: number;
    totalTurns: number;
    activeDays: number;
    currentStreakDays: number;
    favoriteModel?: { modelId: string; share: number } | null;
  };
  heatmap: { weeks: unknown[] };
  [key: string]: unknown;
}
export interface CodingPlanUsageSnapshot {
  range: string;
  generatedAt: number;
  quota?: { limits?: unknown[] };
  sourceProvider: { id: string; name: string };
  modelUsage: {
    totalTokensUsage: number;
    xTime: unknown[];
    granularity: string;
    modelSummaryList: Array<{ modelName: string; totalTokens: number }>;
    modelDataList: Array<{ modelName: string; tokensUsage: number[] }>;
  };
  toolUsage: {
    xTime: unknown[];
    granularity: string;
    toolSummaryList: Array<{ toolName: string; totalUsageCount: number }>;
    toolDataList: Array<{ toolName: string; usageCount: number[] }>;
  };
  [key: string]: unknown;
}

interface ModelProvider {
  id: string;
  name: string;
  [key: string]: unknown;
}
declare const PROVIDER_IDS: { zaiCodingPlan: string; bigmodelCodingPlan: string }; // q（skillStore chunk）

/* --- 展示原语（接口级） --- */

declare const UsageErrorBoundary: React.FC<{
  scope: string;
  resetKeys: unknown[];
  variant: "inline";
  children: React.ReactNode;
}>; // p4（129952 / jsx 109217）
declare const APP_USAGE_RANGES: string[]; // ai（usageStats chunk）

/* --- 图表 lazy 消费（原 Q$t/$$t/i1t；图表本体已在 appUsage* 模块恢复） --- */

/** 原 Q$t（jsx 157159）：lazy ← AppUsageDailyModelBarChart-037NXfkz.js（deps 321…325） */
declare const LazyAppUsageDailyModelBarChart: React.LazyExoticComponent<React.FC<{ snapshot: AppUsageSnapshot }>>;
/** 原 $$t（jsx 157161）：lazy ← AppUsageModelUsagePieChart-_KCE1AAL.js（deps 326…325） */
declare const LazyAppUsageModelUsagePieChart: React.LazyExoticComponent<React.FC<{ snapshot: AppUsageSnapshot }>>;
/** 原 i1t（jsx 157256）：lazy ← CodingPlanUsageLineChart-BpNLwqMV.js（deps 327…324） */
declare const LazyCodingPlanUsageLineChart: React.LazyExoticComponent<
  React.FC<{
    xTime: unknown[];
    granularity: string;
    emptyDescription: string;
    series: Array<{ name: string; values: number[] }>;
    valueKind?: "token";
  }>
>;

/** 原 Y$t（jsx 157137）：凭证类错误模式 */
const USAGE_CREDENTIAL_ERROR_PATTERNS: RegExp[] = [
  /token\s+(expired|incorrect)/i,
  /expired.*token/i,
  /incorrect.*token/i,
  /invalid.*(?:api\s*)?key/i,
  /(?:api\s*)?key.*invalid/i,
  /unauthorized/i,
  /forbidden/i,
  /\b40[13]\b/,
  /认证|鉴权|授权|密钥|无效|过期/i,
];

/** 原 X$t（jsx 157138） */
export function isUsageCredentialError(error: string | null): boolean {
  return error ? USAGE_CREDENTIAL_ERROR_PATTERNS.some((pattern) => pattern.test(error)) : false;
}

/** 原 Z$t（jsx 157141） */
export function usageErrorMessage(intl: IntlShape, scope: string, error: string | null): string {
  return isUsageCredentialError(error)
    ? intl.formatMessage({ id: `usage.error.${scope}.credential` })
    : intl.formatMessage({ id: `usage.error.${scope}.generic` });
}

/** 原 W7（jsx 157148）：错误横幅（凭证错误 → warning + 跳转模型供应商） */
export function UsageErrorBanner({ error }: { error: string | null }) {
  const { intl } = useIntlContext();
  const credential = isUsageCredentialError(error);
  return (
    <div
      className={
        credential
          ? "flex items-center justify-between gap-3 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-ui-base text-foreground"
          : "flex items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-ui-base text-destructive"
      }
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <AlertIcon className={credential ? "size-4 shrink-0 text-warning" : "size-4 shrink-0 text-destructive"} />
        <span className="min-w-0 truncate whitespace-nowrap">{usageErrorMessage(intl, "stats", error)}</span>
      </div>
      {credential ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 shrink-0 rounded-md bg-background"
          onClick={() => navigateToSettingsSection("modelProvider")}
        >
          {intl.formatMessage({ id: "settings.usage.checkApiKey" })}
        </Button>
      ) : null}
    </div>
  );
}

/** 原 U7（jsx 157119）：图表消费壳（ErrorBoundary + Suspense，inline 变体） */
export function UsageChartBoundary(props: {
  children: React.ReactNode;
  loadingDescription: string;
  resetKeys: unknown[];
  scope: string;
}) {
  const { children, loadingDescription, resetKeys, scope } = props;
  const { intl } = useIntlContext();
  return (
    <UsageErrorBoundary scope={scope} resetKeys={resetKeys} variant="inline">
      <React.Suspense
        fallback={<LoadingPlaceholder title={intl.formatMessage({ id: "settings.usage.loadingTitle" })} description={loadingDescription} />}
      >
        {children}
      </React.Suspense>
    </UsageErrorBoundary>
  );
}

/** 原 t1t（jsx 157222）：模型短名（去路径前缀） */
export function shortModelName(modelId: string): string {
  return modelId.split("/").at(-1)?.trim() || modelId;
}

/** 原 G7（jsx 157225）：app 用量区间 Tabs */
export function AppUsageRangeTabs(props: { range: string; onRangeChange: (range: string) => void }) {
  const { range, onRangeChange } = props;
  const { intl } = useIntlContext();
  return (
    <Tabs value={range} onValueChange={(value) => onRangeChange(value)} className="shrink-0">
      <TabsList className="flex h-8 rounded-lg border border-border bg-background p-1">
        {APP_USAGE_RANGES.map((rangeId) => (
          <TabsTrigger key={rangeId} value={rangeId} className="h-6 rounded-md px-2.5 text-ui-base data-active:bg-secondary data-active:text-foreground">
            {intl.formatMessage({ id: `settings.usage.range.${rangeId}` })}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

/** 原 e1t（jsx 157165）：app 用量仪表盘（统计卡 + 热力图 + 日柱状 + 模型饼图 + 刷新） */
export function AppUsageDashboard() {
  const { intl, locale } = useIntlContext();
  const [range, setRange] = React.useState("30d");
  const { snapshot, loading, error, refresh } = useAppUsageStats(range);

  if (loading && !snapshot) {
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-ui-base font-medium text-foreground">{intl.formatMessage({ id: "settings.usage.appUsageRangeTitle" })}</div>
          <AppUsageRangeTabs range={range} onRangeChange={setRange} />
        </div>
        <LoadingPlaceholder
          title={intl.formatMessage({ id: "settings.usage.loadingTitle" })}
          description={intl.formatMessage({ id: "settings.usage.appUsageLoadingDescription" })}
        />
      </div>
    );
  }

  if (!snapshot) {
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-ui-base font-medium text-foreground">{intl.formatMessage({ id: "settings.usage.appUsageRangeTitle" })}</div>
          <AppUsageRangeTabs range={range} onRangeChange={setRange} />
        </div>
        {error ? <UsageErrorBanner error={error} /> : null}
        <LoadingPlaceholder
          title={intl.formatMessage({ id: "settings.usage.emptyTitle" })}
          description={intl.formatMessage({ id: "settings.usage.emptyDescription" })}
        />
      </div>
    );
  }

  const favoriteModel = snapshot.summary.favoriteModel;
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-ui-base font-medium text-foreground">{intl.formatMessage({ id: "settings.usage.appUsageRangeTitle" })}</div>
        <AppUsageRangeTabs range={range} onRangeChange={setRange} />
      </div>
      {error ? <UsageErrorBanner error={error} /> : null}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={TokensIcon} label={intl.formatMessage({ id: "settings.usage.totalTokens" })} value={formatTokenCount(locale, snapshot.summary.totalTokens)} />
        <StatCard icon={BoltIcon} label={intl.formatMessage({ id: "settings.usage.sessions" })} value={formatInteger(locale, snapshot.summary.totalSessions)} />
        <StatCard icon={MessageIcon} label={intl.formatMessage({ id: "settings.usage.messages" })} value={formatInteger(locale, snapshot.summary.totalTurns)} />
        <StatCard icon={CalendarIcon} label={intl.formatMessage({ id: "settings.usage.activeDays" })} value={formatInteger(locale, snapshot.summary.activeDays)} />
        <StatCard icon={FlameIcon} label={intl.formatMessage({ id: "settings.usage.currentStreak" })} value={formatInteger(locale, snapshot.summary.currentStreakDays)} />
        <StatCard
          icon={StarIcon}
          label={intl.formatMessage({ id: "settings.usage.favoriteModel" })}
          value={favoriteModel ? shortModelName(modelDisplayName(intl, favoriteModel.modelId)) : "--"}
          valueSize="sm"
          helper={
            favoriteModel
              ? intl.formatMessage({ id: "settings.usage.favoriteModelShare" }, { share: formatPercent(locale, favoriteModel.share) })
              : undefined
          }
        />
      </div>
      {snapshot.heatmap.weeks.length > 0 ? <UsageHeatmap locale={locale} intl={intl} weeks={snapshot.heatmap.weeks} /> : null}
      <UsageChartBoundary
        scope="settings.usage.app-daily-model-chart"
        resetKeys={[snapshot.range, snapshot.generatedAt]}
        loadingDescription={intl.formatMessage({ id: "settings.usage.appUsageLoadingDescription" })}
      >
        <LazyAppUsageDailyModelBarChart snapshot={snapshot} />
      </UsageChartBoundary>
      <UsageChartBoundary
        scope="settings.usage.app-model-pie-chart"
        resetKeys={[snapshot.range, snapshot.generatedAt, "model-pie"]}
        loadingDescription={intl.formatMessage({ id: "settings.usage.appUsageLoadingDescription" })}
      >
        <LazyAppUsageModelUsagePieChart snapshot={snapshot} />
      </UsageChartBoundary>
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 rounded-md bg-background"
          onClick={() => {
            refresh();
          }}
        >
          <RefreshIcon className="size-3.5" />
          {intl.formatMessage({ id: "settings.usage.refresh" })}
        </Button>
      </div>
    </div>
  );
}

/** 原 n1t（jsx 157244） */
export function modelSeriesOf(list: Array<{ modelName: string; tokensUsage: number[] }>): Array<{ name: string; values: number[] }> {
  return list.map((entry) => ({ name: entry.modelName, values: entry.tokensUsage }));
}

/** 原 r1t（jsx 157250） */
export function toolSeriesOf(list: Array<{ toolName: string; usageCount: number[] }>): Array<{ name: string; values: number[] }> {
  return list.map((entry) => ({ name: entry.toolName, values: entry.usageCount }));
}

/** 原 o1t（jsx 157353）：来源供应商名解析（team-plan 优先 label） */
export function resolveUsageSourceProviderName(opts: {
  fallbackProviderName?: string;
  snapshot: CodingPlanUsageSnapshot | null;
  source: CodingPlanSource | null;
}): string | undefined {
  return opts.source?.id.startsWith("team-plan:")
    ? opts.source.label || opts.snapshot?.sourceProvider.name || opts.fallbackProviderName
    : opts.snapshot?.sourceProvider.name ?? opts.source?.label ?? opts.fallbackProviderName;
}

export interface CodingPlanSource {
  id: string;
  providerId: string;
  label?: string;
  organizationId?: string;
  projectId?: string;
  [key: string]: unknown;
}

/** 原 s1t（jsx 157360）：Coding Plan 区间 Tabs（today|7d|30d） */
export function CodingPlanRangeTabs(props: { range: string; onRangeChange: (range: string) => void }) {
  const { range, onRangeChange } = props;
  const { intl } = useIntlContext();
  return (
    <Tabs value={range} onValueChange={(value) => onRangeChange(value)}>
      <TabsList className="flex h-8 rounded-lg border border-border bg-background p-1">
        {["today", "7d", "30d"].map((rangeId) => (
          <TabsTrigger key={rangeId} value={rangeId} className="h-6 rounded-md px-2.5 text-ui-base data-active:bg-secondary data-active:text-foreground">
            {intl.formatMessage({ id: `settings.usage.codingPlanRange.${rangeId}` })}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

/** 原 c1t（jsx 157378）：配额卡（5 小时/周/月 MCP；缺失则整节隐藏） */
export function CodingPlanQuotaCards(props: { quota?: { limits?: unknown[] }; providerName?: string }) {
  const { quota, providerName } = props;
  const { intl, locale } = useIntlContext();
  const limits = quota?.limits ?? [];
  const cards = [
    {
      key: "fiveHour",
      label: intl.formatMessage({ id: "settings.usage.entitlementFiveHourUsage" }),
      limit: findQuotaLimit(limits, "TOKENS_LIMIT", 3, 5),
      resetFormat: "dateTime" as const,
    },
    {
      key: "weekly",
      label: intl.formatMessage({ id: "settings.usage.entitlementWeeklyUsage" }),
      limit: findQuotaLimit(limits, "TOKENS_LIMIT", 6),
      resetFormat: "date" as const,
    },
    {
      key: "monthlyTool",
      label: intl.formatMessage({ id: "settings.usage.entitlementMonthlyMcpUsage" }),
      limit: findQuotaLimit(limits, "TIME_LIMIT", 5, 1),
      resetFormat: "date" as const,
    },
  ].filter((card) => !!card.limit);

  if (cards.length === 0) return null;
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-medium text-foreground">{intl.formatMessage({ id: "settings.usage.quotaTitle" })}</h3>
        <div className="text-ui-base font-medium text-foreground-subtle">{providerName}</div>
      </div>
      <div className="flex flex-col gap-3 lg:flex-row">
        {cards.map((card) => {
          const percent = quotaPercent(card.limit) ?? 0;
          const resetLabel = formatQuotaResetTime({
            locale,
            value: (card.limit as { nextResetTime?: unknown }).nextResetTime,
            format: card.resetFormat,
            compactToday: card.key === "fiveHour",
          });
          return (
            <div key={card.key} className="min-w-0 flex-1 rounded-lg bg-surface/70 p-4">
              <div className="text-ui-base text-foreground">{card.label}</div>
              <div className="mt-1 text-3xl font-semibold text-foreground">{formatQuotaUsage(locale, card.limit)}</div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-background">
                <div className="min-w-2 h-full rounded-full bg-brand" style={{ width: `${percent}%` }} />
              </div>
              {resetLabel ? <div className="mt-3 text-ui-base text-foreground-subtle">{resetLabel}</div> : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/** 原 f1t（jsx 157512）：4 格统计（总计 + Top3） */
export function UsageSummaryStatGrid(props: {
  totalLabel: string;
  totalValue: string;
  items: Array<{ label: string; value: string }>;
}) {
  const { totalLabel, totalValue, items } = props;
  return (
    <div className="grid grid-cols-4 gap-3">
      <div className="rounded-lg bg-surface/70 p-3">
        <div className="truncate text-ui-base text-foreground-subtle">{totalLabel}</div>
        <div className="mt-1 truncate text-xl font-semibold text-foreground">{totalValue}</div>
      </div>
      {items.map((item) => (
        <div key={item.label} className="rounded-lg bg-surface/70 p-3">
          <div className="truncate text-ui-base text-foreground-subtle">{item.label}</div>
          <div className="mt-1 truncate text-xl font-semibold text-foreground">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

/** 原 u1t（jsx 157447）：模型用量节（汇总格 + 折线图） */
export function CodingPlanModelUsageSection({ snapshot }: { snapshot: CodingPlanUsageSnapshot }) {
  const { intl, locale } = useIntlContext();
  const summaryList = snapshot.modelUsage.modelSummaryList;
  const series = React.useMemo(() => modelSeriesOf(snapshot.modelUsage.modelDataList), [snapshot.modelUsage.modelDataList]);
  return (
    <section className="space-y-4">
      <h3 className="text-ui-lg font-medium text-foreground">{intl.formatMessage({ id: "settings.usage.modelUsageTitle" })}</h3>
      <UsageSummaryStatGrid
        totalLabel={intl.formatMessage({ id: "settings.usage.tokenTotal" })}
        totalValue={formatTokenCount(locale, snapshot.modelUsage.totalTokensUsage)}
        items={summaryList.slice(0, 4).map((entry) => ({ label: entry.modelName, value: formatTokenCount(locale, entry.totalTokens) }))}
      />
      <UsageChartBoundary
        scope="settings.usage.coding-plan-model-chart"
        resetKeys={[snapshot.sourceProvider.id, snapshot.range, snapshot.generatedAt, "model"]}
        loadingDescription={intl.formatMessage({ id: "settings.usage.codingPlanLoadingDescription" })}
      >
        <LazyCodingPlanUsageLineChart
          xTime={snapshot.modelUsage.xTime}
          granularity={snapshot.modelUsage.granularity}
          emptyDescription={intl.formatMessage({ id: "settings.usage.emptyDescription" })}
          series={series}
          valueKind="token"
        />
      </UsageChartBoundary>
    </section>
  );
}

/** 原 d1t（jsx 157479）：工具用量节 */
export function CodingPlanToolUsageSection({ snapshot }: { snapshot: CodingPlanUsageSnapshot }) {
  const { intl, locale } = useIntlContext();
  const summaryList = snapshot.toolUsage.toolSummaryList;
  const series = React.useMemo(() => toolSeriesOf(snapshot.toolUsage.toolDataList), [snapshot.toolUsage.toolDataList]);
  return (
    <section className="space-y-4">
      <h3 className="text-ui-lg font-medium text-foreground">{intl.formatMessage({ id: "settings.usage.toolUsageTitle" })}</h3>
      <UsageSummaryStatGrid
        totalLabel={intl.formatMessage({ id: "settings.usage.toolCallsTotal" })}
        totalValue={formatInteger(locale, summaryList.reduce((sum, entry) => sum + entry.totalUsageCount, 0))}
        items={summaryList.slice(0, 4).map((entry) => ({
          label: entry.toolName,
          value: `${formatInteger(locale, entry.totalUsageCount)}${intl.formatMessage({ id: "settings.usage.timesUnit" })}`,
        }))}
      />
      <UsageChartBoundary
        scope="settings.usage.coding-plan-tool-chart"
        resetKeys={[snapshot.sourceProvider.id, snapshot.range, snapshot.generatedAt, "tool"]}
        loadingDescription={intl.formatMessage({ id: "settings.usage.codingPlanLoadingDescription" })}
      >
        <LazyCodingPlanUsageLineChart
          xTime={snapshot.toolUsage.xTime}
          granularity={snapshot.toolUsage.granularity}
          emptyDescription={intl.formatMessage({ id: "settings.usage.emptyDescription" })}
          series={series}
        />
      </UsageChartBoundary>
    </section>
  );
}

/** 原 l1t（jsx 157424）：趋势节（标题 + 区间 + 刷新 + 模型/工具双区） */
export function CodingPlanTrendsSection(props: {
  range: string;
  loading: boolean;
  snapshot: CodingPlanUsageSnapshot;
  onRangeChange: (range: string) => void;
  onRefresh: () => void;
}) {
  const { range, loading, snapshot, onRangeChange, onRefresh } = props;
  const { intl } = useIntlContext();
  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-medium text-foreground">{intl.formatMessage({ id: "settings.usage.trendsTitle" })}</h3>
        <div className="flex flex-wrap items-center gap-2">
          <CodingPlanRangeTabs range={range} onRangeChange={onRangeChange} />
          <Button type="button" variant="outline" size="sm" className="h-8 rounded-md bg-background" onClick={onRefresh}>
            {loading ? <SpinnerIcon className="size-3.5 animate-spin" /> : <RefreshIcon className="size-3.5" />}
            {intl.formatMessage({ id: "settings.usage.refresh" })}
          </Button>
        </div>
      </div>
      <CodingPlanModelUsageSection snapshot={snapshot} />
      <CodingPlanToolUsageSection snapshot={snapshot} />
    </section>
  );
}

/** 原 a1t（jsx 157259）：Coding Plan 仪表盘（订阅快照 + 配额 + 趋势） */
export function CodingPlanUsageDashboard(props: {
  availableCodingPlanProviders: ModelProvider[];
  loadingProviders: boolean;
  selectedSource: CodingPlanSource | null;
  workspaceIdentity?: string | null;
  workspacePath?: string;
}) {
  const { availableCodingPlanProviders, loadingProviders, selectedSource, workspaceIdentity } = props;
  const { intl } = useIntlContext();
  const [range, setRange] = React.useState("7d");
  const zaiProvider = availableCodingPlanProviders.find((provider) => provider.id === PROVIDER_IDS.zaiCodingPlan);
  const bigmodelProvider = availableCodingPlanProviders.find((provider) => provider.id === PROVIDER_IDS.bigmodelCodingPlan);
  const source = selectedSource ?? null;
  const providerId = source?.providerId;
  const isTeamPlan = source?.id.startsWith("team-plan:") === true;
  const zaiSnapshotState = useSubscriptionSnapshot({
    enabled: !loadingProviders && providerId === PROVIDER_IDS.zaiCodingPlan,
    includeSubscription: true,
    preferredProviderId: PROVIDER_IDS.zaiCodingPlan,
    requirePreferredProvider: true,
    allowEnvApiKey: false,
    cacheKey: providerCacheKey(zaiProvider),
  });
  const bigmodelSnapshotState = useSubscriptionSnapshot({
    enabled: !loadingProviders && providerId === PROVIDER_IDS.bigmodelCodingPlan && !isTeamPlan,
    includeSubscription: true,
    preferredProviderId: PROVIDER_IDS.bigmodelCodingPlan,
    requirePreferredProvider: true,
    allowEnvApiKey: false,
    cacheKey: providerCacheKey(bigmodelProvider),
  });
  const teamSnapshotState = useSubscriptionSnapshot({
    enabled: !loadingProviders && providerId === PROVIDER_IDS.bigmodelCodingPlan && isTeamPlan,
    includeSubscription: true,
    preferredProviderId: PROVIDER_IDS.bigmodelCodingPlan,
    requirePreferredProvider: true,
    allowEnvApiKey: false,
    organizationId: source?.organizationId,
    projectId: source?.projectId,
    cacheKey: source?.id,
  });
  const activeSnapshotState = providerId === PROVIDER_IDS.zaiCodingPlan ? zaiSnapshotState : isTeamPlan ? teamSnapshotState : bigmodelSnapshotState;
  const subscriptionSnapshot = activeSnapshotState.snapshot;
  const refreshSubscription = activeSnapshotState.refresh;
  const { snapshot, loading, error, refresh } = useCodingPlanUsageStats(range, {
    enabled: !loadingProviders && !!providerId,
    preferredProviderId: providerId,
    organizationId: source?.organizationId,
    projectId: source?.projectId,
  });
  const providerName = resolveUsageSourceProviderName({
    fallbackProviderName: availableCodingPlanProviders[0]?.name,
    snapshot,
    source,
  });

  React.useEffect(() => {
    if (!providerId || !refreshSubscription) return;
    refreshSubscription({ force: true, silent: true });
  }, [refreshSubscription, providerId]);

  if (loadingProviders && !source) {
    return (
      <LoadingPlaceholder
        title={intl.formatMessage({ id: "settings.usage.loadingTitle" })}
        description={intl.formatMessage({ id: "settings.usage.codingPlanLoadingDescription" })}
      />
    );
  }
  if (!loadingProviders && !source) {
    return (
      <LoadingPlaceholder
        title={intl.formatMessage({ id: "settings.usage.codingPlanCurrentConnectionTitle" })}
        description={intl.formatMessage({ id: "settings.usage.codingPlanCurrentConnectionDescription" })}
      />
    );
  }
  return (
    <div className="space-y-5">
      {error ? <UsageErrorBanner error={error} /> : null}
      {loading && !snapshot ? (
        <LoadingPlaceholder
          title={intl.formatMessage({ id: "settings.usage.loadingTitle" })}
          description={intl.formatMessage({ id: "settings.usage.codingPlanLoadingDescription" })}
        />
      ) : snapshot ? (
        <>
          <CodingPlanQuotaCards quota={subscriptionSnapshot?.quota ?? snapshot.quota} providerName={providerName} />
          <CodingPlanTrendsSection
            range={range}
            loading={loading}
            snapshot={snapshot}
            onRangeChange={setRange}
            onRefresh={() => {
              refreshSubscription?.({ force: true, silent: true });
              refresh();
            }}
          />
        </>
      ) : null}
    </div>
  );
}

export interface UsageSettingsSectionProps {
  activeTab: string;
  availableCodingPlanProviders: ModelProvider[];
  modelProvidersLoading: boolean;
  selectedCodingPlanSource: CodingPlanSource | null;
  workspaceIdentity?: string | null;
  workspacePath?: string;
}

/** 原 p1t（js 195890）：用量分区根（app|codingPlan 标签分派；标签由 e4t 提供） */
export function UsageSettingsSection(props: UsageSettingsSectionProps) {
  const { activeTab, availableCodingPlanProviders, modelProvidersLoading, workspaceIdentity, workspacePath, selectedCodingPlanSource } = props;
  return activeTab === "app" ? (
    <AppUsageDashboard />
  ) : (
    <CodingPlanUsageDashboard
      availableCodingPlanProviders={availableCodingPlanProviders}
      loadingProviders={modelProvidersLoading}
      workspaceIdentity={workspaceIdentity}
      workspacePath={workspacePath}
      selectedSource={selectedCodingPlanSource}
    />
  );
}

/* ============================================================================
 * 2. 迁移分区（原 V2t，js 203587–203929 / jsx 162409–162541）
 * ==========================================================================*/

export interface MigrationCandidate {
  sessionId: string;
  previewTitle?: string;
  workspacePath?: string;
  sourcePath?: string;
  updatedAt: Date | number;
  provider?: string;
  [key: string]: unknown;
}
export interface MigrationResultEntry {
  provider?: string;
  sessionId: string;
  workspacePath?: string;
  reason?: string;
}
export interface MigrationImportResult {
  imported: MigrationResultEntry[];
  skipped: MigrationResultEntry[];
  failed: MigrationResultEntry[];
}
export type MigrationSupportState = { supported: true } | { supported: false; reason: "desktopOnly" };

/* 迁移助手（接口级；行号见头部映射 §B） */
declare function notifySessionsImported(workspaceTabsStore: unknown): void; // Qie（945）
declare function useWorkspaceTabsStoreForMigration(): { getState: () => { ensureWorkspaceTab: (opts: { workspacePath?: string }) => void } }; // hc（3609）
declare function useZcodeSessionServiceForMigration(workspacePath?: string, unused?: undefined, workspaceIdentity?: string | null): {
  scanImportableClaudeSessions: (request: {
    workspacePath?: string;
    workspaceIdentity?: string;
    modifiedSince?: number;
    limit?: number;
  }) => Promise<MigrationCandidate[]>;
  importClaudeSessions: (request: {
    workspacePath?: string;
    workspaceIdentity?: string;
    sessionIds: string[];
  }) => Promise<MigrationImportResult>;
}; // kg

/** 原 B2t（jsx 162408）：扫描时间范围 */
export const MIGRATION_RANGES = ["7d", "30d", "90d", "all"];

/** 原 I2t（js 203145）：Claude 迁移状态机 hook */
export function useClaudeMigration(opts: {
  workspacePath: string | null;
  workspaceIdentity?: string | null;
  isDesktop: boolean;
}) {
  const sessionService = useZcodeSessionServiceForMigration(opts.workspacePath ?? undefined, undefined, opts.workspaceIdentity);
  const workspaceTabsStore = useWorkspaceTabsStoreForMigration();
  const [filterMode, setFilterMode] = React.useState("all");
  const [range, setRange] = React.useState("30d");
  const [limitInput, setLimitInput] = React.useState(String(MIGRATION_DEFAULT_LIMIT));
  const [candidates, setCandidates] = React.useState<MigrationCandidate[]>([]);
  const [selectedSessionIds, setSelectedSessionIds] = React.useState<string[]>([]);
  const [scanError, setScanError] = React.useState<string | null>(null);
  const [importError, setImportError] = React.useState<string | null>(null);
  const [lastImportResult, setLastImportResult] = React.useState<MigrationImportResult | null>(null);
  const [isScanning, setIsScanning] = React.useState(false);
  const [isImporting, setIsImporting] = React.useState(false);
  const workspaceFilterMode = React.useMemo(() => resolveWorkspaceFilterMode(filterMode, opts.workspacePath), [filterMode, opts.workspacePath]);
  const scanWorkspacePath = React.useMemo(
    () => (workspaceFilterMode === "current" ? opts.workspacePath ?? undefined : undefined),
    [workspaceFilterMode, opts.workspacePath]
  );
  const scanWorkspaceIdentity = React.useMemo(
    () => (workspaceFilterMode === "current" && opts.workspaceIdentity?.trim()) || undefined,
    [opts.workspaceIdentity, workspaceFilterMode]
  );
  const supportState = React.useMemo<MigrationSupportState>(
    () => (opts.isDesktop ? { supported: true } : { supported: false, reason: "desktopOnly" }),
    [opts.isDesktop]
  );
  const scanLimit = React.useMemo(() => parseScanLimit(limitInput), [limitInput]);

  const handleSetFilterMode = React.useCallback(
    (mode: string) => {
      setFilterMode(resolveWorkspaceFilterMode(mode, opts.workspacePath));
    },
    [opts.workspacePath]
  );
  const toggleSessionSelection = React.useCallback((sessionId: string) => {
    setSelectedSessionIds((previous) => (previous.includes(sessionId) ? previous.filter((id) => id !== sessionId) : [...previous, sessionId]));
  }, []);
  const selectAllSessions = React.useCallback(() => {
    setSelectedSessionIds(candidates.map((candidate) => candidate.sessionId));
  }, [candidates]);
  const clearSelectedSessions = React.useCallback(() => {
    setSelectedSessionIds([]);
  }, []);

  const scan = React.useCallback(async () => {
    if (!supportState.supported) return;
    setIsScanning(true);
    setScanError(null);
    try {
      logger.info(
        `[Migration] 开始扫描 Claude 原生历史 workspaceFilter=${scanWorkspacePath ?? "all"} range=${range} limit=${scanLimit ?? "unlimited"}`
      );
      const found = await sessionService.scanImportableClaudeSessions({
        workspacePath: scanWorkspacePath,
        ...(scanWorkspaceIdentity ? { workspaceIdentity: scanWorkspaceIdentity } : {}),
        modifiedSince: modifiedSinceOfRange(range),
        ...(scanLimit === undefined ? {} : { limit: scanLimit }),
      });
      setCandidates(found);
      setSelectedSessionIds((previous) => previous.filter((id) => found.some((candidate) => candidate.sessionId === id)));
      logger.info(`[Migration] Claude 原生历史扫描完成 workspaceFilter=${scanWorkspacePath ?? "all"} count=${found.length}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error("[Migration] 扫描 Claude 原生历史失败", error);
      setScanError(message);
    } finally {
      setIsScanning(false);
    }
  }, [sessionService, scanWorkspaceIdentity, scanWorkspacePath, range, scanLimit, supportState.supported]);

  const importSessions = React.useCallback(
    async (sessionIds: string[]) => {
      if (!supportState.supported || sessionIds.length === 0) return null;
      setIsImporting(true);
      setImportError(null);
      try {
        logger.info(`[Migration] 开始导入 Claude 原生历史 workspaceFilter=${scanWorkspacePath ?? "all"} selected=${sessionIds.length}`);
        const result = await sessionService.importClaudeSessions({
          workspacePath: scanWorkspacePath,
          ...(scanWorkspaceIdentity ? { workspaceIdentity: scanWorkspaceIdentity } : {}),
          sessionIds,
        });
        setLastImportResult(result);
        const settledIds = new Set([
          ...result.imported.map((entry) => entry.sessionId),
          ...result.skipped.map((entry) => entry.sessionId),
          ...result.failed.map((entry) => entry.sessionId),
        ]);
        setSelectedSessionIds((previous) => previous.filter((id) => !settledIds.has(id)));
        if (result.imported.length > 0) {
          const workspacePaths = new Set(result.imported.map((entry) => entry.workspacePath));
          for (const path of workspacePaths) {
            workspaceTabsStore.getState().ensureWorkspaceTab({ workspacePath: path });
          }
          notifySessionsImported(workspaceTabsStore);
        }
        logger.info(
          `[Migration] Claude 原生历史导入完成 workspaceFilter=${scanWorkspacePath ?? "all"} imported=${result.imported.length} skipped=${result.skipped.length} failed=${result.failed.length}`
        );
        return result;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error("[Migration] 导入 Claude 原生历史失败", error);
        setImportError(message);
        return null;
      } finally {
        setIsImporting(false);
      }
    },
    [sessionService, scanWorkspaceIdentity, scanWorkspacePath, supportState.supported, workspaceTabsStore]
  );

  const importSelectedSessions = React.useCallback(async () => importSessions(selectedSessionIds), [importSessions, selectedSessionIds]);

  return {
    supportState,
    workspaceFilterMode,
    setWorkspaceFilterMode: handleSetFilterMode,
    hasCurrentWorkspaceFilter: opts.workspacePath !== null,
    range,
    setRange,
    limitInput,
    setLimitInput,
    scanLimit,
    candidates,
    selectedSessionIds,
    selectedCount: selectedSessionIds.length,
    scanError,
    importError,
    lastImportResult,
    isScanning,
    isImporting,
    scan,
    importSessions,
    importSelectedSessions,
    toggleSessionSelection,
    selectAllSessions,
    clearSelectedSessions,
  };
}

/** 原 L2t（jsx 162301）：跳过原因本地化 */
export function migrationSkipReasonLabel(intl: IntlShape, reason: string | undefined): string {
  return reason === "session_not_found_or_workspace_mismatch"
    ? intl.formatMessage({ id: "settings.migration.reason.session_not_found_or_workspace_mismatch" })
    : reason ?? "";
}

/** 原 R2t（jsx 162310）：跳过/失败明细列表 */
export function MigrationResultItemList(props: { title: string; items: MigrationResultEntry[] }) {
  const { title, items } = props;
  const { intl } = useIntlContext();
  return items.length === 0 ? null : (
    <div className="space-y-2">
      <div className="text-ui-base font-medium text-foreground">{title}</div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={`${item.provider}-${item.sessionId}-${item.reason}`} className="rounded-lg border border-border bg-background px-3 py-2">
            <div className="font-mono text-ui-base text-foreground">{item.sessionId}</div>
            {item.workspacePath ? (
              <div className="mt-1 text-ui-xs text-foreground-subtle">{intl.formatMessage({ id: "settings.migration.workspacePathLabel" })}</div>
            ) : null}
            {item.workspacePath ? (
              <div className="break-all font-mono text-ui-xs text-foreground-subtlest">{item.workspacePath}</div>
            ) : null}
            <div className="mt-1 text-ui-base text-foreground-subtle">{migrationSkipReasonLabel(intl, item.reason)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Card/Alert 原语（Settings.tsx 已抽取；此处按接口声明） */
declare const CardHeader: React.FC<{ className?: string; children: React.ReactNode }>; // bMt
declare const CardTitle: React.FC<{ children: React.ReactNode }>; // xMt
declare const CardDescription: React.FC<{ children: React.ReactNode }>; // SMt
declare const CardAction: React.FC<{ className?: string; children: React.ReactNode }>; // CMt
declare const AlertTitle: React.FC<{ children: React.ReactNode }>; // C9

/** 原 z2t（js 203332）：候选会话卡（计数徽章/全选/导入/结果明细） */
export function MigrationCandidatesCard(props: {
  supportState: MigrationSupportState;
  candidates: MigrationCandidate[];
  selectedSessionIds: string[];
  selectedCount: number;
  importError: string | null;
  lastImportResult: MigrationImportResult | null;
  isImporting: boolean;
  dateTimeFormatter: Intl.DateTimeFormat;
  onToggleSelection: (sessionId: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onImportSelected: () => void;
}) {
  const {
    supportState,
    candidates,
    selectedSessionIds,
    selectedCount,
    importError,
    lastImportResult,
    isImporting,
    dateTimeFormatter,
    onToggleSelection,
    onSelectAll,
    onClearSelection,
    onImportSelected,
  } = props;
  const { intl } = useIntlContext();
  return (
    <Card className="border border-border bg-card py-0 shadow-none">
      <CardHeader className="border-b border-border">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>{intl.formatMessage({ id: "settings.migration.candidatesTitle" })}</CardTitle>
              <Badge variant="outline">
                {intl.formatMessage({ id: "settings.migration.candidatesCount" }, { count: String(candidates.length) })}
              </Badge>
              <Badge variant="outline">
                {intl.formatMessage({ id: "settings.migration.selectedCount" }, { count: String(selectedCount) })}
              </Badge>
            </div>
            <CardDescription>{intl.formatMessage({ id: "settings.migration.candidatesDescription" })}</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" size="sm" variant="outline" disabled={!supportState.supported || candidates.length === 0 || isImporting} onClick={onSelectAll}>
              {intl.formatMessage({ id: "settings.migration.selectAll" })}
            </Button>
            <Button type="button" size="sm" variant="outline" disabled={selectedCount === 0 || isImporting} onClick={onClearSelection}>
              {intl.formatMessage({ id: "settings.migration.clearSelection" })}
            </Button>
            <Button type="button" size="sm" disabled={!supportState.supported || selectedCount === 0 || isImporting} onClick={onImportSelected}>
              {isImporting ? <SpinnerIcon className="size-3.5 animate-spin" /> : <DownloadIcon className="size-3.5" />}
              {intl.formatMessage({ id: "settings.migration.importSelected" })}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-4 py-4">
        {importError ? (
          <Alert>
            <AlertIcon className="size-4" />
            <AlertTitle>{intl.formatMessage({ id: "settings.migration.importFailedTitle" })}</AlertTitle>
            <AlertDescription>
              {intl.formatMessage({ id: "settings.migration.importFailedDescription" }, { error: importError })}
            </AlertDescription>
          </Alert>
        ) : null}
        {lastImportResult ? (
          <Alert>
            <CheckIcon className="size-4" />
            <AlertTitle>{intl.formatMessage({ id: "settings.migration.resultTitle" })}</AlertTitle>
            <AlertDescription>
              {intl.formatMessage(
                { id: "settings.migration.resultSummary" },
                {
                  imported: String(lastImportResult.imported.length),
                  skipped: String(lastImportResult.skipped.length),
                  failed: String(lastImportResult.failed.length),
                }
              )}
            </AlertDescription>
          </Alert>
        ) : null}
        {candidates.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-background px-4 py-8 text-center">
            <div className="text-ui-base font-medium text-foreground">{intl.formatMessage({ id: "settings.migration.emptyTitle" })}</div>
            <div className="mt-2 text-ui-base text-foreground-subtle">{intl.formatMessage({ id: "settings.migration.emptyDescription" })}</div>
          </div>
        ) : (
          <div className="space-y-2">
            {candidates.map((candidate) => {
              const selected = selectedSessionIds.includes(candidate.sessionId);
              return (
                <button
                  key={candidate.sessionId}
                  type="button"
                  disabled={isImporting}
                  className={cn(
                    "w-full rounded-lg border px-3 py-3 text-left transition-colors",
                    selected ? "border-primary bg-accent" : "border-border bg-background hover:bg-surface"
                  )}
                  onClick={() => onToggleSelection(candidate.sessionId)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                        selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-input text-transparent"
                      )}
                    >
                      <CheckIcon className="size-3.5" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="min-w-0 flex-1 text-ui-base font-medium text-foreground">
                          <span className="line-clamp-1 break-all">{candidate.previewTitle || candidate.sessionId}</span>
                        </div>
                        <Badge variant="outline" className="font-mono">
                          {candidate.sessionId.slice(0, 8)}
                        </Badge>
                      </div>
                      <div className="grid gap-2 text-ui-base text-foreground-subtle grid-cols-[minmax(0,1fr)_auto] items-center">
                        <div className="min-w-0 space-y-1">
                          <div className="font-mono text-ui-xs text-foreground-subtle">{candidate.sessionId}</div>
                          <div className="text-ui-xs text-foreground-subtle">
                            {intl.formatMessage({ id: "settings.migration.workspacePathLabel" })}
                          </div>
                          <div className="break-all font-mono text-ui-xs text-foreground-subtlest">{candidate.workspacePath}</div>
                          <div className="line-clamp-1 break-all font-mono text-ui-xs text-foreground-subtlest">{candidate.sourcePath}</div>
                        </div>
                        <div className="text-right text-ui-xs text-foreground-subtle">
                          {intl.formatMessage({ id: "settings.migration.updatedAt" }, { time: dateTimeFormatter.format(candidate.updatedAt) })}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
        {lastImportResult ? (
          <div className="grid grid-cols-2 gap-4">
            <MigrationResultItemList title={intl.formatMessage({ id: "settings.migration.skippedTitle" })} items={lastImportResult.skipped} />
            <MigrationResultItemList title={intl.formatMessage({ id: "settings.migration.failedTitle" })} items={lastImportResult.failed} />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export interface MigrationSettingsSectionProps {
  workspacePath: string | null;
  workspaceIdentity?: string | null;
  isDesktop: boolean;
}

/** 原 V2t（js 203587）：迁移分区根（扫描过滤卡 + 候选卡） */
export function MigrationSettingsSection(props: MigrationSettingsSectionProps) {
  const { workspacePath, workspaceIdentity, isDesktop } = props;
  const { intl, locale } = useIntlContext();
  const {
    supportState,
    workspaceFilterMode,
    setWorkspaceFilterMode,
    hasCurrentWorkspaceFilter,
    range,
    setRange,
    limitInput,
    setLimitInput,
    scanLimit,
    candidates,
    selectedSessionIds,
    selectedCount,
    scanError,
    importError,
    lastImportResult,
    isScanning,
    isImporting,
    scan,
    importSelectedSessions,
    toggleSessionSelection,
    selectAllSessions,
    clearSelectedSessions,
  } = useClaudeMigration({ workspacePath, workspaceIdentity, isDesktop });
  const dateTimeFormatter = React.useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }),
    [locale]
  );
  const unsupportedDescription =
    !supportState.supported && supportState.reason === "desktopOnly"
      ? intl.formatMessage({ id: "settings.migration.unsupported.desktopOnly" })
      : null;

  return (
    <div className="space-y-6">
      <Card className="border border-border bg-card py-0 shadow-none">
        <CardHeader className="border-b border-border">
          <CardAction>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!supportState.supported || isScanning}
              onClick={() => {
                scan();
              }}
            >
              {isScanning ? <SpinnerIcon className="size-3.5 animate-spin" /> : <RefreshIcon className="size-3.5" />}
              {intl.formatMessage({ id: "settings.migration.scan" })}
            </Button>
          </CardAction>
          <div className="space-y-1">
            <CardTitle>{intl.formatMessage({ id: "settings.migration.filtersTitle" })}</CardTitle>
            <CardDescription>{intl.formatMessage({ id: "settings.migration.filtersDescription" })}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-4 py-4">
          {supportState.supported ? null : (
            <Alert>
              <AlertIcon className="size-4" />
              <AlertTitle>{intl.formatMessage({ id: "settings.migration.unsupported.title" })}</AlertTitle>
              <AlertDescription>{unsupportedDescription}</AlertDescription>
            </Alert>
          )}
          <div className="grid gap-4 xl:grid-cols-3">
            <div className="space-y-2">
              <div className="text-ui-base font-medium text-foreground">
                {intl.formatMessage({ id: "settings.migration.workspaceFilterLabel" })}
              </div>
              <SelectRoot
                value={workspaceFilterMode}
                disabled={!supportState.supported || isScanning || isImporting}
                onValueChange={(value) => setWorkspaceFilterMode(value)}
              >
                <SelectTrigger size="lg" className="w-full justify-between">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{intl.formatMessage({ id: "settings.migration.workspaceFilter.all" })}</SelectItem>
                  {hasCurrentWorkspaceFilter ? (
                    <SelectItem value="current">{intl.formatMessage({ id: "settings.migration.workspaceFilter.current" })}</SelectItem>
                  ) : null}
                </SelectContent>
              </SelectRoot>
            </div>
            <div className="space-y-2">
              <div className="text-ui-base font-medium text-foreground">{intl.formatMessage({ id: "settings.migration.rangeLabel" })}</div>
              <SelectRoot value={range} disabled={!supportState.supported || isScanning || isImporting} onValueChange={(value) => setRange(value)}>
                <SelectTrigger size="lg" className="w-full justify-between">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MIGRATION_RANGES.map((rangeId) => (
                    <SelectItem key={rangeId} value={rangeId}>
                      {intl.formatMessage({ id: `settings.migration.range.${rangeId}` })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            </div>
            <div className="space-y-2">
              <div className="text-ui-base font-medium text-foreground">{intl.formatMessage({ id: "settings.migration.limitLabel" })}</div>
              <Input
                type="number"
                min={1}
                max={500}
                value={limitInput}
                disabled={!supportState.supported || isScanning || isImporting}
                onChange={(event) => setLimitInput(event.target.value)}
              />
              <div className="text-ui-base text-foreground-subtle">
                {intl.formatMessage({ id: "settings.migration.limitHint" }, { max: String(scanLimit) })}
              </div>
            </div>
          </div>
          {scanError ? (
            <Alert>
              <AlertIcon className="size-4" />
              <AlertTitle>{intl.formatMessage({ id: "settings.migration.scanFailedTitle" })}</AlertTitle>
              <AlertDescription>
                {intl.formatMessage({ id: "settings.migration.scanFailedDescription" }, { error: scanError })}
              </AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>
      <MigrationCandidatesCard
        supportState={supportState}
        candidates={candidates}
        selectedSessionIds={selectedSessionIds}
        selectedCount={selectedCount}
        importError={importError}
        lastImportResult={lastImportResult}
        isImporting={isImporting}
        dateTimeFormatter={dateTimeFormatter}
        onToggleSelection={toggleSessionSelection}
        onSelectAll={selectAllSessions}
        onClearSelection={clearSelectedSessions}
        onImportSelected={() => {
          importSelectedSessions();
        }}
      />
    </div>
  );
}

/* ============================================================================
 * 3. 渲染器叶子（原 U8 / gk）
 * ==========================================================================*/

/** Markdown 渲染器（原 cj，F19 族；Markdown.tsx 已抽取，接口级） */

export type { CodePreviewSettings };

/** 原 U8（js 160323 / jsx 132773）：记忆文件预览（Markdown 包装，F14 代码查看族入口） */
export function MemoryFilePreview(props: {
  content: string;
  workspacePath?: string;
  theme?: string;
  codePreviewSettings: CodePreviewSettings;
  onOpenBrowserUrl?: (url: string) => void;
}) {
  const { content, workspacePath, theme, codePreviewSettings, onOpenBrowserUrl } = props;
  return (
    <div className="w-full h-full bg-background overflow-auto">
      <div className="min-h-full bg-background p-4">
        <MarkdownRenderer
          className="min-w-0 break-words"
          workspacePath={workspacePath}
          theme={theme}
          codePreviewSettings={codePreviewSettings}
          onOpenExternalUrl={onOpenBrowserUrl}
        >
          {content}
        </MarkdownRenderer>
      </div>
    </div>
  );
}

/* --- CodeBlock（原 gk，js 48634 / jsx 43829；F19 Markdown 族） --- */

declare const WrapLinesIcon: React.FC<React.SVGProps<SVGSVGElement>>; // Tbe
declare const MermaidIcon: React.FC<React.SVGProps<SVGSVGElement>>; // mv
declare const CopyIcon: React.FC<React.SVGProps<SVGSVGElement>>; // W_
declare const CopiedIcon: React.FC<React.SVGProps<SVGSVGElement>>; // M_

interface CodeBlockContextValue {
  code: string;
  mermaidPreviewAvailable: boolean;
  openMermaidPreview: () => void;
  toggleWrapLongLines: () => void;
  wrapLongLines: boolean;
}
/** 原 fk（jsx 43775）：CodeBlock 工具条 context */
const CodeBlockContext = React.createContext<CodeBlockContextValue>({
  code: "",
  mermaidPreviewAvailable: false,
  openMermaidPreview: () => {},
  toggleWrapLongLines: () => {},
  wrapLongLines: false,
});

export interface CodeBlockProps {
  code: string;
  enableSyntaxHighlighting?: boolean;
  language: string;
  showLineNumbers?: boolean;
  theme?: unknown;
  appTheme?: string;
  wrapLongLines?: boolean;
  fontSizePx?: number;
  renderMermaid?: boolean;
  className?: string;
  children?: React.ReactNode;
  [key: string]: unknown;
}

/** 原 gk（js 48634）：代码块（mermaid 自动渲染 + 换行切换 + 预览对话框） */
export function CodeBlock(props: CodeBlockProps) {
  const {
    code,
    enableSyntaxHighlighting = true,
    language,
    showLineNumbers = false,
    theme,
    appTheme,
    wrapLongLines = false,
    fontSizePx = 14,
    renderMermaid = true,
    className,
    children,
    ...rest
  } = props;
  const { intl } = useIntlContext();
  const [wrapEnabled, setWrapEnabled] = React.useState(wrapLongLines);
  const [mermaidSvg, setMermaidSvg] = React.useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const mermaidCandidate = renderMermaid && isMermaidBlock(language, code);
  const mermaidEvaluation = React.useMemo(
    () => (mermaidCandidate ? evaluateMermaidAutoRender(code, { documentVisibilityState: documentVisibilityState() }) : null),
    [mermaidCandidate, code, mermaidAutoRenderDependency(mermaidCandidate)]
  );
  const shouldRenderMermaid = mermaidCandidate && mermaidEvaluation?.shouldRender === true;
  React.useEffect(() => {
    setWrapEnabled(wrapLongLines);
  }, [wrapLongLines]);
  const toggleWrapLongLines = React.useCallback(() => {
    setWrapEnabled((previous) => !previous);
  }, []);
  const openMermaidPreview = React.useCallback(() => {
    setPreviewOpen(true);
  }, []);
  React.useEffect(() => {
    if (!shouldRenderMermaid) {
      setMermaidSvg(null);
      setPreviewOpen(false);
    }
  }, [shouldRenderMermaid]);
  React.useEffect(() => {
    if (mermaidEvaluation && !mermaidEvaluation.shouldRender) {
      logger.debug("[CodeBlock] Mermaid 自动渲染跳过", { reason: mermaidEvaluation.reason, ...((mermaidEvaluation.metrics as object) ?? {}) });
    }
  }, [mermaidEvaluation]);
  const contextValue = React.useMemo<CodeBlockContextValue>(
    () => ({
      code,
      mermaidPreviewAvailable: !!mermaidSvg,
      openMermaidPreview,
      toggleWrapLongLines,
      wrapLongLines: wrapEnabled,
    }),
    [code, wrapEnabled, mermaidSvg, openMermaidPreview, toggleWrapLongLines]
  );

  return (
    <CodeBlockContext.Provider value={contextValue}>
      <CodeBlockFrame className={className} language={language} {...rest}>
        {children}
        <div className="p-2 pt-0 pb-3">
          {shouldRenderMermaid ? (
            <MermaidPreview code={code} theme={appTheme} onOpenPreview={openMermaidPreview} onPreviewSvgChange={setMermaidSvg} />
          ) : (
            <ShikiHighlight
              code={code}
              enableSyntaxHighlighting={enableSyntaxHighlighting}
              language={language}
              showLineNumbers={showLineNumbers}
              theme={theme}
              wrapLongLines={wrapEnabled}
              className="bg-transparent"
              fontSizePx={fontSizePx}
              style={{
                "--diffs-bg": "var(--color-card)",
                "--diffs-light-bg": "var(--color-card)",
                "--diffs-dark-bg": "var(--color-card)",
                "--diffs-gap-block": "0px",
              } as React.CSSProperties}
            />
          )}
        </div>
        {shouldRenderMermaid && mermaidSvg ? (
          <MermaidPreviewDialog
            open={previewOpen}
            onOpenChange={setPreviewOpen}
            svg={mermaidSvg}
            title={intl.formatMessage({ id: "codeBlock.mermaid.ariaLabel" })}
          />
        ) : null}
      </CodeBlockFrame>
    </CodeBlockContext.Provider>
  );
}

/** 原 _k（jsx 43898）：换行切换按钮（工具条） */
export function CodeBlockWrapLinesButton(props: {
  "aria-label"?: string;
  children?: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  title?: string;
}) {
  const { "aria-label": ariaLabel, children, className, onClick, title = "Wrap lines", ...rest } = props;
  const { toggleWrapLongLines, wrapLongLines } = React.useContext(CodeBlockContext);
  return (
    <Tooltip title={title}>
      <Button
        aria-label={ariaLabel ?? title}
        aria-pressed={wrapLongLines}
        className={cn("shrink-0", wrapLongLines && "bg-muted", className)}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) toggleWrapLongLines();
        }}
        size="icon-md"
        type="button"
        variant="ghost"
        {...rest}
      >
        {children ?? <WrapLinesIcon className="size-3.5" />}
      </Button>
    </Tooltip>
  );
}

/** 原 iBe（jsx 43907）：Mermaid 预览按钮（工具条） */
export function CodeBlockMermaidPreviewButton(props: {
  "aria-label"?: string;
  children?: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  title?: string;
}) {
  const { "aria-label": ariaLabel, children, className, onClick, title, ...rest } = props;
  const { intl } = useIntlContext();
  const { mermaidPreviewAvailable, openMermaidPreview } = React.useContext(CodeBlockContext);
  const resolvedTitle = title ?? intl.formatMessage({ id: "codeBlock.mermaid.openPreview" });
  return (
    <Tooltip title={resolvedTitle}>
      <Button
        aria-label={ariaLabel ?? resolvedTitle}
        className={cn("shrink-0", className)}
        disabled={!mermaidPreviewAvailable}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) openMermaidPreview();
        }}
        size="icon-md"
        type="button"
        variant="ghost"
        {...rest}
      >
        {children ?? <MermaidIcon className="size-3.5" />}
      </Button>
    </Tooltip>
  );
}

/** 原 vk（jsx 43934）：复制按钮（剪贴板 + 2s 勾选反馈） */
export function CodeBlockCopyButton(props: {
  "aria-label"?: string;
  onCopy?: () => void;
  onError?: (error: Error) => void;
  title?: string;
  timeout?: number;
  children?: React.ReactNode;
  className?: string;
}) {
  const { "aria-label": ariaLabel, onCopy, onError, title = "Copy code", timeout = 2000, children, className, ...rest } = props;
  const [copied, setCopied] = React.useState(false);
  const timeoutRef = React.useRef(0);
  const { code } = React.useContext(CodeBlockContext);
  const handleCopy = React.useCallback(async () => {
    if (typeof window === "undefined" || !navigator?.clipboard?.writeText) {
      onError?.(new Error("Clipboard API not available"));
      return;
    }
    try {
      if (copied) return;
      await navigator.clipboard.writeText(code);
      setCopied(true);
      onCopy?.();
      timeoutRef.current = window.setTimeout(() => setCopied(false), timeout);
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error(String(error)));
    }
  }, [code, onCopy, onError, timeout, copied]);
  React.useEffect(
    () => () => {
      window.clearTimeout(timeoutRef.current);
    },
    []
  );
  const Icon = copied ? CopiedIcon : CopyIcon;
  return (
    <Tooltip title={title}>
      <Button
        aria-label={ariaLabel ?? title}
        className={cn("shrink-0", className)}
        onClick={handleCopy}
        size="icon-md"
        type="button"
        variant="ghost"
        {...rest}
      >
        {children ?? <Icon className="size-3.5" />}
      </Button>
    </Tooltip>
  );
}
