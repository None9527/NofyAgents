// nofy kernel host bridge — A1 Track A（main↔host IPC 面）
//
// PORTING-PLAN §阶段 A / §3：host（utilityProcess）不直连内核，经 main 的
// NofyKernelClient 单例走 ACP（§2.3 单客户端约束；顺带修掉每窗口各连一条的隐患）。
// 本模块是 Stage B 的消费面：host 侧接线（替换 ZCodeProtocolClient 语义）在阶段 B。
//
// 消息契约（utilityProcess postMessage，附加式监听，不触碰既有 host 消息分派）：
//   host→main  { type: "nofy-kernel-call", requestId, op, ... }
//     op:"rpc"      {method, params}      标准 ACP request（initialize/session/*…）
//     op:"ext"      {method, params}      内核扩展 request（幂等补 `_nofy/` 前缀，§2.2）
//     op:"notify"   {method, params}      notification（session/cancel 必须走此形，§2.1）
//     op:"cancel"   {sessionId, meta?}    停止：cancel 通知 + 挂起权限请求回 cancelled
//     op:"respond"  {id, result}          应答 server→client 请求（权限/问答/计划模式…）
//     op:"ready"    {}                    → {ready, url, endpointMode}
//     op:"state"    {}                    → stateSnapshot()（initialize 结果/modelState）
//   main→host  { type: "nofy-kernel-result", requestId, ok, result? | error? }
//              { type: "nofy-kernel-event", event: "acp"|"status"|"ready", payload }
//     event:"acp"    payload={kind:"notification"|"request", method, params, id?}
//                    （全部入站帧；host 按 method 多路复用——session/update、
//                      _nofy/session_notification、_nofy/sessions/changed、
//                      session/request_permission…）
//     event:"status" payload={connected}；event:"ready" payload={}

import { ensureNofyKernelClient, getNofyKernelClient } from "./nofy-kernel-client.js";

export const KERNEL_HOST_MSG = {
  Call: "nofy-kernel-call",
  Result: "nofy-kernel-result",
  Event: "nofy-kernel-event",
};

const kernelHosts = new Set();
let fanoutClient = null;

function send(child, message) {
  try {
    child.postMessage(message);
  } catch {}
}

function broadcast(event, payload) {
  for (const child of kernelHosts) send(child, { type: KERNEL_HOST_MSG.Event, event, payload });
}

function attachFanout(client) {
  if (fanoutClient === client) return;
  fanoutClient = client;
  client.on("acp", (payload) => broadcast("acp", payload));
  client.on("status", (payload) => broadcast("status", payload));
  client.on("ready", () => broadcast("ready", {}));
}

async function handleCall(child, msg) {
  const { requestId, op } = msg;
  const reply = (ok, result, error) =>
    send(child, { type: KERNEL_HOST_MSG.Result, requestId, ok, ...(ok ? { result } : { error }) });
  try {
    const client = await ensureNofyKernelClient();
    switch (op) {
      case "rpc":
        return reply(true, await client.rpc(msg.method, msg.params ?? {}));
      case "ext":
        return reply(true, await client.ext(msg.method, msg.params ?? {}));
      case "notify":
        return reply(true, client.notify(msg.method, msg.params ?? {}));
      case "cancel":
        return reply(true, client.cancel(msg.sessionId, msg.meta));
      case "respond":
        return reply(true, client.respond(msg.id, msg.result));
      case "ready":
        return reply(true, { ready: client.initialized, url: client.url, endpointMode: client.endpointMode });
      case "state":
        return reply(true, client.stateSnapshot());
      default:
        return reply(false, null, `unknown op: ${String(op)}`);
    }
  } catch (e) {
    return reply(false, null, String(e?.message ?? e));
  }
}

/**
 * 把一个 host utilityProcess 接入内核单例：监听其 nofy-kernel-call，
 * 注册事件扇出，退出即摘除。幂等。
 */
export function attachKernelHost(child) {
  if (!child || kernelHosts.has(child)) return;
  kernelHosts.add(child);
  child.on("message", (msg) => {
    if (!msg || typeof msg !== "object" || msg.type !== KERNEL_HOST_MSG.Call) return;
    void handleCall(child, msg);
  });
  child.on("exit", () => kernelHosts.delete(child));
  const existing = getNofyKernelClient();
  if (existing) attachFanout(existing);
  void ensureNofyKernelClient()
    .then((client) => attachFanout(client))
    .catch(() => {}); // 连接失败由单例重连兜底；不阻塞 host spawn
}

export function detachKernelHost(child) {
  kernelHosts.delete(child);
}

export default { KERNEL_HOST_MSG, attachKernelHost, detachKernelHost };
