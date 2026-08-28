// 内联图标（S0 最小集；S2+ 移植旧 icons.tsx 扩充）

interface IconProps {
  size?: number;
}

function base(size: number) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
}

export function IconLogo({ size = 16 }: IconProps) {
  return (
    <svg {...base(size)} aria-hidden>
      <rect x="2.5" y="2.5" width="11" height="11" rx="3" />
      <path d="M8 5.5v5M5.5 8h5" />
    </svg>
  );
}

export function IconPanelLeft({ size = 16 }: IconProps) {
  return (
    <svg {...base(size)} aria-hidden>
      <rect x="2" y="2.5" width="12" height="11" rx="2" />
      <path d="M6.5 2.5v11" />
    </svg>
  );
}

export function IconPanelRight({ size = 16 }: IconProps) {
  return (
    <svg {...base(size)} aria-hidden>
      <rect x="2" y="2.5" width="12" height="11" rx="2" />
      <path d="M9.5 2.5v11" />
    </svg>
  );
}

export function IconSun({ size = 16 }: IconProps) {
  return (
    <svg {...base(size)} aria-hidden>
      <circle cx="8" cy="8" r="3" />
      <path d="M8 1.8v1.6M8 12.6v1.6M1.8 8h1.6M12.6 8h1.6M3.6 3.6l1.1 1.1M11.3 11.3l1.1 1.1M12.4 3.6l-1.1 1.1M4.7 11.3l-1.1 1.1" />
    </svg>
  );
}

export function IconChevronLeft({ size = 16 }: IconProps) {
  return (
    <svg {...base(size)} aria-hidden>
      <path d="M10 3.5 5.5 8 10 12.5" />
    </svg>
  );
}

export function IconChevronRight({ size = 16 }: IconProps) {
  return (
    <svg {...base(size)} aria-hidden>
      <path d="M6 3.5 10.5 8 6 12.5" />
    </svg>
  );
}

export function IconChevronDown({ size = 16 }: IconProps) {
  return (
    <svg {...base(size)} aria-hidden>
      <path d="M3.5 6 8 10.5 12.5 6" />
    </svg>
  );
}

export function IconRefresh({ size = 16 }: IconProps) {
  return (
    <svg {...base(size)} aria-hidden>
      <path d="M13 8a5 5 0 1 1-1.5-3.6M13 2.8v2.7h-2.7" />
    </svg>
  );
}

export function IconTerminal({ size = 16 }: IconProps) {
  return (
    <svg {...base(size)} aria-hidden>
      <rect x="2" y="2.5" width="12" height="11" rx="2" />
      <path d="m4.5 6 2.5 2-2.5 2M8.5 10.5H11" />
    </svg>
  );
}

export function IconMoon({ size = 16 }: IconProps) {
  return (
    <svg {...base(size)} aria-hidden>
      <path d="M13.5 9.5A5.5 5.5 0 0 1 6.5 2.5a5.5 5.5 0 1 0 7 7Z" />
    </svg>
  );
}
