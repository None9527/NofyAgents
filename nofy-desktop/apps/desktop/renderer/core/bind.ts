/**
 * bindKernel——把 KernelPort 的入站信号接进 store。
 *
 * 这是「renderer 只读 store、所有写入经 dispatch」纪律的落地点：
 * 协议解析只发生在这里与 project.ts，features 永远看不到线路形状。
 */
import { normalizeNotification } from "./events.ts";
import { normalizeTerminalFrame } from "./events.ts";
import { emitTerminalFrame } from "./ptybus.ts";
import { reduce } from "./project.ts";
import type { Action } from "./project.ts";
import type { AppState } from "./store/state.ts";
import { createStore } from "./store/store.ts";
import type { Store } from "./store/store.ts";
import { initialState } from "./store/state.ts";
import type { KernelPort, KernelSignal } from "./kernel-port.ts";

export type BoundKernel = {
  store: Store<AppState, Action>;
  port: KernelPort;
  /** 断开订阅（不关连接）。 */
  unbind: () => void;
};

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/**
 * 从 session/new 或 session/load 的响应里取出会话元数据。
 * 形状实测于 docs/contract/session-read-shapes.json：
 *   session/new  → { sessionId, models:{currentModelId,…}, _meta:{ currentWorkingDirectory,
 *                  isGitRepo, gitRoot, "nofy/sessionConfig":{options}, "nofy/sessionDetail":{…} } }
 *   session/load → { models, _meta:{ sessionId, "nofy/sessionConfig", "nofy/sessionDetail":{
 *                  sessionId, kind, cwd, currentModelId, **title** }, … } }
 *
 * ⚠ 冷启动载入历史会话时**标题只能从这里取**：session_info_update 与
 * session_summary_generated 都不在回放集里（replay-dedup-measured.md §2）。
 */
export function hydrateFromResponse(result: unknown): {
  sessionId: string | null;
  title: string | null;
  cwd: string | null;
  modelId: string | null;
  kind: string | null;
  modelOptions: unknown[];
} {
  const out = { sessionId: null as string | null, title: null as string | null, cwd: null as string | null, modelId: null as string | null, kind: null as string | null, modelOptions: [] as unknown[] };
  if (!isObj(result)) return out;
  const meta = isObj(result["_meta"]) ? result["_meta"] : {};
  const detail = isObj(meta["nofy/sessionDetail"]) ? meta["nofy/sessionDetail"] : {};
  const cfg = isObj(meta["nofy/sessionConfig"]) ? meta["nofy/sessionConfig"] : {};
  const models = isObj(result["models"]) ? result["models"] : {};

  const sid = typeof result["sessionId"] === "string" ? result["sessionId"] : typeof meta["sessionId"] === "string" ? meta["sessionId"] : typeof detail["sessionId"] === "string" ? detail["sessionId"] : null;
  out.sessionId = sid;
  if (typeof detail["title"] === "string") out.title = detail["title"];
  const cwd = meta["currentWorkingDirectory"] ?? detail["cwd"];
  if (typeof cwd === "string") out.cwd = cwd;
  const mid = models["currentModelId"] ?? detail["currentModelId"];
  if (typeof mid === "string") out.modelId = mid;
  if (typeof detail["kind"] === "string") out.kind = detail["kind"];
  if (Array.isArray(cfg["options"])) out.modelOptions = cfg["options"];
  return out;
}

export function bindKernel(port: KernelPort, start: AppState = initialState()): BoundKernel {
  const store = createStore<AppState, Action>(reduce, start);
  const handle = (sig: KernelSignal): void => {
    switch (sig.kind) {
      case "status":
        store.dispatch({ type: "connection/status", status: sig.connected ? "connecting" : "reconnecting" });
        return;
      case "ready":
        store.dispatch({ type: "connection/initialized", result: sig.result });
        return;
      case "notification":
        // PTY 帧是流不是状态：直接投 ptybus，不进 store（ptybus.ts 头注记档的例外）。
        {
          const frame = normalizeTerminalFrame(sig.method, sig.params);
          if (frame !== null) {
            emitTerminalFrame(frame);
            return;
          }
        }
        store.dispatch({ type: "kernel/event", event: normalizeNotification(sig.method, sig.params) });
        return;
      case "server-request":
        store.dispatch({ type: "kernel/server-request", id: sig.id, method: sig.method, params: sig.params });
        return;
      case "malformed":
        store.dispatch({ type: "kernel/unknown", key: "malformed:" + sig.reason });
        return;
    }
  };
  const unbind = port.subscribe(handle);
  return { store, port, unbind };
}
