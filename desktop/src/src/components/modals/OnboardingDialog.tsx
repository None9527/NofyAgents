// A0-S4-4a: 自 modules/Modals.tsx Onboarding 对话框子族（§4，原 E3t）原样迁入（组件单元；原文件现为薄 re-export shim）。
// 迁出体 = 原文件 3525–5131；§0 会话迁移/导入选择声明群（原 243–310）随族迁入。
// SettingsSyncService（原体内 3689）补 export：§0 BaseServices（DirectoryBrowser 族）签名经 type import 消费。
import * as React from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../ui/dialog'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { LoaderCircle as IconLoaderCircle } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0
import { HeroCard, useHeroThemeStyles as useHeroTextSizes } from '../../modules/ModalsLeaves'; // +useHeroThemeStyles（A0-D 接线：原 S4t declare → ModalsLeaves canonical，alias useHeroTextSizes）
import { Badge } from '../../modules/PaymentDeep';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../modules/Settings';
import { logger } from '../../modules/SkillStore';
import { useServices, useSessionService } from '../../modules/services'; // A1-R47：+useSessionService（原 Ag 收敛改指）
import { useSettingsStore } from '../../modules/stores-core';
import { useZCodeIntl as useIntlContext } from '../../modules/I18n'; // 原 G，IntlProvider-C321H7m8.js（A0-D 接线：declare → I18n canonical）
import { Button } from '../../modules/button'; // 原 X，button-laUijeDG.js（A0-D 接线：declare → button canonical）
import { cn } from '../../modules/UtilsCn'; // 原 Z，utils-CEEH0K_K.js（A0-D 接线：declare → UtilsCn canonical）
import { Progress } from './UpdateStatusDialog';
import { useConfirmDialog } from './ConfirmDialog';
import type { BaseServices } from './DirectoryBrowserDialog';
import { IconCheck, IconArrowRight, IconFolder, IconRefreshCw, IconFileText, IconTriangleAlert } from '../../modules/Modals'; // §0 图标常量（createLucideIcon 产物）留存 shim

/* §0 声明群随族迁入（原 243–310） */
/* ── tombstone〔A1-R47〕：declare useZcodeSessionService（原 Ag，本 chunk 24320 → styles 24368-24370）删除——收敛改指 services/workspaceServiceHooks useSessionService@406
 *  （Ag 真身，A0-S4-5 已转录；R37 既判）。消费面 @289 改 `useSessionService(...) as ZcodeSessionService`；ZcodeSessionService/SessionImportResult 接口
 *  留存于下（refreshSkillContexts declare 参数型所依）。bundle 证据：s3t（useOnboardingDialogController 孪）@207311 `r = Ag(e.workspacePath, void 0, e.workspaceIdentity)`，
 *  下游唯一消费 = M6 refreshSkillContexts({ zcodeSessionService: r, ... }) 形合。历史标注更正：R44 碑文曾称本簇「原 kg」——实测 kg ≡ zcodeTaskService 记忆化工厂
 *  （useCachedTaskService@287，zcodeSessionService 非其所返），本面为 Ag。证据 A1-R47.report.md §二/§四。 ── */

interface ZcodeSessionService {
  importSessions(sessionIds: string[]): Promise<SessionImportResult | null> | null;
  importError?: string | null;
}
interface SessionImportResult {
  imported: unknown[];
  skipped: unknown[];
  failed: unknown[];
}

/** 技能上下文刷新（原 M6，本 chunk 142697） */
declare function refreshSkillContexts(args: {
  zcodeSessionService: ZcodeSessionService;
  workspacePath: string;
  workspaceIdentity?: string;
  reason: string;
}): Promise<void>;
/** 模型供应商快照失效（原 mM，本 chunk 52639） */
declare function invalidateModelProviderSnapshot(snapshot: unknown, opts: { invalidateInFlightRefresh: boolean }): void;
/** 工作区路径基名（原 Go，本 chunk 1928） */
declare function workspaceBaseLabel(path: string): string;

/** 设置 store（原 ko，Mie 工厂钩子 js 1296）：onboarding 请求标记 */

/** 导入选择 hook（原 R7，本 chunk 193347）：skills/mcpServers/commands 三类共用 */
interface ImportSelectionState {
  selections: Array<{ id: string }>;
  selectedCount: number;
  [key: string]: unknown;
}
declare function useImportSelections(args: {
  category: "skills" | "mcpServers" | "commands";
  enabled: boolean;
  workspacePath?: string;
  workspaceIdentity?: string;
}): ImportSelectionState;

/** 会话迁移扫描 hook（原 I2t，本 chunk 203145） */
interface SessionMigrationState {
  candidates: Array<{ workspacePath: string; sessionId: string }>;
  isScanning: boolean;
  scanError: string | null;
  supportState: { supported: boolean };
  range: string;
  limitInput: string;
  setRange(v: string): void;
  setLimitInput(v: string): void;
  scan(): void;
  importSessions(sessionIds: string[]): Promise<SessionImportResult | null> | null;
  importError?: string | null;
}
/* ── tombstone〔A1-R47〕：declare useSessionMigrationScanner（原 I2t，本 chunk 203145 → styles 203441-203600）删除——收敛改指 settings/MigrationSettingsSection
 *  useClaudeMigration（I2t 真身，R10 期已转录；其内部 kg 消费本批改指 useCachedTaskService）。消费面 @1395 改 useClaudeMigration；
 *  bundle E3t@208546 `I2t({ workspacePath: e.workspacePath ?? null, isDesktop: e.isDesktop })` 实参形合。SessionMigrationState 接口留存（OnboardingSessionStep 属性型），消费面经二段断言投射。
 *  证据 A1-R47.report.md §二。 ── */

/** 设置导入选择视图（原 v$t，本 chunk 193680；Settings 迁移页共用） */
declare const ImportSelectionView: React.FC<{
  category: "skills" | "mcpServers" | "commands";
  state: ImportSelectionState;
  workspacePath?: string;
}>;

/* ============================================================================
 * 4. Onboarding 对话框子族（原 E3t，js 208252-208536 / jsx 165388；
 *    向导支撑 206927-208251）
 * ----------------------------------------------------------------------------
 * 挂载方式（g8t，js 213222-213233）：p4 scope=`onboarding-dialog`
 * resetKeys=[workspaceIdentity || workspacePath] variant=`silent`。
 * 远端数据钩子 R7（useImportSelections，193347）/ I2t（useSessionMigrationScanner，
 * 203145）与共享视图 v$t（ImportSelectionView，193680）在 Settings 迁移页复用，
 * 此处接口级声明（见 §0）。
 * ==========================================================================*/

/** 原 $4t（js 206927 / jsx 164536） */
const ONBOARDING_TASK_STAGGER_MS = 320;

interface OnboardingTask {
  id: string;
  agent: string;
  category: string;
  discoveredCount?: number;
  status: "pending" | "running" | "imported" | "skipped" | "failed";
}
interface OnboardingDiscovery {
  agents: Array<{
    agent: string;
    categories: Array<{
      category: string;
      discoveredCount: number;
      importableCount: number;
      selectedByDefault: boolean;
    }>;
  }>;
}
interface OnboardingControllerState {
  open: boolean;
  loading: boolean;
  importing: boolean;
  step: string;
  discovery: OnboardingDiscovery | null;
  selectedKeys: string[];
  tasks: OnboardingTask[];
  result: {
    successCount: number;
    skippedCount: number;
    failedCount: number;
    taskResults: Array<{ agent: string; category: string; status: string; importedCount: number; skippedCount: number; failedCount: number }>;
  } | null;
  error: string | null;
}

/** 原 F9（js 207218-206940 / jsx 164537） */
function initialOnboardingState(): OnboardingControllerState {
  return {
    open: false,
    loading: false,
    importing: false,
    step: `selection`,
    discovery: null,
    selectedKeys: [],
    tasks: [],
    result: null,
    error: null,
  };
}
/** 原 I9（js 206941 / jsx 164550） */
function selectionKey(agent: string, category: string): string {
  return `${agent}:${category}`;
}
/** 原 e3t（js 207234 / jsx 164553） */
function defaultProviderCategories(): string[] {
  return [`providers`];
}
/** 原 t3t（js 206947-206963 / jsx 164556）：补齐 providers 类别 */
function normalizeDiscovery(discovery: OnboardingDiscovery): OnboardingDiscovery {
  return {
    agents: discovery.agents.map((agent) => {
      const byCategory = new Map(
        agent.categories.map((c): [string, (typeof agent.categories)[number]] => [c.category, c]),
      );
      const ensured = defaultProviderCategories().map(
        (category) =>
          byCategory.get(category) || {
            category,
            discoveredCount: 0,
            importableCount: 0,
            selectedByDefault: false,
          },
      );
      return { ...agent, categories: ensured };
    }),
  };
}
/** 原 n3t（js 207254-206970 / jsx 164573） */
function defaultSelectedKeys(discovery: OnboardingDiscovery): string[] {
  return discovery.agents.flatMap((agent) =>
    agent.categories
      .filter((c) => c.selectedByDefault && c.discoveredCount > 0)
      .map((c) => selectionKey(agent.agent, c.category)),
  );
}
/** 原 r3t（js 206971-206984 / jsx 164576） */
function discoveryToTasks(discovery: OnboardingDiscovery, selectedKeys: string[]): OnboardingTask[] {
  const selected = new Set(selectedKeys);
  return discovery.agents.flatMap((agent) =>
    agent.categories
      .filter((c) => selected.has(selectionKey(agent.agent, c.category)))
      .map((c) => ({
        id: selectionKey(agent.agent, c.category),
        agent: agent.agent,
        category: c.category,
        discoveredCount: c.discoveredCount,
        status: `pending` as const,
      })),
  );
}
/** 原 i3t（js 207275-206990 / jsx 164586） */
function parseSelectionKeys(keys: string[]): Array<{ agent: string; category: string }> {
  return keys.map((key) => {
    const [agent, category] = key.split(`:`);
    return { agent, category };
  });
}
/** 原 a3t（js 206991-207004 / jsx 164595） */
function additionalSelectionsToTasks(
  selections: Array<{
    agent: string;
    category: string;
    sourceScope?: string;
    targetScope?: string;
    skillPaths?: unknown[];
    commandPaths?: unknown[];
    pluginPaths?: unknown[];
    mcpServerPaths?: unknown[];
  }>,
): OnboardingTask[] {
  return selections.map((selection, index) => ({
    id: `${selection.agent}:${selection.category}:${selection.sourceScope ?? `all`}:${selection.targetScope ?? `auto`}:${index}`,
    agent: selection.agent,
    category: selection.category,
    discoveredCount:
      selection.skillPaths?.length ??
      selection.commandPaths?.length ??
      selection.pluginPaths?.length ??
      selection.mcpServerPaths?.length ??
      1,
    status: `pending`,
  }));
}
/** 原 L9（js 207295 / jsx 164604） */
function errorMessageText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
/** 原 o3t（js 207008-207018 / jsx 164607） */
function applyImportTaskResults(tasks: OnboardingTask[], result: NonNullable<OnboardingControllerState["result"]>): OnboardingTask[] {
  const byKey = new Map<string, Array<{ status: string }>>();
  for (const taskResult of result.taskResults) {
    const key = `${taskResult.agent}:${taskResult.category}`;
    byKey.set(key, [...(byKey.get(key) ?? []), taskResult]);
  }
  return tasks.map((task) => {
    const hit = byKey.get(`${task.agent}:${task.category}`)?.shift();
    return hit ? { ...task, status: hit.status as OnboardingTask["status"] } : { ...task, status: `skipped` as const };
  });
}

export interface SettingsSyncService { // A0-S4-4a：补 export（型别面）——DirectoryBrowser 族 BaseServices 签名经 type import 消费
  detect(args: { workspacePath: string; workspaceIdentity?: string }): Promise<OnboardingDiscovery>;
  getFirstRunPromptState(): Promise<{ handled: boolean }>;
  markFirstRunPromptHandled(): Promise<void>;
  importSelected(args: {
    workspacePath: string;
    workspaceIdentity?: string;
    selections: Array<{ agent: string; category: string }>;
  }): Promise<NonNullable<OnboardingControllerState["result"]>>;
  getClaudeAgentsFileMigrationStatus(args: {
    workspacePath?: string;
    workspaceIdentity?: string;
  }): Promise<AgentsFileMigrationStatus | null>;
  copyClaudeAgentsFileToZcodeAgentsFile(args: {
    workspacePath?: string;
    workspaceIdentity?: string;
    overwrite: boolean;
  }): Promise<AgentsFileMigrationStatus & { status?: string }>;
}
interface AgentsFileMigrationStatus {
  supported: boolean;
  sourcePath?: string;
  targetPath?: string;
}

/**
 * 原 s3t（js 207309-207295 / jsx 164624）：onboarding 对话框控制器。
 * 首运行探测（getFirstRunPromptState → detect）→ 打开 selection 步；
 * startImport 走 importSelected 并按 $4t 逐任务推进动画。
 */
function useOnboardingDialogController(e: { workspacePath?: string; workspaceIdentity?: string }) {
  const { settingsSyncService, modelProviderService } = useServices() as unknown as BaseServices & {
    settingsSyncService: SettingsSyncService;
  }; // A0-D：BaseServices 索引签名收敛需经 unknown 二段断言
  const sessionService = useSessionService(e.workspacePath, undefined, e.workspaceIdentity) as ZcodeSessionService; // A1-R47：原 Ag 收敛改指（型缝 unknown → ZcodeSessionService）
  const importRunRef = React.useRef(0);
  const [state, setState] = React.useState<OnboardingControllerState>(initialOnboardingState);
  const reloadDiscovery = React.useCallback(
    async (mode: "firstRun" | "manual" = `firstRun`) => {
      if (!e.workspacePath) return;
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const discovery = normalizeDiscovery(
          await settingsSyncService.detect({
            workspacePath: e.workspacePath,
            workspaceIdentity: e.workspaceIdentity,
          }),
        );
        if (discovery.agents.length === 0) {
          if (mode === `manual`) {
            setState((prev) => ({
              ...prev,
              open: true,
              loading: false,
              step: `selection`,
              discovery,
              selectedKeys: [],
              tasks: [],
              result: null,
              error: null,
            }));
            logger.info(`[settings-sync] discovery empty, keep onboarding open (manual)`, {
              workspacePath: e.workspacePath,
            });
            return;
          }
          await settingsSyncService.markFirstRunPromptHandled();
          setState(initialOnboardingState());
          logger.info(`[settings-sync] discovery empty, prompt handled`, {
            workspacePath: e.workspacePath,
          });
          return;
        }
        const selected = defaultSelectedKeys(discovery);
        setState((prev) => ({
          ...prev,
          open: true,
          loading: false,
          step: `selection`,
          discovery,
          selectedKeys: selected,
          tasks: [],
          result: null,
          error: null,
        }));
        logger.info(`[settings-sync] discovery loaded`, {
          workspacePath: e.workspacePath,
          agentCount: discovery.agents.length,
          selectedCount: selected.length,
        });
      } catch (error) {
        const message = errorMessageText(error);
        logger.error(`[settings-sync] discovery failed`, {
          workspacePath: e.workspacePath,
          error: message,
        });
        setState((prev) => ({ ...prev, open: true, loading: false, error: message }));
      }
    },
    [e.workspaceIdentity, e.workspacePath, settingsSyncService],
  );
  React.useEffect(() => {
    if (!e.workspacePath) {
      setState(initialOnboardingState());
      return;
    }
    let disposed = false;
    (async () => {
      try {
        const promptState = await settingsSyncService.getFirstRunPromptState();
        if (disposed) return;
        if (promptState.handled) {
          setState(initialOnboardingState());
          return;
        }
        await reloadDiscovery();
      } catch (error) {
        const message = errorMessageText(error);
        logger.error(`[settings-sync] first run prompt state failed`, {
          workspacePath: e.workspacePath,
          error: message,
        });
        if (disposed) return;
        setState((prev) => ({ ...prev, open: true, loading: false, error: message }));
      }
    })();
    return () => {
      disposed = true;
    };
  }, [reloadDiscovery, e.workspacePath, settingsSyncService]);
  const selectedCount = state.selectedKeys.length;
  const taskProgress = React.useMemo(() => {
    if (state.tasks.length === 0) return 0;
    const done = state.tasks.filter((t) => t.status !== `pending` && t.status !== `running`).length;
    return Math.round((done / state.tasks.length) * 100);
  }, [state.tasks]);
  const close = React.useCallback(() => {
    importRunRef.current += 1;
    setState((prev) => ({ ...prev, open: false, importing: false }));
    settingsSyncService.markFirstRunPromptHandled().catch((error) => {
      logger.error(`[settings-sync] mark first run prompt handled failed`, {
        workspacePath: e.workspacePath,
        error: errorMessageText(error),
      });
    });
  }, [e.workspacePath, settingsSyncService]);
  const reopen = React.useCallback(() => {
    setState((prev) => {
      if (!prev.discovery && !prev.loading && e.workspacePath) reloadDiscovery(`manual`);
      return { ...prev, open: true };
    });
  }, [reloadDiscovery, e.workspacePath]);
  const toggleSelection = React.useCallback((key: string) => {
    setState((prev) => {
      const next = new Set(prev.selectedKeys);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return { ...prev, selectedKeys: [...next] };
    });
  }, []);
  const setAgentSelection = React.useCallback((agent: string, selected: boolean) => {
    setState((prev) => {
      if (!prev.discovery) return prev;
      const next = new Set(prev.selectedKeys);
      const entry = prev.discovery.agents.find((a) => a.agent === agent);
      if (!entry) return prev;
      for (const category of entry.categories) {
        const key = selectionKey(agent, category.category);
        if (selected) next.add(key);
        else next.delete(key);
      }
      return { ...prev, selectedKeys: [...next] };
    });
  }, []);
  const setCategorySelectionAllAgents = React.useCallback((category: string, selected: boolean) => {
    setState((prev) => {
      if (!prev.discovery) return prev;
      const next = new Set(prev.selectedKeys);
      for (const agent of prev.discovery.agents) {
        if (!agent.categories.some((c) => c.category === category)) continue;
        const key = selectionKey(agent.agent, category);
        if (selected) next.add(key);
        else next.delete(key);
      }
      return { ...prev, selectedKeys: [...next] };
    });
  }, []);
  const runImport = React.useCallback(
    async (additional: Array<{ agent: string; category: string }> = [], options: { includeCurrentSelections?: boolean } = {}) => {
      if (!e.workspacePath) return;
      const includeCurrent = options.includeCurrentSelections ?? true;
      const selections = [...(includeCurrent && state.discovery ? parseSelectionKeys(state.selectedKeys) : []), ...additional];
      if (selections.length === 0) return;
      const runId = importRunRef.current + 1;
      importRunRef.current = runId;
      const tasks =
        state.discovery && includeCurrent
          ? [...discoveryToTasks(state.discovery, state.selectedKeys), ...additionalSelectionsToTasks(additional)]
          : additionalSelectionsToTasks(selections);
      setState((prev) => ({ ...prev, importing: true, step: `importing`, tasks, result: null, error: null }));
      logger.info(`[settings-sync] import started`, {
        workspacePath: e.workspacePath,
        selections,
      });
      const importPromise = settingsSyncService.importSelected({
        workspacePath: e.workspacePath,
        workspaceIdentity: e.workspaceIdentity,
        selections,
      });
      for (let index = 0; index < tasks.length; index += 1) {
        if (importRunRef.current !== runId) return;
        const task = tasks[index];
        if (task)
          setState((prev) => ({
            ...prev,
            tasks: prev.tasks.map((t) => (t.id === task.id ? { ...t, status: `running` } : t)),
          }));
        await new Promise((resolve) => setTimeout(resolve, ONBOARDING_TASK_STAGGER_MS));
      }
      try {
        const result = await importPromise;
        if (importRunRef.current !== runId) return;
        if (selections.some((s) => s.category === `providers`))
          try {
            invalidateModelProviderSnapshot(await modelProviderService.getAll(), { invalidateInFlightRefresh: true });
          } catch (error) {
            logger.error(`[settings-sync] refresh model providers after import failed`, {
              workspacePath: e.workspacePath,
              error: errorMessageText(error),
            });
          }
        if (selections.some((s) => s.category === `skills`))
          await refreshSkillContexts({
            zcodeSessionService: sessionService,
            workspacePath: e.workspacePath,
            workspaceIdentity: e.workspaceIdentity,
            reason: `settings-sync-skill-import`,
          });
        setState((prev) => ({
          ...prev,
          importing: false,
          step: `complete`,
          result,
          tasks: applyImportTaskResults(prev.tasks, result),
        }));
        logger.info(`[settings-sync] import completed`, {
          workspacePath: e.workspacePath,
          result,
        });
      } catch (error) {
        const message = errorMessageText(error);
        if (importRunRef.current !== runId) return;
        logger.error(`[settings-sync] import failed`, { workspacePath: e.workspacePath, error: message });
        setState((prev) => ({
          ...prev,
          importing: false,
          step: `complete`,
          error: message,
          tasks: prev.tasks.map((t) => ({ ...t, status: `failed` })),
          result: {
            successCount: 0,
            skippedCount: 0,
            failedCount: prev.tasks.length,
            taskResults: prev.tasks.map((t) => ({
              agent: t.agent,
              category: t.category,
              status: `failed`,
              importedCount: 0,
              skippedCount: 0,
              failedCount: 1,
            })),
          },
        }));
      }
    },
    [e.workspaceIdentity, e.workspacePath, modelProviderService, settingsSyncService, sessionService, state.discovery, state.selectedKeys],
  );
  const startImport = React.useCallback(async () => {
    await runImport();
  }, [runImport]);
  const finish = React.useCallback(() => {
    close();
  }, [close]);
  return {
    state,
    selectedCount,
    taskProgress,
    actions: {
      close,
      reopen,
      reloadDiscovery,
      toggleSelection,
      setAgentSelection,
      setCategorySelectionAllAgents,
      startImport,
      startImportWithAdditionalSelections: runImport,
      finish,
    },
  };
}

/** 原 c3t（js 207578-207295 / jsx 164907） */
const ONBOARDING_WIZARD_STEPS = [
  { key: `session`, index: 1, titleId: `onboarding.step.session` },
  { key: `skills-import`, index: 2, titleId: `onboarding.step.skillsImport` },
  { key: `mcp-import`, index: 3, titleId: `onboarding.step.mcpImport` },
  { key: `commands-import`, index: 4, titleId: `onboarding.step.commandsImport` },
  { key: `agents-file`, index: 5, titleId: `onboarding.step.agentsFile` },
  { key: `migration`, index: 6, titleId: `onboarding.step.migration` },
] as const;
type OnboardingWizardStepKey = (typeof ONBOARDING_WIZARD_STEPS)[number]["key"];

/** 原 l3t（js 207296-207311 / jsx 164932） */
function onboardingStepTitleKey(step: OnboardingWizardStepKey): string {
  switch (step) {
    case `session`:
      return `session`;
    case `skills-import`:
      return `skillsImport`;
    case `mcp-import`:
      return `mcpImport`;
    case `commands-import`:
      return `commandsImport`;
    case `agents-file`:
      return `agentsFile`;
    case `migration`:
      return `migration`;
  }
}
/** 原 u3t（js 207602-207371 / jsx 164948）：左侧步骤栏 */
function OnboardingStepRail({ currentStep }: { currentStep: OnboardingWizardStepKey }) {
  const { intl } = useIntlContext();
  const currentIndex = ONBOARDING_WIZARD_STEPS.findIndex((s) => s.key === currentStep);
  return (
    <aside className={`flex w-56 shrink-0 flex-col gap-2 p-1`}>
      <div className={`flex h-full flex-col gap-4 rounded-xl border border-border bg-surface p-4`}>
        <div className={`text-ui-base font-medium uppercase tracking-wide text-foreground-subtle`}>
          {intl.formatMessage({ id: `onboarding.wizard.label` })}
        </div>
        <div className={`space-y-2`}>
          {ONBOARDING_WIZARD_STEPS.map((step, index) => {
            const active = step.key === currentStep;
            const done = index < currentIndex;
            return (
              <div
                key={step.key}
                className={cn(
                  `flex items-center gap-3 rounded-xl border-0 px-3 py-3 transition-colors`,
                  active ? `border-border-hover bg-card` : done ? `border-transparent bg-background-alt` : `border-transparent bg-transparent`,
                )}
              >
                <div
                  className={cn(
                    `flex size-6 shrink-0 items-center justify-center rounded-full border text-ui-base font-mono font-semibold`,
                    active
                      ? `bg-primary text-primary-foreground`
                      : done
                        ? `border-success bg-success text-success-foreground`
                        : `border-border bg-background text-foreground-subtle`,
                  )}
                >
                  {done ? <IconCheck className={`size-4`} /> : index + 1}
                </div>
                <div className={`min-w-0`}>
                  <div className={cn(`text-ui-base font-medium`, active || done ? `text-foreground` : `text-foreground-subtle`)}>
                    {intl.formatMessage({ id: step.titleId })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
/** 原 d3t（js 207372-207385 / jsx 164963） */
function OnboardingStepHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className={`space-y-2`}>
      <div className={`text-lg font-medium text-foreground`}>{title}</div>
      {description.trim().length > 0 ? (
        <div className={`text-ui-base leading-6 text-foreground-subtle`}>{description}</div>
      ) : null}
    </div>
  );
}
/** 原 p3t（js 207511 / jsx 164993） */
function isSettingsImportStep(step: OnboardingWizardStepKey): boolean {
  return step === `skills-import` || step === `mcp-import` || step === `commands-import`;
}
/** 原 f3t（js 207676-207510 / jsx 164966）：向导底部导航 */
function OnboardingWizardFooter(e: {
  currentStep: OnboardingWizardStepKey;
  selectedWorkspaceCount: number;
  settingsTaskCount: number;
  finishRunning: boolean;
  finishReady: boolean;
  onBackToWelcome: () => void;
  onBackStep: () => void;
  onNextStep: () => void;
  onBeginMigration: () => void;
  onFinish: () => void;
  beginMigrationDisabled: boolean;
}) {
  const { intl } = useIntlContext();
  const showsBackAndNext = isSettingsImportStep(e.currentStep);
  return (
    <div className={`flex items-center justify-between gap-3`}>
      <div className={`flex min-w-0 flex-1 items-center gap-2`}>
        <span className={`min-w-0 truncate text-ui-base text-foreground-subtle`}>
          {e.currentStep === `session`
            ? intl.formatMessage(
                { id: `onboarding.footer.workspaceSelection` },
                { count: String(e.selectedWorkspaceCount) },
              )
            : intl.formatMessage({ id: `onboarding.footer.helper` })}
        </span>
      </div>
      <div className={`flex shrink-0 items-center gap-2`}>
        {e.currentStep === `session` ? (
          <>
            <Button type="button" variant="secondary" size="lg" className={`h-10 min-w-0 px-5`} onClick={e.onBackToWelcome}>
              {intl.formatMessage({ id: `common.back` })}
            </Button>
            <Button type="button" size="lg" className={`h-10 min-w-0 px-5`} onClick={e.onNextStep}>
              {intl.formatMessage({ id: `onboarding.action.continue` })}
            </Button>
          </>
        ) : null}
        {showsBackAndNext ? (
          <>
            <Button type="button" variant="secondary" size="lg" className={`h-10 min-w-0 px-5`} onClick={e.onBackStep}>
              {intl.formatMessage({ id: `common.back` })}
            </Button>
            <Button type="button" size="lg" className={`h-10 min-w-0 px-5`} onClick={e.onNextStep}>
              {intl.formatMessage({ id: `onboarding.action.continue` })}
            </Button>
          </>
        ) : null}
        {e.currentStep === `agents-file` ? (
          <>
            <Button type="button" variant="secondary" size="lg" className={`h-10 min-w-0 px-5`} onClick={e.onBackStep}>
              {intl.formatMessage({ id: `common.back` })}
            </Button>
            <Button
              type="button"
              size="lg"
              className={`h-10 min-w-0 px-5`}
              disabled={e.beginMigrationDisabled}
              onClick={e.onBeginMigration}
            >
              {intl.formatMessage({ id: `onboarding.action.beginMigration` })}
            </Button>
          </>
        ) : null}
        {e.currentStep === `migration` && e.finishReady ? (
          <Button type="button" size="lg" className={`h-10 min-w-0 px-5`} disabled={e.finishRunning} onClick={e.onFinish}>
            {intl.formatMessage({ id: `settingsSync.action.finish` })}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

/** 原 m3t（js 207780-207516 / jsx 164996）：右半项目选择 hero（F18 共用） */
function ProjectSelectorHero() {
  const { intl } = useIntlContext();
  const sizes = useHeroTextSizes();
  return (
    <HeroCard className={`h-full min-h-0 rounded-xl`} contentClassName={`flex h-full items-center justify-center`}>
      <div className={`space-y-4 text-center`}>
        <div className={`space-y-2`}>
          <p className={cn(`whitespace-nowrap text-3xl font-semibold leading-[1.08] tracking-tight`, sizes.heading)}>
            {intl.formatMessage({ id: `projectSelector.heroTitle` })}
          </p>
          <p className={cn(`mx-auto whitespace-nowrap text-ui-base leading-6`, sizes.description)}>
            {intl.formatMessage({ id: `projectSelector.heroDescription` })}
          </p>
        </div>
      </div>
    </HeroCard>
  );
}

/** 原 s4t（js 205679+ / jsx 163712）：ZCode 字标 SVG */
export function ZCodeLogoSvg({ className }: { className?: string }) { // 〔A1-R146〕补 export：OnboardingLoginLeaves declare BrandWordmarkSvg（原 s4t，束真 styles 205975 为 chunk 导出面）收敛改指所依；本文件内消费逐字不变
  return (
    <svg
      xmlns={`http://www.w3.org/2000/svg`}
      width={`118`}
      height={`100`}
      fill={`none`}
      viewBox={`0 0 256 218`}
      className={cn(`shrink-0 text-current`, className)}
      aria-hidden="true"
      focusable={`false`}
    >
      {/* REBRAND-040+140 */}
      <path
        fill={`none`}
        d={`M78 187 L78 95 A50 50 0 0 1 178 95 L178 187`}
        stroke={`currentColor`}
        strokeWidth={`40`}
      />
    </svg>
  );
}

/** 原 h3t（js 207517-207604 / jsx 165007）：welcome 双栏视图 */
function OnboardingWelcomeView({ onStart, onOpenMigration }: { onStart: () => void; onOpenMigration: () => void }) {
  const { intl } = useIntlContext();
  return (
    <div className={`flex h-full min-h-0`}>
      <div className={`flex w-1/2 flex-col px-8 py-8`}>
        <div className={`space-y-6`}>
          <div className={`inline-flex items-center rounded-full border border-border bg-background-alt px-3 py-1 text-ui-base text-foreground-subtle`}>
            {intl.formatMessage({ id: `onboarding.welcome.eyebrow` })}
          </div>
          <div className={`space-y-2`}>
            {/* REBRAND-040+140 */}
            <div
              className={`relative flex size-14 items-center justify-center rounded-xl bg-[linear-gradient(180deg,#000000_0%,#151718_100%)] text-[#ffffff] shadow-lg/20 before:pointer-events-none before:absolute before:inset-0 before:rounded-xl before:border before:border-[rgba(255,255,255,0.1)]`}
              aria-label="nofy"
              role="img"
            >
              <ZCodeLogoSvg className={`h-auto w-8`} />
            </div>
            <div className={`text-4xl font-bold tracking-tight text-foreground`}>
              {intl.formatMessage({ id: `onboarding.welcome.title` })}
            </div>
          </div>
        </div>
        <div className={`flex flex-1 items-center`}>
          <div className={`w-full space-y-4`}>
            <Button type="button" size="lg" className={`h-10 w-full justify-between text-ui-base`} onClick={onStart}>
              {intl.formatMessage({ id: `onboarding.welcome.start` })}
              <IconArrowRight className={`size-4`} />
            </Button>
            <Button type="button" size="lg" variant="outline" className={`h-10 w-full justify-between text-ui-base`} onClick={onOpenMigration}>
              {intl.formatMessage({ id: `onboarding.welcome.migrate` })}
              <IconArrowRight className={`size-4`} />
            </Button>
          </div>
        </div>
        <div className={`pt-6 text-ui-base leading-6 text-foreground-subtle`}>
          {intl.formatMessage({ id: `onboarding.welcome.helper` })}
        </div>
      </div>
      <div className={`flex w-1/2 flex-col p-2 pl-0`}>
        <ProjectSelectorHero />
      </div>
    </div>
  );
}

/** 原 g3t（js 207881-207609 / jsx 165025） */
interface FinishExecutionState {
  started: boolean;
  running: boolean;
  finished: boolean;
  sessionCompletedCount: number;
  sessionTotalCount: number;
  sessionImportedCount: number;
  sessionSkippedCount: number;
  sessionFailedCount: number;
  agentsFileCompletedCount: number;
  agentsFileTotalCount: number;
  agentsFileImportedCount: number;
  agentsFileSkippedCount: number;
  agentsFileFailedCount: number;
  currentTaskLabel: string | null;
  error: string | null;
}
function initialFinishExecution(): FinishExecutionState {
  return {
    started: false,
    running: false,
    finished: false,
    sessionCompletedCount: 0,
    sessionTotalCount: 0,
    sessionImportedCount: 0,
    sessionSkippedCount: 0,
    sessionFailedCount: 0,
    agentsFileCompletedCount: 0,
    agentsFileTotalCount: 0,
    agentsFileImportedCount: 0,
    agentsFileSkippedCount: 0,
    agentsFileFailedCount: 0,
    currentTaskLabel: null,
    error: null,
  };
}

const SESSION_LIMIT_UNLIMITED = `unlimited`; // 原 j2t

/** 原 _3t（js 207610-207793 / jsx 165044）：session 步（范围/数量/扫描/工作区多选） */
function OnboardingSessionStep(e: {
  migration: SessionMigrationState;
  workspaceCandidates: Array<{ workspacePath: string; label: string; sessionCount: number }>;
  selectedWorkspacePaths: string[];
  onToggleWorkspace: (path: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
}) {
  const { intl } = useIntlContext();
  const selectedCount = e.selectedWorkspacePaths.length;
  const totalCount = e.workspaceCandidates.length;
  const allSelected = totalCount > 0 && selectedCount === totalCount;
  return (
    <div className={`flex h-full min-h-0 flex-1 flex-col gap-6`}>
      <div className={`flex flex-wrap items-center gap-3`}>
        <Select value={e.migration.range} onValueChange={(v) => e.migration.setRange(v)}>
          <SelectTrigger size="lg" className={`h-9 justify-between text-ui-base`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">{intl.formatMessage({ id: `settings.migration.range.7d` })}</SelectItem>
            <SelectItem value="30d">{intl.formatMessage({ id: `settings.migration.range.30d` })}</SelectItem>
            <SelectItem value="90d">{intl.formatMessage({ id: `settings.migration.range.90d` })}</SelectItem>
            <SelectItem value="all">{intl.formatMessage({ id: `settings.migration.range.all` })}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={e.migration.limitInput} onValueChange={(v) => e.migration.setLimitInput(v)}>
          <SelectTrigger size="lg" className={`h-9 justify-between text-ui-base`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[`30`, `50`, `100`, SESSION_LIMIT_UNLIMITED].map((value) => (
              <SelectItem key={value} value={value}>
                {value === `unlimited`
                  ? intl.formatMessage({ id: `onboarding.sessions.unlimited` })
                  : intl.formatMessage({ id: `onboarding.sessions.count` }, { count: value })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="secondary"
          size="lg"
          className={`h-9 min-w-0 px-4 text-ui-base`}
          disabled={!e.migration.supportState.supported || e.migration.isScanning}
          onClick={() => {
            e.migration.scan();
          }}
        >
          {e.migration.isScanning ? <IconLoaderCircle className={`size-4 animate-spin`} /> : null}
          {intl.formatMessage({ id: `settings.migration.scan` })}
        </Button>
      </div>
      {e.migration.scanError ? (
        <div className={`rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-ui-base text-foreground`}>
          {intl.formatMessage({ id: `settings.migration.scanFailedDescription` }, { error: e.migration.scanError })}
        </div>
      ) : null}
      <div className={`min-h-0 flex w-full flex-col flex-1 rounded-xl border border-border bg-background`}>
        <div className={`flex items-center justify-between gap-3 border-b border-border bg-surface/50 px-4 py-3`}>
          <div className={`flex min-w-0 items-center gap-2`}>
            <IconFolder className={`size-4 shrink-0 text-foreground-subtle`} />
            <div className={`flex min-w-0 items-center gap-2`}>
              <div className={`text-ui-base font-medium text-foreground`}>
                {intl.formatMessage({ id: `onboarding.sessions.chooseWorkspace` })}
              </div>
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={totalCount === 0}
            onClick={allSelected ? e.onClearSelection : e.onSelectAll}
          >
            {allSelected
              ? intl.formatMessage({ id: `settingsSync.selection.clearAll` })
              : intl.formatMessage({ id: `settingsSync.selection.selectAll` })}
          </Button>
        </div>
        {e.workspaceCandidates.length === 0 ? (
          <div className={`flex h-full items-center justify-center px-4 text-center text-ui-base text-foreground-subtle`}>
            {intl.formatMessage({ id: `onboarding.sessions.empty` })}
          </div>
        ) : (
          <div className={`flex-1 min-h-0 flex flex-col gap-1 p-2 overflow-y-auto`}>
            {e.workspaceCandidates.map((candidate) => (
              <button
                key={candidate.workspacePath}
                type="button"
                onClick={() => e.onToggleWorkspace(candidate.workspacePath)}
                className={`flex min-w-0 w-full items-start gap-3 rounded-lg bg-background p-3 pl-3 text-left transition-colors hover:bg-surface-hover/50`}
              >
                <div className={`flex size-5 shrink-0 items-center justify-center`}>
                  <div
                    className={`flex size-4 items-center justify-center rounded-sm border ${e.selectedWorkspacePaths.includes(candidate.workspacePath) ? `border-primary bg-primary text-primary-foreground` : `border-border bg-background text-transparent`}`}
                  >
                    <IconCheck className={`size-3.5`} />
                  </div>
                </div>
                <div className={`min-w-0 flex-1 flex flex-col gap-1`}>
                  <div className={`flex min-w-0 items-center gap-3`}>
                    <div className={`min-w-0 truncate text-ui-base font-medium text-foreground`}>{candidate.label}</div>
                    <Badge variant="outline">
                      {intl.formatMessage({ id: `onboarding.sessions.count` }, { count: String(candidate.sessionCount) })}
                    </Badge>
                  </div>
                  <div className={`w-full truncate text-ui-base text-foreground-subtlest`}>{candidate.workspacePath}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** 原 R9（js 208084-207796 / jsx 165129）：导入选择步 → 共享视图 v$t */
function ImportSelectionStep(e: {
  category: "skills" | "mcpServers" | "commands";
  state: ImportSelectionState;
  workspacePath?: string;
}) {
  return <ImportSelectionView category={e.category} state={e.state} workspacePath={e.workspacePath} />;
}

/** 原 v3t（js 207797-207845 / jsx 165136）：迁移进行中视图 */
function MigrationProgressView(e: { overallProgress: number; finishExecution: FinishExecutionState }) {
  const { intl } = useIntlContext();
  return (
    <div className={`flex h-full min-h-0 flex-col justify-center`}>
      <div className={`mx-auto flex w-full max-w-xl flex-col gap-5 rounded-xl bg-background border border-border px-6 py-6`}>
        <div className={`space-y-2`}>
          <div className={`flex items-center justify-between gap-3 text-ui-base text-foreground-subtle`}>
            <span>{intl.formatMessage({ id: `settingsSync.importing.progressLabel` })}</span>
            <span>
              {e.overallProgress}
              {`%`}
            </span>
          </div>
          <Progress value={e.overallProgress} className={`h-2 rounded-full bg-card`} />
        </div>
        <div className={`flex gap-3`}>
          <IconLoaderCircle className={`size-5 animate-spin`} />
          <div>
            <div className={`text-ui-base font-medium text-foreground`}>
              {intl.formatMessage({ id: `onboarding.migration.progress` }, { progress: String(e.overallProgress) })}
            </div>
            <div className={`mt-1 text-ui-base text-foreground-subtle`}>
              {e.finishExecution.currentTaskLabel ?? intl.formatMessage({ id: `onboarding.migration.ready` })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 原 y3t（js 208136-207959 / jsx 165153）：迁移完成三卡汇总 */
function MigrationCompleteView(e: {
  overallProgress: number;
  finishExecution: FinishExecutionState;
  settingsImportedCount: number;
  settingsSkippedCount: number;
  settingsFailedCount: number;
}) {
  const { intl } = useIntlContext();
  return (
    <div className={`flex h-full min-h-0 flex-col gap-8 pt-8`}>
      <div className={`flex flex-col items-center gap-4 text-center`}>
        <div className={`flex size-14 items-center justify-center rounded-full bg-success text-success-foreground`}>
          <IconCheck className={`size-7`} />
        </div>
        <div className={`text-2xl font-medium text-foreground`}>{intl.formatMessage({ id: `onboarding.finish.done` })}</div>
        <div className={`text-ui-base text-foreground-subtle`}>{intl.formatMessage({ id: `onboarding.finish.ready` })}</div>
        {e.finishExecution.error ? (
          <div className={`rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-ui-base text-foreground`}>
            {e.finishExecution.error}
          </div>
        ) : null}
      </div>
      <div className={`grid gap-3 md:grid-cols-3`}>
        <div className={`rounded-xl border border-border bg-card px-4 py-4`}>
          <div className={`text-ui-base font-medium text-foreground`}>
            {intl.formatMessage({ id: `onboarding.finish.summary.sessions` })}
          </div>
          <div className={`mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-ui-base text-foreground-subtle`}>
            <span>{intl.formatMessage({ id: `onboarding.finish.summary.label.imported` })}</span>
            <span>{e.finishExecution.sessionImportedCount}</span>
            <span>{intl.formatMessage({ id: `onboarding.finish.summary.label.skipped` })}</span>
            <span>{e.finishExecution.sessionSkippedCount}</span>
            <span>{intl.formatMessage({ id: `onboarding.finish.summary.label.failed` })}</span>
            <span>{e.finishExecution.sessionFailedCount}</span>
          </div>
        </div>
        <div className={`rounded-xl border border-border bg-card px-4 py-4`}>
          <div className={`text-ui-base font-medium text-foreground`}>
            {intl.formatMessage({ id: `onboarding.finish.summary.agentsFile` })}
          </div>
          <div className={`mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-ui-base text-foreground-subtle`}>
            <span>{intl.formatMessage({ id: `onboarding.finish.summary.label.imported` })}</span>
            <span>{e.finishExecution.agentsFileImportedCount}</span>
            <span>{intl.formatMessage({ id: `onboarding.finish.summary.label.skipped` })}</span>
            <span>{e.finishExecution.agentsFileSkippedCount}</span>
            <span>{intl.formatMessage({ id: `onboarding.finish.summary.label.failed` })}</span>
            <span>{e.finishExecution.agentsFileFailedCount}</span>
          </div>
        </div>
        <div className={`rounded-xl border border-border bg-card px-4 py-4`}>
          <div className={`text-ui-base font-medium text-foreground`}>
            {intl.formatMessage({ id: `onboarding.finish.summary.settings` })}
          </div>
          <div className={`mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-ui-base text-foreground-subtle`}>
            <span>{intl.formatMessage({ id: `onboarding.finish.summary.label.imported` })}</span>
            <span>{e.settingsImportedCount}</span>
            <span>{intl.formatMessage({ id: `onboarding.finish.summary.label.skipped` })}</span>
            <span>{e.settingsSkippedCount}</span>
            <span>{intl.formatMessage({ id: `onboarding.finish.summary.label.failed` })}</span>
            <span>{e.settingsFailedCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 原 b3t（js 207960-208072 / jsx 165187）：AGENTS.md 迁移步 */
function AgentsFileMigrationStep(e: {
  migration: {
    status: AgentsFileMigrationStatus | null;
    loading: boolean;
    error: string | null;
    selected: boolean;
    refresh(): void;
    setSelected(v: boolean): void;
  };
}) {
  const { intl } = useIntlContext();
  const status = e.migration.status;
  const supported = status?.supported === true;
  const checked = e.migration.selected && supported;
  return (
    <div className={`flex h-full min-h-0 flex-col gap-4`}>
      <div className={`flex shrink-0 items-center justify-end gap-3`}>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={e.migration.loading}
          onClick={() => void e.migration.refresh()}
        >
          {e.migration.loading ? <IconLoaderCircle className={`size-3.5 animate-spin`} /> : <IconRefreshCw className={`size-3.5`} />}
          {intl.formatMessage({ id: `settingsSync.action.rescan` })}
        </Button>
      </div>
      {e.migration.error ? (
        <div className={`rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-ui-base text-foreground`}>
          {intl.formatMessage({ id: `onboarding.agentsFile.error` }, { error: e.migration.error })}
        </div>
      ) : null}
      <button
        type="button"
        disabled={!supported}
        onClick={() => e.migration.setSelected(!checked)}
        className={`flex min-w-0 flex-col gap-4 rounded-xl border border-border bg-background p-4 text-left transition-colors enabled:hover:bg-surface-hover/50 disabled:cursor-not-allowed disabled:opacity-70`}
      >
        <div className={`flex min-w-0 items-start gap-3`}>
          <div className={`flex size-5 shrink-0 items-center justify-center`}>
            <div
              className={`flex size-4 items-center justify-center rounded-sm border ${checked ? `border-primary bg-primary text-primary-foreground` : `border-border bg-background text-transparent`}`}
            >
              <IconCheck className={`size-3.5`} />
            </div>
          </div>
          <div className={`min-w-0 flex-1`}>
            <div className={`flex min-w-0 flex-wrap items-center gap-2`}>
              <IconFileText className={`size-4 shrink-0 text-foreground-subtle`} />
              <div className={`min-w-0 text-ui-base font-medium text-foreground`}>
                {intl.formatMessage({ id: `onboarding.agentsFile.copyTitle` })}
              </div>
            </div>
          </div>
        </div>
        <div className={`grid min-w-0 gap-2 rounded-lg border border-border bg-surface px-3 py-3 text-ui-base`}>
          <div className={`grid min-w-0 gap-1 sm:grid-cols-[5rem_1fr] sm:items-center`}>
            <span className={`text-foreground-subtle`}>{intl.formatMessage({ id: `onboarding.agentsFile.sourceLabel` })}</span>
            <span className={`min-w-0 truncate font-mono text-foreground`}>
              {status?.sourcePath ?? intl.formatMessage({ id: `onboarding.agentsFile.loading` })}
            </span>
          </div>
          <div className={`grid min-w-0 gap-1 sm:grid-cols-[5rem_1fr] sm:items-center`}>
            <span className={`text-foreground-subtle`}>{intl.formatMessage({ id: `onboarding.agentsFile.targetLabel` })}</span>
            <span className={`min-w-0 truncate font-mono text-foreground`}>
              {status?.targetPath ?? intl.formatMessage({ id: `onboarding.agentsFile.loading` })}
            </span>
          </div>
        </div>
        {!supported && !e.migration.loading ? (
          <div className={`flex gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-ui-base leading-6 text-foreground`}>
            <IconTriangleAlert className={`mt-0.5 size-4 shrink-0 text-warning`} />
            <span>{intl.formatMessage({ id: `onboarding.agentsFile.missingSource` })}</span>
          </div>
        ) : null}
      </button>
    </div>
  );
}

/** 原 x3t（js 208363-208085 / jsx 165214）：session 步空态自动扫描判定 */
function shouldAutoScanSessions(e: {
  view: string;
  wizardStep: string;
  supported: boolean;
  isScanning: boolean;
  candidateCount: number;
  scanError: string | null;
  hasAutoScannedInCurrentEntry: boolean;
}): boolean {
  return (
    e.view === `wizard` &&
    e.wizardStep === `session` &&
    e.supported &&
    !e.isScanning &&
    e.candidateCount === 0 &&
    !e.scanError &&
    !e.hasAutoScannedInCurrentEntry
  );
}
/** 原 S3t（js 208086-208091 / jsx 165217） */
function buildSessionGroups(
  selectedWorkspacePaths: string[],
  candidates: Array<{ workspacePath: string; sessionId: string }>,
): Array<{ workspacePath: string; label: string; sessionIds: string[] }> {
  return selectedWorkspacePaths.flatMap((path) => {
    const hits = candidates.filter((c) => c.workspacePath === path);
    return hits.length === 0
      ? []
      : [{ workspacePath: path, label: workspaceBaseLabel(path), sessionIds: hits.map((c) => c.sessionId) }];
  });
}

/**
 * 原 C3t（js 208382-208196 / jsx 165227）：迁移执行器。
 * 进入 migration 步自动开跑：逐工作区 importSessions → agentsFile.copy →
 * settings 导入（includeSettingsSelections 可控）→ finished。
 */
function useFinishExecution(
  view: string,
  wizardStep: OnboardingWizardStepKey,
  selectedWorkspacePaths: string[],
  additionalSelections: Array<{ agent: string; category: string }>,
  migration: SessionMigrationState,
  agentsFile: { selected: boolean; copy(): Promise<{ status?: string }> },
  onboarding: {
    selectedCount: number;
    actions: {
      startImportWithAdditionalSelections(
        selections: Array<{ agent: string; category: string }>,
        options?: { includeCurrentSelections?: boolean },
      ): Promise<void>;
    };
  },
  options: { includeSettingsSelections?: boolean } = {},
) {
  const { intl } = useIntlContext();
  const [execution, setExecution] = React.useState<FinishExecutionState>(initialFinishExecution);
  const runningRef = React.useRef(false);
  const run = React.useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    const groups = buildSessionGroups(selectedWorkspacePaths, migration.candidates);
    setExecution({
      started: true,
      running: true,
      finished: false,
      sessionCompletedCount: 0,
      sessionTotalCount: groups.length,
      sessionImportedCount: 0,
      sessionSkippedCount: 0,
      sessionFailedCount: 0,
      agentsFileCompletedCount: 0,
      agentsFileTotalCount: +!!agentsFile.selected,
      agentsFileImportedCount: 0,
      agentsFileSkippedCount: 0,
      agentsFileFailedCount: 0,
      currentTaskLabel: null,
      error: null,
    });
    try {
      for (let index = 0; index < groups.length; index += 1) {
        const group = groups[index];
        if (!group) continue;
        setExecution((prev) => ({
          ...prev,
          currentTaskLabel: intl.formatMessage(
            { id: `onboarding.finish.currentWorkspace` },
            { workspace: group.label },
          ),
        }));
        const result = await migration.importSessions(group.sessionIds);
        if (!result) throw Error(migration.importError ?? `Session migration failed`);
        setExecution((prev) => ({
          ...prev,
          sessionCompletedCount: prev.sessionCompletedCount + 1,
          sessionImportedCount: prev.sessionImportedCount + result.imported.length,
          sessionSkippedCount: prev.sessionSkippedCount + result.skipped.length,
          sessionFailedCount: prev.sessionFailedCount + result.failed.length,
        }));
      }
      if (agentsFile.selected) {
        setExecution((prev) => ({
          ...prev,
          currentTaskLabel: intl.formatMessage({ id: `onboarding.finish.currentAgentsFile` }),
        }));
        try {
          const copied = await agentsFile.copy();
          setExecution((prev) => ({
            ...prev,
            agentsFileCompletedCount: prev.agentsFileCompletedCount + 1,
            agentsFileImportedCount: prev.agentsFileImportedCount + +(copied.status === `copied`),
            agentsFileSkippedCount: prev.agentsFileSkippedCount + +(copied.status === `skipped`),
          }));
        } catch (error) {
          setExecution((prev) => ({
            ...prev,
            agentsFileCompletedCount: prev.agentsFileCompletedCount + 1,
            agentsFileFailedCount: prev.agentsFileFailedCount + 1,
          }));
          throw error;
        }
      }
      const includeSettings = options.includeSettingsSelections ?? true;
      if ((includeSettings ? onboarding.selectedCount : 0) > 0 || additionalSelections.length > 0) {
        setExecution((prev) => ({
          ...prev,
          currentTaskLabel: intl.formatMessage({ id: `onboarding.finish.currentSettings` }),
        }));
        await onboarding.actions.startImportWithAdditionalSelections(additionalSelections, {
          includeCurrentSelections: includeSettings,
        });
      }
      setExecution((prev) => ({ ...prev, running: false, finished: true, currentTaskLabel: null }));
    } catch (error) {
      setExecution((prev) => ({
        ...prev,
        running: false,
        finished: true,
        error: error instanceof Error ? error.message : String(error),
        currentTaskLabel: null,
      }));
    } finally {
      runningRef.current = false;
    }
  }, [additionalSelections, agentsFile, intl, selectedWorkspacePaths, migration, onboarding.actions, onboarding.selectedCount, options.includeSettingsSelections]);
  React.useEffect(() => {
    if (view !== `wizard` || wizardStep !== `migration` || execution.started) return;
    void run();
  }, [execution.started, run, view, wizardStep]);
  const resetFinishExecution = React.useCallback(() => {
    setExecution(initialFinishExecution());
  }, []);
  return { finishExecution: execution, resetFinishExecution };
}

/** 原 w3t（js 208194 / jsx 165334） */
function errorMessageText2(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** 原 T3t（js 208487-208250 / jsx 165337）：AGENTS.md 迁移状态 hook */
function useAgentsFileMigration(e: { workspacePath?: string; workspaceIdentity?: string; enabled: boolean }) {
  const { settingsSyncService } = useServices() as unknown as BaseServices & { settingsSyncService: SettingsSyncService }; // A0-D：同上，二段断言
  const [status, setStatus] = React.useState<AgentsFileMigrationStatus | null>(null);
  const [selected, setSelected] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await settingsSyncService.getClaudeAgentsFileMigrationStatus({
        workspacePath: e.workspacePath,
        workspaceIdentity: e.workspaceIdentity,
      });
      setStatus(next);
      setSelected(!!next?.supported);
    } catch (err) {
      const message = errorMessageText2(err);
      logger.error(`[OnboardingAgentsFileMigration] status load failed`, {
        workspacePath: e.workspacePath,
        workspaceIdentity: e.workspaceIdentity,
        error: message,
      });
      setError(message);
      setStatus(null);
      setSelected(false);
    } finally {
      setLoading(false);
    }
  }, [e.workspaceIdentity, e.workspacePath, settingsSyncService]);
  React.useEffect(() => {
    if (e.enabled) void refresh();
  }, [e.enabled, refresh]);
  const setSelectedSafe = React.useCallback(
    (next: boolean) => {
      setSelected(next && status?.supported === true);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [status?.supported],
  );
  const copy = React.useCallback(async () => {
    const result = await settingsSyncService.copyClaudeAgentsFileToZcodeAgentsFile({
      workspacePath: e.workspacePath,
      workspaceIdentity: e.workspaceIdentity,
      overwrite: true,
    });
    await refresh();
    return result;
  }, [e.workspaceIdentity, e.workspacePath, refresh, settingsSyncService]);
  return { error, loading, selected, status, copy, refresh, setSelected: setSelectedSafe };
}

/** 原 z9（js 208541 / jsx 165387） */
const ONBOARDING_STEP_ORDER = [`session`, `skills-import`, `mcp-import`, `commands-import`, `agents-file`, `migration`] as const;

/**
 * 原 E3t（js 208252-208536 / jsx 165388）：onboarding 对话框。
 * welcome 双栏 ↔ 六步向导；关闭走 useConfirmDialog 守卫（migration 运行中）。
 */
export function OnboardingDialog(e: {
  workspacePath?: string;
  workspaceIdentity?: string | null;
  isDesktop: boolean;
}) {
  const { intl } = useIntlContext();
  const confirm = useConfirmDialog();
  const onboarding = useOnboardingDialogController({
    workspacePath: e.workspacePath,
    workspaceIdentity: e.workspaceIdentity ?? undefined,
  });
  const migration = useClaudeMigration({
    workspacePath: e.workspacePath ?? null,
    isDesktop: e.isDesktop,
  }) as unknown as SessionMigrationState; // A1-R47：二段断言（useClaudeMigration 返回形 → 接口级 SessionMigrationState；MigrationCandidate.workspacePath 保守可选，运行时扫描条目恒带 workspacePath，bundle E3t 原形直取）
  const dialogRequested = useSettingsStore((s) => s.onboardingDialogRequested);
  const clearDialogRequest = useSettingsStore((s) => s.clearOnboardingDialogRequest);
  const [view, setView] = React.useState<"welcome" | "wizard">(`welcome`);
  const [wizardStep, setWizardStep] = React.useState<OnboardingWizardStepKey>(`session`);
  const [selectedWorkspacePaths, setSelectedWorkspacePaths] = React.useState<string[]>([]);
  const autoSelectedRef = React.useRef(false);
  const autoScannedRef = React.useRef(false);
  const skillsSelections = useImportSelections({
    category: `skills`,
    enabled: view === `wizard` && wizardStep === `skills-import`,
    workspacePath: e.workspacePath,
    workspaceIdentity: e.workspaceIdentity ?? undefined,
  });
  const mcpSelections = useImportSelections({
    category: `mcpServers`,
    enabled: view === `wizard` && wizardStep === `mcp-import`,
    workspacePath: e.workspacePath,
    workspaceIdentity: e.workspaceIdentity ?? undefined,
  });
  const commandsSelections = useImportSelections({
    category: `commands`,
    enabled: view === `wizard` && wizardStep === `commands-import`,
    workspacePath: e.workspacePath,
    workspaceIdentity: e.workspaceIdentity ?? undefined,
  });
  const agentsFile = useAgentsFileMigration({
    enabled: view === `wizard` && wizardStep === `agents-file`,
    workspacePath: e.workspacePath,
    workspaceIdentity: e.workspaceIdentity ?? undefined,
  });
  const workspaceCandidates = React.useMemo(() => {
    const byPath = new Map<string, { workspacePath: string; label: string; sessionCount: number }>();
    for (const candidate of migration.candidates) {
      const hit = byPath.get(candidate.workspacePath);
      if (hit) {
        hit.sessionCount += 1;
        continue;
      }
      byPath.set(candidate.workspacePath, {
        workspacePath: candidate.workspacePath,
        label: workspaceBaseLabel(candidate.workspacePath),
        sessionCount: 1,
      });
    }
    return [...byPath.values()].sort((a, b) => b.sessionCount - a.sessionCount);
  }, [migration.candidates]);
  const additionalSelections = React.useMemo(
    () => [...skillsSelections.selections, ...mcpSelections.selections, ...commandsSelections.selections].map((s) => ({
      agent: (s as { agent?: string }).agent ?? ``,
      category: (s as { category?: string }).category ?? ``,
    })),
    [commandsSelections.selections, mcpSelections.selections, skillsSelections.selections],
  );
  const settingsSelectionCount =
    skillsSelections.selectedCount + mcpSelections.selectedCount + commandsSelections.selectedCount;
  const { finishExecution, resetFinishExecution } = useFinishExecution(
    view,
    wizardStep,
    selectedWorkspacePaths,
    additionalSelections,
    migration,
    agentsFile,
    onboarding,
    { includeSettingsSelections: false },
  );
  React.useEffect(() => {
    if (!onboarding.state.open) {
      setView(`welcome`);
      setWizardStep(`session`);
      setSelectedWorkspacePaths([]);
      resetFinishExecution();
      autoSelectedRef.current = false;
      autoScannedRef.current = false;
      return;
    }
  }, [onboarding.state.open, resetFinishExecution]);
  React.useEffect(() => {
    if (dialogRequested) {
      setView(`welcome`);
      setWizardStep(`session`);
      resetFinishExecution();
      onboarding.actions.reopen();
      clearDialogRequest();
    }
  }, [clearDialogRequest, dialogRequested, resetFinishExecution, onboarding.actions]);
  React.useEffect(() => {
    if (view !== `wizard` || wizardStep !== `session`) autoScannedRef.current = false;
  }, [view, wizardStep]);
  React.useEffect(() => {
    if (
      shouldAutoScanSessions({
        view,
        wizardStep,
        supported: migration.supportState.supported,
        isScanning: migration.isScanning,
        candidateCount: migration.candidates.length,
        scanError: migration.scanError,
        hasAutoScannedInCurrentEntry: autoScannedRef.current,
      })
    ) {
      autoScannedRef.current = true;
      migration.scan();
    }
  }, [migration.candidates.length, migration.isScanning, migration.scan, migration.scanError, migration.supportState.supported, view, wizardStep]);
  React.useEffect(() => {
    setSelectedWorkspacePaths((prev) => {
      const available = [...new Set(migration.candidates.map((c) => c.workspacePath))];
      if (available.length === 0) {
        autoSelectedRef.current = false;
        return [];
      }
      if (autoSelectedRef.current) return prev.filter((p) => available.includes(p));
      autoSelectedRef.current = true;
      return available;
    });
  }, [migration.candidates]);
  const selectedWorkspaceCount = selectedWorkspacePaths.length;
  const nothingSelected =
    selectedWorkspaceCount === 0 && settingsSelectionCount === 0 && !agentsFile.selected;
  const completedTaskCount = React.useMemo(
    () => onboarding.state.tasks.filter((t) => t.status !== `pending` && t.status !== `running`).length,
    [onboarding.state.tasks],
  );
  const migrationTotal =
    finishExecution.sessionTotalCount + finishExecution.agentsFileTotalCount + 0 + additionalSelections.length;
  const migrationDone =
    finishExecution.sessionCompletedCount + finishExecution.agentsFileCompletedCount + completedTaskCount;
  const overallProgress =
    migrationTotal > 0 ? Math.round((migrationDone / migrationTotal) * 100) : finishExecution.finished ? 100 : 0;
  const stepTitleKey = onboardingStepTitleKey(wizardStep);
  const title =
    view === `welcome`
      ? intl.formatMessage({ id: `onboarding.dialog.title` })
      : intl.formatMessage({ id: `onboarding.step.${stepTitleKey}` });
  const description =
    view === `welcome`
      ? intl.formatMessage({ id: `onboarding.dialog.description` })
      : wizardStep === `agents-file`
        ? ``
        : intl.formatMessage({ id: `onboarding.stepDescription.${stepTitleKey}` });
  const toggleWorkspace = (path: string) => {
    setSelectedWorkspacePaths((prev) => (prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]));
  };
  const clearWorkspaces = () => {
    setSelectedWorkspacePaths([]);
  };
  const selectAllWorkspaces = () => {
    setSelectedWorkspacePaths(workspaceCandidates.map((c) => c.workspacePath));
  };
  const backStep = React.useCallback(() => {
    const index = ONBOARDING_STEP_ORDER.indexOf(wizardStep);
    if (index <= 0) {
      setView(`welcome`);
      return;
    }
    setWizardStep(ONBOARDING_STEP_ORDER[index - 1] ?? `session`);
  }, [wizardStep]);
  const nextStep = React.useCallback(() => {
    const next = ONBOARDING_STEP_ORDER[ONBOARDING_STEP_ORDER.indexOf(wizardStep) + 1];
    if (next && next !== `migration`) setWizardStep(next);
  }, [wizardStep]);
  const beginMigration = React.useCallback(async () => {
    if (
      agentsFile.selected &&
      !(await confirm({
        title: intl.formatMessage({ id: `onboarding.agentsFile.confirmTitle` }),
        description: intl.formatMessage(
          { id: `onboarding.agentsFile.confirmDescription` },
          {
            source: agentsFile.status?.sourcePath ?? `~/.claude/CLAUDE.md`,
            target: agentsFile.status?.targetPath ?? `~/.zcode/AGENTS.md`,
          },
        ),
        confirmLabel: intl.formatMessage({ id: `onboarding.agentsFile.confirmAction` }),
        cancelLabel: intl.formatMessage({ id: `common.cancel` }),
      }))
    ) {
      logger.info(`[OnboardingDialog] AGENTS.md migration canceled by user`, {
        workspacePath: e.workspacePath ?? null,
        workspaceIdentity: e.workspaceIdentity ?? null,
      });
      return;
    }
    setWizardStep(`migration`);
  }, [agentsFile.selected, agentsFile.status?.sourcePath, agentsFile.status?.targetPath, confirm, intl, e.workspaceIdentity, e.workspacePath]);
  const requestClose = React.useCallback(async () => {
    if (!finishExecution.running) {
      onboarding.actions.close();
      return;
    }
    logger.info(`[OnboardingDialog] migration close requested while running`, {
      workspacePath: e.workspacePath ?? null,
      workspaceIdentity: e.workspaceIdentity ?? null,
      currentTaskLabel: finishExecution.currentTaskLabel,
      overallProgress,
    });
    if (
      !(await confirm({
        title: intl.formatMessage({ id: `onboarding.migration.confirmCloseTitle` }),
        description: intl.formatMessage({ id: `onboarding.migration.confirmCloseDescription` }),
        confirmLabel: intl.formatMessage({ id: `onboarding.migration.confirmCloseConfirm` }),
        cancelLabel: intl.formatMessage({ id: `common.cancel` }),
      }))
    ) {
      logger.info(`[OnboardingDialog] migration close canceled by user`, {
        workspacePath: e.workspacePath ?? null,
        workspaceIdentity: e.workspaceIdentity ?? null,
      });
      return;
    }
    onboarding.actions.close();
  }, [confirm, finishExecution.currentTaskLabel, finishExecution.running, intl, overallProgress, e.workspaceIdentity, e.workspacePath, onboarding.actions]);
  return (
    <Dialog
      open={onboarding.state.open}
      onOpenChange={(next) => {
        if (!next) void requestClose();
      }}
    >
      <DialogContent className={`h-[calc(100vh-6rem)] max-w-4xl max-h-168 overflow-hidden rounded-2xl p-0`} showCloseButton>
        <DialogTitle className={`sr-only`}>{title}</DialogTitle>
        <DialogDescription className={`sr-only`}>{description}</DialogDescription>
        {view === `welcome` ? (
          <OnboardingWelcomeView
            onStart={onboarding.actions.close}
            onOpenMigration={() => {
              setView(`wizard`);
              setWizardStep(`session`);
            }}
          />
        ) : (
          <div className={`flex h-full min-h-0 min-w-0`}>
            <OnboardingStepRail currentStep={wizardStep} />
            <div className={`flex min-w-0 flex-1 flex-col gap-5 overflow-hidden p-6`}>
              <OnboardingStepHeader title={title} description={description} />
              <div className={`min-h-0 flex-1`}>
                {(() => {
                  switch (wizardStep) {
                    case `session`:
                      return (
                        <OnboardingSessionStep
                          migration={migration}
                          workspaceCandidates={workspaceCandidates}
                          selectedWorkspacePaths={selectedWorkspacePaths}
                          onToggleWorkspace={toggleWorkspace}
                          onSelectAll={selectAllWorkspaces}
                          onClearSelection={clearWorkspaces}
                        />
                      );
                    case `skills-import`:
                      return (
                        <ImportSelectionStep category={`skills`} state={skillsSelections} workspacePath={e.workspacePath} />
                      );
                    case `mcp-import`:
                      return (
                        <ImportSelectionStep category={`mcpServers`} state={mcpSelections} workspacePath={e.workspacePath} />
                      );
                    case `commands-import`:
                      return (
                        <ImportSelectionStep category={`commands`} state={commandsSelections} workspacePath={e.workspacePath} />
                      );
                    case `agents-file`:
                      return <AgentsFileMigrationStep migration={agentsFile} />;
                    case `migration`:
                      return finishExecution.finished ? (
                        <MigrationCompleteView
                          overallProgress={overallProgress}
                          finishExecution={finishExecution}
                          settingsImportedCount={onboarding.state.result?.successCount ?? 0}
                          settingsSkippedCount={onboarding.state.result?.skippedCount ?? 0}
                          settingsFailedCount={onboarding.state.result?.failedCount ?? 0}
                        />
                      ) : (
                        <MigrationProgressView overallProgress={overallProgress} finishExecution={finishExecution} />
                      );
                  }
                })()}
              </div>
              <OnboardingWizardFooter
                currentStep={wizardStep}
                selectedWorkspaceCount={selectedWorkspaceCount}
                settingsTaskCount={0}
                finishRunning={finishExecution.running}
                finishReady={finishExecution.finished}
                onBackToWelcome={() => setView(`welcome`)}
                onBackStep={backStep}
                onNextStep={nextStep}
                onBeginMigration={() => void beginMigration()}
                onFinish={onboarding.actions.finish}
                beginMigrationDisabled={nothingSelected}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* A1-R47 尾部导入（ES hoisting，R35 既判例）：原 I2t useSessionMigrationScanner declare 收敛改指 → useClaudeMigration canonical。环安全：MigrationSettingsSection 值闭包（lucide/ui/McpHelpers/stores）不达 components/modals。 */
import { useClaudeMigration } from '../settings/MigrationSettingsSection';
