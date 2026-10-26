import { tr } from "../../ui/i18n.ts";
import type { McpDefinition } from "../../core/settings/protocol.ts";
import type { McpDraft } from "./contracts.ts";
export function validateMcpDraft(draft: McpDraft): McpDefinition {
  const server_name = draft.name.trim();
  if (!server_name || !/^[\p{L}\p{N}_.-]+$/u.test(server_name)) throw new Error(tr("服务名称只能含字母、数字、下划线、点和短横线。"));
  const endpoint = draft.endpoint.trim();
  if (!endpoint) throw new Error(draft.transport==='http'?tr("请输入 HTTP 地址。"):tr("请输入启动命令。"));

  if (draft.transport==='http') {
    let url:URL;
    try {url=new URL(endpoint);} catch {throw new Error(tr("HTTP 地址格式不正确。"));}
    if (!['http:','https:'].includes(url.protocol)) throw new Error(tr("仅支持 HTTP/HTTPS 地址。"));
    if (url.username || url.password) throw new Error(tr("请勿在 URL 中保存密码，使用 MCP setup/认证。"));
    return {name: server_name, transport: "http", endpoint};
  }
  let args:unknown; let env:unknown;
  try {args=JSON.parse(draft.args||'[]');env=JSON.parse(draft.env||'{}');} catch {throw new Error(tr("参数与环境变量必须是 JSON。"));}
  if (!Array.isArray(args) || !args.every(x=>typeof x==='string')) throw new Error(tr("启动参数必须是字符串数组。"));
  if (env===null || typeof env!=='object' || Array.isArray(env) || !Object.values(env).every(x=>typeof x==='string')) throw new Error(tr("环境变量必须是字符串键值对象。"));
  return {name: server_name, transport: "stdio", endpoint, args, env: env as Record<string, string>};
}
