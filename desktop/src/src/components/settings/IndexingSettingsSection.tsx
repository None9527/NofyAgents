// A0-S4-4a: 自 modules/Settings.tsx 索引分区（§11，原 h2t）原样迁入（组件单元；原文件现为薄 re-export shim）。
// 迁出体 = 原文件 3074–3119；§0 useAppSettings 声明随族迁入。
import { useZCodeIntl as useIntlContext } from '../../modules/I18n'; // G（IntlProvider chunk）
import { isRepoSnapshotIndexingUserEnabled as resolveRepoSnapshotIndexingEnabled } from '../../modules/SrcSharedA'; // Go（4535）
import { useAppSettings } from '../../modules/UsageDeep'; // A1-R11：JM（53488）改指 canonical（components/usage/UsageDeep.tsx §2c）；调用点 23 解构 {settings, update}，update 补丁（39/51）对 AppRuntimeSettingsPatch 索引面可赋。环安全：UsageDeep 值闭包不达本文件
import { SettingsRow, SettingsSectionCard, Switch } from './SettingsRowPrimitives';

/* ── tombstone（A1-R11）：interface AppSettingsSnapshot + declare useAppSettings（原 JM，53440——普查行漂移，bundle 真身 53488）删除，
 *    改经文件头 modules/UsageDeep import 消费（canonical = components/usage/UsageDeep.tsx §2c，JM 53488 逐字）。
 *    型缝：本地快照面十六键一律经 AppRuntimeSettings 索引面（unknown）读取——24 消费点 resolveRepoSnapshotIndexingEnabled
 *    形参 any 面、25 消费点 `=== true` 比较均逐字不变。 ── */

/* --- zustand stores（本 chunk 创建点） --- */

/* ============================================================================
 * 11. 索引分区（原 h2t，js 202286–202336 / jsx 161628）
 * ==========================================================================*/

/** 原 Wt：repoSnapshotIndexingEnabled 的有效值判定（设置层助手，行号见报告） */

export function IndexingSettingsSection() {
  const { intl } = useIntlContext();
  const { settings, update } = useAppSettings();
  const repoSnapshotEnabled = resolveRepoSnapshotIndexingEnabled(settings);
  const instantGrepEnabled = settings?.instantGrepIndexingEnabled === true;
  return (
    <div className="space-y-3">
      <div className="text-ui-base font-medium text-foreground-subtle">
        {intl.formatMessage({ id: "settings.indexing.codebase" })}
      </div>
      <SettingsSectionCard>
        <SettingsRow
          label={intl.formatMessage({ id: "settings.indexing.repoTitle" })}
          description={intl.formatMessage({ id: "settings.indexing.repoDescription" })}
          control={
            <Switch
              checked={repoSnapshotEnabled}
              onCheckedChange={(value) => {
                void update({ repoSnapshotIndexingEnabled: value, repoSnapshotIndexingUserConfigured: true });
              }}
            />
          }
        />
        <SettingsRow
          label={intl.formatMessage({ id: "settings.indexing.instantGrepTitle" })}
          description={intl.formatMessage({ id: "settings.indexing.instantGrepDescription" })}
          control={
            <Switch
              checked={instantGrepEnabled}
              onCheckedChange={(value) => {
                void update({ instantGrepIndexingEnabled: value });
              }}
            />
          }
        />
      </SettingsSectionCard>
    </div>
  );
}

