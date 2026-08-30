// nofy workspace registry — A1 Track A（单例 IPC 层）
//
// PORTING-PLAN §阶段 A（A2 收编）：本模块原先自建第二条 ACP 连接
// （clientName=nofy-desktop-ws-enum）做 workspace/session 枚举，违反 §2.3
// 单客户端中继约束（第二条并发连接会抢走事件流）。现改为复用 main 的
// NofyKernelClient 单例——全进程对内核只剩一条 WS；枚举逻辑（ACP 主路 +
// dir-scan 回退 + 标题回退链）原样保留在 workspace-enum.js 的纯函数里。
// 经既有 preload IPC 桥（window.zcode）暴露给 renderer：
//   zcode:nofy-list-workspaces / zcode:nofy-workspace-sessions（通道名/形状不变）。

import { ipcMain } from "electron";
import { ensureNofyKernelClient } from "./nofy-kernel-client.js";
import { createWorkspaceEnumeration } from "./workspace-enum.js";

function log(...args) {
  console.log("[nofy-ws-enum]", ...args);
}

let enumPromise = null;
function enumeration() {
  enumPromise ??= (async () => {
    const client = await ensureNofyKernelClient(); // 单例：发现-否则-启动 + 唯一 WS
    return createWorkspaceEnumeration(client);
  })().catch((e) => {
    enumPromise = null; // 失败不钉死：下次调用重试
    throw e;
  });
  return enumPromise;
}

export async function listKnownWorkspaces(opts) {
  return (await enumeration()).listKnownWorkspaces(opts);
}

export async function listWorkspaceSessions(workspacePath) {
  return (await enumeration()).listWorkspaceSessions(workspacePath);
}

/* ───────────────────────── IPC 注册（既有 window.zcode 桥） ───────────────────────── */

export const IPC_LIST_WORKSPACES = "zcode:nofy-list-workspaces"; // WS-ENUM
export const IPC_WORKSPACE_SESSIONS = "zcode:nofy-workspace-sessions"; // WS-ENUM

let registered = false;
export function registerWorkspaceRegistry() {
  if (registered) return;
  registered = true;
  // FIX-WS：注册即预连（不等首次 renderer 调用）——首调时握手已完成，
  // 避免启动期主进程事件循环拥塞把 5s ready 预算吃光导致回退 dir-scan。
  // A1-A：预连走单例（ensureKernel + connect + initialize 一次），不再另开 WS。
  void ensureNofyKernelClient().catch((e) => log("eager kernel client failed:", e?.message));
  ipcMain.handle(IPC_LIST_WORKSPACES, async (_event, arg) => {
    try {
      const snap = await listKnownWorkspaces({ refresh: !!arg?.refresh });
      return { ok: true, source: snap.source, at: snap.at, workspaces: snap.workspaces };
    } catch (e) {
      return { ok: false, error: String(e?.message ?? e), workspaces: [] };
    }
  });
  ipcMain.handle(IPC_WORKSPACE_SESSIONS, async (_event, arg) => {
    try {
      const workspacePath = String(arg?.workspacePath ?? "");
      if (!workspacePath) return { ok: false, error: "workspacePath required", sessions: [] };
      const r = await listWorkspaceSessions(workspacePath);
      return { ok: true, ...r };
    } catch (e) {
      return { ok: false, error: String(e?.message ?? e), sessions: [] };
    }
  });
  log("ipc registered:", IPC_LIST_WORKSPACES, IPC_WORKSPACE_SESSIONS);
}

export default { listKnownWorkspaces, listWorkspaceSessions, registerWorkspaceRegistry };
