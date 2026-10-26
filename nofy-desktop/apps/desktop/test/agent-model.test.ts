/**
 * agentModel 门：子智能体块的折法（spawn 通知 / 模型面页脚 / 轮询 join / 哈希色 / 运行态 / 汇总）。
 *
 * 样本逐字抄内核：format_resume_footer（nofy-tool-types task.rs:421）与真轮次抓到的
 * 后台派发通知 / rawOutput TaskOutput.Result 形态（zcode-live-metrics.md §1.9 落地批）。
 */
import test from "node:test";
import assert from "node:assert/strict";
import {
  AGENT_COLOR_PALETTE,
  agentBlocks,
  agentSummary,
  agentView,
  agentWorkPhrase,
  directoryAgents,
  runningAgentRows,
  cleanAgentOutput,
  presentAgentOutput,
  hashToAgentColor,
  isAgentBlock,
  linkedPollBlockIds,
  parseSpawnNotice,
  parseSubagentFooter,
  parseTaskResult,
  stripSubagentFooter,
} from "../renderer/features/conversation/agentModel.ts";
import type { AgentRow } from "../renderer/features/conversation/agentModel.ts";
import type { Block, SessionState, SubagentFinishedInfo, TurnRecord } from "../renderer/core/store/state.ts";

const FOOTER =
  "<subagent_result>\n" +
  "subagent_id: 019e0000-0000-7000-8000-0000000000bb\n" +
  "subagent_type: explore\n" +
  "To continue this subagent's conversation, use resume_from=\"019e0000-0000-7000-8000-0000000000bb\".\n" +
  "</subagent_result>";

const NOTICE =
  "Subagent started in background.\n" +
  "subagent_id: 01a08d44-733b-7881-bef1-12c0ab2fb13e\n" +
  "type: explore\n" +
  "description: 列出工作区顶层目录\n" +
  "\n" +
  'Use get_command_or_subagent_output with task_ids=["01a08d44-733b-7881-bef1-12c0ab2fb13e"] and timeout_ms to wait for results.';

const POLL_RAW = {
  type: "TaskOutput",
  Result: {
    task_id: "01a08d44-733b-7881-bef1-12c0ab2fb13e",
    command: "[subagent:explore] 列出工作区顶层目录",
    status: "completed",
    exit_code: 0,
    duration_secs: 3.098,
    output: "顶层目录：apps、docs、packages、tests",
  },
};

type ToolBlockT = Extract<Block, { kind: "tool-call" }>;

function mkTool(status: string | null, extra: Partial<ToolBlockT> = {}): ToolBlockT {
  return {
    kind: "tool-call",
    id: "tool:t1",
    toolCallId: "t1",
    name: "spawn_subagent",
    title: null,
    toolKind: "other",
    status,
    rawInput: null,
    locations: [],
    argsDelta: "",
    resultText: null,
    rawOutput: null,
    interactionPending: false,
    interactionKind: null,
    ...extra,
  };
}

function mkPoll(extra: Partial<ToolBlockT> = {}): ToolBlockT {
  return mkTool("completed", {
    id: "tool:p1",
    toolCallId: "p1",
    name: "get_command_or_subagent_output",
    title: "Get task output: 01a08d44",
    ...extra,
  });
}

function mkSession(
  blocks: Block[],
  turns: TurnRecord[] = [],
  subagentFinished: Record<string, SubagentFinishedInfo> = {},
): SessionState {
  return {
    id: "s1",
    cwd: null,
    title: null,
    modelId: null,
    agentState: "idle",
    blocks,
    turns,
    subagentFinished,
    appliedEvents: 0,
    lastEventSeq: null,
    toolIndexToId: {},
    queueEntries: [],
  } as unknown as SessionState;
}

function mkUser(id: string, text = "派一个后台子智能体"): Extract<Block, { kind: "user-message" }> {
  return { kind: "user-message", id, text, promptIndex: null, modelId: null };
}

function mkAgentMsg(id: string, text = "好的，已派发，本轮到此结束"): Extract<Block, { kind: "agent-message" }> {
  return { kind: "agent-message", id, text, closed: true, usage: null };
}

/** 目录行 = agentBlocks join + activity 补 null（App.tsx 里由 roster join，这里只关心 running/blockId）。 */
function rowsOf(s: SessionState): AgentRow[] {
  return agentBlocks(s).map((a) => ({ ...a, activity: null }));
}

test("spawn 通知：subagent_id / type / description 三行", () => {
  assert.deepEqual(parseSpawnNotice(NOTICE), {
    subagentId: "01a08d44-733b-7881-bef1-12c0ab2fb13e",
    subagentType: "explore",
    description: "列出工作区顶层目录",
  });
  assert.deepEqual(parseSpawnNotice("no notice"), { subagentId: null, subagentType: null, description: null });
});

test("模型面页脚：id / type / persona 三档解析（兼容保留）", () => {
  const base = parseSubagentFooter("answer\n\n" + FOOTER);
  assert.deepEqual(base, { subagentId: "019e0000-0000-7000-8000-0000000000bb", subagentType: "explore", persona: null });
  const withPersona = parseSubagentFooter(
    FOOTER.replace("</subagent_result>", "The subagent used persona=\"critic\". Pass the same persona when resuming.\n</subagent_result>"),
  );
  assert.equal(withPersona?.persona, "critic");
  assert.equal(parseSubagentFooter("x"), null);
});

test("strip：模型面页脚摘掉、正文保留", () => {
  assert.equal(stripSubagentFooter("正文一行\n" + FOOTER), "正文一行");
});

test("presentAgentOutput：纯派发通知不展示，通知后的正文和页脚正文保留", () => {
  assert.equal(presentAgentOutput(null, NOTICE), null);
  assert.equal(presentAgentOutput(NOTICE, NOTICE), null);
  assert.equal(presentAgentOutput(NOTICE, "目录已经列完"), "目录已经列完");
  assert.equal(presentAgentOutput(null, NOTICE + "\n\n目录已经列完"), "目录已经列完");
  const flat = NOTICE.replaceAll("\n", " ");
  assert.equal(presentAgentOutput(null, flat), null);
  assert.equal(presentAgentOutput(null, "目录已经列完\n" + FOOTER), "目录已经列完");
  assert.equal(presentAgentOutput("顶层目录：apps、docs", NOTICE), "顶层目录：apps、docs");
  assert.equal(presentAgentOutput(null, "Subagent started in background. Then we looked around."), "Subagent started in background. Then we looked around.");
});

test("cleanAgentOutput：meta 行 + 页脚一起摘（真轮次 Result.output 形态）", () => {
  const raw =
    "apps/\ndocs/\n\n" +
    "<subagent_meta>id=x, type=explore, tool_calls=1, turns=1, duration_ms=2664</subagent_meta>\n\n" +
    "<subagent_result>\nsubagent_id: x\nsubagent_type: explore\n</subagent_result>";
  assert.equal(cleanAgentOutput(raw), "apps/\ndocs/");
});

test("rawOutput：TaskOutput.Result 逐字键名", () => {
  const r = parseTaskResult(POLL_RAW);
  assert.equal(r?.taskId, "01a08d44-733b-7881-bef1-12c0ab2fb13e");
  assert.equal(r?.status, "completed");
  assert.equal(r?.output, "顶层目录：apps、docs、packages、tests");
  assert.equal(r?.durationSecs, 3.098);
  assert.equal(parseTaskResult(null), null);
  assert.equal(parseTaskResult({ type: "TaskOutput" }), null);
});

test("哈希色：稳定且落在八色盘里", () => {
  const c1 = hashToAgentColor("explore");
  assert.equal(c1, hashToAgentColor("explore"));
  assert.ok((AGENT_COLOR_PALETTE as readonly string[]).includes(c1));
});

test("运行态：派发后无轮询结果=运行中；轮询 completed=结束；failed=失败", () => {
  const spawned = agentView(mkTool("completed", { resultText: NOTICE }), null);
  assert.equal(spawned.running, true);
  assert.equal(spawned.subagentId, "01a08d44-733b-7881-bef1-12c0ab2fb13e");
  assert.equal(spawned.subagentType, "explore");
  assert.equal(spawned.description, "列出工作区顶层目录");
  assert.equal(spawned.output, null);
  const polled = agentView(mkTool("completed", { resultText: NOTICE }), mkPoll({ rawOutput: POLL_RAW }));
  assert.equal(polled.running, false);
  assert.equal(polled.output, "顶层目录：apps、docs、packages、tests");
  assert.equal(polled.durationSecs, 3.098);
  const bad = agentView(mkTool("failed"), null);
  assert.equal(bad.failed, true);
  assert.equal(bad.running, false);
});

test("轮询 join：task_id / 入参 task_ids / 标题短 id 三路", () => {
  const spawn = mkTool("completed", { id: "tool:s", toolCallId: "s", resultText: NOTICE });
  const pollByRaw = mkPoll({ rawOutput: POLL_RAW });
  const pollByArgs = mkPoll({ id: "tool:p2", toolCallId: "p2", rawInput: { task_ids: ["01a08d44-733b-7881-bef1-12c0ab2fb13e"] } });
  const pollByTitle = mkPoll({ id: "tool:p3", toolCallId: "p3", title: "[subagent:explore] 列出工作区顶层目录 (01a08d44)" });
  const unrelated = mkPoll({ id: "tool:p4", toolCallId: "p4", title: "Get task output: deadbeef" });
  const session = mkSession([spawn, unrelated, pollByRaw, pollByArgs, pollByTitle]);
  const views = agentBlocks(session);
  assert.equal(views.length, 1);
  assert.equal(views[0]?.running, false); // 收到最后一个匹配轮询（p3 无 rawOutput？取最后匹配=p3）
  const linked = linkedPollBlockIds(session);
  assert.ok(linked.has("tool:p1"));
  assert.ok(linked.has("tool:p2"));
  assert.ok(linked.has("tool:p3"));
  assert.ok(!linked.has("tool:p4"));
});

test("回放把工具名收成标题后，派发通知和轮询结果仍进目录", () => {
  const spawn = mkTool("completed", {
    id: "tool:s",
    toolCallId: "s",
    name: "测试子agent勘察工作区",
    title: "测试子agent勘察工作区",
    resultText: NOTICE,
  });
  const poll = mkTool("completed", {
    id: "tool:p",
    toolCallId: "p",
    name: "[subagent:explore] 列出工作区顶层目录 (01a08d44)",
    title: "[subagent:explore] 列出工作区顶层目录 (01a08d44)",
    rawOutput: POLL_RAW,
    resultText: null,
  });
  assert.equal(isAgentBlock(spawn), true);
  assert.equal(isAgentBlock(poll), false);
  const views = agentBlocks(mkSession([spawn, poll]));
  assert.equal(views.length, 1);
  assert.equal(views[0]?.subagentId, "01a08d44-733b-7881-bef1-12c0ab2fb13e");
  assert.equal(views[0]?.running, false);
  assert.equal(views[0]?.output, "顶层目录：apps、docs、packages、tests");
  const listed = directoryAgents(views.map((row) => ({ ...row, activity: null })), {}, {});
  assert.equal(listed.length, 1);
  assert.equal(agentWorkPhrase(listed[0]!), "已完成");
});

test("只有启动清单和结束事件时，目录仍列出已完成的子智能体", () => {
  const rows = directoryAgents([], {
    child: {
      subagentId: "child", parentSessionId: null, childSessionId: null, subagentType: "explore",
      description: "测试子agent勘察工作区", startedAtEpochMs: null, durationMs: null, turnCount: 1,
      toolCallCount: 2, tokensUsed: null, contextWindowTokens: null, contextUsagePct: null,
      toolsUsed: [], errorCount: null, restoredFromReplay: true,
    },
  }, { child: { status: "completed", error: null, durationMs: 9029, output: "勘察结果" } });
  assert.equal(rows.length, 1);
  assert.equal(rows[0]?.subagentId, "child");
  assert.equal(agentWorkPhrase(rows[0]!), "已完成");
  assert.equal(rows[0]?.output, "勘察结果");
  assert.equal(rows[0]?.description, "测试子agent勘察工作区");
});

test("agentBlocks：非 task 块不进；流式阶段 argsDelta 顶替提示词位", () => {
  const read = mkTool("completed", { toolKind: "read", name: "read_file" });
  assert.equal(isAgentBlock(read), false);
  const streaming = mkTool(null, { argsDelta: "streaming" });
  const v = agentView(streaming, null);
  assert.equal(v.streamingArgs, "streaming");
  const session = mkSession([read, streaming]);
  assert.equal(agentBlocks(session).length, 1);
  assert.equal(agentBlocks(null).length, 0);
});

test("汇总计数：总数 / 运行中 / 失败", () => {
  const s = agentSummary([
    agentView(mkTool("completed", { resultText: NOTICE }), null),
    agentView(mkTool("completed", { resultText: NOTICE }), mkPoll({ rawOutput: POLL_RAW })),
    agentView(mkTool("failed"), null),
  ]);
  assert.deepEqual(s, { total: 3, running: 1, failed: 1 });
});

test("runningAgentRows：回合内与 detached 的 running 都进胶囊；轮询终态/subagent_finished 后消失", () => {
  // 一个 running 的 spawn 块（无轮询结果 ⇒ running=true），夹在 user 开回合与最终答案之间
  const spawn = mkTool("completed", { id: "tool:bg", toolCallId: "bg", resultText: NOTICE });
  const blocks = [mkUser("u1"), spawn, mkAgentMsg("a1")] as Block[];

  // 1) 回合仍开着（in-turn）且子智能体 running ⇒ 进胶囊（活壳实机：v4-stop 在位时胶囊已显示）
  const inTurn = mkSession(blocks, [{ startedAt: 1000, endedAt: null }]);
  assert.equal(rowsOf(inTurn)[0]?.running, true); // 前置：块确实在跑
  const it = runningAgentRows(rowsOf(inTurn));
  assert.equal(it.length, 1);
  assert.equal(it[0]?.blockId, "tool:bg");

  // 2) 回合已结束（detached）仍 running ⇒ 同样进胶囊
  const detached = mkSession(blocks, [{ startedAt: 1000, endedAt: 2000 }]);
  assert.equal(runningAgentRows(rowsOf(detached)).length, 1);

  // 3) 轮询 completed ⇒ running 翻 false ⇒ 胶囊消失
  const doneBlocks = [mkUser("u1"), spawn, mkPoll({ rawOutput: POLL_RAW }), mkAgentMsg("a1")] as Block[];
  const done = mkSession(doneBlocks, [{ startedAt: 1000, endedAt: 2000 }]);
  assert.equal(rowsOf(done)[0]?.running, false);
  assert.deepEqual(runningAgentRows(rowsOf(done)), []);

  // 4) 无 running 行 ⇒ []（不画空胶囊）
  assert.deepEqual(runningAgentRows([]), []);

  // 5) detached 且内核已发 subagent_finished(completed) ⇒ running 翻 false ⇒ 胶囊消失
  //    （detached 无轮询帧，subagent_finished 是它结束的唯一桌面信号；不接则胶囊永不消失）
  const finishedMap: Record<string, SubagentFinishedInfo> = {
    "01a08d44-733b-7881-bef1-12c0ab2fb13e": { status: "completed", error: null, durationMs: 2664, output: "共 42 个 .ts 文件" },
  };
  const doneDetached = mkSession(blocks, [{ startedAt: 1000, endedAt: 2000 }], finishedMap);
  assert.equal(rowsOf(doneDetached)[0]?.running, false);
  assert.equal(rowsOf(doneDetached)[0]?.output, "共 42 个 .ts 文件");
  assert.deepEqual(runningAgentRows(rowsOf(doneDetached)), []);
});
