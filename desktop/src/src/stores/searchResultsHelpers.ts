// A0-S4-3: 自 modules/StoresDeep.tsx §A 原样迁入（Vo SearchResultsStore 纯助手块 + §0 StoreApi 局部接口；原文件现为薄 re-export shim）。
import * as React from "react";
import { resolveWorkspaceKey as workspaceKey } from './taskStore'; // 原 U（SkillStore workspaceKey）

interface StoreApi<TState> {
  getState(): TState;
  setState(partial: Partial<TState> | ((state: TState) => Partial<TState>)): void;
  subscribe(listener: (state: TState, previous: TState) => void): () => void;
}

/* ============================================================================
 * §A. Vo SearchResultsStore 纯助手块（原 js 1297–1552）
 * ----------------------------------------------------------------------------
 * 任务搜索结果缓存的全部模块级纯函数/闭包状态。消费方为 stores-session.tsx
 * 的 useSearchResultsStore 各 action（setQueryResult(s)/upsertTaskMeta/
 * applyTaskMutation/markWorkspaceKeysStale 等）。
 * ==========================================================================*/

export interface TaskMeta {
  taskId: string;
  workspacePath: string;
  workspaceIdentity?: string | null;
  title: string;
  createdAt: number;
  updatedAt: number;
  status?: string;
  unreadAt?: number | null;
  pinned?: boolean;
  archived?: boolean;
  /* A1-R9 型缝裁决（宽化→精化）：changeSummary 原为 string 面，与 bundle 真形不符。
   * bundle 唯一真形：vg@23753 读 e.changeSummary.files.length；np@6874
   * （TaskChangeSummarySchema，strict）= { fileCount, added, removed, files[] }；
   * Bhe@23757 读顶层 added/removed。精化为对象面（下 TaskChangeSummary），
   * 与 canonical 面 components/quickpick/QuickPick.tsx TaskChangeSummary 结构相容
   * （files 项五字段必填 = RecentChangeFile 真形；fileCount/added/removed 经其
   * 索引签名吸收）。消费面实测：本文件 365/469 皆透传（型无关）；taskStore.ts 117
   * 为 unknown 宽面不受影响；Sidebar/QuickPick 各自本地富面同形。 */
  changeSummary?: TaskChangeSummary | null;
  lastError?: { message?: string } | null; // A1-R9：按 canonical 面（QuickPick TaskMeta）补足；运行期任务镜像 lastError 真形（np@6874 同族）
  model?: string | null;
  provider?: string | null;
  searchSnippet?: string;
  searchSnippets?: string[];
  /** 会话活动附着（原 Pie@1307 `__zcodeSessionActivity`；jo@1308 附挂）；A1-R9 按 canonical 面补足 */
  __zcodeSessionActivity?: SessionActivity | null;
  [key: string]: unknown;
}

/** A1-R9：changeSummary 对象真形（bundle np@6874 strict；vg@23753 / Bhe@23757 消费面在案） */
export interface TaskChangeSummary {
  fileCount: number;
  added: number;
  removed: number;
  files: Array<{
    path: string;
    added: number;
    removed: number;
    writeCount: number;
    lastTurnIndex: number;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

export interface SessionActivity {
  phase: string; // A1-R9 精化：原可选面 → 必填（bundle Fie@1314 读 phase；jo@1308 附着恒含 phase；canonical 面 QuickPick SessionActivity 同必填）
  lastActivityAt: number;
  pendingInteractions?: { permissionCount: number; userInputCount: number };
  [key: string]: unknown;
}

/** A1-R10 精化：kind/sortBy 原为 string 宽面，按 bundle 真形收窄为枚举联合——
 *  kind 五值 = Wie@1433 switch 全集（pinned/archived/active/timeline/workspace）；
 *  sortBy 二值 = Iie@1341（`n === "created"`）+ 140393/140601 消费面实测。
 *  收窄后与 canonical 面 components/quickpick/QuickPick.tsx QueryDescriptor
 *  （TaskListKind/TaskSortBy 同形）结构一致，供 SidebarLeaves Vo 接线
 *  （setQueryResults 之 SetQueryResultArgs.descriptor 必填面）缝合。 */
export interface SearchDescriptor {
  kind: "active" | "pinned" | "archived" | "timeline" | "workspace";
  sortBy: "updated" | "created";
  search: string;
  expanded: boolean;
  visibleLimit: number | null;
  workspaceKeys: string[];
}

export interface QueryResultInput {
  taskKeys: string[];
  unreadTaskKeys?: string[];
  searchSnippetsByTaskKey?: Record<string, string>;
  searchSnippetListsByTaskKey?: Record<string, string[]>;
  total: number;
  hasMore: boolean;
  partial?: boolean;
  loadingShardKeys?: string[];
  failedShardKeys?: string[];
  descriptor: SearchDescriptor;
  invalidationVersion?: number;
}

export interface QueryResult {
  taskKeys: string[];
  unreadTaskKeys?: string[];
  searchSnippetsByTaskKey?: Record<string, string>;
  searchSnippetListsByTaskKey?: Record<string, string[]>;
  total: number;
  hasMore: boolean;
  fetchedAt: number;
  invalidationVersion: number;
  stale: boolean;
  partial: boolean;
  loadingShardKeys: string[];
  failedShardKeys: string[];
  descriptor: SearchDescriptor;
}

export interface WorkspaceScope {
  workspacePath: string;
  workspaceIdentity?: string | null;
}

/** 原 Pie（1307）：元数据上的会话活动态字段名 */
export const SESSION_ACTIVITY_FIELD = "__zcodeSessionActivity";

/** 原 jo（1308）：为任务元数据附挂会话活动态
 * 〔A1-R49〕A1-P3-B10 §2-3 申请受理：补泛型重载——符 jo 多态实义（bundle 1308–1310
 * `{ ...e, [Pie]: t }` 入参原形回带）。原 (Record<string,unknown>)→Record<string,unknown>
 * 重载保留：既有消费位（本叶 mergeMetaPreservingActivity 166 / TaskIndexCore 397/490
 * any 面）行为零变；泛型臂纳 QuickPickDeep TaskMeta/TaskIndexRow 型调用面
 * （mergeSessionIntoTask 801 / sessionRowToTaskMeta 926，bundle 32592/32685）。 */
export function withSessionActivity<T extends Record<string, unknown>>(meta: T, activity: SessionActivity): T;
export function withSessionActivity(meta: Record<string, unknown>, activity: SessionActivity): Record<string, unknown>;
export function withSessionActivity(meta: Record<string, unknown>, activity: SessionActivity): Record<string, unknown> {
  return { ...meta, [SESSION_ACTIVITY_FIELD]: activity };
}

/** 原 Mo（1311）：读取会话活动态。〔A1-P2-B10〕参形宽化 Record<string, unknown> → object：
 * WS describeTaskActivity declare 改指（消费面传接口型 TaskMeta，无隐式索引签名）；bundle Mo 对入参零约束。 */
export function sessionActivityOf(meta: object | null | undefined): SessionActivity | null {
  return (meta as { [SESSION_ACTIVITY_FIELD]?: SessionActivity } | null)?.[SESSION_ACTIVITY_FIELD] ?? null;
}

/** 原 Fie（1314）：会话是否活动（prewarming/running） */
export function isSessionActivityActive(meta: Record<string, unknown> | null | undefined): boolean {
  const phase = sessionActivityOf(meta)?.phase;
  return phase === "prewarming" || phase === "running";
}

/** 原 No（1318）：待交互计数（用户输入优先于权限） */
export function pendingInteractionOf(
  meta: Record<string, unknown> | null | undefined,
): { kind: "userInput" | "permission"; count: number } | null {
  const pending = sessionActivityOf(meta)?.pendingInteractions;
  if (!pending) return null;
  const count = pending.permissionCount + pending.userInputCount;
  return count === 0 ? null : { kind: pending.userInputCount > 0 ? "userInput" : "permission", count };
}

/** 原 Po（1324）：活动态下的元数据合并（保持 createdAt/status，updatedAt=活动时刻；unreadAt 显式优先） */
export function mergeMetaPreservingActivity(
  base: TaskMeta & Record<string, unknown>,
  patch: Partial<TaskMeta> & Record<string, unknown>,
): TaskMeta & Record<string, unknown> {
  const activity = sessionActivityOf(base);
  if (!activity) return patch as TaskMeta & Record<string, unknown>;
  const hasUnreadAt = Object.prototype.hasOwnProperty.call(patch, "unreadAt");
  return withSessionActivity(
    {
      ...base,
      ...patch,
      createdAt: base.createdAt,
      updatedAt: activity.lastActivityAt,
      status: base.status,
      unreadAt: hasUnreadAt ? patch.unreadAt : base.unreadAt,
    },
    activity,
  ) as TaskMeta & Record<string, unknown>;
}

/** 原 Iie（1340）：按 sortBy 的双序比较（created：创建→更新→id；updated：更新→创建→id） */
export function compareTasksBySortKey(a: TaskMeta, b: TaskMeta, sortBy: string): number {
  return sortBy === "created"
    ? b.createdAt === a.createdAt
      ? b.updatedAt === a.updatedAt
        ? b.taskId.localeCompare(a.taskId)
        : b.updatedAt - a.updatedAt
      : b.createdAt - a.createdAt
    : b.updatedAt === a.updatedAt
      ? b.createdAt === a.createdAt
        ? b.taskId.localeCompare(a.taskId)
        : b.createdAt - a.createdAt
      : b.updatedAt - a.updatedAt;
}

/** 原 Lie（1353）：谓词优先的分层比较（同层回落到 Iie） */
export function compareTasksActiveFirst(
  a: TaskMeta,
  b: TaskMeta,
  sortBy: string,
  predicate: (meta: TaskMeta) => boolean,
): number {
  const aFirst = predicate(a);
  return aFirst === predicate(b)
    ? aFirst
      ? b.createdAt === a.createdAt
        ? b.taskId.localeCompare(a.taskId)
        : b.createdAt - a.createdAt
      : compareTasksBySortKey(a, b, sortBy)
    : aFirst
      ? -1
      : 1;
}

/** 原 Fo（1365）：活动态优先的任务比较（谓词 = Fie） */
export function compareTasks(a: TaskMeta, b: TaskMeta, sortBy: string): number {
  return compareTasksActiveFirst(a, b, sortBy, isSessionActivityActive);
}

/** 原 Io（1368）：任务工作区键（= skillStore workspaceKey） */
export function taskWorkspaceKey(workspacePath: string, workspaceIdentity?: string | null): string {
  return workspaceKey(workspacePath, workspaceIdentity);
}

/** 原 Lo（1371）：任务实体键 `${工作区键}::${taskId}` */
export function taskEntityKey(meta: { workspacePath: string; workspaceIdentity?: string | null; taskId: string }): string {
  return `${taskWorkspaceKey(meta.workspacePath, meta.workspaceIdentity)}::${meta.taskId}`;
}

/** 原 Ro（1374）：工作区域去重（空键剔除，按键字典序） */
export function dedupeWorkspaceScopes(scopes: WorkspaceScope[]): WorkspaceScope[] {
  const byKey = new Map<string, WorkspaceScope>();
  for (const scope of scopes) {
    const key = taskWorkspaceKey(scope.workspacePath, scope.workspaceIdentity);
    if (key.trim()) byKey.set(key, scope);
  }
  return [...byKey.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, scope]) => scope);
}

/** 原 Rie（1382）：搜索词归一（trim+小写） */
export function normalizeSearchTerm(term: string | null | undefined): string {
  return term?.trim().toLocaleLowerCase() ?? "";
}

/** 原 zie（1385）：描述符归一（域去重排序 + 搜索词归一 + 展开态决定可见上限）
 *  A1-R10 精化：入参 kind/sortBy 随 SearchDescriptor 收窄（bundle 真形，见上方注） */
export function normalizeSearchDescriptor(descriptor: {
  kind: SearchDescriptor["kind"];
  sortBy: SearchDescriptor["sortBy"];
  search?: string | null;
  expanded: boolean;
  visibleLimit?: number;
  workspaceScopes: WorkspaceScope[];
}): SearchDescriptor {
  const keys = dedupeWorkspaceScopes(descriptor.workspaceScopes).map((scope) =>
    taskWorkspaceKey(scope.workspacePath, scope.workspaceIdentity),
  );
  return {
    kind: descriptor.kind,
    sortBy: descriptor.sortBy,
    search: normalizeSearchTerm(descriptor.search),
    expanded: descriptor.expanded,
    visibleLimit: descriptor.expanded || descriptor.visibleLimit === undefined ? null : descriptor.visibleLimit,
    workspaceKeys: keys,
  };
}

/** 原 Bie（1396）：描述符 → 缓存键 */
export function descriptorCacheKey(descriptor: SearchDescriptor): string {
  const workspaces = descriptor.workspaceKeys.join("|");
  return [
    descriptor.kind,
    descriptor.sortBy,
    descriptor.expanded ? "expanded" : "collapsed",
    `limit=${descriptor.visibleLimit ?? "all"}`,
    `search=${descriptor.search}`,
    `workspaces=${workspaces}`,
  ].join("::");
}

/** 原 zo（1407）：会话活动态监听器集（归档/删除广播用） */
const sessionActivityListeners = new Set<(event: unknown) => void>();

/** 原 Vie（1408）：订阅会话活动态事件（返回退订） */
export function subscribeSessionActivity(listener: (event: unknown) => void): () => void {
  sessionActivityListeners.add(listener);
  return () => {
    sessionActivityListeners.delete(listener);
  };
}

/** 原 Hie（1411）：广播会话活动态事件 */
export function broadcastSessionActivity(event: unknown): void {
  for (const listener of sessionActivityListeners) listener(event);
}

/** 原 Uie（1414）：查询结果快照固化（fetchedAt=now、stale=false、缺省补齐） */
export function freezeQueryResult(input: QueryResultInput): QueryResult {
  return {
    taskKeys: input.taskKeys,
    unreadTaskKeys: input.unreadTaskKeys,
    searchSnippetsByTaskKey: input.searchSnippetsByTaskKey,
    searchSnippetListsByTaskKey: input.searchSnippetListsByTaskKey,
    total: input.total,
    hasMore: input.hasMore,
    fetchedAt: Date.now(),
    invalidationVersion: input.invalidationVersion ?? 0,
    stale: false,
    partial: input.partial ?? false,
    loadingShardKeys: input.loadingShardKeys ?? [],
    failedShardKeys: input.failedShardKeys ?? [],
    descriptor: input.descriptor,
  };
}

/** 原 Wie（1431）：描述符种类 × 任务成员资格 */
export function descriptorMembershipMatch(
  descriptor: SearchDescriptor,
  membership: { pinned?: boolean; archived?: boolean },
): boolean {
  switch (descriptor.kind) {
    case "pinned":
      return !!membership.pinned && !membership.archived;
    case "archived":
      return !!membership.archived;
    case "active":
      return !membership.archived;
    case "timeline":
    case "workspace":
      return !membership.pinned && !membership.archived;
    default:
      return false;
  }
}

/** 原 Gie（1446）：标题 × 搜索词匹配（无搜索词恒真） */
export function titleMatchesSearch(descriptor: SearchDescriptor, meta: { title: string }): boolean {
  return descriptor.search ? meta.title.toLocaleLowerCase().includes(descriptor.search) : true;
}

/** 原 Kie（1449）：任务是否属于描述符（工作区键 ∧ 成员资格 ∧ 搜索匹配） */
export function descriptorContainsTask(
  descriptor: SearchDescriptor,
  meta: TaskMeta,
  membership: { pinned?: boolean; archived?: boolean },
): boolean {
  const key = taskWorkspaceKey(meta.workspacePath, meta.workspaceIdentity);
  return descriptor.workspaceKeys.includes(key) ? descriptorMembershipMatch(descriptor, membership) && titleMatchesSearch(descriptor, meta) : false;
}

/** 原 Bo（1453）：任务键按描述符排序（去重；元数据缺失回落到键字典序） */
export function sortTaskKeysByDescriptor(input: {
  taskKeys: string[];
  taskMetaByEntityKey: Record<string, TaskMeta | undefined>;
  descriptor: SearchDescriptor;
}): string[] {
  return [...new Set(input.taskKeys)].sort((a, b) => {
    const metaA = input.taskMetaByEntityKey[a];
    const metaB = input.taskMetaByEntityKey[b];
    return !metaA && !metaB ? a.localeCompare(b) : metaA ? (metaB ? compareTasks(metaA, metaB, input.descriptor.sortBy) : -1) : 1;
  });
}

/** 原 qie（1460）：宽松浅比较（对象值走 JSON 序列化兜底） */
export function shallowEqualLoose(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
  if (a === b) return true;
  const keys = Object.keys(a);
  if (keys.length !== Object.keys(b).length) return false;
  for (const key of keys) {
    const valueA = a[key];
    const valueB = b[key];
    if (valueA !== valueB) {
      if (typeof valueA === "object" && valueA && typeof valueB === "object" && valueB) {
        if (JSON.stringify(valueA) !== JSON.stringify(valueB)) return false;
        continue;
      }
      return false;
    }
  }
  return true;
}

/** 原 Jie（1479）：任务元数据合并（搜索支保持命中项；非搜索支择优标题/补全字段；未读覆盖层；摘要保持） */
export function mergeTaskMetaEntry(args: {
  descriptor: SearchDescriptor;
  item: TaskMeta & Record<string, unknown>;
  existingItem?: (TaskMeta & Record<string, unknown>) | null;
  hasUnreadOverlay?: boolean;
  unreadAtOverlay?: number | null;
}): TaskMeta & Record<string, unknown> {
  const incomingActivity = sessionActivityOf(args.item);
  const existingActivity = args.existingItem ? sessionActivityOf(args.existingItem) : null;
  const base =
    args.descriptor.search && args.existingItem && existingActivity && !incomingActivity
      ? mergeMetaPreservingActivity(args.existingItem, args.item)
      : args.item;
  const preferExistingTitle =
    !!args.existingItem &&
    !!incomingActivity &&
    (args.item.title.trim().length === 0 || args.item.title.trim().toLocaleLowerCase() === "new session") &&
    args.existingItem.title.trim().length > 0 &&
    args.existingItem.title.trim().toLocaleLowerCase() !== "new session";
  const merged = args.descriptor.search
    ? base
    : {
        ...base,
        ...(preferExistingTitle ? { title: args.existingItem?.title } : {}),
        changeSummary: base.changeSummary ?? args.existingItem?.changeSummary,
        model: base.model ?? args.existingItem?.model,
        provider: base.provider ?? args.existingItem?.provider,
      };
  const withOverlay = args.hasUnreadOverlay ? { ...merged, unreadAt: args.unreadAtOverlay ?? undefined } : merged;
  const final =
    args.descriptor.search || !args.existingItem?.searchSnippet
      ? withOverlay
      : {
          ...withOverlay,
          searchSnippet: args.existingItem.searchSnippet,
          searchSnippets: args.existingItem.searchSnippets,
        };
  return args.existingItem && shallowEqualLoose(final, args.existingItem) ? args.existingItem : final;
}

/** 原 Yie（1510）：查询结果等价判断（键序/分片/摘要全量比对） */
export function isQueryResultEquivalent(args: { previousResult: QueryResult | null | undefined } & Omit<QueryResult, "fetchedAt" | "invalidationVersion" | "stale" | "descriptor">): boolean {
  const previous = args.previousResult;
  if (
    !previous ||
    previous.stale ||
    previous.total !== args.total ||
    previous.hasMore !== args.hasMore ||
    previous.partial !== args.partial ||
    previous.taskKeys.length !== args.taskKeys.length ||
    previous.taskKeys.some((key, index) => key !== args.taskKeys[index])
  )
    return false;
  const sameList = (a: string[], b: string[]) => a.length === b.length && a.every((item, index) => item === b[index]);
  return !sameList(previous.unreadTaskKeys ?? [], args.unreadTaskKeys ?? []) ||
    !sameList(previous.loadingShardKeys, args.loadingShardKeys) ||
    !sameList(previous.failedShardKeys, args.failedShardKeys)
    ? false
    : JSON.stringify(previous.searchSnippetsByTaskKey ?? null) === JSON.stringify(args.searchSnippetsByTaskKey ?? null) &&
        JSON.stringify(previous.searchSnippetListsByTaskKey ?? null) === JSON.stringify(args.searchSnippetListsByTaskKey ?? null);
}

/** 原 Xie（1532）：非搜索支保留本地新变更键（updatedAt > 上次 fetchedAt），重排后按可见上限截断 */
export function mergeIncomingTaskKeys(args: {
  previousResult: QueryResult | null | undefined;
  descriptor: SearchDescriptor;
  incomingTaskKeys: string[];
  taskMetaByEntityKey: Record<string, TaskMeta | undefined>;
}): { taskKeys: string[]; preservedCount: number } {
  if (!args.previousResult || args.descriptor.search)
    return { taskKeys: args.incomingTaskKeys, preservedCount: 0 };
  const previous = args.previousResult;
  const incoming = new Set(args.incomingTaskKeys);
  const preserved = previous.taskKeys.filter((key) => {
    if (incoming.has(key)) return false;
    const meta = args.taskMetaByEntityKey[key];
    return !!(meta && meta.updatedAt > previous.fetchedAt);
  });
  if (preserved.length === 0) return { taskKeys: args.incomingTaskKeys, preservedCount: 0 };
  const sorted = sortTaskKeysByDescriptor({
    taskKeys: [...args.incomingTaskKeys, ...preserved],
    taskMetaByEntityKey: args.taskMetaByEntityKey,
    descriptor: args.descriptor,
  });
  return {
    taskKeys: args.descriptor.visibleLimit === null ? sorted : sorted.slice(0, args.descriptor.visibleLimit),
    preservedCount: preserved.length,
  };
}

/**
 * 原 pe（跨 chunk：skillStore `de`，含合并器 `y`）：变参任务元数据择优折叠。
 * 合并规则（逐字自 skillStore y/ue）：updatedAt 新者胜（同刻取标题长者）；
 * changeSummary/model/provider 取非空；标题择优先（被覆盖标题 > 非空非缺省标题）；
 * titleOverridden 或运算；status 取非空；unreadAt 显式键优先。
 */
export function pickBestTaskMetadata<T extends { updatedAt: number; title: string; titleOverridden?: boolean; unreadAt?: number | null }>(
  ...candidates: Array<T | null | undefined>
): T | undefined {
  let best: T | undefined;
  for (const candidate of candidates) {
    if (candidate) best = best ? mergeTaskMetadataPair(candidate, best) : candidate;
  }
  return best;
}

function isBlankOrNewSessionTitle(title: string): boolean {
  const normalized = title.trim().toLocaleLowerCase();
  return normalized.length === 0 || normalized === "new session";
}

function pickTitle<T extends { title: string; titleOverridden?: boolean }>(incoming: T, base: T): string {
  return (base.titleOverridden && !incoming.titleOverridden) || (isBlankOrNewSessionTitle(incoming.title) && !isBlankOrNewSessionTitle(base.title))
    ? base.title
    : incoming.title;
}

function mergeTaskMetadataPair<T extends { updatedAt: number; title: string; titleOverridden?: boolean; unreadAt?: number | null }>(
  incoming: T,
  base: T,
): T {
  const incomingNewer =
    base.updatedAt > incoming.updatedAt || (base.updatedAt === incoming.updatedAt && base.title.length > incoming.title.length);
  const newer = incomingNewer ? base : incoming;
  const older = incomingNewer ? incoming : base;
  const unreadAt = Object.prototype.hasOwnProperty.call(base, "unreadAt") ? base.unreadAt : newer.unreadAt ?? older.unreadAt;
  return {
    ...newer,
    changeSummary: (newer as { changeSummary?: unknown }).changeSummary ?? (older as { changeSummary?: unknown }).changeSummary,
    model: (newer as { model?: unknown }).model ?? (older as { model?: unknown }).model,
    provider: (newer as { provider?: unknown }).provider ?? (older as { provider?: unknown }).provider,
    title: pickTitle(newer, older),
    titleOverridden:
      newer.titleOverridden === true || older.titleOverridden === true ? true : newer.titleOverridden ?? older.titleOverridden,
    status: (newer as { status?: unknown }).status ?? (older as { status?: unknown }).status,
    unreadAt,
  } as T;
}

/** 原 Ao（1301）：会话活动态外部存储订阅钩子（useSyncExternalStore；无 provider 回退缺省） */
export function useSessionActivityStore<T>(
  store: StoreApi<Record<string, unknown>> | null,
  selector: (state: Record<string, unknown>) => T,
  fallback: T,
): T {
  const subscribe = React.useCallback(
    (listener: () => void) => (store ? store.subscribe(listener) : () => {}),
    [store],
  );
  const getSnapshot = () => (store ? selector(store.getState()) : fallback);
  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

