import type { createSettingsOperations } from "./operations.ts";
import type { SetupField } from "../../core/settings/protocol.ts";
export type McpDraft = { name: string; transport: "http" | "stdio"; endpoint: string; args: string; env: string };
export type SettingsResult =
  | { kind: "success"; message: string; restart: boolean }
  | { kind: "setup"; server: string; fields: SetupField[] }
  | { kind: "confirmation"; pluginId: string; message: string }
  | { kind: "error"; code: "validation" | "busy" | "stale" | "disconnected" | "unsupported" | "remote"; message: string };
export type PluginCommand =
  | { kind: "install"; source: string }
  | { kind: "toggle"; pluginId: string; enabled: boolean }
  | { kind: "uninstall"; pluginId: string; confirmed: boolean };
export type SettingsClient = ReturnType<typeof createSettingsOperations> & {
  mcp: {
    save: (id: string, draft: McpDraft) => Promise<SettingsResult>;
    toggle: (id: string, name: string, enabled: boolean) => Promise<SettingsResult>;
    remove: (id: string, name: string) => Promise<SettingsResult>;
    authenticate: (id: string, name: string) => Promise<SettingsResult>;
    setup: (id: string, name: string, values: Record<string, string>) => Promise<SettingsResult>;
  };
  plugins: { execute: (id: string, command: PluginCommand) => Promise<SettingsResult> };
};

export type SettingsResourceName = "plugins" | "market" | "skills" | "mcp" | "bundle" | "hooks" | "auth" | "model-config";

export type ModelConfigSnapshot = Awaited<ReturnType<import("./operations.ts").NativeModelAccess["readModelConfig"]>>;
export type ModelConfigRow = ModelConfigSnapshot["models"][number];
export type ModelApiBackend = ModelConfigRow["apiBackend"];
