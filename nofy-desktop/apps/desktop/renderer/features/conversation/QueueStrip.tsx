/**
 * QueueStrip —— 排队中的消息条（composer 上方）。
 *
 * ## 位置依据（活壳 CDP 实测）
 *
 * 活壳的侧栏底部是 h-56 的页脚（账号卡 + 移动端远控 + 设置），**没有**「任务/队列」段；
 * 排队消息出现在 chat-composer-region 里（在那儿取到 plus / x 两枚 h-4 w-4 图标，
 * 正是「排队条目 + 撤销」）。我们此前把队列放在侧栏底部，是旧四区语法的遗留，
 * 本轮随大布局一起搬回 composer 上方。
 *
 * ## 只读
 *
 * queue/* 是**通知族**（内核推队列快照，见 docs/contract/session-events-measured.md）。
 * 撤销一条排队消息的写路径未实测 ⇒ 条目上不画 ✕：放假按钮比不放更坏
 * （uiux-reference.md §1 的既有约定）。title 里写明来源与这个限制。
 */
import { preview } from "../../ui/readers.ts";

export function QueueStrip({ entries }: { entries: unknown[] }) {
  if (entries.length === 0) return null;
  return (
    <div className="queue" title="queue 通知族推来的排队条目（只读：撤销写路径未实测）">
      <span className="queue__label">排队 {String(entries.length)}</span>
      {entries.map((e, i) => (
        <span className="queue__chip" key={String(i)} title={preview(e, 400)}>
          {preview(e, 64)}
        </span>
      ))}
    </div>
  );
}
