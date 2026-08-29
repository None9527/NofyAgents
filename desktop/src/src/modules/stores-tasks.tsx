/* eslint-disable */
/**
 * ============================================================================
 * stores-tasks.tsx — ZCode 3.7.6 横切层 zustand stores · 任务域（D8 Stage B）
 * ============================================================================
 *
 * 来源文件（融合 chunk，213,695 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js
 * 行号口径：融合 chunk js 行；模块地图见同目录 MODULE-MAP.md §2.1。
 * 本文件含 4 个 store：
 *
 *  # | 混淆名 | 语义名                    | js 行          | 归属族
 *  --|--------|---------------------------|----------------|--------
 * 10 | bX     | OffPeakTaskStore          | 91368–91590    | F15
 * 14 | T3     | AutomationsStore          | 134111–137004* | F15
 * 15 | E6     | PinnedTaskListStore       | 142372–142463  | F01
 * 16 | k6     | WorkspaceTaskListStore    | 142464–142753* | F01
 *
 *  * T3 store 本体 134111–134388（其后为自动化编辑器 UI）；k6 store 本体
 *    142464–142556（其后为任务行 UI）。
 *
 * 持久化键：四个 store 均无本地持久化（数据经服务来自宿主/远端）。
 *   相关但属于族层的键：zcode-default-group-off-peak / zcode-default-group-cron
 *   （自动化分组缺省名，F15 族内）。
 *
 * selectors 使用方（抽样）：
 *  bX：25 处 —— 91597–91602（off-peak 横幅 kit）、138859–138860（AutomationsMain d6）等
 *  T3：14 处 —— 138843–138851（AutomationsMain d6）等
 *  E6：2 处 —— 151805–151806（侧栏置顶段）
 *  k6：4 处 —— 152320–152323（侧栏时间线段）
 *
 * 〔A0-S4-3：4 个 store 实体已逐字迁 ../stores/（offPeakTaskStore/
 *   automationsStore/pinnedTaskListStore/workspaceTaskListStore）；
 *   §0 zustand 接口类型收敛 ../stores/storeTypes.ts（四份同形副本）；
 *   本文件为薄 re-export shim，导出面不变〕
 * ============================================================================
 */


/* 原 §0 zustand 接口类型已收敛 ../stores/storeTypes.ts（四份同形副本之一）。 */
export type { UseBoundStore } from '../stores/storeTypes';

import { t as logger } from './logger'; // 原 J（logger-PFDwl5Yq.js t 导出）
import { automationErrorMessage, findAutomation, isAutomationLimitError, isSameAutomationWorkspace, isTakeNumberFailure, loadAutomationsIntoStore } from './StoresDeep';
import { create as createStore, resolveWorkspaceKey as workspaceKey } from './SkillStore'; // 原 Ae | 原 Io
import { getSessionById as getRegisteredSession } from './stores-core'; // 原 tc
import type { Automation, OffPeakCreateResult } from './StoresDeep';
export type { Automation, OffPeakCreateResult };

/* ─────────────────────────── A0-S4-3 shim ───────────────────────────
 * 4 个 store 实体已原样迁入 ../stores/（见上方头块注记）；本文件保留
 * B5 头块与导出面，全部导入方零改动。
 * ──────────────────────────────────────────────────────────────────── */

import { useOffPeakTaskStore, OFF_PEAK_TEMPLATE_IDS } from '../stores/offPeakTaskStore';
import type { OffPeakTask, OffPeakGrayConfig, CodingPlanSupport, TakeNumberAvailability, OffPeakTaskService, CodingPlanSubscriptionService, OffPeakState } from '../stores/offPeakTaskStore';
import { useAutomationsStore } from '../stores/automationsStore';
import type { AutomationRun, AutomationsAgentService, AutomationsState } from '../stores/automationsStore';
import { usePinnedTaskListStore, refreshPinnedTasksForSession } from '../stores/pinnedTaskListStore';
import type { PinnedTask, ZCodeTaskService, PinnedTaskListState } from '../stores/pinnedTaskListStore';
import { sortTimelineTasks, useWorkspaceTaskListStore, refreshTimelineTasksForSession } from '../stores/workspaceTaskListStore';
import type { TimelineTask, WorkspaceTaskListState } from '../stores/workspaceTaskListStore';

export { useOffPeakTaskStore, OFF_PEAK_TEMPLATE_IDS };
export type { OffPeakTask, OffPeakGrayConfig, CodingPlanSupport, TakeNumberAvailability, OffPeakTaskService, CodingPlanSubscriptionService, OffPeakState };

export { useAutomationsStore };
export type { AutomationRun, AutomationsAgentService, AutomationsState };

export { usePinnedTaskListStore, refreshPinnedTasksForSession };
export type { PinnedTask, ZCodeTaskService, PinnedTaskListState };

export { sortTimelineTasks, useWorkspaceTaskListStore, refreshTimelineTasksForSession };
export type { TimelineTask, WorkspaceTaskListState };
