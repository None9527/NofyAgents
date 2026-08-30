// A0-S4-3: 自 modules/stores-tasks.tsx §4 原样迁入（k6 WorkspaceTaskListStore；原文件现为薄 re-export shim）。
import { t as logger } from '../modules/logger'; // 原 J（logger-PFDwl5Yq.js t 导出）
import { resolveWorkspaceKey as workspaceKey } from './taskStore'; // 原 Io
import { getSessionById as getRegisteredSession } from './sessionRegistryStore'; // 原 tc
import { create as createStore } from './zustand'; // 原 Ae（skillStore chunk q 导出）
import type { UseBoundStore } from './storeTypes';
import type { ZCodeTaskService } from './pinnedTaskListStore';

/* ============================================================================
 * 4. WorkspaceTaskListStore（原 k6，js 142481–142581 / jsx 118392；A0 期行号
 *    142464 为系统性误标，A1-R8 普查更正）
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
 * 消费：152320–152323（侧栏时间线段）；A6 会话注册后刷新（142572；A0 期行号
 * 142558 同批更正）。
 * A1-R8 普查裁决（canonical）：bundle 唯一 k6（@142481）。树内两并行实例：
 * 本文件与 components/shell/Sidebar.tsx 1004 区（live：152320–152323 侧栏时间线
 * 段消费）。裁决本实例为 canonical（反向成环实证同 E6，见 pinnedTaskListStore
 * 头注）。R9 完成正向收敛：本侧型面按 bundle 真形精化（TimelineTask 富面），
 * Sidebar 本地实例删除改指本实例（证据链见其 tombstone）。
 * ==========================================================================*/

/* A1-R9 正向型缝精化（k6 收敛）：与 PinnedTask 同理——原弱型面与 Sidebar 富
 * TaskMeta 渲染级联（152320–152323 簇）双向不合；按 bundle 真形精化为同形富面
 * （运行期 pinned/timeline 两店条目同为任务元数据，cFt@142466 排序直用
 * createdAt/updatedAt 数值）。详见 stores/pinnedTaskListStore.ts PinnedTask 宽化注。 */
export interface TimelineTask {
  taskId: string;
  workspacePath: string;
  workspaceIdentity?: string | null;
  title: string;
  createdAt: number;
  updatedAt: number;
  status?: string;
  unreadAt?: number | null;
  provider?: string | null; // A1-R10 2e 精化：补 null 支 = canonical 真形
  model?: string | null; // A1-R10 2e 精化：补 null 支 = canonical 真形
  forkedFromTaskId?: string | null;
  pinned?: boolean;
  archived?: boolean;
  cronAutomationId?: string | null;
  automationId?: string | null;
  offPeakTaskId?: string | null;
  pendingInteraction?: {
    interactionId: string;
    kind?: string;
    toolName?: string;
    autoResolution?: { state: string; visibleAt: number; deadlineAt: number; startedAt?: number } | null;
  } | null;
  changeSummary?: { fileCount: number; added: number; removed: number; files: Array<{ path: string; added: number; removed: number; writeCount: number; lastTurnIndex: number; [key: string]: unknown }>; [key: string]: unknown } | null; // A1-R10 2c 精化：canonical 真形（np@6874 strict；helpers TaskChangeSummary 同面）
  __zcodeSessionActivity?: {
    phase: string;
    lastActivityAt: number;
    pendingInteractions?: { permissionCount: number; userInputCount: number }; // A1-R10 2c 精化：去 | null（canonical helpers SessionActivity 面）
    [key: string]: unknown; // A1-R10 2c：canonical SessionActivity 索引签名面
  } | null;
  /* A1-R10 2c 精化：索引签名复原 = canonical TaskMeta 面（Vo 域 mutation/比较器消费面要求） */
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

/** 原 A6（142572；A0 期行号 142558 系统性误标，A1-R9 更正）：会话注册后按会话服务刷新时间线列表 */
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
