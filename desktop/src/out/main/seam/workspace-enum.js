// nofy workspace enumeration — A1 Track A（单例之上的纯函数）
//
// PORTING-PLAN §阶段 A：原 workspace-registry 自建第二条 ACP 连接（违 §2.3
// 单客户端中继约束，可能抢走事件流）已收编——枚举逻辑整体保留为对
// NofyKernelClient 单例的纯函数（主路 ACP + dir-scan 回退 + 标题回退链）。
//
// 枚举来源（优先 ACP，已实测）：
//   ACP ext `_nofy/session_summaries/workspace_list`
//   → { all_sessions: { <cwd>: [Summary, ...] } }（nofy-shell
//     agent/handlers/session.rs handle_session_summaries；ExtRequest 路由＝
//     JSON-RPC method 前缀 '_' 剥离，故线上方法名带 '_' 前缀，§2.2）。
//   Summary 关键字段：info.id / info.cwd / generated_title / session_summary /
//   created_at / updated_at / last_active_at。
// 回退：扫 ~/.nofy/sessions/ 目录名（URL-decode）作为已知 workspace 列表
//   （此时 sessions 为空，renderer 展开时懒加载）。
// 标题回退链：generated_title || session_summary || 首条用户消息（chat_history.jsonl
//   <user_query> 提取，截断）|| sessionId 前 8 位。

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { firstUserQueryTitle } from "./session-title.js"; // WS-ENUM：首条用户消息标题回退

export const SESSIONS_ROOT = path.join(os.homedir(), ".nofy", "sessions");
export const CACHE_TTL_MS = 20_000; // WS-ENUM：枚举缓存（避免频繁 ACP 往返）
// FIX-WS：dir-scan 回退结果的负缓存要短——ACP 恢复后应尽快回到主路
// （否则 3400+ 个 ~/.nofy/sessions 目录（含大量 /tmp 测试残留）会灌进侧栏）。
export const DIR_SCAN_CACHE_TTL_MS = 3_000;
export const DIR_SCAN_MAX_ROWS = 200; // FIX-WS：回退路上限（按目录 mtime 新→旧）
export const ACP_TIMEOUT_MS = 5_000;

export function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} timeout (${ms}ms)`)), ms)),
  ]);
}

export function isoToMs(v) {
  const t = Date.parse(typeof v === "string" ? v : "");
  return Number.isFinite(t) ? t : 0;
}

export function summaryToEntry(cwd, s) {
  const sessionId = String(s?.info?.id ?? "");
  const title =
    (typeof s?.generated_title === "string" && s.generated_title.trim()) ||
    (typeof s?.session_summary === "string" && s.session_summary.trim()) ||
    firstUserQueryTitle(cwd, sessionId) ||
    sessionId.slice(0, 8);
  return {
    sessionId,
    title,
    updatedAt: isoToMs(s?.updated_at) || isoToMs(s?.last_active_at) || Date.now(),
    createdAt: isoToMs(s?.created_at) || Date.now(),
  };
}

/* ───────────────────────── ACP 枚举（主路） ───────────────────────── */

// WS-ENUM：ACP workspace_list → [{ path, sessions: [...] }]（经单例，无第二条 WS）
export async function enumerateWorkspacesViaAcp(client) {
  await withTimeout(client.ready(), ACP_TIMEOUT_MS, "acp ready");
  const result = await withTimeout(
    client.ext("nofy/session_summaries/workspace_list", {}),
    ACP_TIMEOUT_MS,
    "workspace_list",
  );
  const all = result?.all_sessions ?? {};
  const workspaces = [];
  for (const [cwd, summaries] of Object.entries(all)) {
    if (!Array.isArray(summaries)) continue;
    const sessions = summaries
      .map((s) => summaryToEntry(cwd, s))
      .filter((s) => s.sessionId)
      .sort((a, b) => b.updatedAt - a.updatedAt);
    workspaces.push({ path: cwd, sessions });
  }
  workspaces.sort((a, b) => {
    const at = a.sessions[0]?.updatedAt ?? 0;
    const bt = b.sessions[0]?.updatedAt ?? 0;
    return bt - at;
  });
  return workspaces;
}

/* ───────────────────────── 目录扫描（回退路） ───────────────────────── */

// WS-ENUM：~/.nofy/sessions/ 目录名＝URL-encode 的 cwd；decode 即已知 workspace。
// FIX-WS：按目录 mtime 新→旧排序并截断 DIR_SCAN_MAX_ROWS（防 /tmp 测试残留灌满侧栏）。
export function enumerateWorkspacesViaDirScan() {
  const workspaces = [];
  for (const name of fs.readdirSync(SESSIONS_ROOT)) {
    let decoded;
    try {
      decoded = decodeURIComponent(name);
    } catch {
      decoded = name;
    }
    if (!decoded.startsWith("/")) continue;
    let mtime = 0;
    try {
      mtime = fs.statSync(path.join(SESSIONS_ROOT, name)).mtimeMs;
    } catch {}
    workspaces.push({ path: decoded, sessions: [], mtime });
  }
  workspaces.sort((a, b) => b.mtime - a.mtime);
  return workspaces.slice(0, DIR_SCAN_MAX_ROWS).map(({ mtime, ...w }) => w);
}

/* ───────────────────────── 缓存 + 绑定工厂 ───────────────────────── */

/**
 * 绑定一个内核客户端（单例），返回带缓存的枚举接口
 * { listKnownWorkspaces, listWorkspaceSessions }。
 */
export function createWorkspaceEnumeration(client) {
  let cache = null; // { at, source, workspaces }

  async function listKnownWorkspaces({ refresh = false } = {}) {
    if (!refresh && cache) {
      // FIX-WS：ACP 成功结果按正常 TTL；dir-scan 回退按短负缓存（尽快重试 ACP 主路）
      const ttl = cache.source === "acp" ? CACHE_TTL_MS : DIR_SCAN_CACHE_TTL_MS;
      if (Date.now() - cache.at < ttl) return cache;
    }
    let workspaces = [];
    let source = "acp";
    try {
      workspaces = await enumerateWorkspacesViaAcp(client);
      if (!workspaces.length) throw new Error("empty workspace_list");
    } catch (e) {
      console.log("[nofy-ws-enum] ACP enumeration failed, falling back to dir scan:", e?.message);
      source = "dir-scan";
      try {
        workspaces = enumerateWorkspacesViaDirScan();
      } catch (scanErr) {
        console.log("[nofy-ws-enum] dir scan failed:", scanErr?.message);
        workspaces = [];
      }
    }
    cache = { at: Date.now(), source, workspaces };
    console.log(`[nofy-ws-enum] enumerated ${workspaces.length} workspaces via ${source}`);
    return cache;
  }

  // WS-ENUM：单 workspace 会话（懒加载用；scan 回退场景下按需补拉）
  async function listWorkspaceSessions(workspacePath) {
    const snap = await listKnownWorkspaces({});
    const hit = snap.workspaces.find((w) => w.path === workspacePath);
    if (hit && hit.sessions.length) return { workspacePath, sessions: hit.sessions, source: snap.source };
    // 缓存里是 scan 形态（无 sessions）：强制刷新一次 ACP 再取
    const fresh = await listKnownWorkspaces({ refresh: true });
    const freshHit = fresh.workspaces.find((w) => w.path === workspacePath);
    return {
      workspacePath,
      sessions: freshHit?.sessions ?? [],
      source: fresh.source,
    };
  }

  return { listKnownWorkspaces, listWorkspaceSessions };
}

export default { createWorkspaceEnumeration, enumerateWorkspacesViaAcp, enumerateWorkspacesViaDirScan };
