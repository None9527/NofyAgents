/* ============================================================================
 * searchResultsStore.ts — 薄 re-export shim（A1-R9 双实例收敛）
 * ----------------------------------------------------------------------------
 * A0-S4-3 本文件原持并行 zustand 实例之一（Vo SearchResultsStore，自
 * modules/stores-session.tsx §2 迁入）。
 * A1-R8 普查：bundle 唯一 Vo（@1553）。树内两并行实例：
 *  - components/quickpick/QuickPick.tsx 1254 区（live：1745 行
 *    useSearchResultsStore(selectQueryResult(queryKey)) = bundle 35831–35833
 *    钩子簇；modules/QuickPick.tsx 176 行 re-export → QuickPickDeep.tsx 131
 *    行终端消费在案）；
 *  - 本文件 78 区（休眠：唯一引用面为 stores-session.tsx 74–79 行 import/
 *    re-export shim 链，零终端拉取；本文件 10 枚模块级助手同仅经
 *    stores-session 75–77/100–102 re-export 链，实测 grep 零终端消费者）。
 * 裁决：QuickPick 为 canonical——Vo 定义区（1553–1878）属主 + 唯一 live 实例。
 * R8 回滚原因 = 模块级助手型缝：helpers.TaskMeta.changeSummary string 面 vs
 * bundle 23754 对象真形。R9 先裁决该型缝——按 np@6874（TaskChangeSummarySchema
 * strict）/vg@23753/Bhe@23757 真形精化 stores/searchResultsHelpers.ts 面
 * （changeSummary 对象面 + lastError + __zcodeSessionActivity + phase 必填，
 * 宽化注在其文件），消费面（helpers 365/469 透传、taskStore 117 unknown 宽面）
 * 实测不破；型缝合拢后本文件降 shim，旧实例删除（原实现见 git 历史，
 * 检查点 34f0240）。
 * 导出面维系：useSearchResultsStore + selectQueryResult（← canonical 侧 Zie@1879
 * = QuickPick 1561）+ 9 枚模块级助手（原 Qie/Ho/$ie/eae/Uo/tae/nae/Wo/rae，
 * bundle 1881–1927；体逐字不变，getState 受主改指 canonical 实例）+
 * SearchResultsState 型（← canonical 面；旧本地接口删除，零结构消费者实测）——
 * stores-session.tsx 74–79/100–104 import/re-export 面逐一不破。
 * 环安全：本文件 → components/quickpick/QuickPick；QuickPick import 面
 * （ImeComposition/ModalsLeaves/SkillStore/StoresDeep/services/stores-core/
 * UtilsCn/I18n/button/UsageStatsUiParts/ui-dialog）实测不 import
 * stores-session、不反入本文件（本文件唯一 importer = stores-session）
 * → 新边无成环。
 * 同型先例：stores/confirmDialogStore.ts（A1-R6）、stores/alertDialogStore.ts（A1-R7）、
 * stores/codeCommentsStore.ts、stores/skillContextStore.ts、stores/offPeakTaskStore.ts（A1-R8）。
 * ==========================================================================*/

import { useSearchResultsStore, selectQueryResult } from '../components/quickpick/QuickPick';
import type { SearchResultsState } from '../components/quickpick/QuickPick';
import { broadcastSessionActivity as broadcastTaskListEvent } from './searchResultsHelpers'; // 原 Hie
import type { TaskMeta, WorkspaceScope } from './searchResultsHelpers';
import { resolveWorkspaceKey as workspaceKey } from './taskStore'; // 原 Io=U

export { useSearchResultsStore, selectQueryResult };
export type { SearchResultsState };

/* --- 模块级助手（原 Qie/Ho/$ie/eae/Uo/tae/nae/Wo/rae，js 1881–1927；Zie 见 canonical 侧） --- */

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

export function setSearchTaskUnreadOverlay(task: WorkspaceScope & { taskId: string }, unreadAt: number | null | undefined): void { // 〔A1-P2-B10〕参形 TaskMeta → 真 store 面（QuickPick@1211；bundle tae 1905 透传消费面）
  useSearchResultsStore.getState().setTaskUnreadOverlay(task, unreadAt);
}

export function reconcileSearchTaskUnread(task: WorkspaceScope & { taskId: string }, unreadAt: number | null | undefined): void { // 〔A1-P2-B10〕参形 TaskMeta → 真 store 面（QuickPick@1212；bundle nae 1908 透传消费面）
  useSearchResultsStore.getState().reconcileTaskUnread(task, unreadAt);
}

export function rollbackSearchTaskUnread(task: WorkspaceScope & { taskId: string }, unreadAt: number | null | undefined): void { // 〔A1-P2-B10〕参形 TaskMeta → 真 store 面 + unreadAt 宽化 null 支（QuickPick@1213；bundle Wo 1911 透传消费面）
  useSearchResultsStore.getState().rollbackTaskUnread(task, unreadAt);
}

/** 原 rae：删除任务并广播 deleted 事件。A1-R10 2b 精化：参型收至真形最小面
 *  （bundle 1914 仅读 taskId/workspacePath/workspaceIdentity；store removeTask 面 = WorkspaceScope & {taskId}；
 *  消费面 FileTreePanel sLt 2603 即传薄对象 {workspacePath, workspaceIdentity?, taskId}，bundle 146841 同证） */
export function removeSearchTask(task: WorkspaceScope & { taskId: string }): boolean {
  const removed = useSearchResultsStore.getState().removeTask(task);
  broadcastTaskListEvent({ type: "deleted", taskId: task.taskId, workspaceKey: workspaceKey(task.workspacePath, task.workspaceIdentity) });
  return removed;
}
