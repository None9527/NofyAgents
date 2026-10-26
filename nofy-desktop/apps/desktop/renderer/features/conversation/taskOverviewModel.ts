/**
 * 任务概览的分组。只读已投影的会话，不发明分区。
 * 计划取最后一条能解析的计划；空条目表示计划已清空。
 * 对账清单没有终态字段，未出现在会话块里的进度行仍可取消。
 */
import type { AppState, BackgroundTask, BackgroundTaskStatus, Block, ScheduledTask, SubagentCancelOutcome, SubagentFinishedInfo, SubagentProgress } from "../../core/store/state.ts";
import { watchingBackgroundTasks } from "../../core/taskMonitor.ts";
import { planEntries } from "./planModel.ts";
import type { GitStatus } from "../../ui/readers.ts";

export type AgentSource = {
  blockId: string;
  toolCallId: string;
  subagentId: string | null;
  description: string | null;
  subagentType: string | null;
  running: boolean;
  failed: boolean;
};

export type OverviewAgent = {
  key: string;
  focusId: string;
  cancelId: string | null;
  label: string;
  running: boolean;
  failed: boolean;
  turns: number | null;
  tools: number | null;
};

export type PlanOverview = {
  blockId: string;
  entries: Array<{ content: string; status: "pending" | "in_progress" | "completed" | "unknown" }>;
};

export type TaskBoard = {
  backgroundTasks: Record<string, BackgroundTask>;
  scheduledTasks: Record<string, ScheduledTask>;
  subagentProgress: Record<string, SubagentProgress>;
  subagentCancel: Record<string, SubagentCancelOutcome>;
  subagentFinished: Record<string, SubagentFinishedInfo>;
  plans: PlanOverview | null;
};

export type GitOverview =
  | { kind: "hidden" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; title: string; fileCount: number; additions: number; deletions: number; branch: string | null };

const NO_TASKS: readonly BackgroundTask[] = [];
const EMPTY_BOARD: TaskBoard = { backgroundTasks: {}, scheduledTasks: {}, subagentProgress: {}, subagentCancel: {}, subagentFinished: {}, plans: null };

type PlanCarrier = { kind: string; id: string; tag?: string; payload?: unknown };

export function repoBasename(root: string): string {
  const trimmed = root.replace(/[\\/]+$/, "");
  const slash = trimmed.lastIndexOf("/");
  const back = trimmed.lastIndexOf("\\");
  const cut = slash > back ? slash : back;
  return cut >= 0 ? trimmed.slice(cut + 1) : trimmed;
}

export function planOverview(blocks: readonly PlanCarrier[]): PlanOverview | null {
  for (let index = blocks.length - 1; index >= 0; index -= 1) {
    const block = blocks[index];
    if (!block || block.kind !== "event" || block.tag !== "plan") continue;
    const entries = planEntries(block.payload);
    if (entries === null) continue;
    return entries.length === 0 ? null : { blockId: block.id, entries };
  }
  return null;
}

function samePlan(left: PlanOverview | null, right: PlanOverview | null): boolean {
  if (left === right) return true;
  if (!left || !right || left.blockId !== right.blockId || left.entries.length !== right.entries.length) return false;
  return left.entries.every((entry, index) => {
    const other = right.entries[index];
    return other !== undefined && entry.content === other.content && entry.status === other.status;
  });
}

export function createTaskBoardSelector(sessionId: string) {
  let blocks: Block[] | undefined;
  let plans: PlanOverview | null = null;
  let previous: TaskBoard = EMPTY_BOARD;
  return (state: AppState): TaskBoard => {
    const session = state.sessions[sessionId];
    if (!session) return previous === EMPTY_BOARD ? previous : (previous = EMPTY_BOARD);
    if (session.blocks !== blocks) {
      blocks = session.blocks;
      const nextPlans = planOverview(session.blocks);
      if (!samePlan(plans, nextPlans)) plans = nextPlans;
    }
    if (
      previous.backgroundTasks === session.backgroundTasks
      && previous.scheduledTasks === session.scheduledTasks
      && previous.subagentProgress === session.subagentProgress
      && previous.subagentCancel === session.subagentCancel
      && previous.subagentFinished === session.subagentFinished
      && previous.plans === plans
    ) return previous;
    previous = {
      backgroundTasks: session.backgroundTasks,
      scheduledTasks: session.scheduledTasks,
      subagentProgress: session.subagentProgress,
      subagentCancel: session.subagentCancel,
      subagentFinished: session.subagentFinished,
      plans,
    };
    return previous;
  };
}

export function createWatchingSelector(sessionId: string | null) {
  let source: Record<string, BackgroundTask> | undefined;
  let previous: readonly BackgroundTask[] = NO_TASKS;
  return (state: AppState): readonly BackgroundTask[] => {
    if (!sessionId) return NO_TASKS;
    const tasks = state.sessions[sessionId]?.backgroundTasks;
    if (tasks === source) return previous;
    source = tasks;
    const next = tasks ? watchingBackgroundTasks(tasks) : NO_TASKS;
    if (next.length === previous.length && next.every((task, index) => task === previous[index])) return previous;
    previous = next.length === 0 ? NO_TASKS : next;
    return previous;
  };
}

function runningFirst<T>(rows: T[], running: (row: T) => boolean): T[] {
  return [...rows.filter(running), ...rows.filter(row => !running(row))];
}

function numeric(value: number | null | undefined): number | null {
  return typeof value === "number" ? value : null;
}

function settledAgent(id: string | null, running: boolean, failed: boolean, finished: Record<string, SubagentFinishedInfo>): { running: boolean; failed: boolean } {
  const done = id !== null ? finished[id] : undefined;
  if (done === undefined) return { running, failed };
  return { running: false, failed: failed || done.status === "failed" };
}

/** 清单行没有自己的终态。subagent_finished 没接上时，重放出来的子智能体会一直显示正在工作。 */
export function overviewAgents(agents: readonly AgentSource[], progress: Record<string, SubagentProgress>, finished: Record<string, SubagentFinishedInfo> = {}): OverviewAgent[] {
  const seen = new Set<string>();
  const rows: OverviewAgent[] = [];
  for (const agent of agents) {
    const focusId = agent.subagentId ?? agent.toolCallId;
    seen.add(focusId);
    if (agent.subagentId) seen.add(agent.subagentId);
    const match = agent.subagentId ? progress[agent.subagentId] : undefined;
    const state = settledAgent(agent.subagentId, agent.running, agent.failed, finished);
    rows.push({
      key: agent.blockId,
      focusId,
      cancelId: state.running && agent.subagentId ? agent.subagentId : null,
      label: agent.description ?? agent.subagentType ?? "",
      running: state.running,
      failed: state.failed,
      turns: numeric(match?.turnCount),
      tools: numeric(match?.toolCallCount),
    });
  }
  for (const row of Object.values(progress)) {
    if (seen.has(row.subagentId)) continue;
    const state = settledAgent(row.subagentId, true, false, finished);
    rows.push({
      key: "progress:" + row.subagentId,
      focusId: row.subagentId,
      cancelId: state.running ? row.subagentId : null,
      label: row.description ?? row.subagentType ?? "",
      running: state.running,
      failed: state.failed,
      turns: numeric(row.turnCount),
      tools: numeric(row.toolCallCount),
    });
  }
  return runningFirst(rows, row => row.running);
}

export function taskLabel(task: Pick<BackgroundTask, "description" | "displayCommand" | "command">): string {
  return task.description?.trim() || task.displayCommand?.trim() || task.command.trim();
}

export type TaskPhase = "killing" | "running" | "failed" | "completed";

/** 任务和监控点开只读这份投影。outputFile 不在里面，打开文件不是展开。 */
export type TaskRecord = {
  taskId: string;
  label: string;
  phase: TaskPhase;
  command: string;
  output: string;
  startedAtMs: number | null;
};

function taskPhase(task: Pick<BackgroundTask, "status" | "pendingKill" | "killOutcome">): TaskPhase {
  if (task.pendingKill && task.status === "running") return "killing";
  if (task.status === "failed") return "failed";
  if (task.status === "running" && task.killOutcome !== "already_exited") return "running";
  return "completed";
}

export function taskRecord(task: BackgroundTask): TaskRecord {
  return {
    taskId: task.taskId,
    label: taskLabel(task),
    phase: taskPhase(task),
    command: (task.displayCommand?.trim() || task.command).trim(),
    output: task.output,
    startedAtMs: task.startTimeMs,
  };
}

const TASK_PHRASE = {
  killing: "正在终止",
  running: "运行中",
  failed: "失败",
  completed: "已完成",
} as const;

/** 任务和监控的状态词。不把 kill 线路原文画出来。 */
export function taskStatusPhrase(task: BackgroundTask): (typeof TASK_PHRASE)[TaskPhase] {
  return TASK_PHRASE[taskRecord(task).phase];
}

/** 子智能体、任务、监控的打开目标。任务不返回路径。 */
export type WorkTarget = { surface: "agents"; focusId: string } | { surface: "task-record"; taskId: string };

export function agentOpenTarget(focusId: string): WorkTarget {
  return { surface: "agents", focusId };
}

export function taskOpenTarget(task: Pick<BackgroundTask, "taskId">): WorkTarget {
  return { surface: "task-record", taskId: task.taskId };
}

export function lineBadge(task: Pick<BackgroundTask, "outputLineCount" | "truncated">): string | null {
  if (task.outputLineCount === 0 && !task.truncated) return null;
  return task.truncated ? `(${task.outputLineCount}+)` : String(task.outputLineCount);
}

function byStatus(rows: BackgroundTask[], status: BackgroundTaskStatus): BackgroundTask[] {
  return runningFirst(rows, row => row.status === status);
}

export function oneShotTasks(tasks: Record<string, BackgroundTask>): BackgroundTask[] {
  return byStatus(Object.values(tasks).filter(task => !task.isMonitor), "running");
}

export function monitorTasks(tasks: Record<string, BackgroundTask>): BackgroundTask[] {
  return byStatus(Object.values(tasks).filter(task => task.isMonitor), "running");
}

export function scheduledLoops(tasks: Record<string, ScheduledTask>): ScheduledTask[] {
  return Object.values(tasks).filter(task => !task.deleted);
}

export function gitOverview(git: GitStatus | null, busy: boolean, error: string | null): GitOverview {
  if (error) return { kind: "error", message: error };
  if (git?.root) {
    const changes = [...git.staged, ...git.unstaged];
    const paths = new Set<string>();
    let additions = 0;
    let deletions = 0;
    for (const file of changes) {
      paths.add(file.path);
      additions += file.additions;
      deletions += file.deletions;
    }
    return { kind: "ready", title: repoBasename(git.root), fileCount: paths.size, additions, deletions, branch: git.branch };
  }
  if (busy) return { kind: "loading" };
  return { kind: "hidden" };
}
