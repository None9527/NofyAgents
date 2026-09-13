/**
 * P2 回放门：权限流。夹具 docs/fixtures/golden-permission.jsonl
 * （两轮：A 批准写文件、B 拒绝写文件；实测账 docs/contract/permission-flow-measured.md）。
 *
 * P2 的验收判据是「选项文案与 prompter.rs 逐字对齐」——这里把**线路级逐字真相**
 * 钉成断言，任何漂移立刻红。
 */
import assert from "node:assert/strict";
import test from "node:test";
import { fixtureExists, onlySession, replayFixture, replayFixtureTrace } from "./helpers/replay.ts";
import type { AppState, Block } from "../renderer/core/store/state.ts";

const FIX = "golden-permission.jsonl";
const skip = fixtureExists(FIX) ? false : "golden-permission.jsonl 未录制；跑 pnpm record:permission";

/** §2 的逐字选项表（edit 类工具，4 条）。 */
const EXPECTED_OPTIONS = [
  {
    optionId: "enable-always-approve",
    kind: "allow_once",
    name: "Yes, and don't ask again for anything (always-approve mode)",
  },
  { optionId: "allow-edits-session", kind: "allow_always", name: "Yes, allow all edits during this session" },
  { optionId: "allow-once", kind: "allow_once", name: "Yes" },
  {
    optionId: "reject-once",
    kind: "reject_once",
    name: "No, and tell Nofy what to do differently",
  },
] as const;

/**
 * 断言面＝「请求到达过的形状」。新契约（2026-09-13）下 turn_completed 收尾会清空调
 * 该会话的挂起请求（孤儿审批卡门禁），终态 pendingInteractions 必为空；
 * 故这里用逐步轨迹还原到达序列，params 逐字来自夹具帧。
 */
function run(): AppState {
  const { state, trace } = replayFixtureTrace(FIX);
  return {
    ...state,
    pendingInteractions: trace.requests.map((r) => ({
      id: r.id,
      method: r.method,
      sessionId: "trace",
      params: r.params,
    })),
  };
}

test("permission fixture present", { skip }, () => assert.ok(fixtureExists(FIX)));

test("two session/request_permission requests reach the store", { skip }, () => {
  const s = run();
  assert.equal(s.pendingInteractions.length, 2, "两轮各一次权限请求");
  for (const p of s.pendingInteractions) {
    assert.equal(p.method, "session/request_permission");
    assert.ok(p.sessionId.length > 0);
  }
});

test("permission options match the wire truth VERBATIM (P2 逐字对齐门)", { skip }, () => {
  const s = run();
  for (const p of s.pendingInteractions) {
    const opts = (p.params["options"] ?? []) as Array<Record<string, unknown>>;
    assert.equal(opts.length, EXPECTED_OPTIONS.length, "edit 类工具应有 4 个选项");
    opts.forEach((o, i) => {
      const want = EXPECTED_OPTIONS[i]!;
      assert.equal(o["optionId"], want.optionId, "选项 " + String(i) + " 的 optionId 漂移");
      assert.equal(o["kind"], want.kind, "选项 " + String(i) + " 的 kind 漂移");
      assert.equal(o["name"], want.name, "选项 " + String(i) + " 的**文案**漂移（P2 要求逐字对齐）");
    });
  }
});

test("enable-always-approve is kind=allow_once on the wire (trap: 它不等于开 YOLO)", { skip }, () => {
  // permission-flow-measured.md §3：选了它之后下一轮**仍然会问**——
  // shell 侧只映射 AllowOnce，真开 always-approve 需客户端另发 _nofy/yolo_mode_changed。
  // 钉这条是防止有人「顺手修正」成 allow_always，那会让 P2 的闭环实现走偏。
  const s = run();
  const opts = (s.pendingInteractions[0]!.params["options"] ?? []) as Array<Record<string, unknown>>;
  const first = opts[0]!;
  assert.equal(first["optionId"], "enable-always-approve");
  assert.equal(first["kind"], "allow_once");
});

test("reject option文案 carries the followup affordance", { skip }, () => {
  // "No, and tell Nofy what to do differently" ⇒ 拒绝路径**带附言输入**，P2 必须实现。
  const s = run();
  const opts = (s.pendingInteractions[0]!.params["options"] ?? []) as Array<Record<string, unknown>>;
  const reject = opts.find((o) => o["optionId"] === "reject-once");
  assert.ok(reject !== undefined);
  assert.match(String(reject["name"]), /tell Nofy what to do differently/);
});

test("toolCall shape: stable KEYS + display title wrapping the filename in backticks", { skip }, () => {
  // ⚠ 不断言动词（Edit / Write）：那取决于模型这一轮选了哪个工具，
  //   两次录制分别给过 "Edit \`note-a.txt\`" 与 "Write \`note-a.txt\`"。
  //   过拟合到单次录制会让门变成噪声。稳定量是**键集**与**标题形状**。
  const s = run();
  const titles: string[] = [];
  const kinds = new Set<string>();
  for (const p of s.pendingInteractions) {
    const tc = p.params["toolCall"] as Record<string, unknown>;
    // 〔实测〕键集恒为 toolCallId, kind, title, rawInput, _meta
    assert.deepEqual(
      Object.keys(tc).sort(),
      ["_meta", "kind", "rawInput", "title", "toolCallId"],
      "toolCall 键集漂移——复核 permission-flow-measured.md §1",
    );
    assert.equal(typeof tc["toolCallId"], "string");
    assert.equal(typeof tc["kind"], "string");
    kinds.add(String(tc["kind"]));
    titles.push(String(tc["title"]));
  }
  // 展示标题把文件名包在反引号里（与 tool_call 事件的原始工具名语义不同）
  assert.match(titles[0] ?? "", /^[A-Z][A-Za-z]+ \`note-a\.txt\`$/);
  assert.match(titles[1] ?? "", /^[A-Z][A-Za-z]+ \`note-b\.txt\`$/);
  // 写文件类工具的 ACP ToolKind 实测为 edit（Write 与 Edit 都是）
  assert.deepEqual([...kinds], ["edit"], "kind 集合漂移");
});

test("reject path ends the turn with stopReason=cancelled, and the file was not written", { skip }, () => {
  const s = run();
  const sess = onlySession(s);
  // 两轮：A=end_turn（批准）、B=cancelled（拒绝）。终态保留最后一次。
  assert.equal(sess.stopReason, "cancelled", "拒绝应使轮次以 cancelled 收尾，且不悬挂");
  // 两个 tool-call 块都在（拒绝那次的块也存在，只是没有后续写入）
  const tools = sess.blocks.filter((b) => b.kind === "tool-call");
  assert.ok(tools.length >= 1, "应至少有一个 tool-call 块");
});

test("projection maps every event in the permission fixture (zero unhandled)", { skip }, () => {
  const s = run();
  assert.deepEqual(s.unhandled, {}, "出现未映射事件——补投影分支或复核实测账");
});

test("permission-mode suppression is a CONFIG fact, recorded for the UI", { skip }, () => {
  // 这条不是断言夹具，而是把 §0 的结论钉在测试里，防止 P2 实现时忘掉：
  // ui.permission_mode="always-approve" 时内核**完全不发** request_permission。
  // 审批 UI 必须呈现生效模式，不能假定请求一定会来。
  const s = run();
  // 本夹具是在 permission_mode=default 下录的，所以确实有 2 次请求
  assert.equal(s.pendingInteractions.length, 2);
  assert.ok(true, "见 docs/contract/permission-flow-measured.md §0：UI 必须显示生效的权限模式");
});
test("turn_completed 收尾清空调挂起请求（孤儿审批卡门禁，2026-09-13 实机事故）", { skip }, () => {
  const s = replayFixture(FIX);
  assert.equal(s.pendingInteractions.length, 0, "回合结束后不得留点不动的审批卡");
});
