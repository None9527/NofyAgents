import { tr } from "./i18n.ts";
import { useLocale } from "./useLocale.ts";
/** Shared controls; page layouts belong to their CSS modules. */
import type { ReactNode, ButtonHTMLAttributes } from "react";

export type Tone = "plain" | "brand" | "ok" | "warn";

export function Chip({ tone = "plain", title, children }: { tone?: Tone; title?: string; children: ReactNode }) {
  useLocale();
  const cls = tone === "plain" ? "chip" : "chip chip--" + tone;
  return (
    <span className={cls} title={title}>
      {children}
    </span>
  );
}

/** roster 的 activity 六态 → 一个点。未知态落回灰点，不猜颜色。 */
export function Dot({ activity }: { activity: string | null }) {
  useLocale();
  const known = new Set(["working", "idle", "needs_input", "dormant", "completed", "dead"]);
  const cls = activity !== null && known.has(activity) ? "dot dot--" + activity.replace(/_/g, "-") : "dot";
  return <span className={cls} title={activity ?? tr("未知")} />;
}

export type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /**
   * 可空：「未接线」的占位按钮是**刻意**没有 handler 的 disabled 按钮
   * （uiux-reference.md §1：空菜单项比灰按钮更失信，灰按钮比假按钮诚实）。
   */
  children: ReactNode;
  variant?: "plain" | "primary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
};

export function Btn({ children, disabled = false, variant = "plain", size = "sm", className = "", type = "button", ...props }: BtnProps) {
  useLocale();
  const cls = ["btn", "btn--" + size, variant === "plain" ? "" : "btn--" + variant, className].filter(Boolean).join(" ");
  return (
    <button {...props} type={type} className={cls} disabled={disabled}>
      {children}
    </button>
  );
}
