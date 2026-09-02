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
 *   Fv search 27732 | dv list 27307 | Pv rocket 27687 | yv messages-square 27420
 *   Aye file 27073 | Kv trash-2 27882 | N_ chevron-down（TopBar 族已登记）
 *   vv message-square | hv message-circle-plus | Tv panel-left-close | Ev panel-left-open
 *   Uv square-terminal | oye book-open | Jv users | X_ file-diff 27036 | Q_ folder-open 27103
 *   pv log-in 27325 | Kye log-out 27330 | Iv server 27746 | Rv settings 27758
 *   Yv wand-sparkles 27966 | xv moon 27468 | Sbe sun 27826 | nv globe 27170
 *   gv message-circle 27390 | T_ arrow-up 26663 | Qve arrow-down 26625 | M_ check
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


/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/quickpick/QuickPick.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

export {
  Command,
  CommandDialog,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  FileIconImg,
  QUICK_PICK_SECTION_ORDER,
  QUICK_PICK_COMMAND_ICONS,
  buildQuickPickCommands,
  fuzzyScore,
  formatRelativeTime,
  resolveTaskTitle,
  compareRecentChanges,
  tokenizeQuery,
  mergeHighlightRanges,
  findHighlightRanges,
  HighlightedText,
  SEARCH_HISTORY_LIMIT,
  SEARCH_HISTORY_STORAGE_PREFIX,
  safeLocalStorage,
  searchHistoryStorageKey,
  isSearchHistoryEntry,
  loadSearchHistory,
  saveSearchHistory,
  recordSearchHistory,
  clearSearchHistory,
  COLLAPSED_SECTION_LIMIT,
  RECENT_SECTION_LIMIT,
  FILE_SEARCH_LIMIT,
  TASK_LIST_LIMIT,
  parseScopedQuery,
  scopePrefix,
  commandMatchesQuery,
  fileDirectoryLabel,
  fileSearchHaystack,
  filterWorkspaceFiles,
  normalizeSearchSnippet,
  dedupeSearchSnippets,
  buildTaskSearchRows,
  useSearchResultsStore,
  selectQueryResult,
  mergeTaskListShards,
  useGlobalTaskList,
  QuickPick,
  ScopeTab,
  MetaText,
  SearchHistoryFooter,
  mapFindNavigationKey,
  normalizeFindMatchState,
  stepFindIndex,
  nextFindNavigation,
  QuickFindBar,
  useGlobalQuickPickShortcuts,
} from '../components/quickpick/QuickPick';
export type {
  QuickPickSectionId,
  QuickPickCommandIconName,
  QuickPickCommand,
  BuildQuickPickCommandsArgs,
  QuickPickScope,
  SearchHistoryEntry,
  ParsedScopedQuery,
  TaskSearchRow,
  QueryDescriptor,
  QueryResult,
  SearchResultsState,
  UseGlobalTaskListArgs,
  UseGlobalTaskListResult,
  QuickPickProps,
  QuickFindPlacement,
  QuickFindScope,
  QuickFindBarProps,
  GlobalQuickPickShortcuts,
} from '../components/quickpick/QuickPick';
