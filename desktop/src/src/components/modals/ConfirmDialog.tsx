// A0-S4-4a: 自 modules/Modals.tsx 确认/警告对话框子族 + 模态宿主（§5）原样迁入（组件单元；原文件现为薄 re-export shim）。
// 迁出体 = 原文件 5132–5392；§0 IconX declare（原 170–171）与 TESTID_CONFIRM_DIALOG_CONFIRM（原 316–317）随族迁入。
import * as React from "react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { Button } from '../../modules/button'; // 原 X，button-laUijeDG.js（A0-D 接线：declare → button canonical）
import { cn } from '../../modules/UtilsCn'; // 原 Z，utils-CEEH0K_K.js（A0-D 接线：declare → UtilsCn canonical）
import { create as zustandCreate, logger } from '../../modules/SkillStore'; // +Ae（A0-S2d 接线：原 zustandCreate declare → SkillStore q 导出 = vendored zustand create）
import { useZCodeIntl as useIntlContext } from '../../modules/I18n'; // 原 G，IntlProvider-C321H7m8.js（A0-D 接线：declare → I18n canonical）

/* §0 声明群随族迁入（原 170–171 / 316–317） */
/** 关闭图标（原 g，button chunk） */
declare const IconX: React.FC<{ className?: string; strokeWidth?: number }>;
/** testid 常量（src-HCld2afU.js：8463 行 Mb） */
const TESTID_CONFIRM_DIALOG_CONFIRM = "confirm-dialog-confirm"; // 原 mee

/* ============================================================================
 * 5. 确认 / 警告对话框子族 + 模态宿主（任务删除/归档确认的呈现侧）
 * ----------------------------------------------------------------------------
 * 任务删除/归档确认 = 本族 ConfirmDialog（q4t）+ 各触发入口：
 *  - 归档确认（会话头更多菜单）：wFt 内 js 143661-143673（TopBar.tsx 已含调用点）
 *    key：confirmDialog.taskArchiveTitle / taskArchiveDescription，confirm=taskList.archive
 *  - 归档任务删除（侧栏归档平铺段 lLt，js 147005-147046 / jsx 122315）：
 *    key：confirmDialog.archivedTaskDeleteTitle / archivedTaskDeleteDescription，
 *    confirm=行 title（taskList.delete）；成功后 zcodeTaskService.deleteTask + sLt 清理
 *  - 归档远控任务删除（web 远控任务索引 mLt，js 147510-147546 / jsx 122463 内）：同 key
 *  - 词典另有 confirmDialog.taskDeleteTitle / taskDeleteDescription /
 *    projectRemoveTitle / projectRemoveDescription（IntlProvider 1083-1084 行附近），
 *    本 chunk 无调用点（移动端/历史入口），仅登记。
 * ==========================================================================*/

export interface ConfirmDialogRequest {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "default" | "destructive";
  compact?: boolean;
  showCloseButton?: boolean;
  showKeyboardHints?: boolean;
  presentation?: "automation-confirmation" | undefined;
  resolve?: (confirmed: boolean) => void;
}

/** zustand store 形状（原 Ae=create，skillStore-BmeKHDBI.js 的 q 导出） */
/* ── tombstone（A0-S2d）：zustandCreate declare 与本地 ZustandStore 接口已删除，
 *    canonical = SkillStore.tsx vendored zustand create（原 q 导出，styles 侧 Ae），
 *    经文件头真实 import 消费；本文件消费面均为选择器调用，形状兼容。 ── */

interface ConfirmDialogStoreState {
  pendingRequest: ConfirmDialogRequest | undefined;
  requestConfirmation(req: Omit<ConfirmDialogRequest, "resolve">): Promise<boolean>;
  settleConfirmation(confirmed: boolean): void;
}

/** 原 H2（js 123480-123492 / jsx 105205）：确认对话框 store（单飞 + Promise 结算） */
const ConfirmDialogStore = zustandCreate<ConfirmDialogStoreState>((set, get) => ({
  pendingRequest: undefined,
  requestConfirmation: (request) =>
    get().pendingRequest
      ? (logger.warn(`[ConfirmDialogStore] confirmation already in progress`), Promise.resolve(false))
      : new Promise<boolean>((resolve) => {
          set({ pendingRequest: { ...request, resolve } });
        }),
  settleConfirmation: (confirmed) => {
    const pending = get().pendingRequest;
    if (pending) {
      set({ pendingRequest: undefined });
      pending.resolve?.(confirmed);
    }
  },
}));

/** 原 U2（js 123493-123495 / jsx 105222）：useConfirmDialog */
export function useConfirmDialog(): (
  request: Omit<ConfirmDialogRequest, "resolve">,
) => Promise<boolean> {
  return ConfirmDialogStore((state) => state.requestConfirmation);
}

export interface AlertDialogRequest {
  title: string;
  description?: string;
  actionLabel?: string;
  resolve?: () => void;
}

interface AlertDialogStoreState {
  pendingRequest: AlertDialogRequest | undefined;
  requestAlert(req: Omit<AlertDialogRequest, "resolve">): Promise<void>;
  settleAlert(): void;
}

/** 原 N9（js 206514-206526 / jsx 164300）：警告对话框 store */
const AlertDialogStore = zustandCreate<AlertDialogStoreState>((set, get) => ({
  pendingRequest: undefined,
  requestAlert: (request) =>
    get().pendingRequest
      ? (logger.warn(`[AlertDialogStore] alert already in progress`), Promise.resolve())
      : new Promise<void>((resolve) => {
          set({ pendingRequest: { ...request, resolve } });
        }),
  settleAlert: () => {
    const pending = get().pendingRequest;
    if (pending) {
      set({ pendingRequest: undefined });
      pending.resolve?.();
    }
  },
}));

/** 原 $3t（js 209650-209652 / jsx 166685）：useAlertDialog */
export function useAlertDialog(): (request: Omit<AlertDialogRequest, "resolve">) => Promise<void> {
  return AlertDialogStore((state) => state.requestAlert);
}

/** 原 G4t（js 206527-206570 / jsx 164317）：警告对话框（单按钮 + ⏎ 提示） */
function AlertDialog() {
  const { intl } = useIntlContext();
  const pending = AlertDialogStore((state) => state.pendingRequest);
  const settle = AlertDialogStore((state) => state.settleAlert);
  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      if (!open) settle();
    },
    [settle],
  );
  return (
    <Dialog open={!!pending} onOpenChange={handleOpenChange}>
      <DialogContent className={`gap-5`}>
        <DialogHeader className={`gap-2`}>
          <DialogTitle>{pending?.title}</DialogTitle>
          {pending?.description ? <DialogDescription>{pending.description}</DialogDescription> : null}
        </DialogHeader>
        <DialogFooter className={`gap-2 sm:justify-end`}>
          <Button onClick={settle} size="lg" className={cn(`h-9 justify-between gap-3 sm:min-w-32`)}>
            <span>{pending?.actionLabel ?? intl.formatMessage({ id: `common.confirm` })}</span>
            <span className={`text-ui-base text-primary-foreground/60`}>⏎</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** 原 K4t（js 206571 / jsx 164352） */
const AUTOMATION_CONFIRM_DIALOG_CLASS = `min-h-[180px] w-[min(448px,calc(100vw-2rem))] max-w-none`;

/**
 * 原 q4t（js 206572-206703 / jsx 164353）：确认对话框。
 * 打开期间 window 级 Enter 捕获确认；esc/⏎ 键帽提示可关（showKeyboardHints）。
 * presentation=`automation-confirmation` 时加宽 + 描述 line-clamp-3。
 */
export function ConfirmDialog() {
  const { intl } = useIntlContext();
  const pending = ConfirmDialogStore((state) => state.pendingRequest);
  const settle = ConfirmDialogStore((state) => state.settleConfirmation);
  const lastRequestRef = React.useRef<ConfirmDialogRequest | undefined>(pending);
  if (pending) lastRequestRef.current = pending;
  const request = pending ?? lastRequestRef.current;
  const open = !!pending;
  const isAutomationPresentation = request?.presentation === `automation-confirmation`;
  const confirmLabel = request?.confirmLabel ?? intl.formatMessage({ id: `common.confirm` });
  const cancelLabel = request?.cancelLabel ?? intl.formatMessage({ id: `common.cancel` });
  const compact = request?.compact === true;
  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (!next) settle(false);
    },
    [settle],
  );
  const handleConfirm = React.useCallback(() => {
    settle(true);
  }, [settle]);
  React.useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === `Enter`) {
        event.preventDefault();
        event.stopPropagation();
        settle(true);
      }
    }
    window.addEventListener(`keydown`, onKeyDown, true);
    return () => {
      window.removeEventListener(`keydown`, onKeyDown, true);
    };
  }, [open, settle]);
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName={compact ? `bg-black/20 supports-backdrop-filter:backdrop-blur-[2px]` : undefined}
        className={cn(
          `gap-5 rounded-2xl border-none bg-popover/98 p-5 ring-border shadow-2xl`,
          isAutomationPresentation ? AUTOMATION_CONFIRM_DIALOG_CLASS : `sm:max-w-md`,
          request?.compact && `top-[44%] min-h-[161px] gap-4 sm:max-w-[400px]`,
        )}
      >
        <DialogHeader className={`gap-2`}>
          <DialogTitle className={`text-ui-lg font-semibold text-foreground`}>{request?.title}</DialogTitle>
          {request?.description ? (
            <DialogDescription
              className={cn(
                `whitespace-pre-line pt-0.5 text-ui-base leading-6 text-foreground-subtle`,
                isAutomationPresentation && `line-clamp-3 break-words whitespace-pre-line`,
              )}
            >
              {request.description}
            </DialogDescription>
          ) : null}
        </DialogHeader>
        <DialogFooter className={cn(`gap-2 sm:justify-end`, isAutomationPresentation && `mt-auto`)}>
          <Button
            type="button"
            variant={compact ? `outline` : `secondary`}
            size="lg"
            onClick={() => settle(false)}
            className={cn(`h-9 gap-3 px-4`, request?.showKeyboardHints !== false && `justify-between sm:min-w-28`)}
          >
            <span>{cancelLabel}</span>
            {request?.showKeyboardHints === false ? null : (
              <span className={`font-mono text-ui-base text-foreground-subtle`}>esc</span>
            )}
          </Button>
          <Button
            type="button"
            autoFocus
            variant={request?.confirmVariant ?? `default`}
            size="lg"
            data-testid={TESTID_CONFIRM_DIALOG_CONFIRM}
            onClick={handleConfirm}
            className={cn(`h-9 gap-3 px-4`, request?.showKeyboardHints !== false && `justify-between sm:min-w-32`)}
          >
            <span>{confirmLabel}</span>
            {request?.showKeyboardHints === false ? null : (
              <span
                className={
                  request?.confirmVariant === `destructive`
                    ? `text-ui-base text-destructive-foreground/60`
                    : `text-ui-base text-primary-foreground/60`
                }
              >
                ⏎
              </span>
            )}
          </Button>
        </DialogFooter>
        {request?.showCloseButton ? (
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={intl.formatMessage({ id: `common.close` })}
              className={`absolute right-5 top-5 z-20 text-foreground-subtle hover:bg-surface-hover hover:text-foreground [app-region:no-drag]`}
            >
              <IconX className={`size-4`} strokeWidth={4 / 3} />
            </Button>
          </DialogClose>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

/** 原 P9（js 206704-206710 / jsx 164396）：模态宿主——全窗口壳挂 G4t + q4t */
export function AppDialogHost({ children }: { children?: React.ReactNode }) {
  return (
    <div className={`relative h-dvh`}>
      {children}
      <AlertDialog />
      <ConfirmDialog />
    </div>
  );
}

