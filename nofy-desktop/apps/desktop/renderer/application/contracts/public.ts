import type { WorkspaceFileAccess } from "../../../shared/workspace-files-contract.ts";
import type { AppState } from "../../core/store/state.ts";
import type { TaskResult } from "../../core/effects.ts";
import type { ContextInfo, FsFile, FsNode, GitStatus } from "../../ui/readers.ts";
export type Attachment = { path: string; name: string; kind: "file" | "directory" | "other" };
export type Projection = { getState: () => AppState; subscribe: (listener: () => void) => () => void };
export type PendingInteraction = AppState["pendingInteractions"][number];
export type PermissionMode = "confirm" | "autoedit" | "plan" | "full";
export type InteractionsClient = {
  choose: (item: PendingInteraction, optionId: string) => Promise<TaskResult>;
  cancel: (item: PendingInteraction) => Promise<TaskResult>;
  trust: (item: PendingInteraction, trust: boolean) => Promise<TaskResult>;
  answer: (item: PendingInteraction, payload: Record<string, unknown>) => Promise<TaskResult>;
};
export type SessionsClient = {
  create: (cwd: string) => Promise<TaskResult>;
  load: (id: string, cwd: string, fresh?: boolean) => Promise<TaskResult>;
  activate: (id: string) => void;
  forget: (id: string) => void;
  send: (id: string, text: string, attach: Attachment[]) => Promise<TaskResult>;
  cancel: (id: string, cancelSubagents?: boolean) => Promise<TaskResult>;
  setPermission: (id: string, mode: PermissionMode) => Promise<TaskResult>;
  setModel: (id: string, modelId: string, effort?: string) => Promise<TaskResult>;
  refreshRoster: () => Promise<TaskResult>;
  listWorkspaces: () => Promise<TaskResult>;
  editQueue: (id: string, entry: string, text: string) => Promise<TaskResult>;
  removeQueue: (id: string, entry: string) => Promise<TaskResult>;
  clearQueue: (id: string) => Promise<TaskResult>;
};
export type ReadResult<T> = { ok: true; value: T } | { ok: false; error: string };
export type FilesClient = {
  list: (id: string | null, path: string) => Promise<ReadResult<{ nodes: FsNode[]; truncated: boolean }>>;
  read: (id: string | null, path: string) => Promise<ReadResult<FsFile>>;
  openSearch: (id: string | null, cwd: string) => Promise<ReadResult<string>>;
  changeSearch: (id: string, query: string) => Promise<TaskResult>;
  closeSearch: (id: string) => Promise<TaskResult>;
};
export type WorkspaceClient = {
  context: (id: string) => Promise<ContextInfo | null>;
  git: (id: string) => Promise<GitStatus | null>;
  pickDirectory: () => Promise<string | null>;
  validateDirectory: (path: string) => Promise<string>;
};
export type TasksClient = {
  reconcile: (sessionId: string) => Promise<TaskResult>;
  kill: (sessionId: string, taskId: string) => Promise<TaskResult>;
  cancelSubagent: (sessionId: string, subagentId: string) => Promise<TaskResult>;
  deleteSchedule: (sessionId: string, taskId: string) => Promise<TaskResult>;
};
import type { SettingsClient } from "../settings/contracts.ts";
import type { FileHostAccess } from "../../../shared/file-host-contract.ts";
export type { FileOpenKind, FileHostResult } from "../../../shared/file-host-contract.ts";
export type DesktopClient = { host: FileHostAccess & WorkspaceFileAccess; projection: Projection; settings: SettingsClient; sessions: SessionsClient; interactions: InteractionsClient; files: FilesClient; workspace: WorkspaceClient; tasks: TasksClient };
