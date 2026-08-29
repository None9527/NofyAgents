// A0-S4-4a: 自 modules/ModalsLeaves.tsx §B 文件路径内联组件 原样迁入（组件单元；原文件现为薄 re-export shim）。
// 迁出体 = 原文件 §0 局部声明/助手（DEFAULT_FILE_ICON_NAME、resolveFileIconName、normalizePathSeparators、stripTrailingSlashes、pathBasename）+ §B 全段（191–338）。
import * as React from "react";

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

