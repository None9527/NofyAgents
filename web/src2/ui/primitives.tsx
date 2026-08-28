// ui 原语集 —— 统一 data-slot，样式全走 ui.css / tokens.css。
// 分叉表（orca §2.5）在后续 S 步按需补 Menu/Dialog/Sheet/Tooltip。

import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./ui.css";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "destructive";
type ButtonSize = "sm" | "md" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({ variant = "secondary", size = "md", className, ...rest }: ButtonProps) {
  return (
    <button
      data-slot="button"
      className={`ui-btn ui-btn--${variant} ui-btn--${size}${className ? ` ${className}` : ""}`}
      {...rest}
    />
  );
}

export function IconButton({
  active,
  label,
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean; label: string }) {
  return (
    <button
      data-slot="icon-button"
      data-active={active ? "true" : undefined}
      className={`ui-iconbtn${className ? ` ${className}` : ""}`}
      title={label}
      aria-label={label}
      {...rest}
    />
  );
}

export type BadgeTone = "neutral" | "accent" | "success" | "warn" | "danger" | "amber";

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: BadgeTone;
  children: ReactNode;
}) {
  return (
    <span
      data-slot="badge"
      className={`ui-badge${tone !== "neutral" ? ` ui-badge--${tone}` : ""}`}
    >
      {children}
    </span>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd data-slot="kbd" className="ui-kbd">
      {children}
    </kbd>
  );
}

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      data-slot="switch"
      className="ui-switch"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
    />
  );
}

export type DotKind = "idle" | "running" | "awaiting" | "failed" | "amber";

export function Dot({ kind = "idle", pulse }: { kind?: DotKind; pulse?: boolean }) {
  return (
    <span
      data-slot="dot"
      className={`ui-dot${kind !== "idle" ? ` ui-dot--${kind}` : ""}${pulse ? " ui-dot--pulse" : ""}`}
    />
  );
}
