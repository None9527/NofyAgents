/**
 * Runtime —— renderer 装配点的**形状**（纯类型，无 seam 依赖）。
 *
 * 定义在 core 而非 seam/features，是 dep-guard 守则的直接推论：
 * features 需要引用这个类型（App 的 props），但 features 不准 import seam；
 * 故类型住 core、实现住 seam（seam/runtime.ts）。形状与实现分离，
 * 和 KernelPort 的处理方式完全同构。
 */
import type { BootstrapInfo, NofyBridge, PickedFile } from "../../preload/contract.ts";
import type { ModelConfigAccess } from "../../preload/model-config-contract.ts";
import type { Effect, TaskResult } from "./effects.ts";
import type { KernelPort } from "./kernel-port.ts";
import type { Action } from "./project.ts";
import type { AppState } from "./store/state.ts";
import type { Store } from "./store/store.ts";

export type Runtime = ModelConfigAccess & {
  bridge: NofyBridge;
  port: KernelPort;
  store: Store<AppState, Action>;
  /** 出站**唯一**入口。组件直接调 port 就等于绕过请求/通知的强制点。 */
  effect: (e: Effect) => Promise<TaskResult>;
  bootstrap: () => Promise<BootstrapInfo>;
  /** 系统选文件框（宿主能力）；取消＝[]。实现住 seam，形状住 core（dep-guard 同构）。 */
  pickFiles: () => Promise<PickedFile[]>;
  pickDirectory: () => Promise<string | null>;
  saveText: (content: string, filename: string) => Promise<boolean>;
};
