import { tr } from "../../ui/i18n.ts";
import { PaneSearch } from "../../ui/workbench.tsx";
import { IconChevronDown, IconChevronRight, IconFile, IconFolder } from "../../ui/icons.tsx";
import type { FsNode, FuzzyMatch } from "../../ui/readers.ts";
type Props = {
  root: string; dirs: Record<string, { nodes: FsNode[]; truncated: boolean }>; expanded: Set<string>;
  active: string | null; query: string; matches: FuzzyMatch[]; searching: boolean; searchReady: boolean; searchError: boolean;
  onQuery: (text: string) => void; onToggle: (path: string) => void; onOpen: (path: string, pinned?: boolean) => void;
};
export function WorkspaceExplorer(props: Props) {
  const { root, active, dirs, expanded } = props;
  const row = (node: FsNode | FuzzyMatch, depth: number) => <button key={node.path} type="button" className={"filetree__row" + (active === node.path ? " filetree__row--on" : "")} style={{ paddingLeft: 10 + depth * 14 }} title={node.path}
    onClick={() => node.type === "directory" ? props.onToggle(node.path) : props.onOpen(node.path)} onDoubleClick={() => { if (node.type !== "directory") props.onOpen(node.path, true); }}>
    <span className="filetree__disclosure">{node.type === "directory" ? expanded.has(node.path) ? <IconChevronDown size={12}/> : <IconChevronRight size={12}/> : null}</span><span className="filetree__icon">{node.type === "directory" ? <IconFolder size={16}/> : <IconFile size={16}/>}</span>
    <span className="filetree__name">{node.name}</span>
    {props.searching ? <span className="filetree__dir">{node.path.startsWith(root + "/") ? node.path.slice(root.length + 1) : node.path}</span> : null}
  </button>;
  const directory = (path: string, depth: number, ancestors: Set<string>): React.ReactNode => {
    if (ancestors.has(path) || depth > 32) return null;
    const entry = dirs[path];
    if (!entry) return <p className="fileworkspace__hint">{tr("读取中…")}</p>;
    const next = new Set(ancestors).add(path);
    return <>{entry.nodes.map(node => <div key={node.path}>{row(node, depth)}{node.type === "directory" && expanded.has(node.path) ? directory(node.path, depth + 1, next) : null}</div>)}{entry.truncated ? <p className="fileworkspace__hint">{tr("目录结果已截断，请使用搜索定位文件。")}</p> : null}{!entry.nodes.length ? <p className="fileworkspace__hint">{tr("没有文件。")}</p> : null}</>;
  };
  return <aside className="fileworkspace__explorer" aria-label={tr("工作区文件树")}>
    <div className="filepane__search"><PaneSearch label={tr("搜索文件")} value={props.query} autoComplete="off" spellCheck={false} placeholder={tr("搜索文件…")} onChange={event => props.onQuery(event.target.value)} /></div>
    <div className="filepane__body">{props.searching ? props.matches.length ? props.matches.map(node => row(node, 0)) : <p className="fileworkspace__hint">{props.searchError ? tr("搜索失败，请重试。") : props.searchReady ? tr("没有匹配的文件。") : tr("搜索会话建立中…")}</p> : directory(root, 0, new Set())}</div>
  </aside>;
}
