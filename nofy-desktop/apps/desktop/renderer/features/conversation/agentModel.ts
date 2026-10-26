/**
 * agentModel —— 子智能体块的**纯模型**（对话框 + 子智能体体系的数据侧）。
 *
 * ## 内核线路证据（2026-09-11：源码 + 真轮次 CDP 帧环缓冲实测）
 * - spawn 工具 wire 名 ∈ {task, Task, spawn_subagent}（nofy-tools task/mod.rs:49 is_task_tool_id；
 *   真轮次实测首帧 title = "spawn_subagent"）。tool_call_update.kind = "other"（ToolInput::Task
 *   映射 ToolKind::Other，acp_session_impl/tool_calls.rs:1963）——所以认块**只认名字**，不认 kind。
 * - spawn 完成帧 content 是**嵌套 wrapper** {type:"content",content:{type:"text",text}}（扁 text 是
 *   diff 族才有的形态）；文本 = 后台派发通知：
 *     Subagent started in background.
 *     subagent_id: <uuid>
 *     type: <subagent_type>
 *     description: <描述>
 *     Use get_command_or_subagent_output with task_ids=[...] ...
 * - 正文输出**不在 spawn 帧**：父模型用 get_command_or_subagent_output 轮询，完成帧
 *   rawOutput = {type:"TaskOutput", Result:{task_id, command, status, exit_code, started, ended,
 *   duration_secs, output}}（acp_conversion.rs:530 的 SubagentCompleted 臂走 TUI/别的表面）。
 * - <subagent_result> 页脚（nofy-tool-types task.rs:421）是**模型面**文本；桌面线路目前不给，
 *   解析器保留兼容（TUI 复用面 / 将来内核改线）。
 * - 子会话 id = task_id = subagent_id ⇒ 与 roster（_nofy/sessions/changed）按 sessionId join。
 *
 * ## 调色板色徽（抄活壳逆向：AgentToolBlocks.tsx:35 八色 + ShellCommandBlocks.ts:24 哈希）
 */
import type { Block, SessionState, SubagentFinishedInfo, SubagentProgress } from "../../core/store/state.ts";

/** 内核认的 spawn 工具 wire 名（task/mod.rs:49 逐字）。 */
export const AGENT_TOOL_NAMES = new Set(["task", "Task", "spawn_subagent"]);

/** 父模型轮询子智能体输出的工具族（真轮次实测 get_command_or_subagent_output）。 */
export const AGENT_POLL_NAMES = new Set([
  "get_command_or_subagent_output",
  "get_task_output",
  "get_task_or_subagent_output",
  "wait_tasks",
  "wait_commands_or_subagents",
  "wait_tasks_or_subagents",
]);

export type SubagentFooter = { subagentId: string; subagentType: string; persona: string | null };

/** 模型面 <subagent_result> 页脚（保留兼容；桌面线路当前不给）。 */
export function parseSubagentFooter(text: string | null): SubagentFooter | null {
  if (text === null) return null;
  const block = /<subagent_result>([\s\S]*?)<\/subagent_result>/.exec(text);
  if (block === null) return null;
  const body = block[1] ?? "";
  const id = /^\s*subagent_id:\s*(\S+)/m.exec(body)?.[1];
  const type = /^\s*subagent_type:\s*(\S+)/m.exec(body)?.[1];
  if (id === undefined || type === undefined) return null;
  const persona = /persona="([^"]+)"/.exec(body)?.[1] ?? null;
  return { subagentId: id, subagentType: type, persona };
}

export type SpawnNotice = { subagentId: string | null; subagentType: string | null; description: string | null };

/** 桌面线路的后台派发通知（真轮次逐字形态）：subagent_id / type / description 三行。 */
export function parseSpawnNotice(text: string | null): SpawnNotice {
  if (text === null) return { subagentId: null, subagentType: null, description: null };
  const id = /^subagent_id:\s*(\S+)\s*$/m.exec(text)?.[1] ?? null;
  const type = /^type:\s*(\S+)\s*$/m.exec(text)?.[1] ?? null;
  const description = /^description:\s*(.+)$/m.exec(text)?.[1]?.trim() ?? null;
  return { subagentId: id, subagentType: type, description };
}

/** 展示输出时把模型面页脚摘掉（页脚是给模型的 resume 提示，不是给人看的正文）。 */
export function stripSubagentFooter(text: string): string {
  return text.replace(/\n?<subagent_result>[\s\S]*?<\/subagent_result>\n?/, "").trimEnd();
}

/** 真轮次实测：Result.output 里还夹 <subagent_meta> 行（id/type/tool_calls/turns/duration），同纪律摘掉。 */
export function stripSubagentMeta(text: string): string {
  return text.replace(/\n?<subagent_meta>[^\n]*<\/subagent_meta>\n?/g, "").trimEnd();
}

/** 展示用正文 = 摘 meta 行 + 摘页脚。 */
export function cleanAgentOutput(text: string): string {
  return stripSubagentFooter(stripSubagentMeta(text));
}

/**
 * 给人看的回传。轮询 / subagent_finished 的正文优先。
 * spawn 完成帧只是模型面的派发通知（Subagent started in background…），不是结果。
 * 通知后面若还夹着正文，只留正文。
 */
export function presentAgentOutput(primary: string | null, fallback: string | null): string | null {
  return withoutSpawnNotice(primary) ?? withoutSpawnNotice(fallback);
}

function withoutSpawnNotice(text: string | null): string | null {
  if (text === null) return null;
  const cleaned = cleanAgentOutput(text).trim();
  if (cleaned.length === 0) return null;
  if (!/^Subagent started in background\.\s*(?:\r?\n\s*)?subagent_id:\s*\S+/.test(cleaned)) return cleaned;
  const rest = cleaned
    .replace(/^Subagent started in background\.\s*/, "")
    .replace(/^subagent_id:\s*\S+\s*/, "")
    .replace(/^type:\s*\S+\s*/, "")
    .replace(/^\s*description:\s*.+?(?=\s+Use get_command_or_subagent_output|$)/, "")
    .replace(/^\s*Use get_command_or_subagent_output\b[\s\S]*?results\.\s*/, "")
    .trim();
  return rest.length > 0 ? rest : null;
}

export const AGENT_COLOR_PALETTE = ["yellow", "red", "orange", "green", "cyan", "blue", "purple", "pink"] as const;
export type AgentColor = (typeof AGENT_COLOR_PALETTE)[number];

/** 活壳逐字哈希：t = t*31 + charCode，模 8（ShellCommandBlocks.ts:24）。 */
export function hashToAgentColor(name: string): AgentColor {
  let t = 0;
  for (let i = 0; i < name.length; i += 1) t = (t * 31 + name.charCodeAt(i)) >>> 0;
  return AGENT_COLOR_PALETTE[t % AGENT_COLOR_PALETTE.length] ?? "blue";
}

/** 轮询完成帧 rawOutput 里的 TaskOutput.Result（实测键名大小写逐字）。 */
export type TaskResult = {
  taskId: string | null;
  status: string | null;
  output: string | null;
  durationSecs: number | null;
  command: string | null;
};

export function parseTaskResult(rawOutput: unknown): TaskResult | null {
  if (rawOutput === null || typeof rawOutput !== "object") return null;
  const rec = rawOutput as Record<string, unknown>;
  const result = (rec["Result"] ?? rec["result"]) as Record<string, unknown> | undefined;
  if (result === undefined || result === null || typeof result !== "object") return null;
  const output = result["output"];
  return {
    taskId: typeof result["task_id"] === "string" ? (result["task_id"] as string) : null,
    status: typeof result["status"] === "string" ? (result["status"] as string) : null,
    output: typeof output === "string" ? output : null,
    durationSecs: typeof result["duration_secs"] === "number" ? (result["duration_secs"] as number) : null,
    command: typeof result["command"] === "string" ? (result["command"] as string) : null,
  };
}

export type AgentBlockView = {
  blockId: string;
  toolCallId: string;
  status: string | null;
  running: boolean;
  failed: boolean;
  /** 入参 prompt；流式阶段（rawInput 未到）为 null，用 streamingArgs 顶替展示。 */
  prompt: string | null;
  streamingArgs: string | null;
  description: string | null;
  subagentType: string | null;
  persona: string | null;
  subagentId: string | null;
  /** 子智能体正文。轮询 / 终态优先；纯派发通知不展示。 */
  output: string | null;
  /** 轮询 Result 的状态（completed/failed/…）；还没轮询到 = null。 */
  resultStatus: string | null;
  durationSecs: number | null;
  color: AgentColor;
};

const ENDED = new Set(["completed", "success", "cancelled", "canceled"]);

/** 回放会把工具名收成展示标题。派发通知和 TaskOutput 仍是子智能体。 */
function toolBody(block: Extract<Block, { kind: "tool-call" }>): string | null {
  if (typeof block.resultText === "string" && block.resultText.length > 0) return block.resultText;
  const raw = block.rawOutput;
  if (raw !== null && typeof raw === "object" && !Array.isArray(raw)) {
    const text = (raw as Record<string, unknown>)["text"];
    if (typeof text === "string" && text.length > 0) return text;
  }
  return null;
}

function hasSpawnNotice(block: Extract<Block, { kind: "tool-call" }>): boolean {
  const text = toolBody(block);
  return text !== null && text.includes("Subagent started in background.") && parseSpawnNotice(text).subagentId !== null;
}

export function isAgentBlock(block: Block): block is Extract<Block, { kind: "tool-call" }> {
  if (block.kind !== "tool-call") return false;
  return block.toolKind === "task" || (block.name !== null && AGENT_TOOL_NAMES.has(block.name)) || hasSpawnNotice(block);
}

export function isAgentPollBlock(block: Block): block is Extract<Block, { kind: "tool-call" }> {
  if (block.kind !== "tool-call" || hasSpawnNotice(block)) return false;
  if (block.name !== null && AGENT_POLL_NAMES.has(block.name)) return true;
  const taskId = parseTaskResult(block.rawOutput)?.taskId;
  return typeof taskId === "string" && taskId.length > 0;
}

function rawInputText(block: Extract<Block, { kind: "tool-call" }>): string {
  if (block.rawInput === null || block.rawInput === undefined) return "";
  try {
    return JSON.stringify(block.rawInput);
  } catch {
    return "";
  }
}

/** 单个 task 块 → 视图模型（poll = 已关联的轮询块，可空；finished = subagent_finished 终态，可空）。 */
export function agentView(
  block: Extract<Block, { kind: "tool-call" }>,
  poll: Extract<Block, { kind: "tool-call" }> | null,
  finished: SubagentFinishedInfo | null = null,
): AgentBlockView {
  const body = toolBody(block);
  const footer = parseSubagentFooter(body);
  const notice = parseSpawnNotice(body);
  const input = (block.rawInput ?? null) as Record<string, unknown> | null;
  const prompt = input !== null && typeof input["prompt"] === "string" ? (input["prompt"] as string) : null;
  const descFromInput = input !== null && typeof input["description"] === "string" ? (input["description"] as string) : null;
  const typeFromInput = input !== null && typeof input["subagent_type"] === "string" ? (input["subagent_type"] as string) : null;
  const result = poll !== null ? parseTaskResult(poll.rawOutput) : null;
  const subagentType = footer?.subagentType ?? notice.subagentType ?? typeFromInput;
  const subagentId = footer?.subagentId ?? notice.subagentId ?? result?.taskId ?? null;
  const spawnFailed = block.status === "failed" || block.status === "error";
  // finished（subagent_finished，父会话通道）= detached 子智能体的终态：任何 status 都代表已结束。
  // 没有它，父回合已收、不再轮询的子智能体 running 永远为 true，后台胶囊永不消失。
  const finishedTerminal = finished !== null;
  const failed =
    spawnFailed ||
    (result !== null && (result.status === "failed" || result.status === "error")) ||
    (finished !== null && finished.status === "failed");
  const running =
    !spawnFailed &&
    !finishedTerminal &&
    (result === null ? block.status !== "failed" : !ENDED.has(result.status ?? ""));
  const outputFromResult = result?.output ?? finished?.output ?? null;
  return {
    blockId: block.id,
    toolCallId: block.toolCallId,
    status: result?.status ?? finished?.status ?? block.status,
    running,
    failed,
    prompt,
    streamingArgs: running && prompt === null && block.argsDelta.length > 0 ? block.argsDelta : null,
    description: notice.description ?? descFromInput,
    subagentType,
    persona: footer?.persona ?? null,
    subagentId,
    output: presentAgentOutput(outputFromResult, block.resultText),
    resultStatus: result?.status ?? finished?.status ?? null,
    durationSecs: result?.durationSecs ?? (finished !== null && finished.durationMs !== null ? finished.durationMs / 1000 : null),
    color: hashToAgentColor(subagentType ?? block.name ?? "task"),
  };
}

/** 轮询块 ↔ spawn 块的关联：rawOutput.task_id / 入参 task_ids / 标题短 id 三路。 */
function pollMatches(poll: Extract<Block, { kind: "tool-call" }>, subagentId: string | null, shortId: string): boolean {
  if (subagentId !== null) {
    const result = parseTaskResult(poll.rawOutput);
    if (result?.taskId === subagentId) return true;
    if (rawInputText(poll).includes(subagentId)) return true;
  }
  return shortId.length > 0 && (poll.title ?? "").includes("(" + shortId + ")");
}

/** 会话脊柱里的子智能体块（按出现序），轮询块已 join 进对应视图。 */
export function agentBlocks(session: Pick<SessionState, "blocks" | "subagentFinished"> | null): AgentBlockView[] {
  if (session === null) return [];
  const spawns = session.blocks.filter(isAgentBlock);
  const polls = session.blocks.filter(isAgentPollBlock);
  const finishedMap = session.subagentFinished ?? {};
  const out: AgentBlockView[] = [];
  for (const block of spawns) {
    const view0 = agentView(block, null);
    const shortId = view0.subagentId !== null ? view0.subagentId.slice(0, 8) : "";
    let poll: Extract<Block, { kind: "tool-call" }> | null = null;
    let quality = -1; // 0=仅匹配 1=带 Result 2=Result 已终态；同档后帧覆盖前帧
    for (const p of polls) {
      if (!pollMatches(p, view0.subagentId, shortId)) continue;
      const r = parseTaskResult(p.rawOutput);
      const q = r === null ? 0 : ENDED.has(r.status ?? "") ? 2 : 1;
      if (q >= quality) {
        poll = p;
        quality = q;
      }
    }
    const fin = view0.subagentId !== null ? (finishedMap[view0.subagentId] ?? null) : null;
    out.push(agentView(block, poll, fin));
  }
  return out;
}

/** 已被某个子智能体块收编的轮询块 id：脊柱不再单独画它们（活壳把它们折进 agent 视图）。 */
export function linkedPollBlockIds(session: Pick<SessionState, "blocks"> | null): Set<string> {
  const ids = new Set<string>();
  if (session === null) return ids;
  const spawns = session.blocks.filter(isAgentBlock);
  const polls = session.blocks.filter(isAgentPollBlock);
  for (const block of spawns) {
    const view0 = agentView(block, null);
    const shortId = view0.subagentId !== null ? view0.subagentId.slice(0, 8) : "";
    for (const p of polls) {
      if (pollMatches(p, view0.subagentId, shortId)) ids.add(p.id);
    }
  }
  return ids;
}

export type AgentSummary = { total: number; running: number; failed: number };

/** 顶栏/卡片头汇总段用：总数 + 运行中 + 失败（活壳 SummaryAgentsSection 的计数口径）。 */
export function agentSummary(agents: AgentBlockView[]): AgentSummary {
  let running = 0;
  let failed = 0;
  for (const a of agents) {
    if (a.running) running += 1;
    else if (a.failed) failed += 1;
  }
  return { total: agents.length, running, failed };
}

/** 侧栏目录行 = 块视图 + roster 活动态 join（子会话 id = subagent_id，内核 MVP 同值）。 */
export type AgentRow = AgentBlockView & { activity: string | null };

/**
 * 胶囊源 = **所有 running 的子智能体行**（回合内与 detached 都算）。
 *
 * 活壳口径（2026-09-11 活壳 ZCode 实机复核：v4-stop 在位=父回合仍跑时，composer 的
 * v4-composer-background-work-trigger 与摘要面板 data-running-agent-count 已为 1）：
 * 子智能体一 running，右上 SummaryAgentsSection 与 composer BackgroundWorksCapsule 就出现；
 * 一结束（running→false）两处同时消失。与父回合开/闭**无关**——早先「仅 detached 才显示」的
 * 结论被实机推翻（那次父回合恰好已收，误把 detached 当成触发条件）。
 *
 * running 的翻转：回合内靠轮询 Result 终态；detached（父回合已收、不再轮询）靠
 * SessionUpdate::SubagentFinished（agentView 的 finished 参）。本函数是两处胶囊唯一的计数来源。
 */
export function runningAgentRows(rows: AgentRow[]): AgentRow[] {
  return rows.filter((r) => r.running);
}

function progressDirectoryRow(row: SubagentProgress, finished: SubagentFinishedInfo | null): AgentRow {
  const failed = finished?.status === "failed";
  return {
    blockId: "progress:" + row.subagentId,
    toolCallId: row.subagentId,
    status: finished?.status ?? null,
    running: finished === null,
    failed,
    prompt: null,
    streamingArgs: null,
    description: row.description,
    subagentType: row.subagentType,
    persona: null,
    subagentId: row.subagentId,
    output: presentAgentOutput(finished?.output ?? null, null),
    resultStatus: finished?.status ?? null,
    durationSecs: finished?.durationMs != null ? finished.durationMs / 1000 : row.durationMs != null ? row.durationMs / 1000 : null,
    color: hashToAgentColor(row.subagentType ?? row.description ?? "task"),
    activity: null,
  };
}

/** 右侧目录。回放后的工具块认不出来时，仍用启动清单和结束事件把点开的那条补上。 */
export function directoryAgents(agents: readonly AgentRow[], progress: Record<string, SubagentProgress>, finished: Record<string, SubagentFinishedInfo> = {}): AgentRow[] {
  const seen = new Set<string>();
  const rows = agents.map((agent) => {
    if (agent.subagentId !== null) seen.add(agent.subagentId);
    const done = agent.subagentId !== null ? finished[agent.subagentId] : undefined;
    if (done === undefined || !agent.running) return agent;
    return {
      ...agent,
      running: false,
      failed: agent.failed || done.status === "failed",
      output: agent.output ?? presentAgentOutput(done.output, null),
      resultStatus: agent.resultStatus ?? done.status,
      durationSecs: agent.durationSecs ?? (done.durationMs != null ? done.durationMs / 1000 : null),
    };
  });
  for (const row of Object.values(progress)) {
    if (seen.has(row.subagentId)) continue;
    rows.push(progressDirectoryRow(row, finished[row.subagentId] ?? null));
  }
  return rows;
}

/** 脊柱、右侧目录、任务概览共用。取消回执不另写一个词。 */
export function agentWorkPhrase(row: { running: boolean; failed: boolean }): "正在工作" | "失败" | "已完成" {
  if (row.running) return "正在工作";
  if (row.failed) return "失败";
  return "已完成";
}
