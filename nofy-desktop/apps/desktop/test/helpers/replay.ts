/**
 * 夹具回放工具——把录到的真帧序列灌进投影层，得到终态。
 *
 * 所有回放门共用这一份，顺序照真实链路：
 *   response(id=1) = initialize → connection/initialized
 *   response(其它，带顶层 sessionId) = session/new → session/created
 *   server-request → kernel/server-request（需应答的内核请求）
 *   notification  → normalizeNotification → kernel/event
 *   malformed     → kernel/unknown（夹具里不该有；smoke 与 audit 都验过零坏帧）
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { InboundFrame } from "@nofy-desktop/acp";
import { normalizeNotification } from "../../renderer/core/events.ts";
import { initialState, reduce } from "../../renderer/core/project.ts";
import type { Action } from "../../renderer/core/project.ts";
import type { AppState } from "../../renderer/core/store/state.ts";

const here = dirname(fileURLToPath(import.meta.url));
// test/helpers/ → test → desktop → apps → nofy-desktop，故为四级 ..
export const FIXTURE_DIR = join(here, "..", "..", "..", "..", "docs", "fixtures");

/**
 * 目录不存在就**硬失败**，不静默 skip。
 * 教训：路径算错一层会让整套回放门静默 skip（9 skipped / 0 failed），
 * 看起来像「夹具没录」，实际是门自己空转。verify 链会因此变成假绿。
 */
if (!existsSync(FIXTURE_DIR)) {
  throw new Error("夹具目录不存在: " + FIXTURE_DIR + " —— test/helpers/replay.ts 的相对路径算错了？");
}

/** phase 仅 golden-replay.jsonl 有（live / replay / noreplay 三段）。 */
export type Rec = { t: number; phase?: string; frame: InboundFrame };

export function byPhase(recs: Rec[], ...phases: string[]): Rec[] {
  return recs.filter((r) => r.phase !== undefined && phases.includes(r.phase));
}

export function fixturePath(name: string): string {
  return join(FIXTURE_DIR, name);
}
export function fixtureExists(name: string): boolean {
  return existsSync(fixturePath(name));
}
export function loadFixture(name: string): Rec[] {
  return readFileSync(fixturePath(name), "utf8")
    .trim()
    .split("\n")
    .map((l) => JSON.parse(l) as Rec);
}

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** 回放；可传起始状态以模拟「重连后再放一遍」。
 *  stopBefore：放到某帧前停（权限类夹具的 turn_completed 会按新契约清空调挂起请求，
 *  想看「请求到达」的断言须在它之前停）。 */
export function replay(
  recs: Rec[],
  start: AppState = initialState(),
  stopBefore?: (r: Rec) => boolean,
  onStep?: (s: AppState) => void,
): AppState {
  let state = start;
  const dispatch = (a: Action): void => {
    state = reduce(state, a);
  };
  for (const r of recs) {
    if (onStep !== undefined) onStep(state);
    if (stopBefore !== undefined && stopBefore(r)) break;
    const f = r.frame;
    if (f.kind === "response") {
      const res = isObj(f.result) ? f.result : {};
      if (f.id === 1) {
        dispatch({ type: "connection/initialized", result: res });
        continue;
      }
      const sid = typeof res["sessionId"] === "string" ? res["sessionId"] : null;
      if (sid !== null) {
        const models = isObj(res["models"]) ? res["models"] : {};
        const meta = isObj(res["_meta"]) ? res["_meta"] : {};
        dispatch({
          type: "session/created",
          sessionId: sid,
          cwd: typeof meta["currentWorkingDirectory"] === "string" ? meta["currentWorkingDirectory"] : null,
          modelId: typeof models["currentModelId"] === "string" ? models["currentModelId"] : null,
        });
      }
      continue;
    }
    if (f.kind === "server-request") {
      dispatch({
        type: "kernel/server-request",
        id: f.id,
        method: f.method,
        params: isObj(f.params) ? f.params : {},
      });
      continue;
    }
    if (f.kind === "notification") {
      dispatch({ type: "kernel/event", event: normalizeNotification(f.method, f.params) });
      continue;
    }
    dispatch({ type: "kernel/unknown", key: "malformed:" + f.reason });
  }
  if (onStep !== undefined) onStep(state);
  return state;
}

export function replayFixture(name: string, start?: AppState): AppState {
  return replay(loadFixture(name), start);
}
export function replayFixtureUntil(
  name: string,
  stopBefore: (r: Rec) => boolean,
  start?: AppState,
): AppState {
  return replay(loadFixture(name), start, stopBefore);
}

/** 挂起请求到达轨迹：新契约下 turn_completed 会清空调，故「到达过什么」要逐步记。 */
export type PendingTrace = {
  maxPending: number;
  requests: Array<{ id: number | string; method: string; params: Record<string, unknown> }>;
};
export function replayFixtureTrace(name: string): { state: AppState; trace: PendingTrace } {
  const trace: PendingTrace = { maxPending: 0, requests: [] };
  const seen = new Set<number | string>();
  const state = replay(loadFixture(name), initialState(), undefined, (s) => {
    trace.maxPending = Math.max(trace.maxPending, s.pendingInteractions.length);
    for (const p of s.pendingInteractions) {
      if (seen.has(p.id)) continue;
      seen.add(p.id);
      trace.requests.push({ id: p.id, method: p.method, params: p.params });
    }
  });
  return { state, trace };
}

export function onlySession(s: AppState) {
  const all = Object.values(s.sessions);
  if (all.length !== 1) throw new Error("期望恰好 1 个会话，实际 " + String(all.length));
  return all[0]!;
}
