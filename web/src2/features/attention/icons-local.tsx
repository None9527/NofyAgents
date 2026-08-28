// 本地小图标（注意力域专用，避免污染全局 icons）
export function IconGauge({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M2.5 10.5a5.5 5.5 0 1 1 11 0" />
      <path d="M8 10.5 10.5 7" />
    </svg>
  );
}
