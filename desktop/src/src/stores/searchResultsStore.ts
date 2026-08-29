// A0-S4-3: 自 modules/stores-session.tsx §2 原样迁入（Vo SearchResultsStore；原文件现为薄 re-export shim）。
import { freezeQueryResult, mergeIncomingTaskKeys, taskEntityKey } from './searchResultsHelpers';
import { mergeTaskMetaEntry as mergeTaskMeta, isQueryResultEquivalent as isQueryResultEqual, descriptorContainsTask as matchesDescriptor, sortTaskKeysByDescriptor as sortTaskKeys, pickBestTaskMetadata as pickPreferredMeta, mergeMetaPreservingActivity as mergeMeta, sessionActivityOf as isNewerMeta, broadcastSessionActivity as broadcastTaskListEvent } from './searchResultsHelpers'; // 原 Jie | 原 Yie | 原 Kie | 原 Bo | 原 pe | 原 Po | 原 Mo | 原 Hie
import type { SearchDescriptor, QueryResult, QueryResultInput, TaskMeta } from './searchResultsHelpers';
import { resolveWorkspaceKey as workspaceKey } from './taskStore'; // 原 Io=U
import { create as createStore } from './zustand'; // 原 Ae（skillStore chunk q 导出）
import type { UseBoundStore } from './storeTypes';

/* ============================================================================
 * 2. SearchResultsStore（原 Vo，js 1553–1878 / jsx 569）
 * ----------------------------------------------------------------------------
 * 任务搜索结果缓存：按查询键缓存结果 + 任务元数据归一 + 未读覆盖层。
 * state 字段表：
 *  | 字段 | 类型 | 用途 |
 *  |---|---|---|
 *  | resultsByQueryKey | Record<queryKey, QueryResult> | 每个查询的结果（描述符/任务键序/总数/分片态/失效版本） |
 *  | taskMetaByEntityKey | Record<entityKey, TaskMeta> | 任务元数据归一表（跨查询共享） |
 *  | taskUnreadOverlayByEntityKey | Record<entityKey, number \| null> | 未读时间覆盖层（乐观更新用） |
 * actions（12）：setQueryResult/setQueryResults/upsertTaskMeta/
 *   updateTaskMetaPreservingMembership/applyTaskMutation/setTaskUnreadOverlay/
 *   reconcileTaskUnread/rollbackTaskUnread/removeTask/markWorkspaceKeysStale/
 *   invalidateWorkspaceKeys/clearAll
 * 内部纯函数（行号登记，体量大，接口级）：Xie 任务键合并去重(1490 区)、Jie 元数据合并、
 *   Yie 结果等价判断、Uie 结果冻结、Kie 描述符成员判定、Bo 按描述符排序、pe 元数据择优、
 *   Po 元数据合并、Mo 是否新元数据、Hie 任务列表事件广播（归档/删除）。
 * ==========================================================================*/

/* SearchDescriptor/QueryResult/TaskMeta 已收敛至 StoresDeep 规范型（文件头 import + re-export） */

export interface SearchResultsState {
  resultsByQueryKey: Record<string, QueryResult>;
  taskMetaByEntityKey: Record<string, TaskMeta>;
  taskUnreadOverlayByEntityKey: Record<string, number | null>;
  setQueryResult(payload: {
    queryKey: string;
    descriptor: SearchDescriptor;
    items: TaskMeta[];
    total: number;
    hasMore: boolean;
    unreadTaskKeys?: string[];
    partial?: boolean;
    loadingShardKeys?: string[];
    failedShardKeys?: string[];
  }): void;
  setQueryResults(payloads: Array<{
    queryKey: string;
    descriptor: SearchDescriptor;
    items: TaskMeta[];
    total: number;
    hasMore: boolean;
    unreadTaskKeys?: string[];
    partial?: boolean;
    loadingShardKeys?: string[];
    failedShardKeys?: string[];
    expectedInvalidationVersion?: number;
  }>): void;
  upsertTaskMeta(task: TaskMeta): void;
  updateTaskMetaPreservingMembership(task: TaskMeta): void;
  applyTaskMutation(mutation: {
    previousTask: TaskMeta;
    nextTask: TaskMeta;
    previousState: TaskMeta;
    nextState: TaskMeta;
  }): void;
  setTaskUnreadOverlay(task: TaskMeta, unreadAt: number | null | undefined): void;
  reconcileTaskUnread(task: TaskMeta, unreadAt: number | null | undefined): void;
  rollbackTaskUnread(task: TaskMeta, unreadAt: number | undefined): void;
  removeTask(task: TaskMeta): boolean;
  markWorkspaceKeysStale(keys: string[]): void;
  invalidateWorkspaceKeys(keys: string[]): void;
  clearAll(): void;
}

/* --- 内部纯函数已接线 StoresDeep（isQueryResultEquivalent/descriptorContainsTask/
   sortTaskKeysByDescriptor/pickBestTaskMetadata/mergeMetaPreservingActivity/
   sessionActivityOf/broadcastSessionActivity；别名见文件头 import） --- */

export const useSearchResultsStore: UseBoundStore<SearchResultsState> = createStore<SearchResultsState>((set) => ({
  resultsByQueryKey: {},
  taskMetaByEntityKey: {},
  taskUnreadOverlayByEntityKey: {},
  setQueryResult: ({ queryKey, descriptor, items, total, hasMore, unreadTaskKeys, partial, loadingShardKeys, failedShardKeys }) =>
    set((state) => {
      let taskMetaByEntityKey = { ...state.taskMetaByEntityKey };
      let metaChanged = false;
      let unreadOverlayChanged = false;
      const unreadOverlay = { ...state.taskUnreadOverlayByEntityKey };
      const snippets: Record<string, string> = {};
      const snippetLists: Record<string, string[]> = {};
      const { taskKeys, preservedCount } = mergeIncomingTaskKeys({
        incomingTaskKeys: items.map((item) => {
          const entityKey = taskEntityKey(item);
          const snippet = (item as TaskMeta & { searchSnippet?: string }).searchSnippet;
          const snippetList = (item as TaskMeta & { searchSnippets?: string[] }).searchSnippets;
          if (snippet) snippets[entityKey] = snippet;
          if (snippetList?.length) snippetLists[entityKey] = snippetList;
          const existing = taskMetaByEntityKey[entityKey];
          const hasUnreadOverlay = Object.prototype.hasOwnProperty.call(state.taskUnreadOverlayByEntityKey, entityKey);
          const unreadAtOverlay = state.taskUnreadOverlayByEntityKey[entityKey];
          const merged = mergeTaskMeta({ item, existingItem: existing, descriptor, hasUnreadOverlay, unreadAtOverlay });
          if (hasUnreadOverlay && (unreadAtOverlay === null ? typeof item.unreadAt !== "number" : item.unreadAt === unreadAtOverlay)) {
            delete unreadOverlay[entityKey];
            unreadOverlayChanged = true;
          }
          if (merged !== existing) {
            metaChanged = true;
            taskMetaByEntityKey[entityKey] = merged;
          }
          return entityKey;
        }),
        previousResult: state.resultsByQueryKey[queryKey],
        taskMetaByEntityKey,
        descriptor,
      });
      const result: QueryResultInput = {
        descriptor,
        taskKeys,
        unreadTaskKeys,
        searchSnippetsByTaskKey: Object.keys(snippets).length > 0 ? snippets : undefined,
        searchSnippetListsByTaskKey: Object.keys(snippetLists).length > 0 ? snippetLists : undefined,
        total: preservedCount > 0 ? Math.max(total, state.resultsByQueryKey[queryKey]?.total ?? 0, taskKeys.length) : total,
        hasMore: hasMore || (preservedCount > 0 && Math.max(total, state.resultsByQueryKey[queryKey]?.total ?? 0, taskKeys.length) > taskKeys.length),
        partial,
        loadingShardKeys,
        failedShardKeys,
        invalidationVersion: state.resultsByQueryKey[queryKey]?.invalidationVersion ?? 0,
      };
      if (
        !metaChanged &&
        !unreadOverlayChanged &&
        isQueryResultEqual({
          previousResult: state.resultsByQueryKey[queryKey],
          taskKeys,
          unreadTaskKeys: result.unreadTaskKeys,
          searchSnippetsByTaskKey: result.searchSnippetsByTaskKey,
          searchSnippetListsByTaskKey: result.searchSnippetListsByTaskKey,
          total: result.total,
          hasMore: result.hasMore,
          partial: partial ?? false,
          loadingShardKeys: loadingShardKeys ?? [],
          failedShardKeys: failedShardKeys ?? [],
        })
      )
        return state;
      return {
        resultsByQueryKey: { ...state.resultsByQueryKey, [queryKey]: freezeQueryResult(result) },
        taskMetaByEntityKey: metaChanged ? taskMetaByEntityKey : state.taskMetaByEntityKey,
        taskUnreadOverlayByEntityKey: unreadOverlayChanged ? unreadOverlay : state.taskUnreadOverlayByEntityKey,
      };
    }),
  setQueryResults: (payloads) =>
    set((state) => {
      if (payloads.length === 0) return state;
      let taskMetaByEntityKey = { ...state.taskMetaByEntityKey };
      let metaChanged = false;
      let unreadOverlayChanged = false;
      const unreadOverlay = { ...state.taskUnreadOverlayByEntityKey };
      const resultsByQueryKey = { ...state.resultsByQueryKey };
      let resultsChanged = false;
      for (const payload of payloads) {
        const previous = state.resultsByQueryKey[payload.queryKey];
        const invalidationVersion = previous?.invalidationVersion ?? 0;
        if (payload.expectedInvalidationVersion !== undefined && payload.expectedInvalidationVersion !== invalidationVersion) continue;
        const snippets: Record<string, string> = {};
        const snippetLists: Record<string, string[]> = {};
        const { taskKeys, preservedCount } = mergeIncomingTaskKeys({
          incomingTaskKeys: payload.items.map((item) => {
            const entityKey = taskEntityKey(item);
            const snippet = (item as TaskMeta & { searchSnippet?: string }).searchSnippet;
            const snippetList = (item as TaskMeta & { searchSnippets?: string[] }).searchSnippets;
            if (snippet) snippets[entityKey] = snippet;
            if (snippetList?.length) snippetLists[entityKey] = snippetList;
            const existing = taskMetaByEntityKey[entityKey];
            const hasUnreadOverlay = Object.prototype.hasOwnProperty.call(state.taskUnreadOverlayByEntityKey, entityKey);
            const unreadAtOverlay = state.taskUnreadOverlayByEntityKey[entityKey];
            const merged = mergeTaskMeta({ item, existingItem: existing, descriptor: payload.descriptor, hasUnreadOverlay, unreadAtOverlay });
            if (hasUnreadOverlay && (unreadAtOverlay === null ? typeof item.unreadAt !== "number" : item.unreadAt === unreadAtOverlay)) {
              delete unreadOverlay[entityKey];
              unreadOverlayChanged = true;
            }
            if (merged !== existing) {
              metaChanged = true;
              taskMetaByEntityKey[entityKey] = merged;
            }
            return entityKey;
          }),
          previousResult: previous,
          taskMetaByEntityKey,
          descriptor: payload.descriptor,
        });
        const result: QueryResultInput = {
          descriptor: payload.descriptor,
          taskKeys,
          unreadTaskKeys: payload.unreadTaskKeys,
          searchSnippetsByTaskKey: Object.keys(snippets).length > 0 ? snippets : undefined,
          searchSnippetListsByTaskKey: Object.keys(snippetLists).length > 0 ? snippetLists : undefined,
          total: preservedCount > 0 ? Math.max(payload.total, previous?.total ?? 0, taskKeys.length) : payload.total,
          hasMore: payload.hasMore || (preservedCount > 0 && Math.max(payload.total, previous?.total ?? 0, taskKeys.length) > taskKeys.length),
          partial: payload.partial,
          loadingShardKeys: payload.loadingShardKeys,
          failedShardKeys: payload.failedShardKeys,
          invalidationVersion,
        };
        if (
          !isQueryResultEqual({
            previousResult: previous,
            taskKeys,
            unreadTaskKeys: result.unreadTaskKeys,
            searchSnippetsByTaskKey: result.searchSnippetsByTaskKey,
            searchSnippetListsByTaskKey: result.searchSnippetListsByTaskKey,
            total: result.total,
            hasMore: result.hasMore,
            partial: payload.partial ?? false,
            loadingShardKeys: payload.loadingShardKeys ?? [],
            failedShardKeys: payload.failedShardKeys ?? [],
          })
        ) {
          resultsChanged = true;
          resultsByQueryKey[payload.queryKey] = freezeQueryResult(result);
        }
      }
      return !metaChanged && !resultsChanged && !unreadOverlayChanged
        ? state
        : {
            resultsByQueryKey: resultsChanged ? resultsByQueryKey : state.resultsByQueryKey,
            taskMetaByEntityKey: metaChanged ? taskMetaByEntityKey : state.taskMetaByEntityKey,
            taskUnreadOverlayByEntityKey: unreadOverlayChanged ? unreadOverlay : state.taskUnreadOverlayByEntityKey,
          };
    }),
  upsertTaskMeta: (task) =>
    set((state) => {
      const entityKey = taskEntityKey(task);
      const existing = state.taskMetaByEntityKey[entityKey];
      const preferred = pickPreferredMeta(task, existing) ?? task;
      const merged = isNewerMeta(task) ? mergeMeta(task, preferred) : existing ? mergeMeta(existing, preferred) : preferred;
      return { ...state, taskMetaByEntityKey: { ...state.taskMetaByEntityKey, [entityKey]: merged } };
    }),
  updateTaskMetaPreservingMembership: (task) =>
    set((state) => {
      const entityKey = taskEntityKey(task);
      const existing = state.taskMetaByEntityKey[entityKey];
      const preferred = pickPreferredMeta(task, existing) ?? task;
      const merged = existing ? mergeMeta(existing, preferred) : preferred;
      const taskMetaByEntityKey = { ...state.taskMetaByEntityKey, [entityKey]: merged };
      const resultsByQueryKey = { ...state.resultsByQueryKey };
      for (const [queryKey, result] of Object.entries(state.resultsByQueryKey)) {
        if (result.taskKeys.includes(entityKey)) {
          resultsByQueryKey[queryKey] = {
            ...result,
            taskKeys: sortTaskKeys({ taskKeys: result.taskKeys, taskMetaByEntityKey, descriptor: result.descriptor }),
          };
        }
      }
      return { resultsByQueryKey, taskMetaByEntityKey };
    }),
  applyTaskMutation: ({ previousTask, nextTask, previousState, nextState }) =>
    set((state) => {
      const previousKey = taskEntityKey(previousTask);
      const nextKey = taskEntityKey(nextTask);
      const known = state.taskMetaByEntityKey[nextKey] ?? state.taskMetaByEntityKey[previousKey];
      const merged = known ? mergeMeta(known, nextTask) : nextTask;
      const taskMetaByEntityKey = { ...state.taskMetaByEntityKey, [nextKey]: merged };
      if (previousKey !== nextKey) delete taskMetaByEntityKey[previousKey];
      const resultsByQueryKey = { ...state.resultsByQueryKey };
      for (const [queryKey, result] of Object.entries(state.resultsByQueryKey)) {
        if (result.descriptor.search) {
          resultsByQueryKey[queryKey] = { ...result, invalidationVersion: result.invalidationVersion + 1, stale: true };
          continue;
        }
        const wasMember = matchesDescriptor(result.descriptor, previousTask, previousState);
        const isMember = matchesDescriptor(result.descriptor, nextTask, nextState);
        const touched = result.taskKeys.includes(previousKey) || result.taskKeys.includes(nextKey);
        if (!wasMember && !isMember && !touched) continue;
        const rest = result.taskKeys.filter((key) => key !== previousKey && key !== nextKey);
        const unreadRest = (result.unreadTaskKeys ?? []).filter((key) => key !== previousKey && key !== nextKey);
        const withNext = isMember ? [...rest, nextKey] : rest;
        const unreadNext = isMember && typeof merged.unreadAt === "number" ? [...unreadRest, nextKey] : unreadRest;
        const sorted = sortTaskKeys({ taskKeys: withNext, taskMetaByEntityKey, descriptor: result.descriptor });
        const visible = result.descriptor.visibleLimit === null ? sorted : sorted.slice(0, result.descriptor.visibleLimit);
        const total = Math.max(0, result.total + Number(isMember) - Number(wasMember));
        const truncated = result.descriptor.visibleLimit !== null && wasMember !== isMember && total > visible.length;
        resultsByQueryKey[queryKey] = {
          ...result,
          taskKeys: visible,
          ...(result.unreadTaskKeys ? { unreadTaskKeys: unreadNext } : {}),
          total,
          hasMore: total > visible.length,
          stale: result.stale || truncated,
        };
      }
      return { resultsByQueryKey, taskMetaByEntityKey };
    }),
  setTaskUnreadOverlay: (task, unreadAt) =>
    set((state) => {
      const entityKey = taskEntityKey(task);
      const meta = state.taskMetaByEntityKey[entityKey];
      return {
        taskUnreadOverlayByEntityKey: { ...state.taskUnreadOverlayByEntityKey, [entityKey]: unreadAt ?? null },
        taskMetaByEntityKey: meta ? { ...state.taskMetaByEntityKey, [entityKey]: { ...meta, unreadAt } } : state.taskMetaByEntityKey,
      };
    }),
  reconcileTaskUnread: (task, unreadAt) =>
    set((state) => {
      const entityKey = taskEntityKey(task);
      const meta = state.taskMetaByEntityKey[entityKey];
      return {
        taskUnreadOverlayByEntityKey: { ...state.taskUnreadOverlayByEntityKey, [entityKey]: unreadAt ?? null },
        taskMetaByEntityKey: meta ? { ...state.taskMetaByEntityKey, [entityKey]: { ...meta, unreadAt } } : state.taskMetaByEntityKey,
      };
    }),
  rollbackTaskUnread: (task, unreadAt) =>
    set((state) => {
      const entityKey = taskEntityKey(task);
      const meta = state.taskMetaByEntityKey[entityKey];
      const overlay = { ...state.taskUnreadOverlayByEntityKey };
      delete overlay[entityKey];
      return {
        taskUnreadOverlayByEntityKey: overlay,
        taskMetaByEntityKey: meta ? { ...state.taskMetaByEntityKey, [entityKey]: { ...meta, unreadAt } } : state.taskMetaByEntityKey,
      };
    }),
  removeTask: (task) => {
    let removed = false;
    set((state) => {
      const entityKey = taskEntityKey(task);
      if (!state.taskMetaByEntityKey[entityKey] && !Object.values(state.resultsByQueryKey).some((result) => result.taskKeys.includes(entityKey)))
        return state;
      const taskMetaByEntityKey = { ...state.taskMetaByEntityKey };
      delete taskMetaByEntityKey[entityKey];
      const overlay = { ...state.taskUnreadOverlayByEntityKey };
      delete overlay[entityKey];
      const resultsByQueryKey: Record<string, QueryResult> = {};
      for (const [queryKey, result] of Object.entries(state.resultsByQueryKey)) {
        if (!result.taskKeys.includes(entityKey)) {
          resultsByQueryKey[queryKey] = result;
          continue;
        }
        const taskKeys = result.taskKeys.filter((key) => key !== entityKey);
        removed = true;
        const total = Math.max(0, result.total - 1);
        resultsByQueryKey[queryKey] = { ...result, taskKeys, total, hasMore: total > taskKeys.length };
      }
      return { resultsByQueryKey, taskMetaByEntityKey, taskUnreadOverlayByEntityKey: overlay };
    });
    return removed;
  },
  markWorkspaceKeysStale: (keys) =>
    set((state) => {
      if (keys.length === 0) return state;
      const staleSet = new Set(keys);
      const resultsByQueryKey = { ...state.resultsByQueryKey };
      let changed = false;
      for (const [queryKey, result] of Object.entries(state.resultsByQueryKey)) {
        if (result.descriptor.workspaceKeys.some((key) => staleSet.has(key))) {
          resultsByQueryKey[queryKey] = { ...result, invalidationVersion: result.invalidationVersion + 1, stale: true };
          changed = true;
        }
      }
      return changed ? { resultsByQueryKey } : state;
    }),
  invalidateWorkspaceKeys: (keys) =>
    set((state) => {
      if (keys.length === 0) return state;
      const invalid = new Set(keys);
      return {
        resultsByQueryKey: Object.fromEntries(
          Object.entries(state.resultsByQueryKey).filter(([queryKey]) => ![...invalid].some((key) => queryKey.includes(`workspaces=${key}`) || queryKey.includes(`|${key}`))),
        ),
        taskMetaByEntityKey: Object.fromEntries(
          Object.entries(state.taskMetaByEntityKey).filter(([entityKey]) => {
            const workspacePart = entityKey.split("::")[0] ?? "";
            return !invalid.has(workspacePart);
          }),
        ),
      };
    }),
  clearAll: () => set(() => ({ resultsByQueryKey: {}, taskMetaByEntityKey: {}, taskUnreadOverlayByEntityKey: {} })),
}));

/* --- 模块级助手（原 Zie/Qie/Ho/$ie/eae/Uo/tae/nae/Wo/rae，js 1879–1927） --- */

/** 原 Zie：按查询键的选择器工厂 */
export function selectQueryResult(queryKey: string) {
  return (state: SearchResultsState) => state.resultsByQueryKey[queryKey] ?? null;
}

export function invalidateWorkspaceResults(workspaces: Array<{ workspacePath: string; workspaceIdentity?: string | null }>): void {
  useSearchResultsStore.getState().invalidateWorkspaceKeys(workspaces.map((w) => workspaceKey(w.workspacePath, w.workspaceIdentity)));
}

export function markWorkspaceResultsStale(workspaces: Array<{ workspacePath: string; workspaceIdentity?: string | null }>): void {
  useSearchResultsStore.getState().markWorkspaceKeysStale(workspaces.map((w) => workspaceKey(w.workspacePath, w.workspaceIdentity)));
}

export function upsertSearchTaskMeta(task: TaskMeta): void {
  useSearchResultsStore.getState().upsertTaskMeta(task);
}

export function updateSearchTaskMetaPreservingMembership(task: TaskMeta): void {
  useSearchResultsStore.getState().updateTaskMetaPreservingMembership(task);
}

/** 原 Uo：应用任务变更；归档迁移时广播 archived 事件 */
export function applySearchTaskMutation(mutation: Parameters<SearchResultsState["applyTaskMutation"]>[0]): void {
  useSearchResultsStore.getState().applyTaskMutation(mutation);
  if (!mutation.previousState.archived && mutation.nextState.archived) {
    broadcastTaskListEvent({
      type: "archived",
      taskId: mutation.nextTask.taskId,
      workspaceKey: workspaceKey(mutation.nextTask.workspacePath, mutation.nextTask.workspaceIdentity),
    });
  }
}

export function setSearchTaskUnreadOverlay(task: TaskMeta, unreadAt: number | null | undefined): void {
  useSearchResultsStore.getState().setTaskUnreadOverlay(task, unreadAt);
}

export function reconcileSearchTaskUnread(task: TaskMeta, unreadAt: number | null | undefined): void {
  useSearchResultsStore.getState().reconcileTaskUnread(task, unreadAt);
}

export function rollbackSearchTaskUnread(task: TaskMeta, unreadAt: number | undefined): void {
  useSearchResultsStore.getState().rollbackTaskUnread(task, unreadAt);
}

/** 原 rae：删除任务并广播 deleted 事件 */
export function removeSearchTask(task: TaskMeta): boolean {
  const removed = useSearchResultsStore.getState().removeTask(task);
  broadcastTaskListEvent({ type: "deleted", taskId: task.taskId, workspaceKey: workspaceKey(task.workspacePath, task.workspaceIdentity) });
  return removed;
}

