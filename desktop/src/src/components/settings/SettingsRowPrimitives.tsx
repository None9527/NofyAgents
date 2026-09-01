// A0-S4-4a: 自 modules/Settings.tsx 行式原语（§6）原样迁入（组件单元；原文件现为薄 re-export shim）。
// 迁出体 = 原文件 947–1363；§0 ButtonProps 接口随族迁入。导入路径按 components/settings/ 深度改指 ../../modules/。
import * as React from "react";
import { ChevronDown as IconChevronDown, Check as IconCheck } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0
import { Button } from '../../modules/button'; // A0-CLEANUP 族清理：Button declare 改指 button chunk
import { Input } from '../../modules/ImeComposition';
import { cn } from '../../modules/UtilsCn'; // Z（utils chunk）
import { Root as RadixSelectRoot, Value as RadixSelectValue, Trigger as RadixSelectTrigger, Icon as RadixSelectIcon, Portal as RadixSelectPortal, Content as RadixSelectContent, Viewport as RadixSelectViewport, Item as RadixSelectItem, ItemText as RadixSelectItemText, ItemIndicator as RadixSelectItemIndicator, ScrollUpButton as RadixSelectScrollUpButton, ScrollDownButton as RadixSelectScrollDownButton } from '@radix-ui/react-select'; // A0-S3c：vendored radix select → npm @radix-ui/react-select@2.3.7
import { Root as RadixSwitchRoot, Thumb as RadixSwitchThumb } from '@radix-ui/react-switch'; // A0-S3c：→ npm @radix-ui/react-switch@1.3.7
import { Root as RadixTabsRoot, List as RadixTabsList, Trigger as RadixTabsTrigger, Content as RadixTabsContent } from '@radix-ui/react-tabs'; // A0-S3c：→ npm @radix-ui/react-tabs@1.1.21
import { Root as RadixAlertDialogRoot, Portal as RadixAlertDialogPortal, Overlay as RadixAlertDialogOverlay, Content as RadixAlertDialogContent, Title as RadixAlertDialogTitle, Description as RadixAlertDialogDescription, Action as RadixAlertDialogAction, Cancel as RadixAlertDialogCancel } from '@radix-ui/react-alert-dialog'; // A0-S3c：→ npm @radix-ui/react-alert-dialog@1.1.23

/* §0 声明群随族迁入（ButtonProps，原 467–471） */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "ghost" | "outline" | "destructive";
  size?: "xs" | "sm" | "default" | "lg" | "icon-sm" | "icon-md" | "icon-lg";
}
/* ── tombstone（A0-CLEANUP 族清理）：Button declare 删除 → import { Button } from './button'。 ── */

/* ============================================================================
 * 6. 行式原语（右栏 label+control 骨架；类名逐字保留）
 * ==========================================================================*/

/** 原 B3（js 135229）：卡片容器（data-slot=card） */
export function SettingsCard({
  className,
  size = "default",
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { size?: "default" | "sm" }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "group/card flex flex-col gap-4 overflow-hidden rounded-xl border border-card-border bg-card py-4 text-ui-base/relaxed text-foreground has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-3 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
        className,
      )}
      {...rest}
    />
  );
}

/** 原 V3（js 135271）：卡片内容区（data-slot=card-content） */
export function SettingsCardContent({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="card-content" className={cn("px-4 group-data-[size=sm]/card:px-3", className)} {...rest} />;
}

/** 原 U3（js 135334）：设置行 —— 右栏行式布局的核心：
 *  `grid-cols-[minmax(0,1fr)_192px]` 左 label+description、右 control，可选 detail 行。 */
export function SettingsRow({
  label,
  description,
  control,
  detail,
}: {
  label: string;
  description?: string;
  control: React.ReactNode;
  detail?: React.ReactNode;
}) {
  return (
    <div className="border-t border-border px-4 py-3 first:border-t-0">
      <div className="grid items-center gap-4 grid-cols-[minmax(0,1fr)_192px]">
        <div className="min-w-0">
          <div className="text-ui-base font-medium text-foreground">{label}</div>
          {description ? <div className="mt-1 text-ui-base leading-6 text-foreground-subtle">{description}</div> : null}
        </div>
        <div className="flex w-full justify-end">{control}</div>
      </div>
      {detail ? <div className="mt-3">{detail}</div> : null}
    </div>
  );
}

/** 原 W3（js 135380）：分区卡 = 零内边距的 Card+Content 组合（行直接堆叠） */
export function SettingsSectionCard({ children }: { children: React.ReactNode }) {
  return (
    <SettingsCard className="overflow-hidden rounded-xl border border-border bg-card py-0 shadow-none">
      <SettingsCardContent className="space-y-0 px-0">{children}</SettingsCardContent>
    </SettingsCard>
  );
}

/** 原 EMt（js 135386）：标题 chip（通用分区标题下的语言徽章等） */
export function SettingsTitleChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md bg-surface px-2.5 py-1 text-ui-base font-medium text-foreground-subtle">{children}</span>
  );
}

/** 原 Q2t（js 204830）：px 数字输入（失焦/回车提交，min–max 钳制，右侧 px 后缀） */
export function PixelNumberInput({
  value,
  min,
  max,
  ariaLabel,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  ariaLabel: string;
  onChange: (value: number) => void;
}) {
  const [draft, setDraft] = React.useState(String(value));
  return (
    <div className="relative w-28">
      <Input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        step={1}
        value={draft}
        aria-label={ariaLabel}
        onChange={(event) => setDraft(event.currentTarget.value)}
        onBlur={() => {
          const parsed = draft.trim() === "" ? NaN : Number(draft);
          const next = Number.isFinite(parsed) ? Math.min(max, Math.max(min, Math.round(parsed))) : value;
          setDraft(String(next));
          if (next !== value) onChange(next);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.currentTarget.blur();
          } else if (event.key === "Escape") {
            event.preventDefault();
            setDraft(String(value));
          }
        }}
        className="pr-8 text-right tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-ui-lg text-foreground-subtle">
        px
      </span>
    </div>
  );
}

/* --- Select / Switch / Tabs / AlertDialog 封装（Radix 原语打包在本 chunk） --- */

/** 原 iO（js 46009） */
export function Select(props: React.ComponentProps<typeof RadixSelectRoot>) {
  return <RadixSelectRoot data-slot="select" {...props} />;
}

/** 原 aO（js 46012） */
export function SelectValue(props: React.ComponentProps<typeof RadixSelectValue>) {
  return <RadixSelectValue data-slot="select-value" {...props} />;
}

/** 原 oO（js 46015）：触发器。类名由 cva `zRe`（js 45987）按 variant/size 生成，
 *  基础类逐字保留；variant: input/default/outline/secondary/ghost/destructive，
 *  size: xs/sm/default/lg（设置视图统一用 `lg` + `w-[260px] justify-between`）。 */
export function SelectTrigger({
  className,
  variant = "input",
  size = "default",
  children,
  indicator,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "input" | "default" | "outline" | "secondary" | "ghost" | "destructive";
  size?: "xs" | "sm" | "default" | "lg";
  indicator?: React.ReactNode;
}) {
  return (
    <RadixSelectTrigger
      data-slot="select-trigger"
      data-variant={variant}
      data-size={size}
      className={cn(
        // zRe 基础类（variant/size 分支见 js 45987–46007）
        "flex w-fit items-center justify-between gap-1.5 border whitespace-nowrap transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 data-placeholder:text-foreground-subtlest *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        variant === "input"
          ? "border-input-border bg-input text-foreground hover:border-input-border-hover focus-visible:border-input-border-focused focus-visible:bg-input-focused focus-visible:ring-0"
          : variant === "outline"
            ? "border-border bg-transparent text-foreground hover:bg-input/50 hover:text-foreground aria-expanded:bg-selected aria-expanded:text-foreground"
            : "",
        size === "lg"
          ? "h-8 rounded-lg pl-3 pr-2 text-ui-base [&_svg:not([class*='size-'])]:size-4"
          : "h-7 rounded-md pl-2 pr-1 text-ui-base/relaxed [&_svg:not([class*='size-'])]:size-3.5",
        className,
      )}
      {...rest}
    >
      {children}
      <RadixSelectIcon asChild>
        {indicator ?? <IconChevronDown className="pointer-events-none size-3.5 text-foreground-subtle" />}
      </RadixSelectIcon>
    </RadixSelectTrigger>
  );
}

/** 原 sO（js 46039）：内容层（Portal + 滚动按钮 + 视口），类名逐字保留 */
export function SelectContent({
  className,
  children,
  position = "item-aligned",
  align = "center",
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & {
  position?: "item-aligned" | "popper";
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  collisionPadding?: number;
  onCloseAutoFocus?: (event: Event) => void;
}) {
  return (
    <RadixSelectPortal>
      <RadixSelectContent
        data-slot="select-content"
        data-align-trigger={position === "item-aligned"}
        className={cn(
          "relative z-[60] max-h-(--radix-select-content-available-height) min-w-32 origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-xl border border-popover-border bg-menu p-1 text-foreground shadow-md duration-100 data-[align-trigger=true]:animate-none data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 [app-region:no-drag]",
          className,
        )}
        position={position}
        align={align}
        {...rest}
      >
        <RadixSelectScrollUpButton />
        <RadixSelectViewport
          data-position={position}
          className={cn(
            "flex flex-col gap-0.5 data-[position=popper]:w-full data-[position=popper]:min-w-(--radix-select-trigger-width)",
          )}
        >
          {children}
        </RadixSelectViewport>
        <RadixSelectScrollDownButton />
      </RadixSelectContent>
    </RadixSelectPortal>
  );
}

/** 原 cO（js 46072）：选项（选中勾在右、可带 trailing 装饰），类名逐字保留 */
export const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string; disabled?: boolean; trailing?: React.ReactNode }
>(function SelectItem({ className, children, trailing, ...rest }, ref) {
  return (
    <RadixSelectItem
      ref={ref}
      data-slot="select-item"
      className={cn(
        "relative flex min-h-7 w-full cursor-default items-center gap-2 rounded-lg px-2 py-1 text-ui-base/relaxed text-foreground outline-hidden select-none data-[highlighted]:bg-menu-hover data-[highlighted]:text-foreground data-disabled:pointer-events-none data-disabled:text-foreground-subtlest data-disabled:opacity-100 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className,
      )}
      {...rest}
    >
      {trailing ? (
        <span className="pointer-events-auto absolute right-2 flex items-center justify-center">{trailing}</span>
      ) : null}
      <span className="pointer-events-none absolute right-2 flex items-center justify-center">
        <RadixSelectItemIndicator>
          <IconCheck className="pointer-events-none size-4 text-foreground-subtle" />
        </RadixSelectItemIndicator>
      </span>
      <RadixSelectItemText>{children}</RadixSelectItemText>
    </RadixSelectItem>
  );
});

/** 原 DC（js 37345）：Switch（Radix），类名逐字保留 */
export function Switch({
  className,
  size = "default",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  size?: "default" | "sm";
}) {
  return (
    <RadixSwitchRoot
      data-slot="switch"
      data-size={size}
      className={cn(
        "p-px peer group/switch relative inline-flex shrink-0 items-center rounded-full transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-2 focus-visible:ring-input-border-focused/30 aria-invalid:ring-2 aria-invalid:ring-destructive/20 data-[size=default]:h-[18px] data-[size=default]:w-[32px] data-[size=sm]:h-[16px] data-[size=sm]:w-[28px] dark:aria-invalid:ring-destructive/40 data-checked:bg-primary data-unchecked:bg-primary/30 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      {...rest}
    >
      <RadixSwitchThumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-full bg-primary-foreground ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3.5 group-data-[size=default]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=default]/switch:data-unchecked:translate-x-0 group-data-[size=sm]/switch:data-unchecked:translate-x-0"
      />
    </RadixSwitchRoot>
  );
}

/** 原 hC（js 36997）：Tabs 根（data-slot=tabs） */
export function Tabs({
  className,
  orientation = "horizontal",
  ...rest
}: React.ComponentProps<typeof RadixTabsRoot> & { orientation?: "horizontal" | "vertical" }) { // A0-S3c：rest 透传面改指 radix TabsRoot 真面（bundle hC 透传）
  return (
    <RadixTabsRoot
      data-slot="tabs"
      data-orientation={orientation}
      className={cn("group/tabs flex gap-2 data-horizontal:flex-col", className)}
      {...rest}
    />
  );
}

/** 原 gC（js 37012）：TabsList（variant: default|line） */
export function TabsList({
  className,
  variant = "default",
  ...rest
}: React.ComponentPropsWithRef<"div"> & { variant?: "default" | "line" }) { // A0-CLEANUP3 3b：ref 透传
  return (
    <RadixTabsList
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(
        "group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-horizontal/tabs:h-8 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none",
        variant === "default" ? "bg-muted" : "gap-1 bg-transparent",
        className,
      )}
      {...rest}
    />
  );
}

/** 原 _C（js 37020）：TabsTrigger，类名逐字保留（含 line 变体的下划线 after:） */
export function TabsTrigger({ className, ...rest }: React.ComponentPropsWithRef<"button"> & { value: string; asChild?: boolean }) { // A0-CLEANUP3 3b：ref 透传
  return (
    <RadixTabsTrigger
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 text-ui-base font-medium whitespace-nowrap text-foreground/60 transition-all group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start group-data-vertical/tabs:py-[calc(--spacing(1.25))] hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 dark:text-muted-foreground dark:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent",
        "data-active:bg-background data-active:text-foreground dark:data-active:border-input dark:data-active:bg-input/30 dark:data-active:text-foreground",
        "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[-5px] group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
        className,
      )}
      {...rest}
    />
  );
}

/** 原 vC（js 37033）：TabsContent */
export function TabsContent({ className, ...rest }: React.ComponentProps<typeof RadixTabsContent>) { // A0-S3c：透传面改指 radix TabsContent 真面（bundle vC 透传；forceMount?: true）
  return <RadixTabsContent data-slot="tabs-content" className={cn("flex-1 text-ui-base outline-none", className)} {...rest} />;
}

/** 原 S9（js 202338）：Alert（role=alert） */
export function Alert({ className, variant, ...rest }: React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "warning" | "destructive" }) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(
        "group/alert relative grid w-full gap-0.5 rounded-lg border px-2 py-1.5 text-left text-ui-base/relaxed has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-1.5 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-3.5",
        variant === "destructive"
          ? "border-destructive/50 bg-destructive/10 text-destructive"
          : variant === "warning"
            ? "border-warning/40 bg-warning/10 text-warning *:data-[slot=alert-description]:text-warning *:[svg]:text-current" /* bundle g2t warning 变体（styles 202627） */
            : "border-card-border bg-card text-foreground",
        className,
      )}
      {...rest}
    />
  );
}

/** 原 w9（js 202356）：AlertDescription */
export function AlertDescription({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-ui-base/relaxed text-balance text-foreground-subtle md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
        className,
      )}
      {...rest}
    />
  );
}

/** 原 $4/e3/t3/n3/r3/i3/a3/o3（js 131966–132035）：AlertDialog 原语族（类名逐字保留） */
export function AlertDialog(props: React.ComponentProps<typeof RadixAlertDialogRoot>) {
  return <RadixAlertDialogRoot data-slot="alert-dialog" {...props} />;
}
export function AlertDialogContent({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <RadixAlertDialogPortal>
      <RadixAlertDialogOverlay
        data-slot="alert-dialog-overlay"
        className="fixed inset-0 isolate z-50 bg-black/60 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 platform-linux-desktop:top-12"
      />
      <RadixAlertDialogContent
        data-slot="alert-dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-5 rounded-2xl border-none bg-popover/98 p-5 text-ui-base/relaxed text-foreground ring-border shadow-2xl duration-100 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 sm:max-w-md platform-linux-desktop:top-[calc(50%+1.5rem)]",
          className,
        )}
        {...rest}
      />
    </RadixAlertDialogPortal>
  );
}
export function AlertDialogHeader({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="alert-dialog-header" className={cn("flex flex-col gap-2 text-left", className)} {...rest} />;
}
export function AlertDialogFooter({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-slot="alert-dialog-footer" className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...rest} />
  );
}
export function AlertDialogTitle({ className, ...rest }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <RadixAlertDialogTitle data-slot="alert-dialog-title" className={cn("text-ui-lg font-semibold text-foreground", className)} {...rest} />;
}
export function AlertDialogDescription({ className, ...rest }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <RadixAlertDialogDescription
      data-slot="alert-dialog-description"
      className={cn("whitespace-pre-line pt-0.5 text-ui-base leading-6 text-foreground-subtle", className)}
      {...rest}
    />
  );
}
/** 原 a3（js 132025）：动作按钮（复用 Button 类名 cva `Ca`） */
export function AlertDialogAction({ className, variant, size, ...rest }: ButtonProps) {
  return <RadixAlertDialogAction data-slot="alert-dialog-action" className={className} {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)} data-variant={variant} data-size={size} />;
}
/** 原 o3（js 132030）：取消按钮 */
export function AlertDialogCancel({ className, ...rest }: ButtonProps) {
  return <RadixAlertDialogCancel data-slot="alert-dialog-cancel" className={className} {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)} />;
}

