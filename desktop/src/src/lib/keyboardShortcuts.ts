/* ============================================================================
 * keyboardShortcuts —— 快捷键标签/匹配 vendored chunk 全量逐字转录〔A1-R124〕
 * 原 chunk：out/renderer/assets/keyboardShortcuts-BGHopxr9.js（2,126 字节，自足无依赖）。
 * chunk 导出面：{ t as a, f as c, c as i, d as l, a as n, h as o, l as r, m as s, o as t, u }
 * styles chunk import 面（868 行）：a as Lre / c as Rre / i as Zi / l as Qi / n as $i /
 *   o as zre / r as Bre / s as ea / t as Vre / u as ta（十导出全消费）。
 * 一符一家：树内六文件九枚 declare（shortcutLabel ×6 + ctrlAltShortcutLabel +
 *   shortcutLabelVariant + shortcutMatches）收敛至本文件。
 * 本地变量保留束名；顶层语义名 + 原码注记（ImeComposition/stores-taskStore 判例）。
 * ==========================================================================*/

/** 快捷键平台环境快照（原 e）。 */
export interface ShortcutPlatformEnv {
  platform?: string;
  userAgent?: string;
}

/** 原 e：取平台/UA 快照（navigator 缺失返回空对象）。 */
function shortcutEnv(): ShortcutPlatformEnv {
  return typeof navigator > "u"
    ? {}
    : { platform: navigator.platform, userAgent: navigator.userAgent };
}

/** 原 t（导出 a / Lre）：Mac 系平台判定（platform 或 UA 命中）。 */
export function isMacLikePlatform(env: ShortcutPlatformEnv = shortcutEnv()): boolean {
  let n = env.platform?.toLowerCase() ?? "",
    r = env.userAgent ?? "";
  return n.includes("mac") || n.includes("iphone") || n.includes("ipad") || n.includes("ipod")
    ? true
    : /Mac|iPhone|iPad|iPod/.test(r);
}

/** 原 n：主修饰键标签（Mac ⌘ / 余 Ctrl）。 */
function primaryModLabel(env?: ShortcutPlatformEnv): string {
  return isMacLikePlatform(env) ? "⌘" : "Ctrl";
}

/** 原 r：Ctrl 键标签（Mac ⌃ / 余 Ctrl）。 */
function ctrlModLabel(env?: ShortcutPlatformEnv): string {
  return isMacLikePlatform(env) ? "⌃" : "Ctrl";
}

/** 原 i：空格连接（Mac 形标签用）。 */
function joinParts(...e: string[]): string {
  return e.join(" ");
}

/** 原 s：按键展示面（[ ] 原样，余大写）。 */
function displayKey(e: string): string {
  switch (e) {
    case "[":
      return "[";
    case "]":
      return "]";
    default:
      return e.toUpperCase();
  }
}

/** 原 a（导出 n / $i）：快捷键文案——`shortcutLabel("N")` → “⌘ N”（Mac）/ “Ctrl+N”。 */
export function shortcutLabel(e: string, r?: ShortcutPlatformEnv): string {
  let a = primaryModLabel(r);
  return isMacLikePlatform(r) ? joinParts(a, displayKey(e)) : `${a}+${e.toUpperCase()}`;
}

/** 原 o（导出 t / Vre）：Ctrl+Alt 文案——Mac “⌥ ⌘ B” / 余 “Ctrl+Alt+B”。 */
export function ctrlAltShortcutLabel(e: string, r?: ShortcutPlatformEnv): string {
  let a = isMacLikePlatform(r),
    o = primaryModLabel(r);
  return a ? joinParts("⌥", o, displayKey(e)) : `Ctrl+Alt+${e.toUpperCase()}`;
}

/** 原 c（导出 i / Zi）：Ctrl 文案（⌃ 面）——Mac “⌃ M” / 余 “Ctrl+M”。 */
export function ctrlShortcutLabel(e: string, n?: ShortcutPlatformEnv): string {
  let a = ctrlModLabel(n);
  return isMacLikePlatform(n) ? joinParts(a, displayKey(e)) : `${a}+${e.toUpperCase()}`;
}

/** 原 l（导出 r / Bre）：Ctrl+Shift 文案——Mac “⇧ ⌃ B” / 余 “Ctrl+Shift+B”（重建名 shortcutLabelVariant 之 canonical）。 */
export function ctrlShiftShortcutLabel(e: string, n?: ShortcutPlatformEnv): string {
  let a = ctrlModLabel(n),
    o = displayKey(e);
  return isMacLikePlatform(n) ? joinParts("⇧", a, o) : `${a}+Shift+${o}`;
}

/** 原 p：主修饰键激活判定（Mac metaKey 独占 / 余 ctrlKey 独占）。 */
function modKeyActive(e: { ctrlKey: boolean; metaKey: boolean }, n?: ShortcutPlatformEnv): boolean {
  return isMacLikePlatform(n) ? e.metaKey && !e.ctrlKey : e.ctrlKey && !e.metaKey;
}

/** 原 g：按键命中（key 忽略大小写，单字符回退 code 映射）。 */
function keyMatches(e: { key: string; code?: string }, t: string): boolean {
  let n = t.toLowerCase();
  if (e.key.toLowerCase() === n) return true;
  let r = keyCodeOf(n);
  return r != null && e.code === r;
}

/** 原 _：单字符 → DOM code 映射（字母/数字/方括号，余 null）。 */
function keyCodeOf(e: string): string | null {
  if (e.length === 1) {
    let t = e.toLowerCase();
    if (t >= "a" && t <= "z") return `Key${t.toUpperCase()}`;
    if (t >= "0" && t <= "9") return `Digit${t}`;
  }
  switch (e) {
    case "[":
      return "BracketLeft";
    case "]":
      return "BracketRight";
    default:
      return null;
  }
}

/** 匹配事件面（原 u/d/f/m/h 共用形）。 */
export interface ShortcutMatchEvent {
  key: string;
  code?: string;
  shiftKey: boolean;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
}

/** 原 u（导出 u / ta）：无修饰主键匹配（⏎ = 无修饰回车）。 */
export function shortcutMatches(e: ShortcutMatchEvent, t: string, n?: ShortcutPlatformEnv): boolean {
  return modKeyActive(e, n) && !e.shiftKey && !e.altKey && keyMatches(e, t);
}

/** 原 d（导出 l / Qi）：Shift 变体匹配。 */
export function shiftShortcutMatches(e: ShortcutMatchEvent, t: string, n?: ShortcutPlatformEnv): boolean {
  return modKeyActive(e, n) && e.shiftKey && !e.altKey && keyMatches(e, t);
}

/** 原 f（导出 c / Rre）：Alt 变体匹配。 */
export function altShortcutMatches(e: ShortcutMatchEvent, t: string, n?: ShortcutPlatformEnv): boolean {
  return modKeyActive(e, n) && !e.shiftKey && e.altKey && keyMatches(e, t);
}

/** 原 m（导出 s / ea）：裸 Ctrl 匹配（无 Shift/Alt）。 */
export function ctrlOnlyShortcutMatches(e: ShortcutMatchEvent, t: string): boolean {
  return e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey && keyMatches(e, t);
}

/** 原 h（导出 o / zre）：Ctrl+Shift 匹配。 */
export function ctrlShiftShortcutMatches(e: ShortcutMatchEvent, t: string): boolean {
  return e.ctrlKey && !e.metaKey && e.shiftKey && !e.altKey && keyMatches(e, t);
}
