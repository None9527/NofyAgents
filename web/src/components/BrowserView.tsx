import { useState } from "react";
import { IconClose, IconPlus } from "../icons";
import { useI18n } from "../lib/i18n";

interface Tab {
  id: number;
  url: string | null;
  label: string;
}

interface Props {
  onBack: () => void;
}

let nextTabId = 1;

export function BrowserView({ onBack }: Props) {
  const { tr } = useI18n();
  const [tabs, setTabs] = useState<Tab[]>([{ id: nextTabId++, url: null, label: "新标签页" }]);
  const [active, setActive] = useState(tabs[0].id);
  const [urlDraft, setUrlDraft] = useState("");

  const current = tabs.find((t) => t.id === active) ?? tabs[0];

  const go = (target0: string) => {
    let target = target0.trim();
    if (!target) return;
    if (!/^https?:\/\//.test(target)) target = `https://${target}`;
    setTabs((prev) =>
      prev.map((t) =>
        t.id === active ? { ...t, url: target, label: new URL(target).hostname } : t,
      ),
    );
  };

  const addTab = () => {
    const tab: Tab = { id: nextTabId++, url: null, label: "新标签页" };
    setTabs((prev) => [...prev, tab]);
    setActive(tab.id);
    setUrlDraft("");
  };

  const closeTab = (id: number) => {
    setTabs((prev) => {
      const next = prev.filter((t) => t.id !== id);
      if (next.length === 0) {
        const fresh: Tab = { id: nextTabId++, url: null, label: "新标签页" };
        setActive(fresh.id);
        return [fresh];
      }
      if (id === active) setActive(next[next.length - 1].id);
      return next;
    });
  };

  return (
    <section className="list-view">
      <div className="task-head">
        <span className="back" onClick={onBack}>
          ←
        </span>
        <span className="task-title">{tr("browserPane")}</span>
        <span className="browser-tabs">
          {tabs.map((tab) => (
            <span
              key={tab.id}
              className={`browser-tab ${tab.id === active ? "active" : ""}`}
              onClick={() => {
                setActive(tab.id);
                setUrlDraft("");
              }}
            >
              {tab.label}
              <span
                className="browser-tab-close"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
              >
                <IconClose width={10} height={10} />
              </span>
            </span>
          ))}
          <span className="browser-tab-add" onClick={addTab}>
            <IconPlus width={12} height={12} />
          </span>
        </span>
      </div>
      <div className="task-composer">
        <input
          className="composer-input"
          placeholder="https://…"
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") go(urlDraft);
          }}
        />
        <span className="send" onClick={() => go(urlDraft)}>
          →
        </span>
      </div>
      <div className="browser-frame">
        {current?.url ? (
          <iframe className="browser-iframe" src={current.url} title="embedded browser" />
        ) : (
          <div className="empty">{tr("browserHint")}</div>
        )}
      </div>
    </section>
  );
}
