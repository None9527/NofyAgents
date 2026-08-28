// 契约模（S9）：autonomy 旋钮（全局默认+每任务覆盖）、预算信封、
// 回滚覆盖率、信任校准建议。全部数据来自真实统计，不造假。

import { useEffect, useState } from "react";
import { getClient, useApp } from "../../core/store";
import { getApprovalStats, getTaskMeta, setTaskMeta } from "../../core/meta";
import { Badge, Button } from "../../ui/primitives";
import { ViewSwitch } from "../lineage/ViewSwitch";
import "./contract.css";

const LEVELS: Array<["L1" | "L2" | "L3" | "L4", string, string]> = [
  ["L1", "严格审批", "每次工具调用都裁决。适合陌生任务与高危仓库。"],
  ["L2", "监督", "默认放行常规动作，高危动作仍裁决。当前默认。"],
  ["L3", "自主", "仅打断级事件（L2+ 注意力）上升。适合信任的工作流。"],
  ["L4", "全信", "除不可逆操作外不打断。需要回滚覆盖率兜底。"],
];
const BUDGETS = ["不限", "100k", "500k", "1M"] as const;
const BUDGET_NUM: Record<string, number> = { "100k": 100_000, "500k": 500_000, "1M": 1_000_000 };

export function Contract({ taskId }: { taskId: string }) {
  const metaRev = useApp((s) => s.metaRev);
  const bumpMeta = useApp((s) => s.bumpMeta);
  const defaultAutonomy = useApp((s) => s.defaultAutonomy);
  const setDefaultAutonomy = useApp((s) => s.setDefaultAutonomy);
  const defaultBudget = useApp((s) => s.defaultBudget);
  const setDefaultBudget = useApp((s) => s.setDefaultBudget);

  void metaRev;
  const meta = getTaskMeta(taskId);
  const autonomy = (meta.autonomy as "L1" | "L2" | "L3" | "L4") ?? defaultAutonomy;
  const budget = meta.budget ?? defaultBudget;

  const [points, setPoints] = useState<{ total: number; withSnap: number } | null>(null);
  const [usage, setUsage] = useState<number | null>(null);

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
      .getRewindPoints(taskId)
      .then((r) => {
        if (!on) return;
        setPoints({
          total: r.points.length,
          withSnap: r.points.filter((p) => p.has_file_changes).length,
        });
      })
      .catch(() => on && setPoints({ total: 0, withSnap: 0 }));
    void client
      .getTaskStats(taskId)
      .then((s) => on && setUsage(s.usage.input + s.usage.output + s.usage.reasoning))
      .catch(() => {});
    return () => {
      on = false;
    };
  }, [taskId, client]);

  const setOverride = (lv: "L1" | "L2" | "L3" | "L4") => {
    setTaskMeta(taskId, { autonomy: lv });
    bumpMeta();
  };
  const setBudgetOverride = (b: string) => {
    setTaskMeta(taskId, { budget: b });
    bumpMeta();
  };

  const stats = getApprovalStats();
  const totalRulings = stats.allowed + stats.rejected;
  const allowRate = totalRulings > 0 ? stats.allowed / totalRulings : 1;
  const calibration =
    totalRulings === 0
      ? "尚无裁决样本 —— 每次允许/拒绝都会进入校准统计。"
      : totalRulings < 5
        ? `样本 ${totalRulings} 次，允许率 ${(allowRate * 100).toFixed(0)}% —— 样本不足，暂不建议调整。`
        : allowRate >= 0.95 && autonomy !== "L4"
          ? `允许率 ${(allowRate * 100).toFixed(0)}%（${totalRulings} 次）—— 你几乎不拒绝，建议把 autonomy 提升一档放权。`
          : allowRate <= 0.7
            ? `允许率 ${(allowRate * 100).toFixed(0)}% —— 拒绝频繁，建议收紧一档或为该类任务补充工作单约束。`
            : `允许率 ${(allowRate * 100).toFixed(0)}% —— 当前档位与你的裁决习惯匹配。`;

  const budgetCap = BUDGET_NUM[budget];
  const pct = usage != null && budgetCap ? Math.min(100, (usage / budgetCap) * 100) : null;

  return (
    <div className="contract" data-slot="contract">
      <div className="contract__col">
        <div className="contract__card">
          <div className="contract__card-head">
            <span className="contract__card-title">信任旋钮 · autonomy</span>
            <ViewSwitch />
          </div>
          <div className="ui-seg" data-slot="autonomy-knob">
            {LEVELS.map(([lv, name]) => (
              <button key={lv} data-on={autonomy === lv} onClick={() => setOverride(lv)}>
                {lv} {name}
              </button>
            ))}
          </div>
          <div className="contract__desc">
            {LEVELS.find(([lv]) => lv === autonomy)?.[2]}
            {meta.autonomy ? "（本任务覆盖）" : "（沿用全局默认）"}
          </div>
          <div className="contract__stats">
            <Button size="sm" variant="ghost" onClick={() => setDefaultAutonomy(autonomy)}>
              设为全局默认
            </Button>
            <span>全局默认：{defaultAutonomy}</span>
          </div>
        </div>

        <div className="contract__card">
          <div className="contract__card-head">
            <span className="contract__card-title">预算信封</span>
            {pct != null && pct >= 80 && <Badge tone={pct >= 100 ? "danger" : "amber"}>{pct >= 100 ? "已超支" : "接近上限"}</Badge>}
          </div>
          <div className="ui-seg">
            {BUDGETS.map((b) => (
              <button key={b} data-on={budget === b} onClick={() => setBudgetOverride(b)}>
                {b === "不限" ? "∞" : b}
              </button>
            ))}
          </div>
          {pct != null ? (
            <>
              <div className="contract__bar">
                <div style={{ width: `${pct}%` }} data-warn={pct >= 80 && pct < 100 ? "true" : undefined} data-danger={pct >= 100 ? "true" : undefined} />
              </div>
              <div className="contract__stats">
                <span>已用 {usage?.toLocaleString()} tokens / {budget}</span>
              </div>
            </>
          ) : (
            <div className="contract__desc">不限预算 —— 用量仅记录不设限。</div>
          )}
          <div className="contract__stats">
            <Button size="sm" variant="ghost" onClick={() => setDefaultBudget(budget)}>
              设为全局默认
            </Button>
            <span>全局默认：{defaultBudget}</span>
          </div>
        </div>

        <div className="contract__card">
          <div className="contract__card-head">
            <span className="contract__card-title">回滚覆盖率</span>
            {points && points.total > 0 && (
              <Badge tone={points.withSnap / points.total >= 0.5 ? "success" : "warn"}>
                {Math.round((points.withSnap / points.total) * 100)}%
              </Badge>
            )}
          </div>
          {points ? (
            <>
              <div className="contract__bar">
                <div style={{ width: `${points.total ? (points.withSnap / points.total) * 100 : 0}%` }} />
              </div>
              <div className="contract__stats">
                <span>{points.total} 个检查点 · {points.withSnap} 个带文件快照</span>
              </div>
              <div className="contract__desc">
                覆盖率=可安全回滚的轮次占比。放权（L3/L4）前建议 ≥50%，作为安全网。
              </div>
            </>
          ) : (
            <div className="contract__desc">读取检查点中…</div>
          )}
        </div>

        <div className="contract__card">
          <div className="contract__card-head">
            <span className="contract__card-title">信任校准</span>
            <Badge>{totalRulings} 次裁决</Badge>
          </div>
          <div className="contract__desc">{calibration}</div>
        </div>
      </div>
    </div>
  );
}
