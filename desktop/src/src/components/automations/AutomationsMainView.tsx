// A0-S4-4a: 自 modules/ExtendedViews.tsx §6 AutomationsMain 视图态（F15，d6 视图态）原样迁入（组件单元；原文件现为薄 re-export shim）。
// 迁出体 = §0 声明群子集（随族复制，ambient 编译期擦除；图标常量留守原文件，经 import 取回）+ §6 全段（4948–6609）。导入路径按 components/automations/ 深度改指 ../../modules/ / ../ui/。
import * as React from "react";
import { ShadcnTooltipProvider as PopoverRoot } from '../../modules/UsageStatsUiParts'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { LoaderCircle as SpinnerIcon } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0
import { Button, createLucideIcon } from '../../modules/button';
import { Popover, PopoverContent, PopoverTrigger, toast, type ToastOptions } from '../../modules/ImeComposition'; // ToastOptions 原属 imeComposition chunk（与 toast 同主）
import { AutomationEditor, OffPeakTaskEditor, type ScheduleRule } from '../../modules/SettingsLeaves'; // A0-CLEANUP3 3b：Automation 三型 scheduleRule 统一
import { logger } from '../../modules/SkillStore';
import { providerIds } from '../../modules/SrcSharedA';
import { automationsWorkspaceKey } from '../../modules/SrcSharedB';
import { reportTelemetry, type TelemetryPlatform } from '../../modules/StoresDeep'; // A0-CLEANUP3 3b：遥测助手形参具型
import { useServices } from '../../modules/services';
import { useAutomationsStore } from '../../modules/stores-tasks';
import { cn } from '../../modules/UtilsCn'; // 原 Z（utils-CEEH0K_K.js）
import { InfoTooltip as Tooltip } from '../../modules/UsageStatsUiParts'; // 原 Ia（A0-CLEANUP 族清理：本地 Tooltip declare 改指 InfoTooltip）
import {
  IconChevronDown,
  IconRefreshCw,
  IconTrash2,
  IconSquare,
  IconPencil,
  IconAlertTriangle,
  IconMoon,
  IconCircleCheck,
  IconCircleStop,
  IconCirclePlay,
  IconPlay,
  IconPlus,
  IconClock,
  IconEllipsis,
  IconExternalLink,
  IconRotateCcw,
  IconTarget,
  IconActivity,
  IconFileText,
  IconList,
  IconListChecks,
  IconSlidersHorizontal,
  AUTOMATIONS_OFFPEAK_TAB_TESTID,
  AUTOMATIONS_LIST_TESTID,
  AUTOMATION_CARD_TESTID,
  OFFPEAK_CREATE_BUTTON_TESTID,
  AUTOMATION_CREATE_MANUALLY_TESTID,
  AUTOMATION_CREATE_MENU_TESTID,
  AUTOMATION_CARD_MENU_TESTID,
  AUTOMATION_ACTION_TOGGLE_TESTID,
  AUTOMATION_ACTION_DELETE_TESTID,
} from '../../modules/ExtendedViews';
/* ============================================================================
 * 0. 外部依赖的类型声明（真实实现位于上面清单所列 chunk；此处为重建接口）
 * ==========================================================================*/

/** react-intl 风格 intl（原 G()，IntlProvider-C321H7m8.js） */
interface IntlShape {
  formatMessage(descriptor: { id: string }, values?: Record<string, unknown>): string;
}

declare function useIntlContext(): { intl: IntlShape; locale: string };

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

interface ModelProviderInfo {
  id: string;
  name?: string;
  source?: "system" | "custom" | string;
  enabled?: boolean;
  systemDisabledReason?: string | null;
  endpoints?: { baseURL?: string };
  [key: string]: unknown;
}

interface OffPeakTaskService {
  [key: string]: unknown;
}

interface CodingPlanSubscriptionService {
  [key: string]: unknown;
}

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

interface ModelSelectGroup {
  label?: string;
  items: Array<{ value: string; label?: string; [key: string]: unknown }>;
  [key: string]: unknown; // A0-CLEANUP3 3b：流入 SL.SelectGroupEntry（接口无隐式索引签名）
}

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

/** 原 Mg（js 24358）/ Zn（src chunk P 导出）：`provider/model[$variant]` 解析 */
declare function parseModelString(value: string): { providerId?: string; modelName?: string } | null;

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

interface OffPeakStoreHook {
  <T>(selector: (state: OffPeakStoreState) => T): T;
  getState(): OffPeakStoreState;
}

declare const useOffPeakTaskStore: OffPeakStoreHook; // A1-R8 普查留批：bundle 唯一 bX@91416（A0 误标 91368），canonical 裁决 = components/shell/Home.tsx 641 区（定义区属主 + 唯一 live 实例；stores/offPeakTaskStore 已降 shim）。本 declare 消费面（1155–1173/1573–1600 = bundle 138876/139287 簇）与 canonical 型面缝合不拢（OffPeakCreateResult 双名型、grayConfig 索引面等 10 处），接线留待型面对齐专批

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

type IconProps = React.SVGProps<SVGSVGElement> & { size?: number; containerSize?: number };

/** 确认对话框钩子（原 U2，js 123493） */
declare function useConfirmDialog(): (request: {
  presentation?: string;
  title: string;
  description: string;
  confirmLabel: string;
  confirmVariant?: "default" | "destructive";
  showKeyboardHints?: boolean;
}) => Promise<boolean>;

interface AutomationCreateDraft {
  templateId?: string;
  title?: string;
  cronExpr?: string;
  prompt?: string;
  [key: string]: unknown;
}

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

/* ============================================================================
 * 6. AutomationsMain 视图态（原 d6 等，F15；视图态全量展开，编辑器叶子接口保留）
 * ==========================================================================*/

/* ---- 6.0 容器类常量 / toast 锚点（原 H3、c6/l6，js 135261、138628） ---- */

const AUTOMATIONS_MAIN_CONTAINER_CLASS = "mx-auto w-full max-w-4xl px-4 pb-8 pt-0 lg:px-8 lg:pb-10"; // 原 H3

const AUTOMATIONS_TOAST_ANCHOR_ID = "automations-main-toast-anchor"; // 原 c6

/** 原 l6：自动化主视图 toast（统一挂锚点） */
function automationsToast(message: string, opts?: ToastOptions): number {
  return toast(message, { ...opts, anchorId: AUTOMATIONS_TOAST_ANCHOR_ID });
}

/* ---- 6.1 图标包装族（原 E3 基座 + D3…F3，js 134460–134540 / jsx 113356–113436） ---- */

const AUTOMATION_ICON_DEFAULTS = { size: 16, strokeWidth: 2 } as const; // 原 E3

const AutomationChevronIcon: React.FC<IconProps> = ({ size = 12, containerSize = 20, ...rest }) => (
  <span className={cn("flex shrink-0 items-center justify-center", containerSize === 18 ? "size-4.5" : "size-5")} aria-hidden="true">
    <IconChevronDown size={size} strokeWidth={2} className={size === 14 ? "size-3.5" : "size-3"} {...rest} />
  </span>
);

/** 原 Kjt（plus，编辑器域用） */
export const AutomationPlusIcon: React.FC<IconProps> = (props) => <IconPlus {...AUTOMATION_ICON_DEFAULTS} {...props} />;
const AutomationMoonIcon: React.FC<IconProps> = (props) => <IconMoon {...AUTOMATION_ICON_DEFAULTS} {...props} />;
const AutomationPauseIcon: React.FC<IconProps> = (props) => <IconCircleStop {...AUTOMATION_ICON_DEFAULTS} {...props} />;
const AutomationResumeIcon: React.FC<IconProps> = (props) => <IconCirclePlay {...AUTOMATION_ICON_DEFAULTS} {...props} />;
const AutomationEditIcon: React.FC<IconProps> = (props) => <IconPencil {...AUTOMATION_ICON_DEFAULTS} {...props} />;
const AutomationRunIcon: React.FC<IconProps> = (props) => <IconPlay {...AUTOMATION_ICON_DEFAULTS} {...props} />;
const AutomationClockIcon: React.FC<IconProps> = (props) => <IconClock {...AUTOMATION_ICON_DEFAULTS} {...props} />;
const AutomationMoreIcon: React.FC<IconProps> = (props) => <IconEllipsis {...AUTOMATION_ICON_DEFAULTS} {...props} />;
/** 原 P3（external-link，闲时列表域用） */
export const AutomationExternalLinkIcon: React.FC<IconProps> = (props) => <IconExternalLink {...AUTOMATION_ICON_DEFAULTS} {...props} />;
const AutomationRefreshIcon: React.FC<IconProps> = (props) => <IconRefreshCw {...AUTOMATION_ICON_DEFAULTS} {...props} />;
const AutomationRestartIcon: React.FC<IconProps> = (props) => <IconRotateCcw {...AUTOMATION_ICON_DEFAULTS} {...props} strokeWidth={1.33} aria-hidden="true" />;
/** 原 Xjt（square 停止，编辑器域用） */
export const AutomationStopIcon: React.FC<IconProps> = (props) => <IconSquare {...AUTOMATION_ICON_DEFAULTS} fill="currentColor" {...props} />;
const AutomationDeleteIcon: React.FC = () => (
  <span className="flex size-5 shrink-0 items-center justify-center" aria-hidden="true">
    <IconTrash2 className="size-4" {...AUTOMATION_ICON_DEFAULTS} />
  </span>
);

/** 原 sMt（js 134677）：闲时状态徽章图标映射（闲时列表域用） */
export const OFFPEAK_BADGE_ICONS: Record<string, React.FC<IconProps>> = {
  moon: AutomationMoonIcon,
  pause: AutomationPauseIcon,
  spinner: (props) => <SpinnerIcon {...props} />,
  success: (props) => <IconCircleCheck {...AUTOMATION_ICON_DEFAULTS} {...props} />,
  warning: (props) => <IconAlertTriangle {...AUTOMATION_ICON_DEFAULTS} {...props} />,
  stopped: AutomationPauseIcon,
};

/** 原 EN（js 54789）：加载 spinner（loader 图标 role=status） */
const LoadingSpinner: React.FC<IconProps> = ({ className, ...rest }) => (
  <SpinnerIcon role="status" aria-label="Loading" className={cn("size-4 animate-spin", className)} {...rest} />
);

/* ---- 6.2 SwitchToggle（原 Gjt，js 134441 / jsx 113337） ---- */

const SwitchToggle: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel?: string;
  color?: "green" | "blue";
  size?: "default" | "sm";
}> = ({ checked, onChange, ariaLabel, color = "green", size = "default" }) => {
  const activeClass = color === "blue" ? "bg-brand" : "bg-success";
  const isSmall = size === "sm";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      data-testid="automation-switch-toggle"
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex shrink-0 items-center rounded-full transition-[background-color,box-shadow] hover:ring-2 hover:ring-border-hover focus-visible:ring-2 focus-visible:ring-input-border-focused/30",
        checked ? activeClass : "bg-input",
        isSmall ? "h-4 w-8" : "h-5 w-9",
      )}
    >
      <span
        className={cn(
          "absolute inline-block size-3.5 rounded-full shadow transition-all duration-200",
          checked ? (color === "blue" ? "bg-foreground-inverse" : "bg-success-foreground") : "bg-primary",
          checked ? (isSmall ? "left-[17px]" : "left-[18px]") : "left-px",
        )}
      />
    </button>
  );
};

/* ---- 6.3 KeepAwakeBanner（原 tMt，js 134542 / jsx 113438） ---- */

const KeepAwakeBanner: React.FC<{ checked: boolean; onChange: (checked: boolean) => void }> = ({ checked, onChange }) => {
  const { intl } = useIntlContext();
  return (
    <div
      data-automations-keep-awake="true"
      className="flex min-h-11 w-full items-center gap-3 overflow-hidden rounded-[10px] bg-surface px-3 py-3 text-foreground-subtle"
    >
      <span className="flex size-5 shrink-0 items-center justify-center" aria-hidden="true">
        <AutomationMoonIcon className="size-4" />
      </span>
      <p className="min-w-0 flex-1 text-ui-base leading-5">{intl.formatMessage({ id: "offPeak.keepAwakeBanner" })}</p>
      <SwitchToggle checked={checked} ariaLabel={intl.formatMessage({ id: "offPeak.keepAwakeBanner" })} onChange={onChange} color="blue" size="sm" />
    </div>
  );
};

/* ---- 6.4 AutomationCreateSplitButton（原 L3，js 134567 / jsx 113451） ---- */

const AutomationCreateSplitButton: React.FC<{
  onViaChat: () => void;
  onManually: () => void;
  appearance?: "primary" | "outline";
}> = ({ onViaChat, onManually, appearance = "primary" }) => {
  const { intl } = useIntlContext();
  const isOutline = appearance === "outline";
  return (
    <div
      data-appearance={appearance}
      className={cn(
        "inline-flex h-8 items-center overflow-hidden rounded-lg",
        isOutline ? "border border-card-border bg-background" : "bg-primary text-primary-foreground",
      )}
    >
      <button
        type="button"
        data-testid={AUTOMATION_CREATE_MANUALLY_TESTID}
        onClick={onManually}
        className={cn(
          "group inline-flex h-full items-center px-2.5 text-ui-base font-normal leading-5 transition-colors",
          isOutline ? "hover:bg-hover active:bg-selected" : "hover:bg-primary-foreground/10 active:bg-primary-foreground/20",
        )}
      >
        <span className={cn("transition-opacity", isOutline ? "opacity-80 group-hover:opacity-100" : "opacity-100")}>
          {intl.formatMessage({ id: "automations.createManually" })}
        </span>
      </button>
      <div className={cn("h-4 w-px", isOutline ? "bg-surface" : "bg-primary-foreground/10")} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            data-testid={AUTOMATION_CREATE_MENU_TESTID}
            aria-label={intl.formatMessage({ id: "automations.create" })}
            className={cn(
              "group inline-flex h-full w-7 items-center justify-center transition-colors",
              isOutline
                ? "hover:bg-hover active:bg-selected data-[state=open]:bg-hover"
                : "hover:bg-primary-foreground/10 active:bg-primary-foreground/20 data-[state=open]:bg-primary-foreground/10",
            )}
          >
            <span
              className={cn(
                "flex items-center justify-center transition-opacity",
                isOutline ? "opacity-80 group-hover:opacity-100 group-data-[state=open]:opacity-100" : "opacity-100",
              )}
            >
              <AutomationChevronIcon size={14} />
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" alignOffset={-64} sideOffset={4} className="w-auto min-w-0">
          <DropdownMenuItem className="pr-6" onSelect={onViaChat}>
            {intl.formatMessage({ id: "automations.createViaChat" })}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

/* ---- 6.5 OffPeakCreateButton（原 INt，js 138634 / jsx 115771） ---- */

const OFFPEAK_TOOLTIP_CLASS = "max-w-[220px] [&>span]:break-words [&>span]:whitespace-normal [&>span]:text-wrap-pretty"; // 原 Fjt（js 133991）

export const OffPeakCreateButton: React.FC<{ greyReason: string | null; greyTooltip?: string; onCreate: () => void }> = ({ greyReason, greyTooltip, onCreate }) => {
  const { intl } = useIntlContext();
  const button = (
    <button
      type="button"
      data-testid={OFFPEAK_CREATE_BUTTON_TESTID}
      disabled={greyReason !== null}
      onClick={onCreate}
      className="inline-flex h-8 items-center rounded-lg border-0 bg-primary px-3 text-ui-base font-normal leading-5 text-primary-foreground shadow-none outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-input-border-focused/30 disabled:pointer-events-none disabled:bg-surface disabled:text-foreground-subtlest disabled:opacity-100"
    >
      {intl.formatMessage({ id: "offPeak.createButton" })}
    </button>
  );
  return greyTooltip ? (
    <Tooltip title={greyTooltip} side="top" align="center" className={OFFPEAK_TOOLTIP_CLASS}>
      <span className="inline-flex">{button}</span>
    </Tooltip>
  ) : (
    button
  );
};

/* ---- 6.6 AutomationSchedulePill（原 ANt，js 138513 / jsx 115689） ---- */

const AutomationSchedulePill: React.FC<{ dimmed?: boolean; icon: React.ReactNode; text: string }> = ({ dimmed = false, icon, text }) => {
  const textRef = React.useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = React.useState(false);
  React.useEffect(() => {
    const element = textRef.current;
    if (!element) return;
    const measure = () => {
      const overflowing = element.scrollWidth > element.clientWidth;
      setIsOverflowing((previous) => (previous === overflowing ? previous : overflowing));
    };
    measure();
    if (typeof ResizeObserver > "u") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [text]);
  return (
    <PopoverRoot>
      <Popover>
        <PopoverTrigger asChild>
          <span
            className={cn(
              "inline-flex w-fit min-w-0 max-w-full items-center gap-0.5 overflow-hidden rounded-lg bg-success/10 py-0.5 pl-1 pr-2 font-normal text-success",
              dimmed && "opacity-40",
            )}
          >
            <span className="flex size-5 shrink-0 items-center justify-center">{icon}</span>
            <span ref={textRef} data-testid="automation-schedule-text" className="min-w-0 truncate whitespace-nowrap">
              {text}
            </span>
          </span>
        </PopoverTrigger>
        {isOverflowing ? <PopoverContent side="top" sideOffset={6}>{text}</PopoverContent> : null}
      </Popover>
    </PopoverRoot>
  );
};

/* ---- 6.7 AutomationCardMenu（原 ZNt，js 138713 / jsx 115876） ---- */

const AutomationCardMenu: React.FC<{
  automation: AutomationRecord;
  busy: boolean;
  canRestart: boolean;
  canToggle: boolean;
  onRunNow: (automation: AutomationRecord) => void;
  onEdit: (automation: AutomationRecord) => void;
  onToggle: (automation: AutomationRecord, enabled: boolean) => void;
  onRestart: (automation: AutomationRecord) => void;
  onDelete: (automation: AutomationRecord) => void;
}> = ({ automation, busy, canRestart, canToggle, onRunNow, onEdit, onToggle, onRestart, onDelete }) => {
  const { intl } = useIntlContext();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex size-6 items-center justify-center rounded-md opacity-100 transition-colors hover:bg-hover md:opacity-0 md:group-hover:opacity-100 data-[state=open]:bg-hover data-[state=open]:opacity-100"
          data-testid={AUTOMATION_CARD_MENU_TESTID}
          aria-label={intl.formatMessage({ id: "automations.moreActions" })}
          disabled={busy}
          onClick={(event) => event.stopPropagation()}
        >
          <AutomationMoreIcon className="size-4 text-foreground-subtle" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={4} className="w-[190px]" onClick={(event) => event.stopPropagation()}>
        <DropdownMenuItem className="gap-1" disabled={busy} onSelect={() => void onRunNow(automation)}>
          <span className="flex size-5 items-center justify-center">
            <AutomationRunIcon className="size-4" aria-hidden="true" />
          </span>
          {intl.formatMessage({ id: "automations.runNow" })}
        </DropdownMenuItem>
        {canRestart ? (
          <DropdownMenuItem className="gap-1" disabled={busy} onSelect={() => void onRestart(automation)}>
            <span className="flex size-5 items-center justify-center">
              <AutomationRestartIcon className="size-4" />
            </span>
            {intl.formatMessage({ id: "automations.restart" })}
          </DropdownMenuItem>
        ) : null}
        {canToggle ? (
          <DropdownMenuItem data-testid={AUTOMATION_ACTION_TOGGLE_TESTID} className="gap-1" disabled={busy} onSelect={() => void onToggle(automation, !automation.enabled)}>
            {automation.enabled ? (
              <span className="flex size-5 items-center justify-center">
                <AutomationPauseIcon className="size-4" aria-hidden="true" />
              </span>
            ) : (
              <span className="flex size-5 items-center justify-center">
                <AutomationResumeIcon className="size-4" aria-hidden="true" />
              </span>
            )}
            {intl.formatMessage({ id: automation.enabled ? "automations.pause" : "automations.resume" })}
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem className="gap-1" disabled={busy} onSelect={() => void onEdit(automation)}>
          <span className="flex size-5 items-center justify-center">
            <AutomationEditIcon className="size-4" aria-hidden="true" />
          </span>
          {intl.formatMessage({ id: "automations.form.editTitle" })}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          data-testid={AUTOMATION_ACTION_DELETE_TESTID}
          className="gap-1 !text-destructive data-[highlighted]:!bg-menu-hover data-[highlighted]:!text-destructive focus:!text-destructive [&_svg]:!text-destructive"
          disabled={busy}
          onSelect={() => void onDelete(automation)}
        >
          <AutomationDeleteIcon />
          {intl.formatMessage({ id: "automations.delete" })}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/* ---- 6.8 模板数据与图标（原 Mjt/Njt/Pjt、lMt/uMt、LNt） ---- */

const AUTOMATION_TEMPLATE_ICONS: Record<string, ReturnType<typeof createLucideIcon>> = {
  target: IconTarget, // 原 Mjt（js 133984）
  activity: IconActivity,
  file: IconFileText,
  list: IconList,
};

/** 原 Njt（js 133990 / jsx 112749） */
const AutomationTemplateIcon: React.FC<{ className?: string; name: string }> = ({ className, name }) => {
  const Icon = AUTOMATION_TEMPLATE_ICONS[name];
  return <Icon aria-hidden="true" className={className} data-automation-template-icon={name} size={16} strokeWidth={2} />;
};

/** 原 lMt（js 134923–134930 / jsx 113569）：闲时模板图标映射（6 项全量） */
const OFFPEAK_TEMPLATE_ICONS: Record<string, ReturnType<typeof createLucideIcon>> = {
  standupGitSummary: IconList,
  ciFlakyReport: IconActivity,
  documentationSyncCheck: IconListChecks,
  customize: IconSlidersHorizontal,
  standupGitSummarySecondary: IconList,
  followUpMonitor: IconListChecks,
};

/** 原 uMt（js 134931 / jsx 113575） */
const OffPeakTemplateIcon: React.FC<{ className?: string; name: string }> = ({ className, name }) => {
  const Icon = OFFPEAK_TEMPLATE_ICONS[name];
  return <Icon aria-hidden="true" className={className} data-off-peak-template-icon={name} size={16} strokeWidth={2} />;
};

/** 原 Pjt（js 133989 / jsx 112762）：闲时模板 id 表 */
const OFFPEAK_TEMPLATES = [{ id: "standupGitSummary" }, { id: "ciFlakyReport" }, { id: "documentationSyncCheck" }];

/** 原 LNt（js 138654 / jsx 115784）：定时模板表 */
export const SCHEDULED_TEMPLATES = [
  { id: "morningDevBrief", icon: "target", cronExpr: "0 9 * * 1-5" },
  { id: "dailyRiskScan", icon: "activity", cronExpr: "0 10 * * *" },
  { id: "weeklyReleaseBrief", icon: "file", cronExpr: "0 16 * * 5" },
  { id: "documentationSyncCheck", icon: "list", cronExpr: "0 15 * * 3" },
];

/* ---- 6.9 视图态纯助手（原 BNt…XNt、MNt…FNt、Vjt…Wjt、Ijt/Ljt、Tit/Dit，js 138563–138712、134385–134425、133996–134010、91347–91366） ---- */

const AUTOMATIONS_TELEMETRY_REGION = "app.automations"; // 原 jNt

type AutomationsTab = "scheduled" | "idle";

function resolveAutomationTabs(params: { hasAnyTasks: boolean; offPeakVisible: boolean }): AutomationsTab[] {
  return params.hasAnyTasks ? (params.offPeakVisible ? ["scheduled", "idle"] : ["scheduled"]) : [];
}

function resolveValidAutomationTab(tab: AutomationsTab, offPeakVisible: boolean): AutomationsTab {
  return tab === "idle" && !offPeakVisible ? "scheduled" : tab;
}

function resolveTemplateVisibility(params: { hasAnyTasks: boolean; offPeakCreationEnabled: boolean; tab: AutomationsTab }): {
  showOffPeakTemplates: boolean;
  showScheduledTemplates: boolean;
} {
  const isEmpty = !params.hasAnyTasks;
  return {
    showOffPeakTemplates: params.offPeakCreationEnabled && (isEmpty || params.tab === "idle"),
    showScheduledTemplates: isEmpty || params.tab === "scheduled",
  };
}

/** 原 UNt（js 138675） */
const AUTOMATION_LIFECYCLE_PRESENTATION: Record<string, { icon: React.FC<IconProps>; className: string }> = {
  active: { icon: AutomationClockIcon, className: "text-success" },
  paused: { icon: AutomationPauseIcon, className: "text-foreground-subtle" },
  completed: { icon: (props) => <IconCircleCheck {...AUTOMATION_ICON_DEFAULTS} {...props} />, className: "text-foreground-subtle" },
  failed: { icon: (props) => <IconAlertTriangle {...AUTOMATION_ICON_DEFAULTS} {...props} />, className: "text-destructive" },
};

function normalizeAutomationPrompt(prompt: string): string {
  const normalized = prompt.replace(/\s+/g, " ").trim();
  return normalized.length > 0 ? normalized : " ";
}

function isAutomationFailed(automation: AutomationRecord): boolean {
  return automation.lifecycleStatus === "failed";
}

function isAutomationOperable(automation: AutomationRecord): boolean {
  return automation.lifecycleStatus !== "completed" && automation.lifecycleStatus !== "failed";
}

/** 原 qht（js 109250 / jsx 93279） */
function resolveAutomationLifecycleTier(automation: AutomationRecord): "active" | "paused" | "completed" | "failed" {
  return automation.lifecycleStatus === "failed"
    ? "failed"
    : automation.lifecycleStatus === "completed"
      ? "completed"
      : automation.lifecycleStatus === "paused" || !automation.enabled
        ? "paused"
        : "active";
}

/** 原 Kht（js 109243 / jsx 93276） */
function hasAutomationFailure(automation: AutomationRecord): boolean {
  return automation.lifecycleStatus === "failed" || automation.dispatchStatus === "failed_to_dispatch" || !!automation.lastError?.trim();
}

function resolveRunNowErrorLabelId(result: "queued" | "duplicate" | "failed"): string {
  return result === "queued"
    ? "automations.runNowQueued"
    : result === "duplicate"
      ? "automations.runNowAlreadyRunning"
      : "automations.runNowFailed";
}

function automationErrorLabelId(action: string): string {
  return `automations.error.${action}`;
}

function resolveCreateErrorLabelId(error: string | null): string {
  return isCreateLimitError(error) ? "automations.error.createLimit" : automationErrorLabelId("create");
}

function findAutomationById(automations: AutomationRecord[], automationId?: string | null): AutomationRecord | null {
  const trimmed = automationId?.trim();
  return trimmed ? (automations.find((e) => e.automationId === trimmed) ?? null) : null;
}

function resolveOpenAutomationRequest(
  automations: AutomationRecord[],
  openAutomationId: string | null | undefined,
  isInitialized: boolean,
): { status: "pending" } | { status: "found"; target: AutomationRecord } | { status: "missing" } {
  if (!openAutomationId?.trim() || !isInitialized) return { status: "pending" };
  const target = findAutomationById(automations, openAutomationId);
  return target ? { status: "found", target } : { status: "missing" };
}

/* 遥测（原 MNt/NNt/PNt/FNt） */

function buildAutomationModelTelemetryFields(model: string | null | undefined, provider: string | null | undefined, providers: ModelProviderInfo[]): {
  model_name: string;
  model_provider: string;
  provider_name: string;
} {
  const raw = model?.trim() ?? "";
  const parsed = parseModelString(raw);
  const slashIndex = raw.indexOf("/");
  const providerId = provider?.trim() || parsed?.providerId?.trim() || (slashIndex > 0 ? raw.slice(0, slashIndex).trim() : "");
  const modelName = parsed?.modelName?.trim() || (slashIndex > 0 ? raw.slice(slashIndex + 1).trim() : raw);
  const providerInfo = providers.find((e) => e.id === providerId);
  let hostname = "";
  if (providerInfo?.source === "custom" && providerInfo.endpoints?.baseURL?.trim())
    try {
      hostname = new URL(providerInfo.endpoints.baseURL).hostname;
    } catch {
      hostname = "";
    }
  return { model_name: modelName, model_provider: providerId, provider_name: hostname };
}

function sanitizeTelemetryText(text?: string | null): string {
  return text
    ? text
        .replace(/https?:\/\/[^\s"']+/g, "[url]")
        .replace(/(?:[A-Za-z]:\\|\/)[^\s"']+/g, "[path]")
        .replace(/((?:api[_-]?key|token|authorization|password)\s*[:=]\s*)[^\s,;]+/gi, "$1[redacted]")
        .slice(0, 500)
    : "";
}

function reportAutomationCreateResult(
  service: TelemetryPlatform,
  params: {
    automationId?: string | null;
    cronExpr: string;
    templateId?: string;
    error: string | null;
    modelFields: { model_name: string; model_provider: string; provider_name: string };
  },
): void {
  reportTelemetry(
    service,
    {
      elementName: "automation_create_result",
      eventRegion: AUTOMATIONS_TELEMETRY_REGION,
      eventType: "result",
      eventExtraDetail: {
        status: params.automationId ? "success" : "fail",
        automation_id: params.automationId ?? "",
        create_source: "manual",
        cron_expr: params.cronExpr,
        template_id: params.templateId ?? "",
        error_code: "",
        error_msg: params.automationId ? "" : sanitizeTelemetryText(params.error),
        ...params.modelFields,
      },
    },
    "automation-telemetry",
  );
}

function reportAutomationAction(
  service: TelemetryPlatform,
  params: {
    action: "run_now" | "delete";
    source: string;
    automation: AutomationRecord;
    providers: ModelProviderInfo[];
  },
): void {
  reportTelemetry(
    service,
    {
      elementName: params.action === "run_now" ? "automation_run_now_ck" : "automation_delete_ck",
      eventRegion: AUTOMATIONS_TELEMETRY_REGION,
      eventType: "ck",
      eventExtraDetail: {
        automation_id: params.automation.automationId,
        action_source: params.source,
        ...(params.action === "run_now"
          ? buildAutomationModelTelemetryFields(params.automation.model, params.automation.provider, params.providers)
          : {}),
      },
    },
    "automation-telemetry",
  );
}

/* 闲时遥测（原 Vjt/Hjt/Ujt/Wjt） */

interface OffPeakTelemetryContext {
  eventRegion: string;
  templateId: string;
  modelName: string;
  modelProvider: string;
}

function buildOffPeakTelemetryContext(params: { source?: { eventRegion?: string; templateId?: string } | null; model?: string | null }): OffPeakTelemetryContext {
  return {
    eventRegion: params.source?.eventRegion ?? "app.automations",
    templateId: params.source?.templateId ?? "",
    modelName: params.model?.trim() ?? "",
    modelProvider: OFFPEAK_TELEMETRY_DEFAULT_PROVIDER,
  };
}

function buildOffPeakCreateResultEvent(
  context: OffPeakTelemetryContext,
  result: OffPeakCreateResult,
): TelemetryEvent {
  const base = {
    result: result.ok ? "success" : "failure",
    template_id: context.templateId,
    model_name: context.modelName,
    model_provider: context.modelProvider,
    provider_name: result.providerName,
  };
  return {
    elementName: "off_peak_task_create_result",
    eventRegion: context.eventRegion,
    eventType: "result",
    eventText: "",
    eventExtraDetail: result.ok
      ? {
          ...base,
          off_peak_task_id: result.task.offPeakTaskId,
          ticket_initial_state: result.ticketInitialState,
          queue_position: result.queuePosition === undefined ? "" : String(result.queuePosition),
        }
      : {
          ...base,
          failure_stage: result.failureStage,
          error_category: result.errorCategory,
          error_code: result.errorCode,
        },
  };
}

function reportOffPeakCreateResult(service: TelemetryPlatform, context: OffPeakTelemetryContext, result: OffPeakCreateResult): void {
  reportTelemetry(service, buildOffPeakCreateResultEvent(context, result), "off-peak-telemetry");
}

async function withOffPeakCreateTelemetry<T extends OffPeakCreateResult>(
  service: TelemetryPlatform,
  context: OffPeakTelemetryContext,
  action: () => Promise<T>,
): Promise<T> {
  const result = await action();
  reportOffPeakCreateResult(service, context, result);
  return result;
}

/* 可用性（原 Ijt/Ljt） */

function resolveOffPeakCreateBlockReason(params: {
  availabilityStatus: string;
  canTakeNumber?: boolean;
  grayEnabled: boolean;
  noPlan: boolean;
}): "unavailable" | "plan" | "quota" | null {
  if (!params.grayEnabled) return null;
  if (params.availabilityStatus === "loading" || params.availabilityStatus === "error") return "unavailable";
  if (params.noPlan) return "plan";
  if (params.availabilityStatus === "ready") return params.canTakeNumber === true ? null : "quota";
  return "unavailable";
}

function formatOffPeakRemainingTime(nextTakeAt: number, now: number, intl: IntlShape): string {
  const remaining = nextTakeAt - now;
  if (remaining <= 0) return intl.formatMessage({ id: "offPeak.create.remaining.lessThanMinute" });
  const minutes = Math.ceil(remaining / 60_000);
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours > 0 && rest > 0
    ? intl.formatMessage({ id: "offPeak.create.remaining.hoursMinutes" }, { hours, minutes: rest })
    : hours > 0
      ? intl.formatMessage({ id: "offPeak.create.remaining.hours" }, { hours })
      : intl.formatMessage({ id: "offPeak.create.remaining.minutes" }, { minutes: rest });
}

/* coding plan 错误（原 Eit/Dit，js 91353–91366 / jsx 78937–78941） */

function isQuota3103Result(result: OffPeakCreateResult | null): boolean {
  return result?.ok === false && result.errorCategory === "quota_3103" && result.errorCode === "3103";
}

function resolveOffPeakErrorLabelId(result: OffPeakCreateResult | null): string {
  return isQuota3103Result(result)
    ? "offPeak.error.quota"
    : result?.ok === false && (result.errorCategory === "network" || result.errorCategory === "invalid_response" || result.errorCategory === "unknown")
      ? "offPeak.error.unavailable"
      : "offPeak.error.generic";
}

/** 原 Tit（js 91347 / jsx 78933）：coding plan 连接是否激活（按家族域 + oauth + 选中连接键） */
function isCodingPlanConnectionActiveImpl(
  support: OffPeakStoreState["codingPlanSupport"],
  settings: ZCodeSettings | null,
): boolean {
  if (!support?.supported || !settings) return false;
  const domain = settings.providerFamilyDomain ?? null;
  if (!domain || domain !== support.providerFamily) return false;
  return settings.modelProviderFamilySelectedKeys?.[domain]?.trim() === support.selectedConnectionKey;
}

/* 模型分组（原 AMt，js 135384 / jsx 113829） */

function buildAutomationModelSelectGroups(params: {
  selectedProvider: string;
  providers: ModelProviderInfo[];
  labels: Record<string, string>;
  displayOrder: string[];
  familyModes?: Record<string, string>;
  familySelectedKeys?: Record<string, string>;
  providerFamilyDomain?: string | null;
  getEntitlementSnapshot: (providerId: string) => unknown;
}): ModelSelectGroup[] {
  const entitledProviders = buildEntitledProviderList({
    providers: params.providers,
    selectedProvider: params.selectedProvider,
    getEntitlementSnapshot: params.getEntitlementSnapshot,
    modelProviderFamilySelectedKeys: params.familySelectedKeys,
  });
  return buildModelSelectGroups(
    params.selectedProvider,
    [],
    entitledProviders,
    params.labels,
    params.displayOrder,
    params.familyModes,
    params.familySelectedKeys,
    [],
    false,
    undefined,
    undefined,
    { providerFamilyDomain: params.providerFamilyDomain },
  );
}

/* 频率/下次运行文案（原 rgt/egt，js 109525/109499；cron 描述器 Q$/Xht 属编辑器域，接口保留） */

declare function describeScheduleRule(rule: AutomationScheduleRule & { frequency?: string; rawExpr?: string }, intl: IntlShape): string;
declare function describeCronExpression(cronExpr: string | undefined, intl: IntlShape): string;

function toScheduleRuleDescription(rule: AutomationScheduleRule): AutomationScheduleRule & { frequency: string; rawExpr: string } {
  return {
    ...rule,
    frequency: "custom",
    rawExpr: "",
  };
}

function describeAutomationFrequency(automation: AutomationRecord, intl: IntlShape): string {
  return automation.recurring === false && (automation.maxRuns ?? 1) <= 1
    ? intl.formatMessage({ id: "automations.frequency.custom" })
    : automation.scheduleRule
      ? describeScheduleRule(toScheduleRuleDescription(automation.scheduleRule), intl)
      : describeCronExpression(automation.cronExpr, intl);
}

const AUTOMATION_NEAR_RUN_WINDOW_MS = 720 * 60 * 60 * 1_000; // 原 Jht

declare function describeNearRunTime(nextRunAt: number, now: number, intl: IntlShape): string;
declare function describeFarRunTime(nextRunAt: number): string;

function describeAutomationNextRun(nextRunAt: number | null | undefined, now: number, intl: IntlShape): string | null {
  if (!nextRunAt || nextRunAt <= now) return null;
  return nextRunAt - now <= AUTOMATION_NEAR_RUN_WINDOW_MS ? describeNearRunTime(nextRunAt, now, intl) : describeFarRunTime(nextRunAt);
}

/* ---- 6.10 AutomationsMain（原 d6，js 138823–139924 / jsx 115911–116693） ---- */

type AutomationsViewState =
  | { mode: "list" }
  | { mode: "create"; draft: AutomationCreateDraft | null }
  | { mode: "edit"; automation: AutomationRecord }
  | { mode: "offpeak-create"; draft?: OffPeakCreateDraft | null }
  | { mode: "offpeak-edit"; task: OffPeakTask };

export const AutomationsMain: React.FC<{
  workspacePath: string | null;
  workspaceIdentity?: string | null;
  onCreateViaChat?: (prompt: string) => void;
  openAutomationId?: string | null;
  onOpenAutomationConsumed?: () => void;
  onOpenSession?: (target: { sessionId: string; workspacePath?: string; workspaceIdentity?: string | null }) => void; // A0-CLEANUP3 3b：与 SL.OffPeakTaskEditor.onOpenSession 形参面对齐（逆变收敛）
}> = ({ workspacePath, workspaceIdentity, onCreateViaChat, openAutomationId, onOpenAutomationConsumed, onOpenSession }) => {
  const { intl } = useIntlContext();
  const platformService = usePlatformService();
  const { zcodeAgentService } = useServices();
  const confirmDialog = useConfirmDialog();
  const { openCodingPlanUpgrade } = useCodingPlanUpgrade();
  const { modelProviders, displayOrder, loading: providersLoading } = useModelProviderRegistry();
  const { settings, update: updateSettings } = useSettingsSnapshot();
  const { entitlements } = useEntitlements({
    modelProviders,
    loading: providersLoading,
    modelProviderFamilySelectedKeys: settings?.modelProviderFamilySelectedKeys,
  });
  const automations = useAutomationsStore((state) => state.automations);
  const createLimitReached = automations.length >= 20;
  const automationsLoading = useAutomationsStore((state) => state.loading);
  const operationId = useAutomationsStore((state) => state.operationId);
  const runsCache = useAutomationsStore((state) => state.runsCache);
  const initializeAutomations = useAutomationsStore((state) => state.initialize);
  const createAutomation = useAutomationsStore((state) => state.createAutomation);
  const updateAutomation = useAutomationsStore((state) => state.updateAutomation);
  const deleteAutomation = useAutomationsStore((state) => state.deleteAutomation);
  const setAutomationEnabled = useAutomationsStore((state) => state.setEnabled);
  const restartAutomation = useAutomationsStore((state) => state.restartAutomation);
  const runAutomationNow = useAutomationsStore((state) => state.runAutomationNow);
  const loadRuns = useAutomationsStore((state) => state.loadRuns);
  const deleteRun = useAutomationsStore((state) => state.deleteRun);
  const refreshAutomations = useAutomationsStore((state) => state.refresh);
  const { offPeakTaskService, codingPlanSubscriptionService } = useServices();
  const offPeakTasks = useOffPeakTaskStore((state) => state.tasks);
  const offPeakLoading = useOffPeakTaskStore((state) => state.loading);
  const offPeakGrayConfig = useOffPeakTaskStore((state) => state.grayConfig);
  const offPeakCodingPlanSupport = useOffPeakTaskStore((state) => state.codingPlanSupport);
  const takeNumberAvailability = useOffPeakTaskStore((state) => state.takeNumberAvailability);
  const takeNumberAvailabilityStatus = useOffPeakTaskStore((state) => state.takeNumberAvailabilityStatus);
  const offPeakOperationId = useOffPeakTaskStore((state) => state.operationId);
  const initializeOffPeak = useOffPeakTaskStore((state) => state.initialize);
  const refreshOffPeak = useOffPeakTaskStore((state) => state.refresh);
  const refreshCodingPlanSupport = useOffPeakTaskStore((state) => state.refreshCodingPlanSupport);
  const refreshTakeNumberAvailability = useOffPeakTaskStore((state) => state.refreshTakeNumberAvailability);
  const createOffPeakTask = useOffPeakTaskStore((state) => state.createTask);
  const updateOffPeakTask = useOffPeakTaskStore((state) => state.updateTask);
  const pauseOffPeakTask = useOffPeakTaskStore((state) => state.pauseTask);
  const continueOffPeakTask = useOffPeakTaskStore((state) => state.continueTask);
  const cancelOffPeakTask = useOffPeakTaskStore((state) => state.cancelTask);
  const deleteOffPeakTask = useOffPeakTaskStore((state) => state.deleteTask);
  const deleteOffPeakHistory = useOffPeakTaskStore((state) => state.deleteHistory);
  const consumePendingCreateDraft = useOffPeakTaskStore((state) => state.consumePendingCreateDraft);
  const [refreshing, setRefreshing] = React.useState(false);
  const [viewState, setViewState] = React.useState<AutomationsViewState>({ mode: "list" });
  const [activeTab, setActiveTab] = React.useState<AutomationsTab>("scheduled");
  const activeRemoteTab = isRemoteScopedTab(
    useWorkspaceTabStore((state) => {
      const tab = state.tabs.find((candidate) => candidate.id === state.activeTabId);
      return tab && isWorkspaceTabUsable(tab) ? tab : undefined;
    }),
  );
  const grayEnabled = offPeakGrayConfig?.enabled === true;
  const offPeakCreationEnabled = grayEnabled && !activeRemoteTab;
  const codingPlanInactive =
    offPeakGrayConfig?.codingPlanActive === false ||
    (offPeakGrayConfig?.codingPlanActive === undefined && !offPeakLoading && !isCodingPlanConnectionActiveImpl(offPeakCodingPlanSupport, settings));
  const offPeakVisible = !activeRemoteTab && (grayEnabled || offPeakTasks.length > 0);
  const hasAnyTasks = automations.length > 0 || offPeakTasks.length > 0;
  const tabs = resolveAutomationTabs({ hasAnyTasks, offPeakVisible });
  const activeTabHasTasks = activeTab === "scheduled" ? automations.length > 0 : offPeakTasks.length > 0;
  const { showOffPeakTemplates, showScheduledTemplates } = resolveTemplateVisibility({
    hasAnyTasks,
    offPeakCreationEnabled,
    tab: activeTab,
  });
  const showTemplateSeparator = activeTabHasTasks && (showOffPeakTemplates || showScheduledTemplates);
  const [initializedWorkspaceKey, setInitializedWorkspaceKey] = React.useState<string | null>(null);
  const [nowTick, setNowTick] = React.useState(() => Date.now());
  const offPeakBlock = React.useMemo(() => {
    const reason = resolveOffPeakCreateBlockReason({
      availabilityStatus: takeNumberAvailabilityStatus,
      canTakeNumber: takeNumberAvailability?.canTakeNumber,
      grayEnabled,
      noPlan: codingPlanInactive,
    });
    return {
      reason,
      tooltip:
        reason === "plan"
          ? intl.formatMessage({ id: "offPeak.create.codingPlanOnly" })
          : reason === "unavailable"
            ? intl.formatMessage({ id: "offPeak.create.availabilityUnavailable" })
            : reason === "quota" && takeNumberAvailability?.nextTakeAt !== undefined
              ? intl.formatMessage({ id: "offPeak.create.limitReachedAt" }, { time: formatOffPeakRemainingTime(takeNumberAvailability.nextTakeAt, nowTick, intl) })
              : undefined,
    };
  }, [intl, nowTick, grayEnabled, codingPlanInactive, takeNumberAvailability, takeNumberAvailabilityStatus]);
  const modelSelectGroups = React.useMemo(
    () =>
      buildAutomationModelSelectGroups({
        selectedProvider: "glm",
        providers: modelProviders,
        labels: {
          apiKeyLabel: intl.formatMessage({ id: "settings.modelProvider.apiKey" }),
          apiKeyBadgeLabel: intl.formatMessage({ id: "settings.modelProvider.connectionMode.apiKeyBadge" }),
          codingPlanLabel: intl.formatMessage({ id: "settings.modelProvider.connectionMode.codingPlan" }),
          codingPlanBadgeLabel: intl.formatMessage({ id: "settings.modelProvider.connectionMode.codingPlanBadge" }),
          startPlanLabel: intl.formatMessage({ id: "settings.modelProvider.connectionMode.startPlan" }),
          startPlanBadgeLabel: intl.formatMessage({ id: "settings.modelProvider.connectionMode.startPlanBadge" }),
          teamPlanBadgeLabel: intl.formatMessage({ id: "settings.modelProvider.connectionMode.teamPlanBadge" }),
          teamPlanFallbackLabel: intl.formatMessage({ id: "settings.modelProvider.connectionMode.teamPlan" }),
        },
        displayOrder,
        familyModes: settings?.modelProviderFamilyModes,
        familySelectedKeys: settings?.modelProviderFamilySelectedKeys,
        providerFamilyDomain: settings?.providerFamilyDomain,
        getEntitlementSnapshot: (providerId) => entitlements[providerId]?.snapshot ?? null,
      }),
    [
      entitlements,
      displayOrder,
      intl,
      modelProviders,
      settings?.modelProviderFamilyModes,
      settings?.modelProviderFamilySelectedKeys,
      settings?.providerFamilyDomain,
    ],
  );

  React.useEffect(() => {
    if (!workspacePath) return;
    const workspaceKey = automationsWorkspaceKey({ workspacePath, workspaceIdentity });
    let cancelled = false;
    setInitializedWorkspaceKey(null);
    setNowTick(Date.now());
    initializeAutomations({ workspacePath, workspaceIdentity, agentService: zcodeAgentService }).then(() => {
      if (!cancelled) setInitializedWorkspaceKey(workspaceKey);
    });
    return () => {
      cancelled = true;
    };
  }, [workspacePath, workspaceIdentity, zcodeAgentService, initializeAutomations]);

  React.useEffect(() => {
    initializeOffPeak({ offPeakTaskService, codingPlanSubscriptionService });
  }, [initializeOffPeak, offPeakTaskService, codingPlanSubscriptionService]);

  React.useEffect(() => {
    const nextTab = resolveValidAutomationTab(activeTab, offPeakVisible);
    if (nextTab !== activeTab) setActiveTab(nextTab);
  }, [offPeakVisible, activeTab]);

  const providerFamilyDomain = settings?.providerFamilyDomain;
  const familyMode = providerFamilyDomain ? settings?.modelProviderFamilyModes?.[providerFamilyDomain] : undefined;
  const familySelectedKey = providerFamilyDomain ? settings?.modelProviderFamilySelectedKeys?.[providerFamilyDomain] : undefined;
  const settingsReady = settings != null;
  const sawSettingsRef = React.useRef(false);

  React.useEffect(() => {
    if (!settingsReady) return;
    if (!sawSettingsRef.current) {
      sawSettingsRef.current = true;
      return;
    }
    refreshCodingPlanSupport(offPeakTaskService);
  }, [settingsReady, refreshCodingPlanSupport, offPeakTaskService, familySelectedKey, familyMode, providerFamilyDomain]);

  React.useEffect(() => {
    const nextTakeAt = takeNumberAvailability?.nextTakeAt;
    if (takeNumberAvailability?.canTakeNumber !== false || nextTakeAt === undefined) return;
    const delay = Math.max(0, nextTakeAt - Date.now()) + 100;
    const timer = setTimeout(() => {
      setNowTick(Date.now());
      refreshTakeNumberAvailability(offPeakTaskService);
    }, delay);
    return () => clearTimeout(timer);
  }, [refreshTakeNumberAvailability, offPeakTaskService, takeNumberAvailability]);

  React.useEffect(() => {
    const nextTakeAt = takeNumberAvailability?.nextTakeAt;
    if (takeNumberAvailability?.canTakeNumber !== false || nextTakeAt === undefined) return;
    const remaining = nextTakeAt - Date.now();
    if (remaining <= 0) return;
    const minute = 60_000;
    const mod = remaining % minute;
    const delay = (mod === 0 ? minute : mod) + 50;
    const timer = setTimeout(() => setNowTick(Date.now()), delay);
    return () => clearTimeout(timer);
  }, [nowTick, takeNumberAvailability]);

  React.useEffect(() => {
    if (viewState.mode !== "list" || offPeakTasks.length === 0) return;
    const timer = setInterval(() => {
      refreshOffPeak(offPeakTaskService);
    }, 10_000);
    return () => clearInterval(timer);
  }, [viewState.mode, offPeakTasks.length, refreshOffPeak, offPeakTaskService]);

  const refreshAll = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refreshAutomations(zcodeAgentService), refreshOffPeak(offPeakTaskService), ...(grayEnabled ? [refreshTakeNumberAvailability(offPeakTaskService)] : [])]);
      setNowTick(Date.now());
    } finally {
      setRefreshing(false);
    }
  }, [grayEnabled, refreshOffPeak, refreshTakeNumberAvailability, offPeakTaskService, refreshAutomations, zcodeAgentService]);

  React.useEffect(() => {
    const draft = consumePendingCreateDraft();
    if (draft && !activeRemoteTab) {
      setActiveTab("idle");
      setViewState({ mode: "offpeak-create", draft });
    }
  }, [consumePendingCreateDraft, activeRemoteTab]);

  React.useEffect(() => {
    if (!activeRemoteTab) return;
    setActiveTab((previous) => (previous === "idle" ? "scheduled" : previous));
    setViewState((previous) => (previous.mode === "offpeak-create" || previous.mode === "offpeak-edit" ? { mode: "list" } : previous));
  }, [activeRemoteTab]);

  const openCodingPlanUpgradeFlow = React.useCallback(() => {
    const providerId = settings?.providerFamilyDomain === "bigmodel" ? providerIds.bigmodelCodingPlan : providerIds.zaiCodingPlan;
    openCodingPlanUpgrade({
      providerId,
      initialAudience: "personal",
      funnelContext: buildIdleUpgradeFunnelContext({
        providerId,
        eventText: intl.formatMessage({ id: "settings.modelProvider.codingPlan.upgrade" }),
        entryPlanState: resolveEntryPlanState({ providers: modelProviders, loading: providersLoading }),
      }),
    });
  }, [intl, modelProviders, providersLoading, openCodingPlanUpgrade, settings?.providerFamilyDomain]);

  const showCodingPlanToast = React.useCallback(() => {
    automationsToast(intl.formatMessage({ id: "offPeak.create.codingPlanToast" }), {
      durationMs: 8_000,
      position: "top-center",
      variant: "info",
      actionLabel: intl.formatMessage({ id: "settings.modelProvider.codingPlan.upgrade" }),
      onAction: openCodingPlanUpgradeFlow,
      dismissible: true,
      dismissLabel: intl.formatMessage({ id: "common.close" }),
    });
  }, [openCodingPlanUpgradeFlow, intl]);

  const showCreateLimitToast = React.useCallback(() => {
    automationsToast(intl.formatMessage({ id: "automations.error.createLimit" }, { limit: "20" }));
  }, [intl]);

  React.useEffect(() => {
    const workspaceKey = workspacePath ? automationsWorkspaceKey({ workspacePath, workspaceIdentity }) : null;
    const request = resolveOpenAutomationRequest(automations, openAutomationId, workspaceKey !== null && initializedWorkspaceKey === workspaceKey);
    if (request.status === "pending") return;
    if (request.status === "found") setViewState({ mode: "edit", automation: request.target });
    else automationsToast(intl.formatMessage({ id: "automations.error.targetNotFound" }));
    onOpenAutomationConsumed?.();
  }, [automations, intl, initializedWorkspaceKey, onOpenAutomationConsumed, openAutomationId, workspaceIdentity, workspacePath]);

  const handleCreateManually = React.useCallback(() => {
    if (createLimitReached) {
      showCreateLimitToast();
      return;
    }
    setViewState({ mode: "create", draft: null });
  }, [createLimitReached, showCreateLimitToast]);

  const handleCreateViaChatOrManually = React.useCallback(() => {
    if (createLimitReached) {
      showCreateLimitToast();
      return;
    }
    if (activeRemoteTab) {
      setViewState({ mode: "create", draft: null });
      return;
    }
    if (onCreateViaChat) onCreateViaChat(intl.formatMessage({ id: "automations.createViaChat.prompt" }));
    else setViewState({ mode: "create", draft: null });
  }, [createLimitReached, activeRemoteTab, intl, onCreateViaChat, showCreateLimitToast]);

  const handleCreateFromTemplate = React.useCallback(
    (template: { id: string; cronExpr: string }) => {
      if (createLimitReached) {
        showCreateLimitToast();
        return;
      }
      setViewState({
        mode: "create",
        draft: {
          templateId: template.id,
          title: intl.formatMessage({ id: `automations.template.${template.id}.title` }),
          cronExpr: template.cronExpr,
          prompt: intl.formatMessage({ id: `automations.template.${template.id}.prompt` }),
        },
      });
    },
    [createLimitReached, intl, showCreateLimitToast],
  );

  const handleSubmitAutomation = React.useCallback(
    async ({ input, workspacePath: targetPath, workspaceIdentity: targetIdentity }: { input: AutomationInput; workspacePath: string; workspaceIdentity?: string | null }) => {
      if (viewState.mode === "edit") {
        const updated = await updateAutomation(viewState.automation.automationId, input, zcodeAgentService);
        if (updated) setNowTick(Date.now());
        else automationsToast(intl.formatMessage({ id: automationErrorLabelId("update") }));
        return updated;
      }
      if (createLimitReached) {
        showCreateLimitToast();
        return false;
      }
      const created = await createAutomation({ ...input, workspacePath: targetPath, workspaceIdentity: targetIdentity }, zcodeAgentService);
      reportAutomationCreateResult(platformService, {
        automationId: created?.automationId,
        cronExpr: input.cronExpr ?? "",
        templateId: viewState.mode === "create" ? viewState.draft?.templateId : undefined,
        error: useAutomationsStore.getState().error,
        modelFields: buildAutomationModelTelemetryFields(input.model, input.provider, modelProviders),
      });
      if (!created) {
        const error = useAutomationsStore.getState().error;
        automationsToast(intl.formatMessage({ id: resolveCreateErrorLabelId(error) }, { limit: "20" }));
        return false;
      }
      setNowTick(Date.now());
      return true;
    },
    [createLimitReached, createAutomation, intl, modelProviders, platformService, showCreateLimitToast, updateAutomation, viewState, zcodeAgentService],
  );

  const handleToggleAutomation = React.useCallback(
    async (automation: AutomationRecord, enabled: boolean) => {
      await setAutomationEnabled(automation.automationId, enabled, zcodeAgentService);
      if (useAutomationsStore.getState().error) {
        automationsToast(intl.formatMessage({ id: automationErrorLabelId("toggle") }));
        return;
      }
      setViewState((previous) =>
        previous.mode === "edit" && previous.automation.automationId === automation.automationId
          ? {
              mode: "edit",
              automation: {
                ...previous.automation,
                enabled,
                lifecycleStatus: enabled ? "active" : "paused",
              },
            }
          : previous,
      );
      setNowTick(Date.now());
    },
    [intl, setAutomationEnabled, zcodeAgentService],
  );

  const handleRestartAutomation = React.useCallback(
    async (automation: AutomationRecord) => {
      await restartAutomation(automation.automationId, zcodeAgentService);
      if (useAutomationsStore.getState().error) automationsToast(intl.formatMessage({ id: automationErrorLabelId("restart") }));
      else setNowTick(Date.now());
    },
    [intl, restartAutomation, zcodeAgentService],
  );

  const handleRunNow = React.useCallback(
    async (automation: AutomationRecord, source: string = "list") => {
      logger.debug("[automations] 立即运行交互开始", { automationId: automation.automationId, source });
      reportAutomationAction(platformService, { action: "run_now", source, automation, providers: modelProviders });
      const result = await runAutomationNow(automation.automationId, zcodeAgentService);
      logger.debug("[automations] 立即运行交互结束", {
        automationId: automation.automationId,
        source,
        result,
      });
      if (result === "queued") {
        await loadRuns(automation.automationId, zcodeAgentService, true);
        const sessionId = useAutomationsStore.getState().runsCache[automation.automationId]?.runs?.find(
          (run) => run.trigger === "manual" && !!run.sessionId,
        )?.sessionId;
        automationsToast(intl.formatMessage({ id: "scheduledPreview.toast.running" }, { title: automation.title }), {
          durationMs: 4_000,
          position: "top-center",
          variant: "info",
          ...(sessionId && onOpenSession
            ? {
                actionLabel: intl.formatMessage({ id: "scheduledPreview.toast.view" }),
                onAction: () =>
                  onOpenSession({
                    sessionId,
                    workspacePath: automation.workspacePath ?? "", // A0-CLEANUP3 3b §C：workspacePath 对齐为可选，运行期恒有值
                    workspaceIdentity: automation.workspaceIdentity,
                  }),
              }
            : {}),
          dismissible: true,
          dismissLabel: intl.formatMessage({ id: "common.close" }),
        });
        setNowTick(Date.now());
      } else if (result === "duplicate" || result === "failed") {
        automationsToast(intl.formatMessage({ id: resolveRunNowErrorLabelId(result) }));
      }
    },
    [intl, loadRuns, modelProviders, onOpenSession, platformService, runAutomationNow, zcodeAgentService],
  );

  const handleDeleteAutomation = React.useCallback(
    async (automation: AutomationRecord, source: string = "list") => {
      const confirmed = await confirmDialog({
        presentation: "automation-confirmation",
        title: intl.formatMessage({ id: "automations.delete.title" }),
        description: intl.formatMessage({ id: "automations.delete.description" }, { title: automation.title }),
        confirmLabel: intl.formatMessage({ id: "common.delete" }),
        confirmVariant: "destructive",
        showKeyboardHints: false,
      });
      if (!confirmed) return;
      reportAutomationAction(platformService, { action: "delete", source, automation, providers: modelProviders });
      await deleteAutomation(automation.automationId, zcodeAgentService);
      if (useAutomationsStore.getState().error) automationsToast(intl.formatMessage({ id: automationErrorLabelId("delete") }));
      setViewState((previous) =>
        previous.mode === "edit" && previous.automation.automationId === automation.automationId ? { mode: "list" } : previous,
      );
    },
    [confirmDialog, deleteAutomation, intl, modelProviders, platformService, zcodeAgentService],
  );

  const handleOpenRunSession = React.useCallback(
    (run: { sessionId?: string | null; workspacePath?: string; workspaceIdentity?: string | null }) => {
      if (!run.sessionId || !onOpenSession) return;
      onOpenSession({
        sessionId: run.sessionId,
        workspacePath: run.workspacePath ?? "",
        ...(run.workspaceIdentity ? { workspaceIdentity: run.workspaceIdentity } : {}),
      });
    },
    [onOpenSession],
  );

  const handleOpenOffPeakEditor = React.useCallback((task: OffPeakTask) => {
    setViewState({ mode: "offpeak-edit", task });
  }, []);

  const handleCancelOffPeakTask = React.useCallback(
    async (task: OffPeakTask) => {
      const confirmed = await confirmDialog({
        title: intl.formatMessage({ id: "offPeak.cancel.title" }),
        description: intl.formatMessage({ id: "offPeak.cancel.description" }, { title: task.title || task.prompt }),
        confirmLabel: intl.formatMessage({ id: "offPeak.action.cancel" }),
      });
      if (!confirmed) return;
      await cancelOffPeakTask(task.offPeakTaskId, offPeakTaskService);
      const error = useOffPeakTaskStore.getState().error;
      if (error) automationsToast(error);
    },
    [confirmDialog, intl, cancelOffPeakTask, offPeakTaskService],
  );

  const handleDeleteOffPeakTask = React.useCallback(
    async (task: OffPeakTask) => {
      const confirmed = await confirmDialog({
        title: intl.formatMessage({ id: "offPeak.delete.title" }),
        description: intl.formatMessage({ id: "offPeak.delete.description" }),
        confirmLabel: intl.formatMessage({ id: "offPeak.delete.confirm" }),
      });
      if (!confirmed) return;
      await deleteOffPeakTask(task.offPeakTaskId, offPeakTaskService);
      const error = useOffPeakTaskStore.getState().error;
      if (error) automationsToast(error);
      setViewState((previous) =>
        previous.mode === "offpeak-edit" && previous.task.offPeakTaskId === task.offPeakTaskId ? { mode: "list" } : previous,
      );
    },
    [confirmDialog, intl, deleteOffPeakTask, offPeakTaskService],
  );

  const handleDeleteOffPeakHistoryEntry = React.useCallback(
    async (task: OffPeakTask) => {
      await deleteOffPeakHistory(task.offPeakTaskId, offPeakTaskService);
      const error = useOffPeakTaskStore.getState().error;
      if (error) automationsToast(error);
    },
    [deleteOffPeakHistory, offPeakTaskService],
  );

  const handleSubmitOffPeak = React.useCallback(
    async (input: OffPeakCreateInput): Promise<boolean> => {
      const current = viewState;
      const telemetryContext =
        current.mode === "offpeak-create"
          ? buildOffPeakTelemetryContext({ source: current.draft?.telemetrySource, model: input.model })
          : null;
      if (current.mode !== "offpeak-edit" && offPeakBlock.reason !== null) {
        if (offPeakBlock.reason === "plan") showCodingPlanToast();
        else if (offPeakBlock.reason === "unavailable") automationsToast(intl.formatMessage({ id: "offPeak.error.unavailable" }));
        else automationsToast(offPeakBlock.tooltip ?? intl.formatMessage({ id: "offPeak.error.quota" }));
        if (telemetryContext)
          reportOffPeakCreateResult(
            platformService,
            telemetryContext,
            {
              ok: false,
              task: { offPeakTaskId: "", title: "", prompt: "", status: "cancelled" },
              failureStage: "client_validation",
              errorCategory: "client_validation",
              errorCode: "",
              providerName: "",
            },
          );
        return false;
      }
      if (current.mode === "offpeak-edit") {
        const updated = await updateOffPeakTask(
          current.task.offPeakTaskId,
          {
            title: input.title,
            prompt: input.prompt,
            permissionMode: input.permissionMode,
            model: input.model ?? null,
            thoughtLevel: input.thoughtLevel ?? null,
          },
          offPeakTaskService,
        );
        if (!updated) automationsToast(intl.formatMessage({ id: "offPeak.error.generic" }));
        return updated;
      }
      const result =
        telemetryContext === null
          ? await createOffPeakTask(input, offPeakTaskService)
          : await withOffPeakCreateTelemetry(platformService, telemetryContext, () => createOffPeakTask(input, offPeakTaskService));
      if (!result.ok) automationsToast(intl.formatMessage({ id: resolveOffPeakErrorLabelId(result) }));
      return result.ok;
    },
    [intl, createOffPeakTask, offPeakBlock, offPeakTaskService, updateOffPeakTask, platformService, showCodingPlanToast, viewState],
  );

  if (!workspacePath)
    return (
      <div className="rounded-lg border border-card-border bg-card px-3 py-2 text-ui-base text-foreground-subtle">
        {intl.formatMessage({ id: "automations.noWorkspace" })}
      </div>
    );

  if (viewState.mode === "offpeak-create" || viewState.mode === "offpeak-edit")
    return (
      <OffPeakTaskEditor
        editing={
          viewState.mode === "offpeak-edit"
            ? (offPeakTasks.find((task) => task.offPeakTaskId === viewState.task.offPeakTaskId) ?? viewState.task)
            : null
        }
        initialDraft={viewState.mode === "offpeak-create" ? (viewState.draft ?? null) : null}
        allowedModels={offPeakGrayConfig?.allowedModels ?? []}
        allowedModelConfigs={offPeakGrayConfig?.allowedModelConfigs ?? []}
        defaultWorkspacePath={workspacePath ?? ""}
        defaultWorkspaceIdentity={workspaceIdentity}
        saving={offPeakOperationId?.startsWith("offpeak:create") || offPeakOperationId?.startsWith("offpeak:update") || false}
        createBlocked={viewState.mode === "offpeak-create" && offPeakBlock.reason !== null}
        createBlockedTooltip={offPeakBlock.tooltip}
        onBack={() => setViewState({ mode: "list" })}
        onSubmit={handleSubmitOffPeak}
        onOpenSession={onOpenSession}
        onDelete={(task) => void handleDeleteOffPeakTask(task)}
        onDeleteHistory={(task) => void handleDeleteOffPeakHistoryEntry(task)}
        onPause={(task) => void pauseOffPeakTask(task.offPeakTaskId, offPeakTaskService)}
        onContinue={(task) => void continueOffPeakTask(task.offPeakTaskId, offPeakTaskService)}
        showToast={automationsToast}
      />
    );

  if (viewState.mode === "list")
    return (
      <div data-automations-content="true" className={cn(AUTOMATIONS_MAIN_CONTAINER_CLASS, "flex flex-col")}>
        <div className="flex flex-col gap-3">
          <h1 className="text-[30px] font-medium leading-[34px] tracking-[0.114px] text-foreground">
            {intl.formatMessage({ id: "settings.automations.title" })}
          </h1>
          <p className="text-ui-base leading-5 text-foreground-subtlest">
            {intl.formatMessage({ id: hasAnyTasks ? "automations.description.populated" : "automations.description" })}
          </p>
        </div>
        {tabs.length > 0 ? (
          <div className="mt-8 flex items-center justify-between">
            <div className="flex items-center gap-2" data-testid={AUTOMATIONS_OFFPEAK_TAB_TESTID}>
              {tabs.map((tab) => (
                <Button
                  key={tab}
                  type="button"
                  size="xs"
                  variant={activeTab === tab ? "secondary" : "ghost"}
                  className={cn(
                    "h-7 rounded-lg px-2.5 text-ui-base font-normal",
                    activeTab !== tab && "text-foreground-subtle hover:bg-surface-hover hover:text-foreground",
                  )}
                  onClick={() => setActiveTab(tab)}
                >
                  {intl.formatMessage({ id: `offPeak.tabs.${tab}` })}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Tooltip title={intl.formatMessage({ id: refreshing ? "automations.refreshing" : "automations.refresh" })}>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={intl.formatMessage({ id: "automations.refresh" })}
                  onClick={() => void refreshAll()}
                  disabled={refreshing}
                >
                  <AutomationRefreshIcon className={cn("size-3.5", refreshing && "animate-spin")} aria-hidden="true" />
                </Button>
              </Tooltip>
              {activeTab === "idle" ? null : (
                <AutomationCreateSplitButton
                  onViaChat={handleCreateViaChatOrManually}
                  onManually={handleCreateManually}
                  appearance={activeTab === "scheduled" ? "primary" : "outline"}
                />
              )}
              {showOffPeakTemplates ? (
                <OffPeakCreateButton greyReason={offPeakBlock.reason} greyTooltip={offPeakBlock.tooltip} onCreate={() => setViewState({ mode: "offpeak-create" })} />
              ) : null}
            </div>
          </div>
        ) : null}
        {automationsLoading && automations.length === 0 && offPeakTasks.length === 0 ? (
          <div className="mt-8 flex h-40 items-center justify-center">
            <LoadingSpinner className="size-5" />
          </div>
        ) : (
          <div className={cn("flex flex-col gap-8", hasAnyTasks ? "mt-5" : "mt-8")}>
            <div className="flex w-full flex-col gap-4">
              {hasAnyTasks ? (
                <KeepAwakeBanner checked={settings?.keepAwakeWhileRunning ?? false} onChange={(checked) => void updateSettings({ keepAwakeWhileRunning: checked })} />
              ) : null}
              <div data-automations-task-grid="true" className="contents">
                {offPeakVisible && activeTab !== "scheduled" && offPeakTasks.length > 0 ? (
                  <section className="flex w-full flex-col gap-4">
                    <OffPeakTaskList
                      tasks={offPeakTasks}
                      busyOperationId={offPeakOperationId}
                      onOpen={handleOpenOffPeakEditor}
                      onPause={(task) => void pauseOffPeakTask(task.offPeakTaskId, offPeakTaskService)}
                      onContinue={(task) => void continueOffPeakTask(task.offPeakTaskId, offPeakTaskService)}
                      onCancel={(task) => void handleCancelOffPeakTask(task)}
                      onDelete={(task) => void handleDeleteOffPeakTask(task)}
                      onOpenSession={handleOpenRunSession}
                    />
                  </section>
                ) : null}
                {activeTab === "idle" ? null : automations.length > 0 ? (
                  <section className="flex w-full flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-ui-base font-medium leading-5 text-foreground-subtle">
                        {intl.formatMessage({ id: "automations.createdLabel" })}
                      </h2>
                      {tabs.length === 0 ? <AutomationCreateSplitButton onViaChat={handleCreateViaChatOrManually} onManually={handleCreateManually} /> : null}
                    </div>
                    <div
                      data-testid={AUTOMATIONS_LIST_TESTID}
                      className={cn(
                        "grid grid-cols-1 auto-rows-[132px] gap-x-4 gap-y-4 lg:grid-cols-2",
                        automations.length > 8 && "max-h-[1198px] overflow-y-auto overscroll-contain lg:max-h-[606px]",
                      )}
                    >
                      {automations.map((automation) => {
                        const lifecycleTier = resolveAutomationLifecycleTier(automation);
                        const failed = hasAutomationFailure(automation);
                        const presentation = AUTOMATION_LIFECYCLE_PRESENTATION[lifecycleTier];
                        const TierIcon = presentation.icon;
                        const frequencyLabel = describeAutomationFrequency(automation, intl);
                        const nextRunLabel = describeAutomationNextRun(automation.nextRunAt, nowTick, intl);
                        const scheduleLabel =
                          lifecycleTier === "active" && !failed && nextRunLabel
                            ? `${frequencyLabel} · ${intl.formatMessage({ id: "automations.nextRun" }, { when: nextRunLabel })}`
                            : frequencyLabel;
                        const runCountLabel = intl.formatMessage({ id: "automations.runCount" }, { count: String(automation.runCount) });
                        const busy = operationId?.endsWith(`:${automation.automationId}`) ?? false;
                        const canRestart = isAutomationFailed(automation);
                        const canToggle = isAutomationOperable(automation);
                        return (
                          <div
                            key={automation.automationId}
                            data-testid={AUTOMATION_CARD_TESTID}
                            role="button"
                            tabIndex={0}
                            onClick={() => setViewState({ mode: "edit", automation })}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                setViewState({ mode: "edit", automation });
                              }
                            }}
                            className={cn(
                              "group relative flex h-full min-h-0 cursor-pointer gap-3 overflow-hidden rounded-xl border border-card-border bg-background p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused",
                              lifecycleTier === "completed" ? "opacity-60" : "hover:bg-hover",
                            )}
                          >
                            <div className="flex h-full min-w-0 flex-1 flex-col gap-3">
                              <span className="block truncate pr-12 text-ui-base font-medium leading-5 text-foreground">{automation.title}</span>
                              <p className="text-wrap-phrase line-clamp-2 h-10 text-ui-base font-normal leading-5 text-foreground-subtle">
                                {normalizeAutomationPrompt(automation.prompt)}
                              </p>
                              <div className="mt-auto flex h-6 min-w-0 items-center gap-2 text-ui-base leading-5">
                                <div className="flex min-w-0 flex-1 items-center gap-2">
                                  {failed ? (
                                    <>
                                      <span className="inline-flex shrink-0 items-center py-0.5 pl-1 pr-2 font-normal text-destructive">
                                        <span className="flex size-5 shrink-0 items-center justify-center">
                                          <IconAlertTriangle className="size-4" strokeWidth={1.33} aria-hidden="true" />
                                        </span>
                                        <span className="pl-1">{intl.formatMessage({ id: "automations.lifecycle.failed" })}</span>
                                      </span>
                                      <span className="inline-flex min-w-0 items-center rounded-md bg-success/10 py-0.5 pl-1 pr-2 font-normal text-success opacity-40">
                                        <span className="flex size-5 shrink-0 items-center justify-center">
                                          <AutomationClockIcon className="size-4" aria-hidden="true" />
                                        </span>
                                        <span className="truncate pl-1">{scheduleLabel}</span>
                                      </span>
                                    </>
                                  ) : lifecycleTier === "active" ? (
                                    <AutomationSchedulePill
                                      text={scheduleLabel}
                                      icon={<TierIcon className="size-4 shrink-0" strokeWidth={1.33} aria-hidden="true" />}
                                    />
                                  ) : (
                                    <>
                                      <span className={cn("inline-flex shrink-0 items-center gap-1 font-normal", presentation.className)}>
                                        <span className="flex size-5 shrink-0 items-center justify-center">
                                          <TierIcon className="size-4 shrink-0" strokeWidth={1.33} aria-hidden="true" />
                                        </span>
                                        {intl.formatMessage({ id: `automations.lifecycle.${lifecycleTier}` })}
                                      </span>
                                      {lifecycleTier === "paused" || lifecycleTier === "completed" ? (
                                        <AutomationSchedulePill dimmed text={scheduleLabel} icon={<AutomationClockIcon className="size-4" aria-hidden="true" />} />
                                      ) : null}
                                    </>
                                  )}
                                </div>
                                <span
                                  className={cn(
                                    "inline-flex shrink-0 items-center whitespace-nowrap rounded-md bg-surface px-1.5 py-0.5 text-ui-base font-normal text-foreground-subtle",
                                    (failed || lifecycleTier === "paused") && "opacity-40",
                                  )}
                                >
                                  {runCountLabel}
                                </span>
                              </div>
                            </div>
                            <div className="absolute right-3 top-3 flex items-center gap-1">
                              {busy ? <LoadingSpinner className="size-3.5" /> : null}
                              <AutomationCardMenu
                                automation={automation}
                                busy={busy}
                                canRestart={canRestart}
                                canToggle={canToggle}
                                onRunNow={handleRunNow}
                                onEdit={(target) => setViewState({ mode: "edit", automation: target })}
                                onToggle={handleToggleAutomation}
                                onRestart={handleRestartAutomation}
                                onDelete={handleDeleteAutomation}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ) : (
                  <div
                    data-automations-empty-state="true"
                    className="flex h-[226px] w-full items-center justify-center rounded-2xl border border-card-border bg-background px-4"
                  >
                    <div className="flex translate-y-2 flex-col items-center gap-5">
                      <p className="text-ui-base font-medium leading-5 text-foreground-subtlest">
                        {intl.formatMessage({ id: "automations.empty.title" })}
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <AutomationCreateSplitButton onViaChat={handleCreateViaChatOrManually} onManually={handleCreateManually} />
                        {offPeakCreationEnabled && offPeakTasks.length === 0 ? (
                          <OffPeakCreateButton greyReason={offPeakBlock.reason} greyTooltip={offPeakBlock.tooltip} onCreate={() => setViewState({ mode: "offpeak-create" })} />
                        ) : null}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {hasAnyTasks ? null : (
                <KeepAwakeBanner checked={settings?.keepAwakeWhileRunning ?? false} onChange={(checked) => void updateSettings({ keepAwakeWhileRunning: checked })} />
              )}
            </div>
            {showTemplateSeparator ? (
              <div data-automations-task-template-separator="true" className="flex w-full flex-col py-2" aria-hidden="true">
                <div className="h-px w-full bg-card-border" />
              </div>
            ) : null}
            {showOffPeakTemplates ? (
              <section data-automations-idle-templates="true" className="flex w-full flex-col gap-4">
                <h2 className="text-ui-base font-medium leading-5 text-foreground-subtle">
                  {intl.formatMessage({ id: "offPeak.templates.sectionTitle" })}
                </h2>
                <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  {OFFPEAK_TEMPLATES.map((template) => {
                    const planBlocked = offPeakBlock.reason === "plan";
                    return (
                      <div key={template.id} className="h-full">
                        <button
                          type="button"
                          onClick={() => {
                            if (planBlocked) {
                              showCodingPlanToast();
                              return;
                            }
                            setViewState({
                              mode: "offpeak-create",
                              draft: {
                                title: intl.formatMessage({ id: `offPeak.newTask.template.${template.id}.title` }),
                                prompt: intl.formatMessage({ id: `offPeak.newTask.template.${template.id}.prompt` }),
                                telemetrySource: {
                                  eventRegion: "app.automations",
                                  templateId: template.id,
                                },
                              },
                            });
                          }}
                          className="flex h-full min-h-[114px] w-full flex-col gap-2 overflow-hidden rounded-xl border border-card-border bg-background p-3 text-left transition-colors hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused"
                        >
                          <div className="flex items-center gap-0.5">
                            <OffPeakTemplateIcon className="size-4 shrink-0 text-foreground-subtle" name={template.id} />
                            <span className="truncate px-1 text-ui-base font-medium leading-5 text-foreground">
                              {intl.formatMessage({ id: `offPeak.newTask.template.${template.id}.title` })}
                            </span>
                          </div>
                          <p className="text-wrap-phrase line-clamp-2 flex-1 text-ui-base font-normal leading-5 text-foreground-subtle">
                            {intl.formatMessage({ id: `offPeak.newTask.template.${template.id}.description` })}
                          </p>
                          <div className="text-ui-base font-normal leading-5 text-foreground-subtle">
                            {intl.formatMessage({ id: "offPeak.form.soonestAvailable" })}
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            ) : null}
            {showScheduledTemplates ? (
              <section data-automations-scheduled-templates="true" className="flex w-full flex-col gap-4">
                <h2 className="text-ui-base font-medium leading-5 text-foreground-subtle">{intl.formatMessage({ id: "automations.moreIdeas" })}</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {SCHEDULED_TEMPLATES.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => handleCreateFromTemplate(template)}
                      className="group flex min-h-[114px] flex-col gap-2 overflow-hidden rounded-xl border border-card-border bg-background p-3 text-left transition-colors hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused"
                    >
                      <div className="flex min-w-0 items-center gap-1">
                        <span className="flex size-5 shrink-0 items-center justify-center">
                          <AutomationTemplateIcon className="text-foreground-subtle" name={template.icon} />
                        </span>
                        <span className="truncate text-ui-base font-medium leading-5 text-foreground">
                          {intl.formatMessage({ id: `automations.template.${template.id}.title` })}
                        </span>
                      </div>
                      <p className="line-clamp-2 flex-1 text-ui-base font-normal leading-5 text-foreground-subtle">
                        {intl.formatMessage({ id: `automations.template.${template.id}.description` })}
                      </p>
                      <div className="text-ui-base font-normal leading-5 text-foreground-subtle">
                        {intl.formatMessage({ id: `automations.template.${template.id}.schedule` })}
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        )}
      </div>
    );

  return (
    <AutomationEditor
      editing={viewState.mode === "edit" ? viewState.automation : null}
      initialDraft={viewState.mode === "create" ? viewState.draft : null}
      defaultWorkspacePath={workspacePath}
      defaultWorkspaceIdentity={workspaceIdentity}
      modelProviders={modelProviders}
      modelSelectGroups={modelSelectGroups}
      saving={operationId?.startsWith("automation:create") || operationId?.startsWith("automation:update") || false}
      onBack={() => setViewState({ mode: "list" })}
      onSubmit={handleSubmitAutomation}
      onRunNow={(automation) => handleRunNow(automation, "editor")}
      onToggle={handleToggleAutomation}
      onDelete={(automation) => handleDeleteAutomation(automation, "editor")}
      runsEntry={viewState.mode === "edit" ? runsCache[viewState.automation.automationId] : undefined}
      onLoadRuns={() => {
        if (viewState.mode === "edit") loadRuns(viewState.automation.automationId, zcodeAgentService, true);
      }}
      onDeleteRun={(runId) => {
        if (viewState.mode === "edit") deleteRun(viewState.automation.automationId, runId, zcodeAgentService);
      }}
      onOpenSession={
        viewState.mode === "edit" && onOpenSession
          ? (sessionId) => {
              onOpenSession({
                sessionId,
                workspacePath: viewState.automation.workspacePath ?? "", // A0-CLEANUP3 3b §C：workspacePath 对齐为可选，运行期恒有值
                workspaceIdentity: viewState.automation.workspaceIdentity,
              });
            }
          : undefined
      }
    />
  );
};
