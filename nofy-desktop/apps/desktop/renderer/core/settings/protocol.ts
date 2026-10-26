import type { Effect, TaskResult } from "../effects.ts";
import { serviceResponse } from "../service-actions.ts";
import type { ServiceOperation } from "../service-actions.ts";
export type McpDefinition = { name: string } & (
  { transport: "http"; endpoint: string } |
  { transport: "stdio"; endpoint: string; args: string[]; env: Record<string, string> }
);
export type SetupField = { name: string; label: string; options: Array<{ label: string; value: string }>; required: boolean };
export type SettingsOutcome = { ok: boolean; status: string | null; message: string | null; restart: boolean; reload: boolean; setup: SetupField[] | null };
export function decodeSettingsOutcome(value: unknown): SettingsOutcome {
  const body = serviceResponse(value);
  const status = typeof body["status"] === "string" ? body["status"] : null;
  const raw = serviceResponse(body["setup"])["fields"];
  let setup: SetupField[] | null = null;
  if (Array.isArray(raw) && raw.length > 0) {
    const fields = raw.map(value => {
      const field = serviceResponse(value);
      const options = Array.isArray(field["options"]) ? field["options"].map(value => {
        const option = serviceResponse(value);
        return typeof option["label"] === "string" && typeof option["value"] === "string" ? { label: option["label"], value: option["value"] } : null;
      }) : [];
      if (field["type"] !== "select" || typeof field["id"] !== "string" || !field["id"] || !options.length || options.some(option => option === null)) return null;
      return { name: field["id"], label: typeof field["label"] === "string" ? field["label"] : field["id"], options: options as Array<{ label: string; value: string }>, required: field["required"] === true };
    });
    if (fields.every(field => field !== null) && new Set(fields.map(field => field!.name)).size === fields.length) setup = fields as SetupField[];
  }
  return {
    ok: body["ok"] === true || status === "success" || status === "authenticated",
    status,
    message: typeof body["message"] === "string" ? body["message"] : typeof body["error"] === "string" ? body["error"] : null,
    restart: body["requiresRestart"] === true,
    reload: body["requiresReload"] === true,
    setup,
  };
}
export function encodeMcpDefinition(sessionId: string, definition: McpDefinition): Record<string, unknown> {
  const base = { session_id: sessionId, server_name: definition.name, enabled: true };
  return definition.transport === "http" ? { ...base, url: definition.endpoint } : { ...base, command: definition.endpoint, args: definition.args, env: definition.env };
}
/** Wire names and response decoding never reach the settings views. */
export function createSettingsAdapter(effect: (effect: Effect) => Promise<TaskResult>) {
  const request = async (operation: ServiceOperation, params: Record<string, unknown>) => {
    const result = await effect({ kind: "service/request", operation, params });
    if (!result.ok) throw new Error(result.error);
    return decodeSettingsOutcome(result.value);
  };
  return {
    saveMcp: (id: string, definition: McpDefinition) => request("mcpUpsert", encodeMcpDefinition(id, definition)),
    toggleMcp: (id: string, name: string, enabled: boolean) => request("mcpToggle", { session_id: id, server_name: name, enabled }),
    removeMcp: (id: string, name: string) => request("mcpDelete", { session_id: id, server_name: name }),
    authenticateMcp: (id: string, name: string) => request("mcpAuthTrigger", { session_id: id, server_name: name }),
    setupMcp: (id: string, name: string, values: Record<string, string>) => request("mcpSetup", { sessionId: id, serverName: name, values }),
    installPlugin: (id: string, source: string) => request("pluginsAction", { sessionId: id, action: { type: "install", source } }),
    togglePlugin: (id: string, pluginId: string, enabled: boolean) => request("pluginsAction", { sessionId: id, action: { type: enabled ? "enable" : "disable", plugin_id: pluginId } }),
    uninstallPlugin: (id: string, pluginId: string, confirmed: boolean) => request("pluginsAction", { sessionId: id, action: { type: "uninstall", plugin_id: pluginId, confirmed } }),
    reloadPlugins: (id: string) => request("pluginsAction", { sessionId: id, action: { type: "reload" } }),
  };
}
