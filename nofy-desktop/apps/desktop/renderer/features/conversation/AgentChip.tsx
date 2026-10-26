import { tr } from "../../ui/i18n.ts";
import { useLocale } from "../../ui/useLocale.ts";
/**
 * 对话区右上的运行中子智能体胶囊。只在有 running 行时渲染，结束即卸掉。
 * 点开 = 右侧栏已有的子智能体目录，并定位到正在运行的那一条。
 */
import { IconBot } from "../../ui/icons.tsx";
import type { AgentRow } from "./agentModel.ts";

export function AgentChip({ agents, onOpen }: { agents: AgentRow[]; onOpen: () => void }) {
  useLocale();
  if (agents.length === 0) return null;
  const label = tr("子智能体") + " " + String(agents.length) + " · " + tr("运行中");
  return (
    <button
      type="button"
      className="diffchip"
      onClick={onOpen}
      title={tr("查看本会话子智能体")}
      aria-label={label}
    >
      <IconBot size={14} />
      <span className="diffchip__label">{label}</span>
    </button>
  );
}
