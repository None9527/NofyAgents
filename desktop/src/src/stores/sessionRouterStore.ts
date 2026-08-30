/* ============================================================================
 * sessionRouterStore.ts — A1-R3：薄 re-export shim（收敛至 modules/SplitLayoutDeep）
 * ============================================================================
 * 原 A0-S4-3 自成一体的 A2 重建（463 行）已被 A1-R2 的 B5 逐字重建取代：
 *   modules/SplitLayoutDeep.tsx（styles js 122309–122714，混淆名局部保留）。
 * 双 store 实例并存会造成运行期状态分裂（A0 实例 vs R2 实例），故本文件
 * 收敛为 shim：导出面不变（全部原名），实体唯一指向 SplitLayoutDeep。
 *
 * 原名 → SplitLayoutDeep 导出 对照：
 *   WORKBENCH_GROUPS_STORAGE_KEY ← ROUTER_STORAGE_KEY（nTt）
 *   isGroupRoutingEnabled        ← isWorkbenchRouterEnabled（y2）
 *   sessionKeyOf                 ← sessionBindingIndexKey（b2）
 *   focusedGroupBinding          ← focusedGroupBinding（E2）
 *   useSessionRouterStore        ← sessionRouterStore（A2；zustand create 结果
 *                                  兼作选择器钩子，与 bundle `A2(selector)` 用法一致）
 * 型别：
 *   SessionBinding ← SessionBinding | WorkbenchGroup ← SessionRouterGroup
 *   SessionRouterState ← SessionRouterStoreState
 *   ClientMode：本地型别别名（bundle _2/y2 字面量两面；R2 未单立此名）。
 * 环安全：同 stores/splitLayoutStore.ts 头注（单向依赖 SplitLayoutDeep，无成环）。
 * ==========================================================================*/

export {
  ROUTER_STORAGE_KEY as WORKBENCH_GROUPS_STORAGE_KEY,
  isWorkbenchRouterEnabled as isGroupRoutingEnabled,
  sessionBindingIndexKey as sessionKeyOf,
  focusedGroupBinding,
  sessionRouterStore as useSessionRouterStore,
} from '../modules/SplitLayoutDeep';
export type {
  SessionBinding,
  SessionRouterGroup as WorkbenchGroup,
  SessionRouterStoreState as SessionRouterState,
} from '../modules/SplitLayoutDeep';

/** bundle _2（初值 desktop-continuous）与 y2 判定面（web-remote-replayable）的两值型别。 */
export type ClientMode = `desktop-continuous` | `web-remote-replayable`;
