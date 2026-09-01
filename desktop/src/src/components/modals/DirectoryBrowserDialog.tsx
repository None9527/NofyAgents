// A0-S4-4a: 自 modules/Modals.tsx 目录浏览器子族（§3，原 MEt）原样迁入（组件单元；原文件现为薄 re-export shim）。
// 迁出体 = 原文件 3308–3524；§0 BaseServices/DirectoryEntry（原 226–241）随族迁入（BaseServices 引用的
// SettingsSyncService 型别属主为 Onboarding 族文件，经下方 type import 取回）。
import * as React from "react";
import { Input } from '../../modules/ImeComposition';
import { Button } from '../../modules/button'; // 原 X，button-laUijeDG.js（A0-D 接线：declare → button canonical）
import { logger } from '../../modules/SkillStore';
import { useZCodeIntl as useIntlContext } from '../../modules/I18n'; // 原 G，IntlProvider-C321H7m8.js（A0-D 接线：declare → I18n canonical）
import { IconFolder, IconFolderSymlink } from '../../modules/Modals'; // §0 图标常量（createLucideIcon 产物）留存 shim
import type { SettingsSyncService } from './OnboardingDialog'; // §0 BaseServices 接口签名引用（型别属主：Onboarding 族文件）

/* §0 声明群随族迁入（原 226–241） */
/** 基础服务 context（原 fs()，本 chunk 2638） */
export interface BaseServices {
  settingsSyncService: SettingsSyncService;
  modelProviderService: { getAll(): Promise<unknown> };
  fileService: {
    readdir(params: { path: string; includeHidden?: boolean }): Promise<DirectoryEntry[]>;
  };
  systemService: { info(): Promise<{ homedir: string }> };
}

interface DirectoryEntry {
  name: string;
  path: string;
  type: string;
  isSymbolicLink?: boolean;
}

/* ============================================================================
 * 3. 目录浏览器子族（原 MEt，js 123942-124126 / jsx 105724）
 * ----------------------------------------------------------------------------
 * 挂载方式（g8t，js 213152-213166）：p4 scope=`directory-browser`
 * resetKeys=[`directory-browser`] variant=`silent` 包裹；open 态由 App root 的
 * `ne/re` 控制，onSelect → handleSelectProject。p4=ScopedErrorBoundary 已在
 * WorkspaceShell.tsx 还原。
 * ==========================================================================*/

/** 原 OEt（js 123946 / jsx 105703） */
function buildReaddirParams(path: string, includeHidden: boolean): { path: string; includeHidden?: boolean } {
  return includeHidden ? { path, includeHidden: true } : { path };
}
/** 原 kEt（js 123932 / jsx 105711） */
function filterDirectories(entries: DirectoryEntry[]): DirectoryEntry[] {
  return entries.filter((e) => e.type === `directory`);
}
/** 原 AEt（js 123952 / jsx 105714） */
function resolveFolderIconKind(entry: DirectoryEntry): "folder-symlink" | "folder" {
  return entry.type === `directory` && entry.isSymbolicLink === true ? `folder-symlink` : `folder`;
}
/** 原 jEt（js 123938-123941 / jsx 105717）：请求序号令牌（竞态保护） */
function createRequestToken(): { begin(): number; isCurrent(token: number): boolean } {
  let current = 0;
  return {
    begin: () => ((current += 1), current),
    isCurrent: (token) => token === current,
  };
}

/**
 * 原 MEt（js 123959-124126 / jsx 105724）：目录浏览对话框。
 * embedded=true 时只返回内容体（供远程向导 directory 步复用）；
 * 否则自带 fixed 遮罩层（点击遮罩取消、Escape 取消）。
 */
export function DirectoryBrowserDialog({
  services,
  onSelect,
  onCancel,
  onPathChange,
  embedded = false,
}: {
  services: BaseServices;
  onSelect: (path: string) => void;
  onCancel: () => void;
  onPathChange?: (path: string) => void;
  embedded?: boolean;
}) {
  const [currentPath, setCurrentPath] = React.useState(``);
  const [pathInput, setPathInput] = React.useState(``);
  const [entries, setEntries] = React.useState<DirectoryEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState(``);
  const [showHidden, setShowHidden] = React.useState(false);
  const listRef = React.useRef<HTMLDivElement>(null);
  const showHiddenRef = React.useRef(false);
  const requestTokenRef = React.useRef(createRequestToken());
  const { intl } = useIntlContext();
  React.useEffect(() => {
    services.systemService
      .info()
      .then((info) => {
        loadDirectory(info.homedir);
      })
      .catch((error) => {
        logger.error(`[DirectoryBrowser] 获取系统信息失败:`, error);
        setErrorMessage(intl.formatMessage({ id: `directoryBrowser.errorSystem` }));
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const loadDirectory = async (path: string, includeHidden = showHiddenRef.current) => {
    const token = requestTokenRef.current.begin();
    setLoading(true);
    setErrorMessage(``);
    try {
      const listing = await services.fileService.readdir(buildReaddirParams(path, includeHidden));
      if (!requestTokenRef.current.isCurrent(token)) return;
      setEntries(filterDirectories(listing));
      setCurrentPath(path);
      setPathInput(path);
      onPathChange?.(path);
      listRef.current?.scrollTo(0, 0);
    } catch (error) {
      if (!requestTokenRef.current.isCurrent(token)) return;
      logger.error(`[DirectoryBrowser] readdir 失败:`, error);
      setErrorMessage(intl.formatMessage({ id: `directoryBrowser.errorReadDir` }, { error: String(error) }));
    } finally {
      if (requestTokenRef.current.isCurrent(token)) setLoading(false);
    }
  };
  const goUp = () => {
    loadDirectory(currentPath.replace(/\/[^/]+\/?$/, ``) || `/`);
  };
  const submitPath = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = pathInput.trim();
    if (trimmed) loadDirectory(trimmed);
  };
  const toggleHidden = () => {
    const next = !showHiddenRef.current;
    showHiddenRef.current = next;
    setShowHidden(next);
    if (currentPath) loadDirectory(currentPath, next);
  };
  const confirmSelection = () => {
    const trimmed = currentPath.trim();
    if (!trimmed || loading) return;
    onSelect(trimmed);
  };
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === `Escape`) onCancel();
  };
  const content = (
    <div className={`flex min-h-0 flex-1 flex-col gap-3`}>
      <div>
        <div className={`mb-1 block text-ui-base text-foreground-subtle`}>
          {intl.formatMessage({ id: `directoryBrowser.title` })}
        </div>
        <form onSubmit={submitPath} className={`flex flex-col gap-2 sm:flex-row`}>
          <Input
            type="text"
            size="lg"
            value={pathInput}
            onChange={(event) => setPathInput(event.target.value)}
            placeholder={intl.formatMessage({ id: `directoryBrowser.pathPlaceholder` })}
            className={`h-9 min-w-0 flex-1 text-ui-base`}
            autoFocus
          />
          <div className={`flex gap-2 sm:shrink-0`}>
            <Button type="submit" size="lg" className={`h-9 min-w-0 flex-1 px-4 text-ui-base sm:flex-none`}>
              {intl.formatMessage({ id: `directoryBrowser.go` })}
            </Button>
            <Button
              type="button"
              variant={showHidden ? `secondary` : `outline`}
              size="lg"
              aria-pressed={showHidden}
              className={`h-9 min-w-0 flex-1 px-3 text-ui-base sm:flex-none`}
              onClick={toggleHidden}
            >
              {intl.formatMessage({
                id: showHidden ? `directoryBrowser.hideHidden` : `directoryBrowser.showHidden`,
              })}
            </Button>
          </div>
        </form>
      </div>
      {errorMessage ? <div className={`text-ui-base text-destructive`}>{errorMessage}</div> : null}
      <div ref={listRef} className={`flex-1 flex flex-col overflow-y-auto rounded-lg border border-border bg-background`}>
        {currentPath && currentPath !== `/` ? (
          <button
            onClick={goUp}
            className={`flex h-10 w-full shrink-0 cursor-pointer items-center gap-2 border-b border-border px-3 text-left text-ui-base transition hover:bg-hover/50`}
          >
            <IconFolder className={`size-4 shrink-0 text-foreground-subtle`} />
            <span className={`text-foreground`}>..</span>
          </button>
        ) : null}
        {loading ? (
          <div className={`p-4 text-center text-ui-base text-foreground-subtle`}>
            {intl.formatMessage({ id: `common.loading` })}
          </div>
        ) : entries.length === 0 ? (
          <div className={`p-4 text-center text-ui-base text-foreground-subtle`}>
            {intl.formatMessage({ id: `directoryBrowser.noSubdirs` })}
          </div>
        ) : (
          entries.map((entry) => (
            <button
              key={entry.path}
              onClick={() => loadDirectory(entry.path)}
              className={`flex w-full shrink-0 cursor-pointer items-center gap-2 px-3 py-2 text-left text-ui-base transition hover:bg-hover/50`}
            >
              {resolveFolderIconKind(entry) === `folder-symlink` ? (
                <IconFolderSymlink className={`size-4 shrink-0 text-foreground-subtle`} />
              ) : (
                <IconFolder className={`size-4 shrink-0 text-foreground-subtle`} />
              )}
              <span className={`truncate`}>{entry.name}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
  return embedded ? (
    content
  ) : (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm`}
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
      onKeyDown={handleKeyDown}
    >
      <div className={`flex h-[min(36rem,calc(100vh-4rem))] w-[min(44rem,calc(100vw-2rem))] flex-col rounded-xl border border-border bg-popover p-4 shadow-xl`}>
        {content}
        <div className={`mt-3 flex shrink-0 justify-end gap-2`}>
          <Button type="button" variant="secondary" size="lg" className={`h-10 min-w-0 px-5 text-ui-base`} onClick={onCancel}>
            {intl.formatMessage({ id: `common.cancel` })}
          </Button>
          <Button
            type="button"
            size="lg"
            className={`h-10 min-w-0 px-5 text-ui-base`}
            disabled={!currentPath.trim() || loading}
            onClick={confirmSelection}
          >
            {intl.formatMessage({ id: `directoryBrowser.selectDir` })}
          </Button>
        </div>
      </div>
    </div>
  );
}

