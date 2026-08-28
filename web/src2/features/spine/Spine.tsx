// 会话脊柱（S5）—— 文档模事件日志。
// D1：turns 是后端日志投影，live 是轮询投影；动作写回内核（chat/approve/rewind）。
// 节点类型：user / assistant(md) / tool(折叠) / thought(折叠) / approval / elicitation / live。
// 轮级动作：复制、回滚到此（两步确认）。digest：lastSeen 差集，原地判决。

import { useEffect, useRef, useState } from "react";
import { getClient, useApp } from "../../core/store";
import { bumpApproval, getTaskMeta, markSeen } from "../../core/meta";
import { renderMarkdown } from "../../core/markdown";
import type { LiveState, Turn } from "../../core/types";
import { Badge, Button, Dot } from "../../ui/primitives";
import { ViewSwitch } from "../lineage/ViewSwitch";
import "./md.css";
import "./spine.css";

const CLAMP_CHARS = 1500;

function fmtTime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
}

function ToolBlock({ name, input, output, pending }: {
  name: string;
  input: Record<string, unknown>;
  output: string;
  pending?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const inputStr = Object.keys(input).length ? JSON.stringify(input, null, 2) : "";
  return (
    <div className={`toolblock${pending ? " toolblock--pending" : ""}`}>
      <button className="toolblock__head" onClick={() => setOpen((v) => !v)}>
        <span>{open ? "▾" : "▸"}</span>
        <span className="toolblock__name">{name}</span>
        <span style={{ marginLeft: "auto" }}>
          {pending ? "运行中…" : output ? `${output.length} 字` : "无输出"}
        </span>
      </button>
      {open && (
        <div className="toolblock__body">
          {inputStr && <div>{inputStr}</div>}
          {inputStr && output && <div style={{ margin: "6px 0", borderTop: "1px dashed var(--border)" }} />}
          {output && <div>{output}</div>}
        </div>
      )}
    </div>
  );
}

function AssistantBody({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const long = text.length > CLAMP_CHARS;
  const shown = long && !expanded ? text.slice(0, CLAMP_CHARS) + "\n\n…" : text;
  return (
    <div>
      {renderMarkdown(shown)}
      {long && (
        <button className="clamp-toggle" onClick={() => setExpanded((v) => !v)}>
          {expanded ? "收起" : `展开全文（${text.length} 字）`}
        </button>
      )}
    </div>
  );
}

export function Spine({ taskId }: { taskId: string }) {
  const tasks = useApp((s) => s.tasks);
  const bumpMeta = useApp((s) => s.bumpMeta);
  const refreshFleet = useApp((s) => s.refreshFleet);
  const task = tasks.find((t) => t.taskId === taskId) ?? null;

  const [turns, setTurns] = useState<Turn[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [live, setLive] = useState<LiveState | null>(null);
  const [queue, setQueue] = useState<string[]>([]);
  const [digest, setDigest] = useState<{ turns: number; tools: number } | null>(null);
  const [digestLabel, setDigestLabel] = useState<string | null>(null);
  const [digestHidden, setDigestHidden] = useState(false);
  const [draft, setDraft] = useState("");
  const [rewindArm, setRewindArm] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const hadLive = useRef(false);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  const client = (() => {
    try {
      return getClient();
    } catch {
      return null;
    }
  })();

  // 水合会话 + digest 基线（lastSeen 差集）
  useEffect(() => {
    if (!client) return;
    let on = true;
    setLoaded(false);
    setTurns([]);
    setLive(null);
    setDigest(null);
    setDigestHidden(false);
    const prevSeen = getTaskMeta(taskId).lastSeen ?? 0;
    const neverSeen = prevSeen === 0;
    void client
      .getConversation(taskId)
      .then((ts) => {
        if (!on) return;
        setTurns(ts);
        // 回放轮无时间戳：首开整会话视为未读；非首开按 startedAt 差集
        const unseen = ts.filter((t) =>
          neverSeen ? t.userText != null : Boolean(t.startedAt && Date.parse(t.startedAt) > prevSeen),
        );
        const tools = unseen.reduce((n, t) => n + (t.toolCalls?.length ?? 0), 0);
        if (unseen.length > 0) {
          setDigest({ turns: unseen.length, tools });
          setDigestLabel(neverSeen ? "首次打开" : "离开期间");
        }
        setLoaded(true);
      })
      .catch(() => on && setLoaded(true));
    return () => {
      on = false;
    };
  }, [taskId, client]);

  // live 轮询（700ms）：流式投影 + 落定后重载 turns
  useEffect(() => {
    if (!client) return;
    const tick = async () => {
      try {
        const lv = await client.getLive(taskId);
        if (lv) {
          hadLive.current = true;
        } else if (hadLive.current) {
          hadLive.current = false;
          const ts = await client.getConversation(taskId);
          setTurns(ts);
          refreshFleet();
        }
        setLive(lv);
        const stats = await client.getTaskStats(taskId);
        setQueue(stats.queue);
      } catch {
        // 瞬态错误：保持最后已知（D3）
      }
    };
    void tick();
    const t = window.setInterval(tick, 700);
    return () => window.clearInterval(t);
  }, [taskId, client, refreshFleet]);

  // 自动滚底（新事件）
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns.length, live?.text.length]);

  if (!client) return null;

  const running = task?.status === "running";
  const awaiting = task?.status === "awaiting-approval";

  const sendFollowUp = async () => {
    const text = draft.trim();
    if (!text || running) return;
    setDraft("");
    await client.chat(taskId, text).catch(() => setNotice("发送失败：守护进程未响应"));
    refreshFleet();
  };

  const doRewind = async (userTurnIndex: number) => {
    setRewindArm(null);
    const res = await client.rewind(taskId, userTurnIndex).catch(() => null);
    if (res?.ok) {
      setNotice(`已回滚到第 ${userTurnIndex + 1} 轮${res.reverted?.length ? `，恢复 ${res.reverted.length} 个文件` : ""}`);
      const ts = await client.getConversation(taskId);
      setTurns(ts);
      refreshFleet();
    } else {
      setNotice("回滚失败");
    }
  };

  // 轮级动作：复制 / 回滚
  const turnActions = (turn: Turn, userIndex: number) => (
    <span className="node__actions">
      {turn.assistantText && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => void navigator.clipboard?.writeText(turn.assistantText ?? "")}
        >
          复制
        </Button>
      )}
      {rewindArm === userIndex ? (
        <Button size="sm" variant="destructive" onClick={() => void doRewind(userIndex)}>
          确认回滚？
        </Button>
      ) : (
        <Button size="sm" variant="ghost" onClick={() => setRewindArm(userIndex)}>
          回滚到此
        </Button>
      )}
    </span>
  );

  let userIdx = -1;

  return (
    <div className="spine" data-slot="spine">
      <div className="spine__head">
        <Dot kind={running ? "running" : awaiting ? "awaiting" : task?.status === "failed" ? "failed" : "idle"} pulse={running} />
        <span className="spine__title">{task?.title ?? taskId}</span>
        <span className="spine__meta">{task?.model ?? ""}</span>
        <Badge tone={running ? "success" : awaiting ? "warn" : "neutral"}>
          {running ? "运行中" : awaiting ? "待裁决" : task?.status ?? "—"}
        </Badge>
        <ViewSwitch />
        {(running || awaiting) && (
          <Button size="sm" variant="outline" className="chip" onClick={() => void client.cancel(taskId).then(refreshFleet)}>
            取消
          </Button>
        )}
      </div>

      <div className="spine__scroll" ref={scrollRef}>
        <div className="spine__col">
          {digest && !digestHidden && (
            <div className="digest" role="status">
              <Dot kind="idle" />
              {digestLabel ?? "离开期间"}：{digest.turns} 个轮次{digest.tools > 0 ? ` · ${digest.tools} 次工具调用` : ""}
              <span className="digest__actions">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    markSeen(taskId);
                    bumpMeta();
                    setDigestHidden(true);
                  }}
                >
                  标为已读
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setDigestHidden(true)}>
                  忽略
                </Button>
              </span>
            </div>
          )}

          {notice && (
            <div className="digest" role="status">
              {notice}
              <span className="digest__actions">
                <Button size="sm" variant="ghost" onClick={() => setNotice(null)}>
                  关闭
                </Button>
              </span>
            </div>
          )}

          {!loaded && <div className="node node--assistant">正在回放会话日志…</div>}
          {loaded && turns.length === 0 && !live && (
            <div className="node node--assistant">
              该会话暂无可读日志（守护进程未回放历史）—— 追问可从此处继续。
            </div>
          )}

          {turns.map((turn, i) => {
            if (turn.userText != null) userIdx += 1;
            const myIdx = userIdx;
            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {turn.userText != null && (
                  <div className="node node--user">
                    <div className="node__meta">
                      <span className="meta-label">你</span>
                      <span className="spine__meta">{fmtTime(turn.startedAt)}</span>
                    </div>
                    <div className="node__text">{turn.userText}</div>
                    {turnActions(turn, myIdx)}
                  </div>
                )}
                {(turn.assistantText || turn.toolCalls?.length || turn.thought) && (
                  <div className="node node--assistant">
                    <div className="node__meta">
                      <span className="meta-label">Agent</span>
                    </div>
                    {turn.thought && <div className="thought">💭 {turn.thought}</div>}
                    {turn.assistantText && <AssistantBody text={turn.assistantText} />}
                    {turn.toolCalls?.map((tc, ti) => (
                      <ToolBlock key={ti} name={tc.name} input={tc.input} output={tc.output} />
                    ))}
                    {turnActions(turn, myIdx)}
                  </div>
                )}
              </div>
            );
          })}

          {/* live 流式节点 */}
          {live && (
            <div className="node node--assistant" data-live="true">
              <div className="node__meta">
                <span className="meta-label">Agent</span>
                <Dot kind={live.status === "awaiting-approval" ? "awaiting" : "running"} pulse />
              </div>
              {live.thought && <div className="thought">💭 {live.thought}</div>}
              {live.text && <AssistantBody text={live.text} />}
              {live.toolCalls.map((tc, ti) => (
                <ToolBlock
                  key={ti}
                  name={tc.name}
                  input={tc.input}
                  output={tc.output}
                  pending={live.pending?.name === tc.name && !tc.output}
                />
              ))}

              {live.status === "awaiting-approval" && live.pending && (
                <div className="approval" data-slot="approval">
                  <span className="meta-label" style={{ color: "var(--warn)" }}>
                    请求裁决
                  </span>
                  <div className="approval__cmd">
                    {live.pending.name} {JSON.stringify(live.pending.input)}
                  </div>
                  <div className="approval__actions">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        bumpApproval(true);
                        void client.approveTool(taskId, true).then(refreshFleet);
                      }}
                    >
                      允许
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        bumpApproval(false);
                        void client.approveTool(taskId, false).then(refreshFleet);
                      }}
                    >
                      拒绝
                    </Button>
                  </div>
                </div>
              )}

              {live.elicitation && (
                <div className="approval" data-slot="elicitation">
                  <span className="meta-label" style={{ color: "var(--accent)" }}>
                    需要你回答
                  </span>
                  <div className="approval__cmd">
                    {String((live.elicitation.message as string) ?? "（问卷）")}
                    {(() => {
                      const props = ((live.elicitation.requestedSchema as { properties?: Record<string, { title?: string }> })?.properties) ?? {};
                      const names = Object.values(props).map((p) => p.title).filter(Boolean);
                      return names.length ? `\n字段：${names.join(" / ")}` : "";
                    })()}
                  </div>
                  <div className="approval__actions">
                    <Button size="sm" variant="primary" onClick={() => void client.resolveElicitation(taskId, "accept", {}).then(refreshFleet)}>
                      接受（默认值）
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => void client.resolveElicitation(taskId, "decline").then(refreshFleet)}>
                      拒绝
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {queue.length > 0 && (
            <div className="queue">
              <span className="meta-label">队列</span>
              {queue.map((q, i) => (
                <Badge key={i}>{q.slice(0, 40)}</Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="followup">
        <div className="followup__inner">
          <textarea
            ref={areaRef}
            rows={1}
            placeholder={running ? "运行中 —— 消息将排队" : "追问… (Enter 发送)"}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void sendFollowUp();
              }
            }}
          />
          <Button size="sm" variant="primary" disabled={!draft.trim()} onClick={() => void sendFollowUp()}>
            发送
          </Button>
        </div>
      </div>
    </div>
  );
}
