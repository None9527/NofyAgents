/* eslint-disable */
/**
 * ============================================================================
 * SkillStore.tsx — ZCode 3.7.6 skillStore chunk 全量重建（B5-11 · 逐字重建）
 * ============================================================================
 *
 * 原始 chunk（只读）：
 *   /Users/mac/nofy-build/desktop/src/out/renderer/assets/skillStore-BmeKHDBI.js（2,531 行）
 * 对照文件（pretty 版，**行号主口径**）：
 *   /Users/mac/nofy-build/desktop/src/src-reconstructed/renderer/assets/skillStore-BmeKHDBI.jsx（2,518 行）
 * 登记：COVERAGE-LEDGER §b「未重建 first-party（B4 队列）」第 1 件、§c.1 第 11 项；
 *       B5-FULL-DECODE-PLAN 批次 12（B5-11）第 1 件；MODULE-MAP §2.1（`Ae` = 本 chunk
 *       导出的 zustand create，20 个 styles 内 store 的创建点基础）、§3 导入表。
 *
 * 内容（五域）：
 *  1. zustand 运行时（jsx 5–39）：createStoreImpl/useStore/create 工厂——导出 `q`
 *     （styles 侧 `Ae`），styles 内 20 个 store 均经它创建；
 *  2. 任务/会话 store（jsx 40–1800）：E2E 门控、工作区任务状态模型、任务导航历史、
 *     composer 草稿持久化、运行时/权限/elicitation 动作族、模型与思考级持久化、
 *     模型切换守卫、配置选项装配、useTaskStore（`h` 导出，styles 侧 `xe`）；
 *  3. 白板 store（jsx 1801–2014）：画板/笔画/undo-redo/PNG 导出/加入聊天事件、
 *     useWhiteboardStore（`o` 导出）；
 *  4. 子代理域（jsx 2015–2367）：按工作区×供应商缓存的上下文 store（`a` 导出）+
 *     单例 store（`r` 导出，CRUD 六动作）+ 同步刷新（`n` 导出）；
 *  5. 技能 store（jsx 2368–2517）：useSkillsStore（`t` 导出，styles 侧 `Ne`）。
 *
 *  E2E 桥：`window.__zcodeSessionStoreE2E/__whiteboardStoreE2E/__subagentsStoreE2E/
 *  __skillStoreE2E` 四处挂载（与 e2eStoreBridgeBootstrap.tsx 同一挂载点，见报告 §3 裁决）。
 *
 * 〔A0-S4-3：五域实体已逐字迁 ../stores/（zustand/e2eStoreBridge/taskStore/whiteboardStore/
 *  subagentsStore/skillsStore）；本文件为薄 re-export shim，导出面不变〕
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号 = jsx 孪生文件行；共 204 个模块内符号）
 * ----------------------------------------------------------------------------
 *  导入（jsx 1–4）：
 *   e（chunk-Cq_f4orQ s）→ toEsmInterop | t（react t）→ reactModuleFactory
 *   src-HCld2afU 8 导入（jsx 3）：
 *    n=F→formatCustomQualifiedModelId(内部 rS) | r=M→formatNativeSupplierKey(cS)
 *    i=P→parseCustomQualifiedModelId(iS) | a=Y→getDefaultModeOptions(kx)
 *    o=ds→resolveAgentProvider(Es，恒 'glm') | s=ot→createUuid(cx)
 *    c=q→formatBuiltinQualifiedModelId(Fx) | l=us→isGlmProvider(Ds)
 *   u（logger t）→ logger
 *  §1 zustand 运行时：d (5) ReactInterop | f (6) createStoreImpl | p (26) createVanillaStore
 *   m (27) identitySelector | h (28) useStore | g (32) createBoundStore | _ (38) create
 *  §2 E2E/环境：ee (40) readBuildEnvSnapshot | v (50) isE2EStoreBridgeEnabled
 *  §3 任务状态模型：te (53) initialWorkspaceInitState | ne (58) DEFAULT_PROVIDER='glm'
 *   re (59) initialTaskUiState | ie (67) initialTaskRuntimeState | ae (79) createInitialWorkspaceTaskState
 *   oe (120) defaultWorkspaceTaskState | se (121) getDefaultWorkspaceTaskState
 *   ce (124) hasOwnProperty | le (127) isUntitledTaskTitle | ue (131) pickTaskTitle
 *   y (134) mergeTaskMeta | de (150) mergeTaskMetaMany | b (155) resolveWorkspaceKey
 *   x (158) pickRecordByTaskIds | fe (162) collectWorkspaceTaskIds | pe (169) scopeWorkspaceTaskState
 *   S (195) getWorkspaceTaskState | C (200) updateWorkspaceTaskState | w (218) getTaskRuntime
 *   me (221) getActiveTaskStatusError | T (232) getTaskUi | E (235) getMergedTaskListItem
 *   he (240) getMergedTaskList | ge (246) isTaskUnread | _e (249) getWorkspaceTaskStateAlias
 *   ve (252) getWorkspaceInit
 *  §4 任务导航历史：ye (255) TASK_NAV_HISTORY_LIMIT=50 | be (256) createEmptyTaskNavHistory
 *   xe (262) isTaskNavTaskEntry | Se (265) isTaskNavAutomationsEntry | Ce (268) isSameTaskNavEntry
 *   we (271) pushTaskNavEntry | Te (287) pushTaskNavTaskEntry | Ee (297) pushTaskNavAutomationsEntry
 *   De (309) canGoBackInTaskNav | Oe (312) canGoForwardInTaskNav | ke (315) goBackInTaskNavHistory
 *   Ae (327) goForwardInTaskNavHistory | je (339) removeTaskFromTaskNavHistory
 *   Me (350) createTaskNavActions
 *  §5 composer 草稿持久化：Ne (377) COMPOSER_DRAFT_STORAGE_PREFIX | Pe (378) DEFAULT_DRAFT_SCOPE
 *   Fe (379) getDraftStorage | Ie (387) getComposerDraftStorageKey | Le (391) readComposerDraftStore
 *   Re (412) clearComposerDraftScope
 *  §6 等价性判定：ze (427) isSameConfigOptionValueJson | Be (430) areConfigOptionsEqual
 *   Ve (436) sortTaskListByRecency | He (439) areElicitationOptionListsEqual
 *   Ue (445) isSameTaskInteractionRequest | We (448) isSameUsageCost | Ge (453) isSameUsageCacheStats
 *   Ke (456) isSameUsageBreakdown | qe (459) isSameTaskUsage | Je (462) normalizeContextWindow
 *  §7 运行时动作族：Ye (465) updateWorkspaceTaskStateResolved | Xe (476) createTaskRuntimeActions（16 动作）
 *  §8 供应商/模型持久化：Ze (850) LAST_AGENT_PROVIDER_KEY | Qe (851) getProviderStorage
 *   $e (859) persistLastAgentProvider | et (862) CUSTOM_PROVIDER_IDS | tt (863) parseCustomProviderModelSuffix
 *   nt (872) isCustomModelOption | rt (878) formatCustomModelId | D (881) parseCustomModelId
 *   it (884) filterNativeModelOptions | O (887) LAST_AGENT_MODEL_KEY | at (888) LAST_AGENT_THOUGHT_LEVEL_KEY
 *   ot (889) LAST_AGENT_CONFIG_KEY | k (890) GLOBAL_SCOPE='__global__' | A (891) LAST_AGENT_CONFIG_SCHEMA_VERSION=1
 *   st (892) GLM_MODEL_PREFIX='glm-5.2' | ct (893) GLM_DATED_MODEL_PATTERN | lt (894) MAX_THOUGHT_LEVEL='max'
 *   ut (895) DISABLED_THOUGHT_VALUES | j (896) getModelStorage | dt (904) resolveIdentityKey
 *   M (907) getIdentityScopedModelKey | ft (910) getWorkspaceModelStorageKey | pt (913) getGlobalModelKey
 *   N (916) getGlobalThoughtLevelKey | P (919) getGlobalConfigKey | F (922) getWorkspaceModelKey
 *   mt (925) findModelSelectOption | ht (928) findThoughtLevelSelectOption | gt (931) collectModelValueAliases
 *   _t (944) extractModelNameFromQualified | vt (953) isQualifiedProviderModel | I (958) getCurrentModelValue
 *   yt (962) getCurrentThoughtLevelValue | bt (966) parseLastAgentConfig | xt (981) readGlobalLastAgentConfig
 *   St (984) readLastAgentModel | Ct (996) clearLegacyModelKeys | L (999) writeLastAgentConfig
 *   wt (1014) persistLastAgentConfigIfUnchanged | R (1018) readLastAgentModelConfig
 *   Tt (1039) readLastAgentModelOnly | Et (1042) updateLastAgentModel | Dt (1051) clearLastAgentModelConfig
 *   Ot (1056) applyStoredModelToOptions | z (1067) hasThoughtLevelOption | kt (1071) applyThoughtLevelToOptions
 *   At (1081) resolveThoughtLevelWithMaxFallback | jt (1084) getMaxThoughtLevelIfSupported
 *   Mt (1087) resolveMaxThoughtLevelForModel | Nt (1090) isThoughtLevelDisabled | Pt (1093) isGlmModelSelected
 *   B (1097) getModelNameAliases | Ft (1103) applyStoredConfigToOptions | It (1109) findModeSelectOption
 *   Lt (1112) getCurrentModeValue
 *  §9 模型切换守卫：Rt (1118) modelSwitchGuardCache | V (1119) trimToNull | zt (1124) findSelectOptionByCategory
 *   Bt (1127) getCurrentValueByCategory | Vt (1130) isSameModelAlias | Ht (1134) getModelSwitchGuard
 *   Ut (1139) findMatchingCurrentOption | Wt (1142) optionHasValue | Gt (1145) isOptionValueAcceptable
 *   Kt (1148) shouldKeepCurrentModelOption | qt (1153) pickAuthoritativeOption
 *   Jt (1157) reconcileConfigOptionsWithGuard
 *  §10 模型 ID 归一与选项装配：Yt (1187) parseProviderQualifiedModel | Xt (1198) isSyntheticModel
 *   Zt (1201) normalizeGlmModelId | Qt (1209) resolveTaskMetaModel | $t (1213) getModelDisplayName
 *   en (1218) withModelCurrentValue | tn (1230) createModelSelectOption | nn (1243) createModeSelectOption
 *   rn (1253) createThoughtLevelSelectOption | an (1266) withCurrentValueGeneric
 *   on (1278) injectTaskModelIntoOptions | sn (1294) buildTaskConfigOptionsFromMeta
 *  §11 分组草稿与模式选项：cn (1316) groupedDraftCounter | ln (1317) createGroupedDraftId
 *   un (1320) sanitizeThoughtLevelOption | H (1330) sanitizeConfigOptions | dn (1333) cloneConfigOptions
 *   fn (1341) isSameGroupedDraftPlacement | pn (1344) isModeSelectOption | mn (1347) createModeOptionFromCurrentId
 *   U (1361) replaceModeOption | hn (1366) applyModeIdToOptions | gn (1378) updateActiveTaskConfigOptions
 *   _n (1391) resolveTaskConfigOptionsForActivation
 *  §12 任务状态动作族：vn (1411) createTaskStateActions（25 动作）
 *  §13 useTaskStore：yn (1794) useTaskStore + E2E 挂载 (1800)
 *  §14 白板：bn (1802) WHITEBOARD_DEFAULT_WIDTH=1280 | xn (1803) WHITEBOARD_DEFAULT_HEIGHT=800
 *   Sn (1804) WHITEBOARD_DARK_COLOR='#111827' | Cn (1805) WHITEBOARD_ADD_TO_CHAT_EVENT
 *   wn (1806) WHITEBOARD_BACKGROUND_COLOR='#ffffff' | W (1807) resolveWhiteboardWorkspaceKey
 *   Tn (1813) createWhiteboard | En (1826) createUniqueWhiteboardName | Dn (1833) createWhiteboardStroke
 *   On (1842) renderWhiteboardToContext | kn (1849) drawWhiteboardStroke | An (1861) renderWhiteboardToPngDataUrl
 *   jn (1868) whiteboardToPngFile | Mn (1879) isWhiteboardAddToChatEvent | Nn (1882) dispatchWhiteboardAddToChat
 *   Pn (1890) sanitizeWhiteboardFileName | Fn (1893) isWhiteboardAddToChatDetail
 *   G (1898) getWhiteboardWorkspaceState | K (1904) updateWhiteboardBoard | In (1923) useWhiteboardStore + E2E (2014)
 *  §15 子代理上下文：q (2015) subagentContextInflight | J (2016) subagentContextLoadSeqByScope
 *   Ln (2017) subagentContextLoadSeq | Y (2018) getSubagentContextScopeKey | X (2021) setSubagentContext
 *   Rn (2029) loadSubagentContext | zn (2043) loadSubagentContextIntoStore | Bn (2094) useSubagentContextsStore
 *  §16 子代理单例：Z (2135) subagentListInflight | Vn (2136) subagentOperationSeq
 *   Hn (2137) getSubagentScopeKey | Un (2140) listSubagentsCached | Wn (2155) nextSubagentOperationSeq
 *   Q (2158) isCurrentSubagentOperation | Gn (2161) useSubagentsStore + E2E (2356)
 *   Kn (2357) refreshSubagentStoresForWorkspace
 *  §17 技能：$ (2368) skillListInflight | qn (2369) getSkillScopeKey | Jn (2372) listSkillsCached
 *   Yn (2387) useSkillsStore + E2E (2517)
 *
 * ----------------------------------------------------------------------------
 * 二、导出别名表（对外 48 个；styles 侧局部名见 styles js 372–420 导入块）
 * ----------------------------------------------------------------------------
 *   A=it filterNativeModelOptions(→styles L) | B=ve getWorkspaceInit(R) | C=Et updateLastAgentModel(z)
 *   D=Tt readLastAgentModelOnly(B) | E=R readLastAgentModelConfig(V) | F=w getTaskRuntime(H)
 *   G=y mergeTaskMeta(ee) | H=b resolveWorkspaceKey(U) | I=T getTaskUi(te) | J=h useStore(ne)
 *   K=v isE2EStoreBridgeEnabled(re) | L=ge isTaskUnread(ie) | M=Oe canGoForwardInTaskNav(ae)
 *   N=Se isTaskNavAutomationsEntry(oe) | O=D parseCustomModelId(se) | P=E getMergedTaskListItem(ce)
 *   R=he getMergedTaskList(le) | S=wt persistLastAgentConfigIfUnchanged(ue) | T=yt getCurrentThoughtLevelValue(de)
 *   U=_e getWorkspaceTaskStateAlias(fe) | V=S getWorkspaceTaskState(W) | W=de mergeTaskMetaMany(pe)
 *   _=Ft applyStoredConfigToOptions(me) | a=Bn useSubagentContextsStore(he) | b=z hasThoughtLevelOption(ge)
 *   c=Sn WHITEBOARD_DARK_COLOR(_e) | d=Dn createWhiteboardStroke(ve) | f=Nn dispatchWhiteboardAddToChat(ye)
 *   g=sn buildTaskConfigOptionsFromMeta(be) | h=yn useTaskStore(xe) | i=Y getSubagentContextScopeKey(Se)
 *   j=De canGoBackInTaskNav(Ce) | k=rt formatCustomModelId(we) | l=W resolveWhiteboardWorkspaceKey(Te)
 *   m=Mn isWhiteboardAddToChatEvent(Ee) | n=Kn refreshSubagentStoresForWorkspace(De)
 *   o=In useWhiteboardStore(Oe) | p=On renderWhiteboardToContext(ke) | q=_ create(Ae)
 *   r=Gn useSubagentsStore(je) | s=Cn WHITEBOARD_ADD_TO_CHAT_EVENT(Me) | t=Yn useSkillsStore(Ne)
 *   u=jn whiteboardToPngFile(Pe) | v=Ot applyStoredModelToOptions(Fe) | w=I getCurrentModelValue(Ie)
 *   x=L writeLastAgentConfig(Le) | y=Dt clearLastAgentModelConfig(Re) | z=me getActiveTaskStatusError(ze)
 *
 * 把握度：字符串/分支/结构全件高；状态字段类型为调用面归纳（中高，字段名逐字）。
 * ============================================================================
 */


/* ─────────────────────────── A0-S4-3 shim ───────────────────────────
 * 五域实体已原样迁入 ../stores/（见上方头块注记）；本文件保留 B5 头块、
 * §0 declare global、导出块与尾符号表。导出面不变，全部导入方零改动。
 * ──────────────────────────────────────────────────────────────────── */

/* ── A0-S2d 接线（B5-11）：原 declare 挂接替换为真实 import；混淆名注释随迁 ── */
/** 原 u（logger-PFDwl5Yq 的 t 导出）：日志器。 */
import { t as logger } from './logger';
/* ── A0-S4-3：五域实体改自 ../stores/ 导入（原 SrcSharedA/B 8 条 import 随迁各域文件） ── */
import { create, useStore } from '../stores/zustand';
import { isE2EStoreBridgeEnabled } from '../stores/e2eStoreBridge';
import {
  filterNativeModelOptions, getWorkspaceInit, updateLastAgentModel, readLastAgentModelOnly,
  readLastAgentModelConfig, getTaskRuntime, mergeTaskMeta, resolveWorkspaceKey, getTaskUi,
  isTaskUnread, canGoForwardInTaskNav, isTaskNavAutomationsEntry, parseCustomModelId,
  getMergedTaskListItem, getMergedTaskList, persistLastAgentConfigIfUnchanged,
  getCurrentThoughtLevelValue, getWorkspaceTaskStateAlias, getWorkspaceTaskState,
  mergeTaskMetaMany, applyStoredConfigToOptions, hasThoughtLevelOption,
  buildTaskConfigOptionsFromMeta, useTaskStore, canGoBackInTaskNav, formatCustomModelId,
  applyStoredModelToOptions, getCurrentModelValue, writeLastAgentConfig,
  clearLastAgentModelConfig, getActiveTaskStatusError,
} from '../stores/taskStore';
import type { TaskMeta, TaskStore, TaskStoreState, WorkspaceTaskState, GroupedDraftPlacement, ConfigOption } from '../stores/taskStore'; // A1-R17：+ConfigOption 随 export type 面
import {
  WHITEBOARD_DARK_COLOR, createWhiteboardStroke, dispatchWhiteboardAddToChat,
  resolveWhiteboardWorkspaceKey, isWhiteboardAddToChatEvent, useWhiteboardStore,
  renderWhiteboardToContext, WHITEBOARD_ADD_TO_CHAT_EVENT, whiteboardToPngFile,
} from '../stores/whiteboardStore';
import type { WhiteboardStroke, WhiteboardBoard } from '../stores/whiteboardStore';
import { useSubagentContextsStore, getSubagentContextScopeKey, refreshSubagentStoresForWorkspace, useSubagentsStore } from '../stores/subagentsStore';
import { useSkillsStore } from '../stores/skillsStore';
import type { SkillsService } from '../stores/skillsStore';

/* logger 再导出：Lane-1 UNIQUE_ADDEXPORT（a0-wiring-plan）——域内 Bots/Composer/
 * Modals/PaymentDeep 经 `import { logger } from './SkillStore'` 消费。 */
export { logger };

/* 类型补导出（A0-CLEANUP B-3/4/5/6）：TaskMeta/TaskStore/TaskStoreState 供
 * Sidebar/WorkspaceShell/ExtendedViews 改指；WorkspaceTaskState 为 TaskStore.
 * getWorkspaceState 返回型（消费侧命名依赖）；WhiteboardStroke/WhiteboardBoard
 * 供 ExtendedViews 白板域改指（消 TS2719 同名异型）；GroupedDraftPlacement 供
 * AppRootLeaves 具名化；SkillsService 供 StoresDeep 静态面对齐前置。 */
export type { TaskMeta, TaskStore, TaskStoreState, WorkspaceTaskState, WhiteboardStroke, WhiteboardBoard, GroupedDraftPlacement, SkillsService, ConfigOption }; // A1-R17：+ConfigOption（stores/taskStore 属主型，Leaves KSt 簇消费）

/* ============================================================================
 * 0. 外部依赖接口（跨 chunk）—— 原 logger + 8 条 src-HCld2afU declare 已由
 *    A0-S2d 接线为上方真实 import（B5-11）；SubagentsService/SkillsService/
 *    Descriptor 接口为调用面契约，按已落地形状保留于本文件下半。
 * ==========================================================================*/

/* ── E2E 桥 window 挂载点（与 e2eStoreBridgeBootstrap.tsx 同一组全局名） ── */

declare global {
  interface Window {
    __zcodeSessionStoreE2E?: unknown;
    __whiteboardStoreE2E?: unknown;
    __subagentsStoreE2E?: unknown;
    __skillStoreE2E?: unknown;
  }
}


/* ============================================================================
 * 导出（原 jsx 2518，共 48 个；别名映射见文件头第二节）
 * ==========================================================================*/

export {
  filterNativeModelOptions,
  getWorkspaceInit,
  updateLastAgentModel,
  readLastAgentModelOnly,
  readLastAgentModelConfig,
  getTaskRuntime,
  mergeTaskMeta,
  resolveWorkspaceKey,
  getTaskUi,
  useStore,
  isE2EStoreBridgeEnabled,
  isTaskUnread,
  canGoForwardInTaskNav,
  isTaskNavAutomationsEntry,
  parseCustomModelId,
  getMergedTaskListItem,
  getMergedTaskList,
  persistLastAgentConfigIfUnchanged,
  getCurrentThoughtLevelValue,
  getWorkspaceTaskStateAlias,
  getWorkspaceTaskState,
  mergeTaskMetaMany,
  applyStoredConfigToOptions,
  useSubagentContextsStore,
  hasThoughtLevelOption,
  WHITEBOARD_DARK_COLOR,
  createWhiteboardStroke,
  dispatchWhiteboardAddToChat,
  buildTaskConfigOptionsFromMeta,
  useTaskStore,
  getSubagentContextScopeKey,
  canGoBackInTaskNav,
  formatCustomModelId,
  resolveWhiteboardWorkspaceKey,
  isWhiteboardAddToChatEvent,
  refreshSubagentStoresForWorkspace,
  useWhiteboardStore,
  renderWhiteboardToContext,
  create,
  useSubagentsStore,
  WHITEBOARD_ADD_TO_CHAT_EVENT,
  useSkillsStore,
  whiteboardToPngFile,
  applyStoredModelToOptions,
  getCurrentModelValue,
  writeLastAgentConfig,
  clearLastAgentModelConfig,
  getActiveTaskStatusError,
};

/* ============================================================================
 * 文件尾符号表（混淆名 → 语义名；行号 = jsx 孪生文件）
 * ==========================================================================*/
/*
 * §1 zustand 运行时：
 *   d (5) ReactInterop【import 侧，未单列符号】 | f (6) createStoreImpl | p (26) createVanillaStore
 *   m (27) identitySelector | h (28) useStore【导出 J】 | g (32) createBoundStore | _ (38) create【导出 q】
 * §2 环境：ee (40) readBuildEnvSnapshot | v (50) isE2EStoreBridgeEnabled【导出 K】
 * §3 任务状态模型：
 *   te (53) initialWorkspaceInitState | ne (58) DEFAULT_PROVIDER | re (59) initialTaskUiState
 *   ie (67) initialTaskRuntimeState | ae (79) createInitialWorkspaceTaskState | oe (120) defaultWorkspaceTaskState
 *   se (121) getDefaultWorkspaceTaskState | ce (124) hasOwnProperty | le (127) isUntitledTaskTitle
 *   ue (131) pickTaskTitle | y (134) mergeTaskMeta【导出 G】 | de (150) mergeTaskMetaMany【导出 W】
 *   b (155) resolveWorkspaceKey【导出 H】 | x (158) pickRecordByTaskIds | fe (162) collectWorkspaceTaskIds
 *   pe (169) scopeWorkspaceTaskState | S (195) getWorkspaceTaskState【导出 V】 | C (200) updateWorkspaceTaskState
 *   w (218) getTaskRuntime【导出 F】 | me (221) getActiveTaskStatusError【导出 z】 | T (232) getTaskUi【导出 I】
 *   E (235) getMergedTaskListItem【导出 P】 | he (240) getMergedTaskList【导出 R】 | ge (246) isTaskUnread【导出 L】
 *   _e (249) getWorkspaceTaskStateAlias【导出 U】 | ve (252) getWorkspaceInit【导出 B】
 * §4 导航历史：
 *   ye (255) TASK_NAV_HISTORY_LIMIT | be (256) createEmptyTaskNavHistory | xe (262) isTaskNavTaskEntry
 *   Se (265) isTaskNavAutomationsEntry【导出 N】 | Ce (268) isSameTaskNavEntry | we (271) pushTaskNavEntry
 *   Te (287) pushTaskNavTaskEntry | Ee (297) pushTaskNavAutomationsEntry | De (309) canGoBackInTaskNav【导出 j】
 *   Oe (312) canGoForwardInTaskNav【导出 M】 | ke (315) goBackInTaskNavHistory | Ae (327) goForwardInTaskNavHistory
 *   je (339) removeTaskFromTaskNavHistory | Me (350) createTaskNavActions
 * §5 草稿持久化：
 *   Ne (377) COMPOSER_DRAFT_STORAGE_PREFIX | Pe (378) DEFAULT_DRAFT_SCOPE | Fe (379) getDraftStorage
 *   Ie (387) getComposerDraftStorageKey | Le (391) readComposerDraftStore | Re (412) clearComposerDraftScope
 * §6 等价性：
 *   ze (427) isSameConfigOptionValueJson | Be (430) areConfigOptionsEqual | Ve (436) sortTaskListByRecency
 *   He (439) areElicitationOptionListsEqual | Ue (445) isSameTaskInteractionRequest | We (448) isSameUsageCost
 *   Ge (453) isSameUsageCacheStats | Ke (456) isSameUsageBreakdown | qe (459) isSameTaskUsage
 *   Je (462) normalizeContextWindow
 * §7 运行时动作：Ye (465) updateWorkspaceTaskStateResolved | Xe (476) createTaskRuntimeActions（16 动作）
 * §8 供应商/模型持久化：
 *   Ze (850) LAST_AGENT_PROVIDER_KEY | Qe (851) getProviderStorage | $e (859) persistLastAgentProvider
 *   et (862) CUSTOM_PROVIDER_IDS | tt (863) parseCustomProviderModelSuffix | nt (872) isCustomModelOption
 *   rt (878) formatCustomModelId【导出 k】 | D (881) parseCustomModelId【导出 O】 | it (884) filterNativeModelOptions【导出 A】
 *   O (887) LAST_AGENT_MODEL_KEY | at (888) LAST_AGENT_THOUGHT_LEVEL_KEY | ot (889) LAST_AGENT_CONFIG_KEY
 *   k (890) GLOBAL_SCOPE | A (891) LAST_AGENT_CONFIG_SCHEMA_VERSION | st (892) GLM_MODEL_PREFIX
 *   ct (893) GLM_DATED_MODEL_PATTERN | lt (894) MAX_THOUGHT_LEVEL | ut (895) DISABLED_THOUGHT_VALUES
 *   j (896) getModelStorage | dt (904) resolveIdentityKey | M (907) getIdentityScopedModelKey
 *   ft (910) getWorkspaceModelStorageKey | pt (913) getGlobalModelKey | N (916) getGlobalThoughtLevelKey
 *   P (919) getGlobalConfigKey | F (922) getWorkspaceModelKey | mt (925) findModelSelectOption
 *   ht (928) findThoughtLevelSelectOption | gt (931) collectModelValueAliases | _t (944) extractModelNameFromQualified
 *   vt (953) isQualifiedProviderModel | I (958) getCurrentModelValue【导出 w】 | yt (962) getCurrentThoughtLevelValue【导出 T】
 *   bt (966) parseLastAgentConfig | xt (981) readGlobalLastAgentConfig | St (984) readLastAgentModel
 *   Ct (996) clearLegacyModelKeys | L (999) writeLastAgentConfig【导出 x】 | wt (1014) persistLastAgentConfigIfUnchanged【导出 S】
 *   R (1018) readLastAgentModelConfig【导出 E】 | Tt (1039) readLastAgentModelOnly【导出 D】 | Et (1042) updateLastAgentModel【导出 C】
 *   Dt (1051) clearLastAgentModelConfig【导出 y】 | Ot (1056) applyStoredModelToOptions【导出 v】 | z (1067) hasThoughtLevelOption【导出 b】
 *   kt (1071) applyThoughtLevelToOptions | At (1081) resolveThoughtLevelWithMaxFallback | jt (1084) getMaxThoughtLevelIfSupported
 *   Mt (1087) resolveMaxThoughtLevelForModel | Nt (1090) isThoughtLevelDisabled | Pt (1093) isGlmModelSelected
 *   B (1097) getModelNameAliases | Ft (1103) applyStoredConfigToOptions【导出 _】 | It (1109) findModeSelectOption
 *   Lt (1112) getCurrentModeValue
 * §9 模型切换守卫：
 *   Rt (1118) modelSwitchGuardCache【只读预留，无 set】 | V (1119) trimToNull | zt (1124) findSelectOptionByCategory
 *   Bt (1127) getCurrentValueByCategory | Vt (1130) isSameModelAlias | Ht (1134) getModelSwitchGuard
 *   Ut (1139) findMatchingCurrentOption | Wt (1142) optionHasValue | Gt (1145) isOptionValueAcceptable
 *   Kt (1148) shouldKeepCurrentModelOption | qt (1153) pickAuthoritativeOption | Jt (1157) reconcileConfigOptionsWithGuard
 * §10 模型 ID 归一与选项装配：
 *   Yt (1187) parseProviderQualifiedModel | Xt (1198) isSyntheticModel | Zt (1201) normalizeGlmModelId
 *   Qt (1209) resolveTaskMetaModel | $t (1213) getModelDisplayName | en (1218) withModelCurrentValue
 *   tn (1230) createModelSelectOption | nn (1243) createModeSelectOption | rn (1253) createThoughtLevelSelectOption
 *   an (1266) withCurrentValueGeneric | on (1278) injectTaskModelIntoOptions | sn (1294) buildTaskConfigOptionsFromMeta【导出 g】
 * §11 分组草稿与模式：
 *   cn (1316) groupedDraftCounter | ln (1317) createGroupedDraftId | un (1320) sanitizeThoughtLevelOption
 *   H (1330) sanitizeConfigOptions | dn (1333) cloneConfigOptions | fn (1341) isSameGroupedDraftPlacement
 *   pn (1344) isModeSelectOption | mn (1347) createModeOptionFromCurrentId | U (1361) replaceModeOption
 *   hn (1366) applyModeIdToOptions | gn (1378) updateActiveTaskConfigOptions | _n (1391) resolveTaskConfigOptionsForActivation
 * §12 vn (1411) createTaskStateActions（25 动作）
 * §13 yn (1794) useTaskStore【导出 h】+ E2E 挂载 (1800)
 * §14 白板：
 *   bn (1802) WHITEBOARD_DEFAULT_WIDTH | xn (1803) WHITEBOARD_DEFAULT_HEIGHT | Sn (1804) WHITEBOARD_DARK_COLOR【导出 c】
 *   Cn (1805) WHITEBOARD_ADD_TO_CHAT_EVENT【导出 s】 | wn (1806) WHITEBOARD_BACKGROUND_COLOR | W (1807) resolveWhiteboardWorkspaceKey【导出 l】
 *   Tn (1813) createWhiteboard | En (1826) createUniqueWhiteboardName | Dn (1833) createWhiteboardStroke【导出 d】
 *   On (1842) renderWhiteboardToContext【导出 p】 | kn (1849) drawWhiteboardStroke | An (1861) renderWhiteboardToPngDataUrl
 *   jn (1868) whiteboardToPngFile【导出 u】 | Mn (1879) isWhiteboardAddToChatEvent【导出 m】 | Nn (1882) dispatchWhiteboardAddToChat【导出 f】
 *   Pn (1890) sanitizeWhiteboardFileName | Fn (1893) isWhiteboardAddToChatDetail | G (1898) getWhiteboardWorkspaceState
 *   K (1904) updateWhiteboardBoard | In (1923) useWhiteboardStore【导出 o】+ E2E 挂载 (2014)
 * §15 子代理上下文：
 *   q (2015) subagentContextInflight | J (2016) subagentContextLoadSeqByScope | Ln (2017) subagentContextLoadSeq
 *   Y (2018) getSubagentContextScopeKey【导出 i】 | X (2021) setSubagentContext | Rn (2029) loadSubagentContext
 *   zn (2043) loadSubagentContextIntoStore | Bn (2094) useSubagentContextsStore【导出 a】
 * §16 子代理单例：
 *   Z (2135) subagentListInflight | Vn (2136) subagentOperationSeq | Hn (2137) getSubagentScopeKey
 *   Un (2140) listSubagentsCached | Wn (2155) nextSubagentOperationSeq | Q (2158) isCurrentSubagentOperation
 *   Gn (2161) useSubagentsStore【导出 r】+ E2E 挂载 (2356) | Kn (2357) refreshSubagentStoresForWorkspace【导出 n】
 * §17 技能：
 *   $ (2368) skillListInflight | qn (2369) getSkillScopeKey | Jn (2372) listSkillsCached
 *   Yn (2387) useSkillsStore【导出 t】+ E2E 挂载 (2517)
 * 导出语句：jsx 2518（48 个，见上方 export 块与文件头别名表）
 * 〔A0-S4-3：实体已迁 ../stores/（zustand/e2eStoreBridge/taskStore/whiteboardStore/
 *   subagentsStore/skillsStore）；本表映射保留，本文件仅 re-export〕
 */
