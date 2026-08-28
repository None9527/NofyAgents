/* eslint-disable */
/**
 * ============================================================================
 * Modals.tsx — ZCode 3.7.6 模态 / 对话框族（解混淆重建 · D8 Stage B3）
 * ============================================================================
 *
 * 来源文件（融合 chunk，213,695 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js
 * 对照文件（同一 chunk 的 pretty-print 版，双行号以它为准）：
 *   /home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx
 *
 * 子族分节：
 *   §1 更新对话框子族        COt 呈现层（POt 控制器/视图模型助手已在 TopBar.tsx）
 *   §2 远程同步对话框子族    r4 分派 + 技能/ MCP/ 插件 三同步对话框 + preflight 助手
 *   §3 目录浏览器子族        MEt（scope `directory-browser`，p4 包裹挂载见 g8t）
 *   §4 Onboarding 对话框子族 E3t + 导入向导六步（settings-sync 迁移）
 *   §5 确认 / 警告对话框子族 H2/U2/q4t + N9/G4t/$3t + P9 模态宿主；
 *                           任务删除/归档确认的触发入口登记（UI 侧在 TopBar/Sidebar 族）
 *   §6 WorkspaceActionError  状态接线登记（本构建无呈现层，见报告）
 *   —— 配额/订阅错误上报 wCt 已在 Conversation 族登记（ConversationOverlays.tsx），跳过
 *   —— j6 TaskRenameDialog 已在 TopBar.tsx，勿重复
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号格式：融合chunk js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 *  §1 更新对话框：
 *   xOt → UpdateDialogCheckbox   Radix Checkbox 封装（自动更新开关用）(128776 / 108512)
 *   SOt → UPDATE_DIALOG_LOGO_URL icon_512@2x 资源 URL (128791 / 108522)
 *   COt → UpdateStatusDialog     更新对话框呈现层（三相位 + edgeToEdge 全屏变体）(128795 / 108523)
 *   wOt → splitUpdateDialogTitle 标题按 __ZCODE_UPDATE_VERSION__ 占位符切前/后缀 (129029 / 108590)
 *
 *  §2 远程同步：
 *   ZDt → REMOTE_SYNC_PREFLIGHT_TIMEOUT_MS = 15000 (127114 / 107547)
 *   QDt → RemoteSyncPreflightTimeoutError (127115 / 107548)
 *   Q2  → isRemoteSyncPreflightTimeoutError (127122 / 107553)
 *   $2  → canOpenRemoteSessionSourceCheck (127125 / 107556)
 *   e4  → canSubmitRemoteSync (127133 / 107559)
 *   t4  → withRemoteSyncPreflightTimeout (127136 / 107562)
 *   $Dt → RemoteSyncDropdownButton 「同步到远端」下拉按钮 (127201 / 107599)
 *   r4  → RemoteSyncDialogs        三同步对话框分派器 (127248 / 107623)
 *   zEt → SKILL_SYNC_ACTION_SELECTOR 技能卡内可点击元素白名单 (124995 / 106207)
 *   BEt → shouldHandleSkillCardClick (124996 / 106208)
 *   VEt → SkillSyncRowList         技能选择行列表 (125001 / 106216)
 *   HEt → SkillSyncResultView      技能同步结果 (125107 / 106254)
 *   UEt → SkillSyncTitle           标题 + 警告 tooltip (125151 / 106266)
 *   WEt → mergeSkillRows (125180 / 106280)  GEt → defaultSkillSelection (125184 / 106287)
 *   KEt → filterSkillRows (125187 / 106290) q2  → remoteSyncTargetLabel (125190 / 106293)
 *   qEt → resolveSelectAllState (125199 / 106297) JEt → SkillSyncShowExisting (125202 / 106307)
 *   YEt → SkillSyncHeader (125219 / 106318) XEt → SkillSyncSelectAll (125242 / 106333)
 *   ZEt → SkillSyncDialog          技能同步对话框 (125271 / 106355)
 *   QEt → mergeMcpRows (125471 / 106467)  $Et → defaultMcpSelection (125475 / 106474)
 *   eDt → filterMcpRows (125478 / 106477) tDt → buildMcpImportPayload (125481 / 106480)
 *   nDt → resolveMcpServerKind (125490 / 106489) rDt → McpSyncTitle (125499 / 106492)
 *   iDt → McpSyncShowExisting (125528 / 106506) aDt → McpSyncHeader (125545 / 106517)
 *   oDt → McpSyncSelectAll (125568 / 106535) sDt → McpSyncRowList (125599 / 106556)
 *   cDt → McpSyncResultView (125678 / 106577) lDt → McpSyncDialog (125728 / 106590)
 *   J2  → RemotePluginSyncStoppedError (125934 / 106719) uDt → pluginSyncLogIdCounter (125941 / 106724)
 *   dDt → makePluginSyncLogId (125942 / 106725) fDt → toInlinePluginCandidate (125947 / 106730)
 *   pDt → pluginStatusKey (125962 / 106748)   mDt → mergeInlinePluginRows (125965 / 106752)
 *   hDt → mergePluginRows (125980 / 106768)   gDt → defaultPluginSelection (125995 / 106787)
 *   _Dt → filterPluginRows (125998 / 106790)  vDt → canClosePluginSyncDialog (126001 / 106793)
 *   yDt → buildMarketplaceCandidates (126004 / 106796) bDt → mapMarketplaceStatuses (126030 / 106832)
 *   xDt → remoteComponentKinds (126044 / 106850) SDt → extractPluginOptions (126047 / 106853)
 *   CDt → attachPluginOptions (126052 / 106864) wDt → hydratePluginOptions (126056 / 106871)
 *   TDt → summarizePluginOptions (126060 / 106875) EDt → marketplaceSourceInput (126070 / 106888)
 *   DDt → marketplaceSourcePayload (126078 / 106896) ODt → loadPluginSyncCandidates (126086 / 106909)
 *   kDt → isPluginSyncStoppedError (126111 / 106948) ADt → stoppedPluginResult (126114 / 106951)
 *   Y2  → emitPluginSyncProgress (126126 / 106960) X2 → assertPluginSyncNotStopped (126135 / 106971)
 *   Z2  → runCancellableRemoteStep (126138 / 106974) jDt → isFileLikeOptionSchema (126167 / 106992)
 *   MDt → isPortableOptionValue (126170 / 106995) NDt → pickPortableOptions (126181 / 107000)
 *   PDt → sameConfiguredOptions (126188 / 107009) FDt → syncPluginOptions (126192 / 107013)
 *   IDt → runPluginSyncPipeline (126233 / 107053) LDt → runMarketplacePluginSync (126275 / 107090)
 *   RDt → collectMarketplacePluginNames (126345 / 107150) zDt → prepareMarketplaceSource (126355 / 107160)
 *   BDt → formatInstallDiagnostics (126393 / 107194) VDt → PluginSyncTitle (126397 / 107198)
 *   HDt → PluginSyncShowExisting (126426 / 107212) UDt → PluginSyncHeader (126443 / 107223)
 *   WDt → PluginSyncSelectAll (126466 / 107238) GDt → PluginSyncRowList (126497 / 107259)
 *   KDt → PluginSyncStatusBadge (126608 / 107287) qDt → PluginSyncLogTooltip (126631 / 107302)
 *   JDt → PluginSyncProgressList (126667 / 107329) YDt → PluginSyncResultView (126779 / 107362)
 *   XDt → PluginSyncDialog     插件同步对话框 (126826 / 107373)
 *
 *  §3 目录浏览器：
 *   OEt → buildReaddirParams (123929 / 105703)  kEt → filterDirectories (123932 / 105711)
 *   AEt → resolveFolderIconKind (123935 / 105714) jEt → createRequestToken (123938 / 105717)
 *   MEt → DirectoryBrowserDialog 目录浏览对话框（路径输入/隐藏目录/逐级进入）(123942 / 105724)
 *
 *  §4 Onboarding：
 *   $4t → ONBOARDING_TASK_STAGGER_MS = 320 (206927 / 164536)
 *   F9  → initialOnboardingState (206928 / 164537) I9 → selectionKey (206941 / 164550)
 *   e3t → defaultProviderCategories (206946 / 164553) t3t → normalizeDiscovery (206947 / 164556)
 *   n3t → defaultSelectedKeys (206964 / 164573) r3t → discoveryToTasks (206971 / 164576)
 *   i3t → parseSelectionKeys (206985 / 164586) a3t → additionalSelectionsToTasks (206991 / 164595)
 *   L9  → errorMessageText (207005 / 164604) o3t → applyImportTaskResults (207008 / 164607)
 *   s3t → useOnboardingDialogController (207019 / 164624)
 *   c3t → ONBOARDING_WIZARD_STEPS (207290 / 164907) l3t → onboardingStepTitleKey (207296 / 164932)
 *   u3t → OnboardingStepRail (207312 / 164948) d3t → OnboardingStepHeader (207372 / 164963)
 *   f3t → OnboardingWizardFooter (207386 / 164966) p3t → isSettingsImportStep (207511 / 164993)
 *   m3t → ProjectSelectorHero (207490 / 164996) h3t → OnboardingWelcomeView (207517 / 165007)
 *   g3t → initialFinishExecution (207605 / 165025) _3t → OnboardingSessionStep (207610 / 165044)
 *   R9  → ImportSelectionStep (207794 / 165129) v3t → MigrationProgressView (207797 / 165136)
 *   y3t → MigrationCompleteView (207846 / 165153) b3t → AgentsFileMigrationStep (207960 / 165187)
 *   x3t → shouldAutoScanSessions (208073 / 165214) S3t → buildSessionGroups (208086 / 165217)
 *   C3t → useFinishExecution (208092 / 165227) w3t → errorMessageText2 (208194 / 165334)
 *   T3t → useAgentsFileMigration (208197 / 165337)
 *   z9  → ONBOARDING_STEP_ORDER (208251 / 165387) E3t → OnboardingDialog (208252 / 165388)
 *
 *  §5 确认 / 警告对话框 + 宿主：
 *   H2  → ConfirmDialogStore (123480 / 105205)  U2 → useConfirmDialog (123493 / 105222)
 *   N9  → AlertDialogStore (206514 / 164300)   G4t → AlertDialog (206527 / 164317)
 *   K4t → AUTOMATION_CONFIRM_DIALOG_CLASS (206571 / 164352)
 *   q4t → ConfirmDialog (206572 / 164353)      P9 → AppDialogHost (206704 / 164396)
 *   $3t → useAlertDialog (209650 / 166685)
 *
 *  复用原语（本 chunk 内它族 / 跨 chunk，见 §0 声明）：
 *   zb/Hb/Ub/Gb/Kb/Wb/Vb → Dialog/Content/Header/Title/Description/Footer/Close (31943+ / 29335+)
 *   yq → Progress (75986 / 67310)；uJ → Badge (80303 / 70704)；s4t → ZCodeLogoSvg (205679 / 163712)
 *   X=Button / P=Input / M=spinner(loader-circle) / g=IconX / wa=IconChevronRight（跨 chunk）
 *   Ia=Tooltip（usageStatsUiParts）；dN/fN/pN=HoverCard 三件（本 chunk jsx 49005）
 *   Zxe/$xe=Checkbox 原语；iO/oO/sO/cO=Select 四件（Radix 封装主块 28021-32245）
 *   图标（Sa=createLucideIcon，js 行）：M_ check 26801 | N_ chevron-down 26802 | C_ arrow-right 26649
 *   H_ cloud-upload 26913 | $_ folder 27133 | j_ calendar-days 26783 | F_ circle-alert 26812
 *   I_ circle-check 26821 | R_ circle-stop 26864 | yye circle-x 26868 | A_ cable 26750
 *   jv puzzle 27619 | Nv refresh-cw 27677 | Kv trash-2 27882 | Pye folder-symlink 27123
 *   Xve archive-x 26609 | Z_ file-text 27060 | N triangle-alert（跨 chunk 原语块）
 * ============================================================================
 */

import * as React from "react";

declare global {
  interface ImportMeta {
    url: string;
  }
}

/* ============================================================================
 * 0. 外部依赖的类型声明（真实实现位于上面清单所列 chunk / 它族；此处为重建接口）
 * ==========================================================================*/

/** 类名合并（原 Z，utils-CEEH0K_K.js） */
declare function cn(...inputs: Array<string | false | null | undefined>): string;

/** react-intl 风格 intl 对象（原 G()，IntlProvider-C321H7m8.js） */
interface IntlShape {
  formatMessage(descriptor: { id: string }, values?: Record<string, unknown>): string;
}
declare function useIntlContext(): { intl: IntlShape; locale: string };

/** 日志器（原 J，logger-PFDwl5Yq.js） */
declare const logger: {
  debug(msg: string, meta?: unknown): void;
  info(msg: string, meta?: unknown): void;
  warn(msg: string, meta?: unknown): void;
  error(msg: string, ...meta: unknown[]): void;
};

interface ButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-xs";
}
/** 原 X（button-laUijeDG.js） */
declare const Button: React.FC<ButtonProps>;
/** 原 P（imeComposition chunk 的 y 导出） */
declare const Input: React.ForwardRefExoticComponent<
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> & {
    size?: "default" | "sm" | "lg";
    ref?: React.Ref<HTMLInputElement>;
  }
>;
/** spinner：loader-circle（原 M，imeComposition chunk 的 w 导出） */
declare const IconLoaderCircle: React.FC<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
/** 关闭图标（原 g，button chunk） */
declare const IconX: React.FC<{ className?: string; strokeWidth?: number }>;
/** chevron-right（原 wa，button chunk） */
declare const IconChevronRight: React.FC<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;

interface IconProps { className?: string; "aria-hidden"?: boolean | "true" | "false" }
declare function createLucideIcon(name: string, paths: unknown[]): React.FC<IconProps>;
const IconCheck = createLucideIcon("check", []);            // 原 M_
const IconChevronDown = createLucideIcon("chevron-down", []); // 原 N_
const IconArrowRight = createLucideIcon("arrow-right", []);   // 原 C_
const IconCloudUpload = createLucideIcon("cloud-upload", []); // 原 H_
const IconFolder = createLucideIcon("folder", []);            // 原 $_
const IconCalendarDays = createLucideIcon("calendar-days", []); // 原 j_
const IconCircleAlert = createLucideIcon("circle-alert", []);   // 原 F_
const IconCircleCheck = createLucideIcon("circle-check", []);   // 原 I_
const IconCircleStop = createLucideIcon("circle-stop", []);     // 原 R_
const IconCircleX = createLucideIcon("circle-x", []);           // 原 yye
const IconCable = createLucideIcon("cable", []);                // 原 A_
const IconPuzzle = createLucideIcon("puzzle", []);              // 原 jv
const IconRefreshCw = createLucideIcon("refresh-cw", []);       // 原 Nv
const IconFolderSymlink = createLucideIcon("folder-symlink", []); // 原 Pye
const IconFileText = createLucideIcon("file-text", []);         // 原 Z_
const IconTriangleAlert = createLucideIcon("triangle-alert", []); // 原 N

/** Tooltip（原 Ia，usageStatsUiParts-CiR7YEhh.js 的 u 导出） */
declare const Tooltip: React.FC<{
  children: React.ReactNode;
  title?: string;
  description?: string;
  side?: string;
  align?: string;
  open?: boolean;
}>;
/** HoverCard 三件（原 dN/fN/pN，本 chunk jsx 49005） */
declare const HoverCard: React.FC<{ children: React.ReactNode; openDelay?: number; closeDelay?: number }>;
declare const HoverCardTrigger: React.FC<{ asChild?: boolean; children: React.ReactNode }>;
declare const HoverCardContent: React.FC<React.ComponentPropsWithoutRef<"div"> & { side?: string; align?: string; sideOffset?: number }>;

/** Radix Dialog 封装族（原 zb/Hb/Ub/Gb/Kb/Wb/Vb，本 chunk 31943+ / jsx 29335+） */
declare const Dialog: React.FC<{ open: boolean; onOpenChange: (open: boolean) => void; children: React.ReactNode }>;
declare const DialogContent: React.FC<
  React.ComponentPropsWithoutRef<"div"> & {
    showCloseButton?: boolean;
    showOverlay?: boolean;
    overlayClassName?: string;
  }
>;
declare const DialogHeader: React.FC<React.ComponentPropsWithoutRef<"div">>;
declare const DialogTitle: React.FC<React.ComponentPropsWithoutRef<"div"> & { asChild?: boolean }>;
declare const DialogDescription: React.FC<React.ComponentPropsWithoutRef<"div">>;
declare const DialogFooter: React.FC<React.ComponentPropsWithoutRef<"div">>;
declare const DialogClose: React.FC<{ asChild?: boolean; children: React.ReactNode }>;

/** Radix Progress 原语（原 XTe/ZTe，Radix 封装主块） */
declare const ProgressRoot: React.FC<React.ComponentPropsWithoutRef<"div"> & { "data-slot"?: string }>;
declare const ProgressIndicator: React.FC<React.ComponentPropsWithoutRef<"div"> & { "data-slot"?: string }>;

/** Radix Checkbox 原语（原 Zxe/$xe，Radix 封装主块） */
declare const CheckboxRoot: React.FC<
  Omit<React.ComponentPropsWithoutRef<"button">, "onChange"> & {
    "data-slot"?: string;
    checked?: boolean;
    disabled?: boolean;
    onCheckedChange?: (checked: boolean | "indeterminate") => void;
  }
>;
declare const CheckboxIndicator: React.FC<React.ComponentPropsWithoutRef<"span"> & { "data-slot"?: string }>;

/** Radix Select 四件（原 iO/oO/sO/cO，Radix 封装主块） */
declare const Select: React.FC<{ value?: string; onValueChange?: (v: string) => void; children: React.ReactNode }>;
declare const SelectTrigger: React.FC<React.ComponentPropsWithoutRef<"button"> & { size?: "default" | "lg" }>;
declare const SelectValue: React.FC<Record<string, never>>;
declare const SelectContent: React.FC<React.ComponentPropsWithoutRef<"div">>;
declare const SelectItem: React.FC<React.ComponentPropsWithoutRef<"div"> & { value: string }>;

/** Badge（原 uJ，本 chunk 80303 / jsx 70704） */
declare const Badge: React.FC<React.ComponentPropsWithoutRef<"span"> & { variant?: "default" | "outline"; asChild?: boolean }>;

/** asChild 槽位助手（原 Gre，dist-vnZIbudW.js） */
declare const Slot: React.FC<Record<string, unknown>>;

/** 基础服务 context（原 fs()，本 chunk 2638） */
interface BaseServices {
  settingsSyncService: SettingsSyncService;
  modelProviderService: { getAll(): Promise<unknown> };
  fileService: {
    readdir(params: { path: string; includeHidden?: boolean }): Promise<DirectoryEntry[]>;
  };
  systemService: { info(): Promise<{ homedir: string }> };
}
declare function useServices(): BaseServices;

interface DirectoryEntry {
  name: string;
  path: string;
  type: string;
  isSymbolicLink?: boolean;
}

/** 会话服务钩子（原 Ag，本 chunk 24320） */
declare function useZcodeSessionService(
  workspacePath: string | undefined,
  unused: undefined,
  workspaceIdentity: string | undefined,
): ZcodeSessionService;
interface ZcodeSessionService {
  importSessions(sessionIds: string[]): Promise<SessionImportResult | null> | null;
  importError?: string | null;
}
interface SessionImportResult {
  imported: unknown[];
  skipped: unknown[];
  failed: unknown[];
}

/** 技能上下文刷新（原 M6，本 chunk 142697） */
declare function refreshSkillContexts(args: {
  zcodeSessionService: ZcodeSessionService;
  workspacePath: string;
  workspaceIdentity?: string;
  reason: string;
}): Promise<void>;
/** 模型供应商快照失效（原 mM，本 chunk 52639） */
declare function invalidateModelProviderSnapshot(snapshot: unknown, opts: { invalidateInFlightRefresh: boolean }): void;
/** 工作区路径基名（原 Go，本 chunk 1928） */
declare function workspaceBaseLabel(path: string): string;

/** 设置 store（原 ko，Mie 工厂钩子 js 1296）：onboarding 请求标记 */
declare function useSettingsStore<T>(
  selector: (s: { onboardingDialogRequested: boolean; clearOnboardingDialogRequest(): void }) => T,
): T;

/** 导入选择 hook（原 R7，本 chunk 193347）：skills/mcpServers/commands 三类共用 */
interface ImportSelectionState {
  selections: Array<{ id: string }>;
  selectedCount: number;
  [key: string]: unknown;
}
declare function useImportSelections(args: {
  category: "skills" | "mcpServers" | "commands";
  enabled: boolean;
  workspacePath?: string;
  workspaceIdentity?: string;
}): ImportSelectionState;

/** 会话迁移扫描 hook（原 I2t，本 chunk 203145） */
interface SessionMigrationState {
  candidates: Array<{ workspacePath: string; sessionId: string }>;
  isScanning: boolean;
  scanError: string | null;
  supportState: { supported: boolean };
  range: string;
  limitInput: string;
  setRange(v: string): void;
  setLimitInput(v: string): void;
  scan(): void;
  importSessions(sessionIds: string[]): Promise<SessionImportResult | null> | null;
  importError?: string | null;
}
declare function useSessionMigrationScanner(args: {
  workspacePath: string | null;
  isDesktop: boolean;
}): SessionMigrationState;

/** 设置导入选择视图（原 v$t，本 chunk 193680；Settings 迁移页共用） */
declare const ImportSelectionView: React.FC<{
  category: "skills" | "mcpServers" | "commands";
  state: ImportSelectionState;
  workspacePath?: string;
}>;

/** Hero 文案尺寸（原 S4t，本 chunk 206090）与 Hero 卡片壳（原 C4t，206094） */
declare function useHeroTextSizes(): { heading: string; description: string };
declare const HeroCard: React.FC<{ className?: string; contentClassName?: string; children: React.ReactNode }>;

/** testid 常量（src-HCld2afU.js：8463 行 Mb） */
const TESTID_CONFIRM_DIALOG_CONFIRM = "confirm-dialog-confirm"; // 原 mee

/* ============================================================================
 * 1. 更新对话框子族（原 COt，js 128795-129046 / jsx 108523-108611）
 * ----------------------------------------------------------------------------
 * POt 控制器与 DOt/TOt/EOt/kOt/NOt 视图模型助手已在 TopBar.tsx 还原；
 * 本节为呈现层本体：三相位（before-download / downloading / downloaded）+
 * edgeToEdge 全屏变体（更新专用次级窗口）。
 * ==========================================================================*/

/** 原 xOt（js 128776-128790 / jsx 108512）：Radix Checkbox 封装 */
function UpdateDialogCheckbox({
  className,
  ...props
}: Omit<React.ComponentPropsWithoutRef<"button">, "onChange"> & {
  checked?: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean | "indeterminate") => void;
}) {
  return (
    <CheckboxRoot
      data-slot="checkbox"
      className={cn(
        `peer size-4 shrink-0 rounded-sm border border-input-border bg-input text-primary-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-input-border-focused/30 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary`,
        className,
      )}
      {...props}
    >
      <CheckboxIndicator data-slot="checkbox-indicator" className={`flex items-center justify-center text-current`}>
        <IconCheck className={`size-3`} />
      </CheckboxIndicator>
    </CheckboxRoot>
  );
}

/** 原 SOt（js 128791 / jsx 108522）：更新对话框 logo 资源 */
const UPDATE_DIALOG_LOGO_URL = new URL(
  `` + new URL(`icon_512@2x-BnwZhfO-.png`, import.meta.url).href,
  `` + import.meta.url,
).href;

export type UpdateDialogPhase = "before-download" | "downloading" | "downloaded";

/**
 * 原 COt（js 128795-129028 / jsx 108523-108589）：更新对话框呈现层。
 * edgeToEdge=false 走 Radix Dialog；=true 时自绘 role=dialog 全屏层（次级更新窗口）。
 */
export function UpdateStatusDialog({
  displayVersion,
  edgeToEdge = false,
  intl,
  isUpdateActionPending,
  autoDownloadAndInstallUpdates,
  onAutoDownloadAndInstallUpdatesChange,
  onCancelDownload,
  onDownloadUpdate,
  onOpenChange,
  onRestartUpdate,
  onSkipUpdate,
  open,
  phase,
  progressLabel,
  progressValue,
  releaseDateLabel,
  showOverlay = true,
  skippableVersion,
}: {
  displayVersion: string;
  edgeToEdge?: boolean;
  intl: IntlShape;
  isUpdateActionPending: boolean;
  autoDownloadAndInstallUpdates: boolean;
  onAutoDownloadAndInstallUpdatesChange: (v: boolean) => void;
  onCancelDownload: () => void | Promise<void>;
  onDownloadUpdate: () => void | Promise<void>;
  onOpenChange: (open: boolean) => void;
  onRestartUpdate: () => void | Promise<void>;
  onSkipUpdate: () => void | Promise<void>;
  open: boolean;
  phase: UpdateDialogPhase;
  progressLabel: string | null;
  progressValue: number;
  releaseDateLabel: string | null;
  showOverlay?: boolean;
  skippableVersion?: string | null;
}) {
  const isBeforeDownload = phase === `before-download`;
  const isDownloading = phase === `downloading`;
  const isDownloaded = phase === `downloaded`;
  const titleModel = splitUpdateDialogTitle({
    displayVersion,
    intl,
    titleId: isDownloaded
      ? `updateDialog.readyTitle`
      : isDownloading
        ? `updateDialog.downloadingTitle`
        : `updateDialog.availableTitle`,
  });
  const showSkip = isBeforeDownload && !!skippableVersion;
  const showLater = !isDownloading;
  const titleRowClass = `flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-ui-base font-medium leading-5 text-foreground`;
  const titleNode = (
    <>
      {titleModel.prefix ? <span>{titleModel.prefix}</span> : null}
      {titleModel.hasVersion ? <span className={`whitespace-nowrap`}>{titleModel.versionText}</span> : null}
      {titleModel.suffix ? <span>{titleModel.suffix}</span> : null}
    </>
  );
  const contentClass = cn(
    `max-h-[calc(100vh-2rem)] max-w-[calc(100vw-2rem)] overflow-hidden p-5 sm:max-w-lg`,
    edgeToEdge && !isDownloading ? `grid-rows-[auto_auto]` : `grid-rows-[auto_minmax(0,1fr)_auto]`,
    edgeToEdge
      ? `grid h-dvh max-h-none w-dvw max-w-none gap-5 border-0 bg-popover/98 pt-10 text-ui-base/relaxed text-foreground shadow-none sm:max-w-none [app-region:drag]`
      : `gap-5`,
  );
  const body = (
    <>
      <DialogHeader className={`gap-0`}>
        <div className={`flex min-w-0 items-center gap-3 [app-region:no-drag]`}>
          <img
            src={UPDATE_DIALOG_LOGO_URL}
            alt=""
            aria-hidden="true"
            className={`pointer-events-none -ml-[5px] size-12 shrink-0 select-none shadow-none drop-shadow-none`}
            draggable={false}
          />
          <div className={`min-w-0 flex-1 space-y-1.5`}>
            {edgeToEdge ? <h2 className={titleRowClass}>{titleNode}</h2> : <DialogTitle className={titleRowClass}>{titleNode}</DialogTitle>}
            {releaseDateLabel ? (
              <div className={`inline-flex max-w-full items-center gap-1 text-ui-xs font-normal leading-4 text-foreground-subtle`}>
                <IconCalendarDays className={`size-3 shrink-0`} aria-hidden="true" />
                <span className={`truncate`}>{releaseDateLabel}</span>
              </div>
            ) : null}
          </div>
        </div>
      </DialogHeader>
      {isDownloading ? (
        <div className={`min-h-0 overflow-y-auto [app-region:no-drag]`}>
          <section className={`space-y-2`} aria-live="polite">
            <div className={`flex items-center justify-between gap-3`}>
              <span className={`text-ui-base font-medium leading-5 text-foreground`}>
                {intl.formatMessage({ id: `updateDialog.downloadProgress` })}
              </span>
              {progressLabel ? <span className={`font-mono text-ui-base leading-5 text-foreground`}>{progressLabel}</span> : null}
            </div>
            <Progress
              value={progressValue}
              className={`zcode-update-charge-progress h-2 bg-primary/15 dark:bg-primary/20`}
              indicatorClassName={`bg-primary`}
            />
          </section>
        </div>
      ) : null}
      <div className={cn(`[app-region:no-drag]`, isDownloading ? `-mt-2` : null)}>
        {isBeforeDownload ? (
          <label className={`mb-4 flex min-w-0 items-center gap-2 text-ui-base leading-5 text-foreground`}>
            <UpdateDialogCheckbox
              checked={autoDownloadAndInstallUpdates}
              disabled={isUpdateActionPending}
              onCheckedChange={(checked) => {
                onAutoDownloadAndInstallUpdatesChange(checked === true);
              }}
            />
            <span className={`min-w-0`}>{intl.formatMessage({ id: `updateDialog.autoDownloadAndInstall` })}</span>
          </label>
        ) : null}
        <DialogFooter
          className={cn(
            `p-0 [app-region:no-drag]`,
            edgeToEdge
              ? cn(`flex-row items-center gap-3`, showSkip ? `justify-between` : `justify-end`)
              : showSkip
                ? `sm:justify-between`
                : `sm:justify-end`,
          )}
        >
          {showSkip ? (
            <div className={cn(`flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row`, edgeToEdge ? `w-auto flex-row` : null)}>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className={`h-9 self-start px-4`}
                disabled={isUpdateActionPending}
                onClick={() => void onSkipUpdate()}
              >
                {intl.formatMessage({ id: `updateDialog.skipVersion` })}
              </Button>
            </div>
          ) : null}
          <div
            className={cn(
              `flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:justify-end`,
              edgeToEdge ? `w-auto flex-row justify-end` : null,
            )}
          >
            {showLater ? (
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className={`h-9 px-4`}
                disabled={isUpdateActionPending}
                onClick={() => onOpenChange(false)}
              >
                {intl.formatMessage({ id: `updateDialog.later` })}
              </Button>
            ) : null}
            {isDownloaded ? (
              <Button
                type="button"
                size="lg"
                className={`h-9 px-4`}
                disabled={isUpdateActionPending}
                onClick={() => void onRestartUpdate()}
              >
                {intl.formatMessage({ id: `updateDialog.restartToUpdate` })}
              </Button>
            ) : isDownloading ? (
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className={`h-9 px-4`}
                disabled={isUpdateActionPending}
                onClick={() => void onCancelDownload()}
              >
                {intl.formatMessage({ id: `updateDialog.cancelDownload` })}
              </Button>
            ) : (
              <Button
                type="button"
                size="lg"
                className={`h-9 px-4`}
                disabled={isUpdateActionPending}
                onClick={() => void onDownloadUpdate()}
              >
                {intl.formatMessage({ id: `updateDialog.downloadAndUpdate` })}
              </Button>
            )}
          </div>
        </DialogFooter>
      </div>
    </>
  );
  return edgeToEdge ? (
    open ? (
      <div role="dialog" aria-modal="true" aria-describedby={undefined} className={contentClass}>
        {body}
      </div>
    ) : null
  ) : (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby={undefined} showOverlay={showOverlay} showCloseButton={false} className={contentClass}>
        {body}
      </DialogContent>
    </Dialog>
  );
}

/** 原 wOt（js 129029-129046 / jsx 108590）：标题按版本占位符切分前缀/后缀 */
function splitUpdateDialogTitle({
  displayVersion,
  intl,
  titleId,
}: {
  displayVersion: string;
  intl: IntlShape;
  titleId: string;
}) {
  const placeholder = `__ZCODE_UPDATE_VERSION__`;
  const formatted = intl.formatMessage({ id: titleId }, { version: placeholder });
  const at = formatted.indexOf(placeholder);
  const rawPrefix = at >= 0 ? formatted.slice(0, at) : ``;
  const vPrefix = rawPrefix.endsWith(`v`) ? `v` : ``;
  const prefix = (vPrefix ? rawPrefix.slice(0, -vPrefix.length) : rawPrefix).trim();
  return {
    hasVersion: at >= 0,
    prefix,
    suffix: at >= 0 ? formatted.slice(at + 24).trim() : formatted.trim(),
    versionText: `${vPrefix}${displayVersion}`,
  };
}

/** 原 yq（js 75986+ / jsx 67310）：Progress 条（本 chunk 内共享小件，随族转录） */
function Progress({
  className,
  indicatorClassName,
  segments,
  value,
  ...rest
}: React.ComponentPropsWithoutRef<"div"> & {
  className?: string;
  indicatorClassName?: string;
  segments?: Array<{ percent: number; className?: string; style?: React.CSSProperties }>;
  value?: number;
}) {
  const clamped = Math.min(Math.max(value ?? 0, 0), 100);
  const segs =
    segments?.map((s) => ({ ...s, percent: Math.min(Math.max(s.percent, 0), 1) })).filter((s) => s.percent > 0) ?? [];
  return (
    <ProgressRoot data-slot="progress" className={cn(`relative flex h-1 w-full items-center overflow-x-hidden rounded-md bg-muted`, className)} {...rest}>
      <ProgressIndicator
        data-slot="progress-indicator"
        className={cn(
          `h-full rounded-full transition-[width]`,
          segs.length > 0 ? `flex overflow-hidden bg-transparent` : `bg-primary`,
          clamped > 0 && indicatorClassName,
        )}
        style={{ width: `${clamped}%` }}
      >
        {segs.map((s, idx) => (
          <span key={idx} aria-hidden="true" className={cn(`h-full shrink-0`, s.className)} style={{ ...s.style, flexBasis: `${s.percent * 100}%` }} />
        ))}
      </ProgressIndicator>
    </ProgressRoot>
  );
}

/* ============================================================================
 * 2. 远程同步对话框子族（原 r4 分派 + ZEt/lDt/XDt 三对话框，js 124995-127332）
 * ----------------------------------------------------------------------------
 * 菜单项 n4 已在 TopBar.tsx（RemoteSyncMenuItems）。本节含：preflight 助手、
 * 「同步到远端」下拉按钮 $Dt、分派器 r4、技能/MCP/插件三个同步对话框全量。
 * ==========================================================================*/

/** 原 ZDt/QDt（js 127114-127121 / jsx 107547） */
const REMOTE_SYNC_PREFLIGHT_TIMEOUT_MS = 15000;
class RemoteSyncPreflightTimeoutError extends Error {
  timeoutMs: number;
  constructor(timeoutMs: number) {
    super(`Remote sync preflight timed out after ${timeoutMs}ms`);
    this.timeoutMs = timeoutMs;
    this.name = `RemoteSyncPreflightTimeoutError`;
  }
}
/** 原 Q2（js 127122 / jsx 107553） */
function isRemoteSyncPreflightTimeoutError(e: unknown): e is RemoteSyncPreflightTimeoutError {
  return e instanceof RemoteSyncPreflightTimeoutError;
}
/** 原 $2（js 127125-127132 / jsx 107556）：仅 ssh/wsl 远端会话且有本地源服务才可同步 */
function canOpenRemoteSessionSourceCheck(e: {
  clientMode: string;
  hasLocalSourceService: boolean;
  remoteSessionId?: string | null;
  remoteTarget?: { kind?: string } | null;
}): boolean {
  return e.clientMode === `web-remote-replayable` || e.hasLocalSourceService === false
    ? false
    : !!(
        e.remoteSessionId?.trim() &&
        (e.remoteTarget?.kind === `ssh` || e.remoteTarget?.kind === `wsl`)
      );
}
/** 原 e4（js 127133 / jsx 107559） */
function canSubmitRemoteSync(e: { inFlight: boolean; selectedCount: number }): boolean {
  return !e.inFlight && e.selectedCount > 0;
}
/** 原 t4（js 127136-127148 / jsx 107562）：preflight 15s 超时竞速 */
async function withRemoteSyncPreflightTimeout<T>(
  run: () => Promise<T>,
  timeoutMs: number = REMOTE_SYNC_PREFLIGHT_TIMEOUT_MS,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => {
      reject(new RemoteSyncPreflightTimeoutError(timeoutMs));
    }, timeoutMs);
  });
  try {
    return await Promise.race([run(), timeout]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

/** 远程目标显示标签（原 q2，js 125190-125198 / jsx 106293） */
export interface RemoteTarget {
  kind: string;
  host?: string;
  port?: number;
  username?: string;
  distro?: string;
  user?: string;
}
function remoteSyncTargetLabel(target: RemoteTarget, workspacePath?: string): string {
  const label =
    target.kind === `ssh`
      ? `${target.username}@${target.host}${target.port ? `:${target.port}` : ``}`
      : target.kind === `wsl`
        ? [`WSL`, target.distro, target.user?.trim()].filter(Boolean).join(` · `)
        : target.kind;
  return workspacePath ? `${label} · ${workspacePath}` : label;
}

/** 原 $Dt（js 127201-127247 / jsx 107599）：「同步到远端」下拉按钮（设置分区用） */
export function RemoteSyncDropdownButton({
  canSyncSkills,
  canSyncMcp,
  canSyncPlugins = false,
  mcpDisabled = false,
  onOpenSkillSync,
  onOpenMcpSync,
  onOpenPluginSync,
}: {
  canSyncSkills: boolean;
  canSyncMcp: boolean;
  canSyncPlugins?: boolean;
  mcpDisabled?: boolean;
  onOpenSkillSync: () => void;
  onOpenMcpSync: () => void;
  onOpenPluginSync: () => void;
}) {
  const { intl } = useIntlContext();
  // 原 VO/HO/UO/WO = DropdownMenu 原语族（TopBar.tsx §1.1 已登记）
  return !canSyncSkills && !canSyncMcp && !canSyncPlugins ? null : (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="secondary" size="sm" className={`gap-1`}>
          <IconCloudUpload className={`size-3.5`} aria-hidden="true" />
          {intl.formatMessage({ id: `settings.remoteSync.open` })}
          <IconChevronDown className={`size-3.5 text-foreground-subtle`} aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={`w-40`}>
        <RemoteSyncMenuItemsInner
          canSyncSkills={canSyncSkills}
          canSyncMcp={canSyncMcp}
          canSyncPlugins={canSyncPlugins}
          mcpDisabled={mcpDisabled}
          onOpenSkillSync={onOpenSkillSync}
          onOpenMcpSync={onOpenMcpSync}
          onOpenPluginSync={onOpenPluginSync}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
/** DropdownMenu 原语族接口（原 VO/HO/UO/WO，TopBar.tsx 已还原实现） */
declare const DropdownMenu: React.FC<{ children: React.ReactNode }>;
declare const DropdownMenuTrigger: React.FC<{ asChild?: boolean; children: React.ReactNode }>;
declare const DropdownMenuContent: React.FC<React.ComponentPropsWithoutRef<"div"> & { align?: string }>;
declare const DropdownMenuItem: React.FC<
  React.ComponentPropsWithoutRef<"div"> & { disabled?: boolean; onSelect?: () => void }
>;
/** 原 n4 菜单项（TopBar.tsx 已导出 RemoteSyncMenuItems；此处为族内引用接口） */
declare const RemoteSyncMenuItemsInner: React.FC<{
  canSyncSkills: boolean;
  canSyncMcp: boolean;
  canSyncPlugins?: boolean;
  mcpDisabled?: boolean;
  onOpenSkillSync: () => void;
  onOpenMcpSync: () => void;
  onOpenPluginSync: () => void;
}>;

/* ----------------------------------------------------------------------------
 * 2.1 技能同步对话框（原 ZEt，js 125271-125470 / jsx 106355）
 * --------------------------------------------------------------------------*/

/** 原 zEt（js 124995 / jsx 106207）：技能卡内自行处理点击的元素白名单 */
const SKILL_SYNC_ACTION_SELECTOR = `button,input,a,textarea,select,label,[data-remote-skill-sync-card-action]`;

/** 原 BEt（js 124996-125000 / jsx 106208） */
function shouldHandleSkillCardClick({ exists, target }: { exists: boolean; target: EventTarget | null }): boolean {
  if (exists) return false;
  const closest = (target as { closest?: (sel: string) => unknown } | null)?.closest;
  return typeof closest != `function` || !closest.call(target, SKILL_SYNC_ACTION_SELECTOR);
}

interface SkillCandidate {
  id: string;
  name: string;
  description?: string;
  directoryName: string;
}
interface SkillSyncRow {
  candidate: SkillCandidate;
  exists: boolean;
}

/** 原 WEt（js 125180 / jsx 106280） */
function mergeSkillRows(
  candidates: SkillCandidate[],
  statuses: Array<{ directoryName: string; exists?: boolean }>,
): SkillSyncRow[] {
  const byName = new Map(statuses.map((s): [string, (typeof statuses)[number]] => [s.directoryName, s]));
  return candidates.map((candidate) => ({ candidate, exists: byName.get(candidate.directoryName)?.exists ?? false }));
}
/** 原 GEt（js 125184 / jsx 106287） */
function defaultSkillSelection(rows: SkillSyncRow[]): Set<string> {
  return new Set(rows.filter((r) => !r.exists).map((r) => r.candidate.id));
}
/** 原 KEt（js 125187 / jsx 106290） */
function filterSkillRows(rows: SkillSyncRow[], showExisting: boolean): SkillSyncRow[] {
  return showExisting ? [...rows] : rows.filter((r) => !r.exists);
}

/** 原 VEt（js 125001-125106 / jsx 106216）：技能选择行列表 */
function SkillSyncRowList({
  rows,
  selectedIds,
  emptyMessageId = `settings.skills.remoteSync.empty`,
  onToggle,
}: {
  rows: SkillSyncRow[];
  selectedIds: Set<string>;
  emptyMessageId?: string;
  onToggle: (id: string, checked: boolean) => void;
}) {
  const { intl } = useIntlContext();
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set());
  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  return rows.length === 0 ? (
    <div className={`rounded-lg border border-border bg-surface px-3 py-3 text-ui-base text-foreground-subtle`}>
      {intl.formatMessage({ id: emptyMessageId })}
    </div>
  ) : (
    <div className={`grid gap-2`}>
      {rows.map((row) => {
        const checkboxId = `remote-skill-sync-${row.candidate.id}`;
        const labelId = `${checkboxId}-label`;
        const expanded = expandedIds.has(row.candidate.id);
        const checked = !row.exists && selectedIds.has(row.candidate.id);
        return (
          <div
            key={row.candidate.id}
            className={`grid grid-cols-[auto_1fr] gap-3 rounded-lg border border-border bg-surface px-3 py-2 text-ui-base ${row.exists ? `cursor-default` : `cursor-pointer hover:border-border-hover hover:bg-surface-hover`}`}
            onClick={(event) => {
              if (shouldHandleSkillCardClick({ exists: row.exists, target: event.target })) onToggle(row.candidate.id, !checked);
            }}
          >
            <input
              id={checkboxId}
              type="checkbox"
              aria-labelledby={labelId}
              className={`mt-1 size-4`}
              disabled={row.exists}
              checked={checked}
              onChange={(event) => onToggle(row.candidate.id, event.currentTarget.checked)}
            />
            <span className={`min-w-0`}>
              <span className={`flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1`}>
                <label id={labelId} htmlFor={checkboxId} className={`font-medium text-foreground`}>
                  {row.candidate.name}
                </label>
                {row.candidate.description ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className={`size-5 rounded-sm text-foreground-subtle hover:text-foreground`}
                    aria-expanded={expanded}
                    aria-label={intl.formatMessage({
                      id: expanded
                        ? `settings.skills.remoteSync.collapseDescription`
                        : `settings.skills.remoteSync.expandDescription`,
                    })}
                    data-remote-skill-sync-card-action="description-toggle"
                    onClick={() => toggleExpanded(row.candidate.id)}
                  >
                    {expanded ? <IconChevronDown className={`size-3.5`} aria-hidden="true" /> : <IconChevronRight className={`size-3.5`} aria-hidden="true" />}
                  </Button>
                ) : null}
                {row.exists ? (
                  <span className={`text-ui-base text-foreground-subtlest`}>
                    {intl.formatMessage({ id: `settings.skills.remoteSync.existing` })}
                  </span>
                ) : null}
              </span>
              {row.candidate.description ? (
                <span className={`mt-1 block min-w-0`}>
                  <span className={`text-ui-base text-foreground-subtle ${expanded ? `block whitespace-pre-wrap` : `line-clamp-1`}`}>
                    {row.candidate.description}
                  </span>
                </span>
              ) : null}
              <span className={`mt-1 block break-all font-mono text-ui-base text-foreground-subtlest`}>
                {row.candidate.directoryName}
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** 原 HEt（js 125107-125150 / jsx 106254）：技能同步结果视图 */
function SkillSyncResultView({ result }: { result: { results: Array<{ name: string; directoryName: string; status: string; error?: string }> } | null }) {
  const { intl } = useIntlContext();
  return result ? (
    <div className={`grid gap-2`}>
      <div className={`rounded-lg border border-border bg-surface px-3 py-2 text-ui-base text-foreground`}>
        {intl.formatMessage({ id: `settings.skills.remoteSync.complete` })}
      </div>
      {result.results.map((item) => (
        <div key={item.directoryName} className={`rounded-lg border border-border bg-surface px-3 py-2 text-ui-base`}>
          <div className={`flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1`}>
            <span className={`font-medium text-foreground`}>{item.name}</span>
            <span className={`text-foreground-subtle`}>
              {intl.formatMessage({ id: `settings.skills.remoteSync.${item.status}` })}
            </span>
          </div>
          {item.error ? <div className={`mt-1 break-words text-ui-base text-destructive`}>{item.error}</div> : null}
        </div>
      ))}
    </div>
  ) : null;
}

/** 原 UEt（js 125151-125179 / jsx 106266）：技能同步标题 + 警告 tooltip */
function SkillSyncTitle() {
  const { intl } = useIntlContext();
  const [warningOpen, setWarningOpen] = React.useState(false);
  const warningTitle = intl.formatMessage({ id: `settings.skills.remoteSync.warningTitle` });
  return (
    <DialogTitle className={`flex min-w-0 items-center gap-2 pr-8`}>
      <span className={`min-w-0 truncate`}>{intl.formatMessage({ id: `settings.skills.remoteSync.title` })}</span>
      <Tooltip
        open={warningOpen}
        title={warningTitle}
        description={intl.formatMessage({ id: `settings.skills.remoteSync.warningDescription` })}
        side="right"
        align="center"
      >
        <span
          aria-label={warningTitle}
          className={`inline-flex size-5 items-center justify-center rounded-full text-warning transition-colors hover:bg-hover hover:text-warning focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused`}
          onMouseEnter={() => setWarningOpen(true)}
          onMouseLeave={() => setWarningOpen(false)}
          role="img"
        >
          <IconCircleAlert className={`size-3.5`} aria-hidden="true" />
        </span>
      </Tooltip>
    </DialogTitle>
  );
}

/** 原 qEt（js 125199-125201 / jsx 106297） */
function resolveSelectAllState({ selectedCount, totalSelectable }: { selectedCount: number; totalSelectable: number }) {
  return {
    checked: totalSelectable > 0 && selectedCount >= totalSelectable,
    disabled: totalSelectable === 0,
    indeterminate: totalSelectable > 0 && selectedCount > 0 && selectedCount < totalSelectable,
  };
}
/** 原 JEt（js 125202-125218 / jsx 106307） */
function SkillSyncShowExisting({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (v: boolean) => void }) {
  const { intl } = useIntlContext();
  return (
    <label className={`inline-flex h-6 cursor-pointer items-center gap-2 rounded-md px-1 text-ui-base text-foreground-subtle hover:text-foreground`}>
      <input type="checkbox" className={`size-4`} checked={checked} onChange={(e) => onCheckedChange(e.currentTarget.checked)} />
      <span>{intl.formatMessage({ id: `settings.skills.remoteSync.showExisting` })}</span>
    </label>
  );
}
/** 原 YEt（js 125219-125241 / jsx 106318） */
function SkillSyncHeader({
  targetLabel,
  showExistingRemoteSkills,
  showExistingFilter,
  onShowExistingRemoteSkillsChange,
}: {
  targetLabel: string;
  showExistingRemoteSkills: boolean;
  showExistingFilter: boolean;
  onShowExistingRemoteSkillsChange: (v: boolean) => void;
}) {
  const { intl } = useIntlContext();
  return (
    <div className={`flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between`}>
      <p className={`min-w-0 break-words font-mono text-ui-base text-foreground-subtle`}>
        {intl.formatMessage({ id: `settings.skills.remoteSync.target` }, { target: targetLabel })}
      </p>
      {showExistingFilter ? (
        <div className={`shrink-0`}>
          <SkillSyncShowExisting checked={showExistingRemoteSkills} onCheckedChange={onShowExistingRemoteSkillsChange} />
        </div>
      ) : null}
    </div>
  );
}
/** 原 XEt（js 125242-125270 / jsx 106333）：全选（indeterminate 三态） */
function SkillSyncSelectAll({
  selectedCount,
  totalSelectable,
  onSelectAll,
  onClearAll,
}: {
  selectedCount: number;
  totalSelectable: number;
  onSelectAll: () => void;
  onClearAll: () => void;
}) {
  const { intl } = useIntlContext();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const state = resolveSelectAllState({ selectedCount, totalSelectable });
  React.useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = state.indeterminate;
  }, [state.indeterminate]);
  return (
    <label
      className={`inline-flex h-6 items-center gap-2 rounded-md px-1 text-ui-base text-foreground-subtle ${state.disabled ? `opacity-50` : `cursor-pointer hover:text-foreground`}`}
    >
      <input
        ref={inputRef}
        type="checkbox"
        className={`size-4`}
        checked={state.checked}
        disabled={state.disabled}
        aria-checked={state.indeterminate ? `mixed` : state.checked ? `true` : `false`}
        onChange={(e) => {
          if (e.currentTarget.checked) onSelectAll();
          else onClearAll();
        }}
      />
      <span>{intl.formatMessage({ id: `settings.skills.remoteSync.selectAll` })}</span>
    </label>
  );
}

interface SkillSyncService {
  listLocalUserSkillCandidates(): Promise<{ candidates: SkillCandidate[] }>;
  exportSkillsArchive(args: { skillIds: string[] }): Promise<{ archive: unknown }>;
}
interface RemoteSkillSyncService {
  listRemoteUserSkillStatuses(args: {
    directoryNames: string[];
    skills: Array<{ directoryName: string; name: string }>;
  }): Promise<{ statuses: Array<{ directoryName: string; exists?: boolean }> }>;
  checkRemoteUserSkillWriteAccess(): Promise<{ ok: boolean; path?: string; error?: string }>;
  importSkillsArchive(args: { archive: unknown; overwrite: boolean }): Promise<{
    results: Array<{ name: string; directoryName: string; status: string; error?: string }>;
  }>;
}

/** 原 ZEt（js 125271-125470 / jsx 106355）：技能同步对话框 */
function SkillSyncDialog(props: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  localSkillSyncService: SkillSyncService;
  remoteSkillSyncService: RemoteSkillSyncService;
  remoteTarget: RemoteTarget;
  workspacePath: string;
  workspaceIdentity?: string | null;
  onSynced: () => Promise<void> | void;
}) {
  const { intl } = useIntlContext();
  const {
    open,
    onOpenChange,
    localSkillSyncService,
    remoteSkillSyncService,
    remoteTarget,
    workspacePath,
    onSynced,
  } = props;
  const [phase, setPhase] = React.useState<SyncPhase>(`loading`);
  const [rows, setRows] = React.useState<SkillSyncRow[]>([]);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [showExisting, setShowExisting] = React.useState(true);
  const [result, setResult] = React.useState<Awaited<ReturnType<RemoteSkillSyncService["importSkillsArchive"]>> | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const inFlightRef = React.useRef(false);
  React.useEffect(() => {
    if (!open) return;
    let disposed = false;
    setPhase(`loading`);
    setRows([]);
    setSelectedIds(new Set());
    setShowExisting(true);
    setResult(null);
    setErrorMessage(null);
    inFlightRef.current = false;
    (async () => {
      try {
        const local = await localSkillSyncService.listLocalUserSkillCandidates();
        const remote = await remoteSkillSyncService.listRemoteUserSkillStatuses({
          directoryNames: local.candidates.map((c) => c.directoryName),
          skills: local.candidates.map((c) => ({ directoryName: c.directoryName, name: c.name })),
        });
        if (disposed) return;
        const merged = mergeSkillRows(local.candidates, remote.statuses);
        setRows(merged);
        setSelectedIds(defaultSkillSelection(merged));
        setPhase(`selection`);
      } catch (error) {
        if (disposed) return;
        setErrorMessage(error instanceof Error ? error.message : String(error));
        setPhase(`selection`);
      }
    })();
    return () => {
      disposed = true;
    };
  }, [localSkillSyncService, open, remoteSkillSyncService]);
  const visibleRows = React.useMemo(() => filterSkillRows(rows, showExisting), [rows, showExisting]);
  const selectableIds = React.useMemo(() => visibleRows.filter((r) => !r.exists).map((r) => r.candidate.id), [visibleRows]);
  const selectedAvailable = React.useMemo(() => selectableIds.filter((id) => selectedIds.has(id)), [selectedIds, selectableIds]);
  const selectedCount = selectedAvailable.length;
  const targetLabel = remoteSyncTargetLabel(remoteTarget, workspacePath);
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && (phase === `preflighting` || phase === `syncing`)) return;
        onOpenChange(next);
      }}
    >
      <DialogContent className={`h-[min(720px,calc(100dvh-2rem))] max-h-[min(720px,calc(100dvh-2rem))] max-w-2xl flex flex-col overflow-hidden`}>
        <DialogHeader>
          <SkillSyncTitle />
          <SkillSyncHeader
            targetLabel={targetLabel}
            showExistingRemoteSkills={showExisting}
            showExistingFilter={phase === `selection` && rows.length > 0}
            onShowExistingRemoteSkillsChange={setShowExisting}
          />
        </DialogHeader>
        <div className={`min-h-0 flex-1 overflow-y-auto`}>
          {errorMessage ? (
            <div className={`mb-3 rounded-lg border border-destructive/40 bg-surface px-3 py-2 text-ui-base text-destructive`}>
              {errorMessage}
            </div>
          ) : null}
          {phase === `loading` ? (
            <div className={`flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-3 text-ui-base text-foreground-subtle`}>
              <IconLoaderCircle className={`size-3.5 animate-spin`} aria-hidden="true" />
              {intl.formatMessage({ id: `settings.skills.remoteSync.loading` })}
            </div>
          ) : null}
          {phase === `preflighting` ? (
            <div className={`flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-3 text-ui-base text-foreground-subtle`}>
              <IconLoaderCircle className={`size-3.5 animate-spin`} aria-hidden="true" />
              {intl.formatMessage({ id: `settings.remoteSync.preflighting` })}
            </div>
          ) : null}
          {phase === `selection` ? (
            <SkillSyncRowList
              rows={visibleRows}
              selectedIds={selectedIds}
              emptyMessageId={rows.length > 0 ? `settings.skills.remoteSync.filteredEmpty` : undefined}
              onToggle={(id, checked) => {
                setSelectedIds((prev) => {
                  const next = new Set(prev);
                  if (checked) next.add(id);
                  else next.delete(id);
                  return next;
                });
              }}
            />
          ) : null}
          {phase === `syncing` ? (
            <div className={`flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-3 text-ui-base text-foreground-subtle`}>
              <IconLoaderCircle className={`size-3.5 animate-spin`} aria-hidden="true" />
              {intl.formatMessage({ id: `settings.skills.remoteSync.syncing` })}
            </div>
          ) : null}
          {phase === `complete` ? <SkillSyncResultView result={result} /> : null}
        </div>
        <div className={`flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between`}>
          <div className={`text-ui-base text-foreground-subtle`}>
            {intl.formatMessage(
              { id: `settings.skills.remoteSync.selectionCount` },
              { selected: String(selectedCount), total: String(selectableIds.length) },
            )}
          </div>
          <div className={`flex flex-wrap justify-end gap-2`}>
            {phase === `selection` ? (
              <SkillSyncSelectAll
                selectedCount={selectedCount}
                totalSelectable={selectableIds.length}
                onSelectAll={() => setSelectedIds(new Set(selectableIds))}
                onClearAll={() => setSelectedIds(new Set())}
              />
            ) : null}
            <Button
              type="button"
              size="sm"
              disabled={phase !== `selection` || selectedCount === 0}
              onClick={async () => {
                if (!canSubmitRemoteSync({ inFlight: inFlightRef.current, selectedCount: selectedAvailable.length })) {
                  if (selectedAvailable.length === 0)
                    setErrorMessage(intl.formatMessage({ id: `settings.skills.remoteSync.noSelection` }));
                  return;
                }
                inFlightRef.current = true;
                setErrorMessage(null);
                setPhase(`preflighting`);
                try {
                  const preflight = await withRemoteSyncPreflightTimeout(() =>
                    remoteSkillSyncService.checkRemoteUserSkillWriteAccess(),
                  );
                  if (!preflight.ok)
                    throw Error(
                      intl.formatMessage(
                        { id: `settings.remoteSync.preflightFailed` },
                        { path: preflight.path, error: preflight.error ?? `` },
                      ),
                    );
                  setPhase(`syncing`);
                  const exported = await localSkillSyncService.exportSkillsArchive({ skillIds: selectedAvailable });
                  const imported = await remoteSkillSyncService.importSkillsArchive({ archive: exported.archive, overwrite: false });
                  await onSynced();
                  setResult(imported);
                  setPhase(`complete`);
                } catch (error) {
                  setErrorMessage(
                    isRemoteSyncPreflightTimeoutError(error)
                      ? intl.formatMessage(
                          { id: `settings.remoteSync.preflightTimeout` },
                          { seconds: String(Math.ceil(error.timeoutMs / 1000)) },
                        )
                      : error instanceof Error
                        ? error.message
                        : String(error),
                  );
                  setPhase(`selection`);
                } finally {
                  inFlightRef.current = false;
                }
              }}
            >
              <IconCloudUpload className={`size-3.5`} aria-hidden="true" />
              {intl.formatMessage({ id: `settings.skills.remoteSync.start` })}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type SyncPhase = "loading" | "selection" | "preflighting" | "syncing" | "complete";

/* ----------------------------------------------------------------------------
 * 2.2 MCP 同步对话框（原 lDt，js 125728-125933 / jsx 106590；助手 125471-125727）
 * --------------------------------------------------------------------------*/

interface McpCandidate {
  id: string;
  name: string;
  path: string;
  source: string;
  config: Record<string, unknown>;
}
interface McpSyncRow {
  candidate: McpCandidate;
  exists: boolean;
}

/** 原 QEt（js 125471 / jsx 106467） */
function mergeMcpRows(
  candidates: McpCandidate[],
  statuses: Array<{ name: string; exists?: boolean }>,
): McpSyncRow[] {
  const byName = new Map(statuses.map((s): [string, (typeof statuses)[number]] => [s.name, s]));
  return candidates.map((candidate) => ({ candidate, exists: byName.get(candidate.name)?.exists ?? false }));
}
/** 原 $Et（js 125475 / jsx 106474） */
function defaultMcpSelection(rows: McpSyncRow[]): Set<string> {
  return new Set(rows.filter((r) => !r.exists).map((r) => r.candidate.id));
}
/** 原 eDt（js 125478 / jsx 106477） */
function filterMcpRows(rows: McpSyncRow[], showExisting: boolean): McpSyncRow[] {
  return showExisting ? [...rows] : rows.filter((r) => !r.exists);
}
/** 原 tDt（js 125481-125489 / jsx 106480）：导入载荷（overwrite 恒 false） */
function buildMcpImportPayload(e: {
  exported: { servers: unknown; localHomeDir?: string };
  localHomeDir: string;
  localWorkspacePath?: string;
  remoteWorkspacePath: string;
}) {
  return {
    servers: e.exported.servers,
    localHomeDir: e.exported.localHomeDir || e.localHomeDir,
    localWorkspacePath: e.localWorkspacePath,
    remoteWorkspacePath: e.remoteWorkspacePath,
    overwrite: false,
  };
}
/** 原 nDt（js 125490-125498 / jsx 106489）：type→command/stdio→url/http 推断 */
function resolveMcpServerKind(config: Record<string, unknown>): string {
  return typeof config.type == `string` && config.type.trim()
    ? (config.type as string).trim()
    : typeof config.command == `string` && (config.command as string).trim()
      ? `stdio`
      : typeof config.url == `string` && (config.url as string).trim()
        ? `http`
        : `unknown`;
}

/** 原 rDt（js 125499-125527 / jsx 106492）：MCP 同步标题 + 警告 tooltip */
function McpSyncTitle() {
  const { intl } = useIntlContext();
  const [warningOpen, setWarningOpen] = React.useState(false);
  const warningTitle = intl.formatMessage({ id: `settings.mcp.remoteSync.warningTitle` });
  return (
    <DialogTitle className={`flex min-w-0 items-center gap-2 pr-8`}>
      <span className={`min-w-0 truncate`}>{intl.formatMessage({ id: `settings.mcp.remoteSync.title` })}</span>
      <Tooltip
        open={warningOpen}
        title={warningTitle}
        description={intl.formatMessage({ id: `settings.mcp.remoteSync.warningDescription` })}
        side="right"
        align="center"
      >
        <span
          aria-label={warningTitle}
          className={`inline-flex size-5 items-center justify-center rounded-full text-warning transition-colors hover:bg-hover hover:text-warning focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused`}
          onMouseEnter={() => setWarningOpen(true)}
          onMouseLeave={() => setWarningOpen(false)}
          role="img"
        >
          <IconCircleAlert className={`size-3.5`} aria-hidden="true" />
        </span>
      </Tooltip>
    </DialogTitle>
  );
}
/** 原 iDt（js 125528-125544 / jsx 106506） */
function McpSyncShowExisting({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (v: boolean) => void }) {
  const { intl } = useIntlContext();
  return (
    <label className={`inline-flex h-6 cursor-pointer items-center gap-2 rounded-md px-1 text-ui-base text-foreground-subtle hover:text-foreground`}>
      <input type="checkbox" className={`size-4`} checked={checked} onChange={(e) => onCheckedChange(e.currentTarget.checked)} />
      <span>{intl.formatMessage({ id: `settings.mcp.remoteSync.showExisting` })}</span>
    </label>
  );
}
/** 原 aDt（js 125545-125567 / jsx 106517） */
function McpSyncHeader({
  targetLabel,
  showExistingRemoteMcp,
  showExistingFilter,
  onShowExistingRemoteMcpChange,
}: {
  targetLabel: string;
  showExistingRemoteMcp: boolean;
  showExistingFilter: boolean;
  onShowExistingRemoteMcpChange: (v: boolean) => void;
}) {
  const { intl } = useIntlContext();
  return (
    <div className={`flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between`}>
      <p className={`min-w-0 break-words font-mono text-ui-base text-foreground-subtle`}>
        {intl.formatMessage({ id: `settings.mcp.remoteSync.target` }, { target: targetLabel })}
      </p>
      {showExistingFilter ? (
        <div className={`shrink-0`}>
          <McpSyncShowExisting checked={showExistingRemoteMcp} onCheckedChange={onShowExistingRemoteMcpChange} />
        </div>
      ) : null}
    </div>
  );
}
/** 原 oDt（js 125568-125598 / jsx 106535） */
function McpSyncSelectAll({
  selectedCount,
  totalSelectable,
  onSelectAll,
  onClearAll,
}: {
  selectedCount: number;
  totalSelectable: number;
  onSelectAll: () => void;
  onClearAll: () => void;
}) {
  const { intl } = useIntlContext();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const disabled = totalSelectable === 0;
  const checked = totalSelectable > 0 && selectedCount >= totalSelectable;
  const indeterminate = totalSelectable > 0 && selectedCount > 0 && selectedCount < totalSelectable;
  React.useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <label
      className={`inline-flex h-6 items-center gap-2 rounded-md px-1 text-ui-base text-foreground-subtle ${disabled ? `opacity-50` : `cursor-pointer hover:text-foreground`}`}
    >
      <input
        ref={inputRef}
        type="checkbox"
        className={`size-4`}
        checked={checked}
        disabled={disabled}
        aria-checked={indeterminate ? `mixed` : checked ? `true` : `false`}
        onChange={(e) => {
          if (e.currentTarget.checked) onSelectAll();
          else onClearAll();
        }}
      />
      <span>{intl.formatMessage({ id: `settings.mcp.remoteSync.selectAll` })}</span>
    </label>
  );
}

/** 原 sDt（js 125599-125677 / jsx 106556）：MCP 选择行列表 */
function McpSyncRowList({
  rows,
  selectedIds,
  emptyMessageId = `settings.mcp.remoteSync.empty`,
  onToggle,
}: {
  rows: McpSyncRow[];
  selectedIds: Set<string>;
  emptyMessageId?: string;
  onToggle: (id: string, checked: boolean) => void;
}) {
  const { intl } = useIntlContext();
  return rows.length === 0 ? (
    <div className={`rounded-lg border border-border bg-surface px-3 py-3 text-ui-base text-foreground-subtle`}>
      {intl.formatMessage({ id: emptyMessageId })}
    </div>
  ) : (
    <div className={`grid gap-2`}>
      {rows.map((row) => {
        const checkboxId = `remote-mcp-sync-${row.candidate.id}`;
        const labelId = `${checkboxId}-label`;
        const kind = resolveMcpServerKind(row.candidate.config);
        const checked = !row.exists && selectedIds.has(row.candidate.id);
        return (
          <label
            key={row.candidate.id}
            htmlFor={checkboxId}
            className={`grid grid-cols-[auto_auto_minmax(0,1fr)] gap-3 rounded-lg border border-border bg-surface px-3 py-2 text-ui-base ${row.exists ? `cursor-default` : `cursor-pointer hover:border-border-hover hover:bg-surface-hover`}`}
          >
            <input
              id={checkboxId}
              type="checkbox"
              aria-labelledby={labelId}
              className={`mt-1 size-4`}
              checked={checked}
              disabled={row.exists}
              onChange={(event) => onToggle(row.candidate.id, event.currentTarget.checked)}
            />
            <span className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-border text-foreground-subtle`} aria-hidden="true">
              <IconCable className={`size-4`} />
            </span>
            <span className={`min-w-0`}>
              <span className={`flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1`}>
                <span id={labelId} className={`font-medium text-foreground`}>
                  {row.candidate.name}
                </span>
                <span className={`rounded-md bg-secondary px-1.5 py-0.5 text-ui-xs font-medium text-foreground-subtle`}>{kind}</span>
                <span className={`rounded-md bg-secondary px-1.5 py-0.5 text-ui-xs font-medium text-foreground-subtle`}>{row.candidate.source}</span>
                {row.exists ? (
                  <span className={`text-ui-base text-foreground-subtlest`}>
                    {intl.formatMessage({ id: `settings.mcp.remoteSync.existing` })}
                  </span>
                ) : null}
              </span>
              <span className={`mt-1 block break-all font-mono text-ui-base text-foreground-subtlest`}>{row.candidate.path}</span>
            </span>
          </label>
        );
      })}
    </div>
  );
}

/** 原 cDt（js 125678-125727 / jsx 106577）：MCP 同步结果视图 */
function McpSyncResultView({
  result,
}: {
  result: { results?: Array<{ name: string; status: string; error?: string; path?: string }> } | null;
}) {
  const { intl } = useIntlContext();
  const results = result?.results ?? [];
  return results.length === 0 ? (
    <div className={`rounded-lg border border-border bg-surface px-3 py-3 text-ui-base text-foreground-subtle`}>
      {intl.formatMessage({ id: `settings.mcp.remoteSync.resultEmpty` })}
    </div>
  ) : (
    <div className={`overflow-hidden rounded-xl border border-border bg-card`}>
      <div className={`divide-y divide-border`}>
        {results.map((item) => (
          <div key={`${item.name}-${item.status}`} className={`grid grid-cols-[minmax(0,1fr)_auto] gap-3 px-4 py-3`}>
            <div className={`min-w-0`}>
              <div className={`truncate text-ui-base font-medium text-foreground`}>{item.name}</div>
              {item.error ? (
                <div className={`mt-0.5 break-words text-ui-base text-destructive`}>{item.error}</div>
              ) : item.path ? (
                <div className={`mt-0.5 truncate font-mono text-ui-xs text-foreground-subtlest`}>{item.path}</div>
              ) : null}
            </div>
            <span className={`shrink-0 rounded-md bg-surface px-1.5 py-0.5 text-ui-xs text-foreground-subtle ring-1 ring-border`}>
              {intl.formatMessage({ id: `settings.mcp.remoteSync.${item.status}` })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface McpSyncService {
  listLocalUserMcpCandidates(): Promise<{ candidates: McpCandidate[]; localHomeDir: string }>;
  exportMcpServers(args: { serverIds: string[] }): Promise<{ servers: unknown; localHomeDir?: string }>;
}
interface RemoteMcpSyncService {
  listRemoteUserMcpStatuses(args: { names: string[] }): Promise<{ statuses: Array<{ name: string; exists?: boolean }> }>;
  checkRemoteUserMcpWriteAccess(): Promise<{ ok: boolean; path?: string; error?: string }>;
  importMcpServers(payload: ReturnType<typeof buildMcpImportPayload>): Promise<{
    results: Array<{ name: string; status: string; error?: string; path?: string }>;
  }>;
}

/** 原 lDt（js 125728-125933 / jsx 106590）：MCP 同步对话框 */
function McpSyncDialog(props: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  localMcpSyncService: McpSyncService;
  remoteMcpSyncService: RemoteMcpSyncService;
  remoteTarget: RemoteTarget;
  workspacePath: string;
  localWorkspacePath?: string;
  onSynced: () => Promise<void> | void;
}) {
  const { intl } = useIntlContext();
  const {
    localMcpSyncService,
    localWorkspacePath,
    onOpenChange,
    onSynced,
    open,
    remoteMcpSyncService,
    remoteTarget,
    workspacePath,
  } = props;
  const [phase, setPhase] = React.useState<SyncPhase>(`loading`);
  const [rows, setRows] = React.useState<McpSyncRow[]>([]);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [showExisting, setShowExisting] = React.useState(true);
  const [result, setResult] = React.useState<Awaited<ReturnType<RemoteMcpSyncService["importMcpServers"]>> | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [localHomeDir, setLocalHomeDir] = React.useState(``);
  const inFlightRef = React.useRef(false);
  React.useEffect(() => {
    if (!open) return;
    let disposed = false;
    setPhase(`loading`);
    setRows([]);
    setSelectedIds(new Set());
    setShowExisting(true);
    setResult(null);
    setErrorMessage(null);
    setLocalHomeDir(``);
    inFlightRef.current = false;
    (async () => {
      try {
        const local = await localMcpSyncService.listLocalUserMcpCandidates();
        const remote = await remoteMcpSyncService.listRemoteUserMcpStatuses({
          names: local.candidates.map((c) => c.name),
        });
        if (disposed) return;
        const merged = mergeMcpRows(local.candidates, remote.statuses);
        setLocalHomeDir(local.localHomeDir);
        setRows(merged);
        setSelectedIds(defaultMcpSelection(merged));
        setPhase(`selection`);
      } catch (error) {
        if (disposed) return;
        setErrorMessage(error instanceof Error ? error.message : String(error));
        setPhase(`selection`);
      }
    })();
    return () => {
      disposed = true;
    };
  }, [localMcpSyncService, open, remoteMcpSyncService]);
  const visibleRows = React.useMemo(() => filterMcpRows(rows, showExisting), [rows, showExisting]);
  const selectableIds = React.useMemo(() => visibleRows.filter((r) => !r.exists).map((r) => r.candidate.id), [visibleRows]);
  const selectedAvailable = React.useMemo(() => selectableIds.filter((id) => selectedIds.has(id)), [selectedIds, selectableIds]);
  const selectedCount = selectedAvailable.length;
  const targetLabel = remoteSyncTargetLabel(remoteTarget, workspacePath);
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && (phase === `preflighting` || phase === `syncing`)) return;
        onOpenChange(next);
      }}
    >
      <DialogContent className={`h-[min(720px,calc(100dvh-2rem))] max-h-[min(720px,calc(100dvh-2rem))] max-w-2xl flex flex-col overflow-hidden`}>
        <DialogHeader>
          <McpSyncTitle />
          <McpSyncHeader
            targetLabel={targetLabel}
            showExistingRemoteMcp={showExisting}
            showExistingFilter={phase === `selection` && rows.length > 0}
            onShowExistingRemoteMcpChange={setShowExisting}
          />
        </DialogHeader>
        <div className={`min-h-0 flex-1 overflow-y-auto`}>
          {errorMessage ? (
            <div className={`mb-3 rounded-lg border border-destructive/40 bg-surface px-3 py-2 text-ui-base text-destructive`}>
              {errorMessage}
            </div>
          ) : null}
          {phase === `loading` ? (
            <div className={`flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-3 text-ui-base text-foreground-subtle`}>
              <IconLoaderCircle className={`size-3.5 animate-spin`} aria-hidden="true" />
              {intl.formatMessage({ id: `settings.mcp.remoteSync.loading` })}
            </div>
          ) : null}
          {phase === `preflighting` ? (
            <div className={`flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-3 text-ui-base text-foreground-subtle`}>
              <IconLoaderCircle className={`size-3.5 animate-spin`} aria-hidden="true" />
              {intl.formatMessage({ id: `settings.remoteSync.preflighting` })}
            </div>
          ) : null}
          {phase === `selection` ? (
            <McpSyncRowList
              rows={visibleRows}
              selectedIds={selectedIds}
              emptyMessageId={rows.length > 0 ? `settings.mcp.remoteSync.filteredEmpty` : undefined}
              onToggle={(id, checked) => {
                setSelectedIds((prev) => {
                  const next = new Set(prev);
                  if (checked) next.add(id);
                  else next.delete(id);
                  return next;
                });
              }}
            />
          ) : null}
          {phase === `syncing` ? (
            <div className={`flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-3 text-ui-base text-foreground-subtle`}>
              <IconLoaderCircle className={`size-3.5 animate-spin`} aria-hidden="true" />
              {intl.formatMessage({ id: `settings.mcp.remoteSync.syncing` })}
            </div>
          ) : null}
          {phase === `complete` ? <McpSyncResultView result={result} /> : null}
        </div>
        <div className={`flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between`}>
          <div className={`text-ui-base text-foreground-subtle`}>
            {intl.formatMessage(
              { id: `settings.mcp.remoteSync.selectionCount` },
              { selected: String(selectedCount), total: String(selectableIds.length) },
            )}
          </div>
          <div className={`flex flex-wrap justify-end gap-2`}>
            {phase === `selection` ? (
              <McpSyncSelectAll
                selectedCount={selectedCount}
                totalSelectable={selectableIds.length}
                onSelectAll={() => setSelectedIds(new Set(selectableIds))}
                onClearAll={() => setSelectedIds(new Set())}
              />
            ) : null}
            <Button
              type="button"
              size="sm"
              disabled={phase !== `selection` || selectedCount === 0}
              onClick={async () => {
                if (!canSubmitRemoteSync({ inFlight: inFlightRef.current, selectedCount: selectedAvailable.length })) {
                  if (selectedAvailable.length === 0)
                    setErrorMessage(intl.formatMessage({ id: `settings.mcp.remoteSync.noSelection` }));
                  return;
                }
                inFlightRef.current = true;
                setErrorMessage(null);
                setPhase(`preflighting`);
                try {
                  const preflight = await withRemoteSyncPreflightTimeout(() =>
                    remoteMcpSyncService.checkRemoteUserMcpWriteAccess(),
                  );
                  if (!preflight.ok)
                    throw Error(
                      intl.formatMessage(
                        { id: `settings.remoteSync.preflightFailed` },
                        { path: preflight.path, error: preflight.error ?? `` },
                      ),
                    );
                  setPhase(`syncing`);
                  const exported = await localMcpSyncService.exportMcpServers({ serverIds: selectedAvailable });
                  const imported = await remoteMcpSyncService.importMcpServers(
                    buildMcpImportPayload({
                      exported,
                      localHomeDir,
                      localWorkspacePath,
                      remoteWorkspacePath: workspacePath,
                    }),
                  );
                  await onSynced();
                  setResult(imported);
                  setPhase(`complete`);
                } catch (error) {
                  setErrorMessage(
                    isRemoteSyncPreflightTimeoutError(error)
                      ? intl.formatMessage(
                          { id: `settings.remoteSync.preflightTimeout` },
                          { seconds: String(Math.ceil(error.timeoutMs / 1000)) },
                        )
                      : error instanceof Error
                        ? error.message
                        : String(error),
                  );
                  setPhase(`selection`);
                } finally {
                  inFlightRef.current = false;
                }
              }}
            >
              <IconCloudUpload className={`size-3.5`} aria-hidden="true" />
              {intl.formatMessage({ id: `settings.mcp.remoteSync.start` })}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ----------------------------------------------------------------------------
 * 2.3 插件同步对话框（原 XDt，js 126826-127113 / jsx 107373；数据层 125934-126825）
 * --------------------------------------------------------------------------*/

/** 原 J2（js 125934-125941 / jsx 106719） */
class RemotePluginSyncStoppedError extends Error {
  row: PluginSyncRow;
  constructor(row: PluginSyncRow) {
    super(`Stopped sync for ${row.candidate.pluginId}`);
    this.row = row;
    this.name = `RemotePluginSyncStoppedError`;
  }
}

/** 原 uDt（js 125941 / jsx 106724） */
let pluginSyncLogIdCounter = 0;
/** 原 dDt（js 125942-125946 / jsx 106725） */
function makePluginSyncLogId(row: PluginSyncRow): string {
  pluginSyncLogIdCounter += 1;
  const slug = row.candidate.pluginId.replace(/[^a-z0-9._-]+/giu, `-`);
  return `remote-plugin-sync-${pluginSyncLogIdCounter}-${slug}`;
}

interface InlinePluginCandidate {
  id: string;
  name: string;
  pluginId: string;
  description?: string;
  version?: string;
  path: string;
  enabled: boolean;
  componentTypes: string[];
  directoryName: string;
}
interface PluginCandidate {
  id: string;
  kind: "inline" | "marketplace";
  name: string;
  pluginId: string;
  marketplace: string;
  description?: string;
  version?: string;
  path?: string;
  enabled: boolean;
  componentTypes: string[];
  inlineCandidate?: InlinePluginCandidate;
  pluginOptions?: PluginOptionsPayload;
  marketplacePlugin?: MarketplacePluginMeta;
}
interface PluginOptionsPayload {
  configuredOptions: Record<string, OptionSchema>;
  userConfig: Record<string, unknown>;
}
interface OptionSchema {
  type?: string;
  sensitive?: boolean;
  source?: string;
  ref?: string;
  url?: string;
  repo?: string;
}
interface MarketplacePluginMeta {
  marketplaceSourceInput?: string;
  marketplaceSourceArchive?: { marketplaceId: string; source: unknown };
  pluginName: string;
  scope?: string;
}
interface PluginSyncRow {
  candidate: PluginCandidate;
  exists: boolean;
  path?: string;
  reason?: string;
  remoteMarketplaceExists?: boolean;
}
interface PluginSyncResultItem {
  name: string;
  pluginId: string;
  directoryName: string;
  status: string;
  error?: string;
  path?: string;
}

/** 原 fDt（js 125947-125961 / jsx 106730）：本地用户插件 → inline 候选 */
function toInlinePluginCandidate(e: InlinePluginCandidate): PluginCandidate {
  return {
    id: `inline:${e.id}`,
    kind: `inline`,
    name: e.name,
    pluginId: e.pluginId,
    marketplace: `inline`,
    ...(e.description ? { description: e.description } : {}),
    ...(e.version ? { version: e.version } : {}),
    path: e.path,
    enabled: e.enabled,
    componentTypes: e.componentTypes,
    inlineCandidate: e,
  };
}
/** 原 pDt（js 125962 / jsx 106748） */
function pluginStatusKey(pluginId: string, directoryName: string): string {
  return `${pluginId.toLowerCase()}\u0000${directoryName}`;
}
/** 原 mDt（js 125965-125979 / jsx 106752） */
function mergeInlinePluginRows(
  candidates: InlinePluginCandidate[],
  statuses: Array<{ pluginId: string; directoryName: string; exists?: boolean; path?: string; reason?: string }>,
): PluginSyncRow[] {
  const byKey = new Map(
    statuses.map((s): [string, (typeof statuses)[number]] => [pluginStatusKey(s.pluginId, s.directoryName), s]),
  );
  return mergePluginRows(
    candidates.map(toInlinePluginCandidate),
    candidates.map((c) => {
      const hit = byKey.get(pluginStatusKey(c.pluginId, c.directoryName));
      return {
        candidateId: `inline:${c.id}`,
        exists: hit?.exists ?? false,
        ...(hit?.path ? { path: hit.path } : {}),
        ...(hit?.reason ? { reason: hit.reason } : {}),
      };
    }),
  );
}
/** 原 hDt（js 125980-125994 / jsx 106768） */
function mergePluginRows(
  candidates: PluginCandidate[],
  statuses: Array<{
    candidateId: string;
    exists?: boolean;
    path?: string;
    reason?: string;
    remoteMarketplaceExists?: boolean;
  }>,
): PluginSyncRow[] {
  const byId = new Map(statuses.map((s): [string, (typeof statuses)[number]] => [s.candidateId, s]));
  return candidates.map((candidate) => {
    const hit = byId.get(candidate.id);
    return {
      candidate,
      exists: hit?.exists ?? false,
      ...(hit?.path ? { path: hit.path } : {}),
      ...(hit?.reason ? { reason: hit.reason } : {}),
      ...(hit?.remoteMarketplaceExists === undefined ? {} : { remoteMarketplaceExists: hit.remoteMarketplaceExists }),
    };
  });
}
/** 原 gDt（js 125995 / jsx 106787） */
function defaultPluginSelection(rows: PluginSyncRow[]): Set<string> {
  return new Set(rows.filter((r) => !r.exists).map((r) => r.candidate.id));
}
/** 原 _Dt（js 125998 / jsx 106790） */
function filterPluginRows(rows: PluginSyncRow[], showExisting: boolean): PluginSyncRow[] {
  return showExisting ? [...rows] : rows.filter((r) => !r.exists);
}
/** 原 vDt（js 126001 / jsx 106793）：preflighting/syncing 期间禁止关闭 */
function canClosePluginSyncDialog(phase: SyncPhase, nextOpen: boolean): boolean {
  return nextOpen || (phase !== `preflighting` && phase !== `syncing`);
}
/** 原 xDt（js 126044 / jsx 106850） */
function remoteComponentKinds(remote?: { components?: Array<{ kind: string }> }): string[] {
  return remote?.components?.map((c) => c.kind) ?? [];
}
/** 原 SDt（js 126047-126051 / jsx 106853） */
function extractPluginOptions(remote?: {
  configuredOptions?: Record<string, OptionSchema>;
  userConfig?: Record<string, unknown>;
}): PluginOptionsPayload | undefined {
  const configured = remote?.configuredOptions ?? {};
  if (Object.keys(configured).length !== 0)
    return { configuredOptions: { ...configured }, userConfig: { ...(remote?.userConfig ?? {}) } };
  return undefined;
}
/** 原 CDt（js 126052 / jsx 106864） */
function attachPluginOptions(
  candidate: PluginCandidate,
  remote?: { pluginId?: string; configuredOptions?: Record<string, OptionSchema>; userConfig?: Record<string, unknown> },
): PluginCandidate {
  const options = extractPluginOptions(remote);
  return options ? { ...candidate, pluginOptions: options } : candidate;
}
/** 原 wDt（js 126056 / jsx 106871） */
function hydratePluginOptions(
  candidates: PluginCandidate[],
  remotes: Array<{
    id: string;
    pluginId?: string;
    configuredOptions?: Record<string, OptionSchema>;
    userConfig?: Record<string, unknown>;
  }>,
): PluginCandidate[] {
  // 原 wDt：Map 键为远端 plugin 的 id，再按 candidate.pluginId 取
  const byId = new Map(remotes.map((r): [string, (typeof remotes)[number]] => [r.id, r]));
  return candidates.map((c) => attachPluginOptions(c, byId.get(c.pluginId)));
}
/** 原 yDt（js 126004-126029 / jsx 106796）：已装市场插件 → marketplace 候选 */
function buildMarketplaceCandidates(
  overview: {
    marketplaces: Array<MarketplaceSource & { id: string }>;
    installedPlugins: Array<{
      id: string;
      name: string;
      marketplace: string;
      description?: string;
      version?: string;
      installPath?: string;
      enabled: boolean;
      componentTypes?: string[];
      scope?: string;
    }>;
  },
  plugins: Array<{
    id: string;
    pluginId?: string;
    description?: string;
    version?: string;
    rootPath?: string;
    configuredOptions?: Record<string, OptionSchema>;
    userConfig?: Record<string, unknown>;
    components?: Array<{ kind: string }>;
  }>,
): PluginCandidate[] {
  const remoteById = new Map(plugins.map((p): [string, (typeof plugins)[number]] => [p.id, p]));
  const marketplaceById = new Map(
    overview.marketplaces.map((m): [string, ReturnType<typeof marketplaceSourcePayload>] => [m.id, marketplaceSourcePayload(m)]),
  );
  return overview.installedPlugins.map((installed) => {
    const remote = remoteById.get(installed.id);
    const componentTypes = installed.componentTypes ?? remoteComponentKinds(remote);
    const marketplaceMeta = marketplaceById.get(installed.marketplace);
    const options = extractPluginOptions(remote);
    return {
      id: `marketplace:${installed.id}`,
      kind: `marketplace` as const,
      name: installed.name,
      pluginId: installed.id,
      marketplace: installed.marketplace,
      ...((installed.description ?? remote?.description)
        ? { description: installed.description ?? remote?.description }
        : {}),
      ...((installed.version ?? remote?.version) ? { version: installed.version ?? remote?.version } : {}),
      ...((installed.installPath ?? remote?.rootPath) ? { path: installed.installPath ?? remote?.rootPath } : {}),
      enabled: installed.enabled,
      componentTypes,
      ...(options ? { pluginOptions: options } : {}),
      marketplacePlugin: { ...marketplaceMeta, pluginName: installed.name, scope: installed.scope },
    };
  });
}
/** 原 bDt（js 126030-126043 / jsx 106832） */
function mapMarketplaceStatuses(
  candidates: PluginCandidate[],
  remote: {
    installedPlugins: Array<{ id: string; installPath?: string }>;
    marketplaces: Array<{ id: string }>;
  },
): Array<{ candidateId: string; exists: boolean; path?: string; reason?: string; remoteMarketplaceExists: boolean }> {
  const installedById = new Map(
    remote.installedPlugins.map((p): [string, (typeof remote.installedPlugins)[number]] => [p.id, p]),
  );
  const marketplaceIds = new Set(remote.marketplaces.map((m) => m.id));
  return candidates.map((candidate) => {
    const hit = installedById.get(candidate.pluginId);
    return {
      candidateId: candidate.id,
      exists: !!hit,
      ...(hit?.installPath ? { path: hit.installPath } : {}),
      ...(hit ? { reason: `samePluginId` } : {}),
      remoteMarketplaceExists: marketplaceIds.has(candidate.marketplace),
    };
  });
}
/** 原 TDt（js 126060-126069 / jsx 106875）：可移植/手动 选项计数 */
function summarizePluginOptions(options: PluginOptionsPayload | undefined): {
  manualCount: number;
  syncableCount: number;
} | null {
  if (!options || Object.keys(options.configuredOptions).length === 0) return null;
  let syncable = 0;
  let manual = 0;
  for (const [key, configuredValue] of Object.entries(options.configuredOptions)) {
    const schema = options.userConfig[key];
    // 原 TDt：MDt(i, a, a)——值=configuredOptions 项，schema=userConfig 项
    if (isPortableOptionValue(configuredValue, schema as OptionSchema | undefined, schema as OptionSchema | undefined))
      syncable += 1;
    else manual += 1;
  }
  return { manualCount: manual, syncableCount: syncable };
}
/** 原 EDt（js 126070-126077 / jsx 106888） */
function marketplaceSourceInput(marketplace: MarketplaceSource): string | undefined {
  const source = marketplace.source;
  const sourceKind = typeof source.source == `string` ? source.source : ``;
  const ref = typeof source.ref == `string` && source.ref.trim() ? `#${source.ref.trim()}` : ``;
  if (sourceKind === `github` && typeof source.repo == `string` && source.repo.trim())
    return `${(source.repo as string).trim()}${ref}`;
  if (sourceKind === `git` && typeof source.url == `string` && source.url.trim())
    return `${(source.url as string).trim()}${ref}`;
  if (sourceKind === `url` && typeof source.url == `string` && source.url.trim())
    return (source.url as string).trim();
  return undefined;
}
interface MarketplaceSource {
  id?: string;
  source: { source?: string; ref?: string; repo?: string; url?: string; [key: string]: unknown };
}
/** 原 DDt（js 126078-126085 / jsx 106896） */
function marketplaceSourcePayload(
  marketplace: MarketplaceSource,
): { marketplaceSourceInput?: string; marketplaceSourceArchive?: { marketplaceId: string; source: unknown } } {
  const input = marketplaceSourceInput(marketplace);
  if (input) return { marketplaceSourceInput: input };
  const kind = typeof marketplace.source.source == `string` ? marketplace.source.source : ``;
  return [`file`, `directory`, `settings`].includes(kind)
    ? { marketplaceSourceArchive: { marketplaceId: marketplace.id as string, source: marketplace.source } }
    : {};
}

interface PluginSyncServices {
  localPluginSyncService: LocalPluginSyncService;
  remotePluginSyncService: RemotePluginSyncService;
  localZCodeAgentService?: ZCodeAgentService | null;
  remoteZCodeAgentService?: ZCodeAgentService | null;
  localWorkspacePath?: string;
  remoteWorkspacePath: string;
  remoteWorkspaceIdentity?: string | null;
}
interface LocalPluginSyncService {
  listLocalUserPluginCandidates(): Promise<{ candidates: InlinePluginCandidate[] }>;
  exportPluginsArchive(args: { pluginIds: string[] }): Promise<{ archive: unknown }>;
  exportMarketplaceSourceArchive(args: {
    marketplaceId: string;
    pluginNames: string[];
    source: unknown;
  }): Promise<{ archive: unknown }>;
}
interface RemotePluginSyncService {
  listRemoteUserPluginStatuses(args: {
    plugins: Array<{ pluginId: string; directoryName: string }>;
  }): Promise<{ statuses: Array<{ pluginId: string; directoryName: string; exists?: boolean; path?: string; reason?: string }> }>;
  checkRemoteUserPluginWriteAccess(): Promise<{ ok: boolean; path?: string; error?: string }>;
  importPluginsArchive(args: { archive: unknown; overwrite: boolean }): Promise<{
    results: PluginSyncResultItem[];
  }>;
  importMarketplaceSourceArchive(args: { archive: unknown; overwrite: boolean }): Promise<{ path: string }>;
}
type ZCodeAgentScopeArgs = { workspacePath: string; workspaceIdentity?: string } & Record<string, unknown>;
interface ZCodeAgentService {
  getPluginsOverview(args: ZCodeAgentScopeArgs): Promise<{
    marketplaces: Array<MarketplaceSource & { id: string }>;
    installedPlugins: Array<Parameters<typeof buildMarketplaceCandidates>[0]["installedPlugins"][number]>;
  }>;
  listPlugins(args: ZCodeAgentScopeArgs): Promise<{
    plugins: Array<Parameters<typeof buildMarketplaceCandidates>[1][number]>;
  }>;
  installPlugin(args: Record<string, unknown>): Promise<{
    diagnostics: Array<{ severity: string; pluginId?: string; message: string }>;
    installedPlugins: Array<{ id: string; installPath?: string }>;
  }>;
  setPluginEnabled(args: Record<string, unknown>): Promise<unknown>;
  configurePlugin(args: Record<string, unknown>): Promise<unknown>;
  addPluginMarketplace(args: Record<string, unknown>): Promise<unknown>;
  cancelPluginOperation?(args: { operationId: string }): Promise<void>;
}

/** 原 ODt（js 126086-126110 / jsx 106909）：inline + marketplace 候选与状态合并加载 */
async function loadPluginSyncCandidates(e: PluginSyncServices): Promise<{
  candidates: PluginCandidate[];
  statuses: Array<{ candidateId: string; exists: boolean; path?: string; reason?: string; remoteMarketplaceExists?: boolean }>;
}> {
  const local = await e.localPluginSyncService.listLocalUserPluginCandidates();
  const inlineCandidates = local.candidates.map(toInlinePluginCandidate);
  const inlineStatuses = await e.remotePluginSyncService.listRemoteUserPluginStatuses({
    plugins: local.candidates.map((c) => ({ pluginId: c.pluginId, directoryName: c.directoryName })),
  });
  const inlineRows = mergeInlinePluginRows(local.candidates, inlineStatuses.statuses).map((row) => ({
    candidateId: row.candidate.id,
    exists: row.exists,
    ...(row.path ? { path: row.path } : {}),
    ...(row.reason ? { reason: row.reason } : {}),
  }));
  if (!e.localZCodeAgentService || !e.remoteZCodeAgentService)
    return { candidates: inlineCandidates, statuses: inlineRows };
  const [overview, pluginList, remoteOverview] = await Promise.all([
    e.localZCodeAgentService.getPluginsOverview({ workspacePath: e.localWorkspacePath as string }),
    e.localZCodeAgentService.listPlugins({ workspacePath: e.localWorkspacePath as string }),
    e.remoteZCodeAgentService.getPluginsOverview({
      workspacePath: e.remoteWorkspacePath,
      ...(e.remoteWorkspaceIdentity ? { workspaceIdentity: e.remoteWorkspaceIdentity } : {}),
    }),
  ]);
  const marketplaceCandidates = buildMarketplaceCandidates(overview, pluginList.plugins);
  return {
    candidates: [...hydratePluginOptions(inlineCandidates, pluginList.plugins), ...marketplaceCandidates],
    statuses: [...inlineRows, ...mapMarketplaceStatuses(marketplaceCandidates, remoteOverview)],
  };
}
/** 原 kDt（js 126111 / jsx 106948） */
function isPluginSyncStoppedError(e: unknown): e is RemotePluginSyncStoppedError {
  return e instanceof RemotePluginSyncStoppedError;
}
/** 原 ADt（js 126114-126125 / jsx 106951） */
function stoppedPluginResult(row: PluginSyncRow): PluginSyncResultItem {
  return {
    name: row.candidate.name,
    pluginId: row.candidate.pluginId,
    directoryName:
      row.candidate.kind === `inline`
        ? (row.candidate.inlineCandidate?.directoryName ?? row.candidate.name)
        : `${row.candidate.marketplace}/${row.candidate.name}`,
    status: `stopped`,
    error: `stop requested; stopped waiting for this plugin sync. Any remote RPC that already started may still finish on the remote target.`,
  };
}

interface PluginSyncProgressEvent {
  candidateId: string;
  pluginId: string;
  status: string;
  log: string;
  result?: PluginSyncResultItem;
}
interface PluginSyncProgressContext extends PluginSyncServices {
  onItemProgress?: (event: PluginSyncProgressEvent) => void;
  stopControl?: {
    isStopped(candidateId: string): boolean;
    waitForStop?(candidateId: string): Promise<void>;
    cancelOperation?(operationId: string): Promise<void>;
  };
  preparedMarketplaceSources?: Set<string>;
  selectedMarketplacePluginNames?: Map<string, string[]>;
}
interface PluginSyncContext extends PluginSyncProgressContext {
  rows: PluginSyncRow[];
}
/** 原 Y2（js 126126-126134 / jsx 106960） */
function emitPluginSyncProgress(
  ctx: PluginSyncProgressContext,
  row: PluginSyncRow,
  status: string,
  log: string,
  result?: PluginSyncResultItem,
): void {
  ctx.onItemProgress?.({
    candidateId: row.candidate.id,
    log,
    pluginId: row.candidate.pluginId,
    ...(result ? { result } : {}),
    status,
  });
}
/** 原 X2（js 126135-126137 / jsx 106971） */
function assertPluginSyncNotStopped(ctx: PluginSyncProgressContext, row: PluginSyncRow): void {
  if (ctx.stopControl?.isStopped(row.candidate.id)) throw new RemotePluginSyncStoppedError(row);
}
/** 原 Z2（js 126138-126166 / jsx 106974）：可停止的远端步骤竞速 */
async function runCancellableRemoteStep<T>(
  ctx: PluginSyncProgressContext,
  row: PluginSyncRow,
  label: string,
  run: (operationId: string) => Promise<T>,
  options: { cancellableRemoteOperation?: boolean } = {},
): Promise<T> {
  assertPluginSyncNotStopped(ctx, row);
  const operationId = makePluginSyncLogId(row);
  emitPluginSyncProgress(ctx, row, `syncing`, `${label} (${operationId})`);
  const operation = run(operationId);
  const stopSignal = ctx.stopControl?.waitForStop?.(row.candidate.id);
  return stopSignal
    ? await Promise.race([
        operation,
        stopSignal.then(async () => {
          if (options.cancellableRemoteOperation === true && ctx.stopControl?.cancelOperation) {
            emitPluginSyncProgress(ctx, row, `stopped`, `request cancel plugin sync operation ${operationId}`);
            try {
              await ctx.stopControl.cancelOperation(operationId);
              emitPluginSyncProgress(ctx, row, `stopped`, `cancel request sent for ${operationId}`);
            } catch (error) {
              emitPluginSyncProgress(
                ctx,
                row,
                `stopped`,
                `cancel request failed for ${operationId}: ${error instanceof Error ? error.message : String(error)}`,
              );
            }
          }
          throw new RemotePluginSyncStoppedError(row);
        }),
      ])
    : await operation;
}
/** 原 jDt（js 126167 / jsx 106992） */
function isFileLikeOptionSchema(schema: OptionSchema | undefined): boolean {
  return schema?.type === `file` || schema?.type === `directory`;
}
/**
 * 原 MDt（js 126170-126180 / jsx 106995）。
 * 原调用约定：MDt(value, localSchema, remoteSchema)——第 1 参为待校验值，
 * 第 2/3 参为本地/远端 option schema（含 type/sensitive）。
 */
function isPortableOptionValue(
  value: unknown,
  localSchema: OptionSchema | undefined,
  remoteSchema: OptionSchema | undefined,
): boolean {
  if (
    !localSchema ||
    !remoteSchema ||
    localSchema.sensitive === true ||
    remoteSchema.sensitive === true ||
    isFileLikeOptionSchema(localSchema) ||
    isFileLikeOptionSchema(remoteSchema)
  )
    return false;
  const kind = remoteSchema.type ?? localSchema.type;
  return kind === `boolean`
    ? typeof value == `boolean`
    : kind === `number`
      ? typeof value == `number`
      : kind === `string`
        ? typeof value == `string`
        : typeof value == `string` || typeof value == `number` || typeof value == `boolean`;
}
/** 原 NDt（js 126181-126187 / jsx 107000） */
function pickPortableOptions(
  options: PluginOptionsPayload,
  remote: { userConfig?: Record<string, unknown> },
): { options: Record<string, unknown>; skippedCount: number } {
  const picked: Record<string, unknown> = {};
  let skipped = 0;
  // 原 NDt：MDt(a, e.userConfig[i], t.userConfig?.[i])——值=configuredOptions 项
  for (const [key, configuredValue] of Object.entries(options.configuredOptions))
    if (
      isPortableOptionValue(
        configuredValue,
        options.userConfig[key] as OptionSchema | undefined,
        remote.userConfig?.[key] as OptionSchema | undefined,
      )
    )
      picked[key] = configuredValue;
    else skipped += 1;
  return { options: picked, skippedCount: skipped };
}
/** 原 PDt（js 126188-126191 / jsx 107009） */
function sameConfiguredOptions(previous: Record<string, unknown>, next: Record<string, unknown>): boolean {
  const entries = Object.entries(previous);
  return entries.length === Object.keys(next).length ? entries.every(([key, value]) => next[key] === value) : false;
}
/** 原 FDt（js 126192-126232 / jsx 107013）：可移植插件选项同步 */
async function syncPluginOptions(ctx: PluginSyncProgressContext, row: PluginSyncRow): Promise<void> {
  const options = row.candidate.pluginOptions;
  if (!options || Object.keys(options.configuredOptions).length === 0) return;
  const remote = ctx.remoteZCodeAgentService;
  if (!remote) {
    emitPluginSyncProgress(ctx, row, `syncing`, `skip plugin options: remote plugin service is not available`);
    return;
  }
  const scope = {
    workspacePath: ctx.remoteWorkspacePath,
    ...(ctx.remoteWorkspaceIdentity ? { workspaceIdentity: ctx.remoteWorkspaceIdentity } : {}),
  };
  const remotePlugin = (
    await runCancellableRemoteStep(ctx, row, `RPC plugins/list for options ${row.candidate.pluginId}`, (operationId) =>
      remote.listPlugins({ ...scope, operationId }),
    )
  ).plugins.find((p) => p.id === row.candidate.pluginId);
  if (!remotePlugin) {
    emitPluginSyncProgress(
      ctx,
      row,
      `syncing`,
      `skip plugin options: remote plugin schema not found for ${row.candidate.pluginId}`,
    );
    return;
  }
  const portable = pickPortableOptions(options, remotePlugin);
  if (portable.skippedCount > 0)
    emitPluginSyncProgress(ctx, row, `syncing`, `skipped ${portable.skippedCount} non-portable plugin option(s)`);
  const portableCount = Object.keys(portable.options).length;
  if (portableCount === 0) {
    emitPluginSyncProgress(ctx, row, `syncing`, `skip plugin options: no portable configured option values`);
    return;
  }
  const merged = { ...(remotePlugin.configuredOptions ?? {}), ...portable.options };
  if (sameConfiguredOptions(remotePlugin.configuredOptions ?? {}, merged)) {
    emitPluginSyncProgress(ctx, row, `syncing`, `plugin options already synced (${portableCount} portable option(s))`);
    return;
  }
  await runCancellableRemoteStep(
    ctx,
    row,
    `RPC plugins/configure ${portableCount} portable option(s) for ${row.candidate.pluginId}`,
    () => remote.configurePlugin({ ...scope, options: merged, pluginId: row.candidate.pluginId }),
  );
}
/** 原 IDt（js 126233-126274 / jsx 107053）：先 inline 后 marketplace 的同步管线 */
async function runPluginSyncPipeline(ctx: PluginSyncContext): Promise<{ results: PluginSyncResultItem[] }> {
  const results: PluginSyncResultItem[] = [];
  for (const row of ctx.rows) emitPluginSyncProgress(ctx, row, `queued`, `Queued plugin sync`);
  for (const row of ctx.rows)
    if (row.candidate.kind === `inline`)
      try {
        assertPluginSyncNotStopped(ctx, row);
        const inline = row.candidate.inlineCandidate;
        if (!inline) throw Error(`inline plugin metadata is not available`);
        const exported = await runCancellableRemoteStep(ctx, row, `export inline plugin ${row.candidate.pluginId}`, () =>
          ctx.localPluginSyncService.exportPluginsArchive({ pluginIds: [inline.id] }),
        );
        const imported = (
          await runCancellableRemoteStep(ctx, row, `import inline plugin ${row.candidate.pluginId} on remote`, () =>
            ctx.remotePluginSyncService.importPluginsArchive({ archive: exported.archive, overwrite: false }),
          )
        ).results[0];
        if (!imported) throw Error(`remote import did not return ${row.candidate.pluginId}`);
        if (imported.status === `synced`) await syncPluginOptions(ctx, row);
        results.push(imported);
        emitPluginSyncProgress(ctx, row, imported.status, `inline plugin ${imported.status}`, imported);
      } catch (error) {
        const item = isPluginSyncStoppedError(error)
          ? stoppedPluginResult(row)
          : {
              name: row.candidate.name,
              pluginId: row.candidate.pluginId,
              directoryName: row.candidate.inlineCandidate?.directoryName ?? row.candidate.name,
              status: `failed`,
              error: error instanceof Error ? error.message : String(error),
            };
        results.push(item);
        emitPluginSyncProgress(ctx, row, item.status, item.error ?? item.status, item);
      }
  const marketplaceNames = collectMarketplacePluginNames(ctx.rows);
  const prepared = new Set<string>();
  for (const row of ctx.rows)
    if (row.candidate.kind === `marketplace`)
      results.push(
        await runMarketplacePluginSync(
          { ...ctx, preparedMarketplaceSources: prepared, selectedMarketplacePluginNames: marketplaceNames },
          row,
        ),
      );
  return { results };
}
/** 原 RDt（js 126345-126354 / jsx 107150） */
function collectMarketplacePluginNames(rows: PluginSyncRow[]): Map<string, string[]> {
  const names = new Map<string, string[]>();
  for (const row of rows) {
    const meta = row.candidate.marketplacePlugin;
    if (row.candidate.kind !== `marketplace` || !meta) continue;
    const list = names.get(row.candidate.marketplace) ?? [];
    list.push(meta.pluginName);
    names.set(row.candidate.marketplace, list);
  }
  return names;
}
/** 原 zDt（js 126355-126392 / jsx 107160）：远端市场源准备（input 直加 / 归档镜像） */
async function prepareMarketplaceSource(
  ctx: PluginSyncProgressContext,
  row: PluginSyncRow,
  scope: Record<string, unknown>,
): Promise<void> {
  const candidate = row.candidate;
  const meta = candidate.marketplacePlugin;
  if (!meta) throw Error(`marketplace plugin metadata is not available`);
  const sourceInput = meta.marketplaceSourceInput;
  if (sourceInput) {
    await runCancellableRemoteStep(
      ctx,
      row,
      `RPC plugins/marketplace/add ${candidate.marketplace} from ${sourceInput}`,
      (operationId) =>
        (ctx.remoteZCodeAgentService as ZCodeAgentService).addPluginMarketplace({ ...scope, operationId, source: sourceInput }),
      { cancellableRemoteOperation: true },
    );
    return;
  }
  const archive = meta.marketplaceSourceArchive;
  if (!archive) throw Error(`marketplace source cannot be synchronized: ${candidate.marketplace}`);
  const exported = await runCancellableRemoteStep(ctx, row, `export marketplace source ${candidate.marketplace}`, () =>
    ctx.localPluginSyncService.exportMarketplaceSourceArchive({
      marketplaceId: archive.marketplaceId,
      pluginNames: ctx.selectedMarketplacePluginNames?.get(candidate.marketplace) ?? [meta.pluginName],
      source: archive.source,
    }),
  );
  const imported = await runCancellableRemoteStep(
    ctx,
    row,
    `import marketplace source ${candidate.marketplace} on remote`,
    () => ctx.remotePluginSyncService.importMarketplaceSourceArchive({ archive: exported.archive, overwrite: false }),
  );
  await runCancellableRemoteStep(
    ctx,
    row,
    `RPC plugins/marketplace/add mirrored ${candidate.marketplace} from ${imported.path}`,
    (operationId) =>
      (ctx.remoteZCodeAgentService as ZCodeAgentService).addPluginMarketplace({ ...scope, operationId, source: imported.path }),
    { cancellableRemoteOperation: true },
  );
}
/** 原 BDt（js 126393-126396 / jsx 107194） */
function formatInstallDiagnostics(
  diagnostics: Array<{ severity: string; pluginId?: string; message: string }>,
  pluginId: string,
): string | null {
  const blocking = diagnostics.filter((d) => d.severity !== `warning`);
  return blocking.length === 0 ? null : blocking.map((d) => `${d.pluginId ?? pluginId}: ${d.message}`).join(`; `);
}
/** 原 LDt（js 126275-126344 / jsx 107090）：marketplace 插件安装流 */
async function runMarketplacePluginSync(
  ctx: PluginSyncContext,
  row: PluginSyncRow,
): Promise<PluginSyncResultItem> {
  const candidate = row.candidate;
  const meta = candidate.marketplacePlugin;
  const directoryLabel = `${candidate.marketplace}/${candidate.name}`;
  try {
    assertPluginSyncNotStopped(ctx, row);
    if (!ctx.remoteZCodeAgentService || !meta) throw Error(`remote plugin install service is not available`);
    const remote = ctx.remoteZCodeAgentService;
    const scope = {
      workspacePath: ctx.remoteWorkspacePath,
      ...(ctx.remoteWorkspaceIdentity ? { workspaceIdentity: ctx.remoteWorkspaceIdentity } : {}),
    };
    if (!row.remoteMarketplaceExists && !ctx.preparedMarketplaceSources?.has(candidate.marketplace)) {
      await prepareMarketplaceSource(
        {
          localPluginSyncService: ctx.localPluginSyncService,
          onItemProgress: ctx.onItemProgress,
          remotePluginSyncService: ctx.remotePluginSyncService,
          remoteZCodeAgentService: remote,
          selectedMarketplacePluginNames: ctx.selectedMarketplacePluginNames,
          stopControl: ctx.stopControl,
          remoteWorkspacePath: ctx.remoteWorkspacePath,
        },
        row,
        scope,
      );
      ctx.preparedMarketplaceSources?.add(candidate.marketplace);
    }
    const installed = await runCancellableRemoteStep(
      ctx,
      row,
      `RPC plugins/install ${candidate.pluginId}`,
      (operationId) =>
        remote.installPlugin({
          ...scope,
          marketplace: candidate.marketplace,
          operationId,
          pluginName: meta.pluginName,
          scope: meta.scope,
        }),
      { cancellableRemoteOperation: true },
    );
    const diagnosticError = formatInstallDiagnostics(installed.diagnostics, candidate.pluginId);
    if (diagnosticError) throw Error(diagnosticError);
    const installedEntry = installed.installedPlugins.find((p) => p.id === candidate.pluginId);
    if (!installedEntry) throw Error(`remote install did not return ${candidate.pluginId}`);
    await runCancellableRemoteStep(
      ctx,
      row,
      `RPC plugins/setEnabled enabled=${String(candidate.enabled)} for ${candidate.pluginId}`,
      () => remote.setPluginEnabled({ ...scope, enabled: candidate.enabled, pluginId: candidate.pluginId }),
    );
    await syncPluginOptions(ctx, row);
    const item: PluginSyncResultItem = {
      name: candidate.name,
      pluginId: candidate.pluginId,
      directoryName: directoryLabel,
      status: `synced`,
      ...(installedEntry.installPath ? { path: installedEntry.installPath } : {}),
    };
    emitPluginSyncProgress(ctx, row, `synced`, `marketplace plugin synced`, item);
    return item;
  } catch (error) {
    const item = isPluginSyncStoppedError(error)
      ? stoppedPluginResult(row)
      : {
          name: candidate.name,
          pluginId: candidate.pluginId,
          directoryName: directoryLabel,
          status: `failed`,
          error: error instanceof Error ? error.message : String(error),
        };
    emitPluginSyncProgress(ctx, row, item.status, item.error ?? item.status, item);
    return item;
  }
}

/** 原 VDt（js 126397-126425 / jsx 107198）：插件同步标题 + 警告 tooltip */
function PluginSyncTitle() {
  const { intl } = useIntlContext();
  const [warningOpen, setWarningOpen] = React.useState(false);
  const warningTitle = intl.formatMessage({ id: `settings.plugins.remoteSync.warningTitle` });
  return (
    <DialogTitle className={`flex min-w-0 items-center gap-2 pr-8`}>
      <span className={`min-w-0 truncate`}>{intl.formatMessage({ id: `settings.plugins.remoteSync.title` })}</span>
      <Tooltip
        open={warningOpen}
        title={warningTitle}
        description={intl.formatMessage({ id: `settings.plugins.remoteSync.warningDescription` })}
        side="right"
        align="center"
      >
        <span
          aria-label={warningTitle}
          className={`inline-flex size-5 items-center justify-center rounded-full text-warning transition-colors hover:bg-hover hover:text-warning focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused`}
          onMouseEnter={() => setWarningOpen(true)}
          onMouseLeave={() => setWarningOpen(false)}
          role="img"
        >
          <IconCircleAlert className={`size-3.5`} aria-hidden="true" />
        </span>
      </Tooltip>
    </DialogTitle>
  );
}
/** 原 HDt（js 126426-126442 / jsx 107212） */
function PluginSyncShowExisting({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (v: boolean) => void }) {
  const { intl } = useIntlContext();
  return (
    <label className={`inline-flex h-6 cursor-pointer items-center gap-2 rounded-md px-1 text-ui-base text-foreground-subtle hover:text-foreground`}>
      <input type="checkbox" className={`size-4`} checked={checked} onChange={(e) => onCheckedChange(e.currentTarget.checked)} />
      <span>{intl.formatMessage({ id: `settings.plugins.remoteSync.showExisting` })}</span>
    </label>
  );
}
/** 原 UDt（js 126443-126465 / jsx 107223） */
function PluginSyncHeader({
  targetLabel,
  showExistingRemotePlugins,
  showExistingFilter,
  onShowExistingRemotePluginsChange,
}: {
  targetLabel: string;
  showExistingRemotePlugins: boolean;
  showExistingFilter: boolean;
  onShowExistingRemotePluginsChange: (v: boolean) => void;
}) {
  const { intl } = useIntlContext();
  return (
    <div className={`flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between`}>
      <p className={`min-w-0 break-words font-mono text-ui-base text-foreground-subtle`}>
        {intl.formatMessage({ id: `settings.plugins.remoteSync.target` }, { target: targetLabel })}
      </p>
      {showExistingFilter ? (
        <div className={`shrink-0`}>
          <PluginSyncShowExisting checked={showExistingRemotePlugins} onCheckedChange={onShowExistingRemotePluginsChange} />
        </div>
      ) : null}
    </div>
  );
}
/** 原 WDt（js 126466-126496 / jsx 107238） */
function PluginSyncSelectAll({
  selectedCount,
  totalSelectable,
  onSelectAll,
  onClearAll,
}: {
  selectedCount: number;
  totalSelectable: number;
  onSelectAll: () => void;
  onClearAll: () => void;
}) {
  const { intl } = useIntlContext();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const disabled = totalSelectable === 0;
  const checked = totalSelectable > 0 && selectedCount >= totalSelectable;
  const indeterminate = totalSelectable > 0 && selectedCount > 0 && selectedCount < totalSelectable;
  React.useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <label
      className={`inline-flex h-6 items-center gap-2 rounded-md px-1 text-ui-base text-foreground-subtle ${disabled ? `opacity-50` : `cursor-pointer hover:text-foreground`}`}
    >
      <input
        ref={inputRef}
        type="checkbox"
        className={`size-4`}
        checked={checked}
        disabled={disabled}
        aria-checked={indeterminate ? `mixed` : checked ? `true` : `false`}
        onChange={(e) => {
          if (e.currentTarget.checked) onSelectAll();
          else onClearAll();
        }}
      />
      <span>{intl.formatMessage({ id: `settings.plugins.remoteSync.selectAll` })}</span>
    </label>
  );
}

/** 原 GDt（js 126497-126607 / jsx 107259）：插件选择行列表 */
function PluginSyncRowList({
  rows,
  selectedIds,
  emptyMessageId = `settings.plugins.remoteSync.empty`,
  onToggle,
}: {
  rows: PluginSyncRow[];
  selectedIds: Set<string>;
  emptyMessageId?: string;
  onToggle: (id: string, checked: boolean) => void;
}) {
  const { intl } = useIntlContext();
  return rows.length === 0 ? (
    <div className={`rounded-lg border border-border bg-surface px-3 py-3 text-ui-base text-foreground-subtle`}>
      {intl.formatMessage({ id: emptyMessageId })}
    </div>
  ) : (
    <div className={`grid gap-2`}>
      {rows.map((row) => {
        const checkboxId = `remote-plugin-sync-${row.candidate.id}`;
        const labelId = `${checkboxId}-label`;
        const checked = !row.exists && selectedIds.has(row.candidate.id);
        const optionsSummary = summarizePluginOptions(row.candidate.pluginOptions);
        return (
          <label
            key={row.candidate.id}
            htmlFor={checkboxId}
            className={`grid grid-cols-[auto_auto_minmax(0,1fr)] gap-3 rounded-lg border border-border bg-surface px-3 py-2 text-ui-base ${row.exists ? `cursor-default` : `cursor-pointer hover:border-border-hover hover:bg-surface-hover`}`}
          >
            <input
              id={checkboxId}
              type="checkbox"
              aria-labelledby={labelId}
              className={`mt-1 size-4`}
              checked={checked}
              disabled={row.exists}
              onChange={(event) => onToggle(row.candidate.id, event.currentTarget.checked)}
            />
            <span className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-border text-foreground-subtle`} aria-hidden="true">
              <IconPuzzle className={`size-4`} />
            </span>
            <span className={`min-w-0`}>
              <span className={`flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1`}>
                <span id={labelId} className={`font-medium text-foreground`}>
                  {row.candidate.name}
                </span>
                {row.candidate.version ? (
                  <span className={`rounded-md bg-secondary px-1.5 py-0.5 text-ui-xs font-medium text-foreground-subtle`}>
                    {row.candidate.version}
                  </span>
                ) : null}
                {row.candidate.componentTypes.map((kind) => (
                  <span key={kind} className={`rounded-md bg-secondary px-1.5 py-0.5 text-ui-xs font-medium text-foreground-subtle`}>
                    {kind}
                  </span>
                ))}
                <span className={`rounded-md bg-secondary px-1.5 py-0.5 text-ui-xs font-medium text-foreground-subtle`}>
                  {row.candidate.kind === `inline` ? `inline` : row.candidate.marketplace}
                </span>
                {row.exists ? (
                  <span className={`text-ui-base text-foreground-subtlest`}>
                    {intl.formatMessage({ id: `settings.plugins.remoteSync.existing` })}
                  </span>
                ) : null}
              </span>
              {row.candidate.description ? (
                <span className={`mt-1 block text-ui-base text-foreground-subtle`}>{row.candidate.description}</span>
              ) : null}
              {row.candidate.path ? (
                <span className={`mt-1 block break-all font-mono text-ui-base text-foreground-subtlest`}>{row.candidate.path}</span>
              ) : null}
              {optionsSummary ? (
                <span className={`mt-1 block text-ui-xs text-foreground-subtle`}>
                  {intl.formatMessage(
                    { id: `settings.plugins.remoteSync.optionsSummary` },
                    { manual: String(optionsSummary.manualCount), syncable: String(optionsSummary.syncableCount) },
                  )}
                </span>
              ) : null}
            </span>
          </label>
        );
      })}
    </div>
  );
}

type PluginSyncStatus = "queued" | "syncing" | "synced" | "failed" | "stopped" | "skipped";

/** 原 KDt（js 126608-126630 / jsx 107287）：状态徽章 */
function PluginSyncStatusBadge({ status }: { status: PluginSyncStatus }) {
  const { intl } = useIntlContext();
  const label = intl.formatMessage({ id: `settings.plugins.remoteSync.${status}` });
  const icon =
    status === `synced` ? (
      <IconCircleCheck className={`size-3`} aria-hidden="true" />
    ) : status === `failed` ? (
      <IconCircleX className={`size-3`} aria-hidden="true" />
    ) : status === `stopped` ? (
      <IconCircleStop className={`size-3`} aria-hidden="true" />
    ) : null;
  return (
    <span
      className={cn(
        `inline-flex h-6 shrink-0 items-center gap-1 rounded-md border px-2 text-ui-xs font-medium`,
        status === `synced` && `border-success/30 bg-success/10 text-success dark:bg-success/14`,
        status === `failed` && `border-destructive/30 bg-destructive/10 text-destructive`,
        status === `stopped` && `border-warning/30 bg-warning/10 text-warning`,
        status === `skipped` && `border-border bg-secondary text-foreground-subtle`,
        (status === `queued` || status === `syncing`) && `border-border bg-secondary text-foreground-subtle`,
      )}
    >
      {icon}
      {label}
    </span>
  );
}

/** 原 qDt（js 126631-126666 / jsx 107302）：同步中日志 HoverCard tooltip */
function PluginSyncLogTooltip({ logs }: { logs: string[] }) {
  const { intl } = useIntlContext();
  const lines = logs.length > 0 ? logs : [`Queued plugin sync`];
  return (
    <HoverCard closeDelay={160} openDelay={120}>
      <HoverCardTrigger asChild>
        <span
          aria-label={intl.formatMessage({ id: `settings.plugins.remoteSync.logTooltip` })}
          className={`inline-flex size-6 cursor-help items-center justify-center rounded-md text-foreground-subtle hover:bg-hover hover:text-foreground`}
          role="img"
        >
          <IconLoaderCircle className={`size-3.5 animate-spin`} aria-hidden="true" />
        </span>
      </HoverCardTrigger>
      <HoverCardContent
        align="end"
        side="left"
        sideOffset={6}
        className={`flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2 bg-popover p-3 text-left`}
      >
        <div className={`text-ui-base font-medium text-popover-foreground`}>
          {intl.formatMessage({ id: `settings.plugins.remoteSync.logTooltip` })}
        </div>
        <pre className={`max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-md bg-secondary p-2 font-mono text-ui-xs/relaxed text-popover-foreground`}>
          {lines.join(`\n`)}
        </pre>
      </HoverCardContent>
    </HoverCard>
  );
}

/** 原 JDt（js 126667-126778 / jsx 107329）：同步进行中的逐行进度列表（含停止按钮） */
function PluginSyncProgressList({
  progressById,
  rows,
  onStop,
}: {
  progressById: Map<string, { logs: string[]; status: PluginSyncStatus; result?: PluginSyncResultItem }>;
  rows: PluginSyncRow[];
  onStop: (candidateId: string) => void;
}) {
  const { intl } = useIntlContext();
  return rows.length === 0 ? (
    <div className={`rounded-lg border border-border bg-surface px-3 py-3 text-ui-base text-foreground-subtle`}>
      {intl.formatMessage({ id: `settings.plugins.remoteSync.resultEmpty` })}
    </div>
  ) : (
    <div className={`grid gap-2`}>
      {rows.map((row) => {
        const progress = progressById.get(row.candidate.id) ?? { logs: [`Queued plugin sync`], status: `queued` as PluginSyncStatus };
        const optionsSummary = summarizePluginOptions(row.candidate.pluginOptions);
        const isActive = progress.status === `queued` || progress.status === `syncing`;
        return (
          <div
            key={row.candidate.id}
            className={`grid grid-cols-[auto_minmax(0,1fr)_auto] gap-3 rounded-lg border border-border bg-surface px-3 py-2 text-ui-base`}
          >
            <span className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-border text-foreground-subtle`} aria-hidden="true">
              <IconPuzzle className={`size-4`} />
            </span>
            <div className={`min-w-0`}>
              <div className={`flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1`}>
                <span className={`font-medium text-foreground`}>{row.candidate.name}</span>
                {row.candidate.version ? (
                  <span className={`rounded-md bg-secondary px-1.5 py-0.5 text-ui-xs font-medium text-foreground-subtle`}>
                    {row.candidate.version}
                  </span>
                ) : null}
                {row.candidate.componentTypes.map((kind) => (
                  <span key={kind} className={`rounded-md bg-secondary px-1.5 py-0.5 text-ui-xs font-medium text-foreground-subtle`}>
                    {kind}
                  </span>
                ))}
                <span className={`rounded-md bg-secondary px-1.5 py-0.5 text-ui-xs font-medium text-foreground-subtle`}>
                  {row.candidate.kind === `inline` ? `inline` : row.candidate.marketplace}
                </span>
              </div>
              {progress.result?.error ? (
                <div className={`mt-1 break-words text-ui-base text-destructive`}>{progress.result.error}</div>
              ) : row.candidate.path ? (
                <div className={`mt-1 break-all font-mono text-ui-base text-foreground-subtlest`}>{row.candidate.path}</div>
              ) : null}
              {optionsSummary && !progress.result?.error ? (
                <div className={`mt-1 text-ui-xs text-foreground-subtle`}>
                  {intl.formatMessage(
                    { id: `settings.plugins.remoteSync.optionsSummary` },
                    { manual: String(optionsSummary.manualCount), syncable: String(optionsSummary.syncableCount) },
                  )}
                </div>
              ) : null}
            </div>
            <div className={`flex shrink-0 items-start gap-1`}>
              {progress.status === `syncing` ? <PluginSyncLogTooltip logs={progress.logs} /> : null}
              <PluginSyncStatusBadge status={progress.status} />
              {isActive ? (
                <Tooltip title={intl.formatMessage({ id: `settings.plugins.remoteSync.stop` })} side="left">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={intl.formatMessage({ id: `settings.plugins.remoteSync.stop` })}
                    className={`text-foreground-subtle hover:text-warning`}
                    onClick={() => onStop(row.candidate.id)}
                  >
                    <IconCircleStop className={`size-3.5`} aria-hidden="true" />
                  </Button>
                </Tooltip>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** 原 YDt（js 126779-126825 / jsx 107362）：插件同步结果视图 */
function PluginSyncResultView({ result }: { result: { results?: PluginSyncResultItem[] } | null }) {
  const { intl } = useIntlContext();
  const results = result?.results ?? [];
  return results.length === 0 ? (
    <div className={`rounded-lg border border-border bg-surface px-3 py-3 text-ui-base text-foreground-subtle`}>
      {intl.formatMessage({ id: `settings.plugins.remoteSync.resultEmpty` })}
    </div>
  ) : (
    <div className={`overflow-hidden rounded-xl border border-border bg-card`}>
      <div className={`divide-y divide-border`}>
        {results.map((item) => (
          <div key={`${item.pluginId}-${item.directoryName}-${item.status}`} className={`grid grid-cols-[minmax(0,1fr)_auto] gap-3 px-4 py-3`}>
            <div className={`min-w-0`}>
              <div className={`truncate text-ui-base font-medium text-foreground`}>{item.name}</div>
              {item.error ? (
                <div className={`mt-0.5 break-words text-ui-base text-destructive`}>{item.error}</div>
              ) : item.path ? (
                <div className={`mt-0.5 truncate font-mono text-ui-xs text-foreground-subtlest`}>{item.path}</div>
              ) : null}
            </div>
            <PluginSyncStatusBadge status={item.status as PluginSyncStatus} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** 原 XDt（js 126826-127113 / jsx 107373）：插件同步对话框 */
function PluginSyncDialog(props: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  localPluginSyncService: LocalPluginSyncService;
  remotePluginSyncService: RemotePluginSyncService;
  localZCodeAgentService?: ZCodeAgentService | null;
  remoteZCodeAgentService?: ZCodeAgentService | null;
  remoteTarget: RemoteTarget;
  workspacePath: string;
  localWorkspacePath?: string;
  workspaceIdentity?: string | null;
  onSynced: () => Promise<void> | void;
}) {
  const { intl } = useIntlContext();
  const {
    localPluginSyncService,
    localWorkspacePath,
    localZCodeAgentService,
    onOpenChange,
    onSynced,
    open,
    remotePluginSyncService,
    remoteZCodeAgentService,
    remoteTarget,
    workspacePath,
    workspaceIdentity,
  } = props;
  const [phase, setPhase] = React.useState<SyncPhase>(`loading`);
  const [rows, setRows] = React.useState<PluginSyncRow[]>([]);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [showExisting, setShowExisting] = React.useState(true);
  const [result, setResult] = React.useState<{ results: PluginSyncResultItem[] } | null>(null);
  const [progressById, setProgressById] = React.useState<
    Map<string, { logs: string[]; status: PluginSyncStatus; result?: PluginSyncResultItem }>
  >(new Map());
  const [syncingRows, setSyncingRows] = React.useState<PluginSyncRow[]>([]);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const stoppedIdsRef = React.useRef<Set<string>>(new Set());
  const stopResolversRef = React.useRef<Map<string, () => void>>(new Map());
  const inFlightRef = React.useRef(false);
  React.useEffect(() => {
    if (!open) return;
    let disposed = false;
    setPhase(`loading`);
    setRows([]);
    setSelectedIds(new Set());
    setShowExisting(true);
    setResult(null);
    setProgressById(new Map());
    setSyncingRows([]);
    setErrorMessage(null);
    stoppedIdsRef.current = new Set();
    stopResolversRef.current = new Map();
    inFlightRef.current = false;
    (async () => {
      try {
        const { candidates, statuses } = await loadPluginSyncCandidates({
          localPluginSyncService,
          localWorkspacePath: localWorkspacePath ?? workspacePath,
          localZCodeAgentService,
          remotePluginSyncService,
          remoteWorkspaceIdentity: workspaceIdentity,
          remoteWorkspacePath: workspacePath,
          remoteZCodeAgentService,
        });
        if (disposed) return;
        const merged = mergePluginRows(candidates, statuses);
        setRows(merged);
        setSelectedIds(defaultPluginSelection(merged));
        setPhase(`selection`);
      } catch (error) {
        if (disposed) return;
        setErrorMessage(error instanceof Error ? error.message : String(error));
        setPhase(`selection`);
      }
    })();
    return () => {
      disposed = true;
    };
  }, [localPluginSyncService, localWorkspacePath, localZCodeAgentService, open, remotePluginSyncService, remoteZCodeAgentService, workspaceIdentity, workspacePath]);
  const visibleRows = React.useMemo(() => filterPluginRows(rows, showExisting), [rows, showExisting]);
  const selectableIds = React.useMemo(() => visibleRows.filter((r) => !r.exists).map((r) => r.candidate.id), [visibleRows]);
  const selectedAvailable = React.useMemo(() => selectableIds.filter((id) => selectedIds.has(id)), [selectedIds, selectableIds]);
  const selectedCount = selectedAvailable.length;
  const targetLabel = remoteSyncTargetLabel(remoteTarget, workspacePath);
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (canClosePluginSyncDialog(phase, next)) onOpenChange(next);
      }}
    >
      <DialogContent
        showCloseButton={phase !== `preflighting` && phase !== `syncing`}
        className={`h-[min(720px,calc(100dvh-2rem))] max-h-[min(720px,calc(100dvh-2rem))] max-w-2xl flex flex-col overflow-hidden`}
      >
        <DialogHeader>
          <PluginSyncTitle />
          <PluginSyncHeader
            targetLabel={targetLabel}
            showExistingRemotePlugins={showExisting}
            showExistingFilter={phase === `selection` && rows.length > 0}
            onShowExistingRemotePluginsChange={setShowExisting}
          />
        </DialogHeader>
        <div className={`min-h-0 flex-1 overflow-y-auto`}>
          {errorMessage ? (
            <div className={`mb-3 rounded-lg border border-destructive/40 bg-surface px-3 py-2 text-ui-base text-destructive`}>
              {errorMessage}
            </div>
          ) : null}
          {phase === `loading` ? (
            <div className={`flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-3 text-ui-base text-foreground-subtle`}>
              <IconLoaderCircle className={`size-3.5 animate-spin`} aria-hidden="true" />
              {intl.formatMessage({ id: `settings.plugins.remoteSync.loading` })}
            </div>
          ) : null}
          {phase === `preflighting` ? (
            <div className={`flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-3 text-ui-base text-foreground-subtle`}>
              <IconLoaderCircle className={`size-3.5 animate-spin`} aria-hidden="true" />
              {intl.formatMessage({ id: `settings.remoteSync.preflighting` })}
            </div>
          ) : null}
          {phase === `selection` ? (
            <PluginSyncRowList
              rows={visibleRows}
              selectedIds={selectedIds}
              emptyMessageId={rows.length > 0 ? `settings.plugins.remoteSync.filteredEmpty` : undefined}
              onToggle={(id, checked) => {
                setSelectedIds((prev) => {
                  const next = new Set(prev);
                  if (checked) next.add(id);
                  else next.delete(id);
                  return next;
                });
              }}
            />
          ) : null}
          {phase === `syncing` ? (
            <PluginSyncProgressList
              progressById={progressById}
              rows={syncingRows}
              onStop={(candidateId) => {
                stoppedIdsRef.current.add(candidateId);
                stopResolversRef.current.get(candidateId)?.();
                setProgressById((prev) => {
                  const next = new Map(prev);
                  const entry = next.get(candidateId) ?? { logs: [], status: `queued` as PluginSyncStatus };
                  next.set(candidateId, {
                    ...entry,
                    logs: [
                      ...entry.logs,
                      `stop requested; cancelling the active remote plugin operation when possible`,
                    ],
                    status: `stopped`,
                  });
                  return next;
                });
              }}
            />
          ) : null}
          {phase === `complete` ? <PluginSyncResultView result={result} /> : null}
        </div>
        <div className={`flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between`}>
          <div className={`text-ui-base text-foreground-subtle`}>
            {intl.formatMessage(
              { id: `settings.plugins.remoteSync.selectionCount` },
              { selected: String(selectedCount), total: String(selectableIds.length) },
            )}
          </div>
          <div className={`flex flex-wrap justify-end gap-2`}>
            {phase === `selection` ? (
              <PluginSyncSelectAll
                selectedCount={selectedCount}
                totalSelectable={selectableIds.length}
                onSelectAll={() => setSelectedIds(new Set(selectableIds))}
                onClearAll={() => setSelectedIds(new Set())}
              />
            ) : null}
            <Button
              type="button"
              size="sm"
              disabled={phase !== `selection` || selectedCount === 0}
              onClick={async () => {
                if (!canSubmitRemoteSync({ inFlight: inFlightRef.current, selectedCount: selectedAvailable.length })) {
                  if (selectedAvailable.length === 0)
                    setErrorMessage(intl.formatMessage({ id: `settings.plugins.remoteSync.noSelection` }));
                  return;
                }
                inFlightRef.current = true;
                setErrorMessage(null);
                setPhase(`preflighting`);
                const chosen = rows.filter((r) => !r.exists && selectedIds.has(r.candidate.id));
                try {
                  const preflight = await withRemoteSyncPreflightTimeout(() =>
                    remotePluginSyncService.checkRemoteUserPluginWriteAccess(),
                  );
                  if (!preflight.ok)
                    throw Error(
                      intl.formatMessage(
                        { id: `settings.remoteSync.preflightFailed` },
                        { path: preflight.path, error: preflight.error ?? `` },
                      ),
                    );
                } catch (error) {
                  setErrorMessage(
                    isRemoteSyncPreflightTimeoutError(error)
                      ? intl.formatMessage(
                          { id: `settings.remoteSync.preflightTimeout` },
                          { seconds: String(Math.ceil(error.timeoutMs / 1000)) },
                        )
                      : error instanceof Error
                        ? error.message
                        : String(error),
                  );
                  setPhase(`selection`);
                  inFlightRef.current = false;
                  return;
                }
                setPhase(`syncing`);
                setSyncingRows(chosen);
                setProgressById(
                  new Map(
                    chosen.map(
                      (row): [string, { logs: string[]; status: PluginSyncStatus; result?: PluginSyncResultItem }] => [
                        row.candidate.id,
                        { logs: [`Queued plugin sync`], status: `queued` as PluginSyncStatus },
                      ],
                    ),
                  ),
                );
                stoppedIdsRef.current = new Set();
                stopResolversRef.current = new Map();
                try {
                  const pipelineResult = await runPluginSyncPipeline({
                    localPluginSyncService,
                    onItemProgress: (event) => {
                      setProgressById((prev) => {
                        const next = new Map(prev);
                        const entry = next.get(event.candidateId) ?? { logs: [], status: `queued` as PluginSyncStatus };
                        next.set(event.candidateId, {
                          logs: [...entry.logs, event.log],
                          ...(event.result ? { result: event.result } : entry.result ? { result: entry.result } : {}),
                          status: event.status as PluginSyncStatus,
                        });
                        return next;
                      });
                    },
                    remotePluginSyncService,
                    remoteWorkspaceIdentity: workspaceIdentity,
                    remoteWorkspacePath: workspacePath,
                    remoteZCodeAgentService,
                    rows: chosen,
                    stopControl: {
                      cancelOperation: async (operationId) => {
                        if (remoteZCodeAgentService?.cancelPluginOperation)
                          await remoteZCodeAgentService.cancelPluginOperation({ operationId });
                      },
                      isStopped: (candidateId) => stoppedIdsRef.current.has(candidateId),
                      waitForStop: (candidateId) =>
                        stoppedIdsRef.current.has(candidateId)
                          ? Promise.resolve()
                          : new Promise<void>((resolve) => {
                              stopResolversRef.current.set(candidateId, resolve);
                            }),
                    },
                  });
                  await onSynced();
                  setResult(pipelineResult);
                  setPhase(`complete`);
                } catch (error) {
                  setErrorMessage(error instanceof Error ? error.message : String(error));
                  setPhase(`selection`);
                } finally {
                  inFlightRef.current = false;
                }
              }}
            >
              <IconCloudUpload className={`size-3.5`} aria-hidden="true" />
              {intl.formatMessage({ id: `settings.plugins.remoteSync.start` })}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ----------------------------------------------------------------------------
 * 2.4 分派器（原 r4，js 127248-127332 / jsx 107623）
 * --------------------------------------------------------------------------*/

/** 原 r4：按 canSync×open 三条件装配技能/MCP/插件三个同步对话框 */
export function RemoteSyncDialogs({
  canSyncSkills,
  canSyncMcp,
  canSyncPlugins = false,
  skillOpen,
  mcpOpen,
  pluginOpen = false,
  onSkillOpenChange,
  onMcpOpenChange,
  onPluginOpenChange,
  localSkillSyncService,
  remoteSkillSyncService,
  localMcpSyncService,
  remoteMcpSyncService,
  localPluginSyncService,
  remotePluginSyncService,
  localZCodeAgentService,
  remoteZCodeAgentService,
  remoteTarget,
  skillWorkspacePath,
  mcpWorkspacePath,
  pluginWorkspacePath,
  pluginLocalWorkspacePath,
  mcpLocalWorkspacePath,
  workspaceIdentity,
  onSkillsSynced,
  onMcpSynced,
  onPluginsSynced,
}: {
  canSyncSkills: boolean;
  canSyncMcp: boolean;
  canSyncPlugins?: boolean;
  skillOpen: boolean;
  mcpOpen: boolean;
  pluginOpen?: boolean;
  onSkillOpenChange: (v: boolean) => void;
  onMcpOpenChange: (v: boolean) => void;
  onPluginOpenChange: (v: boolean) => void;
  localSkillSyncService?: SkillSyncService | null;
  remoteSkillSyncService?: RemoteSkillSyncService | null;
  localMcpSyncService?: McpSyncService | null;
  remoteMcpSyncService?: RemoteMcpSyncService | null;
  localPluginSyncService?: LocalPluginSyncService | null;
  remotePluginSyncService?: RemotePluginSyncService | null;
  localZCodeAgentService?: ZCodeAgentService | null;
  remoteZCodeAgentService?: ZCodeAgentService | null;
  remoteTarget?: RemoteTarget | null;
  skillWorkspacePath: string;
  mcpWorkspacePath: string;
  pluginWorkspacePath: string;
  pluginLocalWorkspacePath?: string;
  mcpLocalWorkspacePath?: string;
  workspaceIdentity?: string | null;
  onSkillsSynced?: () => Promise<void> | void;
  onMcpSynced?: () => Promise<void> | void;
  onPluginsSynced?: () => Promise<void> | void;
}) {
  const skillServices =
    canSyncSkills && skillOpen && remoteTarget && localSkillSyncService && remoteSkillSyncService
      ? { localSkillSyncService, remoteSkillSyncService, remoteTarget }
      : null;
  const mcpServices =
    canSyncMcp && mcpOpen && remoteTarget && localMcpSyncService && remoteMcpSyncService
      ? { localMcpSyncService, remoteMcpSyncService, remoteTarget }
      : null;
  const pluginServices =
    canSyncPlugins && pluginOpen && remoteTarget && localPluginSyncService && remotePluginSyncService
      ? { localPluginSyncService, remotePluginSyncService, remoteTarget }
      : null;
  return (
    <>
      {skillServices ? (
        <SkillSyncDialog
          open={skillOpen}
          onOpenChange={onSkillOpenChange}
          localSkillSyncService={skillServices.localSkillSyncService}
          remoteSkillSyncService={skillServices.remoteSkillSyncService}
          remoteTarget={skillServices.remoteTarget}
          workspacePath={skillWorkspacePath}
          workspaceIdentity={workspaceIdentity}
          onSynced={onSkillsSynced ?? (() => {})}
        />
      ) : null}
      {mcpServices ? (
        <McpSyncDialog
          open={mcpOpen}
          onOpenChange={onMcpOpenChange}
          localMcpSyncService={mcpServices.localMcpSyncService}
          remoteMcpSyncService={mcpServices.remoteMcpSyncService}
          remoteTarget={mcpServices.remoteTarget}
          workspacePath={mcpWorkspacePath}
          localWorkspacePath={mcpLocalWorkspacePath}
          onSynced={onMcpSynced ?? (() => {})}
        />
      ) : null}
      {pluginServices ? (
        <PluginSyncDialog
          open={pluginOpen}
          onOpenChange={onPluginOpenChange ?? (() => {})}
          localPluginSyncService={pluginServices.localPluginSyncService}
          remotePluginSyncService={pluginServices.remotePluginSyncService}
          localZCodeAgentService={localZCodeAgentService}
          remoteZCodeAgentService={remoteZCodeAgentService}
          remoteTarget={pluginServices.remoteTarget}
          localWorkspacePath={pluginLocalWorkspacePath}
          workspacePath={pluginWorkspacePath ?? mcpWorkspacePath}
          workspaceIdentity={workspaceIdentity}
          onSynced={onPluginsSynced ?? (() => {})}
        />
      ) : null}
    </>
  );
}

/* ============================================================================
 * 3. 目录浏览器子族（原 MEt，js 123942-124126 / jsx 105724）
 * ----------------------------------------------------------------------------
 * 挂载方式（g8t，js 213152-213166）：p4 scope=`directory-browser`
 * resetKeys=[`directory-browser`] variant=`silent` 包裹；open 态由 App root 的
 * `ne/re` 控制，onSelect → handleSelectProject。p4=ScopedErrorBoundary 已在
 * WorkspaceShell.tsx 还原。
 * ==========================================================================*/

/** 原 OEt（js 123929 / jsx 105703） */
function buildReaddirParams(path: string, includeHidden: boolean): { path: string; includeHidden?: boolean } {
  return includeHidden ? { path, includeHidden: true } : { path };
}
/** 原 kEt（js 123932 / jsx 105711） */
function filterDirectories(entries: DirectoryEntry[]): DirectoryEntry[] {
  return entries.filter((e) => e.type === `directory`);
}
/** 原 AEt（js 123935 / jsx 105714） */
function resolveFolderIconKind(entry: DirectoryEntry): "folder-symlink" | "folder" {
  return entry.type === `directory` && entry.isSymbolicLink === true ? `folder-symlink` : `folder`;
}
/** 原 jEt（js 123938-123941 / jsx 105717）：请求序号令牌（竞态保护） */
function createRequestToken(): { begin(): number; isCurrent(token: number): boolean } {
  let current = 0;
  return {
    begin: () => ((current += 1), current),
    isCurrent: (token) => token === current,
  };
}

/**
 * 原 MEt（js 123942-124126 / jsx 105724）：目录浏览对话框。
 * embedded=true 时只返回内容体（供远程向导 directory 步复用）；
 * 否则自带 fixed 遮罩层（点击遮罩取消、Escape 取消）。
 */
export function DirectoryBrowserDialog({
  services,
  onSelect,
  onCancel,
  onPathChange,
  embedded = false,
}: {
  services: BaseServices;
  onSelect: (path: string) => void;
  onCancel: () => void;
  onPathChange?: (path: string) => void;
  embedded?: boolean;
}) {
  const [currentPath, setCurrentPath] = React.useState(``);
  const [pathInput, setPathInput] = React.useState(``);
  const [entries, setEntries] = React.useState<DirectoryEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState(``);
  const [showHidden, setShowHidden] = React.useState(false);
  const listRef = React.useRef<HTMLDivElement>(null);
  const showHiddenRef = React.useRef(false);
  const requestTokenRef = React.useRef(createRequestToken());
  const { intl } = useIntlContext();
  React.useEffect(() => {
    services.systemService
      .info()
      .then((info) => {
        loadDirectory(info.homedir);
      })
      .catch((error) => {
        logger.error(`[DirectoryBrowser] 获取系统信息失败:`, error);
        setErrorMessage(intl.formatMessage({ id: `directoryBrowser.errorSystem` }));
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const loadDirectory = async (path: string, includeHidden = showHiddenRef.current) => {
    const token = requestTokenRef.current.begin();
    setLoading(true);
    setErrorMessage(``);
    try {
      const listing = await services.fileService.readdir(buildReaddirParams(path, includeHidden));
      if (!requestTokenRef.current.isCurrent(token)) return;
      setEntries(filterDirectories(listing));
      setCurrentPath(path);
      setPathInput(path);
      onPathChange?.(path);
      listRef.current?.scrollTo(0, 0);
    } catch (error) {
      if (!requestTokenRef.current.isCurrent(token)) return;
      logger.error(`[DirectoryBrowser] readdir 失败:`, error);
      setErrorMessage(intl.formatMessage({ id: `directoryBrowser.errorReadDir` }, { error: String(error) }));
    } finally {
      if (requestTokenRef.current.isCurrent(token)) setLoading(false);
    }
  };
  const goUp = () => {
    loadDirectory(currentPath.replace(/\/[^/]+\/?$/, ``) || `/`);
  };
  const submitPath = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = pathInput.trim();
    if (trimmed) loadDirectory(trimmed);
  };
  const toggleHidden = () => {
    const next = !showHiddenRef.current;
    showHiddenRef.current = next;
    setShowHidden(next);
    if (currentPath) loadDirectory(currentPath, next);
  };
  const confirmSelection = () => {
    const trimmed = currentPath.trim();
    if (!trimmed || loading) return;
    onSelect(trimmed);
  };
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === `Escape`) onCancel();
  };
  const content = (
    <div className={`flex min-h-0 flex-1 flex-col gap-3`}>
      <div>
        <div className={`mb-1 block text-ui-base text-foreground-subtle`}>
          {intl.formatMessage({ id: `directoryBrowser.title` })}
        </div>
        <form onSubmit={submitPath} className={`flex flex-col gap-2 sm:flex-row`}>
          <Input
            type="text"
            size="lg"
            value={pathInput}
            onChange={(event) => setPathInput(event.target.value)}
            placeholder={intl.formatMessage({ id: `directoryBrowser.pathPlaceholder` })}
            className={`h-9 min-w-0 flex-1 text-ui-base`}
            autoFocus
          />
          <div className={`flex gap-2 sm:shrink-0`}>
            <Button type="submit" size="lg" className={`h-9 min-w-0 flex-1 px-4 text-ui-base sm:flex-none`}>
              {intl.formatMessage({ id: `directoryBrowser.go` })}
            </Button>
            <Button
              type="button"
              variant={showHidden ? `secondary` : `outline`}
              size="lg"
              aria-pressed={showHidden}
              className={`h-9 min-w-0 flex-1 px-3 text-ui-base sm:flex-none`}
              onClick={toggleHidden}
            >
              {intl.formatMessage({
                id: showHidden ? `directoryBrowser.hideHidden` : `directoryBrowser.showHidden`,
              })}
            </Button>
          </div>
        </form>
      </div>
      {errorMessage ? <div className={`text-ui-base text-destructive`}>{errorMessage}</div> : null}
      <div ref={listRef} className={`flex-1 flex flex-col overflow-y-auto rounded-lg border border-border bg-background`}>
        {currentPath && currentPath !== `/` ? (
          <button
            onClick={goUp}
            className={`flex h-10 w-full shrink-0 cursor-pointer items-center gap-2 border-b border-border px-3 text-left text-ui-base transition hover:bg-hover/50`}
          >
            <IconFolder className={`size-4 shrink-0 text-foreground-subtle`} />
            <span className={`text-foreground`}>..</span>
          </button>
        ) : null}
        {loading ? (
          <div className={`p-4 text-center text-ui-base text-foreground-subtle`}>
            {intl.formatMessage({ id: `common.loading` })}
          </div>
        ) : entries.length === 0 ? (
          <div className={`p-4 text-center text-ui-base text-foreground-subtle`}>
            {intl.formatMessage({ id: `directoryBrowser.noSubdirs` })}
          </div>
        ) : (
          entries.map((entry) => (
            <button
              key={entry.path}
              onClick={() => loadDirectory(entry.path)}
              className={`flex w-full shrink-0 cursor-pointer items-center gap-2 px-3 py-2 text-left text-ui-base transition hover:bg-hover/50`}
            >
              {resolveFolderIconKind(entry) === `folder-symlink` ? (
                <IconFolderSymlink className={`size-4 shrink-0 text-foreground-subtle`} />
              ) : (
                <IconFolder className={`size-4 shrink-0 text-foreground-subtle`} />
              )}
              <span className={`truncate`}>{entry.name}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
  return embedded ? (
    content
  ) : (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm`}
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
      onKeyDown={handleKeyDown}
    >
      <div className={`flex h-[min(36rem,calc(100vh-4rem))] w-[min(44rem,calc(100vw-2rem))] flex-col rounded-xl border border-border bg-popover p-4 shadow-xl`}>
        {content}
        <div className={`mt-3 flex shrink-0 justify-end gap-2`}>
          <Button type="button" variant="secondary" size="lg" className={`h-10 min-w-0 px-5 text-ui-base`} onClick={onCancel}>
            {intl.formatMessage({ id: `common.cancel` })}
          </Button>
          <Button
            type="button"
            size="lg"
            className={`h-10 min-w-0 px-5 text-ui-base`}
            disabled={!currentPath.trim() || loading}
            onClick={confirmSelection}
          >
            {intl.formatMessage({ id: `directoryBrowser.selectDir` })}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * 4. Onboarding 对话框子族（原 E3t，js 208252-208536 / jsx 165388；
 *    向导支撑 206927-208251）
 * ----------------------------------------------------------------------------
 * 挂载方式（g8t，js 213222-213233）：p4 scope=`onboarding-dialog`
 * resetKeys=[workspaceIdentity || workspacePath] variant=`silent`。
 * 远端数据钩子 R7（useImportSelections，193347）/ I2t（useSessionMigrationScanner，
 * 203145）与共享视图 v$t（ImportSelectionView，193680）在 Settings 迁移页复用，
 * 此处接口级声明（见 §0）。
 * ==========================================================================*/

/** 原 $4t（js 206927 / jsx 164536） */
const ONBOARDING_TASK_STAGGER_MS = 320;

interface OnboardingTask {
  id: string;
  agent: string;
  category: string;
  discoveredCount?: number;
  status: "pending" | "running" | "imported" | "skipped" | "failed";
}
interface OnboardingDiscovery {
  agents: Array<{
    agent: string;
    categories: Array<{
      category: string;
      discoveredCount: number;
      importableCount: number;
      selectedByDefault: boolean;
    }>;
  }>;
}
interface OnboardingControllerState {
  open: boolean;
  loading: boolean;
  importing: boolean;
  step: string;
  discovery: OnboardingDiscovery | null;
  selectedKeys: string[];
  tasks: OnboardingTask[];
  result: {
    successCount: number;
    skippedCount: number;
    failedCount: number;
    taskResults: Array<{ agent: string; category: string; status: string; importedCount: number; skippedCount: number; failedCount: number }>;
  } | null;
  error: string | null;
}

/** 原 F9（js 206928-206940 / jsx 164537） */
function initialOnboardingState(): OnboardingControllerState {
  return {
    open: false,
    loading: false,
    importing: false,
    step: `selection`,
    discovery: null,
    selectedKeys: [],
    tasks: [],
    result: null,
    error: null,
  };
}
/** 原 I9（js 206941 / jsx 164550） */
function selectionKey(agent: string, category: string): string {
  return `${agent}:${category}`;
}
/** 原 e3t（js 206946 / jsx 164553） */
function defaultProviderCategories(): string[] {
  return [`providers`];
}
/** 原 t3t（js 206947-206963 / jsx 164556）：补齐 providers 类别 */
function normalizeDiscovery(discovery: OnboardingDiscovery): OnboardingDiscovery {
  return {
    agents: discovery.agents.map((agent) => {
      const byCategory = new Map(
        agent.categories.map((c): [string, (typeof agent.categories)[number]] => [c.category, c]),
      );
      const ensured = defaultProviderCategories().map(
        (category) =>
          byCategory.get(category) || {
            category,
            discoveredCount: 0,
            importableCount: 0,
            selectedByDefault: false,
          },
      );
      return { ...agent, categories: ensured };
    }),
  };
}
/** 原 n3t（js 206964-206970 / jsx 164573） */
function defaultSelectedKeys(discovery: OnboardingDiscovery): string[] {
  return discovery.agents.flatMap((agent) =>
    agent.categories
      .filter((c) => c.selectedByDefault && c.discoveredCount > 0)
      .map((c) => selectionKey(agent.agent, c.category)),
  );
}
/** 原 r3t（js 206971-206984 / jsx 164576） */
function discoveryToTasks(discovery: OnboardingDiscovery, selectedKeys: string[]): OnboardingTask[] {
  const selected = new Set(selectedKeys);
  return discovery.agents.flatMap((agent) =>
    agent.categories
      .filter((c) => selected.has(selectionKey(agent.agent, c.category)))
      .map((c) => ({
        id: selectionKey(agent.agent, c.category),
        agent: agent.agent,
        category: c.category,
        discoveredCount: c.discoveredCount,
        status: `pending` as const,
      })),
  );
}
/** 原 i3t（js 206985-206990 / jsx 164586） */
function parseSelectionKeys(keys: string[]): Array<{ agent: string; category: string }> {
  return keys.map((key) => {
    const [agent, category] = key.split(`:`);
    return { agent, category };
  });
}
/** 原 a3t（js 206991-207004 / jsx 164595） */
function additionalSelectionsToTasks(
  selections: Array<{
    agent: string;
    category: string;
    sourceScope?: string;
    targetScope?: string;
    skillPaths?: unknown[];
    commandPaths?: unknown[];
    pluginPaths?: unknown[];
    mcpServerPaths?: unknown[];
  }>,
): OnboardingTask[] {
  return selections.map((selection, index) => ({
    id: `${selection.agent}:${selection.category}:${selection.sourceScope ?? `all`}:${selection.targetScope ?? `auto`}:${index}`,
    agent: selection.agent,
    category: selection.category,
    discoveredCount:
      selection.skillPaths?.length ??
      selection.commandPaths?.length ??
      selection.pluginPaths?.length ??
      selection.mcpServerPaths?.length ??
      1,
    status: `pending`,
  }));
}
/** 原 L9（js 207005 / jsx 164604） */
function errorMessageText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
/** 原 o3t（js 207008-207018 / jsx 164607） */
function applyImportTaskResults(tasks: OnboardingTask[], result: NonNullable<OnboardingControllerState["result"]>): OnboardingTask[] {
  const byKey = new Map<string, Array<{ status: string }>>();
  for (const taskResult of result.taskResults) {
    const key = `${taskResult.agent}:${taskResult.category}`;
    byKey.set(key, [...(byKey.get(key) ?? []), taskResult]);
  }
  return tasks.map((task) => {
    const hit = byKey.get(`${task.agent}:${task.category}`)?.shift();
    return hit ? { ...task, status: hit.status as OnboardingTask["status"] } : { ...task, status: `skipped` as const };
  });
}

interface SettingsSyncService {
  detect(args: { workspacePath: string; workspaceIdentity?: string }): Promise<OnboardingDiscovery>;
  getFirstRunPromptState(): Promise<{ handled: boolean }>;
  markFirstRunPromptHandled(): Promise<void>;
  importSelected(args: {
    workspacePath: string;
    workspaceIdentity?: string;
    selections: Array<{ agent: string; category: string }>;
  }): Promise<NonNullable<OnboardingControllerState["result"]>>;
  getClaudeAgentsFileMigrationStatus(args: {
    workspacePath?: string;
    workspaceIdentity?: string;
  }): Promise<AgentsFileMigrationStatus | null>;
  copyClaudeAgentsFileToZcodeAgentsFile(args: {
    workspacePath?: string;
    workspaceIdentity?: string;
    overwrite: boolean;
  }): Promise<AgentsFileMigrationStatus & { status?: string }>;
}
interface AgentsFileMigrationStatus {
  supported: boolean;
  sourcePath?: string;
  targetPath?: string;
}

/**
 * 原 s3t（js 207019-207295 / jsx 164624）：onboarding 对话框控制器。
 * 首运行探测（getFirstRunPromptState → detect）→ 打开 selection 步；
 * startImport 走 importSelected 并按 $4t 逐任务推进动画。
 */
function useOnboardingDialogController(e: { workspacePath?: string; workspaceIdentity?: string }) {
  const { settingsSyncService, modelProviderService } = useServices() as BaseServices & {
    settingsSyncService: SettingsSyncService;
  };
  const sessionService = useZcodeSessionService(e.workspacePath, undefined, e.workspaceIdentity);
  const importRunRef = React.useRef(0);
  const [state, setState] = React.useState<OnboardingControllerState>(initialOnboardingState);
  const reloadDiscovery = React.useCallback(
    async (mode: "firstRun" | "manual" = `firstRun`) => {
      if (!e.workspacePath) return;
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const discovery = normalizeDiscovery(
          await settingsSyncService.detect({
            workspacePath: e.workspacePath,
            workspaceIdentity: e.workspaceIdentity,
          }),
        );
        if (discovery.agents.length === 0) {
          if (mode === `manual`) {
            setState((prev) => ({
              ...prev,
              open: true,
              loading: false,
              step: `selection`,
              discovery,
              selectedKeys: [],
              tasks: [],
              result: null,
              error: null,
            }));
            logger.info(`[settings-sync] discovery empty, keep onboarding open (manual)`, {
              workspacePath: e.workspacePath,
            });
            return;
          }
          await settingsSyncService.markFirstRunPromptHandled();
          setState(initialOnboardingState());
          logger.info(`[settings-sync] discovery empty, prompt handled`, {
            workspacePath: e.workspacePath,
          });
          return;
        }
        const selected = defaultSelectedKeys(discovery);
        setState((prev) => ({
          ...prev,
          open: true,
          loading: false,
          step: `selection`,
          discovery,
          selectedKeys: selected,
          tasks: [],
          result: null,
          error: null,
        }));
        logger.info(`[settings-sync] discovery loaded`, {
          workspacePath: e.workspacePath,
          agentCount: discovery.agents.length,
          selectedCount: selected.length,
        });
      } catch (error) {
        const message = errorMessageText(error);
        logger.error(`[settings-sync] discovery failed`, {
          workspacePath: e.workspacePath,
          error: message,
        });
        setState((prev) => ({ ...prev, open: true, loading: false, error: message }));
      }
    },
    [e.workspaceIdentity, e.workspacePath, settingsSyncService],
  );
  React.useEffect(() => {
    if (!e.workspacePath) {
      setState(initialOnboardingState());
      return;
    }
    let disposed = false;
    (async () => {
      try {
        const promptState = await settingsSyncService.getFirstRunPromptState();
        if (disposed) return;
        if (promptState.handled) {
          setState(initialOnboardingState());
          return;
        }
        await reloadDiscovery();
      } catch (error) {
        const message = errorMessageText(error);
        logger.error(`[settings-sync] first run prompt state failed`, {
          workspacePath: e.workspacePath,
          error: message,
        });
        if (disposed) return;
        setState((prev) => ({ ...prev, open: true, loading: false, error: message }));
      }
    })();
    return () => {
      disposed = true;
    };
  }, [reloadDiscovery, e.workspacePath, settingsSyncService]);
  const selectedCount = state.selectedKeys.length;
  const taskProgress = React.useMemo(() => {
    if (state.tasks.length === 0) return 0;
    const done = state.tasks.filter((t) => t.status !== `pending` && t.status !== `running`).length;
    return Math.round((done / state.tasks.length) * 100);
  }, [state.tasks]);
  const close = React.useCallback(() => {
    importRunRef.current += 1;
    setState((prev) => ({ ...prev, open: false, importing: false }));
    settingsSyncService.markFirstRunPromptHandled().catch((error) => {
      logger.error(`[settings-sync] mark first run prompt handled failed`, {
        workspacePath: e.workspacePath,
        error: errorMessageText(error),
      });
    });
  }, [e.workspacePath, settingsSyncService]);
  const reopen = React.useCallback(() => {
    setState((prev) => {
      if (!prev.discovery && !prev.loading && e.workspacePath) reloadDiscovery(`manual`);
      return { ...prev, open: true };
    });
  }, [reloadDiscovery, e.workspacePath]);
  const toggleSelection = React.useCallback((key: string) => {
    setState((prev) => {
      const next = new Set(prev.selectedKeys);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return { ...prev, selectedKeys: [...next] };
    });
  }, []);
  const setAgentSelection = React.useCallback((agent: string, selected: boolean) => {
    setState((prev) => {
      if (!prev.discovery) return prev;
      const next = new Set(prev.selectedKeys);
      const entry = prev.discovery.agents.find((a) => a.agent === agent);
      if (!entry) return prev;
      for (const category of entry.categories) {
        const key = selectionKey(agent, category.category);
        if (selected) next.add(key);
        else next.delete(key);
      }
      return { ...prev, selectedKeys: [...next] };
    });
  }, []);
  const setCategorySelectionAllAgents = React.useCallback((category: string, selected: boolean) => {
    setState((prev) => {
      if (!prev.discovery) return prev;
      const next = new Set(prev.selectedKeys);
      for (const agent of prev.discovery.agents) {
        if (!agent.categories.some((c) => c.category === category)) continue;
        const key = selectionKey(agent.agent, category);
        if (selected) next.add(key);
        else next.delete(key);
      }
      return { ...prev, selectedKeys: [...next] };
    });
  }, []);
  const runImport = React.useCallback(
    async (additional: Array<{ agent: string; category: string }> = [], options: { includeCurrentSelections?: boolean } = {}) => {
      if (!e.workspacePath) return;
      const includeCurrent = options.includeCurrentSelections ?? true;
      const selections = [...(includeCurrent && state.discovery ? parseSelectionKeys(state.selectedKeys) : []), ...additional];
      if (selections.length === 0) return;
      const runId = importRunRef.current + 1;
      importRunRef.current = runId;
      const tasks =
        state.discovery && includeCurrent
          ? [...discoveryToTasks(state.discovery, state.selectedKeys), ...additionalSelectionsToTasks(additional)]
          : additionalSelectionsToTasks(selections);
      setState((prev) => ({ ...prev, importing: true, step: `importing`, tasks, result: null, error: null }));
      logger.info(`[settings-sync] import started`, {
        workspacePath: e.workspacePath,
        selections,
      });
      const importPromise = settingsSyncService.importSelected({
        workspacePath: e.workspacePath,
        workspaceIdentity: e.workspaceIdentity,
        selections,
      });
      for (let index = 0; index < tasks.length; index += 1) {
        if (importRunRef.current !== runId) return;
        const task = tasks[index];
        if (task)
          setState((prev) => ({
            ...prev,
            tasks: prev.tasks.map((t) => (t.id === task.id ? { ...t, status: `running` } : t)),
          }));
        await new Promise((resolve) => setTimeout(resolve, ONBOARDING_TASK_STAGGER_MS));
      }
      try {
        const result = await importPromise;
        if (importRunRef.current !== runId) return;
        if (selections.some((s) => s.category === `providers`))
          try {
            invalidateModelProviderSnapshot(await modelProviderService.getAll(), { invalidateInFlightRefresh: true });
          } catch (error) {
            logger.error(`[settings-sync] refresh model providers after import failed`, {
              workspacePath: e.workspacePath,
              error: errorMessageText(error),
            });
          }
        if (selections.some((s) => s.category === `skills`))
          await refreshSkillContexts({
            zcodeSessionService: sessionService,
            workspacePath: e.workspacePath,
            workspaceIdentity: e.workspaceIdentity,
            reason: `settings-sync-skill-import`,
          });
        setState((prev) => ({
          ...prev,
          importing: false,
          step: `complete`,
          result,
          tasks: applyImportTaskResults(prev.tasks, result),
        }));
        logger.info(`[settings-sync] import completed`, {
          workspacePath: e.workspacePath,
          result,
        });
      } catch (error) {
        const message = errorMessageText(error);
        if (importRunRef.current !== runId) return;
        logger.error(`[settings-sync] import failed`, { workspacePath: e.workspacePath, error: message });
        setState((prev) => ({
          ...prev,
          importing: false,
          step: `complete`,
          error: message,
          tasks: prev.tasks.map((t) => ({ ...t, status: `failed` })),
          result: {
            successCount: 0,
            skippedCount: 0,
            failedCount: prev.tasks.length,
            taskResults: prev.tasks.map((t) => ({
              agent: t.agent,
              category: t.category,
              status: `failed`,
              importedCount: 0,
              skippedCount: 0,
              failedCount: 1,
            })),
          },
        }));
      }
    },
    [e.workspaceIdentity, e.workspacePath, modelProviderService, settingsSyncService, sessionService, state.discovery, state.selectedKeys],
  );
  const startImport = React.useCallback(async () => {
    await runImport();
  }, [runImport]);
  const finish = React.useCallback(() => {
    close();
  }, [close]);
  return {
    state,
    selectedCount,
    taskProgress,
    actions: {
      close,
      reopen,
      reloadDiscovery,
      toggleSelection,
      setAgentSelection,
      setCategorySelectionAllAgents,
      startImport,
      startImportWithAdditionalSelections: runImport,
      finish,
    },
  };
}

/** 原 c3t（js 207290-207295 / jsx 164907） */
const ONBOARDING_WIZARD_STEPS = [
  { key: `session`, index: 1, titleId: `onboarding.step.session` },
  { key: `skills-import`, index: 2, titleId: `onboarding.step.skillsImport` },
  { key: `mcp-import`, index: 3, titleId: `onboarding.step.mcpImport` },
  { key: `commands-import`, index: 4, titleId: `onboarding.step.commandsImport` },
  { key: `agents-file`, index: 5, titleId: `onboarding.step.agentsFile` },
  { key: `migration`, index: 6, titleId: `onboarding.step.migration` },
] as const;
type OnboardingWizardStepKey = (typeof ONBOARDING_WIZARD_STEPS)[number]["key"];

/** 原 l3t（js 207296-207311 / jsx 164932） */
function onboardingStepTitleKey(step: OnboardingWizardStepKey): string {
  switch (step) {
    case `session`:
      return `session`;
    case `skills-import`:
      return `skillsImport`;
    case `mcp-import`:
      return `mcpImport`;
    case `commands-import`:
      return `commandsImport`;
    case `agents-file`:
      return `agentsFile`;
    case `migration`:
      return `migration`;
  }
}
/** 原 u3t（js 207312-207371 / jsx 164948）：左侧步骤栏 */
function OnboardingStepRail({ currentStep }: { currentStep: OnboardingWizardStepKey }) {
  const { intl } = useIntlContext();
  const currentIndex = ONBOARDING_WIZARD_STEPS.findIndex((s) => s.key === currentStep);
  return (
    <aside className={`flex w-56 shrink-0 flex-col gap-2 p-1`}>
      <div className={`flex h-full flex-col gap-4 rounded-xl border border-border bg-surface p-4`}>
        <div className={`text-ui-base font-medium uppercase tracking-wide text-foreground-subtle`}>
          {intl.formatMessage({ id: `onboarding.wizard.label` })}
        </div>
        <div className={`space-y-2`}>
          {ONBOARDING_WIZARD_STEPS.map((step, index) => {
            const active = step.key === currentStep;
            const done = index < currentIndex;
            return (
              <div
                key={step.key}
                className={cn(
                  `flex items-center gap-3 rounded-xl border-0 px-3 py-3 transition-colors`,
                  active ? `border-border-hover bg-card` : done ? `border-transparent bg-background-alt` : `border-transparent bg-transparent`,
                )}
              >
                <div
                  className={cn(
                    `flex size-6 shrink-0 items-center justify-center rounded-full border text-ui-base font-mono font-semibold`,
                    active
                      ? `bg-primary text-primary-foreground`
                      : done
                        ? `border-success bg-success text-success-foreground`
                        : `border-border bg-background text-foreground-subtle`,
                  )}
                >
                  {done ? <IconCheck className={`size-4`} /> : index + 1}
                </div>
                <div className={`min-w-0`}>
                  <div className={cn(`text-ui-base font-medium`, active || done ? `text-foreground` : `text-foreground-subtle`)}>
                    {intl.formatMessage({ id: step.titleId })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
/** 原 d3t（js 207372-207385 / jsx 164963） */
function OnboardingStepHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className={`space-y-2`}>
      <div className={`text-lg font-medium text-foreground`}>{title}</div>
      {description.trim().length > 0 ? (
        <div className={`text-ui-base leading-6 text-foreground-subtle`}>{description}</div>
      ) : null}
    </div>
  );
}
/** 原 p3t（js 207511 / jsx 164993） */
function isSettingsImportStep(step: OnboardingWizardStepKey): boolean {
  return step === `skills-import` || step === `mcp-import` || step === `commands-import`;
}
/** 原 f3t（js 207386-207510 / jsx 164966）：向导底部导航 */
function OnboardingWizardFooter(e: {
  currentStep: OnboardingWizardStepKey;
  selectedWorkspaceCount: number;
  settingsTaskCount: number;
  finishRunning: boolean;
  finishReady: boolean;
  onBackToWelcome: () => void;
  onBackStep: () => void;
  onNextStep: () => void;
  onBeginMigration: () => void;
  onFinish: () => void;
  beginMigrationDisabled: boolean;
}) {
  const { intl } = useIntlContext();
  const showsBackAndNext = isSettingsImportStep(e.currentStep);
  return (
    <div className={`flex items-center justify-between gap-3`}>
      <div className={`flex min-w-0 flex-1 items-center gap-2`}>
        <span className={`min-w-0 truncate text-ui-base text-foreground-subtle`}>
          {e.currentStep === `session`
            ? intl.formatMessage(
                { id: `onboarding.footer.workspaceSelection` },
                { count: String(e.selectedWorkspaceCount) },
              )
            : intl.formatMessage({ id: `onboarding.footer.helper` })}
        </span>
      </div>
      <div className={`flex shrink-0 items-center gap-2`}>
        {e.currentStep === `session` ? (
          <>
            <Button type="button" variant="secondary" size="lg" className={`h-10 min-w-0 px-5`} onClick={e.onBackToWelcome}>
              {intl.formatMessage({ id: `common.back` })}
            </Button>
            <Button type="button" size="lg" className={`h-10 min-w-0 px-5`} onClick={e.onNextStep}>
              {intl.formatMessage({ id: `onboarding.action.continue` })}
            </Button>
          </>
        ) : null}
        {showsBackAndNext ? (
          <>
            <Button type="button" variant="secondary" size="lg" className={`h-10 min-w-0 px-5`} onClick={e.onBackStep}>
              {intl.formatMessage({ id: `common.back` })}
            </Button>
            <Button type="button" size="lg" className={`h-10 min-w-0 px-5`} onClick={e.onNextStep}>
              {intl.formatMessage({ id: `onboarding.action.continue` })}
            </Button>
          </>
        ) : null}
        {e.currentStep === `agents-file` ? (
          <>
            <Button type="button" variant="secondary" size="lg" className={`h-10 min-w-0 px-5`} onClick={e.onBackStep}>
              {intl.formatMessage({ id: `common.back` })}
            </Button>
            <Button
              type="button"
              size="lg"
              className={`h-10 min-w-0 px-5`}
              disabled={e.beginMigrationDisabled}
              onClick={e.onBeginMigration}
            >
              {intl.formatMessage({ id: `onboarding.action.beginMigration` })}
            </Button>
          </>
        ) : null}
        {e.currentStep === `migration` && e.finishReady ? (
          <Button type="button" size="lg" className={`h-10 min-w-0 px-5`} disabled={e.finishRunning} onClick={e.onFinish}>
            {intl.formatMessage({ id: `settingsSync.action.finish` })}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

/** 原 m3t（js 207490-207516 / jsx 164996）：右半项目选择 hero（F18 共用） */
function ProjectSelectorHero() {
  const { intl } = useIntlContext();
  const sizes = useHeroTextSizes();
  return (
    <HeroCard className={`h-full min-h-0 rounded-xl`} contentClassName={`flex h-full items-center justify-center`}>
      <div className={`space-y-4 text-center`}>
        <div className={`space-y-2`}>
          <p className={cn(`whitespace-nowrap text-3xl font-semibold leading-[1.08] tracking-tight`, sizes.heading)}>
            {intl.formatMessage({ id: `projectSelector.heroTitle` })}
          </p>
          <p className={cn(`mx-auto whitespace-nowrap text-ui-base leading-6`, sizes.description)}>
            {intl.formatMessage({ id: `projectSelector.heroDescription` })}
          </p>
        </div>
      </div>
    </HeroCard>
  );
}

/** 原 s4t（js 205679+ / jsx 163712）：ZCode 字标 SVG */
function ZCodeLogoSvg({ className }: { className?: string }) {
  return (
    <svg
      xmlns={`http://www.w3.org/2000/svg`}
      width={`118`}
      height={`100`}
      fill={`none`}
      viewBox={`0 0 256 218`}
      className={cn(`shrink-0 text-current`, className)}
      aria-hidden="true"
      focusable={`false`}
    >
      {/* REBRAND-040+140 */}
      <path
        fill={`none`}
        d={`M78 187 L78 95 A50 50 0 0 1 178 95 L178 187`}
        stroke={`currentColor`}
        strokeWidth={`40`}
      />
    </svg>
  );
}

/** 原 h3t（js 207517-207604 / jsx 165007）：welcome 双栏视图 */
function OnboardingWelcomeView({ onStart, onOpenMigration }: { onStart: () => void; onOpenMigration: () => void }) {
  const { intl } = useIntlContext();
  return (
    <div className={`flex h-full min-h-0`}>
      <div className={`flex w-1/2 flex-col px-8 py-8`}>
        <div className={`space-y-6`}>
          <div className={`inline-flex items-center rounded-full border border-border bg-background-alt px-3 py-1 text-ui-base text-foreground-subtle`}>
            {intl.formatMessage({ id: `onboarding.welcome.eyebrow` })}
          </div>
          <div className={`space-y-2`}>
            {/* REBRAND-040+140 */}
            <div
              className={`relative flex size-14 items-center justify-center rounded-xl bg-[linear-gradient(180deg,#000000_0%,#151718_100%)] text-[#ffffff] shadow-lg/20 before:pointer-events-none before:absolute before:inset-0 before:rounded-xl before:border before:border-[rgba(255,255,255,0.1)]`}
              aria-label="nofy"
              role="img"
            >
              <ZCodeLogoSvg className={`h-auto w-8`} />
            </div>
            <div className={`text-4xl font-bold tracking-tight text-foreground`}>
              {intl.formatMessage({ id: `onboarding.welcome.title` })}
            </div>
          </div>
        </div>
        <div className={`flex flex-1 items-center`}>
          <div className={`w-full space-y-4`}>
            <Button type="button" size="lg" className={`h-10 w-full justify-between text-ui-base`} onClick={onStart}>
              {intl.formatMessage({ id: `onboarding.welcome.start` })}
              <IconArrowRight className={`size-4`} />
            </Button>
            <Button type="button" size="lg" variant="outline" className={`h-10 w-full justify-between text-ui-base`} onClick={onOpenMigration}>
              {intl.formatMessage({ id: `onboarding.welcome.migrate` })}
              <IconArrowRight className={`size-4`} />
            </Button>
          </div>
        </div>
        <div className={`pt-6 text-ui-base leading-6 text-foreground-subtle`}>
          {intl.formatMessage({ id: `onboarding.welcome.helper` })}
        </div>
      </div>
      <div className={`flex w-1/2 flex-col p-2 pl-0`}>
        <ProjectSelectorHero />
      </div>
    </div>
  );
}

/** 原 g3t（js 207605-207609 / jsx 165025） */
interface FinishExecutionState {
  started: boolean;
  running: boolean;
  finished: boolean;
  sessionCompletedCount: number;
  sessionTotalCount: number;
  sessionImportedCount: number;
  sessionSkippedCount: number;
  sessionFailedCount: number;
  agentsFileCompletedCount: number;
  agentsFileTotalCount: number;
  agentsFileImportedCount: number;
  agentsFileSkippedCount: number;
  agentsFileFailedCount: number;
  currentTaskLabel: string | null;
  error: string | null;
}
function initialFinishExecution(): FinishExecutionState {
  return {
    started: false,
    running: false,
    finished: false,
    sessionCompletedCount: 0,
    sessionTotalCount: 0,
    sessionImportedCount: 0,
    sessionSkippedCount: 0,
    sessionFailedCount: 0,
    agentsFileCompletedCount: 0,
    agentsFileTotalCount: 0,
    agentsFileImportedCount: 0,
    agentsFileSkippedCount: 0,
    agentsFileFailedCount: 0,
    currentTaskLabel: null,
    error: null,
  };
}

const SESSION_LIMIT_UNLIMITED = `unlimited`; // 原 j2t

/** 原 _3t（js 207610-207793 / jsx 165044）：session 步（范围/数量/扫描/工作区多选） */
function OnboardingSessionStep(e: {
  migration: SessionMigrationState;
  workspaceCandidates: Array<{ workspacePath: string; label: string; sessionCount: number }>;
  selectedWorkspacePaths: string[];
  onToggleWorkspace: (path: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
}) {
  const { intl } = useIntlContext();
  const selectedCount = e.selectedWorkspacePaths.length;
  const totalCount = e.workspaceCandidates.length;
  const allSelected = totalCount > 0 && selectedCount === totalCount;
  return (
    <div className={`flex h-full min-h-0 flex-1 flex-col gap-6`}>
      <div className={`flex flex-wrap items-center gap-3`}>
        <Select value={e.migration.range} onValueChange={(v) => e.migration.setRange(v)}>
          <SelectTrigger size="lg" className={`h-9 justify-between text-ui-base`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">{intl.formatMessage({ id: `settings.migration.range.7d` })}</SelectItem>
            <SelectItem value="30d">{intl.formatMessage({ id: `settings.migration.range.30d` })}</SelectItem>
            <SelectItem value="90d">{intl.formatMessage({ id: `settings.migration.range.90d` })}</SelectItem>
            <SelectItem value="all">{intl.formatMessage({ id: `settings.migration.range.all` })}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={e.migration.limitInput} onValueChange={(v) => e.migration.setLimitInput(v)}>
          <SelectTrigger size="lg" className={`h-9 justify-between text-ui-base`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[`30`, `50`, `100`, SESSION_LIMIT_UNLIMITED].map((value) => (
              <SelectItem key={value} value={value}>
                {value === `unlimited`
                  ? intl.formatMessage({ id: `onboarding.sessions.unlimited` })
                  : intl.formatMessage({ id: `onboarding.sessions.count` }, { count: value })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="secondary"
          size="lg"
          className={`h-9 min-w-0 px-4 text-ui-base`}
          disabled={!e.migration.supportState.supported || e.migration.isScanning}
          onClick={() => {
            e.migration.scan();
          }}
        >
          {e.migration.isScanning ? <IconLoaderCircle className={`size-4 animate-spin`} /> : null}
          {intl.formatMessage({ id: `settings.migration.scan` })}
        </Button>
      </div>
      {e.migration.scanError ? (
        <div className={`rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-ui-base text-foreground`}>
          {intl.formatMessage({ id: `settings.migration.scanFailedDescription` }, { error: e.migration.scanError })}
        </div>
      ) : null}
      <div className={`min-h-0 flex w-full flex-col flex-1 rounded-xl border border-border bg-background`}>
        <div className={`flex items-center justify-between gap-3 border-b border-border bg-surface/50 px-4 py-3`}>
          <div className={`flex min-w-0 items-center gap-2`}>
            <IconFolder className={`size-4 shrink-0 text-foreground-subtle`} />
            <div className={`flex min-w-0 items-center gap-2`}>
              <div className={`text-ui-base font-medium text-foreground`}>
                {intl.formatMessage({ id: `onboarding.sessions.chooseWorkspace` })}
              </div>
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={totalCount === 0}
            onClick={allSelected ? e.onClearSelection : e.onSelectAll}
          >
            {allSelected
              ? intl.formatMessage({ id: `settingsSync.selection.clearAll` })
              : intl.formatMessage({ id: `settingsSync.selection.selectAll` })}
          </Button>
        </div>
        {e.workspaceCandidates.length === 0 ? (
          <div className={`flex h-full items-center justify-center px-4 text-center text-ui-base text-foreground-subtle`}>
            {intl.formatMessage({ id: `onboarding.sessions.empty` })}
          </div>
        ) : (
          <div className={`flex-1 min-h-0 flex flex-col gap-1 p-2 overflow-y-auto`}>
            {e.workspaceCandidates.map((candidate) => (
              <button
                key={candidate.workspacePath}
                type="button"
                onClick={() => e.onToggleWorkspace(candidate.workspacePath)}
                className={`flex min-w-0 w-full items-start gap-3 rounded-lg bg-background p-3 pl-3 text-left transition-colors hover:bg-surface-hover/50`}
              >
                <div className={`flex size-5 shrink-0 items-center justify-center`}>
                  <div
                    className={`flex size-4 items-center justify-center rounded-sm border ${e.selectedWorkspacePaths.includes(candidate.workspacePath) ? `border-primary bg-primary text-primary-foreground` : `border-border bg-background text-transparent`}`}
                  >
                    <IconCheck className={`size-3.5`} />
                  </div>
                </div>
                <div className={`min-w-0 flex-1 flex flex-col gap-1`}>
                  <div className={`flex min-w-0 items-center gap-3`}>
                    <div className={`min-w-0 truncate text-ui-base font-medium text-foreground`}>{candidate.label}</div>
                    <Badge variant="outline">
                      {intl.formatMessage({ id: `onboarding.sessions.count` }, { count: String(candidate.sessionCount) })}
                    </Badge>
                  </div>
                  <div className={`w-full truncate text-ui-base text-foreground-subtlest`}>{candidate.workspacePath}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** 原 R9（js 207794-207796 / jsx 165129）：导入选择步 → 共享视图 v$t */
function ImportSelectionStep(e: {
  category: "skills" | "mcpServers" | "commands";
  state: ImportSelectionState;
  workspacePath?: string;
}) {
  return <ImportSelectionView category={e.category} state={e.state} workspacePath={e.workspacePath} />;
}

/** 原 v3t（js 207797-207845 / jsx 165136）：迁移进行中视图 */
function MigrationProgressView(e: { overallProgress: number; finishExecution: FinishExecutionState }) {
  const { intl } = useIntlContext();
  return (
    <div className={`flex h-full min-h-0 flex-col justify-center`}>
      <div className={`mx-auto flex w-full max-w-xl flex-col gap-5 rounded-xl bg-background border border-border px-6 py-6`}>
        <div className={`space-y-2`}>
          <div className={`flex items-center justify-between gap-3 text-ui-base text-foreground-subtle`}>
            <span>{intl.formatMessage({ id: `settingsSync.importing.progressLabel` })}</span>
            <span>
              {e.overallProgress}
              {`%`}
            </span>
          </div>
          <Progress value={e.overallProgress} className={`h-2 rounded-full bg-card`} />
        </div>
        <div className={`flex gap-3`}>
          <IconLoaderCircle className={`size-5 animate-spin`} />
          <div>
            <div className={`text-ui-base font-medium text-foreground`}>
              {intl.formatMessage({ id: `onboarding.migration.progress` }, { progress: String(e.overallProgress) })}
            </div>
            <div className={`mt-1 text-ui-base text-foreground-subtle`}>
              {e.finishExecution.currentTaskLabel ?? intl.formatMessage({ id: `onboarding.migration.ready` })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 原 y3t（js 207846-207959 / jsx 165153）：迁移完成三卡汇总 */
function MigrationCompleteView(e: {
  overallProgress: number;
  finishExecution: FinishExecutionState;
  settingsImportedCount: number;
  settingsSkippedCount: number;
  settingsFailedCount: number;
}) {
  const { intl } = useIntlContext();
  return (
    <div className={`flex h-full min-h-0 flex-col gap-8 pt-8`}>
      <div className={`flex flex-col items-center gap-4 text-center`}>
        <div className={`flex size-14 items-center justify-center rounded-full bg-success text-success-foreground`}>
          <IconCheck className={`size-7`} />
        </div>
        <div className={`text-2xl font-medium text-foreground`}>{intl.formatMessage({ id: `onboarding.finish.done` })}</div>
        <div className={`text-ui-base text-foreground-subtle`}>{intl.formatMessage({ id: `onboarding.finish.ready` })}</div>
        {e.finishExecution.error ? (
          <div className={`rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-ui-base text-foreground`}>
            {e.finishExecution.error}
          </div>
        ) : null}
      </div>
      <div className={`grid gap-3 md:grid-cols-3`}>
        <div className={`rounded-xl border border-border bg-card px-4 py-4`}>
          <div className={`text-ui-base font-medium text-foreground`}>
            {intl.formatMessage({ id: `onboarding.finish.summary.sessions` })}
          </div>
          <div className={`mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-ui-base text-foreground-subtle`}>
            <span>{intl.formatMessage({ id: `onboarding.finish.summary.label.imported` })}</span>
            <span>{e.finishExecution.sessionImportedCount}</span>
            <span>{intl.formatMessage({ id: `onboarding.finish.summary.label.skipped` })}</span>
            <span>{e.finishExecution.sessionSkippedCount}</span>
            <span>{intl.formatMessage({ id: `onboarding.finish.summary.label.failed` })}</span>
            <span>{e.finishExecution.sessionFailedCount}</span>
          </div>
        </div>
        <div className={`rounded-xl border border-border bg-card px-4 py-4`}>
          <div className={`text-ui-base font-medium text-foreground`}>
            {intl.formatMessage({ id: `onboarding.finish.summary.agentsFile` })}
          </div>
          <div className={`mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-ui-base text-foreground-subtle`}>
            <span>{intl.formatMessage({ id: `onboarding.finish.summary.label.imported` })}</span>
            <span>{e.finishExecution.agentsFileImportedCount}</span>
            <span>{intl.formatMessage({ id: `onboarding.finish.summary.label.skipped` })}</span>
            <span>{e.finishExecution.agentsFileSkippedCount}</span>
            <span>{intl.formatMessage({ id: `onboarding.finish.summary.label.failed` })}</span>
            <span>{e.finishExecution.agentsFileFailedCount}</span>
          </div>
        </div>
        <div className={`rounded-xl border border-border bg-card px-4 py-4`}>
          <div className={`text-ui-base font-medium text-foreground`}>
            {intl.formatMessage({ id: `onboarding.finish.summary.settings` })}
          </div>
          <div className={`mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-ui-base text-foreground-subtle`}>
            <span>{intl.formatMessage({ id: `onboarding.finish.summary.label.imported` })}</span>
            <span>{e.settingsImportedCount}</span>
            <span>{intl.formatMessage({ id: `onboarding.finish.summary.label.skipped` })}</span>
            <span>{e.settingsSkippedCount}</span>
            <span>{intl.formatMessage({ id: `onboarding.finish.summary.label.failed` })}</span>
            <span>{e.settingsFailedCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 原 b3t（js 207960-208072 / jsx 165187）：AGENTS.md 迁移步 */
function AgentsFileMigrationStep(e: {
  migration: {
    status: AgentsFileMigrationStatus | null;
    loading: boolean;
    error: string | null;
    selected: boolean;
    refresh(): void;
    setSelected(v: boolean): void;
  };
}) {
  const { intl } = useIntlContext();
  const status = e.migration.status;
  const supported = status?.supported === true;
  const checked = e.migration.selected && supported;
  return (
    <div className={`flex h-full min-h-0 flex-col gap-4`}>
      <div className={`flex shrink-0 items-center justify-end gap-3`}>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={e.migration.loading}
          onClick={() => void e.migration.refresh()}
        >
          {e.migration.loading ? <IconLoaderCircle className={`size-3.5 animate-spin`} /> : <IconRefreshCw className={`size-3.5`} />}
          {intl.formatMessage({ id: `settingsSync.action.rescan` })}
        </Button>
      </div>
      {e.migration.error ? (
        <div className={`rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-ui-base text-foreground`}>
          {intl.formatMessage({ id: `onboarding.agentsFile.error` }, { error: e.migration.error })}
        </div>
      ) : null}
      <button
        type="button"
        disabled={!supported}
        onClick={() => e.migration.setSelected(!checked)}
        className={`flex min-w-0 flex-col gap-4 rounded-xl border border-border bg-background p-4 text-left transition-colors enabled:hover:bg-surface-hover/50 disabled:cursor-not-allowed disabled:opacity-70`}
      >
        <div className={`flex min-w-0 items-start gap-3`}>
          <div className={`flex size-5 shrink-0 items-center justify-center`}>
            <div
              className={`flex size-4 items-center justify-center rounded-sm border ${checked ? `border-primary bg-primary text-primary-foreground` : `border-border bg-background text-transparent`}`}
            >
              <IconCheck className={`size-3.5`} />
            </div>
          </div>
          <div className={`min-w-0 flex-1`}>
            <div className={`flex min-w-0 flex-wrap items-center gap-2`}>
              <IconFileText className={`size-4 shrink-0 text-foreground-subtle`} />
              <div className={`min-w-0 text-ui-base font-medium text-foreground`}>
                {intl.formatMessage({ id: `onboarding.agentsFile.copyTitle` })}
              </div>
            </div>
          </div>
        </div>
        <div className={`grid min-w-0 gap-2 rounded-lg border border-border bg-surface px-3 py-3 text-ui-base`}>
          <div className={`grid min-w-0 gap-1 sm:grid-cols-[5rem_1fr] sm:items-center`}>
            <span className={`text-foreground-subtle`}>{intl.formatMessage({ id: `onboarding.agentsFile.sourceLabel` })}</span>
            <span className={`min-w-0 truncate font-mono text-foreground`}>
              {status?.sourcePath ?? intl.formatMessage({ id: `onboarding.agentsFile.loading` })}
            </span>
          </div>
          <div className={`grid min-w-0 gap-1 sm:grid-cols-[5rem_1fr] sm:items-center`}>
            <span className={`text-foreground-subtle`}>{intl.formatMessage({ id: `onboarding.agentsFile.targetLabel` })}</span>
            <span className={`min-w-0 truncate font-mono text-foreground`}>
              {status?.targetPath ?? intl.formatMessage({ id: `onboarding.agentsFile.loading` })}
            </span>
          </div>
        </div>
        {!supported && !e.migration.loading ? (
          <div className={`flex gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-ui-base leading-6 text-foreground`}>
            <IconTriangleAlert className={`mt-0.5 size-4 shrink-0 text-warning`} />
            <span>{intl.formatMessage({ id: `onboarding.agentsFile.missingSource` })}</span>
          </div>
        ) : null}
      </button>
    </div>
  );
}

/** 原 x3t（js 208073-208085 / jsx 165214）：session 步空态自动扫描判定 */
function shouldAutoScanSessions(e: {
  view: string;
  wizardStep: string;
  supported: boolean;
  isScanning: boolean;
  candidateCount: number;
  scanError: string | null;
  hasAutoScannedInCurrentEntry: boolean;
}): boolean {
  return (
    e.view === `wizard` &&
    e.wizardStep === `session` &&
    e.supported &&
    !e.isScanning &&
    e.candidateCount === 0 &&
    !e.scanError &&
    !e.hasAutoScannedInCurrentEntry
  );
}
/** 原 S3t（js 208086-208091 / jsx 165217） */
function buildSessionGroups(
  selectedWorkspacePaths: string[],
  candidates: Array<{ workspacePath: string; sessionId: string }>,
): Array<{ workspacePath: string; label: string; sessionIds: string[] }> {
  return selectedWorkspacePaths.flatMap((path) => {
    const hits = candidates.filter((c) => c.workspacePath === path);
    return hits.length === 0
      ? []
      : [{ workspacePath: path, label: workspaceBaseLabel(path), sessionIds: hits.map((c) => c.sessionId) }];
  });
}

/**
 * 原 C3t（js 208092-208196 / jsx 165227）：迁移执行器。
 * 进入 migration 步自动开跑：逐工作区 importSessions → agentsFile.copy →
 * settings 导入（includeSettingsSelections 可控）→ finished。
 */
function useFinishExecution(
  view: string,
  wizardStep: OnboardingWizardStepKey,
  selectedWorkspacePaths: string[],
  additionalSelections: Array<{ agent: string; category: string }>,
  migration: SessionMigrationState,
  agentsFile: { selected: boolean; copy(): Promise<{ status?: string }> },
  onboarding: {
    selectedCount: number;
    actions: {
      startImportWithAdditionalSelections(
        selections: Array<{ agent: string; category: string }>,
        options?: { includeCurrentSelections?: boolean },
      ): Promise<void>;
    };
  },
  options: { includeSettingsSelections?: boolean } = {},
) {
  const { intl } = useIntlContext();
  const [execution, setExecution] = React.useState<FinishExecutionState>(initialFinishExecution);
  const runningRef = React.useRef(false);
  const run = React.useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    const groups = buildSessionGroups(selectedWorkspacePaths, migration.candidates);
    setExecution({
      started: true,
      running: true,
      finished: false,
      sessionCompletedCount: 0,
      sessionTotalCount: groups.length,
      sessionImportedCount: 0,
      sessionSkippedCount: 0,
      sessionFailedCount: 0,
      agentsFileCompletedCount: 0,
      agentsFileTotalCount: +!!agentsFile.selected,
      agentsFileImportedCount: 0,
      agentsFileSkippedCount: 0,
      agentsFileFailedCount: 0,
      currentTaskLabel: null,
      error: null,
    });
    try {
      for (let index = 0; index < groups.length; index += 1) {
        const group = groups[index];
        if (!group) continue;
        setExecution((prev) => ({
          ...prev,
          currentTaskLabel: intl.formatMessage(
            { id: `onboarding.finish.currentWorkspace` },
            { workspace: group.label },
          ),
        }));
        const result = await migration.importSessions(group.sessionIds);
        if (!result) throw Error(migration.importError ?? `Session migration failed`);
        setExecution((prev) => ({
          ...prev,
          sessionCompletedCount: prev.sessionCompletedCount + 1,
          sessionImportedCount: prev.sessionImportedCount + result.imported.length,
          sessionSkippedCount: prev.sessionSkippedCount + result.skipped.length,
          sessionFailedCount: prev.sessionFailedCount + result.failed.length,
        }));
      }
      if (agentsFile.selected) {
        setExecution((prev) => ({
          ...prev,
          currentTaskLabel: intl.formatMessage({ id: `onboarding.finish.currentAgentsFile` }),
        }));
        try {
          const copied = await agentsFile.copy();
          setExecution((prev) => ({
            ...prev,
            agentsFileCompletedCount: prev.agentsFileCompletedCount + 1,
            agentsFileImportedCount: prev.agentsFileImportedCount + +(copied.status === `copied`),
            agentsFileSkippedCount: prev.agentsFileSkippedCount + +(copied.status === `skipped`),
          }));
        } catch (error) {
          setExecution((prev) => ({
            ...prev,
            agentsFileCompletedCount: prev.agentsFileCompletedCount + 1,
            agentsFileFailedCount: prev.agentsFileFailedCount + 1,
          }));
          throw error;
        }
      }
      const includeSettings = options.includeSettingsSelections ?? true;
      if ((includeSettings ? onboarding.selectedCount : 0) > 0 || additionalSelections.length > 0) {
        setExecution((prev) => ({
          ...prev,
          currentTaskLabel: intl.formatMessage({ id: `onboarding.finish.currentSettings` }),
        }));
        await onboarding.actions.startImportWithAdditionalSelections(additionalSelections, {
          includeCurrentSelections: includeSettings,
        });
      }
      setExecution((prev) => ({ ...prev, running: false, finished: true, currentTaskLabel: null }));
    } catch (error) {
      setExecution((prev) => ({
        ...prev,
        running: false,
        finished: true,
        error: error instanceof Error ? error.message : String(error),
        currentTaskLabel: null,
      }));
    } finally {
      runningRef.current = false;
    }
  }, [additionalSelections, agentsFile, intl, selectedWorkspacePaths, migration, onboarding.actions, onboarding.selectedCount, options.includeSettingsSelections]);
  React.useEffect(() => {
    if (view !== `wizard` || wizardStep !== `migration` || execution.started) return;
    void run();
  }, [execution.started, run, view, wizardStep]);
  const resetFinishExecution = React.useCallback(() => {
    setExecution(initialFinishExecution());
  }, []);
  return { finishExecution: execution, resetFinishExecution };
}

/** 原 w3t（js 208194 / jsx 165334） */
function errorMessageText2(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** 原 T3t（js 208197-208250 / jsx 165337）：AGENTS.md 迁移状态 hook */
function useAgentsFileMigration(e: { workspacePath?: string; workspaceIdentity?: string; enabled: boolean }) {
  const { settingsSyncService } = useServices() as BaseServices & { settingsSyncService: SettingsSyncService };
  const [status, setStatus] = React.useState<AgentsFileMigrationStatus | null>(null);
  const [selected, setSelected] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await settingsSyncService.getClaudeAgentsFileMigrationStatus({
        workspacePath: e.workspacePath,
        workspaceIdentity: e.workspaceIdentity,
      });
      setStatus(next);
      setSelected(!!next?.supported);
    } catch (err) {
      const message = errorMessageText2(err);
      logger.error(`[OnboardingAgentsFileMigration] status load failed`, {
        workspacePath: e.workspacePath,
        workspaceIdentity: e.workspaceIdentity,
        error: message,
      });
      setError(message);
      setStatus(null);
      setSelected(false);
    } finally {
      setLoading(false);
    }
  }, [e.workspaceIdentity, e.workspacePath, settingsSyncService]);
  React.useEffect(() => {
    if (e.enabled) void refresh();
  }, [e.enabled, refresh]);
  const setSelectedSafe = React.useCallback(
    (next: boolean) => {
      setSelected(next && status?.supported === true);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [status?.supported],
  );
  const copy = React.useCallback(async () => {
    const result = await settingsSyncService.copyClaudeAgentsFileToZcodeAgentsFile({
      workspacePath: e.workspacePath,
      workspaceIdentity: e.workspaceIdentity,
      overwrite: true,
    });
    await refresh();
    return result;
  }, [e.workspaceIdentity, e.workspacePath, refresh, settingsSyncService]);
  return { error, loading, selected, status, copy, refresh, setSelected: setSelectedSafe };
}

/** 原 z9（js 208251 / jsx 165387） */
const ONBOARDING_STEP_ORDER = [`session`, `skills-import`, `mcp-import`, `commands-import`, `agents-file`, `migration`] as const;

/**
 * 原 E3t（js 208252-208536 / jsx 165388）：onboarding 对话框。
 * welcome 双栏 ↔ 六步向导；关闭走 useConfirmDialog 守卫（migration 运行中）。
 */
export function OnboardingDialog(e: {
  workspacePath?: string;
  workspaceIdentity?: string | null;
  isDesktop: boolean;
}) {
  const { intl } = useIntlContext();
  const confirm = useConfirmDialog();
  const onboarding = useOnboardingDialogController({
    workspacePath: e.workspacePath,
    workspaceIdentity: e.workspaceIdentity ?? undefined,
  });
  const migration = useSessionMigrationScanner({
    workspacePath: e.workspacePath ?? null,
    isDesktop: e.isDesktop,
  });
  const dialogRequested = useSettingsStore((s) => s.onboardingDialogRequested);
  const clearDialogRequest = useSettingsStore((s) => s.clearOnboardingDialogRequest);
  const [view, setView] = React.useState<"welcome" | "wizard">(`welcome`);
  const [wizardStep, setWizardStep] = React.useState<OnboardingWizardStepKey>(`session`);
  const [selectedWorkspacePaths, setSelectedWorkspacePaths] = React.useState<string[]>([]);
  const autoSelectedRef = React.useRef(false);
  const autoScannedRef = React.useRef(false);
  const skillsSelections = useImportSelections({
    category: `skills`,
    enabled: view === `wizard` && wizardStep === `skills-import`,
    workspacePath: e.workspacePath,
    workspaceIdentity: e.workspaceIdentity ?? undefined,
  });
  const mcpSelections = useImportSelections({
    category: `mcpServers`,
    enabled: view === `wizard` && wizardStep === `mcp-import`,
    workspacePath: e.workspacePath,
    workspaceIdentity: e.workspaceIdentity ?? undefined,
  });
  const commandsSelections = useImportSelections({
    category: `commands`,
    enabled: view === `wizard` && wizardStep === `commands-import`,
    workspacePath: e.workspacePath,
    workspaceIdentity: e.workspaceIdentity ?? undefined,
  });
  const agentsFile = useAgentsFileMigration({
    enabled: view === `wizard` && wizardStep === `agents-file`,
    workspacePath: e.workspacePath,
    workspaceIdentity: e.workspaceIdentity ?? undefined,
  });
  const workspaceCandidates = React.useMemo(() => {
    const byPath = new Map<string, { workspacePath: string; label: string; sessionCount: number }>();
    for (const candidate of migration.candidates) {
      const hit = byPath.get(candidate.workspacePath);
      if (hit) {
        hit.sessionCount += 1;
        continue;
      }
      byPath.set(candidate.workspacePath, {
        workspacePath: candidate.workspacePath,
        label: workspaceBaseLabel(candidate.workspacePath),
        sessionCount: 1,
      });
    }
    return [...byPath.values()].sort((a, b) => b.sessionCount - a.sessionCount);
  }, [migration.candidates]);
  const additionalSelections = React.useMemo(
    () => [...skillsSelections.selections, ...mcpSelections.selections, ...commandsSelections.selections].map((s) => ({
      agent: (s as { agent?: string }).agent ?? ``,
      category: (s as { category?: string }).category ?? ``,
    })),
    [commandsSelections.selections, mcpSelections.selections, skillsSelections.selections],
  );
  const settingsSelectionCount =
    skillsSelections.selectedCount + mcpSelections.selectedCount + commandsSelections.selectedCount;
  const { finishExecution, resetFinishExecution } = useFinishExecution(
    view,
    wizardStep,
    selectedWorkspacePaths,
    additionalSelections,
    migration,
    agentsFile,
    onboarding,
    { includeSettingsSelections: false },
  );
  React.useEffect(() => {
    if (!onboarding.state.open) {
      setView(`welcome`);
      setWizardStep(`session`);
      setSelectedWorkspacePaths([]);
      resetFinishExecution();
      autoSelectedRef.current = false;
      autoScannedRef.current = false;
      return;
    }
  }, [onboarding.state.open, resetFinishExecution]);
  React.useEffect(() => {
    if (dialogRequested) {
      setView(`welcome`);
      setWizardStep(`session`);
      resetFinishExecution();
      onboarding.actions.reopen();
      clearDialogRequest();
    }
  }, [clearDialogRequest, dialogRequested, resetFinishExecution, onboarding.actions]);
  React.useEffect(() => {
    if (view !== `wizard` || wizardStep !== `session`) autoScannedRef.current = false;
  }, [view, wizardStep]);
  React.useEffect(() => {
    if (
      shouldAutoScanSessions({
        view,
        wizardStep,
        supported: migration.supportState.supported,
        isScanning: migration.isScanning,
        candidateCount: migration.candidates.length,
        scanError: migration.scanError,
        hasAutoScannedInCurrentEntry: autoScannedRef.current,
      })
    ) {
      autoScannedRef.current = true;
      migration.scan();
    }
  }, [migration.candidates.length, migration.isScanning, migration.scan, migration.scanError, migration.supportState.supported, view, wizardStep]);
  React.useEffect(() => {
    setSelectedWorkspacePaths((prev) => {
      const available = [...new Set(migration.candidates.map((c) => c.workspacePath))];
      if (available.length === 0) {
        autoSelectedRef.current = false;
        return [];
      }
      if (autoSelectedRef.current) return prev.filter((p) => available.includes(p));
      autoSelectedRef.current = true;
      return available;
    });
  }, [migration.candidates]);
  const selectedWorkspaceCount = selectedWorkspacePaths.length;
  const nothingSelected =
    selectedWorkspaceCount === 0 && settingsSelectionCount === 0 && !agentsFile.selected;
  const completedTaskCount = React.useMemo(
    () => onboarding.state.tasks.filter((t) => t.status !== `pending` && t.status !== `running`).length,
    [onboarding.state.tasks],
  );
  const migrationTotal =
    finishExecution.sessionTotalCount + finishExecution.agentsFileTotalCount + 0 + additionalSelections.length;
  const migrationDone =
    finishExecution.sessionCompletedCount + finishExecution.agentsFileCompletedCount + completedTaskCount;
  const overallProgress =
    migrationTotal > 0 ? Math.round((migrationDone / migrationTotal) * 100) : finishExecution.finished ? 100 : 0;
  const stepTitleKey = onboardingStepTitleKey(wizardStep);
  const title =
    view === `welcome`
      ? intl.formatMessage({ id: `onboarding.dialog.title` })
      : intl.formatMessage({ id: `onboarding.step.${stepTitleKey}` });
  const description =
    view === `welcome`
      ? intl.formatMessage({ id: `onboarding.dialog.description` })
      : wizardStep === `agents-file`
        ? ``
        : intl.formatMessage({ id: `onboarding.stepDescription.${stepTitleKey}` });
  const toggleWorkspace = (path: string) => {
    setSelectedWorkspacePaths((prev) => (prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]));
  };
  const clearWorkspaces = () => {
    setSelectedWorkspacePaths([]);
  };
  const selectAllWorkspaces = () => {
    setSelectedWorkspacePaths(workspaceCandidates.map((c) => c.workspacePath));
  };
  const backStep = React.useCallback(() => {
    const index = ONBOARDING_STEP_ORDER.indexOf(wizardStep);
    if (index <= 0) {
      setView(`welcome`);
      return;
    }
    setWizardStep(ONBOARDING_STEP_ORDER[index - 1] ?? `session`);
  }, [wizardStep]);
  const nextStep = React.useCallback(() => {
    const next = ONBOARDING_STEP_ORDER[ONBOARDING_STEP_ORDER.indexOf(wizardStep) + 1];
    if (next && next !== `migration`) setWizardStep(next);
  }, [wizardStep]);
  const beginMigration = React.useCallback(async () => {
    if (
      agentsFile.selected &&
      !(await confirm({
        title: intl.formatMessage({ id: `onboarding.agentsFile.confirmTitle` }),
        description: intl.formatMessage(
          { id: `onboarding.agentsFile.confirmDescription` },
          {
            source: agentsFile.status?.sourcePath ?? `~/.claude/CLAUDE.md`,
            target: agentsFile.status?.targetPath ?? `~/.zcode/AGENTS.md`,
          },
        ),
        confirmLabel: intl.formatMessage({ id: `onboarding.agentsFile.confirmAction` }),
        cancelLabel: intl.formatMessage({ id: `common.cancel` }),
      }))
    ) {
      logger.info(`[OnboardingDialog] AGENTS.md migration canceled by user`, {
        workspacePath: e.workspacePath ?? null,
        workspaceIdentity: e.workspaceIdentity ?? null,
      });
      return;
    }
    setWizardStep(`migration`);
  }, [agentsFile.selected, agentsFile.status?.sourcePath, agentsFile.status?.targetPath, confirm, intl, e.workspaceIdentity, e.workspacePath]);
  const requestClose = React.useCallback(async () => {
    if (!finishExecution.running) {
      onboarding.actions.close();
      return;
    }
    logger.info(`[OnboardingDialog] migration close requested while running`, {
      workspacePath: e.workspacePath ?? null,
      workspaceIdentity: e.workspaceIdentity ?? null,
      currentTaskLabel: finishExecution.currentTaskLabel,
      overallProgress,
    });
    if (
      !(await confirm({
        title: intl.formatMessage({ id: `onboarding.migration.confirmCloseTitle` }),
        description: intl.formatMessage({ id: `onboarding.migration.confirmCloseDescription` }),
        confirmLabel: intl.formatMessage({ id: `onboarding.migration.confirmCloseConfirm` }),
        cancelLabel: intl.formatMessage({ id: `common.cancel` }),
      }))
    ) {
      logger.info(`[OnboardingDialog] migration close canceled by user`, {
        workspacePath: e.workspacePath ?? null,
        workspaceIdentity: e.workspaceIdentity ?? null,
      });
      return;
    }
    onboarding.actions.close();
  }, [confirm, finishExecution.currentTaskLabel, finishExecution.running, intl, overallProgress, e.workspaceIdentity, e.workspacePath, onboarding.actions]);
  return (
    <Dialog
      open={onboarding.state.open}
      onOpenChange={(next) => {
        if (!next) void requestClose();
      }}
    >
      <DialogContent className={`h-[calc(100vh-6rem)] max-w-4xl max-h-168 overflow-hidden rounded-2xl p-0`} showCloseButton>
        <DialogTitle className={`sr-only`}>{title}</DialogTitle>
        <DialogDescription className={`sr-only`}>{description}</DialogDescription>
        {view === `welcome` ? (
          <OnboardingWelcomeView
            onStart={onboarding.actions.close}
            onOpenMigration={() => {
              setView(`wizard`);
              setWizardStep(`session`);
            }}
          />
        ) : (
          <div className={`flex h-full min-h-0 min-w-0`}>
            <OnboardingStepRail currentStep={wizardStep} />
            <div className={`flex min-w-0 flex-1 flex-col gap-5 overflow-hidden p-6`}>
              <OnboardingStepHeader title={title} description={description} />
              <div className={`min-h-0 flex-1`}>
                {(() => {
                  switch (wizardStep) {
                    case `session`:
                      return (
                        <OnboardingSessionStep
                          migration={migration}
                          workspaceCandidates={workspaceCandidates}
                          selectedWorkspacePaths={selectedWorkspacePaths}
                          onToggleWorkspace={toggleWorkspace}
                          onSelectAll={selectAllWorkspaces}
                          onClearSelection={clearWorkspaces}
                        />
                      );
                    case `skills-import`:
                      return (
                        <ImportSelectionStep category={`skills`} state={skillsSelections} workspacePath={e.workspacePath} />
                      );
                    case `mcp-import`:
                      return (
                        <ImportSelectionStep category={`mcpServers`} state={mcpSelections} workspacePath={e.workspacePath} />
                      );
                    case `commands-import`:
                      return (
                        <ImportSelectionStep category={`commands`} state={commandsSelections} workspacePath={e.workspacePath} />
                      );
                    case `agents-file`:
                      return <AgentsFileMigrationStep migration={agentsFile} />;
                    case `migration`:
                      return finishExecution.finished ? (
                        <MigrationCompleteView
                          overallProgress={overallProgress}
                          finishExecution={finishExecution}
                          settingsImportedCount={onboarding.state.result?.successCount ?? 0}
                          settingsSkippedCount={onboarding.state.result?.skippedCount ?? 0}
                          settingsFailedCount={onboarding.state.result?.failedCount ?? 0}
                        />
                      ) : (
                        <MigrationProgressView overallProgress={overallProgress} finishExecution={finishExecution} />
                      );
                  }
                })()}
              </div>
              <OnboardingWizardFooter
                currentStep={wizardStep}
                selectedWorkspaceCount={selectedWorkspaceCount}
                settingsTaskCount={0}
                finishRunning={finishExecution.running}
                finishReady={finishExecution.finished}
                onBackToWelcome={() => setView(`welcome`)}
                onBackStep={backStep}
                onNextStep={nextStep}
                onBeginMigration={() => void beginMigration()}
                onFinish={onboarding.actions.finish}
                beginMigrationDisabled={nothingSelected}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ============================================================================
 * 5. 确认 / 警告对话框子族 + 模态宿主（任务删除/归档确认的呈现侧）
 * ----------------------------------------------------------------------------
 * 任务删除/归档确认 = 本族 ConfirmDialog（q4t）+ 各触发入口：
 *  - 归档确认（会话头更多菜单）：wFt 内 js 143661-143673（TopBar.tsx 已含调用点）
 *    key：confirmDialog.taskArchiveTitle / taskArchiveDescription，confirm=taskList.archive
 *  - 归档任务删除（侧栏归档平铺段 lLt，js 147005-147046 / jsx 122315）：
 *    key：confirmDialog.archivedTaskDeleteTitle / archivedTaskDeleteDescription，
 *    confirm=行 title（taskList.delete）；成功后 zcodeTaskService.deleteTask + sLt 清理
 *  - 归档远控任务删除（web 远控任务索引 mLt，js 147510-147546 / jsx 122463 内）：同 key
 *  - 词典另有 confirmDialog.taskDeleteTitle / taskDeleteDescription /
 *    projectRemoveTitle / projectRemoveDescription（IntlProvider 1083-1084 行附近），
 *    本 chunk 无调用点（移动端/历史入口），仅登记。
 * ==========================================================================*/

export interface ConfirmDialogRequest {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "default" | "destructive";
  compact?: boolean;
  showCloseButton?: boolean;
  showKeyboardHints?: boolean;
  presentation?: "automation-confirmation" | undefined;
  resolve?: (confirmed: boolean) => void;
}

/** zustand store 形状（原 Ae=create，skillStore-BmeKHDBI.js 的 q 导出） */
interface ZustandStore<T> {
  (): T;
  <R>(selector: (state: T) => R): R;
  getState(): T;
}
declare function zustandCreate<T>(
  init: (set: (patch: Partial<T>) => void, get: () => T) => T,
): ZustandStore<T>;

interface ConfirmDialogStoreState {
  pendingRequest: ConfirmDialogRequest | undefined;
  requestConfirmation(req: Omit<ConfirmDialogRequest, "resolve">): Promise<boolean>;
  settleConfirmation(confirmed: boolean): void;
}

/** 原 H2（js 123480-123492 / jsx 105205）：确认对话框 store（单飞 + Promise 结算） */
const ConfirmDialogStore = zustandCreate<ConfirmDialogStoreState>((set, get) => ({
  pendingRequest: undefined,
  requestConfirmation: (request) =>
    get().pendingRequest
      ? (logger.warn(`[ConfirmDialogStore] confirmation already in progress`), Promise.resolve(false))
      : new Promise<boolean>((resolve) => {
          set({ pendingRequest: { ...request, resolve } });
        }),
  settleConfirmation: (confirmed) => {
    const pending = get().pendingRequest;
    if (pending) {
      set({ pendingRequest: undefined });
      pending.resolve?.(confirmed);
    }
  },
}));

/** 原 U2（js 123493-123495 / jsx 105222）：useConfirmDialog */
export function useConfirmDialog(): (
  request: Omit<ConfirmDialogRequest, "resolve">,
) => Promise<boolean> {
  return ConfirmDialogStore((state) => state.requestConfirmation);
}

export interface AlertDialogRequest {
  title: string;
  description?: string;
  actionLabel?: string;
  resolve?: () => void;
}

interface AlertDialogStoreState {
  pendingRequest: AlertDialogRequest | undefined;
  requestAlert(req: Omit<AlertDialogRequest, "resolve">): Promise<void>;
  settleAlert(): void;
}

/** 原 N9（js 206514-206526 / jsx 164300）：警告对话框 store */
const AlertDialogStore = zustandCreate<AlertDialogStoreState>((set, get) => ({
  pendingRequest: undefined,
  requestAlert: (request) =>
    get().pendingRequest
      ? (logger.warn(`[AlertDialogStore] alert already in progress`), Promise.resolve())
      : new Promise<void>((resolve) => {
          set({ pendingRequest: { ...request, resolve } });
        }),
  settleAlert: () => {
    const pending = get().pendingRequest;
    if (pending) {
      set({ pendingRequest: undefined });
      pending.resolve?.();
    }
  },
}));

/** 原 $3t（js 209650-209652 / jsx 166685）：useAlertDialog */
export function useAlertDialog(): (request: Omit<AlertDialogRequest, "resolve">) => Promise<void> {
  return AlertDialogStore((state) => state.requestAlert);
}

/** 原 G4t（js 206527-206570 / jsx 164317）：警告对话框（单按钮 + ⏎ 提示） */
function AlertDialog() {
  const { intl } = useIntlContext();
  const pending = AlertDialogStore((state) => state.pendingRequest);
  const settle = AlertDialogStore((state) => state.settleAlert);
  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      if (!open) settle();
    },
    [settle],
  );
  return (
    <Dialog open={!!pending} onOpenChange={handleOpenChange}>
      <DialogContent className={`gap-5`}>
        <DialogHeader className={`gap-2`}>
          <DialogTitle>{pending?.title}</DialogTitle>
          {pending?.description ? <DialogDescription>{pending.description}</DialogDescription> : null}
        </DialogHeader>
        <DialogFooter className={`gap-2 sm:justify-end`}>
          <Button onClick={settle} size="lg" className={cn(`h-9 justify-between gap-3 sm:min-w-32`)}>
            <span>{pending?.actionLabel ?? intl.formatMessage({ id: `common.confirm` })}</span>
            <span className={`text-ui-base text-primary-foreground/60`}>⏎</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** 原 K4t（js 206571 / jsx 164352） */
const AUTOMATION_CONFIRM_DIALOG_CLASS = `min-h-[180px] w-[min(448px,calc(100vw-2rem))] max-w-none`;

/**
 * 原 q4t（js 206572-206703 / jsx 164353）：确认对话框。
 * 打开期间 window 级 Enter 捕获确认；esc/⏎ 键帽提示可关（showKeyboardHints）。
 * presentation=`automation-confirmation` 时加宽 + 描述 line-clamp-3。
 */
function ConfirmDialog() {
  const { intl } = useIntlContext();
  const pending = ConfirmDialogStore((state) => state.pendingRequest);
  const settle = ConfirmDialogStore((state) => state.settleConfirmation);
  const lastRequestRef = React.useRef<ConfirmDialogRequest | undefined>(pending);
  if (pending) lastRequestRef.current = pending;
  const request = pending ?? lastRequestRef.current;
  const open = !!pending;
  const isAutomationPresentation = request?.presentation === `automation-confirmation`;
  const confirmLabel = request?.confirmLabel ?? intl.formatMessage({ id: `common.confirm` });
  const cancelLabel = request?.cancelLabel ?? intl.formatMessage({ id: `common.cancel` });
  const compact = request?.compact === true;
  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (!next) settle(false);
    },
    [settle],
  );
  const handleConfirm = React.useCallback(() => {
    settle(true);
  }, [settle]);
  React.useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === `Enter`) {
        event.preventDefault();
        event.stopPropagation();
        settle(true);
      }
    }
    window.addEventListener(`keydown`, onKeyDown, true);
    return () => {
      window.removeEventListener(`keydown`, onKeyDown, true);
    };
  }, [open, settle]);
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        overlayClassName={compact ? `bg-black/20 supports-backdrop-filter:backdrop-blur-[2px]` : undefined}
        className={cn(
          `gap-5 rounded-2xl border-none bg-popover/98 p-5 ring-border shadow-2xl`,
          isAutomationPresentation ? AUTOMATION_CONFIRM_DIALOG_CLASS : `sm:max-w-md`,
          request?.compact && `top-[44%] min-h-[161px] gap-4 sm:max-w-[400px]`,
        )}
      >
        <DialogHeader className={`gap-2`}>
          <DialogTitle className={`text-ui-lg font-semibold text-foreground`}>{request?.title}</DialogTitle>
          {request?.description ? (
            <DialogDescription
              className={cn(
                `whitespace-pre-line pt-0.5 text-ui-base leading-6 text-foreground-subtle`,
                isAutomationPresentation && `line-clamp-3 break-words whitespace-pre-line`,
              )}
            >
              {request.description}
            </DialogDescription>
          ) : null}
        </DialogHeader>
        <DialogFooter className={cn(`gap-2 sm:justify-end`, isAutomationPresentation && `mt-auto`)}>
          <Button
            type="button"
            variant={compact ? `outline` : `secondary`}
            size="lg"
            onClick={() => settle(false)}
            className={cn(`h-9 gap-3 px-4`, request?.showKeyboardHints !== false && `justify-between sm:min-w-28`)}
          >
            <span>{cancelLabel}</span>
            {request?.showKeyboardHints === false ? null : (
              <span className={`font-mono text-ui-base text-foreground-subtle`}>esc</span>
            )}
          </Button>
          <Button
            type="button"
            autoFocus
            variant={request?.confirmVariant ?? `default`}
            size="lg"
            data-testid={TESTID_CONFIRM_DIALOG_CONFIRM}
            onClick={handleConfirm}
            className={cn(`h-9 gap-3 px-4`, request?.showKeyboardHints !== false && `justify-between sm:min-w-32`)}
          >
            <span>{confirmLabel}</span>
            {request?.showKeyboardHints === false ? null : (
              <span
                className={
                  request?.confirmVariant === `destructive`
                    ? `text-ui-base text-destructive-foreground/60`
                    : `text-ui-base text-primary-foreground/60`
                }
              >
                ⏎
              </span>
            )}
          </Button>
        </DialogFooter>
        {request?.showCloseButton ? (
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={intl.formatMessage({ id: `common.close` })}
              className={`absolute right-5 top-5 z-20 text-foreground-subtle hover:bg-surface-hover hover:text-foreground [app-region:no-drag]`}
            >
              <IconX className={`size-4`} strokeWidth={4 / 3} />
            </Button>
          </DialogClose>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

/** 原 P9（js 206704-206710 / jsx 164396）：模态宿主——全窗口壳挂 G4t + q4t */
export function AppDialogHost({ children }: { children: React.ReactNode }) {
  return (
    <div className={`relative h-dvh`}>
      {children}
      <AlertDialog />
      <ConfirmDialog />
    </div>
  );
}

/* ============================================================================
 * 6. WorkspaceActionError 呈现登记（原 j6t 返回，js 210486-210765）
 * ----------------------------------------------------------------------------
 * 结论（逐行核对）：j6t（useWorkspaceActions）以 useState 持有
 * `workspaceActionError`（js 210507 [y,b]），并随 return 暴露（210678）；
 * 唯一调用方 g8t（212837-212852）只解构 setWorkspaceActionError（qe），
 * 值侧在本构建 **无任何呈现层**（全 chunk 搜 workspaceActionError 仅 210678 一处）。
 * 置位点：
 *  - js 210549：startNewTaskFromActiveWorkspace 无活动工作区 →
 *    `workspace.noActiveForNewTask`
 *  - js 210447（O6t ensureConversationWorkspace 失败）→ 原始 error.message
 *  - js 213098（g8t 启动兜底 ensureConversationWorkspace 失败）→ 原始 error.message
 *  - 清零点：210437/210444（O6t）、212882（activeWorkspacePath 变化时 qe(null)）
 * 呈现侧现状 = 无对话框/toast 消费；若重建需自接（建议 AlertDialog N9 或 toast）。
 * ==========================================================================*/

/** 原 j6t 的接口面（仅登记状态接线，不重复 g8t 装配） */
export interface WorkspaceActionsModel {
  /** js 210678：状态值（本构建无呈现层） */
  workspaceActionError: string | null;
  setWorkspaceActionError: (message: string | null) => void;
  startDraftInWorkspace: (workspacePath: string, workspaceIdentity?: string) => void;
  startNewTaskFromActiveWorkspace: (reason: string, workspaceIdentity?: string) => void;
  handleLogout: () => Promise<void> | void;
  handleSelectProject: (path: string) => void;
  handleSelectConversationWorkspace: (path: string) => void;
  handleResolveConversationWorkspace: () => Promise<string>;
  handleEnsureConversationWorkspace: () => Promise<string>;
  handleCreateConversationTask: () => Promise<void>;
  handleOpenWorkspace: () => void;
  handleOpenFolderFromWorkspaceMenu: () => void;
  handleCreateScratchWorkspace: () => Promise<void> | void;
  handleCreateTask: () => void;
  handleBackFromSettings: () => void;
}

/* ============================================================================
 * 7. 跳过项登记
 * ----------------------------------------------------------------------------
 * - wCt useSessionSubscriptionErrorReporter（配额/订阅错误上报，js 118647 / jsx 100899）
 *   已在 Conversation 族登记（ConversationOverlays.tsx §钩子），本文件不重复。
 * - j6 TaskRenameDialog（js 142581 / jsx 118551）已在 TopBar.tsx，不重复。
 * ==========================================================================*/

