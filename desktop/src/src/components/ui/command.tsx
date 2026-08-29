/* eslint-disable */
/**
 * ============================================================================
 * components/ui/command.tsx — cmdk CommandInput 封装（shadcn 风格，A0-S3c）
 * ============================================================================
 *
 * 依据 styles-CdEGpc2x.js 32120–32145（Xb）逐字重建：InputGroup + cmdk Input +
 * 尾部 Search addon。其余 Command 族（Yb/tOe/Zb/Qb/$b/ex/tx）属主为
 * modules/QuickPick.tsx，此处不重复。
 */
import * as React from "react";
import { CommandInput as CmdkInput } from "cmdk";
import { Search } from "lucide-react";
import { InputGroup, InputGroupAddon } from "./input-group";
import { cn } from "../../modules/UtilsCn";

/** 原 Xb */
function CommandInput({
  className,
  inputGroupClassName,
  ...props
}: React.ComponentProps<typeof CmdkInput> & { inputGroupClassName?: string }) {
  return (
    <div data-slot="command-input-wrapper" className="p-1 border-b border-border">
      <InputGroup className={cn("h-8 border-0 !bg-transparent hover:border-input-border-hover", inputGroupClassName)}>
        <CmdkInput
          data-slot="command-input"
          className={cn(
            "w-full text-ui-base/relaxed text-foreground outline-hidden placeholder:text-foreground-subtlest disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          {...props}
        />
        <InputGroupAddon>
          <Search className="size-4 shrink-0 text-foreground-subtlest" />
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}

export { CommandInput };
