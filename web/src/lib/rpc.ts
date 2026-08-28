// Typed client facade over a Transport (mock / ACP WebSocket / Electron IPC).
// Method surface mirrors the reference clean client 1:1.

import type { Transport } from "./transport";
import type { BackendEvents } from "./types";

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

export interface Provider {
  id: string;
  name: string;
  models: string[];
}

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

export class HostClient {
  constructor(readonly transport: Transport) {}

  get backendKind(): string {
    return this.transport.kind;
  }

  get isDesktop(): boolean {
    return Boolean(window.grokDesktop?.isElectron);
  }

  subscribe<K extends keyof BackendEvents>(event: K, handler: (payload: BackendEvents[K]) => void): () => void {
    return this.transport.subscribe(event, handler);
  }

  getSettings(): Promise<Settings> {
    return this.transport.request("getSettings");
  }
  getProviders(): Promise<Provider[]> {
    return this.transport.request("getProviders");
  }
  getTasks(workspacePath: string): Promise<Task[]> {
    return this.transport.request("getTasks", { workspacePath });
  }
  getConversation(taskId: string): Promise<Turn[]> {
    return this.transport.request("getConversation", { taskId });
  }
  search(query: string): Promise<{ tasks: Task[]; workspaces: string[] }> {
    return this.transport.request("search", { query });
  }
  getAutomations(): Promise<Automation[]> {
    return this.transport.request("getAutomations");
  }
  getSkills(workspacePath: string): Promise<Skill[]> {
    return this.transport.request("getSkills", { workspacePath });
  }
  setSettings(patch: Record<string, unknown>): Promise<{ ok: boolean }> {
    return this.transport.request("setSettings", patch);
  }
  createTask(params: {
    workspacePath: string;
    title: string;
    model?: string | null;
    provider?: string | null;
    mode?: string;
    confirm?: boolean;
    prompt?: string;
  }): Promise<Task> {
    return this.transport.request("createTask", params);
  }
  chat(taskId: string, text: string, mode?: string, confirm?: boolean): Promise<{ ok: boolean }> {
    return this.transport.request("chat", { taskId, text, mode, confirm });
  }
  cancel(taskId: string): Promise<{ ok: boolean }> {
    return this.transport.request("cancel", { taskId });
  }
  getCommands(): Promise<Array<{ name: string; description: string }>> {
    return this.transport.request("getCommands");
  }
  getMcpServers(): Promise<Array<{ name: string; source?: string; status?: string; tools?: number | null }>> {
    return this.transport.request("getMcpServers");
  }
  getTaskStats(taskId: string): Promise<{
    usage: { input: number; output: number; reasoning: number };
    summary: string | null;
    contextTokens: number;
    contextWindow: number;
    queue: string[];
  }> {
    return this.transport.request("getTaskStats", { taskId });
  }
  setEffort(taskId: string, effort: string): Promise<{ ok: boolean }> {
    return this.transport.request("setEffort", { taskId, effort });
  }
  getRewindPoints(taskId: string): Promise<{
    points: Array<{
      prompt_index: number;
      created_at?: string;
      num_file_snapshots: number;
      has_file_changes: boolean;
      prompt_preview: string;
    }>;
  }> {
    return this.transport.request("getRewindPoints", { taskId });
  }
  rewind(
    taskId: string,
    targetPromptIndex: number,
  ): Promise<{ ok: boolean; reverted?: string[]; conflicts?: string[] }> {
    return this.transport.request("rewind", { taskId, targetPromptIndex });
  }
  resolveElicitation(
    taskId: string,
    action: "accept" | "decline" | "cancel",
    content?: Record<string, unknown>,
  ): Promise<{ ok: boolean }> {
    return this.transport.request("resolveElicitation", { taskId, action, content });
  }
  approveTool(taskId: string, allow: boolean): Promise<{ ok: boolean }> {
    return this.transport.request("approveTool", { taskId, allow });
  }
  updateTask(params: {
    taskId: string;
    title?: string;
    pinned?: boolean;
    archived?: boolean;
    deleted?: boolean;
  }): Promise<{ ok: boolean }> {
    return this.transport.request("updateTask", params);
  }
  toggleAutomation(id: string, enabled: boolean): Promise<{ ok: boolean }> {
    return this.transport.request("toggleAutomation", { id, enabled });
  }
  exec(command: string, cwd?: string): Promise<{ output: string }> {
    if (window.grokDesktop?.termExec) return window.grokDesktop.termExec(command, cwd);
    return this.transport.request("exec", { command, cwd });
  }
  getGitStatus(workspacePath: string): Promise<{ branch: string | null; changes: number }> {
    if (window.grokDesktop?.termExec) {
      return window.grokDesktop
        .termExec(
          `git -C "${workspacePath}" rev-parse --abbrev-ref HEAD 2>/dev/null; git -C "${workspacePath}" status --porcelain 2>/dev/null | wc -l`,
          workspacePath,
        )
        .then(({ output }) => {
          const [branch, count] = output.trim().split("\n");
          return { branch: branch || null, changes: Number(count ?? 0) };
        })
        .catch(() => this.transport.request("getGitStatus", { workspacePath }));
    }
    return this.transport.request("getGitStatus", { workspacePath });
  }
  readContext(path: string): Promise<string | null> {
    if (window.grokDesktop?.fsRead) {
      return window.grokDesktop.fsRead(path).then((r) => r.content);
    }
    return this.transport.request("readContext", { path });
  }
  // ---- Electron-only OS capabilities (return null/[] in the browser) ------
  listFiles(dir: string): Promise<Array<{ name: string; isDir: boolean }>> {
    if (!window.grokDesktop?.fsList) return Promise.resolve([]);
    return window.grokDesktop.fsList(dir).then((r) => (Array.isArray(r) ? r : []));
  }
  readFile(file: string): Promise<string | null> {
    if (!window.grokDesktop?.fsRead) return Promise.resolve(null);
    return window.grokDesktop.fsRead(file).then((r) => r.content);
  }
  selectDirectory(): Promise<string | null> {
    if (!window.grokDesktop?.selectDirectory) return Promise.resolve(null);
    return window.grokDesktop.selectDirectory();
  }
  // ---- daemon / config management bridges (desktop exec; web degrades) ----
  private shq(s: string): string {
    return `'${s.replace(/'/g, `'\\''`)}'`;
  }
  scheduleList(): Promise<{ ok: boolean; schedules?: Array<Record<string, unknown>>; error?: string }> {
    return this.exec("nofy schedule list --json 2>&1").then(({ output }) => {
      if (output.includes("(web)")) return { ok: false, error: output.trim() };
      try {
        const parsed = JSON.parse(output) as unknown;
        const schedules = Array.isArray(parsed)
          ? (parsed as Array<Record<string, unknown>>)
          : ((parsed as { schedules?: Array<Record<string, unknown>> }).schedules ?? []);
        return { ok: true, schedules };
      } catch {
        return { ok: false, error: output.trim().slice(0, 200) };
      }
    });
  }
  scheduleAdd(id: string, cron: string, goal: string): Promise<{ ok: boolean; error?: string }> {
    return this
      .exec(`nofy schedule add --goal ${this.shq(goal)} ${this.shq(id)} ${this.shq(cron)} 2>&1`)
      .then(({ output }) => ({ ok: !/error/i.test(output), error: /error/i.test(output) ? output.trim().slice(0, 200) : undefined }));
  }
  scheduleRemove(id: string): Promise<{ ok: boolean; error?: string }> {
    return this
      .exec(`nofy schedule remove ${this.shq(id)} 2>&1`)
      .then(({ output }) => ({ ok: !/error/i.test(output), error: /error/i.test(output) ? output.trim().slice(0, 200) : undefined }));
  }
  mcpConfigList(): Promise<{ ok: boolean; servers?: Array<{ name: string; command: string }>; error?: string }> {
    return this.exec("nofy mcp list 2>&1").then(({ output }) => {
      if (output.includes("(web)")) return { ok: false, error: output.trim() };
      const servers = output
        .split("\n")
        .map((l) => /^(\S+):\s*(.*)$/.exec(l.trim()))
        .filter((m): m is RegExpExecArray => Boolean(m))
        .map((m) => ({ name: m[1], command: m[2] }));
      return { ok: true, servers };
    });
  }
  mcpAdd(name: string, command: string): Promise<{ ok: boolean; error?: string }> {
    return this
      .exec(`nofy mcp add ${this.shq(name)} ${this.shq(command)} 2>&1`)
      .then(({ output }) => ({ ok: !/error/i.test(output), error: /error/i.test(output) ? output.trim().slice(0, 200) : undefined }));
  }
  mcpRemove(name: string): Promise<{ ok: boolean; error?: string }> {
    return this
      .exec(`nofy mcp remove ${this.shq(name)} 2>&1`)
      .then(({ output }) => ({ ok: !/error/i.test(output), error: /error/i.test(output) ? output.trim().slice(0, 200) : undefined }));
  }
  mcpSetEnabled(name: string, enabled: boolean): Promise<{ ok: boolean; error?: string }> {
    return this
      .exec(`nofy mcp ${enabled ? "enable" : "disable"} ${this.shq(name)} 2>&1`)
      .then(({ output }) => ({ ok: !/error/i.test(output), error: /error/i.test(output) ? output.trim().slice(0, 200) : undefined }));
  }
  getPairingInfo(): Promise<{ token: string; port: number }> {
    return this.transport.request("getPairingInfo");
  }
  getLive(taskId: string): Promise<{
    text: string;
    thought?: string;
    toolCalls: ToolCall[];
    status: "running" | "completed" | "error" | "awaiting-approval" | "idle";
    pending?: { name: string; input: Record<string, unknown> } | null;
    elicitation?: Record<string, unknown> | null;
  } | null> {
    return this.transport.request("getLive", { taskId });
  }
}
