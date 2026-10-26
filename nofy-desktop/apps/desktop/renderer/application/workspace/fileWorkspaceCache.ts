import type { DesktopClient } from "../contracts/public.ts";
import { createFileResources } from "./fileResources.ts";
import { decodeFileWorkspaceView, encodeFileWorkspaceView } from "./fileWorkspacePrefs.ts";
import { filePreviewKind } from "./fileCapabilities.ts";
import { readPreference, writePreference } from "../../ui/workspacePrefs.ts";
type Owner = ReturnType<typeof createFileResources>;
const banks = new WeakMap<DesktopClient, { epoch: number; owners: Map<string, Owner> }>();
export function fileWorkspaceOwner(client: DesktopClient, root: string | null, sessionId: string | null, epoch: number): Owner {
  let bank = banks.get(client);
  if (!bank || bank.epoch !== epoch) {
    bank?.owners.forEach(owner => owner.dispose());
    bank = { epoch, owners: new Map() }; banks.set(client, bank);
  }
  const key = JSON.stringify([root, sessionId]);
  let owner = bank.owners.get(key);
  if (!owner) {
    const stored = readPreference("file-workspaces-v1");
    const entries: Array<{ key: string; view: unknown }> = Array.isArray(stored) ? stored.filter(item => item && typeof item.key === "string").slice(-4) : [];
    const restored = decodeFileWorkspaceView(entries.find(entry => entry.key === key)?.view, root);
    const save = (view: import("./fileWorkspacePrefs.ts").FileWorkspaceView) => {
      const raw = readPreference("file-workspaces-v1");
      const previous = Array.isArray(raw) ? raw.filter(item => item && typeof item.key === "string" && item.key !== key).slice(-3) : [];
      writePreference("file-workspaces-v1", [...previous,{ key, view: encodeFileWorkspaceView(view) }]);
    };
    const files = { ...client.files, read: async (id: string | null, path: string) => {
      const kind = filePreviewKind(path);
      if (kind === "unsupported") return { ok: true as const, value: { type: "unsupported", content: "", size: null, lineCount: null } };
      if (kind !== "image" || !root) return client.files.read(id,path);
      const result = await client.host.readRaster(root,path);
      return result.ok ? { ok: true as const, value: { type: "image", content: result.dataUrl, size: result.size, lineCount: null } } : { ok: false as const, error: result.error };
    } };
    owner = createFileResources(files, sessionId, () => {
      const state = client.projection.getState();
      return state.connection.transportEpoch === epoch && state.connection.status === "ready" && state.activeSessionId === sessionId;
    },restored,save);
  }
  bank.owners.delete(key); bank.owners.set(key, owner);
  while (bank.owners.size > 4) { const oldest = bank.owners.keys().next().value!; bank.owners.get(oldest)!.dispose(); bank.owners.delete(oldest); }
  return owner;
}
