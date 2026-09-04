// A0-S4-4b: 自 modules/ConversationOverlays.tsx §3 交互调度 原样迁入（组件单元；原文件现为薄 re-export shim）。
// 迁出体 = §3 全段（1502–1883，含尾部 useOverlayCommandEnvironment/taskElicitationDraftKeys 二 declare）
// + §0 声明群分配本族子集（CommandAck/buildCommand/pendingCommandLedger 命令协议 + PendingInteraction/SessionSnapshotForOverlays 模型，补 export）。
// PermissionRequest/PermissionOption 经 type import 取回 Permission 族；ElicitationRequest/AnswerDraftMap 取回 Elicitation 族。
// 导入路径按 components/conversation/ 深度改指 ../../modules/。
/* eslint-disable */
import * as React from "react";
import { Input, useOptionalPlatform as useTelemetryPlatform } from '../../modules/ImeComposition'; // 〔A1-R168〕+useOptionalPlatform（原码 le，导出别名 j；canonical components/ime/ImeComposition@236，头注 @235 逐字「原码 le，导出别名 j」）：useTelemetryPlatform declare 收敛改指，见下墓碑
import { logger } from '../../modules/SkillStore';
import { useZCodeIntl as useIntlContext, type ZCodeIntl as IntlShape } from '../../modules/I18n'; // 原 G（A0-D 接线：declare → I18n canonical）
import { Button } from '../../modules/button'; // 原 H（A0-D 接线：declare → button canonical）
import { PermissionApprovalOverlay, type InteractionOrigin, type PermissionOption, type PermissionRequest } from './PermissionApprovalOverlay'; // §1 族属主（组件为渲染期值引用，型别 type-only）
import { ElicitationDialogKeyed, type AnswerDraftMap, type ElicitationRequest } from './ElicitationDialog'; // §2 族属主（同上）
import { pendingCommandLedger, buildCommand } from './ConversationCommandLedger'; // 原 K1（styles 115758–115963 class 单例；〔A1-P1-B6〕跨域改指——R25 基线 declare 删，真身同域叶）+ OS（〔A1-P1-B7〕同面 declare 收敛——真身同叶段 2，styles 34315–34338+34598–34645 逐字）

/* --- 命令协议 --- */

export interface CommandAck {
  status: "accepted" | "duplicate" | "noop" | "rejected" | "stale";
  reasonCode?: string;
}
/* OS：〔A1-P1-B7〕同面 declare 收敛——R25 基线 declare function buildCommand（args/payload 型面）删，
   真 import 见文件头（./ConversationCommandLedger 段 2 真身，styles 34629 逐字）；消费面 189/305 逐字不变。 */
/* K1：〔A1-P1-B6〕跨域改指——R25 基线 declare const pendingCommandLedger（record/applyAck，ack: CommandAck 面）删，
   真 import 见文件头（./ConversationCommandLedger 真身叶）；消费面 195/198/307/310 逐字不变。 */

/* --- 交互/快照模型（本族所有子集） --- */

export interface PendingInteraction {
  interactionId: string;
  autoResolution?: { state: "pending" | "snoozed" | string; deadlineAt?: number; startedAt?: number; snoozedAt?: number };
  payload:
    | { kind: "permission"; toolName: string; summary?: string; options: { optionId: string; kind: string; label: string; response?: unknown }[]; origin?: InteractionOrigin; detail?: Record<string, unknown>; traceId?: string }
    | { kind: "userInput"; toolName?: string; prompt?: string; freeText?: boolean; sensitive?: boolean; options?: { optionId: string; label: string }[]; questions?: ElicitationRequest["questions"]; currentQuestionIndex?: number; answerDrafts?: Record<string, string[]>; origin?: InteractionOrigin; schema?: unknown; traceId?: string; input?: unknown };
}
export interface SessionSnapshotForOverlays {
  sessionId: string;
  pendingInteractions: PendingInteraction[];
}

/* ============================================================================
 * 3. 交互调度（原 pSt 等，js 117283–117684 / jsx 99619–100033）
 * ==========================================================================*/

/** 原 rSt（js 117448 / jsx 99762）：允许规则内容候选字段 */
const PERMISSION_RULE_FIELDS = [`command`, `url`, `file_path`, `path`, `pattern`];

/** 原 iSt（js 117449 / jsx 99763）：选项 kind → resolveInteraction 应答 */
function buildOptionResponse(kind: string, option: PermissionOption): { decision: "allow" | "deny"; permissionUpdates?: unknown[] } {
  if (kind === `deny` || kind === `rejectOnce` || kind === `rejectAlways`) return { decision: `deny` };
  if (kind === `allowAlways`) {
    const detail = typeof option.detail == `object` && option.detail !== null ? option.detail : {};
    const ruleContent = PERMISSION_RULE_FIELDS.map((field) => detail[field]).find((value): value is string => typeof value == `string` && value.trim().length > 0);
    return {
      decision: `allow`,
      permissionUpdates: [
        {
          behavior: `allow`,
          rules: [
            {
              toolName: (option as unknown as { toolName: string }).toolName,
              ...(ruleContent ? { ruleContent } : {}),
            },
          ],
          type: `addRules`,
        },
      ],
    };
  }
  return { decision: `allow` };
}

/** 原 aSt（js 117467 / jsx 99788）：pendingInteraction(permission) → PermissionRequest */
function toPermissionRequest(sessionId: string, interaction: PendingInteraction & { payload: Extract<PendingInteraction["payload"], { kind: "permission" }> }): PermissionRequest {
  const { payload } = interaction;
  const options = payload.options.map((option) => ({
    optionId: option.optionId,
    kind: option.kind,
    name: option.label,
    response: option.response ?? buildOptionResponse(option.kind, { optionId: option.optionId, kind: option.kind, name: option.label } as PermissionOption),
  }));
  return {
    type: `permission_request`,
    taskId: sessionId,
    traceId: sessionId,
    requestId: interaction.interactionId,
    description: payload.summary,
    kind: payload.toolName,
    title: payload.toolName,
    options,
    ...(payload.origin ? { origin: payload.origin } : {}),
    raw: payload.detail ?? { toolCallId: (payload as { toolCallId?: string }).toolCallId, toolName: payload.toolName },
  };
}

/** 原 oSt（js 117488 / jsx 99816）：pendingInteraction(userInput 简单型) → 通用对话框模型 */
function toGenericInteractionModel(interaction: PendingInteraction & { payload: Extract<PendingInteraction["payload"], { kind: "userInput" }> }) {
  return {
    interactionId: interaction.interactionId,
    prompt: interaction.payload.prompt,
    freeText: interaction.payload.freeText,
    sensitive: interaction.payload.sensitive,
    options: interaction.payload.options ?? [],
  };
}

/** 原 sSt（js 117497 / jsx 99825）：pendingInteraction(userInput 问卷型) → ElicitationRequest */
function toElicitationRequest(sessionId: string, interaction: PendingInteraction & { payload: Extract<PendingInteraction["payload"], { kind: "userInput" }> }): ElicitationRequest | null {
  const { payload } = interaction;
  if (!payload.questions || payload.questions.length === 0) return null;
  const first = payload.questions[0];
  return {
    type: `elicitation_request`,
    taskId: sessionId,
    traceId: payload.traceId ?? sessionId,
    requestId: interaction.interactionId,
    message: first?.question ?? payload.prompt ?? ``,
    header: first?.header,
    options: first?.options ?? [],
    ...(first?.multiSelect ? { multiSelect: true } : {}),
    questions: payload.questions,
    ...(payload.currentQuestionIndex === undefined ? {} : { currentQuestionIndex: payload.currentQuestionIndex }),
    ...(payload.answerDrafts ? { answerDrafts: payload.answerDrafts } : {}),
    ...(payload.origin ? { origin: payload.origin } : {}),
    schema: payload.schema ?? payload.input,
  };
}

/**
 * 通用交互对话框（原 cSt，js 117469 / jsx 99855）。
 * 兜底形态（非问卷的 userInput）：fixed 全屏遮罩 + 提示 + 选项按钮 + 自由输入
 *（sensitive 用 password 输入框）。
 */
function GenericInteractionDialog({
  model,
  onSubmit,
}: {
  model: { prompt?: string; freeText?: boolean; sensitive?: boolean; options: { optionId: string; label: string }[] };
  onSubmit: (answer: { optionId?: string; freeText?: string }) => void;
}) {
  const [freeText, setFreeText] = React.useState(``);
  const submitOption = React.useCallback(
    (optionId: string) => {
      onSubmit({ optionId });
    },
    [onSubmit],
  );
  const submitFreeText = React.useCallback(() => {
    const trimmed = freeText.trim();
    if (!trimmed && model.freeText) return;
    onSubmit(model.freeText ? { freeText: trimmed } : { optionId: model.options[0]?.optionId });
  }, [freeText, model.freeText, model.options, onSubmit]);
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4" data-testid="v4-interaction-dialog">
      <div className="w-full max-w-lg rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-lg">
        <p className="mb-3 text-ui-base text-[var(--color-foreground)]">{model.prompt}</p>
        {model.options.length > 0 ? (
          <div className="mb-3 flex flex-col gap-2">
            {model.options.map((option) => (
              <Button key={option.optionId} type="button" variant="outline" data-testid={`v4-interaction-option:${option.optionId}`} onClick={() => submitOption(option.optionId)}>
                {option.label}
              </Button>
            ))}
          </div>
        ) : null}
        {model.freeText ? (
          <div className="flex flex-col gap-2">
            <Input type={model.sensitive ? `password` : `text`} value={freeText} onChange={(event) => setFreeText(event.target.value)} data-testid="v4-interaction-input" />
            <Button type="button" onClick={submitFreeText}>{`提交`}</Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ── 交互 snooze 命令域（styles 117414–117447） ── */
async function sendSnoozeInteractionCommand(e: any) {
  let t = buildCommand({
    type: `snoozeInteractionAutoResolution`,
    sessionId: e.sessionId,
    payload: { interactionId: e.interactionId },
  });
  pendingCommandLedger.record(t);
  try {
    let n = await e.sendCommand(t);
    return (
      pendingCommandLedger.applyAck(t, n),
      n.status === `accepted` || n.status === `duplicate` || n.status === `noop`
        ? !0
        : (logger.warn(`[v4-interaction] 暂停自动结束被拒绝`, {
            interactionId: e.interactionId,
            source: e.source,
            status: n.status,
            reasonCode: n.reasonCode,
          }),
          !1)
    );
  } catch (t) {
    return (
      logger.error(`[v4-interaction] 暂停自动结束失败`, {
        interactionId: e.interactionId,
        source: e.source,
        error: t,
      }),
      !1
    );
  } finally {
    e.onCommandSettled?.(t.commandId);
  }
}
/* ── tombstone〔A1-P1-B13〕：手写 snoozeInteractionAutoResolution（原 177–209）删除——束真身 nSt@117414 逐字
 * 实体化于本段。OS/K1/J → buildCommand/pendingCommandLedger/logger 真实 import（B6/B7 在案）。
 * 语义名 sendSnoozeInteractionCommand：避束字面量 `snoozeInteractionAutoResolution`（命令 type 串）碰撞，
 *   B12 ToolLayoutMemo 判例同源；调用面（snooze useCallback）改指。
 * P3-B9 §5 OS 消费侧受理：canonical = sessionCommandSchemaCore::buildSessionCommandEnvelope（OS@34629；
 *   本 worktree 真身 = ./ConversationCommandLedger::buildCommand，B6 逐字 34598–34645）+ casCommandTypes/
 *   rowTargetCommandTypes（= CAS_COMMAND_TYPES/ROW_TARGET_COMMAND_TYPES，同叶在案）；declare→import 收敛在案。
 * pSt@117599 resolveInteraction 应答钩子为 pSt 束体嵌套 useCallback，非顶层声明，不独立转录；其 OS 消费面
 *   （本叶 resolveInteraction useCallback，buildCommand import）已收敛，受理取证见 A1-P1-B13.report.md §五。
 * R0@119236 = ./ConversationPaneCore（B3 逐字 2,065 行）OS 消费面 buildCommand import（B6）在案，同受理。 ── */
/** 原 fSt（js 117584 / jsx 99884）：snooze 账本（交互过才可暂停，且每次交互只暂停一次） */
function createSnoozeLedger() {
  const interacted = new Set<string>();
  const snoozed = new Set<string>();
  return {
    markInteracted(interactionId: string) {
      interacted.add(interactionId);
    },
    consumeSnooze(interactionId: string, hasAutoResolution: boolean): boolean {
      if (!hasAutoResolution || !interacted.has(interactionId) || snoozed.has(interactionId)) return false;
      snoozed.add(interactionId);
      return true;
    },
    releaseSnooze(interactionId: string) {
      snoozed.delete(interactionId);
    },
  };
}

/** 原 lSt/uSt/dSt（js 117527/117530/117533 / jsx 99875/99878/99881） */
function snapshotForSession(sessionId: string, snapshots: SessionSnapshotForOverlays | null): SessionSnapshotForOverlays | null {
  return snapshots?.sessionId === sessionId ? snapshots : null;
}
function withElicitationOverride(candidate: ElicitationRequest | null, override: ElicitationRequest | null | undefined): ElicitationRequest | null {
  return override && candidate?.requestId === override.requestId ? override : candidate;
}
function elicitationDraftKey(request: ElicitationRequest): string {
  return `${request.requestId}:${request.currentQuestionIndex ?? 0}:${JSON.stringify(request.answerDrafts ?? {})}`;
}

/** 任务 store 草稿选择器（原 xe + te(W(...), sessionId)，skillStore chunk） */
declare function useTaskElicitationDraft(workspacePath: string | undefined, sessionId: string): ElicitationRequest | null;
declare function useTaskElicitationFormDraft(workspacePath: string | undefined, sessionId: string, requestId: string): { questionIndex: number; drafts: AnswerDraftMap } | undefined;
declare function setTaskElicitationFormDraft(
  workspacePath: string | undefined,
  sessionId: string,
  requestId: string,
  draft: { questionIndex: number; drafts: AnswerDraftMap },
  workspaceIdentity?: string | null,
): void;
declare function removeTaskElicitationFormDraft(workspacePath: string | undefined, sessionId: string, requestId: string, workspaceIdentity?: string | null): void;
declare function useNotificationEnabled(): boolean;
/* ── tombstone〔A1-R168〕：declare useTelemetryPlatform 删除 → 改指 components/ime/ImeComposition::useOptionalPlatform（@236，经 modules/ImeComposition@79 转导出；@8 既有值边 → 模块图零变化）。〔别名保名〕useOptionalPlatform as useTelemetryPlatform，消费点 @299/@306 逐字不变。束证三跳闭合：imeComposition-DEYFkwWm.js@10880 function le() → @12590 le as j（chunk 导出别名）→ styles-CdEGpc2x.js@355 j as S（块 337..368 之尾行自 ./imeComposition-DEYFkwWm.js 导入）；R37/R38 PaymentDeep@286「S ≡ useOptionalPlatform」与 R125 Conversation@184-185「styles 355 j as S ≡ 导出 le as j」两度既判同链。型面：桩面 unknown | null 实塌缩为 unknown（零信息），canonical PlatformService | null 系真形 → 改指为保真增益；唯一传递点 @306 之槽型 @269 platform: unknown 恒可赋 → 型缝 0，无需加铸。 ── */
/** 原 tSt（js 117394 / jsx 99703）：新交互出现时的桌面通知（接口保留） */
declare function useSnapshotInteractionToasts(args: {
  snapshot: SessionSnapshotForOverlays | null;
  enabled: boolean;
  platform: unknown;
  formatMessage: IntlShape["formatMessage"];
}): void;

/**
 * 会话交互覆盖层（原 pSt，js 117551 / jsx 99899）。
 * 取快照中第一个 pendingInteraction 分派渲染：
 *   permission → PermissionApprovalOverlay；
 *   userInput（问卷）→ ElicitationDialog（AskUserQuestion/带自动结束者，
 *     首次交互触发 snooze 暂停自动结束）；
 *   其他 userInput → GenericInteractionDialog。
 * 应答统一走 resolveInteraction 命令（账本记账 + ACK 应用）；
 * 草稿按 工作区×会话×请求 持久化到任务 store，交互结束后清理。
 */
function ConversationInteractionsOverlay({
  sessionId,
  workspacePath,
  workspaceIdentity,
  provider,
  snapshot,
  onCommandSettled,
}: {
  sessionId: string;
  workspacePath?: string;
  workspaceIdentity?: string | null;
  provider?: string;
  snapshot: SessionSnapshotForOverlays;
  onCommandSettled?: (commandId: string) => void;
}) {
  const { sendCommand } = useOverlayCommandEnvironment();
  const platform = useTelemetryPlatform();
  const { intl } = useIntlContext();
  const sessionSnapshot = snapshotForSession(sessionId, snapshot);
  const pending = sessionSnapshot?.pendingInteractions[0] ?? null;
  const notificationEnabled = useNotificationEnabled();
  const elicitationOverride = useTaskElicitationDraft(workspacePath, sessionId);
  const initialFormDraft = useTaskElicitationFormDraft(workspacePath, sessionId, pending?.interactionId ?? ``);
  useSnapshotInteractionToasts({ snapshot: sessionSnapshot, enabled: notificationEnabled, platform, formatMessage: intl.formatMessage });
  const snoozeLedger = React.useRef(createSnoozeLedger());
  const autoResolutionPausedFor = React.useRef(new Set<string>());
  const resolveInteraction = React.useCallback(
    async (interactionId: string, answer: unknown) => {
      const command = buildCommand({ type: `resolveInteraction`, sessionId, payload: { interactionId, answer } });
      pendingCommandLedger.record(command);
      try {
        const ack = await sendCommand(command);
        pendingCommandLedger.applyAck(command, ack);
        const accepted = ack.status === `accepted` || ack.status === `duplicate` || ack.status === `noop`;
        if (!accepted) {
          logger.warn(`[v4-interaction] resolveInteraction 被拒绝`, { interactionId, status: ack.status, reasonCode: ack.reasonCode });
        }
        return accepted;
      } catch (error) {
        logger.error(`[v4-interaction] resolveInteraction 失败`, { interactionId, error });
        return false;
      } finally {
        onCommandSettled?.(command.commandId);
      }
    },
    [onCommandSettled, sendCommand, sessionId],
  );
  const snooze = React.useCallback(
    async (interactionId: string) =>
      sendSnoozeInteractionCommand({ sessionId, interactionId, sendCommand, source: `dialog`, onCommandSettled }),
    [onCommandSettled, sendCommand, sessionId],
  );
  const persistFormDraft = React.useCallback(
    (requestId: string, draft: { questionIndex: number; drafts: AnswerDraftMap }) => {
      setTaskElicitationFormDraft(workspacePath, sessionId, requestId, draft, workspaceIdentity);
    },
    [sessionId, workspaceIdentity, workspacePath],
  );
  const discardFormDraft = React.useCallback(
    (requestId: string) => {
      removeTaskElicitationFormDraft(workspacePath, sessionId, requestId, workspaceIdentity);
    },
    [sessionId, workspaceIdentity, workspacePath],
  );
  /* 交互结束后清理残留草稿 */
  React.useEffect(() => {
    if (!sessionSnapshot) return;
    const live = new Set(sessionSnapshot.pendingInteractions.filter((interaction) => interaction.payload.kind === `userInput`).map((interaction) => interaction.interactionId));
    for (const requestId of Object.keys(taskElicitationDraftKeys(workspacePath, sessionId, workspaceIdentity))) {
      if (!live.has(requestId)) discardFormDraft(requestId);
    }
  }, [sessionSnapshot, discardFormDraft, sessionId, workspaceIdentity, workspacePath]);
  const snoozeAfterInteraction = React.useCallback(
    async (interactionId: string, hasAutoResolution: boolean) => {
      if (!hasAutoResolution) return true;
      if (!snoozeLedger.current.consumeSnooze(interactionId, hasAutoResolution)) return true;
      try {
        const ok = await snooze(interactionId);
        if (!ok) snoozeLedger.current.releaseSnooze(interactionId);
        return ok;
      } catch {
        snoozeLedger.current.releaseSnooze(interactionId);
        return false;
      }
    },
    [snooze],
  );
  React.useEffect(() => {
    if (pending) snoozeAfterInteraction(pending.interactionId, !!pending.autoResolution);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending?.autoResolution, pending?.interactionId, snoozeAfterInteraction]);
  if (!pending) return null;
  if (pending.payload.kind === `permission`) {
    const permissionRequest = toPermissionRequest(sessionId, { ...pending, payload: pending.payload });
    return (
      <PermissionApprovalOverlay
        request={permissionRequest}
        workspacePath={workspacePath}
        provider={provider}
        onRespond={(_requestId, option) => {
          resolveInteraction(pending.interactionId, { optionId: option.optionId });
        }}
      />
    );
  }
  const elicitation = withElicitationOverride(
    toElicitationRequest(sessionId, { ...pending, payload: pending.payload as Extract<PendingInteraction["payload"], { kind: "userInput" }> }),
    elicitationOverride,
  );
  if (elicitation) {
    const pauseAutoResolution = pending.payload.toolName?.trim().toLowerCase() === `askuserquestion` || pending.autoResolution !== undefined;
    return (
      <ElicitationDialogKeyed
        key={elicitationDraftKey(elicitation)}
        request={elicitation}
        initialFormDraft={elicitationOverride?.requestId === elicitation.requestId ? undefined : initialFormDraft}
        onFormDraftChange={persistFormDraft}
        autoResolution={pauseAutoResolution ? pending.autoResolution : undefined}
        onFirstInteraction={
          pauseAutoResolution
            ? (kind) => {
                if (!autoResolutionPausedFor.current.has(pending.interactionId)) {
                  autoResolutionPausedFor.current.add(pending.interactionId);
                  logger.debug(`[v4-interaction] AskUserQuestion 请求暂停自动结束`, { interactionId: pending.interactionId, source: kind });
                }
                snoozeLedger.current.markInteracted(pending.interactionId);
                return snoozeAfterInteraction(pending.interactionId, !!pending.autoResolution);
              }
            : undefined
        }
        onRespond={(_requestId, action, answers) => {
          resolveInteraction(pending.interactionId, { action, ...(answers ? { content: answers } : {}) }).then((accepted) => {
            if (accepted) discardFormDraft(pending.interactionId);
          });
        }}
      />
    );
  }
  return (
    <GenericInteractionDialog
      model={toGenericInteractionModel({ ...pending, payload: pending.payload as Extract<PendingInteraction["payload"], { kind: "userInput" }> })}
      onSubmit={(answer) => {
        resolveInteraction(pending.interactionId, answer);
      }}
    />
  );
}
declare function useOverlayCommandEnvironment(): { sendCommand: (command: unknown) => Promise<CommandAck> };
declare function taskElicitationDraftKeys(workspacePath: string | undefined, sessionId: string, workspaceIdentity: string | null | undefined): Record<string, unknown>;


/* 〔A0-S4-4b〕补导出块：原经 ConversationOverlays.tsx §6 导出块对外，迁出后于属主文件本地导出（体不动）。 */
export {
  ConversationInteractionsOverlay,
  GenericInteractionDialog,
  toPermissionRequest,
  toElicitationRequest,
  toGenericInteractionModel,
  sendSnoozeInteractionCommand, // 〔A1-P1-B13〕原 nSt 束真身逐字（styles 117414–117447），手写 snoozeInteractionAutoResolution 墓碑
};
