import type { AppState, Block } from "../../core/store/state.ts";
import type { DesktopClient } from "../contracts/public.ts";
import { fileWorkspaceOwner } from "./fileWorkspaceCache.ts";

export type TaskSource = { path: string; name: string; origin: "attachment" | "tool" };
/** Only structured file references, never paths guessed from prose or shell commands. */
export function collectTaskSources(blocks: readonly Block[]): TaskSource[] {
  const sources = new Map<string, TaskSource>();
  for (const block of blocks) {
    if (block.kind === "user-message" && block.source) {
      sources.set(block.source.path, { ...block.source, origin: "attachment" });
    } else if (block.kind === "tool-call") {
      for (const value of block.locations) {
        if (!value || typeof value !== "object") continue;
        const path = (value as Record<string, unknown>)["path"];
        if (typeof path !== "string" || !path.startsWith("/") || sources.has(path)) continue;
        sources.set(path, { path, name: path.split("/").pop() || path, origin: "tool" });
      }
    }
  }
  return [...sources.values()];
}

/** Ignore streamed text so token updates do not invalidate the overview. */
export function createTaskSourcesSelector(sessionId: string) {
  let blocks: readonly Block[] | undefined;
  let signature = "";
  let result: TaskSource[] = [];
  return (state: AppState) => {
    const next = state.sessions[sessionId]?.blocks;
    if (next === blocks) return result;
    blocks = next;
    const sources = collectTaskSources(next ?? []);
    const key = JSON.stringify(sources);
    if (signature !== key) { result = sources; signature = key; }
    return result;
  };
}

/** Uses the same file owner as the workbench; stale actions cannot open another session's file. */
export async function openTaskSource(client: DesktopClient, sessionId: string, cwd: string, path: string) {
  const state = client.projection.getState();
  if (state.activeSessionId !== sessionId || state.sessions[sessionId]?.cwd !== cwd || state.connection.status !== "ready") throw new Error("会话已变化，请重新打开来源");
  const owner = fileWorkspaceOwner(client, cwd, sessionId, state.connection.transportEpoch);
  owner.resume();
  await owner.openFile(path, true);
}
