// A1-P1-B8：R0 ConversationPane 簇草稿模型配置会话域逐字转录（XUe 播种 + 草稿模式持久化族 + tWe 会话钩子）。
// 真身基准（只读）：desktop/src/out/renderer/assets/styles-CdEGpc2x.js（md5 48d71d4874b0868d61fd35a328bf6ad5）。
// 映射表（minified → 语义名 → bundle 行）：
//   XUe → seedDraftConfigOptions 53549 | YM → DEFAULT_DRAFT_MODE 53562 | XM → DRAFT_MODE_STORAGE_KEY 53563
//   ZUe → DRAFT_MODE_VALUES 53564 | ZM → getLocalStorageSafe 53565 | QM → validateDraftMode 53572
//   $M → readDraftMode 53577 | QUe → writeDraftMode 53585 | tN → inflightDraftHydrations 53597
//   $Ue → toDraftModelConfig 53598 | eWe → needsDraftHydration 53602
//   tWe → useDraftModelConfigSession 53606（R0 119436 消费；PaneCore 332）
// 跨段注：53594–53596（eN）居本域跨度中段，已在树（./ConversationPaneHelpers，〔A1-P1-B5〕），不入本叶。
// 外部引用改指：Ie→getCurrentModelValue | de→getCurrentThoughtLevelValue | me→applyStoredConfigToOptions
//   xe→useTaskStore | V→readLastAgentModelConfig | J→logger（modules/SkillStore）| Q→React
//   Ag→useSessionService（modules/services 113 ← services/workspaceServiceHooks 406，原 Ag@24368 既判真身）
//   JM→useAppSettings（modules/UsageDeep，styles 53487）| eN→resolveInteractionBehaviorMode（./ConversationPaneHelpers）
//   Mg→parseLooseModelValue（modules/Home）| NM→prepareWorkspaceModelInit（./ConversationModelInit 同簇叶）。
// 函数体内局部变量保留混淆名（B5 约定）；型缝带〔A1-P1-B8〕注释。
// 环安全：本叶 import react / modules/SkillStore / modules/services / modules/UsageDeep / modules/Home
//   + 同簇 ./ConversationPaneHelpers / ./ConversationModelInit；ConversationPaneCore 单向消费本叶。
/* eslint-disable */
import * as React from 'react'; // 原 Q（styles Q←react）
import { getCurrentModelValue, getCurrentThoughtLevelValue, applyStoredConfigToOptions, useTaskStore, readLastAgentModelConfig, logger } from '../../modules/SkillStore'; // 原 Ie/de/me/xe/V/J（styles←skillStore；〔A1-P1-B8〕XUe 播种面 + tWe 状态面）
import { useSessionService } from '../../modules/services'; // 原 Ag（styles 24368；〔A1-P1-B8〕A0 检查点 18 既判真身，tWe 会话服务面）
import { useAppSettings } from '../../modules/UsageDeep'; // 原 JM（styles 53487；〔A1-P1-B8〕tWe 应用设置面）
import { resolveInteractionBehaviorMode } from './ConversationPaneHelpers'; // 原 eN（styles 53594；〔A1-P1-B5〕实体化既有产物）
import { parseLooseModelValue } from '../../modules/Home'; // 原 Mg（styles 24405；〔A1-P1-B8〕tWe 草稿模型解析）
import { prepareWorkspaceModelInit } from './ConversationModelInit'; // 原 NM（styles 52998；〔A1-P1-B8〕同簇叶实体化）

/* ── 〔A1-P1-B8〕草稿模型配置会话域（styles 53549–53593 + 53597–53785，234 行逐字；
 *    XUe 播种 + YM…QUe 草稿模式持久化族 + tN/$Ue/eWe 水合卫星 + tWe useDraftModelConfigSession）。
 *    逐字证明：/tmp/a1r0-p1/p8/r8b-roundtrip.js（R8B ROUNDTRIP EXACT 234 lines）。型缝：见 r8b-seam-log.txt。 ── */
export function seedDraftConfigOptions(e: any) {
  let { provider: t, workspacePath: n, workspaceIdentity: r, baseOptions: i, storage: a } = e,
    o = getCurrentModelValue(i),
    s = getCurrentThoughtLevelValue(i),
    c = a === void 0 ? applyStoredConfigToOptions(t, n, i, r) : applyStoredConfigToOptions(t, n, i, r, a),
    l = getCurrentModelValue(c),
    u = getCurrentThoughtLevelValue(c);
  return {
    seededOptions: c,
    seededModel: l && l !== o ? l : void 0,
    seededThought: u && u !== s ? u : void 0,
  };
}
export var DEFAULT_DRAFT_MODE = `build`,
  DRAFT_MODE_STORAGE_KEY = `zcode-last-draft-collaboration-mode`,
  DRAFT_MODE_VALUES = [`build`, `edit`, `plan`, `yolo`];
export function getLocalStorageSafe() {
  try {
    return globalThis.localStorage === void 0 ? null : globalThis.localStorage;
  } catch {
    return null;
  }
}
export function validateDraftMode(e: any) {
  if (typeof e != `string`) return null;
  let t = e.trim();
  return DRAFT_MODE_VALUES.includes(t) ? t : null;
}
export function readDraftMode(e = getLocalStorageSafe()) {
  if (!e) return DEFAULT_DRAFT_MODE;
  try {
    return validateDraftMode(e.getItem(DRAFT_MODE_STORAGE_KEY)) ?? `build`;
  } catch {
    return DEFAULT_DRAFT_MODE;
  }
}
export function writeDraftMode(e: any, t = getLocalStorageSafe()) {
  let n = validateDraftMode(e);
  if (!n || !t) return null;
  try {
    return (t.setItem(DRAFT_MODE_STORAGE_KEY, n), n);
  } catch {
    return null;
  }
}
export var inflightDraftHydrations = new Map();
export function toDraftModelConfig(e: any, t: any) {
  let n = { ...e, provider: t.providerId, model: t.modelId };
  return (delete n.thought, n);
}
export function needsDraftHydration(e: any) {
  let t = e.configOptions.some((e: any) => e.category === `model` && e.type === `select`);
  return e.slashCommands.length === 0 || (e.sessionId === null && !t);
}
export function useDraftModelConfigSession(e: any) {
  let {
      workspacePath: t,
      workspaceIdentity: n,
      provider: r,
      sessionId: i,
      agentStartupAllowed: a = !0,
    } = e,
    o = n?.trim() || t,
    s = r ?? `glm`,
    c = useSessionService(t, null, n),
    { settings: l } = useAppSettings(),
    u = resolveInteractionBehaviorMode(l),
    d = (0, React.useMemo)<any>(() => (i === null ? { mode: readDraftMode() } : {}), [i, o]),
    f = (0, React.useRef)(d),
    [p, m] = (0, React.useState)(d),
    h = (0, React.useCallback)((e: any) => {
      let t = e(f.current);
      ((f.current = t), m(t));
    }, []),
    g = (0, React.useRef)(!1);
  (0, React.useEffect)(() => {
    let e = d;
    ((f.current = e), m(e), (g.current = !1));
  }, [d]);
  let _ = (0, React.useCallback)(
      (e: any) => {
        if (g.current || f.current.model) {
          g.current = !0;
          return;
        }
        g.current = !0;
        let r = seedDraftConfigOptions({ provider: s, workspacePath: t, workspaceIdentity: n, baseOptions: e });
        (r.seededModel || r.seededThought) && useTaskStore.getState().setConfigOptions(t, r.seededOptions, n);
      },
      [s, n, t],
    ),
    v = (0, React.useMemo)<any>(() => {
      if (i !== null) return;
      let e = { ...d },
        r = readLastAgentModelConfig(s, t, n);
      if (r) {
        let t = parseLooseModelValue(r.model);
        ((e.provider = t.providerId),
          (e.model = t.modelId),
          r.thoughtLevel && (e.thought = r.thoughtLevel));
      }
      return e;
    }, [s, d, i, n, t]),
    y = (0, React.useRef)(v);
  (0, React.useEffect)(() => {
    y.current = v;
  }, [v]);
  let b = (0, React.useCallback)(() => {
      if (!y.current) return;
      let e = { ...y.current };
      return (u && (e.followupMode = u), e);
    }, [u]),
    x = (0, React.useCallback)((e: any) => {
      y.current = { ...y.current, provider: e.provider, model: e.model, thought: e.thought };
    }, []);
  (0, React.useEffect)(() => {
    let e = i === null,
      r = useTaskStore.getState(),
      l = r.getWorkspaceState(t, n);
    if (!a) {
      r.setConfigOptionsStatus(t, `idle`, n);
      return;
    }
    let u = l.configOptions ?? [],
      d = u.some((e) => e.category === `model` && e.type === `select`),
      f = l.slashCommands.length > 0,
      p = needsDraftHydration({ configOptions: u, sessionId: i, slashCommands: l.slashCommands });
    logger.debug(`[v4-workspace-catalog] hydration check`, {
      catalogScope: e ? `draft` : `known-session`,
      hasModelCatalog: d,
      hasSlashCommandCatalog: f,
      flightInProgress: inflightDraftHydrations.has(o),
      configOptionsStatus: l.configOptionsStatus,
      workspaceKey: o,
    });
    let m = inflightDraftHydrations.get(o);
    if (m) {
      e &&
        m.then(() => {
          _(useTaskStore.getState().getWorkspaceState(t, n).configOptions ?? []);
        });
      return;
    }
    if (!p) {
      e && _(u);
      return;
    }
    r.setConfigOptionsStatus(t, `loading`, n);
    let h = prepareWorkspaceModelInit({ workspacePath: t, workspaceIdentity: n, provider: s, zcodeSessionService: c })
      .then((r) => {
        let i = r.configOptions ?? [];
        logger.debug(`[v4-workspace-catalog] hydration done`, {
          catalogScope: e ? `draft` : `known-session`,
          optionCount: i.length,
          slashCommandCount: r.slashCommands?.length ?? 0,
          modelCurrentValue: String(
            i.find((e: any) => e.category === `model` && e.type === `select`)?.currentValue ?? ``,
          ),
          workspaceKey: o,
        });
        let a = useTaskStore.getState();
        (a.setConfigOptions(t, i, n),
          a.setConfigOptionsStatus(t, `ready`, n),
          a.setSlashCommands(t, r.slashCommands ?? [], n),
          e && _(i));
      })
      .catch((e) => {
        (useTaskStore.getState().setConfigOptionsStatus(t, `error`, n),
          logger.warn(`[v4-workspace-catalog] workspace 目录水合失败: ${String(e)}`));
      })
      .finally(() => {
        inflightDraftHydrations.delete(o);
      });
    inflightDraftHydrations.set(o, h);
  }, [a, _, s, i, n, o, t, c]);
  let S = (0, React.useCallback)(
    (e: any, r: any) => {
      let i = useTaskStore.getState(),
        a = i.getWorkspaceState(t, n).configOptions;
      !a ||
        a.length === 0 ||
        i.setConfigOptions(
          t,
          a.map((t) =>
            t.type === `select`
              ? t.category === e
                ? { ...t, currentValue: r }
                : e === `model` && t.category === `thought_level`
                  ? { ...t, currentValue: ``, options: [] }
                  : t
              : t,
          ),
          n,
        );
    },
    [n, t],
  );
  return {
    draftConfig: p,
    draftConfigRef: f,
    resolveInitialDraftConfig: b,
    acceptAuthoritativeDraftModelConfig: x,
    handleDraftSelectModel: (0, React.useCallback)(
      (e: any, r: any) => {
        let i = e ? `${e}/${r}` : r,
          a = parseLooseModelValue(i);
        (logger.debug(`[v4-draft-config] select model`, {
          modelProvider: e,
          model: r,
          modelId: i,
          modelRefProviderId: a.providerId,
          modelRefModelId: a.modelId,
          workspacePath: t,
          workspaceIdentity: n ?? null,
        }),
          h((e: any) => toDraftModelConfig(e, a)),
          S(`model`, i));
      },
      [S, h, n, t],
    ),
    handleDraftSelectThought: (0, React.useCallback)(
      (e: any) => {
        (h((t: any) => ({ ...t, thought: e })), S(`thought_level`, e));
      },
      [S, h],
    ),
    handleDraftSwitchMode: (0, React.useCallback)(
      (e: any) => {
        (h((t: any) => ({ ...t, mode: e })), writeDraftMode(e));
      },
      [h],
    ),
  };
}
