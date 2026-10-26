import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { PaneToolbar, PaneButton, PaneIconButton, PaneActionGroup, PaneMenuButton } from "../../ui/workbench.tsx";
import { IconChevronRight, IconCopy, IconFolder } from "../../ui/icons.tsx";
import { tr } from "../../ui/i18n.ts";
import type { DesktopClient, FileOpenKind } from "../../application/contracts/public.ts";
export function ResourceHeader({ client, root, path, treeOpen, onToggleTree, children }: { client: DesktopClient; root: string; path: string; treeOpen: boolean; onToggleTree: () => void; children: React.ReactNode }) {
  const mounted = useRef(false);
  const breadcrumb = useRef<HTMLElement>(null);
  const locked = useRef(false);
  const scope = JSON.stringify([root, path]);
  const latest = useRef({ scope, revision: 0 });
  if (latest.current.scope !== scope) latest.current = { scope, revision: latest.current.revision + 1 };
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => { setNotice(""); }, [path]);
  useLayoutEffect(() => { if (breadcrumb.current) breadcrumb.current.scrollLeft = breadcrumb.current.scrollWidth; }, [root, path]);
  const relative = path.startsWith(root + "/") ? path.slice(root.length + 1) : path === root ? "." : path;
  const segments = [root.split("/").pop() ?? root, ...(path.startsWith(root + "/") ? relative.split("/") : path === root ? [] : [path])];
  const run = async (work: () => ReturnType<DesktopClient["host"]["copyFilePath"]>, success: string) => {
    if (locked.current) return;
    const revision = latest.current.revision;
    const valid = () => mounted.current && latest.current.scope === scope && latest.current.revision === revision;
    locked.current = true; setBusy(true); setNotice("");
    try { const result = await work(); if (valid()) setNotice(result.ok ? result.canceled ? "" : result.application ? tr("已使用 {0} 打开", [result.application]) : success : result.error); }
    catch (error) { if (valid()) setNotice(error instanceof Error ? error.message : String(error)); }
    finally { locked.current = false; if (mounted.current) setBusy(false); }
  };
  const copy = (kind: string) => { void run(() => client.host.copyFilePath(kind === "relative" ? relative : kind === "name" ? path.split("/").pop() ?? path : path), tr("路径已复制")); };
  const open = (kind: FileOpenKind) => { void run(() => client.host.openWorkspacePath(path, kind), kind === "reveal" ? tr("已在文件管理器中显示") : tr("已交给系统打开")); };
  return <>
    <PaneToolbar className="fileworkspace__header">
      <nav ref={breadcrumb} className="fileworkspace__breadcrumbs" aria-label={tr("文件路径")} title={path}>
        {segments.map((segment, index) => <span className="fileworkspace__crumb" key={index}>{index > 0 ? <IconChevronRight size={12} /> : null}<span>{segment}</span></span>)}
      </nav>
      <div className="fileworkspace__actions">
        {children}
        <PaneActionGroup><PaneIconButton aria-label={tr("复制完整路径")} title={tr("复制完整路径")} disabled={busy} onClick={() => copy("absolute")}><IconCopy size={16} /></PaneIconButton>
          <PaneMenuButton compact trigger={<span className="sr-only">{tr("复制路径选项")}</span>} title={tr("复制路径选项")} disabled={busy} onPick={copy} items={[{ id: "absolute", label: tr("复制完整路径") }, { id: "relative", label: tr("复制相对路径") }, { id: "name", label: tr("复制文件名") }]} />
        </PaneActionGroup>
        <PaneActionGroup><PaneButton label={tr("打开")} disabled={busy} onClick={() => open("default")}/>
          <PaneMenuButton compact trigger={<span className="sr-only">{tr("打开方式")}</span>} title={tr("打开方式")} disabled={busy} onPick={kind => open(kind as FileOpenKind)} items={[{ id: "default", label: tr("使用系统默认应用") }, { id: "choose", label: tr("选择应用打开…") }, { id: "reveal", label: tr("在文件管理器中显示") }]} />
        </PaneActionGroup>
        <PaneIconButton className="fileworkspace__tree-toggle" aria-pressed={treeOpen} aria-label={treeOpen ? tr("隐藏文件树") : tr("显示文件树")} title={treeOpen ? tr("隐藏文件树") : tr("显示文件树")} onClick={onToggleTree}><IconFolder size={16} /></PaneIconButton>
      </div>
    </PaneToolbar>
    {notice ? <p className="fileworkspace__host-notice" role="status">{notice}</p> : null}
  </>;
}
