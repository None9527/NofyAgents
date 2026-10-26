import type { AppState, Block, SessionState } from "../../core/store/state.ts";
export type ShellSession = Pick<SessionState, "id" | "cwd" | "title" | "kind" | "agentState" | "modelOptions" | "modelId" | "mode" | "turnUsage" | "availableCommands">;
export type ShellState = Pick<AppState, "connection" | "activeSessionId" | "roster" | "settings" | "mcpServers"> & { sessions: Record<string, ShellSession> };
const fields = ["id", "cwd", "title", "kind", "agentState", "modelOptions", "modelId", "mode", "turnUsage", "availableCommands"] as const;
const same = <T extends object>(a: T, b: T) => Object.keys(b).length === Object.keys(a).length && (Object.keys(b) as (keyof T)[]).every(key => a[key] === b[key]);
/** No message text, counters, queues or approvals can invalidate window composition. */
export function createShellSelector() {
  let previous: ShellState | undefined;
  let sourceSessions: AppState["sessions"] | undefined;
  let sessions: ShellState["sessions"] = {};
  return (state: AppState): ShellState => {
    if (sourceSessions !== state.sessions) {
      const next: ShellState["sessions"] = {};
      for (const session of Object.values(state.sessions)) {
        const summary = Object.fromEntries(fields.map(key => [key, session[key]])) as ShellSession;
        const old = sessions[session.id];
        next[session.id] = old && same(old, summary) ? old : summary;
      }
      if (!same(sessions, next)) sessions = next;
      sourceSessions = state.sessions;
    }
    const next = { connection: state.connection, activeSessionId: state.activeSessionId, roster: state.roster, settings: state.settings, mcpServers: state.mcpServers, sessions };
    if (!previous || !same(previous, next)) previous = next;
    return previous;
  };
}
export function createApprovalSelector() {
  let previous: { items: AppState["pendingInteractions"]; epoch: number } | undefined;
  return (state: AppState) => {
    const items = state.pendingInteractions.filter(item => state.activeSessionId === null || item.sessionId === null || item.sessionId === state.activeSessionId);
    if (!previous || previous.epoch !== state.connection.transportEpoch || items.length !== previous.items.length || items.some((item, i) => item !== previous!.items[i])) previous = { items, epoch: state.connection.transportEpoch };
    return previous;
  };
}
export function createQueueSelector() {
  let previous: { id: string | null; entries: SessionState["queueEntries"]; ready: boolean } | undefined;
  const empty: SessionState["queueEntries"] = [];
  return (state: AppState) => {
    const next = { id: state.activeSessionId, entries: state.activeSessionId ? state.sessions[state.activeSessionId]?.queueEntries ?? empty : empty, ready: state.connection.status === "ready" };
    if (!previous || !same(previous, next)) previous = next;
    return previous;
  };
}
export function createAgentSourcesSelector(accept: (block: Block) => boolean) {
  let source: SessionState | null = null;
  let previous: Pick<SessionState, "blocks" | "subagentFinished"> | null = null;
  return (state: AppState) => {
    const session = state.activeSessionId ? state.sessions[state.activeSessionId] ?? null : null;
    if (!session) { source = null; previous = null; return null; }
    if (source?.id !== session.id || source.blocks !== session.blocks || source.subagentFinished !== session.subagentFinished) {
      const blocks = session.blocks.filter(accept);
      if (!previous || source?.id !== session.id || previous.subagentFinished !== session.subagentFinished || blocks.length !== previous.blocks.length || blocks.some((block,i) => block !== previous!.blocks[i])) previous = { blocks, subagentFinished: session.subagentFinished };
    }
    source = session;
    return previous;
  };
}
export function createDiagnosticsSelector() {
  let previous: Pick<AppState, "connection" | "activeSessionId" | "appliedEvents" | "unhandled"> & { active: Pick<SessionState, "turnUsage" | "stopReason"> | null } | undefined;
  let active: Pick<SessionState, "turnUsage" | "stopReason"> | null = null;
  return (state: AppState) => {
    const session = state.activeSessionId ? state.sessions[state.activeSessionId] : null;
    const nextActive = session ? { turnUsage: session.turnUsage, stopReason: session.stopReason } : null;
    if (nextActive === null || active === null || !same(active, nextActive)) active = nextActive;
    const next = { connection: state.connection, activeSessionId: state.activeSessionId, appliedEvents: state.appliedEvents, unhandled: state.unhandled, active };
    if (!previous || !same(previous, next)) previous = next;
    return previous;
  };
}
export type NavigationSession = { key: string; sessionId: string; title: string | null; activity: string | null; loaded: boolean; active: boolean; cwd: string | null; at: number | null };
/** Sidebar and command palette share one cached navigation model, without session content. */
export function createKnownSessionsSelector() {
  let previous: NavigationSession[] = [];
  return (state: ShellState): NavigationSession[] => {
    const next: NavigationSession[] = [];
    for (const session of Object.values(state.sessions)) {
      const roster = state.roster[session.id];
      next.push({ key: session.id, sessionId: session.id, title: session.title ?? roster?.title ?? null, activity: roster?.activity ?? null, loaded: true, active: session.id === state.activeSessionId, cwd: session.cwd ?? roster?.cwd ?? null, at: roster?.lastChangeUnixMs ?? null });
    }
    for (const roster of Object.values(state.roster)) {
      if (!state.sessions[roster.sessionId]) next.push({ key: "roster:" + roster.sessionId, sessionId: roster.sessionId, title: roster.title, activity: roster.activity, loaded: false, active: false, cwd: roster.cwd, at: roster.lastChangeUnixMs });
    }
    if (previous.length !== next.length || next.some((row,i) => !previous[i] || !same(previous[i]!,row))) previous = next;
    return previous;
  };
}
