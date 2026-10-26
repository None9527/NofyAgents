import { tr } from "../../ui/i18n.ts";
/**
 * slashModel —— composer 斜杠面板的纯模型（node 下可测）。
 *
 * ## 线路真相（为什么「选中＝填文本」就够了）
 *
 * 内核在 **session/prompt 的文本里自己解析斜杠命令**：
 *   crates/codegen/nofy-shell/src/session/slash_commands.rs:1390 resolve()
 *   → parse_slash_prefix → 内置命令（含别名 /yolo）/ 技能 / workflow / prompt-only 命令
 * ⇒ 面板不需要第二条线路：选中把 "/name " 填进草稿，发送就是普通 prompt。
 * 数据源 = available_commands_update（实测 167 条；技能带 _meta.scope，内置命令不带）。
 *
 * ## 与活壳的差异（有意为之）
 *
 * 活壳斜杠面板是 Lexical 里的**命令节点**（选中插入 mention node，Composer.tsx:3976），
 * 因为它的命令要带参数 schema。我们内核吃纯文本，插节点反而多一层翻译——
 * 填 "/name " 文本是最短的真线路。
 *
 * ## 开关判据（slashQueryOf）
 *
 * 草稿以 "/" 开头且**还没出现空白**时面板开：空白一旦出现就是参数模式
 * （内核的 hint 就是参数占位，如 "/deep-research <query>"），面板该让位。
 */
import type { CommandInfo } from "../../ui/readers.ts";

/** 面板最多画多少行；超出的诚实报数并指向 ⌘K 全表。 */
export const SLASH_PANEL_LIMIT = 12;

export type SlashGroup = {
  id: "builtin" | "skill";
  label: string;
  rows: CommandInfo[];
};

export type SlashView = {
  /** 面板是否开。false 时 groups 必为空数组。 */
  open: boolean;
  groups: SlashGroup[];
  /** 键盘选中的是**展平后**的第几行（跨组连续）。 */
  flat: CommandInfo[];
  /** 命中但被 LIMIT 截掉的条数。 */
  hidden: number;
};

/** 草稿 → 斜杠查询串；null = 面板关。 */
export function slashQueryOf(draft: string): string | null {
  if (!draft.startsWith("/")) return null;
  const rest = draft.slice(1);
  if (/\s/.test(rest)) return null; // 已进入参数模式
  return rest;
}

type Ranked = { cmd: CommandInfo; rank: number };

function rankOf(cmd: CommandInfo, q: string): number | null {
  if (q.length === 0) return 0;
  const name = cmd.name.toLocaleLowerCase();
  if (name.startsWith(q)) return 0;
  if (name.includes(q)) return 1;
  if ((cmd.description ?? "").toLocaleLowerCase().includes(q)) return 2;
  return null;
}

function rankGroup(cmds: CommandInfo[], q: string): Ranked[] {
  const out: Ranked[] = [];
  for (const cmd of cmds) {
    const rank = rankOf(cmd, q);
    if (rank !== null) out.push({ cmd, rank });
  }
  // 稳定排序：rank 升序，同 rank 保持内核下发顺序（不引评分库，行为可预测）。
  return out.sort((a, b) => a.rank - b.rank);
}

export function filterSlashGroups(cmds: CommandInfo[], query: string): SlashView {
  const q = query.trim().toLocaleLowerCase();
  const builtins = rankGroup(cmds.filter((c) => c.scope === null), q);
  const skills = rankGroup(cmds.filter((c) => c.scope !== null), q);
  const budget = SLASH_PANEL_LIMIT;
  const shownBuiltins = builtins.slice(0, budget);
  const shownSkills = skills.slice(0, Math.max(0, budget - shownBuiltins.length));
  const matched = builtins.length + skills.length;
  const groups: SlashGroup[] = [];
  if (shownBuiltins.length > 0) {
    groups.push({ id: "builtin", label: tr("命令"), rows: shownBuiltins.map((r) => r.cmd) });
  }
  if (shownSkills.length > 0) {
    groups.push({ id: "skill", label: tr("技能"), rows: shownSkills.map((r) => r.cmd) });
  }
  return {
    open: groups.length > 0,
    groups,
    flat: [...shownBuiltins, ...shownSkills].map((r) => r.cmd),
    hidden: Math.max(0, matched - (shownBuiltins.length + shownSkills.length)),
  };
}

/** 选中一条：草稿变成 "/name "，光标落在末尾接着打参数。 */
export function slashInsert(name: string): string {
  return "/" + name + " ";
}

/** 键盘步进：越界回绕（与 ⌘K 的 stepIndex 同纪律）。 */
export function slashStep(count: number, index: number, delta: number): number {
  if (count <= 0) return 0;
  return ((index + delta) % count + count) % count;
}
/** 展平排序后的命中列表（$ 技能选择器复用；不分段、不截断）。 */
export function filterCommands(cmds: CommandInfo[], query: string): CommandInfo[] {
  return rankGroup(cmds, query.trim().toLocaleLowerCase()).map((r) => r.cmd);
}
