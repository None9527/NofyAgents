// A0-S4-3: 自 modules/SkillStore.tsx §3–§13 原样迁入（jsx 53–1800 任务/会话 store 域；原文件现为薄 re-export shim）。
import { t as logger } from '../modules/logger'; // 原 u（logger-PFDwl5Yq 的 t 导出）
/* ── src-HCld2afU.js 导入（内部名经该 chunk 导出表逐一核对；实体在 SrcSharedA/B） ── */
import {
  buildCustomModelRef as formatCustomQualifiedModelId, // 原 n（src 的 F 导出 = 内部 rS）：`custom:<providerId>[:<modelName>]` 拼装
  nativeProviderRef as formatNativeSupplierKey, // 原 r（src 的 M 导出 = 内部 cS）：`native:<provider>` 供应商键
  parseCustomModelRef as parseCustomQualifiedModelId, // 原 i（src 的 P 导出 = 内部 iS）：解析 `custom:` 限定模型 ID
  listSessionModeOptions as getDefaultModeOptions, // 原 a（src 的 Y 导出 = 内部 kx）：缺省模式选项表（build/plan/yolo…）
  buildStableModelId as formatBuiltinQualifiedModelId // 原 c（src 的 q 导出 = 内部 Fx）：`<providerSlug>/<modelName>` 内建限定 ID
} from '../modules/SrcSharedB';
import {
  resolveDefaultAgentCliProvider as resolveAgentProvider, // 原 o（src 的 ds 导出 = 内部 Es）：代理供应商归一（3.7.6 恒返回 `glm`）
  isGlmAgentCliProvider as isGlmProvider // 原 l（src 的 us 导出 = 内部 Ds）：`provider === 'glm'`
} from '../modules/SrcSharedA';
import { create } from './zustand'; // 原 _（jsx 38）
import type { SetStateFn, GetStateFn } from './zustand';
import { isE2EStoreBridgeEnabled } from './e2eStoreBridge'; // 原 v（jsx 50）

/* ============================================================================
 * 3. 任务状态模型（原 te–ve，jsx 53–254）
 * ==========================================================================*/

interface WorkspaceInitState {
  status: string;
  error: string | null;
  attempts: number;
}

/** 原 te（jsx 53）：工作区初始化缺省态。 */
const initialWorkspaceInitState: WorkspaceInitState = {
  status: `idle`,
  error: null,
  attempts: 0,
};

/** 原 ne（jsx 58）：缺省供应商。 */
const DEFAULT_PROVIDER = `glm`;

interface TaskInteractionOption {
  optionId: string;
  kind: string;
  name: string;
}

interface TaskInteractionRequest {
  requestId: string;
  taskId: string;
  traceId: string | null;
  inputId: string;
  kind: string;
  title: string;
  description: string;
  options: TaskInteractionOption[];
}

interface TaskUiState {
  permissionRequest: TaskInteractionRequest | null;
  pendingPermissionRequests: TaskInteractionRequest[];
  elicitationRequest: TaskInteractionRequest | null;
  pendingElicitationRequests: TaskInteractionRequest[];
  elicitationFormDraftsByRequestId: Record<string, unknown>;
  error: string | null;
}

/** 原 re（jsx 59）：任务 UI 缺省态（权限/elicitation 队列）。 */
const initialTaskUiState: TaskUiState = {
  permissionRequest: null,
  pendingPermissionRequests: [],
  elicitationRequest: null,
  pendingElicitationRequests: [],
  elicitationFormDraftsByRequestId: {},
  error: null,
};

interface TaskRuntimeState {
  status: string;
  error: string | null;
  provider?: string;
  contextWindow: number | null;
  usage: TaskUsage | null;
  apiRetry: unknown;
  backgroundTaskControls: unknown[];
  activeTurnKind?: string;
  activeInputId?: string;
  activeInputOwnerClientId?: string;
}

/** 原 ie（jsx 67）：任务运行时缺省态。 */
const initialTaskRuntimeState: TaskRuntimeState = {
  status: `notReady`,
  error: null,
  provider: void 0,
  contextWindow: null,
  usage: null,
  apiRetry: null,
  backgroundTaskControls: [],
  activeTurnKind: void 0,
  activeInputId: void 0,
  activeInputOwnerClientId: void 0,
};

interface TaskMeta {
  taskId: string;
  traceId?: string | null;
  title: string;
  titleOverridden?: boolean;
  workspacePath: string;
  workspaceIdentity?: string | null;
  createdAt: number;
  updatedAt: number;
  mode?: string;
  provider?: string | null; // A1-R10 2e 精化：补 null 支 = canonical 真形（消费点 266 `??` 链兼容）
  model?: string | null;
  thoughtLevel?: string | null;
  status?: string;
  unreadAt?: number | null;
  changeSummary?: unknown;
}

interface ConfigOptionItem {
  name: string;
  value: string;
  description?: string;
}

// 〔A1-R56〕型缝：interface→type 声明形（成员逐字不变）——型别名获隐式索引签名，
// 使本真形可赋 SubagentLeaves.ConfigOption（A0 宽化索引签名面）；Jq 域外消费
// （AutomationEditor kNt 137022 / SubagentsSettingsSection H1t 197845）改指 Home §U.11 后双面桥接所依。
type ConfigOption = {
  id: string;
  name: string;
  category: string;
  type: string;
  currentValue?: string;
  options?: ConfigOptionItem[];
  groupId?: string;
};

interface GroupedDraftPlacement {
  type: string;
  groupId?: string;
}

interface GroupedDraftTask {
  draftId: string;
  workspacePath: string;
  workspaceIdentity?: string;
  placement: GroupedDraftPlacement;
  createdAt: number;
}

interface WorkspaceTaskState {
  activeTaskId: string | null;
  workspaceInit: WorkspaceInitState;
  draftRuntime: { status: string; error: string | null };
  draftSessionId: string | null;
  draftRuntimeInvalidationVersion: number;
  composerTextInsertVersion: number;
  composerTextInsertRequest: { requestId: number; text: string; mention?: unknown } | null;
  draftPreferredModel: string | null;
  draftPreferredMode: string | null;
  draftPreferredThoughtLevel: string | null;
  draftError: string | null;
  modelSwitchRequestId: string | null;
  modelSwitchPending: boolean;
  modelSwitchStage: string;
  taskRuntimeByTaskId: Record<string, TaskRuntimeState>;
  taskUiByTaskId: Record<string, TaskUiState>;
  taskConfigOptionsByTaskId: Record<string, ConfigOption[]>;
  taskConfigOptionsStatusByTaskId: Record<string, string>;
  taskUnreadByTaskId: Record<string, boolean>;
  optimisticTaskListByTaskId: Record<string, TaskMeta>;
  groupedDraftTask: GroupedDraftTask | null;
  promotedGroupedDraftTaskByTaskId: Record<string, GroupedDraftTask>;
  selectedProvider: string;
  selectedSupplierKey: string;
  isGhostSupplier: boolean;
  supplierMismatchReason: string | null;
  configOptions: ConfigOption[] | null;
  configOptionsStatus: string;
  slashCommands: unknown[];
  taskListVersion: number;
  taskListCache: TaskMeta[] | null;
  draftFocusVersion: number;
  optimisticMessages?: unknown[];
}

/** 原 ae（jsx 79）：工作区任务状态初始工厂。 */
function createInitialWorkspaceTaskState(selectedProvider: string): WorkspaceTaskState {
  return {
    activeTaskId: null,
    workspaceInit: {
      ...initialWorkspaceInitState,
    },
    draftRuntime: {
      status: `idle`,
      error: null,
    },
    draftSessionId: null,
    draftRuntimeInvalidationVersion: 0,
    composerTextInsertVersion: 0,
    composerTextInsertRequest: null,
    draftPreferredModel: null,
    draftPreferredMode: null,
    draftPreferredThoughtLevel: null,
    draftError: null,
    modelSwitchRequestId: null,
    modelSwitchPending: false,
    modelSwitchStage: `idle`,
    taskRuntimeByTaskId: {},
    taskUiByTaskId: {},
    taskConfigOptionsByTaskId: {},
    taskConfigOptionsStatusByTaskId: {},
    taskUnreadByTaskId: {},
    optimisticTaskListByTaskId: {},
    groupedDraftTask: null,
    promotedGroupedDraftTaskByTaskId: {},
    selectedProvider: selectedProvider,
    selectedSupplierKey: formatNativeSupplierKey(selectedProvider),
    isGhostSupplier: false,
    supplierMismatchReason: null,
    configOptions: null,
    configOptionsStatus: `idle`,
    slashCommands: [],
    taskListVersion: 0,
    taskListCache: null,
    draftFocusVersion: 0,
  };
}

/** 原 oe（jsx 120）：缺省工作区任务状态（单例）。 */
const defaultWorkspaceTaskState = createInitialWorkspaceTaskState(DEFAULT_PROVIDER);

/** 原 se（jsx 121）：取缺省工作区任务状态。 */
function getDefaultWorkspaceTaskState(): WorkspaceTaskState {
  return defaultWorkspaceTaskState;
}

/** 原 ce（jsx 124）：hasOwnProperty。 */
function hasOwnProperty(target: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(target, key);
}

/** 原 le（jsx 127）：无题任务标题判定（空或 `new session`）。 */
function isUntitledTaskTitle(title: string): boolean {
  const trimmed = title.trim().toLocaleLowerCase();
  return trimmed.length === 0 || trimmed === `new session`;
}

/** 原 ue（jsx 131）：标题择优（覆盖优先，无题让位）。 */
function pickTaskTitle(preferred: TaskMeta, fallback: TaskMeta): string {
  return (preferred.titleOverridden && !fallback.titleOverridden) ||
    (isUntitledTaskTitle(preferred.title) && !isUntitledTaskTitle(fallback.title))
    ? fallback.title
    : preferred.title;
}

/** 原 y（jsx 134）：任务元数据合并（updatedAt 新者胜；字段互补；导出 G）。 */
function mergeTaskMeta(base: TaskMeta, incoming: TaskMeta): TaskMeta {
  const incomingIsNewer =
    incoming.updatedAt > base.updatedAt || (incoming.updatedAt === base.updatedAt && incoming.title.length > base.title.length);
  const newer = incomingIsNewer ? incoming : base;
  const older = incomingIsNewer ? base : incoming;
  const unreadAt = hasOwnProperty(incoming, `unreadAt`) ? incoming.unreadAt : newer.unreadAt ?? older.unreadAt;
  return {
    ...newer,
    changeSummary: newer.changeSummary ?? older.changeSummary,
    model: newer.model ?? older.model,
    provider: newer.provider ?? older.provider,
    title: pickTaskTitle(newer, older),
    titleOverridden: newer.titleOverridden === true || older.titleOverridden === true ? true : newer.titleOverridden ?? older.titleOverridden,
    status: newer.status ?? older.status,
    unreadAt: unreadAt,
  };
}

/** 原 de（jsx 150）：多任务元数据合并（导出 W）。 */
function mergeTaskMetaMany(...candidates: Array<TaskMeta | null | undefined>): TaskMeta | undefined {
  let merged: TaskMeta | undefined;
  for (const candidate of candidates) candidate && (merged = merged ? mergeTaskMeta(candidate, merged) : candidate);
  return merged;
}

/** 原 b（jsx 155）：工作区键解析（identity 优先，回退 path；导出 H）。 */
function resolveWorkspaceKey(workspacePath: string, workspaceIdentity?: string | null): string {
  return workspaceIdentity?.trim() || workspacePath;
}

/** 原 x（jsx 158）：按任务 ID 集合过滤记录。 */
function pickRecordByTaskIds<T>(record: Record<string, T>, taskIds: Set<string>): Record<string, T> {
  const entries = Object.entries(record).filter(([taskId]) => taskIds.has(taskId));
  return entries.length > 0 ? Object.fromEntries(entries) : {};
}

/** 原 fe（jsx 162）：收集工作区内任务 ID（缓存 + 乐观表）。 */
function collectWorkspaceTaskIds(workspaceState: WorkspaceTaskState, workspaceIdentity: string): Set<string> {
  const identityKey = workspaceIdentity.trim();
  const taskIds = new Set<string>();
  for (const task of workspaceState.taskListCache ?? []) task.workspaceIdentity?.trim() === identityKey && taskIds.add(task.taskId);
  for (const task of Object.values(workspaceState.optimisticTaskListByTaskId))
    task.workspaceIdentity?.trim() === identityKey && taskIds.add(task.taskId);
  return taskIds;
}

/** 原 pe（jsx 169）：按身份作用域裁剪工作区任务状态。 */
function scopeWorkspaceTaskState(
  workspaceState: WorkspaceTaskState | undefined,
  workspaceIdentity: string,
): WorkspaceTaskState {
  if (!workspaceState) return createInitialWorkspaceTaskState(getDefaultWorkspaceTaskState().selectedProvider);
  const scoped = createInitialWorkspaceTaskState(workspaceState.selectedProvider);
  const taskIds = workspaceIdentity ? collectWorkspaceTaskIds(workspaceState, workspaceIdentity) : new Set<string>();
  const taskListCache = workspaceState.taskListCache?.filter((task) => taskIds.has(task.taskId)) ?? null;
  return {
    ...scoped,
    selectedSupplierKey: workspaceState.selectedSupplierKey,
    isGhostSupplier: workspaceState.isGhostSupplier,
    supplierMismatchReason: workspaceState.supplierMismatchReason,
    configOptions: workspaceState.configOptions,
    configOptionsStatus: workspaceState.configOptionsStatus,
    slashCommands: workspaceState.slashCommands,
    ...(taskIds.size > 0
      ? {
          activeTaskId: workspaceState.activeTaskId && taskIds.has(workspaceState.activeTaskId) ? workspaceState.activeTaskId : scoped.activeTaskId,
          optimisticTaskListByTaskId: pickRecordByTaskIds(workspaceState.optimisticTaskListByTaskId, taskIds),
          taskConfigOptionsByTaskId: pickRecordByTaskIds(workspaceState.taskConfigOptionsByTaskId, taskIds),
          taskConfigOptionsStatusByTaskId: pickRecordByTaskIds(workspaceState.taskConfigOptionsStatusByTaskId, taskIds),
          taskListCache: taskListCache,
          taskListVersion: workspaceState.taskListVersion,
          taskRuntimeByTaskId: pickRecordByTaskIds(workspaceState.taskRuntimeByTaskId, taskIds),
          taskUiByTaskId: pickRecordByTaskIds(workspaceState.taskUiByTaskId, taskIds),
          taskUnreadByTaskId: pickRecordByTaskIds(workspaceState.taskUnreadByTaskId, taskIds),
        }
      : {}),
  };
}

interface TaskStoreState {
  workspaces: Record<string, WorkspaceTaskState>;
  taskNavHistory: TaskNavHistory;
  [key: string]: unknown;
}

/** 原 S（jsx 195）：取工作区任务状态（身份键回退路径键；导出 V）。 */
function getWorkspaceTaskState(
  state: TaskStoreState,
  workspacePath: string,
  workspaceIdentity?: string | null,
): WorkspaceTaskState {
  const fallback = state.workspaces[workspacePath] ?? getDefaultWorkspaceTaskState();
  const resolvedKey = resolveWorkspaceKey(workspacePath, workspaceIdentity);
  return resolvedKey === workspacePath ? fallback : state.workspaces[resolvedKey] || fallback;
}

/** 原 C（jsx 200）：工作区任务状态更新器（返回 workspaces 补丁）。 */
function updateWorkspaceTaskState(
  state: TaskStoreState,
  workspacePath: string,
  updater: (workspaceState: WorkspaceTaskState) => WorkspaceTaskState,
  workspaceIdentity?: string | null,
): { workspaces: Record<string, WorkspaceTaskState> } {
  const resolvedKey = resolveWorkspaceKey(workspacePath, workspaceIdentity);
  const workspaceState =
    resolvedKey === workspacePath
      ? getWorkspaceTaskState(state, workspacePath, workspaceIdentity)
      : state.workspaces[resolvedKey] ?? scopeWorkspaceTaskState(state.workspaces[workspacePath], workspaceIdentity ?? ``);
  const nextWorkspaceState = updater(workspaceState);
  return nextWorkspaceState === workspaceState
    ? {
        workspaces: state.workspaces,
      }
    : resolvedKey === workspacePath
      ? {
          workspaces: {
            ...state.workspaces,
            [workspacePath]: nextWorkspaceState,
          },
        }
      : {
          workspaces: {
            ...state.workspaces,
            [resolvedKey]: nextWorkspaceState,
          },
        };
}

/** 原 w（jsx 218）：取任务运行时（缺省 initialTaskRuntimeState；导出 F）。 */
function getTaskRuntime(workspaceState: WorkspaceTaskState, taskId: string): TaskRuntimeState {
  return workspaceState.taskRuntimeByTaskId[taskId] ?? initialTaskRuntimeState;
}

/** 原 me（jsx 221）：当前任务（或草稿）状态/错误（导出 z）。 */
function getActiveTaskStatusError(workspaceState: WorkspaceTaskState): { taskStatus: string; taskError: string | null } {
  if (!workspaceState.activeTaskId)
    return {
      taskStatus: workspaceState.draftRuntime.status,
      taskError: workspaceState.draftRuntime.error,
    };
  const runtime = getTaskRuntime(workspaceState, workspaceState.activeTaskId);
  return {
    taskStatus: runtime.status,
    taskError: runtime.error,
  };
}

/** 原 T（jsx 232）：取任务 UI 态（缺省 initialTaskUiState；导出 I）。 */
function getTaskUi(workspaceState: WorkspaceTaskState, taskId: string): TaskUiState {
  return workspaceState.taskUiByTaskId[taskId] ?? initialTaskUiState;
}

/** 原 E（jsx 235）：合并乐观表与缓存的单条任务（导出 P）。 */
function getMergedTaskListItem(workspaceState: WorkspaceTaskState, taskId: string): TaskMeta | null {
  const optimistic = workspaceState.optimisticTaskListByTaskId?.[taskId];
  const cached = workspaceState.taskListCache?.find((task) => task.taskId === taskId) ?? null;
  return optimistic ? (cached ? mergeTaskMeta(cached, optimistic) : optimistic) : cached;
}

/** 原 he（jsx 240）：合并任务列表（缓存 + 乐观表去重；导出 R）。 */
function getMergedTaskList(workspaceState: WorkspaceTaskState): TaskMeta[] {
  const merged = new Map<string, TaskMeta>();
  for (const task of workspaceState.taskListCache ?? []) merged.set(task.taskId, task);
  for (const task of Object.values(workspaceState.optimisticTaskListByTaskId ?? {}))
    merged.set(task.taskId, getMergedTaskListItem(workspaceState, task.taskId) ?? task);
  return Array.from(merged.values());
}

/** 原 ge（jsx 246）：任务未读判定（导出 L）。 */
function isTaskUnread(workspaceState: WorkspaceTaskState, taskId: string, task?: TaskMeta | null): boolean {
  return !!(getMergedTaskListItem(workspaceState, taskId) ?? task)?.unreadAt || workspaceState.taskUnreadByTaskId?.[taskId] === true;
}

/** 原 _e（jsx 249）：getWorkspaceTaskState 别名（导出 U；styles 侧 `fe`）。 */
function getWorkspaceTaskStateAlias(
  state: TaskStoreState,
  workspacePath: string,
  workspaceIdentity?: string | null,
): WorkspaceTaskState {
  return getWorkspaceTaskState(state, workspacePath, workspaceIdentity);
}

/** 原 ve（jsx 252）：取工作区初始化态（导出 B）。 */
function getWorkspaceInit(workspaceState: WorkspaceTaskState): WorkspaceInitState {
  return workspaceState.workspaceInit ?? initialWorkspaceInitState;
}

/* ============================================================================
 * 4. 任务导航历史（原 ye–Me，jsx 255–376）
 * ==========================================================================*/

/** 原 ye（jsx 255）：历史上限。 */
const TASK_NAV_HISTORY_LIMIT = 50;

interface TaskNavEntry {
  kind: string;
  workspacePath: string;
  workspaceIdentity?: string;
  taskId?: string;
  automationId?: string;
}

interface TaskNavHistory {
  entries: TaskNavEntry[];
  cursor: number;
}

/** 原 be（jsx 256）：空历史。 */
function createEmptyTaskNavHistory(): TaskNavHistory {
  return {
    entries: [],
    cursor: -1,
  };
}

/** 原 xe（jsx 262）：任务型条目。 */
function isTaskNavTaskEntry(entry: TaskNavEntry): boolean {
  return entry.kind === `task`;
}

/** 原 Se（jsx 265）：自动化型条目（导出 N）。 */
function isTaskNavAutomationsEntry(entry: TaskNavEntry): boolean {
  return entry.kind === `automations`;
}

/** 原 Ce（jsx 268）：条目相同判定。 */
function isSameTaskNavEntry(first: TaskNavEntry, second: TaskNavEntry): boolean {
  return first.kind !== second.kind || first.workspacePath !== second.workspacePath || first.workspaceIdentity !== second.workspaceIdentity
    ? false
    : first.kind === `task`
      ? first.taskId === second.taskId
      : first.automationId === second.automationId;
}

/** 原 we（jsx 271）：压入条目（截断旧史，超限裁剪）。 */
function pushTaskNavEntry(history: TaskNavHistory, entry: TaskNavEntry): TaskNavHistory {
  const current = history.cursor >= 0 ? history.entries[history.cursor] : null;
  if (current && isSameTaskNavEntry(current, entry)) return history;
  const entries = [...history.entries.slice(0, history.cursor + 1), entry];
  if (entries.length > TASK_NAV_HISTORY_LIMIT) {
    const overflow = entries.length - TASK_NAV_HISTORY_LIMIT;
    return {
      entries: entries.slice(overflow),
      cursor: entries.length - overflow - 1,
    };
  }
  return {
    entries: entries,
    cursor: entries.length - 1,
  };
}

/** 原 Te（jsx 287）：压入任务条目。 */
function pushTaskNavTaskEntry(
  history: TaskNavHistory,
  workspacePath: string,
  taskId: string,
  workspaceIdentity?: string | null,
): TaskNavHistory {
  return pushTaskNavEntry(history, {
    kind: `task`,
    workspacePath: workspacePath,
    ...(workspaceIdentity ? { workspaceIdentity: workspaceIdentity } : {}),
    taskId: taskId,
  });
}

/** 原 Ee（jsx 297）：压入自动化条目。 */
function pushTaskNavAutomationsEntry(
  history: TaskNavHistory,
  workspacePath: string,
  workspaceIdentity?: string | null,
  automationId?: string | null,
): TaskNavHistory {
  return pushTaskNavEntry(history, {
    kind: `automations`,
    workspacePath: workspacePath,
    ...(workspaceIdentity ? { workspaceIdentity: workspaceIdentity } : {}),
    ...(automationId ? { automationId: automationId } : {}),
  });
}

/** 原 De（jsx 309）：可后退（导出 j）。 */
function canGoBackInTaskNav(history: TaskNavHistory): boolean {
  return history.cursor > 0;
}

/** 原 Oe（jsx 312）：可前进（导出 M）。 */
function canGoForwardInTaskNav(history: TaskNavHistory): boolean {
  return history.cursor < history.entries.length - 1;
}

/** 原 ke（jsx 315）：后退一步。 */
function goBackInTaskNavHistory(history: TaskNavHistory): { history: TaskNavHistory; entry: TaskNavEntry } | null {
  if (!canGoBackInTaskNav(history)) return null;
  const cursor = history.cursor - 1;
  const entry = history.entries[cursor];
  return entry
    ? {
        history: {
          ...history,
          cursor: cursor,
        },
        entry: entry,
      }
    : null;
}

/** 原 Ae（jsx 327）：前进一步。 */
function goForwardInTaskNavHistory(history: TaskNavHistory): { history: TaskNavHistory; entry: TaskNavEntry } | null {
  if (!canGoForwardInTaskNav(history)) return null;
  const cursor = history.cursor + 1;
  const entry = history.entries[cursor];
  return entry
    ? {
        history: {
          ...history,
          cursor: cursor,
        },
        entry: entry,
      }
    : null;
}

/** 原 je（jsx 339）：按任务 ID 移除历史条目。 */
function removeTaskFromTaskNavHistory(history: TaskNavHistory, taskId: string): TaskNavHistory {
  const current = history.cursor >= 0 ? history.entries[history.cursor] : null;
  const entries = history.entries.filter((entry) => !isTaskNavTaskEntry(entry) || entry.taskId !== taskId);
  if (entries.length === history.entries.length) return history;
  if (entries.length === 0) return createEmptyTaskNavHistory();
  const currentIndex = current ? entries.indexOf(current) : -1;
  return {
    entries: entries,
    cursor: currentIndex >= 0 ? currentIndex : Math.min(history.cursor, entries.length - 1),
  };
}

/** 原 Me（jsx 350）：导航动作工厂（含历史初态 + 四动作）。 */
function createTaskNavActions(set: SetStateFn<TaskStoreState>, get: GetStateFn<TaskStoreState>) {
  return {
    taskNavHistory: createEmptyTaskNavHistory(),
    taskNavPushAutomations: (workspacePath: string, workspaceIdentity?: string | null, automationId?: string | null) => {
      set((state) => ({
        taskNavHistory: pushTaskNavAutomationsEntry(state.taskNavHistory, workspacePath, workspaceIdentity, automationId),
      }));
    },
    taskNavGoBack: (): TaskNavEntry | null => {
      const result = goBackInTaskNavHistory(get().taskNavHistory);
      return result ? (set({
        taskNavHistory: result.history,
      }), result.entry) : null;
    },
    taskNavGoForward: (): TaskNavEntry | null => {
      const result = goForwardInTaskNavHistory(get().taskNavHistory);
      return result ? (set({
        taskNavHistory: result.history,
      }), result.entry) : null;
    },
    removeTaskFromNavHistory: (taskId: string) => {
      set((state) => ({
        taskNavHistory: removeTaskFromTaskNavHistory(state.taskNavHistory, taskId),
      }));
    },
  };
}

/* ============================================================================
 * 5. composer 草稿持久化（原 Ne–Re，jsx 377–426）
 * ==========================================================================*/

/** 原 Ne（jsx 377）：草稿存储键前缀。 */
const COMPOSER_DRAFT_STORAGE_PREFIX = `zcode-chat-composer-drafts:v1:`;

/** 原 Pe（jsx 378）：缺省草稿作用域。 */
const DEFAULT_DRAFT_SCOPE = `__draft__`;

/** 原 Fe（jsx 379）：localStorage 守卫。 */
function getDraftStorage(): Storage | null {
  if (typeof window > `u`) return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** 原 Ie（jsx 387）：草稿存储键。 */
function getComposerDraftStorageKey(workspacePath: string, workspaceIdentity?: string | null): string {
  const resolvedKey = workspaceIdentity?.trim() || workspacePath;
  return `${COMPOSER_DRAFT_STORAGE_PREFIX}${encodeURIComponent(resolvedKey)}`;
}

/** 原 Le（jsx 391）：读草稿存储（version 1 校验）。 */
function readComposerDraftStore(
  storage: Storage | null,
  storageKey: string,
): { version: number; scopes: Record<string, unknown> } | null {
  let raw: string | null = null;
  try {
    raw = storage?.getItem(storageKey) ?? null;
  } catch (error) {
    logger.warn(`[chatComposerDraftStorage] 读取 composer 草稿持久化失败`, {
      error: error instanceof Error ? error.message : String(error),
      key: storageKey,
    });
  }
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed.version !== 1 || typeof parsed.scopes != `object` || parsed.scopes === null
      ? null
      : {
          version: 1,
          scopes: parsed.scopes,
        };
  } catch {
    return null;
  }
}

/** 原 Re（jsx 412）：清除草稿作用域（空表删键）。 */
function clearComposerDraftScope(
  workspacePath: string,
  taskId: string | null,
  workspaceIdentity?: string | null,
  storage: Storage | null = getDraftStorage(),
): void {
  const storageKey = getComposerDraftStorageKey(workspacePath, workspaceIdentity);
  const draftStore = readComposerDraftStore(storage, storageKey);
  if (draftStore) {
    delete draftStore.scopes[taskId ?? DEFAULT_DRAFT_SCOPE];
    try {
      Object.keys(draftStore.scopes).length === 0 ? storage?.removeItem(storageKey) : storage?.setItem(storageKey, JSON.stringify(draftStore));
    } catch (error) {
      logger.warn(`[chatComposerDraftStorage] 清理 composer 草稿持久化失败`, {
        error: error instanceof Error ? error.message : String(error),
        key: storageKey,
      });
    }
  }
}

/* ============================================================================
 * 6. 等价性判定（原 ze–Je，jsx 427–464）
 * ==========================================================================*/

/** 原 ze（jsx 427）：配置选项值 JSON 等价。 */
function isSameConfigOptionValueJson(first: unknown, second: unknown): boolean {
  return JSON.stringify(first) === JSON.stringify(second);
}

/** 原 Be（jsx 430）：配置选项列表等价。 */
function areConfigOptionsEqual(first: ConfigOption[] | null | undefined, second: ConfigOption[] | null | undefined): boolean {
  return first === second
    ? true
    : !first || !second || first.length !== second.length
      ? false
      : first.every((option, index) => {
          const other = second[index];
          return !!other && isSameConfigOptionValueJson(option, other);
        });
}

/** 原 Ve（jsx 436）：任务列表按更新时间/创建时间/ID 倒序。 */
function sortTaskListByRecency(tasks: TaskMeta[]): TaskMeta[] {
  return [...tasks].sort((a, b) =>
    b.updatedAt === a.updatedAt
      ? b.createdAt === a.createdAt
        ? b.taskId.localeCompare(a.taskId)
        : b.createdAt - a.createdAt
      : b.updatedAt - a.updatedAt,
  );
}

/** 原 He（jsx 439）：elicitation 选项列表等价。 */
function areElicitationOptionListsEqual(first: TaskInteractionOption[], second: TaskInteractionOption[]): boolean {
  return first.length === second.length
    ? first.every((option, index) => {
        const other = second[index];
        return other ? option.optionId === other.optionId && option.kind === other.kind && option.name === other.name : false;
      })
    : false;
}

/** 原 Ue（jsx 445）：交互请求等价（权限/elicitation 共用）。 */
function isSameTaskInteractionRequest(first: TaskInteractionRequest, second: TaskInteractionRequest): boolean {
  return first === second
    ? true
    : first.requestId === second.requestId &&
        first.taskId === second.taskId &&
        first.traceId === second.traceId &&
        first.inputId === second.inputId &&
        first.kind === second.kind &&
        first.title === second.title &&
        first.description === second.description &&
        areElicitationOptionListsEqual(first.options, second.options);
}

/** 原 We（jsx 448）：用量成本等价。 */
function isSameUsageCost(first?: UsageCost | null, second?: UsageCost | null): boolean {
  const firstCost = first ?? null;
  const secondCost = second ?? null;
  return firstCost === null || secondCost === null ? firstCost === secondCost : firstCost.amount === secondCost.amount && firstCost.currency === secondCost.currency;
}

interface UsageCost {
  amount: number;
  currency: string;
}

interface UsageCacheStats {
  inputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  latestHitRate: number;
  hitRate: number;
  hitRateRequestCount: number;
  totalInputTokens: number;
  totalCacheReadTokens: number;
  totalCacheWriteTokens: number;
}

interface UsageBreakdownItem {
  source: string;
  chars: number;
}

interface TaskUsage {
  size: number;
  used: number;
  cost: UsageCost | null;
  cache: UsageCacheStats | null;
  breakdown: UsageBreakdownItem[];
}

/** 原 Ge（jsx 453）：缓存统计等价。 */
function isSameUsageCacheStats(first?: UsageCacheStats | null, second?: UsageCacheStats | null): boolean {
  return first === second
    ? true
    : !first || !second
      ? false
      : first.inputTokens === second.inputTokens &&
          first.cacheReadTokens === second.cacheReadTokens &&
          first.cacheWriteTokens === second.cacheWriteTokens &&
          first.latestHitRate === second.latestHitRate &&
          first.hitRate === second.hitRate &&
          first.hitRateRequestCount === second.hitRateRequestCount &&
          first.totalInputTokens === second.totalInputTokens &&
          first.totalCacheReadTokens === second.totalCacheReadTokens &&
          first.totalCacheWriteTokens === second.totalCacheWriteTokens;
}

/** 原 Ke（jsx 456）：用量分项等价。 */
function isSameUsageBreakdown(first?: UsageBreakdownItem[], second?: UsageBreakdownItem[]): boolean {
  return first === second
    ? true
    : !first || !second || first.length !== second.length
      ? false
      : first.every((item, index) => item.source === second[index]?.source && item.chars === second[index]?.chars);
}

/** 原 qe（jsx 459）：任务用量等价。 */
function isSameTaskUsage(first?: TaskUsage | null, second?: TaskUsage | null): boolean {
  return first === second
    ? true
    : !first || !second
      ? false
      : first.size === second.size &&
          first.used === second.used &&
          isSameUsageCost(first.cost, second.cost) &&
          isSameUsageCacheStats(first.cache, second.cache) &&
          isSameUsageBreakdown(first.breakdown, second.breakdown);
}

/** 原 Je（jsx 462）：上下文窗口归一（正有限数取整，否则 null）。 */
function normalizeContextWindow(value: number | null): number | null {
  return value === null || !Number.isFinite(value) || value <= 0 ? null : Math.floor(value);
}

/* ============================================================================
 * 7. 运行时动作族（原 Ye/Xe，jsx 465–849；16 动作）
 * ==========================================================================*/

/** 原 Ye（jsx 465）：身份解析后的工作区更新（与 C 的差别：解析键直写）。 */
function updateWorkspaceTaskStateResolved(
  state: TaskStoreState,
  workspacePath: string,
  workspaceIdentity: string | null | undefined,
  updater: (workspaceState: WorkspaceTaskState) => WorkspaceTaskState,
): { workspaces: Record<string, WorkspaceTaskState> } {
  const resolvedKey = resolveWorkspaceKey(workspacePath, workspaceIdentity);
  if (resolvedKey === workspacePath) return updateWorkspaceTaskState(state, workspacePath, updater);
  const workspaceState = state.workspaces[resolvedKey] ?? getDefaultWorkspaceTaskState();
  return {
    workspaces: {
      ...state.workspaces,
      [resolvedKey]: updater(workspaceState),
    },
  };
}

interface BackgroundTaskRuntimePayload {
  task: TaskMeta;
  provider: string;
  activeInputId?: string;
  workspaceIdentity?: string | null;
}

/** 原 Xe（jsx 476）：任务运行时动作工厂（16 动作）。 */
function createTaskRuntimeActions(set: SetStateFn<TaskStoreState>) {
  return {
    setTaskRuntimeState: (
      workspacePath: string,
      taskId: string,
      status: string,
      error: string | null,
      workspaceIdentity?: string | null,
      provider?: string | null,
    ) => {
      set((state) =>
        updateWorkspaceTaskState(
          state,
          workspacePath,
          (workspaceState) => {
            const runtime = getTaskRuntime(workspaceState, taskId);
            const keepActiveTurn = status === `creating` || status === `restoring` || status === `streaming`;
            const nextRuntime: TaskRuntimeState = {
              ...runtime,
              status: status,
              error: error ?? null,
              provider: provider ?? runtime.provider,
              activeTurnKind: keepActiveTurn ? runtime.activeTurnKind : void 0,
              activeInputId: keepActiveTurn ? runtime.activeInputId : void 0,
              activeInputOwnerClientId: keepActiveTurn ? runtime.activeInputOwnerClientId : void 0,
            };
            return {
              ...workspaceState,
              taskRuntimeByTaskId: {
                ...workspaceState.taskRuntimeByTaskId,
                [taskId]: nextRuntime,
              },
            };
          },
          workspaceIdentity,
        ),
      );
    },
    setTaskUsage: (workspacePath: string, taskId: string, usage: TaskUsage | null, workspaceIdentity?: string | null) => {
      set((state) =>
        isSameTaskUsage(getTaskRuntime(getWorkspaceTaskState(state, workspacePath, workspaceIdentity), taskId).usage, usage)
          ? state
          : updateWorkspaceTaskStateResolved(state, workspacePath, workspaceIdentity, (workspaceState) => ({
              ...workspaceState,
              taskRuntimeByTaskId: {
                ...workspaceState.taskRuntimeByTaskId,
                [taskId]: {
                  ...getTaskRuntime(workspaceState, taskId),
                  usage: usage,
                },
              },
            })),
      );
    },
    setTaskContextWindow: (workspacePath: string, taskId: string, contextWindow: number | null, workspaceIdentity?: string | null) => {
      const normalized = normalizeContextWindow(contextWindow);
      set((state) =>
        getTaskRuntime(getWorkspaceTaskState(state, workspacePath, workspaceIdentity), taskId).contextWindow === normalized
          ? state
          : updateWorkspaceTaskStateResolved(state, workspacePath, workspaceIdentity, (workspaceState) => ({
              ...workspaceState,
              taskRuntimeByTaskId: {
                ...workspaceState.taskRuntimeByTaskId,
                [taskId]: {
                  ...getTaskRuntime(workspaceState, taskId),
                  contextWindow: normalized,
                },
              },
            })),
      );
    },
    setTaskApiRetryStatus: (workspacePath: string, taskId: string, apiRetry: unknown, workspaceIdentity?: string | null) => {
      set((state) =>
        updateWorkspaceTaskState(
          state,
          workspacePath,
          (workspaceState) => ({
            ...workspaceState,
            taskRuntimeByTaskId: {
              ...workspaceState.taskRuntimeByTaskId,
              [taskId]: {
                ...getTaskRuntime(workspaceState, taskId),
                apiRetry: apiRetry,
              },
            },
          }),
          workspaceIdentity,
        ),
      );
    },
    setTaskConfigOptions: (
      workspacePath: string,
      taskId: string,
      options: ConfigOption[],
      workspaceIdentity?: string | null,
      status: string = `ready`,
    ) => {
      const nextOptions = [...options];
      set((state) => {
        const workspaceState = getWorkspaceTaskState(state, workspacePath, workspaceIdentity);
        const currentOptions = workspaceState.taskConfigOptionsByTaskId[taskId] ?? [];
        return (workspaceState.taskConfigOptionsStatusByTaskId[taskId] ?? `ready`) === status && areConfigOptionsEqual(currentOptions, nextOptions)
          ? state
          : updateWorkspaceTaskState(
              state,
              workspacePath,
              (innerState) => ({
                ...innerState,
                taskConfigOptionsByTaskId: {
                  ...innerState.taskConfigOptionsByTaskId,
                  [taskId]: nextOptions,
                },
                taskConfigOptionsStatusByTaskId: {
                  ...innerState.taskConfigOptionsStatusByTaskId,
                  [taskId]: status,
                },
              }),
              workspaceIdentity,
            );
      });
    },
    setTaskPermissionRequest: (
      workspacePath: string,
      taskId: string,
      request: TaskInteractionRequest | null,
      workspaceIdentity?: string | null,
    ) => {
      set((state) =>
        updateWorkspaceTaskState(
          state,
          workspacePath,
          (workspaceState) => {
            const taskUi = getTaskUi(workspaceState, taskId);
            if (request === null)
              return taskUi.permissionRequest === null && taskUi.pendingPermissionRequests.length === 0
                ? workspaceState
                : {
                    ...workspaceState,
                    taskUiByTaskId: {
                      ...workspaceState.taskUiByTaskId,
                      [taskId]: {
                        ...taskUi,
                        permissionRequest: null,
                        pendingPermissionRequests: [],
                      },
                    },
                  };
            const currentRequest = taskUi.permissionRequest;
            const pendingRequests = taskUi.pendingPermissionRequests ?? [];
            let nextRequest = currentRequest;
            let nextPending = pendingRequests;
            if (currentRequest?.requestId === request.requestId) {
              if (isSameTaskInteractionRequest(currentRequest, request)) return workspaceState;
              nextRequest = request;
            } else if (currentRequest === null) nextRequest = request, nextPending = pendingRequests.filter((pending) => pending.requestId !== request.requestId);
            else {
              const pendingIndex = pendingRequests.findIndex((pending) => pending.requestId === request.requestId);
              if (pendingIndex >= 0) {
                const existing = pendingRequests[pendingIndex];
                if (!existing || isSameTaskInteractionRequest(existing, request)) return workspaceState;
                nextPending = pendingRequests.map((pending, index) => (index === pendingIndex ? request : pending));
              } else nextPending = [...pendingRequests, request];
            }
            return {
              ...workspaceState,
              taskUiByTaskId: {
                ...workspaceState.taskUiByTaskId,
                [taskId]: {
                  ...taskUi,
                  permissionRequest: nextRequest,
                  pendingPermissionRequests: nextPending,
                },
              },
            };
          },
          workspaceIdentity,
        ),
      );
    },
    removeTaskPermissionRequest: (workspacePath: string, taskId: string, requestId: string, workspaceIdentity?: string | null) => {
      set((state) =>
        updateWorkspaceTaskState(
          state,
          workspacePath,
          (workspaceState) => {
            const taskUi = getTaskUi(workspaceState, taskId);
            const currentRequest = taskUi.permissionRequest;
            const pendingRequests = taskUi.pendingPermissionRequests ?? [];
            if (currentRequest?.requestId === requestId) {
              const [nextRequest, ...restPending] = pendingRequests;
              return {
                ...workspaceState,
                taskUiByTaskId: {
                  ...workspaceState.taskUiByTaskId,
                  [taskId]: {
                    ...taskUi,
                    permissionRequest: nextRequest ?? null,
                    pendingPermissionRequests: restPending,
                  },
                },
              };
            }
            const pendingIndex = pendingRequests.findIndex((pending) => pending.requestId === requestId);
            return pendingIndex < 0
              ? workspaceState
              : {
                  ...workspaceState,
                  taskUiByTaskId: {
                    ...workspaceState.taskUiByTaskId,
                    [taskId]: {
                      ...taskUi,
                      pendingPermissionRequests: pendingRequests.filter((pending, index) => index !== pendingIndex),
                    },
                  },
                };
          },
          workspaceIdentity,
        ),
      );
    },
    setTaskElicitationRequest: (
      workspacePath: string,
      taskId: string,
      request: TaskInteractionRequest | null,
      workspaceIdentity?: string | null,
    ) => {
      set((state) =>
        updateWorkspaceTaskState(
          state,
          workspacePath,
          (workspaceState) => {
            const taskUi = getTaskUi(workspaceState, taskId);
            if (request === null)
              return {
                ...workspaceState,
                taskUiByTaskId: {
                  ...workspaceState.taskUiByTaskId,
                  [taskId]: {
                    ...taskUi,
                    elicitationRequest: null,
                    pendingElicitationRequests: [],
                  },
                },
              };
            const currentRequest = taskUi.elicitationRequest;
            const pendingRequests = taskUi.pendingElicitationRequests ?? [];
            let nextRequest = currentRequest;
            let nextPending = pendingRequests;
            if (currentRequest?.requestId === request.requestId) nextRequest = request;
            else if (currentRequest === null) nextRequest = request, nextPending = pendingRequests.filter((pending) => pending.requestId !== request.requestId);
            else {
              const pendingIndex = pendingRequests.findIndex((pending) => pending.requestId === request.requestId);
              nextPending = pendingIndex >= 0 ? pendingRequests.map((pending, index) => (index === pendingIndex ? request : pending)) : [...pendingRequests, request];
            }
            return {
              ...workspaceState,
              taskUiByTaskId: {
                ...workspaceState.taskUiByTaskId,
                [taskId]: {
                  ...taskUi,
                  elicitationRequest: nextRequest,
                  pendingElicitationRequests: nextPending,
                },
              },
            };
          },
          workspaceIdentity,
        ),
      );
    },
    removeTaskElicitationRequest: (workspacePath: string, taskId: string, requestId: string, workspaceIdentity?: string | null) => {
      set((state) =>
        updateWorkspaceTaskState(
          state,
          workspacePath,
          (workspaceState) => {
            const taskUi = getTaskUi(workspaceState, taskId);
            const currentRequest = taskUi.elicitationRequest;
            const pendingRequests = taskUi.pendingElicitationRequests ?? [];
            if (currentRequest?.requestId === requestId) {
              const [nextRequest, ...restPending] = pendingRequests;
              return {
                ...workspaceState,
                taskUiByTaskId: {
                  ...workspaceState.taskUiByTaskId,
                  [taskId]: {
                    ...taskUi,
                    elicitationRequest: nextRequest ?? null,
                    pendingElicitationRequests: restPending,
                  },
                },
              };
            }
            return {
              ...workspaceState,
              taskUiByTaskId: {
                ...workspaceState.taskUiByTaskId,
                [taskId]: {
                  ...taskUi,
                  pendingElicitationRequests: pendingRequests.filter((pending) => pending.requestId !== requestId),
                },
              },
            };
          },
          workspaceIdentity,
        ),
      );
    },
    setTaskElicitationFormDraft: (
      workspacePath: string,
      taskId: string,
      requestId: string,
      draft: unknown,
      workspaceIdentity?: string | null,
    ) => {
      set((state) =>
        updateWorkspaceTaskState(
          state,
          workspacePath,
          (workspaceState) => {
            const taskUi = getTaskUi(workspaceState, taskId);
            return {
              ...workspaceState,
              taskUiByTaskId: {
                ...workspaceState.taskUiByTaskId,
                [taskId]: {
                  ...taskUi,
                  elicitationFormDraftsByRequestId: {
                    ...taskUi.elicitationFormDraftsByRequestId,
                    [requestId]: draft,
                  },
                },
              },
            };
          },
          workspaceIdentity,
        ),
      );
    },
    removeTaskElicitationFormDraft: (workspacePath: string, taskId: string, requestId: string, workspaceIdentity?: string | null) => {
      set((state) =>
        updateWorkspaceTaskState(
          state,
          workspacePath,
          (workspaceState) => {
            const taskUi = getTaskUi(workspaceState, taskId);
            if (!(requestId in taskUi.elicitationFormDraftsByRequestId)) return workspaceState;
            const drafts = {
              ...taskUi.elicitationFormDraftsByRequestId,
            };
            return (
              delete drafts[requestId],
              {
                ...workspaceState,
                taskUiByTaskId: {
                  ...workspaceState.taskUiByTaskId,
                  [taskId]: {
                    ...taskUi,
                    elicitationFormDraftsByRequestId: drafts,
                  },
                },
              }
            );
          },
          workspaceIdentity,
        ),
      );
    },
    setTaskError: (workspacePath: string, taskId: string, error: string | null, workspaceIdentity?: string | null) => {
      set((state) =>
        updateWorkspaceTaskState(
          state,
          workspacePath,
          (workspaceState) => ({
            ...workspaceState,
            taskUiByTaskId: {
              ...workspaceState.taskUiByTaskId,
              [taskId]: {
                ...getTaskUi(workspaceState, taskId),
                error: error,
              },
            },
          }),
          workspaceIdentity,
        ),
      );
    },
    initializeBackgroundTaskRuntime: (workspacePath: string, payload: BackgroundTaskRuntimePayload) => {
      set((state) =>
        updateWorkspaceTaskState(
          state,
          workspacePath,
          (workspaceState) => {
            const existingOptimistic = workspaceState.optimisticTaskListByTaskId[payload.task.taskId];
            const mergedTask = existingOptimistic ? mergeTaskMeta(payload.task, existingOptimistic) : payload.task;
            const runtime = getTaskRuntime(workspaceState, payload.task.taskId);
            const taskList = workspaceState.taskListCache ?? [];
            const nextTaskListCache =
              workspaceState.taskListCache === null
                ? workspaceState.taskListCache
                : sortTaskListByRecency([mergedTask, ...taskList.filter((task) => task.taskId !== payload.task.taskId)]);
            return {
              ...workspaceState,
              selectedProvider: resolveAgentProvider(payload.provider),
              optimisticTaskListByTaskId: {
                ...workspaceState.optimisticTaskListByTaskId,
                [payload.task.taskId]: mergedTask,
              },
              taskListCache: nextTaskListCache,
              taskRuntimeByTaskId: {
                ...workspaceState.taskRuntimeByTaskId,
                [payload.task.taskId]: {
                  ...runtime,
                  status: `streaming`,
                  error: null,
                  provider: payload.provider,
                  activeInputId: payload.activeInputId,
                },
              },
            };
          },
          payload.workspaceIdentity ?? payload.task.workspaceIdentity,
        ),
      );
    },
    upsertOptimisticTaskListItem: (workspacePath: string, task: TaskMeta, workspaceIdentity?: string | null) => {
      set((state) =>
        updateWorkspaceTaskState(
          state,
          workspacePath,
          (workspaceState) => {
            const existing = workspaceState.optimisticTaskListByTaskId[task.taskId];
            const merged = existing ? mergeTaskMeta(task, existing) : task;
            return {
              ...workspaceState,
              optimisticTaskListByTaskId: {
                ...workspaceState.optimisticTaskListByTaskId,
                [task.taskId]: merged,
              },
            };
          },
          workspaceIdentity ?? task.workspaceIdentity,
        ),
      );
    },
    removeOptimisticTaskListItem: (workspacePath: string, taskId: string, workspaceIdentity?: string | null) => {
      set((state) =>
        updateWorkspaceTaskState(
          state,
          workspacePath,
          (workspaceState) => {
            const { [taskId]: _removed, ...rest } = workspaceState.optimisticTaskListByTaskId;
            return {
              ...workspaceState,
              optimisticTaskListByTaskId: rest,
            };
          },
          workspaceIdentity,
        ),
      );
    },
    removeTaskState: (workspacePath: string, taskId: string, workspaceIdentity?: string | null) => {
      clearComposerDraftScope(workspacePath, taskId, workspaceIdentity),
        set((state) => ({
          ...updateWorkspaceTaskState(
            state,
            workspacePath,
            (workspaceState) => {
              const { [taskId]: _removedRuntime, ...taskRuntimeByTaskId } = workspaceState.taskRuntimeByTaskId;
              const { [taskId]: _removedUi, ...taskUiByTaskId } = workspaceState.taskUiByTaskId;
              const { [taskId]: _removedOptions, ...taskConfigOptionsByTaskId } = workspaceState.taskConfigOptionsByTaskId;
              const { [taskId]: _removedOptionsStatus, ...taskConfigOptionsStatusByTaskId } = workspaceState.taskConfigOptionsStatusByTaskId;
              const { [taskId]: _removedUnread, ...taskUnreadByTaskId } = workspaceState.taskUnreadByTaskId;
              const { [taskId]: _removedOptimistic, ...optimisticTaskListByTaskId } = workspaceState.optimisticTaskListByTaskId;
              const { [taskId]: _removedPromoted, ...promotedGroupedDraftTaskByTaskId } = workspaceState.promotedGroupedDraftTaskByTaskId;
              const wasActive = workspaceState.activeTaskId === taskId;
              return {
                ...workspaceState,
                activeTaskId: wasActive ? null : workspaceState.activeTaskId,
                draftRuntime: wasActive
                  ? {
                      status: `idle`,
                      error: null,
                    }
                  : workspaceState.draftRuntime,
                taskRuntimeByTaskId: taskRuntimeByTaskId,
                taskUiByTaskId: taskUiByTaskId,
                taskConfigOptionsByTaskId: taskConfigOptionsByTaskId,
                taskConfigOptionsStatusByTaskId: taskConfigOptionsStatusByTaskId,
                taskUnreadByTaskId: taskUnreadByTaskId,
                optimisticTaskListByTaskId: optimisticTaskListByTaskId,
                promotedGroupedDraftTaskByTaskId: promotedGroupedDraftTaskByTaskId,
              };
            },
            workspaceIdentity,
          ),
          taskNavHistory: removeTaskFromTaskNavHistory(state.taskNavHistory, taskId),
        }));
    },
  };
}

/* ============================================================================
 * 8. 供应商/模型持久化（原 Ze–Lt，jsx 850–1117）
 * ==========================================================================*/

/** 原 Ze（jsx 850）：最近供应商键。 */
const LAST_AGENT_PROVIDER_KEY = `zcode-last-agent-provider`;

/** 原 Qe（jsx 851）：localStorage 守卫。 */
function getProviderStorage(): Storage | null {
  if (typeof window > `u`) return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** 原 $e（jsx 859）：持久化最近供应商。 */
function persistLastAgentProvider(provider: string, storage: Storage | null = getProviderStorage()): void {
  storage?.setItem(LAST_AGENT_PROVIDER_KEY, resolveAgentProvider(provider));
}

/** 原 et（jsx 862）：自定义供应商 ID 集。 */
const CUSTOM_PROVIDER_IDS = new Set([`zcode-anthropic`, `zcode-openai-compatible`]);

/** 原 tt（jsx 863）：解析自定义供应商模型后缀（`provider/model`）。 */
function parseCustomProviderModelSuffix(value: string): string | null {
  const trimmed = value.trim();
  const separatorIndex = trimmed.indexOf(`/`);
  if (separatorIndex <= 0 || separatorIndex >= trimmed.length - 1) return null;
  const providerId = trimmed.slice(0, separatorIndex);
  if (!CUSTOM_PROVIDER_IDS.has(providerId)) return null;
  const modelName = trimmed.slice(separatorIndex + 1).trim();
  return modelName.length > 0 ? modelName : null;
}

/** 原 nt（jsx 872）：自定义模型选项判定（自定义前缀/注入源/描述前缀）。 */
function isCustomModelOption(option: { value: string; origin?: string; description?: string }): boolean {
  if (parseCustomProviderModelSuffix(option.value) || option.origin === `injected`) return true;
  if (option.origin === `native`) return false;
  const description = option.description?.trim().toLowerCase();
  return !!(description && description.startsWith(`custom model`));
}

/** 原 rt（jsx 878）：custom 限定模型 ID（导出 k）。 */
function formatCustomModelId(providerId: string, modelName: string): string {
  return formatCustomQualifiedModelId(providerId, modelName);
}

/** 原 D（jsx 881）：解析 custom 限定模型 ID（导出 O）。 */
function parseCustomModelId(value: string): { providerId: string; modelName?: string } | null {
  return parseCustomQualifiedModelId(value);
}

/** 原 it（jsx 884）：过滤自定义模型选项（导出 A）。 */
function filterNativeModelOptions(options: unknown[], _provider?: unknown, _workspaceIdentity?: unknown): unknown[] { // A1-R18 型缝宽化：bundle it(e,t,n) 二三参未使用；styles L 消费面（iit 89503-89978，消费 89709；〔A1-R36〕行注清扫：旧注「iit 89600 附近」为漂移）传 (options, currentValue, entitlementSnapshot)
  return options.filter((option) => !isCustomModelOption(option as { value: string; origin?: string; description?: string }));
}

/** 原 O（jsx 887）。 */
const LAST_AGENT_MODEL_KEY = `zcode-last-agent-model`;

/** 原 at（jsx 888）。 */
const LAST_AGENT_THOUGHT_LEVEL_KEY = `zcode-last-agent-thought-level`;

/** 原 ot（jsx 889）。 */
const LAST_AGENT_CONFIG_KEY = `zcode-last-agent-config`;

/** 原 k（jsx 890）：全局作用域段。 */
const GLOBAL_SCOPE = `__global__`;

/** 原 A（jsx 891）：配置 schema 版本。 */
const LAST_AGENT_CONFIG_SCHEMA_VERSION = 1;

/** 原 st（jsx 892）：GLM 模型前缀。 */
const GLM_MODEL_PREFIX = `glm-5.2`;

/** 原 ct（jsx 893）：GLM 日期型模型模式。 */
const GLM_DATED_MODEL_PATTERN = /^glm-\d{4}(?:$|[^0-9a-z])/;

/** 原 lt（jsx 894）：最高思考级。 */
const MAX_THOUGHT_LEVEL = `max`;

/** 原 ut（jsx 895）：思考级禁用值。 */
const DISABLED_THOUGHT_VALUES = new Set([`disabled`, `off`]);

/** 原 j（jsx 896）：localStorage 守卫。 */
function getModelStorage(): Storage | null {
  if (typeof window > `u`) return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** 原 dt（jsx 904）：身份键解析（同 b）。 */
function resolveIdentityKey(workspacePath: string, workspaceIdentity?: string | null): string {
  return workspaceIdentity?.trim() || workspacePath;
}

/** 原 M（jsx 907）：身份作用域模型键。 */
function getIdentityScopedModelKey(provider: string, workspacePath: string, workspaceIdentity?: string | null): string {
  return `${LAST_AGENT_MODEL_KEY}:${provider}:${resolveIdentityKey(workspacePath, workspaceIdentity)}`;
}

/** 原 ft（jsx 910）：工作区模型存储键（glm 走全局段）。 */
function getWorkspaceModelStorageKey(provider: string, workspacePath: string, workspaceIdentity?: string | null): string {
  return isGlmProvider(provider) ? `${LAST_AGENT_MODEL_KEY}:${provider}:${GLOBAL_SCOPE}` : getIdentityScopedModelKey(provider, workspacePath, workspaceIdentity);
}

/** 原 pt（jsx 913）：全局模型键。 */
function getGlobalModelKey(provider: string): string {
  return `${LAST_AGENT_MODEL_KEY}:${provider}:${GLOBAL_SCOPE}`;
}

/** 原 N（jsx 916）：全局思考级键。 */
function getGlobalThoughtLevelKey(provider: string): string {
  return `${LAST_AGENT_THOUGHT_LEVEL_KEY}:${provider}:${GLOBAL_SCOPE}`;
}

/** 原 P（jsx 919）：全局配置键。 */
function getGlobalConfigKey(provider: string): string {
  return `${LAST_AGENT_CONFIG_KEY}:${provider}:${GLOBAL_SCOPE}`;
}

/** 原 F（jsx 922）：旧式工作区模型键（无身份段）。 */
function getWorkspaceModelKey(provider: string, workspacePath: string): string {
  return `${LAST_AGENT_MODEL_KEY}:${provider}:${workspacePath}`;
}

/** 原 mt（jsx 925）：找模型选择项。 */
function findModelSelectOption(options: ConfigOption[]): ConfigOption | undefined {
  return options.find((option) => option.category === `model` && option.type === `select`);
}

/** 原 ht（jsx 928）：找思考级选择项。 */
function findThoughtLevelSelectOption(options: ConfigOption[]): ConfigOption | undefined {
  return options.find((option) => option.category === `thought_level` && option.type === `select`);
}

/** 原 gt（jsx 931）：模型值别名集（custom 解析 + opencode 供应商限定别名）。 */
function collectModelValueAliases(modelValue: string, provider: string): string[] {
  const trimmed = modelValue.trim();
  if (!trimmed) return [];
  const parsed = parseCustomModelId(trimmed);
  if (parsed?.modelName) {
    const aliases = [parsed.modelName];
    if (provider === `opencode` && parsed.providerId)
      try {
        aliases.push(formatBuiltinQualifiedModelId(parsed.providerId, parsed.modelName));
      } catch {}
    return aliases;
  }
  return [trimmed];
}

/** 原 _t（jsx 944）：从限定 ID 抽取模型名。 */
function extractModelNameFromQualified(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = parseCustomModelId(trimmed);
  if (!parsed) return trimmed;
  if (!parsed.modelName) return null;
  const modelName = parsed.modelName.trim();
  return modelName.length > 0 ? modelName : null;
}

/** 原 vt（jsx 953）：限定供应商模型判定（五供应商 + 双段齐备）。 */
function isQualifiedProviderModel(provider: string, modelValue: string): boolean {
  if (provider !== `glm` && provider !== `codex` && provider !== `claude` && provider !== `gemini` && provider !== `opencode`) return false;
  const parsed = parseCustomModelId(modelValue.trim());
  return !!(parsed?.providerId && parsed.modelName?.trim().length);
}

/** 原 I（jsx 958）：当前模型值（导出 w）。 */
function getCurrentModelValue(options: any): string | null { // 〔A1-R33〕型缝：参 ConfigOption[]→any 宽化（PD reconcileConfigOptionsModel 传 ConfigOptionEntry[] | undefined；bundle I 982 无型契，findModelSelectOption 消费面不变）
  const modelOption = findModelSelectOption(options);
  return !modelOption || typeof modelOption.currentValue != `string` || modelOption.currentValue.length === 0 ? null : modelOption.currentValue;
}

/** 原 yt（jsx 962）：当前思考级值（导出 T）。 */
function getCurrentThoughtLevelValue(options: ConfigOption[]): string | null {
  const thoughtOption = findThoughtLevelSelectOption(options);
  return !thoughtOption || typeof thoughtOption.currentValue != `string` || thoughtOption.currentValue.length === 0 ? null : thoughtOption.currentValue;
}

interface LastAgentConfig {
  schemaVersion: number;
  model: string;
  thoughtLevel: string | null;
}

/** 原 bt（jsx 966）：解析最近代理配置（schemaVersion 1；入参可为 null，!raw 拦截）。 */
function parseLastAgentConfig(raw: string | null): LastAgentConfig | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    const model = typeof parsed.model == `string` ? parsed.model.trim() : ``;
    const thoughtLevel = typeof parsed.thoughtLevel == `string` ? parsed.thoughtLevel.trim() : null;
    return parsed.schemaVersion !== LAST_AGENT_CONFIG_SCHEMA_VERSION || !model
      ? null
      : {
          schemaVersion: LAST_AGENT_CONFIG_SCHEMA_VERSION,
          model: model,
          thoughtLevel: thoughtLevel || null,
        };
  } catch {
    return null;
  }
}

/** 原 xt（jsx 981）：读全局最近代理配置。 */
function readGlobalLastAgentConfig(provider: string, storage: Storage | null): LastAgentConfig | null {
  return parseLastAgentConfig(storage?.getItem(getGlobalConfigKey(provider)) ?? null);
}

/** 原 St（jsx 984）：读最近模型（全局 → 身份 → 旧式工作区 三级回退）。 */
function readLastAgentModel(
  provider: string,
  workspacePath: string,
  workspaceIdentity?: string | null,
  storage: Storage | null = getModelStorage(),
): string | null {
  if (isGlmProvider(provider)) {
    const globalKey = getGlobalModelKey(provider);
    return (
      storage?.getItem(globalKey)?.trim() ||
      storage?.getItem(getIdentityScopedModelKey(provider, workspacePath, workspaceIdentity))?.trim() ||
      storage?.getItem(getWorkspaceModelKey(provider, workspacePath))?.trim() ||
      null
    );
  }
  const identityKey = workspaceIdentity?.trim();
  if (identityKey) {
    const stored = storage?.getItem(getWorkspaceModelStorageKey(provider, workspacePath, identityKey));
    if (stored) return stored;
  }
  return storage?.getItem(getWorkspaceModelKey(provider, workspacePath)) || null;
}

/** 原 Ct（jsx 996）：清除旧式模型键组。 */
function clearLegacyModelKeys(provider: string, workspacePath: string, workspaceIdentity: string | null | undefined, storage: Storage | null): void {
  storage?.removeItem?.(getGlobalModelKey(provider)),
    storage?.removeItem?.(getIdentityScopedModelKey(provider, workspacePath, workspaceIdentity)),
    storage?.removeItem?.(getWorkspaceModelKey(provider, workspacePath)),
    storage?.removeItem?.(getGlobalThoughtLevelKey(provider));
}

/** 原 L（jsx 999）：写最近代理配置（glm 走全局 JSON，迁移清旧键；导出 x）。 */
function writeLastAgentConfig(
  provider: string,
  workspacePath: string,
  config: { model: string; thoughtLevel?: string | null },
  workspaceIdentity?: string | null,
  storage: Storage | null = getModelStorage(),
): void {
  const model = config.model.trim();
  if (model) {
    if (isGlmProvider(provider)) {
      const thoughtLevel = config.thoughtLevel?.trim() || null;
      storage?.setItem(
        getGlobalConfigKey(provider),
        JSON.stringify({
          schemaVersion: LAST_AGENT_CONFIG_SCHEMA_VERSION,
          model: model,
          thoughtLevel: thoughtLevel,
        }),
      ),
        clearLegacyModelKeys(provider, workspacePath, workspaceIdentity, storage);
      return;
    }
    storage?.setItem(getWorkspaceModelStorageKey(provider, workspacePath, workspaceIdentity), model);
  }
}

/** 原 wt（jsx 1014）：配置未变时持久化（返回是否相同；导出 S）。 */
function persistLastAgentConfigIfUnchanged(
  provider: string,
  workspacePath: string,
  config: LastAgentConfig,
  workspaceIdentity?: string | null,
  storage: Storage | null = getModelStorage(),
): boolean {
  const existing = readLastAgentModelConfig(provider, workspacePath, workspaceIdentity, storage);
  return !existing || existing.model !== config.model || existing.thoughtLevel !== config.thoughtLevel
    ? false
    : (writeLastAgentConfig(provider, workspacePath, config, workspaceIdentity, storage), true);
}

/** 原 R（jsx 1018）：读最近代理模型配置（glm：全局 JSON → 旧键迁移；导出 E）。 */
function readLastAgentModelConfig(
  provider: string,
  workspacePath: string,
  workspaceIdentity?: string | null,
  storage: Storage | null = getModelStorage(),
): LastAgentConfig | null {
  if (!isGlmProvider(provider)) {
    const model = readLastAgentModel(provider, workspacePath, workspaceIdentity, storage);
    return model
      ? {
          schemaVersion: LAST_AGENT_CONFIG_SCHEMA_VERSION,
          model: model,
          thoughtLevel: null,
        }
      : null;
  }
  const globalConfig = readGlobalLastAgentConfig(provider, storage);
  if (globalConfig) return globalConfig;
  const model = readLastAgentModel(provider, workspacePath, workspaceIdentity, storage);
  const thoughtLevel = storage?.getItem(getGlobalThoughtLevelKey(provider))?.trim();
  if (!model) return storage?.removeItem?.(getGlobalThoughtLevelKey(provider)), null;
  const config: LastAgentConfig = {
    schemaVersion: LAST_AGENT_CONFIG_SCHEMA_VERSION,
    model: model,
    thoughtLevel: thoughtLevel || null,
  };
  return writeLastAgentConfig(provider, workspacePath, config, workspaceIdentity, storage), config;
}

/** 原 Tt（jsx 1039）：仅读模型（导出 D）。 */
function readLastAgentModelOnly(
  provider: string,
  workspacePath: string,
  workspaceIdentity?: string | null,
  storage: Storage | null = getModelStorage(),
): string | null {
  return readLastAgentModelConfig(provider, workspacePath, workspaceIdentity, storage)?.model ?? null;
}

/** 原 Et（jsx 1042）：更新最近模型（同模型保留思考级；导出 C）。 */
function updateLastAgentModel(
  provider: string,
  workspacePath: string,
  model: string,
  workspaceIdentity?: string | null,
  storage: Storage | null = getModelStorage(),
): void {
  const trimmed = model.trim();
  if (!trimmed) return;
  const existing = isGlmProvider(provider) ? readLastAgentModelConfig(provider, workspacePath, workspaceIdentity, storage) : null;
  writeLastAgentConfig(
    provider,
    workspacePath,
    {
      model: trimmed,
      thoughtLevel: existing?.model === trimmed ? existing.thoughtLevel : null,
    },
    workspaceIdentity,
    storage,
  );
}

/** 原 Dt（jsx 1051）：清除最近代理模型配置（导出 y）。 */
function clearLastAgentModelConfig(
  provider: string,
  workspacePath: string,
  workspaceIdentity?: string | null,
  storage: Storage | null = getModelStorage(),
): void {
  isGlmProvider(provider) &&
    (storage?.removeItem?.(getGlobalConfigKey(provider)),
    storage?.removeItem?.(getGlobalModelKey(provider)),
    storage?.removeItem?.(getGlobalThoughtLevelKey(provider)));
  const identityKey = workspaceIdentity?.trim();
  identityKey && storage?.removeItem?.(getIdentityScopedModelKey(provider, workspacePath, identityKey)),
    storage?.removeItem?.(getWorkspaceModelKey(provider, workspacePath));
}

/** 原 Ot（jsx 1056）：把存储模型应用到选项（别名命中；导出 v）。 */
function applyStoredModelToOptions(options: ConfigOption[], modelValue: string, provider: string): ConfigOption[] {
  const aliases = collectModelValueAliases(modelValue, provider);
  if (aliases.length === 0) return [...options];
  const isQualified = isQualifiedProviderModel(provider, modelValue);
  let changed = false;
  const nextOptions = options.map((option) =>
    option.category !== `model` || option.type !== `select` || (!option.options?.some((item) => aliases.includes(item.value)) && !isQualified) || option.currentValue === modelValue
      ? option
      : ((changed = true),
        {
          ...option,
          currentValue: modelValue,
        }),
  );
  return changed ? nextOptions : [...options];
}

/** 原 z（jsx 1067）：思考级选项存在判定（导出 b）。 */
function hasThoughtLevelOption(options: ConfigOption[], thoughtLevel?: string | null): boolean {
  const trimmed = thoughtLevel?.trim() ?? ``;
  return trimmed ? !!findThoughtLevelSelectOption(options)?.options?.some((item) => item.value === trimmed) : false;
}

/** 原 kt（jsx 1071）：把思考级应用到选项。 */
function applyThoughtLevelToOptions(options: ConfigOption[], thoughtLevel?: string | null): ConfigOption[] {
  const trimmed = thoughtLevel?.trim() ?? ``;
  if (!hasThoughtLevelOption(options, trimmed)) return [...options];
  let changed = false;
  const nextOptions = options.map((option) =>
    option.category !== `thought_level` || option.type !== `select` || option.currentValue === trimmed
      ? option
      : ((changed = true),
        {
          ...option,
          currentValue: trimmed,
        }),
  );
  return changed ? nextOptions : [...options];
}

/** 原 At（jsx 1081）：思考级回退解析（max 支持时回退 max）。 */
function resolveThoughtLevelWithMaxFallback(options: ConfigOption[], thoughtLevel: string | null | undefined): string | null | undefined {
  return resolveMaxThoughtLevelForModel(options, thoughtLevel) ?? thoughtLevel;
}

/** 原 jt（jsx 1084）：GLM 且支持 max 时返回 max。 */
function getMaxThoughtLevelIfSupported(options: ConfigOption[]): string | null {
  return !isGlmModelSelected(options) || !hasThoughtLevelOption(options, MAX_THOUGHT_LEVEL) ? null : MAX_THOUGHT_LEVEL;
}

/** 原 Mt（jsx 1087）：模型相关 max 思考级解析。 */
function resolveMaxThoughtLevelForModel(options: ConfigOption[], thoughtLevel: string | null | undefined): string | null {
  return isThoughtLevelDisabled(thoughtLevel) ? getMaxThoughtLevelIfSupported(options) : null;
}

/** 原 Nt（jsx 1090）：思考级禁用判定。 */
function isThoughtLevelDisabled(thoughtLevel: string | null | undefined): boolean {
  return DISABLED_THOUGHT_VALUES.has(thoughtLevel?.trim().toLowerCase() ?? ``);
}

/** 原 Pt（jsx 1093）：当前模型为 GLM 系判定。 */
function isGlmModelSelected(options: ConfigOption[]): boolean {
  const modelValue = getCurrentModelValue(options);
  return modelValue ? getModelNameAliases(modelValue).some((alias) => alias.startsWith(GLM_MODEL_PREFIX) || GLM_DATED_MODEL_PATTERN.test(alias)) : false;
}

/** 原 B（jsx 1097）：模型名别名（全小写全名 + 尾段）。 */
function getModelNameAliases(modelValue: string): string[] {
  const modelName = extractModelNameFromQualified(modelValue)?.toLowerCase();
  if (!modelName) return [];
  const tail = modelName.split(`/`).filter(Boolean).at(-1);
  return !tail || tail === modelName ? [modelName] : [modelName, tail];
}

/** 原 Ft（jsx 1103）：把存储配置应用到选项（模型 + 思考级；导出 _）。 */
function applyStoredConfigToOptions(
  provider: string,
  workspacePath: string,
  options: ConfigOption[],
  workspaceIdentity?: string | null,
  storage: Storage | null = getModelStorage(),
): ConfigOption[] {
  const config = readLastAgentModelConfig(provider, workspacePath, workspaceIdentity, storage);
  if (!config) return [...options];
  const withModel = applyStoredModelToOptions(options, config.model, provider);
  return getCurrentModelValue(withModel) === config.model
    ? applyThoughtLevelToOptions(withModel, resolveThoughtLevelWithMaxFallback(withModel, config.thoughtLevel))
    : withModel;
}

/** 原 It（jsx 1109）：找模式选择项。 */
function findModeSelectOption(options: ConfigOption[]): ConfigOption | undefined {
  return options.find((option) => option.category === `mode` && option.type === `select`);
}

/** 原 Lt（jsx 1112）：当前模式值。 */
function getCurrentModeValue(options: ConfigOption[]): string | null {
  const modeOption = findModeSelectOption(options);
  if (typeof modeOption?.currentValue != `string`) return null;
  const trimmed = modeOption.currentValue.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/* ============================================================================
 * 9. 模型切换守卫（原 Rt–Jt，jsx 1118–1186）
 *    注：modelSwitchGuardCache 在本 chunk 内只读/过期删除、从无 set 调用——
 *    守卫条目为预留钩子（3.7.6 恒为空，reconcile 恒返回 nextOptions 副本）。
 * ==========================================================================*/

interface ModelSwitchGuard {
  model: string;
  stage: string;
  expiresAt: number;
}

/** 原 Rt（jsx 1118）：模型切换守卫缓存（按工作区键）。 */
const modelSwitchGuardCache = new Map<string, ModelSwitchGuard>();

/** 原 V（jsx 1119）：修剪为空即 null。 */
function trimToNull(value: unknown): string | null {
  if (typeof value != `string`) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** 原 zt（jsx 1124）：按分类找 select 选项。 */
function findSelectOptionByCategory(options: ConfigOption[] | null | undefined, category: string): ConfigOption | null {
  return options?.find((option) => option.category === category && option.type === `select`) ?? null;
}

/** 原 Bt（jsx 1127）：按分类取当前值。 */
function getCurrentValueByCategory(options: ConfigOption[] | null | undefined, category: string): string | null {
  return trimToNull(findSelectOptionByCategory(options, category)?.currentValue);
}

/** 原 Vt（jsx 1130）：两模型值是否同别名集。 */
function isSameModelAlias(first: string, second: string): boolean {
  const secondAliases = new Set(getModelNameAliases(second));
  return getModelNameAliases(first).some((alias) => secondAliases.has(alias));
}

/** 原 Ht（jsx 1134）：取未过期的守卫（过期即删）。 */
function getModelSwitchGuard(workspacePath: string, workspaceIdentity?: string | null): ModelSwitchGuard | null {
  const cacheKey = resolveWorkspaceKey(workspacePath, workspaceIdentity);
  const guard = modelSwitchGuardCache.get(cacheKey);
  return guard ? guard.expiresAt <= Date.now() ? (modelSwitchGuardCache.delete(cacheKey), null) : guard : null;
}

/** 原 Ut（jsx 1139）：在旧选项中找与下一选项同 id+分类（退化为同分类）的 select。 */
function findMatchingCurrentOption(currentOptions: ConfigOption[], nextOption: ConfigOption): ConfigOption | null {
  return (
    currentOptions.find((option) => option.type === `select` && option.id === nextOption.id && option.category === nextOption.category) ??
    currentOptions.find((option) => option.type === `select` && option.category === nextOption.category) ??
    null
  );
}

/** 原 Wt（jsx 1142）：选项是否含某值。 */
function optionHasValue(option: ConfigOption, value: string): boolean {
  return !!option.options?.some((item) => item.value === value);
}

/** 原 Gt（jsx 1145）：选项值是否可接受（model 分类恒真）。 */
function isOptionValueAcceptable(option: ConfigOption, value: string): boolean {
  return option.category === `model` ? true : optionHasValue(option, value);
}

/** 原 Kt（jsx 1148）：是否保留当前 model 选项（当前命中守卫模型且下一选项未命中）。 */
function shouldKeepCurrentModelOption(args: { guard: ModelSwitchGuard; currentOption: ConfigOption; nextOption: ConfigOption }): boolean {
  const currentValue = trimToNull(args.currentOption.currentValue);
  const nextValue = trimToNull(args.nextOption.currentValue);
  return !currentValue || !isSameModelAlias(currentValue, args.guard.model) ? false : !nextValue || !isSameModelAlias(nextValue, args.guard.model);
}

/** 原 qt（jsx 1153）：authoritativeConfig 阶段择权威选项。 */
function pickAuthoritativeOption(args: { currentOption: ConfigOption; nextOption: ConfigOption }): ConfigOption {
  const currentValue = trimToNull(args.currentOption.currentValue);
  return !currentValue || !isOptionValueAcceptable(args.currentOption, currentValue) || optionHasValue(args.nextOption, currentValue)
    ? args.nextOption
    : args.currentOption;
}

/** 原 Jt（jsx 1157）：守卫期配置选项调和（model 保留 + authoritativeConfig 权威合并）。 */
function reconcileConfigOptionsWithGuard(args: {
  workspacePath: string;
  workspaceIdentity?: string | null;
  currentOptions: ConfigOption[] | null;
  nextOptions: ConfigOption[];
}): ConfigOption[] {
  const guard = getModelSwitchGuard(args.workspacePath, args.workspaceIdentity);
  if (!guard) return [...args.nextOptions];
  const currentModelValue = getCurrentValueByCategory(args.currentOptions, `model`);
  if (!currentModelValue || !isSameModelAlias(currentModelValue, guard.model)) return [...args.nextOptions];
  const currentOptions = args.currentOptions ?? [];
  let changed = false;
  const reconciled = args.nextOptions.map((nextOption) => {
    if (nextOption.type !== `select`) return nextOption;
    const currentOption = findMatchingCurrentOption(currentOptions, nextOption);
    if (!currentOption) return nextOption;
    if (nextOption.category === `model`)
      return shouldKeepCurrentModelOption({
        guard: guard,
        currentOption: currentOption,
        nextOption: nextOption,
      })
        ? ((changed = true), currentOption)
        : nextOption;
    if (guard.stage !== `authoritativeConfig`) return nextOption;
    const authoritative = pickAuthoritativeOption({
      currentOption: currentOption,
      nextOption: nextOption,
    });
    return authoritative !== nextOption && (changed = true), authoritative;
  });
  for (const currentOption of currentOptions) {
    if (
      currentOption.type !== `select` ||
      currentOption.category === `model` ||
      guard.stage !== `authoritativeConfig` ||
      reconciled.some((option) => option.type === `select` && option.id === currentOption.id && option.category === currentOption.category)
    )
      continue;
    const currentValue = trimToNull(currentOption.currentValue);
    !currentValue || !isOptionValueAcceptable(currentOption, currentValue) || ((changed = true), reconciled.push(currentOption));
  }
  return changed ? reconciled : [...args.nextOptions];
}

/* ============================================================================
 * 10. 模型 ID 归一与选项装配（原 Yt–sn，jsx 1187–1315）
 * ==========================================================================*/

/** 原 Yt（jsx 1187）：解析 `<providerId>/<modelName>` 限定。 */
function parseProviderQualifiedModel(value: string): { providerId: string; modelName: string } | null {
  const trimmed = value.trim();
  const slashIndex = trimmed.indexOf(`/`);
  if (slashIndex <= 0 || slashIndex >= trimmed.length - 1) return null;
  const providerId = trimmed.slice(0, slashIndex).trim();
  const modelName = trimmed.slice(slashIndex + 1).trim();
  return !providerId || !modelName
    ? null
    : {
        providerId: providerId,
        modelName: modelName,
      };
}

/** 原 Xt（jsx 1198）：合成模型标记。 */
function isSyntheticModel(value: string): boolean {
  return value.trim().toLocaleLowerCase() === `<synthetic>`;
}

/** 原 Zt（jsx 1201）：glm 模型 ID 归一（custom: 直通；裸 slug/model → custom: 拼装）。 */
function normalizeGlmModelId(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed || isSyntheticModel(trimmed)) return null;
  const customParsed = parseCustomQualifiedModelId(trimmed);
  if (customParsed?.providerId && customParsed.modelName) return trimmed;
  const qualified = parseProviderQualifiedModel(trimmed);
  return qualified ? formatCustomModelId(qualified.providerId, qualified.modelName) : trimmed;
}

/** 选项装配用的任务元数据切面（TaskMeta 结构可赋；_n 以部分字段字面量传入）。 */
interface TaskModelMeta {
  provider?: string;
  model?: string | null;
  mode?: string;
  thoughtLevel?: string | null;
}

/** 原 Qt（jsx 1209）：任务元数据模型解析（仅 glm 归一；导出经 g 间接）。 */
function resolveTaskMetaModel(taskMeta: TaskModelMeta): string | null {
  const model = taskMeta.model?.trim();
  return !model || isSyntheticModel(model) ? null : taskMeta.provider === `glm` ? normalizeGlmModelId(model) : model;
}

/** 原 $t（jsx 1213）：模型显示名（剥限定前缀）。 */
function getModelDisplayName(value: string): string {
  const customParsed = parseCustomQualifiedModelId(value);
  const qualified = parseProviderQualifiedModel(value);
  return customParsed?.modelName?.trim() || qualified?.modelName || value;
}

/** 原 en（jsx 1218）：为 model 选项注入当前值（缺值补选项）。 */
function withModelCurrentValue(option: ConfigOption, value: string): ConfigOption {
  const options = option.options ?? [];
  const hasValue = options.some((item) => item.value === value);
  return hasValue && option.currentValue === value
    ? option
    : {
        ...option,
        currentValue: value,
        options: hasValue
          ? options
          : [
              ...options,
              {
                name: getModelDisplayName(value),
                value: value,
              },
            ],
      };
}

/** 原 tn（jsx 1230）：构造 model select 选项。 */
function createModelSelectOption(value: string): ConfigOption {
  return {
    category: `model`,
    currentValue: value,
    id: `model`,
    name: `Model`,
    options: [
      {
        name: getModelDisplayName(value),
        value: value,
      },
    ],
    type: `select`,
  };
}

/** 原 nn（jsx 1243）：构造 mode select 选项（选项表 = 缺省模式表）。 */
function createModeSelectOption(modeId: string): ConfigOption {
  return {
    category: `mode`,
    currentValue: modeId,
    id: `mode`,
    name: `Mode`,
    options: getDefaultModeOptions(),
    type: `select`,
  };
}

/** 原 rn（jsx 1253）：构造 thought_level select 选项。 */
function createThoughtLevelSelectOption(level: string): ConfigOption {
  return {
    category: `thought_level`,
    currentValue: level,
    id: `thought_level`,
    name: `Effort`,
    options: [
      {
        name: level,
        value: level,
      },
    ],
    type: `select`,
  };
}

/** 原 an（jsx 1266）：通用当前值注入（缺值补选项）。 */
function withCurrentValueGeneric(option: ConfigOption, value: string): ConfigOption {
  const options = option.options ?? [];
  const hasValue = options.some((item) => item.value === value);
  return hasValue && option.currentValue === value
    ? option
    : {
        ...option,
        currentValue: value,
        options: hasValue
          ? options
          : [
              ...options,
              {
                name: value,
                value: value,
              },
            ],
      };
}

/** 原 on（jsx 1278）：把任务模型注入选项表（无 model 选项则前置新建；无变化返回 null）。 */
function injectTaskModelIntoOptions(args: { taskMeta: TaskModelMeta; configOptions: ConfigOption[] }): ConfigOption[] | null {
  const modelValue = resolveTaskMetaModel(args.taskMeta);
  if (!modelValue) return null;
  let sawModelOption = false;
  let changed = false;
  const mapped = args.configOptions.map((option) => {
    if (option.category !== `model` || option.type !== `select`) return option;
    sawModelOption = true;
    const injected = withModelCurrentValue(option, modelValue);
    return (changed ||= injected !== option), injected;
  });
  return sawModelOption ? (changed ? mapped : null) : [createModelSelectOption(modelValue), ...mapped];
}

/** 原 sn（jsx 1294）：由任务元数据装配配置选项（模型+模式+思考级；导出 g）。 */
function buildTaskConfigOptionsFromMeta(args: { taskMeta: TaskModelMeta; cachedTaskConfigOptions?: ConfigOption[] | null }): ConfigOption[] {
  let options = [...(args.cachedTaskConfigOptions ?? [])];
  const withModel = injectTaskModelIntoOptions({
    taskMeta: args.taskMeta,
    configOptions: options,
  });
  withModel && (options = withModel);
  const mode = args.taskMeta.mode?.trim();
  if (args.taskMeta.provider === `glm` && mode) {
    let sawModeOption = false;
    (options = options.map((option) =>
      option.category !== `mode` || option.type !== `select` ? option : ((sawModeOption = true), withCurrentValueGeneric(option, mode)),
    )),
      sawModeOption || (options = [createModeSelectOption(mode), ...options]);
  }
  const thoughtLevel = args.taskMeta.thoughtLevel?.trim();
  if (args.taskMeta.provider === `glm` && thoughtLevel) {
    let sawThoughtOption = false;
    (options = options.map((option) =>
      option.category !== `thought_level` || option.type !== `select`
        ? option
        : ((sawThoughtOption = true), withCurrentValueGeneric(option, thoughtLevel)),
    )),
      sawThoughtOption || (options = [...options, createThoughtLevelSelectOption(thoughtLevel)]);
  }
  return options;
}

/* ============================================================================
 * 11. 分组草稿与模式选项助手（原 cn–_n，jsx 1316–1409）
 * ==========================================================================*/

/** 原 cn（jsx 1316）：分组草稿自增计数。 */
let groupedDraftCounter = 0;

/** 原 ln（jsx 1317）：分组草稿 ID。 */
function createGroupedDraftId(timestamp: number): string {
  return (groupedDraftCounter += 1), `grouped-draft-${timestamp}-${groupedDraftCounter}`;
}

/** 原 un（jsx 1320）：思考级选项消毒（当前值不在选项内则回退首项）。 */
function sanitizeThoughtLevelOption(option: ConfigOption): ConfigOption {
  if (option.type !== `select` || (option.id !== `thought_level` && option.category !== `thought_level`)) return option;
  const currentValue = typeof option.currentValue == `string` ? option.currentValue : ``;
  if (option.options?.some((item) => item.value === currentValue)) return option;
  const fallbackValue = option.options?.[0]?.value;
  return fallbackValue
    ? {
        ...option,
        currentValue: fallbackValue,
      }
    : option;
}

/** 原 H（jsx 1330）：配置选项消毒。 */
function sanitizeConfigOptions(options: ConfigOption[]): ConfigOption[] {
  return options.map(sanitizeThoughtLevelOption);
}

/** 原 dn（jsx 1333）：配置选项深克隆（选项表层）。 */
function cloneConfigOptions(options: ConfigOption[]): ConfigOption[] {
  return options.map((option) => ({
    ...option,
    options: option.options?.map((item) => ({
      ...item,
    })),
  }));
}

/** 原 fn（jsx 1341）：分组草稿位置相同判定。 */
function isSameGroupedDraftPlacement(first: GroupedDraftPlacement, second: GroupedDraftPlacement): boolean {
  return first.type === second.type ? (first.type === `top` ? true : second.type === `group` && first.groupId === second.groupId) : false;
}

/** 原 pn（jsx 1344）：是否 mode select 选项。 */
function isModeSelectOption(option: ConfigOption): boolean {
  return option.category === `mode` && option.type === `select`;
}

/** 原 mn（jsx 1347）：由当前模式 ID 构造 mode 选项。 */
function createModeOptionFromCurrentId(args: { currentModeId: string; options?: ConfigOptionItem[] }): ConfigOption {
  const options = args.options?.length
    ? args.options
    : [
        {
          value: args.currentModeId,
          name: args.currentModeId,
        },
      ];
  return {
    id: `mode`,
    name: `Mode`,
    category: `mode`,
    type: `select`,
    currentValue: args.currentModeId,
    options: options,
  };
}

/** 原 U（jsx 1361）：替换/增删选项表中的 mode 选项。 */
function replaceModeOption(options: ConfigOption[] | null, replacement: ConfigOption | null): ConfigOption[] | null {
  const list = options ?? [];
  const modeIndex = list.findIndex(isModeSelectOption);
  return modeIndex === -1
    ? replacement
      ? sanitizeConfigOptions([...list, replacement])
      : options
    : sanitizeConfigOptions(
        replacement ? [...list.slice(0, modeIndex), replacement, ...list.slice(modeIndex + 1)] : [...list.slice(0, modeIndex), ...list.slice(modeIndex + 1)],
      );
}

/** 原 hn（jsx 1366）：把模式 ID 应用到选项表（null 时清空/置空值）。 */
function applyModeIdToOptions(options: ConfigOption[] | null, modeId: string | null): ConfigOption[] | null {
  const modeOption = (options ?? []).find(isModeSelectOption);
  return modeId
    ? modeOption
      ? replaceModeOption(options, {
          ...modeOption,
          currentValue: modeId,
        })
      : replaceModeOption(
          options,
          createModeOptionFromCurrentId({
            currentModeId: modeId,
          }),
        )
    : modeOption
      ? (modeOption.options?.length ?? 0) === 0
        ? replaceModeOption(options, null)
        : replaceModeOption(options, {
            ...modeOption,
            currentValue: ``,
          })
      : options;
}

/** 原 gn（jsx 1378）：更新活动任务的配置选项（无变化返回 null）。 */
function updateActiveTaskConfigOptions(
  workspaceState: WorkspaceTaskState,
  updater: (options: ConfigOption[]) => ConfigOption[] | null,
): { taskConfigOptionsByTaskId: Record<string, ConfigOption[]> } | null {
  const activeTaskId = workspaceState.activeTaskId;
  if (!activeTaskId) return null;
  const currentOptions = workspaceState.taskConfigOptionsByTaskId[activeTaskId];
  if (!currentOptions) return null;
  const nextOptions = updater(currentOptions);
  return nextOptions === currentOptions || !nextOptions
    ? null
    : {
        taskConfigOptionsByTaskId: {
          ...workspaceState.taskConfigOptionsByTaskId,
          [activeTaskId]: nextOptions,
        },
      };
}

/** 原 _n（jsx 1391）：激活任务的配置选项解析（已有取缓存，否则由元数据装配 loading 态）。 */
function resolveTaskConfigOptionsForActivation(
  workspaceState: WorkspaceTaskState,
  taskId: string,
): { configOptions: ConfigOption[]; status: string } | null {
  const cached = workspaceState.taskConfigOptionsByTaskId[taskId];
  if (cached)
    return {
      configOptions: cached,
      status: workspaceState.taskConfigOptionsStatusByTaskId[taskId] ?? `ready`,
    };
  const mergedTask = getMergedTaskListItem(workspaceState, taskId);
  const built = sanitizeConfigOptions(
    buildTaskConfigOptionsFromMeta({
      taskMeta: {
        provider: mergedTask?.provider ?? workspaceState.selectedProvider,
        model: mergedTask?.model,
        mode: mergedTask?.mode,
        thoughtLevel: mergedTask?.thoughtLevel,
      },
    }),
  );
  return built.length === 0
    ? null
    : {
        configOptions: built,
        status: `loading`,
      };
}

/* ============================================================================
 * 12. 任务状态动作族（原 vn，jsx 1411–1792；25 动作）
 * ==========================================================================*/

/** 原 vn（jsx 1411）：任务状态动作工厂（激活/草稿/模型切换/选项表/任务列表等 25 动作）。 */
function createTaskStateActions(set: SetStateFn<TaskStoreState>) {
  return {
    setActiveTaskId: (workspacePath: string, taskId: string | null, workspaceIdentity?: string | null) => {
      set((state) => {
        const workspacePatch = updateWorkspaceTaskState(
            state,
            workspacePath,
            (workspaceState) => {
              const { [taskId ?? ``]: _clearedUnread, ...restUnread } = workspaceState.taskUnreadByTaskId;
              const optimisticTask = taskId ? workspaceState.optimisticTaskListByTaskId[taskId] : void 0;
              const nextOptimistic =
                taskId && typeof optimisticTask?.unreadAt == `number`
                  ? {
                      ...workspaceState.optimisticTaskListByTaskId,
                      [taskId]: {
                        ...optimisticTask,
                        unreadAt: void 0,
                      },
                    }
                  : workspaceState.optimisticTaskListByTaskId;
              const activationTaskId = taskId;
              const activationOptions = activationTaskId ? resolveTaskConfigOptionsForActivation(workspaceState, activationTaskId) : null;
              const base = {
                ...workspaceState,
                taskUnreadByTaskId: restUnread,
                optimisticTaskListByTaskId: nextOptimistic,
                activeTaskId: taskId,
                groupedDraftTask: taskId ? null : workspaceState.groupedDraftTask,
              };
              return activationTaskId && activationOptions
                ? {
                    ...base,
                    taskConfigOptionsByTaskId: {
                      ...workspaceState.taskConfigOptionsByTaskId,
                      [activationTaskId]: activationOptions.configOptions,
                    },
                    taskConfigOptionsStatusByTaskId: {
                      ...workspaceState.taskConfigOptionsStatusByTaskId,
                      [activationTaskId]: activationOptions.status,
                    },
                  }
                : base;
            },
            workspaceIdentity,
          ),
          navPatch = taskId
            ? {
                taskNavHistory: pushTaskNavTaskEntry(state.taskNavHistory, workspacePath, taskId, workspaceIdentity),
              }
            : {};
        return {
          ...workspacePatch,
          ...navPatch,
        };
      });
    },
    promoteGroupedDraftTask: (workspacePath: string, taskId: string, draft: GroupedDraftTask, workspaceIdentity?: string | null) => {
      set((state) =>
        updateWorkspaceTaskState(
          state,
          workspacePath,
          (workspaceState) => {
            const optimisticTask: TaskMeta = {
              taskId: taskId,
              traceId: `session-${taskId}`,
              title: ``,
              workspacePath: workspacePath,
              ...(workspaceIdentity
                ? {
                    workspaceIdentity: workspaceIdentity,
                  }
                : {}),
              createdAt: draft.createdAt,
              updatedAt: 0,
              mode: `default`,
              provider: workspaceState.selectedProvider,
            };
            return {
              ...workspaceState,
              groupedDraftTask: workspaceState.groupedDraftTask?.draftId === draft.draftId ? null : workspaceState.groupedDraftTask,
              optimisticTaskListByTaskId: {
                ...workspaceState.optimisticTaskListByTaskId,
                [taskId]: workspaceState.optimisticTaskListByTaskId[taskId] ?? optimisticTask,
              },
              promotedGroupedDraftTaskByTaskId: {
                ...workspaceState.promotedGroupedDraftTaskByTaskId,
                [taskId]: draft,
              },
            };
          },
          workspaceIdentity,
        ),
      );
    },
    clearPromotedGroupedDraftTask: (workspacePath: string, taskId: string, workspaceIdentity?: string | null) => {
      set((state) =>
        updateWorkspaceTaskState(
          state,
          workspacePath,
          (workspaceState) => {
            if (!workspaceState.promotedGroupedDraftTaskByTaskId[taskId]) return workspaceState;
            const { [taskId]: _clearedPromoted, ...restPromoted } = workspaceState.promotedGroupedDraftTaskByTaskId;
            return {
              ...workspaceState,
              promotedGroupedDraftTaskByTaskId: restPromoted,
            };
          },
          workspaceIdentity,
        ),
      );
    },
    setDraftSessionId: (workspacePath: string, sessionId: string | null, workspaceIdentity?: string | null) => {
      set((state) =>
        updateWorkspaceTaskState(
          state,
          workspacePath,
          (workspaceState) =>
            workspaceState.draftSessionId === sessionId
              ? workspaceState
              : {
                  ...workspaceState,
                  draftSessionId: sessionId,
                },
          workspaceIdentity,
        ),
      );
    },
    invalidateDraftRuntime: (workspacePath: string, workspaceIdentity?: string | null) => {
      set((state) =>
        updateWorkspaceTaskState(
          state,
          workspacePath,
          (workspaceState) => ({
            ...workspaceState,
            draftRuntimeInvalidationVersion: workspaceState.draftRuntimeInvalidationVersion + 1,
            draftSessionId: null,
          }),
          workspaceIdentity,
        ),
      );
    },
    requestComposerTextInsert: (workspacePath: string, text: string, workspaceIdentity?: string | null, mention?: unknown) => {
      set((state) =>
        updateWorkspaceTaskState(
          state,
          workspacePath,
          (workspaceState) => {
            const nextVersion = workspaceState.composerTextInsertVersion + 1;
            return {
              ...workspaceState,
              composerTextInsertVersion: nextVersion,
              composerTextInsertRequest: {
                requestId: nextVersion,
                text: text,
                ...(mention
                  ? {
                      mention: mention,
                    }
                  : {}),
              },
            };
          },
          workspaceIdentity,
        ),
      );
    },
    clearComposerTextInsertRequest: (workspacePath: string, requestId: number, workspaceIdentity?: string | null) => {
      set((state) =>
        updateWorkspaceTaskState(
          state,
          workspacePath,
          (workspaceState) =>
            workspaceState.composerTextInsertRequest?.requestId === requestId
              ? {
                  ...workspaceState,
                  composerTextInsertRequest: null,
                }
              : workspaceState,
          workspaceIdentity,
        ),
      );
    },
    startDraft: (
      workspacePath: string,
      provider?: string | null,
      workspaceIdentity?: string | null,
      options?: { groupedDraftPlacement?: GroupedDraftPlacement | null } | null,
    ) => {
      const resolvedProvider = provider ? resolveAgentProvider(provider) : void 0;
      resolvedProvider && persistLastAgentProvider(resolvedProvider),
        set((state) =>
          updateWorkspaceTaskState(
            state,
            workspacePath,
            (workspaceState) => {
              const nextProvider = resolveAgentProvider(resolvedProvider ?? workspaceState.selectedProvider);
              const providerChanged = !!resolvedProvider && nextProvider !== workspaceState.selectedProvider;
              const resetSlashCommands = workspaceState.activeTaskId !== null || providerChanged;
              const carryTaskId = workspaceState.activeTaskId !== null && !providerChanged ? workspaceState.activeTaskId : null;
              const carryOptions = carryTaskId ? workspaceState.taskConfigOptionsByTaskId[carryTaskId] : null;
              const draftOptions = carryOptions && carryOptions.length > 0 ? cloneConfigOptions(carryOptions) : null;
              const preferredModel = draftOptions ? getCurrentModelValue(draftOptions) : null;
              const preferredMode = draftOptions ? getCurrentModeValue(draftOptions) : null;
              const preferredThoughtLevel = draftOptions ? getCurrentThoughtLevelValue(draftOptions) : null;
              const draftOptionsStatus =
                workspaceState.activeTaskId && draftOptions
                  ? workspaceState.taskConfigOptionsStatusByTaskId[workspaceState.activeTaskId] ?? `ready`
                  : workspaceState.configOptionsStatus;
              const nextGroupedDraft = (() => {
                const placement = options?.groupedDraftPlacement;
                if (!placement) return null;
                if (workspaceState.activeTaskId === null && workspaceState.groupedDraftTask && isSameGroupedDraftPlacement(workspaceState.groupedDraftTask.placement, placement))
                  return workspaceState.groupedDraftTask;
                if (workspaceState.activeTaskId === null && workspaceState.groupedDraftTask)
                  return {
                    ...workspaceState.groupedDraftTask,
                    workspacePath: workspacePath,
                    ...(workspaceIdentity
                      ? {
                          workspaceIdentity: workspaceIdentity,
                        }
                      : {}),
                    placement: placement,
                  };
                const createdAt = Date.now();
                return {
                  draftId: createGroupedDraftId(createdAt),
                  workspacePath: workspacePath,
                  ...(workspaceIdentity
                    ? {
                        workspaceIdentity: workspaceIdentity,
                      }
                    : {}),
                  placement: placement,
                  createdAt: createdAt,
                };
              })();
              return {
                ...workspaceState,
                activeTaskId: null,
                groupedDraftTask: nextGroupedDraft,
                draftRuntime: {
                  status: `idle`,
                  error: null,
                },
                ...(draftOptions
                  ? {
                      configOptions: draftOptions,
                      configOptionsStatus: draftOptionsStatus,
                      draftPreferredModel: preferredModel,
                      draftPreferredMode: preferredMode,
                      draftPreferredThoughtLevel: preferredThoughtLevel,
                      draftSessionId: null,
                    }
                  : {
                      draftPreferredModel: null,
                      draftPreferredMode: null,
                      draftPreferredThoughtLevel: null,
                    }),
                draftError: null,
                modelSwitchRequestId: null,
                modelSwitchPending: false,
                modelSwitchStage: `idle`,
                draftFocusVersion: workspaceState.draftFocusVersion + 1,
                optimisticMessages: [],
                ...(resetSlashCommands
                  ? {
                      slashCommands: [],
                    }
                  : {}),
                ...(resolvedProvider
                  ? {
                      selectedProvider: nextProvider,
                    }
                  : {}),
                ...(providerChanged
                  ? {
                      selectedSupplierKey: formatNativeSupplierKey(nextProvider),
                      isGhostSupplier: false,
                      supplierMismatchReason: null,
                    }
                  : {}),
              };
            },
            workspaceIdentity,
          ),
        );
    },
    clearGroupedDraftTask: (workspacePath: string, workspaceIdentity?: string | null) => {
      set((state) =>
        updateWorkspaceTaskState(
          state,
          workspacePath,
          (workspaceState) =>
            workspaceState.groupedDraftTask
              ? {
                  ...workspaceState,
                  groupedDraftTask: null,
                }
              : workspaceState,
          workspaceIdentity,
        ),
      );
    },
    bindRuntimeProvider: (workspacePath: string, provider: string, workspaceIdentity?: string | null) =>
      set((state) =>
        updateWorkspaceTaskState(
          state,
          workspacePath,
          (workspaceState) => ({
            ...workspaceState,
            selectedProvider: resolveAgentProvider(provider),
          }),
          workspaceIdentity,
        ),
      ),
    setModelSelectionResolution: (
      workspacePath: string,
      resolution: { selectedSupplierKey: string; isGhostSupplier: boolean; supplierMismatchReason: string | null },
      workspaceIdentity?: string | null,
    ) => {
      set((state) =>
        updateWorkspaceTaskState(
          state,
          workspacePath,
          (workspaceState) => ({
            ...workspaceState,
            selectedSupplierKey: resolution.selectedSupplierKey,
            isGhostSupplier: resolution.isGhostSupplier,
            supplierMismatchReason: resolution.supplierMismatchReason,
          }),
          workspaceIdentity,
        ),
      );
    },
    setWorkspaceInitState: (workspacePath: string, status: string, error?: string | null, workspaceIdentity?: string | null) => {
      set((state) =>
        updateWorkspaceTaskState(
          state,
          workspacePath,
          (workspaceState) => ({
            ...workspaceState,
            workspaceInit: {
              ...getWorkspaceInit(workspaceState),
              status: status,
              error: error ?? null,
            },
          }),
          workspaceIdentity,
        ),
      );
    },
    setWorkspaceInitAttempts: (workspacePath: string, attempts: number, workspaceIdentity?: string | null) => {
      set((state) =>
        updateWorkspaceTaskState(
          state,
          workspacePath,
          (workspaceState) => ({
            ...workspaceState,
            workspaceInit: {
              ...getWorkspaceInit(workspaceState),
              attempts: attempts,
            },
          }),
          workspaceIdentity,
        ),
      );
    },
    setTaskState: (workspacePath: string, status: string, error?: string | null, workspaceIdentity?: string | null) => {
      set((state) =>
        updateWorkspaceTaskState(
          state,
          workspacePath,
          (workspaceState) => ({
            ...workspaceState,
            draftRuntime: {
              status: status,
              error: error ?? null,
            },
          }),
          workspaceIdentity,
        ),
      );
    },
    setDraftError: (workspacePath: string, error: string | null, workspaceIdentity?: string | null) => {
      set((state) =>
        updateWorkspaceTaskState(
          state,
          workspacePath,
          (workspaceState) => ({
            ...workspaceState,
            draftError: error,
          }),
          workspaceIdentity,
        ),
      );
    },
    startModelSwitch: (
      workspacePath: string,
      requestId: string,
      stage: string = `settingModel`,
      workspaceIdentity?: string | null,
      flags?: { pending?: boolean } | null,
    ) => {
      set((state) =>
        updateWorkspaceTaskState(
          state,
          workspacePath,
          (workspaceState) => ({
            ...workspaceState,
            modelSwitchRequestId: requestId,
            modelSwitchPending: flags?.pending ?? true,
            modelSwitchStage: stage,
          }),
          workspaceIdentity,
        ),
      );
    },
    updateModelSwitchStage: (workspacePath: string, requestId: string, stage: string, workspaceIdentity?: string | null) => {
      set((state) =>
        updateWorkspaceTaskState(
          state,
          workspacePath,
          (workspaceState) =>
            workspaceState.modelSwitchRequestId === requestId
              ? {
                  ...workspaceState,
                  modelSwitchStage: stage,
                }
              : workspaceState,
          workspaceIdentity,
        ),
      );
    },
    finishModelSwitch: (workspacePath: string, requestId: string, workspaceIdentity?: string | null) => {
      set((state) =>
        updateWorkspaceTaskState(
          state,
          workspacePath,
          (workspaceState) =>
            workspaceState.modelSwitchRequestId === requestId
              ? {
                  ...workspaceState,
                  modelSwitchRequestId: null,
                  modelSwitchPending: false,
                  modelSwitchStage: `idle`,
                }
              : workspaceState,
          workspaceIdentity,
        ),
      );
    },
    setConfigOptions: (workspacePath: string, options: ConfigOption[], workspaceIdentity?: string | null) => {
      set((state) => {
        const workspaceState = getWorkspaceTaskState(state, workspacePath, workspaceIdentity);
        const reconciled = reconcileConfigOptionsWithGuard({
            workspacePath: workspacePath,
            workspaceIdentity: workspaceIdentity,
            currentOptions: workspaceState.configOptions,
            nextOptions: sanitizeConfigOptions(options),
          }),
          readModelValue = (list: ConfigOption[] | null | undefined) =>
            String(list?.find((option) => option.category === `model` && option.type === `select`)?.currentValue ?? ``),
          skippedAsEquivalent = areConfigOptionsEqual(workspaceState.configOptions, reconciled);
        return (
          logger.info(`[store] setConfigOptions`, {
            workspacePath: workspacePath,
            currentModelValue: readModelValue(workspaceState.configOptions),
            incomingModelValue: readModelValue(options),
            normalizedModelValue: readModelValue(reconciled),
            skippedAsEquivalent: skippedAsEquivalent,
          }),
          skippedAsEquivalent
            ? state
            : updateWorkspaceTaskState(
                state,
                workspacePath,
                (current) => ({
                  ...current,
                  configOptions: reconciled,
                  draftPreferredModel: null,
                  draftPreferredMode: null,
                  draftPreferredThoughtLevel: null,
                }),
                workspaceIdentity,
              )
        );
      });
    },
    setConfigOptionsStatus: (workspacePath: string, status: string, workspaceIdentity?: string | null) => {
      set((state) =>
        updateWorkspaceTaskState(
          state,
          workspacePath,
          (workspaceState) => ({
            ...workspaceState,
            configOptionsStatus: status,
          }),
          workspaceIdentity,
        ),
      );
    },
    setSlashCommands: (workspacePath: string, commands: unknown[], workspaceIdentity?: string | null) => {
      set((state) =>
        updateWorkspaceTaskState(
          state,
          workspacePath,
          (workspaceState) => ({
            ...workspaceState,
            slashCommands: commands,
          }),
          workspaceIdentity,
        ),
      );
    },
    setCurrentModeId: (workspacePath: string, modeId: string | null, workspaceIdentity?: string | null) => {
      set((state) =>
        updateWorkspaceTaskState(
          state,
          workspacePath,
          (workspaceState) => {
            const nextConfigOptions = applyModeIdToOptions(workspaceState.configOptions, modeId);
            const activeTaskPatch = updateActiveTaskConfigOptions(workspaceState, (taskOptions) => applyModeIdToOptions(taskOptions, modeId));
            return nextConfigOptions === workspaceState.configOptions && !activeTaskPatch
              ? workspaceState
              : {
                  ...workspaceState,
                  configOptions: nextConfigOptions,
                  ...activeTaskPatch,
                };
          },
          workspaceIdentity,
        ),
      );
    },
    bumpTaskListVersion: (workspacePath: string, workspaceIdentity?: string | null) => {
      set((state) =>
        updateWorkspaceTaskState(
          state,
          workspacePath,
          (workspaceState) => ({
            ...workspaceState,
            taskListVersion: workspaceState.taskListVersion + 1,
          }),
          workspaceIdentity,
        ),
      );
    },
    setTaskListCache: (workspacePath: string, cache: TaskMeta[] | null, workspaceIdentity?: string | null) => {
      set((state) =>
        updateWorkspaceTaskState(
          state,
          workspacePath,
          (workspaceState) => ({
            ...workspaceState,
            taskListCache: cache,
            taskUnreadByTaskId: workspaceState.taskUnreadByTaskId,
          }),
          workspaceIdentity,
        ),
      );
    },
    setTaskUnreadIndicator: (workspacePath: string, taskId: string, unread: boolean, workspaceIdentity?: string | null) => {
      set((state) =>
        updateWorkspaceTaskState(
          state,
          workspacePath,
          (workspaceState) => {
            const optimisticTask = workspaceState.optimisticTaskListByTaskId[taskId];
            const cachedTask = workspaceState.taskListCache?.find((task) => task.taskId === taskId);
            const mergedTask = optimisticTask ?? cachedTask;
            const alreadyUnread = workspaceState.taskUnreadByTaskId[taskId] === true;
            const existingUnreadAt = optimisticTask?.unreadAt ?? cachedTask?.unreadAt;
            if (unread) {
              const unreadAt = mergedTask?.unreadAt ?? Date.now();
              if (alreadyUnread && existingUnreadAt === unreadAt) return workspaceState;
              const nextOptimistic = mergedTask
                ? {
                    ...workspaceState.optimisticTaskListByTaskId,
                    [taskId]: {
                      ...mergedTask,
                      unreadAt: unreadAt,
                    },
                  }
                : workspaceState.optimisticTaskListByTaskId;
              return {
                ...workspaceState,
                optimisticTaskListByTaskId: nextOptimistic,
                taskUnreadByTaskId: {
                  ...workspaceState.taskUnreadByTaskId,
                  [taskId]: true,
                },
              };
            }
            if (!alreadyUnread && existingUnreadAt === void 0) return workspaceState;
            const { [taskId]: _clearedUnread, ...restUnread } = workspaceState.taskUnreadByTaskId;
            const nextOptimistic = mergedTask
              ? {
                  ...workspaceState.optimisticTaskListByTaskId,
                  [taskId]: {
                    ...mergedTask,
                    unreadAt: void 0,
                  },
                }
              : workspaceState.optimisticTaskListByTaskId;
            return {
              ...workspaceState,
              optimisticTaskListByTaskId: nextOptimistic,
              taskUnreadByTaskId: restUnread,
            };
          },
          workspaceIdentity,
        ),
      );
    },
  };
}

/* ============================================================================
 * 13. useTaskStore（原 yn，jsx 1794–1800；导出 h；styles 侧 `xe`）
 * ==========================================================================*/

type TaskStoreNavActions = ReturnType<typeof createTaskNavActions>;
type TaskStoreStateActions = ReturnType<typeof createTaskStateActions>;
type TaskStoreRuntimeActions = ReturnType<typeof createTaskRuntimeActions>;

type TaskStore = TaskStoreState &
  TaskStoreNavActions &
  TaskStoreStateActions &
  TaskStoreRuntimeActions & {
    getWorkspaceState: (workspacePath: string, workspaceIdentity?: string | null) => WorkspaceTaskState;
  };

/** 原 yn（jsx 1794）：任务/会话 store——导航/状态/运行时三动作族 + 工作区状态取数。 */
const useTaskStore = create()<TaskStore>((set, get) => ({
  workspaces: {},
  ...createTaskNavActions(set, get),
  ...createTaskStateActions(set),
  ...createTaskRuntimeActions(set),
  getWorkspaceState: (workspacePath, workspaceIdentity) => getWorkspaceTaskState(get(), workspacePath, workspaceIdentity),
}));

/** 原 jsx 1800：E2E 桥挂载（__zcodeSessionStoreE2E）。 */
isE2EStoreBridgeEnabled() && (window.__zcodeSessionStoreE2E = useTaskStore);


/* ============================================================================
 * 导出（A0-S4-3：对应原 SkillStore 导出块中任务域 31 符号 + 类型补导出 5 项）
 * ==========================================================================*/

export {
  filterNativeModelOptions,
  getWorkspaceInit,
  updateLastAgentModel,
  readLastAgentModelOnly,
  readLastAgentModelConfig,
  getTaskRuntime,
  mergeTaskMeta,
  resolveWorkspaceKey,
  getTaskUi,
  isTaskUnread,
  canGoForwardInTaskNav,
  isTaskNavAutomationsEntry,
  parseCustomModelId,
  getMergedTaskListItem,
  getMergedTaskList,
  persistLastAgentConfigIfUnchanged,
  getCurrentThoughtLevelValue,
  getWorkspaceTaskStateAlias,
  getWorkspaceTaskState,
  mergeTaskMetaMany,
  applyStoredConfigToOptions,
  hasThoughtLevelOption,
  buildTaskConfigOptionsFromMeta,
  useTaskStore,
  canGoBackInTaskNav,
  formatCustomModelId,
  applyStoredModelToOptions,
  getCurrentModelValue,
  writeLastAgentConfig,
  clearLastAgentModelConfig,
  getActiveTaskStatusError,
};
export type { TaskMeta, TaskStore, TaskStoreState, WorkspaceTaskState, GroupedDraftPlacement, ConfigOption }; // A1-R17：+ConfigOption（KSt 簇 captchaProviderOfTaskMeta configOptions 真型）
