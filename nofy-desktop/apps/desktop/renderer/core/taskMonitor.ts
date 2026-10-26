/**
 * 后台任务 / 监视 / 定时循环 / 子智能体进度的纯投影。
 *
 * 线路（不猜第二种形状）：
 * - 通知信封是 SessionNotification：sessionId + update.sessionUpdate，字段 snake_case。
 *   冷加载走 `_nofy/session/update` 且 `_meta.isReplay`；活通知走各自的 ext 方法。
 * - task/list 的 TaskSnapshot 字段也是 snake_case。SystemTime 是
 *   {secs_since_epoch, nanos_since_epoch}（serde 1.0 std impl）。
 * - list_running 的 SubagentLiveSnapshotDto 是 camelCase。
 * - kill 的 outcome 是 snake_case 枚举；cancel 的 outcome 以 kind 为标签。
 *
 * will_wake 只保存。它不表示仍在监视。
 */
import type {
  BackgroundTask,
  ScheduledTask,
  SubagentCancelOutcome,
  SubagentProgress,
} from "./store/state.ts";

/** 桌面 store 里的输出上限。超出即 truncated，完整内容仍在 outputFile。 */
export const OUTPUT_CAP = 256 * 1024;
/** 与 pager PENDING_KILL_TIMEOUT_SECS 相同。 */
export const PENDING_KILL_TIMEOUT_MS = 10_000;
const MONITOR_PREFIX = "[monitor] ";

export function watchingBackgroundTasks(tasks: Record<string, BackgroundTask>): BackgroundTask[] {
  return Object.values(tasks).filter((task) => task.status === "running" && !task.restoredFromReplay && task.killOutcome !== "already_exited");
}

export function killRetryable(task: BackgroundTask, now: number): boolean {
  if (!task.pendingKill || task.killRequestedAtMs === null) return true;
  return now - task.killRequestedAtMs >= PENDING_KILL_TIMEOUT_MS;
}

export function applyTaskBackgrounded(
  tasks: Record<string, BackgroundTask>,
  update: Record<string, unknown>,
  isReplay: boolean,
): Record<string, BackgroundTask> | null {
  const taskId = idOf(update["task_id"]);
  if (taskId === null) return null;
  const incoming = fromBackgrounded(update, taskId, isReplay);
  const existing = tasks[taskId];
  if (existing && existing.status !== "running") {
    return { ...tasks, [taskId]: absorbLate(existing, incoming) };
  }
  if (existing) {
    return { ...tasks, [taskId]: refreshRunning(existing, incoming, isReplay) };
  }
  return { ...tasks, [taskId]: incoming };
}

export function applyTaskCompleted(
  tasks: Record<string, BackgroundTask>,
  update: Record<string, unknown>,
  isReplay: boolean,
): Record<string, BackgroundTask> | null {
  const snapshot = asObj(update["task_snapshot"]);
  if (snapshot === null) return null;
  const taskId = idOf(snapshot["task_id"]);
  if (taskId === null) return null;
  const parsed = fromSnapshot(snapshot);
  if (parsed === null) return null;
  const existing = tasks[taskId];
  const terminal = terminalFrom(parsed, existing, isReplay, update["will_wake"] === true);
  return { ...tasks, [taskId]: terminal };
}

export function applyMonitorEvent(
  tasks: Record<string, BackgroundTask>,
  update: Record<string, unknown>,
): { ok: true; tasks: Record<string, BackgroundTask> } | { ok: false; reason: string } {
  const taskId = idOf(update["task_id"]);
  if (taskId === null) return { ok: false, reason: "missing-id" };
  const existing = tasks[taskId];
  if (!existing) return { ok: false, reason: "unknown-task" };
  const text = textOf(update["event_text"]) ?? "";
  return { ok: true, tasks: { ...tasks, [taskId]: appendOutput(existing, text) } };
}

export function applyScheduledCreated(
  tasks: Record<string, ScheduledTask>,
  update: Record<string, unknown>,
  isReplay: boolean,
): Record<string, ScheduledTask> | null {
  const taskId = idOf(update["task_id"]);
  if (taskId === null) return null;
  const existing = tasks[taskId];
  return {
    ...tasks,
    [taskId]: {
      taskId,
      prompt: textOf(update["prompt"]) ?? existing?.prompt ?? "",
      humanSchedule: textOf(update["human_schedule"]) ?? existing?.humanSchedule ?? "",
      nextFireAt: textOf(update["next_fire_at"]) ?? existing?.nextFireAt ?? null,
      lastSubagentId: existing?.lastSubagentId ?? null,
      deleted: false,
      restoredFromReplay: existing ? (isReplay ? existing.restoredFromReplay : false) : isReplay,
    },
  };
}

export function applyScheduledFired(
  tasks: Record<string, ScheduledTask>,
  update: Record<string, unknown>,
  isReplay: boolean,
): Record<string, ScheduledTask> | null {
  const taskId = idOf(update["task_id"]);
  if (taskId === null) return null;
  const existing = tasks[taskId];
  if (existing?.deleted) return tasks;
  const nextFireAt = textOf(update["next_fire_at"]);
  const subagentId = textOf(update["subagent_id"]);
  if (!existing) {
    if (nextFireAt === null) return tasks;
    return {
      ...tasks,
      [taskId]: {
        taskId,
        prompt: textOf(update["prompt"]) ?? "",
        humanSchedule: textOf(update["human_schedule"]) ?? "",
        nextFireAt,
        lastSubagentId: subagentId,
        deleted: false,
        restoredFromReplay: isReplay,
      },
    };
  }
  return {
    ...tasks,
    [taskId]: {
      ...existing,
      nextFireAt: nextFireAt ?? existing.nextFireAt,
      lastSubagentId: subagentId ?? existing.lastSubagentId,
      restoredFromReplay: isReplay ? existing.restoredFromReplay : false,
    },
  };
}

export function applyScheduledDeleted(
  tasks: Record<string, ScheduledTask>,
  update: Record<string, unknown>,
): Record<string, ScheduledTask> | null {
  const taskId = idOf(update["task_id"]);
  if (taskId === null) return null;
  const existing = tasks[taskId];
  if (!existing) return tasks;
  return { ...tasks, [taskId]: { ...existing, deleted: true } };
}

export function applySubagentSpawned(
  rows: Record<string, SubagentProgress>,
  update: Record<string, unknown>,
  isReplay: boolean,
): Record<string, SubagentProgress> | null {
  const subagentId = idOf(update["subagent_id"]) ?? idOf(update["child_session_id"]);
  if (subagentId === null) return null;
  const existing = rows[subagentId];
  return {
    ...rows,
    [subagentId]: {
      ...(existing ?? emptyProgress(subagentId, isReplay)),
      parentSessionId: textOf(update["parent_session_id"]) ?? existing?.parentSessionId ?? null,
      childSessionId: textOf(update["child_session_id"]) ?? existing?.childSessionId ?? null,
      subagentType: textOf(update["subagent_type"]) ?? existing?.subagentType ?? null,
      description: textOf(update["description"]) ?? existing?.description ?? null,
      restoredFromReplay: existing ? (isReplay ? existing.restoredFromReplay : false) : isReplay,
    },
  };
}

export function applySubagentProgress(
  rows: Record<string, SubagentProgress>,
  update: Record<string, unknown>,
  isReplay: boolean,
): Record<string, SubagentProgress> | null {
  const subagentId = idOf(update["subagent_id"]) ?? idOf(update["child_session_id"]);
  if (subagentId === null) return null;
  const existing = rows[subagentId] ?? emptyProgress(subagentId, isReplay);
  return {
    ...rows,
    [subagentId]: {
      ...existing,
      parentSessionId: textOf(update["parent_session_id"]) ?? existing.parentSessionId,
      childSessionId: textOf(update["child_session_id"]) ?? existing.childSessionId,
      durationMs: numOrNull(update["duration_ms"]) ?? existing.durationMs,
      turnCount: numOrNull(update["turn_count"]) ?? existing.turnCount,
      toolCallCount: numOrNull(update["tool_call_count"]) ?? existing.toolCallCount,
      tokensUsed: numOrNull(update["tokens_used"]) ?? existing.tokensUsed,
      contextWindowTokens: numOrNull(update["context_window_tokens"]) ?? existing.contextWindowTokens,
      contextUsagePct: numOrNull(update["context_usage_pct"]) ?? existing.contextUsagePct,
      toolsUsed: stringList(update["tools_used"]) ?? existing.toolsUsed,
      errorCount: numOrNull(update["error_count"]) ?? existing.errorCount,
      restoredFromReplay: isReplay ? existing.restoredFromReplay : false,
    },
  };
}

/** task/list。清单里新出现的行是重连对账，不是新的现场活动。 */
export function applyListedTasks(
  tasks: Record<string, BackgroundTask>,
  snapshots: unknown[],
): { tasks: Record<string, BackgroundTask>; skipped: number } {
  let next = tasks;
  let skipped = 0;
  for (const item of snapshots) {
    const snapshot = asObj(item);
    const parsed = snapshot === null ? null : fromSnapshot(snapshot);
    const taskId = parsed?.taskId ?? null;
    if (parsed === null || taskId === null || typeof snapshot?.["completed"] !== "boolean") {
      skipped += 1;
      continue;
    }
    const existing = next[taskId];
    if (!existing) {
      next = { ...next, [taskId]: listedRow(parsed, snapshot["completed"] === true, true) };
      continue;
    }
    if (existing.status !== "running" && snapshot["completed"] !== true) {
      next = { ...next, [taskId]: absorbLate(existing, listedRow(parsed, false, existing.restoredFromReplay)) };
      continue;
    }
    if (snapshot["completed"] === true) {
      next = {
        ...next,
        [taskId]: terminalFrom(parsed, existing, existing.restoredFromReplay, existing.willWake),
      };
      continue;
    }
    const listed = listedRow(parsed, false, existing.restoredFromReplay);
    const refreshed = refreshRunning(existing, listed, existing.restoredFromReplay);
    next = {
      ...next,
      [taskId]: parsed.output.length > 0
        ? { ...refreshed, output: listed.output, outputLineCount: listed.outputLineCount, truncated: existing.truncated || listed.truncated, outputTotalBytes: listed.outputTotalBytes }
        : refreshed,
    };
  }
  return { tasks: next, skipped };
}

/** list_running。不在清单里的行保持原样：缺席不是「已结束」。 */
export function applyListedSubagents(
  rows: Record<string, SubagentProgress>,
  items: unknown[],
): { rows: Record<string, SubagentProgress>; skipped: number } {
  let next = rows;
  let skipped = 0;
  for (const item of items) {
    const o = asObj(item);
    const subagentId = o === null ? null : idOf(o["subagentId"]);
    if (o === null || subagentId === null) {
      skipped += 1;
      continue;
    }
    const existing = next[subagentId];
    const base = existing ?? emptyProgress(subagentId, true);
    next = {
      ...next,
      [subagentId]: {
        ...base,
        parentSessionId: textOf(o["parentSessionId"]) ?? base.parentSessionId,
        childSessionId: textOf(o["childSessionId"]) ?? base.childSessionId,
        subagentType: textOf(o["subagentType"]) ?? base.subagentType,
        description: textOf(o["description"]) ?? base.description,
        startedAtEpochMs: numOrNull(o["startedAtEpochMs"]) ?? base.startedAtEpochMs,
        durationMs: numOrNull(o["durationMs"]) ?? base.durationMs,
        turnCount: numOrNull(o["turnCount"]) ?? base.turnCount,
        toolCallCount: numOrNull(o["toolCallCount"]) ?? base.toolCallCount,
        tokensUsed: numOrNull(o["tokensUsed"]) ?? base.tokensUsed,
        contextWindowTokens: numOrNull(o["contextWindowTokens"]) ?? base.contextWindowTokens,
        contextUsagePct: numOrNull(o["contextUsagePct"]) ?? base.contextUsagePct,
        toolsUsed: stringList(o["toolsUsed"]) ?? base.toolsUsed,
        errorCount: numOrNull(o["errorCount"]) ?? base.errorCount,
        restoredFromReplay: existing ? existing.restoredFromReplay : true,
      },
    };
  }
  return { rows: next, skipped };
}

export function noteKillRequested(
  tasks: Record<string, BackgroundTask>,
  taskId: string,
  at: number,
): Record<string, BackgroundTask> {
  const existing = tasks[taskId];
  if (!existing) return tasks;
  return { ...tasks, [taskId]: { ...existing, pendingKill: true, killRequestedAtMs: at } };
}

export function noteKillResolved(
  tasks: Record<string, BackgroundTask>,
  taskId: string,
  outcome: string | null,
): Record<string, BackgroundTask> {
  const existing = tasks[taskId];
  if (!existing) return tasks;
  if (outcome === "not_found") {
    const next = { ...tasks };
    delete next[taskId];
    return next;
  }
  if (outcome === "killed") {
    return { ...tasks, [taskId]: { ...existing, pendingKill: true, killOutcome: outcome } };
  }
  return {
    ...tasks,
    [taskId]: { ...existing, pendingKill: false, killRequestedAtMs: null, killOutcome: outcome ?? existing.killOutcome },
  };
}

export function noteSubagentCancel(
  current: Record<string, SubagentCancelOutcome>,
  subagentId: string,
  outcome: SubagentCancelOutcome | null,
): Record<string, SubagentCancelOutcome> {
  if (outcome === null) return current;
  return { ...current, [subagentId]: outcome };
}

export function noteScheduleDeleted(
  tasks: Record<string, ScheduledTask>,
  taskId: string,
  deleted: boolean,
): Record<string, ScheduledTask> {
  if (!deleted) return tasks;
  const existing = tasks[taskId];
  if (!existing) return tasks;
  return { ...tasks, [taskId]: { ...existing, deleted: true } };
}

export function parseTaskList(res: unknown): { ok: true; tasks: unknown[] } | { ok: false; error: string } {
  const body = resultBody(res);
  if (!body.ok) return body;
  const tasks = body.body["tasks"];
  if (!Array.isArray(tasks)) return { ok: false, error: "task/list 响应缺少 tasks" };
  return { ok: true, tasks };
}

export function parseSubagentList(res: unknown): { ok: true; subagents: unknown[] } | { ok: false; error: string } {
  const body = resultBody(res);
  if (!body.ok) return body;
  const subagents = body.body["subagents"];
  if (!Array.isArray(subagents)) return { ok: false, error: "subagent/list_running 响应缺少 subagents" };
  return { ok: true, subagents };
}

export function parseKill(res: unknown): { outcome: string | null; error: string | null } {
  const body = resultBody(res);
  if (!body.ok) return { outcome: null, error: body.error };
  const outcome = textOf(body.body["outcome"]);
  return { outcome, error: null };
}

export function parseCancel(res: unknown): { subagentId: string | null; outcome: SubagentCancelOutcome | null; error: string | null } {
  const body = resultBody(res);
  if (!body.ok) return { subagentId: null, outcome: null, error: body.error };
  const subagentId = textOf(body.body["subagentId"]);
  const outcome = cancelOutcome(body.body["outcome"], body.body["cancelled"]);
  return { subagentId, outcome, error: null };
}

export function parseScheduleDelete(res: unknown): { taskId: string | null; deleted: boolean | null; error: string | null } {
  const body = resultBody(res);
  if (!body.ok) return { taskId: null, deleted: null, error: body.error };
  const taskId = textOf(body.body["taskId"]);
  const deleted = typeof body.body["deleted"] === "boolean" ? body.body["deleted"] : null;
  if (deleted === null) return { taskId, deleted: null, error: "scheduler/delete 响应缺少 deleted" };
  return { taskId, deleted, error: null };
}

function fromBackgrounded(update: Record<string, unknown>, taskId: string, isReplay: boolean): BackgroundTask {
  const command = textOf(update["command"]) ?? "";
  const monitorDescription = textOf(update["monitor_description"]);
  const isMonitor = monitorDescription !== null || command.startsWith(MONITOR_PREFIX);
  const description = nonBlank(monitorDescription) ?? nonBlank(stripMonitor(command)) ?? nonBlank(textOf(update["description"]));
  return blankTask(taskId, {
    toolCallId: textOf(update["tool_call_id"]),
    command,
    description,
    cwd: textOf(update["cwd"]),
    outputFile: textOf(update["output_file"]),
    isMonitor,
    restoredFromReplay: isReplay,
    status: "running",
  });
}

type ParsedSnapshot = {
  taskId: string;
  command: string;
  displayCommand: string | null;
  description: string | null;
  cwd: string | null;
  outputFile: string | null;
  isMonitor: boolean;
  startTimeMs: number | null;
  endTimeMs: number | null;
  exitCode: number | null;
  signal: string | null;
  output: string;
  truncated: boolean;
  outputTotalBytes: number | null;
};

function fromSnapshot(snapshot: Record<string, unknown>): ParsedSnapshot | null {
  const taskId = idOf(snapshot["task_id"]);
  if (taskId === null) return null;
  const command = textOf(snapshot["command"]) ?? "";
  const displayCommand = textOf(snapshot["display_command"]);
  const kind = textOf(snapshot["kind"]);
  const isMonitor = kind === "monitor" || startsMonitor(displayCommand) || command.startsWith(MONITOR_PREFIX);
  const description = nonBlank(textOf(snapshot["description"])) ?? labelFromDisplay(displayCommand, command);
  return {
    taskId,
    command,
    displayCommand,
    description,
    cwd: textOf(snapshot["cwd"]),
    outputFile: textOf(snapshot["output_file"]),
    isMonitor,
    startTimeMs: systemTimeMs(snapshot["start_time"]),
    endTimeMs: systemTimeMs(snapshot["end_time"]),
    exitCode: numOrNull(snapshot["exit_code"]),
    signal: textOf(snapshot["signal"]),
    output: textOf(snapshot["output"]) ?? "",
    truncated: snapshot["truncated"] === true,
    outputTotalBytes: numOrNull(snapshot["output_total_bytes"]),
  };
}

function listedRow(parsed: ParsedSnapshot, completed: boolean, restoredFromReplay: boolean): BackgroundTask {
  const stored = storeOutput(parsed.output, parsed.truncated);
  const status = !completed ? "running" : terminalStatus(parsed.exitCode, parsed.signal);
  return blankTask(parsed.taskId, {
    command: parsed.command,
    displayCommand: parsed.displayCommand,
    description: parsed.description,
    cwd: parsed.cwd,
    outputFile: parsed.outputFile,
    isMonitor: parsed.isMonitor,
    status,
    startTimeMs: parsed.startTimeMs,
    endTimeMs: completed ? parsed.endTimeMs : null,
    exitCode: parsed.exitCode,
    signal: parsed.signal,
    output: stored.output,
    outputLineCount: stored.outputLineCount,
    truncated: stored.truncated,
    outputTotalBytes: parsed.outputTotalBytes,
    restoredFromReplay,
    tombstone: false,
  });
}

function terminalFrom(
  parsed: ParsedSnapshot,
  existing: BackgroundTask | undefined,
  isReplay: boolean,
  willWake: boolean,
): BackgroundTask {
  const status = terminalStatus(parsed.exitCode, parsed.signal);
  if (!existing) {
    const stored = storeOutput(parsed.output, parsed.truncated);
    return blankTask(parsed.taskId, {
      command: parsed.command,
      displayCommand: parsed.displayCommand,
      description: parsed.description,
      cwd: parsed.cwd,
      outputFile: parsed.outputFile,
      isMonitor: parsed.isMonitor,
      status,
      startTimeMs: parsed.startTimeMs,
      endTimeMs: parsed.endTimeMs,
      exitCode: parsed.exitCode,
      signal: parsed.signal,
      output: stored.output,
      outputLineCount: stored.outputLineCount,
      truncated: stored.truncated,
      outputTotalBytes: parsed.outputTotalBytes,
      willWake,
      restoredFromReplay: isReplay,
      tombstone: true,
    });
  }
  const stored = parsed.output.length > 0 ? storeOutput(parsed.output, parsed.truncated || existing.truncated) : null;
  return {
    ...existing,
    command: existing.command.trim().length > 0 ? existing.command : parsed.command,
    displayCommand: existing.displayCommand ?? parsed.displayCommand,
    description: nonBlank(existing.description) ?? parsed.description,
    cwd: existing.cwd ?? parsed.cwd,
    outputFile: existing.outputFile ?? parsed.outputFile,
    isMonitor: existing.isMonitor || parsed.isMonitor,
    status,
    startTimeMs: existing.startTimeMs ?? parsed.startTimeMs,
    endTimeMs: parsed.endTimeMs ?? existing.endTimeMs,
    exitCode: parsed.exitCode,
    signal: parsed.signal,
    output: stored?.output ?? existing.output,
    outputLineCount: stored?.outputLineCount ?? existing.outputLineCount,
    truncated: existing.truncated || parsed.truncated || (stored?.truncated ?? false),
    outputTotalBytes: parsed.outputTotalBytes ?? existing.outputTotalBytes,
    willWake,
    pendingKill: false,
    killRequestedAtMs: null,
  };
}

function refreshRunning(existing: BackgroundTask, incoming: BackgroundTask, isReplay: boolean): BackgroundTask {
  return {
    ...existing,
    toolCallId: incoming.toolCallId ?? existing.toolCallId,
    command: incoming.command.trim().length > 0 ? incoming.command : existing.command,
    displayCommand: incoming.displayCommand ?? existing.displayCommand,
    description: nonBlank(incoming.description) ?? existing.description,
    cwd: incoming.cwd ?? existing.cwd,
    outputFile: incoming.outputFile ?? existing.outputFile,
    isMonitor: existing.isMonitor || incoming.isMonitor,
    restoredFromReplay: isReplay ? existing.restoredFromReplay : false,
    pendingKill: existing.pendingKill,
    killRequestedAtMs: existing.killRequestedAtMs,
    killOutcome: existing.killOutcome,
  };
}

function absorbLate(existing: BackgroundTask, incoming: BackgroundTask): BackgroundTask {
  return {
    ...existing,
    toolCallId: existing.toolCallId ?? incoming.toolCallId,
    command: existing.command.trim().length > 0 ? existing.command : incoming.command,
    displayCommand: existing.displayCommand ?? incoming.displayCommand,
    description: nonBlank(existing.description) ?? incoming.description,
    cwd: existing.cwd ?? incoming.cwd,
    outputFile: existing.outputFile ?? incoming.outputFile,
    isMonitor: existing.isMonitor || incoming.isMonitor,
  };
}

function terminalStatus(exitCode: number | null, signal: string | null): "completed" | "failed" {
  return exitCode === 0 || (exitCode === null && signal === null) ? "completed" : "failed";
}

function blankTask(taskId: string, patch: Partial<BackgroundTask>): BackgroundTask {
  return {
    taskId,
    toolCallId: null,
    command: "",
    displayCommand: null,
    description: null,
    cwd: null,
    outputFile: null,
    isMonitor: false,
    status: "running",
    startTimeMs: null,
    endTimeMs: null,
    exitCode: null,
    signal: null,
    output: "",
    outputLineCount: 0,
    truncated: false,
    outputTotalBytes: null,
    willWake: false,
    restoredFromReplay: false,
    tombstone: false,
    pendingKill: false,
    killRequestedAtMs: null,
    killOutcome: null,
    ...patch,
  };
}

function emptyProgress(subagentId: string, restoredFromReplay: boolean): SubagentProgress {
  return {
    subagentId,
    parentSessionId: null,
    childSessionId: null,
    subagentType: null,
    description: null,
    startedAtEpochMs: null,
    durationMs: null,
    turnCount: null,
    toolCallCount: null,
    tokensUsed: null,
    contextWindowTokens: null,
    contextUsagePct: null,
    toolsUsed: [],
    errorCount: null,
    restoredFromReplay,
  };
}

function appendOutput(task: BackgroundTask, chunk: string): BackgroundTask {
  const joined = task.output.length === 0 ? chunk : task.output + "\n" + chunk;
  const cut = joined.length > OUTPUT_CAP;
  const output = cut ? tailWithin(joined, OUTPUT_CAP) : joined;
  return { ...task, output, truncated: task.truncated || cut, outputLineCount: lineCount(output) };
}

function storeOutput(text: string, alreadyTruncated: boolean): { output: string; truncated: boolean; outputLineCount: number } {
  const cut = text.length > OUTPUT_CAP;
  const output = cut ? headWithin(text, OUTPUT_CAP) : text;
  return { output, truncated: alreadyTruncated || cut, outputLineCount: lineCount(output) };
}

function lineCount(text: string): number {
  if (text.length === 0) return 0;
  let n = 0;
  for (let i = 0; i < text.length; i++) if (text.charCodeAt(i) === 10) n += 1;
  return text.endsWith("\n") ? n : n + 1;
}

function headWithin(text: string, max: number): string {
  if (text.length <= max) return text;
  let end = max;
  const code = text.charCodeAt(end - 1);
  if (code >= 0xd800 && code <= 0xdbff) end -= 1;
  return text.slice(0, Math.max(0, end));
}

function tailWithin(text: string, max: number): string {
  if (text.length <= max) return text;
  let start = text.length - max;
  const code = text.charCodeAt(start);
  if (code >= 0xdc00 && code <= 0xdfff) start += 1;
  return text.slice(start);
}

function systemTimeMs(value: unknown): number | null {
  const o = asObj(value);
  if (o === null) return null;
  const secs = o["secs_since_epoch"];
  if (typeof secs !== "number" || !Number.isFinite(secs)) return null;
  const nanos = o["nanos_since_epoch"];
  const extra = typeof nanos === "number" && Number.isFinite(nanos) ? nanos : 0;
  return Math.round(secs * 1000 + extra / 1e6);
}

function labelFromDisplay(display: string | null, command: string): string | null {
  if (display === null) return null;
  const stripped = stripMonitor(display) ?? display;
  const trimmed = stripped.trim();
  if (trimmed.length === 0 || trimmed === command.trim()) return null;
  return stripped;
}

function stripMonitor(command: string): string | null {
  if (!command.startsWith(MONITOR_PREFIX)) return null;
  const rest = command.slice(MONITOR_PREFIX.length);
  return rest.trim().length > 0 ? rest : null;
}

function startsMonitor(value: string | null): boolean {
  return value !== null && value.startsWith(MONITOR_PREFIX);
}

function nonBlank(value: string | null): string | null {
  if (value === null || value.trim().length === 0) return null;
  return value;
}

function cancelOutcome(value: unknown, legacy: unknown): SubagentCancelOutcome | null {
  const o = asObj(value);
  const kind = o === null ? null : textOf(o["kind"]);
  if (kind === "cancelled") return { kind: "cancelled" };
  if (kind === "already_finished") return { kind: "already_finished", status: textOf(o?.["status"]) ?? "" };
  if (kind === "not_found") return { kind: "not_found" };
  if (kind === "unknown") return { kind: "unknown" };
  if (kind !== null) return { kind: "unknown" };
  if (legacy === true) return { kind: "cancelled" };
  return null;
}

function resultBody(res: unknown): { ok: true; body: Record<string, unknown> } | { ok: false; error: string } {
  const env = asObj(res);
  if (env === null) return { ok: false, error: "响应不是对象" };
  const error = errorText(env["error"]);
  const result = env["result"];
  if (result === null || result === undefined) return { ok: false, error: error ?? "响应没有 result" };
  const body = asObj(result);
  if (body === null) return { ok: false, error: error ?? "result 不是对象" };
  return { ok: true, body };
}

function errorText(value: unknown): string | null {
  if (typeof value === "string" && value.length > 0) return value;
  const o = asObj(value);
  return o === null ? null : textOf(o["message"]);
}

function stringList(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  return value.filter((item): item is string => typeof item === "string");
}

function idOf(value: unknown): string | null {
  if (typeof value === "string" && value.length > 0) return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return null;
}

function textOf(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function numOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asObj(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : null;
}
