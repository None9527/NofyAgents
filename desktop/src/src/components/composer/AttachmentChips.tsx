/**
 * 〔A1-R130〕附件芯片族真身（styles-CdEGpc2x.js 1717600–1727900 逐字；Composer 族 63845 域）。
 *
 * 映射（混淆 → 语义 → styles 偏移）：
 *   xWe→ATTACHMENT_CATEGORY_ICONS（audio=Music2/document=FileText/image=Image/
 *        source=Globe/unknown=Paperclip/video=Video，vendored lucide 870504–888793）
 *   mN→resolveAttachmentMediaCategory | SWe→resolveAttachmentDisplayName
 *   CWe→AttachmentImagePreview（grid 96px / inline 20px 两档）
 *   hN→AttachmentGroupContext | gN→AttachmentItemContext
 *   wWe→useAttachmentGroupVariant | _N→useAttachmentItem
 *   vN→AttachmentChipGroup | yN→AttachmentChip | bN→AttachmentChipIcon
 *   xN→AttachmentChipName | SN→AttachmentChipRemoveButton | DN→AttachmentPreviewDialog
 *   依存：Z≡cn（UtilsCn）| X≡Button（modules/button）| g≡lucide X（imeComposition b 导出 qt）
 *        G≡useZCodeIntl（I18n）| zb/Hb/Ub/Gb/Kb≡Dialog/DialogContent/DialogHeader/
 *        DialogTitle/DialogDescription（components/ui/dialog）
 *
 * 环安全：纯组件叶——运行期边仅 modules/{UtilsCn,button,I18n} + components/ui/dialog +
 *        npm lucide-react，均单向，无反指 Conversation/Composer 边。
 * 型缝：props 面 `: any`（S16 类位置驱动缝，束无型；消费面 Conversation@1021–1056 逐字）。
 *      variant 束真三档 grid/list/inline（declare 时代「inline|dock」过近似，随迁退役）。
 */
import * as React from "react";
import { cn } from '../../modules/UtilsCn'; // 原 Z（utils-CEEH0K_K.js）
import { Button } from '../../modules/button'; // 原 X（button-laUijeDG.js t 导出）
import { useZCodeIntl as useIntlContext } from '../../modules/I18n'; // 原 G（IntlProvider-C321H7m8.js）
import { Music2, FileText, Image as ImageIcon, Globe, Paperclip, Video, X as CloseIcon } from 'lucide-react'; // 原 nbe/Z_/cv/nv/obe/Fbe/g（styles vendored lucide；A0-S3b 判例）
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog'; // 原 zb/Hb/Ub/Gb/Kb

/** 原 xWe：媒体类别 → 图标（audio/document/image/source/unknown/video） */
const ATTACHMENT_CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  audio: Music2,
  document: FileText,
  image: ImageIcon,
  source: Globe,
  unknown: Paperclip,
  video: Video,
};

/** 原 mN：附件数据 → 媒体类别 */
function resolveAttachmentMediaCategory(e: any): string {
  if (e.type === `source-document`) return `source`;
  const t = e.mediaType ?? ``;
  return t.startsWith(`image/`)
    ? `image`
    : t.startsWith(`video/`)
      ? `video`
      : t.startsWith(`audio/`)
        ? `audio`
        : t.startsWith(`application/`) || t.startsWith(`text/`)
          ? `document`
          : `unknown`;
}

/** 原 SWe：附件数据 → 显示名 */
function resolveAttachmentDisplayName(e: any): string {
  if (e.displayName) return e.displayName;
  if (e.type === `source-document`) return e.title || e.filename || `Source`;
  const t = resolveAttachmentMediaCategory(e);
  return e.filename || (t === `image` ? `Image` : `Attachment`);
}

/** 原 CWe：图片预览元素（grid 96px / inline 20px） */
function AttachmentImagePreview(e: any, t: any, n: any) {
  return n
    ? <img alt={t || `Image`} className={`size-full object-cover`} height={96} src={e} width={96} />
    : <img alt={t || `Image`} className={`size-full rounded object-cover`} height={20} src={e} width={20} />;
}

/** 原 hN / gN：组上下文（variant）/ 单项上下文（data+mediaCategory+onRemove+variant） */
const AttachmentGroupContext = React.createContext<any>(null);
const AttachmentItemContext = React.createContext<any>(null);

/** 原 wWe：组 variant（缺省 grid） */
function useAttachmentGroupVariant() {
  return React.useContext(AttachmentGroupContext) ?? { variant: `grid` };
}

/** 原 _N：单项上下文（越界抛错） */
function useAttachmentItem() {
  const e = React.useContext(AttachmentItemContext);
  if (!e) throw Error(`Attachment components must be used within <Attachment>`);
  return e;
}

/** 原 vN：附件芯片组（variant 上下文 + flex 布局容器） */
export function AttachmentChipGroup({ variant: e = `grid`, className: t, children: n, ...r }: any) {
  const i = React.useMemo(() => ({ variant: e }), [e]);
  return (
    <AttachmentGroupContext.Provider value={i}>
      <div
        className={cn(
          `flex items-start`,
          e === `list` ? `flex-col gap-2` : `flex-wrap gap-2`,
          e === `grid` && `ml-auto w-fit`,
          t,
        )}
        {...r}
      >
        {n}
      </div>
    </AttachmentGroupContext.Provider>
  );
}

/** 原 yN：附件芯片（单项上下文 + 可点开/键盘可达容器） */
export function AttachmentChip({
  data: e,
  onRemove: t,
  onOpen: n,
  openLabel: r,
  className: i,
  children: a,
  onClick: o,
  onKeyDown: s,
  role: c,
  tabIndex: l,
  "aria-label": u,
  ...d
}: any) {
  const { variant: f } = useAttachmentGroupVariant();
  const p = resolveAttachmentMediaCategory(e);
  const m = !!n;
  const h = React.useMemo(
    () => ({ data: e, mediaCategory: p, onRemove: t, variant: f }),
    [e, p, t, f],
  );
  const g = React.useCallback(
    (e: any) => {
      (o?.(e), !e.defaultPrevented && n?.());
    },
    [o, n],
  );
  const _ = React.useCallback(
    (e: any) => {
      (s?.(e),
        !(e.defaultPrevented || !n) &&
          (e.key === `Enter` || e.key === ` `) &&
          (e.preventDefault(), n()));
    },
    [s, n],
  );
  return (
    <AttachmentItemContext.Provider value={h}>
      <div
        aria-label={u ?? r}
        className={cn(
          `group relative`,
          f === `grid` && `size-24 overflow-hidden rounded-lg`,
          f === `inline` && [
            `flex h-8 select-none items-center gap-0.5`,
            `overflow-hidden rounded-md border border-border p-1 pr-2.5`,
            `font-medium text-ui-base transition-all`,
            `bg-background`,
            `[--attachment-bg:var(--color-background)]`,
          ],
          f === `list` && [
            `flex w-full items-center gap-3 rounded-lg border p-3`,
            `hover:bg-accent/50`,
          ],
          m && [
            `cursor-pointer hover:border-border-hover hover:text-accent-foreground`,
            `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused focus-visible:ring-offset-2 focus-visible:ring-offset-background`,
          ],
          !m && `cursor-default`,
          i,
        )}
        onClick={g}
        onKeyDown={_}
        role={c ?? (m ? `button` : void 0)}
        tabIndex={l ?? (m ? 0 : void 0)}
        {...d}
      >
        {a}
      </div>
    </AttachmentItemContext.Provider>
  );
}

/** 原 bN：附件芯片图标（图片/视频缩略 or 类别图标） */
export function AttachmentChipIcon({ fallbackIcon: e, className: t, ...n }: any) {
  const { data: r, mediaCategory: i, variant: a } = useAttachmentItem();
  const o = a === `inline` ? `size-3` : `size-4`;
  const s = (e: any) => {
    const Icon = e; // 束真 `$.jsx(e, …)` 变量组件面；JSX 大写化转写缝（编译形逐字同）
    return <Icon className={cn(o, `text-muted-foreground`)} />;
  };
  const c = () => {
    if (i === `image` && r.type === `file` && r.url)
      return AttachmentImagePreview(r.url, r.filename, a === `grid`);
    if (i === `video` && r.type === `file` && r.url)
      return <video className={`size-full object-cover`} muted src={r.url} />;
    const t = ATTACHMENT_CATEGORY_ICONS[i];
    return e ?? s(t);
  };
  return (
    <div
      className={cn(
        `flex shrink-0 items-center justify-center overflow-hidden`,
        a === `grid` && `size-full bg-muted`,
        a === `inline` && `size-5 rounded bg-background`,
        a === `list` && `size-12 rounded bg-muted`,
        t,
      )}
      {...n}
    >
      {c()}
    </div>
  );
}

/** 原 xN：附件芯片名（inline 单行「名 · 描述」/ 其余多行） */
export function AttachmentChipName({ showMediaType: e = false, className: t, ...n }: any) {
  const { data: r, variant: i } = useAttachmentItem();
  const a = resolveAttachmentDisplayName(r);
  const o = r.description;
  return i === `grid`
    ? null
    : i === `inline` && o
      ? (
        <div className={cn(`min-w-0 flex-1`, t)} {...n}>
          <span className={`block truncate`}>
            {a}
            <span className={`text-foreground-subtle`}>{` · `}{o}</span>
          </span>
        </div>
      )
      : (
        <div className={cn(`min-w-0 flex-1`, t)} {...n}>
          <span className={`block truncate`}>{a}</span>
          {o
            ? (
              <span className={`block truncate text-muted-foreground text-ui-base`}>
                {o}
              </span>
            )
            : null}
          {e &&
            r.mediaType &&
            (
              <span className={`block truncate text-muted-foreground text-ui-base`}>
                {r.mediaType}
              </span>
            )}
        </div>
      );
}

/** 原 SN：附件芯片移除按钮（inline 渐隐尾挂 / grid·list 角标） */
export function AttachmentChipRemoveButton({
  alwaysVisible: e = false,
  label: t = `Remove`,
  className: n,
  children: r,
  onClick: i,
  onPointerDown: a,
  ...o
}: any) {
  const { onRemove: s, variant: c } = useAttachmentItem();
  const l = React.useCallback(
    (e: any) => {
      (e.stopPropagation(), i?.(e), !e.defaultPrevented && (e.preventDefault(), s?.()));
    },
    [i, s],
  );
  const u = React.useCallback(
    (e: any) => {
      (e.stopPropagation(), a?.(e));
    },
    [a],
  );
  return s
    ? c === `inline`
      ? (
        <span
          className={cn(
            `pointer-events-none absolute inset-y-0 right-0 z-10 flex items-center transition-opacity duration-150 ease-out`,
            e ? `opacity-100` : `opacity-0 group-hover:opacity-100 focus-within:opacity-100`,
          )}
        >
          <span className={`h-full w-2 bg-gradient-to-r from-transparent to-[var(--attachment-bg)] transition-colors`} />
          <span className={`pointer-events-auto flex h-full w-6 items-center justify-center bg-[var(--attachment-bg)] transition-colors`}>
            <Button
              aria-label={t}
              className={cn(`rounded-md`, `[&>svg]:size-3`, n)}
              onClick={l}
              onPointerDown={u}
              size={`icon-xs`}
              type={`button`}
              variant={`ghost`}
              {...o}
            >
              {r ?? <CloseIcon />}
              <span className={`sr-only`}>{t}</span>
            </Button>
          </span>
        </span>
      )
      : (
        <Button
          aria-label={t}
          className={cn(
            c === `grid` && [
              `absolute top-2 right-2 size-6 rounded-full p-0`,
              `bg-background/80 backdrop-blur-sm`,
              `opacity-0 transition-opacity group-hover:opacity-100`,
              `hover:bg-background`,
              `[&>svg]:size-3`,
            ],
            c === `list` && [`size-8 shrink-0 rounded p-0`, `[&>svg]:size-4`],
            n,
          )}
          onClick={l}
          onPointerDown={u}
          type={`button`}
          variant={`ghost`}
          {...o}
        >
          {r ?? <CloseIcon />}
          <span className={`sr-only`}>{t}</span>
        </Button>
      )
    : null;
}

/** 原 DN：附件预览对话框（图片预览 / 加载中 / 不可用三态）。
 * 〔A1-R130〕型缝：props 面精化（非 any）——消费面 1057 `onOpenChange={(open) => …}`
 * 箭头参需上下文型（declare 时代面 `(open: boolean) => void` 同形）；束真 loading/error
 * 带缺省（!1），面置可选（超集，消费面全传不受影响）。 */
export function AttachmentPreviewDialog({ attachment: e, open: t, onOpenChange: n, loading: r = false, error: i = false }: {
  attachment: { filename: string; mediaType?: string; url?: string | null } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading?: boolean;
  error?: boolean;
}) {
  const { intl: a } = useIntlContext();
  const o = a.formatMessage({ id: `chat.attachments.preview.title` });
  const s = a.formatMessage({ id: `chat.attachments.preview.loading` });
  const c = a.formatMessage({ id: `chat.attachments.preview.unavailable` });
  return (
    <Dialog open={t} onOpenChange={n}>
      <DialogContent className={`max-w-5xl gap-0 overflow-hidden p-0`} showCloseButton>
        <DialogHeader className={`gap-1 border-b border-popover-border px-4 py-3 pr-12`}>
          <DialogTitle className={`truncate`}>{e?.filename ?? o}</DialogTitle>
          <DialogDescription className={`truncate text-ui-base`}>{e?.mediaType ?? o}</DialogDescription>
        </DialogHeader>
        <div className={`flex max-h-[72vh] min-h-64 items-center justify-center bg-background-alt p-4`}>
          {e?.url
            ? (
              <img
                alt={e.filename}
                className={`max-h-[calc(72vh-2rem)] max-w-full rounded-lg object-contain`}
                src={e.url}
              />
            )
            : i
              ? (
                <p className={`px-6 text-center text-ui-base text-destructive`} role={`alert`}>
                  {c}
                </p>
              )
              : r
                ? (
                  <p className={`text-ui-base text-muted-foreground`} role={`status`}>
                    {s}
                  </p>
                )
                : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
