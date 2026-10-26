/**
 * preload —— 把 IPC 通道封成 window.nofy（NofyBridge）。
 *
 * 安全形状：contextIsolation:true、nodeIntegration:false、sandbox:false。
 * sandbox 关掉只是**为了 ESM preload（.mjs）能加载**，不等于给 renderer node 能力：
 * renderer 能拿到的只有本文件显式放进 bridge 的方法，没有 require、没有 process、
 * 没有 ipcRenderer。任何「再加一个通用 invoke 口子」的提案都等于把这条边界拆了。
 *
 * ## 早到暂存（第二层）
 *
 * main 在收到 invoke(subscribe) 后立即回放 sticky/buffer，那些 wc.send 有可能
 * 早于 renderer 调用 onSignal。故这里在没有监听者时把信号暂存，
 * 第一个监听者注册时一次性 flush。与 renderer/core/ipc-port.ts 的暂存互为双保险：
 * 两层都独立成立，任何一层的调用顺序变化都不会丢帧。
 */
import { contextBridge, ipcRenderer } from "electron";
import type { IpcRendererEvent } from "electron";
import { BRIDGE_GLOBAL, IPC } from "./contract.ts";
import type { KernelSignal, NofyBridge, RpcId } from "./contract.ts";
import { isBrowserHostEvent, isBrowserHostResult, isUserBrowserState } from "../shared/user-browser-contract.ts";

/** 与 KernelSignal 的判别集合同步。多一个少一个都是契约漂移，此处显式拒绝。 */
const SIGNAL_KINDS: ReadonlySet<string> = new Set(["status", "ready", "notification", "server-request", "malformed"]);
const MAX_EARLY = 5_000;

const listeners = new Set<(sig: KernelSignal) => void>();
const early: KernelSignal[] = [];
let droppedEarly = 0;
let rejected = 0;

function asSignal(v: unknown): KernelSignal | null {
  if (typeof v !== "object" || v === null) return null;
  const kind = (v as { kind?: unknown }).kind;
  if (typeof kind !== "string" || !SIGNAL_KINDS.has(kind)) return null;
  return v as KernelSignal;
}

ipcRenderer.on(IPC.signal, (_e: IpcRendererEvent, payload: unknown) => {
  const sig = asSignal(payload);
  if (sig === null) {
    // 不静默：契约漂移的第一现场。丢弃计数暴露在 window.nofy.diagnostics 里。
    rejected++;
    console.error("[nofy] 入站信号形状不符（契约漂移？）已丢弃，累计 " + String(rejected));
    return;
  }
  if (listeners.size === 0) {
    if (early.length >= MAX_EARLY) {
      early.shift();
      droppedEarly++;
    }
    early.push(sig);
    return;
  }
  for (const fn of [...listeners]) fn(sig);
});

function invoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  return ipcRenderer.invoke(channel, ...args) as Promise<T>;
}

const bridge: NofyBridge = {
  onSignal: (cb) => {
    listeners.add(cb);
    if (early.length > 0) {
      const pending = early.splice(0, early.length);
      for (const sig of pending) cb(sig);
    }
    return () => {
      listeners.delete(cb);
    };
  },
  subscribe: () => invoke(IPC.subscribe),
  request: (method, params) => invoke(IPC.request, method, params),
  extRequest: (method, params) => invoke(IPC.extRequest, method, params),
  notify: async (method, params) => {
    await invoke<void>(IPC.notify, method, params);
  },
  respond: async (id: RpcId, result: unknown) => {
    await invoke<void>(IPC.respond, id, result);
  },
  cancel: async (sessionId, meta) => {
    await invoke<void>(IPC.cancel, sessionId, meta);
  },
  isReady: () => invoke(IPC.isReady),
  bootstrap: () => invoke(IPC.bootstrap),
  pickFiles: () => invoke(IPC.pickFiles),
  applyDesktopHost: (settings) => invoke(IPC.desktopHost, settings),
  pickDirectory: () => invoke(IPC.pickDirectory),
  validateDirectory: path => invoke(IPC.validateDirectory, path),
  saveText: (content, filename) => invoke(IPC.saveText, content, filename),
  copyFilePath: (value) => invoke(IPC.copyFilePath, value),
  openWorkspacePath: (path, kind) => invoke(IPC.openWorkspacePath, path, kind),
  readRaster: (root, path) => invoke(IPC.readRaster, root, path),
  watchFiles: request => invoke(IPC.watchFiles, request),
  unwatchFiles: id => invoke(IPC.unwatchFiles, id),
  onFilesChanged: listener => {
    const receive = (_event: IpcRendererEvent, change: unknown) => {
      if (!change || typeof change !== "object") return;
      const value = change as import("../shared/workspace-files-contract.ts").WorkspaceChange;
      if (typeof value.id === "string" && typeof value.root === "string" && Array.isArray(value.paths) && value.paths.length <= 64 && value.paths.every(path => typeof path === "string")) listener(value);
    };
    ipcRenderer.on(IPC.filesChanged,receive);
    return () => { ipcRenderer.off(IPC.filesChanged,receive); };
  },
  readModelConfig: () => invoke(IPC.readModelConfig),
  updateModelConfig: (patch) => invoke(IPC.updateModelConfig, patch),
  browserNavigate: (url) => invoke(IPC.browserNavigate, url),
  browserCommand: (command) => invoke(IPC.browserCommand, command),
  browserSetBounds: (bounds) => invoke(IPC.browserSetBounds, bounds),
  browserOpenExternal: (url) => invoke(IPC.browserOpenExternal, url),
  browserHost: async (request) => {
    const result: unknown = await invoke(IPC.browserHost, request);
    if (!isBrowserHostResult(result)) throw new Error("browser host");
    return result;
  },
  onBrowserState: (cb) => {
    const receive = (_event: IpcRendererEvent, payload: unknown) => {
      if (isUserBrowserState(payload)) cb(payload);
    };
    ipcRenderer.on(IPC.browserState, receive);
    return () => { ipcRenderer.off(IPC.browserState, receive); };
  },
  onBrowserHostEvent: (cb) => {
    const receive = (_event: IpcRendererEvent, payload: unknown) => {
      if (isBrowserHostEvent(payload)) cb(payload);
    };
    ipcRenderer.on(IPC.browserHostEvent, receive);
    return () => { ipcRenderer.off(IPC.browserHostEvent, receive); };
  },
  diagnostics: () => ({
    listeners: listeners.size,
    early: early.length,
    droppedEarly,
    rejected,
  }),
};

contextBridge.exposeInMainWorld(BRIDGE_GLOBAL, bridge);
