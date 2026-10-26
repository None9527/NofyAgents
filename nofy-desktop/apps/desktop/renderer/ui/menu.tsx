import { createPortal } from "react-dom";
import { menuPosition } from "./menuPosition.ts";
/** Shared viewport menu. UI owns DOM positioning and portals; features only provide items/actions. */
import { useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { IconCheck, IconChevronDown } from "./icons.tsx";

/** Lift a menu into the top layer and close presses the underlay cannot see. */
export function bindMenuLayer(pop: HTMLElement, trigger: EventTarget | null, close: () => void, onPromoteFailed?: () => void): () => void {
  let promoted = false;
  if (pop.hasAttribute("popover")) {
    try {
      if (!pop.matches(":popover-open")) pop.showPopover();
      promoted = true;
    } catch {
      pop.removeAttribute("popover");
      onPromoteFailed?.();
    }
  }
  const onPointerDown = (event: PointerEvent) => {
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (pop.contains(target) || (trigger instanceof Node && trigger.contains(target))) return;
    if (target instanceof Element && target.closest(".menu__pop, .menu__trigger, .browserchrome__anchor")) {
      close();
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    close();
  };
  document.addEventListener("pointerdown", onPointerDown, true);
  return () => {
    document.removeEventListener("pointerdown", onPointerDown, true);
    if (!promoted || !pop.isConnected) return;
    try {
      if (pop.matches(":popover-open")) pop.hidePopover();
    } catch {
      /* The node can already be closing. */
    }
  };
}

export type MenuItem = {
  id: string;
  /** ReactNode：活壳「+」菜单行内嵌 kbd 芯片（使用 @ / 使用 $），纯字符串不够。 */
  label: ReactNode;
  hint?: string;
  selected?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  separatorBefore?: boolean;
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
  const [popoverOk, setPopoverOk] = useState(true);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLSpanElement>(null);
  const [position, setPosition] = useState<ReturnType<typeof menuPosition> | null>(null);
  const close = (focus = false) => { setOpen(false); setPosition(null); if (focus) triggerRef.current?.focus(); };
  const closeRef = useRef(close);
  closeRef.current = close;
  useLayoutEffect(() => { if (!open) setPopoverOk(true); }, [open]);
  useLayoutEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current, pop = popRef.current;
    if (!trigger || !pop) return;
    const releaseLayer = bindMenuLayer(pop, trigger, () => closeRef.current(), () => setPopoverOk(false));
    const place = () => {
      const box = trigger.getBoundingClientRect(), bounds = pop.getBoundingClientRect();
      const next = menuPosition(box, bounds.width, pop.scrollHeight + 2, { width: window.innerWidth, height: window.innerHeight }, up, align);
      setPosition(previous => previous && previous.left === next.left && previous.top === next.top && previous.maxHeight === next.maxHeight ? previous : next);
    };
    place();
    const observer = new ResizeObserver(place); observer.observe(pop);
    let parent: HTMLElement | null = trigger;
    for (let i = 0; parent && i < 4; i++, parent = parent.parentElement) observer.observe(parent);
    window.addEventListener("resize", place); document.addEventListener("scroll", place, true);
    return () => { releaseLayer(); observer.disconnect(); window.removeEventListener("resize", place); document.removeEventListener("scroll", place, true); };
  }, [open, up, align]);
  const positioned = position !== null;
  useLayoutEffect(() => { if (open && positioned) popRef.current?.querySelector<HTMLButtonElement>("button[role=menuitem]:not(:disabled)")?.focus(); }, [open, positioned]);
  const keys = (event: import("react").KeyboardEvent) => {
    if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); close(true); return; }
    if (event.key === "Tab") { close(); return; }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault(); event.stopPropagation();
    const buttons = Array.from(popRef.current?.querySelectorAll<HTMLButtonElement>("button[role=menuitem]:not(:disabled)") ?? []);
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + buttons.length) % buttons.length;
    buttons[next]?.focus();
  };
  const triggerCls =
    "menu__trigger menu__trigger--" +
    variant +
    (open && variant.startsWith("icon") ? " menu__trigger--open" : "");
  return (
    <span className="menu">
      <button
        ref={triggerRef}
        type="button"
        className={triggerCls}
        disabled={disabled}
        title={title}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Escape") close(true);
          if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); setOpen(true); }
        }}
      >
        {trigger}
        {chevron ? <IconChevronDown size={12} className="menu__chev" /> : null}
      </button>
      {open ? createPortal(
        <>
          <span className="menu__overlay" onClick={() => close()} />
          <span className={"menu__pop menu__pop--" + align + (up ? " menu__pop--up" : "")} ref={popRef} role="menu" popover={popoverOk ? "manual" : undefined} onKeyDown={keys} style={{ left: position?.left ?? 0, top: position?.top ?? 0, maxHeight: position?.maxHeight, visibility: position ? "visible" : "hidden" }}>
            {items.map((it) => (
              <button
                key={it.id}
                type="button"
                role="menuitem"
              disabled={it.disabled === true}
              className={"menu__item" + (it.selected === true ? " menu__item--on" : "") + (it.separatorBefore ? " menu__item--section" : "")}
              onClick={() => {
                  close(true);
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
      , triggerRef.current?.closest("dialog[open]") ?? document.body) : null}
    </span>
  );
}
