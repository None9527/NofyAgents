// Client-side per-task metadata overlay (pin / archive / last-seen) kept in
// localStorage until the backend grows first-class support.

export interface TaskMeta {
  pinned?: boolean;
  archived?: boolean;
  lastSeen?: number;
}

const KEY = "grok-build.taskmeta.v1";

function load(): Record<string, TaskMeta> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}") as Record<string, TaskMeta>;
  } catch {
    return {};
  }
}

function save(all: Record<string, TaskMeta>): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // storage full / private mode: non-fatal
  }
}

export function getTaskMeta(taskId: string): TaskMeta {
  return load()[taskId] ?? {};
}

export function setTaskMeta(taskId: string, patch: TaskMeta): TaskMeta {
  const all = load();
  const next = { ...all[taskId], ...patch };
  all[taskId] = next;
  save(all);
  return next;
}

export function markSeen(taskId: string): void {
  setTaskMeta(taskId, { lastSeen: Date.now() });
}
