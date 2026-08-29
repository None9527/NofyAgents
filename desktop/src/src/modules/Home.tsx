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

import * as React from "react";
import { useVirtualizer } from '@tanstack/react-virtual'; // A0-S3a：vendored useVirtualizer（原 to，esm-BY6T6pIH.js）→ npm @tanstack/react-virtual@3.14.10
import { Button } from './button'; // A0-CLEANUP 族清理：Button declare 改指 button chunk
import { BackgroundWorksCapsule, ComposerInput, type AppSlashCommand, type BackgroundWork, type ComposerEditorApi, type WebElementContext } from './Composer'; // A0-CLEANUP2 item 10：属主导出后接线（原 rZe/ZV）
import { countContextAttachments, isAddToChatEvent, useCodeCommentContexts, type CodeCommentAttachment } from './GitReview';
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger, toast } from './ImeComposition';
import { pathBasename } from './ModalsLeaves';
import { RemoteWizardDialog, type RemoteWorkspaceSessionLike } from './RemoteWizard'; // +RemoteWorkspaceSessionLike（A0-CLEANUP B-24 接线）
import { create, logger, useTaskStore } from './SkillStore';
import { providerIds } from './SrcSharedA';
import { useServices } from './services';
import { workspaceScopeKey } from './stores-session';
import { cn } from './UtilsCn'; // 原 Z（utils-CEEH0K_K.js）
import { InfoTooltip as Tooltip } from './UsageStatsUiParts'; // 原 Ia（A0-CLEANUP 族清理：本地 Tooltip declare 改指 InfoTooltip）

/* ============================================================================
 * 0. 外部依赖的类型声明（真实实现位于上面清单所列 chunk；此处为重建接口）
 * ==========================================================================*/


/** react-intl 风格 intl 对象（原 G()，IntlProvider-C321H7m8.js） */
interface IntlShape {
  formatMessage(descriptor: { id: string }, values?: Record<string, unknown>): string;
}
declare function useIntlContext(): { intl: IntlShape; locale: string };

/** 日志器（原 J，logger-PFDwl5Yq.js） */

/** toast（原 m，imeComposition chunk 的 _ 导出） */

/** zustand create（原 Ae，skillStore-BmeKHDBI.js） */

/** useTaskStore（原 xe，skillStore chunk）——本族仅用 draftFocusVersion */

/* ── tombstone（A0-S3a）：vendored useVirtualizer（原 to，esm-BY6T6pIH.js）declare 删除，
 *    改 npm @tanstack/react-virtual@3.14.10 真实 import（文件头）；
 *    count/getScrollElement/estimateSize/overscan 调用面与 getTotalSize/getVirtualItems/scrollToIndex 返回面逐字不变。 ── */

/* --- 平台 / 服务 --- */

/* A0-CLEANUP4：与 stores-tasks.OffPeakTask 双向对齐（bundle js 134720/134426 消费面
   offPeakTaskId 恒有值；title 可选）。原 id/title 必填为重建偏差。 */
interface OffPeakTaskSummary {
  offPeakTaskId: string;
  prompt: string;
  status: string;
  title?: string;
  [key: string]: unknown;
}
interface OffPeakGrayConfig {
  enabled?: boolean;
  codingPlanActive?: boolean;
  [key: string]: unknown;
}
interface OffPeakCodingPlanSupport {
  supported?: boolean;
  [key: string]: unknown;
}
interface OffPeakTakeNumberAvailability {
  [key: string]: unknown;
}
type OffPeakCreateResult =
  | { ok: true; [key: string]: unknown }
  | {
      ok: false;
      failureStage: string;
      errorCategory: "quota_3103" | "network" | "invalid_response" | "unknown" | string;
      errorCode: string;
      providerName: string;
    };

interface OffPeakTaskService {
  list(): Promise<OffPeakTaskSummary[]>;
  getCodingPlanSupport(): Promise<OffPeakCodingPlanSupport>;
  getTakeNumberAvailability(): Promise<OffPeakTakeNumberAvailability>;
  createTask(input: OffPeakCreateInput): Promise<OffPeakCreateResult>;
  updateTask(id: string, patch: Partial<OffPeakCreateInput>): Promise<OffPeakTaskSummary | null>;
  pauseTask(id: string): Promise<void>;
  continueTask(id: string): Promise<void>;
  cancelTask(id: string): Promise<void>;
  deleteTask(id: string): Promise<void>;
  deleteHistory(id: string): Promise<void>;
}
interface CodingPlanSubscriptionService {
  getOffPeakClientConfig(opts: { forceRefresh: boolean }): Promise<OffPeakGrayConfig | null>;
}

/** 服务 context（原 fs()，横切层 §2.2） */

/** 设置快照（原 JM()，Settings 族提供） */
interface SettingsSnapshot {
  providerFamilyDomain?: string;
  modelProviderFamilyModes?: Record<string, string>;
  modelProviderFamilySelectedKeys?: Record<string, string>;
  [key: string]: unknown;
}
declare function useSettingsSnapshot(): { settings: SettingsSnapshot | null };

/** 模型供应商列表（原 qq()，ProviderPlanUsage 族提供） */
interface ModelProviderEntry {
  id: string;
  enabled?: boolean;
  systemDisabledReason?: string | null;
  [key: string]: unknown;
}
declare function useModelProviders(): { modelProviders: ModelProviderEntry[]; loading: boolean };

/** 升级动作（原 Art()，ProviderPlanUsage 族提供） */
declare function useUpgradeActions(): {
  openCodingPlanUpgrade?(opts: {
    providerId: string;
    initialAudience: "personal" | "team";
    funnelContext: unknown;
  }): void;
} | null;

/** 供应商 id 枚举（原 q，横切层） */

/** 供应商族判定（原 li：coding plan 供应商族；xn：域名→族；zi：族×模式→认证方式） */
declare function resolveCodingPlanProviderFamily(providerId: string): string | null;
declare function providerFamilyFromDomain(domain: string): string | null;
declare function resolveProviderFamilyAuthMode(family: string, modes: Record<string, string> | undefined): string;

/** 遥测漏斗助手（原 FM/LM，ProviderPlanUsage 族） */
declare function buildCodingPlanFunnelContext(opts: {
  providerId: string;
  eventText: string;
  entryPlanState: unknown;
}): unknown;
declare function resolveEntryPlanState(opts: { providers: ModelProviderEntry[]; loading: boolean }): unknown;

/** 平台 context（原 ps()，横切层；hit 用其 broadcastService） */
declare function usePlatformContext(): { broadcastService?: { postMessage?(payload: unknown): void } } | null;

/* --- UI 原语 --- */

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "ghost" | "outline" | "destructive";
  size?: "xs" | "sm" | "default" | "lg" | "icon-sm" | "icon-md";
  type?: "button" | "submit";
}
/* ── tombstone（A0-CLEANUP 族清理）：Button declare 删除 → import { Button } from './button'。 ── */
/* ── tombstone（A0-CLEANUP 族清理）：Tooltip declare 删除 → import { InfoTooltip as Tooltip } from './UsageStatsUiParts'。 ── */


/* DropdownMenu 原语族（本 chunk 47926–48040，TopBar.tsx §1.1 已逐字还原） */
declare function DropdownMenu(props: { children: React.ReactNode }): React.ReactElement;
declare function DropdownMenuTrigger(props: { asChild?: boolean; children: React.ReactNode }): React.ReactElement;
declare function DropdownMenuContent(props: { align?: "start" | "center" | "end"; side?: "top" | "bottom"; className?: string; children: React.ReactNode }): React.ReactElement;
declare function DropdownMenuItem(props: { checked?: boolean; onSelect?: () => void; className?: string; children: React.ReactNode } & Record<string, unknown>): React.ReactElement;
declare function DropdownMenuCheckboxItem(props: { checked?: boolean; onSelect?: () => void; className?: string; children: React.ReactNode } & Record<string, unknown>): React.ReactElement;
declare function DropdownMenuSeparator(props: Record<string, unknown>): React.ReactElement;

/* Dialog 原语族（本 chunk 31943+，TopBar.tsx 已登记） */
declare function Dialog(props: { open: boolean; onOpenChange?: (open: boolean) => void; children: React.ReactNode }): React.ReactElement;
declare function DialogContent(props: { className?: string; showCloseButton?: boolean; children: React.ReactNode } & Record<string, unknown>): React.ReactElement;
declare function DialogHeader(props: { className?: string; children: React.ReactNode }): React.ReactElement;
declare function DialogTitle(props: { className?: string; children: React.ReactNode }): React.ReactElement;
declare function DialogDescription(props: { className?: string; children: React.ReactNode }): React.ReactElement;
declare function DialogClose(props: { asChild?: boolean; children: React.ReactNode }): React.ReactElement;
declare function DialogFooter(props: { className?: string; children: React.ReactNode }): React.ReactElement;

/* InputGroup（本 chunk 28021–32245 原语块） */
declare function InputGroup(props: { className?: string; children: React.ReactNode }): React.ReactElement;
declare function InputGroupAddon(props: { children: React.ReactNode }): React.ReactElement;

/* 图标（原混淆名 → lucide 名；button-laUijeDG.js 的 createLucideIcon 产物） */
declare const IconArrowUp: React.FC<React.SVGProps<SVGSVGElement>>; // T_ arrow-up（发送）
declare const IconSquare: React.FC<React.SVGProps<SVGSVGElement>>; // Wv square（停止）
declare const IconMegaphone: React.FC<React.SVGProps<SVGSVGElement>>; // Yye megaphone（横幅）
declare const IconMoon: React.FC<React.SVGProps<SVGSVGElement> & { "data-off-peak-homepage-template-icon"?: string; size?: number }>; // xv moon（建议卡）
declare const IconRotateCcw: React.FC<React.SVGProps<SVGSVGElement>>; // gbe rotate-ccw（重试）
declare const IconClipboardPenLine: React.FC<React.SVGProps<SVGSVGElement>>; // xye clipboard-pen-line
declare const IconHouse: React.FC<React.SVGProps<SVGSVGElement>>; // sv house（家目录=工作区）
declare const IconFolder: React.FC<React.SVGProps<SVGSVGElement>>; // $_ folder
declare const IconCloud: React.FC<React.SVGProps<SVGSVGElement>>; // U_ cloud（远程）
declare const IconFolderPlus: React.FC<React.SVGProps<SVGSVGElement>>; // Nye folder-plus（打开文件夹）
declare const IconMessageCircle: React.FC<React.SVGProps<SVGSVGElement>>; // gv message-circle（会话工作区）
declare const IconSearch: React.FC<React.SVGProps<SVGSVGElement>>; // Fv search
declare const IconChevronDown: React.FC<React.SVGProps<SVGSVGElement>>; // N_ chevron-down
declare const IconLoader: React.FC<React.SVGProps<SVGSVGElement>>; // fv loader
declare const IconInfo: React.FC<React.SVGProps<SVGSVGElement>>; // p（imeComposition chunk `info`）
declare const IconClose: React.FC<React.SVGProps<SVGSVGElement>>; // g（imeComposition chunk close-x）

/** Spinner（原 EN，js 54789：loader 图标 + animate-spin 包装） */
export function Spinner({ className, ...rest }: { className?: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <IconLoader
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className) as string}
      {...rest}
    />
  );
}

/** 文件图标组件（原 Vc：按扩展名出图标，src 来自文件图标服务） */
declare function FileIcon(props: { src?: string; size: number; className?: string }): React.ReactElement;
/** 按路径解析文件图标（原 zc，横切层 5150） */
declare function resolveFileIconInfo(path: string): { fileIconSrc?: string };

/* --- testid 常量（原值来自 src-HCld2afU.js，见头部登记） --- */
const COMPOSER_REGION_TESTID = "v4-composer"; // Ht
const ATTACHMENT_MENU_ITEM_TESTID = "chat-attachment-menu-item"; // St
const ATTACHMENT_BUTTON_TESTID = "chat-attachment-button"; // At
const STOP_BUTTON_TESTID = "v4-stop"; // Ot
const SEND_BUTTON_TESTID = "v4-composer-send"; // see
const COMPOSER_INPUT_TESTID = "v4-composer-input"; // un
const PAUSED_QUEUE_SEND_DIALOG_TESTID = "v4-paused-queue-send-dialog"; // Yee
const CLEAR_QUEUE_SEND_TESTID = "v4-composer-clear-queue-send"; // Sne
const KEEP_QUEUE_SEND_TESTID = "v4-composer-keep-queue-send"; // pee
const ATTACHMENT_UPLOAD_PROGRESS_TESTID = "v4-attachment-upload-progress"; // Br
const ATTACHMENT_UPLOAD_RETRY_TESTID = "v4-attachment-upload-retry"; // Yt
const ATTACHMENT_ITEM_TESTID = "v4-attachment"; // ct
const PROJECT_DETACH_TESTID = "composer-project-detach"; // Ut
const WORKSPACE_TRIGGER_TESTID = "composer-workspace-trigger"; // Cne
const REMOTE_CONNECTION_TESTID = "composer-remote-connection"; // _n
const WORK_OUTSIDE_PROJECT_TESTID = "composer-work-outside-project"; // dn
/** testid 拼接（原 qr = Nb：`${e}-${t}`） */
function testidOf(base: string, suffix: string): string {
  return `${base}-${suffix}`;
}

/* ============================================================================
 * 1. 问候 hero（原 vit/gX/_X/yit/bit/xit/Sit/Cit，js 91182–91336 / jsx 78837–78935）
 *    draft 态消息列表的 emptyState：品牌线框大图居中垫底，问候语按时段 6 档，
 *    字号按「可用宽度 ÷ 文本自然宽度 × 30」在 20–30px 间自适应。
 * ==========================================================================*/

/** 原 vit：问候时段分界（小时） */
export const GREETING_HOUR_BOUNDARIES = [5, 9, 12, 14, 18, 23];
/** 原 gX：问候语最小字号 */
export const GREETING_MIN_FONT_SIZE_PX = 20;
/** 原 _X：问候语最大字号 */
export const GREETING_MAX_FONT_SIZE_PX = 30;

/** 原 yit：按小时段选 6 档问候 key（chat.empty.greeting.*） */
export function resolveGreetingI18nId(now: Date = new Date()): string {
  const hours = now.getHours();
  return hours >= 5 && hours < 9
    ? "chat.empty.greeting.morningEarly"
    : hours >= 9 && hours < 12
      ? "chat.empty.greeting.morning"
      : hours >= 12 && hours < 14
        ? "chat.empty.greeting.noon"
        : hours >= 14 && hours < 18
          ? "chat.empty.greeting.afternoon"
          : hours >= 18 && hours < 23
            ? "chat.empty.greeting.evening"
            : "chat.empty.greeting.lateNight";
}

/** 原 bit：距下一个时段分界的毫秒数（用于定时刷新问候语） */
export function msUntilNextGreetingBoundary(now: Date = new Date()): number {
  const boundariesToday = GREETING_HOUR_BOUNDARIES.map((hour) => {
    const d = new Date(now);
    d.setHours(hour, 0, 0, 0);
    return d;
  });
  const firstTomorrow = new Date(now);
  firstTomorrow.setDate(firstTomorrow.getDate() + 1);
  firstTomorrow.setHours(GREETING_HOUR_BOUNDARIES[0], 0, 0, 0);
  const next = boundariesToday.find((d) => d.getTime() > now.getTime()) ?? firstTomorrow;
  return Math.max(1, next.getTime() - now.getTime());
}

/** 原 xit：问候语字号自适应（远控态恒 20px；宽度足够时取 30px） */
export function fitGreetingFontSize({
  availableWidthPx,
  naturalTextWidthPx,
  compactForRemoteControl = false,
}: {
  availableWidthPx: number;
  naturalTextWidthPx: number;
  compactForRemoteControl?: boolean;
}): number {
  if (compactForRemoteControl) return GREETING_MIN_FONT_SIZE_PX;
  if (
    !Number.isFinite(availableWidthPx) ||
    !Number.isFinite(naturalTextWidthPx) ||
    availableWidthPx <= 0 ||
    naturalTextWidthPx <= 0 ||
    availableWidthPx >= naturalTextWidthPx
  )
    return GREETING_MAX_FONT_SIZE_PX;
  return Math.max(
    GREETING_MIN_FONT_SIZE_PX,
    Math.min(GREETING_MAX_FONT_SIZE_PX, Math.floor((availableWidthPx / naturalTextWidthPx) * GREETING_MAX_FONT_SIZE_PX)),
  );
}

export interface GreetingHeroProps {
  className?: string;
  /** Web 远控（手机）态：固定最小字号 */
  compactForRemoteControl?: boolean;
}

/**
 * 原 Sit（js 91219 / jsx 78861）：问候 hero。
 * - 底图：HomeHeroLogo 线框 SVG，绝对定位居中、向下渐隐遮罩、透明度 70%
 * - 文本：隐藏的 30px 测量副本（aria-hidden）+ 可见文本；字号写入 CSS 变量
 *   --v4-draft-greeting-font-size；ResizeObserver/resize 节流重算
 * - 定时器：到下一个时段分界时重新取问候 key
 */
export function GreetingHero({ className, compactForRemoteControl = false }: GreetingHeroProps) {
  const { intl } = useIntlContext();
  const [now, setNow] = React.useState<Date>(() => new Date());
  const [fontSizePx, setFontSizePx] = React.useState<number>(GREETING_MAX_FONT_SIZE_PX);
  const textContainerRef = React.useRef<HTMLParagraphElement | null>(null);
  const measureRef = React.useRef<HTMLSpanElement | null>(null);
  const greetingText = intl.formatMessage({ id: resolveGreetingI18nId(now) });

  // 到点切换问候时段
  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setNow(new Date());
    }, msUntilNextGreetingBoundary(now));
    return () => {
      window.clearTimeout(timer);
    };
  }, [now]);

  // 字号自适应：测量容器可用宽度与文本自然宽度
  React.useLayoutEffect(() => {
    if (compactForRemoteControl) {
      setFontSizePx(GREETING_MIN_FONT_SIZE_PX);
      return;
    }
    const container = textContainerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;
    let rafId: number | null = null;
    const recompute = () => {
      rafId = null;
      const styles = window.getComputedStyle(container);
      const horizontalPadding = Number.parseFloat(styles.paddingLeft) + Number.parseFloat(styles.paddingRight);
      const availableWidthPx = Math.max(0, container.getBoundingClientRect().width - horizontalPadding);
      const naturalTextWidthPx = measure.getBoundingClientRect().width;
      const nextSize = fitGreetingFontSize({ availableWidthPx, naturalTextWidthPx });
      setFontSizePx((prev) =>
        prev === nextSize
          ? prev
          : (logger.debug("[v4-draft-greeting] 标题自身可用宽度变化，更新字号", {
              availableWidthPx: Math.round(availableWidthPx),
              naturalTextWidthPx: Math.round(naturalTextWidthPx),
              previousFontSizePx: prev,
              nextFontSizePx: nextSize,
            }),
            nextSize),
      );
    };
    const scheduleRecompute = () => {
      if (rafId === null) rafId = window.requestAnimationFrame(recompute);
    };
    recompute();
    if (typeof ResizeObserver > "u") {
      // 环境无 ResizeObserver：退回 window resize
      window.addEventListener("resize", scheduleRecompute);
      return () => {
        if (rafId !== null) window.cancelAnimationFrame(rafId);
        window.removeEventListener("resize", scheduleRecompute);
      };
    }
    const observer = new ResizeObserver(scheduleRecompute);
    observer.observe(container);
    observer.observe(measure);
    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [compactForRemoteControl, greetingText]);

  return (
    <div
      className={cn(
        "relative mb-10 flex w-full max-w-2xl flex-col items-center justify-center gap-6 text-foreground sm:mb-8",
        className,
      ) as string}
    >
      {/* 品牌线框底图（spec §5 hero）：向下渐隐的遮罩 + 70% 透明度 */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute left-1/2 top-1/2 aspect-[5/4] w-[min(72vw,25rem)] -mt-10",
          "-translate-x-1/2 -translate-y-1/2 text-foreground-subtlest opacity-70",
          "[-webkit-mask-image:linear-gradient(to_bottom,black_0%,transparent_70%,transparent_100%)]",
          "[-webkit-mask-repeat:no-repeat] [-webkit-mask-size:100%_100%]",
          "[mask-image:linear-gradient(to_bottom,black_0%,transparent_70%,transparent_100%)]",
          "[mask-repeat:no-repeat] [mask-size:100%_100%]",
        ) as string}
      >
        <HomeHeroLogo className="h-full w-full" />
      </div>
      {/* 问候语：隐藏测量副本 + 可见文本 */}
      <p
        ref={textContainerRef}
        data-v4-draft-greeting="true"
        style={{ "--v4-draft-greeting-font-size": `${fontSizePx}px` } as React.CSSProperties}
        className={cn(
          "relative z-10 w-full px-4 text-center font-medium text-foreground",
          compactForRemoteControl ? "text-xl/[1.2]" : "text-[length:var(--v4-draft-greeting-font-size)]/[1.2]",
        ) as string}
      >
        <span
          ref={measureRef}
          aria-hidden="true"
          className="pointer-events-none invisible absolute whitespace-nowrap text-3xl/[1.2]"
        >
          {greetingText}
        </span>
        <span>{greetingText}</span>
      </p>
    </div>
  );
}

/**
 * 原 Cit（js 91322 / jsx 78922）：Home hero 品牌线框 logo（400×320，stroke=currentColor）。
 * 路径逐字转录自源码。
 */
export function HomeHeroLogo({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} width="400" height="320" viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* REBRAND-039+139 */}
      <path
        d="M122 270 L122 148 A78 78 0 0 1 278 148 L278 270"
        stroke="currentColor"
        strokeWidth="56"
      />
    </svg>
  );
}

/* ============================================================================
 * 2. off-peak 助手 + store + 横幅（原 vX/wit/Tit/Eit/Dit/bX/Oit/kit，
 *    js 91337–91751 / jsx 78937–79377）。
 *    横幅 = spec §5 的「banner 行（📢 可关）」+「建议卡 3 张」：
 *    3 张卡是 off-peak 闲时任务模板（standupGitSummary/ciFlakyReport/customize），
 *    点击后写入 pendingCreateDraft 并打开自动化面板。
 * ==========================================================================*/

/** 原 vX：错误 → 消息文本 */
export function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** 原 wit：供应商列表中是否存在可用的 Coding Plan 条目 */
export function hasCodingPlanProviderEntry(providers: ModelProviderEntry[]): boolean {
  return providers.some((provider) =>
    provider.id === providerIds.zaiCodingPlan ||
    provider.id === providerIds.bigmodelCodingPlan ||
    resolveCodingPlanProviderFamily(provider.id) !== null
      ? !(provider.enabled === false && provider.systemDisabledReason)
      : false,
  );
}

/** 原 Tit：当前设置是否选中了 Coding Plan 的 OAuth 连接 */
export function isCodingPlanConnectionSelected(
  support: { supported?: boolean; providerFamily?: string; selectedConnectionKey?: string } | null | undefined,
  settings: SettingsSnapshot | null,
): boolean {
  if (!support?.supported || !settings) return false;
  const family = providerFamilyFromDomain(settings.providerFamilyDomain ?? "");
  if (!family || family !== support.providerFamily) return false;
  if (resolveProviderFamilyAuthMode(family, settings.modelProviderFamilyModes) !== "oauth") return false;
  return settings.modelProviderFamilySelectedKeys?.[family]?.trim() === support.selectedConnectionKey;
}

/** 原 Eit：配额 3103 错误判定 */
export function isQuota3103Error(result: OffPeakCreateResult | null | undefined): boolean {
  return result?.ok === false && result.errorCategory === "quota_3103" && result.errorCode === "3103";
}

/** 原 Dit：off-peak 错误 → i18n key */
export function resolveOffPeakErrorI18nId(result: OffPeakCreateResult | null | undefined): string {
  return isQuota3103Error(result)
    ? "offPeak.error.quota"
    : result?.ok === false &&
        (result.errorCategory === "network" ||
          result.errorCategory === "invalid_response" ||
          result.errorCategory === "unknown")
      ? "offPeak.error.unavailable"
      : "offPeak.error.generic";
}

export interface OffPeakCreateInput {
  title?: string;
  prompt?: string;
  telemetrySource?: { eventRegion: string; templateId?: string };
  [key: string]: unknown;
}

export interface OffPeakTaskStoreState {
  tasks: OffPeakTaskSummary[];
  loading: boolean;
  error: string | null;
  operationId: string | null;
  grayConfig: OffPeakGrayConfig | null;
  codingPlanSupport: OffPeakCodingPlanSupport | null;
  takeNumberAvailability: OffPeakTakeNumberAvailability | null;
  takeNumberAvailabilityStatus: "idle" | "loading" | "ready" | "error";
  newTaskBannerDismissed: boolean;
  pendingCreateDraft: OffPeakCreateInput | null;
  initialize(services: {
    offPeakTaskService: OffPeakTaskService;
    codingPlanSubscriptionService: CodingPlanSubscriptionService;
  }): Promise<void>;
  refresh(service: OffPeakTaskService): Promise<void>;
  refreshCodingPlanSupport(service: OffPeakTaskService): Promise<void>;
  refreshTakeNumberAvailability(service: OffPeakTaskService): Promise<void>;
  createTask(input: OffPeakCreateInput, service: OffPeakTaskService): Promise<OffPeakCreateResult>;
  updateTask(id: string, patch: Partial<OffPeakCreateInput>, service: OffPeakTaskService): Promise<boolean>;
  pauseTask(id: string, service: OffPeakTaskService): Promise<void>;
  continueTask(id: string, service: OffPeakTaskService): Promise<void>;
  cancelTask(id: string, service: OffPeakTaskService): Promise<void>;
  deleteTask(id: string, service: OffPeakTaskService): Promise<void>;
  deleteHistory(id: string, service: OffPeakTaskService): Promise<void>;
  dismissNewTaskBanner(): void;
  setPendingCreateDraft(draft: OffPeakCreateInput | null): void;
  consumePendingCreateDraft(): OffPeakCreateInput | null;
}

/** 原 yX：initialize 的单飞 promise（防并发重复初始化） */
let offPeakInitializeInFlight: Promise<void> | null = null;

/**
 * 原 bX（js 91368 / jsx 78945）：off-peak 闲时任务 store（zustand）。
 * 横幅可见性（grayConfig.enabled + newTaskBannerDismissed）与 3 张建议卡的
 * pendingCreateDraft 投递都在这里。
 */
export const useOffPeakTaskStore = create<OffPeakTaskStoreState>()((set, get) => ({
  tasks: [],
  loading: false,
  error: null,
  operationId: null,
  grayConfig: null,
  codingPlanSupport: null,
  takeNumberAvailability: null,
  takeNumberAvailabilityStatus: "idle",
  newTaskBannerDismissed: false,
  pendingCreateDraft: null,
  async initialize({ offPeakTaskService, codingPlanSubscriptionService }) {
    if (offPeakInitializeInFlight) return offPeakInitializeInFlight;
    const run = (async () => {
      set({
        loading: true,
        error: null,
        codingPlanSupport: null,
        takeNumberAvailability: null,
        takeNumberAvailabilityStatus: "loading",
      });
      try {
        let supportLoadFailed = false;
        const [grayConfig, tasks, codingPlanSupport] = await Promise.all([
          codingPlanSubscriptionService
            .getOffPeakClientConfig({ forceRefresh: true })
            .catch((error) => (logger.warn("[off-peak] gray config load failed", toErrorMessage(error)), null)),
          offPeakTaskService.list().catch((error) => (logger.warn("[off-peak] list failed", toErrorMessage(error)), [])),
          offPeakTaskService
            .getCodingPlanSupport()
            .catch((error) => ((supportLoadFailed = true), logger.warn("[off-peak] coding plan support load failed", toErrorMessage(error)), null)),
        ]);
        let takeNumberAvailability: OffPeakTakeNumberAvailability | null = null;
        let availabilityStatus: OffPeakTaskStoreState["takeNumberAvailabilityStatus"] = supportLoadFailed ? "error" : "idle";
        const codingPlanRelevant = grayConfig?.codingPlanActive === true || codingPlanSupport?.supported === true;
        if (grayConfig?.enabled && codingPlanRelevant) {
          try {
            takeNumberAvailability = await offPeakTaskService.getTakeNumberAvailability();
            availabilityStatus = "ready";
          } catch (error) {
            availabilityStatus = "error";
            logger.warn("[off-peak] availability load failed", toErrorMessage(error));
          }
        }
        set({
          grayConfig,
          tasks,
          codingPlanSupport,
          takeNumberAvailability,
          takeNumberAvailabilityStatus: availabilityStatus,
          loading: false,
        });
      } catch (error) {
        set({
          error: toErrorMessage(error),
          takeNumberAvailability: null,
          takeNumberAvailabilityStatus: "error",
          loading: false,
        });
      }
    })();
    offPeakInitializeInFlight = run;
    try {
      await run;
    } finally {
      if (offPeakInitializeInFlight === run) offPeakInitializeInFlight = null;
    }
  },
  async refresh(service) {
    try {
      set({ tasks: await service.list(), error: null });
    } catch (error) {
      set({ error: toErrorMessage(error) });
    }
  },
  async refreshCodingPlanSupport(service) {
    set({
      codingPlanSupport: null,
      takeNumberAvailability: null,
      takeNumberAvailabilityStatus: "loading",
    });
    try {
      const support = await service.getCodingPlanSupport();
      set({ codingPlanSupport: support });
      const grayConfig = get().grayConfig;
      const codingPlanRelevant = grayConfig?.codingPlanActive === true || support.supported === true;
      if (grayConfig?.enabled && codingPlanRelevant) {
        await get().refreshTakeNumberAvailability(service);
      } else {
        set({ takeNumberAvailabilityStatus: "idle" });
      }
    } catch (error) {
      set({ codingPlanSupport: null, takeNumberAvailabilityStatus: "error" });
      logger.warn("[off-peak] coding plan support refresh failed", toErrorMessage(error));
    }
  },
  async refreshTakeNumberAvailability(service) {
    set({ takeNumberAvailability: null, takeNumberAvailabilityStatus: "loading" });
    try {
      set({
        takeNumberAvailability: await service.getTakeNumberAvailability(),
        takeNumberAvailabilityStatus: "ready",
      });
    } catch (error) {
      set({ takeNumberAvailability: null, takeNumberAvailabilityStatus: "error" });
      logger.warn("[off-peak] availability refresh failed", toErrorMessage(error));
    }
  },
  async createTask(input, service) {
    set({ operationId: "offpeak:create", error: null });
    try {
      const result = await service.createTask(input);
      if (result.ok) {
        await Promise.all([get().refresh(service), get().refreshTakeNumberAvailability(service)]);
        return result;
      }
      set({
        error: result.errorCategory,
        takeNumberAvailability: null,
        takeNumberAvailabilityStatus: "error",
      });
      logger.warn("[off-peak] create failed", {
        errorCategory: result.errorCategory,
        errorCode: result.errorCode,
        failureStage: result.failureStage,
      });
      if (isQuota3103Error(result)) await get().refreshTakeNumberAvailability(service);
      return result;
    } catch (error) {
      const fallback: OffPeakCreateResult = {
        ok: false,
        failureStage: "ticket_request",
        errorCategory: "network",
        errorCode: "",
        providerName: "",
      };
      set({
        error: fallback.errorCategory,
        takeNumberAvailability: null,
        takeNumberAvailabilityStatus: "error",
      });
      logger.warn("[off-peak] create RPC transport failed", {
        errorType: error instanceof Error ? error.name : typeof error,
      });
      return fallback;
    } finally {
      set({ operationId: null });
    }
  },
  async updateTask(id, patch, service) {
    set({ operationId: `offpeak:update:${id}`, error: null });
    try {
      const updated = await service.updateTask(id, patch);
      await get().refresh(service);
      return updated !== null;
    } catch (error) {
      set({ error: toErrorMessage(error) });
      return false;
    } finally {
      set({ operationId: null });
    }
  },
  async pauseTask(id, service) {
    set({ operationId: `offpeak:pause:${id}`, error: null });
    try {
      await service.pauseTask(id);
      await get().refresh(service);
    } catch (error) {
      set({ error: toErrorMessage(error) });
    } finally {
      set({ operationId: null });
    }
  },
  async continueTask(id, service) {
    set({ operationId: `offpeak:continue:${id}`, error: null });
    try {
      await service.continueTask(id);
      await get().refresh(service);
    } catch (error) {
      set({ error: toErrorMessage(error) });
    } finally {
      set({ operationId: null });
    }
  },
  async cancelTask(id, service) {
    set({ operationId: `offpeak:cancel:${id}`, error: null });
    try {
      await service.cancelTask(id);
      await get().refresh(service);
    } catch (error) {
      set({ error: toErrorMessage(error) });
    } finally {
      set({ operationId: null });
    }
  },
  async deleteTask(id, service) {
    set({ operationId: `offpeak:delete:${id}`, error: null });
    try {
      await service.deleteTask(id);
      await get().refresh(service);
    } catch (error) {
      set({ error: toErrorMessage(error) });
    } finally {
      set({ operationId: null });
    }
  },
  async deleteHistory(id, service) {
    set({ operationId: `offpeak:delete-history:${id}`, error: null });
    try {
      await service.deleteHistory(id);
      await get().refresh(service);
    } catch (error) {
      set({ error: toErrorMessage(error) });
    } finally {
      set({ operationId: null });
    }
  },
  dismissNewTaskBanner() {
    set({ newTaskBannerDismissed: true });
  },
  setPendingCreateDraft(draft) {
    set({ pendingCreateDraft: draft });
  },
  consumePendingCreateDraft() {
    const draft = get().pendingCreateDraft;
    if (draft) set({ pendingCreateDraft: null });
    return draft;
  },
}));

/** 原 Oit：新任务横幅的 3 张建议卡模板（文案 key：offPeak.newTask.template.<id>.*） */
export const OFF_PEAK_HOME_TEMPLATES: Array<{ id: "standupGitSummary" | "ciFlakyReport" | "customize" }> = [
  { id: "standupGitSummary" },
  { id: "ciFlakyReport" },
  { id: "customize" },
];

export interface OffPeakNewTaskBannerProps {
  /** 打开自动化面板（R0 传入的 onOpenAutomations） */
  onOpenAutomations?: () => void;
}

/**
 * 原 kit（js 91591 / jsx 79222）：off-peak 新任务横幅。
 * 显示条件：grayConfig.enabled === true 且未被关闭（newTaskBannerDismissed）。
 * 结构：头部行（📢 megaphone 图标 + bannerText（悬停提示 bannerTipText）+ 关闭按钮）
 *       + 3 张模板建议卡（sm:grid-cols-3，moon 图标 + 标题 + 描述）。
 * 无任何 Coding Plan 时点卡 → 弹升级 toast；否则写 pendingCreateDraft 并打开自动化面板。
 */
export function OffPeakNewTaskBanner({ onOpenAutomations }: OffPeakNewTaskBannerProps) {
  const { intl } = useIntlContext();
  const { offPeakTaskService, codingPlanSubscriptionService } = useServices();
  const { settings } = useSettingsSnapshot();
  const { modelProviders, loading: providersLoading } = useModelProviders();
  const upgradeActions = useUpgradeActions();
  const grayConfig = useOffPeakTaskStore((s) => s.grayConfig);
  const bannerDismissed = useOffPeakTaskStore((s) => s.newTaskBannerDismissed);
  const initialize = useOffPeakTaskStore((s) => s.initialize);
  const refreshCodingPlanSupport = useOffPeakTaskStore((s) => s.refreshCodingPlanSupport);
  const dismissNewTaskBanner = useOffPeakTaskStore((s) => s.dismissNewTaskBanner);
  const setPendingCreateDraft = useOffPeakTaskStore((s) => s.setPendingCreateDraft);

  React.useEffect(() => {
    initialize({ offPeakTaskService, codingPlanSubscriptionService });
  }, [initialize, offPeakTaskService, codingPlanSubscriptionService]);

  const providerFamilyDomain = settings?.providerFamilyDomain;
  const selectedAuthMode = providerFamilyDomain ? settings?.modelProviderFamilyModes?.[providerFamilyDomain] : undefined;
  const selectedConnectionKey = providerFamilyDomain ? settings?.modelProviderFamilySelectedKeys?.[providerFamilyDomain] : undefined;
  const settingsReady = settings != null;
  const settingsSeenRef = React.useRef(false);

  // 设置首次就绪后，连接选择变化时刷新 Coding Plan 支持态
  React.useEffect(() => {
    if (settingsReady) {
      if (!settingsSeenRef.current) {
        settingsSeenRef.current = true;
        return;
      }
      refreshCodingPlanSupport(offPeakTaskService);
    }
  }, [settingsReady, offPeakTaskService, refreshCodingPlanSupport, selectedConnectionKey, selectedAuthMode, providerFamilyDomain]);

  if (grayConfig?.enabled !== true || bannerDismissed) return null;

  const lacksAnyCodingPlan =
    grayConfig.codingPlanActive === false || (grayConfig.codingPlanActive === undefined && !providersLoading && !hasCodingPlanProviderEntry(modelProviders));

  const showCodingPlanToast = () => {
    toast(intl.formatMessage({ id: "offPeak.create.codingPlanToast" }), {
      durationMs: 8000,
      position: "top-center",
      variant: "info",
      actionLabel: intl.formatMessage({ id: "settings.modelProvider.codingPlan.upgrade" }),
      onAction: () => {
        const providerId =
          settings?.providerFamilyDomain === "bigmodel" ? providerIds.bigmodelCodingPlan : providerIds.zaiCodingPlan;
        const upgradeLabel = intl.formatMessage({ id: "settings.modelProvider.codingPlan.upgrade" });
        upgradeActions?.openCodingPlanUpgrade?.({
          providerId,
          initialAudience: "personal",
          funnelContext: buildCodingPlanFunnelContext({
            providerId,
            eventText: upgradeLabel,
            entryPlanState: resolveEntryPlanState({ providers: modelProviders, loading: providersLoading }),
          }),
        });
      },
      dismissible: true,
      dismissLabel: intl.formatMessage({ id: "common.close" }),
    });
  };

  const handleTemplateClick = (template: (typeof OFF_PEAK_HOME_TEMPLATES)[number]) => {
    if (lacksAnyCodingPlan) {
      logger.debug("[off-peak] blocked home template without any Coding Plan", { templateId: template.id });
      showCodingPlanToast();
      return;
    }
    setPendingCreateDraft(
      template.id === "customize"
        ? { telemetrySource: { eventRegion: "app.session", templateId: template.id } }
        : {
            title: intl.formatMessage({ id: `offPeak.newTask.template.${template.id}.title` }),
            prompt: intl.formatMessage({ id: `offPeak.newTask.template.${template.id}.prompt` }),
            telemetrySource: { eventRegion: "app.session", templateId: template.id },
          },
    );
    onOpenAutomations?.();
  };

  return (
    <div className="mt-6 flex flex-col gap-3 @min-[820px]/conversation:-mx-[54px]">
      {/* 横幅头行：📢 + 文案（带 tip popover）+ 关闭 */}
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-1 text-foreground-subtle opacity-80">
          <span className="flex size-8 shrink-0 items-center justify-center" aria-hidden="true">
            <IconMegaphone className="size-4" strokeWidth={2} />
          </span>
          <Popover>
            <PopoverAnchor>
              <PopoverTrigger asChild>
                <span
                  tabIndex={0}
                  className="min-w-0 cursor-default rounded-sm text-ui-caption font-normal leading-snug focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-hover"
                >
                  {intl.formatMessage({ id: "offPeak.newTask.bannerText" })}
                </span>
              </PopoverTrigger>
            </PopoverAnchor>
            <PopoverContent side="top" sideOffset={6} className="max-w-none whitespace-nowrap">
              <span>{intl.formatMessage({ id: "offPeak.newTask.bannerTipText" })}</span>
            </PopoverContent>
          </Popover>
        </div>
        <button
          type="button"
          onClick={dismissNewTaskBanner}
          aria-label={intl.formatMessage({ id: "common.close" })}
          className="flex size-8 shrink-0 items-center justify-center rounded-md text-foreground-subtle opacity-80 hover:bg-hover hover:opacity-100"
        >
          <IconClose className="size-4" strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
      {/* 建议卡 3 张（spec §5：icon+title+body） */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {OFF_PEAK_HOME_TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => handleTemplateClick(template)}
            className="flex flex-col gap-2 rounded-2xl border border-card-border bg-background p-3 text-left transition-colors hover:bg-surface-hover"
          >
            <div className="flex items-center gap-1.5">
              <span className="flex size-5 shrink-0 items-center justify-center" aria-hidden="true">
                <IconMoon
                  aria-hidden="true"
                  className="size-4 text-foreground-subtle"
                  data-off-peak-homepage-template-icon="moon"
                  size={16}
                  strokeWidth={2}
                />
              </span>
              <span className="truncate text-ui-base leading-5 text-foreground">
                {intl.formatMessage({ id: `offPeak.newTask.template.${template.id}.title` })}
              </span>
            </div>
            <p className="text-wrap-phrase line-clamp-3 text-ui-caption font-normal leading-snug text-foreground-subtle">
              {intl.formatMessage({ id: `offPeak.newTask.template.${template.id}.description` })}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============================================================================
 * 3. 工作区选择行（原 mOt/hOt/gOt/_Ot/vOt/yOt/bOt/a4 + UTt/N2，
 *    js 123177,123199,128526–128776 / jsx 108386–108415）。
 *    Home contextHeader 的左件：🗀 名称 + ⌄ 菜单（最近项目搜索/打开文件夹/
 *    远程连接/不选项目）。由窗口壳 yJt 组装进 contextHeader（js 184540–184577），
 *    draft 态随 composer 卡顶部渲染。
 * ==========================================================================*/

/** 工作区标签页（窗口壳维护；原 Ti(e) 生成作用域 key） */
export interface WorkspaceTab {
  workspacePath: string;
  workspaceIdentity?: string | null;
  remoteSessionId?: string | null;
  remoteTarget?: RemoteTarget | null;
  workspacePurpose?: "project" | "conversation";
  label?: string;
}
interface RemoteTarget {
  kind: "ssh" | "wsl" | "docker" | "server";
  host?: string;
  port?: number;
  container?: string;
  sshConfigAlias?: string;
}
/** 工作区作用域 key（原 Ti，src-HCld2afU.js 导出） */
/** 路径末段名（原 Go，横切层 1928） */
/** 远程目标显示标签（原 XTt，TopBar 族已登记 remoteTargetDisplayLabel） */
declare function remoteTargetDisplayLabel(target: RemoteTarget): string;

/** 原 UTt：远程工作区入口开关（当前恒 true） */
export function useRemoteWorkspaceEnabled(): boolean {
  return true;
}

/** 原 N2：是否远程/带身份的工作区标签 */
export function isRemoteWorkspaceTab(tab: Partial<WorkspaceTab> | null | undefined): boolean {
  return !!(tab && (tab.remoteSessionId || tab.remoteTarget || tab.workspaceIdentity));
}

const HOME_DIR_PATH_REGEX = /^(\/Users\/[^/]+|\/home\/[^/]+|[A-Za-z]:\/Users\/[^/]+)(?:\/|$)/;
const HOME_DIR_EXACT_REGEX = /^(\/Users\/[^/]+|\/home\/[^/]+|[A-Za-z]:\/Users\/[^/]+)$/;

function normalizePathForDisplay(path: string): string {
  return path.replace(/\\/g, "/").replace(/\/+$/, "");
}

/** 原 mOt：路径若以家目录开头，返回家目录前缀（否则 null） */
export function resolveHomePathPrefix(path: string): string | null {
  return normalizePathForDisplay(path).match(HOME_DIR_PATH_REGEX)?.[1] ?? null;
}

/** 原 hOt：家目录本身显示为给定标签，否则显示末段名 */
export function homeAwareDisplayName(path: string, homeLabel: string): string {
  const normalized = normalizePathForDisplay(path);
  return HOME_DIR_EXACT_REGEX.test(normalized) ? homeLabel : pathBasename(path);
}

/** 原 gOt：菜单项标签（家目录本身 → 末段名，其余 → homeAwareDisplayName） */
export function workspaceMenuLabel(path: string, homeLabel: string): string {
  const normalized = normalizePathForDisplay(path);
  return HOME_DIR_EXACT_REGEX.test(normalized) ? pathBasename(path) : homeAwareDisplayName(path, homeLabel);
}

/** 原 _Ot：触发器（chip）标签 */
export function workspaceTriggerLabel(path: string, homeLabel: string): string {
  const normalized = normalizePathForDisplay(path);
  return HOME_DIR_EXACT_REGEX.test(normalized) ? pathBasename(path) : homeAwareDisplayName(path, homeLabel);
}

/** 原 vOt：两个标签是否同一工作区（按作用域 key） */
export function isSameWorkspaceTab(
  a: Pick<WorkspaceTab, "workspacePath" | "workspaceIdentity" | "remoteSessionId">,
  b: Pick<WorkspaceTab, "workspacePath" | "workspaceIdentity" | "remoteSessionId">,
): boolean {
  const scopeOf = (tab: typeof a) => ({
    workspacePath: tab.workspacePath,
    workspaceIdentity: tab.workspaceIdentity ?? undefined,
    remoteSessionId: tab.remoteSessionId ?? undefined,
  });
  return workspaceScopeKey(scopeOf(a)) === workspaceScopeKey(scopeOf(b));
}

/** 原 yOt：远程标签的搜索串（远程目标标签 + 身份） */
export function remoteTabSearchHaystack(tab: WorkspaceTab): string {
  return tab.remoteTarget
    ? [remoteTargetDisplayLabel(tab.remoteTarget), tab.workspaceIdentity].filter(Boolean).join(" ")
    : (tab.workspaceIdentity ?? "");
}

/** 原 bOt：菜单用工作区过滤（排除未连接的会话远程项、按搜索词匹配、前 5 条） */
export function filterWorkspaceTabsForMenu({
  workspaceTabs,
  homeWorkspaceLabel,
  searchQuery,
}: {
  workspaceTabs: WorkspaceTab[];
  homeWorkspaceLabel: string;
  searchQuery: string;
}): WorkspaceTab[] {
  const query = searchQuery.trim().toLowerCase();
  return workspaceTabs
    .filter((tab) => !(isRemoteWorkspaceTab(tab) && !tab.remoteSessionId))
    .filter((tab) =>
      query
        ? [workspaceMenuLabel(tab.workspacePath, homeWorkspaceLabel), tab.label, tab.workspacePath, remoteTabSearchHaystack(tab)]
            .join(" ")
            .toLowerCase()
            .includes(query)
        : true,
    )
    .slice(0, 5);
}

/** 原 pOt = fOt：远程连接向导对话框（F10 RemoteFamily，js 128093；接口保留） */

export interface WorkspaceSelectionRowProps {
  workspacePath: string;
  workspaceIdentity?: string | null;
  isWindowsDesktop?: boolean;
  compactForRemoteControl?: boolean;
  workspaceTabs: WorkspaceTab[];
  allowConversationWorkspaceSelection?: boolean;
  allowConversationWorkspaceDetach?: boolean;
  onSelectWorkspace: (tab: WorkspaceTab) => void;
  onSelectConversationWorkspace: () => void;
  onOpenFolder: () => void;
  allowOpenWorkspace?: boolean;
  allowRemoteWorkspace?: boolean;
  remoteWorkspaceSessions?: RemoteWorkspaceSessionLike[];
  /* A0-CLEANUP4：三回调收 RemoteWizardDialog 属主面具型（bundle a4 js 128776–128786 纯透传 pOt） */
  onConnectRemote: (target: RemoteTarget, requestId: string) => Promise<string | null>;
  onSelectRemoteProject: (sessionId: string, path: string, localWorkspacePath?: string) => Promise<void>;
  onCancelRemoteProject: (sessionId: string) => Promise<void>;
  containerClassName?: string;
  triggerClassName?: string;
  triggerIndicator?: React.ReactNode;
}

/**
 * 原 a4（js 128568 / jsx 108415）：工作区选择行（spec §5 workspace 行的左半）。
 * 胶囊触发器 = [悬停显形的分离按钮（会话工作区才可分离）] + [图标+名称+⌄]；
 * 弹出菜单 = 搜索框 + 最近项目（前 5，勾选态）+ [打开文件夹] + [远程连接] + [不选项目]。
 * 图标语义：远程=cloud、家目录=house、普通=folder。
 */
export function WorkspaceSelectionRow({
  workspacePath,
  workspaceIdentity,
  isWindowsDesktop = false,
  compactForRemoteControl = false,
  workspaceTabs,
  allowConversationWorkspaceSelection = true,
  allowConversationWorkspaceDetach = allowConversationWorkspaceSelection,
  onSelectWorkspace,
  onSelectConversationWorkspace,
  onOpenFolder,
  allowOpenWorkspace = true,
  allowRemoteWorkspace = true,
  remoteWorkspaceSessions = [],
  onConnectRemote,
  onSelectRemoteProject,
  onCancelRemoteProject,
  containerClassName,
  triggerClassName,
  triggerIndicator,
}: WorkspaceSelectionRowProps) {
  const { intl } = useIntlContext();
  const [remoteDialogOpen, setRemoteDialogOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const remoteEnabled = useRemoteWorkspaceEnabled();
  const allowRemote = allowRemoteWorkspace && remoteEnabled;
  const activeTab = workspaceTabs.find((tab) => isSameWorkspaceTab(tab, { workspacePath, workspaceIdentity })) ?? null;
  const isConversationWorkspace = activeTab?.workspacePurpose === "conversation";
  const canDetach = allowConversationWorkspaceSelection && allowConversationWorkspaceDetach && !isConversationWorkspace;
  const remoteDialogLocalPath =
    isConversationWorkspace || activeTab?.remoteSessionId || activeTab?.remoteTarget || activeTab?.workspaceIdentity
      ? undefined
      : workspacePath;
  const homePrefix = resolveHomePathPrefix(workspacePath);
  const homeLabel = intl.formatMessage({ id: "chat.empty.home" });
  const remoteTab = isRemoteWorkspaceTab(activeTab ?? {});
  const menuTabs = React.useMemo(
    () =>
      filterWorkspaceTabsForMenu({
        workspaceTabs: workspaceTabs.filter((tab) => tab.workspacePurpose !== "conversation"),
        homeWorkspaceLabel: homeLabel,
        searchQuery,
      }),
    [homeLabel, searchQuery, workspaceTabs],
  );
  const triggerLabel = isConversationWorkspace
    ? intl.formatMessage({ id: "chat.empty.selectProject" })
    : workspaceTriggerLabel(workspacePath, homeLabel);
  const TriggerIcon = remoteTab ? IconCloud : homePrefix === workspacePath ? IconHouse : IconFolder;

  return (
    <DropdownMenu>
      <div
        className={cn(
          "group/workspace-chip relative flex min-w-0 items-center rounded-full hover:bg-surface-hover focus-within:bg-surface-hover",
          containerClassName,
        ) as string}
      >
        {/* 分离按钮：仅会话工作区可分离，悬停/聚焦显形 */}
        {canDetach ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="pointer-events-none absolute left-1.5 z-10 rounded-full text-foreground-subtle opacity-0 transition-opacity group-hover/workspace-chip:pointer-events-auto group-hover/workspace-chip:opacity-100 group-focus-within/workspace-chip:pointer-events-auto group-focus-within/workspace-chip:opacity-100"
            aria-label={intl.formatMessage({ id: "chat.empty.detachProject" })}
            data-testid={PROJECT_DETACH_TESTID}
            onClick={(event: React.MouseEvent) => {
              event.stopPropagation();
              onSelectConversationWorkspace();
            }}
          >
            <IconClose className="size-3.5" />
          </Button>
        ) : null}
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="default"
            className={cn(
              "min-w-0 rounded-full bg-transparent text-ui-base/relaxed hover:bg-transparent",
              compactForRemoteControl ? "max-w-44 pl-3 pr-2" : "max-w-[15rem] pl-3 pr-2",
              triggerClassName,
            ) as string}
            aria-label={intl.formatMessage({ id: "chat.empty.workspaceMenu" })}
            data-testid={WORKSPACE_TRIGGER_TESTID}
          >
            <TriggerIcon
              className={cn(
                "size-4 text-foreground-subtle transition-opacity",
                canDetach && "group-hover/workspace-chip:opacity-0 group-focus-within/workspace-chip:opacity-0",
              ) as string}
            />
            <span className="block max-w-full truncate">{triggerLabel}</span>
            {triggerIndicator ?? <IconChevronDown className="size-3.5 text-foreground-subtle" />}
          </Button>
        </DropdownMenuTrigger>
      </div>
      <DropdownMenuContent align="start" side="top" className="w-72 p-0">
        {/* 最近项目搜索框 */}
        <div
          data-slot="command-input-wrapper"
          className="p-1 border-b border-border"
          onKeyDown={(event) => event.stopPropagation()}
        >
          <InputGroup className="h-8 border-0 !bg-transparent hover:border-input-border-hover ">
            <input
              data-slot="command-input"
              value={searchQuery}
              placeholder={intl.formatMessage({ id: "chat.empty.workspaceSearchPlaceholder" })}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full text-ui-base/relaxed text-foreground outline-hidden placeholder:text-foreground-subtlest disabled:cursor-not-allowed disabled:opacity-50"
            />
            <InputGroupAddon>
              <IconSearch className="size-4 shrink-0 text-foreground-subtlest" />
            </InputGroupAddon>
          </InputGroup>
        </div>
        <div className="p-1">
          {menuTabs.map((tab, index) => {
            const itemLabel = workspaceMenuLabel(tab.workspacePath, homeLabel);
            const ItemIcon = isRemoteWorkspaceTab(tab) ? IconCloud : resolveHomePathPrefix(tab.workspacePath) === tab.workspacePath ? IconHouse : IconFolder;
            return (
              <DropdownMenuCheckboxItem
                key={`${tab.workspaceIdentity ?? tab.remoteSessionId ?? "local"}:${tab.workspacePath}:${index}`}
                checked={isSameWorkspaceTab(tab, { workspacePath, workspaceIdentity })}
                onSelect={() => {
                  onSelectWorkspace(tab);
                }}
              >
                <ItemIcon className="size-4 text-foreground-subtle" />
                <span className="min-w-0 flex-1 truncate">{itemLabel}</span>
              </DropdownMenuCheckboxItem>
            );
          })}
          {menuTabs.length === 0 ? (
            <div className="px-2 py-2 text-ui-base text-foreground-subtlest">
              {intl.formatMessage({ id: "chat.empty.workspaceSearchEmpty" })}
            </div>
          ) : null}
          <DropdownMenuSeparator />
          {allowOpenWorkspace ? (
            <DropdownMenuItem onSelect={onOpenFolder}>
              <IconFolderPlus className="size-4 text-foreground-subtle" />
              <span>{intl.formatMessage({ id: "workspace.openFolder" })}</span>
            </DropdownMenuItem>
          ) : null}
          {allowRemote ? (
            <DropdownMenuItem
              data-testid={REMOTE_CONNECTION_TESTID}
              onSelect={() => {
                logger.info(`[ChatEmptyWorkspacePreviewMenu] open remote dialog from workspace menu workspace=${workspacePath}`);
                setRemoteDialogOpen(true);
              }}
            >
              <IconCloud className="size-4 text-foreground-subtle" />
              <span>{intl.formatMessage({ id: "remote.trigger" })}</span>
            </DropdownMenuItem>
          ) : null}
          {allowConversationWorkspaceSelection ? (
            <DropdownMenuCheckboxItem
              data-testid={WORK_OUTSIDE_PROJECT_TESTID}
              checked={isConversationWorkspace}
              onSelect={() => void onSelectConversationWorkspace()}
            >
              <IconMessageCircle className="size-4 text-foreground-subtle" />
              <span>{intl.formatMessage({ id: "chat.empty.workOutsideProject" })}</span>
            </DropdownMenuCheckboxItem>
          ) : null}
        </div>
      </DropdownMenuContent>
      {allowRemote ? (
        <RemoteWizardDialog
          onConnect={onConnectRemote}
          onSelectProject={onSelectRemoteProject}
          onCancelSession={onCancelRemoteProject}
          localWorkspacePath={remoteDialogLocalPath}
          isWindowsDesktop={isWindowsDesktop}
          remoteWorkspaceSessions={remoteWorkspaceSessions}
          open={remoteDialogOpen}
          onOpenChange={setRemoteDialogOpen}
          hideTriggerWhenClosed
        />
      ) : null}
    </DropdownMenu>
  );
}

/* ============================================================================
 * 4. 提及菜单（@#>）可见层（原 mC/Pqe/Fqe/Iqe/tV/SV/_Je/vJe/yJe，
 *    js 36348,64024–64029,64061–64064,64594–64865）。
 *    接线层（Lexical 编辑器内触发检测/键盘导航/选择回填）在 F08：
 *    KJe MentionSelector（js 65605，@→files/plugins、#→sessions、$→skills）、
 *    SJe SlashPanel（js 65002，/→commands/skills/subagents）。
 * ==========================================================================*/

/** 原 mC：提及域 → 触发符（spec §5 所引：commands `>`、conversations `#`、files `@`） */
export function mentionTriggerChar(scope: "commands" | "conversations" | "files" | string): string {
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

/** 原 Pqe：光标前触发符检测（行内空白后的 / @ $ # ¥ ￥） */
export const MENTION_TRIGGER_REGEX = /(^|\s)([/@$#¥￥])([^\s/@$#¥￥]*)$/;
/** 原 Fqe：token 前缀（补全用） */
export const MENTION_TOKEN_PREFIX_REGEX = /^[^\s/@$#¥￥]*/;
/** 原 Iqe：人民币符号归一为 $（技能触发符） */
export function normalizeCnyTrigger(trigger: string): string {
  return trigger === "¥" || trigger === "￥" ? "$" : trigger;
}
/** 原 tV：从光标前文本解析 {trigger, query} */
export function parseMentionTrigger(textBeforeCursor: string): { trigger: string; query: string } | null {
  const match = MENTION_TRIGGER_REGEX.exec(textBeforeCursor);
  return match ? { trigger: normalizeCnyTrigger(match[2] ?? ""), query: match[3] ?? "" } : null;
}

/* --- SuggestionPanel 的内部助手（原 _V/vV/yV/bV/xV/pJe/mJe/hJe/gJe） --- */

const PANEL_MASK_FADE_PX = 24; // _V
const PANEL_SCROLL_EDGE_EPSILON = 1; // vV
const PANEL_SCROLL_EDGE_NONE = { showTop: false, showBottom: false }; // yV

function resolvePanelScrollEdges({
  clientHeight,
  scrollHeight,
  scrollTop,
}: {
  clientHeight: number;
  scrollHeight: number;
  scrollTop: number;
}): { showTop: boolean; showBottom: boolean } {
  const maxScrollTop = Math.max(0, scrollHeight - clientHeight);
  if (maxScrollTop <= PANEL_SCROLL_EDGE_EPSILON) return PANEL_SCROLL_EDGE_NONE;
  return { showTop: scrollTop > PANEL_SCROLL_EDGE_EPSILON, showBottom: scrollTop < maxScrollTop - PANEL_SCROLL_EDGE_EPSILON };
}

/** 原 xV：上下渐隐遮罩样式（滚动边缘提示） */
function panelEdgeMaskStyle({ showBottom, showTop }: { showTop: boolean; showBottom: boolean }): React.CSSProperties | undefined {
  if (!showTop && !showBottom) return undefined;
  const gradient = `linear-gradient(to bottom, ${showTop ? `transparent 0px, black ${PANEL_MASK_FADE_PX}px` : `black 0px, black ${PANEL_MASK_FADE_PX}px`}, ${showBottom ? `black calc(100% - ${PANEL_MASK_FADE_PX}px), transparent 100%` : `black calc(100% - ${PANEL_MASK_FADE_PX}px), black 100%`})`;
  return {
    WebkitMaskImage: gradient,
    maskImage: gradient,
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
  };
}

const OPTION_ROW_HEIGHT = 34; // pJe
const STATUS_ROW_HEIGHT = 40; // mJe
const SECTION_HEADER_ROW_HEIGHT = 28; // hJe

export interface SuggestionOption {
  id: string;
  label: string;
  description?: string;
  meta?: string;
  disabled?: boolean;
  disabledReason?: string;
  content?: React.ReactNode;
  [key: string]: unknown;
}
export interface SuggestionSection {
  id: string;
  title: string;
  options: SuggestionOption[];
  loading?: boolean;
  loadingText?: string;
  emptyText: string;
  errorText?: string | null;
}
type SuggestionRow =
  | { kind: "section_header"; sectionId: string; title: string }
  | { kind: "status"; sectionId: string; content: "loading" | "error" | "empty"; text: string }
  | { kind: "option"; sectionId: string; option: SuggestionOption; flatOptionIndex: number };

/** 原 gJe：分段 → 扁平行（多段才出段头；error > loading > empty > options） */
export function flattenSuggestionRows(sections: SuggestionSection[]): SuggestionRow[] {
  const rows: SuggestionRow[] = [];
  let flatOptionIndex = 0;
  const multipleSections = sections.length > 1;
  for (const section of sections) {
    if (multipleSections && section.title.trim().length > 0) {
      rows.push({ kind: "section_header", sectionId: section.id, title: section.title });
    }
    if (section.errorText) {
      rows.push({ kind: "status", sectionId: section.id, content: "error", text: section.errorText });
    } else if (section.loading) {
      rows.push({
        kind: "status",
        sectionId: section.id,
        content: "loading",
        text: section.loadingText ?? section.emptyText,
      });
    } else if (section.options.length === 0) {
      rows.push({ kind: "status", sectionId: section.id, content: "empty", text: section.emptyText });
    } else {
      for (const option of section.options) {
        rows.push({ kind: "option", sectionId: section.id, option, flatOptionIndex });
        flatOptionIndex += 1;
      }
    }
  }
  return rows;
}

export interface SuggestionPanelProps {
  title: string;
  description?: string;
  sections: SuggestionSection[];
  emptyText: string;
  selectedIndex: number;
  hasActiveQuery: boolean;
  onSelect: (flatOptionIndex: number) => void;
  /** 触发符（@ # $ > /），写入 data-trigger */
  trigger: string;
}

/**
 * 原 SV（js 64639 / jsx 57678）：提及/斜杠建议面板。
 * `rounded-2xl border bg-menu` 浮层，@tanstack/virtual 虚拟滚动（行高 34/28/40），
 * 选中项自动 scrollToIndex，滚动边缘渐隐遮罩。
 * testid：prompt-suggestion-panel（段头 -section / 选项 -option / 状态 -status 派生）。
 */
export function SuggestionPanel({
  title,
  description,
  sections,
  emptyText,
  selectedIndex,
  hasActiveQuery,
  onSelect,
  trigger,
}: SuggestionPanelProps) {
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const [scrollEdges, setScrollEdges] = React.useState(PANEL_SCROLL_EDGE_NONE);
  const rows = React.useMemo(() => flattenSuggestionRows(sections), [sections]);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: (index) =>
      rows[index]?.kind === "option" ? OPTION_ROW_HEIGHT : rows[index]?.kind === "section_header" ? SECTION_HEADER_ROW_HEIGHT : STATUS_ROW_HEIGHT,
    overscan: 8,
  });
  const totalHeight = virtualizer.getTotalSize();
  const recomputeScrollEdges = React.useCallback(() => {
    const element = scrollRef.current;
    if (!element) {
      setScrollEdges(PANEL_SCROLL_EDGE_NONE);
      return;
    }
    const next = resolvePanelScrollEdges({
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
      scrollTop: element.scrollTop,
    });
    setScrollEdges((prev) => (prev.showTop === next.showTop && prev.showBottom === next.showBottom ? prev : next));
  }, []);
  const maskStyle = React.useMemo(() => panelEdgeMaskStyle(scrollEdges), [scrollEdges]);
  const selectedRowIndex = React.useMemo(
    () => rows.findIndex((row) => row.kind === "option" && row.flatOptionIndex === selectedIndex),
    [rows, selectedIndex],
  );

  // 选中项滚动进视野
  React.useEffect(() => {
    if (selectedRowIndex >= 0) virtualizer.scrollToIndex(selectedRowIndex, { align: "auto" });
  }, [selectedRowIndex, virtualizer]);

  // 滚动/尺寸变化时更新边缘遮罩
  React.useEffect(() => {
    const element = scrollRef.current;
    if (!element) {
      setScrollEdges(PANEL_SCROLL_EDGE_NONE);
      return;
    }
    let rafId: number | null = null;
    const scheduleRecompute = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          rafId = null;
          recomputeScrollEdges();
        });
      }
    };
    recomputeScrollEdges();
    element.addEventListener("scroll", scheduleRecompute, { passive: true });
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver < "u") {
      resizeObserver = new ResizeObserver(scheduleRecompute);
      resizeObserver.observe(element);
      const firstChild = element.firstElementChild;
      if (firstChild) resizeObserver.observe(firstChild);
    } else {
      window.addEventListener("resize", scheduleRecompute);
    }
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      element.removeEventListener("scroll", scheduleRecompute);
      resizeObserver?.disconnect();
      if (typeof ResizeObserver > "u") window.removeEventListener("resize", scheduleRecompute);
    };
  }, [totalHeight, recomputeScrollEdges, rows.length]);

  return (
    <div
      className="mb-1 overflow-hidden rounded-2xl border border-border bg-menu shadow-xs"
      data-testid="prompt-suggestion-panel"
      data-trigger={trigger}
    >
      {rows.length > 0 ? (
        <div
          ref={scrollRef}
          className="max-h-56 overflow-y-auto px-1 py-0.75"
          role="listbox"
          aria-label={title}
          onMouseLeave={() => setHoveredIndex(null)}
          style={maskStyle}
        >
          <div style={{ height: `${totalHeight}px`, width: "100%", position: "relative" }}>
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const row = rows[virtualItem.index];
              return row ? (
                <div
                  key={virtualItem.key}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  {row.kind === "status" ? (
                    <SuggestionStatusRow row={row} />
                  ) : row.kind === "section_header" ? (
                    <SuggestionSectionHeaderRow row={row} />
                  ) : (
                    <SuggestionOptionRow
                      row={row}
                      isSelected={row.flatOptionIndex === selectedIndex}
                      isHovered={row.flatOptionIndex === hoveredIndex}
                      onSelect={onSelect}
                      onHover={setHoveredIndex}
                    />
                  )}
                </div>
              ) : null;
            })}
          </div>
        </div>
      ) : hasActiveQuery && emptyText ? (
        <div className="flex items-center justify-between px-4 py-3 text-ui-base text-foreground-subtlest">{emptyText}</div>
      ) : null}
      {!hasActiveQuery && description ? (
        <div className="flex items-center gap-2 px-4 py-3 text-ui-base text-foreground-subtle">
          <IconInfo className="size-4 shrink-0 text-foreground" />
          <span>{description}</span>
        </div>
      ) : null}
    </div>
  );
}

/** 原 _Je：段头行 */
export function SuggestionSectionHeaderRow({ row }: { row: Extract<SuggestionRow, { kind: "section_header" }> }) {
  return (
    <div
      className="px-3 pt-2 pb-1 text-ui-xs font-semibold uppercase tracking-wide text-foreground-subtlest"
      data-testid={testidOf("prompt-suggestion-section", row.sectionId)}
      data-section-id={row.sectionId}
    >
      {row.title}
    </div>
  );
}

/** 原 vJe：状态行（loading 转圈 / error 红底 / empty 灰字） */
export function SuggestionStatusRow({ row }: { row: Extract<SuggestionRow, { kind: "status" }> }) {
  if (row.content === "loading") {
    return (
      <div
        className="flex items-center gap-2 rounded-xl px-5 py-2 text-ui-base text-foreground-subtle"
        data-testid={testidOf("prompt-suggestion-status", row.sectionId)}
        data-section-id={row.sectionId}
        data-status="loading"
      >
        <IconLoader className="size-3.5 shrink-0 animate-spin" />
        <span>{row.text}</span>
      </div>
    );
  }
  if (row.content === "error") {
    return (
      <div
        className="rounded-xl bg-destructive px-5 py-2 text-ui-base text-destructive-foreground"
        data-testid={testidOf("prompt-suggestion-status", row.sectionId)}
        data-section-id={row.sectionId}
        data-status="error"
      >
        {row.text}
      </div>
    );
  }
  return (
    <div
      className="rounded-xl px-5 py-2 text-ui-base text-foreground-subtlest"
      data-testid={testidOf("prompt-suggestion-status", row.sectionId)}
      data-section-id={row.sectionId}
      data-status="empty"
    >
      {row.text}
    </div>
  );
}

/** 原 yJe：选项行（选中 bg-selected / 悬停 bg-hover；mousedown 防焦点丢失） */
export function SuggestionOptionRow({
  row,
  isSelected,
  isHovered,
  onSelect,
  onHover,
}: {
  row: Extract<SuggestionRow, { kind: "option" }>;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: (flatOptionIndex: number) => void;
  onHover: (flatOptionIndex: number | null) => void;
}) {
  const { option, flatOptionIndex } = row;
  const disabled = option.disabled === true;
  return (
    <div className="py-px w-full">
      <button
        type="button"
        role="option"
        aria-selected={isSelected}
        aria-disabled={disabled}
        disabled={disabled}
        data-testid={testidOf("prompt-suggestion-option", option.id)}
        data-section-id={row.sectionId}
        data-option-id={option.id}
        data-option-index={flatOptionIndex}
        data-selected={isSelected ? "true" : "false"}
        data-disabled={disabled ? "true" : "false"}
        className={cn(
          "flex h-8 w-full items-center gap-3 rounded-xl px-3 text-left transition-colors",
          disabled ? "cursor-not-allowed opacity-50" : isSelected ? "bg-selected" : isHovered ? "bg-hover" : "hover:bg-hover",
        ) as string}
        onMouseDown={(event) => {
          event.preventDefault();
          if (!disabled) onSelect(flatOptionIndex);
        }}
        onMouseEnter={() => onHover(disabled ? null : flatOptionIndex)}
      >
        {option.content ? (
          <>{option.content}</>
        ) : (
          <span className="min-w-0 flex-1">
            <span className="flex items-baseline gap-2">
              <span className="truncate text-ui-base font-medium text-foreground">{option.label}</span>
              {option.meta ? (
                <span className="shrink-0 text-ui-xs text-foreground-subtlest">{option.meta}</span>
              ) : null}
            </span>
            <span className="mt-1 block truncate text-ui-xs text-foreground-subtlest">
              {disabled && option.disabledReason ? option.disabledReason : option.description}
            </span>
          </span>
        )}
      </button>
    </div>
  );
}

/* ============================================================================
 * 5. composer 卡（draft 态根组件）：原 hit / git = memo(hit)，
 *    js 90180–91174 / jsx 78144–78829。
 *    这是「Home 的 composer 卡」本体：R0 在 draftMode 以 centered 挂载它；
 *    contextHeader（工作区行+分支 chip）渲染在输入面顶部，双层圆角卡片。
 *    同一组件在会话态（非 draft）作为消息列表底部 composer。
 * ==========================================================================*/

/* --- 5.0 hit 依赖的 Composer 族符号（F08，js 行已登记；此处接口保留） --- */

/** 附件（原 je.attachments 项；mXe 钩子产物） */
export interface ComposerAttachment {
  id: string;
  filename: string;
  localPath?: string | null;
  mimeType: string;
  objectUrl?: string | null;
  sourceKind?: "clipboard-text" | string;
  uploadStatus: "pending" | "uploading" | "ready" | "failed";
  uploadProgress: number;
  uploadError?: string | null;
  localZeroCopy?: boolean;
  showComplete?: boolean;
  /** 剪贴板文本附件的行数（描述文案用） */
  lineCount?: number;
  [key: string]: unknown;
}
/** composer 输入 API（Lexical 句柄，原 Ce = inputApiRef） */
export interface ComposerInputApi {
  focus(): void;
  clear(): void;
  setText(text: string): void;
  getMarkdown(): string;
  getEditorState(): { toJSON(): unknown } | null;
  setEditorStateJson(json: string): void;
  setMention?(mention: ComposerMentionPayload, restText: string): void;
}
export interface ComposerMentionPayload {
  markdown: string;
  [key: string]: unknown;
}
export interface ComposerDraftSnapshot {
  text: string;
  editorStateJson?: string;
}
/** 草稿持久化（原 $Ye 前缀 zcode-v4-composer-drafts:v1:，js 67468–67545） */
declare function saveComposerDraft(workspacePath: string, workspaceIdentity: string | null | undefined, scopeId: string, draft: ComposerDraftSnapshot): void;
declare function loadComposerDraft(workspacePath: string, workspaceIdentity: string | null | undefined, scopeId: string): ComposerDraftSnapshot | null;
declare function clearComposerDraft(workspacePath: string, workspaceIdentity: string | null | undefined, scopeId: string): void;
/** 跨工作区切换时草稿搬运标记（原 iXe/rXe，js 67540–67556） */
declare function consumeDraftCarryOver(args: {
  sourceWorkspacePath: string;
  sourceWorkspaceIdentity?: string | null;
  targetWorkspacePath: string;
  targetWorkspaceIdentity?: string | null;
}): boolean;
/** 输入历史（原 sH/cH/JJe，js 67451–67463,66064；localStorage，最多 30 条） */
declare function readPromptHistory(workspacePath: string): string[];
declare function writePromptHistory(workspacePath: string, history: string[]): void;
declare function appendPromptHistoryEntry(history: string[], text: string, limit?: number): string[];
/** 自动聚焦策略（原 lH，js 67465：skip/defer/focus-now） */
declare function resolveAutoFocusPolicy(policy: { autoFocusEnabled: boolean; disabled: boolean; isMobileViewport: boolean }): "skip" | "defer" | "focus-now";
/** 移动端文本输入视口（原 VV/QJe/$Je，js 66101–66110） */
declare function useMobileTextInputViewport(): boolean;
/** 提交快捷键/回车策略（原 eYe/tYe/nYe，js 66111–66118） */
function resolveEnterSubmits({ isMobileTextInputViewport, preferEnterNewline }: { isMobileTextInputViewport: boolean; preferEnterNewline: boolean }): boolean {
  return !(preferEnterNewline && isMobileTextInputViewport);
}
function resolveSubmitShortcut({ enterSubmits }: { enterSubmits: boolean }): string | undefined {
  return enterSubmits ? "Enter" : undefined;
}
function shouldAvoidIosInputFocusZoom({ isMobileTextInputViewport, isWebRemoteControl }: { isMobileTextInputViewport: boolean; isWebRemoteControl: boolean }): boolean {
  return isWebRemoteControl && isMobileTextInputViewport;
}
/** 是否图片附件（原 nH，js 67377） */
function isImageAttachment(attachment: ComposerAttachment): boolean {
  return attachment.mimeType.startsWith("image/");
}

/** 提及/引用/上下文钩子群（F08，js 行登记） */
interface WebContextItem { id: string; [key: string]: unknown }
interface PptxReferenceItem { id: string; [key: string]: unknown }
interface ConversationSelectionItem { id: string; [key: string]: unknown }
/** 代码评论条目统一采用 GitReview 导出的 CodeCommentAttachment（原 DXe 族类型） */
type CodeCommentItem = CodeCommentAttachment;
declare function useWhiteboardAttachmentScope(args: {
  workspacePath: string;
  workspaceIdentity?: string | null;
  remoteSessionId?: string | null;
  scopeId: string;
  attachmentSessionId: string | null;
  attachmentPut?: unknown;
  onRuntimeRestart?: () => void;
  disabled: boolean;
}): {
  attachments: ComposerAttachment[];
  hasAttachments: boolean;
  hasUnreadyAttachments: boolean;
  attachmentError: string | null;
  attachmentInputRef: React.RefObject<HTMLInputElement>;
  handleAttachmentInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  openAttachmentPicker: () => void;
  removeAttachment(id: string): void;
  retryAttachment(id: string): void;
  prepareForSend(): Promise<unknown[] | null>;
  adoptSentAttachments(): Promise<void>;
  clearAttachments(): void;
  restoreSessionOwnedAttachments(attachments: ComposerAttachment[]): boolean;
  handleWhiteboardMentionSelected: (mention: unknown) => void;
  handlePaste: (event: ClipboardEvent) => void; // A0-CLEANUP2 item 10：对齐 ComposerInput onPaste 的 DOM ClipboardEvent（PasteCapturePlugin 原生监听）
  handleDragOverComposer(event: React.DragEvent): void;
  handleDragLeaveComposer(event: React.DragEvent): void;
  handleDropComposer(event: React.DragEvent): void;
  composerDragKind: "attachment" | "workspace" | null;
  isDraggingOverComposer: boolean;
};
declare function useFileDragDetection(opts: { enableExternalFileDrop: boolean; enableWorkspaceFileDrop: boolean }): {
  externalFileDragging: boolean;
  workspaceFileDragging: boolean;
};
declare function parseAddToChatPayload(dataTransfer: DataTransfer): AddToChatPayload | null;
interface AddToChatPayload { [key: string]: unknown }
declare function insertAddToChatPayload(args: {
  inputApiRef: React.RefObject<ComposerInputApi | null>;
  currentMarkdown: string;
  payload: AddToChatPayload;
  workspacePath: string;
  workspaceIdentity?: string | null;
  onTextChange: (text: string) => void;
}): void;
declare const ADD_TO_CHAT_EVENT_NAME: string; // 原 Aj = `zcode:add-workspace-file-to-chat`（js 52163）
declare function useWebContexts(args: {
  workspacePath: string;
  workspaceIdentity?: string | null;
  listenAddToChatEvents: boolean;
  scopeId: string;
}): { contexts: WebContextItem[]; hasContexts: boolean; removeContext(id: string): void; clearContexts(): void };
declare function usePptxReferences(args: {
  workspacePath: string;
  workspaceIdentity?: string | null;
  remoteSessionId?: string | null;
  listenAddToChatEvents: boolean;
  scopeId: string;
}): { references: PptxReferenceItem[]; hasReferences: boolean; removeReference(id: string): void; clearReferences(): void };
declare function useCodeCommentOpener(args: {
  workspacePath: string;
  workspaceIdentity?: string | null;
  remoteSessionId?: string | null;
  onOpenCodeViewer?: (args: unknown) => void;
}): ((comment: unknown) => void) | undefined;
declare function useConversationSelections(args: { sessionId: string | null; workspaceKey: string }): {
  references: ConversationSelectionItem[];
  limitReason: string | null;
  removeReference(id: string): void;
  clearReferences(): void;
};
declare function broadcastContextRemoved(item: CodeCommentItem, broadcastService?: { postMessage?(payload: unknown): void }): void;

/** 上下文 → 外发消息装配（原 GXe/GH，js 68785/68777） */
declare function buildOutgoingMessage(
  text: string,
  contexts: {
    codeComments: CodeCommentItem[];
    conversationSelections: ConversationSelectionItem[];
    webElements: WebContextItem[];
    pptxElements: PptxReferenceItem[];
  },
): string;

/** 错误展示（原 uN/lN，js 54254/54232） */
interface ChatError {
  message: string;
  code?: string;
  taskId?: string;
  traceId?: string;
  [key: string]: unknown;
}
declare function isIgnorableChatError(error: ChatError): boolean;
declare function formatChatError(error: ChatError, intl: IntlShape): string;

/** 遥测（原 wT js 42717 / oFe js 41744） */
interface ComposerTelemetry {
  recordComposerTextChange(text: string): void;
  recordComposerFocus(): void;
  reportVisibleChatError(payload: { errorKey: string; displayMessage: string; error: ChatError }): void;
}
declare function useComposerTelemetry(scope: {
  workspacePath: string;
  workspaceIdentity?: string | null;
  remoteSessionId?: string | null;
}): ComposerTelemetry | null;
declare function buildComposerTelemetryExtraDetail(args: {
  askMode?: string | null;
  modelName?: string | null;
  configProvider?: string | null;
  agentProvider?: string | null;
  providerBaseURL?: string;
  planIdentitySnapshot?: unknown;
}): Record<string, unknown>;

/** 供应商端点快照（原 hM/fM，js 52647/52633：useSyncExternalStore 订阅） */
interface ProviderEndpointEntry { id: string; endpoints: { baseURL?: string } }
declare function subscribeProviderEndpoints(listener: () => void): () => void;
declare function getProviderEndpointsSnapshot(): ProviderEndpointEntry[];

/** 上下文头/草稿配置/快照 */
export interface ComposerSnapshot {
  config?: ComposerConfig | null;
  usage?: unknown;
  control: { canStop: boolean; phase?: string | null };
  queue: { items: Array<{ queueItemId: string }> };
  rows: { totalCount: number; window: unknown[] };
  backgroundWorks?: unknown[];
  inputRouting?: { mode: "startNow" | "enqueue" | "reject" };
  [key: string]: unknown;
}
export interface ComposerConfig {
  mode?: string | null;
  model?: string | null;
  provider?: string | null;
  [key: string]: unknown;
}
export type ComposerConfigPicker = "model" | "thought" | "mode" | null;

/** 附件卡原语（原 vN/yN/bN/xN/SN，js 54555–54730；F08 附件族，接口保留） */
declare function AttachmentList(props: { variant: "grid" | "inline"; className?: string; children: React.ReactNode }): React.ReactElement;
declare function AttachmentCard(props: {
  "data-testid"?: string;
  "data-upload-status"?: string;
  data: { id: string; type: string; filename: string; description?: string; displayName?: string; sourceKind?: string; mediaType: string; url: string };
  onRemove: () => void;
  onOpen?: () => void;
  openLabel?: string;
  children: React.ReactNode;
}): React.ReactElement;
declare function AttachmentCardName(props: { className?: string }): React.ReactElement;
declare function AttachmentCardIcon(props: { className?: string; fallbackIcon?: React.ReactNode; children?: React.ReactNode }): React.ReactElement;
declare function AttachmentCardRemoveButton(props: { label: string }): React.ReactElement;
/** 附件预览对话框（原 DN，js 54798） */
declare function AttachmentPreviewDialog(props: {
  attachment: { filename: string; mediaType: string; url: string } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}): React.ReactElement;
/** 上下文/引用 chip 行（原 TH lit JH uit，js 68250/89941/68988/90039） */
declare function CodeCommentChipRow(props: { comments: CodeCommentItem[]; onRemove: (scope: { id: string; workspacePath: string; workspaceIdentity?: string | null }) => void; onRemoveAll: () => void }): React.ReactElement | null;
declare function WebContextChipRow(props: { contexts: WebContextItem[]; onRemove: (id: string) => void; onRemoveAll: () => void }): React.ReactElement | null;
declare function PptxReferenceChipRow(props: {
  references: PptxReferenceItem[];
  onOpen?: (reference: PptxReferenceItem) => void;
  onRemove: (id: string) => void;
  onRemoveAll: () => void;
}): React.ReactElement | null;
declare function ConversationSelectionChipRow(props: {
  references: ConversationSelectionItem[];
  onRemove: (id: string) => void;
  onRemoveAll: () => void;
}): React.ReactElement | null;
/** 错误横幅（原 vWe，js 54257） */
declare function ChatErrorBanner(props: {
  error: ChatError;
  onDismiss?: () => void;
  onOpenModelSettings?: () => void;
  onOpenUpgrade?: () => void;
}): React.ReactElement;
/** 工具条（原 Zrt 模式 js 89295 / ait 配置 js 89455 / iZe 后台工作胶囊 js 69225） */
declare function ComposerModeToolbar(props: {
  workspacePath: string;
  workspaceIdentity?: string | null;
  provider?: string | null;
  config: ComposerConfig | null;
  draftMode: boolean;
  draftConfig?: ComposerConfig | null;
  disabled: boolean;
  activeConfigPicker: ComposerConfigPicker;
  onConfigPickerOpenChange: (picker: ComposerConfigPicker, open: boolean) => void;
  onSwitchMode: (mode: string) => void;
}): React.ReactElement;
declare function ComposerConfigToolbar(props: {
  workspacePath: string;
  workspaceIdentity?: string | null;
  sessionId: string | null;
  phase: string | null;
  provider?: string | null;
  isWebRemoteControl: boolean;
  isMobileViewport: boolean;
  config: ComposerConfig | null;
  draftMode: boolean;
  draftConfig?: ComposerConfig | null;
  usage: unknown;
  disabled: boolean;
  activeConfigPicker: ComposerConfigPicker;
  onConfigPickerOpenChange: (picker: ComposerConfigPicker, open: boolean) => void;
  onSelectModel: (model: string) => void;
  onSelectThought: (thought: string) => void;
  onSwitchMode: (mode: string) => void;
  onRecoverCustomModelSelection?: () => void;
  onSendCompressionCommand?: () => void;
}): React.ReactElement;

/**
 * composer 输入区（原 ZV，F08 根组件，js 66959–~69297；接口保留）。
 * Lexical 富文本：@提及节点/斜杠面板/附件/工具条接线都在此实现。
 */

/* --- 5.1 hit 前置纯函数（原 dit/fit/pit/mit/_it） --- */

/** 原 dit：外部插入请求应用（提及优先：setMention，否则 setText） */
export function applyExternalTextInsertRequest({
  appliedRequestId,
  inputApi,
  request,
  requestFocus,
  scheduleDraftPersist,
  updateText,
}: {
  appliedRequestId: string | null;
  inputApi: ComposerInputApi | null;
  request: { requestId: string; text: string; mention?: ComposerMentionPayload } | null;
  requestFocus: () => void;
  scheduleDraftPersist: () => void;
  updateText: (text: string) => void;
}): string | null {
  if (!request || request.requestId === appliedRequestId || !inputApi) return appliedRequestId;
  if (request.mention && request.text.startsWith(request.mention.markdown)) {
    inputApi.setMention?.(request.mention, request.text.slice(request.mention.markdown.length));
  } else {
    inputApi.setText(request.text);
  }
  updateText(request.text);
  scheduleDraftPersist();
  requestFocus();
  return request.requestId;
}

/** 原 fit：composer 恢复请求应用（会话/工作区匹配且当前无内容时才恢复） */
export function applyComposerRestoreRequest({
  appliedRequestId,
  currentSessionId,
  currentWorkspaceKey,
  hasDraftContent,
  inputApi,
  request,
  requestFocus,
  restoreSessionOwnedAttachments,
  scheduleDraftPersist,
  updateText,
}: {
  appliedRequestId: string | null;
  currentSessionId: string | null;
  currentWorkspaceKey: string;
  hasDraftContent: boolean;
  inputApi: ComposerInputApi | null;
  request: {
    requestId: string;
    sessionId: string | null;
    workspaceKey: string;
    text: string;
    attachments: ComposerAttachment[];
  } | null;
  requestFocus: () => void;
  restoreSessionOwnedAttachments: (attachments: ComposerAttachment[]) => boolean;
  scheduleDraftPersist: () => void;
  updateText: (text: string) => void;
}): string | null {
  if (
    !request ||
    request.requestId === appliedRequestId ||
    request.sessionId !== currentSessionId ||
    request.workspaceKey !== currentWorkspaceKey ||
    hasDraftContent ||
    !inputApi ||
    !restoreSessionOwnedAttachments(request.attachments)
  ) {
    return appliedRequestId;
  }
  inputApi.setText(request.text);
  updateText(request.text);
  scheduleDraftPersist();
  requestFocus();
  return request.requestId;
}

/** 原 pit：字符串数组相等 */
export function areStringArraysEqual(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((item, index) => item === b[index]);
}

/** 原 mit：行数本地化格式（剪贴板文本附件描述用） */
export function formatLineCount(entry: { lineCount?: number }, locale: string): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(
    typeof entry.lineCount === "number" ? entry.lineCount : 0,
  );
}

/** 原 _it：事件是否落在对话框内（R0 的 Escape 处理用，js 120831） */
export function isEventInsideDialog(event: Event): boolean {
  if (event.defaultPrevented) return true;
  return event.composedPath().some((node) => {
    if (!node || typeof node !== "object") return false;
    const element = node as HTMLElement;
    return element.dataset?.slot === "dialog-content" || element.getAttribute?.("role") === "dialog";
  });
}

/** 草稿作用域：无会话时的占位 sessionId（原 `__draft__`） */
export const DRAFT_SCOPE_SESSION_ID = "__draft__";
/** 草稿持久化防抖（原 350ms） */
const DRAFT_PERSIST_DEBOUNCE_MS = 350;

export interface DraftComposerRegionProps {
  snapshot: ComposerSnapshot | null;
  sessionId?: string | null;
  /** Home 草稿态（R0 draftMode 传入 true） */
  draftMode?: boolean;
  draftConfig?: ComposerConfig | null;
  telemetryDraftConfig?: ComposerConfig | null;
  /** 上下文头（工作区行+分支 chip；draft 态渲染在输入面顶部） */
  contextHeader?: React.ReactNode;
  /** draft 态居中 + 限宽 max-w-2xl */
  centered?: boolean;
  blockingRequestId?: string | null;
  disabled?: boolean;
  autoFocusEnabled?: boolean;
  isWebRemoteControl?: boolean;
  workspacePath: string;
  workspaceIdentity?: string | null;
  remoteSessionId?: string | null;
  attachmentSessionId?: string | null;
  attachmentPut?: unknown;
  onRuntimeRestart?: () => void;
  provider?: string | null;
  telemetryVisible?: boolean;
  readPlanIdentitySnapshot?: () => unknown;
  onSendText: (
    text: string,
    opts: {
      telemetrySeed: unknown;
      heldQueueDisposition?: "clearQueueAndSend" | "keepQueueAndSend";
      expectedHeldQueueItemIds?: string[];
      attachments?: unknown[];
      contextAttachmentCount?: number;
    },
  ) => Promise<"sent" | "blocked" | "confirmationRequired">;
  onTextChange?: (text: string) => void;
  onDraftStateChange?: (state: { hasContent: boolean; busy: boolean }) => void;
  onStop: () => void;
  onSelectModel: (model: string) => void;
  onSelectThought: (thought: string) => void;
  onSwitchMode: (mode: string) => void;
  onOpenRunningBackgroundWorks?: () => void;
  runningSubagentCount?: number;
  onRecoverCustomModelSelection?: () => void;
  onSendCompressionCommand?: () => void;
  error?: ChatError | null;
  onDismissError?: () => void;
  onOpenModelSettings?: () => void;
  onOpenModelUpgrade?: () => void;
  onOpenCodeViewer?: (args: unknown) => void;
  listenAddToChatEvents?: boolean;
  externalTextInsertRequest?: { requestId: string; text: string; mention?: ComposerMentionPayload } | null;
  onExternalTextInsertApplied?: (requestId: string) => void;
  composerRestoreRequest?: {
    requestId: string;
    sessionId: string | null;
    workspaceKey: string;
    text: string;
    attachments: ComposerAttachment[];
  } | null;
  onComposerRestoreApplied?: (requestId: string) => void;
  suppressGoalCommands?: boolean;
  appSlashCommands?: unknown[];
  onDropTargetControllerChange?: (controller: {
    active: boolean;
    kind: "attachment" | "workspace" | null;
    onDragOver: (event: React.DragEvent) => void;
    onDragLeave: (event: React.DragEvent) => void;
    onDrop: (event: React.DragEvent) => void;
  } | null) => void;
}

/**
 * 原 hit（js 90180–91174 / jsx 78144）。逐行转录。
 * 结构：
 *   div.chat-composer-region（data-testid=v4-composer，@container/composer，draft 态 max-w-2xl）
 *     ├─ 隐藏 <input type=file>（附件选择）
 *     ├─ 错误横幅（vWe）
 *     ├─ div.chat-composer-input-surface（contextHeader 存在时 rounded-2xl bg-surface shadow-xl/5）
 *     │    ├─ contextHeader 行（p-1.5 flex flex-wrap）
 *     │    ├─ 会话选择限额告警（chat.selections.limit.*）
 *     │    ├─ ComposerInput（ZV：富文本输入 + 提及/斜杠面板）
 *     │    └─ 附件错误提示（info 图标 + 文案）
 *     ├─ 附件预览对话框（DN）
 *     └─ 队列发送确认对话框（chat.queue.sendConfirm.*：清空并发送/保留并发送）
 */
export function DraftComposerRegion({
  snapshot,
  sessionId = null,
  draftMode = false,
  draftConfig,
  telemetryDraftConfig,
  contextHeader,
  centered = false,
  blockingRequestId = null,
  disabled = false,
  autoFocusEnabled = true,
  isWebRemoteControl = false,
  workspacePath,
  workspaceIdentity,
  remoteSessionId,
  attachmentSessionId = null,
  attachmentPut,
  onRuntimeRestart,
  provider,
  telemetryVisible = true,
  readPlanIdentitySnapshot,
  onSendText,
  onTextChange,
  onDraftStateChange,
  onStop,
  onSelectModel,
  onSelectThought,
  onSwitchMode,
  onOpenRunningBackgroundWorks,
  runningSubagentCount = 0,
  onRecoverCustomModelSelection,
  onSendCompressionCommand,
  error,
  onDismissError,
  onOpenModelSettings,
  onOpenModelUpgrade,
  onOpenCodeViewer,
  listenAddToChatEvents = true,
  externalTextInsertRequest = null,
  onExternalTextInsertApplied,
  composerRestoreRequest = null,
  onComposerRestoreApplied,
  suppressGoalCommands = false,
  appSlashCommands,
  onDropTargetControllerChange,
}: DraftComposerRegionProps) {
  const { intl, locale } = useIntlContext();
  const platformContext = usePlatformContext();
  const telemetry = useComposerTelemetry({
    workspacePath,
    ...(workspaceIdentity ? { workspaceIdentity } : {}),
    ...(remoteSessionId ? { remoteSessionId } : {}),
  });
  const providerEndpoints = React.useSyncExternalStore(subscribeProviderEndpoints, getProviderEndpointsSnapshot, getProviderEndpointsSnapshot);
  const scopeSessionId = sessionId ?? DRAFT_SCOPE_SESSION_ID;
  const workspaceKey = workspaceIdentity?.trim() || workspacePath;
  const draftScopeKey = `${workspaceKey}\0${scopeSessionId}`;
  const [text, setTextState] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [pickerScope, setPickerScope] = React.useState<{ scopeKey: string; activePicker: ComposerConfigPicker }>(() => ({
    scopeKey: draftScopeKey,
    activePicker: null,
  }));
  // 作用域变化时重置选择器状态
  if (pickerScope.scopeKey !== draftScopeKey) setPickerScope({ scopeKey: draftScopeKey, activePicker: null });
  const activeConfigPicker = pickerScope.scopeKey === draftScopeKey ? pickerScope.activePicker : null;
  const handleConfigPickerOpenChange = React.useCallback(
    (picker: ComposerConfigPicker, open: boolean) => {
      setPickerScope((prev) =>
        prev.scopeKey === draftScopeKey
          ? { scopeKey: prev.scopeKey, activePicker: mergeConfigPickerState(prev.activePicker, picker, open) }
          : prev,
      );
    },
    [draftScopeKey],
  );
  // 队列发送确认状态（原 _e/ve，js 90250）
  const [queueConfirmState, setQueueConfirmState] = React.useState<{ telemetrySeed: unknown; queueItemIds: string[] } | null>(null);
  const [previewAttachment, setPreviewAttachment] = React.useState<{ filename: string; mediaType: string; url: string } | null>(null);
  const textRef = React.useRef("");
  const submitInFlightRef = React.useRef(false);
  const snapshotRef = React.useRef(snapshot);
  snapshotRef.current = snapshot;
  const inputApiRef = React.useRef<ComposerInputApi | null>(null);
  const reportedErrorKeysRef = React.useRef(new Set<string>());
  const isMobileTextInputViewport = useMobileTextInputViewport();
  const enterSubmits = resolveEnterSubmits({ isMobileTextInputViewport, preferEnterNewline: isWebRemoteControl });
  const avoidIosInputFocusZoom = shouldAvoidIosInputFocusZoom({ isMobileTextInputViewport, isWebRemoteControl });
  const compactNewTask = isWebRemoteControl && isMobileTextInputViewport;
  const submitShortcut = resolveSubmitShortcut({ enterSubmits });
  const updateText = React.useCallback(
    (next: string) => {
      textRef.current = next;
      setTextState(next);
      onTextChange?.(next);
    },
    [onTextChange],
  );
  const whiteboardScope = useWhiteboardAttachmentScope({
    workspacePath,
    workspaceIdentity,
    remoteSessionId,
    scopeId: scopeSessionId,
    attachmentSessionId,
    attachmentPut,
    onRuntimeRestart,
    disabled,
  });
  const { externalFileDragging, workspaceFileDragging } = useFileDragDetection({
    enableExternalFileDrop: true,
    enableWorkspaceFileDrop: true,
  });
  const handleDragOver = React.useCallback(
    (event: React.DragEvent) => {
      whiteboardScope.handleDragOverComposer(event);
    },
    [whiteboardScope.handleDragOverComposer],
  );
  const handleDragLeave = React.useCallback(
    (event: React.DragEvent) => {
      whiteboardScope.handleDragLeaveComposer(event);
    },
    [whiteboardScope.handleDragLeaveComposer],
  );
  const handleDrop = React.useCallback(
    (event: React.DragEvent) => {
      const payload = parseAddToChatPayload(event.dataTransfer);
      if (payload) {
        event.preventDefault();
        whiteboardScope.handleDropComposer(event);
        insertAddToChatPayload({
          inputApiRef,
          currentMarkdown: inputApiRef.current?.getMarkdown() ?? textRef.current,
          payload,
          workspacePath,
          workspaceIdentity,
          onTextChange: updateText,
        });
        return;
      }
      whiteboardScope.handleDropComposer(event);
    },
    [whiteboardScope.handleDropComposer, updateText, workspaceIdentity, workspacePath],
  );
  const dragKind = workspaceFileDragging
    ? "workspace"
    : externalFileDragging
      ? "attachment"
      : (whiteboardScope.composerDragKind ?? (whiteboardScope.isDraggingOverComposer ? "attachment" : null));
  const dropTargetController = React.useMemo(
    () => ({ active: dragKind !== null, kind: dragKind, onDragOver: handleDragOver, onDragLeave: handleDragLeave, onDrop: handleDrop }),
    [dragKind, handleDragLeave, handleDragOver, handleDrop],
  );
  React.useEffect(() => {
    onDropTargetControllerChange?.(dropTargetController);
    return () => onDropTargetControllerChange?.(null);
  }, [dropTargetController, onDropTargetControllerChange]);

  const attachmentOpenLabel = intl.formatMessage({ id: "chat.attachments.preview.open" });
  const hasAttachments = whiteboardScope.hasAttachments;
  const { contexts: webContexts, hasContexts: hasWebContexts, removeContext: removeWebContext, clearContexts: clearWebContexts } = useWebContexts({
    workspacePath,
    workspaceIdentity,
    listenAddToChatEvents: listenAddToChatEvents && !disabled,
    scopeId: scopeSessionId,
  });
  const { references: pptxReferences, hasReferences: hasPptxReferences, removeReference: removePptxReference, clearReferences: clearPptxReferences } = usePptxReferences({
    workspacePath,
    workspaceIdentity,
    remoteSessionId,
    listenAddToChatEvents: listenAddToChatEvents && !disabled,
    scopeId: scopeSessionId,
  });
  const openCodeCommentViewer = useCodeCommentOpener({ workspacePath, workspaceIdentity, remoteSessionId, onOpenCodeViewer });
  const {
    references: conversationSelections,
    limitReason: selectionLimitReason,
    removeReference: removeConversationSelection,
    clearReferences: clearConversationSelections,
  } = useConversationSelections({ sessionId, workspaceKey });
  const hasConversationSelections = conversationSelections.length > 0;

  /* --- 草稿持久化（350ms 防抖；页签隐藏/失焦时立即落盘） --- */
  const scopeSessionIdRef = React.useRef(scopeSessionId);
  const draftTargetRef = React.useRef({ workspacePath, workspaceIdentity, scopeId: scopeSessionId });
  const persistTimerRef = React.useRef<number | null>(null);
  const suppressPersistRef = React.useRef(false);
  const buildDraftSnapshot = React.useCallback((): ComposerDraftSnapshot => {
    const draftText = textRef.current;
    let editorStateJson: string | undefined;
    try {
      const editorState = inputApiRef.current?.getEditorState();
      editorStateJson = editorState ? JSON.stringify(editorState.toJSON()) : undefined;
    } catch (err) {
      logger.warn(`[v4-composer] 草稿 editorState 序列化失败: ${String(err)}`);
    }
    return draftText.trim() ? { text: draftText, ...(editorStateJson ? { editorStateJson } : {}) } : { text: "" };
  }, []);
  const persistDraftNow = React.useCallback(
    (scopeId: string) => {
      if (suppressPersistRef.current) return;
      saveComposerDraft(workspacePath, workspaceIdentity, scopeId, buildDraftSnapshot());
    },
    [buildDraftSnapshot, workspaceIdentity, workspacePath],
  );
  const scheduleDraftPersist = React.useCallback(() => {
    if (typeof window > "u") return;
    if (persistTimerRef.current !== null) window.clearTimeout(persistTimerRef.current);
    persistTimerRef.current = window.setTimeout(() => {
      persistTimerRef.current = null;
      persistDraftNow(scopeSessionIdRef.current);
    }, DRAFT_PERSIST_DEBOUNCE_MS);
  }, [persistDraftNow]);

  /* --- 自动聚焦（草稿焦点版本变化 / 恢复 / 启用态变化） --- */
  const draftFocusVersion = useTaskStore((s) => s.getWorkspaceState(workspacePath, workspaceIdentity).draftFocusVersion);
  const focusPendingRef = React.useRef(false);
  const restoreAppliedRef = React.useRef<string | null>(null);
  const insertAppliedRef = React.useRef<string | null>(null);
  const autoFocusPolicyRef = React.useRef({ autoFocusEnabled, disabled, isMobileViewport: isMobileTextInputViewport });
  autoFocusPolicyRef.current = { autoFocusEnabled, disabled, isMobileViewport: isMobileTextInputViewport };
  const applyPendingFocus = React.useCallback(() => {
    if (
      focusPendingRef.current &&
      resolveAutoFocusPolicy(autoFocusPolicyRef.current) === "focus-now" &&
      inputApiRef.current
    ) {
      focusPendingRef.current = false;
      if (typeof requestAnimationFrame === "function") {
        requestAnimationFrame(() => inputApiRef.current?.focus());
      } else {
        inputApiRef.current.focus();
      }
    }
  }, []);
  const requestFocus = React.useCallback(() => {
    if (resolveAutoFocusPolicy(autoFocusPolicyRef.current) !== "skip") {
      focusPendingRef.current = true;
      applyPendingFocus();
    }
  }, [applyPendingFocus]);
  const handleContextRemoved = React.useCallback(
    (item: CodeCommentItem) => {
      broadcastContextRemoved(item, platformContext?.broadcastService);
    },
    [platformContext?.broadcastService],
  );
  const {
    contexts: codeComments,
    hasContexts: hasCodeComments,
    removeContext: removeCodeComment,
    clearContexts: clearCodeComments,
    getContexts,
  } = useCodeCommentContexts({
    listenAddToChatEvents: listenAddToChatEvents && !disabled,
    onContextRemoved: handleContextRemoved,
    requestFocus,
    scopeKey: `${workspaceKey}\0${scopeSessionId}`,
  });

  /* --- composer 恢复请求（会话切换时把旧草稿搬回输入区） --- */
  React.useEffect(() => {
    if (!composerRestoreRequest) return;
    const apply = () => {
      const appliedId = applyComposerRestoreRequest({
        appliedRequestId: restoreAppliedRef.current,
        currentSessionId: sessionId,
        currentWorkspaceKey: workspaceKey,
        hasDraftContent:
          textRef.current.length > 0 ||
          whiteboardScope.attachments.length > 0 ||
          codeComments.length > 0 ||
          webContexts.length > 0 ||
          pptxReferences.length > 0 ||
          conversationSelections.length > 0,
        inputApi: inputApiRef.current,
        request: composerRestoreRequest,
        requestFocus,
        restoreSessionOwnedAttachments: whiteboardScope.restoreSessionOwnedAttachments,
        scheduleDraftPersist,
        updateText,
      });
      const justApplied = appliedId === composerRestoreRequest.requestId && restoreAppliedRef.current !== composerRestoreRequest.requestId;
      restoreAppliedRef.current = appliedId;
      if (justApplied) onComposerRestoreApplied?.(composerRestoreRequest.requestId);
      return appliedId === composerRestoreRequest.requestId;
    };
    if (apply() || typeof requestAnimationFrame !== "function") return;
    const rafId = requestAnimationFrame(apply);
    return () => cancelAnimationFrame(rafId);
  }, [
    whiteboardScope.attachments.length,
    whiteboardScope.restoreSessionOwnedAttachments,
    codeComments.length,
    composerRestoreRequest,
    conversationSelections.length,
    onComposerRestoreApplied,
    requestFocus,
    scheduleDraftPersist,
    sessionId,
    updateText,
    webContexts.length,
    pptxReferences.length,
    workspaceKey,
  ]);

  /* --- 作用域切换：落盘旧草稿、恢复新草稿（跨工作区切换时尝试搬运） --- */
  React.useEffect(() => {
    const previous = draftTargetRef.current;
    const scopeChanged = previous.scopeId !== scopeSessionId || previous.workspacePath !== workspacePath || previous.workspaceIdentity !== workspaceIdentity;
    let carriedDraft: ComposerDraftSnapshot | null = null;
    if (scopeChanged && !suppressPersistRef.current) {
      if (persistTimerRef.current !== null) {
        window.clearTimeout(persistTimerRef.current);
        persistTimerRef.current = null;
      }
      const draftSnapshot = buildDraftSnapshot();
      saveComposerDraft(previous.workspacePath, previous.workspaceIdentity, previous.scopeId, draftSnapshot);
      if (
        previous.scopeId === DRAFT_SCOPE_SESSION_ID &&
        scopeSessionId === DRAFT_SCOPE_SESSION_ID &&
        consumeDraftCarryOver({
          sourceWorkspacePath: previous.workspacePath,
          sourceWorkspaceIdentity: previous.workspaceIdentity,
          targetWorkspacePath: workspacePath,
          targetWorkspaceIdentity: workspaceIdentity,
        })
      ) {
        saveComposerDraft(workspacePath, workspaceIdentity, scopeSessionId, draftSnapshot);
        carriedDraft = draftSnapshot;
      }
    }
    scopeSessionIdRef.current = scopeSessionId;
    draftTargetRef.current = { workspacePath, workspaceIdentity, scopeId: scopeSessionId };
    const storedDraft = carriedDraft ?? loadComposerDraft(workspacePath, workspaceIdentity, scopeSessionId);
    const restoreInto = (api: ComposerInputApi) => {
      if (!storedDraft) {
        if (textRef.current) {
          api.clear();
          updateText("");
        }
        return;
      }
      if (storedDraft.editorStateJson) {
        try {
          api.setEditorStateJson(storedDraft.editorStateJson);
          updateText(api.getMarkdown());
          return;
        } catch (err) {
          logger.warn(`[v4-composer] 草稿 editorState 恢复失败，退纯文本: ${String(err)}`);
        }
      }
      api.setText(storedDraft.text);
      updateText(storedDraft.text);
    };
    const restoreAndFocus = () => {
      const api = inputApiRef.current;
      if (api) {
        restoreInto(api);
        requestFocus();
      }
    };
    if (typeof requestAnimationFrame === "function") {
      const rafId = requestAnimationFrame(restoreAndFocus);
      return () => cancelAnimationFrame(rafId);
    }
    restoreAndFocus();
  }, [scopeSessionId, persistDraftNow, requestFocus, buildDraftSnapshot, updateText, workspaceIdentity, workspacePath]);

  /* --- 外部文本插入请求（如侧栏「添加到任务」） --- */
  React.useEffect(() => {
    if (!externalTextInsertRequest) return;
    const apply = () => {
      const appliedId = applyExternalTextInsertRequest({
        appliedRequestId: insertAppliedRef.current,
        inputApi: inputApiRef.current,
        request: externalTextInsertRequest,
        requestFocus,
        scheduleDraftPersist,
        updateText,
      });
      const justApplied = appliedId === externalTextInsertRequest.requestId;
      insertAppliedRef.current = appliedId;
      if (justApplied) onExternalTextInsertApplied?.(externalTextInsertRequest.requestId);
      return justApplied;
    };
    if (apply() || typeof requestAnimationFrame !== "function") return;
    const rafId = requestAnimationFrame(apply);
    return () => cancelAnimationFrame(rafId);
  }, [externalTextInsertRequest, onExternalTextInsertApplied, requestFocus, scheduleDraftPersist, updateText]);

  /* --- 焦点版本 / 禁用态 / 页面隐藏落盘 --- */
  const lastFocusVersionRef = React.useRef(draftFocusVersion);
  React.useEffect(() => {
    if (lastFocusVersionRef.current !== draftFocusVersion) {
      lastFocusVersionRef.current = draftFocusVersion;
      requestFocus();
    }
  }, [draftFocusVersion, requestFocus]);
  React.useEffect(() => {
    applyPendingFocus();
  }, [disabled, applyPendingFocus]);
  React.useEffect(() => {
    if (typeof window > "u") return;
    const flush = () => persistDraftNow(scopeSessionIdRef.current);
    window.addEventListener("pagehide", flush);
    window.addEventListener("blur", flush);
    return () => {
      flush();
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("blur", flush);
      if (persistTimerRef.current !== null) {
        window.clearTimeout(persistTimerRef.current);
        persistTimerRef.current = null;
      }
    };
  }, [persistDraftNow]);

  const [promptHistory, setPromptHistory] = React.useState<string[]>(() => readPromptHistory(workspacePath));
  React.useEffect(() => {
    setPromptHistory(readPromptHistory(workspacePath));
  }, [workspacePath]);

  /* --- 提交可用性推导 --- */
  const inputRoutingMode = snapshot?.inputRouting?.mode ?? "startNow";
  const isTaskProcessing = !!snapshot?.control.canStop;
  const hasSubmittableContent =
    text.trim().length > 0 || hasAttachments || hasCodeComments || hasWebContexts || hasPptxReferences || hasConversationSelections;
  const hasAnyContent =
    text.length > 0 || hasAttachments || hasCodeComments || hasWebContexts || hasPptxReferences || hasConversationSelections;
  React.useEffect(() => {
    onDraftStateChange?.({ hasContent: hasAnyContent, busy: submitting });
  }, [hasAnyContent, onDraftStateChange, submitting]);
  const canSubmitNow = draftMode || (snapshot !== null && inputRoutingMode !== "reject");
  const attachmentsReady = !whiteboardScope.hasUnreadyAttachments;
  const submitEnabled = !disabled && !submitting && hasSubmittableContent && canSubmitNow && attachmentsReady;
  const showStopButton = isTaskProcessing && !hasSubmittableContent;

  /* --- 发送（含队列确认、提示词历史、遥测、草稿清理） --- */
  const handleSubmit = React.useCallback(
    async (
      heldQueueDisposition?: "clearQueueAndSend" | "keepQueueAndSend",
      expectedHeldQueueItemIds?: string[],
      telemetrySeedOverride?: { sendTime: number; extraDetail: Record<string, unknown> },
    ) => {
      const draftText = textRef.current.trim();
      const heldQueueItemIdsBefore = snapshotRef.current?.queue.items.map((item) => item.queueItemId) ?? [];
      const hasAttachmentsToSend = whiteboardScope.attachments.length > 0;
      const codeCommentsToSend = getContexts();
      const hasCodeCommentsToSend = codeCommentsToSend.length > 0;
      const webElementsToSend = webContexts;
      const hasWebElementsToSend = webElementsToSend.length > 0;
      const pptxElementsToSend = pptxReferences;
      const hasPptxElementsToSend = pptxElementsToSend.length > 0;
      const selectionsToSend = conversationSelections;
      const hasSelectionsToSend = selectionsToSend.length > 0;
      const submitScopeId = scopeSessionIdRef.current;
      const submitTarget = { ...draftTargetRef.current };
      const draftSnapshotAtSend = buildDraftSnapshot();
      if (
        (!draftText && !hasAttachmentsToSend && !hasCodeCommentsToSend && !hasWebElementsToSend && !hasPptxElementsToSend && !hasSelectionsToSend) ||
        submitInFlightRef.current ||
        whiteboardScope.hasUnreadyAttachments
      ) {
        return;
      }
      submitInFlightRef.current = true;
      setSubmitting(true);
      const effectiveConfig = snapshotRef.current?.config ?? telemetryDraftConfig ?? draftConfig;
      const telemetrySeed =
        telemetrySeedOverride ?? {
          sendTime: Date.now(),
          extraDetail: buildComposerTelemetryExtraDetail({
            askMode: effectiveConfig?.mode,
            modelName: effectiveConfig?.model,
            configProvider: effectiveConfig?.provider,
            agentProvider: provider,
            providerBaseURL: providerEndpoints.find((entry) => entry.id === effectiveConfig?.provider)?.endpoints.baseURL,
            planIdentitySnapshot: readPlanIdentitySnapshot?.(),
          }),
        };
      let historyBefore: string[] | null = null;
      let historyCandidate: string[] | null = null;
      let historyChanged = false;
      let historyPersisted = false;
      const clearPersistedDraft = () => {
        if (persistTimerRef.current !== null) {
          window.clearTimeout(persistTimerRef.current);
          persistTimerRef.current = null;
        }
        suppressPersistRef.current = true;
        clearComposerDraft(submitTarget.workspacePath, submitTarget.workspaceIdentity, submitScopeId);
        historyPersisted = true;
      };
      const rollbackDraft = () => {
        if (historyPersisted) {
          saveComposerDraft(submitTarget.workspacePath, submitTarget.workspaceIdentity, submitScopeId, draftSnapshotAtSend);
          suppressPersistRef.current = false;
        }
      };
      const commitDraftCleared = () => {
        if (historyPersisted) {
          clearComposerDraft(submitTarget.workspacePath, submitTarget.workspaceIdentity, submitScopeId);
          suppressPersistRef.current = false;
        }
      };
      const maybePersistPromptHistory = () => {
        if (!historyChanged || historyBefore === null || historyCandidate === null) return;
        const currentHistory = readPromptHistory(workspacePath);
        if (areStringArraysEqual(currentHistory, historyCandidate)) {
          writePromptHistory(workspacePath, historyBefore);
          setPromptHistory(historyBefore);
          return;
        }
        setPromptHistory(currentHistory);
      };
      try {
        const preparedAttachments = await whiteboardScope.prepareForSend();
        if (preparedAttachments === null) return;
        const outgoingText = buildOutgoingMessage(draftText, {
          codeComments: codeCommentsToSend,
          conversationSelections: selectionsToSend,
          webElements: webElementsToSend,
          pptxElements: pptxElementsToSend,
        });
        const contextAttachmentCount = countContextAttachments({
          codeComments: codeCommentsToSend,
          conversationSelections: selectionsToSend,
          webElements: webElementsToSend as unknown as WebElementContext[],
          pptxElements: pptxElementsToSend,
        });
        if (draftText) {
          historyBefore = readPromptHistory(workspacePath);
          historyCandidate = appendPromptHistoryEntry(historyBefore, draftText);
          if (!areStringArraysEqual(historyBefore, historyCandidate)) {
            writePromptHistory(workspacePath, historyCandidate);
            historyChanged = true;
            setPromptHistory(historyCandidate);
          }
        }
        clearPersistedDraft();
        const sendResult = await onSendText(outgoingText, {
          telemetrySeed,
          ...(heldQueueDisposition ? { heldQueueDisposition } : {}),
          ...(expectedHeldQueueItemIds ? { expectedHeldQueueItemIds } : {}),
          ...(preparedAttachments.length > 0 ? { attachments: preparedAttachments } : {}),
          ...(contextAttachmentCount > 0 ? { contextAttachmentCount } : {}),
        });
        if (sendResult === "blocked") {
          maybePersistPromptHistory();
          rollbackDraft();
          return;
        }
        if (sendResult === "confirmationRequired") {
          maybePersistPromptHistory();
          rollbackDraft();
          const heldQueueItemIds = snapshotRef.current?.queue.items.map((item) => item.queueItemId) ?? [];
          setQueueConfirmState({ telemetrySeed, queueItemIds: heldQueueItemIds.length > 0 ? heldQueueItemIds : heldQueueItemIdsBefore });
          return;
        }
        setQueueConfirmState(null);
        await whiteboardScope.adoptSentAttachments();
        inputApiRef.current?.clear();
        updateText("");
        whiteboardScope.clearAttachments();
        clearCodeComments();
        clearWebContexts();
        clearPptxReferences();
        clearConversationSelections();
        commitDraftCleared();
      } catch (err) {
        maybePersistPromptHistory();
        rollbackDraft();
        logger.warn(`[v4-composer] 发送失败: ${String(err)}`);
      } finally {
        submitInFlightRef.current = false;
        setSubmitting(false);
      }
    },
    [
      whiteboardScope,
      clearCodeComments,
      clearConversationSelections,
      clearWebContexts,
      clearPptxReferences,
      conversationSelections,
      draftConfig,
      getContexts,
      telemetryDraftConfig,
      providerEndpoints,
      onSendText,
      provider,
      readPlanIdentitySnapshot,
      buildDraftSnapshot,
      updateText,
      webContexts,
      pptxReferences,
      workspaceIdentity,
      workspacePath,
    ],
  );

  const handleTextChange = React.useCallback(
    (next: string) => {
      telemetry?.recordComposerTextChange(next);
      updateText(next);
      scheduleDraftPersist();
    },
    [telemetry, scheduleDraftPersist, updateText],
  );
  const handleInputFocus = React.useCallback(() => {
    telemetry?.recordComposerFocus();
  }, [telemetry]);
  const handleEditorSubmit = React.useCallback(
    (nextText: string) => {
      textRef.current = nextText;
      handleSubmit();
      return false;
    },
    [handleSubmit],
  );
  const handleClearQueueAndSend = React.useCallback(() => {
    if (queueConfirmState) handleSubmit("clearQueueAndSend", queueConfirmState.queueItemIds, queueConfirmState.telemetrySeed as { sendTime: number; extraDetail: Record<string, unknown> });
  }, [queueConfirmState, handleSubmit]);
  const handleKeepQueueAndSend = React.useCallback(() => {
    if (queueConfirmState) handleSubmit("keepQueueAndSend", queueConfirmState.queueItemIds, queueConfirmState.telemetrySeed as { sendTime: number; extraDetail: Record<string, unknown> });
  }, [queueConfirmState, handleSubmit]);
  const handleStop = React.useCallback(() => {
    onStop();
  }, [onStop]);

  /* --- 「添加到任务」窗口事件 → 文本插入 --- */
  React.useEffect(() => {
    if (!listenAddToChatEvents || typeof window > "u") return;
    const listener = (event: Event) => {
      if (isAddToChatEvent(event)) {
        event.preventDefault();
        insertAddToChatPayload({
          inputApiRef,
          currentMarkdown: inputApiRef.current?.getMarkdown() ?? textRef.current,
          payload: (event as CustomEvent<AddToChatPayload>).detail,
          workspacePath,
          workspaceIdentity,
          onTextChange: updateText,
        });
      }
    };
    window.addEventListener(ADD_TO_CHAT_EVENT_NAME, listener);
    return () => {
      window.removeEventListener(ADD_TO_CHAT_EVENT_NAME, listener);
    };
  }, [listenAddToChatEvents, updateText, workspaceIdentity, workspacePath]);

  /* --- 文案 --- */
  const placeholder = intl.formatMessage({
    id: resolveComposerPlaceholderI18nId({
      hasHistoryMessages: (snapshot?.rows.totalCount ?? 0) > 0,
      isTaskProcessing,
      compactNewTask,
    }),
  });
  const submitLabel = intl.formatMessage({ id: inputRoutingMode === "enqueue" ? "chat.queue.enqueue" : "chat.send" });
  const stopLabel = intl.formatMessage({ id: "chat.stop" });
  const attachmentAddLabel = intl.formatMessage({ id: "chat.attachments.add" });
  const displayError = error && !isIgnorableChatError(error) ? error : null;

  /* --- 可见错误遥测（去重） --- */
  React.useEffect(() => {
    if (!displayError || !telemetry || !telemetryVisible) return;
    const errorKey = [displayError.taskId ?? sessionId ?? "", displayError.code ?? "", displayError.traceId ?? "", displayError.message].join(":");
    if (reportedErrorKeysRef.current.has(errorKey)) return;
    reportedErrorKeysRef.current.add(errorKey);
    telemetry.reportVisibleChatError({ errorKey, displayMessage: formatChatError(displayError, intl), error: displayError });
  }, [telemetry, intl, sessionId, telemetryVisible, displayError]);

  const attachmentAction = React.useMemo(
    () => ({ label: attachmentAddLabel, menuItemTestId: ATTACHMENT_MENU_ITEM_TESTID, onSelect: whiteboardScope.openAttachmentPicker, testId: ATTACHMENT_BUTTON_TESTID }),
    [attachmentAddLabel, whiteboardScope.openAttachmentPicker],
  );

  /* --- 输入区上方内容：上下文/引用/附件 chip 群 --- */
  const attachments = whiteboardScope.attachments;
  const topContent = React.useMemo(
    () =>
      attachments.length === 0 && codeComments.length === 0 && webContexts.length === 0 && pptxReferences.length === 0 && conversationSelections.length === 0
        ? null
        : (() => (
            <div className="flex max-w-full flex-wrap items-center gap-2">
              <CodeCommentChipRow comments={codeComments} onRemove={removeCodeComment} onRemoveAll={clearCodeComments} />
              <WebContextChipRow contexts={webContexts} onRemove={removeWebContext} onRemoveAll={clearWebContexts} />
              <PptxReferenceChipRow
                references={pptxReferences}
                onOpen={onOpenCodeViewer ? openCodeCommentViewer : undefined}
                onRemove={removePptxReference}
                onRemoveAll={clearPptxReferences}
              />
              <ConversationSelectionChipRow
                references={conversationSelections}
                onRemove={removeConversationSelection}
                onRemoveAll={clearConversationSelections}
              />
              {attachments.length > 0 ? (
                <AttachmentList variant="inline" className="max-w-full gap-2">
                  {attachments.map((attachment) => {
                    const isClipboardText = attachment.sourceKind === "clipboard-text";
                    const isImage = isImageAttachment(attachment);
                    const mediaType = attachment.objectUrl
                      ? attachment.mimeType
                      : attachment.mimeType.startsWith("image/")
                        ? "application/octet-stream"
                        : attachment.mimeType;
                    const canPreview = !!attachment.objectUrl && isImageAttachment(attachment);
                    const iconInfo = resolveFileIconInfo(attachment.localPath ?? attachment.filename);
                    const uploadStatusLabel =
                      attachment.uploadStatus === "uploading"
                        ? intl.formatMessage({ id: "chat.attachments.upload.uploading" }, { progress: String(attachment.uploadProgress) })
                        : attachment.uploadStatus === "failed"
                          ? intl.formatMessage({ id: "chat.attachments.upload.failed" }, { message: attachment.uploadError ?? "unknown" })
                          : intl.formatMessage({ id: `chat.attachments.upload.${attachment.uploadStatus}` });
                    const showUploadOverlay = !attachment.localZeroCopy && (attachment.uploadStatus !== "ready" || attachment.showComplete);
                    return (
                      <AttachmentCard
                        key={attachment.id}
                        data-testid={testidOf(ATTACHMENT_ITEM_TESTID, attachment.id)}
                        data-upload-status={attachment.uploadStatus}
                        data={{
                          id: attachment.id,
                          type: "file",
                          filename: attachment.filename,
                          ...(isClipboardText
                            ? {
                                description: intl.formatMessage(
                                  { id: "chat.attachments.clipboardText.description" },
                                  { lineCount: formatLineCount(attachment, locale) },
                                ),
                                displayName: intl.formatMessage({ id: "chat.attachments.clipboardText" }),
                                sourceKind: "clipboard-text",
                              }
                            : {}),
                          mediaType,
                          url: attachment.objectUrl ?? "",
                        }}
                        onRemove={() => whiteboardScope.removeAttachment(attachment.id)}
                        onOpen={canPreview ? () => setPreviewAttachment({ filename: attachment.filename, mediaType, url: attachment.objectUrl ?? "" }) : undefined}
                        openLabel={canPreview ? attachmentOpenLabel : undefined}
                      >
                        <div className="relative size-6 shrink-0">
                          <AttachmentCardIcon
                            className="size-6"
                            fallbackIcon={
                              isClipboardText ? (
                                <IconClipboardPenLine className="size-3.5 text-muted-foreground" />
                              ) : (
                                <FileIcon src={iconInfo.fileIconSrc} size={16} className="size-4 shrink-0" />
                              )
                            }
                          />
                          {showUploadOverlay && isImage ? (
                            <span
                              data-testid={testidOf(ATTACHMENT_UPLOAD_PROGRESS_TESTID, attachment.id)}
                              role={attachment.uploadStatus === "failed" ? "alert" : "status"}
                              aria-label={uploadStatusLabel}
                              className="absolute inset-0 grid place-items-center rounded bg-background/85 text-[7px] font-semibold text-foreground"
                            >
                              <svg aria-hidden="true" className="absolute inset-0 size-6 -rotate-90 text-brand" viewBox="0 0 24 24">
                                <circle className="stroke-border" cx="12" cy="12" fill="none" pathLength="100" r="9" strokeWidth="2" />
                                <circle
                                  className={attachment.uploadStatus === "failed" ? "stroke-destructive" : "stroke-current"}
                                  cx="12"
                                  cy="12"
                                  fill="none"
                                  pathLength="100"
                                  r="9"
                                  strokeDasharray={`${attachment.uploadProgress} 100`}
                                  strokeLinecap="round"
                                  strokeWidth="2"
                                />
                              </svg>
                              <span className="relative">{attachment.uploadStatus === "failed" ? "!" : `${attachment.uploadProgress}%`}</span>
                            </span>
                          ) : null}
                        </div>
                        <AttachmentCardName className="max-w-48 text-ui-base text-foreground" />
                        {showUploadOverlay && !isImage ? (
                          <span
                            data-testid={testidOf(ATTACHMENT_UPLOAD_PROGRESS_TESTID, attachment.id)}
                            role={attachment.uploadStatus === "failed" ? "alert" : "status"}
                            title={uploadStatusLabel}
                            className={cn(
                              "max-w-28 truncate text-ui-sm font-normal text-foreground-subtle",
                              attachment.uploadStatus === "failed" && "text-destructive",
                            ) as string}
                          >
                            {attachment.uploadStatus === "uploading" ? `${attachment.uploadProgress}%` : uploadStatusLabel}
                          </span>
                        ) : null}
                        {attachment.uploadStatus === "failed" ? (
                          <button
                            type="button"
                            data-testid={testidOf(ATTACHMENT_UPLOAD_RETRY_TESTID, attachment.id)}
                            aria-label={intl.formatMessage({ id: "chat.attachments.upload.retry" })}
                            title={uploadStatusLabel}
                            className="grid size-5 shrink-0 place-items-center rounded-md text-destructive hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              whiteboardScope.retryAttachment(attachment.id);
                            }}
                          >
                            <IconRotateCcw className="size-3" />
                          </button>
                        ) : null}
                        <AttachmentCardRemoveButton label={intl.formatMessage({ id: "chat.attachments.remove" })} />
                      </AttachmentCard>
                    );
                  })}
                </AttachmentList>
              ) : null}
            </div>
          ))(),
    [
      attachmentOpenLabel,
      whiteboardScope,
      clearCodeComments,
      clearConversationSelections,
      clearWebContexts,
      clearPptxReferences,
      codeComments,
      attachments,
      intl,
      locale,
      removeCodeComment,
      removeConversationSelection,
      removeWebContext,
      removePptxReference,
      conversationSelections,
      webContexts,
      pptxReferences,
      onOpenCodeViewer,
      openCodeCommentViewer,
    ],
  );

  /* --- 提交控件（右簇：配置工具条 + 停止/发送按钮） --- */
  const snapshotConfig = snapshot?.config ?? null;
  const snapshotUsage = snapshot?.usage ?? null;
  const snapshotPhase = snapshot?.control.phase ?? null;
  const submitControl = React.useMemo(
    () => (
      <div className="flex min-w-0 items-center gap-1">
        <span className="flex min-w-0 shrink items-center gap-1 overflow-hidden empty:hidden">
          <ComposerConfigToolbar
            workspacePath={workspacePath}
            workspaceIdentity={workspaceIdentity}
            sessionId={sessionId ?? null}
            phase={snapshotPhase}
            provider={provider}
            isWebRemoteControl={isWebRemoteControl}
            isMobileViewport={isMobileTextInputViewport}
            config={snapshotConfig}
            draftMode={draftMode}
            draftConfig={draftConfig}
            usage={snapshotUsage}
            disabled={disabled}
            activeConfigPicker={activeConfigPicker}
            onConfigPickerOpenChange={handleConfigPickerOpenChange}
            onSelectModel={onSelectModel}
            onSelectThought={onSelectThought}
            onSwitchMode={onSwitchMode}
            onRecoverCustomModelSelection={onRecoverCustomModelSelection}
            onSendCompressionCommand={onSendCompressionCommand}
          />
        </span>
        {showStopButton ? (
          <Tooltip title={stopLabel} shortcut="Esc">
            <Button
              type="button"
              variant="secondary"
              size="icon-md"
              onClick={handleStop}
              data-testid={STOP_BUTTON_TESTID}
              aria-label={stopLabel}
            >
              <IconSquare className="size-4 fill-current" />
              <span className="sr-only">{stopLabel}</span>
            </Button>
          </Tooltip>
        ) : (
          <Tooltip title={submitLabel} shortcut={submitShortcut}>
            <Button
              type="submit"
              size="icon-md"
              disabled={!submitEnabled}
              data-testid={SEND_BUTTON_TESTID}
              aria-label={submitLabel}
              className="gap-1 rounded-lg bg-brand text-ui-base text-foreground-inverse hover:bg-brand/80"
            >
              {submitting ? <Spinner className="size-4" /> : <IconArrowUp className="size-4" />}
              <span className="sr-only">{submitLabel}</span>
            </Button>
          </Tooltip>
        )}
      </div>
    ),
    [
      submitEnabled,
      activeConfigPicker,
      snapshotConfig,
      snapshotPhase,
      snapshotUsage,
      disabled,
      draftConfig,
      draftMode,
      handleStop,
      handleConfigPickerOpenChange,
      isWebRemoteControl,
      inputRoutingMode,
      onSelectModel,
      onSelectThought,
      onRecoverCustomModelSelection,
      onSendCompressionCommand,
      onSwitchMode,
      submitting,
      provider,
      submitShortcut,
      submitLabel,
      sessionId,
      showStopButton,
      stopLabel,
      workspaceIdentity,
      workspacePath,
    ],
  );

  /* --- 前置动作（左簇：模式工具条 + 后台工作胶囊） --- */
  const leadingActions = React.useMemo(
    () => (
      <>
        <ComposerModeToolbar
          workspacePath={workspacePath}
          workspaceIdentity={workspaceIdentity}
          provider={provider}
          config={snapshotConfig}
          draftMode={draftMode}
          draftConfig={draftConfig}
          disabled={disabled}
          activeConfigPicker={activeConfigPicker}
          onConfigPickerOpenChange={handleConfigPickerOpenChange}
          onSwitchMode={onSwitchMode}
        />
        <BackgroundWorksCapsule
          backgroundWorks={(snapshot?.backgroundWorks ?? []) as BackgroundWork[]}
          runningSubagentCount={runningSubagentCount}
          onOpen={onOpenRunningBackgroundWorks}
        />
      </>
    ),
    [snapshotConfig, activeConfigPicker, disabled, draftConfig, draftMode, handleConfigPickerOpenChange, onOpenRunningBackgroundWorks, onSwitchMode, provider, runningSubagentCount, snapshot?.backgroundWorks, workspaceIdentity, workspacePath],
  );

  const isBlocked = blockingRequestId !== null;

  return (
    <div
      data-testid={COMPOSER_REGION_TESTID}
      data-input-routing={inputRoutingMode}
      aria-hidden={isBlocked ? true : undefined}
      style={isBlocked ? { display: "none" } : undefined}
      className={cn("chat-composer-region z-20 w-full shrink-0 @container/composer", centered && "max-w-2xl") as string}
    >
      {/* 隐藏的附件文件选择器 */}
      <input
        ref={whiteboardScope.attachmentInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={whiteboardScope.handleAttachmentInputChange}
      />
      {displayError ? (
        <div className="mb-6 w-full shrink-0">
          <ChatErrorBanner error={displayError} onDismiss={onDismissError} onOpenModelSettings={onOpenModelSettings} onOpenUpgrade={onOpenModelUpgrade} />
        </div>
      ) : null}
      {/* 输入面（双层卡：有 contextHeader 时 rounded-2xl bg-surface shadow-xl/5） */}
      <div className={cn("chat-composer-input-surface w-full", contextHeader ? "rounded-2xl bg-surface shadow-xl/5" : undefined) as string}>
        {contextHeader ? (
          <div className="p-1.5 flex min-w-0 flex-wrap items-center gap-0">{contextHeader}</div>
        ) : null}
        {selectionLimitReason ? (
          <div
            role="alert"
            className="mb-2 w-full rounded-lg border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 px-3 py-2 text-ui-base text-foreground"
          >
            {intl.formatMessage({ id: `chat.selections.limit.${selectionLimitReason}` })}
          </div>
        ) : null}
        <ComposerInput
          workspacePath={workspacePath}
          workspaceIdentity={workspaceIdentity}
          taskId={sessionId}
          placeholder={placeholder}
          disabled={disabled || inputRoutingMode === "reject"}
          submitting={submitting}
          submitDisabled={submitting || !canSubmitNow || !attachmentsReady}
          allowSubmitWhenEmpty={hasCodeComments || hasAttachments || hasWebContexts || hasPptxReferences || hasConversationSelections}
          enterSubmits={enterSubmits}
          submitLabel={submitLabel}
          showSlashButton
          showMentionButton
          topContent={topContent}
          attachmentAction={attachmentAction}
          inputTestId={COMPOSER_INPUT_TESTID}
          inputApiRef={inputApiRef as unknown as { current: ComposerEditorApi | null }}
          promptHistory={promptHistory}
          avoidIosInputFocusZoom={avoidIosInputFocusZoom}
          compactPlaceholder={compactNewTask}
          excludedSlashCommandNames={suppressGoalCommands ? ["goal"] : undefined}
          appSlashCommands={appSlashCommands as AppSlashCommand[]}
          enableMentionPanel
          leadingActions={leadingActions}
          submitControl={submitControl}
          className="p-0"
          onChange={handleTextChange}
          onFocus={handleInputFocus}
          onSubmit={handleEditorSubmit}
          onWhiteboardMentionSelected={whiteboardScope.handleWhiteboardMentionSelected}
          onPaste={whiteboardScope.handlePaste}
        />
        {whiteboardScope.attachmentError ? (
          <p className="flex items-start gap-2 p-3 text-ui-base text-warning">
            <IconInfo className="mt-0.5 size-4 shrink-0" />
            <span>{whiteboardScope.attachmentError}</span>
          </p>
        ) : null}
      </div>
      {/* 附件预览对话框 */}
      <AttachmentPreviewDialog
        attachment={previewAttachment}
        open={previewAttachment !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewAttachment(null);
        }}
      />
      {/* 队列发送确认对话框（有暂留队列项时二次确认：清空并发送 / 保留并发送） */}
      <Dialog
        open={queueConfirmState !== null}
        onOpenChange={(open) => {
          if (!open && !submitInFlightRef.current) setQueueConfirmState(null);
        }}
      >
        <DialogContent data-testid={PAUSED_QUEUE_SEND_DIALOG_TESTID} showCloseButton={false} className="max-w-xl gap-6 rounded-3xl p-6 sm:p-8">
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-md"
              disabled={submitting}
              aria-label={intl.formatMessage({ id: "common.close" })}
              className="absolute top-4 right-4"
            >
              <IconClose className="size-5" />
            </Button>
          </DialogClose>
          <DialogHeader className="gap-3 pr-8">
            <DialogTitle className="text-xl font-semibold sm:text-2xl">
              {intl.formatMessage({ id: "chat.queue.sendConfirm.title" })}
            </DialogTitle>
            <DialogDescription className="text-ui-base sm:text-ui-lg">
              {intl.formatMessage({ id: "chat.queue.sendConfirm.description" }, { count: String(queueConfirmState?.queueItemIds.length ?? 0) })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 sm:gap-3">
            <Button
              type="button"
              variant="destructive"
              size="lg"
              data-testid={CLEAR_QUEUE_SEND_TESTID}
              disabled={submitting}
              className="min-w-32 rounded-full"
              onClick={handleClearQueueAndSend}
            >
              {intl.formatMessage({ id: "chat.queue.sendConfirm.clear" })}
            </Button>
            <Button
              type="button"
              size="lg"
              data-testid={KEEP_QUEUE_SEND_TESTID}
              disabled={submitting}
              className="min-w-32 rounded-full"
              onClick={handleKeepQueueAndSend}
            >
              {submitting ? <Spinner className="size-4" /> : null}
              {intl.formatMessage({ id: "chat.queue.sendConfirm.keep" })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** 原 hit 的 memo 导出（js 91174：`var git = (0, Q.memo)(hit)`） */
export const DraftComposerRegionMemo = React.memo(DraftComposerRegion);

/* --- 5.2 hit 内的两个小推导函数（原文件其他位置，随族登记） --- */

/** 原 oit：配置选择器开合合并（作用域内单开） */
function mergeConfigPickerState(current: ComposerConfigPicker, picker: ComposerConfigPicker, open: boolean): ComposerConfigPicker {
  return open ? picker : current === picker ? null : current;
}

/**
 * 原 ZYe（js 67422）：placeholder 文案 key 选择：
 * 有历史消息+处理中 → chat.placeholder.followUpQueue；有历史消息 → followUpAsk；
 * 远控窄视口新任务 → newTaskMobile；否则 → chat.placeholder.newTask（spec §5：
 * 「向 ZCode 提问，使用 @ 添加上下文，使用 / 选择命令或能力」）
 */
export function resolveComposerPlaceholderI18nId({
  hasHistoryMessages,
  isTaskProcessing,
  compactNewTask = false,
}: {
  hasHistoryMessages: boolean;
  isTaskProcessing: boolean;
  compactNewTask?: boolean;
}): string {
  if (hasHistoryMessages) return isTaskProcessing ? "chat.placeholder.followUpQueue" : "chat.placeholder.followUpAsk";
  return compactNewTask ? "chat.placeholder.newTaskMobile" : "chat.placeholder.newTask";
}

/* ============================================================================
 * 6. 接口保留清单（属其他族 / 体量大，未逐行展开；行号见 MODULE-MAP.md）
 *    - ZV  ComposerInput            F08 根组件（js 66959–~69297）：Lexical 引擎、
 *      提及节点、斜杠面板挂载、工具条布局
 *    - KJe MentionSelector          F08（js 65605）：@→files/plugins、#→sessions、
 *      $→skills 的 Lexical 接线（段数据钩子 AJe/WJe/HJe/PJe/Nqe）
 *    - SJe SlashPanel               F08（js 65002）：/→commands/skills/subagents
 *    - ait/Zrt/iZe 工具条           F08/F12（js 89455/89295/69225）
 *    - TH/lit/JH/uit chip 行        F08（js 68250/89941/68988/90039）
 *    - vN/yN/bN/xN/SN/DN 附件件     F08（js 54555–54830）
 *    - fOt RemoteWizardDialog       F10（js 128093–128525）
 *    - zZ  GitBranchChip            TopBar 族（contextHeader 右件，已还原）
 *    - R0    ConversationPane       F03（js 119219）：draft 态装配现场
 *    - yJt   WorkspaceShell         F07（js 183896）：contextHeader 组装（184540–184577）
 *    - Dqe/kqe/jqe 建议文案数据     F08（js 63845–63975）：官方插件技能文案
 *      （地图备注称「建议卡文案数据」；实际消费方是提及面板技能段，非 3 张模板卡）
 * ============================================================================
 */
