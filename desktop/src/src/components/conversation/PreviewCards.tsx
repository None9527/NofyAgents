// A0-S4-4b: 自 modules/ConversationLeaves.tsx §3 预览卡单项 原样迁入（组件单元；原文件现为薄 re-export shim）。
// 迁出体 = §3 全段（2651–2931）+ §0 声明群分配本族子集（useWorkspaceScopedServices/FileServiceLike；FileIcon/resolveFileIconMeta 复制件）。
// 导入路径按 components/conversation/ 深度改指 ../../modules/。
/* eslint-disable */
import * as React from "react";
import { Globe as IconGlobe, File as IconFile } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0
import { FileOpenWithMenu } from '../../modules/FileRewindDialogDeep'; // 原 v_t（A0-CLEANUP2 item 45 接线：declare → 属主导出）
import { joinWorkspacePath, type FileLinkModel } from '../../modules/MarkdownIntegration';
import { useZCodeIntl as useIntlContext } from '../../modules/I18n'; // 原 G（A0-D 接线：declare → I18n canonical）
import type { OpenCodeViewerFn } from '../../modules/ConversationLeaves'; // 会话流共享类型 canonical（A0-D 类型收敛）

/** 文件图标/路径助手（原 Vc/zc/Hc/Go） */
declare const FileIcon: React.FC<{ src: string; size?: number; className?: string }>;
declare function resolveFileIconMeta(path: string, options?: { basePath?: string }): { fileIconSrc: string };
/** 工作区服务（原 fs/Oc） */
declare function useWorkspaceScopedServices(
  workspacePath?: string,
  remoteSessionId?: string | null,
  workspaceIdentity?: string | null,
): { fileService: FileServiceLike };
interface FileServiceLike {
  checkFilesExist(args: { paths: string[] }): Promise<Array<{ path: string; exists: boolean }>>;
  [key: string]: unknown;
}

/* ============================================================================
 * 3. 预览卡单项（原 c1/C_t/w_t/T_t/E_t/D_t/O_t/k_t/A_t，jsx 94007–95033）
 * ==========================================================================*/

export interface PreviewCardModel {
  id: string;
  type: "website" | "file";
  kind?: string;
  title: string;
  subtitleId: string;
  url?: string;
  path?: string;
  filePath?: string | null;
  [key: string]: unknown;
}

/** 原 pgt：扩展名 → 预览种类/副标题 id */
const PREVIEW_KIND_TABLE: Array<{ extensions: string[]; kind: string; subtitleId: string }> = [
  { extensions: [".md"], kind: "markdown", subtitleId: "chat.previewCards.markdown" },
  { extensions: [".html", ".htm"], kind: "html", subtitleId: "chat.previewCards.htmlWebsite" },
  { extensions: [".docx"], kind: "docx", subtitleId: "chat.previewCards.docx" },
  { extensions: [".xlsx"], kind: "xlsx", subtitleId: "chat.previewCards.xlsx" },
  { extensions: [".pptx"], kind: "pptx", subtitleId: "chat.previewCards.pptx" },
  { extensions: [".pdf"], kind: "pdf", subtitleId: "chat.previewCards.pdf" },
];
function stripTrailingPunctuation(value: string): string {
  return value.trim().replace(/[.,;!?，。！？；：、]+$/, "").replace(/:\d+(?::\d+)?$/, "");
}
function matchPreviewKind(value: string): { extensions: string[]; kind: string; subtitleId: string } | null {
  const lowered = stripTrailingPunctuation(value).toLowerCase();
  return PREVIEW_KIND_TABLE.find((entry) => entry.extensions.some((extension) => lowered.endsWith(extension))) ?? null;
}
/** 原 o1：可嵌入浏览器 URL 判定（接口级，横切） */
declare function isEmbeddableBrowserUrl(url: string): boolean;
/** 原 qo：URL pathname 解码 */
declare function decodeUrlPathname(pathname: string): string;
/** 原 gA/Jo：工作区相对路径解析 */
declare function resolveWorkspaceRelativePath(workspacePath: string | undefined, candidate: string): { path: string } | null;

/** 原 r1：file:// URL → 本地路径（含 UNC 主机） */
function fileUrlToPath(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "file:") return null;
    const pathname = decodeUrlPathname(parsed.pathname);
    if (/^\/[a-zA-Z]:\//.test(pathname)) return pathname.slice(1);
    return parsed.hostname && parsed.hostname !== "localhost" ? `//${parsed.hostname}${pathname}` : pathname;
  } catch {
    return null;
  }
}
/** 原 i1：引用文本 → 工作区路径（file:// / 相对 / 裸文件名） */
function resolveReferencePath(workspacePath: string | undefined, reference: string): string | null {
  if (/^file:\/\//i.test(reference)) return fileUrlToPath(reference);
  const relative = resolveWorkspaceRelativePath(workspacePath, reference);
  if (relative) return relative.path;
  const cleaned = stripTrailingPunctuation(reference);
  if (!cleaned || cleaned.startsWith("http://") || cleaned.startsWith("https://")) return null;
  if (!cleaned.includes("/") && !cleaned.includes("\\")) return joinWorkspacePath(workspacePath as string, cleaned); /* A0-D 类型垫片：bundle 同参（undefined 时原样抛出） */
  return resolveWorkspaceRelativePath(workspacePath, `./${cleaned}`)?.path ?? null;
}
/** 原 c1（94007）：卡片 → 本地路径（website 用 filePath/file:// 解析） */
function previewCardPath(card: PreviewCardModel): string | null {
  return card.type === "website" ? (card.filePath ?? fileUrlToPath(card.url ?? "")) : (card.path ?? null);
}
/** 原 Lgt：全部卡片均可解析为本地路径 */
function allCardsHaveLocalPath(cards: PreviewCardModel[]): boolean {
  return cards.some((card) => previewCardPath(card) !== null);
}
/** 原 C_t（94833）：卡片列表签名 */
function previewCardsSignature(cards: PreviewCardModel[]): string {
  return cards
    .map((card) =>
      card.type === "website"
        ? [card.id, card.type, card.title, card.subtitleId, card.url, card.filePath ?? ""].join("\0")
        : [card.id, card.type, card.kind, card.title, card.subtitleId, card.path].join("\0"),
    )
    .join("");
}
/** 原 w_t（94836）：同步可见卡片（仅 website 且 URL 可嵌入；上限 10；有本地路径则走异步） */
function resolveSyncVisibleCards(cards: PreviewCardModel[]): PreviewCardModel[] | null {
  return allCardsHaveLocalPath(cards) ? null : cards.filter((card) => card.type === "website" && isEmbeddableBrowserUrl(card.url ?? "")).slice(0, 10);
}
/** 原 T_t（94839）：异步存在性校验（前 15 → checkFilesExist → 上限 10） */
async function resolveAsyncVisibleCards(cards: PreviewCardModel[], fileService: FileServiceLike): Promise<PreviewCardModel[]> {
  const synced = resolveSyncVisibleCards(cards);
  if (synced) return synced;
  const head = cards.slice(0, 15);
  const paths = head.map(previewCardPath).filter((path): path is string => path !== null);
  const checked = await fileService.checkFilesExist({ paths });
  const existing = new Set(checked.filter((entry) => entry.exists).map((entry) => entry.path));
  return head
    .filter((card) => {
      if (card.type === "website" && !isEmbeddableBrowserUrl(card.url ?? "")) return false;
      const path = previewCardPath(card);
      return path === null || existing.has(path);
    })
    .slice(0, 10);
}
/** 原 E_t（94854）：文件预览源构建（返回形对齐属主 FileOpenPreviewSource，供 v_t target.previewSource 透传） */
function buildFilePreviewSource(
  card: PreviewCardModel,
  scope: { workspacePath?: string; workspaceIdentity?: string | null; workspaceRemoteSessionId?: string | null },
): { type: `file`; title: string; path: string | undefined; workspacePath?: string; workspaceIdentity?: string; workspaceRemoteSessionId?: string } {
  return {
    type: "file",
    title: card.title,
    path: card.path,
    ...(scope.workspacePath ? { workspacePath: scope.workspacePath } : {}),
    ...(scope.workspaceIdentity ? { workspaceIdentity: scope.workspaceIdentity } : {}),
    ...(scope.workspaceRemoteSessionId ? { workspaceRemoteSessionId: scope.workspaceRemoteSessionId } : {}),
  };
}
/** 原 D_t（94870）：website 卡是否按文件打开（file:// 且路径不可远程感知） */
declare function isRemoteAwarePath(args: { path: string; workspaceIdentity?: string | null; workspaceRemoteSessionId?: string | null }): boolean; // Ogt
function previewCardOpensAsFile(
  card: PreviewCardModel,
  scope: { workspaceIdentity?: string | null; workspaceRemoteSessionId?: string | null },
): boolean {
  const path = previewCardPath(card);
  return card.type !== "website" || ((card.url ?? "").startsWith("file://") && path !== null && !isRemoteAwarePath({ path, ...scope }));
}

/** 原 O_t（111161 / 94877）：可见预览卡钩子（同步 website 子集，否则异步存在性校验） */
export function useVisiblePreviewCards(
  cards: PreviewCardModel[],
  scope: { workspacePath?: string; workspaceRemoteSessionId?: string | null; workspaceIdentity?: string | null } = {},
): { visibleCards: PreviewCardModel[]; settled: boolean } {
  const { fileService } = useWorkspaceScopedServices(scope.workspacePath, scope.workspaceRemoteSessionId, scope.workspaceIdentity);
  const signature = React.useMemo(() => previewCardsSignature(cards), [cards]);
  const stableRef = React.useRef({ cards, signature });
  if (stableRef.current.signature !== signature) stableRef.current = { cards, signature };
  const stableCards = stableRef.current.cards;
  const synced = React.useMemo(() => resolveSyncVisibleCards(stableCards), [stableCards]);
  const [asyncState, setAsyncState] = React.useState<{ fileService: FileServiceLike | null; signature: string; visibleCards: PreviewCardModel[] }>({
    fileService: null,
    signature: "",
    visibleCards: [],
  });
  React.useEffect(() => {
    if (synced) return;
    let cancelled = false;
    resolveAsyncVisibleCards(stableCards, fileService).then(
      (visible) => {
        if (!cancelled) setAsyncState({ fileService, signature, visibleCards: visible });
      },
      () => {
        if (!cancelled) setAsyncState({ fileService, signature, visibleCards: [] });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [signature, fileService, synced, stableCards]);
  if (synced) return { visibleCards: synced, settled: true };
  const matches = asyncState.fileService === fileService && asyncState.signature === signature;
  return { visibleCards: matches ? asyncState.visibleCards : [], settled: matches };
}

/** 原 A_t（111233 / 94950）：预览卡单项（图标 + 标题/副标题 + 打开方式菜单） */
export function PreviewCard({
  card,
  animationDelayMs,
  subtitle,
  workspacePath,
  workspaceIdentity,
  workspaceRemoteSessionId,
  onOpenBrowserUrl,
  onOpenFileLink,
  onOpenCodeViewer,
  compactForRemoteControl,
}: {
  card: PreviewCardModel;
  animationDelayMs: number;
  subtitle: string;
  workspacePath?: string;
  workspaceIdentity?: string | null;
  workspaceRemoteSessionId?: string | null;
  onOpenBrowserUrl?: (url: string) => void;
  /** bundle v_t 实际回传对象 {path,label,pathKind,workspacePath,...}（110488）；链路按 path 建模，边界收 any。 */
  onOpenFileLink?: (arg: any) => void;
  onOpenCodeViewer?: OpenCodeViewerFn;
  compactForRemoteControl?: boolean;
}) {
  const localPath = previewCardPath(card);
  const opensAsFile = previewCardOpensAsFile(card, { workspaceIdentity, workspaceRemoteSessionId });
  const iconMeta = localPath ? resolveFileIconMeta(localPath) : null;
  const previewSource =
    opensAsFile && localPath
      ? {
          type: "file",
          title: card.title,
          path: localPath,
          ...(workspacePath ? { workspacePath } : {}),
          ...(workspaceIdentity ? { workspaceIdentity } : {}),
          ...(workspaceRemoteSessionId ? { workspaceRemoteSessionId } : {}),
        }
      : null;
  return (
    <div
      className="flex w-full items-center gap-3 rounded-xl border border-card-border bg-card p-3 pr-4 text-foreground"
      data-zcode-stream-animate="true"
      style={{ "--zcode-stream-animation-delay": `${animationDelayMs}ms` } as React.CSSProperties}
    >
      <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-background text-foreground-subtle">
        {!opensAsFile && card.type === "website" ? (
          <IconGlobe className="size-5" />
        ) : iconMeta ? (
          <FileIcon src={iconMeta.fileIconSrc} size={20} />
        ) : (
          <IconFile className="size-5" />
        )}
      </div>
      <div className="min-w-0 flex flex-1 flex-col gap-1">
        <div className="truncate text-ui-base font-medium leading-5">{card.title}</div>
        <div className="truncate text-ui-base leading-5 text-foreground-subtlest">{subtitle}</div>
      </div>
      <FileOpenWithMenu
        target={
          !opensAsFile && card.type === "website"
            ? { type: "website", url: card.url ?? "" }
            : {
                type: "file",
                path: localPath ?? "",
                title: card.title,
                label: card.title,
                previewSource: card.type === "website" ? previewSource ?? undefined : buildFilePreviewSource(card, { workspacePath, workspaceIdentity, workspaceRemoteSessionId }),
              }
        }
        onOpenBrowserUrl={onOpenBrowserUrl}
        onOpenFileLink={onOpenFileLink}
        onOpenCodeViewer={onOpenCodeViewer}
      />
    </div>
  );
}

/** 原 k_t（111193 / 94925）：预览卡列表（36ms 级联入场，上限 240ms） */
export function PreviewCardList({
  cards,
  workspacePath,
  workspaceIdentity,
  workspaceRemoteSessionId,
  onOpenBrowserUrl,
  onOpenFileLink,
  onOpenCodeViewer,
  compactForRemoteControl,
}: {
  cards: PreviewCardModel[];
  workspacePath?: string;
  workspaceIdentity?: string | null;
  workspaceRemoteSessionId?: string | null;
  onOpenBrowserUrl?: (url: string) => void;
  onOpenFileLink?: (link: FileLinkModel) => void;
  onOpenCodeViewer?: OpenCodeViewerFn;
  compactForRemoteControl?: boolean;
}) {
  const { intl } = useIntlContext();
  const { visibleCards, settled } = useVisiblePreviewCards(cards, { workspacePath, workspaceIdentity, workspaceRemoteSessionId });
  if (!settled || visibleCards.length === 0) return null;
  return (
    <div className="flex w-full flex-col gap-3">
      {visibleCards.map((card, index) => (
        <PreviewCard
          key={card.id}
          card={card}
          animationDelayMs={Math.min(index * 36, 240)}
          subtitle={intl.formatMessage({ id: card.subtitleId })}
          workspacePath={workspacePath}
          workspaceIdentity={workspaceIdentity}
          workspaceRemoteSessionId={workspaceRemoteSessionId}
          onOpenBrowserUrl={onOpenBrowserUrl}
          onOpenFileLink={onOpenFileLink}
          onOpenCodeViewer={onOpenCodeViewer}
          compactForRemoteControl={compactForRemoteControl}
        />
      ))}
    </div>
  );
}

