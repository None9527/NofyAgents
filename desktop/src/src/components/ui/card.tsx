/* eslint-disable */
/**
 * ============================================================================
 * components/ui/card.tsx — Card 族（shadcn 风格，A0-S3c）
 * ============================================================================
 *
 * 依据 styles-CdEGpc2x.js 135150–135260（B3/bMt/xMt/SMt/CMt/V3）逐字重建。
 * bundle 无 card-footer 封装，故不建。
 */
import * as React from "react";
import { cn } from "../../modules/UtilsCn";

/** 原 B3：size 缺省 default */
function Card({ className, size = "default", ...props }: React.ComponentPropsWithoutRef<"div"> & { size?: "default" | "sm" }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "group/card flex flex-col gap-4 overflow-hidden rounded-xl border border-card-border bg-card py-4 text-ui-base/relaxed text-foreground has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-3 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
        className,
      )}
      {...props}
    />
  );
}

/** 原 bMt */
function CardHeader({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-4 group-data-[size=sm]/card:px-3 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3",
        className,
      )}
      {...props}
    />
  );
}

/** 原 xMt */
function CardTitle({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  return <div data-slot="card-title" className={cn("text-ui-base font-medium", className)} {...props} />;
}

/** 原 SMt */
function CardDescription({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  return <div data-slot="card-description" className={cn("text-ui-base/relaxed text-foreground-subtle", className)} {...props} />;
}

/** 原 CMt */
function CardAction({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  return <div data-slot="card-action" className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)} {...props} />;
}

/** 原 V3 */
function CardContent({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  return <div data-slot="card-content" className={cn("px-4 group-data-[size=sm]/card:px-3", className)} {...props} />;
}

export { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent };
