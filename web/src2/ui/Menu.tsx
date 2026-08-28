// Menu 原语：下拉与右键共用。调用方自管 open 状态与触发器；
// 本组件只负责浮层列表、外点关闭、Escape 关闭。

import { useEffect, useRef, type ReactNode } from "react";
import "./ui.css";

export interface MenuItemDef {
  label: string;
  hint?: string;
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export type MenuEntry = MenuItemDef | "sep";

export function Menu({
  open,
  onClose,
  items,
  anchor,
  head,
}: {
  open: boolean;
  onClose: () => void;
  items: MenuEntry[];
  /** 触发器右下角对齐用 {x,y}；右键用光标坐标 */
  anchor: { x: number; y: number };
  head?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // 视口内钳制（菜单不越界）
  useEffect(() => {
    const el = ref.current;
    if (!el || !open) return;
    const rect = el.getBoundingClientRect();
    const pad = 8;
    let x = anchor.x;
    let y = anchor.y;
    if (x + rect.width > window.innerWidth - pad) x = window.innerWidth - rect.width - pad;
    if (y + rect.height > window.innerHeight - pad) y = window.innerHeight - rect.height - pad;
    el.style.left = `${Math.max(pad, x)}px`;
    el.style.top = `${Math.max(pad, y)}px`;
  }, [open, anchor.x, anchor.y]);

  if (!open) return null;

  return (
    <>
      <div
        style={{ position: "fixed", inset: 0, zIndex: 55 }}
        onMouseDown={onClose}
        onContextMenu={(e) => {
          e.preventDefault();
          onClose();
        }}
      />
      <div ref={ref} className="ui-menu" data-slot="menu" style={{ left: anchor.x, top: anchor.y }}>
        {head && <div className="ui-menu__head">{head}</div>}
        {items.map((item, i) =>
          item === "sep" ? (
            <div key={i} className="ui-menu__sep" />
          ) : (
            <button
              key={i}
              className="ui-menu__item"
              data-danger={item.danger ? "true" : undefined}
              disabled={item.disabled}
              onClick={() => {
                onClose();
                item.onClick?.();
              }}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.hint && <span className="ui-menu__hint">{item.hint}</span>}
            </button>
          ),
        )}
      </div>
    </>
  );
}
