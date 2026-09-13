/**
 * CommandPalette —— ⌘K 命令中心（生态面 #1）。
 *
 * 解剖照 ZCode QuickPick（见 palette.ts 头注的对照表）：
 *   遮罩对话框（top 64px、max-w 32rem、圆角 2xl）
 *   → 搜索胶囊（h-8 rounded-full + 搜索图标）
 *   → 范围胶囊行（全部/命令/会话，h-6 rounded-full，active 用 --color-selected）
 *   → 分组列表（组标题 + 条目 min-h-8 rounded-xl px-2.5，图标 size-3.5，行尾小字）
 *   → 「更多结果」展开行（>3 条时；COLLAPSED_LIMIT）
 *   → 搜索历史胶囊页脚（无查询且有历史时；≤20 条，>6 条可展开）
 *
 * 纯逻辑全在 palette.ts（可单测）；本文件只管渲染、键盘与焦点。
 * 不碰 window/document（dep-guard）：关层靠 fixed overlay 的 onClick 与输入框的 Esc，
 * 与 ui/menu.tsx 同一手法；历史读写走 ui/prefs.ts（那是唯一允许碰 localStorage 的层）。
 *
 * 键位：↑↓ 环形选择（stepIndex）、Enter 执行、Esc 关闭、前缀 > / # 切范围。
 * 无障碍：listbox/option + aria-activedescendant，禁用项不进 tab 序也不进 flat 列表。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, ReactElement, ReactNode } from "react";
import { clearPaletteHistory, loadPaletteHistory, savePaletteHistory } from "../../ui/prefs.ts";
import {
  IconBoxes, IconClock, IconEdit, IconFile, IconFolder, IconGear, IconInfo, IconMark,
  IconMessage, IconPalette, IconPanelRight, IconPlus, IconSearch, IconShield, IconTerminal, IconZap,
} from "../../ui/icons.tsx";
import {
  buildPaletteView, findHighlightRanges, formatRelative, recordHistory, scopePrefix, stepIndex, workspaceLabel,
} from "./palette.ts";
import type { HistoryEntry, IconKey, PaletteAction, PaletteCommand, PaletteRow, PaletteScope, PaletteSession } from "./palette.ts";
import { SCOPE_LABEL, SCOPE_ORDER } from "./palette.ts";

const ICONS: Record<IconKey, (p: { size?: number; className?: string }) => ReactElement> = {
  plus: IconPlus, search: IconSearch, gear: IconGear, terminal: IconTerminal, panel: IconPanelRight,
  palette: IconPalette, message: IconMessage, folder: IconFolder, mark: IconMark, edit: IconEdit,
  info: IconInfo, shield: IconShield, clock: IconClock, boxes: IconBoxes, file: IconFile, zap: IconZap,
};

const SCOPE_ICON: Record<PaletteScope, IconKey> = { all: "boxes", commands: "zap", sessions: "message" };

/** 查询词高亮（抄 QuickPick :1001 HighlightedText 的行为，自写实现）。 */
function Highlight({ text, ranges }: { text: string; ranges: Array<{ start: number; end: number }> }) {
  if (ranges.length === 0) return <>{text}</>;
  const nodes: ReactNode[] = [];
  let cursor = 0;
  ranges.forEach((range, i) => {
    if (cursor < range.start) nodes.push(<span key={"p" + String(i)}>{text.slice(cursor, range.start)}</span>);
    nodes.push(<mark key={"m" + String(i)} className="palette__mark">{text.slice(range.start, range.end)}</mark>);
    cursor = range.end;
  });
  if (cursor < text.length) nodes.push(<span key="tail">{text.slice(cursor)}</span>);
  return <>{nodes}</>;
}

export type CommandPaletteProps = {
  open: boolean;
  actions: PaletteAction[];
  commands: PaletteCommand[];
  sessions: PaletteSession[];
  onClose: () => void;
  /** 选中内核命令：把 "/name " 填进 composer 草稿（命令是 slash 命令，不是客户端动作）。 */
  onPickCommand: (name: string, hint: string | null) => void;
  /** 选中会话：已加载 ⇒ 激活；未加载 ⇒ 走 session/load（App 决定）。 */
  onPickSession: (session: PaletteSession) => void;
};

export function CommandPalette(props: CommandPaletteProps) {
  const { open, actions, commands, sessions, onClose, onPickCommand, onPickSession } = props;
  const [raw, setRaw] = useState("");
  const [scope, setScope] = useState<PaletteScope>("all");
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const rowRefs = useRef(new Map<string, HTMLButtonElement | null>());

  const view = useMemo(
    () => buildPaletteView({ rawQuery: raw, scope, actions, commands, sessions, expanded }),
    [raw, scope, actions, commands, sessions, expanded],
  );

  // 打开即复位并载入历史（抄 :2255 的 open/close effect）
  useEffect(() => {
    if (!open) {
      setRaw("");
      setScope("all");
      setExpanded(new Set());
      setHistoryOpen(false);
      setIndex(0);
      return;
    }
    setHistory(loadPaletteHistory().map((e) => ({ query: e.query, scope: e.scope as PaletteScope, at: e.at })));
    setIndex(0);
  }, [open]);

  // 查询/范围一变，选择回到第一行（否则会停在一个已经不存在的行上）
  useEffect(() => {
    setIndex(0);
  }, [raw, scope]);
  useEffect(() => {
    setExpanded(new Set());
  }, [raw, scope]);

  // 选中行滚进视野（block:nearest，抄 cmdk 的滚动语义）
  useEffect(() => {
    const row = view.flat[index];
    if (row === undefined) return;
    rowRefs.current.get(row.key)?.scrollIntoView({ block: "nearest" });
  }, [index, view]);

  const commitHistory = useCallback(
    (usedScope: PaletteScope) => {
      if (raw.trim().length === 0) return;
      const next = recordHistory(history, view.query, usedScope, Date.now());
      setHistory(next);
      savePaletteHistory(next);
    },
    [history, raw, view.query],
  );

  const run = useCallback(
    (row: PaletteRow) => {
      if (row.kind === "action") {
        if (row.action.disabled === true) return;
        commitHistory(view.scope);
        onClose();
        row.action.run?.();
        return;
      }
      if (row.kind === "command") {
        commitHistory("commands");
        onClose();
        onPickCommand(row.command.name, row.command.hint);
        return;
      }
      commitHistory("sessions");
      onClose();
      onPickSession(row.session);
    },
    [commitHistory, onClose, onPickCommand, onPickSession, view.scope],
  );

  if (!open) return null;

  const onKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((i) => stepIndex(view.flat.length, i, 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((i) => stepIndex(view.flat.length, i, -1));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const row = view.flat[index];
      if (row !== undefined) run(row);
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key === "Tab") {
      // Tab 循环范围胶囊：键盘用户可以不离开输入框就换范围
      e.preventDefault();
      const at = SCOPE_ORDER.indexOf(view.scope);
      setScope(SCOPE_ORDER[(at + (e.shiftKey ? SCOPE_ORDER.length - 1 : 1)) % SCOPE_ORDER.length] ?? "all");
    }
  };

  let flatIndex = -1;

  return (
    <>
      <div className="palette__overlay" onClick={onClose} />
      <div className="palette" role="dialog" aria-modal="true" aria-label="命令中心">
        <div className="palette__head">
          <div className="palette__field">
            <IconSearch size={15} className="palette__field-icon" />
            <input
              ref={inputRef}
              autoFocus
              value={raw}
              spellCheck={false}
              autoComplete="off"
              role="combobox"
              aria-expanded={view.flat.length > 0}
              aria-controls="palette-list"
              aria-activedescendant={view.flat[index] !== undefined ? "palette-row-" + view.flat[index]!.key : undefined}
              placeholder="搜索命令与会话…（> 命令，# 会话）"
              onChange={(e) => setRaw(e.target.value)}
              onKeyDown={onKeyDown}
            />
          </div>
          <div className="palette__scopes" role="tablist" aria-label="搜索范围">
            {SCOPE_ORDER.map((s) => {
              const Icon = ICONS[SCOPE_ICON[s]];
              const active = view.scope === s;
              return (
                <button
                  key={s}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={"palette__scope" + (active ? " palette__scope--active" : "")}
                  title={s === "all" ? "全部（默认）" : "前缀 " + scopePrefix(s) + " 可直接切到本范围"}
                  onClick={() => {
                    setScope(s);
                    // 输入框带显式前缀时，切 tab 同步去掉前缀（抄 :2372 changeScope）
                    if (view.explicitScope) setRaw(view.query);
                  }}
                >
                  <Icon size={11} />
                  <span>{SCOPE_LABEL[s]}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="palette__list" id="palette-list" role="listbox" aria-label="结果">
          {view.empty ? (
            <p className="palette__empty">
              {view.query.length === 0
                ? "没有可用的命令或会话。"
                : "没有匹配「" + view.query + "」的结果。"}
            </p>
          ) : null}
          {view.groups.map((group) => (
            <section key={group.key} className="palette__group">
              <h3 className="palette__heading">{group.heading}</h3>
              {group.rows.map((row) => {
                const selectable = row.kind === "action" ? row.action.disabled !== true : true;
                if (selectable) flatIndex += 1;
                const selected = selectable && flatIndex === index;
                const rowIdx = flatIndex;
                return (
                  <button
                    key={row.key}
                    id={"palette-row-" + row.key}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    disabled={!selectable}
                    ref={(el) => {
                      rowRefs.current.set(row.key, el);
                    }}
                    className={"palette__row" + (selected ? " palette__row--selected" : "")}
                    onMouseEnter={() => {
                      if (selectable) setIndex(rowIdx);
                    }}
                    onClick={() => run(row)}
                  >
                    {row.kind === "action" ? (
                      <>
                        <RowIcon name={row.action.icon} />
                        <span className="palette__label">
                          <Highlight text={row.action.title} ranges={findHighlightRanges(row.action.title, view.query)} />
                        </span>
                        {row.action.disabled === true && row.action.note != null ? (
                          <span className="palette__meta palette__meta--warn">{row.action.note}</span>
                        ) : row.action.shortcut != null ? (
                          <kbd className="palette__kbd">{row.action.shortcut}</kbd>
                        ) : null}
                      </>
                    ) : row.kind === "command" ? (
                      <>
                        <RowIcon name="zap" />
                        <span className="palette__label palette__label--mono">
                          <span className="palette__slash">/</span>
                          <Highlight text={row.command.name} ranges={findHighlightRanges(row.command.name, view.query)} />
                        </span>
                        <span className="palette__meta">
                          {row.command.hint ?? row.command.description ?? ""}
                        </span>
                      </>
                    ) : (
                      <>
                        <RowIcon name={row.session.loaded ? "message" : "clock"} />
                        <span className="palette__label">
                          <Highlight text={titleOf(row.session)} ranges={findHighlightRanges(titleOf(row.session), view.query)} />
                        </span>
                        {/* 行尾两段小字，抄 QuickPick 的 workspaceLabel + MetaText（:2495-2500） */}
                        {row.session.loaded ? null : <span className="palette__tag">未加载</span>}
                        {row.session.active ? <span className="palette__tag palette__tag--on">当前</span> : null}
                        <span className="palette__meta">
                          {workspaceLabel(row.session.cwd) ?? row.session.activity ?? ""}
                        </span>
                        <span className="palette__meta palette__meta--time">
                          {formatRelative(row.session.at, Date.now()) ?? ""}
                        </span>
                      </>
                    )}
                  </button>
                );
              })}
              {group.total > group.rows.length ? (
                <button
                  type="button"
                  className="palette__more"
                  onClick={() => setExpanded((prev) => new Set(prev).add(group.key))}
                >
                  更多结果（还有 {String(group.total - group.rows.length)} 条）
                </button>
              ) : null}
            </section>
          ))}
        </div>

        {view.query.length === 0 && history.length > 0 ? (
          <div className="palette__foot">
            <div className="palette__foot-head">
              <span>最近搜索</span>
              <button
                type="button"
                className="palette__foot-clear"
                onClick={() => {
                  clearPaletteHistory();
                  setHistory([]);
                }}
              >
                清除
              </button>
            </div>
            <div className={"palette__chips" + (historyOpen ? " palette__chips--open" : "")}>
              {history.map((entry) => (
                <button
                  key={entry.scope + ":" + entry.query + ":" + String(entry.at)}
                  type="button"
                  className="palette__chip"
                  onClick={() => {
                    setScope(entry.scope);
                    const prefix = scopePrefix(entry.scope);
                    setRaw(prefix.length > 0 ? prefix + entry.query : entry.query);
                  }}
                >
                  {scopePrefix(entry.scope).length > 0 ? (
                    <span className="palette__chip-prefix">{scopePrefix(entry.scope)}</span>
                  ) : null}
                  <span className="palette__chip-text">{entry.query}</span>
                </button>
              ))}
              {history.length > 6 ? (
                <button type="button" className="palette__chip-toggle" onClick={() => setHistoryOpen((v) => !v)}>
                  {historyOpen ? "收起" : "展开"}
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="palette__foot palette__foot--hints">
            <span><kbd className="palette__kbd">↑</kbd><kbd className="palette__kbd">↓</kbd> 选择</span>
            <span><kbd className="palette__kbd">↵</kbd> 执行</span>
            <span><kbd className="palette__kbd">esc</kbd> 关闭</span>
            <span className="palette__spacer" />
            <span className="palette__count">{String(view.flat.length)} 项</span>
          </div>
        )}
      </div>
    </>
  );
}

function RowIcon({ name }: { name: IconKey }) {
  const Icon = ICONS[name];
  return (
    <span className="palette__icon">
      <Icon size={14} />
    </span>
  );
}

function titleOf(s: PaletteSession): string {
  const t = s.title?.trim() ?? "";
  return t.length === 0 ? "未命名会话" : t;
}
