// ACP transport — validated against the real `nofy agent serve` backend
// (probe: /tmp/acp-probe.mjs). Wire facts learned live:
//   * session/prompt params use `prompt` (content blocks), not `content`
//   * session/list returns {sessions:[{sessionId,cwd,updatedAt,_meta.nofy.session.facets}]}
//   * session/new returns {sessionId, models:{currentModelId, availableModels}}
//   * streaming: session/update agent_thought_chunk / agent_message_chunk
//   * tools: session/update tool_call {toolCallId,title,rawInput} then
//     tool_call_update {status, content:[{type:"content",content:{type:"text",text}}], rawOutput}
//   * live metadata: _nofy/sessions/changed {upserted:[{sessionId,title,activity,modelId}]},
//     session/update session_info_update {title}
//   * slash commands: session/update available_commands_update {availableCommands}
//   * permissions: session/request_permission (skipped when session runs yolo)
//   * history replay: session/resume streams old turns, ended by _nofy/replayed

import { BaseTransport } from "./transport";
import type { Automation, Provider, Skill, Task, ToolCall, Turn } from "./rpc";

interface JsonRpcFrame {
  jsonrpc: "2.0";
  id?: number | string;
  method?: string;
  params?: unknown;
  result?: unknown;
  error?: { code: number; message: string };
}

interface AcpContentBlock {
  type: string;
  text?: string;
  content?: AcpContentBlock;
  [key: string]: unknown;
}

interface AcpSessionUpdate {
  sessionUpdate: string;
  content?: AcpContentBlock | AcpContentBlock[];
  toolCallId?: string;
  title?: string;
  kind?: string;
  status?: string;
  rawInput?: Record<string, unknown>;
  rawOutput?: Record<string, unknown>;
  availableCommands?: Array<{ name: string; description: string }>;
  [key: string]: unknown;
}

interface PermissionOption {
  optionId: string;
  name: string;
  kind: string;
}

interface LiveState {
  text: string;
  thought: string;
  toolCalls: ToolCall[];
  status: "running" | "completed" | "error" | "awaiting-approval" | "idle";
  pending: { name: string; input: Record<string, unknown> } | null;
}

interface SessionRuntime {
  task: Task;
  turns: Turn[];
  live: LiveState | null;
  replaying: boolean;
  replayDone: (() => void) | null;
  pendingPermission: { requestId: number | string; options: PermissionOption[] } | null;
  pendingElicitation: { requestId: number | string; params: Record<string, unknown> } | null;
  usage: { input: number; output: number; reasoning: number };
  summary: string | null;
  contextTokens: number;
  contextWindow: number;
  queue: string[];
}

interface McpServer {
  name: string;
  source?: string;
  status?: string;
  tools?: number | null;
}

interface SessionMeta {
  title?: string | null;
  activity?: string;
  modelId?: string | null;
  branch?: string | null;
}

export class AcpTransport extends BaseTransport {
  readonly kind = "websocket" as const;

  private ws: WebSocket | null = null;
  private nextId = 1;
  private pending = new Map<number | string, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();
  private runtimes = new Map<string, SessionRuntime>();
  private meta = new Map<string, SessionMeta>();
  private mcpServers: McpServer[] = [];
  private listCache: Task[] | null = null;
  private providersCache: Provider[] = [];
  private commands: Array<{ name: string; description: string }> = [];
  private initialized = false;
  private closedByUser = false;
  private reconnectTimer: number | null = null;
  private localSettings: Record<string, unknown>;

  constructor(
    readonly url: string,
    readonly cwd: string,
  ) {
    super();
    this.localSettings = {
      locale: "zh-CN",
      recentProjects: [cwd],
      lastWorkspaceSession: [{ kind: "local", workspacePath: cwd }],
      lastActiveTabIndex: 0,
    };
    this.connect();
  }

  // ------------------------------------------------------------- connection

  private connect(): void {
    const ws = new WebSocket(this.url);
    this.ws = ws;
    ws.onopen = () => {
      this.emitRaw("status", { connected: true });
      void this.handshake();
    };
    ws.onmessage = (event) => this.onFrame(String(event.data));
    ws.onclose = () => {
      this.emitRaw("status", { connected: false });
      this.failPending(new Error("connection closed"));
      if (!this.closedByUser) this.scheduleReconnect();
    };
    ws.onerror = () => ws.close();
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer != null) return;
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.initialized = false;
      this.readyPromise = null;
      if (!this.closedByUser) this.connect();
    }, 2000);
  }

  private async handshake(): Promise<void> {
    try {
      await this.rpc("initialize", {
        protocolVersion: 1,
        clientCapabilities: {
          fs: { readTextFile: false, writeTextFile: false },
          elicitation: { form: {}, url: {} },
        },
        clientInfo: { name: "grok-build-web", version: "0.1.0" },
      });
      this.initialized = true;
      this.readyResolve?.();
    } catch (error) {
      console.warn("[acp] initialize failed", error);
    }
  }

  private readyPromise: Promise<void> | null = null;
  private readyResolve: (() => void) | null = null;

  /** Resolves once the ACP handshake completed (or times out). */
  private ready(): Promise<void> {
    if (this.initialized) return Promise.resolve();
    if (!this.readyPromise) {
      this.readyPromise = new Promise((resolve) => {
        this.readyResolve = resolve;
        window.setTimeout(resolve, 5000);
      });
    }
    return this.readyPromise;
  }

  private rpc(method: string, params: unknown): Promise<unknown> {
    const ws = this.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return Promise.reject(new Error(`backend not connected (${this.url})`));
    }
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ jsonrpc: "2.0", id, method, params }));
    });
  }

  private reply(id: number | string, result: unknown): void {
    const ws = this.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ jsonrpc: "2.0", id, result }));
  }

  private failPending(error: Error): void {
    for (const waiter of this.pending.values()) waiter.reject(error);
    this.pending.clear();
  }

  // ------------------------------------------------------------ frame router

  private onFrame(data: string): void {
    let frame: JsonRpcFrame;
    try {
      frame = JSON.parse(data);
    } catch {
      return;
    }
    if (frame.id != null && (frame.result !== undefined || frame.error !== undefined)) {
      const waiter = this.pending.get(frame.id);
      if (!waiter) return;
      this.pending.delete(frame.id);
      if (frame.error) waiter.reject(new Error(frame.error.message));
      else waiter.resolve(frame.result);
      return;
    }
    const params = (frame.params ?? {}) as Record<string, unknown>;
    if (frame.method === "session/update") {
      this.onSessionUpdate(params as { sessionId: string; update: AcpSessionUpdate });
    } else if (frame.method === "_nofy/session_notification") {
      this.onNotification(params as { sessionId?: string; update: AcpSessionUpdate });
    } else if (frame.method === "_nofy/mcp/servers_updated") {
      this.mcpServers = ((params.mcpServers ?? []) as McpServer[]).map((s) => ({ ...s }));
    } else if (frame.method === "_nofy/mcp/server_status") {
      const name = String(params.name ?? "");
      const server = this.mcpServers.find((s) => s.name === name);
      if (server) {
        server.status = String(params.status ?? server.status ?? "");
        server.tools = (params.tools as number | null) ?? server.tools;
      } else {
        this.mcpServers.push({ name, source: String(params.source ?? ""), status: String(params.status ?? ""), tools: params.tools as number | null });
      }
    } else if (frame.method === "_nofy/mcp_initialized") {
      const name = String(params.sessionId ?? "");
      void name; // tool count broadcast; per-server status arrives via server_status
    } else if (frame.method === "_nofy/queue/changed") {
      const rt = params.sessionId ? this.runtimes.get(String(params.sessionId)) : undefined;
      if (rt) {
        const entries = (params.entries ?? []) as Array<{ text?: string }>;
        rt.queue = entries.map((e) => String(e.text ?? "")).filter(Boolean);
      }
    } else if (frame.method === "_nofy/sessions/changed") {
      this.onSessionsChanged(params as { upserted?: Array<Record<string, unknown>>; removed?: string[] });
    } else if (frame.method === "_nofy/replayed") {
      this.endReplay(String(params.sessionId ?? ""));
    } else if (frame.method === "session/request_permission" && frame.id != null) {
      this.onPermissionRequest(frame.id, params as { sessionId: string; options: PermissionOption[] });
    } else if (frame.method === "elicitation/create" && frame.id != null) {
      const rt = params.sessionId ? this.runtimes.get(String(params.sessionId)) : undefined;
      if (rt) {
        rt.pendingElicitation = { requestId: frame.id, params: params as Record<string, unknown> };
        this.emitRaw("elicitation", { taskId: rt.task.taskId });
      } else {
        this.reply(frame.id, { action: "cancel" });
      }
    } else if (frame.id != null) {
      this.reply(frame.id, {});
    }
  }

  private onSessionsChanged(params: { upserted?: Array<Record<string, unknown>>; removed?: string[] }): void {
    for (const entry of params.upserted ?? []) {
      const id = String(entry.sessionId ?? "");
      if (!id) continue;
      const previous = this.meta.get(id) ?? {};
      this.meta.set(id, {
        title: (entry.title as string | null) ?? previous.title,
        activity: (entry.activity as string) ?? previous.activity,
        modelId: (entry.modelId as string | null) ?? previous.modelId,
      });
      const rt = this.runtimes.get(id);
      if (rt) {
        if (entry.title) rt.task.title = String(entry.title);
        rt.task.status = entry.activity === "working" ? "running" : rt.task.status === "running" ? "completed" : rt.task.status;
      }
    }
    for (const id of params.removed ?? []) {
      this.meta.delete(id);
      this.runtimes.delete(id);
    }
    this.listCache = null; // refresh on next getTasks
  }

  private runtime(sessionId: string): SessionRuntime | null {
    return this.runtimes.get(sessionId) ?? null;
  }

  private ensureRuntime(sessionId: string): SessionRuntime {
    let rt = this.runtimes.get(sessionId);
    if (!rt) {
      const m = this.meta.get(sessionId);
      rt = {
        task: {
          taskId: sessionId,
          title: m?.title || sessionId.slice(0, 8),
          model: m?.modelId ?? null,
          provider: null,
          updatedAt: Date.now(),
          status: "idle",
          mode: "build",
        },
        turns: [],
        live: null,
        replaying: false,
        replayDone: null,
        pendingPermission: null,
        usage: { input: 0, output: 0, reasoning: 0 },
        summary: null,
        contextTokens: 0,
        contextWindow: 200000,
        queue: [],
        pendingElicitation: null,
      };
      this.runtimes.set(sessionId, rt);
    }
    return rt;
  }

  private endReplay(sessionId: string): void {
    const rt = this.runtimes.get(sessionId);
    if (!rt) return;
    rt.replaying = false;
    rt.replayDone?.();
    rt.replayDone = null;
  }

  private onSessionUpdate(params: { sessionId: string; update: AcpSessionUpdate }): void {
    const rt = this.ensureRuntime(params.sessionId);
    const update = params.update;
    if (!update || typeof update !== "object") return;

    if (update.sessionUpdate === "session_info_update" && typeof update.title === "string") {
      rt.task.title = update.title;
      const m = this.meta.get(rt.task.taskId) ?? {};
      this.meta.set(rt.task.taskId, { ...m, title: update.title });
      this.listCache = null;
      return;
    }
    if (update.sessionUpdate === "available_commands_update") {
      this.commands = (update.availableCommands ?? []).map((c) => ({ name: c.name, description: c.description }));
      return;
    }

    // history replay: rebuild turns instead of the live bubble
    if (rt.replaying) {
      this.collectReplay(rt, update);
      return;
    }

    switch (update.sessionUpdate) {
      case "agent_message_chunk":
      case "agent_thought_chunk": {
        const text = chunkText(update.content);
        const meta = (update as Record<string, unknown>)._meta as
          | { totalTokens?: number }
          | undefined;
        if (meta?.totalTokens) rt.contextTokens = meta.totalTokens;
        if (!text) break;
        if (!rt.live) rt.live = { text: "", thought: "", toolCalls: [], status: "running", pending: null };
        if (update.sessionUpdate === "agent_thought_chunk") rt.live.thought += text;
        else rt.live.text += text;
        rt.live.status = "running";
        rt.task.status = "running";
        break;
      }
      case "user_message_chunk":
        break; // echoed prompt; turns already record it
      case "tool_call": {
        if (!rt.live) rt.live = { text: "", thought: "", toolCalls: [], status: "running", pending: null };
        rt.live.toolCalls.push({
          name: String(update.title ?? "tool"),
          input: update.rawInput ?? {},
          output: "",
        });
        rt.live.pending = { name: String(update.title ?? "tool"), input: update.rawInput ?? {} };
        break;
      }
      case "tool_call_update": {
        const call = findToolCall(rt.live?.toolCalls, update);
        const text = toolUpdateText(update);
        if (call && text) call.output = text;
        if (update.status === "completed" || update.status === "failed") {
          if (rt.live) rt.live.pending = null;
        }
        break;
      }
      default:
        break;
    }
  }

  /** _nofy/session_notification: usage, summaries, and visible updates. */
  private onNotification(params: { sessionId?: string; update: AcpSessionUpdate }): void {
    const update = params.update;
    if (!update || typeof update !== "object") return;
    const rt = params.sessionId ? this.runtimes.get(params.sessionId) : undefined;
    switch (update.sessionUpdate) {
      case "response_completed": {
        if (!rt) return;
        const usage = (update.usage ?? {}) as Record<string, number>;
        rt.usage.input += usage.input_tokens ?? 0;
        rt.usage.output += usage.output_tokens ?? 0;
        rt.usage.reasoning += usage.reasoning_tokens ?? 0;
        return;
      }
      case "last_turn_summary": {
        const summary = (update as Record<string, unknown>).summary;
        if (rt && typeof summary === "string") rt.summary = summary;
        return;
      }
      default:
        if (rt && params.sessionId) this.onSessionUpdate({ sessionId: params.sessionId, update });
        return;
    }
  }

  private collectReplay(rt: SessionRuntime, update: AcpSessionUpdate): void {
    const last = () => rt.turns[rt.turns.length - 1];
    switch (update.sessionUpdate) {
      case "user_message_chunk": {
        const text = chunkText(update.content);
        rt.turns.push({ userText: text, assistantText: null, startedAt: null });
        break;
      }
      case "agent_message_chunk": {
        const text = chunkText(update.content);
        if (!text) break;
        let turn = last();
        if (!turn || turn.assistantText != null) {
          turn = { userText: null, assistantText: null, startedAt: null };
          rt.turns.push(turn);
        }
        turn.assistantText = (turn.assistantText ?? "") + text;
        break;
      }
      case "tool_call": {
        let turn = last();
        if (!turn) {
          turn = { userText: null, assistantText: null, startedAt: null };
          rt.turns.push(turn);
        }
        (turn.toolCalls ??= []).push({
          name: String(update.title ?? "tool"),
          input: update.rawInput ?? {},
          output: "",
        });
        break;
      }
      case "tool_call_update": {
        const turn = last();
        const call = findToolCall(turn?.toolCalls, update);
        const text = toolUpdateText(update);
        if (call && text) call.output = text;
        break;
      }
      default:
        break;
    }
  }

  private onPermissionRequest(id: number | string, params: { sessionId: string; options: PermissionOption[] }): void {
    const rt = this.ensureRuntime(params.sessionId);
    if (rt.live) {
      rt.live.status = "awaiting-approval";
      rt.task.status = "awaiting-approval";
    }
    rt.pendingPermission = { requestId: id, options: params.options ?? [] };
  }

  // -------------------------------------------------------------- RPC surface

  request<T>(method: string, params?: unknown): Promise<T> {
    const p = (params ?? {}) as Record<string, string | boolean | null>;
    switch (method) {
      case "getSettings":
        return Promise.resolve({ ...this.localSettings } as T);
      case "setSettings":
        this.localSettings = { ...this.localSettings, ...p };
        return Promise.resolve({ ok: true } as T);
      case "getProviders":
        return Promise.resolve(this.providersCache as T);
      case "getTasks":
        return this.listTasks() as Promise<T>;
      case "getConversation":
        return this.conversation(String(p.taskId)) as Promise<T>;
      case "search": {
        const q = String(p.query ?? "").toLowerCase();
        return (async () => {
          const tasks = await this.listTasks();
          return {
            tasks: tasks.filter((t) => t.title.toLowerCase().includes(q)),
            workspaces: q && this.cwd.toLowerCase().includes(q) ? [this.cwd] : [],
          };
        })() as Promise<T>;
      }
      case "getAutomations":
        return Promise.resolve([] as Automation[] as T);
      case "getSkills":
        return Promise.resolve(
          this.commands.map((c) => ({ name: `/${c.name}`, description: c.description, source: "agent" })) as Skill[] as T,
        );
      case "toggleAutomation":
        return Promise.resolve({ ok: true } as T);
      case "createTask":
        return this.createTask(
          String(p.title ?? "新任务"),
          String(p.prompt ?? ""),
          p.model ? String(p.model) : null,
        ) as Promise<T>;
      case "chat":
        return this.chat(String(p.taskId), String(p.text ?? "")) as Promise<T>;
      case "cancel": {
        const rt = this.runtime(String(p.taskId));
        if (rt) void this.rpc("session/cancel", { sessionId: rt.task.taskId }).catch(() => {});
        return Promise.resolve({ ok: true } as T);
      }
      case "getCommands":
        return (async () => {
          await this.ready();
          return this.commands;
        })() as Promise<T>;
      case "approveTool":
        return this.approve(String(p.taskId), Boolean(p.allow)) as Promise<T>;
      case "updateTask": {
        const rt = this.runtime(String(p.taskId));
        if (rt && typeof p.title === "string") rt.task.title = p.title;
        return Promise.resolve({ ok: true } as T);
      }
      case "exec":
        return Promise.resolve({ output: "(web) 真实命令执行需 Electron 或后端扩展" } as T);
      case "getGitStatus":
        return (async () => {
          await this.ready();
          const listed = await this.listTasks();
          for (const task of listed) {
            const branch = this.meta.get(task.taskId)?.branch;
            if (branch) return { branch, changes: 0 };
          }
          return null;
        })() as Promise<T>;
      case "readContext":
        return Promise.resolve(null as T);
      case "getPairingInfo":
        return Promise.resolve({ token: "acp-live", port: Number(new URL(this.url).port || 9800) } as T);
      case "getLive": {
        const rt = this.runtime(String(p.taskId));
        return Promise.resolve(
          (rt?.live
            ? {
                ...rt.live,
                toolCalls: [...rt.live.toolCalls],
                elicitation: rt.pendingElicitation?.params ?? null,
              }
            : null) as T,
        );
      }
      case "getRewindPoints": {
        const rt = this.runtime(String(p.taskId));
        if (!rt) return Promise.resolve({ points: [] } as T);
        return (async () => {
          await this.ready();
          const result = (await this.rpc("_nofy/rewind/points", {
            sessionId: rt.task.taskId,
          })) as { rewind_points?: Array<Record<string, unknown>> };
          return { points: result.rewind_points ?? [] } as T;
        })();
      }
      case "rewind": {
        const rt = this.runtime(String(p.taskId));
        if (!rt) return Promise.resolve({ ok: false } as T);
        return (async () => {
          await this.ready();
          const result = (await this.rpc("_nofy/rewind/execute", {
            sessionId: rt.task.taskId,
            target_prompt_index: Number(p.targetPromptIndex ?? 0),
          })) as { reverted_files?: string[]; clean_files?: string[]; conflicts?: string[] };
          // history changed server-side; the UI re-fetches getConversation()
          return {
            ok: true,
            reverted: result.reverted_files ?? [],
            conflicts: result.conflicts ?? [],
          } as T;
        })();
      }
      case "resolveElicitation": {
        const rt = this.runtime(String(p.taskId));
        const pendingEl = rt?.pendingElicitation;
        if (!rt || !pendingEl) return Promise.resolve({ ok: false } as T);
        const action = String(p.action ?? "decline");
        const replyPayload =
          action === "accept"
            ? { action: "accept", content: (p.content as unknown as Record<string, unknown>) ?? {} }
            : { action };
        this.reply(pendingEl.requestId, replyPayload);
        rt.pendingElicitation = null;
        return Promise.resolve({ ok: true } as T);
      }
      case "getMcpServers":
        return Promise.resolve(this.mcpServers.map((s) => ({ ...s })) as T);
      case "getTaskStats": {
        const rt = this.runtime(String(p.taskId));
        return Promise.resolve(
          (rt
            ? {
                usage: { ...rt.usage },
                summary: rt.summary,
                contextTokens: rt.contextTokens,
                contextWindow: rt.contextWindow,
                queue: [...rt.queue],
              }
            : {
                usage: { input: 0, output: 0, reasoning: 0 },
                summary: null,
                contextTokens: 0,
                contextWindow: 200000,
                queue: [],
              }) as T,
        );
      }
      case "setEffort": {
        const rt = this.runtime(String(p.taskId));
        if (rt) {
          void this
            .rpc("session/set_model", {
              sessionId: rt.task.taskId,
              modelId: rt.task.model ?? "default",
              _meta: { reasoningEffort: String(p.effort ?? "high") },
            })
            .catch(() => {});
        }
        return Promise.resolve({ ok: true } as T);
      }
      default:
        return Promise.reject(new Error(`acp transport: unknown method ${method}`));
    }
  }

  private async listTasks(): Promise<Task[]> {
    if (this.listCache) return this.listCache;
    try {
      await this.ready();
      const result = (await this.rpc("session/list", {})) as {
        sessions?: Array<Record<string, unknown>>;
      };
      const tasks = (result.sessions ?? [])
        .map((s) => {
          const id = String(s.sessionId ?? "");
          // _meta keys are slashed strings: {"nofy/session": {kind, facets}}
          const nofySession = ((s._meta as Record<string, unknown>)?.["nofy/session"] ?? {}) as Record<
            string,
            unknown
          >;
          const facets = (nofySession.facets ?? {}) as Record<string, unknown>;
          const facetCwd = String(facets.cwd ?? s.cwd ?? "");
          const facetBranch = (facets.branch as string | undefined) ?? null;
          const m = this.meta.get(id);
          if (facetBranch) this.meta.set(id, { ...m, branch: facetBranch });
          return {
            task: {
              taskId: id,
              title: m?.title || (s.title as string) || facetCwd.split("/").pop() || id.slice(0, 8),
              model: m?.modelId ?? null,
              provider: null,
              updatedAt: Date.parse(String(s.updatedAt ?? "")) || Date.now(),
              status: m?.activity === "working" ? "running" : "completed",
              mode: "build",
            } as Task,
            cwd: facetCwd,
          };
        })
        .filter((entry) => !entry.cwd || entry.cwd === this.cwd || this.cwd.startsWith(entry.cwd))
        .map((entry) => entry.task);
      this.listCache = tasks;
      return tasks;
    } catch (error) {
      console.warn("[acp] session/list failed", error);
      return [];
    }
  }

  private async conversation(taskId: string): Promise<Turn[]> {
    const rt = this.ensureRuntime(taskId);
    if (rt.turns.length > 0 || rt.replaying) return [...rt.turns];
    // resume the session on the agent; old turns stream back as updates
    rt.replaying = true;
    const done = new Promise<void>((resolve) => {
      rt.replayDone = resolve;
      window.setTimeout(() => this.endReplay(taskId), 6000);
    });
    try {
      await this.ready();
      // session/load replays stored history; resume only reattaches live ones
      await this.rpc("session/load", { sessionId: taskId, cwd: this.cwd, mcpServers: [] });
    } catch (error) {
      console.warn("[acp] session/load failed", error);
    }
    this.endReplay(taskId);
    await done;
    return [...rt.turns];
  }

  private async createTask(title: string, prompt: string, model: string | null): Promise<Task> {
    await this.ready();
    const created = (await this.rpc("session/new", { cwd: this.cwd, mcpServers: [] })) as {
      sessionId: string;
      models?: { currentModelId?: string; availableModels?: Array<{ modelId: string; name?: string }> };
    };
    const rt = this.ensureRuntime(created.sessionId);
    if (created.models?.availableModels?.length) {
      this.providersCache = [
        {
          id: "agent",
          name: `Agent (${created.models.currentModelId ?? "default"})`,
          models: created.models.availableModels.map((m) => m.modelId),
        },
      ];
      const current = created.models.availableModels.find(
        (m) => m.modelId === created.models?.currentModelId,
      ) as { _meta?: { totalContextTokens?: number } } | undefined;
      if (current?._meta?.totalContextTokens) rt.contextWindow = current._meta.totalContextTokens;
    }
    // apply the user's model choice on the fresh session
    const modelId = model?.includes("/") ? model.slice(model.indexOf("/") + 1) : model;
    if (modelId && modelId !== created.models?.currentModelId) {
      void this.rpc("session/set_model", { sessionId: created.sessionId, modelId }).catch((e) =>
        console.warn("[acp] set_model failed", e),
      );
    }
    rt.task.title = title.slice(0, 60);
    rt.task.status = "running";
    rt.task.updatedAt = Date.now();
    rt.turns.push({ userText: prompt, assistantText: null, startedAt: new Date().toISOString() });
    this.listCache = null;
    void this.prompt(rt, prompt);
    return { ...rt.task };
  }

  private async chat(taskId: string, text: string): Promise<{ ok: boolean }> {
    const rt = this.ensureRuntime(taskId);
    rt.turns.push({ userText: text, assistantText: null, startedAt: new Date().toISOString() });
    rt.live = { text: "", thought: "", toolCalls: [], status: "running", pending: null };
    rt.task.status = "running";
    rt.task.updatedAt = Date.now();
    void this.prompt(rt, text);
    return { ok: true };
  }

  private async prompt(rt: SessionRuntime, text: string): Promise<void> {
    try {
      await this.rpc("session/prompt", {
        sessionId: rt.task.taskId,
        prompt: [{ type: "text", text }],
      });
      this.settle(rt, "completed");
    } catch (error) {
      console.warn("[acp] prompt failed", error);
      this.settle(rt, "error");
    }
  }

  private settle(rt: SessionRuntime, status: "completed" | "error"): void {
    if (rt.live) {
      const last = rt.turns[rt.turns.length - 1];
      if (last) {
        last.assistantText = rt.live.text || (status === "error" ? "（后端错误）" : "");
        last.thought = rt.live.thought || null;
        last.toolCalls = rt.live.toolCalls.length ? [...rt.live.toolCalls] : undefined;
      }
    }
    rt.live = null;
    rt.task.status = status;
    rt.task.updatedAt = Date.now();
    this.listCache = null;
  }

  private approve(taskId: string, allow: boolean): Promise<{ ok: boolean }> {
    const rt = this.runtime(taskId);
    if (!rt) return Promise.reject(new Error("no such task"));
    const pending = rt.pendingPermission;
    rt.pendingPermission = null;
    if (rt.live) {
      rt.live.status = "running";
      rt.live.pending = null;
    }
    rt.task.status = "running";
    if (pending) {
      const preferred = allow ? ["allow_once", "allow_always"] : ["reject", "deny", "cancel"];
      const option = pending.options.find((o) => preferred.includes(o.optionId)) ?? pending.options[0];
      this.reply(pending.requestId, {
        outcome: option && allow ? { outcome: "selected", optionId: option.optionId } : { outcome: "cancelled" },
      });
    }
    return Promise.resolve({ ok: true });
  }

  close(): void {
    this.closedByUser = true;
    if (this.reconnectTimer != null) window.clearTimeout(this.reconnectTimer);
    this.failPending(new Error("transport closed"));
    this.ws?.close();
  }
}

function chunkText(content: AcpContentBlock | AcpContentBlock[] | undefined): string {
  if (!content) return "";
  const blocks = Array.isArray(content) ? content : [content];
  return blocks
    .filter((b) => b.type === "text" && typeof b.text === "string")
    .map((b) => b.text ?? "")
    .join("");
}

function findToolCall(calls: ToolCall[] | undefined, update: AcpSessionUpdate): ToolCall | undefined {
  if (!calls?.length) return undefined;
  // match by title when available, else the most recent open call
  const byTitle = update.title ? [...calls].reverse().find((c) => c.name === update.title) : undefined;
  return byTitle ?? calls[calls.length - 1];
}

function toolUpdateText(update: AcpSessionUpdate): string {
  const content = update.content;
  if (Array.isArray(content)) {
    const texts = content
      .map((block) => (block.type === "content" ? block.content?.text : block.text))
      .filter((t): t is string => typeof t === "string" && t.length > 0);
    if (texts.length) return texts.join("\n");
  }
  const raw = update.rawOutput;
  if (raw && typeof raw.output_for_prompt === "string" && raw.output_for_prompt) {
    return raw.output_for_prompt;
  }
  return "";
}
