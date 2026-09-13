/**
 * DiffChip —— 对话区右上的浮动汇总条（活壳实测：rounded-2xl 边框 chip，
 * file-diff 图标 + 「更改」 + +N(text-diff-added) −M(text-diff-removed)，h-32）。
 *
 * 活壳里它点开侧边面板的审查 tab；我们点开辅助 pane 的「审查」标签。
 * 数据来自 App 轮询的 git/status（与 ReviewPane 同一份，不重复请求）。
 * 工作区干净时**不渲染**——空 chip 比没有更吵。
 */
import { IconFileDiff } from "../../ui/icons.tsx";
import type { GitStatus } from "../../ui/readers.ts";

export type DiffChipProps = {
  git: GitStatus | null;
  onOpen: () => void;
};

export function DiffChip({ git, onOpen }: DiffChipProps) {
  if (git === null) return null;
  const all = [...git.staged, ...git.unstaged];
  if (all.length === 0) return null;
  let add = 0;
  let del = 0;
  for (const c of all) {
    add += c.additions;
    del += c.deletions;
  }
  return (
    <button
      type="button"
      className="diffchip"
      onClick={onOpen}
      title={
        "打开审查面板：工作区 ↔ HEAD（" +
        (git.branch ?? "?") +
        "@" +
        (git.commit ?? "").slice(0, 7) +
        "，" +
        String(all.length) +
        " 个文件）"
      }
    >
      <IconFileDiff size={16} />
      <span className="diffchip__label">更改</span>
      <span className="diffadd">+{String(add)}</span>
      <span className="diffdel">−{String(del)}</span>
    </button>
  );
}
