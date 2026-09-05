/* eslint-disable */
/**
 * ============================================================================
 * stores-session.tsx — ZCode 3.7.6 横切层 zustand stores · 会话/布局域（D8 Stage B）
 * ============================================================================
 *
 * 来源文件（融合 chunk，本机 213,979 行，未改动；旧账 213,695 行拷贝已不在本机，两版行号不同，本文件引证 vintage 逐条混杂、用前须以本机束重定〔A1-R163〕）：
 *   /Users/mac/nofy-build/desktop/src/out/renderer/assets/styles-CdEGpc2x.js
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
 *
 * 〔A0-S4-3：4+1 个 store 实体已逐字迁 ../stores/（trajectoryViewerStore/
 *   tuiEditRequestStore/searchResultsStore/splitLayoutStore/sessionRouterStore）；
 *   §0 zustand 接口类型收敛 ../stores/storeTypes.ts；本文件为薄 re-export shim，
 *   导出面不变；§3/§4 的顶层 subscribe 随单元迁出（求值序不变）〕
 * ============================================================================
 */

import * as React from "react";
import { t as logger } from './logger'; // 原 J（logger-PFDwl5Yq.js t 导出）
import { freezeQueryResult, mergeIncomingTaskKeys, taskEntityKey } from './StoresDeep';
import { create as createStore, resolveWorkspaceKey as workspaceKey } from './SkillStore'; // 原 Ae | 原 Io=U
import { mergeTaskMetaEntry as mergeTaskMeta, isQueryResultEquivalent as isQueryResultEqual, descriptorContainsTask as matchesDescriptor, sortTaskKeysByDescriptor as sortTaskKeys, pickBestTaskMetadata as pickPreferredMeta, mergeMetaPreservingActivity as mergeMeta, sessionActivityOf as isNewerMeta, broadcastSessionActivity as broadcastTaskListEvent } from './StoresDeep'; // 原 Jie | 原 Yie | 原 Kie | 原 Bo | 原 pe | 原 Po | 原 Mo | 原 Hie
import type { SearchDescriptor, QueryResult, QueryResultInput, TaskMeta } from './StoresDeep';
export type { SearchDescriptor, QueryResult, TaskMeta };

/* 原 §0 zustand 接口类型已收敛 ../stores/storeTypes.ts（四份同形副本之一）。 */
export type { UseBoundStore } from '../stores/storeTypes';

/** 任务实体键（原 Lo：`${workspaceKey}::${taskId}`） */
/* ── tombstone〔A1-R183〕死界面普查批第三批：export interface WorkspaceTab（9 行）连同其上方单行群注（1 行）纯删，10 行等行墓碑在原位。
 *    ★带 export 故四路独立核验：本文件代码位读者 0／直接导入方 5 家中拉取该 specifier 者 0／裸 export 块载该名者 0／传递再导出跳（迭代至不动点）可达者 0 ⇒ 死。
 *    折入之上方的注原文「侧面板标签页 store（原 pc useTabStore / oc isWorkspaceTab，F04 域；此处为外部依赖声明）」係覆盖「本界面 + 已随〔A1-R165〕退役之 isWorkspaceTab declare」之**群注**、其 referent 今无活体成员 ⇒ 按〔A1-R176〕判据折入本碑，束源标注「原 pc useTabStore / oc isWorkspaceTab，F04 域；此处为外部依赖声明」逐字保留。
 *    ★再上一行 @52「任务实体键（原 Lo：…）」係**另一孤儿注**——其 referent 之 declare 自 A0 检查点 7040546 起即不在树内、与本界面无关 ⇒ 必须存活、不得折入，已断言逐字节未变；登记为既存陈旧、不归因本批亦不放过。
 *    同名定义站WorkspaceTab 施前全树 8 家、本批销 1 家 ⇒ 施后余 7 家（导出家 3 处（components/onboarding/OnboardingLoginLeaves.tsx@708／components/shell/Home.tsx@1232／modules/WorkspaceTabsDeep.tsx@122））；代码位真读者 48 处**皆属他家**（活体读者最密者＝canonical）。
 *    ★本件係判据 (b) 修至 v7 后新揭之二面之一（另一面 modules/SettingsLeaves ToastOptions@153-161）；v6 基线 146 面／990 行／46 文件係低报，v7 真值 148 面／1008 行／48 文件。
 *    ★本件係判据 (b) 修至 v7 后新揭之二面之一（另一面 modules/SettingsLeaves ToastOptions@153-161）；v6 基线 146 面／990 行／46 文件係低报，v7 真值 148 面／1008 行／48 文件。
 *    ★本件係判据 (b) 修至 v7 后新揭之二面之一（另一面 modules/SettingsLeaves ToastOptions@153-161）；v6 基线 146 面／990 行／46 文件係低报，v7 真值 148 面／1008 行／48 文件。
 *    ★本件係判据 (b) 修至 v7 后新揭之二面之一（另一面 modules/SettingsLeaves ToastOptions@153-161）；v6 基线 146 面／990 行／46 文件係低报，v7 真值 148 面／1008 行／48 文件。
 *    净零行：本碑 10 行置换原 10 行，文件行数 119 不变、零重锚。 ── */
/* ── tombstone〔A1-R165〕死桩销账：isWorkspaceTab（本文件零消费点、未导出、全树零导入者）；canonical = modules/WorkspaceTabsDeep.tsx::isWorkspaceKindTab，他文件以别名导入而本桩从未接线 ── */

/* ─────────────────────────── A0-S4-3 shim ───────────────────────────
 * 4+1 个 store 实体已原样迁入 ../stores/（见上方头块注记）；本文件保留
 * B5 头块与导出面，全部导入方零改动。
 * ──────────────────────────────────────────────────────────────────── */

import { useTrajectoryViewerStore, useTrajectoryOpenRequest } from '../stores/trajectoryViewerStore';
import type { TrajectoryOpenRequest, TrajectoryViewerState } from '../stores/trajectoryViewerStore';
import { useTuiEditRequestStore, useTuiEditPendingRequest, useTuiEditOpenRequest } from '../stores/tuiEditRequestStore';
import type { TuiEditOpenRequest, TuiEditRequestState } from '../stores/tuiEditRequestStore';
import {
  useSearchResultsStore, selectQueryResult, invalidateWorkspaceResults, markWorkspaceResultsStale,
  upsertSearchTaskMeta, updateSearchTaskMetaPreservingMembership, applySearchTaskMutation,
  setSearchTaskUnreadOverlay, reconcileSearchTaskUnread, rollbackSearchTaskUnread, removeSearchTask,
} from '../stores/searchResultsStore';
import type { SearchResultsState } from '../stores/searchResultsStore';
import {
  PRIMARY_PANE_ID, PANE_LAYOUT_STORAGE_KEY, PANE_LAYOUT_LEGACY_STORAGE_KEY, clampSplitRatio,
  workspaceScopeKey, bindingMatchesSession, INITIAL_SPLIT_LAYOUT, collectPaneIds, paneCount,
  canAddPane, containsPane, effectiveFocusedPaneId, findPaneIdBySession, isRendererReload,
  useSplitLayoutStore,
} from '../stores/splitLayoutStore';
import type { WorkspaceScope, PaneBinding, PaneTreeNode, SplitLayoutState } from '../stores/splitLayoutStore';
import {
  WORKBENCH_GROUPS_STORAGE_KEY, isGroupRoutingEnabled, sessionKeyOf, focusedGroupBinding,
  useSessionRouterStore,
} from '../stores/sessionRouterStore';
import type { SessionBinding, WorkbenchGroup, ClientMode, SessionRouterState } from '../stores/sessionRouterStore';

export { useTrajectoryViewerStore, useTrajectoryOpenRequest };
export type { TrajectoryOpenRequest, TrajectoryViewerState };

export { useTuiEditRequestStore, useTuiEditPendingRequest, useTuiEditOpenRequest };
export type { TuiEditOpenRequest, TuiEditRequestState };

export {
  useSearchResultsStore, selectQueryResult, invalidateWorkspaceResults, markWorkspaceResultsStale,
  upsertSearchTaskMeta, updateSearchTaskMetaPreservingMembership, applySearchTaskMutation,
  setSearchTaskUnreadOverlay, reconcileSearchTaskUnread, rollbackSearchTaskUnread, removeSearchTask,
};
export type { SearchResultsState };

export {
  PRIMARY_PANE_ID, PANE_LAYOUT_STORAGE_KEY, PANE_LAYOUT_LEGACY_STORAGE_KEY, clampSplitRatio,
  workspaceScopeKey, bindingMatchesSession, INITIAL_SPLIT_LAYOUT, collectPaneIds, paneCount,
  canAddPane, containsPane, effectiveFocusedPaneId, findPaneIdBySession, isRendererReload,
  useSplitLayoutStore,
};
export type { WorkspaceScope, PaneBinding, PaneTreeNode, SplitLayoutState };

export {
  WORKBENCH_GROUPS_STORAGE_KEY, isGroupRoutingEnabled, sessionKeyOf, focusedGroupBinding,
  useSessionRouterStore,
};
export type { SessionBinding, WorkbenchGroup, ClientMode, SessionRouterState };
