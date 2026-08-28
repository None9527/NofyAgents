/* eslint-disable */
/**
 * ============================================================================
 * Conversation.tsx — ZCode 3.7.6 会话族主模块（F03 ConversationFamily · D8 Stage B）
 * ============================================================================
 *
 * 来源文件（融合 chunk，213,695 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js
 * 对照文件（同一 chunk 的 pretty-print 版，行号口径见 MODULE-MAP.md）：
 *   /home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx
 * 规格：/home/none/grok-build/web/docs/zcode-uiux-spec.md §6（会话视图）
 *
 * 本族 ~22,720 行（全图最大族），按任务要求拆为两个文件：
 *   - Conversation.tsx（本文件）：会话面板 R0、消息列表、Turn/ToolBlock/Markdown 渲染、
 *     轮导航、quick-find、queue/quota、编排器 PTt。
 *   - ConversationOverlays.tsx：审批/问题内联覆盖层（chat.permission / chat.elicitation）、
 *     通用交互对话框、Aliyun captcha / provider 运行时头、会话错误上报。
 * 拆分依据见 Conversation.report.md §0。
 *
 * ----------------------------------------------------------------------------
 * 〇、子族总览（混淆名 → 语义名 → js 行 / jsx 行；完整清单见 Conversation.report.md §1）
 * ----------------------------------------------------------------------------
 *  [Pane]    R0  → ConversationPane            (119219 / 101388)
 *            PTt → ConversationOrchestrator    (122803 / 104572)
 *            Ait/jit → PaneFloatingHeader      (91755,91801 / 79344,79371)
 *            Ubt/Wbt → PluginIconProvider/Gate (115538,115559 / 98326,98347)
 *            k0  → useSessionSnapshot          (118675 / 100929)
 *  [List]    Rbt/zbt → ConversationMessageList (114627,115525 / 97662,98313)
 *            Fbt → ScrollToBottomButton        (114596 / 97637)
 *            Lyt → UnitSizeCache               (113965 / 97112)
 *            Fyt/ayt → buildRenderUnits/splitVirtualizedUnits (113940,113620 / 97087,96770)
 *  [Turn]    Vvt/Hvt → TurnSection             (113156,113295 / 96423,96489)
 *            Rvt/Bvt/Lvt/Ivt → 轮体/后台结果轮/工作段/段头 (112998,113089,112924,112890)
 *            Evt/Dvt/b1 → RowRenderer          (112666,112711,112712 / 96043,96098,96099)
 *            pvt → UserQueryRow（编辑/回退文件）(112010 / 95596)
 *            hvt → AssistantMessageRow         (112357 / 95832)
 *            mvt → AssistantMessageActions（复制/赞踩/fork/时间）(112234 / 95726)
 *            gvt → ReasoningRow  _vt → TurnHeaderRow  Cvt → TimelineMarkerView
 *            wvt → ToolCallRow    Tvt → SubagentRow    jvt → AgentToolCallRow
 *            S_t → TurnFileChangesSummary（chat.changeSummary.*）(110813 / 94679)
 *            k_t/A_t/O_t → 预览卡（网站/文件）  (111193,111233,111161 / 94925,94950,94877)
 *            b_t → FileRewindDialog            (110632 / 94590)
 *            G_t → UserInputCollapsibleText    (111579 / 95219)
 *            rvt/tvt/nvt → 用户输入富文本/提及部件 (111783,111712,111769)
 *            m1/Z_t/$_t → /goal /compact 命令解析 (111673 / 95273,95315,95317)
 *  [Nav]     ryt/iyt → TurnNavigator（左侧轮刻度条）(113443,113619 / 96660,96769)
 *  [Tool]    lQ/put → ToolLayout               (100416,100214 / 86604,86470)
 *            lut/sut/cut/aut → ToolLayout 头部/摘要件 (100151,100095,100122,100000)
 *            K$/Ght → ToolCallBlock            (109241,109105 / 93274,93180)
 *            Wht → resolveToolCallView（16 种工具视图分派）(109066 / 93141)
 *            ept ShellToolView（代表性全量还原）(105266 / 90506)
 *            其余 15 个工具视图：接口级登记（见 §4.6）
 *            z_t/B_t/V_t → Reasoning 折叠（思考/摘要）(111329,111405,111471 / 95033…)
 *            zlt/rQ/Glt/Wlt → 工具状态/错误/显示模型 (99513,99542,99696,99593)
 *  [Find]    vbt → useConversationFind（CSS Custom Highlight API）(jsx 97388)
 *            Tbt → ConversationSelectionTooltip（引用选择动作）(jsx 97517)
 *            I1/rbt/ibt/… → 查找索引/高亮工具群（§7）
 *  [Queue]   dst/ust → QueuePanel（dnd-kit 排序）(94801,94696 / 82869,82817)
 *            lst → QueueItemRow                (94573 / 82753)
 *            gst → SessionQuotaBanner          (jsx 82888)
 *            _st → PendingCommandBanner        (jsx 82927)
 *
 * ----------------------------------------------------------------------------
 * 一、外部依赖清单（跨 chunk 导入；行号为融合 chunk js 头部 import 块 336–966）
 * ----------------------------------------------------------------------------
 *  1. react / jsx-runtime          react-BQLj9xdT.js、jsx-runtime-B5yMD3-t.js
 *  2. cn() 类名合并 (Z)             utils-CEEH0K_K.js
 *  3. Button (X) / createLucideIcon (Sa) / chevron-right (wa) / chevron-left (Ea)
 *                                  button-laUijeDG.js
 *  4. useIntlContext (G) → {intl, locale}
 *                                  IntlProvider-C321H7m8.js
 *  5. usePlatformService (l=M)、toast (m=_)、Input (P=y)、spinner (M=w)、
 *     Popover 原语 (T/h/x=n/a/i)、遥测平台服务 (S=j)
 *                                  imeComposition-DEYFkwWm.js
 *  6. Tooltip (Ia=u)、Popover root/anchor/trigger/content (Na/Oa/Ma/ka=p/d/m/f)
 *                                  usageStatsUiParts-CiR7YEhh.js
 *  7. logger (J)                   logger-PFDwl5Yq.js
 *  8. useTaskStore (xe=h)、zustand create (Ae=q)、任务作用域选择器 (te=I / W=V)、
 *     草稿 store 写入群 (Le=x 等)   skillStore-BmeKHDBI.js
 *  9. testid 常量 + qr() 模板函数 (qr=Xa)、DesktopCommand、环境常量、
 *     Vte=buildPermissionRequestModel (l 导出)
 *                                  src-HCld2afU.js（~400 符号）
 * 10. useVirtualizer (to)          esm-BY6T6pIH.js（@tanstack/react-virtual）
 * 11. useControllableState (fa)    dist-DJJArJ7D.js
 * 12. dnd-kit：DndContext (_Z)、SortableContext (EZ)、verticalListSortingStrategy (TZ)、
 *     closestCenter (KX)、PointerSensor (aZ)、useSensor (UX)、useSensors (WX)、
 *     useSortable (DZ)、Transform (BX)、restrictToVerticalAxis 修饰器 (cst 本地)
 *                                  —— dnd-kit 库体在本 chunk js 91811–94695（vendored）
 * 13. Markdown 渲染器 cj（F19 族，jsx 46461）、HoverCard 原语 dN/fN/pN（jsx 49005）、
 *     文件路径组件 Bc、提及/代码评论芯片 TH/lit/JH/uit、用户输入解析 KXe、
 *     Badge (uJ，jsx 70704)、Collapsible Radix 底层 (Jbe/Gbe/Kbe) —— 本 chunk 内
 * 14. 会话流运行时：命令队列账本 K1（本文件 §9.3）、命令工厂 OS (js 34582)、
 *     交互通知登记 VS/HS (js 32468/32498)、canLoadOlderRows hw (js 39766)、
 *     选择引用 koe / boe (js 2720/2664)、工具分类 og (js 23084)、
 *     文件摘要抽取 _g (js 20269)、计划 markdown qZ (js 98044)
 * ============================================================================
 */

import * as React from "react";
import * as ReactDOM from "react-dom";
import { AgentToolView, AskUserQuestionToolView, AutomationCard, AutomationToolView, ExploreToolView, FallbackToolView, FileReadToolView, FileWriteToolView, GoalToolView, NodeReplToolView, PreviewCardList, SearchToolView, SessionContextToolView, SkillToolView, SwitchModeToolView, TaskControlToolView, TaskOutputToolView, TodoToolView, collectAutomationCards, isNearBottom, keyScrollIntent } from './ConversationLeaves';
import { RuntimeAuthHeadersController, useSessionSubscriptionErrorReporter } from './ConversationOverlays';
import { FileOpenWithMenu, buildFilePreviewSource } from './FileRewindDialogDeep';
import { FileRewindDialog, countContextAttachments } from './GitReview';
import { OffPeakNewTaskBanner } from './Home';
import { Input, Popover, PopoverAnchor, PopoverContent, PopoverTrigger, toast } from './ImeComposition';
import { MarkdownRenderer } from './MarkdownIntegration';
import { Badge } from './PaymentDeep';
import { logger } from './SkillStore';
import { ConversationSummaryAside, buildSummaryPanelModel, resolveSummaryPanelVariant } from './TopBar';
import { BillingDiscountBadge } from './UsageDeep';
import { PRIMARY_PANE_ID, useSessionRouterStore, useSplitLayoutStore, workspaceScopeKey } from './stores-session';

/* ============================================================================
 * 0. 外部依赖的类型声明（真实实现位于上面清单所列 chunk；此处为重建接口）
 * ==========================================================================*/

/** 类名合并（原 Z，utils-CEEH0K_K.js） */
declare function cn(...inputs: Array<string | false | null | undefined>): string;

/** react-intl 风格 intl 对象（原 G()，IntlProvider-C321H7m8.js） */
interface IntlShape {
  formatMessage(descriptor: { id: string }, values?: Record<string, unknown>): string;
}
declare function useIntlContext(): { intl: IntlShape; locale: string };

/** 日志器（原 J，logger-PFDwl5Yq.js） */

/** toast（原 m，imeComposition chunk 的 _ 导出） */

/** 遥测平台服务（原 S()，imeComposition chunk 的 j 导出） */
interface TelemetryPlatform {
  /* 调用面：xw(platform, event, source) 事件上报 */
}
declare function useTelemetryPlatform(): TelemetryPlatform | null;
/** 遥测事件上报（本 chunk 内助手，调用面归纳） */
declare function trackEvent(
  platform: TelemetryPlatform,
  event: {
    elementName: string;
    eventRegion: string;
    eventType: string;
    eventExtraDetail?: Record<string, unknown>;
    talkId?: string;
    messageId?: string | null;
  },
  source: string,
): void;

/* --- UI 原语（button / usageStatsUiParts / imeComposition chunk） --- */

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "ghost" | "outline" | "destructive";
  size?: "xs" | "sm" | "default" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-md" | "icon-lg";
  "data-icon"?: string;
}
declare const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;

/** Tooltip：title + 可选描述/快捷键（原 Ia，usageStatsUiParts 的 u 导出） */
declare const Tooltip: React.FC<{
  title: string;
  description?: string;
  shortcut?: string;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  className?: string;
  children: React.ReactNode;
}>;

/** Popover 原语（原 Na/Oa/Ma/ka，usageStatsUiParts 导出） */

/** HoverCard 原语（原 dN/fN/pN，本 chunk jsx 49005；Radix 封装） */
declare const HoverCard: React.FC<{ openDelay?: number; closeDelay?: number; children?: React.ReactNode }>;
declare const HoverCardTrigger: React.FC<{ asChild?: boolean; children?: React.ReactNode }>;
declare const HoverCardContent: React.FC<
  React.ComponentPropsWithoutRef<"div"> & { align?: "start" | "center" | "end"; side?: "top" | "bottom" | "left" | "right"; sideOffset?: number }
>;

/** Badge（原 uJ，本 chunk jsx 70704） */

/** 图标（lucide 风格；原图标块 js 26575–28020 / jsx 23141–25478 + button chunk 导出） */
declare const IconComponent: React.FC<React.SVGProps<SVGSVGElement>>;
declare const IconChevronRight: React.FC<React.SVGProps<SVGSVGElement>>; // wa（button chunk o 导出）
declare const IconChevronLeft: React.FC<React.SVGProps<SVGSVGElement>>; // Ea（button chunk s 导出）
declare const IconChevronDown: React.FC<React.SVGProps<SVGSVGElement>>; // N_
declare const IconChevronUp: React.FC<React.SVGProps<SVGSVGElement>>; // P_
declare const IconCheck: React.FC<React.SVGProps<SVGSVGElement>>; // M_
declare const IconCopy: React.FC<React.SVGProps<SVGSVGElement>>; // W_
declare const IconPencil: React.FC<React.SVGProps<SVGSVGElement>>; // Dv
declare const IconX: React.FC<React.SVGProps<SVGSVGElement>>; // Kv / g（关闭）
declare const IconGripVertical: React.FC<React.SVGProps<SVGSVGElement>>; // iv
declare const IconSend: React.FC<React.SVGProps<SVGSVGElement>>; // w_（queue runNow/sendNow）
declare const IconArrowDownToLine: React.FC<React.SVGProps<SVGSVGElement>>; // Qve（回到底部）
declare const IconSquareTerminal: React.FC<React.SVGProps<SVGSVGElement>>; // Uv（shell 工具）
declare const IconFile: React.FC<React.SVGProps<SVGSVGElement>>; // Fv（file-read/write/search 工具）
declare const IconBot: React.FC<React.SVGProps<SVGSVGElement>>; // D_（subagent/skill 提及）
declare const IconSparkles: React.FC<React.SVGProps<SVGSVGElement>>; // Yv（skill 提及）
declare const IconTarget: React.FC<React.SVGProps<SVGSVGElement>>; // rv（/goal 命令、goalVerify 标记）
declare const IconGitBranch: React.FC<React.SVGProps<SVGSVGElement>>; // ev（forkNotice 标记）
declare const IconLightbulb: React.FC<React.SVGProps<SVGSVGElement>>; // O_（Reasoning 触发器）
declare const IconCompact: React.FC<React.SVGProps<SVGSVGElement>>; // x_（compact 标记）
declare const IconModelChange: React.FC<React.SVGProps<SVGSVGElement>>; // eye（modelChange 标记）
declare const IconQuestion: React.FC<React.SVGProps<SVGSVGElement>>; // vye（ask-user-question 工具）
declare const IconShield: React.FC<React.SVGProps<SVGSVGElement>>; // Rbe（permission 工具行）
declare const IconThumbsUp: React.FC<React.SVGProps<SVGSVGElement>>; // Dbe
declare const IconThumbsDown: React.FC<React.SVGProps<SVGSVGElement>>; // Ebe
declare const IconFork: React.FC<React.SVGProps<SVGSVGElement>>; // Obe
declare const IconRewind: React.FC<React.SVGProps<SVGSVGElement>>; // Oye（回退文件）
declare const IconLoader: React.FC<React.SVGProps<SVGSVGElement>>; // fv（loader）
declare const IconSpinner: React.FC<React.SVGProps<SVGSVGElement>>; // M（loader-circle，imeComposition w 导出）
declare const IconInfo: React.FC<React.SVGProps<SVGSVGElement>>; // p（横幅信息图标）
declare const IconZap: React.FC<React.SVGProps<SVGSVGElement>>; // Pv（quota 升级按钮）
declare const IconUpload: React.FC<React.SVGProps<SVGSVGElement>>; // av（拖放提示）
declare const IconGlobe: React.FC<React.SVGProps<SVGSVGElement>>; // Gye（session-context 工具）
declare const IconGauge: React.FC<React.SVGProps<SVGSVGElement>>; // Sv（switch-mode 工具）
declare const IconClock: React.FC<React.SVGProps<SVGSVGElement>>; // aye（goal 工具）
declare const IconListTodo: React.FC<React.SVGProps<SVGSVGElement>>; // kye（todo 工具）
declare const IconMessageSquare: React.FC<React.SVGProps<SVGSVGElement>>; // hbe / ybe / xbe / lbe（message/task 工具）
declare const IconCalendar: React.FC<React.SVGProps<SVGSVGElement>>; // R_（automations 工具）

/** 文件路径显示组件（原 Bc，文件树/提及/代码查看共用；调用面归纳） */
declare const FilePath: React.FC<{
  path: string;
  basePath?: string;
  showFilePath?: boolean;
  options?: {
    basePath?: string;
    showFilePath?: boolean;
    className?: string;
    iconSize?: number;
    kind?: "file" | "directory";
    fileNameClassName?: string;
    filePathClassName?: string;
  };
}>;

/** 用户输入上下文解析（原 KXe：拆分可见文本/代码评论/网页元素/pptx/会话引用） */
interface ParsedUserInput {
  visibleContent: string;
  codeComments: unknown[];
  webElements: unknown[];
  pptxElements: unknown[];
  conversationSelections: unknown[];
}
declare function parseUserInputContext(
  text: string,
  scope: { workspacePath?: string; workspaceIdentity?: string | null },
): ParsedUserInput;

/** 代码评论/网页/pptx/引用 芯片（原 TH/lit/JH/uit，F08/F14 交界） */
declare const CodeCommentChips: React.FC<{ comments: unknown[]; contentAlign?: "start" | "end" }>;
declare const WebElementChips: React.FC<{ contexts: unknown[]; contentAlign?: "start" | "end" }>;
declare const PptxReferenceChips: React.FC<{ references: unknown[]; onOpen?: (ref: unknown) => void }>;
declare const ConversationSelectionChips: React.FC<{ references: unknown[] }>;

/** 打开代码查看钩子（原 YH） */
declare function useOpenCodeViewerForReference(scope: {
  workspacePath?: string;
  workspaceIdentity?: string | null;
  workspaceRemoteSessionId?: string | null;
  onOpenCodeViewer?: OpenCodeViewerFn;
}): (ref: unknown) => void;

/* --- 会话流运行时类型（proto schema 归纳；真实 zod schema 在 js 32246–36438 命令队列运行时） --- */

type RowKind =
  | "userInput"
  | "assistantText"
  | "reasoning"
  | "turnHeader"
  | "timelineMarker"
  | "toolCall"
  | "subagent";

type RowFeedback = "like" | "dislike" | null;

interface RowActions {
  canFork?: boolean;
  canEdit?: boolean;
  canRetry?: boolean;
  canRewindFiles?: boolean;
  editDisposition?: "rewind" | "fork";
}

interface UserInputRow {
  kind: "userInput";
  rowId: number;
  turnId: string;
  entityId?: string | null;
  text: string;
  origin: "realUser" | "queued" | string;
  attachments?: AttachmentRef[];
  actions?: RowActions;
  createdAt?: number;
  sourceCommandId?: string;
}
interface AssistantTextRow {
  kind: "assistantText";
  rowId: number;
  turnId: string;
  entityId?: string | null;
  text: string;
  state: "streaming" | "complete" | string;
  feedback?: RowFeedback;
  createdAt?: number;
  actions?: RowActions;
}
interface ReasoningRow {
  kind: "reasoning";
  rowId: number;
  turnId: string;
  text: string;
  state: "streaming" | "complete" | string;
  durationMs?: number;
}
interface TurnHeaderRowModel {
  kind: "turnHeader";
  rowId: number;
  turnId: string;
  entityId?: string | null;
  origin: "userInput" | "backgroundResult" | "goalContinuation" | "editRerun" | string;
  originMeta?: { workId: string; title: string; backgroundSource?: "bash" | "subagent" | string };
  state: "running" | "completedSuccess" | "completedInterrupted" | "error" | string;
  actions?: RowActions;
  fileChanges?: { files: number; additions: number; deletions: number; state?: "pending" | "reverted" | string } | null;
}
interface TimelineMarkerRow {
  kind: "timelineMarker";
  rowId: number;
  turnId: string;
  sourceCommandId?: string;
  marker:
    | { type: "compact"; status: "running" | "noop" | "cancelled" | "failed" | "completed"; origin: "auto" | "manual" | string }
    | { type: "forkNotice"; parentSessionId: string; parentRowId: number }
    | { type: "modelChange"; fromProvider?: string; fromModel?: string; toProvider: string; toModel: string }
    | { type: "goalVerify"; iteration: number; outcome: "running" | "pass" | "fail" };
}
interface ToolCallRowModel {
  kind: "toolCall";
  rowId: number;
  turnId: string;
  toolCallId: string;
  toolName?: string;
  status: string;
  input?: unknown;
  inputText?: string;
  output?: { text?: string } & Record<string, unknown>;
  raw?: unknown;
  parentToolUseId?: string | null;
}
interface SubagentRowModel {
  kind: "subagent";
  rowId: number;
  turnId: string;
  subagentType: string;
  status: string;
  summaryText?: string;
}
type ConversationRow =
  | UserInputRow
  | AssistantTextRow
  | ReasoningRow
  | TurnHeaderRowModel
  | TimelineMarkerRow
  | ToolCallRowModel
  | SubagentRowModel;

interface AttachmentRef {
  ref: string;
  previewRef?: string;
  fileName: string;
  mime: string;
  bytes: number;
}

/** 工具调用（规范化后，原 u1 js 110158 / jsx 94198 的产物） */
interface ToolCall {
  toolId: string;
  toolName?: string;
  kind?: string;
  title?: string;
  status: "input-streaming" | "input-available" | "output-available" | "output-error" | "completed" | "failed" | string;
  input?: unknown;
  output?: unknown;
  error?: string;
  raw?: unknown;
  parentToolUseId?: string | null;
  snapshotRefs?: unknown[];
}
interface ToolCallNode {
  toolCall: ToolCall;
  childToolCalls: ToolCallNode[];
}

/** 工具分类（原 og，js 23084 / jsx 19826；family 枚举按 Wht 分派归纳） */
type ToolFamily =
  | "plan-guidance"
  | "agent"
  | "todo"
  | "ask-user-question"
  | "message"
  | "task-control"
  | "skill"
  | "session-context"
  | "file-read"
  | "file-write"
  | "explore"
  | "switch-mode"
  | "search"
  | "shell"
  | "goal"
  | "node-repl"
  | "automation"
  | "fallback";
declare function classifyToolCall(toolCall: { toolName?: string; kind?: string }): { family: ToolFamily };

/** Markdown 渲染器（原 cj，F19 族 jsx 46461，memo） */
type OpenCodeViewerFn = (request: { path?: string; source?: unknown; [k: string]: unknown }) => void;
interface CodePreviewSettings {
  [key: string]: unknown;
}

/** 摘要面板（右 aside，原 Flt/Ilt，已随 TopBar 族抽取；此处仅接口） */
interface GitSummary {
  isGitAvailable: boolean;
  isRepository: boolean;
  branchName: string;
  headRefType: "branch" | "detached" | string;
}

/** Home 草稿头（原 hit，memo 名 git；F02 族 jsx 78144；Composer 接线在此） */
declare const HomeDraftHeader: React.FC<Record<string, unknown>>;
/** 空态问候（原 Sit；F02 族 jsx 78861） */
declare const EmptyStateGreeting: React.FC<{ compactForRemoteControl?: boolean }>;
/** off-peak 闲时横幅（原 kit；F15 族 jsx 79222） */

/** 计费折扣徽章（原 hj/_j；F12 族） */
declare const BillingDiscountNote: React.FC<{ config: unknown }>;

/* ============================================================================
 * 1. 本 chunk 内共享原语：Collapsible（Radix 封装，原 kZ/AZ/jZ，jsx 82955–82970）
 *    —— 会话族工具卡/思考折叠/文件变更卡/工作段折叠全部走这一组。
 * ==========================================================================*/

/** Radix Collapsible 底层（打包进本 chunk 的 @radix-ui/react-collapsible） */
declare const RadixCollapsibleRoot: React.FC<
  React.ComponentPropsWithoutRef<"div"> & { open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; forceMount?: boolean }
>;
declare const RadixCollapsibleTrigger: React.FC<React.ComponentPropsWithoutRef<"button"> & { asChild?: boolean }>;
declare const RadixCollapsibleContent: React.FC<React.ComponentPropsWithoutRef<"div"> & { forceMount?: boolean }>;

/** Collapsible 根（原 kZ；data-slot=collapsible） */
function Collapsible(props: React.ComponentPropsWithoutRef<typeof RadixCollapsibleRoot>) {
  return <RadixCollapsibleRoot data-slot="collapsible" {...props} />;
}

/** Collapsible 触发器（原 AZ；data-slot=collapsible-trigger） */
function CollapsibleTrigger(props: React.ComponentPropsWithoutRef<typeof RadixCollapsibleTrigger>) {
  return <RadixCollapsibleTrigger data-slot="collapsible-trigger" {...props} />;
}

/** Collapsible 内容（原 jZ；展开/收起双向动画类名逐字保留） */
function CollapsibleContent({
  className,
  children,
  ...rest
}: React.ComponentPropsWithoutRef<typeof RadixCollapsibleContent>) {
  return (
    <RadixCollapsibleContent
      data-slot="collapsible-content"
      className={cn(
        "group/collapsible-content overflow-hidden",
        "data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up data-[state=closed]:[animation-fill-mode:forwards] transition-none duration-300 ease-in-out",
        className,
      )}
      {...rest}
    >
      <div
        className={cn(
          "transition-none duration-300 ease-in-out",
          "group-data-[state=open]/collapsible-content:animate-in group-data-[state=open]/collapsible-content:fade-in-0",
          "group-data-[state=closed]/collapsible-content:animate-out group-data-[state=closed]/collapsible-content:fade-out-0 group-data-[state=closed]/collapsible-content:[animation-fill-mode:forwards]",
        )}
      >
        {children}
      </div>
    </RadixCollapsibleContent>
  );
}

/* ============================================================================
 * 2. Quota / PendingCommand 横幅子族（js 94696–94966 / jsx 82817–82966）
 * ==========================================================================*/

/**
 * 配额提示种类 → i18n key 映射（原 fst，jsx 82871）。
 * chat.quota.startPlan.* 一族文案。
 */
const QUOTA_KIND_I18N: Record<string, string> = {
  "model-half-used": `chat.quota.startPlan.modelHalfUsed`,
  "model-low": `chat.quota.startPlan.modelLow`,
  "model-very-low": `chat.quota.startPlan.modelVeryLow`,
  "model-exhausted": `chat.quota.startPlan.modelExhausted`,
  "daily-exhausted": `chat.quota.startPlan.dailyExhausted`,
  "concurrent-limit": `chat.quota.startPlan.concurrentLimit`,
  "provider-limited": `chat.quota.providerLimited`,
};

interface QuotaBannerState {
  visible: boolean;
  kind: keyof typeof QUOTA_KIND_I18N | "concurrent-limit" | "provider-limited" | null;
  modelName?: string | null;
  remainingTokens?: number | null;
  remainingPercent?: number | null;
  dismissible?: boolean;
  providerLimitedMessage?: string | null;
  concurrentLimitReason?: "retry-exhausted-busy" | string;
  blocksSubmit?: boolean;
}

/** 原 pst（jsx 82880）：并发受限细分两种文案 */
function resolveQuotaMessageId(state: QuotaBannerState): string {
  return state.kind === `concurrent-limit`
    ? state.concurrentLimitReason === `retry-exhausted-busy`
      ? `chat.quota.startPlan.concurrentLimit.retryExhausted`
      : `chat.quota.startPlan.concurrentLimit`
    : state.kind
      ? QUOTA_KIND_I18N[state.kind]
      : ``;
}

/** 原 mst（jsx 82882）：token 数格式化（非有限 → "-"） */
function formatTokenCount(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return `-`;
  return new Intl.NumberFormat().format(Math.max(0, Math.floor(value)));
}

/** 原 hst（jsx 82885）：百分比钳位格式化 */
function formatPercent(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return `-`;
  return `${Math.max(0, Math.min(100, Math.round(value)))}%`;
}

/**
 * 会话配额横幅（原 gst，jsx 82888）。
 * testid `v4-session-quota-banner`；升级按钮圆形胶囊 + 折扣徽章；可关闭。
 */
function SessionQuotaBanner({
  state,
  billingDiscountActive,
  billingDiscountConfig,
  upgradeActionLabelId = `chat.quota.action.upgrade`,
  onUpgrade,
  onDismiss,
}: {
  state: QuotaBannerState;
  billingDiscountActive: boolean | null;
  billingDiscountConfig: unknown;
  upgradeActionLabelId?: string;
  onUpgrade?: () => void;
  onDismiss?: () => void;
}) {
  const { intl } = useIntlContext();
  if (!state.visible || !state.kind) return null;
  const message =
    state.kind === `provider-limited` && state.providerLimitedMessage
      ? state.providerLimitedMessage
      : intl.formatMessage(
          { id: resolveQuotaMessageId(state) },
          {
            model: state.modelName ?? ``,
            remaining: formatTokenCount(state.remainingTokens),
            percent: formatPercent(state.remainingPercent),
          },
        );
  const showDiscount = !!onUpgrade && billingDiscountActive === true;
  return (
    <div className="mb-3 w-full px-4 max-md:px-2" data-testid="v4-session-quota-banner">
      <div className="flex w-full flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 text-ui-base text-foreground">
          <IconInfo className={`size-4 shrink-0`} />
          <div className="min-w-0 break-words">{message}</div>
        </div>
        {onUpgrade ? (
          <div className="inline-flex shrink-0 items-center gap-1">
            <Button type="button" size="sm" className="gap-1.5 rounded-full" onClick={onUpgrade}>
              <IconZap className="size-3.5" />
              {intl.formatMessage({ id: upgradeActionLabelId })}
              {showDiscount ? <BillingDiscountBadge config={billingDiscountConfig} iconVisible={false} variant={`surface`} /> : null}
            </Button>
            {showDiscount ? <BillingDiscountNote config={billingDiscountConfig} /> : null}
          </div>
        ) : null}
        {state.dismissible ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onDismiss}
            aria-label={intl.formatMessage({ id: `common.close` })}
            className="shrink-0 rounded-full text-foreground-subtle hover:text-foreground"
          >
            <IconX className={`size-3.5`} />
          </Button>
        ) : null}
      </div>
    </div>
  );
}

/**
 * 待恢复命令横幅（原 _st，jsx 82927）。
 * 会话重连后被丢弃的输入命令：可重发（input 类）/关闭。chat.pendingCommand.*
 */
const PendingCommandBanner = React.memo(function PendingCommandBanner({
  entry,
  onResend,
  onDismiss,
}: {
  entry: { replay: { kind: "input" | string } };
  onResend?: () => void;
  onDismiss: () => void;
}) {
  const { intl } = useIntlContext();
  const isInput = entry.replay.kind === `input`;
  return (
    <div
      role="status"
      className="mb-3 flex w-full shrink-0 flex-wrap items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-ui-base text-foreground backdrop-blur-md"
    >
      <p className="min-w-0 flex-1">{intl.formatMessage({ id: `chat.pendingCommand.discarded` })}</p>
      {isInput && onResend ? (
        <button
          type="button"
          className="shrink-0 rounded-md bg-primary px-2.5 py-1 text-primary-foreground hover:bg-primary/80"
          onClick={onResend}
        >
          {intl.formatMessage({ id: `chat.pendingCommand.resend` })}
        </button>
      ) : null}
      <button type="button" className="shrink-0 rounded-md px-2 py-1 text-foreground-subtle hover:bg-hover" onClick={onDismiss}>
        {intl.formatMessage({ id: `chat.pendingCommand.dismiss` })}
      </button>
    </div>
  );
});

/** 原 vst（jsx ~82972）：长任务耗时文案（chat.longRunning.elapsed*） */
function formatLongRunningElapsed(elapsedMs: number, formatMessage: IntlShape["formatMessage"]): string {
  const totalSeconds = Math.max(1, Math.floor(elapsedMs / 1e3));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0
    ? formatMessage({ id: `chat.longRunning.elapsedMinutesSeconds` }, { minutes: String(minutes), seconds: String(seconds) })
    : formatMessage({ id: `chat.longRunning.elapsedSeconds` }, { seconds: String(seconds) });
}

/* ============================================================================
 * 3. Queue 子族（消息队列面板；js 94545–94801 / jsx 82736–82869）
 *    follow-up 消息在「排队模式」下进入此队列（followupMode: queue|guide，
 *    composer placeholder 用 chat.placeholder.followUpQueue / followUpAsk）。
 * ==========================================================================*/

interface QueueItem {
  queueItemId: string;
  kind: "text" | "compact" | string;
  text: string;
  sourceCommandId?: string;
  dispatch: { state: "queued" | "dispatched" | string };
}
interface QueueState {
  items: QueueItem[];
  autoDrain: boolean;
  pauseReason?: "stopped" | "generic" | string;
}

/**
 * 原 sst（js 94545 / jsx 82736）：把 dnd-kit 拖拽结果换算成
 * 「把 queueItemId 移到 beforeQueueItemId 之前」的 reorder 命令参数。
 */
function computeQueueReorderMove(
  items: QueueItem[],
  activeQueueItemId: string,
  overQueueItemId: string,
): { queueItemId: string; beforeQueueItemId: string | null } | null {
  if (overQueueItemId === activeQueueItemId) return null;
  const fromIndex = items.findIndex((item) => item.queueItemId === activeQueueItemId);
  const overIndex = items.findIndex((item) => item.queueItemId === overQueueItemId);
  if (fromIndex < 0 || overIndex < 0) return null;
  if (fromIndex < overIndex) {
    const withoutActive = items.filter((item) => item.queueItemId !== activeQueueItemId);
    return {
      beforeQueueItemId: withoutActive[withoutActive.findIndex((item) => item.queueItemId === overQueueItemId) + 1]?.queueItemId ?? null,
      queueItemId: activeQueueItemId,
    };
  }
  return { beforeQueueItemId: overQueueItemId, queueItemId: activeQueueItemId };
}

/* dnd-kit（vendored 于本 chunk js 91811–94695；以下为重建接口） */
declare function useSortable(opts: { id: string; disabled?: boolean }): {
  attributes: Record<string, unknown>;
  listeners: Record<string, unknown>;
  setActivatorNodeRef: (el: HTMLElement | null) => void;
  setNodeRef: (el: HTMLElement | null) => void;
  transform: { x: number; y: number; scaleX: number; scaleY: number } | null;
  transition: string | undefined;
  isDragging: boolean;
};
declare const DndContext: React.FC<{
  sensors: unknown;
  collisionDetection: unknown;
  modifiers: unknown[];
  onDragEnd: (event: { over?: { id: string | number } | null; active: { id: string | number } }) => void;
  children?: React.ReactNode;
}>;
declare const SortableContext: React.FC<{ items: string[]; strategy: unknown; children?: React.ReactNode }>;
declare const verticalListSortingStrategy: unknown;
declare const closestCenterCollision: unknown;
declare function usePointerSensor(opts?: { activationConstraint?: { distance?: number } }): unknown;
declare function useSensors(...sensors: unknown[]): unknown[];
/** 原 cst（jsx 82704）：把拖拽限制在垂直轴（容器内钳制 y） */
declare const restrictToVerticalAxisModifier: (args: {
  transform: { x: number; y: number };
  draggingNodeRect?: { top: number; bottom: number };
  activeNodeRect?: { top: number; bottom: number };
  containerNodeRect?: { top: number; bottom: number };
  windowRect?: { top: number; bottom: number };
}) => { x: number; y: number };

/**
 * 队列单项（原 lst，js 94573 / jsx 82753）。
 * 拖拽手柄（chat.queue.drag）+ 文本 + 立即发送（runNow/sendNow）+ 编辑 + 删除。
 * /compact 项以等宽字体显示且不可编辑。
 */
const QueueItemRow = React.memo(function QueueItemRow({
  item,
  index,
  intl,
  sortable,
  onDeleteItem,
  onEditItem,
  onSendNow,
  editPending,
}: {
  item: QueueItem;
  index: number;
  intl: IntlShape;
  sortable: boolean;
  onDeleteItem?: (queueItemId: string) => void;
  onEditItem?: (queueItemId: string) => void | Promise<void>;
  onSendNow?: (queueItemId: string) => void;
  editPending: boolean;
}) {
  const locked = item.dispatch.state !== `queued` || editPending;
  const isCompact = item.kind === `compact`;
  const { attributes, isDragging, listeners, setActivatorNodeRef, setNodeRef, transform, transition } = useSortable({
    disabled: !sortable || locked,
    id: item.queueItemId,
  });
  const style = React.useMemo(
    () => ({
      transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0) scale(1, 1)` : undefined,
      transition,
      zIndex: isDragging ? 10 : undefined,
    }),
    [isDragging, transform, transition],
  );
  return (
    <li
      ref={setNodeRef}
      data-testid={`v4-queue-item:${item.queueItemId}`}
      data-queue-item-id={item.queueItemId}
      data-index={index}
      data-kind={item.kind}
      data-dispatch-state={item.dispatch.state}
      data-edit-pending={editPending ? `true` : `false`}
      className={cn(
        `relative flex items-center gap-2 rounded-xl px-1.5 py-1 pr-1 transition-colors hover:bg-hover/30`,
        isDragging ? `bg-hover/40 shadow-sm` : null,
        editPending ? `opacity-60` : null,
      )}
      style={style}
    >
      <Tooltip title={intl.formatMessage({ id: `chat.queue.drag` })}>
        <Button
          ref={setActivatorNodeRef as unknown as React.Ref<HTMLButtonElement>}
          type="button"
          variant="ghost"
          size="icon-md"
          data-v4-queue-drag-handle="true"
          data-queue-item-id={item.queueItemId}
          aria-label={intl.formatMessage({ id: `chat.queue.drag` })}
          className="shrink-0 cursor-grab touch-none text-foreground-subtlest active:cursor-grabbing"
          disabled={locked}
          {...attributes}
          {...listeners}
        >
          <IconGripVertical className={`size-4`} />
        </Button>
      </Tooltip>
      <span
        className={cn(`flex min-w-0 flex-1 items-center gap-2 truncate text-ui-base text-foreground`, isCompact ? `font-mono` : null)}
        title={item.text}
      >
        <span className="truncate">{isCompact ? `/compact` : item.text}</span>
      </span>
      {onSendNow ? (
        <Button
          type="button"
          variant="secondary"
          size="default"
          data-icon="inline-start"
          data-testid={`v4-queue-send-now:${item.queueItemId}`}
          data-queue-item-id={item.queueItemId}
          disabled={locked}
          onClick={() => onSendNow(item.queueItemId)}
        >
          <IconSend className={`size-3.5`} />
          {intl.formatMessage({ id: isCompact ? `chat.queue.runNow` : `chat.queue.sendNow` })}
        </Button>
      ) : null}
      {onEditItem && !isCompact ? (
        <Tooltip title={intl.formatMessage({ id: `chat.queue.edit` })}>
          <Button
            type="button"
            variant="ghost"
            size="icon-md"
            data-testid={`v4-queue-edit:${item.queueItemId}`}
            data-queue-item-id={item.queueItemId}
            aria-label={intl.formatMessage({ id: `chat.queue.edit` })}
            disabled={locked}
            onClick={() => void onEditItem(item.queueItemId)}
          >
            <IconPencil className="size-4" />
          </Button>
        </Tooltip>
      ) : null}
      {onDeleteItem ? (
        <Tooltip title={intl.formatMessage({ id: `chat.queue.remove` })}>
          <Button
            type="button"
            variant="ghost"
            size="icon-md"
            data-testid={`v4-queue-remove:${item.queueItemId}`}
            data-queue-item-id={item.queueItemId}
            aria-label={intl.formatMessage({ id: `chat.queue.remove` })}
            disabled={locked}
            onClick={() => onDeleteItem(item.queueItemId)}
          >
            <IconX className="size-4" />
          </Button>
        </Tooltip>
      ) : null}
    </li>
  );
});

/**
 * 队列面板（原 ust，js 94696 / jsx 82817；memo 名 dst，js 94801 / jsx 82869）。
 * 挂在 composer dock 上方：`rounded-t-2xl -mb-7 pb-7` 与输入区咬合。
 * 非自动排水（暂停）时先显示恢复横幅（chat.queue.paused.*），
 * 列表用 dnd-kit 垂直排序（拖拽重排 → reorderQueueItem 命令）。
 */
function QueuePanel({
  queue,
  onDeleteItem,
  onEditItem,
  pendingEditQueueItemId = null,
  onSendNow,
  onMoveItem,
  onResume,
}: {
  queue: QueueState;
  onDeleteItem?: (queueItemId: string) => void;
  onEditItem?: (queueItemId: string) => void | Promise<void>;
  pendingEditQueueItemId?: string | null;
  onSendNow?: (queueItemId: string) => void;
  onMoveItem?: (queueItemId: string, beforeQueueItemId: string | null) => void;
  onResume?: () => Promise<void>;
}) {
  const { intl } = useIntlContext();
  const [resuming, setResuming] = React.useState(false);
  const sensors = useSensors(usePointerSensor({ activationConstraint: { distance: 6 } }));
  const itemIds = React.useMemo(() => queue.items.map((item) => item.queueItemId), [queue.items]);
  const handleDragEnd = React.useCallback(
    (event: { over?: { id: string | number } | null; active: { id: string | number } }) => {
      const overId = event.over?.id;
      if (!overId) return;
      const move = computeQueueReorderMove(queue.items, String(event.active.id), String(overId));
      if (move) onMoveItem?.(move.queueItemId, move.beforeQueueItemId);
    },
    [onMoveItem, queue.items],
  );
  const handleResume = React.useCallback(async () => {
    if (!onResume || resuming) return;
    setResuming(true);
    try {
      await onResume();
    } finally {
      setResuming(false);
    }
  }, [onResume, resuming]);
  if (queue.items.length === 0) return null;
  return (
    <div
      data-testid="v4-conversation-queue"
      data-queue-count={queue.items.length}
      data-queue-auto-drain={queue.autoDrain ? `true` : `false`}
      className={cn(
        `relative z-0 w-full overflow-hidden rounded-t-2xl border border-border bg-surface p-1 backdrop-blur-md`,
        `-mb-7 pb-7`,
      )}
    >
      {queue.autoDrain ? null : (
        <div
          data-testid="v4-queue-paused-banner"
          className="mb-1 flex min-h-10 items-center gap-3 rounded-xl border border-border/70 bg-surface-raised px-3 py-2 text-ui-base text-foreground"
        >
          <span className="min-w-0 flex-1">
            {intl.formatMessage({ id: queue.pauseReason === `stopped` ? `chat.queue.paused.stopped` : `chat.queue.paused.generic` })}
          </span>
          {onResume ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              data-testid="v4-queue-resume"
              aria-label={intl.formatMessage({ id: `chat.queue.resume.description` })}
              disabled={resuming}
              className="shrink-0 text-foreground-subtle hover:text-foreground"
              onClick={() => void handleResume()}
            >
              {intl.formatMessage({ id: `chat.queue.resume` })}
            </Button>
          ) : null}
        </div>
      )}
      <DndContext sensors={sensors} collisionDetection={closestCenterCollision} modifiers={[restrictToVerticalAxisModifier]} onDragEnd={handleDragEnd}>
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          <ul className="space-y-0.5">
            {queue.items.map((item, index) => (
              <QueueItemRow
                key={item.queueItemId}
                item={item}
                index={index}
                intl={intl}
                sortable={!!onMoveItem}
                onDeleteItem={onDeleteItem}
                onEditItem={onEditItem}
                onSendNow={onSendNow}
                editPending={pendingEditQueueItemId === item.queueItemId}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}
const MemoQueuePanel = React.memo(QueuePanel);

/* ============================================================================
 * 4. ToolBlock 子族（工具折叠块；spec §6「工具行：▶ ✓ 名称: 摘要」）
 *    状态/错误/显示模型：js 99513–99696 / jsx 85879–86153
 *    ToolLayout：js 100000–100417 / jsx 86327–86605
 *    ToolCallBlock + 16 种工具视图：js 104622–109242 / jsx 90046–93275
 * ==========================================================================*/

/** 原 zlt（js 99513 / jsx 85879）：工具状态 → 展示状态（Rlt 映射表，缺省 input-streaming） */
declare const TOOL_STATUS_DISPLAY_MAP: Record<string, string>;
function normalizeToolCallStatus(status: string): string {
  return TOOL_STATUS_DISPLAY_MAP[status] ?? `input-streaming`;
}

/** 原 nQ（jsx 85900）：剥离 ``` 围栏与 <tool_use_error> 包裹 */
function unwrapToolUseError(text: string): string {
  const unwrapped = text.trim().match(/^```[\w-]*\n?([\s\S]*?)\n?```$/)?.[1]?.trim() ?? text.trim();
  return unwrapped.match(/^<tool_use_error>([\s\S]*?)<\/tool_use_error>$/i)?.[1]?.trim() || unwrapped;
}

/**
 * 原 rQ（js 99542 / jsx 85908）：从 toolCall 的 error/output/raw 各层
 * 逐级提取错误文案（tool_use_error 包裹、error/message 字段、failed 状态兜底）。
 */
function extractToolErrorText(toolCall: ToolCall): string | undefined {
  const direct = typeof toolCall.error === `string` && toolCall.error.trim().length > 0 ? toolCall.error.trim() : undefined;
  if (direct) return direct;
  const output = toolCall.output as Record<string, unknown> | undefined;
  if (output && typeof output === `object` && !Array.isArray(output)) {
    for (const key of [`error`, `message`]) {
      const value = output[key];
      if (typeof value === `string` && value.trim().length > 0) return value.trim();
    }
  }
  // ……（原实现继续检查 raw.rawOutput / raw.status / raw.content[]，
  //    全部经 unwrapToolUseError 归一；此处按调用面保留接口）
  return undefined;
}

/** 原 iQ（js 99582 / jsx 85951）：内联预览类型判定（patch/image/text/none） */
function resolveInlinePreview(
  toolCall: ToolCall,
  allowPatch: boolean,
): { type: "patch" | "image" | "text" | "none"; source?: unknown } {
  const preview = (toolCall as { preview?: { type?: string } }).preview;
  if (allowPatch && preview?.type === `patch`) return { type: `patch`, source: preview };
  if (preview?.type === `image`) return { type: `image`, source: preview };
  if (preview?.type === `text`) return { type: `text`, source: preview };
  const contentPreview = (toolCall as { contentPreview?: unknown }).contentPreview;
  if (contentPreview) return { type: `text`, source: contentPreview };
  return { type: `none` };
}

/** 工具显示模型（原 Glt js 99696 / jsx 86085 的产物；Wlt 规则表 js 99593） */
interface ToolDisplayModel {
  inlinePreview: { type: "patch" | "image" | "text" | "none"; source?: unknown };
  planResult?: unknown;
  viewerSource?: unknown;
  viewerLabelId?: string;
  showSummaryFileLink?: boolean;
  showInput?: boolean;
  showOutput?: boolean;
  showKind?: boolean;
}
declare function resolveToolDisplayModel(toolCall: ToolCall, workspacePath?: string): ToolDisplayModel;

/** 原 _g（js 20269）：从工具输入/输出抽取文件摘要列表（供展开区渲染） */
declare function extractRawFileSummaries(raw: unknown, toolCall: ToolCall): unknown[];

/** 原 qZ（js 98044 / jsx 85024）：ExitPlanMode 结果 → markdown（供复制文本合并） */
declare function buildPlanResultMarkdown(toolCall: ToolCall, fallback: string): { markdown: string };

/* --- 4.1 ToolLayout 头部/摘要件（原 aut/sut/cut/lut，jsx 86327–86469） --- */

interface ToolLayoutProps {
  toolId: string;
  persistOpenKey?: string;
  icon?: React.ReactNode;
  showIcon?: boolean;
  canToggle?: boolean;
  forceOpen?: boolean;
  autoOpen?: boolean;
  autoCollapseOnComplete?: boolean;
  kindLabel?: React.ReactNode;
  expandedKindLabel?: React.ReactNode;
  kindDetail?: React.ReactNode;
  expandedKindDetail?: React.ReactNode;
  sourceLabel?: string;
  primaryText?: React.ReactNode;
  expandedPrimaryText?: React.ReactNode;
  secondaryText?: React.ReactNode;
  expandedSecondaryText?: React.ReactNode;
  summaryContentSeparator?: React.ReactNode;
  animateSummaryContent?: boolean;
  disableSummaryContentAnimation?: boolean;
  summaryContentKey?: string;
  hideSecondaryTextWhenOpen?: boolean;
  diffCount?: React.ReactNode;
  hideDiffCountWhenOpen?: boolean;
  statusLabel?: React.ReactNode;
  statusTooltip?: string;
  showFailureStatus?: boolean;
  isRunning?: boolean;
  title?: React.ReactNode;
  expandedTitle?: React.ReactNode;
  content?: React.ReactNode;
  renderContent?: () => React.ReactNode;
  summaryAction?: { testId?: string; ariaLabel: string; onActivate: () => void };
}

/** 原 aut（jsx 86327）：摘要区主/次文本（可带内容切换动画） */
function ToolLayoutAnimatedText({
  contentKey,
  primaryText,
  secondaryText,
  enabled,
  disableAnimation,
}: {
  contentKey: string;
  primaryText?: React.ReactNode;
  secondaryText?: React.ReactNode;
  enabled: boolean;
  disableAnimation?: boolean;
}) {
  // 原实现：主文本优先，次文本截断；内容键变化时做淡入动画（除非禁用）
  return (
    <span key={enabled && !disableAnimation ? contentKey : undefined} className="min-w-0 truncate">
      {primaryText ?? secondaryText}
    </span>
  );
}

/** 原 sut（js 100095 / jsx 86415）：摘要行前段 = 图标 + 种类标签 + 种类细节 + 来源徽章 */
function ToolLayoutSummaryPrefix({
  icon,
  kindDetail,
  kindLabel,
  kindLabelClassName,
  showIcon,
  sourceLabel,
}: Pick<ToolLayoutProps, "icon" | "kindDetail" | "kindLabel" | "showIcon" | "sourceLabel"> & { kindLabelClassName?: string }) {
  return (
    <>
      {showIcon ? <span className="shrink-0 text-foreground-subtlest [&_svg]:text-foreground-subtlest">{icon}</span> : null}
      {kindLabel != null && kindLabel !== false && kindLabel !== `` ? <span className={kindLabelClassName}>{kindLabel}</span> : null}
      {kindDetail ? <span className="min-w-0 shrink-0">{kindDetail}</span> : null}
      {sourceLabel ? (
        <span className="shrink-0 rounded border border-border bg-background-alt px-1.5 py-0.5 text-ui-xs leading-none text-foreground-subtlest">
          {sourceLabel}
        </span>
      ) : null}
    </>
  );
}

/** 原 cut（js 100122 / jsx 86425）：摘要行后段 = 分隔符 + 主/次文本 + diff 计数 + 状态 */
function ToolLayoutSummaryContent({
  animateContent,
  contentKey,
  diffCount,
  disableContentAnimation,
  isExpanded,
  primaryText,
  secondaryText,
  separator,
  statusNode,
}: {
  animateContent?: boolean;
  contentKey: string;
  diffCount?: React.ReactNode;
  disableContentAnimation?: boolean;
  isExpanded: boolean;
  primaryText?: React.ReactNode;
  secondaryText?: React.ReactNode;
  separator?: React.ReactNode;
  statusNode?: React.ReactNode;
}) {
  return (
    <div className="min-w-0 flex max-w-full items-center gap-2 text-foreground-subtlest">
      {separator == null ? null : <span className="shrink-0 text-foreground-subtlest">{separator}</span>}
      <ToolLayoutAnimatedText
        contentKey={contentKey}
        primaryText={primaryText}
        secondaryText={secondaryText}
        enabled={!!animateContent && !isExpanded}
        disableAnimation={disableContentAnimation}
      />
      {diffCount}
      {statusNode}
    </div>
  );
}

/** 原 out（jsx 86412）：Enter/Space 激活 */
function activateOnEnterOrSpace(event: React.KeyboardEvent, onActivate: () => void): boolean {
  if (event.key !== `Enter` && event.key !== ` `) return false;
  event.preventDefault();
  onActivate();
  return true;
}

/**
 * 原 lut（js 100151 / jsx 86444）：ToolLayout 头部行。
 * 三态：① summaryAction（整行可点击动作）② canToggle（折叠触发器，悬停显 ▶/⌄）
 * ③ 纯展示。类名逐字保留。
 */
function ToolLayoutHeader(
  props: ToolLayoutProps & {
    isExpanded: boolean;
    toggleAriaLabel: string;
    kindLabelClassName?: string;
    statusNode?: React.ReactNode;
  },
) {
  const { summaryAction: action, canToggle, forceOpen, isExpanded, title, toggleAriaLabel, toolId } = props;
  const summary = (
    <>
      <ToolLayoutSummaryPrefix {...props} />
      <ToolLayoutSummaryContent
        animateContent={props.animateSummaryContent}
        contentKey={props.summaryContentKey ?? ``}
        diffCount={props.diffCount}
        disableContentAnimation={props.disableSummaryContentAnimation}
        isExpanded={isExpanded}
        primaryText={props.primaryText}
        secondaryText={props.secondaryText}
        separator={props.summaryContentSeparator}
        statusNode={props.statusNode}
      />
    </>
  );
  if (action) {
    return (
      <div
        data-testid={action.testId ?? `tool-summary-trigger:${toolId}`}
        role="button"
        tabIndex={0}
        aria-label={action.ariaLabel}
        onClick={action.onActivate}
        onKeyDown={(event) => activateOnEnterOrSpace(event, action.onActivate)}
        className="group/tool-summary inline-flex max-w-full cursor-pointer items-center gap-2 self-start text-left text-ui-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused"
        title={typeof title === `string` ? title : undefined}
      >
        {summary}
      </div>
    );
  }
  if (canToggle) {
    return (
      <CollapsibleTrigger asChild>
        <div
          data-testid={`tool-summary-toggle:${toolId}`}
          role="button"
          tabIndex={0}
          aria-expanded={isExpanded}
          aria-label={toggleAriaLabel}
          onKeyDown={(event) => {
            if (event.key !== `Enter` && event.key !== ` `) return;
            event.preventDefault();
            event.currentTarget.click();
          }}
          className="group/tool-summary inline-flex max-w-full cursor-pointer items-center gap-2 self-start text-left text-ui-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused"
          title={typeof title === `string` ? title : undefined}
        >
          {summary}
          <IconChevronRight
            aria-hidden={true}
            className={cn(
              `size-4 text-foreground-subtlest opacity-0 transition-transform transition-opacity duration-200 ease-out will-change-transform group-hover/tool-summary:opacity-100 shrink-0`,
              isExpanded ? `rotate-90 opacity-100` : `rotate-0`,
              forceOpen && `opacity-100`,
            )}
          />
        </div>
      </CollapsibleTrigger>
    );
  }
  return (
    <div
      data-testid={`tool-summary-toggle:${toolId}`}
      className="group/tool-summary cursor-default flex w-full items-center gap-2 text-left text-ui-base transition-colors focus-visible:outline-none"
      title={typeof title === `string` ? title : undefined}
    >
      {summary}
    </div>
  );
}

/** 原 cQ（jsx 86466）：工具卡展开态内存缓存（按 persistOpenKey ?? toolId） */
const toolLayoutOpenStateStore = new Map<string, boolean>();
/** 原 uut（jsx 86467）：收起动画延迟 300ms */
const TOOL_LAYOUT_COLLAPSE_DELAY_MS = 300;
const TOOL_LAYOUT_CONTENT_TEXT_CLASS = `text-popover-foreground outline-none`; // dut
const TOOL_LAYOUT_CONTENT_PAD_CLASS = `pt-2`; // fut

/**
 * ToolLayout（原 put，js 100214 / jsx 86470；memo 名 lQ，js 100416 / jsx 86604，
 * displayName=`ToolLayout`）。所有工具折叠块的共享壳：
 * - 展开态持久化在内存 Map（cQ），跨滚动虚拟化复用；
 * - autoOpen：首次出现即展开并记账；autoCollapseOnComplete：运行结束自动收起；
 * - 失败状态（showFailureStatus）的状态文案支持 tooltip + 复制（chat.toolCall.copyError*）；
 * - 展开/收起有 300ms 收起延迟以完成动画。
 */
function ToolLayoutImpl(props: ToolLayoutProps) {
  const {
    toolId,
    persistOpenKey,
    icon,
    showIcon = true,
    canToggle = true,
    forceOpen = false,
    autoOpen = false,
    autoCollapseOnComplete = false,
    kindLabel,
    expandedKindLabel,
    kindDetail,
    expandedKindDetail,
    sourceLabel,
    primaryText,
    expandedPrimaryText,
    secondaryText,
    expandedSecondaryText,
    summaryContentSeparator,
    animateSummaryContent = false,
    disableSummaryContentAnimation = false,
    summaryContentKey,
    hideSecondaryTextWhenOpen = false,
    diffCount,
    hideDiffCountWhenOpen = false,
    statusLabel,
    statusTooltip,
    showFailureStatus = false,
    isRunning = false,
    title,
    expandedTitle,
    content,
    renderContent,
    summaryAction,
  } = props;
  const { intl } = useIntlContext();
  const stateKey = persistOpenKey ?? toolId;
  const [persistedOpen, setPersistedOpen] = React.useState(() => toolLayoutOpenStateStore.get(stateKey) ?? false);
  const hasSummaryAction = summaryAction !== undefined;
  const openByProps = !hasSummaryAction && (forceOpen || (canToggle && persistedOpen));
  const [openLocally, setOpenLocally] = React.useState(openByProps);
  const [copiedTooltip, setCopiedTooltip] = React.useState(false);
  const copyResetTimer = React.useRef<number | null>(null);
  const collapseTimer = React.useRef<number | null>(null);
  const autoOpenApplied = React.useRef(false);
  const prevIsRunning = React.useRef(isRunning);
  const isExpanded = !hasSummaryAction && (openByProps || openLocally);
  const expandedContent = isExpanded ? renderContent?.() ?? content ?? null : null;
  const effectivePrimaryText = openByProps && expandedPrimaryText != null ? expandedPrimaryText : primaryText;
  const effectiveKindLabel = openByProps && expandedKindLabel != null ? expandedKindLabel : kindLabel;
  const effectiveKindDetail = openByProps && expandedKindDetail !== undefined ? expandedKindDetail : kindDetail;
  const effectiveSecondaryText =
    openByProps && expandedSecondaryText !== undefined ? expandedSecondaryText : openByProps && hideSecondaryTextWhenOpen ? null : secondaryText;
  const effectiveTitle = openByProps && expandedTitle !== undefined ? expandedTitle : title;
  const contentKey = summaryContentKey ?? `${String(effectiveTitle ?? ``)}:${String(statusLabel ?? ``)}`;
  const showDiffCount = diffCount != null && !(openByProps && hideDiffCountWhenOpen);
  const kindLabelClassName = cn(`font-medium whitespace-nowrap shrink-0`, isRunning ? `animated-gradient-text` : `text-foreground-subtlest`);

  React.useEffect(() => {
    setPersistedOpen(toolLayoutOpenStateStore.get(stateKey) ?? false);
  }, [stateKey]);
  React.useEffect(() => {
    if (!autoOpen || autoOpenApplied.current) return;
    toolLayoutOpenStateStore.set(stateKey, true);
    setOpenLocally(true);
    setPersistedOpen(true);
    autoOpenApplied.current = true;
  }, [autoOpen, stateKey]);
  React.useEffect(() => {
    const wasRunning = prevIsRunning.current;
    prevIsRunning.current = isRunning;
    if (autoCollapseOnComplete && !isRunning && wasRunning) {
      toolLayoutOpenStateStore.set(stateKey, false);
      setPersistedOpen(false);
    }
  }, [autoCollapseOnComplete, isRunning, stateKey]);
  React.useEffect(() => {
    if (openByProps) {
      if (collapseTimer.current !== null) {
        window.clearTimeout(collapseTimer.current);
        collapseTimer.current = null;
      }
      setOpenLocally(true);
      return;
    }
    if (openLocally) {
      collapseTimer.current = window.setTimeout(() => {
        setOpenLocally(false);
        collapseTimer.current = null;
      }, TOOL_LAYOUT_COLLAPSE_DELAY_MS);
      return () => {
        if (collapseTimer.current !== null) {
          window.clearTimeout(collapseTimer.current);
          collapseTimer.current = null;
        }
      };
    }
    return undefined;
  }, [openByProps, openLocally]);
  React.useEffect(
    () => () => {
      if (copyResetTimer.current !== null) window.clearTimeout(copyResetTimer.current);
      if (collapseTimer.current !== null) window.clearTimeout(collapseTimer.current);
    },
    [],
  );

  const copyStatusTooltip = () => {
    if (typeof statusTooltip != `string` || statusTooltip.trim().length === 0) return;
    navigator.clipboard.writeText(statusTooltip).then(() => {
      setCopiedTooltip(true);
      if (copyResetTimer.current !== null) window.clearTimeout(copyResetTimer.current);
      copyResetTimer.current = window.setTimeout(() => {
        setCopiedTooltip(false);
        copyResetTimer.current = null;
      }, 1500);
    });
  };

  const showFailure = showFailureStatus && statusLabel != null;
  const statusNode = showFailure
    ? statusTooltip != null ? (
        <Popover>
          <PopoverAnchor>
            <PopoverTrigger asChild>
              <span className="whitespace-nowrap underline decoration-dotted underline-offset-2 cursor-help">{statusLabel}</span>
            </PopoverTrigger>
            <PopoverContent side={`top`} align={`start`} className={`max-w-96`}>
              <div className="flex max-w-96 items-center gap-2">
                <span className="line-clamp-3 min-w-0 flex-1 whitespace-pre-wrap break-words">{statusTooltip}</span>
                {typeof statusTooltip == `string` && statusTooltip.trim().length > 0 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-md"
                    className="shrink-0"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      copyStatusTooltip();
                    }}
                    title={intl.formatMessage({ id: copiedTooltip ? `chat.toolCall.copyError.copied` : `chat.toolCall.copyError` })}
                    aria-label={intl.formatMessage({ id: copiedTooltip ? `chat.toolCall.copyError.copied` : `chat.toolCall.copyError` })}
                  >
                    {copiedTooltip ? <IconCheck className="size-3" /> : <IconCopy className="size-3" />}
                  </Button>
                ) : null}
              </div>
            </PopoverContent>
          </PopoverAnchor>
        </Popover>
      ) : (
        <span className="whitespace-nowrap">{statusLabel}</span>
      )
    : null;

  const headerProps: ToolLayoutProps & {
    isExpanded: boolean;
    toggleAriaLabel: string;
    statusNode?: React.ReactNode;
    kindLabelClassName?: string;
  } = {
    ...props,
    isExpanded,
    kindLabelClassName,
    kindLabel: effectiveKindLabel,
    kindDetail: effectiveKindDetail,
    primaryText: effectivePrimaryText,
    secondaryText: effectiveSecondaryText,
    title: effectiveTitle,
    diffCount: showDiffCount ? diffCount : undefined,
    statusNode,
    toggleAriaLabel: intl.formatMessage({ id: openByProps ? `chat.toolCall.collapseDetails` : `chat.toolCall.expandDetails` }),
  };

  return (
    <Collapsible
      open={!hasSummaryAction && (forceOpen || (canToggle && persistedOpen))}
      onOpenChange={(next) => {
        if (hasSummaryAction || forceOpen) return;
        toolLayoutOpenStateStore.set(stateKey, next);
        if (next) setOpenLocally(true);
        setPersistedOpen(next);
      }}
      className={`w-full flex flex-col`}
    >
      <ToolLayoutHeader {...headerProps} icon={icon} showIcon={showIcon} sourceLabel={sourceLabel} />
      {!hasSummaryAction && canToggle ? (
        <CollapsibleContent className={TOOL_LAYOUT_CONTENT_TEXT_CLASS}>
          <div className={TOOL_LAYOUT_CONTENT_PAD_CLASS}>{expandedContent}</div>
        </CollapsibleContent>
      ) : !hasSummaryAction && forceOpen ? (
        <div className={cn(TOOL_LAYOUT_CONTENT_TEXT_CLASS, TOOL_LAYOUT_CONTENT_PAD_CLASS)}>{expandedContent}</div>
      ) : null}
    </Collapsible>
  );
}
const ToolLayout = React.memo(ToolLayoutImpl);
ToolLayout.displayName = `ToolLayout`;

/* --- 4.2 Reasoning 折叠（思考/摘要；原 z_t/B_t/V_t，js 111329–111571 / jsx 95033–95212） --- */

interface ReasoningContextValue {
  duration: number | undefined;
  isOpen: boolean;
  isStreaming: boolean;
  setIsOpen: (open: boolean) => void;
  shouldRenderContent: boolean;
}
/** 原 j_t（jsx 95007） */
const ReasoningContext = React.createContext<ReasoningContextValue | null>(null);
/** 原 M_t（jsx 95008）：必须在 Reasoning 内使用 */
function useReasoning(): ReasoningContextValue {
  const value = React.useContext(ReasoningContext);
  if (!value) throw new Error(`Reasoning components must be used within Reasoning`);
  return value;
}
const REASONING_DURATION_UNIT_MS = 1e3; // N_t
const REASONING_COLLAPSE_ANIMATION_MS = 300; // P_t
const REASONING_BOTTOM_EPSILON_PX = 2; // F_t

/** 原 I_t（jsx 95016）：autoCollapseKey 变化且用户未手动操作 → 自动收起 */
function shouldAutoCollapseReasoning({
  autoCollapseKey,
  previousAutoCollapseKey,
  userInteracted,
}: {
  autoCollapseKey: string | null;
  previousAutoCollapseKey: string | null;
  userInteracted: boolean;
}): boolean {
  return autoCollapseKey != null && autoCollapseKey !== previousAutoCollapseKey && !userInteracted;
}
/** 原 L_t/R_t（jsx 95019/95027）：距底部距离 / 是否贴底 */
function reasoningDistanceFromBottom(metrics: { clientHeight: number; scrollHeight: number; scrollTop: number }): number {
  return Math.max(0, metrics.scrollHeight - metrics.clientHeight - metrics.scrollTop);
}
function isReasoningAtBottom(metrics: { clientHeight: number; scrollHeight: number; scrollTop: number }): boolean {
  return reasoningDistanceFromBottom(metrics) <= REASONING_BOTTOM_EPSILON_PX;
}

/** 原 fa：useControllableState（dist-DJJArJ7D.js 的 p 导出；此处为等价重建） */
declare function useControllableState<T>(opts: { defaultProp: T; prop?: T; onChange?: (value: T) => void }): [T, (value: T) => void];

/**
 * Reasoning 根（原 z_t，js 111329 / jsx 95033，displayName=`Reasoning`）。
 * 流式计时（isStreaming 期间累计秒数 → duration）、受控/非受控开合、
 * autoCollapseKey 变化自动收起（如：状态 running→complete）。
 */
const Reasoning = React.memo(function Reasoning({
  className,
  isStreaming = false,
  autoCollapseKey = null,
  open,
  defaultOpen = false,
  onOpenChange,
  duration,
  children,
  ...rest
}: Omit<React.ComponentPropsWithoutRef<typeof Collapsible>, "open" | "onOpenChange"> & {
  isStreaming?: boolean;
  autoCollapseKey?: string | null;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  duration?: number;
}) {
  const isControlled = open !== undefined;
  const [isOpen, setIsOpenRaw] = useControllableState({ defaultProp: defaultOpen, prop: open, onChange: onOpenChange });
  const [resolvedDuration, setResolvedDuration] = useControllableState<number | undefined>({ defaultProp: undefined, prop: duration });
  const streamingStartedAt = React.useRef<number | null>(null);
  const collapseTimer = React.useRef<number | null>(null);
  const userInteracted = React.useRef(false);
  const previousAutoCollapseKey = React.useRef<string | null>(null);
  const [shouldRenderContent, setShouldRenderContent] = React.useState(() => isOpen);
  const setIsOpen = React.useCallback(
    (next: boolean) => {
      userInteracted.current = true;
      if (next) setShouldRenderContent(true);
      setIsOpenRaw(next);
    },
    [setIsOpenRaw],
  );
  React.useEffect(() => {
    if (isStreaming) {
      if (streamingStartedAt.current === null) streamingStartedAt.current = Date.now();
    } else if (streamingStartedAt.current !== null) {
      setResolvedDuration(Math.ceil((Date.now() - streamingStartedAt.current) / REASONING_DURATION_UNIT_MS));
      streamingStartedAt.current = null;
    }
  }, [isStreaming, setResolvedDuration]);
  React.useEffect(() => {
    const previous = previousAutoCollapseKey.current;
    previousAutoCollapseKey.current = autoCollapseKey;
    if (!isControlled && shouldAutoCollapseReasoning({ autoCollapseKey, previousAutoCollapseKey: previous, userInteracted: userInteracted.current })) {
      setIsOpenRaw(false);
    }
  }, [autoCollapseKey, isControlled, setIsOpenRaw]);
  React.useEffect(() => {
    if (isOpen) {
      if (collapseTimer.current !== null) {
        window.clearTimeout(collapseTimer.current);
        collapseTimer.current = null;
      }
      setShouldRenderContent(true);
      return;
    }
    if (shouldRenderContent) {
      collapseTimer.current = window.setTimeout(() => {
        setShouldRenderContent(false);
        collapseTimer.current = null;
      }, REASONING_COLLAPSE_ANIMATION_MS);
      return () => {
        if (collapseTimer.current !== null) {
          window.clearTimeout(collapseTimer.current);
          collapseTimer.current = null;
        }
      };
    }
    return undefined;
  }, [isOpen, shouldRenderContent]);
  React.useEffect(
    () => () => {
      if (collapseTimer.current !== null) window.clearTimeout(collapseTimer.current);
    },
    [],
  );
  const contextValue = React.useMemo(
    () => ({ duration: resolvedDuration, isOpen, isStreaming, setIsOpen, shouldRenderContent }),
    [resolvedDuration, isOpen, isStreaming, setIsOpen, shouldRenderContent],
  );
  return (
    <ReasoningContext.Provider value={contextValue}>
      <Collapsible className={cn(`not-prose flex flex-col`, className)} onOpenChange={setIsOpen} open={isOpen} {...rest}>
        {children}
      </Collapsible>
    </ReasoningContext.Provider>
  );
});

/**
 * Reasoning 触发器（原 B_t，js 111405 / jsx 95083，displayName=`ReasoningTrigger`）。
 * 文案三态：流式中「正在思考」（渐变动画字）/ 已结束有时长「已思考 · N 秒」/ 无时长「已思考 · 几秒」。
 * chat.reasoning.thinking / thought / durationSeconds / durationFewSeconds
 */
const ReasoningTrigger = React.memo(function ReasoningTrigger({
  className,
  children,
  getThinkingMessage,
  ...rest
}: React.ComponentPropsWithoutRef<typeof CollapsibleTrigger> & {
  getThinkingMessage?: (isStreaming: boolean, duration: number | undefined) => React.ReactNode;
}) {
  const { isStreaming, isOpen, duration } = useReasoning();
  const { intl } = useIntlContext();
  const label =
    getThinkingMessage?.(isStreaming, duration) ??
    (isStreaming || duration === 0 ? (
      <span className="animated-gradient-text font-medium">{intl.formatMessage({ id: `chat.reasoning.thinking` })}</span>
    ) : duration === undefined ? (
      <>
        <span className="font-medium text-foreground-subtlest">{intl.formatMessage({ id: `chat.reasoning.thought` })}</span>
        <span className="font text-foreground-subtlest">{` `}{intl.formatMessage({ id: `chat.reasoning.durationFewSeconds` })}</span>
      </>
    ) : (
      <>
        <span className="font-medium text-foreground-subtlest">{intl.formatMessage({ id: `chat.reasoning.thought` })}</span>
        <span className="font text-foreground-subtlest">
          {` `}{intl.formatMessage({ id: `chat.reasoning.durationSeconds` }, { seconds: String(duration) })}
        </span>
      </>
    ));
  return (
    <CollapsibleTrigger
      data-testid="v4-reasoning-trigger"
      className={cn(`group/reasoning inline-flex max-w-full items-center gap-2 self-start text-ui-base transition-colors`, className)}
      {...rest}
    >
      {children ?? (
        <>
          <IconLightbulb className="size-4 shrink-0 text-foreground-subtlest" />
          {label}
          <IconChevronRight
            className={cn(
              `size-4 text-foreground-subtlest transition-opacity transition-transform`,
              isOpen ? `rotate-90 opacity-100` : `rotate-0 opacity-0 group-hover/reasoning:opacity-100`,
            )}
          />
        </>
      )}
    </CollapsibleTrigger>
  );
});

/** 滚动遮罩状态（原 yV/bV/xV，jsx 95122 附近）：顶部/底部渐隐指示 */
interface ScrollMaskState {
  showTop: boolean;
  showBottom: boolean;
}
const EMPTY_SCROLL_MASK: ScrollMaskState = { showTop: false, showBottom: false };
declare function computeScrollMask(metrics: { clientHeight: number; scrollHeight: number; scrollTop: number }): ScrollMaskState;
declare function scrollMaskStyle(state: ScrollMaskState): React.CSSProperties;

/**
 * Reasoning 内容（原 V_t，js 111471 / jsx 95122，displayName=`ReasoningContent`）。
 * max-h-60 滚动区 + 左竖线（ml-2 border-l pl-3.5）+ 贴底跟随（流式时自动滚到底）+
 * 顶/底渐遮罩（data-reasoning-scroll-mask=none|top|bottom|both）。
 */
const ReasoningContent = React.memo(function ReasoningContent({
  className,
  children,
  forceMount,
  ...rest
}: React.ComponentPropsWithoutRef<typeof CollapsibleContent> & { forceMount?: boolean }) {
  const { isOpen, shouldRenderContent } = useReasoning();
  const mounted = isOpen || shouldRenderContent || !!forceMount;
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const innerRef = React.useRef<HTMLDivElement | null>(null);
  const stickToBottom = React.useRef(true);
  const [mask, setMask] = React.useState<ScrollMaskState>(EMPTY_SCROLL_MASK);
  const refreshMask = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) {
      setMask(EMPTY_SCROLL_MASK);
      return;
    }
    setMask(computeScrollMask({ clientHeight: el.clientHeight, scrollHeight: el.scrollHeight, scrollTop: el.scrollTop }));
  }, []);
  const scrollToBottom = React.useCallback(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
      refreshMask();
    }
  }, [refreshMask]);
  const handleScroll = React.useCallback(() => {
    const el = scrollRef.current;
    if (el) {
      stickToBottom.current = isReasoningAtBottom({ clientHeight: el.clientHeight, scrollHeight: el.scrollHeight, scrollTop: el.scrollTop });
      refreshMask();
    }
  }, [refreshMask]);
  React.useEffect(() => {
    if (!mounted) {
      stickToBottom.current = true;
      setMask(EMPTY_SCROLL_MASK);
      return;
    }
    const el = scrollRef.current;
    if (!el || typeof ResizeObserver > `u`) {
      stickToBottom.current ? scrollToBottom() : refreshMask();
      return;
    }
    const update = () => {
      if (stickToBottom.current) {
        scrollToBottom();
        return;
      }
      refreshMask();
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    if (innerRef.current) observer.observe(innerRef.current);
    return () => observer.disconnect();
  }, [scrollToBottom, mounted, refreshMask]);
  React.useEffect(() => {
    if (mounted) {
      if (stickToBottom.current) {
        scrollToBottom();
        return;
      }
      refreshMask();
    }
  }, [children, scrollToBottom, refreshMask, mounted]);
  const maskStyle = scrollMaskStyle(mask);
  const maskSide = mask.showTop && mask.showBottom ? `both` : mask.showTop ? `top` : mask.showBottom ? `bottom` : `none`;
  return (
    <CollapsibleContent data-reasoning-content={`true`} data-testid="v4-reasoning-content" forceMount={forceMount} className={className} {...rest}>
      {mounted ? (
        <div className="pt-3">
          <div
            ref={scrollRef}
            className="ml-2 max-h-60 space-y-2 overflow-auto border-border border-l pl-3.5 text-ui-base text-foreground-subtlest"
            data-reasoning-scroll-mask={maskSide}
            onScroll={handleScroll}
            style={maskStyle}
          >
            <div ref={innerRef} className="min-w-0 whitespace-pre-wrap break-words text-foreground-subtlest">
              {children}
            </div>
          </div>
        </div>
      ) : null}
    </CollapsibleContent>
  );
});

/* --- 4.3 ToolCallBlock 与工具视图分派（原 Ght/K$/Wht，js 109066–109242 / jsx 93114–93275） --- */

/** 原子工具卡缩进类（原 Fht，jsx 93114）：子工具调用左竖线缩进 */
const TOOL_CHILD_INDENT_CLASS = `ml-2 space-y-2 border-border border-l pl-3.5 border-border`;
/** 原 Iht/Lht（jsx 93115）：流式入场动画缓存上限 800 / 动画时长 1000ms */
const STREAMING_ENTRANCE_CACHE_LIMIT = 800;
const STREAMING_ENTRANCE_DURATION_MS = 1e3;
/** 原 G$（jsx 93117）：已播放过入场动画的工具卡（LRU 按时间戳淘汰） */
const streamingEntranceSeenCache = new Map<string, number>();
function pruneStreamingEntranceCache() {
  if (streamingEntranceSeenCache.size <= STREAMING_ENTRANCE_CACHE_LIMIT) return;
  const oldest = Array.from(streamingEntranceSeenCache.entries())
    .sort(([, a], [, b]) => a - b)
    .slice(0, streamingEntranceSeenCache.size - STREAMING_ENTRANCE_CACHE_LIMIT)
    .map(([key]) => key);
  for (const key of oldest) streamingEntranceSeenCache.delete(key);
}
function normalizeStreamingEntranceKey(key: string): string | null {
  const trimmed = key.trim();
  return trimmed.length > 0 ? trimmed : null;
}
function hasSeenStreamingEntrance(key: string): boolean {
  const normalized = normalizeStreamingEntranceKey(key);
  return normalized === null || streamingEntranceSeenCache.has(normalized);
}
function markStreamingEntranceSeen(key: string) {
  const normalized = normalizeStreamingEntranceKey(key);
  if (normalized !== null) {
    streamingEntranceSeenCache.set(normalized, Date.now());
    pruneStreamingEntranceCache();
  }
}
function shouldPlayStreamingEntrance(key: string, active: boolean): boolean {
  return active && !hasSeenStreamingEntrance(key);
}
/** 原 Uht（jsx 93135）：agent 家族工具（子代理）不参与嵌套缩进判定 */
function isAgentToolCall(toolCall: ToolCall): boolean {
  return classifyToolCall(toolCall).family === `agent`;
}

/** ToolCallBlock 视图上下文（原 Ght 内 useMemo 组装的 I 对象） */
interface ToolCallViewProps {
  toolCallNode: ToolCallNode;
  workspacePath?: string;
  theme?: string;
  codePreviewSettings?: CodePreviewSettings;
  displayModel: ToolDisplayModel;
  viewerSource: unknown;
  rawFileSummaries: unknown[];
  isRunning: boolean;
  statusLabel: string;
  sourceLabel?: string;
  errorText?: string;
  childToolList: React.ReactNode;
  showIcon: boolean;
  showTodoToolCalls: boolean;
  disableSummaryContentAnimation: boolean;
  agentSummaryAction?: unknown;
  authoritativeAgentType?: string;
  onOpenCodeViewer?: OpenCodeViewerFn;
  onOpenFileLink?: (path: string) => void;
  onOpenBrowserUrl?: (url: string) => void;
  onOpenAutomationsMain?: () => void;
  onOpenPlanDetail?: (plan: unknown) => void;
  onLoadFullToolCallFields?: (toolId: string) => void;
  /** permission 覆盖层复用工具视图时的种类标签覆盖（原 kindLabelOverride） */
  kindLabelOverride?: React.ReactNode;
  canToggle?: boolean;
  forceOpen?: boolean;
}

/* 各工具视图组件（§4.6 登记表给出全部 16 个的混淆名/行号；此处声明接口） */
declare const ShellToolView: React.FC<ToolCallViewProps>; // 实现见 §4.5（原 ept 全量还原）
declare function isAutomationToolCall(props: ToolCallViewProps): boolean; // Vmt (107448 / 92190)

/**
 * 原 Wht（js 109066 / jsx 93141）：按工具家族分派视图组件。
 * node-repl 与 automation 优先于家族表判定。
 */
function resolveToolCallView(props: ToolCallViewProps): React.FC<ToolCallViewProps> {
  const identity = classifyToolCall(props.toolCallNode.toolCall);
  if (identity.family === `node-repl`) return NodeReplToolView;
  if (isAutomationToolCall(props)) return AutomationToolView;
  switch (identity.family) {
    case `plan-guidance`:
      return SearchToolView; // qmt：plan-guidance 复用搜索类摘要视图（93222 附近）
    case `agent`:
      return AgentToolView;
    case `todo`:
      return TodoToolView;
    case `ask-user-question`:
      return AskUserQuestionToolView;
    case `message`:
      return props.toolCallNode.toolCall.toolName === `RespondToCoordinator` ? SessionContextToolView : FallbackToolView;
    case `task-control`:
      return props.toolCallNode.toolCall.toolName === `TaskOutput` ? TaskOutputToolView : TaskControlToolView;
    case `skill`:
      return SkillToolView;
    case `session-context`:
      return SessionContextToolView;
    case `file-read`:
      return FileReadToolView;
    case `file-write`:
      return FileWriteToolView;
    case `explore`:
      return ExploreToolView;
    case `switch-mode`:
      return SwitchModeToolView;
    case `search`:
      return SearchToolView;
    case `shell`:
      return ShellToolView;
    case `goal`:
      return GoalToolView;
    default:
      return FallbackToolView;
  }
}

/** 原 $ne（jsx 93246 附近）：展示状态 → isRunning（input-streaming/input-available/output-streaming） */
declare function isToolCallRunningByDisplayStatus(displayStatus: string): boolean;
/** 原 Tee（jsx 93249 附近）：展示状态 → 状态文案 i18n key（chat.toolCall.status.*） */
declare function toolCallStatusI18nId(displayStatus: string, rawStatus: string): string;
/** 原 zlt 的输入：原始状态归一化 */
declare function normalizeToolCallStatusRaw(status: string): string;

/**
 * ToolCallBlock（原 Ght，js 109105 / jsx 93180；memo 名 K$，js 109241 / jsx 93274，
 * displayName=`ToolCallBlock`）。
 * 组装流程：状态归一化 → 显示模型 → 文件摘要 → 错误文案 → 子工具列表（递归）→
 * 家族视图分派。流式入场动画（data-zcode-tool-stream-animate）每张卡只播一次。
 */
function ToolCallBlockImpl({
  toolCallNode,
  depth = 0,
  workspacePath,
  theme,
  codePreviewSettings,
  showIcon = true,
  onOpenCodeViewer,
  onOpenFileLink,
  onOpenBrowserUrl,
  onOpenAutomationsMain,
  onOpenPlanDetail,
  onLoadFullToolCallFields,
  suppressSourceLabel = false,
  showTodoToolCalls = true,
  disableSummaryContentAnimation = false,
  agentSummaryAction,
  authoritativeAgentType,
  streamingEntranceActive = false,
  streamingEntranceKeyPrefix = `tool`,
}: {
  toolCallNode: ToolCallNode;
  depth?: number;
  workspacePath?: string;
  theme?: string;
  codePreviewSettings?: CodePreviewSettings;
  showIcon?: boolean;
  onOpenCodeViewer?: OpenCodeViewerFn;
  onOpenFileLink?: (path: string) => void;
  onOpenBrowserUrl?: (url: string) => void;
  onOpenAutomationsMain?: () => void;
  onOpenPlanDetail?: (plan: unknown) => void;
  onLoadFullToolCallFields?: (toolId: string) => void;
  suppressSourceLabel?: boolean;
  showTodoToolCalls?: boolean;
  disableSummaryContentAnimation?: boolean;
  agentSummaryAction?: unknown;
  authoritativeAgentType?: string;
  streamingEntranceActive?: boolean;
  streamingEntranceKeyPrefix?: string;
}) {
  const { toolCall, childToolCalls } = toolCallNode;
  const { intl } = useIntlContext();
  const entranceKey = `${streamingEntranceKeyPrefix}:${toolCall.toolId}`;
  const [entranceActive, setEntranceActive] = React.useState(() => shouldPlayStreamingEntrance(entranceKey, streamingEntranceActive));
  React.useEffect(() => {
    if (!streamingEntranceActive || entranceActive) return;
    if (shouldPlayStreamingEntrance(entranceKey, streamingEntranceActive)) setEntranceActive(true);
  }, [entranceActive, streamingEntranceActive, entranceKey]);
  React.useEffect(() => {
    if (!entranceActive) return;
    const markTimer = window.setTimeout(() => {
      markStreamingEntranceSeen(entranceKey);
    }, 0);
    const stopTimer = window.setTimeout(() => {
      setEntranceActive(false);
    }, STREAMING_ENTRANCE_DURATION_MS);
    return () => {
      window.clearTimeout(markTimer);
      window.clearTimeout(stopTimer);
    };
  }, [entranceActive, entranceKey]);

  const identity = classifyToolCall(toolCall);
  const displayStatus = normalizeToolCallStatus(toolCall.status);
  const displayModel = React.useMemo(() => resolveToolDisplayModel(toolCall, workspacePath), [toolCall, workspacePath]);
  const rawFileSummaries = React.useMemo(
    () =>
      extractRawFileSummaries((toolCall as { raw?: unknown }).raw, {
        ...toolCall,
      }),
    [toolCall],
  );
  const isRunning = isToolCallRunningByDisplayStatus(displayStatus);
  const statusLabel = intl.formatMessage({ id: toolCallStatusI18nId(displayStatus, toolCall.status) });
  const errorText = extractToolErrorText(toolCall);
  const isNested = !isAgentToolCall(toolCall) && (depth > 0 || !!toolCall.parentToolUseId);
  const sourceLabel =
    !suppressSourceLabel && isNested ? intl.formatMessage({ id: `chat.toolCall.source.subAgent` }) : undefined;
  const childToolList = React.useMemo(
    () =>
      childToolCalls.length > 0 ? (
        <div className={TOOL_CHILD_INDENT_CLASS}>
          {childToolCalls.map((child) => (
            <ToolCallBlock
              key={child.toolCall.toolId}
              toolCallNode={child}
              depth={depth + 1}
              workspacePath={workspacePath}
              theme={theme}
              codePreviewSettings={codePreviewSettings}
              showIcon={showIcon}
              onOpenCodeViewer={onOpenCodeViewer}
              onOpenFileLink={onOpenFileLink}
              onOpenBrowserUrl={onOpenBrowserUrl}
              onOpenAutomationsMain={onOpenAutomationsMain}
              onOpenPlanDetail={onOpenPlanDetail}
              onLoadFullToolCallFields={onLoadFullToolCallFields}
              suppressSourceLabel={suppressSourceLabel}
              showTodoToolCalls={showTodoToolCalls}
              disableSummaryContentAnimation={disableSummaryContentAnimation}
              streamingEntranceActive={streamingEntranceActive}
              streamingEntranceKeyPrefix={streamingEntranceKeyPrefix}
            />
          ))}
        </div>
      ) : null,
    [
      childToolCalls,
      depth,
      onLoadFullToolCallFields,
      onOpenAutomationsMain,
      onOpenBrowserUrl,
      onOpenPlanDetail,
      onOpenFileLink,
      onOpenCodeViewer,
      showIcon,
      showTodoToolCalls,
      streamingEntranceActive,
      streamingEntranceKeyPrefix,
      suppressSourceLabel,
      theme,
      codePreviewSettings,
      workspacePath,
      disableSummaryContentAnimation,
    ],
  );
  const viewProps: ToolCallViewProps = React.useMemo(
    () => ({
      toolCallNode,
      workspacePath,
      theme,
      codePreviewSettings,
      displayModel,
      viewerSource: displayModel.viewerSource,
      rawFileSummaries,
      isRunning,
      statusLabel,
      sourceLabel,
      errorText,
      childToolList,
      showIcon,
      showTodoToolCalls,
      disableSummaryContentAnimation,
      agentSummaryAction,
      authoritativeAgentType,
      onOpenCodeViewer,
      onOpenFileLink,
      onOpenBrowserUrl,
      onOpenAutomationsMain,
      onOpenPlanDetail,
      onLoadFullToolCallFields,
    }),
    [
      agentSummaryAction,
      authoritativeAgentType,
      childToolList,
      codePreviewSettings,
      displayModel,
      disableSummaryContentAnimation,
      errorText,
      isRunning,
      onLoadFullToolCallFields,
      onOpenAutomationsMain,
      onOpenBrowserUrl,
      onOpenPlanDetail,
      onOpenFileLink,
      onOpenCodeViewer,
      rawFileSummaries,
      showIcon,
      showTodoToolCalls,
      sourceLabel,
      statusLabel,
      theme,
      toolCallNode,
      workspacePath,
    ],
  );
  const ToolView = React.useMemo(() => resolveToolCallView(viewProps), [viewProps]);
  if (!showTodoToolCalls && identity.family === `todo`) return null;
  return (
    <div
      className="w-full"
      data-testid={`v4-tool-call:${toolCall.toolId}`}
      data-tool-call-id={toolCall.toolId}
      data-tool-name={toolCall.toolName ?? toolCall.kind ?? ``}
      data-status={toolCall.status}
      data-zcode-tool-stream-animate={entranceActive ? `true` : undefined}
    >
      <ToolView {...viewProps} />
    </div>
  );
}
const ToolCallBlock = React.memo(ToolCallBlockImpl);
ToolCallBlock.displayName = `ToolCallBlock`;

/* --- 4.4 工具状态/错误助手登记（实现见行号） ---
 * zlt normalizeToolCallStatus      js 99513 / jsx 85879（Rlt 状态映射表）
 * nQ  unwrapToolUseError           jsx 85900
 * rQ  extractToolErrorText         js 99542 / jsx 85908
 * Glt resolveToolDisplayModel      js 99696 / jsx 86085（Wlt 规则表 js 99593 / jsx 85968）
 * og  classifyToolCall             js 23084 / jsx 19826（横切层，toolName/kind → family）
 * _g  extractRawFileSummaries      js 20269 / jsx 20269 附近（横切层）
 * qZ  buildPlanResultMarkdown      js 98044 / jsx 85024
 */

/* --- 4.5 ShellToolView（原 ept，js 105266 / jsx 90506）——代表性工具视图全量还原 ---
 * spec §6：工具行「▶ ✓ 名称: 摘要」折叠块，bash 显示命令前缀。
 * 摘要行 = 「执行中/执行了」+ 命令单行截断；展开 = $ 命令全文 + 输出（失败时错误优先）。
 * chat.toolCall.execute.running / ran / execute / noOutput
 */

/** 原 Qft（jsx 90400）：bash 命令单行摘要（截断） */
declare function summarizeShellCommand(input: unknown): string | undefined;
/** 原 KQ（jsx 90439）：解析执行命令（含包装/转义还原） */
declare function resolveShellExecution(input: unknown): { executionCommand: string };
/** 原 qQ（jsx 90481）：输出文本提取 */
declare function extractShellOutput(output: unknown): string | undefined;
/** 原 GQ（jsx 90397）：raw 是否含 rawOutput */
declare function hasRawShellOutput(raw: unknown): boolean;

/** shell 工具图标（原 Zft，jsx 90396） */
const SHELL_TOOL_ICON = <IconSquareTerminal className="size-4 shrink-0 text-foreground-subtle" />;

function ShellToolViewImpl(props: ToolCallViewProps) {
  const { intl } = useIntlContext();
  const { toolCallNode, isRunning, statusLabel, errorText } = props;
  const { toolCall } = toolCallNode;
  const commandSummary = summarizeShellCommand(toolCall.input);
  const execution = resolveShellExecution(toolCall.input);
  const outputText = extractShellOutput(toolCall.output);
  const rawOutputText = hasRawShellOutput(toolCall.raw) ? extractShellOutput((toolCall.raw as { rawOutput?: unknown }).rawOutput) : null;
  const fallbackOutput = outputText ?? rawOutputText;
  const failureText = toolCall.status === `failed` ? errorText ?? fallbackOutput ?? undefined : undefined;
  const secondaryText = React.useMemo(() => <code className="truncate font-sans">{commandSummary}</code>, [commandSummary]);
  const renderContent = React.useCallback(
    () => (
      <div className="space-y-3 mb-2 rounded-xl border border-border bg-panel px-4 py-3">
        <div className="space-y-1">
          <div className="flex items-start gap-2 font-mono text-ui-base text-foreground">
            <span className="shrink-0 text-foreground-subtle">{`$`}</span>
            <pre className="min-w-0 flex-1 block max-h-15 overflow-over truncate whitespace-pre-wrap break-words">{execution.executionCommand}</pre>
          </div>
        </div>
        {failureText || fallbackOutput ? (
          <div className="space-y-1">
            <pre className="max-h-25 overflow-auto whitespace-pre-wrap break-words font-mono text-ui-base text-foreground-subtle">
              {failureText ?? fallbackOutput}
            </pre>
          </div>
        ) : !isRunning ? (
          <div className="space-y-1">
            <p className="font-mono text-ui-base text-foreground-subtle">{intl.formatMessage({ id: `chat.toolCall.execute.noOutput` })}</p>
          </div>
        ) : null}
      </div>
    ),
    [execution.executionCommand, failureText, intl, isRunning, fallbackOutput],
  );
  return (
    <>
      <ToolLayout
        toolId={toolCall.toolId}
        icon={SHELL_TOOL_ICON}
        showIcon={props.showIcon !== false}
        canToggle={props.canToggle ?? true}
        forceOpen={props.forceOpen ?? false}
        hideSecondaryTextWhenOpen={true}
        kindLabel={
          props.kindLabelOverride ?? intl.formatMessage({ id: isRunning ? `chat.toolCall.execute.running` : `chat.toolCall.execute.ran` })
        }
        sourceLabel={props.sourceLabel}
        primaryText={commandSummary ? null : toolCall.title ?? toolCall.kind ?? intl.formatMessage({ id: `chat.toolCall.execute.execute` })}
        secondaryText={secondaryText}
        statusLabel={statusLabel}
        statusTooltip={failureText}
        showFailureStatus={toolCall.status === `failed`}
        isRunning={isRunning}
        title={toolCall.title}
        renderContent={renderContent}
      />
      {/* 快照引用脚注（原 sQ，jsx 86252）：snapshotRefs 存在时显示「加载完整字段」入口 */}
      {toolCall.snapshotRefs && toolCall.snapshotRefs.length > 0 ? (
        <ToolSnapshotRefs
          refs={toolCall.snapshotRefs}
          onLoadFullToolCallFields={props.onLoadFullToolCallFields ? () => props.onLoadFullToolCallFields?.(toolCall.toolId) : undefined}
        />
      ) : null}
    </>
  );
}
/** 原 sQ（jsx 86252）：快照引用脚注（接口保留） */
declare const ToolSnapshotRefs: React.FC<{ refs: unknown[]; onLoadFullToolCallFields?: () => void }>;

/* --- 4.6 工具视图登记表（混淆名 → 语义名 → js / jsx 行；接口级，按需补全） ---
 * ept ShellToolView          105266 / 90506  ← 本文全量还原（§4.5）
 * opt FileReadToolView       105465 / 90648  chat.toolCall.read.*（读了/正在读 + 文件摘要）
 * Gft FileWriteToolView      104844 / 90186  chat.toolCall.write.*（写入/编辑 + diff 计数）
 * Spt ExploreToolView        105825 / 91001  chat.toolCall.explore.*（浏览目录）
 * upt SearchToolView         105569 / 90768  chat.toolCall.search.*（搜索 + 命中数）
 * Mht TodoToolView           108857 / 93007  chat.toolCall.todo.*（待办列表渲染，可整卡隐藏）
 * Pht AskUserQuestionToolView 108963 / 93067 chat.toolCall.askUserQuestion.*
 * Vpt AgentToolView          106243 / 91282  chat.toolCall.agent.*（子代理卡 + 摘要动作）
 * Hpt SwitchModeHint         （91360）       permission 切模式提示（覆盖层文件引用）
 * Dht TaskControlToolView    108728 / 92913  chat.toolCall.taskControl.*
 * Sht TaskOutputToolView     108581 / 92885  chat.toolCall.taskOutput.*
 * mht SkillToolView          108309 / 92648  chat.toolCall.skill.*
 * eht SessionContextToolView 107835 / 92387  chat.toolCall.sessionContext.*
 * ght SwitchModeToolView     108426 / 92791  chat.toolCall.switchMode.*
 * omt GoalToolView           106753 / 91596  chat.toolCall.goal.*（/goal 命令卡）
 * Nmt NodeReplToolView       107168 / 91902  chat.toolCall.nodeRepl.*
 * Wmt AutomationToolView     107472 / 92193  automations.*（定时任务卡，Vmt 判定 107448）
 * Qpt FallbackToolView       106609 / 91478  chat.toolCall.generic.*（通用 输入/输出 JSON）
 * 各视图共享 ToolLayout 壳；图标常量：Bft(90150) Zft(90396) tpt(90555) spt(90711)
 * dpt(90804) Ipt(91208) $pt(91538) Dmt(91861) Pmt(92022) Gmt(92189) Jmt(92262)
 * nht(92467) oht(92521) dht(92623) _ht(92788) Cht(92881) Oht(92980) Nht(93064)
 * -------------------------------------------------------------------------- */

/* ============================================================================
 * 5. Turn 子族（轮分段渲染；spec §6：turn 以 turnHeader 分段，轮级动作
 *    canFork/canEdit/canRetry/canRewindFiles 挂在轮上而非气泡按钮）
 *    js 110158–113295 / jsx 94198–96489
 * ==========================================================================*/

/** 行渲染上下文（原 Rbt 的 rowContext 参数 on；由 R0 组装） */
interface RowRenderContext {
  workspacePath?: string;
  workspaceIdentity?: string | null;
  workspaceRemoteSessionId?: string | null;
  sessionId?: string | null;
  theme?: string;
  codePreviewSettings?: CodePreviewSettings;
  messageStreamShowTodos?: boolean;
  messageStreamShowReasoning?: boolean;
  messageStreamFirstReasoningRowId?: number;
  compactForRemoteControl?: boolean;
  logEpoch?: string;
  chatLoadingBlockedByActiveWork?: boolean;
  chatLoadingBlockedByInteraction?: boolean;
  fetchFileChanges?: (
    target: { rowId: number; entityId: string },
    opts: { cachePolicy: "in-flight" | "terminal"; fileChangesState?: string },
  ) => Promise<{ items: FileChangeDetail[] }>;
  previewFileRewind?: (target: { rowId: number; entityId: string }) => Promise<FileRewindPreview>;
  applyFileRewind?: (target: { rowId: number; entityId: string }) => Promise<{ status: "accepted" | "duplicate" | "rejected"; message?: string }>;
  readAttachment?: (request: { sessionId: string; ref: string }) => Promise<{ bytes: Uint8Array; mediaType: string }>;
  onOpenCodeViewer?: OpenCodeViewerFn;
  onOpenFileLink?: (path: string) => void;
  onOpenBrowserUrl?: (url: string) => void;
  onOpenAutomationsMain?: () => void;
  onOpenPlanDetail?: (plan: unknown) => void;
  onNavigateToRow?: (sessionId: string, rowId: number) => void;
}

interface FileChangeDetail {
  path: string;
  additions: number;
  deletions: number;
  patches: unknown[];
}
interface FileRewindPreview {
  canApply: boolean;
  [key: string]: unknown;
}

/* --- 5.1 行锚点与复制（原 y1/lvt，jsx 95440/95447） --- */

/**
 * 行锚点（原 y1，js 111857 / jsx 95440）：所有行渲染的外壳，
 * 挂 data-row-id + testid（查找/定位/选择都按 rowId 锚定）。
 */
function RowAnchor({ rowId, children, className = `` }: { rowId: number; children: React.ReactNode; className?: string }) {
  return (
    <div data-row-id={rowId} data-testid={`v4-conversation-row:${String(rowId)}`} className={cn(className)}>
      {children}
    </div>
  );
}

/**
 * 复制按钮（原 lvt，js 111865 / jsx 95447）：复制成功 1.2s 内显示绿色 ✓。
 * testid `v4-copy-{rowId}`；缺省文案「复制」。
 */
const CopyRowButton = React.memo(function CopyRowButton({
  text,
  rowId,
  label = `复制`,
  tooltip = label,
}: {
  text: string;
  rowId: number;
  label?: string;
  tooltip?: string;
}) {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = React.useCallback(() => {
    if (!text || !navigator.clipboard) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    });
  }, [text]);
  return (
    <button
      type="button"
      aria-label={label}
      title={tooltip}
      data-testid={`v4-copy-${rowId}`}
      disabled={text.length === 0}
      onClick={handleCopy}
      className="inline-flex size-6 items-center justify-center rounded-md text-foreground-subtle transition-colors hover:bg-hover hover:text-foreground disabled:opacity-50"
    >
      {copied ? <IconCheck className="size-3.5 text-success" /> : <IconCopy className="size-3.5" />}
    </button>
  );
});

/* --- 5.2 /goal /compact 命令解析（原 m1/X_t/Z_t/$_t/evt/h1，jsx 95272–95332） --- */

/** 原 Y_t（jsx 95272） */
const GOAL_COMMAND_REGEX = /^\/(?:goal|target)(?:\s|$)/i;

type GoalCommandParse =
  | { kind: "compact"; displayText: string }
  | { kind: "emptyGoal"; displayText: string }
  | { kind: "resumeGoal"; displayText: string }
  | { kind: "unsupportedGoal"; action: "pause" | "clear" | "show"; displayText: string }
  | { kind: "sendGoalCommand"; objective: string; displayText: string };

/**
 * 原 m1（js 111673 / jsx 95273）：解析用户输入里的斜杠命令。
 * /compact|/compress → compact；/goal|/target + resume/pause/clear/show/replace/自由文本。
 * 有附件或上下文附件时不解析（按普通文本走）。
 */
function parseGoalCommand(
  text: string,
  attachments: AttachmentRef[] = [],
  options: { contextAttachmentCount?: number } = {},
): GoalCommandParse | null {
  if (attachments.length > 0 || (options.contextAttachmentCount ?? 0) > 0) return null;
  const trimmed = text.trim();
  if (!trimmed.startsWith(`/`)) return null;
  const match = /^\/([^\s]+)(?:\s+([\s\S]*))?$/.exec(trimmed);
  if (!match) return null;
  const command = match[1]?.toLowerCase() ?? ``;
  const rest = match[2]?.trim() ?? ``;
  if (command === `compact` || command === `compress`) return { kind: `compact`, displayText: trimmed };
  if (command !== `goal` && command !== `target`) return null;
  if (!rest) return { kind: `emptyGoal`, displayText: trimmed };
  const firstWord = rest.split(/\s+/, 1)[0]?.toLowerCase() ?? ``;
  if (firstWord === `resume`) return { kind: `resumeGoal`, displayText: trimmed };
  if (firstWord === `pause` || firstWord === `clear` || firstWord === `show`) {
    return { kind: `unsupportedGoal`, action: firstWord, displayText: trimmed };
  }
  const objective = firstWord === `replace` ? rest.replace(/^replace\s*/i, ``).trim() : rest;
  return objective ? { kind: `sendGoalCommand`, objective, displayText: trimmed } : { kind: `emptyGoal`, displayText: trimmed };
}

/** 原 X_t（jsx 95310）：sendGoalCommand 时确保文本带 /goal 前缀 */
function prefixGoalCommand(kind: GoalCommandParse["kind"], text: string): string {
  if (kind !== `sendGoalCommand`) return text;
  const trimmed = text.trim();
  if (!trimmed) return text;
  return GOAL_COMMAND_REGEX.test(trimmed) ? text : `/goal ${trimmed}`;
}

/** 原 Z_t（jsx 95315） */
const GOAL_PREFIX_REGEX = /^(\s*)(\/(?:goal|target))(?=\s|$)([\s\S]*)$/i;
const EMPTY_ATTACHMENTS: AttachmentRef[] = [];

/** 原 $_t（jsx 95317）：拆分 /goal 前缀（用于富文本高亮渲染） */
function splitGoalCommandPrefix(
  text: string,
  attachments: AttachmentRef[] = EMPTY_ATTACHMENTS,
  contextAttachmentCount = 0,
): { leadingText: string; commandText: string; trailingText: string } | null {
  const parsed = parseGoalCommand(text, attachments, { contextAttachmentCount });
  if (!parsed || parsed.kind === `compact`) return null;
  const match = GOAL_PREFIX_REGEX.exec(text);
  return match
    ? { leadingText: match[1] ?? ``, commandText: match[2] ?? ``, trailingText: match[3] ?? `` }
    : null;
}

/** 原 evt（jsx 95329）：命令标签归一化（去前导 /、小写） */
function normalizeCommandLabel(label: string): string {
  return label.trim().replace(/^\/+/, ``).toLowerCase();
}

/** 原 h1（jsx 95332）：提及芯片类名（按提及类型着色，sV 基类 + cV 类型色） */
declare const MENTION_CHIP_BASE_CLASS: string;
declare function mentionChipColorClass(kind: string): string;
function mentionChipClass(kind: string): string {
  return cn(`mx-0.5 max-w-full`, MENTION_CHIP_BASE_CLASS, `text-ui-base leading-6`, mentionChipColorClass(kind));
}

/* --- 5.3 插件图标上下文（原 K_t/J_t，js 111667/111669 / jsx 95267/95269） --- */

interface PluginIconContextValue {
  sessionId: string;
  iconByPluginId: Map<string, string>;
}
const PluginIconContext = React.createContext<PluginIconContextValue | null>(null);
function usePluginIcons(): PluginIconContextValue | null {
  return React.useContext(PluginIconContext);
}

/* --- 5.4 用户输入富文本（原 rvt/tvt/nvt，js 111783/111712/111769 / jsx 95375/95335/95366） --- */

/** 用户输入解析后的部件（原 ZHe：text/file/directory/skill/session/plugin/subagent/command） */
type UserInputPart =
  | { type: "text"; text: string }
  | { type: "file"; label: string }
  | { type: "directory"; label: string }
  | { type: "skill"; label: string }
  | { type: "session"; label: string }
  | { type: "plugin"; label: string; pluginId?: string }
  | { type: "subagent"; label: string }
  | { type: "command"; label: string };
declare function splitUserInputParts(text: string): UserInputPart[];
declare function isPluginIconUrl(src: string | undefined): boolean;
declare function formatSkillMentionLabel(label: string): string;

/**
 * 提及/命令部件渲染（原 tvt，js 111712 / jsx 95335）。
 * 文件/目录 → FilePath 组件；技能/会话/插件/子代理 → 图标+标签芯片；
 * 命令 → 按 goal/compact/其他 三种图标；权威 /goal 命令挂 data 属性。
 */
function UserInputPartView({
  part,
  authoritativeGoal,
  pluginIcon,
}: {
  part: UserInputPart;
  authoritativeGoal?: boolean;
  pluginIcon?: string;
}) {
  if (part.type === `text`) return null;
  if (part.type === `file` || part.type === `directory`) {
    return (
      <span className={mentionChipClass(`files`)}>
        <FilePath
          path={part.label}
          options={{
            className: `inline-flex min-w-0 max-w-full items-center gap-1 align-middle`,
            iconSize: 16,
            kind: part.type === `directory` ? `directory` : `file`,
            fileNameClassName: `truncate text-ui-base leading-6 font-medium text-current`,
          }}
        />
      </span>
    );
  }
  if (part.type === `skill`) {
    return (
      <span className={mentionChipClass(`skills`)}>
        <IconSparkles aria-hidden="true" className="size-4 shrink-0" />
        {formatSkillMentionLabel(part.label)}
      </span>
    );
  }
  if (part.type === `session`) {
    return (
      <span className={mentionChipClass(`sessions`)}>
        <IconMessageSquare aria-hidden={`true`} className={`size-4 shrink-0`} />
        {part.label}
      </span>
    );
  }
  if (part.type === `plugin`) {
    return (
      <span className={mentionChipClass(`plugins`)} data-plugin-mention-id={part.pluginId}>
        <PluginMentionIcon src={pluginIcon} />
        {part.label}
      </span>
    );
  }
  if (part.type === `subagent`) {
    return (
      <span className={mentionChipClass(`subagents`)}>
        <IconBot aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.5} />
        {part.label}
      </span>
    );
  }
  const command = normalizeCommandLabel(part.label);
  if ((command === `goal` || command === `target`) && !authoritativeGoal) return `/${part.label}`;
  return (
    <span {...(authoritativeGoal ? { "data-v4-user-input-command": `goal` } : {})} className={mentionChipClass(`commands`)}>
      {command === `goal` || command === `target` ? (
        <IconTarget aria-hidden={`true`} className={`size-4 shrink-0`} />
      ) : command === `compact` ? (
        <IconCompact aria-hidden={`true`} className={`size-4 shrink-0`} />
      ) : (
        <IconChevronRight aria-hidden="true" className="size-4 shrink-0" />
      )}
      {part.label}
    </span>
  );
}

/**
 * 插件提及图标（原 nvt，js 111769 / jsx 95366）：远程图标加载失败时回落拼图图标。
 */
function PluginMentionIcon({ src }: { src: string | undefined }) {
  const [failedSrc, setFailedSrc] = React.useState<string | null>(null);
  return isPluginIconUrl(src) && failedSrc !== src ? (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      draggable={false}
      data-plugin-mention-icon="true"
      className="inline-block size-4 shrink-0 rounded-sm object-contain align-middle"
      onError={() => setFailedSrc(src ?? null)}
    />
  ) : (
    <IconMessageSquare aria-hidden={`true`} className={`size-4 shrink-0`} />
  );
}

/**
 * 用户输入富文本（原 rvt，js 111783 / jsx 95375，memo）。
 * 把纯文本按提及/命令拆分成部件渲染；首个 goal/target 命令标记为权威实例。
 */
const UserInputRichText = React.memo(function UserInputRichText({
  text,
  attachments = EMPTY_ATTACHMENTS,
  contextAttachmentCount = 0,
}: {
  text: string;
  attachments?: AttachmentRef[];
  contextAttachmentCount?: number;
}) {
  const pluginIcons = usePluginIcons();
  const goalPrefix = splitGoalCommandPrefix(text, attachments, contextAttachmentCount);
  const parts = splitUserInputParts(text);
  const authoritativeGoalIndex = goalPrefix
    ? parts.findIndex((part) => part.type === `command` && [`goal`, `target`].includes(normalizeCommandLabel(part.label)))
    : -1;
  return (
    <>
      {parts.map((part, index) =>
        part.type === `text` ? (
          part.text
        ) : (
          <UserInputPartView
            key={`${part.type}-${index}`}
            part={part}
            authoritativeGoal={index === authoritativeGoalIndex}
            pluginIcon={part.type === `plugin` && part.pluginId ? pluginIcons?.iconByPluginId.get(part.pluginId) : undefined}
          />
        ),
      )}
    </>
  );
});

/* --- 5.5 用户输入折叠（原 G_t，js 111579 / jsx 95219） --- */

/** 原 U_t（jsx 95213）：超过 120px+1 才可折叠 */
function isUserInputCollapsible(scrollHeight: number): boolean {
  return scrollHeight > 120 + 1;
}
/** 原 W_t（jsx 95216）：折叠时 max-height = 120px，展开时取实际高度（至少 120） */
function userInputMaxHeightStyle(expanded: boolean, measuredHeight: number): string {
  return `${expanded ? Math.max(measuredHeight, 120) : 120}px`;
}

/**
 * 用户输入折叠文本（原 G_t，js 111579 / jsx 95219）。
 * 超高用户输入折叠到 120px + 底部渐隐遮罩 + 圆形展开/收起按钮（悬浮居中）。
 * chat.message.expand / chat.message.collapse
 */
function UserInputCollapsibleText({
  children,
  contentText,
  rowId,
}: {
  children: React.ReactNode;
  contentText: string;
  rowId: number;
}) {
  const { intl } = useIntlContext();
  const measureRef = React.useRef<HTMLDivElement | null>(null);
  const frameRef = React.useRef<number | null>(null);
  const [measuredHeight, setMeasuredHeight] = React.useState(120);
  const [collapsible, setCollapsible] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);
  const toggleLabel = intl.formatMessage({ id: expanded ? `chat.message.collapse` : `chat.message.expand` });
  React.useEffect(() => {
    setExpanded(false);
  }, [contentText, rowId]);
  React.useEffect(() => {
    const el = measureRef.current;
    if (!el) {
      setCollapsible(false);
      return;
    }
    const measure = () => {
      const height = el.scrollHeight;
      setMeasuredHeight((previous) => (previous === height ? previous : height));
      if (!expanded) {
        const canCollapse = isUserInputCollapsible(height);
        setCollapsible((previous) => (previous === canCollapse ? previous : canCollapse));
      }
    };
    const scheduleMeasure = () => {
      if (frameRef.current !== null) return;
      frameRef.current = -1;
      const frame = window.requestAnimationFrame(() => {
        frameRef.current = null;
        measure();
      });
      if (frameRef.current !== null) frameRef.current = frame;
    };
    scheduleMeasure();
    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver < `u`) {
      observer = new ResizeObserver(scheduleMeasure);
      observer.observe(el);
    } else {
      window.addEventListener(`resize`, scheduleMeasure);
    }
    return () => {
      observer?.disconnect();
      window.removeEventListener(`resize`, scheduleMeasure);
      if (frameRef.current !== null && frameRef.current >= 0) window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    };
  }, [contentText, expanded, rowId]);
  return (
    <div data-conversation-selectable="true" className="relative min-w-0 flex-1">
      <div
        ref={measureRef}
        data-v4-user-input-collapsible-content="true"
        style={{ maxHeight: userInputMaxHeightStyle(expanded, measuredHeight) }}
        className={cn(
          `min-w-0 overflow-hidden whitespace-pre-wrap break-words transition-[max-height] duration-300 ease-out motion-reduce:transition-none`,
          !expanded && collapsible
            ? `[mask-image:linear-gradient(to_bottom,black_0%,black_70%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_0%,black_70%,transparent_100%)]`
            : ``,
        )}
      >
        {children}
      </div>
      {collapsible ? (
        <div className={cn(`flex items-center justify-center`, expanded ? `w-full pt-2` : `absolute inset-x-0 bottom-0 mx-auto`)}>
          <Button
            type="button"
            size="sm"
            variant="outline"
            aria-label={toggleLabel}
            aria-expanded={expanded}
            title={toggleLabel}
            onClick={() => setExpanded((previous) => !previous)}
            className="rounded-full bg-background shadow-sm backdrop-blur-sm transition-colors"
          >
            {expanded ? <IconChevronUp aria-hidden="true" className="size-4" /> : <IconChevronDown aria-hidden="true" className="size-4" />}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

/* --- 5.6 附件芯片（原 fvt/dvt，js 111898 / jsx 95476/95473） --- */

/** 原 dvt（jsx 95473）：字节数 → B/KB/MB */
function formatByteSize(bytes: number): string | undefined {
  if (bytes <= 0) return undefined;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** 附件芯片组原语（原 vN/yN/bN/xN/SN/DN，Composer 族 63845 附近；接口保留） */
declare const AttachmentChipGroup: React.FC<
  React.ComponentPropsWithoutRef<"div"> & { variant?: "inline" | "dock"; "data-testid"?: string }
>;
declare const AttachmentChip: React.FC<{
  onRemove?: () => void;
  onOpen?: () => void;
  openLabel?: string;
  title?: string;
  data: { id: string; type: "file"; filename: string; mediaType: string; url: string; description?: string };
  children?: React.ReactNode;
}>;
declare const AttachmentChipIcon: React.FC<{ className?: string }>;
declare const AttachmentChipName: React.FC<{ className?: string }>;
declare const AttachmentChipRemoveButton: React.FC<{ alwaysVisible?: boolean; label: string; "data-testid"?: string }>;
declare const AttachmentPreviewDialog: React.FC<{
  attachment: { filename: string; mediaType?: string; url?: string | null } | null;
  open: boolean;
  loading: boolean;
  error: boolean;
  onOpenChange: (open: boolean) => void;
}>;

/**
 * 附件芯片列表（原 fvt，js 111898 / jsx 95476，memo）。
 * 已发送消息的附件：图片类可点开预览（按 sessionId+ref 拉字节流 → ObjectURL），
 * 预览失败记入失败集合；组件卸载/切换时释放 ObjectURL（竞态用自增令牌防护）。
 * chat.attachments.preview.open / preview.unavailable / remove
 */
const AttachmentChipList = React.memo(function AttachmentChipList({
  attachments,
  onRemove,
  rowId,
  sessionId,
  readAttachment,
}: {
  attachments: AttachmentRef[];
  onRemove?: (index: number) => void;
  rowId: number;
  sessionId?: string;
  readAttachment?: RowRenderContext["readAttachment"];
}) {
  const { intl } = useIntlContext();
  const [preview, setPreview] = React.useState<{ filename: string; mediaType?: string; url?: string | null } | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [errored, setErrored] = React.useState(false);
  const [failedRefs, setFailedRefs] = React.useState<Set<string>>(() => new Set());
  const objectUrlRef = React.useRef<string | null>(null);
  const requestToken = React.useRef(0);
  const openLabel = intl.formatMessage({ id: `chat.attachments.preview.open` });
  const unavailableLabel = intl.formatMessage({ id: `chat.attachments.preview.unavailable` });
  const revokeObjectURL = React.useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);
  React.useEffect(
    () => () => {
      requestToken.current += 1;
      revokeObjectURL();
    },
    [revokeObjectURL],
  );
  const closePreview = React.useCallback(() => {
    requestToken.current += 1;
    revokeObjectURL();
    setPreview(null);
    setLoading(false);
    setErrored(false);
  }, [revokeObjectURL]);
  const openPreview = React.useCallback(
    async (attachment: AttachmentRef) => {
      if (!sessionId || !readAttachment) return;
      const ref = attachment.previewRef ?? attachment.ref;
      const token = requestToken.current + 1;
      requestToken.current = token;
      revokeObjectURL();
      setPreview({ filename: attachment.fileName, mediaType: attachment.mime });
      setLoading(true);
      setErrored(false);
      try {
        const result = await readAttachment({ sessionId, ref });
        if (requestToken.current !== token) return;
        const url = URL.createObjectURL(new Blob([Uint8Array.from(result.bytes)], { type: result.mediaType }));
        if (requestToken.current !== token) {
          URL.revokeObjectURL(url);
          return;
        }
        objectUrlRef.current = url;
        setPreview({ filename: attachment.fileName, mediaType: result.mediaType, url });
      } catch (error) {
        if (requestToken.current !== token) return;
        setFailedRefs((previous) => new Set(previous).add(ref));
        setErrored(true);
        logger.warn(`[v4-attachment-preview] failed to read sent image`, error);
      } finally {
        if (requestToken.current === token) setLoading(false);
      }
    },
    [readAttachment, revokeObjectURL, sessionId],
  );
  if (!attachments || attachments.length === 0) return null;
  return (
    <>
      <AttachmentChipGroup variant={`inline`} data-testid={`v4-attachment-list:${String(rowId)}`} className={`max-w-full gap-2`}>
        {attachments.map((attachment, index) => {
          const ref = attachment.previewRef ?? attachment.ref;
          const isImage = attachment.mime.startsWith(`image/`);
          const failed = failedRefs.has(ref);
          const canPreview = isImage && !failed && !!(sessionId && readAttachment);
          return (
            <AttachmentChip
              key={`${attachment.ref}-${index}`}
              onRemove={onRemove ? () => onRemove(index) : undefined}
              onOpen={canPreview ? () => void openPreview(attachment) : undefined}
              openLabel={canPreview ? openLabel : undefined}
              title={failed ? unavailableLabel : undefined}
              data={{
                id: `${rowId}-${index}`,
                type: `file`,
                filename: attachment.fileName,
                mediaType: attachment.mime,
                url: ``,
                ...(formatByteSize(attachment.bytes) ? { description: formatByteSize(attachment.bytes) } : {}),
              }}
            >
              <AttachmentChipIcon className={`size-6`} />
              <AttachmentChipName className={`max-w-40 text-ui-base`} />
              {onRemove ? (
                <AttachmentChipRemoveButton
                  alwaysVisible={true}
                  label={intl.formatMessage({ id: `chat.attachments.remove` })}
                  data-testid={`v4-attachment-remove:${`${rowId}-${index}`}`}
                />
              ) : null}
            </AttachmentChip>
          );
        })}
      </AttachmentChipGroup>
      <AttachmentPreviewDialog
        attachment={preview}
        open={preview !== null}
        loading={loading}
        error={errored}
        onOpenChange={(open) => {
          if (!open) closePreview();
        }}
      />
    </>
  );
});

/* --- 5.7 用户查询行（原 pvt，js 112010 / jsx 95596，memo） --- */

/** Composer 接口（原 ZV，F08 族 js 66959；行内编辑复用完整 Composer） */
declare const Composer: React.FC<Record<string, unknown>>;
/** 编辑冲突对话框（原 b_t 的 editConflict 变体，见 ConversationOverlays 报告） */
declare const EditConflictDialog: React.FC<{
  variant: "editConflict";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preview: FileRewindPreview | null;
  previewLoading: boolean;
  applying: boolean;
  error: string | null;
  onApply: () => void;
  onConversationOnly: () => void;
}>;

/**
 * 用户查询行（原 pvt，js 112010 / jsx 95596，memo）。
 * 展示态：右对齐气泡（rounded-tr-xs）+ 附件 + 代码评论/网页/pptx/引用芯片 +
 * 悬浮动作（复制/编辑）。编辑态：整块换成 Composer（含「重置会话与文件」回退按钮，
 * 即 spec §6 的轮级 rewind 动作在行内的落点；editDisposition: preserve|rewind，
 * fork 由轮级菜单提供）。chat.edit.resetConversationAndFiles*
 */
const UserQueryRow = React.memo(function UserQueryRow({
  row,
  context,
  onEdit,
  editWorkspaceRewindAvailability,
}: {
  row: UserInputRow;
  context: RowRenderContext;
  onEdit?: (
    target: { rowId: number; entityId?: string | null },
    newText: string,
    attachments: AttachmentRef[],
    workspaceMode: "preserve" | "rewind",
  ) => Promise<false | { result?: { type: string; disposition?: string; preview?: FileRewindPreview } }>;
  editWorkspaceRewindAvailability?: { enabled: boolean; reason: "available" | "noFiles" | "reverted" | "running" | "unavailable" };
}) {
  const { intl } = useIntlContext();
  const [editing, setEditing] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [draftText, setDraftText] = React.useState(row.text);
  const [draftAttachments, setDraftAttachments] = React.useState<AttachmentRef[]>(() => [...(row.attachments ?? [])]);
  const [conflictPreview, setConflictPreview] = React.useState<FileRewindPreview | null>(null);
  const [conflictOpen, setConflictOpen] = React.useState(false);
  const inputApiRef = React.useRef<{ focus: () => void } | null>(null);
  const canSubmit = draftText.trim().length > 0 || draftAttachments.length > 0;
  const submitLabel = intl.formatMessage({ id: `chat.send` });
  const cancelLabel = intl.formatMessage({ id: `common.cancel` });
  const rewindLabel = intl.formatMessage({ id: `chat.edit.resetConversationAndFiles` });
  const rewindTooltip = intl.formatMessage({ id: `chat.edit.resetConversationAndFiles.tooltip` });
  const rewindDisabledReason =
    editWorkspaceRewindAvailability?.reason === `available`
      ? undefined
      : intl.formatMessage({ id: `chat.edit.resetConversationAndFiles.${editWorkspaceRewindAvailability?.reason ?? `noFiles`}` });
  const parsed = React.useMemo(
    () => parseUserInputContext(row.text, { workspacePath: context.workspacePath, workspaceIdentity: context.workspaceIdentity }),
    [context.workspaceIdentity, context.workspacePath, row.text],
  );
  const visibleContent = parsed.visibleContent;
  const openCommentInViewer = useOpenCodeViewerForReference({
    workspacePath: context.workspacePath,
    workspaceIdentity: context.workspaceIdentity,
    workspaceRemoteSessionId: context.workspaceRemoteSessionId,
    onOpenCodeViewer: context.onOpenCodeViewer,
  });
  React.useEffect(() => {
    if (!editing) {
      setDraftText(row.text);
      setDraftAttachments([...(row.attachments ?? [])]);
      return;
    }
    const focus = () => inputApiRef.current?.focus();
    if (typeof requestAnimationFrame == `function`) {
      requestAnimationFrame(focus);
      return;
    }
    focus();
  }, [editing, row.attachments, row.text]);
  React.useEffect(() => {
    if (!onEdit) {
      setEditing(false);
      setSubmitting(false);
    }
  }, [onEdit]);
  const startEdit = React.useCallback(() => {
    setDraftText(row.text);
    setDraftAttachments([...(row.attachments ?? [])]);
    setEditing(true);
  }, [row.attachments, row.text]);
  const cancelEdit = React.useCallback(() => {
    setDraftText(row.text);
    setDraftAttachments([...(row.attachments ?? [])]);
    setEditing(false);
  }, [row.attachments, row.text]);
  const removeDraftAttachment = React.useCallback((index: number) => {
    setDraftAttachments((previous) => previous.filter((_, i) => i !== index));
  }, []);
  const submitEdit = React.useCallback(
    async (text: string, workspaceMode: "preserve" | "rewind" = `preserve`) => {
      if (!onEdit || (!text.trim() && draftAttachments.length === 0)) return;
      setSubmitting(true);
      try {
        const result = await onEdit({ rowId: row.rowId, entityId: row.entityId }, text, draftAttachments, workspaceMode);
        if (typeof result == `object` && result && result.result?.type === `editUserQuery` && result.result.disposition === `blocked` && result.result.preview) {
          setConflictPreview(result.result.preview);
          setConflictOpen(true);
          return;
        }
        if (result !== false) {
          setEditing(false);
          setConflictOpen(false);
        }
      } finally {
        setSubmitting(false);
      }
    },
    [draftAttachments, onEdit, row.entityId, row.rowId],
  );
  const rewindBlocked = submitting || editWorkspaceRewindAvailability?.enabled !== true;
  const rewindButton = (
    <Button
      type="button"
      variant="outline"
      size="icon-md"
      disabled={rewindBlocked}
      data-testid={`v4-edit-rewind:${String(row.rowId)}`}
      aria-label={rewindLabel}
      onClick={() => {
        submitEdit(draftText, `rewind`);
      }}
    >
      <IconRewind className="size-4" />
    </Button>
  );
  return editing ? (
    <RowAnchor rowId={row.rowId} className={`flex flex-col items-end`}>
      <Composer
        workspacePath={context.workspacePath}
        taskId={context.sessionId ?? null}
        initialValue={row.text}
        submitting={submitting}
        submitDisabled={!canSubmit || submitting}
        allowSubmitWhenEmpty={draftAttachments.length > 0}
        submitLabel={submitLabel}
        cancelLabel={cancelLabel}
        showMentionButton={true}
        showSlashButton={true}
        enableWorkspaceFileDrop={true}
        topContent={
          draftAttachments.length > 0 ? (
            <AttachmentChipList
              attachments={draftAttachments}
              rowId={row.rowId}
              onRemove={removeDraftAttachment}
              sessionId={context.sessionId ?? undefined}
              readAttachment={context.readAttachment}
            />
          ) : null
        }
        inputApiRef={inputApiRef}
        inputTestId={`v4-edit-input:${String(row.rowId)}`}
        submitTestId={`v4-edit-submit:${String(row.rowId)}`}
        cancelTestId={`v4-edit-cancel:${String(row.rowId)}`}
        betweenCancelAndSubmitAction={
          <Tooltip title={rewindTooltip} description={rewindDisabledReason}>
            {rewindBlocked ? (
              <span className="inline-flex" data-disabled-tooltip-trigger="true">
                {rewindButton}
              </span>
            ) : (
              rewindButton
            )}
          </Tooltip>
        }
        className="w-full max-w-xl"
        shellClassName="min-h-32"
        onChange={setDraftText}
        onSubmit={(text: string) => {
          submitEdit(text, `preserve`);
        }}
        onCancel={cancelEdit}
      />
      <EditConflictDialog
        variant={`editConflict`}
        open={conflictOpen}
        onOpenChange={setConflictOpen}
        preview={conflictPreview}
        previewLoading={false}
        applying={submitting}
        error={null}
        onApply={() => {}}
        onConversationOnly={() => {
          submitEdit(draftText, `preserve`);
        }}
      />
    </RowAnchor>
  ) : (
    <RowAnchor rowId={row.rowId} className={`group/user-row flex flex-col items-end`}>
      <div className="flex max-w-xl flex-col gap-2 rounded-xl rounded-tr-xs border border-border bg-surface px-4 py-3 text-ui-base text-foreground">
        <AttachmentChipList
          attachments={row.attachments ?? []}
          rowId={row.rowId}
          sessionId={context.sessionId ?? undefined}
          readAttachment={context.readAttachment}
        />
        <div className="flex flex-wrap justify-end gap-2 empty:hidden">
          <CodeCommentChips comments={parsed.codeComments} contentAlign="end" />
          <WebElementChips contexts={parsed.webElements} contentAlign={`end`} />
          <PptxReferenceChips references={parsed.pptxElements} onOpen={context.onOpenCodeViewer ? openCommentInViewer : undefined} />
          <ConversationSelectionChips references={parsed.conversationSelections} />
        </div>
        {visibleContent ? (
          <UserInputCollapsibleText contentText={visibleContent} rowId={row.rowId}>
            <UserInputRichText text={visibleContent} attachments={row.attachments ?? []} contextAttachmentCount={countContextAttachments(parsed)} />
          </UserInputCollapsibleText>
        ) : null}
      </div>
      <div
        className={cn(
          `mt-1 flex items-center gap-1`,
          context.compactForRemoteControl ? `opacity-100` : `opacity-0 transition-opacity group-hover/user-row:opacity-100 focus-within:opacity-100`,
        )}
      >
        <CopyRowButton text={row.text} rowId={row.rowId} />
        {onEdit && row.entityId ? (
          <button
            type="button"
            title="编辑"
            data-testid={`v4-edit-start:${String(row.rowId)}`}
            onClick={startEdit}
            className="inline-flex size-6 items-center justify-center rounded-md text-foreground-subtle transition-colors hover:bg-hover hover:text-foreground"
          >
            <IconPencil className="size-3.5" />
          </button>
        ) : null}
      </div>
    </RowAnchor>
  );
});

/* --- 5.8 assistant 消息动作/消息行（原 mvt/hvt/uvt/cvt，jsx 95726–95895） --- */

/** 原 uvt（jsx 95469）：反馈归一化（like/dislike/null） */
function normalizeRowFeedback(row: AssistantTextRow): RowFeedback {
  const feedback = row.feedback;
  return feedback === `like` || feedback === `dislike` ? feedback : null;
}

/** 原 cvt（jsx 95423）：行时间戳本地化（今天=时刻 / 昨天 / 今年 / 跨年），带缓存 */
declare function formatRowTimestamp(createdAt: number | undefined, locale: string, intl: IntlShape): string | null;

/**
 * assistant 消息动作条（原 mvt，jsx 95726，memo）。
 * 复制 / 赞 / 踩 / fork + 相对时间。chat.message.copy/like/liked/dislike/disliked/fork；
 * 遥测事件 assistant_message_feedback（region=chat）。
 */
const AssistantMessageActions = React.memo(function AssistantMessageActions({
  rowId,
  entityId,
  text,
  createdAt,
  compactForRemoteControl = false,
  feedback = null,
  sessionId,
  onFork,
  onRetry,
  onFeedbackChange,
  className,
}: {
  rowId: number;
  entityId?: string | null;
  text: string;
  createdAt?: number;
  compactForRemoteControl?: boolean;
  feedback?: RowFeedback;
  sessionId?: string | null;
  onFork?: (target: { rowId: number; entityId: string }) => void;
  /** 原 hvt 透传（mvt 本体不解构；重试动作的正式入口在轮级，见 spec §6） */
  onRetry?: (target: { rowId: number; entityId: string }) => void;
  onFeedbackChange?: (target: { rowId: number; entityId: string }, feedback: RowFeedback) => Promise<boolean> | boolean;
  className?: string;
}) {
  const { intl, locale } = useIntlContext();
  const telemetry = useTelemetryPlatform();
  const [current, setCurrent] = React.useState<RowFeedback>(feedback);
  const copyLabel = intl.formatMessage({ id: `chat.message.copy` });
  const likeLabel = intl.formatMessage({ id: current === `like` ? `chat.message.liked` : `chat.message.like` });
  const dislikeLabel = intl.formatMessage({ id: current === `dislike` ? `chat.message.disliked` : `chat.message.dislike` });
  const forkLabel = intl.formatMessage({ id: `chat.message.fork` });
  const timestamp = formatRowTimestamp(createdAt, locale, intl);
  const suppressTooltip = (label: string) => (compactForRemoteControl ? undefined : label);
  React.useEffect(() => {
    setCurrent(feedback);
  }, [feedback]);
  const toggleFeedback = React.useCallback(
    (next: Exclude<RowFeedback, null>) => {
      const previous = current;
      const value = previous === next ? null : next;
      setCurrent(value);
      logger.info(`[ConversationRowView] 用户反馈 assistant 消息`, { messageId: entityId ?? null, reaction: value ?? `none` });
      if (!entityId) return;
      Promise.resolve(onFeedbackChange?.({ rowId, entityId }, value)).then(
        (accepted) => {
          if (accepted === false) setCurrent(previous);
        },
        (error) => {
          setCurrent(previous);
          logger.warn(`[ConversationRowView] 持久化 assistant 反馈失败`, {
            error: error instanceof Error ? error.message : String(error),
            messageId: entityId,
          });
        },
      );
      if (telemetry && entityId) {
        trackEvent(
          telemetry,
          {
            elementName: `assistant_message_feedback`,
            eventRegion: `chat`,
            eventType: `ck`,
            eventExtraDetail: { reaction: value ?? `none` },
            ...(sessionId ? { talkId: sessionId } : {}),
            messageId: entityId,
          },
          `ConversationRowView`,
        );
      }
    },
    [entityId, current, onFeedbackChange, telemetry, rowId, sessionId],
  );
  const handleFork = React.useCallback(() => {
    if (entityId) onFork?.({ rowId, entityId });
  }, [entityId, onFork, rowId]);
  return (
    <div className={cn(`flex items-center gap-1`, className)}>
      <CopyRowButton text={text} rowId={rowId} label={copyLabel} tooltip={suppressTooltip(copyLabel) ?? copyLabel} />
      {entityId && onFeedbackChange ? (
        <>
          <button
            type="button"
            aria-label={likeLabel}
            aria-pressed={current === `like`}
            title={suppressTooltip(likeLabel)}
            data-testid={`v4-feedback-like:${String(rowId)}`}
            className={cn(
              `inline-flex size-6 items-center justify-center rounded-md text-foreground-subtle transition-colors hover:bg-hover hover:text-foreground`,
              current === `like` && `!bg-success/10`,
            )}
            onClick={() => toggleFeedback(`like`)}
          >
            <span className={cn(`relative inline-flex`, current === `like` && `zcode-reaction-burst`)}>
              <IconThumbsUp className="size-3.5" />
            </span>
          </button>
          <button
            type="button"
            aria-label={dislikeLabel}
            aria-pressed={current === `dislike`}
            title={suppressTooltip(dislikeLabel)}
            data-testid={`v4-feedback-dislike:${String(rowId)}`}
            className={cn(
              `inline-flex size-6 items-center justify-center rounded-md text-foreground-subtle transition-colors hover:bg-hover hover:text-foreground`,
              current === `dislike` && `!bg-warning/10`,
            )}
            onClick={() => toggleFeedback(`dislike`)}
          >
            <span className={cn(`relative inline-flex`, current === `dislike` && `zcode-reaction-burst`)}>
              <IconThumbsDown className="size-3.5" />
            </span>
          </button>
        </>
      ) : null}
      {onFork && entityId ? (
        <button
          type="button"
          aria-label={forkLabel}
          title={suppressTooltip(forkLabel)}
          data-testid={`v4-feedback-fork:${String(rowId)}`}
          onClick={handleFork}
          className="inline-flex size-6 items-center justify-center rounded-md text-foreground-subtle transition-colors hover:bg-hover hover:text-foreground"
        >
          <IconFork className="size-3.5" />
        </button>
      ) : null}
      {timestamp ? <span className="select-none text-ui-sm text-foreground-subtlest">{timestamp}</span> : null}
    </div>
  );
});

/** 预览卡组（原 k_t，见 §5.13） */

/**
 * assistant 消息行（原 hvt，js 112357 / jsx 95832，memo）。
 * Markdown 渲染（cj，流式）+ 预览卡 + 完成后悬浮动作条。
 */
const AssistantMessageRow = React.memo(function AssistantMessageRow({
  row,
  context,
  onFork,
  onRetry,
  onFeedbackChange,
  hideActions,
  deferActions,
  copyText,
  previewCards,
}: {
  row: AssistantTextRow;
  context: RowRenderContext;
  onFork?: (target: { rowId: number; entityId: string }) => void;
  onRetry?: (target: { rowId: number; entityId: string }) => void;
  onFeedbackChange?: (target: { rowId: number; entityId: string }, feedback: RowFeedback) => Promise<boolean> | boolean;
  hideActions?: boolean;
  deferActions?: boolean;
  copyText?: string;
  previewCards?: unknown[];
}) {
  const streaming = row.state === `streaming`;
  const cards = previewCards && previewCards.length > 0 ? previewCards : null;
  return (
    <RowAnchor rowId={row.rowId} className={`group/assistant-row`}>
      <div data-conversation-selectable="true" className="w-full text-ui-base">
        <MarkdownRenderer
          streaming={streaming}
          workspacePath={context.workspacePath}
          workspaceIdentity={context.workspaceIdentity}
          workspaceRemoteSessionId={context.workspaceRemoteSessionId}
          theme={context.theme}
          codePreviewSettings={context.codePreviewSettings}
          onOpenCodeViewer={context.onOpenCodeViewer}
          onOpenFileLink={context.onOpenFileLink}
          onOpenExternalUrl={context.onOpenBrowserUrl}
        >
          {row.text}
        </MarkdownRenderer>
      </div>
      {cards ? (
        <div className="mt-3">
          <PreviewCardList
            cards={cards}
            workspacePath={context.workspacePath}
            workspaceIdentity={context.workspaceIdentity}
            workspaceRemoteSessionId={context.workspaceRemoteSessionId}
            onOpenBrowserUrl={context.onOpenBrowserUrl}
            onOpenCodeViewer={context.onOpenCodeViewer}
            onOpenFileLink={context.onOpenFileLink}
            compactForRemoteControl={context.compactForRemoteControl}
          />
        </div>
      ) : null}
      {row.state === `complete` && !hideActions && !deferActions ? (
        <AssistantMessageActions
          rowId={row.rowId}
          entityId={row.entityId}
          text={copyText ?? row.text}
          createdAt={row.createdAt}
          compactForRemoteControl={context.compactForRemoteControl}
          feedback={normalizeRowFeedback(row)}
          sessionId={context.sessionId}
          onFork={onFork}
          onRetry={onRetry}
          onFeedbackChange={onFeedbackChange}
          className={cn(
            `mt-1`,
            context.compactForRemoteControl ? `opacity-100` : `opacity-0 transition-opacity group-hover/assistant-row:opacity-100 focus-within:opacity-100`,
          )}
        />
      ) : null}
    </RowAnchor>
  );
});

/* --- 5.9 思考行 / turnHeader 行 / 时间线标记（原 gvt/_vt/Svt/Cvt，jsx 95895–96043） --- */

/**
 * 思考/摘要折叠行（原 gvt，jsx 95895，memo）。
 * 流式中显示 Reasoning（isStreaming），结束后按 state 作为 autoCollapseKey 自动收起。
 */
const ReasoningRowView = React.memo(function ReasoningRowView({ row }: { row: ReasoningRow }) {
  const streaming = row.state === `streaming`;
  const durationSeconds = row.durationMs === undefined ? undefined : Math.max(1, Math.ceil(row.durationMs / 1e3));
  if (streaming && row.text.length === 0) return null;
  return (
    <RowAnchor rowId={row.rowId}>
      <Reasoning
        className={`w-full`}
        isStreaming={streaming}
        autoCollapseKey={streaming ? null : row.state}
        {...(durationSeconds === undefined ? {} : { duration: durationSeconds })}
      >
        <ReasoningTrigger />
        <div data-conversation-selectable="true">
          <ReasoningContent>{row.text}</ReasoningContent>
        </div>
      </Reasoning>
    </RowAnchor>
  );
});

/**
 * turnHeader 行（原 _vt，jsx 95917，memo）。
 * 时间线上的轮分隔行：`turn · {origin} · {state}`（kinds: userInput /
 * backgroundResult / goalContinuation / editRerun —— spec §6）。
 * 轮级动作（重试/编辑/回退文件/fork）不在这一行渲染，而由 TurnSection 的
 * 行内动作与文件变更卡承载（见 §5.11/§5.12）。
 */
const TurnHeaderRow = React.memo(function TurnHeaderRow({ row }: { row: TurnHeaderRowModel }) {
  return (
    <RowAnchor rowId={row.rowId} className={`border-b border-[var(--color-border)] py-1 text-ui-sm text-[var(--color-foreground-subtle)]`}>
      {`turn · `}
      {row.origin}
      {` · `}
      {row.state}
    </RowAnchor>
  );
});

/** 时间线标记图标（原 vvt/yvt/bvt/xvt，jsx 95923–95938） */
const COMPACT_MARKER_ICON = <IconCompact aria-hidden={`true`} className={`size-3.5 shrink-0 text-[var(--color-foreground-subtle)]`} />;
const FORK_MARKER_ICON = <IconGitBranch aria-hidden={`true`} className={`size-3.5 shrink-0 text-[var(--color-foreground-subtle)]`} />;
const GOAL_MARKER_ICON = <IconTarget aria-hidden={`true`} className={`size-3.5 shrink-0 text-[var(--color-foreground-subtle)]`} />;
const MODEL_CHANGE_MARKER_ICON = <IconModelChange aria-hidden={`true`} className={`size-3.5 shrink-0 text-[var(--color-foreground-subtle)]`} />;

/**
 * 时间线标记（原 Svt，jsx 95923）：居中短文案 + 左右渐隐横线；
 * 运行中文案带渐变动画；可点击（如 forkNotice 跳父会话）。
 */
function TimelineMarker({
  rowId,
  markerType,
  markerStatus,
  markerOrigin,
  markerSourceCommandId,
  icon,
  label,
  running = false,
  onClick,
}: {
  rowId: number;
  markerType: string;
  markerStatus: string;
  markerOrigin?: string;
  markerSourceCommandId?: string;
  icon: React.ReactNode;
  label: React.ReactNode;
  running?: boolean;
  onClick?: () => void;
}) {
  const clickable = !!onClick;
  const baseClass = `flex w-full items-center gap-3 px-4 py-2 text-ui-base text-[var(--color-foreground-subtle)]`;
  const inner = (
    <>
      <div aria-hidden="true" className="h-px min-w-8 flex-1 bg-border/50" />
      <span className="inline-flex min-w-0 shrink items-center justify-center gap-1.5 text-center leading-5">
        {running ? null : icon}
        <span className={`min-w-0 break-words${running ? ` animated-gradient-text font-medium` : ``}${clickable ? ` underline-offset-4 group-hover/marker:underline` : ``}`}>
          {label}
        </span>
      </span>
      <div aria-hidden="true" className="h-px min-w-8 flex-1 bg-border/50" />
    </>
  );
  return clickable ? (
    <button
      type="button"
      data-row-id={rowId}
      data-row-kind="timelineMarker"
      data-marker-type={markerType}
      data-status={markerStatus}
      data-origin={markerOrigin}
      data-source-command-id={markerSourceCommandId}
      data-testid={`v4-conversation-row:${String(rowId)}`}
      onClick={onClick}
      className={`group/marker ${baseClass} text-left transition-colors hover:text-[var(--color-foreground)]`}
    >
      {inner}
    </button>
  ) : (
    <div
      data-row-id={rowId}
      data-row-kind="timelineMarker"
      data-marker-type={markerType}
      data-status={markerStatus}
      data-origin={markerOrigin}
      data-source-command-id={markerSourceCommandId}
      data-testid={`v4-conversation-row:${String(rowId)}`}
      className={baseClass}
    >
      {inner}
    </div>
  );
}

/** 模型注册表查询（原 hM/fM：全局模型列表快照） */
declare function useModelRegistrySnapshot(): { id: string; name: string }[];
/** 原 rN：provider+model → 展示名 */
declare function formatModelDisplayName(provider: string | undefined, providerName: string | undefined, model: string): string;

/**
 * 时间线标记视图（原 Cvt，js 112528 / jsx 95939，memo）。
 * 四种标记：compact（上下文压缩 6 态文案）/ forkNotice（可点击回父会话）/
 * modelChange（模型切换/初始模型）/ goalVerify（目标校验迭代）。
 * chat.contextCompaction.* / chat.message.fork.derivedFrom / chat.modelChange.* /
 * chat.goalVerification.* / chat.summaryPanel.goalIterationValue
 */
const TimelineMarkerView = React.memo(function TimelineMarkerView({
  row,
  context,
}: {
  row: TimelineMarkerRow;
  context: RowRenderContext;
}) {
  const { intl } = useIntlContext();
  const marker = row.marker;
  const modelRegistry = useModelRegistrySnapshot();
  const resolved = React.useMemo(() => {
    switch (marker.type) {
      case `compact`: {
        const running = marker.status === `running`;
        const messageKey =
          marker.status === `running`
            ? `chat.contextCompaction.started`
            : marker.status === `noop`
              ? `chat.contextCompaction.skipped`
              : marker.status === `cancelled`
                ? `chat.contextCompaction.interrupted`
                : marker.status === `failed`
                  ? `chat.contextCompaction.failed`
                  : marker.origin === `auto`
                    ? `chat.contextCompaction.completedAuto`
                    : `chat.contextCompaction.completed`;
        return { icon: COMPACT_MARKER_ICON, label: intl.formatMessage({ id: messageKey }), running };
      }
      case `forkNotice`:
        return { icon: FORK_MARKER_ICON, label: intl.formatMessage({ id: `chat.message.fork.derivedFrom` }), running: false };
      case `modelChange`: {
        const fromName = modelRegistry.find((entry) => entry.id === marker.fromProvider)?.name ?? marker.fromProvider;
        const toName = modelRegistry.find((entry) => entry.id === marker.toProvider)?.name ?? marker.toProvider;
        const toDisplay = formatModelDisplayName(marker.toProvider, toName, marker.toModel);
        return marker.fromProvider === undefined || marker.fromModel === undefined
          ? {
              icon: null,
              label: intl.formatMessage({ id: `chat.modelChange.using` }, { model: toDisplay }),
              running: false,
            }
          : {
              icon: MODEL_CHANGE_MARKER_ICON,
              label: intl.formatMessage(
                { id: `chat.modelChange.switched` },
                { from: formatModelDisplayName(marker.fromProvider, fromName, marker.fromModel), to: toDisplay },
              ),
              running: false,
            };
      }
      case `goalVerify`: {
        const running = marker.outcome === `running`;
        const outcomeKey =
          marker.outcome === `running`
            ? `chat.goalVerification.checking`
            : marker.outcome === `pass`
              ? `chat.goalVerification.complete`
              : `chat.goalVerification.incomplete`;
        return {
          icon: GOAL_MARKER_ICON,
          running,
          label: (
            <>
              <span>{intl.formatMessage({ id: `chat.summaryPanel.goalIterationValue` }, { count: String(marker.iteration) })}</span>
              <span aria-hidden="true">{` · `}</span>
              {intl.formatMessage({ id: outcomeKey })}
            </>
          ),
        };
      }
      default:
        return null;
    }
  }, [intl, marker, modelRegistry]);
  const navigateToRow = context.onNavigateToRow;
  const handleClick = React.useMemo(() => {
    if (marker.type !== `forkNotice` || !navigateToRow) return undefined;
    return () => navigateToRow(marker.parentSessionId, marker.parentRowId);
  }, [marker, navigateToRow]);
  return resolved ? (
    <TimelineMarker
      rowId={row.rowId}
      markerType={marker.type}
      markerStatus={marker.type === `compact` ? marker.status : marker.type === `goalVerify` ? marker.outcome : marker.type === `forkNotice` ? `created` : `applied`}
      markerOrigin={marker.type === `compact` ? marker.origin : undefined}
      markerSourceCommandId={row.sourceCommandId}
      icon={resolved.icon}
      label={resolved.label}
      running={resolved.running}
      onClick={handleClick}
    />
  ) : null;
});

/* --- 5.10 工具行 / 子代理行 / 行渲染器（原 wvt/u1/Tvt/Evt/Dvt/b1，jsx 96025–96114） --- */

/**
 * 原 u1（js 110158 / jsx 94198）：把行模型规范化为 ToolCallNode
 *（toolCall + childToolCalls 树；子工具调用按 parentToolUseId 归组）。
 */
declare function normalizeToolCallNode(row: ToolCallRowModel): ToolCallNode;

/**
 * 工具行（原 wvt，jsx 96025，memo）：ToolCallBlock 的行包装。
 * showTodoToolCalls=false 时 todo 家族整行隐藏（在行渲染器里预判）。
 */
const ToolCallRowView = React.memo(function ToolCallRowView({
  row,
  context,
}: {
  row: ToolCallRowModel;
  context: RowRenderContext;
}) {
  const node = React.useMemo(() => normalizeToolCallNode(row), [row]);
  return (
    <RowAnchor rowId={row.rowId} className={`py-0`}>
      <div data-conversation-selectable="true">
        <ToolCallBlock
          toolCallNode={node}
          workspacePath={context.workspacePath}
          theme={context.theme}
          codePreviewSettings={context.codePreviewSettings}
          showTodoToolCalls={context.messageStreamShowTodos === true}
          onOpenCodeViewer={context.onOpenCodeViewer}
          onOpenFileLink={context.onOpenFileLink}
          onOpenBrowserUrl={context.onOpenBrowserUrl}
          onOpenAutomationsMain={context.onOpenAutomationsMain}
          onOpenPlanDetail={
            context.onOpenPlanDetail && context.sessionId
              ? (plan) => context.onOpenPlanDetail?.({ ...(plan as object), parentSessionId: context.sessionId })
              : undefined
          }
        />
      </div>
    </RowAnchor>
  );
});

/** 子代理行（原 Tvt，jsx 96090，memo）：`类型 · 状态 — 摘要` 单行 */
const SubagentRowView = React.memo(function SubagentRowView({ row }: { row: SubagentRowModel }) {
  const content = (
    <>
      {row.subagentType}
      {` · `}
      {row.status}
      {row.summaryText ? ` — ${row.summaryText}` : ``}
    </>
  );
  return (
    <RowAnchor rowId={row.rowId}>
      <div className="text-ui-sm text-[var(--color-foreground-subtle)]">{content}</div>
    </RowAnchor>
  );
});

/** 原 n_t（jsx 94166）：思考行是否可见（showReasoning 或首条思考行豁免） */
declare function isReasoningRowVisible(rowId: number, context: RowRenderContext): boolean;
/** 原 og 的调用面：判断 todo 家族 */
declare function isTodoToolByName(toolName: string | undefined): boolean;

interface RowRendererProps {
  row: ConversationRow;
  context: RowRenderContext;
  onFork?: (target: { rowId: number; entityId: string }) => void;
  onRetry?: (target: { rowId: number; entityId: string }) => void;
  onFeedbackChange?: (target: { rowId: number; entityId: string }, feedback: RowFeedback) => Promise<boolean> | boolean;
  onEdit?: (
    target: { rowId: number; entityId?: string | null },
    newText: string,
    attachments: AttachmentRef[],
    workspaceMode: "preserve" | "rewind",
  ) => Promise<false | { result?: { type: string; disposition?: string; preview?: FileRewindPreview } }>;
  editWorkspaceRewindAvailability?: { enabled: boolean; reason: "available" | "noFiles" | "reverted" | "running" | "unavailable" };
  hideAssistantActions?: boolean;
  deferAssistantActions?: boolean;
  assistantCopyText?: string;
  assistantPreviewCards?: unknown[];
}

/**
 * 行渲染器（原 Evt，js 112666 / jsx 96043；memo 名 Dvt / 包装 b1）。
 * 按行种类分派：userInput / assistantText / reasoning / turnHeader /
 * timelineMarker / toolCall / subagent。
 */
function RowRenderer({
  row,
  context,
  onFork,
  onRetry,
  onFeedbackChange,
  onEdit,
  editWorkspaceRewindAvailability,
  hideAssistantActions,
  deferAssistantActions,
  assistantCopyText,
  assistantPreviewCards,
}: RowRendererProps) {
  switch (row.kind) {
    case `userInput`:
      return <UserQueryRow row={row} context={context} onEdit={onEdit} editWorkspaceRewindAvailability={editWorkspaceRewindAvailability} />;
    case `assistantText`:
      return (
        <AssistantMessageRow
          row={row}
          context={context}
          onFork={onFork}
          onRetry={onRetry}
          onFeedbackChange={onFeedbackChange}
          hideActions={hideAssistantActions}
          deferActions={deferAssistantActions}
          copyText={assistantCopyText}
          previewCards={assistantPreviewCards}
        />
      );
    case `reasoning`:
      return isReasoningRowVisible(row.rowId, context) ? <ReasoningRowView row={row} /> : null;
    case `turnHeader`:
      return <TurnHeaderRow row={row} />;
    case `timelineMarker`:
      return <TimelineMarkerView row={row} context={context} />;
    case `toolCall`:
      return context.messageStreamShowTodos !== true && isTodoToolByName(row.toolName) ? null : <ToolCallRowView row={row} context={context} />;
    case `subagent`:
      return <SubagentRowView row={row} />;
    default:
      return null;
  }
}
const MemoRowRenderer = React.memo(RowRenderer);
/** 原 b1（js 112712 / jsx 96099）：行渲染直通包装 */
function RenderedRow(props: RowRendererProps) {
  return <MemoRowRenderer {...props} />;
}

/* --- 5.11 复制文本/重试槽/段列表（原 Ovt/kvt/x1/S1/Avt/jvt/C1/m_t/g_t） --- */

/**
 * 原 Ovt（jsx 96114）：assistant 复制文本 = 全部 assistant 文本 +
 * ExitPlanMode 计划结果的 markdown（去重合并）。
 */
function buildAssistantCopyText(unit: TurnRenderUnit): string | undefined {
  if (!unit.latestAssistantTextRow) return undefined;
  const texts =
    unit.assistantTextRows.length > 0 ? unit.assistantTextRows.map((row) => row.text) : [unit.latestAssistantTextRow.text];
  const seen = new Set(texts);
  for (const workRow of unit.assistantWorkRows) {
    if (workRow.kind !== `toolCall` || workRow.toolName !== `ExitPlanMode`) continue;
    const markdown = buildPlanResultMarkdown(normalizeToolCallNode(workRow).toolCall, ``).markdown;
    if (!markdown || seen.has(markdown)) continue;
    texts.push(markdown);
    seen.add(markdown);
  }
  return texts.join(`\n\n`);
}

/** 原 kvt（jsx 96127）：apiRetry 快照 → 重试视图模型 */
function toApiRetryViewModel(snapshot: { attempt: number; maxAttempts: number; reasonCode?: string }) {
  const attempt = Math.max(1, Math.floor(snapshot.attempt));
  return {
    kind: `api_retry` as const,
    attempt,
    maxRetries: Math.max(Math.floor(snapshot.maxAttempts) - 1, attempt),
    retryDelayMs: 0,
    errorStatus: null,
    error: snapshot.reasonCode,
  };
}

/** API 重试视图（原 I3e，F12/横切；接口保留）与加载骨架（原 Llt） */
declare const ApiRetryView: React.FC<{ apiRetry: ReturnType<typeof toApiRetryViewModel>; intl: IntlShape; locale: string }>;
declare const LoadingSkeleton: React.FC<{ loading?: boolean; "data-testid"?: string; size?: "sm" | "md" }>;

/**
 * API 重试/加载槽（原 x1，jsx 96138）。
 * 有重试 → 重试进度；否则（资格满足时）显示骨架屏；占位最小高度 20px。
 */
function ApiRetryLoadingSlot({ apiRetry, eligible }: { apiRetry: { attempt: number; maxAttempts: number; reasonCode?: string } | null; eligible: boolean }) {
  const { intl, locale } = useIntlContext();
  const model = React.useMemo(() => (apiRetry ? toApiRetryViewModel(apiRetry) : null), [apiRetry]);
  if (!model && !eligible) return null;
  return (
    <div data-zcode-chat-loading-slot="true" className="min-h-5">
      {model ? <ApiRetryView apiRetry={model} intl={intl} locale={locale} /> : <LoadingSkeleton loading={true} data-testid="v4-chat-loading" size="sm" />}
    </div>
  );
}

/** 原 S1（jsx 96149）：时长单位拼接（中文后补空格） */
function joinDurationUnit(value: number, messageId: string, formatMessage: IntlShape["formatMessage"], locale: string): string {
  const unit = formatMessage({ id: messageId });
  return `${value}${locale === `zh-CN` ? ` ` : ``}${unit}`;
}

/**
 * 原 Avt（jsx 96155）：工作时长格式化（取前两位单位：天/时/分/秒）。
 * chat.history.duration.day/hour/minute/second
 */
function formatWorkDuration(durationMs: number | undefined, formatMessage: IntlShape["formatMessage"], locale: string): string | null {
  if (durationMs === undefined) return null;
  const totalSeconds = Math.max(1, Math.round(durationMs / 1e3));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts: string[] = [];
  if (days > 0) parts.push(joinDurationUnit(days, `chat.history.duration.day`, formatMessage, locale));
  if (hours > 0) parts.push(joinDurationUnit(hours, `chat.history.duration.hour`, formatMessage, locale));
  if (minutes > 0) parts.push(joinDurationUnit(minutes, `chat.history.duration.minute`, formatMessage, locale));
  if (seconds > 0 || parts.length === 0) parts.push(joinDurationUnit(seconds, `chat.history.duration.second`, formatMessage, locale));
  return parts.slice(0, 2).join(` `);
}

/** 子代理组内的工具行（原 jvt，jsx 96165） */
function AgentToolCallRow({ item, context }: { item: { rowId: number; node: ToolCallNode }; context: RowRenderContext }) {
  return (
    <div data-row-id={item.rowId} data-conversation-selectable="true" data-testid={`v4-conversation-row:${String(item.rowId)}`}>
      <ToolCallBlock
        toolCallNode={item.node}
        workspacePath={context.workspacePath}
        theme={context.theme}
        codePreviewSettings={context.codePreviewSettings}
        showTodoToolCalls={context.messageStreamShowTodos === true}
        onOpenCodeViewer={context.onOpenCodeViewer}
        onOpenFileLink={context.onOpenFileLink}
        onOpenBrowserUrl={context.onOpenBrowserUrl}
        onOpenAutomationsMain={context.onOpenAutomationsMain}
      />
    </div>
  );
}

/** 段条目（原 m_t 的产物，js 110278 / jsx 94334） */
type RenderSegmentItem =
  | { kind: "row"; key: string; row: ConversationRow }
  | { kind: "agentToolCall"; key: string; rowId: number; node: ToolCallNode }
  | { kind: "toolCallGroup"; key: string; rowId: number; node: ToolCallNode };
declare function buildRenderSegments(
  rows: ConversationRow[],
  opts: { messageStreamShowReasoning: boolean; messageStreamFirstReasoningRowId?: number },
): RenderSegmentItem[];
/** 子代理分组行（原 g_t，js 110333 / jsx 94403；接口保留） */
declare const SubagentGroupRow: React.FC<{ item: RenderSegmentItem & { kind: "agentToolCall" }; context: RowRenderContext }>;

/**
 * 行段列表（原 C1，jsx 96171）：把一组行按 行/子代理组/工具组 分段渲染，
 * 段间垂直间距 16px。
 */
function RowSegmentList({ rows, context }: { rows: ConversationRow[]; context: RowRenderContext }) {
  const showReasoning = context.messageStreamShowReasoning === true;
  const firstReasoningRowId = context.messageStreamFirstReasoningRowId;
  return (
    <div className="flex flex-col gap-4">
      {React.useMemo(
        () =>
          buildRenderSegments(rows, {
            messageStreamShowReasoning: showReasoning,
            ...(firstReasoningRowId === undefined ? {} : { messageStreamFirstReasoningRowId: firstReasoningRowId }),
          }),
        [firstReasoningRowId, rows, showReasoning],
      ).map((item) =>
        item.kind === `row` ? (
          <RenderedRow key={item.key} row={item.row} context={context} hideAssistantActions={item.row.kind === `assistantText`} />
        ) : item.kind === `agentToolCall` ? (
          <SubagentGroupRow key={item.key} item={item} context={context} />
        ) : (
          <AgentToolCallRow key={item.key} item={item} context={context} />
        ),
      )}
    </div>
  );
}

/* --- 5.12 自动化卡（原 Mvt/Nvt/Pvt/Fvt/fgt，jsx 93676–96238） --- */

interface AutomationCardModel {
  rowId: number;
  toolCallId: string;
  automation: { automationId: string; [key: string]: unknown };
}
/** 原 Mvt（jsx 96194）：从成功工具调用里收集自动化卡（CronDelete 会移除对应卡） */
/** 原 fgt（jsx 93676）：单张自动化卡（automations.card.*） */

/** 自动化卡列表（原 Fvt，jsx 96229） */
function AutomationCardList({ cards, context }: { cards: AutomationCardModel[]; context: RowRenderContext }) {
  if (cards.length === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      {cards.map((card) => (
        <AutomationCard key={`${card.rowId}:${card.toolCallId}`} automation={card.automation} onOpenAutomationsMain={context.onOpenAutomationsMain} />
      ))}
    </div>
  );
}

/* --- 5.13 预览卡（原 O_t/k_t/A_t，js 111161–111233 / jsx 94833–95007） --- */

interface PreviewCard {
  id: string;
  type: "website" | "file" | string;
  kind?: string;
  title: string;
  subtitleId: string;
  url?: string;
  path?: string;
  filePath?: string;
}
declare function previewCardSignature(cards: PreviewCard[]): string; // C_t（jsx 94833）
declare function pickWebsiteCards(cards: PreviewCard[]): PreviewCard[] | null; // w_t（jsx 94836）
declare function settleVisibleCards(cards: PreviewCard[], fileService: unknown): Promise<PreviewCard[]>; // T_t（jsx 94839 附近）
declare function isLocalWebsiteCard(card: PreviewCard, scope: object): boolean; // D_t（jsx 94870）
declare function useFileService(scope: {
  workspacePath?: string;
  workspaceIdentity?: string | null;
  workspaceRemoteSessionId?: string | null;
}): { checkFilesExist(request: { paths: string[] }): Promise<{ path: string; exists: boolean }[]> };

/**
 * 可见预览卡钩子（原 O_t，js 111161 / jsx 94877）：
 * 网站卡直出（≤10 张）；混合卡需文件存在性校验（≤15 候选 → ≤10 可见），
 * 按签名缓存避免重复请求。
 */
function useVisiblePreviewCards(
  cards: PreviewCard[],
  scope: { workspacePath?: string; workspaceIdentity?: string | null; workspaceRemoteSessionId?: string | null },
): { visibleCards: PreviewCard[]; settled: boolean } {
  const fileService = useFileService(scope);
  const signature = React.useMemo(() => previewCardSignature(cards), [cards]);
  const latest = React.useRef({ cards, signature });
  if (latest.current.signature !== signature) latest.current = { cards, signature };
  const stableCards = latest.current.cards;
  const websiteCards = React.useMemo(() => pickWebsiteCards(stableCards), [stableCards]);
  const [settledState, setSettledState] = React.useState<{ fileService: unknown; signature: string; visibleCards: PreviewCard[] }>(() => ({
    fileService: null,
    signature: ``,
    visibleCards: [],
  }));
  React.useEffect(() => {
    if (websiteCards) return;
    let cancelled = false;
    settleVisibleCards(stableCards, fileService).then(
      (visible) => {
        if (!cancelled) setSettledState({ fileService, signature, visibleCards: visible });
      },
      () => {
        if (!cancelled) setSettledState({ fileService, signature, visibleCards: [] });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [signature, fileService, websiteCards, stableCards]);
  if (websiteCards) return { visibleCards: websiteCards, settled: true };
  const matched = settledState.fileService === fileService && settledState.signature === signature;
  return { visibleCards: matched ? settledState.visibleCards : [], settled: matched };
}

/** 单张预览卡（原 A_t，js 111233 / jsx 94950；接口保留：入场动画延迟 36ms×序，封顶 240ms） */
declare const PreviewCardItem: React.FC<{
  card: PreviewCard;
  animationDelayMs: number;
  subtitle: string;
  workspacePath?: string;
  workspaceIdentity?: string | null;
  workspaceRemoteSessionId?: string | null;
  onOpenBrowserUrl?: (url: string) => void;
  onOpenFileLink?: (path: string) => void;
  onOpenCodeViewer?: OpenCodeViewerFn;
  compactForRemoteControl?: boolean;
}>;

/**
 * 预览卡列表（原 k_t，js 111193 / jsx 94925）：assistant 消息后的
 * 图片/文档/网页预览卡组（聊天预览卡，spec 未列但为 §6 markdown 富文本的延伸）。
 */
function PreviewCardListImpl({
  cards,
  workspacePath,
  workspaceIdentity,
  workspaceRemoteSessionId,
  onOpenBrowserUrl,
  onOpenFileLink,
  onOpenCodeViewer,
  compactForRemoteControl,
}: {
  cards: PreviewCard[];
  workspacePath?: string;
  workspaceIdentity?: string | null;
  workspaceRemoteSessionId?: string | null;
  onOpenBrowserUrl?: (url: string) => void;
  onOpenFileLink?: (path: string) => void;
  onOpenCodeViewer?: OpenCodeViewerFn;
  compactForRemoteControl?: boolean;
}) {
  const { intl } = useIntlContext();
  const { visibleCards, settled } = useVisiblePreviewCards(cards, { workspacePath, workspaceIdentity, workspaceRemoteSessionId });
  if (!settled || visibleCards.length === 0) return null;
  return (
    <div className="flex w-full flex-col gap-3">
      {visibleCards.map((card, index) => (
        <PreviewCardItem
          key={card.id}
          card={card}
          animationDelayMs={Math.min(index * 36, 240)}
          subtitle={intl.formatMessage({ id: card.subtitleId })}
          workspacePath={workspacePath}
          workspaceIdentity={workspaceIdentity}
          workspaceRemoteSessionId={workspaceRemoteSessionId}
          onOpenBrowserUrl={onOpenBrowserUrl}
          onOpenFileLink={onOpenFileLink}
          onOpenCodeViewer={onOpenCodeViewer}
          compactForRemoteControl={compactForRemoteControl}
        />
      ))}
    </div>
  );
}

/* --- 5.14 轮文件变更摘要 + 回退（原 S_t/b_t/v_t/__t/p1，jsx 94426–94833） --- */

/** 原 __t（jsx 94426）：构建文件预览源（代码查看器入参） */
/** 原 yg：工作区相对路径 */
declare function toWorkspaceRelativePath(workspacePath: string | undefined, path: string): string;
/** 原 p1（jsx 94657）：在代码查看器中打开文件变更 */
declare function openFileChangeInViewer(item: FileChangeDetail, context: RowRenderContext): void;
/** 文件「打开方式」菜单（原 v_t，js 110379 / jsx 94447；接口保留） */

/**
 * 文件回退对话框（原 b_t，js 110632 / jsx 94590；接口保留）。
 * 两种变体：默认（回退预览 + 应用）与 editConflict（编辑冲突：仅会话/会话+文件）。
 * chat.changeSummary.rewindDialog.*
 */

/**
 * 轮文件变更摘要（原 S_t，js 110813 / jsx 94679）。
 * 折叠卡：`N 个文件已更改 +A -D` + 已回退徽章 + 「回退」按钮；
 * 展开后按文件列 +A/-D、审查（打开代码查看）、打开方式菜单。
 * chat.changeSummary.filesChanged.one/other、collapse/expand、reverted、
 * rewind、review、diffUnavailable、rewindDialog.*
 */
function TurnFileChangesSummary({ header, context }: { header: TurnHeaderRowModel; context: RowRenderContext }) {
  const { intl } = useIntlContext();
  const fileChanges = header.fileChanges;
  const [open, setOpen] = React.useState(false);
  const [details, setDetails] = React.useState<{ items: FileChangeDetail[] } | null>(null);
  const [loadingDetails, setLoadingDetails] = React.useState(false);
  const [rewindOpen, setRewindOpen] = React.useState(false);
  const [rewindPreview, setRewindPreview] = React.useState<FileRewindPreview | null>(null);
  const [rewindLoading, setRewindLoading] = React.useState(false);
  const [rewindApplying, setRewindApplying] = React.useState(false);
  const [rewindError, setRewindError] = React.useState<string | null>(null);
  const filesLabel = intl.formatMessage(
    { id: fileChanges?.files === 1 ? `chat.changeSummary.filesChanged.one` : `chat.changeSummary.filesChanged.other` },
    { count: String(fileChanges?.files ?? 0) },
  );
  const reverted = fileChanges?.state === `reverted`;
  const canRewind = !!(context.applyFileRewind && context.previewFileRewind) && header.actions?.canRewindFiles === true && !reverted;
  const items = details?.items ?? [];
  const target = React.useMemo(() => (header.entityId ? { rowId: header.rowId, entityId: header.entityId } : null), [header.entityId, header.rowId]);
  const cachePolicy = header.state === `running` ? `in-flight` : `terminal`;
  const fileChangesState = fileChanges?.state;
  React.useEffect(() => {
    if (!open || !context.fetchFileChanges || !target) return;
    let cancelled = false;
    setDetails(null);
    setLoadingDetails(true);
    context.fetchFileChanges(target, { cachePolicy, fileChangesState }).then(
      (result) => {
        if (!cancelled) {
          setDetails(result);
          setLoadingDetails(false);
        }
      },
      (error) => {
        if (!cancelled) {
          logger.warn(`[ConversationFileSummaryPanel] 读取文件变更详情失败`, {
            error: error instanceof Error ? error.message : String(error),
            rowId: target.rowId,
          });
          setLoadingDetails(false);
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [cachePolicy, context.fetchFileChanges, fileChangesState, open, target]);
  const previewRewind = React.useCallback(async () => {
    if (!context.previewFileRewind || !target) return;
    setRewindOpen(true);
    setRewindLoading(true);
    setRewindError(null);
    try {
      setRewindPreview(await context.previewFileRewind(target));
    } catch {
      setRewindError(intl.formatMessage({ id: `chat.changeSummary.rewindDialog.error` }));
    } finally {
      setRewindLoading(false);
    }
  }, [context, intl, target]);
  const applyRewind = React.useCallback(async () => {
    if (!context.applyFileRewind || !rewindPreview?.canApply || !target) return;
    setRewindApplying(true);
    setRewindError(null);
    try {
      const result = await context.applyFileRewind(target);
      if (result.status === `accepted` || result.status === `duplicate`) {
        setRewindOpen(false);
      } else {
        setRewindError(result.message ?? intl.formatMessage({ id: `chat.changeSummary.rewindDialog.error` }));
      }
    } catch {
      setRewindError(intl.formatMessage({ id: `chat.changeSummary.rewindDialog.error` }));
    } finally {
      setRewindApplying(false);
    }
  }, [context, rewindPreview?.canApply, target, intl]);
  React.useEffect(() => {
    if (!details || !fileChanges || fileChanges.files <= 0 || details.items.length > 0) return;
    logger.warn(`[ConversationFileSummaryPanel] 文件摘要详情为空`, {
      expectedFiles: fileChanges.files,
      rowId: header.rowId,
      turnId: header.turnId,
    });
  }, [details, header.rowId, header.turnId, fileChanges]);
  if (!fileChanges || fileChanges.files <= 0) return null;
  return (
    <>
      <Collapsible open={open} onOpenChange={setOpen} className={`overflow-hidden rounded-xl border border-border bg-card shadow-none`}>
        <div className="flex h-10 items-center justify-between gap-3 px-2 transition-colors hover:bg-hover">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="flex h-full min-w-0 flex-1 items-center gap-2 px-1 text-left text-ui-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused"
              aria-label={intl.formatMessage({ id: open ? `chat.changeSummary.collapse` : `chat.changeSummary.expand` })}
            >
              <IconChevronRight
                aria-hidden={true}
                className={cn(`size-3.5 shrink-0 text-foreground-subtlest transition-transform`, open ? `rotate-90` : `rotate-0`)}
              />
              <span className="min-w-0 truncate font-medium">{filesLabel}</span>
              <span className="shrink-0 tabular-nums">
                <span className="text-diff-added">{`+`}{fileChanges.additions}</span>
                {` `}
                <span className="text-diff-removed">{`-`}{fileChanges.deletions}</span>
              </span>
              {reverted ? (
                <span className="shrink-0 rounded-sm bg-input px-1.5 py-0.5 text-ui-xs text-foreground-subtle">
                  {intl.formatMessage({ id: `chat.changeSummary.reverted` })}
                </span>
              ) : null}
            </button>
          </CollapsibleTrigger>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!canRewind || rewindLoading || rewindApplying}
            onClick={previewRewind}
            title={intl.formatMessage({ id: `chat.changeSummary.rewind` })}
          >
            {rewindLoading || rewindApplying ? <IconSpinner className="animate-spin" /> : <IconRewind />}
            <span>{intl.formatMessage({ id: `chat.changeSummary.rewind` })}</span>
          </Button>
        </div>
        <CollapsibleContent>
          <div className="grid border-t border-border">
            {loadingDetails ? (
              <div className="flex h-8 items-center gap-2 px-2 text-ui-base text-foreground-subtle">
                <IconSpinner className="size-3.5 animate-spin" />
                {intl.formatMessage({ id: `chat.changeSummary.rewindDialog.loading` })}
              </div>
            ) : details && items.length === 0 ? (
              <div className="px-2 py-1.5 text-ui-base text-foreground-subtle">{intl.formatMessage({ id: `chat.changeSummary.diffUnavailable` })}</div>
            ) : (
              items.map((item) => {
                const relativePath = toWorkspaceRelativePath(context.workspacePath, item.path);
                const canReview = item.patches.length > 0 && !!context.onOpenCodeViewer;
                const previewSource = buildFilePreviewSource({
                  path: item.path,
                  relativePath,
                  workspacePath: context.workspacePath,
                  workspaceIdentity: context.workspaceIdentity,
                  workspaceRemoteSessionId: context.workspaceRemoteSessionId,
                });
                return (
                  <div key={item.path} className="bg-background/50">
                    <div
                      aria-disabled={!canReview}
                      className={cn(`flex w-full items-center gap-1 px-2 py-2 text-left transition-colors`, canReview ? `cursor-pointer hover:bg-hover/30` : `cursor-default`)}
                      onClick={() => openFileChangeInViewer(item, context)}
                      onKeyDown={(event) => {
                        if (event.key !== `Enter` && event.key !== ` `) return;
                        event.preventDefault();
                        openFileChangeInViewer(item, context);
                      }}
                      role="button"
                      tabIndex={canReview ? 0 : -1}
                      title={item.path}
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <div className="min-w-0 flex items-center">
                          <FilePath
                            path={item.path}
                            options={{
                              basePath: context.workspacePath,
                              showFilePath: true,
                              className: `inline-flex min-w-0 max-w-full items-center gap-1.5`,
                              fileNameClassName: `truncate text-ui-base font-medium text-foreground`,
                              filePathClassName: `truncate text-ui-base text-foreground-subtlest`,
                            }}
                          />
                        </div>
                        <span className="flex shrink-0 items-center gap-2 tabular-nums text-ui-base">
                          {item.additions > 0 ? <span className="text-diff-added">{`+`}{item.additions}</span> : null}
                          {item.deletions > 0 ? <span className="text-diff-removed">{`-`}{item.deletions}</span> : null}
                        </span>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="default"
                          aria-label={intl.formatMessage({ id: `chat.changeSummary.review` })}
                          title={intl.formatMessage({ id: `chat.changeSummary.review` })}
                          disabled={!canReview}
                          className="h-7 gap-1.5 rounded-lg bg-input px-2 text-ui-base"
                          onClick={(event) => {
                            event.stopPropagation();
                            openFileChangeInViewer(item, context);
                          }}
                          onPointerDown={(event) => event.stopPropagation()}
                        >
                          <span>{intl.formatMessage({ id: `chat.changeSummary.review` })}</span>
                        </Button>
                        <FileOpenWithMenu
                          target={{ type: `file`, path: item.path, title: relativePath, label: relativePath, previewSource }}
                          onOpenCodeViewer={context.onOpenCodeViewer}
                          hideOpenWithMenu={context.compactForRemoteControl === true}
                          stopPropagation={true}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
      <FileRewindDialog
        open={rewindOpen}
        onOpenChange={setRewindOpen}
        preview={rewindPreview}
        previewLoading={rewindLoading}
        applying={rewindApplying}
        error={rewindError}
        onApply={applyRewind}
      />
    </>
  );
}

/* --- 5.15 渲染单元与工作段（原 Fyt/ayt/m_t 产物 + Ivt/Lvt/Rvt/Bvt/Vvt/Hvt） --- */

/** 工作段流条目（原 Lvt 的 flowItems 元素） */
type WorkFlowItem =
  | { kind: "userInput"; row: UserInputRow }
  | { kind: "assistantText"; row: AssistantTextRow; latest?: boolean }
  | { kind: "assistantHistory"; rows: ConversationRow[] }
  | { kind: "rows"; rows: ConversationRow[] };

interface WorkSegment {
  key: string;
  flowItems: WorkFlowItem[];
  assistantWorkRows: ConversationRow[];
  assistantHistoryRows: ConversationRow[];
  assistantFollowingRows: ConversationRow[];
  assistantHistoryDefaultOpen: boolean;
  workStatus?: { state: "running" | "completed" | string; durationMs?: number };
}

/** 轮渲染单元（原 Fyt js 113940 / jsx 97087 的产物；由行窗口按 turnId 分组） */
interface TurnRenderUnit {
  key: string;
  turnId: string;
  isLastTurn: boolean;
  isRunning: boolean;
  timelineOnly: boolean;
  header?: TurnHeaderRowModel | null;
  visibleUserInputs: UserInputRow[];
  leadingBoundaryRows: ConversationRow[];
  assistantWorkRows: ConversationRow[];
  assistantHistoryRows: ConversationRow[];
  assistantFollowingRows: ConversationRow[];
  assistantTailRows: ConversationRow[];
  browserTurnEndRows: ConversationRow[];
  assistantTextRows: AssistantTextRow[];
  latestAssistantTextRow?: AssistantTextRow | null;
  flowItems: WorkFlowItem[];
  workSegments?: WorkSegment[];
  workStatus?: WorkSegment["workStatus"];
  assistantHistoryDefaultOpen: boolean;
}
declare function buildRenderUnits(rows: ConversationRow[], opts: { nowMs: number; sessionPhase?: string }): TurnRenderUnit[];
declare function splitVirtualizedUnits(units: TurnRenderUnit[]): {
  virtualizedUnits: TurnRenderUnit[];
  liveUnit: TurnRenderUnit | null;
  liveUnitIndex: number | null;
};

/** 原 Wgt（jsx 94075）：是否显示 API 重试/加载槽 */
declare function isApiRetryEligible(args: {
  blockedByActiveWork: boolean;
  blockedByInteraction: boolean;
  isLastTurn: boolean;
  isRunning: boolean;
  rows: ConversationRow[];
}): boolean;
/** 原 Bgt（jsx 94019）：最新 assistant 消息的预览卡（含文件变更拉取） */
declare function buildAssistantPreviewCards(args: {
  row: AssistantTextRow | null | undefined;
  assistantTextRows: AssistantTextRow[];
  latestAssistantTextRow: AssistantTextRow | null | undefined;
  workspacePath?: string;
  fileChangesTarget: { rowId: number; entityId: string } | null;
  fileChangesState?: string;
  fetchFileChanges?: RowRenderContext["fetchFileChanges"];
}): unknown[] | undefined;

/**
 * 工作段头（原 Ivt，js 112890 / jsx 96238）：「工作中 N 秒 / 工作了 N 秒」
 * + 折叠箭头（默认展开的历史段无箭头）。chat.history.workingFor/workedFor/worked
 */
function WorkSegmentHeader({ segment, open }: { segment: WorkSegment; open: boolean }) {
  const { intl, locale } = useIntlContext();
  const duration = formatWorkDuration(segment.workStatus?.durationMs, intl.formatMessage, locale);
  const label =
    segment.workStatus?.state === `running`
      ? intl.formatMessage({ id: `chat.history.workingFor` }, { duration: duration ?? `` })
      : duration
        ? intl.formatMessage({ id: `chat.history.workedFor` }, { duration })
        : intl.formatMessage({ id: `chat.history.worked` });
  return (
    <div className="flex w-full border-b border-[var(--color-border)]/50 pb-2">
      <CollapsibleTrigger asChild>
        <button
          type="button"
          data-testid={`v4-history-toggle:${segment.key}`}
          data-history-open={String(open)}
          className="group/history-message inline-flex max-w-full items-center gap-2 text-left text-ui-base text-foreground-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-input-border-focused)]"
        >
          <span className="truncate">{label}</span>
          {segment.assistantHistoryDefaultOpen ? null : (
            <IconChevronRight
              aria-hidden={true}
              className={cn(`size-4 shrink-0 text-[var(--color-foreground-subtlest)] opacity-70 transition-transform`, open ? `rotate-90` : `rotate-0`)}
            />
          )}
        </button>
      </CollapsibleTrigger>
    </div>
  );
}

/**
 * 工作段视图（原 Lvt，js 112924 / jsx 96263）。
 * 一个段 = 一条用户输入 +（可折叠历史块）+ 最新回复；历史块默认收起，
 * 最新一条 assistant 文本独占动作条（canFork/canRetry 仅挂最新）。
 */
function WorkSegmentView({
  segment,
  context,
  onFork,
  onRetry,
  onEdit,
  editWorkspaceRewindAvailability,
  assistantCopyText,
  assistantPreviewCards,
  canForkLatestAssistant,
  canRetryLatestAssistant,
}: {
  segment: WorkSegment;
  context: RowRenderContext;
  onFork?: (target: { rowId: number; entityId: string }) => void;
  onRetry?: (target: { rowId: number; entityId: string }) => void;
  onEdit?: RowRendererProps["onEdit"];
  editWorkspaceRewindAvailability?: RowRendererProps["editWorkspaceRewindAvailability"];
  assistantCopyText?: string;
  assistantPreviewCards?: unknown[];
  canForkLatestAssistant: boolean;
  canRetryLatestAssistant: boolean;
}) {
  const [open, setOpen] = React.useState(segment.assistantHistoryDefaultOpen);
  React.useEffect(() => {
    setOpen(segment.assistantHistoryDefaultOpen);
  }, [segment.assistantHistoryDefaultOpen, segment.key]);
  const hasWorkStatus = segment.workStatus !== undefined;
  const firstNonUserIndex = segment.flowItems.findIndex((item) => item.kind !== `userInput`);
  let historyChunkCount = 0;
  const effectiveOpen = segment.assistantHistoryDefaultOpen ? true : open;
  return (
    <Collapsible
      open={effectiveOpen}
      onOpenChange={segment.assistantHistoryDefaultOpen ? undefined : setOpen}
      className={`history-message flex flex-col [&>*+*:not([data-slot='collapsible-content'])]:mt-5`}
    >
      {segment.flowItems.map((item, index) => {
        const showHeaderBefore = hasWorkStatus && index === firstNonUserIndex;
        const itemKey =
          item.kind === `userInput` || item.kind === `assistantText`
            ? `${item.kind}:${item.row.rowId}`
            : `${item.kind}:${item.rows[0]?.rowId ?? index}`;
        let content: React.ReactNode;
        if (item.kind === `userInput`) {
          content = (
            <RenderedRow
              row={item.row}
              context={context}
              onEdit={item.row.actions?.canEdit === true ? onEdit : undefined}
              editWorkspaceRewindAvailability={editWorkspaceRewindAvailability}
            />
          );
        } else if (item.kind === `assistantHistory`) {
          const chunkKey = historyChunkCount === 0 ? segment.key : `${segment.key}:chunk-${historyChunkCount}`;
          historyChunkCount += 1;
          content = (
            <CollapsibleContent data-testid={`v4-history-chunk:${chunkKey}`} data-history-open={String(effectiveOpen)}>
              <div className="pt-5">
                <RowSegmentList rows={item.rows} context={context} />
              </div>
            </CollapsibleContent>
          );
        } else if (item.kind === `assistantText`) {
          content = (
            <RenderedRow
              row={item.row}
              context={context}
              onFork={item.latest && canForkLatestAssistant ? onFork : undefined}
              onRetry={item.latest && canRetryLatestAssistant ? onRetry : undefined}
              hideAssistantActions={!item.latest}
              deferAssistantActions={item.latest}
              assistantCopyText={item.latest ? assistantCopyText : undefined}
              assistantPreviewCards={item.latest ? assistantPreviewCards : undefined}
            />
          );
        } else {
          content = <RowSegmentList rows={item.rows} context={context} />;
        }
        return (
          <React.Fragment key={itemKey}>
            {showHeaderBefore ? <WorkSegmentHeader segment={segment} open={effectiveOpen} /> : null}
            {content}
          </React.Fragment>
        );
      })}
      {hasWorkStatus && firstNonUserIndex < 0 ? <WorkSegmentHeader segment={segment} open={effectiveOpen} /> : null}
    </Collapsible>
  );
}

/**
 * assistant 轮体（原 Rvt，js 112998 / jsx 96317）。
 * timelineOnly → 纯工作行 + 重试槽；否则按工作段渲染（单段合并默认展开态），
 * 末尾挂重试槽。轮级 canFork/canRetry 取自最新 assistant 行的 actions。
 */
function AssistantTurnBody({
  unit,
  apiRetry,
  context,
  onFork,
  onRetry,
  onEdit,
  editWorkspaceRewindAvailability,
  assistantCopyText,
}: {
  unit: TurnRenderUnit;
  apiRetry: { attempt: number; maxAttempts: number; reasonCode?: string } | null;
  context: RowRenderContext;
  onFork?: (target: { rowId: number; entityId: string }) => void;
  onRetry?: (target: { rowId: number; entityId: string }) => void;
  onEdit?: RowRendererProps["onEdit"];
  editWorkspaceRewindAvailability?: RowRendererProps["editWorkspaceRewindAvailability"];
  assistantCopyText?: string;
}) {
  const retryEligible = isApiRetryEligible({
    blockedByActiveWork: context.chatLoadingBlockedByActiveWork === true,
    blockedByInteraction: context.chatLoadingBlockedByInteraction === true,
    isLastTurn: unit.isLastTurn,
    isRunning: unit.isRunning,
    rows: unit.assistantWorkRows,
  });
  const previewCards = buildAssistantPreviewCards({
    row: unit.latestAssistantTextRow,
    assistantTextRows: unit.assistantTextRows,
    latestAssistantTextRow: unit.latestAssistantTextRow,
    workspacePath: context.workspacePath,
    fileChangesTarget: unit.header?.entityId ? { rowId: unit.header.rowId, entityId: unit.header.entityId } : null,
    fileChangesState: unit.header?.fileChanges?.state,
    fetchFileChanges: context.fetchFileChanges,
  });
  if (unit.timelineOnly) {
    return (
      <div className="flex flex-col gap-2">
        <RowSegmentList rows={unit.assistantWorkRows} context={context} />
        <ApiRetryLoadingSlot apiRetry={apiRetry} eligible={retryEligible} />
      </div>
    );
  }
  const rawSegments = unit.workSegments ?? [];
  const segments: WorkSegment[] =
    rawSegments.length > 0
      ? rawSegments.length === 1
        ? [{ ...rawSegments[0], assistantHistoryDefaultOpen: unit.assistantHistoryDefaultOpen }]
        : rawSegments
      : [
          {
            key: unit.key,
            flowItems: unit.flowItems,
            assistantWorkRows: unit.assistantWorkRows,
            assistantHistoryRows: unit.assistantHistoryRows,
            assistantFollowingRows: unit.assistantFollowingRows,
            assistantHistoryDefaultOpen: unit.assistantHistoryDefaultOpen,
            ...(unit.workStatus ? { workStatus: unit.workStatus } : {}),
          },
        ];
  if (segments.every((segment) => segment.flowItems.length === 0 && segment.workStatus === undefined) && !retryEligible) return null;
  const latest = unit.latestAssistantTextRow;
  const canRetryLatest = latest?.actions?.canRetry === true;
  const canForkLatest = latest?.actions?.canFork === true;
  return (
    <div className="flex flex-col gap-5">
      {segments.map((segment) => (
        <WorkSegmentView
          key={segment.key}
          segment={segment}
          context={context}
          onFork={onFork}
          onRetry={onRetry}
          onEdit={onEdit}
          editWorkspaceRewindAvailability={editWorkspaceRewindAvailability}
          assistantCopyText={assistantCopyText}
          assistantPreviewCards={previewCards}
          canForkLatestAssistant={canForkLatest}
          canRetryLatestAssistant={canRetryLatest}
        />
      ))}
      <ApiRetryLoadingSlot apiRetry={apiRetry} eligible={retryEligible} />
    </div>
  );
}

/**
 * 原 zvt（jsx 96374）：backgroundResult 轮的标题（后台 bash/子代理结果）。
 */
function resolveBackgroundResultTitle(unit: TurnRenderUnit): string | undefined {
  if (unit.header?.origin !== `backgroundResult`) return undefined;
  const meta = unit.header.originMeta;
  if (!meta?.workId.trim() || !meta.title.trim()) return undefined;
  if (meta.backgroundSource !== `bash` && meta.backgroundSource !== `subagent`) return undefined;
  return meta.title.trim();
}

/**
 * 后台结果轮体（原 Bvt，js 113089 / jsx 96379）：
 * 标题分隔行（testid v4-turn-background-title）+ 历史行 + 最新回复 + 后续行 + 重试槽。
 */
function BackgroundResultTurnBody({
  unit,
  apiRetry,
  context,
  onFork,
  onRetry,
  title,
  assistantCopyText,
}: {
  unit: TurnRenderUnit;
  apiRetry: { attempt: number; maxAttempts: number; reasonCode?: string } | null;
  context: RowRenderContext;
  onFork?: (target: { rowId: number; entityId: string }) => void;
  onRetry?: (target: { rowId: number; entityId: string }) => void;
  title: string;
  assistantCopyText?: string;
}) {
  const hasHistory = unit.assistantHistoryRows.length > 0;
  const hasFollowing = unit.assistantFollowingRows.length > 0;
  const retryEligible = isApiRetryEligible({
    blockedByActiveWork: context.chatLoadingBlockedByActiveWork === true,
    blockedByInteraction: context.chatLoadingBlockedByInteraction === true,
    isLastTurn: unit.isLastTurn,
    isRunning: unit.isRunning,
    rows: unit.assistantWorkRows,
  });
  const latest = unit.latestAssistantTextRow;
  const previewCards = buildAssistantPreviewCards({
    row: latest,
    assistantTextRows: unit.assistantTextRows,
    latestAssistantTextRow: latest,
    workspacePath: context.workspacePath,
    fileChangesTarget: unit.header?.entityId ? { rowId: unit.header.rowId, entityId: unit.header.entityId } : null,
    fileChangesState: unit.header?.fileChanges?.state,
    fetchFileChanges: context.fetchFileChanges,
  });
  return (
    <div className="flex flex-col gap-5">
      <div className="flex w-full border-b border-[var(--color-border)]/50 pb-2">
        <div
          data-testid={`v4-turn-background-title:${unit.key}`}
          className="min-w-0 whitespace-pre-wrap break-words text-left text-ui-base text-[var(--color-foreground-subtle)]"
        >
          {title}
        </div>
      </div>
      {hasHistory ? (
        <div className="flex flex-col gap-2">
          <RowSegmentList rows={unit.assistantHistoryRows} context={context} />
        </div>
      ) : null}
      {latest ? (
        <RenderedRow
          key={`${latest.rowId}:${latest.entityId ?? ``}`}
          row={latest}
          context={context}
          onFork={latest.actions?.canFork === true ? onFork : undefined}
          onRetry={latest.actions?.canRetry === true ? onRetry : undefined}
          deferAssistantActions={true}
          assistantCopyText={assistantCopyText}
          assistantPreviewCards={previewCards}
        />
      ) : null}
      {hasFollowing ? <RowSegmentList rows={unit.assistantFollowingRows} context={context} /> : null}
      <ApiRetryLoadingSlot apiRetry={apiRetry} eligible={retryEligible} />
    </div>
  );
}

/**
 * TurnSection（原 Vvt，js 113156 / jsx 96423；memo 名 Hvt，js 113295 / jsx 96489）。
 * 一个轮 = `<section data-turn-id>`，pt-14 大间距分段：
 *   前置边界行 →（后台结果体 | 普通轮体）→ 自动化卡 → 文件变更摘要 →
 *   浏览器结束行 → 悬浮动作条（复制/赞踩/重试/fork）→ 尾部行。
 * 轮级动作门控：canRewindFiles → 文件回退可用性（noFiles/reverted/running/unavailable）。
 */
function TurnSectionImpl({
  unit,
  apiRetry = null,
  context,
  onFork,
  onRetry,
  onFeedbackChange,
  onEdit,
}: {
  unit: TurnRenderUnit;
  apiRetry?: { attempt: number; maxAttempts: number; reasonCode?: string } | null;
  context: RowRenderContext;
  onFork?: (target: { rowId: number; entityId: string }) => void;
  onRetry?: (target: { rowId: number; entityId: string }) => void;
  onFeedbackChange?: (target: { rowId: number; entityId: string }, feedback: RowFeedback) => Promise<boolean> | boolean;
  onEdit?: RowRendererProps["onEdit"];
}) {
  const visibleUserInputs = React.useMemo(() => unit.visibleUserInputs, [unit.visibleUserInputs]);
  const firstReasoningRowId = React.useMemo(
    () => unit.assistantWorkRows.find((row) => row.kind === `reasoning`)?.rowId,
    [unit.assistantWorkRows],
  );
  const enrichedContext = React.useMemo(
    () => ({ ...context, ...(firstReasoningRowId === undefined ? {} : { messageStreamFirstReasoningRowId: firstReasoningRowId }) }),
    [context, firstReasoningRowId],
  );
  const latest = unit.latestAssistantTextRow;
  const copyText = React.useMemo(() => buildAssistantCopyText(unit), [unit.assistantTextRows, unit.assistantWorkRows, unit.latestAssistantTextRow]);
  const automationCards = React.useMemo(() => (unit.isRunning ? [] : collectAutomationCards(unit.assistantWorkRows)), [unit.assistantWorkRows, unit.isRunning]);
  const showTurnActions = !unit.timelineOnly && latest?.state === `complete` && copyText !== undefined;
  const canRetry = latest?.actions?.canRetry === true;
  const canFork = latest?.actions?.canFork === true;
  const backgroundTitle = resolveBackgroundResultTitle(unit);
  const hasVisibleBody =
    (unit.timelineOnly
      ? unit.assistantWorkRows.length > 0
      : unit.assistantWorkRows.length > 0 || unit.workSegments?.some((segment) => segment.workStatus?.state === `running`) === true || unit.workStatus?.state === `running`) ||
    !!unit.header?.fileChanges ||
    showTurnActions;
  const rewindAvailability = React.useMemo(() => {
    const fileChanges = unit.header?.fileChanges;
    if (!fileChanges || fileChanges.files <= 0) return { enabled: false, reason: `noFiles` as const };
    if (fileChanges.state === `reverted`) return { enabled: false, reason: `reverted` as const };
    if (unit.isRunning) return { enabled: false, reason: `running` as const };
    if (unit.header?.actions?.canRewindFiles === true) return { enabled: true, reason: `available` as const };
    return { enabled: false, reason: `unavailable` as const };
  }, [unit.header?.actions?.canRewindFiles, unit.header?.fileChanges, unit.isRunning]);
  return (
    <section data-turn-id={unit.turnId} data-turn-key={unit.key} className="mx-auto flex w-full flex-col gap-5 px-4 @md/conversation:px-6 pb-5 pt-14">
      {unit.leadingBoundaryRows.map((row) => (
        <RenderedRow key={`${row.rowId}:${(row as { entityId?: string }).entityId ?? ``}`} row={row} context={context} />
      ))}
      {hasVisibleBody ? (
        <div className="group/assistant-turn flex w-full flex-col gap-5">
          {backgroundTitle ? (
            <>
              {visibleUserInputs.map((row) => (
                <RenderedRow
                  key={`${row.rowId}:${row.entityId ?? ``}`}
                  row={row}
                  context={context}
                  onEdit={row.actions?.canEdit === true ? onEdit : undefined}
                  editWorkspaceRewindAvailability={rewindAvailability}
                />
              ))}
              <BackgroundResultTurnBody
                unit={unit}
                apiRetry={apiRetry}
                context={enrichedContext}
                onFork={canFork ? onFork : undefined}
                onRetry={onRetry}
                title={backgroundTitle}
                assistantCopyText={copyText}
              />
            </>
          ) : (
            <AssistantTurnBody
              unit={unit}
              apiRetry={apiRetry}
              context={enrichedContext}
              onFork={canFork ? onFork : undefined}
              onRetry={onRetry}
              onEdit={onEdit}
              editWorkspaceRewindAvailability={rewindAvailability}
              assistantCopyText={copyText}
            />
          )}
          <AutomationCardList cards={automationCards} context={context} />
          {unit.header?.fileChanges ? <TurnFileChangesSummary header={unit.header} context={context} /> : null}
          {unit.browserTurnEndRows.length > 0 ? <RowSegmentList rows={unit.browserTurnEndRows} context={enrichedContext} /> : null}
          {showTurnActions && latest ? (
            <AssistantMessageActions
              rowId={latest.rowId}
              entityId={latest.entityId}
              text={copyText ?? ``}
              createdAt={latest.createdAt}
              compactForRemoteControl={context.compactForRemoteControl}
              feedback={normalizeRowFeedback(latest)}
              sessionId={context.sessionId}
              onFork={canFork ? onFork : undefined}
              onRetry={canRetry ? onRetry : undefined}
              onFeedbackChange={onFeedbackChange}
              className={cn(
                context.compactForRemoteControl
                  ? `opacity-100`
                  : `opacity-0 transition-opacity group-hover/assistant-turn:opacity-100 focus-within:opacity-100`,
              )}
            />
          ) : null}
          {unit.assistantTailRows.length > 0 ? <RowSegmentList rows={unit.assistantTailRows} context={enrichedContext} /> : null}
        </div>
      ) : (
        <AssistantTurnBody
          unit={unit}
          apiRetry={apiRetry}
          context={enrichedContext}
          onEdit={onEdit}
          editWorkspaceRewindAvailability={rewindAvailability}
          assistantCopyText={copyText}
        />
      )}
    </section>
  );
}
const TurnSection = React.memo(TurnSectionImpl);

/* ============================================================================
 * 6. TurnNavigator 子族（左侧轮刻度条；js 113296–113619 / jsx 96490–96769）
 *    会话列 ≥864px 才可见（@min-[864px]/conversation）；悬停浮出当前轮的
 *    用户提问 + assistant 摘要（HoverCard），点击平滑滚动定位。
 *    chat.turnNavigator.label / jumpToQuery / emptyAssistant / runningAssistant /
 *    userFallback
 * ==========================================================================*/

/** 原 Uvt（js 113296 / jsx 96490）：目录补齐触发条件（宽 ≥864px 且可加载更早） */
function shouldHydrateFullHistory(args: {
  canLoadOlder: boolean;
  loadingOlder: boolean;
  hasLoadHandler: boolean;
  containerWidthPx: number;
}): boolean {
  return args.canLoadOlder && !args.loadingOlder && args.hasLoadHandler && args.containerWidthPx >= 864;
}
/** 原 Wvt（js 113299 / jsx 96493）：目录补齐重试退避（第1次 250ms / 第2次 1s / 放弃） */
function hydrateRetryDelayMs(attemptCount: number): number | null {
  return attemptCount === 1 ? 250 : attemptCount === 2 ? 1e3 : null;
}
const NAVIGATOR_MAX_PREVIEW_CHARS = 220; // Gvt（js 113302 / jsx 96496）
const NAVIGATOR_MAX_PREVIEW_PARAGRAPHS = 2; // Kvt（同上行）

/** 原 qvt（js 113304 / jsx 96498）：按空行分段 → 压扁空白 → 取前 N 段 */
function splitPreviewParagraphs(text: string, maxParagraphs: number): string[] {
  return text
    .trim()
    .split(/\n\s*\n/u)
    .map((paragraph) => paragraph.replace(/\s+/gu, ` `).trim())
    .filter(Boolean)
    .slice(0, Math.max(1, maxParagraphs));
}
/** 原 Jvt（js 113312 / jsx 96501）：预览截断（至少 8 字符 + 省略号） */
function truncatePreview(text: string, maxChars: number): string {
  const limit = Math.max(8, maxChars);
  return text.length <= limit ? text : `${text.slice(0, limit - 3).trimEnd()}...`;
}
/** 原 Yvt（js 113316 / jsx 96505）：多段文本 → 单条预览 */
function buildPreviewText({
  texts,
  fallback,
  maxPreviewChars,
  maxPreviewParagraphs,
}: {
  texts: string[];
  fallback: string;
  maxPreviewChars: number;
  maxPreviewParagraphs: number;
}): string {
  const paragraphs = splitPreviewParagraphs(texts.join(`\n\n`), maxPreviewParagraphs);
  if (paragraphs.length === 0) return fallback;
  return truncatePreview(paragraphs.join(`\n`), maxPreviewChars);
}
/** 原 Xvt（jsx 96517）：assistant 预览三态（文本/运行中/空） */
function buildAssistantPreview(
  unit: TurnRenderUnit,
  opts: { assistantEmptyPreview: string; assistantRunningPreview: string; maxPreviewChars: number; maxPreviewParagraphs: number },
): { assistantPreview: string; assistantPreviewKind: "text" | "running" | "empty" } {
  if (unit.assistantTextRows.length > 0) {
    return {
      assistantPreview: buildPreviewText({
        texts: unit.assistantTextRows.map((row) => row.text),
        fallback: opts.assistantEmptyPreview,
        maxPreviewChars: opts.maxPreviewChars,
        maxPreviewParagraphs: opts.maxPreviewParagraphs,
      }),
      assistantPreviewKind: `text`,
    };
  }
  if (unit.isRunning) return { assistantPreview: opts.assistantRunningPreview, assistantPreviewKind: `running` };
  return { assistantPreview: opts.assistantEmptyPreview, assistantPreviewKind: `empty` };
}

interface TurnNavigatorItem {
  key: string;
  turnId: string;
  unitIndex: number;
  rowId: number;
  userPreview: string;
  assistantPreview: string;
  assistantPreviewKind: "text" | "running" | "empty";
  isRunning: boolean;
}

/** 原 Zvt（js 113346 / jsx 96534）：渲染单元 → 导航项（每个真实用户输入一条） */
function buildTurnNavigatorItems(
  units: TurnRenderUnit[],
  opts: {
    assistantEmptyPreview: string;
    assistantRunningPreview: string;
    userFallbackPreview: string;
    maxPreviewChars?: number;
    maxPreviewParagraphs?: number;
  },
): TurnNavigatorItem[] {
  const resolved = {
    ...opts,
    maxPreviewChars: opts.maxPreviewChars ?? NAVIGATOR_MAX_PREVIEW_CHARS,
    maxPreviewParagraphs: opts.maxPreviewParagraphs ?? NAVIGATOR_MAX_PREVIEW_PARAGRAPHS,
  };
  return units.flatMap((unit, unitIndex) => {
    const inputs = unit.visibleUserInputs.filter((input) => input.origin === `realUser`);
    if (unit.timelineOnly || inputs.length === 0) return [];
    const { assistantPreview, assistantPreviewKind } = buildAssistantPreview(unit, resolved);
    return inputs.map((input, inputIndex) => ({
      key: `${unit.key}:query:${input.entityId ?? input.rowId}`,
      turnId: unit.turnId,
      unitIndex,
      rowId: input.rowId,
      userPreview: buildPreviewText({
        texts: [input.text],
        fallback: resolved.userFallbackPreview,
        maxPreviewChars: resolved.maxPreviewChars,
        maxPreviewParagraphs: resolved.maxPreviewParagraphs,
      }),
      assistantPreview,
      assistantPreviewKind,
      isRunning: unit.isRunning && inputIndex === inputs.length - 1,
    }));
  });
}

/** 原 w1（js 113373 / jsx 96564）：非负钳位 */
function clampNonNegative(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

/** ES2023 findLast 的等价实现（目标 lib 为 ES2022） */
function findLastItem<T>(items: T[], predicate: (item: T) => boolean): T | undefined {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    const item = items[index];
    if (item !== undefined && predicate(item)) return item;
  }
  return undefined;
}

/** 原 Qvt（js 113376 / jsx 96567）：视口内最近的单元索引（滚动位置 → 聚焦项） */
function findVisibleUnitIndex({
  items,
  virtualItems,
  scrollOffsetPx,
  viewportHeightPx,
}: {
  items: TurnNavigatorItem[];
  virtualItems: { index: number; start: number; size: number }[];
  scrollOffsetPx: number;
  viewportHeightPx: number;
}): number | undefined {
  if (items.length === 0) return undefined;
  const byUnitIndex = new Map(items.map((item) => [item.unitIndex, item]));
  const offset = clampNonNegative(scrollOffsetPx);
  const bottom = offset + Math.max(1, clampNonNegative(viewportHeightPx));
  let bestUnitIndex: number | undefined;
  let bestDistance = Infinity;
  for (const virtual of virtualItems) {
    const item = byUnitIndex.get(virtual.index);
    if (!item) continue;
    const start = clampNonNegative(virtual.start);
    if (start + Math.max(1, clampNonNegative(virtual.size)) < offset || start > bottom) continue;
    const distance = start <= offset ? 0 : start - offset;
    if (distance < bestDistance) {
      bestUnitIndex = item.unitIndex;
      bestDistance = distance;
    }
  }
  if (bestUnitIndex !== undefined) return bestUnitIndex;
  const fallbackIndex = virtualItems.find((virtual) => {
    const start = clampNonNegative(virtual.start);
    return start + Math.max(1, clampNonNegative(virtual.size)) >= offset && start <= bottom;
  })?.index;
  return fallbackIndex === undefined
    ? items[0]?.unitIndex
    : items.find((item) => item.unitIndex >= fallbackIndex)?.unitIndex ??
        findLastItem(items, (item) => item.unitIndex <= fallbackIndex)?.unitIndex ??
        items[0]?.unitIndex;
}

/** 原 $vt（js 113402 / jsx 96594）：按行位置找当前 query 行（最近的行锚点） */
function findActiveQueryRow({
  positions,
  scrollOffsetPx,
  viewportHeightPx,
}: {
  positions: { rowId: number; start: number; end: number }[];
  scrollOffsetPx: number;
  viewportHeightPx: number;
}): number | undefined {
  if (positions.length === 0) return undefined;
  const offset = clampNonNegative(scrollOffsetPx);
  const bottom = offset + Math.max(1, clampNonNegative(viewportHeightPx));
  const sorted = positions
    .map((position) => {
      const start = clampNonNegative(position.start);
      return { rowId: position.rowId, start, end: Math.max(start, clampNonNegative(position.end)) };
    })
    .sort((a, b) => a.start - b.start || a.rowId - b.rowId);
  const visible = sorted.filter((position) => position.end >= offset && position.start <= bottom);
  if (visible.length > 0) {
    return visible.reduce((best, position) => (Math.abs(position.start - offset) < Math.abs(best.start - offset) ? position : best)).rowId;
  }
  return findLastItem(sorted, (position) => position.start <= offset)?.rowId ?? sorted.find((position) => position.start > offset)?.rowId;
}

/** 原 eyt（js 113417 / jsx 96613）：刻度条视觉档位（焦点 2.6x / 近 1.7x / 中 1.25x / 远 1x） */
function resolveNavigatorItemVisual({
  itemIndex,
  visualFocusItemIndex,
}: {
  itemIndex: number;
  visualFocusItemIndex: number | undefined;
}): { colorTone: "focus" | "muted"; opacity: number; scaleX: number; tone: "peak" | "near" | "mid" | "idle" } {
  if (visualFocusItemIndex === undefined) return { colorTone: `muted`, opacity: 0.58, scaleX: 1, tone: `idle` };
  const distance = Math.abs(itemIndex - visualFocusItemIndex);
  if (distance === 0) return { colorTone: `focus`, opacity: 1, scaleX: 2.6, tone: `peak` };
  if (distance === 1) return { colorTone: `muted`, opacity: 0.86, scaleX: 1.7, tone: `near` };
  if (distance === 2) return { colorTone: `muted`, opacity: 0.72, scaleX: 1.25, tone: `mid` };
  return { colorTone: `muted`, opacity: 0.58, scaleX: 1, tone: `idle` };
}
/** 原 tyt（js 113428 / jsx 96646）：视觉焦点索引直通（悬停交互项优先由状态接管） */
function resolveVisualFocusIndex({ interactionItemIndex }: { interactionItemIndex: number | undefined }): number | undefined {
  return interactionItemIndex;
}
/** 原 nyt（js 113431 / jsx 96651）：prefers-reduced-motion 侦听 */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    if (typeof window > `u` || !window.matchMedia) return;
    const query = window.matchMedia(`(prefers-reduced-motion: reduce)`);
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener(`change`, update);
    return () => query.removeEventListener(`change`, update);
  }, []);
  return reduced;
}

/** useVirtualizer（原 to，esm-BY6T6pIH.js） */
declare function useVirtualizer(opts: {
  count: number;
  estimateSize: () => number;
  getItemKey: (index: number) => string | number;
  getScrollElement: () => HTMLElement | null;
  overscan: number;
}): {
  getVirtualItems(): { index: number; key: string | number; start: number; size: number }[];
  getTotalSize(): number;
  scrollToIndex(index: number, opts?: { align?: "auto" | "start" | "center" | "end"; behavior?: "auto" | "smooth" }): void;
};

/**
 * TurnNavigator（原 ryt，js 113443 / jsx 96660；memo 名 iyt，js 113619 / jsx 96769）。
 * 左侧绝对定位刻度条（w-12，<864px 隐藏）；少于 2 条不渲染；
 * 每条 = 2.5px 圆角横杠，按与焦点距离缩放/加深；HoverCard 预览用户提问+回复摘要。
 */
function TurnNavigatorImpl({
  renderUnits,
  scrollOffsetPx,
  viewportHeightPx,
  virtualItems,
  activeQueryRowId,
  isHydratingDirectory = false,
  onJumpToQuery,
}: {
  renderUnits: TurnRenderUnit[];
  scrollOffsetPx: number;
  viewportHeightPx: number;
  virtualItems: { index: number; start: number; size: number }[];
  activeQueryRowId?: number;
  isHydratingDirectory?: boolean;
  onJumpToQuery: (target: { unitIndex: number; rowId: number }, behavior: "auto" | "smooth") => void;
}) {
  const { intl } = useIntlContext();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [interactionItemIndex, setInteractionItemIndex] = React.useState<number | undefined>(undefined);
  const items = React.useMemo(
    () =>
      buildTurnNavigatorItems(renderUnits, {
        assistantEmptyPreview: intl.formatMessage({ id: `chat.turnNavigator.emptyAssistant` }),
        assistantRunningPreview: intl.formatMessage({ id: `chat.turnNavigator.runningAssistant` }),
        userFallbackPreview: intl.formatMessage({ id: `chat.turnNavigator.userFallback` }),
      }),
    [intl, renderUnits],
  );
  const visibleUnitIndex = React.useMemo(
    () => findVisibleUnitIndex({ items, scrollOffsetPx, viewportHeightPx, virtualItems }),
    [items, scrollOffsetPx, viewportHeightPx, virtualItems],
  );
  const lookup = React.useMemo(() => {
    const byRowId = new Map<number, number>();
    const firstByUnitIndex = new Map<number, number>();
    items.forEach((item, index) => {
      byRowId.set(item.rowId, index);
      if (!firstByUnitIndex.has(item.unitIndex)) firstByUnitIndex.set(item.unitIndex, index);
    });
    return { byRowId, firstByUnitIndex };
  }, [items]);
  const activeItemIndex =
    (activeQueryRowId === undefined ? undefined : lookup.byRowId.get(activeQueryRowId)) ??
    (visibleUnitIndex === undefined ? undefined : lookup.firstByUnitIndex.get(visibleUnitIndex)) ??
    -1;
  const visualFocusItemIndex = resolveVisualFocusIndex({ interactionItemIndex });
  const scrollElementRef = React.useRef<HTMLDivElement | null>(null);
  const getScrollElement = React.useCallback(() => scrollElementRef.current, []);
  const getItemKey = React.useCallback((index: number) => items[index]?.key ?? index, [items]);
  const virtualizer = useVirtualizer({
    count: items.length,
    estimateSize: () => 10,
    getItemKey,
    getScrollElement,
    overscan: 6,
  });
  const rendered = virtualizer.getVirtualItems();
  React.useEffect(() => {
    if (activeItemIndex < 0 || items.length < 2) return;
    virtualizer.scrollToIndex(activeItemIndex, { align: `auto` });
    const element = scrollElementRef.current;
    if (element) {
      window.queueMicrotask(() => {
        if (scrollElementRef.current === element) element.dispatchEvent(new Event(`scroll`));
      });
    }
  }, [activeItemIndex, items.length, virtualizer]);
  if (items.length < 2) return null;
  return (
    <nav
      aria-label={intl.formatMessage({ id: `chat.turnNavigator.label` })}
      aria-busy={isHydratingDirectory}
      data-testid="v4-turn-navigator"
      data-item-count={items.length}
      data-rendered-item-count={rendered.length}
      className="pointer-events-none invisible absolute inset-y-0 left-0 z-10 w-12 -translate-x-2 opacity-0 transition-[opacity,transform,visibility] duration-150 ease-out motion-reduce:transition-none @min-[864px]/conversation:visible @min-[864px]/conversation:translate-x-0 @min-[864px]/conversation:opacity-100"
    >
      <div
        ref={scrollElementRef}
        className="scrollbar-hide pointer-events-auto absolute left-3 top-1/2 max-h-[calc(100%-6rem)] w-9 -translate-y-1/2 overflow-x-hidden overflow-y-auto py-1"
        onPointerLeave={() => setInteractionItemIndex(undefined)}
        onScroll={() => setInteractionItemIndex(undefined)}
      >
        <div className="relative w-9" style={{ height: `${virtualizer.getTotalSize()}px` }}>
          {rendered.map((virtual) => {
            const index = virtual.index;
            const item = items[index];
            if (!item) return null;
            const isActive = index === activeItemIndex;
            const visual = resolveNavigatorItemVisual({ itemIndex: index, visualFocusItemIndex });
            const isFocusFallback = visualFocusItemIndex === undefined && isActive;
            return (
              <div key={item.key} className="absolute left-0 top-0 h-2.5 w-9" style={{ transform: `translateY(${virtual.start}px)` }}>
                <HoverCard closeDelay={80} openDelay={120}>
                  <HoverCardTrigger asChild>
                    <button
                      type="button"
                      aria-current={isActive ? `location` : undefined}
                      aria-label={intl.formatMessage({ id: `chat.turnNavigator.jumpToQuery` }, { index: String(index + 1) })}
                      aria-posinset={index + 1}
                      aria-setsize={items.length}
                      data-testid={`v4-turn-navigator-item:${item.key}`}
                      data-item-index={index}
                      data-unit-index={item.unitIndex}
                      data-turn-id={item.turnId}
                      data-query-row-id={item.rowId}
                      data-active={isActive ? `true` : `false`}
                      data-running={item.isRunning ? `true` : `false`}
                      data-visual-color-tone={visual.colorTone}
                      data-visual-scale={String(visual.scaleX)}
                      data-visual-tone={visual.tone}
                      onBlur={() => setInteractionItemIndex(undefined)}
                      onClick={() => onJumpToQuery({ unitIndex: item.unitIndex, rowId: item.rowId }, prefersReducedMotion ? `auto` : `smooth`)}
                      onFocus={() => setInteractionItemIndex(index)}
                      onPointerEnter={() => setInteractionItemIndex(index)}
                      onPointerLeave={() => setInteractionItemIndex(undefined)}
                      className="flex h-2.5 w-9 items-center justify-start rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      <span
                        className={cn(
                          `block h-0.5 w-3 origin-left rounded-full transition-[height,opacity,transform,background-color] duration-150 ease-out motion-reduce:transition-none`,
                          visual.colorTone === `focus` && `bg-foreground`,
                          visual.colorTone === `muted` && (isFocusFallback ? `bg-foreground` : `bg-foreground-subtlest`),
                        )}
                        style={{
                          opacity: isFocusFallback ? 0.9 : item.isRunning ? Math.max(visual.opacity, 0.72) : visual.opacity,
                          transform: `scaleX(${visual.scaleX})`,
                        }}
                      />
                    </button>
                  </HoverCardTrigger>
                  <HoverCardContent
                    align={`start`}
                    side={`right`}
                    sideOffset={8}
                    data-testid={`v4-turn-navigator-preview:${item.key}`}
                    className={`w-80 max-w-[calc(100vw-2rem)] border border-popover-border bg-popover p-3 text-popover-foreground shadow-lg`}
                  >
                    <div className="space-y-2">
                      <p className="line-clamp-2 whitespace-pre-line text-ui-base font-medium leading-5">{item.userPreview}</p>
                      <p
                        className={cn(
                          `line-clamp-3 whitespace-pre-line text-ui-base leading-5`,
                          item.assistantPreviewKind === `text` ? `text-popover-foreground/80` : `text-foreground-subtle`,
                        )}
                      >
                        {item.assistantPreview}
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
const TurnNavigator = React.memo(TurnNavigatorImpl);

/* ============================================================================
 * 7. Find 子族（会话内查找 + 搜索结果高亮 + 引用选择；jsx 97188–97660）
 *    实现基于 CSS Custom Highlight API（::highlight），不用 DOM 包裹，
 *    与虚拟滚动兼容。查找条（输入框/{current}/{total}/scope 切换）在
 *    WorkspaceShell 层，本族负责消息流侧的匹配/高亮/定位（spec §6 quick find）。
 * ==========================================================================*/

const FIND_HIGHLIGHT_NAME = `zcode-v4-conversation-find`; // O1
const FIND_HIGHLIGHT_ACTIVE_NAME = `zcode-v4-conversation-find-active`; // k1
const SEARCH_RESULT_HIGHLIGHT_NAME = `zcode-v4-conversation-search-result`; // A1
const FIND_HIGHLIGHT_STYLE_ID = `zcode-v4-conversation-find-highlight-style`; // Zyt
const FIND_HIGHLIGHT_CSS = `
::highlight(${FIND_HIGHLIGHT_NAME}) {
  background-color: var(--color-find-highlight, #fde68a);
  color: var(--color-foreground);
}
::highlight(${FIND_HIGHLIGHT_ACTIVE_NAME}) {
  background-color: var(--color-find-highlight-active, #facc15);
  color: var(--color-foreground);
}
::highlight(${SEARCH_RESULT_HIGHLIGHT_NAME}) {
  background-color: var(--color-find-highlight-active, #facc15);
  color: var(--color-foreground);
}
`; // Qyt

/** 原 $yt（jsx 97206）：注入 ::highlight 样式（幂等） */
function ensureFindHighlightStyles() {
  if (typeof document > `u`) return;
  const style = document.getElementById(FIND_HIGHLIGHT_STYLE_ID) ?? document.createElement(`style`);
  style.id = FIND_HIGHLIGHT_STYLE_ID;
  if (style.textContent !== FIND_HIGHLIGHT_CSS) style.textContent = FIND_HIGHLIGHT_CSS;
  if (!style.isConnected) document.head.append(style);
}

interface HighlightRegistry {
  highlights: { set(name: string, highlight: unknown): void; delete(name: string): void };
  Highlight: new (...ranges: Range[]) => unknown;
}
/** 原 j1（jsx 97211）：CSS.highlights + window.Highlight 可用性 */
function getHighlightRegistry(): HighlightRegistry | null {
  if (typeof window > `u` || typeof CSS > `u`) return null;
  const highlights = (CSS as unknown as { highlights?: HighlightRegistry["highlights"] }).highlights;
  const HighlightCtor = (window as unknown as { Highlight?: HighlightRegistry["Highlight"] }).Highlight;
  return !highlights || !HighlightCtor ? null : { highlights, Highlight: HighlightCtor };
}
/** 原 M1（jsx 97220）：构造带优先级的 Highlight */
function createHighlight(registry: HighlightRegistry, ranges: Range[], priority: number): unknown {
  const highlight = new registry.Highlight(...ranges) as unknown as { priority: number };
  highlight.priority = priority;
  return highlight;
}
/** 原 ebt（jsx 97224）：控件内的文本不参与查找 */
function isInEditableHost(node: Text): boolean {
  const parent = node.parentElement;
  return parent ? !!parent.closest(`button,input,textarea,select,[contenteditable="true"],[data-conversation-find-ignore="true"]`) : true;
}
/** 原 tbt（jsx 97228）：TreeWalker 收集匹配 Range（大小写不敏感） */
function collectMatchRanges(root: HTMLElement, query: string): Range[] {
  const ranges: Range[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!(node instanceof Text) || isInEditableHost(node)) return NodeFilter.FILTER_REJECT;
      return node.data.toLocaleLowerCase().includes(query) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    },
  });
  let current = walker.nextNode();
  while (current) {
    const textNode = current as Text;
    const haystack = textNode.data.toLocaleLowerCase();
    let cursor = 0;
    while (cursor < haystack.length) {
      const found = haystack.indexOf(query, cursor);
      if (found === -1) break;
      const range = document.createRange();
      range.setStart(textNode, found);
      range.setEnd(textNode, found + query.length);
      ranges.push(range);
      cursor = found + query.length;
    }
    current = walker.nextNode();
  }
  return ranges;
}
/** 原 nbt（jsx 97250）：按 rowId 找行元素 */
function findRowElement(root: HTMLElement, rowId: number): HTMLElement | null {
  return root.querySelector(`[data-row-id="${rowId}"]`);
}
/** 原 N1（jsx 97253）：定位第 rowMatchIndex 个匹配的 Range */
function resolveMatchRange(
  root: HTMLElement,
  query: string,
  match: { rowId: number; rowMatchIndex: number },
): Range | null {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return null;
  const rowElement = findRowElement(root, match.rowId);
  if (!rowElement) return null;
  return collectMatchRanges(rowElement, normalized)[match.rowMatchIndex] ?? null;
}

interface FindMatch {
  globalIndex: number;
  unitIndex: number;
  rowId: number;
  rowKind: RowKind;
  rowMatchIndex: number;
  start: number;
  end: number;
  sourceText: string;
}
interface FindIndex {
  query: string;
  matches: FindMatch[];
  matchCount: number;
  loadedRowCount: number;
}

/**
 * 原 rbt（jsx 97259）：应用查找高亮（全部匹配 + 当前激活项两层 ::highlight）。
 */
function applyFindHighlights({
  root,
  query,
  matches,
  activeMatch,
}: {
  root: HTMLElement;
  query: string;
  matches: FindMatch[];
  activeMatch: FindMatch | null;
}): Range | null {
  ensureFindHighlightStyles();
  const registry = getHighlightRegistry();
  if (!registry) return null;
  const ranges = matches.map((match) => resolveMatchRange(root, query, match)).filter((range): range is Range => range !== null);
  const activeRange = activeMatch ? resolveMatchRange(root, query, activeMatch) : null;
  registry.highlights.set(FIND_HIGHLIGHT_NAME, createHighlight(registry, ranges, 0));
  registry.highlights.set(FIND_HIGHLIGHT_ACTIVE_NAME, createHighlight(registry, activeRange ? [activeRange] : [], 1));
  return activeRange;
}
/** 原 ibt（jsx 97272）：应用搜索结果单点高亮（优先级 2） */
function applySearchResultHighlight({
  root,
  query,
  match,
}: {
  root: HTMLElement;
  query: string;
  match: FindMatch;
}): Range | null {
  ensureFindHighlightStyles();
  const registry = getHighlightRegistry();
  if (!registry) return null;
  const range = resolveMatchRange(root, query, match);
  registry.highlights.set(SEARCH_RESULT_HIGHLIGHT_NAME, createHighlight(registry, range ? [range] : [], 2));
  return range;
}
/** 原 abt（jsx 97283）：Range 平滑滚入视野（垂直居中） */
function scrollRangeToCenter(range: Range) {
  const ancestor = range.commonAncestorContainer;
  (ancestor instanceof Element ? ancestor : ancestor.parentElement)?.scrollIntoView({ block: `center`, behavior: `smooth` });
}
/** 原 P1/F1（jsx 97290/97294）：清除高亮 */
function clearFindHighlights() {
  const registry = getHighlightRegistry();
  registry?.highlights.delete(FIND_HIGHLIGHT_NAME);
  registry?.highlights.delete(FIND_HIGHLIGHT_ACTIVE_NAME);
}
function clearSearchResultHighlight() {
  getHighlightRegistry()?.highlights.delete(SEARCH_RESULT_HIGHLIGHT_NAME);
}

/** 原 obt（jsx 97297）：查询归一化 */
function normalizeFindQuery(query: string): string {
  return query.trim().toLocaleLowerCase();
}
/** 原 sbt/cbt（jsx 97300/97304）：收集可搜索行（用户输入 + assistant 文本） */
interface SearchableRow {
  unitIndex: number;
  rowId: number;
  rowKind: RowKind;
  text: string;
}
function collectSearchableRows(target: SearchableRow[], unit: TurnRenderUnit, unitIndex: number) {
  for (const input of unit.visibleUserInputs) target.push({ unitIndex, rowId: input.rowId, rowKind: input.kind, text: input.text });
  for (const row of unit.assistantTextRows) target.push({ unitIndex, rowId: row.rowId, rowKind: row.kind, text: row.text });
}
/**
 * 原 I1（jsx 97312）：构建查找索引（已加载行内全部匹配，按出现顺序编号）。
 */
function buildFindIndex(units: TurnRenderUnit[], query: string): FindIndex {
  const normalized = normalizeFindQuery(query);
  const rows: SearchableRow[] = [];
  units.forEach((unit, unitIndex) => collectSearchableRows(rows, unit, unitIndex));
  if (!normalized) return { query: normalized, matches: [], matchCount: 0, loadedRowCount: rows.length };
  const matches: FindMatch[] = [];
  for (const row of rows) {
    const haystack = row.text.toLocaleLowerCase();
    let cursor = 0;
    let rowMatchIndex = 0;
    while (cursor < haystack.length) {
      const found = haystack.indexOf(normalized, cursor);
      if (found === -1) break;
      matches.push({
        globalIndex: matches.length,
        unitIndex: row.unitIndex,
        rowId: row.rowId,
        rowKind: row.rowKind,
        rowMatchIndex,
        start: found,
        end: found + normalized.length,
        sourceText: row.text,
      });
      rowMatchIndex += 1;
      cursor = found + normalized.length;
    }
  }
  return { query: normalized, matches, matchCount: matches.length, loadedRowCount: rows.length };
}
/** 原 lbt/ubt/dbt（jsx 97348/97355/97358）：匹配键比较与索引钳位 */
type FindMatchKey = Pick<FindMatch, "rowId" | "rowKind" | "rowMatchIndex">;
function toMatchKey(match: FindMatch | null): FindMatchKey | null {
  return match ? { rowId: match.rowId, rowKind: match.rowKind, rowMatchIndex: match.rowMatchIndex } : null;
}
function indexOfMatchKey(index: FindIndex, key: FindMatchKey | null): number {
  return key ? index.matches.findIndex((match) => match.rowId === key.rowId && match.rowKind === key.rowKind && match.rowMatchIndex === key.rowMatchIndex) : -1;
}
function clampActiveIndex(index: FindIndex, requested: number): number {
  if (index.matchCount === 0) return -1;
  return requested >= 0 && requested < index.matchCount ? requested : 0;
}
/** 原 fbt/pbt/mbt（jsx 97361/97364/97369）：按片段定位搜索结果匹配 */
function normalizeSnippet(text: string): string {
  return text.replace(/^\.{3}/, ``).replace(/\.{3}$/, ``).replace(/\s+/g, ` `).trim();
}
function snippetMatchesSource(sourceText: string, snippet: string): boolean {
  const haystack = normalizeSnippet(sourceText).toLocaleLowerCase();
  const needle = normalizeSnippet(snippet).toLocaleLowerCase();
  return needle.length > 0 && haystack.includes(needle);
}
function findSnippetMatch(index: FindIndex, request: { snippet?: string; snippetIndex?: number }): FindMatch | null {
  if (index.matchCount === 0) return null;
  const snippet = request.snippet?.trim();
  if (snippet) {
    const match = index.matches.find((candidate) => snippetMatchesSource(candidate.sourceText, snippet));
    if (match) return match;
  }
  const snippetIndex = request.snippetIndex ?? 0;
  return index.matches[snippetIndex] ?? index.matches[0] ?? null;
}

const FIND_MAX_LOADED_ROWS = 1200; // L1（jsx 97379）
const SEARCH_RESULT_HIGHLIGHT_TTL_MS = 3e3; // hbt（jsx 97380）
function normalizeSearchSource(text: string): string {
  return text.replace(/^\.{3}/, ``).replace(/\.{3}$/, ``).replace(/\s+/g, ` `).trim();
}
function sourceContainsQuery(sourceText: string, query: string): boolean {
  const needle = normalizeSearchSource(query).toLocaleLowerCase();
  return needle ? normalizeSearchSource(sourceText).toLocaleLowerCase().includes(needle) : false;
}

/**
 * 会话内查找钩子（原 vbt，jsx 97388）。职责：
 * 1) 查询变化/激活索引变化 → 重算匹配、回报 {matchCount, activeIndex}（查找条 {current}/{total}）；
 * 2) 有查询且未加载满 → 自动补拉更早行（直到命中或到达上限 1200 行）;
 * 3) 当前匹配所在单元滚入视野；
 * 4) ::highlight 高亮重绘（rAF 节流）+ 激活匹配滚到中央；
 * 5) 搜索结果高亮请求（来自全局搜索）：定位 → 高亮 3s → 自动清除并回调。
 * 会话运行中（running/prewarming）禁用查找，避免流式抖动。
 */
function useConversationFind({
  rootRef,
  renderUnits,
  rows,
  mountedRowsKey,
  canLoadOlder,
  loadingOlder,
  onLoadOlder,
  sessionPhase,
  conversationFindQuery,
  conversationFindActiveIndex,
  onConversationFindMatchStateChange,
  searchResultHighlightRequest,
  onSearchResultHighlightDone,
  scrollToUnit,
}: {
  rootRef: React.RefObject<HTMLDivElement | null>;
  renderUnits: TurnRenderUnit[];
  rows: ConversationRow[];
  mountedRowsKey: string;
  canLoadOlder: boolean;
  loadingOlder: boolean;
  onLoadOlder?: () => void;
  sessionPhase?: string;
  conversationFindQuery: string;
  conversationFindActiveIndex: number;
  onConversationFindMatchStateChange?: (state: { matchCount: number; activeIndex: number }) => void;
  searchResultHighlightRequest?: { requestId: string; query: string; snippet?: string; snippetIndex?: number } | null;
  onSearchResultHighlightDone?: (requestId: string) => void;
  scrollToUnit: (unitIndex: number) => void;
}) {
  const findEnabled = sessionPhase !== `running` && sessionPhase !== `prewarming`;
  const findIndex = React.useMemo(() => (findEnabled ? buildFindIndex(renderUnits, conversationFindQuery) : buildFindIndex([], ``)), [conversationFindQuery, findEnabled, renderUnits]);
  const searchIndex = React.useMemo(
    () => (findEnabled && searchResultHighlightRequest ? buildFindIndex(renderUnits, searchResultHighlightRequest.query) : buildFindIndex([], ``)),
    [findEnabled, renderUnits, searchResultHighlightRequest],
  );
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const activeMatchKey = React.useRef<FindMatchKey | null>(null);
  const lastQuery = React.useRef(``);
  const lastRequestedIndex = React.useRef(conversationFindActiveIndex);
  const lastFindSignature = React.useRef(``);
  const lastLoadOlderSignature = React.useRef(``);
  const lastSearchLoadSignature = React.useRef(``);
  const lastSearchRequestId = React.useRef<string | null>(null);
  const searchClearTimer = React.useRef<number | undefined>(undefined);
  const activeMatch = activeIndex >= 0 ? findIndex.matches[activeIndex] ?? null : null;
  React.useEffect(() => {
    if (!findIndex.query || !findEnabled) {
      activeMatchKey.current = null;
      lastQuery.current = ``;
      lastFindSignature.current = ``;
      setActiveIndex(-1);
      clearFindHighlights();
      onConversationFindMatchStateChange?.({ matchCount: 0, activeIndex: -1 });
      return;
    }
    const queryChanged = lastQuery.current !== findIndex.query;
    const indexChanged = lastRequestedIndex.current !== conversationFindActiveIndex;
    let next = clampActiveIndex(findIndex, conversationFindActiveIndex);
    if (!queryChanged && !indexChanged) {
      const preserved = indexOfMatchKey(findIndex, activeMatchKey.current);
      if (preserved >= 0) next = preserved;
    }
    activeMatchKey.current = toMatchKey(next >= 0 ? findIndex.matches[next] ?? null : null);
    lastQuery.current = findIndex.query;
    lastRequestedIndex.current = next;
    setActiveIndex(next);
    onConversationFindMatchStateChange?.({ matchCount: findIndex.matchCount, activeIndex: next });
  }, [conversationFindActiveIndex, findIndex, findEnabled, onConversationFindMatchStateChange]);
  React.useEffect(() => {
    if (!findEnabled || !findIndex.query || !canLoadOlder || loadingOlder || rows.length >= FIND_MAX_LOADED_ROWS) return;
    const signature = `${findIndex.query}:${rows[0]?.rowId ?? `none`}:${rows.length}`;
    if (lastLoadOlderSignature.current !== signature) {
      lastLoadOlderSignature.current = signature;
      onLoadOlder?.();
    }
  }, [canLoadOlder, findIndex.query, findEnabled, loadingOlder, onLoadOlder, rows]);
  React.useEffect(() => {
    if (!findIndex.query || !findEnabled || !activeMatch) return;
    const signature = `${findIndex.query}:${activeMatch.rowId}:${activeMatch.rowMatchIndex}:${activeMatch.unitIndex}`;
    if (lastFindSignature.current !== signature) {
      lastFindSignature.current = signature;
      scrollToUnit(activeMatch.unitIndex);
    }
  }, [activeMatch, findIndex.query, findEnabled, scrollToUnit]);
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root || !findIndex.query || !findEnabled) {
      clearFindHighlights();
      return;
    }
    const frame = window.requestAnimationFrame(() => {
      const range = applyFindHighlights({ root, query: conversationFindQuery, matches: findIndex.matches, activeMatch });
      if (range) scrollRangeToCenter(range);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeMatch, findIndex, conversationFindQuery, findEnabled, mountedRowsKey, rootRef]);
  React.useEffect(() => {
    const request = searchResultHighlightRequest;
    if (!request || !findEnabled || !canLoadOlder || loadingOlder || rows.length >= FIND_MAX_LOADED_ROWS) return;
    const snippet = request.snippet?.trim();
    const covered = snippet ? searchIndex.matches.some((match) => sourceContainsQuery(match.sourceText, snippet)) : searchIndex.matchCount > 0;
    if (!covered) {
      const signature = `${request.requestId}:${rows[0]?.rowId ?? `none`}:${rows.length}`;
      if (lastSearchLoadSignature.current === signature) return;
      lastSearchLoadSignature.current = signature;
      onLoadOlder?.();
    }
  }, [canLoadOlder, findEnabled, loadingOlder, onLoadOlder, rows, searchIndex, searchResultHighlightRequest]);
  React.useEffect(() => {
    const request = searchResultHighlightRequest;
    if (!request || !findEnabled) {
      clearSearchResultHighlight();
      lastSearchRequestId.current = null;
      if (searchClearTimer.current !== undefined) {
        window.clearTimeout(searchClearTimer.current);
        searchClearTimer.current = undefined;
      }
      return;
    }
    const match = findSnippetMatch(searchIndex, request);
    const snippet = request.snippet?.trim();
    const covered = snippet ? searchIndex.matches.some((candidate) => sourceContainsQuery(candidate.sourceText, snippet)) : true;
    const canLoadMore = canLoadOlder && rows.length < FIND_MAX_LOADED_ROWS && !loadingOlder;
    if (snippet && !covered && (canLoadMore || loadingOlder)) return;
    if (!match) {
      if (!canLoadMore) onSearchResultHighlightDone?.(request.requestId);
      return;
    }
    if (lastSearchRequestId.current !== request.requestId) {
      lastSearchRequestId.current = request.requestId;
      scrollToUnit(match.unitIndex);
    }
    const frame = window.requestAnimationFrame(() => {
      const root = rootRef.current;
      if (!root) return;
      const range = applySearchResultHighlight({ root, query: request.query, match });
      if (range) {
        lastSearchRequestId.current = request.requestId;
        scrollRangeToCenter(range);
        if (searchClearTimer.current !== undefined) window.clearTimeout(searchClearTimer.current);
        searchClearTimer.current = window.setTimeout(() => {
          clearSearchResultHighlight();
          onSearchResultHighlightDone?.(request.requestId);
          searchClearTimer.current = undefined;
        }, SEARCH_RESULT_HIGHLIGHT_TTL_MS);
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [canLoadOlder, findEnabled, loadingOlder, mountedRowsKey, onSearchResultHighlightDone, rootRef, rows, scrollToUnit, searchIndex, searchResultHighlightRequest]);
  React.useEffect(
    () => () => {
      clearFindHighlights();
      clearSearchResultHighlight();
      if (searchClearTimer.current !== undefined) window.clearTimeout(searchClearTimer.current);
    },
    [],
  );
}

/* --- 7.1 引用选择浮层（原 ybt/bbt/xbt/Sbt/Cbt/wbt/Tbt，jsx 97503–97620） --- */

/** 原 ybt（jsx 97503）：选区排除目标（控件/对话框/composer dock） */
const SELECTION_EXCLUDE_SELECTOR = [
  `button`,
  `input`,
  `textarea`,
  `[role='button']`,
  `[role='dialog']`,
  `[data-v4-composer-dock]`,
  `[data-conversation-selection-tooltip]`,
].join(`,`);
/** 原 bbt（jsx 97504） */
function isSelectionExcluded(startElement: Element | null | undefined, endElement: Element | null | undefined): boolean {
  return !!(startElement?.closest(SELECTION_EXCLUDE_SELECTOR) || endElement?.closest(SELECTION_EXCLUDE_SELECTOR));
}
/** 原 xbt（jsx 97507）：选区资格判定（>8000 字符只能单条引用） */
function classifySelectionEligibility(checks: {
  enabled: boolean;
  sameRow: boolean;
  insideTimeline: boolean;
  excluded: boolean;
  sameSelectableRegion: boolean;
  supportedContent: boolean;
  text: string;
  hasLayout: boolean;
}): "ineligible" | "single-limit" | "eligible" {
  if (
    !checks.enabled ||
    !checks.sameRow ||
    !checks.insideTimeline ||
    checks.excluded ||
    !checks.sameSelectableRegion ||
    !checks.supportedContent ||
    !checks.text ||
    !checks.hasLayout
  ) {
    return `ineligible`;
  }
  return checks.text.length > 8e3 ? `single-limit` : `eligible`;
}
const SELECTABLE_SELECTOR = `[data-conversation-selectable]`; // Sbt（jsx 97510）
/** 原 Cbt（jsx 97511）：行类型 → 引用内容类型 */
function rowContentType(kind: RowKind): "user" | "assistant" | "reasoning" | "tool" | null {
  if (kind === `userInput`) return `user`;
  if (kind === `assistantText`) return `assistant`;
  if (kind === `reasoning`) return `reasoning`;
  if (kind === `toolCall`) return `tool`;
  return null;
}
/** 原 wbt（jsx 97514）：最近的行元素 */
function closestRowElement(node: Node | null): HTMLElement | null {
  return (node instanceof Element ? node : node?.parentElement)?.closest(`[data-row-id]`) ?? null;
}
/** 原 koe（js 2720）：构建会话引用（加入任务/侧栏提问） */
declare function buildConversationSelectionReference(args: {
  sourceSessionId: string;
  sourceRowId: number;
  contentType: "user" | "assistant" | "reasoning" | "tool";
  text: string;
}): unknown;

/**
 * 会话引用选择浮层（原 Tbt，jsx 97517）。
 * 鼠标选取消息文本后在选区上方浮出「加入当前任务 | 在侧栏提问」两个动作；
 * 超长选区（>8000 字符）只显示限制提示（chat.selections.limit.single）。
 * 选区变化/滚动/窗口缩放自动隐藏；Esc 关闭。
 */
function ConversationSelectionTooltip({
  rootRef,
  rows,
  sourceSessionId,
  enabled,
  sideActionDisabled,
  onAddToCurrentTask,
  onAskInSideChat,
}: {
  rootRef: React.RefObject<HTMLDivElement | null>;
  rows: ConversationRow[];
  sourceSessionId: string;
  enabled: boolean;
  sideActionDisabled: boolean;
  onAddToCurrentTask: (reference: unknown) => void;
  onAskInSideChat: (reference: unknown) => void;
}) {
  const { intl } = useIntlContext();
  const rowsRef = React.useRef(rows);
  rowsRef.current = rows;
  const [tooltip, setTooltip] = React.useState<
    | ({ left: number; top: number } & ({ error: "single" } | { reference: unknown }))
    | null
  >(null);
  const hide = React.useCallback(() => setTooltip(null), []);
  const refresh = React.useCallback(() => {
    if (!enabled) return hide();
    const root = rootRef.current;
    const selection = window.getSelection();
    if (!root || !selection || selection.isCollapsed || selection.rangeCount !== 1) return hide();
    const range = selection.getRangeAt(0);
    const startRow = closestRowElement(range.startContainer);
    const endRow = closestRowElement(range.endContainer);
    if (!startRow || !endRow) return hide();
    const startElement = range.startContainer instanceof Element ? range.startContainer : range.startContainer.parentElement;
    const endElement = range.endContainer instanceof Element ? range.endContainer : range.endContainer.parentElement;
    const excluded = isSelectionExcluded(startElement, endElement);
    const startSelectable = startElement?.closest(SELECTABLE_SELECTOR);
    const endSelectable = endElement?.closest(SELECTABLE_SELECTOR);
    const rowId = Number(startRow.dataset.rowId);
    const row = rowsRef.current.find((candidate) => candidate.rowId === rowId);
    const contentType = row ? rowContentType(row.kind) : null;
    const text = selection.toString().trim();
    const rect = range.getBoundingClientRect();
    const eligibility = classifySelectionEligibility({
      enabled,
      sameRow: startRow === endRow,
      insideTimeline: root.contains(startRow),
      excluded,
      sameSelectableRegion: !!(startSelectable && startSelectable === endSelectable && startRow.contains(startSelectable)),
      supportedContent: contentType !== null,
      text,
      hasLayout: rect.width > 0 || rect.height > 0,
    });
    if (eligibility === `ineligible` || !contentType) return hide();
    const position = {
      left: Math.min(window.innerWidth - 12, Math.max(12, rect.left + rect.width / 2)),
      top: Math.max(12, rect.top - 8),
    };
    if (eligibility === `single-limit`) {
      setTooltip({ ...position, error: `single` });
      return;
    }
    setTooltip({
      ...position,
      reference: buildConversationSelectionReference({ sourceSessionId, sourceRowId: rowId, contentType, text }),
    });
  }, [hide, enabled, rootRef, sourceSessionId]);
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root || !enabled) return;
    const scheduleRefresh = () => window.requestAnimationFrame(refresh);
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === `Escape`) return hide();
      scheduleRefresh();
    };
    const handleSelectionChange = () => {
      if (window.getSelection()?.isCollapsed) hide();
    };
    root.addEventListener(`mouseup`, scheduleRefresh);
    document.addEventListener(`keyup`, handleKeyUp);
    root.addEventListener(`scroll`, hide, { passive: true });
    document.addEventListener(`selectionchange`, handleSelectionChange);
    window.addEventListener(`resize`, hide);
    return () => {
      root.removeEventListener(`mouseup`, scheduleRefresh);
      document.removeEventListener(`keyup`, handleKeyUp);
      root.removeEventListener(`scroll`, hide);
      document.removeEventListener(`selectionchange`, handleSelectionChange);
      window.removeEventListener(`resize`, hide);
    };
  }, [hide, enabled, refresh, rootRef]);
  React.useEffect(() => {
    if (!enabled) hide();
  }, [hide, enabled]);
  if (!tooltip) return null;
  return ReactDOM.createPortal(
    <div
      data-conversation-selection-tooltip="true"
      style={{ left: tooltip.left, top: tooltip.top, transform: `translate(-50%, -100%)` }}
      className="fixed z-50 flex max-w-[min(36rem,calc(100vw-24px))] overflow-hidden rounded-lg border border-popover-border bg-menu text-ui-sm text-foreground shadow-md"
      onMouseDown={(event) => event.preventDefault()}
    >
      {`error` in tooltip && tooltip.error ? (
        <div className="px-2.5 py-1.5 text-[var(--color-warning)]">{intl.formatMessage({ id: `chat.selections.limit.single` })}</div>
      ) : `reference` in tooltip && tooltip.reference ? (
        <>
          <button
            type="button"
            data-conversation-selection-action="add-to-task"
            className="whitespace-nowrap px-2.5 py-1.5 hover:bg-menu-hover"
            onClick={() => {
              onAddToCurrentTask(tooltip.reference);
              hide();
            }}
          >
            {intl.formatMessage({ id: `chat.selections.addToTask` })}
          </button>
          <div className="w-px bg-border" />
          <button
            type="button"
            data-conversation-selection-action="ask-in-side-chat"
            disabled={sideActionDisabled}
            title={sideActionDisabled ? intl.formatMessage({ id: `chat.selections.sideBlocked` }) : undefined}
            className={cn(`whitespace-nowrap px-2.5 py-1.5 hover:bg-menu-hover`, sideActionDisabled && `cursor-not-allowed opacity-50 hover:bg-transparent`)}
            onClick={() => {
              if (!sideActionDisabled) {
                onAskInSideChat(tooltip.reference);
                hide();
              }
            }}
          >
            {intl.formatMessage({ id: `chat.selections.askInSideChat` })}
          </button>
        </>
      ) : null}
    </div>,
    document.body,
  );
}

/* ============================================================================
 * 8. List 子族（虚拟滚动消息列表；js 113940–115525 / jsx 97087–98313）
 * ==========================================================================*/

/* --- 8.1 滚动跟随助手（原 Ryt…Xyt，jsx 97137–97185；纯函数，接口归纳） --- */

interface ScrollMetrics {
  scrollTop: number;
  viewportHeight: number;
  contentHeight: number;
}
/** 原 Ryt（jsx 97137）：距底部像素距离 */
declare function distanceFromBottomOf(metrics: ScrollMetrics): number;
/** 原 T1（jsx 97140）：是否贴底（缺省 48px 阈值） */
/** 原 D1（jsx 97171）：初始跟随态（贴底 → true） */
declare function initialFollowing(): boolean;
/** 原 Byt（jsx 97149）：按滚动来源/位置更新跟随态 */
declare function updateFollowing(args: { following: boolean; source: "user" | "programmatic" | "layout"; metrics: ScrollMetrics }): boolean;
/** 原 E1（jsx 97164）：布局变化后的跟随态校正 */
declare function reconcileFollowing(args: {
  following: boolean;
  metrics: ScrollMetrics;
  lastObservedScrollTop: number;
  userScrollIntent: "none" | "unknown" | "towardBottom" | "awayFromBottom";
}): boolean;
/** 原 Vyt（jsx 97152）：内容宽度变化时的贴底策略 */
declare function resolveStickToBottomAction(following: boolean, contentWidthChanging: boolean): "stickToBottom" | "none";
/** 原 Uyt/Wyt/Gyt（jsx 97155/97158/97161）：滚轮/触摸/键盘 → 滚动意图 */
declare function wheelScrollIntent(deltaY: number): "towardBottom" | "awayFromBottom" | "unknown";
declare function touchScrollIntent(previousY: number, currentY: number): "towardBottom" | "awayFromBottom" | "unknown";
/** 原 Hyt（jsx 97149 附近）：虚拟化尺寸变化时是否允许调整滚动位置 */
declare function shouldAdjustScrollPosition(args: {
  suppressAdjustment: boolean;
  following: boolean;
  contentWidthChanging: boolean;
  itemEnd: number;
  scrollTop: number;
}): boolean;
/** 原 Kyt（jsx 97168）：跟随态变化 → 是否显示回到底部按钮 */
declare function shouldShowBackToBottom(following: boolean, unitCount: number): boolean;
/** 原 Xyt（jsx 97185）：接近顶部 → 预取更早行 */
declare function shouldPrefetchOlder(args: { scrollTop: number; canLoadOlder: boolean; loadingOlder: boolean; triggerPx: number }): boolean;
/** 原 Yyt（jsx 97182）：预取触发距离（按视口高度比例） */
declare function prefetchTriggerPx(viewportHeight: number): number;
/** 原 qyt/Jyt（jsx 97174/97177）：加载更早行后的滚动位置补偿 */
declare function computeLoadOlderScrollDelta(
  anchor: { key: string; offsetTop: number; start: number },
  measured: { key: string; offsetTop: number; start: number },
  scrollTop: number,
): number | null;
declare function computePrependScrollDelta(args: {
  prevFirstRowId: number | null;
  nextFirstRowId: number | null;
  prevTotalSize: number;
  nextTotalSize: number;
}): number | null;

/* --- 8.2 单元尺寸缓存（原 Lyt，js 113965 / jsx 97112） --- */

const UNIT_SIZE_CACHE_LIMIT = 4e3; // Iyt（jsx 97111）

/**
 * 轮单元高度缓存（原 Lyt）：LRU（插入序淘汰，上限 4000）。
 * 虚拟化 estimateSize 的先验：已测高度优先，缺省 72px。
 */
class UnitSizeCache {
  private sizes = new Map<string, number>();
  constructor(private maxEntries: number = UNIT_SIZE_CACHE_LIMIT) {}
  get size(): number {
    return this.sizes.size;
  }
  set(key: string, height: number): void {
    if (!Number.isFinite(height) || height <= 0) return;
    this.sizes.delete(key);
    this.sizes.set(key, height);
    while (this.sizes.size > this.maxEntries) {
      const oldest = this.sizes.keys().next();
      if (oldest.done) break;
      this.sizes.delete(oldest.value);
    }
  }
  get(key: string): number | undefined {
    return this.sizes.get(key);
  }
  estimate(key: string | undefined, fallback = 72): number {
    return key === undefined ? fallback : this.sizes.get(key) ?? fallback;
  }
  clear(): void {
    this.sizes.clear();
  }
}

/* --- 8.3 列表常量与小件（原 Ebt…Mbt/Fbt/Ibt/Lbt/R1，jsx 97620–97659） --- */

const LIST_OVERSCAN = 8; // Ebt
const RUNNING_TICK_MS = 1e3; // Dbt：运行中每 1s 触发重渲染（时长/加载态）
const CONTENT_COLUMN_BASE_PX = 24; // Obt
const COMPOSER_DOCK_FADE_START_PX = 96; // kbt
const SCROLL_INTENT_TTL_MS = 1200; // Abt
const SCROLL_PROGRAMMATIC_GUARD_MS = 250; // jbt
const TURN_NAVIGATOR_MIN_WIDTH_PX = 120; // Mbt

/** 原 Nbt（jsx 97627）：queueMicrotask 兜底 */
function scheduleMicrotask(callback: () => void) {
  if (typeof globalThis.queueMicrotask == `function`) {
    globalThis.queueMicrotask(callback);
    return;
  }
  Promise.resolve().then(callback);
}
/** 原 Pbt（jsx 97634）：可编辑目标（键盘意图判定时排除） */
function isEditableElement(target: EventTarget | null): boolean {
  return target instanceof HTMLElement
    ? target.isContentEditable || target.tagName === `INPUT` || target.tagName === `TEXTAREA` || target.tagName === `SELECT`
    : false;
}

/**
 * 回到底部按钮（原 Fbt，js 114596 / jsx 97637）：圆形 ⌄ 按钮（chat.scrollToBottom）。
 */
function ScrollToBottomButton({ className, label, onClick }: { className?: string; label: string; onClick: () => void }) {
  return (
    <Button
      aria-label={label}
      title={label}
      type="button"
      size="icon"
      variant="outline"
      className={cn(`rounded-full bg-card hover:bg-card-selected`, className)}
      data-testid="v4-scroll-to-bottom"
      onClick={onClick}
    >
      <IconArrowDownToLine className="size-4" />
    </Button>
  );
}

/**
 * 滚动记忆桥（原 Ibt，js 114609 / jsx 97644）：class 组件，
 * 在 scopeKey（会话+分屏）切换前捕获滚动位置、切换后提交恢复。
 */
class ScrollMemoryBridge extends React.Component<{
  scopeKey: string;
  capture: (previousScopeKey: string) => unknown;
  commit: (snapshot: unknown) => void;
}> {
  getSnapshotBeforeUpdate(previousProps: { scopeKey: string }): unknown {
    return previousProps.scopeKey === this.props.scopeKey ? null : this.props.capture(previousProps.scopeKey);
  }
  componentDidUpdate(_prevProps: unknown, _prevState: unknown, snapshot: unknown): void {
    this.props.commit(snapshot);
  }
  render(): React.ReactNode {
    return null;
  }
}

/** 原 Lbt（jsx 97655）：ResizeObserver borderBoxSize → 行高 */
function measureUnitHeight(element: HTMLElement, entry?: ResizeObserverEntry): number {
  const borderBox = entry?.borderBoxSize?.[0];
  return Math.round(borderBox ? borderBox.blockSize : element.getBoundingClientRect().height);
}
/** 原 R1（jsx 97659）：虚拟化 getItemKey */
function unitKey(unit: { key: string } | undefined): string | undefined {
  return unit?.key;
}

/** 滚动记忆读写（原 cUe/ut，横切层）：按 scrollMemoryKey 持久化 pinnedToBottom/offset */
declare function readScrollMemory(scopeKey: string | null): { wasPinnedToBottom?: boolean; scrollTop?: number } | null;
declare function writeScrollMemory(snapshot: unknown): void;
/** 原 Gct/Hct（jsx 84997/84988）：摘要面板布局 → 内容列类名/宽度 */
declare function resolveSummaryPanelContentClass(layout: "none" | "inline" | "auto"): string;
declare function resolveSummaryPanelEmptyLayout(args: { centeredEmptyLayout: boolean }): string;
/** 原 oNe（jsx 附近）：冷快照首 turn 不完整判定 */
declare function shouldAutoLoadOlderOnColdSnapshot(snapshot: SessionSnapshot | null, loadingOlder: boolean): boolean;

/* --- 8.4 消息列表（原 Rbt/zbt，js 114627/115525 / jsx 97662/98313） --- */

interface MessageListProps {
  rows: ConversationRow[];
  apiRetry?: { attempt: number; maxAttempts: number; reasonCode?: string } | null;
  totalCount: number;
  sessionKey: string;
  scrollMemoryKey?: string | null;
  rowContext: RowRenderContext;
  onFork?: (target: { rowId: number; entityId: string }) => void;
  onRetry?: (target: { rowId: number; entityId: string }) => void;
  onFeedbackChange?: (target: { rowId: number; entityId: string }, feedback: RowFeedback) => Promise<boolean> | boolean;
  onEdit?: RowRendererProps["onEdit"];
  canLoadOlder?: boolean;
  loadingOlder?: boolean;
  onLoadOlder?: () => void;
  onLoadAllOlder?: () => Promise<{ status: "hydrated" | "not-enough-queries" | "stale" | string; logEpoch?: string }>;
  turnNavigatorDirectoryRevision?: number;
  bottomDock?: React.ReactNode;
  emptyState?: React.ReactNode;
  centerEmptyStateWithDock?: boolean;
  compactEmptyStateWithDock?: boolean;
  summaryPanelLayout?: "none" | "inline" | "auto";
  conversationFindQuery?: string;
  conversationFindActiveIndex?: number;
  onConversationFindMatchStateChange?: (state: { matchCount: number; activeIndex: number }) => void;
  searchResultHighlightRequest?: { requestId: string; query: string; snippet?: string; snippetIndex?: number } | null;
  onSearchResultHighlightDone?: (requestId: string) => void;
  sessionPhase?: string;
  scrollToBottomActionRef?: React.MutableRefObject<(() => void) | null>;
  selectionActions?: {
    enabled: boolean;
    sideActionDisabled: boolean;
    onAddToCurrentTask: (reference: unknown) => void;
    onAskInSideChat: (reference: unknown) => void;
  };
}

/**
 * 会话消息列表（原 Rbt，js 114627 / jsx 97662；memo 名 zbt，js 115525 / jsx 98313）。
 * 结构（自外而内）：
 *   relative 容器
 *   ├─ Tbt 选区引用浮层（selectionActions 存在时）
 *   ├─ Ibt 滚动记忆桥
 *   ├─ iyt 轮导航刻度条（左侧）
 *   └─ 滚动视口（data-v4-timeline-scroll，@tanstack/react-virtual 虚拟化）
 *       ├─ 空态（居中/紧凑两式）
 *       ├─ 虚拟化历史层：绝对定位的 TurnSection（translateY）
 *       ├─ 运行中活尾（非虚拟化，流式追加）
 *       └─ composer dock（sticky bottom，含回到底部按钮）
 * 关键行为：
 *   - 跟随态（following）：贴底时新内容自动滚动；用户上滚即脱离，出现回到底部按钮；
 *   - 滚动意图识别：滚轮/触摸/键盘/程序化四来源，1.2s 内有效；
 *   - 加载更早行：接近顶部按视口比例触发；加载后按锚点补偿 scrollTop 不跳动；
 *   - 目录补齐：≥864px 且可加载更早时自动 loadAllOlder（250ms/1s 两次重试）；
 *   - 内容列宽度随摘要面板布局（none/inline/auto）过渡（150ms）；
 *   - 消息层底部渐隐遮罩（mask-image，dock 上方 96px 渐隐）。
 */
function ConversationMessageListImpl({
  rows,
  apiRetry = null,
  totalCount,
  sessionKey,
  scrollMemoryKey = null,
  rowContext,
  onFork,
  onRetry,
  onFeedbackChange,
  onEdit,
  canLoadOlder = false,
  loadingOlder = false,
  onLoadOlder,
  onLoadAllOlder,
  turnNavigatorDirectoryRevision = 0,
  bottomDock,
  emptyState,
  centerEmptyStateWithDock = false,
  compactEmptyStateWithDock = false,
  summaryPanelLayout = `none`,
  conversationFindQuery = ``,
  conversationFindActiveIndex = -1,
  onConversationFindMatchStateChange,
  searchResultHighlightRequest,
  onSearchResultHighlightDone,
  sessionPhase,
  scrollToBottomActionRef,
  selectionActions,
}: MessageListProps) {
  const { intl } = useIntlContext();
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const [nowMs, setNowMs] = React.useState(() => Date.now());
  const renderUnits = React.useMemo(() => buildRenderUnits(rows, { nowMs, sessionPhase }), [nowMs, rows, sessionPhase]);
  const { virtualizedUnits, liveUnit, liveUnitIndex } = React.useMemo(() => splitVirtualizedUnits(renderUnits), [renderUnits]);
  const anyRunning = React.useMemo(() => renderUnits.some((unit) => unit.isRunning), [renderUnits]);
  const realUserRowIds = React.useMemo(
    () => new Set(renderUnits.flatMap((unit) => unit.visibleUserInputs.filter((input) => input.origin === `realUser`).map((input) => input.rowId))),
    [renderUnits],
  );
  const realUserRowIdsRef = React.useRef(realUserRowIds);
  realUserRowIdsRef.current = realUserRowIds;
  const centeredEmptyLayout = centerEmptyStateWithDock && renderUnits.length === 0;
  const compactEmptyLayout = centeredEmptyLayout && !compactEmptyStateWithDock;
  const rowsRef = React.useRef(rows);
  rowsRef.current = rows;
  const unitsRef = React.useRef(renderUnits);
  unitsRef.current = renderUnits;
  const virtualizedUnitsRef = React.useRef(virtualizedUnits);
  virtualizedUnitsRef.current = virtualizedUnits;
  const liveUnitRef = React.useRef<HTMLDivElement | null>(null);
  const messageLayerRef = React.useRef<HTMLDivElement | null>(null);
  const contentColumnRef = React.useRef<HTMLDivElement | null>(null);
  const widthProbeRef = React.useRef<HTMLDivElement | null>(null);
  const widthChangingRef = React.useRef(false);
  const lastContentColumnWidth = React.useRef<number | null>(null);
  const loadOlderRef = React.useRef({ canLoadOlder, loadingOlder, onLoadOlder });
  loadOlderRef.current = { canLoadOlder, loadingOlder, onLoadOlder };
  const followingRef = React.useRef(initialFollowing());
  const scrollIntentRef = React.useRef<{ intent: "none" | "unknown" | "towardBottom" | "awayFromBottom"; observedAt: number }>({
    intent: `none`,
    observedAt: 0,
  });
  const touchYRef = React.useRef<number | null>(null);
  const pointerIdRef = React.useRef<number | null>(null);
  const programmaticGuardUntil = React.useRef(0);
  const userScrolledRef = React.useRef(false);
  const suppressScrollAdjustRef = React.useRef(false);
  const lastObservedScrollTop = React.useRef(0);
  const prependAnchorRef = React.useRef<{ firstRowId: number | null; totalSize: number }>({ firstRowId: null, totalSize: 0 });
  const loadOlderAnchorRef = React.useRef<{ key: string; offsetTop: number; start: number } | null>(null);
  const sizeCacheRef = React.useRef<UnitSizeCache | null>(null);
  if (sizeCacheRef.current === null) sizeCacheRef.current = new UnitSizeCache();
  const [showBackToBottom, setShowBackToBottom] = React.useState(false);
  const [viewportState, setViewportState] = React.useState({ scrollOffsetPx: 0, viewportHeightPx: 0, activeQueryRowId: undefined as number | undefined });
  const [containerWidthPx, setContainerWidthPx] = React.useState(0);
  const measureFrameRef = React.useRef<number | null>(null);
  const hydrateRef = React.useRef({ attemptCount: 0, key: null as string | null, retryTimer: null as number | null, status: `idle` as string });
  const [hydrateRetryEpoch, triggerHydrateRetry] = React.useState(0);
  const widthProbeElement = widthProbeRef.current;
  const contentColumnClass = resolveSummaryPanelContentClass(summaryPanelLayout);
  const emptyLayoutClass = resolveSummaryPanelEmptyLayout({ centeredEmptyLayout });

  /* 运行中每秒刷新（时长/状态） */
  React.useEffect(() => {
    if (!anyRunning) return;
    setNowMs(Date.now());
    const timer = window.setInterval(() => setNowMs(Date.now()), RUNNING_TICK_MS);
    return () => window.clearInterval(timer);
  }, [anyRunning]);

  /* 容器宽度测量（轮导航显隐依赖 ≥864px） */
  React.useLayoutEffect(() => {
    const element = widthProbeElement;
    if (!element) return;
    const apply = (width: number) => {
      const rounded = Math.max(0, Math.round(width));
      setContainerWidthPx((previous) => (previous === rounded ? previous : rounded));
    };
    const measure = () => apply(element.clientWidth);
    measure();
    if (typeof ResizeObserver < `u`) {
      const observer = new ResizeObserver((entries) => {
        const entry = entries[0];
        const width = entry?.borderBoxSize?.[0];
        apply(width?.inlineSize ?? entry?.contentRect.width ?? element.clientWidth);
      });
      observer.observe(element);
      return () => observer.disconnect();
    }
    window.addEventListener(`resize`, measure);
    return () => window.removeEventListener(`resize`, measure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* 轮导航目录补齐（全量历史）：250ms/1s 两次重试后终态 */
  React.useEffect(() => {
    if (
      !shouldHydrateFullHistory({
        canLoadOlder,
        containerWidthPx,
        hasLoadHandler: !!onLoadAllOlder,
        loadingOlder,
      })
    ) {
      return;
    }
    const hydrateKey = `${sessionKey}:${rowContext.logEpoch ?? `unknown`}:${turnNavigatorDirectoryRevision}`;
    const state = hydrateRef.current;
    if (state.key !== hydrateKey) {
      if (state.retryTimer !== null) window.clearTimeout(state.retryTimer);
      Object.assign(state, { attemptCount: 0, key: hydrateKey, retryTimer: null, status: `idle` });
    }
    if (state.status !== `idle` || !onLoadAllOlder) return;
    state.status = `in-flight`;
    logger.debug(`[v4-turn-navigator] 目录请求补齐完整历史`, {
      attempt: state.attemptCount + 1,
      loadedRows: rows.length,
      sessionKey,
      totalRows: totalCount,
    });
    onLoadAllOlder().then((result) => {
      if (state.key !== hydrateKey) return;
      if (result.status === `hydrated` || result.status === `not-enough-queries`) {
        state.status = `terminal`;
        return;
      }
      if (result.status === `stale`) {
        state.status = `idle`;
        return;
      }
      state.attemptCount += 1;
      const delay = hydrateRetryDelayMs(state.attemptCount);
      if (delay === null) {
        state.status = `terminal`;
        return;
      }
      state.status = `waiting`;
      state.retryTimer = window.setTimeout(() => {
        if (state.key === hydrateKey) {
          state.retryTimer = null;
          state.status = `idle`;
          triggerHydrateRetry((epoch) => epoch + 1);
        }
      }, delay);
    });
  }, [canLoadOlder, loadingOlder, onLoadAllOlder, rowContext.logEpoch, rows, sessionKey, totalCount, containerWidthPx, turnNavigatorDirectoryRevision, hydrateRetryEpoch]);
  React.useEffect(
    () => () => {
      const timer = hydrateRef.current.retryTimer;
      if (timer !== null) window.clearTimeout(timer);
    },
    [],
  );

  /* 虚拟化（@tanstack/react-virtual） */
  const getScrollElement = React.useCallback(() => scrollRef.current, []);
  const getItemKey = React.useCallback((index: number) => virtualizedUnitsRef.current[index]?.key ?? index, []);
  const estimateSize = React.useCallback(
    (index: number) => sizeCacheRef.current?.estimate(unitKey(virtualizedUnitsRef.current[index]), 72) ?? 72,
    [],
  );
  const measureElement = React.useCallback((element: HTMLElement, entry?: ResizeObserverEntry) => {
    const height = measureUnitHeight(element, entry);
    const dataIndex = element.getAttribute(`data-index`);
    const key = dataIndex === null ? undefined : unitKey(virtualizedUnitsRef.current[Number(dataIndex)]);
    if (key !== undefined) sizeCacheRef.current?.set(key, height);
    return height;
  }, []);
  const virtualizer = useMessageListVirtualizer({
    count: virtualizedUnits.length,
    getScrollElement,
    estimateSize,
    overscan: LIST_OVERSCAN,
    getItemKey,
    measureElement,
  });
  virtualizer.shouldAdjustScrollPositionOnItemSizeChange = (item: { end: number }) =>
    shouldAdjustScrollPosition({
      suppressAdjustment: suppressScrollAdjustRef.current,
      following: followingRef.current,
      contentWidthChanging: isContentColumnWidthChanging(),
      itemEnd: item.end,
      scrollTop: scrollRef.current?.scrollTop ?? 0,
    });
  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();
  const navigatorVirtualItems = React.useMemo(() => {
    const items = virtualItems.map((item) => ({ index: item.index, size: item.size, start: item.start }));
    return liveUnitIndex === null ? items : [...items, { index: liveUnitIndex, start: totalSize, size: 2 ** 53 - 1 - totalSize }];
  }, [liveUnitIndex, totalSize, virtualItems]);
  const mountedRowsKey = React.useMemo(
    () => [...virtualItems.map((item) => String(item.key)), ...(liveUnit === null ? [] : [String(liveUnit.key)])].join(`:`),
    [liveUnit, virtualItems],
  );

  function isContentColumnWidthChanging(): boolean {
    const probed = widthProbeRef.current?.clientWidth ?? null;
    return widthChangingRef.current || (probed !== null && lastContentColumnWidth.current !== null && probed !== lastContentColumnWidth.current);
  }

  /* 滚动意图与跟随态 */
  const scheduleMeasureFrame = React.useCallback(() => {
    if (measureFrameRef.current !== null) window.cancelAnimationFrame(measureFrameRef.current);
    measureFrameRef.current = window.requestAnimationFrame(() => {
      measureFrameRef.current = null;
    });
  }, []);
  const setFollowing = React.useCallback((next: boolean) => {
    if (followingRef.current === next) return;
    followingRef.current = next;
    setShowBackToBottom(shouldShowBackToBottom(next, unitsRef.current.length));
  }, []);
  const clearScrollIntent = React.useCallback(() => {
    scrollIntentRef.current = { intent: `none`, observedAt: 0 };
    touchYRef.current = null;
    pointerIdRef.current = null;
  }, []);
  const readScrollIntent = React.useCallback(() => {
    const state = scrollIntentRef.current;
    if (touchYRef.current !== null || pointerIdRef.current !== null) return state.intent === `none` ? `unknown` : state.intent;
    return Date.now() - state.observedAt <= SCROLL_INTENT_TTL_MS ? state.intent : `none`;
  }, []);
  const markProgrammaticScroll = React.useCallback(() => {
    programmaticGuardUntil.current = Date.now() + SCROLL_PROGRAMMATIC_GUARD_MS;
  }, []);
  const observeScrollIntent = React.useCallback(
    (intent: "none" | "unknown" | "towardBottom" | "awayFromBottom") => {
      if (intent === `none`) return;
      scrollIntentRef.current = { intent, observedAt: Date.now() };
      const scroller = scrollRef.current;
      if (intent === `awayFromBottom` && scroller && scroller.scrollHeight > scroller.clientHeight) setFollowing(false);
    },
    [setFollowing],
  );
  const handleWheelCapture = React.useCallback(
    (event: React.WheelEvent) => {
      observeScrollIntent(wheelScrollIntent(event.deltaY));
    },
    [observeScrollIntent],
  );
  const handleTouchStartCapture = React.useCallback((event: React.TouchEvent) => {
    touchYRef.current = event.touches[0]?.clientY ?? null;
  }, []);
  const handleTouchMoveCapture = React.useCallback(
    (event: React.TouchEvent) => {
      const currentY = event.touches[0]?.clientY;
      const previousY = touchYRef.current;
      if (currentY === undefined || previousY === null) return;
      observeScrollIntent(touchScrollIntent(previousY, currentY));
      touchYRef.current = currentY;
    },
    [observeScrollIntent],
  );
  const handleTouchEndCapture = React.useCallback(() => {
    touchYRef.current = null;
  }, []);
  const handleKeyDownCapture = React.useCallback(
    (event: React.KeyboardEvent) => {
      observeScrollIntent(keyScrollIntent({ key: event.key, shiftKey: event.shiftKey, editableTarget: isEditableElement(event.target) }));
    },
    [observeScrollIntent],
  );
  const handlePointerDownCapture = React.useCallback(
    (event: React.PointerEvent) => {
      if (event.target === event.currentTarget) {
        pointerIdRef.current = event.pointerId;
        observeScrollIntent(`unknown`);
      }
    },
    [observeScrollIntent],
  );
  const handlePointerUpCapture = React.useCallback((event: React.PointerEvent) => {
    if (pointerIdRef.current === event.pointerId) pointerIdRef.current = null;
  }, []);

  /* 消息层底部渐隐遮罩 + 导航视口状态 */
  const applyFadeMask = React.useCallback((scroller: HTMLDivElement) => {
    const layer = messageLayerRef.current;
    if (!layer) return;
    if (
      isNearBottom({
        scrollTop: scroller.scrollTop,
        viewportHeight: scroller.clientHeight,
        contentHeight: scroller.scrollHeight,
      })
    ) {
      layer.style.maskImage = `none`;
      layer.style.webkitMaskImage = `none`;
      return;
    }
    const viewportHeight = scroller.clientHeight;
    const fadeEnd = Math.max(0, viewportHeight - COMPOSER_DOCK_FADE_START_PX);
    const fadeStart = Math.max(0, fadeEnd - CONTENT_COLUMN_BASE_PX);
    const offsetInLayer = Math.max(0, scroller.scrollTop - layer.offsetTop);
    const mask = `linear-gradient(to bottom, black 0, black ${fadeStart}px, transparent ${fadeEnd}px, transparent 100%)`;
    layer.style.maskImage = mask;
    layer.style.webkitMaskImage = mask;
    layer.style.maskPosition = `0 ${offsetInLayer}px`;
    layer.style.webkitMaskPosition = `0 ${offsetInLayer}px`;
    layer.style.maskSize = `100% ${viewportHeight}px`;
    layer.style.webkitMaskSize = `100% ${viewportHeight}px`;
  }, []);
  const refreshViewportState = React.useCallback(
    (scroller: HTMLDivElement) => {
      applyFadeMask(scroller);
      const layerRect = scroller.getBoundingClientRect();
      const positions: { rowId: number; start: number; end: number }[] = [];
      for (const rowElement of scroller.querySelectorAll(`[data-row-id]`)) {
        const rowId = Number((rowElement as HTMLElement).dataset.rowId);
        if (!Number.isSafeInteger(rowId) || !realUserRowIdsRef.current.has(rowId)) continue;
        const rect = rowElement.getBoundingClientRect();
        const start = scroller.scrollTop + rect.top - layerRect.top;
        positions.push({ rowId, start, end: start + rect.height });
      }
      const next = {
        scrollOffsetPx: scroller.scrollTop,
        viewportHeightPx: scroller.clientHeight,
        activeQueryRowId: findActiveQueryRow({ positions, scrollOffsetPx: scroller.scrollTop, viewportHeightPx: scroller.clientHeight }),
      };
      setViewportState((previous) =>
        previous.scrollOffsetPx === next.scrollOffsetPx && previous.viewportHeightPx === next.viewportHeightPx && previous.activeQueryRowId === next.activeQueryRowId
          ? previous
          : next,
      );
    },
    [applyFadeMask],
  );
  React.useLayoutEffect(() => {
    const scroller = scrollRef.current;
    const layer = messageLayerRef.current;
    if (!scroller || !layer) return;
    const update = () => applyFadeMask(scroller);
    update();
    if (typeof ResizeObserver < `u`) {
      const observer = new ResizeObserver(update);
      observer.observe(scroller);
      observer.observe(layer);
      return () => observer.disconnect();
    }
    window.addEventListener(`resize`, update);
    return () => window.removeEventListener(`resize`, update);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applyFadeMask, renderUnits.length === 0]);

  /* 滚动主处理 */
  const handleScroll = React.useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const scroller = event.currentTarget;
      if (!scroller) return;
      const nearPrevious = lastObservedScrollTop.current !== null && Math.abs(scroller.scrollTop - lastObservedScrollTop.current) < 1;
      const rawIntent = readScrollIntent();
      const source =
        rawIntent === `none` ? (nearPrevious ? `programmatic` : Date.now() <= programmaticGuardUntil.current ? `layout` : `user`) : `user`;
      if (source !== `layout`) suppressScrollAdjustRef.current = false;
      lastObservedScrollTop.current = scroller.scrollTop;
      refreshViewportState(scroller);
      setFollowing(
        updateFollowing({
          following: followingRef.current,
          source,
          metrics: { scrollTop: scroller.scrollTop, viewportHeight: scroller.clientHeight, contentHeight: scroller.scrollHeight },
        }),
      );
      if (source === `user`) {
        userScrolledRef.current = true;
        scheduleMeasureFrame();
      }
      const loadState = loadOlderRef.current;
      const triggerPx = prefetchTriggerPx(scroller.clientHeight);
      if (shouldPrefetchOlder({ scrollTop: scroller.scrollTop, canLoadOlder: loadState.canLoadOlder, loadingOlder: loadState.loadingOlder, triggerPx })) {
        const virtualItem = virtualizer.getVirtualItemForOffset(scroller.scrollTop);
        const unit = virtualItem ? virtualizedUnitsRef.current[virtualItem.index] : undefined;
        loadOlderAnchorRef.current =
          virtualItem && unit && unitKey(unit) === virtualItem.key ? { key: unit.key, offsetTop: virtualItem.start - scroller.scrollTop, start: virtualItem.start } : null;
        logger.debug(`[v4-timeline] 接近历史窗口顶部，自动预取更早行`, {
          scrollTop: scroller.scrollTop,
          triggerPx,
        });
        loadState.onLoadOlder?.();
      }
    },
    [setFollowing, readScrollIntent, scheduleMeasureFrame, refreshViewportState, virtualizer],
  );
  const scrollToBottom = React.useCallback(() => {
    clearScrollIntent();
    setFollowing(true);
    const scroller = scrollRef.current;
    if (scroller) scroller.scrollTop = scroller.scrollHeight;
  }, [clearScrollIntent, setFollowing]);
  React.useLayoutEffect(() => {
    if (scrollToBottomActionRef) {
      scrollToBottomActionRef.current = scrollToBottom;
      return () => {
        if (scrollToBottomActionRef.current === scrollToBottom) scrollToBottomActionRef.current = null;
      };
    }
    return undefined;
  }, [scrollToBottom, scrollToBottomActionRef]);

  /* 轮导航点击定位（含未挂载行的 rAF 重试，最多 12 帧） */
  const jumpToQuery = React.useCallback(
    (target: { unitIndex: number; rowId: number }, behavior: "auto" | "smooth" = `auto`) => {
      clearScrollIntent();
      setFollowing(false);
      if (measureFrameRef.current !== null) {
        window.cancelAnimationFrame(measureFrameRef.current);
        measureFrameRef.current = null;
      }
      const tryLocate = (scroller: HTMLDivElement): boolean => {
        const rowElement = scroller.querySelector(`[data-row-id="${target.rowId}"]`);
        if (!rowElement) return false;
        const offset = scroller.scrollTop + rowElement.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
        if (behavior === `auto`) {
          scroller.scrollTop = offset;
        } else {
          scroller.scrollTo({ top: offset, behavior });
        }
        lastObservedScrollTop.current = scroller.scrollTop;
        refreshViewportState(scroller);
        logger.debug(`[v4-turn-navigator] 定位用户 query`, { behavior, rowId: target.rowId, unitIndex: target.unitIndex });
        return true;
      };
      const scroller = scrollRef.current;
      if (!scroller || tryLocate(scroller)) return;
      if (target.unitIndex === liveUnitIndex) {
        const liveElement = liveUnitRef.current;
        if (liveElement) {
          scroller.scrollTop = scroller.scrollTop + liveElement.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
        }
      } else {
        virtualizer.scrollToIndex(target.unitIndex, { align: `start`, behavior: `auto` });
      }
      let remainingAttempts = 12;
      const retry = () => {
        measureFrameRef.current = null;
        const current = scrollRef.current;
        if (current && tryLocate(current)) return;
        remainingAttempts -= 1;
        if (remainingAttempts <= 0) {
          logger.warn(`[v4-turn-navigator] query 锚点挂载超时`, { rowId: target.rowId, unitIndex: target.unitIndex });
          return;
        }
        measureFrameRef.current = window.requestAnimationFrame(retry);
      };
      measureFrameRef.current = window.requestAnimationFrame(retry);
    },
    [clearScrollIntent, setFollowing, liveUnitIndex, refreshViewportState, virtualizer],
  );
  React.useEffect(
    () => () => {
      if (measureFrameRef.current !== null) {
        window.cancelAnimationFrame(measureFrameRef.current);
        measureFrameRef.current = null;
      }
    },
    [sessionKey],
  );

  /* 查找/搜索高亮接线（§7） */
  useConversationFind({
    rootRef: scrollRef,
    renderUnits,
    rows,
    mountedRowsKey,
    canLoadOlder,
    loadingOlder,
    onLoadOlder,
    sessionPhase,
    conversationFindQuery,
    conversationFindActiveIndex,
    onConversationFindMatchStateChange,
    searchResultHighlightRequest,
    onSearchResultHighlightDone,
    scrollToUnit: React.useCallback(
      (unitIndex: number, behavior: "auto" | "smooth" = `auto`) => {
        clearScrollIntent();
        setFollowing(false);
        if (unitIndex === liveUnitIndex) {
          const scroller = scrollRef.current;
          const liveElement = liveUnitRef.current;
          if (!scroller || !liveElement) return;
          const offset = scroller.scrollTop + liveElement.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
          if (behavior === `auto`) {
            scroller.scrollTop = offset;
          } else {
            scroller.scrollTo({ top: offset, behavior });
          }
          lastObservedScrollTop.current = scroller.scrollTop;
          refreshViewportState(scroller);
          return;
        }
        virtualizer.scrollToIndex(unitIndex, { align: `start`, behavior });
      },
      [clearScrollIntent, setFollowing, liveUnitIndex, refreshViewportState, virtualizer],
    ),
  });

  /* 会话切换：清缓存、恢复滚动记忆（贴底或偏移） */
  const restoreScrollMemory = React.useCallback(
    (snapshot: unknown) => {
      writeScrollMemory(snapshot);
    },
    [],
  );
  const captureScrollMemory = React.useCallback((_previousScopeKey: string) => {
    const scroller = scrollRef.current;
    return scroller ? { wasPinnedToBottom: followingRef.current, scrollTop: scroller.scrollTop } : null;
  }, []);
  const unitCount = renderUnits.length;
  React.useLayoutEffect(() => {
    clearScrollIntent();
    sizeCacheRef.current?.clear();
    prependAnchorRef.current = { firstRowId: null, totalSize: 0 };
    loadOlderAnchorRef.current = null;
    suppressScrollAdjustRef.current = true;
    virtualizer.measure();
    userScrolledRef.current = false;
    const memory = readScrollMemory(scrollMemoryKey);
    const applyMemory = () => {
      if (!memory || memory.wasPinnedToBottom === true) {
        suppressScrollAdjustRef.current = false;
        followingRef.current = initialFollowing();
        setShowBackToBottom(false);
        scrollToBottom();
        return;
      }
      restoreScrollMemory(memory);
    };
    applyMemory();
    let secondFrame: number | null = null;
    const firstFrame = window.requestAnimationFrame(() => {
      if (!userScrolledRef.current) applyMemory();
      secondFrame = window.requestAnimationFrame(() => {
        suppressScrollAdjustRef.current = false;
      });
    });
    return () => {
      window.cancelAnimationFrame(firstFrame);
      if (secondFrame !== null) window.cancelAnimationFrame(secondFrame);
      suppressScrollAdjustRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearScrollIntent, restoreScrollMemory, scrollMemoryKey, scrollToBottom, sessionKey, virtualizer]);

  /* prepend 补偿：加载更早行后按锚点/总高差修正 scrollTop */
  React.useLayoutEffect(() => {
    const anchor = prependAnchorRef.current;
    const nextFirstRowId = rowsRef.current[0]?.rowId ?? null;
    const nextTotalSize = virtualizer.getTotalSize();
    const prepended = anchor.firstRowId !== null && nextFirstRowId !== null && nextFirstRowId < anchor.firstRowId;
    let delta: number | null = null;
    if (prepended && scrollRef.current) {
      const loadAnchor = loadOlderAnchorRef.current;
      const measured = loadAnchor ? virtualizer.measurementsCache.find((entry: { key: string | number }) => entry.key === loadAnchor.key) : undefined;
      if (loadAnchor && measured) {
        delta = computeLoadOlderScrollDelta(loadAnchor, { key: loadAnchor.key, offsetTop: loadAnchor.offsetTop, start: measured.start }, scrollRef.current.scrollTop);
      }
      loadOlderAnchorRef.current = null;
    }
    delta =
      delta ??
      computePrependScrollDelta({
        prevFirstRowId: anchor.firstRowId,
        nextFirstRowId,
        prevTotalSize: anchor.totalSize,
        nextTotalSize,
      });
    if (delta !== null && scrollRef.current) {
      const scroller = scrollRef.current;
      markProgrammaticScroll();
      scroller.scrollTop += delta;
      lastObservedScrollTop.current = scroller.scrollTop;
      refreshViewportState(scroller);
      scheduleMicrotask(() => {});
    }
    prependAnchorRef.current = { firstRowId: nextFirstRowId, totalSize: nextTotalSize };
  });

  /* 布局变化后的跟随态校正 + 贴底吸附 */
  React.useLayoutEffect(() => {
    const scroller = scrollRef.current;
    markProgrammaticScroll();
    if (scroller) {
      setFollowing(
        reconcileFollowing({
          following: followingRef.current,
          metrics: { scrollTop: scroller.scrollTop, viewportHeight: scroller.clientHeight, contentHeight: scroller.scrollHeight },
          lastObservedScrollTop: lastObservedScrollTop.current,
          userScrollIntent: readScrollIntent(),
        }),
      );
      if (resolveStickToBottomAction(followingRef.current, isContentColumnWidthChanging()) === `stickToBottom`) scrollToBottom();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readScrollIntent, markProgrammaticScroll, setFollowing, unitCount, rows, scrollToBottom]);
  React.useLayoutEffect(() => {
    if (scrollRef.current) refreshViewportState(scrollRef.current);
  }, [unitCount, refreshViewportState]);
  React.useEffect(() => {
    if (unitCount === 0) {
      followingRef.current = initialFollowing();
      if (showBackToBottom) setShowBackToBottom(false);
    }
  }, [unitCount, showBackToBottom]);
  React.useEffect(
    () => () => {
      if (measureFrameRef.current !== null) {
        window.cancelAnimationFrame(measureFrameRef.current);
        measureFrameRef.current = null;
      }
    },
    [],
  );

  return (
    <div ref={widthProbeRef} className="relative flex min-h-0 flex-1 flex-col">
      {selectionActions ? (
        <ConversationSelectionTooltip
          rootRef={scrollRef}
          rows={rows}
          sourceSessionId={sessionKey}
          enabled={selectionActions.enabled}
          sideActionDisabled={selectionActions.sideActionDisabled}
          onAddToCurrentTask={selectionActions.onAddToCurrentTask}
          onAskInSideChat={selectionActions.onAskInSideChat}
        />
      ) : null}
      <ScrollMemoryBridge scopeKey={scrollMemoryKey ?? ``} capture={captureScrollMemory} commit={restoreScrollMemory} />
      <TurnNavigator
        renderUnits={renderUnits}
        isHydratingDirectory={loadingOlder}
        scrollOffsetPx={virtualizer.scrollOffset ?? viewportState.scrollOffsetPx}
        viewportHeightPx={virtualizer.scrollRect?.height ?? viewportState.viewportHeightPx}
        virtualItems={navigatorVirtualItems}
        activeQueryRowId={viewportState.activeQueryRowId}
        onJumpToQuery={jumpToQuery}
      />
      <div
        ref={scrollRef}
        data-testid="v4-conversation-timeline"
        data-v4-timeline-scroll="true"
        data-markdown-table-layout-root="true"
        data-row-count={rows.length}
        data-window-row-count={rows.length}
        data-render-unit-count={renderUnits.length}
        data-total-row-count={totalCount}
        data-following={showBackToBottom ? `false` : `true`}
        data-loading-older={loadingOlder ? `true` : `false`}
        onKeyDownCapture={handleKeyDownCapture}
        onPointerCancelCapture={handlePointerUpCapture}
        onPointerDownCapture={handlePointerDownCapture}
        onPointerUpCapture={handlePointerUpCapture}
        onScroll={handleScroll}
        onTouchCancelCapture={handleTouchEndCapture}
        onTouchEndCapture={handleTouchEndCapture}
        onTouchMoveCapture={handleTouchMoveCapture}
        onTouchStartCapture={handleTouchStartCapture}
        onWheelCapture={handleWheelCapture}
        className={cn(
          `min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable] [--markdown-table-layout-left-inset:16px] [--markdown-table-layout-right-inset:16px] max-md:[--markdown-table-layout-left-inset:8px] max-md:[--markdown-table-layout-right-inset:8px]`,
          containerWidthPx >= 2 && `@min-[864px]/conversation:[--markdown-table-layout-left-inset:48px]`,
        )}
      >
        <div
          className={cn(
            compactEmptyLayout
              ? `flex min-h-full flex-col items-center px-4 before:block before:min-h-[52px] before:w-full before:flex-1 before:content-[''] after:block after:min-h-4 after:w-full after:flex-1 after:content-['']`
              : centeredEmptyLayout
                ? `flex min-h-full flex-col items-center justify-center gap-4 px-4`
                : `flex min-h-full flex-col`,
          )}
          style={{ overflowAnchor: `none` }}
        >
          {renderUnits.length === 0 ? (
            <div className={cn(compactEmptyLayout ? `flex w-full max-w-2xl shrink-0 items-center justify-center` : `min-h-0 flex-1`, !compactEmptyLayout && emptyLayoutClass)}>
              {emptyState}
            </div>
          ) : (
            <div ref={messageLayerRef} data-v4-timeline-message-layer="true" className="relative w-full flex-1 [mask-repeat:no-repeat] [-webkit-mask-repeat:no-repeat]">
              <div
                ref={contentColumnRef}
                data-v4-timeline-virtual-history="true"
                data-v4-timeline-content-column="true"
                className={cn(`relative mx-auto w-full shrink-0 transition-[width,max-width,transform] duration-150 ease-out`, contentColumnClass, emptyLayoutClass)}
                style={{ height: totalSize }}
              >
                {virtualItems.map((virtual) => {
                  const unit = virtualizedUnits[virtual.index];
                  return unit ? (
                    <div
                      key={`${virtual.key}:${rowContext.logEpoch ?? ``}`}
                      ref={virtualizer.measureElement as unknown as React.Ref<HTMLDivElement>}
                      data-index={virtual.index}
                      data-v4-turn-unit="true"
                      data-turn-id={unit.turnId}
                      className="absolute left-0 top-0 w-full"
                      style={{ transform: `translateY(${virtual.start}px)` }}
                    >
                      <TurnSection unit={unit} apiRetry={null} context={rowContext} onFork={onFork} onRetry={onRetry} onFeedbackChange={onFeedbackChange} onEdit={onEdit} />
                    </div>
                  ) : null;
                })}
              </div>
              {liveUnit !== null && liveUnitIndex !== null ? (
                <div
                  key={`${liveUnit.key}:${rowContext.logEpoch ?? ``}`}
                  ref={liveUnitRef}
                  data-index={liveUnitIndex}
                  data-v4-running-live-tail="true"
                  data-v4-turn-unit="true"
                  data-turn-id={liveUnit.turnId}
                  data-v4-timeline-content-column="true"
                  className={cn(`relative mx-auto w-full shrink-0 transition-[width,max-width,transform] duration-150 ease-out`, contentColumnClass, emptyLayoutClass)}
                >
                  <TurnSection unit={liveUnit} apiRetry={apiRetry} context={rowContext} onFork={onFork} onRetry={onRetry} onFeedbackChange={onFeedbackChange} onEdit={onEdit} />
                </div>
              ) : null}
            </div>
          )}
          {bottomDock ? (
            <div
              data-v4-composer-dock="true"
              className={cn(`pointer-events-none z-20 flex w-full justify-center`, compactEmptyLayout ? `mt-3 shrink-0` : centeredEmptyLayout ? `shrink-0` : `sticky bottom-0`)}
            >
              <div
                data-v4-composer-dock-content="true"
                className={cn(`pointer-events-auto relative z-10 w-full shrink-0 transition-[width,max-width,transform] duration-150 ease-out`, contentColumnClass, !centeredEmptyLayout && `px-4 pb-4`, !centeredEmptyLayout && emptyLayoutClass)}
              >
                <div data-v4-back-to-bottom-anchor="composer-dock" className="relative">
                  {showBackToBottom ? (
                    <ScrollToBottomButton
                      className="absolute bottom-full left-1/2 z-30 mb-2 -translate-x-1/2 shadow-sm"
                      label={intl.formatMessage({ id: `chat.scrollToBottom` })}
                      onClick={scrollToBottom}
                    />
                  ) : null}
                  {bottomDock}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      {showBackToBottom && !bottomDock ? (
        <ScrollToBottomButton className="absolute bottom-3 left-1/2 -translate-x-1/2 shadow-sm" label={intl.formatMessage({ id: `chat.scrollToBottom` })} onClick={scrollToBottom} />
      ) : null}
    </div>
  );
}
const ConversationMessageList = React.memo(ConversationMessageListImpl);

/** 列表虚拟化（原 to=useVirtualizer，esm-BY6T6pIH.js；此处按调用面声明） */
declare function useMessageListVirtualizer(opts: {
  count: number;
  getScrollElement: () => HTMLElement | null;
  estimateSize: (index: number) => number;
  overscan: number;
  getItemKey: (index: number) => string | number;
  measureElement: (element: HTMLElement, entry?: ResizeObserverEntry) => number;
}): {
  getVirtualItems(): { index: number; key: string | number; start: number; size: number }[];
  getTotalSize(): number;
  getVirtualItemForOffset(offset: number): { index: number; key: string | number; start: number } | null;
  scrollToIndex(index: number, opts?: { align?: "auto" | "start" | "center" | "end"; behavior?: "auto" | "smooth" }): void;
  measure(): void;
  measureElement: (element: HTMLElement) => void;
  measurementsCache: { key: string | number; start: number }[];
  scrollOffset?: number;
  scrollRect?: { height: number };
  shouldAdjustScrollPositionOnItemSizeChange: (item: { end: number }) => boolean;
};

/* ============================================================================
 * 9. Pane 子族（会话快照/面板头/插件门/会话面板 R0/编排器 PTt）
 * ==========================================================================*/

/* --- 9.1 会话快照（原 k0/TCt，js 118675 / jsx 100917–100933） --- */

interface SessionQueueSnapshot extends QueueState {}
interface SessionSnapshot {
  sessionId: string;
  meta: { title: string };
  rows: { window: ConversationRow[]; totalCount: number };
  queue: SessionQueueSnapshot;
  control: {
    phase: "idle" | "running" | "prewarming" | string;
    canStop: boolean;
    activeWorks: { foregroundExecutionId?: string }[];
    apiRetry: { attempt: number; maxAttempts: number; reasonCode?: string } | null;
    lastError: { code: string; message: string; at: number; traceId?: string; detail?: string } | null;
  };
  config: { provider?: string; model?: string; followupMode?: "queue" | "guide" | null; configOptions?: unknown[]; slashCommands?: unknown[] };
  goal?: unknown;
  plan?: unknown;
  backgroundWorks?: unknown[];
  pendingInteractions: { interactionId: string; payload: { kind: string }; autoResolution?: unknown }[];
  subagents?: { revision: number; childSessionIds: string[]; running: unknown[]; endedTotal: number };
  availability: { pauseGoal: { allowed: boolean }; resumeGoal: { allowed: boolean } };
  logEpoch: string;
  revision: number;
}
/** 原 TCt（jsx 100917）：未连接时的闭合快照 */
const CLOSED_SESSION_STATE = {
  status: `closed`,
  snapshot: null,
  subscriptionId: null,
  lastError: null,
  optimisticCommands: [],
  loadingOlder: false,
  sessionPlans: [],
  planDirectoryRevision: 0,
  plansLoading: false,
  turnNavigatorDirectoryRevision: 0,
} as const;

interface SessionStoreHandle {
  subscribe(listener: () => void): () => void;
  getState(): SessionSubscriptionState;
  retry(): void;
  loadOlder(): void;
  loadAllOlder(): Promise<{ status: string; logEpoch?: string }>;
}
interface SessionSubscriptionState {
  status: "connecting" | "live" | "error" | "closed";
  snapshot: SessionSnapshot | null;
  subscriptionId: string | null;
  lastError: string | null;
  loadingOlder: boolean;
  sessionPlans: unknown[];
  turnNavigatorDirectoryRevision: number;
}

/**
 * 原 k0（js 118675 / jsx 100929）：会话快照订阅（useSyncExternalStore）。
 * store 为空时返回闭合快照（TCt）。
 */
function useSessionSnapshot(handle: { store: SessionStoreHandle } | null): SessionSubscriptionState {
  const store = handle?.store ?? null;
  return React.useSyncExternalStore(
    (onStoreChange) => store?.subscribe(onStoreChange) ?? (() => {}),
    () => store?.getState() ?? (CLOSED_SESSION_STATE as unknown as SessionSubscriptionState),
    () => CLOSED_SESSION_STATE as unknown as SessionSubscriptionState,
  );
}

/** 原 $Ct（jsx 101340）：空子代理目录 */
const EMPTY_SUBAGENT_DIRECTORY = { revision: 0, childSessionIds: [], running: [], endedTotal: 0 };

/** 原 hw（js 39766 / jsx 35820）：窗口首行不属于当前首 turn → 可加载更早 */
declare function canLoadOlderRows(snapshot: SessionSnapshot | null): boolean;

/* --- 9.2 面板浮动头（原 Ait/jit，js 91755/91801 / jsx 79344/79371） --- */

interface WorkspaceBadge {
  label: string;
  workspacePath: string;
  remote?: boolean;
}

/**
 * 面板浮动头（原 Ait，js 91755 / jsx 79344；memo 名 jit，js 91801 / jsx 79371）。
 * 分屏时才出现：左上角浮动 [工作区徽章（远程标记）] [关闭面板]；
 * 标题仅以 sr-only 占位（testid v4-pane-title）。v4Pane.remote / closePane*
 */
const PaneFloatingHeader = React.memo(function PaneFloatingHeader({
  title,
  onClosePane,
  workspaceBadge,
}: {
  title: string;
  onClosePane?: () => void;
  workspaceBadge?: WorkspaceBadge | null;
  /** R0 透传但 Ait 本体不解构（分屏右键/下分由 SplitPaneHost 处理） */
  onSplitRight?: () => void;
  onSplitDown?: () => void;
}) {
  const { intl } = useIntlContext();
  return (
    <>
      <span data-testid="v4-pane-title" data-title={title} className="sr-only" />
      {workspaceBadge || onClosePane ? (
        <div data-v4-pane-actions="floating" className="pointer-events-none absolute left-2 top-2 z-20 flex max-w-[calc(100%-1rem)] items-center gap-1">
          {workspaceBadge ? (
            <span
              data-testid="v4-pane-workspace-badge"
              data-remote={workspaceBadge.remote ? `true` : `false`}
              title={workspaceBadge.workspacePath}
              className="pointer-events-auto flex h-7 max-w-[10rem] shrink items-center gap-1 rounded-md border border-[var(--color-border)] bg-[var(--color-popover)] px-2 font-mono text-ui-base text-[var(--color-foreground-subtle)] shadow-md"
            >
              <span className="truncate">{workspaceBadge.label}</span>
              {workspaceBadge.remote ? <span className="shrink-0">{intl.formatMessage({ id: `v4Pane.remote` })}</span> : null}
            </span>
          ) : null}
          {onClosePane ? (
            <Button
              type="button"
              variant="outline"
              size="icon-md"
              data-testid="v4-pane-close"
              onClick={onClosePane}
              title={intl.formatMessage({ id: `v4Pane.closePaneTitle` })}
              aria-label={intl.formatMessage({ id: `v4Pane.closePane` })}
              className="pointer-events-auto bg-[var(--color-popover)] shadow-md"
            >
              <IconX className={`size-4`} />
            </Button>
          ) : null}
        </div>
      ) : null}
    </>
  );
});

/* --- 9.3 插件图标门（原 Ubt/Wbt，js 115538/115559 / jsx 98326/98347） --- */

/** 原 FV（横切层）：按工作区/会话解析插件清单（authority: session|workspace） */
declare function usePluginManifests(
  workspacePath: string | undefined,
  workspaceIdentity: string | null | undefined,
  sessionId: string | null,
  enabled: boolean,
  opts?: { dedupeSessionRequest?: boolean; preferredRemoteSessionId?: string; suppressErrorLog?: boolean },
): { authority: "session" | "workspace" | "none"; entries: unknown[] };
/** 原 Hbt（jsx 98320）：插件清单 → pluginId→图标 URL 映射 */
declare function buildPluginIconMap(authority: string, entries: unknown[]): Map<string, string>;

/** 插件图标 Provider（原 Ubt）：仅当 authority=session 时提供上下文 */
function PluginIconProvider({
  children,
  remoteSessionId,
  sessionId,
  workspaceIdentity,
  workspacePath,
}: {
  children: React.ReactNode;
  remoteSessionId?: string | null;
  sessionId: string;
  workspaceIdentity?: string | null;
  workspacePath?: string;
}) {
  const manifests = usePluginManifests(workspacePath, workspaceIdentity, sessionId, true, {
    dedupeSessionRequest: true,
    preferredRemoteSessionId: remoteSessionId ?? undefined,
    suppressErrorLog: true,
  });
  const iconByPluginId = React.useMemo(() => buildPluginIconMap(manifests.authority, manifests.entries), [manifests.authority, manifests.entries]);
  const value = React.useMemo(
    () => (manifests.authority === `session` ? { sessionId, iconByPluginId } : null),
    [manifests.authority, iconByPluginId, sessionId],
  );
  return <PluginIconContext.Provider value={value}>{children}</PluginIconContext.Provider>;
}

/** 插件图标门（原 Wbt）：未启用/无会话时提供空上下文 */
function PluginIconGate({
  children,
  enabled,
  remoteSessionId,
  sessionId,
  workspaceIdentity,
  workspacePath,
}: {
  children: React.ReactNode;
  enabled: boolean;
  remoteSessionId?: string | null;
  sessionId: string | null;
  workspaceIdentity?: string | null;
  workspacePath?: string;
}) {
  return !enabled || !sessionId ? (
    <PluginIconContext.Provider value={null}>{children}</PluginIconContext.Provider>
  ) : (
    <PluginIconProvider remoteSessionId={remoteSessionId} sessionId={sessionId} workspaceIdentity={workspaceIdentity} workspacePath={workspacePath}>
      {children}
    </PluginIconProvider>
  );
}

/* --- 9.4 面板命令层接口（R0 内 Kt/sendCommand 包装；真实协议在命令队列运行时） --- */

interface CommandAck {
  status: "accepted" | "duplicate" | "noop" | "rejected" | "stale";
  reasonCode?: string;
  revisionAtDecision?: number;
  result?: { type: string; sessionId?: string; disposition?: string; preview?: FileRewindPreview; [key: string]: unknown };
}
interface ConversationCommandLayer {
  sendCommand(command: { type: string; payload: unknown; sessionId: string | null; baseRevision?: number }): Promise<CommandAck>;
}
declare function useConversationCommandLayer(): ConversationCommandLayer & {
  layer: unknown;
  attachmentPut: (attachment: unknown) => void;
  attachmentRead: unknown;
  onRuntimeRestart?: () => void;
  fileChanges?: unknown;
  fileRewindPreview?: unknown;
};

/** 原 K1（js 115710 / jsx 98482）：待恢复命令账本（跨会话单例；接口归纳） */
declare const pendingCommandLedger: {
  record(command: unknown): void;
  applyAck(command: unknown, ack: CommandAck): void;
  settle(sessionId: string | null, sourceCommandId: string): void;
  subscribe(listener: () => void): () => void;
  reconcileSnapshot(snapshot: SessionSnapshot): void;
  reconcileSession(sessionId: string | null, queryCommands: (sessionId: string | null) => unknown[]): Promise<void>;
  listRecoverable(sessionId: string | null): PendingCommandEntry[];
  dismissRecovery(sessionId: string, commandId: string): void;
  consumeReplay(args: { sessionId: string; commandId: string }): {
    type: string;
    payload: unknown;
    sessionId: string | null;
    baseRevision?: number;
    clientContext?: { workspace?: { workspacePath: string; workspaceIdentity?: string | null }; groupedDraftTask?: unknown };
  } | null;
};
interface PendingCommandEntry {
  sessionId: string | null;
  commandId: string;
  sourceCommandId?: string;
  replay: { kind: "input" | string; type?: string; payload?: unknown };
  clientContext?: { workspace?: { workspacePath: string; workspaceIdentity?: string | null } };
}

/** 原 OCt（js 118693 / jsx 100943）：可恢复命令列表（当前会话 + 本工作区的草稿会话） */
declare function useRecoverablePendingCommands(args: {
  layer: ConversationCommandLayer;
  sessionId: string | null;
  snapshot: SessionSnapshot | null;
  status: string;
  subscriptionId: string | null;
  workspacePath?: string;
  workspaceIdentity?: string | null;
}): PendingCommandEntry[];

/** 原 wCt（js 118647 / jsx 100899）：订阅错误上报（fault.* 键解析后去重） */
/** 原 NCt（js 118762 / jsx 100999）：会话错误自动恢复（末条用户输入重编辑） */
declare function useSessionErrorRecovery(args: {
  enabled: boolean;
  error: unknown;
  errorVisible: boolean;
  sessionId: string | null;
  providerId?: string | null;
  rows: ConversationRow[];
  workspacePath?: string;
  workspaceIdentity?: string | null;
  dispatchEdit: (target: { rowId: number; entityId?: string | null }, newText: string) => Promise<CommandAck>;
  onRecoveryStart: () => void;
  onRecoveryError: (error: { code: string; message: string; detail?: string; taskId?: string }) => void;
}): void;
/** 原 XCt（js 119084 / jsx 101245）：配额横幅视图模型（用量快照 + 服务端错误码合成） */
declare function useSessionQuotaViewModel(args: {
  error: { code?: string; message?: string } | null;
  errorKey: string | null;
  phase: string | null;
  providerId: string | null;
  modelId: string | null;
  usageStatsService: unknown;
}): {
  state: QuotaBannerState;
  dismissKey: string | null;
  dismissed: boolean;
  dismiss: () => void;
  takesOverError: boolean;
  upgradeProviderId: string | null;
  upgradeActionLabelId: string;
  blocksSubmit?: boolean;
};
/** 原 QCt（jsx 101337）：错误去重键 */
declare function buildSessionErrorKey(sessionId: string | null | undefined, error: { code: string; at: number; message: string; traceId?: string; detail?: string }): string;
/** 原 twt（jsx 101347）：错误是否显示（会话错误 → 横幅） */
declare function shouldShowSessionError(sessionId: string | null | undefined, error: unknown): boolean;
/** 原 br/XCt 的 blocksSubmit 判定归纳 */
declare const quotaDismissedKeysStore: string[];

/* --- 9.5 ConversationPane（原 R0，js 119219–121283 / jsx 101388–103090） --- */

/** 原 wT/SFe（横切层）：会话监督器/用量监督器（attachForeground） */
declare function useSessionSupervisor(scope: { workspacePath?: string; workspaceIdentity?: string; remoteSessionId?: string }): {
  attachForeground(sessionMap: Record<string, unknown>, sessionId: string): void;
  reportVisibleChatError(report: unknown): void;
} | null;
declare function useUsageSupervisor(scope: { workspacePath?: string; workspaceIdentity?: string; remoteSessionId?: string }): unknown | null;
/** 原 ET()（横切层）：面板命令环境 */
declare function usePaneCommandEnvironment(): {
  layer: ConversationCommandLayer;
  sendCommand: ConversationCommandLayer["sendCommand"];
  attachmentPut: (attachment: unknown) => void;
  attachmentRead: unknown;
  onRuntimeRestart?: () => void;
  fileChanges?: unknown;
  fileRewindPreview?: unknown;
};
/** 原 fs()（横切层）：基础服务上下文 */
declare function useBaseServicesContext(): {
  modelProviderService: unknown;
  zcodeSessionService: {
    resolveRuntimeModelForV4(args: object): Promise<unknown>;
    respondProviderRuntimeHeaders(args: object): Promise<void>;
  };
  zcodeTaskService: unknown;
  usageStatsService: unknown;
};
declare function useWorkspaceBaseServices(): unknown;

/** 原 tlt（TopBar 族已登记，jsx 85113）：摘要面板模型构建 */
/** 原 Uct（TopBar 族已登记，jsx 84991）：摘要面板变体解析 */
/** 原 Wct：摘要面板布局门控 */
declare function shouldShowSummaryPanel(args: { hasContent: boolean; variant: "mini" | "panel" | "auto" }): boolean;

interface ConversationPaneProps {
  paneId: string;
  sessionId: string | null;
  rootSessionId?: string | null;
  readOnly?: boolean;
  allowWorkspaceFileRewind?: boolean;
  selectionSideChat?: boolean;
  activeSelectionSideChatSessionId?: string | null;
  workspacePath?: string;
  workspaceIdentity?: string | null;
  remoteSessionId?: string | null;
  compactForRemoteControl?: boolean;
  provider?: string;
  onSessionCreated?: (sessionId: string, groupedDraftTask?: unknown) => void;
  onSelectionSideChatUnavailable?: () => void;
  focused?: boolean;
  telemetryVisible?: boolean;
  onSplitRight?: () => void;
  onSplitDown?: () => void;
  onClosePane?: () => void;
  workspaceBadge?: WorkspaceBadge | null;
  draftComposerHeader?: React.ReactNode;
  onDropTargetControllerChange?: (controller: unknown) => void;
  gitSummary?: GitSummary | null;
  gitDirtyFileCount?: number | null;
  gitWorktreeReviewSourceId?: string | null;
  gitWorktreeChangeSummary?: unknown;
  activeTaskChangeSummary?: unknown;
  summaryPanelVariantOverride?: string | null;
  onSummaryPanelVariantOverrideChange?: (variant: "mini" | "panel" | "auto") => void;
  onRefreshGit?: () => void;
  onOpenGitReview?: () => void;
  onOpenBrowserUrl?: (url: string) => void;
  onOpenAutomationsMain?: () => void;
  onOpenCodeViewer?: OpenCodeViewerFn;
  onOpenFileLink?: (path: string) => void;
  onOpenSubagentSession?: (session: unknown) => void;
  onOpenSubagentDirectory?: () => void;
  onSyncSubagentSessionTabs?: (tabs: unknown) => void;
  onOpenSelectionSideChat?: (reference: unknown) => void;
  onOpenPlanDetail?: (plan: unknown) => void;
  conversationFindQuery?: string;
  conversationFindActiveIndex?: number;
  onConversationFindMatchStateChange?: (state: { matchCount: number; activeIndex: number }) => void;
  searchResultHighlightRequest?: { requestId: string; query: string; snippet?: string; snippetIndex?: number } | null;
  onSearchResultHighlightDone?: (requestId: string) => void;
}

/**
 * ConversationPane（原 R0，js 119219 / jsx 101388）—— 会话族根组件。
 *
 * 职责（按源码结构归纳）：
 * 1) 会话订阅：wT/SFe 监督器 + 会话流 store（k0 快照）；草稿态 = sessionId===null；
 * 2) 命令派发层（st 串行队列 + lt/ct 封条）：sendText/createSession/forkAssistant/
 *    editUserQuery/retryTurn/setAssistantFeedback/deleteQueueItem/sendQueuedNow/
 *    reorderQueueItem/setAutoDrain/switchModelConfig/switchCollaborationMode/
 *    setFollowupMode/pauseGoal/resumeGoal/stop/cancelBackgroundWork（Zke 白名单，
 *    js 31547）；stale 重试 3 次（revisionAtDecision 续传）；
 * 3) 待恢复命令账本对账（K1/OCt）：重连后重发/关闭横幅；
 * 4) 错误面：订阅错误上报（wCt）、错误横幅键（QCt/twt）、配额接管（XCt）、
 *    captcha 恢复（NCt + ConversationOverlays 的 RuntimeAuthHeadersController）；
 * 5) 摘要面板（Flt：mini/panel/auto）与后台工作胶囊接线；
 * 6) 渲染：拖放覆盖层 → 面板头 → 摘要 aside → 消息列表（含查找/选区）→
 *    底部 dock（quota 横幅 + 待恢复横幅 + 队列面板 + 交互覆盖层 + composer +
 *    off-peak 横幅）→ 运行时认证控制器。
 *
 * 说明：原函数体 ~1,700 jsx 行，其中 101480–102150 为订阅/模型选择/草稿配置
 * 接线段，此处以接口声明 + 注释归纳；命令派发回调与最终 JSX 逐字还原。
 */
function ConversationPane({
  paneId,
  sessionId,
  rootSessionId,
  readOnly = false,
  allowWorkspaceFileRewind = false,
  selectionSideChat = false,
  activeSelectionSideChatSessionId = null,
  workspacePath,
  workspaceIdentity,
  remoteSessionId,
  compactForRemoteControl = false,
  provider,
  onSessionCreated,
  onSelectionSideChatUnavailable,
  focused = true,
  telemetryVisible = true,
  onSplitRight,
  onSplitDown,
  onClosePane,
  workspaceBadge,
  draftComposerHeader,
  onDropTargetControllerChange,
  gitSummary,
  gitDirtyFileCount,
  gitWorktreeReviewSourceId,
  gitWorktreeChangeSummary,
  activeTaskChangeSummary,
  summaryPanelVariantOverride,
  onSummaryPanelVariantOverrideChange,
  onRefreshGit,
  onOpenGitReview,
  onOpenBrowserUrl,
  onOpenAutomationsMain,
  onOpenCodeViewer,
  onOpenFileLink,
  onOpenSubagentSession,
  onOpenSubagentDirectory,
  onSyncSubagentSessionTabs,
  onOpenSelectionSideChat,
  onOpenPlanDetail,
  conversationFindQuery = ``,
  conversationFindActiveIndex = -1,
  onConversationFindMatchStateChange,
  searchResultHighlightRequest,
  onSearchResultHighlightDone,
}: ConversationPaneProps) {
  const { sendCommand } = usePaneCommandEnvironment();
  const { intl } = useIntlContext();
  const supervisor = useSessionSupervisor({
    workspacePath,
    ...(workspaceIdentity ? { workspaceIdentity } : {}),
    ...(remoteSessionId ? { remoteSessionId } : {}),
  });
  const usageSupervisor = useUsageSupervisor({
    workspacePath,
    ...(workspaceIdentity ? { workspaceIdentity } : {}),
    ...(remoteSessionId ? { remoteSessionId } : {}),
  });
  const foregroundSessionMap = React.useRef<Record<string, unknown>>({});
  React.useEffect(() => {
    if (!supervisor || !usageSupervisor || !telemetryVisible || !sessionId) return;
    return supervisor.attachForeground(foregroundSessionMap.current, sessionId);
  }, [supervisor, usageSupervisor, sessionId, telemetryVisible]);

  /* 会话流订阅（原 ye = useSessionFlow：store 句柄 + 状态机） */
  const [flowStoreHandle] = React.useState<{ store: SessionStoreHandle } | null>(null);
  const subscription = useSessionSnapshot(flowStoreHandle);
  const snapshot = subscription.snapshot;
  const isDraft = sessionId === null;
  const subagents = snapshot?.subagents ?? EMPTY_SUBAGENT_DIRECTORY;
  const pendingInteractionId = snapshot?.pendingInteractions[0]?.interactionId ?? null;
  const controlLastError = snapshot?.control.lastError ?? null;
  const errorKey = controlLastError ? buildSessionErrorKey(snapshot?.sessionId ?? sessionId, controlLastError) : null;

  /* 命令派发（Kt 包装：带 sessionId/revision/logEpoch 的 ACK 协议） */
  const dispatch = React.useCallback(
    (type: string, payload: unknown, targetSessionId: string | null, baseRevision?: number, logEpoch?: string, telemetrySeed?: unknown) =>
      sendCommand({ type, payload, sessionId: targetSessionId, baseRevision }),
    [sendCommand],
  );

  /* —— 轮级动作（spec §6：重试/编辑/回退文件/fork 为轮级） —— */
  const handleFork = React.useCallback(
    (target: { rowId: number; entityId: string }) => {
      if (!sessionId) return;
      dispatch(`forkAssistant`, { target }, sessionId).then((ack) => {
        if (ack.status !== `accepted` && ack.status !== `duplicate`) {
          logger.warn(`[v4-pane] fork 被拒绝: ${ack.status} ${ack.reasonCode ?? ``}`);
          return;
        }
        if (ack.result?.type === `forkAssistant` && ack.result.sessionId) onSessionCreated?.(ack.result.sessionId);
      });
    },
    [dispatch, onSessionCreated, sessionId],
  );
  const handleEdit = React.useCallback(
    async (
      target: { rowId: number; entityId?: string | null },
      newText: string,
      attachments: AttachmentRef[],
      workspaceMode: "preserve" | "rewind" = `preserve`,
    ) => {
      if (!sessionId) return false;
      if (!newText.trim() && (!attachments || attachments.length === 0)) {
        logger.warn(`[v4-pane] edit 跳过：行内编辑内容为空且无附件`);
        return false;
      }
      const ack = await dispatch(
        `editUserQuery`,
        { target, newText, workspaceMode, ...(attachments ? { attachments: [...attachments] } : {}) },
        sessionId,
      );
      if (ack.status !== `accepted` && ack.status !== `duplicate`) {
        logger.warn(`[v4-pane] edit 被拒绝: ${ack.status} ${ack.reasonCode ?? ``}`);
        return false;
      }
      return ack;
    },
    [dispatch, sessionId],
  );
  const handleRetry = React.useCallback(
    (target: { rowId: number; entityId: string }) => {
      if (!sessionId) return;
      dispatch(`retryTurn`, { target }, sessionId)
        .then((ack) => {
          if (ack.status !== `accepted`) logger.warn(`[v4-pane] retry 被拒绝: ${ack.status} ${ack.reasonCode ?? ``}`);
        })
        .catch((error) => {
          logger.warn(`[v4-pane] retry 提交失败`, { error: error instanceof Error ? error.message : String(error) });
        });
    },
    [dispatch, sessionId],
  );
  const handleFeedbackChange = React.useCallback(
    async (target: { rowId: number; entityId: string }, feedback: RowFeedback) => {
      if (!sessionId) return false;
      const ack = await dispatch(`setAssistantFeedback`, { target, feedback }, sessionId);
      const accepted = ack.status === `accepted` || ack.status === `duplicate`;
      if (!accepted) logger.warn(`[v4-pane] assistant 反馈被拒绝: ${ack.status} ${ack.reasonCode ?? ``}`);
      return accepted;
    },
    [dispatch, sessionId],
  );

  /* —— queue 动作（队列面板接线） —— */
  const handleDeleteQueueItem = React.useCallback(
    (queueItemId: string) => {
      if (!sessionId || !snapshot) return;
      const sourceCommandId = snapshot.queue.items.find((item) => item.queueItemId === queueItemId)?.sourceCommandId;
      dispatch(`deleteQueueItem`, { queueItemId }, sessionId).then((ack) => {
        if (ack.status !== `accepted` && ack.status !== `noop`) {
          logger.warn(`[v4-pane] deleteQueueItem 被拒绝: ${ack.status} ${ack.reasonCode ?? ``}`);
          return;
        }
        if (sourceCommandId) pendingCommandLedger.settle(sessionId, sourceCommandId);
      });
    },
    [dispatch, sessionId, snapshot],
  );
  const handleSendQueuedNow = React.useCallback(
    (queueItemId: string) => {
      if (!sessionId) return;
      dispatch(`sendQueuedNow`, { queueItemId }, sessionId).then((ack) => {
        if (ack.status !== `accepted` && ack.status !== `noop`) logger.warn(`[v4-pane] sendQueuedNow 被拒绝: ${ack.status} ${ack.reasonCode ?? ``}`);
      });
    },
    [dispatch, sessionId],
  );
  const handleMoveQueueItem = React.useCallback(
    (queueItemId: string, beforeQueueItemId: string | null) => {
      if (!sessionId) return;
      dispatch(`reorderQueueItem`, { queueItemId, beforeQueueItemId }, sessionId).then((ack) => {
        if (ack.status !== `accepted` && ack.status !== `noop`) logger.warn(`[v4-pane] reorderQueueItem 被拒绝: ${ack.status} ${ack.reasonCode ?? ``}`);
      });
    },
    [dispatch, sessionId],
  );
  const handleResumeQueue = React.useCallback(async () => {
    if (!sessionId || !snapshot || snapshot.queue.autoDrain || snapshot.queue.items.length === 0) return;
    const ack = await dispatch(`setAutoDrain`, { autoDrain: true }, sessionId);
    if (ack.status !== `accepted` && ack.status !== `noop`) logger.warn(`[v4-pane] 恢复暂停队列被拒绝: ${ack.status} ${ack.reasonCode ?? ``}`);
  }, [dispatch, sessionId, snapshot]);
  /** queue 项撤回编辑（chat.queue.editDraftConflict/editRestoreFailed；接口归纳，完整流程见报告 §3.6） */
  const handleEditQueueItem = React.useCallback(
    async (_queueItemId: string) => {
      /* 原 Nn：草稿冲突检查 → deleteQueueItem(baseRevision) → composer 恢复草稿 */
    },
    [],
  );

  /* —— 控制动作 —— */
  const handleStop = React.useCallback(() => {
    if (!sessionId || !snapshot?.control.canStop) return;
    const foregroundExecutionId = snapshot.control.activeWorks.find((work) => work.foregroundExecutionId)?.foregroundExecutionId;
    dispatch(`stop`, foregroundExecutionId ? { expectedForegroundExecutionId: foregroundExecutionId } : {}, sessionId).catch((error) => {
      logger.warn(`[v4-pane] stop 失败: ${String(error)}`);
    });
  }, [dispatch, sessionId, snapshot]);
  const handlePauseGoal = React.useCallback(() => {
    if (!sessionId || !snapshot?.availability.pauseGoal.allowed) return;
    dispatch(`pauseGoal`, {}, sessionId).then((ack) => {
      if (ack.status !== `accepted` && ack.status !== `noop`) logger.warn(`[v4-pane] pauseGoal 被拒绝: ${ack.status} ${ack.reasonCode ?? ``}`);
    });
  }, [dispatch, sessionId, snapshot]);
  const handleResumeGoal = React.useCallback(() => {
    if (!sessionId || !snapshot?.availability.resumeGoal.allowed) return;
    dispatch(`resumeGoal`, {}, sessionId).then((ack) => {
      if (ack.status !== `accepted` && ack.status !== `noop`) logger.warn(`[v4-pane] resumeGoal 被拒绝: ${ack.status} ${ack.reasonCode ?? ``}`);
    });
  }, [dispatch, sessionId, snapshot]);
  const handleCancelBackgroundWork = React.useCallback(
    (workId: string) => {
      if (!sessionId) return;
      dispatch(`cancelBackgroundWork`, { workId }, sessionId).then((ack) => {
        if (ack.status !== `accepted` && ack.status !== `noop`) logger.warn(`[v4-pane] cancelBackgroundWork 被拒绝: ${ack.status} ${ack.reasonCode ?? ``}`);
      });
    },
    [dispatch, sessionId],
  );

  /* 焦点面板 Esc = stop（非远程、非只读、可停止时） */
  React.useEffect(() => {
    if (!focused || remoteSessionId || !sessionId || !snapshot?.control.canStop) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === `Escape`) {
        event.preventDefault();
        handleStop();
      }
    };
    window.addEventListener(`keydown`, handler);
    return () => window.removeEventListener(`keydown`, handler);
  }, [focused, handleStop, remoteSessionId, sessionId, snapshot?.control.canStop]);

  /* 历史加载 */
  const handleRetrySubscription = React.useCallback(() => {
    flowStoreHandle?.store.retry();
  }, [flowStoreHandle]);
  const handleLoadOlder = React.useCallback(() => flowStoreHandle?.store.loadOlder(), [flowStoreHandle]);
  const handleLoadAllOlder = React.useCallback(
    () => flowStoreHandle?.store.loadAllOlder() ?? Promise.resolve({ status: `stale`, logEpoch: snapshot?.logEpoch ?? `unknown` }),
    [flowStoreHandle, snapshot?.logEpoch],
  );

  /* 冷快照首 turn 不完整 → 自动补拉更早行 */
  React.useEffect(() => {
    if (!sessionId || !flowStoreHandle?.store || !shouldAutoLoadOlderOnColdSnapshot(snapshot, subscription.loadingOlder)) return;
    const firstRowId = snapshot?.rows.window[0]?.rowId;
    if (firstRowId === undefined) return;
    logger.debug(`[v4-pane] 冷快照首 turn 不完整，自动补拉更早行`, {
      firstRowId,
      sessionId,
      turnId: snapshot?.rows.window[0]?.turnId,
    });
    flowStoreHandle.store.loadOlder();
  }, [flowStoreHandle, sessionId, snapshot, subscription.loadingOlder]);

  /* 子代理目录同步（侧面板标签） */
  React.useEffect(() => {
    if (!sessionId || subagents.revision === 0 || !onSyncSubagentSessionTabs) return;
    onSyncSubagentSessionTabs({
      rootSessionId: rootSessionId ?? sessionId,
      parentSessionId: sessionId,
      validChildSessionIds: subagents.childSessionIds,
    });
  }, [onSyncSubagentSessionTabs, rootSessionId, sessionId, subagents.childSessionIds, subagents.revision]);

  /* 侧栏提问忙碌标记 */
  React.useEffect(() => {
    if (!selectionSideChat || !sessionId) return;
    setSelectionSideChatBusy(sessionId, !!pendingInteractionId);
    return () => setSelectionSideChatBusy(sessionId, false);
  }, [pendingInteractionId, selectionSideChat, sessionId]);

  /* 摘要面板（右 aside）模型 */
  const summaryModel = React.useMemo(
    () =>
      buildSummaryPanelModel({
        workspacePath,
        gitSummary,
        gitDirtyFileCount,
        gitWorktreeChangeSummary,
        goal: selectionSideChat ? null : snapshot?.goal ?? null,
        sessionPlans: subscription.sessionPlans,
        plan: snapshot?.plan ?? null,
        backgroundWorks: snapshot?.backgroundWorks ?? [],
        runningSubagents: subagents.running,
      }),
    [gitDirtyFileCount, gitSummary, gitWorktreeChangeSummary, snapshot?.backgroundWorks, snapshot?.goal, snapshot?.plan, subscription.sessionPlans, selectionSideChat, subagents.running, workspacePath],
  );
  const runningWorkCount = summaryModel.runningBashWorks.length + summaryModel.runningSubagentWorks.length;
  const summaryVariant = resolveSummaryPanelVariant({ variantOverride: summaryPanelVariantOverride });
  const summaryPanelLayout: "none" | "inline" | "auto" =
    !isDraft && shouldShowSummaryPanel({ hasContent: summaryModel.hasContent, variant: summaryVariant })
      ? summaryVariant === `auto`
        ? `auto`
        : `inline`
      : `none`;

  /* 错误面与配额面 */
  const quota = useSessionQuotaViewModel({
    error: controlLastError,
    errorKey,
    phase: snapshot?.control.phase ?? null,
    providerId: snapshot?.config.provider ?? null,
    modelId: snapshot?.config.model ?? null,
    usageStatsService: useBaseServicesContext().usageStatsService,
  });
  const errorBannerVisible = shouldShowSessionError(snapshot?.sessionId ?? sessionId, controlLastError);
  useSessionSubscriptionErrorReporter({
    supervisor: usageSupervisor ? { reportVisibleChatError: () => {} } : null,
    sessionId,
    lastError: subscription.lastError,
    visible: subscription.status === `error` && telemetryVisible && focused,
  });
  useSessionErrorRecovery({
    enabled: supervisor !== null && focused && telemetryVisible && !compactForRemoteControl && !readOnly && !selectionSideChat,
    error: controlLastError,
    errorVisible: errorBannerVisible && !quota.takesOverError,
    sessionId,
    providerId: snapshot?.config.provider ?? null,
    rows: snapshot?.rows.window ?? [],
    workspacePath,
    workspaceIdentity,
    dispatchEdit: (target, newText) => dispatch(`editUserQuery`, { target, newText, workspaceMode: `preserve` }, sessionId),
    onRecoveryStart: () => {},
    onRecoveryError: (error) => {
      logger.warn(`[v4-pane] captcha 恢复失败`, error);
    },
  });

  /* 待恢复命令（重连后重发/关闭） */
  const recoverableCommands = useRecoverablePendingCommands({
    layer: { sendCommand },
    sessionId,
    snapshot,
    status: subscription.status,
    subscriptionId: subscription.subscriptionId,
    workspacePath,
    workspaceIdentity,
  });
  const firstRecoverable = recoverableCommands[0] ?? null;
  const handleDismissRecovery = React.useCallback(() => {
    if (firstRecoverable) pendingCommandLedger.dismissRecovery(firstRecoverable.sessionId ?? ``, firstRecoverable.commandId);
  }, [firstRecoverable]);
  const handleResendRecovery = React.useCallback(() => {
    if (!firstRecoverable) return;
    const replay = pendingCommandLedger.consumeReplay({ sessionId: firstRecoverable.sessionId ?? ``, commandId: firstRecoverable.commandId });
    if (!replay) return;
    dispatch(replay.type, replay.payload, replay.sessionId, replay.baseRevision)
      .then((ack) => {
        if (replay.type === `createSession` && (ack.status === `accepted` || ack.status === `duplicate`) && ack.result?.type === `createSession`) {
          const workspace = replay.clientContext?.workspace;
          const originKey = workspace?.workspaceIdentity?.trim() || workspace?.workspacePath;
          const currentKey = workspaceIdentity?.trim() || workspacePath;
          if (originKey && originKey !== currentKey) {
            logger.error(`[v4-pending-command] 拒绝跨 workspace 提交 createSession 恢复结果`, {
              originWorkspaceKey: originKey,
              workspaceKey: currentKey,
            });
            return;
          }
          onSessionCreated?.(ack.result.sessionId ?? ``, replay.clientContext?.groupedDraftTask);
        }
      })
      .catch((error) => {
        logger.warn(`[v4-pending-command] 用户确认重发失败`, error);
      });
  }, [dispatch, onSessionCreated, firstRecoverable, workspaceIdentity, workspacePath]);

  /* 行上下文（消息列表共享） */
  const rowContext: RowRenderContext = React.useMemo(
    () => ({
      workspacePath,
      workspaceIdentity,
      workspaceRemoteSessionId: remoteSessionId ?? undefined,
      sessionId,
      compactForRemoteControl,
      logEpoch: snapshot?.logEpoch,
      fetchFileChanges: undefined /* 原 on：经服务层拉取文件变更详情（§5.14 使用） */,
      previewFileRewind: undefined,
      applyFileRewind: allowWorkspaceFileRewind ? undefined : undefined,
      readAttachment: undefined,
      onOpenCodeViewer,
      onOpenFileLink,
      onOpenBrowserUrl,
      onOpenAutomationsMain,
      onOpenPlanDetail,
    }),
    [workspacePath, workspaceIdentity, remoteSessionId, sessionId, compactForRemoteControl, snapshot?.logEpoch, onOpenCodeViewer, onOpenFileLink, onOpenBrowserUrl, onOpenAutomationsMain, onOpenPlanDetail, allowWorkspaceFileRewind],
  );

  const connecting = sessionId !== null && (subscription.status === `connecting` || snapshot === null);
  const subscriptionError = sessionId !== null && subscription.status === `error`;
  const canFork = !readOnly && !selectionSideChat && !!sessionId;
  const canRetry = !readOnly && !selectionSideChat && !!sessionId;
  const canEdit = !readOnly && !selectionSideChat && !!sessionId;
  const canFeedback = !readOnly && !selectionSideChat && !!sessionId;

  /* 底部 dock：quota 横幅 + 待恢复横幅 + 队列 + 交互覆盖层 + composer + off-peak */
  const composerHeader = readOnly ? null : (
    <HomeDraftHeader
      key="conversation-composer"
      snapshot={snapshot}
      sessionId={sessionId}
      draftMode={isDraft}
      contextHeader={isDraft ? draftComposerHeader : undefined}
      centered={isDraft}
      blockingRequestId={pendingInteractionId}
      listenAddToChatEvents={focused}
      autoFocusEnabled={focused}
      disabled={connecting || quota.state.blocksSubmit}
      isWebRemoteControl={compactForRemoteControl}
      workspacePath={workspacePath}
      workspaceIdentity={workspaceIdentity}
      remoteSessionId={remoteSessionId ?? undefined}
      provider={provider}
      telemetryVisible={telemetryVisible && focused}
      onStop={handleStop}
      onOpenRunningBackgroundWorks={sessionId && runningWorkCount > 0 ? () => {} : undefined}
      runningSubagentCount={subagents.running.length}
      error={errorBannerVisible && !quota.takesOverError ? controlLastError?.message ?? null : null}
      onOpenCodeViewer={onOpenCodeViewer}
      suppressGoalCommands={selectionSideChat}
    />
  );
  const bottomDock = readOnly ? null : (
    <>
      {quota.state.visible && !quota.dismissed ? (
        <SessionQuotaBanner
          state={quota.state}
          billingDiscountActive={null}
          billingDiscountConfig={null}
          upgradeActionLabelId={quota.upgradeActionLabelId}
          onUpgrade={quota.upgradeProviderId ? () => {} : undefined}
          onDismiss={quota.dismiss}
        />
      ) : null}
      {firstRecoverable ? (
        <PendingCommandBanner
          entry={firstRecoverable}
          onResend={firstRecoverable.replay.kind === `input` ? handleResendRecovery : undefined}
          onDismiss={handleDismissRecovery}
        />
      ) : null}
      {sessionId && snapshot ? (
        <MemoQueuePanel
          key="conversation-queue"
          queue={snapshot.queue}
          onDeleteItem={handleDeleteQueueItem}
          onEditItem={handleEditQueueItem}
          pendingEditQueueItemId={null}
          onSendNow={handleSendQueuedNow}
          onMoveItem={handleMoveQueueItem}
          onResume={handleResumeQueue}
        />
      ) : null}
      {sessionId && snapshot ? (
        <ConversationInteractionsSlot
          key="conversation-interactions"
          sessionId={sessionId}
          workspacePath={workspacePath}
          workspaceIdentity={workspaceIdentity}
          provider={provider}
          snapshot={snapshot}
        />
      ) : null}
      {composerHeader}
      {isDraft && !workspaceIdentity && !remoteSessionId ? <OffPeakNewTaskBanner {...(onOpenAutomationsMain ? { onOpenAutomations: onOpenAutomationsMain } : {})} /> : null}
    </>
  );

  return (
    <div
      data-testid={`v4-conversation-pane:${paneId}`}
      data-session-id={sessionId ?? `draft`}
      data-v4-conversation-drop-target="true"
      className="relative flex h-full min-h-0 flex-col"
    >
      <PaneFloatingHeader title={snapshot?.meta.title ?? ``} onSplitRight={onSplitRight} onSplitDown={onSplitDown} onClosePane={onClosePane} workspaceBadge={workspaceBadge} />
      <div className="@container/conversation relative flex min-h-0 flex-1 flex-col">
        {isDraft ? null : (
          <ConversationSummaryAside
            workspacePath={workspacePath}
            workspaceIdentity={workspaceIdentity}
            gitSummary={gitSummary}
            gitDirtyFileCount={gitDirtyFileCount}
            gitWorktreeReviewSourceId={gitWorktreeReviewSourceId}
            gitWorktreeChangeSummary={gitWorktreeChangeSummary}
            activeTaskChangeSummary={activeTaskChangeSummary}
            goal={selectionSideChat ? null : snapshot?.goal ?? null}
            sessionPlans={subscription.sessionPlans}
            plan={snapshot?.plan ?? null}
            backgroundWorks={snapshot?.backgroundWorks ?? []}
            runningSubagents={subagents.running}
            endedSubagentCount={subagents.endedTotal}
            rootSessionId={rootSessionId ?? sessionId ?? undefined}
            parentSessionId={sessionId ?? undefined}
            layoutMode={summaryPanelLayout}
            summaryPanelVariantOverride={summaryPanelVariantOverride}
            onVariantChange={(variant) => onSummaryPanelVariantOverrideChange?.(variant)}
            terminalSectionOpen={false}
            onTerminalSectionOpenChange={() => {}}
            agentSectionOpen={false}
            onAgentSectionOpenChange={() => {}}
            onRefreshGit={onRefreshGit}
            onOpenGitReview={onOpenGitReview}
            onPauseGoal={!readOnly && !selectionSideChat && snapshot?.availability.pauseGoal.allowed ? handlePauseGoal : undefined}
            onResumeGoal={!readOnly && !selectionSideChat && snapshot?.availability.resumeGoal.allowed ? handleResumeGoal : undefined}
            onOpenPlanDetail={onOpenPlanDetail}
            onCancelBackgroundWork={readOnly ? undefined : handleCancelBackgroundWork}
            onOpenSubagentSession={onOpenSubagentSession}
            onOpenSubagentDirectory={onOpenSubagentDirectory && !compactForRemoteControl ? onOpenSubagentDirectory : undefined}
          />
        )}
        {readOnly && controlLastError ? (
          <div
            role="alert"
            data-testid="v4-subagent-readonly-error"
            className="mx-4 mt-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-hover)] px-3 py-2 text-ui-base text-[var(--color-danger)]"
          >
            {controlLastError.message}
          </div>
        ) : null}
        {subscriptionError ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-4 text-ui-base">
            <p className="text-[var(--color-danger)]">{subscription.lastError}</p>
            <button type="button" data-testid="v4-subscription-retry" className="rounded-md border border-[var(--color-border)] px-3 py-1" onClick={handleRetrySubscription}>
              {`重新连接`}
            </button>
          </div>
        ) : (
          <PluginIconGate enabled={focused} remoteSessionId={remoteSessionId} sessionId={sessionId} workspaceIdentity={workspaceIdentity} workspacePath={workspacePath}>
            <ConversationMessageList
              scrollToBottomActionRef={null as unknown as React.MutableRefObject<(() => void) | null>}
              rows={isDraft ? [] : snapshot?.rows.window ?? []}
              apiRetry={isDraft ? null : snapshot?.control.apiRetry ?? null}
              totalCount={isDraft ? 0 : snapshot?.rows.totalCount ?? 0}
              sessionKey={sessionId ?? `draft`}
              scrollMemoryKey={null}
              rowContext={rowContext}
              onFork={canFork ? handleFork : undefined}
              onRetry={canRetry ? handleRetry : undefined}
              onFeedbackChange={canFeedback ? handleFeedbackChange : undefined}
              onEdit={canEdit ? handleEdit : undefined}
              canLoadOlder={!isDraft && canLoadOlderRows(snapshot)}
              loadingOlder={subscription.loadingOlder}
              onLoadOlder={handleLoadOlder}
              onLoadAllOlder={handleLoadAllOlder}
              turnNavigatorDirectoryRevision={subscription.turnNavigatorDirectoryRevision}
              bottomDock={bottomDock}
              emptyState={
                isDraft ? (
                  <div data-testid="v4-conversation-empty" className="w-full">
                    <EmptyStateGreeting compactForRemoteControl={compactForRemoteControl} />
                  </div>
                ) : null
              }
              centerEmptyStateWithDock={isDraft}
              compactEmptyStateWithDock={compactForRemoteControl}
              summaryPanelLayout={summaryPanelLayout}
              conversationFindQuery={!isDraft && focused ? conversationFindQuery : ``}
              conversationFindActiveIndex={!isDraft && focused ? conversationFindActiveIndex : -1}
              onConversationFindMatchStateChange={!isDraft && focused ? onConversationFindMatchStateChange : undefined}
              searchResultHighlightRequest={isDraft ? null : searchResultHighlightRequest ?? null}
              onSearchResultHighlightDone={onSearchResultHighlightDone}
              sessionPhase={isDraft ? undefined : snapshot?.control.phase}
              selectionActions={
                !isDraft && sessionId && !readOnly && !selectionSideChat
                  ? {
                      enabled: focused && !pendingInteractionId,
                      sideActionDisabled: !onOpenSelectionSideChat || activeSelectionSideChatSessionId !== null,
                      onAddToCurrentTask: () => {},
                      onAskInSideChat: (reference) => onOpenSelectionSideChat?.(reference),
                    }
                  : undefined
              }
            />
          </PluginIconGate>
        )}
      </div>
      {sessionId && supervisor !== null ? (
        <RuntimeAuthHeadersController sessionId={sessionId} workspacePath={workspacePath} workspaceIdentity={workspaceIdentity} />
      ) : null}
    </div>
  );
}

/** 选区忙碌标记（原 boe，js 2664） */
declare function setSelectionSideChatBusy(sessionId: string, busy: boolean): void;
/** 交互覆盖层插槽（真实实现 = ConversationOverlays.tsx 的 ConversationInteractionsOverlay） */
declare const ConversationInteractionsSlot: React.FC<{
  sessionId: string;
  workspacePath?: string;
  workspaceIdentity?: string | null;
  provider?: string;
  snapshot: SessionSnapshot;
  onCommandSettled?: (commandId: string) => void;
}>;
/** 运行时认证头控制器（真实实现 = ConversationOverlays.tsx 的 RuntimeAuthHeadersController） */

/* --- 9.6 编排器（原 PTt，js 122803–123102 / jsx 104572–104760） --- */

/** 分屏布局 store（原 s2，F07 族 jsx 103518）与路由 store（原 A2，jsx 104365） */
interface SplitPaneBinding {
  workspaceScope: { workspacePath?: string; workspaceIdentity?: string; remoteSessionId?: string };
  sessionId: string;
  readOnly?: boolean;
}
interface SplitPaneDescriptor {
  paneId: string;
  rect: unknown;
  workspaceScope?: unknown;
  sessionId?: string;
  readOnly?: boolean;
}
declare function flattenPaneTree(root: unknown): { leaves: { paneId: string; rect: unknown }[]; dividers: { splitId: string; direction: string; ratio: number; regionFraction: number }[] };
declare function dividerStyle(divider: { direction: string; ratio: number }): React.CSSProperties;
declare const SplitPaneHost: React.FC<{
  paneId: string;
  rect: unknown;
  focused: boolean;
  showFocusIndicator: boolean;
  canSplit: boolean;
  shellWorkspaceKey: string;
  binding: SplitPaneBinding | null;
  primaryBinding: SplitPaneBinding | null;
  shell: Record<string, unknown>;
  onFocusRequest: (paneId: string) => void;
  onSplit?: (paneId: string, side: "right" | "down") => void;
  onClosePane: (paneId: string) => void;
  onConfirmRestoredSession: (paneId: string) => void;
  onBindSession: (paneId: string, sessionId: string) => boolean;
  onPaneActiveSessionChange?: (scope: unknown, sessionId: string) => void;
  canDropSession?: (paneId: string) => boolean;
  onDropSession?: (paneId: string, side: "right" | "down", sessionId: string) => void;
}>;
declare const SplitDivider: React.FC<{
  containerRef: React.RefObject<HTMLDivElement | null>;
  splitId: string;
  direction: string;
  ratio: number;
  regionFraction: number;
  style: React.CSSProperties;
  onCommitRatio: (splitId: string, ratio: number) => void;
}>;

/**
 * 会话编排器（原 PTt，js 122803 / jsx 104572）。
 * v4 分屏的会话列装配环境：把分屏树（s2 store 或会话组 A2）展平成
 * 面板叶 + 分隔条，为每个叶渲染 SplitPaneHost（内部按绑定渲染 R0）。
 * 主面板（workspace-main）承载当前会话或草稿；草稿首次发送可提升为会话组
 * （promotePaneLayoutToGroup）。远程远控模式（compactForRemoteControl）
 * 固定单面板。
 */
function ConversationOrchestrator({
  workspacePath,
  workspaceIdentity,
  readOnly = false,
  remoteSessionId,
  compactForRemoteControl = false,
  sessionId,
  activeSelectionSideChatSessionId = null,
  provider,
  onSessionCreated,
  onSessionDeleted,
  draftComposerHeader,
  onPrimaryDraftDropTargetControllerChange,
  gitSummary,
  gitDirtyFileCount,
  gitWorktreeReviewSourceId,
  gitWorktreeChangeSummary,
  activeTaskChangeSummary,
  summaryPanelVariantOverride,
  onSummaryPanelVariantOverrideChange,
  onRefreshGit,
  onOpenGitReview,
  onPaneActiveSessionChange,
  onOpenBrowserUrl,
  onOpenAutomationsMain,
  onOpenCodeViewer,
  onOpenFileLink,
  onOpenSubagentSession,
  onOpenSubagentDirectory,
  onSyncSubagentSessionTabs,
  onOpenSelectionSideChat,
  onOpenPlanDetail,
  conversationFindQuery = ``,
  conversationFindActiveIndex = -1,
  onConversationFindMatchStateChange,
  searchResultHighlightRequest,
  onSearchResultHighlightDone,
}: {
  workspacePath?: string;
  workspaceIdentity?: string | null;
  readOnly?: boolean;
  remoteSessionId?: string | null;
  compactForRemoteControl?: boolean;
  sessionId: string | null;
  activeSelectionSideChatSessionId?: string | null;
  provider?: string;
  onSessionCreated?: (sessionId: string, groupedDraftTask?: unknown) => void;
  onSessionDeleted?: (sessionId: string) => void;
  draftComposerHeader?: React.ReactNode;
  onPrimaryDraftDropTargetControllerChange?: (controller: unknown) => void;
  gitSummary?: GitSummary | null;
  gitDirtyFileCount?: number | null;
  gitWorktreeReviewSourceId?: string | null;
  gitWorktreeChangeSummary?: unknown;
  activeTaskChangeSummary?: unknown;
  summaryPanelVariantOverride?: string | null;
  onSummaryPanelVariantOverrideChange?: (variant: "mini" | "panel" | "auto") => void;
  onRefreshGit?: () => void;
  onOpenGitReview?: () => void;
  onPaneActiveSessionChange?: (scope: unknown, sessionId: string) => void;
  onOpenBrowserUrl?: (url: string) => void;
  onOpenAutomationsMain?: () => void;
  onOpenCodeViewer?: OpenCodeViewerFn;
  onOpenFileLink?: (path: string) => void;
  onOpenSubagentSession?: (session: unknown) => void;
  onOpenSubagentDirectory?: () => void;
  onSyncSubagentSessionTabs?: (tabs: unknown) => void;
  onOpenSelectionSideChat?: (reference: unknown) => void;
  onOpenPlanDetail?: (plan: unknown) => void;
  conversationFindQuery?: string;
  conversationFindActiveIndex?: number;
  onConversationFindMatchStateChange?: (state: { matchCount: number; activeIndex: number }) => void;
  searchResultHighlightRequest?: { requestId: string; query: string; snippet?: string; snippetIndex?: number } | null;
  onSearchResultHighlightDone?: (requestId: string) => void;
}) {
  const shellWorkspaceKey = workspaceIdentity?.trim() || workspacePath;
  const rootLayout = useSplitLayoutStore((state) => state.root);
  const rootPanes = useSplitLayoutStore((state) => state.panes);
  const focusedRootPaneId = useSplitLayoutStore((state) => state.focusedPaneId ?? PRIMARY_PANE_ID);
  const splitPane = useSplitLayoutStore((state) => state.splitPane);
  const closeRootPane = useSplitLayoutStore((state) => state.closePane);
  const confirmRootRestoredSession = useSplitLayoutStore((state) => state.confirmRestoredPaneSession);
  const focusRootPane = useSplitLayoutStore((state) => state.focusPane);
  const bindRootPaneSession = useSplitLayoutStore((state) => state.bindPaneSession);
  const setRootSplitRatio = useSplitLayoutStore((state) => state.setSplitRatio);
  const resetToPrimaryPane = useSplitLayoutStore((state) => state.resetToPrimaryPane);
  const activeGroup = useSessionRouterStore((state) => (compactForRemoteControl || !state.activeGroupId ? null : state.groups[state.activeGroupId] ?? null));
  const focusGroupPane = useSessionRouterStore((state) => state.focusPane);
  const closeGroupPane = useSessionRouterStore((state) => state.closePane);
  const confirmGroupRestoredSession = useSessionRouterStore((state) => state.confirmRestoredPaneSession);
  const bindGroupPaneSession = useSessionRouterStore((state) => state.bindPaneSession);
  const setGroupSplitRatio = useSessionRouterStore((state) => state.setSplitRatio);
  const promotePaneLayoutToGroup = useSessionRouterStore((state) => state.promotePaneLayoutToGroup);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const layoutRoot = compactForRemoteControl ? PRIMARY_PANE_ID : activeGroup?.root ?? rootLayout;
  const layoutPanes = compactForRemoteControl ? {} : activeGroup?.panes ?? rootPanes;
  const focusedPaneId = compactForRemoteControl ? PRIMARY_PANE_ID : activeGroup?.focusedPaneId ?? focusedRootPaneId;
  const flattened = React.useMemo(() => flattenPaneTree(layoutRoot), [layoutRoot]);
  const sessionAlreadyBound = React.useMemo(
    () =>
      compactForRemoteControl || activeGroup || !sessionId
        ? false
        : Object.values(rootPanes).some((pane) => pane.sessionId === sessionId && workspaceScopeKey(pane.workspaceScope as { workspacePath?: string }) === shellWorkspaceKey),
    [activeGroup, compactForRemoteControl, rootPanes, sessionId, shellWorkspaceKey],
  );
  const primarySessionId = sessionAlreadyBound ? null : sessionId;
  const dividerCssVars = React.useMemo(() => {
    const vars: Record<string, string> = {};
    for (const divider of flattened.dividers) vars[`--v4-split-${divider.splitId}`] = String(divider.ratio);
    return vars;
  }, [flattened]);
  const leafCount = flattened.leaves.length;
  const hasMultiplePanes = leafCount > 1;
  const canSplit = leafCount < 4;
  const workspaceScope = React.useMemo(
    () => ({
      workspacePath,
      ...(workspaceIdentity ? { workspaceIdentity } : {}),
      ...(remoteSessionId ? { remoteSessionId } : {}),
    }),
    [remoteSessionId, workspaceIdentity, workspacePath],
  );
  const primaryBinding = React.useMemo(
    () => (primarySessionId ? { workspaceScope, sessionId: primarySessionId } : null),
    [primarySessionId, workspaceScope],
  );
  const shellProps: Record<string, unknown> = React.useMemo(
    () => ({
      workspacePath,
      workspaceIdentity,
      remoteSessionId,
      compactForRemoteControl,
      readOnly,
      sessionId: primarySessionId,
      activeSessionId: sessionId,
      activeSelectionSideChatSessionId,
      provider,
      onSessionCreated,
      onSessionDeleted,
      draftComposerHeader,
      onPrimaryDraftDropTargetControllerChange,
      gitSummary,
      gitDirtyFileCount,
      gitWorktreeReviewSourceId,
      gitWorktreeChangeSummary,
      activeTaskChangeSummary: primarySessionId ? activeTaskChangeSummary : null,
      summaryPanelVariantOverride,
      onSummaryPanelVariantOverrideChange,
      onRefreshGit,
      onOpenGitReview,
      onOpenBrowserUrl,
      onOpenAutomationsMain,
      onOpenCodeViewer,
      onOpenFileLink,
      onOpenSubagentSession,
      onOpenSubagentDirectory,
      onSyncSubagentSessionTabs,
      onOpenSelectionSideChat,
      onOpenPlanDetail,
      conversationFindQuery,
      conversationFindActiveIndex,
      onConversationFindMatchStateChange,
      searchResultHighlightRequest,
      onSearchResultHighlightDone,
    }),
    [
      workspacePath, workspaceIdentity, remoteSessionId, compactForRemoteControl, readOnly, primarySessionId, activeSelectionSideChatSessionId, provider,
      onSessionCreated, onSessionDeleted, draftComposerHeader, onPrimaryDraftDropTargetControllerChange, gitSummary, gitDirtyFileCount,
      gitWorktreeReviewSourceId, gitWorktreeChangeSummary, activeTaskChangeSummary, summaryPanelVariantOverride, onSummaryPanelVariantOverrideChange,
      onRefreshGit, onOpenGitReview, onOpenBrowserUrl, onOpenAutomationsMain, onOpenCodeViewer, onOpenFileLink, onOpenSubagentSession,
      onOpenSubagentDirectory, onSyncSubagentSessionTabs, onOpenSelectionSideChat, onOpenPlanDetail, conversationFindQuery, conversationFindActiveIndex,
      onConversationFindMatchStateChange, searchResultHighlightRequest, onSearchResultHighlightDone,
    ],
  );
  const resolvePaneBinding = React.useMemo(
    () => (paneId: string): SplitPaneBinding | null => {
      if (activeGroup) return null; /* 原 T2：组内绑定解析 */
      if (paneId === PRIMARY_PANE_ID) return primaryBinding;
      const pane = rootPanes[paneId];
      return pane?.sessionId
        ? { workspaceScope: pane.workspaceScope as SplitPaneBinding["workspaceScope"], sessionId: pane.sessionId, ...(pane.readOnly ? { readOnly: true } : {}) }
        : null;
    },
    [activeGroup, primaryBinding, rootPanes],
  );
  const notifyActiveSession = React.useCallback(
    (binding: SplitPaneBinding | null) => {
      if (!binding || binding.readOnly) return;
      onPaneActiveSessionChange?.(binding.workspaceScope, binding.sessionId);
    },
    [onPaneActiveSessionChange],
  );
  const handleFocusRequest = React.useMemo(
    () => (paneId: string) => {
      if (activeGroup) {
        focusGroupPane(activeGroup.id, paneId);
      } else {
        focusRootPane(paneId);
      }
      notifyActiveSession(resolvePaneBinding(paneId));
    },
    [activeGroup, focusGroupPane, focusRootPane, notifyActiveSession, resolvePaneBinding],
  );
  const handleClosePane = React.useMemo(
    () => (paneId: string) => {
      if (activeGroup) {
        closeGroupPane(activeGroup.id, paneId);
      } else {
        closeRootPane(paneId);
      }
      notifyActiveSession(null);
    },
    [activeGroup, closeGroupPane, closeRootPane, notifyActiveSession],
  );
  const handleConfirmRestoredSession = React.useMemo(
    () => (paneId: string) => {
      if (activeGroup) {
        confirmGroupRestoredSession(activeGroup.id, paneId);
      } else {
        confirmRootRestoredSession(paneId);
      }
    },
    [activeGroup, confirmGroupRestoredSession, confirmRootRestoredSession],
  );
  const handleCommitRatio = React.useMemo(
    () => (splitId: string, ratio: number) => {
      if (activeGroup) {
        setGroupSplitRatio(activeGroup.id, splitId, ratio);
      } else {
        setRootSplitRatio(splitId, ratio);
      }
    },
    [activeGroup, setGroupSplitRatio, setRootSplitRatio],
  );
  const handleBindSession = React.useMemo(
    () => (paneId: string, newSessionId: string): boolean => {
      if (activeGroup) {
        bindGroupPaneSession(activeGroup.id, paneId, newSessionId);
        return true;
      }
      if (paneId === PRIMARY_PANE_ID) {
        const state = rootPanes;
        if (Object.keys(state).length > 0 && primaryBinding && promotePaneLayoutToGroup(primaryBinding, state)) {
          resetToPrimaryPane();
          logger.info(`[v4-workbench] primary draft promoted to session group`, {
            createdSessionId: newSessionId,
            workspaceKey: shellWorkspaceKey,
          });
        }
        return true;
      }
      bindRootPaneSession(paneId, newSessionId);
      if (!sessionId) return false;
      const promoted = primaryBinding ? promotePaneLayoutToGroup({ ...primaryBinding, sessionId }, rootPanes) : false;
      if (promoted) resetToPrimaryPane();
      return promoted;
    },
    [activeGroup, bindGroupPaneSession, bindRootPaneSession, primaryBinding, promotePaneLayoutToGroup, resetToPrimaryPane, rootPanes, sessionId, shellWorkspaceKey],
  );
  return (
    <div ref={containerRef} style={dividerCssVars} className="relative h-full min-h-0 w-full">
      {flattened.leaves.map((leaf) => (
        <SplitPaneHost
          key={leaf.paneId}
          paneId={leaf.paneId}
          rect={leaf.rect}
          focused={focusedPaneId === leaf.paneId}
          showFocusIndicator={hasMultiplePanes}
          canSplit={canSplit}
          shellWorkspaceKey={shellWorkspaceKey ?? ``}
          binding={leaf.paneId === PRIMARY_PANE_ID ? null : (layoutPanes as Record<string, SplitPaneBinding>)[leaf.paneId] ?? null}
          primaryBinding={leaf.paneId === PRIMARY_PANE_ID ? activeGroup?.primaryBinding ?? null : null}
          shell={shellProps}
          onFocusRequest={handleFocusRequest}
          onSplit={compactForRemoteControl || activeGroup ? undefined : splitPane}
          onClosePane={handleClosePane}
          onConfirmRestoredSession={handleConfirmRestoredSession}
          onBindSession={handleBindSession}
          onPaneActiveSessionChange={onPaneActiveSessionChange}
          canDropSession={compactForRemoteControl ? undefined : () => true}
          onDropSession={compactForRemoteControl ? undefined : () => {}}
        />
      ))}
      {flattened.dividers.map((divider) => (
        <SplitDivider
          key={divider.splitId}
          containerRef={containerRef}
          splitId={divider.splitId}
          direction={divider.direction}
          ratio={divider.ratio}
          regionFraction={divider.regionFraction}
          style={dividerStyle(divider)}
          onCommitRatio={handleCommitRatio}
        />
      ))}
    </div>
  );
}

/* --- 9.7 导出（本文件对外接口） --- */

export {
  /* Pane */
  ConversationPane,
  ConversationOrchestrator,
  PaneFloatingHeader,
  useSessionSnapshot,
  CLOSED_SESSION_STATE,
  /* List */
  ConversationMessageList,
  ScrollToBottomButton,
  UnitSizeCache,
  /* Turn */
  TurnSection,
  TurnHeaderRow,
  UserQueryRow,
  AssistantMessageRow,
  AssistantMessageActions,
  ReasoningRowView,
  TimelineMarkerView,
  TurnFileChangesSummary,
  UserInputCollapsibleText,
  UserInputRichText,
  AttachmentChipList,
  parseGoalCommand,
  /* Tool */
  ToolLayout,
  ToolCallBlock,
  ShellToolViewImpl as ShellToolView,
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
  /* Nav */
  TurnNavigator,
  /* Find */
  useConversationFind,
  ConversationSelectionTooltip,
  buildFindIndex,
  /* Queue/Quota */
  QueuePanel,
  QueueItemRow,
  SessionQuotaBanner,
  PendingCommandBanner,
};
