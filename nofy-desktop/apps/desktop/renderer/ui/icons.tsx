/**
 * 图标系 —— 自绘 24×24 stroke 几何（1.75 线宽、round cap）。
 *
 * 干净室：不取 ZCode/任何图标库的资产，路径是自己排的简单几何。
 * 存在理由（uiux 工艺批 1）：活壳的信息密度一半来自图标——侧栏动作行、
 * 会话行状态、composer 工具条、顶栏开关。纯文字按钮是「demo 感」的第一来源。
 *
 * 约定：只接 size/className；颜色一律 currentColor（跟着文字色走主题）。
 */
import type { ReactNode } from "react";

export type IconProps = { size?: number; className?: string };

function Svg({ size = 16, className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const IconPlus = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);
export const IconSearch = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Svg>
);
export const IconZap = (p: IconProps) => (
  <Svg {...p}>
    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
  </Svg>
);
export const IconFolder = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
  </Svg>
);
export const IconChevronDown = (p: IconProps) => (
  <Svg {...p}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
);
export const IconChevronsDown = (p: IconProps) => (
  <Svg {...p}>
    <path d="m7 6 5 5 5-5" />
    <path d="m7 13 5 5 5-5" />
  </Svg>
);
export const IconGlobe = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18Z" />
  </Svg>
);
/** 子智能体（活壳 lucide-bot 图标位：AgentToolView 的 AGENT_TOOL_ICON）。 */
export const IconBot = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3v3" />
    <rect x="5" y="8" width="14" height="11" rx="3" />
    <path d="M9.5 13h.01M14.5 13h.01" />
    <path d="M3 12v3M21 12v3" />
  </Svg>
);
export const IconChevronRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="m9 6 6 6-6 6" />
  </Svg>
);
export const IconMessage = (p: IconProps) => (
  <Svg {...p}>
    <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" />
  </Svg>
);
export const IconShield = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" />
  </Svg>
);
export const IconMonitor = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <path d="M9 20h6M12 16v4" />
  </Svg>
);
export const IconSend = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </Svg>
);
export const IconStop = (p: IconProps) => (
  <Svg {...p}>
    <rect x="7" y="7" width="10" height="10" rx="2" />
  </Svg>
);
export const IconPanelRight = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M15 4v16" />
  </Svg>
);

/** 侧栏开关（IconPanelRight 的镜像）。 */
export const IconPanelLeft = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M9 4v16" />
  </Svg>
);

/** git 分支：审查 pane 与分支芯片共用（生态面 #4）。 */
export const IconBranch = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="7" cy="6" r="2" />
    <circle cx="7" cy="18" r="2" />
    <circle cx="17" cy="9" r="2" />
    <path d="M7 8v8M17 11c0 3-2.5 4-5 4.5" />
  </Svg>
);
export const IconPalette = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-.9 2-2s-.6-2 .5-2H17a4 4 0 0 0 4-4c0-5-4-10-9-10Z" />
    <circle cx="8.5" cy="10.5" r="0.6" />
    <circle cx="12" cy="7.5" r="0.6" />
    <circle cx="15.5" cy="10.5" r="0.6" />
  </Svg>
);
export const IconInfo = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </Svg>
);
export const IconWarn = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 4 3 19h18L12 4Z" />
    <path d="M12 10v4M12 17h.01" />
  </Svg>
);
export const IconCheck = (p: IconProps) => (
  <Svg {...p}>
    <path d="m5 12 5 5 9-10" />
  </Svg>
);
export const IconSpark = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
  </Svg>
);
export const IconClock = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Svg>
);
export const IconBoxes = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="3" width="8" height="8" rx="1.5" />
    <rect x="13" y="3" width="8" height="8" rx="1.5" />
    <rect x="8" y="13" width="8" height="8" rx="1.5" />
  </Svg>
);
export const IconGear = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" />
  </Svg>
);
export const IconFile = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 2h8l4 4v16H6V2Z" />
    <path d="M14 2v4h4" />
  </Svg>
);
/** 品牌标记：六角 + 内核点。空态与关于位用。 */
export const IconMark = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 2.5 20 7v10l-8 4.5L4 17V7l8-4.5Z" />
    <circle cx="12" cy="12" r="2.5" />
  </Svg>
);
export const IconCopy = (p: IconProps) => (
  <Svg {...p}>
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h10" />
  </Svg>
);
export const IconTerminal = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="m7 9 3 3-3 3M12 15h5" />
  </Svg>
);
export const IconEdit = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3Z" />
    <path d="m14 8 3 3" />
  </Svg>
);

/* ═══════════════════ 壳解剖批（2026-09-10，活壳 CDP 取数补齐） ═══════════════════
 * 这一批图标对应活壳 3.11.2 里我们此前**看错**的槽位：
 *   卡片头右簇 = 帮助(circle-question-mark) / 切换终端(square-terminal) / 展开·收起侧边面板(panel-right-open|close)
 *   侧栏叠层   = 切换侧边栏(panel-left-close|open) / 后退(arrow-left) / 前进(arrow-right) / 新建任务(message-circle-plus)
 *   侧栏动作区 = 搜索 / 自动化(calendar-clock) / 插件市场(blocks)
 *   侧栏 tabs  = 分组(hash) / 项目(folder) + 展开全部(maximize-2) / 筛选和排序(list-filter) / 归档(archive)
 * 度量与 aria 词汇来源：docs/contract/zcode-live-metrics.md §1.1（CDP 实测）。
 * 路径仍是我们自己排的几何（干净室纪律：不取图标库资产）。
 */

/** 帮助：圆圈 + 问号（活壳 lucide-circle-question-mark）。 */
export const IconHelp = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.4 9.2a2.7 2.7 0 0 1 5.2.9c0 1.8-2.6 2.2-2.6 4" />
    <path d="M12 17.4h.01" />
  </Svg>
);

/** 收起右侧面板（面板在右、箭头朝右＝收）。 */
export const IconPanelRightClose = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M15 4v16" />
    <path d="m9.5 9.5 2.5 2.5-2.5 2.5" />
  </Svg>
);

/** 展开右侧面板（箭头朝左＝把面板拉出来）。活壳收起态用的就是这一枚。 */
export const IconPanelRightOpen = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M15 4v16" />
    <path d="m12 9.5-2.5 2.5L12 14.5" />
  </Svg>
);

/** 侧栏开着时的「切换侧边栏」（活壳 lucide-panel-left-close）。 */
export const IconPanelLeftClose = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M9 4v16" />
    <path d="m14.5 9.5-2.5 2.5 2.5 2.5" />
  </Svg>
);

/** 侧栏收起时的「切换侧边栏」（活壳 lucide-panel-left-open）。 */
export const IconPanelLeftOpen = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M9 4v16" />
    <path d="m12 9.5 2.5 2.5L12 14.5" />
  </Svg>
);

export const IconArrowLeft = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20 12H4" />
    <path d="m10 6-6 6 6 6" />
  </Svg>
);

export const IconArrowRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 12h16" />
    <path d="m14 6 6 6-6 6" />
  </Svg>
);

/** 新建任务（活壳叠层第 4 枚：lucide-message-circle-plus）。 */
export const IconMessagePlus = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20.5 11.6a8.5 8.5 0 0 1-12.3 7.7L3.6 20.8l1.5-4.6A8.5 8.5 0 1 1 20.5 11.6Z" />
    <path d="M12 8.6v6M9 11.6h6" />
  </Svg>
);

export const IconX = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5" />
  </Svg>
);

/** 更多（活壳 workspace-more-button：lucide-ellipsis）。 */
export const IconEllipsis = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="5.5" cy="12" r="1.3" />
    <circle cx="12" cy="12" r="1.3" />
    <circle cx="18.5" cy="12" r="1.3" />
  </Svg>
);

/** 自动化（活壳 lucide-calendar-clock：日历框 + 右下角钟）。 */
export const IconCalendarClock = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
    <path d="M4 6v12a2 2 0 0 0 2 2h5" />
    <path d="M4 9.5h16M8.5 2.5V6M15.5 2.5V6" />
    <circle cx="16.5" cy="16.5" r="4.5" />
    <path d="M16.5 14.4v2.3l1.6 1" />
  </Svg>
);

/** 插件市场（活壳 lucide-blocks：错位方块）。 */
export const IconBlocks = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="3" width="8" height="8" rx="1.6" />
    <rect x="13" y="7" width="8" height="8" rx="1.6" />
    <rect x="6" y="15" width="6" height="6" rx="1.4" />
  </Svg>
);

/** 分组 tab（活壳 lucide-hash）。 */
export const IconHash = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 9.5h14M5 15h14M10.5 4 8.5 20M16.5 4l-2 16" />
  </Svg>
);

/** 展开全部（活壳 lucide-maximize-2）。 */
export const IconExpand = (p: IconProps) => (
  <Svg {...p}>
    <path d="M15 3.5h5.5V9M9 20.5H3.5V15M20.5 3.5 14 10M3.5 20.5 10 14" />
  </Svg>
);

/** 筛选和排序（活壳 lucide-list-filter）。 */
export const IconFilter = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 6.5h16M7 12h10M10 17.5h4" />
  </Svg>
);

/** 归档（活壳 lucide-archive）。 */
export const IconArchive = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="4" width="18" height="4.5" rx="1.2" />
    <path d="M5 8.5V19a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19V8.5" />
    <path d="M10 12.5h4" />
  </Svg>
);

/** 拖动分区（活壳 lucide-grip-vertical）。 */
export const IconGrip = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="9.5" cy="6" r="1.2" />
    <circle cx="9.5" cy="12" r="1.2" />
    <circle cx="9.5" cy="18" r="1.2" />
    <circle cx="14.5" cy="6" r="1.2" />
    <circle cx="14.5" cy="12" r="1.2" />
    <circle cx="14.5" cy="18" r="1.2" />
  </Svg>
);

/** 家目录项目行（活壳 house 图标：cwd == $HOME 时用它，不是 folder）。 */
export const IconHouse = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 11 12 4.2 20 11v8.2a1.3 1.3 0 0 1-1.3 1.3h-3.9v-6H9.2v6H5.3A1.3 1.3 0 0 1 4 19.2Z" />
  </Svg>
);

/* ═══════════════════ composer 工具条批（2026-09-10，活壳 chat-composer-region 实测） ═══
 * 活壳工具条左簇 = 添加上下文(plus) / 切换模式(shield-alert, warning 色) / 电脑操作(monitor-cog)；
 * 右簇 = 上下文计量(12px 环) / 选择模型(package) / 推理档(brain) / 发送(arrow-up)。
 * 我们的旧图标（plain shield / monitor / spark）形态不对位，这一批补齐对位形态。
 */

/** 切换模式：盾 + 感叹号（活壳 shield-alert；warning 色由 .toolbtn--warn 给）。 */
export const IconShieldAlert = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z" />
    <path d="M12 8.5v4M12 15.6h.01" />
  </Svg>
);

/** 电脑操作：显示器 + 右下角齿轮（活壳 monitor-cog）。 */
export const IconMonitorCog = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7" />
    <path d="M3 6v7a2 2 0 0 0 2 2h6" />
    <path d="M9 19h4M12 15v4" />
    <circle cx="17.5" cy="17.5" r="3.2" />
    <path d="M17.5 15.6v1.9l1.3.8" />
  </Svg>
);

/** 选择模型：包裹盒（活壳 package）。 */
export const IconPackage = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 2.8 20 7v10l-8 4.2L4 17V7l8-4.2Z" />
    <path d="M4 7l8 4.2L20 7M12 11.2v10" />
    <path d="m8 4.9 8 4.2" />
  </Svg>
);

/** 推理档：脑（活壳 brain）。 */
export const IconBrain = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9.5 3.5a3 3 0 0 0-3 3 3.2 3.2 0 0 0-2 3c0 .9.4 1.7 1 2.3a3.2 3.2 0 0 0 .6 4.4 3 3 0 0 0 3.4 4.3 2.6 2.6 0 0 0 2.5-2V6.5a3 3 0 0 0-2.5-3Z" />
    <path d="M14.5 3.5a3 3 0 0 1 3 3 3.2 3.2 0 0 1 2 3c0 .9-.4 1.7-1 2.3a3.2 3.2 0 0 1-.6 4.4 3 3 0 0 1-3.4 4.3 2.6 2.6 0 0 1-2.5-2V6.5a3 3 0 0 1 2.5-3Z" />
  </Svg>
);

/* ═══════════════════ 审查面批（2026-09-11，活壳审查 pane 实测） ═══════════════════
 * 活壳审查面用到的图标：file-diff（汇总条/文件行/tab）、refresh-cw（刷新）。
 */

/** 审查 / diff（活壳 lucide-file-diff）。 */
export const IconFileDiff = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 2h8l4 4v16H6V2Z" />
    <path d="M14 2v4h4" />
    <path d="M9.5 12h5M9.5 16h3" />
    <path d="M12.8 8.6v4M10.8 10.6l2-2 2 2" />
  </Svg>
);

/** 刷新（活壳 lucide-refresh-cw）。 */
export const IconRefresh = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20 11a8 8 0 0 0-14.9-3M4 13a8 8 0 0 0 14.9 3" />
    <path d="M20 4v4h-4M4 20v-4h4" />
  </Svg>
);

/** 用量（柱状图三柱 + 基线，自绘）。设置面「用量」分区导航用。 */
export const IconChart = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 20h16" />
    <path d="M7 20v-6M12 20V7M17 20v-9" />
  </Svg>
);

/** 回形针（活壳「添加附件」行图标，lucide-paperclip 同形）。 */
export const IconPaperclip = (p: IconProps) => (
  <Svg {...p}>
    <path d="M21.4 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.2-9.19a4 4 0 0 1 5.65 5.66l-9.2 9.19a2 2 0 0 1-2.82-2.83l8.49-8.48" />
  </Svg>
);

/** @ 符（活壳「使用 @ 添加上下文」行图标）。 */
export const IconAt = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
  </Svg>
);

/** 斜杠（活壳「使用 / 选择能力」行图标）。 */
export const IconSlash = (p: IconProps) => (
  <Svg {...p}>
    <path d="M16 3L8 21" />
  </Svg>
);

/** 美元符（活壳「使用 $ 选择技能」行图标）。 */
export const IconDollar = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 2v20" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </Svg>
);

/** 手掌（活壳权限菜单「变更前确认」行图标，lucide-hand 同形）。 */
export const IconHand = (p: IconProps) => (
  <Svg {...p}>
    <path d="M18 11V6a2 2 0 0 0-4 0v5" />
    <path d="M14 10V4a2 2 0 0 0-4 0v2" />
    <path d="M10 10.5V6a2 2 0 0 0-4 0v8" />
    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
  </Svg>
);

/** 盾勾（活壳权限菜单「自动编辑」行图标，lucide-shield-check 同形）。 */
export const IconShieldCheck = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="m9 12 2 2 4-4" />
  </Svg>
);

/** 剪贴板清单（活壳权限菜单「计划模式」行图标，lucide-clipboard-list 同形）。 */
export const IconClipboardList = (p: IconProps) => (
  <Svg {...p}>
    <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="M12 11h4" />
    <path d="M12 16h4" />
    <path d="M8 11h.01" />
    <path d="M8 16h.01" />
  </Svg>
);
