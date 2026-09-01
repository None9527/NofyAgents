// A0-S4-4b: 自 modules/Composer.tsx [D] ConfigSelect + 思考级别解析族 原样迁入（组件单元；原文件现为薄 re-export shim）。
// 迁出体 = [D] 全段（8742–9132）+ §0 testid 常量 THOUGHT_LEVEL_*（771–772，本族独占消费）。
// MODE_LABEL_I18N/MODE_DESCRIPTION_I18N/MODE_SELECT_ITEM_TESTID 属主为 ModelSelector 族文件（原 [C] 段），经下方 import 取回；
// testidOf/isCoarseTouchDevice/shouldRestoreFocus 留守 shim，经 import 取回。
// 导入路径按 components/composer/ 深度改指 ../../modules/。
/* eslint-disable */
import * as React from "react";
import { Select as SelectRoot, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../modules/Settings'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { Hand as HandIcon, ShieldCheck as ShieldCheckIcon, ChevronDown as ChevronDownIcon, ShieldAlert as ShieldAlertIcon } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0
import { logger } from '../../modules/SkillStore';
import { InfoTooltip as TooltipRoot } from '../../modules/UsageStatsUiParts'; // 原 Ia（A0-D 接线 + A0-CLEANUP2 item 47）
import { useZCodeIntl as useIntlContext, type ZCodeIntl as IntlShape } from '../../modules/I18n'; // 原 G（A0-D 接线：declare → I18n canonical）
import { cn } from '../../modules/UtilsCn'; // 原 Z（A0-D 接线：declare → UtilsCn canonical）
import { MODE_LABEL_I18N, MODE_DESCRIPTION_I18N, MODE_SELECT_ITEM_TESTID, AnimatedLabel } from './ModelSelector'; // 原 [C] 段私常量/表，属主补 export 后取回
import { isCoarseTouchDevice, shouldRestoreFocus, MODE_TRIGGER_TESTID } from '../../modules/Composer'; // shim 留守运行时助手/testid（函数声明提升，渲染期访问，环安全）
import { joinTestidParts } from '../../modules/SrcSharedB'; // 原 qr（R41 既判 ≡ SrcSharedB@5015；B13 Home/ModelSelector 同形收敛先例）〔A1-P3-B14〕testidOf 重复转录面收敛改指

/** 14. 图标（本 chunk 图标块 = lucide vendored 登记；语义按消费点命名） */
declare const PlanIcon: React.ComponentType<{ className?: string }>;

/** 15. testid 常量（src-HCld2afU.js，B5-11；值已回代核实，见原文件头） */
const THOUGHT_LEVEL_TRIGGER_TESTID = `chat-thought-level-select-trigger`;
const THOUGHT_LEVEL_ITEM_TESTID = `chat-thought-level-select-item`;

/* ============================================================================
 * [D] js 76849–77167 —— ConfigSelect + 思考级别解析族
 *      （Mq 闭包 76911–77060 跨登记段 77014 起点；W3e/G3e/…X3e 止于 77167
 *        跨 77079 终点；整表随族收录，裁决 §R3）
 * ========================================================================== */

/** 配置选择器形状（语义归纳；中把握度）
 *  （A0-S2d 补导出：PaymentDeep 类型垫片引用） */
export interface ConfigSelectOption {
  value: string;
  name: string;
  description?: string;
}
export interface ConfigSelectSpec {
  type: string;
  category?: string;
  options?: ConfigSelectOption[];
  currentValue?: string;
}

/** M3e → isOptionValue（js 76848） */
function isOptionValue(spec: ConfigSelectSpec, value: string): boolean {
  return spec.options?.some((option) => String(option.value) === value) ?? false;
}

/** N3e → DANGEROUS_MODE_VALUES（js 76852） */
const DANGEROUS_MODE_VALUES = new Set([`bypassPermissions`, `full-access`, `agent-full-access`, `yolo`]);

/** P3e → configSelectTestId（js 76853） */
function configSelectTestId(spec: ConfigSelectSpec): string | undefined {
  if (spec.category === `thought_level`) return THOUGHT_LEVEL_TRIGGER_TESTID;
  if (spec.category === `mode`) return MODE_TRIGGER_TESTID;
}

/** F3e → configOptionTestId（js 76857；〔A1-P3-B14〕bundle 76857/76858 `qr(Xt|rn, t.value)` 逐字改指 joinTestidParts：
 *  Xt←styles 490 `Hn as Xt`←src 9720 `Mv as Hn`≡Mv@8355；rn←styles 497 `In as rn`←src 9727 `Pv as In`≡Pv@8357） */
function configOptionTestId(spec: ConfigSelectSpec, option: ConfigSelectOption): string | undefined {
  if (spec.category === `thought_level`) return joinTestidParts(THOUGHT_LEVEL_ITEM_TESTID, option.value);
  if (spec.category === `mode`) return joinTestidParts(MODE_SELECT_ITEM_TESTID, option.value);
}

/** I3e → ApiRetryIndicator（js 76862） */
function ApiRetryIndicator({ apiRetry, intl, locale }: {
  apiRetry?: { attempt: number; maxRetries: number; errorStatus?: number | null } | null;
  intl: IntlShape;
  locale: string;
}): React.ReactElement | null {
  const statusText = React.useMemo(() => {
    if (!apiRetry) return null;
    const numberFormat = new Intl.NumberFormat(locale);
    return intl.formatMessage(
      { id: `chat.apiRetryStatus` },
      { attempt: numberFormat.format(apiRetry.attempt), maxRetries: numberFormat.format(apiRetry.maxRetries) },
    );
  }, [apiRetry, intl, locale]);
  return !apiRetry || !statusText
    ? null
    : (
      <span
        className={`inline-flex h-7 items-center whitespace-nowrap px-1 text-ui-base`}
        title={apiRetry.errorStatus == null ? statusText : `${statusText} · HTTP ${apiRetry.errorStatus}`}
      >
        <span className={`animated-gradient-text animated-gradient-text-subtle font-medium`}>{statusText}</span>
      </span>
    );
}

/** L3e → modeOptionLabel（js 76880） */
function modeOptionLabel(intl: IntlShape, provider: string | undefined, option: ConfigSelectOption): string {
  const i18nId = modeLabelI18nId(provider, option);
  return i18nId ? intl.formatMessage({ id: i18nId }) : option.name;
}

/** R3e → modeLabelI18nId（js 76883） */
function modeLabelI18nId(provider: string | undefined, option: ConfigSelectOption): string | null {
  return provider ? (MODE_LABEL_I18N[provider]?.[option.value] ?? null) : null;
}

/** z3e → modeDescriptionI18nId（js 76886） */
function modeDescriptionI18nId(provider: string | undefined, option: ConfigSelectOption): string | null {
  return provider ? (MODE_DESCRIPTION_I18N[provider]?.[option.value] ?? null) : null;
}

/** jq → configOptionLabel（js 76889） */
function configOptionLabel(intl: IntlShape, provider: string | undefined, spec: ConfigSelectSpec, option: ConfigSelectOption): string {
  return spec.category === `mode` ? modeOptionLabel(intl, provider, option) : option.name;
}

/** B3e → configOptionDescription（js 76892） */
function configOptionDescription(intl: IntlShape, provider: string | undefined, spec: ConfigSelectSpec, option: ConfigSelectOption): string | undefined {
  if (spec.category !== `mode`) return option.description;
  const i18nId = modeDescriptionI18nId(provider, option);
  return i18nId ? intl.formatMessage({ id: i18nId }) : option.description;
}

/** V3e → isDangerousModeValue（js 76897） */
function isDangerousModeValue(value: unknown): boolean {
  return typeof value == `string` && DANGEROUS_MODE_VALUES.has(value);
}

/** H3e → modeOptionIcon（js 76900） */
function modeOptionIcon(value: unknown): React.ComponentType<{ className?: string }> {
  return isDangerousModeValue(value)
    ? ShieldAlertIcon
    : typeof value == `string` && /^(default|build)$/i.test(value)
      ? HandIcon
      : typeof value == `string` && value.toLocaleLowerCase() === `plan`
        ? PlanIcon
        : typeof value == `string` && /^(auto|acceptEdits|agent|autoEdit|dontAsk|edit)$/i.test(value)
          ? ShieldCheckIcon
          : HandIcon;
}

/** Mq → ConfigSelect（js 76911）
 *  （A0-S2d 补导出：PaymentDeep.tsx 去重 76848–77167 双归属后真实 import 消费） */
export function ConfigSelect({
  option,
  onValueChange,
  open,
  onOpenChange,
  disabled,
  tooltipTitle,
  shortcutLabel,
  triggerRef,
  triggerClassName,
  indicatorClassName,
  triggerVariant = `ghost`,
  triggerSize = `lg`,
  leadingIcon,
  labelVisibilityClassName = `hidden @xl/composer:inline-flex`,
  provider,
  restoreFocusSelector = `[data-testid="chat-input"]`,
}: {
  option: ConfigSelectSpec;
  onValueChange: (value: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  tooltipTitle?: string;
  shortcutLabel?: string;
  triggerRef?: { current: HTMLElement | null };
  triggerClassName?: string;
  indicatorClassName?: string;
  triggerVariant?: "input" | "default" | "outline" | "secondary" | "ghost" | "destructive"; // A0-D 收敛：对齐 Settings SelectTrigger variant 值域（调用面均为字面量）
  triggerSize?: "xs" | "sm" | "default" | "lg"; // A0-D 收敛：对齐 Settings SelectTrigger size 值域
  leadingIcon?: React.ComponentType<{ className?: string }>;
  labelVisibilityClassName?: string;
  provider?: string;
  restoreFocusSelector?: string;
}): React.ReactElement | null {
  const { intl } = useIntlContext();
  const handleTabNavigation = React.useCallback((event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key !== `Tab`) return;
    const target =
      event.currentTarget.querySelector(`[data-slot="select-item"][data-highlighted]`) ??
      event.currentTarget.querySelector(`[data-slot="select-item"][data-state="checked"]`) ??
      event.currentTarget.querySelector(`[data-slot="select-item"]`);
    target && (event.preventDefault(), (target as HTMLElement).click());
  }, []);
  if (option.type !== `select` || !option.options?.length) return null;
  const isModeOrThought = option.category === `mode` || option.category === `thought_level`;
  const isDangerousCurrent = option.category === `mode` && isDangerousModeValue(option.currentValue);
  const LeadingGlyph = option.category === `mode` ? modeOptionIcon(option.currentValue) : leadingIcon;
  const triggerClass = cn(triggerClassName, isDangerousCurrent && `text-warning hover:text-warning aria-expanded:text-warning`);
  const triggerIconClass = cn(`pointer-events-none size-4 text-current`, isDangerousCurrent && `text-warning`);
  const contentProps:
    | { position: "popper"; side: "top"; align: "start"; sideOffset: number; collisionPadding: number; className: string | undefined }
    | undefined = isModeOrThought
    ? {
        position: `popper`,
        side: `top`,
        align: `start`,
        sideOffset: 4,
        collisionPadding: 8,
        className: option.category === `mode` ? `w-64` : void 0,
      }
    : void 0;
  const triggerTestId = configSelectTestId(option);
  const currentOption = option.options.find((candidate) => candidate.value === option.currentValue);
  const triggerLabel = currentOption ? configOptionLabel(intl, provider, option, currentOption) : String(option.currentValue ?? ``);
  const labelCaseClass = option.category === `thought_level` ? `first-letter:uppercase` : void 0;
  return (
    <SelectRoot
      open={open}
      onOpenChange={onOpenChange}
      value={String(option.currentValue)}
      onValueChange={(value: string) => {
        if (!isOptionValue(option, value)) {
          logger.warn(`[ConfigSelect] 忽略值域外的选择回调`, { category: option.category, value });
          return;
        }
        onValueChange(value);
      }}
      disabled={disabled}
    >
      <TooltipRoot title={tooltipTitle} shortcut={shortcutLabel} triggerRef={triggerRef}>
        <SelectTrigger
          variant={triggerVariant}
          size={triggerSize}
          className={triggerClass}
          indicator={(
            <ChevronDownIcon className={cn(`pointer-events-none size-3.5 text-foreground-subtle`, indicatorClassName)} />
          )}
          aria-label={tooltipTitle}
          data-testid={triggerTestId}
        >
          {LeadingGlyph ? <LeadingGlyph className={triggerIconClass} /> : null}
          <span className={labelVisibilityClassName}>
            {option.category === `mode`
              ? <AnimatedLabel label={triggerLabel} />
              : <SelectValue><span className={labelCaseClass}>{triggerLabel}</span></SelectValue>}
          </span>
        </SelectTrigger>
      </TooltipRoot>
      <SelectContent
        {...contentProps}
        onKeyDown={handleTabNavigation}
        {...{
          onCloseAutoFocus: (event: Event) => {
            if (!restoreFocusSelector || (event.preventDefault(), !shouldRestoreFocus({ isCoarseTouchDevice: isCoarseTouchDevice() }))) return;
            const target = document.querySelector(restoreFocusSelector);
            (logger.debug(`[ConfigSelect] picker focus handoff`, {
              category: option.category,
              restoreFocusSelector,
              targetFound: !!target,
            }),
              (target as HTMLElement | null)?.focus());
          },
        }} // radix onCloseAutoFocus 透传（spread 规避多余属性检查）
      >
        {option.category === `mode`
          ? option.options.map((optionEntry) => {
              const OptionIcon = modeOptionIcon(optionEntry.value);
              const optionLabel = configOptionLabel(intl, provider, option, optionEntry);
              const optionDescription = configOptionDescription(intl, provider, option, optionEntry);
              return (
                <SelectItem
                  key={optionEntry.value}
                  value={optionEntry.value}
                  className={`min-h-13 items-start gap-3 py-2 pl-2 pr-8`}
                  data-testid={configOptionTestId(option, optionEntry)}
                >
                  <span className={`flex min-w-0 items-start gap-3`}>
                    <OptionIcon className={`mt-0.5 size-4.5 shrink-0 text-foreground`} />
                    <span className={`flex min-w-0 flex-col gap-0.5`}>
                      <span className={`truncate text-ui-base/relaxed text-foreground`}>{optionLabel}</span>
                      {optionDescription?.trim()
                        ? (
                          <span className={`line-clamp-2 text-ui-sm/relaxed text-foreground-subtle whitespace-nowrap`}>
                            {optionDescription}
                          </span>
                        )
                        : null}
                    </span>
                  </span>
                </SelectItem>
              );
            })
          : option.options.map((optionEntry) =>
              (
                <SelectItem key={optionEntry.value} value={optionEntry.value} data-testid={configOptionTestId(option, optionEntry)}>
                  <span className={labelCaseClass}>{configOptionLabel(intl, provider, option, optionEntry)}</span>
                </SelectItem>
              ),
            )}
      </SelectContent>
    </SelectRoot>
  );
}

/** U3e → THOUGHT_LEVEL_DISABLED_VALUES（js 77062） */
const THOUGHT_LEVEL_DISABLED_VALUES = new Set([`disabled`, `false`, `no`, `none`, `nothink`, `no-think`, `no_think`, `off`]);

/** W3e → THOUGHT_LEVEL_RANKS（js 77063） */
const THOUGHT_LEVEL_RANKS: Record<string, number> = {
  disabled: 0,
  false: 0,
  no: 0,
  none: 0,
  nothink: 0,
  "no-think": 0,
  no_think: 0,
  off: 0,
  low: 1,
  light: 1,
  minimal: 1,
  shallow: 1,
  balanced: 2,
  default: 2,
  medium: 2,
  normal: 2,
  standard: 2,
  deep: 3,
  high: 3,
  enable: 4,
  enabled: 4,
  on: 4,
  true: 4,
  "extra-high": 5,
  extra_high: 5,
  "very-high": 5,
  very_high: 5,
  xhigh: 5,
  max: 6,
  maximum: 6,
};

/** G3e → THOUGHT_LEVEL_LABEL_I18N（js 77094） */
const THOUGHT_LEVEL_LABEL_I18N: Record<string, string> = {
  disabled: `chat.toolbar.thoughtLevel.value.off`,
  false: `chat.toolbar.thoughtLevel.value.off`,
  no: `chat.toolbar.thoughtLevel.value.off`,
  none: `chat.toolbar.thoughtLevel.value.off`,
  nothink: `chat.toolbar.thoughtLevel.value.noThink`,
  "no-think": `chat.toolbar.thoughtLevel.value.noThink`,
  no_think: `chat.toolbar.thoughtLevel.value.noThink`,
  off: `chat.toolbar.thoughtLevel.value.off`,
  enable: `chat.toolbar.thoughtLevel.value.on`,
  enabled: `chat.toolbar.thoughtLevel.value.on`,
  on: `chat.toolbar.thoughtLevel.value.on`,
  true: `chat.toolbar.thoughtLevel.value.on`,
  low: `chat.toolbar.thoughtLevel.value.low`,
  light: `chat.toolbar.thoughtLevel.value.low`,
  minimal: `chat.toolbar.thoughtLevel.value.low`,
  shallow: `chat.toolbar.thoughtLevel.value.low`,
  balanced: `chat.toolbar.thoughtLevel.value.medium`,
  default: `chat.toolbar.thoughtLevel.value.medium`,
  medium: `chat.toolbar.thoughtLevel.value.medium`,
  normal: `chat.toolbar.thoughtLevel.value.medium`,
  standard: `chat.toolbar.thoughtLevel.value.medium`,
  deep: `chat.toolbar.thoughtLevel.value.high`,
  high: `chat.toolbar.thoughtLevel.value.high`,
  "extra-high": `chat.toolbar.thoughtLevel.value.xhigh`,
  extra_high: `chat.toolbar.thoughtLevel.value.xhigh`,
  "very-high": `chat.toolbar.thoughtLevel.value.xhigh`,
  very_high: `chat.toolbar.thoughtLevel.value.xhigh`,
  xhigh: `chat.toolbar.thoughtLevel.value.xhigh`,
  max: `chat.toolbar.thoughtLevel.value.max`,
  maximum: `chat.toolbar.thoughtLevel.value.max`,
};

/** Nq → normalizeThoughtLevelKey（js 77127） */
function normalizeThoughtLevelKey(key: string): string {
  return key.trim().toLowerCase();
}

/** K3e → isDisabledThoughtOption（js 77130） */
export function isDisabledThoughtOption(option: ConfigSelectOption): boolean {
  return THOUGHT_LEVEL_DISABLED_VALUES.has(normalizeThoughtLevelKey(option.value)) || THOUGHT_LEVEL_DISABLED_VALUES.has(normalizeThoughtLevelKey(option.name));
}

/** q3e → thoughtOptionRank（js 77133） */
function thoughtOptionRank(option: ConfigSelectOption): number | null {
  const candidates = [option.value, option.name];
  for (const candidate of candidates) {
    const rank = THOUGHT_LEVEL_RANKS[normalizeThoughtLevelKey(candidate)];
    if (rank !== void 0) return rank;
  }
  return null;
}

/** J3e → sortThoughtOptions（js 77141） */
export function sortThoughtOptions(options: ConfigSelectOption[]): ConfigSelectOption[] {
  return options
    .map((entry, index) => ({ entry, index, rank: thoughtOptionRank(entry) }))
    .sort((a, b) =>
      a.rank !== null && b.rank !== null && a.rank !== b.rank
        ? a.rank - b.rank
        : a.rank !== null && b.rank === null
          ? -1
          : a.rank === null && b.rank !== null
            ? 1
            : a.index - b.index,
    )
    .map((wrapped) => wrapped.entry);
}

/** Y3e → nextThoughtLevelValue（js 77155） */
export function nextThoughtLevelValue(spec: ConfigSelectSpec): string | null {
  if (spec.type !== `select` || !spec.options || spec.options.length < 2) return null;
  const sorted = sortThoughtOptions(spec.options);
  const currentValue = String(spec.currentValue);
  const currentIndex = sorted.findIndex((entry) => entry.value === currentValue);
  return sorted[currentIndex === -1 ? 0 : (currentIndex + 1) % sorted.length]?.value ?? null;
}

/** X3e → thoughtOptionLabel（js 77163） */
export function thoughtOptionLabel(intl: IntlShape, provider: string | undefined, spec: ConfigSelectSpec, option: ConfigSelectOption): string {
  const i18nId = THOUGHT_LEVEL_LABEL_I18N[normalizeThoughtLevelKey(option.value)];
  return i18nId ? intl.formatMessage({ id: i18nId }) : configOptionLabel(intl, provider, spec, option);
}

