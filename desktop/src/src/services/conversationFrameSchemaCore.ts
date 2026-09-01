/* ============================================================================
 * conversationFrameSchemaCore.ts —— A1-P3-B6/B7：conversation 动态帧 schema 域逐字补面
 * （styles js 32722–33287 六子区 + aS 33493–33496，536 行；aS 链闭合子簇 + 帧操作施用族）
 * 真身基准（只读）：desktop/src/out/renderer/assets/styles-CdEGpc2x.js
 *   （md5 48d71d4874b0868d61fd35a328bf6ad5，行号一律以它为准）。
 * 区段（七子区，非连续；G2 大 var 语句绕批 5 已录六声明位 Px/Vx/Wx/Yx/ike/Xx 切五段）：
 *   32722–32737（kx 行基形）+ 32739–32958（MOe…qOe 行族/队列族）
 *   + 32960–33043（JOe…Bx 控制/可用/路由/模型族）+ 33045–33103（Hx…nke 用量/交互族）
 *   + 33113–33155（Gx…Jx 交互/命令/后台/子代理族）+ 33178–33287（Zx…dke 帧/补丁/操作/行增量/帧操作施用族）
 *   + 33493–33496（aS conversation 帧 schema，S19 自共声明者语句切出）。
 * 消费面：aS 区外消费位 = 39592 new bS(aS)（conversation 传输，属主 FeedbackCenter §16，
 *   A0 域——只立实体，改指跨域登记，见 A1-P3-B7.report.md §六）；
 *   dke 区外消费位 = 39966（conversation 传输 delta 施用，同域留批）；oke/cke 等区外消费者零。
 * 转录机制：AST 精确改名（545 处），往返核对 ROUNDTRIP[cf] EXACT（536 行）在案
 *   （/tmp/a1r0-p3/p3b6-roundtrip.js）；缝剥离 SEAMSTRIP[cf] EXACT（p3b6-seamstrip.js）。
 * 映射表（minified → 语义名 → bundle 定义行，52 符）：
 *   kx→conversationRowBase(32722) | MOe→backgroundWorkOriginMeta(32739) | NOe→workSegmentShape(32740)
 *   POe→turnHeaderRow(32747) | FOe→userInputRow(32767) | IOe→assistantTextRow(32786)
 *   LOe→reasoningRow(32794) | ROe→toolOutputTextShape(32801) | zOe→toolProgressShape(32802)
 *   BOe→toolCallDisplayUnion(32803) | Ax→toolCallRow(32837) | VOe→subagentRow(32855)
 *   HOe→timelineMarkerPayloadUnion(32868) | UOe→timelineMarkerLaneEnum(32905) | jx→conversationRowUnion(32906)
 *   Mx→attachmentShape(32921) | WOe→queueDeliveryShape(32922) | GOe→queueOrderShape(32927)
 *   KOe→queueSteerShape(32931) | Nx→queueDispatchShape(32935) | qOe→queuedWorkItemShape(32939)
 *   JOe→stopTargetKindEnum(32960) | YOe→activeWorkShape(32971) | XOe→errorAttributionShape(32983)
 *   ZOe→sessionErrorShape(32994) | QOe→apiRetryShape(33004) | Fx→controlStateShape(33005)
 *   Ix→actionPermissionUnion(33015) | Lx→availabilityShape(33016) | Rx→inputRoutingShape(33026)
 *   zx→modelConfigShape(33030) | Bx→modelTransitionShape(33038) | Hx→turnUsageShape(33045)
 *   Ux→queueStateShape(33060) | $Oe→permissionInteractionShape(33070) | eke→userInputOptionShape(33086)
 *   tke→userInputQuestionShape(33087) | nke→userInputInteractionShape(33088) | Gx→pendingInteractionShape(33113)
 *   Kx→pendingCommandShape(33121) | qx→backgroundWorkShape(33128) | rke→subagentSummaryShape(33140)
 *   Jx→subagentsSnapshotShape(33150) | Zx→planSnapshotShape(33178) | ake→rowsWindowShape(33179)
 *   oke→conversationLogicalFrame(33180) | ske→conversationStatePatch(33202) | cke→conversationOps(33219)
 *   lke→applyRowStreamTextDelta(33226) | uke→applyConversationFrameOp(33240)
 *   dke→applyConversationFrameOps(33283) | aS→conversationFrameSchema(33493)
 * 跨块直连：ji/K/Jr/Fi/Li/Oi/_t/$r/Ar/Yn/Tt→SrcSharedA zod 面；wr→zNever（SrcSharedA，src Ss）；
 *   Ree→contextBreakdownSchema / Jee→cacheStatsSchema / dne→subagentOriginSchema /
 *   zne→permissionResponseSchema（SrcSharedA 已录实体，src as/cs/os/ss）；
 *   Kee→StreamTextFieldEnum（SrcSharedB 已录实体，src co/Lf）；
 *   _i→wireServerTimeSchema（conversationWireCore）；iS→buildTopicFrameSchema（sessionsIndexSchemaCore）；
 *   Px/Vx/Wx/Yx/Xx→sessionLifecyclePhases/sessionTitleMeta/interactionAutoResolutionStates/
 *   planChecklistItem/goalState（sessionsIndexSchemaCore 批 5 已录实体，跨叶输入）。
 * 墓碑（留尾，边界证据见 A1-P3-B6.report.md §七）：
 *   33497–33528 aS var 语句共声明者 Dke/Oke/kke/Ake/sS/jke/Mke——Dke/kke/jke 读 nS
 *     （bi=protocolLimits 模块初始化面，批 6 已实体化接线，见下）但 nS/tS 族（33357–33439）
 *     与 sS 依赖 xke 族（33321–33354）超本批余量，留批；33529 死元组不录；
 *   33240–33287 uke/dke——〔A1-P3-B7〕已续收（帧操作施用函数，闭合：仅依赖本叶 lke；
 *     dke 消费位 39966 conversation 传输域留批）。
 * 型缝（全型层，禁抑制符）×15：S19 语句切分 ×5（G2 四内切：var 前缀 + 收尾 ,→; ；
 *   aS 切出：var 前缀 + 末行 ,→;）+ P1 顶层函数参数 :any ×7（applyRowStreamTextDelta e/t/n
 *   + applyConversationFrameOp e/t + applyConversationFrameOps e/t，〔B7〕+4）
 *   + S16 any 接收面回调参数 :any ×5（aS superRefine e/t + uke 行族回调 ×3，〔B7〕+3）。
 * ==========================================================================*/
/* eslint-disable */
import { zObject, zString, zEnum, zLiteral, zBoolean, zArray, zNumber, zDiscriminatedUnion, zRecord, zUnknown, zUnion, zNever, contextBreakdownSchema, cacheStatsSchema, subagentOriginSchema, permissionResponseSchema } from "../modules/SrcSharedA";
import { StreamTextFieldEnum } from "../modules/SrcSharedB";
import { wireServerTimeSchema } from "./conversationWireCore";
import { buildTopicFrameSchema, sessionLifecyclePhases, sessionTitleMeta, interactionAutoResolutionStates, planChecklistItem, goalState } from "./sessionsIndexSchemaCore";

var conversationRowBase = {
  rowId: zNumber(),
  turnId: zString(),
  entityId: zString().min(1).optional(),
  productTurnId: zString().min(1).optional(),
  visibility: zLiteral(`visible`).optional(),
  createdAt: wireServerTimeSchema,
  createdAtSeq: zNumber(),
  actions: zObject({
    canFork: zLiteral(!0).optional(),
    canEdit: zLiteral(!0).optional(),
    canRetry: zLiteral(!0).optional(),
    canRewindFiles: zLiteral(!0).optional(),
    editDisposition: zEnum([`rewind`, `fork`]).optional(),
  }).optional(),
};
var backgroundWorkOriginMeta = zObject({ backgroundSource: zEnum([`bash`, `subagent`]), workId: zString().min(1), title: zString().min(1) }),
  workSegmentShape = zObject({
    segmentId: zString().min(1),
    triggerEntityId: zString().min(1).optional(),
    startedAt: wireServerTimeSchema,
    endedAt: wireServerTimeSchema.optional(),
    activeMs: zNumber().nonnegative().optional(),
  }),
  turnHeaderRow = zObject({
    ...conversationRowBase,
    kind: zLiteral(`turnHeader`),
    origin: zEnum([`userInput`, `backgroundResult`, `goalContinuation`, `editRerun`]),
    executionKind: zEnum([`agent`, `controlOnly`]).optional(),
    sourceCommandId: zString().optional(),
    historyRoundCount: zNumber().int().nonnegative().optional(),
    state: zEnum([`running`, `completedSuccess`, `completedInterrupted`, `failed`]),
    startedAt: wireServerTimeSchema,
    endedAt: wireServerTimeSchema.optional(),
    activeMs: zNumber().optional(),
    workSegments: zArray(workSegmentShape).optional(),
    originMeta: backgroundWorkOriginMeta.optional(),
    fileChanges: zObject({
      additions: zNumber(),
      deletions: zNumber(),
      files: zNumber(),
      state: zEnum([`active`, `reverted`]).optional(),
    }).optional(),
  }),
  userInputRow = zObject({
    ...conversationRowBase,
    kind: zLiteral(`userInput`),
    text: zString(),
    origin: zEnum([`realUser`, `backgroundResult`, `goalContinuation`, `mailbox`, `synthetic`]),
    originMeta: zObject({
      backgroundSource: zEnum([`bash`, `subagent`]).optional(),
      workId: zString().optional(),
      senderSessionId: zString().optional(),
      senderLabel: zString().optional(),
    }).optional(),
    guided: zLiteral(!0).optional(),
    sourceCommandId: zString().optional(),
    rootSourceCommandId: zString().optional(),
    clientId: zString().optional(),
    attachments: zArray(
      zObject({ ref: zString(), fileName: zString(), mime: zString(), bytes: zNumber(), previewRef: zString().optional() }),
    ).optional(),
  }),
  assistantTextRow = zObject({
    ...conversationRowBase,
    kind: zLiteral(`assistantText`),
    text: zString(),
    state: zEnum([`streaming`, `complete`, `interrupted`, `failed`]),
    model: zString().optional(),
    feedback: zEnum([`like`, `dislike`]).optional(),
  }),
  reasoningRow = zObject({
    ...conversationRowBase,
    kind: zLiteral(`reasoning`),
    text: zString(),
    state: zEnum([`streaming`, `complete`, `interrupted`]),
    durationMs: zNumber().optional(),
  }),
  toolOutputTextShape = zObject({ text: zString(), truncated: zObject({ totalBytes: zNumber(), ref: zString() }).optional() }),
  toolProgressShape = zObject({ bytes: zNumber(), previewLine: zString().optional(), updatedAt: wireServerTimeSchema }),
  toolCallDisplayUnion = zDiscriminatedUnion(`kind`, [
    zObject({
      kind: zLiteral(`node_repl_images`),
      images: zArray(
        zObject({
          base64: zString()
            .min(1)
            .max(200 * 1024),
          mimeType: zString().regex(/^image\/[a-z0-9.+-]+$/iu),
        }).strict(),
      )
        .min(1)
        .max(2),
      truncated: zBoolean().optional(),
      source: zLiteral(`browser_turn_end`).optional(),
    }).strict(),
    zObject({
      kind: zLiteral(`task_output`),
      retrievalStatus: zEnum([`success`, `not_ready`, `timeout`]),
      taskStatus: zString().min(1).max(64).optional(),
      output: zString().min(1).max(2e3).optional(),
      truncated: zLiteral(!0).optional(),
    }).strict(),
    zObject({ kind: zLiteral(`respond_to_coordinator`), status: zEnum([`success`, `failed`]) }).strict(),
    zObject({
      kind: zLiteral(`mcp_tool`),
      serverName: zString().min(1).max(256),
      toolName: zString().min(1).max(256),
      description: zString()
        .min(1)
        .max(4 * 1024)
        .optional(),
    }).strict(),
  ]),
  toolCallRow = zObject({
    ...conversationRowBase,
    kind: zLiteral(`toolCall`),
    toolCallId: zString(),
    toolName: zString(),
    status: zEnum([`inputStreaming`, `pendingApproval`, `running`, `success`, `error`, `cancelled`]),
    inputText: zString(),
    input: zUnknown().optional(),
    output: toolOutputTextShape.optional(),
    display: toolCallDisplayUnion.optional(),
    error: zObject({ code: zString(), message: zString() }).optional(),
    progress: toolProgressShape.optional(),
    approvalInteractionId: zString().optional(),
    backgrounded: zLiteral(!0).optional(),
    workId: zString().optional(),
    startedAt: wireServerTimeSchema.optional(),
    endedAt: wireServerTimeSchema.optional(),
  }),
  subagentRow = zObject({
    ...conversationRowBase,
    kind: zLiteral(`subagent`),
    parentToolCallId: zString().optional(),
    subagentType: zString(),
    status: zEnum([`running`, `success`, `failed`, `cancelled`]),
    summaryText: zString(),
    childSessionId: zString().optional(),
    backgrounded: zLiteral(!0).optional(),
    workId: zString().optional(),
    startedAt: wireServerTimeSchema.optional(),
    endedAt: wireServerTimeSchema.optional(),
  }),
  timelineMarkerPayloadUnion = zUnion([
    zObject({
      type: zLiteral(`compact`),
      origin: zEnum([`manual`, `auto`]),
      status: zEnum([`running`, `success`, `failed`, `noop`, `cancelled`]),
      tokensBefore: zNumber().optional(),
      tokensAfter: zNumber().optional(),
      summaryRef: zString().optional(),
    }),
    zObject({ type: zLiteral(`forkNotice`), parentSessionId: zString(), parentRowId: zNumber() }),
    zObject({ type: zLiteral(`forkCreated`), childSessionId: zString(), atRowId: zNumber() }),
    zObject({
      type: zLiteral(`modelChange`),
      fromProvider: zString(),
      fromModel: zString(),
      toProvider: zString(),
      toModel: zString(),
      toThought: zString(),
    }),
    zObject({
      type: zLiteral(`modelChange`),
      fromProvider: zNever().optional(),
      fromModel: zNever().optional(),
      toProvider: zString(),
      toModel: zString(),
      toThought: zString(),
    }),
    zObject({ type: zLiteral(`goalSet`), objective: zString(), previousObjective: zString().optional() }),
    zObject({
      type: zLiteral(`goalVerify`),
      iteration: zNumber(),
      outcome: zEnum([`running`, `pass`, `notSatisfied`, `failed`]),
      detail: zString().optional(),
    }),
    zObject({ type: zLiteral(`retryNotice`), attempt: zNumber(), reasonCode: zString() }),
    zObject({ type: zLiteral(`checkpointRestored`), checkpointId: zString() }),
  ]),
  timelineMarkerLaneEnum = zEnum([`assistantWork`, `turnTailBoundary`, `lightBoundary`]),
  conversationRowUnion = zDiscriminatedUnion(`kind`, [
    turnHeaderRow,
    userInputRow,
    assistantTextRow,
    reasoningRow,
    toolCallRow,
    subagentRow,
    zObject({
      ...conversationRowBase,
      kind: zLiteral(`timelineMarker`),
      sourceCommandId: zString().optional(),
      lane: timelineMarkerLaneEnum.optional(),
      marker: timelineMarkerPayloadUnion,
    }),
  ]),
  attachmentShape = zObject({ ref: zString(), fileName: zString(), mime: zString(), bytes: zNumber(), previewRef: zString().optional() }).strict(),
  queueDeliveryShape = zObject({
    requested: zEnum([`auto`, `startNow`, `queue`, `guide`]),
    admitted: zEnum([`startNow`, `queue`, `guide`]),
    fallbackReasonCode: zString().optional(),
  }).strict(),
  queueOrderShape = zObject({
    admissionSeq: zNumber().int().nonnegative(),
    queuePosition: zNumber().int().nonnegative().optional(),
  }).strict(),
  queueSteerShape = zObject({
    state: zEnum([`notRequested`, `submitting`, `steering`, `guided`, `fellBack`]),
    reasonCode: zString().optional(),
  }).strict(),
  queueDispatchShape = zObject({
    state: zEnum([`admitted`, `queued`, `reserved`, `promoting`, `drained`]),
    reservationId: zString().optional(),
  }).strict(),
  queuedWorkItemShape = zObject({
    sourceCommandId: zString().min(1),
    queueItemId: zString().min(1),
    clientId: zString().min(1),
    kind: zEnum([`sendText`, `sendGoalCommand`, `compact`]),
    text: zString(),
    attachments: zArray(attachmentShape).default([]),
    delivery: queueDeliveryShape,
    order: queueOrderShape,
    steer: queueSteerShape,
    dispatch: queueDispatchShape,
    admittedAt: wireServerTimeSchema,
    provenance: zObject({
      sourceCommandId: zString().min(1),
      queueItemId: zString().min(1).optional(),
      clientId: zString().min(1).optional(),
    })
      .strict()
      .optional(),
  }).strict();
var stopTargetKindEnum = zEnum([
    `assistant`,
    `tool`,
    `subagent`,
    `compact`,
    `goalVerifier`,
    `goalContinuation`,
    `turnSteer`,
    `mixed`,
    `unknown`,
  ]),
  activeWorkShape = zObject({
    kind: zEnum([
      `primaryTurn`,
      `foregroundSubagent`,
      `compact`,
      `goalVerifier`,
      `goalContinuation`,
      `turnSteer`,
    ]),
    foregroundExecutionId: zString().min(1).optional(),
    startedAt: wireServerTimeSchema,
  }),
  errorAttributionShape = zObject({
    source: zEnum([`provider`, `runtime`, `tool`, `network`]).optional(),
    reason: zString().min(1).max(160).optional(),
    providerId: zString().min(1).max(160).optional(),
    modelId: zString().min(1).max(160).optional(),
    providerKind: zString().min(1).max(160).optional(),
    transport: zEnum([`http`, `sse`, `websocket`]).optional(),
    statusCode: zNumber().int().min(100).max(599).optional(),
    providerErrorCode: zString().min(1).max(160).optional(),
    retryable: zBoolean().optional(),
  }).strict(),
  sessionErrorShape = zObject({
    code: zString(),
    message: zString(),
    recoverable: zBoolean(),
    at: wireServerTimeSchema,
    source: zEnum([`provider`, `runtime`, `tool`, `network`]),
    traceId: zString().optional(),
    detail: zString().optional(),
    attribution: errorAttributionShape.optional(),
  }),
  apiRetryShape = zObject({ attempt: zNumber(), maxAttempts: zNumber(), nextRetryAt: wireServerTimeSchema, reasonCode: zString() }),
  controlStateShape = zObject({
    phase: sessionLifecyclePhases,
    sessionEnded: zBoolean(),
    canStop: zBoolean(),
    stopState: zEnum([`idle`, `stoppable`, `stopping`]),
    stopTargetKind: stopTargetKindEnum,
    activeWorks: zArray(activeWorkShape),
    lastError: sessionErrorShape.nullable(),
    apiRetry: apiRetryShape.nullable(),
  }),
  actionPermissionUnion = zDiscriminatedUnion(`allowed`, [zObject({ allowed: zLiteral(!0) }), zObject({ allowed: zLiteral(!1), reasonCode: zString() })]),
  availabilityShape = zObject({
    fork: actionPermissionUnion,
    compact: actionPermissionUnion,
    switchModelConfig: actionPermissionUnion,
    setFollowupMode: actionPermissionUnion,
    queueEdit: actionPermissionUnion,
    sendQueuedNow: actionPermissionUnion,
    pauseGoal: actionPermissionUnion,
    resumeGoal: actionPermissionUnion,
  }),
  inputRoutingShape = zObject({
    mode: zEnum([`startNow`, `enqueue`, `guide`, `reject`, `choice`]),
    reasonCode: zString().optional(),
  }),
  modelConfigShape = zObject({
    provider: zString(),
    model: zString(),
    thought: zString(),
    thoughtLevels: zArray(zString()).default([]),
    followupMode: zEnum([`queue`, `guide`]),
    mode: zString().default(`build`),
  }),
  modelTransitionShape = zObject({
    eventId: zString().min(1),
    origin: zLiteral(`registryFallback`),
    from: zObject({ provider: zString(), model: zString() }),
    to: zObject({ provider: zString(), model: zString() }),
  });
var turnUsageShape = zObject({
    contextWindow: zObject({
      usedTokens: zNumber(),
      maxTokens: zNumber(),
      autoCompactThresholdTokens: zNumber().nullable(),
      cache: cacheStatsSchema.optional(),
      breakdown: contextBreakdownSchema.optional(),
    }).nullable(),
    cumulative: zObject({
      inputTokens: zNumber(),
      outputTokens: zNumber(),
      cacheReadTokens: zNumber(),
      cacheWriteTokens: zNumber(),
    }),
  }),
  queueStateShape = zObject({
    items: zArray(
      queuedWorkItemShape.extend({
        dispatch: queueDispatchShape.extend({ state: zEnum([`queued`, `reserved`, `promoting`]) }),
        toolDisallowlist: zArray(zString().min(1)).optional(),
      }),
    ),
    autoDrain: zBoolean(),
    pauseReason: zEnum([`stopped`, `manual`]).optional(),
  }),
  permissionInteractionShape = zObject({
    kind: zLiteral(`permission`),
    toolCallId: zString(),
    toolName: zString(),
    summary: zString(),
    detail: zUnknown(),
    origin: subagentOriginSchema.optional(),
    options: zArray(
      zObject({
        optionId: zString(),
        label: zString(),
        kind: zEnum([`allowOnce`, `allowAlways`, `deny`, `custom`]),
        response: permissionResponseSchema.optional(),
      }),
    ),
  }),
  userInputOptionShape = zObject({ value: zString(), label: zString(), description: zString().optional(), preview: zString().optional() }),
  userInputQuestionShape = zObject({ question: zString(), header: zString(), options: zArray(userInputOptionShape), multiSelect: zBoolean().optional() }),
  userInputInteractionShape = zObject({
    kind: zLiteral(`userInput`),
    prompt: zString(),
    freeText: zBoolean(),
    options: zArray(zObject({ optionId: zString(), label: zString() })).optional(),
    sensitive: zBoolean().optional(),
    toolName: zString().optional(),
    toolCallId: zString().optional(),
    traceId: zString().optional(),
    input: zUnknown().optional(),
    schema: zUnknown().optional(),
    questions: zArray(userInputQuestionShape).optional(),
    currentQuestionIndex: zNumber().optional(),
    answerDrafts: zRecord(zString(), zArray(zString())).optional(),
    origin: subagentOriginSchema.optional(),
  });
var pendingInteractionShape = zObject({
    interactionId: zString(),
    kind: zEnum([`permission`, `userInput`]),
    anchorRowId: zNumber().nullable(),
    createdAt: wireServerTimeSchema,
    autoResolution: interactionAutoResolutionStates.optional(),
    payload: zDiscriminatedUnion(`kind`, [permissionInteractionShape, userInputInteractionShape]),
  }),
  pendingCommandShape = zObject({
    commandId: zString(),
    clientId: zString(),
    type: zString(),
    state: zEnum([`accepted`, `executing`]),
    at: wireServerTimeSchema,
  }),
  backgroundWorkShape = zObject({
    workId: zString(),
    kind: zEnum([`bash`, `subagent`]),
    title: zString(),
    status: zEnum([`running`, `resultPending`, `failed`, `cancelled`]),
    startedAt: wireServerTimeSchema,
    endedAt: wireServerTimeSchema.optional(),
    cancellable: zBoolean().optional(),
    blocked: zBoolean().optional(),
    anchorRowId: zNumber().nullable(),
    childSessionId: zString().optional(),
  }),
  subagentSummaryShape = zObject({
    childSessionId: zString(),
    agentId: zString().optional(),
    toolCallId: zString().optional(),
    subagentType: zString(),
    title: zString(),
    summary: zString().optional(),
    status: zEnum([`running`, `waiting`, `blocked`]),
    startedAt: wireServerTimeSchema.optional(),
  }),
  subagentsSnapshotShape = zObject({
    revision: zNumber().int().nonnegative(),
    childSessionIds: zArray(zString()),
    running: zArray(subagentSummaryShape),
    endedTotal: zNumber().int().nonnegative(),
  });
var planSnapshotShape = zObject({ items: zArray(planChecklistItem), updatedAt: wireServerTimeSchema }),
  rowsWindowShape = zObject({ window: zArray(conversationRowUnion), totalCount: zNumber(), firstRowId: zNumber().nullable() }),
  conversationLogicalFrame = zObject({
    protocolVersion: zLiteral(1),
    sessionId: zString(),
    logEpoch: zString(),
    seq: zNumber(),
    revision: zNumber(),
    control: controlStateShape,
    availability: availabilityShape,
    inputRouting: inputRoutingShape,
    meta: sessionTitleMeta.default({ title: ``, titleSource: `default` }),
    config: modelConfigShape,
    modelTransition: modelTransitionShape.nullable().default(null),
    usage: turnUsageShape,
    queue: queueStateShape,
    pendingInteractions: zArray(pendingInteractionShape),
    pendingCommands: zArray(pendingCommandShape),
    backgroundWorks: zArray(backgroundWorkShape),
    subagents: subagentsSnapshotShape.optional(),
    goal: goalState.nullable(),
    plan: planSnapshotShape.nullable(),
    rows: rowsWindowShape,
  }),
  conversationStatePatch = zObject({
    revision: zNumber().optional(),
    control: controlStateShape.optional(),
    availability: availabilityShape.optional(),
    inputRouting: inputRoutingShape.optional(),
    meta: sessionTitleMeta.optional(),
    config: modelConfigShape.optional(),
    modelTransition: modelTransitionShape.nullable().optional(),
    usage: turnUsageShape.optional(),
    queue: queueStateShape.optional(),
    pendingInteractions: zArray(pendingInteractionShape).optional(),
    pendingCommands: zArray(pendingCommandShape).optional(),
    backgroundWorks: zArray(backgroundWorkShape).optional(),
    subagents: subagentsSnapshotShape.optional(),
    goal: goalState.nullable().optional(),
    plan: planSnapshotShape.nullable().optional(),
  }),
  conversationOps = zDiscriminatedUnion(`op`, [
    zObject({ op: zLiteral(`row.appended`), row: conversationRowUnion }),
    zObject({ op: zLiteral(`row.upserted`), row: conversationRowUnion }),
    zObject({ op: zLiteral(`row.removed`), fromRowId: zNumber() }),
    zObject({ op: zLiteral(`row.delta`), rowId: zNumber(), path: StreamTextFieldEnum, append: zString() }),
    zObject({ op: zLiteral(`state.updated`), patch: conversationStatePatch }),
  ]);
function applyRowStreamTextDelta(e: any, t: any, n: any) {
  switch (t) {
    case `text`:
      return e.kind === `assistantText` || e.kind === `reasoning` ? { ...e, text: e.text + n } : e;
    case `inputText`:
      return e.kind === `toolCall` ? { ...e, inputText: e.inputText + n } : e;
    case `output.text`:
      return e.kind === `toolCall` && e.output
        ? { ...e, output: { ...e.output, text: e.output.text + n } }
        : e;
    case `summaryText`:
      return e.kind === `subagent` ? { ...e, summaryText: e.summaryText + n } : e;
  }
}
function applyConversationFrameOp(e: any, t: any) {
  switch (t.op) {
    case `row.appended`:
      return {
        ...e,
        rows: {
          ...e.rows,
          window: [...e.rows.window, t.row],
          totalCount: e.rows.totalCount + 1,
          firstRowId: e.rows.firstRowId ?? t.row.rowId,
        },
      };
    case `row.upserted`: {
      let n = e.rows.window.findIndex((e: any) => e.rowId === t.row.rowId);
      if (n === -1) return e;
      let r = [...e.rows.window];
      return ((r[n] = t.row), { ...e, rows: { ...e.rows, window: r } });
    }
    case `row.removed`: {
      let n = e.rows.window.filter((e: any) => e.rowId < t.fromRowId),
        r = e.rows.window.length - n.length,
        i = e.rows.firstRowId !== null && t.fromRowId <= e.rows.firstRowId;
      return {
        ...e,
        rows: {
          ...e.rows,
          window: n,
          totalCount: i ? 0 : Math.max(0, e.rows.totalCount - r),
          firstRowId: i ? null : e.rows.firstRowId,
        },
      };
    }
    case `row.delta`: {
      let n = e.rows.window.findIndex((e: any) => e.rowId === t.rowId),
        r = e.rows.window[n];
      if (n === -1 || r === void 0) return e;
      let i = [...e.rows.window];
      return ((i[n] = applyRowStreamTextDelta(r, t.path, t.append)), { ...e, rows: { ...e.rows, window: i } });
    }
    case `state.updated`:
      return { ...e, ...t.patch };
  }
}
function applyConversationFrameOps(e: any, t: any) {
  let n = e;
  for (let e of t) n = applyConversationFrameOp(n, e);
  return n;
}
var conversationFrameSchema = buildTopicFrameSchema(conversationLogicalFrame, conversationOps).superRefine((e: any, t: any) => {
    (!e.topic.startsWith(`conversation/`) || e.topic.length === 13) &&
      t.addIssue({ code: `custom`, message: `invalid conversation topic`, path: [`topic`] });
  });
export {
  conversationRowBase, backgroundWorkOriginMeta, workSegmentShape, turnHeaderRow,
  userInputRow, assistantTextRow, reasoningRow, toolOutputTextShape, toolProgressShape,
  toolCallDisplayUnion, toolCallRow, subagentRow, timelineMarkerPayloadUnion,
  timelineMarkerLaneEnum, conversationRowUnion, attachmentShape,
  queueDeliveryShape, queueOrderShape, queueSteerShape, queueDispatchShape, queuedWorkItemShape,
  stopTargetKindEnum, activeWorkShape, errorAttributionShape, sessionErrorShape, apiRetryShape,
  controlStateShape, actionPermissionUnion, availabilityShape, inputRoutingShape,
  modelConfigShape, modelTransitionShape, turnUsageShape, queueStateShape,
  permissionInteractionShape, userInputOptionShape, userInputQuestionShape,
  userInputInteractionShape, pendingInteractionShape, pendingCommandShape,
  backgroundWorkShape, subagentSummaryShape, subagentsSnapshotShape,
  planSnapshotShape, rowsWindowShape, conversationLogicalFrame, conversationStatePatch,
  conversationOps, applyRowStreamTextDelta, applyConversationFrameOp, applyConversationFrameOps,
  conversationFrameSchema,
};
