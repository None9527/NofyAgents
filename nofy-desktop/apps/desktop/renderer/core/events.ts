/**
 * 内核事件归一化——**线路形状 → 应用形状的唯一入口**。
 *
 * 为什么必须有这一层（而不是让 features 直接读 params）：
 * 真帧的判别字段是 **params.update.sessionUpdate**，不在 params 顶层。
 * PORTING-PLAN §2.3 把它写作「sessionUpdate 种类」，容易被读成顶层字段——
 * record-turn 初版就是这么错的，23 条 session/update 全被记成 update:?。
 * 一切以 docs/fixtures/golden-turn.jsonl 录到的真帧为准，
 * 实测账见 docs/contract/session-events-measured.md。
 *
 * 纪律（PLAN.md §5）：表外事件**显式产出 unknown**，不静默丢弃。
 */
import { EXT_EVENT, EXT_INDIRECT } from "@nofy-desktop/acp";
import type { TerminalFrame } from "./ptybus.ts";
import type { JsonObject } from "../../main/acp/connection.ts";

/** session/update 的判别值（实测 6 种 + 文档另载 3 种，本轮未出现）。 */
export const SESSION_UPDATE_KINDS = [
  "user_message_chunk",
  "agent_message_chunk",
  "agent_thought_chunk",
  "tool_call",
  "tool_call_update",
  "plan",
  "available_commands_update",
  "current_mode_update",
  "session_info_update",
] as const;
export type SessionUpdateKind = (typeof SESSION_UPDATE_KINDS)[number];

/** _nofy/session_notification 的判别值（本轮实测 8 种）。 */
export const EXT_NOTIFICATION_KINDS = [
  "turn_completed",
  "retry_state",
  "response_completed",
  "tool_call_delta_chunk",
  "hook_execution",
  "model_changed",
  "session_summary_generated",
  "pending_interaction",
  "interaction_resolved",
  "auto_compact_start",
  "auto_compact_end",
  "rewind_marker",
  "subagent_spawned",
  "subagent_progress",
  "subagent_finished",
  "task_backgrounded",
  "task_completed",
  "monitor_event",
  "scheduled_task_created",
  "scheduled_task_fired",
  "scheduled_task_deleted",
] as const;
export type ExtNotificationKind = (typeof EXT_NOTIFICATION_KINDS)[number];

/**
 * session/update 与部分 session_notification 的 _meta 信封。
 * eventId 是精确去重的键；回放可能乱序，不能按最大编号丢弃。
 * updateType 是判别值的 PascalCase 镜像（AgentMessageChunk / ToolCall / …）。
 */
export type EventMeta = {
  eventId?: string;
  isReplay?: boolean;
  updateType?: string;
  agentTimestampMs?: number;
  streamStartMs?: number;
  totalTokens?: number;
  updateParams?: unknown;
};

export type NormalizedEvent =
  | { type: "session-update"; sessionId: string; kind: SessionUpdateKind; update: JsonObject; meta: EventMeta }
  | {
      type: "ext-notification";
      sessionId: string;
      kind: ExtNotificationKind;
      update: JsonObject;
      meta: EventMeta;
      /**
       * 事件来自哪条轨。**实测**（docs/contract/replay-dedup-measured.md）：
       *   persisted = `_nofy/session/update`，持久且可回放；重连后 session/load
       *               会以**同一批 eventId** 从这条轨重放（hook_execution /
       *               user_message_chunk / agent_message_chunk / turn_completed）
       *   live      = `_nofy/session_notification`，fire-and-forget，重连即丢
       * 源码依据：turn_end.rs:324-334 称 turn_completed 为 prompt_complete 的
       * 「durable twin … on the persisted + replayed _nofy/session/update rail」。
       */
      rail: "persisted" | "live";
    }
  | { type: "queue-changed"; sessionId: string; params: JsonObject }
  | { type: "sessions-changed"; params: JsonObject }
  | { type: "roster/upsert"; rows: unknown[] }
  | { type: "models-update"; params: JsonObject }
  | { type: "settings-update"; params: JsonObject }
  | { type: "mcp"; name: string; params: JsonObject }
  /**
   * 模糊文件搜索的结果流（内核经 emit_client_ext 推送，handle.rs:2321）。
   * 〔实测形状〕{sessionId, searchId, matches[{name,type,path,score,indices[]}],
   *   total, done, generation}——generation 是「第几批」，乱到以它为准丢弃旧批。
   */
  | { type: "search-fuzzy-status"; params: JsonObject }
  | { type: "prompt-complete"; sessionId: string; promptId: string; stopReason: string; params: JsonObject }
  /** 表外事件：显式暴露，计数并告警，绝不静默丢弃（PLAN.md §2.4/§5）。 */
  | { type: "unknown"; method: string; params: JsonObject };

function isObj(v: unknown): v is JsonObject {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function readMeta(p: JsonObject): EventMeta {
  const m = isObj(p["_meta"]) ? p["_meta"] : {};
  const out: EventMeta = {};
  if (typeof m["eventId"] === "string") out.eventId = m["eventId"];
  if (typeof m["isReplay"] === "boolean") out.isReplay = m["isReplay"];
  if (typeof m["updateType"] === "string") out.updateType = m["updateType"];
  if (typeof m["agentTimestampMs"] === "number") out.agentTimestampMs = m["agentTimestampMs"];
  if (typeof m["streamStartMs"] === "number" && Number.isFinite(m["streamStartMs"])) out.streamStartMs = m["streamStartMs"];
  if (typeof m["totalTokens"] === "number") out.totalTokens = m["totalTokens"];
  if (m["updateParams"] !== undefined) out.updateParams = m["updateParams"];
  return out;
}

function inList<T extends string>(list: readonly T[], v: string): v is T {
  return (list as readonly string[]).includes(v);
}

function taskEventKind(method: string): ExtNotificationKind | null {
  switch (method) {
    case EXT_EVENT.taskBackgrounded: return "task_backgrounded";
    case EXT_EVENT.taskCompleted: return "task_completed";
    case EXT_EVENT.monitorEvent: return "monitor_event";
    case EXT_EVENT.scheduledTaskCreated: return "scheduled_task_created";
    case EXT_EVENT.scheduledTaskFired: return "scheduled_task_fired";
    case EXT_EVENT.scheduledTaskDeleted: return "scheduled_task_deleted";
    default: return null;
  }
}

/* ═══════════════════ PTY 帧（生态面 #3 终端面） ═══════════════════
 * _nofy/terminal/pty/notification 实测形状（ecosystem-shapes.json）：
 *   output {terminalId, type:"output", data:<base64>, outputOffset[, isReplay]}
 *   exit   {terminalId, type:"exit", exitCode, signal[, isReplay]}
 *   process_started / process_ended {terminalId, type}
 *
 * ## 三件源码事实（nofy-shell-terminal/src/pty_session.rs，2026-09-11 读）
 *
 * 1. **process_started / process_ended 不是 shell 退出**：它们是「前台进程 idle↔busy
 *    跳变」（:407-408、:550-551，定时轮询 BUSY_POLL_INTERVAL_MS，因为忙进程可能不出声）。
 *    shell 退出只有 **exit** 帧（:481-506，带 exitCode/signal）。把它当退出会把
 *    「每条命令跑完」误标成「终端已死」。
 * 2. **pty/load 是第一方的重挂接路径**（:773-815）：重绑 target_client_id ⇒ 通知改投本客户端，
 *    并把 256KiB 输出环形缓冲（:54 OUTPUT_RING_BUFFER_SIZE）整段作为 output 帧回放，
 *    带 **isReplay:true** 与累计 outputOffset；已退出的 pty 也能 load（补发 isReplay 的 exit 帧），
 *    所以「最终输出仍可读」。
 * 3. 回放带的客户端义务是源码原话：**「reset its VTE emulator and feed all bytes from scratch」**
 *    ⇒ 收到 isReplay 的 output 帧要先 term.reset() 再写，否则重挂接会把历史输出叠成两份。
 * 归一化成 TerminalFrame 交给 ptybus（**流不进 store**，见 ptybus.ts 头注）；
 * bind.ts 先查本函数再决定要不要 dispatch。返回 null ⇒ 不是 pty 帧，走常规归一化。
 */
export function normalizeTerminalFrame(method: string, params: unknown): TerminalFrame | null {
  // 线路名在 EXT_INDIRECT 桶（构造点频繁、提取器单列证据类，ext-names.ts:134）
  if (method !== EXT_INDIRECT.terminal_pty_notification) return null;
  const p = isObj(params) ? params : {};
  const terminalId = typeof p["terminalId"] === "string" ? p["terminalId"] : "";
  if (terminalId.length === 0) return null;
  const type = typeof p["type"] === "string" ? p["type"] : "";
  const data = typeof p["data"] === "string" ? p["data"] : null;
  return {
    terminalId,
    type,
    text: data === null ? null : decodePtyData(data),
    exitCode: typeof p["exitCode"] === "number" ? p["exitCode"] : null,
    signal: typeof p["signal"] === "string" ? p["signal"] : null,
    outputOffset: typeof p["outputOffset"] === "number" ? p["outputOffset"] : null,
    isReplay: p["isReplay"] === true,
  };
}

/** base64 → 文本。内核 pty 输出帧的 data 是 base64（实测）；解码失败回空串不抛——流里一帧坏不该断终端。 */
export function decodePtyData(b64: string): string {
  try {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  } catch {
    return "";
  }
}

/** 文本 → base64。terminal/pty/input 的 data 键（实测：必须 base64；用 input 键静默丢弃）。 */
export function encodePtyInput(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(bin);
}

/**
 * 归一化一条入站通知。
 * @param method 线路名（notification 的 method）
 * @param params 原始 params
 */
export function normalizeNotification(method: string, params: unknown): NormalizedEvent {
  const p = isObj(params) ? params : {};
  const sessionId = typeof p["sessionId"] === "string" ? p["sessionId"] : "";
  const update = isObj(p["update"]) ? p["update"] : null;
  const disc = update !== null && typeof update["sessionUpdate"] === "string" ? update["sessionUpdate"] : "";

  switch (method) {
    case "session/update": {
      if (update !== null && inList(SESSION_UPDATE_KINDS, disc)) {
        return { type: "session-update", sessionId, kind: disc, update, meta: readMeta(p) };
      }
      return { type: "unknown", method: method + "#" + (disc || "(no discriminator)"), params: p };
    }
    case EXT_EVENT.sessionNotification:
    case EXT_EVENT.sessionUpdate: {
      if (update !== null && inList(EXT_NOTIFICATION_KINDS, disc)) {
        return {
          type: "ext-notification",
          sessionId,
          kind: disc,
          update,
          meta: readMeta(p),
          // 实测（docs/contract/replay-dedup-measured.md）：_nofy/session/update 是
          // **持久且可回放**轨，session/load 会以同一批 eventId 从它重放；
          // _nofy/session_notification 是 fire-and-forget 轨，重连即丢。
          // 源码依据 turn_end.rs:324-334（durable twin on the persisted+replayed rail）。
          rail: method === EXT_EVENT.sessionUpdate ? "persisted" : "live",
        };
      }
      return { type: "unknown", method: method + "#" + (disc || "(no discriminator)"), params: p };
    }
    case EXT_EVENT.queueChanged:
      return { type: "queue-changed", sessionId, params: p };
    case EXT_EVENT.searchFuzzyStatus:
      return { type: "search-fuzzy-status", params: p };
    case EXT_EVENT.sessionsChanged:
      return { type: "sessions-changed", params: p };
    case EXT_EVENT.modelsUpdate:
      return { type: "models-update", params: p };
    case EXT_EVENT.settingsUpdate:
      return { type: "settings-update", params: p };
    case EXT_EVENT.taskBackgrounded:
    case EXT_EVENT.taskCompleted:
    case EXT_EVENT.monitorEvent:
    case EXT_EVENT.scheduledTaskCreated:
    case EXT_EVENT.scheduledTaskFired:
    case EXT_EVENT.scheduledTaskDeleted:
      // 活通知与 `_nofy/session/update` 回放用同一套 update.sessionUpdate。
      // 方法名必须和判别值一致，避免把别的信封塞进任务表。
      if (update !== null && disc === taskEventKind(method) && inList(EXT_NOTIFICATION_KINDS, disc)) {
        return { type: "ext-notification", sessionId, kind: disc, update, meta: readMeta(p), rail: "live" };
      }
      return { type: "unknown", method: method + "#" + (disc || "(no discriminator)"), params: p };
    case EXT_EVENT.sessionPromptComplete:
      // legacy 双生（PLAN 陷阱 T5）：仍然归一化，但投影层不得以它为回合结束依据。
      return {
        type: "prompt-complete",
        sessionId,
        promptId: typeof p["promptId"] === "string" ? p["promptId"] : "",
        stopReason: typeof p["stopReason"] === "string" ? p["stopReason"] : "",
        params: p,
      };
    case EXT_EVENT.mcpServersUpdated:
    case EXT_EVENT.mcpInitProgress:
    case EXT_EVENT.mcpToolsChanged:
    case EXT_EVENT.mcpServerStatus:
    case EXT_EVENT.mcpInitialized:
      return { type: "mcp", name: method, params: p };
    default:
      return { type: "unknown", method, params: p };
  }
}

/** 从 agent_message_chunk 取文本（content 形状实测为 {type:"text", text:string}）。 */
export function chunkText(update: JsonObject): string {
  const c = update["content"];
  if (isObj(c) && typeof c["text"] === "string") return c["text"];
  if (typeof update["text"] === "string") return update["text"];
  return "";
}
