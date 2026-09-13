/**
 * 键位表 ↔ 绑定的**双向对账门**。
 *
 * 帮助菜单里的键位文案（hotkeys-help.ts）与真正注册绑定的地方（App.tsx 的 hotkeyMap）
 * 是两处代码。任何一处单独改，结果都是「帮助里写的键按了没反应」或「能按的键帮助里
 * 没写」——这两种都是用户最先发现的失信。所以这里读 App.tsx 源码文本双向对账。
 *
 * 为什么读源码文本而不是 import App.tsx：node --test 的类型剥离**不转 JSX**，
 * .tsx import 不动；而且我们要对账的正是「源码里写了哪些 hotkeyMap[...] 赋值」。
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { HOTKEY_HELP } from "../renderer/features/shell/hotkeys-help.ts";

const src = readFileSync(new URL("../renderer/features/shell/App.tsx", import.meta.url), "utf8");

/** App.tsx 里所有字面量注册的键（hotkeyMap["mod+k"] = …）。 */
function registeredKeys(): Set<string> {
  const out = new Set<string>();
  for (const m of src.matchAll(/hotkeyMap\["([^"]+)"\]\s*=/g)) {
    const k = m[1];
    if (k !== undefined) out.add(k);
  }
  return out;
}

test("表里每条 binding 都在 App.tsx 注册过（帮助里不许写按了没反应的键）", () => {
  const reg = registeredKeys();
  assert.ok(reg.size >= 7, "对账前提：至少抓到 7 条字面量绑定，实际 " + String(reg.size) + "（正则失效会静默通过）");
  for (const h of HOTKEY_HELP) {
    if (h.binding === null) continue;
    assert.ok(reg.has(h.binding), "帮助里写了 " + h.binding + "，但 App.tsx 没注册");
  }
});

test("App.tsx 里每个 mod 组合键都在表里（能按的键必须写出来）", () => {
  const listed = new Set(HOTKEY_HELP.map((h) => h.binding).filter((b): b is string => b !== null));
  for (const k of registeredKeys()) {
    if (!k.startsWith("mod")) continue; // Escape 与数字键是审批模态的局部键，合并写在「1 – 9」那一行
    assert.ok(listed.has(k), "App.tsx 注册了 " + k + "，但键位表没写");
  }
});

test("审批模态的数字键与 Esc 在表里有说明（它们不是 window 级绑定）", () => {
  const row = HOTKEY_HELP.find((h) => h.binding === null);
  assert.ok(row !== undefined, "至少要有一行说明非 window 级键位");
  assert.match(row.label, /1/);
  assert.match(row.what, /Esc/);
});

test("表内不重复、不留空文案（重复行会让菜单看起来像 bug）", () => {
  const labels = HOTKEY_HELP.map((h) => h.label);
  const bindings = HOTKEY_HELP.map((h) => h.binding).filter((b) => b !== null);
  assert.equal(new Set(labels).size, labels.length, "label 重复");
  assert.equal(new Set(bindings).size, bindings.length, "binding 重复");
  for (const h of HOTKEY_HELP) {
    assert.ok(h.label.trim().length > 0, "有空 label");
    assert.ok(h.what.trim().length > 0, "有空说明：" + h.label);
  }
});
