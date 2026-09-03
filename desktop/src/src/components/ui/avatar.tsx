/* eslint-disable */
/**
 * ============================================================================
 * components/ui/avatar.tsx — Avatar 原语族（shadcn 风格，A1-R129p）
 * ============================================================================
 *
 * 依据 styles-CdEGpc2x.js 147744–147770（hLt/gLt/_Lt）逐字重建。
 * Hxe/Uxe/Wxe = @radix-ui/react-avatar Root/Image/Fallback（束 vendored 区
 * 28352–28433 `var Hxe = Fxe, Uxe = Lxe, Wxe = zxe`；npm 真依赖裁定同 A0-S3c
 * vendored 原语判例，@radix-ui/react-avatar@1.1.12 = 1.1.x 族同期版）。
 */
import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "../../modules/UtilsCn";

/** 原 hLt（147744） */
function Avatar({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & { size?: "default" | "sm" | "lg" }) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-size={size}
      className={cn(
        "group/avatar relative flex size-8 shrink-0 rounded-full select-none after:absolute after:inset-0 after:rounded-full after:border after:border-border after:mix-blend-darken data-[size=lg]:size-10 data-[size=sm]:size-6 dark:after:mix-blend-lighten",
        className,
      )}
      {...props}
    />
  );
}

/** 原 gLt（147755） */
function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full rounded-full object-cover", className)}
      {...props}
    />
  );
}

/** 原 _Lt（147761） */
function AvatarFallback({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center rounded-full bg-muted text-ui-base text-muted-foreground group-data-[size=sm]/avatar:text-ui-base",
        className,
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
