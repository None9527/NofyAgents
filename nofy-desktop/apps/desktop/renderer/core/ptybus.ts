/**
 * ptybus —— PTY 帧的**流总线**（不进 store）。
 *
 * ## 为什么流不进 store
 *
 * 纪律是「内核投影住 store、写入只经 dispatch」，但 PTY 输出是**字节流**不是状态：
 * 一秒钟几十帧 base64，进 store 意味着每帧一次全树 reduce + 订阅者重渲，
 * 还会把流帧拖进回放门的夹具语义里（回放集里根本没有 pty 帧）。
 * xterm 的正确用法本来就是**命令式** write——React 重渲对终端是负价值。
 *
 * 所以：bind.ts 把 _nofy/terminal/pty/notification 归一化后**直接投递到这里**，
 * 终端组件按 terminalId 订阅、命令式写进自己的 xterm 实例；
 * 生命周期（exit / process_ended）也走同一条总线，dock 自己维护 tab 态。
 * 这是一条**记档的例外**（uiux-reference.md §2「流不进 store」），不是漏网。
 *
 * 纯模块：无 DOM、无线路名（归一化在 events.ts），node 下可测。
 */

export type TerminalFrame = {
  terminalId: string;
  /** 实测词汇：output / exit / process_started / process_ended */
  type: string;
  /** output 帧解码后的文本；其它帧 null */
  text: string | null;
  /** exit 帧的退出码；其它帧 null */
  exitCode: number | null;
  signal: string | null;
  outputOffset: number | null;
  /**
   * pty/load 的回放帧（源码 pty_session.rs:801-815）。true ⇒ 这段是历史全量重放，
   * 客户端义务是**先 reset 模拟器再喂**（:773-775 原文），否则历史会叠成两份。
   */
  isReplay: boolean;
};

type Listener = (frame: TerminalFrame) => void;

const listeners = new Set<Listener>();

export function onTerminalFrame(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitTerminalFrame(frame: TerminalFrame): void {
  for (const l of [...listeners]) l(frame);
}

/** 测试与自检用：当前订阅者数（泄漏门：dock 卸载后必须归零）。 */
export function terminalListenerCount(): number {
  return listeners.size;
}
