// A1-P1-B8：R0 ConversationPane 簇工作区模型初始化域逐字转录（错误模型 + 卫星族 + NM/JUe）。
// 真身基准（只读）：desktop/src/out/renderer/assets/styles-CdEGpc2x.js（md5 48d71d4874b0868d61fd35a328bf6ad5）。
// 映射表（minified → 语义名 → bundle 行）：
//   bM → WORKSPACE_PREPARE_NOISE_MESSAGES 52799 | xM → isPlainRecord 52806 | SM → trimmedStringOrNull 52809
//   CM → parseJsonObjectOrNull 52814 | wM → readNestedPath 52823 | TM → collectErrorDetailMessages 52832
//   IUe → extractErrorMessages 52854 | EM → probeErrorPathValue 52878 | DM → normalizeWorkspacePrepareError 52886
//   zUe → formatWorkspacePrepareDetail 52934 | kM → stringifyUnknown 52937 | AM → errorMessageOf 52948
//   BUe → wrapWithDisplayMessage 52958 | VUe → toWorkspacePrepareError 52968 | jM → modelConfigCurrentValue 52976
//   MM → modelConfigOptionCount 52980 | HUe → applyModeOverrideToOptions 52984
//   NM → prepareWorkspaceModelInit 52998（R0 120751/186024 + 本簇 DraftConfig 叶 53700 消费；PaneCore 1647）
//   JUe → applyWorkspaceDefaultModel 53415（R0 120726 消费；PaneCore 1622）
// 跨段注：52927–52933（LUe/RUe/OM）居本域跨度中段，已在树（./ConversationPaneHelpers 门控域，〔A1-P1-B6/B7〕），不入本叶。
// 外部引用改指：J→logger | ge→hasThoughtLevelOption（modules/SkillStore←stores/taskStore 1755）
//   Mg→parseLooseModelValue（modules/Home，styles 24405）| Mge→parseLooseModeValue + Ng→settingsConfigOptionsOf
//   （modules/SettingsConfigOptions 播种件，styles 24419/24440）| Cw→normalizeCaptchaCode（modules/StoresDeep 445，styles 40570 stub）。
// 域外消费存档：DM @211247/211266、VUe @185862（他域，导出待彼域收敛时改指）。
// 函数体内局部变量保留混淆名（B5 约定）；型缝带〔A1-P1-B8〕注释。
// 环安全：本叶 import modules/SkillStore（shim 叶）/ modules/Home / modules/SettingsConfigOptions / modules/StoresDeep；
//   ConversationPaneCore、ConversationDraftConfig 单向消费本叶。
/* eslint-disable */
import { logger, hasThoughtLevelOption } from '../../modules/SkillStore'; // 原 J（styles J←skillStore logger）/ ge（styles 396←skillStore b；〔A1-P1-B8〕NM thoughtLevel 有效性判定）
import { parseLooseModelValue } from '../../modules/Home'; // 原 Mg（styles 24405；〔A1-P1-B8〕NM/JUe 松散模型值解析）
import { parseLooseModeValue, settingsConfigOptionsOf } from '../../modules/SettingsConfigOptions'; // 原 Mge/Ng（styles 24440/24440；〔A1-P1-B8〕编排方播种件，NM createSession mode 面 + 配置选项构建）
import { normalizeCaptchaCode } from '../../modules/StoresDeep'; // 原 Cw（styles 40570 stub；〔A1-P1-B8〕DM 错误码归一，A1-R12/R13 既有改指实体）

/* ── 〔A1-P1-B8〕工作区模型初始化域（styles 52799–52926 + 52934–53249 + 53415–53464，494 行逐字；
 *    错误模型 bM…DM + 卫星族 zUe…HUe + NM prepareWorkspaceModelInit + JUe applyWorkspaceDefaultModel）。
 *    逐字证明：/tmp/a1r0-p1/p8/r8a-roundtrip.js（R8A ROUNDTRIP EXACT 494 lines）。型缝：见 r8a-seam-log.txt。 ── */
export var WORKSPACE_PREPARE_NOISE_MESSAGES = new Set([
  `Internal error`,
  `Turn execution failed`,
  `Compact failed`,
  `Rewind failed`,
  `ZCode session failed`,
]);
export function isPlainRecord(e: any) {
  return typeof e == `object` && !!e && !Array.isArray(e);
}
export function trimmedStringOrNull(e: any) {
  if (typeof e != `string`) return null;
  let t = e.trim();
  return t.length > 0 ? t : null;
}
export function parseJsonObjectOrNull(e: any) {
  let t = e.trim();
  if (!t.startsWith(`{`) && !t.startsWith(`[`)) return null;
  try {
    return JSON.parse(t);
  } catch {
    return null;
  }
}
export function readNestedPath(e: any, t: any) {
  let n = e;
  for (let e of t) {
    if (!isPlainRecord(n)) return;
    n = n[e];
  }
  return n;
}
export function collectErrorDetailMessages(e: any) {
  let t: any = [],
    n = (e: any) => {
      let n = trimmedStringOrNull(e);
      !n || t.includes(n) || t.push(n);
    };
  for (let t of [
    [`message`],
    [`detail`],
    [`data`, `message`],
    [`data`, `detail`],
    [`data`, `details`],
    [`data`, `reason`],
    [`data`, `error`, `message`],
    [`data`, `error`, `detail`],
    [`data`, `error`, `details`],
    [`data`, `zcode`, `error`, `message`],
    [`data`, `zcode`, `error`, `detail`],
    [`data`, `zcode`, `error`, `details`],
  ])
    n(readNestedPath(e, t));
  return t;
}
export function extractErrorMessages(e: any) {
  let t: any = [],
    n = (e: any) => {
      let n = trimmedStringOrNull(e);
      !n || t.includes(n) || t.push(n);
    };
  if ((e instanceof Error && n(e.message), typeof e == `string`)) {
    let r = parseJsonObjectOrNull(e);
    if (isPlainRecord(r)) {
      for (let e of collectErrorDetailMessages(r)) n(e);
      if (t.length > 0) return t;
    }
    return (n(e), t);
  }
  if (isPlainRecord(e)) {
    for (let t of collectErrorDetailMessages(e)) {
      n(t);
      let e = parseJsonObjectOrNull(t);
      if (isPlainRecord(e)) for (let t of collectErrorDetailMessages(e)) n(t);
    }
    return t;
  }
  return (n(String(e)), t);
}
export function probeErrorPathValue(e: any, t: any) {
  let n = isPlainRecord(e) ? e : typeof e == `string` ? parseJsonObjectOrNull(e) : null;
  if (isPlainRecord(n))
    for (let e of t) {
      let t = trimmedStringOrNull(readNestedPath(n, e));
      if (t) return t;
    }
}
export function normalizeWorkspacePrepareError(e: any, t: any = {}) {
  let n = extractErrorMessages(e),
    r = n.find((e: any) => !WORKSPACE_PREPARE_NOISE_MESSAGES.has(e)) ?? n[0] ?? t.fallbackMessage ?? `Internal error`,
    i = n.find((e: any) => e !== r && !WORKSPACE_PREPARE_NOISE_MESSAGES.has(e)),
    a = probeErrorPathValue(e, [
      [`code`],
      [`providerCode`],
      [`data`, `code`],
      [`data`, `error`, `code`],
      [`data`, `zcode`, `error`, `code`],
      [`data`, `zcode`, `error`, `context`, `providerCode`],
      [`data`, `error`, `context`, `providerCode`],
      [`context`, `providerCode`],
    ]),
    o = probeErrorPathValue(e, [
      [`detail`],
      [`data`, `detail`],
      [`data`, `error`, `detail`],
      [`data`, `zcode`, `error`, `detail`],
    ])?.match(/provider_code=([0-9]+)/)?.[1],
    s = normalizeCaptchaCode(a ?? o, r),
    c = probeErrorPathValue(e, [
      [`traceId`],
      [`data`, `traceId`],
      [`data`, `error`, `traceId`],
      [`data`, `zcode`, `error`, `traceId`],
    ]),
    l = probeErrorPathValue(e, [
      [`taskId`],
      [`data`, `taskId`],
      [`data`, `error`, `taskId`],
      [`data`, `zcode`, `error`, `taskId`],
    ]);
  return {
    code: s ?? o ?? a ?? t.fallbackCode ?? `UNKNOWN`,
    message: r,
    detail: i,
    traceId: t.traceId ?? c,
    taskId: t.taskId ?? l,
  };
}
export function formatWorkspacePrepareDetail(e: any) {
  return `workspace=${e.workspacePath} provider=${e.provider} reason=${e.reason} attempt=${e.attempt}/${e.maxAttempts}`;
}
export function stringifyUnknown(e: any) {
  if (typeof e == `string`) return e;
  if (e === null) return `null`;
  if (e === void 0) return `undefined`;
  if (typeof e == `number` || typeof e == `boolean` || typeof e == `bigint`) return String(e);
  try {
    let t = JSON.stringify(e);
    if (t !== void 0) return t;
  } catch {}
  return String(e);
}
export function errorMessageOf(e: any) {
  if (e instanceof Error) return e.message || e.name || String(e);
  if (typeof e == `object` && e && `message` in e) {
    let t = e.message,
      n = stringifyUnknown(t);
    if (n !== `undefined` && n.length > 0) return n;
  }
  return stringifyUnknown(e);
}
export function wrapWithDisplayMessage(e: any, t: any) {
  if (!t) return e;
  let n = Error(t);
  if ((e instanceof Error && ((n.name = e.name), (n.stack = e.stack)), typeof e == `object` && e)) {
    let t = e;
    for (let e of [`code`, `data`, `detail`, `details`, `providerCode`, `taskId`, `traceId`]) {
      let r = t[e];
      r !== void 0 && ((n as any)[e] = r);
    }
  }
  return n;
}
export function toWorkspacePrepareError(e: any, t: any) {
  let n = normalizeWorkspacePrepareError(wrapWithDisplayMessage(e, t.displayMessage), {
    fallbackCode: `WORKSPACE_PREPARE_FAILED`,
    taskId: t.taskId,
  });
  return n.detail ? n : { ...n, detail: formatWorkspacePrepareDetail(t) };
}
export function modelConfigCurrentValue(e: any) {
  let t = e.find((e: any) => e.category === `model` && e.type === `select`);
  return typeof t?.currentValue == `string` ? t.currentValue : null;
}
export function modelConfigOptionCount(e: any) {
  let t = e.find((e: any) => e.category === `model` && e.type === `select`);
  return t?.type === `select` ? (t.options?.length ?? 0) : 0;
}
export function applyModeOverrideToOptions(e: any, t: any) {
  let n = t?.trim();
  if (!n) return e;
  let r = !1,
    i = e.map((e: any) =>
      e.category !== `mode` ||
      e.type !== `select` ||
      !e.options?.some((e: any) => e.value === n) ||
      e.currentValue === n
        ? e
        : ((r = !0), { ...e, currentValue: n }),
    );
  return r ? i : e;
}
export async function prepareWorkspaceModelInit(e: any) {
  let t = Date.now();
  logger.info(`[zcode-model-init] workspace prepare start`, {
    createDraftSession: e.createDraftSession === !0,
    draftSessionId: e.draftSessionId?.trim() || null,
    hasPreferredModel: !!e.preferredModel?.trim(),
    hasPreferredMode: !!e.preferredMode?.trim(),
    hasPreferredThoughtLevel: !!e.preferredThoughtLevel?.trim(),
    workspacePath: e.workspacePath,
    workspaceIdentity: e.workspaceIdentity ?? null,
    provider: e.provider,
  });
  let n = e.preferredModel?.trim(),
    r = e.preferredMode?.trim(),
    i = e.preferredThoughtLevel?.trim();
  if (e.createDraftSession) {
    let a = null,
      o = e.draftSessionId?.trim();
    if (o) {
      let n = Date.now();
      logger.info(`[zcode-model-init] read draft session start`, {
        workspacePath: e.workspacePath,
        workspaceIdentity: e.workspaceIdentity ?? null,
        provider: e.provider,
        draftSessionId: o,
      });
      try {
        ((a = await e.zcodeSessionService.readSession({
          workspacePath: e.workspacePath,
          workspaceIdentity: e.workspaceIdentity,
          sessionId: o,
        })),
          logger.info(`[zcode-model-init] read draft session done`, {
            workspacePath: e.workspacePath,
            workspaceIdentity: e.workspaceIdentity ?? null,
            provider: e.provider,
            draftSessionId: o,
            durationMs: Date.now() - n,
            totalDurationMs: Date.now() - t,
          }));
      } catch (t) {
        logger.warn(`[zcode-model-init] read draft session failed, recreating`, {
          workspacePath: e.workspacePath,
          workspaceIdentity: e.workspaceIdentity ?? null,
          provider: e.provider,
          draftSessionId: o,
          error: errorMessageOf(t),
        });
      }
    }
    if (!a) {
      let i = async (n: any) => {
        let i = Date.now();
        logger.info(`[zcode-model-init] create draft session start`, {
          workspacePath: e.workspacePath,
          workspaceIdentity: e.workspaceIdentity ?? null,
          provider: e.provider,
          hasModelSeed: !!n,
          preferredModel: n,
        });
        let a = await e.zcodeSessionService.createSession({
          workspacePath: e.workspacePath,
          workspaceIdentity: e.workspaceIdentity,
          model: n ? parseLooseModelValue(n) : void 0,
          mode: r ? parseLooseModeValue(r) : void 0,
          persistence: `deferred`,
        });
        return (
          logger.info(`[zcode-model-init] create draft session done`, {
            workspacePath: e.workspacePath,
            workspaceIdentity: e.workspaceIdentity ?? null,
            provider: e.provider,
            draftSessionId: a.session.sessionId,
            durationMs: Date.now() - i,
            totalDurationMs: Date.now() - t,
          }),
          a
        );
      };
      try {
        a = await i(n ?? null);
      } catch (r) {
        if (
          (logger.warn(`[zcode-model-init] create draft session failed`, {
            workspacePath: e.workspacePath,
            workspaceIdentity: e.workspaceIdentity ?? null,
            provider: e.provider,
            preferredModel: n ?? null,
            durationMs: Date.now() - t,
            error: errorMessageOf(r),
          }),
          !n)
        )
          throw r;
        a = await i(null);
      }
    }
    if (n) {
      let t = parseLooseModelValue(n),
        r = a.settings.model.current;
      (r.providerId !== t.providerId || r.modelId !== t.modelId || r.variant !== t.variant) &&
        (a = await e.zcodeSessionService.setModel({
          workspacePath: e.workspacePath,
          workspaceIdentity: e.workspaceIdentity,
          sessionId: a.session.sessionId,
          model: t,
        }));
    }
    let s = settingsConfigOptionsOf(a.settings),
      c = i?.trim() || null;
    if (c && a.settings.thoughtLevel.current !== c && hasThoughtLevelOption(s, c))
      try {
        let n = Date.now();
        (logger.info(`[zcode-model-init] set draft thoughtLevel start`, {
          workspacePath: e.workspacePath,
          workspaceIdentity: e.workspaceIdentity ?? null,
          provider: e.provider,
          draftSessionId: a.session.sessionId,
          preferredThoughtLevel: i,
          resolvedPreferredThoughtLevel: c,
        }),
          (a = await e.zcodeSessionService.setThoughtLevel({
            workspacePath: e.workspacePath,
            workspaceIdentity: e.workspaceIdentity,
            sessionId: a.session.sessionId,
            thoughtLevel: c,
          })),
          logger.info(`[zcode-model-init] set draft thoughtLevel done`, {
            workspacePath: e.workspacePath,
            workspaceIdentity: e.workspaceIdentity ?? null,
            provider: e.provider,
            draftSessionId: a.session.sessionId,
            durationMs: Date.now() - n,
            totalDurationMs: Date.now() - t,
            preferredThoughtLevel: i,
            resolvedPreferredThoughtLevel: c,
          }));
      } catch (t) {
        logger.warn(`[zcode-model-init] set draft thoughtLevel failed`, {
          workspacePath: e.workspacePath,
          workspaceIdentity: e.workspaceIdentity ?? null,
          provider: e.provider,
          preferredThoughtLevel: i,
          resolvedPreferredThoughtLevel: c,
          error: errorMessageOf(t),
        });
      }
    let l = applyModeOverrideToOptions(settingsConfigOptionsOf(a.settings), r);
    return (
      logger.info(`[zcode-model-init] draft session ready`, {
        workspacePath: e.workspacePath,
        workspaceIdentity: e.workspaceIdentity ?? null,
        provider: e.provider,
        draftSessionId: a.session.sessionId,
        totalDurationMs: Date.now() - t,
        modelCurrent: `${a.settings.model.current.providerId}/${a.settings.model.current.modelId}`,
        modelAvailableCount: a.settings.model.available.length,
        configOptionsCount: l.length,
        configModelCurrent: modelConfigCurrentValue(l),
        configModelOptionCount: modelConfigOptionCount(l),
        modeCurrent: a.settings.mode.current,
        thoughtLevelCurrent: a.settings.thoughtLevel.current ?? null,
        preferredModel: n ?? null,
        preferredMode: r ?? null,
        preferredThoughtLevel: i ?? null,
      }),
      {
        workspacePath: e.workspacePath,
        preparedSessionId: a.session.sessionId,
        version: `ZCode Protocol/1`,
        provider: e.provider,
        configOptions: l,
        slashCommands: a.slashCommands ?? [],
      }
    );
  }
  let a;
  try {
    a = n
      ? await e.zcodeSessionService.setWorkspaceDefaultModel({
          workspacePath: e.workspacePath,
          workspaceIdentity: e.workspaceIdentity,
          model: parseLooseModelValue(n),
        })
      : await e.zcodeSessionService.readWorkspaceState({
          workspacePath: e.workspacePath,
          workspaceIdentity: e.workspaceIdentity,
        });
  } catch (r) {
    if (
      (logger.warn(`[zcode-model-init] readWorkspaceState failed`, {
        workspacePath: e.workspacePath,
        workspaceIdentity: e.workspaceIdentity ?? null,
        provider: e.provider,
        preferredModel: n ?? null,
        durationMs: Date.now() - t,
        error: errorMessageOf(r),
      }),
      !n)
    )
      throw r;
    a = await e.zcodeSessionService.readWorkspaceState({
      workspacePath: e.workspacePath,
      workspaceIdentity: e.workspaceIdentity,
    });
  }
  if (i && hasThoughtLevelOption(settingsConfigOptionsOf(a.settings), i))
    try {
      a = await e.zcodeSessionService.setWorkspaceDefaultThoughtLevel({
        workspacePath: e.workspacePath,
        workspaceIdentity: e.workspaceIdentity,
        thoughtLevel: i,
      });
    } catch (t) {
      logger.warn(`[zcode-model-init] setWorkspaceDefaultThoughtLevel failed`, {
        workspacePath: e.workspacePath,
        workspaceIdentity: e.workspaceIdentity ?? null,
        provider: e.provider,
        preferredThoughtLevel: i,
        error: errorMessageOf(t),
      });
    }
  let o = Date.now() - t,
    s = settingsConfigOptionsOf(a.settings),
    c = Date.now() - t;
  return (
    logger.info(`[zcode-model-init] readWorkspaceState done`, {
      workspacePath: e.workspacePath,
      workspaceIdentity: e.workspaceIdentity ?? null,
      provider: e.provider,
      readStateDurationMs: o,
      totalDurationMs: c,
      modelCurrent: `${a.settings.model.current.providerId}/${a.settings.model.current.modelId}`,
      modelAvailableCount: a.settings.model.available.length,
      configOptionsCount: s.length,
      configModelCurrent: modelConfigCurrentValue(s),
      configModelOptionCount: modelConfigOptionCount(s),
      modeCurrent: a.settings.mode.current,
      thoughtLevelCurrent: a.settings.thoughtLevel.current ?? null,
      preferredModel: n ?? null,
      preferredThoughtLevel: i ?? null,
    }),
    {
      workspacePath: e.workspacePath,
      preparedSessionId: ``,
      version: `ZCode Protocol/1`,
      provider: e.provider,
      configOptions: s,
      slashCommands: a.slashCommands ?? [],
    }
  );
}
export async function applyWorkspaceDefaultModel(e: any) {
  let t = e.modelId.trim();
  if (!t) return null;
  let n = e.modelRef ?? parseLooseModelValue(t);
  if (e.preferZCodeSession) {
    logger.info(`[workspace-default-model] setWorkspaceDefaultModel start`, {
      requestedProviderId: n.providerId,
      requestedModelId: n.modelId,
      draftSessionId: e.draftSessionId?.trim() || null,
      workspacePath: e.workspacePath,
    });
    let t = await e.zcodeSessionService.setWorkspaceDefaultModel({
      workspacePath: e.workspacePath,
      workspaceIdentity: e.workspaceIdentity,
      model: n,
    });
    logger.info(`[workspace-default-model] setWorkspaceDefaultModel done`, {
      requestedProviderId: n.providerId,
      requestedModelId: n.modelId,
      resultProviderId: t.settings.model.current.providerId,
      resultModelId: t.settings.model.current.modelId,
      availableCount: t.settings.model.available.length,
    });
    let r = settingsConfigOptionsOf(t.settings),
      i = e.draftSessionId?.trim();
    return i
      ? settingsConfigOptionsOf(
          (
            await e.zcodeSessionService.setModel({
              workspacePath: e.workspacePath,
              workspaceIdentity: e.workspaceIdentity,
              sessionId: i,
              model: n,
              persistAsWorkspaceLastUsed: !0,
            })
          ).settings,
        )
      : r;
  }
  return (
    await e.zcodeTaskService.setWorkspacePreferredModel({
      workspacePath: e.workspacePath,
      workspaceIdentity: e.workspaceIdentity,
      provider: e.provider,
      modelId: t,
      modelRef: n,
    }),
    null
  );
}
