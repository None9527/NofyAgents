// v2 域类型（清洗自旧 src/lib/rpc.ts + types.ts；新树唯一类型来源）

export type SessionStatus =
  | "idle"
  | "running"
  | "awaiting-approval"
  | "completed"
  | "failed"
  | "archived";

export interface Task {
  taskId: string;
  title: string;
  model: string | null;
  provider: string | null;
  updatedAt: number;
  status: string | null;
  mode: string | null;
}

export interface ToolCall {
  name: string;
  input: Record<string, unknown>;
  output: string;
}

export interface Turn {
  userText: string | null;
  assistantText: string | null;
  thought?: string | null;
  startedAt: string | null;
  toolCalls?: ToolCall[];
}

/** 运行中会话的流式状态。 */
export interface LiveState {
  text: string;
  thought?: string;
  toolCalls: ToolCall[];
  status: "running" | "completed" | "error" | "awaiting-approval" | "idle";
  pending?: { name: string; input: Record<string, unknown> } | null;
  elicitation?: Record<string, unknown> | null;
}

export interface Provider {
  id: string;
  name: string;
  models: string[];
}

export interface Automation {
  id: string;
  name: string;
  enabled: boolean;
  schedule: string | null;
}

export interface Skill {
  name: string;
  description: string;
  source: string;
}

export interface Settings {
  locale?: string;
  recentProjects?: string[];
  lastWorkspaceSession?: Array<{
    kind: string;
    workspacePath: string;
    workspacePurpose?: string;
  }>;
  lastActiveTabIndex?: number;
}

/** 后端推送事件（transport.subscribe）。 */
export interface BackendEvents {
  /** 会话流式更新。payload: { sessionId, live } */
  live: { sessionId: string; live: LiveState | null };
  /** 会话落定。payload: { sessionId, status } */
  settled: { sessionId: string; status: string };
  /** 传输连通性。payload: { connected } */
  status: { connected: boolean };
  /** 出现待答 elicitation。payload: { taskId } */
  elicitation: { taskId: string };
}
