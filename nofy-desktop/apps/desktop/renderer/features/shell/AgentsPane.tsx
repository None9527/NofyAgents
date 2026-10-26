import { agentWorkPhrase, type AgentRow } from "../conversation/public.ts";
import type { SubagentProgress } from "../../core/store/state.ts";
import { PaneEmpty, PaneIconButton } from "../../ui/workbench.tsx";
import { IconBot, IconChevronDown, IconX } from "../../ui/icons.tsx";
import { Markdown } from "../../ui/markdown.tsx";
import { tr } from "../../ui/i18n.ts";
import { useLocale } from "../../ui/useLocale.ts";

/** Finished duration only. A running agent has no start timestamp, so the row does not invent a live clock. */
function agentDuration(seconds: number | null): string | null {
  if (seconds === null || !Number.isFinite(seconds) || seconds <= 0) return null;
  const whole = Math.max(1, Math.round(seconds));
  if (whole < 60) return tr("{0} 秒", [String(whole)]);
  const minutes = Math.floor(whole / 60);
  if (minutes < 60) return tr("{0} 分", [String(minutes)]);
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? tr("{0} 时", [String(hours)]) : tr("{0} 时 {1} 分", [String(hours), String(rest)]);
}

export function AgentsPane({ agents, agentFocus, progress, onCancel }: { agents: AgentRow[]; agentFocus: string | null; progress: Record<string, SubagentProgress>; onCancel?: (subagentId: string) => void }) {
  useLocale();
  return (
    <div className="aux__body agentsdir">
      {agents.length === 0 ? (
        <PaneEmpty icon={<IconBot size={24} />} title={tr("子智能体")} description={tr("本会话还没有子智能体。模型拉起子会话后，这里会同批列出。")} />
      ) : (
        agents.map((agent) => {
          const name = agent.description ?? agent.prompt ?? agent.toolCallId;
          const duration = agentDuration(agent.durationSecs);
          const phrase = tr(agentWorkPhrase(agent));
          const idTitle = agent.subagentId !== null ? "subagent_id " + agent.subagentId : tr("等待结果页脚回传");
          const cancelId = agent.running && agent.subagentId !== null && onCancel !== undefined ? agent.subagentId : null;
          const live = agent.subagentId !== null ? progress[agent.subagentId] : undefined;
          const tools = live?.toolsUsed ?? [];
          const counts = [live?.turnCount != null ? tr("{0} 轮", [String(live.turnCount)]) : "", live?.toolCallCount != null ? tr("{0} 次工具", [String(live.toolCallCount)]) : ""].filter((part) => part !== "").join(" · ");
          const prompt = agent.prompt !== null && agent.prompt !== name ? agent.prompt : null;
          const output = agent.output !== null && agent.output.length > 0 ? agent.output : null;
          const hasBody = prompt !== null || output !== null || tools.length > 0 || counts !== "";
          return (
            <div key={agent.blockId} className="agentsdir__entry">
              <details className="agentsdir__row" open={agentFocus === agent.subagentId}>
                <summary className="agentsdir__head" title={idTitle}>
                  <span className="agentsdir__chevron" aria-hidden="true"><IconChevronDown size={14} /></span>
                  <span className={"agentbadge agentbadge--mark agentbadge--" + agent.color} title={agent.subagentType ?? tr("类型未知")}>
                    {(agent.subagentType ?? "?").slice(0, 1).toUpperCase()}
                  </span>
                  <span className="agentsdir__desc" title={name}>{name}</span>
                  <span className={"agentsdir__status" + (agent.running ? " activity-live" : "") + (!agent.running && agent.failed ? " agentsdir__status--fail" : "")}>{phrase}</span>
                  {duration !== null ? <span className="agentsdir__time">{duration}</span> : null}
                </summary>
                {hasBody ? (
                  <div className="agentsdir__body">
                    {prompt !== null ? <p className="agentsdir__prompt">{prompt.length > 4000 ? prompt.slice(0, 4000) + "…" : prompt}</p> : null}
                    {counts !== "" || tools.length > 0 ? (
                      <div className="agentsdir__meta">
                        {counts !== "" ? <span className="agentsdir__progress">{counts}</span> : null}
                        {tools.map((tool) => <span className="agentsdir__tool" key={tool} title={tool}>{tool}</span>)}
                      </div>
                    ) : null}
                    {output !== null ? <div className="agentsdir__output"><Markdown text={output} /></div> : null}
                  </div>
                ) : null}
              </details>
              {cancelId !== null ? (
                <PaneIconButton className="agentsdir__cancel" aria-label={tr("取消子智能体")} onClick={() => onCancel?.(cancelId)}>
                  <IconX size={14} />
                </PaneIconButton>
              ) : null}
            </div>
          );
        })
      )}
    </div>
  );
}
