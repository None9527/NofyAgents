import {
  Ob as M,
  Pb as F,
  Qb as C,
  Ra as _t,
  Rb as Nt,
  Sb as y,
  Sc as p,
  Ta as re,
  Tb as Kt,
  Ub as ne,
  Vb as ke,
  Wb as be,
  g as e,
  ib as Gt,
  k as qt,
  l as jt,
  p as Lt,
  q as Pe,
  r as Ut,
  s as zt,
  u as Vt,
} from "./chunk-O5YHTQBW.js";
import { a, c as Se, d as J, i as ve, j as h } from "./chunk-LVLFJXEE.js";
function m(r) {
  return { channelName: r };
}
a(m, "createServiceDescriptor");
var Re = m(p.Setting);
var Ie = m(p.Credential);
var xe = m(p.ZCodeTask);
var Bo = "ZCODE_AGENT_RUNTIME_UNAVAILABLE",
  Ae = m(p.ZCodeAgent);
var E = {
    rowId: e.number(),
    turnId: e.string(),
    entityId: e.string().min(1).optional(),
    productTurnId: e.string().min(1).optional(),
    visibility: e.literal("visible").optional(),
    createdAt: C,
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
  Nn = E.actions,
  Eo = e.object({
    backgroundSource: e.enum(["bash", "subagent"]),
    workId: e.string().min(1),
    title: e.string().min(1),
  }),
  Oo = e.object({
    segmentId: e.string().min(1),
    triggerEntityId: e.string().min(1).optional(),
    startedAt: C,
    endedAt: C.optional(),
    activeMs: e.number().nonnegative().optional(),
  }),
  Do = e.object({
    ...E,
    kind: e.literal("turnHeader"),
    origin: e.enum(["userInput", "backgroundResult", "goalContinuation", "editRerun"]),
    executionKind: e.enum(["agent", "controlOnly"]).optional(),
    sourceCommandId: e.string().optional(),
    historyRoundCount: e.number().int().nonnegative().optional(),
    state: e.enum(["running", "completedSuccess", "completedInterrupted", "failed"]),
    startedAt: C,
    endedAt: C.optional(),
    activeMs: e.number().optional(),
    workSegments: e.array(Oo).optional(),
    originMeta: Eo.optional(),
    fileChanges: e
      .object({
        additions: e.number(),
        deletions: e.number(),
        files: e.number(),
        state: e.enum(["active", "reverted"]).optional(),
      })
      .optional(),
  }),
  qo = e.object({
    ...E,
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
  jo = e.object({
    ...E,
    kind: e.literal("assistantText"),
    text: e.string(),
    state: e.enum(["streaming", "complete", "interrupted", "failed"]),
    model: e.string().optional(),
    feedback: e.enum(["like", "dislike"]).optional(),
  }),
  Lo = e.object({
    ...E,
    kind: e.literal("reasoning"),
    text: e.string(),
    state: e.enum(["streaming", "complete", "interrupted"]),
    durationMs: e.number().optional(),
  }),
  Uo = e.object({
    text: e.string(),
    truncated: e.object({ totalBytes: e.number(), ref: e.string() }).optional(),
  }),
  zo = e.object({ bytes: e.number(), previewLine: e.string().optional(), updatedAt: C }),
  Vo = e
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
  _o = e
    .object({
      kind: e.literal("task_output"),
      retrievalStatus: e.enum(["success", "not_ready", "timeout"]),
      taskStatus: e.string().min(1).max(64).optional(),
      output: e.string().min(1).max(2e3).optional(),
      truncated: e.literal(!0).optional(),
    })
    .strict(),
  Go = e
    .object({ kind: e.literal("respond_to_coordinator"), status: e.enum(["success", "failed"]) })
    .strict(),
  No = e
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
  Ko = e.discriminatedUnion("kind", [Vo, _o, Go, No]),
  Te = e.object({
    ...E,
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
    output: Uo.optional(),
    display: Ko.optional(),
    error: e.object({ code: e.string(), message: e.string() }).optional(),
    progress: zo.optional(),
    approvalInteractionId: e.string().optional(),
    backgrounded: e.literal(!0).optional(),
    workId: e.string().optional(),
    startedAt: C.optional(),
    endedAt: C.optional(),
  }),
  Ho = e.object({
    ...E,
    kind: e.literal("subagent"),
    parentToolCallId: e.string().optional(),
    subagentType: e.string(),
    status: e.enum(["running", "success", "failed", "cancelled"]),
    summaryText: e.string(),
    childSessionId: e.string().optional(),
    backgrounded: e.literal(!0).optional(),
    workId: e.string().optional(),
    startedAt: C.optional(),
    endedAt: C.optional(),
  }),
  Qo = e.union([
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
  $o = e.enum(["assistantWork", "turnTailBoundary", "lightBoundary"]),
  Jo = e.object({
    ...E,
    kind: e.literal("timelineMarker"),
    sourceCommandId: e.string().optional(),
    lane: $o.optional(),
    marker: Qo,
  }),
  L = e.discriminatedUnion("kind", [Do, qo, jo, Lo, Te, Ho, Jo]);
var G = e
  .object({
    ref: e.string(),
    fileName: e.string(),
    mime: e.string(),
    bytes: e.number(),
    previewRef: e.string().optional(),
  })
  .strict();
var Yo = e
    .object({
      requested: e.enum(["auto", "startNow", "queue", "guide"]),
      admitted: e.enum(["startNow", "queue", "guide"]),
      fallbackReasonCode: e.string().optional(),
    })
    .strict(),
  Xo = e
    .object({
      admissionSeq: e.number().int().nonnegative(),
      queuePosition: e.number().int().nonnegative().optional(),
    })
    .strict(),
  er = e
    .object({
      state: e.enum(["notRequested", "submitting", "steering", "guided", "fellBack"]),
      reasonCode: e.string().optional(),
    })
    .strict(),
  we = e
    .object({
      state: e.enum(["admitted", "queued", "reserved", "promoting", "drained"]),
      reservationId: e.string().optional(),
    })
    .strict(),
  Ht = e
    .object({
      sourceCommandId: e.string().min(1),
      queueItemId: e.string().min(1),
      clientId: e.string().min(1),
      kind: e.enum(["sendText", "sendGoalCommand", "compact"]),
      text: e.string(),
      attachments: e.array(G).default([]),
      delivery: Yo,
      order: Xo,
      steer: er,
      dispatch: we,
      admittedAt: C,
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
var Ze = e.enum([
    "draft",
    "prewarming",
    "running",
    "completedSuccess",
    "completedInterrupted",
    "error",
  ]),
  tr = e.enum([
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
  or = e.object({
    kind: e.enum([
      "primaryTurn",
      "foregroundSubagent",
      "compact",
      "goalVerifier",
      "goalContinuation",
      "turnSteer",
    ]),
    foregroundExecutionId: e.string().min(1).optional(),
    startedAt: C,
  }),
  rr = e
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
  nr = e.object({
    code: e.string(),
    message: e.string(),
    recoverable: e.boolean(),
    at: C,
    source: e.enum(["provider", "runtime", "tool", "network"]),
    traceId: e.string().optional(),
    detail: e.string().optional(),
    attribution: rr.optional(),
  }),
  sr = e.object({
    attempt: e.number(),
    maxAttempts: e.number(),
    nextRetryAt: C,
    reasonCode: e.string(),
  }),
  Me = e.object({
    phase: Ze,
    sessionEnded: e.boolean(),
    canStop: e.boolean(),
    stopState: e.enum(["idle", "stoppable", "stopping"]),
    stopTargetKind: tr,
    activeWorks: e.array(or),
    lastError: nr.nullable(),
    apiRetry: sr.nullable(),
  }),
  O = e.discriminatedUnion("allowed", [
    e.object({ allowed: e.literal(!0) }),
    e.object({ allowed: e.literal(!1), reasonCode: e.string() }),
  ]),
  Fe = e.object({
    fork: O,
    compact: O,
    switchModelConfig: O,
    setFollowupMode: O,
    queueEdit: O,
    sendQueuedNow: O,
    pauseGoal: O,
    resumeGoal: O,
  }),
  We = e.object({
    mode: e.enum(["startNow", "enqueue", "guide", "reject", "choice"]),
    reasonCode: e.string().optional(),
  }),
  Be = e.object({
    provider: e.string(),
    model: e.string(),
    thought: e.string(),
    thoughtLevels: e.array(e.string()).default([]),
    followupMode: e.enum(["queue", "guide"]),
    mode: e.string().default("build"),
  }),
  Ee = e.object({
    eventId: e.string().min(1),
    origin: e.literal("registryFallback"),
    from: e.object({ provider: e.string(), model: e.string() }),
    to: e.object({ provider: e.string(), model: e.string() }),
  }),
  Y = e.object({ title: e.string(), titleSource: e.enum(["default", "generated", "custom"]) }),
  Oe = e.object({
    contextWindow: e
      .object({
        usedTokens: e.number(),
        maxTokens: e.number(),
        autoCompactThresholdTokens: e.number().nullable(),
        cache: Ut.optional(),
        breakdown: zt.optional(),
      })
      .nullable(),
    cumulative: e.object({
      inputTokens: e.number(),
      outputTokens: e.number(),
      cacheReadTokens: e.number(),
      cacheWriteTokens: e.number(),
    }),
  }),
  ir = Ht.extend({
    dispatch: we.extend({ state: e.enum(["queued", "reserved", "promoting"]) }),
    toolDisallowlist: e.array(e.string().min(1)).optional(),
  }),
  De = e.object({
    items: e.array(ir),
    autoDrain: e.boolean(),
    pauseReason: e.enum(["stopped", "manual"]).optional(),
  }),
  ar = e.object({
    kind: e.literal("permission"),
    toolCallId: e.string(),
    toolName: e.string(),
    summary: e.string(),
    detail: e.unknown(),
    origin: Pe.optional(),
    options: e.array(
      e.object({
        optionId: e.string(),
        label: e.string(),
        kind: e.enum(["allowOnce", "allowAlways", "deny", "custom"]),
        response: Lt.optional(),
      }),
    ),
  }),
  dr = e.object({
    value: e.string(),
    label: e.string(),
    description: e.string().optional(),
    preview: e.string().optional(),
  }),
  cr = e.object({
    question: e.string(),
    header: e.string(),
    options: e.array(dr),
    multiSelect: e.boolean().optional(),
  }),
  lr = e.object({
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
    questions: e.array(cr).optional(),
    currentQuestionIndex: e.number().optional(),
    answerDrafts: e.record(e.string(), e.array(e.string())).optional(),
    origin: Pe.optional(),
  }),
  qe = e.discriminatedUnion("state", [
    e.object({
      state: e.enum(["hiddenGrace", "visibleCountdown"]),
      startedAt: C,
      visibleAt: C,
      deadlineAt: C,
    }),
    e.object({ state: e.literal("snoozed"), startedAt: C, snoozedAt: C }),
  ]),
  je = e.object({
    interactionId: e.string(),
    kind: e.enum(["permission", "userInput"]),
    anchorRowId: e.number().nullable(),
    createdAt: C,
    autoResolution: qe.optional(),
    payload: e.discriminatedUnion("kind", [ar, lr]),
  }),
  Le = e.object({
    commandId: e.string(),
    clientId: e.string(),
    type: e.string(),
    state: e.enum(["accepted", "executing"]),
    at: C,
  }),
  Ue = e.object({
    workId: e.string(),
    kind: e.enum(["bash", "subagent"]),
    title: e.string(),
    status: e.enum(["running", "resultPending", "failed", "cancelled"]),
    startedAt: C,
    endedAt: C.optional(),
    cancellable: e.boolean().optional(),
    blocked: e.boolean().optional(),
    anchorRowId: e.number().nullable(),
    childSessionId: e.string().optional(),
  }),
  mr = e.object({
    childSessionId: e.string(),
    agentId: e.string().optional(),
    toolCallId: e.string().optional(),
    subagentType: e.string(),
    title: e.string(),
    summary: e.string().optional(),
    status: e.enum(["running", "waiting", "blocked"]),
    startedAt: C.optional(),
  }),
  ze = e.object({
    revision: e.number().int().nonnegative(),
    childSessionIds: e.array(e.string()),
    running: e.array(mr),
    endedTotal: e.number().int().nonnegative(),
  }),
  Qt = e.object({
    id: e.string(),
    content: e.string(),
    status: e.enum(["pending", "inProgress", "completed"]),
  }),
  pr = e.object({ iteration: e.number().int().positive(), items: e.array(Qt), updatedAt: C }),
  X = e.object({
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
        at: C,
        anchorRowId: e.number().nullable(),
        reason: e.string().optional(),
        nextAction: e.string().optional(),
      }),
    ),
    iterations: e.array(pr).default([]),
  }),
  Ve = e.object({ items: e.array(Qt), updatedAt: C }),
  ur = e.object({ window: e.array(L), totalCount: e.number(), firstRowId: e.number().nullable() }),
  $t = e.object({
    protocolVersion: e.literal(1),
    sessionId: e.string(),
    logEpoch: e.string(),
    seq: e.number(),
    revision: e.number(),
    control: Me,
    availability: Fe,
    inputRouting: We,
    meta: Y.default({ title: "", titleSource: "default" }),
    config: Be,
    modelTransition: Ee.nullable().default(null),
    usage: Oe,
    queue: De,
    pendingInteractions: e.array(je),
    pendingCommands: e.array(Le),
    backgroundWorks: e.array(Ue),
    subagents: ze.optional(),
    goal: X.nullable(),
    plan: Ve.nullable(),
    rows: ur,
  });
var gr = e.object({
    revision: e.number().optional(),
    control: Me.optional(),
    availability: Fe.optional(),
    inputRouting: We.optional(),
    meta: Y.optional(),
    config: Be.optional(),
    modelTransition: Ee.nullable().optional(),
    usage: Oe.optional(),
    queue: De.optional(),
    pendingInteractions: e.array(je).optional(),
    pendingCommands: e.array(Le).optional(),
    backgroundWorks: e.array(Ue).optional(),
    subagents: ze.optional(),
    goal: X.nullable().optional(),
    plan: Ve.nullable().optional(),
  }),
  Jt = e.discriminatedUnion("op", [
    e.object({ op: e.literal("row.appended"), row: L }),
    e.object({ op: e.literal("row.upserted"), row: L }),
    e.object({ op: e.literal("row.removed"), fromRowId: e.number() }),
    e.object({ op: e.literal("row.delta"), rowId: e.number(), path: Nt, append: e.string() }),
    e.object({ op: e.literal("state.updated"), patch: gr }),
  ]);
var fr = e.object({
    interactionId: e.string(),
    kind: e.enum(["permission", "userInput"]),
    toolName: e.string().optional(),
    autoResolution: qe.optional(),
  }),
  Cr = e.object({
    permissionCount: e.number().int().nonnegative(),
    userInputCount: e.number().int().nonnegative(),
  }),
  hr = e.object({ queryId: e.string().min(1), historyRoundCount: e.number().int().nonnegative() }),
  Yt = e.object({
    sessionId: e.string(),
    workspaceId: e.string(),
    parentSessionId: e.string().optional(),
    title: e.string(),
    titleSource: Y.shape.titleSource.optional(),
    phase: Ze,
    sessionEnded: e.boolean(),
    hasBackgroundWork: e.boolean(),
    pendingInteraction: fr.optional(),
    pendingInteractionSummary: Cr.optional(),
    goalStatus: X.shape.status.optional(),
    lastActivityAt: C,
    lastAssistantPreview: e.string().optional(),
    lastTerminalQuery: hr.optional(),
    createdAt: C,
  }),
  Xt = e.object({
    protocolVersion: e.literal(1),
    workspaceId: e.string(),
    logEpoch: e.string(),
    sessions: e.array(Yt),
  }),
  eo = e.discriminatedUnion("op", [
    e.object({ op: e.literal("session.upserted"), session: Yt }),
    e.object({ op: e.literal("session.removed"), sessionId: e.string() }),
  ]);
function to(r) {
  return `sessions-index/${r}`;
}
a(to, "sessionsIndexTopic");
var yr = e.object({
    value: e.string(),
    name: e.string(),
    description: e.string().optional(),
    origin: e.enum(["native", "injected"]).optional(),
    modelProviderId: e.string().optional(),
    modelProviderName: e.string().optional(),
    modelThoughtLevels: e.array(e.string()).optional(),
    modelDefaultThoughtLevel: e.string().optional(),
  }),
  Sr = e.object({
    id: e.string(),
    name: e.string(),
    description: e.string().optional(),
    category: e.string().optional(),
    type: e.enum(["select", "boolean"]),
    currentValue: e.union([e.string(), e.boolean()]),
    options: e.array(yr).optional(),
  }),
  vr = e.object({
    name: e.string(),
    description: e.string(),
    inputHint: e.string().optional(),
    source: e.enum(["builtin", "custom"]).optional(),
  }),
  oo = e.object({ configOptions: e.array(Sr), slashCommands: e.array(vr) }),
  ro = e.object({
    protocolVersion: e.literal(1),
    workspaceId: e.string(),
    logEpoch: e.string(),
    config: oo,
  }),
  no = e.discriminatedUnion("op", [e.object({ op: e.literal("config.updated"), config: oo })]);
function so(r) {
  return `workspace-config/${r}`;
}
a(so, "workspaceConfigTopic");
var Pr = e
    .object({ algorithm: e.literal("crc32"), value: e.string().regex(/^[0-9a-f]{8}$/u) })
    .strict(),
  io = e.enum(["initial", "online", "recovery"]),
  se = e.discriminatedUnion("kind", [
    e
      .object({
        wireVersion: e.literal(M),
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
        wireVersion: e.literal(M),
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
function ie(r) {
  return e
    .discriminatedUnion("kind", [
      e
        .object({
          wireVersion: e.literal(M),
          kind: e.literal("complete"),
          deliveryKind: io,
          logicalFrameId: e.string().min(1),
          logicalFrameOrdinal: e.number().int().positive().max(Number.MAX_SAFE_INTEGER),
          topic: e.string().min(1),
          subscriptionId: e.string().min(1),
          frame: r,
        })
        .strict(),
      e
        .object({
          wireVersion: e.literal(M),
          kind: e.literal("fragment"),
          deliveryKind: io,
          logicalFrameId: e.string().min(1),
          logicalFrameOrdinal: e.number().int().positive().max(Number.MAX_SAFE_INTEGER),
          topic: e.string().min(1),
          subscriptionId: e.string().min(1),
          fragmentIndex: e.number().int().nonnegative(),
          fragmentCount: e.number().int().positive().max(y.logicalFrameAssemblyMaxFragments),
          logicalBytes: e.number().int().positive(),
          checksum: Pr,
          dataBase64: Kt,
        })
        .strict(),
    ])
    .superRefine((t, i) => {
      let s = t;
      if (s.kind === "fragment") {
        (s.fragmentIndex >= s.fragmentCount &&
          i.addIssue({
            code: "custom",
            message: "fragmentIndex must be smaller than fragmentCount",
            path: ["fragmentIndex"],
          }),
          s.fragmentCount > s.logicalBytes &&
            i.addIssue({
              code: "custom",
              message: "fragmentCount cannot exceed logicalBytes",
              path: ["fragmentCount"],
            }));
        return;
      }
      let c = s.frame;
      (c.topic !== s.topic &&
        i.addIssue({
          code: "custom",
          message: "complete wire topic must match logical frame topic",
          path: ["topic"],
        }),
        c.subscriptionId !== s.subscriptionId &&
          i.addIssue({
            code: "custom",
            message: "complete wire subscriptionId must match logical frame subscriptionId",
            path: ["subscriptionId"],
          }));
    });
}
a(ie, "createTopicWireFrameSchema");
var kr = e.object({
    nativeDialogs: e.boolean(),
    localTerminal: e.boolean(),
    binaryFrames: e.boolean(),
    compression: e.enum(["none", "permessage-deflate"]),
  }),
  $s = e
    .object({
      kind: e.literal("hello"),
      protocolVersion: e.literal(M),
      connectionId: e.string(),
      clientMode: e.enum(["desktop-continuous", "web-remote-replayable"]),
      deliveryProfile: e.enum(["continuous", "replayable"]),
      serverTime: C,
      capabilities: kr,
      auth: e.object({ userId: e.string().optional() }),
    })
    .strict()
    .superRefine((r, t) => {
      let i = r.clientMode === "desktop-continuous" ? "continuous" : "replayable";
      r.deliveryProfile !== i &&
        t.addIssue({
          code: "custom",
          message: "trusted clientMode and deliveryProfile must match",
          path: ["deliveryProfile"],
        });
    }),
  ao = e
    .object({
      kind: e.literal("clientHello"),
      protocolVersion: e.literal(M),
      clientId: e.string(),
      clientKind: e.enum(["desktop", "web", "mobileRemote", "mobileApp"]).optional(),
      appVersion: e.string(),
    })
    .strict(),
  br = e
    .object({
      topic: e.string(),
      base: e.object({ logEpoch: e.string(), seq: e.number() }).optional(),
      visibility: e.enum(["foreground", "background"]).optional(),
    })
    .strict(),
  ae = e.object({
    subscriptionId: e.string(),
    mode: e.enum(["snapshot", "resume"]),
    logEpoch: e.string(),
  });
function _e(r, t) {
  return e.object({
    topic: e.string(),
    subscriptionId: e.string(),
    fromSeq: e.number(),
    toSeq: e.number(),
    sentAt: C,
    payload: e.discriminatedUnion("kind", [
      e.object({ kind: e.literal("snapshot"), snapshot: r }),
      e.object({ kind: e.literal("deltas"), deltas: e.array(t) }),
    ]),
  });
}
a(_e, "createTopicFrameSchema");
var co = _e($t, Jt).superRefine((r, t) => {
    (!r.topic.startsWith("conversation/") || r.topic.length === 13) &&
      t.addIssue({ code: "custom", message: "invalid conversation topic", path: ["topic"] });
  }),
  Rr = ie(co).superRefine((r, t) => {
    (!r.topic.startsWith("conversation/") || r.topic.length === 13) &&
      t.addIssue({ code: "custom", message: "invalid conversation topic", path: ["topic"] });
  }),
  Ir = se.superRefine((r, t) => {
    (!r.topic.startsWith("conversation/") || r.topic.length === 13) &&
      t.addIssue({ code: "custom", message: "invalid conversation topic", path: ["topic"] });
  }),
  lo = _e(Xt, eo).superRefine((r, t) => {
    (!r.topic.startsWith("sessions-index/") || r.topic.length === 15) &&
      t.addIssue({ code: "custom", message: "invalid sessions-index topic", path: ["topic"] });
  }),
  xr = ie(lo).superRefine((r, t) => {
    (!r.topic.startsWith("sessions-index/") || r.topic.length === 15) &&
      t.addIssue({ code: "custom", message: "invalid sessions-index topic", path: ["topic"] });
  }),
  Ar = se.superRefine((r, t) => {
    (!r.topic.startsWith("sessions-index/") || r.topic.length === 15) &&
      t.addIssue({ code: "custom", message: "invalid sessions-index topic", path: ["topic"] });
  }),
  mo = _e(ro, no).superRefine((r, t) => {
    (!r.topic.startsWith("workspace-config/") || r.topic.length === 17) &&
      t.addIssue({ code: "custom", message: "invalid workspace-config topic", path: ["topic"] });
  }),
  Tr = ie(mo).superRefine((r, t) => {
    (!r.topic.startsWith("workspace-config/") || r.topic.length === 17) &&
      t.addIssue({ code: "custom", message: "invalid workspace-config topic", path: ["topic"] });
  }),
  wr = se.superRefine((r, t) => {
    (!r.topic.startsWith("workspace-config/") || r.topic.length === 17) &&
      t.addIssue({ code: "custom", message: "invalid workspace-config topic", path: ["topic"] });
  }),
  Js = e.union([co, lo, mo]),
  Ys = e.union([Rr, xr, Tr]),
  Xs = e.union([Ir, Ar, wr]),
  ei = {
    connectionFlow: "v4/connection/flow",
    conversationSubscribe: "v4/conversation/subscribe",
    conversationResync: "v4/conversation/resync",
    conversationUnsubscribe: "v4/conversation/unsubscribe",
    conversationRowsRange: "v4/conversation/rowsRange",
    conversationPlans: "v4/conversation/plans",
    conversationFileChanges: "v4/conversation/fileChanges",
    conversationFileRewindPreview: "v4/conversation/fileRewindPreview",
    usageStats: "v4/usage/stats",
    conversationUsage: "v4/conversation/usage",
    attachmentBegin: "v4/attachment/begin",
    attachmentChunk: "v4/attachment/chunk",
    attachmentCommit: "v4/attachment/commit",
    attachmentAbort: "v4/attachment/abort",
    attachmentRead: "v4/attachment/read",
    commandsQuery: "v4/commands/query",
    command: "v4/command",
  },
  Zr = e.enum(["saturated", "drained", "closed"]),
  ti = e.object({ connectionId: e.string().min(1), state: Zr }).strict(),
  oi = e.object({}).strict(),
  ri = {
    conversationFrame: "v4/conversation/frame",
    conversationTelemetryFact: "v4/telemetry/event",
  },
  Mr = 200,
  ni = br.extend({
    connectionId: e.string(),
    clientMode: e.enum(["desktop-continuous", "web-remote-replayable"]),
    legacyTaskIds: e.array(e.string().min(1)).max(Mr).optional(),
    resumeThoughtLevel: e.string().trim().min(1).optional(),
  }),
  si = e.object({ ack: ae }).strict(),
  ii = e.object({ ack: ae }).strict(),
  ai = e.object({ ack: ae }).strict(),
  Fr = e
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
  di = Fr.extend({
    topic: e.string().trim().min(1).max(2048),
    connectionId: e.string().trim().min(1).max(1024),
  }).strict(),
  ci = e.object({ ack: ae }).strict(),
  li = e
    .object({
      topic: e.string().trim().min(1).max(2048),
      subscriptionId: e.string().trim().min(1).max(1024),
      connectionId: e.string().trim().min(1).max(1024),
    })
    .strict(),
  mi = e.object({
    sessionId: e.string(),
    beforeRowId: e.number().optional(),
    limit: e.number().min(1).max(y.rowsRangeMaxLimit),
  }),
  pi = e.object({
    rows: e.array(L),
    atSeq: e.number(),
    atLogEpoch: e.string(),
    hasMore: e.boolean(),
  }),
  ui = e.object({ sessionId: e.string().min(1) }).strict(),
  gi = e
    .object({
      plans: e.array(Te),
      atSeq: e.number().int().nonnegative(),
      atLogEpoch: e.string().min(1),
    })
    .strict(),
  Wr = e
    .object({
      oldStart: e.number(),
      oldLines: e.number(),
      newStart: e.number(),
      newLines: e.number(),
      lines: e.array(e.string()),
    })
    .strict(),
  fi = e
    .object({
      sessionId: e.string().min(1),
      target: F,
      baseRevision: e.number().int().nonnegative(),
      baseLogEpoch: e.string().trim().min(1),
    })
    .strict(),
  Ci = e
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
            patches: e.array(Wr),
          })
          .strict(),
      ),
    })
    .strict(),
  hi = e
    .object({
      sessionId: e.string().min(1),
      target: F,
      baseRevision: e.number().int().nonnegative(),
      baseLogEpoch: e.string().trim().min(1),
    })
    .strict(),
  Br = e
    .object({
      action: e.enum(["restore", "delete"]),
      operationCount: e.number().int().nonnegative(),
      path: e.string().min(1),
      toolNames: e.array(e.string()),
    })
    .strict(),
  Er = e
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
  Or = e
    .object({
      operationCount: e.number().int().nonnegative(),
      path: e.string().min(1),
      reason: e.literal("bash_ignored"),
      toolNames: e.array(e.string()),
    })
    .strict(),
  Ge = e
    .object({
      canApply: e.boolean(),
      ignoredFiles: e.array(Or),
      safeFiles: e.array(Br),
      unsafeFiles: e.array(Er),
    })
    .strict(),
  yi = e.object({ range: e.enum(qt), timeZone: e.string().optional() }).strict(),
  Si = jt,
  vi = e.object({ sessionId: e.string().min(1) }).strict(),
  Pi = e
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
  ki = e
    .object({
      sessionId: e.string().min(1),
      fileName: e.string().min(1),
      mime: e.string().min(1),
      dataBase64: e.string().min(1),
    })
    .strict(),
  Dr = e.object({ ref: e.string().min(1) }),
  N = e
    .string()
    .min(1)
    .max(128)
    .regex(/^[A-Za-z0-9][A-Za-z0-9._:-]*$/),
  qr = e.string().regex(/^sha256:[0-9a-f]{64}$/),
  bi = e
    .object({
      connectionId: e.string().min(1),
      uploadId: N,
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
      totalBytes: e.number().int().min(0).max(y.attachmentMaxBytes),
      totalChunks: e.number().int().min(0).max(y.attachmentUploadMaxChunks),
      checksum: qr,
    })
    .strict()
    .superRefine((r, t) => {
      (r.totalBytes === 0) != (r.totalChunks === 0) &&
        t.addIssue({
          code: "custom",
          message: "zero-byte upload must declare zero chunks",
          path: ["totalChunks"],
        });
    }),
  Ri = e.discriminatedUnion("state", [
    e
      .object({
        uploadId: N,
        state: e.literal("staging"),
        nextChunkIndex: e.number().int().nonnegative(),
      })
      .strict(),
    e
      .object({
        uploadId: N,
        state: e.literal("committed"),
        nextChunkIndex: e.number().int().nonnegative(),
        ref: e.string().min(1),
      })
      .strict(),
  ]);
function po(r) {
  if (r.length === 0) return 0;
  if (r.length % 4 !== 0) return null;
  let t = r.endsWith("==") ? 2 : r.endsWith("=") ? 1 : 0,
    i = r.length - t;
  for (let s = 0; s < i; s += 1) {
    let c = r.charCodeAt(s);
    if (!(
      (c >= 65 && c <= 90) ||
      (c >= 97 && c <= 122) ||
      (c >= 48 && c <= 57) ||
      c === 43 ||
      c === 47
    ))
      return null;
  }
  for (let s = i; s < r.length; s += 1) if (r.charCodeAt(s) !== 61) return null;
  return (r.length / 4) * 3 - t;
}
a(po, "decodedBase64ByteLength");
var Ii = e
    .object({
      connectionId: e.string().min(1),
      uploadId: N,
      sessionId: e.string().min(1),
      chunkIndex: e.number().int().nonnegative(),
      dataBase64: e.string(),
    })
    .strict()
    .superRefine((r, t) => {
      let i = po(r.dataBase64);
      if (i === null) {
        t.addIssue({ code: "custom", message: "invalid base64", path: ["dataBase64"] });
        return;
      }
      i > y.attachmentChunkMaxBytes &&
        t.addIssue({
          code: "too_big",
          maximum: y.attachmentChunkMaxBytes,
          origin: "string",
          inclusive: !0,
          message: "attachment chunk exceeds decoded byte limit",
          path: ["dataBase64"],
        });
    }),
  xi = e.object({ uploadId: N, nextChunkIndex: e.number().int().nonnegative() }).strict(),
  Ai = e
    .object({ connectionId: e.string().min(1), uploadId: N, sessionId: e.string().min(1) })
    .strict();
var Ti = Dr.strict();
var wi = e.object({}).strict(),
  Zi = e
    .object({
      sessionId: e.string().min(1),
      ref: e.string().min(1),
      offset: e.number().int().nonnegative(),
      limit: e.number().int().positive().max(y.attachmentChunkMaxBytes),
    })
    .strict(),
  Mi = e
    .object({
      dataBase64: e.string(),
      mediaType: e.string().startsWith("image/"),
      totalBytes: e.number().int().nonnegative().max(y.attachmentMaxBytes),
      nextOffset: e.number().int().positive().nullable(),
    })
    .strict()
    .superRefine((r, t) => {
      let i = po(r.dataBase64);
      if (i === null) {
        t.addIssue({ code: "custom", message: "invalid base64", path: ["dataBase64"] });
        return;
      }
      (i > y.attachmentChunkMaxBytes &&
        t.addIssue({
          code: "too_big",
          maximum: y.attachmentChunkMaxBytes,
          origin: "string",
          inclusive: !0,
          message: "attachment read chunk exceeds decoded byte limit",
          path: ["dataBase64"],
        }),
        r.nextOffset !== null &&
          r.nextOffset > r.totalBytes &&
          t.addIssue({
            code: "custom",
            message: "nextOffset exceeds totalBytes",
            path: ["nextOffset"],
          }));
    });
function uo(r) {
  return `conversation/${r}`;
}
a(uo, "conversationTopic");
var jr = 204,
  Lr = 13;
function de(r) {
  let t = 1;
  for (let i = r >>> 7; i > 0; i >>>= 7) t += 1;
  return t;
}
a(de, "vqlByteLength");
function Ke(r) {
  let t = Ne({ method: "v4/conversation/frame", params: r }) + 1,
    i = Ne(r),
    s = String(Number.MAX_SAFE_INTEGER).length,
    c = 1 + de(s) + s,
    I = 1 + de(2) + 1 + de(jr) + c + 1 + de(i) + i,
    v = I + Lr,
    P = 4 * Math.ceil(I / 3),
    g = "x".repeat(y.transportEnvelopeIdMaxChars),
    T =
      Ne({
        type: "data",
        payload: {
          zcode_type: "rpc-frame",
          bridgeSessionId: g,
          bridgeGeneration: Number.MAX_SAFE_INTEGER,
          recoveryId: g,
          seq: Number.MAX_SAFE_INTEGER,
          dataBase64: "",
        },
        client_ts: Number.MAX_SAFE_INTEGER,
        server_ts: Number.MAX_SAFE_INTEGER,
      }) + P;
  return {
    cliNdjsonBytes: t,
    channelSocketBytes: v,
    mobileRelayBytes: T,
    maxBytes: Math.max(t, v, T),
  };
}
a(Ke, "measureTopicNotificationEnvelopeBytes");
function Ne(r) {
  return new TextEncoder().encode(JSON.stringify(r)).byteLength;
}
a(Ne, "utf8JsonByteLength");
var Ur = new Set([
    "wireVersion",
    "kind",
    "deliveryKind",
    "logicalFrameId",
    "logicalFrameOrdinal",
    "topic",
    "subscriptionId",
    "frame",
  ]),
  zr = new Set([
    "wireVersion",
    "kind",
    "deliveryKind",
    "logicalFrameId",
    "logicalFrameOrdinal",
    "topic",
    "subscriptionId",
    "fragmentIndex",
    "fragmentCount",
    "logicalBytes",
    "checksum",
    "dataBase64",
  ]),
  Vr = new Set(["algorithm", "value"]);
function Qe(r, t) {
  return Object.keys(r).every((i) => t.has(i));
}
a(Qe, "hasOnlyKeys");
function go(r) {
  return r === "initial" || r === "online" || r === "recovery" ? r : null;
}
a(go, "parseDeliveryKind");
function _r(r) {
  if (
    !Qe(r, zr) ||
    typeof r.fragmentIndex != "number" ||
    typeof r.fragmentCount != "number" ||
    typeof r.logicalBytes != "number" ||
    typeof r.dataBase64 != "string" ||
    typeof r.checksum != "object" ||
    r.checksum === null ||
    Array.isArray(r.checksum) ||
    !Qe(r.checksum, Vr)
  )
    return !1;
  let t = r.checksum;
  return typeof t.algorithm == "string" && typeof t.value == "string";
}
a(_r, "hasValidFragmentInner");
function He(r, t) {
  return `${r}\0${t}`;
}
a(He, "routeKey");
function Gr(r, t) {
  if (r.byteLength !== t.byteLength) return !1;
  for (let i = 0; i < r.byteLength; i += 1) if (r[i] !== t[i]) return !1;
  return !0;
}
a(Gr, "bytesEqual");
function fo(r, t) {
  if (typeof r != "object" || r === null) return !1;
  let i = r;
  return i.topic === t.topic && i.subscriptionId === t.subscriptionId;
}
a(fo, "frameMatchesEnvelope");
function K(r, t, i) {
  let s = r ?? t;
  if (!Number.isFinite(s) || s <= 0) throw new RangeError(`${i} must be a positive finite number`);
  return Math.min(Math.floor(s), t);
}
a(K, "hardBound");
var Co = class {
  constructor(t, i = {}) {
    this.frameSchema = t;
    ((this.maxAssemblyBytes = K(
      i.maxAssemblyBytes,
      y.logicalFrameAssemblyMaxBytes,
      "maxAssemblyBytes",
    )),
      (this.maxFragments = K(i.maxFragments, y.logicalFrameAssemblyMaxFragments, "maxFragments")),
      (this.maxConcurrentAssemblies = K(
        i.maxConcurrentAssemblies,
        y.logicalFrameAssemblyMaxConcurrent,
        "maxConcurrentAssemblies",
      )),
      (this.maxStagedDecodedBytes = K(
        i.maxStagedDecodedBytes,
        y.logicalFrameAssemblyMaxStagedBytes,
        "maxStagedDecodedBytes",
      )),
      (this.timeoutMs = K(i.timeoutMs, y.logicalFrameAssemblyTimeoutMs, "timeoutMs")),
      (this.maxPhysicalFrameBytes = K(
        i.maxPhysicalFrameBytes,
        y.maxFrameBytes,
        "maxPhysicalFrameBytes",
      )));
  }
  frameSchema;
  static {
    a(this, "TopicWireFrameAssembler");
  }
  assemblies = new Map();
  settledByRoute = new Map();
  stagedDecodedBytes = 0;
  maxAssemblyBytes;
  maxFragments;
  maxConcurrentAssemblies;
  maxStagedDecodedBytes;
  timeoutMs;
  maxPhysicalFrameBytes;
  accept(t, i = Date.now()) {
    let s = this.expire(i),
      c = He(t.topic, t.subscriptionId);
    if (!Number.isSafeInteger(t.logicalFrameOrdinal) || t.logicalFrameOrdinal < 1)
      return (s.push(this.fault(t, "proto.frameAssemblyMetadataMismatch")), s);
    let R = this.settledByRoute.get(c);
    if (R) {
      if (t.logicalFrameOrdinal < R.logicalFrameOrdinal) return s;
      if (t.logicalFrameOrdinal === R.logicalFrameOrdinal)
        return (
          t.logicalFrameId !== R.logicalFrameId &&
            s.push(this.fault(t, "proto.frameAssemblyOrdinalConflict")),
          s
        );
    }
    let I = go(t.deliveryKind);
    if (I === "recovery")
      for (let S = s.length - 1; S >= 0; S -= 1) {
        let w = s[S];
        w?.kind === "fault" &&
          w.fault.topic === t.topic &&
          w.fault.subscriptionId === t.subscriptionId &&
          w.fault.logicalFrameOrdinal < t.logicalFrameOrdinal &&
          s.splice(S, 1);
      }
    let v = this.assemblies.get(c);
    if (v) {
      if (t.logicalFrameOrdinal < v.logicalFrameOrdinal) return s;
      if (t.logicalFrameOrdinal === v.logicalFrameOrdinal) {
        if (t.logicalFrameId !== v.logicalFrameId)
          return (
            this.release(c, v),
            this.settle(c, v),
            s.push(this.fault(t, "proto.frameAssemblyOrdinalConflict")),
            s
          );
      } else
        (this.release(c, v),
          this.settle(c, v),
          I !== "recovery" && s.push(this.fault(v, "proto.frameAssemblySuperseded")));
    }
    if (I === null)
      return (
        this.releaseAndSettle(c, t),
        s.push(this.fault(t, "proto.frameAssemblyMetadataMismatch")),
        s
      );
    if (t.kind === "complete") {
      if (!Qe(t, Ur) || !Object.prototype.hasOwnProperty.call(t, "frame"))
        return (
          this.releaseAndSettle(c, t),
          s.push(this.fault(t, "proto.frameAssemblyMetadataMismatch")),
          s
        );
      if (Ke(t).maxBytes > this.maxPhysicalFrameBytes)
        return (
          this.releaseAndSettle(c, t),
          s.push(this.fault(t, "proto.frameEnvelopeTooLarge")),
          s
        );
      let S = this.assemblies.get(c);
      if (S)
        return (
          this.release(c, S),
          this.settle(c, S),
          s.push(this.fault(S, "proto.frameAssemblyMetadataMismatch")),
          s
        );
      if (new TextEncoder().encode(JSON.stringify(t.frame)).byteLength > this.maxAssemblyBytes)
        return (this.settle(c, t), s.push(this.fault(t, "proto.frameAssemblyTooLarge")), s);
      if (!fo(t.frame, t))
        return (this.settle(c, t), s.push(this.fault(t, "proto.frameAssemblyMetadataMismatch")), s);
      let x = this.frameSchema.safeParse(t.frame);
      return x.success
        ? (this.settle(c, t), s.push({ kind: "complete", frame: x.data, deliveryKind: I }), s)
        : (this.settle(c, t), s.push(this.fault(t, "proto.frameAssemblyInvalidPayload")), s);
    }
    if (!_r(t))
      return (
        this.releaseAndSettle(c, t),
        s.push(this.fault(t, "proto.frameAssemblyMetadataMismatch")),
        s
      );
    if (Ke(t).maxBytes > this.maxPhysicalFrameBytes)
      return (this.releaseAndSettle(c, t), s.push(this.fault(t, "proto.frameEnvelopeTooLarge")), s);
    if (t.fragmentCount > this.maxFragments)
      return (
        this.releaseAndSettle(c, t),
        s.push(this.fault(t, "proto.frameFragmentCountExceeded")),
        s
      );
    if (t.logicalBytes > this.maxAssemblyBytes)
      return (this.releaseAndSettle(c, t), s.push(this.fault(t, "proto.frameAssemblyTooLarge")), s);
    if (
      !Number.isInteger(t.fragmentCount) ||
      t.fragmentCount < 1 ||
      !Number.isInteger(t.fragmentIndex) ||
      t.fragmentIndex < 0 ||
      t.fragmentIndex >= t.fragmentCount ||
      !Number.isInteger(t.logicalBytes) ||
      t.logicalBytes < 1 ||
      t.fragmentCount > t.logicalBytes ||
      t.checksum.algorithm !== "crc32" ||
      !/^[0-9a-f]{8}$/u.test(t.checksum.value)
    )
      return (
        this.releaseAndSettle(c, t),
        s.push(this.fault(t, "proto.frameAssemblyMetadataMismatch")),
        s
      );
    let P = ke(t.dataBase64);
    if (!P)
      return (
        this.releaseAndSettle(c, t),
        s.push(this.fault(t, "proto.frameAssemblyInvalidBase64")),
        s
      );
    let g = this.assemblies.get(c);
    if (g) {
      if (
        g.fragmentCount !== t.fragmentCount ||
        g.deliveryKind !== I ||
        g.logicalBytes !== t.logicalBytes ||
        g.checksum.algorithm !== t.checksum.algorithm ||
        g.checksum.value !== t.checksum.value
      )
        return (
          this.release(c, g),
          this.settle(c, g),
          s.push(this.fault(t, "proto.frameAssemblyMetadataMismatch")),
          s
        );
    } else {
      if (this.assemblies.size >= this.maxConcurrentAssemblies)
        return (this.settle(c, t), s.push(this.fault(t, "proto.frameAssemblyConcurrentLimit")), s);
      if (this.stagedDecodedBytes + P.byteLength > this.maxStagedDecodedBytes)
        return (this.settle(c, t), s.push(this.fault(t, "proto.frameAssemblyBudgetExceeded")), s);
      ((g = {
        deliveryKind: I,
        logicalFrameId: t.logicalFrameId,
        logicalFrameOrdinal: t.logicalFrameOrdinal,
        topic: t.topic,
        subscriptionId: t.subscriptionId,
        fragmentCount: t.fragmentCount,
        logicalBytes: t.logicalBytes,
        checksum: { algorithm: "crc32", value: t.checksum.value },
        fragments: Array.from({ length: t.fragmentCount }, () => {}),
        receivedCount: 0,
        decodedBytes: 0,
        firstSeenAt: i,
      }),
        this.assemblies.set(c, g));
    }
    let D = g.fragments[t.fragmentIndex];
    if (D)
      return (
        Gr(D, P) ||
          (this.release(c, g),
          this.settle(c, g),
          s.push(this.fault(t, "proto.frameAssemblyFragmentConflict"))),
        s
      );
    if (this.stagedDecodedBytes + P.byteLength > this.maxStagedDecodedBytes)
      return (
        this.release(c, g),
        this.settle(c, g),
        s.push(this.fault(t, "proto.frameAssemblyBudgetExceeded")),
        s
      );
    if (g.decodedBytes + P.byteLength > g.logicalBytes)
      return (
        this.release(c, g),
        this.settle(c, g),
        s.push(this.fault(t, "proto.frameAssemblyLengthMismatch")),
        s
      );
    if (
      ((g.fragments[t.fragmentIndex] = P),
      (g.receivedCount += 1),
      (g.decodedBytes += P.byteLength),
      (this.stagedDecodedBytes += P.byteLength),
      g.receivedCount !== g.fragmentCount)
    )
      return s;
    if ((this.release(c, g), g.decodedBytes !== g.logicalBytes))
      return (this.settle(c, g), s.push(this.fault(g, "proto.frameAssemblyLengthMismatch")), s);
    let T = new Uint8Array(g.decodedBytes),
      z = 0;
    for (let S of g.fragments) {
      if (!S)
        return (this.settle(c, g), s.push(this.fault(g, "proto.frameAssemblyLengthMismatch")), s);
      (T.set(S, z), (z += S.byteLength));
    }
    if (ne(T) !== g.checksum.value)
      return (this.settle(c, g), s.push(this.fault(g, "proto.frameAssemblyChecksumMismatch")), s);
    let V;
    try {
      V = new TextDecoder("utf-8", { fatal: !0 }).decode(T);
    } catch {
      return (this.settle(c, g), s.push(this.fault(g, "proto.frameAssemblyInvalidUtf8")), s);
    }
    let B;
    try {
      B = JSON.parse(V);
    } catch {
      return (this.settle(c, g), s.push(this.fault(g, "proto.frameAssemblyInvalidJson")), s);
    }
    if (!fo(B, g))
      return (this.settle(c, g), s.push(this.fault(g, "proto.frameAssemblyMetadataMismatch")), s);
    let Q = this.frameSchema.safeParse(B);
    return Q.success
      ? (this.settle(c, g),
        s.push({ kind: "complete", frame: Q.data, deliveryKind: g.deliveryKind }),
        s)
      : (this.settle(c, g), s.push(this.fault(g, "proto.frameAssemblyInvalidPayload")), s);
  }
  expire(t = Date.now()) {
    let i = [];
    for (let [s, c] of this.assemblies)
      t - c.firstSeenAt < this.timeoutMs ||
        (this.release(s, c),
        this.settle(s, c),
        i.push(this.fault(c, "proto.frameAssemblyTimedOut")));
    return i;
  }
  discard(t, i) {
    let s = He(t, i),
      c = this.assemblies.get(s);
    (c && this.release(s, c), this.settledByRoute.delete(s));
  }
  abort(t, i) {
    let s = He(t, i),
      c = this.assemblies.get(s);
    c && (this.release(s, c), this.settle(s, c));
  }
  clear() {
    (this.assemblies.clear(), this.settledByRoute.clear(), (this.stagedDecodedBytes = 0));
  }
  getStats() {
    return { assemblies: this.assemblies.size, stagedDecodedBytes: this.stagedDecodedBytes };
  }
  get nextExpiryAt() {
    let t = null;
    for (let i of this.assemblies.values()) {
      let s = i.firstSeenAt + this.timeoutMs;
      (t === null || s < t) && (t = s);
    }
    return t;
  }
  release(t, i) {
    this.assemblies.get(t) === i &&
      (this.assemblies.delete(t), (this.stagedDecodedBytes -= i.decodedBytes));
  }
  settle(t, i) {
    let s = this.settledByRoute.get(t);
    (s && s.logicalFrameOrdinal > i.logicalFrameOrdinal) ||
      this.settledByRoute.set(t, {
        logicalFrameId: i.logicalFrameId,
        logicalFrameOrdinal: i.logicalFrameOrdinal,
      });
  }
  releaseAndSettle(t, i) {
    let s = this.assemblies.get(t);
    (s &&
      s.logicalFrameOrdinal === i.logicalFrameOrdinal &&
      s.logicalFrameId === i.logicalFrameId &&
      this.release(t, s),
      this.settle(t, i));
  }
  fault(t, i) {
    let s = go(t.deliveryKind);
    return {
      kind: "fault",
      fault: {
        ...(s === null ? {} : { deliveryKind: s }),
        reasonCode: i,
        logicalFrameId: t.logicalFrameId,
        logicalFrameOrdinal: t.logicalFrameOrdinal,
        topic: t.topic,
        subscriptionId: t.subscriptionId,
      },
    };
  }
};
var Nr = e.object({
    provider: e.string().optional(),
    model: e.string().optional(),
    thought: e.string().optional(),
    followupMode: e.enum(["queue", "guide"]).optional(),
    mode: e.string().optional(),
  }),
  Kr = {
    createSession: e.object({
      workspaceId: e.string(),
      firstInput: e.object({ text: e.string(), attachments: e.array(G).optional() }).optional(),
      config: Nr.optional(),
      runtimeModel: re.optional(),
      mcpServers: e.array(_t).optional(),
    }),
    createSelectionSideSession: e.object({}),
    sendText: e
      .object({
        text: e.string(),
        attachments: e.array(G).optional(),
        browserAmbientContext: Gt.optional(),
        heldQueueDisposition: e.enum(["clearQueueAndSend", "keepQueueAndSend"]).optional(),
        expectedHeldQueueItemIds: e.array(e.string().min(1)).optional(),
        turnRuntimeModel: re.optional(),
        automationId: e.string().min(1).optional(),
        offPeakTaskId: e.string().min(1).optional(),
        offPeakRunType: e.enum(["init", "resume"]).optional(),
        botDeliveryTarget: Vt.optional(),
        toolDisallowlist: e.array(e.string().min(1)).optional(),
      })
      .superRefine((r, t) => {
        (r.automationId &&
          r.offPeakTaskId &&
          t.addIssue({
            code: e.ZodIssueCode.custom,
            message: "automationId and offPeakTaskId are mutually exclusive",
          }),
          r.offPeakRunType &&
            !r.offPeakTaskId &&
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
    forkAssistant: e.object({ target: F }),
    applyFileRewind: e.object({ target: F }),
    editUserQuery: e.object({
      target: F,
      newText: e.string(),
      attachments: e.array(G).optional(),
      workspaceMode: e.enum(["preserve", "rewind"]).optional(),
    }),
    retryTurn: e.object({ target: F }),
    setAssistantFeedback: e.object({ target: F, feedback: e.enum(["like", "dislike"]).nullable() }),
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
      runtimeModel: re.optional(),
    }),
    switchCollaborationMode: e.object({ mode: e.enum(["build", "edit", "plan", "yolo"]) }),
    setFollowupMode: e.object({ mode: e.enum(["queue", "guide"]) }),
    pauseGoal: e.object({}),
    resumeGoal: e.object({}),
    cancelBackgroundWork: e.object({ workId: e.string() }),
    renameSession: e.object({ title: e.string() }),
    deleteSession: e.object({}),
  },
  Hr = e.enum(Object.keys(Kr)),
  na = new Set([
    "applyFileRewind",
    "forkAssistant",
    "editUserQuery",
    "retryTurn",
    "setAssistantFeedback",
    "sendQueuedNow",
    "editQueueItem",
    "reorderQueueItem",
    "deleteQueueItem",
    "setAutoDrain",
    "switchModelConfig",
    "switchCollaborationMode",
    "setFollowupMode",
    "pauseGoal",
    "resumeGoal",
  ]),
  sa = new Set([
    "applyFileRewind",
    "forkAssistant",
    "editUserQuery",
    "retryTurn",
    "setAssistantFeedback",
  ]),
  ia = e.object({
    commandId: e.string(),
    clientId: e.string(),
    sessionId: e.string().nullable(),
    baseRevision: e.number().optional(),
    baseLogEpoch: e.string().trim().min(1).optional(),
    type: Hr,
    payload: e.unknown(),
    issuedAt: C,
  });
var Qr = e.discriminatedUnion("type", [
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
      preview: Ge,
      response: e.string(),
    }),
    e.object({
      type: e.literal("editUserQuery"),
      disposition: e.enum(["rewind", "fork", "blocked"]),
      sessionId: e.string().min(1),
      reasonCode: e.string().min(1).optional(),
      preview: Ge.optional(),
    }),
    e.object({
      type: e.literal("inputDisposition"),
      delivery: e.enum(["startNow", "queue", "guide"]),
    }),
  ]),
  $r = e.object({
    commandId: e.string(),
    status: e.enum(["accepted", "rejected", "stale", "duplicate", "noop", "failed"]),
    reasonCode: e.string().optional(),
    message: e.string().optional(),
    revisionAtDecision: e.number(),
    result: Qr.optional(),
  }),
  ho = e.object({ sessionId: e.string().nullable(), commandId: e.string().min(1) }).strict(),
  aa = e.object({ commands: e.array(ho).min(1).max(64) }).strict(),
  Jr = e.object({ key: ho, result: e.union([$r, e.literal("unknown")]) }).strict(),
  da = e.object({ results: e.array(Jr).min(1).max(64) }).strict();
var ua = e
  .object({
    productTurnId: e.string().min(1),
    transcriptTurnId: e.string().min(1),
    orderedMessageIds: e.array(e.string().min(1)).min(1),
    boundaryMessageId: e.string().min(1),
  })
  .strict()
  .refine((r) => r.orderedMessageIds.at(-1) === r.boundaryMessageId, {
    message: "boundaryMessageId must be the final orderedMessageId",
    path: ["boundaryMessageId"],
  });
var W = {
    version: e.literal(1),
    eventId: e.string().min(1),
    eventSeq: e.number().int().nonnegative(),
    occurredAt: C,
    sessionId: e.string().min(1),
    sourceCommandId: e.string().min(1).optional(),
    turnId: e.string().min(1).optional(),
  },
  yo = e
    .string()
    .min(1)
    .refine(
      (r) =>
        /^\[[0-9a-f:.]+\]$/iu.test(r) ||
        (!/[\s/:?#@]/u.test(r) && !r.includes("[") && !r.includes("]") && r.trim() === r),
      "providerHostname must be a hostname without scheme, port, path, query, credentials or fragment",
    ),
  Yr = e
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
  Xr = e
    .object({
      ...W,
      kind: e.literal("turn.started"),
      executionKind: e.enum(["agent", "controlOnly"]).optional(),
      automationId: e.string().min(1).optional(),
      offPeakTaskId: e.string().min(1).optional(),
      offPeakRunType: e.enum(["init", "resume"]).optional(),
      taskTrigger: e.enum(["schedule", "manual"]).optional(),
      scheduledAt: C.optional(),
    })
    .strict(),
  en = e
    .object({
      ...W,
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
      providerHostname: yo.optional(),
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
  tn = e
    .object({
      ...W,
      kind: e.literal("stream.chunk"),
      channel: e.enum(["thought", "text"]),
      chunkLength: e.number().int().nonnegative(),
      firstChunk: e.boolean(),
      assistantMessageId: e.string().min(1).optional(),
      partId: e.string().min(1).optional(),
      parentToolCallId: e.string().min(1).optional(),
    })
    .strict(),
  on = e
    .object({
      ...W,
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
      performance: Yr.optional(),
      automationId: e.string().min(1).optional(),
    })
    .strict(),
  rn = e
    .object({
      ...W,
      kind: e.literal("permission.lifecycle"),
      phase: e.enum(["requested", "resolved", "denied"]),
      requestId: e.string().min(1).optional(),
      toolCallId: e.string().min(1),
      toolName: e.string().optional(),
      decision: e.enum(["allow", "deny", "escalate", "modify"]).optional(),
    })
    .strict(),
  nn = e
    .object({
      ...W,
      kind: e.literal("usage.delta"),
      requestId: e.string().min(1).optional(),
      providerId: e.string().optional(),
      modelId: e.string().optional(),
      providerKind: e.string().optional(),
      providerHostname: yo.optional(),
      inputTokens: e.number().nonnegative(),
      outputTokens: e.number().nonnegative(),
      totalTokens: e.number().nonnegative(),
      reasoningTokens: e.number().nonnegative(),
      cacheReadTokens: e.number().nonnegative(),
      cacheWriteTokens: e.number().nonnegative(),
    })
    .strict(),
  sn = e
    .object({
      ...W,
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
  an = e
    .object({
      ...W,
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
  dn = e
    .object({
      ...W,
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
      startedAt: C.optional(),
      endedAt: C.optional(),
      preCompactTokenCount: e.number().int().nonnegative().optional(),
      postCompactTokenCount: e.number().int().nonnegative().optional(),
      truePostCompactTokenCount: e.number().int().nonnegative().optional(),
      modelName: e.string().optional(),
      modelProvider: e.string().optional(),
    })
    .strict(),
  cn = e.discriminatedUnion("kind", [Xr, en, tn, on, rn, nn, sn, an, dn]).superRefine((r, t) => {
    (r.kind === "turn.started" &&
      r.automationId &&
      r.offPeakTaskId &&
      t.addIssue({
        code: e.ZodIssueCode.custom,
        message: "automationId and offPeakTaskId are mutually exclusive",
      }),
      r.kind === "turn.started" &&
        r.offPeakRunType &&
        !r.offPeakTaskId &&
        t.addIssue({
          code: e.ZodIssueCode.custom,
          message: "offPeakRunType requires offPeakTaskId",
          path: ["offPeakRunType"],
        }));
  }),
  ya = cn.transform((r) => r);
var Je = "__zcodeTrustedV4Connection",
  Ye = "__zcodeTrustedV4UnsubscribeRoute";
function ln(r) {
  if (typeof r != "object" || r === null) return null;
  let t = r[Ye];
  return !t || typeof t.topic != "string" || typeof t.connectionId != "string" ? null : t;
}
a(ln, "readTrustedZCodeAgentV4UnsubscribeRoute");
function Xe(r) {
  if (typeof r != "object" || r === null) return null;
  let t = r[Je];
  return !t ||
    typeof t.connectionId != "string" ||
    (t.clientMode !== "desktop-continuous" && t.clientMode !== "web-remote-replayable")
    ? null
    : { connectionId: t.connectionId, clientMode: t.clientMode };
}
a(Xe, "readTrustedZCodeAgentV4Connection");
function A(r, t) {
  let i = { ...r };
  return (
    delete i[Je],
    delete i.connectionId,
    delete i.clientMode,
    delete i.deliveryProfile,
    delete i.subscriberScope,
    (i[Je] = t),
    i
  );
}
a(A, "withTrustedConnection");
function So(r, t) {
  let i = { ...r };
  return (delete i[Ye], (i[Ye] = t), i);
}
a(So, "withTrustedUnsubscribeRoute");
function b(r) {
  return r.workspaceIdentity?.trim() || r.workspacePath;
}
a(b, "workspaceKey");
function U(r) {
  return {
    workspacePath: r.workspacePath,
    ...(r.workspaceIdentity ? { workspaceIdentity: r.workspaceIdentity } : {}),
  };
}
a(U, "workspaceTarget");
var mn = 1024,
  pn = 32 * 1024 * 1024,
  un = 256;
function $e(r) {
  if (r.trim().length === 0 || r.length > un)
    throw new Error("fault.connection.invalidConnectionId");
}
a($e, "assertConnectionId");
function vo(r, t) {
  return `relay:${r.length}:${r}${t.length}:${t}`;
}
a(vo, "namespaceRelayConnectionId");
function gn(r) {
  return new TextEncoder().encode(JSON.stringify(r)).byteLength;
}
a(gn, "frameBytes");
function fn(r) {
  return r === "desktop-continuous" ? "continuous" : "replayable";
}
a(fn, "deliveryProfileFor");
function Cn(r) {
  let t = r.clientMode === "desktop-continuous";
  return {
    kind: "hello",
    protocolVersion: M,
    connectionId: r.connectionId,
    clientMode: r.clientMode,
    deliveryProfile: fn(r.clientMode),
    serverTime: Date.now(),
    capabilities: { nativeDialogs: t, localTerminal: t, binaryFrames: !1, compression: "none" },
    auth: {},
  };
}
a(Cn, "createHello");
function hn(r, t) {
  $e(t.connectionId);
  let i = t.role ?? "terminal-client",
    s = new Map(),
    c = new Map(),
    R = new Map(),
    I = new Map(),
    v = new Map(),
    P = !1,
    g = i === "trusted-host-relay",
    D = i === "trusted-host-relay",
    T = null,
    z = null,
    V = "drained",
    B = !1,
    Q = Promise.resolve(),
    S = new Map(),
    w = new Map(),
    x = a((o) => {
      let n = Xe(o);
      return i === "trusted-host-relay" && n
        ? ($e(n.connectionId),
          { connectionId: vo(t.connectionId, n.connectionId), clientMode: n.clientMode })
        : { connectionId: t.connectionId, clientMode: t.clientMode };
    }, "forwardedConnection"),
    q = a(() => {
      if (P) throw new Error("fault.connection.closed");
    }, "assertOpen"),
    Z = a(() => {
      if ((q(), !g)) throw new Error("fault.connection.handshakeRequired");
    }, "assertReady"),
    Ft = a((o, n, d, u, f) => `${o}\0${b(n)}\0${d}\0${u}\0${f}`, "routeKey"),
    ce = a((o, n, d) => `${o}\0${b(n)}\0${d}`, "ownershipKey"),
    Wt = a((o, n) => `${o}\0${b(n)}`, "routedEventKey"),
    le = a((o, n) => `${b(o)}\0${n}`, "flowRouteKey"),
    me = a(
      (o) => ({
        key: le(o.target, o.connectionId),
        target: o.target,
        connection: { connectionId: o.connectionId, clientMode: o.clientMode },
      }),
      "flowRouteForEntry",
    ),
    Bt = a(() => {
      let o = new Map(w);
      for (let n of s.values()) {
        let d = me(n);
        o.set(d.key, d);
      }
      return o;
    }, "currentFlowRoutes"),
    ee = a(async (o, n) => {
      S.get(o.key) !== n &&
        (await r.setConnectionFlowStateV4(A({ ...U(o.target), state: n }, o.connection)),
        S.set(o.key, n));
    }, "forwardFlowRoute"),
    bo = a(async (o) => {
      if (!(B && o !== "closed")) {
        ((V = o), o === "closed" && (B = !0));
        for (let n of Bt().values()) await ee(n, o);
      }
    }, "applyTransportFlowState"),
    Et = a((o) => {
      if (P || (B && o !== "closed")) return Promise.resolve();
      let n = Q.then(() => bo(o));
      return ((Q = n.catch(() => {})), n);
    }, "enqueueTransportFlowState"),
    Ro = a(async (o) => {
      V === "saturated" && (await ee(me(o), "saturated"));
    }, "syncCurrentFlowForEntry"),
    Io = a(async (o) => {
      let n = me(o);
      Bt().has(n.key) || (S.has(n.key) && (await ee(n, "closed"), S.delete(n.key)));
    }, "closeUnusedFlowRoute"),
    xo = a((o, n) => {
      let d = Ft(n.kind, n.target, n.topic, o, n.connectionId),
        u = c.get(n.ownershipKey);
      (u && s.delete(u), c.set(n.ownershipKey, d), s.set(d, n));
    }, "remember"),
    te = a((o, n, d, u) => {
      let f = b(n),
        k = [...s.values()].filter(
          (j) =>
            j.kind === o &&
            j.subscriptionId === d &&
            b(j.target) === f &&
            (!u || (j.topic === u.topic && j.connectionId === u.connectionId)),
        );
      return k.length === 1 ? k[0] : null;
    }, "findBySubscription"),
    Ot = a((o, n, d) => {
      let u = b(n);
      return [...s.values()].some(
        (f) =>
          f.kind === o &&
          f.subscriptionId === d.subscriptionId &&
          f.topic === d.topic &&
          b(f.target) === u,
      );
    }, "ownsFrame"),
    oe = a((o) => {
      if (i !== "trusted-host-relay") return null;
      let n = ln(o);
      return n
        ? ($e(n.connectionId), { topic: n.topic, connectionId: vo(t.connectionId, n.connectionId) })
        : null;
    }, "forwardedUnsubscribeRoute"),
    pe = a((o, n, d) => {
      let u = {
          kind: o,
          target: U(n),
          topic: d,
          frames: [],
          stagedBytes: 0,
          overflowReason: null,
          runtimeGeneration: v.get(b(n)) ?? 0,
          invalidatedByRuntimeRestart: !1,
        },
        f = ce(o, n, d),
        k = R.get(f) ?? new Set();
      return (k.add(u), R.set(f, k), u);
    }, "beginPendingOwnership"),
    ue = a((o) => {
      let n = ce(o.kind, o.target, o.topic),
        d = R.get(n);
      (d?.delete(o), d?.size === 0 && R.delete(n));
    }, "removePendingOwnership"),
    _ = a((o) => {
      (ue(o), (o.frames.length = 0), (o.stagedBytes = 0), (o.overflowReason = null));
    }, "discardPendingOwnership"),
    Ao = a((o, n) => {
      if (o.overflowReason || o.invalidatedByRuntimeRestart) return;
      let d = gn(n);
      if (o.frames.length + 1 > mn || o.stagedBytes + d > pn) {
        ((o.frames.length = 0),
          (o.stagedBytes = 0),
          (o.overflowReason = "fault.subscription.initialFrameStagingOverflow"));
        return;
      }
      (o.frames.push(n), (o.stagedBytes += d));
    }, "stageFrame"),
    To = a((o, n, d, u) => {
      if (Ot(o, n, d)) {
        u.fire(d);
        return;
      }
      let f = R.get(ce(o, n, d.topic));
      if (f) for (let k of f) Ao(k, d);
    }, "routeIncomingFrame"),
    ge = a((o, n, d) => {
      let u = Wt(o, n),
        f = I.get(u);
      if (!f) {
        let k = new J();
        ((f = { emitter: k, upstream: d((j) => To(o, n, j, k)) }), I.set(u, f));
      }
      return f.emitter.event;
    }, "routedEvent"),
    fe = a((o) => {
      let n = Ft(o.kind, o.target, o.topic, o.subscriptionId, o.connectionId);
      (s.delete(n), c.get(o.ownershipKey) === n && c.delete(o.ownershipKey));
    }, "forget"),
    $ = a((o, n) => {
      let d = { ...o.target, subscriptionId: o.subscriptionId, ...(n ? { runtimePolicy: n } : {}) },
        u = So(d, { topic: o.topic, connectionId: o.connectionId });
      switch (o.kind) {
        case "conversation":
          return r.unsubscribeConversationV4(u);
        case "sessions-index":
          return r.unsubscribeSessionsIndexV4(u);
        case "workspace-config":
          return r.unsubscribeWorkspaceConfigV4(u);
      }
    }, "unsubscribeBase"),
    Ce = a(async (o, n) => {
      fe(o);
      try {
        await Io(o);
      } finally {
        await $(o, n);
      }
    }, "unsubscribeOwnedEntry"),
    wo = a((o, n) => {
      let d = So(n, { topic: o.topic, connectionId: o.connectionId });
      switch (o.kind) {
        case "conversation":
          return r.resyncConversationV4(d);
        case "sessions-index":
          return r.resyncSessionsIndexV4(d);
        case "workspace-config":
          return r.resyncWorkspaceConfigV4(d);
      }
    }, "resyncBase"),
    he = a((o, n) => {
      Z();
      let d = te(o, n, n.subscriptionId, oe(n));
      return d ? wo(d, n) : Promise.reject(new Error("fault.subscription.notOwned"));
    }, "resyncOwned"),
    ye = a(async (o, n, d) => {
      ue(d);
      let u = { ...n, subscriptionId: o };
      if (d.invalidatedByRuntimeRestart || d.runtimeGeneration !== (v.get(b(n.target)) ?? 0))
        throw (_(d), new Error("fault.subscription.runtimeRestarted"));
      if (P) throw (_(d), await $(u).catch(() => {}), new Error("fault.connection.closed"));
      if (d.overflowReason) {
        let k = d.overflowReason;
        throw (_(d), await $(u).catch(() => {}), new Error(k));
      }
      xo(o, u);
      try {
        await Ro(u);
      } catch (k) {
        throw (fe(u), await $(u).catch(() => {}), k);
      }
      let f = I.get(Wt(n.kind, n.target));
      if (f) {
        for (let k of d.frames)
          k.subscriptionId === o && Ot(n.kind, n.target, k) && f.emitter.fire(k);
        ((d.frames.length = 0), (d.stagedBytes = 0));
      }
    }, "rememberAfterSubscribe"),
    Dt = a((o, n) => {
      v.set(o, n);
      for (let u of s.values()) b(u.target) === o && fe(u);
      for (let u of S.keys()) u.startsWith(`${o}\0`) && S.delete(u);
      let d = [...R.values()].flatMap((u) => [...u]).filter((u) => b(u.target) === o);
      for (let u of d)
        ((u.invalidatedByRuntimeRestart = !0), ue(u), (u.frames.length = 0), (u.stagedBytes = 0));
    }, "invalidateWorkspaceRuntime"),
    Zo = !!r.onAgentRuntimeLifecycle,
    Mo = r.onAgentRuntimeLifecycle?.((o) => {
      o.state !== "available" && Dt(o.workspaceKey, o.runtimeIdentity.generation);
    }),
    Fo = Zo
      ? void 0
      : r.onAgentRuntimeRestarted?.(({ workspaceKey: o }) => {
          let n = (v.get(o) ?? 0) + 1;
          Dt(o, n);
        }),
    Wo = {
      async helloConversationV4() {
        return (q(), (D = !0), Cn(t));
      },
      async initializeConversationV4(o) {
        if ((q(), !D)) throw new Error("fault.connection.helloRequired");
        let n = ao.parse(o);
        if (T !== null && T !== n.clientId) throw new Error("fault.connection.clientChanged");
        ((T = n.clientId), (g = !0));
      },
      async setConnectionFlowStateV4(o) {
        if ((q(), i !== "trusted-host-relay"))
          throw new Error("fault.connection.flowControlForbidden");
        if (!Xe(o)) throw new Error("fault.connection.flowControlUntrusted");
        let d = x(o);
        if (!(
          w.has(le(o, d.connectionId)) ||
          [...s.values()].some((f) => b(f.target) === b(o) && f.connectionId === d.connectionId)
        ))
          throw new Error("fault.subscription.notOwned");
        await r.setConnectionFlowStateV4(A(o, d));
      },
      async sendConversationCommandV4(o) {
        if ((q(), i === "terminal-client" && (Z(), o.envelope.clientId !== T)))
          throw new Error("fault.command.clientMismatch");
        return r.sendConversationCommandV4(A(o, x(o)));
      },
      async queryConversationCommandsV4(o) {
        Z();
        let n = b(o);
        if (z !== null && z !== n) throw new Error("fault.command.queryForeignWorkspace");
        return ((z = n), r.queryConversationCommandsV4(A(o, x(o))));
      },
      async attachmentBeginV4(o) {
        Z();
        let n = x(o),
          d = await r.attachmentBeginV4(A(o, n));
        if (d.state === "staging") {
          if (P || B)
            throw (
              await r.attachmentAbortV4(A(o, n)).catch(() => {}),
              new Error("fault.connection.closed")
            );
          let u = { key: le(o, n.connectionId), target: U(o), connection: n };
          if ((w.set(u.key, u), V === "saturated"))
            try {
              await ee(u, "saturated");
            } catch (f) {
              throw (w.delete(u.key), await r.attachmentAbortV4(A(o, n)).catch(() => {}), f);
            }
        }
        return d;
      },
      async attachmentReadV4(o) {
        return (Z(), r.attachmentReadV4(A(o, x(o))));
      },
      async attachmentChunkV4(o) {
        return (Z(), r.attachmentChunkV4(A(o, x(o))));
      },
      async attachmentCommitV4(o) {
        Z();
        let n = x(o);
        return r.attachmentCommitV4(A(o, n));
      },
      async attachmentAbortV4(o) {
        Z();
        let n = x(o);
        await r.attachmentAbortV4(A(o, n));
      },
      async subscribeConversationV4(o) {
        Z();
        let n = x(o),
          d = uo(o.sessionId),
          u = pe("conversation", o, d);
        try {
          let f = await r.subscribeConversationV4(A(o, n));
          return (
            await ye(
              f.ack.subscriptionId,
              {
                kind: "conversation",
                ownershipKey: `conversation\0${b(o)}\0${d}\0${n.connectionId}`,
                topic: d,
                connectionId: n.connectionId,
                clientMode: n.clientMode,
                target: U(o),
              },
              u,
            ),
            f
          );
        } catch (f) {
          throw (_(u), f);
        }
      },
      async unsubscribeConversationV4(o) {
        let n = te("conversation", o, o.subscriptionId, oe(o));
        n && (await Ce(n, o.runtimePolicy));
      },
      async resyncConversationV4(o) {
        return he("conversation", o);
      },
      onDynamicConversationFrame(o) {
        return ge("conversation", o, r.onDynamicConversationFrame(o));
      },
      onDynamicConversationTelemetryFact(o) {
        return (
          q(),
          i !== "terminal-client" || t.clientMode !== "desktop-continuous"
            ? Se.None
            : r.onDynamicConversationTelemetryFact(U(o))
        );
      },
      onDynamicProcessResourceSample() {
        return (q(), i !== "trusted-host-relay" ? Se.None : r.onDynamicProcessResourceSample());
      },
      async subscribeSessionsIndexV4(o) {
        Z();
        let n = x(o),
          d = to(b(o)),
          u = pe("sessions-index", o, d);
        try {
          let f = await r.subscribeSessionsIndexV4(A(o, n));
          return (
            await ye(
              f.ack.subscriptionId,
              {
                kind: "sessions-index",
                ownershipKey: `sessions-index\0${d}\0${n.connectionId}`,
                topic: d,
                connectionId: n.connectionId,
                clientMode: n.clientMode,
                target: U(o),
              },
              u,
            ),
            f
          );
        } catch (f) {
          throw (_(u), f);
        }
      },
      async unsubscribeSessionsIndexV4(o) {
        let n = te("sessions-index", o, o.subscriptionId, oe(o));
        n && (await Ce(n, o.runtimePolicy));
      },
      async resyncSessionsIndexV4(o) {
        return he("sessions-index", o);
      },
      onDynamicSessionsIndexFrame(o) {
        return ge("sessions-index", o, r.onDynamicSessionsIndexFrame(o));
      },
      async subscribeWorkspaceConfigV4(o) {
        Z();
        let n = x(o),
          d = so(b(o)),
          u = pe("workspace-config", o, d);
        try {
          let f = await r.subscribeWorkspaceConfigV4(A(o, n));
          return (
            await ye(
              f.ack.subscriptionId,
              {
                kind: "workspace-config",
                ownershipKey: `workspace-config\0${d}\0${n.connectionId}`,
                topic: d,
                connectionId: n.connectionId,
                clientMode: n.clientMode,
                target: U(o),
              },
              u,
            ),
            f
          );
        } catch (f) {
          throw (_(u), f);
        }
      },
      async unsubscribeWorkspaceConfigV4(o) {
        let n = te("workspace-config", o, o.subscriptionId, oe(o));
        n && (await Ce(n, o.runtimePolicy));
      },
      async resyncWorkspaceConfigV4(o) {
        return he("workspace-config", o);
      },
      onDynamicWorkspaceConfigFrame(o) {
        return ge("workspace-config", o, r.onDynamicWorkspaceConfigFrame(o));
      },
    };
  return {
    service: new Proxy(r, {
      get(o, n, d) {
        let u = Reflect.get(Wo, n, d);
        if (u !== void 0) return u;
        let f = Reflect.get(o, n, o);
        return typeof f == "function" ? f.bind(o) : f;
      },
    }),
    setTransportFlowState(o) {
      return Et(o);
    },
    async dispose() {
      if (P || (await Et("closed").catch(() => {}), P)) return;
      ((P = !0), (g = !1), (D = !1), (T = null));
      let o = Array.from(s.values());
      (s.clear(), c.clear());
      for (let n of R.values())
        for (let d of n) ((d.frames.length = 0), (d.stagedBytes = 0), (d.overflowReason = null));
      R.clear();
      for (let n of I.values()) (n.upstream.dispose(), n.emitter.dispose());
      (I.clear(),
        Mo?.dispose(),
        Fo?.dispose(),
        v.clear(),
        w.clear(),
        S.clear(),
        await Promise.allSettled(o.map((n) => $(n))));
    },
  };
}
a(hn, "createZCodeAgentConnectionScope");
var et = m(p.ZCodeSession);
var tt = m(p.Bots);
var ot = m(p.ModelProvider);
var rt = m(p.CodingPlanSubscription);
var nt = m(p.OffPeakTask);
var st = class {
  static {
    a(this, "ServiceCollection");
  }
  _services = new Map();
  register(t, i) {
    return (this._services.set(t.channelName, i), this);
  }
  get(t) {
    let i = this._services.get(t.channelName);
    if (!i) throw new Error(`Service not registered: ${t.channelName}`);
    return i;
  }
  getOptional(t) {
    return this._services.get(t.channelName);
  }
  exposeOnChannelServer(t, i = new Map()) {
    for (let [s, c] of this._services) {
      let R = i.get(s) ?? c;
      t.registerChannel(s, h.fromService(R));
    }
  }
};
var it = m(p.File);
var at = m(p.Git);
var dt = m(p.GitCheckpoint);
var ct = m(p.System);
var lt = m(p.Terminal);
var mt = m(p.Broadcast);
var Po = "ZCODE_AGENT_MCP_STATUS_MODE_UNSUPPORTED",
  pt = class extends Error {
    static {
      a(this, "ZCodeAgentMcpStatusModeUnsupportedError");
    }
    code = Po;
    constructor() {
      (super("The connected ZCode Agent does not support MCP status-only refresh"),
        (this.name = "ZCodeAgentMcpStatusModeUnsupportedError"));
    }
  };
var ut = m(p.Hooks);
var yn = "PROJECT_MEMORY_PREVIEW_LIMIT_EXCEEDED",
  Sn = "PROJECT_MEMORY_FILE_CHANGED",
  gt = m(p.Memory);
var ft = m(p.OutputStyle);
var Ct = m(p.FileWatcher);
var ht = m(p.OAuth);
var yt = m(p.UsageStats);
var St = m(p.Skills);
var vt = m(p.SkillSync);
var Pt = m(p.McpSync);
var kt = m(p.PluginSync);
var bt = m(p.Plugins);
var Rt = m(p.PluginManagement);
var It = m(p.Subagents);
var xt = m(p.Commands);
var At = m(p.SettingsSync);
var Tt = m(p.Feedback);
var wt = m(p.RepoWiki);
var Zt = m(p.PromptAttachmentTransfer);
var H = class {
  static {
    a(this, "RemoteServiceAccess");
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
    ((this.fileService = h.toService(t.getChannel(it.channelName))),
      (this.gitService = h.toService(t.getChannel(at.channelName))),
      (this.gitCheckpointService = h.toService(t.getChannel(dt.channelName))),
      (this.systemService = h.toService(t.getChannel(ct.channelName))),
      (this.terminalService = h.toService(t.getChannel(lt.channelName))),
      (this.settingService = h.toService(t.getChannel(Re.channelName))),
      (this.credentialService = h.toService(t.getChannel(Ie.channelName))),
      (this.broadcastService = h.toService(t.getChannel(mt.channelName))),
      (this.zcodeTaskService = h.toService(t.getChannel(xe.channelName))),
      (this.zcodeAgentService = h.toService(t.getChannel(Ae.channelName))),
      (this.zcodeSessionService = h.toService(t.getChannel(et.channelName))),
      (this.botsService = h.toService(t.getChannel(tt.channelName))),
      (this.fileWatcherService = h.toService(t.getChannel(Ct.channelName))),
      (this.oauthService = h.toService(t.getChannel(ht.channelName))),
      (this.modelProviderService = h.toService(t.getChannel(ot.channelName))),
      (this.usageStatsService = h.toService(t.getChannel(yt.channelName))),
      (this.codingPlanSubscriptionService = h.toService(t.getChannel(rt.channelName))),
      (this.offPeakTaskService = h.toService(t.getChannel(nt.channelName))),
      (this.skillsService = h.toService(t.getChannel(St.channelName))),
      (this.skillSyncService = h.toService(t.getChannel(vt.channelName))),
      (this.mcpSyncService = h.toService(t.getChannel(Pt.channelName))),
      (this.pluginSyncService = h.toService(t.getChannel(kt.channelName))),
      (this.pluginsService = h.toService(t.getChannel(bt.channelName))),
      (this.pluginManagementService = h.toService(t.getChannel(Rt.channelName))),
      (this.subagentsService = h.toService(t.getChannel(It.channelName))),
      (this.commandsService = h.toService(t.getChannel(xt.channelName))),
      (this.hooksService = h.toService(t.getChannel(ut.channelName))),
      (this.memoryService = h.toService(t.getChannel(gt.channelName))),
      (this.outputStyleService = h.toService(t.getChannel(ft.channelName))),
      (this.settingsSyncService = h.toService(t.getChannel(At.channelName))),
      (this.feedbackService = h.toService(t.getChannel(Tt.channelName))),
      (this.repoWikiService = h.toService(t.getChannel(wt.channelName))),
      (this.promptAttachmentTransferService = h.toService(t.getChannel(Zt.channelName))));
  }
};
function vn(r) {
  let t = new ve(r);
  return new H(t);
}
a(vn, "connectViaProtocol");
var Mt = {
  saturationHighWaterMarkBytes: 1024 * 1024,
  saturationLowWaterMarkBytes: 256 * 1024,
  replayBufferMaxBytes: 8 * 1024 * 1024,
  replayBufferGraceMs: 45e3,
  assemblyTimeoutMs: be.assemblyTimeoutMs,
};
export {
  st as a,
  it as b,
  at as c,
  dt as d,
  ct as e,
  lt as f,
  Re as g,
  Ie as h,
  mt as i,
  xe as j,
  Bo as k,
  Ae as l,
  pt as m,
  to as n,
  so as o,
  ao as p,
  Ir as q,
  lo as r,
  Ar as s,
  mo as t,
  wr as u,
  ei as v,
  oi as w,
  ri as x,
  Mr as y,
  si as z,
  ii as A,
  ai as B,
  ci as C,
  pi as D,
  gi as E,
  Ci as F,
  Ge as G,
  Si as H,
  Pi as I,
  Ri as J,
  xi as K,
  Ti as L,
  wi as M,
  Zi as N,
  Mi as O,
  uo as P,
  Ne as Q,
  Co as R,
  Kr as S,
  na as T,
  sa as U,
  $r as V,
  aa as W,
  da as X,
  ya as Y,
  ln as Z,
  Xe as _,
  hn as $,
  et as aa,
  tt as ba,
  ut as ca,
  yn as da,
  Sn as ea,
  gt as fa,
  ft as ga,
  Ct as ha,
  ht as ia,
  ot as ja,
  yt as ka,
  rt as la,
  nt as ma,
  St as na,
  vt as oa,
  Pt as pa,
  kt as qa,
  bt as ra,
  Rt as sa,
  It as ta,
  xt as ua,
  At as va,
  Tt as wa,
  wt as xa,
  Zt as ya,
  H as za,
  vn as Aa,
};
