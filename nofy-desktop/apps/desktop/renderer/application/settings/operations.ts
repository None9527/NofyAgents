import type { Runtime } from "../../core/runtime.ts";
import type { Effect, TaskResult } from "../../core/effects.ts";
import type { AppState } from "../../core/store/state.ts";
import { serviceResponse } from "../../core/service-actions.ts";
import { tr } from "../../ui/i18n.ts";
import { asObj, readSkills } from "../../ui/readers.ts";
import type { SettingsResourceName, SettingsResult } from "./contracts.ts";
import { settleSettingsWrite } from "./writeResult.ts";
export type NativeModelAccess = Pick<Runtime, "readModelConfig" | "updateModelConfig">;

/** ExtMethodResult failures arrive on a successful RPC frame. Preserve the kernel string. */
function kernelEnvelopeError(value: unknown): string | null {
  const error = asObj(value)["error"];
  if (typeof error === "string") return error === "" ? null : error;
  if (error !== null && typeof error === "object") {
    const message = asObj(error)["message"];
    if (typeof message === "string" && message !== "") return message;
    return tr("内核未确认技能状态。");
  }
  return null;
}

function skillToggleConfirmed(value: unknown, name: string, enabled: boolean): boolean {
  const listed = readSkills(value).find((row) => row.name === name);
  const skills = asObj(asObj(value)["result"])["skills"];
  if (listed === undefined || listed.enabled !== enabled || !Array.isArray(skills)) return false;
  return skills.some((item) => {
    const row = asObj(item);
    return row["name"] === name && row["enabled"] === enabled;
  });
}

export function createSettingsOperations(effect: (effect: Effect) => Promise<TaskResult>, getState: () => AppState, native?: NativeModelAccess) {
  let savingCredential = false;
  let togglingSkill = false;
  const fail = (message: string, code: "remote" | "busy" | "stale" | "validation" = "remote"): SettingsResult => ({ kind: "error", code, message });
  return {
    models: {
      read: () => { if (!native) throw new Error("模型配置入口不可用"); return native.readModelConfig(); },
      save: (patch: Parameters<NativeModelAccess["updateModelConfig"]>[0]) => { if (!native) throw new Error("模型配置入口不可用"); return native.updateModelConfig(patch); },
    },
    catalog: {
      read: async (name: Exclude<SettingsResourceName, "model-config">, sessionId: string | null, cwd: string | null): Promise<unknown> => {
        const result = name === "plugins" ? await effect({ kind: "eco/plugins", sessionId: sessionId! })
          : name === "market" ? await effect({ kind: "eco/marketplace" })
          : name === "skills" ? await effect({ kind: "eco/skills", cwd: cwd! })
          : name === "mcp" ? await effect({ kind: "eco/mcp", sessionId: sessionId! })
          : await effect({ kind: "service/request", operation: name === "bundle" ? "bundleStatus" : name === "hooks" ? "hooksList" : "authInfo", params: name === "hooks" ? { sessionId } : {} });
        if (!result.ok) throw new Error(result.error);
        if (name === "auth") return { methodId: serviceResponse(result.value)["methodId"] ?? null };
        return result.value;
      },
      entry: async (kind: "persona" | "agent", name: string): Promise<string> => {
        const epoch = getState().connection.transportEpoch;
        const result = await effect({ kind: "service/request", operation: "bundleEntryGet", params: { kind, name } });
        if (getState().connection.transportEpoch !== epoch) throw new Error(tr("连接已变化，请重新读取设置"));
        if (!result.ok) throw new Error(result.error);
        const content = serviceResponse(result.value)["content"];
        if (typeof content !== "string") throw new Error(tr("内核未返回内容。"));
        return content;
      },
      toggleSkill: async (name: string, enabled: boolean, cwd: string): Promise<SettingsResult> => {
        if (name === "" || cwd === "") return fail("请指定技能和工作区", "validation");
        if (togglingSkill) return fail("正在切换技能", "busy");
        const epoch = getState().connection.transportEpoch;
        const valid = () => getState().connection.transportEpoch === epoch && getState().connection.status === "ready";
        if (!valid()) return fail("连接尚未就绪", "stale");
        togglingSkill = true;
        try {
          const result = await effect({ kind: "skills/toggle", name, enabled, cwd });
          if (!valid()) return fail(tr("连接已变化，请重新读取设置"), "stale");
          const refuse = (error: string) => {
            const settled = settleSettingsWrite({ committed: !enabled, draft: enabled, accepted: false, error, readBack: null });
            return fail(settled.error ?? error);
          };
          if (!result.ok) return refuse(result.error);
          const kernelError = kernelEnvelopeError(result.value);
          if (kernelError !== null) return refuse(kernelError);
          const confirmed = skillToggleConfirmed(result.value, name, enabled);
          const settled = settleSettingsWrite({
            committed: !enabled,
            draft: enabled,
            accepted: true,
            error: confirmed ? null : tr("内核未确认技能状态。"),
            readBack: confirmed ? enabled : null,
          });
          if (!settled.success) return fail(settled.error ?? tr("内核未确认技能状态。"));
          return { kind: "success", restart: false, message: "" };
        } catch (cause) {
          const message = cause instanceof Error ? cause.message : String(cause);
          const settled = settleSettingsWrite({ committed: !enabled, draft: enabled, accepted: false, error: message, readBack: null });
          return fail(settled.error ?? message);
        }
        finally { togglingSkill = false; }
      },
    },
    credentials: {
      save: async (key: string, accepted: () => void): Promise<SettingsResult> => {
        if (!key.trim()) return fail("请输入凭据", "validation");
        if (savingCredential) return fail("正在保存凭据", "busy");
        const epoch = getState().connection.transportEpoch;
        const valid = () => getState().connection.transportEpoch === epoch && getState().connection.status === "ready";
        if (!valid()) return fail("连接尚未就绪", "stale");
        savingCredential = true;
        try {
          const draft = key.trim();
          const saved = await effect({ kind: "service/request", operation: "setApiKey", params: { key: draft } });
          if (!saved.ok) return fail(saved.error);
          if (serviceResponse(saved.value)["ok"] !== true) return fail(tr("内核未确认凭据保存。"));
          if (!valid()) return fail(tr("连接已变化，请重新读取设置"), "stale");
          const auth = await effect({ kind: "service/request", operation: "modelAuthenticate", params: { methodId: "api_key" } });
          if (!valid()) return fail(tr("连接已变化，请重新读取设置"), "stale");
          if (!auth.ok) {
            const settled = settleSettingsWrite({ committed: draft, draft, accepted: false, error: tr("凭据已保存，认证失败：") + auth.error, readBack: null });
            return fail(settled.error ?? tr("凭据已保存，认证失败：") + auth.error);
          }
          const reload = await effect({ kind: "service/request", operation: "modelsReload", params: {} });
          if (!valid()) return fail(tr("连接已变化，请重新读取设置"), "stale");
          if (!reload.ok) {
            const settled = settleSettingsWrite({ committed: draft, draft, accepted: false, error: tr("凭据已保存；模型刷新失败：") + reload.error, readBack: null });
            return fail(settled.error ?? tr("凭据已保存；模型刷新失败：") + reload.error);
          }
          const info = await effect({ kind: "service/request", operation: "authInfo", params: {} });
          if (!valid()) return fail(tr("连接已变化，请重新读取设置"), "stale");
          if (!info.ok) {
            const settled = settleSettingsWrite({ committed: draft, draft, accepted: false, error: info.error, readBack: null });
            return fail(settled.error ?? info.error);
          }
          const confirmed = serviceResponse(info.value)["methodId"] === "api_key";
          const settled = settleSettingsWrite({
            committed: draft,
            draft,
            accepted: true,
            error: confirmed ? null : tr("内核未回读确认。"),
            readBack: confirmed ? "" : null,
          });
          if (!valid()) return fail(tr("连接已变化，请重新读取设置"), "stale");
          if (!settled.success) return fail(settled.error ?? tr("内核未回读确认。"));
          accepted();
          return { kind: "success", restart: true, message: tr("凭据已保存，内核接受认证请求。重启应用后创建会话测试真实模型连接。") };
        } catch (cause) { return fail(cause instanceof Error ? cause.message : String(cause)); }
        finally { savingCredential = false; }
      },
    },
  };
}
