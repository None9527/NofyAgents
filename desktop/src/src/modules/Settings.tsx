/* eslint-disable */
/**
 * ============================================================================
 * Settings.tsx — ZCode 3.7.6 设置视图族（两栏设置：左段列表 + 右行式 · D8 Stage B）
 * ============================================================================
 *
 * 来源文件（融合 chunk，213,695 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js
 * 对照文件（同一 chunk 的 pretty-print 版，行号口径见 MODULE-MAP.md）：
 *   /home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号格式：融合chunk js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 *  视图壳与侧栏：
 *   j9   → SettingsView               设置视图根（64/264px 左段列表 + 右栏）(204878 / 163283)
 *   o4t  → SettingsSidebarItem        左段分区按钮（Tooltip + 激活态）(204846 / 163271)
 *   H2t  → SettingsCaptionLogo        Win 左上 logo 拖拽条 (203818 / 162542)
 *   K2t  → SETTINGS_SECTION_REGISTRY  14 分区注册表（过滤隐藏段）(203935 / 162621)
 *   G2t  → SETTINGS_SIDEBAR_GROUPS    3 个侧栏分组 (203930 / 162611)
 *   q2t  → SETTINGS_GROUPED_SECTIONS  分组×分区装配 (203962 / 162693)
 *   J2t  → AUTO_ARCHIVE_DAY_OPTIONS   [3,7,14,30] (203964 / 162697)
 *   Y2t  → INTERACTION_BEHAVIOR_OPTIONS [`queue`,`guide`] (203965 / 162698)
 *   W2t  → THEME_MODE_OPTIONS         system/zai-dark/zai-light (203925 / 162601)
 *   H3   → SETTINGS_CONTENT_CLASS     右栏内容限宽类 (135261 / 113750)
 *   O9   → WINDOWS_CAPTION_DEFAULT_RIGHT_INSET_PX = 136 (204776 / —)
 *   k9   → normalizeCaptionRightPaddingPx (204777 / —)
 *
 *  分区视图：
 *   X2t  → GeneralSettingsSection     通用（语言/终端/HTTP代理/更新/通知/行为/归档/数据目录…）(203966 / 162699)
 *   Z2t  → GeneralSettingsTitleChips  标题下语言 chip (204528 / 163078)
 *   Q2t  → PixelNumberInput           px 数字输入（12–20 等）(204535 / 163088)
 *   $2t  → AppearanceSettingsSection  外观（主题模式/UI字号/代码主题/行号/换行/预览）(204566 / 163104)
 *   FQt  → ModelProviderSettingsSection 模型供应商（接口级，见尾注）(191784 / 154557)
 *   E2t  → MemorySettingsSection      记忆（开关 + 查看器入口）(202650 / 161844)
 *   w2t  → ProjectMemoryViewer        记忆查看器（项目→文件→预览三级）(202420 / 161768)
 *   G$t  → McpSettingsSection         MCP 服务器（列表/搜索/表单/JSON/导入/远程同步）(194645 / 156627)
 *   y1t  → SkillsSettingsSection      技能（接口级）(195992 / 157604)
 *   d6   → AutomationsMain            自动化（接口级，属 F15 族）(138823 / 115911)
 *   h2t  → IndexingSettingsSection    索引（仓库快照/即时 grep）(202286 / 161628)
 *   O2t  → BrowserSettingsSection     浏览器（Browser Use 开关/导入/清数据）(202904 / 162015)
 *   I0t/H1t/G0t/p2t/V2t/p1t → Plugins/Subagents/Commands/Hooks/Migration/Usage
 *                                   分区（接口级）(199994/197542/200852/202032/203587/195890)
 *   e4t  → UsageSectionTabBar         用量分区 app|codingPlan 标签 (204779 / 163206)
 *
 *  行式原语（右栏 label+control 骨架）：
 *   B3   → SettingsCard               data-slot=card (135212 / 113713)
 *   V3   → SettingsCardContent        data-slot=card-content (135254 / 113744)
 *   U3   → SettingsRow                行：grid [1fr_192px] label+desc | control (+detail) (135334 / 113802)
 *   W3   → SettingsSectionCard        分区卡（B3+V3 零内边距组合）(135363 / 113810)
 *   EMt  → SettingsTitleChip         标题 chip (135369 / 113815)
 *   wMt  → CodeThemeSelect           代码主题下拉（10 主题）(135262 / 113751)
 *   TMt  → CodeThemePreviewCard       亮/暗主题预览卡 (135278 / 113770)
 *   U2t  → DataBaseDirControl         数据目录（只读输入+浏览+保存+状态提示）(203829 / 162548)
 *   M7   → BackLinkButton            ← 返回链接按钮 (193045 / —)
 *   j7   → ResourceGroupHeader        分组头（标题+计数+提示）(193014 / —)
 *   D9   → PendingOperationButton     带 spinner 的操作按钮 (202889 / —)
 *   S9/w9 → Alert/AlertDescription   (202338/202356 / —)
 *   hC/gC/_C/vC → Tabs/TabsList/TabsTrigger/TabsContent 原语 (36949–36991 / —)
 *   DC   → Switch                    Radix Switch 封装 (37297 / —)
 *   iO/aO/oO/sO/cO → Select 原语族   (46009–46104 / —)
 *   $4…o3 → AlertDialog 原语族       (131966–132035 / —)
 *
 *  MCP 子件（本文件接口级，行号在 out/ js）：
 *   KQt  → McpServerList             服务器列表/空态 (192956)
 *   GQt  → McpServerRow              单行（开关/编辑/删除/OAuth）(192850 附近)
 *   U$t  → McpEditorModeTabs         form|JSON 模式切换 (194480)
 *   HQt  → McpServerEditor           表单/JSON 编辑器 (192533)
 *   _$t  → McpImportDialog           外部 agent 配置导入（18 种，settingsSync）(193344)
 *   W$t  → PluginMcpServerList        插件托管 MCP 列表 (194503)
 *
 *  记忆查看器助手：
 *   C2t  → formatMemoryUpdatedLabel   相对时间（刚刚/分钟/今天/昨天/周几/日期）(202396 / 161724)
 *   x2t/S2t → formatWeekday/formatShortDate (202379/202384)
 *   y2t/b2t → startOfDay/formatTimeH23 (202372/202376 附近)
 *   _2t=60000, v2t=30                (202377 附近)
 *   T2t  → errorMessageOf (202644 / 161838)；T9 → hasErrorCode (202647)
 *
 *  设置导航 / 意图（跨分区跳转的状态机）：〔A1-R24〕全域收敛 Home §U.7 逐字 canonical，
 *  本文件仅再导出（墓碑见 §2 位；旧注行号 39251–39405 为漂移值，实测如下）：
 *   $C   → isSettingsSectionId (39305)；ew → isSettingsSectionVisible (39324)
 *   tw   → resolveVisibleSettingsSection (39327)；nw → tryGetSettingsStorage (39330)
 *   HMe  → readLastSettingsSection (39343)；rw → persistLastSettingsSection (39359)
 *   UMe  → readInitialSettingsSection (39371)；iw → openSettingsSection (39375)
 *   aw   → openSettingsUsageSection (39378)；ow → requestSettingsSectionOpen (39381，本面别名 requestSettingsSectionNavigation)
 *   WMe  → clearSettingsSectionIntents (39397)；GMe → consumeSectionIntent (39405)
 *   KMe  → consumeUsageTabIntent (39413)；sw → consumeModelProviderIntent (39425)
 *   qMe  → shouldResetUsageTabToApp (39434)；cw → subscribeSettingsSectionIntent (39442)
 *   JC/YC/XC/ZC/QC → sessionStorage/localStorage/事件 键 (39299–39303)
 *   VMe  → AUTOMATION_SETTINGS_SECTION_VALUES = {automations} (39304)
 *   A9/n4t → codingPlanTabId/parseCodingPlanTabId (204819/204822)
 *   t4t/r4t/i4t/a4t → 团队计划判定/标签/个人源构造/快照可用性 (204813/204825/204832/204839)
 *
 *  外观数据：
 *   TO   → CODE_THEME_OPTIONS         10 个代码主题 (47276)
 *   sze  → CODE_THEME_PREVIEW_SAMPLE  预览示例代码 (47298)
 *   EO   → resolveCodeThemeForMode (47303)；DMt → resolveCodeThemeLabel (135376)
 *   lo   → DEFAULT_CODE_PREVIEW_SETTINGS (1040)；xo → resolveThemeMode (1103)
 *
 *  图标（Sa=createLucideIcon 工厂，js 行）：
 *   Lv settings-2 27752 | wv palette 27522 | Iv server 27746 | O_ brain 26727
 *   jv puzzle 27619 | Yv wand-sparkles 27966 | D_ bot 26708 | Yve alarm-clock 26595
 *   A_ cable 26750 | Gv terminal 27852 | b_ anchor 26603 | Bv shield-check 27779
 *   wye earth 26935 | uye chart-column 26795 | Pv rocket 27687 | Q_ folder-open 27103
 *   Mv refresh-ccw 27671 | Z_ file-text 27060 | $_ folder 27133 | sye box 26716
 *   kv plus 27606 | G_ download 26930 | H_ cloud-upload 26913 | S_ arrow-left 26634
 *   N_ chevron-down（select 指示）| M_ check（select 选中）| wa chevron-right（button chunk）
 *
 *  data-testid 常量（来自 src-HCld2afU.js，out/ 行号）：
 *   Xee=settings-page(8323) | nte=settings-back-button(8324) | lte=settings-section-nav(8325)
 *   Jne=settings-native-search-switch(8326) | Wee=settings-memory-switch(8327)
 *   Ine=settings-memory-refresh(8328) | Cte=settings-memory-back-projects(8329)
 *   One=settings-memory-back-memories(8330) | Ute=settings-memory-workspace(8331)
 *   Pee=settings-memory-file(8332) | cne=settings-memory-preview(8333)
 *   Ze=settings-ask-user-question-auto-resolution-switch(8334)
 *   nne=settings-locale-select-trigger(8335) | wi=settings-locale-select-item(8336)
 *   mne=settings-usage-tab(8342) | qr=testid 模板 `${prefix}-${value}`(8464)
 *
 * ----------------------------------------------------------------------------
 * 二、外部依赖清单（跨 chunk / 跨族）
 * ----------------------------------------------------------------------------
 *  1. react / jsx-runtime            react-BQLj9xdT.js、jsx-runtime-B5yMD3-t.js
 *  2. cn() 类名合并 (Z)               utils-CEEH0K_K.js
 *  3. Button (X) / createLucideIcon (Sa) / chevron-right (wa) / cva (Ta)
 *                                    button-laUijeDG.js
 *  4. useIntlContext (G) → {intl, locale, localePreference, setLocalePreference}
 *                                    IntlProvider-C321H7m8.js
 *  5. usePlatformService (l=M)、toast (m=_)、Input (P=y)、spinner (M=w)、
 *     useSelectDirectory (u=N)      imeComposition-DEYFkwWm.js
 *  6. Tooltip (Ia=u)                 usageStatsUiParts-CiR7YEhh.js
 *  7. logger (J)                     logger-PFDwl5Yq.js
 *  8. zustand create (Ae)、useTaskStore (xe)、useSkillsStore (Ne)、
 *     供应商 id 枚举 (q=mo)           skillStore-BmeKHDBI.js
 *  9. testid 常量 + testid 模板 (qr)  src-HCld2afU.js
 * 10. 本族复用的已抽取组件（TopBar.tsx / Sidebar 族）：
 *     l4 SecondaryWindowShell(129647)、tkt WindowsCaptionControls(129992)、
 *     S6 WindowsCaptionMenu(141854)、U6 HelpMenu(143345)、SRt SidebarFooter(150435)、
 *     c4/s4/ROt Windows caption 常量(129507-129515)、r4 RemoteSyncDialogs(127265)
 * 11. 接口级叶子（本文件仅声明，行号见上表）：
 *     FQt 模型供应商、y1t 技能、d6 自动化、I0t 插件、H1t 子代理、G0t 命令、
 *     p2t Hooks、V2t 迁移、p1t 用量、HQt/_$t/W$t/GQt MCP 子件、
 *     U8 记忆预览渲染器(160323，F14)、gk CodeBlock(48634，F19)
 * 12. Radix 底层原语（打包进本 chunk）：Select/Switch/Tabs/AlertDialog
 *     （CDe/TDe/wDe/EDe/DDe/ODe/kDe/ADe/MDe/jDe、UDe/WDe、JDe/YDe/XDe/ZDe、
 *       yxe/xxe/Sxe/Cxe/Exe/Dxe/wxe…）
 * ============================================================================
 */

import * as React from "react";
import { Settings2 as IconGeneral, Palette as IconAppearance, Server as IconModelProvider, Brain as IconMemory, Puzzle as IconPlugins, WandSparkles as IconSkills, Bot as IconSubagents, AlarmClock as IconAutomations, Cable as IconMcp, Terminal as IconCommands, Anchor as IconHooks, ShieldCheck as IconIndexing, Earth as IconBrowser, ChartColumn as IconUsage, Rocket as IconOnboarding, ArrowLeft as IconArrowLeft, Monitor as IconThemeSystem, Moon as IconThemeDark, Sun as IconThemeLight } from 'lucide-react'; // A0-S3b（留存面）：§4 注册表/主题选项图标 + §15 视图图标
import { Button } from './button'; // A0-CLEANUP 族清理：Button declare 改指 button chunk
import { toast, useSelectDirectory, usePlatformService, type RemoteTarget } from './ImeComposition'; // 〔A1-R49〕+usePlatformService（原 l declare 改指 canonical 富面，本地九员面 + 孤儿型碑化）；〔A1-R50〕+type RemoteTarget（统一属主改指，本地同形副本删除）
import { ModelProviderSettingsSection } from './SettingsPanels';
import { CommandsSettingsSection, HooksSettingsSection, PluginsSettingsSection, SkillsSettingsSection, SubagentsSettingsSection } from './SettingsPanelsCapability';
import { MigrationSettingsSection, UsageSettingsSection } from './SettingsPanelsData';
import { SidebarFooter } from './Sidebar';
import { HelpMenu, WINDOWS_CAPTION_RIGHT_INSET_VAR, WindowsCaptionMenu, windowsCaptionInsetStyle } from './TopBar';
import { useSubscriptionSnapshot, useAppSettings, type ModelMetadata, type ProviderEndpoints } from './UsageDeep'; // A0-CLEANUP3 3b：ModelProvider 面对齐；A1-R11：JM（53488）改指 canonical（components/usage/UsageDeep.tsx §2c）——既有边，无新增环（JM 为组件体内运行时消费）
import { useBaseServices, useServices } from './services';
import { cn } from './UtilsCn'; // Z（utils chunk）
import { useZCodeIntl as useIntlContext } from './I18n'; // G（IntlProvider chunk）
import { InfoTooltip as Tooltip } from './UsageStatsUiParts'; // Ia
import { AutomationsMain } from './SettingsPanelsCapability'; // F15 族（d6）
import { providerIds as ModelProviderId } from './SrcSharedA'; // q=mo（A0-CLEANUP B-7：ModelProviderId declare 改指 providerIds）
import { t as logger } from './logger';
import { useWorkspaceTabStore as useWorkspaceTabsStore, isWorkspaceKindTab as isConversationTab } from './WorkspaceTabsDeep'; // A1-R3：pc/oc declare 与本地 WorkspaceTab/WorkspaceTabsStoreState 型改指 R1 canonical（tombstone 见原声明位）
import type { ChromeImportResult } from '../components/settings/BrowserSettingsSection'; // A0-S4-4a：§0 PlatformService 签名经 type import 消费（原 §12 本文件内型别）
// A0-S4-4a：原 §6–§13 组件单元已迁入 components/settings/；§15 就地消费并经下方再导出
import { SettingsSidebarItem, SettingsCaptionLogo, UsageSectionTabBar } from '../components/settings/SettingsShellParts';
import { GeneralSettingsSection, GeneralSettingsTitleChips } from '../components/settings/GeneralSettingsSection';
import { AppearanceSettingsSection } from '../components/settings/AppearanceSettingsSection';
import { formatWeekday, formatShortDate, formatMemoryUpdatedLabel, errorMessageOf, hasErrorCode, ProjectMemoryViewer, SettingsServicesProvider, MemorySettingsSection } from '../components/settings/MemorySettingsSection';
import { IndexingSettingsSection } from '../components/settings/IndexingSettingsSection';
import { BrowserSettingsSection } from '../components/settings/BrowserSettingsSection';
import { McpSettingsSection } from '../components/settings/McpSettingsSection';
// 〔A1-R24〕设置导航域收敛：原 §2 A0 副本删除，真身 = Home §U.7 逐字（墓碑见原 §2 位）。
// 环安全：Home 顶层 hoisted function 族，本文件全为组件体/渲染期消费；模块级唯一调用面
// SETTINGS_SECTION_REGISTRY 的 filter 只调 hoisted function（无 var/const TDZ 面）。
import {
  isSettingsSectionId,
  isSettingsSectionVisible,
  resolveVisibleSettingsSection,
  readInitialSettingsSection,
  persistLastSettingsSection,
  consumeUsageTabIntent,
  consumeModelProviderIntent,
  requestSettingsSectionOpen as requestSettingsSectionNavigation, // A0 别名：iw/aw 并入本面（iw≡ow 单参；aw≡ow(`usage`)）
  shouldResetUsageTabToApp,
  subscribeSettingsSectionIntent,
  type SettingsSectionId,
  type SettingsSectionIntentDetail,
} from '../components/shell/Home';

/* ============================================================================
 * 0. 外部依赖的类型声明（真实实现位于上面清单所列 chunk；此处为重建接口）
 * ==========================================================================*/

/** react-intl 风格 intl 对象（原 G()，IntlProvider-C321H7m8.js） */
interface IntlShape {
  formatMessage(descriptor: { id: string }, values?: Record<string, unknown>): string;
}
type LocalePreference = "system" | "zh-CN" | "en-US";

/* ── tombstone〔A1-R50〕：本地 RemoteTarget 副本（6 员 family-A 形，A0-CLEANUP3 3b 期
 *    曾为「对齐基准」——六分区 port 行注所引 Settings.RemoteTarget 即本面）删除 →
 *    统一属主改指 components/ime/ImeComposition::RemoteTarget（canonical openInEditor
 *    opts.remoteTarget 内联抽出；经 ./ImeComposition type import，既有边）。消费位
 *    @1658/@1667/@1692 三处 `as RemoteTarget | null` 边界 cast 逐字不变。 ── */
interface AppUser {
  id?: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  [key: string]: unknown; // A0-CLEANUP3 3b：流入 Sidebar.SidebarUser（带索引签名），接口级补齐
}

/* ── tombstone（A1-R49）：本地 PlatformService 九员面 + WindowControlsOverlayMetrics
 *    孤儿型 + declare usePlatformService（原 l，imeComposition chunk 导出别名 M）
 *    删除——改经文件头 ImeComposition import 消费 canonical 富面（R48 增补在案，
 *    R48 BrowserSettingsSection 孤儿型碑同式）。型相容逐员核验：openExternal/
 *    openInFileManager/selectDirectory（canonical 返型多一支 undefined，本叶零消费
 *    成员）同形；syncAppSettings canonical 参型 unknown 包容调用 1291 字面实参；
 *    getWindowControlsOverlayMetrics/onWindowControlsOverlayChanged 结构同形
 *    （消费 907/1184/1188 逐字不变）；importChromeBrowserData/clearEmbeddedBrowserData/
 *    onSettingsChanged 同签名（ChromeImportResult 属主 BrowserSettingsSection@49，
 *    本文件 167 既有 type import 不动）。消费位 901（hook 调用）/1580（prop 透传
 *    GeneralSettingsSection `platform?: unknown` 面具包容）逐字不变。 ── */

/** 目录选择（原 u()=imeComposition chunk N 导出：useSelectDirectory，10883） */

/** toast（原 m，imeComposition chunk 的 _ 导出） */

/** 日志器（原 J，logger-PFDwl5Yq.js） */

/* --- 服务层（原 fs()=useServices 2638 / Ec()=useBaseServices 4897，本 chunk） --- */

interface IntegratedTerminalShell {
  id: string;
  label: string;
  path: string;
  dialect?: string;
  source: "system" | "bundled" | string;
}
type IntegratedTerminalShellSetting =
  | { mode: "auto" }
  | { mode: "shell"; id: string; label: string; path: string; dialect?: string };

/* ── tombstone（A1-R11）：interface AppSettingsSnapshot（原 JM declare 之本地快照面）删除——
 *    declare 改指后全树零消费；具名键面由 canonical AppRuntimeSettings 承接（六键精化入册，余键经索引面）。 ── */
interface RendererSettingsSnapshot {
  dataBaseDir?: string;
  terminalInheritSystemProfile?: boolean;
  terminalFontFamily?: string;
  integratedTerminalShell?: IntegratedTerminalShellSetting;
  httpProxy?: string;
  httpProxyNoProxy?: string;
  httpProxyCaCertPath?: string;
  taskAutoArchiveEnabled?: boolean;
  taskAutoArchiveOlderThanDays?: number;
  closeToTrayOnWindows?: boolean;
  desktopChromiumHardwareAccelerationEnabled?: boolean;
  receivePreviewUpdates?: boolean;
  autoDownloadAndInstallUpdates?: boolean;
  messageStreamShowReasoning?: boolean;
  messageStreamShowTodos?: boolean;
  zcodeInteractionBehavior?: "queue" | "guide";
  optimizeAgentExperienceEnabled?: boolean;
  // A1-R11 精化：宿主设置快照为单对象（JM 53488 settingService.get() 真形），
  // 12 消费域经 useAppSettings 读 provider family/indexing/运行时偏好等键，索引签名兜底
  [key: string]: unknown;
}
export interface SettingService {
  get(): Promise<RendererSettingsSnapshot>;
  // A1-R11 宽化：JM（53516）透传任意补丁键（askUserQuestionAutoResolutionEnabled 具名读，余键透传宿主），
  // 消费面仅 JM 一处（useServices().settingService），Record 面与 AppRuntimeSettingsPatch 索引签名互容
  update(patch: Record<string, unknown>): Promise<void>;
  updateDataBaseDir(dir: string | undefined): Promise<void>;
}
export interface SystemService {
  info(): Promise<{ homedir: string; platform: string }>;
  listIntegratedTerminalShells(): Promise<IntegratedTerminalShell[]>;
}
interface ProjectMemoryWorkspace {
  id: string;
  label: string;
  updatedAt: number;
  files: Array<{ name: string }>;
}
export interface MemoryService {
  listProjectMemories(): Promise<ProjectMemoryWorkspace[]>;
  readProjectMemoryFile(req: { workspaceId: string; fileName: string }): Promise<{ content: string }>;
}
interface McpSyncService {
  [key: string]: unknown;
}
interface PluginManagementService {
  [key: string]: unknown;
}
interface SkillsService {
  [key: string]: unknown;
}
interface ZcodeSessionService {
  [key: string]: unknown;
}
interface WorkspaceServices {
  settingService: SettingService;
  mcpSyncService: McpSyncService;
  pluginManagementService: PluginManagementService;
  skillsService: SkillsService;
  zcodeSessionService: ZcodeSessionService;
  [key: string]: unknown;
}
interface BaseServices {
  systemService: SystemService;
  memoryService: MemoryService;
  mcpSyncService: McpSyncService;
  [key: string]: unknown;
}

/* ── tombstone（A1-R11）：declare useAppSettings（原 JM，53440——普查行漂移，bundle 真身 53488）删除，
 *    改经文件头 ./UsageDeep import 消费（canonical = components/usage/UsageDeep.tsx §2c，JM 53488 逐字）。
 *    型缝：1254 解构 {settings, update} 逐字不变；1255–1257 比较面（=== true / !== false）与 1354–1359
 *    受控态初值读取面均在 AppRuntimeSettings 具名面内（六键本批精化入册）；1399–1527 update 补丁十键
 *    对 AppRuntimeSettingsPatch 索引面可赋。本地 AppSettingsSnapshot 面随删（见本段上方墓碑）。 ── */

/* --- zustand stores（本 chunk 创建点） --- */

export type ThemeMode = "light" | "dark" | "zai-light" | "zai-dark" | "system";
interface CodePreviewSettings {
  lightTheme: string;
  darkTheme: string;
  showLineNumbers: boolean;
  wrapLongLines: boolean;
  fontSizePx: number;
}
/** 原 ko（js 1296，Mie 工厂 1140）：应用级偏好 store（theme/locale/字号/代码预览/通知…） */
declare function useZCodeStore<T>(selector: (s: ZCodeStoreState) => T): T;
interface ZCodeStoreState {
  theme: ThemeMode;
  setTheme(t: ThemeMode): void;
  codePreviewSettings: CodePreviewSettings;
  setCodePreviewSettings(patch: Partial<CodePreviewSettings>): void;
  uiFontSizePx: number;
  setUiFontSizePx(px: number): void;
  notificationEnabled: boolean;
  setNotificationEnabled(v: boolean): void;
  notificationSoundEnabled: boolean;
  setNotificationSoundEnabled(v: boolean): void;
  requestOnboardingDialog(): void;
}
/* ── tombstone（A1-R3）：本地 WorkspaceTab/WorkspaceTabsStoreState 型 + useWorkspaceTabsStore（pc 4753）/
 *    isConversationTab（oc）declare 删除 → 真实 import { useWorkspaceTabStore as useWorkspaceTabsStore,
 *    isWorkspaceKindTab as isConversationTab } from './WorkspaceTabsDeep'（R1 canonical 属主；文件头导入块）。
 *    型别宽化：canonical WorkspaceTab.workspacePath?: string（本地原必具）——选择器面（活动工作区上下文）
 *    皆 === 比较/真值读，兼容；remoteTarget 由 RemoteTarget|null 宽为 unknown（R1 RemoteTarget=unknown），
 *    流入三分区 prop 处按站点边界 cast（见各渲染点行注）。 ── */

/* --- 模型供应商 / Coding Plan（F12 族，接口级） --- */

/* ── tombstone（A0-CLEANUP B-7）：ModelProviderId declare 删除 → import
 *    { providerIds as ModelProviderId } from './SrcSharedA'（原 q=mo）。 ── */
/** A0-CLEANUP3 3b：补足必有面（与 UsageDeep.ModelProvider 对齐；运行期恒有值） */
interface ModelProvider {
  id: string;
  name: string;
  apiKey: string;
  endpoints: ProviderEndpoints;
  models: ModelMetadata[];
  [key: string]: unknown;
}
/** 原 qq()（js 78195）：模型供应商列表 + 排序 + CRUD + 测速 */
declare function useModelProviders(): {
  modelProviders: ModelProvider[];
  displayOrder: string[];
  loading: boolean;
  refreshing: boolean;
  refresh(): Promise<void>;
  saveProvider(provider: ModelProvider): Promise<void>;
  deleteProvider(id: string): Promise<void>;
  saveDisplayOrder(order: string[]): Promise<void>;
  testModelConnectivity(req: unknown): Promise<unknown>;
};
interface CodingPlanSnapshot {
  provider?: { id: string } | null;
  quota?: unknown;
  subscription?: unknown;
  remaining?: unknown;
  unavailableReason?: string | null;
}
/** 原 $j()（js 52449）：订阅/配额快照轮询 */
/** 原 TY()（js 83697）：BigModel 产品列表（团队计划订阅） */
declare function useBigModelProducts(opts: { enabled: boolean; authenticated: boolean }): {
  snapshot: { productList: Array<{ subscribed: boolean; [key: string]: unknown }> } | null;
  loading: boolean;
  refresh(): Promise<void>;
};
/** 原 hX（js 89140）：供应商展示模型归一化 */
declare function normalizeModelProviders(providers: ModelProvider[]): ModelProvider[];
/** 原 rM（js 52600）：订阅快照缓存键 */
declare function subscriptionCacheKey(provider: ModelProvider | undefined): string;
/** A0-CLEANUP3 3b：与 SettingsPanelsData.CodingPlanSource 双向对齐（providerId 必有 + 索引签名） */
interface CodingPlanSource {
  id: string;
  providerId: string;
  label: string;
  [key: string]: unknown;
}
/** 原 pX（js 89061）：团队计划源列表 */
declare function buildTeamPlanSources(input: {
  activeCodingPlanProviderIds: string[];
  availableCodingPlanProviders: ModelProvider[];
  subscribedTeamProducts: Array<{ subscribed: boolean; [key: string]: unknown }>;
}): CodingPlanSource[];
/** 原 fX()（js 89100；A1-R24 行漂校正，旧注 89052 为漂移）：Coding Plan 升级入口上下文 */
declare function useCodingPlanUpgrade(): {
  openCodingPlanUpgrade(input: { providerId: string; funnelContext: string }): void;
};
/* ── tombstone〔A1-R45〕：declare useProviderEntitlements（原 sX 供应商权益钩子，F12）删除——本文件零消费（grep 实测仅本 declare 行），全树独见。
 * 纯删碑；未来消费面出现 → 经 bundle 取证定真身后重新引入。A1-R45 项 2 杂项微批，证据见 A1-R45.report.md §二。 ── */






/* --- 跨族已抽取组件（TopBar.tsx / 窗口壳族 / 侧栏族） --- */

/** 原 l4（js 129647）：次级窗口壳（memo），设置视图的外壳 */
declare const SecondaryWindowShell: React.FC<{
  title: string;
  isDesktop?: boolean;
  isMacDesktop?: boolean;
  isWindowsDesktop?: boolean;
  actions?: React.ReactNode;
  tabBar?: React.ReactNode;
  headerTestId?: string;
  showHeader?: boolean;
  children: React.ReactNode;
}>;
/** 原 tkt（js 129992）：Windows 原生 −□× 占位控件 */
declare const WindowsCaptionControls: React.FC<{ className?: string }>;
/** 原 S6（js 141854，TopBar.tsx WindowsCaptionMenu）：⌄ 应用菜单 */
/** 原 U6（js 143345，TopBar.tsx HelpMenu）：帮助菜单 */
/** 原 SRt（js 150435，侧栏页脚）：主题/语言/用量/登录 底栏 */
/** 原 c4（js 129509，TopBar.tsx）：env(titlebar-area-*) 计算右侧原生控件宽度 */
/** 原 s4（js 129507）：--windows-caption-control-width 变量引用 */
/** 原 ROt（js 129508 附近）：caption 菜单让位的额外 margin 常量 */
declare const WINDOWS_CAPTION_MENU_MARGIN: string;
/** 原 r4（js 127265，TopBar.tsx RemoteSyncDialogs）：远程同步对话框组 */
/* ── tombstone（A0-CLEANUP2 item 14）：canOpenRemoteSessionSource（原 $2）declare 删除
 *    → import { canOpenRemoteSessionSourceCheck as canOpenRemoteSessionSource } from './Modals'。 ── */
/* ── tombstone〔A1-R45〕：declare remoteTargetDisplayLabel 删除——本文件零消费（grep 实测仅本 declare 行）。真身 = modules/SplitLayoutDeep@1585（原 XTt，styles 123242；A1-R4 既判；
 * 旧注「原 q2」为早期误归——q2 实为 remoteTargetDisplayName（R44 簇在案）；Home@168 改指先例；McpSettingsSection@62 为其自有活面，与本文件死面无涉。纯删碑，证据见 A1-R45.report.md §二。 ── */

/* --- UI 原语（跨 chunk） --- */

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "ghost" | "outline" | "destructive";
  size?: "xs" | "sm" | "default" | "lg" | "icon-sm" | "icon-md" | "icon-lg";
}
/* ── tombstone（A0-CLEANUP 族清理）：Button declare 删除 → import { Button } from './button'。 ── */
/** spinner（原 M，imeComposition chunk 的 w 导出：loader-circle） */
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（1）：SpinnerIcon → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */

type IconComponent = React.FC<{ className?: string; "aria-hidden"?: boolean | "true" }>;
/* 图标（原 Sa=createLucideIcon 工厂产物，行号见头部映射表） */
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（30）：IconGeneral/IconAppearance/IconModelProvider/IconMemory/IconPlugins/IconSkills/IconSubagents/IconAutomations/IconMcp/IconCommands/IconHooks/IconIndexing/IconBrowser/IconUsage/IconOnboarding/IconFolderOpen/IconRefresh/IconFileText/IconFolder/IconSkillRow/IconPlus/IconDownload/IconCloudUpload/IconArrowLeft/IconChevronRight/IconChevronDown/IconCheck/IconThemeSystem/IconThemeDark/IconThemeLight → 真实 import（文件头导入块）：npm lucide-react@1.35.0，其中 button chunk 图标（ChevronLeft/ChevronRight/ZoomIn/ZoomOut）经 './button' pass-1 canonical；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */

/* ── tombstone〔A1-R45〕：declare ZCODE_LOGO_DATA_URL（原 uw，js 39411：Win caption 左上 logo）删除——本文件零消费（grep 实测仅本 declare 行）。
 * 活消费面 = SettingsShellParts@80（其本地 declare@29 + 消费，暂代式）；真身 uw 待转录。纯删碑，证据见 A1-R45.report.md §二。 ── */

/* --- Radix 底层原语（打包进本 chunk；此处声明行为接口） --- */

/* ── tombstone（A0-S3c）：Radix Select/Switch/Tabs/AlertDialog 原语 declare 删除 →
 *    npm 具名 import（文件头导入块）：@radix-ui/react-select@2.3.7 / -switch@1.3.7 /
 *    -tabs@1.1.21 / -alert-dialog@1.1.23。RadixSelectGroup 无调用面，随删。
 *    调用面逐字不变。 ── */

/* --- 大块叶子渲染器（跨族，接口级） --- */

/** 原 gk（js 48634，F19 Markdown 族）：代码块渲染器（shiki 主题/行号/换行） */
/** 原 U8（js 160323，F14 代码查看族）：记忆文件预览渲染器（memo） */
/** 原 cj（js 51688，F19）：Markdown 渲染器（此处未直接使用，登记备查） */


/* ============================================================================
 * 1. data-testid 常量（原 src-HCld2afU.js 导出，值已逐条反查，见头部 §一）
 * ==========================================================================*/

const SETTINGS_PAGE_TESTID = "settings-page"; // Xee（8323）
const SETTINGS_BACK_BUTTON_TESTID = "settings-back-button"; // nte（8324）
const SETTINGS_SECTION_NAV_TESTID = "settings-section-nav"; // lte（8325）
export const SETTINGS_NATIVE_SEARCH_SWITCH_TESTID = "settings-native-search-switch"; // Jne（8326）
export const SETTINGS_MEMORY_SWITCH_TESTID = "settings-memory-switch"; // Wee（8327）
export const SETTINGS_MEMORY_REFRESH_TESTID = "settings-memory-refresh"; // Ine（8328）
export const SETTINGS_MEMORY_BACK_PROJECTS_TESTID = "settings-memory-back-projects"; // Cte（8329）
export const SETTINGS_MEMORY_BACK_MEMORIES_TESTID = "settings-memory-back-memories"; // One（8330）
export const SETTINGS_MEMORY_WORKSPACE_TESTID = "settings-memory-workspace"; // Ute（8331）
export const SETTINGS_MEMORY_FILE_TESTID = "settings-memory-file"; // Pee（8332）
export const SETTINGS_MEMORY_PREVIEW_TESTID = "settings-memory-preview"; // cne（8333）
export const SETTINGS_ASK_USER_QUESTION_SWITCH_TESTID = "settings-ask-user-question-auto-resolution-switch"; // Ze（8334）
export const SETTINGS_LOCALE_SELECT_TRIGGER_TESTID = "settings-locale-select-trigger"; // nne（8335）
export const SETTINGS_LOCALE_SELECT_ITEM_TESTID = "settings-locale-select-item"; // wi（8336）
export const SETTINGS_USAGE_TAB_TESTID = "settings-usage-tab"; // mne（8342）

/* ── tombstone〔A1-R42〕：testidOf（原 qr 局部转录）删除 → 一符一家收敛 SrcSharedB@5017 joinTestidParts
 * （qr 真身链：styles 601 `Xa as qr` ← src 9836 `Nb as Xa` ≡ Nb js 8464 ≡ joinTestidParts 逐字 `${e}-${t}`，R41 既判）。
 * 消费面实测 7 处改名改指：本文件 @1485（≡ bundle 205682）+ MemorySettingsSection @296/@319（≡ 202865/202897）
 * + GeneralSettingsSection @245/@248/@251（≡ 204404/204409/204414）+ SettingsShellParts @276（≡ 205102）。 ── */


/* ============================================================================
 * 2. tombstone（A1-R24 · 设置导航域裁定，R21/R23 模式直接套用）
 * ----------------------------------------------------------------------------
 * 原 §2 A0 语义重建（JC/YC/XC/ZC/QC 五键常量 + VMe 隐藏集 + $C/ew/tw/nw/HMe/rw/UMe/
 * GMe/KMe/sw/WMe/ow/cw/qMe 全族；旧注行号 39251–39405 为漂移值）删除。
 * 逐字 canonical = Home §U.7（components/shell/Home.tsx，A1-R24 全域补齐：
 * JC..VMe 39299–39304 | $C 39305 | ew 39324 | tw 39327 | nw 39330 | HMe 39343 |
 * rw 39359 | UMe 39371 | iw 39375 | aw 39378 | ow 39381 | WMe 39397 | GMe 39405 |
 * KMe 39413 | sw 39425 | qMe 39434 | cw 39442；机械逐字校验器段在证）。
 * 裁定证据：bundle 各符唯一真身（39299–39451 区各仅一定义）；终端消费实测——
 * UMe 205200 / rw 205201+205285 / KMe 205239 / sw 205269 / qMe 205338 / cw 205347 /
 * tw 205284 = 本文件设置页（下方调用点逐字不变）；sw 192102 / cw 192121 =
 * ModelProviderSettingsSection；iw 195613 ≡ UsageSettingsSection navigateToSettingsSection；
 * aw 89577 = Home §U.10 4305；ow 89759 = Home §U.10 4487。A0 副本消费面全在本文件内
 * 或已归属面 = 并行重建叠层，判同身；导出面经文件头 import + 下方再导出维持（别名不变）。
 * ==========================================================================*/

export {
  isSettingsSectionId,
  isSettingsSectionVisible,
  resolveVisibleSettingsSection,
  readInitialSettingsSection,
  persistLastSettingsSection,
  consumeUsageTabIntent,
  consumeModelProviderIntent,
  requestSettingsSectionNavigation,
  shouldResetUsageTabToApp,
  subscribeSettingsSectionIntent,
  type SettingsSectionId,
  type SettingsSectionIntentDetail,
};

/* ============================================================================
 * 3. Coding Plan 标签页助手（原 js 204813–204845）
 * ==========================================================================*/

/** 原 t4t（js 204813）：团队计划源以 `team-plan:` 前缀标识 */
export function isTeamPlanSource(source: CodingPlanSource): boolean {
  return source.id.startsWith("team-plan:");
}

/** 原 A9（js 204819）：codingPlan 标签页 id 编码 */
export function codingPlanTabId(sourceId: string): string {
  return `codingPlan:${sourceId}`;
}

/** 原 n4t（js 204822）：从标签页 id 解出供应商 id */
export function parseCodingPlanTabId(tabId: string): string | null {
  return tabId.startsWith("codingPlan:") ? tabId.slice(11) : null;
}

/** 原 r4t（js 204825）：codingPlan 标签文案（团队计划去 BigModel 前缀；多个人源去尾缀）。
 *  index 仅随调用传入（原实现不解构使用），此处保留以对齐调用面。 */
export function resolveCodingPlanTabLabel(input: {
  defaultLabel: string;
  hasMultiplePersonalSources: boolean;
  source: CodingPlanSource;
  index?: number;
}): string {
  if (isTeamPlanSource(input.source)) {
    return input.source.label.replace(/^BigModel\s*-\s*/i, "").trim() || input.source.label;
  }
  if (input.hasMultiplePersonalSources) {
    return input.source.label.replace(/\s*-\s*Coding Plan$/i, "").trim() || input.source.label;
  }
  return input.defaultLabel;
}

/** 原 i4t（js 204832）：个人 Coding Plan 源（Z.ai / BigModel） */
export function buildPersonalCodingPlanSource(input: {
  defaultLabel: string;
  provider: ModelProvider | undefined;
  providerId: string;
}): CodingPlanSource {
  return {
    id: input.providerId,
    providerId: input.providerId,
    label:
      input.provider?.name ??
      (input.providerId === ModelProviderId.zaiCodingPlan
        ? `Z.ai - ${input.defaultLabel}`
        : `BigModel - ${input.defaultLabel}`),
  };
}

/** 原 a4t（js 204839）：快照可用（供应商匹配、非 no_plan、有配额/订阅/余量之一） */
export function hasUsableCodingPlanSnapshot(
  snapshot: CodingPlanSnapshot | null,
  providerId: string,
): boolean {
  return (
    snapshot?.provider?.id === providerId &&
    snapshot.unavailableReason !== "no_plan" &&
    (!!snapshot.quota || !!snapshot.subscription || !!snapshot.remaining)
  );
}

/* ============================================================================
 * 4. 分区注册表与侧栏分组（原 js 203925–203965）
 * ==========================================================================*/

export interface SettingsSectionDescriptor {
  id: SettingsSectionId;
  icon: IconComponent;
  titleId: string;
  groupId: "basics" | "agentCapabilities" | "dataAndStats";
  titleBadgeId?: string;
}

/** 原 G2t（js 203930）：侧栏分组（基础/智能体能力/数据与统计） */
export const SETTINGS_SIDEBAR_GROUPS: Array<{ id: string; titleId: string }> = [
  { id: "basics", titleId: "settings.sidebar.group.basics" },
  { id: "agentCapabilities", titleId: "settings.sidebar.group.agentCapabilities" },
  { id: "dataAndStats", titleId: "settings.sidebar.group.dataAndStats" },
];

/** 原 K2t（js 203935）：14 分区注册表。
 *  图标：settings-2/palette/server/brain/puzzle/wand-sparkles/bot/alarm-clock/
 *        cable/terminal/anchor/shield-check/earth/chart-column。
 *  automations 带 Beta 徽章；`.filter(isSettingsSectionVisible)` 隐藏 automations。 */
const SETTINGS_SECTION_REGISTRY_ALL: SettingsSectionDescriptor[] = [
  { id: "general", icon: IconGeneral, titleId: "settings.systemTitle", groupId: "basics" },
  { id: "appearance", icon: IconAppearance, titleId: "settings.appearanceTitle", groupId: "basics" },
  { id: "modelProvider", icon: IconModelProvider, titleId: "settings.modelProviderTitle", groupId: "basics" },
  { id: "memory", icon: IconMemory, titleId: "settings.memory", groupId: "agentCapabilities" },
  { id: "plugins", icon: IconPlugins, titleId: "settings.plugins.title", groupId: "agentCapabilities" },
  { id: "skills", icon: IconSkills, titleId: "settings.skills.title", groupId: "agentCapabilities" },
  { id: "subagents", icon: IconSubagents, titleId: "settings.subagents.title", groupId: "agentCapabilities" },
  {
    id: "automations",
    icon: IconAutomations,
    titleId: "settings.automations.title",
    titleBadgeId: "settings.automations.betaBadge",
    groupId: "agentCapabilities",
  },
  { id: "mcp", icon: IconMcp, titleId: "settings.mcpTitle", groupId: "agentCapabilities" },
  { id: "commands", icon: IconCommands, titleId: "settings.commands.title", groupId: "agentCapabilities" },
  { id: "hooks", icon: IconHooks, titleId: "settings.hooks.title", groupId: "agentCapabilities" },
  { id: "indexing", icon: IconIndexing, titleId: "settings.indexing.title", groupId: "dataAndStats" },
  { id: "browser", icon: IconBrowser, titleId: "settings.browser.title", groupId: "basics" },
  { id: "usage", icon: IconUsage, titleId: "settings.usageTitle", groupId: "dataAndStats" },
];
export const SETTINGS_SECTION_REGISTRY: SettingsSectionDescriptor[] =
  SETTINGS_SECTION_REGISTRY_ALL.filter((section) => isSettingsSectionVisible(section.id));

/** 原 q2t（js 203962）：分组 × 分区装配（空组剔除） */
export const SETTINGS_GROUPED_SECTIONS: Array<{
  id: string;
  titleId: string;
  sections: SettingsSectionDescriptor[];
}> = SETTINGS_SIDEBAR_GROUPS.map((group) => ({
  ...group,
  sections: SETTINGS_SECTION_REGISTRY.filter((section) => section.groupId === group.id),
})).filter((group) => group.sections.length > 0);

/** 原 J2t（js 203964）：任务自动归档保留天数选项 */
export const AUTO_ARCHIVE_DAY_OPTIONS = [3, 7, 14, 30];

/** 原 Y2t（js 203965）：交互行为选项（排队 | 引导） */
export const INTERACTION_BEHAVIOR_OPTIONS = ["queue", "guide"] as const;

/** 原 W2t（js 203925）：外观主题模式选项（跟随系统 / Z.ai 暗 / Z.ai 亮） */
export const THEME_MODE_OPTIONS: Array<{ mode: ThemeMode; icon: IconComponent }> = [
  { mode: "system", icon: IconThemeSystem },
  { mode: "zai-dark", icon: IconThemeDark },
  { mode: "zai-light", icon: IconThemeLight },
];

/** 原 H3（js 135261）：右栏内容限宽类 */
export const SETTINGS_CONTENT_CLASS = "mx-auto w-full max-w-4xl px-4 pb-8 pt-0 lg:px-8 lg:pb-10";

/** 原 O9（js 204776）：Windows caption 缺省右侧让位宽度（三键 136px） */
export const WINDOWS_CAPTION_DEFAULT_RIGHT_INSET_PX = 136;

/** 原 k9（js 204777）：规范化 WCO rightPaddingPx（正有限数取整，否则 null） */
export function normalizeCaptionRightPaddingPx(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.round(value) : null;
}

/* ============================================================================
 * 5. 外观数据（原 js 47276–47303 / 1040 / 1103）
 * ==========================================================================*/

/** 原 TO（js 47276）：10 个代码主题选项 */
export const CODE_THEME_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "github-light", label: "GitHub Light" },
  { value: "github-dark", label: "GitHub Dark" },
  { value: "vitesse-light", label: "Vitesse Light" },
  { value: "vitesse-dark", label: "Vitesse Dark" },
  { value: "min-light", label: "Minimal Light" },
  { value: "min-dark", label: "Minimal Dark" },
  { value: "github-light-high-contrast", label: "GitHub HC Light" },
  { value: "github-dark-high-contrast", label: "GitHub HC Dark" },
  { value: "catppuccin-latte", label: "Catppuccin Latte" },
  { value: "catppuccin-mocha", label: "Catppuccin Mocha" },
];

/** 原 sze（js 47298）：主题预览示例代码 */
export const CODE_THEME_PREVIEW_SAMPLE = `const themePreview: ThemeConfig = {
  surface: "sidebar",
  accent: "#339CFF",
  contrast: 45,
};`;

/** 原 EO（js 47303）：按明暗模式取代码主题 */
export function resolveCodeThemeForMode(mode: "light" | "dark", settings: CodePreviewSettings): string {
  return mode === "dark" ? settings.darkTheme : settings.lightTheme;
}

/** 原 DMt（js 135376）：代码主题值 → 展示名 */
export function resolveCodeThemeLabel(value: string): string {
  return CODE_THEME_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

/** 原 lo（js 1040）：代码预览缺省设置 */
export const DEFAULT_CODE_PREVIEW_SETTINGS: CodePreviewSettings = {
  lightTheme: "github-light",
  darkTheme: "github-dark",
  showLineNumbers: true,
  wrapLongLines: false,
  fontSizePx: 12,
};

/** 原 xo（js 1103）：主题模式 → 明暗（system 看系统偏好） */
export function resolveThemeMode(theme: ThemeMode): "light" | "dark" {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme === "dark" || theme === "zai-dark" ? "dark" : "light";
}


/* ============================================================================
 * 〔A0-S4-4a：components 拆分（settings/modal 域）——原 §6–§13 组件单元已原样迁入
 *   components/settings/，此处为薄 re-export shim；导入方零改动〕
 *   §6 行式原语          → components/settings/SettingsRowPrimitives.tsx
 *   §7 侧栏/壳层小件     → components/settings/SettingsShellParts.tsx
 *   §8 通用分区（X2t）   → components/settings/GeneralSettingsSection.tsx
 *   §9 外观分区（$2t）   → components/settings/AppearanceSettingsSection.tsx
 *   §10 记忆分区（E2t/w2t）→ components/settings/MemorySettingsSection.tsx
 *   §11 索引分区（h2t）  → components/settings/IndexingSettingsSection.tsx
 *   §12 浏览器分区（O2t）→ components/settings/BrowserSettingsSection.tsx
 *   §13 MCP 分区（G$t）  → components/settings/McpSettingsSection.tsx
 * §0–§5、§14、§15（视图根 j9）留存本文件；§1 中被跨文件消费的 testid 常量与
 * testidOf 补 export（值不变）；ChromeImportResult/PluginRecord 于族文件补 export（型别面）。
 * ==========================================================================*/

export {
  SettingsCard,
  SettingsCardContent,
  SettingsRow,
  SettingsSectionCard,
  SettingsTitleChip,
  PixelNumberInput,
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
  Switch,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Alert,
  AlertDescription,
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '../components/settings/SettingsRowPrimitives';

export {
  BackLinkButton,
  ResourceGroupHeader,
  PendingOperationButton,
  DataBaseDirControl,
} from '../components/settings/SettingsShellParts';
export { SettingsSidebarItem, SettingsCaptionLogo, UsageSectionTabBar }; // §15 就地消费 + 对外再导出

export { GeneralSettingsSection, GeneralSettingsTitleChips }; // §15 就地消费 + 对外再导出
export type { GeneralSettingsSectionProps } from '../components/settings/GeneralSettingsSection';

export { CodeThemeSelect, CodeThemePreviewCard } from '../components/settings/AppearanceSettingsSection';
export { AppearanceSettingsSection }; // §15 就地消费 + 对外再导出

export {
  formatWeekday,
  formatShortDate,
  formatMemoryUpdatedLabel,
  errorMessageOf,
  hasErrorCode,
  ProjectMemoryViewer,
  SettingsServicesProvider,
  MemorySettingsSection,
}; // §15 就地消费（SettingsServicesProvider/MemorySettingsSection）+ 对外再导出

export { IndexingSettingsSection }; // §15 就地消费 + 对外再导出

export { BROWSER_USE_PLUGIN_ID, resolveBrowserImportResultMessage } from '../components/settings/BrowserSettingsSection';
export { BrowserSettingsSection }; // §15 就地消费 + 对外再导出
export type { ChromeImportResult } from '../components/settings/BrowserSettingsSection';

export { McpServerList, McpEditorModeTabs } from '../components/settings/McpSettingsSection';
export { McpSettingsSection }; // §15 就地消费 + 对外再导出
export type { McpServer, McpStatusSnapshot, McpSettingsSectionProps } from '../components/settings/McpSettingsSection';

/* ============================================================================
 * 14. 其余分区（接口级叶子；体量大且与本族弱耦合，保留 props 接口 + 行号）
 * ==========================================================================*/

/** 原 FQt（js 191784–194644 / jsx 154557）：模型供应商分区。
 *  供应商卡列表（`_j` 供应商配置卡 51986）、连接方式（OAuth/API key/自定义端点）、
 *  模型 CRUD/测速/排序、Coding Plan 订阅接线（F12 族 77080–90180）。
 *  深链接：pendingModelProviderTarget（sw() 消费 + cw 意图）。 */

/** 原 y1t（js 195992–197541 / jsx 157604）：技能分区。
 *  工作区/个人/插件三域技能列表（开关/诊断/删除/打开文件管理器）、搜索+过滤、
 *  技能详情面板（含发布元数据）、聊天创建技能（skill-creator）、远程同步。
 *  关键 key：settings.skills.title / scope.〈workspace|plugin|personal〉/
 *  diagnostics.code.〈code〉/ delete.title / create.taskCreateFailed。 */

/** 原 d6（js 138823–139924 / jsx 115911，F15 族根）：自动化主视图。
 *  定时任务列表（≤20 提示）/编辑器入口/运行历史/立即运行/暂停；off-peak 闲时任务接线。
 *  注册表中被 VMe 门控隐藏（侧栏不显示），但 j9 保留渲染分支供意图直达。 */

/** 原 I0t（js 199994）：插件分区（市场浏览 GitHub/Git/dir 源、商店分类/精选、更新/卸载；
 *  市场条目卡 C0t 199415；checkForUpdates 199737/200173）。 */

/** 原 V2t（js 203587）：迁移分区（Claude 历史会话导入向导，z9 导入族）。 */

/** 原 p1t（js 195890）：用量分区（用量统计仪表盘：日趋势/模型分布/高峰时段/工具调用，
 *  数据层 nge 23920；Coding Plan 标签由 e4t 提供）。 */

/** 原 H1t（js 197542）：子代理分区（profile：模型/工具/权限/轮数/颜色、后台标志）。 */

/** 原 G0t（js 200852）：命令分区（用户 .md 斜杠命令 CRUD；commands store F6 142754）。 */

/** 原 p2t（js 202032）：Hooks 分区（事件/匹配/超时/异步；hooks store Z0t 201244）。 */

/* ============================================================================
 * 15. 设置视图根（原 j9，js 204878–205679 / jsx 163283）
 *     布局：`grid-cols-[64px_minmax(0,1fr)] lg:grid-cols-[264px_minmax(0,1fr)]`
 *     左段：drag 条 + 返回工作区 + 分组导航 + onboarding 虚线项 + 页脚
 *     右栏：drag 条 + 圆角卡（[帮助菜单] + 标题行 + 分区内容滚动区）
 * ==========================================================================*/

export interface SettingsViewProps {
  isDesktop: boolean;
  isWindowsDesktop: boolean;
  isMacDesktop: boolean;
  isWebRemoteControl?: boolean;
  windowsWindowControlsRightPaddingPx?: number;
  captionWorkspacePath?: string;
  onBack?: () => void;
  onCreateTask?: () => void;
  onOpenWorkspace?: () => void;
  allowOpenWorkspace?: boolean;
  onLogin?: () => void;
  onLogout?: () => void;
  user?: AppUser | null;
}

export function SettingsView({
  isDesktop,
  isWindowsDesktop,
  isMacDesktop,
  isWebRemoteControl = false,
  windowsWindowControlsRightPaddingPx,
  captionWorkspacePath,
  onBack,
  onCreateTask,
  onOpenWorkspace,
  allowOpenWorkspace = true,
  onLogin,
  onLogout,
  user,
}: SettingsViewProps) {
  const { intl, localePreference, setLocalePreference } = useIntlContext();
  /** 原 y：Linux 桌面 */
  const isLinuxDesktop = !!(isDesktop && !isMacDesktop && !isWindowsDesktop);
  /** 原 b：需要 caption 控件（Win 原生 −□× / Linux 自绘） */
  const showCaptionControls = !!(isWindowsDesktop || isLinuxDesktop);
  const platform = usePlatformService();

  /* --- Windows caption 让位宽度（204894–204907） --- */
  const [captionRightInsetPx, setCaptionRightInsetPx] = React.useState(() =>
    isWindowsDesktop
      ? (normalizeCaptionRightPaddingPx(windowsWindowControlsRightPaddingPx) ??
          normalizeCaptionRightPaddingPx(platform.getWindowControlsOverlayMetrics?.()?.rightPaddingPx) ??
          WINDOWS_CAPTION_DEFAULT_RIGHT_INSET_PX)
      : WINDOWS_CAPTION_DEFAULT_RIGHT_INSET_PX,
  );
  const linuxCaptionClassName = isLinuxDesktop
    ? "right-[120px] rounded-bl-xl border-b border-border bg-background"
    : "right-0";
  const captionMenuStyle = isWindowsDesktop
    ? { ...windowsCaptionInsetStyle(captionRightInsetPx), right: WINDOWS_CAPTION_RIGHT_INSET_VAR }
    : undefined;
  const captionHeaderStyle = isWindowsDesktop
    ? { ...windowsCaptionInsetStyle(captionRightInsetPx), marginRight: `calc(${WINDOWS_CAPTION_RIGHT_INSET_VAR} + ${WINDOWS_CAPTION_MENU_MARGIN})` }
    : undefined;

  /* --- 当前分区（持久化 + 意图；204908–204912） --- */
  const [activeSectionId, setActiveSectionId] = React.useState<SettingsSectionId>(() => {
    const initial = readInitialSettingsSection("general");
    persistLastSettingsSection(initial);
    return initial;
  });

  /* --- 应用偏好 store（204913–204921） --- */
  const theme = useZCodeStore((state) => state.theme);
  const setTheme = useZCodeStore((state) => state.setTheme);
  const codePreviewSettings = useZCodeStore((state) => state.codePreviewSettings);
  const setCodePreviewSettings = useZCodeStore((state) => state.setCodePreviewSettings);
  const uiFontSizePx = useZCodeStore((state) => state.uiFontSizePx);
  const setUiFontSizePx = useZCodeStore((state) => state.setUiFontSizePx);
  const notificationEnabled = useZCodeStore((state) => state.notificationEnabled);
  const setNotificationEnabled = useZCodeStore((state) => state.setNotificationEnabled);
  const notificationSoundEnabled = useZCodeStore((state) => state.notificationSoundEnabled);
  const setNotificationSoundEnabled = useZCodeStore((state) => state.setNotificationSoundEnabled);

  /* --- Coding Plan 标签页数据（204922–204977） --- */
  const { modelProviders, loading: modelProvidersLoading } = useModelProviders();
  const normalizedProviders = React.useMemo(() => normalizeModelProviders(modelProviders), [modelProviders]);
  const zaiCodingPlanProvider = normalizedProviders.find((provider) => provider.id === ModelProviderId.zaiCodingPlan);
  const bigmodelCodingPlanProvider = normalizedProviders.find((provider) => provider.id === ModelProviderId.bigmodelCodingPlan);
  const zaiSnapshot = useSubscriptionSnapshot({
    enabled: !modelProvidersLoading && !!zaiCodingPlanProvider,
    includeSubscription: true,
    preferredProviderId: ModelProviderId.zaiCodingPlan,
    requirePreferredProvider: true,
    allowEnvApiKey: false,
    cacheKey: subscriptionCacheKey(zaiCodingPlanProvider),
  });
  const bigmodelSnapshot = useSubscriptionSnapshot({
    enabled: activeSectionId === "usage" && !modelProvidersLoading && !!bigmodelCodingPlanProvider,
    includeSubscription: true,
    preferredProviderId: ModelProviderId.bigmodelCodingPlan,
    requirePreferredProvider: true,
    allowEnvApiKey: false,
    cacheKey: subscriptionCacheKey(bigmodelCodingPlanProvider),
  });
  const bigmodelProducts = useBigModelProducts({ enabled: !modelProvidersLoading && !!bigmodelCodingPlanProvider, authenticated: true });
  const subscribedTeamProducts = React.useMemo(
    () => bigmodelProducts.snapshot?.productList.filter((product) => product.subscribed === true) ?? [],
    [bigmodelProducts.snapshot?.productList],
  );
  /** 原 ie：用量标签页（`app` | `codingPlan` | `codingPlan:<id>`） */
  const [usageTab, setUsageTab] = React.useState<string>(() => {
    const intent = consumeUsageTabIntent();
    return intent === "codingPlan" ? "codingPlan" : (intent ?? "app");
  });
  /** 原 oe：个人 Coding Plan 源 */
  const personalCodingPlanSources = React.useMemo(() => {
    const sources: CodingPlanSource[] = [];
    const defaultLabel = "Coding Plan";
    if (hasUsableCodingPlanSnapshot(zaiSnapshot.snapshot, ModelProviderId.zaiCodingPlan)) {
      sources.push(
        buildPersonalCodingPlanSource({ defaultLabel, provider: zaiCodingPlanProvider, providerId: ModelProviderId.zaiCodingPlan }),
      );
    }
    if (hasUsableCodingPlanSnapshot(bigmodelSnapshot.snapshot, ModelProviderId.bigmodelCodingPlan)) {
      sources.push(
        buildPersonalCodingPlanSource({ defaultLabel, provider: bigmodelCodingPlanProvider, providerId: ModelProviderId.bigmodelCodingPlan }),
      );
    }
    return sources;
  }, [bigmodelSnapshot.snapshot, bigmodelCodingPlanProvider, zaiSnapshot.snapshot, zaiCodingPlanProvider]);
  /** 原 se：团队计划源 */
  const teamPlanSources = React.useMemo(
    () =>
      buildTeamPlanSources({
        activeCodingPlanProviderIds: [],
        availableCodingPlanProviders: [],
        subscribedTeamProducts,
      }),
    [subscribedTeamProducts],
  );
  /** 原 ce：全部 Coding Plan 源 */
  const codingPlanSources = React.useMemo(
    () => [...personalCodingPlanSources, ...teamPlanSources],
    [personalCodingPlanSources, teamPlanSources],
  );
  /** 原 le/ue/de：当前选中的源 */
  const selectedCodingPlanSourceId = usageTab === "codingPlan" ? (codingPlanSources[0]?.id ?? null) : parseCodingPlanTabId(usageTab);
  const selectedCodingPlanSource = codingPlanSources.find((source) => source.id === selectedCodingPlanSourceId) ?? null;
  const showCodingPlanTab = codingPlanSources.length > 0;
  /** 原 fe/W/pe：加载态 */
  const checkingZaiPlan = !!(zaiCodingPlanProvider && (zaiSnapshot.loading || (!zaiSnapshot.snapshot && !zaiSnapshot.error)));
  const checkingBigmodelPlan = !!(
    bigmodelCodingPlanProvider &&
    (bigmodelSnapshot.loading || (!bigmodelSnapshot.snapshot && !bigmodelSnapshot.error))
  );
  const checkingCodingPlanTab = modelProvidersLoading || checkingZaiPlan || checkingBigmodelPlan || bigmodelProducts.loading;
  /** 原 me：模型供应商深链接意图（一次性） */
  const [initialModelProviderTarget] = React.useState(() => consumeModelProviderIntent());
  const { openCodingPlanUpgrade } = useCodingPlanUpgrade();
  const [pendingModelProviderTarget, setPendingModelProviderTarget] = React.useState<{ providerId: string } | undefined>(
    () => initialModelProviderTarget,
  );
  const handleUsageTabChange = React.useCallback((tabId: string) => {
    setUsageTab(tabId);
  }, []);

  /* codingPlan 标签不可用回落 / 失效源回落（204978–204986） */
  React.useEffect(() => {
    if (usageTab === "codingPlan" && codingPlanSources[0]) setUsageTab(codingPlanTabId(codingPlanSources[0].id));
  }, [usageTab, codingPlanSources]);
  React.useEffect(() => {
    if (usageTab === "app" || usageTab === "codingPlan") return;
    if (!selectedCodingPlanSource) {
      setUsageTab(codingPlanSources[0] ? codingPlanTabId(codingPlanSources[0].id) : "app");
    }
  }, [selectedCodingPlanSource, usageTab, codingPlanSources]);

  /* --- 分区导航与深链接（204987–205000） --- */
  const requestOnboardingDialog = useZCodeStore((state) => state.requestOnboardingDialog);
  const navigateToSection = React.useCallback(
    (section: SettingsSectionId, base: SettingsSectionId = activeSectionId) => {
      const visible = resolveVisibleSettingsSection(section, base);
      setActiveSectionId(visible);
      persistLastSettingsSection(visible);
    },
    [activeSectionId],
  );
  const handleUpgradeClick = React.useCallback(
    (providerId: string, funnelContext: string) => {
      openCodingPlanUpgrade({ providerId, funnelContext });
    },
    [openCodingPlanUpgrade],
  );
  const openModelProviderSection = React.useCallback(() => {
    navigateToSection("modelProvider");
  }, [navigateToSection]);
  const openUsageSection = React.useCallback(() => {
    navigateToSection("usage");
  }, [navigateToSection]);

  /* --- 活动工作区上下文（205001–205015） --- */
  const activeWorkspacePath = useWorkspaceTabsStore((state) => state.activeWorkspacePath);
  const activeWorkspaceIdentity = useWorkspaceTabsStore((state) => state.activeWorkspaceIdentity ?? undefined);
  const activeWorkspaceTab = useWorkspaceTabsStore((state) => {
    const path = state.activeWorkspacePath;
    if (!path) return null;
    const identity = state.activeWorkspaceIdentity ?? undefined;
    const candidates = state.tabs.filter(isConversationTab).filter((tab) => tab.workspacePath === path);
    return (
      candidates.find((tab) => (identity ? tab.workspaceIdentity === identity : !tab.workspaceIdentity)) ??
      candidates[0] ??
      null
    );
  });
  const selectDataBaseDir = useSelectDirectory();
  const services = useServices();
  const baseServices = useBaseServices();
  const { settings: appSettings, update: updateAppSettings } = useAppSettings();
  const memoryEnabled = appSettings?.memoryEnabled === true;
  const nativeSearchEnhancementsEnabled = appSettings?.nativeSearchEnhancementsEnabled !== false;
  const askUserQuestionAutoResolutionEnabled = appSettings?.askUserQuestionAutoResolutionEnabled !== false;

  /* --- 通用分区本地状态（205023–205044） --- */
  const [dataBaseDir, setDataBaseDir] = React.useState("");
  const [terminalInheritSystemProfile, setTerminalInheritSystemProfile] = React.useState(true);
  const [terminalFontFamily, setTerminalFontFamily] = React.useState("");
  const [integratedTerminalShell, setIntegratedTerminalShell] = React.useState<IntegratedTerminalShellSetting>({ mode: "auto" });
  const [integratedTerminalShellOptions, setIntegratedTerminalShellOptions] = React.useState<IntegratedTerminalShell[]>([]);
  const [httpProxy, setHttpProxy] = React.useState("");
  const [httpProxyNoProxy, setHttpProxyNoProxy] = React.useState("");
  const [httpProxyCaCertPath, setHttpProxyCaCertPath] = React.useState("");
  const [taskAutoArchiveEnabled, setTaskAutoArchiveEnabled] = React.useState(false);
  const [taskAutoArchiveOlderThanDays, setTaskAutoArchiveOlderThanDays] = React.useState(7);
  const [closeToTrayOnWindows, setCloseToTrayOnWindows] = React.useState(true);
  const [hardwareAccelerationEnabled, setHardwareAccelerationEnabled] = React.useState(true);
  const [receivePreviewUpdates, setReceivePreviewUpdates] = React.useState(false);
  const [autoDownloadAndInstallUpdates, setAutoDownloadAndInstallUpdates] = React.useState(false);
  const [messageStreamShowReasoning, setMessageStreamShowReasoning] = React.useState(false);
  const [messageStreamShowTodos, setMessageStreamShowTodos] = React.useState(false);
  const [zcodeInteractionBehavior, setZcodeInteractionBehavior] = React.useState<"queue" | "guide">("queue");
  const [optimizeAgentExperienceEnabled, setOptimizeAgentExperienceEnabled] = React.useState(false);
  const [defaultHomeDir, setDefaultHomeDir] = React.useState("");
  const [platformName, setPlatformName] = React.useState("");

  /* codingPlan 标签回落（205045–205053） */
  React.useEffect(() => {
    if (
      shouldResetUsageTabToApp({
        activeTab: usageTab === "app" ? "app" : "codingPlan",
        checkingCodingPlanTab,
        loadingModelProviders: modelProvidersLoading,
        showCodingPlanTab,
      })
    ) {
      setUsageTab("app");
    }
  }, [checkingCodingPlanTab, showCodingPlanTab, subscribedTeamProducts.length, usageTab, modelProvidersLoading]);

  /* 跨窗口意图订阅（205054–205061） */
  React.useEffect(
    () =>
      subscribeSettingsSectionIntent((section, detail) => {
        navigateToSection(section, activeSectionId);
        if (section === "usage" && detail.usageTab) setUsageTab(detail.usageTab);
        if (section === "modelProvider" && detail.modelProviderId) {
          setPendingModelProviderTarget({ providerId: detail.modelProviderId });
        }
      }),
    [activeSectionId, navigateToSection],
  );

  /* 初次载入渲染器设置 + 系统信息（205062–205104） */
  React.useEffect(() => {
    services.settingService
      .get()
      .then((snapshot) => {
        setDataBaseDir(snapshot.dataBaseDir ?? "");
        setTerminalInheritSystemProfile(snapshot.terminalInheritSystemProfile ?? true);
        setTerminalFontFamily(snapshot.terminalFontFamily ?? "");
        setIntegratedTerminalShell(snapshot.integratedTerminalShell ?? { mode: "auto" });
        setHttpProxy(snapshot.httpProxy ?? "");
        setHttpProxyNoProxy(snapshot.httpProxyNoProxy ?? "");
        setHttpProxyCaCertPath(snapshot.httpProxyCaCertPath ?? "");
        setTaskAutoArchiveEnabled(snapshot.taskAutoArchiveEnabled ?? false);
        setTaskAutoArchiveOlderThanDays(snapshot.taskAutoArchiveOlderThanDays ?? 7);
        setCloseToTrayOnWindows(snapshot.closeToTrayOnWindows ?? true);
        setHardwareAccelerationEnabled(snapshot.desktopChromiumHardwareAccelerationEnabled ?? true);
        setReceivePreviewUpdates(snapshot.receivePreviewUpdates ?? false);
        setAutoDownloadAndInstallUpdates(snapshot.autoDownloadAndInstallUpdates ?? false);
        setMessageStreamShowReasoning(snapshot.messageStreamShowReasoning ?? false);
        setMessageStreamShowTodos(snapshot.messageStreamShowTodos ?? false);
        setZcodeInteractionBehavior(snapshot.zcodeInteractionBehavior ?? "queue");
        setOptimizeAgentExperienceEnabled(snapshot.optimizeAgentExperienceEnabled ?? false);
      })
      .catch(() => {});
    baseServices.systemService
      .info()
      .then((info) => {
        setDefaultHomeDir(info.homedir);
        setPlatformName(info.platform);
        if (info.platform !== "win32") {
          setIntegratedTerminalShellOptions([]);
          return;
        }
        baseServices.systemService
          .listIntegratedTerminalShells()
          .then(setIntegratedTerminalShellOptions)
          .catch(() => {
            setIntegratedTerminalShellOptions([]);
          });
      })
      .catch(() => {});
  }, [baseServices.systemService, services.settingService]);

  /* 应用设置快照变化 → 同步相关开关（205105–205112） */
  React.useEffect(() => {
    if (!appSettings) return;
    setOptimizeAgentExperienceEnabled(appSettings.optimizeAgentExperienceEnabled ?? false);
    setMessageStreamShowReasoning(appSettings.messageStreamShowReasoning ?? false);
    setMessageStreamShowTodos(appSettings.messageStreamShowTodos ?? false);
    setZcodeInteractionBehavior(appSettings.zcodeInteractionBehavior ?? "queue");
    setReceivePreviewUpdates(appSettings.receivePreviewUpdates ?? false);
    setAutoDownloadAndInstallUpdates(appSettings.autoDownloadAndInstallUpdates ?? false);
  }, [appSettings]);

  /* Windows WCO 尺寸变化（205113–205124） */
  React.useEffect(() => {
    if (!isWindowsDesktop || !platform.onWindowControlsOverlayChanged) {
      setCaptionRightInsetPx(WINDOWS_CAPTION_DEFAULT_RIGHT_INSET_PX);
      return;
    }
    return platform.onWindowControlsOverlayChanged((metrics) => {
      const normalized = normalizeCaptionRightPaddingPx(metrics.rightPaddingPx);
      if (normalized !== null) setCaptionRightInsetPx(normalized);
    });
  }, [isWindowsDesktop, platform, windowsWindowControlsRightPaddingPx]);

  /* --- 通用分区更新回调（205125–205266） --- */
  const handleTerminalInheritSystemProfileChange = React.useCallback(
    async (value: boolean) => {
      await services.settingService.update({ terminalInheritSystemProfile: value });
      setTerminalInheritSystemProfile(value);
    },
    [services.settingService],
  );
  const handleTerminalFontFamilyChange = React.useCallback(
    async (value: string) => {
      const trimmed = value.trim();
      await services.settingService.update({ terminalFontFamily: trimmed });
      setTerminalFontFamily(trimmed);
    },
    [services.settingService],
  );
  const handleIntegratedTerminalShellChange = React.useCallback(
    async (value: IntegratedTerminalShellSetting) => {
      await services.settingService.update({ integratedTerminalShell: value });
      setIntegratedTerminalShell(value);
    },
    [services.settingService],
  );
  const handleNativeSearchEnhancementsChange = React.useCallback(
    async (value: boolean) => {
      await updateAppSettings({ nativeSearchEnhancementsEnabled: value });
    },
    [updateAppSettings],
  );
  const handleAskUserQuestionAutoResolutionChange = React.useCallback(
    async (value: boolean) => {
      await updateAppSettings({ askUserQuestionAutoResolutionEnabled: value });
    },
    [updateAppSettings],
  );
  const handleMemoryEnabledChange = React.useCallback(
    async (value: boolean) => {
      await updateAppSettings({ memoryEnabled: value });
    },
    [updateAppSettings],
  );
  /** HTTP 代理三项：保存后 toast 提示 `settings.httpProxySavedHint`（205153–205187） */
  const handleHttpProxyChange = React.useCallback(
    async (value: string) => {
      const trimmed = value.trim();
      await services.settingService.update({ httpProxy: trimmed });
      setHttpProxy(trimmed);
      toast(intl.formatMessage({ id: "settings.httpProxySavedHint" }));
    },
    [services.settingService, intl],
  );
  const handleHttpProxyNoProxyChange = React.useCallback(
    async (value: string) => {
      const normalized = value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .join(",");
      await services.settingService.update({ httpProxyNoProxy: normalized });
      setHttpProxyNoProxy(normalized);
      toast(intl.formatMessage({ id: "settings.httpProxySavedHint" }));
    },
    [services.settingService, intl],
  );
  const handleHttpProxyCaCertPathChange = React.useCallback(
    async (value: string) => {
      const trimmed = value.trim();
      await services.settingService.update({ httpProxyCaCertPath: trimmed });
      setHttpProxyCaCertPath(trimmed);
      toast(intl.formatMessage({ id: "settings.httpProxySavedHint" }));
    },
    [services.settingService, intl],
  );
  const handleDataBaseDirChange = React.useCallback(
    async (value: string) => {
      await services.settingService.updateDataBaseDir(value || undefined);
      setDataBaseDir(value);
    },
    [services.settingService],
  );
  const handleTaskAutoArchiveEnabledChange = React.useCallback(
    async (value: boolean) => {
      await services.settingService.update({ taskAutoArchiveEnabled: value });
      setTaskAutoArchiveEnabled(value);
    },
    [services.settingService],
  );
  const handleTaskAutoArchiveDaysChange = React.useCallback(
    async (value: number) => {
      await services.settingService.update({ taskAutoArchiveOlderThanDays: value });
      setTaskAutoArchiveOlderThanDays(value);
    },
    [services.settingService],
  );
  const handleCloseToTrayChange = React.useCallback(
    async (value: boolean) => {
      await services.settingService.update({ closeToTrayOnWindows: value });
      platform.syncAppSettings?.({ closeToTrayOnWindows: value });
      setCloseToTrayOnWindows(value);
    },
    [services.settingService, platform],
  );
  const handleKeepAwakeChange = React.useCallback(
    async (value: boolean) => {
      await updateAppSettings({ keepAwakeWhileRunning: value });
    },
    [updateAppSettings],
  );
  const handleHardwareAccelerationChange = React.useCallback(
    async (value: boolean) => {
      await services.settingService.update({ desktopChromiumHardwareAccelerationEnabled: value });
      setHardwareAccelerationEnabled(value);
      toast(intl.formatMessage({ id: "settings.desktopChromiumHardwareAccelerationSavedHint" }));
    },
    [services.settingService, intl],
  );
  const handleReceivePreviewUpdatesChange = React.useCallback(
    async (value: boolean) => {
      await updateAppSettings({ receivePreviewUpdates: value });
      setReceivePreviewUpdates(value);
    },
    [updateAppSettings],
  );
  const handleAutoDownloadUpdatesChange = React.useCallback(
    async (value: boolean) => {
      await updateAppSettings({ autoDownloadAndInstallUpdates: value });
      setAutoDownloadAndInstallUpdates(value);
    },
    [updateAppSettings],
  );
  const handleShowReasoningChange = React.useCallback(
    async (value: boolean) => {
      await updateAppSettings({ messageStreamShowReasoning: value });
      setMessageStreamShowReasoning(value);
    },
    [updateAppSettings],
  );
  const handleShowTodosChange = React.useCallback(
    async (value: boolean) => {
      await updateAppSettings({ messageStreamShowTodos: value });
      setMessageStreamShowTodos(value);
    },
    [updateAppSettings],
  );
  const handleInteractionBehaviorChange = React.useCallback(
    async (value: "queue" | "guide") => {
      await updateAppSettings({ zcodeInteractionBehavior: value });
      setZcodeInteractionBehavior(value);
    },
    [updateAppSettings],
  );
  const handleOptimizeAgentExperienceChange = React.useCallback(
    async (value: boolean) => {
      await updateAppSettings({ optimizeAgentExperienceEnabled: value });
      setOptimizeAgentExperienceEnabled(value);
    },
    [updateAppSettings],
  );

  /* --- 语言/主题（205267–205285） --- */
  const handleLocaleChange = React.useCallback(
    (value: LocalePreference) => {
      if (value === "system") {
        setLocalePreference("system");
        return;
      }
      if (value === "zh-CN" || value === "en-US") setLocalePreference(value);
    },
    [setLocalePreference],
  );
  const handleThemeChange = React.useCallback(
    (value: ThemeMode) => {
      if (value === "light" || value === "dark" || value === "zai-light" || value === "zai-dark" || value === "system") {
        setTheme(value);
      }
    },
    [setTheme],
  );

  const activeSection = SETTINGS_SECTION_REGISTRY.find((section) => section.id === activeSectionId);
  if (!activeSection) return null;

  return (
    <SecondaryWindowShell
      title={intl.formatMessage({ id: "settings.title" })}
      isDesktop={isDesktop}
      isMacDesktop={isMacDesktop}
      isWindowsDesktop={isWindowsDesktop}
    >
      <div
        data-testid={SETTINGS_PAGE_TESTID}
        className="relative grid h-screen min-h-full w-full grid-cols-[64px_minmax(0,1fr)] grid-rows-[minmax(0,1fr)] lg:grid-cols-[264px_minmax(0,1fr)]"
      >
        {/* Win 左上 logo（205296） */}
        {isWindowsDesktop ? <SettingsCaptionLogo /> : null}

        {/* Linux 自绘窗口控件占位（205297–205305） */}
        {isLinuxDesktop ? (
          <div className="absolute right-0 top-0 z-20 flex h-12 w-[120px] items-center justify-end border-b border-border bg-background pointer-events-auto [app-region:no-drag]">
            <WindowsCaptionControls />
          </div>
        ) : null}

        {/* Win/Linux caption 菜单（205306–205324） */}
        {showCaptionControls ? (
          <div
            style={captionMenuStyle}
            className={cn(
              "absolute top-0 z-30 flex h-12 items-center pointer-events-auto [app-region:no-drag]",
              linuxCaptionClassName,
            )}
          >
            <WindowsCaptionMenu
              workspaceAbsPath={captionWorkspacePath ?? ""}
              onCreateTask={onCreateTask ?? (() => {})}
              onOpenWorkspace={onOpenWorkspace ?? (() => {})}
              allowOpenWorkspace={allowOpenWorkspace}
              allowOpenInFileManager={!!captionWorkspacePath}
              onToggleTerminal={() => {}}
              onToggleBrowser={() => {}}
              triggerPresentation={isWindowsDesktop ? "header-borderless" : "header"}
              useWindowsCaptionSpacing={isWindowsDesktop}
            />
          </div>
        ) : null}

        {/* ── 左段列表（205325–205437） ── */}
        <aside className="min-w-0">
          <div className="flex h-full flex-col">
            {/* 拖拽条 */}
            <div className="h-12 [app-region:drag]" />
            {/* 返回工作区 */}
            <div className="px-2 pb-3 pt-3">
              {onBack ? (
                <Tooltip
                  title={intl.formatMessage({ id: "workspace.backToWorkspace" })}
                  side="right"
                  align="center"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="lg"
                    data-testid={SETTINGS_BACK_BUTTON_TESTID}
                    aria-label={intl.formatMessage({ id: "workspace.backToWorkspace" })}
                    className="m-1 w-[calc(100%-0.5rem)] justify-start gap-2 rounded-xl px-1.5 text-foreground-subtle hover:bg-surface-hover hover:text-foreground max-lg:m-1 max-lg:size-10 max-lg:justify-center max-lg:px-0"
                    onClick={onBack}
                  >
                    <IconArrowLeft className="size-4" />
                    <span className="max-lg:sr-only">{intl.formatMessage({ id: "workspace.backToWorkspace" })}</span>
                  </Button>
                </Tooltip>
              ) : null}
            </div>
            {/* 分组导航 */}
            <nav
              aria-label={intl.formatMessage({ id: "settings.navLabel" })}
              className="flex-1 overflow-y-auto px-2 pb-3"
            >
              <div className="space-y-4">
                {SETTINGS_GROUPED_SECTIONS.map((group, groupIndex) => {
                  const groupTitle = intl.formatMessage({ id: group.titleId });
                  const groupLabelId = `settings-sidebar-group-${group.id}`;
                  return (
                    <div
                      key={group.id}
                      role="group"
                      aria-labelledby={groupLabelId}
                      className={cn("space-y-1", groupIndex > 0 && "max-lg:border-t max-lg:border-border max-lg:pt-3")}
                    >
                      <div
                        id={groupLabelId}
                        className="px-2.5 pb-1 text-ui-sm font-medium text-foreground-subtlest max-lg:sr-only"
                      >
                        {groupTitle}
                      </div>
                      {group.sections.map(({ id, icon, titleId }) => {
                        const isActive = activeSectionId === id;
                        const sectionLabel = intl.formatMessage({ id: titleId });
                        return (
                          <SettingsSidebarItem
                            key={id}
                            icon={icon}
                            label={sectionLabel}
                            active={isActive}
                            aria-current={isActive ? "page" : undefined}
                            data-testid={joinTestidParts(SETTINGS_SECTION_NAV_TESTID, id)}
                            onClick={() => navigateToSection(id)}
                          >
                            {sectionLabel}
                          </SettingsSidebarItem>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
              {/* onboarding 虚线入口（205402–205415） */}
              <SettingsSidebarItem
                icon={IconOnboarding}
                label={intl.formatMessage({ id: "settings.onboarding" })}
                className="mt-4 border border-dashed border-border hover:border-border-hover"
                onClick={requestOnboardingDialog}
              >
                <span className="text-ui-base text-foreground">{intl.formatMessage({ id: "settings.onboarding" })}</span>
              </SettingsSidebarItem>
            </nav>
            {/* 页脚（窄屏隐藏；205416–205434） */}
            <div className="max-lg:hidden">
              <SidebarFooter
                theme={theme}
                localeMenuValue={localePreference}
                onLocaleChange={handleLocaleChange as (value: string) => void} // A0-CLEANUP3 3b：SidebarFooter 菜单面为 string 值域（边界收敛）
                onThemeChange={handleThemeChange as (value: string) => void}
                onSettingsButtonClick={onBack}
                onUsageClick={openUsageSection}
                onUpgradeClick={handleUpgradeClick as (providerId: string | null, funnel: unknown) => void} // A0-CLEANUP3 3b：SidebarFooter 形参面为 (string | null, unknown)（边界收敛）
                onLogin={onLogin}
                onLogout={onLogout}
                settingsButtonMode="back"
                user={user}
                isDesktop={isDesktop}
              />
            </div>
          </div>
        </aside>

        {/* ── 右栏（205438–205678） ── */}
        <section className={cn("flex min-h-0 flex-col", isMacDesktop ? "p-1 pl-0 pt-0" : "p-0")}>
          {/* 顶部拖拽条（Mac 1px；窄屏 16px） */}
          <div className={cn("[app-region:drag]", isMacDesktop && "h-1 max-lg:h-16")} />
          <div className="relative flex flex-col min-h-0 h-full rounded-xl border border-border bg-background">
            {/* 无 caption 平台：右上角帮助菜单（205442–205457） */}
            {showCaptionControls ? null : (
              <div className="absolute top-0 z-50 h-10 w-10 pointer-events-auto [app-region:no-drag] right-0">
                <div className="absolute right-2.5 top-2.5 pointer-events-auto [app-region:no-drag]">
                  <HelpMenu className="relative z-50 [app-region:no-drag]" />
                </div>
              </div>
            )}
            <div className="flex min-h-0 flex-1 flex-col">
              {/* 标题行拖拽区（205459–205470） */}
              <div className="flex h-12 shrink-0">
                <div
                  style={captionHeaderStyle}
                  className={cn(
                    "min-w-0 flex-1 [app-region:drag]",
                    isLinuxDesktop && "mr-[165px]",
                    !showCaptionControls && "mr-12",
                  )}
                />
              </div>
              {/* 内容滚动区 */}
              <main className="min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable]">
                <div className={cn(SETTINGS_CONTENT_CLASS, "flex flex-col gap-8", isMacDesktop && "pt-0")}>
                  {/* 分区标题 + 徽章 + 用量标签（205476–205505） */}
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex min-w-0 flex-wrap items-center gap-3">
                        <h2 className="text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
                          {intl.formatMessage({ id: activeSection.titleId })}
                        </h2>
                        {activeSection.titleBadgeId ? (
                          <span className="inline-flex h-6 items-center rounded-full border border-sky-500 px-2 text-ui-xs font-semibold tracking-normal text-sky-500 dark:border-sky-400 dark:text-sky-400">
                            {intl.formatMessage({ id: activeSection.titleBadgeId })}
                          </span>
                        ) : null}
                        {activeSectionId === "usage" ? (
                          <UsageSectionTabBar
                            activeTab={usageTab}
                            codingPlanSources={codingPlanSources}
                            onTabChange={handleUsageTabChange}
                          />
                        ) : null}
                      </div>
                    </div>
                    {activeSectionId === "general" ? <GeneralSettingsTitleChips localePreference={localePreference} /> : null}
                  </div>

                  {/* 分区内容（205506–205672） */}
                  <div className="space-y-8">
                    {activeSectionId === "general" ? (
                      <GeneralSettingsSection
                        localePreference={localePreference}
                        isDesktop={isDesktop}
                        isWindowsDesktop={isWindowsDesktop}
                        platform={platform}
                        notificationEnabled={notificationEnabled}
                        notificationSoundEnabled={notificationSoundEnabled}
                        closeToTrayOnWindows={closeToTrayOnWindows}
                        keepAwakeWhileRunning={appSettings?.keepAwakeWhileRunning ?? false}
                        desktopChromiumHardwareAccelerationEnabled={hardwareAccelerationEnabled}
                        receivePreviewUpdates={receivePreviewUpdates}
                        autoDownloadAndInstallUpdates={autoDownloadAndInstallUpdates}
                        dataBaseDir={dataBaseDir}
                        terminalInheritSystemProfile={terminalInheritSystemProfile}
                        terminalFontFamily={terminalFontFamily}
                        integratedTerminalShell={integratedTerminalShell}
                        integratedTerminalShellOptions={integratedTerminalShellOptions}
                        nativeSearchEnhancementsEnabled={nativeSearchEnhancementsEnabled}
                        httpProxy={httpProxy}
                        httpProxyNoProxy={httpProxyNoProxy}
                        httpProxyCaCertPath={httpProxyCaCertPath}
                        defaultHomeDir={defaultHomeDir}
                        showIntegratedTerminalShell={platformName === "win32"}
                        setLocalePreference={setLocalePreference}
                        setNotificationEnabled={setNotificationEnabled}
                        setNotificationSoundEnabled={setNotificationSoundEnabled}
                        taskAutoArchiveEnabled={taskAutoArchiveEnabled}
                        taskAutoArchiveOlderThanDays={taskAutoArchiveOlderThanDays}
                        messageStreamShowReasoning={messageStreamShowReasoning}
                        messageStreamShowTodos={messageStreamShowTodos}
                        zcodeInteractionBehavior={zcodeInteractionBehavior}
                        askUserQuestionAutoResolutionEnabled={askUserQuestionAutoResolutionEnabled}
                        optimizeAgentExperienceEnabled={optimizeAgentExperienceEnabled}
                        onDataBaseDirChange={handleDataBaseDirChange}
                        onSelectDataBaseDir={selectDataBaseDir}
                        onTerminalInheritSystemProfileChange={handleTerminalInheritSystemProfileChange}
                        onTerminalFontFamilyChange={handleTerminalFontFamilyChange}
                        onIntegratedTerminalShellChange={handleIntegratedTerminalShellChange}
                        onNativeSearchEnhancementsEnabledChange={handleNativeSearchEnhancementsChange}
                        onHttpProxyChange={handleHttpProxyChange}
                        onHttpProxyNoProxyChange={handleHttpProxyNoProxyChange}
                        onHttpProxyCaCertPathChange={handleHttpProxyCaCertPathChange}
                        onTaskAutoArchiveEnabledChange={handleTaskAutoArchiveEnabledChange}
                        onTaskAutoArchiveOlderThanDaysChange={handleTaskAutoArchiveDaysChange}
                        onCloseToTrayOnWindowsChange={handleCloseToTrayChange}
                        onKeepAwakeWhileRunningChange={handleKeepAwakeChange}
                        onDesktopChromiumHardwareAccelerationChange={handleHardwareAccelerationChange}
                        onReceivePreviewUpdatesChange={handleReceivePreviewUpdatesChange}
                        onAutoDownloadAndInstallUpdatesChange={handleAutoDownloadUpdatesChange}
                        onMessageStreamShowReasoningChange={handleShowReasoningChange}
                        onMessageStreamShowTodosChange={handleShowTodosChange}
                        onZCodeInteractionBehaviorChange={handleInteractionBehaviorChange}
                        onAskUserQuestionAutoResolutionEnabledChange={handleAskUserQuestionAutoResolutionChange}
                        onOptimizeAgentExperienceEnabledChange={handleOptimizeAgentExperienceChange}
                        onOpenOnboardingDialog={requestOnboardingDialog}
                      />
                    ) : activeSectionId === "appearance" ? (
                      <AppearanceSettingsSection
                        codePreviewSettings={codePreviewSettings}
                        setCodePreviewSettings={setCodePreviewSettings}
                        theme={theme}
                        setTheme={setTheme}
                        uiFontSizePx={uiFontSizePx}
                        setUiFontSizePx={setUiFontSizePx}
                      />
                    ) : activeSectionId === "modelProvider" ? (
                      <ModelProviderSettingsSection
                        pendingModelProviderTarget={pendingModelProviderTarget}
                        onConsumePendingModelProviderTarget={() => setPendingModelProviderTarget(undefined)}
                      />
                    ) : activeSectionId === "memory" ? (
                      <SettingsServicesProvider services={baseServices}>
                        <MemorySettingsSection
                          memoryEnabled={memoryEnabled}
                          memoryService={baseServices.memoryService}
                          onMemoryEnabledChange={(value) => void handleMemoryEnabledChange(value)}
                          projectMemoryViewerAvailable={!!isDesktop}
                        />
                      </SettingsServicesProvider>
                    ) : activeSectionId === "mcp" ? (
                      <McpSettingsSection
                        workspacePath={activeWorkspacePath}
                        workspaceIdentity={activeWorkspaceIdentity}
                        remoteSessionId={activeWorkspaceTab?.remoteSessionId}
                        remoteTarget={activeWorkspaceTab?.remoteTarget as RemoteTarget | null} /* 边界（A1-R3）：canonical WorkspaceTab.remoteTarget=unknown（R1 不透明），此处出 tab-store 域入远程同步域（分区 prop 面本地 RemoteTarget）；bundle 原样透传 */
                        localWorkspacePath={activeWorkspaceTab?.localWorkspacePath}
                        isWebRemoteControl={isWebRemoteControl}
                      />
                    ) : activeSectionId === "plugins" ? (
                      <PluginsSettingsSection
                        workspacePath={activeWorkspacePath}
                        workspaceIdentity={activeWorkspaceIdentity}
                        remoteSessionId={activeWorkspaceTab?.remoteSessionId}
                        remoteTarget={activeWorkspaceTab?.remoteTarget as RemoteTarget | null} /* 边界（A1-R3）：同 Mcp 分区渲染点，remoteTarget 由 unknown 收窄至分区 prop 面 */
                        localWorkspacePath={activeWorkspaceTab?.localWorkspacePath}
                        isWebRemoteControl={isWebRemoteControl}
                        onCreateTask={onCreateTask}
                      />
                    ) : activeSectionId === "migration" ? (
                      <MigrationSettingsSection
                        workspacePath={activeWorkspacePath}
                        workspaceIdentity={activeWorkspaceIdentity}
                        isDesktop={isDesktop}
                      />
                    ) : activeSectionId === "usage" ? (
                      <UsageSettingsSection
                        activeTab={usageTab}
                        availableCodingPlanProviders={normalizedProviders}
                        modelProvidersLoading={modelProvidersLoading}
                        selectedCodingPlanSource={selectedCodingPlanSource}
                        workspaceIdentity={activeWorkspaceIdentity}
                        workspacePath={activeWorkspacePath ?? undefined}
                      />
                    ) : activeSectionId === "skills" ? (
                      <SkillsSettingsSection
                        workspacePath={activeWorkspacePath}
                        workspaceIdentity={activeWorkspaceIdentity}
                        remoteSessionId={activeWorkspaceTab?.remoteSessionId}
                        remoteTarget={activeWorkspaceTab?.remoteTarget as RemoteTarget | null} /* 边界（A1-R3）：同 Mcp 分区渲染点，remoteTarget 由 unknown 收窄至分区 prop 面 */
                        isWebRemoteControl={isWebRemoteControl}
                      />
                    ) : activeSectionId === "subagents" ? (
                      <SubagentsSettingsSection
                        onManageModels={openModelProviderSection}
                        workspacePath={activeWorkspacePath}
                        workspaceIdentity={activeWorkspaceIdentity}
                      />
                    ) : activeSectionId === "automations" ? (
                      <AutomationsMain workspacePath={activeWorkspacePath} workspaceIdentity={activeWorkspaceIdentity} />
                    ) : activeSectionId === "commands" ? (
                      <CommandsSettingsSection workspacePath={activeWorkspacePath} workspaceIdentity={activeWorkspaceIdentity} />
                    ) : activeSectionId === "hooks" ? (
                      <HooksSettingsSection workspacePath={activeWorkspacePath} workspaceIdentity={activeWorkspaceIdentity} />
                    ) : activeSectionId === "indexing" ? (
                      <IndexingSettingsSection />
                    ) : activeSectionId === "browser" ? (
                      <BrowserSettingsSection
                        isDesktop={!!isDesktop}
                        isWindowsDesktop={isWindowsDesktop}
                        workspacePath={activeWorkspacePath}
                        workspaceIdentity={activeWorkspaceIdentity}
                      />
                    ) : null}
                  </div>
                </div>
              </main>
            </div>
          </div>
        </section>
      </div>
    </SecondaryWindowShell>
  );
}

/** 原 j9 的默认导出形态：应用根按 `settings` 路由挂载本组件 */
export default SettingsView;






import { joinTestidParts } from './SrcSharedB'; // 〔A1-R42〕原 testidOf（qr 局部转录）收敛改指——canonical joinTestidParts@5017（R41 既判链）。尾部导入：ES 模块提升，等价文件头，行引用零漂（R35 @10315 先例）。环安全：Settings→SrcSharedB 值闭包（纯助手），无反向边。
