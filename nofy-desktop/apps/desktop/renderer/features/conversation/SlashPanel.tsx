import { tr } from "../../ui/i18n.ts";
import { useLocale } from "../../ui/useLocale.ts";
/**
 * SlashPanel —— composer 上方的斜杠命令面板（分组列表）。
 *
 * 活壳对照：它的斜杠面板分 commands / skills / subagents 三段、带分组标题与
 * 空态文案（逆向 Composer.tsx:2399-2451 chat.slash.* 的 i18n 键）。我们内核的
 * available_commands_update 只区分「内置命令（无 _meta）/ 技能（有 _meta.scope）」，
 * 故两段；subagents 不是斜杠命令面，不造假第三段。
 *
 * 键盘在 Composer 的 textarea 上统一接管（↑↓/Tab/Enter/Esc），面板行**不可聚焦**：
 * onMouseDown preventDefault 保证鼠标点行不抢输入框焦点（点了还能接着打参数）。
 * 展平索引跨组连续，与 slashModel.slashStep 的回绕口径一致。
 */
import type { CommandInfo } from "../../ui/readers.ts";
import type { SlashView } from "./slashModel.ts";

export type SlashPanelProps = {
  view: SlashView;
  activeIndex: number;
  onHover: (index: number) => void;
  onPick: (name: string) => void;
};

export function SlashPanel({ view, activeIndex, onHover, onPick }: SlashPanelProps) {
  useLocale();
  let cursor = -1;
  return (
    <div className="slash" role="listbox" aria-label={tr("斜杠命令")}>
      {view.groups.map((g) => (
        <div key={g.id} className="slash__group">
          <div className="slash__grouptitle">{g.label}</div>
          {g.rows.map((row) => {
            cursor += 1;
            const idx = cursor;
            return (
              <div
                key={row.name}
                role="option"
                aria-selected={idx === activeIndex}
                className={"slash__row" + (idx === activeIndex ? " slash__row--on" : "")}
                onMouseEnter={() => onHover(idx)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onPick(row.name)}
              >
                <span className="slash__name">/{row.name}</span>
                {row.description !== null ? <span className="slash__desc">{row.description}</span> : null}
                {row.hint !== null ? <span className="slash__hint">{row.hint}</span> : null}
              </div>
            );
          })}
        </div>
      ))}
      {view.hidden > 0 ? (
        <div className="slash__foot">{tr("还有")}{String(view.hidden)}{tr("条命中 · ⌘K 看全表")}</div>
      ) : null}
    </div>
  );
}

/** 供 Composer 计算展平索引的纯助手（与渲染顺序严格一致）。 */
export function slashFlatIndex(groups: Array<{ rows: CommandInfo[] }>, name: string): number {
  let i = -1;
  for (const g of groups) {
    for (const row of g.rows) {
      i += 1;
      if (row.name === name) return i;
    }
  }
  return -1;
}
