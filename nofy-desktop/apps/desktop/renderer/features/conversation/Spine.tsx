/**
 * Spine —— 会话脊柱（工艺批 2 + 回合折叠批）。
 *
 * 只渲染 store 里的 Block 序列，不做协议判断（块的开合/重组/关联在 project.ts）。
 * 回合形态照活壳（spineModel.ts 头注的实测）：完成回合的中间过程收在「已工作 Ns」
 * turn 头下、最终答案留外；运行中展开内联；子智能体是一条可点的内联摘要行（agentrow）。
 *
 * 自动滚动：只在用户贴着底部时跟随（流式界面最常见的体验 bug 就是拽回底部）。
 */
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { Block, SegmentUsage, SessionState } from "../../core/store/state.ts";
import {
  IconBot,
  IconChevronDown,
  IconEdit,
  IconFile,
  IconGear,
  IconMark,
  IconSearch,
  IconSpark,
  IconTerminal,
} from "../../ui/icons.tsx";
import { Markdown } from "../../ui/markdown.tsx";
import { Chip, Dot } from "../../ui/primitives.tsx";
import type { Tone } from "../../ui/primitives.tsx";
import { preview } from "../../ui/readers.ts";
import { agentBlocks, linkedPollBlockIds } from "./agentModel.ts";
import type { AgentBlockView } from "./agentModel.ts";
import { buildTurnSegments, turnSeconds } from "./spineModel.ts";
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
}: {
  session: SessionState | null;
  running: boolean;
  onSuggest: (text: string) => void;
  /** 子智能体行点击 → 侧栏子智能体目录并定位该子会话（活壳 openInSidePane 的同位动作）。 */
  onOpenAgent?: (subagentId: string) => void;
}) {
  /** 子智能体视图按 blockId 索引；被收编的轮询块不单独画（活壳完全不画它们）。 */
  const agentViewMap = new Map<string, AgentBlockView>();
  for (const v of agentBlocks(session)) agentViewMap.set(v.blockId, v);
  const linkedPolls = linkedPollBlockIds(session);
  const segments = buildTurnSegments(session?.blocks ?? [], session?.turns ?? []);
  /** 完成回合的展开态（默认收）；运行中回合强制展开，不受这里管。 */
  const [openTurns, setOpenTurns] = useState<Record<string, boolean>>({});
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const stickRef = useRef(true);
  const [now, setNow] = useState<number>(() => Date.now());
  const count = session?.blocks.length ?? 0;
  const lastLen = count > 0 ? JSON.stringify(session?.blocks[count - 1] ?? null).length : 0;

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [running]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el === null || !stickRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [count, lastLen]);

  const onScroll = (): void => {
    const el = scrollRef.current;
    if (el === null) return;
    stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < STICK_THRESHOLD_PX;
  };

  /**
   * 「还没有真内容」＝只有 event 块（hook:* 之类）。
   * 投影层一条不落（blocks 保留、诊断计数可见），但**视图**在首屏让位给品牌空态：
   * 只有一行 hook 噪声的首屏是负资产（活壳首屏是空态/首页，不是事件流）。
   */
  const hasContent = session?.blocks.some((b) => b.kind !== "event") ?? false;

  return (
    <div className="spine" ref={scrollRef} onScroll={onScroll}>
      <div className="spine__inner">
        {session === null || !hasContent ? (
          <EmptyState running={running} onSuggest={onSuggest} />
        ) : (
          segments.map((seg) => (
            <SegmentView
              key={seg.key}
              seg={seg}
              now={now}
              open={openTurns[seg.key] === true}
              onToggle={() => setOpenTurns((m) => ({ ...m, [seg.key]: m[seg.key] !== true }))}
              onOpenAgent={onOpenAgent}
              agentViewOf={(id) => agentViewMap.get(id)}
              isLinkedPoll={(id) => linkedPolls.has(id)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function SegmentView({
  seg,
  now,
  open,
  onToggle,
  onOpenAgent,
  agentViewOf,
  isLinkedPoll,
}: {
  seg: TurnSegment;
  now: number;
  open: boolean;
  onToggle: () => void;
  onOpenAgent?: (subagentId: string) => void;
  agentViewOf: (id: string) => AgentBlockView | undefined;
  isLinkedPoll: (id: string) => boolean;
}) {
  const showMiddle = seg.turn === null || seg.running || open;
  const bp = { onOpenAgent, agentViewOf, isLinkedPoll };
  return (
    <>
      {seg.user !== null ? <BlockView block={seg.user} {...bp} /> : null}
      {seg.turn !== null ? (
        <button
          type="button"
          className="turnhead"
          aria-expanded={seg.running ? true : open}
          disabled={seg.running}
          onClick={seg.running ? undefined : onToggle}
          title={seg.running ? "本轮进行中（本地墙钟计时）" : "展开/收起本轮中间过程（思考 / 工具 / 子智能体行）；本地墙钟计时"}
        >
          <span className="turnhead__label">
            {seg.running ? "已工作 " + String(turnSeconds(seg.turn, now)) + " 秒" : "已工作 " + String(turnSeconds(seg.turn, now)) + " 秒"}
          </span>
          <IconChevronDown size={14} className={"turnhead__chev" + (seg.running || open ? " turnhead__chev--open" : "")} />
        </button>
      ) : null}
      {showMiddle ? seg.middle.map((b) => <BlockView key={b.id} block={b} {...bp} />) : null}
      {seg.final !== null ? <BlockView block={seg.final} {...bp} /> : null}
    </>
  );
}

function EmptyState({ running, onSuggest }: { running: boolean; onSuggest: (text: string) => void }) {
  return (
    <div className="empty">
      <span className="empty__mark">
        <IconMark size={30} />
      </span>
      <h2>{running ? "正在准备会话…" : "说点什么开始"}</h2>
      <p>脊柱按真实顺序显示：你的提示 → 模型文本 → 工具调用 → 后续文本。块的切分由内核事件决定，不是界面猜的。</p>
      {running ? null : (
        <div className="empty__sugs">
          {SUGGESTIONS.map((s) => (
            <button key={s} type="button" className="sug" onClick={() => onSuggest(s)}>
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

type BlockProps = {
  onOpenAgent?: (subagentId: string) => void;
  agentViewOf: (id: string) => AgentBlockView | undefined;
  isLinkedPoll: (id: string) => boolean;
};

function BlockView({ block, onOpenAgent, agentViewOf, isLinkedPoll }: { block: Block } & BlockProps) {
  switch (block.kind) {
    case "user-message":
      return (
        <div className="block block--user">
          <div className="block__label">你</div>
          <div className="block__body">{block.text}</div>
        </div>
      );
    case "agent-message":
      return (
        <div className={"block block--agent" + (block.closed ? "" : " is-open")}>
          <div className="block__label">
            Nofy
            {block.usage !== null ? <UsageChip usage={block.usage} /> : null}
          </div>
          <Markdown text={block.text} />
        </div>
      );
    case "agent-thought":
      return (
        <div className="block block--thought">
          <div className="block__label">思考</div>
          <div className="block__body">{block.text}</div>
        </div>
      );
    case "tool-call": {
      if (isLinkedPoll(block.id)) return null;
      const view = agentViewOf(block.id);
      return view !== undefined ? <AgentRow view={view} onOpenAgent={onOpenAgent} /> : <ToolCard block={block} />;
    }
    case "event":
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
  const total = usage.inputTokens + usage.outputTokens;
  return (
    <Chip tone="plain" title="response_completed.usage（段级，snake_case 线路字段）">
      {total.toLocaleString()} tok
    </Chip>
  );
}

type ToolBlock = Extract<Block, { kind: "tool-call" }>;

/** 工具 kind / 原始名 → 图标。认不出落齿轮：有图标总比方块诚实。 */
function toolIcon(kind: string | null, name: string | null): ReactNode {
  const k = (kind ?? name ?? "").toLowerCase();
  if (k.includes("read") || k.includes("glob") || k.includes("list")) return <IconFile size={14} />;
  if (k.includes("edit") || k.includes("write") || k.includes("patch")) return <IconEdit size={14} />;
  if (k.includes("exec") || k.includes("bash") || k.includes("shell") || k.includes("terminal") || k.includes("command"))
    return <IconTerminal size={14} />;
  if (k.includes("search") || k.includes("grep")) return <IconSearch size={14} />;
  if (k.includes("web") || k.includes("fetch")) return <IconSpark size={14} />;
  return <IconGear size={14} />;
}

function statusTone(status: string): Tone {
  if (status === "completed" || status === "success") return "ok";
  if (status === "failed" || status === "error") return "warn";
  return "brand";
}

function ToolCard({ block }: { block: ToolBlock }) {
  // title 是展示标题（"Read hello.txt"），name 是原始工具名（"read_file"）——不得混用。
  const heading = block.title ?? block.name ?? "工具调用";
  const hasArgs = block.argsDelta.length > 0 || block.rawInput !== undefined;
  return (
    <div className={"tool-card" + (block.interactionPending ? " tool-card--pending" : "")}>
      <div className="tool-card__head">
        <span className="tool-card__icon">{toolIcon(block.toolKind, block.name)}</span>
        {block.interactionPending ? <Dot activity="needs_input" /> : null}
        <span className="tool-card__title">{heading}</span>
        {block.toolKind !== null ? (
          <Chip tone="plain" title="tool_call_update.kind（实测 read/edit/…；与原始工具名不同源）">
            {block.toolKind}
          </Chip>
        ) : null}
        {block.name !== null && block.name !== block.title ? (
          <Chip tone="plain" title="原始工具名">
            {block.name}
          </Chip>
        ) : null}
        {block.status !== null ? <Chip tone={statusTone(block.status)}>{block.status}</Chip> : null}
      </div>
      {hasArgs ? (
        <details className="tool-card__body">
          <summary className="block__label">参数</summary>
          <pre className="tool-card__args">{block.argsDelta.length > 0 ? block.argsDelta : preview(block.rawInput, 2000)}</pre>
        </details>
      ) : null}
      {block.locations.length > 0 ? (
        <div className="tool-card__body">
          <pre className="tool-card__args">{preview(block.locations, 600)}</pre>
        </div>
      ) : null}
    </div>
  );
}

/**
 * AgentRow —— 脊柱里的子智能体**内联摘要行**（活壳 AgentToolView 实测形态，差表 §1.9）：
 * 无卡片框、无内联内容、无折叠箭头——bot 图标 + 「子智能体」+ 调色板色徽（首字母大写）
 * + 「·」+ 描述；整行 role=button，点击 = 在右侧打开（侧栏目录定位该子会话）。
 * 运行中 = 行尾流光「运行中」；失败 = destructive「失败」。耗时/回传/subagent_id 都在目录行里。
 */
function AgentRow({ view, onOpenAgent }: { view: AgentBlockView; onOpenAgent?: (subagentId: string) => void }) {
  const linkable = view.subagentId !== null && onOpenAgent !== undefined;
  const typeLabel =
    view.subagentType !== null ? view.subagentType.charAt(0).toUpperCase() + view.subagentType.slice(1) : null;
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
          ? "点击在右侧打开：子智能体记录（提示词 / 回传 / subagent_id）在侧边面板目录里"
          : (view.description ?? view.prompt ?? "子智能体")
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
      <span className="agentrow__icon">
        <IconBot size={16} />
      </span>
      <span className="agentrow__kind">子智能体</span>
      {typeLabel !== null ? (
        <span className={"agentbadge agentbadge--" + view.color} title={view.subagentType ?? undefined}>
          {typeLabel}
        </span>
      ) : null}
      {view.description !== null ? (
        <>
          <span className="agentrow__sep">·</span>
          <span className="agentrow__desc">{view.description}</span>
        </>
      ) : null}
      {view.running ? <span className="agentrow__status">运行中</span> : null}
      {!view.running && view.failed ? <span className="agentrow__status agentrow__status--fail">失败</span> : null}
    </div>
  );
}

