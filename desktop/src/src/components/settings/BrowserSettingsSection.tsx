// A0-S4-4a: 自 modules/Settings.tsx 浏览器分区（§12，原 O2t）原样迁入（组件单元；原文件现为薄 re-export shim）。
// 迁出体 = 原文件 3120–3464；§0 IntlShape/PlatformService/usePlatformService/PluginManagementService/ZcodeSessionService 声明随族迁入。〔A1-R174〕★上句「IntlShape」之 referent 已随本批面收敛移至 @10 之 modules/I18n 导入行（本地 3 行界面已销账、改采 type ZCodeIntl as IntlShape 别名）；「PlatformService」与「usePlatformService」早经 A1-R48 退役（墓碑 @22、改指导入 @6，本批之前即已失 referent）；余二者仍在（PluginManagementService @34／ZcodeSessionService @37）；上句系迁入史实、不删旧文。
// ChromeImportResult/PluginRecord 补 export：前者供 shim §0 PlatformService 签名 type import，后者供 MCP 分区族 type import（型别面，零运行时影响）。
import * as React from "react";
import { LoaderCircle as SpinnerIcon } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0
import { toast, usePlatformService } from '../../modules/ImeComposition'; // 〔A1-R48〕+usePlatformService（原 l）：本地 10 员面碑化改指，见下墓碑
import { useSkillsStore } from '../../modules/SkillStore';
import { useServices, useSessionService } from '../../modules/services'; // A1-R47：+useSessionService（原 Ag 收敛改指）
import { usePluginsStore } from '../../modules/stores-workspace';
import { useZCodeIntl as useIntlContext, type ZCodeIntl as IntlShape } from '../../modules/I18n'; // G（IntlProvider chunk）
import { t as logger } from '../../modules/logger';
import { SettingsRow, SettingsSectionCard, Switch, AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from './SettingsRowPrimitives';
import { PendingOperationButton } from './SettingsShellParts';

/* §0 声明群随族迁入（原 178–180 / 202–213 / 293–295 / 299–301） */
/* ── tombstone〔A1-R174〕面收敛：本地 interface IntlShape（3 行形）删除 → 改采上方 @10 既有导入行之 `type ZCodeIntl as IntlShape` 别名 specifier（canonical modules/I18n@201-203 ZCodeIntl）。
 *    〔别名保名〕故本文件读者之名**逐字不变**、零重锚；成员行与 canonical I18n@202 **逐字节同**（md5 d2ffea415e84）→ **型缝 0**。
 *    读者 1 处：@60 索引取用形（取 IntlShape 之 formatMessage 成员型），所在函数 resolveBrowserImportResultMessage 经 modules/Settings@815 再导出 → 别名与删除同批原子施行；索引面同式先例 WebRemote（A1-R173、型缝 0）。全树已落 21 家（R164 前 11 + R172 六家 + R173 四家）。 ── */
/* ── tombstone〔A1-R48〕：本地 WindowControlsOverlayMetrics 型删除——随 PlatformService 面碑化孤儿（本文件无余引用）；
 *    canonical 富面 getWindowControlsOverlayMetrics?/onWindowControlsOverlayChanged? 以结构内联
 *    { rightPaddingPx?: number } 收边（型面逐字同形）。 ── */
/* ── tombstone〔A1-R48〕：本地 PlatformService 面（10 员）+ declare usePlatformService（原 l）删除 → 改指 canonical =
 *    components/ime/ImeComposition PlatformService 富面 + 真导出。面覆核对：openExternal✓/openInFileManager✓（增补）/
 *    selectDirectory✓（canonical 返型 string|null|undefined 既判形，本件零消费）/syncAppSettings?✓（canonical patch 参
 *    unknown 放宽，本件零消费）/getWindowControlsOverlayMetrics?✓（增补，结构内联）/onWindowControlsOverlayChanged?✓（增补）/
 *    importChromeBrowserData?✓（增补，返型 type import 本文件 ChromeImportResult@49 属主）/
 *    clearEmbeddedBrowserData?✓（增补，mode: "cache"|"all" 同形）/onSettingsChanged?✓（既判 R11）。
 *    消费 @157（hook 位）/@175-176（typeof 守卫）/@213-216（导入调用）/@232-235（清理调用）逐字不变。
 *    负证据：syncAppSettings?/getWindowControlsOverlayMetrics?/onWindowControlsOverlayChanged? 为面仅成员（全文 grep 零消费位）；
 *    本面 10 员与 canonical 富面签名逐项同形（A0 转录源 = modules/Settings §12 同族，均 O2t 迁出体）。
 *    本件 PluginManagementService/ZcodeSessionService 索引签名面不受影响（保留）。
 *    ChromeImportResult@49 export 保留（canonical 签名经 type import 消费，本文件@3 注记既判）。
 *    增补证据见 A1-R47.report §四.6。 ── */
interface PluginManagementService {
  [key: string]: unknown;
}
interface ZcodeSessionService {
  [key: string]: unknown;
}

/* ============================================================================
 * 12. 浏览器分区（原 O2t，js 202904–203128 / jsx 162015）
 *     Browser Use 插件开关 + Chrome 数据导入 + 清缓存/清全部（确认对话框）
 * ==========================================================================*/

/** 原 E9（js 202888）：Browser Use 官方插件 id */
export const BROWSER_USE_PLUGIN_ID = "browser-use@zcode-plugins-official";

export interface ChromeImportResult { // A0-S4-4a：补 export（型别面）——shim §0 PlatformService 签名经 type import 消费
  success: boolean;
  error?: string;
  cookies: { imported: number; skipped: number };
  localStorage: { originsImported: number; entriesImported: number };
  issues?: string[];
}

/** 原 D2t（js 202839）：Chrome 导入结果 → i18n 消息（12 种错误码映射） */
export function resolveBrowserImportResultMessage(
  result: ChromeImportResult,
  formatMessage: IntlShape["formatMessage"],
): string {
  if (!result.success) {
    return formatMessage({
      id:
        result.error === "chrome_profile_not_found" || result.error === "chrome_default_profile_not_found"
          ? "settings.browser.import.notFound"
          : result.error === "chrome_profile_ambiguous"
            ? "settings.browser.import.ambiguous"
            : result.error === "chrome_executable_not_found"
              ? "settings.browser.import.executableNotFound"
              : result.error === "chrome_cookie_access_denied"
                ? "settings.browser.import.accessDenied"
                : result.error === "chrome_cookie_elevation_required"
                  ? "settings.browser.import.elevationRequired"
                  : result.error === "chrome_cookie_elevation_cancelled"
                    ? "settings.browser.import.elevationCancelled"
                    : result.error === "chrome_cookie_helper_verification_failed"
                      ? "settings.browser.import.helperVerificationFailed"
                      : result.error === "chrome_cookie_app_bound_decryption_failed"
                        ? "settings.browser.import.appBoundFailed"
                        : result.error === "chrome_cookie_protection_unsupported"
                          ? "settings.browser.import.cookieProtected"
                          : result.error === "chrome_profile_locked"
                            ? "settings.browser.import.profileLocked"
                            : result.error === "chrome_local_storage_import_failed"
                              ? "settings.browser.import.localStorageFailed"
                              : "settings.browser.import.failed",
    });
  }
  const values = {
    cookies: String(result.cookies.imported),
    origins: String(result.localStorage.originsImported),
    entries: String(result.localStorage.entriesImported),
    skipped: String(result.cookies.skipped),
  };
  const appBoundIssues = result.issues?.some((issue) =>
    [
      "chrome_cookie_elevation_required",
      "chrome_cookie_elevation_cancelled",
      "chrome_cookie_helper_verification_failed",
      "chrome_cookie_app_bound_decryption_failed",
    ].includes(issue),
  );
  return appBoundIssues
    ? formatMessage({ id: "settings.browser.import.partialAppBound" }, values)
    : formatMessage({ id: "settings.browser.import.success" }, values);
}

/* ── tombstone〔A1-R47〕：declare resolveWorkspaceSessionService（原 Ag）删除——收敛改指 services/workspaceServiceHooks useSessionService@406（Ag 真身 styles 24368-24370，
 *  A0-S4-5 已转录；R37 既判）。消费面 @159 改 `useSessionService(...) as ZcodeSessionService`（型缝：unknown → 本地索引签名接口，
 *  invalidateSkillCaches（原 M6）zcodeSessionService 参数型所依）。bundle 证据：O2t（BrowserSettingsSection 孪）@203204 `c = Ag(n ?? void 0, void 0, r)` →
 *  @203227 `zcodeSessionService: c` 形合（browser-use 插件开关广播）。
 *  证据 A1-R47.report.md §二。 ── */


/** 原 B6：插件 store（js 142985，横切层） */
export interface PluginRecord { // A0-S4-4a：补 export（型别面）——MCP 分区族经 type import 消费
  id: string;
  enabled: boolean;
  [key: string]: unknown;
}
interface PluginsStoreState {
  plugins: PluginRecord[];
  loading: boolean;
  error: string | null;
  togglingPluginId: string | null;
  initialize(input: { workspacePath: string; workspaceIdentity?: string | null; pluginService: PluginManagementService }): Promise<void>;
  setEnabled(pluginId: string, enabled: boolean, pluginService: PluginManagementService): Promise<void>;
}
interface PluginsStoreHook {
  <T>(selector: (state: PluginsStoreState) => T): T;
  getState(): PluginsStoreState;
}

/** 原 Ne：技能 store（skillStore chunk 的 t 导出） */

/** 原 M6：技能上下文失效广播（会话服务，F08 横切） */
declare function invalidateSkillCaches(input: {
  zcodeSessionService: ZcodeSessionService;
  workspacePath?: string | null;
  workspaceIdentity?: string | null;
  reason: string;
}): Promise<void>;

export function BrowserSettingsSection({
  isDesktop,
  isWindowsDesktop = false,
  workspacePath,
  workspaceIdentity,
}: {
  isDesktop: boolean;
  isWindowsDesktop?: boolean;
  workspacePath: string | null;
  workspaceIdentity?: string | null;
}) {
  const { intl } = useIntlContext();
  const platform = usePlatformService();
  const { pluginManagementService, skillsService } = useServices();
  const zcodeSessionService = useSessionService(workspacePath ?? undefined, undefined, workspaceIdentity ?? undefined) as ZcodeSessionService; // A1-R47：原 Ag 收敛改指（型缝 unknown → ZcodeSessionService）
  const browserUsePlugin = usePluginsStore((state) => state.plugins.find((plugin) => plugin.id === BROWSER_USE_PLUGIN_ID));
  const pluginsLoading = usePluginsStore((state) => state.loading);
  const pluginsError = usePluginsStore((state) => state.error);
  const togglingPluginId = usePluginsStore((state) => state.togglingPluginId);
  const initializePlugins = usePluginsStore((state) => state.initialize);
  const setPluginEnabled = usePluginsStore((state) => state.setEnabled);
  const refreshSkills = useSkillsStore((state) => state.refresh);
  const skillsWorkspacePath = useSkillsStore((state) => state.workspacePath);
  const skillsWorkspaceIdentity = useSkillsStore((state) => state.workspaceIdentity);
  const [pendingOperation, setPendingOperation] = React.useState<string | null>(null);
  const [confirmClearAllOpen, setConfirmClearAllOpen] = React.useState(false);
  const [lastImportResult, setLastImportResult] = React.useState<ChromeImportResult | null>(null);
  const trimmedIdentity = workspaceIdentity?.trim() || null;
  const chromeDataApisAvailable =
    isDesktop &&
    typeof platform.importChromeBrowserData === "function" &&
    typeof platform.clearEmbeddedBrowserData === "function";

  React.useEffect(() => {
    if (workspacePath) void initializePlugins({ workspacePath, workspaceIdentity, pluginService: pluginManagementService });
  }, [initializePlugins, pluginManagementService, workspaceIdentity, workspacePath]);

  /** 原 O（202929–202938）：开关生效后广播技能缓存失效 + 刷新技能列表 */
  const broadcastPluginToggle = React.useCallback(async () => {
    await invalidateSkillCaches({
      zcodeSessionService,
      workspacePath,
      workspaceIdentity: trimmedIdentity ?? undefined,
      reason: "settings-browser-use-plugin-enabled",
    });
    if (workspacePath && skillsWorkspacePath === workspacePath && skillsWorkspaceIdentity === trimmedIdentity) {
      await refreshSkills(skillsService, trimmedIdentity ?? undefined);
    }
  }, [trimmedIdentity, refreshSkills, skillsWorkspaceIdentity, skillsWorkspacePath, skillsService, workspacePath, zcodeSessionService]);

  /** 原 k（202939–202953）：Browser Use 开关（仅当 store 写入已生效时广播 + toast） */
  const toggleBrowserUse = React.useCallback(
    async (enabled: boolean) => {
      await setPluginEnabled(BROWSER_USE_PLUGIN_ID, enabled, pluginManagementService);
      if (usePluginsStore.getState().plugins.find((plugin) => plugin.id === BROWSER_USE_PLUGIN_ID)?.enabled === enabled) {
        await broadcastPluginToggle();
        toast(
          intl.formatMessage({
            id: enabled ? "settings.browser.control.enabledToast" : "settings.browser.control.disabledToast",
          }),
        );
      }
    },
    [intl, pluginManagementService, broadcastPluginToggle, setPluginEnabled],
  );

  /** 原 A（202954–202968）：导入 Chrome 数据 */
  const importChromeData = React.useCallback(async () => {
    if (!platform.importChromeBrowserData) return;
    setPendingOperation("import");
    try {
      const result = await platform.importChromeBrowserData();
      setLastImportResult(result);
      toast(resolveBrowserImportResultMessage(result, intl.formatMessage), { durationMs: 5000 });
    } catch (error) {
      logger.error("[browser-settings] 导入 Chrome 数据失败", {
        error: error instanceof Error ? error.message : String(error),
      });
      toast(intl.formatMessage({ id: "settings.browser.import.failed" }));
    } finally {
      setPendingOperation(null);
    }
  }, [intl, platform]);

  /** 原 j（202969–202999）：清理内置浏览器数据（cache|all） */
  const clearEmbeddedData = React.useCallback(
    async (mode: "cache" | "all") => {
      if (!platform.clearEmbeddedBrowserData) return;
      setPendingOperation(mode === "cache" ? "clear-cache" : "clear-all");
      try {
        const result = await platform.clearEmbeddedBrowserData(mode);
        toast(
          intl.formatMessage({
            id: result.success
              ? mode === "cache"
                ? "settings.browser.clearCache.success"
                : "settings.browser.clearAll.success"
              : "settings.browser.clear.failed",
          }),
        );
      } catch (error) {
        logger.error("[browser-settings] 清理内置浏览器数据失败", {
          error: error instanceof Error ? error.message : String(error),
          mode,
        });
        toast(intl.formatMessage({ id: "settings.browser.clear.failed" }));
      } finally {
        setPendingOperation(null);
        setConfirmClearAllOpen(false);
      }
    },
    [intl, platform],
  );

  const toggling = togglingPluginId === BROWSER_USE_PLUGIN_ID;
  const controlDisabled = !workspacePath || pluginsLoading || !browserUsePlugin;
  const dataActionsDisabled = !chromeDataApisAvailable;

  return (
    <div className="space-y-5">
      {/* ── 控制：Browser Use 开关（203001–203028） ── */}
      <section className="space-y-3">
        <div className="text-ui-base font-medium text-foreground-subtle">
          {intl.formatMessage({ id: "settings.browser.control.section" })}
        </div>
        <SettingsSectionCard>
          <SettingsRow
            label={intl.formatMessage({ id: "settings.browser.control.title" })}
            description={intl.formatMessage({ id: "settings.browser.control.description" })}
            control={
              <Switch
                aria-label={intl.formatMessage({ id: "settings.browser.control.title" })}
                checked={browserUsePlugin?.enabled === true}
                disabled={controlDisabled || toggling}
                onCheckedChange={(value) => void toggleBrowserUse(value)}
              />
            }
            detail={
              pluginsError ? <div className="text-ui-base text-destructive">{pluginsError}</div> : undefined
            }
          />
        </SettingsSectionCard>
      </section>

      {/* ── 数据：导入 / 清缓存 / 清全部（203029–203088） ── */}
      <section className="space-y-3">
        <div className="text-ui-base font-medium text-foreground-subtle">
          {intl.formatMessage({ id: "settings.browser.data.section" })}
        </div>
        {chromeDataApisAvailable ? null : (
          <div className="rounded-lg border border-border bg-surface px-4 py-3 text-ui-base text-foreground-subtle">
            {intl.formatMessage({ id: "settings.browser.desktopOnly" })}
          </div>
        )}
        <SettingsSectionCard>
          {isWindowsDesktop ? null : (
            <SettingsRow
              label={intl.formatMessage({ id: "settings.browser.import.title" })}
              description={intl.formatMessage({ id: "settings.browser.import.description" })}
              control={
                <PendingOperationButton
                  operation="import"
                  pendingOperation={pendingOperation}
                  disabled={dataActionsDisabled}
                  onClick={() => void importChromeData()}
                >
                  {intl.formatMessage({ id: "settings.browser.import.action" })}
                </PendingOperationButton>
              }
              detail={
                lastImportResult ? (
                  <div className="text-ui-base text-foreground-subtle">
                    {resolveBrowserImportResultMessage(lastImportResult, intl.formatMessage)}
                  </div>
                ) : undefined
              }
            />
          )}
          <SettingsRow
            label={intl.formatMessage({ id: "settings.browser.clearCache.title" })}
            description={intl.formatMessage({ id: "settings.browser.clearCache.description" })}
            control={
              <PendingOperationButton
                operation="clear-cache"
                pendingOperation={pendingOperation}
                disabled={dataActionsDisabled}
                onClick={() => void clearEmbeddedData("cache")}
              >
                {intl.formatMessage({ id: "settings.browser.clearCache.action" })}
              </PendingOperationButton>
            }
          />
          <SettingsRow
            label={intl.formatMessage({ id: "settings.browser.clearAll.title" })}
            description={intl.formatMessage({ id: "settings.browser.clearAll.description" })}
            control={
              <PendingOperationButton
                operation="clear-all"
                pendingOperation={pendingOperation}
                disabled={dataActionsDisabled}
                variant="destructive"
                onClick={() => setConfirmClearAllOpen(true)}
              >
                {intl.formatMessage({ id: "settings.browser.clearAll.action" })}
              </PendingOperationButton>
            }
          />
        </SettingsSectionCard>
      </section>

      {/* ── 清全部确认对话框（203089–203127） ── */}
      <AlertDialog open={confirmClearAllOpen} onOpenChange={setConfirmClearAllOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{intl.formatMessage({ id: "settings.browser.clearAll.confirmTitle" })}</AlertDialogTitle>
            <AlertDialogDescription>
              {intl.formatMessage({ id: "settings.browser.clearAll.confirmDescription" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pendingOperation !== null}>
              {intl.formatMessage({ id: "common.cancel" })}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={pendingOperation !== null}
              onClick={(event) => {
                event.preventDefault();
                void clearEmbeddedData("all");
              }}
            >
              {pendingOperation === "clear-all" ? <SpinnerIcon className="size-4 animate-spin" aria-hidden="true" /> : null}
              {intl.formatMessage({ id: "settings.browser.clearAll.confirmAction" })}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

