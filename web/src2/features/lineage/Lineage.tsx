// 谱系模（S8）：从会话事件日志提取子代理/委托/工作流活组织。
// 内核未暴露父子会话映射 → 节点不可跳转时诚实标注（计划允许的降级）。

import { useEffect, useState } from "react";
import { getClient, useApp } from "../../core/store";
import type { ToolCall, Turn } from "../../core/types";
import { Badge, Dot } from "../../ui/primitives";
import { ViewSwitch } from "./ViewSwitch";
import "./lineage.css";

const LINEAGE_RE = /spawn_subagent|subagent|delegate_task|delegation|workflow|monitor/i;

interface Node {
  kind: string;
  title: string;
  out: string;
  state: "ok" | "run" | "err";
}

function nodeOf(tc: ToolCall, settled: boolean): Node {
  const input = tc.input as Record<string, string>;
  const title =
    input.description || input.goal || (input.prompt ? input.prompt.slice(0, 60) : "") || tc.name;
  const out = (tc.output ?? "").trim();
  // 空输出：会话已落定=完成（回放不带输出），否则=运行中
  const state: Node["state"] = out
    ? /error|failed|killed|cancelled/i.test(out.slice(0, 200))
      ? "err"
      : "ok"
    : settled
      ? "ok"
      : "run";
  const kind = /workflow/i.test(tc.name)
    ? "workflow"
    : /delegate/i.test(tc.name)
      ? "delegate"
      : /monitor/i.test(tc.name)
        ? "monitor"
        : "subagent";
  return { kind, title, out: out.slice(0, 90), state };
}

export function Lineage({ taskId }: { taskId: string }) {
  const tasks = useApp((s) => s.tasks);
  const task = tasks.find((t) => t.taskId === taskId) ?? null;
  const [turns, setTurns] = useState<Turn[]>([]);

  const client = (() => {
    try {
      return getClient();
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    if (!client) return;
    let on = true;
    void client
      .getConversation(taskId)
      .then((ts) => on && setTurns(ts))
      .catch(() => {});
    return () => {
      on = false;
    };
  }, [taskId, client]);

  const settled = task?.status === "completed" || task?.status === "failed";
  const nodes: Node[] = [];
  for (const t of turns) {
    for (const tc of t.toolCalls ?? []) {
      if (LINEAGE_RE.test(tc.name)) nodes.push(nodeOf(tc, settled));
    }
  }

  return (
    <div className="lineage" data-slot="lineage">
      <div className="lineage__col">
        <div className="lineage__root">
          <Dot
            kind={task?.status === "running" ? "running" : task?.status === "failed" ? "failed" : "idle"}
            pulse={task?.status === "running"}
          />
          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {task?.title ?? taskId}
          </span>
          <ViewSwitch />
        </div>
        {nodes.length === 0 && (
          <div className="lineage__note">
            该会话未派发子代理/委托/工作流 —— 谱系为空。派发后此处将生长为活组织图。
          </div>
        )}
        {nodes.map((n, i) => (
          <div key={i}>
            <div className="lineage__edge" />
            <div className={`lineage__node lineage__node--${n.state}`}>
              <div className="lineage__node-row">
                <span className="lineage__kind">{n.kind}</span>
                <span className="lineage__title">{n.title}</span>
                <Badge tone={n.state === "ok" ? "success" : n.state === "err" ? "danger" : "amber"}>
                  {n.state === "ok" ? "完成" : n.state === "err" ? "异常" : "运行"}
                </Badge>
              </div>
              {n.out && <div className="lineage__out">{n.out}</div>}
            </div>
          </div>
        ))}
        {nodes.length > 0 && (
          <div className="lineage__note">
            内核尚未暴露父子会话映射 —— 节点暂不可跳转；映射可用后自动升级为可跳转活组织图。
          </div>
        )}
      </div>
    </div>
  );
}
