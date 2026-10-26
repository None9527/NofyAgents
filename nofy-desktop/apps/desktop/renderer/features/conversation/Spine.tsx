import { defaultRangeExtractor, useVirtualizer } from "@tanstack/react-virtual";
import { useTranscriptScroll } from "../../ui/useTranscriptScroll.ts";
import { conversationReadingMemory } from "../../application/conversation/public.ts";
import { recordRender } from "../../ui/renderDiagnostics.ts";
import { tr } from "../../ui/i18n.ts";
import { loadGeneralPrefs, subscribeGeneralPrefs } from "../../ui/generalPrefs.ts";
import { useLocale } from "../../ui/useLocale.ts";
import { useHotkeys } from "../../ui/hotkeys.ts";
/**
 * Spine —— 会话脊柱（工艺批 2 + 回合折叠批）。
 *
 * 只渲染 store 里的 Block 序列，不做协议判断（块的开合/重组/关联在 project.ts）。
 * 回合形态照活壳（spineModel.ts 头注的实测）：完成回合的中间过程收在「已工作 Ns」
 * turn 头下、最终答案留外；运行中展开内联；子智能体是一条可点的内联摘要行（agentrow）。
 *
 * 自动滚动：只在用户贴着底部时跟随（流式界面最常见的体验 bug 就是拽回底部）。
 */
import { memo, useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { Runtime } from "../../core/runtime.ts";
import { ConversationFind } from "./ConversationFind.tsx";
import { groupWorkBlocks } from "./workModel.ts";
import { CopyButton, SaveButton } from "../../ui/contentActions.tsx";
import { CollapsibleRow } from "../../ui/disclosure.tsx";
import { TurnFeedback } from "./TurnFeedback.tsx";
import { ThoughtActivity } from "./ThoughtActivity.tsx";
import { WorkStage } from "./WorkStage.tsx";
import { presentWorkSegment } from "./workflowModel.ts";
import { ActivityCard } from "./ActivityCard.tsx";
import { activityCounts } from "./activityModel.ts";
import { TurnActions } from "./TurnActions.tsx";
import type { ReactNode } from "react";
import type { Block, SegmentUsage, SessionState } from "../../core/store/state.ts";
import {
  IconChevronDown,
  IconEdit,
  IconFile,
  IconMark,
  IconTerminal,
} from "../../ui/icons.tsx";
import { Markdown } from "../../ui/markdown.tsx";
import { preview } from "../../ui/readers.ts";
import { useAgentProjection } from "./useAgentProjection.ts";
import { addPinnedIndex, CONVERSATION_OVERSCAN, segmentIndexForBlock, VIRTUAL_TURN_THRESHOLD } from "../../application/conversation/public.ts";
import { createTurnIndex, isConversationBlockVisible } from "../../application/conversation/public.ts";
import type { ConversationSession } from "../../application/conversation/public.ts";
import { agentWorkPhrase, type AgentBlockView } from "./agentModel.ts";
import { turnClock, turnHookRuns } from "./responseModel.ts";
import { ResponseTools } from "./ResponseTools.tsx";
import { PlanActivity } from "./PlanActivity.tsx";
import type { TurnSegment } from "./spineModel.ts";

const STICK_THRESHOLD_PX = 80;

/** 建议芯片：填草稿不发送——用户要能改。文案面向本仓库的真实用途。 */
const SUGGESTIONS: readonly string[] = [
  "用三句话解释这个仓库的构建入口",
  "列出 crates/ 里依赖最多的三个模块",
  "为当前未提交的改动写一条 commit message",
];

export function Spine({
  session,
  running,
  onSuggest,
  onOpenAgent,
  runtime,
  onEdit,
  onRewound,
  findOpen: controlledFindOpen,
  onFindChange,
  followToken = 0,
  jumpRequest = null,
}: {
  /** 任务概览里的计划行：打开所在回合并滚到该块。 */
  jumpRequest?: { token: number; blockId: string } | null;
  followToken?: number;
  runtime?: Runtime;
  onEdit?: (text: string) => void;
  onRewound?: (sessionId: string, promptText: string | null) => void | Promise<void>;
  findOpen?: boolean;
  onFindChange?: (open: boolean) => void;
  session: ConversationSession | null;
  running: boolean;
  onSuggest: (text: string) => void;
  /** 子智能体行点击 → 侧栏子智能体目录并定位该子会话（活壳 openInSidePane 的同位动作）。 */
  onOpenAgent?: (subagentId: string) => void;
}) {
  recordRender("Spine");
  useLocale();
  const showThoughts = useSyncExternalStore(subscribeGeneralPrefs, loadGeneralPrefs, loadGeneralPrefs).showThoughts;
  const agents = useAgentProjection(session);
  const index = useMemo(createTurnIndex, [session?.id]);
  const indexedSegments = index.read(session?.blocks ?? EMPTY_BLOCKS, session?.turns ?? EMPTY_TURNS);
  // Session diagnostics remain in the store, but must not become phantom rows
  // in either the regular list or the virtualizer's geometry/reading anchors.
  const segments = useMemo(() => {
    const lead = indexedSegments[0];
    if (!lead || lead.user || lead.turn) return indexedSegments;
    const visible = [...lead.middle, ...(lead.final ? [lead.final] : []), ...(lead.following ?? [])].some(isConversationBlockVisible);
    return visible ? indexedSegments : indexedSegments.slice(1);
  }, [indexedSegments]);
  const actionSession = useMemo(() => session ? { id: session.id, agentState: session.agentState } : null, [session?.id, session?.agentState]);
  /** Running activity opens automatically; manual choices and exceptional outcomes stay visible. */
  const [openTurns, setOpenTurns] = useState<Record<string, boolean>>({});
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const memory = useMemo(() => conversationReadingMemory(runtime ?? FALLBACK_READING_OWNER, session?.id ?? "empty"), [runtime, session?.id]);
  const following = useRef(memory.read()?.following ?? true);
  const [virtualReading, setVirtualReading] = useState(!following.current);
  const segmentRefs = useRef(new Map<string, HTMLDivElement>());
  const [localFindOpen, setLocalFindOpen] = useState(false);
  const findOpen = controlledFindOpen ?? localFindOpen;
  const setFindOpen = useCallback((open: boolean) => { if (onFindChange) onFindChange(open); else setLocalFindOpen(open); }, [onFindChange]);
  useHotkeys(useMemo(() => ({ "mod+f": () => setFindOpen(true) }), [setFindOpen]));
  const listRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const [scrollMargin, setScrollMargin] = useState(0);
  const [pinnedTurn, setPinnedTurn] = useState<string | null>(null);
  const [jump, setJump] = useState<{ index: number; key: string; blockId: string } | null>(null);
  const virtual = segments.length >= VIRTUAL_TURN_THRESHOLD;
  const pinnedIndex = segments.findIndex(segment => segment.key === pinnedTurn);
  const itemKey = useCallback((at: number) => segments[at]?.key ?? at, [segments]);
  const rangeExtractor = useCallback((range: Parameters<typeof defaultRangeExtractor>[0]) => addPinnedIndex(defaultRangeExtractor(range), pinnedIndex), [pinnedIndex]);
  const rows = useVirtualizer({ count: segments.length, getScrollElement: () => scrollRef.current, estimateSize: () => 220,
    getItemKey: itemKey, overscan: CONVERSATION_OVERSCAN, enabled: virtual, scrollMargin, gap: 16,
    anchorTo: virtualReading ? "start" : "end", followOnAppend: !virtualReading, scrollEndThreshold: STICK_THRESHOLD_PX, rangeExtractor });
  const latestSegment = segments.at(-1);
  const phase = latestSegment ? presentWorkSegment(latestSegment, agents.linked).phase : 'idle';
  const { stickRef, readingHistory, setReadingHistory, onScroll, markUserScroll, backVisible, backToLatest, startResponse, anchorDisclosure } = useTranscriptScroll({
    content: listRef, spacer: spacerRef, phase,
    host: scrollRef, memory, revision: segments, keys: segments.map(segment => segment.key), virtual,
    scrollToIndex: at => rows.scrollToIndex(at, { align: "start", behavior: "auto" }),
    scrollToEnd: () => rows.scrollToEnd(),
  });
  const previousFollowToken = useRef(followToken);
  useLayoutEffect(() => {
    if (previousFollowToken.current !== followToken) { previousFollowToken.current = followToken; startResponse(); }
  }, [followToken, startResponse]);
  useEffect(() => setVirtualReading(readingHistory), [readingHistory]);
  const pinTurn = useCallback((key: string, open: boolean) => setPinnedTurn(previous => open ? key : previous === key ? null : previous), []);
  const jumpTo = (blockId: string) => {
    const at = segmentIndexForBlock(segments, blockId);
    if (at < 0) return;
    stickRef.current = false; setReadingHistory(true);
    setOpenTurns(previous => ({ ...previous, [segments[at]!.key]: true }));
    setJump({ index: at, key: segments[at]!.user?.id ?? segments[at]!.key, blockId });
  };
  const jumpToken = jumpRequest?.token ?? 0;
  const jumpBlockId = jumpRequest?.blockId ?? "";
  const seenJump = useRef(0);
  useEffect(() => {
    if (jumpToken === 0 || jumpToken === seenJump.current || jumpBlockId === "") return;
    seenJump.current = jumpToken;
    jumpTo(jumpBlockId);
  }, [jumpToken, jumpBlockId]);
  useLayoutEffect(() => {
    if (virtual && listRef.current && scrollRef.current) setScrollMargin(listRef.current.getBoundingClientRect().top - scrollRef.current.getBoundingClientRect().top + scrollRef.current.scrollTop);
  }, [virtual, findOpen, rows.scrollRect?.width]);

  useEffect(() => {
    if (!jump) return;
    if (virtual) rows.scrollToIndex(jump.index, { align: "start", behavior: "auto" });
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;
    const reveal = () => {
      const segment = segmentRefs.current.get(jump.key);
      const target = Array.from(segment?.querySelectorAll<HTMLElement>("[data-block-id]") ?? []).find(element => element.dataset.blockId === jump.blockId);
      if (target) {
        for (let parent = target.parentElement; parent && parent !== segment; parent = parent.parentElement) {
          if (parent.tagName === "DETAILS") (parent as HTMLDetailsElement).open = true;
        }
        target.scrollIntoView({ block: "start", behavior: "auto" });
        if (scrollRef.current) {
          scrollRef.current.scrollTop -= (scrollRef.current.querySelector<HTMLElement>(".spine__toolbar")?.offsetHeight ?? 0) + 24;
          if (virtual) rows.scrollToOffset(scrollRef.current.scrollTop, { behavior: "auto" });
        }
        setJump(null);
      } else if (++attempts < 20) timer = setTimeout(reveal, 16);
      else setJump(null);
    };
    timer = setTimeout(reveal, 16);
    return () => clearTimeout(timer);
  }, [jump, virtual, rows]);
  const [now, setNow] = useState<number>(() => Date.now());
  const toggleTurn = useCallback((key: string, expanded:boolean) => { setOpenTurns(m => ({ ...m, [key]: expanded })); }, []);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [running]);

  /**
   * 「还没有真内容」＝只有 event 块（hook:* 之类）。
   * 投影层一条不落（blocks 保留、诊断计数可见），但**视图**在首屏让位给品牌空态：
   * 只有一行 hook 噪声的首屏是负资产（活壳首屏是空态/首页，不是事件流）。
   */
  const hasContent = session?.blocks.some((b) => b.kind !== "event" || b.tag === "prompt-error") ?? false;

  return (
    <div className="conversation-transcript">
      {session && hasContent && findOpen ? <div className="spine__toolbar conversation-column">
        <ConversationFind key={session.id} blocks={session.blocks} onJump={jumpTo} onClose={() => setFindOpen(false)} />
      </div> : null}
    <div className={"spine" + (virtual ? " spine--virtual" : "")} ref={scrollRef} onScroll={onScroll}
      onWheel={event => { markUserScroll(); if (event.deltaY < 0 || readingHistory) { stickRef.current = false; setReadingHistory(true); } }}
      onPointerDown={event => { markUserScroll(); if (event.clientX > event.currentTarget.getBoundingClientRect().right - 18) { stickRef.current = false; setReadingHistory(true); } }}
      onKeyDown={event => { markUserScroll(); if (["ArrowUp", "PageUp", "Home"].includes(event.key)) { stickRef.current = false; setReadingHistory(true); } }}
      onTouchMove={() => { markUserScroll(); setReadingHistory(true); }}
      onClickCapture={event => {
        const summary = (event.target as HTMLElement).closest<HTMLElement>('summary, [data-history-toggle]');
        if (summary && event.currentTarget.contains(summary)) anchorDisclosure(summary);
      }}
      data-total-blocks={session?.blocks.length ?? 0} data-total-turns={segments.length} data-virtualized={virtual}>
      <div className="spine__inner conversation-column">
        {session === null || !hasContent ? (
          <EmptyState running={running} onSuggest={onSuggest} />
        ) : (
          <div ref={listRef} className={virtual ? "spine__virtual-list" : "spine__regular-list"} style={virtual ? { height: rows.getTotalSize() } : undefined}>
            {(virtual ? rows.getVirtualItems().map(item => ({ seg: segments[item.index]!, item })) : segments.map(seg => ({ seg, item: null }))).map(({ seg, item }) => <div key={seg.key} className={virtual ? "spine__virtual-row" : undefined} data-index={item?.index} data-read-key={seg.key} ref={virtual ? rows.measureElement : undefined} style={item ? { top: item.start - scrollMargin } : undefined}>
              <MemoSegmentView seg={seg} now={seg.running ? now : 0} open={openTurns[seg.key] ?? presentWorkSegment(seg, agents.linked).defaultOpen}
                onRestore={onEdit ?? onSuggest} onToggle={toggleTurn} onOpenAgent={onOpenAgent} agents={agents.views} linkedPolls={agents.linked}
                runtime={runtime} actionSession={actionSession} onEdit={onEdit} onRewound={onRewound} anchors={segmentRefs.current} onPin={pinTurn} showThoughts={showThoughts} />
            </div>)}
          </div>

        )}
        <div ref={spacerRef} className="transcript-response-space" aria-hidden="true" />
      </div>
    </div>
    {backVisible ? <button type="button" className="transcript-back" aria-label={tr("回到最新消息")} onClick={backToLatest}><IconChevronDown size={16} />{tr("回到最新消息")}</button> : null}
    </div>
  );
}

const FALLBACK_READING_OWNER = {};
const EMPTY_BLOCKS: Block[] = [];
const EMPTY_TURNS: SessionState["turns"] = [];
const MemoBlockView = memo(BlockView);
const MemoTurnActions = memo(TurnActions);
const MemoSegmentView = memo(SegmentView);
function SegmentView({ seg, now, open, onRestore, onToggle, onOpenAgent, agents, linkedPolls, runtime, actionSession, onEdit, onRewound, anchors, onPin, showThoughts = true }: {
  onRestore: (text: string) => void;
  seg: TurnSegment; now: number; open: boolean; onToggle: (key: string, expanded:boolean) => void;
  onOpenAgent?: (id: string) => void; agents: Map<string, AgentBlockView>; linkedPolls: Set<string>;
  runtime?: Runtime; actionSession: Pick<SessionState, "id" | "agentState"> | null;
  onEdit?: (text: string) => void; onRewound?: (id: string, text: string | null) => void | Promise<void>;
  anchors: Map<string, HTMLDivElement>; onPin: (key: string, open: boolean) => void;
  showThoughts?: boolean;
}) {
  const locale = useLocale();
  const id = seg.user?.id ?? seg.key;
  const anchor = useCallback((element: HTMLDivElement | null) => { if (element) anchors.set(id, element); else anchors.delete(id); }, [anchors, id]);
  const actionVisibility = useCallback((open: boolean) => onPin(seg.key, open), [onPin, seg.key]);
  const submissionErrors = [...seg.middle, ...(seg.following ?? [])].filter(block => block.kind === "event" && block.tag === "prompt-error");
  const presentation = presentWorkSegment(seg, linkedPolls);
  const awaitingModel = seg.running && presentation.ordered.length === 0;
  const middle = presentation.ordered.filter(block => presentation.history.has(block.id));
  const timelineId = useId();
  const counts = activityCounts(presentation.ordered);
  const hooks = useMemo(() => turnHookRuns([...seg.middle, ...(seg.following ?? [])]), [seg.middle, seg.following]);
  const responseTools = useMemo(() => actionSession && seg.user ? <ResponseTools runtime={runtime} sessionId={actionSession.id} promptIndex={seg.user.promptIndex} hasAnswer={presentation.answer !== null} idle={actionSession.agentState === "idle"} hooks={hooks} onVisibilityChange={actionVisibility}/> : null, [runtime, actionSession, seg.user, presentation.answer, hooks, actionVisibility]);
  const clockLabel = seg.turn ? (awaitingModel ? tr("正在等待模型响应…") + " " : seg.running ? tr("正在处理") + " " : tr("已工作 ")) + turnClock(seg.turn, now, locale) : tr("处理过程");
  const renderBlock = (block: Block) => isConversationBlockVisible(block) && !linkedPolls.has(block.id) ? <div key={block.id} data-block-id={block.id} data-block-kind={block.kind}><MemoBlockView block={block} onOpenAgent={onOpenAgent} view={agents.get(block.id)} linkedPoll={false} saveText={runtime?.saveText} active={seg.running && block.id === presentation.ordered.at(-1)?.id} showActions={block.id===presentation.answer?.id} extraActions={block.id===presentation.answer?.id ? responseTools : null} showThoughts={showThoughts} /></div> : null;
  // Keep one keyed list: a former final answer must not remount when the next
  // assistant message arrives. Only row visibility changes when history folds.
  const ordered = presentation.ordered;
  const historyIds = presentation.history;
  const shownUser = seg.user !== null && seg.user.hidden !== true ? seg.user : null;
  const rows = groupWorkBlocks(ordered).map((item, index) => ({ item, id: timelineId + '-' + index,
    key: item.kind === 'block' ? item.block.id : item.blocks[0]!.id,
    history: item.kind === 'block' ? historyIds.has(item.block.id) : item.blocks.every(block => historyIds.has(block.id)),
  }));
  return <div className="turn-segment" ref={anchor} data-running={seg.running} data-phase={presentation.phase}>
    {shownUser ? <div className="user-message">
      {renderBlock(shownUser)}
      {runtime && actionSession && onRewound ? <MemoTurnActions runtime={runtime} session={actionSession} promptIndex={shownUser.promptIndex} promptText={shownUser.text} onEdit={onEdit} onRewound={onRewound} onVisibilityChange={actionVisibility} /> : null}
    </div> : null}
    {middle.length ? <div className="activity-slice" data-open={open}>
      <button type="button" data-history-toggle className="ui-motion-disclosure__summary turnhead" aria-expanded={open}
        aria-controls={rows.filter(row => row.history).map(row => row.id).join(' ')} onClick={() => onToggle(seg.key, !open)}>
        <span className="turnhead__label">{clockLabel}</span>
        <IconChevronDown size={13} className="ui-motion-disclosure__chevron" />
        <span className="activity-slice__counts">{[
          counts.reads?counts.reads+tr(" 次查阅"):null, counts.commands?counts.commands+tr(" 个命令"):null,
          counts.edits?counts.edits+tr(" 次编辑"):null,
        ].filter(Boolean).join(" · ")}{counts.failed || counts.attention ? <span className="activity-slice__issue">{counts.failed ? counts.failed+tr(" 项失败") : tr("需要确认")}</span> : null}</span>
      </button>
    </div> : seg.turn ? <div className="turnhead turnhead--static" role={seg.running ? "status" : undefined}>
      <span className="turnhead__label">{clockLabel}</span>
    </div>:null}
    <div className="turn-timeline">{rows.map(({ item, key, id, history }, index) => <CollapsibleRow key={key} id={id} open={!history || open} className={history ? 'turn-segment__history-row' : undefined}>
      <div className="turn-timeline__item">{item.kind === 'block' ? renderBlock(item.block) : item.blocks.length === 1 ? renderBlock(item.blocks[0]!) : <WorkStage blocks={item.blocks} family={item.kind} active={seg.running && index === rows.length - 1} />}</div>
    </CollapsibleRow>)}</div>
    {!seg.running && !presentation.answer && responseTools && hooks.length > 0 ? <div className="message-actions">{responseTools}</div> : null}
    {submissionErrors.map(renderBlock)}
    <TurnFeedback turn={seg.turn} running={seg.running} onRestore={shownUser ? () => onRestore(shownUser.text) : undefined} />
  </div>;
}

function EmptyState({ running, onSuggest }: { running: boolean; onSuggest: (text: string) => void }) {
  useLocale();
  return (
    <div className="empty">
      <span className="empty__mark">
        <IconMark size={30} />
      </span>
      <h2>{running ? tr("正在准备会话…") : tr("你想完成什么？")}</h2>
      <p>{tr("从一个问题或一项任务开始，Nofy 会帮你逐步处理。")}</p>
      {running ? null : (
        <div className="empty__sugs">
          {SUGGESTIONS.map((s, index) => (
            <button key={s} type="button" className="sug" onClick={() => onSuggest(tr(s))}>
              <span className="sug__icon">{index === 0 ? <IconFile size={16} /> : index === 1 ? <IconTerminal size={16} /> : <IconEdit size={16} />}</span>
              {tr(s)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

type BlockProps = {
  onOpenAgent?: (subagentId: string) => void;
  view?: AgentBlockView;
  linkedPoll: boolean;
  saveText?: (text: string, filename: string) => Promise<boolean>;
  showActions?:boolean;
  extraActions?:ReactNode;
  active?:boolean;
};

function BlockView({ block, onOpenAgent, view, linkedPoll, saveText, showActions=true, active=false, extraActions, showThoughts=true }: { block: Block; showThoughts?: boolean } & BlockProps) {
  recordRender("BlockView");
  useLocale();
  switch (block.kind) {
    case "user-message":
      if (block.hidden) return null;
      return (
        <div className="block block--user">
          <div className="block__body">{block.text}</div>
        </div>
      );
    case "agent-message":
      return (
        <div className={"block block--agent" + (block.closed ? "" : " is-open")}>
          <Markdown text={block.text} streaming={!block.closed} onSaveText={saveText} />
          {block.closed && showActions ? <div className="message-actions"><CopyButton text={block.text} label="复制回答" /><SaveButton text={block.text} filename="answer.md" onSave={saveText} />{extraActions}{block.usage !== null && block.usage.inputTokens + block.usage.outputTokens > 0 ? <UsageChip usage={block.usage} /> : null}</div> : null}
        </div>
      );
    case "agent-thought":
      if (!showThoughts) return null;
      return <ThoughtActivity block={block} active={active} />;
    case "tool-call": {
      if (linkedPoll) return null;
      return view !== undefined ? <AgentRow view={view} onOpenAgent={onOpenAgent} /> : <ToolCard block={block} />;
    }
    case "event":
      if (!isConversationBlockVisible(block)) return null;
      if (block.tag === "plan") return <PlanActivity payload={block.payload} />;
      if (block.tag === "prompt-error") return <TurnFeedback turn={{startedAt:0,endedAt:0,feedback:{kind:"failed",message:String((block.payload as {error?:unknown})?.error ?? "发送失败"),at:0}}} running={false} />;
      // 表外/未展开的事件：**可见但不猜含义**（PLAN §2.4）。载荷折叠在 details 里。
      return (
        <div className="block block--event">
          <details>
            <summary>
              <span className="mono">{block.tag}</span>
            </summary>
            <pre className="tool-card__args">{preview(block.payload, 1200)}</pre>
          </details>
        </div>
      );
  }
}

function UsageChip({ usage }: { usage: SegmentUsage }) {
  useLocale();
  const total = usage.inputTokens + usage.outputTokens;
  return (
    <span className="block__usage" title={`${tr("输入")} ${usage.inputTokens.toLocaleString()} · ${tr("输出")} ${usage.outputTokens.toLocaleString()} · ${tr("思考")} ${usage.reasoningTokens.toLocaleString()}`}>
      {total.toLocaleString()} tokens
    </span>
  );
}

type ToolBlock = Extract<Block, { kind: "tool-call" }>;

/** Typed activity presentation is owned by ActivityCard. */
function ToolCard({block}:{block:ToolBlock}) { return <ActivityCard block={block}/>; }

/**
 * AgentRow —— 脊柱里的子智能体内联摘要。和右侧目录同一套：色点首字母、描述作标题、同一句状态。
 * 整行 role=button，点击 = 在右侧打开。耗时和回传只在目录里。
 */
function AgentRow({ view, onOpenAgent }: { view: AgentBlockView; onOpenAgent?: (subagentId: string) => void }) {
  useLocale();
  const linkable = view.subagentId !== null && onOpenAgent !== undefined;
  const phrase = tr(agentWorkPhrase(view));
  const title = view.description ?? view.prompt ?? tr("子智能体");
  const open = () => {
    if (view.subagentId !== null) onOpenAgent?.(view.subagentId);
  };
  return (
    <div
      className={"agentrow" + (linkable ? " agentrow--linkable" : "")}
      role={linkable ? "button" : undefined}
      tabIndex={linkable ? 0 : undefined}
      title={
        linkable
          ? tr("点击在右侧打开：子智能体记录（提示词 / 回传 / subagent_id）在侧边面板目录里")
          : (view.description ?? view.prompt ?? tr("子智能体"))
      }
      onClick={linkable ? open : undefined}
      onKeyDown={
        linkable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                open();
              }
            }
          : undefined
      }
    >
      <span className={"agentbadge agentbadge--mark agentbadge--" + view.color} title={view.subagentType ?? tr("子智能体")}>
        {(view.subagentType ?? "?").slice(0, 1).toUpperCase()}
      </span>
      <span className="agentrow__desc">{title}</span>
      {view.running ? <span className="agentrow__status activity-live">{phrase}</span> : null}
      {!view.running && view.failed ? <span className="agentrow__status agentrow__status--fail">{phrase}</span> : null}
      {!view.running && !view.failed ? <span className="agentrow__status">{phrase}</span> : null}
    </div>
  );
}
