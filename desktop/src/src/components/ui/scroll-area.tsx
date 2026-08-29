/* eslint-disable */
/**
 * ============================================================================
 * components/ui/scroll-area.tsx — Radix ScrollArea 封装（shadcn 风格，A0-S3c）
 * ============================================================================
 *
 * 依据 styles-CdEGpc2x.js 136026–136060（Y3/XMt）逐字重建。raw 五件
 * （Root/Viewport/Scrollbar/Thumb/Corner = wEe/TEe/aEe/mEe/EEe）由消费方
 * 直接 import '@radix-ui/react-scroll-area'，此处不重复导出。
 */
import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { cn } from "../../modules/UtilsCn";

/** 原 XMt：scrollbar + thumb（orientation 缺省 vertical） */
function ScrollAreaScrollbar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Scrollbar>) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      data-slot="scroll-area-scrollbar"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        "flex touch-none select-none transition-colors data-horizontal:h-2 data-horizontal:flex-col data-horizontal:p-[2px] data-vertical:h-full data-vertical:w-2 data-vertical:p-[2px]",
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb data-slot="scroll-area-thumb" className="relative min-h-2 min-w-2 flex-1 rounded-full bg-border" />
    </ScrollAreaPrimitive.Scrollbar>
  );
}

/** 原 Y3：Root + Viewport + Scrollbar + Corner */
function ScrollArea({ className, children, ...props }: React.ComponentProps<typeof ScrollAreaPrimitive.Root>) {
  return (
    <ScrollAreaPrimitive.Root data-slot="scroll-area" className={cn("relative", className)} {...props}>
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className="size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollAreaScrollbar />
      <ScrollAreaPrimitive.Corner className="bg-transparent" />
    </ScrollAreaPrimitive.Root>
  );
}

export { ScrollArea, ScrollAreaScrollbar };
