/**
 * 去重回放门：live 段之后再灌 replay 段，断言**状态零重复**。
 *
 * 这是 PLAN §13 把 replay 排在补夹具第一位的原因：去重高水位此前只有
 * 「同一 epoch 内单调递增」一条证据，而「重连后内核重放持久轨」完全未实测。
 * 实测结论见 docs/contract/replay-dedup-measured.md。
 *
 * 夹具三段：live（建会话+跑一轮）/ replay（SIGKILL 重连后 session/load）/
 * noreplay（同会话再 load 并带 _meta.noReplay:true）。
 */
import assert from "node:assert/strict";
import test from "node:test";
import { byPhase, fixtureExists, loadFixture, onlySession, replay } from "./helpers/replay.ts";
import type { AppState, Block } from "../renderer/core/store/state.ts";

const FIX = "golden-replay.jsonl";
const skip = fixtureExists(FIX) ? false : "golden-replay.jsonl 未录制；跑 pnpm record:replay";

function texts(s: AppState, kind: Block["kind"]): string[] {
  return Object.values(s.sessions)
    .flatMap((sess) => sess.blocks)
    .filter((b) => b.kind === kind)
    .map((b) => (b.kind === "agent-message" || b.kind === "user-message" || b.kind === "agent-thought" ? b.text : ""));
}
function blockKinds(s: AppState): string[] {
  return Object.values(s.sessions).flatMap((sess) => sess.blocks.map((b) => b.kind));
}
function seqOf(id: string): number {
  return Number(id.slice(id.lastIndexOf("-") + 1));
}

const recs = fixtureExists(FIX) ? loadFixture(FIX) : [];
const liveRecs = byPhase(recs, "live");
const replayRecs = byPhase(recs, "replay");
const noReplayRecs = byPhase(recs, "noreplay");

test("replay fixture present with three phases", { skip }, () => {
  assert.ok(liveRecs.length > 0, "live 段为空");
  assert.ok(replayRecs.length > 0, "replay 段为空");
  assert.ok(noReplayRecs.length > 0, "noreplay 段为空");
});

test("live phase alone produces a usable session", { skip }, () => {
  const s = replay(liveRecs);
  const sess = onlySession(s);
  assert.equal(sess.agentState, "idle");
  assert.equal(sess.stopReason, "end_turn");
  assert.ok(sess.lastEventSeq > 0, "高水位应已推进");
  assert.ok(texts(s, "agent-message").join("").length > 0, "应有 agent 文本");
});

test("replaying the reconnect stream does NOT duplicate content (去重实证)", { skip }, () => {
  const liveOnly = replay(liveRecs);
  const combined = replay(replayRecs, liveOnly);

  // **内容块**必须零重复——这是「单一高水位去重」正确性的直接证据。
  assert.deepEqual(texts(combined, "agent-message"), texts(liveOnly, "agent-message"), "agent 文本被重复拼接");
  assert.deepEqual(texts(combined, "user-message"), texts(liveOnly, "user-message"), "user 文本被重复");

  // 但块**总数允许增加**：实测 session/load 会新产生 3 个 eventId（seq 9/10/11），
  // 其中 seq 10 是一次**真的又跑了一遍的 session_start hook**（见 inspect-replay-diff.ts
  // 输出与 replay-dedup-measured.md §2）。它不是重复，是新事件，必须上屏。
  const before = blockKinds(liveOnly);
  const after = blockKinds(combined);
  assert.ok(after.length >= before.length, "重放后块数不该减少");
  const added = after.length - before.length;
  // 前缀必须完全一致（新增只能追加在尾部，不得插进已有内容中间）
  assert.deepEqual(after.slice(0, before.length), before, "重放改变了已有块的顺序或种类");
  // 新增的必须全是 event 块（hook），不得是 user/agent 内容块
  const addedKinds = after.slice(before.length);
  assert.ok(
    addedKinds.every((k) => k === "event"),
    "重放新增了内容块（应为 0）：" + JSON.stringify(addedKinds),
  );
  assert.ok(added <= 3, "新增块数异常（实测应为 1，上限 3）：" + String(added));

  const a = onlySession(liveOnly);
  const b = onlySession(combined);
  assert.equal(b.title, a.title, "标题被重放改写");
  assert.equal(b.stopReason, a.stopReason);
  assert.deepEqual(b.turnUsage, a.turnUsage, "轮级用量被重放改写");
});

test("novel events in the replay ARE applied (去重不得过度)", { skip }, () => {
  // 实测：replay 段有 3 个 live 里没有的 eventId（seq 9/10/11 > live 的 max 8），
  // 它们是 load 自身产生的新事件。高水位必须放行，否则「重连后新事件全丢」。
  const liveOnly = replay(liveRecs);
  const combined = replay(replayRecs, liveOnly);
  assert.ok(
    combined.appliedEvents > liveOnly.appliedEvents,
    "重放段没有任何事件被应用——去重过度（applied " + String(liveOnly.appliedEvents) + " → " + String(combined.appliedEvents) + "）",
  );
  const b = onlySession(combined);
  const a = onlySession(liveOnly);
  assert.ok(b.lastEventSeq > a.lastEventSeq, "高水位应随新事件推进（" + String(a.lastEventSeq) + " → " + String(b.lastEventSeq) + "）");
});

test("replay arrives OUT OF ORDER — projection must not assume monotonic arrival", { skip }, () => {
  // 实测 seq 序列 2,4,3,7,5,8,9,10,11。若投影层假定有序（例如按到达顺序编号块），
  // 重连后会得到错乱的脊柱。当前实现按 eventId 去重、按到达顺序追加，故乱序只影响
  // 新增事件的相对位置——本条把「乱序确实存在」钉住，防止将来有人加有序假定。
  const ids: number[] = [];
  for (const r of replayRecs) {
    const f = r.frame;
    if (f.kind !== "notification") continue;
    const p = (f.params ?? {}) as Record<string, unknown>;
    const meta = (p["_meta"] ?? {}) as Record<string, unknown>;
    if (typeof meta["eventId"] === "string") ids.push(seqOf(meta["eventId"]));
  }
  assert.ok(ids.length > 1, "replay 段没有带 eventId 的事件");
  const outOfOrder = ids.some((v, i) => i > 0 && v < (ids[i - 1] as number));
  assert.ok(outOfOrder, "本次回放恰好有序——若如此请复核，别据此假定内核保证有序。实测序列: " + ids.join(","));
});

test("_nofy/replayed is NOT a wire method and _meta[nofy/replayed] is NOT stamped by the kernel", { skip }, () => {
  // 线路级正面验证 EXT_META_KEY 的判定（此前只有 pager 客户端侧源码为据）。
  let methodHits = 0;
  let metaKeyHits = 0;
  for (const r of recs) {
    const f = r.frame;
    if (f.kind !== "notification") continue;
    if (f.method === "_nofy/replayed") methodHits++;
    const p = (f.params ?? {}) as Record<string, unknown>;
    const meta = p["_meta"];
    if (typeof meta === "object" && meta !== null && "nofy/replayed" in (meta as Record<string, unknown>)) metaKeyHits++;
  }
  assert.equal(methodHits, 0, "_nofy/replayed 竟作为方法名出现——须重新复核 EXT_META_KEY 判定");
  assert.equal(metaKeyHits, 0, "内核竟打了 _meta[nofy/replayed] 标记——PORTING-PLAN 的记载需更正");
});

test("_meta.noReplay suppresses the transcript replay but not the call itself", { skip }, () => {
  const countIds = (rs: typeof recs) => {
    let n = 0;
    for (const r of rs) {
      const f = r.frame;
      if (f.kind !== "notification") continue;
      const p = (f.params ?? {}) as Record<string, unknown>;
      const meta = (p["_meta"] ?? {}) as Record<string, unknown>;
      if (typeof meta["eventId"] === "string") n++;
    }
    return n;
  };
  const withReplay = countIds(replayRecs);
  const without = countIds(noReplayRecs);
  assert.ok(withReplay > 1, "replay 段应有多个带 eventId 的事件");
  assert.ok(without <= 1, "noReplay 段应几乎不带回放事件，实测 " + String(without));
  assert.ok(without < withReplay, "noReplay 未生效");
});

test("zero unhandled across all three phases", { skip }, () => {
  const s = replay(noReplayRecs, replay(replayRecs, replay(liveRecs)));
  assert.deepEqual(s.unhandled, {}, "出现未映射事件");
});


