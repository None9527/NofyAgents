// A0-S4-4a: 自 modules/Settings.tsx 侧栏/壳层小件（§7）原样迁入（组件单元；原文件现为薄 re-export shim）。
// 迁出体 = 原文件 1364–1619；§0 CodingPlanSource/ButtonProps/IconComponent/ZCODE_LOGO_DATA_URL 声明随族迁入。
// 导入路径按 components/settings/ 深度改指 ../../modules/；§3 助手与 §1 testid 经 shim 运行时 import（渲染期消费，无初始化期环）。
import * as React from "react";
import { LoaderCircle as SpinnerIcon, FolderOpen as IconFolderOpen, ArrowLeft as IconArrowLeft } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0
import { Button } from '../../modules/button'; // A0-CLEANUP 族清理：Button declare 改指 button chunk
import { Input } from '../../modules/ImeComposition';
import { cn } from '../../modules/UtilsCn'; // Z（utils chunk）
import { useZCodeIntl as useIntlContext } from '../../modules/I18n'; // G（IntlProvider chunk）
import { InfoTooltip as Tooltip } from '../../modules/UsageStatsUiParts'; // Ia
import { isDataBaseDirForbiddenError as isForbiddenInstallDirError, joinTestidParts } from '../../modules/SrcSharedB'; // dS（9110/8991）〔A1-R42〕+joinTestidParts（原 testidOf 经 Settings 转取，qr 收敛改指，见 modules/Settings 墓碑）
import { Tabs, TabsList, TabsTrigger } from './SettingsRowPrimitives';
import { isTeamPlanSource, codingPlanTabId, resolveCodingPlanTabLabel, SETTINGS_USAGE_TAB_TESTID } from '../../modules/Settings';

/* §0 声明群随族迁入（原 412–417 / 467–471 / 475 / 479–480） */
interface CodingPlanSource {
  id: string;
  providerId: string;
  label: string;
  [key: string]: unknown;
}
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "ghost" | "outline" | "destructive";
  size?: "xs" | "sm" | "default" | "lg" | "icon-sm" | "icon-md" | "icon-lg";
}
/* ── tombstone（A0-CLEANUP 族清理）：Button declare 删除 → import { Button } from './button'。 ── */
type IconComponent = React.FC<{ className?: string; "aria-hidden"?: boolean | "true" }>;
/** ZCode logo data-url（原 uw，js 39411）：Win caption 左上 logo */
declare const ZCODE_LOGO_DATA_URL: string;

/* ============================================================================
 * 7. 侧栏 / 壳层小件
 * ==========================================================================*/

/** 原 o4t（js 205142）：左段分区按钮（Tooltip 右出；激活 `bg-surface-hover`；
 *  <lg 收窄为 40px 图标列）。 */
export function SettingsSidebarItem({
  icon: Icon,
  label,
  active,
  children,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: IconComponent;
  label: string;
  active?: boolean;
}) {
  return (
    <Tooltip title={label} side="right" align="center">
      <button
        {...rest}
        type={rest.type ?? "button"}
        aria-label={label}
        className={cn(
          "flex h-8 w-full items-center gap-2 rounded-xl px-2.5 text-left transition-colors",
          "max-lg:mx-auto max-lg:size-10 max-lg:justify-center max-lg:px-0",
          active
            ? "bg-surface-hover text-foreground"
            : "text-foreground-subtle hover:bg-surface-hover hover:text-foreground",
          className,
        )}
      >
        <span className="flex size-4 shrink-0 items-center justify-center text-current">
          <Icon className="size-4 text-foreground" />
        </span>
        <span className="min-w-0 flex-1 max-lg:sr-only">
          {children ?? <span className="truncate text-ui-base text-foreground">{label}</span>}
        </span>
      </button>
    </Tooltip>
  );
}

/** 原 H2t（js 204114）：Windows 左上 logo 拖拽条 */
export function SettingsCaptionLogo({ className, imageClassName }: { className?: string; imageClassName?: string }) {
  return (
    <div className={cn("absolute left-0 top-0 z-20 flex h-12 items-center px-3 [app-region:drag]", className)}>
      <img
        src={ZCODE_LOGO_DATA_URL}
        alt="nofy"
        className={cn("pointer-events-none size-5 select-none", imageClassName)}
        draggable={false}
      /> {/* REBRAND-037+137 */}
    </div>
  );
}

/** 原 M7（js 193045）：← 返回链接按钮 */
export function BackLinkButton({
  children,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button type="button" size="lg" variant="ghost" className={cn("-ml-2", className)} {...rest}>
      <IconArrowLeft className="size-4" aria-hidden="true" />
      {children}
    </Button>
  );
}

/** 原 j7（js 193014）：资源分组头（标题 + 计数 + 右侧提示） */
export function ResourceGroupHeader({ count, hint, title }: { count: number; hint?: string; title: string }) {
  const { intl } = useIntlContext();
  const countLabel = intl.formatMessage(
    { id: count === 1 ? "settings.resourceGroup.item.one" : "settings.resourceGroup.item.other" },
    { count: String(count) },
  );
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 px-1">
      <div className="flex min-w-0 items-baseline gap-2">
        <span className="truncate text-ui-base font-medium text-foreground">{title}</span>
        <span className="shrink-0 text-ui-base text-foreground-subtlest">{countLabel}</span>
      </div>
      {hint ? <div className="min-w-0 text-ui-base text-foreground-subtle">{hint}</div> : null}
    </div>
  );
}

/** 原 D9（js 202889）：带进行中 spinner 的操作按钮（min-w-24） */
export function PendingOperationButton({
  children,
  disabled,
  operation,
  pendingOperation,
  variant = "outline",
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  operation: string;
  pendingOperation: string | null;
  variant?: ButtonProps["variant"];
  onClick?: () => void;
}) {
  return (
    <Button
      type="button"
      size="lg"
      variant={variant}
      disabled={disabled || pendingOperation !== null}
      onClick={onClick}
      className="min-w-24"
    >
      {pendingOperation === operation ? <SpinnerIcon className="size-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </Button>
  );
}

/** 原 U2t（js 204125）：数据目录控件 —— 只读输入 + 浏览 + 保存；
 *  状态机 idle→saving→saved/error；saved 提示「重启后生效」（琥珀色）；
 *  安装目录禁写（`settings.dataBaseDirForbiddenInstallDir`）。 */
export function DataBaseDirControl({
  dataBaseDir,
  defaultHomeDir,
  onDataBaseDirChange,
  onSelectDataBaseDir,
}: {
  dataBaseDir: string;
  defaultHomeDir: string;
  onDataBaseDirChange: (dir: string) => Promise<void>;
  onSelectDataBaseDir: () => Promise<string | null | undefined>; // A0-CLEANUP3 3b：ImeComposition.selectDirectory 值域含 undefined，函数体以 !selected 兜底
}) {
  const { intl } = useIntlContext();
  const effectiveDir = dataBaseDir || defaultHomeDir;
  const [draft, setDraft] = React.useState(effectiveDir);
  const [browsing, setBrowsing] = React.useState(false);
  const [phase, setPhase] = React.useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMessageId, setErrorMessageId] = React.useState("settings.dataBaseDirCopyFailed");
  React.useEffect(() => {
    if (phase !== "saved") setDraft(effectiveDir);
  }, [effectiveDir, phase]);
  const dirty = draft.trim() !== effectiveDir;
  const saving = phase === "saving";
  const browse = React.useCallback(async () => {
    setBrowsing(true);
    try {
      const selected = await onSelectDataBaseDir();
      if (!selected) return;
      setDraft(selected);
      if (phase !== "idle") setPhase("idle");
    } finally {
      setBrowsing(false);
    }
  }, [onSelectDataBaseDir, phase]);
  const save = React.useCallback(async () => {
    const next = draft.trim();
    const payload = next === defaultHomeDir ? "" : next;
    setPhase("saving");
    try {
      await onDataBaseDirChange(payload);
      setPhase("saved");
    } catch (error) {
      setErrorMessageId(
        isForbiddenInstallDirError(error)
          ? "settings.dataBaseDirForbiddenInstallDir"
          : "settings.dataBaseDirCopyFailed",
      );
      setPhase("error");
    }
  }, [defaultHomeDir, draft, onDataBaseDirChange]);
  return (
    <div className="flex w-[320px] min-w-0 flex-col gap-2">
      <div className="flex items-center gap-2">
        <IconFolderOpen className="size-4 shrink-0 text-foreground-subtle" />
        <Input
          size="lg"
          value={draft}
          readOnly
          disabled={saving || browsing}
          placeholder={intl.formatMessage({ id: "settings.dataBaseDirPlaceholder" })}
          className="flex-1 font-mono"
        />
      </div>
      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="outline" size="sm" disabled={saving || browsing} onClick={() => void browse()}>
          {intl.formatMessage({ id: "settings.dataBaseDirBrowse" })}
        </Button>
        <Button type="button" size="sm" disabled={!dirty || saving || browsing} onClick={() => void save()}>
          {saving ? <SpinnerIcon className="size-4 animate-spin" /> : intl.formatMessage({ id: "settings.dataBaseDirSave" })}
        </Button>
      </div>
      {phase === "saving" ? (
        <p className="text-ui-base text-foreground-subtle">{intl.formatMessage({ id: "settings.dataBaseDirCopying" })}</p>
      ) : phase === "saved" ? (
        <p className="text-ui-base text-amber-600 dark:text-amber-400">
          {intl.formatMessage({ id: "settings.dataBaseDirRestartRequired" })}
        </p>
      ) : phase === "error" ? (
        <p className="text-ui-base text-destructive">{intl.formatMessage({ id: errorMessageId })}</p>
      ) : null}
    </div>
  );
}

/** 原 yt（U2t 内引用）：判定「禁止安装目录」错误（错误对象带 forbidden 标记） */

/** 原 e4t（js 204779）：用量分区标签栏（app + 每个 Coding Plan 源一个标签） */
export function UsageSectionTabBar({
  activeTab,
  codingPlanSources,
  onTabChange,
}: {
  activeTab: string;
  codingPlanSources: CodingPlanSource[];
  onTabChange: (tabId: string) => void;
}) {
  const { intl } = useIntlContext();
  const tabs: Array<{ id: string; label: string }> = [
    { id: "app", label: intl.formatMessage({ id: "settings.usage.tab.appUsage" }) },
    ...codingPlanSources.map((source, index) => ({
      id: codingPlanTabId(source.id),
      label: resolveCodingPlanTabLabel({
        defaultLabel: intl.formatMessage({ id: "settings.usage.tab.codingPlan" }),
        hasMultiplePersonalSources: codingPlanSources.filter((item) => !isTeamPlanSource(item)).length > 1,
        index,
        source,
      }),
    })),
  ];
  return (
    <Tabs
      value={activeTab === "codingPlan" && codingPlanSources[0] ? codingPlanTabId(codingPlanSources[0].id) : activeTab}
      onValueChange={(value) => onTabChange(value)}
      className="shrink-0"
    >
      <TabsList variant="line" className="flex h-8 gap-4 p-0">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            aria-label={tab.label}
            title={tab.label}
            data-testid={joinTestidParts(SETTINGS_USAGE_TAB_TESTID, tab.id)}
            className="h-8 rounded-none px-0 text-ui-base font-medium text-foreground-subtle data-active:text-foreground"
          >
            <span className="whitespace-nowrap">{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

