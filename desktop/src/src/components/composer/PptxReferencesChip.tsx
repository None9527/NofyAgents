// A0-S4-4b: 自 modules/Composer.tsx [B16] PPTX 引用 chip 单元（usePptxElementReferences → usePptxPreviewOpener）原样迁入（组件单元；原文件现为薄 re-export shim）。
// 迁出体 = [B16] 段内 7612–7852（六实体：usePptxElementReferences/pptxReferenceLabel/PptxReferencesChip/
// buildPptxPreviewNavigation/toPptxViewerTarget/usePptxPreviewOpener）+ §0 pptx declare 子集（pptxScopeKey/isPptxElementAddEvent/
// matchesPptxElementScope/mergePptxElementReference/PPTX_ELEMENT_ADD_EVENT_TYPE，本单元独占消费）+ PptxElementAddDetail 型别
// （留守 shim 补 export，经 type import 取回——留守面 buildPptxElementsMarkdown/extractPptxElementReferencesFromContent 亦消费）；
// PptxElementIcon declare 随族迁入；HoverCardRoot 为三面共用复制件（shim 保留）。
// useSessionScopedReferences 留守 shim（[B16] 余量），经下方 import 取回（函数声明提升，渲染期访问，环安全）。
// 导入路径按 components/composer/ 深度改指 ../../modules/。
/* eslint-disable */
import * as React from "react";
import { X as CloseIcon, Trash2 as TrashIcon } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0
import { HoverCardContent, HoverCardTrigger } from '../ui/hover-card'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { toast } from '../../modules/ImeComposition';
import { resolveWorkspaceKey as workspaceKey } from '../../modules/SkillStore'; // A0-D 接线：declare → SkillStore b 导出 resolveWorkspaceKey
import { useZCodeIntl as useIntlContext } from '../../modules/I18n'; // 原 G（A0-D 接线：declare → I18n canonical）
import { Button } from '../../modules/button'; // 原 H（A0-D 接线：declare → button canonical）
import { useSessionScopedReferences, type PptxElementAddDetail } from '../../modules/Composer'; // [B16] 留守钩子 + 型别（补 export）

/** 13. Radix 悬浮卡原语（HoverCardRoot 三面共用复制件；shim 亦保留） */
declare const HoverCardRoot: React.ComponentType<{ openDelay?: number; closeDelay?: number; children?: React.ReactNode } & Record<string, unknown>>; // dN 透传面（bundle 54538）

/** 14. 图标（本 chunk 图标块 = lucide vendored 登记；语义按消费点命名） */
declare const PptxElementIcon: React.ComponentType<{ className?: string }>;

/** pptx 域（imeComposition 导出族 + 本 chunk）：事件判定/匹配/去重/键 */
declare function pptxScopeKey(workspacePath: string, workspaceIdentity?: string | null): string;
declare function isPptxElementAddEvent(event: Event): boolean;
declare function matchesPptxElementScope(
  detail: PptxElementAddDetail,
  scope: { workspacePath: string; workspaceIdentity?: string | null; remoteSessionId?: string | null },
): boolean;
declare function mergePptxElementReference(
  existing: PptxElementAddDetail[],
  detail: PptxElementAddDetail,
): PptxElementAddDetail[];
declare const PPTX_ELEMENT_ADD_EVENT_TYPE: string;
declare function isPathWithinWorkspace(workspacePath: string, sourcePath: string): boolean; // 留守面共用 ambient declare，按消费方复制（编译期擦除，emit 中立）

/** QXe → usePptxElementReferences（js 68996） */
export function usePptxElementReferences(args: { // 〔A1-R21〕补 export：Home usePptxReferences declare（68996 同身）收敛消费（函数声明提升，环安全）
  workspacePath: string;
  workspaceIdentity?: string | null;
  remoteSessionId?: string | null;
  listenAddToChatEvents?: boolean;
  scopeId?: string | null;
}) {
  const {
      workspacePath,
      workspaceIdentity,
      remoteSessionId,
      listenAddToChatEvents = true,
      scopeId = null,
    } = args,
    [references, setReferences] = React.useState<PptxElementAddDetail[]>([]),
    scopeKey = pptxScopeKey(workspacePath, workspaceIdentity);
  React.useEffect(() => {
    setReferences([]);
  }, [remoteSessionId, scopeId, scopeKey]);
  const removeReference = React.useCallback((id: string) => {
      setReferences((current) => current.filter((entry) => entry.id !== id));
    }, []),
    clearReferences = React.useCallback(() => setReferences([]), []);
  return (
    React.useEffect(() => {
      if (!listenAddToChatEvents || typeof window > `u`) return;
      const handleAdd = (event: Event) => {
        if (!isPptxElementAddEvent(event)) return;
        const detail = (event as CustomEvent).detail as PptxElementAddDetail;
        matchesPptxElementScope(detail, { workspacePath, workspaceIdentity, remoteSessionId }) &&
          (event.preventDefault(), setReferences((current) => mergePptxElementReference(current, detail)));
      };
      return (window.addEventListener(PPTX_ELEMENT_ADD_EVENT_TYPE, handleAdd), () => window.removeEventListener(PPTX_ELEMENT_ADD_EVENT_TYPE, handleAdd));
    }, [listenAddToChatEvents, remoteSessionId, workspaceIdentity, scopeKey, workspacePath]),
    React.useMemo(
      () => ({
        references,
        hasReferences: references.length > 0,
        removeReference,
        clearReferences,
      }),
      [clearReferences, references, removeReference],
    )
  );
}

/** qH → pptxReferenceLabel（js 69033） */
function pptxReferenceLabel(reference: PptxElementAddDetail): string {
  return reference.selectedText || reference.text || reference.nodeName || reference.nodeType || ``;
}

/** JH → PptxReferencesChip（js 69036） */
export function PptxReferencesChip({ references, onOpen, onRemove, onRemoveAll }: { // 〔A1-R21〕补 export：Home PptxReferenceChipRow declare（69036 同身）收敛消费（函数声明提升，环安全）
  references: PptxElementAddDetail[];
  onOpen?: (reference: PptxElementAddDetail) => void;
  onRemove?: (id: string) => void;
  onRemoveAll?: () => void;
}): React.ReactElement | null {
  const { intl } = useIntlContext();
  if (references.length === 0) return null;
  const chipLabel = intl.formatMessage(
      { id: references.length === 1 ? `chat.pptxElements.one` : `chat.pptxElements.many` },
      { count: String(references.length) },
    ),
    removeLabel = intl.formatMessage({ id: `chat.pptxElements.remove` });
  return (
    <HoverCardRoot>
      <HoverCardTrigger asChild>
        <div
          className={`group flex h-8 max-w-full cursor-pointer select-none items-center gap-1.5 rounded-md border border-border bg-surface p-1 font-medium text-ui-base text-foreground outline-none transition-all hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-input-border-focused`}
          aria-label={chipLabel}
          role={`button`}
          tabIndex={0}
        >
          <span className={`flex min-w-0 items-center gap-1.5 rounded-sm px-1`}>
            <PptxElementIcon className={`size-4 shrink-0 text-foreground-subtle`} />
            <span className={`truncate`}>{chipLabel}</span>
          </span>
          {onRemoveAll
            ? (
              <Button
                type={`button`}
                variant={`ghost`}
                size={`icon-xs`}
                className={`size-5 shrink-0 rounded-sm text-foreground-subtle opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100`}
                aria-label={removeLabel}
                title={removeLabel}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                  (event.stopPropagation(), onRemoveAll());
                }}
              >
                <CloseIcon className={`size-3.5`} />
              </Button>
            )
            : null}
        </div>
      </HoverCardTrigger>
      <HoverCardContent
        align={`start`}
        side={`top`}
        className={`w-80 rounded-xl border border-popover-border bg-menu p-1 text-foreground shadow-md ring-0`}
      >
        <div className={`max-h-64 overflow-y-auto`}>
          {references.map((reference) =>
            (
              <div key={reference.id} className={`group/context flex min-h-7 items-start gap-1 rounded-lg px-1 py-0.5 text-ui-base/relaxed hover:bg-menu-hover`}>
                {onOpen
                  ? (
                    <button
                      type={`button`}
                      className={`flex min-w-0 flex-1 items-start gap-2 rounded-md px-1 py-0.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused`}
                      onClick={() => onOpen(reference)}
                    >
                      <PptxElementIcon className={`mt-1 size-4 shrink-0 text-foreground-subtle`} />
                      <span className={`min-w-0 flex-1`}>
                        <span className={`block truncate font-medium`}>{pptxReferenceLabel(reference)}</span>
                        <span className={`block truncate font-mono text-ui-sm text-foreground-subtle`}>
                          {reference.sourceTitle}
                          {` · `}
                          {reference.slideIndex + 1}
                          {` ·`}
                          {` `}
                          {reference.nodeId}
                        </span>
                        {reference.comment?.trim()
                          ? (
                            <span className={`line-clamp-2 text-ui-base/relaxed text-foreground-subtle`}>{reference.comment}</span>
                          )
                          : null}
                      </span>
                    </button>
                  )
                  : (
                    <div className={`flex min-w-0 flex-1 items-start gap-2 px-1 py-0.5`}>
                      <PptxElementIcon className={`mt-1 size-4 shrink-0 text-foreground-subtle`} />
                      <div className={`min-w-0 flex-1`}>
                        <div className={`truncate font-medium`}>{pptxReferenceLabel(reference)}</div>
                        <div className={`truncate font-mono text-ui-sm text-foreground-subtle`}>
                          {reference.sourceTitle}
                          {` · `}
                          {reference.slideIndex + 1}
                          {` ·`}
                          {` `}
                          {reference.nodeId}
                        </div>
                        {reference.comment?.trim()
                          ? (
                            <div className={`line-clamp-2 text-ui-base/relaxed text-foreground-subtle`}>{reference.comment}</div>
                          )
                          : null}
                      </div>
                    </div>
                  )}
                {onRemove
                  ? (
                    <Button
                      type={`button`}
                      variant={`ghost`}
                      size={`icon-xs`}
                      className={`mt-0.5 size-5 shrink-0 rounded-sm text-foreground-subtle opacity-0 transition-opacity hover:text-foreground group-hover/context:opacity-100 focus-visible:opacity-100`}
                      aria-label={removeLabel}
                      title={removeLabel}
                      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                        (event.stopPropagation(), onRemove(reference.id));
                      }}
                    >
                      <TrashIcon className={`size-3.5`} />
                    </Button>
                  )
                  : null}
              </div>
            ),
          )}
        </div>
      </HoverCardContent>
    </HoverCardRoot>
  );
}

/** $Xe → buildPptxPreviewNavigation（js 69181） */
function buildPptxPreviewNavigation(reference: PptxElementAddDetail): {
  requestId: string;
  pageIndex: number;
  expectedSourceFingerprint?: string;
} {
  return {
    requestId:
      typeof crypto < `u` && `randomUUID` in crypto
        ? crypto.randomUUID()
        : `pptx-preview-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    pageIndex: reference.slideIndex,
    expectedSourceFingerprint: reference.sourceFingerprint,
  };
}

/** eZe → toPptxViewerTarget（js 69194） */
function toPptxViewerTarget(reference: PptxElementAddDetail, scope: { workspacePath: string; workspaceIdentity?: string | null; remoteSessionId?: string | null }): {
  type: `pptx`;
  title: string;
  path: string;
  workspacePath: string;
  workspaceIdentity?: string | null;
  workspaceRemoteSessionId?: string | null;
  referenceNavigation: ReturnType<typeof buildPptxPreviewNavigation>;
} | null {
  return !matchesPptxElementScope(reference, scope) || !isPathWithinWorkspace(reference.workspacePath, reference.sourcePath)
    ? null
    : {
        type: `pptx`,
        title: reference.sourceTitle,
        path: reference.sourcePath,
        workspacePath: reference.workspacePath,
        ...(reference.workspaceIdentity ? { workspaceIdentity: reference.workspaceIdentity } : {}),
        ...(reference.remoteSessionId ? { workspaceRemoteSessionId: reference.remoteSessionId } : {}),
        referenceNavigation: buildPptxPreviewNavigation(reference),
      };
}

/** YH → usePptxPreviewOpener（js 69207） */
export function usePptxPreviewOpener(args: { // 〔A1-R21〕补 export：Home useCodeCommentOpener declare（69207 同身）收敛消费（函数声明提升，环安全）
  workspacePath: string;
  workspaceIdentity?: string | null;
  remoteSessionId?: string | null;
  onOpenCodeViewer?: (target: ReturnType<typeof toPptxViewerTarget>) => void;
}) {
  const { workspacePath, workspaceIdentity, remoteSessionId, onOpenCodeViewer } = args;
  const { intl } = useIntlContext();
  return React.useCallback(
    (reference: PptxElementAddDetail) => {
      if (!onOpenCodeViewer) return;
      const target = toPptxViewerTarget(reference, { workspacePath, workspaceIdentity, remoteSessionId });
      if (!target) {
        toast(intl.formatMessage({ id: `chat.pptxElements.previewScopeUnavailable` }));
        return;
      }
      onOpenCodeViewer(target);
    },
    [intl, onOpenCodeViewer, remoteSessionId, workspaceIdentity, workspacePath],
  );
}
