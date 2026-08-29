// A0-S4-3: 自 modules/StoresDeep.tsx §D 原样迁入（Z0t HooksStore 深层助手；原文件现为薄 re-export shim）。
/* ============================================================================
 * §D. Z0t HooksStore 深层助手（原 js 201185–201243）
 * ==========================================================================*/

export interface HookDescriptor {
  id: string;
  event: string;
  matcher?: string;
  type: string;
  command: string;
  args?: string[];
  async?: boolean;
  shell?: string | boolean;
  statusMessage?: string;
  timeout: number;
  enabled: boolean;
  custom?: Record<string, unknown>; // A0-CLEANUP3 3b：按消费面（customJsonOf/HookItem.custom）收敛
  location?: { source: string; scope: string; directoryPath: string; projectPath?: string };
  [key: string]: unknown;
}

export interface HooksService {
  loadHooks(args: { workspacePath: string; workspaceIdentity?: string }): Promise<{ hooks: HookDescriptor[] }>;
  saveHooks(args: { workspacePath: string; workspaceIdentity?: string; hooks: HookDescriptor[] }): Promise<void>;
}

interface HooksStoreSnapshot {
  workspacePath: string | null;
  workspaceIdentity: string | null;
  loadedWorkspaceKey: string | null;
  hooks: HookDescriptor[];
  [key: string]: unknown;
}

/** 原 K0t（201185）：钩子工作区键（身份优先） */
export function hooksWorkspaceKey(workspacePath: string, workspaceIdentity: string | null): string {
  return workspaceIdentity?.trim() || workspacePath;
}

/** 原 q0t（201188）：按作用域生成位置描述（project 带 projectPath；user 无目录） */
export function hookLocationForScope(
  workspacePath: string,
  scope: string = "user",
): HookDescriptor["location"] {
  return scope === "project"
    ? { source: "zcode", scope: "project", directoryPath: "", projectPath: workspacePath }
    : { source: "zcode", scope: "user", directoryPath: "" };
}

/** 原 _9（201193）：钩子是否可编辑（无位置 或 zcode 来源） */
export function isHookEditable(hook: HookDescriptor): boolean {
  return !hook.location || hook.location.source === "zcode";
}

/** 原 J0t（201196）：由草稿构造新钩子（随机 id；process 带 args；command 可选 async/shell；timeout 缺省 60） */
export function buildNewHook(draft: Partial<HookDescriptor> & { storageLevel?: string }, workspacePath: string): HookDescriptor {
  return {
    id: `hook-${crypto.randomUUID()}`,
    event: draft.event as string,
    matcher: draft.matcher,
    type: draft.type as string,
    command: draft.command as string,
    ...(draft.type === "process" ? { args: draft.args ?? [] } : {}),
    ...(draft.type === "command" && draft.async !== undefined ? { async: draft.async } : {}),
    ...(draft.type === "command" && draft.shell !== undefined ? { shell: draft.shell } : {}),
    ...(draft.statusMessage ? { statusMessage: draft.statusMessage } : {}),
    timeout: draft.timeout ?? 60,
    enabled: draft.enabled ?? true,
    custom: draft.custom,
    location: hookLocationForScope(workspacePath, draft.storageLevel),
  };
}

/** 原 Y0t（201213）：合并钩子补丁（args/async/shell 按类型条件化；enabled 缺省保持） */
export function mergeHookPatch(hook: HookDescriptor, patch: Partial<HookDescriptor>): HookDescriptor {
  return {
    ...hook,
    event: patch.event as string,
    matcher: patch.matcher,
    type: patch.type as string,
    command: patch.command as string,
    args: patch.type === "process" ? patch.args ?? [] : undefined,
    async: patch.type === "command" ? patch.async : undefined,
    shell: patch.type === "command" ? patch.shell : undefined,
    statusMessage: patch.statusMessage,
    timeout: patch.timeout ?? 60,
    enabled: patch.enabled ?? hook.enabled,
    custom: patch.custom,
  };
}

/** 原 X0t（201229）：重载钩子列表（落盘工作区键） */
export async function reloadHooks(
  get: () => { workspacePath: string | null; workspaceIdentity: string | null },
  set: (partial: { hooks?: HookDescriptor[]; loadedWorkspaceKey?: string | null }) => void,
  service: HooksService,
): Promise<void> {
  const { workspacePath, workspaceIdentity } = get();
  if (workspacePath) {
    set({
      hooks: (await service.loadHooks({ workspacePath, ...(workspaceIdentity ? { workspaceIdentity } : {}) })).hooks,
      loadedWorkspaceKey: hooksWorkspaceKey(workspacePath, workspaceIdentity),
    });
  }
}

/** 原 v9（201238）：落盘（无工作区抛错；成功后重载；失败抛出供乐观更新回滚） */
export async function saveHooksList(
  hooks: HookDescriptor[],
  get: () => { workspacePath: string | null; workspaceIdentity: string | null },
  set: (partial: { hooks?: HookDescriptor[]; loadedWorkspaceKey?: string | null }) => void,
  service: HooksService,
): Promise<void> {
  const { workspacePath, workspaceIdentity } = get();
  if (!workspacePath) throw new Error("No workspace path set");
  await service.saveHooks({ workspacePath, ...(workspaceIdentity ? { workspaceIdentity } : {}), hooks });
  await reloadHooks(get, set, service);
}

