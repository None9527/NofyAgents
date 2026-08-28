// 每任务元数据（pin / archive / last-seen），localStorage 持久。
// 清洗自旧 src/lib/taskmeta.ts；v2 独立命名空间，不与旧树共享。
// lastSeen 是 digest（回来摘要）与未读判定的数据源。

export interface TaskMeta {
  pinned?: boolean;
  archived?: boolean;
  lastSeen?: number;
  /** 每任务 autonomy 覆盖（S9 契约） */
  autonomy?: string;
  /** 每任务预算覆盖 */
  budget?: string;
}

// ---- 裁决统计（S9 信任校准的数据源） ----
const APPROVAL_KEY = "grok-build.v2.approvals";

export interface ApprovalStats {
  allowed: number;
  rejected: number;
}

export function getApprovalStats(): ApprovalStats {
  try {
    const raw = JSON.parse(localStorage.getItem(APPROVAL_KEY) ?? "{}") as Partial<ApprovalStats>;
    return { allowed: raw.allowed ?? 0, rejected: raw.rejected ?? 0 };
  } catch {
    return { allowed: 0, rejected: 0 };
  }
}

export function bumpApproval(allow: boolean): ApprovalStats {
  const stats = getApprovalStats();
  const next = allow ? { ...stats, allowed: stats.allowed + 1 } : { ...stats, rejected: stats.rejected + 1 };
  try {
    localStorage.setItem(APPROVAL_KEY, JSON.stringify(next));
  } catch {
    // 非致命
  }
  return next;
}

const KEY = "grok-build.v2.taskmeta";

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
    // 存储满/隐私模式：非致命
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
