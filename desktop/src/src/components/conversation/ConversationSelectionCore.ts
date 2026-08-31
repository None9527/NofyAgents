/**
 * 〔A1-P1-B4〕会话选择域真身（styles-CdEGpc2x.js 2683–2837，155 行逐字；R0 簇选择族属主收敛）。
 *
 * 映射（混淆 → 语义 → styles js 行）：
 *   _oe→selectionScopeKey 2687 | voe→dedupeSelectionLoad 2690 | yoe→unregisterSelectionSubscriber 2698
 *   boe→setSelectionSubscribed 2701 | xoe→hasSelectionSubscriber 2704 | Soe→onSelectionsChanged 2707
 *   Coe→registerSelectionDialogState 2710 | woe→openFirstRegisteredSelectionDialog 2716
 *   vs→notifySelectionSubscribers 2720 | ys→SELECTION_ADD_EVENT 2723 | Toe→USERSELECT_BLOCK_REGEX 2724
 *   Eoe→CONVERSATION_SELECTION_BLOCK_REGEX 2725 | Ss→selectionContentKey 2730 | Cs→listSelectionReferences 2732
 *   Doe→setSelectionReferences 2734 | ws→selectionLoadErrorOf 2738 | Ts→clearSessionSelections 2740
 *   Ooe→clearSelectionLoadError 2743 | koe→withFreshSelectionId 2745 | Aoe→selectionDedupeKey 2747
 *   joe→validateSelectionAdd 2749 | Moe→appendSelectionBlockToText 2761 | Noe→extractSelectionsFromText 2775
 *   Poe→parseSelectionBlockSafe 2781 | Es→addSelectionReference 2806 | Foe→isSelectionAddEvent 2816
 *   Ioe→selectionAddEventName 2819 | Loe→isLooseSelectionReference 2822 | Ds→isSelectionReferenceShape 2827
 *   模块态：ms→inflightSelectionLoads / hs→selectionSubscribedScopes / gs→selectionChangeListeners / _s→selectionDialogStateByScope（2683–2686）
 *   xi→generateUuid（src-HCld2afU cx 8710；树真身 lib/uuid.ts，经 modules/SrcSharedB 回导出；短链直连）
 *
 * 环安全：纯 TS 叶（无 React 依赖），运行期边仅 modules/SrcSharedB（uuid）→ 单向 DAG。
 * 消费面：ConversationPaneCore（R0 九符直连）；未来 Composer 选择 UI 族（Cs/woe/Noe/Moe 等）回取本叶。
 * 逐字证明：/tmp/a1r0-p1/r4-roundtrip.js（逆改名+缝逆归一 ≡ bundle 2683–2837）。
 * 型缝：A1/A2 机械缝 + TS7006 位置驱动 : any 参数缝（S16 类，日志 r4-seam-log.txt）；var→const 树风格缝。
 */
import { generateUuid } from '../../modules/SrcSharedB';

const inflightSelectionLoads = new Map(),
  selectionSubscribedScopes = new Set(),
  selectionChangeListeners = new Set<any>(),
  selectionDialogStateByScope = new Map();
export function selectionScopeKey(e: any, t: any) {
  return `${e}\0${t}`;
}
export async function dedupeSelectionLoad(e: any, t: any) {
  let n = inflightSelectionLoads.get(e);
  if (n) return n;
  let r = t().finally(() => {
    (inflightSelectionLoads.get(e) === r && inflightSelectionLoads.delete(e), notifySelectionSubscribers());
  });
  return (inflightSelectionLoads.set(e, r), r);
}
export function unregisterSelectionSubscriber(e: any) {
  selectionSubscribedScopes.delete(e) && notifySelectionSubscribers();
}
export function setSelectionSubscribed(e: any, t: any) {
  (t ? !selectionSubscribedScopes.has(e) : selectionSubscribedScopes.has(e)) && (t ? selectionSubscribedScopes.add(e) : selectionSubscribedScopes.delete(e), notifySelectionSubscribers());
}
export function hasSelectionSubscriber(e: any) {
  return selectionSubscribedScopes.has(e);
}
export function onSelectionsChanged(e: any) {
  return (selectionChangeListeners.add(e), () => selectionChangeListeners.delete(e));
}
export function registerSelectionDialogState(e: any, t: any, n: any) {
  let r = Symbol(e),
    i = selectionDialogStateByScope.get(e) ?? new Map();
  return (
    i.set(r, { focused: n, open: t }),
    selectionDialogStateByScope.set(e, i),
    () => {
      let t = selectionDialogStateByScope.get(e);
      (t?.delete(r), t?.size === 0 && selectionDialogStateByScope.delete(e));
    }
  );
}
export function openFirstRegisteredSelectionDialog(e: any) {
  let t = selectionDialogStateByScope.get(e);
  if (!t?.size) return !1;
  let n = Array.from(t.values()) as any[],
    r = n.find((e) => e.focused) ?? n[0];
  return r ? (r.open(), !0) : !1;
}
function notifySelectionSubscribers() {
  for (let e of selectionChangeListeners) e();
}
export const SELECTION_ADD_EVENT = `zcode:conversation-selection-add`,
  USERSELECT_BLOCK_REGEX = /(?:\n\n)?# userselect:\n```userselect\n([\s\S]*?)\n```\s*$/,
  CONVERSATION_SELECTION_BLOCK_REGEX =
    /(?:\n\n)?# Conversation selections:\n```zcode-conversation-selections\n([\s\S]*?)\n```\s*$/,
  selectionReferencesByScope = new Map(),
  selectionLoadErrorByScope = new Map();
function selectionContentKey(e: any, t: any) {
  return `${t}\0${e ?? `__draft__`}`;
}
export function listSelectionReferences(e: any, t: any) {
  return selectionReferencesByScope.get(selectionContentKey(e, t)) ?? [];
}
export function setSelectionReferences(e: any, t: any, n: any) {
  let r = selectionContentKey(e, t);
  (n.length > 0 ? selectionReferencesByScope.set(r, n) : selectionReferencesByScope.delete(r), selectionLoadErrorByScope.delete(r));
}
export function selectionLoadErrorOf(e: any, t: any) {
  return selectionLoadErrorByScope.get(selectionContentKey(e, t)) ?? null;
}
export function clearSessionSelections(e: any, t: any) {
  (selectionReferencesByScope.delete(selectionContentKey(e, t)), selectionLoadErrorByScope.delete(selectionContentKey(e, t)));
}
export function clearSelectionLoadError(e: any, t: any) {
  selectionLoadErrorByScope.delete(selectionContentKey(e, t));
}
export function withFreshSelectionId(e: any) {
  return { ...e, id: generateUuid() };
}
function selectionDedupeKey(e: any) {
  return [e.sourceSessionId, e.sourceRowId, e.contentType, e.text].join(`\0`);
}
export function validateSelectionAdd(e: any, t: any) {
  if (t.text.length > 8e3) return { ok: !1, reason: `single` };
  let n = selectionDedupeKey(t);
  return e.some((e: any) => selectionDedupeKey(e) === n)
    ? { ok: !0, references: e, duplicate: !0 }
    : e.length >= 8
      ? { ok: !1, reason: `count` }
      : e.reduce((e: any, t: any) => e + t.text.length, 0) + t.text.length > 16e3
        ? { ok: !1, reason: `total` }
        : { ok: !0, references: [...e, t], duplicate: !1 };
}
export function appendSelectionBlockToText(e: any, t: any) {
  if (t.length === 0) return e;
  let n = [
    `# userselect:`,
    "```userselect",
    JSON.stringify(t.map(({ text: e }: any) => ({ text: e }))),
    "```",
  ].join(`
`);
  return e ? `${e}\n\n${n}` : n;
}
export function extractSelectionsFromText(e: any) {
  let t = e.match(USERSELECT_BLOCK_REGEX);
  if (t) return parseSelectionBlockSafe(e, t, (e: any) => (isLooseSelectionReference(e) ? { text: e.text } : null));
  let n = e.match(CONVERSATION_SELECTION_BLOCK_REGEX);
  return n ? parseSelectionBlockSafe(e, n, (e: any) => (isSelectionReferenceShape(e) ? e : null)) : { visibleContent: e, references: [] };
}
function parseSelectionBlockSafe(e: any, t: any, n: any) {
  try {
    let r = JSON.parse(t[1] ?? `[]`);
    if (!Array.isArray(r)) throw Error(`selection block is not an array`);
    let i = [];
    for (let e of r) {
      let t = n(e);
      if (!t) throw Error(`invalid selection reference`);
      i.push(t);
    }
    return { visibleContent: e.slice(0, t.index).trimEnd(), references: i };
  } catch {
    return { visibleContent: e, references: [] };
  }
}
export function addSelectionReference(e: any) {
  let t = validateSelectionAdd(listSelectionReferences(e.targetSessionId, e.workspaceKey), e.reference);
  return (
    t.ok
      ? setSelectionReferences(e.targetSessionId, e.workspaceKey, t.references)
      : selectionLoadErrorByScope.set(selectionContentKey(e.targetSessionId, e.workspaceKey), t.reason),
    window.dispatchEvent(new CustomEvent(SELECTION_ADD_EVENT, { detail: { ...e, result: t } })),
    t
  );
}
export function isSelectionAddEvent(e: any) {
  return e.type === SELECTION_ADD_EVENT && e instanceof CustomEvent;
}
export function selectionAddEventName() {
  return SELECTION_ADD_EVENT;
}
export function isLooseSelectionReference(e: any) {
  return !e || typeof e != `object` || Array.isArray(e)
    ? !1
    : typeof e.text == `string` && Object.keys(e).every((e) => e === `text`);
}
export function isSelectionReferenceShape(e: any) {
  if (!e || typeof e != `object`) return !1;
  let t = e;
  return (
    typeof t.id == `string` &&
    typeof t.sourceSessionId == `string` &&
    typeof t.sourceRowId == `number` &&
    typeof t.text == `string` &&
    [`user`, `assistant`, `reasoning`, `tool`].includes(t.contentType ?? ``)
  );
}
