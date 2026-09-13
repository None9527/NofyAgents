/**
 * AgentChip —— 对话区右上的子智能体汇总芯片（与 DiffChip 同壳同栈；
 * 活壳 TopBar SummaryAgentsSection 的卡片头同位：总数 · 运行中）。
 * 没有子智能体块时**不渲染**——空芯片比没有更吵（DiffChip 同纪律）。
 * 点开 = 侧边面板「子智能体」目录 tab。
 */
import { IconBot } from "../../ui/icons.tsx";
import type { AgentSummary } from "./agentModel.ts";

export function AgentChip({ summary, onOpen }: { summary: AgentSummary; onOpen: () => void }) {
  if (summary.total === 0) return null;
  const label =
    summary.running > 0
      ? "子智能体 " + String(summary.total) + " · " + String(summary.running) + " 运行中"
      : "子智能体 " + String(summary.total) + (summary.failed > 0 ? " · " + String(summary.failed) + " 失败" : "");
  return (
    <button
      type="button"
      className="diffchip"
      onClick={onOpen}
      title="子智能体目录（侧边面板）：本会话每个 task 块的提示词 / 回传 / subagent_id"
      aria-label={label}
    >
      <IconBot size={14} />
      <span className="diffchip__label">{label}</span>
    </button>
  );
}
