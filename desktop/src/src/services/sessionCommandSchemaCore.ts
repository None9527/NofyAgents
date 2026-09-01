/* ============================================================================
 * sessionCommandSchemaCore.ts —— A1-P3-B7：会话命令 schema/包壳域逐字补面
 * （styles js 两子区 126 行；Jke–Qke 危险链带全证据链收——前置六符全落实体）
 * 真身基准（只读）：desktop/src/out/renderer/assets/styles-CdEGpc2x.js
 *   （md5 48d71d4874b0868d61fd35a328bf6ad5，行号一律以它为准）。
 * 区段（两子区，非连续）：
 *   34229–34338（Jke…Qke 命令载荷 schema 表/型枚举/CAS 集/行靶集，自 bS 巨型
 *     var 语句〔33890 起〕S19 切出——bS 类已录〔批 4〕，本批只取尾段五声明者）
 *   + 34630–34645（OS 命令包壳构造器，function 声明）。
 * 前置证据链（批 4/5 危险链裁定翻转之据，二跳 styles ← facade ← 已重构实体）：
 *   Ci←so→StreamRowKeySchema(SrcSharedB 2845) | gne←po→McpServerConfigSchema(SrcSharedB 1046)
 *   Qee←do→BrowserAmbientContextSchema(SrcSharedB 2081) | Dte←is→imBindingSchema(SrcSharedA 1389)
 *   ii←fo→RuntimeModelSelectionSchema(SrcSharedB 1233) | ci←gs→ISSUE_CODES(SrcSharedA 393)
 *   ——模块初始化所读 src 块面全为真值实体，闭合且启动安全。
 * 消费面：Xke 区外消费位 = 34345 死语句（批 4 墓碑）；OS 区外消费位 = 117414/119477
 *   （会话命令发送域，留批）——只立实体，canonical 立档。
 * 转录机制：AST 精确改名（109 处），往返核对 ROUNDTRIP[m] EXACT（126 行）在案
 *   （/tmp/a1r0-p3/p3b7m-roundtrip.js）；缝剥离 SEAMSTRIP[m] EXACT（p3b7m-seamstrip.js）。
 * 映射表（minified → 语义名 → bundle 定义行，6 符）：
 *   Jke→commandModelConfigShape(34229) | Yke→sessionCommandPayloadSchemas(34236)
 *   Xke→sessionCommandTypeEnum(34314) | Zke→casCommandTypes(34315)
 *   Qke→rowTargetCommandTypes(34332) | OS→buildSessionCommandEnvelope(34630)
 * 跨块直连：ji/K/Jr/Li/Oi/Ar/Yn→SrcSharedA zod 面；Dte→imBindingSchema /
 *   ci→ISSUE_CODES（SrcSharedA）；ii→RuntimeModelSelectionSchema / gne→McpServerConfigSchema /
 *   Qee→BrowserAmbientContextSchema / Ci→StreamRowKeySchema（SrcSharedB）；
 *   Mx→attachmentShape（conversationFrameSchemaCore）；wS→uuidV7 / DS→resolveClientId
 *   （conversationWireCore）。
 * 墓碑（同区留批/不录，边界证据见 A1-P3-B7.report.md §六）：
 *   34339–34348 丢弃式死语句（消费 Xke）——批 4 墓碑在案，不录。
 * 型缝（全型层，禁抑制符）×4：S19 语句切分 ×1（Jke 片头 var 前缀；片尾 34338 本已 ;）
 *   + P1 顶层函数参数 :any ×1（buildSessionCommandEnvelope e）
 *   + S16 any 接收面回调参数 :any ×2（Yke sendText superRefine e/t）。
 * ==========================================================================*/
/* eslint-disable */
import { zObject, zString, zEnum, zBoolean, zArray, zRecord, zUnknown, imBindingSchema, ISSUE_CODES } from "../modules/SrcSharedA";
import { RuntimeModelSelectionSchema, McpServerConfigSchema, BrowserAmbientContextSchema, StreamRowKeySchema } from "../modules/SrcSharedB";
import { uuidV7, resolveClientId } from "./conversationWireCore";
import { attachmentShape } from "./conversationFrameSchemaCore";

var commandModelConfigShape = zObject({
    provider: zString().optional(),
    model: zString().optional(),
    thought: zString().optional(),
    followupMode: zEnum([`queue`, `guide`]).optional(),
    mode: zString().optional(),
  }),
  sessionCommandPayloadSchemas = {
    createSession: zObject({
      workspaceId: zString(),
      firstInput: zObject({ text: zString(), attachments: zArray(attachmentShape).optional() }).optional(),
      config: commandModelConfigShape.optional(),
      runtimeModel: RuntimeModelSelectionSchema.optional(),
      mcpServers: zArray(McpServerConfigSchema).optional(),
    }),
    createSelectionSideSession: zObject({}),
    sendText: zObject({
      text: zString(),
      attachments: zArray(attachmentShape).optional(),
      browserAmbientContext: BrowserAmbientContextSchema.optional(),
      heldQueueDisposition: zEnum([`clearQueueAndSend`, `keepQueueAndSend`]).optional(),
      expectedHeldQueueItemIds: zArray(zString().min(1)).optional(),
      turnRuntimeModel: RuntimeModelSelectionSchema.optional(),
      automationId: zString().min(1).optional(),
      offPeakTaskId: zString().min(1).optional(),
      offPeakRunType: zEnum([`init`, `resume`]).optional(),
      botDeliveryTarget: imBindingSchema.optional(),
      toolDisallowlist: zArray(zString().min(1)).optional(),
    }).superRefine((e: any, t: any) => {
      (e.automationId &&
        e.offPeakTaskId &&
        t.addIssue({
          code: ISSUE_CODES.custom,
          message: `automationId and offPeakTaskId are mutually exclusive`,
        }),
        e.offPeakRunType &&
          !e.offPeakTaskId &&
          t.addIssue({
            code: ISSUE_CODES.custom,
            message: `offPeakRunType requires offPeakTaskId`,
            path: [`offPeakRunType`],
          }));
    }),
    sendGoalCommand: zObject({
      text: zString(),
      displayText: zString().optional(),
      heldQueueDisposition: zEnum([`clearQueueAndSend`, `keepQueueAndSend`]).optional(),
      expectedHeldQueueItemIds: zArray(zString().min(1)).optional(),
    }),
    stop: zObject({ expectedForegroundExecutionId: zString().min(1).optional() }),
    compact: zObject({}),
    forkAssistant: zObject({ target: StreamRowKeySchema }),
    applyFileRewind: zObject({ target: StreamRowKeySchema }),
    editUserQuery: zObject({
      target: StreamRowKeySchema,
      newText: zString(),
      attachments: zArray(attachmentShape).optional(),
      workspaceMode: zEnum([`preserve`, `rewind`]).optional(),
    }),
    retryTurn: zObject({ target: StreamRowKeySchema }),
    setAssistantFeedback: zObject({ target: StreamRowKeySchema, feedback: zEnum([`like`, `dislike`]).nullable() }),
    sendQueuedNow: zObject({ queueItemId: zString() }),
    editQueueItem: zObject({ queueItemId: zString(), newText: zString() }),
    reorderQueueItem: zObject({ queueItemId: zString(), beforeQueueItemId: zString().nullable() }),
    deleteQueueItem: zObject({ queueItemId: zString() }),
    setAutoDrain: zObject({ autoDrain: zBoolean() }),
    resolveInteraction: zObject({
      interactionId: zString(),
      answer: zObject({
        optionId: zString().optional(),
        freeText: zString().optional(),
        action: zEnum([`accept`, `decline`, `cancel`]).optional(),
        content: zRecord(zString(), zUnknown()).optional(),
      }),
    }),
    snoozeInteractionAutoResolution: zObject({ interactionId: zString() }),
    switchModelConfig: zObject({ provider: zString(), model: zString(), thought: zString(), runtimeModel: RuntimeModelSelectionSchema.optional() }),
    switchCollaborationMode: zObject({ mode: zEnum([`build`, `edit`, `plan`, `yolo`]) }),
    setFollowupMode: zObject({ mode: zEnum([`queue`, `guide`]) }),
    pauseGoal: zObject({}),
    resumeGoal: zObject({}),
    cancelBackgroundWork: zObject({ workId: zString() }),
    renameSession: zObject({ title: zString() }),
    deleteSession: zObject({}),
  },
  sessionCommandTypeEnum = zEnum(Object.keys(sessionCommandPayloadSchemas)),
  casCommandTypes = new Set([
    `applyFileRewind`,
    `forkAssistant`,
    `editUserQuery`,
    `retryTurn`,
    `setAssistantFeedback`,
    `sendQueuedNow`,
    `editQueueItem`,
    `reorderQueueItem`,
    `deleteQueueItem`,
    `setAutoDrain`,
    `switchModelConfig`,
    `switchCollaborationMode`,
    `setFollowupMode`,
    `pauseGoal`,
    `resumeGoal`,
  ]),
  rowTargetCommandTypes = new Set([
    `applyFileRewind`,
    `forkAssistant`,
    `editUserQuery`,
    `retryTurn`,
    `setAssistantFeedback`,
  ]);
function buildSessionCommandEnvelope(e: any) {
  if (casCommandTypes.has(e.type) && e.baseRevision === void 0)
    throw Error(`command ${e.type} 是 CAS 命令，必须携带 baseRevision（10-protocol-spec §6.4）`);
  if (rowTargetCommandTypes.has(e.type) && !e.baseLogEpoch)
    throw Error(`command ${e.type} 是 row target 命令，必须携带 baseLogEpoch`);
  return {
    commandId: uuidV7(),
    clientId: resolveClientId(),
    sessionId: e.sessionId,
    ...(e.baseRevision === void 0 ? {} : { baseRevision: e.baseRevision }),
    ...(e.baseLogEpoch ? { baseLogEpoch: e.baseLogEpoch } : {}),
    type: e.type,
    payload: e.payload,
    issuedAt: Date.now(),
  };
}

export {
  commandModelConfigShape, sessionCommandPayloadSchemas, sessionCommandTypeEnum,
  casCommandTypes, rowTargetCommandTypes, buildSessionCommandEnvelope,
};
