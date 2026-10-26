import { tr } from "../../ui/i18n.ts";
/**
 * permModel —— 权限模式芯片的纯模型（node 下可测）。
 *
 * ## 两层词汇：UI 四档 ↔ 线路三轴（2026-09-13 活壳对齐）
 *
 * 用户看到的菜单是四档，标题/描述与活壳权限菜单逐字同族（双行式行）：
 *   变更前确认 / 自动编辑 / 计划模式 / 完全访问
 * 每档是内核三轴的**组合**，单选语义（选一档即清另两轴）：
 *
 *   confirm  → set_mode default + yolo/auto 双清（ask 也归这档：活壳无独立「询问」档）
 *   autoedit → auto_mode:true + yolo 清 + set_mode default
 *   plan     → set_mode plan + yolo/auto 双清
 *   full     → yolo_mode:true + auto 清 + set_mode default（先退计划再全放行）
 *
 * 三轴读回（合成当前档）：
 *  1. 会话模式轴：session/set_mode ⇄ current_mode_update（plan 进出才推；ask/default 靠 ack）。
 *  2. YOLO：nofy/yolo_mode_changed 的 yolo_mode；读回 = roster 行 yolo。
 *  3. auto：同通知 auto_mode / permission_mode="auto"；读回 = settings auto_permission_mode_enabled。
 *
 * 线路词汇 default/ask/auto/always-approve 与 pager 设置面逐字同族
 * （nofy-pager settings/defs.rs:96-119）；UI 档名只是展示层，不上线路。
 *
 * ## clientIdentifier 为什么必须带
 *
 * apply_yolo_mode_to_matching_sessions 按 origin_client.product == clientIdentifier
 * 过滤会话（mvp_agent/mod.rs:1611-1613）；**不带＝我们的会话一个都碰不到**。
 * 值与 packages/acp/src/identity.ts 的 CLIENT_IDENTIFIER 同字（test/perm-model.test.ts 钉）。
 */
export const PERM_CLIENT_ID = "nofy-desktop";

export type PermId = "confirm" | "autoedit" | "plan" | "full";

export type PermChoice = { id: PermId; label: string; desc: string; danger: boolean };

/**
 * 菜单顺序＝安全→危险（pager 同纪律：全放行档收尾当减速带）。
 * 标题逐字活壳；自动编辑的描述按内核分类器语义写实（活壳原文「自动编辑文件。」
 * 对我们的 auto 轴是过度承诺——危险动作仍会问，描述里写明）。
 */
export const PERM_CHOICES: PermChoice[] = [
  { id: "confirm", get label() { return tr("变更前确认"); }, get desc() { return tr("改文件前先问我。"); }, danger: false },
  { id: "autoedit", get label() { return tr("自动编辑"); }, get desc() { return tr("安全编辑自动放行，危险动作仍会问。"); }, danger: false },
  { id: "plan", get label() { return tr("计划模式"); }, get desc() { return tr("编辑前先出计划。"); }, danger: false },
  { id: "full", get label() { return tr("完全访问"); }, get desc() { return tr("跳过所有权限询问。"); }, danger: true },
];

export function permLabel(id: PermId): string {
  return PERM_CHOICES.find((c) => c.id === id)?.label ?? id;
}

/** 三源合成当前档：yolo > auto > 会话模式 plan > 其余皆 confirm（ask/default/表外不猜）。 */
export function currentPermId(input: { yolo: boolean; auto: boolean; mode: string | null }): PermId {
  if (input.yolo) return "full";
  if (input.auto) return "autoedit";
  if (input.mode === "plan") return "plan";
  return "confirm";
}

export { permAction } from "../../core/permissions.ts";
export type { PermAction } from "../../core/permissions.ts";
