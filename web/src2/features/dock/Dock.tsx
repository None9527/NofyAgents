// Dock（S7，移植自旧 Dock 并令牌化）：终端/浏览器/审查三 pane。
// 审查增补：单文件回滚（两步确认，git checkout -- path）。

import { useEffect, useRef, useState } from "react";
import { getClient, useApp } from "../../core/store";
import { Button, IconButton } from "../../ui/primitives";
import { Menu, type MenuEntry } from "../../ui/Menu";
import "./dock.css";

export interface DockTab {
  id: number;
  kind: "terminal" | "browser" | "review";
  url?: string;
}

const KIND_LABEL: Record<DockTab["kind"], string> = {
  terminal: "终端",
  browser: "浏览器",
  review: "审查",
};

export function Dock({
  tabs,
  activeId,
  onSelect,
  onClose,
  onAdd,
  onHide,
}: {
  tabs: DockTab[];
  activeId: number | null;
  onSelect: (id: number) => void;
  onClose: (id: number) => void;
  onAdd: (kind: DockTab["kind"]) => void;
  onHide: () => void;
}) {
  const workspace = useApp((s) => s.workspace);
  const [addOpen, setAddOpen] = useState(false);
  const [anchor, setAnchor] = useState({ x: 0, y: 0 });
  const active = tabs.find((t) => t.id === activeId) ?? null;

  const client = (() => {
    try {
      return getClient();
    } catch {
      return null;
    }
  })();

  const addItems: MenuEntry[] = [
    { label: "新终端标签", onClick: () => onAdd("terminal") },
    { label: "新浏览器标签", onClick: () => onAdd("browser") },
    { label: "审查标签", onClick: () => onAdd("review") },
  ];

  return (
    <div className="dock" data-slot="dock">
      <div className="dock__tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            className="dock__tab"
            data-active={t.id === activeId ? "true" : undefined}
            onClick={() => onSelect(t.id)}
          >
            <span>{KIND_LABEL[t.kind]}</span>
            <span
              className="dock__tab-close"
              onClick={(e) => {
                e.stopPropagation();
                onClose(t.id);
              }}
            >
              ×
            </span>
          </button>
        ))}
        <IconButton
          label="添加标签"
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setAnchor({ x: r.left, y: r.top - 4 });
            setAddOpen((v) => !v);
          }}
        >
          +
        </IconButton>
        <span style={{ marginLeft: "auto" }}>
          <IconButton label="收起 dock (Ctrl+`)" onClick={onHide}>
            —
          </IconButton>
        </span>
      </div>
      <div className="dock__body">
        {active?.kind === "terminal" && client && <TerminalPane cwd={workspace} />}
        {active?.kind === "browser" && <BrowserPane tab={active} />}
        {active?.kind === "review" && client && <ReviewPane cwd={workspace} />}
      </div>
      <Menu
        open={addOpen}
        onClose={() => setAddOpen(false)}
        anchor={{ x: anchor.x, y: anchor.y }}
        items={addItems}
      />
    </div>
  );
}

// ---------------------------------------------------------------- terminal

function TerminalPane({ cwd }: { cwd: string }) {
  const [lines, setLines] = useState<Array<{ cmd: boolean; text: string }>>([]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView();
  }, [lines]);
  const run = () => {
    const cmd = input.trim();
    if (!cmd) return;
    setInput("");
    setLines((l) => [...l, { cmd: true, text: `$ ${cmd}` }]);
    void getClient()
      .exec(cmd, cwd)
      .then((r) =>
        setLines((l) => [...l, ...(r.output || "").split("\n").map((text) => ({ cmd: false, text }))]),
      );
  };
  return (
    <div className="term">
      {lines.map((l, i) => (
        <div className={`term__line${l.cmd ? " term__line--cmd" : ""}`} key={i}>
          {l.text}
        </div>
      ))}
      <div className="term__input-row">
        <span className="term__prompt">$</span>
        <input
          className="term__input"
          value={input}
          placeholder="命令… (Enter 执行；web 传输为模拟执行)"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run()}
        />
      </div>
      <div ref={endRef} />
    </div>
  );
}

// ---------------------------------------------------------------- browser

function BrowserPane({ tab }: { tab: DockTab }) {
  const [url, setUrl] = useState(tab.url ?? "");
  const [loaded, setLoaded] = useState(tab.url ?? "");
  return (
    <div className="browser">
      <div className="browser__bar">
        <input
          placeholder="输入 URL，Enter 加载"
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
        <div className="review__empty">输入 URL 加载内嵌浏览</div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- review

function ReviewPane({ cwd }: { cwd: string }) {
  const [files, setFiles] = useState<Array<{ code: string; path: string }>>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [diff, setDiff] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rollbackArm, setRollbackArm] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const load = () => {
    void getClient()
      .exec(`git -C "${cwd}" status --porcelain 2>/dev/null`, cwd)
      .then(({ output }) => {
        if (output.includes("(web)")) {
          setError("审查需桌面版（Electron）git 能力");
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
  };
  useEffect(load, [cwd]);

  const open = (path: string) => {
    setSelected(path);
    setRollbackArm(false);
    void getClient()
      .exec(`git -C "${cwd}" diff -- "${path}" 2>/dev/null`, cwd)
      .then((r) => setDiff(r.output || "（无可用 diff —— 未跟踪文件请查看文件本身）"));
  };

  const rollback = () => {
    if (!selected) return;
    if (!rollbackArm) {
      setRollbackArm(true);
      return;
    }
    void getClient()
      .exec(`git -C "${cwd}" checkout -- "${selected}" 2>&1`, cwd)
      .then(({ output }) => {
        setNotice(output.trim() ? `回滚异常：${output.trim().slice(0, 120)}` : `已回滚 ${selected}`);
        setRollbackArm(false);
        setSelected(null);
        setDiff(null);
        load();
      });
  };

  return (
    <div className="review" data-slot="review">
      <div className="review__files">
        {error && <div className="review__empty">{error}</div>}
        {files.map((f) => (
          <button
            key={f.path}
            className="review__file"
            data-active={selected === f.path ? "true" : undefined}
            onClick={() => open(f.path)}
          >
            <span className={`gc-${f.code === "??" ? "u" : f.code.toLowerCase()}`}>{f.code}</span>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.path}</span>
          </button>
        ))}
        {!error && files.length === 0 && <div className="review__empty">工作区干净 —— 无变更。</div>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
        <div className="review__toolbar">
          <span style={{ fontFamily: "var(--font-mono)" }}>{selected ?? "选择文件查看 diff"}</span>
          {selected && (
            <Button size="sm" variant={rollbackArm ? "destructive" : "outline"} onClick={rollback}>
              {rollbackArm ? "确认回滚？不可恢复" : "回滚此文件"}
            </Button>
          )}
          {notice && <span style={{ color: "var(--amber)" }}>{notice}</span>}
        </div>
        <div className="review__diff">
          {selected && diff ? (
            diff.split("\n").map((line, i) => (
              <div
                key={i}
                className={
                  line.startsWith("+")
                    ? "diff-add"
                    : line.startsWith("-")
                      ? "diff-del"
                      : line.startsWith("@@")
                        ? "diff-hunk"
                        : "diff-ctx"
                }
              >
                {line || " "}
              </div>
            ))
          ) : (
            <div className="review__empty">从左侧选择文件。</div>
          )}
        </div>
      </div>
    </div>
  );
}
