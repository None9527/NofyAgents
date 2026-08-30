/* eslint-disable */
/**
 * ============================================================================
 * FileMentionDragHelpers.ts — A1-R11：工作区文件拖拽 / 提及助手逐字重建
 * （styles-CdEGpc2x.js 52094–52271 拖拽子族；R0 簇 51141–53795 成员 6 名 + 簇内最小依赖 6 名）
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
 * ----------------------------------------------------------------------------
 * 边界裁决（同区段不转录，属他簇，随属簇处置）
 * ----------------------------------------------------------------------------
 *   yj/bj 正则 + WHe/Oj/ZHe 提及解析器（52091–52093/52098–52110/52160–52209）、
 *   Tj/Ej/KHe 兄弟提及构造器（52127/52130/52133）、qHe/JHe/YHe/XHe 插件 id 解析
 *   （52141–52156）、QHe/eUe/Mj/Nj/tUe/nUe/iUe/aUe 落点侧解析/匹配（52213–52271 余量）
 *   ——普查未列本簇；消费面在 Composer/提及渲染域，留待属簇批次。
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

/** 原 kj/Aj/jj（52210–52212）：拖拽 MIME 与事件名常量 */
export const FILE_TREE_DRAG_MIME = `application/x-zcode-workspace-file`;
const ADD_WORKSPACE_FILE_TO_CHAT_EVENT = `zcode:add-workspace-file-to-chat`;
const WORKSPACE_FILE_DRAG_STATE_EVENT = `zcode:workspace-file-drag-state`;

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
 * 尾部符号表（bundle 行号）
 * ----------------------------------------------------------------------------
 *  xj 52094 | Sj 52097 | Cj 52111 | GHe 52120 | wj 52124 | Dj 52138
 *  kj 52210 | Aj 52211 | jj 52212 | $He 52216 | Pj 52257 | rUe 52263
 * ==========================================================================*/
