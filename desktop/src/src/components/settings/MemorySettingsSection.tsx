// A0-S4-4a: 自 modules/Settings.tsx 记忆分区 + 记忆查看器（§10，原 E2t/w2t）原样迁入（组件单元；原文件现为薄 re-export shim）。
// 迁出体 = 原文件 2516–3073；§0 IntlShape/ProjectMemoryWorkspace/BaseServices/useZCodeStore/ZCodeStoreState 声明随族迁入；
// MemoryService 为 shim 导出型别（type import）。§1 testid 经 shim import。
import * as React from "react";
import { LoaderCircle as SpinnerIcon, RefreshCcw as IconRefresh, FileText as IconFileText, Folder as IconFolder } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0
import { Button, ChevronRight as IconChevronRight } from '../../modules/button'; // A0-CLEANUP 族清理：Button declare 改指 button chunk；button chunk 图标 pass-1 同源
import { MemoryFilePreview } from '../../modules/SettingsPanelsData';
import { useZCodeIntl as useIntlContext } from '../../modules/I18n'; // G（IntlProvider chunk）
import { InfoTooltip as Tooltip } from '../../modules/UsageStatsUiParts'; // Ia
import { SettingsRow, SettingsSectionCard, Switch, Alert, AlertDescription } from './SettingsRowPrimitives';
import { BackLinkButton } from './SettingsShellParts';
import { type SystemService, type ThemeMode, SETTINGS_MEMORY_BACK_MEMORIES_TESTID, SETTINGS_MEMORY_BACK_PROJECTS_TESTID, SETTINGS_MEMORY_FILE_TESTID, SETTINGS_MEMORY_PREVIEW_TESTID, SETTINGS_MEMORY_REFRESH_TESTID, SETTINGS_MEMORY_SWITCH_TESTID, SETTINGS_MEMORY_WORKSPACE_TESTID, type MemoryService } from '../../modules/Settings';

/* §0 声明群随族迁入（原 178–180 / 280–285 / 310–315 / 335–349） */
interface IntlShape {
  formatMessage(descriptor: { id: string }, values?: Record<string, unknown>): string;
}
interface ProjectMemoryWorkspace {
  id: string;
  label: string;
  updatedAt: number;
  files: Array<{ name: string }>;
}
/* ── tombstone〔A1-R160〕：本地 `interface McpSyncService`（原 @24-26）与 `interface BaseServices`（原 @27-32，
 *    3 必填 systemService/memoryService/mcpSyncService + `[key: string]: unknown` 索引签兜底）二面**整族退役**。
 *    理据：①`BaseServices` 之唯一引用点系原 @350/@351 之**重复转录 provider**（同批退役，见下碑）→ 本面随之成死；
 *    ②`McpSyncService` 之唯一引用点系本面 @30 → 亦随之成死（★与 modules/Settings.tsx 之同名本地面不同：彼处
 *    `McpSyncService`@293 另有活引用 `WorkspaceServices`@307，故彼处不 cascade）；③canonical 宽面在
 *    `stores/sessionRegistryStore.ts@34`（八员全可选 + 索引签兜底，经 modules/stores-core 再导出），本面系其
 *    **窄化重复**（3 必填 vs 全可选）——按 R157「最小结构面」沉淀窄面本可合法，惟本窄面之唯一消费者既已退役，
 *    留存即成无主死面，故销账。④`SystemService`（@12 type import）随本面退役后成为未用导入；tsconfig 无
 *    `noUnusedLocals` 故不报错，本批**不动该导入行**（该行兼载 §1 testid 族，避免无谓交涉），登记候后续清理。 ── */
interface CodePreviewSettings {
  lightTheme: string;
  darkTheme: string;
  showLineNumbers: boolean;
  wrapLongLines: boolean;
  fontSizePx: number;
}
/** 原 ko（js 1296，Mie 工厂 1140）：应用级偏好 store（theme/locale/字号/代码预览/通知…） */
declare function useZCodeStore<T>(selector: (s: ZCodeStoreState) => T): T;
interface ZCodeStoreState {
  theme: ThemeMode;
  setTheme(t: ThemeMode): void;
  codePreviewSettings: CodePreviewSettings;
  setCodePreviewSettings(patch: Partial<CodePreviewSettings>): void;
  uiFontSizePx: number;
  setUiFontSizePx(px: number): void;
  notificationEnabled: boolean;
  setNotificationEnabled(v: boolean): void;
  notificationSoundEnabled: boolean;
  setNotificationSoundEnabled(v: boolean): void;
  requestOnboardingDialog(): void;
}

/* ============================================================================
 * 10. 记忆分区 + 记忆查看器（原 E2t js 202650 / w2t js 202420）
 *     工作区记忆开关；查看器三级：项目列表 → 文件列表 → 文件预览
 *     （预览限制 PROJECT_MEMORY_PREVIEW_LIMIT_EXCEEDED → fileTooLarge，5MiB 由服务端判定）
 * ==========================================================================*/

/** 原 _2t / v2t（js 202377 附近） */
const ONE_MINUTE_MS = 60_000;
const JUST_NOW_WINDOW_MINUTES = 30;

/** 原 y2t：当日 0 点时间戳 */
function startOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** 原 b2t：HH:mm（24 小时制） */
function formatTimeH23(timestamp: number, locale: string): string {
  return new Intl.DateTimeFormat(locale, { hour: "2-digit", hourCycle: "h23", minute: "2-digit" }).format(timestamp);
}

/** 原 x2t（js 202675）：周几（zh-CN 用「周X」） */
export function formatWeekday(timestamp: number, locale: string): string {
  return locale === "zh-CN"
    ? `周${"日一二三四五六"[new Date(timestamp).getDay()]}`
    : new Intl.DateTimeFormat(locale, { weekday: "short" }).format(timestamp);
}

/** 原 S2t（js 202680）：短日期（zh-CN 用「M 月 D 日」，跨年带年） */
export function formatShortDate(timestamp: number, locale: string, withYear: boolean): string {
  const date = new Date(timestamp);
  if (locale === "zh-CN") {
    const monthDay = `${date.getMonth() + 1} 月 ${date.getDate()} 日`;
    return withYear ? `${date.getFullYear()} 年 ${monthDay}` : monthDay;
  }
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    ...(withYear ? { year: "numeric" } : {}),
  }).format(date);
}

/** 原 C2t（js 202692）：记忆更新时间标签（刚刚/N 分钟前/今天 HH:mm/昨天/周几/日期） */
export function formatMemoryUpdatedLabel(input: {
  formatMessage: IntlShape["formatMessage"];
  locale: string;
  now: number;
  updatedAt: number;
}): string {
  const { formatMessage, locale, now, updatedAt } = input;
  const elapsed = now - updatedAt;
  if (!Number.isFinite(updatedAt) || elapsed < ONE_MINUTE_MS) {
    return formatMessage({ id: "settings.memory.viewer.updated.justNow" });
  }
  const minutes = Math.floor(elapsed / ONE_MINUTE_MS);
  if (minutes < JUST_NOW_WINDOW_MINUTES) {
    return formatMessage({ id: "settings.memory.viewer.updated.minutesAgo" }, { count: minutes });
  }
  const todayStart = startOfDay(now);
  const updatedDayStart = startOfDay(updatedAt);
  const timeLabel = formatTimeH23(updatedAt, locale);
  if (updatedDayStart === todayStart) {
    return formatMessage({ id: "settings.memory.viewer.updated.today" }, { time: timeLabel });
  }
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  if (updatedDayStart === yesterdayStart.getTime()) {
    return formatMessage({ id: "settings.memory.viewer.updated.yesterday" }, { time: timeLabel });
  }
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  if (updatedDayStart >= weekStart.getTime()) {
    return formatMessage({ id: "settings.memory.viewer.updated.weekday" }, { time: timeLabel, weekday: formatWeekday(updatedAt, locale) });
  }
  return formatMessage(
    { id: "settings.memory.viewer.updated.date" },
    {
      date: formatShortDate(updatedAt, locale, new Date(updatedAt).getFullYear() !== new Date(todayStart).getFullYear()),
      time: timeLabel,
    },
  );
}

/** 原 T2t（js 202940）：错误 → 文案 */
export function errorMessageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** 原 T9（js 202647）：错误码判定（`{code}` 结构） */
export function hasErrorCode(error: unknown, code: string): boolean {
  return typeof error === "object" && !!error && "code" in error && (error as { code: unknown }).code === code;
}

/** 原 w2t（js 202716）：记忆查看器呈现层。
 *  三级导航：无选中项目 → 项目列表；选中项目 → 文件列表；选中文件 → 预览。
 *  返回按钮语义随层级切换（backToProjects / backToMemories），滚动位置由父级保持。 */
export function ProjectMemoryViewer({
  catalogError,
  catalogState,
  fileContent,
  fileError,
  fileState,
  selectedFileName,
  selectedWorkspace,
  workspaces,
  onBackToMemories,
  onBackToProjects,
  onRefresh,
  onSelectFile,
  onSelectWorkspace,
}: {
  catalogError: string | null;
  catalogState: "idle" | "loading" | "ready" | "error";
  fileContent: string;
  fileError: string | null;
  fileState: "idle" | "loading" | "ready" | "error";
  selectedFileName: string | null;
  selectedWorkspace: ProjectMemoryWorkspace | null;
  workspaces: ProjectMemoryWorkspace[];
  onBackToMemories: () => void;
  onBackToProjects: () => void;
  onRefresh: () => Promise<void>;
  onSelectFile: (fileName: string) => void;
  onSelectWorkspace: (workspace: ProjectMemoryWorkspace) => void;
}) {
  const { intl, locale } = useIntlContext();
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const theme = useZCodeStore((state) => state.theme);
  const codePreviewSettings = useZCodeStore((state) => state.codePreviewSettings);
  const memoryCountLabel = (count: number) =>
    intl.formatMessage({ id: `settings.memory.viewer.memoryCount.${count === 1 ? "one" : "other"}` }, { count });
  return (
    <div className="space-y-6">
      {/* 头部：标题/返回 + 刷新（202451–202517） */}
      <div className="flex items-start justify-between gap-3">
        {(() => {
          if (!selectedWorkspace) {
            return (
              <div className="min-w-0">
                <h2 className="text-ui-base font-medium text-foreground">
                  {intl.formatMessage({ id: "settings.memory.viewer.title" })}
                </h2>
                <p className="mt-1 text-ui-sm text-foreground-subtle">
                  {intl.formatMessage({ id: "settings.memory.viewer.projectsDescription" })}
                </p>
              </div>
            );
          }
          const backLabelId = selectedFileName
            ? "settings.memory.viewer.backToMemories"
            : "settings.memory.viewer.backToProjects";
          return (
            <div className="space-y-4">
              <BackLinkButton
                aria-label={intl.formatMessage({ id: backLabelId })}
                data-testid={selectedFileName ? SETTINGS_MEMORY_BACK_MEMORIES_TESTID : SETTINGS_MEMORY_BACK_PROJECTS_TESTID}
                onClick={selectedFileName ? onBackToMemories : onBackToProjects}
              >
                {intl.formatMessage({ id: backLabelId })}
              </BackLinkButton>
              <div className="min-w-0">
                <h2 className="truncate text-ui-base font-medium text-foreground">
                  {selectedFileName ?? selectedWorkspace.label}
                </h2>
                <p className="mt-1 truncate text-ui-sm text-foreground-subtle">
                  {selectedFileName ? selectedWorkspace.label : memoryCountLabel(selectedWorkspace.files.length)}
                </p>
              </div>
            </div>
          );
        })()}
        <Tooltip title={intl.formatMessage({ id: "settings.memory.viewer.refresh" })}>
          <Button
            type="button"
            size="icon-md"
            variant="ghost"
            aria-label={intl.formatMessage({ id: "settings.memory.viewer.refresh" })}
            data-testid={SETTINGS_MEMORY_REFRESH_TESTID}
            disabled={catalogState === "loading"}
            onClick={() => void onRefresh()}
          >
            {catalogState === "loading" ? (
              <SpinnerIcon className="size-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <IconRefresh className="size-3.5" aria-hidden="true" />
            )}
          </Button>
        </Tooltip>
      </div>

      {/* 目录错误 / 加载 / 空态 / 三级内容（202517–202643） */}
      {catalogError ? (
        <div className="flex flex-1 p-4">
          <Alert>
            <AlertDescription>{catalogError}</AlertDescription>
          </Alert>
        </div>
      ) : catalogState === "loading" && workspaces.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-4 py-10 text-center text-ui-base text-foreground-subtle">
          {intl.formatMessage({ id: "settings.memory.viewer.loading" })}
        </div>
      ) : workspaces.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-4 py-10 text-center text-ui-base text-foreground-subtle">
          {intl.formatMessage({ id: "settings.memory.viewer.empty" })}
        </div>
      ) : selectedWorkspace ? (
        selectedFileName ? (
          /* 文件预览（错误 / 加载 / Markdown 渲染） */
          <div
            className="min-w-0 overflow-hidden rounded-xl border border-border bg-background"
            data-testid={SETTINGS_MEMORY_PREVIEW_TESTID}
          >
            {fileError ? (
              <div className="p-4">
                <Alert>
                  <AlertDescription>{fileError}</AlertDescription>
                </Alert>
              </div>
            ) : fileState === "loading" ? (
              <div className="flex h-full items-center justify-center text-ui-base text-foreground-subtle">
                {intl.formatMessage({ id: "settings.memory.viewer.fileLoading" })}
              </div>
            ) : selectedFileName && fileState === "ready" ? (
              <div className="min-h-0">
                <MemoryFilePreview content={fileContent} codePreviewSettings={codePreviewSettings} theme={theme} />
              </div>
            ) : null}
          </div>
        ) : (
          /* 文件列表 */
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="divide-y divide-border">
              {selectedWorkspace.files.map((file) => (
                <Tooltip key={file.name} title={file.name} side="right">
                  <button
                    type="button"
                    data-testid={joinTestidParts(SETTINGS_MEMORY_FILE_TESTID, file.name)}
                    className="flex w-full min-w-0 items-center gap-3 px-4 py-3 text-left outline-none hover:bg-hover focus-visible:bg-hover"
                    onClick={() => onSelectFile(file.name)}
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface text-foreground-subtle">
                      <IconFileText className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1 truncate font-mono text-ui-base text-foreground">{file.name}</span>
                    <IconChevronRight className="size-4 shrink-0 text-foreground-subtlest" />
                  </button>
                </Tooltip>
              ))}
            </div>
          </div>
        )
      ) : (
        /* 项目列表 */
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="divide-y divide-border">
            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                type="button"
                data-testid={joinTestidParts(SETTINGS_MEMORY_WORKSPACE_TESTID, workspace.id)}
                className="flex w-full min-w-0 items-center gap-3 px-4 py-3 text-left outline-none hover:bg-hover focus-visible:bg-hover"
                onClick={() => onSelectWorkspace(workspace)}
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface text-foreground-subtle">
                  <IconFolder className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-ui-base font-medium text-foreground">{workspace.label}</span>
                  <span className="mt-0.5 block truncate text-ui-sm text-foreground-subtle">
                    {memoryCountLabel(workspace.files.length)}
                    {" · "}
                    {formatMemoryUpdatedLabel({
                      formatMessage: intl.formatMessage,
                      locale,
                      now,
                      updatedAt: workspace.updatedAt,
                    })}
                  </span>
                </span>
                <IconChevronRight className="size-4 shrink-0 text-foreground-subtlest" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── tombstone〔A1-R160〕：`ServicesContext`（原 @350）+ `export function SettingsServicesProvider`（原 @351-353）
 *    **重复转录退役** → canonical = `services/serviceContext.tsx@13 ServiceProvider`（经 modules/services@100 转导出）。
 *    束证：`ds` 全束 word-boundary 恰 **8** 命中全量归账 = **1 定义**（styles@2672 `function ds({services:e,children:t})`）
 *    + 1 导出（@657 `ds as ni`）+ **6 调用点**（@42795/@42844/@205877/@207027/@207128/@212882）→ **单真身**；
 *    R147 已裁「必指 serviceContext，不可指 MemorySettingsSection@351 并行副本」（ONB@686 / AppRootLeaves@291 在案），本批兑现。 ── */

/** 原 E2t（js 202946）：记忆分区 = 工作区记忆开关 + 查看器（含请求序号防竞态）。
 *  错误码映射：ENOENT→fileDeleted、PROJECT_MEMORY_PREVIEW_LIMIT_EXCEEDED→fileTooLarge（5MiB 上限，
 *  服务端判定）、PROJECT_MEMORY_FILE_CHANGED→fileChanged。 */
export function MemorySettingsSection({
  memoryEnabled,
  memoryService,
  onMemoryEnabledChange,
  projectMemoryViewerAvailable,
}: {
  memoryEnabled: boolean;
  memoryService: MemoryService;
  onMemoryEnabledChange: (v: boolean) => void;
  projectMemoryViewerAvailable: boolean;
}) {
  const { intl } = useIntlContext();
  const containerRef = React.useRef<HTMLDivElement>(null);
  /** 原 a.current：项目列表滚动位置（返回项目列表时恢复） */
  const projectsScrollTopRef = React.useRef(0);
  /** 原 s.current：文件列表滚动位置（返回文件列表时恢复） */
  const filesScrollTopRef = React.useRef(0);
  /** 原 c.current：目录请求序号（防竞态） */
  const catalogRequestIdRef = React.useRef(0);
  /** 原 l.current：文件读取请求序号（防竞态；卸载时自增使在途响应作废） */
  const fileRequestIdRef = React.useRef(0);
  const [catalogState, setCatalogState] = React.useState<"idle" | "loading" | "ready" | "error">("idle");
  const [catalogError, setCatalogError] = React.useState<string | null>(null);
  const [workspaces, setWorkspaces] = React.useState<ProjectMemoryWorkspace[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = React.useState<string | null>(null);
  const [selectedFile, setSelectedFile] = React.useState<{ workspaceId: string; fileName: string } | null>(null);
  const [fileState, setFileState] = React.useState<"idle" | "loading" | "ready" | "error">("idle");
  const [fileContent, setFileContent] = React.useState("");
  const [fileError, setFileError] = React.useState<string | null>(null);

  const resetFileView = React.useCallback(() => {
    fileRequestIdRef.current += 1;
    setSelectedFile(null);
    setFileState("idle");
    setFileContent("");
    setFileError(null);
  }, []);

  /** 原 D（202671–202697）：读取单个记忆文件 */
  const readFile = React.useCallback(
    async (workspaceId: string, fileName: string) => {
      const requestId = fileRequestIdRef.current + 1;
      fileRequestIdRef.current = requestId;
      setSelectedFile({ workspaceId, fileName });
      setFileState("loading");
      setFileContent("");
      setFileError(null);
      try {
        const result = await memoryService.readProjectMemoryFile({ workspaceId, fileName });
        if (fileRequestIdRef.current === requestId) {
          setFileContent(result.content);
          setFileState("ready");
        }
      } catch (error) {
        if (fileRequestIdRef.current === requestId) {
          setFileError(
            hasErrorCode(error, "ENOENT")
              ? intl.formatMessage({ id: "settings.memory.viewer.fileDeleted" })
              : hasErrorCode(error, "PROJECT_MEMORY_PREVIEW_LIMIT_EXCEEDED")
                ? intl.formatMessage({ id: "settings.memory.viewer.fileTooLarge" })
                : hasErrorCode(error, "PROJECT_MEMORY_FILE_CHANGED")
                  ? intl.formatMessage({ id: "settings.memory.viewer.fileChanged" })
                  : errorMessageOf(error),
          );
          setFileState("error");
        }
      }
    },
    [intl, memoryService],
  );

  /** 原 O（202698–202707）：刷新项目目录 */
  const refreshCatalog = React.useCallback(async (): Promise<ProjectMemoryWorkspace[] | null> => {
    const requestId = catalogRequestIdRef.current + 1;
    catalogRequestIdRef.current = requestId;
    setCatalogState("loading");
    setCatalogError(null);
    try {
      const list = await memoryService.listProjectMemories();
      if (catalogRequestIdRef.current !== requestId) return null;
      setWorkspaces(list);
      setCatalogState("ready");
      return list;
    } catch (error) {
      if (catalogRequestIdRef.current !== requestId) return null;
      setWorkspaces([]);
      setSelectedWorkspaceId(null);
      resetFileView();
      setCatalogError(errorMessageOf(error));
      setCatalogState("error");
      return null;
    }
  }, [resetFileView, memoryService]);

  /* 原 202708–202715：开关/可用性变化时重载或清空 */
  React.useEffect(() => {
    if (memoryEnabled && projectMemoryViewerAvailable) {
      void refreshCatalog();
      return;
    }
    catalogRequestIdRef.current += 1;
    setCatalogState("idle");
    setCatalogError(null);
    setWorkspaces([]);
    setSelectedWorkspaceId(null);
    resetFileView();
  }, [resetFileView, memoryEnabled, projectMemoryViewerAvailable, refreshCatalog]);

  const selectedWorkspace = React.useMemo(
    () => workspaces.find((workspace) => workspace.id === selectedWorkspaceId) ?? null,
    [selectedWorkspaceId, workspaces],
  );
  const selectedFileName =
    selectedFile && selectedWorkspace && selectedFile.workspaceId === selectedWorkspace.id
      ? selectedWorkspace.files.some((file) => file.name === selectedFile.fileName)
        ? selectedFile.fileName
        : null
      : null;

  /* 原 202717–202721：选中文件失效时回退 */
  React.useEffect(() => {
    if (selectedFile && !selectedFileName) resetFileView();
  }, [resetFileView, selectedFile, selectedFileName]);

  /** 原 j（202722–202738）：选择文件（记录滚动位置并回到顶部） */
  const selectFile = React.useCallback(
    (fileName: string) => {
      if (!selectedWorkspace || !selectedWorkspace.files.some((file) => file.name === fileName)) return;
      const workspaceId = selectedWorkspace.id;
      if (selectedFile?.workspaceId === workspaceId && selectedFile.fileName === fileName && fileState !== "error") return;
      filesScrollTopRef.current = containerRef.current?.closest("main")?.scrollTop ?? 0;
      void readFile(workspaceId, fileName);
      requestAnimationFrame(() => {
        const main = containerRef.current?.closest("main");
        if (main) main.scrollTop = 0;
      });
    },
    [fileState, readFile, selectedFile, selectedWorkspace],
  );

  /** 原 M（202739–202757）：刷新（保持当前选中层级） */
  const refresh = React.useCallback(async () => {
    const workspaceId = selectedWorkspaceId;
    const currentFile = selectedFile;
    const fileRequestId = fileRequestIdRef.current;
    const list = await refreshCatalog();
    if (!list || fileRequestIdRef.current !== fileRequestId || !workspaceId) return;
    const workspace = list.find((item) => item.id === workspaceId);
    if (!workspace) {
      resetFileView();
      setSelectedWorkspaceId(null);
      return;
    }
    if (currentFile) {
      if (!workspace.files.some((file) => file.name === currentFile.fileName)) {
        resetFileView();
        return;
      }
      await readFile(currentFile.workspaceId, currentFile.fileName);
    }
  }, [resetFileView, readFile, refreshCatalog, selectedFile, selectedWorkspaceId]);

  /** 原 N（202758–202768）：进入项目（记滚动位置，回顶部） */
  const selectWorkspace = React.useCallback(
    (workspace: ProjectMemoryWorkspace) => {
      projectsScrollTopRef.current = containerRef.current?.closest("main")?.scrollTop ?? 0;
      resetFileView();
      setSelectedWorkspaceId(workspace.id);
      requestAnimationFrame(() => {
        const main = containerRef.current?.closest("main");
        if (main) main.scrollTop = 0;
      });
    },
    [resetFileView],
  );

  /** 原 P（202769–202776）：返回文件列表（恢复文件滚动位置） */
  const backToMemories = React.useCallback(() => {
    resetFileView();
    requestAnimationFrame(() => {
      const main = containerRef.current?.closest("main");
      if (main) main.scrollTop = filesScrollTopRef.current;
    });
  }, [resetFileView]);

  /** 原 F（202777–202784）：返回项目列表（恢复项目滚动位置） */
  const backToProjects = React.useCallback(() => {
    resetFileView();
    setSelectedWorkspaceId(null);
    requestAnimationFrame(() => {
      const main = containerRef.current?.closest("main");
      if (main) main.scrollTop = projectsScrollTopRef.current;
    });
  }, [resetFileView]);

  /* 原 202785–202790：卸载时作废在途文件请求 */
  React.useEffect(
    () => () => {
      fileRequestIdRef.current += 1;
    },
    [],
  );

  return (
    <div ref={containerRef} className="space-y-6">
      {/* 工作区记忆开关（进入项目后隐藏；202793–202808） */}
      {selectedWorkspace ? null : (
        <SettingsSectionCard>
          <SettingsRow
            label={intl.formatMessage({ id: "settings.memory.workspaceMemory" })}
            description={intl.formatMessage({ id: "settings.memoryDescription" })}
            control={
              <Switch
                aria-label={intl.formatMessage({ id: "settings.memory.workspaceMemory" })}
                checked={memoryEnabled}
                data-testid={SETTINGS_MEMORY_SWITCH_TESTID}
                onCheckedChange={(value) => {
                  onMemoryEnabledChange(value);
                }}
              />
            }
          />
        </SettingsSectionCard>
      )}
      {/* 查看器 / 禁用态 / 仅桌面提示（202809–202836） */}
      {projectMemoryViewerAvailable ? (
        memoryEnabled ? (
          <ProjectMemoryViewer
            catalogError={catalogError}
            catalogState={catalogState}
            fileContent={fileContent}
            fileError={fileError}
            fileState={fileState}
            selectedFileName={selectedFileName}
            selectedWorkspace={selectedWorkspace}
            workspaces={workspaces}
            onBackToMemories={backToMemories}
            onBackToProjects={backToProjects}
            onRefresh={refresh}
            onSelectFile={selectFile}
            onSelectWorkspace={selectWorkspace}
          />
        ) : (
          <div className="rounded-xl border border-border bg-card px-4 py-8 text-center text-ui-base text-foreground-subtle">
            {intl.formatMessage({ id: "settings.memory.viewer.disabled" })}
          </div>
        )
      ) : (
        <div className="rounded-xl border border-border bg-card px-4 py-8 text-center text-ui-base text-foreground-subtle">
          {intl.formatMessage({ id: "settings.memory.viewer.localOnly" })}
        </div>
      )}
    </div>
  );
}

import { joinTestidParts } from '../../modules/SrcSharedB'; // 〔A1-R42〕原 testidOf（经 modules/Settings 转取，qr 局部转录）收敛改指 canonical joinTestidParts@5017（R41 既判链）。尾部导入（R35 先例）；环安全：本文件→SrcSharedB 纯助手值闭包，无反向边。
