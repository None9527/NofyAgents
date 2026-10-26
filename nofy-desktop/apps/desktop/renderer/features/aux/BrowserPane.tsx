import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Runtime } from "../../core/runtime.ts";
import { useBrowserFrame } from "../../application/workspace/public.ts";
import { tr } from "../../ui/i18n.ts";
import { useLocale } from "../../ui/useLocale.ts";
import { TextInput } from "../../ui/forms.tsx";
import { PaneIconButton } from "../../ui/workbench.tsx";
import { Btn } from "../../ui/primitives.tsx";
import { IconArrowLeft, IconArrowRight, IconExternal, IconRefresh, IconStop } from "../../ui/icons.tsx";
import { BrowserChromeButtons, BrowserChromeDialogs, BrowserChromeFind, BrowserChromeNote } from "../../ui/browserChrome.tsx";
import { browserRecentHost, loadBrowserRecents, rememberBrowserRecent } from "../../ui/browserRecents.ts";
import type { BrowserRecent } from "../../ui/browserRecents.ts";
import { useBrowserChrome } from "./useBrowserChrome.ts";

type BrowserState = { url: string; title: string; loading: boolean; canGoBack: boolean; canGoForward: boolean; error: string | null };
const EMPTY: BrowserState = { url: "", title: "", loading: false, canGoBack: false, canGoForward: false, error: null };

export type BrowserHomeTool = { id: string; label: string; title: string; icon: ReactNode; onClick: () => void };

function browserErrorText(code: string | null): string | null {
  if (!code) return null;
  if (code.startsWith("load:")) return tr("页面没有打开：") + code.slice("load:".length);
  if (code === "empty") return tr("请输入网址");
  if (code === "too-long") return tr("网址过长");
  if (code === "invalid") return tr("网址无法解析");
  if (code === "credentials") return tr("网址不能包含账号或密码");
  if (code === "scheme") return tr("只打开 http 和 https 页面");
  if (code === "host") return tr("网址缺少主机名");
  return tr("页面没有打开");
}

function siteMark(url: string): string {
  const host = browserRecentHost(url);
  return (host[0] ?? "?").toUpperCase();
}

/** User-driven page slot. The main process paints the page over the viewport; the kernel is not involved. */
export function BrowserPane(props: { runtime: Runtime; shown: boolean; tools?: BrowserHomeTool[] }) {
  useLocale();
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const [draft, setDraft] = useState("");
  const [focused, setFocused] = useState(false);
  const [state, setState] = useState<BrowserState>(EMPTY);
  const [recents, setRecents] = useState<BrowserRecent[]>(() => loadBrowserRecents());
  useEffect(() => props.runtime.bridge.onBrowserState(setState), [props.runtime]);
  useEffect(() => { if (!focused) setDraft(state.url); }, [focused, state.url]);
  useEffect(() => {
    if (!/^https?:\/\//.test(state.url)) return;
    setRecents(rememberBrowserRecent(state.url, state.title));
  }, [state.url, state.title]);
  useBrowserFrame(node, props.shown, bounds => { void props.runtime.bridge.browserSetBounds(bounds).then(setState, () => undefined); });
  const open = (raw: string) => {
    void props.runtime.bridge.browserNavigate(raw).then(setState, () => setState(current => ({ ...current, loading: false, error: "invalid" })));
  };
  const command = (name: "back" | "forward" | "reload" | "stop") => {
    void props.runtime.bridge.browserCommand(name).then(setState, () => undefined);
  };
  const message = browserErrorText(state.error);
  const tools = props.tools ?? [];
  const chrome = useBrowserChrome(props.runtime, state.url.length > 0, open, () => setRecents([]));
  return <section className="browserpane" aria-label={tr("应用内浏览器")}>
    <form className="browserpane__bar" onSubmit={event => { event.preventDefault(); open(draft); }}>
      <PaneIconButton type="button" aria-label={tr("后退")} title={tr("后退")} disabled={!state.canGoBack} onClick={() => command("back")}><IconArrowLeft size={16} /></PaneIconButton>
      <PaneIconButton type="button" aria-label={tr("前进")} title={tr("前进")} disabled={!state.canGoForward} onClick={() => command("forward")}><IconArrowRight size={16} /></PaneIconButton>
      {state.loading
        ? <PaneIconButton type="button" aria-label={tr("停止加载")} title={tr("停止加载")} onClick={() => command("stop")}><IconStop size={16} /></PaneIconButton>
        : <PaneIconButton type="button" aria-label={tr("重新加载")} title={tr("重新加载")} disabled={!state.url} onClick={() => command("reload")}><IconRefresh size={16} /></PaneIconButton>}
      <TextInput className="browserpane__address" aria-label={tr("网址")} placeholder={tr("搜索或输入网址")} value={draft} spellCheck={false} autoCapitalize="off" autoCorrect="off" onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === "Enter" && !event.nativeEvent.isComposing) { event.preventDefault(); open(draft); } }} />
      <BrowserChromeButtons state={chrome} />
      <PaneIconButton type="button" aria-label={tr("在系统浏览器中打开")} title={tr("在系统浏览器中打开")} disabled={!state.url} onClick={() => { void props.runtime.bridge.browserOpenExternal(state.url).then(result => { if (!result.ok) setState(current => ({ ...current, error: result.error })); }, () => setState(current => ({ ...current, error: "invalid" }))); }}><IconExternal size={16} /></PaneIconButton>
    </form>
    <BrowserChromeFind state={chrome} />
    <BrowserChromeNote state={chrome} />
    {message ? <p className="browserpane__error" role="alert">{message}</p> : null}
    <div className="browserpane__viewport" ref={setNode}>
      {state.url || tools.length === 0 ? null : <div className="ui-pane-home">
        <section className="ui-pane-home__tools" aria-label={tr("工具")}>
          <h2>{tr("工具")}</h2>
          <div className="ui-pane-home__grid">{tools.map(tool => <Btn key={tool.id} variant="ghost" size="md" className="ui-pane-choice" aria-label={tool.label} title={tool.title} onClick={tool.onClick}>{tool.icon}<span>{tool.label}</span></Btn>)}</div>
        </section>
        {recents.length > 0 ? <section className="ui-pane-home__sites" aria-label={tr("推荐")}>
          <h2>{tr("推荐")}</h2>
          <div className="ui-pane-home__row">{recents.map(site => <Btn key={site.url} variant="ghost" className="ui-pane-site" aria-label={site.title} title={site.url} onClick={() => open(site.url)}><span className="ui-pane-site__mark" aria-hidden="true">{siteMark(site.url)}</span><span>{site.title}</span></Btn>)}</div>
        </section> : null}
      </div>}
    </div>
    <BrowserChromeDialogs state={chrome} />
  </section>;
}
