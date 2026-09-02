// A0-S4-4c: 自 modules/MarkdownTable.tsx 原样整体迁入（组件全族 + 私有辅助 + 局部型别 + 尾部符号表；原文件现为薄 re-export shim）。
// 仅导入路径按 components/markdown/ 深度改指（./ → ../../modules/；../components/ → ../；其余 ../ → ../../）；迁出体逐字未动。
/* eslint-disable */
/**
 * ============================================================================
 * MarkdownTable.tsx — ZCode 3.7.6 markdown 渲染层 · 表格子模块
 * （解混淆重建 · D8 Stage B2）
 * ============================================================================
 *
 * 来源文件（21,756 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/chunk-BO2N2NFS-CSNAeaxF.js
 * 对照 jsx：src-reconstructed/renderer/assets/chunk-BO2N2NFS-CSNAeaxF.jsx
 * 定性：streamdown@2.5.0 first-party 层 —— 表格数据提取/序列化 + 表格控件族。
 *
 * ----------------------------------------------------------------------------
 * 混淆名 → 语义名（js 行 / jsx 行；上游 streamdown 导出名见括注）
 * ----------------------------------------------------------------------------
 *   ly → extractTableDataFromElement  DOM 表格 → {headers, rows}（上游 m）(28642)
 *   uy → tableDataToCSV           CSV 序列化（引号转义，上游 n）(19867)
 *   dy → tableDataToTSV           TSV 序列化（\t \n \r 字面量化，上游 o）(19896)
 *   fy → escapeMarkdownTableCell  单元格 `\`/`|` 转义（上游 p）(19931)
 *   py → tableDataToMarkdown      Markdown 表格序列化（上游 q）(19946)
 *   my → TableCopyDropdown        复制下拉（Markdown/CSV/TSV；clipboard.write
 *                                 双 MIME text/plain+text/html，上游 r）(19956)
 *   hy → TableDownloadDropdown    下载下拉（CSV/Markdown，上游 s）(20062)
 *   gy → TableFullscreenButton    表格全屏（portal + sticky 表头，上游 t）(20144)
 *   _y → TableWrapper             表格外壳 + 控件条（data-streamdown=table-wrapper）
 *                                 (20238)
 *
 * 外部依赖：MarkdownContext.tsx（上下文/图标/文案/下载/滚动锁）
 * ============================================================================
 */

import * as React from "react";
import { createPortal } from "react-dom";
import {
  StreamdownContext,
  useClassNames,
  useStreamdownIcons,
  useStreamdownTranslations,
  downloadFile,
  lockBodyScroll,
  unlockBodyScroll,
} from "../../modules/MarkdownContext";

/* ============================================================================
 * 1. 表格数据提取与序列化（原 ly/uy/dy/fy/py，js 19849-19955）
 * ==========================================================================*/

export interface TableData {
  headers: string[];
  rows: string[][];
}

/** 原 ly：从 <table> 元素提取 thead th / tbody tr td 文本 */
export const extractTableDataFromElement = (table: HTMLTableElement): TableData => {
  const headers: string[] = [];
  const rows: string[][] = [];
  const headerCells = table.querySelectorAll(`thead th`);
  for (const cell of headerCells) headers.push(cell.textContent?.trim() || ``);
  const bodyRows = table.querySelectorAll(`tbody tr`);
  for (const row of bodyRows) {
    const rowData: string[] = [];
    const cells = row.querySelectorAll(`td`);
    for (const cell of cells) rowData.push(cell.textContent?.trim() || ``);
    rows.push(rowData);
  }
  return { headers, rows };
};

/** 原 uy：CSV。含 `"`/`,`/换行 的单元格加引号，内部引号翻倍 */
export const tableDataToCSV = ({ headers, rows }: TableData): string => {
  const escapeCell = (value: string): string => {
    let needsQuotes = false;
    let hasQuote = false;
    for (const char of value) {
      if (char === `"`) {
        needsQuotes = true;
        hasQuote = true;
        break;
      }
      if (char === `,` || char === `\n`) needsQuotes = true;
    }
    return needsQuotes ? (hasQuote ? `"${value.replace(/"/g, `""`)}"` : `"${value}"`) : value;
  };
  const lineCount = headers.length > 0 ? rows.length + 1 : rows.length;
  const lines = Array<string>(lineCount);
  let index = 0;
  if (headers.length > 0) {
    lines[index] = headers.map(escapeCell).join(`,`);
    index += 1;
  }
  for (const row of rows) {
    lines[index] = row.map(escapeCell).join(`,`);
    index += 1;
  }
  return lines.join(`\n`);
};

/** 原 dy：TSV。制表符/换行/回车转成字面 `\t`/`\n`/`\r` */
export const tableDataToTSV = ({ headers, rows }: TableData): string => {
  const escapeCell = (value: string): string => {
    let needsEscape = false;
    for (const char of value)
      if (char === `\t` || char === `\n` || char === `\r`) {
        needsEscape = true;
        break;
      }
    if (!needsEscape) return value;
    const chars: string[] = [];
    for (const char of value)
      if (char === `\t`) chars.push(`\\t`);
      else if (char === `\n`) chars.push(`\\n`);
      else if (char === `\r`) chars.push(`\\r`);
      else chars.push(char);
    return chars.join(``);
  };
  const lineCount = headers.length > 0 ? rows.length + 1 : rows.length;
  const lines = Array<string>(lineCount);
  let index = 0;
  if (headers.length > 0) {
    lines[index] = headers.map(escapeCell).join(`\t`);
    index += 1;
  }
  for (const row of rows) {
    lines[index] = row.map(escapeCell).join(`\t`);
    index += 1;
  }
  return lines.join(`\n`);
};

/** 原 fy：Markdown 单元格转义（`\` → `\\`，`|` → `\|`） */
export const escapeMarkdownTableCell = (value: string): string => {
  let needsEscape = false;
  for (const char of value)
    if (char === `\\` || char === `|`) {
      needsEscape = true;
      break;
    }
  if (!needsEscape) return value;
  const chars: string[] = [];
  for (const char of value) if (char === `\\`) chars.push(`\\\\`);
  else if (char === `|`) chars.push(`\\|`);
  else chars.push(char);
  return chars.join(``);
};

/** 原 py：Markdown 表格（头 + | --- | 分隔行 + 数据行；短行补空列） */
export const tableDataToMarkdown = ({ headers, rows }: TableData): string => {
  if (headers.length === 0) return ``;
  const lines = Array<string>(rows.length + 2);
  let index = 0;
  lines[index] = `| ${headers.map((header) => escapeMarkdownTableCell(header)).join(` | `)} |`;
  index += 1;
  const divider = Array<string>(headers.length);
  for (let i = 0; i < headers.length; i += 1) divider[i] = `---`;
  lines[index] = `| ${divider.join(` | `)} |`;
  index += 1;
  for (const row of rows)
    if (row.length < headers.length) {
      const padded = Array<string>(headers.length);
      for (let i = 0; i < headers.length; i += 1) padded[i] = i < row.length ? escapeMarkdownTableCell(row[i]) : ``;
      lines[index] = `| ${padded.join(` | `)} |`;
      index += 1;
    } else {
      lines[index] = `| ${row.map((cell) => escapeMarkdownTableCell(cell)).join(` | `)} |`;
      index += 1;
    }
  return lines.join(`\n`);
};

/* ============================================================================
 * 2. TableCopyDropdown（原 my，js 19956-20061 / jsx 16354）
 *    从最近的 [data-streamdown=table-wrapper] 找 <table>，序列化后
 *    ClipboardItem 双 MIME（text/plain + text/html=原表 outerHTML）写入；
 *    2s check 态；点击外部关闭；isAnimating 禁用。
 * ==========================================================================*/

export interface TableCopyDropdownProps {
  children?: React.ReactNode;
  className?: string;
  onCopy?: (format: string) => void;
  onError?: (error: unknown) => void;
  timeout?: number;
}

export const TableCopyDropdown: React.FC<TableCopyDropdownProps> = ({
  children,
  className,
  onCopy,
  onError,
  timeout = 2000,
}) => {
  const cn = useClassNames();
  const [open, setOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const timeoutRef = React.useRef(0);
  const { isAnimating } = React.useContext(StreamdownContext);
  const translations = useStreamdownTranslations();
  const handleCopy = async (format: string) => {
    if (typeof window === `undefined` || !navigator?.clipboard?.write) {
      onError?.(Error(`Clipboard API not available`));
      return;
    }
    try {
      const table = containerRef.current?.closest(`[data-streamdown="table-wrapper"]`)?.querySelector(`table`);
      if (!table) {
        onError?.(Error(`Table not found`));
        return;
      }
      const data = extractTableDataFromElement(table as HTMLTableElement);
      const serialized = ({ csv: tableDataToCSV, tsv: tableDataToTSV, md: tableDataToMarkdown }[format] || tableDataToMarkdown)(data);
      const item = new ClipboardItem({
        "text/plain": new Blob([serialized], { type: `text/plain` }),
        "text/html": new Blob([(table as HTMLTableElement).outerHTML], { type: `text/html` }),
      });
      await navigator.clipboard.write([item]);
      setCopied(true);
      setOpen(false);
      onCopy?.(format);
      timeoutRef.current = window.setTimeout(() => setCopied(false), timeout);
    } catch (error) {
      onError?.(error);
    }
  };
  React.useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      const path = event.composedPath();
      if (containerRef.current && !path.includes(containerRef.current)) setOpen(false);
    };
    document.addEventListener(`mousedown`, handleMouseDown);
    return () => {
      document.removeEventListener(`mousedown`, handleMouseDown);
      window.clearTimeout(timeoutRef.current);
    };
  }, []);
  const icons = useStreamdownIcons();
  const Icon = copied ? icons.CheckIcon : icons.CopyIcon;
  return (
    <div className={cn(`relative`)} ref={containerRef}>
      <button
        className={cn(
          `cursor-pointer p-1 text-muted-foreground transition-all hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50`,
          className,
        )}
        disabled={isAnimating}
        onClick={() => setOpen(!open)}
        title={translations.copyTable}
        type="button"
      >
        {children ?? <Icon height={14} width={14} />}
      </button>
      {open ? (
        <div
          className={cn(
            `absolute top-full right-0 z-20 mt-1 min-w-[120px] overflow-hidden rounded-md border border-border bg-background shadow-lg`,
          )}
        >
          <button
            className={cn(`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-muted/40`)}
            onClick={() => handleCopy(`md`)}
            title={translations.copyTableAsMarkdown}
            type="button"
          >
            {translations.tableFormatMarkdown}
          </button>
          <button
            className={cn(`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-muted/40`)}
            onClick={() => handleCopy(`csv`)}
            title={translations.copyTableAsCsv}
            type="button"
          >
            {translations.tableFormatCsv}
          </button>
          <button
            className={cn(`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-muted/40`)}
            onClick={() => handleCopy(`tsv`)}
            title={translations.copyTableAsTsv}
            type="button"
          >
            {translations.tableFormatTsv}
          </button>
        </div>
      ) : null}
    </div>
  );
};

/* ============================================================================
 * 3. TableDownloadDropdown（原 hy，js 20062-20143 / jsx 16417）
 *    下载 CSV（table.csv, text/csv）或 Markdown（table.md, text/markdown）。
 * ==========================================================================*/

export interface TableDownloadDropdownProps {
  children?: React.ReactNode;
  className?: string;
  onDownload?: (format: string) => void;
  onError?: (error: unknown) => void;
}

export const TableDownloadDropdown: React.FC<TableDownloadDropdownProps> = ({ children, className, onDownload, onError }) => {
  const cn = useClassNames();
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { isAnimating } = React.useContext(StreamdownContext);
  const translations = useStreamdownTranslations();
  const icons = useStreamdownIcons();
  const handleDownload = (format: string) => {
    try {
      const table = containerRef.current?.closest(`[data-streamdown="table-wrapper"]`)?.querySelector(`table`);
      if (!table) {
        onError?.(Error(`Table not found`));
        return;
      }
      const data = extractTableDataFromElement(table as HTMLTableElement);
      const serialized = format === `csv` ? tableDataToCSV(data) : tableDataToMarkdown(data);
      downloadFile(`table.${format === `csv` ? `csv` : `md`}`, serialized, format === `csv` ? `text/csv` : `text/markdown`);
      setOpen(false);
      onDownload?.(format);
    } catch (error) {
      onError?.(error);
    }
  };
  React.useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      const path = event.composedPath();
      if (containerRef.current && !path.includes(containerRef.current)) setOpen(false);
    };
    document.addEventListener(`mousedown`, handleMouseDown);
    return () => {
      document.removeEventListener(`mousedown`, handleMouseDown);
    };
  }, []);
  return (
    <div className={cn(`relative`)} ref={containerRef}>
      <button
        className={cn(
          `cursor-pointer p-1 text-muted-foreground transition-all hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50`,
          className,
        )}
        disabled={isAnimating}
        onClick={() => setOpen(!open)}
        title={translations.downloadTable}
        type="button"
      >
        {children ?? <icons.DownloadIcon size={14} />}
      </button>
      {open ? (
        <div
          className={cn(
            `absolute top-full right-0 z-20 mt-1 min-w-[120px] overflow-hidden rounded-md border border-border bg-background shadow-lg`,
          )}
        >
          <button
            className={cn(`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-muted/40`)}
            onClick={() => handleDownload(`csv`)}
            title={translations.downloadTableAsCsv}
            type="button"
          >
            {translations.tableFormatCsv}
          </button>
          <button
            className={cn(`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-muted/40`)}
            onClick={() => handleDownload(`markdown`)}
            title={translations.downloadTableAsMarkdown}
            type="button"
          >
            {translations.tableFormatMarkdown}
          </button>
        </div>
      ) : null}
    </div>
  );
};

/* ============================================================================
 * 4. TableFullscreenButton（原 gy，js 20144-20237 / jsx 16455）
 *    全屏表格：portal 覆盖层（role=dialog），顶栏 = [复制][下载][关闭]，
 *    表格区 sticky 表头；Escape/点击背景退出；滚动锁。
 * ==========================================================================*/

export interface TableFullscreenButtonProps {
  children?: React.ReactNode;
  className?: string;
  showCopy?: boolean;
  showDownload?: boolean;
}

export const TableFullscreenButton: React.FC<TableFullscreenButtonProps> = ({
  children,
  className,
  showCopy = true,
  showDownload = true,
}) => {
  const { Maximize2Icon, XIcon } = useStreamdownIcons();
  const cn = useClassNames();
  const [fullscreen, setFullscreen] = React.useState(false);
  const { isAnimating } = React.useContext(StreamdownContext);
  const translations = useStreamdownTranslations();
  const openFullscreen = () => {
    setFullscreen(true);
  };
  const closeFullscreen = () => {
    setFullscreen(false);
  };
  React.useEffect(() => {
    if (fullscreen) {
      lockBodyScroll();
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === `Escape`) setFullscreen(false);
      };
      document.addEventListener(`keydown`, handleKeyDown);
      return () => {
        document.removeEventListener(`keydown`, handleKeyDown);
        unlockBodyScroll();
      };
    }
  }, [fullscreen]);
  return (
    <>
      <button
        className={cn(
          `cursor-pointer p-1 text-muted-foreground transition-all hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50`,
          className,
        )}
        disabled={isAnimating}
        onClick={openFullscreen}
        title={translations.viewFullscreen}
        type="button"
      >
        <Maximize2Icon size={14} />
      </button>
      {fullscreen
        ? createPortal(
            <div
              aria-label={translations.viewFullscreen}
              aria-modal="true"
              className={cn(`fixed inset-0 z-50 flex flex-col bg-background`)}
              data-streamdown="table-fullscreen"
              onClick={closeFullscreen}
              onKeyDown={(event) => {
                if (event.key === `Escape`) closeFullscreen();
              }}
              role="dialog"
            >
              <div
                className={cn(`flex h-full flex-col`)}
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
                role="presentation"
              >
                <div className={cn(`flex items-center justify-end gap-1 p-4`)}>
                  {showCopy ? <TableCopyDropdown /> : null}
                  {showDownload ? <TableDownloadDropdown /> : null}
                  <button
                    className={cn(`rounded-md p-1 text-muted-foreground transition-all hover:bg-muted hover:text-foreground`)}
                    onClick={closeFullscreen}
                    title={translations.exitFullscreen}
                    type="button"
                  >
                    <XIcon size={20} />
                  </button>
                </div>
                <div className={cn(`flex-1 overflow-auto p-4 pt-0 [&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10`)}>
                  <table className={cn(`w-full border-collapse border border-border`)} data-streamdown="table">
                    {children}
                  </table>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
};

/* ============================================================================
 * 5. TableWrapper（原 _y，js 20238-20279 / jsx 16495）
 *    表格外壳：控件条（复制/下载/全屏，按 controls 开关）+ 滚动容器 + 表格。
 *    MarkdownTable 元素组件（MarkdownElements.tsx）把 showControls/showCopy/
 *    showDownload/showFullscreen 解析后传入。
 * ==========================================================================*/

export interface TableWrapperProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children?: React.ReactNode;
  className?: string;
  showControls?: boolean;
  showCopy?: boolean;
  showDownload?: boolean;
  showFullscreen?: boolean;
}

export const TableWrapper: React.FC<TableWrapperProps> = ({
  children,
  className,
  showControls,
  showCopy = true,
  showDownload = true,
  showFullscreen = true,
  ...rest
}) => {
  const cn = useClassNames();
  const showCopyButton = showControls && showCopy;
  const showDownloadButton = showControls && showDownload;
  const showFullscreenButton = showControls && showFullscreen;
  const hasControls = showCopyButton || showDownloadButton || showFullscreenButton;
  return (
    <div className={cn(`my-4 flex flex-col gap-2 rounded-lg border border-border bg-sidebar p-2`)} data-streamdown="table-wrapper">
      {hasControls ? (
        <div className={cn(`flex items-center justify-end gap-1`)}>
          {showCopyButton ? <TableCopyDropdown /> : null}
          {showDownloadButton ? <TableDownloadDropdown /> : null}
          {showFullscreenButton ? (
            <TableFullscreenButton showCopy={showCopyButton} showDownload={showDownloadButton}>
              {children}
            </TableFullscreenButton>
          ) : null}
        </div>
      ) : null}
      <div className={cn(`border-collapse overflow-x-auto overflow-y-auto rounded-md border border-border bg-background`)}>
        <table className={cn(`w-full divide-y divide-border`, className)} data-streamdown="table" {...rest}>
          {children}
        </table>
      </div>
    </div>
  );
};
