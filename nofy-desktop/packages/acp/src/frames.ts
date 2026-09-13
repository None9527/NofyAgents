/**
 * 入站帧分类——纯函数，可单测。
 *
 * 旧路 seam/nofy-kernel-client.js 的 onFrame() 把分类逻辑内联在连接对象里，且
 * JSON.parse 失败时**静默 return**。PLAN.md §2.4 明令禁止：坏帧与未知事件必须
 * 显式计数，不得静默丢弃（旧路「索引订阅软成功」就是这样掩盖过真缺陷）。
 *
 * 本模块把分类抽成纯函数并显式产出 malformed，由连接层负责计数与告警。
 */

export type RpcError = {
  code?: number;
  message?: string;
  data?: unknown;
};

/** 我方 request 的应答 */
export type ResponseFrame = {
  kind: "response";
  id: number | string;
  result?: unknown;
  error?: RpcError;
};

/** 内核 → 客户端的 request，**需要应答**，否则内核悬挂 */
export type ServerRequestFrame = {
  kind: "server-request";
  id: number | string;
  method: string;
  params: unknown;
};

/** 通知（无 id） */
export type NotificationFrame = {
  kind: "notification";
  method: string;
  params: unknown;
};

/** 解析失败或形状不合法。reason 用于诊断——绝不静默。 */
export type MalformedFrame = {
  kind: "malformed";
  reason: string;
  /** 截断后的原始文本，避免日志被巨型帧淹没 */
  raw: string;
};

export type InboundFrame =
  | ResponseFrame
  | ServerRequestFrame
  | NotificationFrame
  | MalformedFrame;

const RAW_PREVIEW_MAX = 200;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function preview(raw: string): string {
  return raw.length > RAW_PREVIEW_MAX ? raw.slice(0, RAW_PREVIEW_MAX) + "…" : raw;
}

/**
 * 分类规则与旧路 onFrame 等价（保证行为可逐条对照）：
 *   1. id != null && method 不是字符串 && (result 或 error 存在) → response
 *   2. id != null && method 是字符串                             → server-request
 *   3. method 是字符串                                           → notification
 * 额外：JSON 解析失败、非对象、三者皆不满足 → malformed（旧路为静默丢弃）。
 */
export function classifyFrame(raw: string): InboundFrame {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    return {
      kind: "malformed",
      reason: "json-parse: " + (e instanceof Error ? e.message : String(e)),
      raw: preview(raw),
    };
  }
  if (!isRecord(parsed)) {
    return { kind: "malformed", reason: "not-an-object", raw: preview(raw) };
  }

  const id: unknown = parsed["id"];
  const method: unknown = parsed["method"];
  const hasId = id !== undefined && id !== null;
  const hasMethod = typeof method === "string";

  if (hasId && !hasMethod) {
    const hasResult = parsed["result"] !== undefined;
    const hasError = parsed["error"] !== undefined;
    if (!hasResult && !hasError) {
      return { kind: "malformed", reason: "response-without-result-or-error", raw: preview(raw) };
    }
    const frame: ResponseFrame = { kind: "response", id: id as number | string };
    if (hasResult) frame.result = parsed["result"];
    const errVal: unknown = parsed["error"];
    if (hasError && isRecord(errVal)) {
      const err: RpcError = {};
      if (typeof errVal["code"] === "number") err.code = errVal["code"];
      if (typeof errVal["message"] === "string") err.message = errVal["message"];
      if (errVal["data"] !== undefined) err.data = errVal["data"];
      frame.error = err;
    }
    return frame;
  }

  if (hasId && hasMethod) {
    return {
      kind: "server-request",
      id: id as number | string,
      method: method as string,
      params: parsed["params"] ?? {},
    };
  }

  if (hasMethod) {
    return {
      kind: "notification",
      method: method as string,
      params: parsed["params"] ?? {},
    };
  }

  return { kind: "malformed", reason: "no-id-and-no-method", raw: preview(raw) };
}

