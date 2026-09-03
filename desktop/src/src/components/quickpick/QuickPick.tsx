// A0-S4-4c: 自 modules/QuickPick.tsx 原样整体迁入（组件全族 + 私有辅助 + 局部型别 + 尾部符号表；原文件现为薄 re-export shim）。
// 仅导入路径按 components/quickpick/ 深度改指（./ → ../../modules/；../components/ → ../；其余 ../ → ../../）；迁出体逐字未动。
/* eslint-disable */
/**
 * ============================================================================
 * QuickPick.tsx — ZCode 3.7.6 QuickPick / 命令中心 组件族（解混淆重建 · D8 Stage B · F05）
 * ============================================================================
 *
 * 来源文件（融合 chunk，213,695 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js
 * 对照文件（同一 chunk 的 pretty-print 版，规格文档行号以它为准）：
 *   /home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号格式：融合chunk js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 *  组件族主体：
 *   Rje  → QuickPick                 命令中心根组件（memo）(36439–36948)
 *   nPt  → QuickFindBar              任务内查找条（window/chat 双形态）(139949–140188)
 *   O_e  → buildQuickPickCommands    命令注册表（18 条，6 段）(25394–25585)
 *   D_e  → QUICK_PICK_SECTION_ORDER  段序 suggested/chat/navigation/panels/configure/app (25442)
 *   mje  → QUICK_PICK_COMMAND_ICONS  命令图标名 → lucide 组件映射 (36151–36169)
 *   Lje  → SearchHistoryFooter       搜索历史胶囊页脚 (36371–36438)
 *   pC   → ScopeTab                  范围切换胶囊（全部/操作/任务/文件）(36335–36348)
 *   eC   → HighlightedText           查询词高亮（mark）(36125–36150)
 *   Ije  → MetaText                  行尾小字（相对时间）(36361–36370)
 *   rge  → useGlobalQuickPickShortcuts 全局快捷键（⌘K/⌘⇧P/⌘F/⌘B/⌘J/⌘⌥B/⌘[ ]/⌘⇧[ ]）(24015–24078)
 *
 *  cmdk 封装（Radix 风格 Command 原语，shadcn 类封装；底层 cmdk 库在本 chunk
 *  js 26004–26574 / jsx 22591–23140，`m_` 命名空间）：
 *   Yb   → Command                   根（data-slot=command）(32092)
 *   tOe  → CommandDialog             对话框壳（zb Dialog + sr-only 标题）(32151)
 *   Zb   → CommandList               列表（data-slot=command-list）(32148)
 *   Qb   → CommandEmpty              空态（data-slot=command-empty）(32158)
 *   $b   → CommandGroup              分组（data-slot=command-group）(32166)
 *   ex   → CommandItem               条目（data-slot=command-item + 选中 ✓）(32175)
 *   tx   → CommandShortcut           快捷键角标（data-slot=command-shortcut）(32191)
 *
 *  数据层：
 *   Vo   → useSearchResultsStore     搜索结果缓存 store（zustand）(1553–1878)
 *   Zie  → selectQueryResult         按 queryKey 选择缓存结果 (1878)
 *   ZS   → useGlobalTaskList         跨工作区任务列表/搜索 hook (35727–36070)
 *   uje  → mergeTaskListShards       分片结果合并 (35708–35726)
 *   $S   → formatRelativeTime        相对时间（刚刚/分/时/天）(36080–36089)
 *   fC   → resolveTaskTitle          空标题 → 「未命名」(36326)
 *   Mje  → compareRecentChanges      最近变更排序（轮次↓/写次数↓/路径）(36281–36285)
 *
 *  查询解析 / 过滤 / 历史：
 *   Nje  → parseScopedQuery          前缀语法 `>`命令 `#`任务 `@`文件 (36286–36298)
 *   mC   → scopePrefix               段 → 前缀字符 (36349–36360)
 *   Pje  → commandMatchesQuery       命令模糊过滤（标题+关键词，分词全命中）(36299–36308)
 *   kje  → fileSearchHaystack        (36244–36246)
 *   Aje  → filterWorkspaceFiles      文件过滤（type=file，分词全命中，≤80）(36247–36260)
 *   Oje  → fileDirectoryLabel        相对路径的目录部分 (36240–36243)
 *   jje  → normalizeSearchSnippet    片段归一（去首尾 …、压空白）(36261–36268)
 *   dC   → dedupeSearchSnippets      (36269–36276)
 *   Fje  → buildTaskSearchRows       任务×片段 行展开 (36309–36334)
 *   oC   → loadSearchHistory         (36198–36210)
 *   sC   → saveSearchHistory         (36211–36218)
 *   xje  → recordSearchHistory       记录一次搜索（去重置顶，≤20）(36219–36227)
 *   Sje  → clearSearchHistory        (36228–36230)
 *   bje  → isSearchHistoryEntry      (36189–36197)
 *   aC   → searchHistoryStorageKey   (36186–36188)
 *   iC   → safeLocalStorage          (36176–36184)
 *   rC   → SEARCH_HISTORY_LIMIT = 20 (9329)
 *   yje  → SEARCH_HISTORY_STORAGE_PREFIX = `zcode-command-center-search-history:` (36175)
 *   cC   → COLLAPSED_SECTION_LIMIT = 3（all 视图每段折叠上限）(9362)
 *   lC   → RECENT_SECTION_LIMIT = 3（最近变更/最近任务条数）(36232)
 *   Tje  → FILE_SEARCH_LIMIT = 80    (36233)
 *   uC   → TASK_LIST_LIMIT = 80      (36234)
 *
 *  高亮：
 *   dje  → tokenizeQuery             小写去重分词 (36090–36098)
 *   fje  → mergeHighlightRanges      区间合并 (36099–36111)
 *   pje  → findHighlightRanges      全部出现位置 (36112–36124)
 *
 *  查找条导航：
 *   QNt  → mapFindNavigationKey      ↑=previous ↓=next Enter=按 Shift 反向 (139925–139935)
 *   $Nt  → normalizeFindMatchState   (139936–139940)
 *   ePt  → stepFindIndex             环形步进 (139941–139945)
 *   tPt  → nextFindNavigation        (139946–139948)
 *
 *  模糊评分（vendored `fuzzy` 库，供 cmdk 默认过滤器 `kve` 使用，
 *  本族命令过滤实际用 Pje 分词包含；保留以保真）：
 *   k_e/A_e/j_e/M_e/Gg/Kg/N_e/P_e    评分常量 (25586–25595)
 *   F_e/I_e/L_e/R_e                  边界字符正则 (25596–25599)
 *   qg   → fuzzyScoreRecursive       (25600–25622)
 *   z_e  → fuzzyNormalize            (25623–25625)
 *   B_e  → fuzzyScore                (25626–25631)
 *
 *  图标（Sa=createLucideIcon 工厂，js 行）：
 *   Fv search 27780 | dv list 27355 | Pv rocket 27735 | yv messages-square 27468
 *   Aye file 27121 | Kv trash-2 27930 | N_ chevron-down（TopBar 族已登记）
 *   vv message-square | hv message-circle-plus | Tv panel-left-close | Ev panel-left-open
 *   Uv square-terminal | oye book-open | Jv users | X_ file-diff 27084 | Q_ folder-open 27151
 *   pv log-in 27373 | Kye log-out 27378 | Iv server 27794 | Rv settings 27806
 *   Yv wand-sparkles 28014 | xv moon 27516 | Sbe sun 27874 | nv globe 27218
 *   gv message-circle 27438 | T_ arrow-up 26711 | Qve arrow-down 26673 | M_ check
 *   g = x（关闭，imeComposition chunk 的 b 导出 = 内部 qt，lucide `x`）
 *
 * ----------------------------------------------------------------------------
 * 二、外部依赖清单（跨 chunk 导入；标注来源 chunk 与导出字母）
 * ----------------------------------------------------------------------------
 *  1. react / jsx-runtime            react-BQLj9xdT.js、jsx-runtime-B5yMD3-t.js
 *  2. cn() 类名合并 (Z)               utils-CEEH0K_K.js
 *  3. Button (X) / createLucideIcon (Sa)
 *                                    button-laUijeDG.js
 *  4. useIntlContext (G) 返回 {intl, locale}
 *                                    IntlProvider-C321H7m8.js（词典：quickPick.* 11 key 前缀、
 *                                    commandCenter.* 19、taskSearch.* 等均在此 chunk）
 *  5. toast (m)                      imeComposition-DEYFkwWm.js（_ 导出）
 *  6. x 关闭图标 (g)                  imeComposition-DEYFkwWm.js（b 导出 = 内部 qt）
 *  7. Tooltip (Ia)                   usageStatsUiParts-CiR7YEhh.js
 *  8. shortcutLabel ($i) / isModKey (ta=u) / isModShiftKey (Qi=d) / isModAltKey (Rre=f)
 *                                    keyboardShortcuts-BGHopxr9.js
 *  9. logger (J)                     logger-PFDwl5Yq.js
 * 10. zustand create (Ae) / useTaskStore (xe=h) / getWorkspaceState (fe=U→内部 _e) /
 *     mergeTaskMeta (pe=W→内部 de)
 *                                    skillStore-BmeKHDBI.js
 * 11. 本 chunk 内：cmdk 库 (26004–26574)、Dialog 封装 zb/Hb/Ub/Gb/Kb (31943–32040)、
 *     SessionRegistryStore Zs (4309)、useServices fs (2638)、useBaseServices Ec (4897)、
 *     任务快照缓存 Ex (32488) / Ox (32600)、成员版本 dx (32279)、
 *     事件助手 px/rx/ux/sOe/oOe/lje (32217–32316, 35697)、
 *     描述符/键 zie/Bie (1385/1396)、实体键 Io/Lo (1368/1371)、
 *     会话活动 Mo/Po (1311/1324)、比较 Fo/Lie (1365/1352)、
 *     路径助手 Go (1928) / yg (23717) / zhe (23702)、文件图标 zc (5150) / Vc (5195)
 * ============================================================================
 */

import * as React from "react";
import { shortcutLabel } from '../../lib/keyboardShortcuts'; // 〔A1-R124〕原 $i declare 改指——keyboardShortcuts chunk 全量逐字转录 canonical（styles 868 `n as $i`）
import { useHydratingSessions } from '../shell/TaskListQueryCore'; // 〔A1-R129e〕原 JS@35552 declare 改指逐字真身叶（A1-P3-B1 转录；与 SidebarLeaves useSessionItems 孪生一符一家同批收敛）。环安全：TaskListQueryCore 值闭包（SkillStore/stores-core/searchResultsStore/modules/services/searchResultsHelpers/SessionStoreCore/TaskIndexCore）经 QuickPickDeep@147-149 同构边判例，顶层全函数，ESM 提升安全
import { Check as IconCheck, Search as IconSearch, List as IconList, Rocket as IconRocket, MessagesSquare as IconMessagesSquare, File as IconFile, Trash2 as IconTrash, ChevronDown as IconChevronDown, MessageSquare as IconMessageSquare, MessageCirclePlus as IconMessageCirclePlus, PanelLeftClose as IconPanelLeftClose, PanelLeftOpen as IconPanelLeftOpen, SquareTerminal as IconSquareTerminal, BookOpen as IconBookOpen, Users as IconUsers, FileDiff as IconFileDiff, FolderOpen as IconFolderOpen, LogIn as IconLogIn, LogOut as IconLogOut, Server as IconServer, Settings as IconSettings, WandSparkles as IconWandSparkles, Moon as IconMoon, Sun as IconSun, Globe as IconGlobe, MessageCircle as IconMessageCircle, ArrowUp as IconArrowUp, ArrowDown as IconArrowDown, X as IconClose } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0（映射依据见 A0-S3b.report.md）
/* ── tombstone（A0-D-Misc）：原 `import { normalizeWorkspaceScopes } from './126518'` 退回 declare——
 *    chunk 号模块不存在（TS2307）；oje（35647）无正规重建属主，按重建基准恢复 declare 挂接。 ── */
import { toast } from '../../modules/ImeComposition';
import { pathBasename } from '../../modules/ModalsLeaves';
import { getWorkspaceTaskStateAlias as getWorkspaceState, logger, mergeTaskMeta as mergeTaskMetaBase, resolveWorkspaceKey as workspaceKey, useTaskStore } from '../../modules/SkillStore'; // getWorkspaceState（原 fe，skillStore 的 U 导出 = 内部 _e；B5-11 规范名 getWorkspaceTaskStateAlias）；workspaceKey（原 Io/Lo，js 1368/1371）
import { sessionActivityOf, taskEntityKey, compareTasks as compareTasksForList } from '../../modules/StoresDeep'; // +compareTasksForList（A1-R10 2e：原 Fo（1365）declare 改指 canonical = helpers compareTasks（= Lie(…, Fie) 逐字）；1588 调用点逐字不变）
import { normalizeSearchDescriptor as buildQueryDescriptor, descriptorCacheKey as buildQueryKey } from '../../stores/searchResultsHelpers'; // A1-R10 项 2 收尾：原 zie（1385）/Bie（1396）declare 改指 canonical（R9 逐字转录在案；入参 workspaceScopes → 出参 workspaceKeys 真形 1386–1395）。本地 QueryDescriptor 面与 SearchDescriptor 结构全同（kind/sortBy/search/expanded/visibleLimit/workspaceKeys），1746/1756 调用点逐字不变。环安全：helpers 值闭包 = react + stores/taskStore，不达 components/quickpick
import { useBaseServices, useServices } from '../../modules/services';
import { useSessionRegistryStore } from '../../modules/stores-core';
import { cn } from '../../modules/UtilsCn'; // 类名合并（原 Z，utils-CEEH0K_K.js）
import { useZCodeIntl as useIntlContext } from '../../modules/I18n'; // intl 上下文（原 G()，IntlProvider-C321H7m8.js）
import { Button } from '../../modules/button'; // Button（原 X，button-laUijeDG.js）
import { InfoTooltip as Tooltip } from '../../modules/UsageStatsUiParts'; // Tooltip（原 Ia，usageStatsUiParts-CiR7YEhh.js）
import { Command as CmdkCommand, CommandEmpty as CmdkEmpty, CommandGroup as CmdkGroup, CommandInput as CmdkInput, CommandItem as CmdkItem, CommandList as CmdkList, CommandLoading as CmdkLoading, CommandSeparator as CmdkSeparator } from 'cmdk'; // A0-S3c：vendored cmdk（本 chunk 26004–26574）→ npm cmdk@1.1.1
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'; // A0-S3c：Dialog 族 declare → components/ui/dialog（bundle zb/Hb/Ub/Gb/Kb）

/* ============================================================================
 * 0. 外部依赖的类型声明（真实实现位于上面清单所列 chunk；此处为重建接口）
 * ==========================================================================*/

/** react-intl 风格 intl 对象（原 G()，IntlProvider-C321H7m8.js）——A0-D-Misc：useIntlContext 已接线 I18n.useZCodeIntl，此接口仅供 formatRelativeTime 签名 */
interface IntlShape {
  formatMessage(descriptor: { id: string }, values?: Record<string, unknown>): string;
}

/** toast（原 m，imeComposition chunk 的 _ 导出） */

/* ── tombstone〔A1-R124〕shortcutLabel（原 $i）declare 删改指 lib/keyboardShortcuts（keyboardShortcuts-BGHopxr9.js 导出 n 逐字；调用点逐字不变）。 ── */

/** 日志器（原 J，logger-PFDwl5Yq.js） */

/** 键盘匹配器（keyboardShortcuts-BGHopxr9.js：u/d/f 导出） */
/** 原 ta：Ctrl/Cmd + 键（无 Shift/Alt） */
declare function isModKey(e: React.KeyboardEvent | KeyboardEvent, key: string): boolean;
/** 原 Qi：Ctrl/Cmd + Shift + 键（无 Alt） */
declare function isModShiftKey(e: React.KeyboardEvent | KeyboardEvent, key: string): boolean;
/** 原 Rre：Ctrl/Cmd + Alt + 键（无 Shift） */
declare function isModAltKey(e: React.KeyboardEvent | KeyboardEvent, key: string): boolean;

/* ---------------------------- 服务 / 任务模型 ---------------------------- */

interface WorkspaceFileEntry {
  name: string;
  path: string;
  relativePath: string;
  type: "file" | "directory";
}

/** useServices()（原 fs，js 2638）返回的服务集合；本族仅用 fileService */
interface FileService {
  listWorkspaceFiles(args: { rootPath: string }): Promise<WorkspaceFileEntry[]>;
}

/** useBaseServices()（原 Ec，js 4897）：基础服务面（含 zcodeTaskService） */
interface TaskListShardServices {
  zcodeTaskService: ZCodeTaskService;
  [key: string]: unknown;
}

interface ZCodeTaskService {
  listTaskList(args: {
    kind: TaskListKind;
    workspaceScopes: WorkspaceScope[];
    sortBy: TaskSortBy;
    search?: string;
    limit?: number;
  }): Promise<{ items: TaskMeta[]; total: number }>;
  setTaskUnread?(args: { workspacePath: string; workspaceIdentity?: string; taskId: string; unread: boolean }): Promise<{ unreadAt?: number }>;
  [key: string]: unknown;
}

type TaskListKind = "active" | "pinned" | "archived" | "timeline" | "workspace";
type TaskSortBy = "updated" | "created";

interface WorkspaceScope {
  workspacePath: string;
  workspaceIdentity?: string | null;
}

/** 任务元数据（搜索结果/列表行的公共形态；`Vo` 的 taskMetaByEntityKey 值） */
interface TaskMeta {
  taskId: string;
  title: string;
  workspacePath: string;
  workspaceIdentity?: string | null;
  createdAt: number;
  updatedAt: number;
  status?: string;
  unreadAt?: number | null;
  provider?: string | null;
  model?: string | null;
  pinned?: boolean;
  archived?: boolean;
  lastError?: { message?: string } | null;
  changeSummary?: TaskChangeSummary | null;
  /** 搜索命中片段（搜索态才有） */
  searchSnippet?: string;
  searchSnippets?: string[];
  /** 会话活动（原 Mo 读取 __zcodeSessionActivity） */
  __zcodeSessionActivity?: SessionActivity | null;
  [key: string]: unknown;
}
interface SessionActivity {
  phase: "prewarming" | "running" | "completed" | "error" | string;
  lastActivityAt: number;
  pendingInteractions?: { permissionCount: number; userInputCount: number };
  [key: string]: unknown;
}

/* A1-R10 2e 精化：补 fileCount/added/removed 具名必填 = bundle 真形（np@6874 strict schema；
   vg@23753 读 changeSummary.files.length、Bhe@23757 读顶层 added/removed）——原仅 files + 索引签名，
   与 helpers TaskChangeSummary 双向吻合所需 */
interface TaskChangeSummary {
  fileCount: number;
  added: number;
  removed: number;
  files: RecentChangeFile[];
  [key: string]: unknown;
}
/** 最近变更文件行（activeTaskChangeSummary.files 项） */
interface RecentChangeFile {
  path: string;
  added: number;
  removed: number;
  lastTurnIndex: number;
  writeCount: number;
  [key: string]: unknown; // A1-R10 2e：canonical 面索引签名（helpers files 项同面）
}

/** 工作区标签（workspaceTabs 项；命令中心据此跨工作区搜索） */
interface WorkspaceTab {
  workspacePath: string;
  workspaceIdentity?: string | null;
  label: string;
  remoteTarget?: unknown;
  remoteSessionId?: string | null;
  [key: string]: unknown;
}

/* ------------------------------ zustand 泛型 ------------------------------ */

/** zustand store hook（原 Ae()(...)；支持选择器调用与 getState）。
 *  set 的 updater 允许返回部分状态（zustand 语义：浅合并）。 */
interface ZustandStore<S> {
  (): S;
  <T>(selector: (state: S) => T): T;
  getState(): S;
  setState(partial: Partial<S> | ((state: S) => Partial<S>)): void;
}
declare function createZustandStore<S>(init: (set: (updater: (state: S) => S | Partial<S>) => void) => S): ZustandStore<S>;

/** useTaskStore（skillStore chunk 的 h 导出）——A0-D-Misc：TaskStoreState/getWorkspaceState 已接线 SkillStore（getWorkspaceTaskStateAlias），本地形状声明移除 */

/** mergeTaskMeta（原 pe，skillStore 的 W 导出 = 内部 de）；A0-D-Misc 类型收敛：本地 TaskMeta 的 unreadAt/changeSummary 更宽，按本地签名投射 */
const mergeTaskMeta = mergeTaskMetaBase as unknown as (base: TaskMeta, incoming: TaskMeta) => TaskMeta;

/** SessionRegistryStore（原 Zs，js 4309） */
interface SessionRegistryState {
  baseServices: TaskListShardServices | null;
  sessionsById: Record<string, unknown>;
  sessionIdByWorkspaceIdentity: Record<string, string>;
  sessionIdByWorkspacePath: Record<string, string>;
  [key: string]: unknown;
}

/* ------------------------------ UI 原语声明 ------------------------------ */

/* ── tombstone（A0-S3c）：Dialog 族 declare 删除 → import from '../components/ui/dialog'（bundle zb/Hb/Ub/Gb/Kb，styles 31943–32040）；调用面逐字不变。 ── */

/** 文件图标解析（原 zc，js 5150；图标资产映射在 4946–6061 文件工具块） */
interface FileInfo {
  fileIcon: string;
  fileIconSrc: string;
  fileName: string;
  filePath: string | null;
  normalizedPath: string;
}
declare function resolveFileInfo(path: string, options?: { basePath?: string; kind?: "directory" | "file" }): FileInfo;

/** 路径助手（原 Go js 1928 / zhe 23702 / yg 23765） */
/* ── tombstone〔A1-R45〕：declare stripTrailingSlash（原 Go js 1928 族）删除——本文件零消费（grep 实测仅本 declare 行），全树独见。纯删碑（上方 JSDoc 为活面同胞 relativePathFrom 保留），证据见 A1-R45.report.md §二。 ── */
declare function relativePathFrom(rootPath: string, absPath: string): string;

/** 实体键（原 Io/Lo，js 1368/1371）——A0-D-Misc：已接线 SkillStore.resolveWorkspaceKey */

/* ============================================================================
 * 1. cmdk 封装原语（原 Yb/tOe/Zb/Qb/$b/ex/tx；底层 cmdk 库 = 本 chunk 26004–26574）
 * ==========================================================================*/

/**
 * A0-S3c：vendored cmdk 命名空间（原 m_，js 26493–26501）→ npm cmdk@1.1.1。
 * declare namespace 删除，改为对 cmdk 具名导出的命名空间映射（调用面
 * CommandPrimitive.X 逐字不变；cmdk 复合导出无 Root 静态，故以 const 映射补齐）。
 */
const CommandPrimitive = {
  Root: CmdkCommand,
  List: CmdkList,
  Item: CmdkItem,
  Input: CmdkInput,
  Group: CmdkGroup,
  Separator: CmdkSeparator,
  Empty: CmdkEmpty,
  Loading: CmdkLoading,
};

/** 原 Yb（js 32140 / jsx 29478）：Command 根封装 */
export function Command({ className, loop = false, ...props }: React.ComponentProps<typeof CommandPrimitive.Root>) {
  return (
    <CommandPrimitive.Root
      data-slot="command"
      loop={loop}
      className={cn(
        "flex size-full flex-col overflow-hidden rounded-xl bg-popover p-1 text-popover-foreground",
        className,
      )}
      {...props}
    />
  );
}

/** 原 tOe（js 32151 / jsx 29490）：CommandDialog —— 命令面板对话框壳 */
export function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  className,
  showCloseButton = false,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string;
  description?: string;
  className?: string;
  showCloseButton?: boolean;
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent className={cn("top-1/3 translate-y-0 overflow-hidden rounded-xl! p-0", className)} showCloseButton={showCloseButton}>
        {children}
      </DialogContent>
    </Dialog>
  );
}

/** 原 Zb（js 32196 / jsx 29513）：CommandList */
export function CommandList({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn("scrollbar-hide max-h-72 scroll-py-1 overflow-x-hidden overflow-y-auto outline-none", className)}
      {...props}
    />
  );
}

/** 原 Qb（js 32206 / jsx 29519）：CommandEmpty */
export function CommandEmpty({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return <CommandPrimitive.Empty data-slot="command-empty" className={cn("py-6 text-center text-ui-base/relaxed", className)} {...props} />;
}

/** 原 $b（js 32213 / jsx 29525）：CommandGroup */
export function CommandGroup({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "overflow-hidden p-1 text-foreground **:[[cmdk-group-heading]]:px-2.5 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-ui-base **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-foreground-subtle",
        className,
      )}
      {...props}
    />
  );
}

/** 图标声明（命令条目右侧的选中 ✓，原 M_ = check） */
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（1）：IconCheck → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */

/** 原 ex（js 32223 / jsx 29531）：CommandItem（尾部带条件 ✓） */
export function CommandItem({ className, children, ...props }: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "group/command-item relative flex min-h-7 cursor-default items-center gap-2 rounded-lg px-2.5 py-1.5 text-ui-base/relaxed outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 hover:bg-menu-hover data-selected:bg-menu-hover data-selected:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5 data-selected:*:[svg]:text-foreground",
        className,
      )}
      {...props}
    >
      {children}
      <IconCheck className="size-4 ml-auto !text-foreground-subtle hidden group-has-data-[slot=command-shortcut]/command-item:hidden group-data-[checked=true]/command-item:inline-block" />
    </CommandPrimitive.Item>
  );
}

/** 原 tx（js 32239 / jsx 29538）：CommandShortcut 角标 */
export function CommandShortcut({ className, ...props }: React.ComponentPropsWithoutRef<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn("ml-auto text-ui-xs tracking-widest text-foreground-subtlest group-data-selected/command-item:text-foreground", className)}
      {...props}
    />
  );
}

/* ============================================================================
 * 2. 图标（lucide；原 Sa 工厂，本 chunk 26575–28020）
 * ==========================================================================*/

/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（28）：IconSearch/IconList/IconRocket/IconMessagesSquare/IconFile/IconTrash/IconChevronDown/IconMessageSquare/IconMessageCirclePlus/IconPanelLeftClose/IconPanelLeftOpen/IconSquareTerminal/IconBookOpen/IconUsers/IconFileDiff/IconFolderOpen/IconLogIn/IconLogOut/IconServer/IconSettings/IconWandSparkles/IconMoon/IconSun/IconGlobe/IconMessageCircle/IconArrowUp/IconArrowDown/IconClose → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */

/** 文件图标 <img>（原 Vc，js 5195；加载失败回退） */
export function FileIconImg({ src, size = 16, className }: { src: string; size?: number; className?: string }) {
  const [currentSrc, setCurrentSrc] = React.useState(src);
  React.useEffect(() => {
    setCurrentSrc(src);
  }, [src]);
  return (
    <img
      src={currentSrc}
      alt=""
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      onError={() => {
        // 原 Lc(r)：图标资产回退映射（4946–6061 文件工具块）
        const fallback = resolveIconFallback(currentSrc);
        if (fallback) setCurrentSrc(fallback);
      }}
    />
  );
}
declare function resolveIconFallback(src: string): string | null; // 原 Lc

/* ============================================================================
 * 3. 命令注册表（原 D_e/O_e，js 25393–25585 / jsx 22073–22262）
 * ==========================================================================*/

/** 段序（原 D_e，js 25393）。注意：无 `recommended` 段（词典有 key 但运行时段序不含）。 */
export const QUICK_PICK_SECTION_ORDER = ["suggested", "chat", "navigation", "panels", "configure", "app"] as const;
export type QuickPickSectionId = (typeof QUICK_PICK_SECTION_ORDER)[number];

export type QuickPickCommandIconName =
  | "book"
  | "browser"
  | "community"
  | "diff"
  | "feedback"
  | "folder"
  | "login"
  | "logout"
  | "message"
  | "mcp"
  | "settings"
  | "sidebarClose"
  | "sidebarOpen"
  | "skills"
  | "themeDark"
  | "themeLight"
  | "terminal";

export interface QuickPickCommand {
  id: string;
  sectionId: QuickPickSectionId;
  /** i18n key：`quickPick.command.*` */
  titleId: string;
  icon: QuickPickCommandIconName;
  /** 快捷键文案（已经 shortcutLabel 本地化） */
  shortcut?: string;
  keywords: string[];
  disabled?: boolean;
  run: () => void | Promise<void>;
}

/** 命令图标名 → lucide 组件（原 mje，js 36151–36169 / jsx 33181） */
export const QUICK_PICK_COMMAND_ICONS: Record<QuickPickCommandIconName, React.FC<{ className?: string }>> = {
  book: IconBookOpen,
  browser: IconGlobe,
  community: IconUsers,
  diff: IconFileDiff,
  feedback: IconMessageSquare,
  folder: IconFolderOpen,
  login: IconLogIn,
  logout: IconLogOut,
  message: IconMessageCirclePlus,
  mcp: IconServer,
  settings: IconSettings,
  sidebarClose: IconPanelLeftClose,
  sidebarOpen: IconPanelLeftOpen,
  skills: IconWandSparkles,
  themeDark: IconMoon,
  themeLight: IconSun,
  terminal: IconSquareTerminal,
};

export interface BuildQuickPickCommandsArgs {
  allowOpenWorkspace: boolean;
  canOpenCommunity: boolean;
  isSidebarVisible: boolean;
  isLoggedIn: boolean;
  supportsEmbeddedBrowser?: boolean;
  /** 当前主题目标（决定切换主题命令的标题/图标方向） */
  themeTarget: "dark" | "light" | string;
  shortcuts: {
    newTask?: string;
    openWorkspace?: string;
    toggleSidebar?: string;
    toggleTerminal?: string;
  };
  handlers: {
    createTask: () => void;
    openWorkspace: () => void;
    openSettings: () => void;
    openSkillsSettings: () => void;
    openMcpSettings: () => void;
    switchTheme: () => void;
    openFeedback: () => void;
    openCommunity: () => void;
    openProductDocs: () => void;
    login?: () => void;
    logout?: () => void;
    toggleSidebar: () => void;
    toggleTerminal: () => void;
    togglePreview: () => void;
    openTerminalTab: () => void;
    openBrowserTab: () => void;
    openReviewTab: () => void;
  };
}

/**
 * 原 O_e（js 25443–25585 / jsx 22074）：构建命令清单。
 * 段序落点：suggested×3、panels×6（2 条受 supportsEmbeddedBrowser 门控）、
 * configure×4、app×4（community/login/logout 条件）。
 * `chat`/`navigation` 段在 3.7.6 未注册任何命令（词典保留旧 key）。
 */
export function buildQuickPickCommands({
  allowOpenWorkspace,
  canOpenCommunity,
  isSidebarVisible,
  isLoggedIn,
  supportsEmbeddedBrowser = true,
  themeTarget,
  shortcuts,
  handlers,
}: BuildQuickPickCommandsArgs): QuickPickCommand[] {
  const commands: QuickPickCommand[] = [
    {
      id: "new-task",
      sectionId: "suggested",
      titleId: "quickPick.command.newTask",
      icon: "message",
      shortcut: shortcuts.newTask,
      keywords: ["new", "task", "任务", "新任务", "新建任务"],
      run: handlers.createTask,
    },
    {
      id: "open-workspace",
      sectionId: "suggested",
      titleId: "quickPick.command.openWorkspace",
      icon: "folder",
      shortcut: shortcuts.openWorkspace,
      keywords: ["open", "workspace", "folder", "project", "打开", "文件夹", "项目"],
      disabled: !allowOpenWorkspace,
      run: handlers.openWorkspace,
    },
    {
      id: "suggested-settings",
      sectionId: "suggested",
      titleId: "quickPick.command.settings",
      icon: "settings",
      keywords: ["settings", "preferences", "配置", "设置"],
      run: handlers.openSettings,
    },
    {
      id: "toggle-sidebar",
      sectionId: "panels",
      titleId: "quickPick.command.toggleSidebar",
      icon: isSidebarVisible ? "sidebarClose" : "sidebarOpen",
      shortcut: shortcuts.toggleSidebar,
      keywords: ["sidebar", "left sidebar", "toggle sidebar", "侧栏", "侧边栏", "切换侧栏"],
      run: handlers.toggleSidebar,
    },
    {
      id: "toggle-terminal",
      sectionId: "panels",
      titleId: "quickPick.command.toggleTerminal",
      icon: "terminal",
      shortcut: shortcuts.toggleTerminal,
      keywords: ["terminal", "shell", "console", "终端"],
      run: handlers.toggleTerminal,
    },
    ...(supportsEmbeddedBrowser
      ? [
          {
            id: "toggle-preview",
            sectionId: "panels",
            titleId: "quickPick.command.togglePreview",
            icon: "browser",
            keywords: ["preview", "browser", "web", "show", "hide", "预览", "浏览器", "网页", "显示", "隐藏"],
            run: handlers.togglePreview,
          } satisfies QuickPickCommand,
        ]
      : []),
    {
      id: "add-terminal-tab",
      sectionId: "panels",
      titleId: "quickPick.command.addTerminalTab",
      icon: "terminal",
      keywords: ["add", "terminal", "tab", "new terminal", "添加终端", "终端标签"],
      run: handlers.openTerminalTab,
    },
    ...(supportsEmbeddedBrowser
      ? [
          {
            id: "add-browser-tab",
            sectionId: "panels",
            titleId: "quickPick.command.addBrowserTab",
            icon: "browser",
            keywords: ["add", "browser", "tab", "preview", "添加浏览器", "浏览器标签"],
            run: handlers.openBrowserTab,
          } satisfies QuickPickCommand,
        ]
      : []),
    {
      id: "add-review-tab",
      sectionId: "panels",
      titleId: "quickPick.command.addReviewTab",
      icon: "diff",
      keywords: ["add", "review", "diff", "changes", "添加审查", "审查标签", "变更"],
      run: handlers.openReviewTab,
    },
    {
      id: "settings",
      sectionId: "configure",
      titleId: "quickPick.command.settings",
      icon: "settings",
      keywords: ["settings", "preferences", "配置", "设置"],
      run: handlers.openSettings,
    },
    {
      id: "switch-theme",
      sectionId: "configure",
      titleId: themeTarget === "dark" ? "quickPick.command.switchThemeToDark" : "quickPick.command.switchThemeToLight",
      icon: themeTarget === "dark" ? "themeDark" : "themeLight",
      keywords: ["theme", "dark", "light", "主题", "深色", "浅色"],
      run: handlers.switchTheme,
    },
    {
      id: "skills-settings",
      sectionId: "configure",
      titleId: "quickPick.command.skills",
      icon: "skills",
      keywords: ["skills", "skill", "配置", "技能"],
      run: handlers.openSkillsSettings,
    },
    {
      id: "mcp-settings",
      sectionId: "configure",
      titleId: "quickPick.command.mcpServers",
      icon: "mcp",
      keywords: ["mcp", "server", "servers", "MCP", "服务器"],
      run: handlers.openMcpSettings,
    },
  ];
  commands.push({
    id: "feedback",
    sectionId: "app",
    titleId: "quickPick.command.feedback",
    icon: "feedback",
    keywords: ["feedback", "issue", "support", "tickets", "问题反馈", "反馈", "我的反馈", "工单"],
    run: handlers.openFeedback,
  });
  if (canOpenCommunity) {
    commands.push({
      id: "community",
      sectionId: "app",
      titleId: "quickPick.command.community",
      icon: "community",
      keywords: ["community", "users", "chat", "用户社群", "社群"],
      run: handlers.openCommunity,
    });
  }
  commands.push({
    id: "product-docs",
    sectionId: "app",
    titleId: "quickPick.command.productDocs",
    icon: "book",
    keywords: ["docs", "documentation", "product docs", "文档", "产品文档"],
    run: handlers.openProductDocs,
  });
  if (isLoggedIn && handlers.logout) {
    commands.push({
      id: "logout",
      sectionId: "app",
      titleId: "quickPick.command.logout",
      icon: "logout",
      keywords: ["disconnect", "logout", "sign out", "断开连接", "登出"],
      run: handlers.logout,
    });
  } else if (!isLoggedIn && handlers.login) {
    commands.push({
      id: "login",
      sectionId: "app",
      titleId: "quickPick.command.login",
      icon: "login",
      keywords: ["connect", "login", "sign in", "连接", "登录"],
      run: handlers.login,
    });
  }
  return commands;
}

/* ============================================================================
 * 4. 模糊评分（vendored `fuzzy` 库；原 25586–25631 / jsx 22263+。
 *    cmdk 默认过滤器 kve = fuzzyScore；命令面板本身关闭了 cmdk 过滤
 *    （shouldFilter=false），命令过滤走 commandMatchesQuery。）
 * ==========================================================================*/

const FUZZY_SCORE_EXACT = 1;
const FUZZY_SCORE_WORD_START = 0.9;
const FUZZY_SCORE_SEPARATOR = 0.8;
const FUZZY_SCORE_MID = 0.17;
const FUZZY_SCORE_SKIP_FLOOR = 0.1;
const FUZZY_SCORE_SKIP_DECAY = 0.999;
const FUZZY_SCORE_CASE_MISMATCH = 0.9999;
const FUZZY_SCORE_INCOMPLETE = 0.99;
const FUZZY_BOUNDARY_CHAR = /[\\\/_+.#"@\[\(\{&]/;
const FUZZY_BOUNDARY_CHAR_GLOBAL = /[\\\/_+.#"@\[\(\{&]/g;
const FUZZY_WORD_BOUNDARY = /[\s-]/;
const FUZZY_WORD_BOUNDARY_GLOBAL = /[\s-]/g;

function fuzzyScoreRecursive(
  original: string,
  query: string,
  originalLower: string,
  queryLower: string,
  originalIndex: number,
  queryIndex: number,
  memo: Record<string, number>,
): number {
  if (queryIndex === query.length) return originalIndex === original.length ? FUZZY_SCORE_EXACT : FUZZY_SCORE_INCOMPLETE;
  const memoKey = `${originalIndex},${queryIndex}`;
  if (memo[memoKey] !== undefined) return memo[memoKey];
  let best = 0;
  for (let matchIndex = originalLower.indexOf(queryLower.charAt(queryIndex), originalIndex); matchIndex >= 0; ) {
    let score = fuzzyScoreRecursive(original, query, originalLower, queryLower, matchIndex + 1, queryIndex + 1, memo);
    if (score > best) {
      if (matchIndex === originalIndex) {
        score *= FUZZY_SCORE_EXACT;
      } else if (FUZZY_BOUNDARY_CHAR.test(original.charAt(matchIndex - 1))) {
        score *= FUZZY_SCORE_SEPARATOR;
        const boundaryCount = original.slice(originalIndex, matchIndex - 1).match(FUZZY_BOUNDARY_CHAR_GLOBAL);
        if (boundaryCount && originalIndex > 0) score *= FUZZY_SCORE_SKIP_DECAY ** +boundaryCount.length;
      } else if (FUZZY_WORD_BOUNDARY.test(original.charAt(matchIndex - 1))) {
        score *= FUZZY_SCORE_WORD_START;
        const wordCount = original.slice(originalIndex, matchIndex - 1).match(FUZZY_WORD_BOUNDARY_GLOBAL);
        if (wordCount && originalIndex > 0) score *= FUZZY_SCORE_SKIP_DECAY ** +wordCount.length;
      } else {
        score *= FUZZY_SCORE_MID;
        if (originalIndex > 0) score *= FUZZY_SCORE_SKIP_DECAY ** +(matchIndex - originalIndex);
      }
      if (original.charAt(matchIndex) !== query.charAt(queryIndex)) score *= FUZZY_SCORE_CASE_MISMATCH;
    }
    if (
      (score < FUZZY_SCORE_SKIP_FLOOR && originalLower.charAt(matchIndex - 1) === queryLower.charAt(queryIndex + 1)) ||
      (queryLower.charAt(queryIndex + 1) === queryLower.charAt(queryIndex) && originalLower.charAt(matchIndex - 1) !== queryLower.charAt(queryIndex))
    ) {
      const skipped = fuzzyScoreRecursive(original, query, originalLower, queryLower, matchIndex + 1, queryIndex + 2, memo);
      if (skipped * FUZZY_SCORE_SKIP_FLOOR > score) score = skipped * FUZZY_SCORE_SKIP_FLOOR;
    }
    if (score > best) best = score;
    matchIndex = originalLower.indexOf(queryLower.charAt(queryIndex), matchIndex + 1);
  }
  memo[memoKey] = best;
  return best;
}

function fuzzyNormalize(text: string): string {
  return text.toLowerCase().replace(FUZZY_WORD_BOUNDARY_GLOBAL, " ");
}

/** 原 B_e（js 25626）：fuzzyScore（标题 + 关键词拼接后评分） */
export function fuzzyScore(original: string, query: string, keywords?: string[]): number {
  const haystack = keywords && keywords.length > 0 ? `${original} ${keywords.join(" ")}` : original;
  return fuzzyScoreRecursive(haystack, query, fuzzyNormalize(haystack), fuzzyNormalize(query), 0, 0, {});
}

/* ============================================================================
 * 5. 相对时间 / 标题 / 排序（原 $S/fC/Mje，js 36080/36277/36281）
 * ==========================================================================*/

/** 原 $S（js 36128–36137）：相对时间（刚刚/N 分钟前/N 小时前/N 天前） */
export function formatRelativeTime(timestamp: number, intl: IntlShape): string {
  const elapsed = Date.now() - timestamp;
  const minutes = Math.floor(elapsed / 6e4);
  if (minutes < 1) return intl.formatMessage({ id: "taskList.justNow" });
  if (minutes < 60) return intl.formatMessage({ id: "taskList.minutesAgo" }, { minutes: String(minutes) });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return intl.formatMessage({ id: "taskList.hoursAgo" }, { hours: String(hours) });
  const days = Math.floor(hours / 24);
  return intl.formatMessage({ id: "taskList.daysAgo" }, { days: String(days) });
}

/** 原 fC（js 36326）：空标题回退「未命名」 */
export function resolveTaskTitle(task: { title: string }, untitledLabel: string): string {
  return task.title.trim() || untitledLabel;
}

/** 原 Mje（js 36281–36285）：最近变更排序（轮次新→旧，写次数多→少，路径字典序） */
export function compareRecentChanges(a: RecentChangeFile, b: RecentChangeFile): number {
  return b.lastTurnIndex === a.lastTurnIndex
    ? b.writeCount === a.writeCount
      ? a.path.localeCompare(b.path)
      : b.writeCount - a.writeCount
    : b.lastTurnIndex - a.lastTurnIndex;
}

/* ============================================================================
 * 6. 查询高亮（原 dje/fje/pje/eC，js 36090–36150 / jsx 33143–33179）
 * ==========================================================================*/

interface HighlightRange {
  start: number;
  end: number;
}

/** 原 dje（js 36090）：查询分词（小写、去重） */
export function tokenizeQuery(query: string): string[] {
  const seen = new Set<string>();
  return query
    .trim()
    .toLocaleLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .filter((token) => (seen.has(token) ? false : (seen.add(token), true)));
}

/** 原 fje（js 36099）：重叠区间合并 */
export function mergeHighlightRanges(ranges: HighlightRange[]): HighlightRange[] {
  const sorted = [...ranges].sort((a, b) => a.start - b.start || a.end - b.end);
  const merged: HighlightRange[] = [];
  for (const range of sorted) {
    const last = merged.at(-1);
    if (!last || range.start > last.end) {
      merged.push({ ...range });
      continue;
    }
    last.end = Math.max(last.end, range.end);
  }
  return merged;
}

/** 原 pje（js 36112）：查询词在文本中的全部出现区间 */
export function findHighlightRanges(text: string, query: string): HighlightRange[] {
  const tokens = tokenizeQuery(query);
  if (tokens.length === 0 || text.length === 0) return [];
  const lower = text.toLocaleLowerCase();
  const ranges: HighlightRange[] = [];
  for (const token of tokens) {
    let index = 0;
    while (index < lower.length) {
      const found = lower.indexOf(token, index);
      if (found === -1) break;
      ranges.push({ start: found, end: found + token.length });
      index = found + token.length;
    }
  }
  return mergeHighlightRanges(ranges);
}

/** 原 eC（js 36175–36150 / jsx 33169）：查询词高亮文本（<mark>） */
export function HighlightedText({ text, query }: { text: string; query: string }) {
  const ranges = findHighlightRanges(text, query);
  if (ranges.length === 0) return <>{text}</>;
  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  ranges.forEach((range, index) => {
    if (cursor < range.start) {
      nodes.push(<span key={`plain-${index}`}>{text.slice(cursor, range.start)}</span>);
    }
    nodes.push(
      <mark key={`match-${index}`} className="rounded-sm bg-accent font-semibold text-foreground">
        {text.slice(range.start, range.end)}
      </mark>,
    );
    cursor = range.end;
  });
  if (cursor < text.length) nodes.push(<span key="plain-end">{text.slice(cursor)}</span>);
  return <>{nodes}</>;
}

/* ============================================================================
 * 7. 搜索历史（原 rC/yje/iC/aC/bje/oC/sC/xje/Sje，js 36171–36231 / jsx 33197–33254）
 *    存储键：`zcode-command-center-search-history:<workspaceKey>`，上限 20 条。
 * ==========================================================================*/

export const SEARCH_HISTORY_LIMIT = 20; // 原 rC
export const SEARCH_HISTORY_STORAGE_PREFIX = "zcode-command-center-search-history:"; // 原 yje

export type QuickPickScope = "all" | "commands" | "conversations" | "files";

export interface SearchHistoryEntry {
  query: string;
  scope: QuickPickScope;
  updatedAt: number;
}

/** 原 iC（js 36226）：安全读取 localStorage（SSR/禁用时返回 null） */
export function safeLocalStorage(): Storage | null {
  if (typeof window > "u") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** 原 aC（js 36234） */
export function searchHistoryStorageKey(workspaceKey: string): string {
  return `${SEARCH_HISTORY_STORAGE_PREFIX}${workspaceKey}`;
}

/** 原 bje（js 36189）：历史条目形状校验 */
export function isSearchHistoryEntry(value: unknown): value is SearchHistoryEntry {
  if (!value || typeof value != "object") return false;
  const entry = value as SearchHistoryEntry;
  return (
    typeof entry.query == "string" &&
    typeof entry.updatedAt == "number" &&
    (entry.scope === "all" || entry.scope === "commands" || entry.scope === "conversations" || entry.scope === "files")
  );
}

/** 原 oC（js 36249）：读取历史（≤20） */
export function loadSearchHistory(workspaceKey: string): SearchHistoryEntry[] {
  const storage = safeLocalStorage();
  if (!storage) return [];
  try {
    const parsed = JSON.parse(storage.getItem(searchHistoryStorageKey(workspaceKey)) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter(isSearchHistoryEntry).slice(0, SEARCH_HISTORY_LIMIT) : [];
  } catch {
    return [];
  }
}

/** 原 sC（js 36259）：写入历史（截断 20） */
export function saveSearchHistory(workspaceKey: string, entries: SearchHistoryEntry[]): void {
  const storage = safeLocalStorage();
  if (storage) {
    try {
      storage.setItem(searchHistoryStorageKey(workspaceKey), JSON.stringify(entries.slice(0, SEARCH_HISTORY_LIMIT)));
    } catch {
      /* 存储满/禁用时静默 */
    }
  }
}

/** 原 xje（js 36219–36227）：记录一次搜索（空查询/纯前缀不记录；去重置顶） */
export function recordSearchHistory(args: { workspaceKey: string; query: string; scope: QuickPickScope }): SearchHistoryEntry[] {
  const query = args.query.trim();
  if (!query || query === ">" || query === "#" || query === "@") return loadSearchHistory(args.workspaceKey);
  const entry: SearchHistoryEntry = { query, scope: args.scope, updatedAt: Date.now() };
  const lower = query.toLocaleLowerCase();
  const next = [entry, ...loadSearchHistory(args.workspaceKey).filter((existing) => existing.query.toLocaleLowerCase() !== lower)].slice(
    0,
    SEARCH_HISTORY_LIMIT,
  );
  saveSearchHistory(args.workspaceKey, next);
  return next;
}

/** 原 Sje（js 36228）：清空历史 */
export function clearSearchHistory(workspaceKey: string): void {
  saveSearchHistory(workspaceKey, []);
}

/* ============================================================================
 * 8. 查询解析 / 过滤（原 Nje/mC/Pje/kje/Aje/Oje/jje/dC/Fje，js 36240–36334）
 * ==========================================================================*/

/** 折叠段在「全部」视图中的条数上限（原 cC） */
export const COLLAPSED_SECTION_LIMIT = 3;
/** 最近变更/最近任务条数（原 lC） */
export const RECENT_SECTION_LIMIT = 3;
/** 文件搜索结果上限（原 Tje） */
export const FILE_SEARCH_LIMIT = 80;
/** 任务列表请求上限（原 uC） */
export const TASK_LIST_LIMIT = 80;

export interface ParsedScopedQuery {
  query: string;
  scope: QuickPickScope;
  explicitScope: boolean;
}

/**
 * 原 Nje（js 36286–36298）：前缀语法解析。
 *   `>xxx` → commands；`#xxx` → conversations（任务）；`@xxx` → files；其余 → all。
 */
export function parseScopedQuery(raw: string): ParsedScopedQuery {
  const trimmed = raw.trimStart();
  const first = trimmed[0];
  return first === ">"
    ? { query: trimmed.slice(1).trimStart(), scope: "commands", explicitScope: true }
    : first === "#"
      ? { query: trimmed.slice(1).trimStart(), scope: "conversations", explicitScope: true }
      : first === "@"
        ? { query: trimmed.slice(1).trimStart(), scope: "files", explicitScope: true }
        : { query: raw.trim(), scope: "all", explicitScope: false };
}

/** 原 mC（js 36396–36360）：段 → 前缀字符 */
export function scopePrefix(scope: QuickPickScope): string {
  switch (scope) {
    case "commands":
      return ">";
    case "conversations":
      return "#";
    case "files":
      return "@";
    default:
      return "";
  }
}

/** 原 Pje（js 36299–36308）：命令过滤（标题+关键词拼接，分词全命中） */
export function commandMatchesQuery(command: QuickPickCommand, title: string, query: string): boolean {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return true;
  const haystack = `${title} ${command.keywords.join(" ")}`.toLocaleLowerCase();
  return normalized
    .split(/\s+/)
    .filter(Boolean)
    .every((token) => haystack.includes(token));
}

/** 原 Oje（js 36240）：文件相对路径的目录部分 */
export function fileDirectoryLabel(file: { relativePath: string }): string {
  const lastSlash = file.relativePath.lastIndexOf("/");
  return lastSlash === -1 ? "" : file.relativePath.slice(0, lastSlash);
}

/** 原 kje（js 36244）：文件搜索源文本 */
export function fileSearchHaystack(file: { name: string; relativePath: string }): string {
  return `${file.name} ${file.relativePath}`.toLocaleLowerCase();
}

/** 原 Aje（js 36247–36260）：工作区文件过滤（仅文件、分词全命中、≤80） */
export function filterWorkspaceFiles(files: WorkspaceFileEntry[], query: string): WorkspaceFileEntry[] {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return [];
  const tokens = normalized.split(/\s+/).filter(Boolean);
  return files
    .filter((file) => file.type === "file")
    .filter((file) => {
      const haystack = fileSearchHaystack(file);
      return tokens.every((token) => haystack.includes(token));
    })
    .slice(0, FILE_SEARCH_LIMIT);
}

/** 原 jje（js 36261）：搜索片段归一（去首尾省略号、压空白、小写） */
export function normalizeSearchSnippet(snippet: string): string {
  return snippet
    .replace(/^\.\.\./, "")
    .replace(/\.\.\.$/, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase();
}

/** 原 dC（js 36316）：任务片段去重（按归一文本） */
export function dedupeSearchSnippets(task: { searchSnippets?: string[]; searchSnippet?: string }): string[] {
  const raw = task.searchSnippets?.length ? task.searchSnippets : task.searchSnippet ? [task.searchSnippet] : [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const snippet of raw) {
    const normalized = normalizeSearchSnippet(snippet);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(snippet);
  }
  return result;
}

export interface TaskSearchRow {
  key: string;
  task: TaskMeta;
  searchSnippet?: string;
  snippetIndex?: number;
}

/** 原 Fje（js 36309–36334）：任务搜索结果行展开（同任务多片段 → 多行） */
export function buildTaskSearchRows(args: { tasks: TaskMeta[]; query: string }): TaskSearchRow[] {
  const rows: TaskSearchRow[] = [];
  const byKey = new Map<string, TaskMeta>();
  for (const task of args.tasks) {
    const key = `${task.workspaceIdentity?.trim() || task.workspacePath}:${task.taskId}`;
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, task);
      continue;
    }
    byKey.set(key, { ...existing, searchSnippets: [...dedupeSearchSnippets(existing), ...dedupeSearchSnippets(task)] });
  }
  for (const task of byKey.values()) {
    const baseKey = `${task.workspaceIdentity?.trim() || task.workspacePath}:${task.taskId}`;
    const snippets = args.query ? dedupeSearchSnippets(task) : [];
    if (snippets.length === 0) {
      rows.push({ key: baseKey, task });
      continue;
    }
    snippets.forEach((snippet, snippetIndex) => {
      rows.push({ key: `${baseKey}:${snippetIndex}`, task, searchSnippet: snippet, snippetIndex });
    });
  }
  return rows;
}

/* ============================================================================
 * 9. 搜索结果 store（原 Vo，js 1553–1878 / jsx 569；zustand，横切层 §2.1 #2）
 * ==========================================================================*/

export interface QueryDescriptor {
  kind: TaskListKind;
  sortBy: TaskSortBy;
  search: string;
  expanded: boolean;
  visibleLimit: number | null;
  workspaceKeys: string[];
}

export interface QueryResult {
  descriptor: QueryDescriptor;
  taskKeys: string[];
  unreadTaskKeys?: string[];
  searchSnippetsByTaskKey?: Record<string, string>;
  searchSnippetListsByTaskKey?: Record<string, string[]>;
  total: number;
  hasMore: boolean;
  /* A1-R10 2f 精化：五字段去可选——bundle 真形：入库恒经 Uie（1414）固化
     （fetchedAt=Date.now()/stale=false/partial??false/shardKeys??[]），
     失效路径仅置 stale=true，无 undefined 态；与 helpers QueryResult 面吻合 */
  fetchedAt: number;
  invalidationVersion: number;
  stale: boolean;
  partial: boolean;
  loadingShardKeys: string[];
  failedShardKeys: string[];
}

interface SetQueryResultArgs {
  queryKey: string;
  descriptor: QueryDescriptor;
  items: TaskMeta[];
  total: number;
  hasMore: boolean;
  unreadTaskKeys?: string[];
  partial?: boolean;
  loadingShardKeys?: string[];
  failedShardKeys?: string[];
  expectedInvalidationVersion?: number;
}

export interface SearchResultsState {
  resultsByQueryKey: Record<string, QueryResult>;
  taskMetaByEntityKey: Record<string, TaskMeta>;
  taskUnreadOverlayByEntityKey: Record<string, number | null>;
  setQueryResult(args: SetQueryResultArgs): void;
  setQueryResults(args: SetQueryResultArgs[]): void;
  upsertTaskMeta(task: TaskMeta): void;
  updateTaskMetaPreservingMembership(task: TaskMeta): void;
  applyTaskMutation(args: { previousTask: TaskMeta; nextTask: TaskMeta; previousState: { pinned: boolean; archived: boolean }; nextState: { pinned: boolean; archived: boolean } }): void;
  setTaskUnreadOverlay(task: WorkspaceScope & { taskId: string }, unreadAt: number | null | undefined): void;
  reconcileTaskUnread(task: WorkspaceScope & { taskId: string }, unreadAt: number | null | undefined): void;
  rollbackTaskUnread(task: WorkspaceScope & { taskId: string }, unreadAt: number | null | undefined): void;
  removeTask(task: WorkspaceScope & { taskId: string }): boolean;
  markWorkspaceKeysStale(workspaceKeys: string[]): void;
  invalidateWorkspaceKeys(workspaceKeys: string[]): void;
  clearAll(): void;
}

/* —— store 内部助手（本 chunk；声明为 stub，行号见注释） —— */
/** 原 Xie（js 1532）：并入新结果时保留 fetchedAt 之后更新的旧键 */
declare function reconcileIncomingTaskKeys(args: {
  incomingTaskKeys: string[];
  previousResult: QueryResult | null | undefined;
  taskMetaByEntityKey: Record<string, TaskMeta>;
  descriptor: QueryDescriptor;
}): { taskKeys: string[]; preservedCount: number };
/** 原 Jie（js 1479）：新旧任务元数据合并（标题/摘要/模型/未读覆盖/片段保留） */
declare function mergeIncomingTaskMeta(args: {
  item: TaskMeta;
  existingItem: TaskMeta | undefined;
  descriptor: QueryDescriptor;
  hasUnreadOverlay: boolean;
  unreadAtOverlay: number | null | undefined;
}): TaskMeta;
/** 原 Yie（js 1510）：结果无变化判定（避免无谓 setState） */
declare function isQueryResultUnchanged(args: {
  previousResult: QueryResult | null | undefined;
  taskKeys: string[];
  unreadTaskKeys?: string[];
  searchSnippetsByTaskKey?: Record<string, string>;
  searchSnippetListsByTaskKey?: Record<string, string[]>;
  total: number;
  hasMore: boolean;
  partial: boolean;
  loadingShardKeys: string[];
  failedShardKeys: string[];
}): boolean;
/** 原 Uie（js 1414）：结果落库整形（fetchedAt/stale=false 等） */
declare function finalizeQueryResult(result: Omit<QueryResult, "fetchedAt" | "stale" | "partial" | "loadingShardKeys" | "failedShardKeys"> & Partial<QueryResult>): QueryResult;
/** 原 Bo（js 1453）：按描述符排序任务键 */
declare function sortTaskKeys(args: { taskKeys: string[]; taskMetaByEntityKey: Record<string, TaskMeta>; descriptor: QueryDescriptor }): string[];
/** 原 Kie（js 1449）：任务是否属于描述符（工作区+成员+搜索词） */
declare function descriptorMatchesTask(descriptor: QueryDescriptor, task: TaskMeta, membership: { pinned: boolean; archived: boolean }): boolean;
/** 原 Mo（js 1311）：读取 __zcodeSessionActivity */
/** 原 Po（js 1324）：以会话活动为准合并元数据 */
declare function mergeWithSessionActivity(base: TaskMeta, patch: TaskMeta): TaskMeta;

/** A1-R8 普查裁决 / A1-R9 收敛完成：bundle 唯一 Vo（@1553）。树内两并行实例：
 * 本文件 1254 区（live：1745 行 useSearchResultsStore(selectQueryResult(queryKey))
 * = bundle 35831–35833 钩子簇；modules/QuickPick 176 行 re-export → QuickPickDeep
 * 131 行终端消费）与 stores/searchResultsStore.ts 78（休眠：仅 stores-session
 * 74–79 行 shim 链，零终端拉取）。canonical 裁决 = 本实例；R9 先裁决模块级助手
 * 型缝（helpers.TaskMeta.changeSummary string 面 → 按 bundle 23754 / np@6874 真形
 * 精化为对象面，见 stores/searchResultsHelpers.ts 宽化注），stores/ 侧已降 shim
 * （证据链见其头注；原实现见 git 历史，检查点 34f0240）。 */
export const useSearchResultsStore = createZustandStore<SearchResultsState>((set) => ({
  resultsByQueryKey: {},
  taskMetaByEntityKey: {},
  taskUnreadOverlayByEntityKey: {},
  setQueryResult: ({ queryKey, descriptor, items, total, hasMore, unreadTaskKeys, partial, loadingShardKeys, failedShardKeys }) =>
    set((state) => {
      const nextMeta = { ...state.taskMetaByEntityKey };
      let metaChanged = false;
      let unreadOverlayChanged = false;
      const nextUnreadOverlay = { ...state.taskUnreadOverlayByEntityKey };
      const snippetsByTaskKey: Record<string, string> = {};
      const snippetListsByTaskKey: Record<string, string[]> = {};
      const { taskKeys, preservedCount } = reconcileIncomingTaskKeys({
        incomingTaskKeys: items.map((item) => {
          const entityKey = taskEntityKey(item);
          if (item.searchSnippet) snippetsByTaskKey[entityKey] = item.searchSnippet;
          if (item.searchSnippets?.length) snippetListsByTaskKey[entityKey] = item.searchSnippets;
          const existing = nextMeta[entityKey];
          const hasUnreadOverlay = Object.prototype.hasOwnProperty.call(state.taskUnreadOverlayByEntityKey, entityKey);
          const unreadOverlay = state.taskUnreadOverlayByEntityKey[entityKey];
          const merged = mergeIncomingTaskMeta({ item, existingItem: existing, descriptor, hasUnreadOverlay, unreadAtOverlay: unreadOverlay });
          if (hasUnreadOverlay && (unreadOverlay === null ? typeof item.unreadAt != "number" : item.unreadAt === unreadOverlay)) {
            delete nextUnreadOverlay[entityKey];
            unreadOverlayChanged = true;
          }
          if (merged !== existing) {
            metaChanged = true;
            nextMeta[entityKey] = merged;
          }
          return entityKey;
        }),
        previousResult: state.resultsByQueryKey[queryKey],
        taskMetaByEntityKey: nextMeta,
        descriptor,
      });
      const result: Omit<QueryResult, "fetchedAt" | "stale" | "partial" | "loadingShardKeys" | "failedShardKeys"> & Partial<QueryResult> = {
        descriptor,
        taskKeys,
        unreadTaskKeys,
        searchSnippetsByTaskKey: Object.keys(snippetsByTaskKey).length > 0 ? snippetsByTaskKey : undefined,
        searchSnippetListsByTaskKey: Object.keys(snippetListsByTaskKey).length > 0 ? snippetListsByTaskKey : undefined,
        total: preservedCount > 0 ? Math.max(total, state.resultsByQueryKey[queryKey]?.total ?? 0, taskKeys.length) : total,
        hasMore: hasMore || (preservedCount > 0 && Math.max(total, state.resultsByQueryKey[queryKey]?.total ?? 0, taskKeys.length) > taskKeys.length),
        partial,
        loadingShardKeys,
        failedShardKeys,
        invalidationVersion: state.resultsByQueryKey[queryKey]?.invalidationVersion ?? 0,
      };
      if (
        !metaChanged &&
        !unreadOverlayChanged &&
        isQueryResultUnchanged({
          previousResult: state.resultsByQueryKey[queryKey],
          taskKeys,
          unreadTaskKeys: result.unreadTaskKeys,
          searchSnippetsByTaskKey: result.searchSnippetsByTaskKey,
          searchSnippetListsByTaskKey: result.searchSnippetListsByTaskKey,
          total: result.total,
          hasMore: result.hasMore,
          partial: partial ?? false,
          loadingShardKeys: loadingShardKeys ?? [],
          failedShardKeys: failedShardKeys ?? [],
        })
      ) {
        return state;
      }
      return {
        resultsByQueryKey: { ...state.resultsByQueryKey, [queryKey]: finalizeQueryResult(result) },
        taskMetaByEntityKey: metaChanged ? nextMeta : state.taskMetaByEntityKey,
        taskUnreadOverlayByEntityKey: unreadOverlayChanged ? nextUnreadOverlay : state.taskUnreadOverlayByEntityKey,
      };
    }),
  setQueryResults: (batch) =>
    set((state) => {
      if (batch.length === 0) return state;
      const nextMeta = { ...state.taskMetaByEntityKey };
      let metaChanged = false;
      let unreadOverlayChanged = false;
      const nextUnreadOverlay = { ...state.taskUnreadOverlayByEntityKey };
      const nextResults = { ...state.resultsByQueryKey };
      let resultsChanged = false;
      for (const entry of batch) {
        const previous = state.resultsByQueryKey[entry.queryKey];
        const invalidationVersion = previous?.invalidationVersion ?? 0;
        if (entry.expectedInvalidationVersion !== undefined && entry.expectedInvalidationVersion !== invalidationVersion) continue;
        const snippetsByTaskKey: Record<string, string> = {};
        const snippetListsByTaskKey: Record<string, string[]> = {};
        const { taskKeys, preservedCount } = reconcileIncomingTaskKeys({
          incomingTaskKeys: entry.items.map((item) => {
            const entityKey = taskEntityKey(item);
            if (item.searchSnippet) snippetsByTaskKey[entityKey] = item.searchSnippet;
            if (item.searchSnippets?.length) snippetListsByTaskKey[entityKey] = item.searchSnippets;
            const existing = nextMeta[entityKey];
            const hasUnreadOverlay = Object.prototype.hasOwnProperty.call(state.taskUnreadOverlayByEntityKey, entityKey);
            const unreadOverlay = state.taskUnreadOverlayByEntityKey[entityKey];
            const merged = mergeIncomingTaskMeta({
              item,
              existingItem: existing,
              descriptor: entry.descriptor,
              hasUnreadOverlay,
              unreadAtOverlay: unreadOverlay,
            });
            if (hasUnreadOverlay && (unreadOverlay === null ? typeof item.unreadAt != "number" : item.unreadAt === unreadOverlay)) {
              delete nextUnreadOverlay[entityKey];
              unreadOverlayChanged = true;
            }
            if (merged !== existing) {
              metaChanged = true;
              nextMeta[entityKey] = merged;
            }
            return entityKey;
          }),
          previousResult: previous,
          taskMetaByEntityKey: nextMeta,
          descriptor: entry.descriptor,
        });
        const result: Omit<QueryResult, "fetchedAt" | "stale" | "partial" | "loadingShardKeys" | "failedShardKeys"> & Partial<QueryResult> = {
          descriptor: entry.descriptor,
          taskKeys,
          unreadTaskKeys: entry.unreadTaskKeys,
          searchSnippetsByTaskKey: Object.keys(snippetsByTaskKey).length > 0 ? snippetsByTaskKey : undefined,
          searchSnippetListsByTaskKey: Object.keys(snippetListsByTaskKey).length > 0 ? snippetListsByTaskKey : undefined,
          total: preservedCount > 0 ? Math.max(entry.total, previous?.total ?? 0, taskKeys.length) : entry.total,
          hasMore: entry.hasMore || (preservedCount > 0 && Math.max(entry.total, previous?.total ?? 0, taskKeys.length) > taskKeys.length),
          partial: entry.partial,
          loadingShardKeys: entry.loadingShardKeys,
          failedShardKeys: entry.failedShardKeys,
          invalidationVersion,
        };
        if (
          !isQueryResultUnchanged({
            previousResult: previous,
            taskKeys,
            unreadTaskKeys: result.unreadTaskKeys,
            searchSnippetsByTaskKey: result.searchSnippetsByTaskKey,
            searchSnippetListsByTaskKey: result.searchSnippetListsByTaskKey,
            total: result.total,
            hasMore: result.hasMore,
            partial: entry.partial ?? false,
            loadingShardKeys: entry.loadingShardKeys ?? [],
            failedShardKeys: entry.failedShardKeys ?? [],
          })
        ) {
          resultsChanged = true;
          nextResults[entry.queryKey] = finalizeQueryResult(result);
        }
      }
      if (!metaChanged && !resultsChanged && !unreadOverlayChanged) return state;
      return {
        resultsByQueryKey: resultsChanged ? nextResults : state.resultsByQueryKey,
        taskMetaByEntityKey: metaChanged ? nextMeta : state.taskMetaByEntityKey,
        taskUnreadOverlayByEntityKey: unreadOverlayChanged ? nextUnreadOverlay : state.taskUnreadOverlayByEntityKey,
      };
    }),
  upsertTaskMeta: (task) =>
    set((state) => {
      const entityKey = taskEntityKey(task);
      const existing = state.taskMetaByEntityKey[entityKey];
      const merged = mergeTaskMeta(task, existing) ?? task;
      const next = sessionActivityOf(task) ? mergeWithSessionActivity(task, merged) : existing ? mergeWithSessionActivity(existing, merged) : merged;
      return { ...state, taskMetaByEntityKey: { ...state.taskMetaByEntityKey, [entityKey]: next } };
    }),
  updateTaskMetaPreservingMembership: (task) =>
    set((state) => {
      const entityKey = taskEntityKey(task);
      const existing = state.taskMetaByEntityKey[entityKey];
      const merged = mergeTaskMeta(task, existing) ?? task;
      const next = existing ? mergeWithSessionActivity(existing, merged) : merged;
      const nextMeta = { ...state.taskMetaByEntityKey, [entityKey]: next };
      const nextResults = { ...state.resultsByQueryKey };
      for (const [queryKey, result] of Object.entries(state.resultsByQueryKey)) {
        if (result.taskKeys.includes(entityKey)) {
          nextResults[queryKey] = {
            ...result,
            taskKeys: sortTaskKeys({ taskKeys: result.taskKeys, taskMetaByEntityKey: nextMeta, descriptor: result.descriptor }),
          };
        }
      }
      return { resultsByQueryKey: nextResults, taskMetaByEntityKey: nextMeta };
    }),
  applyTaskMutation: ({ previousTask, nextTask, previousState, nextState }) =>
    set((state) => {
      const previousKey = taskEntityKey(previousTask);
      const nextKey = taskEntityKey(nextTask);
      const known = state.taskMetaByEntityKey[nextKey] ?? state.taskMetaByEntityKey[previousKey];
      const merged = known ? mergeWithSessionActivity(known, nextTask) : nextTask;
      const nextMeta = { ...state.taskMetaByEntityKey, [nextKey]: merged };
      if (previousKey !== nextKey) delete nextMeta[previousKey];
      const nextResults = { ...state.resultsByQueryKey };
      for (const [queryKey, result] of Object.entries(state.resultsByQueryKey)) {
        if (result.descriptor.search) {
          // 搜索结果无法本地推断成员变化 → 标记失效等待重取
          nextResults[queryKey] = { ...result, invalidationVersion: result.invalidationVersion + 1, stale: true };
          continue;
        }
        const wasMember = descriptorMatchesTask(result.descriptor, previousTask, previousState);
        const isMember = descriptorMatchesTask(result.descriptor, nextTask, nextState);
        const touched = result.taskKeys.includes(previousKey) || result.taskKeys.includes(nextKey);
        if (!wasMember && !isMember && !touched) continue;
        const remaining = result.taskKeys.filter((key) => key !== previousKey && key !== nextKey);
        const remainingUnread = (result.unreadTaskKeys ?? []).filter((key) => key !== previousKey && key !== nextKey);
        const taskKeys = isMember ? [...remaining, nextKey] : remaining;
        const unreadTaskKeys = isMember && typeof merged.unreadAt == "number" ? [...remainingUnread, nextKey] : remainingUnread;
        const sorted = sortTaskKeys({ taskKeys, taskMetaByEntityKey: nextMeta, descriptor: result.descriptor });
        const visible = result.descriptor.visibleLimit === null ? sorted : sorted.slice(0, result.descriptor.visibleLimit);
        const total = Math.max(0, result.total + Number(isMember) - Number(wasMember));
        const becameStale = result.descriptor.visibleLimit !== null && wasMember !== isMember && total > visible.length;
        nextResults[queryKey] = {
          ...result,
          taskKeys: visible,
          ...(result.unreadTaskKeys ? { unreadTaskKeys } : {}),
          total,
          hasMore: total > visible.length,
          stale: result.stale || becameStale,
        };
      }
      return { resultsByQueryKey: nextResults, taskMetaByEntityKey: nextMeta };
    }),
  setTaskUnreadOverlay: (task, unreadAt) =>
    set((state) => {
      const entityKey = taskEntityKey(task);
      const existing = state.taskMetaByEntityKey[entityKey];
      return {
        taskUnreadOverlayByEntityKey: { ...state.taskUnreadOverlayByEntityKey, [entityKey]: unreadAt ?? null },
        taskMetaByEntityKey: existing ? { ...state.taskMetaByEntityKey, [entityKey]: { ...existing, unreadAt } } : state.taskMetaByEntityKey,
      };
    }),
  reconcileTaskUnread: (task, unreadAt) =>
    set((state) => {
      const entityKey = taskEntityKey(task);
      const existing = state.taskMetaByEntityKey[entityKey];
      return {
        taskUnreadOverlayByEntityKey: { ...state.taskUnreadOverlayByEntityKey, [entityKey]: unreadAt ?? null },
        taskMetaByEntityKey: existing ? { ...state.taskMetaByEntityKey, [entityKey]: { ...existing, unreadAt } } : state.taskMetaByEntityKey,
      };
    }),
  rollbackTaskUnread: (task, unreadAt) =>
    set((state) => {
      const entityKey = taskEntityKey(task);
      const existing = state.taskMetaByEntityKey[entityKey];
      const nextUnreadOverlay = { ...state.taskUnreadOverlayByEntityKey };
      delete nextUnreadOverlay[entityKey];
      return {
        taskUnreadOverlayByEntityKey: nextUnreadOverlay,
        taskMetaByEntityKey: existing ? { ...state.taskMetaByEntityKey, [entityKey]: { ...existing, unreadAt } } : state.taskMetaByEntityKey,
      };
    }),
  removeTask: (task) => {
    let removed = false;
    set((state) => {
      const entityKey = taskEntityKey(task);
      if (!state.taskMetaByEntityKey[entityKey] && !Object.values(state.resultsByQueryKey).some((result) => result.taskKeys.includes(entityKey))) {
        return state;
      }
      const nextMeta = { ...state.taskMetaByEntityKey };
      delete nextMeta[entityKey];
      const nextUnreadOverlay = { ...state.taskUnreadOverlayByEntityKey };
      delete nextUnreadOverlay[entityKey];
      const nextResults: Record<string, QueryResult> = {};
      for (const [queryKey, result] of Object.entries(state.resultsByQueryKey)) {
        if (!result.taskKeys.includes(entityKey)) {
          nextResults[queryKey] = result;
          continue;
        }
        const taskKeys = result.taskKeys.filter((key) => key !== entityKey);
        removed = true;
        const total = Math.max(0, result.total - 1);
        nextResults[queryKey] = { ...result, taskKeys, total, hasMore: total > taskKeys.length };
      }
      return { resultsByQueryKey: nextResults, taskMetaByEntityKey: nextMeta, taskUnreadOverlayByEntityKey: nextUnreadOverlay };
    });
    return removed;
  },
  markWorkspaceKeysStale: (workspaceKeys) =>
    set((state) => {
      if (workspaceKeys.length === 0) return state;
      const staleSet = new Set(workspaceKeys);
      const nextResults = { ...state.resultsByQueryKey };
      let changed = false;
      for (const [queryKey, result] of Object.entries(state.resultsByQueryKey)) {
        if (result.descriptor.workspaceKeys.some((key) => staleSet.has(key))) {
          nextResults[queryKey] = { ...result, invalidationVersion: result.invalidationVersion + 1, stale: true };
          changed = true;
        }
      }
      return changed ? { resultsByQueryKey: nextResults } : state;
    }),
  invalidateWorkspaceKeys: (workspaceKeys) =>
    set((state) => {
      if (workspaceKeys.length === 0) return state;
      const removedSet = new Set(workspaceKeys);
      return {
        resultsByQueryKey: Object.fromEntries(
          Object.entries(state.resultsByQueryKey).filter(([queryKey]) => ![...removedSet].some((key) => queryKey.includes(`workspaces=${key}`) || queryKey.includes(`|${key}`))),
        ),
        taskMetaByEntityKey: Object.fromEntries(
          Object.entries(state.taskMetaByEntityKey).filter(([entityKey]) => {
            const workspacePart = entityKey.split(`::`)[0] ?? "";
            return !removedSet.has(workspacePart);
          }),
        ),
      };
    }),
  clearAll: () => set(() => ({ resultsByQueryKey: {}, taskMetaByEntityKey: {}, taskUnreadOverlayByEntityKey: {} })),
}));

/** 原 Zie（js 1878）：按 queryKey 选择缓存结果 */
export function selectQueryResult(queryKey: string): (state: SearchResultsState) => QueryResult | null {
  return (state) => state.resultsByQueryKey[queryKey] ?? null;
}

/* ============================================================================
 * 10. useGlobalTaskList（原 ZS，js 35727–36070 / jsx 32810）
 *     跨工作区（分片）任务列表/搜索：缓存优先（Vo），随后逐 shard 请求
 *     zcodeTaskService.listTaskList 并增量合并；订阅 workspace_task_list_changed。
 * ==========================================================================*/

/** 原 uje（js 35708–35726）：合并各 shard 结果（去重、排序、截断） */
export function mergeTaskListShards(args: {
  results: Array<{ shardKey: string; items: TaskMeta[]; total: number }>;
  sortBy: TaskSortBy;
  expanded: boolean;
  collapsedLimit: number;
  loadingShardKeys?: string[];
  failedShardKeys?: string[];
}): { items: TaskMeta[]; total: number; hasMore: boolean; partial: boolean; loadingShardKeys: string[]; failedShardKeys: string[] } {
  const byKey = new Map<string, TaskMeta>();
  let total = 0;
  for (const shard of args.results) {
    total += shard.total;
    for (const item of shard.items) byKey.set(taskEntityKey(item), item);
  }
  const sorted = [...byKey.values()].sort((a, b) => compareTasksForList(a, b, args.sortBy));
  const items = args.expanded ? sorted : sorted.slice(0, args.collapsedLimit);
  return {
    items,
    total,
    hasMore: total > items.length,
    partial: (args.loadingShardKeys?.length ?? 0) > 0 || (args.failedShardKeys?.length ?? 0) > 0,
    loadingShardKeys: args.loadingShardKeys ?? [],
    failedShardKeys: args.failedShardKeys ?? [],
  };
}

/* ── tombstone（A1-R10 2e）：declare function compareTasksForList（原 Fo，js 1365）删除，
 *    改经文件头 StoresDeep import 消费（canonical = helpers compareTasks 逐字）。 ── */

interface TaskListShard {
  shardKey: string;
  services: TaskListShardServices;
  workspaceScopes: WorkspaceScope[];
}

export interface UseGlobalTaskListArgs {
  kind: TaskListKind;
  workspaceTabs: WorkspaceTab[];
  sortBy: TaskSortBy;
  searchQuery: string;
  expanded: boolean;
  collapsedLimit: number;
}

export interface UseGlobalTaskListResult {
  items: TaskMeta[];
  total: number;
  hasMore: boolean;
  loading: boolean;
  syncingRemoteWorkspaces: boolean;
  refresh: () => Promise<void>;
}

/* —— 深部助手（本 chunk，行号见注释；接口级 stub） —— */
declare function normalizeWorkspaceScopes(tabs: WorkspaceTab[]): WorkspaceScope[]; // 原 oje（35647）
declare function resolveTaskListShards(
  tabs: WorkspaceTab[],
  baseServices: TaskListShardServices,
  registry: { sessionsById: Record<string, unknown>; sessionIdByWorkspaceIdentity: Record<string, string>; sessionIdByWorkspacePath: Record<string, string> },
): { shards: TaskListShard[]; missingSessionIds: string[] }; // 原 sje（35652）
/* ── tombstone（A1-R10）：buildQueryDescriptor（原 zie，js 1385）/buildQueryKey（原 Bie，js 1396）
 *    declare 删除，改经文件头 stores/searchResultsHelpers import 消费
 *    （canonical = normalizeSearchDescriptor/descriptorCacheKey，R9 逐字转录在案）。 ── */
declare function reusePreviousResult(snapshot: { descriptor: QueryDescriptor; items: TaskMeta[]; total: number; hasMore: boolean }, descriptor: QueryDescriptor): { items: TaskMeta[]; total: number; hasMore: boolean } | null; // 原 cje（35682）
declare function subscribeWorkspaceTaskList(args: {
  service: ZCodeTaskService;
  scope: WorkspaceScope;
  listener: (event: WorkspaceTaskListEvent) => void;
}): { dispose(): void }; // 原 aje（35615）
interface WorkspaceTaskListEvent {
  type: string;
  reason?: string;
  workspacePath: string;
  workspaceIdentity?: string | null;
  taskId?: string;
  taskMeta?: TaskMeta;
  unreadSignal?: string;
  [key: string]: unknown;
}
declare function useTaskMembershipVersion(): number; // 原 dx（32279）：成员变化计数（useSyncExternalStore）
/* ── tombstone〔A1-R129e〕useHydratingSessions（原 JS@35552）declare 删除 → 改指 ../shell/TaskListQueryCore::useHydratingSessions@77
 *    （A1-P3-B1 逐字转录；消费 @1736 解构 items/hydratingEndpointKeys 逐字不变；SidebarLeaves 孪生 declare 同批销账）。 ── */
declare function readTaskSnapshotCache(args: { cacheKey: string; endpoints: Array<{ service: ZCodeTaskService; scopes: WorkspaceScope[] }> }): Promise<{
  taskIndexItems: TaskMeta[];
  pinnedIds: string[];
  archivedIds: string[];
  deletedIds: string[];
  unreadAtByTaskId: Record<string, number>;
  terminalStatusByTaskId: Record<string, string>;
  titleOverrideByTaskId: Record<string, string>;
  cronAutomationIdByTaskId: Record<string, string>;
}>; // 原 Ex（32488）
declare function buildTaskListFromSnapshot(args: {
  taskIndexItems: TaskMeta[];
  sessions: Array<Record<string, unknown>>;
  kind: TaskListKind;
  pinnedIds: string[];
  archivedIds: string[];
  deletedIds: string[];
  unreadAtByTaskId: Record<string, number>;
  terminalStatusByTaskId: Record<string, string>;
  titleOverrideByTaskId: Record<string, string>;
  cronAutomationIdByTaskId: Record<string, string>;
  sortBy: TaskSortBy;
  limit?: number;
}): { items: TaskMeta[]; total: number }; // 原 Ox（32600）
declare function syncTaskStatusUnread(args: { event: WorkspaceTaskListEvent; service: ZCodeTaskService }): void; // 原 px（32316）
declare function isOptimisticMembershipEvent(event: WorkspaceTaskListEvent): boolean; // 原 rx（32217）
declare function applyOptimisticMembershipEvent(event: WorkspaceTaskListEvent): void; // 原 ux（32260）
declare function hasOptimisticTaskMeta(event: WorkspaceTaskListEvent): boolean; // 原 sOe（32237）
declare function isOptimisticCoveredEvent(event: WorkspaceTaskListEvent): boolean; // 原 oOe（32225）
declare function applyRuntimeStateFromTaskMeta(taskMeta: TaskMeta): void; // 原 lje（35697）

export function useGlobalTaskList(args: UseGlobalTaskListArgs): UseGlobalTaskListResult {
  const baseServices = useBaseServices();
  const sessionsById = useSessionRegistryStore((state) => state.sessionsById);
  const sessionIdByWorkspaceIdentity = useSessionRegistryStore((state) => state.sessionIdByWorkspaceIdentity);
  const sessionIdByWorkspacePath = useSessionRegistryStore((state) => state.sessionIdByWorkspacePath);
  const registry = React.useMemo(
    () => ({ sessionsById, sessionIdByWorkspaceIdentity, sessionIdByWorkspacePath }),
    [sessionIdByWorkspaceIdentity, sessionIdByWorkspacePath, sessionsById],
  );
  // 任务列表版本号（变化即触发重取）
  const taskListVersion = useTaskStore((state) =>
    args.workspaceTabs
      .map((tab) => {
        const workspaceState = getWorkspaceState(state, tab.workspacePath, tab.workspaceIdentity);
        return `${tab.workspacePath}:${tab.workspaceIdentity ?? ""}:${workspaceState.taskListVersion}`;
      })
      .join("|"),
  );
  const workspaceScopes = React.useMemo(() => normalizeWorkspaceScopes(args.workspaceTabs), [args.workspaceTabs]);
  const { shards, missingSessionIds } = React.useMemo(
    () => resolveTaskListShards(args.workspaceTabs, baseServices as unknown as TaskListShardServices, registry), // A0-CLEANUP3 3b：BaseServices 收敛后与本地 TaskListShardServices 不重叠，边界双断言
    [baseServices, args.workspaceTabs, registry],
  );
  const isBrowseMode = args.searchQuery.trim() === "";
  // 浏览态：从会话索引水合（无搜索词时）
  const hydrationScopes = React.useMemo(
    () =>
      isBrowseMode
        ? shards.flatMap((shard) =>
            shard.workspaceScopes.map((scope) => ({
              workspacePath: scope.workspacePath,
              ...(scope.workspaceIdentity ? { workspaceIdentity: scope.workspaceIdentity } : {}),
              ...(shard.shardKey === "__base__" ? {} : { endpointKey: shard.shardKey }),
              agentService: (shard.services as { zcodeAgentService?: unknown }).zcodeAgentService,
            })),
          )
        : [],
    [isBrowseMode, shards],
  );
  const { items: hydratingSessions, hydratingEndpointKeys } = useHydratingSessions(hydrationScopes);
  const shardEndpoints = React.useMemo(() => shards.map((shard) => ({ service: shard.services.zcodeTaskService, scopes: shard.workspaceScopes })), [shards]);
  const membershipVersion = useTaskMembershipVersion();
  const descriptor = React.useMemo(
    () =>
      buildQueryDescriptor({
        kind: args.kind,
        workspaceScopes,
        sortBy: args.sortBy,
        search: args.searchQuery,
        expanded: args.expanded,
        visibleLimit: args.collapsedLimit,
      }),
    [args.collapsedLimit, args.expanded, args.kind, args.searchQuery, args.sortBy, workspaceScopes],
  );
  const queryKey = React.useMemo(() => buildQueryKey(descriptor) + `::version=${taskListVersion}`, [descriptor, taskListVersion]);
  const cachedResult = useSearchResultsStore(selectQueryResult(queryKey));
  const taskMetaByEntityKey = useSearchResultsStore((state) => state.taskMetaByEntityKey);
  const setQueryResult = useSearchResultsStore((state) => state.setQueryResult);
  const [loading, setLoading] = React.useState(() => workspaceScopes.length > 0 && (cachedResult === null || !!cachedResult.stale));
  const requestTokenRef = React.useRef<string | null>(null);
  const scopesKey = React.useMemo(
    () => workspaceScopes.map((scope) => `${scope.workspaceIdentity?.trim() || scope.workspacePath}::${scope.workspacePath}`).join("|"),
    [workspaceScopes],
  );
  const shardsKey = React.useMemo(
    () =>
      shards
        .map((shard) => `${shard.shardKey}:${shard.workspaceScopes.map((scope) => workspaceKey(scope.workspacePath, scope.workspaceIdentity)).join("|")}`)
        .join("||"),
    [shards],
  );
  const allShardKeys = React.useMemo(() => new Set(shards.map((shard) => shard.shardKey)), [shards]);
  const remoteShardKeys = React.useMemo(() => new Set(shards.map((shard) => shard.shardKey).filter((key) => key !== "__base__")), [shards]);
  const missingKey = React.useMemo(() => missingSessionIds.join("|"), [missingSessionIds]);
  const cachedItems = React.useMemo(
    () =>
      cachedResult
        ? cachedResult.taskKeys
            .map((key) => {
              const meta = taskMetaByEntityKey[key];
              const snippet = cachedResult.searchSnippetsByTaskKey?.[key];
              const snippetList = cachedResult.searchSnippetListsByTaskKey?.[key];
              return meta && (snippet || snippetList) ? { ...meta, searchSnippet: snippet, searchSnippets: snippetList } : meta;
            })
            .filter((item): item is TaskMeta => !!item)
        : [],
    [cachedResult, taskMetaByEntityKey],
  );
  const lastSnapshotRef = React.useRef<{ descriptor: QueryDescriptor; items: TaskMeta[]; total: number; hasMore: boolean } | null>(null);
  // 缓存未命中但描述符兼容时，复用上一次的内存快照避免闪烁
  const reused = !cachedResult && lastSnapshotRef.current ? reusePreviousResult(lastSnapshotRef.current, descriptor) : null;
  const items = reused?.items ?? cachedItems;
  const total = reused?.total ?? cachedResult?.total ?? 0;
  const hasMore = reused?.hasMore ?? cachedResult?.hasMore ?? false;
  React.useEffect(() => {
    if (cachedResult) {
      lastSnapshotRef.current = { descriptor: cachedResult.descriptor, items: cachedItems, total: cachedResult.total, hasMore: cachedResult.hasMore };
    }
  }, [cachedItems, cachedResult]);
  const refresh = React.useCallback(async () => {
    if (workspaceScopes.length === 0) {
      setLoading(false);
      return;
    }
    if (isBrowseMode) return;
    const token = `${queryKey}::endpoints=${shardsKey}::missing=${missingKey}`;
    if (requestTokenRef.current === token) return;
    requestTokenRef.current = token;
    setLoading(true);
    const shardResults = new Map<string, { shardKey: string; items: TaskMeta[]; total: number }>();
    const failedShardKeys = new Set<string>();
    const pendingShardKeys = new Set(shards.map((shard) => shard.shardKey));
    const knownShardKeys = new Set([...shards.map((shard) => shard.shardKey), ...missingSessionIds]);
    const stillLoading = () => [...knownShardKeys].some((key) => pendingShardKeys.has(key)) || failedShardKeys.size > 0;
    const flush = () => {
      if (shardResults.size === 0 && items.length > 0) {
        setQueryResult({
          queryKey,
          descriptor,
          items,
          total,
          hasMore,
          partial: knownShardKeys.size > 0 || failedShardKeys.size > 0,
          loadingShardKeys: [...knownShardKeys],
          failedShardKeys: [...failedShardKeys],
        });
        setLoading(stillLoading());
        return;
      }
      const merged = mergeTaskListShards({
        results: [...shardResults.values()],
        sortBy: args.sortBy,
        expanded: args.expanded,
        collapsedLimit: args.collapsedLimit,
        loadingShardKeys: [...knownShardKeys],
        failedShardKeys: [...failedShardKeys],
      });
      setQueryResult({
        queryKey,
        descriptor,
        items: merged.items,
        total: merged.total,
        hasMore: merged.hasMore,
        partial: merged.partial,
        loadingShardKeys: merged.loadingShardKeys,
        failedShardKeys: merged.failedShardKeys,
      });
      setLoading(stillLoading());
    };
    flush();
    if (shards.length === 0) {
      if (requestTokenRef.current === token) requestTokenRef.current = null;
      setLoading(false);
      return;
    }
    await Promise.allSettled(
      shards.map(async (shard) => {
        try {
          const response = await shard.services.zcodeTaskService.listTaskList({
            kind: args.kind,
            workspaceScopes: shard.workspaceScopes,
            sortBy: args.sortBy,
            search: args.searchQuery.trim() || undefined,
            limit: args.expanded ? undefined : args.collapsedLimit,
          });
          if (requestTokenRef.current !== token) return;
          shardResults.set(shard.shardKey, { shardKey: shard.shardKey, items: response.items, total: response.total });
        } catch (error) {
          if (requestTokenRef.current !== token) return;
          failedShardKeys.add(shard.shardKey);
          logger.error(`[useGlobalTaskList] 加载 ${args.kind} task 列表 shard=${shard.shardKey} 失败`, error);
        } finally {
          if (requestTokenRef.current === token) {
            knownShardKeys.delete(shard.shardKey);
            flush();
          }
        }
      }),
    );
    if (requestTokenRef.current === token) {
      requestTokenRef.current = null;
      setLoading(false);
    }
  }, [
    args.collapsedLimit,
    args.expanded,
    args.kind,
    args.searchQuery,
    args.sortBy,
    shardsKey,
    shards,
    missingSessionIds,
    missingKey,
    descriptor,
    queryKey,
    setQueryResult,
    hasMore,
    items,
    total,
    workspaceScopes,
    isBrowseMode,
  ]);
  // —— 浏览态：tasks-index 缓存水合（原 35936–36008 效果簇） ——
  const hydrationScopesRef = React.useRef(hydrationScopes);
  hydrationScopesRef.current = hydrationScopes;
  const shardEndpointsRef = React.useRef(shardEndpoints);
  shardEndpointsRef.current = shardEndpoints;
  const hydratingKeysRef = React.useRef(hydratingEndpointKeys);
  hydratingKeysRef.current = hydratingEndpointKeys;
  const descriptorRef = React.useRef(descriptor);
  descriptorRef.current = descriptor;
  const snapshotRef = React.useRef({ items, total, hasMore });
  snapshotRef.current = { items, total, hasMore };
  const hydrationCacheRef = React.useRef<{ key: string; items: Array<Record<string, unknown>> } | null>(null);
  const hydrationKey = `${queryKey}::membership=${membershipVersion}::hydrating=${hydratingEndpointKeys.join(",")}`;
  React.useEffect(() => {
    if (!isBrowseMode) return;
    if (hydrationScopesRef.current.length === 0) {
      if (workspaceScopes.length > 0) setLoading(false);
      return;
    }
    const previous = hydrationCacheRef.current;
    if (previous && previous.key === hydrationKey && previous.items === hydratingSessions) return;
    hydrationCacheRef.current = { key: hydrationKey, items: hydratingSessions };
    let cancelled = false;
    (async () => {
      try {
        const snapshot = await readTaskSnapshotCache({ cacheKey: `${membershipVersion}::tasks=${taskListVersion}::${shardsKey}`, endpoints: shardEndpointsRef.current });
        if (cancelled) return;
        const pendingKeys = hydratingKeysRef.current;
        if (pendingKeys.length > 0 && snapshotRef.current.items.length > 0) {
          setQueryResult({
            queryKey,
            descriptor: descriptorRef.current,
            items: snapshotRef.current.items,
            total: snapshotRef.current.total,
            hasMore: snapshotRef.current.hasMore,
            partial: true,
            loadingShardKeys: pendingKeys,
            failedShardKeys: [],
          });
          setLoading(true);
          return;
        }
        const built = buildTaskListFromSnapshot({
          taskIndexItems: snapshot.taskIndexItems,
          sessions: hydratingSessions,
          kind: args.kind,
          pinnedIds: snapshot.pinnedIds,
          archivedIds: snapshot.archivedIds,
          deletedIds: snapshot.deletedIds,
          unreadAtByTaskId: snapshot.unreadAtByTaskId,
          terminalStatusByTaskId: snapshot.terminalStatusByTaskId,
          titleOverrideByTaskId: snapshot.titleOverrideByTaskId,
          cronAutomationIdByTaskId: snapshot.cronAutomationIdByTaskId,
          sortBy: args.sortBy,
          ...(args.expanded ? {} : { limit: args.collapsedLimit }),
        });
        setQueryResult({
          queryKey,
          descriptor: descriptorRef.current,
          items: built.items,
          total: built.total,
          hasMore: !args.expanded && built.total > built.items.length,
          partial: pendingKeys.length > 0,
          loadingShardKeys: pendingKeys,
          failedShardKeys: [],
        });
        setLoading(pendingKeys.length > 0);
      } catch (error) {
        if (!cancelled) {
          logger.warn(`[useGlobalTaskList] 读取 tasks-index task 行失败，保留旧列表`, error);
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isBrowseMode, hydrationKey, membershipVersion, taskListVersion, shardsKey, hydratingSessions, args.kind, args.sortBy, args.expanded, args.collapsedLimit, queryKey, setQueryResult, workspaceScopes.length]);
  // —— 缓存失效/补齐与事件订阅（原 36009–36068） ——
  const refreshRef = React.useRef(refresh);
  const kindRef = React.useRef(args.kind);
  const shardsRef = React.useRef(shards);
  refreshRef.current = refresh;
  kindRef.current = args.kind;
  shardsRef.current = shards;
  React.useEffect(() => {
    if (workspaceScopes.length === 0) {
      setLoading(false);
      return;
    }
    if (cachedResult && !cachedResult.stale) {
      const missingSet = new Set(missingSessionIds);
      if ((cachedResult.loadingShardKeys ?? []).some((key) => !missingSet.has(key))) {
        refresh();
        return;
      }
      setLoading((cachedResult.loadingShardKeys ?? []).some((key) => allShardKeys.has(key)) || (cachedResult.failedShardKeys ?? []).length > 0);
      return;
    }
    refresh();
  }, [cachedResult, cachedItems, allShardKeys, shardsKey, missingSessionIds.length, missingKey, queryKey, refresh, scopesKey, workspaceScopes.length]);
  React.useEffect(() => {
    const currentShards = shardsRef.current;
    if (currentShards.length === 0) return;
    const subscriptions: Array<{ dispose(): void }> = [];
    for (const shard of currentShards) {
      for (const scope of shard.workspaceScopes) {
        const subscription = subscribeWorkspaceTaskList({
          service: shard.services.zcodeTaskService,
          scope,
          listener: (event) => {
            if (event.type === "workspace_task_list_changed") {
              syncTaskStatusUnread({ event, service: shard.services.zcodeTaskService });
              if (isOptimisticMembershipEvent(event)) applyOptimisticMembershipEvent(event);
              if (hasOptimisticTaskMeta(event)) applyRuntimeStateFromTaskMeta(event.taskMeta!);
              if (!isOptimisticCoveredEvent(event)) {
                logger.debug(
                  `[useGlobalTaskList] 跳过乐观更新已覆盖的列表刷新 kind=${kindRef.current} workspace=${scope.workspacePath} reason=${event.reason}`,
                );
                return;
              }
              logger.info(
                `[useGlobalTaskList] 收到 workspace_task_list_changed，触发列表刷新 kind=${kindRef.current} workspace=${scope.workspacePath} reason=${event.reason ?? "unknown"}`,
              );
              refreshRef.current();
            }
          },
        });
        subscriptions.push(subscription);
      }
    }
    return () => {
      for (const subscription of subscriptions) subscription.dispose();
    };
  }, [shardsKey]);
  return {
    items,
    total,
    hasMore,
    loading,
    syncingRemoteWorkspaces: cachedResult?.loadingShardKeys?.some((key) => remoteShardKeys.has(key)) ?? false,
    refresh,
  };
}

/* ============================================================================
 * 11. QuickPick 根组件（原 Rje，js 36439–36948 / jsx 33404）
 *     命令中心 = 命令面板（quickPick.*）+ 全局搜索（commandCenter.*）：
 *     - 输入行（搜索图标 + cmdk Input）
 *     - 范围 tab：全部/操作/任务/文件（前缀语法 >/#/@ 双向同步）
 *     - 有查询：命令段 + 任务搜索段 + 文件搜索段（all 视图段内折叠 3 条 + 「更多结果」）
 *     - 无查询：最近变更 + 最近任务 + 命令段（按当前 tab 切换）
 *     - 页脚：搜索历史胶囊（≤6 折叠，可展开/清空）
 * ==========================================================================*/

/** 类名常量（原 36170–36243，逐字保留） */
const COMMAND_DIALOG_BASE_CLASS = "top-1/2 max-w-lg -translate-y-1/2 overflow-hidden rounded-2xl! border-popover-border bg-popover p-0 shadow-md"; // 原 hje
const COMMAND_ROOT_CLASS = "rounded-2xl bg-popover p-0.5 text-foreground"; // 原 gje
const COMMAND_LIST_BASE_CLASS = "max-h-[min(460px,64vh)] py-0.5"; // 原 _je
const COMMAND_ITEM_CLASS = "min-h-8 items-center rounded-xl px-2.5 text-ui-base"; // 原 tC
const COMMAND_SHORTCUT_CLASS =
  "inline-flex h-4 min-w-7 items-center justify-center rounded-sm bg-surface px-1 py-0 font-sans text-ui-base leading-none tracking-normal text-foreground-subtle"; // 原 vje
const COMMAND_META_CLASS = "max-w-[45%] truncate font-sans text-ui-base leading-none tracking-normal text-foreground-subtle"; // 原 nC
const QUICK_PICK_DIALOG_CLASS = cn(
  COMMAND_DIALOG_BASE_CLASS,
  "top-16 max-h-[calc(100dvh-4.5rem)] -translate-y-0 sm:top-20 sm:max-h-[calc(100dvh-6rem)]",
  "platform-linux-desktop:top-16 sm:platform-linux-desktop:top-20",
); // 原 Eje
const QUICK_PICK_LIST_CLASS = cn(COMMAND_LIST_BASE_CLASS, "max-h-[min(440px,calc(100dvh-15rem))]"); // 原 Dje

const EMPTY_COMMANDS: QuickPickCommand[] = []; // 原 Cje
const EMPTY_TABS: WorkspaceTab[] = []; // 原 wje

export interface QuickPickProps {
  open: boolean;
  commands: QuickPickCommand[];
  workspaceAbsPath: string;
  workspaceIdentity?: string | null;
  activeTaskId?: string | null;
  /** 当前任务的变更摘要（无查询时的「最近变更」段） */
  activeTaskChangeSummary?: TaskChangeSummary | null;
  workspaceTabs: WorkspaceTab[];
  onOpenChange: (open: boolean) => void;
  onSelectTask: (workspacePath: string, taskId: string, workspaceIdentity?: string | null) => void;
  onSearchResultHighlightRequest?: (request: {
    taskId: string;
    workspacePath: string;
    workspaceIdentity?: string | null;
    query: string;
    snippet?: string;
    snippetIndex?: number;
  }) => void;
  onOpenCodeViewer: (request: { type: "file"; title: string; path: string }) => void;
}

export const QuickPick = React.memo(function QuickPick({
  open,
  commands,
  workspaceAbsPath,
  workspaceIdentity,
  activeTaskId,
  activeTaskChangeSummary,
  workspaceTabs,
  onOpenChange,
  onSelectTask,
  onSearchResultHighlightRequest,
  onOpenCodeViewer,
}: QuickPickProps) {
  const { fileService } = useServices() as unknown as { fileService: FileService }; // A0-D-Misc 类型收敛：BaseServices 索引签名为 unknown，按本族 FileService 投射；A0-CLEANUP3 3b：交集型不再直接可比，二段断言
  const { intl } = useIntlContext();
  const workspaceKeyLocal = workspaceIdentity?.trim() || workspaceAbsPath;
  const [rawQuery, setRawQuery] = React.useState("");
  const [scope, setScope] = React.useState<QuickPickScope>("all");
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(() => new Set());
  const [historyExpanded, setHistoryExpanded] = React.useState(false);
  const [historyEntries, setHistoryEntries] = React.useState<SearchHistoryEntry[]>([]);
  const [workspaceFiles, setWorkspaceFiles] = React.useState<WorkspaceFileEntry[]>([]);
  const [filesLoading, setFilesLoading] = React.useState(false);
  const [filesError, setFilesError] = React.useState<string | null>(null);
  const [filesLoadedForWorkspace, setFilesLoadedForWorkspace] = React.useState<string | null>(null);
  // 关闭时用空常量，避免 memo 组件持有过期大对象
  const activeCommands = open ? commands : EMPTY_COMMANDS;
  const activeTabs = open ? workspaceTabs : EMPTY_TABS;
  const changeSummary = open ? activeTaskChangeSummary : null;
  const parsed = React.useMemo(() => parseScopedQuery(rawQuery), [rawQuery]);
  const effectiveScope = parsed.explicitScope ? parsed.scope : scope;
  const query = parsed.query;
  const hasQuery = query.trim().length > 0;
  const searchConversations = open && hasQuery && (effectiveScope === "all" || effectiveScope === "conversations");
  const searchFiles = open && hasQuery && (effectiveScope === "all" || effectiveScope === "files");
  const searchableTabs = React.useMemo(() => (searchConversations ? activeTabs : []), [activeTabs, searchConversations]);
  const currentWorkspaceTabs = React.useMemo(
    () => activeTabs.filter((tab) => (tab.workspaceIdentity?.trim() || tab.workspacePath) === workspaceKeyLocal),
    [activeTabs, workspaceKeyLocal],
  );
  const browseTabs = React.useMemo(() => (open && !hasQuery ? currentWorkspaceTabs : []), [currentWorkspaceTabs, hasQuery, open]);
  // 任务搜索（跨工作区）
  const taskSearch = useGlobalTaskList({
    kind: "active",
    workspaceTabs: searchableTabs,
    sortBy: "updated",
    searchQuery: query,
    expanded: false,
    collapsedLimit: TASK_LIST_LIMIT,
  });
  // 最近任务（当前工作区，无查询）
  const recentTaskList = useGlobalTaskList({
    kind: "active",
    workspaceTabs: browseTabs,
    sortBy: "updated",
    searchQuery: "",
    expanded: false,
    collapsedLimit: effectiveScope === "conversations" ? TASK_LIST_LIMIT + +!!activeTaskId : RECENT_SECTION_LIMIT + +!!activeTaskId,
  });
  const workspaceLabelByKey = React.useMemo(
    () => new Map(activeTabs.map((tab) => [tab.workspaceIdentity?.trim() || tab.workspacePath, tab.label])),
    [activeTabs],
  );
  // 命令过滤（标题本地化后与关键词一起做分词包含匹配）
  const matchedCommands = React.useMemo(
    () =>
      activeCommands
        .map((command) => ({ command, title: intl.formatMessage({ id: command.titleId }) }))
        .filter(({ command, title }) => commandMatchesQuery(command, title, query)),
    [activeCommands, intl, query],
  );
  const commandSections = React.useMemo(
    () =>
      QUICK_PICK_SECTION_ORDER.map((sectionId) => ({
        sectionId,
        commands: matchedCommands.filter(({ command }) => command.sectionId === sectionId),
      })).filter((section) => section.commands.length > 0),
    [matchedCommands],
  );
  const taskSearchRows = React.useMemo(() => buildTaskSearchRows({ tasks: taskSearch.items, query }), [query, taskSearch.items]);
  const fileMatches = React.useMemo(() => filterWorkspaceFiles(workspaceFiles, query), [query, workspaceFiles]);
  const recentChanges = React.useMemo(() => [...(changeSummary?.files ?? [])].sort(compareRecentChanges), [changeSummary]);
  const recentChangesLimited = React.useMemo(() => recentChanges.slice(0, RECENT_SECTION_LIMIT), [recentChanges]);
  const recentTasksExcludingActive = React.useMemo(() => recentTaskList.items.filter((task) => task.taskId !== activeTaskId), [activeTaskId, recentTaskList.items]);
  const recentTasksLimited = React.useMemo(() => recentTasksExcludingActive.slice(0, RECENT_SECTION_LIMIT), [recentTasksExcludingActive]);
  // 打开时载入历史；关闭时复位
  React.useEffect(() => {
    if (open) {
      setHistoryEntries(loadSearchHistory(workspaceKeyLocal));
      return;
    }
    setRawQuery("");
    setScope("all");
    setExpandedSections(new Set());
    setHistoryExpanded(false);
  }, [open, workspaceKeyLocal]);
  React.useEffect(() => {
    setExpandedSections(new Set());
  }, [effectiveScope, query]);
  React.useEffect(() => {
    setWorkspaceFiles([]);
    setFilesError(null);
    setFilesLoading(false);
    setFilesLoadedForWorkspace(null);
  }, [workspaceKeyLocal]);
  // 文件索引惰性加载（首次进入文件搜索范围时）
  React.useEffect(() => {
    if (!searchFiles || filesLoadedForWorkspace === workspaceKeyLocal) return;
    let cancelled = false;
    setFilesLoading(true);
    setFilesError(null);
    fileService
      .listWorkspaceFiles({ rootPath: workspaceAbsPath })
      .then((files) => {
        if (!cancelled) {
          setWorkspaceFiles(files);
          setFilesLoadedForWorkspace(workspaceKeyLocal);
        }
      })
      .catch((error) => {
        if (!cancelled) setFilesError(String(error));
      })
      .finally(() => {
        if (!cancelled) setFilesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [fileService, filesLoadedForWorkspace, searchFiles, workspaceAbsPath, workspaceKeyLocal]);
  // 记录搜索历史（以当前有效范围）
  const recordHistory = React.useCallback(
    (historyScope: QuickPickScope = effectiveScope) => {
      if (hasQuery) setHistoryEntries(recordSearchHistory({ workspaceKey: workspaceKeyLocal, query, scope: historyScope }));
    },
    [effectiveScope, hasQuery, query, workspaceKeyLocal],
  );
  const close = React.useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);
  const runCommand = React.useCallback(
    (command: QuickPickCommand) => {
      recordHistory("commands");
      close();
      Promise.resolve(command.run()).catch((error) => {
        logger.error("[CommandCenter] 命令执行失败", { commandId: command.id, error });
        toast(intl.formatMessage({ id: "quickPick.commandFailed" }, { error: error instanceof Error ? error.message : String(error) }));
      });
    },
    [close, intl, recordHistory],
  );
  const pickTaskSearchRow = React.useCallback(
    (row: TaskSearchRow) => {
      recordHistory("conversations");
      onSearchResultHighlightRequest?.({
        taskId: row.task.taskId,
        workspacePath: row.task.workspacePath,
        workspaceIdentity: row.task.workspaceIdentity,
        query,
        snippet: row.searchSnippet?.trim() || row.task.searchSnippet?.trim() || undefined,
        snippetIndex: row.snippetIndex,
      });
      onSelectTask(row.task.workspacePath, row.task.taskId, row.task.workspaceIdentity);
      close();
    },
    [close, onSearchResultHighlightRequest, onSelectTask, recordHistory, query],
  );
  const pickFileMatch = React.useCallback(
    (file: WorkspaceFileEntry) => {
      recordHistory("files");
      onOpenCodeViewer({ type: "file", title: file.name, path: file.path });
      close();
    },
    [close, onOpenCodeViewer, recordHistory],
  );
  const pickRecentChange = React.useCallback(
    (file: RecentChangeFile) => {
      close();
      const relative = relativePathFrom(workspaceAbsPath, file.path);
      onOpenCodeViewer({ type: "file", title: pathBasename(relative) || relative, path: file.path });
    },
    [close, onOpenCodeViewer, workspaceAbsPath],
  );
  const pickRecentTask = React.useCallback(
    (task: TaskMeta) => {
      onSelectTask(task.workspacePath, task.taskId, task.workspaceIdentity);
      close();
    },
    [close, onSelectTask],
  );
  const changeScope = React.useCallback(
    (next: QuickPickScope) => {
      setScope(next);
      // 输入框带显式前缀时，切 tab 同步去掉前缀
      if (parsed.explicitScope) setRawQuery(query);
    },
    [parsed.explicitScope, query],
  );
  const showCommands = effectiveScope === "all" || effectiveScope === "commands";
  const showConversations = effectiveScope === "all" || effectiveScope === "conversations";
  const showFiles = effectiveScope === "all" || effectiveScope === "files";
  const showHistory = !hasQuery && historyEntries.length > 0;
  const renderMoreResults = (sectionKey: string, count: number) =>
    expandedSections.has(sectionKey) || count <= COLLAPSED_SECTION_LIMIT ? null : (
      <button
        type="button"
        className="mt-0.5 flex min-h-7 w-full items-center gap-1.5 rounded-xl px-2.5 pl-8 text-left text-ui-base text-foreground-subtle hover:bg-menu-hover hover:text-foreground"
        onClick={() => setExpandedSections((previous) => new Set(previous).add(sectionKey))}
      >
        {intl.formatMessage({ id: "commandCenter.moreResults" })}
        <IconChevronDown className="size-3.5" />
      </button>
    );
  /** 最近变更段（原 we） */
  const renderRecentChanges = ({ rows = recentChangesLimited, showEmpty = false }: { rows?: RecentChangeFile[]; showEmpty?: boolean } = {}) =>
    hasQuery || (rows.length === 0 && !showEmpty) ? null : (
      <CommandGroup heading={intl.formatMessage({ id: "commandCenter.section.recentChanges" })}>
        {rows.length === 0 ? (
          <CommandEmpty className="px-4 py-5 text-foreground-subtle">{intl.formatMessage({ id: "commandCenter.empty.recentChanges" })}</CommandEmpty>
        ) : null}
        {rows.map((file) => {
          const relative = relativePathFrom(workspaceAbsPath, file.path);
          const info = resolveFileInfo(file.path);
          return (
            <CommandItem
              key={file.path}
              value={`${relative} +${file.added} -${file.removed}`}
              className={COMMAND_ITEM_CLASS}
              onSelect={() => pickRecentChange(file)}
            >
              <FileIconImg src={info.fileIconSrc} size={14} className="shrink-0" />
              <span className="min-w-0 flex-1 truncate">{relative}</span>
              <CommandShortcut className={COMMAND_META_CLASS}>
                <span className="text-diff-added">+{file.added}</span>{" "}
                <span className="text-diff-removed">-{file.removed}</span>
              </CommandShortcut>
            </CommandItem>
          );
        })}
      </CommandGroup>
    );
  /** 最近任务段（原 Te） */
  const renderRecentTasks = ({ rows = recentTasksLimited, showEmpty = false }: { rows?: TaskMeta[]; showEmpty?: boolean } = {}) =>
    hasQuery || (rows.length === 0 && !showEmpty) ? null : (
      <CommandGroup heading={intl.formatMessage({ id: "commandCenter.section.recentTasks" })}>
        {rows.length === 0 ? (
          <CommandEmpty className="px-4 py-5 text-foreground-subtle">{intl.formatMessage({ id: "commandCenter.empty.recentTasks" })}</CommandEmpty>
        ) : null}
        {rows.map((task) => {
          const title = resolveTaskTitle(task, intl.formatMessage({ id: "taskList.untitled" }));
          return (
            <CommandItem
              key={`${task.workspaceIdentity?.trim() || task.workspacePath}:${task.taskId}`}
              value={`${title} ${task.workspacePath}`}
              className={COMMAND_ITEM_CLASS}
              onSelect={() => pickRecentTask(task)}
            >
              <IconMessageSquare className="size-3.5 text-foreground-subtle" />
              <span className="min-w-0 flex-1 truncate">{title}</span>
              <CommandShortcut className={COMMAND_META_CLASS}>{formatRelativeTime(task.updatedAt, intl)}</CommandShortcut>
            </CommandItem>
          );
        })}
      </CommandGroup>
    );
  /** 命令段（原 Ee）：按 QUICK_PICK_SECTION_ORDER 分组 */
  const renderCommands = () =>
    !showCommands || commandSections.length === 0
      ? null
      : commandSections.map((section) => (
          <CommandGroup key={section.sectionId} heading={intl.formatMessage({ id: `quickPick.section.${section.sectionId}` })}>
            {section.commands.map(({ command, title }) => {
              const Icon = QUICK_PICK_COMMAND_ICONS[command.icon];
              return (
                <CommandItem
                  key={command.id}
                  value={`${title} ${command.keywords.join(" ")}`}
                  disabled={command.disabled}
                  className={COMMAND_ITEM_CLASS}
                  onSelect={() => runCommand(command)}
                >
                  <Icon className="size-3.5 text-foreground-subtle" />
                  <span className="min-w-0 flex-1 truncate">
                    <HighlightedText text={title} query={query} />
                  </span>
                  {command.shortcut ? <CommandShortcut className={COMMAND_SHORTCUT_CLASS}>{command.shortcut}</CommandShortcut> : null}
                </CommandItem>
              );
            })}
          </CommandGroup>
        ));
  /** 任务搜索段（原 De） */
  const renderTaskSearch = () => {
    if (!hasQuery || !showConversations || (!taskSearch.loading && taskSearchRows.length === 0)) return null;
    const rows = effectiveScope === "conversations" || expandedSections.has("conversations") ? taskSearchRows : taskSearchRows.slice(0, COLLAPSED_SECTION_LIMIT);
    return (
      <CommandGroup heading={intl.formatMessage({ id: "commandCenter.section.conversations" })}>
        {taskSearch.loading && taskSearchRows.length === 0 ? (
          <CommandEmpty className="px-4 py-5 text-foreground-subtle">{intl.formatMessage({ id: "taskSearch.loading" })}</CommandEmpty>
        ) : null}
        {rows.map((row) => {
          const task = row.task;
          const title = resolveTaskTitle(task, intl.formatMessage({ id: "taskList.untitled" }));
          const workspaceLabel = workspaceLabelByKey.get(task.workspaceIdentity?.trim() || task.workspacePath) ?? task.workspacePath;
          const snippet = row.searchSnippet?.trim();
          return (
            <CommandItem key={row.key} value={`${title} ${workspaceLabel} ${snippet ?? ""}`} className={COMMAND_ITEM_CLASS} onSelect={() => pickTaskSearchRow(row)}>
              <IconMessageSquare className="size-3.5 text-foreground-subtle" />
              <span className="flex min-w-0 flex-1 flex-col justify-center py-0.5">
                <span className="truncate text-ui-base leading-5 font-normal text-foreground">
                  <HighlightedText text={title} query={query} />
                </span>
                {snippet ? (
                  <span className="min-w-0 truncate text-ui-base leading-4 text-foreground-subtle">
                    <HighlightedText text={snippet} query={query} />
                  </span>
                ) : null}
              </span>
              <CommandShortcut className={COMMAND_META_CLASS}>{workspaceLabel}</CommandShortcut>
              <MetaText>{formatRelativeTime(task.updatedAt, intl)}</MetaText>
            </CommandItem>
          );
        })}
        {effectiveScope === "all" ? renderMoreResults("conversations", taskSearchRows.length) : null}
      </CommandGroup>
    );
  };
  /** 文件搜索段（原 Oe） */
  const renderFileSearch = () => {
    if (!hasQuery || !showFiles || (!filesLoading && !filesError && fileMatches.length === 0)) return null;
    const rows = effectiveScope === "files" || expandedSections.has("files") ? fileMatches : fileMatches.slice(0, COLLAPSED_SECTION_LIMIT);
    return (
      <CommandGroup heading={intl.formatMessage({ id: "commandCenter.section.files" })}>
        {filesLoading && fileMatches.length === 0 ? (
          <CommandEmpty className="px-4 py-5 text-foreground-subtle">{intl.formatMessage({ id: "sidePane.openFileLoading" })}</CommandEmpty>
        ) : filesError ? (
          <CommandEmpty className="px-4 py-5 text-destructive">{filesError}</CommandEmpty>
        ) : null}
        {rows.map((file) => {
          const info = resolveFileInfo(file.path);
          const directory = fileDirectoryLabel(file);
          return (
            <CommandItem key={file.path} value={`${file.name} ${file.relativePath}`} className={COMMAND_ITEM_CLASS} onSelect={() => pickFileMatch(file)}>
              <FileIconImg src={info.fileIconSrc} size={14} className="shrink-0" />
              <span className="min-w-0 flex-1 truncate">
                <HighlightedText text={file.name} query={query} />
              </span>
              {directory ? (
                <CommandShortcut className={COMMAND_META_CLASS}>
                  <HighlightedText text={directory} query={query} />
                </CommandShortcut>
              ) : null}
            </CommandItem>
          );
        })}
        {effectiveScope === "all" ? renderMoreResults("files", fileMatches.length) : null}
      </CommandGroup>
    );
  };
  const hasAnyResult = (showCommands && matchedCommands.length > 0) || (showConversations && taskSearchRows.length > 0) || (showFiles && fileMatches.length > 0);
  const isBusy = taskSearch.loading || filesLoading || (showFiles && !!filesError);
  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title={intl.formatMessage({ id: "quickPick.title" })}
      description={intl.formatMessage({ id: "quickPick.description" })}
      className={QUICK_PICK_DIALOG_CLASS}
    >
      <Command shouldFilter={false} loop className={COMMAND_ROOT_CLASS}>
        <div className="border-b border-border px-2 pt-2 pb-2">
          <div className="flex h-8 items-center gap-2 rounded-full border border-input-border bg-input px-2.5 transition-colors hover:border-input-border-hover focus-within:border-input-border-focused focus-within:bg-input-focused">
            <IconSearch className="size-4 shrink-0 text-foreground-subtlest" />
            <CommandPrimitive.Input
              value={rawQuery}
              onValueChange={setRawQuery}
              placeholder={intl.formatMessage({ id: "commandCenter.placeholder" })}
              className="min-w-0 flex-1 bg-transparent text-ui-base leading-5 text-foreground outline-none placeholder:text-foreground-subtlest"
            />
          </div>
          <div role="tablist" aria-label={intl.formatMessage({ id: "commandCenter.scopeTabs" })} className="-mx-1 mt-1.5 flex gap-1 overflow-x-auto px-1 pb-0.5 scrollbar-hide">
            <ScopeTab active={effectiveScope === "all"} label={intl.formatMessage({ id: "commandCenter.scope.all" })} onClick={() => changeScope("all")}>
              <IconList className="size-3" />
            </ScopeTab>
            <ScopeTab active={effectiveScope === "commands"} label={intl.formatMessage({ id: "commandCenter.scope.commands" })} onClick={() => changeScope("commands")}>
              <IconRocket className="size-3" />
            </ScopeTab>
            <ScopeTab
              active={effectiveScope === "conversations"}
              label={intl.formatMessage({ id: "commandCenter.scope.conversations" })}
              onClick={() => changeScope("conversations")}
            >
              <IconMessagesSquare className="size-3" />
            </ScopeTab>
            <ScopeTab active={effectiveScope === "files"} label={intl.formatMessage({ id: "commandCenter.scope.files" })} onClick={() => changeScope("files")}>
              <IconFile className="size-3" />
            </ScopeTab>
          </div>
        </div>
        <CommandList className={QUICK_PICK_LIST_CLASS}>
          {hasQuery ? (
            hasAnyResult || isBusy ? (
              <>
                {renderCommands()}
                {renderTaskSearch()}
                {renderFileSearch()}
              </>
            ) : (
              <CommandEmpty className="px-4 py-5 text-foreground-subtle">{intl.formatMessage({ id: "commandCenter.noResults" })}</CommandEmpty>
            )
          ) : (
            (() => {
              switch (effectiveScope) {
                case "commands":
                  return renderCommands();
                case "conversations":
                  return renderRecentTasks({ rows: recentTasksExcludingActive, showEmpty: true });
                case "files":
                  return renderRecentChanges({ rows: recentChanges, showEmpty: true });
                default:
                  return (
                    <>
                      {renderRecentChanges()}
                      {renderRecentTasks()}
                      {renderCommands()}
                    </>
                  );
              }
            })()
          )}
        </CommandList>
        {showHistory ? (
          <SearchHistoryFooter
            entries={historyEntries}
            expanded={historyExpanded}
            onToggleExpanded={() => setHistoryExpanded((previous) => !previous)}
            onPickEntry={(entry) => {
              const prefix = scopePrefix(entry.scope);
              setScope(entry.scope);
              setRawQuery(prefix ? `${prefix}${entry.query}` : entry.query);
            }}
            onClear={() => {
              clearSearchHistory(workspaceKeyLocal);
              setHistoryEntries([]);
            }}
            historyLabel={intl.formatMessage({ id: "commandCenter.history" })}
            clearLabel={intl.formatMessage({ id: "commandCenter.clearHistory" })}
            expandLabel={intl.formatMessage({ id: "commandCenter.expandHistory" })}
            collapseLabel={intl.formatMessage({ id: "commandCenter.collapseHistory" })}
          />
        ) : null}
      </Command>
    </CommandDialog>
  );
});

/* ============================================================================
 * 12. 范围 Tab / 小字 / 历史页脚（原 pC/Ije/Lje，js 36335–36438 / jsx 33361–33403）
 * ==========================================================================*/

/** 原 pC（js 36381–36348）：范围切换胶囊 */
export function ScopeTab({ active, label, onClick, children }: { active: boolean; label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex h-6 shrink-0 items-center gap-1 rounded-full border px-2 text-ui-base font-medium leading-none transition-colors",
        active ? "border-border bg-selected text-foreground" : "border-transparent text-foreground-subtle hover:bg-surface-hover hover:text-foreground",
      )}
    >
      {children}
      <span>{label}</span>
    </button>
  );
}

/** 原 Ije（js 36361–36370）：行尾小字（相对时间用） */
export function MetaText({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("max-w-12 shrink-0 truncate font-sans text-ui-sm tracking-normal text-foreground-subtlest", className)}>{children}</span>
  );
}

/** 原 Lje（js 36371–36438）：搜索历史页脚（胶囊行，>6 条可展开/折叠） */
export function SearchHistoryFooter({
  entries,
  expanded,
  onToggleExpanded,
  onPickEntry,
  onClear,
  historyLabel,
  clearLabel,
  expandLabel,
  collapseLabel,
}: {
  entries: SearchHistoryEntry[];
  expanded: boolean;
  onToggleExpanded: () => void;
  onPickEntry: (entry: SearchHistoryEntry) => void;
  onClear: () => void;
  historyLabel: string;
  clearLabel: string;
  expandLabel: string;
  collapseLabel: string;
}) {
  const canToggle = entries.length > 6;
  return (
    <>
      <div className="flex items-center gap-2 px-3 pt-2 text-ui-sm font-medium text-foreground-subtle">
        <span>{historyLabel}</span>
        <button
          type="button"
          aria-label={clearLabel}
          className="ml-auto inline-grid size-6 place-items-center rounded-md text-foreground-subtlest hover:bg-surface-hover hover:text-foreground"
          onClick={onClear}
        >
          <IconTrash className="size-3.5" />
        </button>
      </div>
      <div className={cn("relative flex flex-wrap gap-1.5 overflow-hidden px-3 pt-1 pb-2 pr-11", expanded ? "" : "max-h-[34px]")}>
        {entries.map((entry) => {
          const prefix = scopePrefix(entry.scope);
          return (
            <button
              key={`${entry.scope}:${entry.query}:${entry.updatedAt}`}
              type="button"
              className="inline-flex min-h-5 max-w-44 shrink-0 items-center gap-1 rounded-full border border-border px-2 py-0.5 leading-none text-ui-base text-foreground-subtle hover:bg-surface-hover hover:text-foreground"
              onClick={() => onPickEntry(entry)}
            >
              {prefix ? <span className="font-mono text-ui-xs text-brand">{prefix}</span> : null}
              <span className="min-w-0 truncate">{entry.query}</span>
            </button>
          );
        })}
        {canToggle ? (
          <button
            type="button"
            aria-label={expanded ? collapseLabel : expandLabel}
            className="absolute top-1 right-3 inline-grid size-6 place-items-center rounded-md text-foreground-subtle hover:bg-surface-hover hover:text-foreground"
            onClick={onToggleExpanded}
          >
            <IconChevronDown className={cn("size-3.5 transition-transform", expanded ? "rotate-180" : "")} />
          </button>
        ) : null}
      </div>
    </>
  );
}

/* ============================================================================
 * 13. QuickFindBar 任务内查找（原 QNt/$Nt/ePt/tPt/nPt，js 139925–140188 / jsx 116623–116866）
 *     两种形态：placement="chat" → 会话面板顶部绝对定位条；
 *     placement="window"（默认）→ 非模态 Dialog（右上角，按平台让位）。
 *     范围：消息（conversation）/ 文件变更（changes），↑↓/Enter 导航，⇧Enter 反向。
 * ==========================================================================*/

/** 原 QNt（js 139925–139935）：查找导航键映射（Enter 受 Shift 反向） */
export function mapFindNavigationKey(key: string, shiftKey: boolean): "previous" | "next" | null {
  return key === "ArrowUp" ? "previous" : key === "ArrowDown" ? "next" : key === "Enter" ? (shiftKey ? "previous" : "next") : null;
}

/** 原 $Nt（js 90606–139940）：匹配计数归一 */
export function normalizeFindMatchState(total: number, index: number): { currentIndex: number; total: number } {
  return total <= 0 ? { currentIndex: -1, total: 0 } : { currentIndex: index >= 0 && index < total ? index : 0, total };
}

/** 原 ePt（js 139941–139945）：环形步进 */
export function stepFindIndex(state: { currentIndex: number; total: number }, direction: "previous" | "next"): number {
  if (state.total <= 0 || state.currentIndex < 0) return -1;
  const delta = direction === "next" ? 1 : -1;
  return (state.currentIndex + delta + state.total) % state.total;
}

/** 原 tPt（js 139946–139948） */
export function nextFindNavigation(query: string, state: { currentIndex: number; total: number }, direction: "previous" | "next"): { activeIndex: number; query: string } {
  return { activeIndex: stepFindIndex(state, direction), query };
}

export type QuickFindPlacement = "window" | "chat";
export type QuickFindScope = "conversation" | "changes";

export interface QuickFindBarProps {
  open: boolean;
  focusRequestId?: string | number;
  placement?: QuickFindPlacement;
  isMacDesktop: boolean;
  isWindowsDesktop: boolean;
  isLinuxDesktop: boolean;
  conversationMatchCount: number;
  conversationMatchIndex: number;
  fileChangeMatchCount: number;
  fileChangeMatchIndex: number;
  onOpenChange: (open: boolean) => void;
  onConversationFindChange: (query: string, activeIndex: number) => void;
  onConversationFindNavigate: (query: string, activeIndex: number) => void;
  onFileChangeFindChange: (query: string, activeIndex: number) => void;
  onFileChangeFindNavigate: (query: string, activeIndex: number) => void;
  onOpenFileChanges: () => void;
}

export function QuickFindBar({
  open,
  focusRequestId,
  placement = "window",
  isMacDesktop,
  isWindowsDesktop,
  isLinuxDesktop,
  conversationMatchCount,
  conversationMatchIndex,
  fileChangeMatchCount,
  fileChangeMatchIndex,
  onOpenChange,
  onConversationFindChange,
  onConversationFindNavigate,
  onFileChangeFindChange,
  onFileChangeFindNavigate,
  onOpenFileChanges,
}: QuickFindBarProps) {
  const { intl } = useIntlContext();
  const titleId = React.useId();
  const descriptionId = React.useId();
  const [query, setQuery] = React.useState("");
  const [findScope, setFindScope] = React.useState<QuickFindScope>("conversation");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const conversationState = React.useMemo(() => normalizeFindMatchState(query.trim() ? conversationMatchCount : 0, conversationMatchIndex), [conversationMatchCount, conversationMatchIndex, query]);
  const changesState = React.useMemo(() => normalizeFindMatchState(query.trim() ? fileChangeMatchCount : 0, fileChangeMatchIndex), [fileChangeMatchCount, fileChangeMatchIndex, query]);
  const activeState = findScope === "conversation" ? conversationState : changesState;
  React.useEffect(() => {
    if (!open) {
      setQuery("");
      setFindScope("conversation");
      onConversationFindChange("", -1);
      onFileChangeFindChange("", -1);
      return;
    }
    window.requestAnimationFrame(() => inputRef.current?.focus());
  }, [onConversationFindChange, onFileChangeFindChange, open]);
  React.useEffect(() => {
    if (open) window.requestAnimationFrame(() => inputRef.current?.focus());
  }, [focusRequestId, open]);
  React.useEffect(() => {
    // 切到「文件变更」范围即打开变更面板
    if (!open || findScope !== "changes") return;
    onOpenFileChanges();
  }, [onOpenFileChanges, open, findScope]);
  React.useEffect(() => {
    // chat 形态：Escape 关闭（不拦截已被消费的按键）
    if (!open || placement !== "chat") return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.key !== "Escape") return;
      event.preventDefault();
      onOpenChange(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onOpenChange, open, placement]);
  React.useEffect(() => {
    if (!open || findScope !== "conversation") return;
    onFileChangeFindChange("", -1);
    onConversationFindChange(query, conversationState.currentIndex);
  }, [conversationState.currentIndex, onConversationFindChange, onFileChangeFindChange, open, query, findScope]);
  React.useEffect(() => {
    if (!open || findScope !== "changes") return;
    onConversationFindChange("", -1);
    onFileChangeFindChange(query, changesState.currentIndex);
  }, [changesState.currentIndex, onConversationFindChange, onFileChangeFindChange, open, query, findScope]);
  const navigate = React.useCallback(
    (direction: "previous" | "next") => {
      if (activeState.total === 0) return;
      const next = nextFindNavigation(query, activeState, direction);
      if (findScope === "conversation") {
        onConversationFindNavigate(next.query, next.activeIndex);
        return;
      }
      onFileChangeFindNavigate(next.query, next.activeIndex);
    },
    [activeState, onConversationFindNavigate, onFileChangeFindNavigate, query, findScope],
  );
  const changeQuery = React.useCallback(
    (next: string) => {
      setQuery(next);
      const index = next.trim() ? 0 : -1;
      if (findScope === "conversation") {
        onConversationFindChange(next, index);
        return;
      }
      onFileChangeFindChange(next, index);
    },
    [onConversationFindChange, onFileChangeFindChange, findScope],
  );
  const changeScope = React.useCallback(
    (next: QuickFindScope) => {
      setFindScope(next);
      if (next === "changes") {
        onOpenFileChanges();
        onConversationFindChange("", -1);
        onFileChangeFindChange(query, query.trim() ? 0 : -1);
        return;
      }
      onFileChangeFindChange("", -1);
      onConversationFindChange(query, query.trim() ? 0 : -1);
    },
    [onConversationFindChange, onFileChangeFindChange, onOpenFileChanges, query],
  );
  const toggleScope = React.useCallback(() => {
    changeScope(findScope === "conversation" ? "changes" : "conversation");
  }, [changeScope, findScope]);
  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      const direction = mapFindNavigationKey(event.key, event.shiftKey);
      if (direction) {
        event.preventDefault();
        navigate(direction);
      }
    },
    [navigate],
  );
  const placeholderId = `quickPick.find.placeholder.${findScope}`;
  const ScopeIcon = findScope === "conversation" ? IconMessageCircle : IconFileDiff;
  const scopeToggleLabelId = findScope === "conversation" ? "quickPick.find.scope.changes" : "quickPick.find.scope.conversation";
  const previousLabel = intl.formatMessage({ id: "quickPick.find.previous" });
  const nextLabel = intl.formatMessage({ id: "quickPick.find.next" });
  const scopeToggleLabel = intl.formatMessage({ id: scopeToggleLabelId });
  const scopeTooltipLabel = intl.formatMessage({ id: "quickPick.find.scope.tooltip" });
  const closeLabel = intl.formatMessage({ id: "common.close" });
  const IconButton = ({ label, tooltipLabel = label, disabled, onClick, children }: { label: string; tooltipLabel?: string; disabled?: boolean; onClick: () => void; children: React.ReactNode }) => (
    <Tooltip title={tooltipLabel} side="bottom">
      <span className="inline-flex">
        <Button type="button" variant="ghost" size="icon-xs" aria-label={label} disabled={disabled} onClick={onClick}>
          {children}
        </Button>
      </span>
    </Tooltip>
  );
  const bar = (
    <div className="flex h-9 items-center gap-1.5 py-0 pr-2 pl-2">
      <IconSearch className="size-3.5 shrink-0 text-foreground" />
      <input
        ref={inputRef}
        value={query}
        onChange={(event) => changeQuery(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder={intl.formatMessage({ id: placeholderId })}
        className="min-w-0 flex-1 bg-transparent text-ui-base font-medium text-foreground outline-none placeholder:text-foreground-subtlest"
      />
      <div className="w-8 shrink-0 text-center text-ui-xs font-medium text-foreground-subtle tabular-nums">
        {activeState.total > 0 ? `${activeState.currentIndex + 1}/${activeState.total}` : "0/0"}
      </div>
      <div className="flex shrink-0 items-center gap-0.5 border-l border-border pl-1.5">
        <IconButton label={previousLabel} disabled={activeState.total === 0} onClick={() => navigate("previous")}>
          <IconArrowUp className="size-3.5" />
        </IconButton>
        <IconButton label={nextLabel} disabled={activeState.total === 0} onClick={() => navigate("next")}>
          <IconArrowDown className="size-3.5" />
        </IconButton>
        <IconButton label={scopeToggleLabel} tooltipLabel={scopeTooltipLabel} onClick={toggleScope}>
          <ScopeIcon className="size-3.5" />
        </IconButton>
      </div>
      <div className="ml-0.5 flex shrink-0 border-l border-border pl-1.5">
        <IconButton label={closeLabel} onClick={() => onOpenChange(false)}>
          <IconClose className="size-3.5" />
        </IconButton>
      </div>
    </div>
  );
  // 右上角定位按平台让位（Win 136px 三键 / Mac 顶栏 h-14 / Linux 120px）
  const windowPositionClass = cn(
    "left-auto !w-[min(360px,calc(100vw-0.75rem))] !max-w-[calc(100vw-0.75rem)] translate-x-0 translate-y-0",
    isWindowsDesktop ? "top-12 right-36" : isMacDesktop ? "top-14 right-3" : isLinuxDesktop ? "top-12 right-[120px]" : "top-3 right-3",
  );
  return placement === "chat" ? (
    open ? (
      <div
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="absolute top-3 left-1/2 z-30 w-[min(360px,calc(100%-1rem))] -translate-x-1/2 overflow-hidden rounded-xl border border-popover-border bg-popover p-0 text-ui-base/relaxed text-foreground shadow-md outline-none [app-region:no-drag] max-md:top-2"
      >
        <div className="sr-only">
          <h2 id={titleId}>{intl.formatMessage({ id: "quickPick.find.title" })}</h2>
          <p id={descriptionId}>{intl.formatMessage({ id: "quickPick.find.description" })}</p>
        </div>
        {bar}
      </div>
    ) : null
  ) : (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogHeader className="sr-only">
        <DialogTitle id={titleId}>{intl.formatMessage({ id: "quickPick.find.title" })}</DialogTitle>
        <DialogDescription id={descriptionId}>{intl.formatMessage({ id: "quickPick.find.description" })}</DialogDescription>
      </DialogHeader>
      <DialogContent
        showCloseButton={false}
        showOverlay={false}
        onInteractOutside={(event) => {
          event.preventDefault();
        }}
        className={cn(windowPositionClass, "overflow-hidden rounded-xl border-popover-border bg-popover p-0 shadow-md")}
      >
        {bar}
      </DialogContent>
    </Dialog>
  );
}

/* ============================================================================
 * 14. 全局快捷键（原 rge，js 24015–24078 / jsx 20683）
 *     ⌘/Ctrl+K 或 ⌘/Ctrl+⇧+P → 打开命令中心；⌘/Ctrl+F → 任务内查找；
 *     ⌘/Ctrl+⇧+[ / ] → 上一/下一个会话；⌘/Ctrl+B 侧栏；⌘/Ctrl+J 终端；
 *     ⌘/Ctrl+⌥+B 侧面板；⌘/Ctrl+[ / ] → 导航后退/前进。
 *     （capture 阶段监听；忽略 repeat 与 IME 组词。）
 * ==========================================================================*/

export interface GlobalQuickPickShortcuts {
  openQuickPick: () => void;
  find: () => void;
  toggleSidebar: () => void;
  toggleTerminal: () => void;
  toggleSidePane: () => void;
  previousConversation?: () => void;
  nextConversation?: () => void;
  navBack?: (() => void) | null;
  navForward?: (() => void) | null;
}

export function useGlobalQuickPickShortcuts({
  openQuickPick,
  find,
  toggleSidebar,
  toggleTerminal,
  toggleSidePane,
  previousConversation,
  nextConversation,
  navBack,
  navForward,
}: GlobalQuickPickShortcuts): void {
  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.repeat || event.isComposing) return;
      if (isModKey(event, "k") || isModShiftKey(event, "p")) {
        event.preventDefault();
        openQuickPick();
        return;
      }
      if (isModKey(event, "f")) {
        event.preventDefault();
        find();
        return;
      }
      if (isModShiftKey(event, "[")) {
        if (!previousConversation) return;
        event.preventDefault();
        previousConversation();
        return;
      }
      if (isModShiftKey(event, "]")) {
        if (!nextConversation) return;
        event.preventDefault();
        nextConversation();
        return;
      }
      if (isModKey(event, "b")) {
        event.preventDefault();
        toggleSidebar();
        return;
      }
      if (isModKey(event, "j")) {
        event.preventDefault();
        toggleTerminal();
        return;
      }
      if (isModAltKey(event, "b")) {
        event.preventDefault();
        toggleSidePane();
        return;
      }
      if (isModKey(event, "[")) {
        if (!navBack) return;
        event.preventDefault();
        navBack();
        return;
      }
      if (isModKey(event, "]")) {
        if (!navForward) return;
        event.preventDefault();
        navForward();
      }
    }
    window.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, [openQuickPick, find, toggleSidebar, toggleTerminal, toggleSidePane, previousConversation, nextConversation, navBack, navForward]);
}

/* ============================================================================
 * 15. 装配现场（仅文档；实现属 F07 XJt 工作区根，js 186780–186871）
 * ----------------------------------------------------------------------------
 * XJt 内：
 *   快捷键标签（js 186258–186264）：
 *     R=$i('B') 侧栏 | z=$i('N') 新任务 | B=$i('[') 后退 | V=$i(']') 前进
 *     H=$i('J') 终端 | U=$i('O') 打开工作区
 *   commands = useMemo(() => buildQuickPickCommands({
 *     allowOpenWorkspace, canOpenCommunity, isSidebarVisible, supportsEmbeddedBrowser,
 *     isLoggedIn, themeTarget,
 *     shortcuts: { newTask: z, openWorkspace: U, toggleSidebar: R, toggleTerminal: H },
 *     handlers: { createTask, openWorkspace, openSettings, openSkillsSettings('skills'),
 *                 openMcpSettings('mcp'), switchTheme, openFeedback, openCommunity,
 *                 openProductDocs, login, logout, toggleSidebar, toggleTerminal,
 *                 togglePreview, openTerminalTab, openBrowserTab, openReviewTab },
 *   }))
 *   <QuickPick open commands workspaceAbsPath workspaceIdentity activeTaskId
 *              activeTaskChangeSummary workspaceTabs onOpenChange onSelectTask
 *              onSearchResultHighlightRequest onOpenCodeViewer />
 *   <WorkspaceShell … taskFindDialogProps={{ open, focusRequestId, isMacDesktop,
 *              isWindowsDesktop, isLinuxDesktop, conversationMatchCount/Index,
 *              fileChangeMatchCount/Index, onOpenChange, onConversationFindChange/Navigate,
 *              onFileChangeFindChange/Navigate, onOpenFileChanges }} />
 *     → yJt 内 `Zn = () => <QuickFindBar {...taskFindDialogProps} placement="chat" />`（js 184372）
 *   useGlobalQuickPickShortcuts({ openQuickPick, find, toggleSidebar, toggleTerminal,
 *              toggleSidePane, previousConversation, nextConversation, navBack, navForward })
 *     （js 186753–186762）
 * ==========================================================================*/
