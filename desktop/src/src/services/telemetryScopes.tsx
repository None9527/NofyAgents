// A0-S4-5: 自 modules/services.tsx §E 原样迁入（遥测监督注册表 + TelemetryScope/V4Conversation/面板作用域 provider，原 js 42597–42806；原文件现为薄 re-export shim）。
// 含 JSX → .tsx；监督器本体（§F）在 ./conversationTelemetry。
import * as React from "react";
import { createConversationTransport } from '../modules/FeedbackCenter';
import { ConversationDataLayer as ConversationLayer, acquireConversationDataLayer as leaseConversationTransport } from '../modules/FeedbackCenter'; // 原 mw/_w | 原 mNe
import type { AgentServiceV4, AttachmentPutInput, AttachmentPutOptions } from '../modules/FeedbackCenter';
import type { BaseServices } from '../modules/stores-core';
import type { TelemetryPlatform } from '../modules/StoresDeep';
import type { Disposable } from './eventPrimitives';
import { ServiceProvider } from './serviceContext';
import { useResolvedWorkspaceServices } from './remoteServices';
import { ConversationTelemetrySupervisor } from './conversationTelemetry';
import type { AgentFact } from './conversationTelemetry';
/* ============================================================================
 * E. 工作区作用域 context（原 42597–42806）
 * ==========================================================================*/

/* --- E.1 遥测监督注册表（原 gT/_T/vT + _Fe/xT/vFe/yFe/bFe） --- */

export interface TelemetryScope {
  workspacePath: string;
  /** A1-R3 宽化：string → string | null（与 PaneWorkspaceScope 对齐；本文件所有
   *  读取面均以 ?.trim()/?? 防御，零行为差；供 SplitLayoutUiDeep $wt 传入面） */
  workspaceIdentity?: string | null;
  remoteSessionId?: string;
}

interface SupervisorEntry {
  key: string;
  logicalScopeKey: string;
  supervisor: ConversationTelemetrySupervisor;
  refCount: number;
  subscription: Disposable | null;
  stale: boolean;
  workspaceDetached: boolean;
}

const supervisorServiceIds = new WeakMap<object, number>(); // 原 gT
let nextSupervisorServiceId = 1; // 原 _T
const supervisorEntries = new Map<string, SupervisorEntry>(); // 原 vT

function supervisorServiceId(service: object): number {
  const known = supervisorServiceIds.get(service);
  if (known !== undefined) return known;
  const id = nextSupervisorServiceId;
  nextSupervisorServiceId += 1;
  supervisorServiceIds.set(service, id);
  return id;
}

/** 原 gFe：物理作用域键 = 远端会话\0工作区键\0服务代号 */
function physicalScopeKey(scope: TelemetryScope, agentService: object): string {
  const workspacePart = scope.workspaceIdentity?.trim() || scope.workspacePath;
  return [scope.remoteSessionId ?? "__base__", workspacePart, supervisorServiceId(agentService)].join("\u0000");
}

/** 原 yT：逻辑作用域键 = 远端会话\0工作区键 */
function logicalScopeKey(scope: TelemetryScope): string {
  const workspacePart = scope.workspaceIdentity?.trim() || scope.workspacePath;
  return [scope.remoteSessionId ?? "__base__", workspacePart].join("\u0000");
}

/** 原 bT：作用域等价判断 */
export function isSameTelemetryScope(a: TelemetryScope, b: TelemetryScope): boolean {
  return (
    (a.remoteSessionId ?? "__base__") === (b.remoteSessionId ?? "__base__") &&
    (a.workspaceIdentity?.trim() || a.workspacePath) === (b.workspaceIdentity?.trim() || b.workspacePath)
  );
}

/** 原 S：平台遥测服务（App 根注入；此处为消费面声明） */
declare function useTelemetryPlatform(): TelemetryPlatform | null;

/** 原 sAe：zcodeAgentService 的事件订阅面（onFact） */
declare function agentEventSurface(agentService: unknown): {
  onFact(args: { workspacePath: string; workspaceIdentity?: string }): (listener: (fact: AgentFact) => void) => Disposable;
};

/** 原 _Fe：获取（或创建）作用域监督；引用计数释放 */
function acquireSupervisor(
  scope: TelemetryScope,
  services: { zcodeAgentService: unknown },
  platform: TelemetryPlatform,
): { entry: SupervisorEntry; release(): void } {
  const logicalKey = logicalScopeKey(scope);
  const physicalKey = physicalScopeKey(scope, services.zcodeAgentService as object);
  for (const [key, entry] of supervisorEntries) {
    if (entry.logicalScopeKey !== logicalKey || key === physicalKey) continue;
    supervisorEntries.delete(key);
    entry.stale = true;
    if (entry.refCount === 0) disposeSupervisorEntry(entry);
  }
  let entry = supervisorEntries.get(physicalKey);
  if (entry) {
    entry.refCount += 1;
  } else {
    entry = {
      key: physicalKey,
      logicalScopeKey: logicalKey,
      supervisor: new ConversationTelemetrySupervisor({ platform, workspaceScopeKey: physicalKey }),
      refCount: 1,
      subscription: null,
      stale: false,
      workspaceDetached: false,
    };
    supervisorEntries.set(physicalKey, entry);
  }
  let released = false;
  return {
    entry,
    release: () => {
      if (released) return;
      released = true;
      --entry!.refCount;
      if (!(entry!.refCount > 0) && (entry!.stale || entry!.workspaceDetached)) disposeSupervisorEntry(entry!);
    },
  };
}

/** 原 xT */
function disposeSupervisorEntry(entry: SupervisorEntry): void {
  if (supervisorEntries.get(entry.key) === entry) supervisorEntries.delete(entry.key);
  entry.subscription?.dispose();
  entry.subscription = null;
  entry.supervisor.dispose();
}

/** 原 vFe：释放全部监督（应用退出） */
export function disposeAllSupervisors(): void {
  for (const entry of supervisorEntries.values()) disposeSupervisorEntry(entry);
  supervisorEntries.clear();
}

/** 原 yFe：工作区卸载时标记游离监督 */
export function detachSupervisorWorkspaces(scopes: TelemetryScope[]): void {
  const active = new Set(scopes.map(logicalScopeKey));
  for (const entry of supervisorEntries.values()) {
    entry.workspaceDetached = !active.has(entry.logicalScopeKey);
    if (entry.workspaceDetached && entry.refCount === 0) disposeSupervisorEntry(entry);
  }
}

/** 原 bFe：为监督订阅工作区事实流（幂等） */
function ensureFactSubscription(entry: SupervisorEntry, scope: TelemetryScope, services: { zcodeAgentService: unknown }): void {
  entry.subscription ||= agentEventSurface(services.zcodeAgentService).onFact({
    workspacePath: scope.workspacePath,
    ...(scope.workspaceIdentity ? { workspaceIdentity: scope.workspaceIdentity } : {}),
  })((fact) => entry.supervisor.handleFact(fact));
}

/* --- E.2 TelemetryScope provider（原 ST/CT/xFe/wT/SFe，服务作用域） --- */

interface TelemetryScopeValue {
  scope: TelemetryScope;
  supervisor: ConversationTelemetrySupervisor;
  foregroundEnabled: boolean;
}

const TelemetryScopeContext = React.createContext<TelemetryScopeValue | null>(null); // 原 ST

/** 原 CT：TelemetryScopeProvider（enabled + foregroundEnabled + 作用域） */
export function TelemetryScopeProvider({
  enabled,
  foregroundEnabled = true,
  services,
  workspacePath,
  workspaceIdentity,
  remoteSessionId,
  children,
}: {
  enabled: boolean;
  foregroundEnabled?: boolean;
  services: { zcodeAgentService: unknown };
  workspacePath: string;
  workspaceIdentity?: string | null; // A1-R3 宽化：同 TelemetryScope（下行读取均经条件展开/? 防御）
  remoteSessionId?: string;
  children: React.ReactNode;
}) {
  const platform = useTelemetryPlatform();
  const scope = React.useMemo<TelemetryScope>(
    () => ({ workspacePath, ...(workspaceIdentity ? { workspaceIdentity } : {}), ...(remoteSessionId ? { remoteSessionId } : {}) }),
    [remoteSessionId, workspaceIdentity, workspacePath],
  );
  const lease = React.useMemo(() => {
    const agentService = services.zcodeAgentService;
    return !enabled || !platform || !agentService ? null : acquireSupervisor(scope, services, platform);
  }, [enabled, platform, scope, services]);
  const supervisor = lease?.entry.supervisor ?? null;

  React.useEffect(() => {
    if (!lease) return;
    ensureFactSubscription(lease.entry, scope, services);
    return () => {
      lease.release();
    };
  }, [lease, scope, services]);

  const value = React.useMemo<TelemetryScopeValue | null>(() => (supervisor ? { scope, supervisor, foregroundEnabled } : null), [foregroundEnabled, scope, supervisor]);
  return <TelemetryScopeContext.Provider value={value}>{children}</TelemetryScopeContext.Provider>;
}

/** 原 xFe：在既有遥测作用域下为新作用域挂子 provider（继承 enabled/foreground） */
export function InheritedTelemetryScopeProvider({ services, scope, children }: { services: { zcodeAgentService: unknown }; scope: TelemetryScope; children: React.ReactNode }) {
  const parent = React.useContext(TelemetryScopeContext);
  return (
    <TelemetryScopeProvider
      enabled={parent !== null}
      foregroundEnabled={parent?.foregroundEnabled ?? false}
      services={services}
      workspacePath={scope.workspacePath}
      workspaceIdentity={scope.workspaceIdentity}
      remoteSessionId={scope.remoteSessionId}
    >
      {children}
    </TelemetryScopeProvider>
  );
}

/** 原 wT：useTelemetrySupervisor（作用域匹配才返回） */
export function useTelemetrySupervisor(scope: TelemetryScope): ConversationTelemetrySupervisor | null {
  const value = React.useContext(TelemetryScopeContext);
  return value && isSameTelemetryScope(value.scope, scope) ? value.supervisor : null;
}

/** 原 SFe：useIsTelemetryForeground */
export function useIsTelemetryForeground(scope: TelemetryScope): boolean {
  const value = React.useContext(TelemetryScopeContext);
  return !!(value && value.foregroundEnabled && isSameTelemetryScope(value.scope, scope));
}

/* --- E.3 V4Conversation provider（原 TT/CFe/wFe/ET，工作区作用域） --- */

export interface V4ConversationApi {
  layer: unknown;
  sendCommand(command: unknown): unknown;
  fileChanges(args: Record<string, unknown>): unknown;
  fileRewindPreview(args: Record<string, unknown>): unknown;
  attachmentPut(input: AttachmentPutInput, options?: AttachmentPutOptions): unknown;
  attachmentRead(args: { sessionId: string; ref: string }): unknown;
  onRuntimeRestart(listener: () => void): () => void;
}

const V4ConversationContext = React.createContext<V4ConversationApi | null>(null); // 原 TT

/* 原 mw/_w（ConversationLayer）已接线 FeedbackCenter.ConversationDataLayer（见文件头 import） */

/** 原 CFe：V4ConversationProvider 内层（装配传输+层，卸载即释放） */
export function V4ConversationProviderInner({
  workspacePath,
  workspaceIdentity,
  children,
  services,
}: {
  workspacePath: string;
  workspaceIdentity?: string;
  children: React.ReactNode;
  services: BaseServices & { zcodeAgentService: unknown };
}) {
  const { zcodeAgentService } = services;
  const api = React.useMemo(() => {
    const transport = createConversationTransport(zcodeAgentService as unknown as AgentServiceV4, { workspacePath, workspaceIdentity }); // A0-CLEANUP3 3b：zcodeAgentService 已具型为 AutomationsAgentService，与本地 AgentServiceV4 不重叠，双重收敛
    return {
      layer: new ConversationLayer({ transport }),
      sendCommand: (command: unknown) => transport.sendCommand(command),
      fileChanges: (args: Record<string, unknown>) => transport.fileChanges(args),
      fileRewindPreview: (args: Record<string, unknown>) => transport.fileRewindPreview(args),
      attachmentPut: (input: AttachmentPutInput, options?: AttachmentPutOptions) => transport.attachmentPut(input, options),
      attachmentRead: (args: { sessionId: string; ref: string }) => transport.attachmentRead(args),
      onRuntimeRestart: (listener: () => void) => transport.onRuntimeRestart(listener),
    };
  }, [workspacePath, workspaceIdentity, zcodeAgentService]);

  React.useEffect(
    () => () => {
      api.layer.dispose();
    },
    [api],
  );

  return (
    <ServiceProvider services={services}>
      <V4ConversationContext.Provider value={api}>{children}</V4ConversationContext.Provider>
    </ServiceProvider>
  );
}

/** 原 wFe：V4ConversationProvider（rpc 就绪才渲染） */
export function V4ConversationProvider({ workspacePath, workspaceIdentity, children }: { workspacePath: string; workspaceIdentity?: string; children: React.ReactNode }) {
  const resolved = useResolvedWorkspaceServices(workspacePath, undefined, workspaceIdentity);
  if (!resolved.rpcReady) return null;
  return (
    <V4ConversationProviderInner workspacePath={workspacePath} workspaceIdentity={workspaceIdentity} services={resolved.services as BaseServices & { zcodeAgentService: unknown }}>
      {children}
    </V4ConversationProviderInner>
  );
}

/** 原 ET：useV4Conversation */
export function useV4Conversation(): V4ConversationApi {
  const api = React.useContext(V4ConversationContext);
  if (!api) throw new Error("useV4Conversation 必须在 V4ConversationProvider 内使用");
  return api;
}

/* --- E.4 面板作用域 provider（原 DT/TFe） --- */

/* 原 mNe（leaseConversationTransport）已接线 FeedbackCenter.acquireConversationDataLayer（见文件头 import） */

/** 原 DT：PanelScopeProvider（按作用域解析服务，就绪才渲染） */
export function PanelScopeProvider({ scope, children }: { scope: TelemetryScope; children: React.ReactNode }) {
  const resolved = useResolvedWorkspaceServices(scope.workspacePath, scope.remoteSessionId ?? null, scope.workspaceIdentity ?? null);
  if (!resolved.rpcReady) return null;
  return <PanelScopeProviderInner scope={scope} services={resolved.services}>{children}</PanelScopeProviderInner>;
}

/** 原 TFe */
function PanelScopeProviderInner({ scope, services, children }: { scope: TelemetryScope; services: BaseServices; children: React.ReactNode }) {
  const agentService = (services as { zcodeAgentService: unknown }).zcodeAgentService;
  const lease = React.useMemo(() => {
    const leased = leaseConversationTransport(
      { workspacePath: scope.workspacePath, ...(scope.workspaceIdentity ? { workspaceIdentity: scope.workspaceIdentity } : {}), ...(scope.remoteSessionId ? { remoteSessionId: scope.remoteSessionId } : {}) },
      agentService as AgentServiceV4,
    );
    return {
      lease: leased,
      value: {
        layer: leased.layer,
        sendCommand: (command: unknown) => leased.transport.sendCommand(command),
        fileChanges: (args: Record<string, unknown>) => leased.transport.fileChanges(args),
        fileRewindPreview: (args: Record<string, unknown>) => leased.transport.fileRewindPreview(args),
        attachmentPut: (input: AttachmentPutInput, options?: AttachmentPutOptions) => leased.transport.attachmentPut(input, options),
        attachmentRead: (args: { sessionId: string; ref: string }) => leased.transport.attachmentRead(args),
        onRuntimeRestart: (listener: () => void) => leased.transport.onRuntimeRestart(listener),
      } as V4ConversationApi,
    };
  }, [agentService, scope.workspacePath, scope.workspaceIdentity, scope.remoteSessionId]);

  React.useEffect(
    () => () => {
      lease.lease.release();
    },
    [lease],
  );

  return (
    <ServiceProvider services={services}>
      <InheritedTelemetryScopeProvider services={services as { zcodeAgentService: unknown }} scope={scope}>
        <V4ConversationContext.Provider value={lease.value}>{children}</V4ConversationContext.Provider>
      </InheritedTelemetryScopeProvider>
    </ServiceProvider>
  );
}
