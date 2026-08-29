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
 *  设置导航 / 意图（跨分区跳转的状态机）：
 *   $C   → isSettingsSectionId (39257)；ew → isSettingsSectionVisible (39276)
 *   tw   → resolveVisibleSettingsSection (39279)；rw → persistLastSettingsSection (39311)
 *   UMe  → readInitialSettingsSection (39323)；KMe → consumeUsageTabIntent (39365)
 *   sw   → consumeModelProviderIntent (39377)；qMe → shouldResetUsageTabToApp (39386)
 *   cw   → subscribeSettingsSectionIntent (39394)；ow/iw/aw → requestSettingsSectionNavigation (39330)
 *   JC/YC/XC/ZC/QC → sessionStorage/localStorage/事件 键 (39251–39255)
 *   VMe  → HIDDEN_SETTINGS_SECTIONS = {automations} (39256)
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
 *     c4/s4/ROt Windows caption 常量(129507-129515)、r4 RemoteSyncDialogs(127248)
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
import { Input, toast, useSelectDirectory } from './ImeComposition';
import { RemoteSyncDialogs } from './Modals';
import { McpImportDialog, McpServerEditor, McpServerRow, ModelProviderSettingsSection } from './SettingsPanels';
import { CommandsSettingsSection, HooksSettingsSection, PluginsSettingsSection, SkillsSettingsSection, SubagentsSettingsSection } from './SettingsPanelsCapability';
import { MemoryFilePreview, MigrationSettingsSection, UsageSettingsSection } from './SettingsPanelsData';
import { SidebarFooter } from './Sidebar';
import { useSkillsStore } from './SkillStore';
import { HelpMenu, WINDOWS_CAPTION_RIGHT_INSET_VAR, WindowsCaptionMenu, windowsCaptionInsetStyle } from './TopBar';
import { useSubscriptionSnapshot } from './UsageDeep';
import { useBaseServices, useServices } from './services';
import { useMcpStore, usePluginsStore } from './stores-workspace';
import { cn } from './UtilsCn'; // Z（utils chunk）
import { useZCodeIntl as useIntlContext } from './I18n'; // G（IntlProvider chunk）
import { useConfirmDialog } from './Modals';
import { InfoTooltip as Tooltip } from './UsageStatsUiParts'; // Ia
import { CodeBlock } from './SettingsPanelsData'; // gk（48634）
import { AutomationsMain } from './SettingsPanelsCapability'; // F15 族（d6）
import { isDataBaseDirForbiddenError as isForbiddenInstallDirError } from './SrcSharedB'; // dS（9110/8991）
import { isRepoSnapshotIndexingUserEnabled as resolveRepoSnapshotIndexingEnabled } from './SrcSharedA'; // Go（4535）
import { t as logger } from './logger';

/* ============================================================================
 * 0. 外部依赖的类型声明（真实实现位于上面清单所列 chunk；此处为重建接口）
 * ==========================================================================*/

/** react-intl 风格 intl 对象（原 G()，IntlProvider-C321H7m8.js） */
interface IntlShape {
  formatMessage(descriptor: { id: string }, values?: Record<string, unknown>): string;
}
type LocalePreference = "system" | "zh-CN" | "en-US";

interface RemoteTarget {
  kind: "ssh" | "wsl" | "docker" | "server";
  host?: string;
  port?: number;
  container?: string;
  sshConfigAlias?: string;
}
interface AppUser {
  id?: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
}

/** 桌面平台服务（原 l()，imeComposition chunk 的 M 导出）——IPC 桥 */
interface WindowControlsOverlayMetrics {
  rightPaddingPx?: number;
}
interface PlatformService {
  openExternal(url: string): void | Promise<void>;
  openInFileManager(path: string): Promise<{ success: boolean; error?: string }>;
  selectDirectory(): Promise<string | null>;
  syncAppSettings?(patch: { closeToTrayOnWindows?: boolean }): void;
  getWindowControlsOverlayMetrics?(): WindowControlsOverlayMetrics | null;
  onWindowControlsOverlayChanged?(cb: (m: WindowControlsOverlayMetrics) => void): () => void;
  importChromeBrowserData?(): Promise<ChromeImportResult>;
  clearEmbeddedBrowserData?(mode: "cache" | "all"): Promise<{ success: boolean }>;
  onSettingsChanged?(cb: () => void): () => void;
}
declare function usePlatformService(): PlatformService;

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

interface AppSettingsSnapshot {
  memoryEnabled?: boolean;
  nativeSearchEnhancementsEnabled?: boolean;
  askUserQuestionAutoResolutionEnabled?: boolean;
  keepAwakeWhileRunning?: boolean;
  messageStreamShowReasoning?: boolean;
  messageStreamShowTodos?: boolean;
  zcodeInteractionBehavior?: "queue" | "guide";
  optimizeAgentExperienceEnabled?: boolean;
  receivePreviewUpdates?: boolean;
  autoDownloadAndInstallUpdates?: boolean;
  modelProviderFamilyModes?: Record<string, string>;
  modelProviderFamilySelectedKeys?: Record<string, string>;
  providerFamilyDomain?: string;
  instantGrepIndexingEnabled?: boolean;
  repoSnapshotIndexingEnabled?: boolean;
  repoSnapshotIndexingUserConfigured?: boolean;
}
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
}
interface SettingService {
  get(): Promise<RendererSettingsSnapshot>;
  update(patch: Partial<RendererSettingsSnapshot>): Promise<void>;
  updateDataBaseDir(dir: string | undefined): Promise<void>;
}
interface SystemService {
  info(): Promise<{ homedir: string; platform: string }>;
  listIntegratedTerminalShells(): Promise<IntegratedTerminalShell[]>;
}
interface ProjectMemoryWorkspace {
  id: string;
  label: string;
  updatedAt: number;
  files: Array<{ name: string }>;
}
interface MemoryService {
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

/** 原 JM()（js 53440）：应用设置快照 + 更新器（带广播/监听刷新） */
declare function useAppSettings(): {
  settings: AppSettingsSnapshot | null;
  loading: boolean;
  error: unknown;
  update(patch: Partial<AppSettingsSnapshot>): Promise<void>;
};

/* --- zustand stores（本 chunk 创建点） --- */

type ThemeMode = "light" | "dark" | "zai-light" | "zai-dark" | "system";
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
interface WorkspaceTab {
  workspacePath: string;
  workspaceIdentity?: string | null;
  remoteSessionId?: string | null;
  remoteTarget?: RemoteTarget | null;
  localWorkspacePath?: string | null;
  [key: string]: unknown;
}
interface WorkspaceTabsStoreState {
  activeWorkspacePath: string | null;
  activeWorkspaceIdentity: string | null;
  tabs: WorkspaceTab[];
}
/** 原 pc（js 4753）：工作区标签页 store 选择器 */
declare function useWorkspaceTabsStore<T>(selector: (s: WorkspaceTabsStoreState) => T): T;
/** 原 oc：过滤出会话类标签页的谓词（工作区标签页筛选） */
declare function isConversationTab(tab: WorkspaceTab): boolean;

/* --- 模型供应商 / Coding Plan（F12 族，接口级） --- */

/** 原 q（skillStore chunk 的 mo 导出）：内置供应商 id 枚举 */
declare const ModelProviderId: {
  zaiCodingPlan: string;
  bigmodelCodingPlan: string;
  [key: string]: string;
};
interface ModelProvider {
  id: string;
  name: string;
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
interface CodingPlanSource {
  id: string;
  providerId?: string;
  label: string;
}
/** 原 pX（js 89061）：团队计划源列表 */
declare function buildTeamPlanSources(input: {
  activeCodingPlanProviderIds: string[];
  availableCodingPlanProviders: ModelProvider[];
  subscribedTeamProducts: Array<{ subscribed: boolean; [key: string]: unknown }>;
}): CodingPlanSource[];
/** 原 fX()（js 89052）：Coding Plan 升级入口上下文 */
declare function useCodingPlanUpgrade(): {
  openCodingPlanUpgrade(input: { providerId: string; funnelContext: string }): void;
};
/** 原 sX：供应商权益（entitlements）钩子（F12） */
declare function useProviderEntitlements(input: {
  modelProviders: ModelProvider[];
  loading: boolean;
  modelProviderFamilySelectedKeys?: Record<string, string>;
  suppressProviderFingerprintAutoRefresh?: boolean;
}): { entitlements: unknown; refresh(): Promise<void> };

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
/** 原 r4（js 127248，TopBar.tsx RemoteSyncDialogs）：远程同步对话框组 */
/** 原 $2（js 127125）：是否可打开远程会话源（远程同步可用性判定） */
declare function canOpenRemoteSessionSource(input: {
  remoteSessionId?: string | null;
  remoteTarget?: RemoteTarget | null;
  clientMode: "web-remote-replayable" | "desktop-continuous";
  hasLocalSourceService: boolean;
}): boolean;
/** 原 q2：远程目标展示标签 */
declare function remoteTargetDisplayLabel(target: RemoteTarget, workspacePath: string): string;

/* --- UI 原语（跨 chunk） --- */

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "ghost" | "outline" | "destructive";
  size?: "xs" | "sm" | "default" | "lg" | "icon-sm" | "icon-md" | "icon-lg";
}
declare const Button: React.FC<ButtonProps>;
/** spinner（原 M，imeComposition chunk 的 w 导出：loader-circle） */
declare const SpinnerIcon: React.FC<{ className?: string; "aria-hidden"?: boolean | "true" }>;

type IconComponent = React.FC<{ className?: string; "aria-hidden"?: boolean | "true" }>;
/* 图标（原 Sa=createLucideIcon 工厂产物，行号见头部映射表） */
declare const IconGeneral: IconComponent; // settings-2 (Lv)
declare const IconAppearance: IconComponent; // palette (wv)
declare const IconModelProvider: IconComponent; // server (Iv)
declare const IconMemory: IconComponent; // brain (O_)
declare const IconPlugins: IconComponent; // puzzle (jv)
declare const IconSkills: IconComponent; // wand-sparkles (Yv)
declare const IconSubagents: IconComponent; // bot (D_)
declare const IconAutomations: IconComponent; // alarm-clock (Yve)
declare const IconMcp: IconComponent; // cable (A_)
declare const IconCommands: IconComponent; // terminal (Gv)
declare const IconHooks: IconComponent; // anchor (b_)
declare const IconIndexing: IconComponent; // shield-check (Bv)
declare const IconBrowser: IconComponent; // earth (wye)
declare const IconUsage: IconComponent; // chart-column (uye)
declare const IconOnboarding: IconComponent; // rocket (Pv)
declare const IconFolderOpen: IconComponent; // folder-open (Q_)
declare const IconRefresh: IconComponent; // refresh-ccw (Mv)
declare const IconFileText: IconComponent; // file-text (Z_)
declare const IconFolder: IconComponent; // folder ($_)
declare const IconSkillRow: IconComponent; // box (sye)
declare const IconPlus: IconComponent; // plus (kv)
declare const IconDownload: IconComponent; // download (G_)
declare const IconCloudUpload: IconComponent; // cloud-upload (H_)
declare const IconArrowLeft: IconComponent; // arrow-left (S_)
declare const IconChevronRight: IconComponent; // chevron-right (wa，button chunk)
declare const IconChevronDown: IconComponent; // chevron-down (N_)
declare const IconCheck: IconComponent; // check (M_)
declare const IconThemeSystem: IconComponent; // ebe（monitor 系）
declare const IconThemeDark: IconComponent; // xv（moon 系）
declare const IconThemeLight: IconComponent; // Sbe（sun 系）

/** ZCode logo data-url（原 uw，js 39411）：Win caption 左上 logo */
declare const ZCODE_LOGO_DATA_URL: string;

/* --- Radix 底层原语（打包进本 chunk；此处声明行为接口） --- */

declare const RadixSelectRoot: React.FC<{
  value: string;
  onValueChange: (v: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}>;
declare const RadixSelectValue: React.FC<{ placeholder?: string; children?: React.ReactNode }>;
declare const RadixSelectTrigger: React.ForwardRefExoticComponent<
  React.ButtonHTMLAttributes<HTMLButtonElement> & React.RefAttributes<HTMLButtonElement>
>;
declare const RadixSelectIcon: React.FC<{ asChild?: boolean; children: React.ReactNode }>;
declare const RadixSelectPortal: React.FC<{ children: React.ReactNode }>;
declare const RadixSelectContent: React.FC<
  React.HTMLAttributes<HTMLDivElement> & { position?: "item-aligned" | "popper"; align?: "start" | "center" | "end" }
>;
declare const RadixSelectViewport: React.FC<React.HTMLAttributes<HTMLDivElement> & { "data-position"?: string }>;
declare const RadixSelectItem: React.ForwardRefExoticComponent<
  React.HTMLAttributes<HTMLDivElement> & { value: string; disabled?: boolean } & React.RefAttributes<HTMLDivElement>
>;
declare const RadixSelectItemText: React.FC<{ children: React.ReactNode }>;
declare const RadixSelectItemIndicator: React.FC<{ children: React.ReactNode }>;
declare const RadixSelectScrollUpButton: React.FC<React.HTMLAttributes<HTMLDivElement>>;
declare const RadixSelectScrollDownButton: React.FC<React.HTMLAttributes<HTMLDivElement>>;
declare const RadixSelectGroup: React.FC<React.HTMLAttributes<HTMLDivElement>>;

declare const RadixSwitchRoot: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    checked: boolean;
    onCheckedChange: (v: boolean) => void;
  }
>;
declare const RadixSwitchThumb: React.FC<React.HTMLAttributes<HTMLSpanElement>>;

declare const RadixTabsRoot: React.FC<
  React.HTMLAttributes<HTMLDivElement> & { value: string; onValueChange: (v: string) => void }
>;
declare const RadixTabsList: React.FC<React.HTMLAttributes<HTMLDivElement>>;
declare const RadixTabsTrigger: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }>;
declare const RadixTabsContent: React.FC<React.HTMLAttributes<HTMLDivElement> & { value: string }>;

declare const RadixAlertDialogRoot: React.FC<{ open?: boolean; onOpenChange?: (v: boolean) => void; children: React.ReactNode }>;
declare const RadixAlertDialogPortal: React.FC<{ children: React.ReactNode }>;
declare const RadixAlertDialogOverlay: React.FC<React.HTMLAttributes<HTMLDivElement>>;
declare const RadixAlertDialogContent: React.FC<React.HTMLAttributes<HTMLDivElement>>;
declare const RadixAlertDialogTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>>;
declare const RadixAlertDialogDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>>;
declare const RadixAlertDialogAction: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>>;
declare const RadixAlertDialogCancel: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>>;

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
const SETTINGS_NATIVE_SEARCH_SWITCH_TESTID = "settings-native-search-switch"; // Jne（8326）
const SETTINGS_MEMORY_SWITCH_TESTID = "settings-memory-switch"; // Wee（8327）
const SETTINGS_MEMORY_REFRESH_TESTID = "settings-memory-refresh"; // Ine（8328）
const SETTINGS_MEMORY_BACK_PROJECTS_TESTID = "settings-memory-back-projects"; // Cte（8329）
const SETTINGS_MEMORY_BACK_MEMORIES_TESTID = "settings-memory-back-memories"; // One（8330）
const SETTINGS_MEMORY_WORKSPACE_TESTID = "settings-memory-workspace"; // Ute（8331）
const SETTINGS_MEMORY_FILE_TESTID = "settings-memory-file"; // Pee（8332）
const SETTINGS_MEMORY_PREVIEW_TESTID = "settings-memory-preview"; // cne（8333）
const SETTINGS_ASK_USER_QUESTION_SWITCH_TESTID = "settings-ask-user-question-auto-resolution-switch"; // Ze（8334）
const SETTINGS_LOCALE_SELECT_TRIGGER_TESTID = "settings-locale-select-trigger"; // nne（8335）
const SETTINGS_LOCALE_SELECT_ITEM_TESTID = "settings-locale-select-item"; // wi（8336）
const SETTINGS_USAGE_TAB_TESTID = "settings-usage-tab"; // mne（8342）

/** 原 qr（src chunk 的 Nb，8464）：testid 模板 `${prefix}-${value}` */
function testidOf(prefix: string, value: string): string {
  return `${prefix}-${value}`;
}

/* ============================================================================
 * 2. 设置导航状态机（原 js 39251–39405：分区持久化 + 跨窗口意图事件）
 * ==========================================================================*/

/** 原 JC/YC/XC/ZC/QC（js 39251–39255）：意图与记忆的存储键 */
const SETTINGS_SECTION_INTENT_STORAGE_KEY = "zcode-settings-section-intent";
const SETTINGS_USAGE_TAB_INTENT_STORAGE_KEY = "zcode-settings-usage-tab-intent";
const SETTINGS_MODEL_PROVIDER_INTENT_STORAGE_KEY = "zcode-settings-model-provider-id-intent";
const SETTINGS_SECTION_INTENT_EVENT = "zcode:settings-section-intent";
const SETTINGS_LAST_SECTION_STORAGE_KEY = "zcode-settings-last-section";

/** 设置分区 id 全集（原 $C，js 39257） */
export type SettingsSectionId =
  | "general"
  | "appearance"
  | "migration"
  | "indexing"
  | "browser"
  | "modelProvider"
  | "memory"
  | "mcp"
  | "plugins"
  | "usage"
  | "skills"
  | "subagents"
  | "commands"
  | "hooks"
  | "automations";

/** 原 $C（js 39257） */
export function isSettingsSectionId(value: unknown): value is SettingsSectionId {
  return (
    value === "general" ||
    value === "appearance" ||
    value === "migration" ||
    value === "indexing" ||
    value === "browser" ||
    value === "modelProvider" ||
    value === "memory" ||
    value === "mcp" ||
    value === "plugins" ||
    value === "usage" ||
    value === "skills" ||
    value === "subagents" ||
    value === "commands" ||
    value === "hooks" ||
    value === "automations"
  );
}

/** 原 VMe（js 39256）：隐藏分区集合。
 *  注意：`automations` 在 3.7.6 被门控隐藏——注册表 K2t 的 `.filter(ew)` 会把它过滤掉，
 *  但 j9 的分区渲染分支仍保留 `automations → d6`（深链接/意图仍可进入）。 */
const HIDDEN_SETTINGS_SECTIONS = new Set<SettingsSectionId>(["automations"]);

/** 原 ew（js 39276） */
export function isSettingsSectionVisible(id: SettingsSectionId): boolean {
  return !HIDDEN_SETTINGS_SECTIONS.has(id);
}

/** 原 tw（js 39279）：不可见分区回落到缺省分区 */
export function resolveVisibleSettingsSection(
  id: SettingsSectionId,
  fallback: SettingsSectionId = "general",
): SettingsSectionId {
  return isSettingsSectionVisible(id) ? id : fallback;
}

function tryGetSettingsStorage(): Storage | null {
  if (typeof window > "u") return null;
  try {
    return window.localStorage;
  } catch (error) {
    logger.warn("[settingsNavigation] localStorage 不可用", {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/** 原 HMe（js 39294）：读取上次分区（含历史名 `codePreview` → `appearance` 迁移） */
function readLastSettingsSection(fallback: SettingsSectionId = "general"): SettingsSectionId {
  const storage = tryGetSettingsStorage();
  if (!storage) return fallback;
  try {
    const raw = storage.getItem(SETTINGS_LAST_SECTION_STORAGE_KEY);
    if (raw === "codePreview") {
      storage.setItem(SETTINGS_LAST_SECTION_STORAGE_KEY, "appearance");
      return "appearance";
    }
    if (raw && isSettingsSectionId(raw)) return resolveVisibleSettingsSection(raw, fallback);
    if (raw !== null) storage.removeItem(SETTINGS_LAST_SECTION_STORAGE_KEY);
  } catch (error) {
    logger.warn("[settingsNavigation] 读取上次设置分区失败", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
  return fallback;
}

/** 原 rw（js 39311）：持久化当前分区 */
export function persistLastSettingsSection(id: SettingsSectionId): void {
  const visible = resolveVisibleSettingsSection(id);
  const storage = tryGetSettingsStorage();
  if (!storage) return;
  try {
    storage.setItem(SETTINGS_LAST_SECTION_STORAGE_KEY, visible);
  } catch (error) {
    logger.warn("[settingsNavigation] 写入上次设置分区失败", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/** 原 GMe（js 39355）：消费一次性分区跳转意图（sessionStorage，读后即删） */
function consumeSectionIntent(fallback: SettingsSectionId = "general"): SettingsSectionId {
  if (typeof window > "u") return fallback;
  try {
    const raw = window.sessionStorage.getItem(SETTINGS_SECTION_INTENT_STORAGE_KEY);
    if (raw !== null) window.sessionStorage.removeItem(SETTINGS_SECTION_INTENT_STORAGE_KEY);
    if (raw && isSettingsSectionId(raw)) return raw;
  } catch {
    /* 忽略：隐私模式等场景 sessionStorage 不可用 */
  }
  return fallback;
}

/** 原 UMe（js 39323）：初始分区 = 意图 > 上次记忆 > general（均过可见性过滤） */
export function readInitialSettingsSection(fallback: SettingsSectionId = "general"): SettingsSectionId {
  const remembered = readLastSettingsSection(fallback);
  return resolveVisibleSettingsSection(consumeSectionIntent(remembered), remembered);
}

/** 原 KMe（js 39365）：消费用量标签页意图（`app` | `codingPlan`，读后即删） */
export function consumeUsageTabIntent(): "app" | "codingPlan" | undefined {
  if (typeof window > "u") return undefined;
  try {
    const raw = window.sessionStorage.getItem(SETTINGS_USAGE_TAB_INTENT_STORAGE_KEY);
    if (raw !== null) window.sessionStorage.removeItem(SETTINGS_USAGE_TAB_INTENT_STORAGE_KEY);
    return raw === "app" || raw === "codingPlan" ? raw : undefined;
  } catch {
    return undefined;
  }
}

/** 原 sw（js 39377）：消费模型供应商深链接意图（读后即删） */
export function consumeModelProviderIntent(): { providerId: string } | undefined {
  if (typeof window > "u") return undefined;
  try {
    const raw = window.sessionStorage.getItem(SETTINGS_MODEL_PROVIDER_INTENT_STORAGE_KEY);
    window.sessionStorage.removeItem(SETTINGS_MODEL_PROVIDER_INTENT_STORAGE_KEY);
    return raw?.trim() ? { providerId: raw.trim() } : undefined;
  } catch {
    return undefined;
  }
}

/** 原 WMe（js 39349）：清空全部意图 */
function clearSettingsNavigationIntents(): void {
  if (typeof window > "u") return;
  try {
    window.sessionStorage.removeItem(SETTINGS_SECTION_INTENT_STORAGE_KEY);
    window.sessionStorage.removeItem(SETTINGS_USAGE_TAB_INTENT_STORAGE_KEY);
    window.sessionStorage.removeItem(SETTINGS_MODEL_PROVIDER_INTENT_STORAGE_KEY);
  } catch {
    /* 忽略 */
  }
}

export interface SettingsSectionIntentDetail {
  section: SettingsSectionId;
  usageTab?: "app" | "codingPlan";
  modelProviderId?: string;
}

/** 原 ow（js 39332）：发起跨窗口设置跳转（写意图 + 广播事件）。
 *  iw=任意分区入口；aw=直达用量（ow('usage')）。 */
export function requestSettingsSectionNavigation(
  section: SettingsSectionId,
  detail: { usageTab?: "app" | "codingPlan"; modelProviderId?: string } = {},
): void {
  if (typeof window > "u") return;
  try {
    window.sessionStorage.setItem(SETTINGS_SECTION_INTENT_STORAGE_KEY, section);
    if (detail.usageTab) window.sessionStorage.setItem(SETTINGS_USAGE_TAB_INTENT_STORAGE_KEY, detail.usageTab);
    if (detail.modelProviderId) {
      window.sessionStorage.setItem(SETTINGS_MODEL_PROVIDER_INTENT_STORAGE_KEY, detail.modelProviderId);
    } else {
      window.sessionStorage.removeItem(SETTINGS_MODEL_PROVIDER_INTENT_STORAGE_KEY);
    }
  } catch {
    /* 忽略 */
  }
  window.dispatchEvent(
    new CustomEvent<SettingsSectionIntentDetail>(SETTINGS_SECTION_INTENT_EVENT, {
      detail: { section, usageTab: detail.usageTab, modelProviderId: detail.modelProviderId },
    }),
  );
}

/** 原 cw（js 39394）：订阅设置跳转意图（返回取消订阅函数） */
export function subscribeSettingsSectionIntent(
  handler: (section: SettingsSectionId, detail: SettingsSectionIntentDetail) => void,
): () => void {
  if (typeof window > "u") return () => {};
  const listener = (event: Event) => {
    const detail = (event as CustomEvent<SettingsSectionIntentDetail>).detail;
    if (detail?.section && isSettingsSectionId(detail.section)) {
      clearSettingsNavigationIntents();
      handler(detail.section, detail);
    }
  };
  window.addEventListener(SETTINGS_SECTION_INTENT_EVENT, listener);
  return () => {
    window.removeEventListener(SETTINGS_SECTION_INTENT_EVENT, listener);
  };
}

/** 原 qMe（js 39386）：codingPlan 标签页不可用时应回落 app */
export function shouldResetUsageTabToApp(input: {
  activeTab: string;
  checkingCodingPlanTab: boolean;
  loadingModelProviders: boolean;
  showCodingPlanTab: boolean;
}): boolean {
  return input.activeTab === "codingPlan" && !input.showCodingPlanTab && !input.loadingModelProviders && !input.checkingCodingPlanTab;
}

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
 * 6. 行式原语（右栏 label+control 骨架；类名逐字保留）
 * ==========================================================================*/

/** 原 B3（js 135212）：卡片容器（data-slot=card） */
export function SettingsCard({
  className,
  size = "default",
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { size?: "default" | "sm" }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "group/card flex flex-col gap-4 overflow-hidden rounded-xl border border-card-border bg-card py-4 text-ui-base/relaxed text-foreground has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-3 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
        className,
      )}
      {...rest}
    />
  );
}

/** 原 V3（js 135254）：卡片内容区（data-slot=card-content） */
export function SettingsCardContent({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="card-content" className={cn("px-4 group-data-[size=sm]/card:px-3", className)} {...rest} />;
}

/** 原 U3（js 135334）：设置行 —— 右栏行式布局的核心：
 *  `grid-cols-[minmax(0,1fr)_192px]` 左 label+description、右 control，可选 detail 行。 */
export function SettingsRow({
  label,
  description,
  control,
  detail,
}: {
  label: string;
  description?: string;
  control: React.ReactNode;
  detail?: React.ReactNode;
}) {
  return (
    <div className="border-t border-border px-4 py-3 first:border-t-0">
      <div className="grid items-center gap-4 grid-cols-[minmax(0,1fr)_192px]">
        <div className="min-w-0">
          <div className="text-ui-base font-medium text-foreground">{label}</div>
          {description ? <div className="mt-1 text-ui-base leading-6 text-foreground-subtle">{description}</div> : null}
        </div>
        <div className="flex w-full justify-end">{control}</div>
      </div>
      {detail ? <div className="mt-3">{detail}</div> : null}
    </div>
  );
}

/** 原 W3（js 135363）：分区卡 = 零内边距的 Card+Content 组合（行直接堆叠） */
export function SettingsSectionCard({ children }: { children: React.ReactNode }) {
  return (
    <SettingsCard className="overflow-hidden rounded-xl border border-border bg-card py-0 shadow-none">
      <SettingsCardContent className="space-y-0 px-0">{children}</SettingsCardContent>
    </SettingsCard>
  );
}

/** 原 EMt（js 135369）：标题 chip（通用分区标题下的语言徽章等） */
export function SettingsTitleChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md bg-surface px-2.5 py-1 text-ui-base font-medium text-foreground-subtle">{children}</span>
  );
}

/** 原 Q2t（js 204535）：px 数字输入（失焦/回车提交，min–max 钳制，右侧 px 后缀） */
export function PixelNumberInput({
  value,
  min,
  max,
  ariaLabel,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  ariaLabel: string;
  onChange: (value: number) => void;
}) {
  const [draft, setDraft] = React.useState(String(value));
  return (
    <div className="relative w-28">
      <Input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        step={1}
        value={draft}
        aria-label={ariaLabel}
        onChange={(event) => setDraft(event.currentTarget.value)}
        onBlur={() => {
          const parsed = draft.trim() === "" ? NaN : Number(draft);
          const next = Number.isFinite(parsed) ? Math.min(max, Math.max(min, Math.round(parsed))) : value;
          setDraft(String(next));
          if (next !== value) onChange(next);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.currentTarget.blur();
          } else if (event.key === "Escape") {
            event.preventDefault();
            setDraft(String(value));
          }
        }}
        className="pr-8 text-right tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-ui-lg text-foreground-subtle">
        px
      </span>
    </div>
  );
}

/* --- Select / Switch / Tabs / AlertDialog 封装（Radix 原语打包在本 chunk） --- */

/** 原 iO（js 46009） */
export function Select(props: React.ComponentProps<typeof RadixSelectRoot>) {
  return <RadixSelectRoot data-slot="select" {...props} />;
}

/** 原 aO（js 46012） */
export function SelectValue(props: React.ComponentProps<typeof RadixSelectValue>) {
  return <RadixSelectValue data-slot="select-value" {...props} />;
}

/** 原 oO（js 46015）：触发器。类名由 cva `zRe`（js 45987）按 variant/size 生成，
 *  基础类逐字保留；variant: input/default/outline/secondary/ghost/destructive，
 *  size: xs/sm/default/lg（设置视图统一用 `lg` + `w-[260px] justify-between`）。 */
export function SelectTrigger({
  className,
  variant = "input",
  size = "default",
  children,
  indicator,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "input" | "default" | "outline" | "secondary" | "ghost" | "destructive";
  size?: "xs" | "sm" | "default" | "lg";
  indicator?: React.ReactNode;
}) {
  return (
    <RadixSelectTrigger
      data-slot="select-trigger"
      data-variant={variant}
      data-size={size}
      className={cn(
        // zRe 基础类（variant/size 分支见 js 45987–46007）
        "flex w-fit items-center justify-between gap-1.5 border whitespace-nowrap transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 data-placeholder:text-foreground-subtlest *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        variant === "input"
          ? "border-input-border bg-input text-foreground hover:border-input-border-hover focus-visible:border-input-border-focused focus-visible:bg-input-focused focus-visible:ring-0"
          : variant === "outline"
            ? "border-border bg-transparent text-foreground hover:bg-input/50 hover:text-foreground aria-expanded:bg-selected aria-expanded:text-foreground"
            : "",
        size === "lg"
          ? "h-8 rounded-lg pl-3 pr-2 text-ui-base [&_svg:not([class*='size-'])]:size-4"
          : "h-7 rounded-md pl-2 pr-1 text-ui-base/relaxed [&_svg:not([class*='size-'])]:size-3.5",
        className,
      )}
      {...rest}
    >
      {children}
      <RadixSelectIcon asChild>
        {indicator ?? <IconChevronDown className="pointer-events-none size-3.5 text-foreground-subtle" />}
      </RadixSelectIcon>
    </RadixSelectTrigger>
  );
}

/** 原 sO（js 46039）：内容层（Portal + 滚动按钮 + 视口），类名逐字保留 */
export function SelectContent({
  className,
  children,
  position = "item-aligned",
  align = "center",
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & {
  position?: "item-aligned" | "popper";
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  collisionPadding?: number;
}) {
  return (
    <RadixSelectPortal>
      <RadixSelectContent
        data-slot="select-content"
        data-align-trigger={position === "item-aligned"}
        className={cn(
          "relative z-[60] max-h-(--radix-select-content-available-height) min-w-32 origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-xl border border-popover-border bg-menu p-1 text-foreground shadow-md duration-100 data-[align-trigger=true]:animate-none data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 [app-region:no-drag]",
          className,
        )}
        position={position}
        align={align}
        {...rest}
      >
        <RadixSelectScrollUpButton />
        <RadixSelectViewport
          data-position={position}
          className={cn(
            "flex flex-col gap-0.5 data-[position=popper]:w-full data-[position=popper]:min-w-(--radix-select-trigger-width)",
          )}
        >
          {children}
        </RadixSelectViewport>
        <RadixSelectScrollDownButton />
      </RadixSelectContent>
    </RadixSelectPortal>
  );
}

/** 原 cO（js 46072）：选项（选中勾在右、可带 trailing 装饰），类名逐字保留 */
export const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string; disabled?: boolean; trailing?: React.ReactNode }
>(function SelectItem({ className, children, trailing, ...rest }, ref) {
  return (
    <RadixSelectItem
      ref={ref}
      data-slot="select-item"
      className={cn(
        "relative flex min-h-7 w-full cursor-default items-center gap-2 rounded-lg px-2 py-1 text-ui-base/relaxed text-foreground outline-hidden select-none data-[highlighted]:bg-menu-hover data-[highlighted]:text-foreground data-disabled:pointer-events-none data-disabled:text-foreground-subtlest data-disabled:opacity-100 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className,
      )}
      {...rest}
    >
      {trailing ? (
        <span className="pointer-events-auto absolute right-2 flex items-center justify-center">{trailing}</span>
      ) : null}
      <span className="pointer-events-none absolute right-2 flex items-center justify-center">
        <RadixSelectItemIndicator>
          <IconCheck className="pointer-events-none size-4 text-foreground-subtle" />
        </RadixSelectItemIndicator>
      </span>
      <RadixSelectItemText>{children}</RadixSelectItemText>
    </RadixSelectItem>
  );
});

/** 原 DC（js 37297）：Switch（Radix），类名逐字保留 */
export function Switch({
  className,
  size = "default",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  size?: "default" | "sm";
}) {
  return (
    <RadixSwitchRoot
      data-slot="switch"
      data-size={size}
      className={cn(
        "p-px peer group/switch relative inline-flex shrink-0 items-center rounded-full transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-2 focus-visible:ring-input-border-focused/30 aria-invalid:ring-2 aria-invalid:ring-destructive/20 data-[size=default]:h-[18px] data-[size=default]:w-[32px] data-[size=sm]:h-[16px] data-[size=sm]:w-[28px] dark:aria-invalid:ring-destructive/40 data-checked:bg-primary data-unchecked:bg-primary/30 data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      {...rest}
    >
      <RadixSwitchThumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-full bg-primary-foreground ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3.5 group-data-[size=default]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=default]/switch:data-unchecked:translate-x-0 group-data-[size=sm]/switch:data-unchecked:translate-x-0"
      />
    </RadixSwitchRoot>
  );
}

/** 原 hC（js 36949）：Tabs 根（data-slot=tabs） */
export function Tabs({
  className,
  orientation = "horizontal",
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { value: string; onValueChange: (v: string) => void; orientation?: "horizontal" | "vertical" }) {
  return (
    <RadixTabsRoot
      data-slot="tabs"
      data-orientation={orientation}
      className={cn("group/tabs flex gap-2 data-horizontal:flex-col", className)}
      {...rest}
    />
  );
}

/** 原 gC（js 36964）：TabsList（variant: default|line） */
export function TabsList({
  className,
  variant = "default",
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "line" }) {
  return (
    <RadixTabsList
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(
        "group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-horizontal/tabs:h-8 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none",
        variant === "default" ? "bg-muted" : "gap-1 bg-transparent",
        className,
      )}
      {...rest}
    />
  );
}

/** 原 _C（js 36972）：TabsTrigger，类名逐字保留（含 line 变体的下划线 after:） */
export function TabsTrigger({ className, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) {
  return (
    <RadixTabsTrigger
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 text-ui-base font-medium whitespace-nowrap text-foreground/60 transition-all group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start group-data-vertical/tabs:py-[calc(--spacing(1.25))] hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 dark:text-muted-foreground dark:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent",
        "data-active:bg-background data-active:text-foreground dark:data-active:border-input dark:data-active:bg-input/30 dark:data-active:text-foreground",
        "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[-5px] group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
        className,
      )}
      {...rest}
    />
  );
}

/** 原 vC（js 36986）：TabsContent */
export function TabsContent({ className, ...rest }: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  return <RadixTabsContent data-slot="tabs-content" className={cn("flex-1 text-ui-base outline-none", className)} {...rest} />;
}

/** 原 S9（js 202338）：Alert（role=alert） */
export function Alert({ className, variant, ...rest }: React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "destructive" }) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(
        "group/alert relative grid w-full gap-0.5 rounded-lg border px-2 py-1.5 text-left text-ui-base/relaxed has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-1.5 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-3.5",
        variant === "destructive"
          ? "border-destructive/50 bg-destructive/10 text-destructive"
          : "border-card-border bg-card text-foreground",
        className,
      )}
      {...rest}
    />
  );
}

/** 原 w9（js 202356）：AlertDescription */
export function AlertDescription({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-ui-base/relaxed text-balance text-foreground-subtle md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
        className,
      )}
      {...rest}
    />
  );
}

/** 原 $4/e3/t3/n3/r3/i3/a3/o3（js 131966–132035）：AlertDialog 原语族（类名逐字保留） */
export function AlertDialog(props: React.ComponentProps<typeof RadixAlertDialogRoot>) {
  return <RadixAlertDialogRoot data-slot="alert-dialog" {...props} />;
}
export function AlertDialogContent({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <RadixAlertDialogPortal>
      <RadixAlertDialogOverlay
        data-slot="alert-dialog-overlay"
        className="fixed inset-0 isolate z-50 bg-black/60 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 platform-linux-desktop:top-12"
      />
      <RadixAlertDialogContent
        data-slot="alert-dialog-content"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-5 rounded-2xl border-none bg-popover/98 p-5 text-ui-base/relaxed text-foreground ring-border shadow-2xl duration-100 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 sm:max-w-md platform-linux-desktop:top-[calc(50%+1.5rem)]",
          className,
        )}
        {...rest}
      />
    </RadixAlertDialogPortal>
  );
}
export function AlertDialogHeader({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="alert-dialog-header" className={cn("flex flex-col gap-2 text-left", className)} {...rest} />;
}
export function AlertDialogFooter({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div data-slot="alert-dialog-footer" className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...rest} />
  );
}
export function AlertDialogTitle({ className, ...rest }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <RadixAlertDialogTitle data-slot="alert-dialog-title" className={cn("text-ui-lg font-semibold text-foreground", className)} {...rest} />;
}
export function AlertDialogDescription({ className, ...rest }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <RadixAlertDialogDescription
      data-slot="alert-dialog-description"
      className={cn("whitespace-pre-line pt-0.5 text-ui-base leading-6 text-foreground-subtle", className)}
      {...rest}
    />
  );
}
/** 原 a3（js 132025）：动作按钮（复用 Button 类名 cva `Ca`） */
export function AlertDialogAction({ className, variant, size, ...rest }: ButtonProps) {
  return <RadixAlertDialogAction data-slot="alert-dialog-action" className={className} {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)} data-variant={variant} data-size={size} />;
}
/** 原 o3（js 132030）：取消按钮 */
export function AlertDialogCancel({ className, ...rest }: ButtonProps) {
  return <RadixAlertDialogCancel data-slot="alert-dialog-cancel" className={className} {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)} />;
}

/* ============================================================================
 * 7. 侧栏 / 壳层小件
 * ==========================================================================*/

/** 原 o4t（js 204846）：左段分区按钮（Tooltip 右出；激活 `bg-surface-hover`；
 *  <lg 收窄为 40px 图标列）。 */
export function SettingsSidebarItem({
  icon: Icon,
  label,
  active,
  children,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: IconComponent;
  label: string;
  active?: boolean;
}) {
  return (
    <Tooltip title={label} side="right" align="center">
      <button
        {...rest}
        type={rest.type ?? "button"}
        aria-label={label}
        className={cn(
          "flex h-8 w-full items-center gap-2 rounded-xl px-2.5 text-left transition-colors",
          "max-lg:mx-auto max-lg:size-10 max-lg:justify-center max-lg:px-0",
          active
            ? "bg-surface-hover text-foreground"
            : "text-foreground-subtle hover:bg-surface-hover hover:text-foreground",
          className,
        )}
      >
        <span className="flex size-4 shrink-0 items-center justify-center text-current">
          <Icon className="size-4 text-foreground" />
        </span>
        <span className="min-w-0 flex-1 max-lg:sr-only">
          {children ?? <span className="truncate text-ui-base text-foreground">{label}</span>}
        </span>
      </button>
    </Tooltip>
  );
}

/** 原 H2t（js 203818）：Windows 左上 logo 拖拽条 */
export function SettingsCaptionLogo({ className, imageClassName }: { className?: string; imageClassName?: string }) {
  return (
    <div className={cn("absolute left-0 top-0 z-20 flex h-12 items-center px-3 [app-region:drag]", className)}>
      <img
        src={ZCODE_LOGO_DATA_URL}
        alt="nofy"
        className={cn("pointer-events-none size-5 select-none", imageClassName)}
        draggable={false}
      /> {/* REBRAND-037+137 */}
    </div>
  );
}

/** 原 M7（js 193045）：← 返回链接按钮 */
export function BackLinkButton({
  children,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button type="button" size="lg" variant="ghost" className={cn("-ml-2", className)} {...rest}>
      <IconArrowLeft className="size-4" aria-hidden="true" />
      {children}
    </Button>
  );
}

/** 原 j7（js 193014）：资源分组头（标题 + 计数 + 右侧提示） */
export function ResourceGroupHeader({ count, hint, title }: { count: number; hint?: string; title: string }) {
  const { intl } = useIntlContext();
  const countLabel = intl.formatMessage(
    { id: count === 1 ? "settings.resourceGroup.item.one" : "settings.resourceGroup.item.other" },
    { count: String(count) },
  );
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 px-1">
      <div className="flex min-w-0 items-baseline gap-2">
        <span className="truncate text-ui-base font-medium text-foreground">{title}</span>
        <span className="shrink-0 text-ui-base text-foreground-subtlest">{countLabel}</span>
      </div>
      {hint ? <div className="min-w-0 text-ui-base text-foreground-subtle">{hint}</div> : null}
    </div>
  );
}

/** 原 D9（js 202889）：带进行中 spinner 的操作按钮（min-w-24） */
export function PendingOperationButton({
  children,
  disabled,
  operation,
  pendingOperation,
  variant = "outline",
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  operation: string;
  pendingOperation: string | null;
  variant?: ButtonProps["variant"];
  onClick?: () => void;
}) {
  return (
    <Button
      type="button"
      size="lg"
      variant={variant}
      disabled={disabled || pendingOperation !== null}
      onClick={onClick}
      className="min-w-24"
    >
      {pendingOperation === operation ? <SpinnerIcon className="size-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </Button>
  );
}

/** 原 U2t（js 203829）：数据目录控件 —— 只读输入 + 浏览 + 保存；
 *  状态机 idle→saving→saved/error；saved 提示「重启后生效」（琥珀色）；
 *  安装目录禁写（`settings.dataBaseDirForbiddenInstallDir`）。 */
export function DataBaseDirControl({
  dataBaseDir,
  defaultHomeDir,
  onDataBaseDirChange,
  onSelectDataBaseDir,
}: {
  dataBaseDir: string;
  defaultHomeDir: string;
  onDataBaseDirChange: (dir: string) => Promise<void>;
  onSelectDataBaseDir: () => Promise<string | null>;
}) {
  const { intl } = useIntlContext();
  const effectiveDir = dataBaseDir || defaultHomeDir;
  const [draft, setDraft] = React.useState(effectiveDir);
  const [browsing, setBrowsing] = React.useState(false);
  const [phase, setPhase] = React.useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMessageId, setErrorMessageId] = React.useState("settings.dataBaseDirCopyFailed");
  React.useEffect(() => {
    if (phase !== "saved") setDraft(effectiveDir);
  }, [effectiveDir, phase]);
  const dirty = draft.trim() !== effectiveDir;
  const saving = phase === "saving";
  const browse = React.useCallback(async () => {
    setBrowsing(true);
    try {
      const selected = await onSelectDataBaseDir();
      if (!selected) return;
      setDraft(selected);
      if (phase !== "idle") setPhase("idle");
    } finally {
      setBrowsing(false);
    }
  }, [onSelectDataBaseDir, phase]);
  const save = React.useCallback(async () => {
    const next = draft.trim();
    const payload = next === defaultHomeDir ? "" : next;
    setPhase("saving");
    try {
      await onDataBaseDirChange(payload);
      setPhase("saved");
    } catch (error) {
      setErrorMessageId(
        isForbiddenInstallDirError(error)
          ? "settings.dataBaseDirForbiddenInstallDir"
          : "settings.dataBaseDirCopyFailed",
      );
      setPhase("error");
    }
  }, [defaultHomeDir, draft, onDataBaseDirChange]);
  return (
    <div className="flex w-[320px] min-w-0 flex-col gap-2">
      <div className="flex items-center gap-2">
        <IconFolderOpen className="size-4 shrink-0 text-foreground-subtle" />
        <Input
          size="lg"
          value={draft}
          readOnly
          disabled={saving || browsing}
          placeholder={intl.formatMessage({ id: "settings.dataBaseDirPlaceholder" })}
          className="flex-1 font-mono"
        />
      </div>
      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="outline" size="sm" disabled={saving || browsing} onClick={() => void browse()}>
          {intl.formatMessage({ id: "settings.dataBaseDirBrowse" })}
        </Button>
        <Button type="button" size="sm" disabled={!dirty || saving || browsing} onClick={() => void save()}>
          {saving ? <SpinnerIcon className="size-4 animate-spin" /> : intl.formatMessage({ id: "settings.dataBaseDirSave" })}
        </Button>
      </div>
      {phase === "saving" ? (
        <p className="text-ui-base text-foreground-subtle">{intl.formatMessage({ id: "settings.dataBaseDirCopying" })}</p>
      ) : phase === "saved" ? (
        <p className="text-ui-base text-amber-600 dark:text-amber-400">
          {intl.formatMessage({ id: "settings.dataBaseDirRestartRequired" })}
        </p>
      ) : phase === "error" ? (
        <p className="text-ui-base text-destructive">{intl.formatMessage({ id: errorMessageId })}</p>
      ) : null}
    </div>
  );
}

/** 原 yt（U2t 内引用）：判定「禁止安装目录」错误（错误对象带 forbidden 标记） */

/** 原 e4t（js 204779）：用量分区标签栏（app + 每个 Coding Plan 源一个标签） */
export function UsageSectionTabBar({
  activeTab,
  codingPlanSources,
  onTabChange,
}: {
  activeTab: string;
  codingPlanSources: CodingPlanSource[];
  onTabChange: (tabId: string) => void;
}) {
  const { intl } = useIntlContext();
  const tabs: Array<{ id: string; label: string }> = [
    { id: "app", label: intl.formatMessage({ id: "settings.usage.tab.appUsage" }) },
    ...codingPlanSources.map((source, index) => ({
      id: codingPlanTabId(source.id),
      label: resolveCodingPlanTabLabel({
        defaultLabel: intl.formatMessage({ id: "settings.usage.tab.codingPlan" }),
        hasMultiplePersonalSources: codingPlanSources.filter((item) => !isTeamPlanSource(item)).length > 1,
        index,
        source,
      }),
    })),
  ];
  return (
    <Tabs
      value={activeTab === "codingPlan" && codingPlanSources[0] ? codingPlanTabId(codingPlanSources[0].id) : activeTab}
      onValueChange={(value) => onTabChange(value)}
      className="shrink-0"
    >
      <TabsList variant="line" className="flex h-8 gap-4 p-0">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            aria-label={tab.label}
            title={tab.label}
            data-testid={testidOf(SETTINGS_USAGE_TAB_TESTID, tab.id)}
            className="h-8 rounded-none px-0 text-ui-base font-medium text-foreground-subtle data-active:text-foreground"
          >
            <span className="whitespace-nowrap">{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

/* ============================================================================
 * 8. 通用分区（原 X2t，js 203966–204527 / jsx 162699）
 *    行式 24 项：语言 | 终端×3+原生搜索 | HTTP 代理×3 | 更新×3+通知×2+托盘+保活
 *    | 交互行为+自动解决+推理/TODO 展示 | 自动归档×2 | 数据目录 | onboarding | 性能模式
 * ==========================================================================*/

export interface GeneralSettingsSectionProps {
  localePreference: LocalePreference;
  notificationEnabled: boolean;
  notificationSoundEnabled: boolean;
  closeToTrayOnWindows: boolean;
  keepAwakeWhileRunning?: boolean;
  desktopChromiumHardwareAccelerationEnabled?: boolean;
  receivePreviewUpdates: boolean;
  autoDownloadAndInstallUpdates: boolean;
  dataBaseDir: string;
  terminalInheritSystemProfile?: boolean;
  terminalFontFamily?: string;
  integratedTerminalShell?: IntegratedTerminalShellSetting;
  integratedTerminalShellOptions?: IntegratedTerminalShell[];
  nativeSearchEnhancementsEnabled: boolean;
  httpProxy?: string;
  httpProxyNoProxy?: string;
  httpProxyCaCertPath?: string;
  defaultHomeDir: string;
  isDesktop: boolean;
  isWindowsDesktop: boolean;
  /** 原 j9 透传 `platform: x`（X2t 未解构使用，保留以对齐调用面） */
  platform?: unknown;
  showIntegratedTerminalShell?: boolean;
  setLocalePreference: (v: LocalePreference) => void;
  setNotificationEnabled: (v: boolean) => void;
  setNotificationSoundEnabled: (v: boolean) => void;
  taskAutoArchiveEnabled: boolean;
  taskAutoArchiveOlderThanDays: number;
  messageStreamShowReasoning: boolean;
  messageStreamShowTodos: boolean;
  zcodeInteractionBehavior: "queue" | "guide";
  askUserQuestionAutoResolutionEnabled?: boolean;
  optimizeAgentExperienceEnabled: boolean;
  onDataBaseDirChange: (dir: string) => Promise<void>;
  onSelectDataBaseDir: () => Promise<string | null>;
  onTerminalInheritSystemProfileChange?: (v: boolean) => Promise<void>;
  onTerminalFontFamilyChange?: (v: string) => Promise<void>;
  onIntegratedTerminalShellChange?: (v: IntegratedTerminalShellSetting) => Promise<void>;
  onNativeSearchEnhancementsEnabledChange: (v: boolean) => Promise<void>;
  onHttpProxyChange?: (v: string) => Promise<void>;
  onHttpProxyNoProxyChange?: (v: string) => Promise<void>;
  onHttpProxyCaCertPathChange?: (v: string) => Promise<void>;
  onTaskAutoArchiveEnabledChange: (v: boolean) => Promise<void>;
  onTaskAutoArchiveOlderThanDaysChange: (v: number) => Promise<void>;
  onCloseToTrayOnWindowsChange: (v: boolean) => Promise<void>;
  onKeepAwakeWhileRunningChange?: (v: boolean) => Promise<void>;
  onDesktopChromiumHardwareAccelerationChange?: (v: boolean) => Promise<void>;
  onReceivePreviewUpdatesChange: (v: boolean) => Promise<void>;
  onAutoDownloadAndInstallUpdatesChange: (v: boolean) => Promise<void>;
  onMessageStreamShowReasoningChange: (v: boolean) => Promise<void>;
  onMessageStreamShowTodosChange: (v: boolean) => Promise<void>;
  onZCodeInteractionBehaviorChange: (v: "queue" | "guide") => Promise<void>;
  onAskUserQuestionAutoResolutionEnabledChange?: (v: boolean) => Promise<void>;
  onOptimizeAgentExperienceEnabledChange: (v: boolean) => Promise<void>;
  onOpenOnboardingDialog: () => void;
}

export function GeneralSettingsSection({
  localePreference,
  notificationEnabled,
  notificationSoundEnabled,
  closeToTrayOnWindows,
  keepAwakeWhileRunning = false,
  desktopChromiumHardwareAccelerationEnabled = true,
  receivePreviewUpdates,
  autoDownloadAndInstallUpdates,
  dataBaseDir,
  terminalInheritSystemProfile = true,
  terminalFontFamily = "",
  integratedTerminalShell = { mode: "auto" },
  integratedTerminalShellOptions = [],
  nativeSearchEnhancementsEnabled,
  httpProxy = "",
  httpProxyNoProxy = "",
  httpProxyCaCertPath = "",
  defaultHomeDir,
  isDesktop,
  isWindowsDesktop,
  showIntegratedTerminalShell = false,
  setLocalePreference,
  setNotificationEnabled,
  setNotificationSoundEnabled,
  taskAutoArchiveEnabled,
  taskAutoArchiveOlderThanDays,
  messageStreamShowReasoning,
  messageStreamShowTodos,
  zcodeInteractionBehavior,
  askUserQuestionAutoResolutionEnabled = true,
  optimizeAgentExperienceEnabled,
  onDataBaseDirChange,
  onSelectDataBaseDir,
  onTerminalInheritSystemProfileChange = async () => {},
  onTerminalFontFamilyChange = async () => {},
  onIntegratedTerminalShellChange = async () => {},
  onNativeSearchEnhancementsEnabledChange,
  onHttpProxyChange = async () => {},
  onHttpProxyNoProxyChange = async () => {},
  onHttpProxyCaCertPathChange = async () => {},
  onTaskAutoArchiveEnabledChange,
  onTaskAutoArchiveOlderThanDaysChange,
  onCloseToTrayOnWindowsChange,
  onKeepAwakeWhileRunningChange = async () => {},
  onDesktopChromiumHardwareAccelerationChange = async () => {},
  onReceivePreviewUpdatesChange,
  onAutoDownloadAndInstallUpdatesChange,
  onMessageStreamShowReasoningChange,
  onMessageStreamShowTodosChange,
  onZCodeInteractionBehaviorChange,
  onAskUserQuestionAutoResolutionEnabledChange = async () => {},
  onOptimizeAgentExperienceEnabledChange,
  onOpenOnboardingDialog,
}: GeneralSettingsSectionProps) {
  const { intl } = useIntlContext();

  /* --- 终端字体族：本地草稿 + 回车/按钮提交（204026–204046） --- */
  const [fontFamilyDraft, setFontFamilyDraft] = React.useState(terminalFontFamily);
  React.useEffect(() => {
    setFontFamilyDraft(terminalFontFamily);
  }, [terminalFontFamily]);
  const fontFamilyTrimmed = fontFamilyDraft.trim();
  const fontFamilyDirty = fontFamilyTrimmed !== terminalFontFamily;

  /* --- 集成终端 shell 选择（仅 win32；204029–204055） --- */
  const shellValue = integratedTerminalShell.mode === "shell" ? integratedTerminalShell.id : "auto";
  const currentShellOption =
    integratedTerminalShell.mode === "shell"
      ? (integratedTerminalShellOptions.find((option) => option.id === integratedTerminalShell.id) ?? {
          dialect: integratedTerminalShell.dialect,
          id: integratedTerminalShell.id,
          label: integratedTerminalShell.label,
          path: integratedTerminalShell.path,
          source: "system",
        })
      : undefined;
  const shellOptions = currentShellOption
    ? [currentShellOption, ...integratedTerminalShellOptions.filter((option) => option.id !== currentShellOption.id)]
    : integratedTerminalShellOptions;
  const saveFontFamily = React.useCallback(async () => {
    await onTerminalFontFamilyChange(fontFamilyTrimmed);
  }, [fontFamilyTrimmed, onTerminalFontFamilyChange]);
  const changeShell = React.useCallback(
    async (value: string) => {
      if (value === "auto") {
        await onIntegratedTerminalShellChange({ mode: "auto" });
        return;
      }
      const option = shellOptions.find((item) => item.id === value);
      if (option) {
        await onIntegratedTerminalShellChange({
          mode: "shell",
          dialect: option.dialect,
          id: option.id,
          label: option.label,
          path: option.path,
        });
      }
    },
    [onIntegratedTerminalShellChange, shellOptions],
  );

  /* --- HTTP 代理三件套：各自的本地草稿 + 脏检测 + 提交（204055–204088） --- */
  const [proxyDraft, setProxyDraft] = React.useState(httpProxy);
  React.useEffect(() => {
    setProxyDraft(httpProxy);
  }, [httpProxy]);
  const proxyTrimmed = proxyDraft.trim();
  const proxyDirty = proxyTrimmed !== httpProxy;
  const saveProxy = React.useCallback(async () => {
    await onHttpProxyChange(proxyTrimmed);
  }, [proxyTrimmed, onHttpProxyChange]);

  const [noProxyDraft, setNoProxyDraft] = React.useState(httpProxyNoProxy);
  React.useEffect(() => {
    setNoProxyDraft(httpProxyNoProxy);
  }, [httpProxyNoProxy]);
  const noProxyNormalized = noProxyDraft
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .join(",");
  const noProxyDirty = noProxyNormalized !== httpProxyNoProxy;
  const saveNoProxy = React.useCallback(async () => {
    await onHttpProxyNoProxyChange(noProxyNormalized);
  }, [noProxyNormalized, onHttpProxyNoProxyChange]);

  const [caCertDraft, setCaCertDraft] = React.useState(httpProxyCaCertPath);
  React.useEffect(() => {
    setCaCertDraft(httpProxyCaCertPath);
  }, [httpProxyCaCertPath]);
  const caCertTrimmed = caCertDraft.trim();
  const caCertDirty = caCertTrimmed !== httpProxyCaCertPath;
  const saveCaCert = React.useCallback(async () => {
    await onHttpProxyCaCertPathChange(caCertTrimmed);
  }, [caCertTrimmed, onHttpProxyCaCertPathChange]);

  return (
    <div className="space-y-4">
      {/* ── 语言（204090–204127）：system / zh-CN / en-US ── */}
      <SettingsSectionCard>
        <SettingsRow
          label={intl.formatMessage({ id: "settings.locale" })}
          description={intl.formatMessage({ id: "settings.localeDescription" })}
          control={
            <Select value={localePreference} onValueChange={(value) => setLocalePreference(value as LocalePreference)}>
              <SelectTrigger
                size="lg"
                className="w-[260px] min-w-0 justify-between"
                data-testid={SETTINGS_LOCALE_SELECT_TRIGGER_TESTID}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system" data-testid={testidOf(SETTINGS_LOCALE_SELECT_ITEM_TESTID, "system")}>
                  {intl.formatMessage({ id: "settings.locale.system" })}
                </SelectItem>
                <SelectItem value="zh-CN" data-testid={testidOf(SETTINGS_LOCALE_SELECT_ITEM_TESTID, "zh-CN")}>
                  {intl.formatMessage({ id: "settings.locale.zh-CN" })}
                </SelectItem>
                <SelectItem value="en-US" data-testid={testidOf(SETTINGS_LOCALE_SELECT_ITEM_TESTID, "en-US")}>
                  {intl.formatMessage({ id: "settings.locale.en-US" })}
                </SelectItem>
              </SelectContent>
            </Select>
          }
        />
      </SettingsSectionCard>

      {/* ── 终端与搜索（204128–204207） ── */}
      <SettingsSectionCard>
        <SettingsRow
          label={intl.formatMessage({ id: "settings.terminalProfile" })}
          description={intl.formatMessage({ id: "settings.terminalProfileDescription" })}
          control={
            <Switch
              checked={terminalInheritSystemProfile}
              onCheckedChange={(value) => {
                void onTerminalInheritSystemProfileChange(value);
              }}
            />
          }
        />
        <SettingsRow
          label={intl.formatMessage({ id: "settings.terminalFontFamily" })}
          description={intl.formatMessage({ id: "settings.terminalFontFamilyDescription" })}
          control={
            <Button type="button" size="lg" disabled={!fontFamilyDirty} onClick={() => void saveFontFamily()}>
              {intl.formatMessage({ id: "settings.dataBaseDirSave" })}
            </Button>
          }
          detail={
            <Input
              size="lg"
              value={fontFamilyDraft}
              placeholder={intl.formatMessage({ id: "settings.terminalFontFamilyPlaceholder" })}
              onChange={(event) => {
                setFontFamilyDraft(event.currentTarget.value);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && fontFamilyDirty) void saveFontFamily();
              }}
              className="max-w-[520px] font-mono"
            />
          }
        />
        {showIntegratedTerminalShell ? (
          <SettingsRow
            label={intl.formatMessage({ id: "settings.integratedTerminalShell" })}
            description={intl.formatMessage({ id: "settings.integratedTerminalShellDescription" })}
            control={
              <Select value={shellValue} onValueChange={(value) => void changeShell(value)}>
                <SelectTrigger size="lg" className="w-[260px] min-w-0 justify-between">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">{intl.formatMessage({ id: "settings.integratedTerminalShell.auto" })}</SelectItem>
                  {shellOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            }
          />
        ) : null}
        <SettingsRow
          label={intl.formatMessage({ id: "settings.nativeSearchEnhancements" })}
          description={intl.formatMessage({ id: "settings.nativeSearchEnhancementsDescription" })}
          control={
            <Switch
              aria-label={intl.formatMessage({ id: "settings.nativeSearchEnhancements" })}
              checked={nativeSearchEnhancementsEnabled}
              data-testid={SETTINGS_NATIVE_SEARCH_SWITCH_TESTID}
              onCheckedChange={(value) => {
                void onNativeSearchEnhancementsEnabledChange(value);
              }}
            />
          }
        />
      </SettingsSectionCard>

      {/* ── HTTP 代理（204208–204280）：地址 / 不走代理清单 / CA 证书路径 ── */}
      <SettingsSectionCard>
        <SettingsRow
          label={intl.formatMessage({ id: "settings.httpProxy" })}
          description={intl.formatMessage({ id: "settings.httpProxyDescription" })}
          control={
            <Button type="button" size="lg" disabled={!proxyDirty} onClick={() => void saveProxy()}>
              {intl.formatMessage({ id: "settings.dataBaseDirSave" })}
            </Button>
          }
          detail={
            <Input
              size="lg"
              value={proxyDraft}
              placeholder={intl.formatMessage({ id: "settings.httpProxyPlaceholder" })}
              onChange={(event) => {
                setProxyDraft(event.currentTarget.value);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && proxyDirty) void saveProxy();
              }}
              className="max-w-[520px] font-mono"
            />
          }
        />
        <SettingsRow
          label={intl.formatMessage({ id: "settings.httpProxyNoProxy" })}
          description={intl.formatMessage({ id: "settings.httpProxyNoProxyDescription" })}
          control={
            <Button type="button" size="lg" disabled={!noProxyDirty} onClick={() => void saveNoProxy()}>
              {intl.formatMessage({ id: "settings.dataBaseDirSave" })}
            </Button>
          }
          detail={
            <Input
              size="lg"
              value={noProxyDraft}
              placeholder={intl.formatMessage({ id: "settings.httpProxyNoProxyPlaceholder" })}
              onChange={(event) => {
                setNoProxyDraft(event.currentTarget.value);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && noProxyDirty) void saveNoProxy();
              }}
              className="max-w-[520px] font-mono"
            />
          }
        />
        <SettingsRow
          label={intl.formatMessage({ id: "settings.httpProxyCaCertPath" })}
          description={intl.formatMessage({ id: "settings.httpProxyCaCertPathDescription" })}
          control={
            <Button type="button" size="lg" disabled={!caCertDirty} onClick={() => void saveCaCert()}>
              {intl.formatMessage({ id: "settings.dataBaseDirSave" })}
            </Button>
          }
          detail={
            <Input
              size="lg"
              value={caCertDraft}
              placeholder={intl.formatMessage({ id: "settings.httpProxyCaCertPathPlaceholder" })}
              onChange={(event) => {
                setCaCertDraft(event.currentTarget.value);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && caCertDirty) void saveCaCert();
              }}
              className="max-w-[520px] font-mono"
            />
          }
        />
      </SettingsSectionCard>

      {/* ── 系统行为：更新（桌面）/通知/托盘/保活（204281–204368） ── */}
      <SettingsSectionCard>
        {isDesktop ? (
          <>
            <SettingsRow
              label={intl.formatMessage({ id: "settings.desktopChromiumHardwareAcceleration" })}
              description={intl.formatMessage({ id: "settings.desktopChromiumHardwareAccelerationDescription" })}
              control={
                <Switch
                  aria-label={intl.formatMessage({ id: "settings.desktopChromiumHardwareAcceleration" })}
                  checked={desktopChromiumHardwareAccelerationEnabled}
                  onCheckedChange={(value) => {
                    void onDesktopChromiumHardwareAccelerationChange(value);
                  }}
                />
              }
            />
            <SettingsRow
              label={intl.formatMessage({ id: "settings.receivePreviewUpdates" })}
              description={intl.formatMessage({ id: "settings.receivePreviewUpdatesDescription" })}
              control={
                <Switch
                  aria-label={intl.formatMessage({ id: "settings.receivePreviewUpdates" })}
                  checked={receivePreviewUpdates}
                  onCheckedChange={(value) => {
                    void onReceivePreviewUpdatesChange(value);
                  }}
                />
              }
            />
            <SettingsRow
              label={intl.formatMessage({ id: "settings.autoDownloadAndInstallUpdates" })}
              description={intl.formatMessage({ id: "settings.autoDownloadAndInstallUpdatesDescription" })}
              control={
                <Switch
                  aria-label={intl.formatMessage({ id: "settings.autoDownloadAndInstallUpdates" })}
                  checked={autoDownloadAndInstallUpdates}
                  onCheckedChange={(value) => {
                    void onAutoDownloadAndInstallUpdatesChange(value);
                  }}
                />
              }
            />
          </>
        ) : null}
        <SettingsRow
          label={intl.formatMessage({ id: "settings.notification" })}
          description={intl.formatMessage({ id: "settings.notificationDescription" })}
          control={<Switch checked={notificationEnabled} onCheckedChange={setNotificationEnabled} />}
        />
        <SettingsRow
          label={intl.formatMessage({ id: "settings.notificationSound" })}
          description={intl.formatMessage({ id: "settings.notificationSoundDescription" })}
          control={
            <Switch
              checked={notificationSoundEnabled}
              disabled={!notificationEnabled}
              onCheckedChange={setNotificationSoundEnabled}
            />
          }
        />
        {isWindowsDesktop ? (
          <SettingsRow
            label={intl.formatMessage({ id: "settings.closeToTrayOnWindows" })}
            description={intl.formatMessage({ id: "settings.closeToTrayOnWindowsDescription" })}
            control={
              <Switch
                checked={closeToTrayOnWindows}
                onCheckedChange={(value) => {
                  void onCloseToTrayOnWindowsChange(value);
                }}
              />
            }
          />
        ) : null}
        {isDesktop ? (
          <SettingsRow
            label={intl.formatMessage({ id: "settings.keepAwakeWhileRunning" })}
            description={intl.formatMessage({ id: "settings.keepAwakeWhileRunningDescription" })}
            control={
              <Switch
                aria-label={intl.formatMessage({ id: "settings.keepAwakeWhileRunning" })}
                checked={keepAwakeWhileRunning}
                onCheckedChange={(value) => {
                  void onKeepAwakeWhileRunningChange(value);
                }}
              />
            }
          />
        ) : null}
      </SettingsSectionCard>

      {/* ── 交互行为与流式展示（204369–204438） ── */}
      <SettingsSectionCard>
        <SettingsRow
          label={intl.formatMessage({ id: "settings.zcodeInteractionBehavior" })}
          description={intl.formatMessage({ id: "settings.zcodeInteractionBehaviorDescription" })}
          control={
            <Select
              value={zcodeInteractionBehavior}
              onValueChange={(value) => void onZCodeInteractionBehaviorChange(value as "queue" | "guide")}
            >
              <SelectTrigger size="lg" className="w-[260px] min-w-0 justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INTERACTION_BEHAVIOR_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {intl.formatMessage({ id: `settings.zcodeInteractionBehavior.option.${option}` })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
        />
        <SettingsRow
          label={intl.formatMessage({ id: "settings.askUserQuestionAutoResolution" })}
          description={intl.formatMessage({ id: "settings.askUserQuestionAutoResolutionDescription" })}
          control={
            <Switch
              aria-label={intl.formatMessage({ id: "settings.askUserQuestionAutoResolution" })}
              checked={askUserQuestionAutoResolutionEnabled}
              data-testid={SETTINGS_ASK_USER_QUESTION_SWITCH_TESTID}
              onCheckedChange={(value) => {
                void onAskUserQuestionAutoResolutionEnabledChange(value);
              }}
            />
          }
        />
        <SettingsRow
          label={intl.formatMessage({ id: "settings.messageStreamShowReasoning" })}
          description={intl.formatMessage({ id: "settings.messageStreamShowReasoningDescription" })}
          control={
            <Switch
              aria-label={intl.formatMessage({ id: "settings.messageStreamShowReasoning" })}
              checked={messageStreamShowReasoning}
              onCheckedChange={(value) => {
                void onMessageStreamShowReasoningChange(value);
              }}
            />
          }
        />
        <SettingsRow
          label={intl.formatMessage({ id: "settings.messageStreamShowTodos" })}
          description={intl.formatMessage({ id: "settings.messageStreamShowTodosDescription" })}
          control={
            <Switch
              aria-label={intl.formatMessage({ id: "settings.messageStreamShowTodos" })}
              checked={messageStreamShowTodos}
              onCheckedChange={(value) => {
                void onMessageStreamShowTodosChange(value);
              }}
            />
          }
        />
      </SettingsSectionCard>

      {/* ── 任务自动归档（204439–204483） ── */}
      <SettingsSectionCard>
        <SettingsRow
          label={intl.formatMessage({ id: "settings.taskAutoArchive" })}
          description={intl.formatMessage({ id: "settings.taskAutoArchiveDescription" })}
          control={
            <Switch
              checked={taskAutoArchiveEnabled}
              onCheckedChange={(value) => {
                void onTaskAutoArchiveEnabledChange(value);
              }}
            />
          }
        />
        <SettingsRow
          label={intl.formatMessage({ id: "settings.taskAutoArchiveDays" })}
          description={intl.formatMessage({ id: "settings.taskAutoArchiveDaysDescription" })}
          control={
            <Select
              value={String(taskAutoArchiveOlderThanDays)}
              onValueChange={(value) => {
                void onTaskAutoArchiveOlderThanDaysChange(Number(value));
              }}
              disabled={!taskAutoArchiveEnabled}
            >
              <SelectTrigger size="lg" className="w-[260px] min-w-0 justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AUTO_ARCHIVE_DAY_OPTIONS.map((days) => (
                  <SelectItem key={days} value={String(days)}>
                    {intl.formatMessage({ id: `settings.taskAutoArchiveDays.option.${days}` })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
        />
      </SettingsSectionCard>

      {/* ── 数据目录（204484–204497） ── */}
      <SettingsSectionCard>
        <SettingsRow
          label={intl.formatMessage({ id: "settings.dataBaseDir" })}
          description={intl.formatMessage({ id: "settings.dataBaseDirDescription" })}
          control={
            <DataBaseDirControl
              dataBaseDir={dataBaseDir}
              defaultHomeDir={defaultHomeDir}
              onDataBaseDirChange={onDataBaseDirChange}
              onSelectDataBaseDir={onSelectDataBaseDir}
            />
          }
        />
      </SettingsSectionCard>

      {/* ── 新手引导（204498–204510） ── */}
      <SettingsSectionCard>
        <SettingsRow
          label={intl.formatMessage({ id: "settings.onboarding" })}
          description={intl.formatMessage({ id: "settings.onboardingDescription" })}
          control={
            <Button type="button" size="lg" variant="outline" onClick={onOpenOnboardingDialog}>
              {intl.formatMessage({ id: "settings.onboardingOpen" })}
            </Button>
          }
        />
      </SettingsSectionCard>

      {/* ── 性能模式（204511–204526） ── */}
      <SettingsSectionCard>
        <SettingsRow
          label={intl.formatMessage({ id: "settings.optimizeAgentExperience" })}
          description={intl.formatMessage({ id: "settings.optimizeAgentExperienceDescription" })}
          control={
            <Switch
              aria-label={intl.formatMessage({ id: "settings.optimizeAgentExperience" })}
              checked={optimizeAgentExperienceEnabled}
              onCheckedChange={(value) => {
                void onOptimizeAgentExperienceEnabledChange(value);
              }}
            />
          }
        />
      </SettingsSectionCard>
    </div>
  );
}

/** 原 Z2t（js 204528）：通用分区标题下的语言 chip */
export function GeneralSettingsTitleChips({ localePreference }: { localePreference: LocalePreference }) {
  const { intl } = useIntlContext();
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <SettingsTitleChip>{intl.formatMessage({ id: `settings.locale.${localePreference}` })}</SettingsTitleChip>
    </div>
  );
}

/* ============================================================================
 * 9. 外观分区（原 $2t，js 204566–204775 / jsx 163104）
 *    界面（主题模式 + UI 字号）+ 代码（亮/暗主题 + 行号 + 换行 + 字号）+ 双预览卡
 * ==========================================================================*/

/** 原 wMt（js 135262）：代码主题下拉（10 主题，w-64 触发器） */
export function CodeThemeSelect({ value, onValueChange }: { value: string; onValueChange: (v: string) => void }) {
  return (
    <Select value={value} onValueChange={(next) => onValueChange(next)}>
      <SelectTrigger size="lg" className="w-64 min-w-0 justify-between">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {CODE_THEME_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** 原 TMt（js 135278）：代码主题预览卡（亮/暗；激活徽章 `bg-selected`；
 *  容器变量覆写背景/卡片/前景三色） */
export function CodeThemePreviewCard({
  mode,
  title,
  themeName,
  theme,
  isActive,
  showLineNumbers,
  wrapLongLines,
  fontSizePx,
}: {
  mode: "light" | "dark";
  title: string;
  themeName: string;
  theme: unknown;
  isActive: boolean;
  showLineNumbers: boolean;
  wrapLongLines: boolean;
  fontSizePx: number;
}) {
  const { intl } = useIntlContext();
  const ringClass = mode === "light" ? "ring-1 ring-black/5" : "ring-1 ring-white/8";
  const previewVars: React.CSSProperties = {
    "--color-background": mode === "light" ? "#f8f8f8" : "#161616",
    "--color-card": mode === "light" ? "#f8f8f8" : "#161616",
    "--color-foreground": mode === "light" ? "#0d0d0d" : "#ffffff",
  } as React.CSSProperties;
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <div className="text-ui-base font-semibold text-foreground">{title}</div>
          <div className="text-ui-base text-foreground-subtle">{themeName}</div>
        </div>
        <span
          className={`rounded-md px-2.5 py-1 text-ui-xs font-medium ${isActive ? "bg-selected text-foreground" : "bg-surface text-foreground-subtle"}`}
        >
          {intl.formatMessage({ id: isActive ? "settings.previewBadge.active" : `settings.previewBadge.${mode}` })}
        </span>
      </div>
      <div className="p-2">
        <CodeBlock
          code={CODE_THEME_PREVIEW_SAMPLE}
          language="typescript"
          theme={theme}
          showLineNumbers={showLineNumbers}
          wrapLongLines={wrapLongLines}
          fontSizePx={fontSizePx}
          className={`overflow-hidden border-0 bg-background ${ringClass}`}
          style={previewVars}
        />
      </div>
    </div>
  );
}

export function AppearanceSettingsSection({
  codePreviewSettings,
  setCodePreviewSettings,
  theme,
  setTheme,
  uiFontSizePx,
  setUiFontSizePx,
}: {
  codePreviewSettings: CodePreviewSettings;
  setCodePreviewSettings: (patch: Partial<CodePreviewSettings>) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  uiFontSizePx: number;
  setUiFontSizePx: (px: number) => void;
}) {
  const { intl } = useIntlContext();
  const resolvedMode = resolveThemeMode(theme);
  return (
    <>
      {/* ── 界面：主题模式 + UI 字号（204578–204649） ── */}
      <div className="min-w-0 space-y-3">
        <div>
          <h3 className="text-ui-lg font-semibold text-foreground">
            {intl.formatMessage({ id: "settings.appearance.interfaceTitle" })}
          </h3>
          <p className="mt-1 text-ui-base leading-6 text-foreground-subtle">
            {intl.formatMessage({ id: "settings.appearance.interfaceDescription" })}
          </p>
        </div>
        <SettingsCard className="border border-border bg-card py-0 shadow-none">
          <SettingsCardContent className="space-y-0 px-0">
            <SettingsRow
              label={intl.formatMessage({ id: "settings.themeMode" })}
              description={intl.formatMessage({ id: "settings.themeModeDescription" })}
              control={
                <Select value={theme} onValueChange={(value) => setTheme(value as ThemeMode)}>
                  <SelectTrigger size="lg" className="w-[260px] min-w-0 justify-between">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {THEME_MODE_OPTIONS.map(({ mode, icon: ModeIcon }) => (
                      <SelectItem key={mode} value={mode}>
                        <div className="flex items-center gap-2">
                          <ModeIcon className="size-4" />
                          {intl.formatMessage({ id: `settings.themeMode.${mode}` })}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              }
            />
            <SettingsRow
              label={intl.formatMessage({ id: "settings.uiFontSize" })}
              description={intl.formatMessage({ id: "settings.uiFontSizeDescription" })}
              control={
                <PixelNumberInput
                  key={uiFontSizePx}
                  min={12}
                  max={20}
                  value={uiFontSizePx}
                  onChange={setUiFontSizePx}
                  ariaLabel={intl.formatMessage({ id: "settings.uiFontSize" })}
                />
              }
            />
          </SettingsCardContent>
        </SettingsCard>
      </div>

      {/* ── 代码：主题/行号/换行/字号 + 预览（204650–204774） ── */}
      <div className="space-y-6">
        <div className="min-w-0 space-y-3">
          <div>
            <h3 className="text-ui-lg font-semibold text-foreground">
              {intl.formatMessage({ id: "settings.appearance.codeTitle" })}
            </h3>
            <p className="mt-1 text-ui-base leading-6 text-foreground-subtle">
              {intl.formatMessage({ id: "settings.appearance.codeDescription" })}
            </p>
          </div>
          <SettingsCard className="border border-border bg-card py-0 shadow-none [&_[data-slot=select-trigger]]:w-full">
            <SettingsCardContent className="space-y-0 px-0">
              <SettingsRow
                label={intl.formatMessage({ id: "settings.lightTheme" })}
                description={intl.formatMessage({ id: "settings.lightThemeDescription" })}
                control={
                  <CodeThemeSelect
                    value={codePreviewSettings.lightTheme}
                    onValueChange={(value) => setCodePreviewSettings({ lightTheme: value })}
                  />
                }
              />
              <SettingsRow
                label={intl.formatMessage({ id: "settings.darkTheme" })}
                description={intl.formatMessage({ id: "settings.darkThemeDescription" })}
                control={
                  <CodeThemeSelect
                    value={codePreviewSettings.darkTheme}
                    onValueChange={(value) => setCodePreviewSettings({ darkTheme: value })}
                  />
                }
              />
              <SettingsRow
                label={intl.formatMessage({ id: "settings.showLineNumbers" })}
                description={intl.formatMessage({ id: "settings.showLineNumbersDescription" })}
                control={
                  <Switch
                    checked={codePreviewSettings.showLineNumbers}
                    onCheckedChange={(value) => setCodePreviewSettings({ showLineNumbers: value })}
                  />
                }
              />
              <SettingsRow
                label={intl.formatMessage({ id: "settings.wrapLongLines" })}
                description={intl.formatMessage({ id: "settings.wrapLongLinesDescription" })}
                control={
                  <Switch
                    checked={codePreviewSettings.wrapLongLines}
                    onCheckedChange={(value) => setCodePreviewSettings({ wrapLongLines: value })}
                  />
                }
              />
              <SettingsRow
                label={intl.formatMessage({ id: "settings.fontSize" })}
                description={intl.formatMessage({ id: "settings.fontSizeDescription" })}
                control={
                  <PixelNumberInput
                    key={codePreviewSettings.fontSizePx}
                    min={12}
                    max={20}
                    value={codePreviewSettings.fontSizePx}
                    onChange={(value) => setCodePreviewSettings({ fontSizePx: value })}
                    ariaLabel={intl.formatMessage({ id: "settings.fontSize" })}
                  />
                }
              />
            </SettingsCardContent>
          </SettingsCard>
        </div>

        {/* 预览：亮/暗双卡（204725–204770） */}
        <div className="min-w-0 space-y-4">
          <div>
            <h3 className="text-ui-base font-semibold text-foreground">
              {intl.formatMessage({ id: "settings.previewSectionTitle" })}
            </h3>
            <p className="mt-1 text-ui-base leading-6 text-foreground-subtle">
              {intl.formatMessage({ id: "settings.previewDescription" })}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <CodeThemePreviewCard
              mode="light"
              title={intl.formatMessage({ id: "settings.previewLight" })}
              themeName={resolveCodeThemeLabel(codePreviewSettings.lightTheme)}
              theme={resolveCodeThemeForMode("light", codePreviewSettings)}
              isActive={resolvedMode === "light"}
              showLineNumbers={codePreviewSettings.showLineNumbers}
              wrapLongLines={codePreviewSettings.wrapLongLines}
              fontSizePx={codePreviewSettings.fontSizePx}
            />
            <CodeThemePreviewCard
              mode="dark"
              title={intl.formatMessage({ id: "settings.previewDark" })}
              themeName={resolveCodeThemeLabel(codePreviewSettings.darkTheme)}
              theme={resolveCodeThemeForMode("dark", codePreviewSettings)}
              isActive={resolvedMode === "dark"}
              showLineNumbers={codePreviewSettings.showLineNumbers}
              wrapLongLines={codePreviewSettings.wrapLongLines}
              fontSizePx={codePreviewSettings.fontSizePx}
            />
          </div>
        </div>
      </div>
    </>
  );
}

/* ============================================================================
 * 10. 记忆分区 + 记忆查看器（原 E2t js 202650 / w2t js 202420）
 *     工作区记忆开关；查看器三级：项目列表 → 文件列表 → 文件预览
 *     （预览限制 PROJECT_MEMORY_PREVIEW_LIMIT_EXCEEDED → fileTooLarge，5MiB 由服务端判定）
 * ==========================================================================*/

/** 原 _2t / v2t（js 202377 附近） */
const ONE_MINUTE_MS = 60_000;
const JUST_NOW_WINDOW_MINUTES = 30;

/** 原 y2t：当日 0 点时间戳 */
function startOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** 原 b2t：HH:mm（24 小时制） */
function formatTimeH23(timestamp: number, locale: string): string {
  return new Intl.DateTimeFormat(locale, { hour: "2-digit", hourCycle: "h23", minute: "2-digit" }).format(timestamp);
}

/** 原 x2t（js 202379）：周几（zh-CN 用「周X」） */
export function formatWeekday(timestamp: number, locale: string): string {
  return locale === "zh-CN"
    ? `周${"日一二三四五六"[new Date(timestamp).getDay()]}`
    : new Intl.DateTimeFormat(locale, { weekday: "short" }).format(timestamp);
}

/** 原 S2t（js 202384）：短日期（zh-CN 用「M 月 D 日」，跨年带年） */
export function formatShortDate(timestamp: number, locale: string, withYear: boolean): string {
  const date = new Date(timestamp);
  if (locale === "zh-CN") {
    const monthDay = `${date.getMonth() + 1} 月 ${date.getDate()} 日`;
    return withYear ? `${date.getFullYear()} 年 ${monthDay}` : monthDay;
  }
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    ...(withYear ? { year: "numeric" } : {}),
  }).format(date);
}

/** 原 C2t（js 202396）：记忆更新时间标签（刚刚/N 分钟前/今天 HH:mm/昨天/周几/日期） */
export function formatMemoryUpdatedLabel(input: {
  formatMessage: IntlShape["formatMessage"];
  locale: string;
  now: number;
  updatedAt: number;
}): string {
  const { formatMessage, locale, now, updatedAt } = input;
  const elapsed = now - updatedAt;
  if (!Number.isFinite(updatedAt) || elapsed < ONE_MINUTE_MS) {
    return formatMessage({ id: "settings.memory.viewer.updated.justNow" });
  }
  const minutes = Math.floor(elapsed / ONE_MINUTE_MS);
  if (minutes < JUST_NOW_WINDOW_MINUTES) {
    return formatMessage({ id: "settings.memory.viewer.updated.minutesAgo" }, { count: minutes });
  }
  const todayStart = startOfDay(now);
  const updatedDayStart = startOfDay(updatedAt);
  const timeLabel = formatTimeH23(updatedAt, locale);
  if (updatedDayStart === todayStart) {
    return formatMessage({ id: "settings.memory.viewer.updated.today" }, { time: timeLabel });
  }
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  if (updatedDayStart === yesterdayStart.getTime()) {
    return formatMessage({ id: "settings.memory.viewer.updated.yesterday" }, { time: timeLabel });
  }
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  if (updatedDayStart >= weekStart.getTime()) {
    return formatMessage({ id: "settings.memory.viewer.updated.weekday" }, { time: timeLabel, weekday: formatWeekday(updatedAt, locale) });
  }
  return formatMessage(
    { id: "settings.memory.viewer.updated.date" },
    {
      date: formatShortDate(updatedAt, locale, new Date(updatedAt).getFullYear() !== new Date(todayStart).getFullYear()),
      time: timeLabel,
    },
  );
}

/** 原 T2t（js 202644）：错误 → 文案 */
export function errorMessageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** 原 T9（js 202647）：错误码判定（`{code}` 结构） */
export function hasErrorCode(error: unknown, code: string): boolean {
  return typeof error === "object" && !!error && "code" in error && (error as { code: unknown }).code === code;
}

/** 原 w2t（js 202420）：记忆查看器呈现层。
 *  三级导航：无选中项目 → 项目列表；选中项目 → 文件列表；选中文件 → 预览。
 *  返回按钮语义随层级切换（backToProjects / backToMemories），滚动位置由父级保持。 */
export function ProjectMemoryViewer({
  catalogError,
  catalogState,
  fileContent,
  fileError,
  fileState,
  selectedFileName,
  selectedWorkspace,
  workspaces,
  onBackToMemories,
  onBackToProjects,
  onRefresh,
  onSelectFile,
  onSelectWorkspace,
}: {
  catalogError: string | null;
  catalogState: "idle" | "loading" | "ready" | "error";
  fileContent: string;
  fileError: string | null;
  fileState: "idle" | "loading" | "ready" | "error";
  selectedFileName: string | null;
  selectedWorkspace: ProjectMemoryWorkspace | null;
  workspaces: ProjectMemoryWorkspace[];
  onBackToMemories: () => void;
  onBackToProjects: () => void;
  onRefresh: () => Promise<void>;
  onSelectFile: (fileName: string) => void;
  onSelectWorkspace: (workspace: ProjectMemoryWorkspace) => void;
}) {
  const { intl, locale } = useIntlContext();
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const theme = useZCodeStore((state) => state.theme);
  const codePreviewSettings = useZCodeStore((state) => state.codePreviewSettings);
  const memoryCountLabel = (count: number) =>
    intl.formatMessage({ id: `settings.memory.viewer.memoryCount.${count === 1 ? "one" : "other"}` }, { count });
  return (
    <div className="space-y-6">
      {/* 头部：标题/返回 + 刷新（202451–202517） */}
      <div className="flex items-start justify-between gap-3">
        {(() => {
          if (!selectedWorkspace) {
            return (
              <div className="min-w-0">
                <h2 className="text-ui-base font-medium text-foreground">
                  {intl.formatMessage({ id: "settings.memory.viewer.title" })}
                </h2>
                <p className="mt-1 text-ui-sm text-foreground-subtle">
                  {intl.formatMessage({ id: "settings.memory.viewer.projectsDescription" })}
                </p>
              </div>
            );
          }
          const backLabelId = selectedFileName
            ? "settings.memory.viewer.backToMemories"
            : "settings.memory.viewer.backToProjects";
          return (
            <div className="space-y-4">
              <BackLinkButton
                aria-label={intl.formatMessage({ id: backLabelId })}
                data-testid={selectedFileName ? SETTINGS_MEMORY_BACK_MEMORIES_TESTID : SETTINGS_MEMORY_BACK_PROJECTS_TESTID}
                onClick={selectedFileName ? onBackToMemories : onBackToProjects}
              >
                {intl.formatMessage({ id: backLabelId })}
              </BackLinkButton>
              <div className="min-w-0">
                <h2 className="truncate text-ui-base font-medium text-foreground">
                  {selectedFileName ?? selectedWorkspace.label}
                </h2>
                <p className="mt-1 truncate text-ui-sm text-foreground-subtle">
                  {selectedFileName ? selectedWorkspace.label : memoryCountLabel(selectedWorkspace.files.length)}
                </p>
              </div>
            </div>
          );
        })()}
        <Tooltip title={intl.formatMessage({ id: "settings.memory.viewer.refresh" })}>
          <Button
            type="button"
            size="icon-md"
            variant="ghost"
            aria-label={intl.formatMessage({ id: "settings.memory.viewer.refresh" })}
            data-testid={SETTINGS_MEMORY_REFRESH_TESTID}
            disabled={catalogState === "loading"}
            onClick={() => void onRefresh()}
          >
            {catalogState === "loading" ? (
              <SpinnerIcon className="size-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <IconRefresh className="size-3.5" aria-hidden="true" />
            )}
          </Button>
        </Tooltip>
      </div>

      {/* 目录错误 / 加载 / 空态 / 三级内容（202517–202643） */}
      {catalogError ? (
        <div className="flex flex-1 p-4">
          <Alert>
            <AlertDescription>{catalogError}</AlertDescription>
          </Alert>
        </div>
      ) : catalogState === "loading" && workspaces.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-4 py-10 text-center text-ui-base text-foreground-subtle">
          {intl.formatMessage({ id: "settings.memory.viewer.loading" })}
        </div>
      ) : workspaces.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-4 py-10 text-center text-ui-base text-foreground-subtle">
          {intl.formatMessage({ id: "settings.memory.viewer.empty" })}
        </div>
      ) : selectedWorkspace ? (
        selectedFileName ? (
          /* 文件预览（错误 / 加载 / Markdown 渲染） */
          <div
            className="min-w-0 overflow-hidden rounded-xl border border-border bg-background"
            data-testid={SETTINGS_MEMORY_PREVIEW_TESTID}
          >
            {fileError ? (
              <div className="p-4">
                <Alert>
                  <AlertDescription>{fileError}</AlertDescription>
                </Alert>
              </div>
            ) : fileState === "loading" ? (
              <div className="flex h-full items-center justify-center text-ui-base text-foreground-subtle">
                {intl.formatMessage({ id: "settings.memory.viewer.fileLoading" })}
              </div>
            ) : selectedFileName && fileState === "ready" ? (
              <div className="min-h-0">
                <MemoryFilePreview content={fileContent} codePreviewSettings={codePreviewSettings} theme={theme} />
              </div>
            ) : null}
          </div>
        ) : (
          /* 文件列表 */
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="divide-y divide-border">
              {selectedWorkspace.files.map((file) => (
                <Tooltip key={file.name} title={file.name} side="right">
                  <button
                    type="button"
                    data-testid={testidOf(SETTINGS_MEMORY_FILE_TESTID, file.name)}
                    className="flex w-full min-w-0 items-center gap-3 px-4 py-3 text-left outline-none hover:bg-hover focus-visible:bg-hover"
                    onClick={() => onSelectFile(file.name)}
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface text-foreground-subtle">
                      <IconFileText className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1 truncate font-mono text-ui-base text-foreground">{file.name}</span>
                    <IconChevronRight className="size-4 shrink-0 text-foreground-subtlest" />
                  </button>
                </Tooltip>
              ))}
            </div>
          </div>
        )
      ) : (
        /* 项目列表 */
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="divide-y divide-border">
            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                type="button"
                data-testid={testidOf(SETTINGS_MEMORY_WORKSPACE_TESTID, workspace.id)}
                className="flex w-full min-w-0 items-center gap-3 px-4 py-3 text-left outline-none hover:bg-hover focus-visible:bg-hover"
                onClick={() => onSelectWorkspace(workspace)}
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface text-foreground-subtle">
                  <IconFolder className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-ui-base font-medium text-foreground">{workspace.label}</span>
                  <span className="mt-0.5 block truncate text-ui-sm text-foreground-subtle">
                    {memoryCountLabel(workspace.files.length)}
                    {" · "}
                    {formatMemoryUpdatedLabel({
                      formatMessage: intl.formatMessage,
                      locale,
                      now,
                      updatedAt: workspace.updatedAt,
                    })}
                  </span>
                </span>
                <IconChevronRight className="size-4 shrink-0 text-foreground-subtlest" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** 原 ds（js 2635）+ us context：服务 Provider（记忆分区在 E2t 外包一层） */
const ServicesContext = React.createContext<BaseServices | null>(null);
export function SettingsServicesProvider({ services, children }: { services: BaseServices; children: React.ReactNode }) {
  return <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>;
}

/** 原 E2t（js 202650）：记忆分区 = 工作区记忆开关 + 查看器（含请求序号防竞态）。
 *  错误码映射：ENOENT→fileDeleted、PROJECT_MEMORY_PREVIEW_LIMIT_EXCEEDED→fileTooLarge（5MiB 上限，
 *  服务端判定）、PROJECT_MEMORY_FILE_CHANGED→fileChanged。 */
export function MemorySettingsSection({
  memoryEnabled,
  memoryService,
  onMemoryEnabledChange,
  projectMemoryViewerAvailable,
}: {
  memoryEnabled: boolean;
  memoryService: MemoryService;
  onMemoryEnabledChange: (v: boolean) => void;
  projectMemoryViewerAvailable: boolean;
}) {
  const { intl } = useIntlContext();
  const containerRef = React.useRef<HTMLDivElement>(null);
  /** 原 a.current：项目列表滚动位置（返回项目列表时恢复） */
  const projectsScrollTopRef = React.useRef(0);
  /** 原 s.current：文件列表滚动位置（返回文件列表时恢复） */
  const filesScrollTopRef = React.useRef(0);
  /** 原 c.current：目录请求序号（防竞态） */
  const catalogRequestIdRef = React.useRef(0);
  /** 原 l.current：文件读取请求序号（防竞态；卸载时自增使在途响应作废） */
  const fileRequestIdRef = React.useRef(0);
  const [catalogState, setCatalogState] = React.useState<"idle" | "loading" | "ready" | "error">("idle");
  const [catalogError, setCatalogError] = React.useState<string | null>(null);
  const [workspaces, setWorkspaces] = React.useState<ProjectMemoryWorkspace[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = React.useState<string | null>(null);
  const [selectedFile, setSelectedFile] = React.useState<{ workspaceId: string; fileName: string } | null>(null);
  const [fileState, setFileState] = React.useState<"idle" | "loading" | "ready" | "error">("idle");
  const [fileContent, setFileContent] = React.useState("");
  const [fileError, setFileError] = React.useState<string | null>(null);

  const resetFileView = React.useCallback(() => {
    fileRequestIdRef.current += 1;
    setSelectedFile(null);
    setFileState("idle");
    setFileContent("");
    setFileError(null);
  }, []);

  /** 原 D（202671–202697）：读取单个记忆文件 */
  const readFile = React.useCallback(
    async (workspaceId: string, fileName: string) => {
      const requestId = fileRequestIdRef.current + 1;
      fileRequestIdRef.current = requestId;
      setSelectedFile({ workspaceId, fileName });
      setFileState("loading");
      setFileContent("");
      setFileError(null);
      try {
        const result = await memoryService.readProjectMemoryFile({ workspaceId, fileName });
        if (fileRequestIdRef.current === requestId) {
          setFileContent(result.content);
          setFileState("ready");
        }
      } catch (error) {
        if (fileRequestIdRef.current === requestId) {
          setFileError(
            hasErrorCode(error, "ENOENT")
              ? intl.formatMessage({ id: "settings.memory.viewer.fileDeleted" })
              : hasErrorCode(error, "PROJECT_MEMORY_PREVIEW_LIMIT_EXCEEDED")
                ? intl.formatMessage({ id: "settings.memory.viewer.fileTooLarge" })
                : hasErrorCode(error, "PROJECT_MEMORY_FILE_CHANGED")
                  ? intl.formatMessage({ id: "settings.memory.viewer.fileChanged" })
                  : errorMessageOf(error),
          );
          setFileState("error");
        }
      }
    },
    [intl, memoryService],
  );

  /** 原 O（202698–202707）：刷新项目目录 */
  const refreshCatalog = React.useCallback(async (): Promise<ProjectMemoryWorkspace[] | null> => {
    const requestId = catalogRequestIdRef.current + 1;
    catalogRequestIdRef.current = requestId;
    setCatalogState("loading");
    setCatalogError(null);
    try {
      const list = await memoryService.listProjectMemories();
      if (catalogRequestIdRef.current !== requestId) return null;
      setWorkspaces(list);
      setCatalogState("ready");
      return list;
    } catch (error) {
      if (catalogRequestIdRef.current !== requestId) return null;
      setWorkspaces([]);
      setSelectedWorkspaceId(null);
      resetFileView();
      setCatalogError(errorMessageOf(error));
      setCatalogState("error");
      return null;
    }
  }, [resetFileView, memoryService]);

  /* 原 202708–202715：开关/可用性变化时重载或清空 */
  React.useEffect(() => {
    if (memoryEnabled && projectMemoryViewerAvailable) {
      void refreshCatalog();
      return;
    }
    catalogRequestIdRef.current += 1;
    setCatalogState("idle");
    setCatalogError(null);
    setWorkspaces([]);
    setSelectedWorkspaceId(null);
    resetFileView();
  }, [resetFileView, memoryEnabled, projectMemoryViewerAvailable, refreshCatalog]);

  const selectedWorkspace = React.useMemo(
    () => workspaces.find((workspace) => workspace.id === selectedWorkspaceId) ?? null,
    [selectedWorkspaceId, workspaces],
  );
  const selectedFileName =
    selectedFile && selectedWorkspace && selectedFile.workspaceId === selectedWorkspace.id
      ? selectedWorkspace.files.some((file) => file.name === selectedFile.fileName)
        ? selectedFile.fileName
        : null
      : null;

  /* 原 202717–202721：选中文件失效时回退 */
  React.useEffect(() => {
    if (selectedFile && !selectedFileName) resetFileView();
  }, [resetFileView, selectedFile, selectedFileName]);

  /** 原 j（202722–202738）：选择文件（记录滚动位置并回到顶部） */
  const selectFile = React.useCallback(
    (fileName: string) => {
      if (!selectedWorkspace || !selectedWorkspace.files.some((file) => file.name === fileName)) return;
      const workspaceId = selectedWorkspace.id;
      if (selectedFile?.workspaceId === workspaceId && selectedFile.fileName === fileName && fileState !== "error") return;
      filesScrollTopRef.current = containerRef.current?.closest("main")?.scrollTop ?? 0;
      void readFile(workspaceId, fileName);
      requestAnimationFrame(() => {
        const main = containerRef.current?.closest("main");
        if (main) main.scrollTop = 0;
      });
    },
    [fileState, readFile, selectedFile, selectedWorkspace],
  );

  /** 原 M（202739–202757）：刷新（保持当前选中层级） */
  const refresh = React.useCallback(async () => {
    const workspaceId = selectedWorkspaceId;
    const currentFile = selectedFile;
    const fileRequestId = fileRequestIdRef.current;
    const list = await refreshCatalog();
    if (!list || fileRequestIdRef.current !== fileRequestId || !workspaceId) return;
    const workspace = list.find((item) => item.id === workspaceId);
    if (!workspace) {
      resetFileView();
      setSelectedWorkspaceId(null);
      return;
    }
    if (currentFile) {
      if (!workspace.files.some((file) => file.name === currentFile.fileName)) {
        resetFileView();
        return;
      }
      await readFile(currentFile.workspaceId, currentFile.fileName);
    }
  }, [resetFileView, readFile, refreshCatalog, selectedFile, selectedWorkspaceId]);

  /** 原 N（202758–202768）：进入项目（记滚动位置，回顶部） */
  const selectWorkspace = React.useCallback(
    (workspace: ProjectMemoryWorkspace) => {
      projectsScrollTopRef.current = containerRef.current?.closest("main")?.scrollTop ?? 0;
      resetFileView();
      setSelectedWorkspaceId(workspace.id);
      requestAnimationFrame(() => {
        const main = containerRef.current?.closest("main");
        if (main) main.scrollTop = 0;
      });
    },
    [resetFileView],
  );

  /** 原 P（202769–202776）：返回文件列表（恢复文件滚动位置） */
  const backToMemories = React.useCallback(() => {
    resetFileView();
    requestAnimationFrame(() => {
      const main = containerRef.current?.closest("main");
      if (main) main.scrollTop = filesScrollTopRef.current;
    });
  }, [resetFileView]);

  /** 原 F（202777–202784）：返回项目列表（恢复项目滚动位置） */
  const backToProjects = React.useCallback(() => {
    resetFileView();
    setSelectedWorkspaceId(null);
    requestAnimationFrame(() => {
      const main = containerRef.current?.closest("main");
      if (main) main.scrollTop = projectsScrollTopRef.current;
    });
  }, [resetFileView]);

  /* 原 202785–202790：卸载时作废在途文件请求 */
  React.useEffect(
    () => () => {
      fileRequestIdRef.current += 1;
    },
    [],
  );

  return (
    <div ref={containerRef} className="space-y-6">
      {/* 工作区记忆开关（进入项目后隐藏；202793–202808） */}
      {selectedWorkspace ? null : (
        <SettingsSectionCard>
          <SettingsRow
            label={intl.formatMessage({ id: "settings.memory.workspaceMemory" })}
            description={intl.formatMessage({ id: "settings.memoryDescription" })}
            control={
              <Switch
                aria-label={intl.formatMessage({ id: "settings.memory.workspaceMemory" })}
                checked={memoryEnabled}
                data-testid={SETTINGS_MEMORY_SWITCH_TESTID}
                onCheckedChange={(value) => {
                  onMemoryEnabledChange(value);
                }}
              />
            }
          />
        </SettingsSectionCard>
      )}
      {/* 查看器 / 禁用态 / 仅桌面提示（202809–202836） */}
      {projectMemoryViewerAvailable ? (
        memoryEnabled ? (
          <ProjectMemoryViewer
            catalogError={catalogError}
            catalogState={catalogState}
            fileContent={fileContent}
            fileError={fileError}
            fileState={fileState}
            selectedFileName={selectedFileName}
            selectedWorkspace={selectedWorkspace}
            workspaces={workspaces}
            onBackToMemories={backToMemories}
            onBackToProjects={backToProjects}
            onRefresh={refresh}
            onSelectFile={selectFile}
            onSelectWorkspace={selectWorkspace}
          />
        ) : (
          <div className="rounded-xl border border-border bg-card px-4 py-8 text-center text-ui-base text-foreground-subtle">
            {intl.formatMessage({ id: "settings.memory.viewer.disabled" })}
          </div>
        )
      ) : (
        <div className="rounded-xl border border-border bg-card px-4 py-8 text-center text-ui-base text-foreground-subtle">
          {intl.formatMessage({ id: "settings.memory.viewer.localOnly" })}
        </div>
      )}
    </div>
  );
}

/* ============================================================================
 * 11. 索引分区（原 h2t，js 202286–202336 / jsx 161628）
 * ==========================================================================*/

/** 原 Wt：repoSnapshotIndexingEnabled 的有效值判定（设置层助手，行号见报告） */

export function IndexingSettingsSection() {
  const { intl } = useIntlContext();
  const { settings, update } = useAppSettings();
  const repoSnapshotEnabled = resolveRepoSnapshotIndexingEnabled(settings);
  const instantGrepEnabled = settings?.instantGrepIndexingEnabled === true;
  return (
    <div className="space-y-3">
      <div className="text-ui-base font-medium text-foreground-subtle">
        {intl.formatMessage({ id: "settings.indexing.codebase" })}
      </div>
      <SettingsSectionCard>
        <SettingsRow
          label={intl.formatMessage({ id: "settings.indexing.repoTitle" })}
          description={intl.formatMessage({ id: "settings.indexing.repoDescription" })}
          control={
            <Switch
              checked={repoSnapshotEnabled}
              onCheckedChange={(value) => {
                void update({ repoSnapshotIndexingEnabled: value, repoSnapshotIndexingUserConfigured: true });
              }}
            />
          }
        />
        <SettingsRow
          label={intl.formatMessage({ id: "settings.indexing.instantGrepTitle" })}
          description={intl.formatMessage({ id: "settings.indexing.instantGrepDescription" })}
          control={
            <Switch
              checked={instantGrepEnabled}
              onCheckedChange={(value) => {
                void update({ instantGrepIndexingEnabled: value });
              }}
            />
          }
        />
      </SettingsSectionCard>
    </div>
  );
}

/* ============================================================================
 * 12. 浏览器分区（原 O2t，js 202904–203128 / jsx 162015）
 *     Browser Use 插件开关 + Chrome 数据导入 + 清缓存/清全部（确认对话框）
 * ==========================================================================*/

/** 原 E9（js 202888）：Browser Use 官方插件 id */
export const BROWSER_USE_PLUGIN_ID = "browser-use@zcode-plugins-official";

interface ChromeImportResult {
  success: boolean;
  error?: string;
  cookies: { imported: number; skipped: number };
  localStorage: { originsImported: number; entriesImported: number };
  issues?: string[];
}

/** 原 D2t（js 202839）：Chrome 导入结果 → i18n 消息（12 种错误码映射） */
export function resolveBrowserImportResultMessage(
  result: ChromeImportResult,
  formatMessage: IntlShape["formatMessage"],
): string {
  if (!result.success) {
    return formatMessage({
      id:
        result.error === "chrome_profile_not_found" || result.error === "chrome_default_profile_not_found"
          ? "settings.browser.import.notFound"
          : result.error === "chrome_profile_ambiguous"
            ? "settings.browser.import.ambiguous"
            : result.error === "chrome_executable_not_found"
              ? "settings.browser.import.executableNotFound"
              : result.error === "chrome_cookie_access_denied"
                ? "settings.browser.import.accessDenied"
                : result.error === "chrome_cookie_elevation_required"
                  ? "settings.browser.import.elevationRequired"
                  : result.error === "chrome_cookie_elevation_cancelled"
                    ? "settings.browser.import.elevationCancelled"
                    : result.error === "chrome_cookie_helper_verification_failed"
                      ? "settings.browser.import.helperVerificationFailed"
                      : result.error === "chrome_cookie_app_bound_decryption_failed"
                        ? "settings.browser.import.appBoundFailed"
                        : result.error === "chrome_cookie_protection_unsupported"
                          ? "settings.browser.import.cookieProtected"
                          : result.error === "chrome_profile_locked"
                            ? "settings.browser.import.profileLocked"
                            : result.error === "chrome_local_storage_import_failed"
                              ? "settings.browser.import.localStorageFailed"
                              : "settings.browser.import.failed",
    });
  }
  const values = {
    cookies: String(result.cookies.imported),
    origins: String(result.localStorage.originsImported),
    entries: String(result.localStorage.entriesImported),
    skipped: String(result.cookies.skipped),
  };
  const appBoundIssues = result.issues?.some((issue) =>
    [
      "chrome_cookie_elevation_required",
      "chrome_cookie_elevation_cancelled",
      "chrome_cookie_helper_verification_failed",
      "chrome_cookie_app_bound_decryption_failed",
    ].includes(issue),
  );
  return appBoundIssues
    ? formatMessage({ id: "settings.browser.import.partialAppBound" }, values)
    : formatMessage({ id: "settings.browser.import.success" }, values);
}

/** 原 Ag：工作区会话服务解析（zcodeSessionService，横切层 24015–25006 段） */
declare function resolveWorkspaceSessionService(
  workspacePath: string | undefined,
  unused: undefined,
  workspaceIdentity: string | undefined,
): ZcodeSessionService;

/** 原 B6：插件 store（js 142985，横切层） */
interface PluginRecord {
  id: string;
  enabled: boolean;
  [key: string]: unknown;
}
interface PluginsStoreState {
  plugins: PluginRecord[];
  loading: boolean;
  error: string | null;
  togglingPluginId: string | null;
  initialize(input: { workspacePath: string; workspaceIdentity?: string | null; pluginService: PluginManagementService }): Promise<void>;
  setEnabled(pluginId: string, enabled: boolean, pluginService: PluginManagementService): Promise<void>;
}
interface PluginsStoreHook {
  <T>(selector: (state: PluginsStoreState) => T): T;
  getState(): PluginsStoreState;
}

/** 原 Ne：技能 store（skillStore chunk 的 t 导出） */

/** 原 M6：技能上下文失效广播（会话服务，F08 横切） */
declare function invalidateSkillCaches(input: {
  zcodeSessionService: ZcodeSessionService;
  workspacePath?: string | null;
  workspaceIdentity?: string | null;
  reason: string;
}): Promise<void>;

export function BrowserSettingsSection({
  isDesktop,
  isWindowsDesktop = false,
  workspacePath,
  workspaceIdentity,
}: {
  isDesktop: boolean;
  isWindowsDesktop?: boolean;
  workspacePath: string | null;
  workspaceIdentity?: string | null;
}) {
  const { intl } = useIntlContext();
  const platform = usePlatformService();
  const { pluginManagementService, skillsService } = useServices();
  const zcodeSessionService = resolveWorkspaceSessionService(workspacePath ?? undefined, undefined, workspaceIdentity ?? undefined);
  const browserUsePlugin = usePluginsStore((state) => state.plugins.find((plugin) => plugin.id === BROWSER_USE_PLUGIN_ID));
  const pluginsLoading = usePluginsStore((state) => state.loading);
  const pluginsError = usePluginsStore((state) => state.error);
  const togglingPluginId = usePluginsStore((state) => state.togglingPluginId);
  const initializePlugins = usePluginsStore((state) => state.initialize);
  const setPluginEnabled = usePluginsStore((state) => state.setEnabled);
  const refreshSkills = useSkillsStore((state) => state.refresh);
  const skillsWorkspacePath = useSkillsStore((state) => state.workspacePath);
  const skillsWorkspaceIdentity = useSkillsStore((state) => state.workspaceIdentity);
  const [pendingOperation, setPendingOperation] = React.useState<string | null>(null);
  const [confirmClearAllOpen, setConfirmClearAllOpen] = React.useState(false);
  const [lastImportResult, setLastImportResult] = React.useState<ChromeImportResult | null>(null);
  const trimmedIdentity = workspaceIdentity?.trim() || null;
  const chromeDataApisAvailable =
    isDesktop &&
    typeof platform.importChromeBrowserData === "function" &&
    typeof platform.clearEmbeddedBrowserData === "function";

  React.useEffect(() => {
    if (workspacePath) void initializePlugins({ workspacePath, workspaceIdentity, pluginService: pluginManagementService });
  }, [initializePlugins, pluginManagementService, workspaceIdentity, workspacePath]);

  /** 原 O（202929–202938）：开关生效后广播技能缓存失效 + 刷新技能列表 */
  const broadcastPluginToggle = React.useCallback(async () => {
    await invalidateSkillCaches({
      zcodeSessionService,
      workspacePath,
      workspaceIdentity: trimmedIdentity ?? undefined,
      reason: "settings-browser-use-plugin-enabled",
    });
    if (workspacePath && skillsWorkspacePath === workspacePath && skillsWorkspaceIdentity === trimmedIdentity) {
      await refreshSkills(skillsService, trimmedIdentity ?? undefined);
    }
  }, [trimmedIdentity, refreshSkills, skillsWorkspaceIdentity, skillsWorkspacePath, skillsService, workspacePath, zcodeSessionService]);

  /** 原 k（202939–202953）：Browser Use 开关（仅当 store 写入已生效时广播 + toast） */
  const toggleBrowserUse = React.useCallback(
    async (enabled: boolean) => {
      await setPluginEnabled(BROWSER_USE_PLUGIN_ID, enabled, pluginManagementService);
      if (usePluginsStore.getState().plugins.find((plugin) => plugin.id === BROWSER_USE_PLUGIN_ID)?.enabled === enabled) {
        await broadcastPluginToggle();
        toast(
          intl.formatMessage({
            id: enabled ? "settings.browser.control.enabledToast" : "settings.browser.control.disabledToast",
          }),
        );
      }
    },
    [intl, pluginManagementService, broadcastPluginToggle, setPluginEnabled],
  );

  /** 原 A（202954–202968）：导入 Chrome 数据 */
  const importChromeData = React.useCallback(async () => {
    if (!platform.importChromeBrowserData) return;
    setPendingOperation("import");
    try {
      const result = await platform.importChromeBrowserData();
      setLastImportResult(result);
      toast(resolveBrowserImportResultMessage(result, intl.formatMessage), { durationMs: 5000 });
    } catch (error) {
      logger.error("[browser-settings] 导入 Chrome 数据失败", {
        error: error instanceof Error ? error.message : String(error),
      });
      toast(intl.formatMessage({ id: "settings.browser.import.failed" }));
    } finally {
      setPendingOperation(null);
    }
  }, [intl, platform]);

  /** 原 j（202969–202999）：清理内置浏览器数据（cache|all） */
  const clearEmbeddedData = React.useCallback(
    async (mode: "cache" | "all") => {
      if (!platform.clearEmbeddedBrowserData) return;
      setPendingOperation(mode === "cache" ? "clear-cache" : "clear-all");
      try {
        const result = await platform.clearEmbeddedBrowserData(mode);
        toast(
          intl.formatMessage({
            id: result.success
              ? mode === "cache"
                ? "settings.browser.clearCache.success"
                : "settings.browser.clearAll.success"
              : "settings.browser.clear.failed",
          }),
        );
      } catch (error) {
        logger.error("[browser-settings] 清理内置浏览器数据失败", {
          error: error instanceof Error ? error.message : String(error),
          mode,
        });
        toast(intl.formatMessage({ id: "settings.browser.clear.failed" }));
      } finally {
        setPendingOperation(null);
        setConfirmClearAllOpen(false);
      }
    },
    [intl, platform],
  );

  const toggling = togglingPluginId === BROWSER_USE_PLUGIN_ID;
  const controlDisabled = !workspacePath || pluginsLoading || !browserUsePlugin;
  const dataActionsDisabled = !chromeDataApisAvailable;

  return (
    <div className="space-y-5">
      {/* ── 控制：Browser Use 开关（203001–203028） ── */}
      <section className="space-y-3">
        <div className="text-ui-base font-medium text-foreground-subtle">
          {intl.formatMessage({ id: "settings.browser.control.section" })}
        </div>
        <SettingsSectionCard>
          <SettingsRow
            label={intl.formatMessage({ id: "settings.browser.control.title" })}
            description={intl.formatMessage({ id: "settings.browser.control.description" })}
            control={
              <Switch
                aria-label={intl.formatMessage({ id: "settings.browser.control.title" })}
                checked={browserUsePlugin?.enabled === true}
                disabled={controlDisabled || toggling}
                onCheckedChange={(value) => void toggleBrowserUse(value)}
              />
            }
            detail={
              pluginsError ? <div className="text-ui-base text-destructive">{pluginsError}</div> : undefined
            }
          />
        </SettingsSectionCard>
      </section>

      {/* ── 数据：导入 / 清缓存 / 清全部（203029–203088） ── */}
      <section className="space-y-3">
        <div className="text-ui-base font-medium text-foreground-subtle">
          {intl.formatMessage({ id: "settings.browser.data.section" })}
        </div>
        {chromeDataApisAvailable ? null : (
          <div className="rounded-lg border border-border bg-surface px-4 py-3 text-ui-base text-foreground-subtle">
            {intl.formatMessage({ id: "settings.browser.desktopOnly" })}
          </div>
        )}
        <SettingsSectionCard>
          {isWindowsDesktop ? null : (
            <SettingsRow
              label={intl.formatMessage({ id: "settings.browser.import.title" })}
              description={intl.formatMessage({ id: "settings.browser.import.description" })}
              control={
                <PendingOperationButton
                  operation="import"
                  pendingOperation={pendingOperation}
                  disabled={dataActionsDisabled}
                  onClick={() => void importChromeData()}
                >
                  {intl.formatMessage({ id: "settings.browser.import.action" })}
                </PendingOperationButton>
              }
              detail={
                lastImportResult ? (
                  <div className="text-ui-base text-foreground-subtle">
                    {resolveBrowserImportResultMessage(lastImportResult, intl.formatMessage)}
                  </div>
                ) : undefined
              }
            />
          )}
          <SettingsRow
            label={intl.formatMessage({ id: "settings.browser.clearCache.title" })}
            description={intl.formatMessage({ id: "settings.browser.clearCache.description" })}
            control={
              <PendingOperationButton
                operation="clear-cache"
                pendingOperation={pendingOperation}
                disabled={dataActionsDisabled}
                onClick={() => void clearEmbeddedData("cache")}
              >
                {intl.formatMessage({ id: "settings.browser.clearCache.action" })}
              </PendingOperationButton>
            }
          />
          <SettingsRow
            label={intl.formatMessage({ id: "settings.browser.clearAll.title" })}
            description={intl.formatMessage({ id: "settings.browser.clearAll.description" })}
            control={
              <PendingOperationButton
                operation="clear-all"
                pendingOperation={pendingOperation}
                disabled={dataActionsDisabled}
                variant="destructive"
                onClick={() => setConfirmClearAllOpen(true)}
              >
                {intl.formatMessage({ id: "settings.browser.clearAll.action" })}
              </PendingOperationButton>
            }
          />
        </SettingsSectionCard>
      </section>

      {/* ── 清全部确认对话框（203089–203127） ── */}
      <AlertDialog open={confirmClearAllOpen} onOpenChange={setConfirmClearAllOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{intl.formatMessage({ id: "settings.browser.clearAll.confirmTitle" })}</AlertDialogTitle>
            <AlertDialogDescription>
              {intl.formatMessage({ id: "settings.browser.clearAll.confirmDescription" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pendingOperation !== null}>
              {intl.formatMessage({ id: "common.cancel" })}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={pendingOperation !== null}
              onClick={(event) => {
                event.preventDefault();
                void clearEmbeddedData("all");
              }}
            >
              {pendingOperation === "clear-all" ? <SpinnerIcon className="size-4 animate-spin" aria-hidden="true" /> : null}
              {intl.formatMessage({ id: "settings.browser.clearAll.confirmAction" })}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ============================================================================
 * 13. MCP 分区（原 G$t，js 194645–195889 / jsx 156627）
 *     工具条（新建/导入/远程同步）+ 搜索 + 分组列表（本地/插件）+ 表单/JSON 编辑器
 *     OAuth 状态轮询与焦点回归刷新（效果链 194795–194916）
 * ==========================================================================*/

export interface McpServer {
  id: string;
  name: string;
  source: string;
  storageLevel?: "workspace" | "user" | string;
  projectPath?: string | null;
  enabled?: boolean;
  authorization?: { authorizationUrl?: string } | null;
  [key: string]: unknown;
}
export type McpStatusSnapshot = Record<string, unknown>;

/** 原 Ug（js 25007，横切层 McpStore）：按工作区身份的 MCP 状态机 */
interface McpStoreState {
  servers: McpServer[];
  statusSnapshots: Record<string, McpStatusSnapshot>;
  currentProjectPath: string;
  currentWorkspaceIdentity: string | null;
  isConfigLoaded: boolean;
  ensureLoadedForWorkspace(
    workspacePath: string,
    mcpSyncService: McpSyncService,
    workspaceIdentity?: string | null,
  ): Promise<boolean>;
  loadMcpFromUserDirectory(mcpSyncService: McpSyncService, workspaceIdentity?: string | null): Promise<boolean>;
  toggleServer(serverId: string, enabled: boolean): Promise<void>;
  addScopedMcpServer(source: string, name: string, payload: unknown, workspaceIdentity?: string | null): Promise<void>;
  updateScopedMcpServer(source: string, name: string, payload: unknown, workspaceIdentity?: string | null): Promise<void>;
  deleteScopedMcpServer(source: string, name: string, projectPath?: string | null): Promise<void>;
  updateServerStatus(
    serverId: string,
    status: string,
    detail: unknown,
    opts?: { invalidateStatusListRequests?: boolean },
  ): void;
  beginServerStatusListRefresh(): void;
  markServerStatusListRefreshFailed(): void;
  mergeServerStatusSnapshots(snapshots: Record<string, McpStatusSnapshot>): void;
  getEnabledMcpServersForZCode(provider: string): McpServer[];
}
interface McpStoreHook {
  <T>(selector: (state: McpStoreState) => T): T;
  getState(): McpStoreState;
}

/* MCP 助手群（原 192533–194644 段内的纯函数/常量，接口级声明）： */
/** 原 V7（js 194325）：ZCode 自建 MCP 源标识 */
const MCP_SOURCE_ZCODE = "zcodeagentmcp";
/** 原 z$t：服务器列表指纹 */
declare function mcpServersFingerprint(servers: McpServer[]): string;
/** 原 B$t：插件列表指纹 */
declare function pluginsFingerprint(plugins: PluginRecord[]): string;
/** 原 H$t：计算待 OAuth 授权键（有则轮询状态） */
declare function computePendingOAuthKey(servers: McpServer[], snapshots: Record<string, McpStatusSnapshot>): string | null;
/** 原 R$t：参与状态刷新的服务器 */
declare function pickStatusRefreshServers(servers: McpServer[], snapshots: Record<string, McpStatusSnapshot>): McpServer[];
/** 原 M$t：OAuth 轮询截止时间 */
declare function oauthPollDeadline(): number;
/** 原 N$t：是否已过截止时间 */
declare function isPastDeadline(deadline: number): boolean;
/** 原 k$t：OAuth 轮询间隔（ms） */
declare const MCP_OAUTH_POLL_INTERVAL_MS: number;
/** 原 j$t：OAuth 授权后跟进刷新最大次数 */
declare const MCP_OAUTH_FOLLOWUP_MAX_ATTEMPTS: number;
/** 原 F$t：刷新键变化判定（返回 {lastRefreshKey, shouldRefresh}） */
declare function resolveRefreshKeyChange(
  previousKey: string,
  nextKey: string,
): { lastRefreshKey: string; shouldRefresh: boolean };
/** 原 I$t：OAuth 待处理/跟进状态归并 */
declare function resolveOAuthFollowup(input: {
  activeWorkspaceKey: string;
  existingFollowup: OAuthFollowup | null;
  mcpServers: McpServer[];
  pendingKey: string | null;
  previous: string | null;
}): { pending: string | null; followup: OAuthFollowup | null };
interface OAuthFollowup {
  refreshKey: string;
  workspaceKey: string;
  mcpServers: McpServer[];
}
/** 原 P$t：状态列表刷新（返回 refreshed|stale-workspace|status-mode-unsupported|failed） */
declare function refreshMcpServerStatuses(input: {
  beginServerStatusListRefresh: () => void;
  getCurrentWorkspaceKey: () => string;
  markServerStatusListRefreshFailed: () => void;
  mergeServerStatusSnapshots: (snapshots: Record<string, McpStatusSnapshot>) => void;
  mcpServers: McpServer[];
  mode?: "status" | "full";
  requestedWorkspaceKey: string;
  workspaceIdentity?: string | null;
  workspacePath: string;
  mcpSyncService: McpSyncService;
}): Promise<"refreshed" | "stale-workspace" | "status-mode-unsupported" | "failed">;
/** 原 QQt：按搜索词过滤本地服务器 */
declare function filterMcpServersByQuery(servers: McpServer[], query: string): McpServer[];
/** 原 V$t：插件 MCP 列表可见性 */
declare function isPluginMcpListVisible(remote: boolean): boolean;
/** 原 $Qt：插件托管 MCP 条目 */
declare function buildPluginMcpItems(
  plugins: PluginRecord[],
  query: string,
  snapshots: Record<string, McpStatusSnapshot>,
): unknown[];
/** 原 L$t：互斥锁工厂（串行化状态刷新） */
declare function createSerialMutex(): { request<T>(task: () => Promise<T>): Promise<T> } | null;
/** 原 H7（js 194440）：服务器序列化（刷新参数） */
declare function serializeMcpServers(servers: McpServer[]): unknown;
/** 原 RQt：服务器 → 编辑载荷 */
declare function mcpServerToPayload(server: McpServer): Record<string, unknown>;

/** 原 KQt（js 192956）：MCP 服务器列表（空态带创建按钮；行 = GQt，接口级） */
export function McpServerList({
  servers,
  onCreate,
  onEdit,
  onDelete,
  onToggle,
  onOpenAuthorization,
  emptyTitle,
  emptyDescription,
}: {
  servers: McpServer[];
  onCreate: () => void;
  onEdit: (server: McpServer) => void;
  onDelete: (server: McpServer) => void;
  onToggle: (serverId: string, enabled: boolean) => void;
  onOpenAuthorization: (server: McpServer) => void;
  emptyTitle: string;
  emptyDescription: string;
}) {
  const { intl } = useIntlContext();
  if (servers.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-dashed border-border">
        <div className="flex flex-col items-center justify-center gap-3 px-4 py-10 text-center">
          <div className="space-y-1">
            <div className="text-ui-base font-medium text-foreground">{emptyTitle}</div>
            <div className="text-ui-base text-foreground-subtle">{emptyDescription}</div>
          </div>
          <Button variant="outline" size="sm" onClick={onCreate}>
            <IconPlus className="size-4" />
            <span>{intl.formatMessage({ id: "settings.mcp.create.open" })}</span>
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="divide-y divide-border">
        {servers.map((server) => (
          <McpServerRow
            key={server.id}
            server={server}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggle={onToggle}
            onOpenAuthorization={onOpenAuthorization}
          />
        ))}
      </div>
    </div>
  );
}

/** 原 GQt（js 192850 附近）：MCP 服务器行（开关/编辑/删除/打开 OAuth 授权；
 *  testid：mcp-server-row / mcp-open-authorization-button，src chunk 8337/8339）。接口级。 */

/** 原 U$t（js 194480）：编辑器模式切换（表单 | JSON） */
export function McpEditorModeTabs({
  mode,
  onModeChange,
}: {
  mode: "form" | "json";
  onModeChange: (mode: "form" | "json") => void;
}) {
  const { intl } = useIntlContext();
  return (
    <Tabs value={mode} onValueChange={(value) => onModeChange(value as "form" | "json")} className="shrink-0 self-end">
      <TabsList className="flex h-8 rounded-lg border border-border bg-background p-1">
        <TabsTrigger value="form" className="h-6 rounded-md px-2.5 text-ui-base data-active:bg-secondary data-active:text-foreground">
          {intl.formatMessage({ id: "settings.mcp.form.mode.form" })}
        </TabsTrigger>
        <TabsTrigger value="json" className="h-6 rounded-md px-2.5 text-ui-base data-active:bg-secondary data-active:text-foreground">
          JSON
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

/** 原 HQt（js 192533）：MCP 服务器编辑器（表单/JSON 双模式；stdio/SSE/命令/参数/环境变量）。接口级。 */

/** 原 _$t（js 193344）：MCP 导入对话框 —— 外部 agent 配置一键导入
 *  （settingsSync：Claude Code/Codex/OpenCode…18 种，settingsSync.* 28 处 193248–207980）。接口级。 */

/** 原 W$t（js 194503）：插件托管 MCP 列表（testid：plugin-mcp-server-row，src chunk 8338）。接口级。 */
declare const PluginMcpServerList: React.FC<{ items: unknown[]; onOpenAuthorization: (server: McpServer) => void }>;

export interface McpSettingsSectionProps {
  workspacePath?: string | null;
  workspaceIdentity?: string | null;
  remoteSessionId?: string | null;
  remoteTarget?: RemoteTarget | null;
  localWorkspacePath?: string | null;
  isWebRemoteControl?: boolean;
}

/** 原 G$t（js 194645）：MCP 分区主组件 */
export function McpSettingsSection({
  workspacePath,
  workspaceIdentity,
  remoteSessionId,
  remoteTarget,
  localWorkspacePath,
  isWebRemoteControl = false,
}: McpSettingsSectionProps = {}) {
  const { intl } = useIntlContext();
  const confirmDialog = useConfirmDialog();
  const services = useServices();
  const platform = usePlatformService();
  const baseServices = useBaseServices();
  const servers = useMcpStore((state) => state.servers);
  const statusSnapshots = useMcpStore((state) => state.statusSnapshots);
  const plugins = usePluginsStore((state) => state.plugins);
  const initializePlugins = usePluginsStore((state) => state.initialize);
  const storeProjectPath = useMcpStore((state) => state.currentProjectPath);
  const storeWorkspaceIdentity = useMcpStore((state) => state.currentWorkspaceIdentity);
  const activeWorkspacePath = useWorkspaceTabsStore((state) => state.activeWorkspacePath);
  const activeWorkspaceIdentity = useWorkspaceTabsStore((state) => state.activeWorkspaceIdentity ?? undefined);
  const effectiveWorkspacePath = workspacePath ?? activeWorkspacePath;
  const effectiveWorkspaceIdentity = workspaceIdentity ?? activeWorkspaceIdentity;
  /** 原 C：活动工作区键（身份优先，回落路径） */
  const activeWorkspaceKey = effectiveWorkspaceIdentity?.trim() || effectiveWorkspacePath || "";
  /** 原 w：store 当前工作区键 */
  const storeWorkspaceKey = storeWorkspaceIdentity?.trim() || storeProjectPath;
  /** 原 T：store 与活动工作区一致时才展示其数据 */
  const storeMatchesActiveWorkspace = !!activeWorkspaceKey && storeWorkspaceKey === activeWorkspaceKey;
  const visibleServers = storeMatchesActiveWorkspace ? servers : [];
  const visibleSnapshots = storeMatchesActiveWorkspace ? statusSnapshots : {};
  const isConfigLoaded = useMcpStore((state) => state.isConfigLoaded);
  const ensureLoadedForWorkspace = useMcpStore((state) => state.ensureLoadedForWorkspace);
  const loadMcpFromUserDirectory = useMcpStore((state) => state.loadMcpFromUserDirectory);
  const toggleServer = useMcpStore((state) => state.toggleServer);
  const addScopedMcpServer = useMcpStore((state) => state.addScopedMcpServer);
  const updateScopedMcpServer = useMcpStore((state) => state.updateScopedMcpServer);
  const deleteScopedMcpServer = useMcpStore((state) => state.deleteScopedMcpServer);
  const updateServerStatus = useMcpStore((state) => state.updateServerStatus);
  const beginServerStatusListRefresh = useMcpStore((state) => state.beginServerStatusListRefresh);
  const markServerStatusListRefreshFailed = useMcpStore((state) => state.markServerStatusListRefreshFailed);
  const mergeServerStatusSnapshots = useMcpStore((state) => state.mergeServerStatusSnapshots);

  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editingServer, setEditingServer] = React.useState<McpServer | null>(null);
  const [importOpen, setImportOpen] = React.useState(false);
  const [remoteSyncOpen, setRemoteSyncOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [editorMode, setEditorMode] = React.useState<"form" | "json">("form");
  const [configReadyWorkspaceKey, setConfigReadyWorkspaceKey] = React.useState("");
  const [oauthFollowup, setOauthFollowup] = React.useState<OAuthFollowup | null>(null);
  const [statusPollingUnsupported, setStatusPollingUnsupported] = React.useState(false);
  /** 原 pe：status-only 轮询不支持后的熔断标记 */
  const statusOnlyUnsupportedRef = React.useRef(false);
  const editorVisible = editorOpen || editingServer !== null;
  /** 原 he：服务器+插件指纹（刷新依赖） */
  const serverStatusListKey = React.useMemo(
    () => [mcpServersFingerprint(visibleServers), pluginsFingerprint(plugins)].filter(Boolean).join("|"),
    [plugins, visibleServers],
  );
  const serialMutexRef = React.useRef<ReturnType<typeof createSerialMutex>>(null);
  serialMutexRef.current ||= createSerialMutex();

  /** 原 _e（194699–194716）：最新上下文快照（供异步回调读取，避免闭包过期） */
  const contextRef = React.useRef({
    activeWorkspaceIdentity: effectiveWorkspaceIdentity,
    activeWorkspaceKey,
    activeWorkspacePath: effectiveWorkspacePath,
    configReadyWorkspaceKey,
    isConfigLoaded,
    serverStatusListKey,
    storeWorkspaceKey,
  });
  contextRef.current = {
    activeWorkspaceIdentity: effectiveWorkspaceIdentity,
    activeWorkspaceKey,
    activeWorkspacePath: effectiveWorkspacePath,
    configReadyWorkspaceKey,
    isConfigLoaded,
    serverStatusListKey,
    storeWorkspaceKey,
  };

  /** 原 ve（194717–194727）：刷新键（身份+路径+指纹多行串） */
  const refreshKey = React.useMemo(
    () =>
      !isConfigLoaded || !effectiveWorkspacePath || !activeWorkspaceKey || configReadyWorkspaceKey !== activeWorkspaceKey || !serverStatusListKey
        ? ""
        : [effectiveWorkspaceIdentity ?? "", effectiveWorkspacePath, serverStatusListKey].join("\n"),
    [effectiveWorkspaceIdentity, activeWorkspaceKey, effectiveWorkspacePath, isConfigLoaded, configReadyWorkspaceKey, serverStatusListKey],
  );
  /** 原 ye/be/xe：OAuth 待处理键 / 状态服务器 / 轮询截止时间 */
  const pendingOAuthKey = React.useMemo(() => computePendingOAuthKey(visibleServers, visibleSnapshots), [visibleServers, visibleSnapshots]);
  const statusServers = React.useMemo(() => pickStatusRefreshServers(visibleServers, visibleSnapshots), [visibleServers, visibleSnapshots]);
  const oauthDeadline = React.useMemo(
    () => (activeWorkspaceKey && pendingOAuthKey ? oauthPollDeadline() : 0),
    [activeWorkspaceKey, pendingOAuthKey],
  );

  /** 原 we（194729–194793）：状态刷新主入口（互斥 + 工作区守卫 + 结果分派） */
  const lastRefreshKeyRef = React.useRef<string | null>(null);
  const lastRefreshKeyStringRef = React.useRef("");
  const refreshStatuses = React.useCallback(
    async (options?: { mode?: "status" | "full"; mcpServers?: McpServer[] }) => {
      const requestedWorkspaceKey = activeWorkspaceKey;
      const context = contextRef.current;
      const getCurrentWorkspaceKey = () => {
        const latest = contextRef.current;
        return latest.activeWorkspaceKey === latest.storeWorkspaceKey &&
          latest.configReadyWorkspaceKey === latest.activeWorkspaceKey
          ? latest.activeWorkspaceKey
          : "";
      };
      const stillActiveWorkspace = () => getCurrentWorkspaceKey() === requestedWorkspaceKey;
      if (
        !requestedWorkspaceKey ||
        context.activeWorkspaceKey !== requestedWorkspaceKey ||
        context.storeWorkspaceKey !== requestedWorkspaceKey ||
        context.configReadyWorkspaceKey !== requestedWorkspaceKey ||
        !context.isConfigLoaded ||
        !context.activeWorkspacePath ||
        !context.serverStatusListKey ||
        (options?.mode === "status" && statusOnlyUnsupportedRef.current)
      ) {
        return;
      }
      const workspacePathForRequest = context.activeWorkspacePath;
      const serversForRequest =
        options?.mcpServers ?? useMcpStore.getState().getEnabledMcpServersForZCode("zcode");
      await serialMutexRef.current?.request(async () => {
        if (!stillActiveWorkspace() || (options?.mode === "status" && statusOnlyUnsupportedRef.current)) return;
        const outcome = await refreshMcpServerStatuses({
          beginServerStatusListRefresh,
          getCurrentWorkspaceKey,
          markServerStatusListRefreshFailed,
          mergeServerStatusSnapshots,
          mcpServers: serversForRequest,
          mode: options?.mode,
          requestedWorkspaceKey,
          workspaceIdentity: context.activeWorkspaceIdentity,
          workspacePath: workspacePathForRequest,
          mcpSyncService: services.mcpSyncService,
        }).catch((error) => (
          logger.warn("[mcp] list server statuses failed", {
            error: error instanceof Error ? error.message : String(error),
            workspacePath: workspacePathForRequest,
          }),
          "failed" as const
        ));
        if (outcome === "stale-workspace" || !stillActiveWorkspace()) return;
        if (outcome === "status-mode-unsupported") {
          statusOnlyUnsupportedRef.current = true;
          lastRefreshKeyRef.current = null;
          setOauthFollowup(null);
          setStatusPollingUnsupported(true);
          logger.warn("[mcp] status-only refresh unsupported; stop OAuth status polling", {
            workspacePath: workspacePathForRequest,
          });
          toast(intl.formatMessage({ id: "settings.mcp.statusOnlyUnsupported" }), { durationMs: 8000 });
        } else if (outcome === "refreshed" && options?.mode !== "status") {
          statusOnlyUnsupportedRef.current = false;
          setStatusPollingUnsupported(false);
        }
      });
    },
    [activeWorkspaceKey, beginServerStatusListRefresh, intl, markServerStatusListRefreshFailed, mergeServerStatusSnapshots, services.mcpSyncService],
  );

  /* --- 效果链（194795–194916） --- */

  /* 工作区切换：重置 OAuth 轮询状态（194795–194799） */
  React.useEffect(() => {
    lastRefreshKeyRef.current = null;
    setOauthFollowup(null);
    statusOnlyUnsupportedRef.current = false;
    setStatusPollingUnsupported(false);
  }, [activeWorkspaceKey, services.mcpSyncService]);

  /* 配置加载：进入工作区先拉取 MCP 配置，成功后登记 configReady（194799–194818） */
  React.useEffect(() => {
    let cancelled = false;
    setConfigReadyWorkspaceKey("");
    if (!effectiveWorkspacePath || !activeWorkspaceKey) return;
    ensureLoadedForWorkspace(effectiveWorkspacePath, services.mcpSyncService, effectiveWorkspaceIdentity)
      .then((loaded) => {
        if (cancelled || !loaded) return;
        const latest = useMcpStore.getState();
        if ((latest.currentWorkspaceIdentity?.trim() || latest.currentProjectPath) === activeWorkspaceKey) {
          setConfigReadyWorkspaceKey(activeWorkspaceKey);
        }
      })
      .catch((error) => {
        logger.warn("[mcp] load workspace config before status refresh failed", {
          error: error instanceof Error ? error.message : String(error),
          workspacePath: effectiveWorkspacePath,
        });
      });
    return () => {
      cancelled = true;
    };
  }, [effectiveWorkspaceIdentity, activeWorkspaceKey, effectiveWorkspacePath, ensureLoadedForWorkspace, services.mcpSyncService]);

  /* 插件初始化（194818–194821）：插件指纹参与状态列表键 */
  React.useEffect(() => {
    if (effectiveWorkspacePath) {
      void initializePlugins({
        workspacePath: effectiveWorkspacePath,
        workspaceIdentity: effectiveWorkspaceIdentity,
        pluginService: services.pluginManagementService,
      });
    }
  }, [effectiveWorkspaceIdentity, effectiveWorkspacePath, initializePlugins, services.pluginManagementService]);

  /* 刷新键变化 → 触发刷新（194821–194826） */
  React.useEffect(() => {
    const change = resolveRefreshKeyChange(lastRefreshKeyStringRef.current, refreshKey);
    lastRefreshKeyStringRef.current = change.lastRefreshKey;
    if (change.shouldRefresh) void refreshStatuses();
  }, [refreshKey, refreshStatuses]);

  /* OAuth 待处理键归并（194826–194838） */
  React.useEffect(() => {
    if (!activeWorkspaceKey || configReadyWorkspaceKey !== activeWorkspaceKey) {
      lastRefreshKeyRef.current = null;
      setOauthFollowup(null);
      return;
    }
    const resolved = resolveOAuthFollowup({
      activeWorkspaceKey,
      existingFollowup: oauthFollowup,
      mcpServers: statusServers,
      pendingKey: pendingOAuthKey,
      previous: lastRefreshKeyRef.current,
    });
    lastRefreshKeyRef.current = resolved.pending;
    setOauthFollowup(resolved.followup);
  }, [activeWorkspaceKey, configReadyWorkspaceKey, oauthFollowup, pendingOAuthKey, statusServers]);

  /* OAuth 授权中：定时轮询状态直到截止（194838–194862） */
  React.useEffect(() => {
    if (!pendingOAuthKey || !activeWorkspaceKey || configReadyWorkspaceKey !== activeWorkspaceKey || statusPollingUnsupported) return;
    let cancelled = false;
    let attempts = 0;
    let timer: number | undefined;
    const deadline = oauthDeadline;
    const schedule = () => {
      if (cancelled || isPastDeadline(deadline)) return;
      timer = window.setTimeout(() => {
        if (cancelled || isPastDeadline(deadline)) return;
        attempts += 1;
        logger.debug("[mcp] refresh status while OAuth authorization is pending", {
          attempt: attempts,
          deadline,
          pendingKey: pendingOAuthKey,
          workspacePath: effectiveWorkspacePath,
        });
        void refreshStatuses({ mcpServers: serializeMcpServers(statusServers) as McpServer[] }).finally(schedule);
      }, MCP_OAUTH_POLL_INTERVAL_MS);
    };
    schedule();
    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [effectiveWorkspacePath, activeWorkspaceKey, configReadyWorkspaceKey, statusPollingUnsupported, oauthDeadline, pendingOAuthKey, statusServers, refreshStatuses]);

  /* OAuth 授权状态变化后的跟进刷新（最多 N 次，194863–194894） */
  React.useEffect(() => {
    if (!oauthFollowup || oauthFollowup.workspaceKey !== activeWorkspaceKey || configReadyWorkspaceKey !== activeWorkspaceKey || statusPollingUnsupported) return;
    let cancelled = false;
    let attempts = 0;
    let timer: number | undefined;
    const followUp = () => {
      if (cancelled) return;
      if (attempts >= MCP_OAUTH_FOLLOWUP_MAX_ATTEMPTS) {
        setOauthFollowup((current) => (current?.refreshKey === oauthFollowup.refreshKey ? null : current));
        return;
      }
      timer = window.setTimeout(() => {
        attempts += 1;
        logger.debug("[mcp] refresh status after OAuth authorization state changed", {
          attempt: attempts,
          followupKey: oauthFollowup.refreshKey,
          workspacePath: effectiveWorkspacePath,
        });
        void refreshStatuses({ mcpServers: serializeMcpServers(oauthFollowup.mcpServers) as McpServer[] }).finally(followUp);
      }, MCP_OAUTH_POLL_INTERVAL_MS);
    };
    void refreshStatuses({ mcpServers: serializeMcpServers(oauthFollowup.mcpServers) as McpServer[] }).finally(followUp);
    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [effectiveWorkspacePath, activeWorkspaceKey, configReadyWorkspaceKey, statusPollingUnsupported, oauthFollowup, refreshStatuses]);

  /* 从 OAuth 浏览器返回（窗口焦点/页面可见）→ 立即刷新（194895–194916） */
  React.useEffect(() => {
    if (!pendingOAuthKey || !activeWorkspaceKey || configReadyWorkspaceKey !== activeWorkspaceKey || statusPollingUnsupported) return;
    const refreshNow = () => {
      logger.debug("[mcp] refresh status after returning from OAuth browser", {
        pendingKey: pendingOAuthKey,
        workspacePath: effectiveWorkspacePath,
      });
      void refreshStatuses({ mcpServers: serializeMcpServers(statusServers) as McpServer[] });
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") refreshNow();
    };
    window.addEventListener("focus", refreshNow);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("focus", refreshNow);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [effectiveWorkspacePath, activeWorkspaceKey, configReadyWorkspaceKey, statusPollingUnsupported, pendingOAuthKey, statusServers, refreshStatuses]);

  /* --- 派生与动作（194917–194968） --- */

  /** 原 Te：搜索过滤后的本地服务器 */
  const filteredServers = React.useMemo(() => filterMcpServersByQuery(visibleServers, searchQuery), [searchQuery, visibleServers]);
  /** 原 Ee：远程目标（仅当可同步且有工作区时） */
  const effectiveRemoteTarget =
    canOpenRemoteSessionSource({
      remoteSessionId,
      remoteTarget,
      clientMode: isWebRemoteControl ? "web-remote-replayable" : "desktop-continuous",
      hasLocalSourceService: !!baseServices.mcpSyncService,
    }) && effectiveWorkspacePath
      ? remoteTarget ?? null
      : null;
  const isRemote = !!effectiveRemoteTarget;
  /** 原 Oe：插件托管 MCP 条目 */
  const pluginMcpItems = React.useMemo(
    () => (isRemote ? (isPluginMcpListVisible(isRemote) ? buildPluginMcpItems(plugins, searchQuery, visibleSnapshots) : []) : []),
    [isRemote, plugins, searchQuery, visibleSnapshots],
  );
  const totalResultCount = filteredServers.length + pluginMcpItems.length;
  const remoteContextLabel = effectiveRemoteTarget
    ? remoteTargetDisplayLabel(effectiveRemoteTarget, effectiveWorkspacePath ?? "")
    : "";

  /** 原 je（194932–194943）：开关服务器（启用时置 connecting 并刷新状态） */
  async function handleToggleServer(serverId: string, enabled: boolean) {
    await toggleServer(serverId, enabled);
    if (!enabled) {
      updateServerStatus(serverId, "unknown", undefined, { invalidateStatusListRequests: false });
      return;
    }
    if (!effectiveWorkspacePath) {
      updateServerStatus(serverId, "unknown", undefined, { invalidateStatusListRequests: false });
      return;
    }
    updateServerStatus(serverId, "connecting", undefined, { invalidateStatusListRequests: false });
    void refreshStatuses();
  }

  /** 原 Me（194944–194950）：保存（新建→add；编辑→update；可附带禁用） */
  async function handleSaveServer(server: McpServer, options?: { enabled?: boolean; name?: string }) {
    const payload = { ...mcpServerToPayload(server), ...(options?.enabled === false ? { enable: false } : {}) };
    const workspaceIdentityForScope = (server.storageLevel === "workspace" && storeWorkspaceIdentity) || undefined;
    if (options?.name) {
      await updateScopedMcpServer(MCP_SOURCE_ZCODE, options.name, payload, workspaceIdentityForScope ?? null);
    } else {
      await addScopedMcpServer(MCP_SOURCE_ZCODE, server.name, payload, workspaceIdentityForScope ?? null);
    }
    setEditorOpen(false);
    setEditingServer(null);
  }

  /** 原 Ne（194951–194957）：删除（确认对话框） */
  async function handleDeleteServer(server: McpServer) {
    const confirmed = await confirmDialog({
      title: intl.formatMessage({ id: "settings.mcp.deleteConfirmTitle" }, { name: server.name }),
      description: intl.formatMessage({ id: "settings.mcp.deleteConfirmDescription" }),
      confirmLabel: intl.formatMessage({ id: "settings.mcp.deleteConfirmAction" }),
      cancelLabel: intl.formatMessage({ id: "common.cancel" }),
    });
    if (confirmed) await deleteScopedMcpServer(server.source, server.name, server.projectPath);
  }

  /** 原 Pe（194958–194961）：进入编辑 */
  function handleEditServer(server: McpServer) {
    setEditingServer(server);
    setEditorOpen(false);
    setEditorMode("form");
  }

  /** 原 Fe/Ie（194962–194968）：打开 OAuth 授权页 */
  function handleOpenAuthorization(server: McpServer) {
    const url = server.authorization?.authorizationUrl;
    if (url) void platform.openExternal(url);
  }

  const pluginManagedHint = intl.formatMessage({ id: "settings.pluginManaged.modifyInPlugin" });

  /* --- 渲染：编辑态 / 列表态（194969–195168） --- */

  if (editorVisible) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <BackLinkButton
            onClick={() => {
              setEditorOpen(false);
              setEditingServer(null);
              setEditorMode("form");
            }}
          >
            {intl.formatMessage({ id: "settings.mcp.form.backToList" })}
          </BackLinkButton>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <h3 className="text-ui-lg font-semibold text-foreground">
                {editingServer
                  ? intl.formatMessage({ id: "settings.mcp.form.editTitle" })
                  : intl.formatMessage({ id: "settings.mcp.form.createTitle" })}
              </h3>
              <p className="text-ui-base text-foreground-subtle">
                {editingServer
                  ? intl.formatMessage({ id: "settings.mcp.form.editDescription" })
                  : intl.formatMessage({ id: "settings.mcp.form.createDescription" })}
              </p>
            </div>
            <McpEditorModeTabs mode={editorMode} onModeChange={setEditorMode} />
          </div>
          <McpServerEditor
            initial={editingServer ?? undefined}
            editingId={editingServer?.id}
            editorMode={editorMode}
            source={editingServer?.source ?? MCP_SOURCE_ZCODE}
            workspaceAvailable={!!storeWorkspaceIdentity}
            onEditorModeChange={setEditorMode}
            onSave={(server, options) => void handleSaveServer(server, options)}
            onCancel={() => {
              setEditorOpen(false);
              setEditingServer(null);
              setEditorMode("form");
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 工具条：说明 + 新建/导入/远程同步（195019–195074） */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="min-w-0 flex-1 text-ui-base leading-6 text-foreground-subtle">
          {intl.formatMessage({ id: "settings.mcp.description" })}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Tooltip title={intl.formatMessage({ id: "settings.mcp.create.open" })}>
            <Button
              type="button"
              variant="ghost"
              size="icon-md"
              aria-label={intl.formatMessage({ id: "settings.mcp.create.open" })}
              onClick={() => {
                setEditingServer(null);
                setEditorMode("form");
                setEditorOpen(true);
              }}
            >
              <IconPlus className="size-3.5" aria-hidden="true" />
            </Button>
          </Tooltip>
          <Tooltip title={intl.formatMessage({ id: "settings.mcp.import.open" })}>
            <Button
              type="button"
              variant="ghost"
              size="icon-md"
              aria-label={intl.formatMessage({ id: "settings.mcp.import.open" })}
              onClick={() => setImportOpen(true)}
            >
              <IconDownload className="size-3.5" aria-hidden="true" />
            </Button>
          </Tooltip>
          {effectiveRemoteTarget ? (
            <Tooltip title={intl.formatMessage({ id: "settings.mcp.remoteSync.open" })}>
              <Button
                type="button"
                variant="ghost"
                size="icon-md"
                aria-label={intl.formatMessage({ id: "settings.mcp.remoteSync.open" })}
                onClick={() => setRemoteSyncOpen(true)}
              >
                <IconCloudUpload className="size-3.5" aria-hidden="true" />
              </Button>
            </Tooltip>
          ) : null}
        </div>
      </div>

      {/* 搜索框（195075–195084） */}
      <Input
        type="text"
        size="lg"
        className="h-9 rounded-xl"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        placeholder={intl.formatMessage({ id: "settings.mcp.searchPlaceholder" })}
      />

      {/* 远程上下文提示（195085–195090） */}
      {isRemote ? (
        <div className="rounded-lg border border-border bg-card px-3 py-2 text-ui-base text-foreground-subtle">
          {intl.formatMessage({ id: "settings.mcp.remoteContext" }, { target: remoteContextLabel })}
        </div>
      ) : null}

      {/* 列表（195091–195141）：空态 / 本地分组 + 插件分组 */}
      {totalResultCount === 0 ? (
        <McpServerList
          servers={[]}
          onCreate={() => setEditorOpen(true)}
          onEdit={handleEditServer}
          onDelete={(server) => void handleDeleteServer(server)}
          onToggle={(serverId, enabled) => void handleToggleServer(serverId, enabled)}
          onOpenAuthorization={handleOpenAuthorization}
          emptyTitle={intl.formatMessage({ id: "settings.mcp.emptyTitle" })}
          emptyDescription={intl.formatMessage({ id: "settings.mcp.emptyDescription" })}
        />
      ) : (
        <div className="space-y-4">
          {filteredServers.length > 0 ? (
            <section className="space-y-2">
              <ResourceGroupHeader
                count={filteredServers.length}
                title={intl.formatMessage({ id: "settings.mcp.group.local" })}
              />
              <McpServerList
                servers={filteredServers}
                onCreate={() => setEditorOpen(true)}
                onEdit={handleEditServer}
                onDelete={(server) => void handleDeleteServer(server)}
                onToggle={(serverId, enabled) => void handleToggleServer(serverId, enabled)}
                onOpenAuthorization={handleOpenAuthorization}
                emptyTitle={intl.formatMessage({ id: "settings.mcp.emptyTitle" })}
                emptyDescription={intl.formatMessage({ id: "settings.mcp.emptyDescription" })}
              />
            </section>
          ) : null}
          {pluginMcpItems.length > 0 ? (
            <section className="space-y-2">
              <ResourceGroupHeader
                count={pluginMcpItems.length}
                hint={pluginManagedHint}
                title={intl.formatMessage({ id: "settings.mcp.group.plugin" })}
              />
              <PluginMcpServerList items={pluginMcpItems} onOpenAuthorization={handleOpenAuthorization} />
            </section>
          ) : null}
        </div>
      )}

      {/* 导入对话框（外部 agent 配置，195142–195150） */}
      <McpImportDialog
        open={importOpen}
        workspacePath={storeWorkspaceIdentity}
        workspaceIdentity={effectiveWorkspaceIdentity}
        onOpenChange={setImportOpen}
        onImported={async () => {
          await loadMcpFromUserDirectory(services.mcpSyncService, effectiveWorkspaceIdentity);
        }}
      />

      {/* 远程同步对话框（195151–195166；r4 已随 TopBar 族抽取） */}
      <RemoteSyncDialogs
        canSyncSkills={false}
        canSyncMcp={!!(effectiveRemoteTarget && effectiveWorkspacePath)}
        skillOpen={false}
        mcpOpen={remoteSyncOpen}
        onSkillOpenChange={() => {}}
        onMcpOpenChange={setRemoteSyncOpen}
        localMcpSyncService={baseServices.mcpSyncService}
        remoteMcpSyncService={services.mcpSyncService}
        remoteTarget={effectiveRemoteTarget}
        skillWorkspacePath=""
        mcpWorkspacePath={effectiveWorkspacePath ?? ""}
        mcpLocalWorkspacePath={localWorkspacePath}
        onSkillsSynced={() => {}}
        onMcpSynced={async () => {
          const reloaded = await loadMcpFromUserDirectory(services.mcpSyncService, effectiveWorkspaceIdentity);
          if (reloaded) await refreshStatuses();
        }}
      />
    </div>
  );
}

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
                            data-testid={testidOf(SETTINGS_SECTION_NAV_TESTID, id)}
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
                onLocaleChange={handleLocaleChange}
                onThemeChange={handleThemeChange}
                onSettingsButtonClick={onBack}
                onUsageClick={openUsageSection}
                onUpgradeClick={handleUpgradeClick}
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
                        remoteTarget={activeWorkspaceTab?.remoteTarget}
                        localWorkspacePath={activeWorkspaceTab?.localWorkspacePath}
                        isWebRemoteControl={isWebRemoteControl}
                      />
                    ) : activeSectionId === "plugins" ? (
                      <PluginsSettingsSection
                        workspacePath={activeWorkspacePath}
                        workspaceIdentity={activeWorkspaceIdentity}
                        remoteSessionId={activeWorkspaceTab?.remoteSessionId}
                        remoteTarget={activeWorkspaceTab?.remoteTarget}
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
                        remoteTarget={activeWorkspaceTab?.remoteTarget}
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






