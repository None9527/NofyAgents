// A0-S4-4b: 自 modules/Composer.tsx [B5] 建议面板 原样迁入（组件单元；原文件现为薄 re-export shim）。
// 迁出体 = [B5] 全段（2351–2676）+ §0 testid 常量 SUGGESTION_*（763–766，本族独占消费）。
// testidOf（777）为 B5/[C]/[D] 三族共用运行时助手，留守 shim 补 export，经下方 import 取回（函数声明提升，环安全）；
// MentionSuggestionItem 型别（B3 1905）留守 shim 补 export，经 type import 取回。
// 导入路径按 components/composer/ 深度改指 ../../modules/ / ../ui/。
/* eslint-disable */
import * as React from "react";
import { Loader as LoaderIcon, InfoIcon } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0
import { useVirtualizer } from '@tanstack/react-virtual'; // A0-S3a：vendored useVirtualizer（esm-BY6T6pIH.js）→ npm @tanstack/react-virtual@3.14.10
import { cn } from '../../modules/UtilsCn'; // 原 Z（A0-D 接线：declare → UtilsCn canonical）
import { type MentionSuggestionItem } from '../../modules/Composer'; // 建议项型别 canonical 在 [B3]；testidOf 重复转录面〔A1-P3-B14〕收敛改指 joinTestidParts（见下）
import { joinTestidParts } from '../../modules/SrcSharedB'; // 原 qr（R41 既判 ≡ SrcSharedB@5015；B13 Home 同形收敛先例）

/** 15. testid 常量（src-HCld2afU.js，B5-11；值已回代核实，见原文件头） */
const SUGGESTION_PANEL_TESTID = `prompt-suggestion-panel`;
const SUGGESTION_SECTION_TESTID = `prompt-suggestion-section`;
const SUGGESTION_OPTION_TESTID = `prompt-suggestion-option`;
const SUGGESTION_STATUS_TESTID = `prompt-suggestion-status`;

/* ============================================================================
 * [B5] 建议面板（js 64639–64910；虚拟滚动 + 滚动渐隐遮罩）
 * ==========================================================================*/

/** 原 _V（js 64639）：渐隐遮罩高度 */
const SCROLL_FADE_HEIGHT = 24;
/** 原 vV（js 64640）：滚动判定阈值 */
const SCROLL_FADE_THRESHOLD = 1;
/** 原 yV（js 64641）：无渐隐初值 */
const NO_SCROLL_FADE = { showBottom: false, showTop: false };

/** 原 bV（js 64642）：由滚动位置计算上下渐隐开关 */
function computeScrollFade(metrics: { clientHeight: number; scrollHeight: number; scrollTop: number }): {
  showBottom: boolean;
  showTop: boolean;
} {
  const maxScroll = Math.max(0, metrics.scrollHeight - metrics.clientHeight);
  return maxScroll <= SCROLL_FADE_THRESHOLD
    ? NO_SCROLL_FADE
    : { showTop: metrics.scrollTop > SCROLL_FADE_THRESHOLD, showBottom: metrics.scrollTop < maxScroll - SCROLL_FADE_THRESHOLD };
}

/** 原 xV（js 64646）：渐隐遮罩 mask 样式 */
function scrollFadeMaskStyle(fade: { showBottom: boolean; showTop: boolean }): React.CSSProperties | undefined {
  if (!fade.showTop && !fade.showBottom) return;
  const gradient = `linear-gradient(to bottom, ${fade.showTop ? `transparent 0px, black ${SCROLL_FADE_HEIGHT}px` : `black 0px, black ${SCROLL_FADE_HEIGHT}px`}, ${fade.showBottom ? `black calc(100% - ${SCROLL_FADE_HEIGHT}px), transparent 100%` : `black calc(100% - ${SCROLL_FADE_HEIGHT}px), black 100%`})`;
  return {
    WebkitMaskImage: gradient,
    maskImage: gradient,
    WebkitMaskRepeat: `no-repeat`,
    maskRepeat: `no-repeat`,
    WebkitMaskSize: `100% 100%`,
    maskSize: `100% 100%`,
  };
}

/** 原 pJe/mJe/hJe（js 64655–64657）：行高（选项 34 / 状态 40 / 段头 28） */
const OPTION_ROW_HEIGHT = 34;
const STATUS_ROW_HEIGHT = 40;
const SECTION_HEADER_ROW_HEIGHT = 28;

type SuggestionRow =
  | { kind: `section_header`; sectionId: string; title: string }
  | { kind: `status`; sectionId: string; content: `error` | `loading` | `empty`; text?: string }
  | { kind: `option`; sectionId: string; option: MentionSuggestionItem; flatOptionIndex: number };

/** 原 gJe（js 64661）：段集合 → 扁平行表（多段才插段头） */
function flattenSuggestionRows(sections: PanelSection[]): SuggestionRow[] {
  const rows: SuggestionRow[] = [];
  let flatOptionIndex = 0;
  const multipleSections = sections.length > 1;
  for (const section of sections)
    if (
      (multipleSections &&
        section.title.trim().length > 0 &&
        rows.push({ kind: `section_header`, sectionId: section.id, title: section.title }),
      section.errorText)
    )
      rows.push({ kind: `status`, sectionId: section.id, content: `error`, text: section.errorText });
    else if (section.loading)
      rows.push({
        kind: `status`,
        sectionId: section.id,
        content: `loading`,
        text: section.loadingText ?? section.emptyText,
      });
    else if (section.options.length === 0)
      rows.push({ kind: `status`, sectionId: section.id, content: `empty`, text: section.emptyText });
    else
      for (const option of section.options)
        (rows.push({ kind: `option`, sectionId: section.id, option, flatOptionIndex }), (flatOptionIndex += 1));
  return rows;
}

export interface PanelSection { // 〔A0-S4-4b〕补 export：shim 留守 B6 useSlashPanelSections 型别消费（型别擦除，环安全）
  id: string;
  title: string;
  options: MentionSuggestionItem[];
  loading: boolean;
  loadingText?: string;
  errorText?: string | null;
  emptyText: string;
}

/** 原 SV（js 64687 / jsx 57678）：建议面板（@/#/$// 共用虚拟滚动列表） */
export function SuggestionPanel({
  title,
  description,
  sections,
  emptyText,
  selectedIndex,
  hasActiveQuery,
  onSelect,
  trigger,
}: {
  title: string;
  description?: string;
  sections: PanelSection[];
  emptyText: string;
  selectedIndex: number;
  hasActiveQuery: boolean;
  onSelect: (index: number) => void;
  trigger?: string;
}) {
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const [scrollFade, setScrollFade] = React.useState(NO_SCROLL_FADE);
  const rows = React.useMemo(() => flattenSuggestionRows(sections), [sections]);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: (index) =>
      rows[index]?.kind === `option` ? OPTION_ROW_HEIGHT : rows[index]?.kind === `section_header` ? SECTION_HEADER_ROW_HEIGHT : STATUS_ROW_HEIGHT,
    overscan: 8,
  });
  const totalSize = virtualizer.getTotalSize();
  const measureScrollFade = React.useCallback(() => {
    const element = scrollRef.current;
    if (!element) {
      setScrollFade(NO_SCROLL_FADE);
      return;
    }
    const next = computeScrollFade({
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
      scrollTop: element.scrollTop,
    });
    setScrollFade((prev) => (prev.showTop === next.showTop && prev.showBottom === next.showBottom ? prev : next));
  }, []);
  const fadeStyle = React.useMemo(() => scrollFadeMaskStyle(scrollFade), [scrollFade]);
  const selectedRowIndex = React.useMemo(
    () => rows.findIndex((row) => row.kind === `option` && row.flatOptionIndex === selectedIndex),
    [rows, selectedIndex],
  );
  return (
    (React.useEffect(() => {
      selectedRowIndex >= 0 && virtualizer.scrollToIndex(selectedRowIndex, { align: `auto` });
    }, [selectedRowIndex, virtualizer]),
    React.useEffect(() => {
      const element = scrollRef.current;
      if (!element) {
        setScrollFade(NO_SCROLL_FADE);
        return;
      }
      let frame: number | null = null;
      const schedule = () => {
        frame === null &&
          (frame = requestAnimationFrame(() => {
            ((frame = null), measureScrollFade());
          }));
      };
      (measureScrollFade(), element.addEventListener(`scroll`, schedule, { passive: true }));
      let observer: ResizeObserver | null = null;
      if (typeof ResizeObserver < `u`) {
        ((observer = new ResizeObserver(schedule)), observer.observe(element));
        const firstChild = element.firstElementChild;
        firstChild && observer.observe(firstChild);
      } else window.addEventListener(`resize`, schedule);
      return () => {
        (frame !== null && cancelAnimationFrame(frame),
          element.removeEventListener(`scroll`, schedule),
          observer?.disconnect(),
          typeof ResizeObserver > `u` && window.removeEventListener(`resize`, schedule));
      };
    }, [totalSize, measureScrollFade, rows.length]),
    (
      <div className={`mb-1 overflow-hidden rounded-2xl border border-border bg-menu shadow-xs`} data-testid={SUGGESTION_PANEL_TESTID} data-trigger={trigger}>
        {rows.length > 0 ? (
          <div
            ref={scrollRef}
            className={`max-h-56 overflow-y-auto px-1 py-0.75`}
            role={`listbox`}
            aria-label={title}
            onMouseLeave={() => setHoveredIndex(null)}
            style={fadeStyle}
          >
            <div style={{ height: `${totalSize}px`, width: `100%`, position: `relative` }}>
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const row = rows[virtualItem.index];
                return row ? (
                  <div
                    key={virtualItem.key}
                    style={{
                      position: `absolute`,
                      top: 0,
                      left: 0,
                      width: `100%`,
                      height: `${virtualItem.size}px`,
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                  >
                    {row.kind === `status` ? (
                      <SuggestionStatusRow row={row} />
                    ) : row.kind === `section_header` ? (
                      <SuggestionSectionHeaderRow row={row} />
                    ) : (
                      <SuggestionOptionRow
                        row={row}
                        isSelected={row.flatOptionIndex === selectedIndex}
                        isHovered={row.flatOptionIndex === hoveredIndex}
                        onSelect={onSelect}
                        onHover={setHoveredIndex}
                      />
                    )}
                  </div>
                ) : null;
              })}
            </div>
          </div>
        ) : hasActiveQuery && emptyText ? (
          <div className={`flex items-center justify-between px-4 py-3 text-ui-base text-foreground-subtlest`}>{emptyText}</div>
        ) : null}
        {!hasActiveQuery && description ? (
          <div className={`flex items-center gap-2 px-4 py-3 text-ui-base text-foreground-subtle`}>
            <InfoIcon className={`size-4 shrink-0 text-foreground`} />
            <span>{description}</span>
          </div>
        ) : null}
      </div>
    ))
  );
}

/** 原 _Je（js 64825；〔A1-P3-B14〕bundle 64828 `qr(Lr, e.sectionId)` 逐字改指 joinTestidParts：
 *  Lr←styles 584 `Ur as Lr`←src 9819 `G_ as Ur`≡G_@8314） */
function SuggestionSectionHeaderRow({ row }: { row: Extract<SuggestionRow, { kind: `section_header` }> }) {
  return (
    <div
      className={`px-3 pt-2 pb-1 text-ui-xs font-semibold uppercase tracking-wide text-foreground-subtlest`}
      data-testid={joinTestidParts(SUGGESTION_SECTION_TESTID, row.sectionId)}
      data-section-id={row.sectionId}
    >
      {row.title}
    </div>
  );
}

/** 原 vJe（js 64833；〔A1-P3-B14〕bundle 64837 `qr(Gr, e.sectionId)` 逐字改指 joinTestidParts：
 *  Gr←styles 598 `Wr as Gr`←src 9833 `q_ as Wr`≡q_@8316） */
function SuggestionStatusRow({ row }: { row: Extract<SuggestionRow, { kind: `status` }> }) {
  return row.content === `loading` ? (
    <div
      className={`flex items-center gap-2 rounded-xl px-5 py-2 text-ui-base text-foreground-subtle`}
      data-testid={joinTestidParts(SUGGESTION_STATUS_TESTID, row.sectionId)}
      data-section-id={row.sectionId}
      data-status={`loading`}
    >
      <LoaderIcon className={`size-3.5 shrink-0 animate-spin`} />
      <span>{row.text}</span>
    </div>
  ) : row.content === `error` ? (
    <div
      className={`rounded-xl bg-destructive px-5 py-2 text-ui-base text-destructive-foreground`}
      data-testid={joinTestidParts(SUGGESTION_STATUS_TESTID, row.sectionId)} // 〔A1-P3-B14〕bundle 64848 qr(Gr, e.sectionId)
      data-section-id={row.sectionId}
      data-status={`error`}
    >
      {row.text}
    </div>
  ) : (
    <div
      className={`rounded-xl px-5 py-2 text-ui-base text-foreground-subtlest`}
      data-testid={joinTestidParts(SUGGESTION_STATUS_TESTID, row.sectionId)} // 〔A1-P3-B14〕bundle 64855 qr(Gr, e.sectionId)
      data-section-id={row.sectionId}
      data-status={`empty`}
    >
      {row.text}
    </div>
  );
}

/** 原 yJe（js 64861）：选项行 */
function SuggestionOptionRow({
  row,
  isSelected,
  isHovered,
  onSelect,
  onHover,
}: {
  row: Extract<SuggestionRow, { kind: `option` }>;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: (index: number) => void;
  onHover: (index: number | null) => void;
}) {
  const { option, flatOptionIndex } = row;
  const disabled = option.disabled === true;
  return (
    <div className={`py-px w-full`}>
      <button
        type={`button`}
        role={`option`}
        aria-selected={isSelected}
        aria-disabled={disabled}
        disabled={disabled}
        data-testid={joinTestidParts(SUGGESTION_OPTION_TESTID, option.id)} // 〔A1-P3-B14〕bundle 64872 qr(nee, a.id)：nee←styles 591 `Vr as nee`←src 9826 `K_ as Vr`≡K_@8315
        data-section-id={row.sectionId}
        data-option-id={option.id}
        data-option-index={flatOptionIndex}
        data-selected={isSelected ? `true` : `false`}
        data-disabled={disabled ? `true` : `false`}
        className={cn(
          `flex h-8 w-full items-center gap-3 rounded-xl px-3 text-left transition-colors`,
          disabled ? `cursor-not-allowed opacity-50` : isSelected ? `bg-selected` : isHovered ? `bg-hover` : `hover:bg-hover`,
        )}
        onMouseDown={(event) => {
          (event.preventDefault(), !disabled && onSelect(flatOptionIndex));
        }}
        onMouseEnter={() => onHover(disabled ? null : flatOptionIndex)}
      >
        {option.content ? (
          <>{option.content}</>
        ) : (
          <span className={`min-w-0 flex-1 flex`}>
            <span className={`flex items-center gap-2 flex-auto`}>
              <span className={`truncate text-ui-base font-medium text-foreground`}>{option.label}</span>
              {option.meta ? <span className={`shrink-0 text-ui-xs text-foreground-subtlest`}>{option.meta}</span> : null}
            </span>
            <span className={`mt-1 block truncate text-ui-xs text-foreground-subtlest`}>
              {disabled && option.disabledReason ? option.disabledReason : option.description}
            </span>
          </span>
        )}
      </button>
    </div>
  );
}

