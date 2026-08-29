/**
 * ════════════════════════════════════════════════════════════════════════════
 *  ZCode 恢复版 · imeComposition-DEYFkwWm.js first-party 层完整解混淆
 *  （D8 Stage B2 · chart 包装/utils/IME 族）
 * ════════════════════════════════════════════════════════════════════════════
 *  原始 chunk   : out/renderer/assets/imeComposition-DEYFkwWm.js（12,605 行）
 *  恢复日期     : 2026-08-26
 *  恢复方法     :
 *    · vendored 库 = 登记制（见下方登记，不逐行还原）；
 *    · first-party 层（平台 provider / toast 系统 / PPTX 元素引用 /
 *      shadcn Input·Textarea·Popover / IME 组词守卫，共 10871–10886、
 *      11781–11822、12053–12569 行）全量语义重建；
 *    · shadcn 包装层逐节对照 shadcn/ui 公开源码（input.tsx / textarea.tsx /
 *      popover.tsx）确认身份；类名为 ZCode 自有设计系统（text-ui-base 等）。
 *
 * ┌──────────────────────────── vendored 登记 ────────────────────────────┐
 * │ 26–290      scheduler（React 调度器；unstable_scheduleCallback 等，   │
 * │             CJS 包装 `ne`，re-export `re`）                            │
 * │ 292–10854   react-dom/client 本体（React 19.2.7 production：          │
 * │             reconciler + 事件系统；版本串 `19.2.7` 于 10811/10822；   │
 * │             `createRoot` 于 10834；devtools hook 注入 10820–10833）   │
 * │ 10855–10868 react-dom/client 入口包装（`ae`，checkDCE + exports；     │
 * │             **导出别名 `P`** —— chunk 导出面里唯一的库级符号）         │
 * │ 10887–11044 @radix-ui/react-focus-scope@1.1.7（FocusScope `pe`，      │
 * │             事件名 focusScope.autoFocusOnMount/Unmount；导出 `k`）     │
 * │ 11045–11065 @radix-ui/react-focus-guards@1.1.3（useFocusGuards `we`， │
 * │             data-radix-focus-guard；导出 `O`）                         │
 * │ 11066–11693 react-remove-scroll@2.7.2（RemoveScroll `Mt` 11691 +      │
 * │             SideCar `jt`；导出 `D`）                                   │
 * │ 11694–11780 aria-hidden@1.2.6（hideOthers `Vt`，data-aria-hidden；    │
 * │             导出 `E`）                                                 │
 * │ 11781–11822 lucide 图标数据 ×6（经 button chunk 的 createLucideIcon   │
 * │             实例化；导出 C/D/S/T/b/w/x 中的 6 个，见符号表）           │
 * │ 11823–12047 @radix-ui/react-popover@1.1.15 全栈（含 popper/presence/  │
 * │             dismissable-layer/portal/context/id/use-controllable-state│
 * │             内联副本；POPOVER_NAME=`Popover` 11823、PopoverTrigger    │
 * │             11867、PopoverPortal 11886、PopoverContent 11901、        │
 * │             PopoverClose 12026、PopoverArrow 12038）                  │
 * │ 12048–12052 scoped popover 导出别名（xn=Root/Sn=Anchor/Cn=Trigger/    │
 * │             wn=Portal/Tn=Content）                                     │
 * │ 与 node_modules 参照安装逐节比对：@radix-ui/react-popover@1.1.15      │
 * │ （createContextScope(POPOVER_NAME,[createPopperScope])、              │
 * │  useControllableState 带 caller 参数、--radix-popover-content-*       │
 * │  CSS 变量映射均一致）。                                                │
 * └────────────────────────────────────────────────────────────────────────┘
 *
 *  与 shadcn/ui 公开源码的对照结论：
 *    · Input = shadcn v4 input.tsx 形态（cva size 变体 xs/sm/default/lg +
 *      htmlSize 透传 + data-slot=input），类名为 ZCode 设计系统；
 *    · Textarea = shadcn v4 textarea.tsx 形态（field-sizing-content +
 *      data-slot=textarea），类名含 ZCode 定制（resize-none/text-ui-base）；
 *    · Popover 族 = shadcn popover.tsx 形态（Root/Trigger/Portal+Content/
 *      Anchor + data-slot），ZCode 定制：z-[60]、rounded-xl、p-2.5、gap-4、
 *      flex-col、border-border、data-open/data-closed 动画；
 *    · isComposingText = ZCode 自有的三重 IME 组词探测
 *      （Lexical compositionActive / DOM isComposing / nativeEvent.isComposing）。
 *
 *  行为等价声明：本文件与原始 chunk first-party 段运行时行为等价——
 *    1) 全部类名/事件名/存储键/正则/模板逐字保留；
 *    2) `??`/`?.` 短路、默认参数、闭包计数与 Set 去抖（pending/cancelled
 *       toast id 双集合）逻辑逐字保留；
 *    3) `typeof X > 'u'` 压缩写法展开为 `typeof X === 'undefined'`（等价）；
 *    4) ToastItem 原码有一处被 minify 残留的死读 `, e.variant`（无副作用，
 *       未保留，见注释）；
 *    5) 导出面对齐原 chunk 34 个导出中的 28 个 first-party 符号；
 *       6 个 vendored 再导出（D/E/O/P/k + lucide 图标 6 个中的库实例）
 *       以登记替代重建（图标 6 个因体量小已重建）。
 * ════════════════════════════════════════════════════════════════════════════
 */


/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/ime/ImeComposition.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

export {
  PlatformProvider,
  useOptionalPlatform,
  usePlatform,
  useSelectDirectory,
  usePlatformService,
  Info,
  InfoIcon,
  LoaderCircle,
  SpinnerIcon,
  MousePointer2,
  Sparkles,
  TriangleAlert,
  XIcon,
  inputVariants,
  Input,
  Textarea,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
  isComposingText,
  toast,
  dismissToast,
  PPTX_ELEMENT_REFERENCE_EVENT_TYPE,
  fallbackTo,
  isSameWorkspaceTarget,
  isPptxElementReference,
  sha256Fingerprint,
  buildPptxElementReference,
  upsertPptxElementReference,
  appendPptxElementReferences,
  extractPptxElementReferences,
  isPptxElementReferenceEvent,
  dispatchPptxElementReferenceEvent,
} from '../components/ime/ImeComposition';
export type {
  PlatformService,
  PlatformProviderProps,
  InputProps,
  CompositionStateProbe,
  ToastPosition,
  ToastVariant,
  ToastOptions,
  PptxElementReference,
  BuildPptxElementReferenceInput,
} from '../components/ime/ImeComposition';
