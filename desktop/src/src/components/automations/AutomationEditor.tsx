// A0-S4-4a: 自 modules/SettingsLeaves.tsx §C 自动化编辑器（F15 深层）原样迁入（组件单元；原文件现为薄 re-export shim）。
// 迁出体 = §0 声明群子集（IntlShape/图标 declare/工作区与模型 declare）+ §C 全段（3069–6555，含文件尾注）。SelectItemEntry/SelectGroupEntry/ConfigOption 经 type import 取回子代理族。导入路径按 components/automations/ 深度改指 ../../modules/ / ../ui/。
import * as React from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { Corner as ScrollAreaCorner, Root as ScrollAreaRoot, Scrollbar as ScrollAreaScrollbar, Thumb as ScrollAreaThumb, Viewport as ScrollAreaViewport } from '@radix-ui/react-scroll-area'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { ArrowLeft as IconArrowLeft, ArrowRight as IconArrowRight, ChevronDown as IconChevronDown, ChevronUp as IconChevronUp, Check as IconCheck, Plus as IconPlus, Ellipsis as IconEllipsis, Trash2 as IconTrash, Pencil as IconPencil, ExternalLink as IconExternalLink, RefreshCw as IconRefresh, MessageSquarePlus as IconMessageSquarePlus, Play as IconPlay, CirclePlay as IconCirclePlay, Pause as IconPause, Activity as IconActivity, Info as IconInfo, FolderOpen as IconFolderOpen } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0
import { Button, ChevronLeft as IconChevronLeft, ChevronRight as IconChevronRight } from '../../modules/button';
import { ModelSelector, type ModelGroup } from '../../modules/Composer';
import { Input, Popover, PopoverContent, PopoverTrigger, toast } from '../../modules/ImeComposition';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Tabs, TabsList, TabsTrigger } from '../../modules/Settings';
import { useServices } from '../../modules/services';
import { cn } from '../../modules/UtilsCn';
import { useZCodeIntl as useIntlContext, type ZCodeIntl as IntlShape } from '../../modules/I18n';
import { t as logger } from '../../modules/logger';
import { useConfirmDialog } from '../../modules/Modals'; // U2
import { InfoTooltip as Tooltip } from '../../modules/UsageStatsUiParts'; // Ia
import { parseCustomModelId as parseModelValue } from '../../modules/SkillStore'; // se（src chunk）
import { isGlmModelId as isMaxThinkingModel, GLM_REASONING_LEVELS as MAX_THINKING_LEVELS } from '../../modules/SrcSharedA'; // qn（F12）/ ui=Sl（A0-CLEANUP B-8：MAX_THINKING_LEVELS declare 改指 GLM_REASONING_LEVELS）
import type { SelectItemEntry, SelectGroupEntry, ConfigOption, ModelProvider } from '../settings/SubagentLeaves';
import { resolveModelFullLabel as resolveModelGroupLabel } from '../settings/SubagentLeaves'; // A1-R11：iN（js 53795 = jsx 48441）改指既有属主（A0 期转录；一符一家——UsageDeep §2d 重复转录已删碑）。环安全：SubagentLeaves 值闭包（modules/* + lucide）不反入 automations
import { useAppSettings } from '../../modules/UsageDeep'; // A1-R11：JM（53488）改指 canonical（components/usage/UsageDeep.tsx §2c）；调用点 2113 解构 {settings, update}，2197 读 keepAwakeWhileRunning 具名面、2252 update({keepAwakeWhileRunning}) 补丁逐字不变。环安全：UsageDeep 值闭包不达本文件
import { useWorkspaceTabStore as useWorkspaceTabsStore, isWorkspaceKindTab as isUsableWorkspaceTab, type WorkspaceTab } from '../../modules/WorkspaceTabsDeep'; // A1-R3：pc/oc declare 与本地 WorkspaceTab 型改指 R1 canonical（tombstone 见 §0 声明群）
import {
  automationsWorkspaceKey as workspaceKey, // Ti（src chunk ip，6913；A0-CLEANUP 族清理：对象参工作区键）
  joinTestidParts as testidTemplate, // Xa
  automationFormSubmitTestid as TESTID_AUTOMATION_SAVE, // $t
  automationRunNowTestid as TESTID_AUTOMATION_RUN_NOW, // bn
  automationEditBackTestid as TESTID_AUTOMATION_BACK, // dt
  automationFormTitleTestid as TESTID_AUTOMATION_TITLE, // Rr
  automationSchedulePreviewTestid as TESTID_AUTOMATION_SCHEDULE_BOX, // _ee
  automationScheduleDeleteTestid as TESTID_AUTOMATION_SCHEDULE_DELETE, // mn
  automationScheduleAddTestid as TESTID_AUTOMATION_SCHEDULE_ADD, // Tne
  automationFrequencySelectTestid as TESTID_AUTOMATION_FREQUENCY, // Kt
  automationCustomRepeatEditTestid as TESTID_AUTOMATION_CUSTOM_FREQUENCY, // Dn
  automationFormPromptTestid as TESTID_AUTOMATION_PROMPT, // ree
  automationFrequencyOptionTestid as TESTID_FREQUENCY_OPTION, // Kr
  automationCustomIntervalSelectTestid as TESTID_CUSTOM_INTERVAL_INPUT, // sn
  automationCustomIntervalIncrementTestid as TESTID_CUSTOM_INTERVAL_INC, // zt
  automationCustomIntervalDecrementTestid as TESTID_CUSTOM_INTERVAL_DEC, // ir
  automationCustomUnitSelectTestid as TESTID_CUSTOM_UNIT, // bre
  automationCustomUnitOptionTestid as TESTID_CUSTOM_UNIT_OPTION, // _r
  automationCustomConfirmTestid as TESTID_CUSTOM_CONFIRM, // Un
  automationYearMonthdayTestid as TESTID_ENDDATE_TRIGGER, // wee
  automationYearMonthOptionTestid as TESTID_MONTH_OPTION, // ur
  automationYearDayOptionTestid as TESTID_DAY_OPTION, // dee
  offpeakEditSubmitTestid as TESTID_OFFPEAK_SUBMIT, // Nn
  offpeakFormTitleTestid as TESTID_OFFPEAK_TITLE, // Rt
  offpeakFormInstructionsTestid as TESTID_OFFPEAK_PROMPT, // nr
  offpeakCardMenuTestid as TESTID_OFFPEAK_MENU, // rt
  automationCreateManuallyTestid as TESTID_CREATE_MANUALLY, // Nte
  automationCreateMenuTestid as TESTID_CREATE_MORE, // Fn
} from '../../modules/SrcSharedB';
/* ============================================================================
 * 0. 外部依赖的类型声明
 * ==========================================================================*/

/* ── tombstone〔A1-R172〕面收敛：本地 interface IntlShape（3 行形）删除 → 改采上方 @14既有导入行之 `type ZCodeIntl as IntlShape` 别名 specifier（canonical modules/I18n@201-203 ZCodeIntl）。
 *    〔别名保名〕故本文件 10 处读者（@110／@305／@310／@364／@402／@427／@1462／@1493／@1563／@1668）之名**逐字不变**、零重锚；成员行与 canonical I18n@202 **逐字节同**（md5 d2ffea415e84）→ **型缝 0**。★头注 @2 列 `IntlShape` 为 §0 随族迁入存量——係**历史陈述非假**，本批不动。
 *    全树 11 家已落先例〔modules/Conversation@143、modules/Composer@524、components/payments/PaymentDeep@10700、components/shell/Home@167、components/composer/ConfigSelect@12、components/modals/UpdateStatusDialog@9、components/conversation/{ConversationToolViews@12,ConversationInteractionsOverlay@10,QueuePanel@7,AutomationCards@6,SessionBanners@7}〕 ── */

/* --- 图标（lucide 风格；Sa=createLucideIcon 工厂，button chunk / 本 chunk 图标块） --- */
type IconComponent = React.FC<React.SVGProps<SVGSVGElement> & { size?: number }>;
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（10）：IconArrowLeft/IconArrowRight/IconChevronDown/IconChevronUp/IconChevronLeft/IconChevronRight/IconCheck/IconPlus/IconEllipsis/IconTrash → 真实 import（文件头导入块）：npm lucide-react@1.35.0，其中 button chunk 图标（ChevronLeft/ChevronRight/ZoomIn/ZoomOut）经 './button' pass-1 canonical；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
declare const IconX: IconComponent; // g（imeComposition b）
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（12）：IconPencil/IconExternalLink/IconRefresh/IconCloudUpload/IconSearch/IconSettings/IconPuzzle/IconMessageSquarePlus/IconPlay/IconCirclePlay/IconPause/IconActivity → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
declare const IconStar: IconComponent; // Wv
declare const IconCalendar: IconComponent; // j_
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（6）：IconInfo/IconAlertTriangle/IconTarget/IconFile/IconList/IconRestart → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
declare const IconExternalSession: IconComponent; // P3 包装 = q_
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（1）：IconSpinner → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
declare const IconSpinnerAlt: React.FC<{ className?: string }>; // EN（运行历史加载）

/* ── tombstone（A1-R11）：declare useAppSettings（原 JM，53440——普查行漂移，bundle 真身 53488）删除，
 *    改经文件头 modules/UsageDeep import 消费（canonical = components/usage/UsageDeep.tsx §2c，JM 53488 逐字）。
 *    型缝：2113 解构 {settings, update} 逐字不变；update 形参 AppRuntimeSettingsPatch 对 2252 补丁可赋。 ── */
/* ── tombstone（A1-R3）：useWorkspaceTabsStore（pc 4801）/ isUsableWorkspaceTab（oc）declare 删除
 *    → 真实 import { useWorkspaceTabStore as useWorkspaceTabsStore, isWorkspaceKindTab as isUsableWorkspaceTab }
 *    from '../../modules/WorkspaceTabsDeep'（R1 canonical 属主；文件头导入块）。 ── */
declare const WorkspaceSelectRow: React.FC<{
  workspacePath: string;
  workspaceTabs: Array<{ workspacePath: string; label: string; workspaceIdentity?: string; workspacePurpose?: string }>;
  allowConversationWorkspaceSelection: boolean;
  allowConversationWorkspaceDetach?: boolean;
  onSelectWorkspace: (entry: { workspacePath: string }) => void;
  onSelectConversationWorkspace: () => void;
  allowOpenWorkspace: boolean;
  allowRemoteWorkspace: boolean;
  onOpenFolder: () => void;
  onConnectRemote: () => Promise<string>;
  onSelectRemoteProject: () => Promise<void>;
  onCancelRemoteProject: (entry: unknown) => Promise<void>;
  containerClassName?: string;
  triggerClassName?: string;
  triggerIndicator?: React.ReactNode;
}>; // a4（Home.tsx，styles 128585）
declare const ModeSelector: React.FC<{
  option: ConfigOption | null;
  provider?: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  tooltipTitle?: string;
  triggerVariant?: string;
  triggerSize?: string;
  triggerClassName?: string;
  labelVisibilityClassName?: string;
  restoreFocusSelector?: string | null;
}>; // Mq（F12，js 76864）
declare const ThoughtLevelSelector: React.FC<{
  intl: IntlShape;
  option: ConfigOption;
  provider?: string;
  showInvalidCurrentValue?: boolean;
  disabled?: boolean;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
  restoreFocusSelector?: string | null;
  labelVisibilityClassName?: string;
  indicatorClassName?: string;
  triggerClassName?: string;
  interactionMode?: string;
  onValueChange: (value: string) => void;
}>; // Pq（F08，js 77118）
/* ── tombstone〔A1-R56〕：declare useWorkspaceConfigOptions（原 Jq）删除 → 改指 Home §U.11 useCatalogConfigOptions（Jq 真身：styles 78437–78455，R53 逐字实体化；旧注「js 78389」为 −48 漂移混标，真行 78437，R55 总审偏移类同族实证）。消费面实测：@2685 ≡ bundle 137206（kNt 面 `Jq(He, null, Ue)`），别名导入保调用名（R1 判例），逐字不变。环安全：Home 值闭包不达 components/automations。 ── */
import { useCatalogConfigOptions as useWorkspaceConfigOptions } from '../../modules/Home'; // 〔A1-R56〕Jq 收敛改指，墓碑见上
/* ── tombstone（A0-CLEANUP B-8）：MAX_THINKING_LEVELS declare 删除 → import
 *    { GLM_REASONING_LEVELS as MAX_THINKING_LEVELS } from './SrcSharedA'（原 ui=Sl）。 ── */
/* ── tombstone（A1-R11）：declare resolveModelGroupLabel（原 iN，F08——bundle 真身 53795）删除，
 *    改经文件头 ../settings/SubagentLeaves import 别名消费（canonical = resolveModelFullLabel，
 *    A0 期既有逐字转录，jsx 48441 = js 53795）。型缝精化：真形返回 string | undefined
 *    （item.name 缺失时 rN 53790 透传 undefined——bundle 无注记之诚实面），1015 消费点逐字不变。 ── */
declare function normalizeSettingsOptions(options: unknown[]): ConfigOption[]; // oee（F12）

/* ── tombstone（A1-R3）：本地 WorkspaceTab 型（workspacePath 必具、remoteTarget?: string|null、
 *    workspacePurpose?: string、带索引签名）删除 → type import { WorkspaceTab } from '../../modules/WorkspaceTabsDeep'
 *    （R1 canonical：workspacePath?: string、remoteTarget?: RemoteTarget=unknown、workspacePurpose?: string|null）。
 *    宽化影响面：仅 collectWorkspaceOptions 直读 workspacePath（该处补守卫，见行注）；余皆真值/等值读。 ── */
interface AgentService {
  createSession(args: {
    workspacePath: string;
    workspaceIdentity?: string | null;
    persistence: string;
    model: { providerId: string; modelId: string };
  }): Promise<{ session: { sessionId: string }; settings: unknown }>;
  closeSession(args: { workspacePath: string; workspaceIdentity?: string | null; sessionId: string }): Promise<void>;
  [method: string]: unknown;
}

/* ============================================================================
 * §C. 自动化编辑器（F15 深层；原 js 109250–109510 + 134026–138512）
 * ==========================================================================*/

/* --- C.1 cron 域（原 109250–109510；F03 段双归属，F15 消费） --- */

export interface AutomationTaskLite {
  automationId: string; // A0-CLEANUP3 3b §C：与 SPC.AutomationTask/StoresDeep.Automation 对齐（运行期恒有值，编辑器 ?? 为防御）
  title: string;
  prompt: string;
  cronExpr: string;
  enabled: boolean;
  lifecycleStatus?: string;
  targetTaskId?: string | null;
  scheduleEditedByUser?: boolean;
  scheduleRule?: ScheduleRule | null;
  workspacePath?: string;
  workspaceIdentity?: string | null;
  workspaceKey?: string | null;
  model?: string | null;
  provider?: string | null;
  mode?: string;
  recurring?: boolean;
  endAt?: number | null;
  createdAt?: number;
  updatedAt?: number;
  [key: string]: unknown;
}

/** 原 qht（109250）：状态归一（生命周期 → active/paused/completed/failed） */
export function automationStatusOf(automation: AutomationTaskLite): "active" | "paused" | "completed" | "failed" {
  return automation.lifecycleStatus === "failed"
    ? "failed"
    : automation.lifecycleStatus === "completed"
      ? "completed"
      : automation.lifecycleStatus === "paused" || !automation.enabled
        ? "paused"
        : "active";
}

/** 原 q$（109259）：周序（周一起始显示序） */
export const WEEKDAY_DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
/** 原 J$：补零 */
export function pad2(value: number): string {
  return String(value).padStart(2, "0");
}
/** 原 Jht：30 天阈值（相对时间 ↔ 绝对时间切换） */
const NEXT_RUN_RELATIVE_WINDOW_MS = 720 * 60 * 60 * 1000;

/** 原 Yht（109262）：聊天创建判定（有目标任务） */
export function isChatCreatedAutomation(automation: AutomationTaskLite | null | undefined): boolean {
  return !!automation?.targetTaskId?.trim();
}

export interface ScheduleBuilderState {
  frequency: "hourly" | "daily" | "weekdays" | "weekly" | "monthly" | "custom";
  hour: number;
  minute: number;
  weekdays: number[];
  dayOfMonth: number;
  rawExpr: string;
  customInterval: number;
  customUnit: "minute" | "hourly" | "daily" | "weekly" | "monthly" | "yearly";
  customWeekdays: number[];
  customMonthDays: number[];
  customMonth: number;
  customMonthlyMode: "date" | "weekday";
}

/** 原 Y$（109265）：构建态 → cron 表达式（六分支；custom 按单位细分） */
export function scheduleBuilderToCron(state: ScheduleBuilderState): string {
  const { frequency, hour, minute, weekdays, dayOfMonth, rawExpr } = state;
  switch (frequency) {
    case "hourly":
      return `${minute} * * * *`;
    case "daily":
      return `${minute} ${hour} * * *`;
    case "weekdays":
      return `${minute} ${hour} * * 1-5`;
    case "weekly":
      return `${minute} ${hour} * * ${weekdays.length > 0 ? [...weekdays].sort((a, b) => a - b).join(",") : "*"}`;
    case "monthly":
      return `${minute} ${hour} ${dayOfMonth} * *`;
    case "custom": {
      const interval = Math.max(1, Math.floor(state.customInterval));
      if (state.customUnit === "minute") return interval <= 59 ? `*/${interval} * * * *` : "* * * * *";
      if (state.customUnit === "hourly") return interval <= 24 ? `${minute} */${interval} * * *` : `${minute} * * * *`;
      if (state.customUnit === "daily") return interval <= 31 ? `${minute} ${hour} */${interval} * *` : `${minute} ${hour} * * *`;
      if (state.customUnit === "weekly")
        return `${minute} ${hour} * * ${state.customWeekdays.length > 0 ? state.customWeekdays.join(",") : "1"}`;
      if (state.customUnit === "monthly")
        return state.customMonthlyMode === "weekday"
          ? `${minute} ${hour} * * ${state.customWeekdays[0] ?? 1}#1`
          : `${minute} ${hour} ${state.customMonthDays.length > 0 ? state.customMonthDays.join(",") : "1"} * *`;
      const month = Math.min(12, Math.max(1, Math.floor(state.customMonth)));
      return `${minute} ${hour} ${state.customMonthDays[0] ?? new Date().getDate()} ${month} *`;
    }
    default:
      return rawExpr.trim();
  }
}

/** 原 X$（109296）：cron → 构建态（可表示形式识别；缺省回落 custom 每日） */
export function cronToScheduleBuilder(expr: string): ScheduleBuilderState {
  const base: ScheduleBuilderState = {
    frequency: "custom",
    hour: 9,
    minute: 0,
    weekdays: [1],
    dayOfMonth: 1,
    rawExpr: expr,
    customInterval: 1,
    customUnit: "daily",
    customWeekdays: [1],
    customMonthDays: [1],
    customMonth: new Date().getMonth() + 1,
    customMonthlyMode: "date",
  };
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return base;
  const [minuteExpr, hourExpr, dayExpr, monthExpr, weekdayExpr] = parts;
  const minute = Number(minuteExpr);
  const hour = Number(hourExpr);
  const isNumeric = (value: string) => /^\d+$/.test(value);
  const minuteStep = /^\*\/([1-9]\d*)$/.exec(minuteExpr);
  if (minuteStep && hourExpr === "*" && dayExpr === "*" && monthExpr === "*" && weekdayExpr === "*")
    return { ...base, frequency: "custom", customInterval: Number(minuteStep[1]), customUnit: "minute" };
  const hourStep = /^\*\/(\d+)$/.exec(hourExpr);
  if (isNumeric(minuteExpr) && hourStep && dayExpr === "*" && monthExpr === "*" && weekdayExpr === "*")
    return { ...base, frequency: "custom", minute, customInterval: Math.max(1, Number(hourStep[1])), customUnit: "hourly" };
  const dayStep = /^\*\/(\d+)$/.exec(dayExpr);
  if (isNumeric(minuteExpr) && isNumeric(hourExpr) && dayStep && monthExpr === "*" && weekdayExpr === "*")
    return { ...base, frequency: "custom", hour, minute, customInterval: Math.max(1, Number(dayStep[1])), customUnit: "daily" };
  if (isNumeric(minuteExpr) && hourExpr === "*" && dayExpr === "*" && monthExpr === "*" && weekdayExpr === "*")
    return { ...base, frequency: "hourly", minute };
  if (isNumeric(minuteExpr) && isNumeric(hourExpr) && dayExpr === "*" && monthExpr === "*" && weekdayExpr === "*")
    return { ...base, frequency: "daily", hour, minute };
  if (isNumeric(minuteExpr) && isNumeric(hourExpr) && dayExpr === "*" && monthExpr === "*" && weekdayExpr === "1-5")
    return { ...base, frequency: "weekdays", hour, minute };
  if (isNumeric(minuteExpr) && isNumeric(hourExpr) && dayExpr === "*" && monthExpr === "*" && weekdayExpr !== "*") {
    const days = weekdayExpr
      .split(",")
      .map((value) => Number(value))
      .filter((value) => Number.isInteger(value) && value >= 0 && value <= 6);
    if (days.length > 0) return { ...base, frequency: "weekly", hour, minute, weekdays: days };
  }
  if (isNumeric(minuteExpr) && isNumeric(hourExpr) && isNumeric(dayExpr) && monthExpr === "*" && weekdayExpr === "*")
    return { ...base, frequency: "monthly", hour, minute, dayOfMonth: Number(dayExpr) };
  if (isNumeric(minuteExpr) && isNumeric(hourExpr) && isNumeric(dayExpr) && monthExpr !== "*" && weekdayExpr === "*") {
    const month = Number(monthExpr);
    if (month >= 1 && month <= 12)
      return { ...base, frequency: "custom", hour, minute, customUnit: "yearly", customMonth: month, customMonthDays: [Number(dayExpr)] };
  }
  return base;
}

/** 原 Z$（109373）：星期标签 */
export function weekdayLabel(weekday: number, intl: IntlShape): string {
  return intl.formatMessage({ id: `automations.weekday.${weekday}` });
}

/** 原 Q$（109376）：构建态 → 预览文案（频率分支 + custom 单位细分） */
export function schedulePreviewText(state: ScheduleBuilderState, intl: IntlShape): string {
  const time = `${pad2(state.hour)}:${pad2(state.minute)}`;
  switch (state.frequency) {
    case "hourly":
      return intl.formatMessage({ id: "automations.schedule.hourly" }, { minute: pad2(state.minute) });
    case "daily":
      return intl.formatMessage({ id: "automations.schedule.daily" }, { time });
    case "weekdays":
      return intl.formatMessage({ id: "automations.schedule.weekdays" }, { time });
    case "weekly": {
      const days = [...state.weekdays]
        .sort((a, b) => WEEKDAY_DISPLAY_ORDER.indexOf(a) - WEEKDAY_DISPLAY_ORDER.indexOf(b))
        .map((weekday) => weekdayLabel(weekday, intl))
        .join("、");
      return intl.formatMessage({ id: "automations.schedule.weekly" }, { days, time });
    }
    case "monthly":
      return intl.formatMessage({ id: "automations.schedule.monthly" }, { day: String(state.dayOfMonth), time });
    case "custom":
      if (state.customUnit === "minute")
        return intl.formatMessage({ id: "automations.schedule.customMinutes" }, { interval: String(state.customInterval) });
      if (state.customUnit === "hourly")
        return intl.formatMessage({ id: "automations.schedule.customHourly" }, { interval: String(state.customInterval), time: pad2(state.minute) });
      if (state.customUnit === "weekly") {
        const days = state.customWeekdays
          .map((weekday) => weekdayLabel(weekday, intl))
          .join(intl.formatMessage({ id: "automations.weekday.separator" }));
        return intl.formatMessage({ id: "automations.schedule.customWeekly" }, { interval: String(state.customInterval), days, time });
      }
      return state.customUnit === "monthly"
        ? state.customMonthlyMode === "weekday"
          ? intl.formatMessage(
              { id: "automations.schedule.customMonthlyWeekday" },
              { interval: String(state.customInterval), day: weekdayLabel(state.customWeekdays[0] ?? 1, intl), time },
            )
          : intl.formatMessage(
              { id: "automations.schedule.customMonthlyDates" },
              { interval: String(state.customInterval), days: state.customMonthDays.join(", "), time },
            )
        : state.customUnit === "yearly"
          ? intl.formatMessage(
              { id: "automations.schedule.customYearly" },
              { interval: String(state.customInterval), month: String(state.customMonth), day: String(state.customMonthDays[0] ?? 1), time },
            )
          : intl.formatMessage(
              { id: "automations.schedule.custom" },
              { interval: String(state.customInterval), unit: intl.formatMessage({ id: "automations.customRepeat.unit.day" }), time },
            );
    default:
      return state.rawExpr;
  }
}

/** 原 Xht（109449）：cron 预览（星号/N 分钟直通；不可表示 → 自定义；否则构建态预览） */
export function cronPreviewText(expr: string, intl: IntlShape): string {
  const normalized = expr.trim().replace(/\s+/g, " ");
  const minuteStep = /^\*\/([1-9]\d*) \* \* \* \*$/.exec(normalized);
  if (minuteStep) return intl.formatMessage({ id: "automations.schedule.customMinutes" }, { interval: minuteStep[1] });
  if (/^\d+ \d+ \d+ \d+ \*$/.test(normalized) || /^\d+ \d+ \d+ \*\/\d+ \*$/.test(normalized))
    return intl.formatMessage({ id: "automations.frequency.custom" });
  const builder = cronToScheduleBuilder(normalized);
  return builder.frequency === "custom" && scheduleBuilderToCron(builder) !== normalized
    ? intl.formatMessage({ id: "automations.frequency.custom" })
    : schedulePreviewText(builder, intl);
}

/** 原 Zht（109460）：cron 可表示判定（日级固定/步进除外） */
export function isRepresentableCron(expr: string): boolean {
  const normalized = expr.trim().replace(/\s+/g, " ");
  return /^\d+ \d+ \d+ \d+ \*$/.test(normalized) || /^\d+ \d+ \d+ \*\/\d+ \*$/.test(normalized)
    ? false
    : scheduleBuilderToCron(cronToScheduleBuilder(normalized)) === normalized;
}

/** 原 Qht（109466）：GMT 偏移标签（分钟 → `GMT+H[:MM]`） */
export function gmtOffsetLabel(offsetMinutes = -new Date().getTimezoneOffset()): string {
  if (offsetMinutes === 0) return "GMT";
  const sign = offsetMinutes > 0 ? "+" : "-";
  const abs = Math.abs(offsetMinutes);
  const hours = Math.floor(abs / 60);
  const minutes = abs % 60;
  return `GMT${sign}${hours}${minutes > 0 ? `:${pad2(minutes)}` : ""}`;
}

/** 原 $$（109474）：日期时间格式化（`YYYY-MM-DD HH:mm`；空 → `-`） */
export function formatDateTime(value: number | null | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

/** 原 $ht（109478）：相对时间标签（分/时/日 + 前后） */
export function relativeTimeLabel(target: number, now: number, intl: IntlShape): string {
  const delta = target - now;
  const abs = Math.abs(delta);
  const future = delta >= 0;
  const minuteMs = 60000;
  const hourMs = 60 * minuteMs;
  const dayMs = 24 * hourMs;
  let value: number;
  let unitId: string;
  if (abs < minuteMs) return intl.formatMessage({ id: future ? "automations.time.soon" : "automations.time.justNow" });
  if (abs < hourMs) {
    value = Math.round(abs / minuteMs);
    unitId = "automations.time.minutes";
  } else if (abs < dayMs) {
    value = Math.round(abs / hourMs);
    unitId = "automations.time.hours";
  } else {
    value = Math.round(abs / dayMs);
    unitId = "automations.time.days";
  }
  const amount = intl.formatMessage({ id: unitId }, { value: String(value) });
  return intl.formatMessage({ id: future ? "automations.time.in" : "automations.time.ago" }, { amount });
}

/** 原 egt（109498）：下次运行标签（过去/空 → null；30 天内相对；否则绝对） */
export function resolveNextRunLabel(target: number | null | undefined, now: number, intl: IntlShape): string | null {
  return !target || target <= now ? null : target - now <= NEXT_RUN_RELATIVE_WINDOW_MS ? relativeTimeLabel(target, now, intl) : formatDateTime(target);
}

/** 原 tgt（109502）：运行时长（`Ns` / `Nm Ns`） */
export function formatRunDuration(createdAt: number | undefined, updatedAt: number | undefined): string {
  if (!createdAt || !updatedAt || updatedAt < createdAt) return "-";
  const seconds = Math.round((updatedAt - createdAt) / 1000);
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return minutes <= 0 ? `${rest}s` : `${minutes}m ${rest}s`;
}

/* --- C.2 F15 助手群（原 134026–135575） --- */

/** 原 Rjt（134026）：缺省标题联动（编辑/有初始标题/已触碰/非缺省漂移 → 保持；YMt 消费） */
export function resolveTitleOnDefaultChange(args: {
  currentTitle: string;
  hasInitialTitle: boolean;
  isEditing: boolean;
  nextDefaultTitle: string;
  previousDefaultTitle: string;
  titleTouched: boolean;
}): string {
  return args.isEditing || args.hasInitialTitle || args.titleTouched || args.currentTitle !== args.previousDefaultTitle
    ? args.currentTitle
    : args.nextDefaultTitle;
}

/** 原 ZMt（136058）：同 Rjt 逻辑，字段名 hasInitialDraft（kNt 消费；源码为重复实现） */
export function resolveDraftTitleOnDefaultChange(args: {
  currentTitle: string;
  hasInitialDraft: boolean;
  isEditing: boolean;
  nextDefaultTitle: string;
  previousDefaultTitle: string;
  titleTouched: boolean;
}): string {
  return args.isEditing || args.hasInitialDraft || args.titleTouched || args.currentTitle !== args.previousDefaultTitle
    ? args.currentTitle
    : args.nextDefaultTitle;
}

/** 原 Gjt（134428）：KeepAwakeSwitch（role=switch 自绘；蓝=品牌色/绿=成功色） */
export function KeepAwakeSwitch({
  checked,
  onChange,
  ariaLabel,
  color = "green",
  size = "default",
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel?: string;
  color?: "blue" | "green";
  size?: "default" | "sm";
}) {
  const activeClass = color === "blue" ? "bg-brand" : "bg-success";
  const small = size === "sm";
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
        small ? "h-4 w-8" : "h-5 w-9",
      )}
    >
      <span
        className={cn(
          "absolute inline-block size-3.5 rounded-full shadow transition-all duration-200",
          checked ? (color === "blue" ? "bg-foreground-inverse" : "bg-success-foreground") : "bg-primary",
          checked ? (small ? "left-[17px]" : "left-[18px]") : "left-px",
        )}
      />
    </button>
  );
}

/** 原 E3（134452）：图标尺寸缺省（16/2px） */
const AUTOMATION_ICON_PROPS = { size: 16, strokeWidth: 2 };
/** 原 D3（134453）：chevron 指示容器 */
export function AutomationChevronIndicator({ size = 12, containerSize = 20 }: { size?: number; containerSize?: number }) {
  return (
    <span className={cn("flex shrink-0 items-center justify-center", containerSize === 18 ? "size-4.5" : "size-5")} aria-hidden="true">
      <IconChevronDown size={size} strokeWidth={2} className={size === 14 ? "size-3.5" : "size-3"} />
    </span>
  );
}
/** 原 Kjt/O3/qjt/k3/A3/Jjt/Yjt/j3/Xjt/M3/N3/P3/Zjt/F3（134466–134510）：图标包装族 */
export function AutomationPlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return <IconPlus {...AUTOMATION_ICON_PROPS} {...props} />;
}
export function AutomationInfoIcon(props: React.SVGProps<SVGSVGElement>) {
  return <IconInfo {...AUTOMATION_ICON_PROPS} {...props} />;
}
export function AutomationCalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return <IconCalendar {...AUTOMATION_ICON_PROPS} {...props} />;
}
export function AutomationPauseIcon(props: React.SVGProps<SVGSVGElement>) {
  return <IconPause {...AUTOMATION_ICON_PROPS} {...props} />;
}
export function AutomationPlayIcon(props: React.SVGProps<SVGSVGElement>) {
  return <IconPause {...AUTOMATION_ICON_PROPS} {...props} />;
}
export function AutomationEditIcon(props: React.SVGProps<SVGSVGElement>) {
  return <IconPencil {...AUTOMATION_ICON_PROPS} {...props} />;
}
export function AutomationRunIcon(props: React.SVGProps<SVGSVGElement>) {
  return <IconPlay {...AUTOMATION_ICON_PROPS} {...props} />;
}
export function AutomationResumeIcon(props: React.SVGProps<SVGSVGElement>) {
  return <IconCirclePlay {...AUTOMATION_ICON_PROPS} {...props} />;
}
export function AutomationTemplateStarIcon(props: React.SVGProps<SVGSVGElement>) {
  return <IconStar {...AUTOMATION_ICON_PROPS} fill="currentColor" {...props} />;
}
export function AutomationActiveIcon(props: React.SVGProps<SVGSVGElement>) {
  return <IconActivity {...AUTOMATION_ICON_PROPS} {...props} />;
}
export function AutomationMoreIcon(props: React.SVGProps<SVGSVGElement>) {
  return <IconEllipsis {...AUTOMATION_ICON_PROPS} {...props} />;
}
export function AutomationOpenSessionIcon(props: React.SVGProps<SVGSVGElement>) {
  return <IconExternalLink {...AUTOMATION_ICON_PROPS} {...props} />;
}
export function AutomationRefreshIcon(props: React.SVGProps<SVGSVGElement>) {
  return <IconRefresh {...AUTOMATION_ICON_PROPS} {...props} />;
}
export function AutomationDeleteIcon() {
  return (
    <span className="flex size-5 shrink-0 items-center justify-center" aria-hidden="true">
      <IconTrash className="size-4" {...AUTOMATION_ICON_PROPS} />
    </span>
  );
}

/** 原 Qjt（134511）：返回按钮类名 */
export const AUTOMATION_BACK_BUTTON_CLASS =
  "-m-1 inline-flex w-fit max-w-full min-w-0 items-center gap-1 bg-transparent p-1 text-ui-base leading-5 text-foreground-subtle transition-colors hover:text-foreground active:text-foreground focus-visible:text-foreground focus-visible:outline-none";
/** 原 I3（134512）：字段堆叠类名 */
export const AUTOMATION_FIELD_STACK_CLASS = "flex flex-col gap-1.5";

/** 原 $jt（134513）：空态容器 */
export function AutomationsEmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[226px] items-center justify-center rounded-lg border border-card-border bg-background px-4 text-center text-ui-base text-foreground-subtle">
      {children}
    </div>
  );
}

/** 原 eMt（134518）：settings/history 标签切换 */
export function EditorTabSwitcher({
  value,
  settingsLabel,
  historyLabel,
  onValueChange,
}: {
  value: string;
  settingsLabel: string;
  historyLabel: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <Tabs value={value} onValueChange={(next) => onValueChange(next)} className="gap-0">
      <TabsList className="h-8 rounded-[7px] bg-surface p-0.5">
        {([["settings", settingsLabel], ["history", historyLabel]] as Array<[string, string]>).map(([entryValue, label]) => (
          <TabsTrigger
            key={entryValue}
            value={entryValue}
            className="h-7 flex-none rounded-[6px] border border-transparent px-2 py-1 text-ui-base font-medium leading-snug text-foreground-subtlest transition-colors hover:text-foreground-subtle data-active:border-border data-active:bg-background data-active:text-foreground/80 dark:data-active:border-border dark:data-active:bg-background dark:data-active:text-foreground/80"
          >
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

/** 原 tMt（134543）：KeepAwakeRow（横幅 + 开关；ExtendedViews 接口级实体化） */
export function KeepAwakeRow({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  const { intl } = useIntlContext();
  return (
    <div data-automations-keep-awake className="flex min-h-11 w-full items-center gap-3 overflow-hidden rounded-[10px] bg-surface px-3 py-3 text-foreground-subtle">
      <span className="flex size-5 shrink-0 items-center justify-center" aria-hidden="true">
        <AutomationInfoIcon className="size-4" />
      </span>
      <p className="min-w-0 flex-1 text-ui-base leading-5">{intl.formatMessage({ id: "offPeak.keepAwakeBanner" })}</p>
      <KeepAwakeSwitch checked={checked} ariaLabel={intl.formatMessage({ id: "offPeak.keepAwakeBanner" })} onChange={onChange} color="blue" size="sm" />
    </div>
  );
}

/** 原 L3（134569）：CreateSplitButton（手动创建 + ⌄ 聊天创建；primary/outline 双外观） */
export function CreateSplitButton({
  onViaChat,
  onManually,
  appearance = "primary",
}: {
  onViaChat: () => void;
  onManually: () => void;
  appearance?: "primary" | "outline";
}) {
  const { intl } = useIntlContext();
  const outline = appearance === "outline";
  return (
    <div
      data-appearance={appearance}
      className={cn("inline-flex h-8 items-center overflow-hidden rounded-lg", outline ? "border border-card-border bg-background" : "bg-primary text-primary-foreground")}
    >
      <button
        type="button"
        data-testid={TESTID_CREATE_MANUALLY}
        onClick={onManually}
        className={cn(
          "group inline-flex h-full items-center px-2.5 text-ui-base font-normal leading-5 transition-colors",
          outline ? "hover:bg-hover active:bg-selected" : "hover:bg-primary-foreground/10 active:bg-primary-foreground/20",
        )}
      >
        <span className={cn("transition-opacity", outline ? "opacity-80 group-hover:opacity-100" : "opacity-100")}>
          {intl.formatMessage({ id: "automations.createManually" })}
        </span>
      </button>
      <div className={cn("h-4 w-px", outline ? "bg-surface" : "bg-primary-foreground/10")} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            data-testid={TESTID_CREATE_MORE}
            aria-label={intl.formatMessage({ id: "automations.create" })}
            className={cn(
              "group inline-flex h-full w-7 items-center justify-center transition-colors",
              outline
                ? "hover:bg-hover active:bg-selected data-[state=open]:bg-hover"
                : "hover:bg-primary-foreground/10 active:bg-primary-foreground/20 data-[state=open]:bg-primary-foreground/10",
            )}
          >
            <span className={cn("flex items-center justify-center transition-opacity", outline ? "opacity-80 group-hover:opacity-100 group-data-[state=open]:opacity-100" : "opacity-100")}>
              <AutomationChevronIndicator size={14} />
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-auto min-w-0">
          <DropdownMenuItem className="pr-6" onSelect={onViaChat}>
            {intl.formatMessage({ id: "automations.createViaChat" })}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/** 原 nMt（134639）：历史排序（创建时刻倒序） */
export function sortAutomationRuns<T extends { createdAt: number }>(runs: T[]): T[] {
  return [...runs].sort((a, b) => b.createdAt - a.createdAt);
}
/** 原 rMt/iMt/aMt（134645–134648）：气泡延迟/间隙/侧位判定 */
const AUTOMATION_TOOLTIP_DELAY_MS = 320;
const AUTOMATION_TOOLTIP_GAP = 16;
export function automationTooltipSide(rect: { right: number } | null, containerWidth: number): "right" | "top" {
  return rect && containerWidth - rect.right >= AUTOMATION_TOOLTIP_DELAY_MS + AUTOMATION_TOOLTIP_GAP ? "right" : "top";
}

/** 原 pMt（134945）：PromptCard（@container/composer；invalid 红框） */
export function PromptCard({ invalid = false, children }: { invalid?: boolean; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "flex min-h-42 flex-col overflow-hidden rounded-xl border bg-background transition-colors @container/composer",
        invalid ? "border-destructive" : "border-input-border hover:border-input-border-hover focus-within:border-input-border-focused",
      )}
    >
      {children}
    </div>
  );
}

/** 原 dMt/fMt（134941–134942）：自适应高度上下限 */
const AUTOGROW_MIN_HEIGHT = 116;
const AUTOGROW_MAX_HEIGHT = 156;

/** 原 mMt（134956）：AutoGrowTextarea（高度自适应 116–156 + 溢出滚动切换） */
export function AutoGrowTextarea({
  rows = 5,
  onInput,
  value,
  ...rest
}: {
  rows?: number;
  onInput?: React.FormEventHandler<HTMLTextAreaElement>;
  value: string;
} & Record<string, unknown>) {
  const ref = React.useRef<HTMLTextAreaElement | null>(null);
  const lastHeight = React.useRef<number | null>(null);
  const autoGrow = React.useCallback((element: HTMLTextAreaElement) => {
    const parsed = Number.parseFloat(element.style.height);
    const previous = lastHeight.current;
    const shrinking = previous !== null && Number.isFinite(parsed) && Math.abs(parsed - previous) > 1;
    const scrollHeight = element.scrollHeight;
    if (shrinking) {
      element.style.overflowY = scrollHeight > parsed ? "auto" : "hidden";
      return;
    }
    element.style.height = `${AUTOGROW_MIN_HEIGHT}px`;
    const next = Math.min(Math.max(scrollHeight, AUTOGROW_MIN_HEIGHT), AUTOGROW_MAX_HEIGHT);
    element.style.height = `${next}px`;
    lastHeight.current = next;
    element.style.overflowY = scrollHeight > AUTOGROW_MAX_HEIGHT ? "auto" : "hidden";
  }, []);
  React.useLayoutEffect(() => {
    if (ref.current) autoGrow(ref.current);
  }, [autoGrow, value]);
  const handleInput: React.FormEventHandler<HTMLTextAreaElement> = (event) => {
    autoGrow(event.currentTarget);
    onInput?.(event);
  };
  return (
    <textarea
      {...rest}
      ref={ref}
      value={value}
      rows={rows}
      onInput={handleInput}
      className={cn(
        "-mx-px -mt-px h-29 min-h-29 max-h-39 sm:max-h-none shrink-0 resize-none sm:resize-y overflow-y-hidden rounded-xl border-0 bg-card p-2 text-foreground outline-none placeholder:text-ui-base placeholder:text-foreground-subtlest focus:outline-none",
        AUTOMATION_TEXT_CLASS,
      )}
    />
  );
}
/** 原 z3（134944）：文本类名 */
export const AUTOMATION_TEXT_CLASS = "text-ui-base leading-5";

/** 原 hMt（134992）：PromptCardFooter */
export function PromptCardFooter({ children }: { children: React.ReactNode }) {
  return <div className="-mx-px -mt-px flex min-h-13 shrink-0 flex-wrap items-center justify-between gap-2 p-3 sm:h-13 sm:flex-nowrap">{children}</div>;
}

/** 原 gMt（134998）：OffPeakTaskMenu（暂停/继续/删除） */
export function OffPeakTaskMenu({
  task,
  onPause,
  onContinue,
  onDelete,
}: {
  task: OffPeakTaskRecord;
  onPause?: (task: OffPeakTaskRecord) => void;
  onContinue?: (task: OffPeakTaskRecord) => void;
  onDelete?: (task: OffPeakTaskRecord) => void;
}) {
  const { intl } = useIntlContext();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          data-testid={TESTID_OFFPEAK_MENU}
          aria-label={intl.formatMessage({ id: "automations.moreActions" })}
          className="flex size-8 items-center justify-center rounded-lg border-0 bg-white/[0.06] text-foreground-subtle shadow-none outline-none transition-colors hover:bg-white/10 hover:text-foreground data-[state=open]:bg-white/10 data-[state=open]:text-foreground focus-visible:ring-0"
        >
          <AutomationMoreIcon className="size-4" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={4} className="w-[190px] min-w-[190px] rounded-[10px] border-0 px-1 py-1.5">
        {task.status === "queued" && onPause ? (
          <DropdownMenuItem className="min-h-9 gap-1 rounded-md leading-5" onSelect={() => onPause(task)}>
            <span className="flex size-5 items-center justify-center">
              <AutomationPauseIcon className="size-4" aria-hidden="true" />
            </span>
            {intl.formatMessage({ id: "offPeak.action.pause" })}
          </DropdownMenuItem>
        ) : null}
        {task.status === "paused" && onContinue ? (
          <DropdownMenuItem className="min-h-9 gap-1 rounded-md leading-5" onSelect={() => onContinue(task)}>
            <span className="flex size-5 items-center justify-center">
              <AutomationResumeIcon className="size-4" aria-hidden="true" />
            </span>
            {intl.formatMessage({ id: "offPeak.action.continue" })}
          </DropdownMenuItem>
        ) : null}
        {onDelete ? (
          <>
            <DropdownMenuSeparator className="mx-0 my-0.5" />
            <DropdownMenuItem
              className="min-h-9 gap-1 rounded-md leading-5 !text-destructive data-[highlighted]:!bg-menu-hover data-[highlighted]:!text-destructive focus:!text-destructive [&_svg]:!text-destructive"
              onSelect={() => onDelete(task)}
            >
              <AutomationDeleteIcon />
              {intl.formatMessage({ id: "common.delete" })}
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export interface OffPeakTaskRecord {
  offPeakTaskId: string; // A0-CLEANUP3 3b：与 stores-tasks.OffPeakTask 对齐（运行期恒有值）
  taskId?: string;
  title?: string;
  prompt: string;
  status: string;
  startedAt?: number;
  endedAt?: number;
  historyDeletedAt?: number;
  sessionId?: string | null;
  workspacePath?: string;
  workspaceIdentity?: string | null;
  [key: string]: unknown;
}

/** 原 _Mt（135060）：历史状态样式 */
const OFFPEAK_HISTORY_STATUS_STYLES: Record<string, { dot: string; text: string }> = {
  succeeded: { dot: "bg-success", text: "text-success" },
  failed: { dot: "bg-destructive", text: "text-destructive" },
  skipped: { dot: "bg-foreground-subtlest", text: "text-foreground-subtle" },
  running: { dot: "bg-brand", text: "text-brand" },
};

/** 原 vMt（135068）：任务状态 → 历史状态归一 */
export function offPeakHistoryStatusOf(task: OffPeakTaskRecord): "succeeded" | "failed" | "skipped" | "running" {
  return task.status === "completed" ? "succeeded" : task.status === "failed" ? "failed" : task.status === "cancelled" ? "skipped" : "running";
}

/** 原 ar（src chunk `Q`=_x）：终端状态判定（completed/failed/cancelled） */
declare function isTerminalTaskStatus(status: string): boolean;

/** 原 yMt（135075）：OffPeakHistoryTable（单行表：指令/触发时刻/状态/时长/菜单） */
export function OffPeakHistoryTable({
  task,
  onOpenSession,
  onDelete,
}: {
  task: OffPeakTaskRecord | null | undefined;
  onOpenSession?: (task: OffPeakTaskRecord) => void;
  onDelete?: (task: OffPeakTaskRecord) => void;
}) {
  const { intl } = useIntlContext();
  if (!task?.startedAt || task.historyDeletedAt !== undefined)
    return <AutomationsEmptyState>{intl.formatMessage({ id: "offPeak.history.empty" })}</AutomationsEmptyState>;
  const status = offPeakHistoryStatusOf(task);
  const endedAt = isTerminalTaskStatus(task.status) ? task.endedAt ?? Date.now() : Date.now();
  const durationMinutes = Math.max(1, Math.round((endedAt - task.startedAt) / 60000));
  return (
    <div className="overflow-x-auto rounded-[8px]">
      <table className="w-full text-left text-ui-base font-normal leading-snug tracking-[-0.08px]">
        <thead className="bg-surface text-foreground-subtle">
          <tr className="h-[30px] border-b border-border">
            <th className="px-4 font-normal">{intl.formatMessage({ id: "offPeak.history.col.instructions" })}</th>
            <th className="px-4 font-normal">{intl.formatMessage({ id: "automations.runs.col.triggered" })}</th>
            <th className="px-4 font-normal">{intl.formatMessage({ id: "automations.runs.col.status" })}</th>
            <th className="px-4 font-normal">{intl.formatMessage({ id: "automations.runs.col.duration" })}</th>
            <th className="px-4 font-normal" />
          </tr>
        </thead>
        <tbody>
          <tr className="h-[46px] transition-colors hover:bg-surface-hover">
            <td className="max-w-64 truncate px-4 text-foreground-subtle" title={task.prompt}>
              {task.prompt}
            </td>
            <td className="whitespace-nowrap px-4 text-foreground-subtle">{formatDateTime(task.startedAt)}</td>
            <td className="px-4">
              <span className="flex items-center text-ui-base leading-5 tracking-[-0.18px]">
                <span className="flex size-5 shrink-0 items-center justify-center">
                  <span className={cn("inline-block size-1.5 rounded-full", OFFPEAK_HISTORY_STATUS_STYLES[status].dot)} />
                </span>
                <span className={OFFPEAK_HISTORY_STATUS_STYLES[status].text}>
                  {intl.formatMessage({ id: `automations.runs.status.${status}` })}
                </span>
              </span>
            </td>
            <td className="whitespace-nowrap px-4 text-foreground-subtle">
              {intl.formatMessage({ id: "offPeak.history.durationMinutes" }, { count: durationMinutes })}
            </td>
            <td className="px-4">
              <div className="flex items-center justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      aria-label={intl.formatMessage({ id: "automations.moreActions" })}
                      className="flex size-6 items-center justify-center rounded-[6px] text-foreground-subtle transition-colors hover:bg-white/10 hover:text-foreground data-[state=open]:bg-white/10 data-[state=open]:text-foreground"
                    >
                      <AutomationMoreIcon className="size-4" aria-hidden="true" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="flex w-[160px] min-w-[160px] flex-col gap-0.5 rounded-[10px] border-0 px-1 py-1.5">
                    {task.sessionId && onOpenSession ? (
                      <DropdownMenuItem className="min-h-9 gap-1 rounded-md p-2 text-ui-base leading-5 tracking-[-0.18px]" onSelect={() => onOpenSession(task)}>
                        <span className="flex size-5 items-center justify-center">
                          <AutomationOpenSessionIcon className="size-4" aria-hidden="true" />
                        </span>
                        {intl.formatMessage({ id: "offPeak.goToSession" })}
                      </DropdownMenuItem>
                    ) : null}
                    {task.sessionId && onOpenSession && onDelete ? <DropdownMenuSeparator className="m-0 h-px w-full" /> : null}
                    {onDelete ? (
                      <DropdownMenuItem variant="destructive" className="min-h-9 gap-1 rounded-lg p-2 text-ui-base leading-5 tracking-[-0.18px]" onSelect={() => onDelete(task)}>
                        <AutomationDeleteIcon />
                        {intl.formatMessage({ id: "offPeak.history.delete" })}
                      </DropdownMenuItem>
                    ) : null}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/** 原 H3（135266）：编辑器页容器类名 */
export const AUTOMATION_EDITOR_PAGE_CLASS = "mx-auto w-full max-w-4xl px-4 pb-8 pt-0 lg:px-8 lg:pb-10";

/** 原 G3/K3（135378）：缺省模式/思考级别 */
export const AUTOMATION_DEFAULT_MODE = "build";
export const AUTOMATION_DEFAULT_THOUGHT_LEVEL = "medium";

/** 原 OMt（135380）：思考预览就绪判定 */
export function isThoughtPreviewReady(previewKey: string | null, state: { key: string | null; status: string }): boolean {
  return previewKey === null || (state.key === previewKey && state.status === "ready");
}

/** 原 kMt（135383）：模式值表 */
const AUTOMATION_MODE_VALUES = ["build", "edit", "plan", "yolo"];

/** 原 jMt（135406）：模式选项构造 */
export function buildModeOption(current: string): ConfigOption {
  return {
    id: "mode",
    name: "Mode",
    category: "mode",
    type: "select",
    currentValue: current,
    options: AUTOMATION_MODE_VALUES.map((value) => ({ value, name: value })),
  };
}

/** 原 MMt（135413）：组内条目查找 */
export function findModelGroupItem(groups: SelectGroupEntry[], value: string): SelectItemEntry | null {
  for (const group of groups) {
    const item = group.items.find((entry) => entry.value === value);
    if (item) return item;
  }
  return null;
}

/** 原 q3（135423）：模型组条目解析（精确 → 供应商前缀 → 模型名单一匹配） */
export function resolveModelGroupItem(groups: SelectGroupEntry[], value: string): SelectItemEntry | null {
  const exact = findModelGroupItem(groups, value);
  if (exact) return exact;
  const slash = value.indexOf("/");
  const providerId = slash > 0 ? value.slice(0, slash) : null;
  const modelId = slash > 0 ? value.slice(slash + 1) : value;
  const candidates = groups.flatMap((group) => group.items.filter((item) => parseModelValue(item.value)?.modelName === modelId));
  if (providerId) {
    const filtered = candidates.filter((item) => parseModelValue(item.value)?.providerId === providerId);
    if (filtered.length === 1) return filtered[0] ?? null;
  }
  return candidates.length === 1 ? candidates[0] ?? null : null;
}

/** 原 NMt（135436）：模型标签（组内标签 + 供应商名；缺省回落） */
export function resolveModelLabel(args: {
  modelGroups: SelectGroupEntry[];
  modelProviders: ModelProvider[];
  modelValue: string;
  fallbackLabel: string;
}): string | undefined { // A1-R11 型缝精化：真形 NMt（135453）透传 iN 53795 之 string | undefined 面
  const item = resolveModelGroupItem(args.modelGroups, args.modelValue);
  if (!item) return args.fallbackLabel;
  const providerId = parseModelValue(item.value)?.providerId;
  const providerName = args.modelProviders.find((provider) => provider.id === providerId)?.name;
  return resolveModelGroupLabel({
    modelGroups: args.modelGroups,
    normalizedValue: item.value,
    fallbackLabel: args.fallbackLabel,
    providerId,
    providerName,
  });
}

/** 原 PMt（135449）：思考选项归一（当前值不在选项 → 回退） */
export function normalizeThoughtOption(option: ConfigOption | null | undefined, current: string): ConfigOption | null {
  const options = option?.options ?? [];
  if (options.length === 0) return null;
  const hasCurrent = options.some((entry) => entry.value === current);
  const optionCurrent = typeof option?.currentValue === "string" ? option.currentValue : undefined;
  const resolved = hasCurrent ? current : options.some((entry) => entry.value === optionCurrent) ? (optionCurrent as string) : (options[0]?.value as string);
  return {
    id: "thought_level",
    name: option?.name ?? "Effort",
    category: "thought_level",
    type: "select",
    currentValue: resolved,
    options: options.map((entry) => ({ ...entry })),
  };
}

/** 原 FMt（135464）：思考级别提交值（有解析 → 用户值；编辑态 → null；新建 → undefined） */
export function resolveThoughtLevelPayload(args: { editing: boolean; resolvedThoughtLevel: string; thoughtLevel: string }): string | null | undefined {
  return args.resolvedThoughtLevel ? args.thoughtLevel : args.editing ? null : undefined;
}

/** 原 IMt（135467）：思考预览选项解析（选中模型预览键命中 → 预览；等于工作区模型 → 运行时；否则空） */
export function resolveThoughtPreviewOption(args: {
  currentWorkspaceModelValue?: string;
  previewKey?: string | null;
  previewOption?: ConfigOption | null;
  runtimeOption?: ConfigOption | null;
  selectedModelPreviewKey?: string | null;
  selectedModelValue?: string;
}): ConfigOption | null | undefined {
  if (args.previewKey && args.previewKey === args.selectedModelPreviewKey) return args.previewOption ?? undefined;
  const selected = args.selectedModelValue?.trim();
  const current = args.currentWorkspaceModelValue?.trim();
  if (!selected || selected === current) return args.runtimeOption;
  return undefined;
}

/** 原 LMt（135473）：模型思考选项探测（临时会话 create→读设置→close） */
export async function fetchModelThoughtOption(args: {
  agentService: AgentService;
  workspacePath: string;
  workspaceIdentity?: string | null;
  providerId: string;
  modelId: string;
}): Promise<ConfigOption | null> {
  let sessionId: string | null = null;
  try {
    const created = await args.agentService.createSession({
      workspacePath: args.workspacePath,
      workspaceIdentity: args.workspaceIdentity,
      persistence: "deferred",
      model: { providerId: args.providerId, modelId: args.modelId },
    });
    sessionId = created.session.sessionId;
    return normalizeSettingsOptions(created.settings as unknown[]).find((option) => option.category === "thought_level" && option.type === "select") ?? null;
  } finally {
    if (sessionId) {
      await args.agentService.closeSession({ workspacePath: args.workspacePath, workspaceIdentity: args.workspaceIdentity, sessionId });
    }
  }
}

/** 原 RMt（135496）：本地工作区标签判定 */
export function isLocalWorkspaceTab(tab: WorkspaceTab): boolean {
  return !tab.remoteSessionId && !tab.remoteTarget && !tab.workspaceIdentity;
}

/** 原 J3（135498）：本地工作区标签钩子 */
export function useLocalWorkspaceTabs({ workspaceTabs }: { workspaceTabs: WorkspaceTab[] }): WorkspaceTab[] {
  return React.useMemo(() => workspaceTabs.filter((tab) => isUsableWorkspaceTab(tab) && isLocalWorkspaceTab(tab)), [workspaceTabs]);
}

/** 原 zMt（135501）：远程工作区标签判定 */
export function isRemoteWorkspaceTab(tab: WorkspaceTab | null | undefined): boolean {
  return !!(tab?.remoteSessionId || tab?.remoteTarget || tab?.workspaceIdentity);
}

export interface WorkspaceOption {
  workspacePath: string;
  label: string;
  workspaceIdentity?: string;
  workspacePurpose?: string;
}

/** 原 BMt（135504）：工作区选项收集（会话工作区单份；不可用目录剔除） */
export function collectWorkspaceOptions(tabs: WorkspaceTab[], options: { includeConversationWorkspace?: boolean } = {}): WorkspaceOption[] {
  const collected: WorkspaceOption[] = [];
  let conversationIncluded = false;
  for (const tab of tabs) {
    if (tab.availability === "unavailable-local-directory") continue;
    if (!tab.workspacePath) continue; // A1-R3 型别宽化：canonical workspacePath?: string（本地型原必具）。bundle BMt 无此守卫；oc 预滤（kind==='workspace'）与 store addTab 必具路径保证行为一致
    if (tab.workspacePurpose === "conversation") {
      if (!options.includeConversationWorkspace || conversationIncluded) continue;
      conversationIncluded = true;
      collected.push({ workspacePath: tab.workspacePath, label: "default", workspacePurpose: "conversation" });
      continue;
    }
    collected.push({ workspacePath: tab.workspacePath, label: tab.label || pathTailName(tab.workspacePath) });
  }
  return collected;
}

/** 原 VMt（135523）：工作区选项钩子（工作区标签 store → 本地过滤 → 选项收集） */
export function useWorkspaceOptions(options: { includeConversationWorkspace?: boolean } = {}): WorkspaceOption[] {
  const tabs = useWorkspaceTabsStore((state) => state.tabs);
  const localTabs = useLocalWorkspaceTabs({ workspaceTabs: React.useMemo(() => tabs.filter(isUsableWorkspaceTab), [tabs]) });
  const includeConversation = options.includeConversationWorkspace === true;
  return React.useMemo(() => collectWorkspaceOptions(localTabs, { includeConversationWorkspace: includeConversation }), [includeConversation, localTabs]);
}

/** 原 HMt/JMt/r6（135529/135573/136119）：路径尾名 */
export function pathTailName(path: string): string {
  return path.replace(/\\/g, "/").split("/").filter(Boolean).pop() ?? path;
}

/** 原 UMt（135532）：模型键归一 */
export function normalizeModelKey(value: string): string {
  return value.trim().toLowerCase();
}

/** 原 WMt（135535）：模型配置匹配（id ∨ 各类型模型名） */
export function modelConfigMatches(config: { id: string; modelIdByKind?: Record<string, string> }, model: string): boolean {
  const normalized = normalizeModelKey(model);
  return normalized ? [config.id, ...Object.values(config.modelIdByKind ?? {})].map(normalizeModelKey).includes(normalized) : false;
}

/** 原 GMt（135539）：允许思考级别解析（配置推理表 → max 模型缺省 → 空） */
export function resolveAllowedThoughtLevels(args: {
  model: string;
  thoughtLevel?: string;
  allowedModelConfigs: Array<{ id: string; modelIdByKind?: Record<string, string>; reasoning?: { levels: Record<string, unknown>; defaultLevel?: string } }>;
}): { levels: string[]; defaultLevel: string | undefined } {
  const config = args.allowedModelConfigs.find((entry) => modelConfigMatches(entry, args.model));
  const levels = config?.reasoning ? Object.keys(config.reasoning.levels) : [];
  return levels.length > 0
    ? {
        levels,
        defaultLevel: config?.reasoning?.defaultLevel && levels.includes(config.reasoning.defaultLevel) ? config.reasoning.defaultLevel : levels[0],
      }
    : isMaxThinkingModel(args.model)
      ? { levels: [...MAX_THINKING_LEVELS], defaultLevel: "max" }
      : { levels: [], defaultLevel: undefined };
}

/** 原 KMt（135554）：off-peak 思考选项构造（无级别 → null） */
export function buildOffPeakThoughtOption(args: {
  model: string;
  thoughtLevel?: string;
  allowedModelConfigs: Array<{ id: string; modelIdByKind?: Record<string, string>; reasoning?: { levels: Record<string, unknown>; defaultLevel?: string } }>;
  formatLevelName: (level: string) => string;
}): ConfigOption | null {
  const { levels, defaultLevel } = resolveAllowedThoughtLevels(args);
  return levels.length === 0
    ? null
    : {
        id: "thought_level",
        name: "Thought level",
        category: "thought_level",
        type: "select",
        currentValue: args.thoughtLevel && levels.includes(args.thoughtLevel) ? args.thoughtLevel : defaultLevel && levels.includes(defaultLevel) ? defaultLevel : levels[0],
        options: levels.map((level) => ({ value: level, name: args.formatLevelName(level) })),
      };
}

/** 原 qMt（135572）：模型项恒不锁 */
export const automationModelNeverLocked = (): boolean => false;

/* --- C.3 调度原语（原 136026–137004） --- */

/** 原 Y3（136026）：ScrollArea 封装 */
export function AutomationScrollArea({ className, children, ...rest }: { className?: string; children: React.ReactNode } & Record<string, unknown>) {
  return (
    <ScrollAreaRoot data-slot="scroll-area" className={cn("relative", className)} {...rest}>
      <ScrollAreaViewport
        data-slot="scroll-area-viewport"
        className="size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1"
      >
        {children}
      </ScrollAreaViewport>
      <AutomationScrollbar />
      <ScrollAreaCorner className="bg-transparent" />
    </ScrollAreaRoot>
  );
}

/** 原 XMt（136042）：Scrollbar */
export function AutomationScrollbar({ className, orientation = "vertical", ...rest }: { className?: string; orientation?: "horizontal" | "vertical" } & Record<string, unknown>) { // A0-S3c：收真实 radix Scrollbar orientation 联合（XMt@136042 透传）
  return (
    <ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        "flex touch-none select-none transition-colors data-horizontal:h-2 data-horizontal:flex-col data-horizontal:p-[2px] data-vertical:h-full data-vertical:w-2 data-vertical:p-[2px]",
        className,
      )}
      {...rest}
    >
      <ScrollAreaThumb data-slot="scroll-area-thumb" className="relative min-h-2 min-w-2 flex-1 rounded-full bg-border" />
    </ScrollAreaScrollbar>
  );
}

/** 原 QMt（136068）：变更字段集计算（基线有值 ∧ 当前不同） */
export function changedFieldsOf(args: { touchedFields: Set<string>; baseline: Record<string, string>; current: Record<string, string> }): string[] {
  return [...args.touchedFields].filter((field) => args.baseline[field] !== undefined && args.current[field] !== args.baseline[field]);
}

/** 原 $Mt（136073）：必填缺失集（标题/计划/提示词） */
export function missingRequiredFields(args: { title: string; cronExpr: string; prompt: string }): string[] {
  const missing: string[] = [];
  if (!args.title.trim()) missing.push("title");
  if (!args.cronExpr.trim()) missing.push("schedule");
  if (!args.prompt.trim()) missing.push("prompt");
  return missing;
}

/** 原 eNt（136082）：集合移除（不可变） */
export function removeFromSet<T>(set: Set<T>, value: T): Set<T> {
  if (!set.has(value)) return set;
  const next = new Set(set);
  next.delete(value);
  return next;
}

/* ── tombstone（A0-CLEANUP 族清理）：workspaceKey（原 Ti = src chunk ip，6913）declare 删除 →
   import { automationsWorkspaceKey as workspaceKey } from './SrcSharedB'。 ── */

/** 原 X3（136087）：工作区选项键（= workspaceKey） */
export function workspaceOptionKey(option: WorkspaceOption): string {
  return workspaceKey(option);
}

/** 原 Z3（136090）：按键查找工作区选项 */
export function findWorkspaceOption(options: WorkspaceOption[], key: string | null | undefined): WorkspaceOption | undefined {
  return options.find((option) => workspaceOptionKey(option) === key);
}

/** 原 tNt（136093）：工作区选项解析（当前键 → 缺省键 → 首项） */
export function resolveWorkspaceOptionKey(
  options: WorkspaceOption[],
  currentKey: string | null,
  fallback: { workspacePath: string; workspaceIdentity?: string | null } | null,
): string | null {
  const current = findWorkspaceOption(options, currentKey);
  if (current) return workspaceOptionKey(current);
  const fallbackOption = findWorkspaceOption(options, fallback ? workspaceKey(fallback) : null);
  if (fallbackOption) return workspaceOptionKey(fallbackOption);
  const first = options[0];
  return first ? workspaceOptionKey(first) : null;
}

/** 原 Q3（136101）：模型继承哨兵（与子代理域同值） */
export const AUTOMATION_MODEL_INHERIT = "inherit";
/** 原 $3（136103）：频率值表 */
export const AUTOMATION_FREQUENCIES = ["hourly", "daily", "weekdays", "weekly", "monthly", "custom"];
/** 原 rNt：频率守卫 */
export function isAutomationFrequency(value: string): value is ScheduleBuilderState["frequency"] {
  return AUTOMATION_FREQUENCIES.includes(value);
}
/** 原 e6（136105）：运行历史页大小 */
export const AUTOMATION_RUNS_PAGE_SIZE = 8;
/** 原 t6/iNt/n6（136106–136108）：自定义区间 0–200 */
const CUSTOM_INTERVAL_FLOOR = 0;
const CUSTOM_INTERVAL_MIN = 1;
const CUSTOM_INTERVAL_MAX = 200;

/** 原 aNt（136109）：分页窗口（≤7 全列；否则首三 + 邻域 + 尾三 + 省略号） */
export function paginationWindow(current: number, total: number): Array<number | "ellipsis"> {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const anchors = [...new Set([1, 2, 3, total - 2, total - 1, total, current - 1, current, current + 1])]
    .filter((value) => value >= 1 && value <= total)
    .sort((a, b) => a - b);
  const window: Array<number | "ellipsis"> = [];
  let previous = 0;
  for (const value of anchors) {
    if (previous && value - previous > 1) window.push("ellipsis");
    window.push(value);
    previous = value;
  }
  return window;
}

/** 原 oNt（136122）：模型组缺省值（首个非空条目值） */
export function defaultModelFromGroups(groups: SelectGroupEntry[]): string {
  for (const group of groups) {
    const item = group.items.find((entry) => entry.value.trim().length > 0);
    if (item) return item.value;
  }
  return AUTOMATION_MODEL_INHERIT;
}

/** 原 sNt（136130）：当前模型配置项值提取 */
export function currentModelOptionValue(options: ConfigOption[]): string | null {
  const modelOption = options.find((option) => option.category === "model" && option.type === "select");
  return typeof modelOption?.currentValue === "string" && modelOption.currentValue.trim().length > 0 ? modelOption.currentValue : null;
}

/** 原 cNt（136135）：思考配置项提取 */
export function findThoughtOption(options: ConfigOption[]): ConfigOption | undefined {
  return options.find((option) => option.category === "thought_level" && option.type === "select");
}

/** 原 lNt/a6（136141）：Select 弹层/条目类名 */
const AUTOMATION_SELECT_CONTENT_CLASS =
  "w-[var(--radix-select-trigger-width)] px-0 py-1.5 [&_[data-position=popper]]:px-1 [&_[data-slot=select-scroll-up-button]]:hidden [&_[data-slot=select-scroll-down-button]]:hidden";
const AUTOMATION_SELECT_ITEM_CLASS =
  "min-h-8 rounded-[8px] px-2 py-1.5 pr-8 text-ui-base leading-5 text-foreground-subtle data-[highlighted]:bg-menu-hover data-[highlighted]:text-foreground data-[state=checked]:bg-menu-hover data-[state=checked]:text-foreground";

/** 原 uNt（136143）：Select 指示器 */
export function AutomationSelectIndicator() {
  return (
    <span className="flex size-5 shrink-0 items-center justify-center" aria-hidden="true">
      <IconChevronDown className="size-4" strokeWidth={2} />
    </span>
  );
}

/** 原 dNt（136150）：日历图标（调度工具族；与 §B.2 图标包装族 qjt 的 AutomationCalendarIcon 为不同源符号） */
export function ScheduleCalendarIcon({ className }: { className?: string }) {
  return <IconCalendar className={className} strokeWidth={2} />;
}

/** 原 fNt（136153）：时分列（滚动居中选中项） */
export function HourMinuteColumn({ count, selected, onSelect }: { count: number; selected: number; onSelect: (value: number) => void }) {
  const selectedRef = React.useRef<HTMLButtonElement | null>(null);
  React.useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: "center" });
  }, []);
  return (
    <AutomationScrollArea className="h-52 w-14 shrink-0">
      <div className="flex flex-col gap-0.5 p-1">
        {Array.from({ length: count }, (_, index) => index).map((value) => (
          <button
            key={value}
            ref={value === selected ? selectedRef : undefined}
            type="button"
            onClick={() => onSelect(value)}
            className={cn(
              "rounded-md px-2 py-1 text-center text-ui-base tabular-nums transition-colors",
              value === selected ? "bg-menu-hover text-foreground" : "text-foreground-subtle hover:bg-menu-hover hover:text-foreground",
            )}
          >
            {pad2(value)}
          </button>
        ))}
      </div>
    </AutomationScrollArea>
  );
}

/** 原 pNt（136185）：TimePicker（HH:MM 触发 + 双列弹层） */
export function TimePicker({
  hour,
  minute,
  onChange,
  ariaLabel,
}: {
  hour: number;
  minute: number;
  onChange: (hour: number, minute: number) => void;
  ariaLabel?: string;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={ariaLabel}
          className="inline-flex h-auto items-center gap-1 rounded-lg bg-hover py-px pl-2 pr-1.5 text-ui-base leading-5 tabular-nums text-foreground transition-colors hover:bg-selected focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-input-border-focused"
        >
          {pad2(hour)}
          {":"}
          {pad2(minute)}
          <span className="shrink-0 text-foreground-subtle">
            <AutomationChevronIndicator />
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" side="bottom" className="w-29 flex-row gap-0 p-0">
        <HourMinuteColumn count={24} selected={hour} onSelect={(next) => onChange(next, minute)} />
        <div className="w-px shrink-0 bg-border" />
        <HourMinuteColumn count={60} selected={minute} onSelect={(next) => onChange(hour, next)} />
      </PopoverContent>
    </Popover>
  );
}

/** 原 mNt（136222）：值列（月/日；带 testid 前缀） */
export function ValueColumn({
  values,
  selected,
  onSelect,
  buttonTestIdPrefix,
}: {
  values: number[];
  selected: number;
  onSelect: (value: number) => void;
  buttonTestIdPrefix?: string;
}) {
  const selectedRef = React.useRef<HTMLButtonElement | null>(null);
  React.useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: "center" });
  }, []);
  return (
    <AutomationScrollArea className="h-52 w-14 shrink-0">
      <div className="flex flex-col gap-0.5 p-1">
        {values.map((value) => (
          <button
            key={value}
            ref={value === selected ? selectedRef : undefined}
            type="button"
            data-testid={buttonTestIdPrefix ? testidTemplate(buttonTestIdPrefix, String(value)) : undefined}
            onClick={() => onSelect(value)}
            className={cn(
              "rounded-md px-2 py-1 text-center text-ui-sm tabular-nums transition-colors",
              value === selected ? "bg-primary text-primary-foreground" : "text-foreground-subtle hover:bg-surface-hover",
            )}
          >
            {pad2(value)}
          </button>
        ))}
      </div>
    </AutomationScrollArea>
  );
}

/** 原 hNt（136255）：月天数 */
export function daysInMonth(month: number): number {
  return new Date(2024, month, 0).getDate();
}

/** 原 gNt（136258）：MonthDayPicker（月/日双列；日随月钳制） */
export function MonthDayPicker({
  month,
  day,
  intl,
  onChange,
}: {
  month: number;
  day: number;
  intl: IntlShape;
  onChange: (month: number, day: number) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const months = Array.from({ length: 12 }, (_, index) => index + 1);
  const days = Array.from({ length: daysInMonth(month) }, (_, index) => index + 1);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-testid={TESTID_ENDDATE_TRIGGER}
          aria-label={intl.formatMessage({ id: "automations.form.schedule.yearDateLabel" })}
          className="inline-flex h-auto items-center gap-1 rounded-lg bg-hover py-px pl-2 pr-1.5 text-ui-base leading-5 tabular-nums text-foreground transition-colors hover:bg-selected focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-input-border-focused"
        >
          {intl.formatMessage({ id: "automations.form.schedule.monthDayValue" }, { month: String(month), day: String(day) })}
          <span className="shrink-0 text-foreground-subtle">
            <AutomationChevronIndicator />
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" side="bottom" className="w-29 flex-row gap-0 p-0">
        <ValueColumn values={months} selected={month} buttonTestIdPrefix={TESTID_MONTH_OPTION} onSelect={(next) => onChange(next, Math.min(day, daysInMonth(next)))} />
        <div className="w-px shrink-0 bg-border" />
        <ValueColumn values={days} selected={day} buttonTestIdPrefix={TESTID_DAY_OPTION} onSelect={(next) => onChange(month, next)} />
      </PopoverContent>
    </Popover>
  );
}

/** 原 _Nt（136309）：WeekdayPicker（多选；末项保护） */
export function WeekdayPicker({ weekdays, intl, onChange }: { weekdays: number[]; intl: IntlShape; onChange: (weekdays: number[]) => void }) {
  const label = WEEKDAY_DISPLAY_ORDER.filter((weekday) => weekdays.includes(weekday))
    .map((weekday) => intl.formatMessage({ id: `automations.weekday.${weekday}` }))
    .join(intl.formatMessage({ id: "automations.weekday.separator" }));
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={intl.formatMessage({ id: "automations.form.schedule.weekdaysLabel" })}
          className="inline-flex h-auto max-w-full items-center gap-0.5 rounded-lg bg-hover py-px pl-2 pr-0.5 text-ui-base leading-5 text-foreground transition-colors hover:bg-selected data-[state=open]:bg-selected focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-input-border-focused"
        >
          <span className="truncate">{label}</span>
          <AutomationChevronIndicator />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-40 p-1">
        {WEEKDAY_DISPLAY_ORDER.map((weekday) => {
          const included = weekdays.includes(weekday);
          return (
            <button
              key={weekday}
              type="button"
              onClick={() => {
                if (included && weekdays.length === 1) return;
                onChange(included ? weekdays.filter((entry) => entry !== weekday) : [...weekdays, weekday]);
              }}
              className="flex h-7 w-full items-center gap-2 rounded-md px-2 text-left text-ui-base text-foreground transition-colors hover:bg-menu-hover"
            >
              <span className="min-w-0 flex-1 truncate">{intl.formatMessage({ id: `automations.weekday.${weekday}` })}</span>
              <span className="flex size-4 shrink-0 items-center justify-center">{included ? <IconCheck className="size-3.5" aria-hidden="true" /> : null}</span>
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}

/** 原 o6（136362）：日期 → `YYYY-MM-DD`（缺省明天） */
export function toDateString(value?: number): string {
  const date = value ? new Date(value) : new Date(Date.now() + 1440 * 60 * 1000);
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/** 原 vNt（136366）：日期串 → 当日末时刻戳（非法 → undefined） */
export function dateStringToEndTimestamp(value: string): number | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 23, 59, 59, 999);
  return Number.isNaN(date.getTime()) ? undefined : date.getTime();
}

/** 原 yNt（136371）：日期串 → Date（非法 → null） */
export function dateStringToDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** 原 bNt（136378）：EndDatePicker（月历弹层；过去日期禁用；今日环） */
export function EndDatePicker({
  disabled,
  intl,
  min,
  onChange,
  value,
}: {
  disabled: boolean;
  intl: IntlShape;
  min: string;
  onChange: (value: string) => void;
  value: string;
}) {
  const [open, setOpen] = React.useState(false);
  const selected = dateStringToDate(value);
  const minDate = dateStringToDate(min);
  const [viewDate, setViewDate] = React.useState<Date>(() => selected ?? minDate ?? new Date());
  React.useEffect(() => {
    if (open && selected) setViewDate(selected);
  }, [open, selected?.getTime()]);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const dayCount = new Date(year, month + 1, 0).getDate();
  const todayString = toDateString(Date.now());
  const monthLabel = intl.formatMessage({ id: "automations.customRepeat.monthLabel" }, { year: String(year), month: String(month + 1) });
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className="inline-flex h-9 w-[135px] items-center justify-center gap-1.5 rounded-lg border border-input-border bg-input pl-3 pr-3.5 text-ui-base font-normal leading-5 tracking-[-0.18px] text-foreground transition-colors hover:border-input-border-hover hover:bg-input/80 data-[state=open]:border-input-border-hover data-[state=open]:bg-input/80 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-input-border disabled:hover:bg-input"
        >
          <ScheduleCalendarIcon className="size-5 shrink-0 text-foreground-subtle" />
          <span className="tabular-nums">{selected ? `${selected.getFullYear()}/${pad2(selected.getMonth() + 1)}/${pad2(selected.getDate())}` : value}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-3">
        <div className="mb-3 flex h-8 items-center justify-between">
          <span className="text-ui-sm font-medium text-foreground">{monthLabel}</span>
          <div className="flex items-center gap-1">
            <Button type="button" variant="ghost" size="icon-sm" onClick={() => setViewDate(new Date(year, month - 1, 1))} aria-label={intl.formatMessage({ id: "automations.customRepeat.previousMonth" })}>
              <IconChevronLeft className="size-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon-sm" onClick={() => setViewDate(new Date(year, month + 1, 1))} aria-label={intl.formatMessage({ id: "automations.customRepeat.nextMonth" })}>
              <IconChevronRight className="size-4" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {[0, 1, 2, 3, 4, 5, 6].map((weekday) => (
            <span key={weekday} className="flex size-8 items-center justify-center text-ui-sm text-foreground-subtlest">
              {intl.formatMessage({ id: `automations.weekday.${weekday}` })}
            </span>
          ))}
          {Array.from({ length: firstWeekday }, (_, index) => (
            <span key={`blank-${index}`} className="size-8" />
          ))}
          {Array.from({ length: dayCount }, (_, index) => index + 1).map((day) => {
            const cell = `${year}-${pad2(month + 1)}-${pad2(day)}`;
            const isSelected = cell === value;
            const isToday = cell === todayString;
            const isPast = cell < min;
            return (
              <button
                key={day}
                type="button"
                disabled={isPast}
                onClick={() => {
                  onChange(cell);
                  setOpen(false);
                }}
                className={cn(
                  "flex size-8 items-center justify-center rounded-[8px] text-ui-base tabular-nums transition-colors",
                  isSelected ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-menu-hover",
                  isToday && !isSelected && "ring-1 ring-inset ring-border-hover",
                  isPast && "cursor-not-allowed text-foreground-subtlest opacity-35",
                )}
              >
                {day}
              </button>
            );
          })}
          {Array.from({ length: 42 - firstWeekday - dayCount }, (_, index) => (
            <span key={`trailing-blank-${index}`} className="size-8" />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export interface CustomRepeatConfirmPayload {
  interval: number;
  unit: ScheduleBuilderState["customUnit"];
  weekdays: number[];
  monthDays: number[];
  monthlyMode: "date" | "weekday";
  endAt?: number;
}

/** 原 xNt（136501）：CustomRepeatDialog（频率 + 单位 + 周几/日期规则 + 结束日期） */
export function CustomRepeatDialog({
  builder,
  endAt,
  intl,
  onConfirm,
  onOpenChange,
  open,
}: {
  builder: ScheduleBuilderState;
  endAt: number | undefined;
  intl: IntlShape;
  onConfirm: (payload: CustomRepeatConfirmPayload) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const [intervalInput, setIntervalInput] = React.useState(String(builder.customInterval));
  const [unit, setUnit] = React.useState<ScheduleBuilderState["customUnit"]>(builder.customUnit);
  const [weekdays, setWeekdays] = React.useState<number[]>(builder.customWeekdays);
  const [monthDays, setMonthDays] = React.useState<number[]>(builder.customMonthDays);
  const [monthlyMode, setMonthlyMode] = React.useState<"date" | "weekday">(builder.customMonthlyMode);
  const [hasEnd, setHasEnd] = React.useState(endAt !== undefined);
  const [endValue, setEndValue] = React.useState(toDateString(endAt));
  React.useEffect(() => {
    if (open) {
      setIntervalInput(String(builder.customInterval));
      setUnit(builder.customUnit);
      setWeekdays(builder.customWeekdays);
      setMonthDays(builder.customMonthDays);
      setMonthlyMode(builder.customMonthlyMode);
      setHasEnd(endAt !== undefined);
      setEndValue(toDateString(endAt));
    }
  }, [builder, endAt, open]);
  const interval = Number(intervalInput);
  const intervalValid = /^\d+$/.test(intervalInput) && Number.isInteger(interval) && interval >= CUSTOM_INTERVAL_MIN && interval <= CUSTOM_INTERVAL_MAX;
  const canIncrement = intervalInput === "" || interval < CUSTOM_INTERVAL_MAX;
  const canDecrement = intervalInput !== "" && interval > CUSTOM_INTERVAL_FLOOR;
  const step = (delta: number) => {
    const base = /^\d+$/.test(intervalInput) ? interval : CUSTOM_INTERVAL_FLOOR;
    const next = Math.min(CUSTOM_INTERVAL_MAX, Math.max(CUSTOM_INTERVAL_FLOOR, base + delta));
    setIntervalInput(String(next));
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[calc(100vh-2rem)] w-[400px] gap-0 overflow-y-auto rounded-xl border-border bg-card p-0 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)]"
        aria-describedby={undefined}
        showCloseButton={false}
      >
        <DialogHeader className="px-5 pb-5 pt-5">
          <DialogTitle className="text-ui-xl font-medium leading-[26px] tracking-[-0.12px]">{intl.formatMessage({ id: "automations.customRepeat.title" })}</DialogTitle>
          <DialogClose asChild>
            <button
              type="button"
              aria-label={intl.formatMessage({ id: "common.close" })}
              className="absolute right-5 top-5 flex size-6 items-center justify-center rounded-[6px] opacity-80 transition-colors hover:bg-surface-hover hover:opacity-100"
            >
              <IconX className="size-4" strokeWidth={2} aria-hidden="true" />
            </button>
          </DialogClose>
        </DialogHeader>
        <div className="space-y-5 px-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="automation-custom-interval" className="text-ui-base leading-5 tracking-[-0.18px] text-foreground">
              {intl.formatMessage({ id: "automations.customRepeat.frequency" })}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Input
                  id="automation-custom-interval"
                  type="number"
                  min={CUSTOM_INTERVAL_FLOOR}
                  max={CUSTOM_INTERVAL_MAX}
                  step={1}
                  inputMode="numeric"
                  value={intervalInput}
                  aria-invalid={!intervalValid}
                  className="h-9 rounded-lg px-3 pr-10 text-mobile-input-safe leading-6 tracking-[-0.18px] [appearance:textfield] md:text-ui-base md:leading-5 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  data-testid={TESTID_CUSTOM_INTERVAL_INPUT}
                  onChange={(event) => {
                    const next = event.target.value;
                    if (next === "" || /^\d+$/.test(next)) setIntervalInput(next);
                  }}
                />
                <div className="absolute inset-y-px right-px flex w-8 flex-col overflow-hidden rounded-r-[7px] border-l border-input-border bg-input">
                  <button
                    type="button"
                    aria-label="+1"
                    title="+1"
                    data-testid={TESTID_CUSTOM_INTERVAL_INC}
                    disabled={!canIncrement}
                    onClick={() => step(1)}
                    className="flex flex-1 items-center justify-center border-b border-input-border text-foreground-subtle transition-colors hover:bg-input-focused hover:text-foreground focus-visible:z-10 focus-visible:bg-input-focused focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40"
                  >
                    <IconChevronUp className="size-3" strokeWidth={2} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    aria-label="-1"
                    title="-1"
                    data-testid={TESTID_CUSTOM_INTERVAL_DEC}
                    disabled={!canDecrement}
                    onClick={() => step(-1)}
                    className="flex flex-1 items-center justify-center text-foreground-subtle transition-colors hover:bg-input-focused hover:text-foreground focus-visible:z-10 focus-visible:bg-input-focused focus-visible:outline-none disabled:pointer-events-none disabled:opacity-40"
                  >
                    <IconChevronDown className="size-3" strokeWidth={2} aria-hidden="true" />
                  </button>
                </div>
              </div>
              <Select
                value={unit}
                onValueChange={(value) => {
                  const next = value as ScheduleBuilderState["customUnit"];
                  setUnit(next);
                  if (next === "yearly") setMonthDays([new Date().getDate()]);
                }}
              >
                <SelectTrigger
                  className="h-9 w-full rounded-[8px] px-3 text-ui-base leading-5 tracking-[-0.18px] hover:bg-input/80 data-[state=open]:border-input-border-hover data-[state=open]:bg-input/80"
                  data-testid={TESTID_CUSTOM_UNIT}
                  indicator={<AutomationSelectIndicator />}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" align="start" side="bottom" sideOffset={4} collisionPadding={8} className={AUTOMATION_SELECT_CONTENT_CLASS}>
                  <SelectItem value="minute" className={AUTOMATION_SELECT_ITEM_CLASS} data-testid={testidTemplate(TESTID_CUSTOM_UNIT_OPTION, "minute")}>
                    {intl.formatMessage({ id: "automations.customRepeat.unit.minute" })}
                  </SelectItem>
                  <SelectItem value="hourly" className={AUTOMATION_SELECT_ITEM_CLASS} data-testid={testidTemplate(TESTID_CUSTOM_UNIT_OPTION, "hourly")}>
                    {intl.formatMessage({ id: "automations.customRepeat.unit.hour" })}
                  </SelectItem>
                  <SelectItem value="daily" data-testid={testidTemplate(TESTID_CUSTOM_UNIT_OPTION, "daily")}>
                    {intl.formatMessage({ id: "automations.customRepeat.unit.day" })}
                  </SelectItem>
                  <SelectItem value="weekly" data-testid={testidTemplate(TESTID_CUSTOM_UNIT_OPTION, "weekly")}>
                    {intl.formatMessage({ id: "automations.customRepeat.unit.week" })}
                  </SelectItem>
                  <SelectItem value="monthly" data-testid={testidTemplate(TESTID_CUSTOM_UNIT_OPTION, "monthly")}>
                    {intl.formatMessage({ id: "automations.customRepeat.unit.month" })}
                  </SelectItem>
                  <SelectItem value="yearly" data-testid={testidTemplate(TESTID_CUSTOM_UNIT_OPTION, "yearly")}>
                    {intl.formatMessage({ id: "automations.customRepeat.unit.year" })}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {unit === "weekly" ? (
            <div className="grid grid-cols-7 gap-2">
              {WEEKDAY_DISPLAY_ORDER.map((weekday) => {
                const included = weekdays.includes(weekday);
                return (
                  <button
                    key={weekday}
                    type="button"
                    onClick={() => {
                      if (included && weekdays.length === 1) return;
                      setWeekdays(included ? weekdays.filter((entry) => entry !== weekday) : [...weekdays, weekday]);
                    }}
                    className={cn(
                      "flex h-9 items-center justify-center rounded-md border text-ui-base",
                      included ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-surface-hover",
                    )}
                  >
                    {intl.formatMessage({ id: `automations.weekday.${weekday}` })}
                  </button>
                );
              })}
            </div>
          ) : null}
          {unit === "monthly" ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-ui-base text-foreground">{intl.formatMessage({ id: "automations.customRepeat.rule" })}</span>
                <Select value={monthlyMode} onValueChange={(value) => setMonthlyMode(value as "date" | "weekday")}>
                  <SelectTrigger className="h-9 w-32 rounded-[8px] px-3 text-ui-base hover:bg-input/80 data-[state=open]:border-input-border-hover data-[state=open]:bg-input/80" indicator={<AutomationSelectIndicator />}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" align="start" side="bottom" sideOffset={4} collisionPadding={8} className={AUTOMATION_SELECT_CONTENT_CLASS}>
                    <SelectItem value="date" className={AUTOMATION_SELECT_ITEM_CLASS}>
                      {intl.formatMessage({ id: "automations.customRepeat.byDate" })}
                    </SelectItem>
                    <SelectItem value="weekday" className={AUTOMATION_SELECT_ITEM_CLASS}>
                      {intl.formatMessage({ id: "automations.customRepeat.byWeekday" })}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {monthlyMode === "date" ? (
                <div className="grid grid-cols-10 gap-2.5">
                  {Array.from({ length: 31 }, (_, index) => index + 1).map((day) => {
                    const included = monthDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          if (included && monthDays.length === 1) return;
                          setMonthDays(included ? monthDays.filter((entry) => entry !== day) : [...monthDays, day]);
                        }}
                        className={cn(
                          "flex h-7 w-full items-center justify-center rounded-[8px] border text-ui-sm",
                          included ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-surface-hover",
                        )}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-2">
                  {WEEKDAY_DISPLAY_ORDER.map((weekday) => (
                    <button
                      key={weekday}
                      type="button"
                      onClick={() => setWeekdays([weekday])}
                      className={cn(
                        "flex h-9 items-center justify-center rounded-md border text-ui-base",
                        weekdays.includes(weekday) ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-surface-hover",
                      )}
                    >
                      {intl.formatMessage({ id: `automations.weekday.${weekday}` })}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : null}
          <div className="flex flex-col gap-1.5">
            <span className="text-ui-base leading-5 tracking-[-0.18px] text-foreground">{intl.formatMessage({ id: "automations.customRepeat.ends" })}</span>
            <div className="flex flex-wrap items-center gap-4">
              <button type="button" onClick={() => setHasEnd(false)} className="flex h-9 items-center gap-2 rounded-[8px] px-2 text-ui-base leading-5 tracking-[-0.18px] transition-colors hover:bg-surface-hover">
                <span className="flex size-5 items-center justify-center">
                  <span className={cn("flex size-4 items-center justify-center rounded-full border-[1.33px]", hasEnd ? "border-border" : "border-[#4099FF] bg-[#4099FF]")}>
                    {hasEnd ? null : <span className="size-1.5 rounded-full bg-white" />}
                  </span>
                </span>
                {intl.formatMessage({ id: "automations.customRepeat.neverEnds" })}
              </button>
              <button type="button" onClick={() => setHasEnd(true)} className="flex h-9 items-center gap-2 rounded-[8px] px-2 text-ui-base leading-5 tracking-[-0.18px] transition-colors hover:bg-surface-hover">
                <span className="flex size-5 items-center justify-center">
                  <span className={cn("flex size-4 items-center justify-center rounded-full border-[1.33px]", hasEnd ? "border-[#4099FF] bg-[#4099FF]" : "border-border")}>
                    {hasEnd ? <span className="size-1.5 rounded-full bg-white" /> : null}
                  </span>
                </span>
                {intl.formatMessage({ id: "automations.customRepeat.endsOption" })}
              </button>
            </div>
            <EndDatePicker value={endValue} min={toDateString(Date.now())} disabled={!hasEnd} intl={intl} onChange={setEndValue} />
          </div>
        </div>
        <DialogFooter className="gap-3 px-5 pb-5 pt-5">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="h-9 rounded-[8px] px-4 text-ui-base font-medium leading-5 tracking-[-0.18px] hover:border-border-hover hover:bg-input/50">
              {intl.formatMessage({ id: "common.cancel" })}
            </Button>
          </DialogClose>
          <Button
            type="button"
            className="h-9 rounded-[8px] px-4 text-ui-base font-medium leading-5 tracking-[-0.18px] hover:bg-primary/80"
            data-testid={TESTID_CUSTOM_CONFIRM}
            disabled={!intervalValid || (hasEnd && !dateStringToEndTimestamp(endValue))}
            onClick={() => {
              onConfirm({
                interval,
                unit,
                weekdays,
                monthDays,
                monthlyMode,
                ...(hasEnd ? { endAt: dateStringToEndTimestamp(endValue) } : {}),
              });
              onOpenChange(false);
            }}
          >
            {intl.formatMessage({ id: "common.confirm" })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** 原 SNt（136919）：保存成功 → 续跑（两步串联） */
export async function runIfSaved(save: () => Promise<boolean>, then: () => Promise<void>): Promise<boolean> {
  return (await save()) ? (await then(), true) : false;
}

/** 原 CNt（136922）：调度构建缺省（每日 09:00） */
export function defaultScheduleBuilder(): ScheduleBuilderState {
  return {
    frequency: "daily",
    hour: 9,
    minute: 0,
    weekdays: [1],
    dayOfMonth: 1,
    rawExpr: "0 9 * * *",
    customInterval: 1,
    customUnit: "daily",
    customWeekdays: [1],
    customMonthDays: [1],
    customMonth: new Date().getMonth() + 1,
    customMonthlyMode: "date",
  };
}

/** 原 s6（136938）：编辑/草稿 → 构建态（无则缺省；scheduleRule 优先 → custom 展开） */
export function scheduleBuilderOf(automation: AutomationTaskLite | null | undefined, draft: Record<string, unknown> | null | undefined): ScheduleBuilderState {
  if (!automation) return draft ? cronToScheduleBuilder(String(draft.cronExpr ?? "")) : defaultScheduleBuilder();
  const base = cronToScheduleBuilder(automation.cronExpr);
  const rule = automation.scheduleRule as
    | { hour: number; minute: number; interval: number; unit: ScheduleBuilderState["customUnit"]; weekdays?: number[]; monthDays?: number[]; months?: number[]; anchorAt: number; monthlyMode?: "date" | "weekday" }
    | null
    | undefined;
  return rule
    ? {
        ...base,
        frequency: "custom",
        hour: rule.hour,
        minute: rule.minute,
        customInterval: rule.interval,
        customUnit: rule.unit,
        customWeekdays: rule.weekdays ?? [1],
        customMonthDays: rule.monthDays ?? [1],
        customMonth: rule.months?.[0] ?? new Date(rule.anchorAt).getMonth() + 1,
        customMonthlyMode: rule.monthlyMode ?? "date",
      }
    : base;
}

/** 原 wNt（136956）：运行记录状态归一（分派态优先） */
export function automationRunStatusOf(run: { dispatchStatus?: string; outcome?: string }): "succeeded" | "failed" | "stopped" | "running" | "skipped" {
  if (run.dispatchStatus === "skipped") return "skipped";
  if (run.dispatchStatus === "failed_to_dispatch") return "failed";
  switch (run.outcome) {
    case "succeeded":
      return "succeeded";
    case "failed":
      return "failed";
    case "stopped":
      return "stopped";
    default:
      return "running";
  }
}

/** 原 TNt/ENt/DNt（136970–136989）：运行状态色表 */
export const AUTOMATION_RUN_DOT_CLASSES: Record<string, string> = {
  running: "bg-primary",
  succeeded: "bg-success",
  failed: "bg-destructive",
  stopped: "bg-foreground-subtlest",
  skipped: "bg-warning",
};
export const AUTOMATION_RUN_TEXT_CLASSES: Record<string, string> = {
  running: "text-primary",
  succeeded: "text-success",
  failed: "text-destructive",
  stopped: "text-foreground-subtle",
  skipped: "text-warning",
};
export const AUTOMATION_LIFECYCLE_DOT_CLASSES: Record<string, string> = {
  active: "bg-success",
  paused: "bg-warning",
  failed: "bg-destructive",
  completed: "bg-foreground-subtlest",
};

export interface ScheduleRule {
  unit: string;
  interval: number;
  hour: number;
  minute: number;
  anchorAt: number;
  weekdays: number[];
  monthDays: number[];
  months: number[];
  monthlyMode: string;
  [key: string]: unknown; // A0-CLEANUP3 3b：与 AutomationScheduleRule/Record 面互指（接口无隐式索引签名）
}

/** 原 ONt（136990）：scheduleRule 提交载荷（空 → null） */
/** A0-CLEANUP3 3b：ScheduleRule 带索引签名后 Omit 会塌缩成员，改用 Pick&Partial 保形 */
export function scheduleRulePayload(rule: Pick<ScheduleRule, "unit" | "interval" | "hour" | "minute" | "anchorAt"> & Partial<ScheduleRule> | null): ScheduleRule | null {
  return rule
    ? {
        unit: rule.unit,
        interval: rule.interval,
        hour: rule.hour,
        minute: rule.minute,
        anchorAt: rule.anchorAt,
        weekdays: rule.weekdays ?? [],
        monthDays: rule.monthDays ?? [],
        months: rule.months ?? [],
        monthlyMode: rule.monthlyMode ?? "date",
      }
    : null;
}

/* --- C.4 编辑器根组件 --- */

/** 原 R3（134943）：工具条按钮类名 */
export const AUTOMATION_TOOLBAR_BUTTON_CLASS =
  "h-7 rounded-lg text-ui-base font-normal leading-5 text-foreground-subtle hover:bg-surface-hover hover:text-foreground aria-expanded:bg-surface-hover aria-expanded:text-foreground";

/** 原 Nn/Rt/nr testid 登记（头部声明；值见 src chunk） */

/**
 * 原 YMt（135576–136025）：OffPeakTaskEditor（闲时任务编辑器）。
 * settings/history 双标签；标题缺省联动；丢弃确认；全权限提示一次性 toast；
 * keepAwake 写应用设置；运行中态锁定表单。
 */
export function OffPeakTaskEditor({
  editing,
  initialDraft,
  allowedModels,
  allowedModelConfigs = [],
  defaultWorkspacePath,
  defaultWorkspaceIdentity,
  saving,
  createBlocked = false,
  createBlockedTooltip,
  onBack,
  onSubmit,
  onOpenSession,
  onDelete,
  onDeleteHistory,
  onPause,
  onContinue,
  showToast = toast,
}: {
  editing: OffPeakTaskRecord | null;
  initialDraft: Record<string, unknown> | null;
  allowedModels: string[];
  allowedModelConfigs?: Array<{ id: string; modelIdByKind?: Record<string, string>; reasoning?: { levels: Record<string, unknown>; defaultLevel?: string } }>;
  defaultWorkspacePath: string;
  defaultWorkspaceIdentity?: string | null;
  saving: boolean;
  createBlocked?: boolean;
  createBlockedTooltip?: string;
  onBack: () => void;
  onSubmit: (input: { title: string; prompt: string; [key: string]: unknown }) => Promise<boolean>; // A0-CLEANUP3 3b：提交面恒含 title/prompt（函数体构造面即如此），兼容 EV.OffPeakCreateInput 回调
  onOpenSession?: (opts: { sessionId: string; workspacePath?: string; workspaceIdentity?: string | null }) => void;
  onDelete?: (task: OffPeakTaskRecord) => void;
  onDeleteHistory?: (task: OffPeakTaskRecord) => void;
  onPause?: (task: OffPeakTaskRecord) => void;
  onContinue?: (task: OffPeakTaskRecord) => void;
  showToast?: (message: string, options?: any) => string | number;
}) {
  const { intl } = useIntlContext();
  const { settings, update } = useAppSettings();
  const confirmDialog = useConfirmDialog();
  const workspaceOptions = useWorkspaceOptions();
  const defaultOption = workspaceOptions.find((option) => !defaultWorkspaceIdentity && option.workspacePath === defaultWorkspacePath) ?? workspaceOptions[0];
  const [tab, setTab] = React.useState("settings");
  const fullAccessHintShown = React.useRef(false);
  const suppressDiscardConfirm = React.useRef(false);
  const titleTouched = React.useRef(false);
  const workspaceSelectRef = React.useRef<string | null>(null);
  const defaultTitle = intl.formatMessage({ id: "offPeak.create.defaultTitle" });
  const draftTitle = (initialDraft?.title as string | undefined) ?? defaultTitle;
  const previousDefaultTitle = React.useRef(defaultTitle);
  const [title, setTitle] = React.useState(editing?.title ?? draftTitle);
  const [prompt, setPrompt] = React.useState((editing?.prompt as string | undefined) ?? (initialDraft?.prompt as string | undefined) ?? "");
  const [mode, setMode] = React.useState((editing?.permissionMode as string | undefined) ?? "build");
  const [model, setModel] = React.useState((editing?.model as string | undefined) ?? allowedModels[0] ?? "");
  const [thoughtLevel, setThoughtLevel] = React.useState<string | undefined>(editing?.thoughtLevel as string | undefined);
  const [workspacePath, setWorkspacePath] = React.useState(defaultOption?.workspacePath ?? "");
  const modelGroups = React.useMemo(
    () => (allowedModels.length > 0 ? [{ key: "off-peak", label: "", items: allowedModels.map((entry) => ({ key: entry, value: entry, name: entry })) }] : []),
    [allowedModels],
  );
  const workspaceTabs = React.useMemo(() => workspaceOptions.map((option) => ({ workspacePath: option.workspacePath, label: option.label })), [workspaceOptions]);
  React.useEffect(() => {
    if (editing || workspaceOptions.length === 0 || workspaceOptions.some((option) => option.workspacePath === workspacePath)) return;
    setWorkspacePath(defaultOption?.workspacePath ?? "");
    workspaceSelectRef.current = defaultOption?.workspacePath ?? "";
  }, [workspacePath, editing, workspaceOptions, defaultOption?.workspacePath]);
  const thoughtOption = React.useMemo(
    () =>
      buildOffPeakThoughtOption({
        model,
        thoughtLevel,
        allowedModelConfigs,
        formatLevelName: (level) => intl.formatMessage({ id: `offPeak.thought.${level}` }),
      }),
    [allowedModelConfigs, intl, model, thoughtLevel],
  );
  const resolvedThoughtLevel =
    typeof thoughtOption?.currentValue === "string" && thoughtOption.currentValue.trim().length > 0 ? thoughtOption.currentValue : undefined;
  const baseline = React.useRef({
    title: editing?.title ?? draftTitle,
    prompt: editing?.prompt ?? (initialDraft?.prompt as string | undefined) ?? "",
    mode: editing?.permissionMode ?? "build",
    model: editing?.model ?? allowedModels[0] ?? "",
    thoughtLevel: editing?.thoughtLevel as string | undefined,
    workspacePath: editing?.workspacePath ?? defaultOption?.workspacePath ?? "",
  });
  React.useEffect(() => {
    const next = resolveTitleOnDefaultChange({
      currentTitle: title,
      hasInitialTitle: !!initialDraft?.title,
      isEditing: !!editing,
      nextDefaultTitle: defaultTitle,
      previousDefaultTitle: previousDefaultTitle.current,
      titleTouched: titleTouched.current,
    });
    previousDefaultTitle.current = defaultTitle;
    if (next !== title) {
      setTitle(next);
      baseline.current.title = next;
    }
  }, [editing, initialDraft?.title, defaultTitle, title]);
  const dirty =
    title !== baseline.current.title ||
    prompt !== baseline.current.prompt ||
    mode !== baseline.current.mode ||
    model !== baseline.current.model ||
    thoughtLevel !== baseline.current.thoughtLevel ||
    (!editing && workspacePath !== baseline.current.workspacePath);
  const handleBack = React.useCallback(async () => {
    if (!dirty || suppressDiscardConfirm.current) {
      onBack();
      return;
    }
    const confirmed = await confirmDialog({
      title: intl.formatMessage({ id: "offPeak.discard.title" }),
      description: intl.formatMessage({ id: "offPeak.discard.description" }),
      confirmLabel: intl.formatMessage({ id: "offPeak.discard.confirm" }),
      confirmVariant: "destructive",
      showCloseButton: true,
      showKeyboardHints: false,
      presentation: "automation-confirmation",
    });
    if (confirmed) onBack();
  }, [confirmDialog, dirty, intl, onBack]);
  const keepAwake = settings?.keepAwakeWhileRunning ?? false;
  const runningLocked = !!(editing && editing.status !== "queued" && editing.status !== "paused");
  suppressDiscardConfirm.current = runningLocked;
  const effectiveWorkspacePath = editing?.workspacePath ?? workspacePath;
  const canSubmit = title.trim().length > 0 && prompt.trim().length > 0 && !!effectiveWorkspacePath && !saving && !createBlocked && !runningLocked;
  const handleSubmit = React.useCallback(async () => {
    if (!canSubmit) return;
    if (mode !== "yolo" && !fullAccessHintShown.current) {
      fullAccessHintShown.current = true;
      showToast(intl.formatMessage({ id: "offPeak.form.fullAccessHint" }), {
        durationMs: 8000,
        position: "top-center",
        variant: "info",
        dismissible: true,
        dismissLabel: intl.formatMessage({ id: "common.close" }),
      });
    }
    const ok = await onSubmit({
      title: title.trim(),
      prompt: prompt.trim(),
      permissionMode: mode,
      ...(model ? { model } : {}),
      ...(resolvedThoughtLevel ? { thoughtLevel: resolvedThoughtLevel } : {}),
      workspacePath: effectiveWorkspacePath,
      ...(editing?.workspaceIdentity ? { workspaceIdentity: editing.workspaceIdentity } : {}),
    });
    if (ok) onBack();
  }, [canSubmit, editing, resolvedThoughtLevel, intl, mode, model, onBack, onSubmit, prompt, title, effectiveWorkspacePath, showToast]);
  const modeOption = React.useMemo(() => buildModeOption(mode), [mode]);
  const submitButton = (
    <button
      type="button"
      data-testid={TESTID_OFFPEAK_SUBMIT}
      disabled={!canSubmit}
      onClick={() => void handleSubmit()}
      className="inline-flex h-8 items-center rounded-lg border-0 bg-white/5 px-3 text-ui-base font-normal leading-5 text-foreground shadow-none outline-none transition-colors hover:bg-white/10 focus-visible:ring-0 disabled:pointer-events-none disabled:opacity-40"
    >
      {intl.formatMessage({ id: "offPeak.create.submit" })}
    </button>
  );
  return (
    <div className={cn(AUTOMATION_EDITOR_PAGE_CLASS, "relative flex flex-col gap-6")} data-testid="offpeak-editor-root">
      <h1 className="text-[30px] font-medium leading-[34px] tracking-[0.114px] text-foreground">{intl.formatMessage({ id: "settings.automations.title" })}</h1>
      <div className="flex min-w-0 flex-wrap items-center gap-4 sm:flex-nowrap">
        <button type="button" onClick={() => void handleBack()} className={AUTOMATION_BACK_BUTTON_CLASS}>
          <IconArrowLeft className="size-4 shrink-0" strokeWidth={2} aria-hidden="true" />
          <span className="min-w-0 truncate">{editing?.title ?? intl.formatMessage({ id: "offPeak.create.title" })}</span>
        </button>
        <span aria-hidden="true" className="hidden h-3 w-px shrink-0 bg-border sm:block" />
        <div className="flex shrink-0 items-center gap-2">
          <KeepAwakeSwitch
            checked={keepAwake}
            ariaLabel={intl.formatMessage({ id: "offPeak.form.keepAwakeLabel" })}
            onChange={(checked) => void update({ keepAwakeWhileRunning: checked })}
            color="blue"
            size="sm"
          />
          <span className="text-ui-base text-foreground-subtle">{intl.formatMessage({ id: "offPeak.form.keepAwakeLabel" })}</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <EditorTabSwitcher
          value={tab}
          settingsLabel={intl.formatMessage({ id: "offPeak.tab.settings" })}
          historyLabel={intl.formatMessage({ id: "offPeak.tab.history" })}
          onValueChange={setTab}
        />
        {tab !== "history" && !editing ? (
          createBlockedTooltip ? (
            <Tooltip title={createBlockedTooltip} side="top" align="center">
              <span className="inline-flex">{submitButton}</span>
            </Tooltip>
          ) : (
            submitButton
          )
        ) : tab !== "history" && !runningLocked ? (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              data-testid={TESTID_OFFPEAK_SUBMIT}
              disabled={!canSubmit}
              onClick={() => void handleSubmit()}
              className="inline-flex h-8 items-center rounded-lg border-0 bg-white px-3 text-ui-base font-medium text-black shadow-none outline-none transition-colors hover:bg-white/90 focus-visible:ring-0 disabled:pointer-events-none disabled:opacity-40"
            >
              {intl.formatMessage({ id: "offPeak.edit.save" })}
            </button>
            {editing ? (
              <OffPeakTaskMenu
                task={editing}
                {...(onPause ? { onPause } : {})}
                {...(onContinue ? { onContinue } : {})}
                {...(onDelete ? { onDelete } : {})}
              />
            ) : null}
          </div>
        ) : null}
      </div>
      {editing && tab === "settings" ? (
        <div className="flex min-h-11 items-center gap-3 rounded-[10px] bg-surface px-3 py-3 text-ui-base leading-5 text-foreground-subtle sm:py-0">
          <span className="flex size-5 shrink-0 items-center justify-center" aria-hidden="true">
            <AutomationInfoIcon className="size-4" aria-hidden="true" />
          </span>
          {intl.formatMessage({ id: "offPeak.keepAwakeBanner" })}
        </div>
      ) : null}
      {tab === "history" ? (
        <OffPeakHistoryTable
          task={editing}
          {...(onOpenSession
            ? {
                onOpenSession: (task) =>
                  task.sessionId
                    ? onOpenSession({
                        sessionId: task.sessionId,
                        workspacePath: task.workspacePath,
                        ...(task.workspaceIdentity ? { workspaceIdentity: task.workspaceIdentity } : {}),
                      })
                    : undefined,
              }
            : {})}
          {...(onDeleteHistory ? { onDelete: onDeleteHistory } : {})}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <div className={AUTOMATION_FIELD_STACK_CLASS}>
            <span className="text-ui-base font-normal leading-5 text-foreground-subtle">{intl.formatMessage({ id: "offPeak.form.titleLabel" })}</span>
            <Input
              value={title}
              disabled={runningLocked}
              data-testid={TESTID_OFFPEAK_TITLE}
              placeholder={intl.formatMessage({ id: "offPeak.form.titlePlaceholder" })}
              onChange={(event) => {
                titleTouched.current = true;
                setTitle(event.target.value);
              }}
              className={cn("h-9 rounded-lg bg-card px-2 text-foreground hover:bg-surface-hover focus-visible:bg-card", AUTOMATION_TEXT_CLASS)}
            />
          </div>
          <div className={AUTOMATION_FIELD_STACK_CLASS}>
            <span className="text-ui-base font-normal leading-5 text-foreground-subtle">{intl.formatMessage({ id: "offPeak.form.instructionsLabel" })}</span>
            <PromptCard>
              <AutoGrowTextarea
                data-testid={TESTID_OFFPEAK_PROMPT}
                value={prompt}
                disabled={runningLocked}
                placeholder={intl.formatMessage({ id: "offPeak.form.instructionsPlaceholder" })}
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(event.target.value)}
              />
              <PromptCardFooter>
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  {editing ? (
                    <span className="flex h-7 min-w-0 items-center gap-1 rounded-lg px-2 text-ui-base font-normal leading-snug text-foreground-subtle">
                      <IconFolderOpen className="size-4 shrink-0" aria-hidden="true" />
                      <span className="max-w-40 truncate" title={effectiveWorkspacePath}>
                        {pathTailName(effectiveWorkspacePath)}
                      </span>
                    </span>
                  ) : workspaceTabs.length > 0 ? (
                    <WorkspaceSelectRow
                      workspacePath={effectiveWorkspacePath}
                      workspaceTabs={workspaceTabs}
                      allowConversationWorkspaceSelection={false}
                      onSelectWorkspace={(entry) => setWorkspacePath(entry.workspacePath)}
                      onSelectConversationWorkspace={() => {}}
                      allowOpenWorkspace={false}
                      allowRemoteWorkspace={false}
                      onOpenFolder={() => {}}
                      onConnectRemote={async () => ""}
                      onSelectRemoteProject={async () => {}}
                      onCancelRemoteProject={async () => {}}
                      containerClassName="rounded-lg"
                      triggerClassName={cn(AUTOMATION_TOOLBAR_BUTTON_CLASS, "min-w-0 gap-1 px-2")}
                      triggerIndicator={
                        <span className="text-foreground-subtle">
                          <AutomationChevronIndicator size={14} containerSize={20} />
                        </span>
                      }
                    />
                  ) : (
                    <Button type="button" variant="ghost" size="xs" disabled className={cn(AUTOMATION_TOOLBAR_BUTTON_CLASS, "gap-1 px-2 text-foreground-subtlest")}>
                      <IconFolderOpen className="size-4" aria-hidden="true" />
                      {intl.formatMessage({ id: "automations.form.project.localRequired" })}
                    </Button>
                  )}
                  <ModeSelector
                    option={modeOption}
                    provider="glm"
                    onValueChange={setMode}
                    disabled={runningLocked}
                    tooltipTitle={intl.formatMessage({ id: "chat.toolbar.mode.label" })}
                    triggerVariant="ghost"
                    triggerSize="default"
                    triggerClassName={cn(AUTOMATION_TOOLBAR_BUTTON_CLASS, "w-fit max-w-56 min-w-0 shrink justify-start gap-1 px-2")}
                    labelVisibilityClassName="inline-flex min-w-0 truncate text-left"
                    restoreFocusSelector={null}
                  />
                </div>
                <div className="flex w-full shrink-0 flex-nowrap items-center justify-end gap-2 sm:w-auto">
                  <ModelSelector
                    modelGroups={modelGroups}
                    normalizedValue={model}
                    triggerLabel={model || intl.formatMessage({ id: "offPeak.form.modelLabel" })}
                    showProviderLevel={false}
                    showManageModelsAction={false}
                    lockReasonMessage=""
                    isItemLocked={automationModelNeverLocked}
                    onValueChange={setModel}
                    disabled={runningLocked || allowedModels.length === 0}
                    tooltipTitle={intl.formatMessage({ id: "offPeak.form.modelLabel" })}
                    contentSide="top"
                    contentAlign="end"
                    focusSelectorOnClose={null}
                    labelVisibilityClassName="inline-flex min-w-0"
                    triggerClassName={cn(AUTOMATION_TOOLBAR_BUTTON_CLASS, "w-fit max-w-72 min-w-0 shrink justify-between px-2")}
                    triggerLabelClassName="inline-flex min-w-0 truncate text-left"
                  />
                  {thoughtOption ? (
                    <ThoughtLevelSelector
                      intl={intl}
                      option={thoughtOption}
                      provider="glm"
                      disabled={runningLocked}
                      triggerRef={workspaceSelectRef as React.RefObject<HTMLButtonElement | null>}
                      triggerClassName={AUTOMATION_TOOLBAR_BUTTON_CLASS}
                      interactionMode="select"
                      restoreFocusSelector={null}
                      labelVisibilityClassName="inline-flex min-w-0"
                      onValueChange={(value) => setThoughtLevel(value)}
                    />
                  ) : null}
                </div>
              </PromptCardFooter>
            </PromptCard>
            <div className="mt-1 flex items-start gap-1.5 text-ui-base leading-5 text-foreground-subtle">
              <span className="flex size-5 shrink-0 items-center justify-center" aria-hidden="true">
                <AutomationInfoIcon className="size-4" />
              </span>
              {intl.formatMessage({ id: "offPeak.form.permissionWarning" })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export interface AutomationRunRecord {
  runId: string;
  trigger: string;
  sessionId?: string | null;
  scheduledAt?: number;
  createdAt: number;
  updatedAt?: number;
  outcome?: string;
  dispatchStatus?: string;
  error?: string;
  [key: string]: unknown;
}

/**
 * 原 kNt（137005–138512）：AutomationEditor（定时任务编辑器）。
 * 状态机要点：
 *  - 标题缺省联动（Rjt）+ 触碰标记；计划删除（Le 分支：聊天创建 ∧ 未被用户编辑 ∧ 不可表示 cron）
 *  - 工作区解析三级回退（tNt）；模型继承（Q3）+ 工作区配置联动（Jq）
 *  - 思考选项预览（临时会话探测 LMt + 缓存 ie + 重试 de）
 *  - 必填校验（$Mt）+ 变更字段集（QMt）+ 未保存丢弃确认（U2）
 *  - 保存并立即运行（SNt 串联）；历史标签 5s 轮询
 */
export function AutomationEditor({
  editing,
  initialDraft,
  defaultWorkspacePath,
  defaultWorkspaceIdentity,
  modelProviders,
  modelSelectGroups,
  onManageModels,
  saving,
  onSubmit,
  onBack,
  onRunNow,
  onToggle,
  onDelete,
  runsEntry,
  onLoadRuns,
  onDeleteRun,
  onOpenSession,
}: {
  editing: AutomationTaskLite | null;
  initialDraft: Record<string, unknown> | null;
  defaultWorkspacePath: string;
  defaultWorkspaceIdentity?: string | null;
  modelProviders: ModelProvider[];
  modelSelectGroups: SelectGroupEntry[];
  onManageModels?: () => void;
  saving: boolean;
  /** A0-CLEANUP3 3b：input 带出 title/prompt 必有面（buildInput 运行期恒产；消费端 AutomationInput 对齐） */
  onSubmit: (request: { input: { title: string; prompt: string; [key: string]: unknown }; workspacePath: string; workspaceIdentity?: string | null }) => Promise<boolean>;
  onBack: () => void;
  onRunNow?: (automation: AutomationTaskLite) => void;
  onToggle?: (automation: AutomationTaskLite, enabled: boolean) => Promise<void>;
  onDelete?: (automation: AutomationTaskLite) => Promise<void>;
  runsEntry?: { runs?: AutomationRunRecord[]; status?: string; error?: string };
  onLoadRuns: () => void;
  onDeleteRun?: (runId: string) => void;
  onOpenSession?: (sessionId: string) => void;
}) {
  const { intl } = useIntlContext();
  const confirmDialog = useConfirmDialog();
  const { zcodeAgentService } = useServices();
  const [tab, setTab] = React.useState("settings");
  const [runsPage, setRunsPage] = React.useState(1);
  const loadRunsRef = React.useRef(onLoadRuns);
  const runNowInFlightRef = React.useRef(false);
  const [runNowBusy, setRunNowBusy] = React.useState(false);
  const titlePlaceholder = intl.formatMessage({ id: "automations.edit.titlePlaceholder" });
  const previousDefaultTitle = React.useRef(titlePlaceholder);
  const titleTouched = React.useRef(false);
  const [title, setTitle] = React.useState("");
  const [prompt, setPrompt] = React.useState("");
  const [model, setModel] = React.useState(AUTOMATION_MODEL_INHERIT);
  const modelBaseline = React.useRef(AUTOMATION_MODEL_INHERIT);
  const [mode, setMode] = React.useState(AUTOMATION_DEFAULT_MODE);
  const modeBaseline = React.useRef(AUTOMATION_DEFAULT_MODE);
  const [thoughtLevel, setThoughtLevel] = React.useState(AUTOMATION_DEFAULT_THOUGHT_LEVEL);
  const thoughtBaseline = React.useRef(AUTOMATION_DEFAULT_THOUGHT_LEVEL);
  const modelTouched = React.useRef(false);
  const thoughtTouched = React.useRef(false);
  const thoughtRetrySeq = React.useRef(0);
  const thoughtCache = React.useRef(new Map<string, ConfigOption | null>());
  const [thoughtPreview, setThoughtPreview] = React.useState<{ key: string; thoughtOption: ConfigOption | null } | null>(null);
  const [thoughtState, setThoughtState] = React.useState<{ key: string | null; status: string }>({ key: null, status: "ready" });
  const [thoughtRetry, setThoughtRetry] = React.useState(0);
  const thoughtTriggerRef = React.useRef<HTMLButtonElement | null>(null);
  const [builder, setBuilder] = React.useState<ScheduleBuilderState>(() => scheduleBuilderOf(editing, initialDraft));
  const [scheduleMissing, setScheduleMissing] = React.useState(!editing && !initialDraft);
  const [validationVisible, setValidationVisible] = React.useState<Set<string>>(() => new Set());
  const [customRepeatOpen, setCustomRepeatOpen] = React.useState(false);
  const [scheduleDeleted, setScheduleDeleted] = React.useState<Set<string>>(() => new Set());
  const baselineRef = React.useRef<Record<string, string> | null>(null);
  const fieldBaselines = React.useRef<Record<string, string>>({});
  const [endAt, setEndAt] = React.useState<number | undefined>(editing?.endAt ?? undefined);
  const [workspaceKeyState, setWorkspaceKeyState] = React.useState<string | null>(null);
  const workspaceOptions = useWorkspaceOptions({ includeConversationWorkspace: true });
  const defaultModel = React.useMemo(() => defaultModelFromGroups(modelSelectGroups), [modelSelectGroups]);
  const defaultModelRef = React.useRef(defaultModel);
  defaultModelRef.current = defaultModel;
  const editingPurpose = editing ? findWorkspaceOption(workspaceOptions, editing.workspaceKey)?.workspacePurpose : undefined;
  const effectiveOptions = React.useMemo(
    () =>
      editing
        ? [
            {
              workspacePath: editing.workspacePath ?? "",
              workspaceIdentity: editing.workspaceIdentity ?? undefined,
              label: pathTailName(editing.workspacePath ?? ""),
              ...(editingPurpose ? { workspacePurpose: editingPurpose } : {}),
            },
          ]
        : workspaceOptions,
    [editing, editingPurpose, workspaceOptions],
  );
  const effectiveOptionsRef = React.useRef(effectiveOptions);
  effectiveOptionsRef.current = effectiveOptions;
  React.useEffect(() => {
    setTab("settings");
    setRunsPage(1);
    setScheduleDeleted(new Set());
    setValidationVisible(new Set());
    fieldBaselines.current = {};
    if (editing) {
      setScheduleMissing(false);
      titleTouched.current = false;
      modelTouched.current = false;
      thoughtTouched.current = false;
      setTitle(editing.title ?? "");
      setPrompt(editing.prompt ?? "");
      const nextModel = editing.model?.trim() || AUTOMATION_MODEL_INHERIT;
      const nextThought = (editing as { thoughtLevel?: string }).thoughtLevel?.trim() || AUTOMATION_DEFAULT_THOUGHT_LEVEL;
      modelBaseline.current = nextModel;
      thoughtBaseline.current = nextThought;
      setModel(nextModel);
      const nextMode = editing.mode?.trim() || AUTOMATION_DEFAULT_MODE;
      modeBaseline.current = nextMode;
      setMode(nextMode);
      setThoughtLevel(nextThought);
      setBuilder(scheduleBuilderOf(editing, initialDraft));
      setEndAt(editing.endAt ?? undefined);
      setWorkspaceKeyState(workspaceKey({ workspacePath: editing.workspacePath ?? "", workspaceIdentity: editing.workspaceIdentity ?? null } as WorkspaceOption));
    } else {
      setScheduleMissing(!initialDraft);
      titleTouched.current = false;
      modelTouched.current = false;
      thoughtTouched.current = false;
      setTitle((initialDraft?.title as string | undefined) ?? titlePlaceholder);
      setPrompt((initialDraft?.prompt as string | undefined) ?? "");
      modelBaseline.current = defaultModelRef.current;
      setModel(defaultModelRef.current);
      modeBaseline.current = AUTOMATION_DEFAULT_MODE;
      thoughtBaseline.current = AUTOMATION_DEFAULT_THOUGHT_LEVEL;
      setMode(AUTOMATION_DEFAULT_MODE);
      setThoughtLevel(AUTOMATION_DEFAULT_THOUGHT_LEVEL);
      setBuilder(scheduleBuilderOf(editing, initialDraft));
      setEndAt(undefined);
      setWorkspaceKeyState(resolveWorkspaceOptionKey(effectiveOptionsRef.current, null, { workspacePath: defaultWorkspacePath, workspaceIdentity: defaultWorkspaceIdentity ?? null }));
    }
  }, [editing, initialDraft, defaultWorkspacePath, defaultWorkspaceIdentity, titlePlaceholder]);
  React.useEffect(() => {
    const next = resolveDraftTitleOnDefaultChange({
      currentTitle: title,
      hasInitialDraft: !!initialDraft,
      isEditing: !!editing,
      nextDefaultTitle: titlePlaceholder,
      previousDefaultTitle: previousDefaultTitle.current,
      titleTouched: titleTouched.current,
    });
    previousDefaultTitle.current = titlePlaceholder;
    if (next !== title) setTitle(next);
  }, [editing, initialDraft, titlePlaceholder, title]);
  React.useEffect(() => {
    if (editing) return;
    setWorkspaceKeyState((current) => resolveWorkspaceOptionKey(effectiveOptions, current, { workspacePath: defaultWorkspacePath, workspaceIdentity: defaultWorkspaceIdentity ?? null }));
  }, [defaultWorkspaceIdentity, defaultWorkspacePath, editing, effectiveOptions]);
  const markTouched = React.useCallback((field: string) => {
    if (fieldBaselines.current[field] === undefined) {
      fieldBaselines.current[field] = baselineRef.current?.[field] as string;
    }
    setScheduleDeleted((previous) => {
      if (previous.has(field)) return previous;
      const next = new Set(previous);
      next.add(field);
      return next;
    });
  }, []);
  const clearTouched = React.useCallback((field: string) => {
    setValidationVisible((previous) => removeFromSet(previous, field));
  }, []);
  const removeSchedule = React.useCallback(() => {
    markTouched("schedule");
    setScheduleMissing(true);
    clearTouched("schedule");
    logger.debug("[AutomationEditView] 删除计划草稿", {
      automationId: editing?.automationId ?? null,
      validationVisible: false,
    });
  }, [clearTouched, editing?.automationId, markTouched]);
  React.useEffect(() => {
    if (editing || model === AUTOMATION_MODEL_INHERIT || defaultModel === AUTOMATION_MODEL_INHERIT) return;
    modelBaseline.current = defaultModel;
    setModel(defaultModel);
  }, [defaultModel, editing, model]);
  React.useEffect(() => {
    loadRunsRef.current = onLoadRuns;
  }, [onLoadRuns]);
  React.useEffect(() => {
    if (tab !== "history" || !editing) return;
    loadRunsRef.current?.();
    const timer = window.setInterval(() => {
      loadRunsRef.current?.();
    }, 5000);
    return () => window.clearInterval(timer);
  }, [tab, editing?.automationId]);
  const legacySchedule =
    isChatCreatedAutomation(editing) && !editing?.scheduleEditedByUser && !!(editing && !isRepresentableCron(editing.cronExpr)) && !scheduleDeleted.has("schedule");
  const cronExpr = React.useMemo(
    () => (scheduleMissing ? "" : legacySchedule ? editing?.cronExpr ?? "" : scheduleBuilderToCron(builder)),
    [builder, editing?.cronExpr, legacySchedule, scheduleMissing],
  );
  const schedulePreview = React.useMemo(() => (cronExpr ? schedulePreviewText(builder, intl) : ""), [builder, cronExpr, intl]);
  const selectedWorkspace =
    findWorkspaceOption(effectiveOptions, workspaceKeyState) ??
    (editing
      ? { workspacePath: editing.workspacePath ?? "", workspaceIdentity: editing.workspaceIdentity ?? undefined, label: pathTailName(editing.workspacePath ?? "") }
      : null);
  const workspaceTabEntries = React.useMemo(
    () =>
      effectiveOptions.map((option) => ({
        workspacePath: option.workspacePath,
        label: option.label,
        ...(option.workspaceIdentity ? { workspaceIdentity: option.workspaceIdentity } : {}),
        ...(option.workspacePurpose ? { workspacePurpose: option.workspacePurpose } : {}),
      })),
    [effectiveOptions],
  );
  const selectedWorkspacePath = selectedWorkspace?.workspacePath ?? "";
  const selectedWorkspaceIdentity = selectedWorkspace?.workspaceIdentity;
  const isConversationWorkspace = selectedWorkspace?.workspacePurpose === "conversation";
  const workspaceDisplayLabel = isConversationWorkspace ? intl.formatMessage({ id: "chat.empty.workOutsideProject" }) : selectedWorkspace?.label ?? pathTailName(defaultWorkspacePath);
  const conversationOption = effectiveOptions.find((option) => option.workspacePurpose === "conversation");
  const { configOptions } = useWorkspaceConfigOptions(selectedWorkspacePath, null, selectedWorkspaceIdentity);
  const workspaceModelValue = React.useMemo(() => currentModelOptionValue(configOptions), [configOptions]);
  const workspaceThoughtOption = React.useMemo(() => findThoughtOption(configOptions), [configOptions]);
  const workspaceModelItem = React.useMemo(() => (workspaceModelValue ? resolveModelGroupItem(modelSelectGroups, workspaceModelValue) : null), [workspaceModelValue, modelSelectGroups]);
  const effectiveModel = workspaceModelItem?.value ?? workspaceModelValue ?? defaultModel;
  React.useEffect(() => {
    if (editing || modelTouched.current || effectiveModel === AUTOMATION_MODEL_INHERIT) return;
    modelBaseline.current = effectiveModel;
    setModel(effectiveModel);
  }, [editing, effectiveModel]);
  React.useEffect(() => {
    if (editing || thoughtTouched.current) return;
    const current = workspaceThoughtOption?.currentValue;
    if (typeof current !== "string" || !current.trim()) return;
    thoughtBaseline.current = current;
    setThoughtLevel(current);
  }, [editing, workspaceThoughtOption]);
  const handleSelectWorkspace = (entry: { workspacePath: string }) => {
    modelTouched.current = false;
    thoughtTouched.current = false;
    setWorkspaceKeyState(workspaceKey(entry as WorkspaceOption));
  };
  const handleSelectConversationWorkspace = () => {
    if (conversationOption) {
      modelTouched.current = false;
      thoughtTouched.current = false;
      setWorkspaceKeyState(workspaceOptionKey(conversationOption));
    }
  };
  const modelTriggerLabel =
    model === AUTOMATION_MODEL_INHERIT
      ? intl.formatMessage({ id: "automations.form.model.inherit" })
      : resolveModelLabel({
          modelGroups: modelSelectGroups,
          modelProviders,
          modelValue: model,
          fallbackLabel: intl.formatMessage({ id: "chat.toolbar.model.label" }),
        });
  const handleModelChange = React.useCallback(
    (value: string) => {
      modelTouched.current = true;
      thoughtTouched.current = false;
      modelBaseline.current = value;
      setModel(value);
      markTouched("model");
    },
    [markTouched],
  );
  const modeOption = React.useMemo(() => buildModeOption(mode), [mode]);
  const modelItem = React.useMemo(() => resolveModelGroupItem(modelSelectGroups, model), [model, modelSelectGroups]);
  const thoughtPreviewKey = selectedWorkspace && modelItem ? `${workspaceKey({ workspacePath: selectedWorkspacePath, workspaceIdentity: selectedWorkspaceIdentity } as WorkspaceOption)}\u0000${modelItem.value}` : null;
  React.useEffect(() => {
    if (!modelItem || !thoughtPreviewKey) {
      setThoughtState({ key: null, status: "ready" });
      return;
    }
    if (workspaceModelItem?.value === modelItem.value) {
      setThoughtPreview({ key: thoughtPreviewKey, thoughtOption: workspaceThoughtOption ?? null });
      setThoughtState({ key: thoughtPreviewKey, status: "ready" });
      return;
    }
    if (thoughtCache.current.has(thoughtPreviewKey)) {
      setThoughtPreview({ key: thoughtPreviewKey, thoughtOption: thoughtCache.current.get(thoughtPreviewKey) ?? null });
      setThoughtState({ key: thoughtPreviewKey, status: "ready" });
      return;
    }
    const parsed = parseModelValue(modelItem.value);
    if (!parsed?.modelName) {
      setThoughtState({ key: thoughtPreviewKey, status: "failed" });
      return;
    }
    const modelId = parsed.modelName;
    const seq = thoughtRetrySeq.current + 1;
    thoughtRetrySeq.current = seq;
    setThoughtState({ key: thoughtPreviewKey, status: "pending" });
    let cancelled = false;
    (async () => {
      try {
        const option = await fetchModelThoughtOption({
          agentService: zcodeAgentService,
          workspacePath: selectedWorkspacePath,
          workspaceIdentity: selectedWorkspaceIdentity,
          providerId: parsed.providerId ?? "",
          modelId,
        });
        thoughtCache.current.set(thoughtPreviewKey, option);
        if (!cancelled && thoughtRetrySeq.current === seq) {
          setThoughtPreview({ key: thoughtPreviewKey, thoughtOption: option });
          setThoughtState({ key: thoughtPreviewKey, status: "ready" });
        }
      } catch (error) {
        logger.warn("[AutomationEditView] 读取模型 think 配置失败", {
          error,
          model: modelItem.value,
          workspaceIdentity: selectedWorkspaceIdentity ?? null,
          workspacePath: selectedWorkspacePath,
        });
        if (!cancelled && thoughtRetrySeq.current === seq) setThoughtState({ key: thoughtPreviewKey, status: "failed" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [workspaceModelItem?.value, thoughtRetry, workspaceThoughtOption, modelItem, thoughtPreviewKey, selectedWorkspaceIdentity, selectedWorkspacePath, zcodeAgentService]);
  const thoughtLoading = thoughtPreviewKey !== null && thoughtState.key === thoughtPreviewKey && thoughtState.status === "pending";
  const thoughtFailed = thoughtPreviewKey !== null && thoughtState.key === thoughtPreviewKey && thoughtState.status === "failed";
  const thoughtReady = isThoughtPreviewReady(thoughtPreviewKey, thoughtState);
  const resolvedThoughtOption = resolveThoughtPreviewOption({
    currentWorkspaceModelValue: workspaceModelItem?.value,
    previewKey: thoughtPreview?.key,
    previewOption: thoughtPreview?.thoughtOption,
    runtimeOption: workspaceThoughtOption,
    selectedModelPreviewKey: thoughtPreviewKey,
    selectedModelValue: modelItem?.value,
  });
  const normalizedThoughtOption = React.useMemo(() => normalizeThoughtOption(resolvedThoughtOption, thoughtLevel), [resolvedThoughtOption, thoughtLevel]);
  const resolvedThoughtLevel = String(normalizedThoughtOption?.currentValue ?? "");
  React.useEffect(() => {
    if (!resolvedThoughtLevel || resolvedThoughtLevel === thoughtLevel) return;
    thoughtBaseline.current = resolvedThoughtLevel;
    setThoughtLevel(resolvedThoughtLevel);
  }, [resolvedThoughtLevel, thoughtLevel]);
  const missingFields = React.useMemo(() => missingRequiredFields({ title, cronExpr, prompt }), [cronExpr, prompt, title]);
  const canSubmitWorkspace = !!(editing || selectedWorkspace);
  const canSubmit = canSubmitWorkspace && thoughtReady && (!!editing || selectedWorkspace !== null);
  const submittable = canSubmit && missingFields.length === 0;
  const validate = React.useCallback(
    (source: string): boolean => {
      setValidationVisible(new Set(missingFields));
      logger.debug("[AutomationEditView] 提交前校验必填字段", {
        automationId: editing?.automationId ?? null,
        source,
        invalidFields: missingFields,
      });
      return missingFields.length === 0;
    },
    [editing?.automationId, missingFields],
  );
  const scheduleRuleDraft = React.useMemo(
    () =>
      builder.frequency === "custom"
        ? {
            unit: builder.customUnit,
            interval: builder.customInterval,
            hour: builder.hour,
            minute: builder.minute,
            anchorAt: editing?.scheduleRule?.anchorAt ?? Date.now(),
            weekdays: builder.customWeekdays,
            monthDays: builder.customMonthDays,
            months: builder.customUnit === "yearly" ? [builder.customMonth] : undefined,
            monthlyMode: builder.customMonthlyMode,
          }
        : undefined,
    [builder, editing?.scheduleRule?.anchorAt],
  );
  const buildInput = React.useCallback(
    ({ modelValue, modeValue, thoughtLevelValue }: { modelValue: string; modeValue: string; thoughtLevelValue: string }) => ({
      title: title.trim(),
      cronExpr,
      prompt: prompt.trim(),
      recurring: editing?.recurring ?? true,
      ...(editing ? { endAt: endAt ?? null } : endAt ? { endAt } : {}),
      ...(editing ? (legacySchedule ? {} : { scheduleRule: scheduleRuleDraft ?? null }) : scheduleRuleDraft ? { scheduleRule: scheduleRuleDraft } : {}),
      ...(editing && scheduleDeleted.has("schedule") ? { scheduleEditedByUser: true } : {}),
      mode: modeValue,
      thoughtLevel: resolveThoughtLevelPayload({ editing: !!editing, resolvedThoughtLevel, thoughtLevel: thoughtLevelValue }),
      ...(modelValue === AUTOMATION_MODEL_INHERIT ? { model: undefined } : { model: modelValue }),
    }),
    [cronExpr, scheduleRuleDraft, editing, endAt, legacySchedule, prompt, resolvedThoughtLevel, title, scheduleDeleted],
  );
  const currentFields = React.useMemo(
    () =>
      editing
        ? {
            title: title.trim(),
            prompt: prompt.trim(),
            schedule: JSON.stringify({
              cronExpr,
              endAt: endAt ?? null,
              scheduleRule: legacySchedule ? null : scheduleRulePayload(scheduleRuleDraft ?? null),
            }),
            mode,
            thoughtLevel: resolvedThoughtLevel ? thoughtLevel : "",
            model: model === AUTOMATION_MODEL_INHERIT ? "" : model,
          }
        : null,
    [cronExpr, scheduleRuleDraft, editing, endAt, legacySchedule, mode, model, prompt, resolvedThoughtLevel, thoughtLevel, title],
  );
  baselineRef.current = currentFields;
  const changedFields = React.useMemo(
    () => (currentFields ? changedFieldsOf({ touchedFields: scheduleDeleted, baseline: fieldBaselines.current, current: currentFields }) : []),
    [currentFields, scheduleDeleted],
  );
  const hasUnsavedChanges = !!editing && changedFields.length > 0;
  const submit = React.useCallback(
    async (options: { returnToList?: boolean; validationSource: string }) => {
      if (saving || !validate(options.validationSource) || !submittable) return false;
      const input = { ...buildInput({ modelValue: modelBaseline.current, modeValue: modeBaseline.current, thoughtLevelValue: thoughtBaseline.current }) };
      const target = editing
        ? { workspacePath: editing.workspacePath ?? "", workspaceIdentity: editing.workspaceIdentity ?? null }
        : selectedWorkspace
          ? { workspacePath: selectedWorkspace.workspacePath, workspaceIdentity: selectedWorkspace.workspaceIdentity ?? null }
          : null;
      if (!target) return false;
      const ok = await onSubmit({ input, ...target });
      if (ok && options.returnToList !== false) onBack();
      return ok;
    },
    [buildInput, submittable, editing, onBack, onSubmit, validate, saving, selectedWorkspace?.workspaceIdentity, selectedWorkspace?.workspacePath],
  );
  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await submit({ validationSource: "save" });
  };
  const handleSaveAndRun = React.useCallback(async () => {
    if (!editing || !onRunNow || runNowInFlightRef.current) return;
    runNowInFlightRef.current = true;
    setRunNowBusy(true);
    logger.debug("[AutomationEditView] 保存并立即运行开始", { automationId: editing.automationId, changedFields });
    try {
      const completed = await runIfSaved(
        () => submit({ returnToList: false, validationSource: "run-now" }),
        () => Promise.resolve(onRunNow(editing)),
      );
      logger.debug("[AutomationEditView] 保存并立即运行结束", { automationId: editing.automationId, completed });
    } finally {
      runNowInFlightRef.current = false;
      setRunNowBusy(false);
    }
  }, [changedFields, editing, onRunNow, submit]);
  const handleBack = React.useCallback(async () => {
    logger.debug("[AutomationEditView] 返回前检查未保存更改", {
      automationId: editing?.automationId ?? null,
      touchedFields: [...scheduleDeleted],
      changedFields,
    });
    if (!hasUnsavedChanges) {
      onBack();
      return;
    }
    const confirmed = await confirmDialog({
      title: intl.formatMessage({ id: "automations.unsaved.title" }),
      description: intl.formatMessage({ id: "automations.unsaved.description" }),
      confirmLabel: intl.formatMessage({ id: "automations.unsaved.discard" }),
      confirmVariant: "destructive",
      showCloseButton: true,
      showKeyboardHints: false,
      presentation: "automation-confirmation",
    });
    logger.debug("[AutomationEditView] 未保存更改确认结果", {
      automationId: editing?.automationId ?? null,
      discarded: confirmed,
    });
    if (confirmed) onBack();
  }, [changedFields, confirmDialog, editing?.automationId, hasUnsavedChanges, intl, onBack, scheduleDeleted]);
  const handleTabChange = React.useCallback(
    (next: string) => {
      logger.debug("[AutomationEditView] 切换设置页签", {
        automationId: editing?.automationId ?? null,
        nextTab: next,
        willLoadRuns: next === "history" && !!editing,
      });
      setTab(next);
    },
    [editing],
  );
  const runs = runsEntry?.runs ?? [];
  const runsLoading = runsEntry?.status === "loading";
  const pageCount = Math.max(1, Math.ceil(runs.length / AUTOMATION_RUNS_PAGE_SIZE));
  const currentPage = Math.min(runsPage, pageCount);
  const pageRuns = runs.slice((currentPage - 1) * AUTOMATION_RUNS_PAGE_SIZE, currentPage * AUTOMATION_RUNS_PAGE_SIZE);
  const pageWindow = paginationWindow(currentPage, pageCount);
  const lifecycleStatus = editing ? automationStatusOf(editing) : null;
  const showSettingsActions = !!(editing && tab === "settings");
  const showCreateAction = !editing && tab === "settings";
  return (
    <>
      <div className={cn(AUTOMATION_EDITOR_PAGE_CLASS, "flex flex-col gap-6")}>
        <div className="flex flex-col gap-6 text-left">
          <h1 className="text-[30px] font-medium leading-[34px] tracking-[0.114px] text-foreground">{intl.formatMessage({ id: "settings.automations.title" })}</h1>
          <button type="button" data-testid={TESTID_AUTOMATION_BACK} onClick={handleBack} className={AUTOMATION_BACK_BUTTON_CLASS}>
            <IconArrowLeft className="size-4 shrink-0" strokeWidth={1.33} aria-hidden="true" />
            <span className="min-w-0 truncate">{editing ? editing.title : intl.formatMessage({ id: "automations.edit.newTask" })}</span>
          </button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <EditorTabSwitcher
            value={tab}
            settingsLabel={intl.formatMessage({ id: "automations.edit.tab.settings" })}
            historyLabel={intl.formatMessage({ id: "automations.edit.tab.history" })}
            onValueChange={handleTabChange}
          />
          <div className="flex items-center gap-1.5">
            {editing ? (
              <>
                {showSettingsActions ? (
                  <button
                    type="submit"
                    form="automation-edit-form"
                    data-testid={TESTID_AUTOMATION_SAVE}
                    className="inline-flex h-8 items-center rounded-lg border-0 bg-white px-3 text-ui-base font-medium text-black shadow-none outline-none transition-colors hover:bg-white/90 focus-visible:ring-0 disabled:pointer-events-none disabled:opacity-40"
                    disabled={!canSubmit || saving}
                  >
                    {intl.formatMessage({ id: saving ? "automations.form.saving" : "automations.form.save" })}
                  </button>
                ) : null}
                {showSettingsActions && onRunNow ? (
                  <button
                    type="button"
                    data-testid={TESTID_AUTOMATION_RUN_NOW}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border-0 bg-white/[0.06] px-3 text-ui-base font-medium text-foreground shadow-none outline-none transition-colors hover:bg-white/10 focus-visible:ring-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:text-foreground-subtlest disabled:opacity-40"
                    disabled={!canSubmit || saving || runNowBusy}
                    onClick={() => void handleSaveAndRun()}
                  >
                    <AutomationRunIcon className="size-4" aria-hidden="true" />
                    {intl.formatMessage({ id: "automations.runNow" })}
                  </button>
                ) : null}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      aria-label={intl.formatMessage({ id: "automations.moreActions" })}
                      className="flex size-8 items-center justify-center rounded-lg border-0 bg-white/[0.06] text-foreground-subtle shadow-none outline-none transition-colors hover:bg-white/10 hover:text-foreground data-[state=open]:bg-white/10 data-[state=open]:text-foreground focus-visible:ring-0"
                    >
                      <AutomationMoreIcon className="size-4" aria-hidden="true" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" sideOffset={4} className="min-w-[180px]">
                    {onToggle && editing.lifecycleStatus !== "completed" && editing.lifecycleStatus !== "failed" ? (
                      <DropdownMenuItem className="gap-1" onSelect={() => void onToggle(editing, !editing.enabled)}>
                        <span className="flex size-5 items-center justify-center">
                          {editing.enabled ? <AutomationPauseIcon className="size-4" aria-hidden="true" /> : <AutomationResumeIcon className="size-4" aria-hidden="true" />}
                        </span>
                        {intl.formatMessage({ id: editing.enabled ? "automations.pause" : "automations.resume" })}
                      </DropdownMenuItem>
                    ) : null}
                    {onDelete ? (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="gap-1 !text-destructive data-[highlighted]:!bg-menu-hover data-[highlighted]:!text-destructive focus:!text-destructive [&_svg]:!text-destructive"
                          onSelect={() => void onDelete(editing)}
                        >
                          <AutomationDeleteIcon />
                          {intl.formatMessage({ id: "automations.delete" })}
                        </DropdownMenuItem>
                      </>
                    ) : null}
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : showCreateAction ? (
              <Button
                type="submit"
                form="automation-edit-form"
                size="xs"
                data-testid={TESTID_AUTOMATION_SAVE}
                className="h-8 rounded-lg border-0 bg-white/5 px-3 text-ui-base font-normal leading-5 text-foreground hover:bg-white/10 disabled:opacity-40"
                disabled={!submittable || saving}
              >
                {intl.formatMessage({ id: saving ? "automations.form.saving" : "automations.edit.createButton" })}
              </Button>
            ) : null}
          </div>
        </div>
        {tab === "settings" ? (
          <form id="automation-edit-form" className="space-y-4" onSubmit={(event) => void handleFormSubmit(event)}>
            {lifecycleStatus ? (
              <div className={AUTOMATION_FIELD_STACK_CLASS}>
                <div className="text-ui-base font-normal leading-5 text-foreground-subtle">{intl.formatMessage({ id: "automations.form.status.label" })}</div>
                <div className="flex min-h-8 flex-wrap items-center gap-2">
                  <span className="inline-flex h-8 max-w-full items-center gap-1 rounded-lg bg-card pl-2 pr-4 text-ui-base leading-5 text-foreground">
                    <span className="flex size-5 shrink-0 items-center justify-center">
                      <span className={cn("size-1.5 shrink-0 rounded-full", AUTOMATION_LIFECYCLE_DOT_CLASSES[lifecycleStatus])} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 truncate">{intl.formatMessage({ id: `automations.lifecycle.${lifecycleStatus}` })}</span>
                  </span>
                </div>
              </div>
            ) : null}
            <div className={AUTOMATION_FIELD_STACK_CLASS}>
              <label className="text-ui-base font-normal leading-5 text-foreground-subtle" htmlFor="automation-title">
                {intl.formatMessage({ id: "automations.form.title.label" })}
              </label>
              <Input
                id="automation-title"
                data-testid={TESTID_AUTOMATION_TITLE}
                value={title}
                onChange={(event) => {
                  titleTouched.current = true;
                  markTouched("title");
                  clearTouched("title");
                  setTitle(event.target.value);
                }}
                placeholder={intl.formatMessage({ id: "automations.edit.titlePlaceholder" })}
                aria-invalid={validationVisible.has("title") && !title.trim()}
                maxLength={200}
                className={cn("h-9 rounded-lg bg-card px-2 text-foreground hover:bg-surface-hover focus-visible:bg-card", AUTOMATION_TEXT_CLASS)}
              />
            </div>
            {legacySchedule ? (
              <div className={AUTOMATION_FIELD_STACK_CLASS}>
                <label className="inline-flex items-center gap-1.5 text-ui-base font-normal leading-5 text-foreground-subtle">
                  {intl.formatMessage({ id: "automations.form.schedule.label" })}
                </label>
                <div
                  data-testid={TESTID_AUTOMATION_SCHEDULE_BOX}
                  className="relative flex h-9 items-center overflow-hidden rounded-lg border border-input-border bg-card px-2 pr-9 text-ui-base leading-5 text-foreground-subtle transition-colors hover:border-input-border-hover focus-within:border-input-border-focused"
                >
                  <span className="min-w-0 truncate">{intl.formatMessage({ id: "automations.frequency.custom" })}</span>
                  <button
                    type="button"
                    data-testid={TESTID_AUTOMATION_SCHEDULE_DELETE}
                    onClick={removeSchedule}
                    className="absolute right-2 top-2 flex size-5 items-center justify-center text-foreground-subtle transition-colors hover:text-foreground"
                    aria-label={intl.formatMessage({ id: "common.delete" })}
                  >
                    <AutomationDeleteIcon />
                  </button>
                </div>
              </div>
            ) : (
              <div className={AUTOMATION_FIELD_STACK_CLASS}>
                <label className="inline-flex items-center gap-1.5 text-ui-base font-normal leading-5 text-foreground-subtle">
                  {intl.formatMessage({ id: "automations.form.schedule.label" })}
                </label>
                {scheduleMissing ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        data-testid={TESTID_AUTOMATION_SCHEDULE_ADD}
                        aria-invalid={scheduleMissing && validationVisible.has("schedule")}
                        className={cn(
                          "flex h-9 w-full items-center gap-1 rounded-lg border bg-card px-2 text-ui-base font-normal leading-5 text-foreground-subtle transition-colors hover:border-input-border-hover hover:bg-surface-hover hover:text-foreground focus-visible:border-input-border-focused data-[state=open]:border-input-border-focused data-[state=open]:bg-surface-hover data-[state=open]:text-foreground",
                          validationVisible.has("schedule") ? "!border-destructive !ring-2 !ring-destructive/20" : "border-input-border",
                        )}
                      >
                        <span className="flex size-5 shrink-0 items-center justify-center">
                          <AutomationPlusIcon aria-hidden="true" />
                        </span>
                        {intl.formatMessage({ id: "scheduledPreview.addSchedule" })}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" sideOffset={4} className="w-[148px] rounded-[10px] p-1.5">
                      {AUTOMATION_FREQUENCIES.map((frequency) => (
                        <DropdownMenuItem
                          key={frequency}
                          data-testid={testidTemplate(TESTID_FREQUENCY_OPTION, frequency)}
                          className="min-h-8 rounded-lg px-2 py-2 text-ui-base text-foreground-subtle data-[highlighted]:bg-menu-hover data-[highlighted]:text-foreground"
                          onSelect={() => {
                            markTouched("schedule");
                            if (frequency === "custom") {
                              setCustomRepeatOpen(true);
                              return;
                            }
                            setBuilder((previous) => ({
                              ...previous,
                              frequency: frequency as ScheduleBuilderState["frequency"],
                              ...(frequency === "weekdays" ? { weekdays: [1, 2, 3, 4, 5] } : {}),
                            }));
                            setScheduleMissing(false);
                            clearTouched("schedule");
                          }}
                        >
                          {intl.formatMessage({ id: `automations.frequency.${frequency}` })}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="relative flex h-9 flex-nowrap items-center gap-1 overflow-hidden rounded-lg border border-input-border bg-card py-1 pl-[7px] pr-9 text-ui-base leading-5 text-foreground transition-colors hover:border-input-border-hover focus-within:border-input-border-focused">
                    <Select
                      value={builder.frequency}
                      onValueChange={(value) => {
                        if (!isAutomationFrequency(value)) {
                          logger.warn("[AutomationEditView] 忽略非法的频率选择值", {
                            automationId: editing?.automationId,
                            cronExpr: editing?.cronExpr,
                            value,
                          });
                          return;
                        }
                        markTouched("schedule");
                        if (value === "custom") {
                          setCustomRepeatOpen(true);
                          return;
                        }
                        setBuilder((previous) => ({
                          ...previous,
                          frequency: value,
                          ...(value === "weekdays" ? { weekdays: [1, 2, 3, 4, 5] } : {}),
                        }));
                      }}
                    >
                      <SelectTrigger
                        variant="ghost"
                        data-testid={TESTID_AUTOMATION_FREQUENCY}
                        className="h-auto min-w-24 rounded-lg border-0 bg-hover py-px pl-2 text-ui-base leading-5 text-foreground hover:bg-selected aria-expanded:bg-selected"
                        indicator={<AutomationChevronIndicator />}
                      >
                        <SelectValue>{intl.formatMessage({ id: `automations.frequency.${builder.frequency}` })}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {AUTOMATION_FREQUENCIES.map((frequency) => (
                          <SelectItem key={frequency} value={frequency} data-testid={testidTemplate(TESTID_FREQUENCY_OPTION, frequency)}>
                            {intl.formatMessage({ id: `automations.frequency.${frequency}` })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {builder.frequency === "monthly" ? (
                      <Select
                        value={String(builder.dayOfMonth)}
                        onValueChange={(value) => {
                          markTouched("schedule");
                          setBuilder((previous) => ({ ...previous, dayOfMonth: Number(value) }));
                        }}
                      >
                        <SelectTrigger variant="ghost" className="h-auto w-auto rounded-lg border-0 bg-hover py-px pl-2 pr-0.5 text-ui-base leading-5 text-foreground hover:bg-selected aria-expanded:bg-selected" indicator={<AutomationChevronIndicator />}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {Array.from({ length: 31 }, (_, index) => index + 1).map((day) => (
                            <SelectItem key={day} value={String(day)}>
                              {intl.formatMessage({ id: "automations.form.dayOfMonth" }, { day: String(day) })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : null}
                    {builder.frequency === "weekly" ? (
                      <WeekdayPicker
                        weekdays={builder.weekdays}
                        intl={intl}
                        onChange={(weekdays) => {
                          markTouched("schedule");
                          setBuilder((previous) => ({ ...previous, weekdays }));
                        }}
                      />
                    ) : null}
                    {builder.frequency === "custom" ? (
                      <button
                        type="button"
                        data-testid={TESTID_AUTOMATION_CUSTOM_FREQUENCY}
                        onClick={() => setCustomRepeatOpen(true)}
                        className="inline-flex h-auto items-center gap-0.5 rounded-lg bg-hover py-px pl-2 pr-0.5 text-ui-base leading-5 text-foreground hover:bg-selected"
                      >
                        <span>
                          {intl.formatMessage(
                            { id: "automations.customRepeat.compactFrequency" },
                            {
                              interval: String(builder.customInterval),
                              unit: intl.formatMessage({
                                id: `automations.customRepeat.unit.${
                                  builder.customUnit === "minute" ? "minute" : builder.customUnit === "daily" ? "day" : builder.customUnit === "weekly" ? "week" : builder.customUnit === "monthly" ? "month" : builder.customUnit === "yearly" ? "year" : "hour"
                                }`,
                              }),
                            },
                          )}
                        </span>
                        <AutomationChevronIndicator />
                      </button>
                    ) : null}
                    {builder.frequency !== "custom" && builder.frequency !== "hourly" ? (
                      <>
                        <span className="text-foreground">{intl.formatMessage({ id: "automations.form.schedule.at" })}</span>
                        <TimePicker
                          hour={builder.hour}
                          minute={builder.minute}
                          ariaLabel={intl.formatMessage({ id: "automations.form.schedule.label" })}
                          onChange={(hour, minute) => {
                            markTouched("schedule");
                            setBuilder((previous) => ({ ...previous, hour, minute }));
                          }}
                        />
                        <span className="whitespace-nowrap text-foreground-subtle">{gmtOffsetLabel()}</span>
                      </>
                    ) : null}
                    {builder.frequency === "hourly" ? (
                      <div className="flex items-center gap-1 text-ui-base leading-5 text-foreground">
                        <span>{intl.formatMessage({ id: "automations.form.schedule.minutePrefix" })}</span>
                        <Select
                          value={String(builder.minute)}
                          onValueChange={(value) => {
                            markTouched("schedule");
                            setBuilder((previous) => ({ ...previous, minute: Number(value) }));
                          }}
                        >
                          <SelectTrigger variant="ghost" className="h-auto w-14 rounded-lg border-0 bg-hover py-px pl-2 text-ui-base leading-5 tabular-nums hover:bg-selected">
                            <SelectValue>{pad2(builder.minute)}</SelectValue>
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {Array.from({ length: 60 }, (_, index) => (
                              <SelectItem key={index} value={String(index)}>
                                {pad2(index)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span>{intl.formatMessage({ id: "automations.form.schedule.minuteSuffix" })}</span>
                      </div>
                    ) : null}
                    {builder.frequency === "custom" && builder.customUnit === "hourly" ? (
                      <div className="flex items-center gap-1 text-ui-base leading-5 text-foreground">
                        <span>{intl.formatMessage({ id: "automations.form.schedule.at" })}</span>
                        <Select
                          value={String(builder.minute)}
                          onValueChange={(value) => {
                            markTouched("schedule");
                            setBuilder((previous) => ({ ...previous, minute: Number(value) }));
                          }}
                        >
                          <SelectTrigger variant="ghost" className="h-auto w-16 rounded-lg border-0 bg-hover py-px pl-2 text-ui-base leading-5 tabular-nums hover:bg-selected">
                            <SelectValue>{pad2(builder.minute)}</SelectValue>
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {Array.from({ length: 60 }, (_, index) => (
                              <SelectItem key={index} value={String(index)}>
                                {pad2(index)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span>{intl.formatMessage({ id: "automations.customRepeat.minutes" })}</span>
                      </div>
                    ) : null}
                    {builder.frequency === "custom" && builder.customUnit === "yearly" ? (
                      <MonthDayPicker
                        month={builder.customMonth}
                        day={builder.customMonthDays[0] ?? 1}
                        intl={intl}
                        onChange={(month, day) => {
                          markTouched("schedule");
                          setBuilder((previous) => ({ ...previous, customMonth: month, customMonthDays: [day] }));
                        }}
                      />
                    ) : null}
                    {builder.frequency === "custom" && builder.customUnit !== "hourly" && builder.customUnit !== "minute" ? (
                      <>
                        <span className="text-foreground">{intl.formatMessage({ id: "automations.form.schedule.at" })}</span>
                        <TimePicker
                          hour={builder.hour}
                          minute={builder.minute}
                          onChange={(hour, minute) => {
                            markTouched("schedule");
                            setBuilder((previous) => ({ ...previous, hour, minute }));
                          }}
                        />
                        <span className="text-foreground-subtle">{gmtOffsetLabel()}</span>
                      </>
                    ) : null}
                    {schedulePreview ? (
                      <span data-testid={TESTID_AUTOMATION_SCHEDULE_BOX} className="min-w-0 flex-1 truncate text-ui-base text-foreground-subtle sm:ml-1">
                        {schedulePreview}
                      </span>
                    ) : null}
                    <button
                      type="button"
                      data-testid={TESTID_AUTOMATION_SCHEDULE_DELETE}
                      onClick={removeSchedule}
                      className="absolute right-2 top-2 flex size-5 items-center justify-center text-foreground-subtle transition-colors hover:text-foreground"
                      aria-label={intl.formatMessage({ id: "common.delete" })}
                    >
                      <AutomationDeleteIcon />
                    </button>
                  </div>
                )}
                <CustomRepeatDialog
                  builder={builder}
                  endAt={endAt}
                  intl={intl}
                  open={customRepeatOpen}
                  onOpenChange={setCustomRepeatOpen}
                  onConfirm={({ interval, unit, weekdays, monthDays, monthlyMode, endAt: nextEndAt }) => {
                    markTouched("schedule");
                    setScheduleMissing(false);
                    clearTouched("schedule");
                    setBuilder((previous) => ({
                      ...previous,
                      frequency: "custom",
                      customInterval: interval,
                      customUnit: unit,
                      customWeekdays: weekdays,
                      customMonthDays: monthDays,
                      customMonthlyMode: monthlyMode,
                    }));
                    setEndAt(nextEndAt);
                  }}
                />
              </div>
            )}
            <div className={AUTOMATION_FIELD_STACK_CLASS}>
              <label className="text-ui-base font-normal leading-5 text-foreground-subtle" htmlFor="automation-prompt">
                {intl.formatMessage({ id: "automations.form.prompt.label" })}
              </label>
              <PromptCard invalid={validationVisible.has("prompt") && !prompt.trim()}>
                <AutoGrowTextarea
                  id="automation-prompt"
                  data-testid={TESTID_AUTOMATION_PROMPT}
                  value={prompt}
                  onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                    markTouched("prompt");
                    clearTouched("prompt");
                    setPrompt(event.target.value);
                  }}
                  placeholder={intl.formatMessage({ id: "automations.edit.promptPlaceholder" })}
                  aria-invalid={validationVisible.has("prompt") && !prompt.trim()}
                />
                <PromptCardFooter>
                  <div className="flex min-w-0 flex-wrap items-center gap-2 text-foreground-subtle">
                    {editing ? (
                      <Button type="button" variant="ghost" size="xs" disabled className="h-auto min-h-7 gap-1 rounded-md px-2 py-1 text-ui-base font-normal leading-normal">
                        {isConversationWorkspace ? <IconMessageSquarePlus className="size-3.5" aria-hidden="true" /> : <IconFolderOpen className="size-3.5" aria-hidden="true" />}
                        <span className="max-w-40 truncate">{workspaceDisplayLabel}</span>
                      </Button>
                    ) : workspaceTabEntries.length > 0 ? (
                      <WorkspaceSelectRow
                        workspacePath={selectedWorkspacePath}
                        workspaceTabs={workspaceTabEntries}
                        allowConversationWorkspaceSelection={!!conversationOption}
                        allowConversationWorkspaceDetach={false}
                        onSelectWorkspace={handleSelectWorkspace}
                        onSelectConversationWorkspace={handleSelectConversationWorkspace}
                        allowOpenWorkspace={false}
                        allowRemoteWorkspace={false}
                        onOpenFolder={() => {}}
                        onConnectRemote={async () => ""}
                        onSelectRemoteProject={async () => {}}
                        onCancelRemoteProject={async () => {}}
                        containerClassName="rounded-lg"
                        triggerClassName={cn(AUTOMATION_TOOLBAR_BUTTON_CLASS, "min-w-0 gap-1 px-2")}
                      />
                    ) : (
                      <Button type="button" variant="ghost" size="xs" disabled className="h-auto min-h-7 gap-1 rounded-md px-2 py-1 text-ui-base font-normal leading-normal text-foreground-subtlest">
                        <IconFolderOpen className="size-3.5" aria-hidden="true" />
                        {intl.formatMessage({ id: "automations.form.project.localRequired" })}
                      </Button>
                    )}
                    <ModeSelector
                      option={modeOption}
                      onValueChange={(value) => {
                        markTouched("mode");
                        modeBaseline.current = value;
                        setMode(value);
                      }}
                      tooltipTitle={intl.formatMessage({ id: "chat.toolbar.mode.label" })}
                      triggerVariant="ghost"
                      triggerSize="default"
                      triggerClassName={cn(AUTOMATION_TOOLBAR_BUTTON_CLASS, "w-fit max-w-56 min-w-0 shrink justify-start gap-1 px-2")}
                      labelVisibilityClassName="inline-flex min-w-0 truncate text-left"
                      provider="glm"
                      restoreFocusSelector={null}
                    />
                  </div>
                  <div className="flex min-w-0 flex-wrap items-center justify-end gap-2 text-foreground-subtle">
                    <ModelSelector
                      modelGroups={modelSelectGroups as ModelGroup[]}
                      normalizedValue={modelItem?.value ?? model}
                      triggerLabel={modelTriggerLabel}
                      showManageModelsAction={!!onManageModels}
                      lockReasonMessage=""
                      isItemLocked={automationModelNeverLocked}
                      onValueChange={handleModelChange}
                      tooltipTitle={intl.formatMessage({ id: "chat.toolbar.model.label" })}
                      disabled={thoughtLoading}
                      pending={thoughtLoading}
                      pendingLabel={thoughtLoading ? modelItem?.name : undefined}
                      manageModelsLabel={intl.formatMessage({ id: "chat.toolbar.model.manageModels" })}
                      onManageModels={onManageModels}
                      contentSide="top"
                      focusSelectorOnClose={null}
                      labelVisibilityClassName="hidden @sm/composer:inline-flex"
                      indicatorClassName="hidden @sm/composer:block"
                      triggerClassName={cn(
                        AUTOMATION_TOOLBAR_BUTTON_CLASS,
                        "w-fit max-w-72 min-w-0 shrink @max-sm/composer:size-7 @max-sm/composer:justify-center @max-sm/composer:gap-0 @max-sm/composer:p-0",
                      )}
                      triggerIconClassName="inline-flex @sm/composer:hidden"
                    />
                    {thoughtFailed ? (
                      <Button type="button" variant="ghost" size="xs" className="h-7 rounded-lg px-2 text-ui-sm text-foreground-subtle" onClick={() => setThoughtRetry((previous) => previous + 1)}>
                        {intl.formatMessage({ id: "automations.form.model.previewRetry" })}
                      </Button>
                    ) : null}
                    {normalizedThoughtOption ? (
                      <ThoughtLevelSelector
                        intl={intl}
                        option={normalizedThoughtOption}
                        provider="glm"
                        disabled={thoughtLoading}
                        triggerRef={thoughtTriggerRef}
                        indicatorClassName="hidden @xl/composer:block"
                        triggerClassName={cn(AUTOMATION_TOOLBAR_BUTTON_CLASS, "@max-sm/composer:size-7 @max-sm/composer:justify-center @max-sm/composer:p-0")}
                        restoreFocusSelector={null}
                        labelVisibilityClassName="hidden @xl/composer:inline-flex"
                        onValueChange={(value) => {
                          markTouched("thoughtLevel");
                          thoughtTouched.current = true;
                          thoughtBaseline.current = value;
                          setThoughtLevel(value);
                        }}
                      />
                    ) : null}
                  </div>
                </PromptCardFooter>
              </PromptCard>
            </div>
          </form>
        ) : (
          <div>
            {runsLoading && runs.length === 0 ? (
              <div className="flex h-32 items-center justify-center">
                <IconSpinnerAlt className="size-5" />
              </div>
            ) : runsEntry?.status === "error" ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-ui-sm text-destructive">{runsEntry.error}</div>
            ) : runs.length === 0 ? (
              <AutomationsEmptyState>{intl.formatMessage({ id: "automations.runs.empty" })}</AutomationsEmptyState>
            ) : (
              <div className="overflow-x-auto rounded-[8px]">
                <table className="w-full text-left text-ui-base font-normal leading-normal tracking-[-0.08px]">
                  <thead className="bg-surface text-foreground-subtle">
                    <tr className="h-[30px] border-b border-border">
                      <th className="px-4 font-normal">{intl.formatMessage({ id: "automations.runs.col.triggered" })}</th>
                      <th className="px-4 font-normal">{intl.formatMessage({ id: "automations.runs.col.trigger" })}</th>
                      <th className="px-4 font-normal">{intl.formatMessage({ id: "automations.runs.col.status" })}</th>
                      <th className="px-4 font-normal">{intl.formatMessage({ id: "automations.runs.col.duration" })}</th>
                      <th className="px-4 font-normal" />
                    </tr>
                  </thead>
                  <tbody>
                    {pageRuns.map((run) => {
                      const status = automationRunStatusOf(run);
                      const statusLabel = intl.formatMessage({ id: `automations.runs.status.${status}` });
                      const statusNode = (
                        <span className="flex items-center text-ui-base leading-5 tracking-[-0.18px]">
                          <span className="flex size-5 shrink-0 items-center justify-center">
                            <span className={cn("inline-block size-1.5 rounded-full", AUTOMATION_RUN_DOT_CLASSES[status])} />
                          </span>
                          <span className={AUTOMATION_RUN_TEXT_CLASSES[status]}>{statusLabel}</span>
                        </span>
                      );
                      const canOpenSession = !!(run.sessionId && onOpenSession);
                      const hasActions = canOpenSession || !!onDeleteRun;
                      return (
                        <tr key={run.runId} className="h-[46px] border-b border-border transition-colors last:border-b-0 hover:bg-surface-hover">
                          <td className="whitespace-nowrap px-4 text-foreground-subtle">{formatDateTime(run.scheduledAt ?? run.createdAt)}</td>
                          <td className="whitespace-nowrap px-4 text-foreground-subtle">{intl.formatMessage({ id: `automations.trigger.${run.trigger}` })}</td>
                          <td className="px-4">
                            {status === "failed" ? (
                              <Tooltip title={run.error?.trim() || intl.formatMessage({ id: "automations.runs.errorUnavailable" })} side="top" align="start">
                                {statusNode}
                              </Tooltip>
                            ) : (
                              statusNode
                            )}
                          </td>
                          <td className="whitespace-nowrap px-4 text-foreground-subtle">{formatRunDuration(run.createdAt, run.updatedAt)}</td>
                          <td className="px-4">
                            <div className="flex items-center justify-end">
                              {hasActions ? (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button
                                      type="button"
                                      aria-label={intl.formatMessage({ id: "automations.moreActions" })}
                                      className="flex size-6 items-center justify-center rounded-[6px] text-foreground-subtle transition-colors hover:bg-white/10 hover:text-foreground data-[state=open]:bg-white/10 data-[state=open]:text-foreground"
                                    >
                                      <AutomationMoreIcon className="size-4" aria-hidden="true" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" sideOffset={4} className="min-w-[160px]">
                                    {canOpenSession ? (
                                      <DropdownMenuItem onSelect={() => onOpenSession?.(run.sessionId as string)}>
                                        <IconExternalSession className="size-3.5" aria-hidden="true" />
                                        {intl.formatMessage({ id: "automations.runs.openSession" })}
                                      </DropdownMenuItem>
                                    ) : null}
                                    {onDeleteRun ? (
                                      <>
                                        {canOpenSession ? <DropdownMenuSeparator /> : null}
                                        <DropdownMenuItem variant="destructive" onSelect={() => onDeleteRun(run.runId)}>
                                          <AutomationDeleteIcon />
                                          {intl.formatMessage({ id: "automations.runs.delete" })}
                                        </DropdownMenuItem>
                                      </>
                                    ) : null}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {runs.length > 0 && pageCount > 1 ? (
              <nav className="mt-4 flex items-center justify-between text-ui-base">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setRunsPage(Math.max(1, currentPage - 1))}
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-foreground-subtle transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                >
                  <IconArrowLeft className="size-3.5" aria-hidden="true" />
                  {intl.formatMessage({ id: "automations.runs.prevPage" })}
                </button>
                <div className="flex items-center gap-1">
                  {pageWindow.map((entry, index) =>
                    entry === "ellipsis" ? (
                      <span key={`ellipsis-${index}`} className="flex size-7 items-center justify-center text-foreground-subtlest" aria-hidden="true">
                        …
                      </span>
                    ) : (
                      <button
                        key={entry}
                        type="button"
                        aria-current={entry === currentPage ? "page" : undefined}
                        onClick={() => setRunsPage(entry)}
                        className={cn(
                          "inline-flex size-7 items-center justify-center rounded-[6px] transition-colors",
                          entry === currentPage ? "bg-surface text-foreground" : "text-foreground-subtle hover:bg-surface-hover hover:text-foreground",
                        )}
                      >
                        {entry}
                      </button>
                    ),
                  )}
                </div>
                <button
                  type="button"
                  disabled={currentPage >= pageCount}
                  onClick={() => setRunsPage(Math.min(pageCount, currentPage + 1))}
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-foreground-subtle transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                >
                  {intl.formatMessage({ id: "automations.runs.nextPage" })}
                  <IconArrowRight className="size-3.5" aria-hidden="true" />
                </button>
              </nav>
            ) : null}
          </div>
        )}
      </div>
    </>
  );
}

/* 文件尾：本文件三个 §区（子代理/插件/自动化）均为接口级叶子的实体化；
   与并行批次的边界裁决见 B4 合并报告 §4。 */
