import { tr } from "../../ui/i18n.ts";
import { useLocale } from "../../ui/useLocale.ts";
import { useMemo, useState } from "react";
import { Btn } from "../../ui/primitives.tsx";
import { TextInput } from "../../ui/forms.tsx";
import { IconSearch, IconChevronDown, IconX } from "../../ui/icons.tsx";
import type { Block } from "../../core/store/state.ts";
import { findInConversation } from "./findModel.ts";
export function ConversationFind({ blocks, onJump, onClose }: { blocks: Block[]; onJump: (blockId: string) => void; onClose: () => void }) {
  useLocale();
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(-1);
  const matches = useMemo(() => findInConversation(blocks, query), [blocks, query]);
  const next = (direction: number) => {
    if (!matches.length) return;
    const selected = index < 0 ? (direction > 0 ? 0 : matches.length - 1) : (index + direction + matches.length) % matches.length;
    setIndex(selected);
    const hit = matches[selected];
    if (hit) onJump(hit.blockId);
  };
  return <div role="search" aria-label={tr("查找已加载会话")} className="conversation-find">
    <IconSearch size={14} />
    <TextInput autoFocus placeholder={tr("查找会话…")} aria-label={tr("查找已加载内容")} value={query} onChange={e => { setQuery(e.target.value); setIndex(-1); }} onKeyDown={e => { if (e.key === "Escape") { e.stopPropagation(); onClose(); } if (e.key === "Enter") { e.preventDefault(); next(e.shiftKey ? -1 : 1); } }} />
    <span className="conversation-find__count" aria-live="polite">{matches.length ? `${Math.min(index + 1, matches.length)} / ${matches.length}` : query ? tr("无匹配") : ""}</span>
    <Btn variant="ghost" size="icon" aria-label={tr("上一处")} title={tr("上一处")} disabled={!matches.length} onClick={() => next(-1)}><IconChevronDown size={14} className="conversation-find__previous" /></Btn>
    <Btn variant="ghost" size="icon" aria-label={tr("下一处")} title={tr("下一处")} disabled={!matches.length} onClick={() => next(1)}><IconChevronDown size={14} /></Btn>
    <Btn variant="ghost" size="icon" aria-label={tr("关闭")} title={tr("关闭")} onClick={onClose}><IconX size={14} /></Btn>
  </div>;
}
