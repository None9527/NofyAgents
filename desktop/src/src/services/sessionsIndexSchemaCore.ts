/* ============================================================================
 * sessionsIndexSchemaCore.ts —— A1-P3-B5：sessions-index 帧 schema 基底族逐字补面
 * （styles js 32959–33508 八子区，80 行；oS 整链闭合——协议簇五符最后一符）
 * 真身基准（只读）：desktop/src/out/renderer/assets/styles-CdEGpc2x.js
 *   （md5 48d71d4874b0868d61fd35a328bf6ad5，行号一律以它为准）。
 * 区段（八子区，非连续；留尾区段见下墓碑）：
 *   32959（Px 相位枚举）+ 33044（Vx 标题元）+ 33104–33112（Wx 自动解决态）
 *   + 33156–33177（Yx/ike/Xx 计划/目标族）+ 33288–33317（fke/pke/mke/Qx/hke/gke 会话索引族）
 *   + 33480–33492（iS 主题帧包壳工厂）+ 33505–33508（oS 会话索引帧 schema，S19 切出）。
 * 消费面：services/sessionIndex §B5-transport 段（sessionIndexTransportFactory，A1-P3-B3）
 *   之 oS 环境声明（line 661）删碑改指本叶 sessionIndexFrameSchema（34820 new bS(oS) 同址）。
 * 转录机制：AST 精确改名（110 处），往返核对 ROUNDTRIP[os] EXACT（80 行）在案
 *   （/tmp/a1r0-p3/p3b5-roundtrip.js）；缝剥离 SEAMSTRIP[os] EXACT（p3b5-seamstrip.js）。
 * 映射表（minified → 语义名 → bundle 定义行）：
 *   Px→sessionLifecyclePhases(32959) | Vx→sessionTitleMeta(33044)
 *   Wx→interactionAutoResolutionStates(33104) | Yx→planChecklistItem(33156)
 *   ike→planIteration(33157) | Xx→goalState(33158)
 *   fke→sessionPendingInteractionRef(33288) | pke→pendingInteractionSummaryCounts(33294)
 *   mke→lastTerminalQueryShape(33295) | Qx→sessionIndexEntry(33296)
 *   hke→sessionsIndexLogicalFrame(33313) | gke→sessionsIndexOps(33314)
 *   iS→buildTopicFrameSchema(33480) | oS→sessionIndexFrameSchema(33505)
 * 跨块直连：ji/K/Jr/Fi/Li/Oi/_t/$r→SrcSharedA zod 面；_i→wireServerTimeSchema
 *   （conversationWireCore 实体，src 块 If=E()）。
 * 墓碑（同区留尾，边界证据见 A1-P3-B5.report.md §七）：
 *   33180–33238 oke/ske/cke + 33240–33287 lke/uke/dke——conversation 行族/操作规约，
 *     oke 闭包含 jx 行族（32739–32958 内 BOe..qOe 族）超 600 单批预算，留批；
 *   33493–33528 aS var 语句共声明者 aS/Dke/Oke/kke/Ake/sS/jke/Mke——aS 消费位 39592
 *     （conversation 传输，P2 域），kke/Ake/Dke/Oke/sS/jke/Mke 仅 33529 丢弃式死元组消费；
 *     本叶 oS 以 S19 缝自该语句切出，表达式本体逐字不变；
 *   33357–33439 tS/nS + 33355–33356 Cke/eS——wire 包壳族（nS 读 bi 模块初始化面），留批。
 * 型缝（全型层，禁抑制符）×6：P1 函数参数 :any ×2（buildTopicFrameSchema e/t）+
 *   S16 any 接收面回调参数 :any ×2（oS superRefine e/t）+
 *   S19 语句切分 ×2（Px 链自 32739 var 语句切出：var 前缀 + Xx 收尾 ,→; ；
 *     oS 自 33493 var 语句切出：var 前缀 + 末行 ,→;）。
 * ==========================================================================*/
/* eslint-disable */
import { zObject, zString, zEnum, zLiteral, zBoolean, zArray, zNumber, zDiscriminatedUnion } from "../modules/SrcSharedA";
import { wireServerTimeSchema } from "./conversationWireCore";

var sessionLifecyclePhases = zEnum([`draft`, `prewarming`, `running`, `completedSuccess`, `completedInterrupted`, `error`]),
  sessionTitleMeta = zObject({ title: zString(), titleSource: zEnum([`default`, `generated`, `custom`]) }),
  interactionAutoResolutionStates = zDiscriminatedUnion(`state`, [
    zObject({
      state: zEnum([`hiddenGrace`, `visibleCountdown`]),
      startedAt: wireServerTimeSchema,
      visibleAt: wireServerTimeSchema,
      deadlineAt: wireServerTimeSchema,
    }),
    zObject({ state: zLiteral(`snoozed`), startedAt: wireServerTimeSchema, snoozedAt: wireServerTimeSchema }),
  ]),
  planChecklistItem = zObject({ id: zString(), content: zString(), status: zEnum([`pending`, `inProgress`, `completed`]) }),
  planIteration = zObject({ iteration: zNumber().int().positive(), items: zArray(planChecklistItem), updatedAt: wireServerTimeSchema }),
  goalState = zObject({
    targetId: zString().default(``),
    objective: zString(),
    summaryTitle: zString().nullable().default(null),
    timeUsedSeconds: zNumber().int().nonnegative().default(0),
    activeRunStartedAtMs: zNumber().int().nonnegative().nullable().default(null),
    status: zEnum([`active`, `paused`, `verifying`, `verified`, `notSatisfied`, `failed`]),
    iteration: zNumber(),
    verifications: zArray(
      zObject({
        iteration: zNumber(),
        outcome: zEnum([`pass`, `notSatisfied`, `failed`]),
        at: wireServerTimeSchema,
        anchorRowId: zNumber().nullable(),
        reason: zString().optional(),
        nextAction: zString().optional(),
      }),
    ),
    iterations: zArray(planIteration).default([]),
  });
var sessionPendingInteractionRef = zObject({
    interactionId: zString(),
    kind: zEnum([`permission`, `userInput`]),
    toolName: zString().optional(),
    autoResolution: interactionAutoResolutionStates.optional(),
  }),
  pendingInteractionSummaryCounts = zObject({ permissionCount: zNumber().int().nonnegative(), userInputCount: zNumber().int().nonnegative() }),
  lastTerminalQueryShape = zObject({ queryId: zString().min(1), historyRoundCount: zNumber().int().nonnegative() }),
  sessionIndexEntry = zObject({
    sessionId: zString(),
    workspaceId: zString(),
    parentSessionId: zString().optional(),
    title: zString(),
    titleSource: sessionTitleMeta.shape.titleSource.optional(),
    phase: sessionLifecyclePhases,
    sessionEnded: zBoolean(),
    hasBackgroundWork: zBoolean(),
    pendingInteraction: sessionPendingInteractionRef.optional(),
    pendingInteractionSummary: pendingInteractionSummaryCounts.optional(),
    goalStatus: goalState.shape.status.optional(),
    lastActivityAt: wireServerTimeSchema,
    lastAssistantPreview: zString().optional(),
    lastTerminalQuery: lastTerminalQueryShape.optional(),
    createdAt: wireServerTimeSchema,
  }),
  sessionsIndexLogicalFrame = zObject({ protocolVersion: zLiteral(1), workspaceId: zString(), logEpoch: zString(), sessions: zArray(sessionIndexEntry) }),
  sessionsIndexOps = zDiscriminatedUnion(`op`, [
    zObject({ op: zLiteral(`session.upserted`), session: sessionIndexEntry }),
    zObject({ op: zLiteral(`session.removed`), sessionId: zString() }),
  ]);
function buildTopicFrameSchema(e: any, t: any) {
  return zObject({
    topic: zString(),
    subscriptionId: zString(),
    fromSeq: zNumber(),
    toSeq: zNumber(),
    sentAt: wireServerTimeSchema,
    payload: zDiscriminatedUnion(`kind`, [
      zObject({ kind: zLiteral(`snapshot`), snapshot: e }),
      zObject({ kind: zLiteral(`deltas`), deltas: zArray(t) }),
    ]),
  });
}
var sessionIndexFrameSchema = buildTopicFrameSchema(sessionsIndexLogicalFrame, sessionsIndexOps).superRefine((e: any, t: any) => {
    (!e.topic.startsWith(`sessions-index/`) || e.topic.length === 15) &&
      t.addIssue({ code: `custom`, message: `invalid sessions-index topic`, path: [`topic`] });
  });
export {
  sessionLifecyclePhases, sessionTitleMeta, interactionAutoResolutionStates,
  planChecklistItem, planIteration, goalState,
  sessionPendingInteractionRef, pendingInteractionSummaryCounts, lastTerminalQueryShape,
  sessionIndexEntry, sessionsIndexLogicalFrame, sessionsIndexOps,
  buildTopicFrameSchema, sessionIndexFrameSchema,
};
