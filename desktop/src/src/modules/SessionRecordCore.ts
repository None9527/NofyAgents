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
//   Pge 唯一域外消费 24587 = Uge（24574-24599）钩子层内〔A1-R40〕已转录本文件尾部；Uge 域外消费 24787 = e_e ≡ WorkspaceShell P2 泳道，接线留该批）。
// 导出面：sessionRecordOf（族头）+ useTaskSessionRecord（钩子层，R40）；余符簇内私有（一符一家）。

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

/* ── 〔A1-R40〕Pge 族钩子层（styles-local 24571-24599；R39 §六.1 留批落地） ──
 * Hge → sessionRecordForTaskOf (24571-24573) | Uge → useTaskSessionRecord (24574-24599)
 * 跨域依赖改指：Ag ≡ useSessionService（services/workspaceServiceHooks@406，R37 既判；
 *   modules/services@113 转导出面——经尾部导入消费）。
 * 消费面实测：Uge 唯一消费 24787 = e_e（任务元解析钩子，24772-；参面 (e, t, n, r, c)
 *   = (workspaceAbsPath, activeTaskId, workspaceRemoteSessionId, workspaceIdentity, activeTaskMeta)）——
 *   树属主 WorkspaceShell（P2 泳道在制）；本批仅转录定义面，消费面接引留 P2 批。
 * 落点裁定：本叶尾部（不立新叶）——Uge 消费本叶 sessionRecordOf≡Pge（24587），
 *   Hge 为 Uge 私有助手；一符一家，Pge 族不分裂。环安全：本叶 → modules/services
 *   转导出面 → services/workspaceServiceHooks（值闭包 services/* + react），无反向边达本叶。
 * 型缝：useSessionService 返回 unknown（R37 接口级形）→ `as any` 投射后消费 readSession
 *   （PD@10457 先例）；useState 泛型 <any> 承接记录/双变更新器。 ── */
/** 原 Hge（styles 24571-24573）：任务记录匹配（无 taskId 或旁路置真 → null；taskId 相符 → 记录） */
function sessionRecordForTaskOf(e: any, t: any, n: any) {
  return !t || n ? null : e?.taskId === t ? e : null;
}
/** 原 Uge（styles 24574-24599）：任务会话记录钩子（readSession 单消息拉取 → sessionRecordOf；失败兜 null；deps [a, t, i, r, e] 逐字） */
export function useTaskSessionRecord(e: any, t: any, n: any, r: any, i: any) {
  let a = useSessionService(e, n, r) as any,
    [o, s] = React.useState<any>(null);
  return (
    React.useEffect(() => {
      let n = !1;
      return (
        s((e: any) => sessionRecordForTaskOf(e, t, i)),
        !t ||
          i ||
          a
            .readSession({ workspacePath: e, workspaceIdentity: r, sessionId: t, messageLimit: 1 })
            .then((e: any) => {
              n || s(sessionRecordOf(e));
            })
            .catch(() => {
              n || s(null);
            }),
        () => {
          n = !0;
        }
      );
    }, [a, t, i, r, e]),
    o
  );
}
/* 〔A1-R40〕尾部导入 1/2：React（钩子层 useState/useEffect 所需）。尾部导入：ES 模块提升，等价文件头，行引用零漂（R35 @10315 先例）。 */
import * as React from 'react';
/* 〔A1-R40〕尾部导入 2/2：useSessionService（原 Ag）收敛改指——services/workspaceServiceHooks@406 canonical（R37 既判），经 modules/services@113 转导出面。环安全见钩子层头注。 */
import { useSessionService } from './services';
