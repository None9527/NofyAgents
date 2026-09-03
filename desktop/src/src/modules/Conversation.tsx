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
 *  [Pane]    R0  → ConversationPane            (119219)
 *            PTt → ConversationOrchestrator    (122820) 〔A1-R3 迁出 → modules/SplitLayoutUiDeep.tsx〕
 *            Ait/jit → PaneFloatingHeader      (91755,91801)
 *            Ubt/Wbt → PluginIconProvider/Gate (115538,115559)
 *            k0  → useSessionSnapshot          (118692)
 *  [List]    Rbt/zbt → ConversationMessageList (114627,115525)
 *            Fbt → ScrollToBottomButton        (114644)
 *            Lyt → UnitSizeCache               (113965)
 *            Fyt/ayt → buildRenderUnits/splitVirtualizedUnits (113940,113620)
 *  [Turn]    Vvt/Hvt → TurnSection             (113156,113295)
 *            Rvt/Bvt/Lvt/Ivt → 轮体/后台结果轮/工作段/段头 (112998,113089,112924,112890)
 *            Evt/Dvt/b1 → RowRenderer          (112666,112711,112712)
 *            pvt → UserQueryRow（编辑/回退文件）(112010)
 *            hvt → AssistantMessageRow         (112357)
 *            mvt → AssistantMessageActions（复制/赞踩/fork/时间）(112234)
 *            gvt → ReasoningRow  _vt → TurnHeaderRow  Cvt → TimelineMarkerView
 *            wvt → ToolCallRow    Tvt → SubagentRow    jvt → AgentToolCallRow
 *            S_t → TurnFileChangesSummary（chat.changeSummary.*）(110861)
 *            k_t/A_t/O_t → 预览卡（网站/文件）  (111193,111233,111161)
 *            b_t → FileRewindDialog            (110680)
 *            G_t → UserInputCollapsibleText    (111627)
 *            rvt/tvt/nvt → 用户输入富文本/提及部件 (111783,111712,111769)
 *            m1/Z_t/$_t → /goal /compact 命令解析 (111673)
 *  [Nav]     ryt/iyt → TurnNavigator（左侧轮刻度条）(113443,113619)
 *  [Tool]    lQ/put → ToolLayout               (100416,100214)
 *            lut/sut/cut/aut → ToolLayout 头部/摘要件 (100151,100095,100122,100000)
 *            K$/Ght → ToolCallBlock            (109241,109105)
 *            Wht → resolveToolCallView（16 种工具视图分派）(109114)
 *            ept ShellToolView（代表性全量还原）(105266)
 *            其余 15 个工具视图：接口级登记（见 §4.6）
 *            z_t/B_t/V_t → Reasoning 折叠（思考/摘要）(111329,111405,111471)
 *            zlt/rQ/Glt/Wlt → 工具状态/错误/显示模型 (99513,99542,99696,99593)
 *  [Find]    vbt → useConversationFind（CSS Custom Highlight API）(jsx 97388)
 *            Tbt → ConversationSelectionTooltip（引用选择动作）(jsx 97517)
 *            I1/rbt/ibt/… → 查找索引/高亮工具群（§7）
 *  [Queue]   dst/ust → QueuePanel（dnd-kit 排序）(94801,94696)
 *            lst → QueueItemRow                (94573)
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
 * 14. 会话流运行时：命令队列账本 K1（本文件 §9.3）、命令工厂 OS (js 34630)、
 *     交互通知登记 VS/HS (js 35435/32498)、canLoadOlderRows hw (js 39814)、
 *     选择引用 koe / boe (js 2720/2664)、工具分类 og (js 23132)、
 *     文件摘要抽取 _g (js 23686)、计划 markdown qZ (js 98044)
 * ============================================================================
 */

/* ============================================================================
 * 〔A0-S4-4b：components 拆分（conversation/composer 域）——本文件四个组件单元已迁出，现为 shim〕
 * 迁出单元（原样迁入，导入方零改动，仍从本文件取符号）：
 *   §2 Quota/PendingCommand 横幅子族（438–604）   → components/conversation/SessionBanners.tsx
 *   §3 Queue 子族（605–909，含内联 dnd declare 8 件）→ components/conversation/QueuePanel.tsx
 *   §4 ToolBlock 子族（910–2128，含内联 declare 15 件）→ components/conversation/ToolCallBlock.tsx
 *   §6 TurnNavigator 子族（4618–5024）            → components/conversation/TurnNavigator.tsx
 * §0 分配：IconZap/BillingDiscountNote 唯一消费随 §2 迁出（本文件删除）；IconX 三面共用
 * （§2/§3/§9）按消费方复制，本文件保留。§4 内联 declare 族随迁；buildPlanResultMarkdown
 * 留守面（§5 2373）亦消费，按消费方复制（ambient declare，编译期擦除，emit 中立）。
 * 回取面（函数声明提升/型别擦除，环安全）：§5 渲染点 ← ToolCallBlock/Reasoning 三件；
 * §8 渲染点 ← TurnNavigator/findActiveQueryRow；§9 渲染点 ← SessionQuotaBanner/
 * PendingCommandBanner/MemoQueuePanel；TurnRenderUnit（§5 4124）补 export 供 §6 型别回取。
 * 留守：§0 declares、§1 Collapsible 原语、§5 Turn 子族、§7 Find 子族、§8 List 子族、
 * §9 Pane 子族——编排器 PTt/R0 闭包与轮分段渲染引擎深耦合，按阶段纪律留守（见报告 §6）。
 * ==========================================================================*/
import * as React from "react";
import { useOptionalPlatform as useTelemetryPlatform } from './ImeComposition'; // 〔A1-R125〕原 le declare 改指（R1 判例别名保留调用名；imeComposition chunk 10880 useContext 可空面）
import { reportTelemetry as trackEvent } from './StoresDeep'; // 〔A1-R125〕原 xw declare 改指（R36 canonical；环安全：StoresDeep 值闭包不反达 modules/Conversation）
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../components/ui/hover-card'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { ChevronDown as IconChevronDown, ChevronUp as IconChevronUp, Check as IconCheck, Copy as IconCopy, Pencil as IconPencil, GripVertical as IconGripVertical, ArrowUpFromLine as IconSend, ArrowDownToLine as IconArrowDownToLine, SquareTerminal as IconSquareTerminal, File as IconFile, Bot as IconBot, Sparkles as IconSparkles, Target as IconTarget, GitBranch as IconGitBranch, Lightbulb as IconLightbulb, Eye as IconModelChange, Shield as IconShield, ThumbsUp as IconThumbsUp, ThumbsDown as IconThumbsDown, Rewind as IconRewind, Loader as IconLoader, LoaderCircle as IconSpinner, Info as IconInfo, Upload as IconUpload, Globe as IconGlobe, Gauge as IconGauge, Clock as IconClock, ListTodo as IconListTodo, MessageSquare as IconMessageSquare, Calendar as IconCalendar, X as IconX } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0（映射依据见 A0-S3b.report.md）；〔A1-P1-B17〕+X as IconX（原 g = imeComposition chunk qt=x('x')@11819，导出别名 b@12583，经 styles 349 `b as g` 入本 chunk；消费位 bundle 91840 v4-pane-close 按钮 ≡ 本文件 @4721 逐字吻合；declare 删碑见 §0）
import * as ReactDOM from "react-dom";
import { useVirtualizer } from '@tanstack/react-virtual'; // A0-S3a：vendored useVirtualizer（原 to，esm-BY6T6pIH.js）→ npm @tanstack/react-virtual@3.14.10
import { AgentToolView, AskUserQuestionToolView, AutomationCard, AutomationToolView, ExploreToolView, FallbackToolView, FileReadToolView, FileWriteToolView, GoalToolView, NodeReplToolView, PreviewCardList, SearchToolView, SessionContextToolView, SkillToolView, SwitchModeToolView, TaskControlToolView, TaskOutputToolView, TodoToolView, collectAutomationCards, isNearBottom, keyScrollIntent, useSessionErrorRecovery, type AutomationCardModel, type FileSummary, type OpenCodeViewerFn, type PreviewCardModel, type ToolCall, type ToolCallNode, type ToolCallViewProps, type ToolDisplayModel } from './ConversationLeaves'; // +8 type（A0-D 类型收敛：会话流共享类型 canonical = ConversationLeaves）；+useSessionErrorRecovery（A1-R14：原 NCt 118779 实体化改指，消费点 5328）
import { RuntimeAuthHeadersController, useSessionSubscriptionErrorReporter } from './ConversationOverlays';
import { FileOpenWithMenu, buildFilePreviewSource } from './FileRewindDialogDeep'; // 原 v_t/__t（A0-CLEANUP2 item 45 接线：declare → 属主导出）
import { FileRewindDialog, countContextAttachments, type AttachmentContextBundle, type CodeCommentAttachment, type FileRewindPreview } from './GitReview'; // +AttachmentContextBundle/FileRewindPreview（A0-D 类型收敛）；〔A1-R22〕+type CodeCommentAttachment（ParsedUserInput 型别精化）
import { OffPeakNewTaskBanner } from './Home'; // 〔A1-P1-B15〕原 I3e（76860）收敛改指；〔A1-P1-B16〕ApiRetryView 别名随 x1 收敛入 ChatLoadingSlot 除名
import { ApiRetryLoadingSlot } from '../components/conversation/ChatLoadingSlot'; // 〔A1-P1-B16〕原 x1（112814）逐字实体化（kvt/Llt 同叶携带；消费位 112823 束体办结）
import { useAssistantPreviewCards as buildAssistantPreviewCards } from '../components/conversation/PreviewCardLinkBlocks'; // 〔A1-P1-B17〕原 Bgt（110008）逐字实体化（Pgt/Fgt/Igt/c1/Lgt/Rgt/zgt 同叶携带；R1 判例别名保留调用名，消费面逐字不变；declare 删碑见 §5.15 域）
import { Input, Popover, PopoverAnchor, PopoverContent, PopoverTrigger, toast } from './ImeComposition';
import { MarkdownRenderer, type CodePreviewSettings, type FileLinkModel } from './MarkdownIntegration'; // +CodePreviewSettings/FileLinkModel（A0-D 类型收敛）
import { Badge } from './PaymentDeep';
import { logger } from './SkillStore';
import { ConversationSummaryAside, buildSummaryPanelModel, resolveSummaryPanelVariant, type BackgroundWork, type GitSummary, type RunningSubagent, type SummaryGoal, type SummaryPanelVariant } from './TopBar'; // A0-CLEANUP2 items 17+46：本地镜像删除 → 属主导出（GitSummary.branchName 属主侧已 string | null）
import { type SubagentOpenRequest } from './SidePanel'; // A0-CLEANUP3 #36：编排器回调型收口
import { type PrimaryDraftDropTargetController } from './WorkspaceShell'; // A0-CLEANUP3 #36：草稿投放控制器型（type-only，无运行时环）
import { BillingDiscountBadge, type BillingDiscountConfig } from './UsageDeep'; // +BillingDiscountConfig（A0-D 类型收敛）
import { InfoTooltip as Tooltip, useControllableState } from './UsageStatsUiParts'; // 原 Ia（usageStatsUiParts u 导出 = X InfoTooltip）+ 原 fa（A0-CLEANUP2 item 47 接线）
import { useZCodeIntl as useIntlContext, type ZCodeIntl as IntlShape } from './I18n'; // 原 G，IntlProvider-C321H7m8.js（A0-D 接线：declare → I18n canonical；IntlShape=ZCodeIntl）
import { Button, ChevronRight as IconChevronRight, ChevronLeft as IconChevronLeft } from './button'; // 原 t 导出，button-laUijeDG.js（A0-D 接线：declare → button.tsx canonical）；A0-S3b 增补：ChevronRight as IconChevronRight, ChevronLeft as IconChevronLeft（button chunk 图标，pass-1 同源）
import { cn } from './UtilsCn'; // 原 Z，utils-CEEH0K_K.js（A0-D 接线：declare → UtilsCn canonical）
/* ── tombstone（A1-R3）：stores-session import（PRIMARY_PANE_ID/useSessionRouterStore/
 *    useSplitLayoutStore/workspaceScopeKey + SessionBinding/WorkspaceScope 型）已删除——
 *    唯一消费面 9.6 A0 编排器随 PTt 域迁出（SplitLayoutUiDeep.tsx）而删除。 ── */
import { SessionQuotaBanner, PendingCommandBanner, type QuotaBannerState } from '../components/conversation/SessionBanners'; // 〔A0-S4-4b〕§9 渲染点（7528/7538）+ QuotaBannerState 型别（6979）消费回取（函数声明提升/型别擦除，环安全）
import { splitUserInputParts, formatSkillMentionLabel, type MentionToken } from '../components/composer/FileMentionDragHelpers'; // A1-R12：ZHe（52182）/YHe（52147）declare 改指纯函数叶子（本批逐字转录）；调用点 767/688 逐字不变。环安全：叶子零 import
import { CodeCommentsChip, SelectionsChip, WebElementsChip, isHttpUrl as isPluginIconUrl, type ConversationSelection, type PptxElementAddDetail, type WebElementContext } from './Composer'; // A1-R13：oV（64277）declare 改指（canonical = Composer B4 区 isHttpUrl，bundle 唯一真身）；调用点 740 逐字不变。环安全：Composer 不反引本文件。〔A1-R22〕+CodeCommentsChip/WebElementsChip/SelectionsChip（原 TH 68298 / lit 89989 / uit 90087 逐字 canonical；消息行 112241–112244 四 chip declare 收敛）+三型别（ParsedUserInput 精化）
import { PptxReferencesChip, usePptxPreviewOpener } from '../components/composer/PptxReferencesChip'; // 〔A1-R22〕原 PptxReferenceChips/useOpenCodeViewerForReference declare（JH 69036 / YH 69207）改指（A1-R21 补 export；消息行 112243 消费面）。环安全：该叶不反引本文件
import { MemoQueuePanel, type QueueState } from '../components/conversation/QueuePanel'; // 〔A0-S4-4b〕§9 渲染点（7545）+ SessionQueueSnapshot extends（6686）消费回取
import { ToolCallBlock, Reasoning, ReasoningTrigger, ReasoningContent } from '../components/conversation/ToolCallBlock'; // 〔A0-S4-4b〕§5 渲染点（3225–3235/3462/3661）消费回取
import { normalizeToolCallNode } from '../components/conversation/ToolStatusModel'; // 原 u1（styles 110206；A1-R96 实体化收敛）
import { TurnNavigator, findActiveQueryRow, shouldHydrateFullHistory, hydrateRetryDelayMs } from '../components/conversation/TurnNavigator'; // 〔A0-S4-4b〕§8 渲染点（6549）+ activeQueryRowId（6238）+ §5 水合判定（3957/3991）消费回取
import { EMPTY_SUBAGENT_DIRECTORY, buildSessionErrorKey, buildSessionErrorBannerModel, isApiRetryEligible } from '../components/conversation/ConversationPaneHelpers'; // 〔A1-P1〕R0 簇卫星域逐字真身（原 $Ct/QCt/twt，js 119197/119194/119199）；叶仅依赖 SrcSharedA，环安全（本文件单向消费）；〔A1-P1-B17〕+isApiRetryEligible（原 Wgt，110071；declare 删碑见 §5.15 域）
import { useSessionQuotaViewModel } from '../components/conversation/ConversationQuotaModel'; // 〔A1-P1-B2〕原 XCt（js 119101）逐字真身（配额块闭包全簇）；环安全：叶不反引本文件（UsageDeep 依赖面负证据在案）
import { ConversationPane } from '../components/conversation/ConversationPaneCore'; // 〔A1-P1-B3〕原 R0（js 119236–121300）B5 逐字真身；§9.5 A0 体删碑改指，§9.7 导出面不变；环安全见该叶头注（延迟消费环）

/* ── tombstone（A0-D → A0-CLEANUP2 items 45+46 已接线）：FileOpenWithMenu/buildFilePreviewSource
 *    （原 v_t/__t，FileRewindDialogDeep 110427/110410）与 buildSummaryPanelModel/resolveSummaryPanelVariant
 *    （原 tlt/Uct，TopBar 98133/98016）——属主已补 export，§0 declare 删除，改文件头真实 import。 ── */

/* ============================================================================
 * 0. 外部依赖的类型声明（真实实现位于上面清单所列 chunk；此处为重建接口）
 *    ── A0-D 接线：cn / useIntlContext / Button / Tooltip declare 已删除，
 *       canonical = UtilsCn / I18n（useZCodeIntl）/ button / UsageStatsUiParts
 *       （InfoTooltip），经文件头真实 import 消费；本地 IntlShape/ButtonProps
 *       脚手架随删除。 ──
 * ==========================================================================*/

/* ── A0-CLEANUP2 items 45+46：FileOpenWithMenu/buildFilePreviewSource declare 删除 →
 *    import from './FileRewindDialogDeep'；buildSummaryPanelModel/resolveSummaryPanelVariant
 *    declare 删除 → import from './TopBar'（属主均已导出，形状逐字段吻合）。 ── */

/** 日志器（原 J，logger-PFDwl5Yq.js） */

/** toast（原 m，imeComposition chunk 的 _ 导出） */

/** 遥测平台服务（原 S()，imeComposition chunk 的 j 导出） */
/* ── tombstone〔A1-R125〕①useTelemetryPlatform（原 le，imeComposition chunk 10880 = useContext(PlatformContext) 可空面，
 *    styles 355 `j as S` ≡ 导出 le as j 实证）declare 删改指 ImeComposition::useOptionalPlatform（@236 逐字）；
 *    ②trackEvent（原 xw）declare 删改指 StoresDeep::reportTelemetry（xw@40457 逐字，A1-R36 canonical）；
 *    本地 TelemetryPlatform 空接口零余引用随删。调用点 1354/1385 逐字不变。 ── */

/* --- UI 原语（button / usageStatsUiParts / imeComposition chunk） ---
 * ── tombstone（A0-D）：Button（原 t，button-laUijeDG）与 Tooltip（原 Ia = usageStatsUiParts
 *    u 导出 X InfoTooltip）declare 已删除，经文件头真实 import 消费。 ── */

/** Popover 原语（原 Na/Oa/Ma/ka，usageStatsUiParts 导出） */

/** HoverCard 原语（原 dN/fN/pN，本 chunk jsx 49005；Radix 封装） */
/* ── tombstone（A0-S3c）：HoverCard、HoverCardContent、HoverCardTrigger declare 删除 → 真实 import（文件头导入块）；映射依据见 A0-S3c.report.md。 ── */



/** Badge（原 uJ，本 chunk jsx 70704） */

/** 图标（lucide 风格；原图标块 js 26575–28020 / jsx 23141–25478 + button chunk 导出） */
declare const IconComponent: React.FC<React.SVGProps<SVGSVGElement>>;
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（7）：IconChevronRight/IconChevronLeft/IconChevronDown/IconChevronUp/IconCheck/IconCopy/IconPencil → 真实 import（文件头导入块）：npm lucide-react@1.35.0，其中 button chunk 图标（ChevronLeft/ChevronRight/ZoomIn/ZoomOut）经 './button' pass-1 canonical；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
/* ── tombstone〔A1-P1-B17〕：declare const IconX（登记「Kv / g（关闭）」）删除 → npm lucide-react X as IconX
 * （文件头导入块）。束真身实证：本文件唯一消费位 = v4-pane-close 按钮（@4718）≡ bundle 91840
 * `(0,$.jsx)(g, { className: 'size-4' })`（imeComposition qt=x('x') 关闭图标）。「三面共用」登记更正：
 * bundle 中 QueuePanel 删除钮实为 Kv=trash-2（94737）、SessionBanners 关闭钮为 g（94938）——
 * 各自删碑见 components/conversation/QueuePanel / SessionBanners。 ── */
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（10）：IconGripVertical/IconSend/IconArrowDownToLine/IconSquareTerminal/IconFile/IconBot/IconSparkles/IconTarget/IconGitBranch/IconLightbulb → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
declare const IconCompact: React.FC<React.SVGProps<SVGSVGElement>>; // x_（compact 标记）
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（1）：IconModelChange → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
declare const IconQuestion: React.FC<React.SVGProps<SVGSVGElement>>; // vye（ask-user-question 工具）
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（3）：IconShield/IconThumbsUp/IconThumbsDown → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
declare const IconFork: React.FC<React.SVGProps<SVGSVGElement>>; // Obe
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（4）：IconRewind/IconLoader/IconSpinner/IconInfo → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（7）：IconUpload/IconGlobe/IconGauge/IconClock/IconListTodo/IconMessageSquare/IconCalendar → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */

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
  /* 〔A1-R22〕型缝：四类附件字段自 unknown[] 精化为真形——消费面 bundle 112241–112244 逐 chip 渲染；
   * webElements 解析面 HXe（68781）必携 parsed-web-element-* id；conversationSelections 经 Ds（2827）守护窄化。 */
  codeComments: CodeCommentAttachment[];
  webElements: Array<WebElementContext & { id: string }>;
  pptxElements: PptxElementAddDetail[];
  conversationSelections: ConversationSelection[];
}
declare function parseUserInputContext(
  text: string,
  scope: { workspacePath?: string; workspaceIdentity?: string | null },
): ParsedUserInput;

/* ── tombstone（A1-R22）：declare CodeCommentChips/WebElementChips/PptxReferenceChips/
 *    ConversationSelectionChips（原 TH/lit/JH/uit，js 68298/89989/69036/90087）删除 → 文件头真实
 *    import：CodeCommentsChip/WebElementsChip/SelectionsChip（modules/Composer [B14]/[B17] 逐字
 *    canonical）+ PptxReferencesChip（components/composer/PptxReferencesChip，A1-R21 补 export）；
 *    消费面 bundle 112241–112244 渲染形 props 逐字同构（{comments, contentAlign=end} /
 *    {contexts, contentAlign=end} / {references, onOpen 条件传递} / {references}）。 ── */
/* ── tombstone（A1-R22）：declare useOpenCodeViewerForReference（原 YH，69207）删除 → 文件头
 *    usePptxPreviewOpener 真实 import（components/composer/PptxReferencesChip，A1-R21 补 export）；
 *    bundle 112093 调用面 {workspacePath: t.workspacePath, workspaceIdentity: t.workspaceIdentity,
 *    remoteSessionId: t.workspaceRemoteSessionId, onOpenCodeViewer: t.onOpenCodeViewer} 逐字同构。 ── */

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

/* ── tombstone（A0-D 类型收敛）：本地 ToolCall/ToolCallNode 接口已删除，
 *    canonical = ConversationLeaves 导出（原 u1 归一产物同口径），经文件头
 *    type import 消费；parentToolUseId 等扩展字段经索引签名访问。 ── */

/** 〔A0-S4-4b〕§0 declare 分配：ToolFamily 型别 + classifyToolCall declare 唯一消费面 = §4 ToolBlock，
 * 随迁 components/conversation/ToolCallBlock.tsx（本处删除；编译期擦除，emit 中立）。 */

/* ── tombstone（A0-D 类型收敛）：本地 OpenCodeViewerFn/CodePreviewSettings 已删除，
 *    canonical = ConversationLeaves（OpenCodeViewerFn）/ MarkdownIntegration
 *    （CodePreviewSettings 五字段严格型），经文件头 type import 消费。 ── */

/* ── A0-CLEANUP2 items 17+46：GitSummary（含 branchName: string | null，item 17 目标）
 *    与 SummaryPanelVariant/BackgroundWork/RunningSubagent/SummaryGoal 本地镜像删除 →
 *    type import from './TopBar'（属主导出，逐字段同形；branchName 属主侧已收 string | null）。 ── */

/* ── tombstone（A1-P1-B3）：declare HomeDraftHeader（原 hit 插槽面）/ EmptyStateGreeting（原 Sit 插槽面）
 *    删除——消费面仅 §9.5 A0 体；R0 逐字真身（ConversationPaneCore）直用 DraftComposerRegionMemo（git）/
 *    GreetingHero（Sit）真实 import，无插槽面消费。 ── */
/** off-peak 闲时横幅（原 kit；F15 族 jsx 79222） */

/** 计费折扣徽章（原 hj/_j；F12 族） */

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
export function Collapsible(props: React.ComponentPropsWithoutRef<typeof RadixCollapsibleRoot>) { // 〔A0-S4-4b〕补 export：§4 迁出侧消费（函数声明提升，环安全）
  return <RadixCollapsibleRoot data-slot="collapsible" {...props} />;
}

/** Collapsible 触发器（原 AZ；data-slot=collapsible-trigger） */
export function CollapsibleTrigger(props: React.ComponentPropsWithoutRef<typeof RadixCollapsibleTrigger>) { // 〔A0-S4-4b〕补 export：§4 迁出侧消费（函数声明提升，环安全）
  return <RadixCollapsibleTrigger data-slot="collapsible-trigger" {...props} />;
}

/** Collapsible 内容（原 jZ；展开/收起双向动画类名逐字保留） */
export function CollapsibleContent({ // 〔A0-S4-4b〕补 export：§4 迁出侧消费（函数声明提升，环安全）
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

/* 〔A0-S4-4b〕§2 Quota/PendingCommand 横幅子族（QUOTA_KIND_I18N/QuotaBannerState/resolveQuotaMessageId/
 * formatTokenCount/formatPercent/SessionQuotaBanner/PendingCommandBanner/formatLongRunningElapsed，
 * 原 438–604）整体迁出 → components/conversation/SessionBanners.tsx。
 * QuotaBannerState 补 export（§9 型别消费）；IconZap/BillingDiscountNote declare 随迁；IconX 复制。 */
export { SessionQuotaBanner, PendingCommandBanner } from '../components/conversation/SessionBanners';
export type { QuotaBannerState } from '../components/conversation/SessionBanners';
/* 〔A0-S4-4b〕§3 Queue 子族（QueueItem/QueueState/computeQueueReorderMove/dnd declare 8 件/
 * QueueItemRow/QueuePanel/MemoQueuePanel，原 605–909）整体迁出 → components/conversation/QueuePanel.tsx。
 * QueueState 补 export（§9 SessionQueueSnapshot extends 消费）；MemoQueuePanel 补 export（§9 渲染点消费）。 */
export { QueuePanel, QueueItemRow } from '../components/conversation/QueuePanel';
/* 〔A0-S4-4b〕§4 ToolBlock 子族（状态/错误/显示模型 + ToolLayout + Reasoning 三件 +
 * ToolCallBlock + ShellToolView，含内联 declare 15 件，原 910–2128）整体迁出 →
 * components/conversation/ToolCallBlock.tsx。ShellToolView 别名面（ShellToolViewImpl）保留。 */
export { ToolLayout, ToolCallBlock, ShellToolViewImpl as ShellToolView, Reasoning, ReasoningTrigger, ReasoningContent } from '../components/conversation/ToolCallBlock';
declare function buildPlanResultMarkdown(toolCall: ToolCall, fallback: string): { markdown: string }; // 原 §4 内联 declare 随迁；§5 留守面（2373）消费，按消费方复制（编译期擦除，emit 中立）
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
  onOpenFileLink?: (link: FileLinkModel) => void;
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
/* ── tombstone（A0-D 类型收敛）：本地 FileRewindPreview 已删除，canonical =
 *    GitReview 导出（safeFiles/unsafeFiles/ignoredFiles/canApply），经文件头
 *    type import 消费。 ── */

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

/* ── tombstone（A1-P1）：原 Y_t 本地副本删除——canonical = components/conversation/ConversationPaneHelpers
 *    GOAL_COMMAND_REGEX（js 111720 逐字）；本副本树内零消费（负证据：仅旧 prefixGoalCommand 互引，同批删）。 ── */

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

/* ── tombstone（A1-P1）：原 X_t 语义副本（D8 期 prefixGoalCommand）删除——bundle 唯一真身 =
 *    components/conversation/ConversationPaneHelpers prefixGoalCommand（js 111741 逐字，iwt 119229 消费）；
 *    双实例裁定：本副本树内零终端消费（负证据），bundle 111741 为唯一真身。 ── */

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

/** 用户输入解析后的部件（原 ZHe：text/file/directory/skill/session/plugin/subagent/command）。
 *  A1-R12：本地联合删除 → 别名指向 FileMentionDragHelpers.MentionToken（bundle 唯一真身，一符一家）。 */
type UserInputPart = MentionToken;
/* ── tombstone（A1-R12）：declare splitUserInputParts（原 ZHe，52182）删除 → 文件头
 *    ../components/composer/FileMentionDragHelpers import 消费（本批逐字转录；调用点 767 逐字不变）。 ── */
/* ── tombstone（A1-R13）：declare isPluginIconUrl（原 oV，64277）删除 → 文件头 ./Composer
 *    import 别名消费（canonical = isHttpUrl，bundle 唯一真身；三归属收敛：Composer 本地转录 +
 *    PluginLeaves isHttpsUrl 副本 + 本 declare → Composer 一家；调用点 740 逐字不变）。 ── */
/* ── tombstone（A1-R12）：declare formatSkillMentionLabel（原 YHe，52147）删除 → 文件头
 *    ../components/composer/FileMentionDragHelpers import 消费（本批逐字转录；调用点 688 逐字不变）。 ── */

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
  const openCommentInViewer = usePptxPreviewOpener({ // A1-R22：原 useOpenCodeViewerForReference declare 改指（YH 69207；bundle 112093 参数形逐字同构）
    workspacePath: context.workspacePath,
    workspaceIdentity: context.workspaceIdentity,
    remoteSessionId: context.workspaceRemoteSessionId,
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
          <CodeCommentsChip /* A1-R22：原 CodeCommentChips declare 改指（TH 68298） */ comments={parsed.codeComments} contentAlign="end" />
          <WebElementsChip /* A1-R22：原 WebElementChips declare 改指（lit 89989） */ contexts={parsed.webElements} contentAlign={`end`} />
          <PptxReferencesChip /* A1-R22：原 PptxReferenceChips declare 改指（JH 69036） */ references={parsed.pptxElements} onOpen={context.onOpenCodeViewer ? openCommentInViewer : undefined} />
          <SelectionsChip /* A1-R22：原 ConversationSelectionChips declare 改指（uit 90087） */ references={parsed.conversationSelections} />
        </div>
        {visibleContent ? (
          <UserInputCollapsibleText contentText={visibleContent} rowId={row.rowId}>
            <UserInputRichText text={visibleContent} attachments={row.attachments ?? []} contextAttachmentCount={countContextAttachments(parsed as AttachmentContextBundle)} />
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
  previewCards?: PreviewCardModel[];
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

/* ── tombstone〔A1-R96〕：declare normalizeToolCallNode（原 u1，旧注 js 110158 系漂移——束真身 110206–110239）删除。
 *    束真身逐字实体化于 ../components/conversation/ToolStatusModel（工具行归一域 110168–110239，
 *    含 r_t/i_t/a_t/l1/o_t 依赖链；childToolCalls = [] 束形——旧注「按 parentToolUseId 归组」为 A0 推测，束体无此行为）。
 *    本叶消费位 1786/1920 改文件头真实 import，调用面逐字不变。 ── */

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
  assistantPreviewCards?: PreviewCardModel[];
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

/* ── tombstone〔A1-P1-B16〕：手写 toApiRetryViewModel/ApiRetryLoadingSlot（原 kvt/x1，styles 112803/112814）+
 * declare LoadingSkeleton（原 Llt，99534）删除——束真身已逐字实体化于 components/conversation/ChatLoadingSlot
 * （I3e 消费位 112823 束体；data-testid 手写期误值 `v4-chat-loading` 随收敛更正为束真身 chatLoadingTestid=`chat-loading`；
 * R25 双实例收敛判例）。三消费位（原 2670/2712/2796）经文件头 import 同名改指，逐字不变。 ── */
/* ── tombstone〔A1-P1-B15〕：declare ApiRetryView（原 I3e）删除——束真身 76860–76879 已逐字实体化为
 * components/shell/Home §T.3 ApiRetryStatusChip（modules/Home 转导出；P3-B11 分发归 P1 办结）；
 * 〔A1-P1-B16〕x1 收敛后本文件无剩余消费，import 别名同批除名。 ── */

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

/* ── tombstone（A0-D 类型收敛）：本地 AutomationCardModel 已删除，canonical =
 *    ConversationLeaves 导出（automation: AutomationModel），经文件头 type import 消费。 ── */
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
  onOpenFileLink?: (link: FileLinkModel) => void;
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
  onOpenFileLink?: (link: FileLinkModel) => void;
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
                          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                            event.stopPropagation();
                            openFileChangeInViewer(item, context);
                          }}
                          onPointerDown={(event: React.MouseEvent<HTMLButtonElement>) => event.stopPropagation()}
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
export interface TurnRenderUnit { // 〔A0-S4-4b〕补 export：§6 迁出侧型别回取（型别擦除，环安全）
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

/* ── tombstone〔A1-P1-B17〕：declare isApiRetryEligible（原 Wgt，styles 110071–110081；jsx 94075）删除 →
 * 一符一家收敛 components/conversation/ConversationPaneHelpers isApiRetryEligible 逐字实体（同叶 Ugt→
 * hasRunningTimelineMarkers 携带；Vgt/Hgt 同域 B4 既录先例）。消费面实证（2 处）：本文件 Rvt 重建体
 * @2622（≡ bundle 113056）+ Bvt 重建体 @2723（≡ bundle 113148），逐字不变。 ── */
/* ── tombstone〔A1-P1-B17〕：declare buildAssistantPreviewCards（原 Bgt，styles 110008–110052；jsx 94019）
 * 删除 → 一符一家收敛 components/conversation/PreviewCardLinkBlocks useAssistantPreviewCards 逐字实体
 * （Pgt/Fgt/Igt/c1/Lgt/Rgt/zgt 同叶携带，段 [109916,110052]；深依赖 xgt/Ngt/jgt/Mgt/Agt/s1/r1/n1 均该叶
 * B15/B16 既录）。消费面实证（2 处，别名保调用名逐字不变）：本文件 @2629（≡ bundle 113063）+ @2731
 * （≡ bundle 113156）。型缝：canonical 形参/返回为 B5 `any` 缝，消费面 previewCards 下游 PreviewCardModel[]
 * 型面逐字不变。钩子序：Bgt 束体 useMemo/useState/useEffect 面逐字保留，调用位组件渲染期序不变。 ── */

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
  assistantPreviewCards?: PreviewCardModel[];
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
  const automationCards = React.useMemo(
    () =>
      unit.isRunning
        ? []
        : collectAutomationCards(
            unit.assistantWorkRows as unknown as Array<{ kind: string; status: string; toolName: string; rowId: number; toolCallId: string; [key: string]: unknown }>,
          ),
    [unit.assistantWorkRows, unit.isRunning],
  );
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

/* 〔A0-S4-4b〕§6 TurnNavigator 子族（导航项构造/预览截断/视觉聚焦/水合判定 +
 * TurnNavigatorImpl/TurnNavigator，原 4618–5024）整体迁出 → components/conversation/TurnNavigator.tsx。
 * TurnRenderUnit 型别留守 §5（4124 补 export），组件侧 type import 取回。 */
export { TurnNavigator } from '../components/conversation/TurnNavigator';
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
  searchResultHighlightRequest?: { taskId?: string; requestId?: number; query?: string; snippet?: string; snippetIndex?: number; [key: string]: unknown } | null; // A1-R3 收敛：bundle requestId = Ze.current++（js 120309，number 面）；query 运行期恒在而 shell 面未声明，宽为可选
  onSearchResultHighlightDone?: (requestId: number) => void; // A1-R3 收敛：同上 number 面
  scrollToUnit: (unitIndex: number) => void;
}) {
  const findEnabled = sessionPhase !== `running` && sessionPhase !== `prewarming`;
  const findIndex = React.useMemo(() => (findEnabled ? buildFindIndex(renderUnits, conversationFindQuery) : buildFindIndex([], ``)), [conversationFindQuery, findEnabled, renderUnits]);
  const searchIndex = React.useMemo(
    () => (findEnabled && searchResultHighlightRequest ? buildFindIndex(renderUnits, searchResultHighlightRequest.query ?? ``) : buildFindIndex([], ``)), // A1-R3：query 宽化后空串兜底
    [findEnabled, renderUnits, searchResultHighlightRequest],
  );
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const activeMatchKey = React.useRef<FindMatchKey | null>(null);
  const lastQuery = React.useRef(``);
  const lastRequestedIndex = React.useRef(conversationFindActiveIndex);
  const lastFindSignature = React.useRef(``);
  const lastLoadOlderSignature = React.useRef(``);
  const lastSearchLoadSignature = React.useRef(``);
  const lastSearchRequestId = React.useRef<number | null>(null); // A1-R3 收敛：requestId number 面（bundle js 120309）
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
      if (!canLoadMore) onSearchResultHighlightDone?.(request.requestId as number); // A1-R3：生产面恒赋值（js 120309），可选面非 any 收窄
      return;
    }
    if (lastSearchRequestId.current !== (request.requestId ?? null)) {
      lastSearchRequestId.current = request.requestId ?? null; // A1-R3：可选面 → ref 空合归一
      scrollToUnit(match.unitIndex);
    }
    const frame = window.requestAnimationFrame(() => {
      const root = rootRef.current;
      if (!root) return;
      const range = applySearchResultHighlight({ root, query: request.query ?? ``, match }); // A1-R3：query 宽化后空串兜底
      if (range) {
        lastSearchRequestId.current = request.requestId ?? null; // A1-R3：可选面 → ref 空合归一
        scrollRangeToCenter(range);
        if (searchClearTimer.current !== undefined) window.clearTimeout(searchClearTimer.current);
        searchClearTimer.current = window.setTimeout(() => {
          clearSearchResultHighlight();
          onSearchResultHighlightDone?.(request.requestId as number); // A1-R3：生产面恒赋值（js 120309），可选面非 any 收窄
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
  searchResultHighlightRequest?: { taskId?: string; requestId?: number; query?: string; snippet?: string; snippetIndex?: number; [key: string]: unknown } | null; // A1-R3 收敛：requestId number 面（bundle js 120309）
  onSearchResultHighlightDone?: (requestId: number) => void; // A1-R3 收敛：同上
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
      const measured = loadAnchor ? virtualizer.measurementsCache.find((entry) => entry.key === loadAnchor.key) : undefined;
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

/** 列表虚拟化（原 to=useVirtualizer，esm-BY6T6pIH.js）。A0-S3a：vendored declare 删除——
 *    本件实为 @tanstack/react-virtual useVirtualizer（真实 import 见文件头）的语义别名：
 *    调用面（count/getScrollElement/estimateSize/overscan/getItemKey/measureElement）与
 *    返回面（getVirtualItems/getTotalSize/getVirtualItemForOffset/scrollToIndex/measure/
 *    measureElement/measurementsCache/scrollOffset/scrollRect/
 *    shouldAdjustScrollPositionOnItemSizeChange）均为真实 Virtualizer 成员，逐字吻合。 */
const useMessageListVirtualizer = useVirtualizer;

/* ============================================================================
 * 9. Pane 子族（会话快照/面板头/插件门/会话面板 R0/编排器 PTt）
 * ==========================================================================*/

/* --- 9.1 会话快照（原 k0/TCt，js 118675 / jsx 100917–100933） --- */

interface SessionQueueSnapshot extends QueueState {}
/** 原 rke 条目（bundle js 33140）：快照 subagents.running 运行中子代理条目 */
export interface SubagentRunningSnapshot {
  childSessionId: string;
  agentId?: string;
  toolCallId?: string;
  subagentType: string;
  title: string;
  summary?: string;
  status: "running" | "waiting" | "blocked";
  startedAt?: number;
}
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
  subagents?: { revision: number; childSessionIds: string[]; running: SubagentRunningSnapshot[]; endedTotal: number };
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

/* A0-CLEANUP4：导出——SidePanel SessionHandle（原 ET acquire 返回面，js 40347）的 store 字段同形 */
export interface SessionStoreHandle {
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
 * 原 k0（js 118692 / jsx 100929）：会话快照订阅（useSyncExternalStore）。
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

/* ── tombstone（A1-P1）：原 $Ct 本地副本（jsx 101340 注）删除——canonical =
 *    components/conversation/ConversationPaneHelpers EMPTY_SUBAGENT_DIRECTORY
 *    （js 119197 逐字真身）；消费点（subagents ?? 兜底）经文件头 import 改指，逐字不变。 ── */

/* hw（js 39814 / jsx 35820）：〔A1-P1-B6〕死 declare 删碑——本面零消费（grep 实证）；真身 components/feedback/FeedbackCenter
   hasOlderRows（js 39814 逐字、语义局部名实体化），消费面 ConversationPaneCore 经 modules/FeedbackCenter shim 255 import 收敛。 */

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

/* --- 9.4/9.5 tombstone 组（〔A1-P1-B3〕：R0 逐字真身迁出） ---
 * ── tombstone（A1-P1-B3）：§9.4 命令层声明群（CommandAck/ConversationCommandLayer/
 *    useConversationCommandLayer/K1 pendingCommandLedger/PendingCommandEntry/OCt
 *    useRecoverablePendingCommands，原 4820–4873 段）删除——消费面仅 §9.5 A0 体；
 *    R0 逐字真身本批落地 components/conversation/ConversationPaneCore，该叶持同面
 *    declare 群（§0 声明随族迁；K1 消费面 119487–120297、OCt 消费面 119880 在该叶）。 ──
 * ── tombstone（A1-P1-B3）：§9.5 ConversationPane A0 体（原 R0，js 119219–121283 /
 *    jsx 101388–103090；D8 期「接口归纳 + 部分逐字」~700 行）删除——B5 逐字真身
 *    （js 119236–121300，2,065 行，230 内部局部保留混淆名，109 外部消费面 323 处
 *    AST 改名，往返核对逐字吻合）落地 components/conversation/ConversationPaneCore；
 *    本面经文件头 import 再导出，§9.7 ConversationPane 导出面不变
 *    （SplitLayoutUiDeep 890/1453 消费面逐字不变）。
 *    A0 体附属声明随删/迁：useSessionSupervisor/useUsageSupervisor（wT/SFe 面）、
 *    usePaneCommandEnvironment（ET 面）、useBaseServicesContext/useWorkspaceBaseServices
 *    （fs/Ec 面）→ 该叶真实 import（services/telemetryScopes、modules/services）；
 *    shouldShowSummaryPanel（Wct）/useRecoverablePendingCommands（OCt）/
 *    ConversationPaneProps → 迁该叶 declare 群；setSelectionSideChatBusy（boe 面，
 *    A0 注 2664 漂移）/ConversationInteractionsSlot（pSt 插槽面）随 A0 体删除
 *    （该叶逐字面无此消费：选区忙碌 ≡ setSelectionSubscribed 面、交互覆盖层 ≡
 *    ConversationInteractionsOverlay 直用）。 ──
 */

/* ── tombstone（A1-R3）：9.6 编排器（原 PTt 之 A0 近似实现，含本地
 *    SplitPaneBinding/SplitPaneDescriptor 型 + flattenPaneTree/dividerStyle/
 *    SplitPaneHost/SplitDivider 四 declare）已删除——A1-R3 以
 *    modules/SplitLayoutUiDeep.tsx 逐字重建 PTt 域（B5；含 $wt/tTt/Xwt/Zwt 等
 *    全部叶子），WorkspaceShell 改指新模块消费。已知偏差（resolvePaneBinding
 *    组面返回 null、关闭面板不解析下一活动绑定、拖放 stub）随删除一并消除。 ── */

/* --- 9.7 导出（本文件对外接口；〔A0-S4-4b〕迁出符号改经上方/下方 re-export 面，留守符号仍走本块） --- */

export {
  /* Pane */
  ConversationPane,
  /* ── tombstone（A1-R3）：ConversationOrchestrator 导出已删除——PTt 逐字重建
   *    迁至 modules/SplitLayoutUiDeep.tsx（消费侧 WorkspaceShell 改指该模块）。 ── */
  PaneFloatingHeader,
  PluginIconGate, // 〔A1-P1-B3〕补 export：R0 逐字真身（ConversationPaneCore）121242 消费面回取（原留守面仅 §9.5 A0 体文件内消费）
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
  /* Find */
  useConversationFind,
  ConversationSelectionTooltip,
  buildFindIndex,
};
