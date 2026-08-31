// A1-P1：R0 ConversationPane 簇（styles js 119219 区，R0 期判「未重建」留批）卫星域逐字转录。
// 真身基准（只读）：desktop/src/out/renderer/assets/styles-CdEGpc2x.js（md5 48d71d4874b0868d61fd35a328bf6ad5）。
// 映射表（minified → 语义名 → bundle 行）：
//   qCt → resolveCodingPlanCounterpartId  119085–119087（XCt 119139 消费）
//   JCt → isCodingPlanFamilyProvider      119088–119097（XCt 119110 消费）
//   YCt → isActiveTaskPhase               119098–119100（XCt 119163 消费）
//   ZCt → isImmediateInputRouting         119191–119193（R0 120147 消费）
//   QCt → buildSessionErrorKey            119194–119196（R0 120935 消费）
//   $Ct → EMPTY_SUBAGENT_DIRECTORY        119197（R0 120886 消费）
//   ewt → INFLIGHT_COMMAND_CACHE_LIMIT    119198（R0 119569 消费）
//   twt → buildSessionErrorBannerModel    119199–119208（R0 120936 消费）
//   nwt → dataTransferContainsFiles       119209–119216（R0 119330/119333 消费）
//   rwt → isProviderNotInRegistryFailure  119217–119219（R0 120406/120449 消费）
//   iwt → buildQueueItemEditDraft         119220–119232（R0 120282 消费）
//   awt → isAckAcceptedOrDuplicate        119233–119235（R0 120291 消费）
//   Y_t → GOAL_COMMAND_REGEX              111720（X_t 111744 消费）
//   X_t → prefixGoalCommand               111741–111745（iwt 119229 消费）
//   Ij → trimOrNull                       52280–52282（sUe 52294–52297 消费；〔A1-P1-B5〕）
//   sUe → buildTelemetryScopeKey          52293–52301（R0 119414 消费；〔A1-P1-B5〕）
//   eN → resolveInteractionBehaviorMode   53594–53596（R0 119463 消费；53618 域留批；〔A1-P1-B5〕）
//   nN → packFollowupModeConfig           53786–53789（R0 120033/120075/120476 消费；〔A1-P1-B5〕）
//   Bbt → isLiveSessionMatch              115574–115576（R0 119311 消费；〔A1-P1-B5〕）
//   Vbt → hasPluginUserInputRows          115577–115579（R0 119311 消费；〔A1-P1-B5〕）
// 函数体内局部变量保留混淆名（B5 约定）；型缝带〔A1-P1〕注释。
// 环安全：本叶仅 import modules/SrcSharedA（zod 单依赖叶子）；modules/Conversation 单向消费本叶。
/* eslint-disable */
import { providerIds } from '../../modules/SrcSharedA'; // 原 q（styles q=mo；A0-CLEANUP B-7 判例：providerIds canonical）

/** 原 qCt（js 119085）：基础供应商 → 对应 coding-plan 供应商（非两族直通；XCt 升级流 119139 消费） */
export function resolveCodingPlanCounterpartId(e: string | null): string | null { // 〔A1-P1〕型缝：XCt 119126 首参 t=providerId?.trim()||null
  return e === providerIds.zai ? providerIds.zaiCodingPlan : e === providerIds.bigmodel ? providerIds.bigmodelCodingPlan : e;
}
/** 原 JCt（js 119088）：计划族六键判定（zai/bigmodel 基础 + 四计划键；XCt 119110 消费） */
export function isCodingPlanFamilyProvider(e: string | null): boolean { // 〔A1-P1〕型缝：同 qCt 首参面
  return (
    e === providerIds.zai ||
    e === providerIds.zaiCodingPlan ||
    e === providerIds.zaiStartPlan ||
    e === providerIds.bigmodel ||
    e === providerIds.bigmodelCodingPlan ||
    e === providerIds.bigmodelStartPlan
  );
}
/** 原 YCt（js 119098）：活动任务相位判定（XCt 相位刷新门 119163 消费） */
export function isActiveTaskPhase(e: string | null | undefined): boolean { // 〔A1-P1〕型缝：phase 面 Ce?.control.phase ?? null
  return e === `prewarming` || e === `running`;
}
/** 原 ZCt（js 119191）：即时输入路由判定（draft/held/startNow；R0 提交流 120147 消费） */
export function isImmediateInputRouting(e: { draftMode?: boolean | null; heldQueueDisposition?: unknown; inputRoutingMode?: string | null }): boolean { // 〔A1-P1〕型缝：R0 120147–120151 调用面三键
  return e.draftMode || e.heldQueueDisposition ? !0 : e.inputRoutingMode === `startNow`;
}
/** 原 QCt（js 119194）：会话错误去重键（sessionId:code:at:message:traceId:detail；R0 120935 消费） */
export function buildSessionErrorKey(e: string | null | undefined, t: { code: string; at: number; message: string; traceId?: string; detail?: string }): string { // 〔A1-P1〕型缝：control.lastError 面（modules/Conversation 4629 同形）
  return [e?.trim() || `draft`, t.code, t.at, t.message, t.traceId ?? ``, t.detail ?? ``].join(`:`);
}
/** 原 $Ct（js 119197）：空子代理目录（R0 120886 兜底）；〔A1-P1〕modules/Conversation 旧本地副本删碑改指本真身 */
export const EMPTY_SUBAGENT_DIRECTORY = { revision: 0, childSessionIds: [], running: [], endedTotal: 0 },
  /** 原 ewt（js 119198）：在飞命令缓存上限（R0 119569 逐出循环门） */
  INFLIGHT_COMMAND_CACHE_LIMIT = 20;
/** 原 twt（js 119199）：会话错误 → 横幅模型（条件展平 traceId/detail/attribution/taskId；R0 120936 消费） */
export function buildSessionErrorBannerModel(e: string | null | undefined, t: { code: string; message: string; traceId?: string; detail?: string; attribution?: unknown }): object { // 〔A1-P1〕型缝：返回面宽化 object（R0 域 xr 透传，终端消费留批）
  return {
    code: t.code,
    message: t.message,
    ...(t.traceId ? { traceId: t.traceId } : {}),
    ...(t.detail ? { detail: t.detail } : {}),
    ...(t.attribution ? { attribution: t.attribution } : {}),
    ...(e ? { taskId: e } : {}),
  };
}
/** 原 nwt（js 119209）：拖拽载荷含文件判定（R0 拖放门 119330/119333 消费） */
export function dataTransferContainsFiles(e: { types: Iterable<string>; items?: Iterable<{ kind: string }> | null }): boolean { // 〔A1-P1〕型缝：DataTransfer 最小消费面（types/items.kind）
  let t = Array.from(e.types);
  return (
    t.includes(`Files`) ||
    t.includes(`application/x-zcode-workspace-file`) ||
    Array.from(e.items ?? []).some((e) => e.kind === `file`)
  );
}
/** 原 rwt（js 119217）：供应商未登记失败判定（R0 120406/120449 消费） */
export function isProviderNotInRegistryFailure(e: { status?: string; reasonCode?: string } | null | undefined): boolean { // 〔A1-P1〕型缝：错误对象最小消费面 status/reasonCode
  return e?.status === `failed` && e.reasonCode === `provider.notInRegistry`;
}
/** 原 iwt（js 119220）：队列项 → 撤回编辑草稿（compact 项 null；R0 120282 消费） */
export function buildQueueItemEditDraft(e: { revision: number; queue: { items: Array<{ queueItemId: string; sourceCommandId?: string; kind: string; text: string; attachments: Array<Record<string, unknown>> }> } }, t: string): { baseRevision: number; queueItemId: string; sourceCommandId?: string; inputKind: string; text: string; attachments: Array<Record<string, unknown>> } | null { // 〔A1-P1-B3〕型缝宽化：返回面由 object 收敛为撤回编辑草稿真面（baseRevision/sourceCommandId/inputKind/text/attachments，R0 120290–120310 消费）
  let n = e.queue.items.find((e) => e.queueItemId === t);
  return !n || n.kind === `compact`
    ? null
    : {
        baseRevision: e.revision,
        queueItemId: t,
        sourceCommandId: n.sourceCommandId,
        inputKind: n.kind,
        text: prefixGoalCommand(n.kind, n.text),
        attachments: n.attachments.map((e) => ({ ...e })),
      };
}
/** 原 awt（js 119233）：ACK 成功判定（accepted/duplicate；R0 120291 消费） */
export function isAckAcceptedOrDuplicate(e: string | null | undefined): boolean { // 〔A1-P1〕型缝：ack.status 面
  return e === `accepted` || e === `duplicate`;
}
/** 原 Vgt（js 110053）：交互阻塞判定（permission 或 userInput+AskUserQuestion；R0 119722 消费）〔A1-P1-B4〕逐字实体化 */
export function hasBlockingInteractions(e: Array<{ payload: { kind: string; toolName?: string } }>): boolean { // 〔A1-P1-B4〕型缝：交互列最小消费面
  return e.some(
    (e) =>
      e.payload.kind === `permission` ||
      (e.payload.kind === `userInput` && e.payload.toolName === `AskUserQuestion`),
  );
}
/** 原 Hgt（js 110060）：compact/goalVerifier 行判定（R0 119723 消费）〔A1-P1-B4〕逐字实体化 */
export function hasCompactOrGoalRows(e: Array<{ kind: string }>): boolean { // 〔A1-P1-B4〕型缝：行列最小消费面
  return e.some((e) => e.kind === `compact` || e.kind === `goalVerifier`);
}
/** 原 Y_t（js 111720） */
export const GOAL_COMMAND_REGEX = /^\/(?:goal|target)(?:\s|$)/i;
/** 原 X_t（js 111741）：sendGoalCommand 时确保文本带 /goal 前缀（iwt 119229 消费）；〔A1-P1〕modules/Conversation 旧语义副本（prefixGoalCommand/GOAL_COMMAND_REGEX，树内零消费）删碑，本叶为 bundle 唯一真身 */
export function prefixGoalCommand(e: string, t: string): string {
  if (e !== `sendGoalCommand`) return t;
  let n = t.trim();
  return n ? (GOAL_COMMAND_REGEX.test(n) ? t : `/goal ${n}`) : t;
}
/** 原 Ij（js 52280）：trim → null（sUe 52294–52297 消费）〔A1-P1-B5〕逐字实体化 */
export function trimOrNull(e: string | null | undefined): string | null { // 〔A1-P1-B5〕型缝：可空串面
  return e?.trim() || null;
}
/** 原 sUe（js 52293）：遥测作用域键（workspace::pane::session|task；R0 119414 消费）〔A1-P1-B5〕逐字实体化 */
export function buildTelemetryScopeKey({ workspacePath: e, workspaceIdentity: t, paneId: n, sessionId: r, taskId: i }: { workspacePath?: string | null; workspaceIdentity?: string | null; paneId?: string | null; sessionId?: string | null; taskId?: string | null }): string | null { // 〔A1-P1-B5〕型缝：五键可空串解构面
  let a = trimOrNull(t) ?? trimOrNull(e),
    o = trimOrNull(n),
    s = trimOrNull(r),
    c = trimOrNull(i);
  if (!a) return null;
  let l = o ? `${a}::pane:${o}` : a;
  return s ? `${l}::session:${s}` : c ? `${l}::task:${c}` : null;
}
/** 原 eN（js 53594）：交互行为模式（guide|queue|null；R0 119463 消费）〔A1-P1-B5〕逐字实体化 */
export function resolveInteractionBehaviorMode(e: { zcodeInteractionBehavior?: string } | null | undefined): string | null { // 〔A1-P1-B5〕型缝：settings 最小消费面
  return e ? (e.zcodeInteractionBehavior === `guide` ? `guide` : `queue`) : null;
}
/** 原 nN（js 53786）：followup 模式配置打包（{config}|{}；R0 120033/120075/120476 消费）〔A1-P1-B5〕逐字实体化 */
export function packFollowupModeConfig(e: Record<string, unknown> | null | undefined, t: string | null | undefined, n?: Record<string, unknown> | null): { config?: Record<string, unknown> } { // 〔A1-P1-B5〕型缝：spread 源宽化面
  let r = { ...n, ...e };
  return (t && (r.followupMode = t), Object.keys(r).length > 0 ? { config: r } : {});
}
/** 原 Bbt（js 115574）：live 会话匹配（status live + sessionId 同；R0 119311 消费）〔A1-P1-B5〕逐字实体化 */
export function isLiveSessionMatch(e: string | null | undefined, t: string | null | undefined, n: string | null | undefined): boolean { // 〔A1-P1-B5〕型缝：三元可空串面
  return !!(e === `live` && t && n === t);
}
/** 原 Vbt（js 115577）：行含插件用户输入（R0 119311 消费）〔A1-P1-B5〕逐字实体化 */
export function hasPluginUserInputRows(e: Array<{ kind: string; text?: string | null }>): boolean { // 〔A1-P1-B5〕型缝：行最小消费面 kind/text
  return e.some((e) => e.kind === `userInput` && e.text?.includes(`(plugin://`));
}
