/* eslint-disable */
/**
 * ============================================================================
 * Home.tsx — ZCode 3.7.6 Home 族（草稿态首页：hero+问候+工作区行+composer 卡+建议卡+banner）
 *            （解混淆重建 · D8 Stage B / F02）
 * ============================================================================
 *
 * 来源文件（融合 chunk，213,695 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js
 * 对照文件（同一 chunk 的 pretty-print 版）：
 *   /home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx
 *
 * 结构结论（MODULE-MAP.md F02）：ZCode 的 Home 不是独立视图，而是会话面板 `R0` 的
 * draftMode 形态：`R0` 在 draft 态把 `git`(=memo(hit)) composer 以 `centered/draftMode`
 * 挂载、把 `Sit` 问候 hero 作为消息列表 emptyState、把 `kit` off-peak 横幅（含 3 张建议卡）
 * 挂在 composer 之下；工作区行 `a4` + 分支 chip `zZ` 由窗口壳 `yJt` 组装成 contextHeader
 * 注入 composer 卡顶部（js 184540–184577）。
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号格式：融合chunk js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 *  问候 hero（draft emptyState）：
 *   vit  → GREETING_HOUR_BOUNDARIES [5,9,12,14,18,23]   (91182 / 78837)
 *   gX   → GREETING_MIN_FONT_SIZE_PX = 20               (91183 / 78838)
 *   _X   → GREETING_MAX_FONT_SIZE_PX = 30               (91184 / 78839)
 *   yit  → resolveGreetingI18nId     按时段 6 档选 key  (91185 / 78840)
 *   bit  → msUntilNextGreetingBoundary                  (91202 / 78844)
 *   xit  → fitGreetingFontSize       20–30px 自适应     (91212 / 78854)
 *   Sit  → GreetingHero              问候语+品牌线框底图 (91219 / 78861)
 *   Cit  → HomeHeroLogo              品牌线框 SVG        (91322 / 78922)
 *
 *  composer 卡（draft 态根组件，props: snapshot/draftMode/draftConfig/contextHeader/centered）：
 *   hit  → DraftComposerRegion       (90180–91174 / 78144)
 *   git  → DraftComposerRegionMemo = memo(hit)          (91174 / 78829)
 *   dit  → applyExternalTextInsertRequest               (90132 / 78112)
 *   fit  → applyComposerRestoreRequest                  (90150 / 78122)
 *   pit  → areStringArraysEqual                         (90176 / 78136)
 *   mit  → formatLineCount                              (90178 / 78139)
 *   _it  → isEventInsideDialog（R0 Escape 守卫用）      (91176 / 78830)
 *
 *  off-peak 横幅 + 建议卡（draft 态、本地工作区才显示）：
 *   vX   → toErrorMessage                               (91337 / 78937 附近)
 *   wit  → hasCodingPlanProviderEntry                   (91340 / —)
 *   Tit  → isCodingPlanConnectionSelected               (91348 / —)
 *   Eit  → isQuota3103Error                             (91355 / —)
 *   Dit  → resolveOffPeakErrorI18nId                    (91358 / —)
 *   bX   → useOffPeakTaskStore（zustand）               (91368 / 78945)
 *   Oit  → OFF_PEAK_HOME_TEMPLATES [standupGitSummary, ciFlakyReport, customize] (91590 / 79215)
 *   kit  → OffPeakNewTaskBanner（📢 横幅 + 3 张建议卡）  (91591 / 79222)
 *
 *  工作区选择行（contextHeader 左件）：
 *   mOt  → resolveHomePathPrefix                        (128526 / 108386)
 *   hOt  → homeAwareDisplayName                         (128533 / 108389)
 *   gOt  → workspaceMenuLabel                           (128538 / 108393)
 *   _Ot  → workspaceTriggerLabel                        (128542 / 108397)
 *   vOt  → isSameWorkspaceTab                           (128546 / 108401)
 *   yOt  → remoteTabSearchHaystack                      (128549 / 108404)
 *   bOt  → filterWorkspaceTabsForMenu（搜索、前 5 条）  (128554 / 108407)
 *   a4   → WorkspaceSelectionRow                        (128568–128776 / 108415)
 *   UTt  → useRemoteWorkspaceEnabled（恒 true）         (123177 / —)
 *   N2   → isRemoteWorkspaceTab                         (123199 / —)
 *   pOt  → = fOt RemoteWizardDialog（F10，接口保留）    (128525 / —)
 *
 *  提及菜单（@#> / $ / 斜杠 面板的可见层）：
 *   mC   → mentionTriggerChar（commands→`>`、conversations→`#`、files→`@`）(36348 / 33369)
 *   Pqe  → MENTION_TRIGGER_REGEX /(^|\s)([/@$#¥￥])([^\s/@$#¥￥]*)$/ (64024 / —)
 *   Fqe  → MENTION_TOKEN_PREFIX_REGEX                   (64025 / —)
 *   Iqe  → normalizeCnyTrigger（¥/￥ → $）              (64026 / —)
 *   tV   → parseMentionTrigger                          (64061 / —)
 *   SV   → SuggestionPanel（虚拟滚动面板）              (64639 / 57678)
 *   _Je  → SuggestionSectionHeaderRow                   (64776 / —)
 *   vJe  → SuggestionStatusRow（loading/error/empty）   (64785 / —)
 *   yJe  → SuggestionOptionRow                          (64813 / —)
 *   （KJe MentionSelector js 65605 / SJe SlashPanel js 65002：Lexical 接线层，接口保留，属 F08）
 *
 *  建议卡文案数据（地图备注所指，实为提及面板技能段文案，非 3 张卡）：
 *   Dqe  → OFFICIAL_SKILL_PLUGINS Set                   (63845 / 56970)
 *   kqe  → CURATED_SKILL_DESCRIPTIONS（zh-CN/en-US）    (63868 / —)
 *   jqe  → curatedSkillDescription                      (63975 / —)
 *
 *  图标（Sa=createLucideIcon，js 行）：
 *   T_ arrow-up 26663（发送）| Wv square 27823（停止）| Yye megaphone 27358（横幅 📢）
 *   xv moon 27468（建议卡）| gbe rotate-ccw 27705（重试）| xye clipboard-pen-line 26884
 *   sv house 27214 | $_ folder 27133 | U_ cloud 26918 | Nye folder-plus 27112
 *   gv message-circle 27390 | Fv search 27732 | N_ chevron-down 26802
 *   fv loader 27315（EN Spinner 用）| p info（imeComposition chunk `Ht` 导出）
 *   g close-x（imeComposition chunk `b` 导出）
 *
 *  data-testid 常量（来自 src-HCld2afU.js，括号内为字符串值）：
 *   Ht=v4-composer | St=chat-attachment-menu-item | At=chat-attachment-button
 *   Ot=v4-stop | see=v4-composer-send | un=v4-composer-input
 *   Yee=v4-paused-queue-send-dialog | Sne=v4-composer-clear-queue-send
 *   pee=v4-composer-keep-queue-send | Br=v4-attachment-upload-progress
 *   Yt=v4-attachment-upload-retry | ct=v4-attachment | qr(e,t)=`${e}-${t}`
 *   Ut=composer-project-detach | Cne=composer-workspace-trigger
 *   _n=composer-remote-connection | dn=composer-work-outside-project
 *
 * ----------------------------------------------------------------------------
 * 二、外部依赖清单（跨 chunk 导入；标注来源 chunk 与导出字母）
 * ----------------------------------------------------------------------------
 *  1. react / jsx-runtime           react-BQLj9xdT.js、jsx-runtime-B5yMD3-t.js
 *  2. cn() 类名合并 (Z)              utils-CEEH0K_K.js
 *  3. Button (X) / createLucideIcon (Sa)
 *                                   button-laUijeDG.js
 *  4. useIntlContext (G) → {intl, locale}
 *                                   IntlProvider-C321H7m8.js
 *  5. toast (m)、info 图标 (p=T)、close 图标 (g=b)、usePlatformService (l=M)
 *                                   imeComposition-DEYFkwWm.js
 *  6. Tooltip (Ia)、Popover 原语 (Na/Oa/Ma/ka = root/anchor/trigger/content)
 *                                   usageStatsUiParts-CiR7YEhh.js
 *  7. logger (J)                    logger-PFDwl5Yq.js
 *  8. zustand create (Ae)、useTaskStore (xe)
 *                                   skillStore-BmeKHDBI.js
 *  9. testid 常量 + testidOf (qr)、workspaceScopeKey (Ti)、DesktopCommand/环境常量
 *                                   src-HCld2afU.js
 * 10. useVirtualizer (to)           esm-BY6T6pIH.js（@tanstack/react-virtual）
 * 11. 本 chunk 内：Radix DropdownMenu 原语（VO…JO，TopBar.tsx 已还原）、
 *     Dialog 原语（zb/Hb/Ub/Gb/Kb/Vb/Wb）、InputGroup（qb/Jb）、
 *     Composer 族（ZV/ait/Zrt/iZe/TH/lit/JH/uit/vN/yN/xN/bN/SN/DN/KJe/SJe，F08）、
 *     远程向导 fOt（F10）、GitBranchChip zZ（TopBar 族）
 * ============================================================================
 */


/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/shell/Home.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

export {
  Spinner,
  GREETING_HOUR_BOUNDARIES,
  GREETING_MIN_FONT_SIZE_PX,
  GREETING_MAX_FONT_SIZE_PX,
  resolveGreetingI18nId,
  msUntilNextGreetingBoundary,
  fitGreetingFontSize,
  GreetingHero,
  HomeHeroLogo,
  toErrorMessage,
  hasCodingPlanProviderEntry,
  isCodingPlanConnectionSelected,
  isQuota3103Error,
  resolveOffPeakErrorI18nId,
  useOffPeakTaskStore,
  OFF_PEAK_HOME_TEMPLATES,
  OffPeakNewTaskBanner,
  useRemoteWorkspaceEnabled,
  isRemoteWorkspaceTab,
  resolveHomePathPrefix,
  homeAwareDisplayName,
  workspaceMenuLabel,
  workspaceTriggerLabel,
  isSameWorkspaceTab,
  remoteTabSearchHaystack,
  filterWorkspaceTabsForMenu,
  WorkspaceSelectionRow,
  mentionTriggerChar,
  MENTION_TRIGGER_REGEX,
  MENTION_TOKEN_PREFIX_REGEX,
  normalizeCnyTrigger,
  parseMentionTrigger,
  flattenSuggestionRows,
  SuggestionPanel,
  SuggestionSectionHeaderRow,
  SuggestionStatusRow,
  SuggestionOptionRow,
  applyExternalTextInsertRequest,
  applyComposerRestoreRequest,
  areStringArraysEqual,
  formatLineCount,
  isEventInsideDialog,
  DRAFT_SCOPE_SESSION_ID,
  DraftComposerRegion,
  DraftComposerRegionMemo,
  resolveComposerPlaceholderI18nId,
  resolveCodingPlanUsageRemaining, // 〔A1-R23〕Oq 叠层专项：SidebarLeaves mRt 面（150396）改接 Home §U.3 逐字真身（bundle Oq 76207–76245 唯一真身，消费三面 76250/76296/150396）
  buildThoughtLevelOptionFromCatalog, // 〔A1-R24〕zrt 197021 面联动：SubagentLeaves resolveProviderThoughtOption declare 收敛改接点（bundle zrt 89222 唯一真身）
  resolveModelGroupLabel, // 〔A1-R25〕w6e 77856 实体化：SubagentLeaves findModelGroupItemLabel / ExtendedViews resolveModelGroupLabel 双 declare 收敛改接点
  parseLooseModelValue, // 〔A1-R25〕Mg 24406 收敛：SubagentLeaves parseModelRef declare 改接点（真身 §U.4，bundle 唯一真身）
  openSettingsUsageSection, // 〔A1-R25〕aw 39378 收敛：真身 §U.7 导出面同步（终端消费 Sidebar 直连 ./Home）
} from '../components/shell/Home';
export type {
  GreetingHeroProps,
  OffPeakCreateInput,
  OffPeakTaskStoreState,
  OffPeakNewTaskBannerProps,
  WorkspaceTab,
  WorkspaceSelectionRowProps,
  SuggestionOption,
  SuggestionSection,
  SuggestionPanelProps,
  ComposerAttachment,
  ComposerInputApi,
  ComposerMentionPayload,
  ComposerDraftSnapshot,
  ComposerSnapshot,
  ComposerConfig,
  ComposerConfigPicker,
  DraftComposerRegionProps,
  EntitlementSnapshotLike, // 〔A1-R23〕Oq 叠层专项：SidebarLeaves PlanEntitlementSnapshot 别名所依
  CodingPlanUsageViewLike, // 〔A1-R23〕Oq 叠层专项：SidebarLeaves SidebarUsageStateModel.usageState 型缝所依
  ModelCatalogEntryLike, // 〔A1-R24〕zrt 197021 面联动：SubagentLeaves/SubagentsSettingsSection ModelProvider.models 型缝所依
} from '../components/shell/Home';
