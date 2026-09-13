/**
 * Drift 门禁——codegen 的价值全在这里。
 *
 * 守三件事：
 *   1. 生成物与 schema/meta.unstable.json 同步（sha256）。「改了 meta 没重跑生成器」必红。
 *   2. 所有手写常量都引用生成值、且值确实存在于权威表。字面量拼错必红。
 *   3. 已修的错误不得回归：terminal/kill 合法、terminal/kill_command 不合法。
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  AGENT_METHOD,
  AGENT_METHOD_UNIMPLEMENTED,
  AGENT_METHOD_UNUSED,
  CLIENT_SIDE_METHOD,
  PROTOCOL_METHOD,
} from "../src/methods.ts";
import {
  AGENT_WIRE,
  CLIENT_WIRE,
  META_SHA256,
  PROTOCOL_WIRE,
} from "../src/generated/wire-names.ts";
import { PROTOCOL_VERSION } from "../src/caps.ts";

const here = dirname(fileURLToPath(import.meta.url));
const metaRaw = readFileSync(join(here, "..", "schema", "meta.unstable.json"), "utf8");
const schemaRaw = readFileSync(join(here, "..", "schema", "schema.unstable.json"), "utf8");

test("generated file is in sync with meta.unstable.json (sha256)", () => {
  const actual = createHash("sha256").update(metaRaw).digest("hex");
  assert.equal(
    actual,
    META_SHA256,
    "生成物已过期：meta.unstable.json 变了但 src/generated/wire-names.ts 没重跑。"
      + " 跑 node packages/acp/scripts/gen-wire-names.ts",
  );
});

test("vendored schema is a parseable draft2020-12 document", () => {
  const s = JSON.parse(schemaRaw) as Record<string, unknown>;
  assert.equal(s["$schema"], "https://json-schema.org/draft/2020-12/schema");
  assert.ok(s["$defs"] !== undefined || s["definitions"] !== undefined, "schema 缺少类型定义区");
});

test("meta method tables have not silently shrunk (wrong crate/feature guard)", () => {
  const meta = JSON.parse(metaRaw) as {
    version: number;
    agentMethods: Record<string, string>;
    clientMethods: Record<string, string>;
    protocolMethods?: Record<string, string>;
  };
  // 0.11.4 + features=["unstable"] 的已知基数。变少说明生成时用错了 crate 或漏了 feature。
  assert.ok(Object.keys(meta.agentMethods).length >= 24, "agentMethods 少于 24 条");
  assert.ok(Object.keys(meta.clientMethods).length >= 11, "clientMethods 少于 11 条");
  assert.equal(meta.version, PROTOCOL_VERSION, "protocolVersion 与 caps.ts 不一致");
});

test("every hand-written agent-side constant is a real wire name", () => {
  const valid = new Set<string>(Object.values(AGENT_WIRE));
  for (const [table, obj] of [
    ["AGENT_METHOD", AGENT_METHOD],
    ["AGENT_METHOD_UNIMPLEMENTED", AGENT_METHOD_UNIMPLEMENTED],
    ["AGENT_METHOD_UNUSED", AGENT_METHOD_UNUSED],
  ] as const) {
    for (const [k, v] of Object.entries(obj)) {
      assert.ok(valid.has(v), table + "." + k + " = " + JSON.stringify(v) + " 不在权威 agentMethods 表内");
    }
  }
});

test("every client-side constant is a real wire name", () => {
  const valid = new Set<string>(Object.values(CLIENT_WIRE));
  for (const [k, v] of Object.entries(CLIENT_SIDE_METHOD)) {
    assert.ok(valid.has(v), "CLIENT_SIDE_METHOD." + k + " = " + JSON.stringify(v) + " 不在权威 clientMethods 表内");
  }
});

test("protocol-level constants are real wire names", () => {
  const valid = new Set<string>(Object.values(PROTOCOL_WIRE));
  for (const [k, v] of Object.entries(PROTOCOL_METHOD)) {
    assert.ok(valid.has(v), "PROTOCOL_METHOD." + k + " = " + JSON.stringify(v) + " 不在权威表内");
  }
});

/* ── 回归守卫：初版把 KillTerminalCommand 反推成 "terminal/kill_command"，是错的 ── */

test("terminal kill wire name is terminal/kill, NOT terminal/kill_command (regression)", () => {
  const valid = new Set<string>(Object.values(CLIENT_WIRE));
  assert.equal(CLIENT_SIDE_METHOD.killTerminal, "terminal/kill");
  assert.ok(valid.has("terminal/kill"));
  assert.ok(
    !valid.has("terminal/kill_command"),
    "terminal/kill_command 不该存在于权威表——若它出现了，说明上游改名，需复核连接层分派",
  );
});

test("no hand-written table contains the known-bogus name", () => {
  const all = [
    ...Object.values(AGENT_METHOD),
    ...Object.values(AGENT_METHOD_UNIMPLEMENTED),
    ...Object.values(AGENT_METHOD_UNUSED),
    ...Object.values(CLIENT_SIDE_METHOD),
  ];
  assert.ok(!all.includes("terminal/kill_command" as never));
});

test("session/cancel and session/update exist on the correct sides", () => {
  // cancel 是客户端→内核（且必须当 notification 发）；session/update 是内核→客户端。
  assert.equal(AGENT_WIRE.session_cancel, "session/cancel");
  assert.equal(CLIENT_WIRE.session_update, "session/update");
  assert.equal(CLIENT_SIDE_METHOD.sessionUpdate, "session/update");
});

test("_nofy/* extension names never collide with stdlib wire names", () => {
  // 归一形与前缀约束由 ext-classification.test.ts 覆盖（它对着内核证据件校验）；
  // 这里只守一件事：扩展名与 stdlib 名不得撞车，否则连接层分派会二义。
  const stdlib = new Set<string>([
    ...Object.values(AGENT_WIRE),
    ...Object.values(CLIENT_WIRE),
    ...Object.values(PROTOCOL_WIRE),
  ]);
  for (const n of stdlib) {
    assert.ok(!n.startsWith("_nofy/"), "stdlib 名不该带 _nofy/ 前缀: " + n);
  }
});


