/**
 * holdServerRequests —— 把内核→客户端的 server-request **挂住**，等 renderer 裁决。
 *
 * ## 为什么必须有这一层（很容易踩，且踩了不报错）
 *
 * KernelConnection.handleServerRequest 对每一类 server-request 都先查
 * listenerCount(...) === 0，为 0 就**立即自动应答 cancelled / reject**。
 * 那是 node 直跑（smoke、录制脚本）下正确的 fail-safe：没人裁决就别让内核悬挂。
 *
 * 但桌面里真正的裁决者在 renderer，main 只经 "frame" 流转发；于是这些 typed 事件的
 * listenerCount 恒为 0 ⇒ **权限请求会在到达界面之前就被取消**。症状是：内核问了一次
 * 权限、界面什么也没显示、工具调用直接以 cancelled 收尾。没有任何错误日志。
 *
 * 故这里为五类事件各挂一个**不作为**的监听者：唯一职责是把 listenerCount 抬到 ≥ 1，
 * 让请求保持挂起。载荷不从这条路走——"frame" 流是唯一真相源（adaptConnection 已从
 * frame 派生 server-request 信号）。若这里也转发，同一条请求会被推给 renderer 两次，
 * pendingInteractions 出现重复卡。
 *
 * ## 无人裁决时的兜底在哪
 *
 * 在 bridge 层：outstanding 记账 + 每次 attach 重投（main/seam/bridge.ts）。
 * 窗口全关 ⇒ 应用退出 ⇒ before-quit 关连接，内核子进程随之收尾，不会留悬挂请求。
 */
import type { KernelConnection } from "../acp/connection.ts";

/** 返回撤销函数（退出时调用，恢复 listenerCount===0 的 fail-safe 语义）。 */
export function holdServerRequests(conn: KernelConnection): () => void {
  const hold = (): void => {
    /* 刻意不作为：见文件头注释。 */
  };
  const offs = [
    conn.on("permission", hold),
    conn.on("askUserQuestion", hold),
    conn.on("exitPlanMode", hold),
    conn.on("elicitation", hold),
    conn.on("folderTrust", hold),
  ];
  return () => {
    for (const off of offs) off();
  };
}
