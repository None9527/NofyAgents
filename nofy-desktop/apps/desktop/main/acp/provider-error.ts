/** Reduce untrusted provider bodies to a fixed, actionable vocabulary; never return raw text. */
export type ProviderErrorSummary = { kind: "credentials" | "quota" | "rate-limit" | "model" | "connection" | "provider" | "unknown"; httpStatus: number | null; guidance: string };
/**
 * Git RPC failures put the kernel text in JSON-RPC `error.data` and a generic
 * "Internal error" in `error.message`. That data string is the message the UI shows.
 * Other methods keep the provider summary so raw supplier bodies stay off screen.
 */
export function rpcErrorText(method: string, error: { message?: string; data?: unknown }): string {
  if (method.includes("/git/") && typeof error.data === "string" && error.data.trim() !== "") return error.data;
  const summary = summarizeProviderError(error.data);
  if (summary.kind !== "unknown") return summary.guidance;
  return error.message ?? "rpc error (" + method + ")";
}

export function summarizeProviderError(data: unknown): ProviderErrorSummary {
  let text = "";
  try { text = (typeof data === "string" ? data : JSON.stringify(data) ?? "").toLowerCase(); } catch {}
  const statuses = text.match(/\b(?:400|401|402|403|404|408|429|500|502|503|504)\b/g) ?? [];
  const status = statuses.length ? Number(statuses[0]) : null;
  if (status === 401 || status === 403 || /unauthorized|forbidden|invalid[_ -]?api[_ -]?key|authentication|api key.*(?:invalid|incorrect|missing)/.test(text)) return { kind: "credentials", httpStatus: status, guidance: "模型服务拒绝了认证。请在模型设置中核对当前供应商的 API key，保存后重试。" };
  if (status === 402 || /insufficient|quota|credit|balance/.test(text)) return { kind: "quota", httpStatus: status, guidance: "模型服务额度不足。请检查供应商账户余额或配额。" };
  if (status === 429 || /rate[_ -]?limit|too many requests/.test(text)) return { kind: "rate-limit", httpStatus: status, guidance: "模型服务暂时限流，请稍后重试。" };
  if (status === 404 || /model.*(?:not found|not available|does not exist)/.test(text)) return { kind: "model", httpStatus: status, guidance: "模型服务没有找到该模型，请选择供应商支持的模型。" };
  if (status === 408 || /timeout|timed out|connection|network|dns|certificate/.test(text)) return { kind: "connection", httpStatus: status, guidance: "无法连接模型服务。请检查网络和供应商地址后重试。" };
  if (status !== null && status >= 500) return { kind: "provider", httpStatus: status, guidance: "模型服务暂时不可用，请稍后重试。" };
  return { kind: "unknown", httpStatus: status, guidance: "内核请求失败。请检查模型配置；诊断中保留错误代码。" };
}
