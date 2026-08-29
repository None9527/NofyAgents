/* eslint-disable */
/**
 * ============================================================================
 * components/ui/hover-card.tsx — Radix HoverCard 封装族（shadcn 风格，A0-S3c）
 * ============================================================================
 *
 * 依据 styles-CdEGpc2x.js 54538–54560（dN/fN/pN）与 54832–54836（CN/wN/TN，
 * openDelay/closeDelay=0 缺省、Content 追加 `w-auto p-2` 的 tooltip 向封装）逐字重建。
 */
import * as React from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import { cn } from "../../modules/UtilsCn";

/** 原 dN */
function HoverCard({ ...props }: React.ComponentProps<typeof HoverCardPrimitive.Root>) {
  return <HoverCardPrimitive.Root data-slot="hover-card" {...props} />;
}

/** 原 fN */
function HoverCardTrigger({ ...props }: React.ComponentProps<typeof HoverCardPrimitive.Trigger>) {
  return <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />;
}

/** 原 pN：Portal + Content（align 缺省 center、sideOffset 缺省 4） */
function HoverCardContent({ className, align = "center", sideOffset = 4, ...props }: React.ComponentProps<typeof HoverCardPrimitive.Content>) {
  return (
    <HoverCardPrimitive.Portal>
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-72 origin-(--radix-hover-card-content-transform-origin) rounded-lg bg-popover p-2.5 text-ui-base/relaxed text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className,
        )}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  );
}

/** 原 CN：openDelay/closeDelay 缺省 0 的根封装 */
function HoverCardTooltip({ openDelay = 0, closeDelay = 0, ...props }: React.ComponentProps<typeof HoverCardPrimitive.Root>) {
  return <HoverCardPrimitive.Root closeDelay={closeDelay} openDelay={openDelay} {...props} />;
}

/** 原 wN：直通 trigger */
function HoverCardTooltipTrigger({ ...props }: React.ComponentProps<typeof HoverCardPrimitive.Trigger>) {
  return <HoverCardPrimitive.Trigger {...props} />;
}

/** 原 TN：align 缺省 start、类名追加 `w-auto p-2` */
function HoverCardTooltipContent({
  align = "start",
  className,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Content>) {
  return <HoverCardContent align={align} className={cn("w-auto p-2", className)} {...props} />;
}

export {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
  HoverCardTooltip,
  HoverCardTooltipTrigger,
  HoverCardTooltipContent,
};
