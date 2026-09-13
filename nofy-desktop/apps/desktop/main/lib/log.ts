/**
 * 日志——**只走 stderr**。
 *
 * 陷阱 T2（PLAN.md §2.3）：内核子进程的 stdout 就是 ACP 协议线路，任何写入都会被
 * 帧解析器当成协议帧。旧路 D9 实测后果：
 *   "protocol_parse_error: Unexpected token 'o', \"[nofy-superv\"… is not valid JSON"
 * ⇒ 传输被关闭、整个会话面 EPIPE 闸死。
 *
 * 本项目自身不占用 stdout 作线路（我们是父进程），但同一条纪律适用于任何可能被
 * 内核或工具链继承 stdout 的进程，故统一收口在此。
 */

const PREFIX = "[nofy-desktop]";

export function log(...args: unknown[]): void {
  console.error(PREFIX, ...args);
}

export function warn(...args: unknown[]): void {
  console.error(PREFIX + "[warn]", ...args);
}

export function fail(...args: unknown[]): void {
  console.error(PREFIX + "[error]", ...args);
}

