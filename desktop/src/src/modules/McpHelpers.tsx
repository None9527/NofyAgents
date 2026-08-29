/* ============================================================================
 * McpHelpers.tsx — B5-07 段 C：MCP 纯助手群 + 迁移助手尾部
 * ----------------------------------------------------------------------------
 * 主口径：desktop/src/out/renderer/assets/styles-CdEGpc2x.js（本机 213,979 行副本）。
 * 任务口径为 jsx 行号（旧 213,695 行副本）：155522–155824 → 本机 js 193351–193633；
 * 157977–158525（子代理段）→ js 196654–197541，158854–159974（插件段）→ js 198144–199993，
 * 后两段已随 SettingsLeaves.tsx §A/§B 全量抽取，本件不再转录；
 * 203136–203144（旧 js）→ 本机 js 203426–203434（迁移助手尾部）。
 *
 * 混淆名 → 语义名（本机 js 行）：
 *  §1 qQt → PLUGIN_COMPONENT_KIND_SEQUENCE (193351)
 *  §2 搜索/拆分助手：
 *   N7  → matchesScopedQuery        (193380)
 *   XQt → splitSkillsByScope        (193384；SettingsPanelsCapability 537 declare 对应)
 *   ZQt → splitCommandsByScope      (193397；SettingsPanelsCapability 2435 declare 对应)
 *   QQt → filterZcodeAgentMcpServers (193409)
 *  §3 插件 MCP 服务器行：
 *   $Qt → pluginMcpServerRows       (193414) | P7 → unwrapPluginServerName (193440)
 *   e$t → resolveRuntimeServerName  (193444) | t$t → runtimeStateProjection (193447)
 *  §4 同步资源键 / 导入计划：
 *   n$t → syncResourceKey           (193471) | F7 → jsonStringify (193474)
 *   r$t → parseSyncResourceKey      (193477) | i$t → groupImportPlans (193494)
 *   a$t → errorMessageText          (193525) | o$t → taskResultsOfCategory (193528)
 *  §5 agent 标签 / 作用域助手：
 *   s$t → agentDisplayLabel         (193541) | I7 → categoryOfAgentResult (193583)
 *   c$t → SYNC_SCOPES (193586) | l$t → SYNC_IMPORT_MODES (193587)
 *   u$t → importScopeI18nKey        (193588) | L7 → itemsOfCategory (193591)
 *   d$t → normalizeSlashes          (193600) | f$t → scopeOfPath (193603)
 *   p$t → sourceRootsOfAgent        (193609) | m$t → scopeRowsOfAgents (193623)
 *  §6 迁移助手尾部（本机 203426–203439）：
 *   k2t → MIGRATION_DEFAULT_LIMIT=100 | A2t → MIGRATION_MAX_LIMIT=500
 *   j2t → MIGRATION_UNLIMITED=`unlimited` | M2t → MIGRATION_RANGE_DURATIONS
 *   N2t → modifiedSinceOfRange (203430) | P2t → parseScanLimit (203433)
 *   F2t → resolveWorkspaceFilterMode (203437)
 *
 * 边界裁决（详见 QuickPickCmdkMcp.report.md §C）：
 *  - JQt/YQt（193352/193366）已随 SettingsLeaves.tsx 2706/2692 抽取 → 仅注记。
 *  - h$t/g$t/_$t（193634–193642）与 z7/R7/M7 属导入对话框族，已随 SettingsPanels.tsx §8
 *    抽取（4047–4056 等）→ 仅注记；三件位于本件区段终点（193633）之后。
 *  - I2t（203440）已随 SettingsPanelsData.tsx 843（useClaudeMigration）抽取 → 仅注记；
 *    其 declare 组（SettingsPanelsData 820–823）与本件 §6 重名，集成时改指本件。
 *  - 子代理段（js 196654–197541）/插件段（js 198144–199993）= SettingsLeaves §A/§B。
 *
 * 把握度分级：§1–§6 = 高（逐字回代核验）；类型签名为推断（中），以服务层为准。
 * ==========================================================================*/
/* eslint-disable */

type FormatMessageFn = (descriptor: { id: string }, values?: Record<string, string>) => string;
interface IntlShape {
  formatMessage: FormatMessageFn;
}

/* ============================================================================
 * §1 插件组件种类序列（原 qQt，193351）
 * ==========================================================================*/

/** 原 qQt：组件摘要的固定展示顺序（JQt/YQt 共用；SettingsLeaves 已内联同值） */
export const PLUGIN_COMPONENT_KIND_SEQUENCE = [`agent`, `command`, `skill`, `hook`, `mcp`];

/* ============================================================================
 * §2 搜索/拆分助手（原 193380–193413）
 * ==========================================================================*/

/** 原 N7（193380）：小写子串匹配；空查询恒真 */
export function matchesScopedQuery(query: string, candidates: Array<string | null | undefined>): boolean {
  const q = query.trim().toLowerCase();
  return q ? candidates.some((candidate) => candidate?.toLowerCase().includes(q)) : !0;
}

interface ScopedSkillLike {
  id: string; // A0-CLEANUP3 3b：技能记录为统一形（SPC.SkillItem 消费面），补足记录字段
  enabled: boolean;
  path: string;
  name: string;
  description?: string;
  pluginName?: string;
  scope: string; // A0-CLEANUP3 3b：收紧为必有（与 SPC.SkillItem 互指；运行期恒有值）
}
/** 原 XQt（193384）：技能按路径去重 + 查询过滤，scope=plugin 归 plugin 侧 */
export function splitSkillsByScope(skills: ScopedSkillLike[], query: string): { local: ScopedSkillLike[]; plugin: ScopedSkillLike[] } {
  const seen = new Set<string>();
  const local: ScopedSkillLike[] = [];
  const plugin: ScopedSkillLike[] = [];
  for (const skill of skills) {
    const key = skill.path.replaceAll(`\\`, `/`).toLowerCase();
    seen.has(key) ||
      (seen.add(key),
      matchesScopedQuery(query, [skill.name, skill.description, skill.pluginName]) &&
        (skill.scope === `plugin` ? plugin.push(skill) : local.push(skill)));
  }
  return { local, plugin };
}

interface FileBasedCommandLike {
  id: string; // A0-CLEANUP3 3b：命令记录为统一形（SPC.CommandItem 消费面），补足记录字段
  enabled: boolean;
  filePath: string;
  agentSource: string;
  name: string;
  description?: string;
  prompt?: string;
  [key: string]: unknown;
}
interface PluginCommandLike {
  id: string; // A0-CLEANUP3 3b：同上（命令记录统一形）
  enabled: boolean;
  filePath: string;
  agentSource: string;
  name: string;
  description?: string;
  prompt?: string;
  pluginName?: string;
  [key: string]: unknown;
}
/** ki（跨 chunk）：文件型命令判定 */
declare function isFileBasedCommand(command: unknown): command is FileBasedCommandLike;
/** ft（跨 chunk）：插件命令判定 */
declare function isPluginCommand(command: unknown): command is PluginCommandLike;
/** 原 ZQt（193397）：命令分流——文件型且 zcodeAgent 归 local，插件命令归 plugin */
export function splitCommandsByScope(commands: unknown[], query: string): { local: FileBasedCommandLike[]; plugin: PluginCommandLike[] } {
  const local: FileBasedCommandLike[] = [];
  const plugin: PluginCommandLike[] = [];
  for (const command of commands) {
    if (isFileBasedCommand(command) && command.agentSource === `zcodeAgent` && matchesScopedQuery(query, [command.name, command.description, command.prompt])) {
      local.push(command);
      continue;
    }
    isPluginCommand(command) && matchesScopedQuery(query, [command.name, command.description, command.prompt, command.pluginName]) && plugin.push(command);
  }
  return { local, plugin };
}

interface McpServerEntryLike {
  source?: string;
  name: string;
  config: { url?: string | null; command?: string | null };
}
/** 原 QQt（193409）：仅保留 source=zcodeagentmcp 的服务器 */
export function filterZcodeAgentMcpServers(servers: McpServerEntryLike[], query: string): McpServerEntryLike[] {
  return servers.filter((server) =>
    server.source === `zcodeagentmcp` ? matchesScopedQuery(query, [server.name, server.config.url, server.config.command]) : !1,
  );
}

/* ============================================================================
 * §3 插件 MCP 服务器行（原 193414–193470）
 * ==========================================================================*/

interface PluginManifestLike {
  id: string;
  name: string;
  enabled: boolean;
  marketplace?: string | null;
  mcpServerNames: string[];
  hostMcpServerNames?: string[];
  declaredMcpServerNames?: string[];
}
interface McpRuntimeState {
  status: `connected` | `connecting` | `disconnected` | `failed` | `disabled` | `untrusted`;
  authorization?: unknown;
  error?: string | null;
  toolCount?: number;
}
export interface PluginMcpServerRow {
  authorization?: unknown;
  error?: string | null;
  status?: string;
  toolCount?: number;
  active: boolean;
  id: string;
  hostProvided?: boolean;
  name: string;
  pluginEnabled: boolean;
  pluginId: string;
  pluginMarketplace?: string | null;
  pluginName: string;
  runtimeServerName: string;
}
/** 原 P7（193440）：剥离 `plugin:<插件名>:` 前缀 */
export function unwrapPluginServerName(plugin: { name: string }, serverName: string): string {
  const prefix = `plugin:${plugin.name}:`;
  return serverName.startsWith(prefix) ? serverName.slice(prefix.length) : serverName;
}
/** 原 e$t（193444）：行名 → 插件声明的运行时名（缺失时补前缀） */
export function resolveRuntimeServerName(plugin: PluginManifestLike, serverName: string): string {
  return plugin.mcpServerNames.find((declared) => declared === serverName || unwrapPluginServerName(plugin, declared) === serverName) ?? `plugin:${plugin.name}:${serverName}`;
}
/** 原 t$t（193447）：运行态 → 行投影（failed→error / disabled|untrusted→unknown） */
export function runtimeStateProjection(state: McpRuntimeState | undefined): {
  authorization?: unknown;
  error?: string | null;
  status?: string;
  toolCount?: number;
} {
  if (!state) return {};
  switch (state.status) {
    case `connected`:
    case `connecting`:
    case `disconnected`:
      return {
        authorization: state.authorization,
        error: state.error,
        status: state.status,
        toolCount: state.toolCount,
      };
    case `failed`:
      return { error: state.error ?? `MCP server failed`, status: `error`, toolCount: state.toolCount };
    case `disabled`:
      return { error: state.error, status: `unknown`, toolCount: state.toolCount };
    case `untrusted`:
      return {
        error: state.error ?? `Project MCP server requires explicit connection before use.`,
        status: `unknown`,
        toolCount: state.toolCount,
      };
  }
}
/** 原 $Qt（193414）：插件清单 × 服务器名 → 合并行（宿主名优先；运行态按运行时名查） */
export function pluginMcpServerRows(
  plugins: PluginManifestLike[],
  query: string,
  runtimeByName: Record<string, McpRuntimeState | undefined> = {},
): PluginMcpServerRow[] {
  return plugins.flatMap((plugin) => {
    const hostNames = new Set(plugin.hostMcpServerNames ?? []);
    const declaredNames = new Set(plugin.mcpServerNames);
    const declaredAndUnwrapped = new Set(plugin.mcpServerNames.flatMap((name) => [name, unwrapPluginServerName(plugin, name)]));
    const displayNames = (plugin.declaredMcpServerNames ?? plugin.mcpServerNames).map((name) => unwrapPluginServerName(plugin, name));
    return Array.from(new Set([...hostNames, ...displayNames, ...plugin.mcpServerNames.map((name) => unwrapPluginServerName(plugin, name))]))
      .filter((name) => matchesScopedQuery(query, [name, plugin.name, plugin.id]))
      .map((serverName) => {
        const isHostProvided = hostNames.has(serverName);
        const runtimeServerName = isHostProvided ? serverName : resolveRuntimeServerName(plugin, serverName);
        return {
          ...(isHostProvided || plugin.enabled ? runtimeStateProjection(runtimeByName[runtimeServerName]) : {}),
          active: isHostProvided || declaredNames.has(serverName) || declaredAndUnwrapped.has(serverName),
          id: `${plugin.id}:${serverName}`,
          ...(isHostProvided ? { hostProvided: !0 } : {}),
          name: serverName,
          pluginEnabled: plugin.enabled,
          pluginId: plugin.id,
          pluginMarketplace: plugin.marketplace,
          pluginName: plugin.name,
          runtimeServerName,
        };
      });
  });
}

/* ============================================================================
 * §4 同步资源键 / 导入计划（原 193471–193540）
 * ==========================================================================*/

/** 原 n$t（193471）：三段/两段资源键 */
export function syncResourceKey(agent: string, category: string, sourceScope?: string): string {
  return sourceScope ? `${agent}:${category}:${sourceScope}` : `${agent}:${category}`;
}
/** 原 F7（193474） */
export function jsonStringify(value: unknown): string {
  return JSON.stringify(value);
}
interface SyncResourceRef {
  agent: string;
  category: string;
  sourceScope?: string;
  resourcePath: string;
}
/** 原 r$t（193477）：资源键 JSON 解析（字段不全/非法 → null） */
export function parseSyncResourceKey(raw: string): SyncResourceRef | null {
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed.agent != `string` || typeof parsed.category != `string` || typeof parsed.resourcePath != `string`
      ? null
      : {
          agent: parsed.agent,
          category: parsed.category,
          ...(parsed.sourceScope ? { sourceScope: parsed.sourceScope } : {}),
          resourcePath: parsed.resourcePath,
        };
  } catch {
    return null;
  }
}
export interface SyncImportPlan {
  agent: string;
  category: string;
  sourceScope?: string;
  targetScope: string;
  importMode: string;
  skillPaths?: string[];
  commandPaths?: string[];
  pluginPaths?: string[];
  mcpServerPaths?: string[];
}
/** 原 i$t（193494）：资源键列表 → 按 agent/category/sourceScope 聚合的导入计划 */
export function groupImportPlans(resourceKeys: string[], targetScope: string, importMode: string): SyncImportPlan[] {
  const byGroup = new Map<string, SyncImportPlan>();
  for (const raw of resourceKeys) {
    const ref = parseSyncResourceKey(raw);
    if (!ref) continue;
    const groupKey = JSON.stringify([ref.agent, ref.category, ref.sourceScope ?? null]);
    const plan =
      byGroup.get(groupKey) ?? {
        agent: ref.agent,
        category: ref.category,
        ...(ref.sourceScope ? { sourceScope: ref.sourceScope } : {}),
        targetScope,
        importMode,
        ...(ref.category === `skills`
          ? { skillPaths: [] as string[] }
          : ref.category === `commands`
            ? { commandPaths: [] as string[] }
            : ref.category === `plugins`
              ? { pluginPaths: [] as string[] }
              : { mcpServerPaths: [] as string[] }),
      };
    (ref.category === `skills`
      ? (plan.skillPaths = [...(plan.skillPaths ?? []), ref.resourcePath])
      : ref.category === `commands`
        ? (plan.commandPaths = [...(plan.commandPaths ?? []), ref.resourcePath])
        : ref.category === `plugins`
          ? (plan.pluginPaths = [...(plan.pluginPaths ?? []), ref.resourcePath])
          : (plan.mcpServerPaths = [...(plan.mcpServerPaths ?? []), ref.resourcePath]),
      byGroup.set(groupKey, plan));
  }
  return [...byGroup.values()];
}
/** 原 a$t（193525） */
export function errorMessageText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
interface SyncTaskResult {
  skillResults?: unknown[];
  commandResults?: unknown[];
  pluginResults?: unknown[];
  mcpServerResults?: unknown[];
}
/** 原 o$t（193528）：按类别抽取各任务的结果列表（原 JS 对 taskResults 缺失直接抛错） */
export function taskResultsOfCategory(
  result: { taskResults: SyncTaskResult[] } | null | undefined,
  category: string,
): unknown[] {
  return (
    result?.taskResults.flatMap((task) =>
      category === `skills`
        ? (task.skillResults ?? [])
        : category === `commands`
          ? (task.commandResults ?? [])
          : category === `plugins`
            ? (task.pluginResults ?? [])
            : (task.mcpServerResults ?? []),
    ) ?? []
  );
}

/* ============================================================================
 * §5 agent 标签 / 作用域助手（原 193541–193633）
 * ==========================================================================*/

/** 原 s$t（193541）：agent id → 展示名（zcode → nofy 键；未知原样返回） */
export function agentDisplayLabel(agent: string, intl: IntlShape): string {
  switch (agent) {
    case `claudeCode`:
      return intl.formatMessage({ id: `settingsSync.agent.claudeCode` });
    case `codexCli`:
      return intl.formatMessage({ id: `settingsSync.agent.codexCli` });
    case `openCode`:
      return intl.formatMessage({ id: `settingsSync.agent.openCode` });
    case `openClaw`:
      return intl.formatMessage({ id: `settingsSync.agent.openClaw` });
    case `augment`:
      return intl.formatMessage({ id: `settingsSync.agent.augment` });
    case `continue`:
      return intl.formatMessage({ id: `settingsSync.agent.continue` });
    case `goose`:
      return intl.formatMessage({ id: `settingsSync.agent.goose` });
    case `qwenCode`:
      return intl.formatMessage({ id: `settingsSync.agent.qwenCode` });
    case `qode`:
      return intl.formatMessage({ id: `settingsSync.agent.qode` });
    case `qodeCn`:
      return intl.formatMessage({ id: `settingsSync.agent.qodeCn` });
    case `windsurf`:
      return intl.formatMessage({ id: `settingsSync.agent.windsurf` });
    case `trae`:
      return intl.formatMessage({ id: `settingsSync.agent.trae` });
    case `traeCn`:
      return intl.formatMessage({ id: `settingsSync.agent.traeCn` });
    case `kiroCli`:
      return intl.formatMessage({ id: `settingsSync.agent.kiroCli` });
    case `roo`:
      return intl.formatMessage({ id: `settingsSync.agent.roo` });
    case `codeBuddy`:
      return intl.formatMessage({ id: `settingsSync.agent.codeBuddy` });
    case `agents`:
      return intl.formatMessage({ id: `settingsSync.agent.agents` });
    case `zcode`:
      return intl.formatMessage({ id: `settingsSync.agent.nofy` });
    default:
      return agent;
  }
}
interface SyncCategoryResult {
  category: string;
  sourceRoots?: SyncSourceRoot[];
  sourcePaths?: string[];
  discoveredCount: number;
  importableCount: number;
  skippedCount: number;
  skills?: Array<{ importable: boolean }>;
  commands?: Array<{ importable: boolean }>;
  plugins?: Array<{ importable: boolean }>;
  mcpServers?: Array<{ importable: boolean }>;
}
interface SyncAgentResult {
  agent: string;
  categories: SyncCategoryResult[];
}
interface SyncSourceRoot {
  scope: string;
  path: string;
  discoveredCount: number;
  importableCount: number;
  skippedCount: number;
  /** 服务端 sourceRoots 可携带分类条目（fallback 映射行无此字段 → 被 m$t 第二重过滤剔除） */
  skills?: Array<{ importable: boolean }>;
  commands?: Array<{ importable: boolean }>;
  plugins?: Array<{ importable: boolean }>;
  mcpServers?: Array<{ importable: boolean }>;
}
/** 原 I7（193583） */
export function categoryOfAgentResult(result: SyncAgentResult, category: string): SyncCategoryResult | undefined {
  return result.categories.find((entry) => entry.category === category);
}
/** 原 c$t/l$t（193586–193587） */
export const SYNC_SCOPES = [`global`, `project`];
export const SYNC_IMPORT_MODES = [`symlink`, `copy`];
/** 原 u$t（193588）：`settings.<category>.import.scope.<scope>` */
export function importScopeI18nKey(scope: string, intl: IntlShape, category: string): string {
  return intl.formatMessage({ id: `settings.${category}.import.scope.${scope}` });
}
/** 原 L7（193591）：类别 → 条目数组（对分类结果或 sourceRoot 行同构） */
export function itemsOfCategory(holder: SyncCategoryResult | SyncSourceRoot, category: string): Array<{ importable: boolean }> {
  return category === `skills`
    ? (holder.skills ?? [])
    : category === `commands`
      ? (holder.commands ?? [])
      : category === `plugins`
        ? (holder.plugins ?? [])
        : (holder.mcpServers ?? []);
}
/** 原 d$t（193600）：反斜杠归一 + 去尾部斜杠 */
export function normalizeSlashes(path: string): string {
  return path.replaceAll(`\\`, `/`).replace(/\/+$/u, ``);
}
/** 原 f$t（193603）：路径在根内 → project，否则 global（空根恒 global） */
export function scopeOfPath(path: string, root: string | null): `global` | `project` {
  if (!root) return `global`;
  const normalizedPath = normalizeSlashes(path);
  const normalizedRoot = normalizeSlashes(root);
  return normalizedPath === normalizedRoot || normalizedPath.startsWith(`${normalizedRoot}/`) ? `project` : `global`;
}
/** 原 p$t（193609）：sourceRoots 优先；否则 sourcePaths 逐条推作用域 */
export function sourceRootsOfAgent(result: SyncAgentResult, workspacePath: string | null, category: string): SyncSourceRoot[] {
  const categoryResult = categoryOfAgentResult(result, category);
  return categoryResult
    ? categoryResult.sourceRoots && categoryResult.sourceRoots.length > 0
      ? categoryResult.sourceRoots
      : (categoryResult.sourcePaths ?? []).map((path) => ({
          scope: scopeOfPath(path, workspacePath),
          path,
          discoveredCount: categoryResult.discoveredCount,
          importableCount: categoryResult.importableCount,
          skippedCount: categoryResult.skippedCount,
        }))
    : [];
}
/** 原 m$t（193623）：按 global/project 聚合可导入行 */
export function scopeRowsOfAgents(
  results: SyncAgentResult[],
  workspacePath: string | null,
  category: string,
): Array<{ scope: string; rows: Array<{ agent: SyncAgentResult; sourceRoot: SyncSourceRoot }> }> {
  return SYNC_SCOPES.map((scope) => ({
    scope,
    rows: results.flatMap((result) =>
      sourceRootsOfAgent(result, workspacePath, category)
        .filter((root) => root.scope === scope)
        .filter((root) => itemsOfCategory(root, category).some((item) => item.importable))
        .map((sourceRoot) => ({ agent: result, sourceRoot })),
    ),
  }));
}

/* ============================================================================
 * §6 迁移助手尾部（原 203426–203439；I2t 本体见 SettingsPanelsData.tsx 843）
 * ==========================================================================*/

/** 原 k2t（203426）：扫描条数缺省 */
export const MIGRATION_DEFAULT_LIMIT = 100;
/** 原 A2t（203427）：扫描条数上限 */
export const MIGRATION_MAX_LIMIT = 500;
/** 原 j2t（203428） */
export const MIGRATION_UNLIMITED = `unlimited`;
/** 原 M2t（203429）：范围 → 时长（7d=10080 分 / 30d=720 时 / 90d=2160 时，毫秒） */
export const MIGRATION_RANGE_DURATIONS: Record<string, number> = {
  "7d": 10080 * 60 * 1e3,
  "30d": 720 * 60 * 60 * 1e3,
  "90d": 2160 * 60 * 60 * 1e3,
};
/** 原 N2t（203430）：范围 → modifiedSince 时间戳（all → undefined） */
export function modifiedSinceOfRange(range: string): number | undefined {
  if (range !== `all`) return Date.now() - MIGRATION_RANGE_DURATIONS[range];
}
/** 原 P2t（203433）：unlimited → undefined；非法/≤0 → 缺省 100；上限 500 */
export function parseScanLimit(input: string): number | undefined {
  if (input === `unlimited`) return;
  const parsed = Number.parseInt(input.trim(), 10);
  return !Number.isFinite(parsed) || parsed <= 0 ? MIGRATION_DEFAULT_LIMIT : Math.min(parsed, MIGRATION_MAX_LIMIT);
}
/** 原 F2t（203437）：current 但无工作区路径 → 回退 all */
export function resolveWorkspaceFilterMode(mode: string, workspacePath: string | null): string {
  return mode === `current` && !workspacePath ? `all` : mode;
}

/* ============================================================================
 * 尾符号表（混淆名 → 语义名 → 本机 js 行）
 * ============================================================================
 *  §1：qQt 193351
 *  §2：N7 193380 | XQt 193384 | ZQt 193397 | QQt 193409
 *  §3：$Qt 193414 | P7 193440 | e$t 193444 | t$t 193447
 *  §4：n$t 193471 | F7 193474 | r$t 193477 | i$t 193494 | a$t 193525 | o$t 193528
 *  §5：s$t 193541 | I7 193583 | c$t 193586 | l$t 193587 | u$t 193588 | L7 193591
 *   d$t 193600 | f$t 193603 | p$t 193609 | m$t 193623
 *  §6：k2t 203426 | A2t 203427 | j2t 203428 | M2t 203429 | N2t 203430 | P2t 203433
 *   F2t 203437
 *  （JQt 193352 / YQt 193366 → SettingsLeaves；h$t 193634 / g$t 193637 / _$t 193640 /
 *    R7 193643 / z7 193730 / M7 193341 → SettingsPanels §8；I2t 203440 → SettingsPanelsData）
 * ============================================================================
 */
