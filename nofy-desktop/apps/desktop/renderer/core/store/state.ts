/**
 * 应用状态形状。
 *
 * 纪律（PLAN.md §5）：**渲染层不拥有状态**——照搬 TUI 的第一条架构
 * （nofy-tui-full-spec.md §0.1：Action → dispatch(纯同步) → Effect(异步) → TaskResult）。
 * 所有写入只能经 store.dispatch；features 只读。
 *
 * 字段名一律来自 docs/fixtures/golden-turn.jsonl 的实测载荷
 * （docs/contract/session-events-measured.md + scripts/inspect-payloads.ts 的输出），
 * 不来自旧文档转述。
 */

/**
 * 会话运行态。取自 TUI 的 AgentState
 * （nofy-tui-full-spec.md Part 4 §6：{Idle, TurnRunning, TurnCancelling,
 * CommandRunning, CommandCancelling}）。
 */
export type AgentState = "idle" | "turn-running" | "turn-cancelling" | "command-running" | "command-cancelling";

/** roster 的 activity 六态（PORTING-PLAN §2.2 的 _nofy/sessions/list；实测于 sessions-changed）。 */
export type RosterActivity = "working" | "idle" | "needs_input" | "dormant" | "completed" | "dead";

/**
 * `response_completed.usage` —— **snake_case**，段级（每次模型响应一份）。
 * 实测：{input_tokens, output_tokens, cache_read_input_tokens,
 *       cache_creation_input_tokens, reasoning_tokens}
 */
export type SegmentUsage = {
  inputTokens: number;
  outputTokens: number;
  cacheReadInputTokens: number;
  cacheCreationInputTokens: number;
  reasoningTokens: number;
};

/**
 * `turn_completed.usage` —— **camelCase**，轮级，字段集比段级大。
 * 实测：{inputTokens, outputTokens, totalTokens, cachedReadTokens,
 *       cacheCreationTokens, reasoningTokens, modelCalls, apiDurationMs,
 *       modelUsage, numTurns}
 *
 * ⚠ 与 SegmentUsage **不是同一形状**，不得互相替代或合并求和。
 * 同一轮里两者都出现（本轮 response_completed ×2 各带一份段级、turn_completed ×1 带轮级）。
 */
export type TurnUsage = {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cachedReadTokens: number;
  cacheCreationTokens: number;
  reasoningTokens: number;
  modelCalls: number;
  apiDurationMs: number;
  numTurns: number;
  /** 逐模型明细，形状未展开（本轮为对象）；P4 用量面需要时再按实测细化。 */
  modelUsage: unknown;
};

/**
 * 会话脊柱的一个块。对应 TUI AgentView 纵切里的 scrollback 项。
 *
 * 块的**开合规则**由实测时间轴推出（session-events-measured.md §5）：
 * agent_message_chunk 追加到当前**开着**的 agent 块，response_completed 关闭它。
 * 本轮因此得到 2 个 agent 块（工具调用前 7 个 chunk、后 7 个 chunk），
 * 中间夹一个 tool-call 块——正是「文本 → 工具 → 文本」的正确脊柱。
 */
export type Block =
  | { kind: "user-message"; id: string; text: string; promptIndex: number | null; modelId: string | null }
  | { kind: "agent-message"; id: string; text: string; closed: boolean; usage: SegmentUsage | null }
  | { kind: "agent-thought"; id: string; text: string; closed: boolean }
  | {
      kind: "tool-call";
      id: string;
      toolCallId: string;
      /** tool_call 给的是原始工具名（实测 "read_file"） */
      name: string | null;
      /** tool_call_update 给的是展示标题（实测 "Read \`hello.txt\`"）——与 name 不同，不得混用 */
      title: string | null;
      /** tool_call_update.kind（实测 "read"）；tool_call 首帧**没有**这个字段 */
      toolKind: string | null;
      status: string | null;
      rawInput: unknown;
      locations: unknown[];
      /** tool_call_delta_chunk 累积的流式参数（ext 轨，snake_case: arguments_delta） */
      argsDelta: string;
      /**
       * tool_call_update.content 里 type=text 的文本拼接（夹具实测 content 数组含 diff/text 项）。
       * task（子智能体）工具的 <subagent_result> 页脚走这条进 UI（agentModel.ts 解析）。
       */
      resultText: string | null;
      /** tool_call_update.rawOutput（task 轮询完成帧的 TaskOutput.Result 在这里，实测 2026-09-11） */
      rawOutput: unknown;
      /** pending_interaction / interaction_resolved 以 tool_call_id 关联 */
      interactionPending: boolean;
      interactionKind: string | null;
    }
  /** 未归类但需要可见的事件块（hook_execution / model_changed / …）。不静默丢弃。 */
  | { kind: "event"; id: string; tag: string; payload: unknown };

export type SessionState = {
  id: string;
  cwd: string | null;
  /**
   * 标题有两个来源，同一毫秒各发一次（实测 688ms）：
   * ext 轨 session_summary_generated.session_summary 与
   * stdlib 轨 session_info_update.title。两者幂等取最后非空值。
   */
  title: string | null;
  /**
   * 标题来源。**三个来源各管一段**（docs/contract/session-read-shapes.md 实测）：
   *   load-response  冷启动 session/load 的 _meta["nofy/sessionDetail"].title
 *   list           session/list 的 sessions[i].title（侧栏列表 / 会话活动 tab 用）
   *   session_info_update / session_summary_generated  实时生成（事件，均不在回放集里）
   */
  titleSource:
    | "load-response"
    | "list"
    | "session_info_update"
    | "session_summary_generated"
    | null;
  /** session/load 与 session/new 响应的 _meta["nofy/sessionDetail"].kind（实测 "build"）。 */
  kind: string | null;
  /**
   * 模型选择器的数据源 = session/new 与 session/load 响应的
   * _meta["nofy/sessionConfig"].options（实测 4 项，含 selected 标记）。
   * PORTING-PLAN §2.1 早已指出「UI 模型选择器直接渲染它」，此处落地。
   */
  modelOptions: unknown[];
  modelId: string | null;
  /**
   * 会话模式（ACP current_mode_update 的 currentModeId；内核词汇 plan/ask/default，
   * session_mode.rs prompt_mode_from_session_mode_id）。null = 内核还没推过。
   * 权限芯片的三源之一（另两源：roster.yolo、settings 的 auto_permission_mode_enabled）。
   */
  mode: string | null;
  blocks: Block[];
  agentState: AgentState;
  /** 当前开着的 agent-message 块 id；response_completed 关闭它。 */
  openAgentBlockId: string | null;
  currentPromptId: string | null;
  turnUsage: TurnUsage | null;
  stopReason: string | null;
  /**
   * 去重高水位。实测 eventId 形如 \`<sessionId>-<n>\`，故取尾部序号。
   * **只对带 eventId 的事件生效**（陷阱 T10）：不带的事件（session_info_update、
   * model_changed、queue/roster/mcp…）套去重会被永久丢弃。
   */
  lastEventSeq: number;
  /**
   * tool_index → toolCallId 映射。
   *
   * 〔实测〕`tool_call_delta_chunk` 只有**第一帧**带 `tool_call_id` 与 `name`；
   * 后续帧的键集仅 `{sessionUpdate, tool_index, arguments_delta}`——
   * 流式参数的关联键是 **tool_index**，不是 id。
   * 按 id 关联会为每个后续 delta 造出一个 `toolCallId=""` 的幽灵块
   * （本 bug 由回放门抓到：终态 10 块里出现 `id="tool:"` 的空工具卡）。
   */
  toolIndexToId: Record<number, string>;
  /** 命令表：initialize 给 7 条，available_commands_update 给 167 条（以后者为准）。 */
  availableCommands: unknown[];
  availableTools: string[];
  queueEntries: unknown[];
  /** 回合计时（「已工作 Ns」turn 头依据）：本地墙钟，开/关见 project.ts 的 user_message_chunk / turn_completed。 */
  turns: TurnRecord[];
  /**
   * subagent_finished（父会话通道）按 subagent_id 记的终态。
   * detached 子智能体（父回合已收、不再轮询）没有轮询完成帧，这是它「结束」的唯一桌面线路信号；
   * 右上 / composer 后台胶囊靠它消失（agentModel.agentView 的 finished 参）。
   */
  subagentFinished: Record<string, SubagentFinishedInfo>;
};

/**
 * 活体会话 roster 的一条（_nofy/sessions/changed 的 upserted[i]；TUI 的 FleetView 数据源）。
 *
 * 〔实测键集〕docs/fixtures/golden-permission.jsonl 的 upserted[0]：
 *   {sessionId, title, cwd, isWorktree, modelId, yolo, activity, resident,
 *    lastChangeUnixMs, origin{…}}
 * ⇒ 这些字段是**已实测**的，故直接进 store（不再只留 raw 让界面自己猜）：
 *   - title + cwd + lastChangeUnixMs 让 ⌘K 的「会话」范围能显示标题/工作区/相对时间
 *     （ZCode QuickPick 的 MetaText 语法，数据源同族）；
 *   - cwd 是 session/load 的必需参数 ⇒ **未加载会话可以由界面直接载入**（P1 冷启动）。
 * raw 保留：origin 等未展开的子对象仍在，诊断弹层要看原文。
 */
export type RosterEntry = {
  sessionId: string;
  activity: RosterActivity | string | null;
  title: string | null;
  cwd: string | null;
  modelId: string | null;
  isWorktree: boolean;
  yolo: boolean;
  /** 内核标记该会话是否常驻（resident）；影响「能不能直接 load」的判断。 */
  resident: boolean;
  /** 最近变更的 unix 毫秒（实测键名 lastChangeUnixMs）。相对时间的唯一来源。 */
  lastChangeUnixMs: number | null;
  raw: unknown;
};

export type ConnectionState = {
  status: "idle" | "connecting" | "ready" | "reconnecting" | "closed";
  agentVersion: string | null;
  /** initialize._meta.modelState；实测 {currentModelId, availableModels[4]}。 */
  modelState: unknown;
  /** initialize._meta.availableCommands；实测 7 条。 */
  initialCommands: unknown[];
  /**
   * 内核**未声明**的能力，供 UI 做诚实降级（PLAN §7.3）。
   * 实测 agentCapabilities.promptCapabilities = {image:false, audio:false,
   * embeddedContext:true} ⇒ 图片/音频模态不得出现在 UI 上（PLAN §11 #3）。
   */
  promptCapabilities: { image: boolean; audio: boolean; embeddedContext: boolean } | null;
  authMethods: unknown[];
};

export type AppState = {
  connection: ConnectionState;
  sessions: Record<string, SessionState>;
  activeSessionId: string | null;
  roster: Record<string, RosterEntry>;
  /** 全局模型表（_nofy/models/update 推的是完整 SessionModelState）。 */
  models: unknown;
  settings: unknown;
  mcpServers: unknown[];
  /**
   * 模糊文件搜索的最近一批结果（_nofy/search/fuzzy/status）。
   * 住 store 的理由：它是**内核推来的数据**，不是窗口局部态；组件刷新/切标签
   * 不该丢。generation 单调递增，投影层据此丢弃乱序的旧批。
   */
  search: {
    searchId: string;
    sessionId: string;
    matches: unknown[];
    total: number | null;
    done: boolean;
    generation: number | null;
  } | null;
  /**
   * 待裁决的内核→客户端请求（权限/问答/计划/信任）。
   *
   * params 用 Record 而非 unknown：UI 要直接读 `options` 与 `toolCall`
   * （形状见 docs/contract/permission-flow-measured.md §1/§2），
   * 若为 unknown 则每个消费点都得断言，等于把类型门关掉。
   * 字段级严格校验由 zod schema（PLAN §13 待办 3）接管。
   */
  pendingInteractions: Array<{
    id: number | string;
    method: string;
    sessionId: string;
    params: Record<string, unknown>;
  }>;
  /**
   * 表外事件计数（PLAN §2.4/§5：显式计数，绝不静默丢弃）。
   * 键为 "notification <method>" 或归一化后的 unknown 标签。
   */
  unhandled: Record<string, number>;
  /** 已应用的事件总数，供回放门与性能基线使用。 */
  appliedEvents: number;
};

export function emptySession(id: string): SessionState {
  return {
    id,
    cwd: null,
    title: null,
    titleSource: null,
    kind: null,
    modelOptions: [],
    modelId: null,
    mode: null,
    blocks: [],
    agentState: "idle",
    openAgentBlockId: null,
    currentPromptId: null,
    turnUsage: null,
    stopReason: null,
    lastEventSeq: 0,
    toolIndexToId: {},
    availableCommands: [],
    availableTools: [],
    queueEntries: [],
    turns: [],
    subagentFinished: {},
  };
}

export function initialState(): AppState {
  return {
    connection: {
      status: "idle",
      agentVersion: null,
      modelState: null,
      initialCommands: [],
      promptCapabilities: null,
      authMethods: [],
    },
    sessions: {},
    activeSessionId: null,
    roster: {},
    models: null,
    settings: null,
    mcpServers: [],
    search: null,
    pendingInteractions: [],
    unhandled: {},
    appliedEvents: 0,
  };
}
/** 一个回合的本地墙钟区间（「已工作 Ns」turn 头用；内核帧无时间戳，纯本地计时）。 */
export type TurnRecord = { startedAt: number; endedAt: number | null };

/**
 * SessionUpdate::SubagentFinished（extensions/notification.rs）的桌面侧投影。
 * status ∈ "completed" | "failed" | "cancelled"（内核逐字三态）。
 */
export type SubagentFinishedInfo = {
  status: string;
  error: string | null;
  durationMs: number | null;
  output: string | null;
};
