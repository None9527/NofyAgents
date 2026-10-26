/**
 * KernelPort——**传输无关**的内核端口。
 *
 * 为什么要这一层（PLAN 裁定 B：renderer↔main 是唯一边界，形状自定义）：
 * 投影与 Effect 层不该认识 Electron IPC，也不该认识 stdio。今天
 * `adaptConnection` 直接把 main 进程的 KernelConnection 适配上来（node 环境下
 * 可跑测试与 smoke）；将来上 Electron 时换一个 `adaptIpcBridge` 即可，
 * bind/effects/project 三个文件一行不改。
 *
 * 出站只暴露**四个语义明确**的原语，刻意不给「发一条任意帧」的口子——
 * 因为 request 与 notification 的区别是行为性的（陷阱 T1/T13），
 * 必须在类型上分开，不能靠调用方自觉。
 */
import type { InboundFrame } from "@nofy-desktop/acp";
import type { KernelConnection } from "../../main/acp/connection.ts";

export type RpcId = number | string;
export type Json = Record<string, unknown>;

/** 入站信号。全部来自内核，不含任何本地合成事件。 */
export type KernelSignal =
  | { kind: "status"; connected: boolean }
  | { kind: "ready"; result: Json }
  | { kind: "notification"; method: string; params: unknown }
  | { kind: "server-request"; id: RpcId; method: string; params: Json }
  | { kind: "malformed"; reason: string };

export type KernelPort = {
  /** 订阅入站信号；返回退订函数。 */
  subscribe: (fn: (sig: KernelSignal) => void) => () => void;
  /** 请求（**等响应**）。 */
  request: (method: string, params?: unknown) => Promise<unknown>;
  /** 扩展请求（方法名自动归一为 _nofy/* 线上形）。 */
  extRequest: (method: string, params?: unknown) => Promise<unknown>;
  /** 通知（**不等响应**）。把请求当通知发会丢，把通知当请求发会永久等待。 */
  notify: (method: string, params?: unknown) => void;
  /** 应答内核→客户端请求。不应答则内核悬挂或 fail-closed。 */
  respond: (id: RpcId, result: unknown) => void;
  /** 停止轮次。session/cancel 是 **notification**（陷阱 T1）。 */
  cancel: (sessionId: string, meta?: Record<string, unknown>) => void;
  /** 连接是否已就绪（initialize 完成且传输开着）。 */
  isReady: () => boolean;
};

/** 把 main 进程的 KernelConnection 适配成 KernelPort。 */
export function adaptConnection(conn: KernelConnection): KernelPort {
  return {
    subscribe: (fn) => {
      const offs = [
        conn.on("status", (s) => fn({ kind: "status", connected: s.connected })),
        conn.on("ready", (r) => fn({ kind: "ready", result: r as Json })),
        conn.on("malformed", (m) => fn({ kind: "malformed", reason: m.reason })),
        // 通知与 server-request 都从 frame 流取，避免依赖 connection 的
        // 「typed convenience 事件」子集（那个子集不覆盖 mcp/* 与 prompt_complete）。
        conn.on("frame", (f: InboundFrame) => {
          if (f.kind === "notification") fn({ kind: "notification", method: f.method, params: f.params });
          else if (f.kind === "server-request") fn({ kind: "server-request", id: f.id, method: f.method, params: f.params as Json });
        }),
      ];
      return () => {
        for (const off of offs) off();
      };
    },
    request: (method, params) => conn.rpc(method, params),
    extRequest: (method, params) => conn.ext(method, params),
    notify: (method, params) => {
      conn.notify(method, params);
    },
    respond: (id, result) => {
      conn.respond(id, result);
    },
    cancel: (sessionId, meta) => {
      conn.cancel(sessionId, meta);
    },
    isReady: () => conn.isInitialized && conn.isOpen(),
  };
}

