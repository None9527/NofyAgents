/**
 * ContextRing —— 上下文用量的 14px 圆环（无状态图形件）。
 *
 * ## 活壳逐字对照（逆向 ModelSelector.tsx:723-754 ContextRingGlyph）
 *
 *   viewBox 24 · r=10 · strokeWidth=4 · size-3.5(14px)
 *   track：stroke=currentColor opacity .25（常亮）
 *   arc  ：stroke=currentColor opacity .7、strokeLinecap round、rotate(-90) 从 12 点起
 *   用量表达：活壳用 dasharray=周长 + dashoffset=周长×(1-ratio)；
 *   我们用 dasharray="已用弧长 周长"——两者等价，少一个 style 属性，
 *   过渡动画已在 .ctx__arc 的 CSS 里。
 *
 * ## 为什么只是图形、不是按钮
 *
 * 按钮语义（aria-haspopup/aria-expanded）、悬停与钉住状态、浮层内容都住在
 * features/conversation/ContextMeter.tsx：图形件不含状态，ui/ 不 import features/
 * （dep-guard 分层的既有方向）。
 *
 * 没数据时也画环：track 常亮、arc 不画——活壳同行为
 * （2026-09-11 用户抓过「新会话右簇少一枚图标」，故不再返回 null）。
 */
const R = 10;
const CIRC = 2 * Math.PI * R;
/** 内圈＝本轮缓存命中率（E8）：r=5.5 与外圈用量弧同心不叠。 */
const R2 = 5.5;
const CIRC2 = 2 * Math.PI * R2;

export function ContextRing({ ratio, cacheHit = null }: { ratio: number; cacheHit?: number | null }) {
  const clamped = Number.isFinite(ratio) ? Math.min(1, Math.max(0, ratio)) : 0;
  const hit = cacheHit === null || !Number.isFinite(cacheHit) ? null : Math.min(1, Math.max(0, cacheHit));
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r={R} className="ctx__track" strokeWidth={4} />
      {clamped > 0 ? (
        <circle
          cx="12"
          cy="12"
          r={R}
          className="ctx__arc"
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={String(CIRC * clamped) + " " + String(CIRC)}
          transform="rotate(-90 12 12)"
        />
      ) : null}
      {hit !== null ? (
        <>
          <circle cx="12" cy="12" r={R2} className="ctx__cachetrack" strokeWidth={2.5} />
          {hit > 0 ? (
            <circle
              cx="12"
              cy="12"
              r={R2}
              className="ctx__cachearc"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeDasharray={String(CIRC2 * hit) + " " + String(CIRC2)}
              transform="rotate(-90 12 12)"
            />
          ) : null}
        </>
      ) : null}
    </svg>
  );
}
