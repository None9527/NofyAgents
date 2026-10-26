import { Disclosure } from "../../ui/disclosure.tsx";
import { IconCheck, IconClock, IconList } from "../../ui/icons.tsx";
import { tr } from "../../ui/i18n.ts";
import { useLocale } from "../../ui/useLocale.ts";
import { planEntries } from "./planModel.ts";

export function PlanActivity({ payload }: { payload: unknown }) {
  useLocale();
  const entries = planEntries(payload);
  const current = entries?.find(entry => entry.status === "in_progress");
  return <Disclosure className="plan-activity activity-card" summary={<>
    <IconList size={16} /><span className="activity-card__title">{tr("计划")}</span>
    {entries && <span className="plan-activity__count">{entries.filter(entry => entry.status === "completed").length}/{entries.length}</span>}
    {current && <span className="activity-card__detail">{current.content}</span>}
  </>}>
    {entries ? <ol className="plan-activity__entries">{entries.map((entry, index) => <li key={index} data-status={entry.status}>
      <span className="plan-activity__status" aria-label={tr(entry.status === "completed" ? "已完成" : entry.status === "in_progress" ? "执行中" : entry.status === "pending" ? "待执行" : "状态未知")}>
        {entry.status === "completed" ? <IconCheck size={14} /> : entry.status === "in_progress" ? <IconClock size={14} /> : <span aria-hidden="true">○</span>}
      </span><span>{entry.content}</span>
    </li>)}</ol> : <pre className="activity-parameters__text">{JSON.stringify(payload, null, 2)}</pre>}
  </Disclosure>;
}
