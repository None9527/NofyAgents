// A0-S4-4a: 自 modules/Modals.tsx 远程同步对话框子族（§2，原 r4 分派 + ZEt/lDt/XDt）原样迁入（组件单元；原文件现为薄 re-export shim）。
// 迁出体 = 原文件 637–3307（canOpenRemoteSessionSourceCheck/RemoteTarget/RemoteSyncDropdownButton/RemoteSyncDialogs）。
// 图标常量（§0 createLucideIcon 产物）经 shim import。
import * as React from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../ui/hover-card'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '../ui/dropdown-menu'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { LoaderCircle as IconLoaderCircle } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0
import { Button, ChevronRight as IconChevronRight } from '../../modules/button'; // 原 X/c，button-laUijeDG.js（A0-D 接线）；button chunk 图标 pass-1 同源
import { cn } from '../../modules/UtilsCn'; // 原 Z，utils-CEEH0K_K.js（A0-D 接线：declare → UtilsCn canonical）
import { useZCodeIntl as useIntlContext } from '../../modules/I18n'; // 原 G，IntlProvider-C321H7m8.js（A0-D 接线：declare → I18n canonical）
import { InfoTooltip as Tooltip } from '../../modules/UsageStatsUiParts'; // 原 Ia（u 导出），usageStatsUiParts-CiR7YEhh.js（A0-D 接线）
import { IconChevronDown, IconCloudUpload, IconCircleAlert, IconCircleCheck, IconCircleStop, IconCircleX, IconCable, IconPuzzle } from '../../modules/Modals'; // §0 图标常量（createLucideIcon 产物）留存 shim

/* ============================================================================
 * 2. 远程同步对话框子族（原 r4 分派 + ZEt/lDt/XDt 三对话框，styles 125012-127349）
 * 〔A1-R51〕全族行号纠偏：本节及诸区段 banner「js」行号注记系 A0 期旧口径，较真相源
 *    styles-CdEGpc2x.js 系统性 −17 漂移，机械批纠为 styles 真值（+17）；77 混淆名逐名
 *    对 bundle 定义行实证（抽样行依据见 A1-R51.report.md §三）。族界 125012–127349
 *    = 旧注 124995–127332 +17（zEt@125012 起、族尾 127349 止，R50 既验）。
 *    $2/q2 二件 R50 先纠（styles 127142/125207），其纠偏注记所引旧号为史料。
 * ----------------------------------------------------------------------------
 * 菜单项 n4 已在 TopBar.tsx（RemoteSyncMenuItems）。本节含：preflight 助手、
 * 「同步到远端」下拉按钮 $Dt、分派器 r4、技能/MCP/插件三个同步对话框全量。
 * ==========================================================================*/

/** 原 ZDt/QDt（styles 127131-127138 / jsx 107547） */
const REMOTE_SYNC_PREFLIGHT_TIMEOUT_MS = 15000;
class RemoteSyncPreflightTimeoutError extends Error {
  timeoutMs: number;
  constructor(timeoutMs: number) {
    super(`Remote sync preflight timed out after ${timeoutMs}ms`);
    this.timeoutMs = timeoutMs;
    this.name = `RemoteSyncPreflightTimeoutError`;
  }
}
/** 原 Q2（styles 127139 / jsx 107553） */
function isRemoteSyncPreflightTimeoutError(e: unknown): e is RemoteSyncPreflightTimeoutError {
  return e instanceof RemoteSyncPreflightTimeoutError;
}
/** 原 $2（styles 127142-127149 / jsx 107556）：仅 ssh/wsl 远端会话且有本地源服务才可同步
 *  （A0-S2d/B5-14 补导出：RemoteGapSegments.tsx 经真实 import 消费）。
 *  〔A1-R50〕行号纠偏：原注「js 127125-127132」较真相源 styles-CdEGpc2x.js 漂移 −17
 *  （A0 期旧版口径；本族 ZDt/QDt/Q2/e4/t4 注记同漂，全族纠偏留批）；
 *  +Skills/Plugins 活面 declare 改指本实体（别名保留调用名）。 */
export function canOpenRemoteSessionSourceCheck(e: {
  clientMode: string;
  hasLocalSourceService: boolean;
  remoteSessionId?: string | null;
  remoteTarget?: { kind?: string } | null;
}): boolean {
  return e.clientMode === `web-remote-replayable` || e.hasLocalSourceService === false
    ? false
    : !!(
        e.remoteSessionId?.trim() &&
        (e.remoteTarget?.kind === `ssh` || e.remoteTarget?.kind === `wsl`)
      );
}
/** 原 e4（styles 127150 / jsx 107559） */
function canSubmitRemoteSync(e: { inFlight: boolean; selectedCount: number }): boolean {
  return !e.inFlight && e.selectedCount > 0;
}
/** 原 t4（styles 127153-127165 / jsx 107562）：preflight 15s 超时竞速 */
async function withRemoteSyncPreflightTimeout<T>(
  run: () => Promise<T>,
  timeoutMs: number = REMOTE_SYNC_PREFLIGHT_TIMEOUT_MS,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => {
      reject(new RemoteSyncPreflightTimeoutError(timeoutMs));
    }, timeoutMs);
  });
  try {
    return await Promise.race([run(), timeout]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

/** 远程目标显示标签（原 q2，styles 125207-125214 / jsx 106293；〔A1-R50〕行号纠偏，
 *  原注「js 125190-125198」同 −17 漂移。补导出：Skills/Plugins/Mcp 三活面 declare
 *  改指本实体，别名保留调用名——q2 参型面 = 下方本叶 RemoteTarget（kind: string 宽形，
 *  与 family-A 属主 ImeComposition::RemoteTarget 异形各主））。 */
export interface RemoteTarget {
  kind: string;
  host?: string;
  port?: number;
  username?: string;
  distro?: string;
  user?: string;
}
export function remoteSyncTargetLabel(target: RemoteTarget, workspacePath?: string): string {
  const label =
    target.kind === `ssh`
      ? `${target.username}@${target.host}${target.port ? `:${target.port}` : ``}`
      : target.kind === `wsl`
        ? [`WSL`, target.distro, target.user?.trim()].filter(Boolean).join(` · `)
        : target.kind;
  return workspacePath ? `${label} · ${workspacePath}` : label;
}

/** 原 $Dt（styles 127218-127264 / jsx 107599）：「同步到远端」下拉按钮（设置分区用） */
export function RemoteSyncDropdownButton({
  canSyncSkills,
  canSyncMcp,
  canSyncPlugins = false,
  mcpDisabled = false,
  onOpenSkillSync,
  onOpenMcpSync,
  onOpenPluginSync,
}: {
  canSyncSkills: boolean;
  canSyncMcp: boolean;
  canSyncPlugins?: boolean;
  mcpDisabled?: boolean;
  onOpenSkillSync: () => void;
  onOpenMcpSync: () => void;
  onOpenPluginSync: () => void;
}) {
  const { intl } = useIntlContext();
  // 原 VO/HO/UO/WO = DropdownMenu 原语族（TopBar.tsx §1.1 已登记）
  return !canSyncSkills && !canSyncMcp && !canSyncPlugins ? null : (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="secondary" size="sm" className={`gap-1`}>
          <IconCloudUpload className={`size-3.5`} aria-hidden="true" />
          {intl.formatMessage({ id: `settings.remoteSync.open` })}
          <IconChevronDown className={`size-3.5 text-foreground-subtle`} aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={`w-40`}>
        <RemoteSyncMenuItemsInner
          canSyncSkills={canSyncSkills}
          canSyncMcp={canSyncMcp}
          canSyncPlugins={canSyncPlugins}
          mcpDisabled={mcpDisabled}
          onOpenSkillSync={onOpenSkillSync}
          onOpenMcpSync={onOpenMcpSync}
          onOpenPluginSync={onOpenPluginSync}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
/** DropdownMenu 原语族接口（原 VO/HO/UO/WO，TopBar.tsx 已还原实现） */




/** 原 n4 菜单项（TopBar.tsx 已导出 RemoteSyncMenuItems；此处为族内引用接口） */
declare const RemoteSyncMenuItemsInner: React.FC<{
  canSyncSkills: boolean;
  canSyncMcp: boolean;
  canSyncPlugins?: boolean;
  mcpDisabled?: boolean;
  onOpenSkillSync: () => void;
  onOpenMcpSync: () => void;
  onOpenPluginSync: () => void;
}>;

/* ----------------------------------------------------------------------------
 * 2.1 技能同步对话框（原 ZEt，styles 125288-125487 / jsx 106355）
 * --------------------------------------------------------------------------*/

/** 原 zEt（styles 125012 / jsx 106207）：技能卡内自行处理点击的元素白名单 */
const SKILL_SYNC_ACTION_SELECTOR = `button,input,a,textarea,select,label,[data-remote-skill-sync-card-action]`;

/** 原 BEt（styles 125013-125017 / jsx 106208） */
function shouldHandleSkillCardClick({ exists, target }: { exists: boolean; target: EventTarget | null }): boolean {
  if (exists) return false;
  const closest = (target as { closest?: (sel: string) => unknown } | null)?.closest;
  return typeof closest != `function` || !closest.call(target, SKILL_SYNC_ACTION_SELECTOR);
}

interface SkillCandidate {
  id: string;
  name: string;
  description?: string;
  directoryName: string;
}
interface SkillSyncRow {
  candidate: SkillCandidate;
  exists: boolean;
}

/** 原 WEt（styles 125197 / jsx 106280） */
function mergeSkillRows(
  candidates: SkillCandidate[],
  statuses: Array<{ directoryName: string; exists?: boolean }>,
): SkillSyncRow[] {
  const byName = new Map(statuses.map((s): [string, (typeof statuses)[number]] => [s.directoryName, s]));
  return candidates.map((candidate) => ({ candidate, exists: byName.get(candidate.directoryName)?.exists ?? false }));
}
/** 原 GEt（styles 125201 / jsx 106287） */
function defaultSkillSelection(rows: SkillSyncRow[]): Set<string> {
  return new Set(rows.filter((r) => !r.exists).map((r) => r.candidate.id));
}
/** 原 KEt（styles 125204 / jsx 106290） */
function filterSkillRows(rows: SkillSyncRow[], showExisting: boolean): SkillSyncRow[] {
  return showExisting ? [...rows] : rows.filter((r) => !r.exists);
}

/** 原 VEt（styles 125018-125123 / jsx 106216）：技能选择行列表 */
function SkillSyncRowList({
  rows,
  selectedIds,
  emptyMessageId = `settings.skills.remoteSync.empty`,
  onToggle,
}: {
  rows: SkillSyncRow[];
  selectedIds: Set<string>;
  emptyMessageId?: string;
  onToggle: (id: string, checked: boolean) => void;
}) {
  const { intl } = useIntlContext();
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set());
  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  return rows.length === 0 ? (
    <div className={`rounded-lg border border-border bg-surface px-3 py-3 text-ui-base text-foreground-subtle`}>
      {intl.formatMessage({ id: emptyMessageId })}
    </div>
  ) : (
    <div className={`grid gap-2`}>
      {rows.map((row) => {
        const checkboxId = `remote-skill-sync-${row.candidate.id}`;
        const labelId = `${checkboxId}-label`;
        const expanded = expandedIds.has(row.candidate.id);
        const checked = !row.exists && selectedIds.has(row.candidate.id);
        return (
          <div
            key={row.candidate.id}
            className={`grid grid-cols-[auto_1fr] gap-3 rounded-lg border border-border bg-surface px-3 py-2 text-ui-base ${row.exists ? `cursor-default` : `cursor-pointer hover:border-border-hover hover:bg-surface-hover`}`}
            onClick={(event) => {
              if (shouldHandleSkillCardClick({ exists: row.exists, target: event.target })) onToggle(row.candidate.id, !checked);
            }}
          >
            <input
              id={checkboxId}
              type="checkbox"
              aria-labelledby={labelId}
              className={`mt-1 size-4`}
              disabled={row.exists}
              checked={checked}
              onChange={(event) => onToggle(row.candidate.id, event.currentTarget.checked)}
            />
            <span className={`min-w-0`}>
              <span className={`flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1`}>
                <label id={labelId} htmlFor={checkboxId} className={`font-medium text-foreground`}>
                  {row.candidate.name}
                </label>
                {row.candidate.description ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className={`size-5 rounded-sm text-foreground-subtle hover:text-foreground`}
                    aria-expanded={expanded}
                    aria-label={intl.formatMessage({
                      id: expanded
                        ? `settings.skills.remoteSync.collapseDescription`
                        : `settings.skills.remoteSync.expandDescription`,
                    })}
                    data-remote-skill-sync-card-action="description-toggle"
                    onClick={() => toggleExpanded(row.candidate.id)}
                  >
                    {expanded ? <IconChevronDown className={`size-3.5`} aria-hidden="true" /> : <IconChevronRight className={`size-3.5`} aria-hidden="true" />}
                  </Button>
                ) : null}
                {row.exists ? (
                  <span className={`text-ui-base text-foreground-subtlest`}>
                    {intl.formatMessage({ id: `settings.skills.remoteSync.existing` })}
                  </span>
                ) : null}
              </span>
              {row.candidate.description ? (
                <span className={`mt-1 block min-w-0`}>
                  <span className={`text-ui-base text-foreground-subtle ${expanded ? `block whitespace-pre-wrap` : `line-clamp-1`}`}>
                    {row.candidate.description}
                  </span>
                </span>
              ) : null}
              <span className={`mt-1 block break-all font-mono text-ui-base text-foreground-subtlest`}>
                {row.candidate.directoryName}
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** 原 HEt（styles 125124-125167 / jsx 106254）：技能同步结果视图 */
function SkillSyncResultView({ result }: { result: { results: Array<{ name: string; directoryName: string; status: string; error?: string }> } | null }) {
  const { intl } = useIntlContext();
  return result ? (
    <div className={`grid gap-2`}>
      <div className={`rounded-lg border border-border bg-surface px-3 py-2 text-ui-base text-foreground`}>
        {intl.formatMessage({ id: `settings.skills.remoteSync.complete` })}
      </div>
      {result.results.map((item) => (
        <div key={item.directoryName} className={`rounded-lg border border-border bg-surface px-3 py-2 text-ui-base`}>
          <div className={`flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1`}>
            <span className={`font-medium text-foreground`}>{item.name}</span>
            <span className={`text-foreground-subtle`}>
              {intl.formatMessage({ id: `settings.skills.remoteSync.${item.status}` })}
            </span>
          </div>
          {item.error ? <div className={`mt-1 break-words text-ui-base text-destructive`}>{item.error}</div> : null}
        </div>
      ))}
    </div>
  ) : null;
}

/** 原 UEt（styles 125168-125196 / jsx 106266）：技能同步标题 + 警告 tooltip */
function SkillSyncTitle() {
  const { intl } = useIntlContext();
  const [warningOpen, setWarningOpen] = React.useState(false);
  const warningTitle = intl.formatMessage({ id: `settings.skills.remoteSync.warningTitle` });
  return (
    <DialogTitle className={`flex min-w-0 items-center gap-2 pr-8`}>
      <span className={`min-w-0 truncate`}>{intl.formatMessage({ id: `settings.skills.remoteSync.title` })}</span>
      <Tooltip
        open={warningOpen}
        title={warningTitle}
        description={intl.formatMessage({ id: `settings.skills.remoteSync.warningDescription` })}
        side="right"
        align="center"
      >
        <span
          aria-label={warningTitle}
          className={`inline-flex size-5 items-center justify-center rounded-full text-warning transition-colors hover:bg-hover hover:text-warning focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused`}
          onMouseEnter={() => setWarningOpen(true)}
          onMouseLeave={() => setWarningOpen(false)}
          role="img"
        >
          <IconCircleAlert className={`size-3.5`} aria-hidden="true" />
        </span>
      </Tooltip>
    </DialogTitle>
  );
}

/** 原 qEt（styles 125216-125218 / jsx 106297） */
function resolveSelectAllState({ selectedCount, totalSelectable }: { selectedCount: number; totalSelectable: number }) {
  return {
    checked: totalSelectable > 0 && selectedCount >= totalSelectable,
    disabled: totalSelectable === 0,
    indeterminate: totalSelectable > 0 && selectedCount > 0 && selectedCount < totalSelectable,
  };
}
/** 原 JEt（styles 125219-125235 / jsx 106307） */
function SkillSyncShowExisting({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (v: boolean) => void }) {
  const { intl } = useIntlContext();
  return (
    <label className={`inline-flex h-6 cursor-pointer items-center gap-2 rounded-md px-1 text-ui-base text-foreground-subtle hover:text-foreground`}>
      <input type="checkbox" className={`size-4`} checked={checked} onChange={(e) => onCheckedChange(e.currentTarget.checked)} />
      <span>{intl.formatMessage({ id: `settings.skills.remoteSync.showExisting` })}</span>
    </label>
  );
}
/** 原 YEt（styles 125236-125258 / jsx 106318） */
function SkillSyncHeader({
  targetLabel,
  showExistingRemoteSkills,
  showExistingFilter,
  onShowExistingRemoteSkillsChange,
}: {
  targetLabel: string;
  showExistingRemoteSkills: boolean;
  showExistingFilter: boolean;
  onShowExistingRemoteSkillsChange: (v: boolean) => void;
}) {
  const { intl } = useIntlContext();
  return (
    <div className={`flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between`}>
      <p className={`min-w-0 break-words font-mono text-ui-base text-foreground-subtle`}>
        {intl.formatMessage({ id: `settings.skills.remoteSync.target` }, { target: targetLabel })}
      </p>
      {showExistingFilter ? (
        <div className={`shrink-0`}>
          <SkillSyncShowExisting checked={showExistingRemoteSkills} onCheckedChange={onShowExistingRemoteSkillsChange} />
        </div>
      ) : null}
    </div>
  );
}
/** 原 XEt（styles 125259-125287 / jsx 106333）：全选（indeterminate 三态） */
function SkillSyncSelectAll({
  selectedCount,
  totalSelectable,
  onSelectAll,
  onClearAll,
}: {
  selectedCount: number;
  totalSelectable: number;
  onSelectAll: () => void;
  onClearAll: () => void;
}) {
  const { intl } = useIntlContext();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const state = resolveSelectAllState({ selectedCount, totalSelectable });
  React.useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = state.indeterminate;
  }, [state.indeterminate]);
  return (
    <label
      className={`inline-flex h-6 items-center gap-2 rounded-md px-1 text-ui-base text-foreground-subtle ${state.disabled ? `opacity-50` : `cursor-pointer hover:text-foreground`}`}
    >
      <input
        ref={inputRef}
        type="checkbox"
        className={`size-4`}
        checked={state.checked}
        disabled={state.disabled}
        aria-checked={state.indeterminate ? `mixed` : state.checked ? `true` : `false`}
        onChange={(e) => {
          if (e.currentTarget.checked) onSelectAll();
          else onClearAll();
        }}
      />
      <span>{intl.formatMessage({ id: `settings.skills.remoteSync.selectAll` })}</span>
    </label>
  );
}

interface SkillSyncService {
  listLocalUserSkillCandidates(): Promise<{ candidates: SkillCandidate[] }>;
  exportSkillsArchive(args: { skillIds: string[] }): Promise<{ archive: unknown }>;
}
interface RemoteSkillSyncService {
  listRemoteUserSkillStatuses(args: {
    directoryNames: string[];
    skills: Array<{ directoryName: string; name: string }>;
  }): Promise<{ statuses: Array<{ directoryName: string; exists?: boolean }> }>;
  checkRemoteUserSkillWriteAccess(): Promise<{ ok: boolean; path?: string; error?: string }>;
  importSkillsArchive(args: { archive: unknown; overwrite: boolean }): Promise<{
    results: Array<{ name: string; directoryName: string; status: string; error?: string }>;
  }>;
}

/** 原 ZEt（styles 125288-125487 / jsx 106355）：技能同步对话框 */
function SkillSyncDialog(props: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  localSkillSyncService: SkillSyncService;
  remoteSkillSyncService: RemoteSkillSyncService;
  remoteTarget: RemoteTarget;
  workspacePath: string;
  workspaceIdentity?: string | null;
  onSynced: () => Promise<void> | void;
}) {
  const { intl } = useIntlContext();
  const {
    open,
    onOpenChange,
    localSkillSyncService,
    remoteSkillSyncService,
    remoteTarget,
    workspacePath,
    onSynced,
  } = props;
  const [phase, setPhase] = React.useState<SyncPhase>(`loading`);
  const [rows, setRows] = React.useState<SkillSyncRow[]>([]);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [showExisting, setShowExisting] = React.useState(true);
  const [result, setResult] = React.useState<Awaited<ReturnType<RemoteSkillSyncService["importSkillsArchive"]>> | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const inFlightRef = React.useRef(false);
  React.useEffect(() => {
    if (!open) return;
    let disposed = false;
    setPhase(`loading`);
    setRows([]);
    setSelectedIds(new Set());
    setShowExisting(true);
    setResult(null);
    setErrorMessage(null);
    inFlightRef.current = false;
    (async () => {
      try {
        const local = await localSkillSyncService.listLocalUserSkillCandidates();
        const remote = await remoteSkillSyncService.listRemoteUserSkillStatuses({
          directoryNames: local.candidates.map((c) => c.directoryName),
          skills: local.candidates.map((c) => ({ directoryName: c.directoryName, name: c.name })),
        });
        if (disposed) return;
        const merged = mergeSkillRows(local.candidates, remote.statuses);
        setRows(merged);
        setSelectedIds(defaultSkillSelection(merged));
        setPhase(`selection`);
      } catch (error) {
        if (disposed) return;
        setErrorMessage(error instanceof Error ? error.message : String(error));
        setPhase(`selection`);
      }
    })();
    return () => {
      disposed = true;
    };
  }, [localSkillSyncService, open, remoteSkillSyncService]);
  const visibleRows = React.useMemo(() => filterSkillRows(rows, showExisting), [rows, showExisting]);
  const selectableIds = React.useMemo(() => visibleRows.filter((r) => !r.exists).map((r) => r.candidate.id), [visibleRows]);
  const selectedAvailable = React.useMemo(() => selectableIds.filter((id) => selectedIds.has(id)), [selectedIds, selectableIds]);
  const selectedCount = selectedAvailable.length;
  const targetLabel = remoteSyncTargetLabel(remoteTarget, workspacePath);
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && (phase === `preflighting` || phase === `syncing`)) return;
        onOpenChange(next);
      }}
    >
      <DialogContent className={`h-[min(720px,calc(100dvh-2rem))] max-h-[min(720px,calc(100dvh-2rem))] max-w-2xl flex flex-col overflow-hidden`}>
        <DialogHeader>
          <SkillSyncTitle />
          <SkillSyncHeader
            targetLabel={targetLabel}
            showExistingRemoteSkills={showExisting}
            showExistingFilter={phase === `selection` && rows.length > 0}
            onShowExistingRemoteSkillsChange={setShowExisting}
          />
        </DialogHeader>
        <div className={`min-h-0 flex-1 overflow-y-auto`}>
          {errorMessage ? (
            <div className={`mb-3 rounded-lg border border-destructive/40 bg-surface px-3 py-2 text-ui-base text-destructive`}>
              {errorMessage}
            </div>
          ) : null}
          {phase === `loading` ? (
            <div className={`flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-3 text-ui-base text-foreground-subtle`}>
              <IconLoaderCircle className={`size-3.5 animate-spin`} aria-hidden="true" />
              {intl.formatMessage({ id: `settings.skills.remoteSync.loading` })}
            </div>
          ) : null}
          {phase === `preflighting` ? (
            <div className={`flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-3 text-ui-base text-foreground-subtle`}>
              <IconLoaderCircle className={`size-3.5 animate-spin`} aria-hidden="true" />
              {intl.formatMessage({ id: `settings.remoteSync.preflighting` })}
            </div>
          ) : null}
          {phase === `selection` ? (
            <SkillSyncRowList
              rows={visibleRows}
              selectedIds={selectedIds}
              emptyMessageId={rows.length > 0 ? `settings.skills.remoteSync.filteredEmpty` : undefined}
              onToggle={(id, checked) => {
                setSelectedIds((prev) => {
                  const next = new Set(prev);
                  if (checked) next.add(id);
                  else next.delete(id);
                  return next;
                });
              }}
            />
          ) : null}
          {phase === `syncing` ? (
            <div className={`flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-3 text-ui-base text-foreground-subtle`}>
              <IconLoaderCircle className={`size-3.5 animate-spin`} aria-hidden="true" />
              {intl.formatMessage({ id: `settings.skills.remoteSync.syncing` })}
            </div>
          ) : null}
          {phase === `complete` ? <SkillSyncResultView result={result} /> : null}
        </div>
        <div className={`flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between`}>
          <div className={`text-ui-base text-foreground-subtle`}>
            {intl.formatMessage(
              { id: `settings.skills.remoteSync.selectionCount` },
              { selected: String(selectedCount), total: String(selectableIds.length) },
            )}
          </div>
          <div className={`flex flex-wrap justify-end gap-2`}>
            {phase === `selection` ? (
              <SkillSyncSelectAll
                selectedCount={selectedCount}
                totalSelectable={selectableIds.length}
                onSelectAll={() => setSelectedIds(new Set(selectableIds))}
                onClearAll={() => setSelectedIds(new Set())}
              />
            ) : null}
            <Button
              type="button"
              size="sm"
              disabled={phase !== `selection` || selectedCount === 0}
              onClick={async () => {
                if (!canSubmitRemoteSync({ inFlight: inFlightRef.current, selectedCount: selectedAvailable.length })) {
                  if (selectedAvailable.length === 0)
                    setErrorMessage(intl.formatMessage({ id: `settings.skills.remoteSync.noSelection` }));
                  return;
                }
                inFlightRef.current = true;
                setErrorMessage(null);
                setPhase(`preflighting`);
                try {
                  const preflight = await withRemoteSyncPreflightTimeout(() =>
                    remoteSkillSyncService.checkRemoteUserSkillWriteAccess(),
                  );
                  if (!preflight.ok)
                    throw Error(
                      intl.formatMessage(
                        { id: `settings.remoteSync.preflightFailed` },
                        { path: preflight.path, error: preflight.error ?? `` },
                      ),
                    );
                  setPhase(`syncing`);
                  const exported = await localSkillSyncService.exportSkillsArchive({ skillIds: selectedAvailable });
                  const imported = await remoteSkillSyncService.importSkillsArchive({ archive: exported.archive, overwrite: false });
                  await onSynced();
                  setResult(imported);
                  setPhase(`complete`);
                } catch (error) {
                  setErrorMessage(
                    isRemoteSyncPreflightTimeoutError(error)
                      ? intl.formatMessage(
                          { id: `settings.remoteSync.preflightTimeout` },
                          { seconds: String(Math.ceil(error.timeoutMs / 1000)) },
                        )
                      : error instanceof Error
                        ? error.message
                        : String(error),
                  );
                  setPhase(`selection`);
                } finally {
                  inFlightRef.current = false;
                }
              }}
            >
              <IconCloudUpload className={`size-3.5`} aria-hidden="true" />
              {intl.formatMessage({ id: `settings.skills.remoteSync.start` })}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type SyncPhase = "loading" | "selection" | "preflighting" | "syncing" | "complete";

/* ----------------------------------------------------------------------------
 * 2.2 MCP 同步对话框（原 lDt，styles 125745-125950 / jsx 106590；助手 125488-125744）
 * --------------------------------------------------------------------------*/

interface McpCandidate {
  id: string;
  name: string;
  path: string;
  source: string;
  config: Record<string, unknown>;
}
interface McpSyncRow {
  candidate: McpCandidate;
  exists: boolean;
}

/** 原 QEt（styles 125488 / jsx 106467） */
function mergeMcpRows(
  candidates: McpCandidate[],
  statuses: Array<{ name: string; exists?: boolean }>,
): McpSyncRow[] {
  const byName = new Map(statuses.map((s): [string, (typeof statuses)[number]] => [s.name, s]));
  return candidates.map((candidate) => ({ candidate, exists: byName.get(candidate.name)?.exists ?? false }));
}
/** 原 $Et（styles 125492 / jsx 106474） */
function defaultMcpSelection(rows: McpSyncRow[]): Set<string> {
  return new Set(rows.filter((r) => !r.exists).map((r) => r.candidate.id));
}
/** 原 eDt（styles 125495 / jsx 106477） */
function filterMcpRows(rows: McpSyncRow[], showExisting: boolean): McpSyncRow[] {
  return showExisting ? [...rows] : rows.filter((r) => !r.exists);
}
/** 原 tDt（styles 125498-125506 / jsx 106480）：导入载荷（overwrite 恒 false） */
function buildMcpImportPayload(e: {
  exported: { servers: unknown; localHomeDir?: string };
  localHomeDir: string;
  localWorkspacePath?: string;
  remoteWorkspacePath: string;
}) {
  return {
    servers: e.exported.servers,
    localHomeDir: e.exported.localHomeDir || e.localHomeDir,
    localWorkspacePath: e.localWorkspacePath,
    remoteWorkspacePath: e.remoteWorkspacePath,
    overwrite: false,
  };
}
/** 原 nDt（styles 125507-125515 / jsx 106489）：type→command/stdio→url/http 推断 */
function resolveMcpServerKind(config: Record<string, unknown>): string {
  return typeof config.type == `string` && config.type.trim()
    ? (config.type as string).trim()
    : typeof config.command == `string` && (config.command as string).trim()
      ? `stdio`
      : typeof config.url == `string` && (config.url as string).trim()
        ? `http`
        : `unknown`;
}

/** 原 rDt（styles 125516-125544 / jsx 106492）：MCP 同步标题 + 警告 tooltip */
function McpSyncTitle() {
  const { intl } = useIntlContext();
  const [warningOpen, setWarningOpen] = React.useState(false);
  const warningTitle = intl.formatMessage({ id: `settings.mcp.remoteSync.warningTitle` });
  return (
    <DialogTitle className={`flex min-w-0 items-center gap-2 pr-8`}>
      <span className={`min-w-0 truncate`}>{intl.formatMessage({ id: `settings.mcp.remoteSync.title` })}</span>
      <Tooltip
        open={warningOpen}
        title={warningTitle}
        description={intl.formatMessage({ id: `settings.mcp.remoteSync.warningDescription` })}
        side="right"
        align="center"
      >
        <span
          aria-label={warningTitle}
          className={`inline-flex size-5 items-center justify-center rounded-full text-warning transition-colors hover:bg-hover hover:text-warning focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused`}
          onMouseEnter={() => setWarningOpen(true)}
          onMouseLeave={() => setWarningOpen(false)}
          role="img"
        >
          <IconCircleAlert className={`size-3.5`} aria-hidden="true" />
        </span>
      </Tooltip>
    </DialogTitle>
  );
}
/** 原 iDt（styles 125545-125561 / jsx 106506） */
function McpSyncShowExisting({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (v: boolean) => void }) {
  const { intl } = useIntlContext();
  return (
    <label className={`inline-flex h-6 cursor-pointer items-center gap-2 rounded-md px-1 text-ui-base text-foreground-subtle hover:text-foreground`}>
      <input type="checkbox" className={`size-4`} checked={checked} onChange={(e) => onCheckedChange(e.currentTarget.checked)} />
      <span>{intl.formatMessage({ id: `settings.mcp.remoteSync.showExisting` })}</span>
    </label>
  );
}
/** 原 aDt（styles 125562-125584 / jsx 106517） */
function McpSyncHeader({
  targetLabel,
  showExistingRemoteMcp,
  showExistingFilter,
  onShowExistingRemoteMcpChange,
}: {
  targetLabel: string;
  showExistingRemoteMcp: boolean;
  showExistingFilter: boolean;
  onShowExistingRemoteMcpChange: (v: boolean) => void;
}) {
  const { intl } = useIntlContext();
  return (
    <div className={`flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between`}>
      <p className={`min-w-0 break-words font-mono text-ui-base text-foreground-subtle`}>
        {intl.formatMessage({ id: `settings.mcp.remoteSync.target` }, { target: targetLabel })}
      </p>
      {showExistingFilter ? (
        <div className={`shrink-0`}>
          <McpSyncShowExisting checked={showExistingRemoteMcp} onCheckedChange={onShowExistingRemoteMcpChange} />
        </div>
      ) : null}
    </div>
  );
}
/** 原 oDt（styles 125585-125615 / jsx 106535） */
function McpSyncSelectAll({
  selectedCount,
  totalSelectable,
  onSelectAll,
  onClearAll,
}: {
  selectedCount: number;
  totalSelectable: number;
  onSelectAll: () => void;
  onClearAll: () => void;
}) {
  const { intl } = useIntlContext();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const disabled = totalSelectable === 0;
  const checked = totalSelectable > 0 && selectedCount >= totalSelectable;
  const indeterminate = totalSelectable > 0 && selectedCount > 0 && selectedCount < totalSelectable;
  React.useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <label
      className={`inline-flex h-6 items-center gap-2 rounded-md px-1 text-ui-base text-foreground-subtle ${disabled ? `opacity-50` : `cursor-pointer hover:text-foreground`}`}
    >
      <input
        ref={inputRef}
        type="checkbox"
        className={`size-4`}
        checked={checked}
        disabled={disabled}
        aria-checked={indeterminate ? `mixed` : checked ? `true` : `false`}
        onChange={(e) => {
          if (e.currentTarget.checked) onSelectAll();
          else onClearAll();
        }}
      />
      <span>{intl.formatMessage({ id: `settings.mcp.remoteSync.selectAll` })}</span>
    </label>
  );
}

/** 原 sDt（styles 125616-125694 / jsx 106556）：MCP 选择行列表 */
function McpSyncRowList({
  rows,
  selectedIds,
  emptyMessageId = `settings.mcp.remoteSync.empty`,
  onToggle,
}: {
  rows: McpSyncRow[];
  selectedIds: Set<string>;
  emptyMessageId?: string;
  onToggle: (id: string, checked: boolean) => void;
}) {
  const { intl } = useIntlContext();
  return rows.length === 0 ? (
    <div className={`rounded-lg border border-border bg-surface px-3 py-3 text-ui-base text-foreground-subtle`}>
      {intl.formatMessage({ id: emptyMessageId })}
    </div>
  ) : (
    <div className={`grid gap-2`}>
      {rows.map((row) => {
        const checkboxId = `remote-mcp-sync-${row.candidate.id}`;
        const labelId = `${checkboxId}-label`;
        const kind = resolveMcpServerKind(row.candidate.config);
        const checked = !row.exists && selectedIds.has(row.candidate.id);
        return (
          <label
            key={row.candidate.id}
            htmlFor={checkboxId}
            className={`grid grid-cols-[auto_auto_minmax(0,1fr)] gap-3 rounded-lg border border-border bg-surface px-3 py-2 text-ui-base ${row.exists ? `cursor-default` : `cursor-pointer hover:border-border-hover hover:bg-surface-hover`}`}
          >
            <input
              id={checkboxId}
              type="checkbox"
              aria-labelledby={labelId}
              className={`mt-1 size-4`}
              checked={checked}
              disabled={row.exists}
              onChange={(event) => onToggle(row.candidate.id, event.currentTarget.checked)}
            />
            <span className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-border text-foreground-subtle`} aria-hidden="true">
              <IconCable className={`size-4`} />
            </span>
            <span className={`min-w-0`}>
              <span className={`flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1`}>
                <span id={labelId} className={`font-medium text-foreground`}>
                  {row.candidate.name}
                </span>
                <span className={`rounded-md bg-secondary px-1.5 py-0.5 text-ui-xs font-medium text-foreground-subtle`}>{kind}</span>
                <span className={`rounded-md bg-secondary px-1.5 py-0.5 text-ui-xs font-medium text-foreground-subtle`}>{row.candidate.source}</span>
                {row.exists ? (
                  <span className={`text-ui-base text-foreground-subtlest`}>
                    {intl.formatMessage({ id: `settings.mcp.remoteSync.existing` })}
                  </span>
                ) : null}
              </span>
              <span className={`mt-1 block break-all font-mono text-ui-base text-foreground-subtlest`}>{row.candidate.path}</span>
            </span>
          </label>
        );
      })}
    </div>
  );
}

/** 原 cDt（styles 125695-125744 / jsx 106577）：MCP 同步结果视图 */
function McpSyncResultView({
  result,
}: {
  result: { results?: Array<{ name: string; status: string; error?: string; path?: string }> } | null;
}) {
  const { intl } = useIntlContext();
  const results = result?.results ?? [];
  return results.length === 0 ? (
    <div className={`rounded-lg border border-border bg-surface px-3 py-3 text-ui-base text-foreground-subtle`}>
      {intl.formatMessage({ id: `settings.mcp.remoteSync.resultEmpty` })}
    </div>
  ) : (
    <div className={`overflow-hidden rounded-xl border border-border bg-card`}>
      <div className={`divide-y divide-border`}>
        {results.map((item) => (
          <div key={`${item.name}-${item.status}`} className={`grid grid-cols-[minmax(0,1fr)_auto] gap-3 px-4 py-3`}>
            <div className={`min-w-0`}>
              <div className={`truncate text-ui-base font-medium text-foreground`}>{item.name}</div>
              {item.error ? (
                <div className={`mt-0.5 break-words text-ui-base text-destructive`}>{item.error}</div>
              ) : item.path ? (
                <div className={`mt-0.5 truncate font-mono text-ui-xs text-foreground-subtlest`}>{item.path}</div>
              ) : null}
            </div>
            <span className={`shrink-0 rounded-md bg-surface px-1.5 py-0.5 text-ui-xs text-foreground-subtle ring-1 ring-border`}>
              {intl.formatMessage({ id: `settings.mcp.remoteSync.${item.status}` })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface McpSyncService {
  listLocalUserMcpCandidates(): Promise<{ candidates: McpCandidate[]; localHomeDir: string }>;
  exportMcpServers(args: { serverIds: string[] }): Promise<{ servers: unknown; localHomeDir?: string }>;
}
interface RemoteMcpSyncService {
  listRemoteUserMcpStatuses(args: { names: string[] }): Promise<{ statuses: Array<{ name: string; exists?: boolean }> }>;
  checkRemoteUserMcpWriteAccess(): Promise<{ ok: boolean; path?: string; error?: string }>;
  importMcpServers(payload: ReturnType<typeof buildMcpImportPayload>): Promise<{
    results: Array<{ name: string; status: string; error?: string; path?: string }>;
  }>;
}

/** 原 lDt（styles 125745-125950 / jsx 106590）：MCP 同步对话框 */
function McpSyncDialog(props: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  localMcpSyncService: McpSyncService;
  remoteMcpSyncService: RemoteMcpSyncService;
  remoteTarget: RemoteTarget;
  workspacePath: string;
  localWorkspacePath?: string;
  onSynced: () => Promise<void> | void;
}) {
  const { intl } = useIntlContext();
  const {
    localMcpSyncService,
    localWorkspacePath,
    onOpenChange,
    onSynced,
    open,
    remoteMcpSyncService,
    remoteTarget,
    workspacePath,
  } = props;
  const [phase, setPhase] = React.useState<SyncPhase>(`loading`);
  const [rows, setRows] = React.useState<McpSyncRow[]>([]);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [showExisting, setShowExisting] = React.useState(true);
  const [result, setResult] = React.useState<Awaited<ReturnType<RemoteMcpSyncService["importMcpServers"]>> | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [localHomeDir, setLocalHomeDir] = React.useState(``);
  const inFlightRef = React.useRef(false);
  React.useEffect(() => {
    if (!open) return;
    let disposed = false;
    setPhase(`loading`);
    setRows([]);
    setSelectedIds(new Set());
    setShowExisting(true);
    setResult(null);
    setErrorMessage(null);
    setLocalHomeDir(``);
    inFlightRef.current = false;
    (async () => {
      try {
        const local = await localMcpSyncService.listLocalUserMcpCandidates();
        const remote = await remoteMcpSyncService.listRemoteUserMcpStatuses({
          names: local.candidates.map((c) => c.name),
        });
        if (disposed) return;
        const merged = mergeMcpRows(local.candidates, remote.statuses);
        setLocalHomeDir(local.localHomeDir);
        setRows(merged);
        setSelectedIds(defaultMcpSelection(merged));
        setPhase(`selection`);
      } catch (error) {
        if (disposed) return;
        setErrorMessage(error instanceof Error ? error.message : String(error));
        setPhase(`selection`);
      }
    })();
    return () => {
      disposed = true;
    };
  }, [localMcpSyncService, open, remoteMcpSyncService]);
  const visibleRows = React.useMemo(() => filterMcpRows(rows, showExisting), [rows, showExisting]);
  const selectableIds = React.useMemo(() => visibleRows.filter((r) => !r.exists).map((r) => r.candidate.id), [visibleRows]);
  const selectedAvailable = React.useMemo(() => selectableIds.filter((id) => selectedIds.has(id)), [selectedIds, selectableIds]);
  const selectedCount = selectedAvailable.length;
  const targetLabel = remoteSyncTargetLabel(remoteTarget, workspacePath);
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && (phase === `preflighting` || phase === `syncing`)) return;
        onOpenChange(next);
      }}
    >
      <DialogContent className={`h-[min(720px,calc(100dvh-2rem))] max-h-[min(720px,calc(100dvh-2rem))] max-w-2xl flex flex-col overflow-hidden`}>
        <DialogHeader>
          <McpSyncTitle />
          <McpSyncHeader
            targetLabel={targetLabel}
            showExistingRemoteMcp={showExisting}
            showExistingFilter={phase === `selection` && rows.length > 0}
            onShowExistingRemoteMcpChange={setShowExisting}
          />
        </DialogHeader>
        <div className={`min-h-0 flex-1 overflow-y-auto`}>
          {errorMessage ? (
            <div className={`mb-3 rounded-lg border border-destructive/40 bg-surface px-3 py-2 text-ui-base text-destructive`}>
              {errorMessage}
            </div>
          ) : null}
          {phase === `loading` ? (
            <div className={`flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-3 text-ui-base text-foreground-subtle`}>
              <IconLoaderCircle className={`size-3.5 animate-spin`} aria-hidden="true" />
              {intl.formatMessage({ id: `settings.mcp.remoteSync.loading` })}
            </div>
          ) : null}
          {phase === `preflighting` ? (
            <div className={`flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-3 text-ui-base text-foreground-subtle`}>
              <IconLoaderCircle className={`size-3.5 animate-spin`} aria-hidden="true" />
              {intl.formatMessage({ id: `settings.remoteSync.preflighting` })}
            </div>
          ) : null}
          {phase === `selection` ? (
            <McpSyncRowList
              rows={visibleRows}
              selectedIds={selectedIds}
              emptyMessageId={rows.length > 0 ? `settings.mcp.remoteSync.filteredEmpty` : undefined}
              onToggle={(id, checked) => {
                setSelectedIds((prev) => {
                  const next = new Set(prev);
                  if (checked) next.add(id);
                  else next.delete(id);
                  return next;
                });
              }}
            />
          ) : null}
          {phase === `syncing` ? (
            <div className={`flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-3 text-ui-base text-foreground-subtle`}>
              <IconLoaderCircle className={`size-3.5 animate-spin`} aria-hidden="true" />
              {intl.formatMessage({ id: `settings.mcp.remoteSync.syncing` })}
            </div>
          ) : null}
          {phase === `complete` ? <McpSyncResultView result={result} /> : null}
        </div>
        <div className={`flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between`}>
          <div className={`text-ui-base text-foreground-subtle`}>
            {intl.formatMessage(
              { id: `settings.mcp.remoteSync.selectionCount` },
              { selected: String(selectedCount), total: String(selectableIds.length) },
            )}
          </div>
          <div className={`flex flex-wrap justify-end gap-2`}>
            {phase === `selection` ? (
              <McpSyncSelectAll
                selectedCount={selectedCount}
                totalSelectable={selectableIds.length}
                onSelectAll={() => setSelectedIds(new Set(selectableIds))}
                onClearAll={() => setSelectedIds(new Set())}
              />
            ) : null}
            <Button
              type="button"
              size="sm"
              disabled={phase !== `selection` || selectedCount === 0}
              onClick={async () => {
                if (!canSubmitRemoteSync({ inFlight: inFlightRef.current, selectedCount: selectedAvailable.length })) {
                  if (selectedAvailable.length === 0)
                    setErrorMessage(intl.formatMessage({ id: `settings.mcp.remoteSync.noSelection` }));
                  return;
                }
                inFlightRef.current = true;
                setErrorMessage(null);
                setPhase(`preflighting`);
                try {
                  const preflight = await withRemoteSyncPreflightTimeout(() =>
                    remoteMcpSyncService.checkRemoteUserMcpWriteAccess(),
                  );
                  if (!preflight.ok)
                    throw Error(
                      intl.formatMessage(
                        { id: `settings.remoteSync.preflightFailed` },
                        { path: preflight.path, error: preflight.error ?? `` },
                      ),
                    );
                  setPhase(`syncing`);
                  const exported = await localMcpSyncService.exportMcpServers({ serverIds: selectedAvailable });
                  const imported = await remoteMcpSyncService.importMcpServers(
                    buildMcpImportPayload({
                      exported,
                      localHomeDir,
                      localWorkspacePath,
                      remoteWorkspacePath: workspacePath,
                    }),
                  );
                  await onSynced();
                  setResult(imported);
                  setPhase(`complete`);
                } catch (error) {
                  setErrorMessage(
                    isRemoteSyncPreflightTimeoutError(error)
                      ? intl.formatMessage(
                          { id: `settings.remoteSync.preflightTimeout` },
                          { seconds: String(Math.ceil(error.timeoutMs / 1000)) },
                        )
                      : error instanceof Error
                        ? error.message
                        : String(error),
                  );
                  setPhase(`selection`);
                } finally {
                  inFlightRef.current = false;
                }
              }}
            >
              <IconCloudUpload className={`size-3.5`} aria-hidden="true" />
              {intl.formatMessage({ id: `settings.mcp.remoteSync.start` })}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ----------------------------------------------------------------------------
 * 2.3 插件同步对话框（原 XDt，styles 126843-127130 / jsx 107373；数据层 125951-126842）
 * --------------------------------------------------------------------------*/

/** 原 J2（styles 125951-125958 / jsx 106719） */
class RemotePluginSyncStoppedError extends Error {
  row: PluginSyncRow;
  constructor(row: PluginSyncRow) {
    super(`Stopped sync for ${row.candidate.pluginId}`);
    this.row = row;
    this.name = `RemotePluginSyncStoppedError`;
  }
}

/** 原 uDt（styles 125958 / jsx 106724） */
let pluginSyncLogIdCounter = 0;
/** 原 dDt（styles 125959-125963 / jsx 106725） */
function makePluginSyncLogId(row: PluginSyncRow): string {
  pluginSyncLogIdCounter += 1;
  const slug = row.candidate.pluginId.replace(/[^a-z0-9._-]+/giu, `-`);
  return `remote-plugin-sync-${pluginSyncLogIdCounter}-${slug}`;
}

interface InlinePluginCandidate {
  id: string;
  name: string;
  pluginId: string;
  description?: string;
  version?: string;
  path: string;
  enabled: boolean;
  componentTypes: string[];
  directoryName: string;
}
interface PluginCandidate {
  id: string;
  kind: "inline" | "marketplace";
  name: string;
  pluginId: string;
  marketplace: string;
  description?: string;
  version?: string;
  path?: string;
  enabled: boolean;
  componentTypes: string[];
  inlineCandidate?: InlinePluginCandidate;
  pluginOptions?: PluginOptionsPayload;
  marketplacePlugin?: MarketplacePluginMeta;
}
interface PluginOptionsPayload {
  configuredOptions: Record<string, OptionSchema>;
  userConfig: Record<string, unknown>;
}
interface OptionSchema {
  type?: string;
  sensitive?: boolean;
  source?: string;
  ref?: string;
  url?: string;
  repo?: string;
}
interface MarketplacePluginMeta {
  marketplaceSourceInput?: string;
  marketplaceSourceArchive?: { marketplaceId: string; source: unknown };
  pluginName: string;
  scope?: string;
}
interface PluginSyncRow {
  candidate: PluginCandidate;
  exists: boolean;
  path?: string;
  reason?: string;
  remoteMarketplaceExists?: boolean;
}
interface PluginSyncResultItem {
  name: string;
  pluginId: string;
  directoryName: string;
  status: string;
  error?: string;
  path?: string;
}

/** 原 fDt（styles 125964-125978 / jsx 106730）：本地用户插件 → inline 候选 */
function toInlinePluginCandidate(e: InlinePluginCandidate): PluginCandidate {
  return {
    id: `inline:${e.id}`,
    kind: `inline`,
    name: e.name,
    pluginId: e.pluginId,
    marketplace: `inline`,
    ...(e.description ? { description: e.description } : {}),
    ...(e.version ? { version: e.version } : {}),
    path: e.path,
    enabled: e.enabled,
    componentTypes: e.componentTypes,
    inlineCandidate: e,
  };
}
/** 原 pDt（styles 125979 / jsx 106748） */
function pluginStatusKey(pluginId: string, directoryName: string): string {
  return `${pluginId.toLowerCase()}\u0000${directoryName}`;
}
/** 原 mDt（styles 125982-125996 / jsx 106752） */
function mergeInlinePluginRows(
  candidates: InlinePluginCandidate[],
  statuses: Array<{ pluginId: string; directoryName: string; exists?: boolean; path?: string; reason?: string }>,
): PluginSyncRow[] {
  const byKey = new Map(
    statuses.map((s): [string, (typeof statuses)[number]] => [pluginStatusKey(s.pluginId, s.directoryName), s]),
  );
  return mergePluginRows(
    candidates.map(toInlinePluginCandidate),
    candidates.map((c) => {
      const hit = byKey.get(pluginStatusKey(c.pluginId, c.directoryName));
      return {
        candidateId: `inline:${c.id}`,
        exists: hit?.exists ?? false,
        ...(hit?.path ? { path: hit.path } : {}),
        ...(hit?.reason ? { reason: hit.reason } : {}),
      };
    }),
  );
}
/** 原 hDt（styles 125997-126011 / jsx 106768） */
function mergePluginRows(
  candidates: PluginCandidate[],
  statuses: Array<{
    candidateId: string;
    exists?: boolean;
    path?: string;
    reason?: string;
    remoteMarketplaceExists?: boolean;
  }>,
): PluginSyncRow[] {
  const byId = new Map(statuses.map((s): [string, (typeof statuses)[number]] => [s.candidateId, s]));
  return candidates.map((candidate) => {
    const hit = byId.get(candidate.id);
    return {
      candidate,
      exists: hit?.exists ?? false,
      ...(hit?.path ? { path: hit.path } : {}),
      ...(hit?.reason ? { reason: hit.reason } : {}),
      ...(hit?.remoteMarketplaceExists === undefined ? {} : { remoteMarketplaceExists: hit.remoteMarketplaceExists }),
    };
  });
}
/** 原 gDt（styles 126012 / jsx 106787） */
function defaultPluginSelection(rows: PluginSyncRow[]): Set<string> {
  return new Set(rows.filter((r) => !r.exists).map((r) => r.candidate.id));
}
/** 原 _Dt（styles 126015 / jsx 106790） */
function filterPluginRows(rows: PluginSyncRow[], showExisting: boolean): PluginSyncRow[] {
  return showExisting ? [...rows] : rows.filter((r) => !r.exists);
}
/** 原 vDt（styles 126018 / jsx 106793）：preflighting/syncing 期间禁止关闭 */
function canClosePluginSyncDialog(phase: SyncPhase, nextOpen: boolean): boolean {
  return nextOpen || (phase !== `preflighting` && phase !== `syncing`);
}
/** 原 xDt（styles 126061 / jsx 106850） */
function remoteComponentKinds(remote?: { components?: Array<{ kind: string }> }): string[] {
  return remote?.components?.map((c) => c.kind) ?? [];
}
/** 原 SDt（styles 126064-126068 / jsx 106853） */
function extractPluginOptions(remote?: {
  configuredOptions?: Record<string, OptionSchema>;
  userConfig?: Record<string, unknown>;
}): PluginOptionsPayload | undefined {
  const configured = remote?.configuredOptions ?? {};
  if (Object.keys(configured).length !== 0)
    return { configuredOptions: { ...configured }, userConfig: { ...(remote?.userConfig ?? {}) } };
  return undefined;
}
/** 原 CDt（styles 126069 / jsx 106864） */
function attachPluginOptions(
  candidate: PluginCandidate,
  remote?: { pluginId?: string; configuredOptions?: Record<string, OptionSchema>; userConfig?: Record<string, unknown> },
): PluginCandidate {
  const options = extractPluginOptions(remote);
  return options ? { ...candidate, pluginOptions: options } : candidate;
}
/** 原 wDt（styles 126073 / jsx 106871） */
function hydratePluginOptions(
  candidates: PluginCandidate[],
  remotes: Array<{
    id: string;
    pluginId?: string;
    configuredOptions?: Record<string, OptionSchema>;
    userConfig?: Record<string, unknown>;
  }>,
): PluginCandidate[] {
  // 原 wDt：Map 键为远端 plugin 的 id，再按 candidate.pluginId 取
  const byId = new Map(remotes.map((r): [string, (typeof remotes)[number]] => [r.id, r]));
  return candidates.map((c) => attachPluginOptions(c, byId.get(c.pluginId)));
}
/** 原 yDt（styles 126021-126046 / jsx 106796）：已装市场插件 → marketplace 候选 */
function buildMarketplaceCandidates(
  overview: {
    marketplaces: Array<MarketplaceSource & { id: string }>;
    installedPlugins: Array<{
      id: string;
      name: string;
      marketplace: string;
      description?: string;
      version?: string;
      installPath?: string;
      enabled: boolean;
      componentTypes?: string[];
      scope?: string;
    }>;
  },
  plugins: Array<{
    id: string;
    pluginId?: string;
    description?: string;
    version?: string;
    rootPath?: string;
    configuredOptions?: Record<string, OptionSchema>;
    userConfig?: Record<string, unknown>;
    components?: Array<{ kind: string }>;
  }>,
): PluginCandidate[] {
  const remoteById = new Map(plugins.map((p): [string, (typeof plugins)[number]] => [p.id, p]));
  const marketplaceById = new Map(
    overview.marketplaces.map((m): [string, ReturnType<typeof marketplaceSourcePayload>] => [m.id, marketplaceSourcePayload(m)]),
  );
  return overview.installedPlugins.map((installed) => {
    const remote = remoteById.get(installed.id);
    const componentTypes = installed.componentTypes ?? remoteComponentKinds(remote);
    const marketplaceMeta = marketplaceById.get(installed.marketplace);
    const options = extractPluginOptions(remote);
    return {
      id: `marketplace:${installed.id}`,
      kind: `marketplace` as const,
      name: installed.name,
      pluginId: installed.id,
      marketplace: installed.marketplace,
      ...((installed.description ?? remote?.description)
        ? { description: installed.description ?? remote?.description }
        : {}),
      ...((installed.version ?? remote?.version) ? { version: installed.version ?? remote?.version } : {}),
      ...((installed.installPath ?? remote?.rootPath) ? { path: installed.installPath ?? remote?.rootPath } : {}),
      enabled: installed.enabled,
      componentTypes,
      ...(options ? { pluginOptions: options } : {}),
      marketplacePlugin: { ...marketplaceMeta, pluginName: installed.name, scope: installed.scope },
    };
  });
}
/** 原 bDt（styles 126047-126060 / jsx 106832） */
function mapMarketplaceStatuses(
  candidates: PluginCandidate[],
  remote: {
    installedPlugins: Array<{ id: string; installPath?: string }>;
    marketplaces: Array<{ id: string }>;
  },
): Array<{ candidateId: string; exists: boolean; path?: string; reason?: string; remoteMarketplaceExists: boolean }> {
  const installedById = new Map(
    remote.installedPlugins.map((p): [string, (typeof remote.installedPlugins)[number]] => [p.id, p]),
  );
  const marketplaceIds = new Set(remote.marketplaces.map((m) => m.id));
  return candidates.map((candidate) => {
    const hit = installedById.get(candidate.pluginId);
    return {
      candidateId: candidate.id,
      exists: !!hit,
      ...(hit?.installPath ? { path: hit.installPath } : {}),
      ...(hit ? { reason: `samePluginId` } : {}),
      remoteMarketplaceExists: marketplaceIds.has(candidate.marketplace),
    };
  });
}
/** 原 TDt（styles 126077-126086 / jsx 106875）：可移植/手动 选项计数 */
function summarizePluginOptions(options: PluginOptionsPayload | undefined): {
  manualCount: number;
  syncableCount: number;
} | null {
  if (!options || Object.keys(options.configuredOptions).length === 0) return null;
  let syncable = 0;
  let manual = 0;
  for (const [key, configuredValue] of Object.entries(options.configuredOptions)) {
    const schema = options.userConfig[key];
    // 原 TDt：MDt(i, a, a)——值=configuredOptions 项，schema=userConfig 项
    if (isPortableOptionValue(configuredValue, schema as OptionSchema | undefined, schema as OptionSchema | undefined))
      syncable += 1;
    else manual += 1;
  }
  return { manualCount: manual, syncableCount: syncable };
}
/** 原 EDt（styles 126087-126094 / jsx 106888） */
function marketplaceSourceInput(marketplace: MarketplaceSource): string | undefined {
  const source = marketplace.source;
  const sourceKind = typeof source.source == `string` ? source.source : ``;
  const ref = typeof source.ref == `string` && source.ref.trim() ? `#${source.ref.trim()}` : ``;
  if (sourceKind === `github` && typeof source.repo == `string` && source.repo.trim())
    return `${(source.repo as string).trim()}${ref}`;
  if (sourceKind === `git` && typeof source.url == `string` && source.url.trim())
    return `${(source.url as string).trim()}${ref}`;
  if (sourceKind === `url` && typeof source.url == `string` && source.url.trim())
    return (source.url as string).trim();
  return undefined;
}
interface MarketplaceSource {
  id?: string;
  source: { source?: string; ref?: string; repo?: string; url?: string; [key: string]: unknown };
}
/** 原 DDt（styles 126095-126102 / jsx 106896） */
function marketplaceSourcePayload(
  marketplace: MarketplaceSource,
): { marketplaceSourceInput?: string; marketplaceSourceArchive?: { marketplaceId: string; source: unknown } } {
  const input = marketplaceSourceInput(marketplace);
  if (input) return { marketplaceSourceInput: input };
  const kind = typeof marketplace.source.source == `string` ? marketplace.source.source : ``;
  return [`file`, `directory`, `settings`].includes(kind)
    ? { marketplaceSourceArchive: { marketplaceId: marketplace.id as string, source: marketplace.source } }
    : {};
}

interface PluginSyncServices {
  localPluginSyncService: LocalPluginSyncService;
  remotePluginSyncService: RemotePluginSyncService;
  localZCodeAgentService?: ZCodeAgentService | null;
  remoteZCodeAgentService?: ZCodeAgentService | null;
  localWorkspacePath?: string;
  remoteWorkspacePath: string;
  remoteWorkspaceIdentity?: string | null;
}
interface LocalPluginSyncService {
  listLocalUserPluginCandidates(): Promise<{ candidates: InlinePluginCandidate[] }>;
  exportPluginsArchive(args: { pluginIds: string[] }): Promise<{ archive: unknown }>;
  exportMarketplaceSourceArchive(args: {
    marketplaceId: string;
    pluginNames: string[];
    source: unknown;
  }): Promise<{ archive: unknown }>;
}
interface RemotePluginSyncService {
  listRemoteUserPluginStatuses(args: {
    plugins: Array<{ pluginId: string; directoryName: string }>;
  }): Promise<{ statuses: Array<{ pluginId: string; directoryName: string; exists?: boolean; path?: string; reason?: string }> }>;
  checkRemoteUserPluginWriteAccess(): Promise<{ ok: boolean; path?: string; error?: string }>;
  importPluginsArchive(args: { archive: unknown; overwrite: boolean }): Promise<{
    results: PluginSyncResultItem[];
  }>;
  importMarketplaceSourceArchive(args: { archive: unknown; overwrite: boolean }): Promise<{ path: string }>;
}
type ZCodeAgentScopeArgs = { workspacePath: string; workspaceIdentity?: string } & Record<string, unknown>;
interface ZCodeAgentService {
  getPluginsOverview(args: ZCodeAgentScopeArgs): Promise<{
    marketplaces: Array<MarketplaceSource & { id: string }>;
    installedPlugins: Array<Parameters<typeof buildMarketplaceCandidates>[0]["installedPlugins"][number]>;
  }>;
  listPlugins(args: ZCodeAgentScopeArgs): Promise<{
    plugins: Array<Parameters<typeof buildMarketplaceCandidates>[1][number]>;
  }>;
  installPlugin(args: Record<string, unknown>): Promise<{
    diagnostics: Array<{ severity: string; pluginId?: string; message: string }>;
    installedPlugins: Array<{ id: string; installPath?: string }>;
  }>;
  setPluginEnabled(args: Record<string, unknown>): Promise<unknown>;
  configurePlugin(args: Record<string, unknown>): Promise<unknown>;
  addPluginMarketplace(args: Record<string, unknown>): Promise<unknown>;
  cancelPluginOperation?(args: { operationId: string }): Promise<void>;
}

/** 原 ODt（styles 126103-126127 / jsx 106909）：inline + marketplace 候选与状态合并加载 */
async function loadPluginSyncCandidates(e: PluginSyncServices): Promise<{
  candidates: PluginCandidate[];
  statuses: Array<{ candidateId: string; exists: boolean; path?: string; reason?: string; remoteMarketplaceExists?: boolean }>;
}> {
  const local = await e.localPluginSyncService.listLocalUserPluginCandidates();
  const inlineCandidates = local.candidates.map(toInlinePluginCandidate);
  const inlineStatuses = await e.remotePluginSyncService.listRemoteUserPluginStatuses({
    plugins: local.candidates.map((c) => ({ pluginId: c.pluginId, directoryName: c.directoryName })),
  });
  const inlineRows = mergeInlinePluginRows(local.candidates, inlineStatuses.statuses).map((row) => ({
    candidateId: row.candidate.id,
    exists: row.exists,
    ...(row.path ? { path: row.path } : {}),
    ...(row.reason ? { reason: row.reason } : {}),
  }));
  if (!e.localZCodeAgentService || !e.remoteZCodeAgentService)
    return { candidates: inlineCandidates, statuses: inlineRows };
  const [overview, pluginList, remoteOverview] = await Promise.all([
    e.localZCodeAgentService.getPluginsOverview({ workspacePath: e.localWorkspacePath as string }),
    e.localZCodeAgentService.listPlugins({ workspacePath: e.localWorkspacePath as string }),
    e.remoteZCodeAgentService.getPluginsOverview({
      workspacePath: e.remoteWorkspacePath,
      ...(e.remoteWorkspaceIdentity ? { workspaceIdentity: e.remoteWorkspaceIdentity } : {}),
    }),
  ]);
  const marketplaceCandidates = buildMarketplaceCandidates(overview, pluginList.plugins);
  return {
    candidates: [...hydratePluginOptions(inlineCandidates, pluginList.plugins), ...marketplaceCandidates],
    statuses: [...inlineRows, ...mapMarketplaceStatuses(marketplaceCandidates, remoteOverview)],
  };
}
/** 原 kDt（styles 126128 / jsx 106948） */
function isPluginSyncStoppedError(e: unknown): e is RemotePluginSyncStoppedError {
  return e instanceof RemotePluginSyncStoppedError;
}
/** 原 ADt（styles 126131-126142 / jsx 106951） */
function stoppedPluginResult(row: PluginSyncRow): PluginSyncResultItem {
  return {
    name: row.candidate.name,
    pluginId: row.candidate.pluginId,
    directoryName:
      row.candidate.kind === `inline`
        ? (row.candidate.inlineCandidate?.directoryName ?? row.candidate.name)
        : `${row.candidate.marketplace}/${row.candidate.name}`,
    status: `stopped`,
    error: `stop requested; stopped waiting for this plugin sync. Any remote RPC that already started may still finish on the remote target.`,
  };
}

interface PluginSyncProgressEvent {
  candidateId: string;
  pluginId: string;
  status: string;
  log: string;
  result?: PluginSyncResultItem;
}
interface PluginSyncProgressContext extends PluginSyncServices {
  onItemProgress?: (event: PluginSyncProgressEvent) => void;
  stopControl?: {
    isStopped(candidateId: string): boolean;
    waitForStop?(candidateId: string): Promise<void>;
    cancelOperation?(operationId: string): Promise<void>;
  };
  preparedMarketplaceSources?: Set<string>;
  selectedMarketplacePluginNames?: Map<string, string[]>;
}
interface PluginSyncContext extends PluginSyncProgressContext {
  rows: PluginSyncRow[];
}
/** 原 Y2（styles 126143-126151 / jsx 106960） */
function emitPluginSyncProgress(
  ctx: PluginSyncProgressContext,
  row: PluginSyncRow,
  status: string,
  log: string,
  result?: PluginSyncResultItem,
): void {
  ctx.onItemProgress?.({
    candidateId: row.candidate.id,
    log,
    pluginId: row.candidate.pluginId,
    ...(result ? { result } : {}),
    status,
  });
}
/** 原 X2（styles 126152-126154 / jsx 106971） */
function assertPluginSyncNotStopped(ctx: PluginSyncProgressContext, row: PluginSyncRow): void {
  if (ctx.stopControl?.isStopped(row.candidate.id)) throw new RemotePluginSyncStoppedError(row);
}
/** 原 Z2（styles 126155-126183 / jsx 106974）：可停止的远端步骤竞速 */
async function runCancellableRemoteStep<T>(
  ctx: PluginSyncProgressContext,
  row: PluginSyncRow,
  label: string,
  run: (operationId: string) => Promise<T>,
  options: { cancellableRemoteOperation?: boolean } = {},
): Promise<T> {
  assertPluginSyncNotStopped(ctx, row);
  const operationId = makePluginSyncLogId(row);
  emitPluginSyncProgress(ctx, row, `syncing`, `${label} (${operationId})`);
  const operation = run(operationId);
  const stopSignal = ctx.stopControl?.waitForStop?.(row.candidate.id);
  return stopSignal
    ? await Promise.race([
        operation,
        stopSignal.then(async () => {
          if (options.cancellableRemoteOperation === true && ctx.stopControl?.cancelOperation) {
            emitPluginSyncProgress(ctx, row, `stopped`, `request cancel plugin sync operation ${operationId}`);
            try {
              await ctx.stopControl.cancelOperation(operationId);
              emitPluginSyncProgress(ctx, row, `stopped`, `cancel request sent for ${operationId}`);
            } catch (error) {
              emitPluginSyncProgress(
                ctx,
                row,
                `stopped`,
                `cancel request failed for ${operationId}: ${error instanceof Error ? error.message : String(error)}`,
              );
            }
          }
          throw new RemotePluginSyncStoppedError(row);
        }),
      ])
    : await operation;
}
/** 原 jDt（styles 126184 / jsx 106992） */
function isFileLikeOptionSchema(schema: OptionSchema | undefined): boolean {
  return schema?.type === `file` || schema?.type === `directory`;
}
/**
 * 原 MDt（styles 126187-126197 / jsx 106995）。
 * 原调用约定：MDt(value, localSchema, remoteSchema)——第 1 参为待校验值，
 * 第 2/3 参为本地/远端 option schema（含 type/sensitive）。
 */
function isPortableOptionValue(
  value: unknown,
  localSchema: OptionSchema | undefined,
  remoteSchema: OptionSchema | undefined,
): boolean {
  if (
    !localSchema ||
    !remoteSchema ||
    localSchema.sensitive === true ||
    remoteSchema.sensitive === true ||
    isFileLikeOptionSchema(localSchema) ||
    isFileLikeOptionSchema(remoteSchema)
  )
    return false;
  const kind = remoteSchema.type ?? localSchema.type;
  return kind === `boolean`
    ? typeof value == `boolean`
    : kind === `number`
      ? typeof value == `number`
      : kind === `string`
        ? typeof value == `string`
        : typeof value == `string` || typeof value == `number` || typeof value == `boolean`;
}
/** 原 NDt（styles 126198-126204 / jsx 107000） */
function pickPortableOptions(
  options: PluginOptionsPayload,
  remote: { userConfig?: Record<string, unknown> },
): { options: Record<string, unknown>; skippedCount: number } {
  const picked: Record<string, unknown> = {};
  let skipped = 0;
  // 原 NDt：MDt(a, e.userConfig[i], t.userConfig?.[i])——值=configuredOptions 项
  for (const [key, configuredValue] of Object.entries(options.configuredOptions))
    if (
      isPortableOptionValue(
        configuredValue,
        options.userConfig[key] as OptionSchema | undefined,
        remote.userConfig?.[key] as OptionSchema | undefined,
      )
    )
      picked[key] = configuredValue;
    else skipped += 1;
  return { options: picked, skippedCount: skipped };
}
/** 原 PDt（styles 126205-126208 / jsx 107009） */
function sameConfiguredOptions(previous: Record<string, unknown>, next: Record<string, unknown>): boolean {
  const entries = Object.entries(previous);
  return entries.length === Object.keys(next).length ? entries.every(([key, value]) => next[key] === value) : false;
}
/** 原 FDt（styles 126209-126249 / jsx 107013）：可移植插件选项同步 */
async function syncPluginOptions(ctx: PluginSyncProgressContext, row: PluginSyncRow): Promise<void> {
  const options = row.candidate.pluginOptions;
  if (!options || Object.keys(options.configuredOptions).length === 0) return;
  const remote = ctx.remoteZCodeAgentService;
  if (!remote) {
    emitPluginSyncProgress(ctx, row, `syncing`, `skip plugin options: remote plugin service is not available`);
    return;
  }
  const scope = {
    workspacePath: ctx.remoteWorkspacePath,
    ...(ctx.remoteWorkspaceIdentity ? { workspaceIdentity: ctx.remoteWorkspaceIdentity } : {}),
  };
  const remotePlugin = (
    await runCancellableRemoteStep(ctx, row, `RPC plugins/list for options ${row.candidate.pluginId}`, (operationId) =>
      remote.listPlugins({ ...scope, operationId }),
    )
  ).plugins.find((p) => p.id === row.candidate.pluginId);
  if (!remotePlugin) {
    emitPluginSyncProgress(
      ctx,
      row,
      `syncing`,
      `skip plugin options: remote plugin schema not found for ${row.candidate.pluginId}`,
    );
    return;
  }
  const portable = pickPortableOptions(options, remotePlugin);
  if (portable.skippedCount > 0)
    emitPluginSyncProgress(ctx, row, `syncing`, `skipped ${portable.skippedCount} non-portable plugin option(s)`);
  const portableCount = Object.keys(portable.options).length;
  if (portableCount === 0) {
    emitPluginSyncProgress(ctx, row, `syncing`, `skip plugin options: no portable configured option values`);
    return;
  }
  const merged = { ...(remotePlugin.configuredOptions ?? {}), ...portable.options };
  if (sameConfiguredOptions(remotePlugin.configuredOptions ?? {}, merged)) {
    emitPluginSyncProgress(ctx, row, `syncing`, `plugin options already synced (${portableCount} portable option(s))`);
    return;
  }
  await runCancellableRemoteStep(
    ctx,
    row,
    `RPC plugins/configure ${portableCount} portable option(s) for ${row.candidate.pluginId}`,
    () => remote.configurePlugin({ ...scope, options: merged, pluginId: row.candidate.pluginId }),
  );
}
/** 原 IDt（styles 126250-126291 / jsx 107053）：先 inline 后 marketplace 的同步管线 */
async function runPluginSyncPipeline(ctx: PluginSyncContext): Promise<{ results: PluginSyncResultItem[] }> {
  const results: PluginSyncResultItem[] = [];
  for (const row of ctx.rows) emitPluginSyncProgress(ctx, row, `queued`, `Queued plugin sync`);
  for (const row of ctx.rows)
    if (row.candidate.kind === `inline`)
      try {
        assertPluginSyncNotStopped(ctx, row);
        const inline = row.candidate.inlineCandidate;
        if (!inline) throw Error(`inline plugin metadata is not available`);
        const exported = await runCancellableRemoteStep(ctx, row, `export inline plugin ${row.candidate.pluginId}`, () =>
          ctx.localPluginSyncService.exportPluginsArchive({ pluginIds: [inline.id] }),
        );
        const imported = (
          await runCancellableRemoteStep(ctx, row, `import inline plugin ${row.candidate.pluginId} on remote`, () =>
            ctx.remotePluginSyncService.importPluginsArchive({ archive: exported.archive, overwrite: false }),
          )
        ).results[0];
        if (!imported) throw Error(`remote import did not return ${row.candidate.pluginId}`);
        if (imported.status === `synced`) await syncPluginOptions(ctx, row);
        results.push(imported);
        emitPluginSyncProgress(ctx, row, imported.status, `inline plugin ${imported.status}`, imported);
      } catch (error) {
        const item = isPluginSyncStoppedError(error)
          ? stoppedPluginResult(row)
          : {
              name: row.candidate.name,
              pluginId: row.candidate.pluginId,
              directoryName: row.candidate.inlineCandidate?.directoryName ?? row.candidate.name,
              status: `failed`,
              error: error instanceof Error ? error.message : String(error),
            };
        results.push(item);
        emitPluginSyncProgress(ctx, row, item.status, item.error ?? item.status, item);
      }
  const marketplaceNames = collectMarketplacePluginNames(ctx.rows);
  const prepared = new Set<string>();
  for (const row of ctx.rows)
    if (row.candidate.kind === `marketplace`)
      results.push(
        await runMarketplacePluginSync(
          { ...ctx, preparedMarketplaceSources: prepared, selectedMarketplacePluginNames: marketplaceNames },
          row,
        ),
      );
  return { results };
}
/** 原 RDt（styles 126362-126371 / jsx 107150） */
function collectMarketplacePluginNames(rows: PluginSyncRow[]): Map<string, string[]> {
  const names = new Map<string, string[]>();
  for (const row of rows) {
    const meta = row.candidate.marketplacePlugin;
    if (row.candidate.kind !== `marketplace` || !meta) continue;
    const list = names.get(row.candidate.marketplace) ?? [];
    list.push(meta.pluginName);
    names.set(row.candidate.marketplace, list);
  }
  return names;
}
/** 原 zDt（styles 126372-126409 / jsx 107160）：远端市场源准备（input 直加 / 归档镜像） */
async function prepareMarketplaceSource(
  ctx: PluginSyncProgressContext,
  row: PluginSyncRow,
  scope: Record<string, unknown>,
): Promise<void> {
  const candidate = row.candidate;
  const meta = candidate.marketplacePlugin;
  if (!meta) throw Error(`marketplace plugin metadata is not available`);
  const sourceInput = meta.marketplaceSourceInput;
  if (sourceInput) {
    await runCancellableRemoteStep(
      ctx,
      row,
      `RPC plugins/marketplace/add ${candidate.marketplace} from ${sourceInput}`,
      (operationId) =>
        (ctx.remoteZCodeAgentService as ZCodeAgentService).addPluginMarketplace({ ...scope, operationId, source: sourceInput }),
      { cancellableRemoteOperation: true },
    );
    return;
  }
  const archive = meta.marketplaceSourceArchive;
  if (!archive) throw Error(`marketplace source cannot be synchronized: ${candidate.marketplace}`);
  const exported = await runCancellableRemoteStep(ctx, row, `export marketplace source ${candidate.marketplace}`, () =>
    ctx.localPluginSyncService.exportMarketplaceSourceArchive({
      marketplaceId: archive.marketplaceId,
      pluginNames: ctx.selectedMarketplacePluginNames?.get(candidate.marketplace) ?? [meta.pluginName],
      source: archive.source,
    }),
  );
  const imported = await runCancellableRemoteStep(
    ctx,
    row,
    `import marketplace source ${candidate.marketplace} on remote`,
    () => ctx.remotePluginSyncService.importMarketplaceSourceArchive({ archive: exported.archive, overwrite: false }),
  );
  await runCancellableRemoteStep(
    ctx,
    row,
    `RPC plugins/marketplace/add mirrored ${candidate.marketplace} from ${imported.path}`,
    (operationId) =>
      (ctx.remoteZCodeAgentService as ZCodeAgentService).addPluginMarketplace({ ...scope, operationId, source: imported.path }),
    { cancellableRemoteOperation: true },
  );
}
/** 原 BDt（styles 126410-126413 / jsx 107194） */
function formatInstallDiagnostics(
  diagnostics: Array<{ severity: string; pluginId?: string; message: string }>,
  pluginId: string,
): string | null {
  const blocking = diagnostics.filter((d) => d.severity !== `warning`);
  return blocking.length === 0 ? null : blocking.map((d) => `${d.pluginId ?? pluginId}: ${d.message}`).join(`; `);
}
/** 原 LDt（styles 126292-126361 / jsx 107090）：marketplace 插件安装流 */
async function runMarketplacePluginSync(
  ctx: PluginSyncContext,
  row: PluginSyncRow,
): Promise<PluginSyncResultItem> {
  const candidate = row.candidate;
  const meta = candidate.marketplacePlugin;
  const directoryLabel = `${candidate.marketplace}/${candidate.name}`;
  try {
    assertPluginSyncNotStopped(ctx, row);
    if (!ctx.remoteZCodeAgentService || !meta) throw Error(`remote plugin install service is not available`);
    const remote = ctx.remoteZCodeAgentService;
    const scope = {
      workspacePath: ctx.remoteWorkspacePath,
      ...(ctx.remoteWorkspaceIdentity ? { workspaceIdentity: ctx.remoteWorkspaceIdentity } : {}),
    };
    if (!row.remoteMarketplaceExists && !ctx.preparedMarketplaceSources?.has(candidate.marketplace)) {
      await prepareMarketplaceSource(
        {
          localPluginSyncService: ctx.localPluginSyncService,
          onItemProgress: ctx.onItemProgress,
          remotePluginSyncService: ctx.remotePluginSyncService,
          remoteZCodeAgentService: remote,
          selectedMarketplacePluginNames: ctx.selectedMarketplacePluginNames,
          stopControl: ctx.stopControl,
          remoteWorkspacePath: ctx.remoteWorkspacePath,
        },
        row,
        scope,
      );
      ctx.preparedMarketplaceSources?.add(candidate.marketplace);
    }
    const installed = await runCancellableRemoteStep(
      ctx,
      row,
      `RPC plugins/install ${candidate.pluginId}`,
      (operationId) =>
        remote.installPlugin({
          ...scope,
          marketplace: candidate.marketplace,
          operationId,
          pluginName: meta.pluginName,
          scope: meta.scope,
        }),
      { cancellableRemoteOperation: true },
    );
    const diagnosticError = formatInstallDiagnostics(installed.diagnostics, candidate.pluginId);
    if (diagnosticError) throw Error(diagnosticError);
    const installedEntry = installed.installedPlugins.find((p) => p.id === candidate.pluginId);
    if (!installedEntry) throw Error(`remote install did not return ${candidate.pluginId}`);
    await runCancellableRemoteStep(
      ctx,
      row,
      `RPC plugins/setEnabled enabled=${String(candidate.enabled)} for ${candidate.pluginId}`,
      () => remote.setPluginEnabled({ ...scope, enabled: candidate.enabled, pluginId: candidate.pluginId }),
    );
    await syncPluginOptions(ctx, row);
    const item: PluginSyncResultItem = {
      name: candidate.name,
      pluginId: candidate.pluginId,
      directoryName: directoryLabel,
      status: `synced`,
      ...(installedEntry.installPath ? { path: installedEntry.installPath } : {}),
    };
    emitPluginSyncProgress(ctx, row, `synced`, `marketplace plugin synced`, item);
    return item;
  } catch (error) {
    const item = isPluginSyncStoppedError(error)
      ? stoppedPluginResult(row)
      : {
          name: candidate.name,
          pluginId: candidate.pluginId,
          directoryName: directoryLabel,
          status: `failed`,
          error: error instanceof Error ? error.message : String(error),
        };
    emitPluginSyncProgress(ctx, row, item.status, item.error ?? item.status, item);
    return item;
  }
}

/** 原 VDt（styles 126414-126442 / jsx 107198）：插件同步标题 + 警告 tooltip */
function PluginSyncTitle() {
  const { intl } = useIntlContext();
  const [warningOpen, setWarningOpen] = React.useState(false);
  const warningTitle = intl.formatMessage({ id: `settings.plugins.remoteSync.warningTitle` });
  return (
    <DialogTitle className={`flex min-w-0 items-center gap-2 pr-8`}>
      <span className={`min-w-0 truncate`}>{intl.formatMessage({ id: `settings.plugins.remoteSync.title` })}</span>
      <Tooltip
        open={warningOpen}
        title={warningTitle}
        description={intl.formatMessage({ id: `settings.plugins.remoteSync.warningDescription` })}
        side="right"
        align="center"
      >
        <span
          aria-label={warningTitle}
          className={`inline-flex size-5 items-center justify-center rounded-full text-warning transition-colors hover:bg-hover hover:text-warning focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused`}
          onMouseEnter={() => setWarningOpen(true)}
          onMouseLeave={() => setWarningOpen(false)}
          role="img"
        >
          <IconCircleAlert className={`size-3.5`} aria-hidden="true" />
        </span>
      </Tooltip>
    </DialogTitle>
  );
}
/** 原 HDt（styles 126443-126459 / jsx 107212） */
function PluginSyncShowExisting({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (v: boolean) => void }) {
  const { intl } = useIntlContext();
  return (
    <label className={`inline-flex h-6 cursor-pointer items-center gap-2 rounded-md px-1 text-ui-base text-foreground-subtle hover:text-foreground`}>
      <input type="checkbox" className={`size-4`} checked={checked} onChange={(e) => onCheckedChange(e.currentTarget.checked)} />
      <span>{intl.formatMessage({ id: `settings.plugins.remoteSync.showExisting` })}</span>
    </label>
  );
}
/** 原 UDt（styles 126460-126482 / jsx 107223） */
function PluginSyncHeader({
  targetLabel,
  showExistingRemotePlugins,
  showExistingFilter,
  onShowExistingRemotePluginsChange,
}: {
  targetLabel: string;
  showExistingRemotePlugins: boolean;
  showExistingFilter: boolean;
  onShowExistingRemotePluginsChange: (v: boolean) => void;
}) {
  const { intl } = useIntlContext();
  return (
    <div className={`flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between`}>
      <p className={`min-w-0 break-words font-mono text-ui-base text-foreground-subtle`}>
        {intl.formatMessage({ id: `settings.plugins.remoteSync.target` }, { target: targetLabel })}
      </p>
      {showExistingFilter ? (
        <div className={`shrink-0`}>
          <PluginSyncShowExisting checked={showExistingRemotePlugins} onCheckedChange={onShowExistingRemotePluginsChange} />
        </div>
      ) : null}
    </div>
  );
}
/** 原 WDt（styles 126483-126513 / jsx 107238） */
function PluginSyncSelectAll({
  selectedCount,
  totalSelectable,
  onSelectAll,
  onClearAll,
}: {
  selectedCount: number;
  totalSelectable: number;
  onSelectAll: () => void;
  onClearAll: () => void;
}) {
  const { intl } = useIntlContext();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const disabled = totalSelectable === 0;
  const checked = totalSelectable > 0 && selectedCount >= totalSelectable;
  const indeterminate = totalSelectable > 0 && selectedCount > 0 && selectedCount < totalSelectable;
  React.useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <label
      className={`inline-flex h-6 items-center gap-2 rounded-md px-1 text-ui-base text-foreground-subtle ${disabled ? `opacity-50` : `cursor-pointer hover:text-foreground`}`}
    >
      <input
        ref={inputRef}
        type="checkbox"
        className={`size-4`}
        checked={checked}
        disabled={disabled}
        aria-checked={indeterminate ? `mixed` : checked ? `true` : `false`}
        onChange={(e) => {
          if (e.currentTarget.checked) onSelectAll();
          else onClearAll();
        }}
      />
      <span>{intl.formatMessage({ id: `settings.plugins.remoteSync.selectAll` })}</span>
    </label>
  );
}

/** 原 GDt（styles 126514-126624 / jsx 107259）：插件选择行列表 */
function PluginSyncRowList({
  rows,
  selectedIds,
  emptyMessageId = `settings.plugins.remoteSync.empty`,
  onToggle,
}: {
  rows: PluginSyncRow[];
  selectedIds: Set<string>;
  emptyMessageId?: string;
  onToggle: (id: string, checked: boolean) => void;
}) {
  const { intl } = useIntlContext();
  return rows.length === 0 ? (
    <div className={`rounded-lg border border-border bg-surface px-3 py-3 text-ui-base text-foreground-subtle`}>
      {intl.formatMessage({ id: emptyMessageId })}
    </div>
  ) : (
    <div className={`grid gap-2`}>
      {rows.map((row) => {
        const checkboxId = `remote-plugin-sync-${row.candidate.id}`;
        const labelId = `${checkboxId}-label`;
        const checked = !row.exists && selectedIds.has(row.candidate.id);
        const optionsSummary = summarizePluginOptions(row.candidate.pluginOptions);
        return (
          <label
            key={row.candidate.id}
            htmlFor={checkboxId}
            className={`grid grid-cols-[auto_auto_minmax(0,1fr)] gap-3 rounded-lg border border-border bg-surface px-3 py-2 text-ui-base ${row.exists ? `cursor-default` : `cursor-pointer hover:border-border-hover hover:bg-surface-hover`}`}
          >
            <input
              id={checkboxId}
              type="checkbox"
              aria-labelledby={labelId}
              className={`mt-1 size-4`}
              checked={checked}
              disabled={row.exists}
              onChange={(event) => onToggle(row.candidate.id, event.currentTarget.checked)}
            />
            <span className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-border text-foreground-subtle`} aria-hidden="true">
              <IconPuzzle className={`size-4`} />
            </span>
            <span className={`min-w-0`}>
              <span className={`flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1`}>
                <span id={labelId} className={`font-medium text-foreground`}>
                  {row.candidate.name}
                </span>
                {row.candidate.version ? (
                  <span className={`rounded-md bg-secondary px-1.5 py-0.5 text-ui-xs font-medium text-foreground-subtle`}>
                    {row.candidate.version}
                  </span>
                ) : null}
                {row.candidate.componentTypes.map((kind) => (
                  <span key={kind} className={`rounded-md bg-secondary px-1.5 py-0.5 text-ui-xs font-medium text-foreground-subtle`}>
                    {kind}
                  </span>
                ))}
                <span className={`rounded-md bg-secondary px-1.5 py-0.5 text-ui-xs font-medium text-foreground-subtle`}>
                  {row.candidate.kind === `inline` ? `inline` : row.candidate.marketplace}
                </span>
                {row.exists ? (
                  <span className={`text-ui-base text-foreground-subtlest`}>
                    {intl.formatMessage({ id: `settings.plugins.remoteSync.existing` })}
                  </span>
                ) : null}
              </span>
              {row.candidate.description ? (
                <span className={`mt-1 block text-ui-base text-foreground-subtle`}>{row.candidate.description}</span>
              ) : null}
              {row.candidate.path ? (
                <span className={`mt-1 block break-all font-mono text-ui-base text-foreground-subtlest`}>{row.candidate.path}</span>
              ) : null}
              {optionsSummary ? (
                <span className={`mt-1 block text-ui-xs text-foreground-subtle`}>
                  {intl.formatMessage(
                    { id: `settings.plugins.remoteSync.optionsSummary` },
                    { manual: String(optionsSummary.manualCount), syncable: String(optionsSummary.syncableCount) },
                  )}
                </span>
              ) : null}
            </span>
          </label>
        );
      })}
    </div>
  );
}

type PluginSyncStatus = "queued" | "syncing" | "synced" | "failed" | "stopped" | "skipped";

/** 原 KDt（styles 126625-126647 / jsx 107287）：状态徽章 */
function PluginSyncStatusBadge({ status }: { status: PluginSyncStatus }) {
  const { intl } = useIntlContext();
  const label = intl.formatMessage({ id: `settings.plugins.remoteSync.${status}` });
  const icon =
    status === `synced` ? (
      <IconCircleCheck className={`size-3`} aria-hidden="true" />
    ) : status === `failed` ? (
      <IconCircleX className={`size-3`} aria-hidden="true" />
    ) : status === `stopped` ? (
      <IconCircleStop className={`size-3`} aria-hidden="true" />
    ) : null;
  return (
    <span
      className={cn(
        `inline-flex h-6 shrink-0 items-center gap-1 rounded-md border px-2 text-ui-xs font-medium`,
        status === `synced` && `border-success/30 bg-success/10 text-success dark:bg-success/14`,
        status === `failed` && `border-destructive/30 bg-destructive/10 text-destructive`,
        status === `stopped` && `border-warning/30 bg-warning/10 text-warning`,
        status === `skipped` && `border-border bg-secondary text-foreground-subtle`,
        (status === `queued` || status === `syncing`) && `border-border bg-secondary text-foreground-subtle`,
      )}
    >
      {icon}
      {label}
    </span>
  );
}

/** 原 qDt（styles 126648-126683 / jsx 107302）：同步中日志 HoverCard tooltip */
function PluginSyncLogTooltip({ logs }: { logs: string[] }) {
  const { intl } = useIntlContext();
  const lines = logs.length > 0 ? logs : [`Queued plugin sync`];
  return (
    <HoverCard closeDelay={160} openDelay={120}>
      <HoverCardTrigger asChild>
        <span
          aria-label={intl.formatMessage({ id: `settings.plugins.remoteSync.logTooltip` })}
          className={`inline-flex size-6 cursor-help items-center justify-center rounded-md text-foreground-subtle hover:bg-hover hover:text-foreground`}
          role="img"
        >
          <IconLoaderCircle className={`size-3.5 animate-spin`} aria-hidden="true" />
        </span>
      </HoverCardTrigger>
      <HoverCardContent
        align="end"
        side="left"
        sideOffset={6}
        className={`flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2 bg-popover p-3 text-left`}
      >
        <div className={`text-ui-base font-medium text-popover-foreground`}>
          {intl.formatMessage({ id: `settings.plugins.remoteSync.logTooltip` })}
        </div>
        <pre className={`max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-md bg-secondary p-2 font-mono text-ui-xs/relaxed text-popover-foreground`}>
          {lines.join(`\n`)}
        </pre>
      </HoverCardContent>
    </HoverCard>
  );
}

/** 原 JDt（styles 126684-126795 / jsx 107329）：同步进行中的逐行进度列表（含停止按钮） */
function PluginSyncProgressList({
  progressById,
  rows,
  onStop,
}: {
  progressById: Map<string, { logs: string[]; status: PluginSyncStatus; result?: PluginSyncResultItem }>;
  rows: PluginSyncRow[];
  onStop: (candidateId: string) => void;
}) {
  const { intl } = useIntlContext();
  return rows.length === 0 ? (
    <div className={`rounded-lg border border-border bg-surface px-3 py-3 text-ui-base text-foreground-subtle`}>
      {intl.formatMessage({ id: `settings.plugins.remoteSync.resultEmpty` })}
    </div>
  ) : (
    <div className={`grid gap-2`}>
      {rows.map((row) => {
        const progress = progressById.get(row.candidate.id) ?? { logs: [`Queued plugin sync`], status: `queued` as PluginSyncStatus };
        const optionsSummary = summarizePluginOptions(row.candidate.pluginOptions);
        const isActive = progress.status === `queued` || progress.status === `syncing`;
        return (
          <div
            key={row.candidate.id}
            className={`grid grid-cols-[auto_minmax(0,1fr)_auto] gap-3 rounded-lg border border-border bg-surface px-3 py-2 text-ui-base`}
          >
            <span className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border border-border text-foreground-subtle`} aria-hidden="true">
              <IconPuzzle className={`size-4`} />
            </span>
            <div className={`min-w-0`}>
              <div className={`flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1`}>
                <span className={`font-medium text-foreground`}>{row.candidate.name}</span>
                {row.candidate.version ? (
                  <span className={`rounded-md bg-secondary px-1.5 py-0.5 text-ui-xs font-medium text-foreground-subtle`}>
                    {row.candidate.version}
                  </span>
                ) : null}
                {row.candidate.componentTypes.map((kind) => (
                  <span key={kind} className={`rounded-md bg-secondary px-1.5 py-0.5 text-ui-xs font-medium text-foreground-subtle`}>
                    {kind}
                  </span>
                ))}
                <span className={`rounded-md bg-secondary px-1.5 py-0.5 text-ui-xs font-medium text-foreground-subtle`}>
                  {row.candidate.kind === `inline` ? `inline` : row.candidate.marketplace}
                </span>
              </div>
              {progress.result?.error ? (
                <div className={`mt-1 break-words text-ui-base text-destructive`}>{progress.result.error}</div>
              ) : row.candidate.path ? (
                <div className={`mt-1 break-all font-mono text-ui-base text-foreground-subtlest`}>{row.candidate.path}</div>
              ) : null}
              {optionsSummary && !progress.result?.error ? (
                <div className={`mt-1 text-ui-xs text-foreground-subtle`}>
                  {intl.formatMessage(
                    { id: `settings.plugins.remoteSync.optionsSummary` },
                    { manual: String(optionsSummary.manualCount), syncable: String(optionsSummary.syncableCount) },
                  )}
                </div>
              ) : null}
            </div>
            <div className={`flex shrink-0 items-start gap-1`}>
              {progress.status === `syncing` ? <PluginSyncLogTooltip logs={progress.logs} /> : null}
              <PluginSyncStatusBadge status={progress.status} />
              {isActive ? (
                <Tooltip title={intl.formatMessage({ id: `settings.plugins.remoteSync.stop` })} side="left">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={intl.formatMessage({ id: `settings.plugins.remoteSync.stop` })}
                    className={`text-foreground-subtle hover:text-warning`}
                    onClick={() => onStop(row.candidate.id)}
                  >
                    <IconCircleStop className={`size-3.5`} aria-hidden="true" />
                  </Button>
                </Tooltip>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** 原 YDt（styles 126796-126842 / jsx 107362）：插件同步结果视图 */
function PluginSyncResultView({ result }: { result: { results?: PluginSyncResultItem[] } | null }) {
  const { intl } = useIntlContext();
  const results = result?.results ?? [];
  return results.length === 0 ? (
    <div className={`rounded-lg border border-border bg-surface px-3 py-3 text-ui-base text-foreground-subtle`}>
      {intl.formatMessage({ id: `settings.plugins.remoteSync.resultEmpty` })}
    </div>
  ) : (
    <div className={`overflow-hidden rounded-xl border border-border bg-card`}>
      <div className={`divide-y divide-border`}>
        {results.map((item) => (
          <div key={`${item.pluginId}-${item.directoryName}-${item.status}`} className={`grid grid-cols-[minmax(0,1fr)_auto] gap-3 px-4 py-3`}>
            <div className={`min-w-0`}>
              <div className={`truncate text-ui-base font-medium text-foreground`}>{item.name}</div>
              {item.error ? (
                <div className={`mt-0.5 break-words text-ui-base text-destructive`}>{item.error}</div>
              ) : item.path ? (
                <div className={`mt-0.5 truncate font-mono text-ui-xs text-foreground-subtlest`}>{item.path}</div>
              ) : null}
            </div>
            <PluginSyncStatusBadge status={item.status as PluginSyncStatus} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** 原 XDt（styles 126843-127130 / jsx 107373）：插件同步对话框 */
function PluginSyncDialog(props: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  localPluginSyncService: LocalPluginSyncService;
  remotePluginSyncService: RemotePluginSyncService;
  localZCodeAgentService?: ZCodeAgentService | null;
  remoteZCodeAgentService?: ZCodeAgentService | null;
  remoteTarget: RemoteTarget;
  workspacePath: string;
  localWorkspacePath?: string;
  workspaceIdentity?: string | null;
  onSynced: () => Promise<void> | void;
}) {
  const { intl } = useIntlContext();
  const {
    localPluginSyncService,
    localWorkspacePath,
    localZCodeAgentService,
    onOpenChange,
    onSynced,
    open,
    remotePluginSyncService,
    remoteZCodeAgentService,
    remoteTarget,
    workspacePath,
    workspaceIdentity,
  } = props;
  const [phase, setPhase] = React.useState<SyncPhase>(`loading`);
  const [rows, setRows] = React.useState<PluginSyncRow[]>([]);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [showExisting, setShowExisting] = React.useState(true);
  const [result, setResult] = React.useState<{ results: PluginSyncResultItem[] } | null>(null);
  const [progressById, setProgressById] = React.useState<
    Map<string, { logs: string[]; status: PluginSyncStatus; result?: PluginSyncResultItem }>
  >(new Map());
  const [syncingRows, setSyncingRows] = React.useState<PluginSyncRow[]>([]);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const stoppedIdsRef = React.useRef<Set<string>>(new Set());
  const stopResolversRef = React.useRef<Map<string, () => void>>(new Map());
  const inFlightRef = React.useRef(false);
  React.useEffect(() => {
    if (!open) return;
    let disposed = false;
    setPhase(`loading`);
    setRows([]);
    setSelectedIds(new Set());
    setShowExisting(true);
    setResult(null);
    setProgressById(new Map());
    setSyncingRows([]);
    setErrorMessage(null);
    stoppedIdsRef.current = new Set();
    stopResolversRef.current = new Map();
    inFlightRef.current = false;
    (async () => {
      try {
        const { candidates, statuses } = await loadPluginSyncCandidates({
          localPluginSyncService,
          localWorkspacePath: localWorkspacePath ?? workspacePath,
          localZCodeAgentService,
          remotePluginSyncService,
          remoteWorkspaceIdentity: workspaceIdentity,
          remoteWorkspacePath: workspacePath,
          remoteZCodeAgentService,
        });
        if (disposed) return;
        const merged = mergePluginRows(candidates, statuses);
        setRows(merged);
        setSelectedIds(defaultPluginSelection(merged));
        setPhase(`selection`);
      } catch (error) {
        if (disposed) return;
        setErrorMessage(error instanceof Error ? error.message : String(error));
        setPhase(`selection`);
      }
    })();
    return () => {
      disposed = true;
    };
  }, [localPluginSyncService, localWorkspacePath, localZCodeAgentService, open, remotePluginSyncService, remoteZCodeAgentService, workspaceIdentity, workspacePath]);
  const visibleRows = React.useMemo(() => filterPluginRows(rows, showExisting), [rows, showExisting]);
  const selectableIds = React.useMemo(() => visibleRows.filter((r) => !r.exists).map((r) => r.candidate.id), [visibleRows]);
  const selectedAvailable = React.useMemo(() => selectableIds.filter((id) => selectedIds.has(id)), [selectedIds, selectableIds]);
  const selectedCount = selectedAvailable.length;
  const targetLabel = remoteSyncTargetLabel(remoteTarget, workspacePath);
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (canClosePluginSyncDialog(phase, next)) onOpenChange(next);
      }}
    >
      <DialogContent
        showCloseButton={phase !== `preflighting` && phase !== `syncing`}
        className={`h-[min(720px,calc(100dvh-2rem))] max-h-[min(720px,calc(100dvh-2rem))] max-w-2xl flex flex-col overflow-hidden`}
      >
        <DialogHeader>
          <PluginSyncTitle />
          <PluginSyncHeader
            targetLabel={targetLabel}
            showExistingRemotePlugins={showExisting}
            showExistingFilter={phase === `selection` && rows.length > 0}
            onShowExistingRemotePluginsChange={setShowExisting}
          />
        </DialogHeader>
        <div className={`min-h-0 flex-1 overflow-y-auto`}>
          {errorMessage ? (
            <div className={`mb-3 rounded-lg border border-destructive/40 bg-surface px-3 py-2 text-ui-base text-destructive`}>
              {errorMessage}
            </div>
          ) : null}
          {phase === `loading` ? (
            <div className={`flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-3 text-ui-base text-foreground-subtle`}>
              <IconLoaderCircle className={`size-3.5 animate-spin`} aria-hidden="true" />
              {intl.formatMessage({ id: `settings.plugins.remoteSync.loading` })}
            </div>
          ) : null}
          {phase === `preflighting` ? (
            <div className={`flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-3 text-ui-base text-foreground-subtle`}>
              <IconLoaderCircle className={`size-3.5 animate-spin`} aria-hidden="true" />
              {intl.formatMessage({ id: `settings.remoteSync.preflighting` })}
            </div>
          ) : null}
          {phase === `selection` ? (
            <PluginSyncRowList
              rows={visibleRows}
              selectedIds={selectedIds}
              emptyMessageId={rows.length > 0 ? `settings.plugins.remoteSync.filteredEmpty` : undefined}
              onToggle={(id, checked) => {
                setSelectedIds((prev) => {
                  const next = new Set(prev);
                  if (checked) next.add(id);
                  else next.delete(id);
                  return next;
                });
              }}
            />
          ) : null}
          {phase === `syncing` ? (
            <PluginSyncProgressList
              progressById={progressById}
              rows={syncingRows}
              onStop={(candidateId) => {
                stoppedIdsRef.current.add(candidateId);
                stopResolversRef.current.get(candidateId)?.();
                setProgressById((prev) => {
                  const next = new Map(prev);
                  const entry = next.get(candidateId) ?? { logs: [], status: `queued` as PluginSyncStatus };
                  next.set(candidateId, {
                    ...entry,
                    logs: [
                      ...entry.logs,
                      `stop requested; cancelling the active remote plugin operation when possible`,
                    ],
                    status: `stopped`,
                  });
                  return next;
                });
              }}
            />
          ) : null}
          {phase === `complete` ? <PluginSyncResultView result={result} /> : null}
        </div>
        <div className={`flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between`}>
          <div className={`text-ui-base text-foreground-subtle`}>
            {intl.formatMessage(
              { id: `settings.plugins.remoteSync.selectionCount` },
              { selected: String(selectedCount), total: String(selectableIds.length) },
            )}
          </div>
          <div className={`flex flex-wrap justify-end gap-2`}>
            {phase === `selection` ? (
              <PluginSyncSelectAll
                selectedCount={selectedCount}
                totalSelectable={selectableIds.length}
                onSelectAll={() => setSelectedIds(new Set(selectableIds))}
                onClearAll={() => setSelectedIds(new Set())}
              />
            ) : null}
            <Button
              type="button"
              size="sm"
              disabled={phase !== `selection` || selectedCount === 0}
              onClick={async () => {
                if (!canSubmitRemoteSync({ inFlight: inFlightRef.current, selectedCount: selectedAvailable.length })) {
                  if (selectedAvailable.length === 0)
                    setErrorMessage(intl.formatMessage({ id: `settings.plugins.remoteSync.noSelection` }));
                  return;
                }
                inFlightRef.current = true;
                setErrorMessage(null);
                setPhase(`preflighting`);
                const chosen = rows.filter((r) => !r.exists && selectedIds.has(r.candidate.id));
                try {
                  const preflight = await withRemoteSyncPreflightTimeout(() =>
                    remotePluginSyncService.checkRemoteUserPluginWriteAccess(),
                  );
                  if (!preflight.ok)
                    throw Error(
                      intl.formatMessage(
                        { id: `settings.remoteSync.preflightFailed` },
                        { path: preflight.path, error: preflight.error ?? `` },
                      ),
                    );
                } catch (error) {
                  setErrorMessage(
                    isRemoteSyncPreflightTimeoutError(error)
                      ? intl.formatMessage(
                          { id: `settings.remoteSync.preflightTimeout` },
                          { seconds: String(Math.ceil(error.timeoutMs / 1000)) },
                        )
                      : error instanceof Error
                        ? error.message
                        : String(error),
                  );
                  setPhase(`selection`);
                  inFlightRef.current = false;
                  return;
                }
                setPhase(`syncing`);
                setSyncingRows(chosen);
                setProgressById(
                  new Map(
                    chosen.map(
                      (row): [string, { logs: string[]; status: PluginSyncStatus; result?: PluginSyncResultItem }] => [
                        row.candidate.id,
                        { logs: [`Queued plugin sync`], status: `queued` as PluginSyncStatus },
                      ],
                    ),
                  ),
                );
                stoppedIdsRef.current = new Set();
                stopResolversRef.current = new Map();
                try {
                  const pipelineResult = await runPluginSyncPipeline({
                    localPluginSyncService,
                    onItemProgress: (event) => {
                      setProgressById((prev) => {
                        const next = new Map(prev);
                        const entry = next.get(event.candidateId) ?? { logs: [], status: `queued` as PluginSyncStatus };
                        next.set(event.candidateId, {
                          logs: [...entry.logs, event.log],
                          ...(event.result ? { result: event.result } : entry.result ? { result: entry.result } : {}),
                          status: event.status as PluginSyncStatus,
                        });
                        return next;
                      });
                    },
                    remotePluginSyncService,
                    remoteWorkspaceIdentity: workspaceIdentity,
                    remoteWorkspacePath: workspacePath,
                    remoteZCodeAgentService,
                    rows: chosen,
                    stopControl: {
                      cancelOperation: async (operationId) => {
                        if (remoteZCodeAgentService?.cancelPluginOperation)
                          await remoteZCodeAgentService.cancelPluginOperation({ operationId });
                      },
                      isStopped: (candidateId) => stoppedIdsRef.current.has(candidateId),
                      waitForStop: (candidateId) =>
                        stoppedIdsRef.current.has(candidateId)
                          ? Promise.resolve()
                          : new Promise<void>((resolve) => {
                              stopResolversRef.current.set(candidateId, resolve);
                            }),
                    },
                  });
                  await onSynced();
                  setResult(pipelineResult);
                  setPhase(`complete`);
                } catch (error) {
                  setErrorMessage(error instanceof Error ? error.message : String(error));
                  setPhase(`selection`);
                } finally {
                  inFlightRef.current = false;
                }
              }}
            >
              <IconCloudUpload className={`size-3.5`} aria-hidden="true" />
              {intl.formatMessage({ id: `settings.plugins.remoteSync.start` })}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ----------------------------------------------------------------------------
 * 2.4 分派器（原 r4，styles 127265-127349 / jsx 107623）
 * --------------------------------------------------------------------------*/

/** 原 r4：按 canSync×open 三条件装配技能/MCP/插件三个同步对话框 */
export function RemoteSyncDialogs({
  canSyncSkills,
  canSyncMcp,
  canSyncPlugins = false,
  skillOpen,
  mcpOpen,
  pluginOpen = false,
  onSkillOpenChange,
  onMcpOpenChange,
  onPluginOpenChange,
  localSkillSyncService,
  remoteSkillSyncService,
  localMcpSyncService,
  remoteMcpSyncService,
  localPluginSyncService,
  remotePluginSyncService,
  localZCodeAgentService,
  remoteZCodeAgentService,
  remoteTarget,
  skillWorkspacePath,
  mcpWorkspacePath,
  pluginWorkspacePath,
  pluginLocalWorkspacePath,
  mcpLocalWorkspacePath,
  workspaceIdentity,
  onSkillsSynced,
  onMcpSynced,
  onPluginsSynced,
}: {
  canSyncSkills: boolean;
  canSyncMcp: boolean;
  canSyncPlugins?: boolean;
  skillOpen: boolean;
  mcpOpen: boolean;
  pluginOpen?: boolean;
  onSkillOpenChange: (v: boolean) => void;
  onMcpOpenChange: (v: boolean) => void;
  onPluginOpenChange?: (v: boolean) => void; // A0-CLEANUP3 3b：技能/MCP 单域调用面不传插件侧回调，函数体已 ?? 兜底
  localSkillSyncService?: SkillSyncService | null;
  remoteSkillSyncService?: RemoteSkillSyncService | null;
  localMcpSyncService?: McpSyncService | null;
  remoteMcpSyncService?: RemoteMcpSyncService | null;
  localPluginSyncService?: LocalPluginSyncService | null;
  remotePluginSyncService?: RemotePluginSyncService | null;
  localZCodeAgentService?: ZCodeAgentService | null;
  remoteZCodeAgentService?: ZCodeAgentService | null;
  remoteTarget?: RemoteTarget | null;
  skillWorkspacePath: string;
  mcpWorkspacePath: string;
  pluginWorkspacePath?: string; // A0-CLEANUP3 3b：同上，函数体以 ?? mcpWorkspacePath 兜底
  pluginLocalWorkspacePath?: string;
  mcpLocalWorkspacePath?: string;
  workspaceIdentity?: string | null;
  onSkillsSynced?: () => Promise<void> | void;
  onMcpSynced?: () => Promise<void> | void;
  onPluginsSynced?: () => Promise<void> | void;
}) {
  const skillServices =
    canSyncSkills && skillOpen && remoteTarget && localSkillSyncService && remoteSkillSyncService
      ? { localSkillSyncService, remoteSkillSyncService, remoteTarget }
      : null;
  const mcpServices =
    canSyncMcp && mcpOpen && remoteTarget && localMcpSyncService && remoteMcpSyncService
      ? { localMcpSyncService, remoteMcpSyncService, remoteTarget }
      : null;
  const pluginServices =
    canSyncPlugins && pluginOpen && remoteTarget && localPluginSyncService && remotePluginSyncService
      ? { localPluginSyncService, remotePluginSyncService, remoteTarget }
      : null;
  return (
    <>
      {skillServices ? (
        <SkillSyncDialog
          open={skillOpen}
          onOpenChange={onSkillOpenChange}
          localSkillSyncService={skillServices.localSkillSyncService}
          remoteSkillSyncService={skillServices.remoteSkillSyncService}
          remoteTarget={skillServices.remoteTarget}
          workspacePath={skillWorkspacePath}
          workspaceIdentity={workspaceIdentity}
          onSynced={onSkillsSynced ?? (() => {})}
        />
      ) : null}
      {mcpServices ? (
        <McpSyncDialog
          open={mcpOpen}
          onOpenChange={onMcpOpenChange}
          localMcpSyncService={mcpServices.localMcpSyncService}
          remoteMcpSyncService={mcpServices.remoteMcpSyncService}
          remoteTarget={mcpServices.remoteTarget}
          workspacePath={mcpWorkspacePath}
          localWorkspacePath={mcpLocalWorkspacePath}
          onSynced={onMcpSynced ?? (() => {})}
        />
      ) : null}
      {pluginServices ? (
        <PluginSyncDialog
          open={pluginOpen}
          onOpenChange={onPluginOpenChange ?? (() => {})}
          localPluginSyncService={pluginServices.localPluginSyncService}
          remotePluginSyncService={pluginServices.remotePluginSyncService}
          localZCodeAgentService={localZCodeAgentService}
          remoteZCodeAgentService={remoteZCodeAgentService}
          remoteTarget={pluginServices.remoteTarget}
          localWorkspacePath={pluginLocalWorkspacePath}
          workspacePath={pluginWorkspacePath ?? mcpWorkspacePath}
          workspaceIdentity={workspaceIdentity}
          onSynced={onPluginsSynced ?? (() => {})}
        />
      ) : null}
    </>
  );
}

