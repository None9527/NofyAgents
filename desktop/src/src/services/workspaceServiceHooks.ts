// A0-S4-5: 自 modules/services.tsx §D 原样迁入（全局键盘快捷键 + 任务快照缓存 + 供应商配置文件路径 + useSessionService，原 js 24015–25006；原文件现为薄 re-export shim）。
import * as React from "react";
import { useSessionRegistryStore } from '../modules/stores-core';
import { logger } from '../modules/SkillStore';
import { useServices } from './serviceContext';
import { useResolvedRemoteSessionId, useWorkspaceServices } from './remoteServices';
/* ============================================================================
 * D. 工作区文件/路径服务钩子群（原 24015–25006）
 * ==========================================================================*/

/* --- D.1 全局键盘快捷键（原 rge，js 24015–24079） --- */

declare function isModKey(event: KeyboardEvent, key: string): boolean; // 原 ta（Ctrl/Cmd）
declare function isModShiftKey(event: KeyboardEvent, key: string): boolean; // 原 Qi
declare function isModAltKey(event: KeyboardEvent, key: string): boolean; // 原 Rre

export interface GlobalShortcutHandlers {
  openQuickPick(): void;
  find(): void;
  toggleSidebar(): void;
  toggleTerminal(): void;
  toggleSidePane(): void;
  previousConversation?: () => void;
  nextConversation?: () => void;
  navBack?: () => void;
  navForward?: () => void;
}

/** 原 rge：捕获阶段全局快捷键（⌘K 面板 / ⌘F 查找 / ⌘[ ⌘] 会话切换 / ⌘B 侧栏 / ⌘J 终端 / ⌘⇧B 侧面板 / ⌘[ ⌘] 导航） */
export function useGlobalKeyboardShortcuts(handlers: GlobalShortcutHandlers): void {
  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.repeat || event.isComposing) return;
      if (isModKey(event, "k") || isModShiftKey(event, "p")) {
        event.preventDefault();
        handlers.openQuickPick();
        return;
      }
      if (isModKey(event, "f")) {
        event.preventDefault();
        handlers.find();
        return;
      }
      if (isModShiftKey(event, "[")) {
        if (!handlers.previousConversation) return;
        event.preventDefault();
        handlers.previousConversation();
        return;
      }
      if (isModShiftKey(event, "]")) {
        if (!handlers.nextConversation) return;
        event.preventDefault();
        handlers.nextConversation();
        return;
      }
      if (isModKey(event, "b")) {
        event.preventDefault();
        handlers.toggleSidebar();
        return;
      }
      if (isModKey(event, "j")) {
        event.preventDefault();
        handlers.toggleTerminal();
        return;
      }
      if (isModAltKey(event, "b")) {
        event.preventDefault();
        handlers.toggleSidePane();
        return;
      }
      if (isModKey(event, "[")) {
        if (!handlers.navBack) return;
        event.preventDefault();
        handlers.navBack();
        return;
      }
      if (isModKey(event, "]")) {
        if (!handlers.navForward) return;
        event.preventDefault();
        handlers.navForward();
      }
    }
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [handlers]);
}

/* --- D.2 任务快照缓存（原 24080–24228；持久化键 zcode-task-snapshot-cache:v1） --- */

const TASK_SNAPSHOT_CACHE_KEY = "zcode-task-snapshot-cache:v1"; // 原 sge
const TASK_SNAPSHOT_MAX_ENTRY_BYTES = 256 * 1024; // 原 cge
const TASK_SNAPSHOT_MAX_TOTAL_BYTES = 2 * 1024 * 1024; // 原 lge
const TASK_SNAPSHOT_MAX_ENTRIES = 20; // 原 uge
let taskSnapshotCacheLoaded = false; // 原 dge
const taskSnapshotCache = new Map<string, TaskSnapshotCacheEntry>(); // 原 Eg

interface TaskSnapshotCacheEntry {
  key: string;
  etag: string;
  snapshot: unknown;
  updatedAt: number;
  sizeBytes: number;
}

interface TaskSnapshotRequest {
  workspacePath: string;
  workspaceIdentity?: string | null;
  taskId: string;
  messageLimit?: number;
  byteBudget?: number;
  toolLimit?: number;
  clientMode?: string;
  resumeModelPolicy?: string;
  model?: string;
  thoughtLevel?: string;
}

/** 原 fge：快照缓存键（请求参数全量拼接） */
function taskSnapshotCacheKey(request: TaskSnapshotRequest): string {
  return [
    request.workspacePath,
    request.workspaceIdentity ?? "",
    request.taskId,
    typeof request.messageLimit === "number" ? String(request.messageLimit) : "",
    typeof request.byteBudget === "number" ? String(request.byteBudget) : "",
    typeof request.toolLimit === "number" ? String(request.toolLimit) : "",
    request.clientMode ?? "desktop-continuous",
    request.resumeModelPolicy ?? "task-index",
    request.model ?? "",
    request.thoughtLevel ?? "",
  ].join("::");
}

function snapshotStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** 原 Dg：惰性从 localStorage 载入缓存 */
function ensureTaskSnapshotCacheLoaded(): void {
  if (taskSnapshotCacheLoaded) return;
  taskSnapshotCacheLoaded = true;
  const raw = snapshotStorage()?.getItem(TASK_SNAPSHOT_CACHE_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw) as { entries?: unknown };
    const entries = Array.isArray(parsed.entries) ? parsed.entries : [];
    for (const entry of entries as Array<Partial<TaskSnapshotCacheEntry>>) {
      if (typeof entry?.key !== "string" || typeof entry?.etag !== "string" || !entry.snapshot || typeof entry.updatedAt !== "number" || typeof entry.sizeBytes !== "number") continue;
      taskSnapshotCache.set(entry.key, entry as TaskSnapshotCacheEntry);
    }
  } catch {
    /* 缓存损坏即弃 */
  }
}

/** 原 Og：缓存落盘 */
function persistTaskSnapshotCache(): void {
  const storage = snapshotStorage();
  if (!storage) return;
  try {
    storage.setItem(TASK_SNAPSHOT_CACHE_KEY, JSON.stringify({ entries: [...taskSnapshotCache.values()] }));
  } catch {
    /* 配额不足静默 */
  }
}

/** 原 gge：按更新时间保留前 N 条且总量 ≤2MB */
function pruneTaskSnapshotCache(): void {
  const sorted = [...taskSnapshotCache.values()].sort((a, b) => b.updatedAt - a.updatedAt);
  const kept: TaskSnapshotCacheEntry[] = [];
  let totalBytes = 0;
  for (const entry of sorted) {
    if (kept.length >= TASK_SNAPSHOT_MAX_ENTRIES || totalBytes + entry.sizeBytes > TASK_SNAPSHOT_MAX_TOTAL_BYTES) continue;
    kept.push(entry);
    totalBytes += entry.sizeBytes;
  }
  taskSnapshotCache.clear();
  for (const entry of kept) taskSnapshotCache.set(entry.key, entry);
}

function readSnapshotEntry(key: string): { etag: string; snapshot: unknown } | null {
  ensureTaskSnapshotCacheLoaded();
  const entry = taskSnapshotCache.get(key);
  return entry ? { etag: entry.etag, snapshot: entry.snapshot } : null;
}

function writeSnapshotEntry(key: string, etag: string, snapshot: unknown): void {
  ensureTaskSnapshotCacheLoaded();
  const serialized = JSON.stringify(snapshot);
  const sizeBytes = new TextEncoder().encode(serialized).byteLength;
  if (sizeBytes > TASK_SNAPSHOT_MAX_ENTRY_BYTES) {
    taskSnapshotCache.delete(key);
    persistTaskSnapshotCache();
    return;
  }
  taskSnapshotCache.set(key, { key, etag, snapshot, updatedAt: Date.now(), sizeBytes });
  pruneTaskSnapshotCache();
  persistTaskSnapshotCache();
}

function deleteSnapshotEntry(key: string): void {
  ensureTaskSnapshotCacheLoaded();
  taskSnapshotCache.delete(key);
  persistTaskSnapshotCache();
}

interface TaskSnapshotService {
  getTaskSnapshotWithEtag(request: TaskSnapshotRequest & { ifNoneMatch?: string }): Promise<{ notModified?: boolean; snapshot?: unknown; etag?: string }>;
  [method: string]: unknown;
}

const snapshotProxies = new WeakMap<object, TaskSnapshotService>(); // 原 ige
const snapshotInFlight = new WeakMap<object, Map<string, Promise<unknown>>>(); // 原 age
const snapshotEtagMemory = new WeakMap<object, Map<string, { etag: string; snapshot: unknown }>>(); // 原 oge

function inFlightMapFor(service: object): Map<string, Promise<unknown>> {
  let map = snapshotInFlight.get(service);
  if (!map) {
    map = new Map();
    snapshotInFlight.set(service, map);
  }
  return map;
}

function etagMemoryFor(service: object): Map<string, { etag: string; snapshot: unknown }> {
  let map = snapshotEtagMemory.get(service);
  if (!map) {
    map = new Map();
    snapshotEtagMemory.set(service, map);
  }
  return map;
}

/** 原 bge：给任务服务代理上 getTaskSnapshot（etag 协商 + 内存/磁盘两级缓存 + in-flight 合并） */
function withTaskSnapshotCache(service: TaskSnapshotService): TaskSnapshotService {
  const inFlight = inFlightMapFor(service);
  const memory = etagMemoryFor(service);
  return new Proxy(service, {
    get(target, property, receiver) {
      if (property === "getTaskSnapshot") {
        return (request: TaskSnapshotRequest) => {
          const key = taskSnapshotCacheKey(request);
          const existing = inFlight.get(key);
          if (existing) return existing;
          const cached = memory.get(key) ?? readSnapshotEntry(key);
          if (cached && !memory.has(key)) memory.set(key, cached);
          const load = (async () => {
            const result = await target.getTaskSnapshotWithEtag({ ...request, ...(cached?.etag ? { ifNoneMatch: cached.etag } : {}) });
            if (result.notModified) {
              if (cached?.snapshot) return cached.snapshot;
              const fresh = await target.getTaskSnapshotWithEtag(request);
              if (fresh.snapshot && fresh.etag) {
                const entry = { etag: fresh.etag, snapshot: fresh.snapshot };
                memory.set(key, entry);
                writeSnapshotEntry(key, fresh.etag, fresh.snapshot);
              }
              return fresh.snapshot;
            }
            if (result.snapshot && result.etag) {
              const entry = { etag: result.etag, snapshot: result.snapshot };
              memory.set(key, entry);
              writeSnapshotEntry(key, result.etag, result.snapshot);
            } else if (!result.snapshot) {
              memory.delete(key);
              deleteSnapshotEntry(key);
            }
            return result.snapshot;
          })().finally(() => {
            if (inFlight.get(key) === load) inFlight.delete(key);
          });
          inFlight.set(key, load);
          return load;
        };
      }
      return Reflect.get(target, property, receiver);
    },
  });
}

/** 原 kg：useCachedTaskService —— 按工作区解析任务服务并套快照缓存 */
export function useCachedTaskService(workspacePath?: string | null, remoteSessionId?: string | null, workspaceIdentity?: string | null): unknown {
  const services = workspacePath ? useWorkspaceServices(workspacePath, remoteSessionId, workspaceIdentity) : useServices();
  const taskService = (services as unknown as { zcodeTaskService?: TaskSnapshotService }).zcodeTaskService; // A0-CLEANUP3 3b：交集型不再直接可比，二段断言
  if (!taskService || typeof taskService !== "object") return taskService;
  const known = snapshotProxies.get(taskService);
  if (known) return known;
  const proxied = withTaskSnapshotCache(taskService);
  snapshotProxies.set(taskService, proxied);
  return proxied;
}

/* --- D.3 供应商配置文件路径（原 Sge/Cge/wge，js 24230–24319） --- */

export interface PathState {
  path: string | null;
  exists: boolean;
  loading: boolean;
  error: string | null;
}

/** 原 Sge：路径状态缺省 */
export const PATH_STATE_DEFAULT: PathState = { path: null, exists: false, loading: true, error: null };

interface ZCodeFileService {
  getWorkspaceProviderConfigFile(args: { workspacePath: string; workspaceIdentity?: string; provider: string }): Promise<{ path: string | null; exists: boolean }>;
}

/** 原 Cge：按服务作用域选 zcode 文件服务（远端会话无 base 服务时返回 null=等待） */
function resolveZCodeFileService(args: {
  configuredServiceScope: "workspace" | "base";
  workspaceZCodeService: ZCodeFileService | null | undefined;
  baseZCodeService: ZCodeFileService | null | undefined;
  remoteSessionId: string | null;
}): ZCodeFileService | null {
  if (args.configuredServiceScope === "workspace") return args.workspaceZCodeService ?? null;
  if (args.baseZCodeService) return args.baseZCodeService;
  return args.remoteSessionId ? null : args.workspaceZCodeService ?? null;
}

function pathErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message || error.name || String(error);
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.length > 0) return message;
  }
  return String(error);
}

/** 原 wge：useWorkspaceProviderConfigFile —— 读供应商配置文件路径（带刷新/竞态守卫） */
export function useWorkspaceProviderConfigFile(
  workspacePath: string | null,
  provider: string,
  remoteSessionId?: string | null,
  workspaceIdentity?: string | null,
  options?: { serviceScope?: "workspace" | "base"; enabled?: boolean },
): PathState & { refresh(): void } {
  const serviceScope = options?.serviceScope ?? "workspace";
  const enabled = options?.enabled ?? true;
  const resolvedRemoteSessionId = useResolvedRemoteSessionId(workspacePath, remoteSessionId, workspaceIdentity);
  const baseTaskService = useSessionRegistryStore((state) => state.baseServices?.zcodeTaskService ?? null);
  const remoteScoped = !!(workspaceIdentity?.trim() || resolvedRemoteSessionId?.trim());
  const workspaceService = useCachedTaskService(workspacePath, remoteSessionId, workspaceIdentity) as ZCodeFileService | null;
  const fileService = resolveZCodeFileService({
    configuredServiceScope: serviceScope,
    workspaceZCodeService: workspaceService,
    baseZCodeService: baseTaskService as ZCodeFileService | null,
    remoteSessionId: resolvedRemoteSessionId,
  });
  const scopeKind = serviceScope === "base" ? "base" : resolvedRemoteSessionId && workspaceService !== baseTaskService ? "remote" : "base";
  const [pathState, setPathState] = React.useState<PathState>(PATH_STATE_DEFAULT);
  const [refreshTick, bumpRefreshTick] = React.useState(0);
  const generationRef = React.useRef(0);
  const refresh = React.useCallback(() => {
    bumpRefreshTick((tick) => tick + 1);
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    if (!workspacePath || !enabled || !remoteScoped) {
      generationRef.current += 1;
      setPathState({ path: null, exists: false, loading: false, error: null });
      return () => {
        cancelled = true;
      };
    }
    if (!fileService) {
      generationRef.current += 1;
      setPathState({ path: null, exists: false, loading: true, error: null });
      return () => {
        cancelled = true;
      };
    }
    const generation = generationRef.current + 1;
    generationRef.current = generation;
    setPathState({ path: null, exists: false, loading: true, error: null });
    logger.info(`[useWorkspaceProviderConfigFile] 开始读取 provider 配置路径 workspace=${workspacePath} provider=${provider} scope=${scopeKind} session=${resolvedRemoteSessionId ?? "none"}`);
    fileService
      .getWorkspaceProviderConfigFile({ workspacePath, ...(workspaceIdentity ? { workspaceIdentity } : {}), provider })
      .then((result) => {
        if (cancelled || generationRef.current !== generation) return;
        logger.info(
          `[useWorkspaceProviderConfigFile] 读取 provider 配置路径成功 workspace=${workspacePath} provider=${provider} scope=${scopeKind} session=${resolvedRemoteSessionId ?? "none"} exists=${result.exists} path=${result.path}`,
        );
        setPathState({ path: result.path, exists: result.exists, loading: false, error: null });
      })
      .catch((error) => {
        if (cancelled || generationRef.current !== generation) return;
        const message = pathErrorMessage(error);
        logger.warn("[useWorkspaceProviderConfigFile] 读取 provider 配置路径失败", { workspacePath, provider, scope: scopeKind, remoteSessionId: resolvedRemoteSessionId, error: message });
        setPathState({ path: null, exists: false, loading: false, error: message });
      });
    return () => {
      cancelled = true;
    };
  }, [fileService, scopeKind, enabled, provider, refreshTick, resolvedRemoteSessionId, workspaceIdentity, workspacePath, remoteScoped]);

  return React.useMemo(() => ({ ...pathState, refresh }), [refresh, pathState]);
}

/** 原 Ag：useSessionService */
export function useSessionService(workspacePath?: string | null, remoteSessionId?: string | null, workspaceIdentity?: string | null): unknown {
  const services = workspacePath ? useWorkspaceServices(workspacePath, remoteSessionId, workspaceIdentity) : useServices();
  return (services as { zcodeSessionService?: unknown }).zcodeSessionService;
}
