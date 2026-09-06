// A0-S4-4a: 自 modules/SettingsPanels.tsx §8 外部 agent 配置导入对话框 原样迁入（组件单元；原文件现为薄 re-export shim）。
// 迁出体 = 原文件 2912–3894（类型群 + useExternalAgentImportState + 子件群 + ExternalAgentImportDialog + 三 category 薄包装）。
import * as React from "react";
import { Select as SelectRoot } from '../../modules/Settings';
import { Dialog as DialogRoot, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { DropdownMenu as DropdownMenuRoot, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { LoaderCircle as SpinnerIcon, RefreshCw as RefreshIcon, ChevronDownIcon, CheckIcon, MinusIcon, CircleHelpIcon, TriangleAlert as AlertIcon } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0
import { Button, ChevronRight as ChevronRightIcon } from '../../modules/button';
import { Badge } from '../../modules/PaymentDeep';
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../modules/Settings';
import { useServices } from '../../modules/services';
import { cn } from '../../modules/UtilsCn';
import { useZCodeIntl as useIntlContext } from '../../modules/I18n';
import { t as logger } from '../../modules/logger';
import { Progress } from '../../modules/Modals'; // yq
import { InfoTooltip as Tooltip } from '../../modules/UsageStatsUiParts'; // Ia
import {
  jsonStringify as importSelectionKey, // F7（jsx 155654）
  syncResourceKey as sourceGroupKey, // n$t（jsx 155651）
  agentDisplayLabel as agentDisplayName, // s$t（jsx 155703）
  importScopeI18nKey as scopeOptionLabel, // u$t（jsx 155789）
  errorMessageText as describeImportError, // a$t（jsx 155700）
} from '../../modules/McpHelpers';

/** 原 §0 服务接口（settingsSync 族；消费面在本族 useServices，类型面引用下方 ExternalAgent* 声明） 〔A1-R186〕★本注（块 @25-25、类别「死面之标签」）係下方被删面之**标签**：其主语 SettingsSyncService 已随死界面普查批第五批销账 ⇒ 本注失去该 referent。★〔A1-R185 referent-liveness 判据〕其 referent 经重测仍有代码位命中：useServices（注内符号；命中 93 处）（口径＝掩码 v8 之代码位命中、已排除本批全部被删区间（故係**施后**值，恒 ≤ 施前值））。★须自载〔A1-R185 referent-liveness 判据〕之局限：其 referent 抽取兼收束符与短 token，树内代码位命中可能係同形巧合而非真 referent（本批实测 `js` 一词全树代码位命中 557 处、`hook` 199 处，皆属此类，已自存活理据中剔除）⇒ 该判据之误差方向係**偏存活**（不会误删活注）；本批只据此判存活、不据命中数作任何更强声称。§5.3 不对称：多一骑手只费一行、漏一骑手则留一句假散文 ⇒ 疑则存之、存活并加骑手。本节注（块 @25-25）所辖之节（自块尾至 @39）今**失全部代码**：节内 13 行代码皆落在本批被删区间内、存活 0 ⇒ 本节只剩墓碑与注记。原文逐字保留、只增不改（骑手只增文、不删旧字）。 */
/* ── tombstone〔A1-R186〕死界面普查批第五批（components/settings/ExternalAgentImportDialog.tsx：1 面／13 行，本批该文件共 1 碑）：本地 interface SettingsSyncService@26-38（13 行）纯删，13 行等行墓碑在原位。
 *    判据〔A1-R176 立／A1-R183 v7／A1-R184 v8〕：一面为死当且仅当 Ⓐ本文件内无代码位读者落在其自身定义跨度之外，且 Ⓑ不带 export（或带 export 而无一家导入方把该名作 specifier 拉取）；级联＝读者全落在已判死之面内者亦判死，迭代至不动点（本批 3 轮收敛，全树 1924 面中得死面 66）。量测一律用 token 级 code-only 掩码 v8（单点模块导入、13 形自检 + 9 负对照），禁行首前缀法〔A1-R174 沉淀①〕。
 *    interface SettingsSyncService：代码位读者 0（本文件内、其定义跨度外，逐行以掩码 v8 实测）；未 export ⇒ 跨文件读者结构性不可能。
 *    同名定义站：SettingsSyncService 施前全树 2 家、本批销 1 家 ⇒ 施后余 1 家（canonical components/modals/OnboardingDialog.tsx@255（带 export））。
 *    邻接注记裁定（±4 行窗口）：@25 之注记皆**存活**、其原文逐字保留并各带同批骑手（骑手只增文、不删旧字），已断言与 HEAD 之差异仅限骑手所增。
 *    型-only 批：interface 与 type 别名皆非台账对象〔A1-R164 登记〕⇒ 台账 588/571/510 不得变动（反向哨兵：若变动即证动了 declare、须立即停批核查）；esbuild 擦除全部型构造 ⇒ 三 bundle 必逐字节全等〔A1-R173 沉淀③／A1-R174 沉淀⑥，可用于预测〕。
 *    原界面共 13 行，等行置换以保行数不变、免重锚；逐字原文见 git 历史。
 *    原界面共 13 行，等行置换以保行数不变、免重锚；逐字原文见 git 历史。
 *    原界面共 13 行，等行置换以保行数不变、免重锚；逐字原文见 git 历史。
 *    原界面共 13 行，等行置换以保行数不变、免重锚；逐字原文见 git 历史。
 *    原界面共 13 行，等行置换以保行数不变、免重锚；逐字原文见 git 历史。
 *    原界面共 13 行，等行置换以保行数不变、免重锚；逐字原文见 git 历史。
 *    净零行：本碑 13 行置换原 13 行，文件行数 1023 不变、零重锚（本文件 ExternalAgentImportDialog 引证密度：六形并集、去重键 (token,档,行)、扫描面 356 源 + 4 活文档＝去重 3 条（原始发射 3）；带行号之记录 3 条，其中落在首个编辑点 @26 及其后者 2 条 ⇒ **强制净零行**）。★口径须自载：六形係**下界**——R185 查出第七形「Name 型面（NNN）」，本批之骑手网另以 P0 裸名谓词兜底；两口径同判「净零行强制」故结论不受影响〔A1-R173 沉淀⑧〕。 ── */

/* ============================================================================
 * 8. 外部 agent 配置导入对话框（原 z7/R7/_$t/h$t/g$t 及子件，
 *    js 193344–193900 区段 / jsx 155825–156370；settingsSync 族）
 * ==========================================================================*/

export type ExternalAgentImportCategory = "skills" | "commands" | "mcpServers";
export type ExternalAgentImportScope = "global" | "project";
export type ExternalAgentImportMode = "symlink" | "copy";

export interface ExternalAgentDiscoveryAgent {
  agent: string;
  categories: Array<{ category: string; importableCount: number }>;
  [key: string]: unknown;
}
export interface ExternalAgentDiscovery {
  agents: ExternalAgentDiscoveryAgent[];
}
export interface ExternalAgentImportSelection {
  agent: string;
  category: string;
  sourceScope: ExternalAgentImportScope;
  resourcePath: string;
}
export interface ExternalAgentImportResource {
  path: string;
  name: string;
  version?: string;
  importable?: boolean;
}
export interface ExternalAgentImportResultItem {
  status: "imported" | "skipped" | "failed";
  sourceScope: ExternalAgentImportScope;
  path: string;
  name: string;
  version?: string;
  skipReason?: string;
}
export interface ExternalAgentImportResult {
  successCount?: number;
  skippedCount?: number;
  failedCount?: number;
  items?: ExternalAgentImportResultItem[];
  [key: string]: unknown;
}
export interface ExternalAgentSourceRow {
  agent: ExternalAgentDiscoveryAgent;
  sourceRoot: { scope: ExternalAgentImportScope; path: string };
}
export interface ExternalAgentScopeGroup {
  scope: ExternalAgentImportScope;
  rows: ExternalAgentSourceRow[];
}

/* 纯助手（原 155522–155824 区段；此处接口级声明，行号见头部映射 §C） */
declare function buildImportSelections(
  selectedKeys: string[],
  targetScope: ExternalAgentImportScope,
  importMode: ExternalAgentImportMode
): ExternalAgentImportSelection[]; // i$t（jsx 155672）
declare function flattenImportResults(result: ExternalAgentImportResult | null, category: string): ExternalAgentImportResultItem[]; // o$t（jsx 155706）
declare function groupDiscoveryByScope(
  agents: ExternalAgentDiscoveryAgent[],
  workspacePath: string | null | undefined,
  category: string
): ExternalAgentScopeGroup[]; // m$t（jsx 155816）
declare function agentHasCategory(agent: ExternalAgentDiscoveryAgent, category: string): boolean; // I7（jsx 155784）
declare function listImportableResources(
  sourceRoot: { scope: ExternalAgentImportScope; path: string },
  category: string
): ExternalAgentImportResource[]; // L7（jsx 155794）

/** 原 c$t（jsx 155787）：源/目标作用域枚举 */
const IMPORT_SCOPES: ExternalAgentImportScope[] = ["global", "project"];
/** 原 l$t（y$t 内引用）：导入模式枚举 */
const IMPORT_MODES: ExternalAgentImportMode[] = ["symlink", "copy"];

/** 原 R7（js 193643 / jsx 155843）：导入状态机 hook（扫描/选择/展开/作用域） */
export function useExternalAgentImportState(opts: {
  category: ExternalAgentImportCategory;
  enabled: boolean;
  workspaceIdentity?: string | null;
  workspacePath?: string | null;
}) {
  const { category, enabled, workspaceIdentity, workspacePath } = opts;
  const { settingsSyncService } = useServices();
  const [loading, setLoading] = React.useState(false);
  const [discovery, setDiscovery] = React.useState<ExternalAgentDiscovery | null>(null);
  const [selectedKeys, setSelectedKeys] = React.useState<string[]>([]);
  const [expandedSourceKeys, setExpandedSourceKeys] = React.useState<string[]>([]);
  const [activeScope, setActiveScope] = React.useState<ExternalAgentImportScope>("global");
  const [importTargetScope, setImportTargetScope] = React.useState<ExternalAgentImportScope>("global");
  const [importMode, setImportMode] = React.useState<ExternalAgentImportMode>("symlink");
  const [error, setError] = React.useState<string | null>(null);
  const totalImportableCount = React.useMemo(
    () =>
      discovery?.agents.reduce(
        (sum, agent) => sum + agent.categories.reduce((inner, entry) => inner + entry.importableCount, 0),
        0
      ) ?? 0,
    [discovery]
  );

  const loadDiscovery = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setDiscovery(
        await settingsSyncService.detect({
          workspacePath: workspacePath ?? undefined,
          workspaceIdentity,
          categories: [category],
          intent: "manualImport",
        })
      );
      setSelectedKeys([]);
      setExpandedSourceKeys([]);
      setActiveScope("global");
      setImportTargetScope("global");
    } catch (err) {
      const message = describeImportError(err);
      logger.error("[ExternalAgentImportDialog] scan failed", { category, error: message });
      setError(message);
      setDiscovery({ agents: [] });
      setSelectedKeys([]);
    } finally {
      setLoading(false);
    }
  }, [category, settingsSyncService, workspaceIdentity, workspacePath]);

  React.useEffect(() => {
    if (enabled && !discovery && !loading) loadDiscovery();
  }, [discovery, enabled, loadDiscovery, loading]);

  const toggleSelection = React.useCallback((key: string) => {
    setSelectedKeys((previous) => {
      const next = new Set(previous);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return [...next];
    });
  }, []);

  const setResourceSelection = React.useCallback((keys: string[], selected: boolean) => {
    setSelectedKeys((previous) => {
      const next = new Set(previous);
      for (const key of keys) {
        if (selected) next.add(key);
        else next.delete(key);
      }
      return [...next];
    });
  }, []);

  const toggleExpanded = React.useCallback((key: string) => {
    setExpandedSourceKeys((previous) => (previous.includes(key) ? previous.filter((item) => item !== key) : [...previous, key]));
  }, []);

  const setActiveSourceScope = React.useCallback((scope: ExternalAgentImportScope) => {
    setActiveScope(scope);
    setImportTargetScope(scope);
  }, []);

  const selections = React.useMemo(
    () => buildImportSelections(selectedKeys, importTargetScope, importMode),
    [importMode, importTargetScope, selectedKeys]
  );

  return {
    activeScope,
    discovery,
    error,
    expandedSourceKeys,
    importMode,
    importTargetScope,
    loading,
    selectedCount: selectedKeys.length,
    selectedKeys,
    selections,
    totalImportableCount,
    loadDiscovery,
    setActiveSourceScope,
    setImportMode,
    setImportTargetScope,
    setResourceSelection,
    toggleExpanded,
    toggleSelection,
  };
}

export type ExternalAgentImportState = ReturnType<typeof useExternalAgentImportState>;

/** 原 E$t（jsx 156245）：源作用域选择 */
export function ImportSourceScopeSelect(props: {
  category: ExternalAgentImportCategory;
  activeScope: ExternalAgentImportScope;
  onActiveScopeChange: (scope: ExternalAgentImportScope) => void;
}) {
  const { category, activeScope, onActiveScopeChange } = props;
  const { intl } = useIntlContext();
  return (
    <SelectRoot value={activeScope} onValueChange={(value) => onActiveScopeChange(value as ExternalAgentImportScope)}>
      <SelectTrigger
        size="sm"
        variant="ghost"
        aria-label={intl.formatMessage({ id: `settings.${category}.import.scopeLabel` })}
        className="w-fit shrink-0 justify-end text-right text-foreground-subtle hover:text-foreground *:data-[slot=select-value]:justify-end"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {IMPORT_SCOPES.map((scope) => (
          <SelectItem key={scope} value={scope}>
            {scopeOptionLabel(scope, intl, category)}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
}

/** 原 y$t（jsx 156074）：导入模式选择（symlink|copy + 帮助 tooltip） */
export function ImportModeSelect(props: {
  category: ExternalAgentImportCategory;
  importMode: ExternalAgentImportMode;
  onImportModeChange: (mode: ExternalAgentImportMode) => void;
}) {
  const { category, importMode, onImportModeChange } = props;
  const { intl } = useIntlContext();
  return (
    <div className="flex items-center gap-1 text-ui-base text-foreground-subtle">
      <SelectRoot value={importMode} onValueChange={(value) => onImportModeChange(value as ExternalAgentImportMode)}>
        <SelectTrigger
          size="sm"
          variant="ghost"
          aria-label={intl.formatMessage({ id: `settings.${category}.import.modeLabel` })}
          className="w-fit shrink-0 justify-end border-border bg-surface text-right font-medium text-foreground hover:bg-surface-hover hover:text-foreground aria-expanded:bg-selected *:data-[slot=select-value]:justify-end"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          {IMPORT_MODES.map((mode) => (
            <SelectItem key={mode} value={mode}>
              {intl.formatMessage({ id: `settings.${category}.import.mode.${mode}` })}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectRoot>
      <Tooltip
        title={intl.formatMessage({ id: `settings.${category}.import.modeLabel` })}
        description={intl.formatMessage({
          id:
            importMode === "symlink"
              ? `settings.${category}.import.mode.symlink.description`
              : `settings.${category}.import.mode.copy.description`,
        })}
        side="top"
        align="start"
      >
        <span
          role="img"
          aria-label={intl.formatMessage({ id: `settings.${category}.import.modeHelp` })}
          className="inline-flex size-4 items-center justify-center rounded-full text-foreground-subtlest hover:bg-hover hover:text-foreground"
        >
          <CircleHelpIcon className="size-3" aria-hidden="true" />
        </span>
      </Tooltip>
    </div>
  );
}

/** 原 b$t（jsx 156112）：目标作用域分体按钮（主动作 + ⌄ 切换 global/project） */
export function ImportTargetSplitButton(props: {
  category: ExternalAgentImportCategory;
  targetScope: ExternalAgentImportScope;
  disabled: boolean;
  workspacePath?: string | null;
  onTargetScopeChange: (scope: ExternalAgentImportScope) => void;
  onImport: (scope: ExternalAgentImportScope) => void;
}) {
  const { category, targetScope, disabled, workspacePath, onTargetScopeChange, onImport } = props;
  const { intl } = useIntlContext();
  const workspaceAvailable = !!workspacePath;
  const actionEnabled = targetScope === "global" || workspaceAvailable;
  const actionLabelId =
    targetScope === "project" ? `settings.${category}.import.target.project` : `settings.${category}.import.target.global`;
  return (
    <div className="flex items-center">
      <Button
        type="button"
        size="lg"
        disabled={disabled || !actionEnabled}
        aria-label={intl.formatMessage({ id: actionLabelId })}
        className="rounded-r-none border-r-0"
        onClick={() => onImport(targetScope)}
      >
        {intl.formatMessage({ id: actionLabelId })}
      </Button>
      <DropdownMenuRoot>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            size="lg"
            className="rounded-l-none border-l-0 px-2"
            disabled={disabled}
            aria-label={intl.formatMessage({ id: `settings.${category}.import.targetLabel` })}
          >
            <ChevronDownIcon className="size-3.5" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onSelect={() => onTargetScopeChange("global")}>
            {intl.formatMessage({ id: `settings.${category}.import.target.global` })}
          </DropdownMenuItem>
          <DropdownMenuItem disabled={!workspaceAvailable} onSelect={() => onTargetScopeChange("project")}>
            {intl.formatMessage({ id: `settings.${category}.import.target.project` })}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuRoot>
    </div>
  );
}

/** 原 x$t（jsx 156138）：目标作用域下拉（v$t 选择面板用） */
export function ImportTargetScopeSelect(props: {
  category: ExternalAgentImportCategory;
  targetScope: ExternalAgentImportScope;
  workspacePath?: string | null;
  onTargetScopeChange: (scope: ExternalAgentImportScope) => void;
}) {
  const { category, targetScope, workspacePath, onTargetScopeChange } = props;
  const { intl } = useIntlContext();
  const workspaceAvailable = !!workspacePath;
  return (
    <SelectRoot value={targetScope} onValueChange={(value) => onTargetScopeChange(value as ExternalAgentImportScope)}>
      <SelectTrigger
        size="sm"
        variant="ghost"
        aria-label={intl.formatMessage({ id: `settings.${category}.import.targetLabel` })}
        className="w-fit shrink-0 justify-end border-border bg-surface text-right font-medium text-foreground hover:bg-surface-hover hover:text-foreground aria-expanded:bg-selected *:data-[slot=select-value]:justify-end"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        <SelectItem value="global">{intl.formatMessage({ id: `settings.${category}.import.scope.global` })}</SelectItem>
        <SelectItem value="project" disabled={!workspaceAvailable}>
          {intl.formatMessage({ id: `settings.${category}.import.scope.project` })}
        </SelectItem>
      </SelectContent>
    </SelectRoot>
  );
}

/** 原 B7（jsx 156193）：结果统计项 */
export function ImportResultStat({ label, value }: { label: string; value: number }) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="font-mono text-ui-base font-medium text-foreground">{value}</span>
      <span>{label}</span>
    </span>
  );
}

/** 原 S$t（jsx 156178）：结果汇总条（imported/skipped/failed） */
export function ImportResultSummaryBar(props: {
  category: ExternalAgentImportCategory;
  result: ExternalAgentImportResult | null;
}) {
  const { category, result } = props;
  const { intl } = useIntlContext();
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg bg-surface px-3 py-2 text-ui-xs text-foreground-subtle">
      <ImportResultStat label={intl.formatMessage({ id: `settings.${category}.import.imported` })} value={result?.successCount ?? 0} />
      <ImportResultStat label={intl.formatMessage({ id: `settings.${category}.import.skipped` })} value={result?.skippedCount ?? 0} />
      <ImportResultStat label={intl.formatMessage({ id: `settings.${category}.import.failed` })} value={result?.failedCount ?? 0} />
    </div>
  );
}

/** 原 T$t（jsx 156225）：结果状态圆标 */
export function ImportResultStatusIcon(props: {
  category: ExternalAgentImportCategory;
  result: ExternalAgentImportResultItem;
}) {
  const { category, result } = props;
  const { intl } = useIntlContext();
  const statusLabel = intl.formatMessage({
    id:
      result.status === "imported"
        ? `settings.${category}.import.imported`
        : result.status === "skipped"
          ? `settings.${category}.import.skipped`
          : `settings.${category}.import.failed`,
  });
  const skipReasonLabel = result.skipReason
    ? intl.formatMessage({ id: `settings.${category}.import.skipReason.${result.skipReason}` })
    : null;
  const fullLabel = skipReasonLabel ? `${statusLabel}: ${skipReasonLabel}` : statusLabel;
  const Icon = result.status === "imported" ? CheckIcon : result.status === "skipped" ? CircleHelpIcon : AlertIcon;
  return (
    <span
      aria-label={fullLabel}
      role="img"
      className={cn(
        "flex size-3 shrink-0 items-center justify-center rounded-full",
        result.status === "imported" && "bg-success text-success-foreground",
        result.status === "skipped" && "bg-warning text-warning-foreground",
        result.status === "failed" && "bg-destructive text-destructive-foreground"
      )}
      title={fullLabel}
    >
      <Icon className="size-2" aria-hidden="true" />
    </span>
  );
}

/** 原 w$t（jsx 156215）：结果行 */
export function ImportResultRow(props: {
  category: ExternalAgentImportCategory;
  result: ExternalAgentImportResultItem;
}) {
  const { category, result } = props;
  return (
    <div className="flex min-w-0 items-center gap-2.5 px-3 py-2">
      <ImportResultStatusIcon category={category} result={result} />
      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate text-ui-base font-medium text-foreground">{result.name}</span>
        {"version" in result && result.version ? (
          <Badge
            variant="outline"
            className="h-5 border-border bg-surface px-1.5 font-mono text-ui-xs font-normal text-foreground-subtle"
          >
            {result.version.startsWith("v") ? result.version : `v${result.version}`}
          </Badge>
        ) : null}
      </div>
    </div>
  );
}

/** 原 C$t（jsx 156199）：结果列表 */
export function ImportResultList(props: {
  category: ExternalAgentImportCategory;
  results: ExternalAgentImportResultItem[];
}) {
  const { category, results } = props;
  const { intl } = useIntlContext();
  return (
    <div className="space-y-2">
      <div className="text-ui-base font-medium text-foreground">
        {intl.formatMessage({ id: `settings.${category}.import.resultList` })}
      </div>
      <div className="overflow-hidden rounded-lg bg-card">
        {results.length === 0 ? (
          <div className="px-3 py-3 text-ui-base text-foreground-subtle">
            {intl.formatMessage({ id: `settings.${category}.import.resultEmpty` })}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {results.map((result) => (
              <ImportResultRow key={`${result.status}:${result.sourceScope}:${result.path}`} category={category} result={result} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** 原 O$t（jsx 156350）：资源行（单项勾选） */
export function ImportResourceRow(props: {
  agent: ExternalAgentDiscoveryAgent;
  category: ExternalAgentImportCategory;
  sourceScope: ExternalAgentImportScope;
  selected: Set<string>;
  item: ExternalAgentImportResource;
  onToggleSelection: (key: string) => void;
}) {
  const { agent, category, sourceScope, selected, item, onToggleSelection } = props;
  const key = importSelectionKey({ agent: agent.agent, category, sourceScope, resourcePath: item.path });
  const isSelected = selected.has(key);
  return (
    <button
      type="button"
      onClick={() => onToggleSelection(key)}
      className="flex w-full min-w-0 items-center gap-3 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-surface-hover/50"
    >
      <span className="flex min-w-0 items-center gap-2">
        <span
          className={cn(
            "flex size-4 shrink-0 items-center justify-center rounded-sm border border-border",
            isSelected && "border-primary bg-primary text-primary-foreground"
          )}
        >
          {isSelected ? <CheckIcon className="size-3.5" /> : null}
        </span>
        <span className="min-w-0 truncate text-ui-base text-foreground">{item.name}</span>
        {"version" in item && item.version ? (
          <Badge
            variant="outline"
            className="h-5 border-border bg-surface px-1.5 font-mono text-ui-xs font-normal text-foreground-subtle"
          >
            {item.version.startsWith("v") ? item.version : `v${item.version}`}
          </Badge>
        ) : null}
      </span>
    </button>
  );
}

/** 原 D$t（jsx 156275）：发现结果选择树（全选行 + 源分组 + 资源子项） */
export function ImportDiscoveryTree(props: {
  category: ExternalAgentImportCategory;
  discovery: ExternalAgentDiscovery;
  workspacePath?: string | null;
  activeScope: ExternalAgentImportScope;
  selectedKeys: string[];
  expandedSourceKeys: string[];
  onToggleSelection: (key: string) => void;
  onSetResourceSelection: (keys: string[], selected: boolean) => void;
  onToggleExpanded: (key: string) => void;
}) {
  const {
    category,
    discovery,
    workspacePath,
    activeScope,
    selectedKeys,
    expandedSourceKeys,
    onToggleSelection,
    onSetResourceSelection,
    onToggleExpanded,
  } = props;
  const { intl } = useIntlContext();
  const selectedSet = React.useMemo(() => new Set(selectedKeys), [selectedKeys]);
  const expandedSet = React.useMemo(() => new Set(expandedSourceKeys), [expandedSourceKeys]);
  const scopeGroup = React.useMemo(
    () => groupDiscoveryByScope(discovery.agents, workspacePath, category).find((group) => group.scope === activeScope),
    [category, discovery.agents, workspacePath]
  );
  const allResourceKeys = React.useMemo(
    () =>
      scopeGroup?.rows.flatMap(({ agent, sourceRoot }) =>
        agentHasCategory(agent, category)
          ? listImportableResources(sourceRoot, category)
              .filter((resource) => resource.importable)
              .map((resource) =>
                importSelectionKey({ agent: agent.agent, category, sourceScope: sourceRoot.scope, resourcePath: resource.path })
              )
          : []
      ) ?? [],
    [scopeGroup, category]
  );
  const selectedCount = allResourceKeys.filter((key) => selectedSet.has(key)).length;
  const allSelected = allResourceKeys.length > 0 && selectedCount === allResourceKeys.length;
  const partiallySelected = selectedCount > 0 && selectedCount < allResourceKeys.length;
  const selectAllLabel = intl.formatMessage({
    id: allSelected ? `settings.${category}.import.clearAll` : `settings.${category}.import.selectAll`,
  });

  return (
    <div className="flex w-full flex-col gap-1">
      {allResourceKeys.length > 0 ? (
        <div className="mb-1 flex min-w-0 items-center justify-between gap-2 px-2">
          <button
            type="button"
            role="checkbox"
            aria-checked={partiallySelected ? "mixed" : allSelected}
            aria-label={selectAllLabel}
            onClick={() => onSetResourceSelection(allResourceKeys, !allSelected)}
            className="flex min-w-0 items-center gap-2 rounded-md py-1 pr-2 text-left text-ui-base text-foreground-subtle transition-colors hover:text-foreground"
          >
            <span
              className={cn(
                "flex size-4 shrink-0 items-center justify-center rounded-sm border border-border",
                (allSelected || partiallySelected) && "border-primary bg-primary text-primary-foreground"
              )}
            >
              {allSelected ? <CheckIcon className="size-3.5" aria-hidden="true" /> : null}
              {partiallySelected ? <MinusIcon className="size-3.5" aria-hidden="true" /> : null}
            </span>
            <span className="shrink-0">{selectAllLabel}</span>
          </button>
          <div className="min-w-0 text-right text-ui-xs text-foreground-subtle">
            {intl.formatMessage(
              { id: `settings.${category}.import.selectionCount` },
              { selected: String(selectedCount), total: String(allResourceKeys.length) }
            )}
          </div>
        </div>
      ) : null}
      <div className="flex flex-col gap-1">
        {scopeGroup?.rows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card px-3 py-6 text-center text-ui-base text-foreground-subtle">
            {intl.formatMessage({ id: `settings.${category}.import.scopeEmpty` })}
          </div>
        ) : null}
        {scopeGroup?.rows.map(({ agent, sourceRoot }) => {
          if (!agentHasCategory(agent, category)) return null;
          const groupKey = `${sourceGroupKey(agent.agent, category, sourceRoot.scope)}:${sourceRoot.path}`;
          const resources = listImportableResources(sourceRoot, category).filter((resource) => resource.importable);
          const resourceKeys = resources.map((resource) =>
            importSelectionKey({ agent: agent.agent, category, sourceScope: sourceRoot.scope, resourcePath: resource.path })
          );
          const groupSelectedCount = resourceKeys.filter((key) => selectedSet.has(key)).length;
          const groupAllSelected = resourceKeys.length > 0 && groupSelectedCount === resourceKeys.length;
          const groupPartiallySelected = groupSelectedCount > 0 && groupSelectedCount < resourceKeys.length;
          const groupEmpty = resourceKeys.length === 0;
          const expanded = expandedSet.has(groupKey);
          return (
            <div key={groupKey} className="rounded-lg">
              <div
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors",
                  groupEmpty ? "opacity-70" : "hover:bg-surface-hover/50"
                )}
              >
                <button
                  type="button"
                  disabled={groupEmpty}
                  aria-label={intl.formatMessage({
                    id: groupAllSelected ? `settings.${category}.import.deselectSource` : `settings.${category}.import.selectSource`,
                  })}
                  onClick={() => onSetResourceSelection(resourceKeys, !groupAllSelected)}
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-md",
                    groupEmpty ? "cursor-default" : "cursor-pointer"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-4 items-center justify-center rounded-sm border border-border",
                      (groupAllSelected || groupPartiallySelected) && !groupEmpty && "border-primary bg-primary text-primary-foreground"
                    )}
                  >
                    {groupAllSelected && !groupEmpty ? <CheckIcon className="size-3.5" /> : null}
                    {groupPartiallySelected && !groupEmpty ? <MinusIcon className="size-3.5" /> : null}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onToggleExpanded(groupKey)}
                  className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2 gap-y-1 text-left"
                >
                  <span className="text-ui-base font-medium text-foreground">{agentDisplayName(agent.agent, intl)}</span>
                  <span className="min-w-0 break-all font-mono text-ui-xs text-foreground-subtle">{sourceRoot.path}</span>
                  {resources.length > 0 ? (
                    <span className="text-ui-xs text-foreground-subtlest">
                      {intl.formatMessage({ id: `settings.${category}.import.itemCount` }, { count: String(resources.length) })}
                    </span>
                  ) : null}
                </button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={intl.formatMessage({
                    id: expanded ? `settings.${category}.import.collapseSource` : `settings.${category}.import.expandSource`,
                  })}
                  onClick={() => onToggleExpanded(groupKey)}
                  className="shrink-0"
                >
                  {expanded ? <ChevronDownIcon className="size-3" /> : <ChevronRightIcon className="size-3" />}
                </Button>
              </div>
              {expanded ? (
                <div className="ml-9 border-l border-border pl-3">
                  {resources.map((resource) => (
                    <ImportResourceRow
                      key={`${groupKey}:${resource.path}`}
                      agent={agent}
                      category={category}
                      sourceScope={sourceRoot.scope}
                      selected={selectedSet}
                      item={resource}
                      onToggleSelection={onToggleSelection}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** 原 z7（js 193730 / jsx 155926）：外部 agent 配置导入对话框主体 */
export function ExternalAgentImportDialog(props: {
  category: ExternalAgentImportCategory;
  open: boolean;
  workspacePath?: string | null;
  workspaceIdentity?: string | null;
  onOpenChange: (open: boolean) => void;
  onImported: () => Promise<void>;
}) {
  const { category, open, workspacePath, workspaceIdentity, onOpenChange, onImported } = props;
  const { intl } = useIntlContext();
  const { settingsSyncService } = useServices();
  const [phase, setPhase] = React.useState<"selection" | "importing" | "complete">("selection");
  const [importing, setImporting] = React.useState(false);
  const [importResult, setImportResult] = React.useState<ExternalAgentImportResult | null>(null);
  const [importError, setImportError] = React.useState<string | null>(null);
  const state = useExternalAgentImportState({ category, enabled: open, workspacePath, workspaceIdentity });
  const {
    activeScope,
    discovery,
    error,
    expandedSourceKeys,
    importMode,
    importTargetScope,
    loading,
    selectedCount,
    selectedKeys,
    totalImportableCount,
  } = state;
  const progressValue = phase === "complete" ? 100 : importing ? 62 : 0;
  const flattenedResults = React.useMemo(() => flattenImportResults(importResult, category), [category, importResult]);
  const visibleError = error ?? importError;

  React.useEffect(() => {
    if (open) {
      setImportResult(null);
      setImportError(null);
      setPhase("selection");
    }
  }, [open]);

  const runImport = React.useCallback(
    async (targetScope: ExternalAgentImportScope) => {
      if (selectedKeys.length === 0) return;
      setImporting(true);
      setPhase("importing");
      setImportError(null);
      try {
        logger.debug("[ExternalAgentImportDialog] import start", {
          category,
          targetScope,
          importMode,
          selectedCount: selectedKeys.length,
        });
        setImportResult(
          await settingsSyncService.importSelected({
            workspacePath: workspacePath ?? undefined,
            workspaceIdentity,
            selections: buildImportSelections(selectedKeys, targetScope, importMode),
          })
        );
        setPhase("complete");
        await onImported();
      } catch (err) {
        const message = describeImportError(err);
        logger.error("[ExternalAgentImportDialog] import failed", { category, error: message });
        setImportError(message);
        setPhase("selection");
      } finally {
        setImporting(false);
      }
    },
    [onImported, category, importMode, selectedKeys, settingsSyncService, workspaceIdentity, workspacePath]
  );

  const finishLabel =
    phase === "complete"
      ? intl.formatMessage({ id: `settings.${category}.import.finish` })
      : intl.formatMessage({ id: "settingsSync.action.skip" });

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[min(84vh,640px)] max-h-[calc(100vh-2rem)] max-w-2xl overflow-hidden rounded-2xl p-0">
        <div className="flex h-full min-h-0 min-w-0 flex-col">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden p-4 sm:p-5">
            <DialogHeader className="shrink-0 sm:-mt-1">
              <div className="flex flex-col gap-3 pr-8 sm:flex-row sm:items-center sm:justify-between">
                <DialogTitle className="flex min-w-0 items-center text-ui-lg">
                  <span className="min-w-0 truncate">{intl.formatMessage({ id: `settings.${category}.import.title` })}</span>
                </DialogTitle>
                {phase === "selection" && !loading && discovery?.agents.length ? (
                  <div className="flex shrink-0 items-center gap-2">
                    <ImportSourceScopeSelect category={category} activeScope={activeScope} onActiveScopeChange={state.setActiveSourceScope} />
                    <Tooltip title={intl.formatMessage({ id: "settingsSync.action.rescan" })}>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={intl.formatMessage({ id: "settingsSync.action.rescan" })}
                        onClick={() => void state.loadDiscovery()}
                        disabled={loading}
                      >
                        <RefreshIcon className="size-3" aria-hidden="true" />
                      </Button>
                    </Tooltip>
                  </div>
                ) : null}
              </div>
            </DialogHeader>
            <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-border bg-card">
              <div className="h-full overflow-auto p-3">
                {visibleError ? (
                  <div className="mb-3 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-ui-base text-foreground">
                    {visibleError}
                  </div>
                ) : null}
                {loading ? (
                  <div className="flex h-full min-h-48 items-center justify-center gap-2 rounded-lg bg-surface px-4 py-10 text-ui-base text-foreground-subtle">
                    <SpinnerIcon className="size-4 animate-spin" />
                    {intl.formatMessage({ id: `settings.${category}.import.scanning` })}
                  </div>
                ) : phase === "importing" ? (
                  <div className="space-y-4 rounded-lg bg-surface px-4 py-5">
                    <div className="flex items-center justify-between gap-3 text-ui-base text-foreground-subtle">
                      <span>{intl.formatMessage({ id: `settings.${category}.import.importing` })}</span>
                      <span>{progressValue}%</span>
                    </div>
                    <Progress value={progressValue} className="h-2 rounded-full bg-background" />
                  </div>
                ) : phase === "complete" ? (
                  <div className="space-y-4">
                    <ImportResultSummaryBar category={category} result={importResult} />
                    <ImportResultList category={category} results={flattenedResults} />
                  </div>
                ) : discovery && discovery.agents.length > 0 ? (
                  <ImportDiscoveryTree
                    category={category}
                    discovery={discovery}
                    workspacePath={workspacePath}
                    activeScope={activeScope}
                    selectedKeys={selectedKeys}
                    expandedSourceKeys={expandedSourceKeys}
                    onToggleSelection={state.toggleSelection}
                    onSetResourceSelection={state.setResourceSelection}
                    onToggleExpanded={state.toggleExpanded}
                  />
                ) : (
                  <div className="rounded-lg border border-dashed border-border bg-surface px-4 py-10 text-center text-ui-base text-foreground-subtle">
                    {intl.formatMessage({ id: `settings.${category}.import.empty` })}
                  </div>
                )}
              </div>
            </div>
            <div className={cn("flex shrink-0 flex-wrap items-center gap-3", phase === "complete" ? "justify-end" : "justify-between")}>
              {phase === "complete" ? null : (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <div className="text-ui-base text-foreground-subtle">
                    {intl.formatMessage({ id: `settings.${category}.import.summary` }, { count: String(totalImportableCount) })}
                  </div>
                  {phase === "selection" && category !== "mcpServers" ? (
                    <ImportModeSelect category={category} importMode={importMode} onImportModeChange={state.setImportMode} />
                  ) : null}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2">
                {phase === "complete" ? (
                  <Button type="button" size="lg" onClick={() => onOpenChange(false)}>
                    {finishLabel}
                  </Button>
                ) : null}
                {phase === "selection" ? (
                  <ImportTargetSplitButton
                    category={category}
                    targetScope={importTargetScope}
                    disabled={selectedCount === 0 || loading}
                    workspacePath={workspacePath}
                    onTargetScopeChange={state.setImportTargetScope}
                    onImport={(scope) => void runImport(scope)}
                  />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </DialogRoot>
  );
}

/** 原 v$t（jsx 156034）：独立选择面板（远程同步对话框复用形态） */
export function ExternalAgentImportSelectionPane(props: {
  category: ExternalAgentImportCategory;
  state: ExternalAgentImportState;
  workspacePath?: string | null;
}) {
  const { category, state, workspacePath } = props;
  const { intl } = useIntlContext();
  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex shrink-0 items-center justify-between gap-3">
        <div className="min-w-0 text-ui-base text-foreground-subtle">
          {intl.formatMessage({ id: `settings.${category}.import.summary` }, { count: String(state.totalImportableCount) })}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ImportSourceScopeSelect category={category} activeScope={state.activeScope} onActiveScopeChange={state.setActiveSourceScope} />
          <Tooltip title={intl.formatMessage({ id: "settingsSync.action.rescan" })}>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={intl.formatMessage({ id: "settingsSync.action.rescan" })}
              onClick={() => void state.loadDiscovery()}
              disabled={state.loading}
            >
              <RefreshIcon className="size-3" aria-hidden="true" />
            </Button>
          </Tooltip>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-border bg-card">
        <div className="h-full overflow-auto p-3">
          {state.error ? (
            <div className="mb-3 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-ui-base text-foreground">
              {state.error}
            </div>
          ) : null}
          {state.loading ? (
            <div className="flex h-full min-h-48 items-center justify-center gap-2 rounded-lg bg-surface px-4 py-10 text-ui-base text-foreground-subtle">
              <SpinnerIcon className="size-4 animate-spin" />
              {intl.formatMessage({ id: `settings.${category}.import.scanning` })}
            </div>
          ) : state.discovery && state.discovery.agents.length > 0 ? (
            <ImportDiscoveryTree
              category={category}
              discovery={state.discovery}
              workspacePath={workspacePath}
              activeScope={state.activeScope}
              selectedKeys={state.selectedKeys}
              expandedSourceKeys={state.expandedSourceKeys}
              onToggleSelection={state.toggleSelection}
              onSetResourceSelection={state.setResourceSelection}
              onToggleExpanded={state.toggleExpanded}
            />
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-surface px-4 py-10 text-center text-ui-base text-foreground-subtle">
              {intl.formatMessage({ id: `settings.${category}.import.empty` })}
            </div>
          )}
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="text-ui-base text-foreground-subtle">
          {intl.formatMessage(
            { id: `settings.${category}.import.selectionCount` },
            { selected: String(state.selectedCount), total: String(state.totalImportableCount) }
          )}
        </div>
        <div className="flex items-center gap-3">
          {category === "mcpServers" ? null : (
            <div className="flex items-center gap-1.5">
              <span className="shrink-0 text-ui-base text-foreground-subtlest">
                {intl.formatMessage({ id: `settings.${category}.import.modeLabel` })}
              </span>
              <ImportModeSelect category={category} importMode={state.importMode} onImportModeChange={state.setImportMode} />
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="shrink-0 text-ui-base text-foreground-subtlest">
              {intl.formatMessage({ id: `settings.${category}.import.targetLabel` })}
            </span>
            <ImportTargetScopeSelect
              category={category}
              targetScope={state.importTargetScope}
              workspacePath={workspacePath}
              onTargetScopeChange={state.setImportTargetScope}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/** 原 _$t（js 193640）：MCP 导入对话框（category=mcpServers 薄包装） */
export function McpImportDialog(props: Omit<ExternalAgentImportDialogProps, "category">) {
  return <ExternalAgentImportDialog {...props} category="mcpServers" />;
}
/** 原 h$t（jsx 155825）：技能导入对话框（category=skills 薄包装） */
export function SkillsImportDialog(props: Omit<ExternalAgentImportDialogProps, "category">) {
  return <ExternalAgentImportDialog {...props} category="skills" />;
}
/** 原 g$t（jsx 155831）：命令导入对话框（category=commands 薄包装） */
export function CommandsImportDialog(props: Omit<ExternalAgentImportDialogProps, "category">) {
  return <ExternalAgentImportDialog {...props} category="commands" />;
}
export type ExternalAgentImportDialogProps = React.ComponentProps<typeof ExternalAgentImportDialog>;
