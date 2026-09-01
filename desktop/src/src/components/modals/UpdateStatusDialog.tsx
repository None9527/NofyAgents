// A0-S4-4a: 自 modules/Modals.tsx 更新对话框子族（§1，原 COt）原样迁入（组件单元；原文件现为薄 re-export shim）。
// 迁出体 = 原文件 319–636（UpdateStatusDialog + Progress）。图标常量（§0 createLucideIcon 产物）经 shim import。
import * as React from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { Indicator as ProgressIndicator, Root as ProgressRoot } from '@radix-ui/react-progress'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { Indicator as CheckboxIndicator, Root as CheckboxRoot } from '@radix-ui/react-checkbox'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { Button } from '../../modules/button'; // 原 X，button-laUijeDG.js（A0-D 接线：declare → button canonical）
import { cn } from '../../modules/UtilsCn'; // 原 Z，utils-CEEH0K_K.js（A0-D 接线：declare → UtilsCn canonical）
import { type ZCodeIntl as IntlShape } from '../../modules/I18n'; // 原 G，IntlProvider-C321H7m8.js（A0-D 接线：declare → I18n canonical）
import { IconCheck, IconCalendarDays } from '../../modules/Modals'; // §0 图标常量（createLucideIcon 产物）留存 shim

/* ============================================================================
 * 1. 更新对话框子族（原 COt，styles 128812–129063 / jsx 108523-108611）
 * ----------------------------------------------------------------------------
 * POt 控制器与 DOt/TOt/EOt/kOt/NOt 视图模型助手已在 TopBar.tsx 还原；
 * 本节为呈现层本体：三相位（before-download / downloading / downloaded）+
 * edgeToEdge 全屏变体（更新专用次级窗口）。
 * ==========================================================================*/

/** 原 xOt（styles 128793–128807 / jsx 108512）：Radix Checkbox 封装 */
function UpdateDialogCheckbox({
  className,
  ...props
}: Omit<React.ComponentPropsWithoutRef<"button">, "onChange"> & {
  checked?: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean | "indeterminate") => void;
}) {
  return (
    <CheckboxRoot
      data-slot="checkbox"
      className={cn(
        `peer size-4 shrink-0 rounded-sm border border-input-border bg-input text-primary-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-input-border-focused/30 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary`,
        className,
      )}
      {...props}
    >
      <CheckboxIndicator data-slot="checkbox-indicator" className={`flex items-center justify-center text-current`}>
        <IconCheck className={`size-3`} />
      </CheckboxIndicator>
    </CheckboxRoot>
  );
}

/** 原 SOt（styles 128808 / jsx 108522）：更新对话框 logo 资源 */
const UPDATE_DIALOG_LOGO_URL = new URL(
  `` + new URL(`icon_512@2x-BnwZhfO-.png`, import.meta.url).href,
  `` + import.meta.url,
).href;

export type UpdateDialogPhase = "before-download" | "downloading" | "downloaded";

/**
 * 原 COt（styles 128812–129049 / jsx 108523-108589）：更新对话框呈现层。
 * edgeToEdge=false 走 Radix Dialog；=true 时自绘 role=dialog 全屏层（次级更新窗口）。
 */
export function UpdateStatusDialog({
  displayVersion,
  edgeToEdge = false,
  intl,
  isUpdateActionPending,
  autoDownloadAndInstallUpdates,
  onAutoDownloadAndInstallUpdatesChange,
  onCancelDownload,
  onDownloadUpdate,
  onOpenChange,
  onRestartUpdate,
  onSkipUpdate,
  open,
  phase,
  progressLabel,
  progressValue,
  releaseDateLabel,
  showOverlay = true,
  skippableVersion,
}: {
  displayVersion: string;
  edgeToEdge?: boolean;
  intl: IntlShape;
  isUpdateActionPending: boolean;
  autoDownloadAndInstallUpdates: boolean;
  onAutoDownloadAndInstallUpdatesChange: (v: boolean) => void;
  onCancelDownload: () => void | Promise<void>;
  onDownloadUpdate: () => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
  onRestartUpdate: () => void | Promise<void>;
  onSkipUpdate: () => void | Promise<void>;
  open: boolean;
  phase: UpdateDialogPhase;
  progressLabel: string | null;
  progressValue: number;
  releaseDateLabel: string | null;
  showOverlay?: boolean;
  skippableVersion?: string | null;
}) {
  const isBeforeDownload = phase === `before-download`;
  const isDownloading = phase === `downloading`;
  const isDownloaded = phase === `downloaded`;
  const titleModel = splitUpdateDialogTitle({
    displayVersion,
    intl,
    titleId: isDownloaded
      ? `updateDialog.readyTitle`
      : isDownloading
        ? `updateDialog.downloadingTitle`
        : `updateDialog.availableTitle`,
  });
  const showSkip = isBeforeDownload && !!skippableVersion;
  const showLater = !isDownloading;
  const titleRowClass = `flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-ui-base font-medium leading-5 text-foreground`;
  const titleNode = (
    <>
      {titleModel.prefix ? <span>{titleModel.prefix}</span> : null}
      {titleModel.hasVersion ? <span className={`whitespace-nowrap`}>{titleModel.versionText}</span> : null}
      {titleModel.suffix ? <span>{titleModel.suffix}</span> : null}
    </>
  );
  const contentClass = cn(
    `max-h-[calc(100vh-2rem)] max-w-[calc(100vw-2rem)] overflow-hidden p-5 sm:max-w-lg`,
    edgeToEdge && !isDownloading ? `grid-rows-[auto_auto]` : `grid-rows-[auto_minmax(0,1fr)_auto]`,
    edgeToEdge
      ? `grid h-dvh max-h-none w-dvw max-w-none gap-5 border-0 bg-popover/98 pt-10 text-ui-base/relaxed text-foreground shadow-none sm:max-w-none [app-region:drag]`
      : `gap-5`,
  );
  const body = (
    <>
      <DialogHeader className={`gap-0`}>
        <div className={`flex min-w-0 items-center gap-3 [app-region:no-drag]`}>
          <img
            src={UPDATE_DIALOG_LOGO_URL}
            alt=""
            aria-hidden="true"
            className={`pointer-events-none -ml-[5px] size-12 shrink-0 select-none shadow-none drop-shadow-none`}
            draggable={false}
          />
          <div className={`min-w-0 flex-1 space-y-1.5`}>
            {edgeToEdge ? <h2 className={titleRowClass}>{titleNode}</h2> : <DialogTitle className={titleRowClass}>{titleNode}</DialogTitle>}
            {releaseDateLabel ? (
              <div className={`inline-flex max-w-full items-center gap-1 text-ui-xs font-normal leading-4 text-foreground-subtle`}>
                <IconCalendarDays className={`size-3 shrink-0`} aria-hidden="true" />
                <span className={`truncate`}>{releaseDateLabel}</span>
              </div>
            ) : null}
          </div>
        </div>
      </DialogHeader>
      {isDownloading ? (
        <div className={`min-h-0 overflow-y-auto [app-region:no-drag]`}>
          <section className={`space-y-2`} aria-live="polite">
            <div className={`flex items-center justify-between gap-3`}>
              <span className={`text-ui-base font-medium leading-5 text-foreground`}>
                {intl.formatMessage({ id: `updateDialog.downloadProgress` })}
              </span>
              {progressLabel ? <span className={`font-mono text-ui-base leading-5 text-foreground`}>{progressLabel}</span> : null}
            </div>
            <Progress
              value={progressValue}
              className={`zcode-update-charge-progress h-2 bg-primary/15 dark:bg-primary/20`}
              indicatorClassName={`bg-primary`}
            />
          </section>
        </div>
      ) : null}
      <div className={cn(`[app-region:no-drag]`, isDownloading ? `-mt-2` : null)}>
        {isBeforeDownload ? (
          <label className={`mb-4 flex min-w-0 items-center gap-2 text-ui-base leading-5 text-foreground`}>
            <UpdateDialogCheckbox
              checked={autoDownloadAndInstallUpdates}
              disabled={isUpdateActionPending}
              onCheckedChange={(checked) => {
                onAutoDownloadAndInstallUpdatesChange(checked === true);
              }}
            />
            <span className={`min-w-0`}>{intl.formatMessage({ id: `updateDialog.autoDownloadAndInstall` })}</span>
          </label>
        ) : null}
        <DialogFooter
          className={cn(
            `p-0 [app-region:no-drag]`,
            edgeToEdge
              ? cn(`flex-row items-center gap-3`, showSkip ? `justify-between` : `justify-end`)
              : showSkip
                ? `sm:justify-between`
                : `sm:justify-end`,
          )}
        >
          {showSkip ? (
            <div className={cn(`flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row`, edgeToEdge ? `w-auto flex-row` : null)}>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className={`h-9 self-start px-4`}
                disabled={isUpdateActionPending}
                onClick={() => void onSkipUpdate()}
              >
                {intl.formatMessage({ id: `updateDialog.skipVersion` })}
              </Button>
            </div>
          ) : null}
          <div
            className={cn(
              `flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:justify-end`,
              edgeToEdge ? `w-auto flex-row justify-end` : null,
            )}
          >
            {showLater ? (
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className={`h-9 px-4`}
                disabled={isUpdateActionPending}
                onClick={() => onOpenChange(false)}
              >
                {intl.formatMessage({ id: `updateDialog.later` })}
              </Button>
            ) : null}
            {isDownloaded ? (
              <Button
                type="button"
                size="lg"
                className={`h-9 px-4`}
                disabled={isUpdateActionPending}
                onClick={() => void onRestartUpdate()}
              >
                {intl.formatMessage({ id: `updateDialog.restartToUpdate` })}
              </Button>
            ) : isDownloading ? (
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className={`h-9 px-4`}
                disabled={isUpdateActionPending}
                onClick={() => void onCancelDownload()}
              >
                {intl.formatMessage({ id: `updateDialog.cancelDownload` })}
              </Button>
            ) : (
              <Button
                type="button"
                size="lg"
                className={`h-9 px-4`}
                disabled={isUpdateActionPending}
                onClick={() => void onDownloadUpdate()}
              >
                {intl.formatMessage({ id: `updateDialog.downloadAndUpdate` })}
              </Button>
            )}
          </div>
        </DialogFooter>
      </div>
    </>
  );
  return edgeToEdge ? (
    open ? (
      <div role="dialog" aria-modal="true" aria-describedby={undefined} className={contentClass}>
        {body}
      </div>
    ) : null
  ) : (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} showOverlay={showOverlay} showCloseButton={false} className={contentClass}>
        {body}
      </DialogContent>
    </Dialog>
  );
}

/** 原 wOt（styles 129050–129063 / jsx 108590）：标题按版本占位符切分前缀/后缀 */
function splitUpdateDialogTitle({
  displayVersion,
  intl,
  titleId,
}: {
  displayVersion: string;
  intl: IntlShape;
  titleId: string;
}) {
  const placeholder = `__ZCODE_UPDATE_VERSION__`;
  const formatted = intl.formatMessage({ id: titleId }, { version: placeholder });
  const at = formatted.indexOf(placeholder);
  const rawPrefix = at >= 0 ? formatted.slice(0, at) : ``;
  const vPrefix = rawPrefix.endsWith(`v`) ? `v` : ``;
  const prefix = (vPrefix ? rawPrefix.slice(0, -vPrefix.length) : rawPrefix).trim();
  return {
    hasVersion: at >= 0,
    prefix,
    suffix: at >= 0 ? formatted.slice(at + 24).trim() : formatted.trim(),
    versionText: `${vPrefix}${displayVersion}`,
  };
}

/** 原 yq（js 75986+ / jsx 67310）：Progress 条（本 chunk 内共享小件，随族转录） */
export function Progress({
  className,
  indicatorClassName,
  segments,
  value,
  ...rest
}: React.ComponentPropsWithoutRef<"div"> & {
  className?: string;
  indicatorClassName?: string;
  segments?: Array<{ percent: number; className?: string; style?: React.CSSProperties }>;
  value?: number;
}) {
  const clamped = Math.min(Math.max(value ?? 0, 0), 100);
  const segs =
    segments?.map((s) => ({ ...s, percent: Math.min(Math.max(s.percent, 0), 1) })).filter((s) => s.percent > 0) ?? [];
  return (
    <ProgressRoot data-slot="progress" className={cn(`relative flex h-1 w-full items-center overflow-x-hidden rounded-md bg-muted`, className)} {...rest}>
      <ProgressIndicator
        data-slot="progress-indicator"
        className={cn(
          `h-full rounded-full transition-[width]`,
          segs.length > 0 ? `flex overflow-hidden bg-transparent` : `bg-primary`,
          clamped > 0 && indicatorClassName,
        )}
        style={{ width: `${clamped}%` }}
      >
        {segs.map((s, idx) => (
          <span key={idx} aria-hidden="true" className={cn(`h-full shrink-0`, s.className)} style={{ ...s.style, flexBasis: `${s.percent * 100}%` }} />
        ))}
      </ProgressIndicator>
    </ProgressRoot>
  );
}

