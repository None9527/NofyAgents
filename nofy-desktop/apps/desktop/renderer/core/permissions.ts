export const PERM_CLIENT_ID = "nofy-desktop";
export type PermId = "confirm" | "autoedit" | "plan" | "full";
export type PermAction = {
  /** 会话模式轴要发的 session/set_mode modeId；四档都走（full/confirm/autoedit 落 default）。 */
  modeId: string | null;
  /** nofy/yolo_mode_changed 的载荷；四档都发（负责清/置 yolo 与 auto）。 */
  notify: Record<string, unknown>;
};

/**
 * 选档 → 线路动作。载荷键逐字对齐 acp_agent.rs:1250-1305 的读取面：
 *   full     → yolo_mode:true（内核顺带清 auto）
 *   autoedit → yolo_mode:false + auto_mode:true（内核顺带清 yolo）
 *   其余     → 两键皆 false（双清）+ session/set_mode 切模式轴
 */
export function permAction(id: PermId): PermAction {
  const notify = (permission_mode: string, yolo_mode: boolean, auto_mode: boolean): Record<string, unknown> => ({
    clientIdentifier: PERM_CLIENT_ID,
    permission_mode,
    yolo_mode,
    auto_mode,
  });
  switch (id) {
    case "autoedit":
      return { modeId: "default", notify: notify("auto", false, true) };
    case "plan":
      return { modeId: "plan", notify: notify("default", false, false) };
    case "full":
      return { modeId: "default", notify: notify("always-approve", true, false) };
    default:
      return { modeId: "default", notify: notify("default", false, false) };
  }
}

