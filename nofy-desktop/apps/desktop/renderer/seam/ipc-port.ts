/**
 * adaptIpcBridge —— KernelPort 的 IPC 实现。
 *
 * 与 adaptConnection（同目录 kernel-port.ts）**同形状**，故 bind / effects / project
 * 跨进程一行不改。这条边界的全部意义就在于此：投影层不知道自己在 Electron 里。
 *
 * 本文件**不碰 DOM、不碰 window**：桥是参数传进来的。
 * 于是它能在 node 下被测试直接驱动（test/ipc-bridge.test.ts 用内存 IPC 对拉），
 * 而不需要 Electron —— 这是「边界可测」的前提。
 *
 * ## isReady 为什么是本地推导
 *
 * KernelPort.isReady 是**同步**的，而跨进程查询必然异步。故这里用入站信号在本地
 * 维护同一个事实：收到 ready 置真，收到 status{connected:false} 置假。
 * 这与 main 侧 conn.isInitialized && conn.isOpen() 是同一状态的两个观察点，
 * 差异只在一个 IPC 往返的延迟内；调用方（effects 层）并不依赖它的实时性。
 *
 * ## 早到暂存（第三层）
 *
 * 握手（bridge.subscribe()）在构造时就发出，而 bindKernel 的订阅发生在构造之后。
 * 若没有这层暂存，握手回放的 sticky ready 会在无人接收时被丢掉，
 * 界面永远停在「连接中」。故：无订阅者时暂存，首个订阅者到来时全量 flush。
 */
import type { NofyBridge } from "../../preload/contract.ts";
import type { KernelPort, KernelSignal, RpcId } from "../core/kernel-port.ts";

const MAX_EARLY = 5_000;

export type IpcPortOptions = {
  /** 早到信号暂存上限；溢出丢最旧（与 main 侧 bridge 的策略一致）。 */
  maxEarly?: number;
};

export function adaptIpcBridge(bridge: NofyBridge, opts: IpcPortOptions = {}): KernelPort {
  const maxEarly = opts.maxEarly ?? MAX_EARLY;
  const subs = new Set<(sig: KernelSignal) => void>();
  const early: KernelSignal[] = [];
  let ready = false;

  const track = (sig: KernelSignal): void => {
    if (sig.kind === "ready") ready = true;
    else if (sig.kind === "status" && !sig.connected) ready = false;
  };

  bridge.onSignal((sig) => {
    track(sig);
    if (subs.size === 0) {
      if (early.length >= maxEarly) early.shift();
      early.push(sig);
      return;
    }
    for (const fn of [...subs]) fn(sig);
  });

  // 握手只发一次：重复 subscribe 会让 main 重投 sticky（幂等但浪费），
  // 更糟的是会让 main 侧 detach 掉正在用的 sink。
  void bridge.subscribe();

  return {
    subscribe: (fn) => {
      subs.add(fn);
      if (early.length > 0) {
        const pending = early.splice(0, early.length);
        for (const sig of pending) {
          for (const sub of [...subs]) sub(sig);
        }
      }
      return () => {
        subs.delete(fn);
      };
    },
    request: (method: string, params?: unknown) => bridge.request(method, params),
    extRequest: (method: string, params?: unknown) => bridge.extRequest(method, params),
    notify: (method: string, params?: unknown) => {
      // KernelPort.notify 是同步签名（与 connection.notify 一致）；
      // IPC 的 promise 在这里刻意不 await —— 通知的语义就是不等回应。
      // 但失败必须可见，否则「发了没生效」会静默。
      bridge.notify(method, params).catch((e: unknown) => {
        console.error("[nofy] notify 失败 " + method + ":", e);
      });
    },
    respond: (id: RpcId, result: unknown) => {
      bridge.respond(id, result).catch((e: unknown) => {
        console.error("[nofy] respond 失败 id=" + String(id) + ":", e);
      });
    },
    cancel: (sessionId: string, meta?: Record<string, unknown>) => {
      bridge.cancel(sessionId, meta).catch((e: unknown) => {
        console.error("[nofy] cancel 失败 " + sessionId + ":", e);
      });
    },
    isReady: () => ready,
  };
}
