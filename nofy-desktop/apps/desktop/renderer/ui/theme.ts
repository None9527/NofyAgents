import { tr } from "./i18n.ts";
/**
 * 主题切换 —— 只是往 <html> 上挂一个 class。
 *
 * 两个作用域 = 活壳 ZCode 3.11.2 **实际出厂**挂的两套（实机 html class 实测）：
 *   暗 = "dark theme-zai-dark"，亮 = "theme-zai-light"（另加 platform-mac-desktop）。
 *   出厂 base（:root / .dark）只是 zai 的底层，活壳从不单独用 ⇒ 我们也不单独暴露。
 *
 * 之所以是「挂 class」而不是「运行时注入变量」：令牌已经在 tokens.css 里按作用域
 * 分好组，浏览器自己的层叠就是最省事的主题引擎，我们不需要再造一个。
 */
import { applyFontSize, loadFontSize } from "./appearancePrefs.ts";

export type ThemeName = "light" | "dark" | "system";

export type Theme = { id: ThemeName; label: string; className: string; dark: boolean };

export const THEMES: readonly Theme[] = [
  { id: "system", get label() { return tr("跟随系统"); }, className: "", dark: false },
  { id: "dark", get label() { return tr("深色"); }, className: "dark theme-zai-dark", dark: true },
  { id: "light", get label() { return tr("浅色"); }, className: "theme-zai-light", dark: false },
] as const;

export const DEFAULT_THEME: ThemeName = "dark";

const STORAGE_KEY = "nofy-desktop:theme";

let stopSystemTheme: (() => void) | null = null;
export function applyTheme(name: ThemeName): Theme {
  stopSystemTheme?.();
  stopSystemTheme = null;
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const resolve = () => THEMES.find(t => t.id === (name === "system" ? media.matches ? "dark" : "light" : name)) ?? THEMES[1]!;
  const apply = () => {
    const theme = resolve();
    const mac = /Mac/.test(navigator.platform || navigator.userAgent);
    document.documentElement.className = theme.className + (mac ? " platform-mac-desktop" : "");
    applyFontSize(loadFontSize());
  };
  apply();
  if (name === "system") {
    media.addEventListener("change", apply);
    stopSystemTheme = () => media.removeEventListener("change", apply);
  }
  return resolve();
}

/** 读回上次选择。读不到/坏值一律落回默认，不抛（首屏不该因为 localStorage 挂掉）。 */
export function loadTheme(): ThemeName {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return DEFAULT_THEME;
    return THEMES.some((t) => t.id === raw) ? (raw as ThemeName) : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function saveTheme(name: ThemeName): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, name);
  } catch {
    /* 隐私模式/配额满：主题记不住不影响使用 */
  }
}

/* ═══════════════ 终端的视觉参数（生态面 #3） ═══════════════
 *
 * 活壳 3.11.2 CDP 实测（zcode-live-metrics.md §1.6）。xterm 把 options.fontSize/fontFamily
 * 注进它自己生成的那条规则：
 *   .xterm-dom-renderer-owner-N .xterm-rows { font-family: <终端专用 mono 栈>; font-size: 13px; … }
 * 所以这两个值只能从运行时量，量到就照抄（UI 层的度量抄录，来源记档）：
 *   13px，且字体栈**不是** --font-mono（那是 Tailwind 默认栈，带 Liberation Mono/Courier New），
 *   是活壳自己的一条终端栈（SF Mono / Cascadia Mono / JetBrains Mono / MesloLGS NF / Hack Nerd Font /
 *   Noto Sans Mono CJK SC）。两者混用会让终端与代码块字形不一致，故分开存。
 */
export const TERMINAL_FONT_SIZE = 13;
export const TERMINAL_FONT_FAMILY =
  'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, "Cascadia Mono", "JetBrains Mono", "MesloLGS NF", "Hack Nerd Font", "Noto Sans Mono CJK SC", monospace';

export type TerminalPalette = { background: string; foreground: string; cursor: string };

/**
 * 终端配色：**读主题解析后的颜色**，不写死 hex（写死 hex 的静态表在换主题时会与
 * dock 背景差一层，看起来像终端「浮」在面板上）。
 *
 * 为什么读 computed 值而不是 getPropertyValue('--color-background')：令牌值可能是
 * oklab()/oklch()（--color-border 就是 oklab），xterm 的颜色解析器不认；浏览器算过的
 * rgb() 一定认。四个主题因此自动跟随，加主题不用改这里。
 *
 * @param el dock 的根元素（传它而不是 body：dock 背景才是终端该匹配的那一层）。
 *   features 不准碰 document ⇒ 这个读法住 ui/，组件把自己的 ref 递进来。
 */
export function resolveTerminalPalette(el: HTMLElement | null): TerminalPalette {
  const target = el ?? document.body;
  const cs = getComputedStyle(target);
  const background = cs.backgroundColor;
  const foreground = cs.color;
  return { background, foreground, cursor: foreground };
}

/** Subscribe to actual DOM theme changes, including OS color-scheme flips. */
export function observeThemeChanges(listener: () => void): () => void {
  const observer = new MutationObserver(listener);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}
