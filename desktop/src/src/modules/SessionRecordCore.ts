// 〔A1-R39〕Pge 会话记录族整族转录（styles-local 24397-24568；R38 §七.2 留批落地）。
// 来源：styles-CdEGpc2x.js 唯一真身。混淆名 → 语义名 映射表（行号 = bundle 行）：
//   Age → latestMessageModelOf (24397-24402) | jge → sessionModelOf (24403-24405)
//   Pge → sessionRecordOf (24501-24524)      | Fge → sessionRecordTitleOf (24525-24527)
//   Ige → sessionRecordModeOf (24528-24530)  | zge → sessionTargetRecordOf (24537-24558)
//   Bge → isSessionRecordStatus (24559-24561) | Vge → objectRecordOrEmpty (24562-24564)
//   Pg → nonEmptyStringOrUndefined (24565-24567) | Fg → finiteNumberOrUndefined (24568-24570)
// 异域依赖改指（真身链闭合，逐字同值）：
//   jg ≡ buildModelSettingOptionValue（SrcSharedB@5400，R34 既判；styles 24393 双实例）
//   or ≡ resolveSessionDisplayTitle（SrcSharedB@4683，原 $h js 8159；styles 553 `Qa as or` ← src 9785 `$h as Qa`）
//   yee ≡ resolveSessionDisplayStatus（SrcSharedB@4723，原 ag js 8196；styles 614 `Za as yee` ← src 9850 `ag as Za`）
//   Nne ≡ newUniqueId（lib/uuid@28，原 lx js 8721；styles 766 `rt as Nne` ← src 10005 `lx as rt`；参面丢弃同 bundle）
// 邻接边界（modules/SettingsConfigOptions 播种件）：Mg 24406（≡Home parseLooseModelValue）/
//   Mge 24419（≡SettingsConfigOptions parseLooseModeValue）/Ng 24440/Nge 24495 归既有裁定，
//   本叶仅承 Age/jge（Mg 前）与 Pge 族（Nge 后），互消费为零（Ng 消费 jg/Lge/Rge 经 SrcSharedB 面）。
// 消费面：簇内互消费（Age←jge←Pge；Fge/Ige/zge←Pge；Vge/Pg/Bge/Fg←zge）；
//   Pge 唯一域外消费 24587（Uge 24574 会话记录钩子，钩子层留批——涉 Ag≡useSessionService 改指）。
// 导出面：仅 sessionRecordOf（族头，域外所依）；余符簇内私有（一符一家）。

import {
  buildModelSettingOptionValue,
  resolveSessionDisplayTitle,
  resolveSessionDisplayStatus,
  newUniqueId,
} from './SrcSharedB';

/** 原 Age（styles 24397-24402）：消息列倒序取首个 info.model */
function latestMessageModelOf(e: any) {
  for (let t = e.length - 1; t >= 0; --t) {
    let n = e[t]?.info.model;
    if (n) return n;
  }
}
/** 原 jge（styles 24403-24405）：会话现模型（末条消息模型 → 设置现模型） */
function sessionModelOf(e: any) {
  return latestMessageModelOf(e.messages) ?? e.settings.model.current;
}
/** 原 Fge（styles 24525-24527）：记录标题（委托 resolveSessionDisplayTitle≡or） */
function sessionRecordTitleOf(e: any) {
  return resolveSessionDisplayTitle({ title: e.session.title, messages: e.messages, target: e.projection.target });
}
/** 原 Ige（styles 24528-24530）：记录模式面（build 归一，余值直通——bundle 逐字同形） */
function sessionRecordModeOf(e: any) {
  return e === `build` ? `build` : e;
}
/** 原 Bge（styles 24559-24561）：目标状态属记录状态集判定 */
function isSessionRecordStatus(e: any) {
  return e === `active` || e === `paused` || e === `budget_limited` || e === `complete`;
}
/** 原 Vge（styles 24562-24564）：对象兜底（非对象 → 空对象） */
function objectRecordOrEmpty(e: any) {
  return typeof e == `object` && e ? e : {};
}
/** 原 Pg（styles 24565-24567）：非空字符串兜底（空 → undefined） */
function nonEmptyStringOrUndefined(e: any) {
  return typeof e == `string` && e.length > 0 ? e : void 0;
}
/** 原 Fg（styles 24568-24570）：有限数兜底（非有限 → undefined） */
function finiteNumberOrUndefined(e: any) {
  return typeof e == `number` && Number.isFinite(e) ? e : void 0;
}
/** 原 zge（styles 24537-24558）：目标投影 → 记录目标面（双写键兜底 + 时间面 created/updated 级联） */
function sessionTargetRecordOf(e: any) {
  let t = objectRecordOrEmpty(e),
    n = objectRecordOrEmpty(t.time),
    r = nonEmptyStringOrUndefined(t.status);
  return {
    sessionID: nonEmptyStringOrUndefined(t.sessionID) ?? nonEmptyStringOrUndefined(t.sessionId) ?? ``,
    targetID: nonEmptyStringOrUndefined(t.targetID) ?? nonEmptyStringOrUndefined(t.targetId) ?? ``,
    objective: nonEmptyStringOrUndefined(t.objective) ?? ``,
    summaryTitle: nonEmptyStringOrUndefined(t.summaryTitle) ?? null,
    status: isSessionRecordStatus(r) ? r : `active`,
    tokenBudget: typeof t.tokenBudget == `number` ? t.tokenBudget : null,
    tokensUsed: finiteNumberOrUndefined(t.tokensUsed) ?? 0,
    timeUsedSeconds: finiteNumberOrUndefined(t.timeUsedSeconds) ?? 0,
    activeInputId: nonEmptyStringOrUndefined(t.activeInputId) ?? null,
    activeRunStartedAtMs: finiteNumberOrUndefined(t.activeRunStartedAtMs) ?? null,
    activeRunLastSeenAtMs: finiteNumberOrUndefined(t.activeRunLastSeenAtMs) ?? null,
    time: {
      created: finiteNumberOrUndefined(n.created) ?? finiteNumberOrUndefined(t.createdAt) ?? 0,
      updated: finiteNumberOrUndefined(n.updated) ?? finiteNumberOrUndefined(t.updatedAt) ?? 0,
    },
  };
}
/** 原 Pge（styles 24501-24524）：会话 → 记录（taskId/traceId/title/工作区/时戳/模式/模型/思考级/状态/错误/目标全量面） */
export function sessionRecordOf(e: any) {
  return {
    taskId: e.session.sessionId,
    traceId: newUniqueId(e.session.sessionId),
    title: sessionRecordTitleOf(e),
    workspacePath: e.session.workspace.workspacePath,
    workspaceIdentity: e.session.workspace.workspaceIdentity,
    createdAt: e.session.createdAt,
    updatedAt: e.session.updatedAt,
    mode: sessionRecordModeOf(e.session.mode),
    model: buildModelSettingOptionValue(sessionModelOf(e)),
    thoughtLevel: e.settings.thoughtLevel.current,
    provider: `glm`,
    status: resolveSessionDisplayStatus(e),
    lastError: e.projection.lastError
      ? {
          code: e.projection.lastError.code ?? e.projection.lastError.type,
          ...(e.projection.lastError.detail ? { detail: e.projection.lastError.detail } : {}),
          message: e.projection.lastError.message,
        }
      : void 0,
    target: e.projection.target ? sessionTargetRecordOf(e.projection.target) : e.projection.target,
  };
}
