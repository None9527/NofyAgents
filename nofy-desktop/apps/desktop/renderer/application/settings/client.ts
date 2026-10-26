import type { Runtime } from "../../core/runtime.ts";
import { createSettingsOperations } from "./operations.ts";
import type { NativeModelAccess } from "./operations.ts";
import { tr } from "../../ui/i18n.ts";
import type { AppState } from "../../core/store/state.ts";
import type { Effect, TaskResult } from "../../core/effects.ts";
import { createSettingsAdapter } from "../../core/settings/protocol.ts";
import type { SettingsOutcome } from "../../core/settings/protocol.ts";
import { validateMcpDraft } from "./validation.ts";
import type { PluginCommand, SettingsClient, SettingsResult } from "./contracts.ts";
import { settleSettingsWrite } from "./writeResult.ts";
import { asObj, readMcpServers, readPlugins } from "../../ui/readers.ts";
import type { McpServerRow, PluginRow } from "../../ui/readers.ts";

export function createSettingsClient(effect: (effect: Effect) => Promise<TaskResult>, getState: () => AppState, native?: NativeModelAccess): SettingsClient {
  const adapter = createSettingsAdapter(effect);
  const locks = new Set<string>();
  const message = (result: SettingsOutcome) => result.message ?? (result.ok ? tr("已写入；正在重新读取内核状态。") : tr("操作未成功：{0}", [result.status ?? "返回值未确认成功"]));
  const stale = (): SettingsResult => ({ kind: "error", code: "stale", message: "会话或连接已变化，请重新读取设置" });
  const rejected = (text: string): SettingsResult => {
    const settled = settleSettingsWrite({ committed: null, draft: text, accepted: false, error: text, readBack: null });
    return { kind: "error", code: "remote", message: settled.error ?? text };
  };
  const finish = <T>(outcome: SettingsOutcome, readBack: T | null, readError: string | null): SettingsResult => {
    const settled = settleSettingsWrite({
      committed: null as T | null,
      draft: readBack,
      accepted: true,
      error: readError ?? (readBack === null ? tr("内核未回读确认。") : null),
      readBack,
    });
    if (!settled.success) return { kind: "error", code: "remote", message: settled.error ?? tr("内核未回读确认。") };
    return { kind: "success", message: message(outcome), restart: outcome.restart };
  };
  const catalog = async (kind: "eco/mcp" | "eco/plugins", sessionId: string, key: "servers" | "plugins"): Promise<{ rows: unknown[] | null; error: string | null; value: unknown }> => {
    const listed = await effect({ kind, sessionId });
    if (!listed.ok) return { rows: null, error: listed.error, value: null };
    const list = asObj(asObj(listed.value)["result"])[key];
    if (!Array.isArray(list)) return { rows: null, error: null, value: null };
    return { rows: list, error: null, value: listed.value };
  };
  const mcpCatalog = async (sessionId: string): Promise<{ rows: McpServerRow[] | null; error: string | null }> => {
    const listed = await catalog("eco/mcp", sessionId, "servers");
    return { rows: listed.rows === null ? null : readMcpServers(listed.value), error: listed.error };
  };
  const pluginCatalog = async (sessionId: string): Promise<{ rows: PluginRow[] | null; error: string | null }> => {
    const listed = await catalog("eco/plugins", sessionId, "plugins");
    return { rows: listed.rows === null ? null : readPlugins(listed.value), error: listed.error };
  };
  const pluginConfirmed = (command: PluginCommand, rows: PluginRow[], beforeIds: Set<string> | null): boolean => {
    if (command.kind === "uninstall") return rows.every((row) => row.id !== command.pluginId);
    if (command.kind === "toggle") {
      const row = rows.find((item) => item.id === command.pluginId);
      return row !== undefined && row.enabled === command.enabled;
    }
    const source = command.source.trim();
    if (rows.some((row) => row.id === source || row.name === source || row.marketplaceSource === source)) return true;
    return beforeIds !== null && rows.some((row) => !beforeIds.has(row.id));
  };
  const run = async (id: string, work: (valid: () => boolean) => Promise<SettingsResult>): Promise<SettingsResult> => {
    const initial = getState();
    if (initial.connection.status !== "ready") return { kind: "error", code: "disconnected", message: "连接尚未就绪" };
    const epoch = initial.connection.transportEpoch;
    const valid = () => { const state = getState(); return state.activeSessionId === id && state.connection.transportEpoch === epoch && state.connection.status === "ready"; };
    if (!valid()) return { kind: "error", code: "stale", message: "会话已变化，请重新操作" };
    const key = JSON.stringify([id, epoch]);
    if (locks.has(key)) return { kind: "error", code: "busy", message: "该会话正在保存设置" };
    locks.add(key);
    try {
      const result = await work(valid);
      return valid() ? result : { kind: "error", code: "stale", message: "会话或连接已变化，请重新读取设置" };
    } catch (error) {
      return { kind: "error", code: valid() ? "remote" : "stale", message: error instanceof Error ? error.message : String(error) };
    } finally { locks.delete(key); }
  };
  const attempt = async (work: () => Promise<SettingsOutcome>): Promise<SettingsOutcome | SettingsResult> => {
    try { return await work(); } catch (error) { return rejected(error instanceof Error ? error.message : String(error)); }
  };
  return {
    ...createSettingsOperations(effect, getState, native),
    mcp: {
      save: async (id, draft) => {
        let definition;
        try { definition = validateMcpDraft(draft); } catch (error) { return { kind: "error", code: "validation", message: error instanceof Error ? error.message : String(error) }; }
        return run(id, async (valid) => {
          const outcome = await attempt(() => adapter.saveMcp(id, definition));
          if ("kind" in outcome) return outcome;
          if (!outcome.ok) return rejected(message(outcome));
          if (!valid()) return stale();
          const listed = await mcpCatalog(id);
          const found = listed.rows?.some((server) => server.name === definition.name) === true;
          return finish(outcome, found ? definition.name : null, listed.error);
        });
      },
      toggle: (id, name, enabled) => run(id, async (valid) => {
        const outcome = await attempt(() => adapter.toggleMcp(id, name, enabled));
        if ("kind" in outcome) return outcome;
        if (!outcome.ok) return rejected(message(outcome));
        if (!valid()) return stale();
        const listed = await mcpCatalog(id);
        const row = listed.rows?.find((server) => server.name === name);
        return finish(outcome, row !== undefined && row.enabled === enabled ? enabled : null, listed.error);
      }),
      remove: (id, name) => run(id, async (valid) => {
        const outcome = await attempt(() => adapter.removeMcp(id, name));
        if ("kind" in outcome) return outcome;
        if (!outcome.ok) return rejected(message(outcome));
        if (!valid()) return stale();
        const listed = await mcpCatalog(id);
        const gone = listed.rows !== null && listed.rows.every((server) => server.name !== name);
        return finish(outcome, gone ? name : null, listed.error);
      }),
      authenticate: (id, name) => run(id, async () => {
        const outcome = await attempt(() => adapter.authenticateMcp(id, name));
        if ("kind" in outcome) return outcome;
        if (outcome.status === "setup_required") return outcome.setup ? { kind: "setup", server: name, fields: outcome.setup } : { kind: "error", code: "unsupported", message: tr("内核未提供可支持的 setup 字段。") };
        if (!outcome.ok) return rejected(message(outcome));
        const listed = await mcpCatalog(id);
        const found = listed.rows?.some((server) => server.name === name) === true;
        return finish(outcome, found ? name : null, listed.error);
      }),
      setup: (id, name, values) => run(id, async (valid) => {
        const outcome = await attempt(() => adapter.setupMcp(id, name, values));
        if ("kind" in outcome) return outcome;
        if (!outcome.ok) return rejected(message(outcome));
        if (!valid()) return stale();
        const listed = await mcpCatalog(id);
        const found = listed.rows?.some((server) => server.name === name) === true;
        return finish(outcome, found ? name : null, listed.error);
      }),
    },
    plugins: {
      execute: (id, command) => run(id, async valid => {
        if (command.kind === "install" && !command.source.trim()) return { kind: "error", code: "validation", message: "请输入插件来源" };
        let beforeIds: Set<string> | null = null;
        if (command.kind === "install") {
          const before = await pluginCatalog(id);
          if (!valid()) return stale();
          if (before.error !== null) return rejected(before.error);
          if (before.rows === null) return rejected(tr("内核未回读确认。"));
          beforeIds = new Set(before.rows.map((row) => row.id));
        }
        const outcome = await attempt(() => command.kind === "install" ? adapter.installPlugin(id, command.source.trim()) : command.kind === "toggle" ? adapter.togglePlugin(id, command.pluginId, command.enabled) : adapter.uninstallPlugin(id, command.pluginId, command.confirmed));
        if ("kind" in outcome) return outcome;
        if (!outcome.ok) {
          if (command.kind === "uninstall" && outcome.status === "confirmation_required") return { kind: "confirmation", pluginId: command.pluginId, message: message(outcome) };
          return rejected(message(outcome));
        }
        if (outcome.reload && valid()) {
          const reloaded = await attempt(() => adapter.reloadPlugins(id));
          if ("kind" in reloaded) return reloaded;
          if (!reloaded.ok) return { kind: "error", code: "remote", message: tr("写入成功；重新加载失败：") + message(reloaded) };
        }
        if (!valid()) return stale();
        const listed = await pluginCatalog(id);
        const confirmed = listed.rows !== null && pluginConfirmed(command, listed.rows, beforeIds);
        return finish(outcome, confirmed ? command.kind : null, listed.error);
      }),
    },
  };
}

const clients = new WeakMap<Runtime, SettingsClient>();
export function settingsClientFor(runtime: Runtime): SettingsClient {
  let client = clients.get(runtime);
  if (!client) { client = createSettingsClient(runtime.effect, runtime.store.getState, runtime); clients.set(runtime, client); }
  return client;
}
