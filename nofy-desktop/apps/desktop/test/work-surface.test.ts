import assert from "node:assert/strict";
import test from "node:test";
import { EXT_EVENT } from "@nofy-desktop/acp";
import { normalizeNotification } from "../renderer/core/events.ts";
import { reduce } from "../renderer/core/project.ts";
import { initialState, type AppState, type SessionState } from "../renderer/core/store/state.ts";
import { watchingBackgroundTasks } from "../renderer/core/taskMonitor.ts";
import { agentBlocks, agentWorkPhrase, runningAgentRows, type AgentRow } from "../renderer/features/conversation/agentModel.ts";
import { exportLoadedConversation } from "../renderer/features/conversation/exportModel.ts";
import { findInConversation } from "../renderer/features/conversation/findModel.ts";
import { agentOpenTarget, createWatchingSelector, overviewAgents, taskOpenTarget, taskRecord, taskStatusPhrase } from "../renderer/features/conversation/taskOverviewModel.ts";

const MONITOR = `<system-reminder>
Monitor "01a1405f-15a1-7821-88e3-928bb4ebffc7" ended: [monitor ended: exited (code 0)].
Description: 测试监控
Use get_command_or_subagent_output("01a1405f-15a1-7821-88e3-928bb4ebffc7") for full output.
</system-reminder>`;

const CHILD = "child-9f3a";
const TASK_FILE = "/var/nofy/task-out.log";
const MONITOR_FILE = "/var/nofy/monitor-out.log";
const STARTED = { secs_since_epoch: 1_700_000_000, nanos_since_epoch: 0 };

function base(): AppState {
  return reduce(initialState(), { type: "session/created", sessionId: "s", cwd: "/w", modelId: null });
}

function project(state: AppState, method: string, update: Record<string, unknown>): AppState {
  return reduce(state, {
    type: "kernel/event",
    event: normalizeNotification(method, { sessionId: "s", update }),
  });
}

function sessionOf(state: AppState): SessionState {
  const session = state.sessions.s;
  assert.ok(session);
  return session;
}

function runningOf(state: AppState): AgentRow[] {
  return runningAgentRows(agentBlocks(sessionOf(state)).map((row) => ({ ...row, activity: null })));
}

test("代表性 ACP 更新：隐藏回传、留下定时正文、结束后的子智能体离开运行中集合", () => {
  let state = project(base(), "session/update", {
    sessionUpdate: "user_message_chunk",
    content: { type: "text", text: "读一下 README" },
  });
  state = project(state, "session/update", {
    sessionUpdate: "user_message_chunk",
    content: { type: "text", text: MONITOR },
  });
  state = project(state, "session/update", {
    sessionUpdate: "agent_message_chunk",
    content: { type: "text", text: "监控功能测试完成" },
  });
  state = project(state, "session/update", {
    sessionUpdate: "user_message_chunk",
    content: { type: "text", text: "不应出现的回传" },
    _meta: { hideFromScrollback: true, promptIndex: 4 },
  });
  state = project(state, "session/update", {
    sessionUpdate: "user_message_chunk",
    content: { type: "text", text: "<monitor-event id=\"m\">only-tag</monitor-event>" },
  });
  state = project(state, "session/update", {
    sessionUpdate: "user_message_chunk",
    content: { type: "text", text: "<system-reminder>\nThis is a scheduled task execution (task t1).\n</system-reminder>\n\n检查部署" },
  });

  const blocks = sessionOf(state).blocks;
  const users = blocks.filter((block) => block.kind === "user-message");
  assert.equal(users[0]?.kind === "user-message" ? users[0].text : "", "读一下 README");
  assert.equal(users[0]?.kind === "user-message" ? users[0].hidden : true, undefined);
  assert.equal(users[1]?.kind === "user-message" ? users[1].hidden : false, true);
  assert.equal(users[2]?.kind === "user-message" ? users[2].hidden : false, true);
  assert.equal(users[3]?.kind === "user-message" ? users[3].hidden : false, true);
  assert.equal(users[4]?.kind === "user-message" ? users[4].text : "", "检查部署");
  assert.equal(users[4]?.kind === "user-message" ? users[4].hidden : true, undefined);

  assert.equal(findInConversation(blocks, "system-reminder").length, 0);
  assert.equal(findInConversation(blocks, "monitor-event").length, 0);
  assert.equal(findInConversation(blocks, "不应出现的回传").length, 0);
  assert.equal(findInConversation(blocks, "only-tag").length, 0);
  assert.equal(findInConversation(blocks, "监控功能").length, 1);
  assert.equal(findInConversation(blocks, "检查部署").length, 1);
  assert.equal(findInConversation(blocks, "读一下 README").length, 1);

  const exported = exportLoadedConversation(sessionOf(state)).text;
  console.log("reminder hidden", users[1]?.kind === "user-message" ? users[1].hidden === true : false);
  console.log("search system-reminder", findInConversation(blocks, "system-reminder").length);
  console.log("export omits system-reminder", exported.includes("system-reminder") === false);
  console.log("scheduled body", users[4]?.kind === "user-message" ? users[4].text : "");
  console.log("ordinary sentence", users[0]?.kind === "user-message" ? users[0].text : "");
  assert.equal(exported.includes("system-reminder"), false);
  assert.equal(exported.includes("monitor-event"), false);
  assert.equal(exported.includes("不应出现的回传"), false);
  assert.equal(exported.includes("only-tag"), false);
  assert.equal(exported.includes("监控功能测试完成"), true);
  assert.equal(exported.includes("检查部署"), true);
  assert.equal(exported.includes("读一下 README"), true);

  const notice = [
    "Subagent started in background.",
    "subagent_id: " + CHILD,
    "type: research",
    "description: Inspect references",
  ].join("\n");
  state = project(state, "session/update", {
    sessionUpdate: "tool_call",
    toolCallId: "spawn-1",
    title: "spawn_subagent",
    status: "completed",
    kind: "other",
    content: [{ type: "content", content: { type: "text", text: notice } }],
  });
  const running = runningOf(state);
  assert.equal(running.some((row) => row.subagentId === CHILD), true);
  assert.deepEqual(agentOpenTarget(CHILD), { surface: "agents", focusId: CHILD });

  state = project(state, EXT_EVENT.sessionUpdate, {
    sessionUpdate: "subagent_finished",
    subagent_id: CHILD,
    child_session_id: CHILD,
    status: "completed",
    output: "目录已列出",
  });
  const finishedRunning = runningOf(state);
  console.log("running after finish", finishedRunning.map((row) => row.subagentId));
  assert.equal(finishedRunning.some((row) => row.subagentId === CHILD), false);
  assert.equal(finishedRunning.length, 0);
});

test("任务和监控的打开目标是已投影记录，不返回 output_file", () => {
  let state = project(base(), EXT_EVENT.taskBackgrounded, {
    sessionUpdate: "task_backgrounded",
    task_id: "bg-1",
    command: "tail -f app.log",
    description: "看日志",
    cwd: "/w",
    output_file: TASK_FILE,
    tool_call_id: "call-bg",
  });
  state = project(state, EXT_EVENT.taskCompleted, {
    sessionUpdate: "task_completed",
    task_snapshot: {
      task_id: "bg-1",
      command: "tail -f app.log",
      description: "看日志",
      cwd: "/w",
      output_file: TASK_FILE,
      output: "line-1",
      exit_code: 0,
      completed: true,
      start_time: STARTED,
    },
  });
  state = project(state, EXT_EVENT.taskBackgrounded, {
    sessionUpdate: "task_backgrounded",
    task_id: "mon-1",
    command: "[monitor] ping",
    monitor_description: "测试监控",
    cwd: "/w",
    output_file: MONITOR_FILE,
    tool_call_id: "call-mon",
  });
  state = project(state, EXT_EVENT.monitorEvent, {
    sessionUpdate: "monitor_event",
    task_id: "mon-1",
    event_text: "beat",
  });

  const tasks = sessionOf(state).backgroundTasks;
  const finished = tasks["bg-1"];
  const monitor = tasks["mon-1"];
  assert.ok(finished);
  assert.ok(monitor);
  assert.equal(finished.outputFile, TASK_FILE);
  assert.equal(monitor.outputFile, MONITOR_FILE);

  const finishedRecord = taskRecord(finished);
  const monitorRecord = taskRecord(monitor);
  assert.equal(finishedRecord.phase, "completed");
  assert.equal(finishedRecord.label, "看日志");
  assert.equal(finishedRecord.command, "tail -f app.log");
  assert.equal(finishedRecord.output, "line-1");
  assert.equal(finishedRecord.startedAtMs, 1_700_000_000_000);
  assert.equal(monitorRecord.phase, "running");
  assert.equal(monitorRecord.label, "测试监控");
  assert.equal(monitorRecord.command, "[monitor] ping");
  assert.equal(monitorRecord.output, "beat");
  assert.equal(Object.hasOwn(finishedRecord, "outputFile"), false);
  assert.equal(Object.hasOwn(monitorRecord, "outputFile"), false);

  const finishedTarget = taskOpenTarget(finished);
  const monitorTarget = taskOpenTarget(monitor);
  assert.deepEqual(finishedTarget, { surface: "task-record", taskId: "bg-1" });
  assert.deepEqual(monitorTarget, { surface: "task-record", taskId: "mon-1" });
  assert.equal(JSON.stringify(finishedTarget).includes(TASK_FILE), false);
  assert.equal(JSON.stringify(monitorTarget).includes(MONITOR_FILE), false);

  const watching = watchingBackgroundTasks(tasks).map((task) => task.taskId);
  assert.equal(watching.includes("bg-1"), false);
  assert.equal(watching.includes("mon-1"), true);
});

test("取消回执加上 subagent_finished 后，概览和目录用同一个已完成", () => {
  const notice = ["Subagent started in background.", "subagent_id: " + CHILD, "type: research", "description: Inspect references"].join("\n");
  let state = project(base(), "session/update", {
    sessionUpdate: "tool_call",
    toolCallId: "spawn-cancel",
    title: "spawn_subagent",
    status: "completed",
    kind: "other",
    content: [{ type: "content", content: { type: "text", text: notice } }],
  });
  state = reduce(state, { type: "subagent/cancel-resolved", sessionId: "s", subagentId: CHILD, outcome: { kind: "cancelled" } });
  const before = agentBlocks(sessionOf(state));
  assert.equal(sessionOf(state).subagentCancel[CHILD]?.kind, "cancelled");
  assert.equal(before[0]?.running, true);
  assert.equal(agentWorkPhrase(before[0]!), "正在工作");

  state = project(state, EXT_EVENT.sessionUpdate, {
    sessionUpdate: "subagent_finished",
    subagent_id: CHILD,
    status: "cancelled",
    output: "已停下",
  });
  const views = agentBlocks(sessionOf(state));
  const overview = overviewAgents(views, sessionOf(state).subagentProgress);
  const directoryPhrase = agentWorkPhrase(views[0]!);
  const overviewPhrase = agentWorkPhrase(overview[0]!);
  console.log("agent phrase after cancel+finished", directoryPhrase, overviewPhrase);
  assert.equal(directoryPhrase, "已完成");
  assert.equal(overviewPhrase, directoryPhrase);
  assert.equal(overviewPhrase.includes("cancelled"), false);
  assert.equal(runningAgentRows(views.map((row) => ({ ...row, activity: null }))).length, 0);
});

test("already_exited 显示已完成并且离开运行中胶囊", () => {
  let state = project(base(), EXT_EVENT.taskBackgrounded, {
    sessionUpdate: "task_backgrounded",
    task_id: "gone",
    command: "sleep 30",
    description: "会自己结束",
  });
  state = reduce(state, { type: "task/kill-resolved", sessionId: "s", taskId: "gone", outcome: "already_exited" });
  const gone = sessionOf(state).backgroundTasks.gone;
  assert.ok(gone);
  assert.equal(gone.status, "running");
  assert.equal(gone.killOutcome, "already_exited");
  const phrase = taskStatusPhrase(gone);
  console.log("kill outcome phrase", phrase);
  assert.equal(phrase, "已完成");
  assert.equal(taskRecord(gone).phase, "completed");
  assert.equal(phrase.includes("already_exited"), false);
  assert.equal(createWatchingSelector("s")(state).some((task) => task.taskId === "gone"), false);

  state = project(state, EXT_EVENT.taskBackgrounded, {
    sessionUpdate: "task_backgrounded",
    task_id: "stopping",
    command: "sleep 9",
    description: "正在停",
  });
  state = reduce(state, { type: "task/kill-resolved", sessionId: "s", taskId: "stopping", outcome: "killed" });
  const stopping = sessionOf(state).backgroundTasks.stopping;
  assert.ok(stopping);
  assert.equal(taskStatusPhrase(stopping), "正在终止");
  assert.equal(createWatchingSelector("s")(state).some((task) => task.taskId === "stopping"), true);
});
