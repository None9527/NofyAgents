import { tr } from "../../ui/i18n.ts";
/**
 * ⌘K 命令面板的**纯模型**（无 DOM、无线路名、无 React）。
 *
 * ## 解剖来源（用户裁定「能抄的先抄一遍」，来源在此记档）
 *
 * ZCode 3.7.6 逆向树 desktop/src/src-reconstructed/modules/QuickPick.tsx（3108 行）：
 *
 * | 抄的东西 | 逆向树位置 | 我们的落点 |
 * |---|---|---|
 * | 段序 suggested/chat/navigation/panels/configure/app | :568 QUICK_PICK_SECTION_ORDER | ACTION_SECTIONS（去掉 3.7.6 未注册命令的 chat/navigation） |
 * | 前缀语法 `>`命令 `#`会话 `@`文件 | :1129 parseScopedQuery / :1142 scopePrefix | 同名同义（`@` 随文件 pane 再开） |
 * | 命令过滤＝标题+关键词拼接、分词**全命中** | :1156 commandMatchesQuery | matchesQuery |
 * | 高亮＝分词→区间→合并→<mark> | :957-1024 tokenize/findRanges/merge | 同名三件 |
 * | 折叠上限 3 / 最近段 3 / 文件 80 / 任务 80 | :1111-1117 | COLLAPSED_LIMIT / RECENT_LIMIT / COMMAND_LIMIT |
 * | 搜索历史上限 20、去重置顶 | :1026 / :1088 recordSearchHistory | recordHistory（持久化在 ui/prefs.ts） |
 * | 空标题 → 「未命名」 | :934 resolveTaskTitle | sessionTitle |
 * | 命令注册表 18 条 / 6 段 / 关键词含中英 | :665 buildQuickPickCommands | App.tsx 的 actions（按我们**真有**的能力裁） |
 *
 * 抄的是**度量、段序、过滤与高亮算法**；代码自写（裁定 C 的干净室在 UI 层被用户
 * 显式放松，但「线路形状不进组件」仍然成立——本文件不认识任何 _nofy/* 名字）。
 *
 * ## 与 ZCode 的三处差别（都有据）
 *
 * 1. **少一个「文件」范围**：ZCode 走 fileService.listWorkspaceFiles；我们的对应面是
 *    `_nofy/search/fuzzy/*`（已实测：结果不在 change 的响应里，走
 *    `_nofy/search/fuzzy/status` 通知，见 docs/contract/ecosystem-shapes.json）。
 *    接线随文件 pane 一起落，先不放空标签——空标签比灰按钮更失信。
 * 2. **命令来源是内核**：availableCommands（实测 initialize 给 7 条、
 *    available_commands_update 给 167 条），不是本地注册表。选中＝把 `/name ` 填进
 *    composer 草稿（内核命令是 slash 命令，不是客户端动作）。
 * 3. **本地动作段只放真能跑的**：未接线的动作显式 disabled 并写明接哪一期
 *    （uiux-reference.md §1 的既有约定）。
 */

/* ═══════════════════ 范围与前缀语法 ═══════════════════ */

export type PaletteScope = "all" | "commands" | "sessions";

/** 范围胶囊的顺序（照 :2553 段的 tablist 渲染顺序：全部 → 操作 → 任务 → 文件）。 */
export const SCOPE_ORDER: PaletteScope[] = ["all", "commands", "sessions"];

export const SCOPE_LABEL: Record<PaletteScope, string> = {
  get all() { return tr("全部"); },
  get commands() { return tr("命令"); },
  get sessions() { return tr("会话"); },
};

export type ParsedQuery = { query: string; scope: PaletteScope; explicitScope: boolean };

/**
 * 前缀语法（抄 :1129）。前缀「>」= 命令、「#」= 会话；其余落「全部」。
 *
 * 与 ZCode 的一处刻意差别：它对前缀分支只 trimStart（尾随空格留着），无前缀分支
 * 才 trim——两条路径口径不一致。我们两边都 trim：查询词的尾随空格对「分词全命中」
 * 没有意义，却会让「切范围胶囊时把前缀去掉再写回输入框」多带一个空格。
 */
export function parseScopedQuery(raw: string): ParsedQuery {
  const trimmed = raw.trim();
  const first = trimmed.slice(0, 1);
  if (first === ">") return { query: trimmed.slice(1).trim(), scope: "commands", explicitScope: true };
  if (first === "#") return { query: trimmed.slice(1).trim(), scope: "sessions", explicitScope: true };
  return { query: trimmed, scope: "all", explicitScope: false };
}

/** 段 → 前缀字符（抄 :1142）。写回输入框时用，让「范围」在文本里可见。 */
export function scopePrefix(scope: PaletteScope): string {
  return scope === "commands" ? ">" : scope === "sessions" ? "#" : "";
}

/* ═══════════════════ 段序与上限（抄来的度量） ═══════════════════ */

export type ActionSection = "suggested" | "panels" | "configure" | "app";

/** 3.7.6 的六段里 chat/navigation 未注册任何命令（:660 头注），故只留四段。 */
export const ACTION_SECTIONS: ActionSection[] = ["suggested", "panels", "configure", "app"];

export const SECTION_LABEL: Record<ActionSection | "kernel" | "recent", string> = {
  get suggested() { return tr("建议"); },
  get panels() { return tr("面板"); },
  get configure() { return tr("配置"); },
  get app() { return tr("应用"); },
  get kernel() { return tr("内核命令"); },
  get recent() { return tr("最近会话"); },
};

export const COLLAPSED_LIMIT = 3; // :1111 COLLAPSED_SECTION_LIMIT
export const RECENT_LIMIT = 3; // :1113 RECENT_SECTION_LIMIT
export const COMMAND_LIMIT = 80; // :1117 TASK_LIST_LIMIT / :1115 FILE_SEARCH_LIMIT 同值
export const HISTORY_LIMIT = 20; // :1026 SEARCH_HISTORY_LIMIT

/* ═══════════════════ 行模型 ═══════════════════ */

/** 图标键 → ui/icons.tsx 的组件（映射在 CommandPalette.tsx，本文件不 import React）。 */
export type IconKey =
  | "plus" | "search" | "gear" | "terminal" | "panel" | "palette" | "message"
  | "folder" | "mark" | "edit" | "info" | "shield" | "clock" | "boxes" | "file" | "zap" | "globe";

export type PaletteAction = {
  id: string;
  section: ActionSection;
  title: string;
  /** 中英关键词都放（抄 :665 的做法：["settings","preferences","配置","设置"]）。 */
  keywords: string[];
  icon: IconKey;
  shortcut?: string | null;
  /** 未接线：置灰 + 写明接哪一期。绝不放一个点了没反应的项。 */
  disabled?: boolean;
  note?: string | null;
  run?: () => void;
};

export type PaletteCommand = { name: string; description: string | null; hint: string | null };

export type PaletteSession = {
  /** 稳定 key（loaded 用 sessionId，roster 用 "roster:"+sessionId）。 */
  key: string;
  sessionId: string;
  title: string | null;
  activity: string | null;
  /** 已在 store 里（可直接激活）还是需要 session/load。 */
  loaded: boolean;
  active: boolean;
  cwd: string | null;
  /**
   * 最近变更的 unix 毫秒。roster 的 lastChangeUnixMs（实测键），已加载会话可能没有
   * ⇒ null，此时不参与「最近」排序（排到最后），也不显示相对时间。
   */
  at: number | null;
};

export type PaletteRow =
  | { kind: "action"; key: string; action: PaletteAction }
  | { kind: "command"; key: string; command: PaletteCommand }
  | { kind: "session"; key: string; session: PaletteSession };

export type PaletteGroup = {
  key: string;
  heading: string;
  rows: PaletteRow[];
  /** 命中总数（> rows.length 说明被折叠了）。 */
  total: number;
};

export type PaletteView = {
  scope: PaletteScope;
  explicitScope: boolean;
  query: string;
  groups: PaletteGroup[];
  /** 渲染顺序拉平，供 ↑↓/Enter 用（组件只维护一个 index）。 */
  flat: PaletteRow[];
  empty: boolean;
};

/* ═══════════════════ 过滤与高亮（抄算法） ═══════════════════ */

/** 小写去重分词（抄 :957）。 */
export function tokenizeQuery(query: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const token of query.trim().toLocaleLowerCase().split(/\s+/)) {
    if (token.length === 0 || seen.has(token)) continue;
    seen.add(token);
    out.push(token);
  }
  return out;
}

/** 分词**全命中**（抄 :1156）：不是模糊评分，是「每个词都要出现」。 */
export function matchesQuery(haystack: string, query: string): boolean {
  const tokens = tokenizeQuery(query);
  if (tokens.length === 0) return true;
  const lower = haystack.toLocaleLowerCase();
  return tokens.every((t) => lower.includes(t));
}

export type HighlightRange = { start: number; end: number };

/** 重叠区间合并（抄 :968）。 */
export function mergeHighlightRanges(ranges: HighlightRange[]): HighlightRange[] {
  const sorted = [...ranges].sort((a, b) => a.start - b.start || a.end - b.end);
  const merged: HighlightRange[] = [];
  for (const range of sorted) {
    const last = merged.at(-1);
    if (last === undefined || range.start > last.end) {
      merged.push({ ...range });
      continue;
    }
    last.end = Math.max(last.end, range.end);
  }
  return merged;
}

/** 查询词在文本里的全部出现区间（抄 :983）。 */
export function findHighlightRanges(text: string, query: string): HighlightRange[] {
  const tokens = tokenizeQuery(query);
  if (tokens.length === 0 || text.length === 0) return [];
  const lower = text.toLocaleLowerCase();
  const ranges: HighlightRange[] = [];
  for (const token of tokens) {
    let index = 0;
    for (;;) {
      const found = lower.indexOf(token, index);
      if (found === -1) break;
      ranges.push({ start: found, end: found + token.length });
      index = found + token.length;
    }
  }
  return mergeHighlightRanges(ranges);
}

/** 空标题 → 「未命名」（抄 :934 resolveTaskTitle）。 */
export function sessionTitle(title: string | null): string {
  const t = title?.trim() ?? "";
  return t.length === 0 ? tr("未命名会话") : t;
}

/**
 * 相对时间（抄 :922 formatRelativeTime 的分档：刚刚 / N 分钟前 / N 小时前 / N 天前）。
 * ZCode 走 intl.formatMessage；我们没有 i18n 层，文案直出中文（词典与它一致）。
 * now 作为参数传入 ⇒ 纯函数、可单测（不依赖时钟）。
 */
export function formatRelative(timestamp: number | null, now: number): string | null {
  if (timestamp === null || !Number.isFinite(timestamp)) return null;
  const elapsed = now - timestamp;
  if (elapsed < 0) return tr("刚刚");
  const minutes = Math.floor(elapsed / 60_000);
  if (minutes < 1) return tr("刚刚");
  if (minutes < 60) return String(minutes) + tr(" 分钟前");
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return String(hours) + tr(" 小时前");
  return String(Math.floor(hours / 24)) + tr(" 天前");
}

/**
 * 紧凑档相对时间——侧栏任务行右侧那枚时间芯片用。
 *
 * 为什么另写一个而不是复用 formatRelative：活壳 3.11.2 的芯片实测文案是
 * 「57分」「1小时」「6天」（CDP 取数，见 docs/contract/zcode-live-metrics.md §1.2），
 * 比 :922 的长档短一半；248px 的行宽里，标题是 flex-1 truncate，芯片是 shrink-0，
 * 长档会把标题挤掉三四个字。⌘K 面板行更宽，仍用长档。
 * 分档边界与长档一致（<1 分＝刚刚，<60 分＝分，<24 小时＝小时，其余＝天）。
 */
export function formatCompactRelative(timestamp: number | null, now: number): string | null {
  if (timestamp === null || !Number.isFinite(timestamp)) return null;
  const elapsed = now - timestamp;
  if (elapsed < 0) return tr("刚刚");
  const minutes = Math.floor(elapsed / 60_000);
  if (minutes < 1) return tr("刚刚");
  if (minutes < 60) return String(minutes) + tr("分");
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return String(hours) + tr("小时");
  return String(Math.floor(hours / 24)) + tr("天");
}

/** 工作区末段名（抄 :1167 fileDirectoryLabel 的思路：路径按 / 切，取有意义的一段）。 */
export function workspaceLabel(cwd: string | null): string | null {
  if (cwd === null) return null;
  const parts = cwd.split("/").filter((p) => p.length > 0);
  return parts.length === 0 ? cwd : (parts[parts.length - 1] ?? cwd);
}
/* ═══════════════════ 搜索历史（纯函数；持久化在 ui/prefs.ts） ═══════════════════ */

export type HistoryEntry = { query: string; scope: PaletteScope; at: number };

/** 去重置顶、截到 20 条（抄 :1088 recordSearchHistory 的行为）。 */
export function recordHistory(entries: HistoryEntry[], query: string, scope: PaletteScope, at: number): HistoryEntry[] {
  const q = query.trim();
  if (q.length === 0) return entries;
  const kept = entries.filter((e) => !(e.query === q && e.scope === scope));
  return [{ query: q, scope, at }, ...kept].slice(0, HISTORY_LIMIT);
}

/* ═══════════════════ 视图构建 ═══════════════════ */

export type PaletteInput = {
  rawQuery: string;
  /** 范围胶囊的状态；输入框带前缀时以前缀为准（抄 :2200 effectiveScope）。 */
  scope: PaletteScope;
  actions: PaletteAction[];
  commands: PaletteCommand[];
  sessions: PaletteSession[];
  /** 用户点过「更多结果」的段（抄 :2190 expandedSections）。 */
  expanded: ReadonlySet<string>;
};

function actionHaystack(a: PaletteAction): string {
  return a.title + " " + a.keywords.join(" ");
}

function commandHaystack(c: PaletteCommand): string {
  return c.name + " " + (c.description ?? "") + " " + (c.hint ?? "");
}

function sessionHaystack(s: PaletteSession): string {
  return sessionTitle(s.title) + " " + s.sessionId + " " + (s.cwd ?? "") + " " + (s.activity ?? "");
}

/**
 * 段内排序：命中越靠前越优先（ZCode 靠 cmdk 的 fuzzy 评分，我们**关掉了**它的过滤
 * （:2205 shouldFilter=false）后自己排——用「标题是否以前缀开头」这一条稳定判据，
 * 不引评分库，行为可预测）。
 */
function byRelevance<T>(rows: T[], text: (r: T) => string, query: string): T[] {
  const q = query.trim().toLocaleLowerCase();
  if (q.length === 0) return rows;
  const rank = (r: T): number => {
    const t = text(r).toLocaleLowerCase();
    if (t.startsWith(q)) return 0;
    const first = t.indexOf(q);
    return first === -1 ? 2 : 1;
  };
  return [...rows].sort((a, b) => rank(a) - rank(b));
}

export function buildPaletteView(input: PaletteInput): PaletteView {
  const parsed = parseScopedQuery(input.rawQuery);
  const scope = parsed.explicitScope ? parsed.scope : input.scope;
  const query = parsed.query;
  const hasQuery = query.trim().length > 0;

  const showActions = scope === "all" || scope === "commands";
  const showCommands = scope === "all" || scope === "commands";
  const showSessions = scope === "all" || scope === "sessions";

  const matchedActions = byRelevance(
    input.actions.filter((a) => matchesQuery(actionHaystack(a), query)),
    actionHaystack,
    query,
  );
  const matchedCommands = byRelevance(
    input.commands.filter((c) => matchesQuery(commandHaystack(c), query)),
    commandHaystack,
    query,
  ).slice(0, COMMAND_LIMIT);
  const loaded = input.sessions.filter((s) => s.loaded);
  const unloaded = input.sessions.filter((s) => !s.loaded);
  // 已加载优先（点了就能切），其余按最近变更倒序（抄 ZCode 的 sortBy:"updated"）
  const byRecency = (list: PaletteSession[]): PaletteSession[] =>
    [...list].sort((a, b) => (b.at ?? 0) - (a.at ?? 0) || a.sessionId.localeCompare(b.sessionId));
  const orderedSessions = [...byRecency(loaded), ...byRecency(unloaded)];
  const matchedSessions = byRelevance(
    orderedSessions.filter((s) => matchesQuery(sessionHaystack(s), query)),
    sessionHaystack,
    query,
  );

  const groups: PaletteGroup[] = [];
  const collapse = (key: string, rows: PaletteRow[], total: number): PaletteRow[] =>
    scope !== "all" || input.expanded.has(key) || !hasQuery ? rows : rows.slice(0, COLLAPSED_LIMIT);

  // 无查询时先给「最近会话」（抄 :2600 default 分支的顺序：最近变更 → 最近任务 → 命令）
  if (showSessions && !hasQuery) {
    const recent = byRecency(matchedSessions.filter((s) => !s.active)).slice(0, RECENT_LIMIT);
    if (recent.length > 0) {
      groups.push({
        key: "recent",
        heading: SECTION_LABEL.recent,
        rows: recent.map((s) => ({ kind: "session" as const, key: s.key, session: s })),
        total: matchedSessions.length,
      });
    }
  }
  if (showSessions && (hasQuery || scope === "sessions")) {
    const rows = matchedSessions.map((s) => ({ kind: "session" as const, key: s.key, session: s }));
    if (rows.length > 0) groups.push({ key: "sessions", heading: tr("会话"), rows: collapse("sessions", rows, rows.length), total: rows.length });
  }
  if (showActions) {
    for (const section of ACTION_SECTIONS) {
      const rows = matchedActions
        .filter((a) => a.section === section)
        .map((a) => ({ kind: "action" as const, key: "action:" + a.id, action: a }));
      if (rows.length === 0) continue;
      groups.push({ key: section, heading: SECTION_LABEL[section], rows, total: rows.length });
    }
  }
  if (showCommands) {
    const rows = matchedCommands.map((c) => ({ kind: "command" as const, key: "command:" + c.name, command: c }));
    if (rows.length > 0) {
      groups.push({ key: "kernel", heading: SECTION_LABEL.kernel, rows: collapse("kernel", rows, rows.length), total: rows.length });
    }
  }

  const flat = groups.flatMap((g) => g.rows.filter((r) => (r.kind === "action" ? !r.action.disabled : true)));
  return { scope, explicitScope: parsed.explicitScope, query, groups, flat, empty: flat.length === 0 };
}

/** ↑↓ 环形步进（抄 :2751 stepFindIndex 的环形语义；cmdk 的 loop 也是环形）。 */
export function stepIndex(count: number, index: number, delta: number): number {
  if (count <= 0) return 0;
  return ((index + delta) % count + count) % count;
}
