// A0-S4-4a: 自 modules/Settings.tsx 索引分区（§11，原 h2t）原样迁入（组件单元；原文件现为薄 re-export shim）。
// 迁出体 = 原文件 3074–3119；§0 useAppSettings 声明随族迁入。
import { useZCodeIntl as useIntlContext } from '../../modules/I18n'; // G（IntlProvider chunk）
import { isRepoSnapshotIndexingUserEnabled as resolveRepoSnapshotIndexingEnabled } from '../../modules/SrcSharedA'; // Go（4535）
import { SettingsRow, SettingsSectionCard, Switch } from './SettingsRowPrimitives';

/* §0 声明群随族迁入（原 317–325） */
interface AppSettingsSnapshot {
  memoryEnabled?: boolean;
  nativeSearchEnhancementsEnabled?: boolean;
  askUserQuestionAutoResolutionEnabled?: boolean;
  keepAwakeWhileRunning?: boolean;
  messageStreamShowReasoning?: boolean;
  messageStreamShowTodos?: boolean;
  zcodeInteractionBehavior?: "queue" | "guide";
  optimizeAgentExperienceEnabled?: boolean;
  receivePreviewUpdates?: boolean;
  autoDownloadAndInstallUpdates?: boolean;
  modelProviderFamilyModes?: Record<string, string>;
  modelProviderFamilySelectedKeys?: Record<string, string>;
  providerFamilyDomain?: string;
  instantGrepIndexingEnabled?: boolean;
  repoSnapshotIndexingEnabled?: boolean;
  repoSnapshotIndexingUserConfigured?: boolean;
}
/** 原 JM()（js 53440）：应用设置快照 + 更新器（带广播/监听刷新） */
declare function useAppSettings(): {
  settings: AppSettingsSnapshot | null;
  loading: boolean;
  error: unknown;
  update(patch: Partial<AppSettingsSnapshot>): Promise<void>;
};

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

