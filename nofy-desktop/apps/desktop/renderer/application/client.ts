import { observePromptAdmission } from "./conversation/promptAdmission.ts";
import { settingsClientFor } from "./settings/public.ts";
import type { Runtime } from "../core/runtime.ts";
import { readContext, readFsFile, readFsNodes, readGitStatus, readSearchId } from "../ui/readers.ts";
import { permAction } from "../core/permissions.ts";
import type { Effect } from "../core/effects.ts";
import type { DesktopClient, PendingInteraction } from "./contracts/public.ts";
/** One client per assembled runtime. No bridge, arbitrary request, port or dispatch escapes. */
const clients = new WeakMap<Runtime, DesktopClient>();
export function createDesktopClient(runtime: Runtime): DesktopClient {
  const existing = clients.get(runtime);
  if (existing) return existing;
  const respond = (item: PendingInteraction, effect: Effect) => {
    if (!runtime.store.getState().pendingInteractions.includes(item)) return Promise.resolve({ ok: false as const, effect: effect.kind, error: "审批已失效" });
    return runtime.effect(effect);
  };
  const checked = async (cwd: string, effect: Effect): Promise<import("../core/effects.ts").TaskResult> => {
    const epoch = runtime.store.getState().connection.transportEpoch;
    try {
      await runtime.bridge.validateDirectory(cwd);
      const state = runtime.store.getState();
      if (state.connection.status !== "ready" || state.connection.transportEpoch !== epoch) return { ok: false, effect: effect.kind, error: "连接已变化，请等待会话恢复后重试" };
      if (effect.kind === "session/prompt" && state.sessions[effect.sessionId]?.agentState === "turn-cancelling") return { ok: false, effect: effect.kind, error: "当前轮次正在停止，请稍后发送" };
      if (effect.kind === "session/prompt" && state.sessions[effect.sessionId]?.cwd !== cwd) return { ok: false, effect: effect.kind, error: "会话工作区已变化，请重新发送" };
      return runtime.effect(effect);
    } catch (e) { return { ok: false, effect: effect.kind, error: e instanceof Error ? e.message : String(e) }; }
  };
  let promptCounter = 0;
  const submitting = new Set<string>();
  const client: DesktopClient = {
    host: { readRaster: (root,path) => runtime.bridge.readRaster(root,path), watchFiles: request => runtime.bridge.watchFiles(request), unwatchFiles: id => runtime.bridge.unwatchFiles(id), onFilesChanged: listener => runtime.bridge.onFilesChanged(listener), copyFilePath: value => runtime.bridge.copyFilePath(value), openWorkspacePath: (path, kind) => runtime.bridge.openWorkspacePath(path, kind) },
    settings: settingsClientFor(runtime),
    projection: Object.freeze({ getState: runtime.store.getState, subscribe: runtime.store.subscribe }),
    sessions: {
      create: (cwd) => checked(cwd, { kind: "session/new", cwd, activate: false }),
      load: (sessionId, cwd, fresh = false) => runtime.effect({ kind: "session/load", sessionId, cwd, activate: false, fresh }),
      activate: (sessionId) => runtime.store.dispatch({ type: "session/activated", sessionId }),
      forget: (sessionId) => runtime.store.dispatch({ type: "session/forgotten", sessionId }),
      send: (sessionId, text, attach) => {
        const cwd = runtime.store.getState().sessions[sessionId]?.cwd;
        if (!cwd) return Promise.resolve({ ok: false, effect: "session/prompt", error: "会话工作区尚未就绪" });
        if (submitting.has(sessionId)) return Promise.resolve({ ok: false, effect: "session/prompt", error: "上一条输入正在确认接收，请稍候" });
        submitting.add(sessionId);
        const promptId = "desktop-" + Date.now().toString(36) + "-" + (++promptCounter);
        return observePromptAdmission(runtime, sessionId, text, promptId, () => checked(cwd, { kind: "session/prompt", sessionId, text, promptId, attach: attach.map(({ path, name }) => ({ path, name })) }))
          .finally(() => submitting.delete(sessionId));
      },
      cancel: (sessionId, cancelSubagents) => runtime.effect({ kind: "session/cancel", sessionId, cancelSubagents }),
      setPermission: async (sessionId, mode) => {
        const epoch = runtime.store.getState().connection.transportEpoch;
        const action = permAction(mode);
        if (action.modeId !== null) {
          const result = await runtime.effect({ kind: "session/setMode", sessionId, modeId: action.modeId });
          if (!result.ok) return result;
        }
        if (runtime.store.getState().connection.transportEpoch !== epoch) return { ok: false, effect: "perm/notify", error: "连接已变化，请重新选择权限模式" };
        const result = await runtime.effect({ kind: "perm/notify", params: action.notify });
        if (result.ok) await runtime.effect({ kind: "roster/pull" });
        return result;
      },
      setModel: (sessionId, modelId, effort) => runtime.effect({ kind: "session/setModel", sessionId, modelId, effort }),
      refreshRoster: () => runtime.effect({ kind: "roster/pull" }),
      listWorkspaces: () => runtime.effect({ kind: "workspaces/pull" }),
      editQueue: (sessionId, entryId, newText) => runtime.effect({ kind: "queue/edit", sessionId, entryId, newText }),
      removeQueue: (sessionId, entryId) => runtime.effect({ kind: "queue/remove", sessionId, entryId }),
      clearQueue: (sessionId) => runtime.effect({ kind: "queue/clear", sessionId }),
    },
    interactions: {
      choose: async (item, optionId) => {
        const epoch = runtime.store.getState().connection.transportEpoch;
        const result = await respond(item, { kind: "permission/respond", id: item.id, optionId });
        if (!result.ok || optionId !== "enable-always-approve") return result;
        if (runtime.store.getState().connection.transportEpoch !== epoch) return { ok: false, effect: "perm/notify", error: "连接已变化，本次放行后的权限切换未发送" };
        return runtime.effect({ kind: "perm/notify", params: permAction("full").notify });
      },
      cancel: (item) => respond(item, { kind: "interaction/cancel", id: item.id, method: item.method }),
      trust: (item, trust) => respond(item, { kind: "folderTrust/respond", id: item.id, trust }),
      answer: (item, payload) => respond(item, { kind: "interaction/answer", id: item.id, payload }),
    },
    workspace: {
      context: async (sessionId) => { const r = await runtime.effect({ kind: "session/info", sessionId }); return r.ok ? readContext(r.value) : null; },
      git: async (sessionId) => { const r = await runtime.effect({ kind: "git/status", sessionId }); if (!r.ok) throw new Error(r.error); return readGitStatus(r.value); },
      pickDirectory: runtime.pickDirectory,
      validateDirectory: path => runtime.bridge.validateDirectory(path),
    },
    tasks: {
      reconcile: (sessionId) => runtime.effect({ kind: "tasks/reconcile", sessionId }),
      kill: (sessionId, taskId) => runtime.effect({ kind: "task/kill", sessionId, taskId }),
      cancelSubagent: (sessionId, subagentId) => runtime.effect({ kind: "subagent/cancel", sessionId, subagentId }),
      deleteSchedule: (sessionId, taskId) => runtime.effect({ kind: "scheduler/delete", sessionId, taskId }),
    },
    files: {
      list: async (sessionId, path) => {
        const r = await runtime.effect({ kind: "fs/list", sessionId, path, depth: 1, includeHidden: false, limit: 500 });
        return r.ok ? { ok: true, value: readFsNodes(r.value) } : { ok: false, error: r.error };
      },
      read: async (sessionId, path) => {
        const r = await runtime.effect({ kind: "fs/readFile", sessionId, path, maxLines: 4000 });
        if (!r.ok) return { ok: false, error: r.error };
        const file = readFsFile(r.value);
        return file ? { ok: true, value: file } : { ok: false, error: "文件响应缺少可读取内容" };
      },
      openSearch: async (sessionId, cwd) => {
        const r = await runtime.effect({ kind: "search/fuzzyOpen", sessionId, cwd });
        if (!r.ok) return { ok: false, error: r.error };
        const id = readSearchId(r.value);
        return id ? { ok: true, value: id } : { ok: false, error: "搜索响应缺少 searchId" };
      },
      changeSearch: (searchId, query) => runtime.effect({ kind: "search/fuzzyChange", searchId, query }),
      closeSearch: (searchId) => runtime.effect({ kind: "search/fuzzyClose", searchId }),
    },
  };
  clients.set(runtime, client);
  return client;
}
