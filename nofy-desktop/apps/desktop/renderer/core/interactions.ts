/**
 * 裁决面分类 —— **线路名只在 core 出现**的守门点。
 *
 * 为什么要有这一层：features 若直接比 CLIENT_SIDE_METHOD / EXT_SERVER_REQUEST，
 * 线路名就会渗进界面组件——ZCode 不可维护的本体正是「线路形状抹在几百个
 * 组件里」。分类是协议知识，归 core；组件只认 InteractionKind 这个界面语义词。
 *
 * 新增裁决面时：先在这里登记 kind，再在 features/approvals 里加卡片。
 * 漏登记的方法落 "unimplemented"，界面会诚实写明并给取消（不猜应答形状）。
 */
import { CLIENT_SIDE_METHOD, EXT_SERVER_REQUEST } from "@nofy-desktop/acp";

export type InteractionKind =
  /** session/request_permission：选项逐字渲染（permission-flow-measured.md §2）。 */
  | "permission"
  /** _nofy/folder_trust/request：fail-closed 的信任二选一（capability-gates.md）。 */
  | "folder-trust"
  /** _nofy/ask_user_question：正向载荷未实测，S0 只给取消。 */
  | "ask-user"
  /** _nofy/exit_plan_mode：同上。 */
  | "exit-plan"
  /** session/elicitation 与 _nofy/mcp/elicit：取消载荷是 {action:{outcome}} 族。 */
  | "elicitation"
  /** 表外方法：不猜，保持挂起，由 Stop 兜底。 */
  | "unimplemented";

export function interactionKind(method: string): InteractionKind {
  if (method === CLIENT_SIDE_METHOD.requestPermission) return "permission";
  if (method === EXT_SERVER_REQUEST.folderTrustRequest) return "folder-trust";
  if (method === EXT_SERVER_REQUEST.askUserQuestion) return "ask-user";
  if (method === EXT_SERVER_REQUEST.exitPlanMode) return "exit-plan";
  if (method === CLIENT_SIDE_METHOD.elicitation || method === EXT_SERVER_REQUEST.mcpElicit) return "elicitation";
  return "unimplemented";
}
