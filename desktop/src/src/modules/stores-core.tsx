/* eslint-disable */
/**
 * ============================================================================
 * stores-core.tsx — ZCode 3.7.6 横切层 zustand stores · 核心域（D8 Stage B）
 * ============================================================================
 *
 * 来源文件（融合 chunk，213,695 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js
 * 行号口径：全部为融合 chunk js 行（闭区间）；模块地图见同目录 MODULE-MAP.md §2.1。
 * 本文件是 stores 域拆分的第一部分（核心域），共 6 个 store：
 *
 *  # | 混淆名        | 语义名                    | js 行        | 归属族
 *  --|---------------|---------------------------|--------------|------------------
 *  1 | Mie 工厂/ko 钩子 | SettingsStore            | 1140–1286    | 横切（F06 消费）
 *  4 | Zs            | SessionRegistryStore      | 4309–4352    | 横切（F07 消费）
 *  6 | yC            | FeedbackStore             | 36992–37066  | F09
 *  8 | yH            | SelectionScopesStore      | 67554–67560  | F03
 * 13 | H2            | ConfirmDialogStore        | 123480–123492| F09
 * 20 | N9            | AlertDialogStore          | 206514–206560| F09
 *
 * 〔A0-S4-3：6 个 store 实体 + §0 zustand 接口类型已逐字迁 ../stores/（storeTypes/
 *   settingsStore/sessionRegistryStore/feedbackStore/selectionScopesStore/
 *   confirmDialogStore/alertDialogStore）；本文件为薄 re-export shim，导出面不变〕
 *
 * ----------------------------------------------------------------------------
 * 外部依赖（跨 chunk 导入；与 TopBar.tsx 清单一致）
 * ----------------------------------------------------------------------------
 *  - `Ae` = zustand create（skillStore-BmeKHDBI.js 的 q 导出）
 *  - `ne` = useStoreWithSelector（skillStore-BmeKHDBI.js 的 J 导出）
 *  - `J`  = logger（logger-PFDwl5Yq.js 的 t 导出）
 *  - `He/We` = localStorage 读/写助手（本 chunk 内，IntlProvider 侧工具）
 *
 * ----------------------------------------------------------------------------
 * 持久化键（本文件 6 个 store 涉及）
 * ----------------------------------------------------------------------------
 *  SettingsStore:
 *    zcode-theme / zcode-locale / zcode-code-preview-settings /
 *    zcode-ui-font-size-px / zcode-performance-mode /
 *    zcode-notification-enabled / zcode-notification-sound-enabled
 *    跨窗口广播通道前缀 `state:`（theme/locale/uiFontSizePx 三字段，经
 *    broadcastService.send({channel:'state:<key>', payload}) 同步）
 *  FeedbackStore: zcode.feedback.contact（联系方式草稿，37091 的 xC）
 *  SessionRegistryStore: 无（纯内存注册表）
 *  Confirm/Alert/SelectionScopes: 无
 * ============================================================================
 */


/* ─────────────────────────── A0-S4-3 shim ───────────────────────────
 * 6 个 store 实体已原样迁入 ../stores/（见上方头块注记）；本文件保留
 * B5 头块与导出面，全部导入方零改动。
 * ──────────────────────────────────────────────────────────────────── */

import type { UseBoundStore } from '../stores/storeTypes';
import {
  applyUiFontSizePx, loadUiFontSizePx, watchUiFontSizeStorageChanges,
  createSettingsStore, SettingsStoreProvider, useSettingsStore, useSettingsStoreValue,
  isStartupSoundEnabled, // A1-R10 2a：Eie canonical（settingsStore yo/bo/Eie，js 1085–1091 逐字）再导出，供 AppRootLeaves 2604 消费
} from '../stores/settingsStore';
import type { ThemeId, CodePreviewSettings, LoginEntryRequest, LoginEntryAttempt, SettingsState, BroadcastService } from '../stores/settingsStore';
import {
  useSessionRegistryStore, serviceGeneration, registerBaseServices, registerRemoteSession,
  bindWorkspacePath, unbindWorkspacePath, bindWorkspaceIdentity, unbindWorkspaceIdentity,
  getSessionById, getServicesByWorkspaceIdentity,
} from '../stores/sessionRegistryStore';
import type { BaseServices, ResolvedBaseServices, RegisteredSession, SessionRegistryState } from '../stores/sessionRegistryStore';
import { useFeedbackStore, readFeedbackContact, clearFeedbackContact, writeFeedbackContact } from '../stores/feedbackStore';
import type { FeedbackSubmitPayload, FeedbackState } from '../stores/feedbackStore';
import { useSelectionScopesStore, getSelectionScope, updateSelectionScope } from '../stores/selectionScopesStore';
import type { SelectionScopeItem, SelectionScopesState } from '../stores/selectionScopesStore';
import { useConfirmDialogStore, useConfirmDialog } from '../stores/confirmDialogStore';
import type { ConfirmRequest, ConfirmRequestInput, ConfirmDialogState } from '../stores/confirmDialogStore';
import { useAlertDialogStore, useAlert } from '../stores/alertDialogStore';
import type { AlertRequest, AlertRequestInput, AlertDialogState } from '../stores/alertDialogStore';

export type { UseBoundStore };

/* 原 §0 zustand 接口类型已迁 ../stores/storeTypes.ts（四份同形副本收敛）。 */

/** localStorage 读/写（原 He/We；失败静默）— 已接线 intlProvider readLocalStorageItem/writeLocalStorageItem */

export {
  applyUiFontSizePx, loadUiFontSizePx, watchUiFontSizeStorageChanges,
  createSettingsStore, SettingsStoreProvider, useSettingsStore, useSettingsStoreValue,
  isStartupSoundEnabled,
};
export type { ThemeId, CodePreviewSettings, LoginEntryRequest, LoginEntryAttempt, SettingsState, BroadcastService };

export {
  useSessionRegistryStore, serviceGeneration, registerBaseServices, registerRemoteSession,
  bindWorkspacePath, unbindWorkspacePath, bindWorkspaceIdentity, unbindWorkspaceIdentity,
  getSessionById, getServicesByWorkspaceIdentity,
};
export type { BaseServices, ResolvedBaseServices, RegisteredSession, SessionRegistryState };
/** 原 Qs：注销会话（同时清除该工作区的 provider registry 同步状态，见 services.tsx） */
export declare function unregisterSessionAndPurgeSyncState(sessionId: string): void;

export { useFeedbackStore, readFeedbackContact, clearFeedbackContact, writeFeedbackContact };
export type { FeedbackSubmitPayload, FeedbackState };

export { useSelectionScopesStore, getSelectionScope, updateSelectionScope };
export type { SelectionScopeItem, SelectionScopesState };

export { useConfirmDialogStore, useConfirmDialog };
export type { ConfirmRequest, ConfirmRequestInput, ConfirmDialogState };

export { useAlertDialogStore, useAlert };
export type { AlertRequest, AlertRequestInput, AlertDialogState };
