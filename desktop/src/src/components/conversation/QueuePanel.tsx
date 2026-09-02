// A0-S4-4b: 自 modules/Conversation.tsx §3 Queue 子族（消息队列面板）原样迁入（组件单元；原文件现为薄 re-export shim）。
// 迁出体 = §3 全段（605–909，含内联 dnd-kit declare 8 件）。导入路径按 components/conversation/ 深度改指 ../../modules/。
/* eslint-disable */
import * as React from "react";
import { GripVertical as IconGripVertical, ArrowUpFromLine as IconSend, Pencil as IconPencil, Trash2 as IconTrash } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0；〔A1-P1-B17〕+Trash2 as IconTrash（原 Kv=Sa('trash-2')@27930；bundle 94737 queue 删除钮）——原 IconX declare 删碑改指，见下
import { InfoTooltip as Tooltip } from '../../modules/UsageStatsUiParts'; // 原 Ia（usageStatsUiParts u 导出 = X InfoTooltip）
import { useZCodeIntl as useIntlContext, type ZCodeIntl as IntlShape } from '../../modules/I18n'; // 原 G（A0-D 接线：declare → I18n canonical）
import { Button } from '../../modules/button'; // 原 t（A0-D 接线：declare → button canonical）
import { cn } from '../../modules/UtilsCn'; // 原 Z（A0-D 接线：declare → UtilsCn canonical）

/** 14. 图标（§0 declare 分配：IconX 三面共用复制，编译期擦除） */
/* ── tombstone〔A1-P1-B17〕：declare const IconX（登记「Kv / g（关闭）」）删除 → npm lucide-react
 * Trash2 as IconTrash。束真身实证：本面唯一消费位 = queue 删除钮 @212 ≡ bundle 94737
 * `(0,$.jsx)(Kv, { className: 'size-4' })`（aria-label chat.queue.remove + data-queue-item-id 双证）；
 * Kv = Sa('trash-2')@27930，非 x 图标。「三面共用」登记更正：本面实为 trash-2（删除），
 * SessionBanners/Conversation 关闭钮方为 g=x——各自删碑见其文件。消费位改名 IconX→IconTrash
 * （语义勘误：原登记 IconX 与束形 trash-2 不符；渲染面由 declare 未定义引用 → 真身 trash-2，行为修正）。 ── */

/* ============================================================================
 * 3. Queue 子族（消息队列面板；js 94545–94801 / jsx 82736–82869）
 *    follow-up 消息在「排队模式」下进入此队列（followupMode: queue|guide，
 *    composer placeholder 用 chat.placeholder.followUpQueue / followUpAsk）。
 * ==========================================================================*/

interface QueueItem {
  queueItemId: string;
  kind: "text" | "compact" | string;
  text: string;
  sourceCommandId?: string;
  dispatch: { state: "queued" | "dispatched" | string };
}
export interface QueueState { // 〔A0-S4-4b〕补 export：shim 留守 §9 SessionQueueSnapshot extends 消费（型别擦除，环安全）
  items: QueueItem[];
  autoDrain: boolean;
  pauseReason?: "stopped" | "generic" | string;
}

/**
 * 原 sst（js 94545 / jsx 82736）：把 dnd-kit 拖拽结果换算成
 * 「把 queueItemId 移到 beforeQueueItemId 之前」的 reorder 命令参数。
 */
function computeQueueReorderMove(
  items: QueueItem[],
  activeQueueItemId: string,
  overQueueItemId: string,
): { queueItemId: string; beforeQueueItemId: string | null } | null {
  if (overQueueItemId === activeQueueItemId) return null;
  const fromIndex = items.findIndex((item) => item.queueItemId === activeQueueItemId);
  const overIndex = items.findIndex((item) => item.queueItemId === overQueueItemId);
  if (fromIndex < 0 || overIndex < 0) return null;
  if (fromIndex < overIndex) {
    const withoutActive = items.filter((item) => item.queueItemId !== activeQueueItemId);
    return {
      beforeQueueItemId: withoutActive[withoutActive.findIndex((item) => item.queueItemId === overQueueItemId) + 1]?.queueItemId ?? null,
      queueItemId: activeQueueItemId,
    };
  }
  return { beforeQueueItemId: overQueueItemId, queueItemId: activeQueueItemId };
}

/* dnd-kit（vendored 于本 chunk js 91850–94592，VENDOR-MANIFEST-LIBS 241 号条目；以下 8 枚 = 边界占位 declare，
 * KX 模式不转录；类型面 = QueuePanel 消费面。〔A1-R101〕裁定引据补登） */
declare function useSortable(opts: { id: string; disabled?: boolean }): {
  attributes: Record<string, unknown>;
  listeners: Record<string, unknown>;
  setActivatorNodeRef: (el: HTMLElement | null) => void;
  setNodeRef: (el: HTMLElement | null) => void;
  transform: { x: number; y: number; scaleX: number; scaleY: number } | null;
  transition: string | undefined;
  isDragging: boolean;
};
declare const DndContext: React.FC<{
  sensors: unknown;
  collisionDetection: unknown;
  modifiers: unknown[];
  onDragEnd: (event: { over?: { id: string | number } | null; active: { id: string | number } }) => void;
  children?: React.ReactNode;
}>;
declare const SortableContext: React.FC<{ items: string[]; strategy: unknown; children?: React.ReactNode }>;
declare const verticalListSortingStrategy: unknown;
declare const closestCenterCollision: unknown;
declare function usePointerSensor(opts?: { activationConstraint?: { distance?: number } }): unknown;
declare function useSensors(...sensors: unknown[]): unknown[];
/* ── tombstone〔A1-R101〕：declare restrictToVerticalAxisModifier（原 cst 94607–94620）删除——逐字实体化于下方。
 *    first-party 裁定依据：VENDOR-MANIFEST-LIBS 241 号条目（R49 补登）——94607 cst 属 first-party 包装层
 *    （与 sst@94545 ≡ computeQueueReorderMove 上方既实体化、lst@94621 ≡ QueueItemRow 下方同层）。 ── */
/* ── 原 cst（js 94607–94620）→ restrictToVerticalAxisModifier：纵轴钳制 modifier（y 钳入容器，x 恒 0）〔A1-R101 逐字实体化〕 ── */
const restrictToVerticalAxisModifier = ({
    transform: e,
    draggingNodeRect: t,
    activeNodeRect: n,
    containerNodeRect: r,
    windowRect: i,
  }: any) => { // 〔A1-R101〕型缝：解构参束原形无型
    let a = t ?? n,
      o = r ?? i;
    if (!a || !o) return { ...e, x: 0 };
    let s = o.top - a.top,
      c = o.bottom - a.bottom;
    return { ...e, x: 0, y: Math.min(Math.max(e.y, s), c) };
  };

/**
 * 队列单项（原 lst，js 94573 / jsx 82753）。
 * 拖拽手柄（chat.queue.drag）+ 文本 + 立即发送（runNow/sendNow）+ 编辑 + 删除。
 * /compact 项以等宽字体显示且不可编辑。
 */
const QueueItemRow = React.memo(function QueueItemRow({
  item,
  index,
  intl,
  sortable,
  onDeleteItem,
  onEditItem,
  onSendNow,
  editPending,
}: {
  item: QueueItem;
  index: number;
  intl: IntlShape;
  sortable: boolean;
  onDeleteItem?: (queueItemId: string) => void;
  onEditItem?: (queueItemId: string) => void | Promise<void>;
  onSendNow?: (queueItemId: string) => void;
  editPending: boolean;
}) {
  const locked = item.dispatch.state !== `queued` || editPending;
  const isCompact = item.kind === `compact`;
  const { attributes, isDragging, listeners, setActivatorNodeRef, setNodeRef, transform, transition } = useSortable({
    disabled: !sortable || locked,
    id: item.queueItemId,
  });
  const style = React.useMemo(
    () => ({
      transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0) scale(1, 1)` : undefined,
      transition,
      zIndex: isDragging ? 10 : undefined,
    }),
    [isDragging, transform, transition],
  );
  return (
    <li
      ref={setNodeRef}
      data-testid={`v4-queue-item:${item.queueItemId}`}
      data-queue-item-id={item.queueItemId}
      data-index={index}
      data-kind={item.kind}
      data-dispatch-state={item.dispatch.state}
      data-edit-pending={editPending ? `true` : `false`}
      className={cn(
        `relative flex items-center gap-2 rounded-xl px-1.5 py-1 pr-1 transition-colors hover:bg-hover/30`,
        isDragging ? `bg-hover/40 shadow-sm` : null,
        editPending ? `opacity-60` : null,
      )}
      style={style}
    >
      <Tooltip title={intl.formatMessage({ id: `chat.queue.drag` })}>
        <Button
          ref={setActivatorNodeRef as unknown as React.Ref<HTMLButtonElement>}
          type="button"
          variant="ghost"
          size="icon-md"
          data-v4-queue-drag-handle="true"
          data-queue-item-id={item.queueItemId}
          aria-label={intl.formatMessage({ id: `chat.queue.drag` })}
          className="shrink-0 cursor-grab touch-none text-foreground-subtlest active:cursor-grabbing"
          disabled={locked}
          {...attributes}
          {...listeners}
        >
          <IconGripVertical className={`size-4`} />
        </Button>
      </Tooltip>
      <span
        className={cn(`flex min-w-0 flex-1 items-center gap-2 truncate text-ui-base text-foreground`, isCompact ? `font-mono` : null)}
        title={item.text}
      >
        <span className="truncate">{isCompact ? `/compact` : item.text}</span>
      </span>
      {onSendNow ? (
        <Button
          type="button"
          variant="secondary"
          size="default"
          data-icon="inline-start"
          data-testid={`v4-queue-send-now:${item.queueItemId}`}
          data-queue-item-id={item.queueItemId}
          disabled={locked}
          onClick={() => onSendNow(item.queueItemId)}
        >
          <IconSend className={`size-3.5`} />
          {intl.formatMessage({ id: isCompact ? `chat.queue.runNow` : `chat.queue.sendNow` })}
        </Button>
      ) : null}
      {onEditItem && !isCompact ? (
        <Tooltip title={intl.formatMessage({ id: `chat.queue.edit` })}>
          <Button
            type="button"
            variant="ghost"
            size="icon-md"
            data-testid={`v4-queue-edit:${item.queueItemId}`}
            data-queue-item-id={item.queueItemId}
            aria-label={intl.formatMessage({ id: `chat.queue.edit` })}
            disabled={locked}
            onClick={() => void onEditItem(item.queueItemId)}
          >
            <IconPencil className="size-4" />
          </Button>
        </Tooltip>
      ) : null}
      {onDeleteItem ? (
        <Tooltip title={intl.formatMessage({ id: `chat.queue.remove` })}>
          <Button
            type="button"
            variant="ghost"
            size="icon-md"
            data-testid={`v4-queue-remove:${item.queueItemId}`}
            data-queue-item-id={item.queueItemId}
            aria-label={intl.formatMessage({ id: `chat.queue.remove` })}
            disabled={locked}
            onClick={() => onDeleteItem(item.queueItemId)}
          >
            <IconTrash className="size-4" />
          </Button>
        </Tooltip>
      ) : null}
    </li>
  );
});

/**
 * 队列面板（原 ust，js 94696 / jsx 82817；memo 名 dst，js 94801 / jsx 82869）。
 * 挂在 composer dock 上方：`rounded-t-2xl -mb-7 pb-7` 与输入区咬合。
 * 非自动排水（暂停）时先显示恢复横幅（chat.queue.paused.*），
 * 列表用 dnd-kit 垂直排序（拖拽重排 → reorderQueueItem 命令）。
 */
function QueuePanel({
  queue,
  onDeleteItem,
  onEditItem,
  pendingEditQueueItemId = null,
  onSendNow,
  onMoveItem,
  onResume,
}: {
  queue: QueueState;
  onDeleteItem?: (queueItemId: string) => void;
  onEditItem?: (queueItemId: string) => void | Promise<void>;
  pendingEditQueueItemId?: string | null;
  onSendNow?: (queueItemId: string) => void;
  onMoveItem?: (queueItemId: string, beforeQueueItemId: string | null) => void;
  onResume?: () => Promise<void>;
}) {
  const { intl } = useIntlContext();
  const [resuming, setResuming] = React.useState(false);
  const sensors = useSensors(usePointerSensor({ activationConstraint: { distance: 6 } }));
  const itemIds = React.useMemo(() => queue.items.map((item) => item.queueItemId), [queue.items]);
  const handleDragEnd = React.useCallback(
    (event: { over?: { id: string | number } | null; active: { id: string | number } }) => {
      const overId = event.over?.id;
      if (!overId) return;
      const move = computeQueueReorderMove(queue.items, String(event.active.id), String(overId));
      if (move) onMoveItem?.(move.queueItemId, move.beforeQueueItemId);
    },
    [onMoveItem, queue.items],
  );
  const handleResume = React.useCallback(async () => {
    if (!onResume || resuming) return;
    setResuming(true);
    try {
      await onResume();
    } finally {
      setResuming(false);
    }
  }, [onResume, resuming]);
  if (queue.items.length === 0) return null;
  return (
    <div
      data-testid="v4-conversation-queue"
      data-queue-count={queue.items.length}
      data-queue-auto-drain={queue.autoDrain ? `true` : `false`}
      className={cn(
        `relative z-0 w-full overflow-hidden rounded-t-2xl border border-border bg-surface p-1 backdrop-blur-md`,
        `-mb-7 pb-7`,
      )}
    >
      {queue.autoDrain ? null : (
        <div
          data-testid="v4-queue-paused-banner"
          className="mb-1 flex min-h-10 items-center gap-3 rounded-xl border border-border/70 bg-surface-raised px-3 py-2 text-ui-base text-foreground"
        >
          <span className="min-w-0 flex-1">
            {intl.formatMessage({ id: queue.pauseReason === `stopped` ? `chat.queue.paused.stopped` : `chat.queue.paused.generic` })}
          </span>
          {onResume ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              data-testid="v4-queue-resume"
              aria-label={intl.formatMessage({ id: `chat.queue.resume.description` })}
              disabled={resuming}
              className="shrink-0 text-foreground-subtle hover:text-foreground"
              onClick={() => void handleResume()}
            >
              {intl.formatMessage({ id: `chat.queue.resume` })}
            </Button>
          ) : null}
        </div>
      )}
      <DndContext sensors={sensors} collisionDetection={closestCenterCollision} modifiers={[restrictToVerticalAxisModifier]} onDragEnd={handleDragEnd}>
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          <ul className="space-y-0.5">
            {queue.items.map((item, index) => (
              <QueueItemRow
                key={item.queueItemId}
                item={item}
                index={index}
                intl={intl}
                sortable={!!onMoveItem}
                onDeleteItem={onDeleteItem}
                onEditItem={onEditItem}
                onSendNow={onSendNow}
                editPending={pendingEditQueueItemId === item.queueItemId}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}
const MemoQueuePanel = React.memo(QueuePanel);

/* 〔A0-S4-4b〕补导出块：原经 Conversation.tsx 文件尾 §9.7 导出块对外（QueuePanel/QueueItemRow）；MemoQueuePanel 原即模块私有，§9 渲染点经下方 export 取回。 */
export { QueuePanel, QueueItemRow, MemoQueuePanel };
