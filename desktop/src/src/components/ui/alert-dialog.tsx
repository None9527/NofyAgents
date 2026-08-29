/* eslint-disable */
/**
 * ============================================================================
 * components/ui/alert-dialog.tsx — Radix AlertDialog 封装族（shadcn 风格，A0-S3c）
 * ============================================================================
 *
 * 依据 styles-CdEGpc2x.js 131966–132040（$4/_At/vAt/yAt/e3/t3/n3/r3/i3/a3/o3）
 * 逐字重建。Action/Cancel 的类名经 modules/button 的 buttonVariants（原 Ca）。
 */
import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { buttonVariants, type ButtonProps } from "../../modules/button";
import { cn } from "../../modules/UtilsCn";

/** 原 $4 */
function AlertDialog({ ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

/** 原 _At */
function AlertDialogTrigger({ ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />;
}

/** 原 vAt */
function AlertDialogPortal({ ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />;
}

/** 原 yAt */
function AlertDialogOverlay({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/60 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 platform-linux-desktop:top-12",
        className,
      )}
      {...props}
    />
  );
}

/** 原 e3 */
function AlertDialogContent({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-5 rounded-2xl border-none bg-popover/98 p-5 text-ui-base/relaxed text-foreground ring-border shadow-2xl duration-100 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 sm:max-w-md platform-linux-desktop:top-[calc(50%+1.5rem)]",
          className,
        )}
        {...props}
      />
    </AlertDialogPortal>
  );
}

/** 原 t3 */
function AlertDialogHeader({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  return <div data-slot="alert-dialog-header" className={cn("flex flex-col gap-2 text-left", className)} {...props} />;
}

/** 原 n3 */
function AlertDialogFooter({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div data-slot="alert-dialog-footer" className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />
  );
}

/** 原 r3 */
function AlertDialogTitle({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn("text-ui-lg font-semibold text-foreground", className)}
      {...props}
    />
  );
}

/** 原 i3 */
function AlertDialogDescription({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("whitespace-pre-line pt-0.5 text-ui-base leading-6 text-foreground-subtle", className)}
      {...props}
    />
  );
}

/** 原 a3：buttonVariants（Ca）套类 */
function AlertDialogAction({ className, variant, size, ...props }: ButtonProps) {
  return (
    <AlertDialogPrimitive.Action
      data-slot="alert-dialog-action"
      className={cn(buttonVariants({ variant, size }), className)}
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    />
  );
}

/** 原 o3：variant 缺省 outline */
function AlertDialogCancel({ className, variant, size, ...props }: ButtonProps) {
  return (
    <AlertDialogPrimitive.Cancel
      data-slot="alert-dialog-cancel"
      className={cn(buttonVariants({ variant: variant ?? "outline", size }), className)}
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    />
  );
}

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
