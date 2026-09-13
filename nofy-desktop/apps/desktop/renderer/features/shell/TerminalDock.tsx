/**
 * TerminalDock —— 对话列底部的终端面板（生态面 #3）。
 *
 * ## 活壳解剖（3.11.2，CDP 实测；zcode-live-metrics.md §1.6）
 *
 *   section[data-testid=terminal]   flex h-full min-h-0 flex-col gap-2 overflow-hidden
 *                                   bg-background p-3 pb-2      （内缩 12/12/8、gap 8）
 *    └ div.group/tabs               flex data-horizontal:flex-col h-full min-h-0 gap-2
 *      ├ 头行                        flex shrink-0 items-center gap-2   h-28
 *      │ ├ 左簇                      flex min-w-0 shrink-0 items-center gap-2：「终端」+ shell 名芯片（实测 "fish"）
 *      │ ├ tab 列                    min-w-0 flex-1 overflow-x-auto !scrollbar-hide
 *      │ │                          （tab 名 = cwd 末段，重名 " 2"：实测 "nofy-build" / "nofy-build 2"）
 *      │ └ 右簇                      flex shrink-0 items-center gap-1：新建终端 28×28 + 关闭终端面板 28×28（radius 8）
 *      └ 体                          min-h-0 flex-1 overflow-hidden
 *        └ 每 tab 一片               data-[state=inactive]:hidden（非活动片是隐藏，不是卸载）
 *          └ .terminal-xterm-shell   h-full min-h-0 w-full overflow-hidden → .xterm（DOM renderer）
 *
 * xterm 的字号与字体栈来自活壳注入规则 `.xterm-dom-renderer-owner-N .xterm-rows`
 * （13px + 终端专用 mono 栈；常量与出处在 ui/theme.ts）。
 *
 * ## 三条实现纪律
 *
 * 1. **字节不进 React**：输出帧走 core/ptybus（流不进 store），命令式 term.write；
 *    React 只管 tab 条与容器。dockModel.applyFrame 对普通 output 帧返回**同一数组引用**，
 *    所以一秒几十帧也只重渲 0 次。
 * 2. **收起 ≠ 销毁**：面板关掉时组件保持挂载（活壳同行为：收起后 .xterm 仍在 DOM，只是 0×0），
 *    pty 与其中正在跑的进程继续活着，输出继续进 xterm 的 scrollback ⇒ 重新展开历史还在。
 * 3. **isReplay 先 reset**：pty/load 的回放帧按内核源码要求「reset its VTE emulator and feed
 *    all bytes from scratch」（pty_session.rs:773-815），否则重挂接会把历史叠成两份。
 *
 * ## 刻意差别（有据，不是偷懒）
 *
 * - 活壳左簇那枚 **shell 名芯片我们不画**：resolved shell 没有读路径（TerminalInfo 不含 shell，
 *   而我们不传 pty/create 的 shell 参数 ⇒ 客户端也不知道内核最后起了谁）。画个猜的名字比不画坏。
 * - 活壳 dock 顶边那条 `border-t border-border … opacity-0 pointer-events-none` 是**拖高手柄**
 *   （当前隐藏）。本版固定高度（280，与活壳展开态同量级），拖高留到布局批。
 * - 活壳多一层 group/tabs 是 Radix Tabs 的结构需要；我们没有那层组件 ⇒ head + body 直挂根，
 *   padding/gap 度量不变。
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { onTerminalFrame } from "../../core/ptybus.ts";
import type { TerminalFrame } from "../../core/ptybus.ts";
import type { Runtime } from "../../core/runtime.ts";
import { IconPlus, IconTerminal, IconX } from "../../ui/icons.tsx";
import { DOCK_HEIGHT_DEFAULT, DOCK_HEIGHT_MAX, DOCK_HEIGHT_MIN } from "../../ui/prefs.ts";
import { readTerminalId, readTerminalList, readTerminalLoad } from "../../ui/readers.ts";
import { resolveTerminalPalette, TERMINAL_FONT_FAMILY, TERMINAL_FONT_SIZE } from "../../ui/theme.ts";
import type { ThemeName } from "../../ui/theme.ts";
import {
  adoptableTerminals,
  applyFrame,
  exitNote,
  makeTab,
  nextActiveAfterClose,
  nextTabName,
  reconcile,
  tabNameFromCwd,
} from "./dockModel.ts";
import type { DockTab } from "./dockModel.ts";

export type TerminalDockProps = {
  runtime: Runtime;
  /** 建 pty 与 terminal/list 都要它（内核按会话归置终端）。 */
  sessionId: string | null;
  /** pty 的 cwd，也是 tab 名的来源（活壳口径：cwd 末段）。 */
  cwd: string | null;
  /** 主题名只用于「该重读配色了」这个信号；颜色本身从 dock 根的 computed 值读。 */
  theme: ThemeName;
  open: boolean;
  onClose: () => void;
  /** 面板高（px，LayoutPrefs.dockHeight）；顶缘把手拖拽改它，双击恢复默认。 */
  height: number;
  onHeight: (h: number) => void;
};

type Slot = { term: Terminal; fit: FitAddon; el: HTMLDivElement | null };

export function TerminalDock({ runtime, sessionId, cwd, theme, open, onClose, height, onHeight }: TerminalDockProps) {
  const [tabs, setTabs] = useState<readonly DockTab[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** 顶缘拖高起点（元素级 pointer 捕获，features 不碰 window/document）。 */
  const resizeFrom = useRef<{ y: number; h: number } | null>(null);
  /** 接管核对（terminal/list）跑完了没有：没跑完不自动建终端，否则会和接管抢第一个 tab。 */
  const [probed, setProbed] = useState(false);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const slots = useRef(new Map<string, Slot>());
  const panes = useRef(new Map<string, HTMLDivElement>());
  /** 帧监听与回调里要读「最新」的 tabs / 出站上下文：ref 而不是依赖数组（监听只挂一次）。 */
  const tabsRef = useRef(tabs);
  tabsRef.current = tabs;
  const ctx = useRef({ runtime, sessionId, cwd });
  ctx.current = { runtime, sessionId, cwd };
  /** 自动建第一个终端的重试闸，按会话记：会话从 null 变成真有（启动序列里 session/new 要几秒）
   * 之后应当再试一次；同一个会话里失败则不无限重试（错误留在头上，用户按「＋」是显式意图）。 */
  const autoTriedFor = useRef<string | null>(null);

  /* ── 入站：输出与生命周期帧（core/ptybus，流不进 store） ── */
  useEffect(() => {
    return onTerminalFrame((frame: TerminalFrame) => {
      const slot = slots.current.get(frame.terminalId);
      if (slot !== undefined && frame.type === "output" && frame.text !== null && frame.text.length > 0) {
        if (frame.isReplay) slot.term.reset(); // 源码义务：回放前清空模拟器
        slot.term.write(frame.text);
      }
      if (frame.type === "exit" && slot !== undefined) {
        const tab = tabsRef.current.find((t) => t.terminalId === frame.terminalId);
        if (tab !== undefined && !tab.exited) {
          slot.term.write(exitNote({ exitCode: frame.exitCode, signal: frame.signal, missing: false }));
        }
      }
      setTabs((ts) => applyFrame(ts, frame)); // 普通 output 帧 ⇒ 同引用 ⇒ 不重渲
    });
  }, []);

  /* ── 尺寸：fit 之后必须把真实 rows/cols 告诉内核，否则 shell 按 80×24 折行 ── */
  const fitNow = useCallback((id: string): void => {
    const slot = slots.current.get(id);
    if (slot === undefined || slot.el === null) return;
    // 收起中（display:none）量出来是 0×0，fit 会给出荒谬的 rows/cols ⇒ 不量，等展开时再 fit
    if (slot.el.clientWidth < 8 || slot.el.clientHeight < 8) return;
    try {
      slot.fit.fit();
    } catch {
      return; // 尺寸尚未稳定：ResizeObserver 或切 tab 时会再来
    }
    const rows = slot.term.rows;
    const cols = slot.term.cols;
    if (rows < 1 || cols < 1) return;
    void ctx.current.runtime.effect({ kind: "terminal/resize", terminalId: id, rows, cols });
  }, []);

  /* ── 出站：新建 ── */
  const createTab = useCallback((): void => {
    const { runtime: rt, sessionId: sid, cwd: dir } = ctx.current;
    if (sid === null || dir === null) {
      setError("终端要等会话就绪（session/new 之后才有 sessionId 与 cwd）");
      return;
    }
    setCreating(true);
    setError(null);
    const name = nextTabName(tabsRef.current, dir);
    // rows/cols 先给内核默认 24×80；xterm 挂上后由 fitNow 立刻 resize 成真实尺寸
    void rt.effect({ kind: "terminal/create", sessionId: sid, cwd: dir, rows: 24, cols: 80, name }).then((r) => {
      setCreating(false);
      if (!r.ok) {
        setError("新建终端失败：" + r.error);
        return;
      }
      const id = readTerminalId(r.value);
      if (id === null) {
        setError("pty/create 没给 terminalId（形状见 ecosystem-shapes.json）");
        return;
      }
      setTabs((ts) => [...ts, makeTab(id, name)]);
      setActiveId(id);
    });
  }, []);

  /**
   * 接管已经在内核里的交互 pty（本窗口之前建的、内核重启前建的）。
   * terminal/list 只给存活事实；**历史输出靠 pty/load 的回放**（256KiB 环形缓冲，isReplay）
   * ——那是第一方为重挂接设计的路径，所以接管出来的 tab 不是空白假壳。
   *
   * 两条内核事实决定了这里的过滤与重跑（dockModel.ts 文件头有出处）：
   * list **忽略 sessionId**（全局清单）⇒ 切换会话后重新核对是安全的；
   * 清单里混着 agent 的**管道终端**（interactive=false）⇒ 必须过滤，否则模型每跑一次
   * bash 工具，dock 就多一个点不进去的假 tab。
   */
  const adopt = useCallback((): void => {
    const { runtime: rt, sessionId: sid } = ctx.current;
    if (sid === null) {
      setProbed(true);
      return;
    }
    void rt.effect({ kind: "terminal/list", sessionId: sid }).then((r) => {
      setProbed(true);
      if (!r.ok) return; // 读不到列表就保持现状：不编 tab
      const list = adoptableTerminals(readTerminalList(r.value));
      const before = tabsRef.current;
      const fresh = list.filter((t) => !before.some((k) => k.terminalId === t.terminalId));
      const merged: DockTab[] = [...before, ...fresh.map((t) => makeTab(t.terminalId, t.name ?? tabNameFromCwd(t.cwd)))];
      const next = reconcile(merged, list);
      for (const tab of next) {
        const prev = before.find((b) => b.terminalId === tab.terminalId);
        if (tab.missing && (prev === undefined || !prev.missing)) {
          slots.current.get(tab.terminalId)?.term.write(
            exitNote({ exitCode: tab.exitCode, signal: tab.signal, missing: true }),
          );
        }
      }
      setTabs(next);
      // 回放要在 xterm 挂上之后才有地方写；帧会先到 ptybus，故 load 稍后发（下一轮 microtask 足够，
      // 因为 tab 进 state 后同一提交里就会建 slot；为稳妥用 rAF 排到 paint 之后）
      if (fresh.length > 0) {
        requestAnimationFrame(() => {
          for (const t of fresh) {
            void rt.effect({ kind: "terminal/load", terminalId: t.terminalId }).then((lr) => {
              if (!lr.ok) return; // 回放不来就算了：tab 已经在了，输出帧到了自然会写
              // load 的响应里就带着 exited/exitCode（PtyLoadResult）：已死的终端立刻上徽标，
              // 不等那条 isReplay 的 exit 帧（它也会来，applyFrame 对重复事实是幂等的）。
              const info = readTerminalLoad(lr.value);
              if (info.exited) {
                setTabs((ts) =>
                  applyFrame(ts, {
                    terminalId: t.terminalId,
                    type: "exit",
                    text: null,
                    exitCode: info.exitCode,
                    signal: null,
                    outputOffset: null,
                    isReplay: false,
                  }),
                );
              }
            });
          }
        });
        setActiveId((cur) => cur ?? next[0]?.terminalId ?? null);
      }
    });
  }, []);

  useEffect(() => {
    if (sessionId === null) return;
    adopt();
  }, [adopt, sessionId]);

  // 面板打开且确实一个终端都没有 ⇒ 建第一个（只试一次：失败不无限重试，错误留在头上）
  useEffect(() => {
    if (!open || !probed || tabs.length > 0 || sessionId === null || autoTriedFor.current === sessionId) return;
    autoTriedFor.current = sessionId;
    createTab();
  }, [createTab, open, probed, sessionId, tabs.length]);

  /* ── xterm 实例的创建/销毁（每个 tab 一个，非活动片隐藏但不卸载） ── */
  useEffect(() => {
    for (const tab of tabs) {
      const id = tab.terminalId;
      if (slots.current.has(id)) continue;
      const el = panes.current.get(id);
      if (el === undefined) continue; // 容器这一轮还没挂上：tabs 再变时补
      const term = new Terminal({
        fontSize: TERMINAL_FONT_SIZE,
        fontFamily: TERMINAL_FONT_FAMILY,
        theme: resolveTerminalPalette(rootRef.current),
        cursorBlink: true,
        scrollback: 5000,
        allowProposedApi: false,
      });
      const fit = new FitAddon();
      term.loadAddon(fit);
      term.open(el);
      term.onData((data: string) => {
        // 输入必须 notify + base64（rpc 得 -32601；用 input 键被静默丢弃）——两条都实测过。
        // 强制点在 core/effects.ts，这里只把字节交出去（xterm 的查询应答也走同一条路）。
        void ctx.current.runtime.effect({ kind: "terminal/input", terminalId: id, text: data });
      });
      slots.current.set(id, { term, fit, el });
      requestAnimationFrame(() => fitNow(id));
    }
  }, [fitNow, tabs]);

  // 主题换了 ⇒ 重读 dock 根的 computed 配色。等一帧：App 的主题 class 挂在它自己的 effect 里，
  // 而父组件 effect 在子组件之后跑，同步读会读到上一个主题。
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const palette = resolveTerminalPalette(rootRef.current);
      for (const slot of slots.current.values()) slot.term.options.theme = palette;
    });
    return () => cancelAnimationFrame(raf);
  }, [theme]);

  // 容器尺寸变了（拖窗口 / 收放侧栏或辅助 pane）⇒ 重 fit 活动片
  useEffect(() => {
    const el = bodyRef.current;
    if (el === null || activeId === null) return;
    let raf = 0;
    const ro = new ResizeObserver(() => {
      if (raf !== 0) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        raf = 0;
        fitNow(activeId);
      });
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      if (raf !== 0) cancelAnimationFrame(raf);
    };
  }, [activeId, fitNow]);

  // 展开 / 切 tab ⇒ 该片从 0×0 变成有尺寸，补一次 fit（并把真实 rows/cols 报给内核）
  useEffect(() => {
    if (!open || activeId === null) return;
    const raf = requestAnimationFrame(() => fitNow(activeId));
    return () => cancelAnimationFrame(raf);
  }, [activeId, fitNow, open]);

  const closeTab = useCallback((id: string): void => {
    const { runtime: rt, sessionId: sid } = ctx.current;
    const slot = slots.current.get(id);
    if (slot !== undefined) {
      slot.term.dispose();
      slots.current.delete(id);
    }
    panes.current.delete(id);
    const cur = tabsRef.current;
    setTabs(cur.filter((t) => t.terminalId !== id));
    setActiveId((a) => nextActiveAfterClose(cur, id, a));
    // kill 的线路形状带 sessionId（内核对 pty 只按 terminalId 找，形状照实测发）
    if (sid !== null) {
      void rt.effect({ kind: "terminal/kill", terminalId: id, sessionId: sid }).then((r) => {
        if (!r.ok) setError("关闭终端失败：" + r.error);
      });
    }
  }, []);

  // 卸载只销毁 xterm 实例，**不 kill pty**：本组件卸载＝窗口关闭/应用退出，那时内核子进程一起走，
  // pty 由内核自己收（create_pty 里 enroll_terminal_pid 登记的进程组）。反过来若在这里 kill，
  // 「收起面板」一旦改成卸载就会杀掉用户正在跑的 dev server。
  useEffect(() => {
    const owned = slots.current;
    const paneMap = panes.current;
    return () => {
      for (const slot of owned.values()) slot.term.dispose();
      owned.clear();
      paneMap.clear();
    };
  }, []);

  return (
    <section
      className={"dock" + (open ? "" : " dock--closed")}
      aria-label="终端面板"
      ref={rootRef}
      style={{ height: String(Math.round(height)) + "px" }}
    >
      <div
        className="dock__resize"
        title="拖拽调整终端面板高度 · 双击恢复默认"
        onPointerDown={(e: ReactPointerEvent<HTMLDivElement>) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          resizeFrom.current = { y: e.clientY, h: height };
        }}
        onPointerMove={(e: ReactPointerEvent<HTMLDivElement>) => {
          const from = resizeFrom.current;
          if (from === null) return;
          // 顶缘把手：向上拖变高 ⇒ 高 = 起点高 - 位移
          const next = from.h - (e.clientY - from.y);
          onHeight(Math.min(DOCK_HEIGHT_MAX, Math.max(DOCK_HEIGHT_MIN, next)));
        }}
        onPointerUp={(e: ReactPointerEvent<HTMLDivElement>) => {
          resizeFrom.current = null;
          if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
        }}
        onDoubleClick={() => onHeight(DOCK_HEIGHT_DEFAULT)}
      />
      <div className="dock__head">
        <div className="dock__tabs" role="tablist" aria-label="终端标签">
          {tabs.map((t) => {
            const on = t.terminalId === activeId;
            const dead = t.exited || t.missing;
            const title =
              t.name +
              (t.busy ? "（前台进程运行中）" : "") +
              (dead ? " " + exitNote({ exitCode: t.exitCode, signal: t.signal, missing: t.missing }).trim() : "") +
              (t.replayed ? " · 含内核回放的历史输出" : "");
            return (
              <span key={t.terminalId} className="dock__tabwrap" role="presentation">
                <button
                  type="button"
                  role="tab"
                  id={"docktab-" + t.terminalId}
                  aria-selected={on}
                  className={"dock__tab" + (on ? " dock__tab--on" : "")}
                  onClick={() => setActiveId(t.terminalId)}
                  title={title}
                >
                  <IconTerminal size={12} />
                  <span className="dock__tabname">{t.name}</span>
                  {t.busy ? <span className="dock__busy" /> : null}
                  {dead ? <span className="dock__badge">已退出</span> : null}
                </button>
                <button
                  type="button"
                  className="dock__tabx"
                  aria-label={"关闭终端 " + t.name}
                  title="关闭这个终端：_nofy/terminal/kill，里面的进程会被结束（不可恢复）"
                  onClick={() => closeTab(t.terminalId)}
                >
                  <IconX size={12} />
                </button>
              </span>
            );
          })}
        </div>
        {error !== null ? (
          <span className="dock__error" title={error}>
            {error}
          </span>
        ) : null}
        <button
          type="button"
          className="iconbtn"
          onClick={createTab}
          disabled={creating}
          aria-label="新建终端"
          title="新建终端：_nofy/terminal/pty/create（内核默认按 $SHELL -l 起登录 shell；名字取工作区末段）"
        >
          <IconPlus size={16} />
        </button>
        <button
          type="button"
          className="iconbtn"
          onClick={onClose}
          aria-label="关闭终端面板"
          title="关闭终端面板：只收起，终端与其中正在跑的进程继续活着（⌘J 或卡片头「切换终端」再展开）"
        >
          <IconX size={16} />
        </button>
      </div>
      <div className="dock__body" ref={bodyRef}>
        {tabs.length === 0 ? (
          <p className="dock__empty">
            还没有终端。点右上「＋」新建：内核按 <span className="mono">$SHELL -l</span> 起一个登录 shell，
            名字取工作区末段。第一屏可能要等一下——shell 启动时会向终端发能力查询
            （DA1 / XTVERSION / kitty 键盘 / OSC 11），xterm 会代答它认得的那几种。
          </p>
        ) : null}
        {tabs.map((t) => (
          <div
            key={t.terminalId}
            role="tabpanel"
            aria-labelledby={"docktab-" + t.terminalId}
            className={"dock__pane" + (t.terminalId === activeId ? "" : " dock__pane--hidden")}
            ref={(el) => {
              if (el === null) panes.current.delete(t.terminalId);
              else panes.current.set(t.terminalId, el);
            }}
          />
        ))}
      </div>
    </section>
  );
}
