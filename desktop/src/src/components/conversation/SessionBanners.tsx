// A0-S4-4b: 自 modules/Conversation.tsx §2 Quota/PendingCommand 横幅子族 原样迁入（组件单元；原文件现为薄 re-export shim）。
// 迁出体 = §2 全段（438–604）。导入路径按 components/conversation/ 深度改指 ../../modules/。
/* eslint-disable */
import * as React from "react";
import { Info as IconInfo } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0
import { BillingDiscountBadge, type BillingDiscountConfig } from '../../modules/UsageDeep'; // 原 BillingDiscount 族（A0-D 类型收敛：+BillingDiscountConfig）
import { useZCodeIntl as useIntlContext, type ZCodeIntl as IntlShape } from '../../modules/I18n'; // 原 G（A0-D 接线：declare → I18n canonical）
import { Button } from '../../modules/button'; // 原 t（A0-D 接线：declare → button canonical）

/** 14. 图标/折扣注记（§0 declare 分配：IconZap/BillingDiscountNote 唯一消费随迁；IconX 三面共用复制，编译期擦除） */
declare const IconX: React.FC<React.SVGProps<SVGSVGElement>>; // Kv / g（关闭）
declare const IconZap: React.FC<React.SVGProps<SVGSVGElement>>; // Pv（quota 升级按钮）
declare const BillingDiscountNote: React.FC<{ config: unknown }>;

/* ============================================================================
 * 2. Quota / PendingCommand 横幅子族（js 94696–94966 / jsx 82817–82966）
 * ==========================================================================*/

/**
 * 配额提示种类 → i18n key 映射（原 fst，jsx 82871）。
 * chat.quota.startPlan.* 一族文案。
 */
const QUOTA_KIND_I18N: Record<string, string> = {
  "model-half-used": `chat.quota.startPlan.modelHalfUsed`,
  "model-low": `chat.quota.startPlan.modelLow`,
  "model-very-low": `chat.quota.startPlan.modelVeryLow`,
  "model-exhausted": `chat.quota.startPlan.modelExhausted`,
  "daily-exhausted": `chat.quota.startPlan.dailyExhausted`,
  "concurrent-limit": `chat.quota.startPlan.concurrentLimit`,
  "provider-limited": `chat.quota.providerLimited`,
};

export interface QuotaBannerState { // 〔A0-S4-4b〕补 export：shim 留守 §9 SessionPaneSnapshot 型别消费（型别擦除，环安全）
  visible: boolean;
  kind: keyof typeof QUOTA_KIND_I18N | "concurrent-limit" | "provider-limited" | null;
  modelName?: string | null;
  remainingTokens?: number | null;
  remainingPercent?: number | null;
  dismissible?: boolean;
  providerLimitedMessage?: string | null;
  concurrentLimitReason?: "retry-exhausted-busy" | string;
  blocksSubmit?: boolean;
}

/** 原 pst（jsx 82880）：并发受限细分两种文案 */
function resolveQuotaMessageId(state: QuotaBannerState): string {
  return state.kind === `concurrent-limit`
    ? state.concurrentLimitReason === `retry-exhausted-busy`
      ? `chat.quota.startPlan.concurrentLimit.retryExhausted`
      : `chat.quota.startPlan.concurrentLimit`
    : state.kind
      ? QUOTA_KIND_I18N[state.kind]
      : ``;
}

/** 原 mst（jsx 82882）：token 数格式化（非有限 → "-"） */
function formatTokenCount(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return `-`;
  return new Intl.NumberFormat().format(Math.max(0, Math.floor(value)));
}

/** 原 hst（jsx 82885）：百分比钳位格式化 */
function formatPercent(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return `-`;
  return `${Math.max(0, Math.min(100, Math.round(value)))}%`;
}

/**
 * 会话配额横幅（原 gst，jsx 82888）。
 * testid `v4-session-quota-banner`；升级按钮圆形胶囊 + 折扣徽章；可关闭。
 */
function SessionQuotaBanner({
  state,
  billingDiscountActive,
  billingDiscountConfig,
  upgradeActionLabelId = `chat.quota.action.upgrade`,
  onUpgrade,
  onDismiss,
}: {
  state: QuotaBannerState;
  billingDiscountActive: boolean | null;
  billingDiscountConfig: BillingDiscountConfig | null;
  upgradeActionLabelId?: string;
  onUpgrade?: () => void;
  onDismiss?: () => void;
}) {
  const { intl } = useIntlContext();
  if (!state.visible || !state.kind) return null;
  const message =
    state.kind === `provider-limited` && state.providerLimitedMessage
      ? state.providerLimitedMessage
      : intl.formatMessage(
          { id: resolveQuotaMessageId(state) },
          {
            model: state.modelName ?? ``,
            remaining: formatTokenCount(state.remainingTokens),
            percent: formatPercent(state.remainingPercent),
          },
        );
  const showDiscount = !!onUpgrade && billingDiscountActive === true;
  return (
    <div className="mb-3 w-full px-4 max-md:px-2" data-testid="v4-session-quota-banner">
      <div className="flex w-full flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 text-ui-base text-foreground">
          <IconInfo className={`size-4 shrink-0`} />
          <div className="min-w-0 break-words">{message}</div>
        </div>
        {onUpgrade ? (
          <div className="inline-flex shrink-0 items-center gap-1">
            <Button type="button" size="sm" className="gap-1.5 rounded-full" onClick={onUpgrade}>
              <IconZap className="size-3.5" />
              {intl.formatMessage({ id: upgradeActionLabelId })}
              {showDiscount ? <BillingDiscountBadge config={billingDiscountConfig ?? undefined} iconVisible={false} variant={`surface`} /> : null}
            </Button>
            {showDiscount ? <BillingDiscountNote config={billingDiscountConfig} /> : null}
          </div>
        ) : null}
        {state.dismissible ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onDismiss}
            aria-label={intl.formatMessage({ id: `common.close` })}
            className="shrink-0 rounded-full text-foreground-subtle hover:text-foreground"
          >
            <IconX className={`size-3.5`} />
          </Button>
        ) : null}
      </div>
    </div>
  );
}

/**
 * 待恢复命令横幅（原 _st，jsx 82927）。
 * 会话重连后被丢弃的输入命令：可重发（input 类）/关闭。chat.pendingCommand.*
 */
const PendingCommandBanner = React.memo(function PendingCommandBanner({
  entry,
  onResend,
  onDismiss,
}: {
  entry: { replay: { kind: "input" | string } };
  onResend?: () => void;
  onDismiss: () => void;
}) {
  const { intl } = useIntlContext();
  const isInput = entry.replay.kind === `input`;
  return (
    <div
      role="status"
      className="mb-3 flex w-full shrink-0 flex-wrap items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-ui-base text-foreground backdrop-blur-md"
    >
      <p className="min-w-0 flex-1">{intl.formatMessage({ id: `chat.pendingCommand.discarded` })}</p>
      {isInput && onResend ? (
        <button
          type="button"
          className="shrink-0 rounded-md bg-primary px-2.5 py-1 text-primary-foreground hover:bg-primary/80"
          onClick={onResend}
        >
          {intl.formatMessage({ id: `chat.pendingCommand.resend` })}
        </button>
      ) : null}
      <button type="button" className="shrink-0 rounded-md px-2 py-1 text-foreground-subtle hover:bg-hover" onClick={onDismiss}>
        {intl.formatMessage({ id: `chat.pendingCommand.dismiss` })}
      </button>
    </div>
  );
});

/** 原 vst（jsx ~82972）：长任务耗时文案（chat.longRunning.elapsed*） */
function formatLongRunningElapsed(elapsedMs: number, formatMessage: IntlShape["formatMessage"]): string {
  const totalSeconds = Math.max(1, Math.floor(elapsedMs / 1e3));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0
    ? formatMessage({ id: `chat.longRunning.elapsedMinutesSeconds` }, { minutes: String(minutes), seconds: String(seconds) })
    : formatMessage({ id: `chat.longRunning.elapsedSeconds` }, { seconds: String(seconds) });
}

/* 〔A0-S4-4b〕补导出块：原经 Conversation.tsx 文件尾 §9.7 导出块对外，迁出后于属主文件本地导出（体不动）。 */
export { SessionQuotaBanner, PendingCommandBanner };
