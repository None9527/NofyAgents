import { useEffect, useRef, useState } from "react";
import type { Runtime } from "../../core/runtime.ts";
import { clearBrowserRecents, loadBrowserRecents } from "../../ui/browserRecents.ts";
import { loadExtensionsHidden, saveExtensionsHidden } from "../../ui/browserChromePrefs.ts";
import { useStableCallback } from "../../ui/useStableCallback.ts";
import type { BrowserChromeDevice, BrowserChromeDownload, BrowserChromeExtension, BrowserChromeNote, BrowserChromeRecent, BrowserChromeState } from "../../ui/browserChrome.tsx";

type HostRequest = Parameters<Runtime["bridge"]["browserHost"]>[0];

export function useBrowserChrome(runtime: Runtime, pageReady: boolean, onNavigate: (url: string) => void, onRecentsCleared: () => void): BrowserChromeState {
  const [menu, setMenu] = useState<BrowserChromeState["menu"]>(null);
  const [dialog, setDialog] = useState<BrowserChromeState["dialog"]>(null);
  const [extensionsHidden, setExtensionsHidden] = useState(() => loadExtensionsHidden());
  const [zoomLabel, setZoomLabel] = useState("100%");
  const [device, setDevice] = useState<BrowserChromeDevice>("off");
  const [extensions, setExtensions] = useState<BrowserChromeExtension[]>([]);
  const [downloads, setDownloads] = useState<BrowserChromeDownload[]>([]);
  const [history, setHistory] = useState<BrowserChromeRecent[]>([]);
  const [note, setNote] = useState<BrowserChromeNote>(null);
  const [findOpen, setFindOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [find, setFind] = useState<BrowserChromeState["find"]>(null);
  const cleared = useRef(onRecentsCleared);
  const navigate = useRef(onNavigate);
  cleared.current = onRecentsCleared;
  navigate.current = onNavigate;
  const send = useStableCallback(async (request: HostRequest, quiet = false) => {
    try {
      const result = await runtime.bridge.browserHost(request);
      if (!result.ok) {
        setNote({ kind: "error", code: result.error });
        return;
      }
      setZoomLabel(result.zoomLabel);
      setDevice(result.device);
      setDownloads(result.downloads);
      setExtensions(result.extensions);
      setFind(result.find);
      if (quiet || result.cancelled) return;
      if (result.saved) setNote({ kind: "saved" });
      else if (result.store) setNote({ kind: "store" });
      else if (result.cleared) {
        clearBrowserRecents();
        cleared.current();
        setHistory([]);
        setNote({ kind: "cleared" });
      } else if (result.imported !== null) setNote(result.imported > 0 ? { kind: "imported", count: result.imported } : { kind: "empty-import" });
    } catch {
      if (!quiet) setNote({ kind: "error", code: "invalid" });
    }
  });
  useEffect(() => {
    void runtime.bridge.browserHost({ action: "status" }).then(result => {
      if (!result.ok) return;
      setZoomLabel(result.zoomLabel);
      setDevice(result.device);
      setDownloads(result.downloads);
      setExtensions(result.extensions);
    }, () => undefined);
    return runtime.bridge.onBrowserHostEvent(event => setDownloads(event.downloads));
  }, [runtime]);
  useEffect(() => {
    if (!findOpen || !pageReady || !query.trim()) return;
    const timer = setTimeout(() => {
      void runtime.bridge.browserHost({ action: "find", text: query, forward: true }).then(result => {
        if (result.ok) setFind(result.find);
      }, () => undefined);
    }, 180);
    return () => clearTimeout(timer);
  }, [findOpen, pageReady, query, runtime]);
  useEffect(() => {
    if (pageReady || !findOpen) return;
    setFindOpen(false);
    void runtime.bridge.browserHost({ action: "find-stop" }).then(() => undefined, () => undefined);
  }, [pageReady, findOpen, runtime]);
  const run = (request: HostRequest) => { setMenu(null); void send?.(request); };
  const hideExtensions = () => { saveExtensionsHidden(true); setExtensionsHidden(true); setMenu(null); };
  const showExtensions = () => { saveExtensionsHidden(false); setExtensionsHidden(false); setMenu(null); };
  return {
    pageReady,
    menu,
    setMenu,
    extensionsHidden,
    zoomLabel,
    device,
    extensions,
    downloads,
    history,
    dialog,
    note,
    findOpen,
    query,
    find,
    setQuery,
    openFind: () => { if (!pageReady) return; setMenu(null); setFindOpen(true); },
    closeFind: () => { setFindOpen(false); setFind(null); void send?.({ action: "find-stop" }, true); },
    findStep: (forward) => { if (query.trim()) void send?.({ action: "find", text: query, forward }, true); },
    zoom: (direction) => { void send?.({ action: "zoom", direction }, true); },
    setDevicePreset: (preset) => { void send?.({ action: "device", preset }, true); },
    printPage: () => run({ action: "print" }),
    capture: () => run({ action: "screenshot" }),
    importCookies: () => run({ action: "import-cookies" }),
    openDownloads: () => { setMenu(null); setDialog("downloads"); },
    openHistory: () => { setMenu(null); setHistory(loadBrowserRecents()); setDialog("history"); },
    openClear: () => { setMenu(null); setDialog("clear"); },
    confirmClear: () => { setDialog(null); void send?.({ action: "clear" }); },
    openSettings: () => { setMenu(null); setDialog("settings"); },
    openExtensions: () => { setMenu(null); setDialog("extensions"); },
    hideExtensions,
    showExtensions,
    openStore: () => run({ action: "open-store" }),
    loadExtension: () => { setDialog(null); void Promise.resolve(send?.({ action: "load-extension" })).then(() => setDialog("extensions")); },
    removeExtension: (id) => { void send?.({ action: "remove-extension", id }); },
    openDownload: (id) => { setDialog(null); void send?.({ action: "show-download", id }); },
    clearHistory: () => { clearBrowserRecents(); cleared.current(); setHistory([]); },
    openRecent: (url) => { setDialog(null); navigate.current(url); },
    closeDialog: () => setDialog(null),
  };
}
