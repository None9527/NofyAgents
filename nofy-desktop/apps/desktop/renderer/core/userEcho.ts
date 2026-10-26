/**
 * 用户回传里哪些字能进对话。
 *
 * 内核把监控结束、任务结束、子智能体结束写成 `<system-reminder>`，
 * 当作下一轮的用户消息喂给模型，并在 chunk `_meta.hideFromScrollback`
 * 上标 true（nofy-shell turn.rs，nofy-pager `user_message_hidden_from_scrollback`）。
 * 定时任务的同一层包装后面才是用户写的正文，正文留下。
 */
export function presentUserEcho(text: string, hideFromScrollback: boolean): { text: string; hidden: boolean } {
  if (hideFromScrollback) return { text, hidden: true };
  const trimmed = text.trim();
  if (trimmed.startsWith("<system-reminder>") || trimmed.startsWith("<system-reminder ")) {
    const endTag = "</system-reminder>";
    const close = trimmed.lastIndexOf(endTag);
    if (close >= 0) {
      const body = trimmed.slice(close + endTag.length).trim();
      if (body.length > 0) return { text: body, hidden: false };
    }
    return { text, hidden: true };
  }
  if (trimmed.startsWith("<monitor-event") || trimmed === "---" || isMonitorDigest(trimmed)) {
    return { text, hidden: true };
  }
  return { text, hidden: false };
}

function isMonitorDigest(text: string): boolean {
  const first = text.split("\n", 1)[0] ?? "";
  return /^[0-9]/.test(first) && first.includes(" monitor events from ") && first.includes(" (use ");
}
