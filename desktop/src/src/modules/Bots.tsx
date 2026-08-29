/* eslint-disable */
/**
 * ============================================================================
 * Bots.tsx — F11 Bots 族逐字重建（B5-04 批次 · 解混淆重建）
 * ============================================================================
 *
 * 来源文件（融合 chunk，213,979 行本机口径，未改动）：
 *   /Users/mac/nofy-build/desktop/src/out/renderer/assets/styles-CdEGpc2x.js
 * 对照文件（同一 chunk 的 pretty-print 版）：
 *   /Users/mac/nofy-build/desktop/src/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx
 * 登记：MODULE-MAP §F11、COVERAGE-LEDGER §c.1 #8（147767–149553，~1,790 行，未抽取）。
 *
 * 行号口径：本机 js 行（主口径）/ jsx 行（对照）。本机文件较旧账（213,695 行）
 * 在 B 段整体偏移 +46（CLt 旧 147767 → 本机 147813），见 PaymentBots.report.md §2。
 *
 * 范围裁决（见报告 §3）：
 *  - 起点前扩 41 行：vLt/yLt/bLt/xLt/SLt（本机 147772–147812）为 Bots 域数据表
 *    （供应商目录/回复粒度），旧账 F11 起点 147767=CLt 未含；无他族认领，纳入本件。
 *  - 尾段 YLt…nRt（本机 149479–149599）语义属 F17（webRemoteControl.*），
 *    行号落在 F11 段内，按「整段」口径纳入本件并双归属注记（rRt 消费，B5-05）。
 *  - hLt/gLt/_Lt（Avatar 原语，147744–147771）属横切原语，不纳入。
 *  - rRt（149600 起，WebRemote 对话框）属 F17/B5-05，不纳入。
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号格式：js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 *  域数据表（旧账起点前扩段）：
 *   vLt → BOT_PROVIDERS                 8 供应商目录（implemented 标记）(147772 / 122849)
 *   yLt → REPLY_GRANULARITY_OPTIONS     4 回复粒度选项 (147782 / 122866 区)
 *   bLt → DEFAULT_REPLY_GRANULARITY     yLt[0] (147804)
 *   xLt → replyGranularityOptionsOf     Wne(provider) ∩ yLt (147805)
 *   SLt → resolveReplyGranularity       选中 ?? 首项 ?? 缺省 (147809)
 *  区域/入口助手：
 *   CLt → regionTagKeyOfProvider        lark→zai / feishu→bigmodel 标签键 (147813 / 122908)
 *   wLt → workspaceLabelOf              trim 非空优先 (147823)
 *   TLt → resolveEntryIntent            已配→select / 未配→create (147826)
 *  图标/常量：
 *   ELt/DLt/OLt/kLt/ALt/jLt → discord/dingding/feishu/telegram/wecom/weixin 图标 URL (147830)
 *   MLt → BIND_CODE_TTL_MS              = See（跨 chunk 常量）(147836)
 *   NLt → TELEGRAM_BOTFATHER_URL        `https://t.me/BotFather` (147837)
 *   PLt → isAllWorkspaces               空或含 `*` (147838)
 *   g8  → nonEmptyOr                    trim 非空优先 (147841)
 *   _8  → BotProviderIcon               7 图标分派 + webhook/log-in 回退 (147844)
 *  运行态助手：
 *   FLt → runtimeStatusTextOf           messageId→i18n / message / status / enabled|disabled (147870)
 *   ILt → runtimeDotClassOf             error→destructive / polling|connected→success (147875)
 *   LLt → formatSecondsCeil             `NNs` 向上取整 (147884)
 *   RLt → defaultAllowedCommands        7 命令开关全 true (147887)
 *  视图件：
 *   zLt → BotHeaderRow                  图标+名称(内联重命名)+运行态+启用开关 (147890 / 122972)
 *   BLt → BotReplyGranularityRow        回复粒度 Select (148005 / 123029)
 *   VLt → BotDeleteRow                  删除行 (148030 / 123055 区)
 *   v8  → BotDetailCard                 rounded-lg bg-background p-3 (148046)
 *   HLt → TelegramBotFatherCredentialCard BotFather QR + token 输入 + 保存 (148049 / 123082)
 *   ULt → BotCredentialSection          凭据/绑定码/飞书注册/微信注册 四路状态机 (148125 / 123116)
 *   WLt → BotAllowedWorkspacesRow       all/selected + 工作区勾选列表 (148500 / 123254)
 *  根与模型：
 *   GLt → emptyBotsConfig               {version:2,bots:[]} (148604)
 *   KLt → newBotOfProvider              新 Bot 骨架 (148607)
 *   qLt → BotsDialog                    根对话框 (148619 / 123319)
 *  尾段（F17 语义双归属，行号在 F11 段内）：
 *   JLt → REMOTE_PAIRING_PROVIDERS      weixin/feishu/lark/telegram (149473)
 *   YLt → isWorkspaceControlActiveFor   工作区键匹配+会话存在 (149479)
 *   XLt → hasWindowControlSession       mobileConnected+会话 (149490)
 *   ZLt → remoteControlStatusLabelOf    6 态 (149495)
 *   QLt → remoteControlStatusDetailOf   6 态 (149511)
 *   $Lt → remoteControlDotClassOf       4 色 (149527)
 *   eRt → remoteControlDeviceTagOf      设备名/phone/ready 回退 (149536)
 *   tRt → remoteControlStatesEqual      18 字段相等 (149549)
 *   nRt → remoteControlFailureMessageOf 11 失败原因 (149571)
 * ============================================================================
 */
import * as React from "react";
/* ── tombstone（A0-S2d）：原 `import { workspaceKeyOf } from './CodeViewer'` 已删除——
 *    唯一消费点在 §6 重复转录段（149473–149599，canonical 在 WebRemote.tsx），
 *    随段删除后无引用（该接线本身即错配：签名 (string, string?) 与调用面不符）。 ── */
import { Spinner } from './Home';
import { Input, isComposingText, toast } from './ImeComposition';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SettingsRow, SettingsSectionCard, Switch } from './Settings';
import { logger } from './SkillStore';
import { useBaseServices } from './services';
/* ── A0-S2d 接线：src-HCld2afU 跨 chunk 导入（别名经 styles 617–780 导入块核验）；混淆名注释随迁 ── */
import {
  isFeishuOrLark as isFeishuFamilyProvider, // src-HCld2afU.js：`ns as yi` —— provider 属飞书系（feishu|lark）
  availableReplyModesForProvider as replyModeIdsOfProvider, // src-HCld2afU.js：`ts as Wne` —— provider 可用回复粒度 id 集
  DEFAULT_BOT_REPLY_MODE as REPLY_MODE_DEFAULTS, // src-HCld2afU.js：`es as ote` —— 回复粒度缺省（原注「缺省序表」为误注，实体为单值常量）
  resolveBotReplyMode as defaultReplyModeOf, // src-HCld2afU.js：`rs as Mne` —— provider 缺省回复粒度
  BOTS_STREAM_TIMEOUT_MS as BIND_CODE_TTL_MS // 跨 chunk 常量 `Zo as See` —— 绑定码 TTL（ms）
} from './SrcSharedA';
import { generateUuid as generateUniqueId } from './SrcSharedB'; // src-HCld2afU.js：`ot as xi` —— 随机 id 生成
import { useConfirmDialog } from './Modals'; // Modals 域确认对话框钩子（原 U2，123510）
/* ── A0-D-Misc 接线：域内可用属主（cn→UtilsCn、Button→button、useZCodeIntl→I18n） ── */
import { cn } from './UtilsCn'; // utils-CEEH0K_K.js：`Z` 类名合并
import { Button } from './button'; // button-laUijeDG.js：`X`
import { useZCodeIntl } from './I18n'; // IntlProvider：`G` useZCodeIntl

/* ----------------------------------------------------------------------------
 * §0 外部依赖声明（跨 chunk / 横切，接口级）
 * -------------------------------------------------------------------------- */

/** imeComposition：`P` Input / `M` Spinner / `l` usePlatformService / `A` IME 回车守卫 / `m` toast */
declare const usePlatformService: () => { openExternal(url: string): void };
/** A0-D-Misc 类型收敛：BaseServices 索引签名为 unknown，按 BotsDialog 调用面收敛 botsService。 */
interface BotsServiceLike {
  getConfig(): Promise<BotsConfig>;
  getStatus(): Promise<BotsStatus>;
  listWorkspaceRefs(args: { currentWorkspace?: unknown }): Promise<WorkspaceRef[]>;
  getBotStates(): Promise<BotState[]>;
  saveBot(args: { bot: Bot; credentialValue?: unknown }): Promise<Bot>;
  createBindCode(args: { botId: string; ttlMs: number; allowedWorkspaces?: unknown }): Promise<{ code: string; expiresAt: number }>;
  pollFeishuRegistration(args: Record<string, unknown>): Promise<any>;
  pollWeixinRegistration(args: { qrCode?: unknown }): Promise<any>;
  beginFeishuRegistration(args: { domain?: unknown }): Promise<any>;
  beginWeixinRegistration(): Promise<any>;
  resetBotState(botId: string): Promise<unknown>;
  removeBotSecret(botId: string): Promise<Bot>;
  deleteBot(botId: string): Promise<unknown>;
}
/** logger-PFDwl5Yq.js：`J` */
/** Settings.tsx 行式原语：`U3` SettingsRow / `W3` SectionCard（135351/135380，已随 Settings 族重建） */
/** 本 chunk 横切原语：Dialog/Select/Switch（28021–32245 封装块，接口级） */
declare const DialogRoot: React.FC<{ open?: boolean; onOpenChange?: (open: boolean) => void; children?: React.ReactNode }>;
declare const DialogContent: React.FC<{
  className?: string;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  children?: React.ReactNode;
}>;
declare const DialogHeader: React.FC<{ children?: React.ReactNode }>;
declare const DialogTitle: React.FC<{ className?: string; children?: React.ReactNode }>;
declare const DialogDescription: React.FC<{ className?: string; children?: React.ReactNode }>;
/** 图标块（26575–28020，lucide vendored）：本族用到的 12 个 */
declare const BotIcon: React.FC<React.SVGProps<SVGSVGElement>>; // D_
declare const WebhookIcon: React.FC<React.SVGProps<SVGSVGElement>>; // Lbe
declare const LinkIcon: React.FC<React.SVGProps<SVGSVGElement>>; // B_
declare const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>>; // Kv
declare const SaveIcon: React.FC<React.SVGProps<SVGSVGElement>>; // Hye
declare const UnlinkIcon: React.FC<React.SVGProps<SVGSVGElement>>; // Abe
declare const ExternalLinkIcon: React.FC<React.SVGProps<SVGSVGElement>>; // q_
declare const QrCodeIcon: React.FC<React.SVGProps<SVGSVGElement>>; // dbe
declare const AlertCircleIcon: React.FC<React.SVGProps<SVGSVGElement>>; // F_
declare const CopyIcon: React.FC<React.SVGProps<SVGSVGElement>>; // W_
declare const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>>; // M_
declare const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>>; // kv

/* ── tombstone（A0-S2d）：yi/Wne/ote/Mne/xi/See/U2 七件 declare 已删除，
 *    canonical：SrcSharedA（isFeishuOrLark / availableReplyModesForProvider /
 *    DEFAULT_BOT_REPLY_MODE / resolveBotReplyMode / BOTS_STREAM_TIMEOUT_MS）、
 *    SrcSharedB（generateUuid）、Modals（useConfirmDialog），经文件头真实 import 消费。
 *    原 `c as ei`（工作区稳定键）挂注随 §6 重复转录段删除（canonical = SrcSharedB
 *    webRemoteWorkspaceKey，消费面在 WebRemote）。 ── */
/** vendored qrcode 库（本 chunk 78456–79690，VENDOR 登记不转录）：toDataURL */
declare const qrcode: {
  toDataURL(text: string, opts: { margin: number; width: number }): Promise<string>;
};

interface BotsService {
  getConfig(): Promise<BotsConfig>;
  getStatus(): Promise<BotsStatus>;
  listWorkspaceRefs(opts: { currentWorkspace: WorkspaceRef }): Promise<WorkspaceRef[]>;
  getBotStates(): Promise<BotState[]>;
  saveBot(opts: { bot: Bot; credentialValue?: string }): Promise<Bot>;
  createBindCode(opts: {
    botId: string;
    ttlMs: number;
    allowedWorkspaces: string[];
  }): Promise<{ code: string; expiresAt: number }>;
  pollFeishuRegistration(opts: {
    deviceCode: string;
    domain: string;
    pollDomain: string;
  }): Promise<FeishuRegistrationPollResult>;
  pollWeixinRegistration(opts: { qrCode: string }): Promise<WeixinRegistrationPollResult>;
  beginFeishuRegistration(opts: { domain: string }): Promise<FeishuRegistrationStart>;
  beginWeixinRegistration(): Promise<WeixinRegistrationStart>;
  removeBotSecret(botId: string): Promise<Bot>;
  resetBotState(botId: string): Promise<unknown>;
  deleteBot(botId: string): Promise<unknown>;
}

interface Bot {
  id: string;
  name: string;
  provider: string;
  enabled: boolean;
  allowedWorkspaces: string[];
  allowedCommands: Record<string, boolean>;
  currentOptions: Record<string, unknown>;
  replyMode: string;
  providerUserId?: string;
  displayName?: string;
  credentialRef?: string;
  webhookUrl?: string;
  webhookAuthHeaderName?: string;
  feishuAppId?: string;
}
interface BotsConfig { version: number; bots: Bot[] }
interface BotRuntime {
  botId: string;
  status?: string;
  message?: string;
  messageId?: string;
}
interface BotsStatus { botRuntime: BotRuntime[] }
interface WorkspaceRef {
  id: string;
  label: string;
  workspacePath: string;
  workspaceIdentity?: string | null;
}
interface BotState { botId: string; weixinActivatedAt?: number | null }
interface BindCodeState {
  botId: string;
  code: string;
  createdAt: number;
  expiresAt: number;
  ttlMs: number;
}
interface FeishuRegistrationState {
  botId: string;
  deviceCode: string;
  qrUrl: string;
  qrDataUrl: string | null;
  userCode: string;
  interval: number;
  expiresAt: number;
  domain: string;
  pollDomain: string;
  status: string;
  message?: string;
}
interface WeixinRegistrationState {
  botId: string;
  qrCode: string;
  qrUrl: string;
  qrDataUrl: string | null;
  interval: number;
  expiresAt: number;
  status: string;
  message?: string;
}
interface FeishuRegistrationStart {
  deviceCode: string;
  qrUrl: string;
  userCode: string;
  interval: number;
  expiresAt: number;
  domain: string;
  pollDomain: string;
}
interface FeishuRegistrationPollResult {
  status: string;
  interval?: number;
  domain?: string;
  pollDomain?: string;
  appName?: string;
  appId?: string;
  appSecret?: string;
  message?: string;
}
interface WeixinRegistrationStart {
  qrCode: string;
  qrUrl: string;
  interval: number;
  expiresAt: number;
}
interface WeixinRegistrationPollResult {
  status: string;
  interval?: number;
  botId?: string;
  botToken?: string;
  message?: string;
}
type FormatMessage = (desc: { id: string }, values?: Record<string, string | number>) => string;

/* ----------------------------------------------------------------------------
 * §1 域数据表（原 vLt/yLt/bLt/xLt/SLt，147772–147812 / jsx 122849 区）
 * -------------------------------------------------------------------------- */

/** 原 vLt（147772 / 122849）：Bot 供应商目录（implemented = 3.7.6 已实现） */
export const BOT_PROVIDERS = [
  { id: `weixin`, label: `Weixin`, implemented: !0 },
  { id: `feishu`, label: `Feishu`, implemented: !0 },
  { id: `lark`, label: `Lark`, implemented: !0 },
  { id: `telegram`, label: `Telegram`, implemented: !0 },
  { id: `dingding`, label: `DingTalk`, implemented: !1 },
  { id: `discord`, label: `Discord`, implemented: !1 },
  { id: `wecom`, label: `WeCom`, implemented: !1 },
  { id: `webhook`, label: `Webhook`, implemented: !0 },
];

/** 原 yLt（147782）：回复粒度选项表 */
export const REPLY_GRANULARITY_OPTIONS = [
  {
    id: `assistant_changes`,
    labelId: `bots.replyGranularity.assistantChanges`,
    descriptionId: `bots.replyGranularity.assistantChanges.description`,
  },
  {
    id: `assistant_toolcalls_changes`,
    labelId: `bots.replyGranularity.assistantToolcallsChanges`,
    descriptionId: `bots.replyGranularity.assistantToolcallsChanges.description`,
  },
  {
    id: `summary_changes`,
    labelId: `bots.replyGranularity.summaryChanges`,
    descriptionId: `bots.replyGranularity.summaryChanges.description`,
  },
  {
    id: `streaming_card`,
    labelId: `bots.replyGranularity.streamingCard`,
    descriptionId: `bots.replyGranularity.streamingCard.description`,
  },
];

/** 原 bLt（147804）：缺省回复粒度 */
export const DEFAULT_REPLY_GRANULARITY = REPLY_GRANULARITY_OPTIONS[0];

/** 原 xLt（147805）：provider 可用回复粒度选项 */
export function replyGranularityOptionsOf(provider: string) {
  const allowed = new Set(replyModeIdsOfProvider(provider));
  return REPLY_GRANULARITY_OPTIONS.filter((option) => allowed.has(option.id));
}

/** 原 SLt（147809）：解析当前回复粒度（选中 ?? 首项 ?? 缺省） */
export function resolveReplyGranularity(provider: string, replyMode: string) {
  const options = replyGranularityOptionsOf(provider);
  return options.find((option) => option.id === replyMode) ?? options[0] ?? DEFAULT_REPLY_GRANULARITY;
}

/* ----------------------------------------------------------------------------
 * §2 区域/入口助手（原 CLt/wLt/TLt，147813–147829 / jsx 122908 区）
 * -------------------------------------------------------------------------- */

/** 原 CLt（147813 / 122908）：login.oauth 区域标签键（lark→zai / feishu→bigmodel） */
export function regionTagKeyOfProvider(provider: string): string | null {
  switch (provider) {
    case `lark`:
      return `login.oauth.regionTag.zai`;
    case `feishu`:
      return `login.oauth.regionTag.bigmodel`;
    default:
      return null;
  }
}

/** 原 wLt（147823）：工作区标签（identity trim 非空优先） */
export function workspaceLabelOf(workspacePath: string, workspaceIdentity?: string | null): string {
  return workspaceIdentity?.trim() || workspacePath;
}

/** 原 TLt（147826）：入口意图（已有该 provider Bot → select，否则 create） */
export function resolveEntryIntent(
  bots: Bot[],
  provider: string,
): { mode: "select"; botId: string } | { mode: "create"; provider: string } {
  const existing = bots.find((bot) => bot.provider === provider);
  return existing ? { mode: `select`, botId: existing.id } : { mode: `create`, provider };
}

/* ----------------------------------------------------------------------------
 * §3 图标/常量/运行态助手（原 ELt…RLt，147830–147889）
 * -------------------------------------------------------------------------- */

/** 原 ELt…jLt（147830–147835）：通道图标资源 */
export const DISCORD_ICON_URL = `` + new URL(`icon-discord@2x-D9OBPr5g.png`, import.meta.url).href;
export const DINGDING_ICON_URL = `` + new URL(`icon-dingding@2x-CnYjVOCa.png`, import.meta.url).href;
/** 飞书图标为内联资源占位（源即 `[image content will be provided separately]`） */
export const FEISHU_ICON_URL = `[image content will be provided separately]`;
export const TELEGRAM_ICON_URL = `` + new URL(`icon-telegram@2x-Cax3aaF9.png`, import.meta.url).href;
export const WECOM_ICON_URL = `` + new URL(`icon-wecom@2x-BZVgmBph.png`, import.meta.url).href;
export const WEIXIN_ICON_URL = `` + new URL(`icon-weixin@2x-Bp9EqCCA.png`, import.meta.url).href;
/** 原 MLt（147836）：绑定码 TTL = 跨 chunk 常量 See */
export const BIND_CODE_TTL = BIND_CODE_TTL_MS;
/** 原 NLt（147837）：Telegram BotFather 地址 */
export const TELEGRAM_BOTFATHER_URL = `https://t.me/BotFather`;

/** 原 PLt（147838）：允许工作区=全部（空或含 `*`） */
export function isAllWorkspaces(allowed: string[]): boolean {
  return allowed.length === 0 || allowed.includes(`*`);
}

/** 原 g8（147841）：trim 非空优先 */
export function nonEmptyOr(value: string, fallback: string): string {
  return value.trim() || fallback;
}

/** 原 _8（147844）：通道图标分派（7 资源 + webhook/log-in 回退） */
export function BotProviderIcon({ provider, className }: { provider: string; className?: string }) {
  const src =
    provider === `telegram`
      ? TELEGRAM_ICON_URL
      : provider === `weixin`
        ? WEIXIN_ICON_URL
        : provider === `feishu` || provider === `lark`
          ? FEISHU_ICON_URL
          : provider === `dingding`
            ? DINGDING_ICON_URL
            : provider === `discord`
              ? DISCORD_ICON_URL
              : provider === `wecom`
                ? WECOM_ICON_URL
                : null;
  return src ? (
    <img src={src} alt="" aria-hidden="true" className={cn(`size-4 object-contain`, className)} />
  ) : provider === `webhook` ? (
    <WebhookIcon className={cn(`size-4`, className)} />
  ) : (
    <BotIcon className={cn(`size-4`, className)} />
  );
}

/** 原 FLt（147870）：运行态文案（messageId→i18n / message / status / enabled|disabled） */
export function runtimeStatusTextOf(
  runtime: BotRuntime | null | undefined,
  enabled: boolean,
  formatMessage?: FormatMessage,
): string {
  return runtime?.messageId && formatMessage
    ? formatMessage({ id: runtime.messageId })
    : (runtime?.message ?? runtime?.status ?? (enabled ? `enabled` : `disabled`));
}

/** 原 ILt（147875）：运行态圆点配色 */
export function runtimeDotClassOf(runtime: BotRuntime | null | undefined, enabled: boolean): string {
  return runtime?.status === `error`
    ? `bg-destructive`
    : runtime?.status === `polling` || runtime?.status === `connected`
      ? `bg-success`
      : enabled
        ? `bg-foreground-subtle`
        : `bg-border`;
}

/** 原 LLt（147884）：毫秒 → `NNs`（秒向上取整，钳 0） */
export function formatSecondsCeil(ms: number): string {
  return `${Math.max(0, Math.ceil(ms / 1e3))}s`;
}

/** 原 RLt（147887）：新 Bot 命令允许缺省（7 项全 true） */
export function defaultAllowedCommands(): Record<string, boolean> {
  return { status: !0, new: !0, workspace: !0, model: !0, mode: !0, thoughtLevel: !0, reply: !0 };
}

/* ----------------------------------------------------------------------------
 * §4 视图件（原 zLt/BLt/VLt/v8/HLt/ULt/WLt，147890–148603 / jsx 122972–123318）
 * -------------------------------------------------------------------------- */

/** 原 zLt（147890 / 122972）：Bot 头行（图标+名称内联重命名+运行态+启用开关） */
export function BotHeaderRow(props: {
  bot: Bot;
  runtime: BotRuntime | null | undefined;
  selectedBotDisplayName: string;
  selectedBotName: string;
  fallbackBotName: string;
  renaming: boolean;
  onStartRename: () => void;
  onCommitNameDraft: () => void;
  onNameDraftChange: (value: string) => void;
  onNameCompositionEnd: () => void;
  onNameCompositionStart: () => void;
  onNameInputKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onPatchBot: (patch: Partial<Bot>) => void;
}) {
  const { intl } = useZCodeIntl();
  const measureRef = React.useRef<HTMLButtonElement>(null);
  const [measureWidth, setMeasureWidth] = React.useState<number | null>(null);
  const bound = !!props.bot.providerUserId;
  const statusText =
    props.runtime?.status === `error`
      ? intl.formatMessage({
          id:
            props.bot.provider === `feishu`
              ? `bots.runtime.feishuConnectionFailed`
              : props.bot.provider === `lark`
                ? `bots.runtime.larkConnectionFailed`
                : `bots.runtime.connectionFailed`,
        })
      : bound
        ? runtimeStatusTextOf(props.runtime, props.bot.enabled, (desc) => intl.formatMessage(desc))
        : intl.formatMessage({ id: `bots.unbound` });
  const measuredName = props.selectedBotName || props.fallbackBotName;
  React.useLayoutEffect(() => {
    if (!props.renaming) {
      setMeasureWidth(null);
      return;
    }
    const node = measureRef.current;
    if (!node) return;
    const measure = () => {
      setMeasureWidth(Math.ceil(node.getBoundingClientRect().width));
    };
    measure();
    const observer = new ResizeObserver(measure);
    return (observer.observe(node), () => observer.disconnect());
  }, [measuredName, props.renaming]);
  const nameBlock = (
    <div className={`min-w-0`}>
      {props.renaming ? (
        <label
          className={`relative inline-block min-w-6 max-w-md align-middle`}
          style={measureWidth ? { width: `${measureWidth}px` } : void 0}
        >
          <span className={`sr-only`}>{intl.formatMessage({ id: `bots.name` })}</span>
          <button
            ref={measureRef}
            type={`button`}
            tabIndex={-1}
            aria-hidden={`true`}
            className={`pointer-events-none absolute left-0 top-0 invisible max-w-md overflow-hidden rounded-sm px-1 text-left text-ui-lg font-medium`}
            style={{ whiteSpace: `pre` }}
          >
            {measuredName}
          </button>
          <input
            autoFocus={!0}
            className={`w-full min-w-0 truncate rounded-sm border-0 bg-transparent px-1 py-0 text-left text-ui-lg font-medium leading-normal text-foreground outline-none hover:bg-hover focus-visible:ring-1 focus-visible:ring-input-border-focused`}
            value={props.selectedBotName}
            onBlur={props.onCommitNameDraft}
            onChange={(event) => props.onNameDraftChange(event.target.value)}
            onCompositionEnd={props.onNameCompositionEnd}
            onCompositionStart={props.onNameCompositionStart}
            onFocus={(event) => event.currentTarget.select()}
            onKeyDown={props.onNameInputKeyDown}
            placeholder={props.fallbackBotName}
          />
        </label>
      ) : (
        <button
          type={`button`}
          className={`min-w-0 max-w-md truncate rounded-sm px-1 text-left text-ui-lg font-medium hover:bg-hover focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-input-border-focused`}
          onClick={props.onStartRename}
          onKeyDown={(event) => {
            event.key === `Enter` && props.onStartRename();
          }}
        >
          {props.selectedBotDisplayName}
        </button>
      )}
    </div>
  );
  const statusBlock = (
    <span className={`inline-flex items-center gap-2 text-foreground-subtle`}>
      {bound || props.runtime?.status === `error` ? (
        <span className={cn(`size-1.5 rounded-full`, runtimeDotClassOf(props.runtime, props.bot.enabled))} />
      ) : (
        <LinkIcon className={`size-3 text-foreground-subtle`} />
      )}
      {statusText}
    </span>
  );
  return (
    <div className={`flex items-center gap-3 pb-2 px-2`}>
      <BotProviderIcon provider={props.bot.provider} className={`size-12 shrink-0 text-foreground-subtle`} />
      <div className={`min-w-0 flex-1 space-y-1`}>
        {nameBlock}
        {statusBlock}
      </div>
      <div className={`shrink-0`}>
        <Switch checked={props.bot.enabled} onCheckedChange={(enabled) => props.onPatchBot({ enabled })} />
      </div>
    </div>
  );
}

/** 原 BLt（148005 / 123029）：回复粒度行 */
export function BotReplyGranularityRow({ bot, onPatchBot }: { bot: Bot; onPatchBot: (patch: Partial<Bot>) => void }) {
  const { intl } = useZCodeIntl();
  const options = replyGranularityOptionsOf(bot.provider);
  const current = resolveReplyGranularity(bot.provider, bot.replyMode);
  return (
    <SettingsRow
      label={intl.formatMessage({ id: `bots.replyGranularity` })}
      description={intl.formatMessage({ id: current.descriptionId })}
      control={
        <Select
          value={current.id}
          onValueChange={(value) => onPatchBot({ replyMode: value })}
        >
          <SelectTrigger size={`lg`} className={`w-48 justify-between`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {intl.formatMessage({ id: option.labelId })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
    />
  );
}

/** 原 VLt（148030）：删除行 */
export function BotDeleteRow({ onDelete }: { onDelete: () => void }) {
  const { intl } = useZCodeIntl();
  return (
    <SettingsSectionCard>
      <SettingsRow
        label={intl.formatMessage({ id: `bots.delete` })}
        description={intl.formatMessage({ id: `bots.delete.description` })}
        control={
          <Button
            variant={`destructive`}
            size={`lg`}
            onClick={onDelete}
            title={intl.formatMessage({ id: `bots.delete` })}
          >
            <TrashIcon className={`size-4`} />
            {intl.formatMessage({ id: `bots.delete` })}
          </Button>
        }
      />
    </SettingsSectionCard>
  );
}

/** 原 v8（148046）：详情卡壳 */
export function BotDetailCard({ children }: { children?: React.ReactNode }) {
  return <div className={`rounded-lg bg-background p-3`}>{children}</div>;
}

/** 原 HLt（148049 / 123082）：Telegram BotFather 凭据卡（QR + token 输入 + 保存） */
export function TelegramBotFatherCredentialCard(props: {
  credentialValue: string;
  secretSaving: boolean;
  onCredentialValueChange: (value: string) => void;
  onSaveSecret: () => void;
}) {
  const { intl } = useZCodeIntl();
  const [qrDataUrl, setQrDataUrl] = React.useState<string | null>(null);
  React.useEffect(() => {
    let cancelled = !1;
    return (
      qrcode
        .toDataURL(TELEGRAM_BOTFATHER_URL, { margin: 1, width: 220 })
        .then((url) => {
          cancelled || setQrDataUrl(url);
        })
        .catch((error) => {
          logger.error(
            `[BotsDialog] 生成 Telegram BotFather 二维码失败`,
            error instanceof Error ? error.message : String(error),
          );
        }),
      () => {
        cancelled = !0;
      }
    );
  }, []);
  return (
    <BotDetailCard>
      <div className={`flex flex-wrap items-start justify-center gap-4`}>
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt={intl.formatMessage({ id: `bots.telegramBotFatherQrAlt` })}
            className={`size-40 shrink-0 rounded-lg border border-border bg-surface p-2`}
          />
        ) : null}
        <div className={`min-w-52 flex-1 space-y-3 text-ui-base text-foreground-subtle`}>
          <div>{intl.formatMessage({ id: `bots.telegramBotFatherScanHint` })}</div>
          <div className={`rounded-md bg-surface px-2 py-1 font-mono text-foreground`}>@BotFather</div>
          <div className={`flex w-full min-w-0 items-center gap-2`}>
            <Input
              size={`lg`}
              type={`password`}
              value={props.credentialValue}
              onChange={(event) => props.onCredentialValueChange(event.target.value)}
              placeholder={intl.formatMessage({ id: `bots.credentialPlaceholder` })}
              className={`min-w-0 flex-1`}
              disabled={props.secretSaving}
            />
            <Button
              variant={`outline`}
              size={`lg`}
              onClick={props.onSaveSecret}
              disabled={props.secretSaving || !props.credentialValue.trim()}
            >
              {props.secretSaving ? (
                <Spinner className={`size-4 animate-spin`} />
              ) : (
                <SaveIcon className={`size-4`} />
              )}
              {intl.formatMessage({ id: `bots.saveSecret` })}
            </Button>
          </div>
        </div>
      </div>
    </BotDetailCard>
  );
}

/** 原 ULt（148125 / 123116）：凭据区（已绑定/Telegram/飞书微信注册/绑定码 四路状态机） */
export function BotCredentialSection(props: {
  bot: Bot;
  runtime: BotRuntime | null | undefined;
  credentialValue: string;
  bindCode: BindCodeState | null;
  bindExpired: boolean;
  bindRemainingMs: number;
  bindCountdownProgress: number;
  feishuRegistration: FeishuRegistrationState | null;
  feishuRegistrationLoading: boolean;
  weixinRegistration: WeixinRegistrationState | null;
  weixinRegistrationLoading: boolean;
  weixinActivated: boolean;
  secretSaving: boolean;
  onCredentialValueChange: (value: string) => void;
  onSaveSecret: () => void;
  onRemoveSecret: () => void;
  onOpenTelegramBotFather: () => void;
  onStartWeixinRegistration: () => void;
  onStartFeishuRegistration: () => void;
  onCreateBindCode: () => void;
  onUnbind: () => void;
  onCopyBindCommand: () => void;
}) {
  const { intl } = useZCodeIntl();
  if (props.bot.provider === `webhook`) return null;
  const hasSecret = !!props.bot.credentialRef;
  const feishuFamily = isFeishuFamilyProvider(props.bot.provider);
  const isWeixin = props.bot.provider === `weixin`;
  const bound = isWeixin ? hasSecret : !!props.bot.providerUserId;
  const connectionError = props.runtime?.status === `error`;
  const description =
    feishuFamily && connectionError
      ? intl.formatMessage({
          id: bound
            ? `bots.runtime.boundConnectionInterruptedDescription`
            : `bots.runtime.credentialsSavedConnectionFailedDescription`,
        })
      : intl.formatMessage({ id: `bots.botTokenDescription.${props.bot.provider}` });
  const feishuRegistrationActive = props.feishuRegistration?.botId === props.bot.id;
  const weixinRegistrationActive = props.weixinRegistration?.botId === props.bot.id;
  const bindCodeActive = props.bindCode?.botId === props.bot.id;
  let control: React.ReactNode = null;
  let detail: React.ReactNode = null;
  if (bound) {
    control = (
      <div className={`flex items-center justify-end gap-3`}>
        <span className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-ui-base text-foreground-subtle`}>
          <span className={cn(`size-2 rounded-full`, connectionError ? `bg-destructive` : `bg-success`)} />
          {intl.formatMessage({
            id: connectionError ? `bots.runtime.boundConnectionInterrupted` : `bots.connected`,
          })}
        </span>
        <Button variant={`outline`} size={`lg`} onClick={isWeixin ? props.onRemoveSecret : props.onUnbind}>
          <UnlinkIcon className={`size-4`} />
          {intl.formatMessage({ id: `bots.unbind` })}
        </Button>
      </div>
    );
    isWeixin &&
      !props.weixinActivated &&
      (detail = (
        <BotDetailCard>
          <div className={`text-ui-base text-foreground-subtle`}>
            {intl.formatMessage({ id: `bots.weixinActivationHint` })}
          </div>
        </BotDetailCard>
      ));
  } else if (props.bot.provider === `telegram` && !hasSecret) {
    control = (
      <Button variant={`outline`} size={`lg`} onClick={props.onOpenTelegramBotFather}>
        <ExternalLinkIcon className={`size-4`} />
        {intl.formatMessage({ id: `bots.openBotFather` })}
      </Button>
    );
    detail = (
      <TelegramBotFatherCredentialCard
        credentialValue={props.credentialValue}
        secretSaving={props.secretSaving}
        onCredentialValueChange={props.onCredentialValueChange}
        onSaveSecret={props.onSaveSecret}
      />
    );
  } else if ((feishuFamily && !hasSecret) || (isWeixin && !hasSecret)) {
    const loading = isWeixin ? props.weixinRegistrationLoading : props.feishuRegistrationLoading;
    control = (
      <Button
        variant={`outline`}
        size={`lg`}
        onClick={isWeixin ? props.onStartWeixinRegistration : props.onStartFeishuRegistration}
        disabled={loading}
      >
        {loading ? (
          <Spinner className={`size-4 animate-spin`} />
        ) : (
          <QrCodeIcon className={`size-4`} />
        )}
        {intl.formatMessage({ id: `bots.scanQrCode` })}
      </Button>
    );
  } else {
    control = (
      <div className={`flex w-full flex-wrap justify-end gap-2`}>
        {!bindCodeActive && !connectionError ? (
          <Button variant={`outline`} size={`lg`} onClick={props.onCreateBindCode}>
            {intl.formatMessage({ id: `bots.bind` })}
          </Button>
        ) : null}
        <Button variant={`outline`} size={`lg`} onClick={props.onRemoveSecret}>
          {intl.formatMessage({ id: `bots.removeSecret` })}
        </Button>
      </div>
    );
  }
  if (feishuFamily && connectionError) {
    const errorCode = props.runtime?.message?.match(/\b\d{7,}\b/)?.[0];
    detail = (
      <BotDetailCard>
        <div className={`flex items-start gap-2`}>
          <AlertCircleIcon className={`mt-0.5 size-4 shrink-0 text-destructive`} />
          <div className={`min-w-0 flex-1`}>
            <div className={`text-ui-base font-medium text-foreground`}>
              {intl.formatMessage({
                id: bound
                  ? props.bot.provider === `lark`
                    ? `bots.runtime.larkConnectionInterrupted`
                    : `bots.runtime.feishuConnectionInterrupted`
                  : props.bot.provider === `lark`
                    ? `bots.runtime.cannotConnectLark`
                    : `bots.runtime.cannotConnectFeishu`,
              })}
            </div>
            <div className={`mt-1 text-ui-base leading-5 text-foreground-subtle`}>
              {intl.formatMessage({
                id: bound
                  ? props.bot.provider === `lark`
                    ? `bots.runtime.larkConnectionRecoverySuggestion`
                    : `bots.runtime.feishuConnectionRecoverySuggestion`
                  : `bots.runtime.connectionBlocksBinding`,
              })}
            </div>
            <dl className={`mt-3 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-ui-base leading-5`}>
              {errorCode ? (
                <>
                  <dt className={`text-foreground-subtle`}>
                    {intl.formatMessage({ id: `bots.runtime.errorCode` })}
                  </dt>
                  <dd className={`min-w-0 break-all font-mono text-foreground`}>{errorCode}</dd>
                </>
              ) : null}
              <dt className={`text-foreground-subtle`}>
                {intl.formatMessage({ id: `bots.runtime.errorDetail` })}
              </dt>
              <dd className={`min-w-0 break-words text-foreground`}>
                {props.runtime?.message ?? intl.formatMessage({ id: `bots.runtime.unknownError` })}
              </dd>
            </dl>
          </div>
        </div>
      </BotDetailCard>
    );
  } else if (bindCodeActive && props.bindCode) {
    const bindCommand = `/bind ${props.bindCode.code}`;
    detail = (
      <BotDetailCard>
        <div className={`flex items-center justify-between gap-2`}>
          <div className={`min-w-0`}>
            <div className={`text-ui-base font-medium text-foreground`}>
              {intl.formatMessage({ id: `bots.bindCommand` })}
            </div>
            <div className={`mt-1 text-ui-base leading-5 text-foreground-subtle`}>
              {intl.formatMessage({ id: `bots.bindCommandGuide` })}
            </div>
          </div>
          <Button variant={`ghost`} size={`sm`} onClick={props.onCreateBindCode}>
            <QrCodeIcon className={`size-3`} />
            {intl.formatMessage({ id: `bots.setup.refreshBindCode` })}
          </Button>
        </div>
        <div className={`mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-md bg-surface px-2 py-1.5`}>
          <span
            className={cn(
              `min-w-0 break-all font-mono text-ui-base leading-5`,
              props.bindExpired ? `text-foreground-subtle` : `text-foreground`,
            )}
          >
            {bindCommand}
          </span>
          <Button
            variant={`ghost`}
            size={`sm`}
            onClick={props.onCopyBindCommand}
            disabled={props.bindExpired}
            title={intl.formatMessage({ id: `bots.copyBindCommand` })}
          >
            <CopyIcon className={`size-4`} />
            {intl.formatMessage({ id: `bots.copyBindCommand` })}
          </Button>
        </div>
        <ol className={`mt-2 list-decimal space-y-1 pl-4 text-ui-base leading-5 text-foreground-subtle`}>
          <li>{intl.formatMessage({ id: `bots.bindCommandStep.copy` })}</li>
          <li>{intl.formatMessage({ id: `bots.bindCommandStep.openChat` })}</li>
          <li>{intl.formatMessage({ id: `bots.bindCommandStep.send` })}</li>
        </ol>
        <div className={`mt-2 flex items-center gap-2 text-ui-base text-foreground-subtle`}>
          <LinkIcon className={`size-3`} />
          {props.bindExpired
            ? intl.formatMessage({ id: `bots.bindCodeExpired` })
            : intl.formatMessage({ id: `bots.bindCodeExpires` }, { time: formatSecondsCeil(props.bindRemainingMs) })}
        </div>
        <div className={`mt-2 h-1 overflow-hidden rounded-full bg-surface`}>
          <div
            className={cn(
              `h-full origin-left rounded-full transition-transform duration-300 ease-linear`,
              props.bindExpired
                ? `bg-border`
                : props.bindCountdownProgress <= 10
                  ? `bg-destructive`
                  : props.bindRemainingMs <= 1e4
                    ? `bg-warning`
                    : `bg-primary`,
            )}
            style={{ transform: `scaleX(${props.bindCountdownProgress / 100})` }}
          />
        </div>
      </BotDetailCard>
    );
  } else {
    feishuRegistrationActive && props.feishuRegistration
      ? (detail = (
          <BotDetailCard>
            <div className={`flex flex-wrap items-start justify-center gap-4`}>
              {props.feishuRegistration.qrDataUrl ? (
                <img
                  src={props.feishuRegistration.qrDataUrl}
                  alt={intl.formatMessage({ id: `bots.feishuRegistrationQrAlt` })}
                  className={`size-40 shrink-0 rounded-lg border border-border bg-surface p-2`}
                />
              ) : null}
              <div className={`min-w-52 flex-1 space-y-3 text-ui-base text-foreground-subtle`}>
                <div>
                  {intl.formatMessage({
                    id: `bots.feishuRegistrationScanHint.${props.feishuRegistration.domain}`,
                  })}
                </div>
                <div className={`rounded-md bg-surface px-2 py-1 font-mono text-foreground`}>
                  {props.feishuRegistration.userCode}
                </div>
                <div>
                  {props.feishuRegistration.status === `pending` ? (
                    <span className={`inline-flex items-center gap-1`}>
                      <Spinner className={`size-3 animate-spin`} />
                      {intl.formatMessage({ id: `common.loading` })}
                    </span>
                  ) : (
                    (props.feishuRegistration.message ??
                      intl.formatMessage({ id: `bots.feishuRegistration.${props.feishuRegistration.status}` }))
                  )}
                </div>
              </div>
            </div>
          </BotDetailCard>
        ))
      : weixinRegistrationActive &&
        props.weixinRegistration &&
        (detail = (
          <BotDetailCard>
            <div className={`flex flex-wrap items-start justify-center gap-4`}>
              {props.weixinRegistration.qrDataUrl ? (
                <img
                  src={props.weixinRegistration.qrDataUrl}
                  alt={intl.formatMessage({ id: `bots.weixinRegistrationQrAlt` })}
                  className={`size-40 shrink-0 rounded-lg border border-border bg-surface p-2`}
                />
              ) : null}
              <div className={`min-w-52 flex-1 space-y-3 text-ui-base text-foreground-subtle`}>
                <div>{intl.formatMessage({ id: `bots.weixinRegistrationScanHint` })}</div>
                <div>
                  {props.weixinRegistration.status === `pending` || props.weixinRegistration.status === `scanned` ? (
                    <span className={`inline-flex items-center gap-1`}>
                      <Spinner className={`size-3 animate-spin`} />
                      {intl.formatMessage({ id: `bots.weixinRegistration.${props.weixinRegistration.status}` })}
                    </span>
                  ) : (
                    (props.weixinRegistration.message ??
                      intl.formatMessage({ id: `bots.weixinRegistration.${props.weixinRegistration.status}` }))
                  )}
                </div>
              </div>
            </div>
          </BotDetailCard>
        ));
  }
  return (
    <SettingsSectionCard>
      <SettingsRow
        label={intl.formatMessage({ id: `bots.botToken` })}
        description={description}
        control={control}
        detail={detail}
      />
    </SettingsSectionCard>
  );
}

/** 原 WLt（148500 / 123254）：允许工作区行（all/selected + 勾选列表） */
export function BotAllowedWorkspacesRow(props: {
  bot: Bot;
  workspaceRefs: WorkspaceRef[];
  currentWorkspace: WorkspaceRef;
  loading: boolean;
  onPatchAllowedWorkspaces: (allowed: string[]) => void;
  onToggleWorkspaceAccess: (workspaceId: string, enabled: boolean) => void;
}) {
  const { intl } = useZCodeIntl();
  const all = isAllWorkspaces(props.bot.allowedWorkspaces);
  const selectedCount = all
    ? props.workspaceRefs.length
    : props.bot.allowedWorkspaces.filter((id) => props.workspaceRefs.some((ref) => ref.id === id)).length;
  return (
    <SettingsRow
      label={intl.formatMessage({ id: `bots.allowedWorkspaces` })}
      description={intl.formatMessage(
        {
          id: all
            ? `bots.allowedWorkspaces.allDescription`
            : `bots.allowedWorkspaces.selectedDescription`,
        },
        { count: String(selectedCount) },
      )}
      control={
        <div className={`flex items-center justify-end gap-2`}>
          {props.loading ? <Spinner className={`size-4 animate-spin text-foreground-subtle`} /> : null}
          <Select
            value={all ? `all` : `selected`}
            onValueChange={(value) => {
              props.onPatchAllowedWorkspaces(value === `all` ? [`*`] : [props.currentWorkspace.id]);
            }}
            disabled={props.loading}
          >
            <SelectTrigger size={`lg`} className={`w-48 justify-between`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={`all`}>
                {intl.formatMessage({ id: `bots.allowedWorkspaces.mode.all` })}
              </SelectItem>
              <SelectItem value={`selected`}>
                {intl.formatMessage({ id: `bots.allowedWorkspaces.mode.selected` })}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      }
      detail={
        all ? null : (
          <div className={`rounded-lg bg-background p-1`}>
            <div className={`flex max-h-72 flex-col gap-1 overflow-y-auto`}>
              {props.workspaceRefs.map((ref) => {
                const enabled = props.bot.allowedWorkspaces.includes(ref.id);
                return (
                  <button
                    key={ref.id}
                    type={`button`}
                    className={`flex min-w-0 items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60`}
                    onClick={() => void props.onToggleWorkspaceAccess(ref.id, !enabled)}
                    disabled={props.loading}
                    title={ref.label}
                  >
                    <span className={`flex size-6 shrink-0 items-center justify-center`}>
                      <div
                        className={cn(
                          `flex size-4 items-center justify-center rounded-sm border`,
                          enabled
                            ? `border-primary bg-primary text-primary-foreground`
                            : `border-input-border bg-input text-transparent`,
                        )}
                      >
                        <CheckIcon className={`size-3.5`} />
                      </div>
                    </span>
                    <div className={`min-w-0 flex-1 space-y-1`}>
                      <div className={`truncate text-ui-base font-medium text-foreground`}>{ref.label}</div>
                      <div className={`truncate font-mono text-ui-base text-foreground-subtlest`}>
                        {ref.workspacePath}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )
      }
    />
  );
}

/* ----------------------------------------------------------------------------
 * §5 根与模型（原 GLt/KLt/qLt，148604–149472 / jsx 123319）
 * -------------------------------------------------------------------------- */

/** 原 GLt（148604）：空配置 */
export function emptyBotsConfig(): BotsConfig {
  return { version: 2, bots: [] };
}

/** 原 KLt（148607）：新 Bot 骨架 */
export function newBotOfProvider(entry: { provider: string }): Bot {
  return {
    id: `bot-${generateUniqueId()}`,
    name: ``,
    provider: entry.provider,
    enabled: !0,
    allowedWorkspaces: [`*`],
    allowedCommands: defaultAllowedCommands(),
    currentOptions: {},
    replyMode: defaultReplyModeOf(entry.provider, REPLY_MODE_DEFAULTS),
  };
}

/** 原 qLt（148619 / 123319）：Bots 根对话框（左列表+右详情；绑定/注册/轮询全链） */
export function BotsDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspacePath: string;
  workspaceIdentity?: string | null;
  entryProvider: string | null;
}) {
  const { intl } = useZCodeIntl();
  const platform = usePlatformService();
  const confirm = useConfirmDialog();
  const { botsService } = useBaseServices() as { botsService: BotsServiceLike };
  const [config, setConfig] = React.useState<BotsConfig>(() => emptyBotsConfig());
  const [workspaceRefs, setWorkspaceRefs] = React.useState<WorkspaceRef[]>([]);
  const [status, setStatus] = React.useState<BotsStatus | null>(null);
  const [botStates, setBotStates] = React.useState<BotState[]>([]);
  const [selectedBotId, setSelectedBotId] = React.useState<string | null>(null);
  const [loaded, setLoaded] = React.useState(!1);
  const [creating, setCreating] = React.useState<string | null>(null);
  const [bindCode, setBindCode] = React.useState<BindCodeState | null>(null);
  const [feishuRegistration, setFeishuRegistration] = React.useState<FeishuRegistrationState | null>(null);
  const [feishuRegistrationLoading, setFeishuRegistrationLoading] = React.useState(!1);
  const [weixinRegistration, setWeixinRegistration] = React.useState<WeixinRegistrationState | null>(null);
  const [weixinRegistrationLoading, setWeixinRegistrationLoading] = React.useState(!1);
  const [secretSaving, setSecretSaving] = React.useState(!1);
  const [credentialValue, setCredentialValue] = React.useState(``);
  const [adding, setAdding] = React.useState(!1);
  const [workspacesSaving, setWorkspacesSaving] = React.useState(!1);
  const [renameDraft, setRenameDraft] = React.useState<{ botId: string; value: string } | null>(null);
  const [renamingBotId, setRenamingBotId] = React.useState<string | null>(null);
  const composingRef = React.useRef(!1);
  const feishuRegistrationStartedRef = React.useRef(new Set<string>());
  const bindCodeRequestedRef = React.useRef(new Set<string>());
  const entryAppliedRef = React.useRef<string | null>(null);
  const [bindTick, setBindTick] = React.useState(() => Date.now());
  const currentWorkspaceKey = React.useMemo(
    () => workspaceLabelOf(props.workspacePath, props.workspaceIdentity),
    [props.workspaceIdentity, props.workspacePath],
  );
  const currentWorkspace = React.useMemo(
    () => ({
      id: currentWorkspaceKey,
      label: props.workspacePath.split(/[\\/]/u).filter(Boolean).at(-1) ?? props.workspacePath,
      workspacePath: props.workspacePath,
      workspaceIdentity: props.workspaceIdentity,
    }),
    [currentWorkspaceKey, props.workspaceIdentity, props.workspacePath],
  );
  const selectedBot = config.bots.find((bot) => bot.id === selectedBotId) ?? null;
  const selectedBotState = botStates.find((state) => state.botId === selectedBotId) ?? null;
  const selectedBotName = selectedBot && renameDraft?.botId === selectedBot.id ? renameDraft.value : (selectedBot?.name ?? ``);
  const fallbackBotName = intl.formatMessage({ id: `bots.newBot.fallbackName` });
  const selectedBotDisplayName = nonEmptyOr(selectedBotName, fallbackBotName);
  const bindRemainingMs = bindCode ? Math.max(0, bindCode.expiresAt - bindTick) : 0;
  const bindExpired = !!(bindCode && bindRemainingMs <= 0);
  const bindCountdownProgress = bindCode ? Math.max(0, Math.min(100, (bindRemainingMs / bindCode.ttlMs) * 100)) : 0;
  React.useEffect(() => {
    if (!props.open || !bindCode) return;
    setBindTick(Date.now());
    const timer = window.setInterval(() => setBindTick(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, [bindCode, props.open]);
  React.useEffect(() => {
    if (!props.open || !bindCode || bindExpired) return;
    let cancelled = !1;
    const poll = async () => {
      try {
        const next = await botsService.getConfig();
        if (cancelled) return;
        setConfig(next);
        next.bots.find((bot) => bot.id === bindCode.botId)?.providerUserId && setBindCode(null);
      } catch (error) {
        logger.warn(
          `[BotsDialog] 轮询 Bot 绑定结果失败`,
          error instanceof Error ? error.message : String(error),
        );
      }
    };
    poll();
    const timer = window.setInterval(() => {
      poll();
    }, 2e3);
    return () => {
      cancelled = !0;
      window.clearInterval(timer);
    };
  }, [bindCode, bindExpired, botsService, props.open]);
  React.useEffect(() => {
    !bindCode || bindCode.botId !== selectedBot?.id || !selectedBot.providerUserId || setBindCode(null);
  }, [bindCode, selectedBot?.id, selectedBot?.providerUserId]);
  React.useEffect(() => {
    setCredentialValue(``);
    setSecretSaving(!1);
    setWorkspacesSaving(!1);
    setFeishuRegistration(null);
    setWeixinRegistration(null);
  }, [selectedBotId, selectedBot?.provider]);
  const reload = React.useCallback(async () => {
    try {
      const [nextConfig, nextStatus, nextRefs, nextStates] = await Promise.all([
        botsService.getConfig(),
        botsService.getStatus(),
        botsService.listWorkspaceRefs({ currentWorkspace }),
        botsService.getBotStates(),
      ]);
      setConfig(nextConfig);
      setStatus(nextStatus);
      setWorkspaceRefs(nextRefs);
      setBotStates(nextStates);
      setLoaded(!0);
      setSelectedBotId((previous) => (adding ? previous : (previous ?? nextConfig.bots[0]?.id ?? null)));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`[BotsDialog] 加载 Bots 配置失败`, message);
      toast(intl.formatMessage({ id: `bots.loadFailed` }, { error: message }));
    }
  }, [botsService, adding, currentWorkspace, intl]);
  React.useEffect(() => {
    if (!props.open || selectedBot?.provider !== `weixin` || !selectedBot.credentialRef || selectedBotState?.weixinActivatedAt)
      return;
    let cancelled = !1;
    const poll = async () => {
      try {
        const next = await botsService.getBotStates();
        cancelled || setBotStates(next);
      } catch (error) {
        logger.warn(
          `[BotsDialog] 轮询微信 Bot 激活状态失败`,
          error instanceof Error ? error.message : String(error),
        );
      }
    };
    const timer = window.setInterval(() => {
      poll();
    }, 2e3);
    return (
      poll(),
      () => {
        cancelled = !0;
        window.clearInterval(timer);
      }
    );
  }, [botsService, props.open, selectedBot?.credentialRef, selectedBot?.id, selectedBot?.provider, selectedBotState?.weixinActivatedAt]);
  React.useEffect(() => {
    props.open && (setLoaded(!1), reload());
  }, [props.open, reload]);
  React.useEffect(() => {
    entryAppliedRef.current = null;
  }, [props.entryProvider, props.open]);
  const saveBot = React.useCallback(
    async (bot: Bot, options?: { credentialValue?: string }) => {
      const saved = await botsService.saveBot({ bot, credentialValue: options?.credentialValue });
      return (
        setConfig((previous) => ({
          ...previous,
          bots: [...previous.bots.filter((item) => item.id !== saved.id), saved],
        })),
        setSelectedBotId(saved.id),
        setAdding(!1),
        setCredentialValue(``),
        reload(),
        saved
      );
    },
    [botsService, reload],
  );
  const createBindCode = React.useCallback(
    async (bot: Bot) => {
      const createdAt = Date.now();
      const result = await botsService.createBindCode({
        botId: bot.id,
        ttlMs: BIND_CODE_TTL,
        allowedWorkspaces: bot.allowedWorkspaces,
      });
      setBindTick(createdAt);
      setBindCode({
        botId: bot.id,
        code: result.code,
        createdAt,
        expiresAt: result.expiresAt,
        ttlMs: Math.max(1, result.expiresAt - createdAt),
      });
    },
    [botsService],
  );
  React.useEffect(() => {
    const registration = feishuRegistration;
    if (!props.open || !selectedBot || !isFeishuFamilyProvider(selectedBot.provider) || !registration || registration.status !== `pending`)
      return;
    let cancelled = !1;
    const intervalMs = Math.max(1, registration.interval) * 1e3;
    const poll = async () => {
      try {
        const result = await botsService.pollFeishuRegistration({
          deviceCode: registration.deviceCode,
          domain: registration.domain,
          pollDomain: registration.pollDomain,
        });
        if (cancelled) return;
        if (result.status === `pending`) {
          setFeishuRegistration((previous) =>
            previous?.deviceCode !== registration.deviceCode ||
            (previous.interval === result.interval &&
              previous.domain === result.domain &&
              previous.pollDomain === result.pollDomain)
              ? previous
              : { ...previous, interval: result.interval!, domain: result.domain!, pollDomain: result.pollDomain! },
          );
          return;
        }
        if (result.status === `success`) {
          const saved = await saveBot(
            {
              ...selectedBot,
              provider: selectedBot.provider,
              name: result.appName?.trim() || selectedBot.name,
              feishuAppId: result.appId,
            },
            { credentialValue: result.appSecret },
          );
          cancelled ||
            (setConfig((previous) => ({
              ...previous,
              bots: previous.bots.map((item) => (item.id === saved.id ? saved : item)),
            })),
            setFeishuRegistration(null),
            toast(intl.formatMessage({ id: `bots.feishuRegistrationSuccess` })));
          return;
        }
        setFeishuRegistration((previous) =>
          previous?.deviceCode === registration.deviceCode
            ? {
                ...previous,
                status: result.status,
                message:
                  result.message ?? intl.formatMessage({ id: `bots.feishuRegistration.${result.status}` }),
              }
            : previous,
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`[BotsDialog] 飞书扫码注册轮询失败`, message);
        cancelled ||
          setFeishuRegistration((previous) =>
            previous?.deviceCode === registration.deviceCode ? { ...previous, status: `error`, message } : previous,
          );
      }
    };
    const timer = window.setInterval(() => {
      poll();
    }, intervalMs);
    return (
      poll(),
      () => {
        cancelled = !0;
        window.clearInterval(timer);
      }
    );
  }, [botsService, createBindCode, feishuRegistration, intl, props.open, saveBot, selectedBot]);
  React.useEffect(() => {
    const registration = weixinRegistration;
    if (
      !props.open ||
      !selectedBot ||
      selectedBot.provider !== `weixin` ||
      !registration ||
      (registration.status !== `pending` && registration.status !== `scanned`)
    )
      return;
    let cancelled = !1;
    let timer: number | undefined;
    const intervalMs = Math.max(1, registration.interval) * 1e3;
    const schedule = () => {
      cancelled ||
        (timer = window.setTimeout(() => {
          step();
        }, intervalMs));
    };
    const poll = async () => {
      try {
        const result = await botsService.pollWeixinRegistration({ qrCode: registration.qrCode });
        if (cancelled) return;
        if (result.status === `pending` || result.status === `scanned`) {
          setWeixinRegistration((previous) =>
            previous?.qrCode !== registration.qrCode ||
            (previous.interval === result.interval && previous.status === result.status)
              ? previous
              : { ...previous, interval: result.interval!, status: result.status },
          );
          return;
        }
        if (result.status === `success`) {
          await saveBot(
            {
              ...selectedBot,
              webhookUrl: void 0,
              providerUserId: result.botId ?? selectedBot.providerUserId,
              displayName: result.botId ?? selectedBot.displayName,
              name: selectedBot.name,
            },
            { credentialValue: result.botToken },
          );
          cancelled || (setWeixinRegistration(null), toast(intl.formatMessage({ id: `bots.weixinRegistrationSuccess` })));
          cancelled = !0;
          return;
        }
        setWeixinRegistration((previous) =>
          previous?.qrCode === registration.qrCode
            ? {
                ...previous,
                status: result.status,
                message:
                  (`message` in result ? result.message : void 0) ??
                  intl.formatMessage({ id: `bots.weixinRegistration.${result.status}` }),
              }
            : previous,
        );
        cancelled = !0;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`[BotsDialog] 微信扫码登录轮询失败`, message);
      }
    };
    const step = async () => {
      await poll();
      schedule();
    };
    return (
      step(),
      () => {
        cancelled = !0;
        timer !== void 0 && window.clearTimeout(timer);
      }
    );
  }, [botsService, intl, props.open, saveBot, selectedBot, weixinRegistration]);
  const patchBot = React.useCallback(
    (patch: Partial<Bot>) => {
      selectedBot && saveBot({ ...selectedBot, ...patch });
    },
    [saveBot, selectedBot],
  );
  const startRename = React.useCallback(() => {
    selectedBot && (setRenamingBotId(selectedBot.id), setRenameDraft({ botId: selectedBot.id, value: selectedBot.name }));
  }, [selectedBot]);
  const commitRename = React.useCallback(() => {
    if (!selectedBot) return;
    const name = renameDraft?.value.trim() ?? ``;
    setRenameDraft(null);
    setRenamingBotId(null);
    name !== selectedBot.name && saveBot({ ...selectedBot, name });
  }, [saveBot, selectedBot, renameDraft]);
  const handleNameInputKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === `Enter`) {
        if (isComposingText({ compositionActive: composingRef.current, nativeEvent: event.nativeEvent })) {
          logger.debug(`[BotsDialog] ignore bot name enter during IME`, { botId: selectedBot?.id ?? null });
          return;
        }
        event.currentTarget.blur();
        return;
      }
      event.key === `Escape` && (setRenameDraft(null), setRenamingBotId(null), event.preventDefault(), event.stopPropagation());
    },
    [selectedBot?.id],
  );
  const handleDialogEscape = React.useCallback(
    (event: KeyboardEvent) => {
      renamingBotId !== null && (event.preventDefault(), setRenameDraft(null), setRenamingBotId(null));
    },
    [renamingBotId],
  );
  const patchAllowedWorkspaces = React.useCallback(
    async (allowed: string[]) => {
      if (!selectedBot) return;
      setWorkspacesSaving(!0);
      const normalized = allowed.length > 0 ? allowed : [`*`];
      const previous = selectedBot;
      const next = { ...selectedBot, allowedWorkspaces: normalized };
      setConfig((config) => ({ ...config, bots: config.bots.map((item) => (item.id === next.id ? next : item)) }));
      try {
        await saveBot(next);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`[BotsDialog] 保存工作区访问范围失败`, message);
        setConfig((config) => ({
          ...config,
          bots: config.bots.map((item) => (item.id === previous.id ? previous : item)),
        }));
        toast(intl.formatMessage({ id: `bots.saveFailed` }, { error: message }));
      } finally {
        setWorkspacesSaving(!1);
      }
    },
    [intl, saveBot, selectedBot],
  );
  const toggleWorkspaceAccess = React.useCallback(
    async (workspaceId: string, enabled: boolean) => {
      if (!selectedBot) return;
      const base = isAllWorkspaces(selectedBot.allowedWorkspaces)
        ? workspaceRefs.map((ref) => ref.id)
        : selectedBot.allowedWorkspaces;
      await patchAllowedWorkspaces(enabled ? [...new Set([...base, workspaceId])] : base.filter((id) => id !== workspaceId));
    },
    [patchAllowedWorkspaces, selectedBot, workspaceRefs],
  );
  const startAdding = () => {
    setAdding(!0);
    setCreating(null);
    setSelectedBotId(null);
    setCredentialValue(``);
    setFeishuRegistration(null);
    setWeixinRegistration(null);
  };
  const createBot = React.useCallback(
    async (provider: string) => {
      if (creating) return;
      setCreating(provider);
      const draft = newBotOfProvider({ provider });
      try {
        await saveBot({
          ...draft,
          name: ``,
          ...(provider === `webhook` ? { webhookAuthHeaderName: `x-zcode-bot-secret` } : {}),
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`[BotsDialog] 创建 Bot 失败`, message);
        toast(intl.formatMessage({ id: `bots.saveFailed` }, { error: message }));
      } finally {
        setCreating(null);
      }
    },
    [creating, intl, saveBot],
  );
  React.useEffect(() => {
    if (!props.open || !props.entryProvider || !loaded || entryAppliedRef.current === props.entryProvider) return;
    const intent = resolveEntryIntent(config.bots, props.entryProvider);
    entryAppliedRef.current = props.entryProvider;
    setCredentialValue(``);
    setFeishuRegistration(null);
    setWeixinRegistration(null);
    if (intent.mode === `select`) {
      setAdding(!1);
      setCreating(null);
      setSelectedBotId(intent.botId);
      return;
    }
    setAdding(!0);
    setSelectedBotId(null);
    createBot(intent.provider);
  }, [config.bots, loaded, props.entryProvider, createBot, props.open]);
  const refreshBindCode = async () => {
    selectedBot && (await createBindCode(selectedBot));
  };
  const saveSecret = async () => {
    if (!selectedBot || secretSaving) return;
    setSecretSaving(!0);
    try {
      await saveBot(selectedBot, { credentialValue });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`[BotsDialog] 保存 Bot secret 失败`, message);
      toast(intl.formatMessage({ id: `bots.saveFailed` }, { error: message }));
    } finally {
      setSecretSaving(!1);
    }
  };
  const startFeishuRegistration = React.useCallback(async () => {
    if (!selectedBot || !isFeishuFamilyProvider(selectedBot.provider)) return;
    setFeishuRegistrationLoading(!0);
    try {
      const start = await botsService.beginFeishuRegistration({ domain: selectedBot.provider });
      let qrDataUrl: string | null = null;
      try {
        qrDataUrl = await qrcode.toDataURL(start.qrUrl, { margin: 1, width: 220 });
      } catch (error) {
        logger.error(
          `[BotsDialog] 生成飞书注册二维码失败`,
          error instanceof Error ? error.message : String(error),
        );
      }
      setFeishuRegistration({
        botId: selectedBot.id,
        deviceCode: start.deviceCode,
        qrUrl: start.qrUrl,
        qrDataUrl,
        userCode: start.userCode,
        interval: start.interval,
        expiresAt: start.expiresAt,
        domain: start.domain,
        pollDomain: start.pollDomain,
        status: `pending`,
      });
      toast(intl.formatMessage({ id: `bots.feishuRegistrationStarted` }));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`[BotsDialog] 启动飞书扫码注册失败`, message);
      toast(intl.formatMessage({ id: `bots.feishuRegistrationFailed` }, { error: message }));
    } finally {
      setFeishuRegistrationLoading(!1);
    }
  }, [botsService, intl, selectedBot]);
  const startWeixinRegistration = React.useCallback(async () => {
    if (!selectedBot || selectedBot.provider !== `weixin`) return;
    setWeixinRegistrationLoading(!0);
    try {
      const start = await botsService.beginWeixinRegistration();
      let qrDataUrl: string | null = null;
      try {
        qrDataUrl = await qrcode.toDataURL(start.qrUrl, { margin: 1, width: 220 });
      } catch (error) {
        logger.error(
          `[BotsDialog] 生成微信登录二维码失败`,
          error instanceof Error ? error.message : String(error),
        );
      }
      setWeixinRegistration({
        botId: selectedBot.id,
        qrCode: start.qrCode,
        qrUrl: start.qrUrl,
        qrDataUrl,
        interval: start.interval,
        expiresAt: start.expiresAt,
        status: `pending`,
      });
      toast(intl.formatMessage({ id: `bots.weixinRegistrationStarted` }));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`[BotsDialog] 启动微信扫码登录失败`, message);
      toast(intl.formatMessage({ id: `bots.weixinRegistrationFailed` }, { error: message }));
    } finally {
      setWeixinRegistrationLoading(!1);
    }
  }, [botsService, intl, selectedBot]);
  React.useEffect(() => {
    if (!props.open || adding || !selectedBot) return;
    if (isFeishuFamilyProvider(selectedBot.provider)) {
      if (!selectedBot.credentialRef) {
        if (feishuRegistrationLoading || feishuRegistration?.botId === selectedBot.id) return;
        const startedKey = `${selectedBot.id}:feishu-registration`;
        if (feishuRegistrationStartedRef.current.has(startedKey)) return;
        feishuRegistrationStartedRef.current.add(startedKey);
        startFeishuRegistration();
        return;
      }
      if (!selectedBot.providerUserId) {
        if ((bindCode?.botId === selectedBot.id && !bindExpired) || bindCodeRequestedRef.current.has(selectedBot.id))
          return;
        bindCodeRequestedRef.current.add(selectedBot.id);
        createBindCode(selectedBot).finally(() => {
          bindCodeRequestedRef.current.delete(selectedBot.id);
        });
      }
      return;
    }
    if (selectedBot.provider === `telegram`) {
      if (
        !selectedBot.credentialRef ||
        selectedBot.providerUserId ||
        (bindCode?.botId === selectedBot.id && !bindExpired) ||
        bindCodeRequestedRef.current.has(selectedBot.id)
      )
        return;
      bindCodeRequestedRef.current.add(selectedBot.id);
      createBindCode(selectedBot).finally(() => {
        bindCodeRequestedRef.current.delete(selectedBot.id);
      });
      return;
    }
    if (selectedBot.provider !== `weixin` || selectedBot.credentialRef || weixinRegistrationLoading || weixinRegistration?.botId === selectedBot.id)
      return;
    const startedKey = `${selectedBot.id}:weixin-registration`;
    feishuRegistrationStartedRef.current.has(startedKey) ||
      (feishuRegistrationStartedRef.current.add(startedKey), startWeixinRegistration());
  }, [adding, feishuRegistration, feishuRegistrationLoading, bindCode, bindExpired, createBindCode, startFeishuRegistration, startWeixinRegistration, props.open, selectedBot, weixinRegistration, weixinRegistrationLoading]);
  const openTelegramBotFather = () => {
    platform.openExternal(TELEGRAM_BOTFATHER_URL);
  };
  const copyBindCommand = async () => {
    if (!bindCode || bindExpired) return;
    const command = `/bind ${bindCode.code}`;
    await navigator.clipboard?.writeText(command).catch((error) => {
      logger.warn(`[BotsDialog] 复制绑定命令失败`, error instanceof Error ? error.message : String(error));
    });
    toast(intl.formatMessage({ id: `bots.bindCommandCopied` }));
  };
  const unbindBot = async () => {
    selectedBot &&
      (await saveBot({ ...selectedBot, providerUserId: void 0, displayName: void 0 }),
      await botsService.resetBotState(selectedBot.id));
  };
  const removeSecret = async () => {
    if (selectedBot)
      try {
        const updated = await botsService.removeBotSecret(selectedBot.id);
        feishuRegistrationStartedRef.current.delete(`${selectedBot.id}:feishu-registration`);
        feishuRegistrationStartedRef.current.delete(`${selectedBot.id}:weixin-registration`);
        bindCodeRequestedRef.current.delete(selectedBot.id);
        setConfig((previous) => ({
          ...previous,
          bots: previous.bots.map((item) => (item.id === updated.id ? updated : item)),
        }));
        setCredentialValue(``);
        setBindCode(null);
        reload();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`[BotsDialog] 移除 Bot secret 失败`, message);
        toast(intl.formatMessage({ id: `bots.removeSecretFailed` }, { error: message }));
      }
  };
  const deleteBot = async () => {
    if (selectedBot) {
      const confirmed = await confirm({
        title: intl.formatMessage({ id: `bots.deleteConfirmTitle` }, { name: nonEmptyOr(selectedBot.name, fallbackBotName) }),
        description: intl.formatMessage({ id: `bots.deleteConfirmDescription` }),
        confirmLabel: intl.formatMessage({ id: `bots.delete` }),
      });
      if (confirmed)
        try {
          await botsService.deleteBot(selectedBot.id);
          setSelectedBotId(null);
          reload();
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          logger.error(`[BotsDialog] 删除 Bot 失败`, message);
          toast(intl.formatMessage({ id: `bots.deleteFailed` }, { error: message }));
        }
    }
  };
  const selectedRuntime = selectedBot ? status?.botRuntime.find((runtime) => runtime.botId === selectedBot.id) : void 0;
  const channelLabel = (provider: string) => intl.formatMessage({ id: `bots.channel.${provider}` });
  const channelLabelWithRegion = (provider: string) => {
    const regionTagKey = regionTagKeyOfProvider(provider);
    return (
      <span className={`inline-flex min-w-0 items-center gap-1.5`}>
        <span className={`min-w-0 truncate`}>{channelLabel(provider)}</span>
        {regionTagKey ? (
          <span
            className={`inline-flex h-5 shrink-0 items-center rounded-full border border-border px-2 text-ui-xs font-medium leading-none text-foreground-subtle`}
          >
            {intl.formatMessage({ id: regionTagKey })}
          </span>
        ) : null}
      </span>
    );
  };
  return (
    <DialogRoot open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent
        className={`flex h-[calc(100vh-6rem)] max-h-168 max-w-4xl flex-col overflow-hidden rounded-2xl`}
        onEscapeKeyDown={handleDialogEscape}
      >
        <DialogHeader>
          <div className={`flex items-center gap-2`}>
            <BotIcon className={`size-5 text-foreground`} />
            <DialogTitle className={`text-lg font-medium text-foreground`}>
              {intl.formatMessage({ id: `bots.title` })}
            </DialogTitle>
            <DialogDescription className={`ml-3`}>
              {intl.formatMessage({ id: `bots.description` })}
            </DialogDescription>
          </div>
        </DialogHeader>
        <div className={`flex min-h-0 flex-1 gap-3`}>
          <aside className={`flex w-64 shrink-0 flex-col`}>
            <div className={`min-h-0 flex-1 overflow-y-auto`}>
              <Button
                type={`button`}
                variant={`outline`}
                size={`lg`}
                onClick={startAdding}
                className={`mb-3 w-full justify-start gap-2 rounded-xl`}
              >
                <PlusIcon className={`size-4`} />
                <span className={`min-w-0 truncate`}>{intl.formatMessage({ id: `bots.addBot` })}</span>
              </Button>
              {config.bots.length === 0 ? (
                <div className={`p-4 text-ui-base text-foreground-subtle`}>
                  {adding
                    ? intl.formatMessage({ id: `bots.newBot.selectProviderHint` })
                    : intl.formatMessage({ id: `bots.empty` })}
                </div>
              ) : (
                config.bots.map((bot) => {
                  const runtime = status?.botRuntime.find((item) => item.botId === bot.id);
                  return (
                    <button
                      key={bot.id}
                      type={`button`}
                      onClick={() => {
                        setAdding(!1);
                        setSelectedBotId(bot.id);
                      }}
                      className={cn(
                        `mb-1 w-full rounded-xl px-2.5 pr-4 py-3 text-left transition-colors`,
                        bot.id === selectedBotId
                          ? `bg-surface-hover text-foreground`
                          : `text-foreground-subtle hover:bg-surface-hover hover:text-foreground`,
                      )}
                    >
                      <div className={`flex items-center gap-2`}>
                        <BotProviderIcon
                          provider={bot.provider}
                          className={`size-10 shrink-0 object-contain text-foreground-subtle`}
                        />
                        <span className={`min-w-0 flex-1`}>
                          <span className={`block text-foreground truncate text-ui-base font-medium`}>
                            {nonEmptyOr(bot.name, fallbackBotName)}
                          </span>
                          <span className={`mt-0.5 flex min-w-0 text-ui-base text-foreground-subtle`}>
                            {channelLabelWithRegion(bot.provider)}
                          </span>
                        </span>
                        <span className={cn(`size-2 shrink-0 rounded-full`, runtimeDotClassOf(runtime, bot.enabled))} />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </aside>
          <section className={`min-w-0 flex-1 overflow-y-auto rounded-xl border border-border bg-background p-4`}>
            {adding ? (
              <div className={`mx-auto flex min-h-full max-w-3xl flex-col justify-start gap-6`}>
                <div className={`space-y-2`}>
                  <div className={`text-ui-lg font-medium`}>
                    {intl.formatMessage({ id: `bots.newBot.title` })}
                  </div>
                  <p className={`max-w-2xl text-ui-base leading-6 text-foreground-subtle`}>
                    {intl.formatMessage({ id: `bots.newBot.description` })}
                  </p>
                </div>
                <div className={`grid gap-3 md:grid-cols-2`}>
                  {BOT_PROVIDERS.filter((provider) => provider.id !== `webhook`).map((provider) => {
                    const implemented = provider.implemented;
                    const busy = creating === provider.id;
                    const anyCreating = creating !== null;
                    return (
                      <button
                        key={provider.id}
                        type={`button`}
                        disabled={!implemented || anyCreating}
                        aria-busy={busy}
                        onClick={() => (implemented ? void createBot(provider.id) : void 0)}
                        className={cn(
                          `flex items-start gap-3 rounded-lg border border-card-border bg-card py-4 px-3 text-left transition-colors`,
                          implemented && !anyCreating
                            ? `hover:border-input-border-focused hover:bg-surface-hover`
                            : `cursor-not-allowed opacity-60`,
                          busy && `border-input-border-focused bg-surface-hover opacity-100`,
                        )}
                      >
                        {busy ? (
                          <div className={`flex size-10 items-center justify-center`}>
                            <Spinner className={`size-6 shrink-0 animate-spin text-foreground-subtle`} />
                          </div>
                        ) : (
                          <BotProviderIcon provider={provider.id} className={`size-10 shrink-0 text-foreground`} />
                        )}
                        <span className={`min-w-0 flex-1`}>
                          <span className={`flex min-w-0 text-ui-lg font-medium`}>
                            {channelLabelWithRegion(provider.id)}
                          </span>
                          <span className={`mt-1 block text-ui-base text-foreground-subtle`}>
                            {implemented
                              ? intl.formatMessage({
                                  id: `bots.newBot.providerDescription.${provider.id}`,
                                })
                              : intl.formatMessage({ id: `bots.newBot.comingSoon` })}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : selectedBot ? (
              <div className={`space-y-4`}>
                <BotHeaderRow
                  bot={selectedBot}
                  runtime={selectedRuntime}
                  selectedBotDisplayName={selectedBotDisplayName}
                  selectedBotName={selectedBotName}
                  fallbackBotName={fallbackBotName}
                  renaming={renamingBotId === selectedBot.id}
                  onStartRename={startRename}
                  onCommitNameDraft={commitRename}
                  onNameDraftChange={(value) => setRenameDraft({ botId: selectedBot.id, value })}
                  onNameCompositionEnd={() => {
                    composingRef.current = !1;
                  }}
                  onNameCompositionStart={() => {
                    composingRef.current = !0;
                  }}
                  onNameInputKeyDown={handleNameInputKeyDown}
                  onPatchBot={patchBot}
                />
                <BotCredentialSection
                  bot={selectedBot}
                  runtime={selectedRuntime}
                  credentialValue={credentialValue}
                  bindCode={bindCode}
                  bindExpired={bindExpired}
                  bindRemainingMs={bindRemainingMs}
                  bindCountdownProgress={bindCountdownProgress}
                  feishuRegistration={feishuRegistration}
                  feishuRegistrationLoading={feishuRegistrationLoading}
                  weixinRegistration={weixinRegistration}
                  weixinRegistrationLoading={weixinRegistrationLoading}
                  weixinActivated={!!selectedBotState?.weixinActivatedAt}
                  secretSaving={secretSaving}
                  onCredentialValueChange={setCredentialValue}
                  onSaveSecret={() => void saveSecret()}
                  onRemoveSecret={() => void removeSecret()}
                  onOpenTelegramBotFather={openTelegramBotFather}
                  onStartWeixinRegistration={() => void startWeixinRegistration()}
                  onStartFeishuRegistration={() => void startFeishuRegistration()}
                  onCreateBindCode={() => void refreshBindCode()}
                  onUnbind={() => void unbindBot()}
                  onCopyBindCommand={() => void copyBindCommand()}
                />
                <SettingsSectionCard>
                  <BotReplyGranularityRow bot={selectedBot} onPatchBot={patchBot} />
                  <BotAllowedWorkspacesRow
                    bot={selectedBot}
                    workspaceRefs={workspaceRefs}
                    currentWorkspace={currentWorkspace}
                    loading={workspacesSaving}
                    onPatchAllowedWorkspaces={patchAllowedWorkspaces}
                    onToggleWorkspaceAccess={toggleWorkspaceAccess}
                  />
                </SettingsSectionCard>
                <BotDeleteRow onDelete={() => void deleteBot()} />
              </div>
            ) : (
              <div className={`flex h-full flex-col items-center justify-center gap-3 text-ui-base text-foreground-subtle`}>
                <BotIcon className={`size-8`} />
                <div>{intl.formatMessage({ id: `bots.empty` })}</div>
                <Button variant={`outline`} size={`lg`} onClick={startAdding}>
                  <PlusIcon className={`size-4`} />
                  {intl.formatMessage({ id: `bots.addBot` })}
                </Button>
              </div>
            )}
          </section>
        </div>
      </DialogContent>
    </DialogRoot>
  );
}

/* ----------------------------------------------------------------------------
 * §6 tombstone（A0-S2d · §2 裁决「重复转录件删除」）：WebRemote 运行态助手
 *    原 JLt…nRt（149473–149599）9 符号（REMOTE_PAIRING_PROVIDERS /
 *    isWorkspaceControlActiveFor / hasWindowControlSession /
 *    remoteControlStatusLabelOf / remoteControlStatusDetailOf /
 *    remoteControlDotClassOf / remoteControlDeviceTagOf /
 *    remoteControlStatesEqual / remoteControlFailureMessageOf）
 *    为重复转录：canonical 在 WebRemote.tsx §7（BOT_CHANNEL_PROVIDERS /
 *    statusMatchesWorkspaceTarget / isStatusLiveMobileConnected /
 *    resolveStatusTitle / resolveStatusDetail / statusDotClass /
 *    resolveStatusTag / isSameWebRemoteStatus / resolveFailureMessage，
 *    rRt WebRemoteControlDialog 闭包内消费）。全仓库无本侧 9 名消费点
 *    （grep 核验），无需改 import，消费面语义不变。
 * -------------------------------------------------------------------------- */

/* ============================================================================
 * 尾符号表（混淆名 → 语义名 → js 行 / jsx 行；本批次展开的 F11 全族）
 * ============================================================================
 *  域数据：vLt 147772/122849 | yLt 147782 | bLt 147804 | xLt 147805 | SLt 147809
 *  区域/入口：CLt 147813/122908 | wLt 147823 | TLt 147826
 *  图标/常量：ELt…jLt 147830–147835 | MLt 147836 | NLt 147837
 *  助手：PLt 147838 | g8 147841 | _8 147844 | FLt 147870 | ILt 147875 | LLt 147884 | RLt 147887
 *  视图：zLt 147890/122972 | BLt 148005/123029 | VLt 148030 | v8 148046
 *   HLt 148049/123082 | ULt 148125/123116 | WLt 148500/123254
 *  根：GLt 148604 | KLt 148607 | qLt 148619/123319
 *  尾段（F17 双归属）：JLt 149473 | YLt 149479 | XLt 149490 | ZLt 149495
 *   QLt 149511 | $Lt 149527 | eRt 149536 | tRt 149549 | nRt 149571
 * ============================================================================
 */
