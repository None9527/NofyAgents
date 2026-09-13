/**
 * 投影层——**NormalizedEvent → 状态 的唯一映射点**（PLAN.md §5）。
 *
 * 三条纪律：
 *  1. features 只读 store，不解析协议；所有翻译只发生在本文件。
 *  2. 逐条对照实测事件表实现，**一条不落、一条不造**。字段名一律来自
 *     docs/fixtures/golden-turn.jsonl（用 scripts/inspect-payloads.ts 复现），
 *     不来自旧文档转述——旧文档在判别字段的嵌套层级上就是错的
 *     （session-events-measured.md §1）。
 *  3. 表外事件**显式计数**（state.unhandled），绝不静默丢弃。
 *
 * 每个分支都带引证：〔夹具〕= golden-turn 实测；〔TUI〕= nofy-tui-full-spec.md Part 4；
 * 〔源码〕= crates/ 的 file:line；〔未测〕= 尚无实测载荷，只做最小登记。
 */
import type { JsonObject } from "../../main/acp/connection.ts";
import type { NormalizedEvent, EventMeta } from "./events.ts";
import {
  emptySession,
  initialState,
} from "./store/state.ts";
import type {
  AppState,
  Block,
  RosterEntry,
  SegmentUsage,
  SessionState,
  SubagentFinishedInfo,
  TurnUsage,
} from "./store/state.ts";

/* ═══════════════════════ Action ═══════════════════════ */

export type Action =
  | { type: "connection/status"; status: AppState["connection"]["status"] }
  | { type: "connection/initialized"; result: JsonObject }
  | { type: "session/created"; sessionId: string; cwd: string | null; modelId: string | null }
  | { type: "session/activated"; sessionId: string }
  /**
   * 用**读路径响应**补全会话元数据。存在理由（replay-dedup-measured.md §2）：
   * session_info_update 与 session_summary_generated 都**不在回放集**里，
   * 故冷启动 session/load 一个历史会话时收不到标题事件——标题必须从
   * load 响应的 _meta["nofy/sessionDetail"].title 取（实测，零额外往返）。
   */
  | {
      type: "session/hydrated";
      sessionId: string;
      title?: string | null;
      titleSource?: SessionState["titleSource"];
      cwd?: string | null;
      modelId?: string | null;
      kind?: string | null;
      modelOptions?: unknown[];
    }
  | { type: "kernel/event"; event: NormalizedEvent }
  | { type: "kernel/server-request"; id: number | string; method: string; params: JsonObject }
  | { type: "kernel/server-request-answered"; id: number | string }
  | { type: "kernel/unknown"; key: string }
  /** 乐观：已发出 prompt，置运行态。**不插用户块**（内核会发 user_message_chunk，插了会重复）。 */
  | { type: "session/turn-requested"; sessionId: string }
  | { type: "session/turn-failed"; sessionId: string; error: string }
  /** 乐观：已发 cancel 通知（陷阱 T1 的 notification），等 turn_completed{cancelled} 收尾。 */
  | { type: "session/cancel-requested"; sessionId: string }
  /**
   * 已确认的模式切换（session/set_mode 请求成功回执）。
   * 存在理由：内核只对 plan 的进/出推 current_mode_update（session_mode.rs:85-112），
   * ask/default 切完**不推**——不记回执芯片就会掉回 default，显示成没切成功。
   */
  | { type: "session/mode-set"; sessionId: string; mode: string };

/* ═══════════════════════ 小工具 ═══════════════════════ */

function isObj(v: unknown): v is JsonObject {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
function str(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}
function num(v: unknown, dflt = 0): number {
  return typeof v === "number" && Number.isFinite(v) ? v : dflt;
}
function arr(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

/**
 * eventId 形如 \`<sessionId>-<n>\`〔夹具：session/update 的 _meta.eventId = "…-0"〕。
 * 取尾部序号作去重高水位。解析不出则返回 null（**不参与去重**，见陷阱 T10）。
 */
function eventSeqOf(meta: EventMeta): number | null {
  const id = meta.eventId;
  if (typeof id !== "string") return null;
  const i = id.lastIndexOf("-");
  if (i < 0 || i === id.length - 1) return null;
  const tail = id.slice(i + 1);
  return /^\d+$/.test(tail) ? Number(tail) : null;
}

/** response_completed.usage —— snake_case〔夹具〕。 */
function parseSegmentUsage(u: unknown): SegmentUsage | null {
  if (!isObj(u)) return null;
  return {
    inputTokens: num(u["input_tokens"]),
    outputTokens: num(u["output_tokens"]),
    cacheReadInputTokens: num(u["cache_read_input_tokens"]),
    cacheCreationInputTokens: num(u["cache_creation_input_tokens"]),
    reasoningTokens: num(u["reasoning_tokens"]),
  };
}

/** turn_completed.usage —— camelCase，字段集更大〔夹具〕。⚠ 与段级不同形状。 */
function parseTurnUsage(u: unknown): TurnUsage | null {
  if (!isObj(u)) return null;
  return {
    inputTokens: num(u["inputTokens"]),
    outputTokens: num(u["outputTokens"]),
    totalTokens: num(u["totalTokens"]),
    cachedReadTokens: num(u["cachedReadTokens"]),
    cacheCreationTokens: num(u["cacheCreationTokens"]),
    reasoningTokens: num(u["reasoningTokens"]),
    modelCalls: num(u["modelCalls"]),
    apiDurationMs: num(u["apiDurationMs"]),
    numTurns: num(u["numTurns"]),
    modelUsage: u["modelUsage"] ?? null,
  };
}

function withSession(state: AppState, sessionId: string, fn: (s: SessionState) => SessionState): AppState {
  const prev = state.sessions[sessionId] ?? emptySession(sessionId);
  return { ...state, sessions: { ...state.sessions, [sessionId]: fn(prev) }, appliedEvents: state.appliedEvents + 1 };
}

/** 替换/插入块（按 id）。tool-call 块用 toolCallId 关联，故为 upsert 语义。 */
function upsertBlock(blocks: Block[], block: Block): Block[] {
  const i = blocks.findIndex((b) => b.id === block.id);
  if (i < 0) return [...blocks, block];
  const next = blocks.slice();
  next[i] = block;
  return next;
}

/** tool_call_update.content 里 type=text 的文本拼接；没有文本项返回 null（不覆盖旧值）。 */
function contentTextOf(value: unknown): string | null {
  if (!Array.isArray(value)) return null;
  const parts: string[] = [];
  for (const item of value) {
    if (item === null || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    // 实测两种形态：扁 {type:"text",text}（夹具 diff/text 族）与嵌套
    // {type:"content",content:{type:"text",text}}（task spawn 完成帧，2026-09-11 真轮次抓到）。
    const direct = rec["type"] === "text" ? str(rec["text"]) : null;
    const inner = rec["type"] === "content" && isObj(rec["content"]) ? (rec["content"] as Record<string, unknown>) : null;
    const t = direct ?? (inner !== null && inner["type"] === "text" ? str(inner["text"]) : null);
    if (t !== null) parts.push(t);
  }
  return parts.length > 0 ? parts.join("\n") : null;
}

function patchToolBlock(
  blocks: Block[],
  toolCallId: string,
  patch: (b: Extract<Block, { kind: "tool-call" }>) => Extract<Block, { kind: "tool-call" }>,
): Block[] {
  const id = "tool:" + toolCallId;
  const existing = blocks.find((b) => b.id === id);
  const base: Extract<Block, { kind: "tool-call" }> =
    existing !== undefined && existing.kind === "tool-call"
      ? existing
      : {
          kind: "tool-call",
          id,
          toolCallId,
          name: null,
          title: null,
          toolKind: null,
          status: null,
          rawInput: null,
          locations: [],
          argsDelta: "",
          resultText: null,
          rawOutput: null,
          interactionPending: false,
          interactionKind: null,
        };
  return upsertBlock(blocks, patch(base));
}

/* ═══════════════════════ 主 reducer ═══════════════════════ */

export function reduce(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "connection/status":
      return { ...state, connection: { ...state.connection, status: action.status } };

    case "connection/initialized": {
      const r = action.result;
      const meta = isObj(r["_meta"]) ? r["_meta"] : {};
      const caps = isObj(r["agentCapabilities"]) ? r["agentCapabilities"] : {};
      const pc = isObj(caps["promptCapabilities"]) ? caps["promptCapabilities"] : null;
      return {
        ...state,
        connection: {
          status: "ready",
          agentVersion: str(meta["agentVersion"]) ?? str(r["agentVersion"]),
          modelState: meta["modelState"] ?? null,
          // 〔夹具〕initialize 只给 7 条；轮次中的 available_commands_update 给 167 条，
          // 命令面板必须以后者为准（session-events-measured.md §7）。
          initialCommands: arr(meta["availableCommands"]),
          promptCapabilities:
            pc === null
              ? null
              : {
                  image: pc["image"] === true,
                  audio: pc["audio"] === true,
                  embeddedContext: pc["embeddedContext"] === true,
                },
          authMethods: arr(r["authMethods"]),
        },
      };
    }

    case "session/created":
      return {
        ...withSession(state, action.sessionId, (s) => ({
          ...s,
          cwd: action.cwd ?? s.cwd,
          modelId: action.modelId ?? s.modelId,
        })),
        activeSessionId: action.sessionId,
      };

    case "session/activated":
      return { ...state, activeSessionId: action.sessionId };

    case "session/hydrated":
      return withSession(state, action.sessionId, (s) => ({
        ...s,
        title: action.title ?? s.title,
        titleSource: action.title != null ? action.titleSource ?? s.titleSource : s.titleSource,
        cwd: action.cwd ?? s.cwd,
        modelId: action.modelId ?? s.modelId,
        kind: action.kind ?? s.kind,
        modelOptions: action.modelOptions !== undefined && action.modelOptions.length > 0 ? action.modelOptions : s.modelOptions,
      }));

    case "kernel/server-request":
      return {
        ...state,
        pendingInteractions: [
          ...state.pendingInteractions,
          {
            id: action.id,
            method: action.method,
            sessionId: str(action.params["sessionId"]) ?? "",
            params: action.params,
          },
        ],
      };

    case "kernel/server-request-answered":
      return {
        ...state,
        pendingInteractions: state.pendingInteractions.filter((p) => p.id !== action.id),
      };

    case "kernel/unknown":
      return { ...state, unhandled: { ...state.unhandled, [action.key]: num(state.unhandled[action.key]) + 1 } };

    case "session/turn-requested":
      return withSession(state, action.sessionId, (s) => ({
        ...s,
        agentState: "turn-running",
        stopReason: null,
        turnUsage: null,
      }));

    case "session/mode-set":
      return withSession(state, action.sessionId, (s) => ({ ...s, mode: action.mode }));

    case "session/turn-failed":
      return withSession(state, action.sessionId, (s) => ({
        ...s,
        agentState: "idle",
        stopReason: "error",
        blocks: [
          ...s.blocks,
          {
            kind: "event",
            id: "err:" + action.sessionId + ":" + String(s.blocks.length),
            tag: "prompt-error",
            payload: { error: action.error },
          },
        ],
      }));

    case "session/cancel-requested":
      return withSession(state, action.sessionId, (s) => ({ ...s, agentState: "turn-cancelling" }));

    case "kernel/event":
      return projectEvent(state, action.event);
  }
}

/* ═══════════════════════ 事件投影 ═══════════════════════ */

export function projectEvent(state: AppState, ev: NormalizedEvent): AppState {
  switch (ev.type) {
    case "session-update":
      return projectSessionUpdate(state, ev.sessionId, ev.kind, ev.update, ev.meta);
    case "ext-notification":
      return projectExtNotification(state, ev.sessionId, ev.kind, ev.update, ev.meta);
    case "queue-changed":
      // 〔夹具〕{sessionId, entries[1]}（另有一次带 runningKind/runningPromptId/runningText）
      return withSession(state, ev.sessionId, (s) => ({ ...s, queueEntries: arr(ev.params["entries"]) }));
    case "search-fuzzy-status": {
      // 〔实测〕{sessionId, searchId, matches[…], total, done, generation}。
      // generation 单调：只接受比当前更新（或尚无）的批，乱序旧批直接丢——
      // 搜索框连打时内核会并行推多批，不丢旧批界面就会闪回旧结果。
      const generation = typeof ev.params["generation"] === "number" ? (ev.params["generation"] as number) : null;
      const cur = state.search;
      if (cur !== null && generation !== null && cur.generation !== null && generation < cur.generation) {
        return { ...state, appliedEvents: state.appliedEvents + 1 };
      }
      return {
        ...state,
        search: {
          searchId: str(ev.params["searchId"]) ?? "",
          sessionId: str(ev.params["sessionId"]) ?? "",
          matches: arr(ev.params["matches"]),
          total: typeof ev.params["total"] === "number" ? (ev.params["total"] as number) : null,
          done: ev.params["done"] === true,
          generation,
        },
        appliedEvents: state.appliedEvents + 1,
      };
    }
    case "sessions-changed": {
      // 〔夹具〕{upserted[1], removed[0]}；activity 六态见 PORTING-PLAN §2.2
      const roster = { ...state.roster };
      for (const u of arr(ev.params["upserted"])) {
        const entry = rosterRowOf(u);
        if (entry !== null) roster[entry.sessionId] = entry;
      }
      for (const r of arr(ev.params["removed"])) {
        const sid = str(r);
        if (sid !== null) delete roster[sid];
      }
      return { ...state, roster, appliedEvents: state.appliedEvents + 1 };
    }
    case "roster/upsert": {
      // _nofy/sessions/list 拉取结果走同一解析器。权限切档后内核**不推** sessions/changed
      // （acp_agent.rs:1256-1316 只改 handle 不广播），芯片读回靠这一拉。
      const roster = { ...state.roster };
      for (const u of ev.rows) {
        const entry = rosterRowOf(u);
        if (entry !== null) roster[entry.sessionId] = entry;
      }
      return { ...state, roster, appliedEvents: state.appliedEvents + 1 };
    }
    case "models-update":
      // 〔TUI Part 4〕nofy/models/update → 模型目录刷新；推的是完整 SessionModelState
      return { ...state, models: ev.params, appliedEvents: state.appliedEvents + 1 };
    case "settings-update":
      // 〔TUI Part 4〕nofy/settings/update → auto 闸门/软默认权限/group_tool_verbs/tips
      return { ...state, settings: ev.params, appliedEvents: state.appliedEvents + 1 };
    case "mcp":
      // 〔夹具〕servers_updated 带 {mcpServers[1]}；init_progress 带 {total,connected}；
      // server_status 带 {name,source,status,reason,tools}
      return {
        ...state,
        mcpServers: ev.name === "_nofy/mcp/servers_updated" ? arr(ev.params["mcpServers"]) : state.mcpServers,
        appliedEvents: state.appliedEvents + 1,
      };
    case "prompt-complete":
      // 陷阱 T5：**不得**以它作回合结束依据。〔源码 turn_end.rs:324-334〕它是
      // fire-and-forget，turn_completed 才是 persisted+replayed 轨上的 durable twin。
      // 此处只做登记，供与 turn_completed 交叉校验（实测晚 1ms）。
      return { ...state, appliedEvents: state.appliedEvents + 1 };
    case "unknown":
      return {
        ...state,
        unhandled: { ...state.unhandled, [ev.method]: num(state.unhandled[ev.method]) + 1 },
        appliedEvents: state.appliedEvents + 1,
      };
  }
}

/** 去重闸门：只对**带 eventId** 的事件生效（陷阱 T10）。 */
/**
 * roster 行解析器：推送（sessions/changed 的 upserted）与拉取（sessions/list 的 sessions）
 * 是同一种 RosterEntry（roster.rs:60-81 同一 struct），故共用一个解析器。
 * 〔实测键集〕{sessionId,title,cwd,isWorktree,modelId,yolo,activity,resident,
 *   lastChangeUnixMs,origin}（golden-permission.jsonl）；读不到的键一律 null/false。
 */
function rosterRowOf(u: unknown): RosterEntry | null {
  if (!isObj(u)) return null;
  const sid = str(u["sessionId"]) ?? str(u["id"]);
  if (sid === null) return null;
  const info = isObj(u["info"]) ? u["info"] : null;
  const lastChange = u["lastChangeUnixMs"];
  return {
    sessionId: sid,
    activity: str(u["activity"]) ?? (info !== null ? str(info["activity"]) : null),
    title: str(u["title"]) ?? (info !== null ? str(info["title"]) : null),
    cwd: str(u["cwd"]) ?? (info !== null ? str(info["cwd"]) : null),
    modelId: str(u["modelId"]) ?? (info !== null ? str(info["modelId"]) : null),
    isWorktree: u["isWorktree"] === true,
    yolo: u["yolo"] === true,
    resident: u["resident"] === true,
    lastChangeUnixMs: typeof lastChange === "number" ? lastChange : null,
    raw: u,
  };
}

function deduped(session: SessionState, meta: EventMeta): boolean {
  const seq = eventSeqOf(meta);
  if (seq === null) return false; // 无 eventId ⇒ 不参与去重
  return seq <= session.lastEventSeq;
}
function bumpSeq(session: SessionState, meta: EventMeta): number {
  const seq = eventSeqOf(meta);
  return seq !== null && seq > session.lastEventSeq ? seq : session.lastEventSeq;
}

function projectSessionUpdate(
  state: AppState,
  sessionId: string,
  kind: string,
  update: JsonObject,
  meta: EventMeta,
): AppState {
  const session = state.sessions[sessionId] ?? emptySession(sessionId);
  if (deduped(session, meta)) return state; // replay 重复帧

  switch (kind) {
    case "user_message_chunk": {
      // 〔夹具〕{content:{type:"text",text}, _meta:{modelId, promptIndex}}
      const content = isObj(update["content"]) ? update["content"] : {};
      const um = isObj(update["_meta"]) ? update["_meta"] : {};
      const block: Block = {
        kind: "user-message",
        id: "user:" + sessionId + ":" + String(session.blocks.length),
        text: str(content["text"]) ?? "",
        promptIndex: typeof um["promptIndex"] === "number" ? um["promptIndex"] : null,
        modelId: str(um["modelId"]),
      };
      return withSession(state, sessionId, (s) => ({
        ...s,
        blocks: [...s.blocks, block],
        currentPromptId: s.currentPromptId,
        lastEventSeq: bumpSeq(s, meta),
        // 新用户消息开一个回合（上一条还是 user-message 则视为同消息的后续帧，不重开）。
        turns:
          s.blocks.length > 0 && s.blocks[s.blocks.length - 1]?.kind === "user-message"
            ? s.turns
            : [...s.turns, { startedAt: Date.now(), endedAt: null }],
      }));
    }
    case "agent_message_chunk":
    case "agent_thought_chunk": {
      // 〔夹具〕{content:{type:"text",text}}；开合规则见 state.ts 的 Block 注释
      const content = isObj(update["content"]) ? update["content"] : {};
      const delta = str(content["text"]) ?? "";
      const isThought = kind === "agent_thought_chunk";
      return withSession(state, sessionId, (s) => {
        const openId = s.openAgentBlockId;
        const open = openId === null ? undefined : s.blocks.find((b) => b.id === openId);
        if (open !== undefined && open.kind === "agent-message" && !isThought) {
          return {
            ...s,
            blocks: upsertBlock(s.blocks, { ...open, text: open.text + delta }),
            lastEventSeq: bumpSeq(s, meta),
          };
        }
        const id = (isThought ? "thought:" : "agent:") + sessionId + ":" + String(s.blocks.length);
        const block: Block = isThought
          ? { kind: "agent-thought", id, text: delta, closed: false }
          : { kind: "agent-message", id, text: delta, closed: false, usage: null };
        return {
          ...s,
          blocks: [...s.blocks, block],
          openAgentBlockId: isThought ? s.openAgentBlockId : id,
          lastEventSeq: bumpSeq(s, meta),
        };
      });
    }
    case "tool_call": {
      // 〔夹具〕{toolCallId, title:"read_file"（原始工具名）, rawInput:{target_file}, _meta:{"nofy/tool":{…}}}
      // 注意首帧**没有** kind / locations / status；那些随 tool_call_update 到。
      const toolCallId = str(update["toolCallId"]) ?? "";
      return withSession(state, sessionId, (s) => ({
        ...s,
        blocks: patchToolBlock(s.blocks, toolCallId, (b) => ({
          ...b,
          name: str(update["title"]) ?? b.name,
          rawInput: update["rawInput"] ?? b.rawInput,
          status: str(update["status"]) ?? b.status,
        })),
        lastEventSeq: bumpSeq(s, meta),
      }));
    }
    case "tool_call_update": {
      // 〔夹具〕{toolCallId, kind:"read", title:"Read \`hello.txt\`"（展示标题）,
      //        locations[1], rawInput:{variant:"ReadFile",target_file}, _meta:{"nofy/tool":{…}}}
      // title 与 tool_call 的 title **语义不同**（展示名 vs 原始工具名），分别存 title/name。
      const toolCallId = str(update["toolCallId"]) ?? "";
      return withSession(state, sessionId, (s) => ({
        ...s,
        blocks: patchToolBlock(s.blocks, toolCallId, (b) => ({
          ...b,
          title: str(update["title"]) ?? b.title,
          toolKind: str(update["kind"]) ?? b.toolKind,
          status: str(update["status"]) ?? b.status,
          locations: arr(update["locations"]).length > 0 ? arr(update["locations"]) : b.locations,
          rawInput: update["rawInput"] ?? b.rawInput,
          resultText: contentTextOf(update["content"]) ?? b.resultText,
          rawOutput: update["rawOutput"] ?? b.rawOutput,
        })),
        lastEventSeq: bumpSeq(s, meta),
      }));
    }
    case "available_commands_update": {
      // 〔夹具〕{availableCommands[167], _meta:{tools[25]}}；_meta.updateParams.commandsCount=167
      const commands = arr(update["availableCommands"]);
      const um = isObj(update["_meta"]) ? update["_meta"] : {};
      const tools = arr(um["tools"]).map((t) => str(t)).filter((t): t is string => t !== null);
      return withSession(state, sessionId, (s) => ({
        ...s,
        availableCommands: commands,
        availableTools: tools.length > 0 ? tools : s.availableTools,
        lastEventSeq: bumpSeq(s, meta),
      }));
    }
    case "session_info_update": {
      // 〔夹具〕{title}；**不带 eventId**（session-events-measured.md §3）⇒ 不参与去重
      const title = str(update["title"]);
      return withSession(state, sessionId, (s) => ({
        ...s,
        title: title ?? s.title,
        titleSource: title !== null ? "session_info_update" : s.titleSource,
      }));
    }
    case "current_mode_update": {
      // 〔协议形状〕ACP CurrentModeUpdate = {currentModeId}（schema 生成表坐实）；
      // 内核发射点 updates.rs:186-190 / notification_bridge.rs:211-218。
      // 权限芯片的读回之一：进 store，不再只当事件块登记。
      const mid = str(update["currentModeId"]);
      return withSession(state, sessionId, (s) => ({
        ...s,
        mode: mid ?? s.mode,
        lastEventSeq: bumpSeq(s, meta),
      }));
    }
    case "plan":
      // 〔未测〕plan 块载荷形状未实测：只登记为事件块，不臆造字段。P2 录 plan 夹具时补全。
      return withSession(state, sessionId, (s) => ({
        ...s,
        blocks: [
          ...s.blocks,
          { kind: "event", id: "ev:" + sessionId + ":" + String(s.blocks.length), tag: kind, payload: update },
        ],
        lastEventSeq: bumpSeq(s, meta),
      }));
    default:
      return {
        ...state,
        unhandled: { ...state.unhandled, ["session-update#" + kind]: num(state.unhandled["session-update#" + kind]) + 1 },
        appliedEvents: state.appliedEvents + 1,
      };
  }
}

function projectExtNotification(
  state: AppState,
  sessionId: string,
  kind: string,
  update: JsonObject,
  meta: EventMeta,
): AppState {
  const session = state.sessions[sessionId] ?? emptySession(sessionId);
  if (deduped(session, meta)) return state;

  switch (kind) {
    case "turn_completed": {
      // 〔夹具〕{prompt_id, stop_reason:"end_turn", usage{camelCase, 10 字段}}
      // 〔源码 turn_end.rs:324-334〕权威回合收尾：persisted+replayed 轨，重连可从 replay 恢复。
      const usage = parseTurnUsage(update["usage"]);
      const next = withSession(state, sessionId, (s) => ({
        ...s,
        agentState: "idle",
        stopReason: str(update["stop_reason"]),
        turnUsage: usage ?? s.turnUsage,
        currentPromptId: str(update["prompt_id"]) ?? s.currentPromptId,
        // 关回合：最后一个开着的 turn 记本地墙钟终点（「已工作 Ns」turn 头用）。
        turns: s.turns.map((t, i) => (i === s.turns.length - 1 && t.endedAt === null ? { ...t, endedAt: Date.now() } : t)),
        // 收尾时关掉仍开着的 agent 块（正常路径下 response_completed 已关）
        openAgentBlockId: null,
        blocks: s.blocks.map((b) =>
          b.kind === "agent-message" && !b.closed ? { ...b, closed: true } : b,
        ),
        lastEventSeq: bumpSeq(s, meta),
      }));
      // 回合收尾＝该会话挂起的权限/问答请求已死（内核不再等应答）。
      // 不清就会留下点不动的孤儿审批卡（2026-09-13 实机三张叠卡事故的另一半）。
      return {
        ...next,
        pendingInteractions: next.pendingInteractions.filter((p) => p.sessionId !== sessionId),
      };
    }
    case "response_completed": {
      // 〔夹具〕{usage{snake_case, 5 字段}} —— **段级**收尾，一轮可多次（本轮 2 次）。
      // 陷阱 T11：它不是回合结束；把它当收尾会在多段轮次里提前关轮。
      const usage = parseSegmentUsage(update["usage"]);
      return withSession(state, sessionId, (s) => {
        const openId = s.openAgentBlockId;
        if (openId === null) return { ...s };
        return {
          ...s,
          openAgentBlockId: null,
          blocks: s.blocks.map((b) =>
            b.id === openId && b.kind === "agent-message" ? { ...b, closed: true, usage } : b,
          ),
        };
      });
    }
    case "tool_call_delta_chunk": {
      // 〔夹具〕**只有第一帧**是 {tool_call_id, tool_index, name, arguments_delta}；
      // 后续帧仅 {sessionUpdate, tool_index, arguments_delta}——关联键是 tool_index。
      // ⚠ 时间轴上 delta 早于 tool_call（3014ms vs 3226ms），故须能凭 delta 先建块，
      //   再由 tool_call / tool_call_update 补全 name/title/kind。
      const idx = typeof update["tool_index"] === "number" ? update["tool_index"] : null;
      const directId = str(update["tool_call_id"]);
      const delta = str(update["arguments_delta"]) ?? "";
      // 解析关联 id：本帧自带 ⇒ 登记 tool_index→id 映射；否则查映射
      const map = { ...session.toolIndexToId };
      if (directId !== null && idx !== null) map[idx] = directId;
      const toolCallId = directId ?? (idx !== null ? map[idx] ?? null : null);
      if (toolCallId === null) {
        // 解析不出关联 ⇒ **不建块**（否则会留下 toolCallId="" 的幽灵工具卡，
        // 在脊柱上渲染成一张空卡片）。按纪律显式计数，不静默丢弃。
        const key = "ext#tool_call_delta_chunk:unresolved-index";
        return {
          ...state,
          unhandled: { ...state.unhandled, [key]: num(state.unhandled[key]) + 1 },
          appliedEvents: state.appliedEvents + 1,
        };
      }
      return withSession(state, sessionId, (s) => ({
        ...s,
        toolIndexToId: map,
        agentState: s.agentState === "idle" ? "turn-running" : s.agentState,
        blocks: patchToolBlock(s.blocks, toolCallId, (b) => ({
          ...b,
          name: b.name ?? str(update["name"]),
          argsDelta: b.argsDelta + delta,
        })),
      }));
    }
    case "model_changed":
      // 〔夹具〕{model_id}（snake_case）；**不带 eventId** ⇒ 不参与去重（陷阱 T10）
      return withSession(state, sessionId, (s) => ({ ...s, modelId: str(update["model_id"]) ?? s.modelId }));
    case "session_summary_generated":
      // 〔夹具〕{session_summary}；与 session_info_update 同毫秒各发一次，幂等取最后非空
      return withSession(state, sessionId, (s) => {
        const t = str(update["session_summary"]);
        return t === null ? s : { ...s, title: t, titleSource: "session_summary_generated" };
      });
    case "pending_interaction":
      // 〔夹具〕{tool_call_id, kind:"permission"}；本轮与 interaction_resolved 同毫秒成对出现
      //（只读工具自动放行，没有 session/request_permission 帧）
      return withSession(state, sessionId, (s) => ({
        ...s,
        blocks: patchToolBlock(s.blocks, str(update["tool_call_id"]) ?? "", (b) => ({
          ...b,
          interactionPending: true,
          interactionKind: str(update["kind"]) ?? b.interactionKind,
        })),
      }));
    case "interaction_resolved":
      // 〔夹具〕{tool_call_id}
      return withSession(state, sessionId, (s) => ({
        ...s,
        blocks: patchToolBlock(s.blocks, str(update["tool_call_id"]) ?? "", (b) => ({
          ...b,
          interactionPending: false,
        })),
      }));
    case "hook_execution": {
      // 〔夹具〕{event_name:"session_start", runs[1]}；带 eventId（持久轨）
      // 块 id **必须**由 eventId 派生，不能用 blocks.length：
      //   ① 重放时同一 seq 的 hook 要 upsert 到同一块，否则脊柱上出现重复的
      //      session_start；② blocks.length 会随任何前置块增删而漂移，当 React key 不稳。
      // 实测（replay-dedup-measured.md）：session/load 会重放 seq 2/4/7 的 hook，
      // 并**新增** seq 10 的 session_start（load 真的又跑了一次该 hook）。
      const seq = eventSeqOf(meta);
      const hookId = "hook:" + sessionId + ":" + (seq !== null ? "e" + String(seq) : "n" + String(session.blocks.length));
      const tag = "hook:" + (str(update["event_name"]) ?? "?");
      return withSession(state, sessionId, (s) => {
        const block: Block = { kind: "event", id: hookId, tag, payload: update["runs"] ?? null };
        const exists = s.blocks.some((x) => x.id === hookId);
        return {
          ...s,
          blocks: exists ? upsertBlock(s.blocks, block) : [...s.blocks, block],
          lastEventSeq: bumpSeq(s, meta),
        };
      });
    }
    case "subagent_finished": {
      // 〔内核〕extensions/notification.rs SessionUpdate::SubagentFinished：父会话通道，
      // {subagent_id, child_session_id, status: completed|failed|cancelled, error?, tool_calls,
      //  turns, duration_ms, tokens_used, output?, will_wake}。
      // detached 子智能体（父回合已收、不再轮询）没有轮询完成帧 ⇒ 这是它「结束」的唯一桌面信号；
      // 不接它，右上 / composer 后台胶囊在子智能体跑完后永不消失（2026-09-11 活体复现）。
      const sid = str(update["subagent_id"]) ?? str(update["child_session_id"]);
      if (sid === null) return { ...state, appliedEvents: state.appliedEvents + 1 };
      const info: SubagentFinishedInfo = {
        status: str(update["status"]) ?? "completed",
        error: str(update["error"]),
        durationMs: typeof update["duration_ms"] === "number" ? (update["duration_ms"] as number) : null,
        output: str(update["output"]),
      };
      return withSession(state, sessionId, (s) => ({
        ...s,
        subagentFinished: { ...s.subagentFinished, [sid]: info },
        lastEventSeq: bumpSeq(s, meta),
      }));
    }
    default:
      // subagent_* / auto_compact_* / rewind_marker 等：TUI Part 4 有记载但**本轮未实测载荷**。
      // 按「一条不造」显式计数，待对应夹具录到后再实现。
      return {
        ...state,
        unhandled: {
          ...state.unhandled,
          ["ext#" + kind]: num(state.unhandled["ext#" + kind]) + 1,
        },
        appliedEvents: state.appliedEvents + 1,
      };
  }
}

export { initialState };
