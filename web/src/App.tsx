// App orchestrator: owns all state + views; rendering lives in components/*,
// all IO goes through HostClient (mock / ACP / IPC transport).

import { useEffect, useMemo, useState } from "react";
import { HostClient, createTransport } from "./lib/client";
import type { Automation, Provider, Skill, Task, Turn } from "./lib/rpc";
import { I18nContext, translate, type Locale } from "./lib/i18n";
import { Sidebar, type MainView } from "./components/Sidebar";
import { CaptionRight, TopOverlay } from "./components/Titlebar";
import { HomeView } from "./components/HomeView";
import { TaskView } from "./components/TaskView";
import { SettingsView } from "./components/SettingsView";
import { SearchOverlay } from "./components/SearchOverlay";
import { CommandPalette } from "./components/CommandPalette";
import { getTaskMeta, markSeen, setTaskMeta } from "./lib/taskmeta";
import { ListView } from "./components/ListView";
import { AgentDashboard } from "./components/AgentDashboard";

export function App() {
  const client = useMemo(() => new HostClient(createTransport()), []);

  const [settings, setSettings] = useState<Record<string, unknown> | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [workspacePath, setWorkspacePath] = useState<string | null>(null);
  const [selected, setSelected] = useState<Task | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [live, setLive] = useState<{
    text: string;
    thought?: string;
    status: string;
    pending?: { name: string; input: Record<string, unknown> } | null;
    elicitation?: Record<string, unknown> | null;
  } | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [planMode, setPlanMode] = useState(false);
  const [confirmMode, setConfirmMode] = useState(false);
  const [gitStatus, setGitStatus] = useState<{ branch: string | null; changes: number } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [zoom, setZoom] = useState(1);
  const [draft, setDraft] = useState("");
  const [view, setView] = useState<MainView>("home");
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [sidePaneOpen, setSidePaneOpen] = useState(false);
  const [dashOpen, setDashOpen] = useState(false);
  const [dockTabs, setDockTabs] = useState<
    Array<{ id: number; kind: "terminal" | "browser" | "review"; url?: string }>
  >([{ id: 1, kind: "terminal" }]);
  const [dockActive, setDockActive] = useState<number | null>(1);
  const addDockTab = (kind: "terminal" | "browser" | "review") => {
    const id = Date.now();
    setDockTabs((prev) => [...prev, { id, kind }]);
    setDockActive(id);
    setTerminalOpen(true);
  };
  const closeDockTab = (id: number) => {
    setDockTabs((prev) => {
      const next = prev.filter((t) => t.id !== id);
      setDockActive((current) => (current === id ? (next[0]?.id ?? null) : current));
      return next;
    });
  };
  const [searchOpen, setSearchOpen] = useState(false);
  const [selection, setSelection] = useState<{ providerId: string; modelName: string } | null>(null);
  const [commands, setCommands] = useState<Array<{ name: string; description: string }>>([]);
  const [connected, setConnected] = useState(true);
  const [mcpServers, setMcpServers] = useState<
    Array<{ name: string; source?: string; status?: string; tools?: number | null }>
  >([]);
  const [stats, setStats] = useState<{
    usage: { input: number; output: number; reasoning: number };
    summary: string | null;
    contextTokens?: number;
    contextWindow?: number;
    queue?: string[];
  } | null>(null);
  const [effort, setEffort] = useState<string>("high");
  const [locale, setLocale] = useState<Locale>("zh-CN");
  const i18n = useMemo(
    () => ({ locale, tr: (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars) }),
    [locale],
  );
  const tr = i18n.tr;

  // initial data
  useEffect(() => {
    void (async () => {
      const [s, p, a] = await Promise.all([
        client.getSettings(),
        client.getProviders(),
        client.getAutomations(),
      ]);
      setSettings(s as Record<string, unknown>);
      setProviders(p);
      setAutomations(a);
      client.getCommands().then(setCommands);
      client.getMcpServers().then(setMcpServers);
      if (s.locale === "en-US" || s.locale === "zh-CN") setLocale(s.locale);
      const sessions = s.lastWorkspaceSession ?? [];
      const active =
        sessions[Math.min(Math.max(s.lastActiveTabIndex ?? 0, 0), sessions.length - 1)];
      if (active?.kind === "local") setWorkspacePath(active.workspacePath);
    })();
  }, [client]);

  // git status follows the active workspace
  useEffect(() => {
    if (!workspacePath) return;
    client.getGitStatus(workspacePath).then(setGitStatus);
  }, [workspacePath, client]);

  // tasks follow the active workspace
  useEffect(() => {
    if (!workspacePath) return;
    client.getTasks(workspacePath).then((rows) => {
      setTasks(rows);
      setSelection((current) => {
        if (current) return current;
        const ref = rows.find((t) => t.model)?.model;
        if (!ref) return null;
        const [providerId, modelName] = ref.split("/");
        return { providerId, modelName };
      });
      client.getSkills(workspacePath).then(setSkills);
    });
  }, [workspacePath, client]);

  // global shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setSidebarVisible((v) => !v);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        goHome();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setTerminalOpen((v) => !v);
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        setDashOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // transport connectivity banner
  useEffect(() => client.subscribe("status", ({ connected: next }) => setConnected(next)), [client]);

  // real back/forward history stack (source taskNav.back/forward)
  type Nav = { view: MainView; taskId: string | null };
  const [past, setPast] = useState<Nav[]>([]);
  const [future, setFuture] = useState<Nav[]>([]);
  const navNow = (): Nav => ({ view, taskId: selected?.taskId ?? null });
  const applyNav = (n: Nav) => {
    if (n.taskId) {
      const t = tasks.find((x) => x.taskId === n.taskId);
      if (t) {
        openTask(t, true);
        return;
      }
    }
    setSelected(null);
    setView(n.view === "task" ? "home" : n.view);
  };
  const pushNav = () => {
    setPast((p) => [...p, navNow()]);
    setFuture([]);
  };
  const goBack = () => {
    if (past.length === 0) return;
    const last = past[past.length - 1];
    setPast((p) => p.slice(0, -1));
    setFuture((f) => [...f, navNow()]);
    applyNav(last);
  };
  const goForward = () => {
    if (future.length === 0) return;
    const next = future[future.length - 1];
    setFuture((f) => f.slice(0, -1));
    setPast((p) => [...p, navNow()]);
    applyNav(next);
  };
  const goHome = () => {
    pushNav();
    setSelected(null);
    setView("home");
  };

  const openTask = (task: Task, skipHistory = false) => {
    if (!skipHistory) pushNav();
    markSeen(task.taskId);
    setSelected(task);
    setView("task");
    setStats(null);
    void client
      .getConversation(task.taskId)
      .then((conversation) => {
        setTurns(conversation);
        return client.getTaskStats(task.taskId);
      })
      .then(setStats);
  };

  // live-refresh a running task (streaming text) until it settles
  useEffect(() => {
    if (
      !selected ||
      (selected.status !== "running" &&
        selected.status !== "idle" &&
        selected.status !== "awaiting-approval")
    ) {
      setLive(null);
      return;
    }
    const timer = setInterval(async () => {
      const current = await client.getLive(selected.taskId);
      if (current && (current.status === "running" || current.status === "awaiting-approval")) {
        setLive({
          text: current.text,
          thought: current.thought,
          status: current.status,
          pending: current.pending,
          elicitation: current.elicitation ?? null,
        });
        // keep the context meter + message queue fresh while streaming
        client.getTaskStats(selected.taskId).then(setStats);
        return;
      }
      setLive(null);
      const [conversation, list] = await Promise.all([
        client.getConversation(selected.taskId),
        client.getTasks(workspacePath ?? ""),
      ]);
      setTurns(conversation);
      setTasks(list);
      client.getTaskStats(selected.taskId).then(setStats);
      const fresh = list.find((t) => t.taskId === selected.taskId);
      if (fresh && selected.status === "running" && fresh.status === "completed") {
        setToast(tr("taskDone"));
        window.setTimeout(() => setToast(null), 4000);
      }
      if (fresh) setSelected(fresh);
    }, 600);
    return () => clearInterval(timer);
  }, [selected, client, workspacePath, tr]);

  // @/abs/path tokens attach file contents; #title tokens attach the tail of
  // the mentioned session as context.
  const withContext = async (text: string): Promise<string> => {
    const blocks: string[] = [];
    const files = [...text.matchAll(/@(\/[^\s@]+)/g)].map((m) => m[1]);
    for (const path of [...new Set(files)]) {
      const content = await client.readContext(path);
      if (content != null) blocks.push(`文件 ${path} 内容:\n${content}`);
    }
    const mentions = [...text.matchAll(/#([^\s#]+(?:\s[^\s#]+)?)/g)].map((m) => m[1].trim());
    for (const label of [...new Set(mentions)]) {
      const target = tasks.find((t) => t.title === label || t.title.startsWith(label));
      if (!target || target.taskId === selected?.taskId) continue;
      const conversation = await client.getConversation(target.taskId);
      const tail = conversation
        .slice(-2)
        .map((turn) => `${turn.userText ? `问: ${turn.userText}` : ""}${turn.assistantText ? `\n答: ${turn.assistantText.slice(0, 1200)}` : ""}`)
        .join("\n");
      if (tail) blocks.push(`会话「${target.title}」近期内容:\n${tail}`);
    }
    return blocks.length ? `${blocks.join("\n\n")}\n\n${text}` : text;
  };

  const submitDraft = async () => {
    const text = draft.trim();
    if (!text || !workspacePath) return;
    const prompt = await withContext(text);
    const created = await client.createTask({
      workspacePath,
      title: text.slice(0, 40),
      prompt,
      model: selection ? `${selection.providerId}/${selection.modelName}` : null,
      provider: selection?.providerId ?? null,
      mode: planMode ? "plan" : "build",
      confirm: confirmMode,
    });
    setDraft("");
    setTasks((prev) => [created, ...prev]);
    void client.getCommands().then(setCommands);
    openTask(created);
  };

  // source taskList context menu + task header actions share one handler
  const taskAction = (
    task: Task,
    action: "rename" | "pin" | "archive" | "delete" | "markUnread" | "copyPath",
  ) => {
    if (action === "rename") {
      const title = window.prompt(tr("rename"), task.title);
      if (title) {
        void client.updateTask({ taskId: task.taskId, title });
        if (selected?.taskId === task.taskId) setSelected({ ...task, title });
      }
    } else if (action === "pin") {
      setTaskMeta(task.taskId, { pinned: !getTaskMeta(task.taskId).pinned });
      void client.updateTask({ taskId: task.taskId, pinned: true });
    } else if (action === "archive") {
      setTaskMeta(task.taskId, { archived: !getTaskMeta(task.taskId).archived });
      void client.updateTask({ taskId: task.taskId, archived: true });
    } else if (action === "delete") {
      void client.updateTask({ taskId: task.taskId, deleted: true });
      if (selected?.taskId === task.taskId) {
        setSelected(null);
        setView("home");
      }
    } else if (action === "markUnread") {
      setTaskMeta(task.taskId, { lastSeen: 0 });
    } else if (action === "copyPath") {
      void navigator.clipboard?.writeText(`${workspacePath ?? ""}/.tasks/${task.taskId}`);
    }
    setTasks((prev) => [...prev]);
    window.setTimeout(() => {
      client.getTasks(workspacePath ?? "").then(setTasks);
    }, 300);
  };

  const openWorkspace = () => {
    void (async () => {
      const dir = window.grokDesktop ? await window.grokDesktop.selectDirectory() : null;
      if (dir) {
        setWorkspacePath(dir);
      } else {
        setToast("Web 版请通过 ?cwd= 参数切换工作区");
        window.setTimeout(() => setToast(null), 3000);
      }
    })();
  };

  // source canFork: derive a brand-new task from a turn's prompt
  const forkTurn = (text: string) => {
    if (!workspacePath) return;
    void (async () => {
      const created = await client.createTask({
        workspacePath,
        title: `${text.slice(0, 36)} ⑂`,
        prompt: text,
        model: selection ? `${selection.providerId}/${selection.modelName}` : null,
        provider: selection?.providerId ?? null,
        mode: "build",
        confirm: confirmMode,
      });
      setTasks((prev) => [created, ...prev]);
      openTask(created);
    })();
  };

  const workspaceName = workspacePath?.split("/").pop() ?? "";
  const recentProjects = (settings?.recentProjects as string[] | undefined) ?? [];

  return (
    <I18nContext.Provider value={i18n}>
      <div className="shell" data-theme={theme} style={{ zoom }}>
        {sidebarVisible && view !== "settings" && <Sidebar
          tasks={tasks}
          workspaceName={workspaceName}
          onOpenTask={openTask}
          onNewTask={goHome}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenSettings={() => {
          pushNav();
          setView("settings");
          client.getMcpServers().then(setMcpServers);
        }}
          onNavigate={(next) => {
            pushNav();
            setView(next);
            // lists refresh on entry: agent slash commands arrive async
            if (next === "skills" && workspacePath) client.getSkills(workspacePath).then(setSkills);
            if (next === "automations") client.getAutomations().then(setAutomations);
            if (next === "settings") client.getMcpServers().then(setMcpServers);
          }}
          onTaskAction={taskAction}
          onAddProject={openWorkspace}
          onOpenDashboard={() => setDashOpen((v) => !v)}
          workspacePath={workspacePath}
          onToast={(msg) => {
            setToast(msg);
            window.setTimeout(() => setToast(null), 3000);
          }}
        />}
        <main className="main">
          <section className="content-section">
          {view === "home" && !selected && <header className="ws-header home" />}
          {client.backendKind !== "mock" && !connected && (
            <div className="offline-banner">{tr("notConnected")}</div>
          )}
          {view === "home" && !selected && (
            <HomeView
              client={client}
              workspaceName={workspaceName}
              recentProjects={recentProjects}
              onSwitchWorkspace={setWorkspacePath}
              providers={providers}
              selection={selection}
              onSelectModel={(providerId, modelName) => setSelection({ providerId, modelName })}
              draft={draft}
              setDraft={setDraft}
              onSubmit={() => void submitDraft()}
              planMode={planMode}
              setPlanMode={setPlanMode}
              confirmMode={confirmMode}
              setConfirmMode={setConfirmMode}
              gitStatus={gitStatus}
              commands={commands}
              tasks={tasks}
              skills={skills}
              onOpenSettings={() => {
                pushNav();
                setView("settings");
              }}
              onToast={(msg) => {
                setToast(msg);
                window.setTimeout(() => setToast(null), 3000);
              }}
            />
          )}
          {view === "task" && selected && (
            <TaskView
              client={client}
              task={selected}
              turns={turns}
              live={live}
              stats={stats}
              commands={commands}
              workspacePath={workspacePath ?? undefined}
              effort={effort}
              onEffort={(level) => {
                setEffort(level);
                void client.setEffort(selected.taskId, level);
              }}
              tasks={tasks}
              skills={skills}
              onRewind={(turnIndex) => {
                if (!window.confirm(tr("rewindConfirm"))) return;
                void client.rewind(selected.taskId, turnIndex).then((result) => {
                  setToast(
                    result.conflicts?.length
                      ? `${tr("rewindDone")} ⚠ ${result.conflicts.join(", ")}`
                      : `${tr("rewindDone")}（${result.reverted?.length ?? 0}）`,
                  );
                  window.setTimeout(() => setToast(null), 5000);
                  client.getConversation(selected.taskId).then(setTurns);
                  client.getTasks(workspacePath ?? "").then(setTasks);
                });
              }}
              onResolveElicitation={(action, content) =>
                void client.resolveElicitation(selected.taskId, action, content)
              }
              terminalOpen={terminalOpen}
              panelOpen={sidePaneOpen}
              onPanelOpenChange={setSidePaneOpen}
              onHideDock={() => setTerminalOpen(false)}
              dockTabs={dockTabs}
              dockActive={dockActive}
              onDockSelect={setDockActive}
              onDockAdd={addDockTab}
              onDockClose={closeDockTab}
              onBack={() => {
                setSelected(null);
                setView("home");
              }}
              onFollowUp={(text, mode) => {
                void client.chat(selected.taskId, text, mode, confirmMode);
                setSelected({ ...selected, status: "running", mode: mode ?? selected.mode });
              }}
              onRetry={(text) => {
                void client.chat(selected.taskId, text, undefined, confirmMode);
                setSelected({ ...selected, status: "running" });
              }}
              onApproveTool={(allow) => void client.approveTool(selected.taskId, allow)}
              onCancel={() => void client.cancel(selected.taskId)}
              onAction={(action) => taskAction(selected, action)}
              onFork={forkTurn}
              recentProjects={recentProjects}
              onSwitchWorkspace={setWorkspacePath}
              onOpenReview={() => {
                addDockTab("review");
              }}
            />
          )}
          {view === "settings" && (
            <SettingsView
              settings={settings as never}
              providers={providers}
              mcpServers={mcpServers}
              onLocaleChange={(next) => {
                void client.setSettings({ locale: next });
                setSettings((s) => (s ? { ...s, locale: next } : s));
                setLocale(next as Locale);
              }}
              theme={theme}
              onThemeChange={(next) => setTheme(next)}
              zoom={zoom}
              onZoomChange={(next) => setZoom(Math.min(1.4, Math.max(0.8, next)))}
              client={client}
              onMcpChanged={() => client.getMcpServers().then(setMcpServers)}
              onBack={() => setView("home")}
            />
          )}
          {(view === "automations" || view === "skills") && (
            <ListView
              kind={view}
              client={client}
              automations={automations}
              skills={skills}
              onBack={() => setView("home")}
              onToast={(msg) => {
                setToast(msg);
                window.setTimeout(() => setToast(null), 3000);
              }}
            />
          )}
          </section>
        </main>
        {view !== "settings" && (
        <TopOverlay
          sidebarVisible={sidebarVisible}
          onToggleSidebar={() => setSidebarVisible((v) => !v)}
          onNewTask={goHome}
          onBack={goBack}
          onForward={goForward}
          canBack={past.length > 0}
          canForward={future.length > 0}
        />
        )}
        <CaptionRight
          terminalOpen={terminalOpen}
          onToggleTerminal={() => setTerminalOpen((v) => !v)}
          showSidePaneToggle={view === "task" && Boolean(selected)}
          sidePaneOpen={sidePaneOpen}
          onToggleSidePane={() => setSidePaneOpen((v) => !v)}
          onNewTask={goHome}
          cwd={workspacePath ?? undefined}
          onOpenWorkspace={openWorkspace}
          onToast={(msg) => {
            setToast(msg);
            window.setTimeout(() => setToast(null), 3000);
          }}
        />
        <AgentDashboard
          open={dashOpen}
          onClose={() => setDashOpen(false)}
          tasks={tasks}
          backendKind={client.backendKind}
          onOpenTask={(t) => {
            openTask(t);
            setDashOpen(false);
          }}
          onRefresh={() => {
            setTasks((prev) => [...prev]);
            window.setTimeout(() => {
              client.getTasks(workspacePath ?? "").then(setTasks);
            }, 200);
          }}
        />
        {toast && <div className="toast">{toast}</div>}
        {paletteOpen && (
          <CommandPalette
            tasks={tasks}
            currentTaskId={selected?.taskId ?? null}
            onNavigate={(next) => {
              pushNav();
              setView(next);
            }}
            onOpenTask={openTask}
            onNewTask={goHome}
            onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            onSetTheme={(next) => setTheme(next)}
            onToggleSidebar={() => setSidebarVisible((v) => !v)}
            onToggleTerminal={() => setTerminalOpen((v) => !v)}
            onToggleSidePane={() => setSidePaneOpen((v) => !v)}
            onAddDockTab={addDockTab}
            onOpenSearch={() => setSearchOpen(true)}
            onClose={() => setPaletteOpen(false)}
          />
        )}
        {searchOpen && (
          <SearchOverlay
            client={client}
            onClose={() => setSearchOpen(false)}
            onOpenTask={openTask}
            onSwitchWorkspace={setWorkspacePath}
          />
        )}
      </div>
    </I18nContext.Provider>
  );
}
