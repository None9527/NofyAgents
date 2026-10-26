type Obj = Record<string, unknown>;
const object = (v: unknown): Obj | null => typeof v === "object" && v !== null && !Array.isArray(v) ? v as Obj : null;

export function permissionScope(params: Obj, optionId: string): { toolName: string; server: string | null } | null {
  if (optionId !== "allow-always-mcp" || !Array.isArray(params.options)) return null;
  const option = params.options.map(object).find((o) => o?.optionId === optionId);
  const meta = object(option?._meta);
  return meta && typeof meta.tool_name === "string" ? { toolName: meta.tool_name, server: typeof meta.server_prefix === "string" ? meta.server_prefix : null } : null;
}

export function permissionResponse(optionId: string, meta: Obj): Obj {
  return { outcome: { outcome: "selected", optionId }, _meta: meta };
}
