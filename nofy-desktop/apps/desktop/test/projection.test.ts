/**
 * S1b 回放门：把 golden-turn.jsonl 灌进投影层，断言**终态**。
 *
 * 这是 PLAN.md §5 说的「改坏了立刻红」那道门。所有期望值都来自实测夹具
 * （docs/contract/session-events-measured.md），不是设计意图。
 * 复现载荷形状：node apps/desktop/scripts/inspect-payloads.ts
 */
import assert from "node:assert/strict";
import test from "node:test";
import type { InboundFrame } from "@nofy-desktop/acp";
import { fixtureExists, loadFixture as loadFixtureNamed, replay } from "./helpers/replay.ts";
import type { AppState, Block } from "../renderer/core/store/state.ts";

const FIXTURE_NAME = "golden-turn.jsonl";
const has = fixtureExists(FIXTURE_NAME);
const skip = has ? false : "golden-turn.jsonl 未录制；跑 pnpm record";

function load(): ReturnType<typeof import("./helpers/replay.ts").loadFixture> {
  return loadFixtureNamed(FIXTURE_NAME);
}
function replayFixtureLocal(): AppState {
  return replay(load());
}
function blocksOf(s: AppState, kind: Block["kind"]): Block[] {
  return Object.values(s.sessions).flatMap((sess) => sess.blocks.filter((b) => b.kind === kind));
}
function text(b: Block): string {
  return b.kind === "agent-message" || b.kind === "user-message" || b.kind === "agent-thought" ? b.text : "";
}

test("fixture present", { skip }, () => assert.ok(has));

test("zero unhandled: every event in the fixture is mapped", { skip }, () => {
  const s = replayFixtureLocal();
  assert.deepEqual(s.unhandled, {}, "出现未映射事件——契约漂移，须补投影分支或复核实测账");
});

test("connection state hydrated from initialize", { skip }, () => {
  const s = replayFixtureLocal();
  assert.equal(s.connection.status, "ready");
  assert.equal(s.connection.agentVersion, "0.2.121");
  assert.deepEqual(s.connection.promptCapabilities, { image: false, audio: false, embeddedContext: true });
  assert.equal(s.connection.initialCommands.length, 7, "initialize 只给 7 条命令");
});

test("session created with cwd and model from session/new", { skip }, () => {
  const s = replayFixtureLocal();
  const sessions = Object.values(s.sessions);
  assert.equal(sessions.length, 1);
  const sess = sessions[0]!;
  assert.equal(sess.modelId, "qwen3-coder-plus", "model_changed 应把模型落到会话上");
  assert.equal(sess.cwd, "<WORKSPACE>", "cwd 应来自 session/new 的 _meta（夹具里已脱敏为占位）");
  assert.equal(s.activeSessionId, sess.id);
});

test("spine shape: 1 user block, 2 agent blocks, 1 tool block", { skip }, () => {
  const s = replayFixtureLocal();
  // 〔实测〕14 个 agent_message_chunk 被 2 次 response_completed 切成 **2** 段
  //（工具调用前 7 个、后 7 个）——这是脊柱「文本→工具→文本」的正确形状。
  assert.equal(blocksOf(s, "user-message").length, 1);
  assert.equal(blocksOf(s, "agent-message").length, 2, "response_completed 应把 agent 块切成 2 段");
  // 〔实测〕5 个 tool_call_delta_chunk 里只有第 1 个带 tool_call_id，后 4 个只带
  // tool_index ⇒ 必须按 index 关联，否则会多出 toolCallId="" 的幽灵块。
  assert.equal(blocksOf(s, "tool-call").length, 1, "delta 帧应按 tool_index 关联到同一个块");
  // 顺序：user → agent → tool → agent
  const sess = Object.values(s.sessions)[0]!;
  const kinds = sess.blocks.filter((b) => b.kind !== "event").map((b) => b.kind);
  assert.deepEqual(kinds, ["user-message", "agent-message", "tool-call", "agent-message"]);
  // 〔实测〕hook_execution ×5 作为事件块保留（session_start / user_prompt_submit /
  // pre_tool_use / post_tool_use / stop），不静默丢弃
  assert.equal(sess.blocks.filter((b) => b.kind === "event").length, 5);
});

test("agent text reassembles across chunks and contains the file's first line", { skip }, () => {
  const s = replayFixtureLocal();
  const all = blocksOf(s, "agent-message").map(text).join("");
  assert.match(all, /quick brown fox/);
  // 两段都非空（前段是「我要读文件」，后段是答案）
  const segs = blocksOf(s, "agent-message").map(text);
  assert.ok(segs.every((x) => x.length > 0), "有空的 agent 段: " + JSON.stringify(segs));
});

test("both agent blocks are closed and carry SEGMENT usage (snake_case source)", { skip }, () => {
  const s = replayFixtureLocal();
  const agents = blocksOf(s, "agent-message");
  assert.ok(agents.every((b) => b.kind === "agent-message" && b.closed), "response_completed 应关闭 agent 块");
  const first = agents[0];
  assert.ok(first !== undefined && first.kind === "agent-message");
  // 〔实测〕第一段 response_completed.usage = {input_tokens:22042, output_tokens:42, …}
  assert.equal(first.usage?.inputTokens, 22042);
  assert.equal(first.usage?.outputTokens, 42);
});

test("tool block merges delta + tool_call + tool_call_update (name ≠ title)", { skip }, () => {
  const s = replayFixtureLocal();
  const tools = blocksOf(s, "tool-call");
  assert.equal(tools.length, 1);
  const tb = tools[0]!;
  assert.ok(tb.kind === "tool-call");
  // 〔实测〕tool_call.title = "read_file"（原始工具名）；
  //         tool_call_update.title = "Read \`hello.txt\`"（展示标题）——语义不同，分开存
  assert.equal(tb.name, "read_file");
  assert.equal(tb.title, "Read \`hello.txt\`");
  assert.equal(tb.toolKind, "read", "kind 只在 tool_call_update 里，首帧没有");
  assert.equal(tb.interactionPending, false, "interaction_resolved 应清掉 pending");
  assert.equal(tb.interactionKind, "permission", "pending_interaction 带的 kind 应保留");
});

test("tool block exists even though delta chunks arrive BEFORE tool_call", { skip }, () => {
  // 〔实测时间轴〕tool_call_delta_chunk 3014ms 早于 tool_call 3226ms。
  // 若投影层只在 tool_call 时建块，delta 会丢。这里验证块被正确合并且 argsDelta 有累积位。
  const s = replayFixtureLocal();
  const tb = blocksOf(s, "tool-call")[0]!;
  assert.ok(tb.kind === "tool-call");
  assert.equal(tb.toolCallId.length > 0, true, "不得留下 toolCallId 为空的幽灵块");
  // 〔实测〕5 个 delta 的 arguments_delta 长度依次为 0/26/0/2/0 ⇒ 累积 28 字符
  assert.equal(tb.argsDelta.length, 28, "流式参数应按 tool_index 累积到同一块");
});

test("turn_completed sets idle + stopReason + TURN usage (camelCase source)", { skip }, () => {
  const s = replayFixtureLocal();
  const sess = Object.values(s.sessions)[0]!;
  assert.equal(sess.agentState, "idle");
  assert.equal(sess.stopReason, "end_turn");
  // 〔实测〕turn_completed.usage 是 camelCase 且字段集比段级大
  assert.equal(sess.turnUsage?.totalTokens, 44355);
  assert.equal(sess.turnUsage?.modelCalls, 2);
  assert.equal(sess.turnUsage?.numTurns, 2);
  assert.equal(sess.turnUsage?.apiDurationMs, 4088);
  assert.equal(sess.turnUsage?.cachedReadTokens, 22016);
  assert.equal(sess.openAgentBlockId, null, "收尾后不该有开着的 agent 块");
});

test("turn usage and segment usage are NOT conflated (different shapes)", { skip }, () => {
  const s = replayFixtureLocal();
  const sess = Object.values(s.sessions)[0]!;
  const agent = blocksOf(s, "agent-message")[0]!;
  assert.ok(agent.kind === "agent-message" && agent.usage !== null);
  // 轮级 totalTokens 44355 ≠ 段级 input+output；两者不得互相替代
  assert.notEqual(sess.turnUsage?.totalTokens, agent.usage.inputTokens + agent.usage.outputTokens);
  // 段级没有 modelCalls/numTurns 这些轮级字段
  assert.equal("modelCalls" in agent.usage, false);
});

test("title lands from either rail (both fired at the same ms)", { skip }, () => {
  const s = replayFixtureLocal();
  const sess = Object.values(s.sessions)[0]!;
  assert.ok(sess.title !== null && sess.title.length > 0, "标题应已生成");
  assert.ok(sess.titleSource === "session_info_update" || sess.titleSource === "session_summary_generated");
  assert.match(sess.title!, /hello\.txt/);
});

test("command table comes from available_commands_update (167), not initialize (7)", { skip }, () => {
  const s = replayFixtureLocal();
  const sess = Object.values(s.sessions)[0]!;
  assert.equal(sess.availableCommands.length, 167);
  assert.equal(s.connection.initialCommands.length, 7);
  // 〔实测〕4 次 available_commands_update 的 _meta.tools 长度递增，最后一次为 38
  //（首帧是 25；投影取最后一次，故断言 38）
  assert.equal(sess.availableTools.length, 38, "_meta.tools 应取最后一次 available_commands_update 的值");
  assert.ok(sess.availableTools.includes("run_terminal_command"));
});

test("roster / queue / mcp side-state populated", { skip }, () => {
  const s = replayFixtureLocal();
  assert.equal(Object.keys(s.roster).length, 1, "sessions/changed upserted[1]");
  const sess = Object.values(s.sessions)[0]!;
  assert.ok(sess.queueEntries.length >= 0);
  assert.equal(s.mcpServers.length, 1, "mcp/servers_updated 带 mcpServers[1]");
});

test("dedup high-water advanced and replaying the fixture does not double eventId-bearing content", { skip }, () => {
  const recs = load();
  const once = replay(recs);
  const sess1 = Object.values(once.sessions)[0]!;
  assert.ok(sess1.lastEventSeq > 0, "eventId 高水位应已推进");
  const textOnce = blocksOf(once, "agent-message").map(text).join("");

  // 重放同一份夹具（模拟重连后内核重发持久轨）
  const twice = replay(recs, once);
  const sess2 = Object.values(twice.sessions)[0]!;
  const textTwice = blocksOf(twice, "agent-message").map(text).join("");
  assert.equal(textTwice, textOnce, "带 eventId 的 agent chunk 被重复应用了——去重失效");
  assert.equal(blocksOf(twice, "agent-message").length, 2, "重放不该新增 agent 块");
  assert.equal(sess2.lastEventSeq, sess1.lastEventSeq);
});

test("T10 guard: events WITHOUT eventId survive replay (title/model must not be dropped)", { skip }, () => {
  const recs = load();
  const once = replay(recs);
  const twice = replay(recs, once);
  const sess = Object.values(twice.sessions)[0]!;
  // session_info_update 与 model_changed 都不带 eventId（session-events-measured.md §3）。
  // 若对它们套用去重，重放后标题与模型会被丢弃——那正是陷阱 T10。
  assert.ok(sess.title !== null && sess.title.length > 0);
  assert.equal(sess.modelId, "qwen3-coder-plus");
});

test("legacy prompt_complete is NOT used as the turn-end signal", { skip }, () => {
  // 陷阱 T5：把夹具里 turn_completed 之后的 prompt_complete 去掉，终态必须不变。
  const recs = load();
  const full = replay(recs);
  const withoutPc = replay(
    recs.filter((r) => !(r.frame.kind === "notification" && r.frame.method === "_nofy/session/prompt_complete")),
  );
  const a = Object.values(full.sessions)[0]!;
  const b = Object.values(withoutPc.sessions)[0]!;
  assert.equal(a.agentState, b.agentState);
  assert.equal(a.stopReason, b.stopReason);
  assert.deepEqual(a.turnUsage, b.turnUsage);
  assert.equal(a.lastEventSeq, b.lastEventSeq);
});

test("appliedEvents accounts for every notification", { skip }, () => {
  const recs = load();
  const s = replay(recs);
  const notifications = recs.filter((r) => r.frame.kind === "notification").length;
  assert.ok(s.appliedEvents >= notifications, "appliedEvents(" + String(s.appliedEvents) + ") 应不少于通知数(" + String(notifications) + ")");
});



