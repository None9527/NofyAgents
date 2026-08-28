// HostClient — Transport 之上的类型化门面（清洗自旧 src/lib/rpc.ts）。
// 方法面与内核能力 1:1；UI 只依赖本门面，不触碰传输细节。

import { getDesktop, type Transport } from "./transport";
import type {
  Automation,
  BackendEvents,
  LiveState,
  Provider,
  Settings,
  Skill,
  Task,
  Turn,
} from "./types";

export class HostClient {
  constructor(readonly transport: Transport) {}

  get backendKind(): string {
    return this.transport.kind;
  }

  get isDesktop(): boolean {
    return Boolean(getDesktop()?.isElectron);
  }

  subscribe<K extends keyof BackendEvents>(
    event: K,
    handler: (payload: BackendEvents[K]) => void,
  ): () => void {
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
  getMcpServers(): Promise<
    Array<{ name: string; source?: string; status?: string; tools?: number | null }>
  > {
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
    const desktop = getDesktop();
    if (desktop?.termExec) return desktop.termExec(command, cwd);
    return this.transport.request("exec", { command, cwd });
  }
  getGitStatus(workspacePath: string): Promise<{ branch: string | null; changes: number }> {
    const desktop = getDesktop();
    if (desktop?.termExec) {
      return desktop
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
    const desktop = getDesktop();
    if (desktop?.fsRead) {
      return desktop.fsRead(path).then((r) => r.content);
    }
    return this.transport.request("readContext", { path });
  }
  // ---- Electron 专属 OS 能力（浏览器诚实降级为空值，D3） ----
  listFiles(dir: string): Promise<Array<{ name: string; isDir: boolean }>> {
    const desktop = getDesktop();
    if (!desktop?.fsList) return Promise.resolve([]);
    return desktop.fsList(dir).then((r) => (Array.isArray(r) ? r : []));
  }
  selectDirectory(): Promise<string | null> {
    const desktop = getDesktop();
    if (!desktop?.selectDirectory) return Promise.resolve(null);
    return desktop.selectDirectory();
  }
  // ---- daemon 管理桥（桌面经 exec；web 降级） ----
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
      .then(({ output }) => ({
        ok: !/error/i.test(output),
        error: /error/i.test(output) ? output.trim().slice(0, 200) : undefined,
      }));
  }
  scheduleRemove(id: string): Promise<{ ok: boolean; error?: string }> {
    return this.exec(`nofy schedule remove ${this.shq(id)} 2>&1`).then(({ output }) => ({
      ok: !/error/i.test(output),
      error: /error/i.test(output) ? output.trim().slice(0, 200) : undefined,
    }));
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
    return this.exec(`nofy mcp add ${this.shq(name)} ${this.shq(command)} 2>&1`).then(({ output }) => ({
      ok: !/error/i.test(output),
      error: /error/i.test(output) ? output.trim().slice(0, 200) : undefined,
    }));
  }
  mcpRemove(name: string): Promise<{ ok: boolean; error?: string }> {
    return this.exec(`nofy mcp remove ${this.shq(name)} 2>&1`).then(({ output }) => ({
      ok: !/error/i.test(output),
      error: /error/i.test(output) ? output.trim().slice(0, 200) : undefined,
    }));
  }
  mcpSetEnabled(name: string, enabled: boolean): Promise<{ ok: boolean; error?: string }> {
    return this
      .exec(`nofy mcp ${enabled ? "enable" : "disable"} ${this.shq(name)} 2>&1`)
      .then(({ output }) => ({
        ok: !/error/i.test(output),
        error: /error/i.test(output) ? output.trim().slice(0, 200) : undefined,
      }));
  }
  getPairingInfo(): Promise<{ token: string; port: number }> {
    return this.transport.request("getPairingInfo");
  }
  getLive(taskId: string): Promise<LiveState | null> {
    return this.transport.request("getLive", { taskId });
  }
}
