/* eslint-disable */
/**
 * ============================================================================
 * StoresDeep.tsx — ZCode 3.7.6 store 深层纯函数助手 + 用量数据钩子 + 遥测下沉函数
 *                  （D8 Stage B4 · 接口级叶子实体化）
 * ============================================================================
 *
 * 来源文件（融合 chunk，213,695 行，未改动；只读访问）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js
 *   （md5 c9d0d675d0b858e6e7711df3e9122e81）
 * 前序产物（本批实体化其接口级声明）：
 *   stores-session.tsx（Vo SearchResultsStore，§2 内部纯函数声明）
 *   stores-tasks.tsx  （T3/bX，w3/C3/S3/y3/ri、isTakeNumberFailure 声明）
 *   stores-workspace.tsx（Z0t/F6/B6，K0t/q0t/_9/J0t/Y0t/X0t/v9 等声明）
 *   services.tsx      （hT 遥测监督器消费的 29 个下沉函数声明，§遥测下沉函数）
 *   SettingsPanelsData.tsx（q$t/J$t 用量数据层声明）
 * 标样：TopBar.tsx（行号口径 = 输入 js 闭区间；混淆名映射表 + 外部依赖清单）
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（js 行号为融合 chunk 行）
 * ----------------------------------------------------------------------------
 * §A Vo SearchResultsStore 纯助手块（js 1297–1552；stores-session.tsx §2 登记）：
 *   Ao   → useSessionActivityStore        (1301)  会话活动态外部存储订阅
 *   Pie  → SESSION_ACTIVITY_FIELD='__zcodeSessionActivity' (1307)
 *   jo   → withSessionActivity            (1308)  元数据附挂活动态
 *   Mo   → sessionActivityOf              (1311)
 *   Fie  → isSessionActivityActive        (1314)  prewarming|running
 *   No   → pendingInteractionOf           (1318)  userInput|permission 计数
 *   Po   → mergeMetaPreservingActivity    (1324)  活动态下合并元数据（createdAt/status 保持）
 *   Iie  → compareTasksBySortKey          (1340)  created|updated 双序
 *   Lie  → compareTasksActiveFirst        (1353)  活动态优先
 *   Fo   → compareTasks                   (1365)
 *   Io   → taskWorkspaceKey               (1368)  = workspaceKey(路径, 身份)
 *   Lo   → taskEntityKey                  (1371)  `${workspaceKey}::${taskId}`
 *   Ro   → dedupeWorkspaceScopes          (1374)  按键去重+字典序
 *   Rie  → normalizeSearchTerm            (1382)
 *   zie  → normalizeSearchDescriptor      (1385)
 *   Bie  → descriptorCacheKey             (1396)
 *   zo   → sessionActivityListeners       (1407)  Set
 *   Vie  → subscribeSessionActivity       (1408)
 *   Hie  → broadcastSessionActivity       (1411)  归档/删除事件广播
 *   Uie  → freezeQueryResult              (1414)  快照固化（fetchedAt/stale=false）
 *   Wie  → descriptorMembershipMatch      (1431)  pinned/archived/active/timeline/workspace
 *   Gie  → titleMatchesSearch             (1446)
 *   Kie  → descriptorContainsTask         (1449)
 *   Bo   → sortTaskKeysByDescriptor       (1453)
 *   qie  → shallowEqualLoose              (1460)  对象值 JSON 兜底比较
 *   Jie  → mergeTaskMetaEntry             (1479)  搜索/非搜索两支合并（标题择优/摘要保持）
 *   Yie  → isQueryResultEquivalent        (1510)
 *   Xie  → mergeIncomingTaskKeys          (1532)  本地新变更键保留（updatedAt>fetchedAt）
 *   pe   → pickBestTaskMetadata           (跨 chunk：skillStore `de`+`y`，变参折叠择优)
 *
 * §B T3 AutomationsStore 深层助手（js 134084–134110；stores-tasks.tsx 登记）：
 *   y3 → automationErrorMessage (134101) | b3 → automationLoadSeq (134087)
 *   S3 → isSameAutomationWorkspace (134106) | C3 → findAutomation (134092)
 *   w3 → loadAutomationsIntoStore (134116)
 *   ri → isAutomationLimitError（跨 chunk：src `et`=hx，AUTOMATION_CREATE_LIMIT_REACHED 判定）
 *
 * §C bX OffPeakTaskStore 深层助手：
 *   Eit → isTakeNumberFailure (91402)  quota_3103/3103（stores-tasks.tsx 164 声明实体化；
 *         ExtendedViews.tsx 5739 已有同语义局部实现 isQuota3103Result，本文件为 canonical）
 *
 * §D Z0t HooksStore 深层助手（js 201185–201243；stores-workspace.tsx 登记）：
 *   K0t → hooksWorkspaceKey (201481) | q0t → hookLocationForScope (201188)
 *   _9  → isHookEditable (201489)   | J0t → buildNewHook (201196)
 *   Y0t → mergeHookPatch (201509)   | X0t → reloadHooks (201229)
 *   v9  → saveHooksList (201534)
 *
 * §E F6 CommandsStore 深层助手（js 142700–142753）：
 *   N6  → refreshSkillsAfterCommandsChange (142717)
 *   uFt → trimLeadingSlashes (142736) | dFt → commandNameKey (142722)
 *   fFt → userCommandToSlashCommand (142742)
 *   pFt → mergeCommandsIntoSlashCommands (142754)
 *   P6  → commandsInFlight Map (142767) | mFt → commandsWorkspaceKey (142751)
 *
 * §F B6 PluginsStore 深层助手（js 142873–142984、143135–143180）：
 *   hFt → pluginErrorMessage (142890) | gFt → pluginsWorkspaceKey (142876)
 *   I6  → pluginsInFlight Map (142896)
 *   L6  → runPluginOperation (142897) | R6 → loadPluginsListDeduped (142900)
 *   _Ft → loadPluginsList (142932)    | z6 → pluginErrorMessage2 (142978)
 *   yFt → pluginErrorMessage3 (143152) | bFt → refreshCommandsAfterPluginSync (143138)
 *   V6  → refreshPluginsAfterRemoteSync (143172，尾部跨族接线接口级)
 *
 * §G 用量数据钩子（js 195171–195258；F12 域）——边界裁决让位：
 *   K$t/q$t/J$t 已由并行 B4-1 批 UsageDeep.tsx（F12 族）全量实体化，
 *   按 MODULE-MAP 族归属以 UsageDeep.tsx 为规范实现（见合并报告 §4）。
 *
 * §H 遥测下沉函数块（js 40397–41807；services.tsx §遥测下沉函数 29 声明实体化）：
 *   供应商域：bw/hNe 供应商主机归一 (40397/40406)、xw reportTelemetry (40409)、
 *     gNe/_Ne/vNe 供应商业务错误表 (40467；A1-R13 行校正，旧注 40419)、Sw/yNe/bNe 错误码→i18n/恢复动作 (40494–40500；A1-R13 行校正，旧注 40446–40452)、
 *     SNe 配额耗尽归一 (40456)、DNe 并发限流归一 (40492)、ONe 13xx 码归一 (40501)、
 *     kNe busy 子类 (40553)、ANe/Cw 验证码失败归一 (40559/40570；A1-R12 实测校正，旧注 40505/40511/40522 行漂移)、jNe 空响应判定 (40573)、
 *     MNe…GNe chat_error_banner 常量族 (40532–40615)、KNe/qNe 供应商作用域/模型脱敏 (40616/40623)、
 *     JNe resolveBusinessRecoveryAction (40631)、YNe 截断 (40636)、XNe 失败原因归类 (40639)、
 *     Dw/ZNe/QNe 错误键构造 (40677–40706)、$Ne banner 载荷 (40707)、ePe reportVisibleChatError (40745)
 *   会话步骤域：Ow/kw/Aw/jw 计时/生命周期/步骤状态表 (40752)、tPe…Fw 供应商名/主机/状态工厂 (40756–40799)、
 *     Iw 步骤工厂 (40805)、nPe/rPe 状态归一/自动化 id 提取 (40822/40829)、Lw 首 token 打点 (40843)、
 *     Rw agent_step 载荷 (40846)、zw/Bw 推理/生成步收尾 (40895/40899)、Vw/Hw/iPe/Uw/Ww/Gw 权限等待结算
 *     (40920–40964)、Kw 模型请求公共字段 (40965)、oPe/sPe 压缩载荷 (40983/40986)、cPe/qw 用量序列化/累加
 *     (41017/41031)、Jw/lPe 输入计时 (41050/41056)、uPe 文件变更行数 (41065)、
 *     dPe recordComposerFocusSink (41079)、fPe recordComposerTextChangeSink (41083)、
 *     pPe buildPromptSeedDetail (41089)、mPe recordTurnStarted→弹出生命周期 (41120)、
 *     hPe recordModelRequestStatus (41128)、gPe/_Pe 步骤用量合并 (41153/41156)、
 *     vPe recordSubagentToolAttribution (41169)、Yw/Xw 归属/补收尾 (41187/41197)、
 *     Zw finalizeConversationSteps (41206)、yPe/bPe 当前模型/消息 (41318/41321)、
 *     xPe recordUsageDelta (41324)、SPe/CPe recordPermissionRequested/Resolved (41353/41368)、
 *     wPe buildMessageCompletionDetail (41372)、TPe 全清 (41405)、EPe purgeConversationTiming (41408)、
 *     DPe purgePromptSeedTiming (41411)
 *   plan_usage 域：Qw/OPe/kPe 名称 (41421)、$w/APe 去重集 (41424)、jPe 事件键去重 (41426)、
 *     eT/tT 正整数/非负整数归一 (41434/41439)、MPe 状态映射 (41444)、NPe 去 undefined (41458)、
 *     PPe plan_request 上报 (41463)、FPe recordProviderTtft (41512)
 *   ui_perf 域：nT 组名 (41542)、IPe…qPe 事件名 (41543–41553)、rT/iT/aT 平台引用与上报 (41554–41568)、
 *     JPe/oT 取整 (41569/41572)、YPe 启动链路 (41577)、XPe recordTtft (41612)、ZPe recordDuration (41620)、
 *     QPe recordConversationResult (41628)、$Pe recordToolPerformance (41651)、
 *     sT/eFe recordStreamChunkForeground (41695/41696)、cT clearConversationWaitState (41716)、
 *     tFe/nFe/rFe 输入延迟 (41719–41733)、iFe/aFe 模型名解析 (41734/41739)、oFe chat 公共字段 (41744)、
 *     lT/sFe/cFe 容量常量 (41761)、lFe extractPromptSeedFromTurnStarted (41764)、
 *     uFe/dFe 步骤源字段提取 (41793/41800)
 *
 * ----------------------------------------------------------------------------
 * 二、外部依赖清单（跨 chunk 导入；标注来源 chunk 与导出字母）
 * ----------------------------------------------------------------------------
 *  1. react / jsx-runtime            react-BQLj9xdT.js、jsx-runtime-B5yMD3-t.js
 *  2. logger (J)                     logger-PFDwl5Yq.js (t 导出)
 *  3. zustand create (Ae)、useTaskStore (xe)、useSkillsStore (Ne)、
 *     workspaceKey (U=b)、任务元数据择优 (pe=de，含合并器 y)、
 *     供应商 id 枚举 (q=W 族)      skillStore-BmeKHDBI.js
 *  4. 供应商族判定 (tr=vl zaiCodingPlan|zaiStartPlan)、
 *     zai 族判定 (jt=_l)、custom 模型键解析 (Zn=iS)、
 *     差异行数 (Xr=bS)、随机 id (xi=cx)、
 *     遥测客户端上下文 (Qne=tx)、模型名合成 (we=rt)   src-HCld2afU.js / skillStore
 *  5. 服务 context (fs=useServices)  本 chunk services.tsx 已重建
 *  6. 本 chunk 已重建模块：stores-session/stores-tasks/stores-workspace/services
 *     （本文件为其接口级深层助手的实体化，整合期可改由本文件导入）
 *
 * 〔A0-S4-3：§A–§F 深层助手块已逐字迁 ../stores/（searchResultsHelpers/
 *   automationsHelpers/offPeakHelpers/hooksHelpers/commandsHelpers/
 *   pluginsHelpers），含 §0 的 useTaskStoreStatic/useSkillsStoreStatic/
 *   StoreApi 三个局部声明；本文件为薄 re-export shim，导出面不变〕
 * ============================================================================
 */

import * as React from "react";
import { t as logger } from './logger'; // 原 J（logger-PFDwl5Yq.js t 导出）
import { normalizeProviderId } from './SrcSharedB';
import { skillContextKey, useSkillContextStore as useSkillContextStoreStatic } from './stores-workspace'; // 原 UB
import { resolveWorkspaceKey as workspaceKey, formatCustomModelId as joinModelName, useStore as useStoreSelector } from './SkillStore'; // 原 U | 原 we | 原 ne
import { isZaiPlanProviderId as isZaiPlanFamily, isBuiltinProviderId as isZaiProviderFamily, providerIds } from './SrcSharedA'; // 原 tr | 原 jt。〔A1-R32〕+providerIds（q ≡ mo ≡ W 4733，builtin: 前缀 7 键实体）：PROVIDER_IDS declare 收敛改指，见 @160 墓碑
import { parseCustomModelRef as parseCustomModelKey, countLineDiffChanges as countDiffLines, generateUuid as generateRandomId, resolveClientTelemetryContext as telemetryClientContext } from './SrcSharedB'; // 原 Zn | 原 Xr | 原 xi | 原 Qne
import type { SkillsService } from './stores-workspace';
import type { ScheduleRule } from './SettingsLeaves'; // A0-CLEANUP3 3b：Automation 三型 scheduleRule 统一

/* ============================================================================
 * 0. 外部依赖的类型声明（真实实现位于上面清单所列 chunk；此处为重建接口）
 * ==========================================================================*/


/* 原 U（workspaceKey）已接线 SkillStore.resolveWorkspaceKey（见文件头 import） */

/* ── tombstone〔A1-R32〕：declare PROVIDER_IDS（原 q）删除 → 改指 SrcSharedA@2008 providerIds
 *    （q 真身：styles 725 `mo as q` ← src 9963 `W as mo` ≡ W 4733-4741，体逐字同构：
 *    builtin: 前缀 7 键 zai/bigmodel/zapi/zaiCodingPlan/zaiStartPlan/bigmodelCodingPlan/
 *    bigmodelStartPlan；链闭合；本 declare 面按消费面列字段，与 canonical 7 键吻合）。
 *    消费面实测（本文件 9 处改名改指）：@310/@312/@314（resolveTelemetryProviderHost@308
 *    体内，R31 bw 收敛面不变）+ @463-468（供应商 id 数组面）。
 *    零动态索引，收敛安全。
 *    负证据：styles 213969 `po as q` 为遮蔽（po=McpServerConfigSchema，别 import 块，
 *    异体）。
 *    ── */

/* 原 tr/jt/Zn/Xr/xi/Qne/we/ne 已接线（SrcSharedA isZaiPlanProviderId/isBuiltinProviderId；
   SrcSharedB parseCustomModelRef/countLineDiffChanges/generateUuid/resolveClientTelemetryContext；
   SkillStore formatCustomModelId/useStore；别名见文件头 import） */
/* 原 UB（useSkillContextStoreStatic）已接线 stores-workspace.useSkillContextStore（见文件头 import） */
/** 原 ni（本 chunk 供应商归一，F12 域；接口级） */
/** 原 BB（技能上下文键构造，F08 域；接口级） */

/* ─────────────────────────── A0-S4-3 shim ───────────────────────────
 * §A–§F 已原样迁入 ../stores/（见上方头块注记）；以下为薄 re-export 面，
 * 全部导入方零改动。
 * ──────────────────────────────────────────────────────────────────── */

import {
  SESSION_ACTIVITY_FIELD, withSessionActivity, sessionActivityOf, isSessionActivityActive,
  pendingInteractionOf, mergeMetaPreservingActivity, compareTasksBySortKey, compareTasksActiveFirst,
  compareTasks, taskWorkspaceKey, taskEntityKey, dedupeWorkspaceScopes, normalizeSearchTerm,
  normalizeSearchDescriptor, descriptorCacheKey, subscribeSessionActivity, broadcastSessionActivity,
  freezeQueryResult, descriptorMembershipMatch, titleMatchesSearch, descriptorContainsTask,
  sortTaskKeysByDescriptor, shallowEqualLoose, mergeTaskMetaEntry, isQueryResultEquivalent,
  mergeIncomingTaskKeys, pickBestTaskMetadata, useSessionActivityStore,
} from '../stores/searchResultsHelpers';
import type { TaskMeta, SessionActivity, SearchDescriptor, QueryResultInput, QueryResult, WorkspaceScope } from '../stores/searchResultsHelpers';
import {
  automationErrorMessage, nextAutomationLoadSeq, currentAutomationLoadSeq, automationRunNowInFlight,
  isSameAutomationWorkspace, findAutomation, loadAutomationsIntoStore, AUTOMATION_CREATE_LIMIT_CODE,
  isAutomationLimitError,
} from '../stores/automationsHelpers';
import type { Automation, AutomationsAgentService } from '../stores/automationsHelpers';
import { isTakeNumberFailure } from '../stores/offPeakHelpers';
import type { OffPeakCreateResult } from '../stores/offPeakHelpers';
import {
  hooksWorkspaceKey, hookLocationForScope, isHookEditable, buildNewHook, mergeHookPatch,
  reloadHooks, saveHooksList,
} from '../stores/hooksHelpers';
import type { HookDescriptor, HooksService } from '../stores/hooksHelpers';
import {
  commandsInFlight, commandsWorkspaceKey, trimLeadingSlashes, commandNameKey,
  userCommandToSlashCommand, mergeCommandsIntoSlashCommands, refreshSkillsAfterCommandsChange,
} from '../stores/commandsHelpers';
import type { SlashCommandEntry } from '../stores/commandsHelpers';
import {
  pluginErrorMessage, pluginsWorkspaceKey, pluginsInFlight, runPluginOperation,
  loadPluginsListDeduped, loadPluginsList, refreshCommandsAfterPluginSync, refreshPluginsAfterRemoteSync,
} from '../stores/pluginsHelpers';
import type { PluginDiagnostic, PluginsAgentService } from '../stores/pluginsHelpers';

export {
  SESSION_ACTIVITY_FIELD, withSessionActivity, sessionActivityOf, isSessionActivityActive,
  pendingInteractionOf, mergeMetaPreservingActivity, compareTasksBySortKey, compareTasksActiveFirst,
  compareTasks, taskWorkspaceKey, taskEntityKey, dedupeWorkspaceScopes, normalizeSearchTerm,
  normalizeSearchDescriptor, descriptorCacheKey, subscribeSessionActivity, broadcastSessionActivity,
  freezeQueryResult, descriptorMembershipMatch, titleMatchesSearch, descriptorContainsTask,
  sortTaskKeysByDescriptor, shallowEqualLoose, mergeTaskMetaEntry, isQueryResultEquivalent,
  mergeIncomingTaskKeys, pickBestTaskMetadata, useSessionActivityStore,
};
export type { TaskMeta, SessionActivity, SearchDescriptor, QueryResultInput, QueryResult, WorkspaceScope };

export {
  automationErrorMessage, nextAutomationLoadSeq, currentAutomationLoadSeq, automationRunNowInFlight,
  isSameAutomationWorkspace, findAutomation, loadAutomationsIntoStore, AUTOMATION_CREATE_LIMIT_CODE,
  isAutomationLimitError,
};
export type { Automation, AutomationsAgentService };

export { isTakeNumberFailure };
export type { OffPeakCreateResult };

export {
  hooksWorkspaceKey, hookLocationForScope, isHookEditable, buildNewHook, mergeHookPatch,
  reloadHooks, saveHooksList,
};
export type { HookDescriptor, HooksService };

export {
  commandsInFlight, commandsWorkspaceKey, trimLeadingSlashes, commandNameKey,
  userCommandToSlashCommand, mergeCommandsIntoSlashCommands, refreshSkillsAfterCommandsChange,
};
export type { SlashCommandEntry };

export {
  pluginErrorMessage, pluginsWorkspaceKey, pluginsInFlight, runPluginOperation,
  loadPluginsListDeduped, loadPluginsList, refreshCommandsAfterPluginSync, refreshPluginsAfterRemoteSync,
};
export type { PluginDiagnostic, PluginsAgentService };

/* ============================================================================
 * §G. 用量数据钩子（原 js 195171–195258；F12 域）——边界裁决：让位
 * ----------------------------------------------------------------------------
 * K$t/q$t/J$t（usageErrorMessage/useAppUsageStats/useCodingPlanUsageStats）
 * 已由并行 B4-1 批 UsageDeep.tsx（F12 ProviderPlanUsageFamily，2026-08-26 18:28
 * 完成，锚点 js 195179/195206 逐条命中）全量实体化。按 MODULE-MAP 族归属
 * （F12）裁决：UsageDeep.tsx 为唯一规范实现，本文件不重复收录。
 * 裁决记录见 B4 合并报告（SettingsModalsStoresLeaves.report.md）§4。
 * ==========================================================================*/

/* ============================================================================
 * §H. 遥测下沉函数块（原 js 40397–41807）
 * ----------------------------------------------------------------------------
 * services.tsx 的 ConversationTelemetrySupervisor（hT）与 F03/F20 消费的
 * 29 个接口级下沉函数的实体化 + 其闭包状态（Ow/kw/Aw/jw/sT/$w 等）与同块纯助手。
 * ==========================================================================*/

export interface TelemetryPlatform {
  reportTelemetryEvent(report: Record<string, unknown>): Promise<void> | void;
  reportArmsCustomEvent(event: ArmsCustomEvent): Promise<void> | void;
}

export interface ArmsCustomEvent {
  name: string;
  group?: string;
  value?: number;
  properties?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface TelemetryReport {
  elementName: string;
  eventRegion: string;
  eventType: string;
  eventExtraDetail?: Record<string, unknown>; // A0-CLEANUP3 3b：与域内各消费面（Conversation/OLL/EV）统一为 unknown 值域
  talkId?: string;
  messageId?: string;
  [key: string]: unknown;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  reasoningTokens?: number;
  cachedInputTokens?: number;
  cachedWriteInputTokens?: number;
}

/* --- H.1 供应商域（40397–40744） --- */

/** 原 bw/hNe（40445/40454；A1-R31 行号更正：旧注 40397/40406 为 -48 漂移误引，实测 styles 40445/40454）：供应商 → 上报主机名归一（zai 族→z.ai；bigmodel 族→bigmodel；zapi 保留） */
export function resolveTelemetryProviderHost(providerId: string | null | undefined): string {
  const id = providerId ?? "";
  return id === "zai" || id === providerIds.zai || isZaiPlanFamily(id)
    ? "z.ai"
    : id === "bigmodel" || id === providerIds.bigmodel || id === providerIds.bigmodelCodingPlan
      ? "bigmodel"
      : id === providerIds.zapi
        ? "zapi"
        : id;
}

/**
 * 原 xw（40457）：遥测上报总入口（附客户端上下文；message_completion/agent_step 打 info 日志；〔A1-R36〕行注清扫：旧注 40409 为漂移，实测 styles-local 40457-40466）
 * 失败仅 warn `[${scope}] telemetry 上报失败:`）。
 */
export async function reportTelemetry(platform: TelemetryPlatform, report: TelemetryReport, scope: string): Promise<void> {
  try {
    const payload = { context: telemetryClientContext(undefined), ...report };
    if (report.elementName === "message_completion" || report.elementName === "agent_step") {
      logger.info(`[${scope}] ${report.elementName} payload:`, payload);
    }
    await platform.reportTelemetryEvent(payload);
  } catch (error) {
    logger.warn(`[${scope}] telemetry 上报失败:`, error);
  }
}

/** 原 gNe/_Ne/vNe（40419）：供应商业务错误码 → 支持集/i18n key/恢复动作 */
export const PROVIDER_BUSINESS_CODES = ["1006", "1005", "3006", "3001", "3007", "3008", "3009", "3010", "3002", "2007", "429"];
const PROVIDER_BUSINESS_I18N: Record<string, string> = {
  1006: "zcode.error.providerBusiness.1006",
  1005: "zcode.error.providerBusiness.1005",
  3006: "zcode.error.providerBusiness.3006",
  3002: "zcode.error.providerBusiness.3002",
  3001: "zcode.error.providerBusiness.3001",
  3007: "zcode.error.providerBusiness.3007",
  3008: "zcode.error.providerBusiness.3008",
  3009: "zcode.error.providerBusiness.3009",
  3010: "zcode.error.providerBusiness.3010",
  2007: "zcode.error.providerBusiness.2007",
  429: "zcode.error.providerBusiness.429",
};
const PROVIDER_BUSINESS_ACTIONS: Record<string, string | null> = {
  1006: "login",
  1005: "refresh-quota",
  3006: "switch-model",
  3001: null,
  3007: "retry-captcha",
  3008: "upgrade",
  3009: "upgrade",
  3010: "upgrade",
  3002: "retry-later",
  2007: "retry-later",
  429: "retry-later",
};

/** 原 Sw（40494；A1-R13 行校正，旧注 40446）：是否供应商业务错误码 */
export function isProviderBusinessCode(code: string | null | undefined): boolean {
  return code ? PROVIDER_BUSINESS_CODES.includes(code) : false;
}
/** 原 yNe（40497；A1-R13 行校正，旧注 40449）：错误码 → i18n key */
export function providerBusinessI18nId(code: string | null | undefined): string | undefined {
  if (isProviderBusinessCode(code)) return PROVIDER_BUSINESS_I18N[code as string];
  return undefined;
}
/** 原 bNe（40500；A1-R13 行校正，旧注 40452）：错误码 → 恢复动作 */
export function providerBusinessRecoveryAction(code: string | null | undefined): string | null {
  return isProviderBusinessCode(code) ? PROVIDER_BUSINESS_ACTIONS[code as string] : null;
}

/** 原 xNe/SNe（40455/40456）：配额耗尽归一（1005 直通；文案含 exceed/quota 且错误类型属集 → 1005） */
const QUOTA_ERROR_TYPES = new Set(["PROVIDER_BUSINESS_ERROR", "SEND_FAILED", "unknown_error"]);
export function normalizeQuotaExhaustedCode(code: string | null | undefined, message: string | null | undefined): string | undefined {
  if (code === "1005") return "1005";
  const normalizedCode = code?.trim();
  const normalizedMessage = message?.trim().toLowerCase();
  if (
    normalizedMessage &&
    (normalizedMessage.includes("exceed limit") ||
      normalizedMessage.includes("exceed quota limit") ||
      normalizedMessage.includes("quota exceeded")) &&
    (!normalizedCode || QUOTA_ERROR_TYPES.has(normalizedCode))
  )
    return "1005";
  return undefined;
}

/** 原 CNe…ENe（40469–40490）：并发限流归一的词表与 13xx 码集 */
const RATE_LIMIT_ERROR_TYPES = new Set(["PROVIDER_BUSINESS_ERROR", "SEND_FAILED", "unknown_error", "MODEL_RATE_LIMITED"]);
const CONCURRENCY_WORDS = ["concurrent", "concurrency", "并发"];
const MODEL_WORDS = ["model", "模型"];
const QUOTA_13XX_CODES = new Set([
  "1308", "1309", "1310", "1311", "1313", "1314", "1315", "1316", "1317", "1318", "1319", "1320", "1321",
]);

/** 原 DNe（40492）：并发限流归一（3008/3009/3010 直通；并发词 ∧ 模型词→3009，否则 3008） */
export function normalizeConcurrencyLimitCode(code: string | null | undefined, message: string | null | undefined): string | undefined {
  if (code === "3008") return "3008";
  if (code === "3009") return "3009";
  if (code === "3010") return "3010";
  const normalizedCode = code?.trim();
  const normalizedMessage = message?.trim().toLowerCase();
  if (normalizedMessage && CONCURRENCY_WORDS.some((word) => normalizedMessage.includes(word)) && (!normalizedCode || RATE_LIMIT_ERROR_TYPES.has(normalizedCode)))
    return MODEL_WORDS.some((word) => normalizedMessage.includes(word)) ? "3009" : "3008";
  return undefined;
}

/** 原 ONe（40501）：13xx 配额码直通 */
export function normalizeQuota13xxCode(code: string | null | undefined): string | undefined {
  const normalized = code?.trim();
  if (normalized && QUOTA_13XX_CODES.has(normalized)) return normalized;
  return undefined;
}

/** 原 kNe（40505）：busy 子类（重试耗尽 vs 初始） */
export function resolveBusySubKind(message: string | null | undefined): string {
  return message?.trim() === "Start Plan is busy and automatic model stream recovery reached the maximum retry count."
    ? "retry-exhausted-busy"
    : "initial-busy";
}

/** 原 ANe（40511）：验证码失败文案判定 */
export function isCaptchaVerificationFailure(message: string | null | undefined): boolean {
  if (!message?.trim()) return false;
  const lowered = message.toLowerCase();
  return (
    message.includes("Captcha verification failed or the verify token was rejected.") ||
    message.includes("verify token was rejected") ||
    lowered.includes("captcha verify failed") ||
    lowered.includes("验证码校验失败") ||
    lowered.includes("captcha verification failed")
  );
}

/** 原 Cw（40570）：验证码归一。A1-R12 收敛：bundle 真身 = stub（`return void 0`，3007 归一在此构建被禁用）；
 *  此前转录为前代语义体（3007 | CAPTCHA_VERIFY_FAILED | 文案判定），与 bundle 行为不符，今改回逐字。
 *  下游 resolveBusinessRecoveryAction（JNe，40680 消费面）与 bundle 归约一致（`!Sw(code)` 分支独占）。 */
export function normalizeCaptchaCode(code: string | null | undefined, message: string | null | undefined): string | undefined {
  return void 0;
}

/** 原 jNe（40573；A1-R13 行校正，旧注 40525）：模型空响应判定 */
export function isEmptyModelResponse(message: string | null | undefined): boolean {
  return message
    ? message.includes("Model returned no text, no tool calls, and no usage before completing the turn.") ||
        message.includes("Model returned no text")
    : false;
}

/** 原 MNe…GNe（40532–40615）：chat_error_banner 常量族 */
const CHAT_ERROR_BANNER_ELEMENT = "chat_error_banner";
const UI_ERROR_GROUP = "ui_error";
const DISPLAY_MESSAGE_LIMIT = 500;
const UNKNOWN_FAILURE_REASON = "unknown";
const BUILTIN_BANNER_PROVIDERS = new Set([
  providerIds.zai,
  providerIds.zaiCodingPlan,
  providerIds.zaiStartPlan,
  providerIds.bigmodel,
  providerIds.bigmodelCodingPlan,
  providerIds.bigmodelStartPlan,
]);
const PROVIDER_CODE_FAILURE_REASONS: Record<string, string> = {
  1005: "quota_exhausted",
  1006: "auth_failed",
  1120: "server_error",
  1230: "server_error",
  1234: "network_error",
  1261: "context_exceeded",
  1302: "rate_limited",
  1303: "rate_limited",
  1304: "quota_exhausted",
  1305: "rate_limited",
  1308: "quota_exhausted",
  1309: "plan_expired",
  1310: "quota_exhausted",
  1311: "plan_access_denied",
  1312: "provider_overloaded",
  1313: "quota_exhausted",
  1314: "quota_exhausted",
  1315: "quota_exhausted",
  1316: "quota_exhausted",
  1317: "quota_exhausted",
  1318: "quota_exhausted",
  1319: "quota_exhausted",
  1320: "quota_exhausted",
  1321: "quota_exhausted",
  2007: "server_error",
  3001: "invalid_request",
  3002: "rate_limited",
  3006: "model_not_found",
  3007: "auth_failed",
  3008: "rate_limited",
  3009: "rate_limited",
  3010: "rate_limited",
  429: "rate_limited",
};
const RATE_LIMIT_PATTERN = /error[_ -]?rate[_ -]?limited|rate[_ -]?limit|too many requests|request higher limits|throttl/iu;
const BALANCE_PATTERN = /insufficient\s+(?:balance|funds|credit)|balance\s+(?:is\s+)?(?:insufficient|too\s+low)|余额不足|余额不够/iu;
const PLAN_EXPIRED_PATTERN = /(?:coding|subscription|套餐|plan).{0,24}(?:expired|到期)/iu;
const CONTEXT_PATTERN = /context.{0,32}(?:length|window|exceed|limit)|prompt.{0,24}too long|上下文.{0,16}(?:超|限制)/iu;
const AUTH_PATTERN = /unauthori[sz]ed|authentication|invalid\s+(?:api\s+)?key|access\s+denied|鉴权|认证失败/iu;
const NETWORK_PATTERN = /network|connection|econn(?:reset|refused)|enotfound|tls|proxy|网络|连接失败/iu;
const TIMEOUT_PATTERN = /timeout|timed out|超时/iu;
const OVERLOAD_PATTERN = /overload|overloaded|server busy|服务繁忙|过载/iu;
const QUOTA_PATTERN = /quota|usage\s+limit|exceed(?:ed)?\s+(?:the\s+)?(?:limit|quota)|额度|用量上限|使用量上限/iu;
const INVALID_REQUEST_PATTERN = /invalid\s+(?:request|argument|parameter)|bad request|参数错误|请求参数/iu;
const GLM_MODEL_IDS = new Set([
  "charglm-4", "codegeex-4", "emohaa", "glm-4.1v-thinking-flash", "glm-4.1v-thinking-flashx",
  "glm-4.5", "glm-4.5-air", "glm-4.6", "glm-4.6v", "glm-4.6v-flash", "glm-4.6v-flashx",
  "glm-4.7", "glm-4.7-flash", "glm-4.7-flashx", "glm-4-flash-250414", "glm-4-flashx-250414",
  "glm-4v-flash", "glm-5", "glm-5.1", "glm-5.1-highspeed", "glm-5.2", "glm-5-turbo",
]);

/** 原 KNe（40616）：供应商作用域（内置族 → builtin；其余有值 → custom；无 → unknown） */
export function resolveProviderScope(providerId: string | null | undefined): { providerId: string; providerScope: string } {
  return providerId
    ? isZaiProviderFamily(providerId) || GLM_MODEL_IDS.has(providerId)
      ? { providerId, providerScope: "builtin" }
      : { providerId: "custom", providerScope: "custom" }
    : { providerId: "", providerScope: "unknown" };
}

/** 原 qNe（40623）：模型 id 脱敏（custom 作用域或非内置模型 → `custom`） */
export function sanitizeModelIdForBanner(providerScope: string, modelId: string | null | undefined): string {
  const normalized = modelId?.trim().toLowerCase();
  return !normalized || providerScope === "unknown"
    ? ""
    : providerScope === "custom" || (providerScope === "builtin" && !GLM_MODEL_IDS.has(normalized))
      ? "custom"
      : normalized;
}

/** 原 JNe（40631）：业务恢复动作解析（验证码优先；非业务码 → null） */
export function resolveBusinessRecoveryAction(error: {
  code?: string | null;
  message?: string | null;
}): { kind: string; providerBusinessCode: string } | null {
  if (normalizeCaptchaCode(error.code, error.message) || !isProviderBusinessCode(error.code)) return null;
  const kind = providerBusinessRecoveryAction(error.code);
  return kind ? { kind, providerBusinessCode: error.code as string } : null;
}

/** 原 YNe（40636）：展示消息截断（500 字符） */
export function truncateDisplayMessage(message: string | null | undefined): string {
  return message ? (message.length > DISPLAY_MESSAGE_LIMIT ? message.slice(0, DISPLAY_MESSAGE_LIMIT) : message) : "";
}

interface BannerErrorInput {
  displayMessage: string;
  error: {
    taskId?: string;
    code?: string | null;
    traceId?: string | null;
    message: string;
    detail?: unknown;
    attribution?: {
      reason?: string;
      providerId?: string;
      providerErrorCode?: string;
      statusCode?: number;
      source?: string;
      modelId?: string;
      providerKind?: string;
      transport?: string;
      retryable?: unknown;
    };
  };
}

/** 原 XNe（40639）：失败原因归类（归因理由 → 供应商码表 → 状态码 → 文案正则瀑布 → unknown/空） */
export function resolveChatErrorFailureReason(input: BannerErrorInput): string {
  const attributionReason = input.error.attribution?.reason?.trim();
  if (attributionReason && attributionReason !== UNKNOWN_FAILURE_REASON) return attributionReason;
  const providerId = input.error.attribution?.providerId?.trim();
  const providerErrorCode =
    (providerId && (input.error.attribution?.providerErrorCode?.trim() || input.error.code?.trim())) || "";
  const mapped = providerId && BUILTIN_BANNER_PROVIDERS.has(providerId) ? PROVIDER_CODE_FAILURE_REASONS[providerErrorCode] : undefined;
  if (mapped) return mapped;
  const statusCode = input.error.attribution?.statusCode;
  if (statusCode === 402 && BALANCE_PATTERN.test(input.displayMessage)) return "balance_insufficient";
  if (statusCode === 401 || statusCode === 403) return "auth_failed";
  if (statusCode === 408 || statusCode === 504) return "timeout";
  if (statusCode === 429) return "rate_limited";
  if (statusCode === 404) return "model_not_found";
  if (statusCode === 400 || statusCode === 422) return "invalid_request";
  if (statusCode !== undefined && statusCode >= 500 && statusCode <= 599) return "server_error";
  const combined = `${input.displayMessage}\n${input.error.message}`;
  return BALANCE_PATTERN.test(combined)
    ? "balance_insufficient"
    : PLAN_EXPIRED_PATTERN.test(combined)
      ? "plan_expired"
      : RATE_LIMIT_PATTERN.test(combined)
        ? "rate_limited"
        : CONTEXT_PATTERN.test(combined)
          ? "context_exceeded"
          : AUTH_PATTERN.test(combined)
            ? "auth_failed"
            : NETWORK_PATTERN.test(combined)
              ? "network_error"
              : TIMEOUT_PATTERN.test(combined)
                ? "timeout"
                : OVERLOAD_PATTERN.test(combined)
                  ? "provider_overloaded"
                  : QUOTA_PATTERN.test(combined)
                    ? "quota_exhausted"
                    : INVALID_REQUEST_PATTERN.test(combined)
                      ? "invalid_request"
                      : attributionReason || (input.error.attribution ? UNKNOWN_FAILURE_REASON : "");
}

/** 原 Dw（40677）：错误键段清洗（`:`/空白 → `_`，128 截断） */
export function sanitizeErrorKeySegment(value: string | null | undefined, fallback: string): string {
  const normalized = value?.trim();
  return normalized ? normalized.replace(/[:\s]+/g, "_").slice(0, 128) : fallback;
}

/** 原 ZNe（40686）：FNV-1a 32 位哈希（8 位十六进制） */
export function fnv1aHex(input: string): string {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

/** 原 QNe（40690）：错误键（任务:码:trace:动作:供应商码:内容哈希） */
export function buildChatErrorKey(input: BannerErrorInput & {
  errorKey?: string;
  providerBusinessRecoveryAction?: { kind?: string; providerBusinessCode?: string } | null;
}): string {
  const recovery = input.providerBusinessRecoveryAction;
  const joined = [
    input.errorKey?.trim() ?? "",
    input.error.taskId ?? "",
    input.error.code ?? "",
    input.error.traceId ?? "",
    input.error.message,
    input.displayMessage,
    recovery?.kind ?? "",
    recovery?.providerBusinessCode ?? "",
  ].join("");
  return [
    sanitizeErrorKeySegment(input.error.taskId, "no-task"),
    sanitizeErrorKeySegment(input.error.code, "UNKNOWN"),
    sanitizeErrorKeySegment(input.error.traceId, "no-trace"),
    sanitizeErrorKeySegment(recovery?.kind, "no-action"),
    sanitizeErrorKeySegment(recovery?.providerBusinessCode, "no-provider-code"),
    fnv1aHex(joined),
  ].join(":");
}

/** 原 $Ne（40707）：chat_error_banner ARMS 载荷 */
export function buildChatErrorBannerEvent(input: BannerErrorInput & {
  surface?: string;
  errorKey?: string;
  providerBusinessRecoveryAction?: { kind?: string; providerBusinessCode?: string } | null;
}): ArmsCustomEvent {
  const displayMessage = truncateDisplayMessage(input.displayMessage);
  const taskId = input.error.taskId ?? "";
  const recovery = input.providerBusinessRecoveryAction;
  const attribution = input.error.attribution;
  const scope = resolveProviderScope(attribution?.providerId);
  return {
    name: CHAT_ERROR_BANNER_ELEMENT,
    group: UI_ERROR_GROUP,
    value: 1,
    properties: {
      surface: input.surface ?? "chat_input_error_banner",
      error_key: buildChatErrorKey({
        errorKey: input.errorKey,
        error: input.error,
        displayMessage: input.displayMessage,
        providerBusinessRecoveryAction: recovery,
      }),
      error_code: input.error.code ?? "",
      error_message: displayMessage,
      trace_id: input.error.traceId ?? "",
      task_id: taskId,
      has_detail: !!input.error.detail,
      provider_business_action: recovery?.kind ?? "",
      provider_business_code: recovery?.providerBusinessCode ?? "",
      error_source: attribution?.source ?? "",
      failure_reason: resolveChatErrorFailureReason({ displayMessage: input.displayMessage, error: input.error }),
      provider_scope: scope.providerScope,
      provider_id: scope.providerId,
      model_id: sanitizeModelIdForBanner(scope.providerScope, attribution?.modelId),
      provider_kind: attribution?.providerKind ?? "",
      transport: attribution?.transport ?? "",
      status_code: attribution?.statusCode ?? "",
      provider_error_code: attribution?.providerErrorCode ?? "",
      failure_retryable: attribution?.retryable ?? "",
    },
  };
}

/** 原 ePe（40745）：聊天错误横幅上报（失败仅 warn `[ChatViewErrorBanner] ARMS 上报失败:`） */
export async function reportVisibleChatErrorSink(
  platform: TelemetryPlatform,
  payload: BannerErrorInput & { surface?: string; errorKey?: string; providerBusinessRecoveryAction?: { kind?: string; providerBusinessCode?: string } | null },
): Promise<void> {
  try {
    await platform.reportArmsCustomEvent(buildChatErrorBannerEvent(payload));
  } catch (error) {
    logger.warn("[ChatViewErrorBanner] ARMS 上报失败:", error);
  }
}

/* --- H.2 会话步骤域（40752–41420）：闭包状态 + 步骤工厂 + 下沉函数 --- */

/** 原 Ow/kw/Aw/jw（40752）：输入计时 / 提示词生命周期 / 活动生命周期 / 步骤状态 四表（键 = 工作区/任务） */
const inputTimingByWorkspace = new Map<string, { inputStartTime: number; inputFirstCharTime: number }>();
const promptLifecyclesByTask = new Map<string, PromptLifecycleRecord[]>();
const activeLifecycleByTask = new Map<string, PromptLifecycleRecord>();
const stepStateByTask = new Map<string, StepState>();

interface PromptLifecycleRecord {
  taskId: string;
  messageId: string;
  inputId?: string;
  baseEventExtraDetail: Record<string, string>;
  sendTime: number;
  inputStartTime: number;
  inputFirstCharTime: number;
  waitingMs: number;
  permissionWaitsByRequestId: Map<string, { requestedAt: number; toolCallId?: string }>;
  firstTokenAt: number | null;
  usage: TokenUsage | null;
  usageEventKeys: Set<string>;
  finalizedAgentStepCount: number;
  toolCallTotal: number;
  toolCallFailed: number;
  firstToolCallError: string;
}

interface StepModelRef {
  requestId?: string;
  modelName: string;
  modelProvider: string;
  providerName: string;
}

interface StepUsageRef {
  requestIds: string[];
  requestCount: number;
  scope: string;
  usage: TokenUsage | null;
}

interface StepRecord {
  stepId: string;
  stepType: string;
  loopIndex: number;
  startedAt: number;
  waitingMs: number;
  model?: StepModelRef;
  usage?: StepUsageRef;
  toolId?: string;
  toolName?: string;
  agentId?: string;
  lastMessageChunkAt?: number;
}

interface StepState {
  nextLoopIndex: number;
  currentModelRequest: StepModelRef | null;
  pendingUsageByRequestId: Map<string, StepUsageRef>;
  reasoningStep: StepRecord | null;
  generationStep: StepRecord | null;
  toolStepsById: Map<string, StepRecord>;
  settledPermissionWaitsByToolId: Map<string, { waitingMs: number; earliestRequestedAt: number }>;
}

/** 原 tPe（40756）：供应商名解析（模型名内嵌供应商优先；供应商键 custom:/ghost:/native: 三分支） */
export function resolveStepProviderName(args: {
  modelName?: string | null;
  provider?: string | null;
  selectedSupplierKey?: string | null;
}): string {
  const { modelName, provider, selectedSupplierKey } = args;
  return (
    providerOfModelName(modelName) ||
    (selectedSupplierKey
      ? selectedSupplierKey.startsWith("custom:")
        ? selectedSupplierKey.slice(7).trim() || provider || ""
        : selectedSupplierKey.startsWith("ghost:")
          ? provider ?? ""
          : selectedSupplierKey.startsWith("native:")
            ? selectedSupplierKey.slice(7).trim() || provider || ""
            : provider ?? ""
      : provider ?? "")
  );
}

/** 原 Mw（40771）：从模型名提取供应商（`custom:` 键解析 → `/` 前缀） */
export function providerOfModelName(modelName: string | null | undefined): string | null {
  const normalized = modelName?.trim() ?? "";
  if (!normalized) return null;
  const custom = parseCustomModelKey(normalized);
  if (custom?.providerId?.trim()) return custom.providerId.trim();
  const slash = normalized.indexOf("/");
  return slash <= 0 ? null : normalized.slice(0, slash).trim() || null;
}

/** 原 Nw（40779）：baseURL → 主机名（解析失败空串） */
export function hostnameOfBaseUrl(baseUrl: string | null | undefined): string {
  const normalized = baseUrl?.trim() ?? "";
  if (!normalized) return "";
  try {
    return new URL(normalized).hostname;
  } catch {
    return "";
  }
}

/** 原 Pw（40788）：步骤状态工厂 */
export function createStepState(): StepState {
  return {
    nextLoopIndex: 1,
    currentModelRequest: null,
    pendingUsageByRequestId: new Map(),
    reasoningStep: null,
    generationStep: null,
    toolStepsById: new Map(),
    settledPermissionWaitsByToolId: new Map(),
  };
}

/** 原 Fw（40799）：取/建任务步骤状态 */
export function stepStateOf(taskId: string): StepState {
  const existing = stepStateByTask.get(taskId);
  if (existing) return existing;
  const created = createStepState();
  stepStateByTask.set(taskId, created);
  return created;
}

/** 原 Iw（40805）：步骤工厂（stepId/loopIndex/起始时刻；按 requestId 吸附挂起用量） */
export function createStep(
  state: StepState,
  stepType: string,
  now: number,
  extra: Partial<StepRecord> = {},
): StepRecord {
  const step: StepRecord = {
    stepId: generateRandomId(),
    stepType,
    loopIndex: state.nextLoopIndex,
    startedAt: now,
    waitingMs: 0,
    ...(state.currentModelRequest ? { model: { ...state.currentModelRequest } } : {}),
    ...extra,
  };
  const requestId = step.model?.requestId;
  if (requestId) {
    const pending = state.pendingUsageByRequestId.get(requestId);
    if (pending) {
      step.usage = pending;
      state.pendingUsageByRequestId.delete(requestId);
    }
  }
  state.nextLoopIndex += 1;
  return step;
}

/** 原 nPe（40822）：工具状态归一（failed/fail/denied → fail；timeout → timeout；其余 success） */
export function normalizeToolStatus(status: string): "success" | "fail" | "timeout" {
  return status === "failed" || status === "fail" || status === "denied"
    ? "fail"
    : status === "timeout"
      ? "timeout"
      : "success";
}

/** 原 rPe（40829）：从 tool_call_update.content 提取自动化 id（字符串宽容 JSON 解析） */
export function extractAutomationIdFromContent(content: unknown): string | undefined {
  let parsed: unknown = content;
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return;
    }
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return;
  const automation = (parsed as { automation?: unknown }).automation;
  if (!automation || typeof automation !== "object" || Array.isArray(automation)) return;
  const automationId = (automation as { automationId?: unknown }).automationId;
  return typeof automationId === "string" && automationId.trim() ? automationId.trim() : undefined;
}

/** 原 Lw（40843）：首 token 打点（仅一次） */
export function markFirstToken(lifecycle: PromptLifecycleRecord, now: number): void {
  if (lifecycle.firstTokenAt === null) lifecycle.firstTokenAt = now;
}

/** 原 Rw（40846）：agent_step 载荷（工具计数/错误首录 + 全量 eventExtraDetail 序列化） */
export function buildAgentStepEvent(args: {
  prompt: PromptLifecycleRecord;
  step: StepRecord;
  finishedAt: number;
  status: string;
  errorType?: string;
  errorMsg?: string;
  generationTailFinalizeMs?: number;
  automationId?: string;
}): { taskId: string; messageId: string; eventExtraDetail: Record<string, string> } {
  const status = normalizeToolStatus(args.status);
  const isToolCall = args.step.stepType === "tool_call";
  const usage = args.step.usage?.usage;
  const model = args.step.model;
  args.prompt.finalizedAgentStepCount += 1;
  if (isToolCall) {
    args.prompt.toolCallTotal += 1;
    if (status !== "success" || args.errorMsg) {
      args.prompt.toolCallFailed += 1;
      if (!args.prompt.firstToolCallError && args.errorMsg) args.prompt.firstToolCallError = args.errorMsg;
    }
  }
  return {
    taskId: args.prompt.taskId,
    messageId: args.prompt.messageId,
    eventExtraDetail: {
      step_id: args.step.stepId,
      is_tftt_cached: "0",
      loop_index: String(args.step.loopIndex),
      step_type: args.step.stepType,
      model_name: model?.modelName ?? args.prompt.baseEventExtraDetail.model_name ?? "",
      model_provider: model?.modelProvider ?? args.prompt.baseEventExtraDetail.model_provider ?? "",
      provider_name: model?.providerName ?? args.prompt.baseEventExtraDetail.provider_name ?? "",
      model_request_id: args.step.usage?.requestIds.length === 1 ? args.step.usage.requestIds[0] ?? "" : "",
      model_request_count: String(args.step.usage?.requestCount ?? 0),
      token_usage_scope: args.step.usage?.scope ?? "",
      is_tool_call: isToolCall ? "1" : "0",
      tool_name: args.step.toolName ?? "",
      tool_call_id: isToolCall ? args.step.toolId ?? "" : "",
      ...(args.step.agentId ? { agent_id: args.step.agentId } : {}),
      duration_ms: String(Math.max(args.finishedAt - args.step.startedAt, 0)),
      waiting_ms: String(args.step.waitingMs),
      generation_tail_finalize_ms: args.generationTailFinalizeMs === undefined ? "" : String(args.generationTailFinalizeMs),
      status,
      input_tokens: String(usage?.inputTokens ?? 0),
      output_tokens: String(usage?.outputTokens ?? 0),
      reasoning_tokens: String(usage?.reasoningTokens ?? 0),
      cached_tokens: String(usage?.cachedInputTokens ?? 0),
      cache_write_input_tokens: String(usage?.cachedWriteInputTokens ?? 0),
      total_tokens: String(usage?.totalTokens ?? 0),
      error_type: status === "success" ? "" : args.errorType ?? "UNKNOWN",
      error_msg: status === "success" ? "" : args.errorMsg ?? "",
      ...(args.automationId ? { automation_id: args.automationId } : {}),
    },
  };
}

/** 原 zw（40895）：推理步收尾（有则载荷化并置空） */
export function finalizeReasoningStep(
  prompt: PromptLifecycleRecord,
  state: StepState,
  now: number,
  finalized: Array<{ taskId: string; messageId: string; eventExtraDetail: Record<string, string> }>,
): void {
  if (state.reasoningStep) {
    finalized.push(buildAgentStepEvent({ prompt, step: state.reasoningStep, finishedAt: now, status: "success" }));
    state.reasoningStep = null;
  }
}

/** 原 Bw（40899）：生成步收尾（desktop-continuous ∧ 任务终端 ∧ 有末块时刻 → 尾部时延） */
export function finalizeGenerationStep(
  prompt: PromptLifecycleRecord,
  state: StepState,
  now: number,
  status: string,
  finalized: Array<{ taskId: string; messageId: string; eventExtraDetail: Record<string, string> }>,
  error: { type: string; msg: string } | undefined,
  trigger: string,
  clientMode: string = "desktop-continuous",
): void {
  if (!state.generationStep) return;
  const tailMs =
    clientMode === "desktop-continuous" && (trigger === "task_complete" || trigger === "task_error") && state.generationStep.lastMessageChunkAt !== undefined
      ? Math.max(now - state.generationStep.lastMessageChunkAt, 0)
      : undefined;
  finalized.push(
    buildAgentStepEvent({
      prompt,
      step: state.generationStep,
      finishedAt: now,
      status,
      errorType: error?.type,
      errorMsg: error?.msg,
      generationTailFinalizeMs: tailMs,
    }),
  );
  state.generationStep = null;
}

/** 原 Vw（40920）：单次权限等待结算（时长计入生命周期与工具步/已结算表） */
export function settlePermissionWait(
  lifecycle: PromptLifecycleRecord,
  state: StepState | undefined,
  requestId: string,
  now: number,
): void {
  const wait = lifecycle.permissionWaitsByRequestId.get(requestId);
  if (!wait) return;
  const waitedMs = Math.max(now - wait.requestedAt, 0);
  lifecycle.waitingMs += waitedMs;
  if (wait.toolCallId) {
    const toolStep = state?.toolStepsById.get(wait.toolCallId);
    if (toolStep) {
      toolStep.waitingMs += waitedMs;
    } else if (state) {
      const settled = state.settledPermissionWaitsByToolId.get(wait.toolCallId);
      state.settledPermissionWaitsByToolId.set(wait.toolCallId, {
        waitingMs: (settled?.waitingMs ?? 0) + waitedMs,
        earliestRequestedAt: Math.min(settled?.earliestRequestedAt ?? wait.requestedAt, wait.requestedAt),
      });
    }
  }
  lifecycle.permissionWaitsByRequestId.delete(requestId);
}

/** 原 Hw（40937）：工具步启动时吸附已结算权限等待 */
export function applySettledPermissionWaits(state: StepState, step: StepRecord): void {
  if (!step.toolId) return;
  const settled = state.settledPermissionWaitsByToolId.get(step.toolId);
  if (settled) {
    step.waitingMs += settled.waitingMs;
    step.startedAt = Math.min(step.startedAt, settled.earliestRequestedAt);
    state.settledPermissionWaitsByToolId.delete(step.toolId);
  }
}

/** 原 iPe（40945）：工具的最早权限请求时刻（已结算 ∧ 未结算并查） */
export function earliestPermissionRequestedAt(lifecycle: PromptLifecycleRecord, state: StepState, toolId: string): number | undefined {
  let earliest = state.settledPermissionWaitsByToolId.get(toolId)?.earliestRequestedAt;
  for (const wait of lifecycle.permissionWaitsByRequestId.values()) {
    if (wait.toolCallId === toolId) earliest = Math.min(earliest ?? wait.requestedAt, wait.requestedAt);
  }
  return earliest;
}

/** 原 Uw（40951）：结算某工具的全部未决权限等待 */
export function settleToolPermissionWaits(lifecycle: PromptLifecycleRecord, state: StepState | undefined, toolId: string, now: number): void {
  for (const [requestId, wait] of lifecycle.permissionWaitsByRequestId) {
    if (wait.toolCallId === toolId) settlePermissionWait(lifecycle, state, requestId, now);
  }
}

/** 原 Ww（40954）：结算全部未决权限等待 */
export function settleAllPermissionWaits(lifecycle: PromptLifecycleRecord, state: StepState | undefined, now: number): void {
  for (const requestId of lifecycle.permissionWaitsByRequestId.keys()) {
    settlePermissionWait(lifecycle, state, requestId, now);
  }
}

/** 原 Gw（40957）：收尾全部工具步（先结算权限等待） */
export function finalizeAllToolSteps(
  prompt: PromptLifecycleRecord,
  state: StepState,
  now: number,
  status: string,
  finalized: Array<{ taskId: string; messageId: string; eventExtraDetail: Record<string, string> }>,
  error?: { type: string; msg: string },
): void {
  for (const [toolId, step] of state.toolStepsById) {
    settleToolPermissionWaits(prompt, state, toolId, now);
    finalized.push(buildAgentStepEvent({ prompt, step, finishedAt: now, status, errorType: error?.type, errorMsg: error?.msg }));
  }
  state.toolStepsById.clear();
}

/** 原 Kw（40965）：模型请求公共字段（供应商/主机/计划快照） */
export function buildModelRequestCommonFields(args: {
  askMode?: string;
  modelName?: string;
  provider?: string;
  selectedSupplierKey?: string | null;
  providerBaseURL?: string;
  planIdentitySnapshot?: { planStatus?: string; planProductId?: string };
}): Record<string, string> {
  const providerName = resolveStepProviderName({
    modelName: args.modelName,
    provider: args.provider,
    selectedSupplierKey: args.selectedSupplierKey,
  });
  const hostname = hostnameOfBaseUrl(args.providerBaseURL);
  return {
    ask_mode: args.askMode ?? "",
    model_name: args.modelName ?? "",
    model_provider: providerName,
    ...(hostname ? { provider_name: hostname } : {}),
    agent: args.provider ?? "",
    plan_status: args.planIdentitySnapshot?.planStatus ?? "unknown",
    plan_product_id: args.planIdentitySnapshot?.planProductId ?? "",
  };
}

/** 原 aPe/oPe（40982/40983）：压缩终端状态集与判定 */
const COMPACTION_TERMINAL_STATUSES = ["completed", "failed", "interrupted"];
export function isCompactionTerminal(status: string): boolean {
  return COMPACTION_TERMINAL_STATUSES.includes(status);
}

/** 原 sPe（40986）：压缩载荷（非终端 → null；压缩比 4 位小数；模型字段按供应商有无两支） */
export function buildCompactionDetail(args: {
  timeline: {
    version?: number;
    kind?: string;
    type?: string;
    operationId?: string;
    status: string;
    trigger: string;
    display?: string;
    reason?: string;
    summaryMessageId?: string;
    attempt?: number;
    maxAttempts?: number;
    startedAt?: number;
    endedAt?: number;
    preCompactTokenCount?: number;
    postCompactTokenCount?: number;
    truePostCompactTokenCount?: number;
  };
  modelName?: string;
  provider?: string;
  selectedSupplierKey?: string | null;
  modelProvider?: string;
}): Record<string, string> | null {
  const { timeline } = args;
  if (!isCompactionTerminal(timeline.status)) return null;
  const modelFields = args.provider
    ? buildModelRequestCommonFields({ modelName: args.modelName, provider: args.provider, selectedSupplierKey: args.selectedSupplierKey })
    : { model_name: args.modelName ?? "", model_provider: "" };
  const pre = timeline.preCompactTokenCount ?? 0;
  const post = timeline.postCompactTokenCount ?? 0;
  const ratio = pre > 0 ? (post / pre).toFixed(4) : "";
  const duration =
    timeline.startedAt !== undefined && timeline.endedAt !== undefined ? String(Math.max(timeline.endedAt - timeline.startedAt, 0)) : "";
  return {
    status: timeline.status,
    trigger: timeline.trigger,
    reason: timeline.reason ?? "",
    attempt: String(timeline.attempt ?? 0),
    duration_ms: duration,
    pre_compact_tokens: String(pre),
    post_compact_tokens: String(post),
    true_post_compact_tokens: String(timeline.truePostCompactTokenCount ?? 0),
    compact_ratio: ratio,
    model_name: modelFields.model_name ?? "",
    model_provider: args.modelProvider?.trim() || modelFields.model_provider || "",
  };
}

/** 原 cPe（41017）：用量序列化（带来源标记；空用量 → 空对象） */
export function serializeUsageForCompletion(usage: TokenUsage | null | undefined, tokenSource?: string): Record<string, string> {
  return usage
    ? {
        input_tokens: String(usage.inputTokens),
        output_tokens: String(usage.outputTokens),
        reasoning_tokens: String(usage.reasoningTokens ?? 0),
        cached_input_tokens: String(usage.cachedInputTokens ?? 0),
        cache_write_input_tokens: String(usage.cachedWriteInputTokens ?? 0),
        tool_use_prompt_tokens: "0",
        total_tokens: String(usage.totalTokens),
        ...(tokenSource ? { token_source: tokenSource } : {}),
      }
    : {};
}

/** 原 qw（41031）：用量累加（空基 → 复制增量；可选字段 0 兜底） */
export function accumulateUsage(base: TokenUsage | null, delta: TokenUsage): TokenUsage {
  return base
    ? {
        inputTokens: base.inputTokens + delta.inputTokens,
        outputTokens: base.outputTokens + delta.outputTokens,
        totalTokens: base.totalTokens + delta.totalTokens,
        reasoningTokens: (base.reasoningTokens ?? 0) + (delta.reasoningTokens ?? 0),
        cachedInputTokens: (base.cachedInputTokens ?? 0) + (delta.cachedInputTokens ?? 0),
        cachedWriteInputTokens: (base.cachedWriteInputTokens ?? 0) + (delta.cachedWriteInputTokens ?? 0),
      }
    : {
        inputTokens: delta.inputTokens,
        outputTokens: delta.outputTokens,
        totalTokens: delta.totalTokens,
        reasoningTokens: delta.reasoningTokens ?? 0,
        cachedInputTokens: delta.cachedInputTokens ?? 0,
        cachedWriteInputTokens: delta.cachedWriteInputTokens ?? 0,
      };
}

/** 原 Jw（41050）：取/建输入计时 */
export function inputTimingOf(workspaceScopeKey: string): { inputStartTime: number; inputFirstCharTime: number } {
  const existing = inputTimingByWorkspace.get(workspaceScopeKey);
  if (existing) return existing;
  const created = { inputStartTime: 0, inputFirstCharTime: 0 };
  inputTimingByWorkspace.set(workspaceScopeKey, created);
  return created;
}

/** 原 lPe（41056）：消费输入计时（读后清零；缺省回退发送时刻） */
export function consumeInputTiming(workspaceScopeKey: string, now: number): { inputStartTime: number; inputFirstCharTime: number } {
  const timing = inputTimingOf(workspaceScopeKey);
  const start = timing.inputStartTime || timing.inputFirstCharTime || now;
  const firstChar = timing.inputFirstCharTime || start || now;
  inputTimingByWorkspace.set(workspaceScopeKey, { inputStartTime: 0, inputFirstCharTime: 0 });
  return { inputStartTime: start, inputFirstCharTime: firstChar };
}

/** 原 uPe（41065）：文件变更统计（按路径取末快照；行数 = 差异 added 合计） */
export function countFileChanges(
  fileChanges: Array<{ snapshots: Array<{ path: string; beforeContent: string; afterContent: string }> }> | null | undefined,
): { changedFileCount: number; generatedCodeLines: number } {
  if (!fileChanges || fileChanges.length === 0) return { changedFileCount: 0, generatedCodeLines: 0 };
  const byPath = new Map<string, { beforeContent: string; afterContent: string }>();
  for (const change of fileChanges) {
    for (const snapshot of change.snapshots) {
      const existing = byPath.get(snapshot.path);
      if (existing) existing.afterContent = snapshot.afterContent;
      else byPath.set(snapshot.path, { beforeContent: snapshot.beforeContent, afterContent: snapshot.afterContent });
    }
  }
  let lines = 0;
  for (const entry of byPath.values()) lines += countDiffLines(entry.beforeContent, entry.afterContent).added;
  return { changedFileCount: byPath.size, generatedCodeLines: lines };
}

/** 原 dPe（41079）：输入框聚焦打点（缺省 now） */
export function recordComposerFocusSink(workspaceScopeKey: string, now: number = Date.now()): void {
  const timing = inputTimingOf(workspaceScopeKey);
  timing.inputStartTime = now;
  timing.inputFirstCharTime = 0;
}

/** 原 fPe（41083）：首字符打点（空变更忽略；同时补聚焦时刻） */
export function recordComposerTextChangeSink(workspaceScopeKey: string, change: { length: number }, now: number = Date.now()): void {
  if (change.length === 0) return;
  const timing = inputTimingOf(workspaceScopeKey);
  if (timing.inputFirstCharTime === 0) {
    timing.inputFirstCharTime = now;
    if (timing.inputStartTime === 0) timing.inputStartTime = now;
  }
}

/** 原 pPe（41089）：提示词种子建档（生命周期入链 + 计时消费 + 基础明细返回） */
export function buildPromptSeedDetail(args: {
  workspacePath: string;
  taskId: string;
  messageId: string;
  sendTime: number;
  inputId?: string;
  extraDetail?: Record<string, string>;
}): Record<string, string> {
  const { inputStartTime, inputFirstCharTime } = consumeInputTiming(args.workspacePath, args.sendTime);
  const lifecycle: PromptLifecycleRecord = {
    taskId: args.taskId,
    messageId: args.messageId,
    ...(args.inputId ? { inputId: args.inputId } : {}),
    baseEventExtraDetail: args.extraDetail ? { ...args.extraDetail } : {},
    sendTime: args.sendTime,
    inputStartTime,
    inputFirstCharTime,
    waitingMs: 0,
    permissionWaitsByRequestId: new Map(),
    firstTokenAt: null,
    usage: null,
    usageEventKeys: new Set(),
    finalizedAgentStepCount: 0,
    toolCallTotal: 0,
    toolCallFailed: 0,
    firstToolCallError: "",
  };
  const chain = promptLifecyclesByTask.get(args.taskId) ?? [];
  promptLifecyclesByTask.set(args.taskId, [...chain, lifecycle]);
  return {
    ...lifecycle.baseEventExtraDetail,
    input_start_time: String(inputStartTime),
    input_first_char_time: String(inputFirstCharTime),
    input_send_time: String(args.sendTime),
  };
}

/** 原 mPe（41120）：轮次开始 → 弹出生命周期链尾（置活动表 + 步骤状态重置） */
export function recordTurnStarted(taskId: string, sourceCommandId: string): void {
  const chain = promptLifecyclesByTask.get(taskId);
  if (!chain || chain.length === 0) return;
  const index = chain.findIndex((lifecycle) => lifecycle.messageId === sourceCommandId);
  if (index === -1) return;
  const [lifecycle] = chain.splice(index, 1);
  if (lifecycle) {
    if (chain.length === 0) promptLifecyclesByTask.delete(taskId);
    else promptLifecyclesByTask.set(taskId, chain);
    activeLifecycleByTask.set(taskId, lifecycle);
    stepStateByTask.set(taskId, createStepState());
  }
}

/** 原 hPe（41128）：模型请求开始 → 当前模型请求字段 + 基础明细同步（inputId 守卫） */
export function recordModelRequestStatus(
  taskId: string,
  status: {
    statusType: string;
    inputId?: string;
    providerId?: string;
    modelId?: string;
    baseURL?: string;
    requestId?: string;
  },
  sourceCommandId: string,
): void {
  if (status.statusType !== "model_request_started") return;
  const lifecycle = activeLifecycleByTask.get(taskId);
  if (!lifecycle) return;
  const expectedInputId = sourceCommandId ?? lifecycle.inputId;
  if (expectedInputId && status.inputId && expectedInputId !== status.inputId) return;
  const providerId = status.providerId?.trim();
  const modelId = status.modelId?.trim();
  const hostname = hostnameOfBaseUrl(status.baseURL);
  const fullModel = modelId && providerId && !providerOfModelName(modelId) ? `${providerId}/${modelId}` : modelId;
  if (!providerId && !fullModel) return;
  const state = stepStateOf(taskId);
  state.currentModelRequest = {
    ...(status.requestId?.trim() ? { requestId: status.requestId.trim() } : {}),
    modelName: fullModel ?? lifecycle.baseEventExtraDetail.model_name ?? "",
    modelProvider: providerId ?? lifecycle.baseEventExtraDetail.model_provider ?? "",
    providerName: hostname || lifecycle.baseEventExtraDetail.provider_name || "",
  };
  lifecycle.baseEventExtraDetail = {
    ...lifecycle.baseEventExtraDetail,
    ...(fullModel ? { model_name: fullModel } : {}),
    ...(providerId ? { model_provider: providerId } : {}),
    ...(hostname ? { provider_name: hostname } : {}),
  };
}

/** 原 gPe（41153）：按 requestId 查活跃推理/生成步 */
export function findActiveStepByRequestId(state: StepState, requestId: string): StepRecord | undefined {
  return [state.generationStep, state.reasoningStep].find((step) => step?.model?.requestId === requestId) ?? undefined;
}

/** 原 _Pe（41156）：步骤用量合并（requestIds 去重；subagent 作用域吸附） */
export function mergeStepUsage(step: StepRecord, incoming: StepUsageRef): void {
  step.usage = step.usage
    ? {
        requestIds: [...new Set([...step.usage.requestIds, ...incoming.requestIds])],
        requestCount: step.usage.requestCount + incoming.requestCount,
        scope:
          step.usage.scope === "subagent_requests" || incoming.scope === "subagent_requests" ? "subagent_requests" : "model_request",
        usage: accumulateUsage(step.usage.usage, incoming.usage as TokenUsage),
      }
    : incoming;
}

/** 原 vPe（41169）：子代理工具归因（agentId/模型/用量写入工具步） */
export function recordSubagentToolAttribution(args: {
  taskId: string;
  toolCallId: string;
  agentId?: string;
  modelName?: string;
  modelProvider?: string;
  providerName?: string;
  usage?: TokenUsage;
  requestIds: string[];
  requestCount: number;
}): void {
  const step = stepStateByTask.get(args.taskId)?.toolStepsById.get(args.toolCallId);
  if (step) {
    step.agentId = args.agentId;
    if (args.modelName || args.modelProvider || args.providerName) {
      step.model = {
        modelName: args.modelName as string,
        modelProvider: args.modelProvider as string,
        providerName: args.providerName as string,
      };
    }
    if (args.usage) {
      step.usage = {
        requestIds: [...args.requestIds],
        requestCount: args.requestCount,
        scope: "subagent_requests",
        usage: { ...args.usage },
      };
    }
  }
}

/** 原 Yw（41187）：工具步归因字段补写 */
export function applyToolAttribution(step: StepRecord, attribution: { agentId?: string; modelName?: string; modelProvider?: string; providerName?: string } | undefined): void {
  if (attribution) {
    if (attribution.agentId) step.agentId = attribution.agentId;
    if (attribution.modelName || attribution.modelProvider || attribution.providerName) {
      step.model = {
        modelName: attribution.modelName ?? "",
        modelProvider: attribution.modelProvider ?? "",
        providerName: attribution.providerName ?? "",
      };
    }
  }
}

/** 原 Xw（41197）：工具调用前的生成步补收尾（当前请求有挂起用量 ∧ 无活跃步时） */
export function closeGenerationBeforeToolCall(args: {
  prompt: PromptLifecycleRecord;
  state: StepState;
  now: number;
  finalized: Array<{ taskId: string; messageId: string; eventExtraDetail: Record<string, string> }>;
  clientMode: string;
}): void {
  const requestId = args.state.currentModelRequest?.requestId;
  if (
    !requestId ||
    args.state.reasoningStep ||
    args.state.generationStep ||
    !args.state.pendingUsageByRequestId.has(requestId)
  )
    return;
  args.state.generationStep = createStep(args.state, "generation", args.now);
  finalizeGenerationStep(args.prompt, args.state, args.now, "success", args.finalized, undefined, "tool_call", args.clientMode);
}

/** 原 Zw（41206）：会话事件 → agent_step 载荷集（事件分派状态机；活动生命周期缺失 → 空集） */
export function finalizeConversationSteps(args: {
  taskId: string;
  event: { type: string; [key: string]: unknown };
  activeInputId: string;
  clientMode: string;
  toolAttribution?: { agentId?: string; modelName?: string; modelProvider?: string; providerName?: string };
  now?: number;
}): Array<{ taskId: string; messageId: string; eventExtraDetail: Record<string, string> }> {
  const lifecycle = activeLifecycleByTask.get(args.taskId);
  if (!lifecycle) return [];
  const eventInputId = "inputId" in args.event && typeof args.event.inputId === "string" ? (args.event.inputId as string) : undefined;
  if (args.activeInputId && eventInputId && args.activeInputId !== eventInputId) return [];
  const now = args.now ?? Date.now();
  const state = stepStateOf(args.taskId);
  const finalized: Array<{ taskId: string; messageId: string; eventExtraDetail: Record<string, string> }> = [];
  const event = args.event as {
    type: string;
    zcodeTimeline?: unknown;
    parentToolUseId?: string;
    toolId?: string;
    toolName?: string;
    kind?: string;
    status?: string;
    error?: string;
    code?: string;
    content?: unknown;
  };
  switch (event.type) {
    case "agent_thought_chunk": {
      markFirstToken(lifecycle, now);
      if (!state.reasoningStep) {
        finalizeGenerationStep(lifecycle, state, now, "success", finalized, undefined, "reasoning", args.clientMode);
        state.reasoningStep = createStep(state, "reasoning", now);
      }
      return finalized;
    }
    case "agent_message_chunk": {
      if (event.zcodeTimeline || event.parentToolUseId) return finalized;
      markFirstToken(lifecycle, now);
      finalizeReasoningStep(lifecycle, state, now, finalized);
      if (!state.generationStep) state.generationStep = createStep(state, "generation", now);
      state.generationStep.lastMessageChunkAt = now;
      return finalized;
    }
    case "tool_call": {
      markFirstToken(lifecycle, now);
      finalizeReasoningStep(lifecycle, state, now, finalized);
      finalizeGenerationStep(lifecycle, state, now, "success", finalized, undefined, "tool_call", args.clientMode);
      closeGenerationBeforeToolCall({ prompt: lifecycle, state, now, finalized, clientMode: args.clientMode });
      const step = createStep(state, "tool_call", now, { toolId: event.toolId, toolName: event.toolName ?? event.kind });
      applyToolAttribution(step, args.toolAttribution);
      applySettledPermissionWaits(state, step);
      state.toolStepsById.set(event.toolId as string, step);
      return finalized;
    }
    case "tool_call_update": {
      markFirstToken(lifecycle, now);
      if (event.status === "pending" || event.status === "in_progress") {
        if (!state.toolStepsById.has(event.toolId as string)) {
          finalizeReasoningStep(lifecycle, state, now, finalized);
          finalizeGenerationStep(lifecycle, state, now, "success", finalized, undefined, "tool_call", args.clientMode);
          closeGenerationBeforeToolCall({ prompt: lifecycle, state, now, finalized, clientMode: args.clientMode });
          const step = createStep(state, "tool_call", now, { toolId: event.toolId, toolName: event.toolName ?? event.kind });
          applyToolAttribution(step, args.toolAttribution);
          applySettledPermissionWaits(state, step);
          state.toolStepsById.set(event.toolId as string, step);
        }
        return finalized;
      }
      let step = state.toolStepsById.get(event.toolId as string);
      if (!step) {
        closeGenerationBeforeToolCall({ prompt: lifecycle, state, now, finalized, clientMode: args.clientMode });
        step = createStep(state, "tool_call", earliestPermissionRequestedAt(lifecycle, state, event.toolId as string) ?? now, {
          toolId: event.toolId,
          toolName: event.toolName ?? event.kind,
        });
      }
      applyToolAttribution(step, args.toolAttribution);
      applySettledPermissionWaits(state, step);
      state.toolStepsById.set(event.toolId as string, step);
      settleToolPermissionWaits(lifecycle, state, event.toolId as string, now);
      step.startedAt = Math.min(step.startedAt, now - step.waitingMs);
      state.toolStepsById.delete(event.toolId as string);
      finalized.push(
        buildAgentStepEvent({
          prompt: lifecycle,
          step: { ...step, toolName: event.toolName ?? event.kind ?? step.toolName },
          finishedAt: now,
          status: event.status as string,
          errorType: event.status === "failed" ? "TOOL_EXEC_ERROR" : undefined,
          errorMsg: event.error,
          automationId:
            event.status === "completed" && (event.toolName ?? event.kind ?? step.toolName) === "CronCreate"
              ? extractAutomationIdFromContent(event.content)
              : undefined,
        }),
      );
      return finalized;
    }
    case "task_complete": {
      settleAllPermissionWaits(lifecycle, state, now);
      finalizeReasoningStep(lifecycle, state, now, finalized);
      finalizeGenerationStep(lifecycle, state, now, "success", finalized, undefined, "task_complete", args.clientMode);
      finalizeAllToolSteps(lifecycle, state, now, "success", finalized);
      stepStateByTask.delete(args.taskId);
      return finalized;
    }
    case "task_error": {
      settleAllPermissionWaits(lifecycle, state, now);
      finalizeReasoningStep(lifecycle, state, now, finalized);
      finalizeGenerationStep(
        lifecycle,
        state,
        now,
        "fail",
        finalized,
        { type: event.code ?? "UNKNOWN", msg: event.error as string },
        "task_error",
        args.clientMode,
      );
      finalizeAllToolSteps(lifecycle, state, now, "fail", finalized, { type: event.code ?? "UNKNOWN", msg: event.error as string });
      stepStateByTask.delete(args.taskId);
      return finalized;
    }
    default:
      return finalized;
  }
}

/** 原 yPe（41318）：当前会话模型名 */
export function currentConversationModel(taskId: string): string | undefined {
  return activeLifecycleByTask.get(taskId)?.baseEventExtraDetail.model_name || undefined;
}

/** 原 bPe（41321）：最近上报消息 id */
export function lastReportedMessageId(taskId: string): string | undefined {
  return activeLifecycleByTask.get(taskId)?.messageId;
}

/** 原 xPe（41324）：用量增量记账（事件键去重；活跃步吸附或挂起） */
export function recordUsageDelta(args: {
  taskId: string;
  eventKey: string;
  usage: TokenUsage;
  requestId?: string;
  modelName?: string;
  modelProvider?: string;
  providerName?: string;
}): void {
  const lifecycle = activeLifecycleByTask.get(args.taskId);
  const eventKey = args.eventKey.trim();
  if (!lifecycle || eventKey.length === 0 || lifecycle.usageEventKeys.has(eventKey)) return;
  lifecycle.usageEventKeys.add(eventKey);
  lifecycle.usage = accumulateUsage(lifecycle.usage, args.usage);
  const requestId = args.requestId?.trim();
  if (!requestId) return;
  const state = stepStateOf(args.taskId);
  const modelName = args.modelName?.trim();
  const modelProvider = args.modelProvider?.trim();
  const providerName = args.providerName?.trim();
  const activeStep = findActiveStepByRequestId(state, requestId);
  if (activeStep) {
    activeStep.model = {
      requestId,
      modelName: modelName ?? activeStep.model?.modelName ?? "",
      modelProvider: modelProvider ?? activeStep.model?.modelProvider ?? "",
      providerName: providerName ?? activeStep.model?.providerName ?? "",
    };
    mergeStepUsage(activeStep, { requestIds: [requestId], requestCount: 1, scope: "model_request", usage: args.usage });
    return;
  }
  state.pendingUsageByRequestId.set(requestId, {
    requestIds: [requestId],
    requestCount: 1,
    scope: "model_request",
    usage: args.usage,
  });
}

/** 原 SPe（41353）：权限等待登记（requestId 去重；工具 id 三级回退） */
export function recordPermissionRequested(args: {
  taskId: string;
  requestId?: string;
  toolCallId?: string;
  raw?: unknown;
  now?: number;
}): void {
  const lifecycle = activeLifecycleByTask.get(args.taskId);
  const requestId = (args.requestId ?? "").trim();
  if (!lifecycle || requestId.length === 0 || lifecycle.permissionWaitsByRequestId.has(requestId)) return;
  const raw = args.raw !== null && typeof args.raw === "object" ? (args.raw as Record<string, unknown>) : {};
  const rawToolCallId = typeof raw.toolCallId === "string" && raw.toolCallId.trim().length > 0 ? raw.toolCallId.trim() : undefined;
  const toolCallId = args.toolCallId?.trim() || rawToolCallId || requestId;
  lifecycle.permissionWaitsByRequestId.set(requestId, {
    requestedAt: args.now ?? Date.now(),
    ...(toolCallId ? { toolCallId } : {}),
  });
}

/** 原 CPe（41368）：权限等待结算 */
export function recordPermissionResolved(args: { taskId: string; requestId?: string; now?: number }): void {
  const lifecycle = activeLifecycleByTask.get(args.taskId);
  if (lifecycle) settlePermissionWait(lifecycle, stepStateByTask.get(args.taskId), args.requestId as string, args.now ?? Date.now());
}

/** 原 wPe（41372）：消息完成载荷（权限全结算 + 生命周期清理 + 文件变更/用量/错误字段） */
export function buildMessageCompletionDetail(args: {
  taskId: string;
  status: string;
  finishedAt: number;
  errorType?: string;
  errorMsg?: string;
  usage?: TokenUsage | null;
  fileChanges?: Array<{ snapshots: Array<{ path: string; beforeContent: string; afterContent: string }> }>;
}): { taskId: string; messageId: string; eventExtraDetail: Record<string, string> } | null {
  const lifecycle = activeLifecycleByTask.get(args.taskId);
  if (!lifecycle) return null;
  settleAllPermissionWaits(lifecycle, stepStateByTask.get(args.taskId), args.finishedAt);
  activeLifecycleByTask.delete(args.taskId);
  stepStateByTask.delete(args.taskId);
  const { changedFileCount, generatedCodeLines } = countFileChanges(args.fileChanges);
  const success = args.status === "success";
  const usage = success ? args.usage ?? lifecycle.usage ?? undefined : lifecycle.usage ?? undefined;
  const tokenSource = !success && lifecycle.usage ? "usage_delta" : undefined;
  const errorType = success ? "" : args.errorType?.trim() || (lifecycle.toolCallFailed > 0 ? "TOOL_CALL_FAILED" : "UNKNOWN");
  const errorMsg = success ? "" : args.errorMsg?.trim() || lifecycle.firstToolCallError;
  return {
    taskId: args.taskId,
    messageId: lifecycle.messageId,
    eventExtraDetail: {
      ...lifecycle.baseEventExtraDetail,
      ...(usage ? serializeUsageForCompletion(usage, tokenSource) : {}),
      duration_ms: String(Math.max(args.finishedAt - lifecycle.sendTime, 0)),
      waiting_ms: String(lifecycle.waitingMs),
      generated_code_lines: String(generatedCodeLines),
      file_change_cnt: String(changedFileCount),
      time_to_first_token: lifecycle.firstTokenAt === null ? "-1" : String(Math.max(lifecycle.firstTokenAt - lifecycle.sendTime, 0)),
      request_time: String(lifecycle.sendTime),
      status: args.status,
      agent_step_cnt: String(lifecycle.finalizedAgentStepCount),
      retry_cnt: "0",
      tool_call_total: String(lifecycle.toolCallTotal),
      tool_call_failed: String(lifecycle.toolCallFailed),
      error_type: errorType,
      error_msg: errorMsg,
    },
  };
}

/** 原 TPe（41405）：全部计时/生命周期清空（测试/重置用） */
export function clearAllTelemetryTiming(): void {
  inputTimingByWorkspace.clear();
  promptLifecyclesByTask.clear();
  activeLifecycleByTask.clear();
  stepStateByTask.clear();
}

/** 原 EPe（41408）：会话计时清除（生命周期链/活动/步骤状态） */
export function purgeConversationTiming(taskId: string): void {
  promptLifecyclesByTask.delete(taskId);
  activeLifecycleByTask.delete(taskId);
  stepStateByTask.delete(taskId);
}

/** 原 DPe（41411）：提示词种子计时清除（按消息 id 过滤） */
export function purgePromptSeedTiming(taskId: string, sourceCommandId: string): void {
  const chain = promptLifecyclesByTask.get(taskId);
  if (!chain) return;
  const remaining = chain.filter((lifecycle) => lifecycle.messageId !== sourceCommandId);
  if (remaining.length === 0) {
    promptLifecyclesByTask.delete(taskId);
    return;
  }
  promptLifecyclesByTask.set(taskId, remaining);
}

/* --- H.3 plan_usage 域（41421–41541） --- */

const PLAN_USAGE_GROUP = "plan_usage";
const PLAN_REQUEST_EVENT = "plan_request";
const PLAN_TTFT_EVENT = "plan_ttft";
const planEventKeysSeen = new Set<string>();
const PLAN_EVENT_KEY_LIMIT = 2000;

/** 原 jPe（41426）：事件键去重（LRU 淘汰最早） */
export function rememberPlanEventKey(key: string): boolean {
  if (planEventKeysSeen.has(key)) return false;
  planEventKeysSeen.add(key);
  if (planEventKeysSeen.size > PLAN_EVENT_KEY_LIMIT) {
    const oldest = planEventKeysSeen.values().next().value;
    if (typeof oldest === "string") planEventKeysSeen.delete(oldest);
  }
  return true;
}

/** 原 eT（41434）：正整数归一 */
export function positiveIntegerOrUndefined(value: number | undefined): number | undefined {
  if (!Number.isFinite(value) || value === undefined) return undefined;
  const rounded = Math.round(value as number);
  return rounded > 0 ? rounded : undefined;
}

/** 原 tT（41439）：非负整数归一 */
export function nonNegativeIntegerOrUndefined(value: number | undefined): number | undefined {
  if (!Number.isFinite(value) || value === undefined) return undefined;
  const rounded = Math.round(value as number);
  return rounded >= 0 ? rounded : undefined;
}

/** 原 MPe（41444）：模型请求状态映射 */
export function mapModelRequestStatus(statusType: string): string | undefined {
  switch (statusType) {
    case "model_request_started":
      return "started";
    case "model_request_completed":
      return "completed";
    case "model_request_failed":
      return "failed";
    case "model_retry_scheduled":
      return "retry_scheduled";
    case "model_stream_stalled":
      return "stream_stalled";
    default:
      return undefined;
  }
}

/** 原 NPe（41458）：去除 undefined 字段 */
export function omitUndefined<T extends Record<string, unknown>>(input: T): Partial<T> {
  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) output[key] = value;
  }
  return output as Partial<T>;
}

/** 原 PPe（41463）：plan_request ARMS 上报（事件键去重；失败仅 warn `[plan-usage] ARMS 上报失败/异常`） */
export function recordPlanRequest(platform: TelemetryPlatform | null, status: {
  eventKey: string;
  providerId?: string;
  statusType: string;
  durationMs?: number;
  querySource?: string;
  modelId?: string;
  requestId?: string;
  taskId?: string;
  inputId?: string;
  queryId?: string;
  attempt?: number;
  nextAttempt?: number;
  maxAttempts?: number;
  statusCode?: number;
  delayMs?: number;
  idleMs?: number;
  timeoutMs?: number;
  retryable?: unknown;
  reason?: string;
  transport?: string;
  providerKind?: string;
}): void {
  if (!platform || !rememberPlanEventKey(status.eventKey)) return;
  const providerId = status.providerId?.trim() || "unknown";
  const requestStatus = mapModelRequestStatus(status.statusType);
  const duration = nonNegativeIntegerOrUndefined(status.durationMs);
  const event: ArmsCustomEvent = {
    name: PLAN_REQUEST_EVENT,
    group: PLAN_USAGE_GROUP,
    value: duration ?? 1,
    properties: omitUndefined({
      ask_mode: status.querySource?.trim() || undefined,
      model_name: status.modelId?.trim() || undefined,
      provider_id: providerId,
      request_status: requestStatus,
      request_id: status.requestId,
      task_id: status.taskId,
      input_id: status.inputId,
      query_id: status.queryId,
      event_key: status.eventKey,
      attempt: positiveIntegerOrUndefined(status.attempt),
      next_attempt: positiveIntegerOrUndefined(status.nextAttempt),
      max_attempts: positiveIntegerOrUndefined(status.maxAttempts),
      status_code: nonNegativeIntegerOrUndefined(status.statusCode),
      duration_ms: duration,
      delay_ms: nonNegativeIntegerOrUndefined(status.delayMs),
      idle_ms: nonNegativeIntegerOrUndefined(status.idleMs),
      timeout_ms: nonNegativeIntegerOrUndefined(status.timeoutMs),
      retryable: status.retryable,
      reason: status.reason?.trim() || undefined,
      transport: status.transport?.trim() || undefined,
      provider_kind: status.providerKind?.trim() || undefined,
    }),
  };
  try {
    Promise.resolve(platform.reportArmsCustomEvent(event)).catch((error) => {
      logger.warn("[plan-usage] ARMS 上报失败", {
        providerId,
        status: requestStatus,
        error: error instanceof Error ? error.message : String(error),
      });
    });
  } catch (error) {
    logger.warn("[plan-usage] ARMS 上报异常", {
      providerId,
      status: requestStatus,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/** 原 FPe（41512）：供应商 TTFT 上报（无供应商/非法值 → 忽略） */
export function recordProviderTtft(
  platform: TelemetryPlatform | null,
  args: { providerId?: string; modelName?: string; askMode?: string; ttftMs: number },
): void {
  if (!platform || !Number.isFinite(args.ttftMs) || args.ttftMs < 0) return;
  const providerId = args.providerId?.trim();
  if (!providerId) return;
  const ttft = Math.max(0, Math.round(args.ttftMs));
  const event: ArmsCustomEvent = {
    name: PLAN_TTFT_EVENT,
    group: PLAN_USAGE_GROUP,
    value: ttft,
    properties: {
      ask_mode: args.askMode?.trim() || undefined,
      model_name: args.modelName?.trim() || undefined,
      provider_id: providerId,
      ttft_ms: ttft,
    },
  };
  try {
    Promise.resolve(platform.reportArmsCustomEvent(event)).catch((error) => {
      logger.warn("[plan-usage] ARMS TTFT 上报失败", {
        providerId,
        error: error instanceof Error ? error.message : String(error),
      });
    });
  } catch (error) {
    logger.warn("[plan-usage] ARMS TTFT 上报异常", {
      providerId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/* --- H.4 ui_perf 域（41542–41760） --- */

const UI_PERF_GROUP = "ui_perf";
export const UI_PERF_EVENTS = {
  launchToInput: "perf_ui_launch_to_input",
  launchElectronInit: "perf_ui_launch_electron_init_ms",
  launchAppReady: "perf_ui_launch_app_ready_ms",
  launchWindow: "perf_ui_launch_window_ms",
  launchRendererLoad: "perf_ui_launch_renderer_load_ms",
  launchReactCommit: "perf_ui_launch_react_commit_ms",
  launchStartupGate: "perf_ui_launch_startup_gate_ms",
  firstToken: "perf_ui_first_token",
  messageComplete: "perf_ui_message_complete",
  turnBreakdown: "perf_ui_turn_breakdown",
  toolCallDetail: "perf_ui_tool_call_detail",
  streamStall: "perf_ui_stream_stall",
} as const;

/** 原 rT（41554）：ui-perf 平台引用（由引导注入） */
let uiPerfPlatform: TelemetryPlatform | null = null;

/** 原 iT（41556）：注入 ui-perf 平台 */
export function setUiPerfPlatform(platform: TelemetryPlatform | null): void {
  uiPerfPlatform = platform;
}

/** 原 aT（41560）：ui-perf 上报（失败仅 warn `[ui-perf] ARMS 上报失败/异常`） */
export function reportUiPerfEvent(event: ArmsCustomEvent): void {
  if (uiPerfPlatform) {
    try {
      Promise.resolve(uiPerfPlatform.reportArmsCustomEvent(event)).catch((error) => {
        logger.warn("[ui-perf] ARMS 上报失败", { name: event.name, error });
      });
    } catch (error) {
      logger.warn("[ui-perf] ARMS 上报异常", { name: event.name, error });
    }
  }
}

/** 原 JPe（41569）：非负取整 */
export function roundNonNegative(value: number): number {
  return Math.max(0, Math.round(value));
}

/** 原 oT（41572）：非负整数或 undefined */
export function uiPerfIntegerOrUndefined(value: number | undefined): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  const rounded = Math.round(value);
  return rounded >= 0 ? rounded : undefined;
}

/** 原 YPe（41577）：启动链路上报（总时长 >300s 或任一段为负 → 整批丢弃） */
export function reportLaunchToInputPerf(args: {
  marks: { createdAt: number; mainStart: number; appReady: number; loadUrl: number };
  rendererStart: number;
  reactCommit: number;
  inputReady: number;
  sessionId: string;
}): void {
  const { marks, rendererStart, reactCommit, inputReady, sessionId } = args;
  const total = inputReady - marks.createdAt;
  const stages = {
    electronInit: marks.mainStart - marks.createdAt,
    appReady: marks.appReady - marks.mainStart,
    window: marks.loadUrl - marks.appReady,
    rendererLoad: rendererStart - marks.loadUrl,
    reactCommit: reactCommit - rendererStart,
    startupGate: inputReady - reactCommit,
  };
  if (total < 0 || total > 300000) {
    logger.warn("[ui-perf] launch_to_input 总时长异常,丢弃", { total });
    return;
  }
  const negativeStage = Object.entries(stages).find(([, value]) => value < 0);
  if (negativeStage) {
    logger.warn("[ui-perf] launch_to_input 某段为负(跨进程时钟偏移/回拨),整批丢弃", {
      stage: negativeStage[0],
      ms: negativeStage[1],
    });
    return;
  }
  const properties = { session_id: sessionId };
  const events = [
    { name: UI_PERF_EVENTS.launchToInput, ms: total },
    { name: UI_PERF_EVENTS.launchElectronInit, ms: stages.electronInit },
    { name: UI_PERF_EVENTS.launchAppReady, ms: stages.appReady },
    { name: UI_PERF_EVENTS.launchWindow, ms: stages.window },
    { name: UI_PERF_EVENTS.launchRendererLoad, ms: stages.rendererLoad },
    { name: UI_PERF_EVENTS.launchReactCommit, ms: stages.reactCommit },
    { name: UI_PERF_EVENTS.launchStartupGate, ms: stages.startupGate },
  ];
  for (const item of events) reportUiPerfEvent({ name: item.name, group: UI_PERF_GROUP, value: roundNonNegative(item.ms), properties });
}

/** 原 XPe（41612）：首 token 时延上报 */
export function recordTtft(args: { ttftMs: number; model?: string; talkId: string; messageId: string }): void {
  reportUiPerfEvent({
    name: UI_PERF_EVENTS.firstToken,
    group: UI_PERF_GROUP,
    value: Math.max(0, Math.round(args.ttftMs)),
    properties: { model: args.model, talk_id: args.talkId, message_id: args.messageId },
  });
}

/** 原 ZPe（41620）：消息完成时延上报 */
export function recordDuration(args: { durationMs: number; result: string; model?: string; talkId: string; messageId: string }): void {
  reportUiPerfEvent({
    name: UI_PERF_EVENTS.messageComplete,
    group: UI_PERF_GROUP,
    value: Math.max(0, Math.round(args.durationMs)),
    properties: { result: args.result, model: args.model, talk_id: args.talkId, message_id: args.messageId },
  });
}

/** 原 QPe（41628）：轮次分解上报 */
export function recordConversationResult(args: {
  durationMs: number;
  result: string;
  model?: string;
  talkId: string;
  messageId: string;
  ttftMs?: number;
  waitingMs?: number;
  toolCallTotal?: number;
  toolCallFailed?: number;
  agentStepCount?: number;
  retryCount?: number;
  fileChangeCount?: number;
  generatedCodeLines?: number;
}): void {
  const duration = Math.max(0, Math.round(args.durationMs));
  reportUiPerfEvent({
    name: UI_PERF_EVENTS.turnBreakdown,
    group: UI_PERF_GROUP,
    value: duration,
    properties: {
      result: args.result,
      model: args.model,
      talk_id: args.talkId,
      message_id: args.messageId,
      duration_ms: duration,
      ttft_ms: uiPerfIntegerOrUndefined(args.ttftMs),
      waiting_ms: uiPerfIntegerOrUndefined(args.waitingMs),
      tool_call_total: uiPerfIntegerOrUndefined(args.toolCallTotal),
      tool_call_failed: uiPerfIntegerOrUndefined(args.toolCallFailed),
      agent_step_cnt: uiPerfIntegerOrUndefined(args.agentStepCount),
      retry_cnt: uiPerfIntegerOrUndefined(args.retryCount),
      file_change_cnt: uiPerfIntegerOrUndefined(args.fileChangeCount),
      generated_code_lines: uiPerfIntegerOrUndefined(args.generatedCodeLines),
    },
  });
}

/** 原 $Pe（41651）：工具调用明细上报（值 = total → commandRun → fsWrite → fsRead → 0 瀑布） */
export function recordToolPerformance(args: {
  toolName: string;
  status: string;
  talkId: string;
  messageId: string;
  toolCallId?: string;
  parentToolCallId?: string;
  childToolCallId?: string;
  childSessionId?: string;
  agentId?: string;
  agentType?: string;
  totalMs?: number;
  permissionWaitMs?: number;
  commandRunMs?: number;
  firstOutputMs?: number;
  noOutputMs?: number;
  exitCode?: number;
  timedOut?: boolean;
  outputBytes?: number;
  commandCategory?: string;
  commandName?: string;
  commandCount?: number;
  commandStatus?: string;
  fsReadMs?: number;
  fsWriteMs?: number;
  patchMatchMs?: number;
  fileCount?: number;
  totalBytes?: number;
  maxFileBytes?: number;
  hunkCount?: number;
  matchAttempts?: number;
  workspaceKind?: string;
}): void {
  const total = uiPerfIntegerOrUndefined(args.totalMs);
  reportUiPerfEvent({
    name: UI_PERF_EVENTS.toolCallDetail,
    group: UI_PERF_GROUP,
    value: total ?? uiPerfIntegerOrUndefined(args.commandRunMs) ?? uiPerfIntegerOrUndefined(args.fsWriteMs) ?? uiPerfIntegerOrUndefined(args.fsReadMs) ?? 0,
    properties: {
      tool_name: args.toolName,
      status: args.status,
      talk_id: args.talkId,
      message_id: args.messageId,
      tool_call_id: args.toolCallId,
      parent_tool_call_id: args.parentToolCallId,
      child_tool_call_id: args.childToolCallId,
      child_session_id: args.childSessionId,
      agent_id: args.agentId,
      agent_type: args.agentType,
      total_ms: total,
      permission_wait_ms: uiPerfIntegerOrUndefined(args.permissionWaitMs),
      command_run_ms: uiPerfIntegerOrUndefined(args.commandRunMs),
      first_output_ms: uiPerfIntegerOrUndefined(args.firstOutputMs),
      no_output_ms: uiPerfIntegerOrUndefined(args.noOutputMs),
      exit_code: typeof args.exitCode === "number" && Number.isFinite(args.exitCode) ? Math.round(args.exitCode) : undefined,
      timed_out: args.timedOut,
      output_bytes: uiPerfIntegerOrUndefined(args.outputBytes),
      command_category: args.commandCategory,
      command_name: args.commandName,
      command_count: uiPerfIntegerOrUndefined(args.commandCount),
      command_status: args.commandStatus,
      fs_read_ms: uiPerfIntegerOrUndefined(args.fsReadMs),
      fs_write_ms: uiPerfIntegerOrUndefined(args.fsWriteMs),
      patch_match_ms: uiPerfIntegerOrUndefined(args.patchMatchMs),
      file_count: uiPerfIntegerOrUndefined(args.fileCount),
      total_bytes: uiPerfIntegerOrUndefined(args.totalBytes),
      max_file_bytes: uiPerfIntegerOrUndefined(args.maxFileBytes),
      hunk_count: uiPerfIntegerOrUndefined(args.hunkCount),
      match_attempts: uiPerfIntegerOrUndefined(args.matchAttempts),
      workspace_kind: args.workspaceKind,
    },
  });
}

/** 原 sT（41695）：流块时刻表（键 = 会话/任务） */
const lastStreamChunkAtByTalk = new Map<string, number>();

/** 原 eFe（41696）：流块前台打点（间隔 >3s 视为停顿上报；首块仅记录） */
export function recordStreamChunkForeground(
  talkId: string,
  args?: { now?: number; waitingTool?: boolean; model?: string; chunkType?: string; talkId?: string; messageId?: string },
): void {
  const now = args?.now ?? Date.now();
  const previous = lastStreamChunkAtByTalk.get(talkId);
  lastStreamChunkAtByTalk.set(talkId, now);
  if (previous === undefined) return;
  const gap = now - previous;
  if (gap <= 3000) return;
  reportUiPerfEvent({
    name: UI_PERF_EVENTS.streamStall,
    group: UI_PERF_GROUP,
    value: Math.round(gap),
    properties: {
      stall_ms: Math.round(gap),
      waiting_tool: args?.waitingTool ?? false,
      model: args?.model,
      chunk_type: args?.chunkType,
      talk_id: args?.talkId ?? talkId,
      message_id: args?.messageId,
    },
  });
}

/** 原 cT（41716）：清除会话流块等待态 */
export function clearConversationWaitState(talkId: string): void {
  lastStreamChunkAtByTalk.delete(talkId);
}

/** 原 tFe（41719）：输入延迟事件名 */
const INPUT_LAG_EVENT = "perf_ui_input_lag";

/** 原 nFe（41720）：输入延迟上报判定（程序化/组词中排除；500ms–5s 窗口） */
export function shouldReportInputLag(args: { lagMs: number; isProgrammatic: boolean; isComposing: boolean }): boolean {
  return args.isProgrammatic || args.isComposing ? false : args.lagMs > 500 && args.lagMs <= 5000;
}

/** 原 rFe（41723）：输入延迟上报 */
export function reportInputLag(args: { lagMs: number; isProgrammatic: boolean; isComposing: boolean; textLength: number; taskId: string }): void {
  if (!shouldReportInputLag({ lagMs: args.lagMs, isProgrammatic: args.isProgrammatic, isComposing: args.isComposing })) return;
  const lag = Math.round(args.lagMs);
  reportUiPerfEvent({
    name: INPUT_LAG_EVENT,
    group: UI_PERF_GROUP,
    value: lag,
    properties: { lag_ms: lag, text_length: args.textLength, task_id: args.taskId },
  });
}

/** 原 iFe（41734）：compaction/chat 用模型名（glm 缺省 → 原样；否则合成） */
export function resolveChatModelName(args: { configProvider?: string; modelName?: string }): string | undefined {
  const provider = args.configProvider?.trim();
  const model = args.modelName?.trim();
  return !provider || !model || provider === "glm" ? args.modelName : joinModelName(provider, model);
}

/** 原 aFe（41739）：compaction 模型名解析（`provider/` 前缀补齐） */
export function resolveCompactionModelName(args: { configProvider?: string; modelName?: string }): string | undefined {
  const provider = args.configProvider?.trim();
  const model = args.modelName?.trim();
  return !provider || !model || provider === "glm" ? args.modelName : model.startsWith(`${provider}/`) ? model : `${provider}/${model}`;
}

/** 原 oFe（41744）：chat 公共字段（模型解析 + message_source=chat） */
export function buildChatCommonFields(args: {
  askMode?: string;
  modelName?: string;
  configProvider?: string;
  agentProvider?: string;
  providerBaseURL?: string;
  planIdentitySnapshot?: { planStatus?: string; planProductId?: string };
}): Record<string, string> {
  const agentProvider = args.agentProvider ?? "glm";
  const fields = buildModelRequestCommonFields({
    askMode: args.askMode,
    modelName: resolveChatModelName(args),
    provider: agentProvider,
    providerBaseURL: args.providerBaseURL,
    planIdentitySnapshot: args.planIdentitySnapshot,
  });
  return {
    ...fields,
    message_source: "chat",
    task_trigger: "",
    model_provider: args.configProvider?.trim() || fields.model_provider || "",
    agent: agentProvider,
  };
}

/* --- H.5 监督器容量常量与事实提取（41761–41807） --- */

/** 原 lT（41761）：去重集容量（services.tsx BoundedStringSet 用） */
export const TELEMETRY_BOUNDED_SET_CAPACITY = 2000;
/** 原 sFe（41762）：事实缓冲上限 */
export const TELEMETRY_FACT_BUFFER_LIMIT = 128;
/** 原 cFe（41763）：积压排空批大小 */
export const TELEMETRY_DRAIN_BATCH_SIZE = 200;

export interface TurnStartedFact {
  sourceCommandId?: string;
  sessionId: string;
  occurredAt: number;
  offPeakTaskId?: string;
  offPeakRunType?: string;
  automationId?: string;
  taskTrigger?: string;
  scheduledAt?: number;
  [key: string]: unknown;
}

/** 原 lFe（41764）：turn_started 事实 → 提示词种子（闲时任务支/定时任务支；无来源 → null） */
export function extractPromptSeedFromTurnStarted(
  fact: TurnStartedFact,
): { sessionId: string; sourceCommandId: string; sendTime: number; extraDetail?: Record<string, string> } | null {
  if (!fact.sourceCommandId) return null;
  if (fact.offPeakTaskId) {
    return {
      sessionId: fact.sessionId,
      sourceCommandId: fact.sourceCommandId,
      sendTime: fact.occurredAt,
      extraDetail: {
        message_source: "off_peak_task",
        off_peak_task_id: fact.offPeakTaskId,
        ...(fact.offPeakRunType ? { off_peak_run_type: fact.offPeakRunType } : {}),
      },
    };
  }
  if (!fact.automationId || !fact.taskTrigger) return null;
  const scheduledAt = fact.taskTrigger === "schedule" ? fact.scheduledAt : undefined;
  return {
    sessionId: fact.sessionId,
    sourceCommandId: fact.sourceCommandId,
    sendTime: fact.occurredAt,
    extraDetail: {
      message_source: "scheduled_task",
      task_trigger: fact.taskTrigger,
      automation_id: fact.automationId,
      ...(scheduledAt === undefined
        ? {}
        : { scheduled_at: String(scheduledAt), schedule_lag_ms: String(Math.max(0, fact.occurredAt - scheduledAt)) }),
    },
  };
}

/** 原 uFe（41793）：步骤源字段白名单 */
const STEP_SOURCE_FIELDS = ["message_source", "task_trigger", "automation_id", "off_peak_task_id", "off_peak_run_type"];

/** 原 dFe（41800）：从额外明细提取步骤源字段 */
export function extractStepSourceDetail(extraDetail: unknown): Record<string, string> {
  const output: Record<string, string> = {};
  const source = (extraDetail ?? {}) as Record<string, string | undefined>;
  for (const field of STEP_SOURCE_FIELDS) {
    const value = source[field];
    if (value !== undefined) output[field] = value;
  }
  return output;
}

/* 文件尾：本文件不导出组件；供 stores（services.tsx）与后续整合阶段按 §0 映射接线。 */
