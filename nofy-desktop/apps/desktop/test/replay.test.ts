/**
 * S1b 回放门：把 golden-turn.jsonl 灌进归一化层，断言应用形状与顺序不变量。
 *
 * 夹具来源：scripts/record-turn.ts 对真内核（agentVersion 0.2.121）录制的完整轮次
 *   prompt → agent_message_chunk ×14 → tool_call_delta_chunk ×5 → tool_call
 *   → tool_call_update ×2 → agent_message_chunk ×7 → turn_completed
 * 实测账：docs/contract/session-events-measured.md
 *
 * 这道门的意义：投影层（core/project.ts）此后任何改动，都必须仍能解释这段真事件流。
 */
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import type { InboundFrame } from "@nofy-desktop/acp";
import {
  chunkText,
  normalizeNotification,
} from "../renderer/core/events.ts";
import type { NormalizedEvent } from "../renderer/core/events.ts";

const here = dirname(fileURLToPath(import.meta.url));
const FIXTURE = join(here, "..", "..", "..", "docs", "fixtures", "golden-turn.jsonl");

type Rec = { t: number; frame: InboundFrame };

function loadFixture(): Rec[] {
  if (!existsSync(FIXTURE)) return [];
  return readFileSync(FIXTURE, "utf8").trim().split("\n").map((l) => JSON.parse(l) as Rec);
}

function normalizeAll(recs: Rec[]): Array<{ t: number; ev: NormalizedEvent }> {
  const out: Array<{ t: number; ev: NormalizedEvent }> = [];
  for (const r of recs) {
    if (r.frame.kind !== "notification") continue;
    out.push({ t: r.t, ev: normalizeNotification(r.frame.method, r.frame.params) });
  }
  return out;
}

const recs = loadFixture();
const has = recs.length > 0;

test("fixture present", { skip: has ? false : "golden-turn.jsonl 未录制；跑 pnpm --filter @nofy-desktop/app record" }, () => {
  assert.ok(has);
});

test("every notification normalizes to a known event (zero unknown)", { skip: !has }, () => {
  const evs = normalizeAll(recs);
  const unknown = evs.filter((x) => x.ev.type === "unknown");
  assert.deepEqual(
    unknown.map((x) => (x.ev.type === "unknown" ? x.ev.method : "")),
    [],
    "出现归一化不认识的事件——契约漂移，须复核 docs/contract/session-events-measured.md",
  );
  assert.ok(evs.length >= 40, "通知数异常少: " + String(evs.length));
});

test("discriminator lives at params.update.sessionUpdate, not params top level", { skip: !has }, () => {
  const su = recs.filter((r) => r.frame.kind === "notification" && r.frame.method === "session/update");
  assert.ok(su.length > 0);
  for (const r of su) {
    if (r.frame.kind !== "notification") continue;
    const p = r.frame.params as Record<string, unknown>;
    assert.equal(p["sessionUpdate"], undefined, "顶层不该有 sessionUpdate（旧文档误导点）");
    const u = p["update"] as Record<string, unknown>;
    assert.equal(typeof u["sessionUpdate"], "string", "判别字段必须在 params.update.sessionUpdate");
  }
});

test("agent text reassembles and contains the file's first line", { skip: !has }, () => {
  const evs = normalizeAll(recs);
  const text = evs
    .filter((x) => x.ev.type === "session-update" && x.ev.kind === "agent_message_chunk")
    .map((x) => (x.ev.type === "session-update" ? chunkText(x.ev.update) : ""))
    .join("");
  assert.ok(text.length > 0, "agent 文本为空");
  assert.match(text, /quick brown fox/, "助手没有读到文件首行——轮次不是真的跑通");
});

test("turn_completed is present and is the last session-level event", { skip: !has }, () => {
  const evs = normalizeAll(recs);
  const idx = evs.findIndex((x) => x.ev.type === "ext-notification" && x.ev.kind === "turn_completed");
  assert.ok(idx >= 0, "缺 turn_completed（PLAN 陷阱 T5：它是回合结束的权威信号）");
  // 之后只允许 legacy 的 prompt_complete 与 roster 类事件
  const after = evs.slice(idx + 1).map((x) => x.ev.type);
  for (const t of after) {
    assert.ok(
      t === "prompt-complete" || t === "sessions-changed" || t === "queue-changed" || t === "unknown",
      "turn_completed 之后不该再有会话级事件，实际: " + t,
    );
  }
});

test("legacy prompt_complete fires but is NOT relied on (ordering evidence)", { skip: !has }, () => {
  const evs = normalizeAll(recs);
  const tc = evs.findIndex((x) => x.ev.type === "ext-notification" && x.ev.kind === "turn_completed");
  const pc = evs.findIndex((x) => x.ev.type === "prompt-complete");
  assert.ok(tc >= 0 && pc >= 0, "两者都应出现");
  assert.ok(tc < pc, "实测 turn_completed 早于 prompt_complete（差 ~1ms），故前者可作权威收尾");
  const p = evs[pc];
  assert.ok(p !== undefined && p.ev.type === "prompt-complete");
  if (p !== undefined && p.ev.type === "prompt-complete") {
    assert.equal(p.ev.stopReason, "end_turn");
    assert.ok(p.ev.promptId.length > 0);
  }
});

test("ordering: user chunk before agent chunks; tool_call before tool_call_update", { skip: !has }, () => {
  const evs = normalizeAll(recs).filter((x) => x.ev.type === "session-update");
  const kinds = evs.map((x) => (x.ev.type === "session-update" ? x.ev.kind : ""));
  const iUser = kinds.indexOf("user_message_chunk");
  const iAgent = kinds.indexOf("agent_message_chunk");
  const iCall = kinds.indexOf("tool_call");
  const iUpd = kinds.indexOf("tool_call_update");
  assert.ok(iUser >= 0 && iAgent >= 0 && iCall >= 0 && iUpd >= 0, "关键事件缺失: " + kinds.join(","));
  assert.ok(iUser < iAgent, "user_message_chunk 应早于 agent_message_chunk");
  assert.ok(iCall < iUpd, "tool_call 应早于 tool_call_update");
});

/**
 * _meta.eventId 的覆盖规律（golden-turn 实测，见 docs/contract/session-events-measured.md §3）。
 *
 * 结论：**eventId 只出现在「进持久转录轨」的事件上**——即重连/replay 时需要按
 * 高水位去重的那些。瞬态与 UI 类事件一律没有 eventId，因为它们要么天然幂等
 * （last-write-wins），要么不进转录。
 *
 * 这条规律直接决定投影层的去重实现：last_applied_event_seq 只对带 eventId 的
 * 事件生效（第一方语义 drop_unexpected_replay / replay 豁免），对其余事件套用
 * 去重会把它们全部误丢。
 */
const EVENT_ID_REQUIRED = [
  "su:user_message_chunk",
  "su:agent_message_chunk",
  "su:tool_call",
  "su:tool_call_update",
  "su:available_commands_update",
  "ext:hook_execution",
  "ext:turn_completed",
] as const;

const EVENT_ID_ABSENT = [
  "su:session_info_update",
  "ext:tool_call_delta_chunk",
  "ext:response_completed",
  "ext:model_changed",
  "ext:session_summary_generated",
  "ext:pending_interaction",
  "ext:interaction_resolved",
  "queue-changed",
  "sessions-changed",
  "mcp",
  "prompt-complete",
] as const;

function censusKey(ev: NormalizedEvent): string {
  if (ev.type === "session-update") return "su:" + ev.kind;
  if (ev.type === "ext-notification") return "ext:" + ev.kind;
  return ev.type;
}
function metaOf(ev: NormalizedEvent): { eventId?: string } {
  return ev.type === "session-update" || ev.type === "ext-notification" ? ev.meta : {};
}

test("_meta.eventId present exactly on transcript-bearing events", { skip: !has }, () => {
  const evs = normalizeAll(recs).map((x) => x.ev);
  for (const key of EVENT_ID_REQUIRED) {
    const group = evs.filter((e) => censusKey(e) === key);
    assert.ok(group.length > 0, "夹具缺 " + key + "，无法验证 eventId 规律");
    const missing = group.filter((e) => typeof metaOf(e).eventId !== "string");
    assert.equal(missing.length, 0, key + " 应条条带 _meta.eventId（持久轨去重键），实际缺 " + String(missing.length) + "/" + String(group.length));
  }
});

test("_meta.eventId absent on transient/UI events (do not dedup them)", { skip: !has }, () => {
  const evs = normalizeAll(recs).map((x) => x.ev);
  for (const key of EVENT_ID_ABSENT) {
    const group = evs.filter((e) => censusKey(e) === key);
    if (group.length === 0) continue; // 本轮未出现则跳过，不算失败
    const leaked = group.filter((e) => typeof metaOf(e).eventId === "string");
    assert.equal(leaked.length, 0, key + " 不该带 eventId；若带了说明内核改了语义，须复核投影层去重");
  }
});

test("_meta.updateType mirrors the discriminator in PascalCase", { skip: !has }, () => {
  const evs = normalizeAll(recs).map((x) => x.ev).filter((e) => e.type === "session-update");
  const mirrored = evs.filter((e) => e.type === "session-update" && e.meta.updateType !== undefined);
  assert.ok(mirrored.length > 0);
  for (const e of mirrored) {
    if (e.type !== "session-update" || e.meta.updateType === undefined) continue;
    const expect = e.kind.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("");
    assert.equal(e.meta.updateType, expect, "updateType 与判别值的 PascalCase 镜像不符: " + e.kind);
  }
});

test("event census matches the recorded turn (drift sentinel)", { skip: !has }, () => {
  const evs = normalizeAll(recs);
  const census = new Map<string, number>();
  for (const x of evs) {
    const k =
      x.ev.type === "session-update" ? "su:" + x.ev.kind
      : x.ev.type === "ext-notification" ? "ext:" + x.ev.kind
      : x.ev.type;
    census.set(k, (census.get(k) ?? 0) + 1);
  }
  // 本轮实测账（docs/contract/session-events-measured.md）。数量允许浮动（模型行为），
  // 但**种类集合**必须覆盖这些——少一种就是契约漂移。
  const required = [
    "su:agent_message_chunk", "su:user_message_chunk", "su:tool_call", "su:tool_call_update",
    "su:available_commands_update", "su:session_info_update",
    "ext:turn_completed", "ext:response_completed", "ext:tool_call_delta_chunk",
    "ext:hook_execution", "ext:model_changed", "ext:session_summary_generated",
    "ext:pending_interaction", "ext:interaction_resolved",
    "prompt-complete", "queue-changed", "sessions-changed", "mcp",
  ];
  const missing = required.filter((k) => (census.get(k) ?? 0) === 0);
  assert.deepEqual(missing, [], "夹具缺种类: " + missing.join(", "));
});


