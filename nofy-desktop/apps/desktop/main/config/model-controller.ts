import { readModelConfig, updateModelConfig } from "./model-config.ts";
import type { ModelConfigPatch } from "../../preload/model-config-contract.ts";
import type { KernelBridge } from "../seam/bridge.ts";
import { getKernel } from "../acp/connection.ts";
import { EXT_REQUEST } from "@nofy-desktop/acp";

/** Serialize desktop model configuration while its sole kernel writer is stopped. */
export function createModelController(home: () => string, bridge: KernelBridge) {
  let changing = false;
  return {
    busy: () => changing,
    read: () => readModelConfig(home()),
    update: async (patch: ModelConfigPatch) => {
      if (changing) throw new Error("模型配置正在保存，请稍后重试");
      changing = true;
      const conn = getKernel();
      let stopped = false;
      let saved = false;
      try {
        if (!conn.isInitialized) throw new Error("请等待内核就绪后再保存模型配置");
        const raw = await conn.ext(EXT_REQUEST.sessionsList, {});
        const outer = raw && typeof raw === "object" ? raw as Record<string, unknown> : {};
        const result = outer.result && typeof outer.result === "object" ? outer.result as Record<string, unknown> : outer;
        if (!Array.isArray(result.sessions)) throw new Error("无法确认会话状态，配置尚未修改");
        const safe = new Set(["idle", "dormant", "completed", "dead"]);
        if (result.sessions.some((s) => !s || typeof s !== "object" || !safe.has(String((s as Record<string, unknown>).activity))) || bridge.stats().outstanding > 0) {
          throw new Error("请先停止运行中的任务并处理审批，再保存模型配置");
        }
        // Wait for the old child's exit signal before starting another; close alone isn't a barrier.
        await new Promise<void>((resolve, reject) => {
          const timer = setTimeout(() => { off(); reject(new Error("内核未能及时退出，配置尚未修改")); }, 10_000);
          const off = conn.on("status", (status) => { if (!status.connected) { clearTimeout(timer); off(); resolve(); } });
          stopped = true;
          conn.close();
        });
        const snapshot = await updateModelConfig(home(), patch);
        saved = true;
        conn.connect();
        stopped = false;
        await conn.ready(20_000);
        return snapshot;
      } catch (error) {
        if (saved) throw new Error("模型配置已保存，但内核尚未恢复。请重新启动应用后核对模型；无需再次输入密钥。");
        throw error;
      } finally {
        if (stopped) { try { conn.connect(); } catch { /* The existing connection supervisor reports recovery failure. */ } }
        changing = false;
      }
    },
  };
}
