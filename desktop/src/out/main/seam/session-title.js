// nofy session title fallback — D5c WS-ENUM（共享：workspace-registry / acp-agent-adapter）
// 标题回退链末环：首条真实用户消息（~/.nofy/sessions/<encode(cwd)>/<sid>/chat_history.jsonl
// 中首个含 <user_query> 的 user 条目；纯包装帧 user_info/system-reminder 跳过），截断 80 字。

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const SESSIONS_ROOT = path.join(os.homedir(), ".nofy", "sessions");
const TITLE_FALLBACK_MAX = 80;

export function truncateTitle(text) {
  const t = String(text ?? "").trim();
  return t.length > TITLE_FALLBACK_MAX ? `${t.slice(0, TITLE_FALLBACK_MAX)}…` : t;
}

export function firstUserQueryTitle(cwd, sessionId) {
  if (!cwd || !sessionId) return "";
  try {
    const file = path.join(SESSIONS_ROOT, encodeURIComponent(cwd), sessionId, "chat_history.jsonl");
    const fd = fs.openSync(file, "r");
    const bufSize = 512 * 1024; // 只读头部，避免大会话全量读
    const buf = Buffer.alloc(bufSize);
    const bytesRead = fs.readSync(fd, buf, 0, bufSize, 0);
    fs.closeSync(fd);
    const lines = buf.subarray(0, bytesRead).toString("utf8").split("\n");
    for (const line of lines) {
      if (!line.trim()) continue;
      let entry;
      try {
        entry = JSON.parse(line);
      } catch {
        continue;
      }
      if (entry?.type !== "user") continue;
      const content = entry.content;
      let raw = "";
      if (typeof content === "string") raw = content;
      else if (Array.isArray(content)) {
        raw = content
          .filter((b) => b && b.type === "text" && typeof b.text === "string")
          .map((b) => b.text)
          .join("");
      }
      const m = raw.match(/<user_query>\s*([\s\S]*?)\s*<\/user_query>/u);
      const query = (m ? m[1] : raw).trim();
      if (!query || /^(<[a-z_-]+>[\s\S]*<\/[a-z_-]+>)$/u.test(query)) continue;
      return truncateTitle(query.replace(/\s+/gu, " "));
    }
  } catch {
    /* 无历史文件：回退链继续 */
  }
  return "";
}

export default { firstUserQueryTitle, truncateTitle };
