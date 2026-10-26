import { tr } from "../../ui/i18n.ts";
import { useLocale } from "../../ui/useLocale.ts";
/**
 * ApprovalCard —— 内核→客户端裁决面。
 *
 * 三条来自实测的硬约束（docs/contract/permission-flow-measured.md）：
 *
 *  1. **选项文案逐字渲染**。四条 name 是与 prompter.rs 对齐的真相，不改写、
 *     不翻译、不「优化措辞」。要改文案就得改内核。
 *  2. **enable-always-approve 在线路上只是 allow_once**。选它之后真开 YOLO
 *     是**客户端职责**：必须另发 _nofy/yolo_mode_changed（App.tsx 里做）。
 *     否则用户以为「以后都别问了」，实际下一次还会弹。
 *  3. **reject-once 的文案本身说明拒绝路径带附言**（"…and tell Nofy what to do
 *     differently"）。附言的载荷形状**尚未实测**，故 S0 不实现输入框——
 *     按「一条不造」纪律，宁可少一个功能，也不发一个猜出来的字段。
 *     已登记为 P2 待录夹具。
 *
 * 非权限类的裁决面（问答 / 退出计划模式 / elicitation / 工作区信任）目前只给
 * 「取消」，因为它们的**正向**载荷形状还没实测。卡片会诚实写明这一点。
 */
import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import { interactionKind } from "../../core/interactions.ts";
import type { AppState } from "../../core/store/state.ts";
import {
  IconEdit,
  IconFile,
  IconGear,
  IconInfo,
  IconSearch,
  IconSpark,
  IconTerminal,
} from "../../ui/icons.tsx";
import { IconChevronRight } from "../../ui/icons.tsx";
import { Btn, Chip } from "../../ui/primitives.tsx";
import type { PermissionOption, ToolCallInfo } from "../../ui/readers.ts";
import { preview, readOptions, readToolCall } from "../../ui/readers.ts";
import type { QuestionnaireView, Selection } from "./questionModel.ts";
import { acceptedPayload, emptySelections, isAnswered, readQuestionnaire } from "./questionModel.ts";
import { PlanApprovalCard } from "./PlanApprovalCard.tsx";
import { ElicitationCard } from "./ElicitationCard.tsx";
import { permissionScope, permissionResponse } from "./permModel.ts";

type Pending = AppState["pendingInteractions"] extends Array<infer T> ? T : never;

export type ApprovalHandlers = {
  chooseOption: (item: Pending, optionId: string) => void;
  cancel: (item: Pending) => void;
  trust: (item: Pending, trust: boolean) => void;
  /** 问答裁决面正向应答：载荷由 questionModel 按内核契约造好，这里只负责送上线。 */
  answer: (item: Pending, payload: Record<string, unknown>) => void;
};

export function ApprovalCard({ item, handlers }: { item: Pending; handlers: ApprovalHandlers }) {
  useLocale();
  /**
   * 审批到达即把焦点交给卡片容器（tabIndex=-1，Enter 不会误点选项）。
   * 不偷焦点的话焦点还在 composer，1-4 会被我们自己的「输入框内忽略」守卫吃掉；
   * 模态裁决偷焦点是标准做法（活壳与 Codex 同）。
   */
  const rootRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    rootRef.current?.focus();
  }, []);
  return (
    <div className="approval-wrap" ref={rootRef} tabIndex={-1}>
      {(() => {
        switch (interactionKind(item.method)) {
          case "permission":
            return <PermissionCard item={item} handlers={handlers} />;
          case "ask-user":
            return <QuestionCard item={item} handlers={handlers} />;
          case "folder-trust":
            return <FolderTrustCard item={item} handlers={handlers} />;
          case "exit-plan":
            return <PlanApprovalCard key={String(item.id)} item={item} handlers={handlers} />;
          case "elicitation":
            return <ElicitationCard key={String(item.id)} item={item} handlers={handlers} />;
          default:
            return <UnknownCard item={item} handlers={handlers} />;
        }
      })()}
    </div>
  );
}

/**
 * 选项展示视图。optionId 是实测真相（permission-flow-measured.md §2 的四条），
 * 展示文案逐字对齐活壳审批卡（IntlProvider chat.permission.* 族）：
 * 内核给的 name 是 "Yes" 这类英文原串，活壳也按 optionId/kind 映射自家文案，我们同纪律。
 *
 * enable-always-approve 的描述明写「开启全放行」：它在线路上只是 allow_once，
 * 真开 YOLO 是客户端职责（App.tsx 另发 notify）——文案不藏这件事。
 */
const OPTION_COPY: Record<string, { label: string; desc: string; danger: boolean }> = {
  "allow-once": { get label() { return tr("允许"); }, get desc() { return tr("仅允许这一次"); }, danger: false },
  "allow-edits-session": { get label() { return tr("允许本会话"); }, get desc() { return tr("本次会话内的编辑不再询问"); }, danger: false },
  "reject-once": { get label() { return tr("拒绝"); }, get desc() { return tr("这次先拒绝"); }, danger: false },
  "enable-always-approve": { get label() { return tr("完全访问"); }, get desc() { return tr("允许本次并开启全放行，后续不再询问"); }, danger: true },
};

/** 展示顺序＝安全→危险：活壳三档逐字 + 全放行收尾当减速带。表外选项按内核顺序附尾。 */
const OPTION_ORDER = ["allow-once", "allow-edits-session", "reject-once", "enable-always-approve"];

export type OptionView = { optionId: string; label: string; desc: string | null; danger: boolean };

/** 排序+映射。App 的数字热键共用这张表——热键序号必须与屏幕行号一致，否则是骗人的键位。 */
export function optionViews(options: PermissionOption[]): OptionView[] {
  const byId = new Map(options.map((o) => [o.optionId, o]));
  const views: OptionView[] = [];
  for (const id of OPTION_ORDER) {
    const o = byId.get(id);
    if (o === undefined) continue;
    const copy = OPTION_COPY[id];
    views.push(
      copy === undefined
        ? { optionId: o.optionId, label: o.name, desc: o.kind, danger: false }
        : { optionId: o.optionId, label: copy.label, desc: copy.desc, danger: copy.danger },
    );
  }
  for (const o of options) {
    if (OPTION_ORDER.includes(o.optionId)) continue;
    views.push({ optionId: o.optionId, label: o.name, desc: o.kind, danger: false });
  }
  return views;
}

/** 目标芯片：只读实测键（golden-permission.jsonl：Write 的 rawInput.file_path）。读不到不画芯片，不猜。 */
function targetOf(tool: ToolCallInfo | null): string | null {
  if (tool === null) return null;
  const raw = tool.rawInput;
  if (typeof raw !== "object" || raw === null) return null;
  const o = raw as Record<string, unknown>;
  for (const key of ["file_path", "path"]) {
    const v = o[key];
    if (typeof v === "string" && v.length > 0) return v;
  }
  return null;
}

function baseName(p: string): string {
  const i = Math.max(p.lastIndexOf("/"), p.lastIndexOf("\\"));
  return i >= 0 ? p.slice(i + 1) : p;
}

/** 上下文行图标：toolCall.kind 是 ACP ToolKind（实测 edit/…），认不出落齿轮。 */
function ctxIcon(kind: string | null): ReactNode {
  const k = (kind ?? "").toLowerCase();
  if (k.includes("edit") || k.includes("write") || k.includes("patch")) return <IconEdit size={14} />;
  if (k.includes("exec") || k.includes("terminal") || k.includes("shell") || k.includes("command"))
    return <IconTerminal size={14} />;
  if (k.includes("search") || k.includes("grep")) return <IconSearch size={14} />;
  if (k.includes("read") || k.includes("glob") || k.includes("list")) return <IconFile size={14} />;
  if (k.includes("web") || k.includes("fetch")) return <IconSpark size={14} />;
  return <IconGear size={14} />;
}

/**
 * 权限卡＝活壳形态（2026-09-13 真机截图对齐）：
 * 标题行「需要权限」→ 上下文行（工具图标 + 等待确认 + 目标芯片）→
 * 编号 listbox（选中行整行底色，点未选中行=选中、点选中行=确认）→
 * 底行（Tab/上下键/回车提示 + 黑底确认按钮）。
 *
 * 键盘：roving tabIndex；ArrowUp/Down 与 Tab/Shift+Tab 移选中、Enter 确认、Home/End 跳首尾。
 * 数字键 1–N 由 App 的全局热键直选直确（与屏幕行号同序，见 optionViews）。
 */
function PermissionCard({ item, handlers }: { item: Pending; handlers: ApprovalHandlers }) {
  useLocale();
  const tool = readToolCall(item.params);
  const views = optionViews(readOptions(item.params));
  const [sel, setSel] = useState(0);
  const [remarks, setRemarks] = useState("");
  const [scope, setScope] = useState<"tool" | "server">("tool");
  const [pattern, setPattern] = useState("");
  const [glob, setGlob] = useState(false);
  const [sent, setSent] = useState(false);
  const submitted = useRef(false);
  const rowRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const target = targetOf(tool);
  const selectedId = views[sel]?.optionId ?? "";
  const mcp = permissionScope(item.params, selectedId);
  const confirm = (index = sel) => {
    const v = views[index];
    if (v === undefined || submitted.current) return;
    submitted.current = true;
    setSent(true);
    if (v.optionId === "reject-once" && remarks.trim()) handlers.answer(item, permissionResponse(v.optionId, { followup_message: remarks.trim() }));
    else if (permissionScope(item.params, v.optionId)) {
      const selectedScope = permissionScope(item.params, v.optionId)!;
      handlers.answer(item, permissionResponse(v.optionId, scope === "server" && selectedScope.server ? { kind: "server", server: selectedScope.server } : { kind: "tool", tool_name: selectedScope.toolName }));
    }
    else if (v.optionId === "allow-always-command" && pattern.trim()) handlers.answer(item, permissionResponse(v.optionId, { command_parts: [pattern.trim()], is_glob: glob }));
    else handlers.chooseOption(item, v.optionId);
  };
  const move = (next: number) => {
    const n = views.length;
    if (n === 0) return;
    const i = ((next % n) + n) % n;
    setSel(i);
    rowRefs.current[i]?.focus();
  };
  const onListKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("input,textarea,select")) return;
    if (/^[1-9]$/.test(e.key)) {
      e.preventDefault();
      confirm(Number(e.key) - 1);
    } else if (e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey)) {
      e.preventDefault();
      move(sel + 1);
    } else if (e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)) {
      e.preventDefault();
      move(sel - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      confirm();
    } else if (e.key === "Home") {
      e.preventDefault();
      move(0);
    } else if (e.key === "End") {
      e.preventDefault();
      move(views.length - 1);
    }
  };
  return (
    <div className="approval" onKeyDown={onListKey}>
      <div className="approval__head">
        <span className="approval__title">{tr("需要权限")}</span>
      </div>
      <div className="approval__ctx">
        <span className="approval__ctxicon">{ctxIcon(tool?.kind ?? null)}</span>
        <span className="approval__ctxstatus">{tr("等待确认")}</span>
        {target !== null ? (
          <span className="approval__ctxfile" title={target}>
            <IconFile size={13} />
            {baseName(target)}
          </span>
        ) : null}
      </div>
      {views.length === 0 ? (
        <p className="approval__note">{tr("这条请求没有可用选项（options 缺失或形状不符）。不猜——按取消处理更安全。")}</p>
      ) : (
        <>
          <div className="approval__list" role="listbox" aria-label={tr("需要权限")}>
            {views.map((v, i) => (
              <button
                key={v.optionId}
                type="button"
                disabled={sent}
                role="option"
                aria-selected={i === sel}
                tabIndex={i === sel ? 0 : -1}
                ref={(el) => {
                  rowRefs.current[i] = el;
                }}
                className={
                  "approval__opt" +
                  (i === sel ? " approval__opt--on" : "") +
                  (v.danger ? " approval__opt--danger" : "")
                }
                onClick={() => {
                  if (i === sel) confirm();
                  else setSel(i);
                }}
                onFocus={() => setSel(i)}
                title={tr("按 ") + String(i + 1) + tr(" 直接确认此项 · optionId=") + v.optionId}
              >
                <span className={"approval__num" + (i === sel ? " approval__num--on" : "")}>{String(i + 1)}.</span>
                <span className="approval__optbody">
                  <span className="approval__optlabel">{v.label}</span>
                  {v.desc !== null ? <span className="approval__optdesc">{v.desc}</span> : null}
                </span>
              </button>
            ))}
          </div>
          {selectedId === "reject-once" ? <label className="question__text">{tr("拒绝附言")}<textarea className="question__input" value={remarks} disabled={sent} placeholder={tr("告诉助手如何调整")} onChange={(e) => setRemarks(e.target.value)} />
          </label> : null}
          {mcp ? <label className="question__text">{tr("持续授权范围")}<select className="question__input" value={scope} disabled={sent} onChange={(e) => setScope(e.target.value === "server" ? "server" : "tool")}>
              <option value="tool">{tr("仅工具：")}{mcp.toolName}</option>
              {mcp.server ? <option value="server">{tr("整个服务器：")}{mcp.server}</option> : null}
            </select>
          </label> : null}
          {selectedId === "allow-always-command" ? <div>
            <label className="question__text">{tr("自定义命令范围（留空沿用内核默认）")}<input className="question__input" value={pattern} disabled={sent} onChange={(e) => setPattern(e.target.value)} />
            </label>
            <label><input type="checkbox" checked={glob} disabled={sent} onChange={(e) => setGlob(e.target.checked)} />{tr("将输入作为 glob 模式持续授权")}</label>
          </div> : null}
          <div className="approval__foot">
            <span className="approval__hint">
              <IconInfo size={14} />{tr("使用 Tab / 上下键选择，回车确认")}</span>
            <button type="button" className="approval__confirm" disabled={sent} onClick={() => confirm()}>{tr("确认")}</button>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * 问答卡（_nofy/ask_user_question）＝活壳 elicitation 形态（2026-09-13）：
 * 标题「需要确认」→ 题干 → 选项行（单选圆标/多选方标 + 标签 + 描述）→
 * 「自定义回答」行（展开输入框，自由文本走 annotations.notes）→
 * 底行（Tab/上下键/回车或空格提示 + 上一题/下一题 + 继续/提交）。
 *
 * 应答契约逐字内核 types.rs：accepted 的 answers 键是**题干原文**、未答省略、
 * 纯自由文本＝["Other"]+notes、preview 仅单选逐字带。plan 模式的访谈双按钮
 * （chat_about_this / skip_interview）活壳不露，我们同纪律不露。
 * 取消走已登记的 {outcome:"cancelled"}（effects.ts cancelPayloadFor）。
 */
function QuestionCard({ item, handlers }: { item: Pending; handlers: ApprovalHandlers }) {
  useLocale();
  const q: QuestionnaireView = readQuestionnaire(item.params);
  const [qi, setQi] = useState(0);
  const [sels, setSels] = useState<Selection[]>(() => emptySelections(q.questions.length));
  const [rowIdx, setRowIdx] = useState(0);
  const [customOpen, setCustomOpen] = useState<boolean[]>(() => q.questions.map(() => false));
  const rowRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const cur = q.questions[qi];
  const sel = sels[qi] ?? { labels: [], notes: "" };
  const rowCount = (cur?.options.length ?? 0) + 1;
  const setSel = (next: Selection) => setSels((list) => list.map((s, i) => (i === qi ? next : s)));
  const pick = (label: string) => {
    if (cur === undefined) return;
    if (cur.multiSelect) {
      const has = sel.labels.includes(label);
      setSel({ ...sel, labels: has ? sel.labels.filter((l) => l !== label) : [...sel.labels, label] });
    } else {
      setSel({ ...sel, labels: [label] });
      setCustomOpen((list) => list.map((v, i) => (i === qi ? false : v)));
    }
  };
  const pickCustom = () => {
    if (cur === undefined) return;
    if (!cur.multiSelect) setSel({ ...sel, labels: [] });
    setCustomOpen((list) => list.map((v, i) => (i === qi ? true : v)));
  };
  const move = (next: number) => {
    const i = ((next % rowCount) + rowCount) % rowCount;
    setRowIdx(i);
    rowRefs.current[i]?.focus();
  };
  const onListKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey)) { e.preventDefault(); move(rowIdx + 1); }
    else if (e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)) { e.preventDefault(); move(rowIdx - 1); }
    else if (e.key === " " || e.key === "Enter") {
      if (cur === undefined) return;
      e.preventDefault();
      const opt = cur.options[rowIdx];
      if (opt !== undefined) pick(opt.label);
      else pickCustom();
    }
  };
  const goto = (i: number) => { setQi(i); setRowIdx(0); };
  const payload = acceptedPayload(q.questions, sels);
  const focusedPreview =
    cur !== undefined && !cur.multiSelect ? cur.options[rowIdx]?.preview ?? null : null;
  return (
    <div className="approval">
      <div className="approval__head">
        <span className="approval__title">{tr("需要确认")}</span>
        {q.mode === "plan" ? <Chip tone="plain">{tr("计划模式")}</Chip> : null}
        {q.questions.length > 1 ? (
          <span className="approval__method">{String(qi + 1)} / {String(q.questions.length)}</span>
        ) : null}
      </div>
      {cur === undefined ? (
        <p className="approval__note">{tr("这条请求没有可用问题（questions 缺失或形状不符）。不猜——按取消处理更安全。")}</p>
      ) : (
        <>
          <p className="question__text">{cur.question}</p>
          <div
            className="approval__list"
            role="listbox"
            aria-multiselectable={cur.multiSelect}
            aria-label={cur.question}
            onKeyDown={onListKey}
          >
            {cur.options.map((o, i) => {
              const on = sel.labels.includes(o.label);
              return (
                <button
                  key={o.label}
                  type="button"
                  role="option"
                  aria-selected={on}
                  tabIndex={i === rowIdx ? 0 : -1}
                  ref={(el) => { rowRefs.current[i] = el; }}
                  className={"approval__opt" + (on ? " approval__opt--on" : "")}
                  onClick={() => { setRowIdx(i); pick(o.label); }}
                  onFocus={() => setRowIdx(i)}
                >
                  <span className={"qmark" + (cur.multiSelect ? " qmark--multi" : "") + (on ? " qmark--on" : "")} aria-hidden="true" />
                  <span className="approval__optbody">
                    <span className="approval__optlabel">{o.label}</span>
                    {o.description !== null ? <span className="approval__optdesc">{o.description}</span> : null}
                  </span>
                </button>
              );
            })}
            {(() => {
              const i = cur.options.length;
              const open = customOpen[qi] === true;
              const on = open || (sel.notes.trim().length > 0 && sel.labels.length === 0);
              return (
                <div className={"question__custom" + (on ? " approval__opt--on" : "")}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={on}
                    tabIndex={i === rowIdx ? 0 : -1}
                    ref={(el) => { rowRefs.current[i] = el; }}
                    className="approval__opt"
                    onClick={() => { setRowIdx(i); pickCustom(); }}
                    onFocus={() => setRowIdx(i)}
                  >
                    <span className={"qmark" + (cur.multiSelect ? " qmark--multi" : "") + (on ? " qmark--on" : "")} aria-hidden="true" />
                    <span className="approval__optbody">
                      <span className="approval__optlabel">{tr("自定义回答")}</span>
                    </span>
                  </button>
                  {open ? (
                    <input
                      className="question__input"
                      placeholder={tr("输入你的回答...")}
                      value={sel.notes}
                      autoFocus
                      ref={(el) => { inputRefs.current[qi] = el; }}
                      onChange={(e) => setSel({ ...sel, notes: e.target.value })}
                    />
                  ) : null}
                </div>
              );
            })()}
          </div>
          {focusedPreview !== null ? <pre className="question__preview">{focusedPreview}</pre> : null}
          <div className="approval__foot">
            <span className="approval__hint">
              <IconInfo size={14} />{tr("使用 Tab / 上下键选择，回车或空格选中")}</span>
            <span className="question__nav">
              <button
                type="button"
                className="iconbtn qnav__flip"
                disabled={qi === 0}
                title={tr("上一题")}
                aria-label={tr("上一题")}
                onClick={() => goto(qi - 1)}
              >
                <IconChevronRight size={14} />
              </button>
              <button
                type="button"
                className="iconbtn"
                disabled={qi >= q.questions.length - 1}
                title={tr("下一题")}
                aria-label={tr("下一题")}
                onClick={() => goto(qi + 1)}
              >
                <IconChevronRight size={14} />
              </button>
              {/* 继续＝翻题（未答的题按内核契约省略，不禁用）；提交＝最后一题且至少一题已答。 */}
              <button
                type="button"
                className="approval__confirm"
                disabled={qi >= q.questions.length - 1 && payload === null}
                title={qi >= q.questions.length - 1 && payload === null ? tr("至少回答一题才能提交") : tr("提交回答")}
                onClick={() => {
                  if (payload === null) return;
                  if (qi < q.questions.length - 1) goto(qi + 1);
                  else handlers.answer(item, payload);
                }}
              >
                {qi < q.questions.length - 1 ? tr("继续") : tr("提交")}
              </button>
            </span>
          </div>
        </>
      )}
    </div>
  );
}

function FolderTrustCard({ item, handlers }: { item: Pending; handlers: ApprovalHandlers }) {
  useLocale();
  return (
    <div className="approval">
      <div className="approval__head">
        <span className="approval__title">{tr("工作区信任")}</span>
        <span className="approval__method">{item.method}</span>
      </div>
      <p className="approval__note">{tr("内核在问是否信任这个工作区。信任会**持久化**授权并热重载仓库级 MCP / 配置；\n        拒绝只在本进程内记账，工作区继续 gated（仓库级 MCP 与配置不加载）。\n        不应答是最差选择：内核超时后按「不是决定」处理，下次开会话还会再问。")}</p>
      <div className="approval__options">
        <Btn variant="primary" onClick={() => handlers.trust(item, true)}>{tr("信任此工作区")}</Btn>
        <Btn variant="danger" onClick={() => handlers.trust(item, false)}>{tr("拒绝（保持 gated）")}</Btn>
      </div>
      <details>
        <summary className="block__label">{tr("params（形状未实测，原样展示）")}</summary>
        <pre className="tool-card__args">{preview(item.params, 1200)}</pre>
      </details>
    </div>
  );
}

/**
 * ask_user_question / exit_plan_mode / elicitation 等：
 * 正向应答的形状还没实测，故只给取消，并把这一事实写在界面上。
 */
function UnknownCard({ item, handlers }: { item: Pending; handlers: ApprovalHandlers }) {
  useLocale();
  return (
    <div className="approval">
      <div className="approval__head">
        <span className="approval__title">{tr("待裁决：")}{item.method}</span>
        <Chip tone="warn">{tr("裁决面未实现")}</Chip>
      </div>
      <p className="approval__note">{tr("本桌面还没有这个请求的界面。取消载荷按方法族取自连接层已验证的 fail-safe 形状；\n        若该方法不在表内，取消会失败并保持挂起——此时用下方 Stop 兜底\n        （session/cancel 会连带把该会话所有挂起请求应答 cancelled）。")}</p>
      <div className="approval__options">
        <Btn onClick={() => handlers.cancel(item)}>{tr("取消这次请求")}</Btn>
      </div>
      <details>
        <summary className="block__label">{tr("params（原样展示）")}</summary>
        <pre className="tool-card__args">{preview(item.params, 1600)}</pre>
      </details>
    </div>
  );
}
