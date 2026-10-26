import type { SessionMetadata, SessionMetadataPatch } from "./sessionMetadataModel.ts";
/** One organization policy for the sidebar and active-session header. */
export function organizationCommands(metadata: Partial<Pick<SessionMetadata, "pinned" | "unread" | "archived">>, running: boolean) {
  return [
    { id: "pin", label: metadata.pinned ? "取消置顶（仅此窗口）" : "置顶会话（仅此窗口）", patch: { pinned: !metadata.pinned } as SessionMetadataPatch, disabled: false },
    { id: "read", label: metadata.unread ? "标为已读（仅此窗口）" : "标为未读（仅此窗口）", patch: { unread: !metadata.unread } as SessionMetadataPatch, disabled: false },
    { id: "archive", label: metadata.archived ? "移出归档（仅此窗口）" : "归档会话（仅此窗口）", patch: { archived: !metadata.archived } as SessionMetadataPatch, disabled: running && !metadata.archived },
  ];
}
export function sessionCommandAvailability(ready: boolean, running: boolean, cwd: string | null) {
  return { rename: ready, fork: ready && !running && !!cwd, delete: ready && !running, export: true, copyPath: !!cwd };
}
