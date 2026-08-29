/* eslint-disable */
/**
 * ============================================================================
 * stores-session.tsx — ZCode 3.7.6 横切层 zustand stores · 会话/布局域（D8 Stage B）
 * ============================================================================
 *
 * 来源文件（融合 chunk，213,695 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js
 * 行号口径：融合 chunk js 行；模块地图见同目录 MODULE-MAP.md §2.1。
 * 本文件含 4 个 store：
 *
 *  # | 混淆名 | 语义名                  | js 行          | 归属族
 *  --|--------|--------------------------|----------------|---------
 *  2 | Vo     | SearchResultsStore       | 1553–2609      | F05
 *  3 | ls     | TrajectoryViewerStore    | 2610–2637      | F04
 * 3b | —      | TuiEditRequestStore      | D5c 新增       | F04（「在 TUI 中编辑此任务」打开请求信箱）
 * 11 | s2     | SplitLayoutStore         | 121669–121891  | F07
 * 12 | A2     | SessionRouterStore       | 122619–122802  | F07
 *
 * ----------------------------------------------------------------------------
 * 持久化键
 * ----------------------------------------------------------------------------
 *  SplitLayoutStore:  zcode-v4-pane-layout:v2（现行，bwt）；zcode-v4-pane-layout:v1（旧键占位，xwt）
 *                     仅在 renderer reload（performance navigation type==='reload'，原 z0）时恢复
 *  SessionRouterStore: zcode-v4-session-workbench-groups:v1（nTt）
 *  TrajectoryViewerStore / SearchResultsStore: 无
 *
 * selectors 使用方（抽样）：
 *  s2：10 处 —— 122842–122849（PTt 会话编排器）、122700–122780（A2 联动）等
 *  A2：8 处 —— 122852–122858（PTt）、151243（侧栏任务行分组态）等
 *  Vo：8 处 —— 24733、35783–35785（任务搜索）、144436–144439（任务列表域）
 *  ls：静态调用 2624–2628（goe 钩子）、143915、151737（requestOpen 两处消费）
 * ============================================================================
 */

import * as React from "react";
import { t as logger } from './logger'; // 原 J（logger-PFDwl5Yq.js t 导出）
import { freezeQueryResult, mergeIncomingTaskKeys, taskEntityKey } from './StoresDeep';
import { create as createStore, resolveWorkspaceKey as workspaceKey } from './SkillStore'; // 原 Ae | 原 Io=U
import { mergeTaskMetaEntry as mergeTaskMeta, isQueryResultEquivalent as isQueryResultEqual, descriptorContainsTask as matchesDescriptor, sortTaskKeysByDescriptor as sortTaskKeys, pickBestTaskMetadata as pickPreferredMeta, mergeMetaPreservingActivity as mergeMeta, sessionActivityOf as isNewerMeta, broadcastSessionActivity as broadcastTaskListEvent } from './StoresDeep'; // 原 Jie | 原 Yie | 原 Kie | 原 Bo | 原 pe | 原 Po | 原 Mo | 原 Hie
import type { SearchDescriptor, QueryResult, QueryResultInput, TaskMeta } from './StoresDeep';
export type { SearchDescriptor, QueryResult, TaskMeta };

/* ============================================================================
 * 0. zustand 接口（同 stores-core.tsx；`Ae` = skillStore chunk 的 create）
 * ==========================================================================*/

type SetState<T> = (partial: Partial<T> | ((state: T) => Partial<T>), replace?: boolean) => void;
type GetState<T> = () => T;
interface StoreApi<T> {
  getState: GetState<T>;
  setState: (partial: Partial<T> | ((state: T) => Partial<T>)) => void;
  subscribe: (listener: (state: T, prevState: T) => void) => () => void;
}
export type UseBoundStore<T> = StoreApi<T> & (<R>(selector: (state: T) => R) => R);

/** 任务实体键（原 Lo：`${workspaceKey}::${taskId}`） */
/** 侧面板标签页 store（原 pc useTabStore / oc isWorkspaceTab，F04 域；此处为外部依赖声明） */
export interface WorkspaceTab {
  id: string;
  type: string;
  workspacePath?: string;
  workspaceIdentity?: string | null;
  remoteSessionId?: string | null;
  remoteTarget?: unknown;
  [key: string]: unknown;
}
declare function isWorkspaceTab(tab: unknown): tab is WorkspaceTab;

/* ============================================================================
 * 1. TrajectoryViewerStore（原 ls，js 2610–2637 / jsx 1697）
 * ----------------------------------------------------------------------------
 * 模型轨迹面板的“打开请求”信箱：跨组件请求打开某任务的 model-trajectory 标签。
 * state 字段表：
 *  | 字段 | 类型 | 用途 |
 *  |---|---|---|
 *  | pendingRequest | { workspaceKey, taskId, title, requestId } \| null | 待消费打开请求 |
 * actions：requestOpen/consumeRequest（2 个）
 * ==========================================================================*/

export interface TrajectoryOpenRequest {
  workspaceKey: string;
  taskId: string;
  title?: string | null;
  requestId: string;
}

export interface TrajectoryViewerState {
  pendingRequest: TrajectoryOpenRequest | null;
  requestOpen(request: { workspaceKey: string; taskId: string; title?: string | null }): void;
  consumeRequest(requestId: string): void;
}

let trajectoryRequestSeq = 0; // 原 hoe

export const useTrajectoryViewerStore: UseBoundStore<TrajectoryViewerState> = createStore<TrajectoryViewerState>((set) => ({
  pendingRequest: null,
  requestOpen: (request) => {
    trajectoryRequestSeq += 1;
    set({ pendingRequest: { ...request, requestId: `model-trajectory-open:${trajectoryRequestSeq}` } });
  },
  consumeRequest: (requestId) => {
    set((state) => (state.pendingRequest?.requestId === requestId ? { pendingRequest: null } : state));
  },
}));

/** 原 goe（js 2619–2633）：订阅本工作区的轨迹打开请求并消费 */
export function useTrajectoryOpenRequest(
  workspaceKeyOfView: string,
  onOpen: (target: { taskId: string; title?: string | null }) => void,
): void {
  React.useEffect(() => {
    const handle = (request: TrajectoryOpenRequest | null) => {
      if (!request || request.workspaceKey !== workspaceKeyOfView) return;
      onOpen({ taskId: request.taskId, title: request.title });
      useTrajectoryViewerStore.getState().consumeRequest(request.requestId);
    };
    handle(useTrajectoryViewerStore.getState().pendingRequest);
    return useTrajectoryViewerStore.subscribe((state) => {
      handle(state.pendingRequest);
    });
  }, [onOpen, workspaceKeyOfView]);
}

/* ============================================================================
 * 1b. TuiEditRequestStore（D5c 小件新增；仿 TrajectoryViewerStore 打开请求信箱）
 * ----------------------------------------------------------------------------
 * 「在 TUI 中编辑此任务」的打开请求信箱：会话头 ⋯ 菜单发起，请求在底部终端 dock
 * 新建一页 exec nofy 任务编辑模式（`nofy --resume <sessionId>`，cwd=任务工作区）。
 * 产品口径：TUI=具体任务的编辑器，入口只挂在任务上；本信箱不是 daemon 入口。
 * 消费链：useSidePaneState（peek 不消费 → 打开终端 dock）→ TerminalDockPanel
 * （消费 → 新建带 initialCommand 的终端页）。
 * state 字段表：
 *  | 字段 | 类型 | 用途 |
 *  |---|---|---|
 *  | pendingRequest | { workspaceKey, sessionId, cwd, requestId } \| null | 待消费打开请求 |
 * actions：requestOpen/consumeRequest（2 个）
 * TODO(D5c-live)：活体验证（真实桌面壳里点菜单→dock 开页→`nofy --resume` 起 TUI）
 * 依赖主接线 agent（out/main 侧 nofy 二进制/pty 真链路）；DOM 级验证已通过
 * （/tmp/d5c-dom/verify.mjs：菜单渲染/点击→requestOpen/消费→pty spawn+exec）。
 * ==========================================================================*/

export interface TuiEditOpenRequest {
  workspaceKey: string;
  sessionId: string;
  cwd: string;
  requestId: string;
}

export interface TuiEditRequestState {
  pendingRequest: TuiEditOpenRequest | null;
  requestOpen(request: { workspaceKey: string; sessionId: string; cwd: string }): void;
  consumeRequest(requestId: string): void;
}

let tuiEditRequestSeq = 0; // D5c：仿 hoe 递增序号

export const useTuiEditRequestStore: UseBoundStore<TuiEditRequestState> = createStore<TuiEditRequestState>((set) => ({
  pendingRequest: null,
  requestOpen: (request) => {
    tuiEditRequestSeq += 1;
    set({ pendingRequest: { ...request, requestId: `tui-edit-open:${tuiEditRequestSeq}` } });
  },
  consumeRequest: (requestId) => {
    set((state) => (state.pendingRequest?.requestId === requestId ? { pendingRequest: null } : state));
  },
}));

/** D5c：只读订阅本工作区的 TUI 编辑打开请求（不消费）——useSidePaneState 用它打开终端 dock */
export function useTuiEditPendingRequest(workspaceKeyOfView: string): TuiEditOpenRequest | null {
  return useTuiEditRequestStore((state) =>
    state.pendingRequest && state.pendingRequest.workspaceKey === workspaceKeyOfView ? state.pendingRequest : null,
  );
}

/** D5c：订阅并消费本工作区的 TUI 编辑打开请求——TerminalDockPanel 用它新建 exec nofy 的终端页 */
export function useTuiEditOpenRequest(
  workspaceKeyOfView: string,
  onOpen: (target: { sessionId: string; cwd: string }) => void,
): void {
  React.useEffect(() => {
    const handle = (request: TuiEditOpenRequest | null) => {
      if (!request || request.workspaceKey !== workspaceKeyOfView) return;
      onOpen({ sessionId: request.sessionId, cwd: request.cwd });
      useTuiEditRequestStore.getState().consumeRequest(request.requestId);
    };
    handle(useTuiEditRequestStore.getState().pendingRequest);
    return useTuiEditRequestStore.subscribe((state) => {
      handle(state.pendingRequest);
    });
  }, [onOpen, workspaceKeyOfView]);
}

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

/* ============================================================================
 * 3. SplitLayoutStore（原 s2，js 121669–121703；布局模型 121368–121668）
 * ----------------------------------------------------------------------------
 * v4 分屏布局：二叉树窗格（leaf/split）+ 每窗格会话绑定 + 焦点。
 * state 字段表：
 *  | 字段 | 类型 | 用途 |
 *  |---|---|---|
 *  | root | PaneTreeNode | 布局树根（缺省单叶 workspace-main） |
 *  | panes | Record<paneId, PaneBinding> | 非主窗格的会话绑定（主窗格不入表） |
 *  | focusedPaneId | string | 焦点窗格（缺省 workspace-main） |
 * actions（10）：splitPane/splitPaneWithBinding/openSessionInNewPane/replacePaneBinding/
 *   closePane/focusPane/bindPaneSession/setSplitRatio/confirmRestoredPaneSession/resetToPrimaryPane
 * 约束：最多 4 窗格（原 Y0）；比例钳制 0.25–0.75（原 H0）；主窗格不可关闭。
 * 持久化：`zcode-v4-pane-layout:v2`（subscribe 即写，原 Owt；仅 reload 时恢复，原 z0/kwt）。
 * ==========================================================================*/

export interface WorkspaceScope {
  workspacePath: string;
  workspaceIdentity?: string;
  remoteSessionId?: string;
}

export interface PaneBinding {
  workspaceScope: WorkspaceScope;
  sessionId: string | null;
  readOnly?: boolean;
  restoredUnvalidated?: boolean;
}

export type PaneTreeNode =
  | { type: "leaf"; paneId: string }
  | { type: "split"; id: string; direction: "row" | "column"; ratio: number; first: PaneTreeNode; second: PaneTreeNode };

export interface SplitLayoutState {
  root: PaneTreeNode;
  panes: Record<string, PaneBinding>;
  focusedPaneId: string;
  splitPane(paneId: string, direction: "row" | "column", workspaceScope: WorkspaceScope): void;
  splitPaneWithBinding(paneId: string, side: "left" | "right" | "up" | "down", binding: PaneBinding): void;
  openSessionInNewPane(workspaceScope: WorkspaceScope, sessionId: string): void;
  replacePaneBinding(paneId: string, binding: PaneBinding): void;
  closePane(paneId: string): void;
  focusPane(paneId: string): void;
  bindPaneSession(paneId: string, sessionId: string): void;
  setSplitRatio(splitId: string, ratio: number): void;
  confirmRestoredPaneSession(paneId: string): void;
  resetToPrimaryPane(): void;
}

/* --- 常量与纯函数（原 121368–121512） --- */

export const PRIMARY_PANE_ID = "workspace-main"; // 原 B0
const MIN_SPLIT_RATIO = 0.25; // 原 cwt
const MAX_SPLIT_RATIO = 0.75; // 原 lwt
const DEFAULT_SPLIT_RATIO = 0.5; // 原 V0
const MAX_PANE_COUNT = 4;
export const PANE_LAYOUT_STORAGE_KEY = "zcode-v4-pane-layout:v2"; // 原 bwt
export const PANE_LAYOUT_LEGACY_STORAGE_KEY = "zcode-v4-pane-layout:v1"; // 原 xwt

export function clampSplitRatio(ratio: number): number {
  return Number.isFinite(ratio) ? Math.min(MAX_SPLIT_RATIO, Math.max(MIN_SPLIT_RATIO, ratio)) : DEFAULT_SPLIT_RATIO;
}

/** 原 U0：工作区作用域键（identity 优先） */
export function workspaceScopeKey(scope: WorkspaceScope): string {
  return scope.workspaceIdentity?.trim() || scope.workspacePath;
}

/** 原 W0：绑定是否指向同一会话+工作区 */
export function bindingMatchesSession(binding: PaneBinding | undefined | null, scope: WorkspaceScope, sessionId: string): boolean {
  return !!binding && binding.sessionId === sessionId && workspaceScopeKey(binding.workspaceScope) === workspaceScopeKey(scope);
}

const PRIMARY_ROOT: PaneTreeNode = { type: "leaf", paneId: PRIMARY_PANE_ID }; // 原 G0
export const INITIAL_SPLIT_LAYOUT: Pick<SplitLayoutState, "root" | "panes" | "focusedPaneId"> = {
  root: PRIMARY_ROOT,
  panes: {},
  focusedPaneId: PRIMARY_PANE_ID,
}; // 原 K0

export function collectPaneIds(node: PaneTreeNode): string[] {
  return node.type === "leaf" ? [node.paneId] : [...collectPaneIds(node.first), ...collectPaneIds(node.second)];
}
export function paneCount(state: { root: PaneTreeNode }): number {
  return collectPaneIds(state.root).length;
}
export function canAddPane(state: { root: PaneTreeNode }): boolean {
  return paneCount(state) < MAX_PANE_COUNT;
}
export function containsPane(node: PaneTreeNode, paneId: string): boolean {
  return node.type === "leaf" ? node.paneId === paneId : containsPane(node.first, paneId) || containsPane(node.second, paneId);
}
export function effectiveFocusedPaneId(state: { root: PaneTreeNode; focusedPaneId: string }): string {
  return containsPane(state.root, state.focusedPaneId) ? state.focusedPaneId : PRIMARY_PANE_ID;
}

function nextPaneId(root: PaneTreeNode): string {
  let max = 0;
  for (const paneId of collectPaneIds(root)) {
    const match = /^pane-(\d+)$/.exec(paneId);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `pane-${max + 1}`;
}

function collectSplitIds(node: PaneTreeNode): string[] {
  return node.type === "leaf" ? [] : [node.id, ...collectSplitIds(node.first), ...collectSplitIds(node.second)];
}

function nextSplitId(root: PaneTreeNode): string {
  let max = 0;
  for (const id of collectSplitIds(root)) {
    const match = /^n(\d+)$/.exec(id);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `n${max + 1}`;
}

function replacePaneNode(root: PaneTreeNode, paneId: string, replacement: PaneTreeNode): PaneTreeNode {
  if (root.type === "leaf") return root.paneId === paneId ? replacement : root;
  const first = replacePaneNode(root.first, paneId, replacement);
  const second = replacePaneNode(root.second, paneId, replacement);
  return first === root.first && second === root.second ? root : { ...root, first, second };
}

function removePaneNode(root: PaneTreeNode, paneId: string): PaneTreeNode | null {
  if (root.type === "leaf") return root.paneId === paneId ? null : root;
  const first = removePaneNode(root.first, paneId);
  if (first === null) return root.second;
  const second = removePaneNode(root.second, paneId);
  if (second === null) return root.first;
  return first === root.first && second === root.second ? root : { ...root, first, second };
}

function setNodeRatio(root: PaneTreeNode, splitId: string, ratio: number): PaneTreeNode {
  if (root.type === "leaf") return root;
  if (root.id === splitId) return root.ratio === ratio ? root : { ...root, ratio };
  const first = setNodeRatio(root.first, splitId, ratio);
  const second = setNodeRatio(root.second, splitId, ratio);
  return first === root.first && second === root.second ? root : { ...root, first, second };
}

/* --- 布局归约（原 fwt/n2/pwt/mwt/hwt/gwt/_wt/r2/vwt/ywt，js 121437–121512） --- */

type LayoutCore = Pick<SplitLayoutState, "root" | "panes" | "focusedPaneId">;

function reduceSplitPane(state: LayoutCore, paneId: string, direction: "row" | "column", binding: PaneBinding): LayoutCore {
  if (!containsPane(state.root, paneId) || !canAddPane(state)) return state;
  const newPaneId = nextPaneId(state.root);
  const split: PaneTreeNode = {
    type: "split",
    id: nextSplitId(state.root),
    direction,
    ratio: DEFAULT_SPLIT_RATIO,
    first: { type: "leaf", paneId },
    second: { type: "leaf", paneId: newPaneId },
  };
  return { root: replacePaneNode(state.root, paneId, split), panes: { ...state.panes, [newPaneId]: binding }, focusedPaneId: newPaneId };
}

function reduceSplitWithBinding(state: LayoutCore, paneId: string, side: "left" | "right" | "up" | "down", binding: PaneBinding): LayoutCore {
  if (!containsPane(state.root, paneId) || !canAddPane(state)) return state;
  const newPaneId = nextPaneId(state.root);
  const existingLeaf: PaneTreeNode = { type: "leaf", paneId };
  const newLeaf: PaneTreeNode = { type: "leaf", paneId: newPaneId };
  const newComesFirst = side === "left" || side === "up";
  const split: PaneTreeNode = {
    type: "split",
    id: nextSplitId(state.root),
    direction: side === "left" || side === "right" ? "row" : "column",
    ratio: DEFAULT_SPLIT_RATIO,
    first: newComesFirst ? newLeaf : existingLeaf,
    second: newComesFirst ? existingLeaf : newLeaf,
  };
  return { root: replacePaneNode(state.root, paneId, split), panes: { ...state.panes, [newPaneId]: binding }, focusedPaneId: newPaneId };
}

function reduceClosePane(state: LayoutCore, paneId: string): LayoutCore {
  if (paneId === PRIMARY_PANE_ID || !containsPane(state.root, paneId)) return state;
  const root = removePaneNode(state.root, paneId) ?? PRIMARY_ROOT;
  const panes = { ...state.panes };
  delete panes[paneId];
  return { root, panes, focusedPaneId: state.focusedPaneId === paneId ? PRIMARY_PANE_ID : state.focusedPaneId };
}

function reduceBindPaneSession(state: LayoutCore, paneId: string, sessionId: string): LayoutCore {
  const binding = state.panes[paneId];
  if (!binding || (binding.sessionId === sessionId && !binding.restoredUnvalidated)) return state;
  return { ...state, panes: { ...state.panes, [paneId]: { workspaceScope: binding.workspaceScope, sessionId } } };
}

function reduceReplacePaneBinding(state: LayoutCore, paneId: string, binding: PaneBinding): LayoutCore {
  if (!state.panes[paneId] || paneId === PRIMARY_PANE_ID) return state;
  return { ...state, panes: { ...state.panes, [paneId]: binding }, focusedPaneId: paneId };
}

/** 原 gwt：找已绑定该会话的窗格 */
export function findPaneIdBySession(state: LayoutCore, scope: WorkspaceScope, sessionId: string): string | null {
  for (const [paneId, binding] of Object.entries(state.panes)) if (bindingMatchesSession(binding, scope, sessionId)) return paneId;
  return null;
}

function reduceSetSplitRatio(state: LayoutCore, splitId: string, ratio: number): LayoutCore {
  const root = setNodeRatio(state.root, splitId, clampSplitRatio(ratio));
  return root === state.root ? state : { ...state, root };
}

function reduceFocusPane(state: LayoutCore, paneId: string): LayoutCore {
  return state.focusedPaneId === paneId || !containsPane(state.root, paneId) ? state : { ...state, focusedPaneId: paneId };
}

function reduceConfirmRestoredPaneSession(state: LayoutCore, paneId: string): LayoutCore {
  const binding = state.panes[paneId];
  return binding?.restoredUnvalidated
    ? { ...state, panes: { ...state.panes, [paneId]: { workspaceScope: binding.workspaceScope, sessionId: binding.sessionId } } }
    : state;
}

function reduceOpenSessionInNewPane(state: LayoutCore, scope: WorkspaceScope, sessionId: string): LayoutCore {
  const scopeKey = workspaceScopeKey(scope);
  for (const [paneId, binding] of Object.entries(state.panes)) {
    if (binding.sessionId === sessionId && workspaceScopeKey(binding.workspaceScope) === scopeKey) return reduceFocusPane(state, paneId);
  }
  return reduceSplitPane(state, effectiveFocusedPaneId(state), "row", { workspaceScope: scope, sessionId });
}

/* --- 持久化（原 Cwt 校验解析 / kwt 恢复 / Owt 保存，js 121514–121668） --- */

function parsePersistedLayout(raw: unknown): LayoutCore | null {
  /* 原 Cwt：结构校验 —— 树合法、≤4 叶、恰一个 workspace-main、绑定齐备 */
  if (typeof raw !== "object" || raw === null) return null;
  const candidate = raw as { root?: unknown; panes?: unknown; focusedPaneId?: unknown };
  const root = parsePersistedNode(candidate.root);
  if (!root) return null;
  const paneIds = collectPaneIds(root);
  if (paneIds.length > MAX_PANE_COUNT || new Set(paneIds).size !== paneIds.length || paneIds.filter((id) => id === PRIMARY_PANE_ID).length !== 1) return null;
  const rawPanes = typeof candidate.panes === "object" && candidate.panes !== null ? (candidate.panes as Record<string, unknown>) : {};
  const panes: Record<string, PaneBinding> = {};
  for (const paneId of paneIds) {
    if (paneId === PRIMARY_PANE_ID) continue;
    const binding = parsePersistedBinding(rawPanes[paneId]);
    if (!binding) return null;
    panes[paneId] = binding;
  }
  const focusedPaneId = typeof candidate.focusedPaneId === "string" && paneIds.includes(candidate.focusedPaneId) ? candidate.focusedPaneId : PRIMARY_PANE_ID;
  return { root, panes, focusedPaneId };
}

function parsePersistedNode(raw: unknown): PaneTreeNode | null {
  if (typeof raw !== "object" || raw === null) return null;
  const node = raw as { type?: string; paneId?: string; id?: string; direction?: string; ratio?: number; first?: unknown; second?: unknown };
  if (node.type === "leaf") return typeof node.paneId === "string" && node.paneId.length > 0 ? { type: "leaf", paneId: node.paneId } : null;
  if (node.type === "split") {
    if (typeof node.id !== "string" || node.id.length === 0 || (node.direction !== "row" && node.direction !== "column")) return null;
    const first = parsePersistedNode(node.first);
    const second = parsePersistedNode(node.second);
    return !first || !second
      ? null
      : { type: "split", id: node.id, direction: node.direction, ratio: clampSplitRatio(typeof node.ratio === "number" ? node.ratio : NaN), first, second };
  }
  return null;
}

function parsePersistedBinding(raw: unknown): PaneBinding | null {
  if (typeof raw !== "object" || raw === null) return null;
  const candidate = raw as { workspaceScope?: unknown; sessionId?: unknown };
  const scope = parsePersistedScope(candidate.workspaceScope);
  return scope && typeof candidate.sessionId === "string"
    ? { workspaceScope: scope, sessionId: candidate.sessionId, restoredUnvalidated: true }
    : null;
}

function parsePersistedScope(raw: unknown): WorkspaceScope | null {
  if (typeof raw !== "object" || raw === null) return null;
  const candidate = raw as { workspacePath?: unknown; workspaceIdentity?: unknown; remoteSessionId?: unknown };
  if (typeof candidate.workspacePath !== "string" || candidate.workspacePath.length === 0) return null;
  return {
    workspacePath: candidate.workspacePath,
    ...(typeof candidate.workspaceIdentity === "string" && candidate.workspaceIdentity.trim().length > 0 ? { workspaceIdentity: candidate.workspaceIdentity } : {}),
    ...(typeof candidate.remoteSessionId === "string" && candidate.remoteSessionId.length > 0 ? { remoteSessionId: candidate.remoteSessionId } : {}),
  };
}

/** 原 z0：本次导航是否为 renderer reload（只有 reload 才恢复分屏布局） */
export function isRendererReload(entries: PerformanceEntryList = navigationEntries()): boolean {
  return (entries[0] as PerformanceNavigationTiming | undefined)?.type === "reload";
}

function navigationEntries(): PerformanceEntryList {
  try {
    return typeof globalThis.performance?.getEntriesByType === "function" ? globalThis.performance.getEntriesByType("navigation") : ([] as unknown as PerformanceEntryList);
  } catch {
    return [] as unknown as PerformanceEntryList;
  }
}

/** 原 kwt：reload 时从 localStorage 恢复布局 */
function restorePersistedLayout(): LayoutCore | null {
  try {
    const raw = globalThis.localStorage?.getItem(PANE_LAYOUT_STORAGE_KEY);
    return raw ? parsePersistedLayout(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

/** 原 Owt：布局变更即持久化（s2.subscribe 挂载） */
function persistLayout(state: LayoutCore): void {
  try {
    globalThis.localStorage?.setItem(PANE_LAYOUT_STORAGE_KEY, JSON.stringify({ version: 2, ...state }));
  } catch {
    /* 静默 */
  }
}

const restoredLayout = isRendererReload() ? restorePersistedLayout() : null; // 原 Awt

export const useSplitLayoutStore: UseBoundStore<SplitLayoutState> = createStore<SplitLayoutState>((set) => ({
  ...(restoredLayout ?? INITIAL_SPLIT_LAYOUT),
  splitPane: (paneId, direction, workspaceScope) => {
    set((state) => reduceSplitPane(state, paneId, direction, { workspaceScope, sessionId: null }));
  },
  splitPaneWithBinding: (paneId, side, binding) => {
    set((state) => reduceSplitWithBinding(state, paneId, side, binding));
  },
  openSessionInNewPane: (workspaceScope, sessionId) => {
    set((state) => reduceOpenSessionInNewPane(state, workspaceScope, sessionId));
  },
  replacePaneBinding: (paneId, binding) => {
    set((state) => reduceReplacePaneBinding(state, paneId, binding));
  },
  closePane: (paneId) => {
    set((state) => reduceClosePane(state, paneId));
  },
  focusPane: (paneId) => {
    set((state) => reduceFocusPane(state, paneId));
  },
  bindPaneSession: (paneId, sessionId) => {
    set((state) => reduceBindPaneSession(state, paneId, sessionId));
  },
  setSplitRatio: (splitId, ratio) => {
    set((state) => reduceSetSplitRatio(state, splitId, ratio));
  },
  confirmRestoredPaneSession: (paneId) => {
    set((state) => reduceConfirmRestoredPaneSession(state, paneId));
  },
  resetToPrimaryPane: () => {
    set(INITIAL_SPLIT_LAYOUT);
  },
}));

useSplitLayoutStore.subscribe((state) => {
  persistLayout(state);
});

/* ============================================================================
 * 4. SessionRouterStore（原 A2，js 122619–122802；工作组模型 122284–122618）
 * ----------------------------------------------------------------------------
 * v4 工作台“会话组”路由：把分屏布局升格为可命名复用的一组会话
 * （primaryBinding + 分屏 panes），侧栏打开任务时聚焦/分裂/建组。
 * state 字段表：
 *  | 字段 | 类型 | 用途 |
 *  |---|---|---|
 *  | activeGroupId | string \| null | 当前激活组 |
 *  | groups | Record<groupId, WorkbenchGroup> | 组表 |
 *  | sessionIndex | Record<sessionKey, groupId> | 会话键→组 反查索引 |
 * actions（13）：configureClientMode/openSessionFromSidebar/splitSessionIntoGroup/
 *   promotePaneLayoutToGroup/focusPane/closePane/confirmRestoredPaneSession/
 *   bindPaneSession/setSplitRatio/isSessionGrouped/getActiveContext/
 *   deactivateActiveGroup/resetWorkbenchGroups
 * 客户端模式（原 _2）：'desktop-continuous'（缺省）| 'web-remote-replayable'
 *   （回放模式禁用全部组操作，y2 门）。
 * 持久化：`zcode-v4-session-workbench-groups:v1`（subscribe 即写，原 wTt；
 *   恢复时所有绑定标 restoredUnvalidated，原 xTt）。
 * ==========================================================================*/

export interface SessionBinding {
  workspaceScope: WorkspaceScope;
  sessionId: string;
  readOnly?: boolean;
  restoredUnvalidated?: boolean;
}

export interface WorkbenchGroup {
  id: string;
  primaryBinding: SessionBinding;
  root: PaneTreeNode;
  panes: Record<string, SessionBinding>;
  focusedPaneId: string;
  updatedAt: number;
}

export type ClientMode = "desktop-continuous" | "web-remote-replayable";

export interface SessionRouterState {
  activeGroupId: string | null;
  groups: Record<string, WorkbenchGroup>;
  sessionIndex: Record<string, string>;
  configureClientMode(mode: ClientMode): void;
  openSessionFromSidebar(binding: SessionBinding): void;
  splitSessionIntoGroup(anchorPaneId: string, side: "left" | "right" | "up" | "down", binding: SessionBinding, primaryBinding?: SessionBinding): void;
  promotePaneLayoutToGroup(primaryBinding: SessionBinding, layout: LayoutCore): boolean;
  focusPane(groupId: string, paneId: string): void;
  closePane(groupId: string, paneId: string): void;
  confirmRestoredPaneSession(groupId: string, paneId: string): void;
  bindPaneSession(groupId: string, paneId: string, sessionId: string): void;
  setSplitRatio(groupId: string, splitId: string, ratio: number): void;
  isSessionGrouped(scope: WorkspaceScope, sessionId: string | null): boolean;
  getActiveContext(): SessionBinding | null;
  deactivateActiveGroup(): void;
  resetWorkbenchGroups(): void;
}

/* --- 键与纯函数（原 122284–122488） --- */

export const WORKBENCH_GROUPS_STORAGE_KEY = "zcode-v4-session-workbench-groups:v1"; // 原 nTt
const INITIAL_ROUTER_STATE: Pick<SessionRouterState, "activeGroupId" | "groups" | "sessionIndex"> = {
  activeGroupId: null,
  groups: {},
  sessionIndex: {},
}; // 原 g2

let clientMode: ClientMode = "desktop-continuous"; // 原 _2
let hydratedFromStorage = false; // 原 v2

/** 原 y2：组功能门（回放模式禁用） */
export function isGroupRoutingEnabled(): boolean {
  return clientMode !== "web-remote-replayable";
}

/** 原 b2：会话键 = 工作区键::会话 id */
export function sessionKeyOf(scope: WorkspaceScope, sessionId: string): string {
  return `${workspaceScopeKey(scope)}::${sessionId}`;
}

function bindingKey(binding: SessionBinding): string {
  return sessionKeyOf(binding.workspaceScope, binding.sessionId);
}

function sameBinding(a: SessionBinding, b: SessionBinding): boolean {
  return bindingKey(a) === bindingKey(b);
}

function groupBindings(group: WorkbenchGroup): SessionBinding[] {
  return [group.primaryBinding, ...Object.values(group.panes)];
}

function groupHasBinding(group: WorkbenchGroup, binding: SessionBinding): boolean {
  return groupBindings(group).some((item) => bindingKey(item) === bindingKey(binding));
}

function bindingForPane(group: WorkbenchGroup, paneId: string): SessionBinding | null {
  return paneId === PRIMARY_PANE_ID ? group.primaryBinding : (group.panes[paneId] ?? null);
}

/** 原 E2：组的焦点上下文 */
export function focusedGroupBinding(group: WorkbenchGroup): SessionBinding | null {
  return bindingForPane(group, group.focusedPaneId);
}

function paneIdForGroupBinding(group: WorkbenchGroup, binding: SessionBinding): string | null {
  if (sameBinding(group.primaryBinding, binding)) return PRIMARY_PANE_ID;
  for (const [paneId, item] of Object.entries(group.panes)) if (sameBinding(item, binding)) return paneId;
  return null;
}

function nextGroupId(groups: Record<string, WorkbenchGroup>): string {
  let max = 0;
  for (const id of Object.keys(groups)) {
    const match = /^group-(\d+)$/.exec(id);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `group-${max + 1}`;
}

function rebuildSessionIndex(groups: Record<string, WorkbenchGroup>): Record<string, string> {
  const index: Record<string, string> = {};
  for (const group of Object.values(groups)) for (const binding of groupBindings(group)) index[bindingKey(binding)] = group.id;
  return index;
}

function upsertGroup(state: Pick<SessionRouterState, "activeGroupId" | "groups" | "sessionIndex">, group: WorkbenchGroup) {
  const groups = { ...state.groups, [group.id]: group };
  return { activeGroupId: group.id, groups, sessionIndex: rebuildSessionIndex(groups) };
}

function removeGroup(state: Pick<SessionRouterState, "activeGroupId" | "groups" | "sessionIndex">, groupId: string) {
  const groups = { ...state.groups };
  delete groups[groupId];
  return { activeGroupId: state.activeGroupId === groupId ? null : state.activeGroupId, groups, sessionIndex: rebuildSessionIndex(groups) };
}

/* 组内布局归约复用 SplitLayout 的归约（原 lTt/uTt/dTt/fTt 基于 r2/n2/pwt） */

function focusGroupPane(group: WorkbenchGroup, paneId: string, updatedAt: number = Date.now()): WorkbenchGroup {
  const next = reduceFocusPane(group, paneId);
  return next === group ? group : { ...group, focusedPaneId: next.focusedPaneId, updatedAt };
}

/** 原 C2：PaneBinding → SessionBinding（sessionId 必须是字符串；对应原校验） */
function toSessionBinding(binding: PaneBinding | undefined | null): SessionBinding | null {
  if (!binding || typeof binding.sessionId !== "string") return null;
  return {
    workspaceScope: binding.workspaceScope,
    sessionId: binding.sessionId,
    ...(binding.readOnly ? { readOnly: true } : {}),
    ...(binding.restoredUnvalidated ? { restoredUnvalidated: true } : {}),
  };
}

function splitGroupPane(group: WorkbenchGroup, anchorPaneId: string, side: "left" | "right" | "up" | "down", binding: SessionBinding, updatedAt: number = Date.now()): WorkbenchGroup {
  if (groupHasBinding(group, binding) || !canAddPane(group)) return group;
  const next = reduceSplitWithBinding(group, anchorPaneId, side, binding);
  if (next === group) return group;
  const panes: Record<string, SessionBinding> = {};
  for (const [paneId, item] of Object.entries(next.panes)) {
    const converted = toSessionBinding(item);
    if (converted) panes[paneId] = converted;
  }
  return { ...group, root: next.root, panes, focusedPaneId: next.focusedPaneId, updatedAt };
}

function closeGroupPane(group: WorkbenchGroup, paneId: string, updatedAt: number = Date.now()): WorkbenchGroup | null {
  if (paneId === PRIMARY_PANE_ID) return null;
  const next = reduceClosePane(group, paneId);
  if (next === group) return group;
  const panes: Record<string, SessionBinding> = {};
  for (const [paneId2, item] of Object.entries(next.panes)) {
    const converted = toSessionBinding(item);
    if (converted) panes[paneId2] = converted;
  }
  const candidate = { ...group, root: next.root, panes, focusedPaneId: next.focusedPaneId, updatedAt };
  return paneCount(candidate) < 2 ? null : candidate;
}

function confirmGroupRestoredPane(group: WorkbenchGroup, paneId: string): WorkbenchGroup {
  if (paneId === PRIMARY_PANE_ID) {
    if (!group.primaryBinding.restoredUnvalidated) return group;
    const { restoredUnvalidated: _drop, ...primaryBinding } = group.primaryBinding;
    return { ...group, primaryBinding };
  }
  const binding = group.panes[paneId];
  if (!binding?.restoredUnvalidated) return group;
  const { restoredUnvalidated: _drop, ...rest } = binding;
  return { ...group, panes: { ...group.panes, [paneId]: rest } };
}

/** 原 sTt：以 primary + 一次分裂创建组 */
function createGroupFromSplit(primaryBinding: SessionBinding, binding: SessionBinding, side: "left" | "right" | "up" | "down", options: { id?: string; updatedAt?: number } = {}): WorkbenchGroup {
  const layout = reduceSplitWithBinding(INITIAL_SPLIT_LAYOUT, PRIMARY_PANE_ID, side, binding);
  const panes: Record<string, SessionBinding> = {};
  for (const [paneId, item] of Object.entries(layout.panes)) {
    const converted = toSessionBinding(item);
    if (converted) panes[paneId] = converted;
  }
  return {
    id: options.id ?? "group-1",
    primaryBinding,
    root: layout.root,
    panes,
    focusedPaneId: layout.focusedPaneId,
    updatedAt: options.updatedAt ?? Date.now(),
  };
}

/** 原 cTt：把现有分屏布局升格为组（所有非主窗格必须有绑定） */
function promoteLayoutToGroup(primaryBinding: SessionBinding, layout: LayoutCore, options: { id?: string; updatedAt?: number } = {}): WorkbenchGroup | null {
  const paneIds = collectPaneIds(layout.root);
  if (paneIds.length < 2 || !paneIds.includes(PRIMARY_PANE_ID)) return null;
  const panes: Record<string, SessionBinding> = {};
  for (const paneId of paneIds) {
    if (paneId === PRIMARY_PANE_ID) continue;
    const converted = toSessionBinding(layout.panes[paneId]);
    if (!converted) return null;
    panes[paneId] = converted;
  }
  return {
    id: options.id ?? "group-1",
    primaryBinding,
    root: layout.root,
    panes,
    focusedPaneId: effectiveFocusedPaneId(layout),
    updatedAt: options.updatedAt ?? Date.now(),
  };
}

/* --- 持久化（原 yTt/O2/k2/bTt/xTt/STt/CTt/wTt/TTt，js 122489–122618） --- */

function persistWorkbenchGroups(state: Pick<SessionRouterState, "activeGroupId" | "groups" | "sessionIndex">): void {
  if (!isGroupRoutingEnabled()) return;
  try {
    const storage = globalThis.localStorage;
    if (!storage) return;
    const groups = Object.fromEntries(
      Object.entries(state.groups).map(([groupId, group]) => {
        const { restoredUnvalidated: _dropPrimary, ...primaryBinding } = group.primaryBinding;
        const panes = Object.fromEntries(
          Object.entries(group.panes).map(([paneId, binding]) => {
            const { restoredUnvalidated: _dropPane, ...rest } = binding;
            return [paneId, rest];
          }),
        );
        return [groupId, { ...group, primaryBinding, panes }];
      }),
    );
    storage.setItem(
      WORKBENCH_GROUPS_STORAGE_KEY,
      JSON.stringify({ version: 1, activeGroupId: state.activeGroupId, groups, sessionIndex: state.sessionIndex }),
    );
  } catch {
    /* 静默 */
  }
}

/** 原 TTt：从 localStorage 恢复（校验见原 CTt/STt/xTt；绑定一律标 restoredUnvalidated） */
function restoreWorkbenchGroups(): Pick<SessionRouterState, "activeGroupId" | "groups" | "sessionIndex"> | null {
  if (!isGroupRoutingEnabled()) return null;
  try {
    const storage = globalThis.localStorage;
    if (!storage) return null;
    const raw = storage.getItem(WORKBENCH_GROUPS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { activeGroupId?: unknown; groups?: unknown };
    if (typeof parsed !== "object" || parsed === null) return null;
    const rawGroups = typeof parsed.groups === "object" && parsed.groups !== null ? Object.values(parsed.groups as Record<string, unknown>) : [];
    const groups: Record<string, WorkbenchGroup> = {};
    const sessionIndex: Record<string, string> = {};
    for (const rawGroup of rawGroups) {
      const group = parsePersistedGroup(rawGroup);
      if (!group || groups[group.id]) continue;
      const keys = groupBindings(group).map(bindingKey);
      if (keys.some((key) => sessionIndex[key])) continue;
      groups[group.id] = group;
      for (const key of keys) sessionIndex[key] = group.id;
    }
    if (Object.keys(groups).length === 0) return null;
    return {
      activeGroupId: typeof parsed.activeGroupId === "string" && groups[parsed.activeGroupId] ? parsed.activeGroupId : null,
      groups,
      sessionIndex,
    };
  } catch {
    return null;
  }
}

function parsePersistedGroup(raw: unknown): WorkbenchGroup | null {
  if (typeof raw !== "object" || raw === null) return null;
  const candidate = raw as { id?: unknown; primaryBinding?: unknown; root?: unknown; panes?: unknown; focusedPaneId?: unknown; updatedAt?: unknown };
  if (typeof candidate.id !== "string") return null;
  const primaryBinding = parsePersistedSessionBinding(candidate.primaryBinding);
  const root = parsePersistedNode(candidate.root);
  if (!primaryBinding || !root) return null;
  const paneIds = collectPaneIds(root);
  if (new Set(paneIds).size !== paneIds.length || !paneIds.includes(PRIMARY_PANE_ID) || paneIds.length > MAX_PANE_COUNT) return null;
  const rawPanes = typeof candidate.panes === "object" && candidate.panes !== null ? (candidate.panes as Record<string, unknown>) : {};
  const panes: Record<string, SessionBinding> = {};
  for (const paneId of paneIds) {
    if (paneId === PRIMARY_PANE_ID) continue;
    const binding = parsePersistedSessionBinding(rawPanes[paneId]);
    if (!binding) return null;
    panes[paneId] = binding;
  }
  const focusedPaneId = typeof candidate.focusedPaneId === "string" && paneIds.includes(candidate.focusedPaneId) ? candidate.focusedPaneId : PRIMARY_PANE_ID;
  const group: WorkbenchGroup = {
    id: candidate.id,
    primaryBinding,
    root,
    panes,
    focusedPaneId,
    updatedAt: typeof candidate.updatedAt === "number" ? candidate.updatedAt : 0,
  };
  return paneCount(group) < 2 ? null : group;
}

function parsePersistedSessionBinding(raw: unknown): SessionBinding | null {
  if (typeof raw !== "object" || raw === null) return null;
  const candidate = raw as { sessionId?: unknown; workspaceScope?: unknown; readOnly?: unknown };
  if (typeof candidate.sessionId !== "string" || candidate.readOnly === true) return null;
  const scope = parsePersistedScope(candidate.workspaceScope);
  return scope ? { workspaceScope: scope, sessionId: candidate.sessionId, restoredUnvalidated: true } : null;
}

export const useSessionRouterStore: UseBoundStore<SessionRouterState> = createStore<SessionRouterState>((set, get) => ({
  ...INITIAL_ROUTER_STATE,
  configureClientMode: (mode) => {
    if (mode === "web-remote-replayable") {
      clientMode = mode;
      hydratedFromStorage = false;
      set(INITIAL_ROUTER_STATE);
      return;
    }
    clientMode = mode;
    if (hydratedFromStorage) return;
    hydratedFromStorage = true;
    const restored = restoreWorkbenchGroups();
    if (restored) set(restored);
  },
  openSessionFromSidebar: (binding) => {
    if (!isGroupRoutingEnabled()) return;
    set((state) => {
      const groupId = state.sessionIndex[bindingKey(binding)];
      if (!groupId) return state.activeGroupId === null ? state : { ...state, activeGroupId: null };
      const group = state.groups[groupId];
      if (!group) return { ...state, activeGroupId: null };
      const paneId = paneIdForGroupBinding(group, binding);
      if (!paneId) return state;
      return upsertGroup({ ...state, activeGroupId: groupId }, focusGroupPane(group, paneId));
    });
  },
  splitSessionIntoGroup: (anchorPaneId, side, binding, primaryBinding) => {
    if (!isGroupRoutingEnabled()) return;
    set((state) => {
      const key = bindingKey(binding);
      if (state.sessionIndex[key]) return state;
      const active = state.activeGroupId ? state.groups[state.activeGroupId] : undefined;
      if (active) {
        const next = splitGroupPane(active, anchorPaneId, side, binding);
        return next === active ? state : upsertGroup(state, next);
      }
      if (!primaryBinding || sameBinding(primaryBinding, binding) || state.sessionIndex[bindingKey(primaryBinding)]) return state;
      return upsertGroup(state, createGroupFromSplit(primaryBinding, binding, side, { id: nextGroupId(state.groups) }));
    });
  },
  promotePaneLayoutToGroup: (primaryBinding, layout) => {
    if (!isGroupRoutingEnabled()) return false;
    const state = get();
    const group = promoteLayoutToGroup(primaryBinding, layout, { id: nextGroupId(state.groups) });
    if (!group) return false;
    const keys = groupBindings(group).map(bindingKey);
    if (new Set(keys).size !== keys.length || keys.some((key) => !!state.sessionIndex[key])) return false;
    set(upsertGroup(state, group));
    return true;
  },
  focusPane: (groupId, paneId) => {
    if (!isGroupRoutingEnabled()) return;
    set((state) => {
      const group = state.groups[groupId];
      if (!group) return state;
      const next = focusGroupPane(group, paneId);
      return next === group && state.activeGroupId === groupId ? state : upsertGroup({ ...state, activeGroupId: groupId }, next);
    });
  },
  closePane: (groupId, paneId) => {
    if (!isGroupRoutingEnabled()) return;
    set((state) => {
      const group = state.groups[groupId];
      if (!group) return state;
      const next = closeGroupPane(group, paneId);
      if (next) return next === group ? state : upsertGroup(state, next);
      return removeGroup(state, groupId);
    });
  },
  confirmRestoredPaneSession: (groupId, paneId) => {
    if (!isGroupRoutingEnabled()) return;
    set((state) => {
      const group = state.groups[groupId];
      if (!group) return state;
      const next = confirmGroupRestoredPane(group, paneId);
      return next === group ? state : upsertGroup(state, next);
    });
  },
  bindPaneSession: (groupId, paneId, sessionId) => {
    if (!isGroupRoutingEnabled()) return;
    set((state) => {
      const group = state.groups[groupId];
      const existing = group ? bindingForPane(group, paneId) : null;
      if (!group || !existing || existing.sessionId === sessionId) return state;
      const nextBinding: SessionBinding = {
        workspaceScope: existing.workspaceScope,
        sessionId,
        ...(existing.readOnly ? { readOnly: true } : {}),
      };
      const nextKey = bindingKey(nextBinding);
      const owner = state.sessionIndex[nextKey];
      if ((owner && owner !== groupId) || (owner === groupId && !sameBinding(existing, nextBinding))) return state;
      return upsertGroup(
        state,
        paneId === PRIMARY_PANE_ID
          ? { ...group, primaryBinding: nextBinding, updatedAt: Date.now() }
          : { ...group, panes: { ...group.panes, [paneId]: nextBinding }, updatedAt: Date.now() },
      );
    });
  },
  setSplitRatio: (groupId, splitId, ratio) => {
    if (!isGroupRoutingEnabled()) return;
    set((state) => {
      const group = state.groups[groupId];
      if (!group) return state;
      const next = reduceSetSplitRatio(group, splitId, ratio);
      return next.root === group.root ? state : upsertGroup(state, { ...group, root: next.root, updatedAt: Date.now() });
    });
  },
  isSessionGrouped: (scope, sessionId) => (!isGroupRoutingEnabled() || !sessionId ? false : !!get().sessionIndex[sessionKeyOf(scope, sessionId)]),
  getActiveContext: () => {
    if (!isGroupRoutingEnabled()) return null;
    const state = get();
    const group = state.activeGroupId ? state.groups[state.activeGroupId] : undefined;
    return group ? focusedGroupBinding(group) : null;
  },
  deactivateActiveGroup: () => {
    if (!isGroupRoutingEnabled()) return;
    set((state) => (state.activeGroupId === null ? state : { ...state, activeGroupId: null }));
  },
  resetWorkbenchGroups: () => {
    set(INITIAL_ROUTER_STATE);
  },
}));

useSessionRouterStore.subscribe((state) => {
  if (isGroupRoutingEnabled()) persistWorkbenchGroups(state);
});
