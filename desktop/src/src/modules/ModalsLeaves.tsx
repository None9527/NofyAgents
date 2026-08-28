/* eslint-disable */
/**
 * ============================================================================
 * ModalsLeaves.tsx — ZCode 3.7.6 模态族接口级叶子 + 杂项共享件（D8 Stage B4）
 * ============================================================================
 *
 * 来源文件（融合 chunk，213,695 行，未改动；只读访问）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js
 *   （md5 c9d0d675d0b858e6e7711df3e9122e81）
 * 前序产物（本批实体化其接口级声明）：
 *   Modals.tsx（E3t 向导消费的 S4t/C4t hero、R7/I2t/v$t 共用面声明）
 *   CodeViewer.tsx（gut PlainTextDiffPreview、W8 DiffViewer 声明；W8 已在该文件实现）
 *   GitReview.tsx / Conversation.tsx / ExtendedViews.tsx（Bc FilePathInline 声明）
 * 标样：TopBar.tsx（行号口径 = 输入 js 闭区间；混淆名映射表 + 外部依赖清单）
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（js 行号为融合 chunk 行）
 * ----------------------------------------------------------------------------
 * §A Onboarding hero（F18；Modals.tsx §2.4 接口级，js 206054–206119）：
 *   x4t → resolveHeroThemeStyles   (206054)  主题 → 面板/光晕/文案色四分支
 *   S4t → useHeroTextSizes         (206090)  设置 store 主题解析（system 走暗判定）
 *   C4t → HeroCard                 (206094)  双光晕卡片壳
 *
 * §B 文件路径内联组件（横切 §2.2 文件图标块 4946–6061；Bc js 5157）：
 *   Mc → FOLDER_ICON_DATA_URI      (5113)  文件夹 svg data-uri
 *   Nc → materialIconsBaseOverride (5114，可变注水点，$se 设置)
 *   $se → setMaterialIconsBase     (5116)
 *   ece → resolveMaterialIconsBase (5119)  `./`→`material-icons`
 *   Pc  → materialIconPath        (5120)  `${base}/${name}.svg`
 *   tce → materialIconPathAlias   (5123)
 *   Fc/Ic → folder/document 图标路径常量 (5124)
 *   Lc  → fileIconFallbackSrc     (5126)  加载失败降级（自身→null；document→folder-uri；其余→document 路径）
 *   Rc  → relativeDisplayPath     (5138)  相对基路径的显示路径（同基 → 空）
 *   nce → displayDirectoryPrefix  (5144)  目录前缀（`…/` 尾）
 *   zc  → resolveFileDisplayInfo  (5150)  图标/名/目录前缀归一
 *   Bc  → FilePathInline          (5157)  图标 + 文件名 + 目录尾（失败降级）
 *   Vc  → FileIconImg             (5196)  独立图标（失败降级）
 *
 * §C 纯文本 diff 预览（F14/F19 共用；CodeViewer.tsx 接口级）：
 *   ahe → DIFF_TRUNCATED_MARKER_PATTERN (23153)  `^\\ __ZCODE_DIFF_TRUNCATED__:(\d+)$`
 *   dhe → parseTruncatedMarker    (23226)
 *   mut → parseDiffLine           (100417)  +/-/空白 前缀 → 行类型
 *   hut → diffKindStyles          (100426)  added/removed/context 三态样式
 *   gut → PlainTextDiffPreview    (100459)  行号粘性列 + 截断提示 + 换行模式
 *
 * §D El gutter 交互控制器（F14；js 6062–6880，~820 行；GitReview/TermBrowser 报告登记）：
 *   El  → DiffInteractionManager  (6062)  file|diff 双模：悬停/点击/行选择/gutter 工具位
 *   nl  → isSameSelectionRange    (5249)
 *   rl/il/al → hast text/element/icon 构造 (5254/5257/5260)
 *   mce → gutterUtilityButtonTree (5307)  `diffs-icon-plus` 按钮 hast
 *   hce → isSameSelectionPoint    (5314)
 *   Tl  → serializeHast           (6020，vendored hast-util-to-html；接口级)
 *   Ol/kl/Al/vle/yle/ble/jl/Ml/Nl/Pl/Fl → 指针目标类型守卫与助手 (6959–7012)
 *
 * §E 边界裁决记录（与既有抽取产物的去重，详见合并报告 §4）：
 *   R7  useExternalAgentImportState   → 已由 SettingsPanels.tsx 3153 全量抽取（F06 族）
 *   v$t ExternalAgentImportSelectionPane → 已由 SettingsPanels.tsx 3953 全量抽取（F06 族）
 *   I2t useClaudeMigration          → 已由 SettingsPanelsData.tsx 844 全量抽取（F06 族）
 *   W8  DiffViewer(memo)            → 已由 CodeViewer.tsx 1124 实现（F14 族）
 *   以上四件不重复抽取；Modals.tsx 内对应 `declare` 存根整合期改为跨文件导入。
 *
 * ----------------------------------------------------------------------------
 * 二、外部依赖清单（跨 chunk 导入；标注来源 chunk 与导出字母）
 * ----------------------------------------------------------------------------
 *  1. react / jsx-runtime            react-BQLj9xdT.js、jsx-runtime-B5yMD3-t.js
 *  2. cn() 类名合并 (Z)              utils-CEEH0K_K.js (t 导出)
 *  3. useIntlContext (G) → {intl}    IntlProvider-C321H7m8.js (n 导出)
 *  4. 设置 store (ko，1296)          stores-core.tsx 已重建（theme 字段）
 *  5. 文件类型/图标工具块的未抽取件（kc 缺省图标名、Qse 扩展名→图标解析，
 *     4946–6061；接口级）——本文件 zc/Bc 消费
 *  6. diff 引擎截断标记（X09 vendored 段的 ZCODE 扩展；ahe 常量逐字保留）
 * ============================================================================
 */

import * as React from "react";
import { useSettingsStore } from './stores-core';

/* ============================================================================
 * 0. 外部依赖的类型声明
 * ==========================================================================*/

/** 类名合并（原 Z，utils-CEEH0K_K.js） */
declare function cn(...inputs: Array<string | false | null | undefined>): string;

/** 自研 i18n（原 G，IntlProvider chunk） */
interface IntlShape {
  formatMessage(descriptor: { id: string }, values?: Record<string, unknown>): string;
}
declare function useIntlContext(): { intl: IntlShape; locale: string };

/** 设置 store（原 ko，stores-core.tsx）：主题字段 */
/** 原 xo（1103，stores-core 域）：system 主题的暗色解析 */
declare function resolveSystemThemeIsDark(theme: string): boolean;

/** 原 kc（5016）：缺省文件图标名 `document` */
declare const DEFAULT_FILE_ICON_NAME: string;
/** 原 Qse（5093）：文件名 → 图标名（扩展名表 + 特例表；横切文件图标块，接口级） */
declare function resolveFileIconName(fileName: string): string;
/** 原 Ac（5087）：路径分隔符归一（\ → /） */
function normalizePathSeparators(path: string): string {
  return path.replace(/\\/g, "/");
}
/** 原 jc（5090）：去尾部斜杠 */
function stripTrailingSlashes(path: string): string {
  return path.replace(/\/+$/, "");
}
/** 原 Go（1928）：路径基名（ExtendedViews 亦登记；此处按源码实现） */
export function pathBasename(path: string): string {
  const segments = path.replace(/\\/g, "/").replace(/\/+$/, "").split("/").filter(Boolean);
  return segments[segments.length - 1] ?? path;
}

/* ============================================================================
 * §A. Onboarding hero（原 js 206054–206119）
 * ==========================================================================*/

export interface HeroThemeStyles {
  panel: string;
  glowPrimary: string;
  glowSecondary: string;
  heading: string;
  description: string;
}

/** 原 x4t（206054）：主题 → hero 样式（light / zai-light / zai-dark / 缺省暗色） */
export function resolveHeroThemeStyles(theme: string): HeroThemeStyles {
  switch (theme) {
    case "light":
      return {
        panel:
          "bg-[linear-gradient(180deg,#eff6ff_0%,#dbeafe_34%,#bfdbfe_100%)] before:absolute before:inset-0 before:content-[''] before:bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.9),transparent_24%),radial-gradient(circle_at_82%_16%,rgba(125,211,252,0.42),transparent_26%),radial-gradient(circle_at_68%_80%,rgba(96,165,250,0.24),transparent_28%)]",
        glowPrimary: "bg-sky-200/70 mix-blend-screen",
        glowSecondary: "bg-blue-200/70 mix-blend-multiply",
        heading: "text-slate-900",
        description: "text-slate-700/80",
      };
    case "zai-light":
      return {
        panel:
          "bg-[linear-gradient(180deg,#ffffff_0%,#f8f8f8_42%,#ebf4ff_100%)] before:absolute before:inset-0 before:content-[''] before:bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.9),transparent_24%),radial-gradient(circle_at_82%_14%,rgba(11,127,255,0.2),transparent_26%),radial-gradient(circle_at_70%_84%,rgba(128,190,255,0.2),transparent_30%)]",
        glowPrimary: "bg-[#80BEFF]/45 mix-blend-multiply",
        glowSecondary: "bg-[#EBF4FF]/80 mix-blend-multiply",
        heading: "text-[#0D0D0D]",
        description: "text-[#5C5C5C]",
      };
    case "zai-dark":
      return {
        panel:
          "bg-[linear-gradient(180deg,#161616_0%,#202020_42%,#001d3d_100%)] before:absolute before:inset-0 before:content-[''] before:bg-[radial-gradient(circle_at_18%_18%,rgba(64,153,255,0.18),transparent_24%),radial-gradient(circle_at_82%_12%,rgba(128,190,255,0.2),transparent_26%),radial-gradient(circle_at_66%_84%,rgba(153,199,255,0.16),transparent_28%)]",
        glowPrimary: "bg-[#4099FF]/22 mix-blend-screen",
        glowSecondary: "bg-[#80BEFF]/16 mix-blend-screen",
        heading: "text-[#F8F8F8]",
        description: "text-[#ADADAD]",
      };
    default:
      return {
        panel:
          "bg-[linear-gradient(180deg,#060816_0%,#0b1333_38%,#12245a_72%,#173474_100%)] before:absolute before:inset-0 before:content-[''] before:bg-[radial-gradient(circle_at_16%_20%,rgba(165,243,252,0.14),transparent_22%),radial-gradient(circle_at_82%_14%,rgba(96,165,250,0.18),transparent_24%),radial-gradient(circle_at_68%_84%,rgba(56,189,248,0.14),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0))]",
        glowPrimary: "bg-cyan-300/22 mix-blend-screen",
        glowSecondary: "bg-blue-400/18 mix-blend-screen",
        heading: "text-slate-50",
        description: "text-slate-200/72",
      };
  }
}

/** 原 S4t（206090）：当前主题 → hero 样式（system 经暗色判定归一） */
export function useHeroThemeStyles(): HeroThemeStyles {
  const theme = useSettingsStore((state) => state.theme);
  return resolveHeroThemeStyles(theme === "system" ? (resolveSystemThemeIsDark(theme) ? "dark" : "light") : theme);
}

/** 原 C4t（206094）：Hero 卡片壳（双光晕 blur-3xl 绝对定位 + 面板渐变） */
export function HeroCard(props: { className?: string; contentClassName?: string; children: React.ReactNode }) {
  const styles = useHeroThemeStyles();
  return (
    <div className={cn("relative overflow-hidden", styles.panel, props.className)}>
      <div
        className={cn(
          "pointer-events-none absolute left-[-12%] top-[18%] h-[42rem] w-[42rem] rounded-full blur-3xl",
          styles.glowPrimary,
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute right-[-18%] bottom-[-14%] h-[36rem] w-[36rem] rounded-full blur-3xl",
          styles.glowSecondary,
        )}
      />
      <div className={cn("relative", props.contentClassName)}>{props.children}</div>
    </div>
  );
}

/* ============================================================================
 * §B. 文件路径内联组件（原 js 5113–5215）
 * ==========================================================================*/

/** 原 Mc（5113）：文件夹图标 svg data-uri（逐字保留） */
export const FOLDER_ICON_DATA_URI =
  "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M4.5%201.5h4.586L12.5%204.914V13a1.5%201.5%200%200%201-1.5%201.5h-6A1.5%201.5%200%200%201%203.5%2013V3A1.5%201.5%200%200%201%205%201.5Z%22%20stroke%3D%22%252394A3B8%22%20stroke-width%3D%221.2%22%20stroke-linejoin%3D%22round%22%2F%3E%3Cpath%20d%3D%22M9%201.75V5h3.25%22%20stroke%3D%22%252394A3B8%22%20stroke-width%3D%221.2%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E";

/** 原 Nc（5114）：material-icons 基路径注水点（宿主注入） */
let materialIconsBaseOverride: string | null = null;

/** 原 $se（5116）：注入 material-icons 基路径 */
export function setMaterialIconsBase(base: string | null): void {
  materialIconsBaseOverride = base;
}

/** 原 ece（5119）：material-icons 基路径（`./` 尾斜杠规范化） */
export function resolveMaterialIconsBase(): string {
  return `${"./".replace(/\/?$/, "/")}material-icons`;
}

/** 原 Pc（5120）：图标名 → 资源路径 */
export function materialIconPath(name: string): string {
  return `${resolveMaterialIconsBase()}/${name}.svg`;
}

/** 原 tce（5123）：同 Pc 的别名（消费面区分） */
export function materialIconPathAlias(name: string): string {
  return materialIconPath(name);
}

/** 原 Fc/Ic（5124）：folder / document 图标路径常量 */
const FOLDER_ICON_PATH = materialIconPath("folder");
const DOCUMENT_ICON_PATH = materialIconPath(DEFAULT_FILE_ICON_NAME);

/** 原 Lc（5126）：图标加载失败降级（文件夹 uri 自身 → null；document 路径/尾 → 文件夹 uri；其余 → document 路径） */
export function fileIconFallbackSrc(src: string): string | null {
  if (src === FOLDER_ICON_DATA_URI) return null;
  return src === DOCUMENT_ICON_PATH || src.endsWith("/document.svg") ? FOLDER_ICON_DATA_URI : DOCUMENT_ICON_PATH;
}

/** 原 Rc（5138）：相对基路径的显示路径（同基 → 空串；前缀匹配 → 相对尾） */
export function relativeDisplayPath(path: string, basePath: string | null | undefined): string {
  if (!basePath) return path;
  const normalizedPath = stripTrailingSlashes(normalizePathSeparators(path));
  const normalizedBase = stripTrailingSlashes(normalizePathSeparators(basePath));
  return normalizedPath === normalizedBase ? "" : normalizedPath.startsWith(`${normalizedBase}/`) ? normalizedPath.slice(normalizedBase.length + 1) : path;
}

/** 原 nce（5144）：目录前缀显示（基名之前的 `…/` 段；无 → null） */
export function displayDirectoryPrefix(relativePath: string, fileName: string): string | null {
  const normalized = normalizePathSeparators(relativePath);
  if (!normalized || normalized === fileName) return null;
  const index = normalized.lastIndexOf(`/${fileName}`);
  if (index === -1) return null;
  const prefix = normalized.slice(0, index + 1);
  return prefix.length > 0 ? prefix : null;
}

export interface FileDisplayOptions {
  basePath?: string;
  kind?: "file" | "directory";
}

export interface FileDisplayInfo {
  fileIcon: string;
  fileIconSrc: string;
  fileName: string;
  filePath: string | null;
  normalizedPath: string;
}

/** 原 zc（5150）：路径 → 显示信息（图标名/图标源/文件名/目录前缀） */
export function resolveFileDisplayInfo(path: string, options: FileDisplayOptions = {}): FileDisplayInfo {
  const normalizedPath = normalizePathSeparators(path);
  const fileName = pathBasename(normalizedPath);
  const filePath = displayDirectoryPrefix(relativeDisplayPath(normalizedPath, options.basePath ?? materialIconsBaseOverride ?? undefined), fileName);
  const fileIcon = options.kind === "directory" ? "folder" : resolveFileIconName(fileName);
  return { fileIcon, fileIconSrc: materialIconPathAlias(fileIcon), fileName, filePath, normalizedPath };
}

export interface FilePathInlineOptions {
  basePath?: string;
  kind?: "file" | "directory";
  showIcon?: boolean;
  iconSize?: number;
  showFilePath?: boolean;
  className?: string;
  fileNameClassName?: string;
  filePathClassName?: string;
}

/**
 * 原 Bc（5157）：文件路径内联组件（文件树/提及/代码查看共用）。
 * 图标 + 文件名 + 目录尾；图标加载失败按 Lc 降级一次。
 */
export function FilePathInline({ path, options }: { path: string; options?: FilePathInlineOptions }) {
  const info = resolveFileDisplayInfo(path, { basePath: options?.basePath, kind: options?.kind });
  const [iconSrc, setIconSrc] = React.useState(info.fileIconSrc);
  React.useEffect(() => {
    setIconSrc(info.fileIconSrc);
  }, [info.fileIconSrc]);
  return (
    <span className={options?.className ?? "inline-flex max-w-full items-center gap-1 "}>
      {options?.showIcon === false ? null : (
        <img
          src={iconSrc}
          alt=""
          width={options?.iconSize ?? 16}
          height={options?.iconSize ?? 16}
          className="shrink-0"
          aria-hidden="true"
          onError={() => {
            const fallback = fileIconFallbackSrc(iconSrc);
            if (fallback) setIconSrc(fallback);
          }}
        />
      )}
      <span className={options?.fileNameClassName ?? "truncate text-ui-base font-medium text-foreground"}>{info.fileName}</span>
      {options?.showFilePath && info.filePath ? (
        <span className={options.filePathClassName ?? "truncate text-ui-base text-foreground-subtlest"}>{info.filePath}</span>
      ) : null}
    </span>
  );
}

/** 原 Vc（5196）：独立文件图标（失败降级同 Bc） */
export function FileIconImg({ src, size = 16, className }: { src?: string | null; size?: number; className?: string }) {
  const [current, setCurrent] = React.useState(src);
  React.useEffect(() => {
    setCurrent(src);
  }, [src]);
  return (
    <img
      src={current ?? undefined}
      alt=""
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      onError={() => {
        const fallback = current ? fileIconFallbackSrc(current) : null;
        if (fallback) setCurrent(fallback);
      }}
    />
  );
}

/* ============================================================================
 * §C. 纯文本 diff 预览（原 js 23153/23226 + 100417–100519）
 * ==========================================================================*/

/** 原 ahe（23153）：ZCode 截断标记（diff 引擎 X09 的自研扩展行） */
const DIFF_TRUNCATED_MARKER_PATTERN = /^\\ __ZCODE_DIFF_TRUNCATED__:(\d+)$/;

/** 原 dhe（23226）：解析截断标记（非标记/非正数 → null） */
export function parseTruncatedMarker(line: string): number | null {
  const match = DIFF_TRUNCATED_MARKER_PATTERN.exec(line);
  if (!match) return null;
  const count = Number.parseInt(match[1] ?? "", 10);
  return !Number.isFinite(count) || count <= 0 ? null : count;
}

export interface PlainDiffLine {
  content: string;
  kind: "added" | "removed" | "context";
  marker: string;
  raw: string;
}

/** 原 mut（100417）：行前缀解析（+/-/空白/其余 → added/removed/context/context） */
export function parseDiffLine(line: string): PlainDiffLine {
  return line.startsWith("+")
    ? { content: line.slice(1), kind: "added", marker: "+", raw: line }
    : line.startsWith("-")
      ? { content: line.slice(1), kind: "removed", marker: "-", raw: line }
      : line.startsWith(" ")
        ? { content: line.slice(1), kind: "context", marker: " ", raw: line }
        : { content: line, kind: "context", marker: "", raw: line };
}

export interface DiffKindStyle {
  lineNumberClassName: string;
  rowStyle?: React.CSSProperties;
  gutterStyle?: React.CSSProperties;
}

/** 原 hut（100426）：行类型 → 样式（color-mix 背景 + 3px 内嵌色条；上下文仅行号底色） */
export function diffKindStyles(kind: PlainDiffLine["kind"]): DiffKindStyle {
  return kind === "added"
    ? {
        lineNumberClassName: "text-diff-added",
        rowStyle: {
          backgroundColor: "color-mix(in srgb, var(--color-diff-added) 14%, transparent)",
          boxShadow: "inset 3px 0 0 var(--color-diff-added)",
        },
        gutterStyle: {
          backgroundColor: "color-mix(in srgb, var(--color-diff-added) 18%, var(--color-background))",
          boxShadow: "inset 3px 0 0 var(--color-diff-added)",
          color: "var(--color-diff-added)",
        },
      }
    : kind === "removed"
      ? {
          lineNumberClassName: "text-diff-removed",
          rowStyle: {
            backgroundColor: "color-mix(in srgb, var(--color-diff-removed) 14%, transparent)",
            boxShadow: "inset 3px 0 0 var(--color-diff-removed)",
          },
          gutterStyle: {
            backgroundColor: "color-mix(in srgb, var(--color-diff-removed) 18%, var(--color-background))",
            boxShadow: "inset 3px 0 0 var(--color-diff-removed)",
            color: "var(--color-diff-removed)",
          },
        }
      : {
          lineNumberClassName: "text-foreground-subtlest",
          gutterStyle: { backgroundColor: "var(--color-background)" },
        };
}

export interface CodePreviewSettings {
  fontSizePx: number;
  showLineNumbers: boolean;
  wrapLongLines: boolean;
  [key: string]: unknown;
}

/**
 * 原 gut（100459）：纯文本 diff 预览。
 * 粘性行号列（12 宽）+ 截断标记提示（diff.preview.truncatedLines）+ 换行模式切换。
 */
export function PlainTextDiffPreview({
  className,
  codePreviewSettings,
  lines,
  renderLineContent,
  ...rest
}: {
  className?: string;
  codePreviewSettings: CodePreviewSettings;
  lines: string[];
  renderLineContent?: (line: PlainDiffLine, index: number) => React.ReactNode;
} & Record<string, unknown>) {
  const { intl } = useIntlContext();
  return (
    <div className={cn("w-full min-w-0 overflow-auto bg-background", className)} data-lightweight-diff-preview {...rest}>
      <div
        className={cn("min-w-full font-mono leading-relaxed text-foreground", !codePreviewSettings.wrapLongLines && "w-max")}
        data-lightweight-diff-scroll-content
        style={{ fontSize: codePreviewSettings.fontSizePx }}
      >
        {lines.map((line, index) => {
          const truncated = parseTruncatedMarker(line);
          if (truncated !== null) {
            return (
              <div key={index} className="px-3 py-1 text-foreground-subtle">
                {intl.formatMessage({ id: "diff.preview.truncatedLines" }, { count: String(truncated) })}
              </div>
            );
          }
          const parsed = parseDiffLine(line);
          const styles = diffKindStyles(parsed.kind);
          return (
            <div key={index} className="flex min-w-full w-full" style={styles.rowStyle}>
              {codePreviewSettings.showLineNumbers ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    "sticky left-0 z-[1] w-12 shrink-0 select-none border-r border-border px-2 text-right tabular-nums",
                    styles.lineNumberClassName,
                  )}
                  style={styles.gutterStyle}
                >
                  {index + 1}
                </span>
              ) : null}
              <code className={cn("block flex-1 px-3", codePreviewSettings.wrapLongLines ? "whitespace-pre-wrap break-words" : "whitespace-pre")}>
                {renderLineContent?.(parsed, index) ?? (parsed.content || " ")}
              </code>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================================
 * §D. El gutter 交互控制器（原 js 6062–6880 + 助手 5249/5307/5314/6020/6959–7012）
 * ----------------------------------------------------------------------------
 * vendored diff 引擎（X09）的应用侧交互层：
 *  - 悬停：行/词元进入离开 + 行号高亮（lineHoverHighlight: disabled|line|number|both）
 *  - 点击：行/行号/词元/可展开 hunk 分隔/合并冲突动作
 *  - 行选择：锚点/shift 扩展/单行再点取消/文档级 pointer 会话
 *  - gutter 工具位：容器注入行号格（自定义槽 slot 或内置 plus 按钮）
 * ==========================================================================*/

export interface LineSelectionRange {
  start: number;
  end: number;
  side?: string;
  endSide?: string;
}

interface LineSelectionPoint {
  lineNumber: number;
  side?: string;
}

export interface LineEventProps {
  type: "line";
  lineElement: HTMLElement;
  lineNumber: number;
  numberColumn: boolean;
  numberElement: HTMLElement;
}

export interface DiffLineEventProps {
  type: "diff-line";
  annotationSide?: string;
  lineType?: string;
  lineElement: HTMLElement;
  numberElement: HTMLElement;
  lineNumber: number;
  numberColumn: boolean;
}

export interface TokenEventProps {
  type: "token";
  lineCharEnd: number;
  lineCharStart: number;
  lineNumber: number;
  side?: string;
  tokenElement: HTMLElement;
  tokenText: string;
}

export interface HunkExpandEventProps {
  type: "line-info";
  hunkIndex: number;
  direction: "up" | "down" | "both";
  all: boolean;
}

export interface MergeConflictActionProps {
  kind: "merge-conflict-action";
  resolution: "current" | "incoming" | "both";
  conflictIndex: number;
}

type PointerTarget =
  | ({
      kind: "line";
      lineType?: string;
      lineElement: HTMLElement;
      lineNumber: number;
      numberColumn: boolean;
      numberElement: HTMLElement;
      side?: string;
      splitLineIndex?: number;
    } & Partial<TokenTargetFields>)
  | ({
      kind: "token";
      lineType?: string;
      lineElement: HTMLElement;
      lineNumber: number;
      numberColumn: boolean;
      numberElement: HTMLElement;
      side?: string;
      splitLineIndex?: number;
    } & TokenTargetFields)
  | (HunkExpandEventProps & { type: "line-info" })
  | MergeConflictActionProps;

interface TokenTargetFields {
  tokenElement: HTMLElement;
  lineCharStart: number;
  lineCharEnd: number;
  tokenText: string;
}

export interface DiffInteractionOptions {
  lineHoverHighlight?: "disabled" | "line" | "number" | "both";
  enableGutterUtility?: boolean;
  usesCustomGutterUtility?: boolean;
  enableLineSelection?: boolean;
  enableTokenInteractionsOnWhitespace?: boolean;
  getLineIndex?: (lineNumber: number, side?: string) => [number, number] | undefined;
  onLineClick?: (props: LineEventProps | DiffLineEventProps & { event: Event }) => void;
  onLineNumberClick?: (props: (LineEventProps | DiffLineEventProps) & { event: Event }) => void;
  onLineEnter?: (props: (LineEventProps | DiffLineEventProps) & { event: Event }) => void;
  onLineLeave?: (props: (LineEventProps | DiffLineEventProps) & { event: Event }) => void;
  onTokenClick?: (props: TokenEventProps, event: Event) => void;
  onTokenEnter?: (props: TokenEventProps | undefined, event: Event) => void;
  onTokenLeave?: (props: TokenEventProps | undefined, event: Event) => void;
  onHunkExpand?: (hunkIndex: number, direction: "up" | "down" | "both", count?: number) => void;
  onMergeConflictActionClick?: (props: MergeConflictActionProps) => void;
  onGutterUtilityClick?: (range: LineSelectionRange) => void;
  onLineSelected?: (range: LineSelectionRange | null) => void;
  onLineSelectionChange?: (range: LineSelectionRange | null) => void;
  onLineSelectionStart?: (range: LineSelectionRange | null) => void;
  onLineSelectionEnd?: (range: LineSelectionRange | null) => void;
  __debugPointerEvents?: "none" | "both" | "click" | "move";
}

/** 原 nl（5249）：选择范围等价 */
export function isSameSelectionRange(a: LineSelectionRange | null | undefined, b: LineSelectionRange | null | undefined): boolean {
  return a?.start === b?.start && a?.end === b?.end && a?.side === b?.side && a?.endSide === b?.endSide;
}

/** 原 hce（5314）：选择点等价 */
export function isSameSelectionPoint(a: LineSelectionPoint, b: LineSelectionPoint): boolean {
  return a.lineNumber === b.lineNumber && a.side === b.side;
}

/* --- hast 构造（原 rl/il/al/mce，5254–5313） --- */

interface HastText {
  type: "text";
  value: string;
}
interface HastElement {
  type: "element";
  tagName: string;
  properties: Record<string, unknown>;
  children: Array<HastText | HastElement>;
}
type HastNode = HastText | HastElement;

/** 原 rl（5254）：文本节点 */
export function hastText(value: string): HastText {
  return { type: "text", value };
}

/** 原 il（5257）：元素节点 */
export function hastElement({
  tagName,
  children = [],
  properties = {},
}: {
  tagName: string;
  children?: Array<HastText | HastElement>;
  properties?: Record<string, unknown>;
}): HastElement {
  return { type: "element", tagName, properties, children };
}

/** 原 al（5260）：svg use 图标节点（`#name` 引用） */
export function hastIcon({
  name,
  width = 16,
  height = 16,
  properties,
}: {
  name: string;
  width?: number;
  height?: number;
  properties?: Record<string, unknown>;
}): HastElement {
  return hastElement({
    tagName: "svg",
    properties: { width, height, viewBox: "0 0 16 16", ...properties },
    children: [hastElement({ tagName: "use", properties: { href: `#${name.replace(/^#/, "")}` } })],
  });
}

/** 原 mce（5307）：gutter 工具按钮 hast（data-utility-button + plus 图标） */
export function gutterUtilityButtonTree(): HastElement {
  return hastElement({
    tagName: "button",
    properties: { "data-utility-button": "", type: "button" },
    children: [hastIcon({ name: "diffs-icon-plus", properties: { "data-icon": "" } })],
  });
}

/** 原 Tl（6020，vendored hast-util-to-html）：hast → HTML 字符串（接口级） */
declare function serializeHast(tree: HastNode | HastNode[]): string;

/* --- 指针目标类型守卫（原 6959–7012） --- */

/** 原 Ol（6959）：行目标 */
export function isLineTarget(target: PointerTarget | undefined): target is Extract<PointerTarget, { kind: "line" }> {
  return target != null && "kind" in target && target.kind === "line";
}
/** 原 kl（6962）：词元目标（行目标带词元字段） */
export function isTokenTarget(target: PointerTarget | undefined): target is Extract<PointerTarget, { kind: "token" }> {
  return target != null && "kind" in target && target.kind === "token";
}
/** 原 Al（6965）：行或词元 */
export function isLineOrTokenTarget(target: PointerTarget | undefined): boolean {
  return isLineTarget(target) || isTokenTarget(target);
}
/** 原 vle（6968）：hunk 分隔目标 */
export function isHunkExpandTarget(target: PointerTarget): target is HunkExpandEventProps {
  return "type" in target && target.type === "line-info";
}
/** 原 yle（6971）：合并冲突动作目标 */
export function isMergeConflictActionTarget(target: PointerTarget): target is MergeConflictActionProps {
  return "kind" in target && target.kind === "merge-conflict-action";
}
/** 原 ble（6974）：冲突解决值守卫 */
export function isMergeConflictResolution(value: string | undefined): value is "current" | "incoming" | "both" {
  return value === "current" || value === "incoming" || value === "both";
}
/** 原 jl（6977）：子树查询（仅 HTMLElement） */
export function queryHTMLElement(root: HTMLElement | undefined, selector: string): HTMLElement | undefined {
  const found = root?.querySelector(selector);
  return found instanceof HTMLElement ? found : undefined;
}
/** 原 Ml（6981）：行类型 → diff 侧（deletions/additions；缺省看容器 data-deletions） */
export function resolveDiffSide(lineType: string | undefined, codeElement: HTMLElement): "deletions" | "additions" {
  switch (lineType) {
    case "change-deletion":
      return "deletions";
    case "change-addition":
      return "additions";
    default:
      return codeElement.hasAttribute("data-deletions") ? "deletions" : "additions";
  }
}
/** 原 Nl（6991）：行类型属性解析（白名单四值） */
export function parseLineType(element: HTMLElement): string | undefined {
  const value = element.getAttribute("data-line-type");
  if (value != null) {
    switch (value) {
      case "change-deletion":
      case "change-addition":
      case "context":
      case "context-expanded":
        return value;
      default:
        return;
    }
  }
  return undefined;
}
/** 原 Pl（7004）：合成路径中是否含 gutter 工具按钮 */
export function pathContainsUtilityButton(path: EventTarget[]): boolean {
  for (const node of path) {
    if (node instanceof HTMLElement && node.hasAttribute("data-utility-button")) return true;
  }
  return false;
}
/** 原 Fl（7008）：调试打点（按 __debugPointerEvents 过滤） */
export function debugPointerEvents(mode: DiffInteractionOptions["__debugPointerEvents"] = "none", kind: string, ...rest: unknown[]): void {
  switch (mode) {
    case "none":
      return;
    case "both":
      break;
    case "click":
      if (kind !== "click") return;
      break;
    case "move":
      if (kind !== "move") return;
      break;
  }
  console.debug(...rest);
}

type PointerSessionState =
  | { mode: "idle" }
  | { mode: "selecting"; pointerId: number }
  | { mode: "pendingSingleLineUnselect"; pointerId: number; anchor: LineSelectionPoint; pending: LineSelectionPoint }
  | { mode: "gutterSelecting"; pointerId: number; anchor: LineSelectionPoint; current: LineSelectionPoint };

/**
 * 原 El（6062–6880）：DiffInteractionManager。
 * 构造参数：模式 `file`|`diff` + 选项；宿主在渲染后调用 setup(pre)。
 */
export class DiffInteractionManager {
  private mode: "file" | "diff";
  private options: DiffInteractionOptions;
  private hoveredLine: LineEventProps | DiffLineEventProps | undefined;
  private hoveredToken: TokenEventProps | undefined;
  private pre: HTMLElement | undefined;
  private gutterUtilityContainer: HTMLElement | undefined;
  private gutterUtilityButton: HTMLButtonElement | undefined;
  private gutterUtilitySlot: HTMLSlotElement | undefined;
  private interactiveLinesAttr = false;
  private interactiveLineNumbersAttr = false;
  private hasPointerListeners = false;
  private hasDocumentPointerListeners = false;
  private selectedRange: LineSelectionRange | null = null;
  private renderedSelectionRange: LineSelectionRange | null | undefined;
  private selectionAnchor: LineSelectionPoint | undefined;
  private queuedSelectionRender: number | undefined;
  private pointerSession: PointerSessionState = { mode: "idle" };

  constructor(mode: "file" | "diff", options: DiffInteractionOptions) {
    this.mode = mode;
    this.options = options;
  }

  setOptions(options: DiffInteractionOptions): void {
    this.options = options;
  }

  cleanUp(): void {
    this.pre?.removeEventListener("click", this.handlePointerClick);
    this.pre?.removeEventListener("pointerdown", this.handlePointerDown);
    this.pre?.removeEventListener("pointermove", this.handlePointerMove);
    this.pre?.removeEventListener("pointerleave", this.handlePointerLeave);
    this.pre?.removeAttribute("data-interactive-lines");
    this.pre?.removeAttribute("data-interactive-line-numbers");
    this.pre = undefined;
    this.gutterUtilityContainer?.remove();
    this.gutterUtilityContainer = undefined;
    this.gutterUtilityButton = undefined;
    this.gutterUtilitySlot = undefined;
    this.clearHoveredLine();
    this.clearHoveredToken();
    this.detachDocumentPointerListeners();
    this.clearPointerSession();
    if (this.queuedSelectionRender != null) {
      cancelAnimationFrame(this.queuedSelectionRender);
      this.queuedSelectionRender = undefined;
    }
    this.interactiveLinesAttr = false;
    this.interactiveLineNumbersAttr = false;
    this.hasPointerListeners = false;
  }

  setup(pre: HTMLElement): void {
    this.setSelectionDirty();
    const { usesCustomGutterUtility = false, enableGutterUtility = false } = this.options;
    if (this.pre !== pre) {
      this.cleanUp();
      this.pre = pre;
    }
    if (enableGutterUtility) {
      this.ensureGutterUtilityNode(usesCustomGutterUtility);
    } else if (this.gutterUtilityContainer != null) {
      this.gutterUtilityContainer.remove();
      this.gutterUtilityContainer = undefined;
      this.gutterUtilityButton = undefined;
      this.gutterUtilitySlot = undefined;
      if (this.pointerSession.mode === "gutterSelecting") {
        this.clearPointerSession();
        this.detachDocumentPointerListeners();
      }
    }
    this.syncPointerListeners(pre);
    this.updateInteractiveLineAttributes();
    this.renderSelection();
  }

  setSelectionDirty(): void {
    this.renderedSelectionRange = undefined;
  }

  isSelectionDirty(): boolean {
    return this.renderedSelectionRange === null;
  }

  setSelection(range: LineSelectionRange | null): void {
    const changed = !(range === this.selectedRange || isSameSelectionRange(range ?? undefined, this.selectedRange ?? undefined));
    if (!this.isSelectionDirty() && !changed) return;
    this.selectedRange = range;
    this.renderSelection();
    if (changed) this.notifySelectionCommitted();
  }

  getSelection(): LineSelectionRange | null {
    return this.selectedRange;
  }

  getHoveredLine = (): { lineNumber: number; side?: string } | undefined => {
    if (this.hoveredLine != null) {
      if (this.mode === "diff" && this.hoveredLine.type === "diff-line")
        return { lineNumber: this.hoveredLine.lineNumber as number, side: this.hoveredLine.annotationSide };
      if (this.mode === "file" && this.hoveredLine.type === "line") return { lineNumber: this.hoveredLine.lineNumber as number };
    }
    return undefined;
  };

  handlePointerClick = (event: Event): void => {
    const { onHunkExpand, onLineClick, onLineNumberClick, onTokenClick, onMergeConflictActionClick } = this.options;
    if (onHunkExpand == null && onLineClick == null && onLineNumberClick == null && onMergeConflictActionClick == null && onTokenClick == null) return;
    if (this.options.onGutterUtilityClick != null && pathContainsUtilityButton(event.composedPath())) return;
    debugPointerEvents(this.options.__debugPointerEvents, "click", "FileDiff.DEBUG.handlePointerClick:", event);
    this.handlePointerEvent({ eventType: "click", event });
  };

  handlePointerMove = (event: Event): void => {
    const {
      lineHoverHighlight = "disabled",
      onLineEnter,
      onLineLeave,
      onTokenEnter,
      onTokenLeave,
      enableGutterUtility = false,
    } = this.options;
    if (lineHoverHighlight === "disabled" && !enableGutterUtility && onLineEnter == null && onLineLeave == null && onTokenEnter == null && onTokenLeave == null)
      return;
    debugPointerEvents(this.options.__debugPointerEvents, "move", "FileDiff.DEBUG.handlePointerMove:", event);
    this.handlePointerEvent({ eventType: "move", event });
  };

  handlePointerLeave = (event: Event): void => {
    const { __debugPointerEvents } = this.options;
    debugPointerEvents(__debugPointerEvents, "move", "FileDiff.DEBUG.handlePointerLeave: no event");
    if (this.hoveredLine == null && this.hoveredToken == null) {
      debugPointerEvents(__debugPointerEvents, "move", "FileDiff.DEBUG.handlePointerLeave: returned early, no hovered line or token");
      return;
    }
    this.gutterUtilityContainer?.remove();
    if (this.hoveredToken != null) {
      this.options.onTokenLeave?.(this.hoveredToken, event);
      this.clearHoveredToken();
    }
    if (this.hoveredLine != null) {
      this.options.onLineLeave?.({ ...this.hoveredLine, event });
      this.clearHoveredLine();
    }
  };

  handlePointerEvent({ eventType, event }: { eventType: "click" | "move"; event: Event }): void {
    const { __debugPointerEvents } = this.options;
    const path = event.composedPath();
    debugPointerEvents(__debugPointerEvents, eventType, "FileDiff.DEBUG.handlePointerEvent:", { eventType, composedPath: path });
    const target = this.resolvePointerTarget(path);
    debugPointerEvents(__debugPointerEvents, eventType, "FileDiff.DEBUG.handlePointerEvent: resolvePointerTarget result:", target);
    const { onLineClick, onLineNumberClick, onLineEnter, onLineLeave, onTokenClick, onTokenEnter, onTokenLeave, onHunkExpand, onMergeConflictActionClick } =
      this.options;
    switch (eventType) {
      case "move": {
        const sameLine = isLineTarget(target) && this.hoveredLine?.lineElement === target.lineElement;
        if (!isTokenTarget(target) || this.hoveredToken?.tokenElement !== (target as TokenTargetFields).tokenElement) {
          if (this.hoveredToken != null) {
            onTokenLeave?.(this.hoveredToken, event);
            this.clearHoveredToken();
          }
          if (isTokenTarget(target)) {
            this.setHoveredToken(this.toTokenEventBaseProps(target));
            onTokenEnter?.(this.hoveredToken, event);
          }
        }
        if (!sameLine) {
          if (this.hoveredLine != null) {
            this.gutterUtilityContainer?.remove();
            onLineLeave?.({ ...this.hoveredLine, event });
            this.clearHoveredLine();
          }
          if (isLineTarget(target)) {
            this.setHoveredLine(this.toEventBaseProps(target));
            if (this.gutterUtilityContainer != null) {
              (target.numberElement as HTMLElement).appendChild(this.gutterUtilityContainer);
            }
            onLineEnter?.({ ...(this.hoveredLine as LineEventProps | DiffLineEventProps), event });
          }
        }
        break;
      }
      case "click": {
        if (target == null) break;
        if (isMergeConflictActionTarget(target) && onMergeConflictActionClick != null) {
          onMergeConflictActionClick(target);
          break;
        }
        if (isHunkExpandTarget(target) && onHunkExpand != null) {
          onHunkExpand(target.hunkIndex, target.all || (event as MouseEvent).shiftKey ? "both" : target.direction, target.all || (event as MouseEvent).shiftKey ? Infinity : undefined);
          break;
        }
        if (!isLineTarget(target)) break;
        if (isTokenTarget(target) && onTokenClick != null) onTokenClick(this.toTokenEventBaseProps(target), event);
        const base = this.toEventBaseProps(target);
        if (onLineNumberClick != null && target.numberColumn) onLineNumberClick({ ...base, event });
        else onLineClick?.({ ...base, event } as LineEventProps & { event: Event });
        break;
      }
    }
  }

  syncPointerListeners(pre: HTMLElement): void {
    const {
      __debugPointerEvents,
      lineHoverHighlight = "disabled",
      onLineClick,
      onLineNumberClick,
      onLineEnter,
      onLineLeave,
      onTokenClick,
      onTokenEnter,
      onTokenLeave,
      onHunkExpand,
      onMergeConflictActionClick,
      enableGutterUtility = false,
      enableLineSelection = false,
      onGutterUtilityClick,
    } = this.options;
    const hasGutterUtilityHandler = onGutterUtilityClick != null;
    const needed =
      lineHoverHighlight !== "disabled" ||
      onLineClick != null ||
      onLineNumberClick != null ||
      onLineEnter != null ||
      onLineLeave != null ||
      onTokenClick != null ||
      onTokenEnter != null ||
      onTokenLeave != null ||
      onHunkExpand != null ||
      onMergeConflictActionClick != null ||
      enableGutterUtility ||
      enableLineSelection ||
      hasGutterUtilityHandler;
    if (needed && !this.hasPointerListeners) {
      pre.addEventListener("click", this.handlePointerClick);
      pre.addEventListener("pointerdown", this.handlePointerDown);
      pre.addEventListener("pointermove", this.handlePointerMove);
      pre.addEventListener("pointerleave", this.handlePointerLeave);
      this.hasPointerListeners = true;
      debugPointerEvents(
        __debugPointerEvents,
        "click",
        "FileDiff.DEBUG.attachEventListeners: Attaching click events for:",
        (() => {
          const items: string[] = [];
          if (__debugPointerEvents === "both" || __debugPointerEvents === "click") {
            if (onLineClick != null) items.push("onLineClick");
            if (onLineNumberClick != null) items.push("onLineNumberClick");
            if (onHunkExpand != null) items.push("expandable hunk separators");
            if (onMergeConflictActionClick != null) items.push("merge conflict actions");
          }
          return items;
        })(),
      );
      debugPointerEvents(__debugPointerEvents, "move", "FileDiff.DEBUG.attachEventListeners: Attaching pointer move event");
      debugPointerEvents(__debugPointerEvents, "move", "FileDiff.DEBUG.attachEventListeners: Attaching pointer leave event");
    } else if (!needed && this.hasPointerListeners) {
      pre.removeEventListener("click", this.handlePointerClick);
      pre.removeEventListener("pointerdown", this.handlePointerDown);
      pre.removeEventListener("pointermove", this.handlePointerMove);
      pre.removeEventListener("pointerleave", this.handlePointerLeave);
      this.hasPointerListeners = false;
    }
    const lineSessionActive = this.pointerSession.mode === "selecting" || this.pointerSession.mode === "pendingSingleLineUnselect";
    const gutterSessionActive = this.pointerSession.mode === "gutterSelecting";
    if ((!enableLineSelection && lineSessionActive) || (!hasGutterUtilityHandler && gutterSessionActive)) {
      this.clearPointerSession();
      this.detachDocumentPointerListeners();
      this.selectionAnchor = undefined;
      this.clearPendingSingleLineState();
    }
  }

  updateInteractiveLineAttributes(): void {
    if (this.pre == null) return;
    const { onLineClick, onLineNumberClick, enableLineSelection = false } = this.options;
    const linesInteractive = onLineClick != null;
    const numbersInteractive = onLineNumberClick != null || enableLineSelection;
    if (linesInteractive && !this.interactiveLinesAttr) {
      this.pre.setAttribute("data-interactive-lines", "");
      this.interactiveLinesAttr = true;
    } else if (!linesInteractive && this.interactiveLinesAttr) {
      this.pre.removeAttribute("data-interactive-lines");
      this.interactiveLinesAttr = false;
    }
    if (numbersInteractive && !this.interactiveLineNumbersAttr) {
      this.pre.setAttribute("data-interactive-line-numbers", "");
      this.interactiveLineNumbersAttr = true;
    } else if (!numbersInteractive && this.interactiveLineNumbersAttr) {
      this.pre.removeAttribute("data-interactive-line-numbers");
      this.interactiveLineNumbersAttr = false;
    }
  }

  handlePointerDown = (event: PointerEvent): void => {
    if ((event.pointerType === "mouse" && event.button !== 0) || this.pre == null || this.pointerSession.mode !== "idle") return;
    const path = event.composedPath();
    if (pathContainsUtilityButton(path) && this.options.onGutterUtilityClick != null) {
      this.startGutterSelectionFromPointerDown(event, path);
    } else {
      this.startLineSelectionFromPointerDown(event, path);
    }
  };

  startLineSelectionFromPointerDown(event: PointerEvent, path: EventTarget[]): void {
    const { enableLineSelection = false } = this.options;
    if (!enableLineSelection) return;
    const info = this.getSelectionPointerInfo(path, true);
    if (info == null) return;
    const { pre } = this;
    if (pre == null) return;
    event.preventDefault();
    const { lineNumber, eventSide, lineIndex } = info;
    if (event.shiftKey && this.selectedRange != null) {
      const indexes = this.getIndexesFromSelection(this.selectedRange, pre.getAttribute("data-diff-type") === "split");
      if (indexes == null) return;
      const within = indexes.start <= indexes.end ? lineIndex >= indexes.start : lineIndex <= indexes.end;
      this.selectionAnchor = {
        lineNumber: within ? this.selectedRange.start : this.selectedRange.end,
        side: within ? this.selectedRange.side : this.selectedRange.endSide ?? this.selectedRange.side,
      };
      this.updateSelection(lineNumber, eventSide, false);
      this.notifySelectionStart(this.selectedRange);
      this.pointerSession = { mode: "selecting", pointerId: event.pointerId };
      this.attachDocumentPointerListeners();
      return;
    }
    if (this.selectedRange?.start === lineNumber && this.selectedRange?.end === lineNumber) {
      const anchor = { lineNumber, side: eventSide };
      this.selectionAnchor = anchor;
      this.pointerSession = { mode: "pendingSingleLineUnselect", pointerId: event.pointerId, anchor, pending: anchor };
      this.attachDocumentPointerListeners();
      return;
    }
    this.selectedRange = null;
    this.selectionAnchor = { lineNumber, side: eventSide };
    this.updateSelection(lineNumber, eventSide, false);
    this.notifySelectionStart(this.selectedRange);
    this.pointerSession = { mode: "selecting", pointerId: event.pointerId };
    this.attachDocumentPointerListeners();
  }

  startGutterSelectionFromPointerDown(event: PointerEvent, path: EventTarget[]): void {
    const { enableLineSelection = false, onGutterUtilityClick } = this.options;
    if (onGutterUtilityClick == null) return;
    const point = this.getSelectionPointFromPath(path);
    if (point == null) return;
    event.preventDefault();
    event.stopPropagation();
    this.pointerSession = { mode: "gutterSelecting", pointerId: event.pointerId, anchor: point, current: point };
    if (enableLineSelection) {
      this.selectionAnchor = { lineNumber: point.lineNumber, side: point.side };
      this.updateSelection(point.lineNumber, point.side, false);
      this.notifySelectionStart(this.selectedRange);
    }
    this.attachDocumentPointerListeners();
  }

  handleDocumentPointerMove = (event: PointerEvent): void => {
    const { enableLineSelection = false } = this.options;
    switch (this.pointerSession.mode) {
      case "idle":
        return;
      case "gutterSelecting": {
        if (event.pointerId !== this.pointerSession.pointerId) return;
        const point = this.getSelectionPointFromPath(event.composedPath());
        if (point == null) return;
        this.pointerSession.current = point;
        if (enableLineSelection === true) this.updateSelection(point.lineNumber, point.side);
        return;
      }
      case "selecting": {
        if (event.pointerId !== this.pointerSession.pointerId) return;
        const info = this.getSelectionPointerInfo(event.composedPath(), false);
        if (info == null || this.selectionAnchor == null) return;
        this.updateSelection(info.lineNumber, info.eventSide);
        return;
      }
      case "pendingSingleLineUnselect": {
        if (event.pointerId !== this.pointerSession.pointerId) return;
        const info = this.getSelectionPointerInfo(event.composedPath(), false);
        if (info == null || this.selectionAnchor == null) return;
        const point = { lineNumber: info.lineNumber, side: info.eventSide };
        if (isSameSelectionPoint(this.pointerSession.pending, point)) return;
        this.updateSelection(info.lineNumber, info.eventSide, false);
        this.notifySelectionStart(this.selectedRange);
        this.notifySelectionChangeDelta();
        this.pointerSession = { mode: "selecting", pointerId: event.pointerId };
        return;
      }
    }
  };

  handleDocumentPointerUp = (event: PointerEvent): void => {
    const { enableLineSelection = false, onGutterUtilityClick } = this.options;
    switch (this.pointerSession.mode) {
      case "idle":
        return;
      case "gutterSelecting": {
        if (event.pointerId !== this.pointerSession.pointerId) return;
        const point = this.getSelectionPointFromPath(event.composedPath());
        if (point != null) {
          this.pointerSession.current = point;
          if (enableLineSelection) this.updateSelection(point.lineNumber, point.side);
        }
        onGutterUtilityClick?.(this.buildSelectedLineRange(this.pointerSession.anchor, this.pointerSession.current));
        this.selectionAnchor = undefined;
        if (enableLineSelection) {
          this.notifySelectionEnd(this.selectedRange);
          this.notifySelectionCommitted();
        }
        this.clearPointerSession();
        this.detachDocumentPointerListeners();
        return;
      }
      case "pendingSingleLineUnselect": {
        if (event.pointerId !== this.pointerSession.pointerId) return;
        this.updateSelection(null, undefined, false);
        this.selectionAnchor = undefined;
        this.clearPendingSingleLineState();
        this.detachDocumentPointerListeners();
        this.notifySelectionEnd(this.selectedRange);
        this.notifySelectionCommitted();
        return;
      }
      case "selecting": {
        if (event.pointerId !== this.pointerSession.pointerId) return;
        this.selectionAnchor = undefined;
        this.detachDocumentPointerListeners();
        this.clearPointerSession();
        this.notifySelectionEnd(this.selectedRange);
        this.notifySelectionCommitted();
        return;
      }
    }
  };

  handleDocumentPointerCancel = (event: PointerEvent): void => {
    switch (this.pointerSession.mode) {
      case "idle":
        return;
      case "gutterSelecting":
      case "selecting":
      case "pendingSingleLineUnselect":
        if ("pointerId" in this.pointerSession && event.pointerId !== this.pointerSession.pointerId) return;
        this.selectionAnchor = undefined;
        this.clearPendingSingleLineState();
        this.clearPointerSession();
        this.detachDocumentPointerListeners();
        return;
    }
  };

  clearHoveredLine(): void {
    if (this.hoveredLine != null) {
      this.hoveredLine.lineElement?.removeAttribute("data-hovered");
      this.hoveredLine.numberElement?.removeAttribute("data-hovered");
      this.hoveredLine = undefined;
    }
  }

  setHoveredLine(props: LineEventProps | DiffLineEventProps): void {
    const { lineHoverHighlight = "disabled" } = this.options;
    if (this.hoveredLine != null) this.clearHoveredLine();
    this.hoveredLine = props;
    if (lineHoverHighlight !== "disabled") {
      if ((lineHoverHighlight === "both" || lineHoverHighlight === "line") && this.hoveredLine.lineElement)
        this.hoveredLine.lineElement.setAttribute("data-hovered", "");
      if ((lineHoverHighlight === "both" || lineHoverHighlight === "number") && this.hoveredLine.numberElement)
        this.hoveredLine.numberElement.setAttribute("data-hovered", "");
    }
  }

  clearHoveredToken(): void {
    if (this.hoveredToken != null) this.hoveredToken = undefined;
  }

  setHoveredToken(props: TokenEventProps): void {
    if (this.hoveredToken != null) this.clearHoveredToken();
    this.hoveredToken = props;
  }

  ensureGutterUtilityNode(useCustomSlot: boolean): void {
    if (!this.gutterUtilityContainer) {
      this.gutterUtilityContainer = document.createElement("div");
      this.gutterUtilityContainer.setAttribute("data-gutter-utility-slot", "");
    }
    if (useCustomSlot) {
      if (this.gutterUtilityButton != null) {
        this.gutterUtilityButton.remove();
        this.gutterUtilityButton = undefined;
      }
      if (!this.gutterUtilitySlot) {
        this.gutterUtilitySlot = document.createElement("slot");
        this.gutterUtilitySlot.name = "gutter-utility-slot";
      }
      if (this.gutterUtilitySlot.parentNode !== this.gutterUtilityContainer)
        this.gutterUtilityContainer.replaceChildren(this.gutterUtilitySlot);
    } else {
      this.gutterUtilitySlot?.remove();
      this.gutterUtilitySlot = undefined;
      if (this.gutterUtilityButton == null) {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = serializeHast(gutterUtilityButtonTree());
        const button = wrapper.firstElementChild;
        if (!(button instanceof HTMLButtonElement))
          throw new Error("InteractionManager.ensureGutterUtilityNode: Node element should be a button");
        button.remove();
        this.gutterUtilityButton = button;
      }
      if (this.gutterUtilityButton.parentNode !== this.gutterUtilityContainer)
        this.gutterUtilityContainer.replaceChildren(this.gutterUtilityButton);
    }
  }

  attachDocumentPointerListeners(): void {
    this.hasDocumentPointerListeners ||=
      (document.addEventListener("pointermove", this.handleDocumentPointerMove),
      document.addEventListener("pointerup", this.handleDocumentPointerUp),
      document.addEventListener("pointercancel", this.handleDocumentPointerCancel),
      true);
  }

  detachDocumentPointerListeners(): void {
    this.hasDocumentPointerListeners &&=
      (document.removeEventListener("pointermove", this.handleDocumentPointerMove),
      document.removeEventListener("pointerup", this.handleDocumentPointerUp),
      document.removeEventListener("pointercancel", this.handleDocumentPointerCancel),
      false);
  }

  clearPointerSession(): void {
    this.pointerSession = { mode: "idle" };
  }

  clearPendingSingleLineState(): void {
    if (this.pointerSession.mode === "pendingSingleLineUnselect") this.pointerSession = { mode: "idle" };
  }

  getSelectionPointerInfo(path: EventTarget[], requireNumberColumn: boolean): { lineIndex: number; lineNumber: number; eventSide?: string } | undefined {
    const target = this.resolvePointerTarget(path);
    if (isLineTarget(target) && !(requireNumberColumn && !target.numberColumn) && target.splitLineIndex != null) {
      return {
        lineIndex: target.splitLineIndex,
        lineNumber: target.lineNumber,
        eventSide: this.mode === "diff" ? target.side : undefined,
      };
    }
    return undefined;
  }

  getSelectionPointFromPath(path: EventTarget[]): LineSelectionPoint | undefined {
    const target = this.resolvePointerTarget(path);
    if (isLineTarget(target)) return { lineNumber: target.lineNumber, side: this.mode === "diff" ? target.side : undefined };
    return undefined;
  }

  getLineIndex(lineNumber: number, side?: string): [number, number] | undefined {
    const { getLineIndex } = this.options;
    return getLineIndex == null ? [lineNumber - 1, lineNumber - 1] : getLineIndex(lineNumber, side);
  }

  updateSelection(lineNumber: number | null, side: string | undefined, notifyDelta = true): void {
    const previous = this.selectedRange;
    let next: LineSelectionRange | null;
    if (lineNumber == null) {
      next = null;
    } else {
      const anchorSide = this.selectionAnchor?.side ?? side;
      const anchorLine = this.selectionAnchor?.lineNumber ?? lineNumber;
      next = this.buildSelectionRange(anchorLine, lineNumber, anchorSide, side);
    }
    if (isSameSelectionRange(previous ?? undefined, next ?? undefined)) return;
    this.selectedRange = next;
    if (notifyDelta) this.notifySelectionChangeDelta();
    this.queuedSelectionRender ??= requestAnimationFrame(this.renderSelection);
  }

  getIndexesFromSelection(range: LineSelectionRange, split: boolean): { start: number; end: number } | undefined {
    if (this.pre == null) return undefined;
    const startIndexes = this.getLineIndex(range.start, range.side);
    const endIndexes = this.getLineIndex(range.end, range.endSide ?? range.side);
    return startIndexes != null && endIndexes != null
      ? { start: split ? startIndexes[1] : startIndexes[0], end: split ? endIndexes[1] : endIndexes[0] }
      : undefined;
  }

  renderSelection = (): void => {
    if (this.queuedSelectionRender != null) {
      cancelAnimationFrame(this.queuedSelectionRender);
      this.queuedSelectionRender = undefined;
    }
    if (this.pre == null || this.renderedSelectionRange === this.selectedRange) return;
    const marked = this.pre.querySelectorAll("[data-selected-line]");
    for (const node of marked) node.removeAttribute("data-selected-line");
    this.renderedSelectionRange = this.selectedRange;
    if (this.selectedRange == null) return;
    const { children } = this.pre;
    if (children.length === 0) return;
    if (children.length > 2) {
      console.error(children);
      throw new Error("InteractionManager.renderSelection: Somehow there are more than 2 code elements...");
    }
    const split = this.pre.getAttribute("data-diff-type") === "split";
    const indexes = this.getIndexesFromSelection(this.selectedRange, split);
    if (indexes == null) {
      console.error({ rowRange: indexes, selectedRange: this.selectedRange });
      throw new Error("InteractionManager.renderSelection: No valid rowRange");
    }
    const single = indexes.start === indexes.end;
    const max = Math.max(indexes.start, indexes.end);
    for (const codeElement of children) {
      const [gutter, content] = codeElement.children as unknown as [HTMLElement, HTMLElement];
      const rowCount = content.children.length;
      if (rowCount !== gutter.children.length)
        throw new Error("InteractionManager.renderSelection: gutter and content children dont match, something is wrong");
      for (let index = 0; index < rowCount; index++) {
        const contentRow = content.children[index];
        const gutterRow = gutter.children[index];
        if (!(contentRow instanceof HTMLElement) || !(gutterRow instanceof HTMLElement)) continue;
        const lineIndex = this.parseLineIndex(contentRow, split);
        if ((lineIndex ?? 0) > max) break;
        if (lineIndex == null || lineIndex < indexes.start) continue;
        let marker = single ? "single" : lineIndex === indexes.start ? "first" : lineIndex === max ? "last" : "";
        contentRow.setAttribute("data-selected-line", marker);
        gutterRow.setAttribute("data-selected-line", marker);
        if (
          contentRow.nextSibling instanceof HTMLElement &&
          gutterRow.nextSibling instanceof HTMLElement &&
          (gutterRow.nextSibling.hasAttribute("data-line-annotation") || gutterRow.nextSibling.hasAttribute("data-merge-conflict-actions"))
        ) {
          if (single) {
            marker = "last";
            gutterRow.setAttribute("data-selected-line", "first");
          } else if (lineIndex === indexes.start) {
            marker = "";
          } else if (lineIndex === max) {
            gutterRow.setAttribute("data-selected-line", "");
          }
          gutterRow.nextSibling.setAttribute("data-selected-line", marker);
          contentRow.nextSibling.setAttribute("data-selected-line", marker);
        }
      }
    }
  };

  notifySelectionCommitted(): void {
    this.options.onLineSelected?.(this.selectedRange ?? null);
  }

  notifySelectionChangeDelta(): void {
    this.options.onLineSelectionChange?.(this.selectedRange ?? null);
  }

  notifySelectionStart(range: LineSelectionRange | null): void {
    this.options.onLineSelectionStart?.(range);
  }

  notifySelectionEnd(range: LineSelectionRange | null): void {
    this.options.onLineSelectionEnd?.(range);
  }

  toEventBaseProps(target: Extract<PointerTarget, { kind: "line" }>): LineEventProps | DiffLineEventProps {
    return this.mode === "file"
      ? {
          type: "line",
          lineElement: target.lineElement,
          lineNumber: target.lineNumber,
          numberColumn: target.numberColumn,
          numberElement: target.numberElement,
        }
      : {
          type: "diff-line",
          annotationSide: target.side,
          lineType: target.lineType,
          lineElement: target.lineElement,
          numberElement: target.numberElement,
          lineNumber: target.lineNumber,
          numberColumn: target.numberColumn,
        };
  }

  toTokenEventBaseProps(target: Extract<PointerTarget, { kind: "token" }>): TokenEventProps {
    const { lineCharEnd, lineCharStart, lineNumber, side, tokenElement, tokenText } = target;
    return this.mode === "file"
      ? { type: "token", lineCharEnd, lineCharStart, lineNumber, tokenElement, tokenText }
      : { type: "token", lineCharEnd, lineCharStart, lineNumber, side, tokenElement, tokenText };
  }

  buildSelectedLineRange(anchor: LineSelectionPoint, current: LineSelectionPoint): LineSelectionRange {
    return this.buildSelectionRange(anchor.lineNumber, current.lineNumber, anchor.side, current.side);
  }

  buildSelectionRange(start: number, end: number, side?: string, endSide?: string): LineSelectionRange {
    return {
      start,
      end,
      ...(side == null ? {} : { side }),
      ...(side !== endSide && endSide != null ? { endSide } : {}),
    };
  }

  resolvePointerTarget(path: EventTarget[]): PointerTarget | undefined {
    let numberColumn = false;
    let codeElement: HTMLElement | undefined;
    let lineElement: HTMLElement | undefined;
    let numberElement: HTMLElement | undefined;
    let lineType: string | undefined;
    let lineNumber: number | undefined;
    let tokenElement: HTMLElement | undefined;
    let tokenFields: TokenTargetFields | undefined;
    let lineIndexAttr: string | undefined;
    let hunk: { hunkIndex: number | undefined; direction: "up" | "down" | "both"; all: boolean } | undefined;
    let conflict: MergeConflictActionProps | undefined;
    for (const node of path) {
      if (!(node instanceof HTMLElement)) continue;
      if (conflict == null && node.hasAttribute("data-merge-conflict-action")) {
        const resolution = node.getAttribute("data-merge-conflict-action") ?? undefined;
        const conflictIndexAttr = node.getAttribute("data-merge-conflict-conflict-index") ?? undefined;
        const conflictIndex = conflictIndexAttr == null ? NaN : Number.parseInt(conflictIndexAttr, 10);
        if (isMergeConflictResolution(resolution) && Number.isFinite(conflictIndex)) {
          conflict = { kind: "merge-conflict-action", resolution, conflictIndex };
        }
      }
      if (tokenElement == null && node.hasAttribute("data-char")) {
        tokenElement = node;
        const charAttr = node.getAttribute("data-char");
        if (charAttr != null) {
          const start = Number.parseInt(charAttr, 10);
          if (!Number.isNaN(start)) {
            const text = node.textContent ?? "";
            const end = start + text.length;
            if (text.trim() !== "" || this.options.enableTokenInteractionsOnWhitespace === true) {
              tokenFields = { tokenElement, lineCharStart: start, lineCharEnd: end, tokenText: text };
              continue;
            }
          }
        }
      }
      const columnAttr = numberElement == null ? node.getAttribute("data-column-number") ?? undefined : undefined;
      if (columnAttr != null) {
        numberElement = node;
        lineNumber = Number.parseInt(columnAttr, 10);
        numberColumn = true;
        lineType = parseLineType(node);
        lineIndexAttr = node.getAttribute("data-line-index") ?? undefined;
        continue;
      }
      const lineAttr = lineElement == null ? node.getAttribute("data-line") ?? undefined : undefined;
      if (lineAttr != null) {
        lineElement = node;
        lineNumber = Number.parseInt(lineAttr, 10);
        lineType = parseLineType(node);
        lineIndexAttr = node.getAttribute("data-line-index") ?? undefined;
        continue;
      }
      if (hunk == null && (node.hasAttribute("data-expand-button") || node.hasAttribute("data-unmodified-lines"))) {
        hunk = {
          hunkIndex: undefined,
          direction: node.hasAttribute("data-expand-up") ? "up" : node.hasAttribute("data-expand-down") ? "down" : "both",
          all: node.hasAttribute("data-expand-all-button"),
        };
        continue;
      }
      const hunkIndexAttr = hunk == null ? undefined : node.getAttribute("data-expand-index") ?? undefined;
      if (hunk != null && hunkIndexAttr != null) {
        const parsed = Number.parseInt(hunkIndexAttr, 10);
        if (!Number.isNaN(parsed)) hunk.hunkIndex = parsed;
        continue;
      }
      if (codeElement == null && node.hasAttribute("data-code")) {
        codeElement = node;
        break;
      }
    }
    if (conflict != null) return conflict;
    if (hunk?.hunkIndex != null) return { type: "line-info", hunkIndex: hunk.hunkIndex, direction: hunk.direction, all: hunk.all };
    lineElement ??= lineIndexAttr == null ? undefined : queryHTMLElement(codeElement, `[data-line][data-line-index="${lineIndexAttr}"]`);
    numberElement ??= lineIndexAttr == null ? undefined : queryHTMLElement(codeElement, `[data-column-number][data-line-index="${lineIndexAttr}"]`);
    if (codeElement == null || lineElement == null || numberElement == null || lineType == null || lineNumber == null || Number.isNaN(lineNumber))
      return undefined;
    const splitLineIndex = this.parseLineIndex(lineElement, this.isSplitDiff());
    if (tokenFields == null) {
      return this.mode === "file"
        ? {
            kind: "line",
            lineType,
            lineElement,
            lineNumber,
            numberColumn,
            numberElement,
            side: undefined,
            splitLineIndex,
          }
        : {
            kind: "line",
            lineType,
            lineElement,
            lineNumber,
            numberColumn,
            numberElement,
            side: resolveDiffSide(lineType, codeElement),
            splitLineIndex,
          };
    }
    return this.mode === "file"
      ? {
          kind: "token",
          lineType,
          lineElement,
          lineNumber,
          numberColumn,
          numberElement,
          side: undefined,
          splitLineIndex,
          ...tokenFields,
        }
      : {
          kind: "token",
          lineType,
          lineElement,
          lineNumber,
          numberColumn,
          numberElement,
          side: resolveDiffSide(lineType, codeElement),
          splitLineIndex,
          ...tokenFields,
        };
  }

  isSplitDiff(): boolean {
    return this.pre?.getAttribute("data-diff-type") === "split";
  }

  parseLineIndex(element: HTMLElement, split: boolean): number | undefined {
    const indexes = (element.getAttribute("data-line-index") ?? "")
      .split(",")
      .map((part) => Number.parseInt(part, 10))
      .filter((value) => !Number.isNaN(value));
    if (split && indexes.length === 2) return indexes[1];
    if (!split) return indexes[0];
    return undefined;
  }
}

/* 文件尾：§E 边界裁决（R7/v$t/I2t/W8 不重复抽取）见头部映射表与合并报告 §4。 */
