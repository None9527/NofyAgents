/* ============================================================================
 * commandReceiptCore.ts —— A1-P3-B5 项 2：命令回执/会话状态表逐字补面
 * （styles js 33601–33633 + 34349–34376 + 34394–34443 三子区，111 行）
 * 真身基准（只读）：desktop/src/out/renderer/assets/styles-CdEGpc2x.js
 *   （md5 48d71d4874b0868d61fd35a328bf6ad5，行号一律以它为准）。
 * 区段（三完整 var 语句，零 S19 缝）：
 *   33601–33633（Fke/Ike/Lke/cS 检查点文件族 + 回卷预览形）
 *   + 34349–34376（$ke/eAe/xS 命令结果/回执/ack 键）
 *   + 34394–34443（SS/CS/tAe 会话事件基形/主机名/性能度量）。
 * 消费面实测：三子区十符区外消费者零（34377–34393 / 34444–34597 仅丢弃式死语句消费
 *   xS/eAe/SS/tAe/CS，见下墓碑）——canonical 立档，不立消费接线。
 * 转录机制：AST 精确改名（103 处），往返核对 ROUNDTRIP[rc] EXACT（111 行）在案
 *   （/tmp/a1r0-p3/p3b5b-roundtrip.js）；缝剥离 SEAMSTRIP[rc] EXACT（p3b5b-seamstrip.js）。
 * 映射表（minified → 语义名 → bundle 定义行）：
 *   Fke→checkpointSafeFileShape(33601) | Ike→checkpointUnsafeFileShape(33607)
 *   Lke→checkpointIgnoredFileShape(33622) | cS→rewindPreviewShape(33628)
 *   $ke→sessionCommandResults(34349) | eAe→commandReceipt(34368) | xS→commandAckKey(34376)
 *   SS→sessionEventBase(34394) | CS→providerHostname(34403) | tAe→commandPerformanceMetrics(34411)
 * 跨块直连：ji/K/Jr/Fi/Li/Oi/_t/$r→SrcSharedA zod 面；_i→wireServerTimeSchema
 *   （conversationWireCore 实体，src 块 If=E()）。
 * 墓碑（丢弃式死码，不录）：34377–34393（ji 三件 .strict() 孤调用元组，消费 xS/eAe/Tt）；
 *   34444–34597（$r(`kind`, […SS 展开…]) 事件联合孤调用，消费 SS/CS/tAe）；
 *   34339–34348 死码件 B4 已碑（conversationWireCore banner 同录）。
 * 型缝（全型层，禁抑制符）×1：S16 any 接收面回调参数 :any ×1（providerHostname refine e）。
 * ==========================================================================*/
/* eslint-disable */
import { zObject, zString, zEnum, zLiteral, zBoolean, zArray, zNumber, zDiscriminatedUnion } from "../modules/SrcSharedA";
import { wireServerTimeSchema } from "./conversationWireCore";

var checkpointSafeFileShape = zObject({
    action: zEnum([`restore`, `delete`]),
    operationCount: zNumber().int().nonnegative(),
    path: zString().min(1),
    toolNames: zArray(zString()),
  }).strict(),
  checkpointUnsafeFileShape = zObject({
    currentHash: zString().optional(),
    expectedHash: zString().optional(),
    message: zString().optional(),
    operationCount: zNumber().int().nonnegative(),
    path: zString().min(1),
    reason: zEnum([
      `checkpoint_missing`,
      `checkpoint_unreadable`,
      `external_modified`,
      `file_read_failed`,
      `unsupported_checkpoint`,
    ]),
    toolNames: zArray(zString()),
  }).strict(),
  checkpointIgnoredFileShape = zObject({
    operationCount: zNumber().int().nonnegative(),
    path: zString().min(1),
    reason: zLiteral(`bash_ignored`),
    toolNames: zArray(zString()),
  }).strict(),
  rewindPreviewShape = zObject({
    canApply: zBoolean(),
    ignoredFiles: zArray(checkpointIgnoredFileShape),
    safeFiles: zArray(checkpointSafeFileShape),
    unsafeFiles: zArray(checkpointUnsafeFileShape),
  }).strict();
var sessionCommandResults = zDiscriminatedUnion(`type`, [
    zObject({
      type: zEnum([`createSession`, `createSelectionSideSession`, `forkAssistant`]),
      sessionId: zString(),
    }),
    zObject({
      type: zLiteral(`resolveInteraction`),
      resolvedBy: zObject({ clientId: zString(), optionId: zString().optional() }),
    }),
    zObject({ type: zLiteral(`applyFileRewind`), applied: zBoolean(), preview: rewindPreviewShape, response: zString() }),
    zObject({
      type: zLiteral(`editUserQuery`),
      disposition: zEnum([`rewind`, `fork`, `blocked`]),
      sessionId: zString().min(1),
      reasonCode: zString().min(1).optional(),
      preview: rewindPreviewShape.optional(),
    }),
    zObject({ type: zLiteral(`inputDisposition`), delivery: zEnum([`startNow`, `queue`, `guide`]) }),
  ]),
  commandReceipt = zObject({
    commandId: zString(),
    status: zEnum([`accepted`, `rejected`, `stale`, `duplicate`, `noop`, `failed`]),
    reasonCode: zString().optional(),
    message: zString().optional(),
    revisionAtDecision: zNumber(),
    result: sessionCommandResults.optional(),
  }),
  commandAckKey = zObject({ sessionId: zString().nullable(), commandId: zString().min(1) }).strict();
var sessionEventBase = {
    version: zLiteral(1),
    eventId: zString().min(1),
    eventSeq: zNumber().int().nonnegative(),
    occurredAt: wireServerTimeSchema,
    sessionId: zString().min(1),
    sourceCommandId: zString().min(1).optional(),
    turnId: zString().min(1).optional(),
  },
  providerHostname = zString()
    .min(1)
    .refine(
      (e: any) =>
        /^\[[0-9a-f:.]+\]$/iu.test(e) ||
        (!/[\s/:?#@]/u.test(e) && !e.includes(`[`) && !e.includes(`]`) && e.trim() === e),
      `providerHostname must be a hostname without scheme, port, path, query, credentials or fragment`,
    ),
  commandPerformanceMetrics = zObject({
    totalMs: zNumber().int().nonnegative().optional(),
    permissionWaitMs: zNumber().int().nonnegative().optional(),
    commandRunMs: zNumber().int().nonnegative().optional(),
    firstOutputMs: zNumber().int().nonnegative().optional(),
    noOutputMs: zNumber().int().nonnegative().optional(),
    exitCode: zNumber().int().optional(),
    timedOut: zBoolean().optional(),
    outputBytes: zNumber().int().nonnegative().optional(),
    commandCategory: zString().max(64).optional(),
    commandName: zString().max(128).optional(),
    commandCount: zNumber().int().nonnegative().optional(),
    commandStatus: zEnum([
      `completed`,
      `failed`,
      `timed_out`,
      `cancelled`,
      `spawn_error`,
      `backgrounded`,
    ]).optional(),
    commandHash: zString()
      .regex(/^[a-f0-9]{16}$/u)
      .optional(),
    fsReadMs: zNumber().int().nonnegative().optional(),
    fsWriteMs: zNumber().int().nonnegative().optional(),
    patchMatchMs: zNumber().int().nonnegative().optional(),
    fileCount: zNumber().int().nonnegative().optional(),
    totalBytes: zNumber().int().nonnegative().optional(),
    maxFileBytes: zNumber().int().nonnegative().optional(),
    hunkCount: zNumber().int().nonnegative().optional(),
    matchAttempts: zNumber().int().nonnegative().optional(),
    workspaceKind: zEnum([`local`, `remote`, `unknown`]).optional(),
  }).strict();
export {
  checkpointSafeFileShape, checkpointUnsafeFileShape, checkpointIgnoredFileShape, rewindPreviewShape,
  sessionCommandResults, commandReceipt, commandAckKey,
  sessionEventBase, providerHostname, commandPerformanceMetrics,
};
