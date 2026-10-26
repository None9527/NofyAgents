/**
 * KernelBridge —— main 侧的信号路由与出站代理。
 *
 * 形状：KernelPort →（本文件）→ IPC wire →（renderer/seam/ipc-port.ts）→ KernelPort。
 * 两端同形，所以 bind / effects / project 三个文件跨进程**一行不改**——
 * 这正是 KernelPort 这层抽象存在的全部理由（PLAN 裁定 B）。
 *
 * ## 本文件解决的三个真问题
 *
 *  1. **早到信号不丢**。内核子进程在窗口加载前就已派生并握手（main/index.ts 刻意
 *     先 connect 再建窗，让握手与窗口加载并行）。此时没有客户端，信号进 buffer；
 *     首次 attach 时回放。status 与 ready 另有 sticky 槽——它们是**状态**而非事件，
 *     迟到订阅者需要的是最新值，不是历史序列（renderer reload 就走这条路：
 *     buffer 已空，只有 sticky 能把它救回来）。
 *  2. **未应答的 server-request 不因 reload 而悬死**。权限请求若在被裁决前界面重载，
 *     内核会一直等。故 outstanding 单独记账，每次 attach 都重投；respond/cancel/
 *     连接断开时清除。
 *  3. **不重复投递**。同一条信号对同一订阅者只投一次：buffer 里的 status/ready 被
 *     sticky 顶替，buffer 与 outstanding 里的同一 server-request 按 id 去重，
 *     已应答的 id 不再重投（answered 集）。重复投递的表现是审批卡出现两张，
 *     点一张另一张变僵尸——比丢帧更难查。
 *
 * ## 为什么不是「main 直接持有 store」
 *
 * 那样 renderer 就只剩绘制，跨窗口共享状态看似省事，但：① 每个窗口的 UI 局部态
 * （输入框草稿、滚动位置、折叠态）本来就不该进 main；② store 在 renderer 才能被
 * React 同步订阅（useSyncExternalStore），跨 IPC 的 store 订阅必然引入一帧延迟与
 * 序列化成本；③ 投影层是纯函数，在哪个进程跑都一样，跑在 renderer 让回放门
 * （test/projection*.test.ts）不需要 Electron 就能验证。
 */
import { warn } from "../lib/log.ts";
import type { KernelPort, KernelSignal, RpcId } from "../../renderer/core/kernel-port.ts";

/** 无客户端期间的信号缓冲上限。溢出丢最旧并计数——内存不得无上界。 */
const MAX_BUFFERED = 20_000;
/** answered 集上限；超出即清空（它只是防重投的保险，不是账本）。 */
const MAX_ANSWERED = 5_000;

export type SignalSink = (sig: KernelSignal) => void;

export type AttachedClient = {
  /** 本次 attach 回放的信号条数（诊断用；renderer 会打印它）。 */
  replayed: number;
  detach: () => void;
};

export type BridgeStats = {
  clients: number;
  buffered: number;
  /** 因缓冲溢出被丢弃的信号数。>0 就是界面丢过事件，必须可见。 */
  dropped: number;
  outstanding: number;
};

export type KernelBridge = {
  attach: (sink: SignalSink) => AttachedClient;
  request: (method: string, params?: unknown) => Promise<unknown>;
  extRequest: (method: string, params?: unknown) => Promise<unknown>;
  notify: (method: string, params?: unknown) => void;
  respond: (id: RpcId, result: unknown) => void;
  cancel: (sessionId: string, meta?: Record<string, unknown>) => void;
  isReady: () => boolean;
  stats: () => BridgeStats;
  /** 断开对上游 port 的订阅（应用退出时）。 */
  dispose: () => void;
};

function sessionIdOf(sig: KernelSignal): string | null {
  if (sig.kind !== "server-request") return null;
  const v = sig.params["sessionId"];
  return typeof v === "string" ? v : null;
}

export function createKernelBridge(port: KernelPort): KernelBridge {
  const clients = new Set<SignalSink>();
  let stickyStatus: KernelSignal | null = null;
  let stickyReady: KernelSignal | null = null;
  let buffer: KernelSignal[] = [];
  let dropped = 0;
  /** 已发出但未被应答的 server-request（id → 原信号），供重投。 */
  const outstanding = new Map<RpcId, KernelSignal>();
  /** 已应答的 id，防重投。 */
  const answered = new Set<RpcId>();

  const dispose = port.subscribe((sig) => {
    switch (sig.kind) {
      case "status":
        stickyStatus = sig;
        if (!sig.connected) {
          // 连接断了 ⇒ 内核侧 serverRequests 已被清空，这些 id 全部作废。
          // 留着的话 reload 后会重投一批僵尸审批卡，点了也没反应。
          outstanding.clear();
          answered.clear();
          // 缓冲里躺着的那些 server-request 同样作废：outstanding 清了还不够，
          // attach 时仍会从 buffer 回放它们（本条由 ipc-bridge 门当场抓到）。
          // 通知**不**清——断连前的事件是真实历史，界面该照旧显示；
          // 重连后内核会用持久轨重放，去重高水位负责不重复。
          buffer = buffer.filter((s) => s.kind !== "server-request");
        }
        break;
      case "ready":
        stickyReady = sig;
        break;
      case "server-request":
        outstanding.set(sig.id, sig);
        break;
      case "notification":
      case "malformed":
        break;
    }

    if (clients.size > 0) {
      for (const sink of [...clients]) sink(sig);
      return;
    }
    if (buffer.length >= MAX_BUFFERED) {
      buffer.shift();
      dropped++;
      if (dropped === 1 || dropped % 1_000 === 0) {
        warn("ipc bridge buffer overflow; dropped=" + String(dropped));
      }
    }
    buffer.push(sig);
  });

  function attach(sink: SignalSink): AttachedClient {
    const queued: KernelSignal[] = [];
    // sticky 先行：status 与 ready 是状态，迟到者要的是最新值
    if (stickyStatus !== null) queued.push(stickyStatus);
    if (stickyReady !== null) queued.push(stickyReady);

    const seen = new Set<RpcId>();
    for (const sig of buffer) {
      // 这两类由 sticky 顶替：回放历史值会把「已断连」误报成「还活着」
      if (sig.kind === "status" || sig.kind === "ready") continue;
      if (sig.kind === "server-request") {
        if (answered.has(sig.id)) continue;
        seen.add(sig.id);
      }
      queued.push(sig);
    }
    // buffer 里没有、但仍挂着的请求（例如上一次 attach 之后被应答前的空窗）
    for (const [id, sig] of outstanding) {
      if (seen.has(id) || answered.has(id)) continue;
      queued.push(sig);
    }

    clients.add(sink);
    buffer = [];
    for (const sig of queued) sink(sig);
    return {
      replayed: queued.length,
      detach: () => {
        clients.delete(sink);
      },
    };
  }

  function markAnswered(id: RpcId): void {
    outstanding.delete(id);
    if (answered.size >= MAX_ANSWERED) answered.clear();
    answered.add(id);
  }

  return {
    attach,
    request: (method, params) => port.request(method, params),
    extRequest: (method, params) => port.extRequest(method, params),
    notify: (method, params) => {
      port.notify(method, params);
    },
    respond: (id, result) => {
      markAnswered(id);
      port.respond(id, result);
    },
    cancel: (sessionId, meta) => {
      // port.cancel 内部会把该会话所有挂起权限请求应答 cancelled
      // （connection.ts 的既定语义），这里的记账必须跟上，否则会重投僵尸卡。
      for (const [id, sig] of [...outstanding]) {
        if (sessionIdOf(sig) === sessionId) markAnswered(id);
      }
      port.cancel(sessionId, meta);
    },
    isReady: () => port.isReady(),
    stats: () => ({
      clients: clients.size,
      buffered: buffer.length,
      dropped,
      outstanding: outstanding.size,
    }),
    dispose: () => {
      dispose();
      clients.clear();
      buffer = [];
    },
  };
}
