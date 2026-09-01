// A0-S4-4a: 自 modules/Settings.tsx 通用分区（§8，原 X2t）原样迁入（组件单元；原文件现为薄 re-export shim）。
// 迁出体 = 原文件 1620–2256；§0 LocalePreference/IntegratedTerminalShell(Setting) 声明随族迁入。
// 行式原语/壳层件改指 components/settings/ 同域文件；§4 选项常量与 §1 testid 经 shim import。
import * as React from "react";
import { Button } from '../../modules/button'; // A0-CLEANUP 族清理：Button declare 改指 button chunk
import { Input } from '../../modules/ImeComposition';
import { useZCodeIntl as useIntlContext } from '../../modules/I18n'; // G（IntlProvider chunk）
import { SettingsRow, SettingsSectionCard, SettingsTitleChip, Select, SelectValue, SelectTrigger, SelectContent, SelectItem, Switch } from './SettingsRowPrimitives';
import { DataBaseDirControl } from './SettingsShellParts';
import { AUTO_ARCHIVE_DAY_OPTIONS, INTERACTION_BEHAVIOR_OPTIONS, SETTINGS_ASK_USER_QUESTION_SWITCH_TESTID, SETTINGS_LOCALE_SELECT_ITEM_TESTID, SETTINGS_LOCALE_SELECT_TRIGGER_TESTID, SETTINGS_NATIVE_SEARCH_SWITCH_TESTID } from '../../modules/Settings';

/* §0 声明群随族迁入（原 181 / 223–233） */
type LocalePreference = "system" | "zh-CN" | "en-US";
interface IntegratedTerminalShell {
  id: string;
  label: string;
  path: string;
  dialect?: string;
  source: "system" | "bundled" | string;
}
type IntegratedTerminalShellSetting =
  | { mode: "auto" }
  | { mode: "shell"; id: string; label: string; path: string; dialect?: string };


/* ============================================================================
 * 8. 通用分区（原 X2t，js 203966–204527 / jsx 162699）
 *    行式 24 项：语言 | 终端×3+原生搜索 | HTTP 代理×3 | 更新×3+通知×2+托盘+保活
 *    | 交互行为+自动解决+推理/TODO 展示 | 自动归档×2 | 数据目录 | onboarding | 性能模式
 * ==========================================================================*/

export interface GeneralSettingsSectionProps {
  localePreference: LocalePreference;
  notificationEnabled: boolean;
  notificationSoundEnabled: boolean;
  closeToTrayOnWindows: boolean;
  keepAwakeWhileRunning?: boolean;
  desktopChromiumHardwareAccelerationEnabled?: boolean;
  receivePreviewUpdates: boolean;
  autoDownloadAndInstallUpdates: boolean;
  dataBaseDir: string;
  terminalInheritSystemProfile?: boolean;
  terminalFontFamily?: string;
  integratedTerminalShell?: IntegratedTerminalShellSetting;
  integratedTerminalShellOptions?: IntegratedTerminalShell[];
  nativeSearchEnhancementsEnabled: boolean;
  httpProxy?: string;
  httpProxyNoProxy?: string;
  httpProxyCaCertPath?: string;
  defaultHomeDir: string;
  isDesktop: boolean;
  isWindowsDesktop: boolean;
  /** 原 j9 透传 `platform: x`（X2t 未解构使用，保留以对齐调用面） */
  platform?: unknown;
  showIntegratedTerminalShell?: boolean;
  setLocalePreference: (v: LocalePreference) => void;
  setNotificationEnabled: (v: boolean) => void;
  setNotificationSoundEnabled: (v: boolean) => void;
  taskAutoArchiveEnabled: boolean;
  taskAutoArchiveOlderThanDays: number;
  messageStreamShowReasoning: boolean;
  messageStreamShowTodos: boolean;
  zcodeInteractionBehavior: "queue" | "guide";
  askUserQuestionAutoResolutionEnabled?: boolean;
  optimizeAgentExperienceEnabled: boolean;
  onDataBaseDirChange: (dir: string) => Promise<void>;
  onSelectDataBaseDir: () => Promise<string | null | undefined>; // A0-CLEANUP3 3b：ImeComposition.selectDirectory 值域含 undefined，函数体以 !selected 兜底
  onTerminalInheritSystemProfileChange?: (v: boolean) => Promise<void>;
  onTerminalFontFamilyChange?: (v: string) => Promise<void>;
  onIntegratedTerminalShellChange?: (v: IntegratedTerminalShellSetting) => Promise<void>;
  onNativeSearchEnhancementsEnabledChange: (v: boolean) => Promise<void>;
  onHttpProxyChange?: (v: string) => Promise<void>;
  onHttpProxyNoProxyChange?: (v: string) => Promise<void>;
  onHttpProxyCaCertPathChange?: (v: string) => Promise<void>;
  onTaskAutoArchiveEnabledChange: (v: boolean) => Promise<void>;
  onTaskAutoArchiveOlderThanDaysChange: (v: number) => Promise<void>;
  onCloseToTrayOnWindowsChange: (v: boolean) => Promise<void>;
  onKeepAwakeWhileRunningChange?: (v: boolean) => Promise<void>;
  onDesktopChromiumHardwareAccelerationChange?: (v: boolean) => Promise<void>;
  onReceivePreviewUpdatesChange: (v: boolean) => Promise<void>;
  onAutoDownloadAndInstallUpdatesChange: (v: boolean) => Promise<void>;
  onMessageStreamShowReasoningChange: (v: boolean) => Promise<void>;
  onMessageStreamShowTodosChange: (v: boolean) => Promise<void>;
  onZCodeInteractionBehaviorChange: (v: "queue" | "guide") => Promise<void>;
  onAskUserQuestionAutoResolutionEnabledChange?: (v: boolean) => Promise<void>;
  onOptimizeAgentExperienceEnabledChange: (v: boolean) => Promise<void>;
  onOpenOnboardingDialog: () => void;
}

export function GeneralSettingsSection({
  localePreference,
  notificationEnabled,
  notificationSoundEnabled,
  closeToTrayOnWindows,
  keepAwakeWhileRunning = false,
  desktopChromiumHardwareAccelerationEnabled = true,
  receivePreviewUpdates,
  autoDownloadAndInstallUpdates,
  dataBaseDir,
  terminalInheritSystemProfile = true,
  terminalFontFamily = "",
  integratedTerminalShell = { mode: "auto" },
  integratedTerminalShellOptions = [],
  nativeSearchEnhancementsEnabled,
  httpProxy = "",
  httpProxyNoProxy = "",
  httpProxyCaCertPath = "",
  defaultHomeDir,
  isDesktop,
  isWindowsDesktop,
  showIntegratedTerminalShell = false,
  setLocalePreference,
  setNotificationEnabled,
  setNotificationSoundEnabled,
  taskAutoArchiveEnabled,
  taskAutoArchiveOlderThanDays,
  messageStreamShowReasoning,
  messageStreamShowTodos,
  zcodeInteractionBehavior,
  askUserQuestionAutoResolutionEnabled = true,
  optimizeAgentExperienceEnabled,
  onDataBaseDirChange,
  onSelectDataBaseDir,
  onTerminalInheritSystemProfileChange = async () => {},
  onTerminalFontFamilyChange = async () => {},
  onIntegratedTerminalShellChange = async () => {},
  onNativeSearchEnhancementsEnabledChange,
  onHttpProxyChange = async () => {},
  onHttpProxyNoProxyChange = async () => {},
  onHttpProxyCaCertPathChange = async () => {},
  onTaskAutoArchiveEnabledChange,
  onTaskAutoArchiveOlderThanDaysChange,
  onCloseToTrayOnWindowsChange,
  onKeepAwakeWhileRunningChange = async () => {},
  onDesktopChromiumHardwareAccelerationChange = async () => {},
  onReceivePreviewUpdatesChange,
  onAutoDownloadAndInstallUpdatesChange,
  onMessageStreamShowReasoningChange,
  onMessageStreamShowTodosChange,
  onZCodeInteractionBehaviorChange,
  onAskUserQuestionAutoResolutionEnabledChange = async () => {},
  onOptimizeAgentExperienceEnabledChange,
  onOpenOnboardingDialog,
}: GeneralSettingsSectionProps) {
  const { intl } = useIntlContext();

  /* --- 终端字体族：本地草稿 + 回车/按钮提交（204026–204046） --- */
  const [fontFamilyDraft, setFontFamilyDraft] = React.useState(terminalFontFamily);
  React.useEffect(() => {
    setFontFamilyDraft(terminalFontFamily);
  }, [terminalFontFamily]);
  const fontFamilyTrimmed = fontFamilyDraft.trim();
  const fontFamilyDirty = fontFamilyTrimmed !== terminalFontFamily;

  /* --- 集成终端 shell 选择（仅 win32；204029–204055） --- */
  const shellValue = integratedTerminalShell.mode === "shell" ? integratedTerminalShell.id : "auto";
  const currentShellOption =
    integratedTerminalShell.mode === "shell"
      ? (integratedTerminalShellOptions.find((option) => option.id === integratedTerminalShell.id) ?? {
          dialect: integratedTerminalShell.dialect,
          id: integratedTerminalShell.id,
          label: integratedTerminalShell.label,
          path: integratedTerminalShell.path,
          source: "system",
        })
      : undefined;
  const shellOptions = currentShellOption
    ? [currentShellOption, ...integratedTerminalShellOptions.filter((option) => option.id !== currentShellOption.id)]
    : integratedTerminalShellOptions;
  const saveFontFamily = React.useCallback(async () => {
    await onTerminalFontFamilyChange(fontFamilyTrimmed);
  }, [fontFamilyTrimmed, onTerminalFontFamilyChange]);
  const changeShell = React.useCallback(
    async (value: string) => {
      if (value === "auto") {
        await onIntegratedTerminalShellChange({ mode: "auto" });
        return;
      }
      const option = shellOptions.find((item) => item.id === value);
      if (option) {
        await onIntegratedTerminalShellChange({
          mode: "shell",
          dialect: option.dialect,
          id: option.id,
          label: option.label,
          path: option.path,
        });
      }
    },
    [onIntegratedTerminalShellChange, shellOptions],
  );

  /* --- HTTP 代理三件套：各自的本地草稿 + 脏检测 + 提交（204055–204088） --- */
  const [proxyDraft, setProxyDraft] = React.useState(httpProxy);
  React.useEffect(() => {
    setProxyDraft(httpProxy);
  }, [httpProxy]);
  const proxyTrimmed = proxyDraft.trim();
  const proxyDirty = proxyTrimmed !== httpProxy;
  const saveProxy = React.useCallback(async () => {
    await onHttpProxyChange(proxyTrimmed);
  }, [proxyTrimmed, onHttpProxyChange]);

  const [noProxyDraft, setNoProxyDraft] = React.useState(httpProxyNoProxy);
  React.useEffect(() => {
    setNoProxyDraft(httpProxyNoProxy);
  }, [httpProxyNoProxy]);
  const noProxyNormalized = noProxyDraft
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .join(",");
  const noProxyDirty = noProxyNormalized !== httpProxyNoProxy;
  const saveNoProxy = React.useCallback(async () => {
    await onHttpProxyNoProxyChange(noProxyNormalized);
  }, [noProxyNormalized, onHttpProxyNoProxyChange]);

  const [caCertDraft, setCaCertDraft] = React.useState(httpProxyCaCertPath);
  React.useEffect(() => {
    setCaCertDraft(httpProxyCaCertPath);
  }, [httpProxyCaCertPath]);
  const caCertTrimmed = caCertDraft.trim();
  const caCertDirty = caCertTrimmed !== httpProxyCaCertPath;
  const saveCaCert = React.useCallback(async () => {
    await onHttpProxyCaCertPathChange(caCertTrimmed);
  }, [caCertTrimmed, onHttpProxyCaCertPathChange]);

  return (
    <div className="space-y-4">
      {/* ── 语言（204090–204127）：system / zh-CN / en-US ── */}
      <SettingsSectionCard>
        <SettingsRow
          label={intl.formatMessage({ id: "settings.locale" })}
          description={intl.formatMessage({ id: "settings.localeDescription" })}
          control={
            <Select value={localePreference} onValueChange={(value) => setLocalePreference(value as LocalePreference)}>
              <SelectTrigger
                size="lg"
                className="w-[260px] min-w-0 justify-between"
                data-testid={SETTINGS_LOCALE_SELECT_TRIGGER_TESTID}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="system" data-testid={joinTestidParts(SETTINGS_LOCALE_SELECT_ITEM_TESTID, "system")}>
                  {intl.formatMessage({ id: "settings.locale.system" })}
                </SelectItem>
                <SelectItem value="zh-CN" data-testid={joinTestidParts(SETTINGS_LOCALE_SELECT_ITEM_TESTID, "zh-CN")}>
                  {intl.formatMessage({ id: "settings.locale.zh-CN" })}
                </SelectItem>
                <SelectItem value="en-US" data-testid={joinTestidParts(SETTINGS_LOCALE_SELECT_ITEM_TESTID, "en-US")}>
                  {intl.formatMessage({ id: "settings.locale.en-US" })}
                </SelectItem>
              </SelectContent>
            </Select>
          }
        />
      </SettingsSectionCard>

      {/* ── 终端与搜索（204128–204207） ── */}
      <SettingsSectionCard>
        <SettingsRow
          label={intl.formatMessage({ id: "settings.terminalProfile" })}
          description={intl.formatMessage({ id: "settings.terminalProfileDescription" })}
          control={
            <Switch
              checked={terminalInheritSystemProfile}
              onCheckedChange={(value) => {
                void onTerminalInheritSystemProfileChange(value);
              }}
            />
          }
        />
        <SettingsRow
          label={intl.formatMessage({ id: "settings.terminalFontFamily" })}
          description={intl.formatMessage({ id: "settings.terminalFontFamilyDescription" })}
          control={
            <Button type="button" size="lg" disabled={!fontFamilyDirty} onClick={() => void saveFontFamily()}>
              {intl.formatMessage({ id: "settings.dataBaseDirSave" })}
            </Button>
          }
          detail={
            <Input
              size="lg"
              value={fontFamilyDraft}
              placeholder={intl.formatMessage({ id: "settings.terminalFontFamilyPlaceholder" })}
              onChange={(event) => {
                setFontFamilyDraft(event.currentTarget.value);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && fontFamilyDirty) void saveFontFamily();
              }}
              className="max-w-[520px] font-mono"
            />
          }
        />
        {showIntegratedTerminalShell ? (
          <SettingsRow
            label={intl.formatMessage({ id: "settings.integratedTerminalShell" })}
            description={intl.formatMessage({ id: "settings.integratedTerminalShellDescription" })}
            control={
              <Select value={shellValue} onValueChange={(value) => void changeShell(value)}>
                <SelectTrigger size="lg" className="w-[260px] min-w-0 justify-between">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">{intl.formatMessage({ id: "settings.integratedTerminalShell.auto" })}</SelectItem>
                  {shellOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            }
          />
        ) : null}
        <SettingsRow
          label={intl.formatMessage({ id: "settings.nativeSearchEnhancements" })}
          description={intl.formatMessage({ id: "settings.nativeSearchEnhancementsDescription" })}
          control={
            <Switch
              aria-label={intl.formatMessage({ id: "settings.nativeSearchEnhancements" })}
              checked={nativeSearchEnhancementsEnabled}
              data-testid={SETTINGS_NATIVE_SEARCH_SWITCH_TESTID}
              onCheckedChange={(value) => {
                void onNativeSearchEnhancementsEnabledChange(value);
              }}
            />
          }
        />
      </SettingsSectionCard>

      {/* ── HTTP 代理（204208–204280）：地址 / 不走代理清单 / CA 证书路径 ── */}
      <SettingsSectionCard>
        <SettingsRow
          label={intl.formatMessage({ id: "settings.httpProxy" })}
          description={intl.formatMessage({ id: "settings.httpProxyDescription" })}
          control={
            <Button type="button" size="lg" disabled={!proxyDirty} onClick={() => void saveProxy()}>
              {intl.formatMessage({ id: "settings.dataBaseDirSave" })}
            </Button>
          }
          detail={
            <Input
              size="lg"
              value={proxyDraft}
              placeholder={intl.formatMessage({ id: "settings.httpProxyPlaceholder" })}
              onChange={(event) => {
                setProxyDraft(event.currentTarget.value);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && proxyDirty) void saveProxy();
              }}
              className="max-w-[520px] font-mono"
            />
          }
        />
        <SettingsRow
          label={intl.formatMessage({ id: "settings.httpProxyNoProxy" })}
          description={intl.formatMessage({ id: "settings.httpProxyNoProxyDescription" })}
          control={
            <Button type="button" size="lg" disabled={!noProxyDirty} onClick={() => void saveNoProxy()}>
              {intl.formatMessage({ id: "settings.dataBaseDirSave" })}
            </Button>
          }
          detail={
            <Input
              size="lg"
              value={noProxyDraft}
              placeholder={intl.formatMessage({ id: "settings.httpProxyNoProxyPlaceholder" })}
              onChange={(event) => {
                setNoProxyDraft(event.currentTarget.value);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && noProxyDirty) void saveNoProxy();
              }}
              className="max-w-[520px] font-mono"
            />
          }
        />
        <SettingsRow
          label={intl.formatMessage({ id: "settings.httpProxyCaCertPath" })}
          description={intl.formatMessage({ id: "settings.httpProxyCaCertPathDescription" })}
          control={
            <Button type="button" size="lg" disabled={!caCertDirty} onClick={() => void saveCaCert()}>
              {intl.formatMessage({ id: "settings.dataBaseDirSave" })}
            </Button>
          }
          detail={
            <Input
              size="lg"
              value={caCertDraft}
              placeholder={intl.formatMessage({ id: "settings.httpProxyCaCertPathPlaceholder" })}
              onChange={(event) => {
                setCaCertDraft(event.currentTarget.value);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && caCertDirty) void saveCaCert();
              }}
              className="max-w-[520px] font-mono"
            />
          }
        />
      </SettingsSectionCard>

      {/* ── 系统行为：更新（桌面）/通知/托盘/保活（204281–204368） ── */}
      <SettingsSectionCard>
        {isDesktop ? (
          <>
            <SettingsRow
              label={intl.formatMessage({ id: "settings.desktopChromiumHardwareAcceleration" })}
              description={intl.formatMessage({ id: "settings.desktopChromiumHardwareAccelerationDescription" })}
              control={
                <Switch
                  aria-label={intl.formatMessage({ id: "settings.desktopChromiumHardwareAcceleration" })}
                  checked={desktopChromiumHardwareAccelerationEnabled}
                  onCheckedChange={(value) => {
                    void onDesktopChromiumHardwareAccelerationChange(value);
                  }}
                />
              }
            />
            <SettingsRow
              label={intl.formatMessage({ id: "settings.receivePreviewUpdates" })}
              description={intl.formatMessage({ id: "settings.receivePreviewUpdatesDescription" })}
              control={
                <Switch
                  aria-label={intl.formatMessage({ id: "settings.receivePreviewUpdates" })}
                  checked={receivePreviewUpdates}
                  onCheckedChange={(value) => {
                    void onReceivePreviewUpdatesChange(value);
                  }}
                />
              }
            />
            <SettingsRow
              label={intl.formatMessage({ id: "settings.autoDownloadAndInstallUpdates" })}
              description={intl.formatMessage({ id: "settings.autoDownloadAndInstallUpdatesDescription" })}
              control={
                <Switch
                  aria-label={intl.formatMessage({ id: "settings.autoDownloadAndInstallUpdates" })}
                  checked={autoDownloadAndInstallUpdates}
                  onCheckedChange={(value) => {
                    void onAutoDownloadAndInstallUpdatesChange(value);
                  }}
                />
              }
            />
          </>
        ) : null}
        <SettingsRow
          label={intl.formatMessage({ id: "settings.notification" })}
          description={intl.formatMessage({ id: "settings.notificationDescription" })}
          control={<Switch checked={notificationEnabled} onCheckedChange={setNotificationEnabled} />}
        />
        <SettingsRow
          label={intl.formatMessage({ id: "settings.notificationSound" })}
          description={intl.formatMessage({ id: "settings.notificationSoundDescription" })}
          control={
            <Switch
              checked={notificationSoundEnabled}
              disabled={!notificationEnabled}
              onCheckedChange={setNotificationSoundEnabled}
            />
          }
        />
        {isWindowsDesktop ? (
          <SettingsRow
            label={intl.formatMessage({ id: "settings.closeToTrayOnWindows" })}
            description={intl.formatMessage({ id: "settings.closeToTrayOnWindowsDescription" })}
            control={
              <Switch
                checked={closeToTrayOnWindows}
                onCheckedChange={(value) => {
                  void onCloseToTrayOnWindowsChange(value);
                }}
              />
            }
          />
        ) : null}
        {isDesktop ? (
          <SettingsRow
            label={intl.formatMessage({ id: "settings.keepAwakeWhileRunning" })}
            description={intl.formatMessage({ id: "settings.keepAwakeWhileRunningDescription" })}
            control={
              <Switch
                aria-label={intl.formatMessage({ id: "settings.keepAwakeWhileRunning" })}
                checked={keepAwakeWhileRunning}
                onCheckedChange={(value) => {
                  void onKeepAwakeWhileRunningChange(value);
                }}
              />
            }
          />
        ) : null}
      </SettingsSectionCard>

      {/* ── 交互行为与流式展示（204369–204438） ── */}
      <SettingsSectionCard>
        <SettingsRow
          label={intl.formatMessage({ id: "settings.zcodeInteractionBehavior" })}
          description={intl.formatMessage({ id: "settings.zcodeInteractionBehaviorDescription" })}
          control={
            <Select
              value={zcodeInteractionBehavior}
              onValueChange={(value) => void onZCodeInteractionBehaviorChange(value as "queue" | "guide")}
            >
              <SelectTrigger size="lg" className="w-[260px] min-w-0 justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INTERACTION_BEHAVIOR_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {intl.formatMessage({ id: `settings.zcodeInteractionBehavior.option.${option}` })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
        />
        <SettingsRow
          label={intl.formatMessage({ id: "settings.askUserQuestionAutoResolution" })}
          description={intl.formatMessage({ id: "settings.askUserQuestionAutoResolutionDescription" })}
          control={
            <Switch
              aria-label={intl.formatMessage({ id: "settings.askUserQuestionAutoResolution" })}
              checked={askUserQuestionAutoResolutionEnabled}
              data-testid={SETTINGS_ASK_USER_QUESTION_SWITCH_TESTID}
              onCheckedChange={(value) => {
                void onAskUserQuestionAutoResolutionEnabledChange(value);
              }}
            />
          }
        />
        <SettingsRow
          label={intl.formatMessage({ id: "settings.messageStreamShowReasoning" })}
          description={intl.formatMessage({ id: "settings.messageStreamShowReasoningDescription" })}
          control={
            <Switch
              aria-label={intl.formatMessage({ id: "settings.messageStreamShowReasoning" })}
              checked={messageStreamShowReasoning}
              onCheckedChange={(value) => {
                void onMessageStreamShowReasoningChange(value);
              }}
            />
          }
        />
        <SettingsRow
          label={intl.formatMessage({ id: "settings.messageStreamShowTodos" })}
          description={intl.formatMessage({ id: "settings.messageStreamShowTodosDescription" })}
          control={
            <Switch
              aria-label={intl.formatMessage({ id: "settings.messageStreamShowTodos" })}
              checked={messageStreamShowTodos}
              onCheckedChange={(value) => {
                void onMessageStreamShowTodosChange(value);
              }}
            />
          }
        />
      </SettingsSectionCard>

      {/* ── 任务自动归档（204439–204483） ── */}
      <SettingsSectionCard>
        <SettingsRow
          label={intl.formatMessage({ id: "settings.taskAutoArchive" })}
          description={intl.formatMessage({ id: "settings.taskAutoArchiveDescription" })}
          control={
            <Switch
              checked={taskAutoArchiveEnabled}
              onCheckedChange={(value) => {
                void onTaskAutoArchiveEnabledChange(value);
              }}
            />
          }
        />
        <SettingsRow
          label={intl.formatMessage({ id: "settings.taskAutoArchiveDays" })}
          description={intl.formatMessage({ id: "settings.taskAutoArchiveDaysDescription" })}
          control={
            <Select
              value={String(taskAutoArchiveOlderThanDays)}
              onValueChange={(value) => {
                void onTaskAutoArchiveOlderThanDaysChange(Number(value));
              }}
              disabled={!taskAutoArchiveEnabled}
            >
              <SelectTrigger size="lg" className="w-[260px] min-w-0 justify-between">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AUTO_ARCHIVE_DAY_OPTIONS.map((days) => (
                  <SelectItem key={days} value={String(days)}>
                    {intl.formatMessage({ id: `settings.taskAutoArchiveDays.option.${days}` })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
        />
      </SettingsSectionCard>

      {/* ── 数据目录（204484–204497） ── */}
      <SettingsSectionCard>
        <SettingsRow
          label={intl.formatMessage({ id: "settings.dataBaseDir" })}
          description={intl.formatMessage({ id: "settings.dataBaseDirDescription" })}
          control={
            <DataBaseDirControl
              dataBaseDir={dataBaseDir}
              defaultHomeDir={defaultHomeDir}
              onDataBaseDirChange={onDataBaseDirChange}
              onSelectDataBaseDir={onSelectDataBaseDir}
            />
          }
        />
      </SettingsSectionCard>

      {/* ── 新手引导（204498–204510） ── */}
      <SettingsSectionCard>
        <SettingsRow
          label={intl.formatMessage({ id: "settings.onboarding" })}
          description={intl.formatMessage({ id: "settings.onboardingDescription" })}
          control={
            <Button type="button" size="lg" variant="outline" onClick={onOpenOnboardingDialog}>
              {intl.formatMessage({ id: "settings.onboardingOpen" })}
            </Button>
          }
        />
      </SettingsSectionCard>

      {/* ── 性能模式（204511–204526） ── */}
      <SettingsSectionCard>
        <SettingsRow
          label={intl.formatMessage({ id: "settings.optimizeAgentExperience" })}
          description={intl.formatMessage({ id: "settings.optimizeAgentExperienceDescription" })}
          control={
            <Switch
              aria-label={intl.formatMessage({ id: "settings.optimizeAgentExperience" })}
              checked={optimizeAgentExperienceEnabled}
              onCheckedChange={(value) => {
                void onOptimizeAgentExperienceEnabledChange(value);
              }}
            />
          }
        />
      </SettingsSectionCard>
    </div>
  );
}

/** 原 Z2t（js 204528）：通用分区标题下的语言 chip */
export function GeneralSettingsTitleChips({ localePreference }: { localePreference: LocalePreference }) {
  const { intl } = useIntlContext();
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <SettingsTitleChip>{intl.formatMessage({ id: `settings.locale.${localePreference}` })}</SettingsTitleChip>
    </div>
  );
}

import { joinTestidParts } from '../../modules/SrcSharedB'; // 〔A1-R42〕原 testidOf（经 modules/Settings 转取，qr 局部转录）收敛改指 canonical joinTestidParts@5017（R41 既判链）。尾部导入（R35 先例）；环安全：本文件→SrcSharedB 纯助手值闭包，无反向边。
