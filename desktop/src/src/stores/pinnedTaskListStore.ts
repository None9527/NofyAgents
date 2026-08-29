// A0-S4-3: 自 modules/stores-tasks.tsx §3 原样迁入（E6 PinnedTaskListStore；原文件现为薄 re-export shim）。
import { t as logger } from '../modules/logger'; // 原 J（logger-PFDwl5Yq.js t 导出）
import { resolveWorkspaceKey as workspaceKey } from './taskStore'; // 原 Io
import { getSessionById as getRegisteredSession } from './sessionRegistryStore'; // 原 tc
import { create as createStore } from './zustand'; // 原 Ae（skillStore chunk q 导出）
import type { UseBoundStore } from './storeTypes';
import type { TimelineTask } from './workspaceTaskListStore';

/* ============================================================================
 * 3. PinnedTaskListStore（原 E6，js 142372–142463 / jsx 118266）
 * ----------------------------------------------------------------------------
 * 远端置顶任务列表（按工作区键分桶）。
 * state 字段表：
 *  | 字段 | 类型 | 用途 |
 *  |---|---|---|
 *  | itemsByWorkspaceKey | Record<workspaceKey, PinnedTask[]> | 置顶任务 |
 *  | loadingByWorkspaceKey | Record<workspaceKey, boolean> | 加载态 |
 *  | errorByWorkspaceKey | Record<workspaceKey, string> | 错误 |
 * actions：refreshWorkspace/upsertTask/removeTask/clearWorkspace（4 个）
 * 消费：151805–151806（侧栏置顶段）；D6 会话注册后刷新（142430）。
 * ==========================================================================*/

export interface PinnedTask {
  taskId: string;
  workspacePath: string;
  workspaceIdentity?: string | null;
  createdAt?: number;
  updatedAt?: number;
  [key: string]: unknown;
}

export interface ZCodeTaskService {
  listPinnedTasks(args: { workspacePath: string; workspaceIdentity?: string }): Promise<PinnedTask[]>;
  listTaskList(args: {
    kind: "timeline" | string;
    workspaceScopes: Array<{ workspacePath: string; workspaceIdentity?: string }>;
    sortBy: "created" | "updated" | string;
    limit: number;
  }): Promise<{ items: TimelineTask[]; total: number; hasMore: boolean }>;
  /* 宿主任务操作面（调用面归纳；返回形态未全量重建处按 any 兜底） */
  renameTask(args: Record<string, unknown>): Promise<any>;
  archiveTask(args: Record<string, unknown>): Promise<any>;
  /* A0-CLEANUP4：归档逆操作与删除面（bundle jsx 122398/122435：zcodeTaskService.unarchiveTask/deleteTask） */
  unarchiveTask(args: Record<string, unknown>): Promise<any>;
  deleteTask(args: Record<string, unknown>): Promise<any>;
  setTaskPinned(args: Record<string, unknown>): Promise<any>;
  setTaskUnread(args: Record<string, unknown>): Promise<any>;
  restartWorkspaceProcess(args: Record<string, unknown>): Promise<any>;
  /* 任务分组面（SidebarLeaves 消费面归纳；入参含接口型对象，按 unknown 收口） */
  listGroupedTaskViewStructure(args: unknown): Promise<any>;
  createTaskGroup(args?: unknown): Promise<any>;
  renameTaskGroup(args: unknown): Promise<any>;
  updateTaskGroupColor(args: unknown): Promise<any>;
  deleteTaskGroup(args: unknown): Promise<any>;
  applyGroupedTaskViewOrder(args: unknown): Promise<any>;
  onDynamicWorkspaceEvent(scope: unknown): (cb: (event: any) => void) => { dispose(): void };
  [method: string]: unknown;
}

export interface PinnedTaskListState {
  itemsByWorkspaceKey: Record<string, PinnedTask[]>;
  loadingByWorkspaceKey: Record<string, boolean>;
  errorByWorkspaceKey: Record<string, string>;
  refreshWorkspace(args: { workspacePath: string; workspaceIdentity?: string | null; zcodeTaskService: ZCodeTaskService }): Promise<void>;
  upsertTask(task: PinnedTask): void;
  removeTask(workspacePath: string, taskId: string, workspaceIdentity?: string | null): void;
  clearWorkspace(workspacePath: string, workspaceIdentity?: string | null): void;
}

/** 原 sFt：置顶任务排序（接口级，142400 区） */
declare function sortPinnedTasks(tasks: PinnedTask[]): PinnedTask[];

export const usePinnedTaskListStore: UseBoundStore<PinnedTaskListState> = createStore<PinnedTaskListState>((set) => ({
  itemsByWorkspaceKey: {},
  loadingByWorkspaceKey: {},
  errorByWorkspaceKey: {},
  async refreshWorkspace({ workspacePath, workspaceIdentity, zcodeTaskService }) {
    const key = workspaceKey(workspacePath, workspaceIdentity);
    set((state) => ({
      loadingByWorkspaceKey: { ...state.loadingByWorkspaceKey, [key]: true },
      errorByWorkspaceKey: { ...state.errorByWorkspaceKey, [key]: "" },
    }));
    try {
      const tasks = await zcodeTaskService.listPinnedTasks({ workspacePath, ...(workspaceIdentity ? { workspaceIdentity } : {}) });
      set((state) => ({
        itemsByWorkspaceKey: { ...state.itemsByWorkspaceKey, [key]: sortPinnedTasks(tasks) },
        loadingByWorkspaceKey: { ...state.loadingByWorkspaceKey, [key]: false },
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.warn("[remotePinnedTaskStore] 读取远端 pinned task 失败", { workspacePath, workspaceIdentity, error: message });
      set((state) => ({
        loadingByWorkspaceKey: { ...state.loadingByWorkspaceKey, [key]: false },
        errorByWorkspaceKey: { ...state.errorByWorkspaceKey, [key]: message },
      }));
    }
  },
  upsertTask(task) {
    const key = workspaceKey(task.workspacePath, task.workspaceIdentity);
    set((state) => {
      const existing = state.itemsByWorkspaceKey[key] ?? [];
      const next = existing.some((item) => item.taskId === task.taskId)
        ? existing.map((item) => (item.taskId === task.taskId ? task : item))
        : [...existing, task];
      return { itemsByWorkspaceKey: { ...state.itemsByWorkspaceKey, [key]: sortPinnedTasks(next) } };
    });
  },
  removeTask(workspacePath, taskId, workspaceIdentity) {
    const key = workspaceKey(workspacePath, workspaceIdentity);
    set((state) => ({
      itemsByWorkspaceKey: {
        ...state.itemsByWorkspaceKey,
        [key]: (state.itemsByWorkspaceKey[key] ?? []).filter((item) => item.taskId !== taskId),
      },
    }));
  },
  clearWorkspace(workspacePath, workspaceIdentity) {
    const key = workspaceKey(workspacePath, workspaceIdentity);
    set((state) => {
      const { [key]: _items, ...itemsByWorkspaceKey } = state.itemsByWorkspaceKey;
      const { [key]: _loading, ...loadingByWorkspaceKey } = state.loadingByWorkspaceKey;
      const { [key]: _error, ...errorByWorkspaceKey } = state.errorByWorkspaceKey;
      return { itemsByWorkspaceKey, loadingByWorkspaceKey, errorByWorkspaceKey };
    });
  },
}));

/** 原 D6（142430–142444）：会话注册后按会话服务刷新置顶列表 */
export async function refreshPinnedTasksForSession(args: { sessionId: string; workspacePath: string; workspaceIdentity?: string | null }): Promise<void> {
  const session = getRegisteredSession(args.sessionId);
  if (!session) {
    logger.warn("[remotePinnedTaskStore] 远端 session 尚未注册，跳过 pinned 读取", args);
    return;
  }
  await usePinnedTaskListStore.getState().refreshWorkspace({
    workspacePath: args.workspacePath,
    workspaceIdentity: args.workspaceIdentity,
    zcodeTaskService: session.services.zcodeTaskService as ZCodeTaskService,
  });
}

