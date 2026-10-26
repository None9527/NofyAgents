import assert from "node:assert/strict";
import test from "node:test";
import { EXT_DISPATCH_ONLY, EXT_EVENT, EXT_REQUEST } from "@nofy-desktop/acp";
import { createDesktopClient } from "../renderer/application/client.ts";
import { runEffect } from "../renderer/core/effects.ts";
import type { Effect } from "../renderer/core/effects.ts";
import { normalizeNotification } from "../renderer/core/events.ts";
import type { KernelPort } from "../renderer/core/kernel-port.ts";
import { reduce } from "../renderer/core/project.ts";
import type { Runtime } from "../renderer/core/runtime.ts";
import { initialState } from "../renderer/core/store/state.ts";
import type { AppState, BackgroundTask } from "../renderer/core/store/state.ts";
import { createStore } from "../renderer/core/store/store.ts";
import type { Store } from "../renderer/core/store/store.ts";
import type { Action } from "../renderer/core/project.ts";
import { killRetryable, OUTPUT_CAP, PENDING_KILL_TIMEOUT_MS, watchingBackgroundTasks } from "../renderer/core/taskMonitor.ts";

const STALE = "连接已变化，请等待会话恢复后重试";

function base(): AppState {
  return reduce(initialState(), { type: "session/created", sessionId: "s", cwd: "/w", modelId: null });
}

function project(state: AppState, method: string, update: Record<string, unknown>, replay = false): AppState {
  return reduce(state, {
    type: "kernel/event",
    event: normalizeNotification(method, {
      sessionId: "s",
      update,
      ...(replay ? { _meta: { isReplay: true } } : {}),
    }),
  });
}

function row(state: AppState, id: string): BackgroundTask {
  const task = state.sessions.s?.backgroundTasks[id];
  assert.ok(task, id);
  return task;
}

function readyStore(): Store<AppState, Action> {
  const store = createStore(reduce, initialState());
  store.dispatch({ type: "connection/status", status: "ready" });
  store.dispatch({ type: "session/created", sessionId: "s", cwd: "/w", modelId: null });
  return store;
}

function portFor(store: Store<AppState, Action>, reply: (method: string) => unknown, onCall?: (method: string) => void) {
  const calls: Array<{ method: string; params: unknown }> = [];
  const port: KernelPort = {
    subscribe: () => () => {},
    request: async () => { throw new Error("不是扩展请求"); },
    notify: () => { throw new Error("任务请求不能走通知"); },
    respond: () => {},
    cancel: () => {},
    isReady: () => store.getState().connection.status === "ready",
    extRequest: async (method, params) => {
      calls.push({ method, params });
      onCall?.(method);
      const body = reply(method);
      if (body instanceof Error) throw body;
      return body;
    },
  };
  return { port, calls };
}

test("live task methods are notifications, and replay arrives on the persisted session update", () => {
  const live = normalizeNotification(EXT_EVENT.taskBackgrounded, {
    sessionId: "s",
    update: { sessionUpdate: "task_backgrounded", task_id: 42, command: "ls", cwd: "/w", output_file: "/tmp/ls", tool_call_id: "call" },
  });
  assert.equal(live.type, "ext-notification");
  if (live.type === "ext-notification") {
    assert.equal(live.kind, "task_backgrounded");
    assert.equal(live.rail, "live");
    assert.equal(live.meta.isReplay, undefined);
  }
  const mismatch = normalizeNotification(EXT_EVENT.taskBackgrounded, {
    sessionId: "s",
    update: { sessionUpdate: "task_completed", task_snapshot: { task_id: "nope" } },
  });
  assert.equal(mismatch.type, "unknown");
  if (mismatch.type === "unknown") assert.equal(mismatch.method, EXT_EVENT.taskBackgrounded + "#task_completed");

  let state = project(base(), EXT_EVENT.taskBackgrounded, {
    sessionUpdate: "task_backgrounded", task_id: 42, command: "[monitor] ping", monitor_description: "watch files", cwd: "/w", output_file: "/tmp/ls", tool_call_id: "call",
  });
  const liveRow = row(state, "42");
  assert.equal(liveRow.status, "running");
  assert.equal(liveRow.isMonitor, true);
  assert.equal(liveRow.description, "watch files");
  assert.equal(liveRow.restoredFromReplay, false);
  assert.equal(liveRow.startTimeMs, null);
  assert.deepEqual(watchingBackgroundTasks(state.sessions.s!.backgroundTasks).map(task => task.taskId), ["42"]);

  const replay = normalizeNotification(EXT_EVENT.sessionUpdate, {
    sessionId: "s",
    update: { sessionUpdate: "task_backgrounded", task_id: "old", command: "pwd" },
    _meta: { isReplay: true },
  });
  assert.equal(replay.type, "ext-notification");
  if (replay.type === "ext-notification") {
    assert.equal(replay.rail, "persisted");
    assert.equal(replay.meta.isReplay, true);
  }
  state = reduce(state, { type: "kernel/event", event: replay });
  assert.equal(row(state, "old").restoredFromReplay, true);
  assert.deepEqual(watchingBackgroundTasks(state.sessions.s!.backgroundTasks).map(task => task.taskId), ["42"]);
  state = reduce(state, { type: "kernel/event", event: mismatch });
  assert.equal(state.sessions.s?.backgroundTasks.nope, undefined);
});

test("completion before backgrounded stays terminal and a later backgrounded only backfills blanks", () => {
  let state = project(base(), EXT_EVENT.taskCompleted, {
    sessionUpdate: "task_completed",
    will_wake: true,
    task_snapshot: {
      task_id: "t",
      command: "",
      description: "from-snap",
      output: "a\n",
      truncated: false,
      completed: false,
      kind: "bash",
      exit_code: 0,
      start_time: { secs_since_epoch: 10, nanos_since_epoch: 500_000_000 },
      end_time: 12_345,
    },
  });
  let task = row(state, "t");
  assert.equal(task.status, "completed");
  assert.equal(task.tombstone, true);
  assert.equal(task.willWake, true);
  assert.equal(task.startTimeMs, 10_500);
  assert.equal(task.endTimeMs, null);
  assert.equal(task.outputLineCount, 1);
  assert.deepEqual(watchingBackgroundTasks(state.sessions.s!.backgroundTasks), []);

  state = project(state, EXT_EVENT.taskBackgrounded, {
    sessionUpdate: "task_backgrounded",
    task_id: "t",
    tool_call_id: "call-1",
    command: "echo hi",
    description: "",
    cwd: "/work",
    output_file: "/tmp/late",
    monitor_description: "",
  });
  task = row(state, "t");
  assert.equal(task.status, "completed");
  assert.equal(task.tombstone, true);
  assert.equal(task.command, "echo hi");
  assert.equal(task.description, "from-snap");
  assert.equal(task.outputFile, "/tmp/late");
  assert.equal(task.cwd, "/work");
  assert.equal(task.toolCallId, "call-1");
  assert.equal(task.isMonitor, true);
  assert.equal(task.willWake, true);
  assert.deepEqual(watchingBackgroundTasks(state.sessions.s!.backgroundTasks), []);

  state = project(state, EXT_EVENT.taskCompleted, {
    sessionUpdate: "task_completed",
    task_snapshot: { task_id: "stale", command: "sleep", output: "", completed: false, signal: "session_restart" },
  });
  assert.equal(row(state, "stale").status, "failed");
  assert.equal(row(state, "stale").signal, "session_restart");
  state = project(state, EXT_EVENT.taskCompleted, {
    sessionUpdate: "task_completed",
    task_snapshot: { task_id: "empty", command: "true", output: "", exit_code: 0, completed: true },
  });
  assert.equal(row(state, "empty").outputLineCount, 0);
});

test("replay does not light watching, a later live backgrounded does, and will_wake never does", () => {
  let state = project(base(), EXT_EVENT.sessionUpdate, {
    sessionUpdate: "task_backgrounded", task_id: "r", command: "replay",
  }, true);
  assert.equal(row(state, "r").restoredFromReplay, true);
  state = project(state, EXT_EVENT.sessionUpdate, {
    sessionUpdate: "task_backgrounded", task_id: "r", command: "replay-again",
  }, true);
  assert.equal(row(state, "r").restoredFromReplay, true);
  state = project(state, EXT_EVENT.taskBackgrounded, {
    sessionUpdate: "task_backgrounded", task_id: "r", command: "live",
  });
  assert.equal(row(state, "r").restoredFromReplay, false);
  assert.equal(row(state, "r").command, "live");
  state = project(state, EXT_EVENT.sessionUpdate, {
    sessionUpdate: "task_backgrounded", task_id: "r", command: "replay-late",
  }, true);
  assert.equal(row(state, "r").restoredFromReplay, false);
  assert.equal(row(state, "r").status, "running");

  const before = state.appliedEvents;
  state = reduce(state, {
    type: "tasks/listed",
    sessionId: "s",
    tasks: [{ task_id: "listed", command: "from-list", completed: false, output: "", kind: "bash" }],
  });
  assert.equal(state.appliedEvents, before + 1);
  assert.equal(row(state, "listed").restoredFromReplay, true);
  state = project(state, EXT_EVENT.taskBackgrounded, {
    sessionUpdate: "task_backgrounded", task_id: "listed", command: "from-list",
  });
  assert.equal(row(state, "listed").restoredFromReplay, false);
  assert.deepEqual(watchingBackgroundTasks(state.sessions.s!.backgroundTasks).map(task => task.taskId).sort(), ["listed", "r"]);

  state = project(state, EXT_EVENT.taskCompleted, {
    sessionUpdate: "task_completed",
    will_wake: true,
    task_snapshot: { task_id: "r", command: "live", output: "ok", exit_code: 0, completed: true },
  });
  assert.equal(row(state, "r").willWake, true);
  assert.equal(row(state, "r").status, "completed");
  assert.deepEqual(watchingBackgroundTasks(state.sessions.s!.backgroundTasks).map(task => task.taskId), ["listed"]);
});

test("stdout cap keeps the head on set and the tail on append, and truncated stays sticky", () => {
  const head = "START" + "x".repeat(OUTPUT_CAP);
  let state = project(base(), EXT_EVENT.taskCompleted, {
    sessionUpdate: "task_completed",
    task_snapshot: { task_id: "set", command: "cat", output: head + "TAIL", exit_code: 0, completed: true, truncated: false },
  });
  let task = row(state, "set");
  assert.equal(task.truncated, true);
  assert.ok(task.output.startsWith("START"));
  assert.equal(task.output.endsWith("TAIL"), false);
  assert.ok(task.output.length <= OUTPUT_CAP);

  const pair = "a".repeat(OUTPUT_CAP - 1) + "\uD800\uDC00";
  state = project(state, EXT_EVENT.taskCompleted, {
    sessionUpdate: "task_completed",
    task_snapshot: { task_id: "pair", command: "cat", output: pair, exit_code: 0, completed: true },
  });
  assert.equal(row(state, "pair").output, "a".repeat(OUTPUT_CAP - 1));
  assert.equal(row(state, "pair").truncated, true);

  state = project(state, EXT_EVENT.taskBackgrounded, { sessionUpdate: "task_backgrounded", task_id: "log", command: "run" });
  state = project(state, EXT_EVENT.monitorEvent, { sessionUpdate: "monitor_event", task_id: "log", event_text: "hello" });
  state = project(state, EXT_EVENT.monitorEvent, { sessionUpdate: "monitor_event", task_id: "log", event_text: "world" });
  assert.equal(row(state, "log").output, "hello\nworld");
  assert.equal(row(state, "log").outputLineCount, 2);
  state = project(state, EXT_EVENT.monitorEvent, {
    sessionUpdate: "monitor_event",
    task_id: "log",
    event_text: "HEAD" + "b".repeat(OUTPUT_CAP) + "TAIL",
  });
  task = row(state, "log");
  assert.equal(task.truncated, true);
  assert.equal(task.output.endsWith("TAIL"), true);
  assert.equal(task.output.startsWith("hello"), false);
  state = project(state, EXT_EVENT.monitorEvent, { sessionUpdate: "monitor_event", task_id: "log", event_text: "ok" });
  assert.equal(row(state, "log").truncated, true);
  assert.equal(row(state, "log").output.endsWith("ok"), true);

  const before = state.appliedEvents;
  state = project(state, EXT_EVENT.monitorEvent, { sessionUpdate: "monitor_event", task_id: "missing", event_text: "nope" });
  assert.equal(state.sessions.s?.backgroundTasks.missing, undefined);
  assert.equal(state.unhandled["ext#monitor_event:unknown-task"], 1);
  assert.equal(state.appliedEvents, before + 1);
  state = project(state, EXT_EVENT.monitorEvent, { sessionUpdate: "monitor_event", event_text: "no id" });
  assert.equal(state.unhandled["ext#monitor_event:missing-id"], 1);
});

test("scheduled loops link the fired subagent, ignore a deleted loop, and leave inject_prompt unknown", () => {
  let state = project(base(), EXT_EVENT.scheduledTaskCreated, {
    sessionUpdate: "scheduled_task_created", task_id: "loop", prompt: "check", human_schedule: "daily", next_fire_at: "t1",
  });
  state = project(state, EXT_EVENT.scheduledTaskFired, {
    sessionUpdate: "scheduled_task_fired", task_id: "loop", prompt: "check", human_schedule: "daily", next_fire_at: "t2", subagent_id: "child",
  });
  assert.equal(state.sessions.s?.scheduledTasks.loop?.lastSubagentId, "child");
  assert.equal(state.sessions.s?.scheduledTasks.loop?.deleted, false);
  state = project(state, EXT_EVENT.scheduledTaskDeleted, { sessionUpdate: "scheduled_task_deleted", task_id: "loop" });
  state = project(state, EXT_EVENT.scheduledTaskFired, {
    sessionUpdate: "scheduled_task_fired", task_id: "loop", next_fire_at: "t3", subagent_id: "other",
  });
  assert.equal(state.sessions.s?.scheduledTasks.loop?.deleted, true);
  assert.equal(state.sessions.s?.scheduledTasks.loop?.lastSubagentId, "child");
  state = project(state, EXT_EVENT.scheduledTaskCreated, {
    sessionUpdate: "scheduled_task_created", task_id: "loop", prompt: "again", human_schedule: "hourly", next_fire_at: "t4",
  });
  assert.equal(state.sessions.s?.scheduledTasks.loop?.deleted, false);
  assert.equal(state.sessions.s?.scheduledTasks.loop?.prompt, "again");

  const before = state.appliedEvents;
  state = project(state, EXT_EVENT.scheduledTaskFired, { sessionUpdate: "scheduled_task_fired", task_id: "ghost" });
  assert.equal(state.sessions.s?.scheduledTasks.ghost, undefined);
  assert.equal(state.unhandled["ext#scheduled_task_fired:missing-id"], undefined);
  assert.equal(state.appliedEvents, before + 1);
  state = project(state, EXT_EVENT.scheduledTaskFired, {
    sessionUpdate: "scheduled_task_fired", task_id: "born", next_fire_at: "soon", subagent_id: "sub",
  });
  assert.equal(state.sessions.s?.scheduledTasks.born?.lastSubagentId, "sub");
  state = project(state, EXT_EVENT.scheduledTaskDeleted, { sessionUpdate: "scheduled_task_deleted", task_id: "absent" });
  assert.equal(state.sessions.s?.scheduledTasks.absent, undefined);

  const injected = normalizeNotification(EXT_EVENT.scheduledTaskInjectPrompt, {
    sessionId: "s", taskId: "loop", prompt: "check", humanSchedule: "daily", nextFireAt: null,
  });
  assert.equal(injected.type, "unknown");
  if (injected.type === "unknown") assert.equal(injected.method, EXT_EVENT.scheduledTaskInjectPrompt);
  state = reduce(state, { type: "kernel/event", event: injected });
  assert.equal(state.unhandled[EXT_EVENT.scheduledTaskInjectPrompt], 1);
  assert.equal(state.sessions.s?.scheduledTasks.loop?.prompt, "again");
});

test("list reconcile keeps local rows, refuses to resurrect a tombstone, and counts a skipped snapshot once", () => {
  let state = project(base(), EXT_EVENT.taskBackgrounded, { sessionUpdate: "task_backgrounded", task_id: "solo", command: "solo" });
  state = project(state, EXT_EVENT.taskBackgrounded, { sessionUpdate: "task_backgrounded", task_id: "live", command: "live" });
  state = project(state, EXT_EVENT.monitorEvent, { sessionUpdate: "monitor_event", task_id: "live", event_text: "old" });
  state = project(state, EXT_EVENT.taskBackgrounded, { sessionUpdate: "task_backgrounded", task_id: "keep", command: "keep" });
  state = project(state, EXT_EVENT.monitorEvent, { sessionUpdate: "monitor_event", task_id: "keep", event_text: "stay" });
  state = project(state, EXT_EVENT.taskCompleted, {
    sessionUpdate: "task_completed",
    task_snapshot: { task_id: "done", command: "done", output: "out", exit_code: 0, completed: true },
  });
  const before = state.appliedEvents;
  state = reduce(state, {
    type: "tasks/listed",
    sessionId: "s",
    tasks: [
      { task_id: "live", command: "live", completed: false, output: "fresh", kind: "bash" },
      { task_id: "keep", command: "keep", completed: false, output: "", kind: "bash" },
      { task_id: "done", command: "done", completed: false, output: "nope", kind: "bash" },
      { task_id: "only-list", command: "list", completed: false, exit_code: 0, output: "", kind: "monitor" },
      { task_id: "bad" },
    ],
  });
  assert.equal(state.appliedEvents, before + 1);
  assert.equal(state.unhandled["task/list:skipped"], 1);
  assert.equal(row(state, "solo").command, "solo");
  assert.equal(row(state, "live").output, "fresh");
  assert.equal(row(state, "live").restoredFromReplay, false);
  assert.equal(row(state, "keep").output, "stay");
  assert.equal(row(state, "done").status, "completed");
  assert.equal(row(state, "done").output, "out");
  assert.equal(row(state, "only-list").status, "running");
  assert.equal(row(state, "only-list").restoredFromReplay, true);
  assert.equal(row(state, "only-list").isMonitor, true);
  state = project(state, EXT_EVENT.taskBackgrounded, { sessionUpdate: "task_backgrounded", task_id: "finishing", command: "fin" });
  state = reduce(state, {
    type: "tasks/listed",
    sessionId: "s",
    tasks: [{ task_id: "finishing", command: "fin", completed: true, output: "", exit_code: 1, kind: "bash" }],
  });
  assert.equal(row(state, "finishing").status, "failed");
  assert.equal(row(state, "finishing").restoredFromReplay, false);
  assert.equal(row(state, "solo").status, "running");
  assert.ok(!watchingBackgroundTasks(state.sessions.s!.backgroundTasks).some(task => task.taskId === "only-list"));

  state = project(state, EXT_EVENT.sessionUpdate, {
    sessionUpdate: "subagent_progress", subagent_id: "child", turn_count: 3, tool_call_count: 4,
  });
  state = project(state, EXT_EVENT.sessionUpdate, {
    sessionUpdate: "subagent_spawned", subagent_id: "child", description: "look",
  });
  assert.equal(state.sessions.s?.subagentProgress.child?.turnCount, 3);
  assert.equal(state.sessions.s?.subagentProgress.child?.description, "look");
  const progressBefore = state.appliedEvents;
  state = reduce(state, {
    type: "subagents/listed",
    sessionId: "s",
    subagents: [
      { subagentId: "child", turnCount: 5, description: "look" },
      { subagentId: "other", description: "new" },
      { description: "no id" },
    ],
  });
  assert.equal(state.appliedEvents, progressBefore + 1);
  assert.equal(state.unhandled["subagent/list_running:skipped"], 1);
  assert.equal(state.sessions.s?.subagentProgress.child?.turnCount, 5);
  assert.equal(state.sessions.s?.subagentProgress.child?.restoredFromReplay, false);
  assert.equal(state.sessions.s?.subagentProgress.other?.restoredFromReplay, true);
  assert.equal(state.sessions.s?.subagentProgress.other?.turnCount, null);
  state = reduce(state, { type: "subagents/listed", sessionId: "s", subagents: [] });
  assert.equal(state.sessions.s?.subagentProgress.other?.description, "new");
  assert.equal(state.sessions.s?.subagentFinished.child, undefined);
});

test("kill outcomes, cancel kinds, and schedule deletion do not invent rows or finish a subagent", () => {
  let state = project(base(), EXT_EVENT.taskBackgrounded, { sessionUpdate: "task_backgrounded", task_id: "t", command: "run" });
  const at = 5_000;
  state = reduce(state, { type: "task/kill-requested", sessionId: "s", taskId: "t", at });
  assert.equal(killRetryable(row(state, "t"), at + PENDING_KILL_TIMEOUT_MS - 1), false);
  assert.equal(killRetryable(row(state, "t"), at + PENDING_KILL_TIMEOUT_MS), true);
  state = reduce(state, { type: "task/kill-requested", sessionId: "s", taskId: "missing", at });
  assert.equal(state.sessions.s?.backgroundTasks.missing, undefined);
  state = reduce(state, { type: "task/kill-resolved", sessionId: "s", taskId: "t", outcome: "killed" });
  assert.equal(row(state, "t").pendingKill, true);
  assert.equal(row(state, "t").killOutcome, "killed");
  state = reduce(state, { type: "task/kill-resolved", sessionId: "s", taskId: "t", outcome: "already_exited" });
  assert.equal(row(state, "t").pendingKill, false);
  assert.equal(row(state, "t").killOutcome, "already_exited");
  state = reduce(state, { type: "task/kill-resolved", sessionId: "s", taskId: "t", outcome: null });
  assert.equal(row(state, "t").killOutcome, "already_exited");
  state = reduce(state, { type: "task/kill-resolved", sessionId: "s", taskId: "t", outcome: "weird" });
  assert.equal(row(state, "t").pendingKill, false);
  assert.equal(row(state, "t").killOutcome, "weird");
  state = reduce(state, { type: "task/kill-resolved", sessionId: "s", taskId: "t", outcome: "not_found" });
  assert.equal(state.sessions.s?.backgroundTasks.t, undefined);

  state = project(state, EXT_EVENT.sessionUpdate, {
    sessionUpdate: "subagent_finished", subagent_id: "child", status: "completed", output: "done",
  });
  const finished = state.sessions.s?.subagentFinished.child;
  for (const outcome of [
    { kind: "cancelled" },
    { kind: "already_finished", status: "failed" },
    { kind: "not_found" },
    { kind: "unknown" },
  ] as const) {
    state = reduce(state, { type: "subagent/cancel-resolved", sessionId: "s", subagentId: "child", outcome });
    assert.deepEqual(state.sessions.s?.subagentCancel.child, outcome);
  }
  state = reduce(state, { type: "subagent/cancel-resolved", sessionId: "s", subagentId: "child", outcome: null });
  assert.deepEqual(state.sessions.s?.subagentCancel.child, { kind: "unknown" });
  assert.deepEqual(state.sessions.s?.subagentFinished.child, finished);

  state = project(state, EXT_EVENT.scheduledTaskCreated, {
    sessionUpdate: "scheduled_task_created", task_id: "loop", prompt: "check", human_schedule: "daily",
  });
  state = reduce(state, { type: "schedule/delete-resolved", sessionId: "s", taskId: "loop", deleted: false });
  assert.equal(state.sessions.s?.scheduledTasks.loop?.deleted, false);
  state = reduce(state, { type: "schedule/delete-resolved", sessionId: "s", taskId: "missing", deleted: true });
  assert.equal(state.sessions.s?.scheduledTasks.missing, undefined);
  state = reduce(state, { type: "schedule/delete-resolved", sessionId: "s", taskId: "loop", deleted: true });
  assert.equal(state.sessions.s?.scheduledTasks.loop?.deleted, true);

  state = reduce(state, { type: "session/replay-reset", sessionId: "s" });
  assert.deepEqual(state.sessions.s?.backgroundTasks, {});
  assert.deepEqual(state.sessions.s?.scheduledTasks, {});
  assert.deepEqual(state.sessions.s?.subagentProgress, {});
  assert.deepEqual(state.sessions.s?.subagentCancel, {});
  assert.deepEqual(state.sessions.s?.subagentFinished, {});
});

test("task effects send the kernel methods and do not apply a failed or stale list", async () => {
  const idle = createStore(reduce, initialState());
  idle.dispatch({ type: "session/created", sessionId: "s", cwd: "/w", modelId: null });
  const idlePort = portFor(idle, () => { throw new Error("不应发送"); });
  const blocked = await runEffect(idlePort.port, idle, { kind: "tasks/reconcile", sessionId: "s" });
  assert.equal(blocked.ok, false);
  if (!blocked.ok) assert.equal(blocked.error, STALE);
  assert.equal(idlePort.calls.length, 0);

  const store = readyStore();
  store.dispatch({ type: "kernel/event", event: normalizeNotification(EXT_EVENT.taskBackgrounded, {
    sessionId: "s", update: { sessionUpdate: "task_backgrounded", task_id: "local", command: "local" },
  }) });
  const failed = portFor(store, (method) => {
    if (method === EXT_DISPATCH_ONLY.task_list) return { result: null, error: "session not found or no terminal backend" };
    if (method === EXT_DISPATCH_ONLY.subagent_list_running) return { result: { subagents: [{ subagentId: "child", turnCount: 1 }] } };
    throw new Error(method);
  });
  const failure = await runEffect(failed.port, store, { kind: "tasks/reconcile", sessionId: "s" });
  assert.equal(failure.ok, false);
  if (!failure.ok) assert.equal(failure.error, "session not found or no terminal backend");
  assert.deepEqual(failed.calls.map(call => call.method), [EXT_DISPATCH_ONLY.task_list, EXT_DISPATCH_ONLY.subagent_list_running]);
  assert.deepEqual(failed.calls[0]?.params, { sessionId: "s" });
  assert.equal(store.getState().sessions.s?.backgroundTasks.local?.command, "local");
  assert.equal(Object.keys(store.getState().sessions.s?.backgroundTasks ?? {}).length, 1);
  assert.equal(store.getState().sessions.s?.subagentProgress.child?.turnCount, 1);

  const stale = portFor(store, () => ({ result: { tasks: [{ task_id: "remote", command: "remote", completed: false, output: "" }] } }), (method) => {
    if (method === EXT_DISPATCH_ONLY.task_list) store.dispatch({ type: "connection/status", status: "reconnecting" });
  });
  const staleResult = await runEffect(stale.port, store, { kind: "tasks/reconcile", sessionId: "s" });
  assert.equal(staleResult.ok, false);
  if (!staleResult.ok) assert.equal(staleResult.error, STALE);
  assert.deepEqual(stale.calls.map(call => call.method), [EXT_DISPATCH_ONLY.task_list]);
  assert.equal(store.getState().sessions.s?.backgroundTasks.remote, undefined);

  store.dispatch({ type: "connection/status", status: "ready" });
  const listed = portFor(store, (method) => method === EXT_DISPATCH_ONLY.task_list
    ? { result: { tasks: [{ task_id: "remote", command: "remote", completed: false, output: "x", kind: "bash" }, { task_id: "bad" }] } }
    : { result: { subagents: [] } });
  const before = store.getState().appliedEvents;
  const ok = await runEffect(listed.port, store, { kind: "tasks/reconcile", sessionId: "s" });
  assert.equal(ok.ok, true);
  assert.deepEqual(listed.calls[0]?.params, { sessionId: "s" });
  assert.deepEqual(listed.calls[1]?.params, { sessionId: "s" });
  assert.equal(store.getState().sessions.s?.backgroundTasks.remote?.restoredFromReplay, true);
  assert.equal(store.getState().sessions.s?.backgroundTasks.local?.command, "local");
  assert.equal(store.getState().unhandled["task/list:skipped"], 1);
  assert.equal(store.getState().appliedEvents, before + 2);

  store.dispatch({ type: "kernel/event", event: normalizeNotification(EXT_EVENT.taskBackgrounded, {
    sessionId: "s", update: { sessionUpdate: "task_backgrounded", task_id: "victim", command: "run" },
  }) });
  const killing = portFor(store, () => ({ result: { taskId: "victim", outcome: "killed" } }), (method) => {
    if (method === EXT_REQUEST.taskKill) assert.equal(store.getState().sessions.s?.backgroundTasks.victim?.pendingKill, true);
  });
  const killed = await runEffect(killing.port, store, { kind: "task/kill", sessionId: "s", taskId: "victim" });
  assert.equal(killed.ok, true);
  if (killed.ok) assert.equal(killed.value, "killed");
  assert.deepEqual(killing.calls[0], { method: EXT_REQUEST.taskKill, params: { sessionId: "s", taskId: "victim" } });
  assert.equal(store.getState().sessions.s?.backgroundTasks.victim?.pendingKill, true);

  const thrown = portFor(store, () => new Error("boom"));
  const blew = await runEffect(thrown.port, store, { kind: "task/kill", sessionId: "s", taskId: "victim" });
  assert.equal(blew.ok, false);
  if (!blew.ok) assert.equal(blew.error, "boom");
  assert.equal(store.getState().sessions.s?.backgroundTasks.victim?.pendingKill, false);
  assert.equal(store.getState().sessions.s?.backgroundTasks.victim?.killOutcome, "killed");

  const changed = portFor(store, () => ({ result: { taskId: "victim", outcome: "killed" } }), () => {
    store.dispatch({ type: "connection/status", status: "reconnecting" });
  });
  const dropped = await runEffect(changed.port, store, { kind: "task/kill", sessionId: "s", taskId: "victim" });
  assert.equal(dropped.ok, false);
  if (!dropped.ok) assert.equal(dropped.error, STALE);
  assert.equal(store.getState().sessions.s?.backgroundTasks.victim?.pendingKill, false);
  assert.equal(store.getState().sessions.s?.backgroundTasks.victim?.killOutcome, "killed");

  store.dispatch({ type: "connection/status", status: "ready" });
  const gone = portFor(store, () => ({ result: { taskId: "victim", outcome: "not_found" } }));
  await runEffect(gone.port, store, { kind: "task/kill", sessionId: "s", taskId: "victim" });
  assert.equal(store.getState().sessions.s?.backgroundTasks.victim, undefined);
  const invented = portFor(store, () => ({ result: { taskId: "nope", outcome: "killed" } }));
  await runEffect(invented.port, store, { kind: "task/kill", sessionId: "s", taskId: "nope" });
  assert.equal(store.getState().sessions.s?.backgroundTasks.nope, undefined);

  store.dispatch({ type: "kernel/event", event: normalizeNotification(EXT_EVENT.sessionUpdate, {
    sessionId: "s", update: { sessionUpdate: "subagent_finished", subagent_id: "child", status: "completed", output: "done" },
  }) });
  const cancel = portFor(store, () => ({ result: { subagentId: "child", cancelled: false, outcome: { kind: "already_finished", status: "completed" } } }));
  const cancelled = await runEffect(cancel.port, store, { kind: "subagent/cancel", sessionId: "s", subagentId: "child" });
  assert.equal(cancelled.ok, true);
  assert.deepEqual(cancel.calls[0], { method: EXT_REQUEST.subagentCancel, params: { subagentId: "child" } });
  assert.deepEqual(store.getState().sessions.s?.subagentCancel.child, { kind: "already_finished", status: "completed" });
  assert.equal(store.getState().sessions.s?.subagentFinished.child?.output, "done");
  const legacy = portFor(store, () => ({ result: { subagentId: "child", cancelled: true } }));
  await runEffect(legacy.port, store, { kind: "subagent/cancel", sessionId: "s", subagentId: "child" });
  assert.deepEqual(store.getState().sessions.s?.subagentCancel.child, { kind: "cancelled" });

  store.dispatch({ type: "kernel/event", event: normalizeNotification(EXT_EVENT.scheduledTaskCreated, {
    sessionId: "s", update: { sessionUpdate: "scheduled_task_created", task_id: "loop", prompt: "check", human_schedule: "daily" },
  }) });
  const keep = portFor(store, () => ({ result: { taskId: "loop", deleted: false } }));
  const kept = await runEffect(keep.port, store, { kind: "scheduler/delete", sessionId: "s", taskId: "loop" });
  assert.equal(kept.ok, true);
  if (kept.ok) assert.equal(kept.value, false);
  assert.deepEqual(keep.calls[0]?.params, { sessionId: "s", taskId: "loop" });
  assert.equal(store.getState().sessions.s?.scheduledTasks.loop?.deleted, false);
  const removed = portFor(store, () => ({ result: { taskId: "loop", deleted: true } }));
  await runEffect(removed.port, store, { kind: "scheduler/delete", sessionId: "s", taskId: "loop" });
  assert.equal(store.getState().sessions.s?.scheduledTasks.loop?.deleted, true);
  assert.equal(removed.calls[0]?.method, EXT_REQUEST.schedulerDelete);

  const runtime = {
    store,
    effect: async (effect: Effect) => ({ ok: true as const, effect: effect.kind, value: effect }),
    pickDirectory: async () => null,
  } as unknown as Runtime;
  const forwarded = await createDesktopClient(runtime).tasks.reconcile("s");
  assert.equal(forwarded.ok, true);
  if (forwarded.ok) assert.deepEqual(forwarded.value, { kind: "tasks/reconcile", sessionId: "s" });
});
