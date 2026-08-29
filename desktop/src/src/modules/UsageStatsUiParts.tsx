/* eslint-disable */
/**
 * ============================================================================
 * UsageStatsUiParts.tsx — ZCode 3.7.6 用量 UI 件 + Tooltip 全栈（B5-11 · 逐字重建）
 * ============================================================================
 *
 * 原始 chunk（只读）：
 *   /Users/mac/nofy-build/desktop/src/out/renderer/assets/usageStatsUiParts-CiR7YEhh.js（883 行）
 * 对照文件（pretty 版，**行号主口径**）：
 *   /Users/mac/nofy-build/desktop/src/src-reconstructed/renderer/assets/usageStatsUiParts-CiR7YEhh.jsx（747 行）
 * 登记：COVERAGE-LEDGER §b「未重建 first-party（B4 队列）」第 3 件、§c.1 第 11 项；
 *       B5-FULL-DECODE-PLAN 批次 12（B5-11）第 2 件；MODULE-MAP §3 导入表
 *       （`Ia`→Tooltip、`Na/Oa/Ma/ka` 四件——实测均为 Tooltip 族，非 Popover，见报告 §3 裁决）。
 *
 * 内容三段：
 *  A. radix-ui/react-tooltip 内联实现（vendored，jsx 10–517）：VisuallyHidden、
 *     useSyncExternalStore shim、TooltipProvider/Tooltip/Trigger/Portal/Content/Arrow
 *     与悬停几何助手（凸包/射线法）；
 *  B. shadcn 风格封装（jsx 518–562）：data-slot=tooltip-* 四件 + 类名逐字；
 *  C. first-party 用量 UI 助手（jsx 563–746）：InfoTooltip、数字/百分比/日期格式化、
 *     用量统计卡、空态、53×7 用量热图（settings.usage.* i18n key 5 个）。
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号 = jsx 孪生文件行）
 * ----------------------------------------------------------------------------
 *  导入（jsx 1–8）：
 *   e（chunk-Cq_f4orQ s）→ toEsmInterop | t（chunk-Cq_f4orQ t）→ commonJsModule
 *   n（react t）→ reactModuleFactory | r（jsx-runtime t）→ jsxRuntimeModuleFactory
 *   i（keyboardShortcuts a）→ isApplePlatform
 *   dist-DJJArJ7D（vendored radix 共享原语 13 导入）：
 *    a→createContextScope | o→usePopperScope | s→Portal | c→Primitive | l→PopperRoot
 *    u→DismissableLayer | d→useId | f→PopperArrow | p→useControllableState
 *    m→PopperContent | h→Presence | g→Slot | _→composeEventHandlers
 *   dist-vnZIbudW：v→useComposedRefs | y→createSlottable
 *   b（utils t）→ cn
 *  模块内（jsx 行）：
 *   x (9) ReactInterop | S (10) jsxRuntime
 *   C (11) VISUALLY_HIDDEN_STYLE | w (23) VISUALLY_HIDDEN_NAME | T (24) VisuallyHidden | E (29) 别名
 *   D (30) useSyncExternalStoreShimFactory（commonJS） | ee (80) useSyncExternalStoreShim（commonJS）
 *   [O,te] (83) [TooltipScope, useTooltipScopeFactory] = createContextScope('Tooltip',[createPopperScope])
 *   k (84) useTooltipPopperScope | A (85) TOOLTIP_PROVIDER_NAME | ne (86) DEFAULT_DELAY_DURATION=700
 *   j (87) TOOLTIP_OPEN_EVENT='tooltip.open' | [re,M] (88) Provider 上下文对
 *   N (89) TooltipProvider | P (122) TOOLTIP_NAME | [ie,F] (123) Tooltip 上下文对
 *   I (124) Tooltip | L (187) TOOLTIP_TRIGGER_NAME | R (188) TooltipTrigger
 *   z (217) TOOLTIP_PORTAL_NAME | [ae,oe] (218) Portal 上下文对 | B (221) TooltipPortal
 *   V (243) TOOLTIP_CONTENT_NAME | H (244) TooltipContent | se (261) TooltipContentHoverable
 *   [ce,le] (312) Content 内层上下文对 | ue (315) TooltipContentSlottable | U (316) TooltipContentBase
 *   W (372) TOOLTIP_ARROW_NAME | de (373) TooltipArrow
 *   fe (386) resolveNearestSide | pe (404) getSideOffsetPoints | me (446) getRectCornerPoints
 *   he (467) isPointInPolygon | ge (484) getSortedHullPoints | _e (488) getConvexHull
 *   ve/ye/be/xe/Se (513–517) 五别名
 *   Ce (518) ShadcnTooltipProvider | G (528) ShadcnTooltip | K (536) ShadcnTooltipTrigger
 *   q (544) ShadcnTooltipContent | J (554) TOOLTIP_KBD_CLASS | Y (555) setRefValue
 *   X (564) InfoTooltip | Z (599) formatNumberCompact
 *   Q (609) USAGE_HEATMAP_COLORS | we (610) HEATMAP_WEEK_COUNT=53 | $ (611) HEATMAP_DAYS_PER_WEEK=7
 *   Te (612) MS_PER_DAY=864e5 | Ee (613) formatCountCompact | De (619) formatTokens
 *   Oe (622) formatPercent | ke (628) formatUtcDateShort | Ae (637) resolveModelLabel
 *   je (642) heatmapCellStyle | Me (647) formatHeatmapCellLabel | Ne (656) UsageStatCard
 *   Pe (669) UsageEmptyState | Fe (675) dayIndexOfDate | Ie (679) dateOfDayIndex
 *   Le (682) createEmptyHeatmapCell | Re (691) normalizeHeatmapWeeks
 *   ze (715) UsageHeatmap | Be (739) UsageHeatmapCell
 *
 * ----------------------------------------------------------------------------
 * 二、导出别名表（对外 16 个；消费方局部名见 styles js 902–918 导入块）
 * ----------------------------------------------------------------------------
 *   a=De formatTokens | c=Ae resolveModelLabel | d=G ShadcnTooltip | f=q ShadcnTooltipContent
 *   g=C VISUALLY_HIDDEN_STYLE | h=ee useSyncExternalStoreShim | i=Ee formatCountCompact
 *   l=Z formatNumberCompact | m=K ShadcnTooltipTrigger | n=ze UsageHeatmap | o=ke formatUtcDateShort
 *   p=Ce ShadcnTooltipProvider | r=Ne UsageStatCard | s=Oe formatPercent | t=Pe UsageEmptyState
 *   u=X InfoTooltip
 *  （styles 侧局部名：Da/Jre/Oa/ka/Yre/Xre/Aa/ja/Ma/Zre/Na/Pa/Qre/Fa/Ia）
 *
 * 把握度：A 段高（vendored radix 逐字转录，上游 = radix-ui tooltip，版本登记见
 * VENDOR-MANIFEST-LIBS）；B/C 段高（类名/字符串/分支零改动）。
 * ============================================================================
 */

import * as React from "react";

/* ============================================================================
 * 0. 外部依赖接口（跨 chunk，declare 挂接）
 * ==========================================================================*/

/** 原 e（chunk-Cq_f4orQ 的 s 导出）：CJS→ESM 互操作（本文件以 React 命名空间替代）。 */
/** 原 t（chunk-Cq_f4orQ 的 t 导出）：commonJS 模块工厂（惰性单例）。 */
declare function commonJsModule<T extends object>(
  factory: (exports: T, module: { exports: T }) => void,
): () => T;

/** 原 i（keyboardShortcuts-BGHopxr9 的 a 导出 = 内部 t）：Mac/iOS 平台判定。 */
declare function isApplePlatform(env?: { platform?: string; userAgent?: string }): boolean;

/** 原 b（utils-CEEH0K_K 的 t 导出）：类名合并。 */
declare function cn(...classes: Array<string | false | null | undefined>): string;

/* ── dist-DJJArJ7D（vendored radix 共享原语；版本登记见 VENDOR-MANIFEST-LIBS） ── */

type TooltipScope = unknown;
type AnyProps = Record<string, any>;

type ScopeProvider = React.ComponentType<{ scope: TooltipScope } & AnyProps>;
type UseScopeContext = (consumerName: string, scope: TooltipScope) => any;
type ScopeFactory = (name: string, defaults?: unknown) => [ScopeProvider, UseScopeContext];

/** 原 a（dist 的 _ 导出）：作用域上下文工厂（createContextScope）；
 *  返回 [createScope, useScopeFactory] 二元组（radix composeContextScopes 结构）。 */
declare function createContextScope(
  scopeName: string,
  deps?: unknown[],
): [ScopeFactory, (scopeName?: string) => (scope: TooltipScope) => Record<string, unknown>];

/** 原 o（dist 的 a 导出）：popper 作用域工厂（radix createPopperScope；
 *  无参调用得到作用域钩子）。 */
declare function createPopperScope(): (scope: TooltipScope) => Record<string, unknown>;

/** 原 s（dist 的 c 导出）：radix Portal。 */
declare const Portal: React.ComponentType<{ asChild?: boolean; container?: Element | null; children?: React.ReactNode }>;

/** 原 c（dist 的 d 导出）：radix Primitive（span/button 等原语）。 */
declare const Primitive: { span: React.ForwardRefExoticComponent<AnyProps & React.RefAttributes<any>>; button: React.ForwardRefExoticComponent<AnyProps & React.RefAttributes<any>> };

/** 原 l（dist 的 i 导出）：popper 根（PopperPrimitive.Root）。 */
declare const PopperRoot: React.ComponentType<AnyProps>;

/** 原 u（dist 的 l 导出）：可关闭层（DismissableLayer）。 */
declare const DismissableLayer: React.ComponentType<AnyProps>;

/** 原 d（dist 的 m 导出）：useId。 */
declare function useId(): string;

/** 原 f（dist 的 n 导出）：popper 箭头（PopperPrimitive.Arrow）。 */
declare const PopperArrow: React.ForwardRefExoticComponent<AnyProps & React.RefAttributes<any>>;

/** 原 p（dist 的 v 导出）：受控状态钩子。
 *  A0-CLEANUP2 item 47 补导出：Conversation（原 fa 消费面）经此接入；
 *  本体在 dist-DJJArJ7D.js（未转录），此处为接口级 export declare（同 MarkdownVendored 惯例）。 */
export declare function useControllableState<T>(args: {
  prop?: T;
  defaultProp?: T;
  onChange?: (value: T) => void;
  caller?: string;
}): [T, (value: T) => void];

/** 原 m（dist 的 r 导出）：popper 内容（PopperPrimitive.Content）。 */
declare const PopperContent: React.ForwardRefExoticComponent<AnyProps & React.RefAttributes<any>>;

/** 原 h（dist 的 s 导出）：存在性动画包装（Presence）。 */
declare const Presence: React.ComponentType<{ present: boolean; children?: React.ReactNode }>;

/** 原 g（dist 的 t 导出）：Slot 原语。 */
declare const Slot: React.ForwardRefExoticComponent<AnyProps & React.RefAttributes<any>>;

/** 原 _（dist 的 v 导出）：事件处理器合成。 */
declare function composeEventHandlers<E>(
  originalHandler?: (event: E) => void,
  handler?: (event: E) => void,
): (event: E) => void;

/* ── dist-vnZIbudW（vendored radix slot chunk） ── */

/** 原 v（dist-vnZIbudW 的 a 导出）：ref 合成钩子。 */
declare function useComposedRefs(...refs: Array<React.Ref<any> | undefined | null>): React.Ref<any>;

/** 原 y（dist-vnZIbudW 的 r 导出）：Slottable 工厂。 */
declare function createSlottable(name: string): React.ComponentType<{ children?: React.ReactNode }>;

/* ── i18n（first-party 消费面；I18n.tsx canonical） ── */

interface ZCodeIntl {
  formatMessage(descriptor: { id: string }, values?: Record<string, unknown>): string;
}

/* ============================================================================
 * A1. VisuallyHidden（原 C/w/T/E，jsx 11–29）——vendored radix 视觉隐藏件
 * ==========================================================================*/

/** 原 C（jsx 11）：视觉隐藏样式（冻结对象，逐字）。 */
const VISUALLY_HIDDEN_STYLE = Object.freeze({
  position: `absolute`,
  border: 0,
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: `hidden`,
  clip: `rect(0, 0, 0, 0)`,
  whiteSpace: `nowrap`,
  wordWrap: `normal`,
});

/** 原 w（jsx 23）。 */
const VISUALLY_HIDDEN_NAME = `VisuallyHidden`;

/** 原 T（jsx 24）：视觉隐藏 span（供屏幕阅读器）。 */
const VisuallyHidden = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>((props, forwardedRef) => (
  <Primitive.span {...props} ref={forwardedRef} style={{ ...VISUALLY_HIDDEN_STYLE, ...props.style }} />
));
VisuallyHidden.displayName = VISUALLY_HIDDEN_NAME;

/** 原 E（jsx 29）：别名。 */
const VisuallyHiddenComponent = VisuallyHidden;

/* ============================================================================
 * A2. useSyncExternalStore shim（原 D/ee，jsx 30–82）——vendored react shim
 *     （use-sync-external-store/shim；commonJS 双模块结构逐字保留）
 * ==========================================================================*/

interface UseSyncExternalStoreShimExports {
  useSyncExternalStore: <T>(subscribe: (onStoreChange: () => void) => () => void, getSnapshot: () => T) => T;
}

/** 原 D（jsx 30）：shim 工厂模块（无原生 useSyncExternalStore 时用状态回退）。 */
const useSyncExternalStoreShimFactory = commonJsModule<UseSyncExternalStoreShimExports>((shimExports) => {
  const react = (React as unknown) as any;
  function isObjectIs(first: any, second: any) {
    return (first === second && (first !== 0 || 1 / first == 1 / second)) || (first !== first && second !== second);
  }
  const objectIs = typeof Object.is == `function` ? Object.is : isObjectIs,
    useState = react.useState,
    useEffect = react.useEffect,
    useLayoutEffect = react.useLayoutEffect,
    useDebugValue = react.useDebugValue;
  function useSyncExternalStoreFallback(subscribe: any, getSnapshot: any) {
    const value = getSnapshot(),
      initialState = useState({
        inst: {
          value: value,
          getSnapshot: getSnapshot,
        },
      }),
      inst = initialState[0].inst,
      forceUpdate = initialState[1];
    return (
      useLayoutEffect(function () {
        inst.value = value, inst.getSnapshot = getSnapshot, checkIfSnapshotChanged(inst) && forceUpdate({ inst: inst });
      }, [subscribe, value, getSnapshot]),
      useEffect(function () {
        return (
          checkIfSnapshotChanged(inst) && forceUpdate({ inst: inst }),
          subscribe(function () {
            checkIfSnapshotChanged(inst) && forceUpdate({ inst: inst });
          })
        );
      }, [subscribe]),
      useDebugValue(value),
      value
    );
  }
  function checkIfSnapshotChanged(inst: any) {
    const latestGetSnapshot = inst.getSnapshot;
    inst = inst.value;
    try {
      const nextValue = latestGetSnapshot();
      return !objectIs(inst, nextValue);
    } catch {
      return true;
    }
  }
  function useSyncExternalStoreServer(_subscribe: any, getSnapshot: any) {
    return getSnapshot();
  }
  // 原码 `typeof window > 'u'` = minified `typeof window === 'undefined'`（逐字保留）。
  const shim =
    typeof window > `u` || window.document === void 0 || window.document.createElement === void 0
      ? useSyncExternalStoreServer
      : useSyncExternalStoreFallback;
  shimExports.useSyncExternalStore =
    react.useSyncExternalStore === void 0 ? shim : react.useSyncExternalStore;
});

/** 原 ee（jsx 80）：shim 导出模块（`t.exports = D()`；消费方 `Xre()` 后取成员）。 */
const useSyncExternalStoreShim = commonJsModule<UseSyncExternalStoreShimExports>((_exports, module) => {
  module.exports = useSyncExternalStoreShimFactory();
});

/* ============================================================================
 * A3. Tooltip 作用域与 Provider（原 [O,te]/k/A/ne/j/[re,M]/N，jsx 83–120）
 * ==========================================================================*/

/** 原 [O, te]（jsx 83）：[Tooltip 作用域工厂, 作用域钩子工厂]（依赖 popper 作用域）。 */
const [TooltipScope, useTooltipScopeFactory] = createContextScope(`Tooltip`, [createPopperScope]);

/** 原 k（jsx 84）：popper 作用域钩子（te() 而来）。 */
const useTooltipPopperScope = useTooltipScopeFactory();

/** 原 A（jsx 85）。 */
const TOOLTIP_PROVIDER_NAME = `TooltipProvider`;

/** 原 ne（jsx 86）：缺省打开延迟（ms）。 */
const DEFAULT_DELAY_DURATION = 700;

/** 原 j（jsx 87）：全局打开事件名（同一时刻仅一个 tooltip 打开）。 */
const TOOLTIP_OPEN_EVENT = `tooltip.open`;

/** 原 [re, M]（jsx 88）：Provider 上下文对。 */
const [TooltipProviderContextProvider, useTooltipProviderContext] = TooltipScope(TOOLTIP_PROVIDER_NAME);

interface TooltipProviderContextValue {
  isOpenDelayedRef: React.MutableRefObject<boolean>;
  delayDuration: number;
  onOpen: () => void;
  onClose: () => void;
  isPointerInTransitRef: React.MutableRefObject<boolean>;
  onPointerInTransitChange: (inTransit: boolean) => void;
  disableHoverableContent: boolean;
}

interface TooltipProviderProps {
  __scopeTooltip?: TooltipScope;
  delayDuration?: number;
  skipDelayDuration?: number;
  disableHoverableContent?: boolean;
  children?: React.ReactNode;
  [key: string]: unknown;
}

/** 原 N（jsx 89）：TooltipProvider（延迟计时 + 指针过渡跟踪）。 */
const TooltipProvider = (props: TooltipProviderProps) => {
  const {
    __scopeTooltip: scope,
    delayDuration: delayDurationProp = DEFAULT_DELAY_DURATION,
    skipDelayDuration: skipDelayDurationProp = 300,
    disableHoverableContent: disableHoverableContentProp = false,
    children,
  } = props;
  const isOpenDelayedRef = React.useRef(true);
  const isPointerInTransitRef = React.useRef(false);
  const skipDelayTimerRef = React.useRef(0);
  React.useEffect(() => {
    const timer = skipDelayTimerRef.current;
    return () => window.clearTimeout(timer);
  }, []);
  return (
    <TooltipProviderContextProvider
      scope={scope}
      isOpenDelayedRef={isOpenDelayedRef}
      delayDuration={delayDurationProp}
      onOpen={React.useCallback(() => {
        window.clearTimeout(skipDelayTimerRef.current), isOpenDelayedRef.current = false;
      }, [])}
      onClose={React.useCallback(() => {
        window.clearTimeout(skipDelayTimerRef.current),
          skipDelayTimerRef.current = window.setTimeout(() => isOpenDelayedRef.current = true, skipDelayDurationProp);
      }, [skipDelayDurationProp])}
      isPointerInTransitRef={isPointerInTransitRef}
      onPointerInTransitChange={React.useCallback((inTransit: boolean) => {
        isPointerInTransitRef.current = inTransit;
      }, [])}
      disableHoverableContent={disableHoverableContentProp}
      children={children}
    />
  );
};
TooltipProvider.displayName = TOOLTIP_PROVIDER_NAME;

/* ============================================================================
 * A4. Tooltip 根（原 P/[ie,F]/I，jsx 122–185）
 * ==========================================================================*/

/** 原 P（jsx 122）。 */
const TOOLTIP_NAME = `Tooltip`;

/** 原 [ie, F]（jsx 123）：Tooltip 上下文对。 */
const [TooltipContextProvider, useTooltipContext] = TooltipScope(TOOLTIP_NAME);

interface TooltipContextValue {
  contentId: string;
  open: boolean;
  stateAttribute: "closed" | "instant-open" | "delayed-open";
  trigger: HTMLElement | null;
  onTriggerChange: (trigger: HTMLElement | null) => void;
  onTriggerEnter: () => void;
  onTriggerLeave: () => void;
  onOpen: () => void;
  onClose: () => void;
  disableHoverableContent: boolean;
}

interface TooltipProps {
  __scopeTooltip?: TooltipScope;
  children?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disableHoverableContent?: boolean;
  delayDuration?: number;
}

/** 原 I（jsx 124）：Tooltip 根（受控/非受控 + 延迟打开状态机）。 */
const Tooltip = (props: TooltipProps) => {
  const {
    __scopeTooltip: scope,
    children,
    open: openProp,
    defaultOpen,
    onOpenChange,
    disableHoverableContent: disableHoverableContentProp,
    delayDuration: delayDurationProp,
  } = props;
  const providerContext = useTooltipProviderContext(TOOLTIP_NAME, props.__scopeTooltip) as TooltipProviderContextValue;
  const popperScope = useTooltipPopperScope(scope);
  const [trigger, setTrigger] = React.useState<HTMLElement | null>(null);
  const contentId = useId();
  const openTimerRef = React.useRef(0);
  const disableHoverableContent = disableHoverableContentProp ?? providerContext.disableHoverableContent;
  const delayDuration = delayDurationProp ?? providerContext.delayDuration;
  const wasOpenDelayedRef = React.useRef(false);
  const [open, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen ?? false,
    onChange: (nextOpen) => {
      nextOpen ? (providerContext.onOpen(), document.dispatchEvent(new CustomEvent(TOOLTIP_OPEN_EVENT))) : providerContext.onClose(),
        onOpenChange?.(nextOpen);
    },
    caller: TOOLTIP_NAME,
  });
  const stateAttribute = React.useMemo(
    () => open ? (wasOpenDelayedRef.current ? `delayed-open` : `instant-open`) : `closed`,
    [open],
  );
  const handleOpen = React.useCallback(() => {
    window.clearTimeout(openTimerRef.current), openTimerRef.current = 0, wasOpenDelayedRef.current = false, setOpen(true);
  }, [setOpen]);
  const handleClose = React.useCallback(() => {
    window.clearTimeout(openTimerRef.current), openTimerRef.current = 0, setOpen(false);
  }, [setOpen]);
  const handleDelayedOpen = React.useCallback(() => {
    window.clearTimeout(openTimerRef.current),
      openTimerRef.current = window.setTimeout(() => {
        wasOpenDelayedRef.current = true, setOpen(true), openTimerRef.current = 0;
      }, delayDuration);
  }, [delayDuration, setOpen]);
  return (
    React.useEffect(() => () => {
      openTimerRef.current &&= (window.clearTimeout(openTimerRef.current), 0);
    }, []),
    (
      <PopperRoot {...popperScope}>
        <TooltipContextProvider
          scope={scope}
          contentId={contentId}
          open={open}
          stateAttribute={stateAttribute}
          trigger={trigger}
          onTriggerChange={setTrigger}
          onTriggerEnter={React.useCallback(() => {
            providerContext.isOpenDelayedRef.current ? handleDelayedOpen() : handleOpen();
          }, [providerContext.isOpenDelayedRef, handleDelayedOpen, handleOpen])}
          onTriggerLeave={React.useCallback(() => {
            disableHoverableContent ? handleClose() : (window.clearTimeout(openTimerRef.current), openTimerRef.current = 0);
          }, [handleClose, disableHoverableContent])}
          onOpen={handleOpen}
          onClose={handleClose}
          disableHoverableContent={disableHoverableContent}
          children={children}
        />
      </PopperRoot>
    )
  );
};
Tooltip.displayName = TOOLTIP_NAME;

/* ============================================================================
 * A5. TooltipTrigger（原 L/R，jsx 187–214）
 * ==========================================================================*/

/** 原 L（jsx 187）。 */
const TOOLTIP_TRIGGER_NAME = `TooltipTrigger`;

/** 原 R（jsx 188）：触发器（指针/焦点/点击 → 开关节奏）。 */
const TooltipTrigger = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithRef<"button"> & { __scopeTooltip?: TooltipScope }>((props, forwardedRef) => {
  const { __scopeTooltip: scope, ...triggerProps } = props;
  const context = useTooltipContext(TOOLTIP_TRIGGER_NAME, scope) as TooltipContextValue;
  const providerContext = useTooltipProviderContext(TOOLTIP_TRIGGER_NAME, scope) as TooltipProviderContextValue;
  const popperScope = useTooltipPopperScope(scope);
  const composedRef = useComposedRefs(forwardedRef, React.useRef(null), context.onTriggerChange);
  const isPointerDownRef = React.useRef(false);
  const hasOpenedOnPointerMoveRef = React.useRef(false);
  const handlePointerUp = React.useCallback(() => isPointerDownRef.current = false, []);
  return (
    React.useEffect(() => () => document.removeEventListener(`pointerup`, handlePointerUp), [handlePointerUp]),
    (
      <Slot asChild {...popperScope}>
        <Primitive.button
          aria-describedby={context.open ? context.contentId : void 0}
          data-state={context.stateAttribute}
          {...triggerProps}
          ref={composedRef}
          onPointerMove={composeEventHandlers(props.onPointerMove, (event) => {
            event.pointerType !== `touch` &&
              !hasOpenedOnPointerMoveRef.current &&
              !providerContext.isPointerInTransitRef.current &&
              (context.onTriggerEnter(), hasOpenedOnPointerMoveRef.current = true);
          })}
          onPointerLeave={composeEventHandlers(props.onPointerLeave, () => {
            context.onTriggerLeave(), hasOpenedOnPointerMoveRef.current = false;
          })}
          onPointerDown={composeEventHandlers(props.onPointerDown, () => {
            context.open && context.onClose(),
              isPointerDownRef.current = true,
              document.addEventListener(`pointerup`, handlePointerUp, { once: true });
          })}
          onFocus={composeEventHandlers(props.onFocus, () => {
            isPointerDownRef.current || context.onOpen();
          })}
          onBlur={composeEventHandlers(props.onBlur, context.onClose)}
          onClick={composeEventHandlers(props.onClick, context.onClose)}
        />
      </Slot>
    )
  );
});
TooltipTrigger.displayName = TOOLTIP_TRIGGER_NAME;

/* ============================================================================
 * A6. TooltipPortal（原 z/[ae,oe]/B，jsx 217–241）
 * ==========================================================================*/

/** 原 z（jsx 217）。 */
const TOOLTIP_PORTAL_NAME = `TooltipPortal`;

/** 原 [ae, oe]（jsx 218）：Portal 上下文对（forceMount 缺省）。 */
const [TooltipPortalContextProvider, useTooltipPortalContext] = TooltipScope(TOOLTIP_PORTAL_NAME, {
  forceMount: void 0,
});

interface TooltipPortalProps {
  __scopeTooltip?: TooltipScope;
  forceMount?: boolean;
  children?: React.ReactNode;
  container?: Element | null;
}

/** 原 B（jsx 221）：Portal（Presence 门控）。 */
const TooltipPortal = (props: TooltipPortalProps) => {
  const { __scopeTooltip: scope, forceMount, children, container } = props;
  const context = useTooltipContext(TOOLTIP_PORTAL_NAME, scope) as TooltipContextValue;
  return (
    <TooltipPortalContextProvider scope={scope} forceMount={forceMount}>
      <Presence present={forceMount || context.open}>
        <Portal asChild container={container}>
          {children}
        </Portal>
      </Presence>
    </TooltipPortalContextProvider>
  );
};
TooltipPortal.displayName = TOOLTIP_PORTAL_NAME;

/* ============================================================================
 * A7. TooltipContent 族（原 V/H/se/[ce,le]/ue/U，jsx 243–370）
 * ==========================================================================*/

/** 原 V（jsx 243）。 */
const TOOLTIP_CONTENT_NAME = `TooltipContent`;

interface TooltipContentProps extends React.ComponentPropsWithRef<"div"> {
  __scopeTooltip?: TooltipScope;
  forceMount?: boolean;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  "aria-label"?: string;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onPointerDownOutside?: (event: unknown) => void;
}

/** 原 H（jsx 244）：TooltipContent（可悬停/不可悬停分派）。 */
const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>((props, forwardedRef) => {
  const portalContext = useTooltipPortalContext(TOOLTIP_CONTENT_NAME, props.__scopeTooltip) as { forceMount?: boolean };
  const { forceMount = portalContext.forceMount, side = `top`, ...contentProps } = props;
  const context = useTooltipContext(TOOLTIP_CONTENT_NAME, props.__scopeTooltip) as TooltipContextValue;
  return (
    <Presence present={forceMount || context.open}>
      {context.disableHoverableContent ? (
        <TooltipContentBase side={side} {...contentProps} ref={forwardedRef} />
      ) : (
        <TooltipContentHoverable side={side} {...contentProps} ref={forwardedRef} />
      )}
    </Presence>
  );
});

/** 原 se（jsx 261）：可悬停内容（指针过渡凸包判定，离开即关）。 */
const TooltipContentHoverable = React.forwardRef<HTMLDivElement, TooltipContentProps>((props, forwardedRef) => {
  const context = useTooltipContext(TOOLTIP_CONTENT_NAME, props.__scopeTooltip) as TooltipContextValue;
  const providerContext = useTooltipProviderContext(TOOLTIP_CONTENT_NAME, props.__scopeTooltip) as TooltipProviderContextValue;
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const composedRef = useComposedRefs(forwardedRef, contentRef);
  const [pointerGraceArea, setPointerGraceArea] = React.useState<Polygon | null>(null);
  const { trigger, onClose } = context;
  const content = contentRef.current;
  const { onPointerInTransitChange } = providerContext;
  const handleRemoveGraceArea = React.useCallback(() => {
    setPointerGraceArea(null), onPointerInTransitChange(false);
  }, [onPointerInTransitChange]);
  const handleCreateGraceArea = React.useCallback(
    (event: PointerEvent, hoverTarget: HTMLElement) => {
      const currentTarget = event.currentTarget as HTMLElement,
        exitPoint = { x: event.clientX, y: event.clientY },
        exitSide = resolveNearestSide(exitPoint, currentTarget.getBoundingClientRect()),
        graceArea = getConvexHull([...getSideOffsetPoints(exitPoint, exitSide), ...getRectCornerPoints(hoverTarget.getBoundingClientRect())]);
      setPointerGraceArea(graceArea), onPointerInTransitChange(true);
    },
    [onPointerInTransitChange],
  );
  return (
    React.useEffect(() => () => handleRemoveGraceArea(), [handleRemoveGraceArea]),
    React.useEffect(() => {
      if (trigger && content) {
        const handleTriggerLeave = (event: PointerEvent) => handleCreateGraceArea(event, content),
          handleContentLeave = (event: PointerEvent) => handleCreateGraceArea(event, trigger);
        return (
          trigger.addEventListener(`pointerleave`, handleTriggerLeave),
          content.addEventListener(`pointerleave`, handleContentLeave),
          () => {
            trigger.removeEventListener(`pointerleave`, handleTriggerLeave),
              content.removeEventListener(`pointerleave`, handleContentLeave);
          }
        );
      }
    }, [trigger, content, handleCreateGraceArea, handleRemoveGraceArea]),
    React.useEffect(() => {
      if (pointerGraceArea) {
        const handleTrackPointerGrace = (event: PointerEvent) => {
          const target = event.target as HTMLElement,
            pointerPosition = { x: event.clientX, y: event.clientY },
            hasEnteredTarget = trigger?.contains(target) || content?.contains(target),
            isPointerOutsideGraceArea = !isPointInPolygon(pointerPosition, pointerGraceArea);
          hasEnteredTarget ? handleRemoveGraceArea() : isPointerOutsideGraceArea && (handleRemoveGraceArea(), onClose());
        };
        return (
          document.addEventListener(`pointermove`, handleTrackPointerGrace),
          () => document.removeEventListener(`pointermove`, handleTrackPointerGrace)
        );
      }
    }, [trigger, content, pointerGraceArea, onClose, handleRemoveGraceArea]),
    <TooltipContentBase {...props} ref={composedRef} />
  );
});

/** 原 [ce, le]（jsx 312）：内容内层上下文（isInside，供箭头抑制）。 */
const [TooltipContentContextProvider, useTooltipContentContext] = TooltipScope(TOOLTIP_NAME, {
  isInside: false,
});

/** 原 ue（jsx 315）：内容 Slottable。 */
const TooltipContentSlottable = createSlottable(`TooltipContent`);

/** 原 U（jsx 316）：内容基座（DismissableLayer + PopperContent + CSS 变量桥）。 */
const TooltipContentBase = React.forwardRef<HTMLDivElement, TooltipContentProps>((props, forwardedRef) => {
  const {
    __scopeTooltip: scope,
    children,
    "aria-label": ariaLabel,
    onEscapeKeyDown,
    onPointerDownOutside,
    ...contentProps
  } = props;
  const context = useTooltipContext(TOOLTIP_CONTENT_NAME, scope) as TooltipContextValue;
  const popperScope = useTooltipPopperScope(scope);
  const { onClose } = context;
  return (
    React.useEffect(
      () => (document.addEventListener(TOOLTIP_OPEN_EVENT, onClose), () => document.removeEventListener(TOOLTIP_OPEN_EVENT, onClose)),
      [onClose],
    ),
    React.useEffect(() => {
      if (context.trigger) {
        const handleScroll = (event: Event) => {
          (event.target as HTMLElement | null)?.contains(context.trigger) && onClose();
        };
        return (
          window.addEventListener(`scroll`, handleScroll, { capture: true }),
          () => window.removeEventListener(`scroll`, handleScroll, { capture: true })
        );
      }
    }, [context.trigger, onClose]),
    (
      <DismissableLayer
        asChild
        disableOutsidePointerEvents={false}
        onEscapeKeyDown={onEscapeKeyDown}
        onPointerDownOutside={onPointerDownOutside}
        onFocusOutside={(event: Event) => event.preventDefault()}
        onDismiss={onClose}
      >
        <PopperContent
          data-state={context.stateAttribute}
          {...popperScope}
          {...contentProps}
          ref={forwardedRef}
          style={{
            ...contentProps.style,
            "--radix-tooltip-content-transform-origin": `var(--radix-popper-transform-origin)`,
            "--radix-tooltip-content-available-width": `var(--radix-popper-available-width)`,
            "--radix-tooltip-content-available-height": `var(--radix-popper-available-height)`,
            "--radix-tooltip-trigger-width": `var(--radix-popper-anchor-width)`,
            "--radix-tooltip-trigger-height": `var(--radix-popper-anchor-height)`,
          }}
        >
          <TooltipContentSlottable>{children}</TooltipContentSlottable>
          <TooltipContentContextProvider scope={scope} isInside>
            <VisuallyHiddenComponent id={context.contentId} role="tooltip">
              {ariaLabel || children}
            </VisuallyHiddenComponent>
          </TooltipContentContextProvider>
        </PopperContent>
      </DismissableLayer>
    )
  );
});
TooltipContent.displayName = TOOLTIP_CONTENT_NAME;

/* ============================================================================
 * A8. TooltipArrow（原 W/de，jsx 372–383）
 * ==========================================================================*/

/** 原 W（jsx 372）。 */
const TOOLTIP_ARROW_NAME = `TooltipArrow`;

/** 原 de（jsx 373）：箭头（内容内层渲染时抑制）。 */
const TooltipArrow = React.forwardRef<SVGSVGElement, React.ComponentPropsWithRef<"svg"> & { __scopeTooltip?: TooltipScope }>((props, forwardedRef) => {
  const { __scopeTooltip: scope, ...arrowProps } = props;
  const popperScope = useTooltipPopperScope(scope);
  return useTooltipContentContext(TOOLTIP_ARROW_NAME, scope).isInside ? null : (
    <PopperArrow {...popperScope} {...arrowProps} ref={forwardedRef} />
  );
});
TooltipArrow.displayName = TOOLTIP_ARROW_NAME;

/* ============================================================================
 * A9. 悬停几何助手（原 fe/pe/me/he/ge/_e，jsx 386–511）
 * ==========================================================================*/

interface Point {
  x: number;
  y: number;
}

interface Rect {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

type Side = "top" | "right" | "bottom" | "left";
type Polygon = Point[];

/** 原 fe（jsx 386）：点到矩形四边最近距离 → 方位。 */
function resolveNearestSide(point: Point, rect: Rect): Side {
  const topDistance = Math.abs(rect.top - point.y),
    bottomDistance = Math.abs(rect.bottom - point.y),
    rightDistance = Math.abs(rect.right - point.x),
    leftDistance = Math.abs(rect.left - point.x);
  switch (Math.min(topDistance, bottomDistance, rightDistance, leftDistance)) {
    case leftDistance:
      return `left`;
    case rightDistance:
      return `right`;
    case topDistance:
      return `top`;
    case bottomDistance:
      return `bottom`;
    default:
      throw Error(`unreachable`);
  }
}

/** 原 pe（jsx 404）：按方位在出口点两侧取偏移点（缺省 5px）。 */
function getSideOffsetPoints(point: Point, side: Side, offset = 5): Point[] {
  const points: Point[] = [];
  switch (side) {
    case `top`:
      points.push({ x: point.x - offset, y: point.y + offset }, { x: point.x + offset, y: point.y + offset });
      break;
    case `bottom`:
      points.push({ x: point.x - offset, y: point.y - offset }, { x: point.x + offset, y: point.y - offset });
      break;
    case `left`:
      points.push({ x: point.x + offset, y: point.y - offset }, { x: point.x + offset, y: point.y + offset });
      break;
    case `right`:
      points.push({ x: point.x - offset, y: point.y - offset }, { x: point.x - offset, y: point.y + offset });
      break;
  }
  return points;
}

/** 原 me（jsx 446）：矩形四角。 */
function getRectCornerPoints(rect: Rect): Point[] {
  const { top, right, bottom, left } = rect;
  return [
    { x: left, y: top },
    { x: right, y: top },
    { x: right, y: bottom },
    { x: left, y: bottom },
  ];
}

/** 原 he（jsx 467）：射线法点在多边形内判定。 */
function isPointInPolygon(point: Point, polygon: Polygon): boolean {
  const { x, y } = point;
  let inside = false;
  for (let currentIndex = 0, previousIndex = polygon.length - 1; currentIndex < polygon.length; previousIndex = currentIndex++) {
    const currentPoint = polygon[currentIndex],
      previousPoint = polygon[previousIndex],
      currentX = currentPoint.x,
      currentY = currentPoint.y,
      previousX = previousPoint.x,
      previousY = previousPoint.y;
    currentY > y != previousY > y && x < ((previousX - currentX) * (y - currentY)) / (previousY - currentY) + currentX && (inside = !inside);
  }
  return inside;
}

/** 原 ge（jsx 484）：排序后取凸包。 */
function getSortedHullPoints(points: Polygon): Polygon {
  const sorted = points.slice();
  return sorted.sort((a, b) => (a.x < b.x ? -1 : a.x > b.x ? 1 : a.y < b.y ? -1 : +(a.y > b.y))), getConvexHull(sorted);
}

/** 原 _e（jsx 488）：Andrew 单调链凸包。 */
function getConvexHull(points: Polygon): Polygon {
  if (points.length <= 1) return points.slice();
  const lowerHull: Point[] = [];
  for (let pointIndex = 0; pointIndex < points.length; pointIndex++) {
    const point = points[pointIndex];
    for (; lowerHull.length >= 2; ) {
      const last = lowerHull[lowerHull.length - 1],
        secondLast = lowerHull[lowerHull.length - 2];
      if ((last.x - secondLast.x) * (point.y - secondLast.y) >= (last.y - secondLast.y) * (point.x - secondLast.x)) lowerHull.pop();
      else break;
    }
    lowerHull.push(point);
  }
  lowerHull.pop();
  const upperHull: Point[] = [];
  for (let pointIndex = points.length - 1; pointIndex >= 0; pointIndex--) {
    const point = points[pointIndex];
    for (; upperHull.length >= 2; ) {
      const last = upperHull[upperHull.length - 1],
        secondLast = upperHull[upperHull.length - 2];
      if ((last.x - secondLast.x) * (point.y - secondLast.y) >= (last.y - secondLast.y) * (point.x - secondLast.x)) upperHull.pop();
      else break;
    }
    upperHull.push(point);
  }
  return (
    upperHull.pop(),
    lowerHull.length === 1 && upperHull.length === 1 && lowerHull[0].x === upperHull[0].x && lowerHull[0].y === upperHull[0].y
      ? lowerHull
      : lowerHull.concat(upperHull)
  );
}

/* ============================================================================
 * B. shadcn 封装四件 + InfoTooltip（原 ve–X，jsx 513–597）
 * ==========================================================================*/

/** 原 ve/ye/be/xe/Se（jsx 513–517）：radix 五别名。 */
const TooltipProviderRoot = TooltipProvider,
  TooltipRoot = Tooltip,
  TooltipTriggerRoot = TooltipTrigger,
  TooltipPortalRoot = TooltipPortal,
  TooltipContentRoot = TooltipContent;

/** 原 Ce（jsx 518）：shadcn Provider（data-slot=tooltip-provider，延迟缺省 0）。 */
function ShadcnTooltipProvider({ delayDuration = 0, ...props }: TooltipProviderProps) {
  return <TooltipProviderRoot data-slot="tooltip-provider" delayDuration={delayDuration} {...props} />;
}

/** 原 G（jsx 528）：shadcn Tooltip 根。 */
function ShadcnTooltip({ ...props }: TooltipProps) {
  return <TooltipRoot data-slot="tooltip" {...props} />;
}

/** 原 K（jsx 536）：shadcn 触发器。 */
function ShadcnTooltipTrigger({ ...props }: React.ComponentPropsWithRef<"button"> & { __scopeTooltip?: TooltipScope; asChild?: boolean }) {
  return <TooltipTriggerRoot data-slot="tooltip-trigger" {...props} />;
}

/** 原 q（jsx 544）：shadcn 内容（Portal 包装 + 主题类名逐字）。 */
function ShadcnTooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: TooltipContentProps) {
  return (
    <TooltipPortalRoot>
      <TooltipContentRoot
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          `z-50 inline-flex w-fit max-w-xs origin-(--radix-tooltip-content-transform-origin) items-center gap-1.5 rounded-lg border border-border bg-tooltip px-3 py-1.5 text-ui-sm text-tooltip-foreground has-data-[slot=kbd]:pr-1.5 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-sm data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95`,
          className,
        )}
        {...props}
      >
        {children}
      </TooltipContentRoot>
    </TooltipPortalRoot>
  );
}

/* ============================================================================
 * C1. InfoTooltip（原 J/Y/X，jsx 554–597）——first-party 信息浮层件
 * ==========================================================================*/

/** 原 J（jsx 554）：kbd 标签类名（逐字）。 */
const TOOLTIP_KBD_CLASS = `rounded-md h-4 inline-flex items-center bg-tooltip-tag px-1.5 text-ui-xs font-medium text-tooltip-tag-foreground`;

/** 原 Y（jsx 555）：ref 赋值（函数/对象双形）。 */
function setRefValue(ref: React.Ref<any> | null | undefined, instance: any): void {
  if (ref) {
    if (typeof ref == `function`) {
      ref(instance);
      return;
    }
    (ref as React.MutableRefObject<any>).current = instance;
  }
}

/** A0-CLEANUP4：InfoTooltip 克隆子元素 props 面（className/ref 透传；React19 ref 入 props） */
interface InfoTooltipCloneProps {
  className?: string;
  ref?: React.Ref<HTMLSpanElement>;
}

interface InfoTooltipProps {
  children?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  shortcut?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  className?: string;
  triggerClassName?: string;
  triggerRef?: React.Ref<HTMLSpanElement>;
  /** A0-CLEANUP B-28（D-Viewers #5 前置）：FileTreePanel 调用面收按压缩态属性。 */
  "aria-pressed"?: boolean;
}

/** 原 X（jsx 564）：InfoTooltip（标题/描述/快捷键；Apple 平台用系统字体）。 */
function InfoTooltip({
  children,
  title,
  description,
  shortcut,
  open,
  onOpenChange,
  side = `top`,
  align = `center`,
  sideOffset = 2,
  className,
  triggerClassName,
  triggerRef,
}: InfoTooltipProps) {
  const isApple = isApplePlatform(),
    kbdFontClass = isApple ? `tracking-normal` : `font-mono`,
    kbdStyle = isApple
      ? { fontFamily: `-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", sans-serif` }
      : void 0,
    isElementChild = React.isValidElement(children),
    childRef = isElementChild ? (children as React.ReactElement<InfoTooltipCloneProps>).props.ref : void 0,
    handleTriggerRef = React.useCallback(
      (instance: HTMLSpanElement | null) => {
        setRefValue(childRef, instance), setRefValue(triggerRef, instance);
      },
      [childRef, triggerRef],
    );
  return (
    <ShadcnTooltip open={open} onOpenChange={onOpenChange}>
      <ShadcnTooltipTrigger asChild>
        {isElementChild ? (
          React.cloneElement(children as React.ReactElement<InfoTooltipCloneProps>, {
            className: cn(`shrink-0`, (children as React.ReactElement<InfoTooltipCloneProps>).props.className, triggerClassName),
            ref: handleTriggerRef,
          })
        ) : (
          <span ref={triggerRef} className={cn(`inline-flex shrink-0`, triggerClassName)}>
            {children}
          </span>
        )}
      </ShadcnTooltipTrigger>
      <ShadcnTooltipContent
        align={align}
        side={side}
        sideOffset={sideOffset}
        className={cn(
          description
            ? `max-w-72 flex-col items-start gap-1.5 px-3 py-2 text-left`
            : `max-w-[min(28rem,calc(100vw-1rem))] items-center gap-2 px-2.5 py-1 text-left has-data-[slot=kbd]:pr-1`,
          className,
        )}
      >
        {description ? (
          <div className="flex w-full items-start justify-between gap-3">
            <span className="text-ui-sm font-medium leading-4 text-tooltip-foreground">{title}</span>
            {shortcut ? (
              <kbd data-slot="kbd" className={cn(TOOLTIP_KBD_CLASS, kbdFontClass, `shrink-0`)} style={kbdStyle}>
                {shortcut}
              </kbd>
            ) : null}
          </div>
        ) : (
          <span className="text-ui-sm font-medium whitespace-normal break-words text-tooltip-foreground">{title}</span>
        )}
        {description ? <span className="max-w-64 text-ui-sm/relaxed text-tooltip-foreground/80">{description}</span> : null}
        {!description && shortcut ? (
          <kbd data-slot="kbd" className={cn(TOOLTIP_KBD_CLASS, kbdFontClass, `shrink-0`)} style={kbdStyle}>
            {shortcut}
          </kbd>
        ) : null}
      </ShadcnTooltipContent>
    </ShadcnTooltip>
  );
}

/* ============================================================================
 * C2. 用量格式化助手（原 Z/Q/we/$/Te/Ee–Me，jsx 599–654）
 * ==========================================================================*/

/** 原 Z（jsx 599）：数字格式化（≥1000 用 compact 记法；缺省 1 位小数）。 */
function formatNumberCompact(locale: string, value: number, options: { maximumFractionDigits?: number } = {}): string {
  if (!Number.isFinite(value)) return ``;
  const maximumFractionDigits = options.maximumFractionDigits ?? 1,
    absoluteValue = Math.abs(value);
  return new Intl.NumberFormat(locale || void 0, {
    notation: absoluteValue >= 1e3 ? `compact` : `standard`,
    maximumFractionDigits: maximumFractionDigits,
    minimumFractionDigits: 0,
  }).format(value);
}

/** 原 Q（jsx 609）：热图五级色板（CSS 变量，逐字）。 */
const USAGE_HEATMAP_COLORS = [
  `var(--color-usage-heatmap-0)`,
  `var(--color-usage-heatmap-1)`,
  `var(--color-usage-heatmap-2)`,
  `var(--color-usage-heatmap-3)`,
  `var(--color-usage-heatmap-4)`,
];

/** 原 we（jsx 610）：热图周数。 */
const HEATMAP_WEEK_COUNT = 53;

/** 原 $（jsx 611）：每周天数。 */
const HEATMAP_DAYS_PER_WEEK = 7;

/** 原 Te（jsx 612）：每日毫秒数。 */
const MS_PER_DAY = 864e5;

/** 原 Ee（jsx 613）：次数格式化（≥1000 compact）。 */
function formatCountCompact(locale: string, count: number): string {
  return new Intl.NumberFormat(locale, {
    notation: count >= 1e3 ? `compact` : `standard`,
    maximumFractionDigits: +(count >= 1e3),
  }).format(count);
}

/** 原 De（jsx 619）：token 数格式化（委托 formatNumberCompact）。 */
function formatTokens(locale: string, tokens: number): string {
  return formatNumberCompact(locale, tokens);
}

/** 原 Oe（jsx 622）：百分比（≥10% 取整）。 */
function formatPercent(locale: string, ratio: number): string {
  return new Intl.NumberFormat(locale, {
    style: `percent`,
    maximumFractionDigits: ratio >= 0.1 ? 0 : 1,
  }).format(ratio);
}

/** 原 ke（jsx 628）：UTC 短日期（`Aug 28` 形式；非法输入原样返回）。 */
function formatUtcDateShort(locale: string, isoDate: string): string {
  if (!isoDate) return `--`;
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  return Number.isNaN(date.getTime())
    ? isoDate
    : new Intl.DateTimeFormat(locale, {
        timeZone: `UTC`,
        month: `short`,
        day: `numeric`,
      }).format(date);
}

/** 原 Ae（jsx 637）：模型展示名（空 → settings.usage.unknownModel）。 */
function resolveModelLabel(intl: ZCodeIntl, model: string | null | undefined): string {
  return model?.trim() || intl.formatMessage({ id: `settings.usage.unknownModel` });
}

/** 原 je（jsx 642）：热图单元格底色（按级别取色板，越界回退 0 级）。 */
function heatmapCellStyle(level: number): { backgroundColor: string } {
  return {
    backgroundColor: USAGE_HEATMAP_COLORS[level] ?? USAGE_HEATMAP_COLORS[0],
  };
}

interface UsageHeatmapCellData {
  date: string;
  level: number;
  totalTokens: number;
  turnCount: number;
  toolCallCount: number;
}

/** 原 Me（jsx 647）：热图单元格 tooltip 文案（settings.usage.heatmapCell）。 */
function formatHeatmapCellLabel(locale: string, intl: ZCodeIntl, cell: UsageHeatmapCellData): string {
  return intl.formatMessage(
    { id: `settings.usage.heatmapCell` },
    {
      date: formatUtcDateShort(locale, cell.date),
      tokens: formatTokens(locale, cell.totalTokens),
      turns: formatCountCompact(locale, cell.turnCount),
    },
  );
}

/* ============================================================================
 * C3. 用量卡与空态（原 Ne/Pe，jsx 656–673）
 * ==========================================================================*/

interface UsageStatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: React.ReactNode;
  value: React.ReactNode;
  helper?: React.ReactNode;
  helperPlacement?: "below" | "inline";
  valueSize?: "sm" | "base" | "lg" | "xl";
}

/** 原 Ne（jsx 656）：用量统计卡（图标+标签+数值+辅助文案；四档字号）。 */
function UsageStatCard({
  icon: Icon,
  label,
  value,
  helper,
  helperPlacement = `below`,
  valueSize = `xl`,
}: UsageStatCardProps) {
  const valueElement = (
    <div
      className={cn(
        `truncate font-semibold text-foreground`,
        valueSize === `sm` ? `text-ui-base` : valueSize === `base` ? `text-ui-lg` : valueSize === `lg` ? `text-lg` : `text-3xl`,
      )}
    >
      {value}
    </div>
  );
  return (
    <div className="min-w-0 rounded-lg bg-surface px-3.5 py-3">
      <div className="flex min-w-0 items-center gap-2 text-ui-base text-foreground-subtle">
        <Icon className={`size-3.5 shrink-0 text-foreground-subtle`} />
        <span className="truncate">{label}</span>
      </div>
      {helperPlacement === `inline` && helper ? (
        <div className="mt-2 flex min-w-0 items-baseline gap-2">
          {valueElement}
          <div className="min-w-0 truncate text-ui-base text-foreground-subtle">{helper}</div>
        </div>
      ) : (
        <div className="mt-2">{valueElement}</div>
      )}
      {helper && helperPlacement === `below` ? (
        <div className="mt-0.5 truncate text-ui-base text-foreground-subtle">{helper}</div>
      ) : null}
    </div>
  );
}

/** 原 Pe（jsx 669）：用量空态（虚线框）。 */
function UsageEmptyState({ title, description }: { title: React.ReactNode; description: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center">
      <div className="text-ui-base font-medium text-foreground">{title}</div>
      <div className="mt-2 text-ui-base text-foreground-subtle">{description}</div>
    </div>
  );
}

/* ============================================================================
 * C4. 用量热图（原 Fe–Be，jsx 675–746）——53×7 网格
 * ==========================================================================*/

/** 原 Fe（jsx 675）：UTC 日期 → 天序号（非法返回 null）。 */
function dayIndexOfDate(isoDate: string): number | null {
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : Math.floor(date.getTime() / MS_PER_DAY);
}

/** 原 Ie（jsx 679）：天序号 → UTC ISO 日期（`YYYY-MM-DD`）。 */
function dateOfDayIndex(dayIndex: number): string {
  return new Date(dayIndex * MS_PER_DAY).toISOString().slice(0, 10);
}

/** 原 Le（jsx 682）：空单元格（level 0）。 */
function createEmptyHeatmapCell(date: string): UsageHeatmapCellData {
  return {
    date: date,
    level: 0,
    totalTokens: 0,
    turnCount: 0,
    toolCallCount: 0,
  };
}

export interface UsageHeatmapWeekInput { // A0-CLEANUP3 3b：UsageDeep.AppUsageSnapshot.heatmap 具型消费
  days: Array<UsageHeatmapCellData | null>;
  [key: string]: unknown;
}

interface UsageHeatmapWeek {
  weekIndex: number;
  days: UsageHeatmapCellData[];
}

/** 原 Re（jsx 691）：补齐 53×7 网格（以最后一日对齐，缺日补空单元格）。 */
function normalizeHeatmapWeeks(weeks: UsageHeatmapWeekInput[]): UsageHeatmapWeek[] {
  const validDays = weeks
    .flatMap((week) => week.days)
    .filter((cell) => cell !== null)
    .map((cell) => ({
      cell: cell as UsageHeatmapCellData,
      dayIndex: dayIndexOfDate((cell as UsageHeatmapCellData).date),
    }))
    .filter((entry) => entry.dayIndex !== null);
  if (validDays.length === 0) return weeks as unknown as UsageHeatmapWeek[];
  const cellsByDate = new Map(validDays.map(({ cell }) => [cell.date, cell])),
    gridStartDayIndex =
      Math.max(...validDays.map(({ dayIndex }) => dayIndex as number)) - HEATMAP_WEEK_COUNT * HEATMAP_DAYS_PER_WEEK + 1;
  return Array.from({ length: HEATMAP_WEEK_COUNT }, (_unused, weekIndex) => ({
    weekIndex: weekIndex,
    days: Array.from({ length: HEATMAP_DAYS_PER_WEEK }, (_unusedDay, dayOfWeek) => {
      const date = dateOfDayIndex(gridStartDayIndex + weekIndex * HEATMAP_DAYS_PER_WEEK + dayOfWeek);
      return cellsByDate.get(date) ?? createEmptyHeatmapCell(date);
    }),
  }));
}

interface UsageHeatmapProps {
  locale: string;
  intl: ZCodeIntl;
  weeks: UsageHeatmapWeekInput[];
}

/** 原 ze（jsx 715）：用量热图（标题+图例+横向滚动网格；挂载滚至最右）。 */
function UsageHeatmap({ locale, intl, weeks }: UsageHeatmapProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);
  const normalizedWeeks = normalizeHeatmapWeeks(weeks);
  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const frame = window.requestAnimationFrame(() => {
      container.scrollLeft = container.scrollWidth - container.clientWidth;
    });
    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [weeks.map((week) => week.days.map((day) => day?.date ?? `empty`).join(`:`)).join(`|`)]);
  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-surface px-3 py-3">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="min-w-0 truncate text-ui-base font-medium text-foreground">
            {intl.formatMessage({ id: `settings.usage.heatmapTitle` })}
          </h3>
          <div className="flex shrink-0 items-center gap-2 text-ui-xs text-foreground-subtle">
            <span>{intl.formatMessage({ id: `settings.usage.heatmap.less` })}</span>
            {USAGE_HEATMAP_COLORS.map((color, index) => (
              <div key={index} className="size-3.5 rounded-[4px] border border-border" style={heatmapCellStyle(index)} />
            ))}
            <span>{intl.formatMessage({ id: `settings.usage.heatmap.more` })}</span>
          </div>
        </div>
        <div ref={scrollContainerRef} className="overflow-x-auto !scrollbar-hide">
          <div className="min-w-max pr-2">
            <div className="flex gap-1.5">
              {normalizedWeeks.map((week) => (
                <div key={week.weekIndex} className="flex flex-col gap-1.5">
                  {week.days.map((cell, dayIndex) => (
                    <UsageHeatmapCell key={cell?.date ?? `empty-${week.weekIndex}-${dayIndex}`} cell={cell} locale={locale} intl={intl} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 原 Be（jsx 739）：热图单元格（有色块 + tooltip；空格仅占位）。 */
function UsageHeatmapCell({
  cell,
  locale,
  intl,
}: {
  cell: UsageHeatmapCellData | null | undefined;
  locale: string;
  intl: ZCodeIntl;
}) {
  const swatch = (
    <div
      className={cn(
        `size-3.5 rounded-[4px] border transition-transform hover:scale-110 hover:border-border-hover`,
        (cell?.totalTokens ?? 0) > 0 ? `border-border` : `border-transparent`,
        !cell && `bg-background`,
      )}
      style={cell ? heatmapCellStyle(cell.level) : void 0}
    />
  );
  return cell ? <InfoTooltip title={formatHeatmapCellLabel(locale, intl, cell)}>{swatch}</InfoTooltip> : swatch;
}

/* ============================================================================
 * 导出（原 jsx 747，16 个别名；语义名导出，别名对照见文件头 §二）
 * ==========================================================================*/

export {
  formatTokens,
  resolveModelLabel,
  ShadcnTooltip,
  ShadcnTooltipContent,
  VISUALLY_HIDDEN_STYLE,
  useSyncExternalStoreShim,
  formatCountCompact,
  formatNumberCompact,
  ShadcnTooltipTrigger,
  UsageHeatmap,
  formatUtcDateShort,
  ShadcnTooltipProvider,
  UsageStatCard,
  formatPercent,
  UsageEmptyState,
  InfoTooltip,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
};

/* ============================================================================
 * 尾符号表（混淆名 → 语义名 → jsx 行；全 66 个模块内符号 + 20 导入）
 * ============================================================================
 *  导入：e=toEsmInterop(1) | t=commonJsModule(1) | n=reactModuleFactory(2)
 *   （IntlProvider 副作用导入(3)） | r=jsxRuntimeModuleFactory(4) | i=isApplePlatform(5)
 *   a=createContextScope(6) | o=usePopperScope(6) | s=Portal(6) | c=Primitive(6)
 *   l=PopperRoot(6) | u=DismissableLayer(6) | d=useId(6) | f=PopperArrow(6)
 *   p=useControllableState(6) | m=PopperContent(6) | h=Presence(6) | g=Slot(6)
 *   _=composeEventHandlers(6) | v=useComposedRefs(7) | y=createSlottable(7) | b=cn(8)
 *  radix 段：x=ReactInterop(9) | S=jsxRuntime(10) | C=VISUALLY_HIDDEN_STYLE(11)
 *   w=VISUALLY_HIDDEN_NAME(23) | T=VisuallyHidden(24) | E=VisuallyHiddenComponent(29)
 *   D=useSyncExternalStoreShimFactory(30) | ee=useSyncExternalStoreShim(80)
 *   O=TooltipScope(83) | te=useTooltipScopeFactory(83) | k=useTooltipPopperScope(84)
 *   A=TOOLTIP_PROVIDER_NAME(85) | ne=DEFAULT_DELAY_DURATION(86) | j=TOOLTIP_OPEN_EVENT(87)
 *   re=TooltipProviderContextProvider(88) | M=useTooltipProviderContext(88) | N=TooltipProvider(89)
 *   P=TOOLTIP_NAME(122) | ie=TooltipContextProvider(123) | F=useTooltipContext(123) | I=Tooltip(124)
 *   L=TOOLTIP_TRIGGER_NAME(187) | R=TooltipTrigger(188) | z=TOOLTIP_PORTAL_NAME(217)
 *   ae=TooltipPortalContextProvider(218) | oe=useTooltipPortalContext(218) | B=TooltipPortal(221)
 *   V=TOOLTIP_CONTENT_NAME(243) | H=TooltipContent(244) | se=TooltipContentHoverable(261)
 *   ce=TooltipContentContextProvider(312) | le=useTooltipContentContext(312)
 *   ue=TooltipContentSlottable(315) | U=TooltipContentBase(316)
 *   W=TOOLTIP_ARROW_NAME(372) | de=TooltipArrow(373)
 *   fe=resolveNearestSide(386) | pe=getSideOffsetPoints(404) | me=getRectCornerPoints(446)
 *   he=isPointInPolygon(467) | ge=getSortedHullPoints(484) | _e=getConvexHull(488)
 *   ve=TooltipProviderRoot(513) | ye=TooltipRoot(514) | be=TooltipTriggerRoot(515)
 *   xe=TooltipPortalRoot(516) | Se=TooltipContentRoot(517)
 *  shadcn/用量段：Ce=ShadcnTooltipProvider(518) | G=ShadcnTooltip(528) | K=ShadcnTooltipTrigger(536)
 *   q=ShadcnTooltipContent(544) | J=TOOLTIP_KBD_CLASS(554) | Y=setRefValue(555) | X=InfoTooltip(564)
 *   Z=formatNumberCompact(599) | Q=USAGE_HEATMAP_COLORS(609) | we=HEATMAP_WEEK_COUNT(610)
 *   $=HEATMAP_DAYS_PER_WEEK(611) | Te=MS_PER_DAY(612) | Ee=formatCountCompact(613)
 *   De=formatTokens(619) | Oe=formatPercent(622) | ke=formatUtcDateShort(628)
 *   Ae=resolveModelLabel(637) | je=heatmapCellStyle(642) | Me=formatHeatmapCellLabel(647)
 *   Ne=UsageStatCard(656) | Pe=UsageEmptyState(669) | Fe=dayIndexOfDate(675) | Ie=dateOfDayIndex(679)
 *   Le=createEmptyHeatmapCell(682) | Re=normalizeHeatmapWeeks(691) | ze=UsageHeatmap(715)
 *   Be=UsageHeatmapCell(739)
 *  导出（16）：a=De | c=Ae | d=G | f=q | g=C | h=ee | i=Ee | l=Z | m=K | n=ze | o=ke
 *   p=Ce | r=Ne | s=Oe | t=Pe | u=X
 * ============================================================================
 */
