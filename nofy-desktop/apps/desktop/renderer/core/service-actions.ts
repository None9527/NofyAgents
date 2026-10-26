import { AGENT_METHOD, EXT_CLIENT_REQUEST, EXT_DISPATCH_ONLY, EXT_REQUEST } from "@nofy-desktop/acp";

/** Direction comes from kernel dispatch and generated usage, never arbitrary UI method names. */
export const SERVICE_REQUESTS = {
  // Legacy request is accepted explicitly in acp_agent.rs and auth.rs; extractor omits mixed-case names.
  setApiKey: "_nofy/setApiKey",
  authInfo: EXT_DISPATCH_ONLY.auth_info,
  hooksList: EXT_REQUEST.hooksList,
  bundleStatus: EXT_CLIENT_REQUEST.bundle_status,
  bundleEntryGet: EXT_CLIENT_REQUEST.bundle_entry_get,
  mcpList: EXT_REQUEST.mcpList,
  sessionRename: EXT_REQUEST.sessionRename,
  sessionFork: EXT_REQUEST.sessionFork,
  sessionDelete: EXT_REQUEST.sessionDelete,
  sessionSearch: EXT_CLIENT_REQUEST.session_search,
  modelAuthenticate: AGENT_METHOD.authenticate,
  modelsReload: EXT_REQUEST.reloadModels,
  mcpUpsert: EXT_REQUEST.mcpUpsert,
  mcpDelete: EXT_REQUEST.mcpDelete,
  mcpToggle: EXT_REQUEST.mcpToggle,
  mcpSetup: EXT_REQUEST.mcpSetup,
  mcpAuthTrigger: EXT_REQUEST.mcpAuthTrigger,
  pluginsAction: EXT_REQUEST.pluginsAction,
  rewindPoints: EXT_REQUEST.rewindPoints,
  rewindExecute: EXT_REQUEST.rewindExecute,
} as const;
export type ServiceOperation = keyof typeof SERVICE_REQUESTS;

export function serviceResponse(value: unknown): Record<string, unknown> {
  const object = value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  const result = object["result"];
  return result !== null && typeof result === "object" && !Array.isArray(result) ? result as Record<string, unknown> : object;
}
