// host 自有内核连接 — P1a（桌面拓扑：连接归 host 进程）
//
// 背景与裁定（FRONTEND-FIRST-PRINCIPLES.md §5-K）：
//   - main→host 的 utilityProcess 帧投递在真应用里实测不可达（裸帧 / MessageChannel /
//     处理函数内回包，六+二次对照实验均零收帧），故「main 持连接、host 经桥消费」的
//     §3 原形状在当前 Electron 接线下不成立。
//   - 阶段 B 的会话流本就落在 host（renderer 的 ChannelServer 契约终止于 host），
//     故内核连接改由 **host 自有**：每 host 进程派生一个 `nofy agent stdio` 私有子进程，
//     直连直读，无桥、无端口、无 secret。
//   - 传输复用 main seam 的 NofyKernelClient（传输抽象后与进程位置无关）。
//
// 多窗口（K1 登记）：每窗口一个 host ⇒ 每窗口一个内核子进程，语义等同两个 TUI 实例；
// 会话存储按 (cwd, sid) 目录隔离，不同会话并发安全，同会话两端同时活跃未定义
// （PORTING-PLAN §6.7）。跨窗口共享单内核留待后续（候选：fd 传递的 socketpair）。

import { NofyKernelClient } from "../../main/seam/nofy-kernel-client.js";
import { spawnStdioChild } from "../../main/seam/kernel-supervisor.js";

let client = null;
let inflight = null;

/** 当前 host 进程的内核客户端（未建立时为 null）。 */
export function getHostKernelClient() {
  return client;
}

/**
 * 建立（惰性、单飞）本 host 进程到其私有内核子进程的连接；
 * initialize 完成后返回客户端。子进程意外退出由客户端自动重派生。
 */
export async function ensureHostKernelClient() {
  if (client?.initialized && client.isOpen()) return client;
  inflight ??= (async () => {
    const c = new NofyKernelClient();
    c.stdioFactory = spawnStdioChild;
    const child = await spawnStdioChild();
    c.attachStdioChild(child);
    await c.ready();
    client = c;
    return c;
  })().finally(() => {
    inflight = null;
  });
  return inflight;
}

export default { ensureHostKernelClient, getHostKernelClient };
