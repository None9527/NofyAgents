// Hand-drawn line icons approximating the reference UI glyphs.
import type { SVGProps } from "react";

const base = (props: SVGProps<SVGSVGElement>) => ({
  width: 16,
  height: 16,
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...props,
});

export const IconPlusCircle = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <circle cx="8" cy="8" r="6.2" />
    <path d="M8 5.4v5.2M5.4 8h5.2" />
  </svg>
);

export const IconSearch = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <circle cx="7" cy="7" r="4.4" />
    <path d="M10.4 10.4L13.6 13.6" />
  </svg>
);

export const IconAutomation = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <rect x="2.5" y="4" width="11" height="9" rx="2" />
    <path d="M6 2.5h4M8 2.5V4M6 8.5l1.6 1.6L10.4 7" />
  </svg>
);

export const IconSkill = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M3 13l4-4M8.5 3.5l1.2 2.8 2.8 1.2-2.8 1.2-1.2 2.8-1.2-2.8L4.5 7.5l2.8-1.2zM12.5 10.5l.7 1.6 1.6.7-1.6.7-.7 1.6-.7-1.6-1.6-.7 1.6-.7z" />
  </svg>
);

export const IconFolder = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M2 4.5h4l1.5 2H14v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z" />
  </svg>
);

export const IconChevronDown = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M4 6.5l4 4 4-4" />
  </svg>
);

export const IconHash = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M6 3L5 13M11 3l-1 10M3.5 6h10M3 10h10" />
  </svg>
);

export const IconExpand = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M9.5 3H13v3.5M13 3L9 7M6.5 13H3V9.5M3 13l4-4" />
  </svg>
);

export const IconFilter = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M3 4.5h10M5 8h6M6.8 11.5h2.4" />
  </svg>
);

export const IconArchive = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <rect x="2.5" y="3.5" width="11" height="3" rx="0.8" />
    <path d="M3.5 6.5v5a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-5M6.5 9h3" />
  </svg>
);

export const IconDots = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)} strokeWidth={1.6}>
    <path d="M5 3.5v.01M8 3.5v.01M11 3.5v.01M5 8v.01M8 8v.01M11 8v.01M5 12.5v.01M8 12.5v.01M11 12.5v.01" />
  </svg>
);

export const IconPlus = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M8 3.5v9M3.5 8h9" />
  </svg>
);

export const IconTask = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <circle cx="8" cy="8" r="6.2" />
    <path d="M8 5v3.4l2.2 1.4" />
  </svg>
);

export const IconHand = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M5.5 8V4.8a1 1 0 0 1 2 0V7.5M7.5 7.5V4a1 1 0 0 1 2 0v3.5M9.5 7.5V4.6a1 1 0 0 1 2 0V8.5M11.5 8.5c1 0 1.6.8 1.3 1.8l-.8 2.4a2.6 2.6 0 0 1-2.5 1.8H8a3 3 0 0 1-3-3V6a1 1 0 0 1 2 0" />
  </svg>
);

export const IconGauge = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <circle cx="8" cy="8" r="6.2" />
    <path d="M8 8l2.6-2.6M8 4.6v.01" />
  </svg>
);

export const IconArrowUp = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M8 12.5v-9M4.5 7L8 3.5 11.5 7" />
  </svg>
);

export const IconArrowDown = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M8 3.5v9M4.5 9L8 12.5 11.5 9" />
  </svg>
);

export const IconMegaphone = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M3 7v2.5l1.8.4V13h1.7V10.3L13 12V4L3 6.5z" />
  </svg>
);

export const IconClose = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" />
  </svg>
);

export const IconMoon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M12.5 9.5A5 5 0 1 1 6.5 3.5a4 4 0 0 0 6 6z" />
  </svg>
);

export const IconMinimize = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M3.5 8h9" />
  </svg>
);

export const IconMaximize = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <rect x="4" y="4" width="8" height="8" rx="1" />
  </svg>
);

export const IconPanel = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <rect x="2.5" y="3.5" width="11" height="9" rx="1.5" />
    <path d="M6 3.5v9" />
  </svg>
);

export const IconTerminal = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <rect x="2.5" y="3.5" width="11" height="9" rx="1.5" />
    <path d="M5 6.5l2 2-2 2M8.5 10.5H11" />
  </svg>
);

export const IconGlobe = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <circle cx="8" cy="8" r="5.5" />
    <path d="M2.5 8h11M8 2.5c2 2 2 9 0 11M8 2.5c-2 2-2 9 0 11" />
  </svg>
);

export const IconCopy = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <rect x="5.5" y="5.5" width="7" height="7" rx="1" />
    <path d="M10.5 3.5h-6a1 1 0 0 0-1 1v6" />
  </svg>
);

export const IconArrowLeft = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M10.5 8H3.5M6 5.5 3.5 8 6 10.5" />
  </svg>
);

export const IconArrowRight = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M5.5 8h7M10 5.5 12.5 8 10 10.5" />
  </svg>
);

export const IconBranch = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <circle cx="4.5" cy="4" r="1.8" />
    <circle cx="4.5" cy="12" r="1.8" />
    <circle cx="11.5" cy="6" r="1.8" />
    <path d="M4.5 5.8v4.4M11.5 7.8c0 2.6-3.2 2.3-5.2 3.1" />
  </svg>
);

export const IconGear = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <circle cx="8" cy="8" r="2" />
    <path d="M8 2.8v1.7M8 11.5v1.7M2.8 8h1.7M11.5 8h1.7M4.3 4.3l1.2 1.2M10.5 10.5l1.2 1.2M11.7 4.3l-1.2 1.2M5.5 10.5l-1.2 1.2" />
  </svg>
);
