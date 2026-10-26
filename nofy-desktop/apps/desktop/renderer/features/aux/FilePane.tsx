import type { CSSProperties } from "react";
import { ResourceHeader } from "./ResourceHeader.tsx";
import { TreeResizeHandle } from "./TreeResizeHandle.tsx";
import { tr } from "../../ui/i18n.ts";
import { useLocale } from "../../ui/useLocale.ts";
import { PaneEmpty, PaneButton } from "../../ui/workbench.tsx";
import { IconFile, IconFolder } from "../../ui/icons.tsx";
import type { DesktopClient } from "../../application/contracts/public.ts";
import { isMarkdown, useFileWorkspace } from "../../application/workspace/public.ts";
import { FileViewer } from "./FileViewer.tsx";
import { WorkspaceExplorer } from "./WorkspaceExplorer.tsx";
export type FilePaneProps = { client: DesktopClient; root: string | null; files: ReturnType<typeof useFileWorkspace> };
/** Composition only: query and resource-tab ownership live in application/workspace. */
export function FilePane({ client, root, files }: FilePaneProps) {
  useLocale();
  const tab = files.resources.tabs.find(tab => tab.path === files.resources.active) ?? null;
  const resource = tab ? files.documents[tab.path] : null;
  if (!root) return <PaneEmpty icon={<IconFolder size={24}/>} description={tr("会话还没关联文件夹。建一个会话，文件树就有根了。")}/>;
  return <section className={"filepane fileworkspace" + (files.treeOpen ? " fileworkspace--tree" : "")} aria-label={tr("文件工作区")} style={{ "--file-tree-width": files.treeWidth + "px" } as CSSProperties}>
    <ResourceHeader client={client} root={root} path={tab?.path ?? root} treeOpen={files.treeOpen} onToggleTree={files.toggleTree}>
        {tab && isMarkdown(tab.path) ? <PaneButton responsive icon={<IconFile size={16}/>} label={tab.mode === "preview" ? tr("查看源码") : tr("预览 Markdown")} title={tab.mode === "preview" ? tr("查看源码") : tr("预览 Markdown")} onClick={() => files.setMode(tab.path, tab.mode === "preview" ? "source" : "preview")}/> : null}
    </ResourceHeader>
    {files.error ? <p className="filepane__error" role="alert">{files.error}</p> : null}
    <div className="fileworkspace__split">
      <main className="fileworkspace__content">
        {tab ? <><FileViewer tab={tab} file={resource?.file ?? null} busy={resource?.busy ?? false} error={resource?.error ?? null} onPosition={files.savePosition} /><footer className="fileworkspace__meta">{resource?.busy ? tr("读取中…") : resource?.stale ? tr("显示缓存内容，请刷新以确认最新状态。") : tr("只读预览，内容可能截断。")}{resource?.file ? " · " + (resource.file.lineCount ?? "?") + tr(" 行 · ") + (resource.file.size ?? "?") + " B" : ""}</footer></> : <PaneEmpty icon={<IconFile size={24}/>} title={tr("选择文件")} description={tr("从文件树选择文件开始阅读。")}/>}
      </main>
      {files.treeOpen ? <TreeResizeHandle width={files.treeWidth} onChange={files.setTreeWidth} /> : null}
      {files.treeOpen ? <WorkspaceExplorer root={root} dirs={files.dirs} expanded={files.expanded} active={files.resources.active} query={files.query} matches={files.matches} searching={Boolean(files.query.trim())} searchReady={files.search !== null} searchError={files.error !== null} onQuery={files.setQuery} onToggle={path => { if (files.query) files.setQuery(""); files.toggleDir(path); }} onOpen={(path, pinned) => { void files.openFile(path, pinned); }} /> : null}
    </div>
  </section>;
}
