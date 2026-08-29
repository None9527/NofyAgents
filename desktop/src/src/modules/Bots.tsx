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

/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/bots/Bots.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

export {
  BOT_PROVIDERS,
  REPLY_GRANULARITY_OPTIONS,
  DEFAULT_REPLY_GRANULARITY,
  replyGranularityOptionsOf,
  resolveReplyGranularity,
  regionTagKeyOfProvider,
  workspaceLabelOf,
  resolveEntryIntent,
  DISCORD_ICON_URL,
  DINGDING_ICON_URL,
  FEISHU_ICON_URL,
  TELEGRAM_ICON_URL,
  WECOM_ICON_URL,
  WEIXIN_ICON_URL,
  BIND_CODE_TTL,
  TELEGRAM_BOTFATHER_URL,
  isAllWorkspaces,
  nonEmptyOr,
  BotProviderIcon,
  runtimeStatusTextOf,
  runtimeDotClassOf,
  formatSecondsCeil,
  defaultAllowedCommands,
  BotHeaderRow,
  BotReplyGranularityRow,
  BotDeleteRow,
  BotDetailCard,
  TelegramBotFatherCredentialCard,
  BotCredentialSection,
  BotAllowedWorkspacesRow,
  emptyBotsConfig,
  newBotOfProvider,
  BotsDialog,
} from '../components/bots/Bots';
