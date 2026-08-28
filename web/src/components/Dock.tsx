// Bottom dock panel (spec §7): tabbed drawer hosting terminal tabs, browser
// tabs and the review/diff tab. Opened only via quick pick / shortcuts.
import { useEffect, useRef, useState } from "react";
import type { HostClient } from "../lib/rpc";
import { useI18n } from "../lib/i18n";
import { IconBranch, IconClose, IconGlobe, IconPlus, IconTerminal } from "../icons";

export interface DockTab {
  id: number;
  kind: "terminal" | "browser" | "review";
  url?: string;
}

interface Props {
  client: HostClient;
  cwd: string;
  tabs: DockTab[];
  activeId: number | null;
  onSelect: (id: number) => void;
  onClose: (id: number) => void;
  onAdd: (kind: DockTab["kind"]) => void;
  onHide: () => void;
}

export function Dock({ client, cwd, tabs, activeId, onSelect, onClose, onAdd, onHide }: Props) {
  const { tr } = useI18n();
  const [addMenu, setAddMenu] = useState(false);
  const active = tabs.find((t) => t.id === activeId) ?? null;
  return (
    <div className="dock">
      <div className="dock-tabs">
        {tabs.map((t) => (
          <span
            key={t.id}
            className={`dock-tab ${t.id === activeId ? "active" : ""}`}
            onClick={() => onSelect(t.id)}
          >
            {t.kind === "terminal" ? (
              <IconTerminal width={12} height={12} />
            ) : t.kind === "browser" ? (
              <IconGlobe width={12} height={12} />
            ) : (
              <IconBranch width={12} height={12} />
            )}
            <span>{t.kind === "review" ? tr("review") : t.kind === "browser" ? (t.url ?? tr("browserPane")) : tr("terminal")}</span>
            <span
              className="dock-tab-close"
              onClick={(e) => {
                e.stopPropagation();
                onClose(t.id);
              }}
            >
              <IconClose width={10} height={10} />
            </span>
          </span>
        ))}
        <span className="dock-add" title={tr("terminalNew")} style={{ position: "relative" }} onClick={() => setAddMenu((v) => !v)}>
          <IconPlus width={12} height={12} />
          {addMenu && (
            <>
              <div className="cap-menu-backdrop" onClick={() => setAddMenu(false)} />
              <div className="cap-menu" style={{ top: 24, left: 0, width: 170 }}>
                <button className="cap-menu-item" onClick={() => { setAddMenu(false); onAdd("terminal"); }}>
                  <span>{tr("qpAddTerminalTab")}</span>
                </button>
                <button className="cap-menu-item" onClick={() => { setAddMenu(false); onAdd("browser"); }}>
                  <span>{tr("qpAddBrowserTab")}</span>
                </button>
                <button className="cap-menu-item" onClick={() => { setAddMenu(false); onAdd("review"); }}>
                  <span>{tr("qpAddReviewTab")}</span>
                </button>
              </div>
            </>
          )}
        </span>
        <span className="spacer" />
        <span className="dock-add" title={tr("terminalHide")} onClick={onHide}>
          —
        </span>
      </div>
      <div className="dock-body">
        {active?.kind === "terminal" && <TerminalPane client={client} cwd={cwd} />}
        {active?.kind === "browser" && <BrowserPane tab={active} />}
        {active?.kind === "review" && <ReviewPane client={client} cwd={cwd} />}
      </div>
    </div>
  );
}

function TerminalPane({ client, cwd }: { client: HostClient; cwd: string }) {
  const { tr } = useI18n();
  const [lines, setLines] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView();
  }, [lines]);
  const run = () => {
    const cmd = input.trim();
    if (!cmd) return;
    setInput("");
    setLines((l) => [...l, `$ ${cmd}`]);
    void client.exec(cmd, cwd).then((r) => setLines((l) => [...l, ...(r.output || "").split("\n")]));
  };
  return (
    <div className="terminal-scroll">
      {lines.map((l, i) => (
        <div className="terminal-line" key={i}>
          {l}
        </div>
      ))}
      <div className="terminal-input-row">
        <span className="terminal-prompt">$</span>
        <input
          className="terminal-input"
          value={input}
          placeholder={tr("terminalPlaceholder")}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run()}
        />
      </div>
      <div ref={endRef} />
    </div>
  );
}

function BrowserPane({ tab }: { tab: DockTab }) {
  const { tr } = useI18n();
  const [url, setUrl] = useState(tab.url ?? "");
  const [loaded, setLoaded] = useState(tab.url ?? "");
  return (
    <div className="browser-frame">
      <div className="browser-bar">
        <input
          className="overlay-input"
          placeholder={tr("browserHint")}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            let next = url.trim();
            if (!/^https?:\/\//.test(next)) next = `https://${next}`;
            setLoaded(next);
          }}
        />
      </div>
      {loaded ? (
        <iframe className="browser-iframe" src={loaded} title="browser" />
      ) : (
        <div className="empty">{tr("browserHint")}</div>
      )}
    </div>
  );
}

function ReviewPane({ client, cwd }: { client: HostClient; cwd: string }) {
  const { tr } = useI18n();
  const [files, setFiles] = useState<Array<{ code: string; path: string }>>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [diff, setDiff] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    void client
      .exec(`git -C "${cwd}" status --porcelain 2>/dev/null`, cwd)
      .then(({ output }) => {
        if (output.includes("(web)")) {
          setError(tr("gitNeedDesktop"));
          return;
        }
        setFiles(
          output
            .split("\n")
            .map((l) => /^([ ?MADRC!]{2}) (.+)$/.exec(l.trim()))
            .filter((m): m is RegExpExecArray => Boolean(m))
            .map((m) => ({ code: m[1].trim() || "M", path: m[2] })),
        );
      });
  }, [client, cwd, tr]);
  const open = (path: string) => {
    setSelected(path);
    void client.exec(`git -C "${cwd}" diff -- "${path}" 2>/dev/null`, cwd).then((r) => setDiff(r.output || tr("gitNoDiff")));
  };
  return (
    <div className="git-body">
      <div className="git-files">
        {error && <div className="crud-error">{error}</div>}
        {files.map((f) => (
          <div key={f.path} className={`git-file ${selected === f.path ? "active" : ""}`} onClick={() => open(f.path)}>
            <span className={`git-code gc-${f.code === "??" ? "u" : f.code.toLowerCase()}`}>{f.code}</span>
            <span className="git-path">{f.path}</span>
          </div>
        ))}
      </div>
      <div className="git-diff">
        {selected && diff ? (
          <pre className="diff-pre">
            {diff.split("\n").map((line, i) => (
              <div
                key={i}
                className={
                  line.startsWith("+") ? "diff-add" : line.startsWith("-") ? "diff-del" : line.startsWith("@@") ? "diff-hunk" : "diff-ctx"
                }
              >
                {line || " "}
              </div>
            ))}
          </pre>
        ) : (
          <div className="empty">{tr("gitPickFile")}</div>
        )}
      </div>
    </div>
  );
}
