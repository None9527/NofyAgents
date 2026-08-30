// A0-S4-4a: 自 modules/SettingsLeaves.tsx §B 插件深层叶子 原样迁入（组件单元；原文件现为薄 re-export shim）。
// 迁出体 = §0 声明群子集（toSorted/IconComponent/usePlatformService/pluginMentionMarkdown + S3c/Button tombstone）+ §B 全段（1354–3067）。导入路径按 components/settings/ 深度改指 ../../modules/ / ../ui/。
import * as React from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { AlertDialog as AlertDialogRoot } from '../ui/alert-dialog'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { Plus as IconPlus, Ellipsis as IconEllipsis, Trash2 as IconTrash, ExternalLink as IconExternalLink, RefreshCw as IconRefresh, CloudUpload as IconCloudUpload, Search as IconSearch, Settings as IconSettings, MessageSquarePlus as IconMessageSquarePlus, TriangleAlert as IconAlertTriangle, LoaderCircle as IconSpinner, FolderOpen as IconFolderOpen, Power as IconPower, Server as IconServer, Sparkle as IconSparkle, TerminalSquare as IconTerminalSquare, Bot as IconBot, Webhook as IconWebhook, ArrowUpRight as IconArrowUpRight } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0
import { Button, ChevronRight as IconChevronRight } from '../../modules/button';
import { SubagentBadge } from './SubagentLeaves';
import { Input } from '../../modules/ImeComposition';
import { AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, BackLinkButton, Switch } from '../../modules/Settings';
import { ResourceEnabledFilterSelect } from '../../modules/SettingsPanelsCapability';
import { usePluginsStore, type PluginService } from '../../modules/stores-workspace'; // A0-CLEANUP3 3b：useUninstallFlow 服务面具型
import { cn } from '../../modules/UtilsCn';
import { useZCodeIntl as useIntlContext } from '../../modules/I18n';
import { InfoTooltip as Tooltip } from '../../modules/UsageStatsUiParts'; // Ia
import { isComposingText as imeGuard } from '../../modules/ImeComposition'; // A
import { pluginMentionMarkdown } from '../composer/FileMentionDragHelpers'; // A1-R11：Dj（52138）转录改指（纯函数叶子，环安全）；调用点 1746 逐字不变
import { isHttpUrl as isHttpsUrl } from '../../modules/Composer'; // A1-R13：oV（64277）三归属收敛改指（canonical = Composer B4 区 isHttpUrl，bundle 唯一真身）；本地调用点 1246/1325 逐字不变。环安全：Composer 不反引本文件
/* ============================================================================
 * 0. 外部依赖的类型声明
 * ==========================================================================*/

/** ES2023 Array.toSorted（bundle 目标含 es2023；tsconfig lib 未含，按接口级补齐） */
declare global {
  interface Array<T> {
    toSorted(compareFn?: (a: T, b: T) => number): T[];
  }
}

/* --- 图标（lucide 风格；Sa=createLucideIcon 工厂，button chunk / 本 chunk 图标块） --- */
type IconComponent = React.FC<React.SVGProps<SVGSVGElement> & { size?: number }>;

/* ── tombstone（A0-S3c）：AlertDialogRoot、Dialog、DialogClose、DialogContent、DialogDescription、DialogFooter、DialogHeader、DialogTitle、DropdownMenu、DropdownMenuContent、DropdownMenuItem、DropdownMenuSeparator、DropdownMenuTrigger、ScrollAreaCorner、ScrollAreaRoot、ScrollAreaScrollbar、ScrollAreaThumb、ScrollAreaViewport declare 删除 → 真实 import（文件头导入块）；映射依据见 A0-S3c.report.md。 ── */
/* ── tombstone（A0-CLEANUP 族清理）：Button（原 X）declare 删除 → import { Button } from './button'。 ── */
declare function usePlatformService(): {
  openExternal(url: string): void;
  selectDirectory(): Promise<string | null>;
  canSelectFilePath?: boolean;
  getPathForFile?: (file: File) => string | null;
} | null; // l

/* ── tombstone（A1-R11）：declare pluginMentionMarkdown（原 Dj，js 52138——旧注 52090 为子族区段首行）删除，
 *    改经文件头 ../composer/FileMentionDragHelpers import 消费（本批逐字转录）。 ── */

/* ============================================================================
 * §B. 插件分区深层叶子（原 js 198144–199993）
 * ==========================================================================*/

export interface PluginListing {
  displayName?: string;
  displayNameI18n?: Record<string, string>;
  description?: string;
  descriptionI18n?: Record<string, string>;
  category?: string;
  author?: string;
  icon?: string;
  homepage?: string;
  privacyPolicy?: string;
  termsOfService?: string;
  heroImage?: string;
  examplePrompts?: string[];
  examplePromptsI18n?: Record<string, string[]>;
  version?: string;
  [key: string]: unknown;
}

export interface PluginItem {
  id: string;
  name: string;
  marketplace?: string; // A0-CLEANUP3 3b：与 SettingsPanelsCapability.PluginItem 对齐（可选），双向收敛
  installed?: boolean;
  restorable?: boolean;
  orphaned?: boolean;
  enabled?: boolean;
  listing?: PluginListing;
  summary?: { description?: string; version?: string; [key: string]: unknown };
  info?: {
    enabled?: boolean;
    author?: string;
    version?: string;
    description?: string;
    homepage?: string;
    source?: string;
    rootPath?: string; // A0-CLEANUP3 3b：按消费面（PluginDetail advanced 段）补足
    hookDetails?: PluginHookDetail[];
    components?: Array<{ kind: string; items: Array<{ name: string; description?: string }> }>;
    [key: string]: unknown;
  };
  installedMeta?: { version?: string; updateStatus?: string; installedAt?: string; description?: string; [key: string]: unknown };
  [key: string]: unknown;
}

export interface PluginStoreActions {
  operationId: string | null;
  togglingPluginId: string | null;
  onInstall: (item: PluginItem) => void;
  onOpenDetail: (pluginId: string) => void;
  onSetEnabled: (pluginId: string, enabled: boolean) => void;
  onUpdate: (pluginId: string) => void;
  onUninstall: (pluginId: string) => void;
}

/** 原 AV（65208 区，F08 提及域；接口级）：远程图标头像（失败回落拼图图标） */
declare const RemoteIconAvatar: React.FC<{ src?: string | null; className?: string; iconClassName?: string }>;

/** 原 r9（198144）：插件图标（listing.icon → 头像；缺省拼图） */
export function PluginIcon({ item, className, iconClassName }: { item: PluginItem; className?: string; iconClassName?: string }) {
  return <RemoteIconAvatar src={item.listing?.icon} className={className} iconClassName={iconClassName} />;
}

/** 原 i9（198171）：更新态判定 */
export function hasPluginUpdate(status: string | undefined): boolean {
  return status === "update-available" || status === "version-changed";
}

/** 原 W1t（198174）：可更新判定（非孤儿 ∧ 更新态） */
export function isPluginUpdatable(item: PluginItem): boolean {
  return !!(item && !item.orphaned && hasPluginUpdate(item.installedMeta?.updateStatus));
}

/** 原 G1t（198154）：i18n 文案按语言回退（精确 → 语言前缀 → 缺省） */
export function resolveLocalizedText(locale: string, fallback: string | undefined, i18n: Record<string, string> | undefined): string | undefined {
  if (i18n) {
    const exact = i18n[locale];
    if (exact) return exact;
    const prefix = locale.split("-")[0];
    if (prefix) {
      const prefixed = Object.entries(i18n).find(([key]) => key.split("-")[0] === prefix);
      if (prefixed?.[1]) return prefixed[1];
    }
  }
  return fallback;
}

/** 原 K1t（198165）：i18n 数组文案回退 */
export function resolveLocalizedList(locale: string, fallback: string[] | undefined, i18n: Record<string, string[]> | undefined): string[] | undefined {
  if (i18n) {
    const exact = i18n[locale];
    if (exact && exact.length > 0) return exact;
    const prefix = locale.split("-")[0];
    if (prefix) {
      const prefixed = Object.entries(i18n).find(([key]) => key.split("-")[0] === prefix);
      if (prefixed?.[1] && prefixed[1].length > 0) return prefixed[1];
    }
  }
  return fallback && fallback.length > 0 ? fallback : undefined;
}

/** 原 a9（198177）：显示名（i18n → listing → name） */
export function pluginDisplayName(item: PluginItem, locale: string): string {
  return resolveLocalizedText(locale, item.listing?.displayName, item.listing?.displayNameI18n) ?? item.name;
}

/** 原 o9（198180）：描述（summary → info → installedMeta；i18n 覆盖） */
export function pluginDescription(item: PluginItem, locale: string): string | undefined {
  return resolveLocalizedText(
    locale,
    item.summary?.description ?? item.info?.description ?? item.installedMeta?.description,
    item.listing?.descriptionI18n,
  );
}

/** 原 q1t（198187）：分类 i18n 表 */
export const PLUGIN_CATEGORY_I18N: Record<string, string> = {
  "developer-tools": "settings.plugins.store.category.developerTools",
  productivity: "settings.plugins.store.category.productivity",
  utilities: "settings.plugins.store.category.utilities",
  guides: "settings.plugins.store.category.guides",
  template: "settings.plugins.store.category.template",
  other: "settings.plugins.store.category.other",
};

/** 原 J1t（198199）：商店条目装配（可用 → 可恢复 → 已装三级；孤儿 = 市场不可用 ∧ cache 源 ∧ 市场缺失） */
export function buildStoreItems(args: {
  plugins: PluginItem[];
  installedPlugins: Array<{ id: string; [key: string]: unknown }>;
  marketplaces: Array<{ id: string; [key: string]: unknown }>;
  availablePlugins: Array<PluginItem & { installed?: boolean }>;
  restorableBuiltins: Array<PluginItem>;
  marketplaceAvailabilityKnown: boolean;
}): PluginItem[] {
  const infoById = new Map(args.plugins.map((plugin) => [plugin.id, plugin]));
  const installedById = new Map(args.installedPlugins.map((plugin) => [plugin.id, plugin]));
  const marketplaceIds = new Set(args.marketplaces.map((marketplace) => marketplace.id));
  const merged = new Map<string, PluginItem>();
  for (const available of args.availablePlugins) {
    const info = infoById.get(available.id);
    merged.set(available.id, {
      id: available.id,
      name: available.name,
      marketplace: available.marketplace,
      installed: available.installed || info !== undefined,
      restorable: false,
      orphaned: false,
      ...(available.listing ? { listing: available.listing } : {}),
      summary: available,
      ...(info ? { info } : {}),
      ...(installedById.get(available.id) ? { installedMeta: installedById.get(available.id) } : {}),
    });
  }
  for (const restorable of args.restorableBuiltins) {
    if (merged.has(restorable.id)) continue;
    merged.set(restorable.id, {
      id: restorable.id,
      name: restorable.name,
      marketplace: restorable.marketplace,
      installed: false,
      restorable: true,
      orphaned: false,
      ...(restorable.listing ? { listing: restorable.listing } : {}),
      summary: restorable,
    });
  }
  for (const plugin of args.plugins) {
    if (merged.has(plugin.id)) continue;
    merged.set(plugin.id, {
      id: plugin.id,
      name: plugin.name,
      marketplace: plugin.marketplace,
      installed: true,
      restorable: false,
      orphaned: args.marketplaceAvailabilityKnown && (plugin as { source?: string }).source === "cache" && !marketplaceIds.has(plugin.marketplace ?? ""), // A0-CLEANUP3 3b：marketplace 对齐为可选，运行期恒有值
      info: plugin,
      ...(installedById.get(plugin.id) ? { installedMeta: installedById.get(plugin.id) } : {}),
    });
  }
  return [...merged.values()];
}

/** 原 vr（src chunk `S`=_S）：官方市场判定 */
export function isOfficialMarketplace(marketplaceId: string): boolean {
  return ["zcode-plugins-official"].includes(marketplaceId);
}

/** 原 Y1t（198241）：精选条目收集（官方市场 featured 序） */
export function collectFeaturedItems(items: PluginItem[], marketplaces: Array<{ id: string; featured?: string[] }>): PluginItem[] {
  const byName = new Map<string, PluginItem>();
  for (const item of items) {
    if (!byName.has(item.name)) byName.set(item.name, item);
  }
  const featured: PluginItem[] = [];
  const seen = new Set<string>();
  for (const marketplace of marketplaces) {
    if (!isOfficialMarketplace(marketplace.id)) continue;
    for (const name of marketplace.featured ?? []) {
      const item = byName.get(name);
      if (item && !seen.has(item.id)) {
        seen.add(item.id);
        featured.push(item);
      }
    }
  }
  return featured;
}

/** 原 X1t（198254）：分类分组（other 恒末位） */
export function buildCategoryGroups(
  items: PluginItem[],
  locale: string,
  resolveCategoryLabel: (category: string) => string,
): Array<{ category: string; items: PluginItem[] }> {
  const byCategory = new Map<string, PluginItem[]>();
  for (const item of items) {
    const category = item.listing?.category?.trim() || "other";
    const bucket = byCategory.get(category) ?? [];
    bucket.push(item);
    byCategory.set(category, bucket);
  }
  const sortItems = (bucket: PluginItem[]) => bucket.toSorted((a, b) => pluginDisplayName(a, locale).localeCompare(pluginDisplayName(b, locale)));
  return [...byCategory.entries()]
    .map(([category, bucket]) => ({ category, items: sortItems(bucket) }))
    .toSorted((a, b) =>
      a.category === "other" ? 1 : b.category === "other" ? -1 : resolveCategoryLabel(a.category).localeCompare(resolveCategoryLabel(b.category)),
    );
}

/** 原 Z1t（198272）：搜索匹配（名/键/市场/显示名/描述/分类/作者） */
export function pluginSearchMatch(item: PluginItem, query: string, locale: string): boolean {
  return [
    item.name,
    item.id,
    item.marketplace,
    pluginDisplayName(item, locale),
    pluginDescription(item, locale) ?? "",
    item.listing?.category ?? "",
    item.listing?.author ?? "",
  ]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

/** 原 Q1t（198286）：已装排序（非 cache 源优先；cache 按安装时刻倒序） */
export function sortInstalledItems(items: PluginItem[], locale: string): PluginItem[] {
  return items.toSorted((a, b) => {
    const aLive = !!(a.info && a.info.source !== "cache");
    if (aLive !== !!(b.info && b.info.source !== "cache")) return aLive ? -1 : 1;
    const byName = () => pluginDisplayName(a, locale).localeCompare(pluginDisplayName(b, locale));
    if (aLive) return byName();
    const aInstalledAt = a.installedMeta?.installedAt ?? "";
    const bInstalledAt = b.installedMeta?.installedAt ?? "";
    return aInstalledAt === bInstalledAt ? byName() : bInstalledAt.localeCompare(aInstalledAt);
  });
}

/** 原 $1t（198297）：已装列表（行 = 图标/名/版本/来源徽章/更新徽章/描述/开关） */
export function PluginInstalledList({
  filteredPlugins,
  handlePluginEnabledChange,
  installedPluginMetaById,
  loading,
  onSelectPlugin,
  renderPluginSource,
  selectedPluginId,
  storeItemById,
  togglingPluginId,
}: {
  filteredPlugins: Array<{ id: string; name: string; version?: string; description?: string; enabled: boolean }>;
  handlePluginEnabledChange: (pluginId: string, enabled: boolean) => void;
  installedPluginMetaById: Map<string, { updateStatus?: string }>;
  loading: boolean;
  onSelectPlugin: (pluginId: string) => void;
  renderPluginSource: (item: { id: string; name: string }) => string;
  selectedPluginId: string | null;
  storeItemById: Map<string, PluginItem>;
  togglingPluginId: string | null;
}) {
  const { intl } = useIntlContext();
  return (
    <div className={cn("overflow-hidden rounded-xl border border-border", !loading && filteredPlugins.length === 0 ? "border-dashed" : "bg-card")} data-testid="plugin-store-installed-list">
      <div className="divide-y divide-border">
        {loading ? (
          <div className="px-4 py-3 text-ui-base text-foreground-subtle">{intl.formatMessage({ id: "common.loading" })}</div>
        ) : filteredPlugins.length === 0 ? (
          <div className="px-4 py-3 text-ui-base text-foreground-subtle">{intl.formatMessage({ id: "settings.plugins.empty" })}</div>
        ) : (
          filteredPlugins.map((plugin) => {
            const selected = plugin.id === selectedPluginId;
            const updateStatus = installedPluginMetaById.get(plugin.id)?.updateStatus;
            const storeItem = storeItemById.get(plugin.id) ?? { name: plugin.name } as PluginItem;
            return (
              <div
                key={plugin.id}
                data-testid="plugin-store-installed-row"
                data-plugin-id={plugin.id}
                className={cn(
                  "group/row grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-hover",
                  selected && "bg-selected",
                )}
              >
                <button type="button" className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 text-left" onClick={() => onSelectPlugin(plugin.id)}>
                  <PluginIcon item={storeItem} className="size-9" />
                  <div className="min-w-0">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <span className="min-w-0 truncate text-ui-base font-medium text-foreground">{plugin.name}</span>
                      {plugin.version ? <span className="shrink-0 text-ui-xs text-foreground-subtle">{"v"}{plugin.version}</span> : null}
                      <SubagentBadge>{renderPluginSource(plugin)}</SubagentBadge>
                      {hasPluginUpdate(updateStatus) ? (
                        <span className="inline-flex min-h-5 items-center rounded-md bg-secondary px-1.5 py-0.5 text-ui-base font-medium text-foreground-subtle">
                          {updateStatus === "update-available"
                            ? intl.formatMessage({ id: "settings.plugins.list.updateAvailable" })
                            : intl.formatMessage({ id: "settings.plugins.list.versionChanged" })}
                        </span>
                      ) : null}
                    </div>
                    {plugin.description ? (
                      <div className="mt-0.5 line-clamp-1 text-ui-base text-foreground-subtle">{plugin.description}</div>
                    ) : null}
                  </div>
                  <IconChevronRight className="size-4 shrink-0 text-foreground-subtlest transition-colors group-hover/row:text-foreground-subtle" aria-hidden="true" />
                </button>
                <Switch
                  data-testid="plugin-store-manage-enabled-switch"
                  data-plugin-id={plugin.id}
                  checked={plugin.enabled}
                  disabled={togglingPluginId === plugin.id}
                  onCheckedChange={(checked) => {
                    handlePluginEnabledChange(plugin.id, checked);
                  }}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export interface PluginHookDetail {
  event: string;
  matcher?: string;
  runnable?: boolean;
  command: string;
  args?: string[];
  timeoutMs?: number;
  timeout?: number;
  async?: boolean;
  shell?: string | boolean;
  statusMessage?: string;
  sourcePath: string;
}

/** 原 e0t（198413）：钩子明细列表（事件/匹配器/可运行徽章 + 命令/超时/异步/shell/来源） */
export function PluginHookDetailsList({ hooks }: { hooks: PluginHookDetail[] }) {
  const { intl } = useIntlContext();
  return (
    <div>
      <div className="mb-2 text-ui-xs font-medium text-foreground">{intl.formatMessage({ id: "settings.plugins.detail.hooks" })}</div>
      {hooks.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface px-3 py-2 text-ui-base text-foreground-subtle">
          {intl.formatMessage({ id: "settings.plugins.detail.none" })}
        </div>
      ) : (
        <div className="space-y-2">
          {hooks.map((hook, index) => (
            <div key={`${hook.event}-${hook.matcher ?? "default"}-${hook.command}-${index}`} className="min-w-0 space-y-2 rounded-lg border border-border bg-surface px-3 py-2">
              <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                <span className="inline-flex min-h-5 items-center rounded-md border border-border px-1.5 py-0.5 text-ui-base font-medium text-foreground-subtle font-mono">{hook.event}</span>
                <span className="inline-flex min-h-5 items-center rounded-md border border-border px-1.5 py-0.5 text-ui-base font-medium text-foreground-subtle">
                  {hook.matcher ?? intl.formatMessage({ id: "settings.plugins.detail.hook.defaultMatcher" })}
                </span>
                <span
                  className={cn(
                    "inline-flex min-h-5 items-center rounded-md px-1.5 py-0.5 text-ui-base font-medium",
                    hook.runnable ? "bg-secondary text-foreground-subtle" : "border border-border text-foreground-subtle",
                  )}
                >
                  {hook.runnable
                    ? intl.formatMessage({ id: "settings.plugins.detail.hook.runnable" })
                    : intl.formatMessage({ id: "settings.plugins.detail.hook.diagnosticOnly" })}
                </span>
              </div>
              <PluginDetailField label={intl.formatMessage({ id: "settings.plugins.detail.hook.command" })} value={hookCommandPreview(hook)} />
              <div className="grid gap-2 sm:grid-cols-2">
                {hook.timeoutMs === undefined ? null : (
                  <PluginDetailField label={intl.formatMessage({ id: "settings.plugins.detail.hook.timeoutMs" })} value={`${hook.timeoutMs}ms`} />
                )}
                {hook.timeout === undefined ? null : (
                  <PluginDetailField label={intl.formatMessage({ id: "settings.plugins.detail.hook.timeout" })} value={String(hook.timeout)} />
                )}
                {hook.async === undefined ? null : (
                  <PluginDetailField label={intl.formatMessage({ id: "settings.plugins.detail.hook.async" })} value={String(hook.async)} />
                )}
                {hook.shell === undefined ? null : (
                  <PluginDetailField label={intl.formatMessage({ id: "settings.plugins.detail.hook.shell" })} value={hook.shell === true ? "true" : hook.shell} />
                )}
                {hook.statusMessage ? (
                  <PluginDetailField label={intl.formatMessage({ id: "settings.plugins.detail.hook.statusMessage" })} value={hook.statusMessage} />
                ) : null}
              </div>
              <PluginDetailField label={intl.formatMessage({ id: "settings.plugins.detail.hook.sourcePath" })} value={hook.sourcePath} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** 原 s9（198520）：明细字段（小号标签 + 等宽值；值直渲为 React 子，布尔 false 不渲染，同源行为） */
export function PluginDetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="text-ui-xs text-foreground-subtle">{label}</div>
      <div className="mt-0.5 break-all font-mono text-ui-xs text-foreground">{value}</div>
    </div>
  );
}

/** 原 t0t（198531）：钩子命令预览（命令 + 参数） */
export function hookCommandPreview(hook: { command: string; args?: string[] }): string {
  return !hook.args || hook.args.length === 0 ? hook.command : `${hook.command} ${hook.args.join(" ")}`;
}

/** 原 n0t（198534）：信息行（带框标签 + 等宽值） */
export function PluginInfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-border bg-surface px-3 py-2">
      <div className="text-ui-xs text-foreground-subtle">{label}</div>
      <div className="mt-1 break-all font-mono text-ui-xs text-foreground">{value}</div>
    </div>
  );
}

/** 原 r0t（198544）：添加市场对话框（输入 + 目录选择/拖放 + IME 守卫） */
export function AddMarketplaceDialog({
  open,
  onOpenChange,
  onAddMarketplace,
  operationId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddMarketplace: (source: string) => Promise<boolean> | void;
  operationId: string | null;
}) {
  const { intl } = useIntlContext();
  const platform = usePlatformService();
  const canSelectFilePath = platform?.canSelectFilePath ?? false;
  const [source, setSource] = React.useState("");
  const [dragging, setDragging] = React.useState(false);
  const trimmed = source.trim();
  const pending = operationId === `marketplace:add:${trimmed}`;
  const composing = React.useRef(false);
  const submitting = React.useRef(false);
  const submit = async () => {
    if (trimmed.length === 0 || submitting.current) return;
    submitting.current = true;
    try {
      const ok = await onAddMarketplace(trimmed);
      if (ok) {
        setSource("");
        onOpenChange(false);
      }
    } finally {
      submitting.current = false;
    }
  };
  const chooseDirectory = async () => {
    if (!platform) return;
    try {
      const selected = await platform.selectDirectory();
      if (selected) setSource(selected);
    } catch {
      /* 取消选择 */
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="plugin-store-add-source-dialog"
        className={cn("w-[min(420px,calc(100vw-2rem))] max-w-none gap-3 transition-colors", canSelectFilePath && dragging ? "border-border-hover bg-surface-hover" : "")}
        onDragOver={
          canSelectFilePath
            ? (event: React.DragEvent) => {
                event.preventDefault();
                setDragging(true);
              }
            : undefined
        }
        onDragLeave={
          canSelectFilePath
            ? (event: React.DragEvent) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false);
              }
            : undefined
        }
        onDrop={
          canSelectFilePath
            ? (event: React.DragEvent) => {
                event.preventDefault();
                setDragging(false);
                const file = event.dataTransfer.files[0];
                if (!file) return;
                const path = platform?.getPathForFile?.(file)?.trim();
                if (path) setSource(path);
              }
            : undefined
        }
      >
        <DialogTitle className="text-ui-base font-medium text-foreground">{intl.formatMessage({ id: "settings.plugins.marketplaces.add" })}</DialogTitle>
        <Input
          type="text"
          data-testid="plugin-store-add-source-input"
          size="lg"
          className="h-9 rounded-lg"
          autoFocus
          aria-label={intl.formatMessage({ id: "settings.plugins.marketplaces.source" })}
          value={source}
          onChange={(event) => setSource(event.target.value)}
          onCompositionStart={() => {
            composing.current = true;
          }}
          onCompositionEnd={() => {
            composing.current = false;
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !imeGuard({ compositionActive: composing.current, nativeEvent: event.nativeEvent })) {
              event.preventDefault();
              void submit();
            }
          }}
          placeholder={intl.formatMessage({ id: "settings.plugins.marketplaces.source" })}
        />
        {canSelectFilePath ? (
          <p className="text-ui-xs text-foreground-subtle">{intl.formatMessage({ id: "settings.plugins.marketplaces.dropHint" })}</p>
        ) : null}
        <div className="flex justify-end gap-2">
          {canSelectFilePath ? (
            <Button type="button" variant="outline" size="sm" onClick={() => void chooseDirectory()}>
              <IconFolderOpen className="size-3" aria-hidden="true" />
              {intl.formatMessage({ id: "settings.plugins.marketplaces.chooseDirectory" })}
            </Button>
          ) : null}
          <Button type="button" data-testid="plugin-store-add-source-submit" variant="default" size="sm" disabled={trimmed.length === 0 || pending} onClick={() => void submit()}>
            {pending ? <IconSpinner className="size-3 animate-spin" aria-hidden="true" /> : <IconPlus className="size-3" aria-hidden="true" />}
            {intl.formatMessage({ id: "settings.plugins.marketplaces.add" })}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（1）：IconFolderOpen → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */

/** 原 i0t（198670）：插件忙碌判定（安装/恢复/卸载/更新/开关五态） */
export function isPluginBusy(item: PluginItem, actions: PluginStoreActions): boolean {
  return (
    actions.operationId === `plugin:install:${item.name}@${item.marketplace}` ||
    actions.operationId === `plugin:restore:${item.id}` ||
    actions.operationId === `plugin:uninstall:${item.id}` ||
    actions.operationId === `plugin:update:${item.id}` ||
    actions.togglingPluginId === item.id
  );
}

/** 原 a0t（198679）：详情头启用开关 */
export function PluginEnabledSwitch({ item, actions }: { item: PluginItem; actions: PluginStoreActions }) {
  const { intl } = useIntlContext();
  if (!item.info) return null;
  const enabled = item.info.enabled;
  return (
    <Switch
      data-testid="plugin-store-enabled-switch"
      data-plugin-id={item.id}
      checked={enabled ?? false}
      disabled={actions.togglingPluginId === item.id}
      aria-label={enabled ? intl.formatMessage({ id: "settings.plugins.store.menu.disable" }) : intl.formatMessage({ id: "settings.plugins.store.menu.enable" })}
      onClick={(event: React.MouseEvent) => event.stopPropagation()}
      onCheckedChange={(checked) => actions.onSetEnabled(item.id, checked)}
    />
  );
}

/** 原 o0t（198695）：插件行菜单（启用/更新/卸载；忙碌 → spinner） */
export function PluginItemMenu({ item, actions, triggerClassName }: { item: PluginItem; actions: PluginStoreActions; triggerClassName?: string }) {
  const { intl } = useIntlContext();
  const enabled = item.info?.enabled ?? false;
  const updatable = isPluginUpdatable(item);
  const busy = isPluginBusy(item, actions);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          data-testid="plugin-store-item-menu"
          data-plugin-id={item.id}
          variant="ghost"
          size="icon-md"
          className={triggerClassName}
          aria-label={intl.formatMessage({ id: "settings.plugins.store.menu.label" })}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => event.stopPropagation()}
        >
          {busy ? <IconSpinner className="size-4 animate-spin" aria-hidden="true" /> : <IconEllipsis className="size-4" aria-hidden="true" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
        {item.info ? (
          <DropdownMenuItem data-testid="plugin-store-menu-enabled" data-plugin-id={item.id} disabled={busy} onSelect={() => actions.onSetEnabled(item.id, !enabled)}>
            <IconPower className="size-4" aria-hidden="true" />
            {enabled ? intl.formatMessage({ id: "settings.plugins.store.menu.disable" }) : intl.formatMessage({ id: "settings.plugins.store.menu.enable" })}
          </DropdownMenuItem>
        ) : null}
        {updatable ? (
          <DropdownMenuItem data-testid="plugin-store-menu-update" data-plugin-id={item.id} disabled={busy} onSelect={() => actions.onUpdate(item.id)}>
            <IconRefresh className="size-4" aria-hidden="true" />
            {intl.formatMessage({ id: "settings.plugins.detail.update" })}
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem data-testid="plugin-store-menu-uninstall" data-plugin-id={item.id} variant="destructive" disabled={busy} onSelect={() => actions.onUninstall(item.id)}>
          <IconTrash className="size-4" aria-hidden="true" />
          {intl.formatMessage({ id: "settings.plugins.detail.uninstall" })}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（1）：IconPower → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */

/** 原 s0t（198765）：安装按钮（安装/恢复忙碌态） */
export function PluginInstallButton({ item, actions, size = "sm" }: { item: PluginItem; actions: PluginStoreActions; size?: string }) {
  const { intl } = useIntlContext();
  const busy = actions.operationId === `plugin:install:${item.name}@${item.marketplace}` || actions.operationId === `plugin:restore:${item.id}`;
  return (
    <Button
      type="button"
      data-testid="plugin-store-install"
      data-plugin-id={item.id}
      variant="secondary"
      size={size}
      className="rounded-full"
      disabled={busy}
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        actions.onInstall(item);
      }}
    >
      {busy ? <IconSpinner className="size-3.5 animate-spin" aria-hidden="true" /> : null}
      {busy ? intl.formatMessage({ id: "settings.plugins.marketplace.installing" }) : intl.formatMessage({ id: "settings.plugins.store.install" })}
    </Button>
  );
}

/** 原 c0t（198789）：商店卡片（图标 + 名 + 孤儿警示 + 描述 + 安装/菜单） */
export function PluginStoreCard({ item, actions, locale }: { item: PluginItem; actions: PluginStoreActions; locale: string }) {
  const { intl } = useIntlContext();
  const displayName = pluginDisplayName(item, locale);
  const description = pluginDescription(item, locale);
  return (
    <div
      role="button"
      tabIndex={0}
      data-testid="plugin-store-card"
      data-plugin-id={item.id}
      className="group/card flex min-w-0 cursor-pointer items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused"
      onClick={() => actions.onOpenDetail(item.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          actions.onOpenDetail(item.id);
        }
      }}
    >
      <PluginIcon item={item} className="size-10" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-ui-base font-semibold text-foreground">{displayName}</div>
        {item.orphaned ? (
          <div data-testid="plugin-store-source-degraded" data-plugin-id={item.id} className="mt-0.5 flex items-center gap-1 truncate text-ui-sm text-warning">
            <IconAlertTriangle className="size-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{intl.formatMessage({ id: "settings.plugins.store.sourceMissing" })}</span>
          </div>
        ) : null}
        {description ? <div className="mt-0.5 truncate text-ui-base text-foreground-subtle">{description}</div> : null}
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {item.installed ? <PluginItemMenu item={item} actions={actions} /> : <PluginInstallButton item={item} actions={actions} />}
      </div>
    </div>
  );
}

/** 原 l0t（198843）：精选配置（官方市场 + 6 插件名；注释逐字） */
export const PLUGIN_RECOMMENDED_CONFIG = {
  $comment:
    "客户端精选的「推荐」插件列表。来源仍是官方市场 (marketplace)，这里只挑选要在 Recommend 区置顶展示的插件名 (按 plugin name 匹配官方目录)。初期清单可在此直接增删，无需改动数据层。",
  marketplace: "claude-plugins-official",
  pluginNames: ["context7", "code-review", "playwright", "feature-dev", "commit-commands", "superpowers"],
};
const RECOMMENDED_MARKETPLACE = PLUGIN_RECOMMENDED_CONFIG.marketplace;
const RECOMMENDED_PLUGIN_NAMES = PLUGIN_RECOMMENDED_CONFIG.pluginNames;

/** 原 d0t（198857）：按配置序挑选推荐条目（名称去重） */
export function pickRecommendedItems(items: PluginItem[], names: string[] = RECOMMENDED_PLUGIN_NAMES): PluginItem[] {
  const byName = new Map<string, PluginItem>();
  for (const item of items) {
    const key = item.name.toLowerCase();
    if (!byName.has(key)) byName.set(key, item);
  }
  const picked: PluginItem[] = [];
  for (const name of names) {
    const item = byName.get(name.toLowerCase());
    if (item) picked.push(item);
  }
  return picked;
}

/** 原 f0t/l9/p0t（198870–198878）：cache 来源标签（官方市场 → 固定文案） */
const PLUGIN_CACHE_SOURCE = "cache";
export function resolveMarketplaceLabel(
  marketplaceId: string,
  marketplaces: Array<{ id: string; name?: string }>,
  claudeCodePluginsLabel: string,
): string {
  return marketplaceId === RECOMMENDED_MARKETPLACE ? claudeCodePluginsLabel : marketplaces.find((marketplace) => marketplace.id === marketplaceId)?.name ?? marketplaceId;
}
export function formatPluginSourceLabel(args: {
  source: string;
  marketplace: string;
  marketplaces: Array<{ id: string; name?: string }>;
  claudeCodePluginsLabel: string;
  builtinLabel: string;
  formatFromMarketplace: (label: string) => string;
}): string {
  if (args.source !== PLUGIN_CACHE_SOURCE) return args.builtinLabel;
  const label = resolveMarketplaceLabel(args.marketplace, args.marketplaces, args.claudeCodePluginsLabel);
  return args.formatFromMarketplace(label);
}

/** 原 u9（198879）：分组折叠缺省条数 */
export const PLUGIN_GROUP_COLLAPSED_COUNT = 6;

/** 原 m0t（198880）：PluginStoreGrid（搜索 + 已装条 + 公共/个人双段） */
export function PluginStoreGrid({
  items,
  marketplaces,
  actions,
  loading,
  query,
  onQueryChange,
  segment,
  onSegmentChange,
  onOpenManage,
}: {
  items: PluginItem[];
  marketplaces: Array<{ id: string; name?: string; featured?: string[] }>;
  actions: PluginStoreActions;
  loading: boolean;
  query: string;
  onQueryChange: (query: string) => void;
  segment: string;
  onSegmentChange: (segment: string) => void;
  onOpenManage: () => void;
}) {
  const { intl, locale } = useIntlContext();
  const normalizedQuery = query.trim().toLowerCase();
  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({});
  const installedStrip = React.useMemo(() => sortInstalledItems(items.filter((item) => item.installed), locale), [items, locale]);
  const publicItems = React.useMemo(() => items.filter((item) => isOfficialMarketplace(item.marketplace ?? "")), [items]); // A0-CLEANUP3 3b：marketplace 对齐为可选，运行期恒有值
  const personalItems = React.useMemo(() => items.filter((item) => !isOfficialMarketplace(item.marketplace ?? "")), [items]);
  const resolveCategoryLabel = React.useMemo(
    () => (category: string) => {
      const i18nId = PLUGIN_CATEGORY_I18N[category];
      return i18nId ? intl.formatMessage({ id: i18nId }) : category;
    },
    [intl],
  );
  const featuredItems = React.useMemo(() => collectFeaturedItems(publicItems, marketplaces), [marketplaces, publicItems]);
  const categoryGroups = React.useMemo(() => buildCategoryGroups(publicItems, locale, resolveCategoryLabel), [locale, publicItems, resolveCategoryLabel]);
  const recommendedItems = React.useMemo(() => {
    const summaries = new Map(personalItems.filter((item) => item.marketplace === RECOMMENDED_MARKETPLACE && item.summary).map((item) => [item.id, item]));
    return pickRecommendedItems([...summaries.values()].flatMap((item) => (item.summary ? [item as PluginItem] : []))).flatMap((picked) => {
      const entry = summaries.get(picked.id);
      return entry ? [entry] : [];
    });
  }, [personalItems]);
  const personalGroups = React.useMemo(() => {
    const claudeLabel = intl.formatMessage({ id: "settings.plugins.marketplace.claudeCodePlugins" });
    const byMarketplace = new Map<string, PluginItem[]>();
    for (const item of personalItems) {
      const bucket = byMarketplace.get(item.marketplace ?? "") ?? []; // A0-CLEANUP3 3b：marketplace 对齐为可选，运行期恒有值
      bucket.push(item);
      byMarketplace.set(item.marketplace ?? "", bucket);
    }
    return [...byMarketplace.entries()]
      .map(([marketplaceId, bucket]) => ({
        key: `marketplace:${marketplaceId}`,
        title: resolveMarketplaceLabel(marketplaceId, marketplaces, claudeLabel),
        items: bucket.toSorted((a, b) => pluginDisplayName(a, locale).localeCompare(pluginDisplayName(b, locale))),
      }))
      .toSorted((a, b) => a.title.localeCompare(b.title));
  }, [intl, locale, marketplaces, personalItems]);
  const searchResults = React.useMemo(
    () => (normalizedQuery ? items.filter((item) => pluginSearchMatch(item, normalizedQuery, locale)).toSorted((a, b) => pluginDisplayName(a, locale).localeCompare(pluginDisplayName(b, locale))) : []),
    [items, normalizedQuery, locale],
  );
  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((previous) => ({ ...previous, [groupKey]: !previous[groupKey] }));
  };
  return (
    <div className="space-y-8" data-testid="plugin-store-list">
      <div className="relative">
        <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-foreground-subtlest" aria-hidden="true" />
        <Input
          type="text"
          data-testid="plugin-store-search"
          size="lg"
          className="h-11 rounded-2xl pl-10"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={intl.formatMessage({ id: "settings.plugins.store.searchPlaceholder" })}
        />
      </div>
      {installedStrip.length > 0 ? (
        <section data-testid="plugin-store-installed-strip">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h2 className="text-ui-lg font-semibold text-foreground">{intl.formatMessage({ id: "settings.plugins.store.installedStrip" })}</h2>
            <Tooltip title={intl.formatMessage({ id: "settings.plugins.store.manageInstalled" })}>
              <Button
                type="button"
                data-testid="plugin-store-manage-open"
                variant="ghost"
                size="icon-md"
                aria-label={intl.formatMessage({ id: "settings.plugins.store.manageInstalled" })}
                onClick={onOpenManage}
              >
                <IconSettings className="size-4" aria-hidden="true" />
              </Button>
            </Tooltip>
          </div>
          <div className="mt-3 flex items-center gap-3 overflow-x-auto pb-1">
            {installedStrip.map((item) => {
              const displayName = pluginDisplayName(item, locale);
              return (
                <Tooltip key={item.id} title={displayName} side="top">
                  <button
                    type="button"
                    data-testid="plugin-store-installed-item"
                    data-plugin-id={item.id}
                    aria-label={displayName}
                    className="shrink-0 rounded-xl transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused"
                    onClick={() => actions.onOpenDetail(item.id)}
                  >
                    <PluginIcon item={item} className="size-10" />
                  </button>
                </Tooltip>
              );
            })}
          </div>
        </section>
      ) : null}
      <div className="flex items-center gap-1.5">
        <PluginStoreSegmentButton
          active={segment === "public"}
          testId="plugin-store-segment-public"
          label={intl.formatMessage({ id: "settings.plugins.store.segment.public" })}
          onClick={() => onSegmentChange("public")}
        />
        <PluginStoreSegmentButton
          active={segment === "personal"}
          testId="plugin-store-segment-personal"
          label={intl.formatMessage({ id: "settings.plugins.store.segment.personal" })}
          onClick={() => onSegmentChange("personal")}
        />
      </div>
      {normalizedQuery ? (
        <PluginStoreSection
          key="search"
          title={intl.formatMessage({ id: "settings.plugins.store.searchResults" }, { count: String(searchResults.length) })}
        >
          {searchResults.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-4 py-3 text-ui-base text-foreground-subtle">
              {intl.formatMessage({ id: "settings.plugins.store.searchEmpty" })}
            </p>
          ) : (
            <PluginCardGrid items={searchResults} actions={actions} locale={locale} />
          )}
        </PluginStoreSection>
      ) : segment === "public" ? (
        <PluginStorePublicView
          actions={actions}
          categoryGroups={categoryGroups}
          expandedGroups={expandedGroups}
          featuredItems={featuredItems}
          loading={loading}
          locale={locale}
          resolveCategoryLabel={resolveCategoryLabel}
          onToggleGroup={toggleGroup}
        />
      ) : (
        <PluginStorePersonalView actions={actions} expandedGroups={expandedGroups} groups={personalGroups} locale={locale} recommendedItems={recommendedItems} onToggleGroup={toggleGroup} />
      )}
    </div>
  );
}

/** 原 h0t（199075）：段按钮 */
export function PluginStoreSegmentButton({ active, label, onClick, testId }: { active: boolean; label: string; onClick: () => void; testId: string }) {
  return (
    <button
      type="button"
      data-testid={testId}
      aria-pressed={active}
      className={cn(
        "rounded-full px-3 py-1 text-ui-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused",
        active ? "bg-selected text-foreground" : "text-foreground-subtle hover:bg-hover hover:text-foreground",
      )}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

/** 原 d9（199090）：分区（标题 + 分隔 + 内容） */
export function PluginStoreSection({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={className}>
      <div className="pb-2">
        <h2 className="text-ui-lg font-semibold text-foreground">{title}</h2>
      </div>
      <div aria-hidden="true" className="h-px bg-surface" />
      <div className="mt-2">{children}</div>
    </section>
  );
}

/** 原 f9（199106）：卡片网格（双列） */
export function PluginCardGrid({ items, actions, locale }: { items: PluginItem[]; actions: PluginStoreActions; locale: string }) {
  return (
    <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
      {items.map((item) => (
        <PluginStoreCard key={item.id} item={item} actions={actions} locale={locale} />
      ))}
    </div>
  );
}

/** 原 g0t（199112）：分组（折叠 6 条 + 查看更多/收起；更多行显示前 3 图标 + 前 2 名） */
export function PluginStoreGroup({
  groupKey,
  items,
  expanded,
  onToggle,
  actions,
  locale,
}: {
  groupKey: string;
  items: PluginItem[];
  expanded: boolean;
  onToggle: (groupKey: string) => void;
  actions: PluginStoreActions;
  locale: string;
}) {
  const { intl } = useIntlContext();
  const visible = expanded ? items : items.slice(0, PLUGIN_GROUP_COLLAPSED_COUNT);
  const hidden = expanded ? [] : items.slice(PLUGIN_GROUP_COLLAPSED_COUNT);
  const hiddenNames = hidden.slice(0, 2).map((item) => pluginDisplayName(item, locale));
  return (
    <div>
      <PluginCardGrid items={visible} actions={actions} locale={locale} />
      {hidden.length > 0 ? (
        <button
          type="button"
          data-testid="plugin-store-group-toggle"
          data-group-key={groupKey}
          className="mt-2 flex w-full min-w-0 items-center gap-2 rounded-xl px-2 py-2 text-left text-ui-base text-foreground-subtle transition-colors hover:bg-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused"
          onClick={() => onToggle(groupKey)}
        >
          <span className="flex shrink-0 items-center gap-1.5" aria-hidden="true">
            {hidden.slice(0, 3).map((item) => (
              <PluginIcon key={item.id} item={item} className="size-5 rounded-md" iconClassName="size-2.5" />
            ))}
          </span>
          <span className="min-w-0 truncate">
            {hidden.length > hiddenNames.length
              ? intl.formatMessage(
                  { id: "settings.plugins.store.viewMore" },
                  { names: hiddenNames.join(intl.formatMessage({ id: "common.listSeparator" })), count: String(hidden.length - hiddenNames.length) },
                )
              : intl.formatMessage({ id: "settings.plugins.store.viewMoreFew" }, { names: hiddenNames.join(intl.formatMessage({ id: "common.listSeparator" })) })}
          </span>
        </button>
      ) : expanded && items.length > PLUGIN_GROUP_COLLAPSED_COUNT ? (
        <button
          type="button"
          data-testid="plugin-store-group-toggle"
          data-group-key={groupKey}
          className="mt-2 rounded-xl px-2 py-2 text-ui-base text-foreground-subtle transition-colors hover:bg-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused"
          onClick={() => onToggle(groupKey)}
        >
          {intl.formatMessage({ id: "settings.plugins.store.showLess" })}
        </button>
      ) : null}
    </div>
  );
}

/** 原 _0t（199172）：公共段视图（精选 + 分类组；空态双分支） */
export function PluginStorePublicView({
  actions,
  categoryGroups,
  expandedGroups,
  featuredItems,
  loading,
  locale,
  resolveCategoryLabel,
  onToggleGroup,
}: {
  actions: PluginStoreActions;
  categoryGroups: Array<{ category: string; items: PluginItem[] }>;
  expandedGroups: Record<string, boolean>;
  featuredItems: PluginItem[];
  loading: boolean;
  locale: string;
  resolveCategoryLabel: (category: string) => string;
  onToggleGroup: (groupKey: string) => void;
}) {
  const { intl } = useIntlContext();
  return featuredItems.length === 0 && categoryGroups.length === 0 ? (
    <p className="rounded-xl border border-dashed border-border px-4 py-3 text-ui-base text-foreground-subtle">
      {loading ? intl.formatMessage({ id: "settings.plugins.marketplace.catalogLoading" }) : intl.formatMessage({ id: "settings.plugins.marketplacePlugins.empty" })}
    </p>
  ) : (
    <div>
      {featuredItems.length > 0 ? (
        <PluginStoreSection title={intl.formatMessage({ id: "settings.plugins.store.featured" })} className="py-4 first:pt-0 last:pb-0">
          <PluginCardGrid items={featuredItems} actions={actions} locale={locale} />
        </PluginStoreSection>
      ) : null}
      {categoryGroups.map((group) => (
        <PluginStoreSection
          key={group.category}
          className="py-4 first:pt-0 last:pb-0"
          title={group.category === "other" ? intl.formatMessage({ id: "settings.plugins.store.category.other" }) : resolveCategoryLabel(group.category)}
        >
          <PluginStoreGroup
            groupKey={`category:${group.category}`}
            items={group.items}
            expanded={expandedGroups[`category:${group.category}`] ?? false}
            onToggle={onToggleGroup}
            actions={actions}
            locale={locale}
          />
        </PluginStoreSection>
      ))}
    </div>
  );
}

/** 原 v0t（199223）：个人段视图（推荐 + 市场组） */
export function PluginStorePersonalView({
  actions,
  expandedGroups,
  groups,
  locale,
  recommendedItems,
  onToggleGroup,
}: {
  actions: PluginStoreActions;
  expandedGroups: Record<string, boolean>;
  groups: Array<{ key: string; title: string; items: PluginItem[] }>;
  locale: string;
  recommendedItems: PluginItem[];
  onToggleGroup: (groupKey: string) => void;
}) {
  const { intl } = useIntlContext();
  return recommendedItems.length === 0 && groups.length === 0 ? (
    <p className="rounded-xl border border-dashed border-border px-4 py-3 text-ui-base text-foreground-subtle">
      {intl.formatMessage({ id: "settings.plugins.store.personalEmpty" })}
    </p>
  ) : (
    <div>
      {recommendedItems.length > 0 ? (
        <PluginStoreSection title={intl.formatMessage({ id: "settings.plugins.marketplace.recommendTitle" })} className="py-4 first:pt-0 last:pb-0">
          <PluginCardGrid items={recommendedItems} actions={actions} locale={locale} />
        </PluginStoreSection>
      ) : null}
      {groups.map((group) => (
        <PluginStoreSection key={group.key} title={group.title} className="py-4 first:pt-0 last:pb-0">
          <PluginStoreGroup groupKey={group.key} items={group.items} expanded={expandedGroups[group.key] ?? false} onToggle={onToggleGroup} actions={actions} locale={locale} />
        </PluginStoreSection>
      ))}
    </div>
  );
}

/** 原 y0t/b0t/x0t（199267）：组件段序/标题/图标 */
const PLUGIN_COMPONENT_KIND_ORDER = ["mcp", "skill", "command", "agent", "hook"];
const PLUGIN_COMPONENT_KIND_I18N: Record<string, string> = {
  mcp: "settings.plugins.store.section.mcp",
  skill: "settings.plugins.store.section.skills",
  command: "settings.plugins.store.section.commands",
  agent: "settings.plugins.store.section.agents",
  hook: "settings.plugins.store.section.hooks",
};
const PLUGIN_COMPONENT_KIND_ICONS: Record<string, IconComponent> = {
  mcp: IconServer,
  skill: IconSparkle,
  command: IconTerminalSquare,
  agent: IconBot,
  hook: IconWebhook,
};
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（5）：IconServer/IconSparkle/IconTerminalSquare/IconBot/IconWebhook → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */

export interface PluginDescribeEntry {
  status: "loading" | "loaded" | "error";
  data?: {
    metadata?: { author?: string; category?: string; version?: string; homepage?: string; privacyPolicy?: string; termsOfService?: string };
    components?: Array<{ kind: string; items: Array<{ name: string; description?: string }> }>;
    [key: string]: unknown;
  };
}

/**
 * 原 S0t（199276）：PluginDetail。
 * 返回 + 图标/名/描述/孤儿警示 + 操作簇（开关/菜单/立即体验 | 安装）+ 英雄区 + 组件段 + 信息区 + 高级插槽。
 */
export function PluginDetail({
  item,
  actions,
  describeEntry,
  onBack,
  onRetryDescribe,
  onUsePrompt,
  advanced,
}: {
  item: PluginItem;
  actions: PluginStoreActions;
  describeEntry?: PluginDescribeEntry;
  onBack: () => void;
  onRetryDescribe: () => void;
  onUsePrompt: (item: PluginItem, prompt?: string) => void;
  advanced?: React.ReactNode;
}) {
  const { intl, locale } = useIntlContext();
  const displayName = pluginDisplayName(item, locale);
  const description = pluginDescription(item, locale);
  const heroImage = item.listing?.heroImage;
  const examplePrompts = resolveLocalizedList(locale, item.listing?.examplePrompts, item.listing?.examplePromptsI18n) ?? [];
  const describeMetadata = describeEntry?.status === "loaded" ? describeEntry.data?.metadata : undefined;
  const components = item.info ? extractComponentsFromInfo(item.info) : describeEntry?.status === "loaded" && describeEntry.data ? extractComponentsFromDescribe(describeEntry.data) : [];
  const orderedComponents = PLUGIN_COMPONENT_KIND_ORDER.map((kind) => components.find((component) => component.kind === kind)).filter(
    (component): component is { kind: string; count: number; items: Array<{ name: string; description?: string }> } => component !== undefined,
  );
  const componentsLoading = !item.info && (describeEntry?.status ?? "loading") === "loading";
  const componentsError = !item.info && describeEntry?.status === "error";
  return (
    <div className="space-y-8" data-testid="plugin-store-detail" data-plugin-id={item.id}>
      <div>
        <BackLinkButton data-testid="plugin-store-detail-back" onClick={onBack}>
          {intl.formatMessage({ id: "settings.plugins.store.back" })}
        </BackLinkButton>
      </div>
      <div className="space-y-3">
        <PluginIcon item={item} className="size-16 rounded-2xl" iconClassName="size-6" />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{displayName}</h1>
            {description ? <p className="mt-1 text-ui-base text-foreground-subtle">{description}</p> : null}
            {item.orphaned ? (
              <p data-testid="plugin-store-source-degraded" data-plugin-id={item.id} className="mt-2 flex items-center gap-1.5 text-ui-base text-warning">
                <IconAlertTriangle className="size-3.5 shrink-0" aria-hidden="true" />
                {intl.formatMessage({ id: "settings.plugins.store.sourceMissing" })}
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-1.5 pt-1">
            {item.installed ? (
              <>
                {item.info ? <PluginEnabledSwitch item={item} actions={actions} /> : null}
                <PluginItemMenu item={item} actions={actions} />
                <Button type="button" variant="default" size="sm" className="rounded-full" data-testid="plugin-store-try-now" data-plugin-id={item.id} onClick={() => onUsePrompt(item, "")}>
                  <IconMessageSquarePlus className="size-3.5" aria-hidden="true" />
                  {intl.formatMessage({ id: "settings.plugins.store.tryNow" })}
                </Button>
              </>
            ) : (
              <PluginInstallButton item={item} actions={actions} size="default" />
            )}
          </div>
        </div>
      </div>
      {isHttpsUrl(heroImage) || examplePrompts.length > 0 ? (
        <MarketEntryCard item={item} displayName={displayName} examplePrompts={examplePrompts} heroImage={heroImage} onUsePrompt={onUsePrompt} />
      ) : null}
      {componentsLoading ? (
        <div className="flex items-center gap-2 py-2 text-ui-base text-foreground-subtle" data-testid="plugin-store-components-loading">
          <IconSpinner className="size-3.5 animate-spin" aria-hidden="true" />
          <span>{intl.formatMessage({ id: "settings.plugins.marketplace.componentsLoading" })}</span>
        </div>
      ) : componentsError ? (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-warning/30 bg-warning/10 px-3 py-2 text-ui-base text-foreground-subtle" data-testid="plugin-store-components-error">
          <span>{intl.formatMessage({ id: "settings.plugins.marketplace.componentsError" })}</span>
          <Button type="button" variant="outline" size="sm" data-testid="plugin-store-components-retry" onClick={onRetryDescribe}>
            <IconRefresh className="size-3" aria-hidden="true" />
            {intl.formatMessage({ id: "settings.plugins.marketplace.componentsRetry" })}
          </Button>
        </div>
      ) : (
        orderedComponents.map((component) => <PluginComponentSection key={component.kind} group={component} />)
      )}
      <PluginDetailInfo item={item} describeMetadata={describeMetadata} />
      {advanced}
    </div>
  );
}

/** Settings.tsx 已抽取：返回链接按钮 */

/** 原 YQt（193070）：info.components → 组件摘要 */
export function extractComponentsFromInfo(info: NonNullable<PluginItem["info"]>): Array<{ kind: string; count: number; items: Array<{ name: string; description?: string }> }> {
  const byKind = new Map<string, { kind: string; count: number; items: Array<{ name: string; description?: string }> }>();
  for (const component of info.components ?? []) {
    if (component.items.length === 0) continue;
    byKind.set(component.kind, {
      kind: component.kind,
      count: component.items.length,
      items: component.items.map((entry) => ({ name: entry.name, ...(entry.description ? { description: entry.description } : {}) })),
    });
  }
  return ["agent", "command", "skill", "hook", "mcp"].map((kind) => byKind.get(kind)).filter((entry): entry is NonNullable<typeof entry> => entry !== undefined);
}

/** 原 JQt（193056）：describe.components → 组件摘要（同构） */
export function extractComponentsFromDescribe(data: { components?: Array<{ kind: string; items: Array<{ name: string; description?: string }> }> }): Array<{
  kind: string;
  count: number;
  items: Array<{ name: string; description?: string }>;
}> {
  const byKind = new Map<string, { kind: string; count: number; items: Array<{ name: string; description?: string }> }>();
  for (const component of data.components ?? []) {
    if (component.items.length === 0) continue;
    byKind.set(component.kind, {
      kind: component.kind,
      count: component.items.length,
      items: component.items.map((entry) => ({ name: entry.name, ...(entry.description ? { description: entry.description } : {}) })),
    });
  }
  return ["agent", "command", "skill", "hook", "mcp"].map((kind) => byKind.get(kind)).filter((entry): entry is NonNullable<typeof entry> => entry !== undefined);
}

/* ── tombstone（A1-R13）：export function isHttpsUrl（原 oV，64277；旧注 64229 行漂移）删除 →
 *    文件头 ../../modules/Composer import 别名消费（canonical = isHttpUrl，bundle 唯一真身，
 *    位 B4 提及节点块 64277；本文件调用点逐字不变，SettingsLeaves re-export 面经下方再导出维持）。 ── */
export { isHttpsUrl };

/** 原 C0t（199415）：市场条目卡（英雄图 + 悬浮示例提示词；图失败降级为普通卡） */
export function MarketEntryCard({
  item,
  displayName,
  examplePrompts,
  heroImage,
  onUsePrompt,
}: {
  item: PluginItem;
  displayName: string;
  examplePrompts: string[];
  heroImage?: string;
  onUsePrompt: (item: PluginItem, prompt?: string) => void;
}) {
  const [imageFailed, setImageFailed] = React.useState(false);
  const heroMode = isHttpsUrl(heroImage) && !imageFailed;
  const promptButtons = examplePrompts.map((prompt) => (
    <button
      key={prompt}
      type="button"
      data-testid="plugin-store-example-prompt"
      data-plugin-id={item.id}
      className={
        heroMode
          ? "group/prompt flex max-w-full items-center gap-2 rounded-full bg-black/65 px-3 py-2 text-left text-ui-base text-white shadow-md backdrop-blur-sm transition-colors hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          : "group/prompt flex max-w-full items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-left text-ui-base text-foreground transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused"
      }
      onClick={() => onUsePrompt(item, prompt)}
    >
      <PluginIcon item={item} className="size-5 rounded-md" iconClassName="size-2.5" />
      <span className={heroMode ? "shrink-0 font-medium text-white/70" : "shrink-0 font-medium text-foreground-subtle"}>{displayName}</span>
      <span className="min-w-0 truncate">{prompt}</span>
      <span
        aria-hidden="true"
        className={
          heroMode
            ? "flex size-6 shrink-0 items-center justify-center rounded-full bg-white/15 transition-colors group-hover/prompt:bg-white/25"
            : "flex size-6 shrink-0 items-center justify-center rounded-full bg-surface transition-colors group-hover/prompt:bg-hover"
        }
      >
        <IconArrowUpRight className="size-3.5" />
      </span>
    </button>
  ));
  return heroMode ? (
    <div className="relative overflow-hidden rounded-2xl">
      <img src={heroImage} alt="" aria-hidden="true" draggable={false} className="h-72 w-full select-none object-cover" onError={() => setImageFailed(true)} />
      {promptButtons.length > 0 ? <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6">{promptButtons}</div> : null}
    </div>
  ) : promptButtons.length === 0 ? null : (
    <div className="flex flex-col items-stretch gap-2">{promptButtons}</div>
  );
}
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（1）：IconArrowUpRight → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */

/** 原 w0t（199474）：组件段（标题 + 计数 + 条目列表） */
export function PluginComponentSection({ group }: { group: { kind: string; count: number; items: Array<{ name: string; description?: string }> } }) {
  const { intl } = useIntlContext();
  const Icon = PLUGIN_COMPONENT_KIND_ICONS[group.kind];
  return (
    <section data-testid="plugin-store-component-section" data-component-kind={group.kind}>
      <div className="flex items-baseline gap-2 border-b border-border pb-2">
        <h2 className="text-ui-lg font-semibold text-foreground">{intl.formatMessage({ id: PLUGIN_COMPONENT_KIND_I18N[group.kind] })}</h2>
        <span className="text-ui-base text-foreground-subtle">{group.count}</span>
      </div>
      <ul className="mt-1 divide-y divide-border/60">
        {group.items.map((entry) => (
          <li key={entry.name} className="flex min-w-0 items-center gap-3 py-2.5">
            <span aria-hidden="true" className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-surface text-foreground-subtle">
              <Icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-ui-base font-medium text-foreground">{entry.name}</div>
              {entry.description ? <div className="mt-0.5 line-clamp-1 text-ui-base text-foreground-subtle">{entry.description}</div> : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** 原 T0t（199531）：信息区（开发者/分类/版本 + 网站/隐私/条款链接；全空 → null） */
export function PluginDetailInfo({ item, describeMetadata }: { item: PluginItem; describeMetadata?: { author?: string; category?: string; version?: string; homepage?: string; privacyPolicy?: string; termsOfService?: string } }) {
  const { intl } = useIntlContext();
  const platform = usePlatformService();
  const listing = item.listing;
  const author = listing?.author ?? item.info?.author ?? describeMetadata?.author;
  const category = listing?.category;
  const categoryI18nId = category ? PLUGIN_CATEGORY_I18N[category] : undefined;
  const categoryLabel = category ? (categoryI18nId ? intl.formatMessage({ id: categoryI18nId }) : category) : undefined;
  const version = item.info?.version ?? item.installedMeta?.version ?? item.summary?.version ?? describeMetadata?.version;
  const homepage = firstHttpsUrl(listing?.homepage, item.info?.homepage, describeMetadata?.homepage);
  const privacyPolicy = firstHttpsUrl(listing?.privacyPolicy);
  const termsOfService = firstHttpsUrl(listing?.termsOfService);
  const fields: Array<{ key: string; label: string; value: string }> = [];
  if (author) fields.push({ key: "developer", label: intl.formatMessage({ id: "settings.plugins.store.info.developer" }), value: author });
  if (categoryLabel) fields.push({ key: "category", label: intl.formatMessage({ id: "settings.plugins.store.info.category" }), value: categoryLabel });
  if (version) fields.push({ key: "version", label: intl.formatMessage({ id: "settings.plugins.store.info.version" }), value: version });
  const links: Array<{ key: string; label: string; url: string }> = [];
  if (homepage) links.push({ key: "website", label: intl.formatMessage({ id: "settings.plugins.store.info.website" }), url: homepage });
  if (privacyPolicy) links.push({ key: "privacyPolicy", label: intl.formatMessage({ id: "settings.plugins.store.info.privacyPolicy" }), url: privacyPolicy });
  if (termsOfService) links.push({ key: "termsOfService", label: intl.formatMessage({ id: "settings.plugins.store.info.termsOfService" }), url: termsOfService });
  return fields.length === 0 && links.length === 0 ? null : (
    <section>
      <div className="border-b border-border pb-2">
        <h2 className="text-ui-lg font-semibold text-foreground">{intl.formatMessage({ id: "settings.plugins.store.info.title" })}</h2>
      </div>
      <dl className="mt-3 space-y-2.5">
        {fields.map((field) => (
          <div key={field.key} className="grid grid-cols-[8rem_minmax(0,1fr)] items-baseline gap-3">
            <dt className="text-ui-base text-foreground-subtle">{field.label}</dt>
            <dd className="min-w-0 truncate text-ui-base text-foreground">{field.value}</dd>
          </div>
        ))}
        {links.map((link) => (
          <div key={link.key} className="grid grid-cols-[8rem_minmax(0,1fr)] items-baseline gap-3">
            <dt className="text-ui-base text-foreground-subtle">{link.label}</dt>
            <dd className="min-w-0">
              <button
                type="button"
                title={link.url}
                aria-label={`${link.label}: ${link.url}`}
                className="inline-flex items-center gap-1 rounded-md text-ui-base text-foreground transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-input-border-focused"
                onClick={() => platform?.openExternal(link.url)}
              >
                <IconExternalLink className="size-3.5" aria-hidden="true" />
              </button>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** 原 p9（199650）：取第一个 https:// 值（原返回 find 直值；此处 null → undefined 归一，行为等价） */
export function firstHttpsUrl(...candidates: Array<string | undefined | null>): string | undefined {
  return candidates.find((candidate) => typeof candidate === "string" && candidate.startsWith("https://")) ?? undefined;
}

/** 原 E0t（199653）：高级信息折叠（details/summary + 旋转箭头） */
export function PluginAdvancedSection({ children }: { children: React.ReactNode }) {
  const { intl } = useIntlContext();
  return (
    <details className="group/advanced border-t border-border pt-4" data-testid="plugin-store-advanced">
      <summary className="flex cursor-pointer list-none items-center gap-2 text-ui-base font-medium text-foreground-subtle transition-colors hover:text-foreground">
        <IconChevronRight className="size-3.5 transition-transform group-open/advanced:rotate-90" aria-hidden="true" />
        {intl.formatMessage({ id: "settings.plugins.detail.moreDetails" })}
      </summary>
      <div className="mt-3 space-y-3">{children}</div>
    </details>
  );
}

/** 原 D0t（199673）：PluginManageList（返回 + 标题 + 远程同步/检查更新/过滤 + 已装列表） */
export function PluginManageList({
  plugins,
  installedPluginMetaById,
  loading,
  enabledFilter,
  onEnabledFilterChange,
  togglingPluginId,
  checkingUpdates,
  showRemoteSync,
  renderPluginSource,
  storeItemById,
  onBack,
  onCheckUpdates,
  onOpenRemoteSync,
  onSelectPlugin,
  onPluginEnabledChange,
}: {
  plugins: Array<{ id: string; name: string; version?: string; description?: string; enabled: boolean }>;
  installedPluginMetaById: Map<string, { updateStatus?: string }>;
  loading: boolean;
  enabledFilter: string;
  onEnabledFilterChange: (filter: string) => void;
  togglingPluginId: string | null;
  checkingUpdates: boolean;
  showRemoteSync: boolean;
  renderPluginSource: (item: { id: string; name: string }) => string;
  storeItemById: Map<string, PluginItem>;
  onBack: () => void;
  onCheckUpdates: () => void;
  onOpenRemoteSync: () => void;
  onSelectPlugin: (pluginId: string) => void;
  onPluginEnabledChange: (pluginId: string, enabled: boolean) => void;
}) {
  const { intl } = useIntlContext();
  return (
    <div className="space-y-4" data-testid="plugin-store-manage">
      <div>
        <BackLinkButton data-testid="plugin-store-manage-back" onClick={onBack}>
          {intl.formatMessage({ id: "settings.plugins.store.back" })}
        </BackLinkButton>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">{intl.formatMessage({ id: "settings.plugins.store.manageInstalled" })}</h1>
        <div className="flex items-center gap-1.5">
          {showRemoteSync ? (
            <Tooltip title={intl.formatMessage({ id: "settings.plugins.remoteSync.open" })}>
              <Button type="button" variant="ghost" size="icon-sm" aria-label={intl.formatMessage({ id: "settings.plugins.remoteSync.open" })} onClick={onOpenRemoteSync}>
                <IconCloudUpload className="size-3.5" aria-hidden="true" />
              </Button>
            </Tooltip>
          ) : null}
          <Button type="button" data-testid="plugin-store-check-updates" variant="ghost" size="sm" disabled={checkingUpdates} onClick={onCheckUpdates}>
            <IconRefresh className={checkingUpdates ? "size-3.5 animate-spin" : "size-3.5"} aria-hidden="true" />
            {intl.formatMessage({ id: "settings.plugins.checkForUpdates" })}
          </Button>
          <ResourceEnabledFilterSelect value={enabledFilter} onValueChange={onEnabledFilterChange} ariaLabel={intl.formatMessage({ id: "settings.plugins.filter.label" })} />
        </div>
      </div>
      <PluginInstalledList
        filteredPlugins={plugins}
        handlePluginEnabledChange={onPluginEnabledChange}
        installedPluginMetaById={installedPluginMetaById}
        loading={loading}
        renderPluginSource={renderPluginSource}
        selectedPluginId={null}
        storeItemById={storeItemById}
        togglingPluginId={togglingPluginId}
        onSelectPlugin={onSelectPlugin}
      />
    </div>
  );
}

/** SettingsPanelsCapability.tsx 已抽取（原 h1t，195930）：启用过滤下拉 */

/** 原 O0t（199763）：市场可删除判定（官方/内置不可删） */
export function isRemovableMarketplace(marketplace: { id: string }): boolean {
  return !(isOfficialMarketplace(marketplace.id) || marketplace.id === RECOMMENDED_MARKETPLACE);
}

/** 原 k0t（199766）：市场刷新失败提示 */
export function MarketplaceRefreshFailure({ failure }: { failure: { failedAt: number; message: string } }) {
  const { intl } = useIntlContext();
  return (
    <div className="mt-1 flex min-w-0 items-start gap-1 text-ui-xs text-destructive" data-testid="plugin-store-source-refresh-failure">
      <IconAlertTriangle className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
      <span className="min-w-0 break-words">
        {intl.formatMessage({ id: "settings.plugins.store.sources.refreshFailed" }, { time: formatMarketplaceTime(failure.failedAt) })}
        {`: ${failure.message}`}
      </span>
    </div>
  );
}

/** 原 A0t（199786）：市场源对话框（行 = 名/插件数/更新时间/失败提示 + 刷新/删除） */
export function PluginSourcesDialog({
  open,
  onOpenChange,
  marketplaces,
  onUpdateMarketplace,
  onRemoveMarketplace,
  operationId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  marketplaces: Array<{ id: string; pluginCount?: number; lastUpdated?: number | null; refreshFailure?: { failedAt: number; message: string } }>;
  onUpdateMarketplace: (marketplaceId: string) => void;
  onRemoveMarketplace: (marketplaceId: string) => void;
  operationId: string | null;
}) {
  const { intl } = useIntlContext();
  const claudeLabel = intl.formatMessage({ id: "settings.plugins.marketplace.claudeCodePlugins" });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(480px,calc(100vw-2rem))] max-w-none gap-3" data-testid="plugin-store-sources-dialog">
        <DialogTitle className="text-ui-base font-medium text-foreground">{intl.formatMessage({ id: "settings.plugins.store.sources.title" })}</DialogTitle>
        <div className="max-h-[min(420px,60vh)] space-y-1 overflow-y-auto">
          {marketplaces.length === 0 ? (
            <p className="px-1 py-2 text-ui-base text-foreground-subtle">{intl.formatMessage({ id: "settings.plugins.store.sources.empty" })}</p>
          ) : (
            marketplaces.map((marketplace) => {
              const updating = operationId === `marketplace:update:${marketplace.id}`;
              const removing = operationId === `marketplace:remove:${marketplace.id}`;
              return (
                <div key={marketplace.id} data-testid="plugin-store-source-row" data-marketplace-id={marketplace.id} className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-hover">
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <span className="truncate text-ui-base font-medium text-foreground">{resolveMarketplaceLabel(marketplace.id, [marketplace], claudeLabel)}</span>
                    </div>
                    <div className="mt-0.5 truncate text-ui-xs text-foreground-subtle">
                      {intl.formatMessage({ id: "settings.plugins.store.sources.pluginCount" }, { count: String(marketplace.pluginCount) })}
                      {marketplace.lastUpdated
                        ? ` · ${intl.formatMessage({ id: "settings.plugins.store.sources.lastUpdated" }, { time: formatMarketplaceTime(marketplace.lastUpdated) })}`
                        : ""}
                    </div>
                    {marketplace.refreshFailure ? <MarketplaceRefreshFailure failure={marketplace.refreshFailure} /> : null}
                  </div>
                  <Button
                    type="button"
                    data-testid="plugin-store-source-update"
                    data-marketplace-id={marketplace.id}
                    variant="ghost"
                    size="icon-sm"
                    aria-label={intl.formatMessage({ id: "settings.plugins.store.sources.update" })}
                    disabled={updating}
                    onClick={() => onUpdateMarketplace(marketplace.id)}
                  >
                    <IconRefresh className={updating ? "size-3.5 animate-spin" : "size-3.5"} aria-hidden="true" />
                  </Button>
                  {isRemovableMarketplace(marketplace) ? (
                    <Button
                      type="button"
                      data-testid="plugin-store-source-remove"
                      data-marketplace-id={marketplace.id}
                      variant="ghost"
                      size="icon-sm"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      aria-label={intl.formatMessage({ id: "settings.plugins.store.sources.remove" })}
                      disabled={removing}
                      onClick={() => onRemoveMarketplace(marketplace.id)}
                    >
                      {removing ? <IconSpinner className="size-3.5 animate-spin" aria-hidden="true" /> : <IconTrash className="size-3.5" aria-hidden="true" />}
                    </Button>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** 原 j0t（199899）：市场时间格式化（本地化；非法 → 原值） */
export function formatMarketplaceTime(value: number): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
}

/** 原 M0t（199903）：卸载确认对话框 */
export function PluginUninstallDialog({
  open,
  pluginName,
  pending,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  pluginName: string;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const { intl } = useIntlContext();
  return (
    <AlertDialogRoot
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
    >
      <AlertDialogContent data-testid="plugin-store-uninstall-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle>{intl.formatMessage({ id: "settings.plugins.uninstall.confirmTitle" }, { name: pluginName })}</AlertDialogTitle>
          <AlertDialogDescription>{intl.formatMessage({ id: "settings.plugins.uninstall.confirmDescription" })}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel type="button" size="sm" data-testid="plugin-store-uninstall-cancel" disabled={pending}>
            {intl.formatMessage({ id: "common.cancel" })}
          </AlertDialogCancel>
          <AlertDialogAction
            type="button"
            data-testid="plugin-store-uninstall-confirm"
            variant="destructive"
            size="sm"
            disabled={pending}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
          >
            {intl.formatMessage({ id: "settings.plugins.uninstall.confirm" })}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogRoot>
  );
}

/** 原 N0t（199952）：卸载流状态机（请求/取消/确认；忙碌判定 = 操作 id） */
export function useUninstallFlow(opts: {
  pluginService: PluginService; // A0-CLEANUP3 3b：store uninstallPlugin 形参面具型
  installedPlugins: Array<{ id: string; [key: string]: unknown }>;
  plugins: PluginItem[];
  operationId: string | null;
  onAfterUninstall: () => Promise<void>;
}): {
  pendingPlugin: { name: string } | null;
  uninstalling: boolean;
  requestUninstall: (pluginId: string) => void;
  cancelUninstall: () => void;
  confirmUninstall: () => Promise<void>;
} {
  const uninstallPlugin = usePluginsStore((state) => state.uninstallPlugin);
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  return {
    pendingPlugin: React.useMemo(
      () => (pendingId ? opts.installedPlugins.find((plugin) => plugin.id === pendingId) ?? opts.plugins.find((plugin) => plugin.id === pendingId) ?? null : null),
      [opts.installedPlugins, pendingId, opts.plugins],
    ) as { name: string } | null,
    uninstalling: pendingId !== null && opts.operationId === `plugin:uninstall:${pendingId}`,
    requestUninstall: React.useCallback((pluginId: string) => {
      setPendingId(pluginId);
    }, []),
    cancelUninstall: React.useCallback(() => {
      setPendingId(null);
    }, []),
    confirmUninstall: React.useCallback(async () => {
      if (pendingId) {
        await uninstallPlugin(pendingId, opts.pluginService);
        await opts.onAfterUninstall();
        setPendingId(null);
      }
    }, [opts.pluginService, opts.onAfterUninstall, pendingId, uninstallPlugin]),
  };
}

/** 原 P0t（199978）：插件 → 聊天提及条目 */
export function buildPluginMentionEntry({ item, locale }: { item: PluginItem; locale: string }): {
  id: string;
  category: string;
  label: string;
  value: string;
  markdown: string;
  data: { pluginId: string; icon?: string };
} {
  const displayName = pluginDisplayName(item, locale);
  return {
    id: `plugin:${item.id}`,
    category: "plugins",
    label: displayName,
    value: item.id,
    markdown: pluginMentionMarkdown(displayName, item.id),
    data: { pluginId: item.id, ...(item.listing?.icon ? { icon: item.listing.icon } : {}) },
  };
}

/** 原 F0t（199989）：聊天提示词构造（提及 + 追加提示） */
export function buildPluginChatPrompt({ item, locale, prompt }: { item: PluginItem; locale: string; prompt?: string }): string { // A0-CLEANUP3 3b：bundle F0t（159974）prompt 可选
  const markdown = buildPluginMentionEntry({ item, locale }).markdown;
  const trimmed = (prompt ?? "").trim();
  return trimmed ? `${markdown} ${trimmed}` : markdown;
}
