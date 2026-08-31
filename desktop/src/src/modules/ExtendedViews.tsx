/* eslint-disable */
/**
 * ============================================================================
 * ExtendedViews.tsx — ZCode 3.7.6 扩展视图族（D8 Stage B3 · 解混淆重建）
 * ============================================================================
 *
 * 来源文件（融合 chunk，213,695 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js
 * 对照文件（同一 chunk 的 pretty-print 版；行号口径 js / jsx 双登记）：
 *   /home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx
 *
 * 本文件展开 SidePanel.tsx / Settings.tsx 中以接口保留的六个大体积叶子视图：
 *   §1 RepoWikiView        （原 l3，F16 族根，侧面板 repo-wiki 标签 / 主视图分支）
 *   §2 TreemappingView     （原 AGt，F04 侧面板叶子）
 *   §3 WhiteboardCanvas    （原 FGt，F04 侧面板叶子）
 *   §4 ModelTrajectoryView （原 tKt，F04 侧面板叶子）
 *   §5 DeveloperToolsView  （原 mKt，F04 侧面板叶子）
 *   §6 AutomationsMain 视图态（原 d6，F15 族根；编辑器/闲时编辑器叶子保留接口）
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号格式：融合chunk js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 * §1 RepoWikiFamily（F16；js 132042–134110 / jsx 111381–112421）
 *   l3   → RepoWikiView            仓库 Wiki 主视图 (132306 / 111550)
 *   RAt  → WikiProjectCard         当前项目卡（名称/停止/元数据 details/进度）(133071 / 112122)
 *   zAt  → WikiPageRenderer        Wiki 页面分帧 Markdown 渲染 (133156 / 112164)
 *   BAt  → CollapsiblePanelShell   左栏折叠壳（竖排标题/展开收起）(133241 / 112232)
 *   VAt  → WikiProjectList         项目列表（展开/选中/节点树挂载）(133288 / 112244)
 *   HAt  → WikiGenerateEmptyState  空态生成卡（语言/模型/重试/图表开关）(133354 / 112277)
 *   UAt  → WikiPagePendingCard     待生成页占位卡 (133594 / 112387)
 *   WAt  → WikiTaskProgress        任务进度条（页数/百分比/当前页/错误）(133625 / 112400)
 *   bAt  → WikiCatalogTree         目录树 (132042 / 111381)
 *   xAt  → WikiCatalogTreeNode     目录树节点（递归）(132074 / 111404)
 *   s3   → RepoWikiLogoIcon        自定义 SVG 图标（四格+斜线）(132161 / 111452)
 *   u3   → WikiMetaRowGrid         元数据行（网格）(133666 / 112415 附近)
 *   d3   → WikiMetaRowInline       元数据行（内联）(133679 / 112418 附近)
 *   SAt/CAt/wAt/TAt/EAt/DAt/OAt → buildWikiCatalogTree 族（目录树构造）(132192–132286 / 111458–111529)
 *   kAt/AAt → pickEntryProjectId / resolveInitialProjectId (132287,132290 / 111532,111535)
 *   c3/jAt/MAt/NAt/PAt/FAt/IAt/LAt → WIKI 常量（默认重试0/上限5/重试节流10s/分块8k/首屏12k/每帧2块/窄栏560px/模型不锁定）(132298–132305)
 *   纯助手：f3/YAt/XAt/ZAt/p3/QAt/$At/ejt/tjt/m3/njt/rjt/ijt/ajt/ojt/sjt/cjt/
 *           h3/ljt/ujt/djt/fjt/pjt/mjt/hjt/gjt/g3/_jt/vjt/yjt/bjt/_3/xjt/Sjt/
 *           Cjt/wjt/v3/Tjt/Ejt/Djt/Ojt/kjt/Ajt/jjt/GAt (133693–134110 / 112421+ 及前段)
 *
 * §2 TreemappingFamily（F04；js 178920–179887 / jsx 145022–145637）
 *   AGt  → TreemappingView         树图主视图（摘要/树布局/选中详情）(179493 / 145507)
 *   M5   → TreemapStatCard         摘要统计卡 (179672 / 145570)
 *   N5   → DiffCountBadge          +N/-M 计数 (179681 / 145576)
 *   jGt  → TreemapEmptyState       空态（运行中计数）(179694 / 145583)
 *   MGt  → TreemapDirectoryNode    目录块（flex 加权布局，递归）(179710 / 145599)
 *   NGt  → TreemapFileNode         文件块（权重/选中/待处理脉冲）(179766 / 145618)
 *   PGt  → WHITEBOARD_PALETTE      白板色板（在 §3 用，定义于此段 179886 / 145637）
 *   事件采集：rGt/aGt/iGt/oGt/ZWt/QWt/$Wt/eGt/nGt/tGt/sGt/lGt (179050–179317 / 145196–145312)
 *   树构造：uGt/xGt/SGt/O5/CGt/wGt/TGt/k5/A5/EGt/DGt/OGt/j5/kGt/gGt/_Gt/vGt/yGt/bGt
 *           (179318–179492 / 145334–145506)
 *   基座：b5/x5/S5/VWt/C5/HWt/w5/UWt/WWt/GWt/T5/KWt/qWt/JWt/YWt/XWt
 *           (178920–179049 / 145022–145195)
 *   常量：dGt=6/E5=14/D5='.'/fGt=64/pGt=34/mGt=52/hGt=24 (179341–179347)
 *
 * §3 WhiteboardFamily（F04；js 179888–180199 / jsx 145638–145797）
 *   FGt  → WhiteboardCanvas        白板画布（画笔/橡皮/色板/线宽/撤销重做/清空/命名/入聊天）(179888 / 145638)
 *
 * §4 ModelTrajectoryFamily（F04；js 180193–180869 / jsx 145798–146289）
 *   tKt  → ModelTrajectoryView     模型调用轨迹查看器 (180606 / 146115)
 *   RGt  → useModelTrajectory      轨迹数据钩子（代际防竞态）(180193 / 145806)
 *   P5   → TrajectoryPartRenderer  消息 part 渲染（text/reasoning/tool-call/tool-result/image）(180200 / 145853)
 *   zGt  → TrajectoryToolBlock     工具调用/结果折叠块 (180241 / 145884)
 *   BGt  → TrajectoryToolIdBadge   toolId 徽章 (180263 / 145894)
 *   VGt  → TrajectoryCollapsible   折叠段壳 (180270 / 145907)
 *   HGt  → TrajectoryPayloadPre    payload pre 块 (180292 / 145922)
 *   UGt  → TrajectoryUsageBadge    in/out token 徽章 (180299 / 145927)
 *   F5   → TrajectoryStatusText    空态/加载/错误居中文案 (180315 / 145938)
 *   WGt  → summarizeTrajectory     汇总（总 token/模型集）(180328 / 145945)
 *   GGt  → stringifyPayload        (180341 / 145959)
 *   KGt  → TrajectoryRecordCard    单次调用卡（头/输入/输出/错误）(180352 / 145968)
 *   qGt  → TrajectorySourceBadge   调用源徽章 (180443 / 146000)
 *   JGt  → resolveSourceLabelId    (180462 / 146018)
 *   YGt  → ROLE_STYLES             角色样式表 (180487 / 146048)
 *   XGt  → TrajectoryMessageBlock  输入消息块 (180509 / 146070)
 *   ZGt  → TrajectoryOutputBlock   输出块 (180540 / 146085)
 *   QGt  → TrajectorySection       分段标题 (180568 / 146098)
 *   $Gt/eKt → formatTime/formatDuration (180580,180590 / 146108,146112)
 *   nKt/rKt/iKt/aKt/oKt → 目录解析/记录列表/输入消息去重 (180752–180800 / 146205–146240)
 *
 * §5 DeveloperToolsFamily（F04；js 180802–181215 / jsx 146243–146387）
 *   mKt  → DeveloperToolsView      开发者工具面板（token 缓存统计 + 网络事件流）(180870 / 146290)
 *   sKt/cKt → EMPTY_ROUNDS/EMPTY_NETWORK_ENTRIES (180802 / 146243)
 *   I5/lKt/uKt/dKt → 数值/百分比/毫秒/时刻 格式化 (180806–180830 / 146245–146259)
 *   fKt  → resolveNetworkStatusLabelId (180836 / 146268)
 *   pKt  → NetworkHeadersDetails   请求/响应头 details 表 (180847 / 146282)
 *
 * §6 AutomationsMainFamily 视图态（F15；js 134385–139924 选段 / jsx 113296–115911+）
 *   d6   → AutomationsMain         自动化主视图（列表态/编辑器路由态/闲时态）(138823 / 115911)
 *   ANt  → AutomationSchedulePill  下次运行胶囊（溢出 tooltip）(138513 / 115689)
 *   ZNt  → AutomationCardMenu      卡片 ⌄ 菜单（运行/重启/暂停/编辑/删除）(138713 / 115876)
 *   L3   → AutomationCreateSplitButton 手动创建+⌄（经聊天创建）(134567 / 113451)
 *   INt  → OffPeakCreateButton     闲时任务创建按钮（灰态 tooltip）(138634 / 115771)
 *   tMt  → KeepAwakeBanner         运行期间保持唤醒开关条 (134542 / 113438)
 *   Gjt  → SwitchToggle            胶囊开关（绿/蓝，sm/default）(134441 / 113337)
 *   uMt/Njt → OffPeakTemplateIcon/AutomationTemplateIcon (134931,133990 / 113575,112749)
 *   lMt/Mjt → 模板图标映射表 (134923,133984)
 *   Pjt  → OFFPEAK_TEMPLATE_IDS    闲时模板（standupGitSummary/ciFlakyReport/documentationSyncCheck）(133989 / 112762)
 *   LNt  → SCHEDULED_TEMPLATES     定时模板（晨间简报/风险扫描/发布周报/文档同步）(138654 / 115784)
 *   BNt/VNt/HNt → 标签/模板可见性决策 (138662,138665,138668 / 115803,115809,115812)
 *   UNt  → LIFECYCLE_PRESENTATION  生命周期图标/色 (138675 / 115823)
 *   WNt/GNt/KNt/qht/Kht → 提示词归一/失败态/可操作态/生命周期档位 (138681,138685,138688 / 115841,115845,115848；qht/Kht js 109250,109243 / jsx 93279,93276)
 *   u6/qNt/JNt → 错误 i18n id 构造 (138698,138691,138701 / 115854,115851,115857)
 *   YNt/XNt → openAutomationId 深链解析 (138704,138708 / 115860,115864)
 *   MNt/NNt/PNt/FNt → 自动化遥测（模型字段/脱敏/创建结果/点击）(138563,138575,138591,138612 / 115713,115725,115735,115752)
 *   Vjt/Hjt/Ujt/Wjt → 闲时创建遥测 (134385,134396,134421,134425 / 113296,113307,113330,113334)
 *   Ijt/Ljt → 闲时可用性/剩余时间文案 (133996,134010 / 112770,112778)
 *   Tit/Dit/Eit → coding plan 支持判定/闲时错误 id (91347,91357 / 78933,78941)
 *   rgt/egt/ngt → 频率/下次运行文案 (109525,109499 / 93602,93576)
 *   AMt  → buildAutomationModelSelectGroups (135384 / 113829)
 *   H3   → AUTOMATIONS_MAIN_CONTAINER_CLASS (135261 / 113750)
 *   zMt/RMt/J3 → 远程标签判定 (135501,135375 / 113941,113820)
 *   c6/l6 → 自动化主视图 toast 锚点/带锚点 toast (138628 / 115768)
 *   图标包装族（E3 尺寸基座 + D3/Kjt/O3/qjt/k3/A3/Jjt/Yjt/j3/Xjt/M3/N3/P3/Zjt/F3/sMt）
 *          (134460–134540 / 113356–113436)
 *
 * ----------------------------------------------------------------------------
 * 二、外部依赖清单（跨 chunk 导入；标注来源 chunk 与导出字母）
 * ----------------------------------------------------------------------------
 *  1. react / jsx-runtime           react-BQLj9xdT.js、jsx-runtime-B5yMD3-t.js
 *  2. cn() 类名合并 (Z)              utils-CEEH0K_K.js
 *  3. Button (X) / createLucideIcon (Sa) / chevron-right (wa=o)
 *                                   button-laUijeDG.js
 *  4. useIntlContext (G) → {intl, locale}   IntlProvider-C321H7m8.js
 *  5. usePlatformService (l)、toast (m)、Input (P)、spinner (M=w)、x 图标 (g=b)、
 *     alert-triangle (N=x)、moon (p=T)      imeComposition-DEYFkwWm.js
 *  6. Tooltip (Ia)、Popover 原语 (Na/Oa/Ma/ka)  usageStatsUiParts-CiR7YEhh.js
 *  7. logger (J)                    logger-PFDwl5Yq.js
 *  8. zustand create (Ae)、useTaskStore (xe=h)、白板 store (Oe=o)、画布绘制 (ke=p)、
 *     笔画构造 (ve=d)、默认色 (_e=c)、加入聊天 (ye=f)、工作区键 (Te=l)、
 *     模型供应商配置选择器 (fe=U)、会话状态选择 (H=F)   skillStore-BmeKHDBI.js
 *  9. testid 常量（on/jr/Bte/Mte/Nte/Fn/at/Xn/Et）、provider id 常量 (q=mo)、
 *     工作区键 (ene=n、Ti=to)、模型串解析 (Zn=P)、错误分类 (ri=et)、
 *     遥测上报 (xw)、默认供应商常量 (vee=Z)   src-HCld2afU.js
 * 10. 本 chunk 内原语：Select (iO/oO/aO/sO/cO 46009–46100)、Checkbox (DC 37297)、
 *     AlertDialog ($4…a3 131966–132040)、Tabs (hC/gC/_C/vC 36949–36991)、
 *     DropdownMenu (VO… 47926)、Collapsible (kZ/AZ/jZ 94925)、Badge (uJ 80303)、
 *     ScrollArea (Y3 136026)、Panel 布局 (X4/Z4/Q4 131934–131944)、
 *     Markdown 渲染器 (cj，F19)、文件显示 (zc/Vc/Bc)、basename (Go 1928)、
 *     isAbsolute (Ko 1941)、dirname (sae 1932)、模型解析 (Mg 24406)、
 *     设置钩子 (JM 53488)、模型注册表 (qq 78243)、权益 (sX 88303)、
 *     coding plan 升级 (fX 89100)、漏斗助手 (FM 53267 / LM 53299 / PM 53253)、
 *     浅比较选择器工厂 (co 1033)、设置 store 上下文钩子 (Ao 1301)、
 *     代码预览默认 (lo 1040)
 *     （A1-R24 cn 行漂移专项：Mg/JM/qq/sX/fX/FM/LM/PM 行号按当前 bundle 实测校正）
 * ============================================================================
 */

import * as React from "react";
import { ShadcnTooltipProvider as PopoverRoot } from './UsageStatsUiParts'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { Select as SelectRoot } from './Settings'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { AlertDialog as AlertDialogRoot, AlertDialogTrigger } from '../components/ui/alert-dialog'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown-menu'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { Collapsible as CollapsibleRoot, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { ScrollArea } from '../components/ui/scroll-area'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { LoaderCircle as SpinnerIcon } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0（映射依据见 A0-S3b.report.md）
import { Button, createLucideIcon } from './button'; // A0-CLEANUP 族清理：Button/createLucideIcon declare 改指 button chunk
import { ModelSelector, type ModelGroup } from './Composer'; // A0-CLEANUP2 item 10：属主导出后接线（原 vq，js 75527）
import { Input, Popover, PopoverContent, PopoverTrigger, toast, type ToastOptions } from './ImeComposition'; // ToastOptions 原属 imeComposition chunk（与 toast 同主）
import { MarkdownRenderer } from './MarkdownIntegration';
import { FilePathInline, pathBasename, resolveFileDisplayInfo } from './ModalsLeaves';
import { Badge } from './PaymentDeep';
import { AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, SelectContent, SelectItem, SelectTrigger, SelectValue } from './Settings';
import { AutomationEditor, OffPeakTaskEditor, type ScheduleRule } from './SettingsLeaves'; // A0-CLEANUP3 3b：Automation 三型 scheduleRule 统一
import { createWhiteboardStroke, logger, useTaskStore, useWhiteboardStore, type TaskStore, type WhiteboardBoard, type WhiteboardStroke, type WorkspaceTaskState } from './SkillStore';
// 〔A1-R25〕w6e 77856 实体化：resolveModelGroupLabel declare 收敛——改接 Home §U.9 逐字真身（经 modules/Home 转导出）
import { resolveModelGroupLabel } from './Home';
import { providerIds } from './SrcSharedA';
import { automationsWorkspaceKey, repoWikiWorkspaceKey } from './SrcSharedB';
import { reportTelemetry, type TelemetryPlatform } from './StoresDeep'; // A0-CLEANUP3 3b：遥测助手形参具型
import { useServices } from './services';
import { useAutomationsStore } from './stores-tasks';
import { cn } from './UtilsCn'; // 原 Z（utils-CEEH0K_K.js）
import { InfoTooltip as Tooltip } from './UsageStatsUiParts'; // 原 Ia（A0-CLEANUP 族清理：本地 Tooltip declare 改指 InfoTooltip）
import type { CodeViewerSource } from './SidePanel'; // 代码查看源以侧面板导出形为准（type-only，无运行时环）

/* ============================================================================
 * 0. 外部依赖的类型声明（真实实现位于上面清单所列 chunk；此处为重建接口）
 * ==========================================================================*/


/** react-intl 风格 intl（原 G()，IntlProvider-C321H7m8.js） */
interface IntlShape {
  formatMessage(descriptor: { id: string }, values?: Record<string, unknown>): string;
}
declare function useIntlContext(): { intl: IntlShape; locale: string };

/** 日志器（原 J，logger-PFDwl5Yq.js） */

/** toast（原 m，imeComposition chunk）；l6 在其上加自动化锚点。ToastOptions 已接线 ImeComposition 导出 */

/** 桌面平台服务（原 l()，imeComposition chunk）——仅列本族用到的面 */
interface PlatformService {
  openInFileManager(path: string): Promise<{ success: boolean; error?: string }>;
  openExternal?(url: string): void | Promise<void>;
  onSettingsChanged?(cb: () => void): () => void;
  /* A0-CLEANUP3 3b：同一平台服务兼遥测面（StoresDeep.TelemetryPlatform 消费面；bundle 真值） */
  reportTelemetryEvent(report: Record<string, unknown>): Promise<void> | void;
  reportArmsCustomEvent(event: { name: string; group?: string; value?: number | string; [key: string]: unknown }): Promise<void> | void;
}
declare function usePlatformService(): PlatformService;

/* --- 服务袋（原 fs()，本 chunk 2638 useServices） --- */

interface Disposable {
  dispose(): void;
}

interface ModelProviderInfo {
  id: string;
  name?: string;
  source?: "system" | "custom" | string;
  enabled?: boolean;
  systemDisabledReason?: string | null;
  endpoints?: { baseURL?: string };
  [key: string]: unknown;
}

interface ModelProviderService {
  getAllCached(): Promise<ModelProviderInfo[]>;
  onDidChangeProviderRegistry(cb: () => void): Disposable;
}

/* --- Wiki 数据模型 --- */

interface WikiPage {
  id: string;
  title: string;
  description?: string | null;
  markdown: string;
  order: number;
  parentId?: string | null;
  filePaths?: string[];
}

interface WikiCatalogNode {
  id: string;
  title: string;
  order: number;
  pageId?: string;
  children?: WikiCatalogNode[];
}

interface RepoWiki {
  wikiId: string;
  repoId: string;
  /** draft 版携带的任务 id（原 `$At` 的 `draft:${t.taskId}` 用） */
  taskId?: string;
  /** 草稿已生成页 id 集（原 KAt 的 `i.generatedPageIds`） */
  generatedPageIds?: string[];
  language: string;
  updatedAt: number;
  context: {
    name: string;
    defaultBranch?: string | null;
    commitHash?: string | null;
    fileCount?: number | null;
  };
  pages: WikiPage[];
  catalogTree?: WikiCatalogNode[] | null;
  generationOptions?: { generateDiagrams?: boolean; language?: string } | null;
  generationModel?: { providerId?: string | null; modelName?: string | null } | null;
}

interface RepoWikiTask {
  taskId: string;
  workspaceKey: string;
  repoId: string;
  wikiId?: string;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  phase: "preparing" | "pages" | "done" | "error" | string;
  completedPages?: number;
  failedPages?: number;
  totalPages?: number;
  currentPage?: string | null;
  error?: string | null;
  createdAt: number;
  updatedAt: number;
}

interface RepoWikiSummary {
  wiki: RepoWiki | null;
  draft: RepoWiki | null;
  task: RepoWikiTask | null;
}

interface RepoWikiService {
  readSummary(target: { workspacePath: string; workspaceIdentity?: string | null }): Promise<RepoWikiSummary>;
  readPage(target: { workspacePath: string; workspaceIdentity?: string | null; pageId: string }): Promise<{ page: WikiPage | null }>;
  generate(params: {
    workspacePath: string;
    workspaceIdentity?: string | null;
    language: string;
    force: boolean;
    modelProviderId?: string;
    modelName?: string;
    maxRetries: number;
    generateDiagrams: boolean;
  }): Promise<unknown>;
  cancel(target: { workspacePath: string; workspaceIdentity?: string | null }): Promise<unknown>;
  delete(target: { workspacePath: string; workspaceIdentity?: string | null }): Promise<unknown>;
  onDidChangeRepoWiki(cb: (event: { workspaceKey: string } & RepoWikiSummary) => void): Disposable;
}

/* --- 自动化 / 闲时服务（经 zcodeAgentService / offPeakTaskService 注入 store 动作） --- */

interface ZCodeAgentService {
  listAllAutomations(): Promise<AutomationRecord[]>;
  getModelTrajectory(params: { taskId: string }): Promise<ModelTrajectoryData>;
  createSession?(params: {
    workspacePath: string;
    workspaceIdentity?: string | null;
    persistence: string;
    model: { providerId: string; modelId: string };
  }): Promise<{ session: { sessionId: string }; settings: unknown }>;
  closeSession?(params: { workspacePath: string; workspaceIdentity?: string | null; sessionId: string }): Promise<void>;
  [key: string]: unknown;
}

interface OffPeakTaskService {
  [key: string]: unknown;
}

interface CodingPlanSubscriptionService {
  [key: string]: unknown;
}

interface SettingService {
  get(): Promise<ZCodeSettings>;
  update(patch: Partial<ZCodeSettings>): Promise<unknown>;
}

interface ServiceBag {
  modelProviderService: ModelProviderService;
  repoWikiService: RepoWikiService;
  zcodeAgentService: ZCodeAgentService;
  offPeakTaskService: OffPeakTaskService;
  codingPlanSubscriptionService: CodingPlanSubscriptionService;
  settingService: SettingService;
  botsService: unknown;
  broadcastService: unknown;
}

/* --- 设置快照（原 JM，js 53440） --- */

interface ZCodeSettings {
  keepAwakeWhileRunning?: boolean;
  modelProviderFamilyModes?: Record<string, string>;
  modelProviderFamilySelectedKeys?: Record<string, string>;
  providerFamilyDomain?: string | null;
  [key: string]: unknown;
}
declare function useSettingsSnapshot(): {
  settings: ZCodeSettings | null;
  loading: boolean;
  update: (patch: Partial<ZCodeSettings>) => Promise<void>;
};

/* --- 模型供应商注册表 / 权益 / coding plan（F12 接线） --- */

declare function useModelProviderRegistry(): {
  modelProviders: ModelProviderInfo[];
  displayOrder: string[];
  loading: boolean;
};

interface EntitlementSnapshot {
  snapshot: unknown;
  [key: string]: unknown;
}
declare function useEntitlements(params: {
  modelProviders: ModelProviderInfo[];
  loading: boolean;
  modelProviderFamilySelectedKeys?: Record<string, string>;
}): { entitlements: Record<string, EntitlementSnapshot | undefined> };

declare function useCodingPlanUpgrade(): {
  openCodingPlanUpgrade: (params: {
    providerId: string;
    initialAudience: "personal" | "team";
    funnelContext: unknown;
  }) => void;
};

/** 原 FM（js 53219）：闲时升级漏斗上下文 */
declare function buildIdleUpgradeFunnelContext(params: {
  providerId: string;
  eventText: string;
  entryPlanState: unknown;
}): unknown;

/** 原 LM（js 53251）：入口 plan 状态快照 */
declare function resolveEntryPlanState(params: {
  providers: ModelProviderInfo[];
  loading: boolean;
}): unknown;

/** provider id 常量（原 q，src-HCld2afU.js 的 mo 导出） */

/* --- 模型选择器（原 vq，F08 js 75527；F12 的分组构造） --- */

interface ModelSelectGroup {
  label?: string;
  items: Array<{ value: string; label?: string; [key: string]: unknown }>;
  [key: string]: unknown; // A0-CLEANUP3 3b：流入 SL.SelectGroupEntry（接口无隐式索引签名）
}

/** 原 hjt 依赖的 F12 分组构造器（Mr/Bq/L/Hq/N6e/Hq 族，js 76xxx–77xxx）——接口保留 */
declare function isProviderVisible(params: { providerId: string; familyModes?: Record<string, string> }): boolean;
declare function isProviderSelected(selectedProvider: string, provider: ModelProviderInfo): boolean;
declare function buildConfigOptionModels(
  options: Array<{ value: string; name?: string }>,
  currentValue: unknown,
  providers: ModelProviderInfo[],
): Array<{ value: string; name?: string }>;
declare function buildModelSelectGroups(
  selectedProvider: string,
  configModels: Array<{ value: string; name?: string }>,
  providers: ModelProviderInfo[],
  labels: Record<string, string>,
  displayOrder?: string[] | null,
  familyModes?: Record<string, string>,
  familySelectedKeys?: Record<string, string>,
  extra?: unknown,
  includeManage?: boolean,
  a?: unknown,
  b?: unknown,
  opts?: { providerFamilyDomain?: string | null },
): ModelSelectGroup[];
declare function buildEntitledProviderList(params: {
  providers: ModelProviderInfo[];
  selectedProvider: string;
  getEntitlementSnapshot: (providerId: string) => unknown;
  modelProviderFamilySelectedKeys?: Record<string, string>;
}): ModelProviderInfo[];

/* ── tombstone（A1-R25）：declare resolveModelGroupLabel（原 w6e：模型组内查显示名）删除 →
 *    import from './Home'（bundle w6e 77856–77863 唯一真身；终端消费实测：本文件 2267 调用点
 *    逐字不变、SubagentLeaves 293 ≡ bundle 197058 同批收敛、132407 repoWiki 域外留批；
 *    负证据：bundle 内 w6e 无第二定义）。
 *    型缝：真身首参宽化至最小消费面（items.value/items.name），ModelSelectGroup[] 经
 *    [key: string]: unknown 索引签名可赋；返回 string | null | undefined，调用点 ?? 兜底。 ── */

/** 原 Mg（js 24406；A1-R25 行漂校正，旧注 24358 为漂移）/ Zn（src chunk P 导出）：`provider/model[$variant]` 解析 */
declare function parseModelString(value: string): { providerId?: string; modelName?: string } | null;
declare function resolveModelRef(value: string): { providerId: string; modelId: string; variant?: string };

/** 原 fe（skillStore U 导出）：按工作区取模型供应商配置选项 */
declare function selectProviderConfigState(
  taskState: unknown,
  workspacePath: string,
  workspaceIdentity?: string | null,
): {
  configOptions: Array<{ id?: string; category?: string; type?: string; currentValue?: unknown; options?: Array<{ value: string; name?: string }> }> | null;
  modelSwitchPending: boolean;
  selectedProvider: string;
};

/* --- zustand：任务 store / 设置 store / 白板 store（跨 chunk） --- */

/* TaskStoreState/WorkspaceTaskState：A0-CLEANUP B-3 改指 SkillStore 类型导出
 * （原本地索引签名形删除；选择器工厂按 TaskStore 全store形收参）。 */
/** 原 xe（skillStore h 导出） */
/** 原 co（js 1033）：ref 记忆化浅比较选择器工厂 */
declare function createShallowSelectorFactory<T>(
  factory: (state: TaskStore) => T,
): (state: TaskStore) => T;

interface SettingsStoreState {
  theme: string;
  codePreviewSettings: CodePreviewSettings;
  [key: string]: unknown;
}
interface CodePreviewSettings {
  lightTheme: string;
  darkTheme: string;
  showLineNumbers: boolean;
  wrapLongLines: boolean;
  fontSizePx: number;
}
/** 原 Ao（js 1301）：设置 store 上下文钩子（useSyncExternalStore） */
declare function useSettingsStoreValue<T>(selector: (state: SettingsStoreState) => T, fallback: T): T;

/** 原 H（skillStore F 导出）：按任务取会话状态（开发者工具用其 usage.cache） */
declare function selectSessionByTask(
  workspaceState: WorkspaceTaskState,
  taskId: string | null,
): { usage?: { cache?: TokenCacheStats } | null } | null;

interface TokenCacheStats {
  hitRateRequestCount?: number;
  hitRate?: number;
  totalInputTokens?: number;
  totalCacheReadTokens?: number;
}

/* --- 白板 store（原 Oe，skillStore o 导出） --- */

/* WhiteboardStroke/WhiteboardBoard：A0-CLEANUP B-4 改指 SkillStore 类型导出
 * （原本地副本删除，消 TS2719 同名异型）。 */

interface WhiteboardStoreState {
  workspaces: Record<string, { boardsById: Record<string, WhiteboardBoard | undefined> } | undefined>;
  renameBoard(params: { boardId: string; name: string; workspaceIdentity?: string | null; workspacePath: string }): void;
  addStroke(params: { boardId: string; stroke: WhiteboardStroke; workspaceIdentity?: string | null; workspacePath: string }): void;
  undoStroke(params: { boardId: string; workspaceIdentity?: string | null; workspacePath: string }): void;
  redoStroke(params: { boardId: string; workspaceIdentity?: string | null; workspacePath: string }): void;
  clearBoard(params: { boardId: string; workspaceIdentity?: string | null; workspacePath: string }): void;
}
interface WhiteboardStoreHook {
  <T>(selector: (state: WhiteboardStoreState) => T): T;
  getState(): WhiteboardStoreState;
}

/** 原 Te（skillStore l 导出）：工作区键 */
declare function whiteboardWorkspaceKey(target: { workspacePath: string; workspaceIdentity?: string | null }): string;
/** 原 ene（src chunk n 导出）：工作区键（Wiki 用） */
/** 原 Ti（src chunk to 导出）：工作区键（自动化用） */

/** 原 ke/ve/_e/ye（skillStore p/d/c/f 导出）：白板绘制/笔画/默认色/加入聊天 */
declare function drawWhiteboard(
  ctx: CanvasRenderingContext2D,
  board: WhiteboardBoard,
  opts: { draftStroke: WhiteboardStroke | null; scale: number },
): void;
declare const WHITEBOARD_DEFAULT_COLOR: string;
declare function addWhiteboardToChat(params: { boardId: string; workspaceIdentity?: string | null; workspacePath: string }): void;

/* --- 自动化 stores（原 T3 js 134111 / bX js 91368；体量 ~4,800 行，接口保留） --- */

/** A0-CLEANUP3 3b：cronExpr 收紧为必有（列表/编辑器运行期恒有值）；scheduleRule 统一为 SL.ScheduleRule，
 * 与 StoresDeep.Automation / SL.AutomationTaskLite 三型互指 */
interface AutomationRecord {
  automationId: string;
  title: string;
  prompt: string;
  cronExpr: string;
  recurring?: boolean;
  maxRuns?: number | null;
  runCount?: number; // A0-CLEANUP3 3b §C：与 StoresDeep.Automation 对齐（列表态运行期可能缺省统计字段）
  enabled: boolean;
  lifecycleStatus?: "active" | "paused" | "completed" | "failed" | string;
  dispatchStatus?: string;
  lastError?: string | null;
  nextRunAt?: number | null;
  workspacePath?: string;
  workspaceIdentity?: string | null;
  model?: string | null;
  provider?: string | null;
  scheduleRule?: ScheduleRule | null;
  createdAt?: number;
  [key: string]: unknown;
}

interface AutomationScheduleRule {
  hour: number;
  minute: number;
  weekdays?: number[];
  monthDays?: number[];
  months?: number[];
  monthlyMode?: "date" | string;
  interval?: number;
  unit?: "minute" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | string;
  anchorAt: number;
  [key: string]: unknown;
}

interface AutomationRun {
  runId: string;
  trigger: "manual" | "schedule" | string;
  sessionId?: string | null;
  workspacePath?: string;
  workspaceIdentity?: string | null;
  [key: string]: unknown;
}

interface AutomationsRunsEntry {
  runs?: AutomationRun[];
  [key: string]: unknown;
}

interface AutomationInput {
  title: string;
  prompt: string;
  cronExpr?: string | null;
  model?: string | null;
  provider?: string | null;
  recurring?: boolean;
  maxRuns?: number | null;
  workspacePath?: string;
  workspaceIdentity?: string | null;
  [key: string]: unknown;
}

interface AutomationsStoreState {
  workspacePath: string | null;
  workspaceIdentity?: string | null;
  automations: AutomationRecord[];
  loading: boolean;
  error: string | null;
  operationId: string | null;
  runsCache: Record<string, AutomationsRunsEntry | undefined>;
  initialize(params: { workspacePath: string; workspaceIdentity?: string | null; agentService: ZCodeAgentService }): Promise<void>;
  createAutomation(input: AutomationInput, agentService: ZCodeAgentService): Promise<AutomationRecord | null>;
  updateAutomation(id: string, input: AutomationInput, agentService: ZCodeAgentService): Promise<boolean>;
  deleteAutomation(id: string, agentService: ZCodeAgentService): Promise<void>;
  setEnabled(id: string, enabled: boolean, agentService: ZCodeAgentService): Promise<void>;
  restartAutomation(id: string, agentService: ZCodeAgentService): Promise<void>;
  runAutomationNow(id: string, agentService: ZCodeAgentService): Promise<"queued" | "duplicate" | "failed">;
  loadRuns(id: string, agentService: ZCodeAgentService, force: boolean): Promise<void>;
  deleteRun(automationId: string, runId: string, agentService: ZCodeAgentService): Promise<void>;
  refresh(agentService: ZCodeAgentService): Promise<void>;
}
interface AutomationsStoreHook {
  <T>(selector: (state: AutomationsStoreState) => T): T;
  getState(): AutomationsStoreState;
}

interface OffPeakTask {
  offPeakTaskId: string;
  title?: string; // A0-CLEANUP3 3b：与 SL.OffPeakTaskRecord/stores-tasks.OffPeakTask 对齐（双向收敛）
  prompt: string;
  status: "queued" | "paused" | "running" | "completed" | "failed" | "cancelled" | string;
  queuePosition?: number;
  permissionMode?: string | null;
  model?: string | null;
  thoughtLevel?: string | null;
  workspacePath?: string;
  workspaceIdentity?: string | null;
  [key: string]: unknown;
}

interface OffPeakCreateInput {
  title: string;
  prompt: string;
  permissionMode?: string | null;
  model?: string | null;
  thoughtLevel?: string | null;
  [key: string]: unknown;
}

interface OffPeakCreateDraft {
  title?: string;
  prompt?: string;
  templateId?: string;
  telemetrySource?: { eventRegion: string; templateId?: string } | null;
  [key: string]: unknown;
}

interface OffPeakCreateResult {
  ok: boolean;
  task: OffPeakTask;
  errorCategory?: string;
  errorCode?: string;
  ticketInitialState?: string;
  queuePosition?: number;
  failureStage?: string;
  providerName?: string;
}

interface OffPeakStoreState {
  tasks: OffPeakTask[];
  loading: boolean;
  error: string | null;
  grayConfig: { enabled?: boolean; codingPlanActive?: boolean; allowedModels?: string[]; allowedModelConfigs?: Array<{ id: string; modelIdByKind?: Record<string, string>; reasoning?: { levels: Record<string, unknown>; defaultLevel?: string } }>; providerFamily?: string; selectedConnectionKey?: string } | null; // A0-CLEANUP3 3b：allowedModelConfigs 按消费面（OffPeakTaskEditor props）具型
  codingPlanSupport: { supported?: boolean; providerFamily?: string; selectedConnectionKey?: string } | null;
  takeNumberAvailability: { canTakeNumber?: boolean; nextTakeAt?: number } | null;
  takeNumberAvailabilityStatus: "loading" | "ready" | "error" | string;
  operationId: string | null;
  initialize(params: { offPeakTaskService: OffPeakTaskService; codingPlanSubscriptionService: CodingPlanSubscriptionService }): void;
  refresh(offPeakTaskService: OffPeakTaskService): Promise<void>;
  refreshCodingPlanSupport(offPeakTaskService: OffPeakTaskService): Promise<void>;
  refreshTakeNumberAvailability(offPeakTaskService: OffPeakTaskService): Promise<void>;
  createTask(input: OffPeakCreateInput, offPeakTaskService: OffPeakTaskService): Promise<OffPeakCreateResult>;
  updateTask(id: string, patch: Partial<OffPeakCreateInput>, offPeakTaskService: OffPeakTaskService): Promise<boolean>;
  pauseTask(id: string, offPeakTaskService: OffPeakTaskService): Promise<void>;
  continueTask(id: string, offPeakTaskService: OffPeakTaskService): Promise<void>;
  cancelTask(id: string, offPeakTaskService: OffPeakTaskService): Promise<void>;
  deleteTask(id: string, offPeakTaskService: OffPeakTaskService): Promise<void>;
  deleteHistory(id: string, offPeakTaskService: OffPeakTaskService): Promise<void>;
  consumePendingCreateDraft(): OffPeakCreateDraft | null;
}
/* ── tombstone（A1-R8）：useOffPeakTaskStore（原 bX js 91416）死 declare 删除——本文件零调用点
 *    （实测 grep 仅余声明位）；OffPeakStoreHook 脚手架随删。bX 真实消费面：
 *    Home kit 簇（bundle 91645–91650，canonical 属主）+ AutomationsMainView
 *    （138876 簇，普查留批注在案）。OffPeakStoreState 型面留用（687 行 isCodingPlanConnectionActive 助手仍引）。 ── */

/** 原 Tit（js 91347）：coding plan 支持判定 */
declare function isCodingPlanConnectionActive(
  support: OffPeakStoreState["codingPlanSupport"],
  settings: ZCodeSettings | null,
): boolean;

/* --- 工作区标签页 store（原 pc/oc/zMt，F04/F07 接线） --- */

interface WorkspaceTab {
  id: string;
  remoteSessionId?: string | null;
  remoteTarget?: RemoteTarget | null;
  workspaceIdentity?: string | null;
  [key: string]: unknown;
}
interface RemoteTarget {
  kind: "ssh" | "wsl" | "docker" | "server";
  host?: string;
  [key: string]: unknown;
}
interface WorkspaceTabStoreState {
  tabs: WorkspaceTab[];
  activeTabId: string | null;
}
interface WorkspaceTabStoreHook {
  <T>(selector: (state: WorkspaceTabStoreState) => T): T;
  getState(): WorkspaceTabStoreState;
}
declare const useWorkspaceTabStore: WorkspaceTabStoreHook;
/** 原 oc：标签可用性判定 */
declare function isWorkspaceTabUsable(tab: WorkspaceTab): boolean;
/** 原 zMt（js 135501）：是否远程/工作区作用域标签（有 remoteSessionId/remoteTarget/workspaceIdentity） */
declare function isRemoteScopedTab(tab: WorkspaceTab | null | undefined): boolean;

/* --- 会话快照运行时（treemapping 用；原 _w/mw/k0/u1） --- */

interface SessionRow {
  kind: "assistantText" | "reasoning" | "toolCall" | "subagent" | string;
  turnId: number | string | null;
  state?: string;
  status?: string;
  [key: string]: unknown;
}
interface SessionSnapshotClient {
  acquire(sessionId: string): { release(): void } & Record<string, unknown>;
  dispose(): void;
}
declare const SessionSnapshotClientImpl: {
  new (params: { transport: unknown }): SessionSnapshotClient;
};
declare function createSessionTransport(
  agentService: ZCodeAgentService,
  target: { workspacePath: string; workspaceIdentity?: string | null },
): unknown;
/** 原 k0（js 118675）：acquire 返回的会话引用 → 快照订阅 */
declare function useSessionSnapshotRef(sessionRef: unknown): {
  snapshot?: { rows: { window: SessionRow[] } } | null;
} | null;
/** 原 u1（js 110158）：行 → 工具调用视图模型 */
declare function extractToolCallRow(row: SessionRow): { toolCall: ToolCallViewModel };

/* --- 工具调用检视（treemapping 事件采集的共享底座；原 og/_g） --- */

interface ToolCallViewModel {
  toolId: string;
  toolName?: string | null;
  kind?: string | null;
  title?: string | null;
  status: string;
  startedAt?: number;
  input?: unknown;
  output?: unknown;
  raw?: unknown;
  [key: string]: unknown;
}
/** 原 og（js 23084）：工具族分类 */
declare function classifyToolFamily(toolCall: ToolCallViewModel): { family?: string; toolName?: string };
/** 原 _g（js 23638）：结构化文件变更候选提取 */
declare function extractFileChangeCandidates(
  raw: unknown,
  hints: { toolName?: string | null; kind?: string | null; input?: unknown; output?: unknown; raw?: unknown },
): Array<{
  path: string;
  actionLabel?: string;
  operationKind?: string;
  changeStat?: { added?: number; removed?: number };
}>;

/* --- 文件显示（原 zc/Vc/Bc/Go/Ko/sae） --- */

interface FileDisplayInfo {
  fileName: string;
  filePath?: string | null;
  fileIconSrc?: string | null;
}
declare const FileIconImg: React.FC<{ src?: string | null; size?: number; className?: string }>;
declare function isAbsolutePath(path: string): boolean;
declare function pathDirname(path: string): string | null;

/** 原 kg：工作区代理服务解析钩子（轨迹读取用） */
declare function useWorkspaceAgentService(
  workspacePath: string,
  remoteSessionId?: string,
  workspaceIdentity?: string | null,
): ZCodeAgentService;

/* --- 遥测 / 杂项（原 xw/ri/vee 等，src chunk） --- */

interface TelemetryEvent {
  elementName: string;
  eventRegion: string;
  eventType: string;
  eventText?: string;
  eventExtraDetail?: Record<string, unknown>;
  [key: string]: unknown; // A0-CLEANUP3 3b：流入 StoresDeep.TelemetryReport（带索引签名），接口级补齐
}
/** 原 ri：创建限制错误判定 */
declare function isCreateLimitError(error: string | null): boolean;
/** 原 vee：闲时遥测默认供应商常量 */
declare const OFFPEAK_TELEMETRY_DEFAULT_PROVIDER: string;

/* --- 模型轨迹数据模型 --- */

interface TrajectoryMessagePart {
  kind: "text" | "reasoning" | "tool-call" | "tool-result" | "image" | string;
  text?: string;
  toolCallId?: string;
  toolName?: string | null;
  input?: unknown;
  output?: unknown;
  mediaType?: string | null;
  raw?: unknown;
}

interface TrajectoryMessage {
  role: "system" | "user" | "assistant" | "tool" | string;
  parts: TrajectoryMessagePart[];
}

interface TrajectoryRecord {
  requestId: string;
  attempt: number;
  startedAt: string;
  durationMs?: number;
  callSource?: { kind: "main" | "subagent" | "compact" | "sidecar" | "unknown" | string; querySource?: string } | null;
  model: { modelId?: string | null; providerId?: string | null };
  request: { messages: TrajectoryMessage[] };
  response?: {
    modelId?: string | null;
    finishReason?: string | null;
    usage?: { inputTokens?: number; outputTokens?: number; totalTokens?: number } | null;
    text?: string | null;
    reasoningText?: string | null;
    toolCalls: TrajectoryMessagePart[];
  } | null;
  error?: { name: string; message: string; stack?: string | null } | null;
}

interface ModelTrajectoryData {
  records: TrajectoryRecord[];
  sourceFiles?: string[];
  truncated?: boolean;
}

/* --- UI 原语（button / imeComposition / usageStatsUiParts chunk） --- */

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "ghost" | "outline" | "destructive";
  size?: "xs" | "sm" | "default" | "lg" | "icon-sm" | "icon-md" | "icon-lg";
}
/* ── tombstone（A0-CLEANUP 族清理）：Button / Tooltip declare 删除 → import
 *    { Button } from './button'、{ InfoTooltip as Tooltip } from './UsageStatsUiParts'。 ── */

/** Popover 原语（原 Na/Oa/Ma/ka，usageStatsUiParts） */
/* ── tombstone（A0-S3c）：AlertDialogRoot、AlertDialogTrigger、CollapsibleContent、CollapsibleRoot、CollapsibleTrigger、DropdownMenu、DropdownMenuContent、DropdownMenuItem、DropdownMenuSeparator、DropdownMenuTrigger、PopoverRoot、ScrollArea、SelectRoot declare 删除 → 真实 import（文件头导入块）；映射依据见 A0-S3c.report.md。 ── */

/** 原 Ia 之外的 spinner（原 M，imeComposition w 导出 = loader-circle） */
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（1）：SpinnerIcon → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */

/* --- 图标（原 Sa 工厂 / 跨 chunk 图标；此处按语义命名） --- */

type IconProps = React.SVGProps<SVGSVGElement> & { size?: number; containerSize?: number };
/* ── tombstone（A0-CLEANUP 族清理）：createLucideIcon declare 删除 → import from './button'。 ── */

const IconArrowLeft = createLucideIcon("arrow-left", []);          // 原 S_（js 26634）
export const IconChevronDown = createLucideIcon("chevron-down", []);      // 原 N_（js 26802）
const IconChevronRight = createLucideIcon("chevron-right", []);    // 原 wa（button chunk o 导出）
const IconGitBranch = createLucideIcon("git-branch", []);          // 原 ev（js 27142）
const IconFolder = createLucideIcon("folder", []);                 // 原 $_（js 27133）
const IconFolderOpen = createLucideIcon("folder-open", []);        // 原 Q_（js 27689 附近）
export const IconRefreshCw = createLucideIcon("refresh-cw", []);          // 原 Nv（js 27677）
export const IconTrash2 = createLucideIcon("trash-2", []);                // 原 Kv（js 27355 附近）
export const IconSquare = createLucideIcon("square", []);                 // 原 Wv（停止，填充用 fill-current）
const IconPanelLeftClose = createLucideIcon("panel-left-close", []); // 原 Tv（js 27535）
const IconPanelLeftOpen = createLucideIcon("panel-left-open", []); // 原 Ev（js 27540）
const IconImagePlus = createLucideIcon("image-plus", []);          // 原 Bye（js 27238，白板入聊天）
export const IconPencil = createLucideIcon("pencil", []);                 // 原 Dv（画笔/编辑）
const IconEraser = createLucideIcon("eraser", []);                 // 原 Tye（橡皮）
const IconUndo2 = createLucideIcon("undo-2", []);                  // 原 qv
const IconRedo2 = createLucideIcon("redo-2", []);                  // 原 mbe
const IconPalette = createLucideIcon("palette", []);               // 原 wv（窄屏画布角标）
const IconX = createLucideIcon("x", []);                           // 原 g（imeComposition b 导出）
export const IconAlertTriangle = createLucideIcon("triangle-alert", []);  // 原 N（imeComposition x 导出）
export const IconMoon = createLucideIcon("moon", []);                     // 原 p/xv（imeComposition T 导出 / js 图标块）
export const IconCircleCheck = createLucideIcon("circle-check", []);      // 原 I_
export const IconCircleStop = createLucideIcon("circle-stop", []);        // 原 R_
export const IconCirclePlay = createLucideIcon("circle-play", []);        // 原 _ye
export const IconPlay = createLucideIcon("play", []);                     // 原 cbe
export const IconPlus = createLucideIcon("plus", []);                     // 原 kv
export const IconClock = createLucideIcon("clock", []);                   // 原 V_
export const IconEllipsis = createLucideIcon("ellipsis", []);             // 原 K_
export const IconExternalLink = createLucideIcon("external-link", []);    // 原 q_
export const IconRotateCcw = createLucideIcon("rotate-ccw", []);          // 原 gbe（重启）
export const IconTarget = createLucideIcon("target", []);                 // 原 wbe
export const IconActivity = createLucideIcon("activity", []);             // 原 y_
export const IconFileText = createLucideIcon("file-text", []);            // 原 Z_
export const IconList = createLucideIcon("list", []);                     // 原 dv
export const IconListChecks = createLucideIcon("list-checks", []);        // 原 lv（闲时模板）
export const IconSlidersHorizontal = createLucideIcon("sliders-horizontal", []); // 原 bbe（闲时自定义模板）
const IconBug = createLucideIcon("bug", []);                       // 原 k_（开发者工具标题）
const IconNetwork = createLucideIcon("network", []);               // 原 rbe（网络段）

/* --- 本 chunk 内 UI 原语（完整类名见各自定义处） --- */

/** Select 原语族（原 iO/oO/aO/sO/cO，js 46009–46100） */


/** Checkbox（原 DC，js 37297） */
declare const Checkbox: React.FC<{
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  "aria-label"?: string;
  size?: "default" | "sm";
  className?: string;
}>;

/** AlertDialog 原语族（原 $4/_At/e3/t3/r3/i3/n3/o3/a3，js 131966–132040） */



/** DropdownMenu 原语族（原 VO/HO/UO/WO/…/JO，js 47926–48040；TopBar.tsx 已完整还原） */






/** Collapsible 原语族（原 kZ/AZ/jZ，js 94925） */




/** Badge（原 uJ，js 80303） */

/** ScrollArea（原 Y3，js 136026） */


/** 分屏布局（原 X4/Z4/Q4，js 131934–131944；react-resizable-panels 封装） */
declare const PanelGroup: React.FC<
  React.ComponentPropsWithoutRef<"div"> & { layoutId?: string; panelIds?: string[] }
>;
declare const Panel: React.FC<
  React.ComponentPropsWithoutRef<"div"> & { id: string; minSize?: string; maxSize?: string; defaultSize?: string }
>;
declare const PanelResizeHandle: React.FC<React.ComponentPropsWithoutRef<"div">>;

/** Markdown 渲染器（原 cj，F19，jsx 46461） */

/** 代码查看源：接线 SidePanel.CodeViewerSource（原本地 kind 形为重建误差；MarkdownIntegration 调用面为 type:"file" 请求形） */
export type { CodeViewerSource };

/** 确认对话框钩子（原 U2，js 123493） */
declare function useConfirmDialog(): (request: {
  presentation?: string;
  title: string;
  description: string;
  confirmLabel: string;
  confirmVariant?: "default" | "destructive";
  showKeyboardHints?: boolean;
}) => Promise<boolean>;

/* --- 自动化叶子（接口保留；编辑器体量大，属下一批抽取） --- */

/** 原 kNt（js 137005–138822 / jsx 114854）：自动化编辑器 */

interface AutomationCreateDraft {
  templateId?: string;
  title?: string;
  cronExpr?: string;
  prompt?: string;
  [key: string]: unknown;
}

/** 原 YMt（js 91811+ 闲时编辑器，F15 闲时段）：闲时任务编辑器 */

/** 原 cMt（js 134679 / jsx 113500）：闲时任务列表 */
declare const OffPeakTaskList: React.FC<{
  tasks: OffPeakTask[];
  busyOperationId: string | null;
  onOpen: (task: OffPeakTask) => void;
  onPause: (task: OffPeakTask) => void;
  onContinue: (task: OffPeakTask) => void;
  onCancel: (task: OffPeakTask) => void;
  onDelete: (task: OffPeakTask) => void;
  onOpenSession: (run: { sessionId?: string | null; workspacePath?: string; workspaceIdentity?: string | null }) => void;
}>;

/* --- testid 常量（原值来自 src-HCld2afU.js，已反查导出表） --- */

export const AUTOMATIONS_OFFPEAK_TAB_TESTID = "offpeak-tab"; // 原 on（Ir←ob 8437）
export const AUTOMATIONS_LIST_TESTID = "automations-list"; // 原 jr（Tt←Ky 8423）
export const AUTOMATION_CARD_TESTID = "automation-card"; // 原 Bte（kt←Yy 8426）
export const OFFPEAK_CREATE_BUTTON_TESTID = "offpeak-create-button"; // 原 Mte（jr←Xy 8427）
export const AUTOMATION_CREATE_MANUALLY_TESTID = "automation-create-manually"; // 原 Nte（jt←Jy 8425）
export const AUTOMATION_CREATE_MENU_TESTID = "automation-create-menu"; // 原 Fn（Mt←qy 8424）
export const AUTOMATION_CARD_MENU_TESTID = "automation-card-menu"; // 原 at（At←sb 8438）
export const AUTOMATION_ACTION_TOGGLE_TESTID = "automation-action-toggle"; // 原 Xn（Ot←cb 8439）
export const AUTOMATION_ACTION_DELETE_TESTID = "automation-action-delete"; // 原 Et（Dt←lb 8440）

/* ============================================================================
 * 1. RepoWikiView 族（原 l3 等，F16；js 132042–134110 / jsx 111381–112421+）
 * ==========================================================================*/

/* ---- 1.0 常量（原 c3…LAt，js 132298–132305） ---- */

const WIKI_DEFAULT_MAX_RETRIES = 0; // 原 c3
const WIKI_MAX_RETRIES_LIMIT = 5; // 原 jAt
const WIKI_SUMMARY_RETRY_THROTTLE_MS = 10_000; // 原 MAt
const WIKI_MARKDOWN_CHUNK_BUDGET = 8_000; // 原 NAt
const WIKI_FIRST_PAINT_CHAR_BUDGET = 12_000; // 原 PAt
const WIKI_CHUNKS_PER_FRAME = 2; // 原 FAt
const WIKI_NARROW_WIDTH_PX = 560; // 原 IAt
const wikiModelNeverLocked = () => false; // 原 LAt

/* ---- 1.1 目录树构造（原 SAt…OAt，js 132192–132286） ---- */

function buildWikiCatalogTree(wiki: RepoWiki): WikiCatalogNode[] {
  if (!wiki) return [];
  if (wiki.catalogTree && wiki.catalogTree.length > 0)
    return pruneCatalogTree(wiki.catalogTree, new Set(wiki.pages.map((e) => e.id)));
  const fromParents = buildCatalogTreeFromParents(wiki.pages);
  return fromParents.length > 0 ? fromParents : buildCatalogTreeFromTitles(wiki.pages);
}

function pruneCatalogTree(nodes: WikiCatalogNode[], validPageIds: Set<string>): WikiCatalogNode[] {
  return nodes
    .map((node): WikiCatalogNode | null => {
      const children = node.children ? pruneCatalogTree(node.children, validPageIds) : [];
      const pageId = node.pageId && validPageIds.has(node.pageId) ? node.pageId : undefined;
      if (!pageId && children.length === 0) return null;
      return { ...node, pageId, children: children.length > 0 ? children : undefined };
    })
    .filter((node): node is WikiCatalogNode => node !== null);
}

function buildCatalogTreeFromParents(pages: WikiPage[]): WikiCatalogNode[] {
  const pageById = new Map(pages.map((e) => [e.id, e]));
  const childrenByParent = new Map<string, WikiPage[]>();
  for (const page of pages) {
    if (!page.parentId || !pageById.has(page.parentId)) continue;
    const list = childrenByParent.get(page.parentId) ?? [];
    list.push(page);
    childrenByParent.set(page.parentId, list);
  }
  if (childrenByParent.size === 0) return [];
  const childIds = new Set(
    Array.from(childrenByParent.values())
      .flat()
      .map((e) => e.id),
  );
  return pages
    .filter((e) => !childIds.has(e.id))
    .sort((a, b) => a.order - b.order)
    .map((e) => buildCatalogSubtree(e, childrenByParent));
}

function buildCatalogSubtree(page: WikiPage, childrenByParent: Map<string, WikiPage[]>): WikiCatalogNode {
  const children = (childrenByParent.get(page.id) ?? [])
    .sort((a, b) => a.order - b.order)
    .map((e) => buildCatalogSubtree(e, childrenByParent));
  return {
    id: `page-node-${page.id}`,
    title: page.title,
    order: page.order,
    pageId: page.id,
    children: children.length > 0 ? children : undefined,
  };
}

function buildCatalogTreeFromTitles(pages: WikiPage[]): WikiCatalogNode[] {
  const byGroup = new Map<string, WikiPage[]>();
  for (const page of pages) {
    const group = inferCatalogGroup(page);
    const list = byGroup.get(group) ?? [];
    list.push(page);
    byGroup.set(group, list);
  }
  if (byGroup.size <= 1)
    return pages
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((e) => ({ id: `page-node-${e.id}`, title: e.title, order: e.order, pageId: e.id }));
  let index = 0;
  return Array.from(byGroup.entries()).map(
    ([group, list]): WikiCatalogNode => (
      (index += 1),
      {
        id: `group-${index}-${slugifyCatalogGroup(group)}`,
        title: group,
        order: index,
        children: list
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((e) => ({ id: `page-node-${e.id}`, title: e.title, order: e.order, pageId: e.id })),
      }
    ),
  );
}

function inferCatalogGroup(page: WikiPage): string {
  const prefix = page.title.match(/^(.+?)[：:：/／-]/)?.[1]?.trim();
  if (prefix && prefix.length >= 2) return prefix;
  const [first, second] = (page.filePaths?.[0] ?? "").replace(/\\/g, "/").split("/");
  return first === "src" && second ? second : first || "Wiki";
}

function slugifyCatalogGroup(group: string): string {
  return group.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-");
}

/* ---- 1.2 项目选择（原 kAt/AAt，js 132287–132297） ---- */

function pickEntryProjectId(params: { projects: Array<{ id: string }>; entryWorkspaceKey: string | null }): string | null {
  return params.projects.find((t) => t.id === params.entryWorkspaceKey)?.id ?? params.projects[0]?.id ?? null;
}

function resolveInitialProjectId(params: {
  currentProjectId: string | null;
  entryWorkspaceKey: string | null;
  preferEntryProject: boolean;
  projects: Array<{ id: string }>;
}): string | null {
  const entryId = pickEntryProjectId({ entryWorkspaceKey: params.entryWorkspaceKey, projects: params.projects });
  return params.preferEntryProject
    ? entryId
    : params.currentProjectId && params.projects.some((t) => t.id === params.currentProjectId)
      ? params.currentProjectId
      : entryId;
}

/* ---- 1.3 Wiki 状态纯助手（原 f3…jjt，js 133693–134110） ---- */

interface WikiProjectState {
  wiki: RepoWiki | null;
  draft: RepoWiki | null;
  task: RepoWikiTask | null;
  loading: boolean;
  loaded: boolean;
}

function createEmptyWikiProjectState(): WikiProjectState {
  return { wiki: null, draft: null, task: null, loading: false, loaded: false };
}

function toLoadedWikiProjectState(summary: RepoWikiSummary, opts: { hideFailedTask: boolean }): WikiProjectState {
  return {
    ...summary,
    task: opts.hideFailedTask && summary.task?.status === "failed" ? null : summary.task,
    loading: false,
    loaded: true,
  };
}

function toPendingWikiProjectState(params: {
  current: WikiProjectState | undefined;
  workspaceKey: string;
  taskId?: string;
  now: number;
}): WikiProjectState {
  const base = params.current ?? createEmptyWikiProjectState();
  return {
    ...base,
    task: {
      taskId: params.taskId ?? makeLocalPendingTaskId(params.now),
      workspaceKey: params.workspaceKey,
      repoId: base.wiki?.repoId ?? base.draft?.repoId ?? base.task?.repoId ?? params.workspaceKey,
      wikiId: base.wiki?.wikiId ?? base.draft?.wikiId ?? base.task?.wikiId,
      phase: "preparing",
      status: "pending",
      completedPages: 0,
      failedPages: 0,
      createdAt: params.now,
      updatedAt: params.now,
    },
    loading: false,
    loaded: true,
  };
}

function makeLocalPendingTaskId(now: number): string {
  return `local-pending:${now}`;
}

/** 原 p3：进行中/失败/取消任务时以 draft 为准，否则发布版优先 */
function resolveEffectiveWiki(wiki: RepoWiki | null, draft: RepoWiki | null, task: RepoWikiTask | null): RepoWiki | null {
  return draft && (isWikiTaskRunning(task) || task?.status === "failed" || task?.status === "cancelled") ? draft : (wiki ?? draft);
}

/** 原 QAt：任务失败/取消时 draft 是否可视为“有内容” */
function isFailedOrCancelledDraft(draft: RepoWiki | null, task: RepoWikiTask | null): boolean {
  return !!(draft && (task?.status === "failed" || task?.status === "cancelled"));
}

function resolveWikiCacheId(wiki: RepoWiki | null, draft: RepoWiki | null): string {
  return draft ? `draft:${draft.taskId}` : wiki ? `wiki:${wiki.wikiId}:${wiki.updatedAt}` : "empty";
}

interface WikiPageCacheEntry {
  page: WikiPage | null;
  loading: boolean;
  loaded: boolean;
}

function createEmptyPageCacheEntry(): WikiPageCacheEntry {
  return { page: null, loading: false, loaded: false };
}

function makePageCacheKey(workspaceKey: string, wikiCacheId: string, pageId: string): string {
  return `${encodeURIComponent(workspaceKey)}\0${encodeURIComponent(wikiCacheId)}\0${encodeURIComponent(pageId)}`;
}

function workspaceKeyOfPageCacheKey(key: string): string {
  const [head = ""] = key.split("\0", 1);
  return decodeURIComponent(head);
}

/* Markdown 分帧渲染助手（原 njt…cjt） */

function chunkWikiMarkdown(markdown: string, budget: number): string[] {
  const blocks = splitMarkdownBlocks(markdown);
  const chunks: string[] = [];
  let pending: string[] = [];
  let size = 0;
  for (const block of blocks) {
    const next = size + block.length + (pending.length > 0 ? 2 : 0);
    if (pending.length > 0 && next > budget) {
      chunks.push(pending.join("\n\n"));
      pending = [];
      size = 0;
    }
    pending.push(block);
    size += block.length + (pending.length > 1 ? 2 : 0);
  }
  if (pending.length > 0) chunks.push(pending.join("\n\n"));
  return chunks.length > 0 ? chunks : [markdown];
}

function splitMarkdownBlocks(markdown: string): string[] {
  const lines = markdown.split(/\r?\n/);
  const blocks: string[] = [];
  let current: string[] = [];
  let fence: string | null = null;
  for (const line of lines) {
    const fenceToken = detectMarkdownFence(line);
    if (fenceToken) {
      current.push(line);
      if (fence) {
        if (fenceToken === fence) fence = null;
      } else {
        fence = fenceToken;
      }
      continue;
    }
    if (!fence && line.trim().length === 0) {
      pushMarkdownBlock(blocks, current);
      current = [];
      continue;
    }
    current.push(line);
  }
  pushMarkdownBlock(blocks, current);
  return blocks;
}

function pushMarkdownBlock(blocks: string[], lines: string[]): void {
  const text = lines.join("\n").trim();
  if (text) blocks.push(text);
}

function detectMarkdownFence(line: string): "```" | "~~~" | null {
  const trimmed = line.trimStart();
  return trimmed.startsWith("```") ? "```" : trimmed.startsWith("~~~") ? "~~~" : null;
}

function resolveInitialVisibleChunkCount(chunks: string[]): number {
  let total = 0;
  for (let i = 0; i < chunks.length; i += 1) {
    total += chunks[i]?.length ?? 0;
    if (total >= WIKI_FIRST_PAINT_CHAR_BUDGET) return i + 1;
  }
  return Math.max(1, chunks.length);
}

function scheduleWikiFrame(cb: () => void): number {
  // 原实现：无 window 时走 Node setTimeout；重建版统一按帧句柄处理
  return (typeof window > "u" ? setTimeout(cb, 16) : window.requestAnimationFrame(cb)) as unknown as number;
}

function cancelWikiFrame(handle: number): void {
  if (typeof window > "u") {
    clearTimeout(handle);
    return;
  }
  window.cancelAnimationFrame(handle);
}

/* 生成表单助手（原 h3…bjt） */

interface WikiGenerationForm {
  modelValue: string;
  modelTouched: boolean;
  language: string;
  languageTouched: boolean;
  maxRetries: number;
  generateDiagrams: boolean;
  diagramsTouched: boolean;
}

function createWikiGenerationForm(modelValue: string, locale: string, generateDiagrams: boolean): WikiGenerationForm {
  return {
    modelValue,
    modelTouched: false,
    language: locale,
    languageTouched: false,
    maxRetries: WIKI_DEFAULT_MAX_RETRIES,
    generateDiagrams,
    diagramsTouched: false,
  };
}

function resolveGenerateDiagramsDefault(...sources: Array<{ generateDiagrams?: boolean } | null | undefined>): boolean {
  return sources.find((e) => e !== undefined)?.generateDiagrams !== false;
}

function pickModelConfigOption(
  options: Array<{ id?: string; category?: string; type?: string; currentValue?: unknown; options?: Array<{ value: string; name?: string }> }>,
): { type?: string; category?: string; currentValue?: unknown; options?: Array<{ value: string; name?: string }> } | null {
  return options.find((e) => e.type === "select" && e.category === "model") ?? null;
}

function readConfigOptionCurrentValue(option: { currentValue?: unknown } | null): string {
  return typeof option?.currentValue === "string" ? option.currentValue : "";
}

function resolveDefaultModelValue(
  option: { currentValue?: unknown; options?: Array<{ value: string }> } | null,
  groups: ModelSelectGroup[],
): string {
  const current = readConfigOptionCurrentValue(option);
  return current && groups.some((e) => e.items.some((item) => item.value === current))
    ? current
    : (groups[0]?.items[0]?.value ?? current);
}

function resolvePublishedModelValue(wiki: RepoWiki | null, groups: ModelSelectGroup[]): string | null {
  const model = wiki?.generationModel;
  const providerId = model?.providerId?.trim();
  const modelName = model?.modelName?.trim();
  if (!providerId || !modelName) return null;
  const value = `${providerId}/${modelName}`;
  return modelSelectGroupsContain(groups, value) ? value : null;
}

function resolveWikiLanguageDefault(...sources: Array<{ language?: string } | null | undefined>): string | null {
  return sources[0]?.language ?? sources[1]?.language ?? null;
}

function buildWikiModelSelectGroups(params: {
  modelOption: { currentValue?: unknown; options?: Array<{ value: string; name?: string }> } | null;
  modelProviders: ModelProviderInfo[];
  selectedProvider: string;
  familyModes?: Record<string, string>;
}): ModelSelectGroup[] {
  const providers = params.modelProviders.filter(
    (t) => isProviderVisible({ providerId: t.id, familyModes: params.familyModes }) && isProviderSelected(params.selectedProvider, t),
  );
  const configModels = params.modelOption ? buildConfigOptionModels(params.modelOption.options ?? [], params.modelOption.currentValue, providers) : [];
  return buildModelSelectGroups(params.selectedProvider, configModels, providers, {}, null, params.familyModes);
}

function normalizeWikiModelValue(params: { modelValue: string; fallbackModelValue: string; modelGroups: ModelSelectGroup[] }): string {
  const value = params.modelValue.trim();
  const fallback = params.fallbackModelValue.trim();
  if (params.modelGroups.length === 0) return value || fallback;
  if (value && modelSelectGroupsContain(params.modelGroups, value)) return value;
  if (fallback && modelSelectGroupsContain(params.modelGroups, fallback)) return fallback;
  return params.modelGroups[0]?.items[0]?.value ?? (fallback || value);
}

function modelSelectGroupsContain(groups: ModelSelectGroup[], value: string): boolean {
  return groups.some((e) => e.items.some((item) => item.value === value));
}

function buildGenerateModelFields(modelValue: string): { modelProviderId?: string; modelName?: string } {
  const value = modelValue.trim();
  if (!value) return {};
  const parsed = resolveModelRef(value);
  return { modelProviderId: parsed.providerId, modelName: parsed.modelId };
}

function resolveModelTriggerFallbackLabel(value: string): string {
  const trimmed = value.trim();
  return trimmed ? parseModelString(trimmed)?.modelName || trimmed : "-";
}

function parseMaxRetriesInput(raw: string): number {
  return raw.trim() ? clampMaxRetries(Number(raw)) : WIKI_DEFAULT_MAX_RETRIES;
}

function clampMaxRetries(value: number): number {
  return Number.isFinite(value) ? Math.min(WIKI_MAX_RETRIES_LIMIT, Math.max(0, Math.trunc(value))) : WIKI_DEFAULT_MAX_RETRIES;
}

/* 任务/树/杂项助手（原 _3…jjt） */

function isWikiTaskRunning(task: RepoWikiTask | null): boolean {
  return task?.status === "pending" || task?.status === "running";
}

function makeCollapsedNodeKey(projectId: string, nodeId: string): string {
  return `${projectId}\0${nodeId}`;
}

function filterCollapsedNodeIds(projectId: string, collapsedNodeIds: Set<string>): Set<string> {
  const prefix = `${projectId}\0`;
  const result = new Set<string>();
  for (const key of collapsedNodeIds) if (key.startsWith(prefix)) result.add(key.slice(prefix.length));
  return result;
}

function areSetsEqual(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  for (const item of a) if (!b.has(item)) return false;
  return true;
}

function areWikiStateMapsEqual(a: Map<string, WikiProjectState>, b: Map<string, WikiProjectState>): boolean {
  if (a.size !== b.size) return false;
  for (const [key, value] of a) if (b.get(key) !== value) return false;
  return true;
}

function findFirstPageId(nodes: WikiCatalogNode[]): string | null {
  for (const node of nodes) {
    if (node.pageId) return node.pageId;
    const nested = findFirstPageId(node.children ?? []);
    if (nested) return nested;
  }
  return null;
}

function collectCatalogPageIds(nodes: WikiCatalogNode[]): Set<string> {
  const ids = new Set<string>();
  for (const node of nodes) {
    if (node.pageId) ids.add(node.pageId);
    for (const nested of collectCatalogPageIds(node.children ?? [])) ids.add(nested);
  }
  return ids;
}

function workspaceFolderName(workspacePath: string): string {
  return workspacePath.split(/[\\/]/).filter(Boolean).at(-1) ?? workspacePath;
}

function shortCommitHash(hash?: string | null): string {
  return hash ? hash.slice(0, 12) : "-";
}

function wikiLanguageLabel(language: string, intl: IntlShape): string {
  return intl.formatMessage({ id: language === "en-US" ? "settings.locale.en-US" : "settings.locale.zh-CN" });
}

function normalizeWikiLanguage(value: string): "zh-CN" | "en-US" {
  return value === "en-US" ? "en-US" : "zh-CN";
}

function formatFileCount(count?: number | null): string {
  return typeof count === "number" && Number.isFinite(count) ? String(count) : "-";
}

function formatWikiTimestamp(timestamp: number | null | undefined, locale: string): string {
  return timestamp
    ? new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(timestamp)
    : "-";
}

function resolveWikiTaskStatusLabel(task: RepoWikiTask, intl: IntlShape): string {
  return task.status === "failed"
    ? intl.formatMessage({ id: "repoWiki.statusFailed" })
    : task.status === "cancelled"
      ? intl.formatMessage({ id: "repoWiki.statusCancelled" })
      : intl.formatMessage({ id: `repoWiki.phase.${task.phase}` });
}

/* 项目合并（原 KAt/qAt/JAt，js 133716–133779） */

interface WikiProjectViewModel {
  id: string;
  title: string;
  description?: string | null;
  workspacePath: string;
  workspaceIdentity?: string | null;
  workspaceKey: string;
  wiki: RepoWiki | null;
  publishedWiki: RepoWiki | null;
  draft: RepoWiki | null;
  wikiCacheId: string;
  generatedPageIds: Set<string>;
  task: RepoWikiTask | null;
  loading: boolean;
  loaded: boolean;
  nodes: WikiCatalogNode[];
  pageIds: Set<string>;
}

interface WorkspaceWikiTarget {
  workspacePath: string;
  workspaceIdentity?: string | null;
  workspaceKey: string;
  label?: string | null;
}

function mergeWikiProjects(params: {
  workspaceTargets: WorkspaceWikiTarget[];
  repoWikiByWorkspaceKey: Map<string, WikiProjectState>;
}): WikiProjectViewModel[] {
  return params.workspaceTargets.map((target) => {
    const state = params.repoWikiByWorkspaceKey.get(target.workspaceKey) ?? createEmptyWikiProjectState();
    const published = state.wiki;
    const draft = state.draft;
    const effective = resolveEffectiveWiki(published, draft, state.task);
    const nodes = buildWikiCatalogTree(effective as RepoWiki);
    const pageIds = collectCatalogPageIds(nodes);
    const describedPage = effective?.pages.find((e) => pageIds.has(e.id));
    const generated = draft ? new Set(draft.generatedPageIds as unknown as string[]) : new Set(effective?.pages.map((e) => e.id) ?? []);
    return {
      id: target.workspaceKey,
      title: effective?.context.name ?? target.label ?? workspaceFolderName(target.workspacePath),
      description: describedPage?.description,
      workspacePath: target.workspacePath,
      workspaceIdentity: target.workspaceIdentity,
      workspaceKey: target.workspaceKey,
      wiki: effective,
      publishedWiki: published,
      draft,
      wikiCacheId: resolveWikiCacheId(effective, draft),
      generatedPageIds: generated,
      task: state.task,
      loading: state.loading,
      loaded: state.loaded,
      nodes,
      pageIds,
    };
  });
}

function resolveSelectedWikiPage(params: { project: WikiProjectViewModel | null; selectedPageId: string | null }): WikiPage | null {
  if (!params.project?.wiki) return null;
  const wiki = params.project.wiki;
  return (
    (params.selectedPageId
      ? wiki.pages.find((t) => t.id === params.selectedPageId && params.project?.pageIds.has(t.id))
      : null) ??
    wiki.pages.find((t) => params.project?.pageIds.has(t.id)) ??
    null
  );
}

function resolveWorkspaceWikiTargets(params: {
  workspacePath: string;
  workspaceIdentity?: string | null;
  workspaceTabs?: Array<{ workspacePath: string; workspaceIdentity?: string | null }> | null;
}): WorkspaceWikiTarget[] {
  const tabs = params.workspaceTabs?.length
    ? params.workspaceTabs
    : [{ workspacePath: params.workspacePath, workspaceIdentity: params.workspaceIdentity }];
  const seen = new Map<string, WorkspaceWikiTarget>();
  for (const tab of tabs) {
    const key = repoWikiWorkspaceKey(tab);
    if (!seen.has(key)) seen.set(key, { ...tab, workspaceKey: key });
  }
  return Array.from(seen.values());
}

/* ---- 1.4 RepoWikiLogoIcon（原 s3，js 132161 / jsx 111452） ---- */

const RepoWikiLogoIcon: React.FC<IconProps> = ({ size, ...rest }) => (
  <svg aria-hidden="true" viewBox="0 0 32 32" width={size ?? 24} height={size ?? 24} fill="none" {...rest}>
    <path
      d="M9.91922 3.2002H4.47922C3.77229 3.2002 3.19922 3.77327 3.19922 4.4802V9.9202C3.19922 10.6271 3.77229 11.2002 4.47922 11.2002H9.91922C10.6261 11.2002 11.1992 10.6271 11.1992 9.9202V4.4802C11.1992 3.77327 10.6261 3.2002 9.91922 3.2002Z"
      fill="currentColor"
    />
    <path
      d="M9.91922 20.7998H4.47922C3.77229 20.7998 3.19922 21.3729 3.19922 22.0798V27.5198C3.19922 28.2267 3.77229 28.7998 4.47922 28.7998H9.91922C10.6261 28.7998 11.1992 28.2267 11.1992 27.5198V22.0798C11.1992 21.3729 10.6261 20.7998 9.91922 20.7998Z"
      fill="currentColor"
    />
    <path
      d="M27.5208 3.2002H22.0808C21.3739 3.2002 20.8008 3.77327 20.8008 4.4802V9.9202C20.8008 10.6271 21.3739 11.2002 22.0808 11.2002H27.5208C28.2277 11.2002 28.8008 10.6271 28.8008 9.9202V4.4802C28.8008 3.77327 27.5208 3.2002 27.5208 3.2002Z"
      fill="currentColor"
    />
    <path d="M8 24L24 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/* ---- 1.5 元数据行（原 u3/d3，js 133666–133692） ---- */

const WikiMetaRowGrid: React.FC<{ label: string; value: React.ReactNode; mono?: boolean }> = ({ label, value, mono = false }) => (
  <div className="grid grid-cols-[minmax(88px,1fr)_minmax(0,1.2fr)] gap-3 px-3 py-2">
    <div className="text-foreground-subtle">{label}</div>
    <div className={cn("min-w-0 truncate text-right text-foreground", mono && "font-mono")}>{value}</div>
  </div>
);

const WikiMetaRowInline: React.FC<{ label: string; value: React.ReactNode; mono?: boolean }> = ({ label, value, mono = false }) => (
  <div className="min-w-0 text-ui-base text-foreground-subtle">
    <span>{label}: </span>
    <span className={cn("text-foreground", mono && "font-mono")}>{value}</span>
  </div>
);

/* ---- 1.6 WikiTaskProgress（原 WAt，js 133625 / jsx 112400） ---- */

const WikiTaskProgress: React.FC<{ task: RepoWikiTask; compact?: boolean }> = ({ task, compact = false }) => {
  const { intl } = useIntlContext();
  if (task.status === "completed" && task.phase === "done") return null;
  const totalPages = task.totalPages ?? 0;
  const completedPages = task.completedPages ?? 0;
  const percent = totalPages > 0 ? Math.min(100, Math.max(0, Math.round((completedPages / totalPages) * 100))) : 0;
  return (
    <div className={cn("text-ui-base text-foreground-subtle", !compact && "border-border border-b bg-surface px-3 py-2")}>
      <div className="flex items-center justify-between gap-3">
        <span>{resolveWikiTaskStatusLabel(task, intl)}</span>
        {totalPages > 0 ? <span>{completedPages}/{totalPages}</span> : null}
      </div>
      {totalPages > 0 ? (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background-alt">
          <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
        </div>
      ) : null}
      {task.currentPage ? <div className="mt-1 truncate">{task.currentPage}</div> : null}
      {task.error ? <div className="mt-1 text-destructive">{task.error}</div> : null}
    </div>
  );
};

/* ---- 1.7 WikiPagePendingCard（原 UAt，js 133594 / jsx 112387） ---- */

const WikiPagePendingCard: React.FC<{ pageTitle: string; task: RepoWikiTask | null }> = ({ pageTitle, task }) => {
  const { intl } = useIntlContext();
  return (
    <div className="flex min-h-full items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg border border-card-border bg-card p-4">
        <div className="text-ui-base font-medium text-foreground">{pageTitle || intl.formatMessage({ id: "repoWiki.pagePendingTitle" })}</div>
        <div className="mt-1 text-ui-base leading-5 text-foreground-subtle">
          {intl.formatMessage({ id: "repoWiki.pagePendingDescription" })}
        </div>
        {task ? (
          <div className="mt-3">
            <WikiTaskProgress task={task} compact />
          </div>
        ) : null}
      </div>
    </div>
  );
};

/* ---- 1.8 WikiPageRenderer（原 zAt，js 133156 / jsx 112164） ---- */

const WikiPageRenderer: React.FC<{ page: WikiPage; workspacePath: string; onOpenCodeViewer: (source: CodeViewerSource) => void }> = ({
  page,
  workspacePath,
  onOpenCodeViewer,
}) => {
  const theme = useSettingsStoreValue((e) => e.theme, "system");
  const codePreviewSettings = useSettingsStoreValue((e) => e.codePreviewSettings, {
    lightTheme: "github-light",
    darkTheme: "github-dark",
    showLineNumbers: true,
    wrapLongLines: false,
    fontSizePx: 12,
  });
  const chunks = React.useMemo(() => chunkWikiMarkdown(page.markdown, WIKI_MARKDOWN_CHUNK_BUDGET), [page.markdown]);
  const initialCount = React.useMemo(() => resolveInitialVisibleChunkCount(chunks), [chunks]);
  const [visibleCount, setVisibleCount] = React.useState(initialCount);
  const visibleChunks = chunks.slice(0, Math.min(visibleCount, chunks.length));

  React.useEffect(() => {
    let cancelled = false;
    let count = initialCount;
    const startedAt = performance.now();
    const frameHandles: number[] = [];
    setVisibleCount(initialCount);
    logger.info("[RepoWikiPane][perf] Wiki 页面分帧渲染开始", {
      pageId: page.id,
      markdownChars: page.markdown.length,
      chunkCount: chunks.length,
      initialChunkCount: initialCount,
    });
    const schedule = (cb: () => void) => {
      const handle = scheduleWikiFrame(cb);
      frameHandles.push(handle);
    };
    const finish = () => {
      schedule(() => {
        if (!cancelled)
          logger.info("[RepoWikiPane][perf] Wiki 页面分帧渲染完成", {
            pageId: page.id,
            markdownChars: page.markdown.length,
            chunkCount: chunks.length,
            elapsedMs: Math.round(performance.now() - startedAt),
          });
      });
    };
    schedule(() => {
      if (cancelled) return;
      logger.info("[RepoWikiPane][perf] Wiki 页面首批内容已渲染", {
        pageId: page.id,
        markdownChars: page.markdown.length,
        chunkCount: chunks.length,
        visibleChunkCount: initialCount,
        elapsedMs: Math.round(performance.now() - startedAt),
      });
      const advance = () => {
        if (cancelled || count >= chunks.length) {
          if (!cancelled) finish();
          return;
        }
        schedule(() => {
          if (cancelled) return;
          count = Math.min(chunks.length, count + WIKI_CHUNKS_PER_FRAME);
          setVisibleCount(count);
          advance();
        });
      };
      advance();
    });
    return () => {
      cancelled = true;
      for (const handle of frameHandles) cancelWikiFrame(handle);
    };
  }, [chunks, initialCount, page.id, page.markdown.length]);

  return (
    <div className="min-w-0 space-y-4">
      {visibleChunks.map((chunk, index) => (
        <MarkdownRenderer
          key={`${page.id}:${index}`}
          className="!h-auto min-h-0 !w-full"
          workspacePath={workspacePath}
          theme={theme}
          codePreviewSettings={codePreviewSettings}
          onOpenCodeViewer={onOpenCodeViewer}
        >
          {chunk}
        </MarkdownRenderer>
      ))}
    </div>
  );
};

/* ---- 1.9 CollapsiblePanelShell（原 BAt，js 133241 / jsx 112232） ---- */

const CollapsiblePanelShell: React.FC<{
  collapsed: boolean;
  title: string;
  collapseLabel: string;
  expandLabel: string;
  collapsedIcon: React.ReactNode;
  expandedIcon: React.ReactNode;
  onToggle: () => void;
  children: React.ReactNode;
}> = ({ collapsed, title, collapseLabel, expandLabel, collapsedIcon, expandedIcon, onToggle, children }) =>
  collapsed ? (
    <div className="flex h-full min-h-0 flex-col items-center gap-2 px-1 py-2 max-md:hidden">
      <Button type="button" variant="ghost" size="icon-sm" aria-label={expandLabel} title={expandLabel} onClick={onToggle}>
        {collapsedIcon}
      </Button>
      <div className="min-h-0 flex-1 overflow-hidden [writing-mode:vertical-rl] text-ui-base text-foreground-subtle">{title}</div>
    </div>
  ) : (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-8 shrink-0 items-center justify-between gap-2 border-border border-b px-2">
        <div className="min-w-0 truncate text-ui-base font-medium text-foreground-subtle">{title}</div>
        <Button type="button" variant="ghost" size="icon-sm" aria-label={collapseLabel} title={collapseLabel} onClick={onToggle}>
          {expandedIcon}
        </Button>
      </div>
      <div className="min-h-0 overflow-auto p-2">{children}</div>
    </div>
  );

/* ---- 1.10 WikiCatalogTree / 节点（原 bAt/xAt，js 132042–132160 / jsx 111381–111451） ---- */

const WikiCatalogTree: React.FC<{
  nodes: WikiCatalogNode[];
  pages: WikiPage[];
  generatedPageIds: Set<string>;
  currentPageTitle?: string;
  activePageId: string | null;
  collapsedNodeIds: Set<string>;
  onToggleNode: (nodeId: string) => void;
  onSelectPage: (pageId: string) => void;
}> = ({ nodes, pages, generatedPageIds, currentPageTitle, activePageId, collapsedNodeIds, onToggleNode, onSelectPage }) => {
  const pageById = React.useMemo(() => new Map(pages.map((e) => [e.id, e])), [pages]);
  return (
    <div className="space-y-0.5 text-ui-base">
      {nodes.map((node) => (
        <WikiCatalogTreeNode
          key={node.id}
          node={node}
          depth={0}
          pageById={pageById}
          generatedPageIds={generatedPageIds}
          currentPageTitle={currentPageTitle}
          activePageId={activePageId}
          collapsedNodeIds={collapsedNodeIds}
          onToggleNode={onToggleNode}
          onSelectPage={onSelectPage}
        />
      ))}
    </div>
  );
};

const WikiCatalogTreeNode: React.FC<{
  node: WikiCatalogNode;
  depth: number;
  pageById: Map<string, WikiPage>;
  generatedPageIds: Set<string>;
  currentPageTitle?: string;
  activePageId: string | null;
  collapsedNodeIds: Set<string>;
  onToggleNode: (nodeId: string) => void;
  onSelectPage: (pageId: string) => void;
}> = ({ node, depth, pageById, generatedPageIds, currentPageTitle, activePageId, collapsedNodeIds, onToggleNode, onSelectPage }) => {
  const { intl } = useIntlContext();
  const children = node.children ?? [];
  const hasChildren = children.length > 0;
  const isCollapsed = collapsedNodeIds.has(node.id);
  const page = node.pageId ? pageById.get(node.pageId) : undefined;
  const isPending = !!(page && generatedPageIds && !generatedPageIds.has(page.id));
  const isGenerating = !!(isPending && page?.title === currentPageTitle);
  const isActive = !!(page && page.id === activePageId);
  const title = page?.title ?? node.title;
  return (
    <div>
      <div className="flex min-w-0 items-start gap-1">
        <button
          type="button"
          className={cn(
            "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md text-foreground-subtle hover:bg-hover hover:text-foreground",
            !hasChildren && "pointer-events-none opacity-0",
          )}
          style={{ marginLeft: depth * 6 }}
          aria-label={title}
          aria-expanded={hasChildren ? !isCollapsed : undefined}
          onClick={(event) => {
            event.stopPropagation();
            onToggleNode(node.id);
          }}
        >
          {isCollapsed ? <IconChevronRight className="size-3.5" /> : <IconChevronDown className="size-3.5" />}
        </button>
        <button
          type="button"
          className={cn(
            "flex min-w-0 flex-1 flex-col rounded-md px-2 py-1.5 text-left text-foreground-subtle hover:bg-hover hover:text-foreground",
            isActive && "bg-selected text-foreground",
            !page && "font-medium text-foreground",
            isPending && "text-foreground-subtlest",
          )}
          onClick={() => {
            if (page) {
              onSelectPage(page.id);
              return;
            }
            if (hasChildren) onToggleNode(node.id);
          }}
        >
          <span className="min-w-0 truncate">{title}</span>
          {page?.description ? (
            <span className="mt-0.5 line-clamp-1 text-ui-xs font-normal text-foreground-subtlest">{page.description}</span>
          ) : null}
          {isPending ? (
            <span className="mt-0.5 text-ui-xs font-normal text-foreground-subtlest">
              {intl.formatMessage({ id: isGenerating ? "repoWiki.pageGenerating" : "repoWiki.pagePending" })}
            </span>
          ) : null}
        </button>
      </div>
      {hasChildren && !isCollapsed ? (
        <div className="mt-0.5 space-y-0.5">
          {children.map((child) => (
            <WikiCatalogTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              pageById={pageById}
              generatedPageIds={generatedPageIds}
              currentPageTitle={currentPageTitle}
              activePageId={activePageId}
              collapsedNodeIds={collapsedNodeIds}
              onToggleNode={onToggleNode}
              onSelectPage={onSelectPage}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};

/* ---- 1.11 WikiProjectList（原 VAt，js 133288 / jsx 112244） ---- */

const WikiProjectList: React.FC<{
  projects: WikiProjectViewModel[];
  activeProjectId: string | null;
  activePageId: string | null;
  expandedProjectIds: Set<string>;
  collapsedNodeIds: Set<string>;
  onToggleProject: (projectId: string) => void;
  onToggleNode: (projectId: string, nodeId: string) => void;
  onSelectPage: (project: WikiProjectViewModel, pageId: string) => void;
  onSelectProject: (project: WikiProjectViewModel) => void;
}> = ({ projects, activeProjectId, activePageId, expandedProjectIds, collapsedNodeIds, onToggleProject, onToggleNode, onSelectPage, onSelectProject }) => (
  <div className="space-y-2">
    {projects.map((project) => {
      const isActive = activeProjectId === project.id;
      const isExpandable = !!(project.wiki && project.nodes.length > 0);
      const hasToggle = isExpandable || !project.loaded;
      const isExpanded = isExpandable && expandedProjectIds.has(project.id);
      const description = project.description ?? null;
      return (
        <div key={project.id} className="min-w-0">
          <div className={cn("min-w-0 rounded-md", isActive && "bg-selected")}>
            <button
              type="button"
              className="flex w-full min-w-0 items-start gap-2 rounded-md px-2 py-2 text-left hover:bg-hover"
              aria-expanded={isExpandable ? isExpanded : undefined}
              onClick={() => {
                onSelectProject(project);
                if (hasToggle) onToggleProject(project.id);
              }}
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-ui-base text-foreground">{project.title}</span>
                {description ? (
                  <span className="mt-0.5 block truncate text-ui-base text-foreground-subtle">{description}</span>
                ) : null}
              </span>
              <span className="mt-1 flex size-5 shrink-0 items-center justify-center text-foreground-subtle">
                {isExpanded ? <IconChevronDown className="size-3.5" /> : <IconChevronRight className="size-3.5" />}
              </span>
            </button>
          </div>
          {isExpanded && project.wiki ? (
            <div className="mt-1 pl-1">
              <WikiCatalogTree
                nodes={project.nodes}
                pages={project.wiki.pages}
                generatedPageIds={project.generatedPageIds}
                currentPageTitle={
                  isWikiTaskRunning(project.task) && project.task?.phase === "pages" ? (project.task.currentPage ?? undefined) : undefined
                }
                activePageId={isActive ? activePageId : null}
                collapsedNodeIds={filterCollapsedNodeIds(project.id, collapsedNodeIds)}
                onToggleNode={(nodeId) => onToggleNode(project.id, nodeId)}
                onSelectPage={(pageId) => onSelectPage(project, pageId)}
              />
              {project.task?.error ? (
                <div className="mt-2 px-2 text-ui-base leading-5 text-destructive">{project.task.error}</div>
              ) : null}
            </div>
          ) : null}
        </div>
      );
    })}
  </div>
);

/* ---- 1.12 WikiProjectCard（原 RAt，js 133071 / jsx 112122） ---- */

const WikiProjectCard: React.FC<{ project: WikiProjectViewModel; task: RepoWikiTask | null; onStop: () => void }> = ({ project, task, onStop }) => {
  const { intl, locale } = useIntlContext();
  const wiki = project.wiki;
  const running = isWikiTaskRunning(task);
  return wiki ? (
    <div className="shrink-0 border-border border-b bg-surface px-4 py-2">
      <div className="flex min-w-0 items-center gap-2">
        <div className="min-w-0 flex-1 truncate text-ui-base font-medium">{wiki.context.name}</div>
        {running ? (
          <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={onStop}>
            <IconSquare className="size-3.5 fill-current" />
            <span>{intl.formatMessage({ id: "repoWiki.stop" })}</span>
          </Button>
        ) : null}
      </div>
      <details className="group mt-1.5">
        <summary className="flex w-fit cursor-default list-none items-center gap-1 rounded-md px-1 py-0.5 text-ui-base text-foreground-subtle hover:bg-hover hover:text-foreground [&::-webkit-details-marker]:hidden">
          <IconChevronRight className="size-3 transition-transform group-open:rotate-90" />
          <span>{intl.formatMessage({ id: "repoWiki.metadata" })}</span>
        </summary>
        <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 px-1">
          {wiki.context.defaultBranch ? (
            <div className="flex min-w-0 items-center gap-1 text-ui-base text-foreground-subtle">
              <IconGitBranch className="size-3 shrink-0" />
              <span className="min-w-0 truncate font-mono">{wiki.context.defaultBranch}</span>
            </div>
          ) : null}
          <WikiMetaRowInline label={intl.formatMessage({ id: "repoWiki.meta.language" })} value={wikiLanguageLabel(wiki.language, intl)} />
          <WikiMetaRowInline label={intl.formatMessage({ id: "repoWiki.meta.updatedAt" })} value={formatWikiTimestamp(wiki.updatedAt, locale)} />
          <WikiMetaRowInline label={intl.formatMessage({ id: "repoWiki.meta.commitId" })} value={shortCommitHash(wiki.context.commitHash)} mono />
          <WikiMetaRowInline label={intl.formatMessage({ id: "repoWiki.meta.files" })} value={formatFileCount(wiki.context.fileCount ?? wiki.pages.length)} />
        </div>
      </details>
      {task && !(task.status === "completed" && task.phase === "done") ? (
        <div className="mt-2">
          <WikiTaskProgress task={task} compact />
        </div>
      ) : null}
    </div>
  ) : null;
};

/* ---- 1.13 WikiGenerateEmptyState（原 HAt，js 133354 / jsx 112277） ---- */

const WikiGenerateEmptyState: React.FC<{
  repoName: string;
  task: RepoWikiTask | null;
  running: boolean;
  settingsDisabled: boolean;
  generateDisabled: boolean;
  modelGroups: ModelSelectGroup[];
  selectedModelValue: string;
  selectedModelLabel: string;
  selectedLanguage: string;
  maxRetries: number;
  generateDiagrams: boolean;
  onModelChange: (value: string) => void;
  onLanguageChange: (value: string) => void;
  onMaxRetriesChange: (value: number) => void;
  onGenerateDiagramsChange: (value: boolean) => void;
  onGenerate: () => void;
  onStop: () => void;
}> = ({
  repoName,
  task,
  running,
  settingsDisabled,
  generateDisabled,
  modelGroups,
  selectedModelValue,
  selectedModelLabel,
  selectedLanguage,
  maxRetries,
  generateDiagrams,
  onModelChange,
  onLanguageChange,
  onMaxRetriesChange,
  onGenerateDiagramsChange,
  onGenerate,
  onStop,
}) => {
  const { intl, locale } = useIntlContext();
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center p-6">
      <div className="w-full max-w-md rounded-lg border border-card-border bg-card p-4">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface">
            <RepoWikiLogoIcon className="size-4 text-foreground-subtle" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-ui-base font-medium">{repoName}</div>
            <div className="mt-1 text-ui-base leading-5 text-foreground-subtle">
              {intl.formatMessage({ id: "repoWiki.emptyDescription" })}
            </div>
          </div>
        </div>
        <div className="mt-4 divide-y divide-border rounded-lg border border-border bg-surface text-ui-base">
          <WikiMetaRowGrid label={intl.formatMessage({ id: "repoWiki.meta.language" })} value={wikiLanguageLabel(selectedLanguage, intl)} />
          <WikiMetaRowGrid
            label={intl.formatMessage({ id: "repoWiki.meta.status" })}
            value={task ? resolveWikiTaskStatusLabel(task, intl) : intl.formatMessage({ id: "repoWiki.statusNotGenerated" })}
          />
          <WikiMetaRowGrid label={intl.formatMessage({ id: "repoWiki.meta.files" })} value="-" />
          <WikiMetaRowGrid label={intl.formatMessage({ id: "repoWiki.meta.updatedAt" })} value={task?.updatedAt ? formatWikiTimestamp(task.updatedAt, locale) : "-"} />
          <WikiMetaRowGrid label={intl.formatMessage({ id: "repoWiki.meta.commitId" })} value="-" mono />
        </div>
        {task?.error ? (
          <div className="mt-3 line-clamp-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-ui-base leading-5 text-destructive">
            {task.error}
          </div>
        ) : null}
        <div className="mt-4 divide-y divide-border rounded-lg border border-border bg-surface px-3 py-1">
          <div className="grid gap-2 py-2.5 sm:grid-cols-[5rem_minmax(0,1fr)] sm:items-center">
            <div className="text-ui-base font-medium text-foreground-subtle">{intl.formatMessage({ id: "repoWiki.meta.language" })}</div>
            <SelectRoot value={selectedLanguage} onValueChange={(value) => onLanguageChange(normalizeWikiLanguage(value))} disabled={settingsDisabled}>
              <SelectTrigger className="w-full sm:w-44" size="lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" align="start">
                <SelectItem value="zh-CN">{intl.formatMessage({ id: "settings.locale.zh-CN" })}</SelectItem>
                <SelectItem value="en-US">{intl.formatMessage({ id: "settings.locale.en-US" })}</SelectItem>
              </SelectContent>
            </SelectRoot>
          </div>
          <div className="grid gap-2 py-2.5 sm:grid-cols-[5rem_minmax(0,1fr)] sm:items-center">
            <div className="text-ui-base font-medium text-foreground-subtle">{intl.formatMessage({ id: "repoWiki.meta.model" })}</div>
            <div className="min-w-0">
              <ModelSelector
                modelGroups={modelGroups as unknown as ModelGroup[]}
                normalizedValue={selectedModelValue}
                triggerLabel={selectedModelLabel}
                showManageModelsAction={false}
                lockReasonMessage=""
                isItemLocked={wikiModelNeverLocked}
                onValueChange={onModelChange}
                disabled={settingsDisabled || modelGroups.length === 0}
                tooltipTitle={intl.formatMessage({ id: "repoWiki.meta.model" })}
                labelVisibilityClassName="inline-flex"
                focusSelectorOnClose={null}
              />
            </div>
          </div>
          <label className="grid gap-2 py-2.5 sm:grid-cols-[5rem_minmax(0,1fr)] sm:items-center">
            <span className="text-ui-base font-medium text-foreground-subtle">{intl.formatMessage({ id: "repoWiki.meta.maxRetries" })}</span>
            <Input
              type="number"
              min={0}
              max={WIKI_MAX_RETRIES_LIMIT}
              step={1}
              value={String(maxRetries)}
              disabled={settingsDisabled}
              size="lg"
              className="w-24 text-center font-mono"
              onChange={(event) => onMaxRetriesChange(parseMaxRetriesInput(event.target.value))}
            />
          </label>
          <div className="grid gap-2 py-2.5 sm:grid-cols-[5rem_minmax(0,1fr)] sm:items-center">
            <div className="text-ui-base font-medium text-foreground-subtle">{intl.formatMessage({ id: "repoWiki.meta.generateDiagrams" })}</div>
            <label className="flex min-w-0 items-center gap-2">
              <Checkbox
                checked={generateDiagrams}
                onCheckedChange={onGenerateDiagramsChange}
                disabled={settingsDisabled}
                aria-label={intl.formatMessage({ id: "repoWiki.meta.generateDiagrams" })}
              />
              <span className="text-ui-base leading-5 text-foreground-subtle">
                {intl.formatMessage({ id: "repoWiki.generateDiagramsDescription" })}
              </span>
            </label>
          </div>
        </div>
        <Button
          type="button"
          className="mt-4 w-full"
          variant={running ? "outline" : "default"}
          disabled={running ? false : generateDisabled}
          onClick={running ? onStop : onGenerate}
        >
          {running ? <IconSquare className="size-4 fill-current" /> : <RepoWikiLogoIcon className="size-4" />}
          <span>{intl.formatMessage({ id: running ? "repoWiki.stop" : "repoWiki.generate" })}</span>
        </Button>
      </div>
    </div>
  );
};

/* ---- 1.14 RepoWikiView（原 l3，js 132306–133070 / jsx 111550–112121） ---- */

export const RepoWikiView: React.FC<{
  workspacePath: string;
  workspaceIdentity?: string | null;
  workspaceTabs?: Array<{ workspacePath: string; workspaceIdentity?: string | null }> | null;
  onOpenCodeViewer: (source: CodeViewerSource) => void;
  onBack?: () => void;
}> = ({ workspacePath, workspaceIdentity, workspaceTabs, onOpenCodeViewer, onBack }) => {
  const { modelProviderService, repoWikiService } = useServices();
  const { settings, loading: settingsLoading } = useSettingsSnapshot();
  const { intl, locale } = useIntlContext();
  const [modelProviders, setModelProviders] = React.useState<ModelProviderInfo[]>([]);
  const [deletingWorkspaceKey, setDeletingWorkspaceKey] = React.useState<string | null>(null);
  const workspaceTargets = React.useMemo(
    () => resolveWorkspaceWikiTargets({ workspacePath, workspaceIdentity, workspaceTabs }),
    [workspaceIdentity, workspacePath, workspaceTabs],
  );
  const entryWorkspaceKey = React.useMemo(() => repoWikiWorkspaceKey({ workspacePath, workspaceIdentity }), [workspaceIdentity, workspacePath]);
  const joinedWorkspaceKeys = React.useMemo(() => workspaceTargets.map((e) => e.workspaceKey).join("\0"), [workspaceTargets]);
  const [repoWikiByWorkspaceKey, setRepoWikiByWorkspaceKey] = React.useState<Map<string, WikiProjectState>>(() => new Map());
  const [pageCache, setPageCache] = React.useState<Map<string, WikiPageCacheEntry>>(() => new Map());
  const [selectedPageId, setSelectedPageId] = React.useState<string | null>(null);
  const [currentProjectId, setCurrentProjectId] = React.useState<string | null>(null);
  const [isNarrow, setIsNarrow] = React.useState(false);
  const [catalogCollapsed, setCatalogCollapsed] = React.useState(false);
  const [expandedProjectIds, setExpandedProjectIds] = React.useState<Set<string>>(() => new Set());
  const [collapsedNodeIds, setCollapsedNodeIds] = React.useState<Set<string>>(() => new Set());
  const rootRef = React.useRef<HTMLDivElement>(null);
  const wasNarrowRef = React.useRef(false);
  const layoutKeyRef = React.useRef<string | null>(null);
  const entryKeyRef = React.useRef<string | null>(null);
  const inflightSummaryKeysRef = React.useRef<Set<string>>(new Set());
  const lastSummaryAttemptRef = React.useRef<Map<string, number>>(new Map());
  const inflightPageKeysRef = React.useRef<Set<string>>(new Set());
  const mountedRef = React.useRef(true);
  const aliveKeysRef = React.useRef<Set<string>>(new Set());
  const projects = React.useMemo(
    () => mergeWikiProjects({ workspaceTargets, repoWikiByWorkspaceKey }),
    [repoWikiByWorkspaceKey, workspaceTargets],
  );
  const activeProject = projects.find((e) => e.id === currentProjectId) ?? projects[0] ?? null;
  const activeWorkspaceKey = activeProject?.workspaceKey ?? null;
  const activeWiki = activeProject?.wiki ?? null;
  const publishedWiki = activeProject?.publishedWiki ?? null;
  const activeTask = activeProject?.task ?? null;
  const taskRunning = isWikiTaskRunning(activeTask);
  const failedDraftVisible = isFailedOrCancelledDraft(activeProject?.draft ?? null, activeTask);
  const hasContent = !!(activeProject && (publishedWiki || failedDraftVisible) && !taskRunning);
  const canRegenerate = !!(activeProject && (publishedWiki || failedDraftVisible) && !taskRunning);
  const projectTitle = activeProject?.title ?? workspaceFolderName(workspacePath);
  const selectedPage = resolveSelectedWikiPage({ project: activeProject, selectedPageId });
  const pagePending = !!(activeProject?.draft && selectedPage && !activeProject.generatedPageIds.has(selectedPage.id));
  const pageCacheKey = activeProject?.wiki && selectedPage && !pagePending ? makePageCacheKey(activeProject.workspaceKey, activeProject.wikiCacheId, selectedPage.id) : null;
  const pageCacheEntry = pageCacheKey ? pageCache.get(pageCacheKey) : undefined;
  const activePage = pageCacheEntry?.page ?? null;
  const pageLoading = !!(activeProject?.wiki && selectedPage && !pagePending && (!pageCacheEntry?.loaded || pageCacheEntry.loading));
  const providerConfig = useTaskStore(
    createShallowSelectorFactory((state) => {
      const resolved = selectProviderConfigState(state, activeProject?.workspacePath ?? workspacePath, activeProject?.workspaceIdentity ?? workspaceIdentity);
      return {
        configOptions: resolved.configOptions,
        modelSwitchPending: resolved.modelSwitchPending,
        selectedProvider: resolved.selectedProvider,
      };
    }),
  );
  const modelSwitchPending = providerConfig.modelSwitchPending;
  const selectedProvider = providerConfig.selectedProvider;
  const modelOption = React.useMemo(() => pickModelConfigOption(providerConfig.configOptions ?? []), [providerConfig.configOptions]);
  const modelGroups = React.useMemo(
    () =>
      buildWikiModelSelectGroups({
        modelOption,
        modelProviders,
        selectedProvider,
        familyModes: settings?.modelProviderFamilyModes,
      }),
    [modelProviders, modelOption, selectedProvider, settings?.modelProviderFamilyModes],
  );
  const defaultModelValue = resolveDefaultModelValue(modelOption, modelGroups);
  const effectiveModelValue = resolvePublishedModelValue(activeWiki, modelGroups) ?? defaultModelValue;
  const [generationFormByKey, setGenerationFormByKey] = React.useState<Map<string, WikiGenerationForm>>(() => new Map());
  const projectLoaded = activeProject?.loaded ?? false;
  const settingsDisabled = taskRunning || modelSwitchPending || !projectLoaded || settingsLoading;
  const generateDisabled = taskRunning || modelSwitchPending || !projectLoaded || settingsLoading;
  const form = activeProject
    ? (generationFormByKey.get(activeProject.workspaceKey) ?? createWikiGenerationForm(effectiveModelValue, locale, resolveGenerateDiagramsDefault(activeWiki?.generationOptions)))
    : createWikiGenerationForm(effectiveModelValue, locale, true);
  const normalizedModelValue = normalizeWikiModelValue({ modelValue: form.modelValue, fallbackModelValue: effectiveModelValue, modelGroups });
  const modelTriggerLabel =
    resolveModelGroupLabel(modelGroups, normalizedModelValue) ??
    (normalizedModelValue.trim() ? resolveModelTriggerFallbackLabel(normalizedModelValue) : intl.formatMessage({ id: "repoWiki.modelPlaceholder" }));

  React.useEffect(
    () => (
      (mountedRef.current = true),
      () => {
        mountedRef.current = false;
      }
    ),
    [],
  );

  React.useEffect(() => {
    const element = rootRef.current;
    if (!element) return;
    const measure = (width: number) => {
      const narrow = width < WIKI_NARROW_WIDTH_PX;
      setIsNarrow(narrow);
      if (narrow && !wasNarrowRef.current) setCatalogCollapsed(true);
      wasNarrowRef.current = narrow;
    };
    measure(element.getBoundingClientRect().width);
    if (typeof ResizeObserver > "u") {
      const onResize = () => measure(element.getBoundingClientRect().width);
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      measure(entry?.contentRect.width ?? element.getBoundingClientRect().width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    const load = () => {
      modelProviderService
        .getAllCached()
        .then((providers) => {
          if (!cancelled) setModelProviders(providers);
        })
        .catch((error) => {
          if (!cancelled)
            logger.warn("[RepoWikiPane] 读取全局模型供应商缓存失败", {
              error: error instanceof Error ? error.message : String(error),
            });
        });
    };
    load();
    const subscription = modelProviderService.onDidChangeProviderRegistry(() => {
      load();
    });
    return () => {
      cancelled = true;
      subscription.dispose();
    };
  }, [modelProviderService]);

  React.useEffect(() => {
    const alive = new Set(workspaceTargets.map((e) => e.workspaceKey));
    aliveKeysRef.current = alive;
    inflightSummaryKeysRef.current = new Set([...inflightSummaryKeysRef.current].filter((key) => alive.has(key)));
    lastSummaryAttemptRef.current = new Map([...lastSummaryAttemptRef.current].filter(([key]) => alive.has(key)));
    inflightPageKeysRef.current = new Set([...inflightPageKeysRef.current].filter((key) => alive.has(workspaceKeyOfPageCacheKey(key))));
    setRepoWikiByWorkspaceKey((previous) => {
      const next = new Map<string, WikiProjectState>();
      for (const target of workspaceTargets) next.set(target.workspaceKey, previous.get(target.workspaceKey) ?? createEmptyWikiProjectState());
      return areWikiStateMapsEqual(previous, next) ? previous : next;
    });
    setPageCache((previous) => {
      const next = new Map([...previous].filter(([key]) => alive.has(workspaceKeyOfPageCacheKey(key))));
      return previous.size === next.size ? previous : next;
    });
  }, [joinedWorkspaceKeys, workspaceTargets]);

  React.useEffect(() => {
    const alive = new Set(workspaceTargets.map((e) => e.workspaceKey));
    const subscription = repoWikiService.onDidChangeRepoWiki((event) => {
      if (!alive.has(event.workspaceKey)) return;
      logger.info("[RepoWikiPane] 收到 Wiki 状态事件", {
        workspaceKey: event.workspaceKey,
        hasWiki: !!event.wiki,
        hasDraft: !!event.draft,
        taskStatus: event.task?.status,
        taskPhase: event.task?.phase,
      });
      inflightSummaryKeysRef.current.delete(event.workspaceKey);
      lastSummaryAttemptRef.current.delete(event.workspaceKey);
      setRepoWikiByWorkspaceKey((previous) => {
        const next = new Map(previous);
        next.set(event.workspaceKey, {
          wiki: event.wiki,
          draft: event.draft,
          task: event.task,
          loading: false,
          loaded: true,
        });
        return next;
      });
      if (!event.wiki && !event.draft)
        setPageCache((previous) => {
          const next = new Map([...previous].filter(([key]) => workspaceKeyOfPageCacheKey(key) !== event.workspaceKey));
          return next.size === previous.size ? previous : next;
        });
      setSelectedPageId((previous) => {
        const effective = resolveEffectiveWiki(event.wiki, event.draft, event.task);
        return effective ? (previous ?? effective.pages[0]?.id ?? null) : activeWorkspaceKey === event.workspaceKey ? null : previous;
      });
    });
    return () => {
      subscription.dispose();
    };
  }, [activeWorkspaceKey, repoWikiService, joinedWorkspaceKeys, workspaceTargets]);

  React.useEffect(() => {
    const wanted = new Set<string>();
    if (activeWorkspaceKey) wanted.add(activeWorkspaceKey);
    for (const projectId of expandedProjectIds) wanted.add(projectId);
    for (const workspaceKey of wanted) {
      if (repoWikiByWorkspaceKey.get(workspaceKey)?.loaded) continue;
      const lastAttempt = lastSummaryAttemptRef.current.get(workspaceKey);
      if (inflightSummaryKeysRef.current.has(workspaceKey)) {
        if (lastAttempt !== undefined && performance.now() - lastAttempt < WIKI_SUMMARY_RETRY_THROTTLE_MS) continue;
        inflightSummaryKeysRef.current.delete(workspaceKey);
        lastSummaryAttemptRef.current.delete(workspaceKey);
      }
      const target = workspaceTargets.find((e) => e.workspaceKey === workspaceKey);
      if (!target) continue;
      inflightSummaryKeysRef.current.add(workspaceKey);
      lastSummaryAttemptRef.current.set(workspaceKey, performance.now());
      setRepoWikiByWorkspaceKey((previous) => {
        const current = previous.get(target.workspaceKey) ?? createEmptyWikiProjectState();
        if (current.loading) return previous;
        const next = new Map(previous);
        next.set(target.workspaceKey, { ...current, loading: true });
        return next;
      });
      repoWikiService
        .readSummary({ workspacePath: target.workspacePath, workspaceIdentity: target.workspaceIdentity })
        .then((summary) => {
          inflightSummaryKeysRef.current.delete(target.workspaceKey);
          lastSummaryAttemptRef.current.delete(target.workspaceKey);
          if (!mountedRef.current || !aliveKeysRef.current.has(target.workspaceKey)) return;
          setRepoWikiByWorkspaceKey((previous) => {
            const next = new Map(previous);
            next.set(target.workspaceKey, toLoadedWikiProjectState(summary, { hideFailedTask: true }));
            return next;
          });
          const effective = resolveEffectiveWiki(summary.wiki, summary.draft, summary.task);
          setSelectedPageId((previous) => previous ?? effective?.pages[0]?.id ?? null);
        })
        .catch((error) => {
          inflightSummaryKeysRef.current.delete(target.workspaceKey);
          lastSummaryAttemptRef.current.delete(target.workspaceKey);
          if (!mountedRef.current || !aliveKeysRef.current.has(target.workspaceKey)) return;
          logger.warn("[RepoWikiPane] 读取项目 Wiki 状态失败", {
            workspaceKey: target.workspaceKey,
            error: error instanceof Error ? error.message : String(error),
          });
          setRepoWikiByWorkspaceKey((previous) => {
            const next = new Map(previous);
            next.set(target.workspaceKey, {
              wiki: null,
              draft: null,
              task: null,
              loading: false,
              loaded: true,
            });
            return next;
          });
        });
    }
  }, [activeWorkspaceKey, expandedProjectIds, repoWikiByWorkspaceKey, repoWikiService, joinedWorkspaceKeys]);

  React.useEffect(() => {
    if (!activeProject?.wiki || !selectedPage || !pageCacheKey || pagePending) return;
    const cached = pageCache.get(pageCacheKey);
    if (cached?.loaded || cached?.loading || inflightPageKeysRef.current.has(pageCacheKey)) return;
    inflightPageKeysRef.current.add(pageCacheKey);
    setPageCache((previous) => {
      const current = previous.get(pageCacheKey) ?? createEmptyPageCacheEntry();
      if (current.loading || current.loaded) return previous;
      const next = new Map(previous);
      next.set(pageCacheKey, { ...current, loading: true });
      return next;
    });
    const project = activeProject;
    const pageId = selectedPage.id;
    const cacheKey = pageCacheKey;
    repoWikiService
      .readPage({
        workspacePath: project.workspacePath,
        workspaceIdentity: project.workspaceIdentity,
        pageId,
      })
      .then((result) => {
        inflightPageKeysRef.current.delete(cacheKey);
        if (!mountedRef.current || !aliveKeysRef.current.has(project.workspaceKey)) return;
        setPageCache((previous) => {
          const next = new Map(previous);
          next.set(cacheKey, { page: result.page, loading: false, loaded: true });
          return next;
        });
      })
      .catch((error) => {
        inflightPageKeysRef.current.delete(cacheKey);
        if (!mountedRef.current || !aliveKeysRef.current.has(project.workspaceKey)) return;
        logger.warn("[RepoWikiPane] 读取项目 Wiki 页面失败", {
          workspaceKey: project.workspaceKey,
          pageId,
          error: error instanceof Error ? error.message : String(error),
        });
        setPageCache((previous) => {
          const next = new Map(previous);
          next.set(cacheKey, { page: null, loading: false, loaded: true });
          return next;
        });
      });
  }, [pageCacheKey, pagePending, selectedPage, activeProject, pageCache, repoWikiService]);

  React.useEffect(() => {
    if (projects.length === 0) {
      setCurrentProjectId(null);
      setExpandedProjectIds(new Set());
      layoutKeyRef.current = null;
      entryKeyRef.current = null;
      return;
    }
    const entryProjectId = pickEntryProjectId({ projects, entryWorkspaceKey });
    const entryChanged = entryKeyRef.current !== entryWorkspaceKey;
    entryKeyRef.current = entryWorkspaceKey;
    const layoutChanged = layoutKeyRef.current !== `${joinedWorkspaceKeys}\0${entryWorkspaceKey}`;
    if (layoutChanged) layoutKeyRef.current = `${joinedWorkspaceKeys}\0${entryWorkspaceKey}`;
    setCurrentProjectId((previous) =>
      resolveInitialProjectId({ currentProjectId: previous, entryWorkspaceKey, preferEntryProject: entryChanged, projects }),
    );
    setExpandedProjectIds((previous) => {
      const validIds = new Set(projects.map((e) => e.id));
      const kept = new Set([...previous].filter((id) => validIds.has(id)));
      if (layoutChanged && entryProjectId) kept.add(entryProjectId);
      return areSetsEqual(previous, kept) ? previous : kept;
    });
  }, [entryWorkspaceKey, projects, joinedWorkspaceKeys]);

  React.useEffect(() => {
    setSelectedPageId((previous) => (activeProject && previous && activeProject.pageIds.has(previous) ? previous : findFirstPageId(activeProject?.nodes ?? [])));
  }, [activeProject]);

  React.useEffect(() => {
    if (!activeProject) return;
    setGenerationFormByKey((previous) => {
      const existing = previous.get(activeProject.workspaceKey);
      const modelTouched = existing?.modelTouched ?? false;
      const languageTouched = existing?.languageTouched ?? false;
      const diagramsTouched = existing?.diagramsTouched ?? false;
      const languageDefault = resolveWikiLanguageDefault(activeProject.publishedWiki, activeProject.draft);
      const modelValue = modelTouched ? (existing?.modelValue ?? effectiveModelValue) : effectiveModelValue;
      const language = languageTouched ? (existing?.language ?? languageDefault ?? locale) : (languageDefault ?? locale);
      const diagramsDefault = resolveGenerateDiagramsDefault(activeProject.draft?.generationOptions, activeProject.publishedWiki?.generationOptions);
      const generateDiagrams = diagramsTouched ? (existing?.generateDiagrams ?? diagramsDefault) : diagramsDefault;
      if (
        existing?.modelValue === modelValue &&
        existing?.maxRetries !== undefined &&
        existing.language === language &&
        existing.modelTouched === modelTouched &&
        existing.languageTouched === languageTouched &&
        existing.generateDiagrams === generateDiagrams &&
        existing.diagramsTouched === diagramsTouched
      )
        return previous;
      const next = new Map(previous);
      next.set(activeProject.workspaceKey, {
        ...existing,
        modelTouched,
        modelValue,
        maxRetries: existing?.maxRetries ?? WIKI_DEFAULT_MAX_RETRIES,
        language,
        languageTouched,
        generateDiagrams,
        diagramsTouched,
      });
      return next;
    });
  }, [activeProject, effectiveModelValue, locale]);

  const updateForm = React.useCallback(
    (patch: Partial<WikiGenerationForm>) => {
      if (!activeWorkspaceKey) return;
      setGenerationFormByKey((previous) => {
        const next = new Map(previous);
        next.set(activeWorkspaceKey, { ...createWikiGenerationForm(effectiveModelValue, locale, true), ...previous.get(activeWorkspaceKey), ...patch });
        return next;
      });
    },
    [activeWorkspaceKey, effectiveModelValue, locale],
  );
  const handleModelChange = React.useCallback((value: string) => updateForm({ modelTouched: true, modelValue: value }), [updateForm]);
  const handleLanguageChange = React.useCallback((value: string) => updateForm({ language: value, languageTouched: true }), [updateForm]);
  const handleLanguageSelect = React.useCallback((value: string) => handleLanguageChange(normalizeWikiLanguage(value)), [handleLanguageChange]);
  const handleMaxRetriesChange = React.useCallback((value: number) => updateForm({ maxRetries: value }), [updateForm]);
  const handleGenerateDiagramsChange = React.useCallback((value: boolean) => updateForm({ diagramsTouched: true, generateDiagrams: value }), [updateForm]);

  const handleGenerate = (force: boolean) => {
    if (!activeProject) return;
    if (modelSwitchPending) {
      logger.info("[RepoWikiPane] 模型切换未完成，跳过 Wiki 生成", { workspaceKey: activeProject.workspaceKey });
      return;
    }
    const project = activeProject;
    const target = { workspacePath: project.workspacePath, workspaceIdentity: project.workspaceIdentity };
    logger.info("[RepoWikiPane] 用户触发 Wiki 生成", { workspaceKey: project.workspaceKey, force });
    const now = Date.now();
    const taskId = makeLocalPendingTaskId(now);
    setRepoWikiByWorkspaceKey((previous) => {
      const next = new Map(previous);
      next.set(
        project.workspaceKey,
        toPendingWikiProjectState({
          current: previous.get(project.workspaceKey),
          workspaceKey: project.workspaceKey,
          taskId,
          now,
        }),
      );
      return next;
    });
    logger.info("[RepoWikiPane] Wiki 生成已进入本地等待状态", {
      workspaceKey: project.workspaceKey,
      taskId,
    });
    repoWikiService
      .generate({
        ...target,
        language: form.language,
        force,
        ...buildGenerateModelFields(normalizedModelValue),
        maxRetries: clampMaxRetries(form.maxRetries),
        generateDiagrams: form.generateDiagrams,
      })
      .then(() => repoWikiService.readSummary(target))
      .then((summary) => {
        if (!mountedRef.current || !aliveKeysRef.current.has(project.workspaceKey)) return;
        logger.info("[RepoWikiPane] Wiki 生成请求返回，已同步状态", {
          workspaceKey: project.workspaceKey,
          hasWiki: !!summary.wiki,
          hasDraft: !!summary.draft,
          taskStatus: summary.task?.status,
          taskPhase: summary.task?.phase,
        });
        setRepoWikiByWorkspaceKey((previous) => {
          const next = new Map(previous);
          next.set(project.workspaceKey, toLoadedWikiProjectState(summary, { hideFailedTask: false }));
          return next;
        });
        const effective = resolveEffectiveWiki(summary.wiki, summary.draft, summary.task);
        setSelectedPageId((previous) => previous ?? effective?.pages[0]?.id ?? null);
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : String(error);
        logger.warn("[RepoWikiPane] 生成项目 Wiki 后同步状态失败", {
          workspaceKey: project.workspaceKey,
          error: message,
        });
        if (!mountedRef.current || !aliveKeysRef.current.has(project.workspaceKey)) return;
        setRepoWikiByWorkspaceKey((previous) => {
          const current = previous.get(project.workspaceKey);
          if (!current?.task || current.task.taskId !== taskId || !isWikiTaskRunning(current.task)) return previous;
          const next = new Map(previous);
          next.set(project.workspaceKey, {
            ...current,
            task: {
              ...current.task,
              phase: "error",
              status: "failed",
              error: message,
              updatedAt: Date.now(),
            },
          });
          return next;
        });
      });
  };

  const handleStop = () => {
    if (!activeProject || !taskRunning) return;
    logger.info("[RepoWikiPane] 用户停止 Wiki 生成", {
      workspaceKey: activeProject.workspaceKey,
      taskId: activeTask?.taskId,
    });
    repoWikiService.cancel({ workspacePath: activeProject.workspacePath, workspaceIdentity: activeProject.workspaceIdentity });
  };

  return (
    <div ref={rootRef} className="flex h-full min-h-0 flex-col bg-background text-foreground @container/repo-wiki">
      <div className="flex min-h-10 shrink-0 flex-wrap items-center justify-between gap-1 border-border border-b px-3 py-1">
        <div className="flex min-w-0 items-center gap-2">
          {onBack ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="shrink-0 px-2 text-foreground-subtle hover:bg-surface-hover hover:text-foreground"
              aria-label={intl.formatMessage({ id: "repoWiki.back" })}
              onClick={onBack}
            >
              <IconArrowLeft className="size-4" />
              <span>{intl.formatMessage({ id: "repoWiki.back" })}</span>
            </Button>
          ) : null}
          <RepoWikiLogoIcon className="size-4 shrink-0 text-foreground-subtle" />
          <div className="min-w-0 truncate text-ui-base font-medium">{intl.formatMessage({ id: "repoWiki.title" })}</div>
        </div>
        <div className="flex min-w-0 max-w-full flex-wrap items-center justify-end gap-1.5 @max-[560px]/repo-wiki:w-full">
          <Button
            type="button"
            variant="ghost"
            size="icon-md"
            className="hidden @max-[560px]/repo-wiki:inline-flex"
            title={intl.formatMessage({ id: catalogCollapsed ? "repoWiki.expandCatalog" : "repoWiki.collapseCatalog" })}
            aria-label={intl.formatMessage({ id: catalogCollapsed ? "repoWiki.expandCatalog" : "repoWiki.collapseCatalog" })}
            onClick={() => setCatalogCollapsed((previous) => !previous)}
          >
            {catalogCollapsed ? <IconPanelLeftOpen className="size-4" /> : <IconPanelLeftClose className="size-4" />}
          </Button>
          {hasContent && activeProject ? (
            <AlertDialogRoot>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  title={intl.formatMessage({ id: "repoWiki.delete" })}
                  aria-label={intl.formatMessage({ id: "repoWiki.delete" })}
                  disabled={taskRunning || deletingWorkspaceKey === activeProject.workspaceKey}
                >
                  <IconTrash2 className="size-3.5" />
                  <span className="@max-[560px]/repo-wiki:hidden">{intl.formatMessage({ id: "repoWiki.delete" })}</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{intl.formatMessage({ id: "repoWiki.deleteConfirmTitle" })}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {intl.formatMessage({ id: "repoWiki.deleteConfirmDescription" }, { repoName: activeProject.title })}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{intl.formatMessage({ id: "common.cancel" })}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      const deletable = activeProject && (activeProject.publishedWiki || isFailedOrCancelledDraft(activeProject.draft, activeProject.task)) && !taskRunning;
                      if (!activeProject || !deletable) return;
                      const project = activeProject;
                      setDeletingWorkspaceKey(project.workspaceKey);
                      repoWikiService
                        .delete({
                          workspacePath: project.workspacePath,
                          workspaceIdentity: project.workspaceIdentity,
                        })
                        .catch((error) => {
                          logger.warn("[RepoWikiPane] 删除项目 Wiki 失败", {
                            workspaceKey: project.workspaceKey,
                            error: error instanceof Error ? error.message : String(error),
                          });
                        })
                        .finally(() => {
                          setDeletingWorkspaceKey((previous) => (previous === project.workspaceKey ? null : previous));
                        });
                    }}
                  >
                    {intl.formatMessage({ id: "repoWiki.deleteConfirmAction" })}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogRoot>
          ) : null}
          {canRegenerate ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                title={intl.formatMessage({ id: "repoWiki.regenerate" })}
                disabled={generateDisabled}
                onClick={() => handleGenerate(true)}
              >
                <IconRefreshCw className="size-4" />
                <span className="@max-[560px]/repo-wiki:hidden">{intl.formatMessage({ id: "repoWiki.regenerate" })}</span>
              </Button>
              <SelectRoot value={form.language} onValueChange={handleLanguageSelect} disabled={settingsDisabled}>
                <SelectTrigger
                  className="w-28"
                  size="lg"
                  title={intl.formatMessage({ id: "repoWiki.meta.language" })}
                  aria-label={intl.formatMessage({ id: "repoWiki.meta.language" })}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" align="end">
                  <SelectItem value="zh-CN">{intl.formatMessage({ id: "settings.locale.zh-CN" })}</SelectItem>
                  <SelectItem value="en-US">{intl.formatMessage({ id: "settings.locale.en-US" })}</SelectItem>
                </SelectContent>
              </SelectRoot>
              <ModelSelector
                modelGroups={modelGroups as unknown as ModelGroup[]}
                normalizedValue={normalizedModelValue}
                triggerLabel={modelTriggerLabel}
                showManageModelsAction={false}
                lockReasonMessage=""
                isItemLocked={wikiModelNeverLocked}
                onValueChange={handleModelChange}
                disabled={settingsDisabled || modelGroups.length === 0}
                tooltipTitle={intl.formatMessage({ id: "repoWiki.meta.model" })}
                labelVisibilityClassName="hidden @min-[760px]/repo-wiki:inline-flex"
                triggerClassName="max-w-52"
                focusSelectorOnClose={null}
                contentSide="bottom"
                contentAlign="end"
              />
              <label className="flex shrink-0 items-center gap-2 rounded-md px-2 text-ui-base text-foreground-subtle">
                <Checkbox
                  checked={form.generateDiagrams}
                  onCheckedChange={handleGenerateDiagramsChange}
                  disabled={settingsDisabled}
                  aria-label={intl.formatMessage({ id: "repoWiki.meta.generateDiagrams" })}
                />
                <span>{intl.formatMessage({ id: "repoWiki.meta.generateDiagrams" })}</span>
              </label>
            </>
          ) : null}
        </div>
      </div>
      {activeWiki && activeProject ? <WikiProjectCard project={activeProject} task={activeTask} onStop={handleStop} /> : null}
      <PanelGroup
        layoutId="repo-wiki-pane-layout"
        panelIds={["repo-wiki-projects", "repo-wiki-content"]}
        className="min-h-0 flex-1 max-md:!flex-col @max-[560px]/repo-wiki:!flex-col"
      >
        <Panel
          id="repo-wiki-projects"
          minSize={catalogCollapsed ? "40px" : isNarrow ? "160px" : "220px"}
          maxSize={catalogCollapsed ? "40px" : isNarrow ? "280px" : "520px"}
          defaultSize={catalogCollapsed ? "40px" : isNarrow ? "220px" : "280px"}
          className={cn(
            "min-h-0 border-border border-r bg-sidebar max-md:!h-auto max-md:!max-h-80 max-md:!w-full max-md:border-r-0 max-md:border-b @max-[560px]/repo-wiki:!h-auto @max-[560px]/repo-wiki:!max-h-72 @max-[560px]/repo-wiki:!w-full @max-[560px]/repo-wiki:border-r-0 @max-[560px]/repo-wiki:border-b",
            catalogCollapsed && "max-md:hidden @max-[560px]/repo-wiki:hidden",
          )}
        >
          <CollapsiblePanelShell
            collapsed={catalogCollapsed}
            title={intl.formatMessage({ id: "repoWiki.projects" })}
            collapseLabel={intl.formatMessage({ id: "repoWiki.collapseProjects" })}
            expandLabel={intl.formatMessage({ id: "repoWiki.expandProjects" })}
            collapsedIcon={<IconPanelLeftOpen className="size-4" />}
            expandedIcon={<IconPanelLeftClose className="size-4" />}
            onToggle={() => setCatalogCollapsed((previous) => !previous)}
          >
            <WikiProjectList
              projects={projects}
              activeProjectId={activeProject?.id ?? null}
              activePageId={selectedPage?.id ?? null}
              expandedProjectIds={expandedProjectIds}
              collapsedNodeIds={collapsedNodeIds}
              onToggleProject={(projectId) => {
                setExpandedProjectIds((previous) => {
                  const next = new Set(previous);
                  if (next.has(projectId)) next.delete(projectId);
                  else next.add(projectId);
                  return next;
                });
              }}
              onToggleNode={(projectId, nodeId) => {
                setCollapsedNodeIds((previous) => {
                  const next = new Set(previous);
                  const key = makeCollapsedNodeKey(projectId, nodeId);
                  if (next.has(key)) next.delete(key);
                  else next.add(key);
                  return next;
                });
              }}
              onSelectPage={(project, pageId) => {
                setCurrentProjectId(project.id);
                setSelectedPageId(pageId);
              }}
              onSelectProject={(project) => {
                setCurrentProjectId(project.id);
                setSelectedPageId(findFirstPageId(project.nodes));
              }}
            />
          </CollapsiblePanelShell>
        </Panel>
        <PanelResizeHandle className={cn("max-md:hidden @max-[560px]/repo-wiki:hidden", catalogCollapsed && "opacity-0")} />
        <Panel id="repo-wiki-content" minSize="320px" className="min-h-0 max-md:!w-full @max-[560px]/repo-wiki:!w-full">
          <div className="h-full min-h-0 overflow-auto px-5 py-4 @max-[560px]/repo-wiki:px-3">
            {activePage ? (
              <WikiPageRenderer key={pageCacheKey ?? activePage.id} page={activePage} workspacePath={activeProject?.workspacePath ?? workspacePath} onOpenCodeViewer={onOpenCodeViewer} />
            ) : pagePending ? (
              <WikiPagePendingCard pageTitle={selectedPage?.title ?? ""} task={activeTask} />
            ) : pageLoading ? (
              <div className="flex min-h-full items-center justify-center text-ui-base text-foreground-subtle">
                {intl.formatMessage({ id: "common.loading" })}
              </div>
            ) : (
              <WikiGenerateEmptyState
                repoName={projectTitle}
                task={activeTask}
                running={taskRunning}
                settingsDisabled={settingsDisabled}
                generateDisabled={generateDisabled}
                modelGroups={modelGroups}
                selectedModelValue={normalizedModelValue}
                selectedModelLabel={modelTriggerLabel}
                selectedLanguage={form.language}
                maxRetries={form.maxRetries}
                generateDiagrams={form.generateDiagrams}
                onModelChange={handleModelChange}
                onLanguageChange={handleLanguageChange}
                onMaxRetriesChange={handleMaxRetriesChange}
                onGenerateDiagramsChange={handleGenerateDiagramsChange}
                onGenerate={() => handleGenerate(true)}
                onStop={handleStop}
              />
            )}
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
};

/* ============================================================================
 * 2. TreemappingView 族（原 AGt 等；js 178920–179887 / jsx 145022–145637）
 * ==========================================================================*/

/* ---- 2.0 基座：工具调用路径/变更检视（原 b5…XWt，js 178920–179049） ---- */

const TREEMAP_PENDING_STATUSES = new Set(["pending", "in_progress"]); // 原 b5

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && !!value && !Array.isArray(value);
}

function readFirstStringField(record: Record<string, unknown>, fields: string[]): string | undefined {
  for (const field of fields) {
    const value = record[field];
    if (typeof value === "string" && value.trim().length > 0) return value;
  }
  return undefined;
}

function readFirstNumberField(record: Record<string, unknown>, fields: string[]): number | undefined {
  for (const field of fields) {
    const value = record[field];
    if (typeof value === "number" && Number.isFinite(value)) return Math.max(0, Math.round(value));
  }
  return undefined;
}

/** 原 C5：把工具调用里的路径归一到工作区相对路径 */
function normalizeTreemapPath(raw: string, workspacePath: string): string | null {
  const path = raw.trim().replace(/\\/g, "/");
  if (!path || path.includes("\n")) return null;
  const root = workspacePath.replace(/\\/g, "/").replace(/\/+$/, "");
  if (root && path.startsWith(`${root}/`)) return path.slice(root.length + 1);
  if (isAbsolutePath(path)) return path.replace(/^\/+/, "");
  return path.replace(/^\.?\//, "");
}

function normalizeTreemapDirectoryPath(raw: string, workspacePath: string): string | null {
  return normalizeTreemapPath(raw, workspacePath)?.replace(/\/+$/, "") || null;
}

function resolveToolDisplayName(toolCall: ToolCallViewModel): string {
  return (classifyToolFamily(toolCall).toolName ?? toolCall.title?.trim()) || toolCall.kind || "tool";
}

function collectToolSearchText(toolCall: ToolCallViewModel): string {
  const raw = isPlainRecord(toolCall.raw) ? toolCall.raw : null;
  const rawInput = raw && isPlainRecord(raw.rawInput) ? (raw.rawInput as Record<string, unknown>) : null;
  const rawTitle = raw && typeof raw.title === "string" ? raw.title : "";
  const rawKind = raw && typeof raw.kind === "string" ? raw.kind : "";
  const inputAction = readFirstStringField((toolCall.input ?? {}) as Record<string, unknown>, ["action", "operation", "mode", "kind", "title"]);
  const rawInputAction = rawInput ? readFirstStringField(rawInput, ["action", "operation", "mode", "kind", "title"]) : undefined;
  return [toolCall.kind, toolCall.title, rawKind, rawTitle, inputAction, rawInputAction].filter(Boolean).join(" ").toLowerCase();
}

function collectToolActionText(toolCall: ToolCallViewModel): string {
  const raw = isPlainRecord(toolCall.raw) ? toolCall.raw : null;
  const rawInput = raw && isPlainRecord(raw.rawInput) ? (raw.rawInput as Record<string, unknown>) : null;
  const rawKind = raw && typeof raw.kind === "string" ? raw.kind : "";
  const inputAction = readFirstStringField((toolCall.input ?? {}) as Record<string, unknown>, ["action", "operation", "mode", "kind"]);
  const rawInputAction = rawInput ? readFirstStringField(rawInput, ["action", "operation", "mode", "kind"]) : undefined;
  return [toolCall.kind, rawKind, inputAction, rawInputAction].filter(Boolean).join(" ").toLowerCase();
}

function classifyReadToolKind(toolCall: ToolCallViewModel): "file" | "directory" | "search" | null {
  const family = classifyToolFamily(toolCall);
  if (family.family === "file-read") return "file";
  if (family.family === "search") return family.toolName === "Glob" ? "directory" : "search";
  const text = collectToolSearchText(toolCall);
  if (/\b(ls|list|readdir|tree)\b/.test(text)) return "directory";
  if (/\b(search|grep|rg|ripgrep|find|glob)\b/.test(text)) return "search";
  if (/\b(read|view|open|cat|head|tail)\b/.test(text)) return "file";
  return null;
}

function collectPathCandidates(record: unknown): string[] {
  if (!isPlainRecord(record)) return [];
  const found = new Set<string>();
  const single = readFirstStringField(record, [
    "path",
    "filePath",
    "file_path",
    "targetPath",
    "target_path",
    "sourcePath",
    "source_path",
    "oldPath",
    "old_path",
    "newPath",
    "new_path",
    "filename",
    "file",
    "directory",
    "dir",
    "cwd",
  ]);
  if (single) found.add(single);
  for (const field of ["paths", "files", "filePaths", "file_paths", "matches", "results"]) {
    const value = record[field];
    if (Array.isArray(value))
      for (const item of value) {
        if (typeof item === "string" && item.trim()) found.add(item);
        else {
          const nested = isPlainRecord(item) ? readFirstStringField(item, ["path", "filePath", "file_path", "filename", "file"]) : undefined;
          if (nested) found.add(nested);
        }
      }
  }
  return [...found];
}

function collectAllToolPaths(toolCall: ToolCallViewModel): string[] {
  const raw = isPlainRecord(toolCall.raw) ? toolCall.raw : null;
  const rawInput = raw && isPlainRecord(raw.rawInput) ? (raw.rawInput as Record<string, unknown>) : null;
  const rawOutput = raw && isPlainRecord(raw.rawOutput) ? (raw.rawOutput as Record<string, unknown>) : null;
  return [
    ...collectPathCandidates(toolCall.input),
    ...collectPathCandidates(toolCall.output),
    ...collectPathCandidates(rawInput),
    ...collectPathCandidates(rawOutput),
    ...collectPathCandidates(raw),
  ];
}

function collectOutputToolPaths(toolCall: ToolCallViewModel): string[] {
  const raw = isPlainRecord(toolCall.raw) ? toolCall.raw : null;
  const rawOutput = raw && isPlainRecord(raw.rawOutput) ? (raw.rawOutput as Record<string, unknown>) : null;
  return [...collectPathCandidates(toolCall.output), ...collectPathCandidates(rawOutput)];
}

function collectInputToolPaths(toolCall: ToolCallViewModel): string[] {
  const raw = isPlainRecord(toolCall.raw) ? toolCall.raw : null;
  const rawInput = raw && isPlainRecord(raw.rawInput) ? (raw.rawInput as Record<string, unknown>) : null;
  return [...collectPathCandidates(toolCall.input), ...collectPathCandidates(rawInput)];
}

function readChangeStat(record: unknown): { added: number; removed: number } {
  if (!isPlainRecord(record)) return { added: 0, removed: 0 };
  return {
    added: readFirstNumberField(record, ["added", "additions", "insertions", "linesAdded"]) ?? 0,
    removed: readFirstNumberField(record, ["removed", "deletions", "deleted", "linesRemoved"]) ?? 0,
  };
}

function parseJsonObject(value: unknown): Record<string, unknown> | null {
  if (isPlainRecord(value)) return value;
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    return isPlainRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function normalizeFileActionLabel(label?: string): "write" | "delete" | "modify" | null {
  switch (label?.trim().toLowerCase()) {
    case "create":
    case "add":
    case "write":
      return "write";
    case "delete":
    case "remove":
    case "removed":
      return "delete";
    case "update":
    case "edit":
    case "modify":
      return "modify";
    default:
      return null;
  }
}

function inferFileActionFromOutput(toolCall: ToolCallViewModel): "write" | "delete" | "modify" | null {
  const raw = isPlainRecord(toolCall.raw) ? toolCall.raw : null;
  const rawOutput = raw && isPlainRecord(raw.rawOutput) ? (raw.rawOutput as Record<string, unknown>) : null;
  const output = isPlainRecord(toolCall.output) ? toolCall.output : null;
  for (const candidate of [rawOutput, output]) {
    const content = parseJsonObject(candidate?.content);
    const action = normalizeFileActionLabel(typeof content?.type === "string" ? content.type : undefined);
    if (action) return action;
  }
  return null;
}

function classifyFileWriteAction(toolCall: ToolCallViewModel): "write" | "modify" | "delete" | null {
  const family = classifyToolFamily(toolCall);
  if (family.family === "file-write") return family.toolName === "Write" ? "write" : "modify";
  const text = collectToolActionText(toolCall);
  if (/\b(delete|remove|unlink|rm)\b/.test(text)) return "delete";
  if (/\b(create|write)\b/.test(text)) return "write";
  if (/\b(edit|multiedit|patch|replace|update|apply_patch)\b/.test(text)) return "modify";
  return null;
}

/* ---- 2.1 事件采集（原 eGt/nGt/tGt/rGt/iGt/aGt/oGt/sGt/lGt，js 179050–179317） ---- */

interface TreemapFileEvent {
  toolCallId: string;
  toolName: string;
  action: "write" | "modify" | "delete" | "view";
  path: string;
  target: "file" | "directory";
  added: number;
  removed: number;
  timestamp: number;
  pending: boolean;
}

interface TreemapDirectoryAggregate {
  path: string;
  views: number;
  lastTouchedAt: number;
  events: TreemapFileEvent[];
}

interface TreemapFileAggregate {
  path: string;
  kind: "written" | "modified" | "deleted" | "viewed";
  added: number;
  removed: number;
  views: number;
  pendingToolCallIds: string[];
  lastTouchedAt: number;
  events: TreemapFileEvent[];
}

function upsertDirectoryAggregate(map: Map<string, TreemapDirectoryAggregate>, event: TreemapFileEvent): void {
  const existing = map.get(event.path);
  if (existing) {
    existing.views += +(event.action === "view");
    existing.lastTouchedAt = Math.max(existing.lastTouchedAt, event.timestamp);
    existing.events.push(event);
    return;
  }
  map.set(event.path, {
    path: event.path,
    views: +(event.action === "view"),
    lastTouchedAt: event.timestamp,
    events: [event],
  });
}

function preferFileKind(current: TreemapFileAggregate["kind"], next: TreemapFileAggregate["kind"]): TreemapFileAggregate["kind"] {
  const rank = { deleted: 4, written: 3, modified: 2, viewed: 1 } as const;
  return rank[next] > rank[current] ? next : current;
}

function upsertFileAggregate(map: Map<string, TreemapFileAggregate>, event: TreemapFileEvent): void {
  const kind: TreemapFileAggregate["kind"] =
    event.action === "write" ? "written" : event.action === "modify" ? "modified" : event.action === "delete" ? "deleted" : "viewed";
  const existing = map.get(event.path);
  if (existing) {
    existing.kind = preferFileKind(existing.kind, kind);
    existing.added += event.added;
    existing.removed += event.removed;
    existing.views += +(event.action === "view");
    existing.lastTouchedAt = Math.max(existing.lastTouchedAt, event.timestamp);
    existing.events.push(event);
    if (event.pending && !existing.pendingToolCallIds.includes(event.toolCallId)) existing.pendingToolCallIds.push(event.toolCallId);
    return;
  }
  map.set(event.path, {
    path: event.path,
    kind,
    added: event.added,
    removed: event.removed,
    views: +(event.action === "view"),
    pendingToolCallIds: event.pending ? [event.toolCallId] : [],
    lastTouchedAt: event.timestamp,
    events: [event],
  });
}

function collectWriteEvents(toolCall: ToolCallViewModel, workspacePath: string): TreemapFileEvent[] {
  const pending = TREEMAP_PENDING_STATUSES.has(toolCall.status);
  const timestamp = toolCall.startedAt ?? Date.now();
  const toolName = resolveToolDisplayName(toolCall);
  const outputAction = inferFileActionFromOutput(toolCall);
  return extractFileChangeCandidates(toolCall.raw, {
    toolName: toolCall.toolName,
    kind: toolCall.kind,
    input: toolCall.input,
    output: toolCall.output,
    raw: toolCall.raw,
  })
    .map((candidate): TreemapFileEvent | null => {
      const path = normalizeTreemapPath(candidate.path, workspacePath);
      if (!path) return null;
      const action =
        outputAction ??
        (candidate.actionLabel === "Deleted"
          ? "delete"
          : candidate.actionLabel === "Created" || candidate.operationKind === "write"
            ? "write"
            : candidate.operationKind === "delete"
              ? "delete"
              : "modify");
      return {
        toolCallId: toolCall.toolId,
        toolName,
        action,
        path,
        target: "file" as const,
        added: candidate.changeStat?.added ?? +(action === "write"),
        removed: candidate.changeStat?.removed ?? +(action === "delete"),
        timestamp,
        pending,
      };
    })
    .filter((event): event is TreemapFileEvent => event !== null);
}

function collectViewEvents(toolCall: ToolCallViewModel, workspacePath: string): TreemapFileEvent[] {
  const readKind = classifyReadToolKind(toolCall);
  if (!readKind) return [];
  const pending = TREEMAP_PENDING_STATUSES.has(toolCall.status);
  const timestamp = toolCall.startedAt ?? Date.now();
  const toolName = resolveToolDisplayName(toolCall);
  const rawPaths = readKind === "search" ? collectOutputToolPaths(toolCall) : collectAllToolPaths(toolCall);
  const target = readKind === "directory" || (readKind === "search" && rawPaths.length === 0) ? "directory" : "file";
  return [
    ...new Set(
      (rawPaths.length > 0 ? rawPaths : collectInputToolPaths(toolCall))
        .map((path) => (target === "directory" ? normalizeTreemapDirectoryPath(path, workspacePath) : normalizeTreemapPath(path, workspacePath)))
        .filter((path): path is string => !!path),
    ),
  ].map((path) => ({
    toolCallId: toolCall.toolId,
    toolName,
    action: "view" as const,
    path,
    target,
    added: 0,
    removed: 0,
    timestamp,
    pending,
  }));
}

function collectLegacyChangesEvents(toolCall: ToolCallViewModel, workspacePath: string): TreemapFileEvent[] {
  const raw = isPlainRecord(toolCall.raw) ? toolCall.raw : null;
  const rawOutput = raw && isPlainRecord(raw.rawOutput) ? (raw.rawOutput as Record<string, unknown>) : null;
  const candidates = [toolCall.output, rawOutput, raw].filter(isPlainRecord);
  const events: TreemapFileEvent[] = [];
  const pending = TREEMAP_PENDING_STATUSES.has(toolCall.status);
  const timestamp = toolCall.startedAt ?? Date.now();
  const toolName = resolveToolDisplayName(toolCall);
  for (const candidate of candidates) {
    const changes = isPlainRecord(candidate.changes) ? candidate.changes : null;
    if (!changes) continue;
    for (const [path, value] of Object.entries(changes)) {
      const normalized = normalizeTreemapPath(path, workspacePath);
      if (!normalized || !isPlainRecord(value)) continue;
      const type = typeof value.type === "string" ? value.type : "";
      const stat = readChangeStat(value);
      events.push({
        toolCallId: toolCall.toolId,
        toolName,
        action: type === "add" ? "write" : type === "delete" ? "delete" : "modify",
        path: normalized,
        target: "file",
        added: stat.added,
        removed: stat.removed,
        timestamp,
        pending,
      });
    }
  }
  return events;
}

function collectFallbackPathEvents(toolCall: ToolCallViewModel, workspacePath: string): TreemapFileEvent[] {
  const action = classifyFileWriteAction(toolCall);
  if (!action) return [];
  const pending = TREEMAP_PENDING_STATUSES.has(toolCall.status);
  const timestamp = toolCall.startedAt ?? Date.now();
  const toolName = resolveToolDisplayName(toolCall);
  return [
    ...new Set(
      collectAllToolPaths(toolCall)
        .map((path) => normalizeTreemapPath(path, workspacePath))
        .filter((path): path is string => !!path),
    ),
  ].map((path) => ({
    toolCallId: toolCall.toolId,
    toolName,
    action,
    path,
    target: "file" as const,
    added: +(action === "write"),
    removed: +(action === "delete"),
    timestamp,
    pending,
  }));
}

interface TreemapEventCollection {
  files: TreemapFileAggregate[];
  directories: TreemapDirectoryAggregate[];
  runningWithoutPathCount: number;
}

function collectTreemapEvents(turn: { toolCalls: ToolCallViewModel[] } | null, workspacePath: string): TreemapEventCollection {
  const fileMap = new Map<string, TreemapFileAggregate>();
  const directoryMap = new Map<string, TreemapDirectoryAggregate>();
  let runningWithoutPathCount = 0;
  for (const toolCall of turn?.toolCalls ?? []) {
    const writeEvents = collectWriteEvents(toolCall, workspacePath);
    const events = [
      ...writeEvents,
      ...(writeEvents.length === 0 ? collectLegacyChangesEvents(toolCall, workspacePath) : []),
      ...(writeEvents.length === 0 ? collectFallbackPathEvents(toolCall, workspacePath) : []),
      ...collectViewEvents(toolCall, workspacePath),
    ];
    if (events.length === 0 && TREEMAP_PENDING_STATUSES.has(toolCall.status)) {
      runningWithoutPathCount += 1;
      continue;
    }
    for (const event of events) {
      if (event.target === "directory") upsertDirectoryAggregate(directoryMap, event);
      else upsertFileAggregate(fileMap, event);
    }
  }
  return {
    files: [...fileMap.values()].sort((a, b) => a.path.localeCompare(b.path)),
    directories: [...directoryMap.values()].sort((a, b) => a.path.localeCompare(b.path)),
    runningWithoutPathCount,
  };
}

/** 原 lGt：从会话行窗口提取最后一个含内容的轮次（含流式判定） */
function extractLatestTurn(rows: SessionRow[]): { id: string; streaming?: boolean; toolCalls: ToolCallViewModel[] } | null {
  const contentKinds = new Set(["assistantText", "reasoning", "toolCall", "subagent"]);
  let turnId: number | string | null = null;
  for (let index = rows.length - 1; index >= 0; --index) {
    const row = rows[index];
    if (contentKinds.has(row.kind)) {
      turnId = row.turnId;
      break;
    }
  }
  if (turnId === null) return null;
  const turnRows = rows.filter((row) => row.turnId === turnId);
  const toolCallRows = turnRows.filter((row) => row.kind === "toolCall");
  const streaming = turnRows.some(
    (row) =>
      ((row.kind === "assistantText" || row.kind === "reasoning") && row.state === "streaming") ||
      (row.kind === "toolCall" && (row.status === "inputStreaming" || row.status === "running")),
  );
  return {
    id: `v4-turn-${turnId}`,
    streaming: streaming || undefined,
    toolCalls: toolCallRows.map((row) => extractToolCallRow(row).toolCall),
  };
}

/** 原 uGt：会话轨迹钩子（快照客户端 + 末轮提取） */
function useTreemapLiveTurn(params: { sessionId: string | null; workspacePath: string; workspaceIdentity?: string | null }) {
  const { sessionId, workspacePath, workspaceIdentity } = params;
  const { zcodeAgentService } = useServices();
  const client = React.useMemo(
    () => new SessionSnapshotClientImpl({ transport: createSessionTransport(zcodeAgentService, { workspacePath, workspaceIdentity }) }),
    [zcodeAgentService, workspacePath, workspaceIdentity],
  );
  React.useEffect(() => () => client.dispose(), [client]);
  const [sessionRef, setSessionRef] = React.useState<(ReturnType<SessionSnapshotClient["acquire"]>) | null>(null);
  React.useEffect(() => {
    if (!sessionId) {
      setSessionRef(null);
      return;
    }
    const acquired = client.acquire(sessionId);
    setSessionRef(acquired);
    return () => {
      acquired.release();
    };
  }, [client, sessionId]);
  const rows = useSessionSnapshotRef(sessionRef)?.snapshot?.rows.window;
  return React.useMemo(() => (rows ? extractLatestTurn(rows) : null), [rows]);
}

/* ---- 2.2 树构造与统计（原 gGt…kGt，js 179341–179492） ---- */

const TREEMAP_MIN_DIRECTORY_WEIGHT = 6; // 原 dGt
const TREEMAP_BASE_WEIGHT = 14; // 原 E5
const TREEMAP_ROOT_PATH = "."; // 原 D5
const TREEMAP_DIRECTORY_BASIS_SCALE = 64; // 原 fGt
const TREEMAP_DIRECTORY_MIN_BASIS_SCALE = 34; // 原 pGt
const TREEMAP_FILE_BASIS_SCALE = 52; // 原 mGt
const TREEMAP_FILE_MIN_BASIS_SCALE = 24; // 原 hGt

interface TreemapDirectoryNode {
  type: "directory";
  path: string;
  views: number;
  lastTouchedAt: number;
  events: TreemapFileEvent[];
  children: TreemapNode[];
}

interface TreemapFileNode {
  type: "file";
  path: string;
  kind: "written" | "modified" | "deleted" | "viewed";
  added: number;
  removed: number;
  views: number;
  pendingToolCallIds: string[];
  lastTouchedAt: number;
  events: TreemapFileEvent[];
}

type TreemapNode = TreemapDirectoryNode | TreemapFileNode;

interface TreemapNodeStats {
  added: number;
  removed: number;
  views: number;
  files: number;
  written: number;
  modified: number;
  deleted: number;
  pending: number;
}

function createTreemapDirectory(path: string): TreemapDirectoryNode {
  return { type: "directory", path, views: 0, lastTouchedAt: 0, events: [], children: [] };
}

function splitTreemapPath(path: string): string[] {
  return path.replace(/\\/g, "/").split("/").filter(Boolean);
}

function findTreemapChildDirectory(node: TreemapDirectoryNode, path: string): TreemapDirectoryNode | null {
  return node.children.find((child): child is TreemapDirectoryNode => child.type === "directory" && child.path === path) ?? null;
}

function ensureTreemapDirectory(root: TreemapDirectoryNode, path: string): TreemapDirectoryNode {
  if (!path || path === TREEMAP_ROOT_PATH) return root;
  let current = root;
  const segments = splitTreemapPath(path);
  let built = "";
  for (const segment of segments) {
    built = built ? `${built}/${segment}` : segment;
    const existing = findTreemapChildDirectory(current, built);
    if (existing) {
      current = existing;
      continue;
    }
    const created = createTreemapDirectory(built);
    current.children.push(created);
    current = created;
  }
  return current;
}

function treemapParentPath(path: string): string {
  const index = path.lastIndexOf("/");
  return index > 0 ? path.slice(0, index) : TREEMAP_ROOT_PATH;
}

function buildTreemapTree(collection: TreemapEventCollection, rootPath: string): TreemapDirectoryNode {
  const root = createTreemapDirectory(rootPath || TREEMAP_ROOT_PATH);
  const directoryByPath = new Map<string, TreemapDirectoryNode>([[TREEMAP_ROOT_PATH, root]]);
  for (const directory of collection.directories) {
    const node = ensureTreemapDirectory(root, directory.path);
    directoryByPath.set(directory.path, node);
    node.views += directory.views;
    node.lastTouchedAt = Math.max(node.lastTouchedAt, directory.lastTouchedAt);
    node.events.push(...directory.events);
  }
  for (const file of collection.files) ensureTreemapDirectory(root, treemapParentPath(file.path)).children.push({ ...file, type: "file" });
  sortTreemapTree(root);
  return root;
}

function sortTreemapTree(node: TreemapDirectoryNode): void {
  node.children.sort((a, b) => {
    if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
    const aWeight = computeTreemapStats(a).added + computeTreemapStats(a).removed;
    const bWeight = computeTreemapStats(b).added + computeTreemapStats(b).removed;
    return aWeight === bWeight ? a.path.localeCompare(b.path) : bWeight - aWeight;
  });
  for (const child of node.children) if (child.type === "directory") sortTreemapTree(child);
}

function computeTreemapStats(node: TreemapNode): TreemapNodeStats {
  return node.type === "file"
    ? {
        added: node.added,
        removed: node.removed,
        views: node.views,
        files: 1,
        written: +(node.kind === "written"),
        modified: +(node.kind === "modified"),
        deleted: +(node.kind === "deleted"),
        pending: node.pendingToolCallIds.length,
      }
    : node.children.reduce(
        (acc, child) => {
          const stats = computeTreemapStats(child);
          return {
            added: acc.added + stats.added,
            removed: acc.removed + stats.removed,
            views: acc.views + stats.views,
            files: acc.files + stats.files,
            written: acc.written + stats.written,
            modified: acc.modified + stats.modified,
            deleted: acc.deleted + stats.deleted,
            pending: acc.pending + stats.pending,
          };
        },
        {
          added: 0,
          removed: 0,
          views: node.views,
          files: 0,
          written: 0,
          modified: 0,
          deleted: 0,
          pending: 0,
        },
      );
}

function treemapChangeMagnitude(stats: { added: number; removed: number }): number {
  return stats.added + stats.removed;
}

function fileTreemapWeight(node: TreemapFileNode): number {
  const magnitude = node.added + node.removed;
  return magnitude > 0 ? Math.max(magnitude, TREEMAP_BASE_WEIGHT) : node.kind === "viewed" ? TREEMAP_MIN_DIRECTORY_WEIGHT : TREEMAP_BASE_WEIGHT;
}

function directoryTreemapWeight(node: TreemapDirectoryNode): number {
  const stats = computeTreemapStats(node);
  const magnitude = treemapChangeMagnitude(stats);
  return magnitude > 0 ? Math.max(magnitude, TREEMAP_BASE_WEIGHT) : stats.views > 0 ? TREEMAP_MIN_DIRECTORY_WEIGHT : TREEMAP_BASE_WEIGHT;
}

function treemapSqrtWeight(weight: number): number {
  return Math.sqrt(Math.max(weight, 1));
}

function clampTreemap(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function findTreemapNodeByPath(node: TreemapNode, path: string): TreemapNode | null {
  if (node.path === path) return node;
  if (node.type === "file") return null;
  for (const child of node.children) {
    const found = findTreemapNodeByPath(child, path);
    if (found) return found;
  }
  return null;
}

function findFirstTreemapNode(node: TreemapNode): TreemapNode | null {
  if (node.type === "file") return node;
  for (const child of node.children) {
    const found = findFirstTreemapNode(child);
    if (found) return found;
  }
  return null;
}

function treemapFileNodeClasses(kind: TreemapFileNode["kind"]): string {
  return kind === "written"
    ? "border-success/50 bg-success/15 text-foreground"
    : kind === "modified"
      ? "border-warning/50 bg-warning/20 text-foreground"
      : kind === "deleted"
        ? "border-destructive/60 bg-destructive/15 text-foreground"
        : "border-file-node-foreground/45 bg-file-node text-foreground";
}

function treemapChangeKindLabel(kind: TreemapFileNode["kind"], formatMessage: (id: string) => string): string {
  return formatMessage(`treemapping.change.${kind}`);
}

function treemapEventActionLabel(action: TreemapFileEvent["action"], formatMessage: (id: string) => string): string {
  return treemapChangeKindLabel(
    action === "write" ? "written" : action === "modify" ? "modified" : action === "delete" ? "deleted" : "viewed",
    formatMessage,
  );
}

/* ---- 2.3 摘要/空态/节点组件（原 M5/N5/jGt/MGt/NGt，js 179672–179885） ---- */

const TreemapStatCard: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="min-w-0 rounded-lg border border-border bg-card px-3 py-2">
    <div className="truncate text-ui-base text-foreground-subtle">{label}</div>
    <div className="mt-1 truncate font-mono text-ui-base font-medium text-foreground">{value}</div>
  </div>
);

const DiffCountBadge: React.FC<{ added: number; removed: number; className?: string }> = ({ added, removed, className }) => (
  <span className={cn("inline-flex items-baseline gap-1 font-mono tabular-nums", className)}>
    <span className={added > 0 ? "text-diff-added" : "text-foreground-subtlest"}>+{added}</span>
    <span className={removed > 0 ? "text-diff-removed" : "text-foreground-subtlest"}>-{removed}</span>
  </span>
);

const TreemapEmptyState: React.FC<{ runningWithoutPathCount: number }> = ({ runningWithoutPathCount }) => {
  const { intl } = useIntlContext();
  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border px-4 text-center">
      {runningWithoutPathCount > 0 ? <SpinnerIcon className="size-4 animate-spin text-foreground-subtle" /> : null}
      <div className="text-ui-base font-medium">{intl.formatMessage({ id: "treemapping.empty.title" })}</div>
      <div className="max-w-64 text-ui-base leading-5 text-foreground-subtle">
        {runningWithoutPathCount > 0
          ? intl.formatMessage({ id: "treemapping.empty.running" }, { count: String(runningWithoutPathCount) })
          : intl.formatMessage({ id: "treemapping.empty.description" })}
      </div>
    </div>
  );
};

const TreemapDirectoryNodeView: React.FC<{
  node: TreemapDirectoryNode;
  depth: number;
  selectedPath: string;
  onSelect: (path: string) => void;
  formatMessage: (id: string) => string;
}> = ({ node, depth, selectedPath, onSelect, formatMessage }) => {
  const stats = computeTreemapStats(node);
  const weight = directoryTreemapWeight(node);
  return (
    <section
      style={{
        flexGrow: weight,
        flexBasis: depth === 0 ? undefined : `${clampTreemap(treemapSqrtWeight(weight) * TREEMAP_DIRECTORY_BASIS_SCALE, 160, 360)}px`,
        minHeight: depth === 0 ? undefined : `${clampTreemap(treemapSqrtWeight(weight) * TREEMAP_DIRECTORY_MIN_BASIS_SCALE, 96, 220)}px`,
      }}
      className={cn(
        "flex min-w-0 flex-col rounded-lg border-2 border-border p-2 transition-colors duration-150",
        depth > 0 && "flex-1",
        selectedPath === node.path && "!border-primary",
      )}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(node.path);
      }}
    >
      <div className="mb-2 flex min-w-0 items-center justify-between gap-2 text-ui-base">
        <span className="flex min-w-0 items-center gap-1.5 font-medium">
          <IconFolder className="size-3.5 shrink-0 text-foreground-subtle" />
          <span className="truncate font-mono">{depth === 0 ? node.path : pathBasename(node.path)}</span>
        </span>
        <span className="inline-flex shrink-0 items-baseline gap-1.5 text-foreground-subtle">
          <DiffCountBadge added={stats.added} removed={stats.removed} />
          {node.views > 0 ? <span className="font-mono">· {node.views}v</span> : null}
        </span>
      </div>
      <div className="flex min-h-20 flex-1 flex-wrap content-stretch items-stretch gap-2">
        {node.children.map((child) =>
          child.type === "directory" ? (
            <TreemapDirectoryNodeView key={child.path} node={child} depth={depth + 1} selectedPath={selectedPath} onSelect={onSelect} formatMessage={formatMessage} />
          ) : (
            <TreemapFileNodeView key={child.path} node={child} selected={selectedPath === child.path} onSelect={onSelect} formatMessage={formatMessage} />
          ),
        )}
      </div>
    </section>
  );
};

const TreemapFileNodeView: React.FC<{
  node: TreemapFileNode;
  selected: boolean;
  onSelect: (path: string) => void;
  formatMessage: (id: string) => string;
}> = ({ node, selected, onSelect, formatMessage }) => {
  const magnitude = node.added + node.removed;
  const weight = fileTreemapWeight(node);
  const recentlyTouched = Date.now() - node.lastTouchedAt < 2_000;
  const displayInfo = resolveFileDisplayInfo(node.path);
  const style: React.CSSProperties = {
    flexGrow: weight,
    flexBasis: `${clampTreemap(treemapSqrtWeight(weight) * TREEMAP_FILE_BASIS_SCALE, 88, 260)}px`,
    minHeight: `${clampTreemap(treemapSqrtWeight(weight) * TREEMAP_FILE_MIN_BASIS_SCALE, 58, 156)}px`,
  };
  return (
    <button
      type="button"
      title={`${node.path} · +${node.added}/-${node.removed} · ${node.views} views`}
      aria-pressed={selected}
      data-selected={selected ? "true" : undefined}
      style={style}
      className={cn(
        "relative min-w-20 flex-1 self-stretch rounded-md border-2 p-2 text-left text-ui-base transition-colors duration-150 hover:border-primary/60 focus-visible:border-primary focus-visible:outline-none",
        "animate-in fade-in zoom-in-95",
        treemapFileNodeClasses(node.kind),
        recentlyTouched && !selected && "border-primary/60",
        selected && "!border-primary",
      )}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(node.path);
      }}
    >
      {node.pendingToolCallIds.length > 0 ? (
        <span className="absolute right-2 top-2 size-2 animate-pulse rounded-full bg-current opacity-80" />
      ) : null}
      <span className="flex h-full min-h-0 flex-col justify-between gap-2">
        <span className="flex min-w-0 flex-col gap-0.5 pr-3 leading-5">
          <span className="flex min-w-0 items-center gap-1.5">
            <FileIconImg src={displayInfo.fileIconSrc} size={14} className="size-3.5 shrink-0 opacity-90" />
            <span className={cn("truncate font-mono font-medium", node.kind === "deleted" && "line-through")}>{displayInfo.fileName}</span>
          </span>
          {displayInfo.filePath ? (
            <span className="truncate font-mono text-ui-base text-foreground-subtle opacity-90">{displayInfo.filePath}</span>
          ) : null}
        </span>
        <span className="space-y-0.5 leading-5">
          <span className="block truncate">{treemapChangeKindLabel(node.kind, formatMessage)}</span>
          <span className="block truncate opacity-85">
            {magnitude > 0 ? <DiffCountBadge added={node.added} removed={node.removed} /> : <span className="font-mono">{node.views} views</span>}
          </span>
        </span>
      </span>
    </button>
  );
};

/* ---- 2.4 TreemappingView（原 AGt，js 179493–179671 / jsx 145507–145569） ---- */

export const TreemappingView: React.FC<{
  activeTaskId: string | null;
  workspacePath: string;
  workspaceIdentity?: string | null;
  source: { kind: "current" } | { kind: string; turnIndex?: number; [key: string]: unknown };
}> = ({ activeTaskId, workspacePath, workspaceIdentity, source }) => {
  const { intl } = useIntlContext();
  const [selectedPath, setSelectedPath] = React.useState<string | null>(null);
  const liveTurn = useTreemapLiveTurn({ sessionId: activeTaskId, workspacePath, workspaceIdentity });
  const eventCollection = React.useMemo(() => collectTreemapEvents(liveTurn, workspacePath), [liveTurn, workspacePath]);
  const tree = React.useMemo(() => buildTreemapTree(eventCollection, pathBasename(workspacePath) || workspacePath), [eventCollection, workspacePath]);
  const selectedNode = (selectedPath ? findTreemapNodeByPath(tree, selectedPath) : null) ?? findFirstTreemapNode(tree) ?? tree;
  const handleSelect = React.useCallback(
    (path: string) => {
      logger.debug("[TreemappingPane] select node", {
        activeTaskId,
        path,
        previousPath: selectedNode.path,
        sourceKind: source.kind,
      });
      setSelectedPath(path);
    },
    [activeTaskId, selectedNode.path, source.kind],
  );
  const rootStats = computeTreemapStats(tree);
  const selectedStats = computeTreemapStats(selectedNode);
  const isLive = source.kind === "current" || !!liveTurn?.streaming;
  const turnIndex = source.kind === "current" ? undefined : (source as { turnIndex?: number }).turnIndex;
  const formatMessage = (id: string) => intl.formatMessage({ id });
  return (
    <div className="flex h-full min-h-0 flex-col bg-background text-foreground">
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-ui-base font-medium">{intl.formatMessage({ id: "treemapping.title" })}</h2>
            <p className="truncate text-ui-base text-foreground-subtle">
              {source.kind === "current"
                ? intl.formatMessage({ id: "treemapping.scope.current" })
                : intl.formatMessage({ id: "treemapping.scope.turn" }, { turn: String(turnIndex === undefined ? "" : turnIndex + 1) })}
            </p>
          </div>
          <span className="rounded-full border border-border px-2 py-0.5 text-ui-base text-foreground-subtle">
            {intl.formatMessage({ id: isLive ? "treemapping.badge.live" : "treemapping.badge.snapshot" })}
          </span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-ui-base">
          <TreemapStatCard label={intl.formatMessage({ id: "treemapping.summary.files" })} value={rootStats.files} />
          <TreemapStatCard label={intl.formatMessage({ id: "treemapping.summary.diff" })} value={<DiffCountBadge added={rootStats.added} removed={rootStats.removed} />} />
          <TreemapStatCard label={intl.formatMessage({ id: "treemapping.summary.views" })} value={rootStats.views} />
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-3">
        {rootStats.files === 0 ? (
          <TreemapEmptyState runningWithoutPathCount={eventCollection.runningWithoutPathCount} />
        ) : (
          <TreemapDirectoryNodeView node={tree} depth={0} selectedPath={selectedNode.path} onSelect={handleSelect} formatMessage={formatMessage} />
        )}
      </div>
      <div className="border-t border-border bg-card px-3 py-2">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <div className="min-w-0 flex-1 overflow-hidden">
            {selectedNode.type === "file" ? (
              <FilePathInline
                path={selectedNode.path}
                options={{
                  showFilePath: true,
                  className: "inline-flex min-w-0 max-w-full items-center gap-1.5",
                  fileNameClassName: "truncate text-ui-base font-medium text-foreground",
                  filePathClassName: "truncate text-ui-base text-foreground-subtlest",
                }}
              />
            ) : (
              <span className="inline-flex min-w-0 max-w-full items-center gap-1.5">
                <IconFolder className="size-3.5 shrink-0 text-foreground-subtle" />
                <span className="truncate font-mono text-ui-base font-medium text-foreground">{selectedNode.path}</span>
              </span>
            )}
          </div>
          <DiffCountBadge added={selectedStats.added} removed={selectedStats.removed} className="shrink-0 text-ui-base" />
        </div>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-ui-base text-foreground-subtle">
          <span>
            <span className="text-foreground-subtlest">{intl.formatMessage({ id: "treemapping.summary.views" })}:</span>{" "}
            <span className="font-mono text-foreground-subtle">{selectedStats.views}</span>
          </span>
          {selectedNode.type === "file" ? (
            <span className="text-foreground-subtle">{treemapChangeKindLabel(selectedNode.kind, formatMessage)}</span>
          ) : (
            <span>
              <span className="text-foreground-subtlest">{intl.formatMessage({ id: "treemapping.summary.files" })}:</span>{" "}
              <span className="font-mono text-foreground-subtle">{selectedStats.files}</span>
            </span>
          )}
        </div>
        {selectedNode.type === "file" && selectedNode.events.length > 0 ? (
          <div className="mt-2 max-h-24 overflow-auto rounded-lg border border-border bg-background/50">
            {selectedNode.events
              .slice(-4)
              .map((event, index) => (
                <div
                  key={`${event.toolCallId}-${event.action}-${index}`}
                  className={cn(
                    "flex min-h-8 min-w-0 items-center justify-between gap-3 px-2 py-1.5 text-ui-base",
                    index > 0 && "border-t border-border/60",
                  )}
                >
                  <span className="flex min-w-0 items-center gap-1.5">
                    <span className="min-w-0 truncate font-medium text-foreground">{treemapEventActionLabel(event.action, formatMessage)}</span>
                  </span>
                  <DiffCountBadge added={event.added} removed={event.removed} className="shrink-0" />
                </div>
              ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

/* ============================================================================
 * 3. WhiteboardCanvas（原 FGt；js 179888–180192 / jsx 145638–145797）
 * ==========================================================================*/

/** 原 PGt（js 179886 / jsx 145637） */
const WHITEBOARD_PALETTE = ["#111827", "#2563eb", "#16a34a", "#dc2626", "#ca8a04", "#7c3aed"];

export const WhiteboardCanvas: React.FC<{ workspacePath: string; workspaceIdentity?: string | null; boardId: string }> = ({
  workspacePath,
  workspaceIdentity,
  boardId,
}) => {
  const { intl } = useIntlContext();
  const workspaceKey = whiteboardWorkspaceKey({ workspacePath, workspaceIdentity });
  const board = useWhiteboardStore((state) => state.workspaces[workspaceKey]?.boardsById[boardId]);
  const renameBoard = useWhiteboardStore((state) => state.renameBoard);
  const addStroke = useWhiteboardStore((state) => state.addStroke);
  const undoStroke = useWhiteboardStore((state) => state.undoStroke);
  const redoStroke = useWhiteboardStore((state) => state.redoStroke);
  const clearBoard = useWhiteboardStore((state) => state.clearBoard);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const draftStrokeRef = React.useRef<WhiteboardStroke | null>(null);
  const activePointerRef = React.useRef<number | null>(null);
  const [tool, setTool] = React.useState<"pen" | "eraser">("pen");
  const [color, setColor] = React.useState(WHITEBOARD_DEFAULT_COLOR);
  const [strokeWidth, setStrokeWidth] = React.useState(5);
  const [nameDraft, setNameDraft] = React.useState("");
  const repaint = React.useCallback(
    (draft: WhiteboardStroke | null = draftStrokeRef.current) => {
      if (!board) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const scale = Math.max(1, window.devicePixelRatio || 1);
      const width = Math.round(board.width * scale);
      const height = Math.round(board.height * scale);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      const context = canvas.getContext("2d");
      if (context) drawWhiteboard(context, board, { draftStroke: draft, scale });
    },
    [board],
  );

  React.useEffect(() => {
    draftStrokeRef.current = null;
    repaint(null);
  }, [board, repaint]);

  React.useEffect(() => {
    setNameDraft(board?.name ?? "");
  }, [board?.id, board?.name]);

  const toBoardPoint = React.useCallback(
    (event: React.PointerEvent<HTMLElement>): { x: number; y: number } | null => {
      if (!board) return null;
      const rect = event.currentTarget.getBoundingClientRect();
      return rect.width <= 0 || rect.height <= 0
        ? null
        : {
            x: Math.min(board.width, Math.max(0, ((event.clientX - rect.left) / rect.width) * board.width)),
            y: Math.min(board.height, Math.max(0, ((event.clientY - rect.top) / rect.height) * board.height)),
          };
    },
    [board],
  );

  const handlePointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (!board || event.button !== 0) return;
      const point = toBoardPoint(event);
      if (!point) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      activePointerRef.current = event.pointerId;
      draftStrokeRef.current = createWhiteboardStroke({
        color,
        points: [point],
        tool,
        width: tool === "eraser" ? Math.max(14, strokeWidth * 3) : strokeWidth,
      });
      repaint();
    },
    [board, color, toBoardPoint, repaint, strokeWidth, tool],
  );

  const handlePointerMove = React.useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (!board || activePointerRef.current !== event.pointerId || !draftStrokeRef.current) return;
      const point = toBoardPoint(event);
      if (!point) return;
      event.preventDefault();
      draftStrokeRef.current = { ...draftStrokeRef.current, points: [...draftStrokeRef.current.points, point] };
      repaint();
    },
    [board, toBoardPoint, repaint],
  );

  const handlePointerEnd = React.useCallback(
    (event: React.PointerEvent<HTMLCanvasElement>) => {
      if (activePointerRef.current !== event.pointerId) return;
      const stroke = draftStrokeRef.current;
      activePointerRef.current = null;
      draftStrokeRef.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
      if (!stroke || stroke.points.length === 0) {
        repaint(null);
        return;
      }
      addStroke({ boardId, stroke, workspaceIdentity, workspacePath });
    },
    [addStroke, boardId, repaint, workspaceIdentity, workspacePath],
  );

  if (!board)
    return (
      <div className="flex h-full items-center justify-center bg-panel px-4 text-ui-base text-foreground-subtle">
        {intl.formatMessage({ id: "whiteboard.missing" })}
      </div>
    );

  const hasStrokes = board.strokes.length > 0;
  const hasUndoneStrokes = board.undoneStrokes.length > 0;
  const addToChatLabel = intl.formatMessage({ id: "whiteboard.addToChat" });

  return (
    <div className="flex h-full min-h-0 flex-col bg-panel text-foreground">
      <div className="flex min-h-10 items-center gap-2 border-b border-border px-2">
        <Input
          value={nameDraft}
          onBlur={() => {
            if (!nameDraft.trim()) setNameDraft(board.name);
          }}
          onChange={(event) => {
            const value = event.target.value;
            setNameDraft(value);
            if (value.trim()) renameBoard({ boardId, name: value, workspaceIdentity, workspacePath });
          }}
          aria-label={intl.formatMessage({ id: "whiteboard.nameLabel" })}
          className="max-w-48"
        />
        <div className="ml-auto flex min-w-0 items-center gap-1">
          <Tooltip title={addToChatLabel}>
            <Button
              type="button"
              variant="ghost"
              size="icon-md"
              aria-label={addToChatLabel}
              onClick={() => addWhiteboardToChat({ boardId, workspaceIdentity, workspacePath })}
            >
              <IconImagePlus className="size-4" />
            </Button>
          </Tooltip>
          <Tooltip title={intl.formatMessage({ id: "whiteboard.tool.pen" })}>
            <Button
              type="button"
              variant={tool === "pen" ? "secondary" : "ghost"}
              size="icon-md"
              aria-pressed={tool === "pen"}
              aria-label={intl.formatMessage({ id: "whiteboard.tool.pen" })}
              onClick={() => setTool("pen")}
            >
              <IconPencil className="size-4" />
            </Button>
          </Tooltip>
          <Tooltip title={intl.formatMessage({ id: "whiteboard.tool.eraser" })}>
            <Button
              type="button"
              variant={tool === "eraser" ? "secondary" : "ghost"}
              size="icon-md"
              aria-pressed={tool === "eraser"}
              aria-label={intl.formatMessage({ id: "whiteboard.tool.eraser" })}
              onClick={() => setTool("eraser")}
            >
              <IconEraser className="size-4" />
            </Button>
          </Tooltip>
          <div className="hidden items-center gap-1 sm:flex">
            {WHITEBOARD_PALETTE.map((paletteColor) => (
              <Tooltip key={paletteColor} title={intl.formatMessage({ id: "whiteboard.color" })}>
                <button
                  type="button"
                  aria-label={intl.formatMessage({ id: "whiteboard.color" })}
                  aria-pressed={color === paletteColor}
                  onClick={() => setColor(paletteColor)}
                  className={cn(
                    "size-5 rounded-full border border-border transition-shadow",
                    color === paletteColor && "ring-2 ring-brand ring-offset-1 ring-offset-panel",
                  )}
                  style={{ backgroundColor: paletteColor }}
                />
              </Tooltip>
            ))}
          </div>
          <Tooltip title={intl.formatMessage({ id: "whiteboard.strokeWidth" })}>
            <input
              type="range"
              min="2"
              max="18"
              value={strokeWidth}
              aria-label={intl.formatMessage({ id: "whiteboard.strokeWidth" })}
              onChange={(event) => setStrokeWidth(Number(event.target.value))}
              className="hidden h-7 w-20 accent-primary md:block"
            />
          </Tooltip>
          <Tooltip title={intl.formatMessage({ id: "whiteboard.undo" })}>
            <Button
              type="button"
              variant="ghost"
              size="icon-md"
              disabled={!hasStrokes}
              aria-label={intl.formatMessage({ id: "whiteboard.undo" })}
              onClick={() => undoStroke({ boardId, workspaceIdentity, workspacePath })}
            >
              <IconUndo2 className="size-4" />
            </Button>
          </Tooltip>
          <Tooltip title={intl.formatMessage({ id: "whiteboard.redo" })}>
            <Button
              type="button"
              variant="ghost"
              size="icon-md"
              disabled={!hasUndoneStrokes}
              aria-label={intl.formatMessage({ id: "whiteboard.redo" })}
              onClick={() => redoStroke({ boardId, workspaceIdentity, workspacePath })}
            >
              <IconRedo2 className="size-4" />
            </Button>
          </Tooltip>
          <Tooltip title={intl.formatMessage({ id: "whiteboard.clear" })}>
            <Button
              type="button"
              variant="ghost"
              size="icon-md"
              disabled={!hasStrokes}
              aria-label={intl.formatMessage({ id: "whiteboard.clear" })}
              onClick={() => clearBoard({ boardId, workspaceIdentity, workspacePath })}
            >
              <IconTrash2 className="size-4" />
            </Button>
          </Tooltip>
        </div>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center bg-background-alt p-3">
        <div className="relative aspect-[16/10] max-h-full w-full overflow-hidden rounded-lg border border-border bg-white shadow-sm">
          <canvas
            ref={canvasRef}
            className="h-full w-full touch-none"
            aria-label={intl.formatMessage({ id: "whiteboard.canvasLabel" })}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
            onLostPointerCapture={handlePointerEnd}
          />
          <div className="pointer-events-none absolute left-2 top-2 flex size-6 items-center justify-center rounded-full border border-border bg-surface/90 text-foreground-subtle shadow-sm sm:hidden">
            <IconPalette className="size-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * 4. ModelTrajectoryView 族（原 tKt 等；js 180193–180869 / jsx 145798–146289）
 * ==========================================================================*/

/* ---- 4.0 useModelTrajectory（原 IGt/LGt/RGt，js 180193–180240 / jsx 145798–145806） ---- */

const TRAJECTORY_INITIAL_STATE = { loading: false, data: null, error: null } as {
  loading: boolean;
  data: ModelTrajectoryData | null;
  error: string | null;
};

function describeTrajectoryError(error: unknown): string {
  return (error instanceof Error && (error.message || error.name)) || String(error);
}

function useModelTrajectory(workspacePath: string, taskId: string | null, workspaceIdentity?: string | null) {
  const agentService = useWorkspaceAgentService(workspacePath, undefined, workspaceIdentity);
  const [state, setState] = React.useState(TRAJECTORY_INITIAL_STATE);
  const [reloadCount, setReloadCount] = React.useState(0);
  const generationRef = React.useRef(0);
  const refresh = React.useCallback(() => {
    setReloadCount((previous) => previous + 1);
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    if (!taskId) {
      generationRef.current += 1;
      setState(TRAJECTORY_INITIAL_STATE);
      return () => {
        cancelled = true;
      };
    }
    const generation = generationRef.current + 1;
    generationRef.current = generation;
    setState({ loading: true, data: null, error: null });
    agentService
      .getModelTrajectory({ taskId })
      .then((data) => {
        if (!cancelled && generationRef.current === generation) setState({ loading: false, data, error: null });
      })
      .catch((error) => {
        if (cancelled || generationRef.current !== generation) return;
        const message = describeTrajectoryError(error);
        logger.warn("[useModelTrajectory] 读取模型调用轨迹失败", {
          workspacePath,
          taskId,
          workspaceIdentity,
          error: message,
        });
        setState({ loading: false, data: null, error: message });
      });
    return () => {
      cancelled = true;
    };
  }, [agentService, taskId, workspaceIdentity, workspacePath, reloadCount]);

  return { ...state, refresh };
}

/* ---- 4.1 渲染助手（原 P5…GGt，js 180200–180351 / jsx 145853–145967） ---- */

function stringifyTrajectoryPayload(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

const TrajectoryPayloadPre: React.FC<{ value: string }> = ({ value }) => (
  <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-md bg-surface px-2.5 py-2 font-mono text-ui-xs leading-relaxed text-foreground">
    {value || "—"}
  </pre>
);

const TrajectoryCollapsible: React.FC<{
  label: string;
  tone: "muted" | "tool";
  defaultOpen?: boolean;
  meta?: React.ReactNode;
  children: React.ReactNode;
}> = ({ label, tone, defaultOpen, meta, children }) => (
  <CollapsibleRoot defaultOpen={defaultOpen}>
    <CollapsibleTrigger
      className={cn(
        "flex w-full min-w-0 items-center gap-1 rounded-md px-2 py-1 text-left text-ui-xs font-medium transition-colors",
        tone === "tool"
          ? "bg-surface text-foreground-subtle hover:bg-surface-hover"
          : "text-foreground-subtlest hover:text-foreground-subtle",
      )}
    >
      <span className="min-w-0 flex-1 truncate font-mono">{label}</span>
      {meta ? <span className="min-w-0 shrink">{meta}</span> : null}
    </CollapsibleTrigger>
    <CollapsibleContent className="pt-1">{children}</CollapsibleContent>
  </CollapsibleRoot>
);

const TrajectoryToolIdBadge: React.FC<{ id: string; intl: IntlShape }> = ({ id, intl }) => (
  <Badge variant="outline" className="max-w-full truncate font-mono text-foreground-subtle" title={id}>
    {intl.formatMessage({ id: "modelTrajectory.toolId" })}: {id}
  </Badge>
);

const TrajectoryToolBlock: React.FC<{
  label: string;
  id?: string;
  payloadLabel: string;
  value: unknown;
  defaultOpen?: boolean;
  intl: IntlShape;
}> = ({ label, id, payloadLabel, value, defaultOpen, intl }) => (
  <TrajectoryCollapsible
    label={label}
    tone="tool"
    defaultOpen={defaultOpen}
    meta={id ? <TrajectoryToolIdBadge id={id} intl={intl} /> : null}
  >
    <div className="flex flex-col gap-1.5 rounded-md border border-border bg-card px-2.5 py-2">
      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
        <span className="text-ui-xs font-medium text-foreground-subtle">{payloadLabel}</span>
      </div>
      <TrajectoryPayloadPre value={stringifyTrajectoryPayload(value)} />
    </div>
  </TrajectoryCollapsible>
);

const TrajectoryPartRenderer: React.FC<{ part: TrajectoryMessagePart; intl: IntlShape }> = ({ part, intl }) => {
  if (part.kind === "text")
    return part.text ? (
      <p className="whitespace-pre-wrap break-words text-ui-base leading-relaxed text-foreground">{part.text}</p>
    ) : null;
  if (part.kind === "reasoning")
    return part.text ? (
      <TrajectoryCollapsible label={intl.formatMessage({ id: "modelTrajectory.reasoning" })} tone="muted">
        <p className="whitespace-pre-wrap break-words font-mono text-ui-xs leading-relaxed text-foreground-subtle">{part.text}</p>
      </TrajectoryCollapsible>
    ) : null;
  if (part.kind === "tool-call")
    return (
      <TrajectoryToolBlock
        defaultOpen
        id={part.toolCallId}
        label={`${intl.formatMessage({ id: "modelTrajectory.toolCall" })} · ${part.toolName}`}
        payloadLabel={intl.formatMessage({ id: "modelTrajectory.toolInput" })}
        value={part.input}
        intl={intl}
      />
    );
  if (part.kind === "tool-result")
    return (
      <TrajectoryToolBlock
        id={part.toolCallId}
        label={
          part.toolName
            ? `${intl.formatMessage({ id: "modelTrajectory.toolResult" })} · ${part.toolName}`
            : intl.formatMessage({ id: "modelTrajectory.toolResult" })
        }
        payloadLabel={intl.formatMessage({ id: "modelTrajectory.toolOutput" })}
        value={part.output}
        intl={intl}
      />
    );
  if (part.kind === "image")
    return (
      <span className="text-ui-base italic text-foreground-subtle">
        [image{part.mediaType ? ` · ${part.mediaType}` : ""}]
      </span>
    );
  return <TrajectoryPayloadPre value={stringifyTrajectoryPayload(part.raw)} />;
};

const TrajectoryUsageBadge: React.FC<{ usage?: { inputTokens?: number; outputTokens?: number } | null }> = ({ usage }) => {
  if (!usage) return null;
  const parts: string[] = [];
  if (typeof usage.inputTokens === "number") parts.push(`in ${usage.inputTokens.toLocaleString()}`);
  if (typeof usage.outputTokens === "number") parts.push(`out ${usage.outputTokens.toLocaleString()}`);
  return parts.length === 0 ? null : (
    <Badge variant="outline" className="font-mono text-foreground-subtle">
      {parts.join("  ")}
    </Badge>
  );
};

const TrajectoryStatusText: React.FC<{ text: string; detail?: string; tone?: "error" | "muted" }> = ({ text, detail, tone }) => (
  <div className="flex flex-col items-center gap-1 px-4 py-10 text-center">
    <p className={cn("text-ui-base", tone === "error" ? "text-destructive" : "text-foreground-subtle")}>{text}</p>
    {detail ? <p className="max-w-full break-words font-mono text-ui-base text-foreground-subtlest">{detail}</p> : null}
  </div>
);

function summarizeTrajectory(records: TrajectoryRecord[]): { totalTokens: number; models: string[] } {
  let totalTokens = 0;
  const models = new Set<string>();
  for (const record of records) {
    const tokens = record.response?.usage?.totalTokens;
    if (typeof tokens === "number") totalTokens += tokens;
    const modelId = record.model.modelId ?? record.response?.modelId;
    if (modelId) models.add(modelId);
  }
  return { totalTokens, models: [...models] };
}

/* ---- 4.2 记录卡（原 KGt…QGt/$Gt/eKt，js 180352–180605 / jsx 145968–146114） ---- */

const ROLE_STYLES: Record<string, { badge: string; block: string; label: string }> = {
  system: {
    badge: "bg-tag text-foreground-subtle",
    block: "border-border bg-surface",
    label: "system",
  },
  user: { badge: "bg-accent text-foreground", block: "border-border bg-accent", label: "user" },
  assistant: {
    badge: "bg-card-selected text-foreground",
    block: "border-card-border bg-card-selected",
    label: "assistant",
  },
  tool: {
    badge: "bg-surface-hover text-foreground-subtle",
    block: "border-border bg-surface-hover",
    label: "tool",
  },
};

function resolveTrajectorySourceLabelId(source: NonNullable<TrajectoryRecord["callSource"]>): string {
  switch (source.querySource) {
    case "main_turn":
      return "modelTrajectory.source.main";
    case "session_title":
      return "modelTrajectory.source.sessionTitle";
    case "compact":
      return "modelTrajectory.source.compact";
    case "prompt_enhance":
      return "modelTrajectory.source.promptEnhance";
    case "target_completion_verification":
      return "modelTrajectory.source.targetCompletion";
    case "subagent":
      return "modelTrajectory.source.subagent";
    default:
      break;
  }
  switch (source.kind) {
    case "main":
      return "modelTrajectory.source.main";
    case "subagent":
      return "modelTrajectory.source.subagent";
    case "compact":
      return "modelTrajectory.source.compact";
    case "sidecar":
      return "modelTrajectory.source.sidecar";
    case "unknown":
      return "modelTrajectory.source.unknown";
  }
  return "modelTrajectory.source.main";
}

const TrajectorySourceBadge: React.FC<{ record: TrajectoryRecord; intl: IntlShape }> = ({ record, intl }) => {
  const source = record.callSource ?? { kind: "main" };
  const isMain = source.kind === "main";
  const labelId = resolveTrajectorySourceLabelId(source);
  return (
    <Badge
      variant={isMain ? "outline" : "secondary"}
      className={cn("max-w-full truncate font-mono text-foreground-subtle", !isMain && "border-border bg-accent text-foreground")}
      title={source.querySource ? `querySource: ${source.querySource}` : undefined}
    >
      {intl.formatMessage({ id: labelId })}
    </Badge>
  );
};

const TrajectorySection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="flex flex-col gap-2">
    <div className="flex items-center gap-2">
      <span className="text-ui-xs font-medium uppercase tracking-wide text-foreground-subtle">{title}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
    <div className="flex flex-col gap-2">{children}</div>
  </section>
);

const TrajectoryMessageBlock: React.FC<{ message: TrajectoryMessage; intl: IntlShape }> = ({ message, intl }) => {
  const known = ROLE_STYLES[message.role];
  const styles = known ?? {
    badge: "bg-surface-hover text-foreground-subtle",
    block: "border-card-border bg-card",
    label: message.role,
  };
  const label = known ? intl.formatMessage({ id: `modelTrajectory.role.${message.role}` }) : styles.label;
  return (
    <div className={cn("rounded-lg border px-2.5 py-2", styles.block)}>
      <div className="mb-1.5 flex min-w-0 items-center gap-2">
        <span className={cn("inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-ui-xs font-medium uppercase tracking-wide", styles.badge)}>
          {label}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {message.parts.length === 0 ? (
          <span className="text-ui-base text-foreground-subtlest">—</span>
        ) : (
          message.parts.map((part, index) => <TrajectoryPartRenderer key={index} part={part} intl={intl} />)
        )}
      </div>
    </div>
  );
};

const TrajectoryOutputBlock: React.FC<{ response: NonNullable<TrajectoryRecord["response"]>; intl: IntlShape }> = ({ response, intl }) =>
  response.text || response.reasoningText || response.toolCalls.length > 0 ? (
    <TrajectorySection title={intl.formatMessage({ id: "modelTrajectory.outputSection" })}>
      <div className="rounded-lg border border-card-border bg-card-selected px-2.5 py-2">
        <div className="mb-1.5 flex min-w-0 items-center gap-2">
          <span className="inline-flex shrink-0 items-center rounded-md bg-card px-2 py-0.5 text-ui-xs font-medium uppercase tracking-wide text-foreground">
            {intl.formatMessage({ id: "modelTrajectory.role.assistant" })}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {response.reasoningText ? (
            <TrajectoryPartRenderer part={{ kind: "reasoning", text: response.reasoningText }} intl={intl} />
          ) : null}
          {response.text ? (
            <p className="whitespace-pre-wrap break-words text-ui-base leading-relaxed text-foreground">{response.text}</p>
          ) : null}
          {response.toolCalls.map((part, index) => (
            <TrajectoryPartRenderer key={index} part={part} intl={intl} />
          ))}
        </div>
      </div>
    </TrajectorySection>
  ) : null;

function formatTrajectoryTime(iso: string): string {
  const parsed = Date.parse(iso);
  return Number.isNaN(parsed)
    ? iso
    : new Date(parsed).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
}

function formatTrajectoryDuration(durationMs: number): string {
  return durationMs < 1_000 ? `${durationMs}ms` : `${(durationMs / 1_000).toFixed(durationMs < 10_000 ? 2 : 1)}s`;
}

const TrajectoryRecordCard: React.FC<{ record: TrajectoryRecord; index: number; inputMessages: TrajectoryMessage[]; intl: IntlShape }> = ({
  record,
  index,
  inputMessages,
  intl,
}) => {
  const response = record.response;
  const usage = response?.usage;
  const modelLabel = record.model.modelId ?? record.response?.modelId ?? record.model.providerId ?? "model";
  const hasInput = inputMessages.length > 0;
  return (
    <article className="overflow-hidden rounded-lg border border-card-border bg-card">
      <header className="flex flex-col gap-2 border-b border-border bg-surface px-3 py-2">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-card-selected px-1.5 font-mono text-ui-base font-medium text-foreground">
            #{index + 1}
          </span>
          <Badge variant="secondary" className="max-w-full truncate font-mono">
            {modelLabel}
          </Badge>
          <TrajectorySourceBadge record={record} intl={intl} />
          <span className="font-mono text-ui-base text-foreground-subtle" title={record.startedAt}>
            {formatTrajectoryTime(record.startedAt)}
          </span>
          {typeof record.durationMs === "number" ? (
            <span className="text-ui-base text-foreground-subtle">{formatTrajectoryDuration(record.durationMs)}</span>
          ) : null}
          {record.attempt > 1 ? (
            <Badge variant="outline">{intl.formatMessage({ id: "modelTrajectory.attempt" }, { attempt: String(record.attempt) })}</Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {response?.finishReason ? (
            <Badge variant="ghost" className="font-mono text-foreground-subtle">
              {response.finishReason}
            </Badge>
          ) : null}
          <TrajectoryUsageBadge usage={usage} />
        </div>
      </header>
      <div className="flex flex-col gap-3 px-3 py-3">
        {hasInput ? (
          <TrajectorySection title={intl.formatMessage({ id: "modelTrajectory.inputSection" })}>
            {inputMessages.map((message, messageIndex) => (
              <TrajectoryMessageBlock key={`${index}:${messageIndex}`} message={message} intl={intl} />
            ))}
          </TrajectorySection>
        ) : null}
        {response ? <TrajectoryOutputBlock response={response} intl={intl} /> : null}
        {record.error ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-2.5 py-2">
            <p className="text-ui-base font-medium text-destructive">
              {record.error.name}: {record.error.message}
            </p>
            {record.error.stack ? (
              <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap break-words font-mono text-ui-xs text-destructive/80">
                {record.error.stack}
              </pre>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
};

/* ---- 4.3 记录列表与输入去重（原 nKt/rKt/iKt/aKt/oKt，js 180752–180800） ---- */

function resolveTrajectorySourceDirectory(sourceFiles?: string[]): string | null {
  const first = sourceFiles?.find((file) => file.trim().length > 0);
  return first ? pathDirname(first) : null;
}

function isConversationTrajectoryRecord(record: TrajectoryRecord): boolean {
  const kind = record.callSource?.kind;
  return kind === undefined || kind === "main" || kind === "subagent";
}

function sliceConversationMessages(messages: TrajectoryMessage[], previousCount: number, index: number): TrajectoryMessage[] {
  if (index === 0) return messages;
  if (messages.length > previousCount) return messages.slice(previousCount);
  return messages.length < previousCount ? messages : [];
}

function resolveTrajectoryInputMessages(params: {
  record: TrajectoryRecord;
  index: number;
  previousConversationMessageCount: number;
}): { inputMessages: TrajectoryMessage[]; nextConversationMessageCount: number } {
  const messages = params.record.request.messages;
  const isConversation = isConversationTrajectoryRecord(params.record);
  const sliced = isConversation ? sliceConversationMessages(messages, params.previousConversationMessageCount, params.index) : messages;
  return {
    inputMessages: isConversation ? (params.index === 0 ? sliced : sliced.filter((message) => message.role !== "assistant")) : sliced,
    nextConversationMessageCount: isConversation ? messages.length : params.previousConversationMessageCount,
  };
}

const TrajectoryRecordList: React.FC<{ records: TrajectoryRecord[]; intl: IntlShape }> = ({ records, intl }) => {
  let previousCount = 0;
  return (
    <ol className="flex flex-col gap-3">
      {records.map((record, index) => {
        const resolved = resolveTrajectoryInputMessages({ index, previousConversationMessageCount: previousCount, record });
        previousCount = resolved.nextConversationMessageCount;
        return (
          <li key={`${record.requestId}:${index}`}>
            <TrajectoryRecordCard record={record} index={index} inputMessages={resolved.inputMessages} intl={intl} />
          </li>
        );
      })}
    </ol>
  );
};

/* ---- 4.4 ModelTrajectoryView（原 tKt，js 180606–180751 / jsx 146115–146204） ---- */

export const ModelTrajectoryView: React.FC<{
  taskId: string;
  title: string | null;
  workspacePath: string;
  workspaceIdentity?: string | null;
  onClose: () => void;
}> = ({ taskId, title, workspacePath, workspaceIdentity, onClose }) => {
  const { intl } = useIntlContext();
  const platformService = usePlatformService();
  const { loading, data, error, refresh } = useModelTrajectory(workspacePath, taskId, workspaceIdentity);
  const records = data?.records ?? [];
  const sourceFiles = data?.sourceFiles;
  const sourceDirectory = React.useMemo(() => resolveTrajectorySourceDirectory(sourceFiles), [sourceFiles]);
  const summary = React.useMemo(() => summarizeTrajectory(records), [records]);
  const openSourceDirectory = React.useCallback(async () => {
    if (!sourceDirectory) return;
    try {
      const result = await platformService.openInFileManager(sourceDirectory);
      if (result.success) return;
      logger.warn("[ModelTrajectoryPane] 打开调用轨迹目录失败", {
        taskId,
        path: sourceDirectory,
        sourceFiles: sourceFiles ?? [],
        error: result.error ?? "unknown-error",
      });
      toast(intl.formatMessage({ id: "appHeader.openInFileManagerFailed" }));
    } catch (openError) {
      logger.warn("[ModelTrajectoryPane] 打开调用轨迹目录失败", {
        taskId,
        path: sourceDirectory,
        sourceFiles: sourceFiles ?? [],
        error: openError instanceof Error ? openError.message : String(openError),
      });
      toast(intl.formatMessage({ id: "appHeader.openInFileManagerFailed" }));
    }
  }, [intl, platformService, sourceDirectory, sourceFiles, taskId]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <header className="flex shrink-0 flex-col gap-2 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-ui-base font-medium text-foreground">
              {title?.trim() || intl.formatMessage({ id: "modelTrajectory.title" })}
            </span>
            <span className="truncate font-mono text-ui-base text-foreground-subtle" title={taskId}>
              {taskId}
            </span>
          </div>
          {sourceDirectory ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => void openSourceDirectory()}
              aria-label={intl.formatMessage({ id: "modelTrajectory.openSourceDirectory" })}
              title={`${intl.formatMessage({ id: "modelTrajectory.openSourceDirectory" })}: ${sourceDirectory}`}
            >
              <IconFolderOpen className="size-4" />
            </Button>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={refresh}
            aria-label={intl.formatMessage({ id: "modelTrajectory.refresh" })}
            title={intl.formatMessage({ id: "modelTrajectory.refresh" })}
          >
            <IconRefreshCw className={cn("size-4", loading && "animate-spin")} />
          </Button>
          {onClose ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              aria-label={intl.formatMessage({ id: "modelTrajectory.close" })}
              title={intl.formatMessage({ id: "modelTrajectory.close" })}
            >
              <IconX className="size-4" />
            </Button>
          ) : null}
        </div>
        {records.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="outline">{intl.formatMessage({ id: "modelTrajectory.summaryCalls" }, { count: String(records.length) })}</Badge>
            {summary.totalTokens > 0 ? (
              <Badge variant="outline" title={intl.formatMessage({ id: "modelTrajectory.summaryTokens" })}>
                Σ {summary.totalTokens.toLocaleString()} tok
              </Badge>
            ) : null}
            {summary.models.map((model) => (
              <Badge key={model} variant="secondary" className="font-mono">
                {model}
              </Badge>
            ))}
          </div>
        ) : null}
      </header>
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-3 px-4 py-3">
          {error ? (
            <TrajectoryStatusText tone="error" text={intl.formatMessage({ id: "modelTrajectory.error" })} detail={error} />
          ) : loading && records.length === 0 ? (
            <TrajectoryStatusText text={intl.formatMessage({ id: "modelTrajectory.loading" })} />
          ) : records.length === 0 ? (
            <TrajectoryStatusText text={intl.formatMessage({ id: "modelTrajectory.empty" })} />
          ) : (
            <TrajectoryRecordList records={records} intl={intl} />
          )}
          {data?.truncated ? (
            <p className="text-center text-ui-base text-foreground-subtle">
              {intl.formatMessage({ id: "modelTrajectory.truncatedNotice" })}
            </p>
          ) : null}
        </div>
      </ScrollArea>
    </div>
  );
};

/* ============================================================================
 * 5. DeveloperToolsView（原 mKt 等；js 180802–181215 / jsx 146243–146387）
 * ==========================================================================*/

/* ---- 5.0 常量与格式化（原 sKt…dKt，js 180802–180835） ---- */

const EMPTY_TOKEN_ROUNDS: TokenRound[] = []; // 原 sKt
const EMPTY_NETWORK_EVENTS: NetworkEvent[] = []; // 原 cKt

interface TokenRound {
  eventKey: string;
  requestIndex?: number;
  hitRate?: number;
  usage: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
    reasoningTokens?: number;
    cachedInputTokens?: number;
    cachedWriteInputTokens?: number;
  };
}

interface NetworkEvent {
  eventKey: string;
  statusType: "model_request_started" | "model_request_completed" | "model_request_failed" | "model_retry_scheduled" | "model_stream_stalled" | string;
  requestId?: string | null;
  timestamp?: string | null;
  recordedAt: number;
  modelId?: string | null;
  providerId?: string | null;
  providerKind?: string | null;
  attempt?: number;
  maxAttempts?: number;
  statusCode?: number;
  durationMs?: number;
  idleMs?: number;
  delayMs?: number;
  baseURL?: string | null;
  message?: string | null;
  requestHeaderCount?: number;
  responseHeaderCount?: number;
  requestHeaders: Record<string, string>;
  responseHeaders: Record<string, string>;
}

function formatDeveloperNumber(locale: string, value?: number): string {
  return value === undefined || !Number.isFinite(value) ? "-" : new Intl.NumberFormat(locale).format(value);
}

function formatDeveloperPercent(locale: string, value?: number | null): string {
  return value == null || !Number.isFinite(value)
    ? "-"
    : new Intl.NumberFormat(locale, { maximumFractionDigits: 1, style: "percent" }).format(Math.max(0, value));
}

function formatDeveloperMilliseconds(locale: string, value?: number): string {
  return value === undefined || !Number.isFinite(value) ? "-" : `${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value)} ms`;
}

function formatDeveloperTime(locale: string, timestamp?: string | null, fallback?: number): string {
  const parsed = timestamp ? Date.parse(timestamp) : NaN;
  const value = Number.isFinite(parsed) ? parsed : fallback;
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value as number));
}

function resolveNetworkStatusLabelId(statusType: string): string {
  switch (statusType) {
    case "model_request_started":
      return "developerTools.network.status.started";
    case "model_request_completed":
      return "developerTools.network.status.completed";
    case "model_request_failed":
      return "developerTools.network.status.failed";
    case "model_retry_scheduled":
      return "developerTools.network.status.retry";
    case "model_stream_stalled":
      return "developerTools.network.status.stalled";
  }
  return "developerTools.network.status.started";
}

const NetworkHeadersDetails: React.FC<{ title: string; headers: Record<string, string>; emptyLabel: string }> = ({ title, headers, emptyLabel }) => {
  const entries = Object.entries(headers).sort(([a], [b]) => a.localeCompare(b));
  return (
    <details className="border-t border-border px-3 py-2">
      <summary className="cursor-default select-none text-ui-xs font-medium text-foreground-subtle">{title}</summary>
      {entries.length === 0 ? (
        <div className="pt-2 text-ui-xs text-foreground-subtle">{emptyLabel}</div>
      ) : (
        <dl className="grid grid-cols-[minmax(7rem,0.35fr)_minmax(0,1fr)] gap-x-3 gap-y-1 pt-2 text-ui-xs">
          {entries.map(([name, value]) => (
            <div key={name} className="contents">
              <dt className="min-w-0 break-all font-mono text-foreground-subtle">{name}</dt>
              <dd className="min-w-0 break-all font-mono text-foreground">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </details>
  );
};

/* ---- 5.1 DeveloperToolsView（原 mKt，js 180870–181215 / jsx 146290–146387） ---- */

export const DeveloperToolsView: React.FC<{ workspacePath: string; workspaceIdentity?: string | null; taskId: string | null }> = ({
  workspacePath,
  workspaceIdentity,
  taskId,
}) => {
  const { intl, locale } = useIntlContext();
  const snapshot = useTaskStore(
    createShallowSelectorFactory((state) =>
      taskId
        ? {
            cache: selectSessionByTask(state.getWorkspaceState(workspacePath, workspaceIdentity), taskId)?.usage?.cache,
            rounds: EMPTY_TOKEN_ROUNDS,
            networkEntries: EMPTY_NETWORK_EVENTS,
          }
        : { cache: undefined, networkEntries: EMPTY_NETWORK_EVENTS, rounds: EMPTY_TOKEN_ROUNDS },
    ),
  );
  const networkEvents = [...snapshot.networkEntries].reverse();
  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-3">
        <IconBug className="size-4 text-foreground-subtle" aria-hidden="true" />
        <h2 className="text-ui-base font-semibold text-foreground">{intl.formatMessage({ id: "developerTools.title" })}</h2>
      </div>
      <div className="min-h-0 flex-1 space-y-5 overflow-auto px-4 py-4">
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <IconActivity className="size-4 text-foreground-subtle" aria-hidden="true" />
            <h3 className="text-ui-base font-semibold text-foreground">{intl.formatMessage({ id: "developerTools.tokenSection" })}</h3>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-ui-base text-foreground-subtle">
            <span>{intl.formatMessage({ id: "tokenDebug.summary.requests" })}</span>
            <span className="font-mono text-foreground">{formatDeveloperNumber(locale, snapshot.cache?.hitRateRequestCount)}</span>
            <span>{intl.formatMessage({ id: "tokenDebug.summary.average" })}</span>
            <span className="font-mono text-foreground">{formatDeveloperPercent(locale, snapshot.cache?.hitRate)}</span>
            <span>{intl.formatMessage({ id: "tokenDebug.summary.input" })}</span>
            <span className="font-mono text-foreground">{formatDeveloperNumber(locale, snapshot.cache?.totalInputTokens)}</span>
            <span>{intl.formatMessage({ id: "tokenDebug.summary.cacheRead" })}</span>
            <span className="font-mono text-foreground">{formatDeveloperNumber(locale, snapshot.cache?.totalCacheReadTokens)}</span>
          </div>
          <div className="overflow-auto rounded-md border border-border">
            <table className="w-full min-w-[38rem] border-collapse text-ui-xs">
              <thead className="sticky top-0 bg-background text-foreground-subtle">
                <tr className="border-b border-border">
                  <th className="px-2 py-1.5 text-left font-medium">{intl.formatMessage({ id: "tokenDebug.column.round" })}</th>
                  <th className="px-2 py-1.5 text-right font-medium">{intl.formatMessage({ id: "tokenDebug.column.input" })}</th>
                  <th className="px-2 py-1.5 text-right font-medium">{intl.formatMessage({ id: "tokenDebug.column.output" })}</th>
                  <th className="px-2 py-1.5 text-right font-medium">{intl.formatMessage({ id: "tokenDebug.column.total" })}</th>
                  <th className="px-2 py-1.5 text-right font-medium">{intl.formatMessage({ id: "tokenDebug.column.reasoning" })}</th>
                  <th className="px-2 py-1.5 text-right font-medium">{intl.formatMessage({ id: "tokenDebug.column.cacheRead" })}</th>
                  <th className="px-2 py-1.5 text-right font-medium">{intl.formatMessage({ id: "tokenDebug.column.cacheWrite" })}</th>
                  <th className="px-2 py-1.5 text-right font-medium">{intl.formatMessage({ id: "tokenDebug.column.hitRate" })}</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.rounds.length === 0 ? (
                  <tr>
                    <td className="px-2 py-3 text-center text-foreground-subtle" colSpan={8}>
                      {intl.formatMessage({ id: "tokenDebug.empty" })}
                    </td>
                  </tr>
                ) : (
                  snapshot.rounds.map((round) => (
                    <tr key={round.eventKey} className="border-b border-border last:border-b-0">
                      <td className="px-2 py-1.5 font-mono text-foreground">{formatDeveloperNumber(locale, round.requestIndex)}</td>
                      <td className="px-2 py-1.5 text-right font-mono">{formatDeveloperNumber(locale, round.usage.inputTokens)}</td>
                      <td className="px-2 py-1.5 text-right font-mono">{formatDeveloperNumber(locale, round.usage.outputTokens)}</td>
                      <td className="px-2 py-1.5 text-right font-mono">{formatDeveloperNumber(locale, round.usage.totalTokens)}</td>
                      <td className="px-2 py-1.5 text-right font-mono">{formatDeveloperNumber(locale, round.usage.reasoningTokens)}</td>
                      <td className="px-2 py-1.5 text-right font-mono">{formatDeveloperNumber(locale, round.usage.cachedInputTokens)}</td>
                      <td className="px-2 py-1.5 text-right font-mono">{formatDeveloperNumber(locale, round.usage.cachedWriteInputTokens)}</td>
                      <td className="px-2 py-1.5 text-right font-mono">{formatDeveloperPercent(locale, round.hitRate)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <IconNetwork className="size-4 text-foreground-subtle" aria-hidden="true" />
            <h3 className="text-ui-base font-semibold text-foreground">{intl.formatMessage({ id: "developerTools.networkSection" })}</h3>
          </div>
          {networkEvents.length === 0 ? (
            <div className="rounded-md border border-border px-3 py-4 text-center text-ui-base text-foreground-subtle">
              {intl.formatMessage({ id: "developerTools.network.empty" })}
            </div>
          ) : (
            <div className="space-y-2">
              {networkEvents.map((event) => (
                <div key={event.eventKey} className="overflow-hidden rounded-md border border-border">
                  <div className="space-y-2 px-3 py-2">
                    <div className="flex min-w-0 items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-ui-base font-semibold text-foreground">
                          {intl.formatMessage({ id: resolveNetworkStatusLabelId(event.statusType) })}
                        </div>
                        <div className="truncate font-mono text-ui-xs text-foreground-subtle">{event.requestId ?? event.eventKey}</div>
                      </div>
                      <div className="shrink-0 font-mono text-ui-xs text-foreground-subtle">
                        {formatDeveloperTime(locale, event.timestamp, event.recordedAt)}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-ui-xs text-foreground-subtle">
                      <span>{intl.formatMessage({ id: "developerTools.network.model" })}</span>
                      <span className="min-w-0 truncate font-mono text-foreground">{event.modelId ?? "-"}</span>
                      <span>{intl.formatMessage({ id: "developerTools.network.provider" })}</span>
                      <span className="min-w-0 truncate font-mono text-foreground">{event.providerId ?? event.providerKind ?? "-"}</span>
                      <span>{intl.formatMessage({ id: "developerTools.network.attempt" })}</span>
                      <span className="font-mono text-foreground">{event.attempt && event.maxAttempts ? `${event.attempt}/${event.maxAttempts}` : "-"}</span>
                      <span>{intl.formatMessage({ id: "developerTools.network.http" })}</span>
                      <span className="font-mono text-foreground">{formatDeveloperNumber(locale, event.statusCode)}</span>
                      <span>{intl.formatMessage({ id: "developerTools.network.duration" })}</span>
                      <span className="font-mono text-foreground">{formatDeveloperMilliseconds(locale, event.durationMs ?? event.idleMs)}</span>
                      <span>{intl.formatMessage({ id: "developerTools.network.retryDelay" })}</span>
                      <span className="font-mono text-foreground">{formatDeveloperMilliseconds(locale, event.delayMs)}</span>
                    </div>
                    {event.baseURL ? <div className="min-w-0 truncate font-mono text-ui-xs text-foreground-subtle">{event.baseURL}</div> : null}
                    {event.message ? <div className="break-words rounded-md bg-surface px-2 py-1.5 text-ui-xs text-foreground">{event.message}</div> : null}
                  </div>
                  <NetworkHeadersDetails
                    title={intl.formatMessage({ id: "developerTools.network.requestHeaders" }, { count: formatDeveloperNumber(locale, event.requestHeaderCount) })}
                    headers={event.requestHeaders}
                    emptyLabel={intl.formatMessage({ id: "developerTools.network.noHeaders" })}
                  />
                  <NetworkHeadersDetails
                    title={intl.formatMessage({ id: "developerTools.network.responseHeaders" }, { count: formatDeveloperNumber(locale, event.responseHeaderCount) })}
                    headers={event.responseHeaders}
                    emptyLabel={intl.formatMessage({ id: "developerTools.network.noHeaders" })}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

/* ============================================================================
 * 〔A0-S4-4a：components 拆分（settings/modal 域）——原 §6 组件单元已原样迁入
 *   components/automations/AutomationsMainView.tsx；本文件现为薄 re-export shim〕
 * §1–§5（RepoWiki/Treemapping/Whiteboard/ModelTrajectory/DeveloperTools 族）与 §0
 * 声明群（含图标常量）留守本文件；§6 所需 declare 随族复制（ambient，编译期擦除），
 * 图标常量经 AutomationsMainView 自本文件 import 取回（渲染期访问，无初始化期环读）。
 * ==========================================================================*/

export {
  AutomationPlusIcon,
  AutomationExternalLinkIcon,
  AutomationStopIcon,
  OFFPEAK_BADGE_ICONS,
  OffPeakCreateButton,
  SCHEDULED_TEMPLATES,
  AutomationsMain,
} from '../components/automations/AutomationsMainView';
