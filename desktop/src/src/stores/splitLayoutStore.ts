/* ============================================================================
 * splitLayoutStore.ts — A1-R3：薄 re-export shim（收敛至 modules/SplitLayoutDeep）
 * ============================================================================
 * 原 A0-S4-3 自成一体的 s2 重建（363 行）已被 A1-R2 的 B5 逐字重建取代：
 *   modules/SplitLayoutDeep.tsx（styles js 121373–121720，混淆名局部保留）。
 * 双 store 实例并存会造成运行期状态分裂（A0 实例 vs R2 实例），故本文件
 * 收敛为 shim：导出面不变（全部原名），实体唯一指向 SplitLayoutDeep。
 *
 * 原名 → SplitLayoutDeep 导出 对照：
 *   PRIMARY_PANE_ID              ← MAIN_PANE_ID（B0）
 *   PANE_LAYOUT_STORAGE_KEY      ← PANE_LAYOUT_STORAGE_KEY_V2（bwt）
 *   PANE_LAYOUT_LEGACY_STORAGE_KEY ← PANE_LAYOUT_STORAGE_KEY_V1（xwt）
 *   clampSplitRatio              ← clampSplitRatio（H0）
 *   workspaceScopeKey            ← workspaceScopeKey（U0）
 *   bindingMatchesSession        ← paneBindingMatchesSession（W0）
 *   INITIAL_SPLIT_LAYOUT         ← EMPTY_PANE_LAYOUT（K0）
 *   collectPaneIds               ← collectLeafPaneIds（q0）
 *   paneCount                    ← countLayoutPanes（J0）
 *   canAddPane                   ← canAddLayoutPane（Y0）
 *   containsPane                 ← layoutHasPaneId（X0）
 *   effectiveFocusedPaneId       ← focusedPaneId（Z0）
 *   findPaneIdBySession          ← findPaneIdBySessionInLayout（gwt）
 *   isRendererReload             ← isReloadNavigationEntry（z0）
 *   useSplitLayoutStore          ← splitLayoutStore（s2；zustand create 结果
 *                                  兼作选择器钩子，与 bundle `s2(selector)` 用法一致）
 * 型别：
 *   WorkspaceScope ← PaneWorkspaceScope | PaneBinding ← PaneBinding
 *   PaneTreeNode ← PaneNode | SplitLayoutState ← SplitLayoutStoreState
 * 环安全：本文件单向依赖 modules/SplitLayoutDeep；后者依赖
 *   stores/zustand、modules/{WorkspaceTabsDeep,logger,SrcSharedB}，均不反向
 *   import 本文件（全树 grep 核验），无成环。
 * ==========================================================================*/

export {
  MAIN_PANE_ID as PRIMARY_PANE_ID,
  PANE_LAYOUT_STORAGE_KEY_V2 as PANE_LAYOUT_STORAGE_KEY,
  PANE_LAYOUT_STORAGE_KEY_V1 as PANE_LAYOUT_LEGACY_STORAGE_KEY,
  clampSplitRatio,
  workspaceScopeKey,
  paneBindingMatchesSession as bindingMatchesSession,
  EMPTY_PANE_LAYOUT as INITIAL_SPLIT_LAYOUT,
  collectLeafPaneIds as collectPaneIds,
  countLayoutPanes as paneCount,
  canAddLayoutPane as canAddPane,
  layoutHasPaneId as containsPane,
  focusedPaneId as effectiveFocusedPaneId,
  findPaneIdBySessionInLayout as findPaneIdBySession,
  isReloadNavigationEntry as isRendererReload,
  splitLayoutStore as useSplitLayoutStore,
} from '../modules/SplitLayoutDeep';
export type {
  PaneWorkspaceScope as WorkspaceScope,
  PaneBinding,
  PaneNode as PaneTreeNode,
  SplitLayoutStoreState as SplitLayoutState,
} from '../modules/SplitLayoutDeep';
