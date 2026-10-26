import { tr } from "../../ui/i18n.ts";
import { useLocale } from "../../ui/useLocale.ts";
import { useRef, useState } from "react";
import type { AppState } from "../../core/store/state.ts";
import { Btn } from "../../ui/primitives.tsx";
import type { ApprovalHandlers } from "./ApprovalCard.tsx";
import { elicitDefaults, mcpElicitResponse, readElicitForm, validateElicit } from "./elicitationModel.ts";

type Pending = AppState["pendingInteractions"][number];

export function ElicitationCard({ item, handlers }: { item: Pending; handlers: ApprovalHandlers }) {
  useLocale();
  const form = readElicitForm(item.params);
  const [draft, setDraft] = useState(() => elicitDefaults(form));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const submitted = useRef(false);
  // Only the nofy MCP extension carries serverName and mode. Legacy ACP requests remain cancellable.
  const supported = typeof item.params.serverName === "string" && (item.params.mode === "form" || item.params.mode === "url");
  const submit = (outcome: "accept" | "decline" | "cancel") => {
    if (submitted.current) return;
    if (!supported) { submitted.current = true; setSent(true); handlers.cancel(item); return; }
    const result = validateElicit(form, draft);
    if (outcome === "accept" && Object.keys(result.errors).length) { setErrors(result.errors); return; }
    submitted.current = true;
    setSent(true);
    handlers.answer(item, mcpElicitResponse(outcome, result.content));
  };
  return <section className="approval" aria-label={tr("MCP 信息请求")}>
    <div className="approval__head"><span className="approval__title">{tr("MCP 信息请求")}</span><span>{String(item.params.serverName ?? "")}</span></div>
    <p className="question__text">{typeof item.params.message === "string" ? item.params.message : tr("请提供以下信息")}</p>
    {!supported ? <p role="alert">{tr("此协议版本尚未验证接受载荷，可取消请求。")}</p> : form.error ? <p role="alert">{form.error}</p> :
      <form onSubmit={(e) => { e.preventDefault(); submit("accept"); }}>
        {form.fields.map((f, i) => {
          const id = `elicit-${String(item.id)}-${String(i)}`;
          const v = draft[f.name];
          const update = (value: string | boolean | string[]) => setDraft((d) => ({ ...d, [f.name]: value }));
          return <div key={f.name} className="ui-field">
            <label htmlFor={id}>{f.title}{f.required ? " *" : ""}</label>
            {f.description ? <p id={`${id}-hint`}>{f.description}</p> : null}
            {f.unsupported ? <p role="alert">{f.unsupported}</p> : f.type === "boolean" ?
              <input id={id} type="checkbox" checked={v === true} disabled={sent} onChange={(e) => update(e.target.checked)} /> : f.options.length ?
              <select id={id} className="question__input" multiple={f.type === "array"} value={Array.isArray(v) ? v : typeof v === "string" ? v : ""} disabled={sent}
                aria-invalid={Boolean(errors[f.name])} aria-describedby={errors[f.name] ? `${id}-error` : `${id}-hint`}
                onChange={(e) => update(f.type === "array" ? Array.from(e.target.selectedOptions, (o) => o.value) : e.target.value)}>
                {f.type !== "array" ? <option value="">{tr("请选择")}</option> : null}
                {f.options.map((o) => <option value={o.value} key={o.value}>{o.label}</option>)}
              </select> : <input id={id} className="question__input" type={f.schema.format === "password" ? "password" : "text"} inputMode={f.type === "integer" || f.type === "number" ? "decimal" : "text"}
                value={typeof v === "string" ? v : ""} disabled={sent} autoComplete="off" aria-invalid={Boolean(errors[f.name])}
                aria-describedby={errors[f.name] ? `${id}-error` : `${id}-hint`} onChange={(e) => update(e.target.value)} />}
            {errors[f.name] ? <p id={`${id}-error`} role="alert">{errors[f.name]}</p> : null}
          </div>;
        })}
        <Btn variant="primary" disabled={sent || form.fields.some((f) => f.unsupported !== null)} onClick={() => submit("accept")}>{tr("接受并提交")}</Btn>
      </form>}
    <div className="approval__options">
      {supported ? <Btn disabled={sent} onClick={() => submit("decline")}>{tr("拒绝提供")}</Btn> : null}
      <Btn disabled={sent} onClick={() => submit("cancel")}>{tr("取消请求")}</Btn>
    </div>
  </section>;
}
