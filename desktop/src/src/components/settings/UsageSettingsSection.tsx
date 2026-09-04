// A0-S4-4a: 自 modules/SettingsPanelsData.tsx §1 用量分区 原样迁入（组件单元；原文件现为薄 re-export shim）。
// 迁出体 = 原文件 §0 局部声明（IntlShape/图标 declare）+ §1 全段（117–730）。导入路径按 components/settings/ 深度改指 ../../modules/。
import * as React from "react";
import { LoaderCircle as SpinnerIcon, BoltIcon, FlameIcon, StarIcon, RefreshCcw as RefreshIcon, TriangleAlert as AlertIcon } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0
import { Button } from '../../modules/button';
import { Tabs, TabsList, TabsTrigger } from '../../modules/Settings';
import { requestSettingsSectionNavigation as navigateToSettingsSection } from '../../modules/Settings'; // ow（js 39381；A1-R24 归属+行漂校正：旧注 iw 35393 失实——本别名 ≡ Home requestSettingsSectionOpen ≡ ow）
import { USAGE_REPORT_RANGES as APP_USAGE_RANGES, providerIds as PROVIDER_IDS } from '../../modules/SrcSharedA'; // ai=ms（A0-CLEANUP B-9） // 〔A1-R167〕+providerIds as PROVIDER_IDS（束符 q；下方 @67 墓碑）
import { findQuotaLimit, formatQuotaResetTime, formatQuotaUsage, providerCacheKey, quotaPercent, useAppUsageStats, useCodingPlanUsageStats, useSubscriptionSnapshot, type EntitlementQuotaLimit, type ModelProvider } from '../../modules/UsageDeep';
import { UsageHeatmap, formatPercent } from '../../modules/UsageStatsUiParts';
import { UsageEmptyState as LoadingPlaceholder, UsageStatCard as StatCard, formatTokens as formatTokenCount, formatCountCompact as formatInteger, resolveModelLabel as modelDisplayName } from '../../modules/UsageStatsUiParts'; // Ia / Fa / Pa / Da / Aa / Jre
import { useZCodeIntl as useIntlContext } from '../../modules/I18n';

interface IntlShape {
  formatMessage(descriptor: { id: string }, values?: Record<string, unknown>): string;
}


declare const TokensIcon: React.FC<React.SVGProps<SVGSVGElement>>; // Mye
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（1）：BoltIcon → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
declare const MessageIcon: React.FC<React.SVGProps<SVGSVGElement>>; // vv
declare const CalendarIcon: React.FC<React.SVGProps<SVGSVGElement>>; // j_
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（6）：FlameIcon/StarIcon/RefreshIcon/AlertIcon/CheckIcon/DownloadIcon → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */

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
  quota?: { limits?: EntitlementQuotaLimit[] }; // A0-CLEANUP3 3b：对齐 findQuotaLimit 形参
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

/* A0-CLEANUP3 3b：tombstone —— 本地 ModelProvider 删除，改用 UsageDeep.ModelProvider（props 面直消费） */
/* ── tombstone〔A1-R167〕：declare PROVIDER_IDS（束符 q，本行原注「skillStore chunk」；src 侧 W@4733 定义 / mo@9963 导出）删除 → 改采 @8 既有 SrcSharedA 边之別名 specifier `providerIds as PROVIDER_IDS`〔别名保名〕，9 处消费点（@521/522/527/529/535/537/543/545/552）逐字不变。束符印证：本行原注 `q（skillStore chunk）` ≡ adopter ModelProviderSettingsSection@17 `q=mo` ≡ SidebarLeaves@141 `q≡W 4733`（三处一致）。canonical modules/SrcSharedA@2008 providerIds（7 键字面量型）。零新边（@8 既有）。 ── */

/* --- 展示原语（接口级） --- */

declare const UsageErrorBoundary: React.FC<{
  scope: string;
  resetKeys: unknown[];
  variant: "inline";
  children: React.ReactNode;
}>; // p4（129952 / jsx 109217）
/* ── tombstone（A0-CLEANUP B-9）：APP_USAGE_RANGES declare 删除 → import
 *    { USAGE_REPORT_RANGES as APP_USAGE_RANGES } from './SrcSharedA'（原 ai=ms）。 ── */

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

/** A0-CLEANUP3 3b：label 收紧为必有（与 Settings 本地 CodingPlanSource 双向对齐；消费端均以 ?. 读取） */
export interface CodingPlanSource {
  id: string;
  providerId: string;
  label: string;
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
export function CodingPlanQuotaCards(props: { quota?: { limits?: EntitlementQuotaLimit[] }; providerName?: string }) { // A0-CLEANUP3 3b：对齐 findQuotaLimit 形参
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
