// A1-R34: styles-local 24440-24500 逐字实体化（Ng+Nge：会话设置选项构建器 + 思考级现值裁决）。
// 与 jx≡SrcSharedB@5425 buildSessionSettingsViewModel 裁决异构：thoughtLevel 现值经 Set 成员裁决（current 须在 available 集内），jx 取原值，见 A1-R34.report.md §二。
// 助手族值同构（SrcSharedB §jx 族）：Tge≡MODEL_SETTING_ID | Dge≡MODE_SETTING_ID | Ege≡THOUGHT_LEVEL_SETTING_ID | jg≡buildModelSettingOptionValue | Lge≡normalizeSessionModeId | Rge≡listSessionModeOptions。

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
