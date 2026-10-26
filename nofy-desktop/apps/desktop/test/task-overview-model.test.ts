import assert from "node:assert/strict";
import test from "node:test";
import { EXT_EVENT } from "@nofy-desktop/acp";
import { normalizeNotification } from "../renderer/core/events.ts";
import { reduce } from "../renderer/core/project.ts";
import { initialState } from "../renderer/core/store/state.ts";
import type { AppState, BackgroundTask, ScheduledTask, SessionState, SubagentProgress } from "../renderer/core/store/state.ts";
import type { GitStatus } from "../renderer/ui/readers.ts";
import { agentWorkPhrase } from "../renderer/features/conversation/agentModel.ts";
import {
  createTaskBoardSelector,
  createWatchingSelector,
  gitOverview,
  lineBadge,
  monitorTasks,
  oneShotTasks,
  overviewAgents,
  planOverview,
  repoBasename,
  scheduledLoops,
  taskLabel,
} from "../renderer/features/conversation/taskOverviewModel.ts";

function base(): AppState {
  return reduce(initialState(), { type: "session/created", sessionId: "s", cwd: "/w", modelId: null });
}

function withSession(patch: Partial<SessionState>): AppState {
  const state = base();
  const session = state.sessions.s;
  assert.ok(session);
  return { ...state, sessions: { s: { ...session, ...patch } } };
}

function task(patch: Partial<BackgroundTask> & { taskId: string }): BackgroundTask {
  return {
    toolCallId: null, command: "", displayCommand: null, description: null, cwd: null, outputFile: null,
    isMonitor: false, status: "running", startTimeMs: null, endTimeMs: null, exitCode: null, signal: null, output: "",
    outputLineCount: 0, truncated: false, outputTotalBytes: null, willWake: false, restoredFromReplay: false, tombstone: false,
    pendingKill: false, killRequestedAtMs: null, killOutcome: null, ...patch,
  };
}

function loop(patch: Partial<ScheduledTask> & { taskId: string }): ScheduledTask {
  return { prompt: "", humanSchedule: "", nextFireAt: null, lastSubagentId: null, deleted: false, restoredFromReplay: false, ...patch };
}

function progress(subagentId: string, patch: Partial<SubagentProgress> = {}): SubagentProgress {
  return {
    subagentId, parentSessionId: null, childSessionId: null, subagentType: null, description: null, startedAtEpochMs: null,
    durationMs: null, turnCount: null, toolCallCount: null, tokensUsed: null, contextWindowTokens: null, contextUsagePct: null,
    toolsUsed: [], errorCount: null, restoredFromReplay: true, ...patch,
  };
}

test("plans keep the latest readable list and an empty update clears them", () => {
  const older = { kind: "event", id: "old", tag: "plan", payload: { entries: [{ content: "旧步骤", status: "pending" }] } };
  const broken = { kind: "event", id: "bad", tag: "plan", payload: { entries: "nope" } };
  const latest = { kind: "event", id: "new", tag: "plan", payload: { entries: [{ content: "新步骤", status: "in_progress" }] } };
  assert.equal(planOverview([older, broken])?.blockId, "old");
  assert.equal(planOverview([older, latest])?.entries[0]?.content, "新步骤");
  assert.equal(planOverview([older, { kind: "event", id: "clear", tag: "plan", payload: { entries: [] } }]), null);
  assert.equal(planOverview([{ kind: "user-message", id: "u" }]), null);
});

test("agents keep block rows, append list-only progress, and sort running first", () => {
  const rows = overviewAgents([
    { blockId: "done", toolCallId: "call-done", subagentId: "child-done", description: "已完成的", subagentType: null, running: false, failed: false },
    { blockId: "run", toolCallId: "call-run", subagentId: "child-run", description: null, subagentType: "research", running: true, failed: false },
  ], {
    "child-run": progress("child-run", { turnCount: 2, toolCallCount: null }),
    "child-only": progress("child-only", { description: "清单里的", turnCount: 0, toolCallCount: 4 }),
  });
  assert.deepEqual(rows.map(row => row.key), ["run", "progress:child-only", "done"]);
  assert.equal(rows[0]?.label, "research");
  assert.equal(rows[0]?.turns, 2);
  assert.equal(rows[0]?.tools, null);
  assert.equal(rows[0]?.cancelId, "child-run");
  assert.equal(rows[1]?.label, "清单里的");
  assert.equal(rows[1]?.turns, 0);
  assert.equal(rows[1]?.tools, 4);
  assert.equal(rows[1]?.cancelId, "child-only");
  assert.equal(rows[2]?.cancelId, null);
  assert.equal(rows[2]?.focusId, "child-done");
});

test("replayed progress rows follow subagent_finished instead of staying at work", () => {
  const done = { status: "completed", error: null, durationMs: 9029, output: "ok" };
  const failed = { status: "failed", error: "boom", durationMs: 10, output: null };
  const rows = overviewAgents([
    { blockId: "block", toolCallId: "call", subagentId: "child-block", description: "块里的", subagentType: null, running: true, failed: false },
  ], {
    "child-block": progress("child-block"),
    "child-done": progress("child-done", { description: "测试子agent勘察工作区" }),
    "child-fail": progress("child-fail", { description: "失败的" }),
    "child-live": progress("child-live", { description: "还在跑" }),
  }, { "child-block": done, "child-done": done, "child-fail": failed });
  const byId = new Map(rows.map(row => [row.focusId, row]));
  assert.equal(rows.filter(row => row.focusId === "child-block").length, 1);
  assert.equal(byId.get("child-block")?.running, false);
  assert.equal(byId.get("child-block")?.cancelId, null);
  assert.equal(agentWorkPhrase(byId.get("child-done")!), "已完成");
  assert.equal(byId.get("child-done")?.cancelId, null);
  assert.equal(agentWorkPhrase(byId.get("child-fail")!), "失败");
  assert.equal(agentWorkPhrase(byId.get("child-live")!), "正在工作");
  assert.equal(byId.get("child-live")?.cancelId, "child-live");
  assert.deepEqual(rows.map(row => row.focusId), ["child-live", "child-block", "child-done", "child-fail"]);
});

test("a persisted finish event changes the overview card off 正在工作", () => {
  let state = reduce(initialState(), { type: "session/created", sessionId: "s", cwd: "/w", modelId: null });
  const feed = (update: Record<string, unknown>) => {
    state = reduce(state, { type: "kernel/event", event: normalizeNotification(EXT_EVENT.sessionUpdate, { sessionId: "s", update }) });
  };
  feed({ sessionUpdate: "subagent_spawned", subagent_id: "01a1405d-8e37-7693-8844-387b54abe2fb", description: "测试子agent勘察工作区", subagent_type: "explore" });
  const spawned = createTaskBoardSelector("s")(state);
  const working = overviewAgents([], spawned.subagentProgress, spawned.subagentFinished);
  assert.equal(agentWorkPhrase(working[0]!), "正在工作");
  feed({ sessionUpdate: "subagent_finished", subagent_id: "01a1405d-8e37-7693-8844-387b54abe2fb", status: "completed", duration_ms: 9029, turns: 1, tool_calls: 2, output: "done" });
  const board = createTaskBoardSelector("s")(state);
  const rows = overviewAgents([], board.subagentProgress, board.subagentFinished);
  assert.equal(rows.length, 1);
  assert.equal(agentWorkPhrase(rows[0]!), "已完成");
  assert.equal(rows[0]?.cancelId, null);
  assert.equal(rows[0]?.label, "测试子agent勘察工作区");
});

test("one-shot tasks and monitors stay apart, running first, with labels and badges", () => {
  const tasks = {
    done: task({ taskId: "done", status: "completed", command: "echo done", description: "  " , displayCommand: "shown" }),
    run: task({ taskId: "run", command: "sleep", description: "正在跑", outputLineCount: 3, truncated: true, willWake: true }),
    replay: task({ taskId: "replay", command: "replay", restoredFromReplay: true }),
    watch: task({ taskId: "watch", command: "[monitor] tail", isMonitor: true, outputLineCount: 4, truncated: false }),
    quiet: task({ taskId: "quiet", command: "true", isMonitor: true, status: "completed", outputLineCount: 0, truncated: false }),
  };
  assert.deepEqual(oneShotTasks(tasks).map(row => row.taskId), ["run", "replay", "done"]);
  assert.deepEqual(monitorTasks(tasks).map(row => row.taskId), ["watch", "quiet"]);
  assert.equal(taskLabel(tasks.done!), "shown");
  assert.equal(taskLabel(tasks.run!), "正在跑");
  assert.equal(taskLabel(task({ taskId: "blank", command: "   " })), "");
  assert.equal(lineBadge(tasks.run!), "(3+)");
  assert.equal(lineBadge(tasks.watch!), "4");
  assert.equal(lineBadge(tasks.quiet!), null);
  assert.equal(lineBadge(task({ taskId: "empty-cut", outputLineCount: 0, truncated: true })), "(0+)");

  const state = withSession({ backgroundTasks: tasks });
  const watching = createWatchingSelector("s");
  const first = watching(state);
  assert.deepEqual(first.map(row => row.taskId), ["run", "watch"]);
  assert.equal(watching(state), first);
  assert.equal(createWatchingSelector(null)(state).length, 0);
});

test("deleted schedules disappear and a deleted-only board hides the section inputs", () => {
  const loops = scheduledLoops({
    kept: loop({ taskId: "kept", prompt: "每天", humanSchedule: "daily", deleted: false }),
    gone: loop({ taskId: "gone", deleted: true }),
  });
  assert.deepEqual(loops.map(row => row.taskId), ["kept"]);
  assert.deepEqual(scheduledLoops({ gone: loop({ taskId: "gone", deleted: true }) }), []);
  assert.deepEqual(monitorTasks({}), []);
});

test("git error wins, a busy root keeps counts, and an idle miss hides", () => {
  const ready: GitStatus = {
    root: "/repo/nofy/", branch: "main", commit: "abc",
    staged: [], unstaged: [{ path: "A.md", type: "edit", staged: false, additions: 12, deletions: 3, patch: null }],
  };
  assert.equal(repoBasename("/repo/nofy/"), "nofy");
  assert.equal(repoBasename("C:\\repo\\nofy"), "nofy");
  assert.equal(repoBasename("/"), "");
  const failed = gitOverview(ready, false, "Git fixture unavailable");
  assert.equal(failed.kind, "error");
  if (failed.kind === "error") assert.equal(failed.message, "Git fixture unavailable");
  const busy = gitOverview(ready, true, null);
  assert.deepEqual(busy, { kind: "ready", title: "nofy", fileCount: 1, additions: 12, deletions: 3, branch: "main" });
  const clean = gitOverview({ ...ready, staged: [], unstaged: [] }, false, null);
  assert.equal(clean.kind, "ready");
  if (clean.kind === "ready") assert.deepEqual([clean.fileCount, clean.additions, clean.deletions], [0, 0, 0]);
  assert.equal(gitOverview(null, true, null).kind, "loading");
  assert.equal(gitOverview({ ...ready, root: null }, false, null).kind, "hidden");
  const samePath = gitOverview({
    ...ready,
    unstaged: [
      { path: "A.md", type: "edit", staged: false, additions: 1, deletions: 0, patch: null },
      { path: "A.md", type: "edit", staged: false, additions: 2, deletions: 4, patch: null },
    ],
  }, false, null);
  if (samePath.kind === "ready") assert.deepEqual([samePath.fileCount, samePath.additions, samePath.deletions], [1, 3, 4]);
});

test("task board selector follows the session maps and keeps the same snapshot", () => {
  const plans = [{ kind: "event" as const, id: "p", tag: "plan", payload: { entries: [{ content: "做完", status: "completed" }] } }];
  const state = withSession({
    blocks: plans as SessionState["blocks"],
    backgroundTasks: { run: task({ taskId: "run", command: "sleep" }) },
  });
  const select = createTaskBoardSelector("s");
  const first = select(state);
  assert.equal(first.plans?.blockId, "p");
  assert.equal(first.backgroundTasks.run?.command, "sleep");
  assert.equal(select(state), first);
  const session = state.sessions.s;
  assert.ok(session);
  const streamed: AppState = { ...state, sessions: { s: { ...session, blocks: [...session.blocks, { kind: "user-message", id: "u", text: "hi", promptIndex: null, modelId: null }] } } };
  assert.equal(select(streamed), first);
  assert.equal(createTaskBoardSelector("missing")(state).plans, null);
});
