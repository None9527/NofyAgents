// A0-S4-3: 自 modules/stores-workspace.tsx §3 原样迁入（FH CodeCommentsStore；原文件现为薄 re-export shim）。
import { create as createStore } from './zustand'; // 原 Ae（skillStore chunk q 导出）
import type { UseBoundStore } from './storeTypes';

/* ============================================================================
 * 3. CodeCommentsStore（原 FH，js 68514–68579 / jsx 60720）
 * ----------------------------------------------------------------------------
 * 行级代码评论：按 `工作区键\0源路径` 桶存放。
 * state 字段表：commentsByBucketKey: Record<bucketKey, CodeComment[]>（1 个）
 * actions：getComments/addComment/removeComment/removeCommentBySource/
 *   restoreCommentFromAttachment/clearSource（6 个）
 * 消费：161208–161210（代码查看器 tHt 域）。
 * ==========================================================================*/

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

const EMPTY_COMMENTS: CodeComment[] = []; // 原 AXe

/** 原 kH：工作区键（identity 优先；68500 区） */
declare function commentsWorkspaceKey(workspacePath: string, workspaceIdentity?: string | null): string;

/** 原 PH：评论桶键 = `工作区键\0源路径` */
function commentBucketKey(target: { workspacePath: string; workspaceIdentity?: string | null; sourcePath: string }): string {
  return `${commentsWorkspaceKey(target.workspacePath, target.workspaceIdentity)}\u0000${target.sourcePath}`;
}

/** 原 vXe：附件恢复登记（会话引用侧效果；接口级） */
declare function markCommentRestoredFromAttachment(target: { id: string; workspacePath: string; workspaceIdentity?: string | null }): void;

export const useCodeCommentsStore: UseBoundStore<CodeCommentsState> = createStore<CodeCommentsState>((set, get) => ({
  commentsByBucketKey: {},
  getComments: (target) => get().commentsByBucketKey[commentBucketKey(target)] ?? EMPTY_COMMENTS,
  addComment: (target) => {
    const bucketKey = commentBucketKey(target);
    set((state) => {
      const existing = state.commentsByBucketKey[bucketKey] ?? [];
      return {
        commentsByBucketKey: {
          ...state.commentsByBucketKey,
          [bucketKey]: [...existing.filter((comment) => comment.id !== target.comment.id), target.comment],
        },
      };
    });
  },
  removeComment: (target) => {
    const bucketKey = commentBucketKey(target);
    set((state) => {
      const existing = state.commentsByBucketKey[bucketKey] ?? [];
      const next = existing.filter((comment) => comment.id !== target.id);
      return next.length === existing.length ? state : { commentsByBucketKey: { ...state.commentsByBucketKey, [bucketKey]: next } };
    });
  },
  removeCommentBySource: (target) => {
    const prefix = commentsWorkspaceKey(target.workspacePath, target.workspaceIdentity);
    set((state) => {
      let changed = false;
      const next = Object.fromEntries(
        Object.entries(state.commentsByBucketKey).map(([bucketKey, comments]) => {
          if (!bucketKey.startsWith(`${prefix}\u0000`)) return [bucketKey, comments];
          const filtered = comments.filter((comment) => comment.id !== target.id);
          changed ||= filtered.length !== comments.length;
          return [bucketKey, filtered];
        }),
      );
      return changed ? { commentsByBucketKey: next } : state;
    });
  },
  restoreCommentFromAttachment: (attachment) => {
    if (!attachment.sourcePath) return;
    markCommentRestoredFromAttachment({ id: attachment.id, workspacePath: attachment.workspacePath, workspaceIdentity: attachment.workspaceIdentity });
    get().addComment({
      workspacePath: attachment.workspacePath,
      workspaceIdentity: attachment.workspaceIdentity,
      sourcePath: attachment.sourcePath,
      comment: {
        id: attachment.id,
        sourcePath: attachment.sourcePath,
        sourceTitle: attachment.sourceTitle,
        startLine: attachment.startLine,
        endLine: attachment.endLine,
        selectedText: attachment.selectedText,
        comment: attachment.comment,
      },
    });
  },
  clearSource: (target) => {
    const bucketKey = commentBucketKey(target);
    set((state) => {
      if (!state.commentsByBucketKey[bucketKey]) return state;
      const { [bucketKey]: _removed, ...rest } = state.commentsByBucketKey;
      return { commentsByBucketKey: rest };
    });
  },
}));

