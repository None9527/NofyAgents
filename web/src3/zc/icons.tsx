import React from "react";
const P: Record<string, React.ReactNode> = {
  plus: <><path d="M12 5v14M5 12h14"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
  bot: <><rect x="4" y="8" width="16" height="12" rx="2"/><path d="M12 8V4M8 4h8"/><path d="M9 13h.01M15 13h.01"/></>,
  grid: <><rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/></>,
  folder: <><path d="M4 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/></>,
  chevR: <path d="m9 6 6 6-6 6"/>,
  chevD: <path d="m6 9 6 6 6-6"/>,
  dots: <><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></>,
  gear: <><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/></>,
  pin: <><path d="M12 17v5M7 4h10l-1.5 7.5L18 14H6l2.5-2.5Z"/></>,
  archive: <><rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9M10 13h4"/></>,
  filter: <path d="M4 5h16l-6 7v6l-4 2v-8Z"/>,
  copy: <><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>,
  trash: <><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></>,
  edit: <><path d="M17 3a2.8 2.8 0 1 1 4 4L8 20l-5 1 1-5Z"/></>,
  external: <><path d="M15 3h6v6M21 3l-9 9"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></>,
  terminal: <><path d="m4 17 6-5-6-5M12 19h8"/></>,
  panelR: <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16"/></>,
  panelL: <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/></>,
  left: <path d="M19 12H5m7-7-7 7 7 7"/>,
  right: <path d="M5 12h14m-7-7 7 7-7 7"/>,
  branch: <><circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="8" r="2.5"/><path d="M6 8.5v7M18 10.5c0 4-5 3-9 5"/></>,
  refresh: <><path d="M21 12a9 9 0 1 1-2.6-6.4M21 3v6h-6"/></>,
  user: <><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/></>,
  clipboard: <><rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4a3 3 0 0 1 6 0"/></>,
  download: <><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 21h16"/></>,
  msg: <><path d="M21 12a8 8 0 0 1-8 8H3l2-3a8 8 0 1 1 16-5Z"/></>,
  book: <><path d="M4 19V5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2Z"/><path d="M4 19a2 2 0 0 0 2 2h14"/></>,
  bug: <><rect x="8" y="8" width="8" height="12" rx="4"/><path d="M9 8V6a3 3 0 0 1 6 0v2M3 14h5M16 14h5M4 8l4 2M20 8l-4 2"/></>,
  bulb: <><path d="M9 18h6M10 21h4M12 3a6 6 0 0 1 4 10c-1 1-1 2-1 3h-6c0-1 0-2-1-3a6 6 0 0 1 4-10Z"/></>,
  users: <><circle cx="9" cy="8" r="3.5"/><path d="M2 20c.8-3.2 3.4-5 7-5s6.2 1.8 7 5M16 4a3.5 3.5 0 0 1 0 7M22 20c-.5-2.2-1.8-3.8-4-4.5"/></>,
  filejson: <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z"/><path d="M14 3v6h6"/></>,
  x: <path d="M6 6l12 12M18 6 6 18"/>,
  logo: <><path d="M12 2 20 7v10l-8 5-8-5V7Z"/></>,
  expand: <><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></>,
  send: <path d="M12 19V5m0 0-6 6m6-6 6 6"/>,
};
export function I({ n, s = 16, className }: { n: keyof typeof P | string; s?: number; className?: string }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}
      style={{ flex: "none" }}>{P[n]}</svg>
  );
}
export function Spinner({ s = 12 }: { s?: number }) {
  return <span className="zc-spin" style={{ width: s, height: s }} />;
}
