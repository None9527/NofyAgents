/**
 * createRuntime —— renderer 的启动装配点（实现）。
 *
 * 顺序要紧：adaptIpcBridge 构造时就发订阅握手（main 立刻回放 sticky/buffer），
 * bindKernel 紧接着订阅；两步之间到达的信号由 ipc-port 的早到暂存接住。
 * 类型在 core/runtime.ts（dep-guard：features 只认 core 的形状）。
 */
import type { NofyBridge } from "../../preload/contract.ts";
import { bindKernel } from "../core/bind.ts";
import { runEffect } from "../core/effects.ts";
import type { Runtime } from "../core/runtime.ts";
import { adaptIpcBridge } from "./ipc-port.ts";

export function createRuntime(bridge: NofyBridge): Runtime {
  const port = adaptIpcBridge(bridge);
  const { store } = bindKernel(port);
  return {
    bridge,
    port,
    store,
    effect: (e) => runEffect(port, store, e),
    bootstrap: () => bridge.bootstrap(),
    pickFiles: () => bridge.pickFiles(),
    pickDirectory: () => bridge.pickDirectory(),
    saveText: (content, filename) => bridge.saveText(content, filename),
    readModelConfig: () => bridge.readModelConfig(),
    updateModelConfig: (patch) => bridge.updateModelConfig(patch),
  };
}
