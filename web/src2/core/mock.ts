// In-memory mock backend: full method surface of the reference client so the
// UI is completely usable in a plain browser without the Rust agent.

import { BaseTransport } from "./transport";
import type { Automation, Provider, Settings, Skill, Task, ToolCall, Turn } from "./types";

interface LiveState {
  text: string;
  toolCalls: ToolCall[];
  status: "running" | "completed" | "error" | "awaiting-approval";
  pending: { name: string; input: Record<string, unknown> } | null;
  queue: string[];
  elicitation: Record<string, unknown> | null;
}

const SCRIPT_LINES = [
  "## 分析结果",
  "",
  "我已经查看了项目结构，**核心模块**如下：",
  "",
  "```",
  "crates/",
  "  codegen/nofy-pager      # TUI 主循环",
  "  codegen/nofy-shell      # serve / agent 服务器",
  "```",
  "",
  "下一步建议先跑通 `cargo test -p nofy-shell`，再对接前端传输层。",
];

export class MockTransport extends BaseTransport {
  readonly kind = "mock" as const;

  private settings: Settings = {
    locale: "zh-CN",
    recentProjects: ["/home/none/grok-build", "/tmp/demo-project"],
    lastWorkspaceSession: [{ kind: "local", workspacePath: "/home/none/grok-build" }],
    lastActiveTabIndex: 0,
  };
  private providers: Provider[] = [
    { id: "xai", name: "xAI", models: ["grok-4", "grok-4-fast", "grok-code"] },
    { id: "local", name: "本地", models: ["qwen-coder-30b", "glm-5.2"] },
  ];
  private tasks: Task[] = [];
  private conversations = new Map<string, Turn[]>();
  private lives = new Map<string, LiveState>();
  private timers = new Map<string, number>();
  private seq = 0;

  private automations: Automation[] = [
    { id: "a1", name: "每周 Git 站会摘要", enabled: true, schedule: "0 17 * * 5" },
    { id: "a2", name: "CI 失败日报", enabled: false, schedule: "0 9 * * 1-5" },
  ];
  private skills: Skill[] = [
    { name: "code-review", description: "审查当前分支的差异并给出修改建议，覆盖安全与性能。", source: "builtin" },
    { name: "refactor", description: "安全地重命名、拆分、移动代码，带影响面分析。", source: "builtin" },
    { name: "debug", description: "从报错信息定位根因，给出最小修复方案。", source: "plugin" },
  ];

  constructor() {
    super();
    // 模拟后端即时就绪：发出连通事件驱动水合（旧树漏发，v2 修正）
    window.setTimeout(() => this.emitRaw("status", { connected: true }), 50);
    const demo: Task = {
      taskId: "mock-demo",
      title: "欢迎使用 Grok Build",
      model: "xai/grok-4",
      provider: "xai",
      updatedAt: Date.now() - 3600_000,
      status: "completed",
      mode: "build",
    };
    this.tasks.push(demo);
    this.conversations.set(demo.taskId, [
      {
        userText: "这是一个演示会话，展示工具调用与 Markdown 渲染。",
        assistantText:
          "**Mock 后端已就绪。**\n\n发送任意消息即可看到模拟的流式回复；开启“变更前确认”会演示工具审批流程。",
        startedAt: new Date(Date.now() - 3600_000).toISOString(),
        toolCalls: [
          { name: "bash", input: { command: "ls crates" }, output: "build  codegen  common" },
          { name: "read_file", input: { path: "docs/00-overview.md" }, output: "# Grok Build — 项目总览 …" },
        ],
      },
    ]);
  }

  request<T>(method: string, params?: unknown): Promise<T> {
    try {
      return Promise.resolve(this.dispatch(method, (params ?? {}) as Record<string, never>) as T);
    } catch (error) {
      return Promise.reject(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private dispatch(method: string, p: Record<string, string | boolean | number | null>): unknown {
    switch (method) {
      case "getSettings":
        return { ...this.settings };
      case "setSettings":
        this.settings = { ...this.settings, ...(p as Partial<Settings>) };
        return { ok: true };
      case "getProviders":
        return this.providers;
      case "getTasks":
        return this.tasks.filter((t) => !t.status?.startsWith("deleted")).map((t) => ({ ...t }));
      case "getConversation":
        return [...(this.conversations.get(String(p.taskId)) ?? [])];
      case "search": {
        const q = String(p.query ?? "").toLowerCase();
        return {
          tasks: this.tasks.filter((t) => t.title.toLowerCase().includes(q)),
          workspaces: (this.settings.recentProjects ?? []).filter((w) => w.toLowerCase().includes(q)),
        };
      }
      case "getAutomations":
        return this.automations.map((a) => ({ ...a }));
      case "toggleAutomation": {
        const automation = this.automations.find((a) => a.id === String(p.id));
        if (automation) automation.enabled = Boolean(p.enabled);
        return { ok: true };
      }
      case "getSkills":
        return this.skills.map((s) => ({ ...s }));
      case "createTask": {
        const task: Task = {
          taskId: `mock-${++this.seq}`,
          title: String(p.title ?? "新任务"),
          model: p.model ? String(p.model) : null,
          provider: p.provider ? String(p.provider) : null,
          updatedAt: Date.now(),
          status: "running",
          mode: String(p.mode ?? "build"),
        };
        this.tasks.unshift(task);
        this.conversations.set(task.taskId, []);
        this.startStream(task, String(p.prompt ?? ""), Boolean(p.confirm));
        return { ...task };
      }
      case "chat": {
        const task = this.task(String(p.taskId));
        const existing = this.lives.get(task.taskId);
        if (existing && existing.status === "running") {
          existing.queue.push(String(p.text ?? ""));
          return { ok: true };
        }
        task.status = "running";
        task.updatedAt = Date.now();
        if (p.mode) task.mode = String(p.mode);
        this.startStream(task, String(p.text ?? ""), Boolean(p.confirm));
        return { ok: true };
      }
      case "cancel": {
        const task = this.task(String(p.taskId));
        const timer = this.timers.get(task.taskId);
        if (timer != null) window.clearInterval(timer);
        this.timers.delete(task.taskId);
        const live = this.lives.get(task.taskId);
        if (live) this.finish(task, live, "（已取消）");
        return { ok: true };
      }
      case "getCommands":
        return [
          { name: "compact", description: "压缩会话历史，节省上下文窗口" },
          { name: "help", description: "查看可用命令" },
          { name: "review", description: "审查当前分支差异" },
        ];
      case "getMcpServers":
        return [{ name: "gitnexus", source: "local", status: "ready", tools: 11 }];
      case "getTaskStats": {
        const live = this.lives.get(String(p.taskId));
        const turns = this.conversations.get(String(p.taskId)) ?? [];
        const chars = turns.reduce((n, t) => n + (t.assistantText?.length ?? 0), 0);
        return {
          usage: { input: 4000 + chars, output: chars, reasoning: 120 },
          summary: null,
          contextTokens: 8000 + chars,
          contextWindow: 200000,
          queue: live?.queue ?? [],
        };
      }
      case "setEffort":
        return { ok: true };
      case "getRewindPoints": {
        const turns = this.conversations.get(String(p.taskId)) ?? [];
        return {
          points: turns
            .filter((t) => t.userText)
            .map((t, i) => ({
              prompt_index: i,
              created_at: t.startedAt,
              num_file_snapshots: i > 0 ? 3 : 0,
              has_file_changes: i > 0,
              prompt_preview: t.userText ?? "",
            })),
        };
      }
      case "rewind": {
        const taskId = String(p.taskId);
        const turns = this.conversations.get(taskId) ?? [];
        const idx = Number(p.targetPromptIndex ?? 0);
        this.conversations.set(taskId, turns.slice(0, Math.max(1, idx)));
        const task = this.task(taskId);
        task.status = "completed";
        return { ok: true, reverted: ["web/src/demo.ts"], conflicts: [] };
      }
      case "resolveElicitation": {
        const live = this.lives.get(String(p.taskId));
        if (live) live.elicitation = null;
        return { ok: true };
      }
      case "approveTool": {
        const task = this.task(String(p.taskId));
        const live = this.lives.get(task.taskId);
        if (!live) return { ok: true };
        if (p.allow) {
          live.toolCalls.push({
            name: live.pending?.name ?? "bash",
            input: live.pending?.input ?? {},
            output: "exit 0",
          });
          live.pending = null;
          live.status = "running";
          task.status = "running";
          (live as unknown as { confirm: boolean }).confirm = false; // ask once
          this.resumeStream(task);
        } else {
          live.pending = null;
          this.finish(task, live, "已拒绝工具调用，任务终止。");
        }
        return { ok: true };
      }
      case "updateTask": {
        const task = this.task(String(p.taskId));
        if (typeof p.title === "string") task.title = p.title;
        if (p.deleted) {
          this.tasks = this.tasks.filter((t) => t.taskId !== task.taskId);
        } else {
          if (p.archived) task.status = "archived";
          task.updatedAt = Date.now();
        }
        return { ok: true };
      }
      case "exec":
        return { output: this.exec(String(p.command ?? ""), String(p.cwd ?? "/")) };
      case "getGitStatus":
        return { branch: "二次开发分支", changes: 5 };
      case "readContext": {
        const path = String(p.path ?? "");
        return `// mock content of ${path}\nexport const sample = true;`;
      }
      case "getPairingInfo":
        return { token: "mock-8f3a21c7", port: 9800 };
      case "getLive": {
        const live = this.lives.get(String(p.taskId));
        return live ? { ...live, toolCalls: [...live.toolCalls] } : null;
      }
      default:
        throw new Error(`mock: unknown method ${method}`);
    }
  }

  private task(taskId: string): Task {
    const found = this.tasks.find((t) => t.taskId === taskId);
    if (!found) throw new Error(`no such task: ${taskId}`);
    return found;
  }

  // ------------------------------------------------------- streaming engine

  private startStream(task: Task, userText: string, confirm: boolean): void {
    const turns = this.conversations.get(task.taskId) ?? [];
    turns.push({ userText, assistantText: null, startedAt: new Date().toISOString() });
    this.conversations.set(task.taskId, turns);
    const live: LiveState = {
      text: "",
      toolCalls: [],
      status: "running",
      pending: null,
      queue: [],
      elicitation: null,
    };
    this.lives.set(task.taskId, live);
    (live as unknown as { confirm: boolean }).confirm = confirm;
    this.resumeStream(task);
  }

  private resumeStream(task: Task): void {
    const previous = this.timers.get(task.taskId);
    if (previous != null) window.clearInterval(previous);
    const live = this.lives.get(task.taskId) as
      | (LiveState & { confirm?: boolean; step?: number })
      | undefined;
    if (!live) return;
    const confirm = Boolean(live.confirm);

    let step = live.step ?? 0;
    const timer = window.setInterval(() => {
      // Pause for approval midway when confirm mode is on.
      if (confirm && step === 6 && !live.pending) {
        live.status = "awaiting-approval";
        live.pending = { name: "bash", input: { command: "cargo test -p nofy-shell" } };
        task.status = "awaiting-approval";
        live.step = step;
        window.clearInterval(timer);
        this.timers.delete(task.taskId);
        return;
      }
      // Pause while an elicitation dialog awaits answers.
      if (live.elicitation) return;
      if (step === 2 && live.toolCalls.length === 0) {
        live.toolCalls.push({
          name: "todo_write",
          input: {
            todos: [
              { id: "1", content: "分析项目结构", status: "completed" },
              { id: "2", content: "输出模块报告", status: "in_progress" },
            ],
          },
          output: "ok",
        });
      }
      if (step === 5 && live.toolCalls.length === 1) {
        live.toolCalls.push({
          name: "write",
          input: { path: "web/src/demo-report.md" },
          output: "written",
        });
      }
      const turnsNow = this.conversations.get(task.taskId) ?? [];
      const currentPrompt = turnsNow[turnsNow.length - 1]?.userText ?? task.title;
      const ext = live as LiveState & { askedElicitation?: boolean };
      if (step === 3 && !ext.askedElicitation && currentPrompt.includes("问卷")) {
        ext.askedElicitation = true;
        live.elicitation = {
          message: "请选择本次执行的偏好设置",
          requestedSchema: {
            type: "object",
            properties: {
              mode: { type: "string", title: "执行模式", enum: ["fast", "safe", "thorough"] },
              retries: { type: "integer", title: "重试次数" },
              notify: { type: "boolean", title: "完成后提醒" },
            },
            required: ["mode"],
          },
        };
        return;
      }
      if (step < SCRIPT_LINES.length) {
        live.text += (step > 0 ? "\n" : "") + SCRIPT_LINES[step];
        step += 1;
        live.step = step;
        return;
      }
      window.clearInterval(timer);
      this.timers.delete(task.taskId);
      this.finish(task, live, "");
    }, 160);
    this.timers.set(task.taskId, timer);
  }

  private finish(task: Task, live: LiveState, extra: string): void {
    const turns = this.conversations.get(task.taskId) ?? [];
    const last = turns[turns.length - 1];
    if (last) {
      last.assistantText = live.text + (extra ? `\n\n${extra}` : "");
      last.toolCalls = live.toolCalls.length ? [...live.toolCalls] : undefined;
    }
    // drain queued follow-ups
    if (live.queue.length > 0) {
      const next = live.queue.shift()!;
      turns.push({ userText: next, assistantText: null, startedAt: new Date().toISOString() });
      live.text = "";
      live.toolCalls = [];
      live.status = "running";
      task.status = "running";
      (live as unknown as { step?: number }).step = 0; // restart the script for the queued turn
      this.resumeStream(task);
      return;
    }
    task.status = "completed";
    task.updatedAt = Date.now();
    this.lives.delete(task.taskId);
  }

  // ------------------------------------------------------------- fake shell

  private exec(command: string, cwd: string): string {
    const [cmd, ...args] = command.trim().split(/\s+/);
    switch (cmd) {
      case "":
        return "";
      case "echo":
        return args.join(" ");
      case "pwd":
        return cwd;
      case "whoami":
        return "none";
      case "date":
        return new Date().toString();
      case "ls":
        return "Cargo.toml  crates/  docs/  web/  ref-ui/  README.md";
      case "git":
        return args[0] === "status" ? "On branch 二次开发分支\nChanges not staged: 5 files" : "(mock) git " + args.join(" ");
      case "help":
        return "mock shell: echo pwd whoami date ls git help";
      default:
        return `(mock) ${cmd}: command simulated — 真实执行需接入 grok serve 后端`;
    }
  }

  close(): void {
    for (const timer of this.timers.values()) window.clearInterval(timer);
    this.timers.clear();
  }
}
