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
 *   p1t  → UsageSettingsSection           分区根（app|codingPlan 分派）(195890)
 *   e1t  → AppUsageDashboard              app 用量仪表盘 (195350)
 *   a1t  → CodingPlanUsageDashboard       Coding Plan 仪表盘 (195530)
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
 *    Zre UsageHeatmap、Da/Aa/Qre/Jre 格式化、$j 订阅快照、rM 缓存键 (52648；A1-R24 行漂校正，旧注 47401)、
 *    Sq/Cq/wq/$4e 配额助手、iw 分区跳转 (js 39375 / jsx 35393；A1-R24 补 js 行)、ai 区间枚举、
 *    Mye/yv/vv/j_/cye/y_/Mv 图标
 *
 * B. 迁移分区（V2t，js 203587–203929 / jsx 162409–162541；z9 导入族）
 *   V2t  → MigrationSettingsSection       分区根 (203587)
 *   I2t  → useClaudeMigration             扫描/导入状态机 (203145)
 *   z2t  → MigrationCandidatesCard        候选会话卡 (203332)
 *   R2t  → MigrationResultItemList        跳过/失败明细 (jsx 162310)
 *   L2t  → migrationSkipReasonLabel       (jsx 162301)
 *   B2t  → MIGRATION_RANGES               [7d,30d,90d,all] (jsx 162408)
 *   （接口级）：F2t/P2t/N2t/k2t 过滤与限额助手 (162186/162181/162178/162170)、
 *    Qie 导入后刷新 (945)、hc useWorkspaceTabsStore (3609)、
 *    B3/V3 Card/CardContent（Settings.tsx 已抽取）、bMt/xMt/SMt/CMt CardHeader 族
 *    (jsx 113720–113743)、S9/w9/C9 Alert 族（Settings.tsx 已抽取）
 *
 * C. 渲染器（跨族叶子）
 *   U8   → MemoryFilePreview              记忆文件预览（Markdown 包装）(160323)
 *   gk   → CodeBlock                      代码块（shiki+mermaid+换行）(48634)
 *   _k   → CodeBlockWrapLinesButton       (jsx 43898)
 *   iBe  → CodeBlockMermaidPreviewButton  (jsx 43907)
 *   vk   → CodeBlockCopyButton            (jsx 43934)
 *   （接口级）：cj MarkdownRenderer（F19，Markdown.tsx 已抽取）、nBe 代码块壳、
 *    fk CodeBlockContext (jsx 43775)、BO MermaidPreview、MO ShikiHighlight、
 *    Oze/Pze/Mze mermaid 判定、Qze 预览对话框、Tbe/mv/W_/M_ 图标
 * ============================================================================
 */

/* ============================================================================
 * 〔A0-S4-4a：components 拆分（settings 域）——本文件现为薄 re-export shim〕
 * 组件单元已按域原样迁入 components/settings/，导入方零改动（仍从本文件取符号）：
 *   §1 用量分区      → components/settings/UsageSettingsSection.tsx
 *   §2 迁移分区      → components/settings/MigrationSettingsSection.tsx
 *   §3 渲染器叶子    → components/settings/SettingsCodeBlock.tsx
 * 迁出体逐字节不变；本块仅做导出面续供（值用 export、类型用 export type）。
 * ==========================================================================*/

export {
  isUsageCredentialError,
  usageErrorMessage,
  UsageErrorBanner,
  UsageChartBoundary,
  shortModelName,
  AppUsageRangeTabs,
  AppUsageDashboard,
  modelSeriesOf,
  toolSeriesOf,
  resolveUsageSourceProviderName,
  CodingPlanRangeTabs,
  CodingPlanQuotaCards,
  UsageSummaryStatGrid,
  CodingPlanModelUsageSection,
  CodingPlanToolUsageSection,
  CodingPlanTrendsSection,
  CodingPlanUsageDashboard,
  UsageSettingsSection,
} from '../components/settings/UsageSettingsSection';
export type {
  AppUsageSnapshot,
  CodingPlanUsageSnapshot,
  CodingPlanSource,
  UsageSettingsSectionProps,
} from '../components/settings/UsageSettingsSection';

export {
  MIGRATION_RANGES,
  useClaudeMigration,
  migrationSkipReasonLabel,
  MigrationResultItemList,
  MigrationCandidatesCard,
  MigrationSettingsSection,
} from '../components/settings/MigrationSettingsSection';
export type {
  MigrationCandidate,
  MigrationResultEntry,
  MigrationImportResult,
  MigrationSupportState,
  MigrationSettingsSectionProps,
} from '../components/settings/MigrationSettingsSection';

export {
  MemoryFilePreview,
  CodeBlock,
  CodeBlockWrapLinesButton,
  CodeBlockMermaidPreviewButton,
  CodeBlockCopyButton,
} from '../components/settings/SettingsCodeBlock';
export type { CodeBlockProps, CodePreviewSettings } from '../components/settings/SettingsCodeBlock';
