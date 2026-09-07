// Probe round 8 — P1b contract gate: v4 会话事件形状门禁。
//
// 直接 import host 束内导出的 v4 会话事件 discriminatedUnion（chunk-O5YHTQBW 的
// `Ya`＝本地名 `Bf`），对「ACP→v4 映射层」将要产出的最小事件样本做 safeParse。
// 用途：P1b 的 acp-v4 桥产出的每个事件必须先过本探针，再接 renderer；
// 样本即合同规格（strict schema ⇒ 键集精确）。
//
// usage: node desktop/scripts/acp-probe8.mjs

import { Ya as SessionEventUnion } from "../src/out/host/chunk-O5YHTQBW.js";

const UID = "01a07930-0000-7000-8000-000000000001";
const UID2 = "01a07930-0000-7000-8000-000000000002";
const UID3 = "01a07930-0000-7000-8000-000000000003";
const env = (type, payload, extra = {}) => ({
  eventId: UID2,
  sessionId: UID,
  seq: 1,
  timestamp: Date.now(),
  type,
  ...(payload === undefined ? {} : { payload }),
  ...extra,
});

const samples = [
  ["session.created", env("session.created", { mode: "build", contextWindow: 200000 })],
  ["turn.started", env("turn.started", { turnNumber: 1, input: "hello" }, { turnId: UID3 })],
  [
    "part.started",
    env("part.started", { part: { partId: UID3, sessionId: UID, messageId: UID2, type: "text", text: "" } }, { turnId: UID3 }),
  ],
  [
    "part.delta",
    env("part.delta", { messageId: UID2, partId: UID3, field: "text", delta: "hello" }, { turnId: UID3 }),
  ],
  ["message.upserted", env("message.upserted", { content: "hello world" }, { turnId: UID3 })],
  [
    "turn.completed",
    env(
      "turn.completed",
      { response: "hello world", tokenCount: 3, toolCallCount: 0, duration: 12, resultType: "success" },
      { turnId: UID3 },
    ),
  ],
  ["session.titleUpdated", env("session.titleUpdated", { previousTitle: "", title: "new title", source: "generated" })],
  [
    "permission.requested",
    env(
      "permission.requested",
      {
        toolCallId: UID3,
        toolName: UID3,
        riskLevel: "low",
        reason: "read a file",
        input: {},
        options: [
          {
            optionId: UID3,
            kind: "allow_once",
            name: "Allow once",
            response: { decision: "allow" },
          },
        ],
      },
      { turnId: UID3 },
    ),
  ],
  ["permission.resolved", env("permission.resolved", { toolCallId: UID3 }, { turnId: UID3 })],
  ["session.closed", env("session.closed", undefined)],
];

let fails = 0;
for (const [name, sample] of samples) {
  const r = SessionEventUnion.safeParse(sample);
  if (r.success) {
    console.log(`PASS  ${name}`);
  } else {
    fails++;
    console.log(`FAIL  ${name}`);
    for (const iss of r.error.issues.slice(0, 6)) {
      console.log(`        ${iss.path.join(".")} : ${iss.code} ${iss.message}`);
    }
  }
}
console.log(`\n== probe8 summary: ${samples.length - fails}/${samples.length} event shapes conform ==`);
process.exit(fails ? 1 : 0);
