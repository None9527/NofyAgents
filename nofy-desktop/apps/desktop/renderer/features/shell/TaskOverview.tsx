import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { DesktopClient } from "../../application/public.ts";
import { useProjection } from "../../application/projection/public.ts";
import { createTaskSourcesSelector } from "../../application/workspace/public.ts";
import type { TaskResult } from "../../core/effects.ts";
import type { Runtime } from "../../core/runtime.ts";
import type { BackgroundTask, ScheduledTask } from "../../core/store/state.ts";
import { killRetryable } from "../../core/taskMonitor.ts";
import { checkoutParams, commitParams, interpretGitWrite, switchableBranches } from "../aux/public.ts";
import type { AgentRow } from "../conversation/public.ts";
import { agentWorkPhrase, createTaskBoardSelector, createWatchingSelector, gitOverview, lineBadge, monitorTasks, oneShotTasks, overviewAgents, scheduledLoops, taskRecord, taskStatusPhrase } from "../conversation/public.ts";
import type { GitBranch, GitStatus } from "../../ui/readers.ts";
import { readGitBranches } from "../../ui/readers.ts";
import { Btn } from "../../ui/primitives.tsx";
import { Dialog } from "../../ui/dialog.tsx";
import { Field, SelectControl, TextArea, TextInput } from "../../ui/forms.tsx";
import { MenuButton } from "../../ui/menu.tsx";
import { IconBot, IconChevronDown, IconClock, IconEllipsis, IconFile, IconFileDiff, IconPlus, IconTerminal, IconX } from "../../ui/icons.tsx";
import type { IconProps } from "../../ui/icons.tsx";
import { tr } from "../../ui/i18n.ts";
import { overviewSectionOpen } from "../../ui/taskOverviewLayout.ts";
import { useLocale } from "../../ui/useLocale.ts";


const SOURCE_PREVIEW = 3;

function IconImage(p: IconProps) {
  return <svg width={p.size ?? 16} height={p.size ?? 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2" /><circle cx="9" cy="10" r="1.4" /><path d="m8 16 3.2-3.2a1 1 0 0 1 1.4 0L16 16" /></svg>;
}
function IconBraces(p: IconProps) {
  return <svg width={p.size ?? 16} height={p.size ?? 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6c-2 0-3 1.2-3 3v1.5c0 .8-.6 1.5-1.5 1.5C6.4 12 7 12.7 7 13.5V15c0 1.8 1 3 3 3M15 6c2 0 3 1.2 3 3v1.5c0 .8.6 1.5 1.5 1.5-.9 0-1.5.7-1.5 1.5V15c0 1.8-1 3-3 3" /></svg>;
}
function IconViewAll(p: IconProps) {
  return <svg width={p.size ?? 16} height={p.size ?? 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="7" cy="8" r="2.2" /><circle cx="16.5" cy="7" r="2.2" /><circle cx="12" cy="16.5" r="2.2" /><path d="M9 9.2 10.6 14.4M14.6 8.8 13.2 14.4" /></svg>;
}
function sourceIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)) return <IconImage size={16} />;
  if (ext === "json") return <IconBraces size={16} />;
  return <IconFile size={16} />;
}

function Section({ title, summary, open, onToggle, actions, children }: { title: string; summary?: string; open: boolean; onToggle: () => void; actions?: ReactNode; children: ReactNode }) {
  return <section className="task-overview__section">
    <div className="task-overview__section-head">
      <button type="button" className="task-overview__toggle" aria-expanded={open} onClick={onToggle}><span>{title}</span><IconChevronDown size={12} className={open ? "task-overview__chevron" : "task-overview__chevron is-collapsed"} /></button>
      {summary ? <small className="task-overview__summary">{summary}</small> : null}
      {actions ? <div className="task-overview__section-actions">{actions}</div> : null}
    </div>
    {open ? <div className="task-overview__body">{children}</div> : null}
  </section>;
}

function countSummary(running: number, failed: number, done: number, activeLabel: "{0} 正在工作" | "{0} 执行中"): string {
  const parts: string[] = [];
  if (running > 0) parts.push(tr(activeLabel, [String(running)]));
  if (failed > 0) parts.push(tr("{0} 失败", [String(failed)]));
  if (done > 0) parts.push(tr("{0} 已完成", [String(done)]));
  return parts.join(" · ");
}

function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function useKillClock(active: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [active]);
  return now;
}



function planStatus(status: "pending" | "in_progress" | "completed" | "unknown"): string {
  return tr(status === "completed" ? "已完成" : status === "in_progress" ? "执行中" : status === "pending" ? "待执行" : "状态未知");
}

export function WatchingChip({ client, sessionId, onOpen }: { client: DesktopClient; sessionId: string | null; onOpen: () => void }) {
  useLocale();
  const select = useMemo(() => createWatchingSelector(sessionId), [sessionId]);
  const tasks = useProjection(client.projection, select);
  if (tasks.length === 0) return null;
  const label = tr("{0} 个后台任务", [String(tasks.length)]);
  return <button type="button" className="diffchip" onClick={onOpen} aria-label={label}><IconTerminal size={14} /><span className="diffchip__label">{label}</span></button>;
}

export function TaskOverview({ client, runtime, sessionId, cwd, agents, git, busy, error, ready, refresh, view, onReview, onAgent, onSource, onAdd, onShowAll, onPlan, onError }: {
  client: DesktopClient; runtime: Runtime; sessionId: string; cwd: string | null; agents: AgentRow[]; git: GitStatus | null; busy: boolean; error: string | null; ready: boolean;
  refresh: () => void; view: { pinned: boolean; sections: Record<string, boolean>; allSources: boolean; update: (patch: { pinned?: boolean; sections?: Record<string, boolean>; allSources?: boolean }) => void };
  onReview: () => void; onAgent: (id: string) => void; onSource: (path: string) => void; onAdd: () => void; onShowAll: () => void; onPlan: (blockId: string) => void; onError: (message: string) => void;
}) {
  useLocale();
  const sourceSelect = useMemo(() => createTaskSourcesSelector(sessionId), [sessionId]);
  const boardSelect = useMemo(() => createTaskBoardSelector(sessionId), [sessionId]);
  const sources = useProjection(client.projection, sourceSelect);
  const board = useProjection(client.projection, boardSelect);
  const plans = board.plans;
  const shots = oneShotTasks(board.backgroundTasks);
  const monitors = monitorTasks(board.backgroundTasks);
  const loops = scheduledLoops(board.scheduledTasks);
  const agentRows = overviewAgents(agents, board.subagentProgress, board.subagentFinished);
  const changes = gitOverview(git, busy, error);
  const now = useKillClock(Object.values(board.backgroundTasks).some(task => task.pendingKill));
  const open = (id: string, count: number) => overviewSectionOpen(view.sections[id], count);
  const toggle = (id: string, count: number) => view.update({ sections: { ...view.sections, [id]: !open(id, count) } });
  const preview = view.allSources ? sources : sources.slice(0, SOURCE_PREVIEW);
  const showAll = () => {
    if (sources.length > SOURCE_PREVIEW && !view.allSources) view.update({ allSources: true });
    else if (view.allSources && sources.length > SOURCE_PREVIEW) view.update({ allSources: false });
    else onShowAll();
  };
  const settle = (result: TaskResult) => { if (!result.ok) onError(result.error); };
  const fail = (reason: unknown) => onError(message(reason));
  const kill = (task: BackgroundTask) => {
    if (!killRetryable(task, Date.now())) return;
    void client.tasks.kill(sessionId, task.taskId).then(settle, fail);
  };
  const cancelAgent = (id: string) => { void client.tasks.cancelSubagent(sessionId, id).then(settle, fail); };
  const deleteLoop = (taskId: string) => { void client.tasks.deleteSchedule(sessionId, taskId).then(settle, fail); };
  const agentSummary = countSummary(agentRows.filter(agent => agent.running).length, agentRows.filter(agent => agent.failed).length, agentRows.filter(agent => !agent.running && !agent.failed).length, "{0} 正在工作");
  const planSummary = plans ? countSummary(plans.entries.filter(entry => entry.status === "in_progress").length, 0, plans.entries.filter(entry => entry.status === "completed").length, "{0} 执行中") : "";
  const taskSummary = countSummary(shots.filter(task => taskRecord(task).phase === "running" || taskRecord(task).phase === "killing").length, shots.filter(task => taskRecord(task).phase === "failed").length, shots.filter(task => taskRecord(task).phase === "completed").length, "{0} 正在工作");
  const watchSummary = countSummary(monitors.filter(task => taskRecord(task).phase === "running" || taskRecord(task).phase === "killing").length, monitors.filter(task => taskRecord(task).phase === "failed").length, monitors.filter(task => taskRecord(task).phase === "completed").length, "{0} 正在工作");
  return <div className="task-overview">
    {plans && <Section title={tr("计划")} summary={planSummary} open={open("plan", plans.entries.length)} onToggle={() => toggle("plan", plans.entries.length)}>
      {plans.entries.map((entry, index) => <button key={plans.blockId + ":" + String(index)} type="button" className="task-overview__row" onClick={() => onPlan(plans.blockId)}><span title={entry.content}>{entry.content}</span><small>{planStatus(entry.status)}</small></button>)}
    </Section>}
    {agentRows.length > 0 && <Section title={tr("子智能体")} summary={agentSummary} open={open("agents", agentRows.length)} onToggle={() => toggle("agents", agentRows.length)}>
      {agentRows.map(agent => {
        const label = agent.label || tr("子智能体");
        const cancelId = agent.cancelId;
        const progress = [agent.turns !== null ? tr("{0} 轮", [String(agent.turns)]) : "", agent.tools !== null ? tr("{0} 次工具", [String(agent.tools)]) : "", tr(agentWorkPhrase(agent))].filter(Boolean).join(" ");
        return <div key={agent.key} className="task-overview__entry">
          <button type="button" className="task-overview__row" onClick={() => onAgent(agent.focusId)}><IconBot size={16} /><span title={agent.label || undefined}>{label}</span><small>{progress}</small></button>
          {cancelId && <button type="button" className="task-overview__icon" aria-label={tr("取消子智能体")} onClick={() => cancelAgent(cancelId)}><IconX size={14} /></button>}
        </div>;
      })}
    </Section>}
    {shots.length > 0 && <Section title={tr("任务")} summary={taskSummary} open={open("tasks", shots.length)} onToggle={() => toggle("tasks", shots.length)}>
      {shots.map(task => <TaskRow key={task.taskId} task={task} now={now} onKill={kill} />)}
    </Section>}
    {(monitors.length > 0 || loops.length > 0) && <Section title={tr("监视")} summary={watchSummary} open={open("watch", monitors.length + loops.length)} onToggle={() => toggle("watch", monitors.length + loops.length)}>
      {monitors.map(task => <TaskRow key={task.taskId} task={task} now={now} onKill={kill} />)}
      {loops.map(loop => <ScheduleRow key={loop.taskId} loop={loop} onAgent={onAgent} onDelete={deleteLoop} />)}
    </Section>}
    {changes.kind !== "hidden" && <Section title={changes.kind === "ready" && changes.title ? changes.title : tr("变更")} summary={changes.kind === "ready" && changes.fileCount ? tr("{0} 个文件", [String(changes.fileCount)]) : undefined} open={open("changes", 1)} onToggle={() => toggle("changes", 1)}>
      {changes.kind === "error" ? <div className="task-overview__error" role="alert"><p>{changes.message}</p><Btn disabled={busy || !ready} onClick={refresh}>{tr("重试")}</Btn></div> : changes.kind === "loading" ? <p className="task-overview__empty">{tr("正在读取变更…")}</p> : <div className="task-overview__entry">
        <button type="button" className="task-overview__row" onClick={onReview} disabled={!ready} title={changes.branch ?? undefined}><IconFileDiff size={16} /><span>{changes.fileCount ? tr("{0} 个文件", [String(changes.fileCount)]) : tr("没有未提交变更")}</span><span className="task-overview__chip">{tr("分支")}</span><span className="task-overview__counts"><b className="task-overview__added">+{changes.additions}</b> <b className="task-overview__removed">−{changes.deletions}</b></span></button>
        <GitRowMenu runtime={runtime} sessionId={sessionId} ready={ready} onRefresh={refresh} />
      </div>}
    </Section>}
    <Section title={tr("来源")} summary={sources.length ? tr("{0} 个文件", [String(sources.length)]) : undefined} open={open("sources", sources.length)} onToggle={() => toggle("sources", sources.length)} actions={<button type="button" className="task-overview__icon" aria-label={tr("添加来源")} onClick={onAdd}><IconPlus size={15} /></button>}>
      <div className={view.allSources && sources.length > SOURCE_PREVIEW ? "task-overview__sources" : undefined}>
        {preview.map(source => <button key={source.path} type="button" className="task-overview__row" disabled={!ready || !cwd} title={source.path} onClick={() => onSource(source.path)}>{sourceIcon(source.name)}<span>{source.name}</span></button>)}
      </div>
      {!sources.length && <p className="task-overview__empty">{tr("已加载内容中暂无文件引用")}</p>}
      {sources.length > 0 && <button type="button" className="task-overview__row" onClick={showAll}><IconViewAll size={16} /><span>{tr(view.allSources && sources.length > SOURCE_PREVIEW ? "收起" : "查看全部")}</span></button>}
    </Section>
  </div>;
}

function GitRowMenu({ runtime, sessionId, ready, onRefresh }: { runtime: Runtime; sessionId: string; ready: boolean; onRefresh: () => void }) {
  useLocale();
  const ticket = useRef(0);
  const [dialog, setDialog] = useState<null | "commit" | "create" | "switch">(null);
  const [message, setMessage] = useState("");
  const [push, setPush] = useState(false);
  const [name, setName] = useState("");
  const [branches, setBranches] = useState<GitBranch[]>([]);
  const [listed, setListed] = useState(false);
  const [picked, setPicked] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const close = () => { if (busy) return; setDialog(null); setNotice(null); };
  const open = (id: string) => {
    setNotice(null);
    if (id === "commit") { setMessage(""); setPush(false); setDialog("commit"); return; }
    if (id === "create") { setName(""); setDialog("create"); return; }
    if (id !== "switch") return;
    const mine = ++ticket.current;
    setBranches([]);
    setPicked("");
    setListed(false);
    setDialog("switch");
    void runtime.effect({ kind: "git/branches", sessionId }).then((result) => {
      if (ticket.current !== mine) return;
      setListed(true);
      if (!result.ok) { setNotice(result.error); return; }
      const options = switchableBranches(readGitBranches(result.value).branches);
      setBranches(options);
      setPicked(options[0]?.name ?? "");
    });
  };
  const finish = (result: TaskResult): boolean => {
    setBusy(false);
    if (!result.ok) { setNotice(result.error); return false; }
    const parsed = interpretGitWrite(result.value);
    if (!parsed.ok) { setNotice(parsed.error); return false; }
    onRefresh();
    const text = [parsed.notice, parsed.output, parsed.commitHash].filter((item) => item !== null && item !== "").join("\n");
    if (text !== "") { setNotice(text); return false; }
    setDialog(null);
    setNotice(null);
    return true;
  };
  const submitCommit = () => {
    const params = commitParams(message, push);
    if (params === null || busy) return;
    setBusy(true);
    setNotice(null);
    void runtime.effect({ kind: "git/commit", sessionId, message: params.message, push: params.push }).then(finish);
  };
  const submitCreate = () => {
    const params = checkoutParams(name, true);
    if (params === null || busy) return;
    setBusy(true);
    setNotice(null);
    void runtime.effect({ kind: "git/checkout", sessionId, branch: params.branch, create: true }).then(finish);
  };
  const submitSwitch = () => {
    const params = checkoutParams(picked, false);
    if (params === null || busy) return;
    setBusy(true);
    setNotice(null);
    void runtime.effect({ kind: "git/checkout", sessionId, branch: params.branch, create: false }).then(finish);
  };
  return <>
    <span className="task-overview__gitmenu">
      <MenuButton
        variant="icon-sm"
        chevron={false}
        disabled={!ready || busy}
        title={tr("版本库操作")}
        trigger={<><IconEllipsis size={14} /><span className="sr-only">{tr("版本库操作")}</span></>}
        items={[
          { id: "commit", label: tr("提交变更") },
          { id: "create", label: tr("创建分支") },
          { id: "switch", label: tr("切换分支") },
        ]}
        onPick={open}
      />
    </span>
    <Dialog open={dialog === "commit"} title={tr("提交变更")} busy={busy} onClose={close}>
      <form className="ui-form" onSubmit={(event) => { event.preventDefault(); submitCommit(); }}>
        <Field label={tr("提交说明")}><TextArea autoFocus value={message} disabled={busy} onChange={(event) => setMessage(event.target.value)} /></Field>
        <label className="task-overview__check"><input type="checkbox" checked={push} disabled={busy} onChange={(event) => setPush(event.target.checked)} /><span>{tr("提交并推送")}</span></label>
        {notice !== null ? <p className="task-overview__notice" role="alert">{notice}</p> : null}
        <Btn variant="primary" type="submit" disabled={busy || commitParams(message, push) === null}>{tr("提交变更")}</Btn>
      </form>
    </Dialog>
    <Dialog open={dialog === "create"} title={tr("创建分支")} busy={busy} onClose={close}>
      <form className="ui-form" onSubmit={(event) => { event.preventDefault(); submitCreate(); }}>
        <Field label={tr("分支名称")}><TextInput autoFocus value={name} disabled={busy} onChange={(event) => setName(event.target.value)} /></Field>
        {notice !== null ? <p className="task-overview__notice" role="alert">{notice}</p> : null}
        <Btn variant="primary" type="submit" disabled={busy || checkoutParams(name, true) === null}>{tr("创建分支")}</Btn>
      </form>
    </Dialog>
    <Dialog open={dialog === "switch"} title={tr("切换分支")} busy={busy} onClose={close}>
      <form className="ui-form" onSubmit={(event) => { event.preventDefault(); submitSwitch(); }}>
        {!listed ? null : branches.length === 0 ? <p>{notice === null ? tr("没有其它本地分支。") : notice}</p> : <Field label={tr("选择分支")}><SelectControl value={picked} disabled={busy} onChange={(event) => setPicked(event.target.value)}>{branches.map((branch) => <option key={branch.name} value={branch.name}>{branch.name}</option>)}</SelectControl></Field>}
        {branches.length > 0 && notice !== null ? <p className="task-overview__notice" role="alert">{notice}</p> : null}
        <Btn variant="primary" type="submit" disabled={busy || branches.length === 0 || checkoutParams(picked, false) === null}>{tr("切换分支")}</Btn>
      </form>
    </Dialog>
  </>;
}

function TaskRow({ task, now, onKill }: { task: BackgroundTask; now: number; onKill: (task: BackgroundTask) => void }) {
  const record = taskRecord(task);
  const label = record.label || tr("任务");
  const badge = lineBadge(task);
  const status = tr(taskStatusPhrase(task));
  const started = record.startedAtMs !== null && Number.isFinite(record.startedAtMs) ? new Date(record.startedAtMs).toLocaleString() : null;
  const showCommand = record.command !== "" && record.command !== label;
  const expandable = showCommand || record.output !== "" || started !== null;
  const head = <><IconTerminal size={16} /><span title={label}>{label}</span>{badge && <span className="task-overview__badge">{badge}</span>}<small>{status}</small></>;
  return <div className={"task-overview__entry" + (expandable ? " task-overview__entry--stack" : "")}>
    {expandable ? <details className="task-overview__work">
      <summary className="task-overview__row">{head}</summary>
      <div className="task-overview__record">
        {started !== null ? <p className="task-overview__meta">{started}</p> : null}
        {showCommand ? <pre className="task-overview__command">{record.command}</pre> : null}
        {record.output !== "" ? <pre className="task-overview__output">{record.output}</pre> : null}
      </div>
    </details> : <div className="task-overview__row task-overview__row--static">{head}</div>}
    {(record.phase === "running" || record.phase === "killing") && <button type="button" className="task-overview__icon" aria-label={tr("终止")} disabled={!killRetryable(task, now)} onClick={() => onKill(task)}><IconX size={14} /></button>}
  </div>;
}

function ScheduleRow({ loop, onAgent, onDelete }: { loop: ScheduledTask; onAgent: (id: string) => void; onDelete: (taskId: string) => void }) {
  const label = loop.prompt.trim() || loop.humanSchedule;
  const subagentId = loop.lastSubagentId;
  const body = <>
    <IconClock size={16} /><span title={label}>{label}</span>
    {loop.prompt.trim() && loop.humanSchedule ? <small>{loop.humanSchedule}</small> : null}
  </>;
  return <div className="task-overview__entry">
    {subagentId ? <button type="button" className="task-overview__row" onClick={() => onAgent(subagentId)}>{body}</button> : <div className="task-overview__row task-overview__row--static">{body}</div>}
    <button type="button" className="task-overview__icon" aria-label={tr("删除")} onClick={() => onDelete(loop.taskId)}><IconX size={14} /></button>
  </div>;
}
