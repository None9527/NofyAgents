// nofy ACP ↔ ZCode Protocol stdio adapter — D5c
//
// 被 host 以 ZCODE_AGENT_SERVER_COMMAND 形态 spawn（args: app-server --stdio），
// 在 stdio 上说 ZCode Protocol（ndjson JSON-RPC），在内核侧说 ACP（ws）。
// 被删 host agent 服务 = 原推送源；本适配器从 ACP 重建推送：
//   * v4/conversation/frame（topic: conversation/<sid> / sessions-index/<ws> /
//     workspace-config/<ws>）wire envelope wireVersion=3 kind=complete
//   * v4/command（createSession/sendText/stop/resolveInteraction…）→ ACP
//     session/new(cwd=项目路径, scope='task') / session/prompt / session/cancel /
//     permission 应答（内联权限形态回传）
//   * load replay + 高水位：session/load 回放重建 rows；per-topic seq 单调递增。
// 日志一律 stderr/文件，stdout 仅 ndjson 协议帧。

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { NofyAcpClient, chunkText } from "./acp-client.js";
import { firstUserQueryTitle } from "./session-title.js"; // WS-ENUM：标题回退链末环

const WIRE_VERSION = 3;
const LOG_EPOCH = "nofy-d5c-1";
// HOME-ISO：Home 段虚拟工作区——kind='home' 会话索引进该 scope（与 cwd scope 互斥）
const HOME_WORKSPACE_ID = "__home__";

const logFile = process.env.NOFY_ADAPTER_LOG || "/tmp/nofy-adapter.log";
function log(...args) {
  try {
    fs.appendFileSync(logFile, `${new Date().toISOString()} ${args.map((a) => (typeof a === "string" ? a : JSON.stringify(a))).join(" ")}\n`);
  } catch {}
}
// FIX-RESUME：同类日志节流——同一 key 只记一次（防存量 session 逐个 resume 的错误刷屏写盘）
const loggedOnce = new Set();
function logOnce(key, ...args) {
  if (loggedOnce.has(key)) return;
  if (loggedOnce.size > 8000) loggedOnce.clear();
  loggedOnce.add(key);
  log(...args);
}
process.on("uncaughtException", (e) => log("uncaught", String(e?.stack || e)));
process.on("unhandledRejection", (e) => log("unhandledRejection", String(e?.stack || e)));

/* ───────────────────────── stdio JSON-RPC 端 ───────────────────────── */

let inputBuf = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  inputBuf += chunk;
  let idx;
  while ((idx = inputBuf.indexOf("\n")) >= 0) {
    const line = inputBuf.slice(0, idx).trim();
    inputBuf = inputBuf.slice(idx + 1);
    if (!line) continue;
    let frame;
    try {
      frame = JSON.parse(line);
    } catch {
      continue;
    }
    void handleHostFrame(frame);
  }
});
process.stdin.on("end", () => process.exit(0));

function send(frame) {
  try {
    process.stdout.write(JSON.stringify(frame) + "\n");
  } catch (e) {
    log("stdout write failed", String(e?.message));
  }
}
function respond(id, result) {
  send({ id, result });
}
function respondError(id, code, message) {
  send({ id, error: { code, message } });
}
function notify(method, params) {
  send({ method, params });
}

/* ───────────────────────── 小工具 ───────────────────────── */

const now = () => Date.now();
let uid = 0;
const nextId = (p) => `${p}-${++uid}-${process.pid}`;

function discoveryUrl() {
  if (process.env.NOFY_ACP_URL?.trim()) return process.env.NOFY_ACP_URL.trim();
  try {
    const state = JSON.parse(
      fs.readFileSync(path.join(os.homedir(), ".local", "share", "nofy-desktop", "kernel.json"), "utf8"),
    );
    if (state?.url) return state.url;
  } catch {}
  return "ws://127.0.0.1:9800/ws?server-key=nofy-desktop";
}

// P0.5 拓扑：默认派生**私有 `nofy agent stdio` 子进程**（无端口、无 secret、天然单父客户端
// ⇒ 结构性免除 §2.3「serve 形单客户端通知转发」约束——该约束正是 ws 形下助手流式块
// 可能被别的客户端抢走的成因）。仅当显式给出 NOFY_ACP_URL（或 NOFY_ACP_STDIO=0）时走 ws attach 形。
const useStdio = !process.env.NOFY_ACP_URL?.trim() && process.env.NOFY_ACP_STDIO !== "0";
const acp = new NofyAcpClient({
  url: useStdio ? null : discoveryUrl(),
  stdio: useStdio,
  clientName: "nofy-desktop-adapter",
});
acp.on("status", (s) => log("acp status", s));
acp.on("ready", () => {
  log("acp ready");
  void backfillAllIndexes(); // FIX-WS：静默回填（存量行进初始快照，不发 online deltas）
});
acp.connect();

/* ───────────────────────── 会话状态（rows / 高水位） ───────────────────────── */

/** sessionId -> SessionState */
const sessions = new Map();
/** workspaceId -> { sessions: Map<sid, IndexEntry>, seq, subscribers } */
const workspaces = new Map();
/** topic -> Map<subscriptionId, {ordinal}> */
const subscribersByTopic = new Map();
// WS-ENUM：sid→cwd 提示（workspace_list 枚举产物）——未打开 workspace 的会话
// 也能在 session/load / conversation 订阅时解析出正确 cwd。
const sessionCwdHints = new Map();

function sessionState(sessionId, workspaceId) {
  let s = sessions.get(sessionId);
  if (!s) {
    s = {
      sessionId,
      workspaceId: workspaceId ?? "",
      kind: "task", // HOME-ISO：存量/默认＝任务路；Home 发起面创建时打 'home'
      title: "",
      rows: [],
      rowIdSeq: 0,
      turnSeq: 0,
      seq: 0, // conversation topic 高水位
      revision: 0,
      phase: "draft",
      sessionEnded: false,
      pendingInteractions: [],
      pendingAcpPermissions: new Map(), // interactionId -> {acpId, optionIds}
      liveTurn: null, // {turnId, headerRowId, assistantRowId, assistantRow, assistantText, toolRows:Map}
      createdAt: now(),
      lastActivityAt: now(),
      replayedOnce: false,
    };
    sessions.set(sessionId, s);
    indexUpsert(s, "created");
  }
  return s;
}

function workspaceState(workspaceId) {
  let w = workspaces.get(workspaceId);
  if (!w) {
    // FIX-WS：loaded＝该 workspace 的存量会话已从 daemon 懒加载入索引（初始快照可含全量行）
    w = { workspaceId, entries: new Map(), seq: 0, title: "", loaded: false };
    workspaces.set(workspaceId, w);
  }
  return w;
}

function indexUpsert(s, reason) {
  // HOME-ISO：按发起面 kind 路由索引作用域——home 会话进 __home__（Home 段独占），
  // task 会话进 cwd 工作区（项目段）；两者互斥，Home 不混入任务路会话。
  const scopeId = s.kind === "home" ? HOME_WORKSPACE_ID : s.workspaceId || "";
  const w = workspaceState(scopeId);
  w.entries.set(s.sessionId, {
    sessionId: s.sessionId,
    workspaceId: scopeId,
    title: s.title || s.sessionId.slice(0, 8),
    titleSource: "default",
    phase: s.phase,
    sessionEnded: s.sessionEnded,
    hasBackgroundWork: false,
    lastActivityAt: s.lastActivityAt,
    createdAt: s.createdAt,
  });
  emitSessionsIndexDelta(w, [{ op: "session.upserted", session: w.entries.get(s.sessionId) }]);
  log("index upsert", reason, s.sessionId, s.phase, "kind", s.kind, "scope", scopeId);
}

/* ───────────────────────── wire frame 发射 ───────────────────────── */

// 注意：complete wire frame 的 superRefine 要求 frame.topic/subscriptionId 与外层一致，
// 因此 frame 内 subscriptionId 必须逐订阅者填写（builder 形态）。
function emitWireFrameFor(topic, frameBuilder, deliveryKind) {
  const subs = subscribersByTopic.get(topic);
  if (!subs || subs.size === 0) return 0;
  let sent = 0;
  for (const [subscriptionId, st] of subs) {
    st.ordinal += 1;
    log("→ frame", topic, "sub", subscriptionId, deliveryKind, "ord", st.ordinal);
    notify("v4/conversation/frame", {
      wireVersion: WIRE_VERSION,
      kind: "complete",
      deliveryKind,
      logicalFrameId: `${topic}::${subscriptionId}::${st.ordinal}`,
      logicalFrameOrdinal: st.ordinal,
      topic,
      subscriptionId,
      frame: frameBuilder(subscriptionId),
    });
    sent += 1;
  }
  return sent;
}

function emitConv(s, deltas) {
  if (!deltas.length) return;
  log(
    "conv-deltas",
    s.sessionId,
    deltas
      .map((d) => `${d.op}:${d.row?.kind ?? d.path ?? ""}:${d.row?.status ?? d.row?.state ?? ""}`)
      .join(","),
  );
  const fromSeq = s.seq;
  s.seq += 1;
  s.lastActivityAt = now();
  const toSeq = s.seq;
  const sentAt = now();
  emitWireFrameFor(
    `conversation/${s.sessionId}`,
    (subscriptionId) => ({
      topic: `conversation/${s.sessionId}`,
      subscriptionId,
      fromSeq,
      toSeq,
      sentAt,
      payload: { kind: "deltas", deltas },
    }),
    "online",
  );
}

function emitSessionsIndexDelta(w, ops) {
  const fromSeq = w.seq;
  w.seq += 1;
  const toSeq = w.seq;
  const sentAt = now();
  emitWireFrameFor(
    `sessions-index/${w.workspaceId}`,
    (subscriptionId) => ({
      topic: `sessions-index/${w.workspaceId}`,
      subscriptionId,
      fromSeq,
      toSeq,
      sentAt,
      payload: { kind: "deltas", deltas: ops },
    }),
    "online",
  );
}

/* ───────────────────────── 快照构建 ───────────────────────── */

function controlOf(s) {
  const running = s.phase === "running" || s.phase === "prewarming";
  return {
    phase: s.phase,
    sessionEnded: s.sessionEnded,
    canStop: running,
    stopState: running ? "stoppable" : "idle",
    stopTargetKind: running ? "assistant" : "unknown",
    activeWorks: [],
    lastError: s.lastError ?? null,
    apiRetry: null,
  };
}

const AVAILABILITY = {
  fork: { allowed: true },
  compact: { allowed: true },
  switchModelConfig: { allowed: true },
  setFollowupMode: { allowed: true },
  queueEdit: { allowed: true },
  sendQueuedNow: { allowed: true },
  pauseGoal: { allowed: true },
  resumeGoal: { allowed: true },
};

function configOf() {
  return {
    provider: "nofy",
    model: process.env.NOFY_MODEL_LABEL || "nofy-kernel",
    thought: "",
    thoughtLevels: [],
    followupMode: "queue",
    mode: "build",
  };
}

// kk schema: {workspace, settings:Uf, modelCatalog?, slashCommands?} strict
function workspaceStateResult(workspace) {
  return {
    workspace,
    settings: {
      model: {
        current: { providerId: "nofy", modelId: configOf().model },
        available: [],
      },
      thoughtLevel: { enabled: false, available: [] },
      mode: { current: "build" },
    },
  };
}

function usageZero() {
  return {
    contextWindow: null,
    cumulative: { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 },
  };
}

/* ───────────────────────── FIX-RESUME：ZCode Protocol 会话快照 ─────────────────────────
 * host 对 session/create|resume|read|setModel|setThoughtLevel|setMode 的响应用同一
 * 严格 zod 形状校验（缺字段即 warn 刷屏；存量 session 逐个 resume 时曾写满磁盘）。
 * 必填：protocol / session(workspace/sessionKind/title/mode/status/createdAt/updatedAt) /
 *       settings(model.available/thoughtLevel/mode) / projection / runtime / messages。
 * 数值时间戳＝ms int；traceId 为 optional string（null/"" 都非法，直接省略）。 */
const ZCODE_PROTOCOL = Object.freeze({ name: "ZCode Protocol", version: 1 });

function zcodeMode() {
  return "build";
}

function zcodeSettings() {
  return {
    appliedProviderRevision: "nofy-rev-0",
    model: {
      current: { providerId: "nofy", modelId: configOf().model },
      available: [],
    },
    thoughtLevel: { enabled: false, available: [] },
    mode: { current: zcodeMode() },
  };
}

function zcodeProjectionStatus(s) {
  return s?.phase === "running" ? "running" : s?.phase === "error" ? "error" : "idle";
}

// 标题回退链（复用 session-title.js）：live 标题 || 首条用户消息（截断）|| sid 前 8 位
function zcodeTitle(s, cwd) {
  if (s?.title) return { title: s.title, titleSource: "generated" };
  const fb = firstUserQueryTitle(cwd, s?.sessionId);
  if (fb) return { title: fb, titleSource: "first_input" };
  return { title: String(s?.sessionId ?? "").slice(0, 8), titleSource: "default" };
}

function zcodeSessionSnapshot(s, cwdOverride) {
  const cwd = cwdOverride || s?.workspaceId || process.cwd();
  const createdAt = Number.isFinite(s?.createdAt) ? s.createdAt : now();
  const updatedAt = Number.isFinite(s?.lastActivityAt) ? s.lastActivityAt : createdAt;
  const { title, titleSource } = zcodeTitle(s, cwd);
  const status = zcodeProjectionStatus(s);
  return {
    protocol: { ...ZCODE_PROTOCOL },
    session: {
      sessionId: s.sessionId,
      workspace: { workspacePath: cwd, workspaceKey: cwd },
      sessionKind: "interactive", // FIX-RESUME：存量会话默认交互态
      title,
      titleSource,
      mode: zcodeMode(),
      status,
      model: { providerId: "nofy", modelId: configOf().model },
      createdAt,
      updatedAt,
    },
    settings: zcodeSettings(),
    projection: {
      sessionId: s.sessionId,
      status,
      mode: zcodeMode(),
      turnCount: s?.turnSeq | 0,
      totalTokenCount: 0,
      contextUsed: 0,
      contextWindow: 0,
      pendingPermissions: [],
      activeToolCalls: [],
      backgroundJobs: [],
    },
    runtime: {
      eventSeq: s?.seq | 0,
      stateRevision: s?.revision | 0,
      pendingRequestIds: [],
    },
    messages: [],
  };
}

function conversationSnapshot(s, subscriptionId) {
  return {
    topic: `conversation/${s.sessionId}`,
    subscriptionId,
    fromSeq: 0,
    toSeq: s.seq,
    sentAt: now(),
    payload: {
      kind: "snapshot",
      snapshot: {
        protocolVersion: 1,
        sessionId: s.sessionId,
        logEpoch: LOG_EPOCH,
        seq: s.seq,
        revision: s.revision,
        control: controlOf(s),
        availability: AVAILABILITY,
        inputRouting: { mode: "startNow" },
        meta: { title: s.title || "", titleSource: "default" },
        config: configOf(),
        modelTransition: null,
        usage: usageZero(),
        queue: { items: [], autoDrain: true },
        pendingInteractions: [...s.pendingInteractions],
        pendingCommands: [],
        backgroundWorks: [],
        goal: null,
        plan: null,
        rows: {
          window: [...s.rows],
          totalCount: s.rows.length,
          firstRowId: s.rows.length ? s.rows[0].rowId : null,
        },
      },
    },
  };
}

function sessionsIndexSnapshot(w, subscriptionId) {
  return {
    topic: `sessions-index/${w.workspaceId}`,
    subscriptionId,
    fromSeq: 0,
    toSeq: w.seq,
    sentAt: now(),
    payload: {
      kind: "snapshot",
      snapshot: {
        protocolVersion: 1,
        workspaceId: w.workspaceId,
        logEpoch: LOG_EPOCH,
        sessions: [...w.entries.values()],
      },
    },
  };
}

function workspaceConfigSnapshot(workspaceId, subscriptionId) {
  return {
    topic: `workspace-config/${workspaceId}`,
    subscriptionId,
    fromSeq: 0,
    toSeq: 1,
    sentAt: now(),
    payload: {
      kind: "snapshot",
      snapshot: {
        protocolVersion: 1,
        workspaceId,
        logEpoch: LOG_EPOCH,
        config: { configOptions: [], slashCommands: [] },
      },
    },
  };
}

/* ───────────────────────── row 构建（ACP → v4 rows） ───────────────────────── */

function newRowBase(s, turnId) {
  s.rowIdSeq += 1;
  return { rowId: s.rowIdSeq, turnId, createdAt: now(), createdAtSeq: s.rowIdSeq };
}

function beginTurn(s, text) {
  s.turnSeq += 1;
  const turnId = `${s.sessionId}-turn-${s.turnSeq}`;
  const header = { ...newRowBase(s, turnId), kind: "turnHeader", origin: "userInput", state: "running", startedAt: now() };
  const input = { ...newRowBase(s, turnId), kind: "userInput", text, origin: "realUser" };
  s.rows.push(header, input);
  s.liveTurn = { turnId, headerRowId: header.rowId, assistantRowId: null, assistantText: "", toolRows: new Map() };
  s.phase = "running";
  s.sessionEnded = false;
  s.lastError = null;
  emitConv(s, [
    { op: "row.appended", row: header },
    { op: "row.appended", row: input },
    { op: "state.updated", patch: { control: controlOf(s) } },
  ]);
  indexUpsert(s, "turn-start");
  return turnId;
}

function onAcpUpdate(params, opts = {}) {
  const sessionId = String(params.sessionId ?? "");
  if (!sessionId) return;
  const s = sessions.get(sessionId);
  if (!s) {
    if (opts.replay) return replayUpdate(sessionId, params.update);
    return; // 未跟踪会话的 live 更新：忽略（sidebar 经 sessions-index 展示）
  }
  // 回放窗口内的已跟踪会话：走 replay 缓冲（applyUpdate 依赖 liveTurn，会丢回放块）
  if (s.replaying) return replayUpdate(sessionId, params.update);
  const update = params.update;
  if (!update || typeof update !== "object") return;
  applyUpdate(s, update, opts);
}

function applyUpdate(s, update, opts = {}) {
  const deltas = [];
  const live = s.liveTurn;
  switch (update.sessionUpdate) {
    case "agent_message_chunk": {
      const text = chunkText(update.content);
      if (!text) break;
      if (!live) break;
      if (live.assistantRowId == null) {
        const row = { ...newRowBase(s, live.turnId), kind: "assistantText", text, state: "streaming" };
        s.rows.push(row);
        live.assistantRowId = row.rowId;
        live.assistantRow = row;
        live.assistantText = text;
        deltas.push({ op: "row.appended", row });
      } else {
        live.assistantText += text;
        // D10：存量行的 text 必须同步累积。收尾的 row.upserted、以及任何快照/回放/重订阅
        // 都读 row.text；只累积 live.assistantText 会让终帧把九条 row.delta 的成果覆盖回首块
        // （实测 UI 停在「我是 N」两字，而完整回复是 63 字）。
        if (live.assistantRow) live.assistantRow.text = live.assistantText;
        deltas.push({ op: "row.delta", rowId: live.assistantRowId, path: "text", append: text });
      }
      break;
    }
    case "agent_thought_chunk":
      break; // 初步接线不渲染 reasoning（TODO）
    case "user_message_chunk":
      break; // 回声，userInput 行已由 beginTurn 记录
    case "tool_call": {
      if (!live) break;
      const rawInput = update.rawInput;
      const inputObj =
        rawInput && typeof rawInput === "object" && !Array.isArray(rawInput)
          ? rawInput
          : typeof rawInput === "string"
            ? { command: rawInput }
            : {};
      const row = {
        ...newRowBase(s, live.turnId),
        kind: "toolCall",
        toolCallId: String(update.toolCallId ?? nextId("tc")),
        // shell 族命名，令 renderer 分类为 shell → ShellToolView（$ 命令 + 输出块）
        toolName: String(update.kind === "execute" ? "bash" : update.title ?? "tool"),
        status: "running",
        inputText: safeStringify(update.rawInput),
        input: inputObj,
        startedAt: now(),
      };
      s.rows.push(row);
      live.toolRows.set(row.toolCallId, row.rowId);
      deltas.push({ op: "row.appended", row });
      break;
    }
    case "tool_call_update": {
      if (!live) break;
      const rowId = live.toolRows.get(String(update.toolCallId ?? "")) ?? findToolRowId(s, update);
      if (rowId == null) break;
      const prev = s.rows.find((r) => r.rowId === rowId);
      if (!prev) break;
      const text = toolUpdateText(update);
      const status =
        update.status === "completed" ? "success" : update.status === "failed" ? "error" : prev.status;
      const upserted = {
        ...prev,
        status: prev.status === "pendingApproval" && status === "running" ? "running" : status,
        ...(text ? { output: { text } } : {}),
      };
      Object.assign(prev, upserted);
      deltas.push({ op: "row.upserted", row: upserted });
      break;
    }
    case "session_info_update": {
      if (typeof update.title === "string" && update.title) {
        s.title = update.title;
        deltas.push({ op: "state.updated", patch: { meta: { title: s.title, titleSource: "default" } } });
        indexUpsert(s, "title");
      }
      break;
    }
    default:
      break;
  }
  if (deltas.length) emitConv(s, deltas);
}

function findToolRowId(s, update) {
  if (!s.liveTurn) return null;
  for (const [, rowId] of s.liveTurn.toolRows) {
    const r = s.rows.find((x) => x.rowId === rowId);
    if (r && update.title && r.toolName === update.title) return rowId;
  }
  const last = [...(s.liveTurn?.toolRows.values() ?? [])].pop();
  return last ?? null;
}

function toolUpdateText(update) {
  const content = update.content;
  if (Array.isArray(content)) {
    const texts = content
      .map((b) => (b?.type === "content" ? b?.content?.text : b?.text))
      .filter((t) => typeof t === "string" && t.length > 0);
    if (texts.length) return texts.join("\n");
  }
  const raw = update.rawOutput;
  if (raw && typeof raw.output_for_prompt === "string") return raw.output_for_prompt;
  return "";
}

function safeStringify(v) {
  try {
    return typeof v === "string" ? v : JSON.stringify(v ?? {});
  } catch {
    return "{}";
  }
}

function settleTurn(s, ok, errMsg) {
  const deltas = [];
  const live = s.liveTurn;
  if (live) {
    if (live.assistantRowId != null) {
      const row = s.rows.find((r) => r.rowId === live.assistantRowId);
      if (row) {
        const up = { ...row, state: "complete" };
        Object.assign(row, up);
        deltas.push({ op: "row.upserted", row: up });
      }
    }
    const header = s.rows.find((r) => r.rowId === live.headerRowId);
    if (header) {
      const up = { ...header, state: ok ? "completedSuccess" : "failed", endedAt: now() };
      Object.assign(header, up);
      deltas.push({ op: "row.upserted", row: up });
    }
  }
  s.liveTurn = null;
  s.phase = ok ? "completedSuccess" : "error";
  s.sessionEnded = true;
  s.lastError = ok
    ? null
    : { code: "nofy.promptFailed", message: String(errMsg || "prompt failed"), recoverable: true, at: now(), source: "runtime" };
  deltas.push({ op: "state.updated", patch: { control: controlOf(s) } });
  emitConv(s, deltas);
  indexUpsert(s, "settle");
}

/* ───────────────────────── load replay（高水位续接） ───────────────────────── */

const replayBuffers = new Map(); // sessionId -> {turnId, rows}

function replayUpdate(sessionId, update) {
  let buf = replayBuffers.get(sessionId);
  if (!buf) {
    buf = { turnSeq: 0, turnId: null, rows: [], lastAssistant: null };
    replayBuffers.set(sessionId, buf);
  }
  switch (update.sessionUpdate) {
    case "user_message_chunk": {
      buf.turnSeq += 1;
      buf.turnId = `${sessionId}-turn-${buf.turnSeq}`;
      buf.lastAssistant = null;
      buf.rows.push({ kind: "userInput", text: chunkText(update.content), origin: "realUser" });
      break;
    }
    case "agent_message_chunk": {
      const text = chunkText(update.content);
      if (!text) break;
      if (!buf.turnId) {
        buf.turnSeq += 1;
        buf.turnId = `${sessionId}-turn-${buf.turnSeq}`;
      }
      const last = buf.rows[buf.rows.length - 1];
      if (last?.kind === "assistantText" && last === buf.lastAssistant) last.text += text;
      else {
        const row = { kind: "assistantText", text, state: "complete" };
        buf.rows.push(row);
        buf.lastAssistant = row;
      }
      break;
    }
    case "tool_call": {
      const rawIn = update.rawInput;
      buf.rows.push({
        kind: "toolCall",
        toolCallId: String(update.toolCallId ?? nextId("tc")),
        toolName: String(update.kind === "execute" ? "bash" : update.title ?? "tool"),
        status: "running",
        inputText: safeStringify(update.rawInput),
        input:
          rawIn && typeof rawIn === "object" && !Array.isArray(rawIn)
            ? rawIn
            : typeof rawIn === "string"
              ? { command: rawIn }
              : {},
        startedAt: now(),
      });
      buf.lastAssistant = null;
      break;
    }
    case "tool_call_update": {
      const t = toolUpdateText(update);
      const target = [...buf.rows].reverse().find((r) => r.kind === "toolCall" && r.toolCallId === String(update.toolCallId ?? ""));
      if (target) {
        if (update.status === "completed") target.status = "success";
        if (update.status === "failed") target.status = "error";
        if (t) target.output = { text: t };
      }
      break;
    }
    default:
      break;
  }
}

function finishReplay(sessionId) {
  const buf = replayBuffers.get(sessionId);
  replayBuffers.delete(sessionId);
  const s = sessions.get(sessionId);
  if (!s || !buf || s.rows.length > 0) return;
  let rowId = 0;
  let currentTurn = null;
  const rows = [];
  for (const r of buf.rows) {
    if (r.kind === "userInput") {
      currentTurn = `${sessionId}-turn-${++s.turnSeq}`;
      rowId += 1;
      rows.push({ rowId, turnId: currentTurn, createdAt: now(), createdAtSeq: rowId, kind: "turnHeader", origin: "userInput", state: "completedSuccess", startedAt: now() });
      rowId += 1;
      rows.push({ rowId, turnId: currentTurn, createdAt: now(), createdAtSeq: rowId, ...r });
    } else {
      if (!currentTurn) currentTurn = `${sessionId}-turn-${++s.turnSeq}`;
      rowId += 1;
      rows.push({ rowId, turnId: currentTurn, createdAt: now(), createdAtSeq: rowId, ...r });
    }
  }
  s.rows = rows;
  s.rowIdSeq = rowId;
  s.replaying = false;
  // 历史会话回放落定：phase 置完成态；rows 以 deltas 推给订阅者
  // （initial snapshot 已先行发出空窗，此处续接，seq 单调）
  if (s.phase === "draft") {
    s.phase = "completedSuccess";
    s.sessionEnded = true;
  }
  if (rows.length) {
    const deltas = rows.map((row) => ({ op: "row.appended", row }));
    deltas.push({ op: "state.updated", patch: { control: controlOf(s) } });
    emitConv(s, deltas);
  }
  indexUpsert(s, "replay");
  log("replay finished", sessionId, "rows", rows.length);
}

async function ensureReplayed(s) {
  if (s.replayedOnce || s.rows.length > 0) return;
  s.replayedOnce = true;
  s.replaying = true;
  // 完成信号：优先 _nofy/replayed；实测该通知不一定到达，故以更新流断流
  // （1.2s 防抖）为主要判据 + 无流 3s 快结 + 15s 硬上限兜底。
  const done = new Promise((resolve) => {
    let settled = false;
    let debounce = setTimeout(finish, 3000);
    function finish() {
      if (settled) return;
      settled = true;
      clearTimeout(debounce);
      clearTimeout(hardCap);
      acp.off("replayed", replayedHandler);
      acp.off("update", updateWatcher);
      resolve();
    }
    const replayedHandler = (p) => {
      if (String(p.sessionId ?? "") === s.sessionId) finish();
    };
    const updateWatcher = (p) => {
      if (String(p.sessionId ?? "") !== s.sessionId) return;
      clearTimeout(debounce);
      debounce = setTimeout(finish, 1200);
    };
    const hardCap = setTimeout(finish, 15000);
    acp.on("replayed", replayedHandler);
    acp.on("update", updateWatcher);
  });
  try {
    await acp.loadSession(s.sessionId, s.workspaceId || undefined);
  } catch (e) {
    logOnce(`load-failed:${s.sessionId}`, "session/load failed", s.sessionId, String(e?.message)); // FIX-RESUME：每会话只记一次
  }
  await done;
  finishReplay(s.sessionId);
}

/* ───────────────────────── ACP 事件接线 ───────────────────────── */

acp.on("update", (params) => onAcpUpdate(params));
acp.on("notification", (params) => {
  const update = params.update;
  if (update && typeof update === "object" && params.sessionId) {
    if (update.sessionUpdate === "response_completed" || update.sessionUpdate === "last_turn_summary") return;
    onAcpUpdate({ sessionId: params.sessionId, update });
  }
});
acp.on("sessions", (params) => {
  for (const entry of params.upserted ?? []) {
    const sid = String(entry.sessionId ?? "");
    if (!sid) continue;
    const s = sessions.get(sid);
    if (s) {
      if (entry.title) s.title = String(entry.title);
      if (entry.activity === "working") {
        s.phase = "running";
        s.sessionEnded = false;
      } else if (s.phase === "running") {
        s.phase = "completedSuccess";
        s.sessionEnded = true;
      }
      s.lastActivityAt = now();
      indexUpsert(s, "sessions-changed");
    }
  }
});
acp.on("replayed", (p) => finishReplay(p.sessionId));
acp.on("permission", ({ id, params }) => {
  const sid = String(params.sessionId ?? "");
  const s = sessions.get(sid);
  log("permission request", sid, JSON.stringify(params.options ?? []).slice(0, 300));
  if (!s) {
    // 无跟踪会话：自动允许，避免内核悬挂（TODO: 全局权限面）
    acp.respondPermission(id, { outcome: { outcome: "selected", optionId: firstOptionId(params, "allow") } });
    return;
  }
  const interactionId = nextId("int");
  const options = (params.options ?? []).map((o) => ({
    optionId: String(o.optionId),
    label: String(o.name ?? o.optionId),
    kind: mapOptionKind(o),
  }));
  const toolCallId = String(params.toolCallId ?? s.liveTurn?.toolRows?.keys?.().next?.().value ?? "");
  const toolName = String(params.toolName ?? lastToolName(s) ?? "tool");
  const interaction = {
    interactionId,
    kind: "permission",
    anchorRowId: s.rows.length ? s.rows[s.rows.length - 1].rowId : null,
    createdAt: now(),
    payload: {
      kind: "permission",
      toolCallId: toolCallId || nextId("tc"),
      toolName,
      summary: toolName,
      detail: params,
      options,
    },
  };
  s.pendingAcpPermissions.set(interactionId, { acpId: id });
  s.pendingInteractions.push(interaction);
  const deltas = [{ op: "state.updated", patch: { pendingInteractions: [...s.pendingInteractions] } }];
  if (s.liveTurn) {
    const rowId = [...s.liveTurn.toolRows.values()].pop();
    const row = s.rows.find((r) => r.rowId === rowId);
    if (row) {
      const up = { ...row, status: "pendingApproval", approvalInteractionId: interactionId };
      Object.assign(row, up);
      deltas.push({ op: "row.upserted", row: up });
    }
  }
  emitConv(s, deltas);
  indexUpsert(s, "permission");
});

function lastToolName(s) {
  for (let i = s.rows.length - 1; i >= 0; i--) if (s.rows[i].kind === "toolCall") return s.rows[i].toolName;
  return null;
}
function firstOptionId(params, pref) {
  const opts = params.options ?? [];
  const hit = opts.find((o) => String(o.optionId).includes(pref)) ?? opts[0];
  return hit ? String(hit.optionId) : "allow_once";
}
function mapOptionKind(o) {
  const id = String(o.optionId ?? "");
  if (o.kind === "allow_once" || id.includes("once")) return "allowOnce";
  if (o.kind === "allow_always" || id.includes("always")) return "allowAlways";
  if (o.kind === "reject" || id.includes("reject") || id.includes("deny")) return "deny";
  return "custom";
}

/* ───────────────────────── host → adapter 请求处理 ───────────────────────── */

// FIX-WS：静默填充——只把存量会话写进 workspaceState.entries，不发 online deltas。
// 存量行随 sessions-index **初始快照** 下发：host 对首个快照走
// seedMissingRowsFromInitialSnapshot（直接 seed task index），不对每行
// session/resume（FIX-RESUME 配套：消灭启动期逐 session resume 风暴）。
function populateFromSummaries(all) {
  let added = 0;
  for (const [cwd, summaries] of Object.entries(all)) {
    if (!cwd || !Array.isArray(summaries)) continue;
    const w = workspaceState(cwd);
    for (const sum of summaries) {
      const sid = String(sum?.info?.id ?? "");
      if (!sid) continue;
      sessionCwdHints.set(sid, cwd); // WS-ENUM：sid→cwd（跨 workspace 打开会话用）
      if (sessions.has(sid)) continue; // live 会话优先，不被静态快照覆盖
      if (!w.entries.has(sid)) {
        const title =
          (typeof sum?.generated_title === "string" && sum.generated_title.trim()) ||
          (typeof sum?.session_summary === "string" && sum.session_summary.trim()) ||
          firstUserQueryTitle(cwd, sid) || // WS-ENUM：首条用户消息回退（截断）
          sid.slice(0, 8);
        w.entries.set(sid, {
          sessionId: sid,
          workspaceId: cwd,
          title,
          titleSource: "default",
          phase: "completedSuccess",
          sessionEnded: true,
          hasBackgroundWork: false,
          lastActivityAt: Date.parse(String(sum?.updated_at ?? "")) || now(),
          createdAt: Date.parse(String(sum?.created_at ?? "")) || now(),
        });
        added += 1;
      }
    }
    w.loaded = true;
  }
  return added;
}

function populateFromSessionList(list) {
  let added = 0;
  for (const entry of list) {
    const sid = String(entry.sessionId ?? "");
    if (!sid) continue;
    const cwd = String(entry.cwd ?? "");
    sessionCwdHints.set(sid, cwd); // WS-ENUM
    if (sessions.has(sid)) continue;
    const w = workspaceState(cwd);
    if (!w.entries.has(sid)) {
      w.entries.set(sid, {
        sessionId: sid,
        workspaceId: cwd,
        title: String(entry.title ?? "") || firstUserQueryTitle(cwd, sid) || sid.slice(0, 8),
        titleSource: "default",
        phase: "completedSuccess",
        sessionEnded: true,
        hasBackgroundWork: false,
        lastActivityAt: Date.parse(String(entry.updatedAt ?? "")) || now(),
        createdAt: Date.parse(String(entry.updatedAt ?? "")) || now(),
      });
      added += 1;
    }
    w.loaded = true;
  }
  return added;
}

// FIX-WS：全局静默回填（acp ready / 首次订阅触发；并发去重）
let backfillInflight = null;
function backfillAllIndexes() {
  if (!backfillInflight) {
    backfillInflight = (async () => {
      try {
        try {
          const all = await acp.workspaceSummaries();
          const added = populateFromSummaries(all);
          logOnce("backfill-ok", "workspace_list backfilled (silent)", added, "entries");
          return;
        } catch (e) {
          logOnce("backfill-ws-list", "workspace_list backfill failed, falling back to session/list", String(e?.message));
        }
        try {
          const list = await acp.listSessions();
          const added = populateFromSessionList(list);
          logOnce("backfill-ok-fb", "session/list backfilled (silent)", added, "entries");
        } catch (e) {
          logOnce("backfill-fb-fail", "session/list backfill failed", String(e?.message));
        }
      } finally {
        backfillInflight = null; // 成功/失败都释放：后续新 workspace 可再触发回填
      }
    })();
  }
  return backfillInflight;
}

// FIX-WS：单 workspace 懒加载——sessions-index 订阅（项目行展开）时调用；
// 已 loaded 则立即可用，否则等全局回填（回填覆盖全部 workspace）。
function ensureWorkspaceIndexLoaded(wid) {
  const w = workspaceState(wid);
  if (w.loaded) return Promise.resolve(w);
  return backfillAllIndexes().then(() => workspaceState(wid));
}

async function createAcpSession(workspaceId, firstText, kind = "task") {
  // HOME-ISO：kind 按发起面——composer 默认 'task'（任务路）；Home 发起面 'home'
  // （助手路，kernel scope 参数映射 'os'；Home UI 尚无，预留）。
  const cwd = workspaceId || process.cwd();
  const created = await acp.newSession(cwd, kind === "home" ? "os" : "task");
  const sid = String(created.sessionId);
  const s = sessionState(sid, cwd);
  s.kind = kind === "home" ? "home" : "task";
  s.title = "";
  if (firstText) {
    beginTurn(s, firstText);
    acp
      .prompt(sid, firstText)
      .then(() => settleTurn(s, true))
      .catch((e) => settleTurn(s, false, e?.message));
  }
  indexUpsert(s, "create");
  return sid;
}

async function handleHostFrame(frame) {
  // 响应
  if (frame.id != null && frame.method == null) return; // 我们不发请求给 host，忽略回响
  if (frame.method == null) return;
  const id = frame.id;
  const params = frame.params ?? {};
  const method = frame.method;
  log("←", method, JSON.stringify(params).slice(0, 400));
  try {
    switch (method) {
      case "v4/conversation/subscribe": {
        const topic = String(params.topic ?? "");
        // host 不在 subscribe params 里带 subscriptionId：由 agent 生成并经 ack 回传，
        // host rememberV4SubscriptionRoute(topic, ack.subscriptionId, connectionId)。
        const subscriptionId = String(params.subscriptionId ?? nextId("sub"));
        if (!subscribersByTopic.has(topic)) subscribersByTopic.set(topic, new Map());
        subscribersByTopic.get(topic).set(subscriptionId, { ordinal: 0 });
        const ack = { subscriptionId, mode: "snapshot", logEpoch: LOG_EPOCH };
        if (id != null) respond(id, { ack });
        if (topic.startsWith("conversation/")) {
          const sid = topic.slice("conversation/".length);
          const s = sessionState(sid, sessionWorkspaceHint(sid));
          // 先发初始快照（可能空窗），回放异步进行，rows 落定后以 deltas 续接
          emitWireFrameFor(topic, (subId) => conversationSnapshot(s, subId), "initial");
          void ensureReplayed(s);
        } else if (topic.startsWith("sessions-index/")) {
          const wid = topic.slice("sessions-index/".length);
          const w = workspaceState(wid);
          // FIX-WS：先懒加载（该 workspace 的存量会话）再发初始快照——
          // 存量行进快照而非 online deltas：host 首个快照走 seed（不 resume），
          // renderer SessionIndexStore 展开即见任务行；4s 兜底防内核无响应拖死快照。
          void Promise.race([
            ensureWorkspaceIndexLoaded(wid),
            new Promise((r) => setTimeout(r, 4000)),
          ])
            .catch(() => {})
            .finally(() => {
              emitWireFrameFor(topic, (subId) => sessionsIndexSnapshot(w, subId), "initial");
            });
        } else if (topic.startsWith("workspace-config/")) {
          const wid = topic.slice("workspace-config/".length);
          emitWireFrameFor(topic, (subId) => workspaceConfigSnapshot(wid, subId), "initial");
        }
        return;
      }
      case "v4/conversation/unsubscribe": {
        const topic = String(params.topic ?? "");
        const subscriptionId = String(params.subscriptionId ?? "");
        subscribersByTopic.get(topic)?.delete(subscriptionId);
        if (id != null) respond(id, {});
        return;
      }
      case "v4/conversation/resync": {
        const topic = String(params.topic ?? "");
        const subscriptionId = String(params.subscriptionId ?? "");
        if (!subscribersByTopic.has(topic)) subscribersByTopic.set(topic, new Map());
        subscribersByTopic.get(topic).set(subscriptionId, { ordinal: 0 });
        if (id != null) respond(id, { ack: { subscriptionId, mode: "snapshot", logEpoch: LOG_EPOCH } });
        if (topic.startsWith("conversation/")) {
          const s = sessions.get(topic.slice("conversation/".length));
          if (s) emitWireFrameFor(topic, (subId) => conversationSnapshot(s, subId), "recovery");
        }
        return;
      }
      case "v4/conversation/rowsRange": {
        const s = sessions.get(String(params.sessionId ?? ""));
        respond(id, { rows: [], atSeq: s?.seq ?? 0, atLogEpoch: LOG_EPOCH, hasMore: false });
        return;
      }
      case "v4/command": {
        await handleCommand(id, params);
        return;
      }
      case "v4/commands/query": {
        const results = (params.commands ?? []).map((c) => ({
          key: { sessionId: c.sessionId ?? null, commandId: String(c.commandId ?? "") },
          result: "unknown",
        }));
        respond(id, { results });
        return;
      }
      case "session/create":
      case "session/resume": {
        const wsRef = params.workspace ?? {};
        const cwd = String(wsRef.workspacePath ?? params.workspaceId ?? process.cwd());
        let sid = String(params.sessionId ?? "");
        if (method === "session/create" || !sid) {
          sid = await createAcpSession(cwd, null);
        } else {
          sessionState(sid, cwd);
        }
        const s = sessions.get(sid);
        // FIX-RESUME：完整 Vr 形状（protocol/session/settings/projection/runtime/messages）——
        // 存量 session 点开才 resume；host 校验通过即不再 warn 刷屏。
        respond(id, zcodeSessionSnapshot(s, cwd));
        return;
      }
      case "session/read": {
        const sid = String(params.sessionId ?? "");
        const s = sessionState(sid, sessionWorkspaceHint(sid));
        // 回放异步进行（至多短候 2.5s 以便 host RPC 不尽数等待）；rows 经 deltas 续接
        await Promise.race([ensureReplayed(s), new Promise((r) => setTimeout(r, 2500))]);
        respond(id, zcodeSessionSnapshot(s, sessionWorkspaceHint(sid))); // FIX-RESUME
        return;
      }
      case "session/list": {
        const list = await acp.listSessions().catch(() => []);
        respond(id, {
          sessions: list.map((x) => ({
            sessionId: String(x.sessionId ?? ""),
            cwd: String(x.cwd ?? ""),
            title: String(x.title ?? ""),
            updatedAt: String(x.updatedAt ?? ""),
          })),
        });
        return;
      }
      case "session/send": {
        const sid = String(params.sessionId ?? "");
        const s = sessionState(sid, sessionWorkspaceHint(sid));
        const text = extractLegacyText(params);
        beginTurn(s, text);
        acp
          .prompt(sid, text)
          .then(() => settleTurn(s, true))
          .catch((e) => settleTurn(s, false, e?.message));
        respond(id, { session: { sessionId: sid } });
        return;
      }
      case "session/stop": {
        const sid = String(params.sessionId ?? "");
        await acp.cancel(sid);
        const s = sessions.get(sid);
        if (s) settleTurn(s, false, "stopped");
        respond(id, {});
        return;
      }
      case "workspace/updateInteractionPreferences": {
        respond(id, {
          workspace: params.workspace,
          askUserQuestionAutoResolutionEnabled:
            params.preferences?.askUserQuestionAutoResolutionEnabled !== false,
          snoozedInteractionCount: 0,
        });
        return;
      }
      case "workspace/updateProviderRegistry": {
        respond(id, {
          workspace: params.workspace,
          appliedProviderRevision: String(params.registry?.revision ?? "nofy-rev-0"),
          status: "applied",
          providerCount: Array.isArray(params.registry?.providers) ? params.registry.providers.length : 0,
        });
        return;
      }
      case "workspace/upsertModelProvider":
      case "workspace/removeModelProvider":
      case "workspace/setDefaultModel":
      case "workspace/setDefaultThoughtLevel":
      case "workspace/setDefaultMode":
      case "workspace/readState": {
        respond(id, workspaceStateResult(params.workspace));
        return;
      }
      case "session/setModel":
      case "session/setThoughtLevel":
      case "session/setMode":
      case "session/updateRuntimeModelConfig": {
        // D15：选模型/切模式必须真落到内核（此前只回快照、不转发 ⇒ 用户选什么都不生效）。
        // ACP stdlib 线路名：session/set_model {sessionId, modelId}、
        // session/set_mode {sessionId, modeId}（内核 nofy-acp-lib/src/message.rs:395/511 已支持）。
        // setThoughtLevel/updateRuntimeModelConfig 在 stdlib 无对应，暂不转发（登记待查
        // _nofy/settings/update / _nofy/sessionConfig）。内核拒绝时不炸 UI：catch 后仍回快照。
        const sid0 = String(params.sessionId ?? "");
        const pick = (...cs) => cs.find((c) => c !== undefined && c !== null && String(c).length > 0);
        if (sid0 && method === "session/setModel") {
          const modelId = String(pick(params.modelId, params.model, params.modelId?.modelId, params.config?.model) ?? "");
          if (modelId)
            await acp.rpc("session/set_model", { sessionId: sid0, modelId }).catch((e) =>
              console.error("[acp-adapter] session/set_model failed:", e?.message),
            );
        } else if (sid0 && method === "session/setMode") {
          const modeId = String(pick(params.modeId, params.mode, params.config?.mode) ?? "");
          if (modeId)
            await acp.rpc("session/set_mode", { sessionId: sid0, modeId }).catch((e) =>
              console.error("[acp-adapter] session/set_mode failed:", e?.message),
            );
        }
        // FIX-RESUME：host 对这些方法的响应同样按完整会话快照 schema 校验
        const sid = String(params.sessionId ?? "");
        const s = sid ? sessionState(sid, sessionWorkspaceHint(sid)) : null;
        respond(id, s ? zcodeSessionSnapshot(s, sessionWorkspaceHint(sid)) : zcodeSessionSnapshot({ sessionId: sid || nextId("s"), workspaceId: "" }, ""));
        return;
      }
      case "mcp/list":
      case "plugins/list":
      case "plugins/overview":
      case "plugins/referenceCatalog":
      case "automation/list":
      case "usage/stats":
      case "v4/usage/stats":
      case "session/usage":
      case "v4/conversation/usage":
      case "v4/conversation/plans":
      case "v4/conversation/fileChanges":
      case "v4/conversation/fileRewindPreview":
      case "session/subagents":
      case "session/events":
      case "session/messages":
        // FIX-PLUGINS：host schema 要求 diagnostics/marketplaces 等数组字段，缺失会 ZodError
        respond(id, method === "mcp/list" ? { servers: [] } : method === "automation/list" ? { automations: [] } : method === "plugins/list" ? { plugins: [], diagnostics: [] } : method === "plugins/overview" ? { marketplaces: [], availablePlugins: [], installedPlugins: [], capability: { supported: !1 }, diagnostics: [] } : method === "usage/stats" || method === "v4/usage/stats" ? { stats: [] } : method === "session/usage" || method === "v4/conversation/usage" ? { usage: usageZero() } : method === "v4/conversation/plans" ? { plans: [], atSeq: 0, atLogEpoch: LOG_EPOCH } : method === "v4/conversation/fileChanges" ? { files: 0, additions: 0, deletions: 0, items: [] } : {});
        return;
      case "v4/attachment/begin":
      case "v4/attachment/chunk":
      case "v4/attachment/commit":
      case "v4/attachment/abort":
      case "v4/attachment/read":
        respondError(id, -32601, "attachments not supported by nofy seam (TODO)");
        return;
      default:
        log("unhandled method", method);
        if (id != null) respond(id, {});
    }
  } catch (e) {
    // FIX-RESUME：同类错误每会话/方法只记一次，防刷屏
    logOnce(`handler-error:${method}:${String(e?.message || e)}`, "handler error", method, String(e?.stack || e));
    if (id != null) respondError(id, -32603, String(e?.message || e));
  }
}

function sessionWorkspaceHint(sid) {
  const s = sessions.get(sid);
  if (s?.workspaceId) return s.workspaceId;
  return sessionCwdHints.get(sid) ?? ""; // WS-ENUM：未打开 workspace 的会话也能解析 cwd
}

function extractLegacyText(params) {
  const p = params.prompt ?? params.input ?? params;
  if (typeof p === "string") return p;
  if (Array.isArray(p)) return chunkText(p);
  if (p && typeof p === "object") {
    if (typeof p.text === "string") return p.text;
    if (Array.isArray(p.parts)) return chunkText(p.parts);
  }
  return "";
}

async function handleCommand(id, params) {
  const type = String(params.type ?? "");
  const payload = params.payload ?? {};
  const sessionId = params.sessionId ?? null;
  const commandId = String(params.commandId ?? nextId("cmd"));
  const clientId = String(params.clientId ?? "host");
  const ack = (status, result, reasonCode) => {
    const s = sessionId ? sessions.get(sessionId) : null;
    respond(id, {
      commandId,
      status,
      ...(reasonCode ? { reasonCode } : {}),
      revisionAtDecision: s?.seq ?? 0,
      ...(result ? { result } : {}),
    });
  };
  log("v4/command", type, sessionId, JSON.stringify(payload).slice(0, 300));
  switch (type) {
    case "createSession":
    case "createSelectionSideSession": {
      const workspaceId = String(payload.workspaceId ?? "");
      const firstText = payload.firstInput?.text ?? "";
      // HOME-ISO：发起面 kind——composer 任务路默认 'task'；Home 发起面传 'home'（UI 尚无，预留）
      const kind = payload.kind === "home" ? "home" : "task";
      const sid = await createAcpSession(workspaceId, firstText || null, kind);
      ack("accepted", { type: "createSession", sessionId: sid });
      return;
    }
    case "sendText": {
      const s = sessionState(String(sessionId), sessionWorkspaceHint(String(sessionId)));
      const text = String(payload.text ?? "");
      beginTurn(s, text);
      acp
        .prompt(s.sessionId, text)
        .then(() => settleTurn(s, true))
        .catch((e) => settleTurn(s, false, e?.message));
      ack("accepted", { type: "inputDisposition", delivery: "startNow" });
      return;
    }
    case "stop": {
      if (sessionId) {
        await acp.cancel(String(sessionId));
        const s = sessions.get(String(sessionId));
        if (s) settleTurn(s, false, "stopped");
      }
      ack("accepted");
      return;
    }
    case "resolveInteraction": {
      const interactionId = String(payload.interactionId ?? "");
      const answer = payload.answer ?? {};
      const s = sessionId ? sessions.get(String(sessionId)) : findSessionByInteraction(interactionId);
      const pending = s?.pendingAcpPermissions.get(interactionId);
      if (s && pending) {
        s.pendingAcpPermissions.delete(interactionId);
        s.pendingInteractions = s.pendingInteractions.filter((x) => x.interactionId !== interactionId);
        if (answer.optionId) {
          acp.respondPermission(pending.acpId, { outcome: { outcome: "selected", optionId: String(answer.optionId) } });
        } else {
          acp.respondPermission(pending.acpId, { outcome: { outcome: "cancelled" } });
        }
        const deltas = [{ op: "state.updated", patch: { pendingInteractions: [...s.pendingInteractions] } }];
        const row = s.rows.find((r) => r.approvalInteractionId === interactionId);
        if (row) {
          const up = { ...row, status: "running" };
          delete up.approvalInteractionId;
          Object.assign(row, up);
          deltas.push({ op: "row.upserted", row: up });
        }
        emitConv(s, deltas);
        indexUpsert(s, "resolve");
        ack("accepted", { type: "resolveInteraction", resolvedBy: { clientId, optionId: answer.optionId } });
      } else {
        ack("accepted", { type: "resolveInteraction", resolvedBy: { clientId } });
      }
      return;
    }
    case "renameSession": {
      const s = sessionId ? sessions.get(String(sessionId)) : null;
      if (s) {
        s.title = String(payload.title ?? s.title);
        emitConv(s, [{ op: "state.updated", patch: { meta: { title: s.title, titleSource: "custom" } } }]);
        indexUpsert(s, "rename");
      }
      ack("accepted");
      return;
    }
    case "deleteSession":
      ack("accepted");
      return;
    default:
      ack("accepted");
  }
}

function findSessionByInteraction(interactionId) {
  for (const s of sessions.values()) if (s.pendingAcpPermissions.has(interactionId)) return s;
  return null;
}

log("adapter started", { pid: process.pid, url: discoveryUrl() });
