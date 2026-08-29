/* eslint-disable */
/**
 * ============================================================================
 * UsageStatsUiParts.tsx — ZCode 3.7.6 用量 UI 件 + Tooltip 全栈（B5-11 · 逐字重建）
 * ============================================================================
 *
 * 原始 chunk（只读）：
 *   /Users/mac/nofy-build/desktop/src/out/renderer/assets/usageStatsUiParts-CiR7YEhh.js（883 行）
 * 对照文件（pretty 版，**行号主口径**）：
 *   /Users/mac/nofy-build/desktop/src/src-reconstructed/renderer/assets/usageStatsUiParts-CiR7YEhh.jsx（747 行）
 * 登记：COVERAGE-LEDGER §b「未重建 first-party（B4 队列）」第 3 件、§c.1 第 11 项；
 *       B5-FULL-DECODE-PLAN 批次 12（B5-11）第 2 件；MODULE-MAP §3 导入表
 *       （`Ia`→Tooltip、`Na/Oa/Ma/ka` 四件——实测均为 Tooltip 族，非 Popover，见报告 §3 裁决）。
 *
 * 内容三段：
 *  A. radix-ui/react-tooltip 内联实现（vendored，jsx 10–517）：VisuallyHidden、
 *     useSyncExternalStore shim、TooltipProvider/Tooltip/Trigger/Portal/Content/Arrow
 *     与悬停几何助手（凸包/射线法）；
 *  B. shadcn 风格封装（jsx 518–562）：data-slot=tooltip-* 四件 + 类名逐字；
 *  C. first-party 用量 UI 助手（jsx 563–746）：InfoTooltip、数字/百分比/日期格式化、
 *     用量统计卡、空态、53×7 用量热图（settings.usage.* i18n key 5 个）。
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号 = jsx 孪生文件行）
 * ----------------------------------------------------------------------------
 *  导入（jsx 1–8）：
 *   e（chunk-Cq_f4orQ s）→ toEsmInterop | t（chunk-Cq_f4orQ t）→ commonJsModule
 *   n（react t）→ reactModuleFactory | r（jsx-runtime t）→ jsxRuntimeModuleFactory
 *   i（keyboardShortcuts a）→ isApplePlatform
 *   dist-DJJArJ7D（vendored radix 共享原语 13 导入）：
 *    a→createContextScope | o→usePopperScope | s→Portal | c→Primitive | l→PopperRoot
 *    u→DismissableLayer | d→useId | f→PopperArrow | p→useControllableState
 *    m→PopperContent | h→Presence | g→Slot | _→composeEventHandlers
 *   dist-vnZIbudW：v→useComposedRefs | y→createSlottable
 *   b（utils t）→ cn
 *  模块内（jsx 行）：
 *   x (9) ReactInterop | S (10) jsxRuntime
 *   C (11) VISUALLY_HIDDEN_STYLE | w (23) VISUALLY_HIDDEN_NAME | T (24) VisuallyHidden | E (29) 别名
 *   D (30) useSyncExternalStoreShimFactory（commonJS） | ee (80) useSyncExternalStoreShim（commonJS）
 *   [O,te] (83) [TooltipScope, useTooltipScopeFactory] = createContextScope('Tooltip',[createPopperScope])
 *   k (84) useTooltipPopperScope | A (85) TOOLTIP_PROVIDER_NAME | ne (86) DEFAULT_DELAY_DURATION=700
 *   j (87) TOOLTIP_OPEN_EVENT='tooltip.open' | [re,M] (88) Provider 上下文对
 *   N (89) TooltipProvider | P (122) TOOLTIP_NAME | [ie,F] (123) Tooltip 上下文对
 *   I (124) Tooltip | L (187) TOOLTIP_TRIGGER_NAME | R (188) TooltipTrigger
 *   z (217) TOOLTIP_PORTAL_NAME | [ae,oe] (218) Portal 上下文对 | B (221) TooltipPortal
 *   V (243) TOOLTIP_CONTENT_NAME | H (244) TooltipContent | se (261) TooltipContentHoverable
 *   [ce,le] (312) Content 内层上下文对 | ue (315) TooltipContentSlottable | U (316) TooltipContentBase
 *   W (372) TOOLTIP_ARROW_NAME | de (373) TooltipArrow
 *   fe (386) resolveNearestSide | pe (404) getSideOffsetPoints | me (446) getRectCornerPoints
 *   he (467) isPointInPolygon | ge (484) getSortedHullPoints | _e (488) getConvexHull
 *   ve/ye/be/xe/Se (513–517) 五别名
 *   Ce (518) ShadcnTooltipProvider | G (528) ShadcnTooltip | K (536) ShadcnTooltipTrigger
 *   q (544) ShadcnTooltipContent | J (554) TOOLTIP_KBD_CLASS | Y (555) setRefValue
 *   X (564) InfoTooltip | Z (599) formatNumberCompact
 *   Q (609) USAGE_HEATMAP_COLORS | we (610) HEATMAP_WEEK_COUNT=53 | $ (611) HEATMAP_DAYS_PER_WEEK=7
 *   Te (612) MS_PER_DAY=864e5 | Ee (613) formatCountCompact | De (619) formatTokens
 *   Oe (622) formatPercent | ke (628) formatUtcDateShort | Ae (637) resolveModelLabel
 *   je (642) heatmapCellStyle | Me (647) formatHeatmapCellLabel | Ne (656) UsageStatCard
 *   Pe (669) UsageEmptyState | Fe (675) dayIndexOfDate | Ie (679) dateOfDayIndex
 *   Le (682) createEmptyHeatmapCell | Re (691) normalizeHeatmapWeeks
 *   ze (715) UsageHeatmap | Be (739) UsageHeatmapCell
 *
 * ----------------------------------------------------------------------------
 * 二、导出别名表（对外 16 个；消费方局部名见 styles js 902–918 导入块）
 * ----------------------------------------------------------------------------
 *   a=De formatTokens | c=Ae resolveModelLabel | d=G ShadcnTooltip | f=q ShadcnTooltipContent
 *   g=C VISUALLY_HIDDEN_STYLE | h=ee useSyncExternalStoreShim | i=Ee formatCountCompact
 *   l=Z formatNumberCompact | m=K ShadcnTooltipTrigger | n=ze UsageHeatmap | o=ke formatUtcDateShort
 *   p=Ce ShadcnTooltipProvider | r=Ne UsageStatCard | s=Oe formatPercent | t=Pe UsageEmptyState
 *   u=X InfoTooltip
 *  （styles 侧局部名：Da/Jre/Oa/ka/Yre/Xre/Aa/ja/Ma/Zre/Na/Pa/Qre/Fa/Ia）
 *
 * 把握度：A 段高（vendored radix 逐字转录，上游 = radix-ui tooltip，版本登记见
 * VENDOR-MANIFEST-LIBS）；B/C 段高（类名/字符串/分支零改动）。
 * ============================================================================
 */


/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/charts/UsageStatsUiParts.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

// 〔A0-S4-4c〕接口级 export declare 留守副本（ambient，编译期擦除，emit 中立；新文件保留同文副本）。
export declare function useControllableState<T>(args: {
  prop?: T;
  defaultProp?: T;
  onChange?: (value: T) => void;
  caller?: string;
}): [T, (value: T) => void];

export {
  formatTokens,
  resolveModelLabel,
  ShadcnTooltip,
  ShadcnTooltipContent,
  VISUALLY_HIDDEN_STYLE,
  useSyncExternalStoreShim,
  formatCountCompact,
  formatNumberCompact,
  ShadcnTooltipTrigger,
  UsageHeatmap,
  formatUtcDateShort,
  ShadcnTooltipProvider,
  UsageStatCard,
  formatPercent,
  UsageEmptyState,
  InfoTooltip,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '../components/charts/UsageStatsUiParts';
export type {
  UsageHeatmapWeekInput,
} from '../components/charts/UsageStatsUiParts';
