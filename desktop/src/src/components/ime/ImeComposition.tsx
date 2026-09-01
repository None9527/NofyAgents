// A0-S4-4c: 自 modules/ImeComposition.tsx 原样整体迁入（组件全族 + 私有辅助 + 局部型别 + 尾部符号表；原文件现为薄 re-export shim）。
// 仅导入路径按 components/ime/ 深度改指（./ → ../../modules/；../components/ → ../；其余 ../ → ../../）；迁出体逐字未动。
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

import * as React from 'react';
import { createRoot } from 'react-dom/client';
// @radix-ui/react-popover@1.1.15：原 chunk 在 11823–12047 内联 vendored 同一版本，
// 此处自 npm 参照安装导入（类型齐备），语义一致。
import * as PopoverPrimitive from '@radix-ui/react-popover';

// ─── 跨 chunk 依赖（改接重建模块） ───────────────────────────
// utils-CEEH0K_K.js 导出 t = cn（见 UtilsCn.tsx）。
import { cn as cnMin } from '../../modules/UtilsCn'; // 原 utils-CEEH0K_K t
// button-laUijeDG.js 导出 c = createLucideIcon、r = cva（见 button.tsx 重建）。
import { createLucideIcon as createLucideIconMin, cva as cvaMin } from '../../modules/button'; // 原 button-laUijeDG c, r
import type { InstalledEditor } from '../../modules/FileTreePanel'; // A1-R48：getInstalledEditors 返回型属主（A0-CLEANUP B-21 既判；TopBar@134 同向 type import 先例）
import type { DesktopMenuActionIds } from '../../modules/SrcSharedB'; // A1-R48：executeDesktopCommand 参型源（src ex@8631 / export ft；oi 收敛既判 = WorkspaceShell@263 A1-P2-B1 / Sidebar@220 A1-P3-B1）
import type { UpdateState } from '../shell/TopBar'; // A1-R48：更新态型属主（TopBar@212 export；WorkspaceShell@219 消费链在案）
import type { ChromeImportResult } from '../settings/BrowserSettingsSection'; // A1-R48：Chrome 导入结果型属主（Browser@49 export；modules/Settings@167 type import 先例）
import type { TempTextAttachmentMeta } from '../../modules/Composer'; // 〔A1-R49〕createTempTextAttachment 返型属主（Composer@542 export；type-only 回边零运行期环，R48 四向先例同式）

/* ─────────────────────────── 依赖的类型化绑定 ─────────────────────────── */

const cn = cnMin as (
  ...inputs: Array<string | false | null | undefined | Record<string, boolean | null | undefined>>
) => string;

/** lucide 图标节点：[标签名, 属性表]（属性含 lucide 的 key 哈希）。 */
type LucideIconNode = Array<[string, Record<string, string>]>;

/** lucide 图标组件（forwardRef SVG，接受 size/className 等）。 */
type LucideIcon = React.ForwardRefExoticComponent<
  Omit<React.SVGProps<SVGSVGElement>, 'ref'> & {
    size?: string | number;
    absoluteStrokeWidth?: boolean;
  } & React.RefAttributes<SVGSVGElement>
>;

const createLucideIcon = createLucideIconMin as (name: string, iconNode: LucideIconNode) => LucideIcon;

/**
 * class-variance-authority（button chunk 内联副本，与 cva@0.7.1 逐语句一致，
 * 见 button.tsx 重建）。此处只建模本模块用到的形态：基类 + 单维 variants。
 */
const cva = cvaMin as (
  base: string,
  config?: {
    variants?: Record<string, Record<string, string>>;
    defaultVariants?: Record<string, string>;
  },
) => (variants?: { size?: 'xs' | 'sm' | 'default' | 'lg'; className?: string }) => string;

/* ════════════════════════ 1. 平台 Provider 族（10871–10886） ════════════════════════
 * 原码：`oe`=createContext(null)、`se`=PlatformProvider、`ce`=usePlatform、
 * `le`=useOptionalPlatform、`ue`=useSelectDirectory。
 * 由应用根 `g8t`（styles chunk js 212600）以 `<PlatformProvider platform={…}>`
 * 包裹全树；platform 对象由主进程 IPC 桥注入。
 * ════════════════════════════════════════════════════════════════════════ */

/** A1-R48：桌面命令值并 = DesktopMenuActionIds 成员值并（Sidebar@268 同形别名先例；oi 收敛既判 A1-P2-B1/A1-P3-B1）。 */
type DesktopCommand = (typeof DesktopMenuActionIds)[keyof typeof DesktopMenuActionIds];

/**
 * 桌面平台服务（调用面归纳）。本 chunk 仅消费 selectDirectory()；
 * 完整服务面：A1-R48 富面增补已括（签名源 = TopBar@164-190 本地面 A0 转录 + 宿主桥接真值 index-ABImDspU.js X@~337-474/Pe@201-234）。
 * // TODO(infer): 返回类型按 `await a.selectDirectory()` 的字符串路径用法推断。
 */
export interface PlatformService {
  /** 打开系统目录选择器；返回所选目录路径（取消时为空值）。 */
  selectDirectory(): Promise<string | null | undefined>;
  /** 打开外部链接（TopBar.tsx PlatformService 登记同面；UsageDeep/Bots 消费）。 */
  openExternal(url: string): void | Promise<void>;
  /* A0-CLEANUP3 3b：同一平台服务兼遥测面（StoresDeep.TelemetryPlatform 消费面；bundle 真值） */
  reportTelemetryEvent(report: Record<string, unknown>): Promise<void> | void;
  reportArmsCustomEvent(event: { name: string; group?: string; value?: number | string; [key: string]: unknown }): Promise<void> | void;
  /** A1-R11（JM 53511 真形）：运行时偏好同步（settingService.update 之后随补丁广播） */
  syncAppSettings?(patch: unknown): void;
  /** A1-R11（JM 53505 真形）：宿主设置变更订阅；返回取消函数（McpSettingsSection 40/BrowserSettingsSection 31 本地面同形） */
  onSettingsChanged?(callback: () => void): () => void;
  /** A1-R15 型缝（vWe 54319 消费面）：窗口截图（宿主桥接；rendererEntry 534 提供面同形，TopBar 187 本地面已列） */
  captureWindowScreenshot?(): Promise<Blob | null>;
  /* ── A1-R48 富面增补（宿主桥接真值 = index-ABImDspU.js X@~337-474 window.zcode 直裹 + ...Pe@201-234；
   *    签名源 = TopBar 本地面@164-190（A0 转录）+ 子批 2 八件与 Sidebar 本地面既判形；增补式 = R11/R15 既判例。
   *    必选七员 = 直消费无守卫（TopBar/Commands/Skills/Subagents 实测）；余皆可选（守卫/可空链消费）。 ── */
  /** 文件管理器打开（TopBar@1252/Commands@619/Skills@559/Subagents@352 直消费） */
  openInFileManager(path: string): Promise<{ success: boolean; error?: string }>;
  /** 外部编辑器打开（TopBar@1845；remoteTarget 结构化内联——RemoteTarget 统一属主裁定留批） */
  openInEditor(
    editorId: string,
    path: string,
    opts?: {
      pathKind?: "directory";
      remoteTarget?: { kind: "ssh" | "wsl" | "docker" | "server"; host?: string; port?: number; container?: string; sshConfigAlias?: string };
      workspaceIdentity?: string | null;
    },
  ): Promise<{ success: boolean; error?: string }>;
  getInstalledEditors(): Promise<InstalledEditor[]>;
  canOpenCommunity(locale: string): Promise<boolean>;
  openCommunity(): void;
  executeDesktopCommand(command: DesktopCommand): Promise<void>;
  exportLogs(): Promise<{ success: boolean; error?: string }>;
  getUpdateState?(): Promise<UpdateState | null>;
  onUpdateStateChanged?(cb: (s: UpdateState | null) => void): () => void;
  downloadUpdate?(): Promise<void>;
  cancelUpdateDownload?(): Promise<void>;
  skipUpdateVersion?(version: string): Promise<void>;
  quitAndInstallUpdate?(): Promise<void>;
  openUpdateStatusWindow?(): void;
  getAutoUpdatePreferences?(): Promise<{ autoDownloadAndInstallUpdates: boolean }>;
  setAutoDownloadAndInstallUpdates?(v: boolean): Promise<void>;
  getZCodeStdioTapDevState?(): Promise<{ enabled: boolean; visible: boolean }>;
  getDesktopSessionActivity?(): Promise<{ runningAgentSessionCount: number; runningRepoWikiTaskCount: number }>;
  /** 宿主桥接常量面（桥接为 !0 常量，非函数；PluginLeaves@501 消费） */
  canSelectFilePath?: boolean;
  getPathForFile?(file: File): string | null;
  /* ── 〔A1-R49〕富面续补（子批 3 Composer 件受理；桥接真值 = rendererEntry
   *    desktopPlatformBridge@458-460：selectFile/selectFiles/createTempTextAttachment
   *    三员透传 window.zcode，与 R48 桥接字面量同源）。签名源 = Composer@548-557
   *    本地面既判形（消费位 5736/6173 实测）；均可选（桥接带 ?. 守卫/兜底）。 ── */
  /** 单文件选择（Composer@5736 兜底臂 `platform.selectFile!()`；RemoteWizard@731 同形消费） */
  selectFile?(): Promise<string | null | undefined>;
  /** 多文件选择（Composer@5736 首选臂；桥接 `?? Promise.resolve([])` 兜底） */
  selectFiles?(): Promise<string[]>;
  /** 粘贴文本临时附件（Composer@6173 `createTempTextAttachment?.({ text, filename })`） */
  createTempTextAttachment?(args: { text: string; filename: string }): Promise<TempTextAttachmentMeta | null | undefined>;
  importChromeBrowserData?(): Promise<ChromeImportResult>;
  clearEmbeddedBrowserData?(mode: "cache" | "all"): Promise<{ success: boolean }>;
  getWindowControlsOverlayMetrics?(): { rightPaddingPx?: number } | null;
  onWindowControlsOverlayChanged?(cb: (m: { rightPaddingPx?: number }) => void): () => void;
  getDesktopZoomLevel?(): Promise<{ zoomLevel: number }>;
  onDesktopZoomLevelChanged?(cb: (e: { zoomLevel: number }) => void): () => void;
  getWebRemoteControlStatus?(): Promise<{ status: "idle" | "starting" | "connecting" | "running" | "active" | "error"; [key: string]: unknown }>;
  onWebRemoteControlStatusChanged?(cb: (s: { status: "idle" | "starting" | "connecting" | "running" | "active" | "error"; [key: string]: unknown }) => void): () => void;
  /** 其余方法由其他族消费，此处以索引签名兜底。 */
  [method: string]: unknown;
}

/** 平台上下文（原码 `oe`，缺省 null）。 */
const PlatformContext = React.createContext<PlatformService | null>(null);

export interface PlatformProviderProps {
  platform: PlatformService;
  children: React.ReactNode;
}

/** PlatformProvider（原码 `se`，导出别名 `A`）。 */
export function PlatformProvider({ platform, children }: PlatformProviderProps) {
  return <PlatformContext.Provider value={platform}>{children}</PlatformContext.Provider>;
}

/** useOptionalPlatform（原码 `le`，导出别名 `j`）：容器外返回 null。 */
export function useOptionalPlatform(): PlatformService | null {
  return React.useContext(PlatformContext);
}

/**
 * usePlatform（原码 `ce`，导出别名 `M`）。
 * 错误消息为原码中文串，逐字保留。
 */
export function usePlatform(): PlatformService {
  const platform = useOptionalPlatform();
  if (!platform) {
    throw new Error('usePlatform 必须在 PlatformProvider 内使用');
  }
  return platform;
}

/**
 * useSelectDirectory（原码 `ue`，导出别名 `N`）：
 * 稳定化的目录选择器调用（依赖数组 [platform]）。
 */
export function useSelectDirectory(): () => Promise<string | null | undefined> {
  const platform = usePlatform();
  return React.useCallback(() => platform.selectDirectory(), [platform]);
}

/** usePlatformService（bundle l = 本 chunk 导出别名 M）：usePlatform 的域外消费别名。 */
export const usePlatformService = usePlatform;

/* ════════════════════════ 2. lucide 图标 ×6（11781–11822） ════════════════════════
 * vendored lucide 图标数据（与 lucide-react 各图标定义逐字一致，含 key 哈希），
 * 经 button chunk 的 createLucideIcon 实例化。供 toast 卡片使用。
 * ════════════════════════════════════════════════════════════════════════ */

/** info（原码 `Ht`，导出别名 `T`）。 */
export const Info = createLucideIcon('info', [
  ['circle', { cx: '12', cy: '12', r: '10', key: '1mglay' }],
  ['path', { d: 'M12 16v-4', key: '1dtifu' }],
  ['path', { d: 'M12 8h.01', key: 'e9boi3' }],
]);

/** InfoIcon（bundle T=Ht `info`）：Info 的域外消费别名。 */
export const InfoIcon = Info;

/** loader-circle（原码 `Ut`，导出别名 `w`；全应用 spinner 图标）。 */
export const LoaderCircle = createLucideIcon('loader-circle', [
  ['path', { d: 'M21 12a9 9 0 1 1-6.219-8.56', key: '13zald' }],
]);

/** SpinnerIcon（bundle w）：LoaderCircle 的域外消费别名（调用面自加 animate-spin）。 */
export const SpinnerIcon = LoaderCircle;

/** mouse-pointer-2（原码 `Wt`，导出别名 `C`；PPTX 元素选择指针）。 */
export const MousePointer2 = createLucideIcon('mouse-pointer-2', [
  [
    'path',
    {
      d: 'M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z',
      key: 'edeuup',
    },
  ],
]);

/** sparkles（原码 `Gt`，导出别名 `S`；PPTX AI 批注入口）。 */
export const Sparkles = createLucideIcon('sparkles', [
  [
    'path',
    {
      d: 'M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z',
      key: '1s2grr',
    },
  ],
  ['path', { d: 'M20 2v4', key: '1rf3ol' }],
  ['path', { d: 'M22 4h-4', key: 'gwowj6' }],
  ['circle', { cx: '4', cy: '20', r: '2', key: '6kqj1y' }],
]);

/** triangle-alert（原码 `Kt`，导出别名 `x`；warning toast 图标）。 */
export const TriangleAlert = createLucideIcon('triangle-alert', [
  [
    'path',
    {
      d: 'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3',
      key: 'wmoenq',
    },
  ],
  ['path', { d: 'M12 9v4', key: 'juzpu7' }],
  ['path', { d: 'M12 17h.01', key: 'p32p05' }],
]);

/** x（原码 `qt`，导出别名 `b`；toast 关闭按钮图标）。 */
export const XIcon = createLucideIcon('x', [
  ['path', { d: 'M18 6 6 18', key: '1bl5f8' }],
  ['path', { d: 'm6 6 12 12', key: 'd8bk6v' }],
]);

/* ════════════════════════ 3. shadcn Input / Textarea（12053–12090） ════════════════════════
 * 原码：`En`=inputVariants(cva)、`Dn`=Input（导出 y）、`On`=Textarea（导出 v）。
 * ════════════════════════════════════════════════════════════════════════ */

/**
 * Input 尺寸变体（原码 `En`，ZCode 设计系统；注意 text-ui-* 字号族
 * 已在 utils 的 tailwind-merge font-size 组登记，参与冲突消解）。
 */
export const inputVariants = cva(
  'w-full min-w-0 border border-input-border bg-input text-foreground transition-colors outline-none file:inline-flex file:border-0 file:bg-transparent file:font-medium file:text-foreground placeholder:text-foreground-subtlest hover:border-input-border-hover focus-visible:border-input-border-focused focus-visible:bg-input-focused focus-visible:ring-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
  {
    variants: {
      size: {
        xs: 'h-5 rounded-sm px-2 py-0.5 text-ui-base file:h-4 file:text-ui-base',
        sm: 'h-6 rounded-md px-2 py-0.5 text-ui-base/relaxed file:h-5 file:text-ui-base/relaxed',
        default: 'h-7 rounded-md px-2 py-0.5 text-ui-base md:text-ui-base/relaxed file:h-6 file:text-ui-base/relaxed',
        lg: 'h-8 rounded-lg px-3 py-1.5 text-ui-base file:h-6 file:text-ui-base',
      },
    },
    defaultVariants: { size: 'default' },
  },
);

export interface InputProps extends Omit<React.ComponentProps<'input'>, 'size'> {
  /** cva 尺寸变体（缺省 default）。 */
  size?: 'xs' | 'sm' | 'default' | 'lg';
  /** 原生 input[size] 属性（原码以 htmlSize 名透传，避免与变体冲突）。 */
  htmlSize?: number;
  className?: string;
}

/**
 * shadcn Input（原码 `Dn`，导出别名 `y`）。
 * data-slot=input；`cn(inputVariants({ size }), className)` 类名合成。
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, htmlSize, size = 'default', type, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      size={htmlSize}
      data-slot="input"
      className={cn(inputVariants({ size }), className)}
      {...props}
    />
  );
});

/**
 * shadcn Textarea（原码 `On`，导出别名 `v`）。
 * data-slot=textarea；field-sizing-content 自适应高度；ZCode 定制 resize-none。
 */
export function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex field-sizing-content min-h-16 w-full resize-none rounded-md border border-input bg-input/20 px-2 py-2 text-ui-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 md:text-ui-base/relaxed',
        className,
      )}
      {...props}
    />
  );
}

/* ════════════════════════ 4. shadcn Popover 族（12537–12566） ════════════════════════
 * 原码：`pr`=Popover（导出 n）、`mr`=PopoverTrigger（导出 a）、
 * `hr`=PopoverContent（导出 i）、`gr`=PopoverAnchor（导出 r）。
 * 底层原语为内联 vendored 的 @radix-ui/react-popover@1.1.15
 * （xn=Root/Sn=Anchor/Cn=Trigger/wn=Portal/Tn=Content）。
 * ════════════════════════════════════════════════════════════════════════ */

/** Popover 根（原码 `pr`，导出别名 `n`）。 */
export function Popover(props: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

/** Popover 触发器（原码 `mr`，导出别名 `a`）。 */
export function PopoverTrigger(props: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

/**
 * Popover 内容（原码 `hr`，导出别名 `i`）。
 * Portal + Content（align 缺省 center、sideOffset 缺省 4）；
 * ZCode 定制类名：z-[60]、rounded-xl、p-2.5、gap-4 flex-col、border-border、
 * data-open/data-closed 进出场动画。
 */
export function PopoverContent({
  className,
  align = 'center',
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'z-[60] flex w-72 origin-(--radix-popover-content-transform-origin) flex-col gap-4 rounded-xl bg-popover p-2.5 text-ui-base text-popover-foreground shadow-md border border-border overflow-hidden outline-hidden duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

/** Popover 锚点（原码 `gr`，导出别名 `r`；bundle FBt styles-158095 收透传 props）。 */
export function PopoverAnchor(props: React.ComponentProps<typeof PopoverPrimitive.Anchor> & Record<string, unknown>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

/* ════════════════════════ 5. IME 组词守卫（12567–12569） ════════════════════════
 * 原码：`_r`（导出别名 `t`）——本 chunk 得名于斯（imeComposition）。
 * ════════════════════════════════════════════════════════════════════════ */

/**
 * IME 组词状态探测面：三重来源任一为真即视为组词中——
 *  1) compositionActive：Lexical 编辑器状态（composer 族）；
 *  2) isComposing：DOM KeyboardEvent.isComposing / 编辑器合成标志；
 *  3) nativeEvent.isComposing：React 合成事件下的原生事件标志。
 * // TODO(infer): 字段按原码读取面建模；调用方含 Lexical 编辑器与原生 input。
 */
export interface CompositionStateProbe {
  compositionActive?: boolean;
  isComposing?: boolean;
  nativeEvent?: { isComposing?: boolean };
}

/**
 * isComposingText（原码 `_r`，导出别名 `t`）。
 * 回车提交守卫：组词中按回车只确认候选词、不提交
 * （任务重命名对话框 j6 等处的 `!isComposingText(e) && submit()` 模式）。
 */
export function isComposingText(state: CompositionStateProbe): boolean {
  return !!(state.compositionActive || state.isComposing || state.nativeEvent?.isComposing);
}

/* ════════════════════════ 6. Toast 系统（12091–12405） ════════════════════════
 * 原码：`kn`=react-dom/client interop（vendored，导出 P）、`An` 计数器、
 * `jn/Mn` push/dismiss 闭包、`Nn/Pn` pending/cancelled id 集合、
 * `Fn`=3000 缺省时长、`In`=200 退场动画、`Ln` ensureToastHost、
 * `Rn` ToastHost、`zn` anchorCenterX、`Bn` AnchoredToastGroup、
 * `Vn` ToastItem、`Hn` ToastCard、`Un` toast（导出 _）、`Wn` dismissToast（导出 g）。
 * 宿主：`#zcode-toast-host` 独立 React 根（createRoot），脱离主应用树。
 * ════════════════════════════════════════════════════════════════════════ */

export type ToastPosition = 'top-center' | 'top-right' | 'bottom-left';
export type ToastVariant = 'default' | 'info' | 'warning' | 'update';

export interface ToastOptions {
  /** 展示时长（ms）；缺省 3000；非有限或 ≤0 时不自动消失。 */
  durationMs?: number;
  /** 位置；缺省 top-center。 */
  position?: ToastPosition;
  /** 变体；缺省 default（update/info/warning 有专属卡片布局）。 */
  variant?: ToastVariant;
  /** 动作按钮文案（与 onAction 配对）。 */
  actionLabel?: string;
  onAction?: () => void;
  /** info/warning 变体是否显示关闭按钮。 */
  dismissible?: boolean;
  /** 关闭按钮 aria-label 缺省 'Close'。 */
  dismissLabel?: string;
  /** 锚定元素 id：toast 跟随该元素水平居中（top-center 专属）。 */
  anchorId?: string;
}

interface ToastItemModel {
  id: number;
  message: string;
  durationMs: number;
  position: ToastPosition;
  variant: ToastVariant;
  actionLabel?: string;
  onAction?: () => void;
  dismissible?: boolean;
  dismissLabel?: string;
  anchorId?: string;
}

/** toast id 计数器（原码 `An`）。 */
let toastIdCounter = 0;
/** ToastHost 挂载后注册的入队闭包（原码 `jn`）。 */
let pushToast: ((item: ToastItemModel) => void) | null = null;
/** ToastHost 挂载后注册的移除闭包（原码 `Mn`）。 */
let removeToastById: ((id: number) => void) | null = null;
/** 已发起但宿主尚未接收的 toast id（原码 `Nn`）。 */
const pendingToastIds = new Set<number>();
/** 在宿主接收前就被取消的 toast id（原码 `Pn`）。 */
const cancelledToastIds = new Set<number>();
/** 缺省展示时长（原码 `Fn` = 3e3）。 */
const DEFAULT_TOAST_DURATION_MS = 3000;
/** 退场动画时长（原码 `In` = 200）。 */
const TOAST_EXIT_ANIMATION_MS = 200;

/**
 * ensureToastHost（原码 `Ln`）：幂等地创建 `#zcode-toast-host` 并挂载
 * 独立 React 根渲染 ToastHost。
 */
function ensureToastHost(): void {
  if (pushToast) return;
  const host = document.createElement('div');
  host.id = 'zcode-toast-host';
  document.body.appendChild(host);
  createRoot(host).render(<ToastHost />);
}

/**
 * ToastHost（原码 `Rn`）：持有 toast 列表，按位置分三列 + 锚定组渲染。
 * 挂载时把 push/dismiss 闭包注册到模块级变量，卸载时清空。
 */
function ToastHost() {
  const [items, setItems] = React.useState<ToastItemModel[]>([]);

  React.useEffect(() => {
    pushToast = (item) => {
      pendingToastIds.delete(item.id);
      if (cancelledToastIds.has(item.id)) {
        cancelledToastIds.delete(item.id);
        return;
      }
      setItems((prev) => [...prev, item]);
    };
    removeToastById = (id) => {
      setItems((prev) => prev.filter((item) => item.id !== id));
    };
    return () => {
      pushToast = null;
      removeToastById = null;
    };
  }, []);

  const handleDone = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const topCenterItems = items.filter((item) => item.position === 'top-center' && !item.anchorId);
  const topRightItems = items.filter((item) => item.position === 'top-right');
  const bottomLeftItems = items.filter((item) => item.position === 'bottom-left');

  const anchoredGroups = new Map<string, ToastItemModel[]>();
  for (const item of items) {
    if (item.position !== 'top-center' || !item.anchorId) continue;
    const group = anchoredGroups.get(item.anchorId) ?? [];
    group.push(item);
    anchoredGroups.set(item.anchorId, group);
  }

  return (
    <>
      <div className="fixed top-4 left-1/2 z-[9999] flex -translate-x-1/2 translate-y-12 flex-col items-center gap-2">
        {topCenterItems.map((item) => (
          <ToastItem key={item.id} item={item} onDone={handleDone} />
        ))}
      </div>
      <div className="fixed right-4 top-4 z-[9999] flex max-w-[calc(100vw-2rem)] translate-y-12 flex-col items-end gap-2">
        {topRightItems.map((item) => (
          <ToastItem key={item.id} item={item} onDone={handleDone} />
        ))}
      </div>
      <div className="fixed bottom-4 left-4 z-[9999] flex translate-y-12 flex-col items-start gap-2">
        {bottomLeftItems.map((item) => (
          <ToastItem key={item.id} item={item} onDone={handleDone} isBottomLeft />
        ))}
      </div>
      {[...anchoredGroups].map(([anchorId, groupItems]) => (
        <AnchoredToastGroup key={anchorId} anchorId={anchorId} items={groupItems} onDone={handleDone} />
      ))}
    </>
  );
}

/** 锚定元素水平中心（原码 `zn`）。 */
function anchorCenterX(rect: DOMRect): number {
  return rect.left + rect.width / 2;
}

/**
 * AnchoredToastGroup（原码 `Bn`）：跟随 `#anchorId` 元素水平居中的 toast 组。
 * ResizeObserver（元素尺寸）+ MutationObserver（元素重建）+ resize/scroll
 * 监听保持 left 定位；锚点缺失时退回 `left-1/2`。
 */
function AnchoredToastGroup({
  anchorId,
  items,
  onDone,
}: {
  anchorId: string;
  items: ToastItemModel[];
  onDone: (id: number) => void;
}) {
  const [centerX, setCenterX] = React.useState<number | null>(null);

  React.useEffect(() => {
    let observedElement: HTMLElement | null = null;
    const resizeObserver =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(() => measure());
    const measure = () => {
      const element = document.getElementById(anchorId);
      if (element !== observedElement) {
        if (observedElement) resizeObserver?.unobserve(observedElement);
        observedElement = element;
        if (element) resizeObserver?.observe(element);
      }
      setCenterX(element ? anchorCenterX(element.getBoundingClientRect()) : null);
    };
    measure();
    const mutationObserver =
      typeof MutationObserver === 'undefined' ? null : new MutationObserver(measure);
    mutationObserver?.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', measure);
    document.addEventListener('scroll', measure, { capture: true, passive: true });
    return () => {
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      window.removeEventListener('resize', measure);
      document.removeEventListener('scroll', measure, true);
    };
  }, [anchorId]);

  return (
    <div
      className={cn(
        'fixed top-4 z-[9999] flex -translate-x-1/2 translate-y-12 flex-col items-center gap-2',
        centerX === null && 'left-1/2',
      )}
      style={centerX === null ? undefined : { left: centerX }}
    >
      {items.map((item) => (
        <ToastItem key={item.id} item={item} onDone={onDone} />
      ))}
    </div>
  );
}

/**
 * ToastItem（原码 `Vn`）：单条 toast 的生命周期——
 * rAF 置可见（进场过渡）；时长到期先置不可见、200ms 后移除。
 * 注：原码此处有一处 minify 残留的死读 `, e.variant`（无副作用，未保留）。
 */
function ToastItem({
  item,
  onDone,
  isBottomLeft,
}: {
  item: ToastItemModel;
  onDone: (id: number) => void;
  isBottomLeft?: boolean;
}) {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    if (!Number.isFinite(item.durationMs) || item.durationMs <= 0) {
      return;
    }
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDone(item.id), TOAST_EXIT_ANIMATION_MS);
    }, item.durationMs);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [titleLine, ...bodyLines] = item.message.split('\n');
  const body = bodyLines.join('\n').trim();

  const dismiss = () => {
    setVisible(false);
    window.setTimeout(() => onDone(item.id), TOAST_EXIT_ANIMATION_MS);
  };

  return (
    <ToastCard
      item={item}
      visible={visible}
      isBottomLeft={isBottomLeft}
      title={titleLine}
      body={body}
      onAction={() => {
        item.onAction?.();
        dismiss();
      }}
      onDismiss={dismiss}
    />
  );
}

/**
 * ToastCard（原码 `Hn`）：按变体三态渲染——
 *  update：紧凑三列网格（圆点 + 标题/副题 + 动作按钮，左下角原点动画）；
 *  info/warning：图标 + 正文 + 下划线动作 + 可关闭；
 *  default：纯文本气泡（whitespace-pre-line）。
 * 进出场用 translate/scale/opacity 过渡（200ms cubic-bezier(0.77,0,0.175,1)）。
 */
function ToastCard({
  item,
  visible,
  isBottomLeft,
  title,
  body,
  onAction,
  onDismiss,
}: {
  item: ToastItemModel;
  visible: boolean;
  isBottomLeft?: boolean;
  title: string;
  body: string;
  onAction?: () => void;
  onDismiss: () => void;
}) {
  const isUpdate = item.variant === 'update';
  const isInfoOrWarning = item.variant === 'info' || item.variant === 'warning';
  const isTopRight = item.position === 'top-right';
  const [firstLine, ...restLines] = item.message.split('\n');
  const resolvedTitle = title ?? firstLine;
  const resolvedBody = body ?? restLines.join('\n').trim();

  return (
    <div
      className={cn(
        'rounded-2xl border bg-toast/60 text-ui-base shadow-lg backdrop-blur-xl transition-[transform,opacity] duration-200 ease-[cubic-bezier(0.77,0,0.175,1)] motion-reduce:transform-none motion-reduce:transition-opacity',
        isUpdate
          ? 'origin-bottom-left w-[min(300px,calc(100vw-1rem))] max-w-[min(300px,calc(100vw-1rem))] border-popover-border text-foreground shadow-lg'
          : isInfoOrWarning
            ? 'w-[min(536px,calc(100vw-2rem))] border-border text-foreground'
            : 'border-border px-4 py-3 text-foreground whitespace-pre-line',
        isTopRight
          ? visible
            ? 'translate-x-0 opacity-100'
            : 'translate-x-[calc(100%+1rem)] opacity-0'
          : isBottomLeft
            ? visible
              ? 'translate-y-0 scale-100 opacity-100'
              : 'translate-y-1 scale-[0.98] opacity-0'
            : visible
              ? 'translate-y-0 scale-100 opacity-100'
              : '-translate-y-1 scale-[0.98] opacity-0',
      )}
    >
      {isUpdate ? (
        <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-2.5 py-2">
          <span
            className="size-2 shrink-0 rounded-full bg-primary/80 ring-4 ring-accent"
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1">
            <div className="truncate text-ui-base font-medium text-foreground">{resolvedTitle}</div>
            {resolvedBody ? (
              <div className="mt-0.5 truncate text-ui-base leading-4 text-foreground-subtle">
                {resolvedBody}
              </div>
            ) : null}
          </div>
          {item.actionLabel ? (
            <button
              type="button"
              onClick={onAction ?? item.onAction}
              className="h-7 max-w-14 shrink-0 truncate rounded-md bg-secondary px-2 text-ui-base font-medium text-foreground transition-colors hover:bg-hover"
            >
              {item.actionLabel}
            </button>
          ) : null}
        </div>
      ) : isInfoOrWarning ? (
        <div className="flex min-w-0 items-center gap-4 px-4">
          {item.variant === 'warning' ? (
            <TriangleAlert className="size-4 shrink-0 text-warning" aria-hidden="true" />
          ) : (
            <Info className="size-4 shrink-0 text-foreground-subtle" aria-hidden="true" />
          )}
          <div className="flex min-w-0 flex-[1_0_0] items-start gap-4 py-3 text-sm">
            <div className="min-w-0 flex-1 leading-5">
              <div className="text-foreground">{resolvedTitle}</div>
              {resolvedBody ? (
                <div className="mt-0.5 whitespace-pre-line text-foreground-subtle">{resolvedBody}</div>
              ) : null}
            </div>
            {item.actionLabel ? (
              <button
                type="button"
                onClick={onAction ?? item.onAction}
                className="shrink-0 whitespace-nowrap font-medium leading-snug text-foreground underline underline-offset-2 hover:text-foreground-subtle"
              >
                {item.actionLabel}
              </button>
            ) : null}
          </div>
          {item.dismissible ? (
            <button
              type="button"
              onClick={onDismiss}
              aria-label={item.dismissLabel ?? 'Close'}
              className="flex size-6 shrink-0 items-center justify-center rounded-md text-foreground-subtle hover:bg-hover hover:text-foreground"
            >
              <XIcon className="size-3.5" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      ) : (
        item.message
      )}
    </div>
  );
}

/**
 * toast（原码 `Un`，导出别名 `_`）：入队一条 toast，返回其数字 id。
 * 宿主未就绪时以 rAF 自旋重试（push 闭包注册即生效）。
 */
export function toast(message: string, options?: ToastOptions): number {
  ensureToastHost();
  const id = toastIdCounter++;
  pendingToastIds.add(id);

  const durationMs = options?.durationMs ?? DEFAULT_TOAST_DURATION_MS;
  const position = options?.position ?? 'top-center';
  const variant = options?.variant ?? 'default';
  const actionLabel = options?.actionLabel;
  const onAction = options?.onAction;
  const dismissible = options?.dismissible;
  const dismissLabel = options?.dismissLabel;
  const anchorId = options?.anchorId;

  const deliver = () => {
    if (pushToast) {
      pushToast({
        id,
        message,
        durationMs,
        position,
        variant,
        actionLabel,
        onAction,
        dismissible,
        dismissLabel,
        anchorId,
      });
    } else {
      requestAnimationFrame(deliver);
    }
  };
  deliver();

  return id;
}

/**
 * dismissToast（原码 `Wn`，导出别名 `g`）：
 * 宿主尚未接收（pending）→ 记入 cancelled 集合由宿主侧丢弃；否则直接移除。
 */
export function dismissToast(id: number): void {
  if (pendingToastIds.has(id)) {
    cancelledToastIds.add(id);
    return;
  }
  removeToastById?.(id);
}

/* ════════════════════════ 7. PPTX 元素引用族（12406–12536） ════════════════════════
 * 演示文稿元素「加入对话」引用的模型/序列化/事件层。
 * 原码符号：Gn/Kn/qn/Jn/Yn/Xn/Zn/Qn/$n/er/tr/nr/rr/ir/ar/or/sr/cr/lr/ur/dr/fr。
 * ════════════════════════════════════════════════════════════════════════ */

/** 元素引用事件类型（原码 `Gn`，导出别名 `o`）。 */
export const PPTX_ELEMENT_REFERENCE_EVENT_TYPE = 'zcode:pptx-element-reference-add-to-chat';

/** 引用块标题（原码 `Kn`；注释语义版）。 */
const PPTX_ELEMENT_REFERENCES_HEADING = '# Presentation element comments:';

/** 消歧说明（原码 `qn`）：每条引用独立、互不串用。 */
const PPTX_ELEMENT_REFERENCES_DISAMBIGUATION_NOTE =
  "Each item below is an independent comment on one presentation element. Treat every non-empty `comment` as the user's instruction for that element, process all of them, and never apply one item's comment to another reference.";

/** sha256 指纹格式（原码 `Jn`）。 */
const SHA256_FINGERPRINT_PATTERN = /^sha256:[a-f0-9]{64}$/u;

/** 转义正则特殊字符（原码 `Yn`）。 */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}

/**
 * 消息尾部引用块模式（原码 `Xn`）：
 * 「# Presentation element comments:」+ 消歧说明 + ```json 数组```。
 */
const PPTX_ELEMENT_REFERENCES_BLOCK_PATTERN = new RegExp(
  `(?:^|\\n\\n)${escapeRegExp(PPTX_ELEMENT_REFERENCES_HEADING)}\\s*\\n\\n${escapeRegExp(
    PPTX_ELEMENT_REFERENCES_DISAMBIGUATION_NOTE,
  )}\\s*\\n\\n\`\`\`json\\n([\\s\\S]*?)\\n\`\`\`\\s*$`,
  'u',
);

/** 旧版引用块模式（原码 `Zn`）：「# Presentation elements:」。 */
const LEGACY_PPTX_ELEMENT_REFERENCES_BLOCK_PATTERN =
  /(?:^|\n\n)# Presentation elements:\s*\n\n```json\n([\s\S]*?)\n```\s*$/u;

/** 元素引用模型（按校验器 `rr` 的读取面建模，把握度高）。 */
export interface PptxElementReference {
  id: string;
  workspacePath: string;
  workspaceIdentity?: string;
  remoteSessionId?: string;
  sourcePath: string;
  sourceTitle: string;
  sourceFingerprint: string;
  textFingerprint?: string;
  slideIndex: number;
  slidePart: string;
  nodeId: string;
  nodePath?: string;
  nodeName: string;
  nodeType: 'shape' | 'picture' | 'chart' | 'table' | 'table-cell';
  text?: string;
  selectedText?: string;
  comment?: string;
  bounds: { x: number; y: number; width: number; height: number };
  zIndex: number;
  /** table-cell 专属。 */
  rowIndex?: number;
  cellIndex?: number;
  capturedAt: number;
}

/** isRecord（原码 `Qn`）。 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && !!value;
}

/** isFiniteNumber（原码 `$n`）。 */
function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/** isOptionalString（原码 `er`）。 */
function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || typeof value === 'string';
}

/**
 * fallbackTo（原码 `tr`，导出别名 `d`）：
 * 候选串 trim 后非空则用之，否则回退缺省值。
 */
export function fallbackTo(fallback: string, candidate: string | undefined | null): string {
  return candidate?.trim() || fallback;
}

/**
 * isSameWorkspaceTarget（原码 `nr`，导出别名 `p`）：
 * 工作区路径（或身份）相同且远程会话 id 相同。
 */
export function isSameWorkspaceTarget(
  a: { workspacePath: string; workspaceIdentity?: string; remoteSessionId?: string },
  b: { workspacePath: string; workspaceIdentity?: string; remoteSessionId?: string },
): boolean {
  return (
    fallbackTo(a.workspacePath, a.workspaceIdentity) === fallbackTo(b.workspacePath, b.workspaceIdentity) &&
    (a.remoteSessionId ?? '') === (b.remoteSessionId ?? '')
  );
}

/**
 * isPptxElementReference（原码 `rr`）：结构校验器，逐字段防御
 * （sha256 指纹/slidePart 形态/nodeType 白名单/table-cell 行列号）。
 */
export function isPptxElementReference(value: unknown): value is PptxElementReference {
  if (!isRecord(value) || !isRecord(value.bounds)) return false;

  const allowedNodeTypes = new Set(['shape', 'picture', 'chart', 'table', 'table-cell']);
  const hasValidTableCellIndices =
    Number.isInteger(value.rowIndex) &&
    (value.rowIndex as number) >= 0 &&
    Number.isInteger(value.cellIndex) &&
    (value.cellIndex as number) >= 0;
  const bounds = value.bounds as Record<string, unknown>;

  return (
    typeof value.id === 'string' &&
    value.id.length > 0 &&
    typeof value.workspacePath === 'string' &&
    value.workspacePath.length > 0 &&
    isOptionalString(value.workspaceIdentity) &&
    isOptionalString(value.remoteSessionId) &&
    typeof value.sourcePath === 'string' &&
    value.sourcePath.length > 0 &&
    typeof value.sourceTitle === 'string' &&
    typeof value.sourceFingerprint === 'string' &&
    SHA256_FINGERPRINT_PATTERN.test(value.sourceFingerprint) &&
    (value.textFingerprint === undefined ||
      (typeof value.textFingerprint === 'string' && SHA256_FINGERPRINT_PATTERN.test(value.textFingerprint))) &&
    Number.isInteger(value.slideIndex) &&
    (value.slideIndex as number) >= 0 &&
    typeof value.slidePart === 'string' &&
    /^ppt\/slides\/slide[^/]+\.xml$/u.test(value.slidePart) &&
    typeof value.nodeId === 'string' &&
    value.nodeId.length > 0 &&
    isOptionalString(value.nodePath) &&
    typeof value.nodeName === 'string' &&
    typeof value.nodeType === 'string' &&
    allowedNodeTypes.has(value.nodeType) &&
    isOptionalString(value.text) &&
    isOptionalString(value.selectedText) &&
    isOptionalString(value.comment) &&
    isFiniteNumber(bounds.x) &&
    isFiniteNumber(bounds.y) &&
    isFiniteNumber(bounds.width) &&
    (bounds.width as number) >= 0 &&
    isFiniteNumber(bounds.height) &&
    (bounds.height as number) >= 0 &&
    Number.isInteger(value.zIndex) &&
    isFiniteNumber(value.capturedAt) &&
    (value.nodeType === 'table-cell' ? hasValidTableCellIndices : true)
  );
}

/** createPptxElementReferenceId（原码 `ir`）：crypto.randomUUID 优先，降级时间戳+随机。 */
function createPptxElementReferenceId(): string {
  return typeof crypto === 'undefined' || !('randomUUID' in crypto)
    ? `pptx-element-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    : crypto.randomUUID();
}

/**
 * sha256Fingerprint（原码 `ar`，导出别名 `h`）：
 * `sha256:` + 十六进制摘要（WebCrypto subtle.digest）。
 */
export async function sha256Fingerprint(input: string | ArrayBuffer | Uint8Array): Promise<string> {
  const data = typeof input === 'string' ? new TextEncoder().encode(input) : new Uint8Array(input);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', data);
  return `sha256:${[...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')}`;
}

/** buildPptxElementReference 的输入（元素 + 工作区/来源上下文 + 用户批注）。 */
export interface BuildPptxElementReferenceInput {
  element: {
    id?: string;
    text?: string;
    [key: string]: unknown;
  };
  workspacePath: string;
  workspaceIdentity?: string;
  remoteSessionId?: string;
  sourcePath: string;
  sourceTitle: string;
  sourceFingerprint: string;
  selectedText?: string;
  comment?: string;
}

/**
 * buildPptxElementReference（原码 `or`，导出别名 `l`）：
 * 以元素本体为基底，叠加新 id、工作区/来源上下文、可选批注、
 * 文本指纹（有 text 时）与捕获时间戳。
 */
export async function buildPptxElementReference(
  input: BuildPptxElementReferenceInput,
): Promise<PptxElementReference> {
  const selectedText = input.selectedText?.trim();
  const comment = input.comment?.trim();

  return {
    // 原码直接展开 `e.element`（无类型对象）；其后字段逐一覆盖/补齐。
    ...(input.element as unknown as PptxElementReference),
    id: createPptxElementReferenceId(),
    workspacePath: input.workspacePath,
    ...(input.workspaceIdentity ? { workspaceIdentity: input.workspaceIdentity } : {}),
    ...(input.remoteSessionId ? { remoteSessionId: input.remoteSessionId } : {}),
    sourcePath: input.sourcePath,
    sourceTitle: input.sourceTitle,
    sourceFingerprint: input.sourceFingerprint,
    ...(selectedText ? { selectedText } : {}),
    ...(comment ? { comment } : {}),
    ...(input.element.text
      ? { textFingerprint: await sha256Fingerprint(input.element.text.trim()) }
      : {}),
    capturedAt: Date.now(),
  };
}

/** pptxElementReferenceKey（原码 `sr`）：来源+指纹+slide+节点（+表格行列）的 \0 连接键。 */
function pptxElementReferenceKey(reference: PptxElementReference): string {
  return [
    reference.sourcePath,
    reference.sourceFingerprint,
    reference.slidePart,
    reference.nodeId,
    reference.nodeType === 'table-cell' ? reference.rowIndex : '',
    reference.nodeType === 'table-cell' ? reference.cellIndex : '',
  ].join('\0');
}

/**
 * upsertPptxElementReference（原码 `cr`，导出别名 `s`）：
 * 按结构键去重——存在则原位替换，不存在则追加。
 */
export function upsertPptxElementReference(
  references: PptxElementReference[],
  reference: PptxElementReference,
): PptxElementReference[] {
  const key = pptxElementReferenceKey(reference);
  const existingIndex = references.findIndex((item) => pptxElementReferenceKey(item) === key);
  return existingIndex < 0
    ? [...references, reference]
    : references.map((item, index) => (index === existingIndex ? reference : item));
}

/**
 * appendPptxElementReferences（原码 `lr`，导出别名 `c`）：
 * 把引用数组序列化为 ```json 块追加到消息文本尾部（空数组则仅 trim）。
 */
export function appendPptxElementReferences(
  content: string,
  references: PptxElementReference[],
): string {
  const trimmed = content.trimEnd();
  if (references.length === 0) return trimmed.trim();
  const block = `${PPTX_ELEMENT_REFERENCES_HEADING}\n\n${PPTX_ELEMENT_REFERENCES_DISAMBIGUATION_NOTE}\n\n\`\`\`json\n${JSON.stringify(references, null, 2)}\n\`\`\``;
  return `${trimmed}${trimmed ? '\n\n' : ''}${block}`.trim();
}

/**
 * extractPptxElementReferences（原码 `ur`，导出别名 `m`）：
 * 从消息文本尾部解析引用块；任一条目校验失败/为空/JSON 非法 →
 * 整体视为无引用（返回原文 + 空数组），保证消息不丢。
 */
export function extractPptxElementReferences(content: string): {
  visibleContent: string;
  pptxElementReferences: PptxElementReference[];
} {
  const match =
    PPTX_ELEMENT_REFERENCES_BLOCK_PATTERN.exec(content) ??
    LEGACY_PPTX_ELEMENT_REFERENCES_BLOCK_PATTERN.exec(content);
  if (!match || match.index < 0 || match[1] === undefined) {
    return { visibleContent: content, pptxElementReferences: [] };
  }
  try {
    const parsed: unknown = JSON.parse(match[1]);
    if (!Array.isArray(parsed)) {
      return { visibleContent: content, pptxElementReferences: [] };
    }
    const valid = parsed.filter(isPptxElementReference);
    return valid.length !== parsed.length || valid.length === 0
      ? { visibleContent: content, pptxElementReferences: [] }
      : { visibleContent: content.slice(0, match.index).trimEnd(), pptxElementReferences: valid };
  } catch {
    return { visibleContent: content, pptxElementReferences: [] };
  }
}

/**
 * isPptxElementReferenceEvent（原码 `dr`，导出别名 `f`）：
 * CustomEvent 类型 + detail 结构双重判定。
 */
export function isPptxElementReferenceEvent(event: Event): event is CustomEvent<PptxElementReference> {
  return (
    event.type === 'zcode:pptx-element-reference-add-to-chat' &&
    'detail' in event &&
    isPptxElementReference((event as CustomEvent).detail)
  );
}

/** dispatchPptxElementReferenceEvent（原码 `fr`，导出别名 `u`）：window 级 CustomEvent 广播。 */
export function dispatchPptxElementReferenceEvent(reference: PptxElementReference): void {
  window.dispatchEvent(new CustomEvent(PPTX_ELEMENT_REFERENCE_EVENT_TYPE, { detail: reference }));
}

/* ════════════════════════════════════════════════════════════════════════
 * SYMBOLS: exportName -> 原名(minified) -> 语义名
 * ════════════════════════════════════════════════════════════════════════
 * first-party 导出符号（28 个，exportName 为原 chunk 导出别名）：
 *   A -> se -> PlatformProvider        平台服务 Provider
 *   M -> ce -> usePlatform             缺省即抛错（中文错误串）
 *   j -> le -> useOptionalPlatform     容器外返回 null
 *   N -> ue -> useSelectDirectory      目录选择器稳定回调
 *   _ -> Un -> toast                   toast 入队（返回数字 id）
 *   g -> Wn -> dismissToast            pending/cancelled 双集合去抖
 *   y -> Dn -> Input                   shadcn Input（cva size 变体）
 *   v -> On -> Textarea                shadcn Textarea
 *   n -> pr -> Popover                 shadcn Popover 根
 *   a -> mr -> PopoverTrigger          触发器
 *   i -> hr -> PopoverContent          Portal+Content（align/sideOffset 缺省）
 *   r -> gr -> PopoverAnchor           锚点
 *   t -> _r -> isComposingText         IME 三重组词探测（chunk 得名于此）
 *   T -> Ht -> Info                    lucide info 图标
 *   w -> Ut -> LoaderCircle            lucide loader-circle（spinner）
 *   C -> Wt -> MousePointer2           lucide mouse-pointer-2
 *   S -> Gt -> Sparkles                lucide sparkles
 *   x -> Kt -> TriangleAlert           lucide triangle-alert
 *   b -> qt -> XIcon                   lucide x
 *   o -> Gn -> PPTX_ELEMENT_REFERENCE_EVENT_TYPE
 *   d -> tr -> fallbackTo
 *   p -> nr -> isSameWorkspaceTarget
 *   h -> ar -> sha256Fingerprint
 *   l -> or -> buildPptxElementReference
 *   s -> cr -> upsertPptxElementReference
 *   c -> lr -> appendPptxElementReferences
 *   m -> ur -> extractPptxElementReferences
 *   f -> dr -> isPptxElementReferenceEvent
 *   u -> fr -> dispatchPptxElementReferenceEvent
 * 模块内局部符号（未导出，重建中保持不导出）：
 *   En -> inputVariants（本文件 export 以便引用）/ Ln -> ensureToastHost /
 *   Rn -> ToastHost / zn -> anchorCenterX / Bn -> AnchoredToastGroup /
 *   Vn -> ToastItem / Hn -> ToastCard / Kn/qn -> 引用块标题与消歧说明 /
 *   Jn -> SHA256_FINGERPRINT_PATTERN / Yn -> escapeRegExp /
 *   Xn/Zn -> 引用块正则 / Qn/$n/er -> isRecord/isFiniteNumber/isOptionalString /
 *   rr -> isPptxElementReference（本文件 export）/ ir -> createPptxElementReferenceId /
 *   sr -> pptxElementReferenceKey
 * vendored 导出符号（登记制，不重建；导出别名 -> 库 -> 内部名）：
 *   P -> ae -> react-dom/client 19.2.7（CJS interop，vendored 本体 292–10868）
 *   D -> Mt -> react-remove-scroll@2.7.2 RemoveScroll
 *   E -> Vt -> aria-hidden@1.2.6 hideOthers
 *   O -> we -> @radix-ui/react-focus-guards@1.1.3 useFocusGuards
 *   k -> pe -> @radix-ui/react-focus-scope@1.1.7 FocusScope
 *   （scheduler 26–290 与 radix-popover@1.1.15 全栈 11823–12047 仅层内使用，不导出）
 * 导入符号：
 *   utils chunk t -> cn | button chunk c -> createLucideIcon、r -> cva |
 *   dist-DJJArJ7D 14 符号（radix popper/context/slot 等，供内联 radix 使用）|
 *   dist-vnZIbudW y -> useComposedRefs、b -> createSlottable（供内联 radix 使用）
 * ════════════════════════════════════════════════════════════════════════ */
