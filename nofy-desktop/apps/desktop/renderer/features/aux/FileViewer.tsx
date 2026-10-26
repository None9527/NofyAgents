import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { PaneEmpty } from "../../ui/workbench.tsx";
import { CodeBlock } from "../../ui/codeblock.tsx";
import { Markdown } from "../../ui/markdown.tsx";
import { tr } from "../../ui/i18n.ts";
import { useLocale } from "../../ui/useLocale.ts";
import type { FsFile } from "../../ui/readers.ts";
import type { FileViewMode, ResourceTab } from "../../application/workspace/public.ts";
export function FileViewer({ tab, file, busy, error, onPosition }: { tab: ResourceTab; file: FsFile | null; busy: boolean; error: string | null; onPosition: (path: string, mode: FileViewMode, top: number) => void }) {
  const locale = useLocale();
  const [brokenImage, setBrokenImage] = useState<string | null>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const pendingRestore = useRef<number | null>(null);
  const restore = useRef<() => void>(() => {});
  const filename = tab.path.split("/").pop() ?? "";
  const language = filename.includes(".") ? filename.split(".").pop() ?? null : null;
  const content = useMemo(() => !file ? null : file.type === "image" && brokenImage === file.content ? <PaneEmpty description={tr("图片无法解码，请在其他应用中打开。")}/> : file.type === "image" ? <div className="fileworkspace__image"><img src={file.content} alt={tab.path.split("/").pop() ?? ""} onLoad={() => restore.current()} onError={() => setBrokenImage(file.content)} /></div> : file.type === "unsupported" || file.type === "binary" ? <PaneEmpty description={tr("此类型暂不支持预览，请使用上方打开方式查看。")}/> : tab.mode === "preview" ? <article className="fileworkspace__markdown"><Markdown text={file.content} /></article> : <CodeBlock defaultWrap lang={language} code={file.content} />, [file, tab.path, tab.mode, locale, brokenImage, language]);
  useLayoutEffect(() => {
    const node = viewport.current;
    if (!node || !file) return;
    pendingRestore.current = tab.positions[tab.mode];
    const attempt = () => {
      if (pendingRestore.current === null || !node.clientHeight) return;
      if (file.type === "image" && !node.querySelector<HTMLImageElement>("img")?.naturalWidth) return;
      node.scrollTop = pendingRestore.current;
      pendingRestore.current = null;
    };
    restore.current = attempt;
    const observer = new ResizeObserver(attempt);
    observer.observe(node);
    attempt();
    return () => { observer.disconnect(); restore.current = () => {}; };
  }, [tab.path, tab.mode, file?.content]);
  return <div className="filepane__preview-body" ref={viewport} onScroll={event => file && pendingRestore.current === null && onPosition(tab.path, tab.mode, event.currentTarget.scrollTop)}>
    {error ? <p className="filepane__error" role="alert">{error}</p> : null}
    {!file ? <PaneEmpty description={busy ? tr("读取中…") : tr("读取失败")}/> : content}
  </div>;
}
