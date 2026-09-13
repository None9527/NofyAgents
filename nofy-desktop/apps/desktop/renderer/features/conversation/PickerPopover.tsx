/**
 * PickerPopover —— composer 上方的选列浮层（@ 与 $ 两族共用壳）。
 *
 * 查询住在**草稿的触发 token** 里（"@xxx" / "$xxx"），键盘由 composer 的 textarea
 * 统一接管（↑↓/Tab/Enter/Esc）；本组件只画行与高亮，不含输入框、不含状态。
 * 行不可聚焦：onMouseDown preventDefault，点了焦点仍留在输入框（接着打参数）。
 *
 * 数据源由 Composer 按模式给：@ 族 = _nofy/search/fuzzy 的 status 推送；
 * $ 族 = available_commands_update 里 scope!=null 的本地过滤。
 * 「添加附件」不走这里——它弹系统选文件框（props.pickFiles，2026-09-13 裁定）。
 */
export type PickerRow = { key: string; label: string; sub: string | null };

export type PickerPopoverProps = {
  ready: boolean;
  rows: PickerRow[];
  activeIndex: number;
  onHover: (index: number) => void;
  onPick: (index: number) => void;
  onClose: () => void;
  loadingText: string;
  emptyText: string;
};

export function PickerPopover(props: PickerPopoverProps) {
  const { ready, rows, activeIndex, onHover, onPick, loadingText, emptyText } = props;
  return (
    <div className="pickpop" role="dialog" aria-label="选择器">
      <div className="pickpop__list" role="listbox" aria-label="候选">
        {!ready ? (
          <div className="pickpop__empty">{loadingText}</div>
        ) : rows.length === 0 ? (
          <div className="pickpop__empty">{emptyText}</div>
        ) : (
          rows.map((r, i) => (
            <div
              key={r.key}
              role="option"
              aria-selected={i === activeIndex}
              className={"pickpop__row" + (i === activeIndex ? " pickpop__row--on" : "")}
              onMouseEnter={() => onHover(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onPick(i)}
            >
              <span className="pickpop__name">{r.label}</span>
              {r.sub !== null ? <span className="pickpop__path">{r.sub}</span> : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
