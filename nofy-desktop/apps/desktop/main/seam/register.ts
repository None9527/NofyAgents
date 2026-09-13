/**
 * ipcMain 侧接线 —— 把 KernelBridge 暴露成 preload/contract.ts 里那套通道。
 *
 * 本文件是**唯一**允许同时认识 electron 与 KernelBridge 的地方：
 * bridge.ts 不知道 electron（因此可在 node 下被测试驱动），
 * main/index.ts 不知道通道名（因此加通道不必改窗口逻辑）。
 *
 * ## 订阅握手为什么由 renderer 发起
 *
 * 若在 dom-ready 时就 attach 并回放，那些 wc.send 会发生在 renderer 注册
 * ipcRenderer.on 之前 ⇒ **全部丢失**，而且丢得无声无息。
 * 故 attach 由 renderer 显式 invoke(subscribe) 触发：调用返回时，回放已经完成。
 * （preload 侧另有一层早到暂存，双保险，见 preload/index.ts。）
 *
 * ## 参数校验
 *
 * 每个 handler 都校验参数类型并**抛错**（invoke 的 rejection 会回到 renderer）。
 * 宽松吞掉的后果是把一个 UI bug 变成一条发给内核的畸形帧，
 * 而内核对畸形帧的反应是 Invalid params —— 归因链条会长到查不动。
 */
import { BrowserWindow, dialog, ipcMain } from "electron";
import type { IpcMainInvokeEvent, WebContents } from "electron";
import { basename } from "node:path";
import { IPC } from "../../preload/contract.ts";
import type {
  BootstrapInfo,
  KernelSignal,
  PickedFile,
  SubscribeResult,
} from "../../preload/contract.ts";
import type { KernelBridge } from "./bridge.ts";

export type RegisterOptions = {
  bridge: KernelBridge;
  bootstrap: () => BootstrapInfo;
};

type Attachment = { detach: () => void; offDestroyed: () => void };

function asMethod(v: unknown): string {
  if (typeof v !== "string" || v.length === 0) {
    throw new TypeError("method must be a non-empty string, got " + typeof v);
  }
  return v;
}

function asId(v: unknown): number | string {
  if (typeof v === "number" || typeof v === "string") return v;
  throw new TypeError("id must be number|string, got " + typeof v);
}

export function registerKernelIpc(opts: RegisterOptions): () => void {
  const { bridge } = opts;
  const attached = new WeakMap<WebContents, Attachment>();

  const subscribe = (e: IpcMainInvokeEvent): SubscribeResult => {
    const wc = e.sender;
    // 同一 webContents 重复 subscribe（reload / 二次挂载）：先撤旧的，
    // 否则 destroyed 监听会累积，且同一 sink 会收到两份信号。
    const prev = attached.get(wc);
    if (prev !== undefined) {
      prev.detach();
      prev.offDestroyed();
    }
    const sink = (sig: KernelSignal): void => {
      if (wc.isDestroyed()) return;
      wc.send(IPC.signal, sig);
    };
    const client = bridge.attach(sink);
    const onDestroyed = (): void => {
      client.detach();
      attached.delete(wc);
    };
    wc.once("destroyed", onDestroyed);
    attached.set(wc, { detach: client.detach, offDestroyed: () => wc.off("destroyed", onDestroyed) });
    return { replayed: client.replayed, clients: bridge.stats().clients };
  };

  const handlers: Array<[string, (e: IpcMainInvokeEvent, ...args: unknown[]) => unknown]> = [
    [IPC.subscribe, subscribe],
    [IPC.bootstrap, () => opts.bootstrap()],
    [IPC.isReady, () => bridge.isReady()],
    [IPC.request, (_e, method, params) => bridge.request(asMethod(method), params)],
    [IPC.extRequest, (_e, method, params) => bridge.extRequest(asMethod(method), params)],
    [
      IPC.notify,
      (_e, method, params) => {
        bridge.notify(asMethod(method), params);
      },
    ],
    [
      IPC.respond,
      (_e, id, result) => {
        bridge.respond(asId(id), result);
      },
    ],
    [
      IPC.cancel,
      (_e, sessionId) => {
        bridge.cancel(asMethod(sessionId));
      },
    ],
    [
      // 宿主能力（不经内核）：系统选文件框。父窗口取发送者所属窗口，
      // 对话框模态于它；取消照实回空数组，renderer 侧不报错不抱怨。
      IPC.pickFiles,
      async (e): Promise<PickedFile[]> => {
        const win = BrowserWindow.fromWebContents(e.sender) ?? undefined;
        // showOpenDialog 两个重载：带窗＝模态于该窗；无窗（理论上不会）退非模态。
        const opts = { properties: ["openFile", "multiSelections"] as ("openFile" | "multiSelections")[] };
        const res = win === undefined ? await dialog.showOpenDialog(opts) : await dialog.showOpenDialog(win, opts);
        if (res.canceled) return [];
        return res.filePaths.map((p) => ({ path: p, name: basename(p) }));
      },
    ],
  ];

  for (const [channel, fn] of handlers) ipcMain.handle(channel, fn);
  return () => {
    for (const [channel] of handlers) ipcMain.removeHandler(channel);
  };
}
