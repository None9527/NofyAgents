import { createPortal } from "react-dom";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { menuPosition } from "./menuPosition.ts";
import { bindMenuLayer } from "./menu.tsx";
import { Dialog } from "./dialog.tsx";
import { TextInput } from "./forms.tsx";
import { Btn } from "./primitives.tsx";
import { PaneIconButton } from "./workbench.tsx";
import { IconChevronRight, IconEllipsis, IconExtensions, IconExternal, IconEyeOff, IconRefresh, IconX } from "./icons.tsx";
import { tr } from "./i18n.ts";
import { useLocale } from "./useLocale.ts";

export type BrowserChromeDevice = "off" | "phone" | "tablet" | "laptop";
export type BrowserChromeDownload = { id: string; filename: string; state: "progressing" | "completed" | "cancelled" | "interrupted"; received: number; total: number; openable: boolean };
export type BrowserChromeExtension = { id: string; name: string; version: string };
export type BrowserChromeRecent = { url: string; title: string };
export type BrowserChromeNote =
  | null
  | { kind: "saved" | "store" | "cleared" | "empty-import" }
  | { kind: "imported"; count: number }
  | { kind: "error"; code: string };
export type BrowserChromeDialog = "history" | "downloads" | "settings" | "clear" | "extensions" | null;

export type BrowserChromeState = {
  pageReady: boolean;
  menu: "options" | "extensions" | null;
  setMenu: (menu: "options" | "extensions" | null) => void;
  extensionsHidden: boolean;
  zoomLabel: string;
  device: BrowserChromeDevice;
  extensions: BrowserChromeExtension[];
  downloads: BrowserChromeDownload[];
  history: BrowserChromeRecent[];
  dialog: BrowserChromeDialog;
  note: BrowserChromeNote;
  findOpen: boolean;
  query: string;
  find: { active: number; matches: number } | null;
  setQuery: (query: string) => void;
  openFind: () => void;
  closeFind: () => void;
  findStep: (forward: boolean) => void;
  zoom: (direction: "in" | "out" | "reset") => void;
  setDevicePreset: (preset: BrowserChromeDevice) => void;
  printPage: () => void;
  capture: () => void;
  importCookies: () => void;
  openDownloads: () => void;
  openHistory: () => void;
  openClear: () => void;
  confirmClear: () => void;
  openSettings: () => void;
  openExtensions: () => void;
  hideExtensions: () => void;
  showExtensions: () => void;
  openStore: () => void;
  loadExtension: () => void;
  removeExtension: (id: string) => void;
  openDownload: (id: string) => void;
  clearHistory: () => void;
  openRecent: (url: string) => void;
  closeDialog: () => void;
};

const DEVICES: { id: BrowserChromeDevice; label: string }[] = [
  { id: "off", label: "关闭设备模拟" },
  { id: "phone", label: "手机" },
  { id: "tablet", label: "平板" },
  { id: "laptop", label: "笔记本" },
];

function noteText(note: BrowserChromeNote): string | null {
  if (!note) return null;
  if (note.kind === "saved") return tr("截图已保存。");
  if (note.kind === "store") return tr("已在系统浏览器打开网上应用商店。扩展不会安装到这个窗口。");
  if (note.kind === "cleared") return tr("已清除浏览数据。");
  if (note.kind === "imported") return tr("已导入 {0} 条 Cookie。密码不会保存在这个浏览器里。", [note.count]);
  if (note.kind === "empty-import") return tr("没有可导入的 Cookie。密码不会保存在这个浏览器里。");
  if (note.kind !== "error") return null;
  if (note.code === "empty") return tr("先打开一个页面");
  if (note.code === "cookie-file") return tr("Cookie 文件无法读取。");
  if (note.code === "extension") return tr("扩展没有加载。请选择包含 manifest.json 的未打包目录。");
  if (note.code === "download") return tr("文件还不可用");
  return tr("操作没有完成");
}

function downloadState(state: BrowserChromeDownload["state"]): string {
  if (state === "progressing") return tr("下载中");
  if (state === "completed") return tr("已完成");
  if (state === "cancelled") return tr("已取消");
  return tr("已中断");
}

export function BrowserChromeButtons({ state }: { state: BrowserChromeState }) {
  useLocale();
  const extensionsRef = useRef<HTMLSpanElement>(null);
  const optionsRef = useRef<HTMLSpanElement>(null);
  return <>
    {state.extensionsHidden ? null : <span className="browserchrome__anchor" ref={extensionsRef}><PaneIconButton aria-label={tr("扩展程序")} title={tr("扩展程序")} aria-haspopup="menu" aria-expanded={state.menu === "extensions"} onClick={() => state.setMenu(state.menu === "extensions" ? null : "extensions")}><IconExtensions size={16} /></PaneIconButton></span>}
    <span className="browserchrome__anchor" ref={optionsRef}><PaneIconButton aria-label={tr("浏览器选项")} title={tr("浏览器选项")} aria-haspopup="menu" aria-expanded={state.menu === "options"} onClick={() => state.setMenu(state.menu === "options" ? null : "options")}><IconEllipsis size={16} /></PaneIconButton></span>
    <ChromeMenu open={state.menu === "extensions"} label={tr("扩展程序")} anchor={extensionsRef} onClose={() => state.setMenu(null)}>
      <ExtensionsMenu state={state} />
    </ChromeMenu>
    <ChromeMenu open={state.menu === "options"} label={tr("浏览器选项")} anchor={optionsRef} onClose={() => state.setMenu(null)}>
      <OptionsMenu state={state} />
    </ChromeMenu>
  </>;
}

export function BrowserChromeFind({ state }: { state: BrowserChromeState }) {
  useLocale();
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.findOpen) form.current?.querySelector("input")?.focus(); }, [state.findOpen]);
  if (!state.findOpen) return null;
  const matches = state.find?.matches ?? 0;
  const active = state.find?.active ?? 0;
  return <form ref={form} className="browserpane__find" role="search" onSubmit={event => { event.preventDefault(); state.findStep(true); }}>
    <TextInput role="searchbox" aria-label={tr("在页面中查找")} placeholder={tr("查找")} value={state.query} spellCheck={false} onChange={event => state.setQuery(event.target.value)} onKeyDown={event => {
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); state.closeFind(); }
      if (event.key === "Enter") { event.preventDefault(); state.findStep(!event.shiftKey); }
    }} />
    <span className="browserpane__find-count" data-find-count={matches}>{matches === 0 ? tr("无匹配") : tr("{0}/{1}", [active, matches])}</span>
    <PaneIconButton aria-label={tr("上一个匹配")} title={tr("上一个匹配")} disabled={!state.pageReady || !state.query.trim()} onClick={() => state.findStep(false)}><IconChevronRight size={14} className="browserchrome__back" /></PaneIconButton>
    <PaneIconButton aria-label={tr("下一个匹配")} title={tr("下一个匹配")} disabled={!state.pageReady || !state.query.trim()} onClick={() => state.findStep(true)}><IconChevronRight size={14} /></PaneIconButton>
    <PaneIconButton aria-label={tr("关闭查找")} title={tr("关闭查找")} onClick={state.closeFind}><IconX size={14} /></PaneIconButton>
  </form>;
}

export function BrowserChromeNote({ state }: { state: BrowserChromeState }) {
  useLocale();
  const text = noteText(state.note);
  return text ? <p className="browserpane__note" role="status">{text}</p> : null;
}

export function BrowserChromeDialogs({ state }: { state: BrowserChromeState }) {
  useLocale();
  return <>
    <Dialog open={state.dialog === "history"} title={tr("历史记录")} onClose={state.closeDialog} footer={<Btn onClick={state.clearHistory} disabled={state.history.length === 0}>{tr("清除访问记录")}</Btn>}>
      {state.history.length === 0 ? <p className="browserchrome__hint">{tr("还没有访问记录")}</p> : <ul className="browserchrome__list">{state.history.map(item => <li key={item.url}><button type="button" onClick={() => state.openRecent(item.url)}><span>{item.title}</span><small>{item.url}</small></button></li>)}</ul>}
    </Dialog>
    <Dialog open={state.dialog === "downloads"} title={tr("下载")} onClose={state.closeDialog}>
      {state.downloads.length === 0 ? <p className="browserchrome__hint">{tr("没有下载")}</p> : <ul className="browserchrome__list">{state.downloads.map(item => <li key={item.id}><button type="button" disabled={!item.openable} onClick={() => state.openDownload(item.id)}><span>{item.filename}</span><small>{downloadState(item.state)}</small></button></li>)}</ul>}
    </Dialog>
    <Dialog open={state.dialog === "extensions"} title={tr("管理扩展程序")} onClose={state.closeDialog} footer={<Btn onClick={state.loadExtension}>{tr("加载未打包的扩展…")}</Btn>}>
      {state.extensions.length === 0 ? <p className="browserchrome__hint">{tr("未安装扩展程序")}</p> : <ul className="browserchrome__list">{state.extensions.map(item => <li key={item.id}><span><span>{item.name}</span><small>{item.version}</small></span><Btn onClick={() => state.removeExtension(item.id)}>{tr("移除")}</Btn></li>)}</ul>}
      <p className="browserchrome__hint">{tr("扩展从本机未打包目录加载。网上应用商店不会把扩展装进这个窗口。")}</p>
    </Dialog>
    <Dialog open={state.dialog === "settings"} title={tr("浏览器设置")} onClose={state.closeDialog} footer={<Btn onClick={state.openClear}>{tr("清除浏览数据")}</Btn>}>
      <ZoomRow state={state} />
      <label className="browserchrome__check"><input type="checkbox" checked={!state.extensionsHidden} onChange={event => event.target.checked ? state.showExtensions() : state.hideExtensions()} />{tr("在工具栏显示扩展程序")}</label>
      <p className="browserchrome__hint">{tr("这个浏览器不保存密码，也不提供自动填充。")}</p>
      <p className="browserchrome__hint">{tr("扩展从本机未打包目录加载。网上应用商店不会把扩展装进这个窗口。")}</p>
    </Dialog>
    <Dialog open={state.dialog === "clear"} title={tr("清除浏览数据")} onClose={state.closeDialog} footer={<><Btn onClick={state.closeDialog}>{tr("取消")}</Btn><Btn variant="danger" onClick={state.confirmClear}>{tr("确认清除")}</Btn></>}>
      <p>{tr("清除这个应用内浏览器的缓存、Cookie 和站点数据。不会清除应用本身的数据。这里不保存密码。")}</p>
    </Dialog>
  </>;
}

function ExtensionsMenu({ state }: { state: BrowserChromeState }) {
  return <>
    <p className="browserchrome__ext-head">{tr("扩展程序 ({0})", [state.extensions.length])}</p>
    {state.extensions.length === 0 ? <p className="browserchrome__hint">{tr("未安装扩展程序")}</p> : <ul className="browserchrome__ext-list">{state.extensions.map(item => <li key={item.id}>{item.name}</li>)}</ul>}
    <Item label={tr("管理扩展程序")} section onClick={state.openExtensions} />
    <Item label={tr("访问网上应用商店")} hint={<IconExternal size={13} />} onClick={state.openStore} />
    <Item label={tr("从工具栏中隐藏")} hint={<IconEyeOff size={13} />} onClick={state.hideExtensions} />
  </>;
}

function OptionsMenu({ state }: { state: BrowserChromeState }) {
  const [deviceOpen, setDeviceOpen] = useState(false);
  useEffect(() => { if (state.menu !== "options") setDeviceOpen(false); }, [state.menu]);
  return <>
    {state.extensionsHidden ? <Item label={tr("显示扩展程序")} onClick={state.showExtensions} /> : null}
    <Item label={tr("在页面中查找")} disabled={!state.pageReady} onClick={state.openFind} />
    <Item label={tr("打印")} disabled={!state.pageReady} onClick={state.printPage} />
    <ZoomRow state={state} />
    <Item label={tr("Device toolbar")} section hint={<IconChevronRight size={13} />} onClick={() => setDeviceOpen(open => !open)} />
    {deviceOpen ? DEVICES.map(item => <button key={item.id} type="button" role="menuitemradio" aria-checked={state.device === item.id} className="menu__item browserchrome__sub" onClick={() => state.setDevicePreset(item.id)}><span className="menu__item-icon" />{tr(item.label)}</button>) : null}
    <Item label={tr("截取屏幕截图")} disabled={!state.pageReady} onClick={state.capture} />
    <Item label={tr("导入 Cookie 和密码…")} section onClick={state.importCookies} />
    <Item label={tr("下载")} section onClick={state.openDownloads} />
    <Item label={tr("历史记录")} onClick={state.openHistory} />
    <Item label={tr("清除浏览数据")} onClick={state.openClear} />
    <Item label={tr("浏览器设置")} section onClick={state.openSettings} />
  </>;
}

function ZoomRow({ state }: { state: BrowserChromeState }) {
  return <div className="browserchrome__zoom" role="group" aria-label={tr("缩放")}>
    <span>{tr("缩放")}</span>
    <span className="browserchrome__zoom-controls">
      <button type="button" aria-label={tr("缩小")} onClick={() => state.zoom("out")}>−</button>
      <span className="browserchrome__zoom-label">{state.zoomLabel}</span>
      <button type="button" aria-label={tr("放大")} onClick={() => state.zoom("in")}>+</button>
      <button type="button" aria-label={tr("重置缩放")} onClick={() => state.zoom("reset")}><IconRefresh size={13} /></button>
    </span>
  </div>;
}

function Item({ label, disabled, section, hint, onClick }: { label: string; disabled?: boolean; section?: boolean; hint?: ReactNode; onClick: () => void }) {
  return <button type="button" role="menuitem" disabled={disabled === true} className={"menu__item" + (section ? " menu__item--section" : "")} onClick={onClick}>
    <span className="menu__item-icon" />
    <span className="menu__label">{label}</span>
    {hint ? <span className="menu__hint">{hint}</span> : null}
  </button>;
}

function ChromeMenu({ open, label, anchor, onClose, children }: { open: boolean; label: string; anchor: RefObject<HTMLElement | null>; onClose: () => void; children: ReactNode }) {
  const pop = useRef<HTMLSpanElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  const [position, setPosition] = useState<ReturnType<typeof menuPosition> | null>(null);
  const [popoverOk, setPopoverOk] = useState(true);
  useLayoutEffect(() => { if (!open) setPopoverOk(true); }, [open]);
  useLayoutEffect(() => {
    if (!open) return;
    const trigger = anchor.current, node = pop.current;
    if (!trigger || !node) return;
    const releaseLayer = bindMenuLayer(node, trigger, () => close.current(), () => setPopoverOk(false));
    const place = () => {
      if (!trigger.isConnected) { close.current(); return; }
      const next = menuPosition(trigger.getBoundingClientRect(), node.getBoundingClientRect().width, node.scrollHeight + 2, { width: window.innerWidth, height: window.innerHeight }, false, "right");
      setPosition(previous => previous && previous.left === next.left && previous.top === next.top && previous.maxHeight === next.maxHeight ? previous : next);
    };
    const observer = new ResizeObserver(place);
    observer.observe(node);
    window.addEventListener("resize", place);
    document.addEventListener("scroll", place, true);
    const keys = (event: KeyboardEvent) => { if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); close.current(); trigger.querySelector("button")?.focus(); } };
    document.addEventListener("keydown", keys, true);
    place();
    return () => {
      releaseLayer();
      observer.disconnect();
      window.removeEventListener("resize", place);
      document.removeEventListener("scroll", place, true);
      document.removeEventListener("keydown", keys, true);
    };
  }, [open, anchor]);
  const focusedOpen = useRef(false);
  useLayoutEffect(() => {
    if (!open) { focusedOpen.current = false; return; }
    if (!position || focusedOpen.current) return;
    focusedOpen.current = true;
    pop.current?.querySelector<HTMLButtonElement>("button[role=menuitem]:not(:disabled)")?.focus();
  }, [open, position]);
  if (!open) return null;
  return createPortal(<>
    <span className="menu__overlay" onClick={() => close.current()} />
    <span ref={pop} role="menu" aria-label={label} popover={popoverOk ? "manual" : undefined} className="menu__pop menu__pop--right browserchrome__pop" style={{ left: position?.left ?? 0, top: position?.top ?? 0, maxHeight: position?.maxHeight, visibility: position ? "visible" : "hidden" }}>{children}</span>
  </>, anchor.current?.closest("dialog[open]") ?? document.body);
}
