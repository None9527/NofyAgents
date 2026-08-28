import {
  Ua as a,
  ca as ze,
  da as Z,
  ea as Ve,
  fa as f,
  ga as C,
  ha as l,
  ia as _e,
  ja as u,
  ka as Ge,
  la as x,
  ma as Ne,
  na as Ke,
  o as e,
  oa as He,
  pa as Qe,
  qa as $e,
  u as De,
  v as qe,
  w as q,
  x as je,
  y as Le,
  z as Ue,
} from "./chunk-FQMTTDFW.js";
import { a as c, e as S, f as M, j as m } from "./chunk-LQDBAECE.js";
function createServiceDescriptor(o) {
  return { channelName: o };
}
c(createServiceDescriptor, "createServiceDescriptor");
var j = createServiceDescriptor(a.ZCodeAgent);
var L = createServiceDescriptor(a.Memory);
var U = createServiceDescriptor(a.OffPeakTask);
var z = createServiceDescriptor(a.File);
var V = createServiceDescriptor(a.Git);
var _ = createServiceDescriptor(a.GitCheckpoint);
var G = createServiceDescriptor(a.System);
var N = createServiceDescriptor(a.Terminal);
var K = createServiceDescriptor(a.Setting);
var H = createServiceDescriptor(a.Credential);
var Q = createServiceDescriptor(a.Broadcast);
var $ = createServiceDescriptor(a.ZCodeTask);
var J = createServiceDescriptor(a.ZCodeSession);
var Y = createServiceDescriptor(a.Bots);
var X = createServiceDescriptor(a.FileWatcher);
var ee = createServiceDescriptor(a.OAuth);
var te = createServiceDescriptor(a.ModelProvider);
var oe = createServiceDescriptor(a.UsageStats);
var re = createServiceDescriptor(a.CodingPlanSubscription);
var ne = createServiceDescriptor(a.Skills);
var se = createServiceDescriptor(a.SkillSync);
var ie = createServiceDescriptor(a.McpSync);
var ae = createServiceDescriptor(a.PluginSync);
var de = createServiceDescriptor(a.Plugins);
var ce = createServiceDescriptor(a.PluginManagement);
var le = createServiceDescriptor(a.Subagents);
var me = createServiceDescriptor(a.Commands);
var pe = createServiceDescriptor(a.Hooks);
var ue = createServiceDescriptor(a.OutputStyle);
var ge = createServiceDescriptor(a.SettingsSync);
var fe = createServiceDescriptor(a.Feedback);
var Ce = createServiceDescriptor(a.RepoWiki);
var he = createServiceDescriptor(a.PromptAttachmentTransfer);
var v = {
    rowId: e.number(),
    turnId: e.string(),
    entityId: e.string().min(1).optional(),
    productTurnId: e.string().min(1).optional(),
    visibility: e.literal("visible").optional(),
    createdAt: l,
    createdAtSeq: e.number(),
    actions: e
      .object({
        canFork: e.literal(!0).optional(),
        canEdit: e.literal(!0).optional(),
        canRetry: e.literal(!0).optional(),
        canRewindFiles: e.literal(!0).optional(),
        editDisposition: e.enum(["rewind", "fork"]).optional(),
      })
      .optional(),
  },
  Si = v.actions,
  Pt = e.object({
    backgroundSource: e.enum(["bash", "subagent"]),
    workId: e.string().min(1),
    title: e.string().min(1),
  }),
  kt = e.object({
    segmentId: e.string().min(1),
    triggerEntityId: e.string().min(1).optional(),
    startedAt: l,
    endedAt: l.optional(),
    activeMs: e.number().nonnegative().optional(),
  }),
  bt = e.object({
    ...v,
    kind: e.literal("turnHeader"),
    origin: e.enum(["userInput", "backgroundResult", "goalContinuation", "editRerun"]),
    executionKind: e.enum(["agent", "controlOnly"]).optional(),
    sourceCommandId: e.string().optional(),
    historyRoundCount: e.number().int().nonnegative().optional(),
    state: e.enum(["running", "completedSuccess", "completedInterrupted", "failed"]),
    startedAt: l,
    endedAt: l.optional(),
    activeMs: e.number().optional(),
    workSegments: e.array(kt).optional(),
    originMeta: Pt.optional(),
    fileChanges: e
      .object({
        additions: e.number(),
        deletions: e.number(),
        files: e.number(),
        state: e.enum(["active", "reverted"]).optional(),
      })
      .optional(),
  }),
  Rt = e.object({
    ...v,
    kind: e.literal("userInput"),
    text: e.string(),
    origin: e.enum(["realUser", "backgroundResult", "goalContinuation", "mailbox", "synthetic"]),
    originMeta: e
      .object({
        backgroundSource: e.enum(["bash", "subagent"]).optional(),
        workId: e.string().optional(),
        senderSessionId: e.string().optional(),
        senderLabel: e.string().optional(),
      })
      .optional(),
    guided: e.literal(!0).optional(),
    sourceCommandId: e.string().optional(),
    rootSourceCommandId: e.string().optional(),
    clientId: e.string().optional(),
    attachments: e
      .array(
        e.object({
          ref: e.string(),
          fileName: e.string(),
          mime: e.string(),
          bytes: e.number(),
          previewRef: e.string().optional(),
        }),
      )
      .optional(),
  }),
  It = e.object({
    ...v,
    kind: e.literal("assistantText"),
    text: e.string(),
    state: e.enum(["streaming", "complete", "interrupted", "failed"]),
    model: e.string().optional(),
    feedback: e.enum(["like", "dislike"]).optional(),
  }),
  xt = e.object({
    ...v,
    kind: e.literal("reasoning"),
    text: e.string(),
    state: e.enum(["streaming", "complete", "interrupted"]),
    durationMs: e.number().optional(),
  }),
  At = e.object({
    text: e.string(),
    truncated: e.object({ totalBytes: e.number(), ref: e.string() }).optional(),
  }),
  Tt = e.object({ bytes: e.number(), previewLine: e.string().optional(), updatedAt: l }),
  wt = e
    .object({
      kind: e.literal("node_repl_images"),
      images: e
        .array(
          e
            .object({
              base64: e
                .string()
                .min(1)
                .max(200 * 1024),
              mimeType: e.string().regex(/^image\/[a-z0-9.+-]+$/iu),
            })
            .strict(),
        )
        .min(1)
        .max(2),
      truncated: e.boolean().optional(),
      source: e.literal("browser_turn_end").optional(),
    })
    .strict(),
  Zt = e
    .object({
      kind: e.literal("task_output"),
      retrievalStatus: e.enum(["success", "not_ready", "timeout"]),
      taskStatus: e.string().min(1).max(64).optional(),
      output: e.string().min(1).max(2e3).optional(),
      truncated: e.literal(!0).optional(),
    })
    .strict(),
  Mt = e
    .object({ kind: e.literal("respond_to_coordinator"), status: e.enum(["success", "failed"]) })
    .strict(),
  Ft = e
    .object({
      kind: e.literal("mcp_tool"),
      serverName: e.string().min(1).max(256),
      toolName: e.string().min(1).max(256),
      description: e
        .string()
        .min(1)
        .max(4 * 1024)
        .optional(),
    })
    .strict(),
  Wt = e.discriminatedUnion("kind", [wt, Zt, Mt, Ft]),
  ye = e.object({
    ...v,
    kind: e.literal("toolCall"),
    toolCallId: e.string(),
    toolName: e.string(),
    status: e.enum([
      "inputStreaming",
      "pendingApproval",
      "running",
      "success",
      "error",
      "cancelled",
    ]),
    inputText: e.string(),
    input: e.unknown().optional(),
    output: At.optional(),
    display: Wt.optional(),
    error: e.object({ code: e.string(), message: e.string() }).optional(),
    progress: Tt.optional(),
    approvalInteractionId: e.string().optional(),
    backgrounded: e.literal(!0).optional(),
    workId: e.string().optional(),
    startedAt: l.optional(),
    endedAt: l.optional(),
  }),
  Bt = e.object({
    ...v,
    kind: e.literal("subagent"),
    parentToolCallId: e.string().optional(),
    subagentType: e.string(),
    status: e.enum(["running", "success", "failed", "cancelled"]),
    summaryText: e.string(),
    childSessionId: e.string().optional(),
    backgrounded: e.literal(!0).optional(),
    workId: e.string().optional(),
    startedAt: l.optional(),
    endedAt: l.optional(),
  }),
  Et = e.union([
    e.object({
      type: e.literal("compact"),
      origin: e.enum(["manual", "auto"]),
      status: e.enum(["running", "success", "failed", "noop", "cancelled"]),
      tokensBefore: e.number().optional(),
      tokensAfter: e.number().optional(),
      summaryRef: e.string().optional(),
    }),
    e.object({
      type: e.literal("forkNotice"),
      parentSessionId: e.string(),
      parentRowId: e.number(),
    }),
    e.object({ type: e.literal("forkCreated"), childSessionId: e.string(), atRowId: e.number() }),
    e.object({
      type: e.literal("modelChange"),
      fromProvider: e.string(),
      fromModel: e.string(),
      toProvider: e.string(),
      toModel: e.string(),
      toThought: e.string(),
    }),
    e.object({
      type: e.literal("modelChange"),
      fromProvider: e.never().optional(),
      fromModel: e.never().optional(),
      toProvider: e.string(),
      toModel: e.string(),
      toThought: e.string(),
    }),
    e.object({
      type: e.literal("goalSet"),
      objective: e.string(),
      previousObjective: e.string().optional(),
    }),
    e.object({
      type: e.literal("goalVerify"),
      iteration: e.number(),
      outcome: e.enum(["running", "pass", "notSatisfied", "failed"]),
      detail: e.string().optional(),
    }),
    e.object({ type: e.literal("retryNotice"), attempt: e.number(), reasonCode: e.string() }),
    e.object({ type: e.literal("checkpointRestored"), checkpointId: e.string() }),
  ]),
  Ot = e.enum(["assistantWork", "turnTailBoundary", "lightBoundary"]),
  Dt = e.object({
    ...v,
    kind: e.literal("timelineMarker"),
    sourceCommandId: e.string().optional(),
    lane: Ot.optional(),
    marker: Et,
  }),
  k = e.discriminatedUnion("kind", [bt, Rt, It, xt, ye, Bt, Dt]);
var R = e
  .object({
    ref: e.string(),
    fileName: e.string(),
    mime: e.string(),
    bytes: e.number(),
    previewRef: e.string().optional(),
  })
  .strict();
var qt = e
    .object({
      requested: e.enum(["auto", "startNow", "queue", "guide"]),
      admitted: e.enum(["startNow", "queue", "guide"]),
      fallbackReasonCode: e.string().optional(),
    })
    .strict(),
  jt = e
    .object({
      admissionSeq: e.number().int().nonnegative(),
      queuePosition: e.number().int().nonnegative().optional(),
    })
    .strict(),
  Lt = e
    .object({
      state: e.enum(["notRequested", "submitting", "steering", "guided", "fellBack"]),
      reasonCode: e.string().optional(),
    })
    .strict(),
  Se = e
    .object({
      state: e.enum(["admitted", "queued", "reserved", "promoting", "drained"]),
      reservationId: e.string().optional(),
    })
    .strict(),
  Je = e
    .object({
      sourceCommandId: e.string().min(1),
      queueItemId: e.string().min(1),
      clientId: e.string().min(1),
      kind: e.enum(["sendText", "sendGoalCommand", "compact"]),
      text: e.string(),
      attachments: e.array(R).default([]),
      delivery: qt,
      order: jt,
      steer: Lt,
      dispatch: Se,
      admittedAt: l,
      provenance: e
        .object({
          sourceCommandId: e.string().min(1),
          queueItemId: e.string().min(1).optional(),
          clientId: e.string().min(1).optional(),
        })
        .strict()
        .optional(),
    })
    .strict();
var ve = e.enum([
    "draft",
    "prewarming",
    "running",
    "completedSuccess",
    "completedInterrupted",
    "error",
  ]),
  Ut = e.enum([
    "assistant",
    "tool",
    "subagent",
    "compact",
    "goalVerifier",
    "goalContinuation",
    "turnSteer",
    "mixed",
    "unknown",
  ]),
  zt = e.object({
    kind: e.enum([
      "primaryTurn",
      "foregroundSubagent",
      "compact",
      "goalVerifier",
      "goalContinuation",
      "turnSteer",
    ]),
    foregroundExecutionId: e.string().min(1).optional(),
    startedAt: l,
  }),
  Vt = e
    .object({
      source: e.enum(["provider", "runtime", "tool", "network"]).optional(),
      reason: e.string().min(1).max(160).optional(),
      providerId: e.string().min(1).max(160).optional(),
      modelId: e.string().min(1).max(160).optional(),
      providerKind: e.string().min(1).max(160).optional(),
      transport: e.enum(["http", "sse", "websocket"]).optional(),
      statusCode: e.number().int().min(100).max(599).optional(),
      providerErrorCode: e.string().min(1).max(160).optional(),
      retryable: e.boolean().optional(),
    })
    .strict(),
  _t = e.object({
    code: e.string(),
    message: e.string(),
    recoverable: e.boolean(),
    at: l,
    source: e.enum(["provider", "runtime", "tool", "network"]),
    traceId: e.string().optional(),
    detail: e.string().optional(),
    attribution: Vt.optional(),
  }),
  Gt = e.object({
    attempt: e.number(),
    maxAttempts: e.number(),
    nextRetryAt: l,
    reasonCode: e.string(),
  }),
  Pe = e.object({
    phase: ve,
    sessionEnded: e.boolean(),
    canStop: e.boolean(),
    stopState: e.enum(["idle", "stoppable", "stopping"]),
    stopTargetKind: Ut,
    activeWorks: e.array(zt),
    lastError: _t.nullable(),
    apiRetry: Gt.nullable(),
  }),
  P = e.discriminatedUnion("allowed", [
    e.object({ allowed: e.literal(!0) }),
    e.object({ allowed: e.literal(!1), reasonCode: e.string() }),
  ]),
  ke = e.object({
    fork: P,
    compact: P,
    switchModelConfig: P,
    setFollowupMode: P,
    queueEdit: P,
    sendQueuedNow: P,
    pauseGoal: P,
    resumeGoal: P,
  }),
  be = e.object({
    mode: e.enum(["startNow", "enqueue", "guide", "reject", "choice"]),
    reasonCode: e.string().optional(),
  }),
  Re = e.object({
    provider: e.string(),
    model: e.string(),
    thought: e.string(),
    thoughtLevels: e.array(e.string()).default([]),
    followupMode: e.enum(["queue", "guide"]),
    mode: e.string().default("build"),
  }),
  Ie = e.object({
    eventId: e.string().min(1),
    origin: e.literal("registryFallback"),
    from: e.object({ provider: e.string(), model: e.string() }),
    to: e.object({ provider: e.string(), model: e.string() }),
  }),
  A = e.object({ title: e.string(), titleSource: e.enum(["default", "generated", "custom"]) }),
  xe = e.object({
    contextWindow: e
      .object({
        usedTokens: e.number(),
        maxTokens: e.number(),
        autoCompactThresholdTokens: e.number().nullable(),
        cache: je.optional(),
        breakdown: Le.optional(),
      })
      .nullable(),
    cumulative: e.object({
      inputTokens: e.number(),
      outputTokens: e.number(),
      cacheReadTokens: e.number(),
      cacheWriteTokens: e.number(),
    }),
  }),
  Nt = Je.extend({
    dispatch: Se.extend({ state: e.enum(["queued", "reserved", "promoting"]) }),
    toolDisallowlist: e.array(e.string().min(1)).optional(),
  }),
  Ae = e.object({
    items: e.array(Nt),
    autoDrain: e.boolean(),
    pauseReason: e.enum(["stopped", "manual"]).optional(),
  }),
  Kt = e.object({
    kind: e.literal("permission"),
    toolCallId: e.string(),
    toolName: e.string(),
    summary: e.string(),
    detail: e.unknown(),
    origin: q.optional(),
    options: e.array(
      e.object({
        optionId: e.string(),
        label: e.string(),
        kind: e.enum(["allowOnce", "allowAlways", "deny", "custom"]),
        response: qe.optional(),
      }),
    ),
  }),
  Ht = e.object({
    value: e.string(),
    label: e.string(),
    description: e.string().optional(),
    preview: e.string().optional(),
  }),
  Qt = e.object({
    question: e.string(),
    header: e.string(),
    options: e.array(Ht),
    multiSelect: e.boolean().optional(),
  }),
  $t = e.object({
    kind: e.literal("userInput"),
    prompt: e.string(),
    freeText: e.boolean(),
    options: e.array(e.object({ optionId: e.string(), label: e.string() })).optional(),
    sensitive: e.boolean().optional(),
    toolName: e.string().optional(),
    toolCallId: e.string().optional(),
    traceId: e.string().optional(),
    input: e.unknown().optional(),
    schema: e.unknown().optional(),
    questions: e.array(Qt).optional(),
    currentQuestionIndex: e.number().optional(),
    answerDrafts: e.record(e.string(), e.array(e.string())).optional(),
    origin: q.optional(),
  }),
  Te = e.discriminatedUnion("state", [
    e.object({
      state: e.enum(["hiddenGrace", "visibleCountdown"]),
      startedAt: l,
      visibleAt: l,
      deadlineAt: l,
    }),
    e.object({ state: e.literal("snoozed"), startedAt: l, snoozedAt: l }),
  ]),
  we = e.object({
    interactionId: e.string(),
    kind: e.enum(["permission", "userInput"]),
    anchorRowId: e.number().nullable(),
    createdAt: l,
    autoResolution: Te.optional(),
    payload: e.discriminatedUnion("kind", [Kt, $t]),
  }),
  Ze = e.object({
    commandId: e.string(),
    clientId: e.string(),
    type: e.string(),
    state: e.enum(["accepted", "executing"]),
    at: l,
  }),
  Me = e.object({
    workId: e.string(),
    kind: e.enum(["bash", "subagent"]),
    title: e.string(),
    status: e.enum(["running", "resultPending", "failed", "cancelled"]),
    startedAt: l,
    endedAt: l.optional(),
    cancellable: e.boolean().optional(),
    blocked: e.boolean().optional(),
    anchorRowId: e.number().nullable(),
    childSessionId: e.string().optional(),
  }),
  Jt = e.object({
    childSessionId: e.string(),
    agentId: e.string().optional(),
    toolCallId: e.string().optional(),
    subagentType: e.string(),
    title: e.string(),
    summary: e.string().optional(),
    status: e.enum(["running", "waiting", "blocked"]),
    startedAt: l.optional(),
  }),
  Fe = e.object({
    revision: e.number().int().nonnegative(),
    childSessionIds: e.array(e.string()),
    running: e.array(Jt),
    endedTotal: e.number().int().nonnegative(),
  }),
  Ye = e.object({
    id: e.string(),
    content: e.string(),
    status: e.enum(["pending", "inProgress", "completed"]),
  }),
  Yt = e.object({ iteration: e.number().int().positive(), items: e.array(Ye), updatedAt: l }),
  T = e.object({
    targetId: e.string().default(""),
    objective: e.string(),
    summaryTitle: e.string().nullable().default(null),
    timeUsedSeconds: e.number().int().nonnegative().default(0),
    activeRunStartedAtMs: e.number().int().nonnegative().nullable().default(null),
    status: e.enum(["active", "paused", "verifying", "verified", "notSatisfied", "failed"]),
    iteration: e.number(),
    verifications: e.array(
      e.object({
        iteration: e.number(),
        outcome: e.enum(["pass", "notSatisfied", "failed"]),
        at: l,
        anchorRowId: e.number().nullable(),
        reason: e.string().optional(),
        nextAction: e.string().optional(),
      }),
    ),
    iterations: e.array(Yt).default([]),
  }),
  We = e.object({ items: e.array(Ye), updatedAt: l }),
  Xt = e.object({ window: e.array(k), totalCount: e.number(), firstRowId: e.number().nullable() }),
  Xe = e.object({
    protocolVersion: e.literal(1),
    sessionId: e.string(),
    logEpoch: e.string(),
    seq: e.number(),
    revision: e.number(),
    control: Pe,
    availability: ke,
    inputRouting: be,
    meta: A.default({ title: "", titleSource: "default" }),
    config: Re,
    modelTransition: Ie.nullable().default(null),
    usage: xe,
    queue: Ae,
    pendingInteractions: e.array(we),
    pendingCommands: e.array(Ze),
    backgroundWorks: e.array(Me),
    subagents: Fe.optional(),
    goal: T.nullable(),
    plan: We.nullable(),
    rows: Xt,
  });
var eo = e.object({
    revision: e.number().optional(),
    control: Pe.optional(),
    availability: ke.optional(),
    inputRouting: be.optional(),
    meta: A.optional(),
    config: Re.optional(),
    modelTransition: Ie.nullable().optional(),
    usage: xe.optional(),
    queue: Ae.optional(),
    pendingInteractions: e.array(we).optional(),
    pendingCommands: e.array(Ze).optional(),
    backgroundWorks: e.array(Me).optional(),
    subagents: Fe.optional(),
    goal: T.nullable().optional(),
    plan: We.nullable().optional(),
  }),
  et = e.discriminatedUnion("op", [
    e.object({ op: e.literal("row.appended"), row: k }),
    e.object({ op: e.literal("row.upserted"), row: k }),
    e.object({ op: e.literal("row.removed"), fromRowId: e.number() }),
    e.object({ op: e.literal("row.delta"), rowId: e.number(), path: _e, append: e.string() }),
    e.object({ op: e.literal("state.updated"), patch: eo }),
  ]);
var to = e.object({
    interactionId: e.string(),
    kind: e.enum(["permission", "userInput"]),
    toolName: e.string().optional(),
    autoResolution: Te.optional(),
  }),
  oo = e.object({
    permissionCount: e.number().int().nonnegative(),
    userInputCount: e.number().int().nonnegative(),
  }),
  ro = e.object({ queryId: e.string().min(1), historyRoundCount: e.number().int().nonnegative() }),
  tt = e.object({
    sessionId: e.string(),
    workspaceId: e.string(),
    parentSessionId: e.string().optional(),
    title: e.string(),
    titleSource: A.shape.titleSource.optional(),
    phase: ve,
    sessionEnded: e.boolean(),
    hasBackgroundWork: e.boolean(),
    pendingInteraction: to.optional(),
    pendingInteractionSummary: oo.optional(),
    goalStatus: T.shape.status.optional(),
    lastActivityAt: l,
    lastAssistantPreview: e.string().optional(),
    lastTerminalQuery: ro.optional(),
    createdAt: l,
  }),
  ot = e.object({
    protocolVersion: e.literal(1),
    workspaceId: e.string(),
    logEpoch: e.string(),
    sessions: e.array(tt),
  }),
  rt = e.discriminatedUnion("op", [
    e.object({ op: e.literal("session.upserted"), session: tt }),
    e.object({ op: e.literal("session.removed"), sessionId: e.string() }),
  ]);
var no = e.object({
    value: e.string(),
    name: e.string(),
    description: e.string().optional(),
    origin: e.enum(["native", "injected"]).optional(),
    modelProviderId: e.string().optional(),
    modelProviderName: e.string().optional(),
    modelThoughtLevels: e.array(e.string()).optional(),
    modelDefaultThoughtLevel: e.string().optional(),
  }),
  so = e.object({
    id: e.string(),
    name: e.string(),
    description: e.string().optional(),
    category: e.string().optional(),
    type: e.enum(["select", "boolean"]),
    currentValue: e.union([e.string(), e.boolean()]),
    options: e.array(no).optional(),
  }),
  io = e.object({
    name: e.string(),
    description: e.string(),
    inputHint: e.string().optional(),
    source: e.enum(["builtin", "custom"]).optional(),
  }),
  nt = e.object({ configOptions: e.array(so), slashCommands: e.array(io) }),
  st = e.object({
    protocolVersion: e.literal(1),
    workspaceId: e.string(),
    logEpoch: e.string(),
    config: nt,
  }),
  it = e.discriminatedUnion("op", [e.object({ op: e.literal("config.updated"), config: nt })]);
var ao = e
    .object({ algorithm: e.literal("crc32"), value: e.string().regex(/^[0-9a-f]{8}$/u) })
    .strict(),
  at = e.enum(["initial", "online", "recovery"]),
  F = e.discriminatedUnion("kind", [
    e
      .object({
        wireVersion: e.literal(f),
        kind: e.literal("complete"),
        deliveryKind: e.unknown().optional(),
        logicalFrameId: e.string().min(1),
        logicalFrameOrdinal: e.number(),
        topic: e.string().min(1),
        subscriptionId: e.string().min(1),
        frame: e.unknown().optional(),
      })
      .passthrough(),
    e
      .object({
        wireVersion: e.literal(f),
        kind: e.literal("fragment"),
        deliveryKind: e.unknown().optional(),
        logicalFrameId: e.string().min(1),
        logicalFrameOrdinal: e.number(),
        topic: e.string().min(1),
        subscriptionId: e.string().min(1),
        fragmentIndex: e.unknown().optional(),
        fragmentCount: e.unknown().optional(),
        logicalBytes: e.unknown().optional(),
        checksum: e.unknown().optional(),
        dataBase64: e.unknown().optional(),
      })
      .passthrough(),
  ]);
function createTopicWireFrameSchema(o) {
  return e
    .discriminatedUnion("kind", [
      e
        .object({
          wireVersion: e.literal(f),
          kind: e.literal("complete"),
          deliveryKind: at,
          logicalFrameId: e.string().min(1),
          logicalFrameOrdinal: e.number().int().positive().max(Number.MAX_SAFE_INTEGER),
          topic: e.string().min(1),
          subscriptionId: e.string().min(1),
          frame: o,
        })
        .strict(),
      e
        .object({
          wireVersion: e.literal(f),
          kind: e.literal("fragment"),
          deliveryKind: at,
          logicalFrameId: e.string().min(1),
          logicalFrameOrdinal: e.number().int().positive().max(Number.MAX_SAFE_INTEGER),
          topic: e.string().min(1),
          subscriptionId: e.string().min(1),
          fragmentIndex: e.number().int().nonnegative(),
          fragmentCount: e.number().int().positive().max(u.logicalFrameAssemblyMaxFragments),
          logicalBytes: e.number().int().positive(),
          checksum: ao,
          dataBase64: Ge,
        })
        .strict(),
    ])
    .superRefine((t, r) => {
      let d = t;
      if (d.kind === "fragment") {
        (d.fragmentIndex >= d.fragmentCount &&
          r.addIssue({
            code: "custom",
            message: "fragmentIndex must be smaller than fragmentCount",
            path: ["fragmentIndex"],
          }),
          d.fragmentCount > d.logicalBytes &&
            r.addIssue({
              code: "custom",
              message: "fragmentCount cannot exceed logicalBytes",
              path: ["fragmentCount"],
            }));
        return;
      }
      let p = d.frame;
      (p.topic !== d.topic &&
        r.addIssue({
          code: "custom",
          message: "complete wire topic must match logical frame topic",
          path: ["topic"],
        }),
        p.subscriptionId !== d.subscriptionId &&
          r.addIssue({
            code: "custom",
            message: "complete wire subscriptionId must match logical frame subscriptionId",
            path: ["subscriptionId"],
          }));
    });
}
c(createTopicWireFrameSchema, "createTopicWireFrameSchema");
var co = e.object({
    nativeDialogs: e.boolean(),
    localTerminal: e.boolean(),
    binaryFrames: e.boolean(),
    compression: e.enum(["none", "permessage-deflate"]),
  }),
  Ea = e
    .object({
      kind: e.literal("hello"),
      protocolVersion: e.literal(f),
      connectionId: e.string(),
      clientMode: e.enum(["desktop-continuous", "web-remote-replayable"]),
      deliveryProfile: e.enum(["continuous", "replayable"]),
      serverTime: l,
      capabilities: co,
      auth: e.object({ userId: e.string().optional() }),
    })
    .strict()
    .superRefine((o, t) => {
      let r = o.clientMode === "desktop-continuous" ? "continuous" : "replayable";
      o.deliveryProfile !== r &&
        t.addIssue({
          code: "custom",
          message: "trusted clientMode and deliveryProfile must match",
          path: ["deliveryProfile"],
        });
    }),
  lo = e
    .object({
      kind: e.literal("clientHello"),
      protocolVersion: e.literal(f),
      clientId: e.string(),
      clientKind: e.enum(["desktop", "web", "mobileRemote", "mobileApp"]).optional(),
      appVersion: e.string(),
    })
    .strict(),
  mo = e
    .object({
      topic: e.string(),
      base: e.object({ logEpoch: e.string(), seq: e.number() }).optional(),
      visibility: e.enum(["foreground", "background"]).optional(),
    })
    .strict(),
  B = e.object({
    subscriptionId: e.string(),
    mode: e.enum(["snapshot", "resume"]),
    logEpoch: e.string(),
  });
function createTopicFrameSchema(o, t) {
  return e.object({
    topic: e.string(),
    subscriptionId: e.string(),
    fromSeq: e.number(),
    toSeq: e.number(),
    sentAt: l,
    payload: e.discriminatedUnion("kind", [
      e.object({ kind: e.literal("snapshot"), snapshot: o }),
      e.object({ kind: e.literal("deltas"), deltas: e.array(t) }),
    ]),
  });
}
c(createTopicFrameSchema, "createTopicFrameSchema");
var dt = createTopicFrameSchema(Xe, et).superRefine((o, t) => {
    (!o.topic.startsWith("conversation/") || o.topic.length === 13) &&
      t.addIssue({ code: "custom", message: "invalid conversation topic", path: ["topic"] });
  }),
  po = createTopicWireFrameSchema(dt).superRefine((o, t) => {
    (!o.topic.startsWith("conversation/") || o.topic.length === 13) &&
      t.addIssue({ code: "custom", message: "invalid conversation topic", path: ["topic"] });
  }),
  uo = F.superRefine((o, t) => {
    (!o.topic.startsWith("conversation/") || o.topic.length === 13) &&
      t.addIssue({ code: "custom", message: "invalid conversation topic", path: ["topic"] });
  }),
  ct = createTopicFrameSchema(ot, rt).superRefine((o, t) => {
    (!o.topic.startsWith("sessions-index/") || o.topic.length === 15) &&
      t.addIssue({ code: "custom", message: "invalid sessions-index topic", path: ["topic"] });
  }),
  go = createTopicWireFrameSchema(ct).superRefine((o, t) => {
    (!o.topic.startsWith("sessions-index/") || o.topic.length === 15) &&
      t.addIssue({ code: "custom", message: "invalid sessions-index topic", path: ["topic"] });
  }),
  fo = F.superRefine((o, t) => {
    (!o.topic.startsWith("sessions-index/") || o.topic.length === 15) &&
      t.addIssue({ code: "custom", message: "invalid sessions-index topic", path: ["topic"] });
  }),
  lt = createTopicFrameSchema(st, it).superRefine((o, t) => {
    (!o.topic.startsWith("workspace-config/") || o.topic.length === 17) &&
      t.addIssue({ code: "custom", message: "invalid workspace-config topic", path: ["topic"] });
  }),
  Co = createTopicWireFrameSchema(lt).superRefine((o, t) => {
    (!o.topic.startsWith("workspace-config/") || o.topic.length === 17) &&
      t.addIssue({ code: "custom", message: "invalid workspace-config topic", path: ["topic"] });
  }),
  ho = F.superRefine((o, t) => {
    (!o.topic.startsWith("workspace-config/") || o.topic.length === 17) &&
      t.addIssue({ code: "custom", message: "invalid workspace-config topic", path: ["topic"] });
  }),
  Oa = e.union([dt, ct, lt]),
  Da = e.union([po, go, Co]),
  qa = e.union([uo, fo, ho]);
var yo = e.enum(["saturated", "drained", "closed"]),
  ja = e.object({ connectionId: e.string().min(1), state: yo }).strict(),
  La = e.object({}).strict();
var So = 200,
  Ua = mo.extend({
    connectionId: e.string(),
    clientMode: e.enum(["desktop-continuous", "web-remote-replayable"]),
    legacyTaskIds: e.array(e.string().min(1)).max(So).optional(),
    resumeThoughtLevel: e.string().trim().min(1).optional(),
  }),
  za = e.object({ ack: B }).strict(),
  Va = e.object({ ack: B }).strict(),
  _a = e.object({ ack: B }).strict(),
  vo = e
    .object({
      subscriptionId: e.string().trim().min(1).max(1024),
      base: e
        .object({
          logEpoch: e.string().trim().min(1).max(1024),
          seq: e.number().int().nonnegative(),
        })
        .strict()
        .nullable(),
      forceSnapshot: e.boolean().optional(),
    })
    .strict(),
  Ga = vo
    .extend({
      topic: e.string().trim().min(1).max(2048),
      connectionId: e.string().trim().min(1).max(1024),
    })
    .strict(),
  Na = e.object({ ack: B }).strict(),
  Ka = e
    .object({
      topic: e.string().trim().min(1).max(2048),
      subscriptionId: e.string().trim().min(1).max(1024),
      connectionId: e.string().trim().min(1).max(1024),
    })
    .strict(),
  Ha = e.object({
    sessionId: e.string(),
    beforeRowId: e.number().optional(),
    limit: e.number().min(1).max(u.rowsRangeMaxLimit),
  }),
  Qa = e.object({
    rows: e.array(k),
    atSeq: e.number(),
    atLogEpoch: e.string(),
    hasMore: e.boolean(),
  }),
  $a = e.object({ sessionId: e.string().min(1) }).strict(),
  Ja = e
    .object({
      plans: e.array(ye),
      atSeq: e.number().int().nonnegative(),
      atLogEpoch: e.string().min(1),
    })
    .strict(),
  Po = e
    .object({
      oldStart: e.number(),
      oldLines: e.number(),
      newStart: e.number(),
      newLines: e.number(),
      lines: e.array(e.string()),
    })
    .strict(),
  Ya = e
    .object({
      sessionId: e.string().min(1),
      target: C,
      baseRevision: e.number().int().nonnegative(),
      baseLogEpoch: e.string().trim().min(1),
    })
    .strict(),
  Xa = e
    .object({
      files: e.number().int().nonnegative(),
      additions: e.number().int().nonnegative(),
      deletions: e.number().int().nonnegative(),
      state: e.enum(["active", "reverted"]).optional(),
      items: e.array(
        e
          .object({
            path: e.string().min(1),
            additions: e.number().int().nonnegative(),
            deletions: e.number().int().nonnegative(),
            writeCount: e.number().int().nonnegative(),
            toolNames: e.array(e.string()),
            patches: e.array(Po),
          })
          .strict(),
      ),
    })
    .strict(),
  ed = e
    .object({
      sessionId: e.string().min(1),
      target: C,
      baseRevision: e.number().int().nonnegative(),
      baseLogEpoch: e.string().trim().min(1),
    })
    .strict(),
  ko = e
    .object({
      action: e.enum(["restore", "delete"]),
      operationCount: e.number().int().nonnegative(),
      path: e.string().min(1),
      toolNames: e.array(e.string()),
    })
    .strict(),
  bo = e
    .object({
      currentHash: e.string().optional(),
      expectedHash: e.string().optional(),
      message: e.string().optional(),
      operationCount: e.number().int().nonnegative(),
      path: e.string().min(1),
      reason: e.enum([
        "checkpoint_missing",
        "checkpoint_unreadable",
        "external_modified",
        "file_read_failed",
        "unsupported_checkpoint",
      ]),
      toolNames: e.array(e.string()),
    })
    .strict(),
  Ro = e
    .object({
      operationCount: e.number().int().nonnegative(),
      path: e.string().min(1),
      reason: e.literal("bash_ignored"),
      toolNames: e.array(e.string()),
    })
    .strict(),
  Ee = e
    .object({
      canApply: e.boolean(),
      ignoredFiles: e.array(Ro),
      safeFiles: e.array(ko),
      unsafeFiles: e.array(bo),
    })
    .strict(),
  td = e.object({ range: e.enum(De), timeZone: e.string().optional() }).strict();
var od = e.object({ sessionId: e.string().min(1) }).strict(),
  rd = e
    .object({
      sessionId: e.string().min(1),
      totalTokens: e.number().int().nonnegative(),
      inputTokens: e.number().int().nonnegative(),
      outputTokens: e.number().int().nonnegative(),
      reasoningTokens: e.number().int().nonnegative(),
      cacheCreationTokens: e.number().int().nonnegative(),
      cacheReadTokens: e.number().int().nonnegative(),
      modelRequestCount: e.number().int().nonnegative(),
      modelErrorCount: e.number().int().nonnegative(),
      inputBaselineBySource: e.record(e.string(), e.number().int().nonnegative()),
    })
    .strict(),
  nd = e
    .object({
      sessionId: e.string().min(1),
      fileName: e.string().min(1),
      mime: e.string().min(1),
      dataBase64: e.string().min(1),
    })
    .strict(),
  Io = e.object({ ref: e.string().min(1) }),
  I = e
    .string()
    .min(1)
    .max(128)
    .regex(/^[A-Za-z0-9][A-Za-z0-9._:-]*$/),
  xo = e.string().regex(/^sha256:[0-9a-f]{64}$/),
  sd = e
    .object({
      connectionId: e.string().min(1),
      uploadId: I,
      sessionId: e.string().min(1),
      fileName: e
        .string()
        .min(1)
        .max(255)
        .regex(/^[^\0\r\n]+$/),
      mime: e
        .string()
        .min(3)
        .max(255)
        .regex(/^[A-Za-z0-9][A-Za-z0-9!#$&^_.+-]*\/[A-Za-z0-9][A-Za-z0-9!#$&^_.+-]*$/),
      totalBytes: e.number().int().min(0).max(u.attachmentMaxBytes),
      totalChunks: e.number().int().min(0).max(u.attachmentUploadMaxChunks),
      checksum: xo,
    })
    .strict()
    .superRefine((o, t) => {
      (o.totalBytes === 0) != (o.totalChunks === 0) &&
        t.addIssue({
          code: "custom",
          message: "zero-byte upload must declare zero chunks",
          path: ["totalChunks"],
        });
    }),
  id = e.discriminatedUnion("state", [
    e
      .object({
        uploadId: I,
        state: e.literal("staging"),
        nextChunkIndex: e.number().int().nonnegative(),
      })
      .strict(),
    e
      .object({
        uploadId: I,
        state: e.literal("committed"),
        nextChunkIndex: e.number().int().nonnegative(),
        ref: e.string().min(1),
      })
      .strict(),
  ]);
function decodedBase64ByteLength(o) {
  if (o.length === 0) return 0;
  if (o.length % 4 !== 0) return null;
  let t = o.endsWith("==") ? 2 : o.endsWith("=") ? 1 : 0,
    r = o.length - t;
  for (let d = 0; d < r; d += 1) {
    let p = o.charCodeAt(d);
    if (!(
      (p >= 65 && p <= 90) ||
      (p >= 97 && p <= 122) ||
      (p >= 48 && p <= 57) ||
      p === 43 ||
      p === 47
    ))
      return null;
  }
  for (let d = r; d < o.length; d += 1) if (o.charCodeAt(d) !== 61) return null;
  return (o.length / 4) * 3 - t;
}
c(decodedBase64ByteLength, "decodedBase64ByteLength");
var ad = e
    .object({
      connectionId: e.string().min(1),
      uploadId: I,
      sessionId: e.string().min(1),
      chunkIndex: e.number().int().nonnegative(),
      dataBase64: e.string(),
    })
    .strict()
    .superRefine((o, t) => {
      let r = decodedBase64ByteLength(o.dataBase64);
      if (r === null) {
        t.addIssue({ code: "custom", message: "invalid base64", path: ["dataBase64"] });
        return;
      }
      r > u.attachmentChunkMaxBytes &&
        t.addIssue({
          code: "too_big",
          maximum: u.attachmentChunkMaxBytes,
          origin: "string",
          inclusive: !0,
          message: "attachment chunk exceeds decoded byte limit",
          path: ["dataBase64"],
        });
    }),
  dd = e.object({ uploadId: I, nextChunkIndex: e.number().int().nonnegative() }).strict(),
  cd = e
    .object({ connectionId: e.string().min(1), uploadId: I, sessionId: e.string().min(1) })
    .strict();
var ld = Io.strict();
var md = e.object({}).strict(),
  pd = e
    .object({
      sessionId: e.string().min(1),
      ref: e.string().min(1),
      offset: e.number().int().nonnegative(),
      limit: e.number().int().positive().max(u.attachmentChunkMaxBytes),
    })
    .strict(),
  ud = e
    .object({
      dataBase64: e.string(),
      mediaType: e.string().startsWith("image/"),
      totalBytes: e.number().int().nonnegative().max(u.attachmentMaxBytes),
      nextOffset: e.number().int().positive().nullable(),
    })
    .strict()
    .superRefine((o, t) => {
      let r = decodedBase64ByteLength(o.dataBase64);
      if (r === null) {
        t.addIssue({ code: "custom", message: "invalid base64", path: ["dataBase64"] });
        return;
      }
      (r > u.attachmentChunkMaxBytes &&
        t.addIssue({
          code: "too_big",
          maximum: u.attachmentChunkMaxBytes,
          origin: "string",
          inclusive: !0,
          message: "attachment read chunk exceeds decoded byte limit",
          path: ["dataBase64"],
        }),
        o.nextOffset !== null &&
          o.nextOffset > o.totalBytes &&
          t.addIssue({
            code: "custom",
            message: "nextOffset exceeds totalBytes",
            path: ["nextOffset"],
          }));
    });
var To = e.object({
    provider: e.string().optional(),
    model: e.string().optional(),
    thought: e.string().optional(),
    followupMode: e.enum(["queue", "guide"]).optional(),
    mode: e.string().optional(),
  }),
  wo = {
    createSession: e.object({
      workspaceId: e.string(),
      firstInput: e.object({ text: e.string(), attachments: e.array(R).optional() }).optional(),
      config: To.optional(),
      runtimeModel: Z.optional(),
      mcpServers: e.array(ze).optional(),
    }),
    createSelectionSideSession: e.object({}),
    sendText: e
      .object({
        text: e.string(),
        attachments: e.array(R).optional(),
        browserAmbientContext: Ve.optional(),
        heldQueueDisposition: e.enum(["clearQueueAndSend", "keepQueueAndSend"]).optional(),
        expectedHeldQueueItemIds: e.array(e.string().min(1)).optional(),
        turnRuntimeModel: Z.optional(),
        automationId: e.string().min(1).optional(),
        offPeakTaskId: e.string().min(1).optional(),
        offPeakRunType: e.enum(["init", "resume"]).optional(),
        botDeliveryTarget: Ue.optional(),
        toolDisallowlist: e.array(e.string().min(1)).optional(),
      })
      .superRefine((o, t) => {
        (o.automationId &&
          o.offPeakTaskId &&
          t.addIssue({
            code: e.ZodIssueCode.custom,
            message: "automationId and offPeakTaskId are mutually exclusive",
          }),
          o.offPeakRunType &&
            !o.offPeakTaskId &&
            t.addIssue({
              code: e.ZodIssueCode.custom,
              message: "offPeakRunType requires offPeakTaskId",
              path: ["offPeakRunType"],
            }));
      }),
    sendGoalCommand: e.object({
      text: e.string(),
      displayText: e.string().optional(),
      heldQueueDisposition: e.enum(["clearQueueAndSend", "keepQueueAndSend"]).optional(),
      expectedHeldQueueItemIds: e.array(e.string().min(1)).optional(),
    }),
    stop: e.object({ expectedForegroundExecutionId: e.string().min(1).optional() }),
    compact: e.object({}),
    forkAssistant: e.object({ target: C }),
    applyFileRewind: e.object({ target: C }),
    editUserQuery: e.object({
      target: C,
      newText: e.string(),
      attachments: e.array(R).optional(),
      workspaceMode: e.enum(["preserve", "rewind"]).optional(),
    }),
    retryTurn: e.object({ target: C }),
    setAssistantFeedback: e.object({ target: C, feedback: e.enum(["like", "dislike"]).nullable() }),
    sendQueuedNow: e.object({ queueItemId: e.string() }),
    editQueueItem: e.object({ queueItemId: e.string(), newText: e.string() }),
    reorderQueueItem: e.object({
      queueItemId: e.string(),
      beforeQueueItemId: e.string().nullable(),
    }),
    deleteQueueItem: e.object({ queueItemId: e.string() }),
    setAutoDrain: e.object({ autoDrain: e.boolean() }),
    resolveInteraction: e.object({
      interactionId: e.string(),
      answer: e.object({
        optionId: e.string().optional(),
        freeText: e.string().optional(),
        action: e.enum(["accept", "decline", "cancel"]).optional(),
        content: e.record(e.string(), e.unknown()).optional(),
      }),
    }),
    snoozeInteractionAutoResolution: e.object({ interactionId: e.string() }),
    switchModelConfig: e.object({
      provider: e.string(),
      model: e.string(),
      thought: e.string(),
      runtimeModel: Z.optional(),
    }),
    switchCollaborationMode: e.object({ mode: e.enum(["build", "edit", "plan", "yolo"]) }),
    setFollowupMode: e.object({ mode: e.enum(["queue", "guide"]) }),
    pauseGoal: e.object({}),
    resumeGoal: e.object({}),
    cancelBackgroundWork: e.object({ workId: e.string() }),
    renameSession: e.object({ title: e.string() }),
    deleteSession: e.object({}),
  },
  Zo = e.enum(Object.keys(wo));
var Gd = e.object({
  commandId: e.string(),
  clientId: e.string(),
  sessionId: e.string().nullable(),
  baseRevision: e.number().optional(),
  baseLogEpoch: e.string().trim().min(1).optional(),
  type: Zo,
  payload: e.unknown(),
  issuedAt: l,
});
var Mo = e.discriminatedUnion("type", [
    e.object({
      type: e.enum(["createSession", "createSelectionSideSession", "forkAssistant"]),
      sessionId: e.string(),
    }),
    e.object({
      type: e.literal("resolveInteraction"),
      resolvedBy: e.object({ clientId: e.string(), optionId: e.string().optional() }),
    }),
    e.object({
      type: e.literal("applyFileRewind"),
      applied: e.boolean(),
      preview: Ee,
      response: e.string(),
    }),
    e.object({
      type: e.literal("editUserQuery"),
      disposition: e.enum(["rewind", "fork", "blocked"]),
      sessionId: e.string().min(1),
      reasonCode: e.string().min(1).optional(),
      preview: Ee.optional(),
    }),
    e.object({
      type: e.literal("inputDisposition"),
      delivery: e.enum(["startNow", "queue", "guide"]),
    }),
  ]),
  Fo = e.object({
    commandId: e.string(),
    status: e.enum(["accepted", "rejected", "stale", "duplicate", "noop", "failed"]),
    reasonCode: e.string().optional(),
    message: e.string().optional(),
    revisionAtDecision: e.number(),
    result: Mo.optional(),
  }),
  ut = e.object({ sessionId: e.string().nullable(), commandId: e.string().min(1) }).strict(),
  Nd = e.object({ commands: e.array(ut).min(1).max(64) }).strict(),
  Wo = e.object({ key: ut, result: e.union([Fo, e.literal("unknown")]) }).strict(),
  Kd = e.object({ results: e.array(Wo).min(1).max(64) }).strict();
var Xd = e
  .object({
    productTurnId: e.string().min(1),
    transcriptTurnId: e.string().min(1),
    orderedMessageIds: e.array(e.string().min(1)).min(1),
    boundaryMessageId: e.string().min(1),
  })
  .strict()
  .refine((o) => o.orderedMessageIds.at(-1) === o.boundaryMessageId, {
    message: "boundaryMessageId must be the final orderedMessageId",
    path: ["boundaryMessageId"],
  });
var h = {
    version: e.literal(1),
    eventId: e.string().min(1),
    eventSeq: e.number().int().nonnegative(),
    occurredAt: l,
    sessionId: e.string().min(1),
    sourceCommandId: e.string().min(1).optional(),
    turnId: e.string().min(1).optional(),
  },
  gt = e
    .string()
    .min(1)
    .refine(
      (o) =>
        /^\[[0-9a-f:.]+\]$/iu.test(o) ||
        (!/[\s/:?#@]/u.test(o) && !o.includes("[") && !o.includes("]") && o.trim() === o),
      "providerHostname must be a hostname without scheme, port, path, query, credentials or fragment",
    ),
  Bo = e
    .object({
      totalMs: e.number().int().nonnegative().optional(),
      permissionWaitMs: e.number().int().nonnegative().optional(),
      commandRunMs: e.number().int().nonnegative().optional(),
      firstOutputMs: e.number().int().nonnegative().optional(),
      noOutputMs: e.number().int().nonnegative().optional(),
      exitCode: e.number().int().optional(),
      timedOut: e.boolean().optional(),
      outputBytes: e.number().int().nonnegative().optional(),
      commandCategory: e.string().max(64).optional(),
      commandName: e.string().max(128).optional(),
      commandCount: e.number().int().nonnegative().optional(),
      commandStatus: e
        .enum(["completed", "failed", "timed_out", "cancelled", "spawn_error", "backgrounded"])
        .optional(),
      commandHash: e
        .string()
        .regex(/^[a-f0-9]{16}$/u)
        .optional(),
      fsReadMs: e.number().int().nonnegative().optional(),
      fsWriteMs: e.number().int().nonnegative().optional(),
      patchMatchMs: e.number().int().nonnegative().optional(),
      fileCount: e.number().int().nonnegative().optional(),
      totalBytes: e.number().int().nonnegative().optional(),
      maxFileBytes: e.number().int().nonnegative().optional(),
      hunkCount: e.number().int().nonnegative().optional(),
      matchAttempts: e.number().int().nonnegative().optional(),
      workspaceKind: e.enum(["local", "remote", "unknown"]).optional(),
    })
    .strict(),
  Eo = e
    .object({
      ...h,
      kind: e.literal("turn.started"),
      executionKind: e.enum(["agent", "controlOnly"]).optional(),
      automationId: e.string().min(1).optional(),
      offPeakTaskId: e.string().min(1).optional(),
      offPeakRunType: e.enum(["init", "resume"]).optional(),
      taskTrigger: e.enum(["schedule", "manual"]).optional(),
      scheduledAt: l.optional(),
    })
    .strict(),
  Oo = e
    .object({
      ...h,
      kind: e.literal("model.request.status"),
      requestId: e.string().min(1),
      status: e.enum([
        "model_request_started",
        "model_request_completed",
        "model_request_failed",
        "model_retry_scheduled",
        "model_stream_stalled",
      ]),
      providerId: e.string(),
      modelId: e.string(),
      providerKind: e.string().optional(),
      providerHostname: gt.optional(),
      transport: e.string(),
      querySource: e.string().optional(),
      queryId: e.string().min(1).optional(),
      attempt: e.number().int().nonnegative(),
      maxAttempts: e.number().int().nonnegative(),
      durationMs: e.number().nonnegative().optional(),
      reason: e.string().optional(),
      retryable: e.boolean().optional(),
      statusCode: e.number().int().optional(),
      delayMs: e.number().nonnegative().optional(),
      nextAttempt: e.number().int().nonnegative().optional(),
      idleMs: e.number().nonnegative().optional(),
      timeoutMs: e.number().nonnegative().optional(),
    })
    .strict(),
  Do = e
    .object({
      ...h,
      kind: e.literal("stream.chunk"),
      channel: e.enum(["thought", "text"]),
      chunkLength: e.number().int().nonnegative(),
      firstChunk: e.boolean(),
      assistantMessageId: e.string().min(1).optional(),
      partId: e.string().min(1).optional(),
      parentToolCallId: e.string().min(1).optional(),
    })
    .strict(),
  qo = e
    .object({
      ...h,
      kind: e.literal("tool.lifecycle"),
      phase: e.enum(["scheduled", "started", "progress", "completed", "failed"]),
      toolCallId: e.string().min(1),
      toolName: e.string().optional(),
      durationMs: e.number().nonnegative().optional(),
      errorCode: e.string().optional(),
      errorMessage: e.string().optional(),
      parentToolCallId: e.string().min(1).optional(),
      childToolCallId: e.string().min(1).optional(),
      agentId: e.string().min(1).optional(),
      agentType: e.string().optional(),
      childSessionId: e.string().min(1).optional(),
      performance: Bo.optional(),
      automationId: e.string().min(1).optional(),
    })
    .strict(),
  jo = e
    .object({
      ...h,
      kind: e.literal("permission.lifecycle"),
      phase: e.enum(["requested", "resolved", "denied"]),
      requestId: e.string().min(1).optional(),
      toolCallId: e.string().min(1),
      toolName: e.string().optional(),
      decision: e.enum(["allow", "deny", "escalate", "modify"]).optional(),
    })
    .strict(),
  Lo = e
    .object({
      ...h,
      kind: e.literal("usage.delta"),
      requestId: e.string().min(1).optional(),
      providerId: e.string().optional(),
      modelId: e.string().optional(),
      providerKind: e.string().optional(),
      providerHostname: gt.optional(),
      inputTokens: e.number().nonnegative(),
      outputTokens: e.number().nonnegative(),
      totalTokens: e.number().nonnegative(),
      reasoningTokens: e.number().nonnegative(),
      cacheReadTokens: e.number().nonnegative(),
      cacheWriteTokens: e.number().nonnegative(),
    })
    .strict(),
  Uo = e
    .object({
      ...h,
      kind: e.literal("subagent.lifecycle"),
      phase: e.enum(["spawned", "stopped"]),
      agentId: e.string().min(1),
      agentType: e.string().optional(),
      childSessionId: e.string().min(1),
      parentToolCallId: e.string().min(1).optional(),
      background: e.boolean(),
      status: e.string().optional(),
    })
    .strict(),
  zo = e
    .object({
      ...h,
      kind: e.literal("turn.terminal"),
      status: e.enum(["success", "interrupted", "failed"]),
      resultType: e.string().optional(),
      durationMs: e.number().nonnegative().optional(),
      tokenCount: e.number().nonnegative().optional(),
      toolCallCount: e.number().int().nonnegative().optional(),
      errorCode: e.string().optional(),
      errorMessage: e.string().optional(),
      errorRetryable: e.boolean().optional(),
      turnPhase: e.string().optional(),
    })
    .strict(),
  Vo = e
    .object({
      ...h,
      kind: e.literal("compaction.terminal"),
      operationId: e.string().min(1),
      messageId: e.string().min(1).optional(),
      summaryMessageId: e.string().min(1).optional(),
      status: e.enum(["completed", "failed", "interrupted"]),
      trigger: e.enum(["manual", "auto", "partial", "reactive", "session_memory"]),
      compactReason: e.string().optional(),
      reason: e.string().optional(),
      attempt: e.number().int().positive().optional(),
      maxAttempts: e.number().int().positive().optional(),
      startedAt: l.optional(),
      endedAt: l.optional(),
      preCompactTokenCount: e.number().int().nonnegative().optional(),
      postCompactTokenCount: e.number().int().nonnegative().optional(),
      truePostCompactTokenCount: e.number().int().nonnegative().optional(),
      modelName: e.string().optional(),
      modelProvider: e.string().optional(),
    })
    .strict(),
  _o = e.discriminatedUnion("kind", [Eo, Oo, Do, qo, jo, Lo, Uo, zo, Vo]).superRefine((o, t) => {
    (o.kind === "turn.started" &&
      o.automationId &&
      o.offPeakTaskId &&
      t.addIssue({
        code: e.ZodIssueCode.custom,
        message: "automationId and offPeakTaskId are mutually exclusive",
      }),
      o.kind === "turn.started" &&
        o.offPeakRunType &&
        !o.offPeakTaskId &&
        t.addIssue({
          code: e.ZodIssueCode.custom,
          message: "offPeakRunType requires offPeakTaskId",
          path: ["offPeakRunType"],
        }));
  }),
  sc = _o.transform((o) => o);
var Dc = 32 * 1024 * 1024;
var w = class {
  static {
    c(this, "RemoteServiceAccess");
  }
  fileService;
  gitService;
  gitCheckpointService;
  systemService;
  terminalService;
  settingService;
  credentialService;
  broadcastService;
  zcodeTaskService;
  zcodeAgentService;
  zcodeSessionService;
  botsService;
  fileWatcherService;
  oauthService;
  modelProviderService;
  usageStatsService;
  codingPlanSubscriptionService;
  offPeakTaskService;
  skillsService;
  skillSyncService;
  mcpSyncService;
  pluginSyncService;
  pluginsService;
  pluginManagementService;
  subagentsService;
  commandsService;
  hooksService;
  memoryService;
  outputStyleService;
  settingsSyncService;
  feedbackService;
  repoWikiService;
  promptAttachmentTransferService;
  constructor(t) {
    ((this.fileService = m.toService(t.getChannel(z.channelName))),
      (this.gitService = m.toService(t.getChannel(V.channelName))),
      (this.gitCheckpointService = m.toService(t.getChannel(_.channelName))),
      (this.systemService = m.toService(t.getChannel(G.channelName))),
      (this.terminalService = m.toService(t.getChannel(N.channelName))),
      (this.settingService = m.toService(t.getChannel(K.channelName))),
      (this.credentialService = m.toService(t.getChannel(H.channelName))),
      (this.broadcastService = m.toService(t.getChannel(Q.channelName))),
      (this.zcodeTaskService = m.toService(t.getChannel($.channelName))),
      (this.zcodeAgentService = m.toService(t.getChannel(j.channelName))),
      (this.zcodeSessionService = m.toService(t.getChannel(J.channelName))),
      (this.botsService = m.toService(t.getChannel(Y.channelName))),
      (this.fileWatcherService = m.toService(t.getChannel(X.channelName))),
      (this.oauthService = m.toService(t.getChannel(ee.channelName))),
      (this.modelProviderService = m.toService(t.getChannel(te.channelName))),
      (this.usageStatsService = m.toService(t.getChannel(oe.channelName))),
      (this.codingPlanSubscriptionService = m.toService(t.getChannel(re.channelName))),
      (this.offPeakTaskService = m.toService(t.getChannel(U.channelName))),
      (this.skillsService = m.toService(t.getChannel(ne.channelName))),
      (this.skillSyncService = m.toService(t.getChannel(se.channelName))),
      (this.mcpSyncService = m.toService(t.getChannel(ie.channelName))),
      (this.pluginSyncService = m.toService(t.getChannel(ae.channelName))),
      (this.pluginsService = m.toService(t.getChannel(de.channelName))),
      (this.pluginManagementService = m.toService(t.getChannel(ce.channelName))),
      (this.subagentsService = m.toService(t.getChannel(le.channelName))),
      (this.commandsService = m.toService(t.getChannel(me.channelName))),
      (this.hooksService = m.toService(t.getChannel(pe.channelName))),
      (this.memoryService = m.toService(t.getChannel(L.channelName))),
      (this.outputStyleService = m.toService(t.getChannel(ue.channelName))),
      (this.settingsSyncService = m.toService(t.getChannel(ge.channelName))),
      (this.feedbackService = m.toService(t.getChannel(fe.channelName))),
      (this.repoWikiService = m.toService(t.getChannel(Ce.channelName))),
      (this.promptAttachmentTransferService = m.toService(t.getChannel(he.channelName))));
  }
};
var E = class {
  static {
    c(this, "AcknowledgedRelayBatchQueue");
  }
  storage = [];
  headIndex = 0;
  nextUnsentIndex = 0;
  get oldest() {
    return this.storage[this.headIndex];
  }
  get nextUnsent() {
    return this.storage[this.nextUnsentIndex];
  }
  get activeCount() {
    return this.storage.length - this.headIndex;
  }
  get retainedStorageSlots() {
    return this.storage.length;
  }
  get retainedBatchReferenceCount() {
    let t = 0;
    for (let r of this.storage) r && (t += 1);
    return t;
  }
  get retainedPayloadBytes() {
    let t = 0;
    for (let r of this.storage) r && (t += r.outerBytes);
    return t;
  }
  append(t) {
    this.storage.push(t);
  }
  advanceUnsent() {
    this.nextUnsentIndex < this.storage.length && (this.nextUnsentIndex += 1);
  }
  resetReplay() {
    for (let t = this.headIndex; t < this.storage.length; t += 1) {
      let r = this.storage[t];
      r && (r.nextFrameIndex = 0);
    }
    this.nextUnsentIndex = this.headIndex;
  }
  releaseThrough(t) {
    let r = 0,
      d = 0;
    for (; this.headIndex < this.storage.length;) {
      let p = this.storage[this.headIndex];
      if (p.messageSeq > t) break;
      ((r += p.outerBytes),
        (d += 1),
        (this.storage[this.headIndex] = void 0),
        (this.headIndex += 1));
    }
    return (
      (this.nextUnsentIndex = Math.max(this.nextUnsentIndex, this.headIndex)),
      this.compactReleasedPrefix(),
      { releasedBytes: r, releasedCount: d }
    );
  }
  clear() {
    ((this.storage = []), (this.headIndex = 0), (this.nextUnsentIndex = 0));
  }
  compactReleasedPrefix() {
    if (this.headIndex < 1024 || this.headIndex * 2 < this.storage.length) return;
    let t = this.headIndex;
    ((this.storage = this.storage.slice(t)),
      (this.nextUnsentIndex = Math.max(0, this.nextUnsentIndex - t)),
      (this.headIndex = 0));
  }
};
var O = class {
  constructor(t, r, d, p) {
    this.graceMs = t;
    this.now = r;
    this.readState = d;
    this.onExpired = p;
  }
  graceMs;
  now;
  readState;
  onExpired;
  static {
    c(this, "AcknowledgedRelayDeadline");
  }
  timer;
  disposed = !1;
  check() {
    if (this.disposed) return !1;
    let t = this.select();
    return !t || this.now() < t.deadline ? !1 : (this.onExpired(t.fault), !0);
  }
  refresh() {
    if (this.disposed) return;
    this.clear();
    let t = this.select();
    t &&
      (this.timer = setTimeout(
        () => {
          ((this.timer = void 0), this.check() || this.refresh());
        },
        Math.max(0, t.deadline - this.now()),
      ));
  }
  dispose() {
    ((this.disposed = !0), this.clear());
  }
  select() {
    let t = this.readState(),
      r = t.oldestData,
      d = t.pendingAck;
    return !r && !d
      ? null
      : d && (!r || d.queuedAt <= r.queuedAt)
        ? {
            deadline: d.queuedAt + this.graceMs + 1,
            fault: {
              reasonCode: "remote.rpcFrame.ackGraceExceeded",
              terminal: !0,
              messageSeq: d.messageSeq,
            },
          }
        : {
            deadline: r.queuedAt + this.graceMs + 1,
            fault: {
              reasonCode: "remote.rpcFrame.replayGraceExceeded",
              terminal: !0,
              messageSeq: r.messageSeq,
            },
          };
  }
  clear() {
    (this.timer && clearTimeout(this.timer), (this.timer = void 0));
  }
};
var g = {
  saturationHighWaterMarkBytes: 1024 * 1024,
  saturationLowWaterMarkBytes: 256 * 1024,
  replayBufferMaxBytes: 8 * 1024 * 1024,
  replayBufferGraceMs: 45e3,
  assemblyTimeoutMs: x.assemblyTimeoutMs,
};
function requirePositiveSafeInteger(o, t) {
  if (!Number.isSafeInteger(o) || o <= 0) throw new Error(`${t} must be a positive safe integer`);
  return o;
}
c(requirePositiveSafeInteger, "requirePositiveSafeInteger");
function requireNonnegativeSafeInteger(o, t) {
  if (!Number.isSafeInteger(o) || o < 0) throw new Error(`${t} must be a nonnegative safe integer`);
  return o;
}
c(requireNonnegativeSafeInteger, "requireNonnegativeSafeInteger");
function rawIdentityMatches(o, t) {
  if (typeof t != "object" || t === null) return !1;
  let r = t;
  return (
    r.bridgeSessionId === o.bridgeSessionId &&
    r.bridgeGeneration === o.bridgeGeneration &&
    r.recoveryId === o.recoveryId
  );
}
c(rawIdentityMatches, "rawIdentityMatches");
function isRawTransportCandidate(o) {
  if (typeof o != "object" || o === null) return !1;
  let t = o.zcode_type;
  return t === "rpc-frame" || t === "rpc-frame-ack";
}
c(isRawTransportCandidate, "isRawTransportCandidate");
function measureAcknowledgedRelayBatchBytes(o, t) {
  let r = 0;
  for (let d of o) {
    let p = t(d);
    if (!Number.isSafeInteger(p) || p <= 0 || p > x.maxPhysicalFrameBytes)
      throw new Error("invalid final envelope byte count");
    r += p;
  }
  return r;
}
c(measureAcknowledgedRelayBatchBytes, "measureAcknowledgedRelayBatchBytes");
function resolveAcknowledgedRelayLimits(o) {
  let t = requirePositiveSafeInteger(
      o.saturationHighWaterMarkBytes ?? g.saturationHighWaterMarkBytes,
      "saturationHighWaterMarkBytes",
    ),
    r = requireNonnegativeSafeInteger(
      o.saturationLowWaterMarkBytes ?? g.saturationLowWaterMarkBytes,
      "saturationLowWaterMarkBytes",
    );
  if (r > t) throw new Error("saturationLowWaterMarkBytes must not exceed high watermark");
  return {
    highWaterMarkBytes: t,
    lowWaterMarkBytes: r,
    replayBufferMaxBytes: Math.min(
      requirePositiveSafeInteger(
        o.replayBufferMaxBytes ?? g.replayBufferMaxBytes,
        "replayBufferMaxBytes",
      ),
      g.replayBufferMaxBytes,
    ),
    replayBufferGraceMs: Math.min(
      requirePositiveSafeInteger(
        o.replayBufferGraceMs ?? g.replayBufferGraceMs,
        "replayBufferGraceMs",
      ),
      g.replayBufferGraceMs,
    ),
    assemblyTimeoutMs: Math.min(
      requirePositiveSafeInteger(o.assemblyTimeoutMs ?? g.assemblyTimeoutMs, "assemblyTimeoutMs"),
      g.assemblyTimeoutMs,
    ),
  };
}
c(resolveAcknowledgedRelayLimits, "resolveAcknowledgedRelayLimits");
var Oe = class {
  static {
    c(this, "AcknowledgedRelayProtocol");
  }
  identity;
  sendFrame;
  measureFrameBytes;
  highWaterMarkBytes;
  lowWaterMarkBytes;
  replayBufferMaxBytes;
  assemblyTimeoutMs;
  now;
  deadline;
  onMessageEmitter = new S();
  saturatedEmitter = new S();
  drainedEmitter = new S();
  degradedEmitter = new S();
  assembler;
  outboundBatches = new E();
  queuedInbound = [];
  pendingAckMessageSeq = null;
  pendingAckQueuedAt = null;
  nextPhysicalSeq = 1;
  nextMessageSeq = 1;
  highestFullySentMessageSeq = 0;
  lastAckedMessageSeq = 0;
  unacknowledgedByteCount = 0;
  saturated = !1;
  disposed = !1;
  degraded = !1;
  flushing = !1;
  outboundCallDepth = 0;
  assemblyTimer;
  onSaturated = this.saturatedEmitter.event;
  onDrained = this.drainedEmitter.event;
  onDegraded = this.degradedEmitter.event;
  protocol = {
    onMessage: this.onMessageEmitter.event,
    send: c((t) => this.reserveMessage(t.buffer), "send"),
    drain: c(() => Promise.resolve(), "drain"),
  };
  constructor(t) {
    ((this.identity = {
      bridgeSessionId: t.bridgeSessionId,
      ...(t.bridgeGeneration === void 0 ? {} : { bridgeGeneration: t.bridgeGeneration }),
      ...(t.recoveryId === void 0 ? {} : { recoveryId: t.recoveryId }),
    }),
      (this.sendFrame = t.sendFrame),
      (this.measureFrameBytes = t.measureFrameBytes ?? Ne));
    let r = resolveAcknowledgedRelayLimits(t);
    ((this.highWaterMarkBytes = r.highWaterMarkBytes),
      (this.lowWaterMarkBytes = r.lowWaterMarkBytes),
      (this.replayBufferMaxBytes = r.replayBufferMaxBytes),
      (this.assemblyTimeoutMs = r.assemblyTimeoutMs),
      (this.now = t.now ?? Date.now),
      (this.deadline = new O(
        r.replayBufferGraceMs,
        this.now,
        () => {
          let d = this.outboundBatches.oldest;
          return {
            oldestData: d ? { queuedAt: d.queuedAt, messageSeq: d.messageSeq } : null,
            pendingAck:
              this.pendingAckQueuedAt === null || this.pendingAckMessageSeq === null
                ? null
                : { queuedAt: this.pendingAckQueuedAt, messageSeq: this.pendingAckMessageSeq },
          };
        },
        (d) => this.enterDegraded(d),
      )),
      (this.assembler = this.createAssembler()));
  }
  get unacknowledgedBytes() {
    return this.unacknowledgedByteCount;
  }
  getBridgeSessionId() {
    return this.identity.bridgeSessionId;
  }
  isDegraded() {
    return this.degraded;
  }
  markDegraded(t = "remote.rpcFrame.manuallyDegraded") {
    this.enterDegraded({ reasonCode: t, terminal: !0 });
  }
  createAssembler() {
    return new $e({ identity: this.identity, timeoutMs: this.assemblyTimeoutMs, now: this.now });
  }
  reserveMessage(t) {
    if (this.disposed || this.degraded || this.deadline.check()) return;
    let r;
    try {
      r = Qe(t, {
        ...this.identity,
        firstPhysicalSeq: this.nextPhysicalSeq,
        messageSeq: this.nextMessageSeq,
      });
    } catch (b) {
      this.enterDegraded({
        reasonCode: b instanceof He ? b.reasonCode : "remote.rpcFrame.encodingFailed",
        terminal: !0,
      });
      return;
    }
    let d = 0;
    try {
      d = measureAcknowledgedRelayBatchBytes(r, this.measureFrameBytes);
    } catch {
      this.enterDegraded({ reasonCode: "remote.rpcFrame.outerMeterFailed", terminal: !0 });
      return;
    }
    if (this.unacknowledgedByteCount + d > this.replayBufferMaxBytes) {
      this.enterDegraded({
        reasonCode: "remote.rpcFrame.replayBufferExceeded",
        terminal: !0,
        messageSeq: this.nextMessageSeq,
      });
      return;
    }
    let p = this.nextMessageSeq,
      y = r.at(-1);
    (this.outboundBatches.append({
      messageSeq: p,
      frames: r,
      outerBytes: d,
      queuedAt: this.now(),
      nextFrameIndex: 0,
    }),
      (this.unacknowledgedByteCount += d),
      (this.nextMessageSeq += 1),
      (this.nextPhysicalSeq = y.seq + 1),
      this.updateSaturationAfterReserve(),
      this.deadline.refresh(),
      this.flushPendingFrames());
  }
  updateSaturationAfterReserve() {
    !this.saturated &&
      this.unacknowledgedByteCount > this.highWaterMarkBytes &&
      ((this.saturated = !0), this.saturatedEmitter.fire());
  }
  invokeSend(t) {
    this.outboundCallDepth += 1;
    try {
      return this.sendFrame(t) !== !1;
    } catch {
      return (this.enterDegraded({ reasonCode: "remote.rpcFrame.sendFailed", terminal: !0 }), !1);
    } finally {
      this.outboundCallDepth -= 1;
    }
  }
  flushPendingFrames() {
    if (this.disposed || this.degraded || this.deadline.check() || this.flushing) return !1;
    this.flushing = !0;
    let t = !0;
    try {
      for (; !this.disposed && !this.degraded;) {
        if (this.deadline.check()) {
          t = !1;
          break;
        }
        if (this.pendingAckMessageSeq !== null) {
          let y = this.pendingAckMessageSeq;
          if (
            !this.invokeSend({ zcode_type: "rpc-frame-ack", ...this.identity, ackMessageSeq: y }) ||
            this.degraded ||
            this.disposed
          ) {
            t = !1;
            break;
          }
          (this.pendingAckMessageSeq === y &&
            ((this.pendingAckMessageSeq = null),
            (this.pendingAckQueuedAt = null),
            this.deadline.refresh()),
            this.drainQueuedInbound());
          continue;
        }
        let r = this.outboundBatches.nextUnsent;
        if (!r) break;
        let d = r.frames[r.nextFrameIndex];
        if (!this.invokeSend(d) || this.degraded || this.disposed) {
          t = !1;
          break;
        }
        ((r.nextFrameIndex += 1),
          r.nextFrameIndex === r.frames.length &&
            ((this.highestFullySentMessageSeq = Math.max(
              this.highestFullySentMessageSeq,
              r.messageSeq,
            )),
            this.outboundBatches.advanceUnsent()),
          this.drainQueuedInbound());
      }
    } finally {
      this.flushing = !1;
    }
    return (
      !this.disposed && !this.degraded && this.drainQueuedInbound(),
      t && this.pendingAckMessageSeq === null
    );
  }
  replayUnacknowledged() {
    return this.disposed || this.degraded || this.deadline.check()
      ? !1
      : (this.outboundBatches.resetReplay(), this.flushPendingFrames());
  }
  acceptPayload(t) {
    return this.disposed ||
      this.degraded ||
      !isRawTransportCandidate(t) ||
      !rawIdentityMatches(this.identity, t)
      ? !1
      : this.deadline.check()
        ? !0
        : this.outboundCallDepth > 0
          ? (this.queuedInbound.push(t), !0)
          : (this.processInbound(t), !0);
  }
  drainQueuedInbound() {
    if (!(this.outboundCallDepth > 0 || this.disposed || this.degraded))
      for (; this.queuedInbound.length > 0 && !this.disposed && !this.degraded;)
        this.processInbound(this.queuedInbound.shift());
  }
  processInbound(t) {
    let r = Ke(t);
    if (!r) {
      this.enterDegraded({ reasonCode: "remote.rpcFrame.invalidPayload", terminal: !0 });
      return;
    }
    if (r.zcode_type === "rpc-frame-ack") {
      this.processAck(r.ackMessageSeq);
      return;
    }
    let d = this.assembler?.accept(r, this.now());
    if (d) {
      if (d.kind === "fault") {
        d.fault.terminal && this.enterDegraded(d.fault);
        return;
      }
      if (d.kind === "incomplete") {
        this.scheduleAssemblyTimer();
        return;
      }
      if (d.kind === "duplicate") {
        d.ackMessageSeq !== null && this.queueAck(d.ackMessageSeq);
        return;
      }
      this.clearAssemblyTimer();
      try {
        this.onMessageEmitter.fire(M.wrap(d.bytes));
      } catch {
        this.enterDegraded({
          reasonCode: "remote.rpcFrame.deliveryFailed",
          terminal: !0,
          messageSeq: d.messageSeq,
        });
        return;
      }
      this.queueAck(d.messageSeq);
    }
  }
  queueAck(t) {
    this.disposed ||
      this.degraded ||
      (this.pendingAckMessageSeq === null
        ? ((this.pendingAckMessageSeq = t),
          (this.pendingAckQueuedAt = this.now()),
          this.deadline.refresh())
        : t > this.pendingAckMessageSeq && (this.pendingAckMessageSeq = t),
      this.flushPendingFrames());
  }
  processAck(t) {
    if (t <= this.lastAckedMessageSeq) return;
    if (t > this.highestFullySentMessageSeq) {
      this.enterDegraded({ reasonCode: "remote.rpcFrame.futureAck", terminal: !0, messageSeq: t });
      return;
    }
    let { releasedBytes: r } = this.outboundBatches.releaseThrough(t);
    ((this.unacknowledgedByteCount = Math.max(0, this.unacknowledgedByteCount - r)),
      (this.lastAckedMessageSeq = t),
      this.deadline.refresh(),
      this.saturated &&
        this.unacknowledgedByteCount <= this.lowWaterMarkBytes &&
        ((this.saturated = !1), this.drainedEmitter.fire()));
  }
  scheduleAssemblyTimer() {
    if (this.assemblyTimer || !this.assembler?.nextExpiryAt) return;
    let t = this.assembler.nextExpiryAt;
    this.assemblyTimer = setTimeout(
      () => {
        this.assemblyTimer = void 0;
        let r = this.assembler?.expire(this.now());
        r?.kind === "fault" && this.enterDegraded(r.fault);
      },
      Math.max(0, t - this.now()),
    );
  }
  clearAssemblyTimer() {
    (this.assemblyTimer && clearTimeout(this.assemblyTimer), (this.assemblyTimer = void 0));
  }
  enterDegraded(t) {
    this.disposed ||
      this.degraded ||
      ((this.degraded = !0),
      this.deadline.dispose(),
      this.clearAssemblyTimer(),
      this.outboundBatches.clear(),
      (this.queuedInbound = []),
      (this.pendingAckMessageSeq = null),
      (this.pendingAckQueuedAt = null),
      (this.unacknowledgedByteCount = 0),
      (this.saturated = !1),
      (this.assembler = null),
      this.degradedEmitter.fire(t));
  }
  dispose() {
    this.disposed ||
      ((this.disposed = !0),
      this.deadline.dispose(),
      this.clearAssemblyTimer(),
      this.outboundBatches.clear(),
      (this.queuedInbound = []),
      (this.pendingAckMessageSeq = null),
      (this.pendingAckQueuedAt = null),
      (this.unacknowledgedByteCount = 0),
      (this.assembler = null),
      this.onMessageEmitter.dispose(),
      this.saturatedEmitter.dispose(),
      this.drainedEmitter.dispose(),
      this.degradedEmitter.dispose());
  }
};
function createAcknowledgedWebRemoteControlRelayProtocol(o) {
  return new Oe(o);
}
c(
  createAcknowledgedWebRemoteControlRelayProtocol,
  "createAcknowledgedWebRemoteControlRelayProtocol",
);
var vt = class {
  static {
    c(this, "WebRemoteControlRelayPayloadSerializer");
  }
  cache = new WeakMap();
  prepare(t, r = Date.now()) {
    let d = this.cache.get(t);
    if (d) return d;
    let p = { type: "data", payload: t, client_ts: r },
      y = JSON.stringify(p),
      b = Object.freeze({ message: p, json: y, bytes: new TextEncoder().encode(y).byteLength });
    return (this.cache.set(t, b), b);
  }
  isOversize(t) {
    return t.bytes > x.maxPhysicalFrameBytes;
  }
};
export { w as a, createAcknowledgedWebRemoteControlRelayProtocol as b, vt as c };
