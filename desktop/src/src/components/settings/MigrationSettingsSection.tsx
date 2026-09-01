// A0-S4-4a: 自 modules/SettingsPanelsData.tsx §2 迁移分区 原样迁入（组件单元；原文件现为薄 re-export shim）。
// 迁出体 = 原文件 §0 局部声明（IntlShape）+ §2 全段（732–1272）。导入路径按 components/settings/ 深度改指 ../../modules/。
import * as React from "react";
import { LoaderCircle as SpinnerIcon, RefreshCcw as RefreshIcon, TriangleAlert as AlertIcon, CheckIcon, DownloadIcon } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0
import { CardAction, CardDescription, CardHeader, CardTitle } from '../ui/card'; // A0-S3c：vendored 原语 → npm/components-ui
import { AlertTitle } from '../ui/alert'; // A0-S3c
import { Button } from '../../modules/button';
import { Input } from '../../modules/ImeComposition';
import { MIGRATION_DEFAULT_LIMIT, modifiedSinceOfRange, parseScanLimit, resolveWorkspaceFilterMode } from '../../modules/McpHelpers';
import { invalidateWorkspaceResults as notifySessionsImported } from '../../stores/searchResultsStore'; // A1-R10 2f：原 Qie（jsx 945 / js 1881）declare 改指 canonical = R9 shim（entries → workspaceKey 映射后 invalidateWorkspaceKeys，bundle 1881–1884 逐字）。环安全：shim 值闭包（QuickPick/helpers/taskStore/zustand）不达 components/settings。型缝纠偏见原 declare 位 tombstone
import { Badge } from '../../modules/PaymentDeep';
import { Alert, AlertDescription, Select as SelectRoot, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../modules/Settings';
import { SettingsCard as Card, SettingsCardContent as CardContent } from '../../modules/Settings'; // B3 / V3
import { cn } from '../../modules/UtilsCn';
import { useZCodeIntl as useIntlContext } from '../../modules/I18n';
import { t as logger } from '../../modules/logger';
import { useCachedTaskService } from '../../modules/services'; // A1-R47：+useCachedTaskService（原 kg 收敛改指；canonical ≡ workspaceServiceHooks@287）

interface IntlShape {
  formatMessage(descriptor: { id: string }, values?: Record<string, unknown>): string;
}


/* ============================================================================
 * 2. 迁移分区（原 V2t，js 203587–203929 / jsx 162409–162541）
 * ==========================================================================*/

export interface MigrationCandidate {
  sessionId: string;
  previewTitle?: string;
  workspacePath?: string;
  sourcePath?: string;
  updatedAt: Date | number;
  provider?: string;
  [key: string]: unknown;
}
export interface MigrationResultEntry {
  provider?: string;
  sessionId: string;
  workspacePath?: string;
  reason?: string;
}
export interface MigrationImportResult {
  imported: MigrationResultEntry[];
  skipped: MigrationResultEntry[];
  failed: MigrationResultEntry[];
}
export type MigrationSupportState = { supported: true } | { supported: false; reason: "desktopOnly" };

/* 迁移助手（接口级；行号见头部映射 §B） */
/* ── tombstone（A1-R10 2f）：declare function notifySessionsImported(workspaceTabsStore: unknown): void（原 Qie，945）删除，
 *    改经文件头 stores/searchResultsStore import 消费（canonical = invalidateWorkspaceResults）。
 *    束形纠偏：A0 期实参误译为 store 对象——bundle 真形 203528–203533：
 *    `t = r.imported.map((e) => ({ workspacePath: e.workspacePath })); … Qie(t)`，
 *    即 Qie 消费「导入条目 → {workspacePath} 数组」；调用面同步按真形复原（下 167 区）。 ── */
declare function useWorkspaceTabsStoreForMigration(): { getState: () => { ensureWorkspaceTab: (opts: { workspacePath?: string }) => void } }; // hc（3609）
interface MigrationSessionService { // A1-R47 收敛改指：原 kg declare useZcodeSessionServiceForMigration → canonical services/workspaceServiceHooks useCachedTaskService@287（kg 真身 styles 24262-24269：zcodeTaskService 记忆化 + 快照缓存代理，A0-S4-5 已转录；本 declare 原为 useClaudeMigration（原 I2t）内部 kg 调用 @203442 的本地占位）。返回型保留为接口，供 @79 消费面投射目标型（bundle I2t 消费 t.scanImportableClaudeSessions / t.importClaudeSessions）。证据 A1-R47.report.md §二
  scanImportableClaudeSessions: (request: {
    workspacePath?: string;
    workspaceIdentity?: string;
    modifiedSince?: number;
    limit?: number;
  }) => Promise<MigrationCandidate[]>;
  importClaudeSessions: (request: {
    workspacePath?: string;
    workspaceIdentity?: string;
    sessionIds: string[];
  }) => Promise<MigrationImportResult>;
}

/** 原 B2t（jsx 162408）：扫描时间范围 */
export const MIGRATION_RANGES = ["7d", "30d", "90d", "all"];

/** 原 I2t（js 203441）：Claude 迁移状态机 hook */
export function useClaudeMigration(opts: {
  workspacePath: string | null;
  workspaceIdentity?: string | null;
  isDesktop: boolean;
}) {
  const sessionService = useCachedTaskService(opts.workspacePath ?? undefined, undefined, opts.workspaceIdentity) as MigrationSessionService; // A1-R47：原 kg 收敛改指（型缝 unknown → MigrationSessionService）
  const workspaceTabsStore = useWorkspaceTabsStoreForMigration();
  const [filterMode, setFilterMode] = React.useState("all");
  const [range, setRange] = React.useState("30d");
  const [limitInput, setLimitInput] = React.useState(String(MIGRATION_DEFAULT_LIMIT));
  const [candidates, setCandidates] = React.useState<MigrationCandidate[]>([]);
  const [selectedSessionIds, setSelectedSessionIds] = React.useState<string[]>([]);
  const [scanError, setScanError] = React.useState<string | null>(null);
  const [importError, setImportError] = React.useState<string | null>(null);
  const [lastImportResult, setLastImportResult] = React.useState<MigrationImportResult | null>(null);
  const [isScanning, setIsScanning] = React.useState(false);
  const [isImporting, setIsImporting] = React.useState(false);
  const workspaceFilterMode = React.useMemo(() => resolveWorkspaceFilterMode(filterMode, opts.workspacePath), [filterMode, opts.workspacePath]);
  const scanWorkspacePath = React.useMemo(
    () => (workspaceFilterMode === "current" ? opts.workspacePath ?? undefined : undefined),
    [workspaceFilterMode, opts.workspacePath]
  );
  const scanWorkspaceIdentity = React.useMemo(
    () => (workspaceFilterMode === "current" && opts.workspaceIdentity?.trim()) || undefined,
    [opts.workspaceIdentity, workspaceFilterMode]
  );
  const supportState = React.useMemo<MigrationSupportState>(
    () => (opts.isDesktop ? { supported: true } : { supported: false, reason: "desktopOnly" }),
    [opts.isDesktop]
  );
  const scanLimit = React.useMemo(() => parseScanLimit(limitInput), [limitInput]);

  const handleSetFilterMode = React.useCallback(
    (mode: string) => {
      setFilterMode(resolveWorkspaceFilterMode(mode, opts.workspacePath));
    },
    [opts.workspacePath]
  );
  const toggleSessionSelection = React.useCallback((sessionId: string) => {
    setSelectedSessionIds((previous) => (previous.includes(sessionId) ? previous.filter((id) => id !== sessionId) : [...previous, sessionId]));
  }, []);
  const selectAllSessions = React.useCallback(() => {
    setSelectedSessionIds(candidates.map((candidate) => candidate.sessionId));
  }, [candidates]);
  const clearSelectedSessions = React.useCallback(() => {
    setSelectedSessionIds([]);
  }, []);

  const scan = React.useCallback(async () => {
    if (!supportState.supported) return;
    setIsScanning(true);
    setScanError(null);
    try {
      logger.info(
        `[Migration] 开始扫描 Claude 原生历史 workspaceFilter=${scanWorkspacePath ?? "all"} range=${range} limit=${scanLimit ?? "unlimited"}`
      );
      const found = await sessionService.scanImportableClaudeSessions({
        workspacePath: scanWorkspacePath,
        ...(scanWorkspaceIdentity ? { workspaceIdentity: scanWorkspaceIdentity } : {}),
        modifiedSince: modifiedSinceOfRange(range),
        ...(scanLimit === undefined ? {} : { limit: scanLimit }),
      });
      setCandidates(found);
      setSelectedSessionIds((previous) => previous.filter((id) => found.some((candidate) => candidate.sessionId === id)));
      logger.info(`[Migration] Claude 原生历史扫描完成 workspaceFilter=${scanWorkspacePath ?? "all"} count=${found.length}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error("[Migration] 扫描 Claude 原生历史失败", error);
      setScanError(message);
    } finally {
      setIsScanning(false);
    }
  }, [sessionService, scanWorkspaceIdentity, scanWorkspacePath, range, scanLimit, supportState.supported]);

  const importSessions = React.useCallback(
    async (sessionIds: string[]) => {
      if (!supportState.supported || sessionIds.length === 0) return null;
      setIsImporting(true);
      setImportError(null);
      try {
        logger.info(`[Migration] 开始导入 Claude 原生历史 workspaceFilter=${scanWorkspacePath ?? "all"} selected=${sessionIds.length}`);
        const result = await sessionService.importClaudeSessions({
          workspacePath: scanWorkspacePath,
          ...(scanWorkspaceIdentity ? { workspaceIdentity: scanWorkspaceIdentity } : {}),
          sessionIds,
        });
        setLastImportResult(result);
        const settledIds = new Set([
          ...result.imported.map((entry) => entry.sessionId),
          ...result.skipped.map((entry) => entry.sessionId),
          ...result.failed.map((entry) => entry.sessionId),
        ]);
        setSelectedSessionIds((previous) => previous.filter((id) => !settledIds.has(id)));
        if (result.imported.length > 0) {
          const workspacePaths = new Set(result.imported.map((entry) => entry.workspacePath));
          const importedWorkspaceScopes = result.imported.flatMap((entry) => (entry.workspacePath ? [{ workspacePath: entry.workspacePath }] : [])); // A1-R10 2f：bundle 203529–203531 真形（Qie 实参 = 导入条目工作区数组）；无 workspacePath 条目在 bundle 中经 Io(undefined) 产无效键为空操作，此处 flatMap 收口同义
          for (const path of workspacePaths) {
            workspaceTabsStore.getState().ensureWorkspaceTab({ workspacePath: path });
          }
          notifySessionsImported(importedWorkspaceScopes);
        }
        logger.info(
          `[Migration] Claude 原生历史导入完成 workspaceFilter=${scanWorkspacePath ?? "all"} imported=${result.imported.length} skipped=${result.skipped.length} failed=${result.failed.length}`
        );
        return result;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error("[Migration] 导入 Claude 原生历史失败", error);
        setImportError(message);
        return null;
      } finally {
        setIsImporting(false);
      }
    },
    [sessionService, scanWorkspaceIdentity, scanWorkspacePath, supportState.supported, workspaceTabsStore]
  );

  const importSelectedSessions = React.useCallback(async () => importSessions(selectedSessionIds), [importSessions, selectedSessionIds]);

  return {
    supportState,
    workspaceFilterMode,
    setWorkspaceFilterMode: handleSetFilterMode,
    hasCurrentWorkspaceFilter: opts.workspacePath !== null,
    range,
    setRange,
    limitInput,
    setLimitInput,
    scanLimit,
    candidates,
    selectedSessionIds,
    selectedCount: selectedSessionIds.length,
    scanError,
    importError,
    lastImportResult,
    isScanning,
    isImporting,
    scan,
    importSessions,
    importSelectedSessions,
    toggleSessionSelection,
    selectAllSessions,
    clearSelectedSessions,
  };
}

/** 原 L2t（jsx 162301）：跳过原因本地化 */
export function migrationSkipReasonLabel(intl: IntlShape, reason: string | undefined): string {
  return reason === "session_not_found_or_workspace_mismatch"
    ? intl.formatMessage({ id: "settings.migration.reason.session_not_found_or_workspace_mismatch" })
    : reason ?? "";
}

/** 原 R2t（jsx 162310）：跳过/失败明细列表 */
export function MigrationResultItemList(props: { title: string; items: MigrationResultEntry[] }) {
  const { title, items } = props;
  const { intl } = useIntlContext();
  return items.length === 0 ? null : (
    <div className="space-y-2">
      <div className="text-ui-base font-medium text-foreground">{title}</div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={`${item.provider}-${item.sessionId}-${item.reason}`} className="rounded-lg border border-border bg-background px-3 py-2">
            <div className="font-mono text-ui-base text-foreground">{item.sessionId}</div>
            {item.workspacePath ? (
              <div className="mt-1 text-ui-xs text-foreground-subtle">{intl.formatMessage({ id: "settings.migration.workspacePathLabel" })}</div>
            ) : null}
            {item.workspacePath ? (
              <div className="break-all font-mono text-ui-xs text-foreground-subtlest">{item.workspacePath}</div>
            ) : null}
            <div className="mt-1 text-ui-base text-foreground-subtle">{migrationSkipReasonLabel(intl, item.reason)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Card/Alert 原语（Settings.tsx 已抽取；此处按接口声明） */
/* ── tombstone（A0-S3c）：AlertTitle、CardAction、CardDescription、CardHeader、CardTitle declare 删除 → 真实 import（文件头导入块）；映射依据见 A0-S3c.report.md。 ── */





/** 原 z2t（js 203628）：候选会话卡（计数徽章/全选/导入/结果明细） */
export function MigrationCandidatesCard(props: {
  supportState: MigrationSupportState;
  candidates: MigrationCandidate[];
  selectedSessionIds: string[];
  selectedCount: number;
  importError: string | null;
  lastImportResult: MigrationImportResult | null;
  isImporting: boolean;
  dateTimeFormatter: Intl.DateTimeFormat;
  onToggleSelection: (sessionId: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onImportSelected: () => void;
}) {
  const {
    supportState,
    candidates,
    selectedSessionIds,
    selectedCount,
    importError,
    lastImportResult,
    isImporting,
    dateTimeFormatter,
    onToggleSelection,
    onSelectAll,
    onClearSelection,
    onImportSelected,
  } = props;
  const { intl } = useIntlContext();
  return (
    <Card className="border border-border bg-card py-0 shadow-none">
      <CardHeader className="border-b border-border">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>{intl.formatMessage({ id: "settings.migration.candidatesTitle" })}</CardTitle>
              <Badge variant="outline">
                {intl.formatMessage({ id: "settings.migration.candidatesCount" }, { count: String(candidates.length) })}
              </Badge>
              <Badge variant="outline">
                {intl.formatMessage({ id: "settings.migration.selectedCount" }, { count: String(selectedCount) })}
              </Badge>
            </div>
            <CardDescription>{intl.formatMessage({ id: "settings.migration.candidatesDescription" })}</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" size="sm" variant="outline" disabled={!supportState.supported || candidates.length === 0 || isImporting} onClick={onSelectAll}>
              {intl.formatMessage({ id: "settings.migration.selectAll" })}
            </Button>
            <Button type="button" size="sm" variant="outline" disabled={selectedCount === 0 || isImporting} onClick={onClearSelection}>
              {intl.formatMessage({ id: "settings.migration.clearSelection" })}
            </Button>
            <Button type="button" size="sm" disabled={!supportState.supported || selectedCount === 0 || isImporting} onClick={onImportSelected}>
              {isImporting ? <SpinnerIcon className="size-3.5 animate-spin" /> : <DownloadIcon className="size-3.5" />}
              {intl.formatMessage({ id: "settings.migration.importSelected" })}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-4 py-4">
        {importError ? (
          <Alert>
            <AlertIcon className="size-4" />
            <AlertTitle>{intl.formatMessage({ id: "settings.migration.importFailedTitle" })}</AlertTitle>
            <AlertDescription>
              {intl.formatMessage({ id: "settings.migration.importFailedDescription" }, { error: importError })}
            </AlertDescription>
          </Alert>
        ) : null}
        {lastImportResult ? (
          <Alert>
            <CheckIcon className="size-4" />
            <AlertTitle>{intl.formatMessage({ id: "settings.migration.resultTitle" })}</AlertTitle>
            <AlertDescription>
              {intl.formatMessage(
                { id: "settings.migration.resultSummary" },
                {
                  imported: String(lastImportResult.imported.length),
                  skipped: String(lastImportResult.skipped.length),
                  failed: String(lastImportResult.failed.length),
                }
              )}
            </AlertDescription>
          </Alert>
        ) : null}
        {candidates.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-background px-4 py-8 text-center">
            <div className="text-ui-base font-medium text-foreground">{intl.formatMessage({ id: "settings.migration.emptyTitle" })}</div>
            <div className="mt-2 text-ui-base text-foreground-subtle">{intl.formatMessage({ id: "settings.migration.emptyDescription" })}</div>
          </div>
        ) : (
          <div className="space-y-2">
            {candidates.map((candidate) => {
              const selected = selectedSessionIds.includes(candidate.sessionId);
              return (
                <button
                  key={candidate.sessionId}
                  type="button"
                  disabled={isImporting}
                  className={cn(
                    "w-full rounded-lg border px-3 py-3 text-left transition-colors",
                    selected ? "border-primary bg-accent" : "border-border bg-background hover:bg-surface"
                  )}
                  onClick={() => onToggleSelection(candidate.sessionId)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                        selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-input text-transparent"
                      )}
                    >
                      <CheckIcon className="size-3.5" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="min-w-0 flex-1 text-ui-base font-medium text-foreground">
                          <span className="line-clamp-1 break-all">{candidate.previewTitle || candidate.sessionId}</span>
                        </div>
                        <Badge variant="outline" className="font-mono">
                          {candidate.sessionId.slice(0, 8)}
                        </Badge>
                      </div>
                      <div className="grid gap-2 text-ui-base text-foreground-subtle grid-cols-[minmax(0,1fr)_auto] items-center">
                        <div className="min-w-0 space-y-1">
                          <div className="font-mono text-ui-xs text-foreground-subtle">{candidate.sessionId}</div>
                          <div className="text-ui-xs text-foreground-subtle">
                            {intl.formatMessage({ id: "settings.migration.workspacePathLabel" })}
                          </div>
                          <div className="break-all font-mono text-ui-xs text-foreground-subtlest">{candidate.workspacePath}</div>
                          <div className="line-clamp-1 break-all font-mono text-ui-xs text-foreground-subtlest">{candidate.sourcePath}</div>
                        </div>
                        <div className="text-right text-ui-xs text-foreground-subtle">
                          {intl.formatMessage({ id: "settings.migration.updatedAt" }, { time: dateTimeFormatter.format(candidate.updatedAt) })}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
        {lastImportResult ? (
          <div className="grid grid-cols-2 gap-4">
            <MigrationResultItemList title={intl.formatMessage({ id: "settings.migration.skippedTitle" })} items={lastImportResult.skipped} />
            <MigrationResultItemList title={intl.formatMessage({ id: "settings.migration.failedTitle" })} items={lastImportResult.failed} />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export interface MigrationSettingsSectionProps {
  workspacePath: string | null;
  workspaceIdentity?: string | null;
  isDesktop: boolean;
}

/** 原 V2t（js 203883）：迁移分区根（扫描过滤卡 + 候选卡） */
export function MigrationSettingsSection(props: MigrationSettingsSectionProps) {
  const { workspacePath, workspaceIdentity, isDesktop } = props;
  const { intl, locale } = useIntlContext();
  const {
    supportState,
    workspaceFilterMode,
    setWorkspaceFilterMode,
    hasCurrentWorkspaceFilter,
    range,
    setRange,
    limitInput,
    setLimitInput,
    scanLimit,
    candidates,
    selectedSessionIds,
    selectedCount,
    scanError,
    importError,
    lastImportResult,
    isScanning,
    isImporting,
    scan,
    importSelectedSessions,
    toggleSessionSelection,
    selectAllSessions,
    clearSelectedSessions,
  } = useClaudeMigration({ workspacePath, workspaceIdentity, isDesktop });
  const dateTimeFormatter = React.useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }),
    [locale]
  );
  const unsupportedDescription =
    !supportState.supported && supportState.reason === "desktopOnly"
      ? intl.formatMessage({ id: "settings.migration.unsupported.desktopOnly" })
      : null;

  return (
    <div className="space-y-6">
      <Card className="border border-border bg-card py-0 shadow-none">
        <CardHeader className="border-b border-border">
          <CardAction>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!supportState.supported || isScanning}
              onClick={() => {
                scan();
              }}
            >
              {isScanning ? <SpinnerIcon className="size-3.5 animate-spin" /> : <RefreshIcon className="size-3.5" />}
              {intl.formatMessage({ id: "settings.migration.scan" })}
            </Button>
          </CardAction>
          <div className="space-y-1">
            <CardTitle>{intl.formatMessage({ id: "settings.migration.filtersTitle" })}</CardTitle>
            <CardDescription>{intl.formatMessage({ id: "settings.migration.filtersDescription" })}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-4 py-4">
          {supportState.supported ? null : (
            <Alert>
              <AlertIcon className="size-4" />
              <AlertTitle>{intl.formatMessage({ id: "settings.migration.unsupported.title" })}</AlertTitle>
              <AlertDescription>{unsupportedDescription}</AlertDescription>
            </Alert>
          )}
          <div className="grid gap-4 xl:grid-cols-3">
            <div className="space-y-2">
              <div className="text-ui-base font-medium text-foreground">
                {intl.formatMessage({ id: "settings.migration.workspaceFilterLabel" })}
              </div>
              <SelectRoot
                value={workspaceFilterMode}
                disabled={!supportState.supported || isScanning || isImporting}
                onValueChange={(value) => setWorkspaceFilterMode(value)}
              >
                <SelectTrigger size="lg" className="w-full justify-between">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{intl.formatMessage({ id: "settings.migration.workspaceFilter.all" })}</SelectItem>
                  {hasCurrentWorkspaceFilter ? (
                    <SelectItem value="current">{intl.formatMessage({ id: "settings.migration.workspaceFilter.current" })}</SelectItem>
                  ) : null}
                </SelectContent>
              </SelectRoot>
            </div>
            <div className="space-y-2">
              <div className="text-ui-base font-medium text-foreground">{intl.formatMessage({ id: "settings.migration.rangeLabel" })}</div>
              <SelectRoot value={range} disabled={!supportState.supported || isScanning || isImporting} onValueChange={(value) => setRange(value)}>
                <SelectTrigger size="lg" className="w-full justify-between">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MIGRATION_RANGES.map((rangeId) => (
                    <SelectItem key={rangeId} value={rangeId}>
                      {intl.formatMessage({ id: `settings.migration.range.${rangeId}` })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            </div>
            <div className="space-y-2">
              <div className="text-ui-base font-medium text-foreground">{intl.formatMessage({ id: "settings.migration.limitLabel" })}</div>
              <Input
                type="number"
                min={1}
                max={500}
                value={limitInput}
                disabled={!supportState.supported || isScanning || isImporting}
                onChange={(event) => setLimitInput(event.target.value)}
              />
              <div className="text-ui-base text-foreground-subtle">
                {intl.formatMessage({ id: "settings.migration.limitHint" }, { max: String(scanLimit) })}
              </div>
            </div>
          </div>
          {scanError ? (
            <Alert>
              <AlertIcon className="size-4" />
              <AlertTitle>{intl.formatMessage({ id: "settings.migration.scanFailedTitle" })}</AlertTitle>
              <AlertDescription>
                {intl.formatMessage({ id: "settings.migration.scanFailedDescription" }, { error: scanError })}
              </AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>
      <MigrationCandidatesCard
        supportState={supportState}
        candidates={candidates}
        selectedSessionIds={selectedSessionIds}
        selectedCount={selectedCount}
        importError={importError}
        lastImportResult={lastImportResult}
        isImporting={isImporting}
        dateTimeFormatter={dateTimeFormatter}
        onToggleSelection={toggleSessionSelection}
        onSelectAll={selectAllSessions}
        onClearSelection={clearSelectedSessions}
        onImportSelected={() => {
          importSelectedSessions();
        }}
      />
    </div>
  );
}
