/* eslint-disable */
/**
 * ============================================================================
 * FileMentionDragHelpers.ts — A1-R11：工作区文件拖拽 / 提及助手逐字重建
 * （styles-CdEGpc2x.js 52094–52271 拖拽子族；R0 簇 51141–53795 成员 6 名 + 簇内最小依赖 6 名）
 * A1-R12：提及解析/构造簇 + 落点侧解析/匹配全量收编（52091–52271 余量 20 名，
 * 一次收口 Composer §17/§18 declares；详见文件尾 A1-R12 收编段）
 * ============================================================================
 *
 * 来源文件（只读真身）：desktop/src/out/renderer/assets/styles-CdEGpc2x.js
 *
 * ----------------------------------------------------------------------------
 * 混淆名 → 语义名 映射表（bundle 行号）
 * ----------------------------------------------------------------------------
 *   xj → escapeMarkdownLinkLabel          (52094)  链接标签转义（wj/Dj 依赖）
 *   Sj → escapeBlockquoteText             (52097)  尖括号/反斜杠转义（wj/Dj 依赖）
 *   Cj → toRelativeMentionPath            (52111)  相对提及路径前缀（wj 依赖）
 *   GHe → normalizeDragEntryPath          (52120)  目录尾斜杠归一（wj 依赖）
 *   wj → buildFileTreeDragText            (52124)  ★簇成员（FileTreePanel 1703 消费）
 *   Dj → pluginMentionMarkdown            (52138)  ★簇成员（PluginLeaves 1746 / Composer 2998 消费）
 *   kj → FILE_TREE_DRAG_MIME              (52210)  ★簇成员（FileTreePanel 1701 消费）
 *   Aj → ADD_WORKSPACE_FILE_TO_CHAT_EVENT (52211)  事件名（rUe 依赖，簇内私有）
 *   jj → WORKSPACE_FILE_DRAG_STATE_EVENT  (52212)  事件名（Pj 依赖，簇内私有）
 *   $He → serializeFileTreeDragPayload    (52216)  ★簇成员（FileTreePanel 1701 消费）
 *   Pj → setGlobalFileTreeDragging        (52257)  ★簇成员（FileTreePanel 1704/1708 消费）
 *   rUe → addFileTreeEntryToChat          (52263)  ★簇成员（FileTreePanel 1802 消费；返回布尔 = 事件未被阻止）
 *
 * ---- A1-R12 收编段（提及解析/构造簇 + 落点侧解析/匹配，20 名全量） ----
 *   yj → MENTION_LINK_REGEX               (52091)  提及链接正则（/g 有状态；splitUserInputParts 用前重置 lastIndex）
 *   bj → MENTION_TOKEN_REGEX              (52092)  纯文本提及令牌正则（/g 有状态；splitMentionTokens 用前重置）
 *   WHe → unescapeMentionBackslashes      (52100)  反斜杠转义还原（splitUserInputParts 依赖）
 *   Tj → skillMentionMarkdown             (52128)  ★R12 成员（Composer 1591/1856、SkillsSettingsSection 505 消费）
 *   Ej → subagentMentionMarkdown          (52131)  ★R12 成员（Composer 1391/1866 消费）
 *   KHe → sessionMentionMarkdown          (52134)  ★R12 成员（Composer 3096 消费）
 *   qHe → PLUGIN_MENTION_ID_PATTERN       (52141)  插件 id 模式（parsePluginMentionId 依赖）
 *   JHe → parsePluginMentionId            (52142)  plugin:// id 解析 ≤256（splitUserInputParts 依赖）
 *   YHe → formatSkillMentionLabel         (52147)  ★R12 成员（Conversation 688 消费）
 *   XHe → hasTrailingPathSeparator        (52156)  尾分隔符判定 = 目录提及（splitUserInputParts 依赖）
 *   Oj → splitMentionTokens               (52159)  纯文本令牌化（splitUserInputParts 依赖）
 *   ZHe → splitUserInputParts             (52182)  ★R12 成员（Conversation rvt 消费；111834 唯一外部调用）
 *   QHe → isNonNullObject                 (52213)  对象判定（parseWorkspaceFileDragPayload 依赖）
 *   eUe → parseWorkspaceFileDragPayload   (52219)  拖拽载荷 JSON 解析（readWorkspaceFilePayload 依赖）
 *   Mj → readWorkspaceFilePayload         (52248)  ★R12 成员（Composer 5003、Home parseAddToChatPayload 消费）
 *   Nj → hasWorkspaceFilePayload          (52251)  ★R12 成员（Composer 4657/4986 消费）
 *   tUe → isWorkspaceFileDragEvent        (52254)  ★R12 成员（Composer 4653 消费；型缝谓词见注）
 *   nUe → isAddWorkspaceFileToChatEvent   (52260)  ★R12 成员（Home 2945 消费；与 GitReview yXe@68430 code-comment 域事件不同）
 *   iUe → isSameWorkspacePayload          (52268)  同工作区匹配（buildWorkspaceFileMentionPayload 依赖）
 *   aUe → buildWorkspaceFileMentionPayload (52271) ★R12 成员（Composer applyWorkspaceFileMentionDrop 消费；66812 唯一外部调用）
 *
 * ----------------------------------------------------------------------------
 * 边界裁决（A1-R11 留批 → A1-R12 全量收编）
 * ----------------------------------------------------------------------------
 *   yj/bj 正则 + WHe/Oj/ZHe 提及解析器（52091–52093/52100–52110/52159–52209）、
 *   Tj/Ej/KHe 兄弟提及构造器（52128/52131/52134）、qHe/JHe/YHe/XHe 插件 id 解析
 *   （52141–52156）、QHe/eUe/Mj/Nj/tUe/nUe/iUe/aUe 落点侧解析/匹配（52213–52271 余量）
 *   ——A1-R12 全量转录于本文件尾段（映射表见下 R12 段）；消费面 = Composer §17/§18、
 *   Conversation 用户输入富文本、Home 添加到聊天、SkillsSettingsSection skill-creator。
 *
 * 环安全：纯函数叶子，零 import；code-viewer/settings/modules 反向引入无环。
 * ============================================================================
 */

/** 原 xj（52094）：Markdown 链接标签转义 */
function escapeMarkdownLinkLabel(e: string): string {
  return e.replaceAll(`\\`, `\\\\`).replaceAll(`[`, `\\[`).replaceAll(`]`, `\\]`);
}

/** 原 Sj（52097）：链接目标转义（反斜杠 + 尖括号） */
function escapeBlockquoteText(e: string): string {
  return e.replaceAll(`\\`, `\\\\`).replaceAll(`>`, `\\>`);
}

/** 原 Cj（52111）：相对提及路径前缀（绝对/锚点/协议路径原样） */
function toRelativeMentionPath(e: string): string {
  return e.startsWith(`/`) ||
    e.startsWith(`./`) ||
    e.startsWith(`../`) ||
    e.startsWith(`#`) ||
    /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(e)
    ? e
    : `./${e}`;
}

/** 原 GHe（52120）：拖拽路径归一（目录去重尾斜杠后补单一斜杠） */
function normalizeDragEntryPath(e: string, t: string): string {
  let n = e.trim();
  return t === `directory` ? `${n.replace(/[\\/]+$/, ``)}/` : n;
}

/** 原 wj（52124）：文件树拖拽 Markdown 文本 */
export function buildFileTreeDragText(e: string, t: string, n: string = `file`): string {
  let r = normalizeDragEntryPath(e, n);
  return `[${escapeMarkdownLinkLabel(t)}](${escapeBlockquoteText(toRelativeMentionPath(r))})`;
}

/** 原 Dj（52138）：插件提及 Markdown */
export function pluginMentionMarkdown(e: string, t: string): string {
  return `[${escapeMarkdownLinkLabel(`@${e}`)}](plugin://${escapeBlockquoteText(t)})`;
}

/** 原 kj/Aj/jj（52210–52212）：拖拽 MIME 与事件名常量（Aj/jj 于 A1-R12 补 export：Home/Composer 消费） */
export const FILE_TREE_DRAG_MIME = `application/x-zcode-workspace-file`;
export const ADD_WORKSPACE_FILE_TO_CHAT_EVENT = `zcode:add-workspace-file-to-chat`;
export const WORKSPACE_FILE_DRAG_STATE_EVENT = `zcode:workspace-file-drag-state`;

/** 原 $He（52216）：拖拽载荷序列化 */
export function serializeFileTreeDragPayload(e: unknown): string {
  return JSON.stringify(e);
}

/** 原 Pj（52257）：全局拖拽状态广播（无 window 环境静默） */
export function setGlobalFileTreeDragging(e: boolean): void {
  typeof window > `u` || window.dispatchEvent(new CustomEvent(WORKSPACE_FILE_DRAG_STATE_EVENT, { detail: { dragging: e } }));
}

/** 原 rUe（52263）：文件条目加入聊天（可取消自定义事件；返回 true = 未被监听方阻止） */
export function addFileTreeEntryToChat(e: unknown): boolean {
  if (typeof window > `u`) return !1;
  let t = new CustomEvent(ADD_WORKSPACE_FILE_TO_CHAT_EVENT, { cancelable: !0, detail: e });
  return !window.dispatchEvent(t);
}

/* ============================================================================
 * A1-R12 收编段：提及解析/构造簇 + 落点侧解析/匹配（52091–52271 余量，20 名）
 * 环安全不变：纯函数叶子，零 import。
 * ==========================================================================*/

/** 原 yj（52091）：Markdown 提及链接正则（/g 有状态，用前重置 lastIndex） */
const MENTION_LINK_REGEX = /\[((?:\\.|[^\\\]])*)\]\((?:<((?:\\.|[^>])*?)>|((?:\\.|[^)])*))\)/g;

/** 原 bj（52092）：纯文本提及令牌正则（$ 技能 / 命令 @ 子代理 #sess_ 会话；/g 有状态） */
const MENTION_TOKEN_REGEX =
  /(^|\s)(\$[a-zA-Z0-9._-]+|\/[a-zA-Z0-9._-]+|@[a-zA-Z0-9._-]+|#sess_[a-zA-Z0-9._-]+)(?=$|\s)/g;

/** 原 WHe（52100）：反斜杠转义还原（成对消费） */
function unescapeMentionBackslashes(e: string): string {
  let t = ``;
  for (let n = 0; n < e.length; n += 1) {
    if (e[n] === `\\` && n + 1 < e.length) {
      ((t += e[n + 1]), (n += 1));
      continue;
    }
    t += e[n];
  }
  return t;
}

/** 原 Tj（52128）：技能提及 Markdown（有路径 → 链接；无路径 → 裸令牌） */
export function skillMentionMarkdown(e: string, t?: string): string {
  return t ? `[${escapeMarkdownLinkLabel(`$${e}`)}](${escapeBlockquoteText(toRelativeMentionPath(t))})` : `$${e}`;
}

/** 原 Ej（52131）：子代理提及 Markdown */
export function subagentMentionMarkdown(e: string): string {
  return `@${e}`;
}

/** 原 KHe（52134）：会话提及 Markdown（标题为空或与 taskId 相同 → 裸令牌） */
export function sessionMentionMarkdown(e: string, t?: string | null): string {
  let n = t?.trim();
  return !n || n === e ? `#${e}` : `[${escapeMarkdownLinkLabel(`#${n}`)}](#${escapeBlockquoteText(e)})`;
}

/** 原 qHe（52141）：插件提及 id 模式（name@plugin） */
const PLUGIN_MENTION_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*@[A-Za-z0-9][A-Za-z0-9._-]*$/;

/** 原 JHe（52142）：plugin:// 提及 id 解析（≤256 且模式匹配，否则 undefined） */
function parsePluginMentionId(e: string): string | undefined {
  if (!e.startsWith(`plugin://`)) return;
  let t = e.slice(9);
  return t.length <= 256 && PLUGIN_MENTION_ID_PATTERN.test(t) ? t : void 0;
}

/** 原 YHe（52147）：技能显示名美化（按 -_ 拆词首字母大写；已含空格且无 -_ 原样） */
export function formatSkillMentionLabel(e: string): string {
  let t = e.trim();
  if (!t) return e;
  if (t.includes(` `) && !t.includes(`-`) && !t.includes(`_`)) return t;
  let n = t.split(/[-_]/).filter(Boolean);
  return n.length === 0
    ? e
    : n.map((e) => e.charAt(0).toUpperCase() + e.slice(1).toLowerCase()).join(` `);
}

/** 原 XHe（52156）：尾路径分隔符判定（目录提及识别） */
function hasTrailingPathSeparator(e: string): boolean {
  return /[\\/]$/.test(e);
}

/** 提及/用户输入部件（原 ZHe 输出形状；Conversation UserInputPart 同源） */
export type MentionToken =
  | { type: `text`; text: string }
  | { type: `file`; label: string }
  | { type: `directory`; label: string }
  | { type: `skill`; label: string }
  | { type: `session`; label: string }
  | { type: `plugin`; label: string; pluginId?: string }
  | { type: `subagent`; label: string }
  | { type: `command`; label: string };

/** 原 Oj（52159）：纯文本提及令牌化 */
function splitMentionTokens(e: string): MentionToken[] {
  let t: MentionToken[] = [];
  MENTION_TOKEN_REGEX.lastIndex = 0;
  let n = 0;
  for (let r of e.matchAll(MENTION_TOKEN_REGEX)) {
    let i = r[1] ?? ``,
      a = r[2] ?? ``;
    if (!a) continue;
    let o = (r.index ?? 0) + i.length;
    (o > n && t.push({ type: `text`, text: e.slice(n, o) }),
      a.startsWith(`$`)
        ? t.push({ type: `skill`, label: a.slice(1) })
        : a.startsWith(`/`)
          ? t.push({ type: `command`, label: a.slice(1) })
          : a.startsWith(`@`)
            ? t.push({ type: `subagent`, label: a.slice(1) })
            : a.startsWith(`#`)
              ? t.push({ type: `session`, label: a.slice(1) })
              : t.push({ type: `text`, text: a }),
      (n = o + a.length));
  }
  return (n < e.length && t.push({ type: `text`, text: e.slice(n) }), t);
}

/** 原 ZHe（52182）：用户输入提及解析（链接形态 + 纯文本令牌；session/plugin/skill/directory/file） */
export function splitUserInputParts(e: string): MentionToken[] {
  let t: MentionToken[] = [];
  MENTION_LINK_REGEX.lastIndex = 0;
  let n = 0;
  for (let r of e.matchAll(MENTION_LINK_REGEX)) {
    let i = r[0] ?? ``,
      a = r[1] ? unescapeMentionBackslashes(r[1]) : ``,
      o = r[2] ?? r[3] ?? ``,
      s = r.index ?? 0;
    if ((s > n && t.push(...splitMentionTokens(e.slice(n, s))), /^#sess_[a-zA-Z0-9._-]+$/.test(o)))
      t.push({ type: `session`, label: a.startsWith(`#`) ? a.slice(1) : a });
    else if (o.startsWith(`plugin://`)) {
      let e = parsePluginMentionId(o);
      t.push({
        type: `plugin`,
        label: a.startsWith(`@`) ? a.slice(1) : a,
        ...(e ? { pluginId: e } : {}),
      });
    } else
      a.startsWith(`$`)
        ? t.push({ type: `skill`, label: a.slice(1) })
        : hasTrailingPathSeparator(o)
          ? t.push({ type: `directory`, label: a.startsWith(`@`) ? a.slice(1) : a })
          : t.push({ type: `file`, label: a.startsWith(`@`) ? a.slice(1) : a });
    n = s + i.length;
  }
  return (n < e.length && t.push(...splitMentionTokens(e.slice(n))), t);
}

/** 工作区文件拖拽载荷（原 eUe 解析输出；Composer 本地 WorkspaceFileDragPayload 同源，A1-R12 收敛于此） */
export interface WorkspaceFileDragPayload {
  type: `file` | `directory`;
  workspacePath: string;
  path: string;
  relativePath: string;
  name: string;
  workspaceIdentity?: string;
}

/** 原 QHe（52213）：非空对象判定 */
function isNonNullObject(e: unknown): boolean {
  return typeof e == `object` && !!e;
}

/** 原 eUe（52219）：拖拽载荷 JSON 解析（形状校验，失败 null） */
function parseWorkspaceFileDragPayload(e: string): WorkspaceFileDragPayload | null {
  if (!e) return null;
  try {
    let t = JSON.parse(e);
    if (!isNonNullObject(t)) return null;
    let n = t.type,
      r = t.workspacePath,
      i = t.path,
      a = t.relativePath,
      o = t.name,
      s = t.workspaceIdentity;
    return (n !== `file` && n !== `directory`) ||
      typeof r != `string` ||
      typeof i != `string` ||
      typeof a != `string` ||
      typeof o != `string`
      ? null
      : {
          type: n,
          workspacePath: r,
          path: i,
          relativePath: a,
          name: o,
          ...(typeof s == `string` && s.trim() ? { workspaceIdentity: s } : {}),
        };
  } catch {
    return null;
  }
}

/** 原 Mj（52248）：从 DataTransfer 读取工作区文件拖拽载荷 */
export function readWorkspaceFilePayload(e: DataTransfer): WorkspaceFileDragPayload | null {
  return hasWorkspaceFilePayload(e) ? parseWorkspaceFileDragPayload(e.getData(FILE_TREE_DRAG_MIME)) : null;
}

/** 原 Nj（52251）：DataTransfer 是否携带工作区文件拖拽 MIME */
export function hasWorkspaceFilePayload(e: DataTransfer): boolean {
  return Array.from(e.types).includes(FILE_TREE_DRAG_MIME);
}

/** 原 tUe（52254）：工作区拖拽状态事件守卫。型缝：谓词窄化 detail（bundle 为裸布尔），
 *  Composer 4653 消费 event.detail.dragging，沿用 Composer §18 原 declare 签名。 */
export function isWorkspaceFileDragEvent(e: Event): e is CustomEvent<{ dragging: boolean }> {
  return e.type === WORKSPACE_FILE_DRAG_STATE_EVENT;
}

/** 原 nUe（52260）：「添加到聊天」事件守卫（Home 2945 消费）。
 *  与 GitReview isAddToChatEvent（原 yXe，68430，code-comment-add-to-chat）名同域异。 */
export function isAddWorkspaceFileToChatEvent(e: Event): boolean {
  return e.type === ADD_WORKSPACE_FILE_TO_CHAT_EVENT;
}

/** 原 iUe（52268）：同工作区匹配（载荷 workspace 与落点一致 → 相对路径） */
function isSameWorkspacePayload(e: WorkspaceFileDragPayload, t: string, n?: string | null): boolean {
  return e.workspacePath === t && (e.workspaceIdentity ?? ``) === (n ?? ``);
}

/** 原 aUe（52271）：工作区文件提及构造（同工作区 → 相对路径；否则绝对路径） */
export function buildWorkspaceFileMentionPayload(
  e: WorkspaceFileDragPayload,
  t: string,
  n?: string | null,
): { value: string; markdown: string; data: Record<string, unknown> } {
  let r = isSameWorkspacePayload(e, t, n) ? e.relativePath : e.path;
  return {
    markdown: buildFileTreeDragText(r, e.name, e.type),
    value: r,
    data: { kind: e.type, path: e.path, relativePath: r },
  };
}

/* ============================================================================
 * 尾部符号表（bundle 行号）
 * ----------------------------------------------------------------------------
 *  xj 52094 | Sj 52097 | Cj 52111 | GHe 52120 | wj 52124 | Dj 52138
 *  kj 52210 | Aj 52211 | jj 52212 | $He 52216 | Pj 52257 | rUe 52263
 *  ---- A1-R12 ----
 *  yj 52091 | bj 52092 | WHe 52100 | Tj 52128 | Ej 52131 | KHe 52134
 *  qHe 52141 | JHe 52142 | YHe 52147 | XHe 52156 | Oj 52159 | ZHe 52182
 *  QHe 52213 | eUe 52219 | Mj 52248 | Nj 52251 | tUe 52254 | nUe 52260
 *  iUe 52268 | aUe 52271
 * ==========================================================================*/
