/* ============================================================================
 * codeCommentsStore.ts — 薄 re-export shim（A1-R8 双实例收敛）
 * ----------------------------------------------------------------------------
 * A0-S4-3 本文件原持并行 zustand 实例之一（自 stores-workspace §3 迁入）。
 * A1-R8 普查：bundle 唯一 FH（@68562；A0 期行号 68514 为 TXe 助手位误标）。
 * 树内四并行实例：modules/Composer.tsx（6716 区）/ components/code-viewer/
 * CodeViewer.tsx 325 / components/code-viewer/GitReview.tsx 2202 / 本文件 58。
 * 裁决：Composer 为 canonical——FH 定义区（68558–68628）转录属主（Composer
 * 尾表在案）+ 环安全唯一可行向（CodeViewer 88 行 / GitReview 215 行已 import
 * Composer；反向 Composer→CodeViewer / Composer→GitReview 皆成二环）。
 * 本文件实例实测消费面：唯一引用面为 modules/stores-workspace.tsx 65/80 行
 * import/re-export shim 链，零终端消费者（休眠；且内部 kH/vXe 两枚 declare
 * 未接线，实例本不可运行）→ 降为 shim，旧实例删除（原实现见 git 历史，
 * 检查点 153547a）。CodeViewer/GitReview 两实例同批改指（各就其位 tombstone）。
 * 导出面维系：useCodeCommentsStore + CodeComment/CodeCommentsState 两型
 * （stores-workspace.tsx 65–66 行 import 面逐一不破）。
 * 环安全：本文件 → modules/Composer；Composer 不 import 任何 stores/（实测
 * grep 零命中），不反入本文件 → 新边无成环。
 * 同型先例：stores/confirmDialogStore.ts（A1-R6）、stores/alertDialogStore.ts（A1-R7）。
 * ==========================================================================*/

export { useCodeCommentsStore } from '../modules/Composer';

export interface CodeComment {
  id: string;
  sourcePath: string;
  sourceTitle?: string;
  startLine: number;
  endLine: number;
  selectedText?: string;
  comment: string;
}

export interface CodeCommentsState {
  commentsByBucketKey: Record<string, CodeComment[]>;
  getComments(target: { workspacePath: string; workspaceIdentity?: string | null; sourcePath: string }): CodeComment[];
  addComment(target: { workspacePath: string; workspaceIdentity?: string | null; sourcePath: string; comment: CodeComment }): void;
  removeComment(target: { workspacePath: string; workspaceIdentity?: string | null; sourcePath: string; id: string }): void;
  removeCommentBySource(target: { workspacePath: string; workspaceIdentity?: string | null; id: string }): void;
  restoreCommentFromAttachment(attachment: {
    id: string;
    workspacePath: string;
    workspaceIdentity?: string | null;
    sourcePath?: string;
    sourceTitle?: string;
    startLine: number;
    endLine: number;
    selectedText?: string;
    comment: string;
  }): void;
  clearSource(target: { workspacePath: string; workspaceIdentity?: string | null; sourcePath: string }): void;
}
