// MCP form-elicitation dialog: renders the requestedSchema sent by the agent
// (ask_user_question) as an interactive form and resolves the server request.

import { useState } from "react";
import { useI18n } from "../lib/i18n";

interface SchemaProp {
  type?: string;
  title?: string;
  description?: string;
  enum?: string[];
  enumNames?: string[];
  items?: { enum?: string[] };
}

interface Props {
  params: Record<string, unknown>;
  onResolve: (action: "accept" | "decline" | "cancel", content?: Record<string, unknown>) => void;
}

export function ElicitationDialog({ params, onResolve }: Props) {
  const { tr } = useI18n();
  const schema = (params.requestedSchema ?? {}) as { properties?: Record<string, SchemaProp> };
  const properties = schema.properties ?? {};
  const [values, setValues] = useState<Record<string, unknown>>({});

  const set = (key: string, value: unknown) => setValues((v) => ({ ...v, [key]: value }));

  const fields = Object.entries(properties);

  return (
    <div className="overlay-backdrop">
      <div className="elicitation-card">
        <div className="elicitation-head">{String(params.message ?? tr("elicitation"))}</div>
        <div className="elicitation-body">
          {fields.map(([key, prop]) => (
            <div className="elicitation-field" key={key}>
              <label className="elicitation-label">
                {prop.title ?? key}
                {prop.description && <em>{prop.description}</em>}
              </label>
              {prop.type === "string" && prop.enum ? (
                <div className="elicitation-options">
                  {prop.enum.map((opt, i) => (
                    <button
                      key={opt}
                      className={`settings-button ${values[key] === opt ? "active" : ""}`}
                      onClick={() => set(key, opt)}
                    >
                      {prop.enumNames?.[i] ?? opt}
                    </button>
                  ))}
                </div>
              ) : prop.type === "boolean" ? (
                <input
                  type="checkbox"
                  checked={Boolean(values[key])}
                  onChange={(e) => set(key, e.target.checked)}
                />
              ) : prop.type === "integer" || prop.type === "number" ? (
                <input
                  type="number"
                  className="overlay-input"
                  value={String(values[key] ?? "")}
                  onChange={(e) => set(key, Number(e.target.value))}
                />
              ) : prop.type === "array" ? (
                <div className="elicitation-options">
                  {(prop.items?.enum ?? []).map((opt) => {
                    const current = Array.isArray(values[key]) ? (values[key] as string[]) : [];
                    const on = current.includes(opt);
                    return (
                      <button
                        key={opt}
                        className={`settings-button ${on ? "active" : ""}`}
                        onClick={() =>
                          set(key, on ? current.filter((o) => o !== opt) : [...current, opt])
                        }
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <input
                  type="text"
                  className="overlay-input"
                  value={String(values[key] ?? "")}
                  onChange={(e) => set(key, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
        <div className="elicitation-actions">
          <button className="settings-button" onClick={() => onResolve("cancel")}>
            {tr("elicitationCancel")}
          </button>
          <button className="settings-button" onClick={() => onResolve("decline")}>
            {tr("deny")}
          </button>
          <button className="settings-button primary" onClick={() => onResolve("accept", values)}>
            {tr("allow")}
          </button>
        </div>
      </div>
    </div>
  );
}
