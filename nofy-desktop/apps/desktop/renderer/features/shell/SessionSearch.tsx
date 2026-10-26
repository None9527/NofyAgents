import { tr } from "../../ui/i18n.ts";
import { useLocale } from "../../ui/useLocale.ts";
import { useEffect, useRef, useState } from "react";
import type { Runtime } from "../../core/runtime.ts";
import { parseSessionSearch } from "../conversation/public.ts";
import type { SessionSearchHit } from "../conversation/public.ts";
export function SessionSearch({ runtime, cwd, onSelectSession }: { runtime: Runtime; cwd?: string; onSelectSession: (sessionId: string, cwd: string) => void | Promise<void> }) {
  useLocale();
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SessionSearchHit[]>([]);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bootstrapping, setBootstrapping] = useState(false);
  const generation = useRef(0);
  const search = async (offset: number, epoch: number) => {
    setBusy(true); setError(null);
    try {
      const result = await runtime.effect({ kind: "service/request", operation: "sessionSearch", params: { query: query.trim(), ...(cwd ? { cwd } : {}), limit: 20, offset, includeContent: true, headless: "exclude" } });
      if (generation.current !== epoch) return;
      if (!result.ok) throw new Error(result.error);
      const page = parseSessionSearch(result.value);
      setHits(previous => [...new Map([...(offset ? previous : []), ...page.hits].map(hit => [hit.sessionId, hit])).values()]);
      setNextOffset(page.nextOffset); setBootstrapping(page.bootstrapping);
    } catch (e) { if (generation.current === epoch) setError(e instanceof Error ? e.message : String(e)); }
    finally { if (generation.current === epoch) setBusy(false); }
  };
  useEffect(() => {
    const epoch = ++generation.current;
    setHits([]); setNextOffset(null); setBusy(false);
    if (!query.trim()) return;
    const timer = setTimeout(() => void search(0, epoch), 250);
    return () => { clearTimeout(timer); ++generation.current; };
  }, [query, cwd, runtime]);
  return <section aria-label={tr("历史内容搜索")}>
    <label>{tr("搜索历史标题与内容")}<input value={query} onChange={e => setQuery(e.target.value)} /></label>
    {busy && <p role="status">{tr("正在搜索…")}</p>}{error && <p role="alert">{error}</p>}
    {bootstrapping && <p role="status">{tr("历史索引正在建立，结果可能不完整。")}</p>}
    <ul>{hits.map(hit => <li key={hit.sessionId}><button onClick={() => void onSelectSession(hit.sessionId, hit.cwd)}>{hit.summary}</button><small>{hit.matchedFields.join(" / ")}</small>{hit.snippet && <p>{hit.snippet}</p>}</li>)}</ul>
    {nextOffset !== null && <button disabled={busy} onClick={() => void search(nextOffset, generation.current)}>{tr("加载更多")}</button>}
  </section>;
}
