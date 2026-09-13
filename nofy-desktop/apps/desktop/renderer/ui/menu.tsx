/**
 * MenuButton —— 自定义弹层菜单，替掉原生 <select>。
 *
 * 存在理由（uiux 工艺批 1）：macOS 原生 select 的弹出层无法样式化，
 * 是「demo 感」的第二来源；活壳的模型/推理档/模式都是自绘弹层（带勾选与 hint）。
 *
 * 实现刻意不用 portal / 不用 document API（dep-guard：features 与 ui 组件层
 * 不碰 window/document 的例外只给 prefs/theme 两个持久化模块）：
 * 关层靠一个 fixed 透明 overlay 的 onClick 与 Esc 键——纯 JSX + useState。
 */
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { IconCheck, IconChevronDown } from "./icons.tsx";

export type MenuItem = {
  id: string;
  /** ReactNode：活壳「+」菜单行内嵌 kbd 芯片（使用 @ / 使用 $），纯字符串不够。 */
  label: ReactNode;
  hint?: string;
  selected?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
};

export type MenuButtonProps = {
  /** 触发器内容（图标/文字）。chevron 由本组件补。 */
  trigger: ReactNode;
  items: MenuItem[];
  onPick: (id: string) => void;
  align?: "left" | "right";
  title?: string;
  /**
   * 触发器样式：chip（composer 工具条那种带边框胶囊）、plain（无装饰，只有内容）、
   * icon（28×28 图标按钮，与 .iconbtn 同规格）、icon-sm（24×24，侧栏 tabs 行右侧）、
   * icon-lg（32×32，侧栏页脚用）。
   * 活壳实测三档：卡片头右簇与侧栏叠层 28×28、tabs 行右侧 24×24、侧栏页脚 32×32。
   */
  variant?: "chip" | "plain" | "icon" | "icon-sm" | "icon-lg";
  disabled?: boolean;
  /**
   * 触发器右侧那枚下拉箭头。默认有（chip 语义就是「这是个下拉」）；
   * 图标按钮要关掉——⋯ / ⚙ / ? 已经自明「点了出菜单」，再挂一枚 chevron 就挤了。
   */
  chevron?: boolean;
  /**
   * 弹层往上开。贴窗口底的触发器（侧栏页脚）必须开这个，
   * 否则菜单会画到窗口外面去——那是「点了没反应」的一种伪装。
   */
  up?: boolean;
};

export function MenuButton({
  trigger,
  items,
  onPick,
  align = "right",
  title,
  variant = "chip",
  disabled = false,
  chevron = true,
  up = false,
}: MenuButtonProps) {
  const [open, setOpen] = useState(false);
  /**
   * 开层时把焦点交给 overlay（tabIndex=-1 的透明层）：Esc 才能在**焦点位于别处**
   * （比如 composer 输入框）时也关层——否则「菜单开着、Esc 没反应」又是一枚假按钮。
   * 关层后 overlay 卸载，焦点自然落回 body，与原先停在触发器上等价。
   */
  const overlayRef = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    if (open) overlayRef.current?.focus();
  }, [open]);
  const triggerCls =
    "menu__trigger menu__trigger--" +
    variant +
    (open && variant.startsWith("icon") ? " menu__trigger--open" : "");
  return (
    <span className="menu">
      <button
        type="button"
        className={triggerCls}
        disabled={disabled}
        title={title}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
      >
        {trigger}
        {chevron ? <IconChevronDown size={12} className="menu__chev" /> : null}
      </button>
      {open ? (
        <>
          <span
            className="menu__overlay"
            ref={overlayRef}
            tabIndex={-1}
            onClick={() => setOpen(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
            }}
          />
          <span className={"menu__pop menu__pop--" + align + (up ? " menu__pop--up" : "")} role="menu">
            {items.map((it) => (
              <button
                key={it.id}
                type="button"
                role="menuitem"
              disabled={it.disabled === true}
              className={"menu__item" + (it.selected === true ? " menu__item--on" : "")}
              onClick={() => {
                  setOpen(false);
                  if (it.disabled !== true) onPick(it.id);
                }}
              >
                {it.icon ?? <span className="menu__item-icon" />}
                <span className="menu__label">{it.label}</span>
                {it.hint !== undefined ? <span className="menu__hint">{it.hint}</span> : null}
                {it.selected === true ? <IconCheck size={13} className="menu__check" /> : null}
              </button>
            ))}
          </span>
        </>
      ) : null}
    </span>
  );
}
