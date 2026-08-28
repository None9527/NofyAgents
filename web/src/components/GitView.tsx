// Git panel: branch, changed files (status --porcelain) and per-file diff.
// Real git runs through the desktop termExec bridge; the plain web build
// degrades to a hint because the ACP backend has no shell access.

import { useCallback, useEffect, useState } from "react";
import type { HostClient } from "../lib/rpc";
import { useI18n } from "../lib/i18n";

interface Props {
  client: HostClient;
  cwd: string;
  onBack: () => void;
}

interface Change {
  code: string; // e.g. "M", "??", "A"
  path: string;
}

const STATUS_LABEL: Record<string, string> = {
  M: "修改",
  A: "新增",
  D: "删除",
  R: "重命名",
  C: "复制",
  "??": "未跟踪",
  "!!": "已忽略",
};

export function GitView({ client, cwd, onBack }: Props) {
  const { tr } = useI18n();
  const [branch, setBranch] = useState<string | null>(null);
  const [changes, setChanges] = useState<Change[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [diff, setDiff] = useState<string | null>(null);
  const [degraded, setDegraded] = useState(false);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    setBusy(true);
    try {
      const { output } = await client.exec(
        `git -C "${cwd}" rev-parse --abbrev-ref HEAD 2>/dev/null && git -C "${cwd}" status --porcelain 2>/dev/null`,
        cwd,
      );
      if (output.includes("(web)")) {
        setDegraded(true);
        return;
      }
      const lines = output.split("\n").filter(Boolean);
      setBranch(lines[0] && !/^[ ?MADRC!]{2} /.test(lines[0]) ? lines[0].trim() : null);
      const rows: Change[] = [];
      for (const line of lines) {
        const m = /^([ ?MADRC!]{2}) (.+)$/.exec(line);
        if (m) rows.push({ code: m[1].trim() || "M", path: m[2].trim() });
      }
      setChanges(rows);
      setDegraded(false);
    } catch {
      setDegraded(true);
    } finally {
      setBusy(false);
    }
  }, [client, cwd]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const openDiff = async (change: Change) => {
    setSelected(change.path);
    setDiff(null);
    if (change.code === "??") {
      setDiff(tr("gitUntracked"));
      return;
    }
    try {
      const { output } = await client.exec(
        `git -C "${cwd}" diff -- "${change.path}" 2>/dev/null; git -C "${cwd}" diff --cached -- "${change.path}" 2>/dev/null`,
        cwd,
      );
      setDiff(output || tr("gitNoDiff"));
    } catch {
      setDiff(tr("gitNoDiff"));
    }
  };

  return (
    <section className="git-view">
      <div className="task-head">
        <span className="back" onClick={onBack}>
          ←
        </span>
        <span className="task-title">{tr("git")}</span>
        {branch && <span className="git-branch">⎇ {branch}</span>}
        <span className="task-actions">
          <button className="settings-button" onClick={() => void refresh()} disabled={busy}>
            ↻ {tr("refresh")}
          </button>
        </span>
      </div>

      {degraded ? (
        <div className="empty">
          <p>{tr("gitNeedDesktop")}</p>
        </div>
      ) : (
        <div className="git-body">
          <div className="git-files">
            {changes.length === 0 && !busy && <div className="empty">{tr("gitClean")}</div>}
            {changes.map((c) => (
              <div
                key={c.path}
                className={`git-file ${selected === c.path ? "active" : ""}`}
                onClick={() => void openDiff(c)}
              >
                <span className={`git-code gc-${c.code === "??" ? "u" : c.code.toLowerCase()}`}>
                  {STATUS_LABEL[c.code] ?? c.code}
                </span>
                <span className="git-path">{c.path}</span>
              </div>
            ))}
          </div>
          <div className="git-diff">
            {selected ? (
              <>
                <div className="git-diff-head">{selected}</div>
                <pre className="diff-pre">
                  {(diff ?? tr("loading")).split("\n").map((line, i) => (
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
                  ))}
                </pre>
              </>
            ) : (
              <div className="empty">{tr("gitPickFile")}</div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
