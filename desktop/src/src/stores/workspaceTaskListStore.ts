// A0-S4-3: 自 modules/stores-tasks.tsx §4 原样迁入（k6 WorkspaceTaskListStore；原文件现为薄 re-export shim）。
import { t as logger } from '../modules/logger'; // 原 J（logger-PFDwl5Yq.js t 导出）
import { resolveWorkspaceKey as workspaceKey } from './taskStore'; // 原 Io
import { getSessionById as getRegisteredSession } from './sessionRegistryStore'; // 原 tc
import { create as createStore } from './zustand'; // 原 Ae（skillStore chunk q 导出）
import type { UseBoundStore } from './storeTypes';
import type { ZCodeTaskService } from './pinnedTaskListStore';

/* ============================================================================
 * 4. WorkspaceTaskListStore（原 k6，js 142464–142556 / jsx 118392）
 * ----------------------------------------------------------------------------
 * 远端时间线任务列表（按工作区键分桶，含总数/hasMore 分页态）。
 * state 字段表：
 *  | 字段 | 类型 | 用途 |
 *  |---|---|---|
 *  | itemsByWorkspaceKey | Record<workspaceKey, TimelineTask[]> | 任务列表 |
 *  | totalByWorkspaceKey | Record<workspaceKey, number> | 总数 |
 *  | hasMoreByWorkspaceKey | Record<workspaceKey, boolean> | 是否还有更多 |
 *  | loadingByWorkspaceKey | Record<workspaceKey, boolean> | 加载态 |
 *  | errorByWorkspaceKey | Record<workspaceKey, string> | 错误 |
 * actions：refreshWorkspace/upsertTask/removeTask/clearWorkspace（4 个）
 * 消费：152320–152323（侧栏时间线段）；A6 会话注册后刷新（142558）。
 * ==========================================================================*/

export interface TimelineTask {
  taskId: string;
  workspacePath: string;
  workspaceIdentity?: string | null;
  createdAt?: number;
  updatedAt?: number;
  [key: string]: unknown;
}

export interface WorkspaceTaskListState {
  itemsByWorkspaceKey: Record<string, TimelineTask[]>;
  totalByWorkspaceKey: Record<string, number>;
  hasMoreByWorkspaceKey: Record<string, boolean>;
  loadingByWorkspaceKey: Record<string, boolean>;
  errorByWorkspaceKey: Record<string, string>;
  refreshWorkspace(args: {
    workspacePath: string;
    workspaceIdentity?: string | null;
    zcodeTaskService: ZCodeTaskService;
    sortBy: "created" | "updated" | string;
    limit: number;
  }): Promise<void>;
  upsertTask(task: TimelineTask, sortBy?: "created" | "updated" | string): void;
  removeTask(workspacePath: string, taskId: string, workspaceIdentity?: string | null): void;
  clearWorkspace(workspacePath: string, workspaceIdentity?: string | null): void;
}

/** 原 cFt（142450–142462）：按 created/updated 双键排序（平手再比另一键，再比 taskId） */
export function sortTimelineTasks(tasks: TimelineTask[], sortBy: "created" | "updated" | string = "updated"): TimelineTask[] {
  return [...tasks].sort((a, b) =>
    sortBy === "created"
      ? (b.createdAt ?? 0) === (a.createdAt ?? 0)
        ? (b.updatedAt ?? 0) === (a.updatedAt ?? 0)
          ? b.taskId.localeCompare(a.taskId)
          : (b.updatedAt ?? 0) - (a.updatedAt ?? 0)
        : (b.createdAt ?? 0) - (a.createdAt ?? 0)
      : (b.updatedAt ?? 0) === (a.updatedAt ?? 0)
        ? (b.createdAt ?? 0) === (a.createdAt ?? 0)
          ? b.taskId.localeCompare(a.taskId)
          : (b.createdAt ?? 0) - (a.createdAt ?? 0)
        : (b.updatedAt ?? 0) - (a.updatedAt ?? 0),
  );
}

export const useWorkspaceTaskListStore: UseBoundStore<WorkspaceTaskListState> = createStore<WorkspaceTaskListState>((set) => ({
  itemsByWorkspaceKey: {},
  totalByWorkspaceKey: {},
  hasMoreByWorkspaceKey: {},
  loadingByWorkspaceKey: {},
  errorByWorkspaceKey: {},
  async refreshWorkspace({ workspacePath, workspaceIdentity, zcodeTaskService, sortBy, limit }) {
    const key = workspaceKey(workspacePath, workspaceIdentity);
    set((state) => ({
      loadingByWorkspaceKey: { ...state.loadingByWorkspaceKey, [key]: true },
      errorByWorkspaceKey: { ...state.errorByWorkspaceKey, [key]: "" },
    }));
    try {
      const result = await zcodeTaskService.listTaskList({
        kind: "timeline",
        workspaceScopes: [{ workspacePath, ...(workspaceIdentity ? { workspaceIdentity } : {}) }],
        sortBy,
        limit,
      });
      set((state) => ({
        itemsByWorkspaceKey: { ...state.itemsByWorkspaceKey, [key]: sortTimelineTasks(result.items, sortBy) },
        totalByWorkspaceKey: { ...state.totalByWorkspaceKey, [key]: result.total },
        hasMoreByWorkspaceKey: { ...state.hasMoreByWorkspaceKey, [key]: result.hasMore },
        loadingByWorkspaceKey: { ...state.loadingByWorkspaceKey, [key]: false },
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.warn("[remoteTimelineTaskStore] 读取远端 timeline task 失败", { workspacePath, workspaceIdentity, error: message });
      set((state) => ({
        loadingByWorkspaceKey: { ...state.loadingByWorkspaceKey, [key]: false },
        errorByWorkspaceKey: { ...state.errorByWorkspaceKey, [key]: message },
      }));
    }
  },
  upsertTask(task, sortBy = "updated") {
    const key = workspaceKey(task.workspacePath, task.workspaceIdentity);
    set((state) => {
      const existing = state.itemsByWorkspaceKey[key] ?? [];
      const next = existing.some((item) => item.taskId === task.taskId)
        ? existing.map((item) => (item.taskId === task.taskId ? task : item))
        : [...existing, task];
      return {
        itemsByWorkspaceKey: { ...state.itemsByWorkspaceKey, [key]: sortTimelineTasks(next, sortBy) },
        totalByWorkspaceKey: { ...state.totalByWorkspaceKey, [key]: Math.max(state.totalByWorkspaceKey[key] ?? 0, next.length) },
      };
    });
  },
  removeTask(workspacePath, taskId, workspaceIdentity) {
    const key = workspaceKey(workspacePath, workspaceIdentity);
    set((state) => ({
      itemsByWorkspaceKey: {
        ...state.itemsByWorkspaceKey,
        [key]: (state.itemsByWorkspaceKey[key] ?? []).filter((item) => item.taskId !== taskId),
      },
      totalByWorkspaceKey: {
        ...state.totalByWorkspaceKey,
        [key]: Math.max(0, (state.totalByWorkspaceKey[key] ?? state.itemsByWorkspaceKey[key]?.length ?? 0) - 1),
      },
    }));
  },
  clearWorkspace(workspacePath, workspaceIdentity) {
    const key = workspaceKey(workspacePath, workspaceIdentity);
    set((state) => {
      const { [key]: _items, ...itemsByWorkspaceKey } = state.itemsByWorkspaceKey;
      const { [key]: _total, ...totalByWorkspaceKey } = state.totalByWorkspaceKey;
      const { [key]: _hasMore, ...hasMoreByWorkspaceKey } = state.hasMoreByWorkspaceKey;
      const { [key]: _loading, ...loadingByWorkspaceKey } = state.loadingByWorkspaceKey;
      const { [key]: _error, ...errorByWorkspaceKey } = state.errorByWorkspaceKey;
      return { itemsByWorkspaceKey, totalByWorkspaceKey, hasMoreByWorkspaceKey, loadingByWorkspaceKey, errorByWorkspaceKey };
    });
  },
}));

/** 原 A6（142558–142581）：会话注册后按会话服务刷新时间线列表 */
export async function refreshTimelineTasksForSession(args: {
  sessionId: string;
  workspacePath: string;
  workspaceIdentity?: string | null;
  sortBy?: "created" | "updated" | string;
  limit?: number;
}): Promise<void> {
  const session = getRegisteredSession(args.sessionId);
  if (!session) {
    logger.warn("[remoteTimelineTaskStore] 远端 session 尚未注册，跳过 timeline 读取", args);
    return;
  }
  await useWorkspaceTaskListStore.getState().refreshWorkspace({
    workspacePath: args.workspacePath,
    workspaceIdentity: args.workspaceIdentity,
    zcodeTaskService: session.services.zcodeTaskService as ZCodeTaskService,
    sortBy: args.sortBy ?? "updated",
    limit: args.limit ?? 10,
  });
}
