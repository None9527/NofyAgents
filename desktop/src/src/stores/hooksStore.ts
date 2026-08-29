// A0-S4-3: 自 modules/stores-workspace.tsx §6 原样迁入（Z0t HooksStore；原文件现为薄 re-export shim）。
import { buildNewHook, hookLocationForScope, hooksWorkspaceKey, isHookEditable, mergeHookPatch, reloadHooks, saveHooksList } from './hooksHelpers';
import type { HookDescriptor, HooksService } from './hooksHelpers';
import { create as createStore } from './zustand'; // 原 Ae（skillStore chunk q 导出）
import type { UseBoundStore } from './storeTypes';

/* ============================================================================
 * 6. HooksStore（原 Z0t，js 201244–201421 / jsx 160815）
 * ----------------------------------------------------------------------------
 * 钩子（事件驱动脚本）：事件/匹配器/命令/参数/超时/异步/壳/状态消息。
 * state 字段表：
 *  | 字段 | 类型 | 用途 |
 *  |---|---|---|
 *  | workspacePath / workspaceIdentity | string\|null | 当前工作区 |
 *  | loadedWorkspaceKey | string \| null | 已加载数据的工作区键 |
 *  | hooks | HookDescriptor[] | 钩子列表 |
 *  | loading / error | boolean / string\|null | 加载态 |
 *  | operatingHookId | string \| null | 操作锁 |
 * actions：initialize/refresh/addHook/updateHook/deleteHook/toggleHook/importHook（7 个）
 * 乐观更新：先改内存再落盘，失败回滚（原 v9 saveHooks 助手）。
 * 事件枚举（原 $0t）：SessionStart/UserPromptSubmit/PreToolUse/PermissionRequest/
 *   PostToolUse/PostToolUseFailure/Stop
 * ==========================================================================*/

export const HOOK_EVENTS = [
  "SessionStart",
  "UserPromptSubmit",
  "PreToolUse",
  "PermissionRequest",
  "PostToolUse",
  "PostToolUseFailure",
  "Stop",
] as const;

/* HookDescriptor/HooksService 已收敛至 StoresDeep 规范型（文件头 import + re-export；
   本地原有 event 联合/editable/shell: string/saveHooks 可选等差异由规范型覆盖） */

export interface HooksState {
  workspacePath: string | null;
  workspaceIdentity: string | null;
  loadedWorkspaceKey: string | null;
  hooks: HookDescriptor[];
  loading: boolean;
  error: string | null;
  operatingHookId: string | null;
  initialize(workspacePath: string | null, workspaceIdentity: string | null, service: HooksService): Promise<void>;
  refresh(service: HooksService): Promise<void>;
  addHook(draft: Partial<HookDescriptor>, service: HooksService): Promise<void>;
  updateHook(hookId: string, patch: Partial<HookDescriptor>, service: HooksService): Promise<void>;
  deleteHook(hookId: string, service: HooksService): Promise<void>;
  toggleHook(hookId: string, enabled: boolean, service: HooksService): Promise<void>;
  importHook(hookId: string, service: HooksService): Promise<void>;
}

const hooksInFlight = new Map<string, Promise<void>>(); // 原 g9

/** 原 K0t：钩子工作区键 */
/** 原 J0t：由草稿构造新钩子（生成 id，落位工作区） */
/** 原 Y0t：合并钩子补丁 */
/** 原 _9：钩子是否可编辑 */
/** 原 q0t：按作用域生成位置描述 */
/** 原 v9：落盘（失败抛出，供回滚） */
/** 原 X0t：重载钩子列表 */

export const useHooksStore: UseBoundStore<HooksState> = createStore<HooksState>((set, get) => ({
  workspacePath: null,
  workspaceIdentity: null,
  loadedWorkspaceKey: null,
  hooks: [],
  loading: false,
  error: null,
  operatingHookId: null,
  initialize: async (workspacePath, workspaceIdentity, service) => {
    const identity = workspaceIdentity?.trim() || null;
    set({ workspacePath: workspacePath ?? null, workspaceIdentity: identity });
    if (!workspacePath) {
      set({ hooks: [], loading: false, loadedWorkspaceKey: null });
      return;
    }
    const key = hooksWorkspaceKey(workspacePath, identity);
    const existing = hooksInFlight.get(key);
    if (existing) {
      await existing;
      return;
    }
    const load = (async () => {
      set({ loading: true, error: null });
      try {
        set({
          hooks: (await service.loadHooks({ workspacePath, ...(identity ? { workspaceIdentity: identity } : {}) })).hooks,
          loadedWorkspaceKey: key,
          loading: false,
        });
      } catch (error) {
        set({ error: error instanceof Error ? error.message : String(error), loading: false });
      } finally {
        hooksInFlight.delete(key);
      }
    })();
    hooksInFlight.set(key, load);
    await load;
  },
  refresh: async (service) => {
    set({ loading: true, error: null });
    try {
      await reloadHooks(get, set, service);
      set({ loading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : String(error), loading: false });
    }
  },
  addHook: async (draft, service) => {
    const { workspacePath, hooks } = get();
    if (!workspacePath) throw new Error("No workspace path set");
    const next = [...hooks, buildNewHook(draft, workspacePath)];
    set({ hooks: next, error: null });
    try {
      await saveHooksList(next, get, set, service);
    } catch (error) {
      set({ hooks, error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  },
  updateHook: async (hookId, patch, service) => {
    const { hooks } = get();
    const target = hooks.find((hook) => hook.id === hookId);
    if (!target || !isHookEditable(target)) throw new Error("Hook is not editable");
    const next = hooks.map((hook) => (hook.id === hookId ? mergeHookPatch(hook, patch) : hook));
    set({ hooks: next, operatingHookId: hookId, error: null });
    try {
      await saveHooksList(next, get, set, service);
      set({ operatingHookId: null });
    } catch (error) {
      set({ hooks, operatingHookId: null, error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  },
  deleteHook: async (hookId, service) => {
    const { hooks } = get();
    const target = hooks.find((hook) => hook.id === hookId);
    if (!target || !isHookEditable(target)) throw new Error("Hook is not editable");
    const next = hooks.filter((hook) => hook.id !== hookId);
    set({ hooks: next, operatingHookId: hookId, error: null });
    try {
      await saveHooksList(next, get, set, service);
      set({ operatingHookId: null });
    } catch (error) {
      set({ hooks, operatingHookId: null, error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  },
  toggleHook: async (hookId, enabled, service) => {
    const { hooks } = get();
    const target = hooks.find((hook) => hook.id === hookId);
    if (!target || !isHookEditable(target)) throw new Error("Hook is not editable");
    const next = hooks.map((hook) => (hook.id === hookId ? { ...hook, enabled } : hook));
    set({ hooks: next, operatingHookId: hookId, error: null });
    try {
      await saveHooksList(next, get, set, service);
      set({ operatingHookId: null });
    } catch (error) {
      set({ hooks, operatingHookId: null, error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  },
  importHook: async (hookId, service) => {
    const { hooks, workspacePath } = get();
    if (!workspacePath) throw new Error("No workspace path set");
    const target = hooks.find((hook) => hook.id === hookId);
    if (!target || target.location?.source === "zcode") throw new Error("Hook is not importable");
    const imported: HookDescriptor = {
      ...target,
      id: `hook-${crypto.randomUUID()}`,
      enabled: true,
      location: hookLocationForScope(workspacePath, target.location?.scope ?? "user"),
    };
    const next = [...hooks, imported];
    set({ hooks: next, operatingHookId: hookId, error: null });
    try {
      await saveHooksList(next, get, set, service);
      set({ operatingHookId: null });
    } catch (error) {
      set({ hooks, operatingHookId: null, error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  },
}));
