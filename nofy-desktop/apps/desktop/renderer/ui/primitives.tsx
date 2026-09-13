/**
 * UI 原语。刻意只有三个——S0 需要的就这么多。
 *
 * 不提前造一套「组件库」的理由：形状应由真实界面长出来。等审批卡、
 * 工具卡、roster 都落地后，重复的部分自然会浮现，那时再抽（PLAN §4 的顺序：
 * 令牌 → 原语 → ShellGrid → 特性面）。
 */
import type { ReactNode } from "react";

export type Tone = "plain" | "brand" | "ok" | "warn";

export function Chip({ tone = "plain", title, children }: { tone?: Tone; title?: string; children: ReactNode }) {
  const cls = tone === "plain" ? "chip" : "chip chip--" + tone;
  return (
    <span className={cls} title={title}>
      {children}
    </span>
  );
}

/** roster 的 activity 六态 → 一个点。未知态落回灰点，不猜颜色。 */
export function Dot({ activity }: { activity: string | null }) {
  const known = new Set(["working", "idle", "needs_input", "dormant", "completed", "dead"]);
  const cls = activity !== null && known.has(activity) ? "dot dot--" + activity.replace(/_/g, "-") : "dot";
  return <span className={cls} title={activity ?? "未知"} />;
}

export type BtnProps = {
  /**
   * 可空：「未接线」的占位按钮是**刻意**没有 handler 的 disabled 按钮
   * （uiux-reference.md §1：空菜单项比灰按钮更失信，灰按钮比假按钮诚实）。
   */
  onClick?: () => void;
  children: ReactNode;
  disabled?: boolean;
  variant?: "plain" | "primary" | "danger";
  title?: string;
};

export function Btn({ onClick, children, disabled = false, variant = "plain", title }: BtnProps) {
  const cls = variant === "plain" ? "btn" : "btn btn--" + variant;
  return (
    <button type="button" className={cls} onClick={onClick} disabled={disabled} title={title}>
      {children}
    </button>
  );
}
