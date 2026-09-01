// A1-R34: styles-local 24440-24500 逐字实体化（Ng+Nge：会话设置选项构建器 + 思考级现值裁决）。
// 与 jx≡SrcSharedB@5425 buildSessionSettingsViewModel 裁决异构：thoughtLevel 现值经 Set 成员裁决（current 须在 available 集内），jx 取原值，见 A1-R34.report.md §二。
// 助手族值同构（SrcSharedB §jx 族）：Tge≡MODEL_SETTING_ID | Dge≡MODE_SETTING_ID | Ege≡THOUGHT_LEVEL_SETTING_ID | jg≡buildModelSettingOptionValue | Lge≡normalizeSessionModeId | Rge≡listSessionModeOptions。
// A1-R37: Mge≡parseLooseModeValue（styles 24419-24439 逐字，尾部追加）；唯一消费 53062（NM createSession mode 面，P1 泳道留批）。
// A1-R37 Ag 裁定：Ag@24368-24370 真身 = services/workspaceServiceHooks.ts@406 useSessionService（A0-S4-5 既判实体，modules/services.tsx@113 再导出）；
//   一符一家不重复转录；P1 泳道 tWe（53616 `Ag(t, null, n)`）接引 useSessionService 即解。普查在案：{Ag,Mge} 与 {Ng,Nge} 互消费为零（Ag 仅消费 Oc≡useWorkspaceServices/fs≡useServices）。

import {
  MODEL_SETTING_ID,
  MODE_SETTING_ID,
  THOUGHT_LEVEL_SETTING_ID,
  buildModelSettingOptionValue,
  normalizeSessionModeId,
  listSessionModeOptions,
} from './SrcSharedB';

/** 原 Nge（styles 24495-24500）：思考级现值裁决（current∈available → defaultLevel∈available → 首项） */
export function resolveThoughtLevelCurrentValue(e: any) {
  let t = new Set(e.available.map((e: any) => e.value)),
    n = e.current && t.has(e.current) ? e.current : void 0,
    r = e.defaultLevel && t.has(e.defaultLevel) ? e.defaultLevel : void 0;
  return n ?? r ?? e.available[0]?.value;
}

/** 原 Ng（styles 24440-24494）：会话设置选项构建器（Model/Mode/ThoughtLevel 三选；ThoughtLevel 仅 enabled 时追加） */
export function settingsConfigOptionsOf(e: any) {
  let t: any[] = [
    {
      id: MODEL_SETTING_ID,
      name: `Model`,
      category: `model`,
      type: `select`,
      currentValue: buildModelSettingOptionValue(e.model.current),
      options: e.model.available.map((e: any) => {
        let t = e.reasoning
            ? e.reasoning.enabled
              ? e.reasoning.levels.map((e: any) => e.value)
              : []
            : void 0,
          n =
            e.reasoning?.defaultLevel && t?.includes(e.reasoning.defaultLevel)
              ? e.reasoning.defaultLevel
              : void 0;
        return {
          value: buildModelSettingOptionValue(e.ref),
          name: e.label,
          description: e.description,
          modelProviderId: e.ref.providerId,
          modelProviderName: e.providerLabel ?? e.ref.providerId,
          ...(t ? { modelThoughtLevels: t } : {}),
          ...(n ? { modelDefaultThoughtLevel: n } : {}),
        };
      }),
    },
    {
      id: MODE_SETTING_ID,
      name: `Mode`,
      category: `mode`,
      type: `select`,
      currentValue: normalizeSessionModeId(e.mode.current),
      options: listSessionModeOptions(),
    },
  ];
  return (
    e.thoughtLevel.enabled &&
      t.push({
        id: THOUGHT_LEVEL_SETTING_ID,
        name: `Thought Level`,
        category: `thought_level`,
        type: `select`,
        currentValue: resolveThoughtLevelCurrentValue(e.thoughtLevel) ?? ``,
        options: e.thoughtLevel.available.map((e: any) => ({
          value: e.value,
          name: e.label,
          description: e.description,
        })),
      }),
    t
  );
}

/** 原 Mge（styles 24419-24439）：松散模式值解析（旧别名 → 规范 plan/edit/yolo/auto/build；未知 → undefined）。
 * 〔A1-R37〕型缝：e ≡ 松散模式字符串（bundle 24419；唯一消费 53062 `Mge(r)`，r≡preferredMode.trim()，NM createSession mode 面）。 */
export function parseLooseModeValue(e: any) {
  switch (e) {
    case `plan`:
      return `plan`;
    case `edit`:
      return `edit`;
    case `yolo`:
    case `bypassPermissions`:
    case `dontAsk`:
      return `yolo`;
    case `auto`:
      return `auto`;
    case `build`:
    case `default`:
    case `acceptEdits`:
    case `autoEdit`:
      return `build`;
    default:
      return;
  }
}
