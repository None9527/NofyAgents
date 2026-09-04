/* eslint-disable */
/**
 * ============================================================================
 * services.tsx — ZCode 3.7.6 横切层 · services/IPC 客户端 + 工具块（D8 Stage B）
 * ============================================================================
 *
 * 来源文件（融合 chunk，213,979 行，未改动）：
 *   /Users/mac/nofy-build/desktop/src/out/renderer/assets/styles-CdEGpc2x.js
 * 行号口径：本文件行号 = 上述本机 chunk 行（闭区间）。★旧账 213,695 行口径之偏移随区而异（实测 +46 / +48 / +290，见 QuickPickDeep@13-15 与 FileTreePanel@18）→ 不得以单一全局偏移机械换算，每区须独立以 word-boundary 定义扫描实测；模块地图见同目录 MODULE-MAP.md §2.2/§2.6。
 *
 * 本文件内容（混淆名 → 语义名 → js 行）：
 *  A. 事件/可释放原语（3551–3882）
 *     Os→Event 工具（None/once/toPromise/filter/map）| Koe/qoe→toDisposable/onceFn |
 *     ks→Emitter | As→VSBuffer | Yoe→BufferReader | js→BufferWriter |
 *     Ms/Ns→readVarint/writeVarint | Ps→ValueType | Rs/zs→serializeValue/deserializeValue |
 *     tse/nse→toBase64/fromBase64 | rse→isFlowControlMessage
 *  B. MessagePort 流客户端 + RPC 通道（3883–4139）
 *     ise→MessagePortStreamProtocol | Bs→ClientMessageType | Vs→ServerMessageType |
 *     Hs→ChannelState | ase→ChannelClient | Us→ServiceProxy（fromService/toService）|
 *     Ws/Gs→isEventName/isDynamicEventName | ose→bufferFirstListenerEvent
 *  C. 服务注册与钩子（2671–2681〔★A1-R161 勘误：旧记 2638–2660 误，真值 us@2671 / ds@2672 / fs@2675 / ps@2680〕 + 4140–4431 + 4814–4993〔★A1-R162 勘误：旧记 4122–4308 + 4834–4960 误—14 符越界，且旧第二带下段 4122–4139 实属 B 节；逐符表见报告〔A1-R162〕〕）
 *     ds/fs/ps→ServiceProvider/useServices/useServicesOptional |
 *     Zs 会话注册表（见 stores-core.tsx）+ xse/Sse/Qs/$s/Cse/ec/wse/tc/Tse 助手 |
 *     qs/lse/vse/Ys/hse/gse/_se→provider registry 同步 |
 *     xc/Sc→远端断开错误 | Use/wc→断开占位服务 | Wse/Gse/Tc/Kse→解析助手 |
 *     Ec/qse→useBaseServices | Dc→useResolvedWorkspaceServices | Oc→useWorkspaceServices |
 *     gc/_c/vc/yc/Hse/bc→远端会话解析
 *  D. 工作区文件/路径服务钩子群（24015–25006）
 *     rge→useGlobalKeyboardShortcuts | sge/fge/Dg/Og/gge/_ge/vge/yge/bge/kg→
 *       任务快照缓存（键 zcode-task-snapshot-cache:v1）| Sge/Cge/wge→
 *       useWorkspaceProviderConfigFile | Ag→useSessionService
 *  E. 工作区作用域 context（42597–42813）
 *     gT/_T/vT/_Fe/xT/vFe/yFe/bFe→遥测监督注册表 |
 *     ST/CT/xFe/wT/SFe→TelemetryScope provider/钩子（服务作用域）|
 *     TT/CFe/wFe/ET→V4Conversation provider/钩子（工作区作用域）|
 *     DT/TFe→面板作用域 provider
 *  F. 会话遥测监督（41808–42596）
 *     uT→BoundedStringSet | lT/sFe/cFe→容量常量 |
 *     dT/fT/pT/fFe/pFe/mFe/mT→fact 助手 | hT→ConversationTelemetrySupervisor
 *     （注：MODULE-MAP §2.6 称之为“权限状态机”；按实现更正为会话遥测/归因监督器，
 *      其处理 permission.lifecycle 事实仅为其中一支）
 *  G. 命令队列运行时（32246–36438）
 *     ux/dx→任务未读通知去重 | v4 会话协议 zod schema（qOe 队列项：
 *     steer/dispatch/admittedAt/provenance 等）| Yke→会话命令 schema 表 |
 *     bS→FrameAssembler（流帧装配，15 种 proto.frameAssembly* 故障码）|
 *     XAe→SessionIndexStore（v4-sessions-index 订阅/恢复状态机）|
 *     QAe→WorkspaceSubscriptionSet | VS/HS/BS→store 池
 * 〔★A1-R162 头注区间勘误汇总（以本机实束 213,979 行为唯一真值，逐符 word-boundary 定义扫描重定）：A/B/C/E 四节旧引区间皆短于其实测符号跨度——A 3551–3842→3551–3882（tse@3863 / nse@3874 / rse@3882 越界）、B 3843–4121→3883–4139（Us@4128 / Ws@4129 / Gs@4134 / ose@4139 越界）、E 42597–42806→42597–42813（DT@42809 / TFe@42813 越界）、C 见上；D 24015–25006（实测 24063–24368）/ F 41808–42596（实测 41809–41941）/ G 32246–36438（实测 32308–35455）三节实测无误不动。★结构性点：A/B/C 旧值係「连续不重叠分带」（3842|3843、4121|4122）而符号定义不尊重该分割（A 之尾三符落 B 带内、B 之尾四符落 C 带内）→ 修正係**移分界**而非延上界；移后三带仍连续不重叠且每符皆落其所属节（已逐符验：B 首符 ise@3891 在 3882 之后、C 第二带首符 qs@4170 在 4139 之后）。★G 節 `v4` 系**协议版本标签非束符**（束内 v4@130164 係 `function v4(e,t="Assertion error")` 断言助手，假阳性）。工具 /tmp/a1r0/r162-header-audit3.py〕
 * 外部依赖：React（Q）、logger（J）、zod（K，src-HCld2afU.js）、
 *   stores-core.tsx（SessionRegistryStore）、TabStore（F04 域，声明级）。
 *
 * 〔A0-S4-5：A–G 全部服务单元已逐字迁 ../services/（eventPrimitives/ipcBridge/
 *   serviceContext/sessionRegistry/providerRegistrySync/remoteServices/
 *   workspaceServiceHooks/telemetryScopes/conversationTelemetry/
 *   commandQueueProtocol/sessionIndex）；本文件为薄 re-export shim，导出面不变；
 *   原导入块逐字保留以保外部模块求值序；导入方零改动〕
 * ============================================================================
 */

import * as React from "react";
import {
  useSessionRegistryStore,
  getSessionById,
  serviceGeneration,
  type BaseServices,
  type RegisteredSession,
  type ResolvedBaseServices,
} from "./stores-core";
import { createConversationTransport } from './FeedbackCenter';
import { INITIAL_SESSION_INDEX_STATE, RUNTIME_RESTART_BASE_DELAY_MS, RUNTIME_RESTART_MAX_DELAY_MS, RUNTIME_RESTART_RESET_MS, SUBSCRIBE_RETRY_BACKOFF_MS, applyFrameToIndexState, isDormantSubscribeError, isTransientSubscribeError, type SessionIndexRow } from './QuickPickDeep';
import { logger } from './SkillStore';
import { SessionSnapshotSchema, crc32Hex } from './SrcSharedB';
import { buildCompactionDetail, buildMessageCompletionDetail, buildPromptSeedDetail, clearConversationWaitState, currentConversationModel, extractPromptSeedFromTurnStarted, extractStepSourceDetail, finalizeConversationSteps, lastReportedMessageId, purgeConversationTiming, purgePromptSeedTiming, recordComposerFocusSink, recordComposerTextChangeSink, recordConversationResult, recordDuration, recordModelRequestStatus, recordPermissionRequested, recordPermissionResolved, recordProviderTtft, recordStreamChunkForeground, recordSubagentToolAttribution, recordToolPerformance, recordTtft, recordTurnStarted, recordUsageDelta, reportTelemetry, reportVisibleChatErrorSink, resolveBusinessRecoveryAction, resolveCompactionModelName } from './StoresDeep';
import { resolveWorkspaceKey as workspaceKey } from './SkillStore'; // 原 Io
import { automationsWorkspaceKey as providerSyncScopeKey, ZCODE_AGENT_PROVIDER_NOT_READY as PROVIDER_NOT_READY_CODE } from './SrcSharedB'; // 原 Ti | 原 Hr
import { extractErrorInfo as normalizeRpcError } from './SrcSharedA'; // 原 it
import { ConversationDataLayer as ConversationLayer, acquireConversationDataLayer as leaseConversationTransport } from './FeedbackCenter'; // 原 mw/_w | 原 mNe
import { unsubscribeTransportSafe as unsubscribeTransport } from './QuickPickDeep'; // 原 IS
import type { AgentServiceV4, AttachmentPutInput, AttachmentPutOptions } from './FeedbackCenter';
import type { TelemetryPlatform, TelemetryReport, TurnStartedFact } from './StoresDeep';
export type { TelemetryPlatform, TelemetryReport };

/* 原 Io/Ti/Hr/it 已接线（SkillStore.resolveWorkspaceKey；SrcSharedB.automationsWorkspaceKey/
   ZCODE_AGENT_PROVIDER_NOT_READY；SrcSharedA.extractErrorInfo；别名见文件头 import） */

/* ─────────────────────────── A0-S4-5 shim ───────────────────────────
 * A–G 全部服务单元已原样迁入 ../services/（见上方头块注记）；本文件保留
 * B5 头块、原导入块与导出面，全部导入方零改动。
 * ──────────────────────────────────────────────────────────────────── */

import { onceDispose, toDisposable, EventUtil, CancellationToken, Emitter, VSBuffer, BufferReader, BufferWriter, readVarint, ValueType, serializeValue, deserializeValue, toBase64, fromBase64, isFlowControlMessage } from '../services/eventPrimitives';
import type { Disposable, EventListener, Event, EmitterOptions } from '../services/eventPrimitives';
export { onceDispose, toDisposable, EventUtil, CancellationToken, Emitter, VSBuffer, BufferReader, BufferWriter, readVarint, ValueType, serializeValue, deserializeValue, toBase64, fromBase64, isFlowControlMessage };
export type { Disposable, EventListener, Event, EmitterOptions };
import { MessagePortStreamProtocol, ClientMessageType, ServerMessageType, ChannelState, ChannelClient, isEventName, isDynamicEventName, ServiceProxy, createRemoteServiceProxy } from '../services/ipcBridge';
import type { FlowState, CancellationTokenLike, Channel, ServiceChannel } from '../services/ipcBridge';
export { MessagePortStreamProtocol, ClientMessageType, ServerMessageType, ChannelState, ChannelClient, isEventName, isDynamicEventName, ServiceProxy, createRemoteServiceProxy };
export type { FlowState, CancellationTokenLike, Channel, ServiceChannel };
import { ServiceProvider, useServices, useServicesOptional } from '../services/serviceContext';
export { ServiceProvider, useServices, useServicesOptional };
import { registerBaseServices, registerRemoteSession, bindSessionWorkspacePath, unbindSessionWorkspacePath, bindSessionWorkspaceIdentity, unbindSessionWorkspaceIdentity, getSessionServicesByWorkspaceIdentity } from '../services/sessionRegistry';
export { registerBaseServices, registerRemoteSession, bindSessionWorkspacePath, unbindSessionWorkspacePath, bindSessionWorkspaceIdentity, unbindSessionWorkspaceIdentity, getSessionServicesByWorkspaceIdentity };
import { markAllProviderSyncPending, purgeProviderSyncState, purgeProviderSyncStates, syncProviderRegistryAndReturn, unregisterSessionAndPurgeSyncState } from '../services/providerRegistrySync';
import type { ProviderRegistrySyncArgs, ProviderRegistrySyncResult } from '../services/providerRegistrySync';
export { markAllProviderSyncPending, purgeProviderSyncState, purgeProviderSyncStates, syncProviderRegistryAndReturn, unregisterSessionAndPurgeSyncState };
export type { ProviderRegistrySyncArgs, ProviderRegistrySyncResult };
import { REMOTE_WORKSPACE_DISCONNECTED, isRemoteDisconnectedError, getDisconnectedServices, useResolvedRemoteSessionId, useBaseServices, useBaseServicesOptional, useResolvedWorkspaceServices, useWorkspaceServices } from '../services/remoteServices';
import type { WorkspaceTabLike, ConnectionKind, ResolvedWorkspaceServices } from '../services/remoteServices';
export { REMOTE_WORKSPACE_DISCONNECTED, isRemoteDisconnectedError, getDisconnectedServices, useResolvedRemoteSessionId, useBaseServices, useBaseServicesOptional, useResolvedWorkspaceServices, useWorkspaceServices };
export type { WorkspaceTabLike, ConnectionKind, ResolvedWorkspaceServices };
import { useGlobalKeyboardShortcuts, useCachedTaskService, PATH_STATE_DEFAULT, useWorkspaceProviderConfigFile, useSessionService, useTaskNativeSessionLogFile, useTaskSessionFilePath } from '../services/workspaceServiceHooks'; // 〔A1-P2-B10〕+两件会话文件路径钩（原 qge/Xge）
import type { GlobalShortcutHandlers, PathState } from '../services/workspaceServiceHooks';
export { useGlobalKeyboardShortcuts, useCachedTaskService, PATH_STATE_DEFAULT, useWorkspaceProviderConfigFile, useSessionService, useTaskNativeSessionLogFile, useTaskSessionFilePath };
export type { GlobalShortcutHandlers, PathState };
import { isSameTelemetryScope, disposeAllSupervisors, detachSupervisorWorkspaces, TelemetryScopeProvider, InheritedTelemetryScopeProvider, useTelemetrySupervisor, useIsTelemetryForeground, V4ConversationProviderInner, V4ConversationProvider, useV4Conversation, PanelScopeProvider } from '../services/telemetryScopes';
import type { TelemetryScope, V4ConversationApi } from '../services/telemetryScopes';
export { isSameTelemetryScope, disposeAllSupervisors, detachSupervisorWorkspaces, TelemetryScopeProvider, InheritedTelemetryScopeProvider, useTelemetrySupervisor, useIsTelemetryForeground, V4ConversationProviderInner, V4ConversationProvider, useV4Conversation, PanelScopeProvider };
export type { TelemetryScope, V4ConversationApi };
import { BoundedStringSet, ConversationTelemetrySupervisor } from '../services/conversationTelemetry';
import type { AgentFact, TokenUsage } from '../services/conversationTelemetry';
export { BoundedStringSet, ConversationTelemetrySupervisor };
export type { AgentFact, TokenUsage };
import { subscribeUnreadNotifications, getUnreadNotificationVersion, bumpUnreadNotificationVersion, notifyTaskUnreadChange, useUnreadNotificationVersion, applyRowDelta, protocolLimits, FrameAssembler } from '../services/commandQueueProtocol'; // 〔A1-R49〕+bumpUnreadNotificationVersion（原 sx，styles 32290；A1-P3-B10 §2-4 申请受理补导出）
import type { QueueDelivery, QueueOrder, QueueSteer, QueueDispatch, QueueAttachmentRef, QueueItem, SessionPhase, AvailabilityFlag, SessionControl, SessionAvailability, InputRouting, SessionQueue, PendingInteraction, PendingCommand, BackgroundWork, SessionSnapshot, SessionStatePatch, SessionRowOp, SessionCommandMap, FrameDeliveryKind, LogicalFrame, FrameAssemblyEvent, FrameAssemblyFault } from '../services/commandQueueProtocol';
export { subscribeUnreadNotifications, getUnreadNotificationVersion, bumpUnreadNotificationVersion, notifyTaskUnreadChange, useUnreadNotificationVersion, applyRowDelta, protocolLimits, FrameAssembler }; // 〔A1-R49〕+bumpUnreadNotificationVersion（原 sx 转导出，供 QuickPickDeep bumpUnreadRevision 改指）
export type { QueueDelivery, QueueOrder, QueueSteer, QueueDispatch, QueueAttachmentRef, QueueItem, SessionPhase, AvailabilityFlag, SessionControl, SessionAvailability, InputRouting, SessionQueue, PendingInteraction, PendingCommand, BackgroundWork, SessionSnapshot, SessionStatePatch, SessionRowOp, SessionCommandMap, FrameDeliveryKind, LogicalFrame, FrameAssemblyEvent, FrameAssemblyFault };
import { SessionIndexStore, sessionIndexPoolKey, acquireSessionIndexStore, releaseSessionIndexStore, WorkspaceSubscriptionSet } from '../services/sessionIndex';
import type { SessionIndexEntry, SessionIndexState, SessionIndexStatus, SessionIndexTransport, SessionIndexScope } from '../services/sessionIndex';
export { SessionIndexStore, sessionIndexPoolKey, acquireSessionIndexStore, releaseSessionIndexStore, WorkspaceSubscriptionSet };
export type { SessionIndexEntry, SessionIndexState, SessionIndexStatus, SessionIndexTransport, SessionIndexScope };
