/**
 * useHotkeys —— 全局键位钩子（住在 ui/：features 不准碰 window，dep-guard）。
 *
 * 服务两类键位：
 *   1. **模态快捷键**：审批卡 1-9 选择 / Esc 取消（裸键，输入框内一律忽略）。
 *   2. **mod 组合键**：⌘K 面板 / ⌘N 新会话 / ⌘B 侧栏 / ⌘⌥B 辅助 pane /
 *      ⌘⇧[ ⌘⇧] 上下会话（照 ZCode useGlobalQuickPickShortcuts 的键位表，
 *      QuickPick.tsx:3011-3080）。组合键在输入框内**也要生效**——⌘K 在 composer
 *      里按不出来就等于没有。
 *
 * 键名口径：map 的键是 "mod+k" / "mod+shift+[" / "mod+alt+b" 这类描述符。
 * 标点键用 e.code 归一（⌘⇧[ 的 e.key 是 "{"，按 key 匹配会永远打不中）。
 * 输入框内的按键一律忽略（target 是 textarea/input/select 或 isComposing），
 * 否则在 composer 里打数字会误触审批——那比没有快捷键更糟。
 */
import { useContext, useEffect } from "react";
import { KeyboardScopeContext } from "./keyboardScope.ts";

export type HotkeyMap = Record<string, (e: KeyboardEvent) => void>;

/** e.code → 描述符里的字符（只收我们用到的标点，其余落回 e.key）。 */
const CODE_TO_KEY: Record<string, string> = {
  BracketLeft: "[",
  BracketRight: "]",
  Minus: "-",
  Equal: "=",
};

/**
 * 由事件生成候选描述符，**最具体的在前**（mod+shift+alt+x → mod+alt+x → mod+shift+x → mod+x）。
 * 返回空数组表示「不是 mod 组合键」。
 */
export function modDescriptors(e: KeyboardEvent): string[] {
  if (!(e.metaKey || e.ctrlKey) || e.repeat) return [];
  // macOS Option+B reports "∫" in key; shortcut identity still comes from KeyB.
  const base = e.altKey && /^Key[A-Z]$/.test(e.code) ? e.code.slice(3).toLowerCase() : CODE_TO_KEY[e.code] ?? e.key.toLowerCase();
  const out: string[] = [];
  if (e.altKey && e.shiftKey) out.push("mod+shift+alt+" + base);
  if (e.shiftKey) out.push("mod+shift+" + base);
  if (e.altKey) out.push("mod+alt+" + base);
  out.push("mod+" + base);
  return out;
}

function isTypingTarget(e: KeyboardEvent): boolean {
  const t = e.target;
  if (t === null || typeof t !== "object") return false;
  const tag = (t as { tagName?: unknown }).tagName;
  if (tag === "TEXTAREA" || tag === "INPUT" || tag === "SELECT") return true;
  return (t as { isContentEditable?: unknown }).isContentEditable === true;
}

export function useHotkeys(map: HotkeyMap): void {
  const enabled = useContext(KeyboardScopeContext);
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.repeat || e.isComposing) return;
      // mod 组合键优先：命中最具体的描述符就执行并吃掉事件
      const descriptors = modDescriptors(e);
      if (descriptors.length > 0) {
        for (const d of descriptors) {
          const handler = map[d];
          if (handler !== undefined) {
            e.preventDefault();
            handler(e);
            return;
          }
        }
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTypingTarget(e)) return;
      const h = map[e.key];
      if (h !== undefined) h(e);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [map,enabled]);
}
