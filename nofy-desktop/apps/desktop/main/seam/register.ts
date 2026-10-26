import { readRaster, watchWorkspace } from "./workspace-files.ts";
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
import { BrowserWindow, clipboard, dialog, ipcMain, powerSaveBlocker, session, shell } from "electron";
import type { IpcMainInvokeEvent, WebContents } from "electron";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { copyFilePath, openWorkspacePath } from "./file-host.ts";
import { basename } from "node:path";
import { IPC } from "../../preload/contract.ts";
import type {
  BootstrapInfo,
  DesktopHostSettings,
  KernelSignal,
  PickedFile,
  SubscribeResult,
} from "../../preload/contract.ts";
import type { KernelBridge } from "./bridge.ts";
import { exportFileName, validateDirectory, writeExport } from "./native-files.ts";
import { UserBrowserHost } from "./user-browser.ts";
import type { ModelConfigAccess, ModelConfigPatch } from "../../preload/model-config-contract.ts";

export type RegisterOptions = {
  bridge: KernelBridge;
  bootstrap: () => BootstrapInfo;
  models?: ModelConfigAccess;
  configurationBusy?: () => boolean;
};

type Attachment = { detach: () => void; offDestroyed: () => void };

let awakeBlocker: number | null = null;

function hostText(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (trimmed.length > max || /[\r\n\0]/.test(trimmed)) return "";
  return trimmed;
}

async function applyDesktopHost(value: unknown): Promise<void> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw new TypeError("desktop host settings must be an object");
  const row = value as Partial<DesktopHostSettings>;
  const keepAwake = row.keepAwake === true;
  if (keepAwake && (awakeBlocker === null || !powerSaveBlocker.isStarted(awakeBlocker))) awakeBlocker = powerSaveBlocker.start("prevent-app-suspension");
  if (!keepAwake && awakeBlocker !== null && powerSaveBlocker.isStarted(awakeBlocker)) {
    powerSaveBlocker.stop(awakeBlocker);
    awakeBlocker = null;
  }
  const httpProxy = hostText(row.httpProxy, 300);
  const noProxy = hostText(row.noProxy, 500);
  if (httpProxy === "") await session.defaultSession.setProxy({ mode: "system" });
  else await session.defaultSession.setProxy({ proxyRules: httpProxy, proxyBypassRules: noProxy });
}

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
  const browsers = new UserBrowserHost();
  const watching = new Map<WebContents, { id: string; generation: number; close?: () => void }>();
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
    [IPC.readRaster, (_e, root, path) => readRaster(root as string,path as string)],
    [IPC.watchFiles, async (e, input) => {
      const request = input as import("../../shared/workspace-files-contract.ts").WorkspaceWatch;
      const previous = watching.get(e.sender); previous?.close?.();
      const state = { id: request?.id, generation: (previous?.generation ?? 0) + 1, close: undefined as (() => void) | undefined };
      watching.set(e.sender,state);
      try {
        const close = await watchWorkspace(request, change => { if (!e.sender.isDestroyed() && watching.get(e.sender) === state) e.sender.send(IPC.filesChanged,change); });
        if (e.sender.isDestroyed() || watching.get(e.sender) !== state) close(); else { const destroyed = () => { if (watching.get(e.sender) === state) { close(); watching.delete(e.sender); } }; state.close = () => { close(); e.sender.off("destroyed",destroyed); }; e.sender.once("destroyed",destroyed); }
        return { ok: true };
      } catch (cause) { if (watching.get(e.sender) === state) watching.delete(e.sender); return { ok: false, error: cause instanceof Error ? cause.message : String(cause) }; }
    }],
    [IPC.unwatchFiles, (e, id) => { const state = watching.get(e.sender); if (state && state.id === id) { state.close?.(); watching.delete(e.sender); } }],
    [IPC.bootstrap, () => opts.bootstrap()],
    [IPC.readModelConfig, () => {
      if (!opts.models) throw new Error("模型配置入口不可用");
      return opts.models.readModelConfig();
    }],
    [IPC.updateModelConfig, (_e, patch) => {
      if (!opts.models) throw new Error("模型配置入口不可用");
      return opts.models.updateModelConfig(patch as ModelConfigPatch);
    }],
    [IPC.pickDirectory, async (e): Promise<string | null> => {
      const win = BrowserWindow.fromWebContents(e.sender) ?? undefined;
      const options = { properties: ["openDirectory"] as ("openDirectory")[] };
      const result = win === undefined ? await dialog.showOpenDialog(options) : await dialog.showOpenDialog(win, options);
      if (result.canceled || !result.filePaths[0]) return null;
      return validateDirectory(result.filePaths[0]);
    }],
    [IPC.validateDirectory, async (_e, path) => {
      if (typeof path !== "string") throw new TypeError("工作区路径必须是字符串");
      try { return await validateDirectory(path); }
      catch { throw new Error("工作区不存在或不可访问：" + path + "。请通过添加项目选择有效目录；原会话历史仍保留。"); }
    }],
    [IPC.saveText, async (e, content, filename): Promise<boolean> => {
      if (typeof content !== "string" || content.length > 10_000_000) throw new TypeError("导出文本过大或格式无效");
      const win = BrowserWindow.fromWebContents(e.sender) ?? undefined;
      const options = { defaultPath: exportFileName(filename), filters: [{ name: "Markdown", extensions: ["md"] }] };
      const result = win === undefined ? await dialog.showSaveDialog(options) : await dialog.showSaveDialog(win, options);
      if (result.canceled || !result.filePath) return false;
      await writeExport(result.filePath, content);
      return true;
    }],
    [IPC.copyFilePath, (_e, value) => copyFilePath(value, { copy: text => clipboard.writeText(text) })],
    [IPC.openWorkspacePath, (e, path, kind) => openWorkspacePath(path, kind, {
      platform: process.platform,
      copy: text => clipboard.writeText(text),
      openDefault: target => shell.openPath(target),
      reveal: target => shell.showItemInFolder(target),
      chooseApplication: async () => {
        const win = BrowserWindow.fromWebContents(e.sender) ?? undefined;
        const options = { title: "选择打开文件的应用", defaultPath: "/Applications", properties: ["openFile"] as ("openFile")[], filters: [{ name: "Applications", extensions: ["app"] }] };
        const result = win ? await dialog.showOpenDialog(win, options) : await dialog.showOpenDialog(options);
        return result.canceled ? null : result.filePaths[0] ?? null;
      },
      openApplication: async (application, target) => { await promisify(execFile)("/usr/bin/open", ["-a", application, "--", target], { timeout: 15000 }); },
    })],
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
      (_e, sessionId, meta) => {
        if (meta !== undefined && (meta === null || typeof meta !== "object" || Array.isArray(meta))) throw new TypeError("cancel metadata must be an object");
        bridge.cancel(asMethod(sessionId), meta as Record<string, unknown> | undefined);
      },
    ],
    [IPC.browserNavigate, (e, url) => browsers.navigate(e.sender, url)],
    [IPC.browserCommand, (e, command) => browsers.command(e.sender, command)],
    [IPC.browserSetBounds, (e, bounds) => browsers.setBounds(e.sender, bounds)],
    [IPC.browserOpenExternal, (_e, url) => browsers.openExternal(url)],
    [IPC.browserHost, (e, request) => browsers.act(e.sender, request)],
    [IPC.desktopHost, (_e, settings) => applyDesktopHost(settings)],
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

  const readable = new Set<string>([IPC.subscribe, IPC.bootstrap, IPC.isReady, IPC.readModelConfig, IPC.pickFiles, IPC.pickDirectory, IPC.validateDirectory, IPC.saveText, IPC.copyFilePath, IPC.openWorkspacePath, IPC.readRaster, IPC.watchFiles, IPC.unwatchFiles, IPC.browserNavigate, IPC.browserCommand, IPC.browserSetBounds, IPC.browserOpenExternal, IPC.browserHost, IPC.desktopHost]);
  for (const [channel, fn] of handlers) ipcMain.handle(channel, (e, ...args: unknown[]) => {
    if (opts.configurationBusy?.() && !readable.has(channel)) throw new Error("模型配置正在保存，请稍后重试");
    return fn(e, ...args);
  });
  return () => {
    browsers.disposeAll();
    for (const state of watching.values()) state.close?.(); watching.clear();
    for (const [channel] of handlers) ipcMain.removeHandler(channel);
  };
}
