import { tr } from "../../ui/i18n.ts";
import { useLocale } from "../../ui/useLocale.ts";
/**
 * ContextMeter —— 圆环按钮 + 上下文用量浮层。
 *
 * ## 形态依据（活壳逐字对照，逆向树）
 *
 * 活壳那枚是 Radix HoverCard（openDelay=0 / closeDelay=0，side=top，sideOffset=2）：
 *   触发器 ContextRingTrigger = ghost icon-md 按钮（28×28）里放 ContextRingGlyph
 *     —— ModelSelector.tsx:756-767
 *   浮层壳 !w-80 !rounded-xl !shadow-md，内容 bg-menu p-3 space-y-3
 *     —— ModelSelector.tsx:769-783 + Home.tsx:5752-5760
 *   内容顺序：标题 + 右对齐等宽汇总 → SegmentedProgress(h-2 bg-surface, indicator min-w-2)
 *     → 图例行（size-2 色块 + 来源名 + 右对齐百分比 tabular-nums）→ 可选页脚行
 *     —— Home.tsx:5758-5843
 *
 * UI AnchoredPopover 使用原生 top layer，定位与尺寸不受 dock/卡片的 overflow 裁剪。
 * 悬停可读，点击钉住，外点与 Escape 关闭；跨过浮层间隙时短暂延迟关闭。
 *
 * ## 内容换成内核真字段
 *
 * 视图模型全在 contextModel.ts（纯函数、node 下可测）；本文件只排版：
 *   堆叠条 = 消息 / 系统提示 / 工具定义（三个互斥来源）
 *   单列栏 = usageCategories（技能/工作流/MCP 清单，**与消息重叠**，故不相加）
 *   页脚   = 剩余可用 / 自动压缩阈值（含距阈值 tok）/ 回合 / 工具调用 / 已压缩
 *   条上刻度 = autoCompactThresholdPercent（活壳没有；内核给了就画，不猜默认值）
 */
import { useEffect, useRef, useState } from "react";
import { AnchoredPopover } from "../../ui/anchoredPopover.tsx";
import { ContextRing } from "../../ui/contextmeter.tsx";
import type { ContextView } from "./contextModel.ts";
import { formatTokens } from "./contextModel.ts";

function pctText(p: number): string {
  return String(Math.round(p * 1000) / 10) + "%";
}

export function ContextMeter({ view }: { view: ContextView }) {
  useLocale();
  const anchor = useRef<HTMLButtonElement>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (leaveTimer.current) clearTimeout(leaveTimer.current); }, []);
  const enter = () => { if (leaveTimer.current) clearTimeout(leaveTimer.current); setHover(true); };
  const leave = () => { if (leaveTimer.current) clearTimeout(leaveTimer.current); leaveTimer.current = setTimeout(() => setHover(false), 120); };
  const [hover, setHover] = useState(false);
  const [pinned, setPinned] = useState(false);
  const open = hover || pinned;
  const close = (): void => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setPinned(false);
    setHover(false);
  };
  return (
    <span
      className="ctxwrap"
      onMouseEnter={enter}
      onMouseLeave={leave}
    >
      <button
        ref={anchor}
        type="button"
        className={"ctx" + (view.warn ? " ctx--warn" : "")}
        aria-label={view.ringLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        onFocus={enter}
        onBlur={leave}
        onClick={() => setPinned((p) => !p)}
        onKeyDown={(e) => {
          if (e.key === "Escape") close();
        }}
      >
        <ContextRing ratio={view.ratio} cacheHit={view.cache.hit} />
      </button>
      {open ? (
        <AnchoredPopover anchor={anchor} className="ctxpop" label={view.title} onClose={close} onMouseEnter={enter} onMouseLeave={leave}>
            <span className="ctxpop__head">
              <span className="ctxpop__title">{view.title}</span>
              <span className="ctxpop__summary">{view.summary}</span>
            </span>
            {view.hasData ? (
              <span className="ctxbar" role="img" aria-label={tr("上下文用量 ") + String(view.pct) + "%"}>
                <span className="ctxbar__fill" style={{ width: pctText(view.ratio) }}>
                  {view.segments.map((s) => (
                    <span
                      key={s.id}
                      className={"ctxbar__seg ctxbar__seg--" + String(s.colorIndex)}
                      style={{ flexBasis: pctText(s.percent) }}
                    />
                  ))}
                </span>
                {view.thresholdPct !== null ? (
                  <span
                    className="ctxbar__tick"
                    style={{ left: String(view.thresholdPct) + "%" }}
                    aria-hidden="true"
                  />
                ) : null}
              </span>
            ) : null}
            {view.segments.length > 0 ? (
              <span className="ctxpop__legend">
                {view.segments.map((s) => (
                  <span key={s.id} className="ctxrow">
                    <span
                      className={"ctxrow__sw ctxbar__seg--" + String(s.colorIndex)}
                      aria-hidden="true"
                    />
                    <span className="ctxrow__label">{s.label}</span>
                    {s.detail !== null ? <span className="ctxrow__detail">{s.detail}</span> : null}
                    <span className="ctxrow__num">{pctText(s.percent)}</span>
                  </span>
                ))}
              </span>
            ) : null}
            {view.listings.length > 0 ? (
              <span className="ctxpop__group">
                <span className="ctxpop__grouptitle">{tr("清单注入")}<span className="ctxpop__grouphint">{tr("已计入消息")}</span>
                </span>
                {view.listings.map((l) => (
                  <span key={l.id} className="ctxrow">
                    <span className="ctxrow__label">{l.label}</span>
                    {l.detail !== null ? <span className="ctxrow__detail">{l.detail}</span> : null}
                    <span className="ctxrow__num">{formatTokens(l.tokens) + " tok"}</span>
                  </span>
                ))}
              </span>
            ) : null}
            {view.stats.length > 0 ? (
              <span className="ctxpop__stats">
                {view.stats.map((s) => (
                  <span key={s.id} className="ctxrow">
                    <span className="ctxrow__label">{s.label}</span>
                    <span className={"ctxrow__num" + (s.strong === true ? " ctxrow__num--strong" : "")}>
                      {s.value}
                    </span>
                  </span>
                ))}
              </span>
            ) : null}
            {view.hasData ? null : (
              <span className="ctxpop__empty">{tr("等待内核回传 context 块（每 6s 轮询 _nofy/session/info）")}</span>
            )}
        </AnchoredPopover>
      ) : null}
    </span>
  );
}
