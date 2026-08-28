// Shared composer: auto-growing textarea, Enter to send / Shift+Enter newline,
// "/" command menu, "@" file menu (desktop fs), full toolbar.
import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import type { HostClient, Provider } from "../lib/rpc";
import { useI18n } from "../lib/i18n";
import { IconArrowUp, IconChevronDown, IconGauge, IconHand, IconPlus } from "../icons";

interface Props {
  client: HostClient;
  draft: string;
  setDraft: Dispatch<SetStateAction<string>>;
  onSubmit: () => void;
  providers?: Provider[];
  selection?: { providerId: string; modelName: string } | null;
  onSelectModel?: (providerId: string, modelName: string) => void;
  planMode?: boolean;
  setPlanMode?: (v: boolean) => void;
  confirmMode?: boolean;
  setConfirmMode?: (v: boolean) => void;
  commands: Array<{ name: string; description: string }>;
  workspacePath?: string;
  busy?: boolean;
  effort?: string;
  onEffort?: (effort: string) => void;
  tasks?: Array<{ taskId: string; title: string }>;
  skills?: Array<{ name: string; description?: string }>;
}

const EFFORTS = ["off", "low", "medium", "high", "max"];

export function Composer({
  client,
  draft,
  setDraft,
  onSubmit,
  providers,
  selection,
  onSelectModel,
  planMode,
  setPlanMode,
  confirmMode,
  setConfirmMode,
  commands,
  workspacePath,
  busy,
  effort,
  onEffort,
  tasks,
  skills,
}: Props) {
  const { tr } = useI18n();
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [modelMenu, setModelMenu] = useState(false);
  const [effortMenu, setEffortMenu] = useState(false);
  const [plusMenu, setPlusMenu] = useState(false);
  const [files, setFiles] = useState<Array<{ name: string; isDir: boolean }>>([]);

  // autosize
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [draft]);

  // "/" and "@" and "#" menus derive from the draft tail
  const slashToken = /^\/(\S*)$/.exec(draft);
  const atToken = /@([^\s@]*)$/.exec(draft);
  const hashToken = /#([^\s#]*)$/.exec(draft);
  const showSlash = Boolean(slashToken);
  const showAt = Boolean(atToken) && client.isDesktop;
  const showHash = Boolean(hashToken);
  const hashItems = showHash
    ? [
        ...(tasks ?? []).map((t) => ({ id: t.taskId, label: t.title, kind: "session" as const })),
        ...(skills ?? []).map((s) => ({ id: s.name, label: s.name, kind: "skill" as const })),
      ].filter((m) => m.label.toLowerCase().includes((hashToken?.[1] ?? "").toLowerCase()))
    : [];

  useEffect(() => {
    if (showAt && workspacePath) client.listFiles(workspacePath).then(setFiles);
  }, [showAt, workspacePath, client]);

  const pickCommand = (name: string) => setDraft(`/${name} `);
  const pickFile = (name: string) => setDraft((d) => d.replace(/@([^\s@]*)$/, `@${workspacePath}/${name} `));
  const pickMention = (label: string) => setDraft((d) => d.replace(/#([^\s#]*)$/, `#${label} `));

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const providerName = providers?.find((p) => p.id === selection?.providerId)?.name;
  const modelLabel = selection
    ? providerName
      ? `${providerName}/${selection.modelName}`
      : selection.modelName
    : tr("selectModel");

  return (
    <div className="composer-card">
      <div className="composer-inner">
        {(showSlash || showAt || showHash) && (
          <div className="cmd-menu">
            {showHash &&
              hashItems
                .slice(0, 8)
                .map((m) => (
                  <div key={`${m.kind}-${m.id}`} className="menu-item" onClick={() => pickMention(m.label)}>
                    <span className="cmd-name">{m.kind === "session" ? "#" : "⚡"}</span>
                    <span className="cmd-desc">{m.label}</span>
                  </div>
                ))}
            {showSlash &&
              commands
                .filter((c) => c.name.startsWith(slashToken?.[1] ?? ""))
                .slice(0, 8)
                .map((c) => (
                  <div key={c.name} className="menu-item" onClick={() => pickCommand(c.name)}>
                    <span className="cmd-name">/{c.name}</span>
                    <span className="cmd-desc">{c.description}</span>
                  </div>
                ))}
            {showAt &&
              files
                .filter((f) => f.name.startsWith(atToken?.[1] ?? "") || (atToken?.[1] ?? "").includes("/"))
                .slice(0, 8)
                .map((f) => (
                  <div key={f.name} className="menu-item" onClick={() => pickFile(f.name)}>
                    <span className="cmd-name">{f.isDir ? "🗀" : "·"}</span>
                    <span className="cmd-desc">{f.name}</span>
                  </div>
                ))}
          </div>
        )}
        <textarea
          ref={areaRef}
          className="composer-input"
          rows={1}
          placeholder={tr("placeholder")}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <div className="composer-toolbar">
          <span className="tool-left">
            <input
              type="file"
              ref={fileRef}
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  void file.text().then((content) => {
                    setDraft((d) => `${d}${d ? "\n" : ""}<file name="${file.name}">\n${content.slice(0, 20000)}\n</file>\n`);
                  });
                }
                e.target.value = "";
              }}
            />
            <span className="tool" onClick={() => setPlusMenu((v) => !v)} title="attach">
              <IconPlus width={15} height={15} />
              {plusMenu && (
                <div className="menu">
                  <div
                    className="menu-item"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPlusMenu(false);
                      fileRef.current?.click();
                    }}
                  >
                    {tr("attachFile")}
                  </div>
                  {setPlanMode && (
                    <div
                      className={`menu-item ${planMode ? "active" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPlanMode(!planMode);
                      }}
                    >
                      {tr("planMode")}
                    </div>
                  )}
                </div>
              )}
            </span>
            {setConfirmMode && (
              <span className={confirmMode ? "tool plan-on" : "tool"} onClick={() => setConfirmMode(!confirmMode)}>
                <IconHand width={14} height={14} /> {tr("confirmBeforeChange")}
                <IconChevronDown width={11} height={11} />
              </span>
            )}
          </span>
          <span className="tool-right">
            {onSelectModel && providers && (
              <span className="tool" onClick={() => setModelMenu((v) => !v)}>
                {modelLabel} <IconChevronDown width={11} height={11} />
                {modelMenu && (
                  <div className="menu">
                    {providers.map((provider) => (
                      <div className="menu-group" key={provider.id}>
                        <div className="menu-title">{provider.name}</div>
                        {provider.models.slice(0, 6).map((model) => (
                          <div
                            className="menu-item"
                            key={model}
                            onClick={(e) => {
                              e.stopPropagation();
                              setModelMenu(false);
                              onSelectModel(provider.id, model);
                            }}
                          >
                            {model}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </span>
            )}
            <span className="tool" onClick={() => onEffort && setEffortMenu((v) => !v)}>
              <IconGauge width={14} height={14} /> {effort ?? tr("thoughtMax")}
              <IconChevronDown width={11} height={11} />
              {effortMenu && onEffort && (
                <div className="menu">
                  {EFFORTS.map((level) => (
                    <div
                      className={`menu-item ${level === effort ? "active" : ""}`}
                      key={level}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEffortMenu(false);
                        onEffort(level);
                      }}
                    >
                      {level}
                    </div>
                  ))}
                </div>
              )}
            </span>
            <span className={`send ${busy ? "send-busy" : ""}`} onClick={onSubmit}>
              <IconArrowUp width={14} height={14} />
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
