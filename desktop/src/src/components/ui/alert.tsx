/* eslint-disable */
/**
 * ============================================================================
 * components/ui/alert.tsx — AlertTitle（shadcn 风格，A0-S3c）
 * ============================================================================
 *
 * 依据 styles-CdEGpc2x.js 202640（C9）逐字重建。Alert/AlertDescription 属主为
 * modules/Settings.tsx（S9/w9），此处不重复。
 */
import * as React from "react";
import { cn } from "../../modules/UtilsCn";

/** 原 C9 */
function AlertTitle({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("font-medium group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground", className)}
      {...props}
    />
  );
}

export { AlertTitle };
