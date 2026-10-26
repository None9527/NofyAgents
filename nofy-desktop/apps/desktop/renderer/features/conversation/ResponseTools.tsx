import { useEffect, useRef, useState } from "react";
import type { Runtime } from "../../core/runtime.ts";
import { serviceResponse } from "../../core/service-actions.ts";
import { Btn } from "../../ui/primitives.tsx";
import { Dialog } from "../../ui/dialog.tsx";
import { Disclosure } from "../../ui/disclosure.tsx";
import { IconBranch, IconHook } from "../../ui/icons.tsx";
import { tr } from "../../ui/i18n.ts";
import { forkAtTurnEffect } from "./turnActionsModel.ts";
import type { HookRun } from "./responseModel.ts";

/** Turn-scoped actions use the same controls as the rest of the application. */
export function ResponseTools({ runtime, sessionId, promptIndex, hasAnswer, idle, hooks, onVisibilityChange }: {
  runtime?: Runtime; sessionId: string; promptIndex: number | null; hasAnswer: boolean; idle: boolean; hooks: HookRun[];
  onVisibilityChange: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(false), [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locked = useRef(false);
  const created = useRef<{ sessionId: string; cwd: string } | null>(null);
  useEffect(() => { onVisibilityChange(open || busy || error !== null); return () => onVisibilityChange(false); }, [open, busy, error, onVisibilityChange]);
  const fork = async () => {
    if (!runtime || !hasAnswer || promptIndex === null || locked.current) return;
    locked.current = true; setBusy(true); setError(null);
    try {
      const state = runtime.store.getState(), session = state.sessions[sessionId];
      if (state.connection.status !== "ready" || !session?.cwd || session.agentState !== "idle") throw new Error(tr("请先停止当前回合"));
      if (!created.current) {
        const result = await runtime.effect(forkAtTurnEffect(sessionId, session.cwd, promptIndex));
        if (!result.ok) throw new Error(result.error);
        const data = serviceResponse(result.value);
        if (typeof data.newSessionId !== "string" || typeof data.newCwd !== "string") throw new Error(tr("Fork 未返回新会话身份"));
        created.current = { sessionId: data.newSessionId, cwd: data.newCwd };
      }
      await runtime.effect({ kind: "roster/pull" });
      // An async fork must not steal focus after the user switches tasks.
      const loaded = await runtime.effect({ kind: "session/load", sessionId: created.current.sessionId, cwd: created.current.cwd, activate: runtime.store.getState().activeSessionId === sessionId });
      if (!loaded.ok) throw new Error(loaded.error);
      created.current = null;
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { locked.current = false; setBusy(false); }
  };
  const issues = hooks.filter(run => run.status === "failed" || run.status === "blocked").length;
  const labels = { success: tr("成功"), failed: tr("失败"), blocked: tr("已阻断"), skipped: tr("已跳过"), unknown: tr("未知") };
  return <>
    {runtime && hasAnswer && promptIndex !== null && <Btn variant="ghost" size="icon" aria-label={tr("从此回答分叉")} title={tr("从此回答分叉")} disabled={!idle || busy} onClick={() => void fork()}><IconBranch size={15}/></Btn>}
    {!!hooks.length && <Btn variant="ghost" size="icon" aria-label={tr("Hook 统计")} title={`${tr("Hook 统计")} · ${hooks.length}`} className={issues ? "response-tools__issue" : undefined} onClick={() => setOpen(true)}><IconHook size={15}/></Btn>}
    <Dialog open={open} title={tr("Hook 统计")} onClose={() => setOpen(false)}>
      <p>{tr("本轮执行")} {hooks.length} · {tr("成功")} {hooks.filter(run => run.status === "success").length} · {tr("失败")} {hooks.filter(run => run.status === "failed").length} · {tr("已阻断")} {hooks.filter(run => run.status === "blocked").length} · {tr("已跳过")} {hooks.filter(run => run.status === "skipped").length}</p>
      <div className="hook-runs">{hooks.map(run => <Disclosure key={run.id} summary={<><span className="hook-run__name">{run.name}</span><span>{labels[run.status]}</span>{run.elapsedMs !== null && <span>{run.elapsedMs} ms</span>}</>}>
        <p>{run.event}</p>{run.error && <p role="alert">{run.error}</p>}{run.output && <pre className="hook-run__output">{run.output}</pre>}
      </Disclosure>)}</div>
    </Dialog>
    <Dialog open={error !== null} title={tr("分叉失败")} busy={busy} onClose={() => setError(null)}><p role="alert">{error}</p><Btn disabled={busy || !idle} onClick={() => void fork()}>{tr("重试")}</Btn></Dialog>
  </>;
}
