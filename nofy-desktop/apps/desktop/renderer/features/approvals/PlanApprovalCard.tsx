import { tr } from "../../ui/i18n.ts";
import { useLocale } from "../../ui/useLocale.ts";
import { useRef, useState } from "react";
import type { AppState } from "../../core/store/state.ts";
import { Btn } from "../../ui/primitives.tsx";
import type { ApprovalHandlers } from "./ApprovalCard.tsx";
import { readPlan, planResponse } from "./planModel.ts";

type Pending = AppState["pendingInteractions"][number];

export function PlanApprovalCard({ item, handlers }: { item: Pending; handlers: ApprovalHandlers }) {
  useLocale();
  const plan = readPlan(item.params);
  const [feedback, setFeedback] = useState("");
  const [sent, setSent] = useState(false);
  const submitted = useRef(false);
  const submit = (outcome: "approved" | "cancelled" | "abandoned") => {
    if (submitted.current || (outcome === "approved" && plan === null)) return;
    submitted.current = true;
    setSent(true);
    handlers.answer(item, planResponse(outcome, feedback));
  };
  return <section className="approval" aria-label={tr("审阅计划")}>
    <div className="approval__head"><span className="approval__title">{tr("审阅计划")}</span></div>
    {plan === null ? <p role="alert" className="approval__note">{tr("内核没有提供可读计划。请反馈重新生成，或放弃计划。")}</p> :
      <pre className="question__preview plan-preview">{plan}</pre>}
    <label className="question__text">{tr("整体反馈")}<textarea className="question__input" value={feedback} disabled={sent} rows={3}
        placeholder={tr("说明需要调整的内容")} onChange={(e) => setFeedback(e.target.value)} />
    </label>
    <p className="approval__note">{tr("反馈会保留计划模式并让助手调整；放弃会退出计划模式。")}</p>
    <div className="approval__options">
      <Btn variant="primary" disabled={sent || plan === null} onClick={() => submit("approved")}>{tr("批准并执行")}</Btn>
      <Btn disabled={sent || !feedback.trim()} onClick={() => submit("cancelled")}>{tr("发送反馈")}</Btn>
      <Btn disabled={sent} onClick={() => submit("cancelled")}>{tr("暂不批准")}</Btn>
      <Btn variant="danger" disabled={sent} onClick={() => submit("abandoned")}>{tr("放弃计划")}</Btn>
    </div>
  </section>;
}
