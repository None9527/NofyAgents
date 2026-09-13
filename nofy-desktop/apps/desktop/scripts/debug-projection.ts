import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeNotification } from "../renderer/core/events.ts";
import { initialState, reduce } from "../renderer/core/project.ts";
import type { Action } from "../renderer/core/project.ts";
import type { AppState, Block } from "../renderer/core/store/state.ts";
import type { InboundFrame } from "@nofy-desktop/acp";

const here = dirname(fileURLToPath(import.meta.url));
const F = join(here, "..", "..", "..", "docs", "fixtures", "golden-turn.jsonl");
const recs = readFileSync(F, "utf8").trim().split("\n").map((l) => JSON.parse(l) as { t: number; frame: InboundFrame });

function isObj(v: unknown): v is Record<string, unknown> { return typeof v === "object" && v !== null && !Array.isArray(v); }

// 先数夹具里的原始事件
const raw = new Map<string, number>();
for (const r of recs) {
  const f = r.frame;
  if (f.kind !== "notification") continue;
  const p = isObj(f.params) ? f.params : {};
  const u = isObj(p["update"]) ? p["update"] : null;
  const k = f.method + (u !== null ? "#" + String(u["sessionUpdate"] ?? "-") : "");
  raw.set(k, (raw.get(k) ?? 0) + 1);
}
console.log("");
console.log("══ 夹具原始计数（含 user_message_chunk）");
for (const [k, n] of [...raw.entries()].sort()) if (k.includes("user_message") || k.includes("tool_call") || k.includes("agent_message")) console.log("  " + String(n).padStart(3) + "  " + k);

let state: AppState = initialState();
const d = (a: Action) => { state = reduce(state, a); };
for (const r of recs) {
  const f = r.frame;
  if (f.kind === "response") {
    const res = isObj(f.result) ? f.result : {};
    if (f.id === 1) { d({ type: "connection/initialized", result: res }); continue; }
    const sid = typeof res["sessionId"] === "string" ? res["sessionId"] : null;
    if (sid !== null) {
      const models = isObj(res["models"]) ? res["models"] : {};
      const meta = isObj(res["_meta"]) ? res["_meta"] : {};
      d({ type: "session/created", sessionId: sid, cwd: typeof meta["currentWorkingDirectory"] === "string" ? meta["currentWorkingDirectory"] : null, modelId: typeof models["currentModelId"] === "string" ? models["currentModelId"] : null });
    }
    continue;
  }
  if (f.kind === "notification") d({ type: "kernel/event", event: normalizeNotification(f.method, f.params) });
}
console.log("");
console.log("══ 终态 sessions:", Object.keys(state.sessions).length, " ids:", Object.keys(state.sessions).join(","));
for (const [sid, s] of Object.entries(state.sessions)) {
  console.log("  session " + sid + "  blocks=" + String(s.blocks.length) + "  lastEventSeq=" + String(s.lastEventSeq) + "  commands=" + String(s.availableCommands.length) + "  tools=" + String(s.availableTools.length));
  s.blocks.forEach((b: Block, i: number) => {
    const brief = b.kind === "tool-call" ? ("name=" + JSON.stringify(b.name) + " title=" + JSON.stringify(b.title) + " kind=" + JSON.stringify(b.toolKind))
      : b.kind === "event" ? ("tag=" + b.tag)
      : ("len=" + String(b.text.length) + " " + JSON.stringify(b.text.slice(0, 40)));
    console.log("    [" + String(i).padStart(2) + "] " + b.kind.padEnd(14) + " id=" + b.id.padEnd(28) + brief);
  });
}
console.log("");
console.log("══ unhandled:", JSON.stringify(state.unhandled));

