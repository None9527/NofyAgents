// A0-S4-4b: 自 modules/Conversation.tsx §6 TurnNavigator 子族（左侧轮刻度条）原样迁入（组件单元；原文件现为薄 re-export shim）。
// 迁出体 = §6 全段（4618–5024）。导入路径按 components/conversation/ 深度改指 ../../modules/；TurnRenderUnit 型别留守 §5，经 type import 取回。
/* eslint-disable */
import * as React from "react";
import { useVirtualizer } from '@tanstack/react-virtual'; // A0-S3a：vendored useVirtualizer（原 to，esm-BY6T6pIH.js）→ npm @tanstack/react-virtual@3.14.10
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../ui/hover-card'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { useZCodeIntl as useIntlContext } from '../../modules/I18n'; // 原 G（A0-D 接线：declare → I18n canonical）
import { cn } from '../../modules/UtilsCn'; // 原 Z（A0-D 接线：declare → UtilsCn canonical）
import type { TurnRenderUnit } from '../../modules/Conversation'; // §5 留守型别（属主补 export；型别擦除，环安全）

/* ============================================================================
 * 6. TurnNavigator 子族（左侧轮刻度条；js 113296–113619 / jsx 96490–96769）
 *    会话列 ≥864px 才可见（@min-[864px]/conversation）；悬停浮出当前轮的
 *    用户提问 + assistant 摘要（HoverCard），点击平滑滚动定位。
 *    chat.turnNavigator.label / jumpToQuery / emptyAssistant / runningAssistant /
 *    userFallback
 * ==========================================================================*/

/** 原 Uvt（js 113296 / jsx 96490）：目录补齐触发条件（宽 ≥864px 且可加载更早） */
function shouldHydrateFullHistory(args: {
  canLoadOlder: boolean;
  loadingOlder: boolean;
  hasLoadHandler: boolean;
  containerWidthPx: number;
}): boolean {
  return args.canLoadOlder && !args.loadingOlder && args.hasLoadHandler && args.containerWidthPx >= 864;
}
/** 原 Wvt（js 113299 / jsx 96493）：目录补齐重试退避（第1次 250ms / 第2次 1s / 放弃） */
function hydrateRetryDelayMs(attemptCount: number): number | null {
  return attemptCount === 1 ? 250 : attemptCount === 2 ? 1e3 : null;
}
const NAVIGATOR_MAX_PREVIEW_CHARS = 220; // Gvt（js 113302 / jsx 96496）
const NAVIGATOR_MAX_PREVIEW_PARAGRAPHS = 2; // Kvt（同上行）

/** 原 qvt（js 113304 / jsx 96498）：按空行分段 → 压扁空白 → 取前 N 段 */
function splitPreviewParagraphs(text: string, maxParagraphs: number): string[] {
  return text
    .trim()
    .split(/\n\s*\n/u)
    .map((paragraph) => paragraph.replace(/\s+/gu, ` `).trim())
    .filter(Boolean)
    .slice(0, Math.max(1, maxParagraphs));
}
/** 原 Jvt（js 113312 / jsx 96501）：预览截断（至少 8 字符 + 省略号） */
function truncatePreview(text: string, maxChars: number): string {
  const limit = Math.max(8, maxChars);
  return text.length <= limit ? text : `${text.slice(0, limit - 3).trimEnd()}...`;
}
/** 原 Yvt（js 113316 / jsx 96505）：多段文本 → 单条预览 */
function buildPreviewText({
  texts,
  fallback,
  maxPreviewChars,
  maxPreviewParagraphs,
}: {
  texts: string[];
  fallback: string;
  maxPreviewChars: number;
  maxPreviewParagraphs: number;
}): string {
  const paragraphs = splitPreviewParagraphs(texts.join(`\n\n`), maxPreviewParagraphs);
  if (paragraphs.length === 0) return fallback;
  return truncatePreview(paragraphs.join(`\n`), maxPreviewChars);
}
/** 原 Xvt（jsx 96517）：assistant 预览三态（文本/运行中/空） */
function buildAssistantPreview(
  unit: TurnRenderUnit,
  opts: { assistantEmptyPreview: string; assistantRunningPreview: string; maxPreviewChars: number; maxPreviewParagraphs: number },
): { assistantPreview: string; assistantPreviewKind: "text" | "running" | "empty" } {
  if (unit.assistantTextRows.length > 0) {
    return {
      assistantPreview: buildPreviewText({
        texts: unit.assistantTextRows.map((row) => row.text),
        fallback: opts.assistantEmptyPreview,
        maxPreviewChars: opts.maxPreviewChars,
        maxPreviewParagraphs: opts.maxPreviewParagraphs,
      }),
      assistantPreviewKind: `text`,
    };
  }
  if (unit.isRunning) return { assistantPreview: opts.assistantRunningPreview, assistantPreviewKind: `running` };
  return { assistantPreview: opts.assistantEmptyPreview, assistantPreviewKind: `empty` };
}

interface TurnNavigatorItem {
  key: string;
  turnId: string;
  unitIndex: number;
  rowId: number;
  userPreview: string;
  assistantPreview: string;
  assistantPreviewKind: "text" | "running" | "empty";
  isRunning: boolean;
}

/** 原 Zvt（js 113346 / jsx 96534）：渲染单元 → 导航项（每个真实用户输入一条） */
function buildTurnNavigatorItems(
  units: TurnRenderUnit[],
  opts: {
    assistantEmptyPreview: string;
    assistantRunningPreview: string;
    userFallbackPreview: string;
    maxPreviewChars?: number;
    maxPreviewParagraphs?: number;
  },
): TurnNavigatorItem[] {
  const resolved = {
    ...opts,
    maxPreviewChars: opts.maxPreviewChars ?? NAVIGATOR_MAX_PREVIEW_CHARS,
    maxPreviewParagraphs: opts.maxPreviewParagraphs ?? NAVIGATOR_MAX_PREVIEW_PARAGRAPHS,
  };
  return units.flatMap((unit, unitIndex) => {
    const inputs = unit.visibleUserInputs.filter((input) => input.origin === `realUser`);
    if (unit.timelineOnly || inputs.length === 0) return [];
    const { assistantPreview, assistantPreviewKind } = buildAssistantPreview(unit, resolved);
    return inputs.map((input, inputIndex) => ({
      key: `${unit.key}:query:${input.entityId ?? input.rowId}`,
      turnId: unit.turnId,
      unitIndex,
      rowId: input.rowId,
      userPreview: buildPreviewText({
        texts: [input.text],
        fallback: resolved.userFallbackPreview,
        maxPreviewChars: resolved.maxPreviewChars,
        maxPreviewParagraphs: resolved.maxPreviewParagraphs,
      }),
      assistantPreview,
      assistantPreviewKind,
      isRunning: unit.isRunning && inputIndex === inputs.length - 1,
    }));
  });
}

/** 原 w1（js 113373 / jsx 96564）：非负钳位 */
function clampNonNegative(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

/** ES2023 findLast 的等价实现（目标 lib 为 ES2022） */
function findLastItem<T>(items: T[], predicate: (item: T) => boolean): T | undefined {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    const item = items[index];
    if (item !== undefined && predicate(item)) return item;
  }
  return undefined;
}

/** 原 Qvt（js 113376 / jsx 96567）：视口内最近的单元索引（滚动位置 → 聚焦项） */
function findVisibleUnitIndex({
  items,
  virtualItems,
  scrollOffsetPx,
  viewportHeightPx,
}: {
  items: TurnNavigatorItem[];
  virtualItems: { index: number; start: number; size: number }[];
  scrollOffsetPx: number;
  viewportHeightPx: number;
}): number | undefined {
  if (items.length === 0) return undefined;
  const byUnitIndex = new Map(items.map((item) => [item.unitIndex, item]));
  const offset = clampNonNegative(scrollOffsetPx);
  const bottom = offset + Math.max(1, clampNonNegative(viewportHeightPx));
  let bestUnitIndex: number | undefined;
  let bestDistance = Infinity;
  for (const virtual of virtualItems) {
    const item = byUnitIndex.get(virtual.index);
    if (!item) continue;
    const start = clampNonNegative(virtual.start);
    if (start + Math.max(1, clampNonNegative(virtual.size)) < offset || start > bottom) continue;
    const distance = start <= offset ? 0 : start - offset;
    if (distance < bestDistance) {
      bestUnitIndex = item.unitIndex;
      bestDistance = distance;
    }
  }
  if (bestUnitIndex !== undefined) return bestUnitIndex;
  const fallbackIndex = virtualItems.find((virtual) => {
    const start = clampNonNegative(virtual.start);
    return start + Math.max(1, clampNonNegative(virtual.size)) >= offset && start <= bottom;
  })?.index;
  return fallbackIndex === undefined
    ? items[0]?.unitIndex
    : items.find((item) => item.unitIndex >= fallbackIndex)?.unitIndex ??
        findLastItem(items, (item) => item.unitIndex <= fallbackIndex)?.unitIndex ??
        items[0]?.unitIndex;
}

/** 原 $vt（js 113402 / jsx 96594）：按行位置找当前 query 行（最近的行锚点） */
function findActiveQueryRow({
  positions,
  scrollOffsetPx,
  viewportHeightPx,
}: {
  positions: { rowId: number; start: number; end: number }[];
  scrollOffsetPx: number;
  viewportHeightPx: number;
}): number | undefined {
  if (positions.length === 0) return undefined;
  const offset = clampNonNegative(scrollOffsetPx);
  const bottom = offset + Math.max(1, clampNonNegative(viewportHeightPx));
  const sorted = positions
    .map((position) => {
      const start = clampNonNegative(position.start);
      return { rowId: position.rowId, start, end: Math.max(start, clampNonNegative(position.end)) };
    })
    .sort((a, b) => a.start - b.start || a.rowId - b.rowId);
  const visible = sorted.filter((position) => position.end >= offset && position.start <= bottom);
  if (visible.length > 0) {
    return visible.reduce((best, position) => (Math.abs(position.start - offset) < Math.abs(best.start - offset) ? position : best)).rowId;
  }
  return findLastItem(sorted, (position) => position.start <= offset)?.rowId ?? sorted.find((position) => position.start > offset)?.rowId;
}

/** 原 eyt（js 113417 / jsx 96613）：刻度条视觉档位（焦点 2.6x / 近 1.7x / 中 1.25x / 远 1x） */
function resolveNavigatorItemVisual({
  itemIndex,
  visualFocusItemIndex,
}: {
  itemIndex: number;
  visualFocusItemIndex: number | undefined;
}): { colorTone: "focus" | "muted"; opacity: number; scaleX: number; tone: "peak" | "near" | "mid" | "idle" } {
  if (visualFocusItemIndex === undefined) return { colorTone: `muted`, opacity: 0.58, scaleX: 1, tone: `idle` };
  const distance = Math.abs(itemIndex - visualFocusItemIndex);
  if (distance === 0) return { colorTone: `focus`, opacity: 1, scaleX: 2.6, tone: `peak` };
  if (distance === 1) return { colorTone: `muted`, opacity: 0.86, scaleX: 1.7, tone: `near` };
  if (distance === 2) return { colorTone: `muted`, opacity: 0.72, scaleX: 1.25, tone: `mid` };
  return { colorTone: `muted`, opacity: 0.58, scaleX: 1, tone: `idle` };
}
/** 原 tyt（js 113428 / jsx 96646）：视觉焦点索引直通（悬停交互项优先由状态接管） */
function resolveVisualFocusIndex({ interactionItemIndex }: { interactionItemIndex: number | undefined }): number | undefined {
  return interactionItemIndex;
}
/** 原 nyt（js 113431 / jsx 96651）：prefers-reduced-motion 侦听 */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    if (typeof window > `u` || !window.matchMedia) return;
    const query = window.matchMedia(`(prefers-reduced-motion: reduce)`);
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener(`change`, update);
    return () => query.removeEventListener(`change`, update);
  }, []);
  return reduced;
}

/* ── tombstone（A0-S3a）：vendored useVirtualizer（原 to，esm-BY6T6pIH.js）declare 删除，
 *    改 npm @tanstack/react-virtual@3.14.10 真实 import（文件头）；调用/返回面逐字不变。 ── */

/**
 * TurnNavigator（原 ryt，js 113443 / jsx 96660；memo 名 iyt，js 113619 / jsx 96769）。
 * 左侧绝对定位刻度条（w-12，<864px 隐藏）；少于 2 条不渲染；
 * 每条 = 2.5px 圆角横杠，按与焦点距离缩放/加深；HoverCard 预览用户提问+回复摘要。
 */
function TurnNavigatorImpl({
  renderUnits,
  scrollOffsetPx,
  viewportHeightPx,
  virtualItems,
  activeQueryRowId,
  isHydratingDirectory = false,
  onJumpToQuery,
}: {
  renderUnits: TurnRenderUnit[];
  scrollOffsetPx: number;
  viewportHeightPx: number;
  virtualItems: { index: number; start: number; size: number }[];
  activeQueryRowId?: number;
  isHydratingDirectory?: boolean;
  onJumpToQuery: (target: { unitIndex: number; rowId: number }, behavior: "auto" | "smooth") => void;
}) {
  const { intl } = useIntlContext();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [interactionItemIndex, setInteractionItemIndex] = React.useState<number | undefined>(undefined);
  const items = React.useMemo(
    () =>
      buildTurnNavigatorItems(renderUnits, {
        assistantEmptyPreview: intl.formatMessage({ id: `chat.turnNavigator.emptyAssistant` }),
        assistantRunningPreview: intl.formatMessage({ id: `chat.turnNavigator.runningAssistant` }),
        userFallbackPreview: intl.formatMessage({ id: `chat.turnNavigator.userFallback` }),
      }),
    [intl, renderUnits],
  );
  const visibleUnitIndex = React.useMemo(
    () => findVisibleUnitIndex({ items, scrollOffsetPx, viewportHeightPx, virtualItems }),
    [items, scrollOffsetPx, viewportHeightPx, virtualItems],
  );
  const lookup = React.useMemo(() => {
    const byRowId = new Map<number, number>();
    const firstByUnitIndex = new Map<number, number>();
    items.forEach((item, index) => {
      byRowId.set(item.rowId, index);
      if (!firstByUnitIndex.has(item.unitIndex)) firstByUnitIndex.set(item.unitIndex, index);
    });
    return { byRowId, firstByUnitIndex };
  }, [items]);
  const activeItemIndex =
    (activeQueryRowId === undefined ? undefined : lookup.byRowId.get(activeQueryRowId)) ??
    (visibleUnitIndex === undefined ? undefined : lookup.firstByUnitIndex.get(visibleUnitIndex)) ??
    -1;
  const visualFocusItemIndex = resolveVisualFocusIndex({ interactionItemIndex });
  const scrollElementRef = React.useRef<HTMLDivElement | null>(null);
  const getScrollElement = React.useCallback(() => scrollElementRef.current, []);
  const getItemKey = React.useCallback((index: number) => items[index]?.key ?? index, [items]);
  const virtualizer = useVirtualizer({
    count: items.length,
    estimateSize: () => 10,
    getItemKey,
    getScrollElement,
    overscan: 6,
  });
  const rendered = virtualizer.getVirtualItems();
  React.useEffect(() => {
    if (activeItemIndex < 0 || items.length < 2) return;
    virtualizer.scrollToIndex(activeItemIndex, { align: `auto` });
    const element = scrollElementRef.current;
    if (element) {
      window.queueMicrotask(() => {
        if (scrollElementRef.current === element) element.dispatchEvent(new Event(`scroll`));
      });
    }
  }, [activeItemIndex, items.length, virtualizer]);
  if (items.length < 2) return null;
  return (
    <nav
      aria-label={intl.formatMessage({ id: `chat.turnNavigator.label` })}
      aria-busy={isHydratingDirectory}
      data-testid="v4-turn-navigator"
      data-item-count={items.length}
      data-rendered-item-count={rendered.length}
      className="pointer-events-none invisible absolute inset-y-0 left-0 z-10 w-12 -translate-x-2 opacity-0 transition-[opacity,transform,visibility] duration-150 ease-out motion-reduce:transition-none @min-[864px]/conversation:visible @min-[864px]/conversation:translate-x-0 @min-[864px]/conversation:opacity-100"
    >
      <div
        ref={scrollElementRef}
        className="scrollbar-hide pointer-events-auto absolute left-3 top-1/2 max-h-[calc(100%-6rem)] w-9 -translate-y-1/2 overflow-x-hidden overflow-y-auto py-1"
        onPointerLeave={() => setInteractionItemIndex(undefined)}
        onScroll={() => setInteractionItemIndex(undefined)}
      >
        <div className="relative w-9" style={{ height: `${virtualizer.getTotalSize()}px` }}>
          {rendered.map((virtual) => {
            const index = virtual.index;
            const item = items[index];
            if (!item) return null;
            const isActive = index === activeItemIndex;
            const visual = resolveNavigatorItemVisual({ itemIndex: index, visualFocusItemIndex });
            const isFocusFallback = visualFocusItemIndex === undefined && isActive;
            return (
              <div key={item.key} className="absolute left-0 top-0 h-2.5 w-9" style={{ transform: `translateY(${virtual.start}px)` }}>
                <HoverCard closeDelay={80} openDelay={120}>
                  <HoverCardTrigger asChild>
                    <button
                      type="button"
                      aria-current={isActive ? `location` : undefined}
                      aria-label={intl.formatMessage({ id: `chat.turnNavigator.jumpToQuery` }, { index: String(index + 1) })}
                      aria-posinset={index + 1}
                      aria-setsize={items.length}
                      data-testid={`v4-turn-navigator-item:${item.key}`}
                      data-item-index={index}
                      data-unit-index={item.unitIndex}
                      data-turn-id={item.turnId}
                      data-query-row-id={item.rowId}
                      data-active={isActive ? `true` : `false`}
                      data-running={item.isRunning ? `true` : `false`}
                      data-visual-color-tone={visual.colorTone}
                      data-visual-scale={String(visual.scaleX)}
                      data-visual-tone={visual.tone}
                      onBlur={() => setInteractionItemIndex(undefined)}
                      onClick={() => onJumpToQuery({ unitIndex: item.unitIndex, rowId: item.rowId }, prefersReducedMotion ? `auto` : `smooth`)}
                      onFocus={() => setInteractionItemIndex(index)}
                      onPointerEnter={() => setInteractionItemIndex(index)}
                      onPointerLeave={() => setInteractionItemIndex(undefined)}
                      className="flex h-2.5 w-9 items-center justify-start rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      <span
                        className={cn(
                          `block h-0.5 w-3 origin-left rounded-full transition-[height,opacity,transform,background-color] duration-150 ease-out motion-reduce:transition-none`,
                          visual.colorTone === `focus` && `bg-foreground`,
                          visual.colorTone === `muted` && (isFocusFallback ? `bg-foreground` : `bg-foreground-subtlest`),
                        )}
                        style={{
                          opacity: isFocusFallback ? 0.9 : item.isRunning ? Math.max(visual.opacity, 0.72) : visual.opacity,
                          transform: `scaleX(${visual.scaleX})`,
                        }}
                      />
                    </button>
                  </HoverCardTrigger>
                  <HoverCardContent
                    align={`start`}
                    side={`right`}
                    sideOffset={8}
                    data-testid={`v4-turn-navigator-preview:${item.key}`}
                    className={`w-80 max-w-[calc(100vw-2rem)] border border-popover-border bg-popover p-3 text-popover-foreground shadow-lg`}
                  >
                    <div className="space-y-2">
                      <p className="line-clamp-2 whitespace-pre-line text-ui-base font-medium leading-5">{item.userPreview}</p>
                      <p
                        className={cn(
                          `line-clamp-3 whitespace-pre-line text-ui-base leading-5`,
                          item.assistantPreviewKind === `text` ? `text-popover-foreground/80` : `text-foreground-subtle`,
                        )}
                      >
                        {item.assistantPreview}
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
const TurnNavigator = React.memo(TurnNavigatorImpl);

/* 〔A0-S4-4b〕补导出块：原经 Conversation.tsx 文件尾 §9.7 导出块对外，迁出后于属主文件本地导出（体不动）。
 * findActiveQueryRow 原即模块私有，§8 List 留守面（6238）消费，补 export 后经 import 取回（函数声明提升，环安全）。
 * shouldHydrateFullHistory/hydrateRetryDelayMs 同属模块私有，§5 留守面（3957/3991）消费，一并补 export。 */
export { TurnNavigator, findActiveQueryRow, shouldHydrateFullHistory, hydrateRetryDelayMs };
