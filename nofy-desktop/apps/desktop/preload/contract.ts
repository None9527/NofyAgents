/**
 * preload 契约 —— main ↔ preload ↔ renderer 的**唯一**接口定义。
 *
 * 裁定 B（PLAN §1）：renderer↔main 是唯一边界，形状自定义。本文件就是那个形状。
 *
 * 三条硬约束：
 *
 *  1. **纯类型 + 常量**。不含任何 electron / node 运行时 import，故三个进程都能安全
 *     引用——renderer 引它不会把 node 拉进 bundle（import type 在打包时被擦除）。
 *  2. **可结构化克隆**。过 IPC 的载荷只能是 JSON 兼容值：不含函数、类实例、Date、
 *     顶层 undefined。KernelSignal 本就是判别联合的纯数据，直接复用。
 *  3. **单一真相**。KernelSignal / RpcId 的定义只在 renderer/core/kernel-port.ts，
 *     此处 import type 再导出，**不另造一份「wire 形状」**。复制一份 = 迟早漂移，
 *     正是旧路 D2「桥的 main→host 方向从未被端到端验证」那类静默不一致的成因。
 */
import type { KernelSignal, RpcId } from "../renderer/core/kernel-port.ts";

export type { KernelSignal, RpcId };

/**
 * 通道名。全部集中在这一处；任何通道字符串字面量出现在别的文件里都算 bug
 * （拼错一个字 ⇒ 静默不通，而不是编译错误）。
 */
export const IPC = {
  /** main → renderer：入站信号推送。**唯一**推送通道。 */
  signal: "nofy:signal",
  /** renderer → main：订阅握手（invoke）。返回时 sticky + 缓冲回放已完成。 */
  subscribe: "nofy:subscribe",
  request: "nofy:request",
  extRequest: "nofy:ext-request",
  notify: "nofy:notify",
  respond: "nofy:respond",
  cancel: "nofy:cancel",
  isReady: "nofy:is-ready",
  bootstrap: "nofy:bootstrap",
  /**
   * renderer → main：原生选文件框（macOS 即 Finder 对话框）。
   * 2026-09-13 用户裁定：「添加附件」= 系统对话框，不是应用内搜索。
   * 取消＝空数组（不报错）；载荷只有 path/name 两个字符串，结构化克隆安全。
   */
  pickFiles: "nofy:pick-files",
} as const;

export type IpcChannel = (typeof IPC)[keyof typeof IPC];

/**
 * 窗口启动信息。
 *
 * renderer 需要 cwd 才能发 session/new（裁定 B：workspace 只是 cwd 参数，
 * 不是进程单位）。来源优先级：NOFY_WORKSPACE 环境变量 → main 的 process.cwd()。
 */
export type BootstrapInfo = {
  /** 本次窗口的工作区（session/new 的 cwd）。 */
  cwd: string;
  /** initialize 里报给内核的 clientVersion。 */
  clientVersion: string;
  appVersion: string;
  platform: string;
  arch: string;
  /** 单内核不变量（PLAN §7 验收门 5）：全应用只有一个内核子进程。 */
  kernelPid: number | null;
  kernelConnected: boolean;
  /** 非 null ⇒ 本次运行用的是隔离 NOFY_HOME（演示/录制用，不碰真 ~/.nofy）。 */
  isolatedHome: string | null;
};

export type SubscribeResult = {
  /** 本次订阅回放的信号条数（sticky + 缓冲 + 未应答 server-request）。 */
  replayed: number;
  /** 当前挂着的客户端数（多窗口 / 刚 reload 时可能 >1）。 */
  clients: number;
};

/**
 * 暴露到 renderer 全局的桥。
 *
 * onSignal 的注册与 subscribe 的调用**顺序无关**：preload 侧在没有监听者时
 * 暂存早到信号，adaptIpcBridge 侧同样暂存。两层都做，是因为「先注册再握手」
 * 这条纪律若只靠约定，某次重构后就会静默丢帧——而丢帧的表现是「界面卡住不动」，
 * 极难归因。
 */
/** 原生选文件框的一个结果。name = basename（芯片显示与 resource_link 的 name 用）。 */
export type PickedFile = { path: string; name: string };

export type NofyBridge = {
  /** 订阅入站信号；返回退订函数。同步注册，注册后不再丢帧。 */
  onSignal: (cb: (sig: KernelSignal) => void) => () => void;
  /** 订阅握手：main 侧 attach 本 webContents 并回放 sticky/缓冲/未应答请求。 */
  subscribe: () => Promise<SubscribeResult>;
  request: (method: string, params?: unknown) => Promise<unknown>;
  extRequest: (method: string, params?: unknown) => Promise<unknown>;
  /** 通知：不等响应。把通知当请求发会永久等待（陷阱 T1/T13）。 */
  notify: (method: string, params?: unknown) => Promise<void>;
  /** 应答内核→客户端请求。不应答则内核悬挂或 fail-closed。 */
  respond: (id: RpcId, result: unknown) => Promise<void>;
  /** 停止轮次。session/cancel 是 **notification**（陷阱 T1）。 */
  cancel: (sessionId: string) => Promise<void>;
  isReady: () => Promise<boolean>;
  bootstrap: () => Promise<BootstrapInfo>;
  /** 打开系统选文件框；取消返回 []。宿主能力，不经内核。 */
  pickFiles: () => Promise<PickedFile[]>;
  /**
   * 边界自检。存在理由：丢帧/形状漂移的症状是「界面卡住不动」，
   * 没有任何报错。给 UI 与测试一个能直接读的计数，别让它变成玄学。
   *   listeners  preload 侧已注册的信号监听者数
   *   early      暂存未投递的信号数（>0 说明还没人订阅）
   *   droppedEarly / rejected  任何一项 >0 都是 bug
   */
  diagnostics: () => BridgeDiagnostics;
};

export type BridgeDiagnostics = {
  listeners: number;
  early: number;
  droppedEarly: number;
  rejected: number;
};

/** renderer 上挂桥的全局键（window.nofy）。 */
export const BRIDGE_GLOBAL = "nofy";
