// Domain types shared across the client. Mirrors the session/turn model of
// the Grok Build agent runtime (see docs/00-overview.md).

export type SessionStatus =
  | "idle"
  | "running"
  | "awaiting-approval"
  | "completed"
  | "failed";

export type SessionMode = "build" | "plan";

export interface Session {
  id: string;
  title: string;
  model: string | null;
  updatedAt: number;
  status: SessionStatus;
  mode: SessionMode;
  pinned?: boolean;
}

export interface ToolCall {
  name: string;
  input: Record<string, unknown>;
  output: string;
}

export interface Turn {
  userText: string | null;
  assistantText: string | null;
  startedAt: string | null;
  toolCalls?: ToolCall[];
}

/** Live streaming state of a running session. */
export interface LiveState {
  text: string;
  status: SessionStatus;
  pending?: { name: string; input: Record<string, unknown> } | null;
}

export interface GitStatus {
  branch: string | null;
  changes: number;
}

export interface Settings {
  theme: "dark" | "light";
  locale: "zh-CN" | "en-US";
  workspacePath: string | null;
  recentWorkspaces: string[];
}

export interface CreateSessionParams {
  title: string;
  prompt: string;
  model?: string | null;
  mode?: SessionMode;
}

/** Events pushed from the backend (transport.subscribe). */
export interface BackendEvents {
  /** Live streaming updates for a session. payload: { sessionId, live: LiveState } */
  live: { sessionId: string; live: LiveState | null };
  /** Session settled (completed/failed). payload: { sessionId, status } */
  settled: { sessionId: string; status: SessionStatus };
  /** Transport connectivity. payload: { connected } */
  status: { connected: boolean };
}
