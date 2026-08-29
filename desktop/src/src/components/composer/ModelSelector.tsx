// A0-S4-4b: 自 modules/Composer.tsx [C] 模型选择器段（ModelSelector + 上下文环）原样迁入（组件单元；原文件现为薄 re-export shim）。
// 迁出体 = [C] 全段（7996–8741）+ §0 testid 常量 MODEL_SELECT_*/MODE_SELECT_ITEM_TESTID（768–770、773，本族与 [D] 族消费，
// 后者经下方补导出取回）+ §0 declare 分配：ProgressRoot/ProgressIndicator/motion/AnimatePresence/NestedTooltip 四件随族迁入；
// HoverCardRoot 为 [C]/pptx 族/留守 B14 三面共用，按消费方复制（shim 保留）。MODE_LABEL_I18N/MODE_DESCRIPTION_I18N
// 原 [C] 段内私常量，补 export 供 [D] 族取回。testidOf/isCoarseTouchDevice/shouldRestoreFocus 留守 shim，经 import 取回。
// 导入路径按 components/composer/ 深度改指 ../../modules/ / ../ui/。
/* eslint-disable */
import * as React from "react";
import { DropdownMenu as DropdownMenuRoot, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from '../ui/dropdown-menu'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { Select as SelectRoot, SelectContent, SelectItem, SelectTrigger } from '../../modules/Settings'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { Loader as LoaderIcon, SparkleIcon, ChevronDown as ChevronDownIcon, Check as CheckIcon, Lock as LockIcon } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0；SparkleIcon 直名（原 Composer 463 调用面逐字；Sparkles 为另一图标，禁混）
import { InfoTooltip as TooltipRoot, TooltipContent, TooltipTrigger } from '../../modules/UsageStatsUiParts'; // 原 fN/pN + Ia（A0-D 接线 + A0-CLEANUP2 item 47）
import { Button } from '../../modules/button'; // 原 H（A0-D 接线：declare → button canonical）
import { cn } from '../../modules/UtilsCn'; // 原 Z（A0-D 接线：declare → UtilsCn canonical）
import { testidOf, isCoarseTouchDevice, shouldRestoreFocus } from '../../modules/Composer'; // shim 留守运行时助手（函数声明提升，渲染期访问，环安全）

/** 13. Radix 悬浮卡原语（HoverCardRoot 三面共用复制件；shim 亦保留） */
declare const HoverCardRoot: React.ComponentType<{ openDelay?: number; closeDelay?: number; children?: React.ReactNode } & Record<string, unknown>>; // dN 透传面（bundle 54538）：radix HoverCard openDelay/closeDelay 收 J4e 调用面（76086）
declare const ProgressRoot: React.ComponentType<Record<string, unknown> & { className?: string; children?: React.ReactNode }>;
declare const ProgressIndicator: React.ComponentType<Record<string, unknown> & { className?: string; style?: React.CSSProperties; children?: React.ReactNode }>;

/** 13b. framer-motion（vendored 69354–75494；仅消费面 declare，不转录） */
declare const motion: { span: React.ComponentType<Record<string, unknown> & { className?: string; children?: React.ReactNode }> };
declare const AnimatePresence: React.ComponentType<Record<string, unknown> & { children?: React.ReactNode }>;

/** 13c. 嵌套 Tooltip 原语（Radix tooltip 封装区；锁定模型项提示用） */
declare const NestedTooltipRoot: React.ComponentType<Record<string, unknown> & { children?: React.ReactNode }>;
declare const NestedTooltipProvider: React.ComponentType<{ children?: React.ReactNode }>;
declare const NestedTooltipTrigger: React.ComponentType<{ asChild?: boolean; children?: React.ReactNode }>;
declare const NestedTooltipContent: React.ComponentType<Record<string, unknown> & { side?: string; align?: string; sideOffset?: number; children?: React.ReactNode }>;

/** 15. testid 常量（src-HCld2afU.js，B5-11；值已回代核实，见原文件头） */
const MODEL_SELECT_TRIGGER_TESTID = `chat-model-select-trigger`;
const MODEL_SELECT_GROUP_TESTID = `chat-model-select-group`;
const MODEL_SELECT_ITEM_TESTID = `chat-model-select-item`;
export const MODE_SELECT_ITEM_TESTID = `chat-mode-select-item`;

/* ============================================================================
 * [C] js 75494–76148 —— 模型选择器段（ModelSelector + 上下文环）
 *      （75495–75526 在登记起点 75527 前，随族收录，裁决 §R5；
 *        76149–76245 已由 UsageDeep.tsx 抽取，让位，裁决 §R4）
 * ========================================================================== */

/** N4e → LABEL_ANIMATION_TRANSITION（js 75494） */
const LABEL_ANIMATION_TRANSITION = { duration: 0.2, ease: [0.4, 0, 0.2, 1] };

/** P4e → usePrefersReducedMotion（js 75496） */
function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);
  return (
    React.useEffect(() => {
      if (typeof window > `u` || typeof window.matchMedia != `function`) return;
      const mediaQueryList = window.matchMedia(`(prefers-reduced-motion: reduce)`);
      const report = () => {
        setPrefersReducedMotion(mediaQueryList.matches);
      };
      return (
        report(),
        typeof mediaQueryList.addEventListener == `function`
          ? (mediaQueryList.addEventListener(`change`, report),
            () => {
              mediaQueryList.removeEventListener(`change`, report);
            })
          : ((mediaQueryList as any).addListener(report),
            () => {
              (mediaQueryList as any).removeListener(report);
            })
      );
    }, []),
    prefersReducedMotion
  );
}

/** _q → AnimatedLabel（js 75520） */
export function AnimatedLabel({ label, className, prefix, prefixClassName, value }: { // 〔A0-S4-4b〕补 export：[D] ConfigSelect 消费（函数声明提升，环安全）
  label: string;
  className?: string;
  prefix?: string;
  prefixClassName?: string;
  value?: string;
}): React.ReactElement {
  const prefersReducedMotion = usePrefersReducedMotion();
  const content =
    prefix !== void 0 && value !== void 0
      ? (
        <>
          <span className={prefixClassName}>{prefix}</span>
          <span>{value}</span>
        </>
      )
      : label;
  return prefersReducedMotion
    ? <span className={className} title={label}>{content}</span>
    : (
      <span
        className={cn(
          `relative inline-flex h-[1.3em] min-w-0 items-center overflow-hidden leading-[1.25]`,
          className,
        )}
        title={label}
      >
        <AnimatePresence initial={false} mode={`popLayout`}>
          <motion.span
            key={label}
            className={`inline-flex min-w-0 whitespace-nowrap leading-[1.25]`}
            initial={{ y: `0.75em`, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: `-0.75em`, opacity: 0 }}
            transition={LABEL_ANIMATION_TRANSITION}
          >
            {content}
          </motion.span>
        </AnimatePresence>
      </span>
    );
}

/** F4e → EMPTY_FOOTER_ACTIONS（js 75556） */
const EMPTY_FOOTER_ACTIONS: ModelFooterAction[] = [];

/** I4e → hasMultipleGroups（js 75557） */
function hasMultipleGroups(groups: unknown[]): boolean {
  return groups.length > 0;
}

/** L4e → hasGroupDecoration（js 75560） */
function hasGroupDecoration(group: ModelGroup): boolean {
  return (
    group.key.startsWith(`family:`) || !!group.labelBadge?.trim() || (group.connectionOptions?.length ?? 0) > 0
  );
}

/** R4e → needsGroupSeparator（js 75565） */
function needsGroupSeparator(previousGroup: ModelGroup | undefined, currentGroup: ModelGroup): boolean {
  return previousGroup ? hasGroupDecoration(previousGroup) || hasGroupDecoration(currentGroup) : false;
}

/** z4e → groupContainsValue（js 75568） */
function groupContainsValue(group: ModelGroup, value: string): boolean {
  return group.items.some((item) => item.value === value);
}

/** B4e → resolveTriggerLabelClass（js 75571） */
function resolveTriggerLabelClass({ labelVisibilityClassName, triggerLabelClassName }: { labelVisibilityClassName: string; triggerLabelClassName?: string }): string {
  return triggerLabelClassName?.trim() ? triggerLabelClassName : cn(`min-w-0 text-left`, labelVisibilityClassName);
}

/** 模型选择器形状（语义归纳；中把握度） */
interface ModelOption {
  key: string;
  value: string;
  name: string;
  badgeLabel?: string;
}
interface ModelConnectionOption {
  key: string;
  label: string;
  badgeLabel?: string;
}
interface ModelGroup {
  key: string;
  label: string;
  labelBadge?: string;
  items: ModelOption[];
  directItems?: boolean;
  connectionOptions?: ModelConnectionOption[];
  selectedConnectionKey?: string;
}
export type { ModelGroup };
interface ModelFooterAction {
  key: string;
  label: string;
  onSelect?: () => void;
  selected?: boolean;
}

/** vq → ModelSelector（js 75575 / jsx 67089；MODULE-MAP 副根） */
export const ModelSelector = React.memo(function ModelSelector({
  modelGroups,
  normalizedValue,
  triggerLabel,
  triggerLabelPrefix,
  triggerLabelValue,
  triggerLabelPrefixClassName,
  showManageModelsAction,
  lockReasonMessage,
  isItemLocked,
  onValueChange,
  onConnectionValueChange,
  disabled,
  tooltipTitle,
  shortcutLabel,
  triggerRef,
  open,
  onOpenChange,
  openRequestKey = 0,
  pendingLabel,
  pending,
  labelVisibilityClassName = `hidden @xl/composer:inline-flex`,
  indicatorClassName,
  triggerClassName,
  triggerIconClassName = `hidden`,
  triggerLabelClassName,
  formatTriggerLabel,
  showProviderLevel,
  footerActions = EMPTY_FOOTER_ACTIONS,
  manageModelsLabel,
  onManageModels,
  focusSelectorOnClose = `[data-testid="chat-input"]`,
  contentSide = `top`,
  contentAlign = `start`,
}: {
  modelGroups: ModelGroup[];
  normalizedValue: string;
  triggerLabel: string;
  triggerLabelPrefix?: string;
  triggerLabelValue?: string;
  triggerLabelPrefixClassName?: string;
  showManageModelsAction?: boolean;
  lockReasonMessage?: string;
  isItemLocked: (value: string) => boolean;
  onValueChange: (value: string) => void;
  onConnectionValueChange?: (option: ModelConnectionOption) => void;
  disabled?: boolean;
  tooltipTitle?: string;
  shortcutLabel?: string;
  triggerRef?: { current: HTMLElement | null };
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  openRequestKey?: number;
  pendingLabel?: string;
  pending?: boolean;
  labelVisibilityClassName?: string;
  indicatorClassName?: string;
  triggerClassName?: string;
  triggerIconClassName?: string;
  triggerLabelClassName?: string;
  formatTriggerLabel?: (label: string) => string;
  showProviderLevel?: boolean;
  footerActions?: ModelFooterAction[];
  manageModelsLabel?: string;
  onManageModels?: () => void;
  focusSelectorOnClose?: string | null; // bundle 调用面收 null（132964/197382 等：禁用聚焦还原）
  contentSide?: `top` | `right` | `bottom` | `left`; // A0-S3c：收真实 radix side 联合（UO DropdownMenuContent 透传）
  contentAlign?: `start` | `center` | `end`; // A0-S3c：收真实 radix align 联合（UO DropdownMenuContent 透传）
}) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isOpen = open ?? internalOpen;
  const lastOpenRequestKeyRef = React.useRef(openRequestKey);
  const hasGroups = modelGroups.length > 0;
  const showProviderDecoration = showProviderLevel ?? hasMultipleGroups(modelGroups);
  const baseTriggerLabel = triggerLabel;
  const formattedTriggerLabel = formatTriggerLabel?.(baseTriggerLabel) ?? baseTriggerLabel;
  const formattedPendingLabel = pendingLabel && formatTriggerLabel ? formatTriggerLabel(pendingLabel) : pendingLabel;
  const visibleLabel = pending && formattedPendingLabel ? formattedPendingLabel : formattedTriggerLabel;
  const tooltipSourceLabel = pending && pendingLabel ? pendingLabel : baseTriggerLabel;
  const triggerLabelClass = resolveTriggerLabelClass({ labelVisibilityClassName, triggerLabelClassName });
  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      (open === void 0 && setInternalOpen(nextOpen), onOpenChange?.(nextOpen));
    },
    [open, onOpenChange],
  );
  React.useEffect(() => {
    openRequestKey <= 0 || openRequestKey === lastOpenRequestKeyRef.current || ((lastOpenRequestKeyRef.current = openRequestKey), !disabled && (handleOpenChange(true), triggerRef?.current?.focus()));
  }, [disabled, handleOpenChange, openRequestKey, triggerRef]);
  const handleValueSelect = React.useCallback(
      (value: string) => {
        onValueChange(value);
      },
      [onValueChange],
    ),
    resolvedTooltipTitle = React.useMemo(() => (pending && pendingLabel ? pendingLabel : (tooltipTitle ?? tooltipSourceLabel)), [tooltipSourceLabel, pending, pendingLabel, tooltipTitle]),
    renderModelOption = React.useCallback(
      (option: ModelOption) => {
        const locked = isItemLocked(option.value);
        const selected = option.value === normalizedValue;
        const optionKey = option.key;
        const dataAttributes = {
          "data-model-option-locked": locked ? `true` : void 0,
          "data-model-option-selected": selected ? `true` : void 0,
          "data-testid": testidOf(MODEL_SELECT_ITEM_TESTID, option.value),
          "data-checked": selected ? `true` : void 0,
        };
        const optionContent = (
          <>
            <span className={`flex min-w-0 flex-1 items-center gap-1.5 text-left`}>
              <span className={`min-w-0 truncate`} title={option.name}>{option.name}</span>
              {option.badgeLabel
                ? (
                  <span className={`shrink-0 rounded-full bg-secondary px-1.5 py-0.5 text-ui-base leading-none text-foreground-subtle`}>
                    {option.badgeLabel}
                  </span>
                )
                : null}
            </span>
            {locked
              ? (
                <NestedTooltipRoot>
                  <NestedTooltipProvider>
                    <NestedTooltipTrigger asChild>
                      <span
                        className={`inline-flex size-4 items-center justify-center rounded-full text-foreground-subtlest hover:text-foreground-subtle`}
                        onClick={(event) => {
                          (event.preventDefault(), event.stopPropagation());
                        }}
                        onPointerDown={(event) => {
                          (event.preventDefault(), event.stopPropagation());
                        }}
                      >
                        <LockIcon className={`size-4`} />
                      </span>
                    </NestedTooltipTrigger>
                    <NestedTooltipContent side={`right`} align={`center`} sideOffset={6}>
                      {lockReasonMessage}
                    </NestedTooltipContent>
                  </NestedTooltipProvider>
                </NestedTooltipRoot>
              )
              : null}
            {locked && selected ? <CheckIcon className={`size-4 text-foreground-subtle`} /> : null}
          </>
        );
        return locked
          ? (
            <DropdownMenuItem
              key={optionKey}
              {...dataAttributes}
              className={`min-h-8 cursor-not-allowed gap-2 px-2 text-ui-base text-foreground-subtlest data-[highlighted]:text-foreground-subtlest`}
              onSelect={(event: Event) => event.preventDefault()}
            >
              {optionContent}
            </DropdownMenuItem>
          )
          : (
            <DropdownMenuRadioItem
              key={optionKey}
              {...dataAttributes}
              value={option.value}
              className={`min-h-8 gap-2 pl-2 pr-8 text-ui-base`}
              onSelect={() => {
                (handleValueSelect(option.value), handleOpenChange(false));
              }}
            >
              {optionContent}
            </DropdownMenuRadioItem>
          );
      },
      [handleValueSelect, handleOpenChange, isItemLocked, lockReasonMessage, normalizedValue],
    ),
    renderRadioItems = React.useCallback(
      (items: ModelOption[]) => <DropdownMenuRadioGroup value={normalizedValue}>{items.map((item) => renderModelOption(item))}</DropdownMenuRadioGroup>,
      [normalizedValue, renderModelOption],
    ),
    renderGroupLabel = React.useCallback(
      (group: ModelGroup, options: { mutedLabel?: boolean } = {}) =>
        (
          <span className={`min-w-0 flex-1 items-center gap-1.5 text-left inline-flex`}>
            <span
              className={cn(
                `min-w-0 whitespace-normal break-words text-ui-base`,
                options.mutedLabel && `text-foreground-subtle`,
              )}
              title={group.label}
            >
              {group.label}
            </span>
            {group.labelBadge
              ? (
                <span className={`shrink-0 rounded-full bg-secondary px-1.5 py-0.5 text-ui-base leading-none text-foreground-subtle`}>
                  {group.labelBadge}
                </span>
              )
              : null}
          </span>
        ),
      [],
    ),
    renderConnectionRow = React.useCallback(
      (group: ModelGroup) => {
        const connectionOptions = group.connectionOptions ?? [];
        if (connectionOptions.length > 0) {
          const selectedKey = group.selectedConnectionKey ?? connectionOptions[0]?.key;
          const selectedOption = connectionOptions.find((option) => option.key === selectedKey) ?? connectionOptions[0];
          return (
            <div className={`flex min-h-8 items-center gap-2 px-2 py-1`}>
              <span className={`min-w-0 flex-1 truncate text-left text-ui-sm font-medium text-foreground-subtlest`} title={group.label}>
                {group.label}
              </span>
              <SelectRoot
                value={selectedKey}
                onValueChange={(value: string) => {
                  const option = connectionOptions.find((candidate) => candidate.key === value);
                  option && onConnectionValueChange?.(option);
                }}
              >
                <SelectTrigger
                  size={`xs`}
                  variant={`outline`}
                  className={`min-w-0 shrink-0 gap-0.5 rounded-full pr-1.5 text-ui-sm text-foreground-subtle [&_svg]:size-3`}
                  data-testid={testidOf(MODEL_SELECT_GROUP_TESTID, group.key)}
                  data-model-provider-key={group.key}
                  onPointerDown={(event: React.PointerEvent<HTMLButtonElement>) => event.stopPropagation()}
                  onKeyDown={(event: React.KeyboardEvent<HTMLButtonElement>) => event.stopPropagation()}
                >
                  <span className={`max-w-28 truncate`}>
                    {selectedOption?.badgeLabel ?? selectedOption?.label ?? group.label}
                  </span>
                </SelectTrigger>
                <SelectContent
                  align={`end`}
                  position={`popper`}
                  className={`w-max min-w-40 max-w-72`}
                  {...{ onCloseAutoFocus: (event: Event) => event.preventDefault() }} // radix onCloseAutoFocus 透传（Settings SelectContent 面未声明该 prop，spread 规避多余属性检查）
                >
                  {connectionOptions.map((option) =>
                    (
                      <SelectItem key={option.key} value={option.key} data-model-connection-option={option.key}>
                        {option.label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </SelectRoot>
            </div>
          );
        }
        return null;
      },
      [onConnectionValueChange],
    ),
    resolvedFooterActions = React.useMemo(() => {
      const actions = [...footerActions];
      return (showManageModelsAction && manageModelsLabel && actions.push({ key: `manage-models`, label: manageModelsLabel, onSelect: onManageModels }), actions);
    }, [footerActions, manageModelsLabel, onManageModels, showManageModelsAction]),
    triggerElement = (
      <TooltipTrigger {...{ asChild: true }}>
        <Button
          type={`button`}
          variant={`ghost`}
          size={`default`}
          disabled={disabled}
          data-chat-toolbar-popover-trigger={`true`}
          data-testid={MODEL_SELECT_TRIGGER_TESTID}
          data-model-current-value={normalizedValue}
          aria-label={resolvedTooltipTitle}
          className={cn(
            `w-fit justify-between gap-1 rounded-lg pl-2 pr-1.5 text-ui-base whitespace-nowrap`,
            triggerClassName,
          )}
        >
          <SparkleIcon
            className={cn(`pointer-events-none size-4 shrink-0 text-current`, triggerIconClassName)}
            aria-hidden={`true`}
          />
          <span className={triggerLabelClass} title={tooltipSourceLabel}>
            <AnimatedLabel
              label={visibleLabel}
              prefix={pending ? void 0 : triggerLabelPrefix}
              prefixClassName={triggerLabelPrefixClassName}
              value={pending ? void 0 : triggerLabelValue}
            />
          </span>
          {pending
            ? (
              <LoaderIcon className={`pointer-events-none size-3.5 animate-spin text-foreground`} />
            )
            : null}
          {!pending &&
            (
              <ChevronDownIcon className={cn(`pointer-events-none size-3.5 text-foreground-subtle`, indicatorClassName)} />
            )}
        </Button>
      </TooltipTrigger>
    );
  return (
    <DropdownMenuRoot open={isOpen} onOpenChange={handleOpenChange}>
      {tooltipTitle ? <TooltipRoot title={tooltipTitle} shortcut={shortcutLabel} triggerRef={triggerRef}>{triggerElement}</TooltipRoot> : triggerElement}
      {isOpen
        ? (
          <DropdownMenuContent
            className={cn(
              showProviderDecoration ? `w-max min-w-48 max-w-[calc(100vw-2rem)]` : `w-48 max-h-72 overflow-y-auto`,
            )}
            align={contentAlign}
            side={contentSide}
            onCloseAutoFocus={(event: Event) => {
              focusSelectorOnClose &&
                (event.preventDefault(),
                shouldRestoreFocus({ isCoarseTouchDevice: isCoarseTouchDevice() }) && (document.querySelector(focusSelectorOnClose) as HTMLElement | null)?.focus());
            }}
          >
            {hasGroups && showProviderDecoration
              ? modelGroups.map((group, index) => {
                  const separator = needsGroupSeparator(modelGroups[index - 1], group) ? <DropdownMenuSeparator /> : null;
                  if (group.directItems)
                    return (
                      <React.Fragment key={group.key}>
                        {separator}
                        <div>
                          <DropdownMenuLabel
                            className={`flex min-h-8 items-center px-2 py-1`}
                            data-testid={testidOf(MODEL_SELECT_GROUP_TESTID, group.key)}
                            data-model-provider-key={group.key}
                          >
                            {renderGroupLabel(group)}
                          </DropdownMenuLabel>
                          {renderConnectionRow(group)}
                          <DropdownMenuRadioGroup value={normalizedValue}>{group.items.map((item) => renderModelOption(item))}</DropdownMenuRadioGroup>
                        </div>
                      </React.Fragment>
                    );
                  const groupSelected = groupContainsValue(group, normalizedValue);
                  return (
                    <React.Fragment key={group.key}>
                      {separator}
                      <DropdownMenuSub>{/* A0-S3c：原误名 DropdownMenuGroup，bundle ZO@75905 为 Sub 封装（包 SubTrigger+SubContent） */}
                        <DropdownMenuSubTrigger
                          className={`min-h-8`}
                          data-testid={testidOf(MODEL_SELECT_GROUP_TESTID, group.key)}
                          data-model-provider-key={group.key}
                          data-model-provider-selected={groupSelected ? `true` : void 0}
                        >
                          {renderGroupLabel(group)}
                          {groupSelected
                            ? (
                              <CheckIcon className={`size-4 text-foreground-subtle`} />
                            )
                            : null}
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className={`max-h-72 w-48 overflow-y-auto`}>
                          {renderRadioItems(group.items)}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    </React.Fragment>
                  );
                })
              : hasGroups
                ? renderRadioItems(modelGroups[0]?.items ?? [])
                : null}
            {resolvedFooterActions.length > 0
              ? (
                <div className={`sticky bottom-0 z-10 bg-menu after:absolute after:left-0 after:top-full after:h-1 after:w-full after:bg-menu after:content-['']`}>
                  {hasGroups ? <DropdownMenuSeparator /> : null}
                  {resolvedFooterActions.map((action) =>
                    (
                      <DropdownMenuItem
                        key={action.key}
                        className={`min-h-8 gap-2 px-2`}
                        data-model-footer-action={action.key}
                        data-model-footer-action-selected={action.selected ? `true` : void 0}
                        onSelect={() => {
                          (handleOpenChange(false), action.onSelect?.());
                        }}
                      >
                        <span className={`min-w-0 flex-1 truncate`}>{action.label}</span>
                        {action.selected
                          ? <CheckIcon className={`size-4 text-foreground-subtle`} />
                          : null}
                      </DropdownMenuItem>
                    ),
                  )}
                </div>
              )
              : null}
          </DropdownMenuContent>
        )
        : null}
    </DropdownMenuRoot>
  );
});

/** V4e → MODE_LABEL_I18N（js 75972） */
export const MODE_LABEL_I18N: Record<string, Record<string, string>> = {
  claude: {
    auto: `mode.label.claude.auto`,
    default: `mode.label.claude.default`,
    acceptEdits: `mode.label.claude.acceptEdits`,
    plan: `mode.label.claude.plan`,
    dontAsk: `mode.label.claude.dontAsk`,
    bypassPermissions: `mode.label.claude.bypassPermissions`,
  },
  codex: {
    "read-only": `mode.label.codex.readOnly`,
    auto: `mode.label.codex.auto`,
    agent: `mode.label.codex.agent`,
    "full-access": `mode.label.codex.fullAccess`,
    "agent-full-access": `mode.label.codex.agentFullAccess`,
  },
  gemini: {
    default: `mode.label.gemini.default`,
    autoEdit: `mode.label.gemini.autoEdit`,
    yolo: `mode.label.gemini.yolo`,
    plan: `mode.label.gemini.plan`,
  },
  opencode: { build: `mode.label.opencode.build`, plan: `mode.label.opencode.plan` },
  glm: {
    default: `mode.label.glm.default`,
    build: `mode.label.glm.build`,
    edit: `mode.label.glm.edit`,
    plan: `mode.label.glm.plan`,
    yolo: `mode.label.glm.yolo`,
  },
};

/** H4e → MODE_DESCRIPTION_I18N（js 76002） */
export const MODE_DESCRIPTION_I18N: Record<string, Record<string, string>> = {
  claude: {
    auto: `mode.description.claude.auto`,
    default: `mode.description.claude.default`,
    acceptEdits: `mode.description.claude.acceptEdits`,
    plan: `mode.description.claude.plan`,
    dontAsk: `mode.description.claude.dontAsk`,
    bypassPermissions: `mode.description.claude.bypassPermissions`,
  },
  codex: {
    "read-only": `mode.description.codex.readOnly`,
    auto: `mode.description.codex.auto`,
    agent: `mode.description.codex.agent`,
    "full-access": `mode.description.codex.fullAccess`,
    "agent-full-access": `mode.description.codex.agentFullAccess`,
  },
  gemini: {
    default: `mode.description.gemini.default`,
    autoEdit: `mode.description.gemini.autoEdit`,
    yolo: `mode.description.gemini.yolo`,
    plan: `mode.description.gemini.plan`,
  },
  opencode: { build: `mode.description.opencode.build`, plan: `mode.description.opencode.plan` },
  glm: {
    default: `mode.description.glm.default`,
    build: `mode.description.glm.build`,
    edit: `mode.description.glm.edit`,
    plan: `mode.description.glm.plan`,
    yolo: `mode.description.glm.yolo`,
  },
};

/** yq → SegmentedProgress（js 76034）
 *  （A0-S2d 补导出：PaymentDeep.tsx 经真实 import 消费，去重 76034–76156 双归属） */
export function SegmentedProgress({ className, indicatorClassName, segments, value, ...rest }: {
  className?: string;
  indicatorClassName?: string;
  segments?: Array<{ id: string; percent: number; className?: string; style?: React.CSSProperties }>;
  value?: number;
} & Record<string, unknown>): React.ReactElement {
  const clampedValue = Math.min(Math.max(value ?? 0, 0), 100);
  const visibleSegments =
    segments
      ?.map((segment) => ({ ...segment, percent: Math.min(Math.max(segment.percent, 0), 1) }))
      .filter((segment) => segment.percent > 0) ?? [];
  return (
    <ProgressRoot
      data-slot={`progress`}
      className={cn(`relative flex h-1 w-full items-center overflow-x-hidden rounded-md bg-muted`, className)}
      {...rest}
    >
      <ProgressIndicator
        data-slot={`progress-indicator`}
        className={cn(
          `h-full rounded-full transition-[width]`,
          visibleSegments.length > 0 ? `flex overflow-hidden bg-transparent` : `bg-primary`,
          clampedValue > 0 && indicatorClassName,
        )}
        style={{ width: `${clampedValue}%` }}
      >
        {visibleSegments.map((segment) =>
          (
            <span
              key={segment.id}
              aria-hidden={`true`}
              className={cn(`h-full shrink-0`, segment.className)}
              style={{ ...segment.style, flexBasis: `${segment.percent * 100}%` }}
            />
          ),
        )}
      </ProgressIndicator>
    </ProgressRoot>
  );
}

/** bq/U4e/xq/W4e → 上下文环几何常量（js 76066–76069） */
const CONTEXT_RING_RADIUS = 10;
const CONTEXT_RING_VIEWBOX = 24;
const CONTEXT_RING_CENTER = 12;
const CONTEXT_RING_STROKE_WIDTH = 4;

/** G4e → ContextUsageContext（js 76071） */
const ContextUsageContext = React.createContext<{ usedTokens: number; maxTokens: number; usage?: unknown; modelId?: string | null } | null>(null);

/** K4e → usageRatio（js 76072） */
function usageRatio(usedTokens: number, maxTokens: number): number {
  return maxTokens <= 0 ? 0 : Math.min(Math.max(usedTokens / maxTokens, 0), 1);
}

/** q4e → useContextUsage（js 76075） */
const useContextUsage = () => {
  const context = React.useContext(ContextUsageContext);
  if (!context) throw Error(`Context components must be used within Context`);
  return context;
};

/** J4e → ContextUsageProvider（js 76079） */
export const ContextUsageProvider = ({ usedTokens, maxTokens, usage, modelId, ...rest }: {
  usedTokens: number;
  maxTokens: number;
  usage?: unknown;
  modelId?: string | null;
} & Record<string, unknown>) => {
  const contextValue = React.useMemo(
    () => ({ maxTokens, modelId, usage, usedTokens }),
    [maxTokens, modelId, usage, usedTokens],
  );
  return (
    <ContextUsageContext.Provider value={contextValue}>
      {/* bundle J4e@76086 渲染 dN（HoverCard root，closeDelay/openDelay=0），非 Ia 族——原重建误挂 TooltipRoot declare。 */}
      <HoverCardRoot closeDelay={0} openDelay={0} {...rest} />
    </ContextUsageContext.Provider>
  );
};

/** Y4e → ContextRingGlyph（js 76089） */
const ContextRingGlyph = () => {
  const { usedTokens, maxTokens } = useContextUsage();
  const circumference = 2 * Math.PI * CONTEXT_RING_RADIUS;
  const dashOffset = circumference * (1 - usageRatio(usedTokens, maxTokens));
  return (
    <svg aria-hidden={`true`} className={`size-3.5`} focusable={`false`} style={{ color: `currentcolor` }} viewBox={`0 0 ${CONTEXT_RING_VIEWBOX} ${CONTEXT_RING_VIEWBOX}`}>
      <circle
        cx={CONTEXT_RING_CENTER}
        cy={CONTEXT_RING_CENTER}
        fill={`none`}
        opacity={`0.25`}
        r={CONTEXT_RING_RADIUS}
        stroke={`currentColor`}
        strokeWidth={CONTEXT_RING_STROKE_WIDTH}
      />
      <circle
        cx={CONTEXT_RING_CENTER}
        cy={CONTEXT_RING_CENTER}
        fill={`none`}
        opacity={`0.7`}
        r={CONTEXT_RING_RADIUS}
        stroke={`currentColor`}
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={dashOffset}
        strokeLinecap={`round`}
        strokeWidth={CONTEXT_RING_STROKE_WIDTH}
        style={{ transform: `rotate(-90deg)`, transformOrigin: `center` }}
      />
    </svg>
  );
};

/** X4e → ContextRingTrigger（js 76125） */
export const ContextRingTrigger = ({ children, ...rest }: { children?: React.ReactNode } & Record<string, unknown>) =>
  (
    <TooltipTrigger {...{ asChild: true }}>
      {children ??
        (
          <Button type={`button`} variant={`ghost`} size={`icon-md`} {...rest} className={cn((rest as { className?: string }).className)}>
            <ContextRingGlyph />
          </Button>
        )}
    </TooltipTrigger>
  );

/** Z4e → ContextRingTooltipContent（js 76139） */
export const ContextRingTooltipContent = ({ className, ...rest }: { className?: string } & Record<string, unknown>) =>
  (
    <TooltipContent
      className={cn(
        `!w-64 overflow-hidden rounded-lg border border-border bg-tooltip p-0 text-tooltip-foreground shadow-none ring-0 outline-0`,
        className,
      )}
      {...rest}
    />
  );

/** Q4e → ContextRingTooltipBody（js 76147） */
export const ContextRingTooltipBody = ({ children, className, ...rest }: { children?: React.ReactNode; className?: string } & Record<string, unknown>) =>
  <div className={cn(`w-full bg-menu p-3`, className)} {...rest}>{children}</div>;

