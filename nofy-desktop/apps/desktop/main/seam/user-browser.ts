/** One sandboxed WebContentsView per host window. The renderer only supplies bounds and URLs. */
import { app, BrowserWindow, dialog, session, WebContentsView, shell } from "electron";
import type { DownloadItem, Event, Result, Session, WebContents } from "electron";
import { randomUUID } from "node:crypto";
import { lstat, mkdir, readFile, realpath, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { IPC } from "../../preload/contract.ts";
import {
  BROWSER_DEVICES,
  USER_BROWSER_COMMANDS,
  allowBrowserNavigation,
  allowBrowserRequest,
  browserZoomLabel,
  clampBrowserBounds,
  parseCookieImport,
  parseUserBrowserUrl,
  readBrowserBounds,
  readBrowserHostRequest,
  sanitizeBrowserLoadError,
  stepBrowserZoom,
} from "../../shared/user-browser-contract.ts";
import type { BrowserDevice, BrowserDownload, BrowserExtensionInfo, BrowserHostRequest, BrowserHostResult, UserBrowserBounds, UserBrowserCommand, UserBrowserState } from "../../shared/user-browser-contract.ts";

const EMPTY: UserBrowserState = { url: "", title: "", loading: false, canGoBack: false, canGoForward: false, error: null };
const HIDDEN: UserBrowserBounds = { x: 0, y: 0, width: 0, height: 0, visible: false };
const REQUEST_FILTER = { urls: ["<all_urls>"] };
const PARTITION = "persist:nofy-browser";
const STORE_URL = "https://chromewebstore.google.com/category/extensions";
const hardened = new WeakSet<Session>();
const downloadRows: InternalDownload[] = [];
const downloadSinks = new Set<(rows: BrowserDownload[]) => void>();
let downloadsWatched = false;
let extensionsRestored: Promise<void> | null = null;

type InternalDownload = BrowserDownload & { path: string };

function contentLimit(win: BrowserWindow, host: WebContents): { width: number; height: number } {
  for (const child of win.contentView.children) {
    if (!("webContents" in child)) continue;
    const view = child as WebContentsView;
    if (view.webContents !== host) continue;
    const bounds = view.getBounds();
    return { width: Math.max(0, bounds.x + bounds.width), height: Math.max(0, bounds.y + bounds.height) };
  }
  const [width = 0, height = 0] = win.getContentSize();
  return { width, height };
}

type Slot = { view: WebContentsView; state: UserBrowserState; bounds: UserBrowserBounds; generation: number; home: boolean };

export class UserBrowserHost {
  private readonly slots = new Map<WebContents, Slot>();
  private readonly tails = new Map<WebContents, Promise<void>>();
  private readonly device = new WeakMap<WebContents, BrowserDevice>();
  private readonly findHits = new WeakMap<WebContents, { active: number; matches: number } | null>();
  private readonly emitDownloads = (rows: BrowserDownload[]) => {
    for (const host of this.slots.keys()) if (!host.isDestroyed()) host.send(IPC.browserHostEvent, { downloads: rows });
  };

  constructor() {
    downloadSinks.add(this.emitDownloads);
  }

  navigate(host: WebContents, input: unknown): Promise<UserBrowserState> {
    if (typeof input !== "string") throw new TypeError("url must be a string");
    const decision = parseUserBrowserUrl(input);
    if (!decision.ok) {
      const slot = this.slots.get(host);
      if (!slot) return Promise.resolve({ ...EMPTY, error: decision.error });
      this.patch(host, { loading: false, error: decision.error });
      return Promise.resolve(this.slots.get(host)?.state ?? { ...EMPTY, error: decision.error });
    }
    const slot = this.ensure(host);
    const generation = ++slot.generation;
    this.patch(host, { url: decision.url, loading: true, error: null });
    return slot.view.webContents.loadURL(decision.url).then(() => this.current(host), (cause: unknown) => {
      const live = this.slots.get(host);
      if (!live || live.generation !== generation || host.isDestroyed()) return live?.state ?? EMPTY;
      const message = cause instanceof Error ? cause.message : String(cause);
      if (/ERR_ABORTED/.test(message)) return live.state;
      this.patch(host, { loading: false, error: sanitizeBrowserLoadError(message) });
      return this.current(host);
    });
  }

  command(host: WebContents, input: unknown): UserBrowserState {
    if (typeof input !== "string" || !USER_BROWSER_COMMANDS.includes(input as UserBrowserCommand)) throw new TypeError("browser command");
    const command = input as UserBrowserCommand;
    if (command === "home") return this.showHome(host);
    const slot = this.slots.get(host);
    if (!slot || slot.view.webContents.isDestroyed()) return slot?.state ?? EMPTY;
    const guest = slot.view.webContents;
    if (command === "back" && guest.canGoBack()) guest.goBack();
    else if (command === "forward" && guest.canGoForward()) guest.goForward();
    else if (command === "reload") guest.reload();
    else if (command === "stop") guest.stop();
    this.patch(host, {});
    return this.current(host);
  }

  setBounds(host: WebContents, input: unknown): UserBrowserState {
    const requested = readBrowserBounds(input);
    if (!requested.visible && !this.slots.has(host)) return EMPTY;
    const slot = this.ensure(host);
    const win = BrowserWindow.fromWebContents(host);
    if (!win || win.isDestroyed()) return slot.state;
    slot.bounds = clampBrowserBounds(requested, contentLimit(win, host), host.getZoomFactor());
    this.apply(host);
    if (!host.isDestroyed()) host.send(IPC.browserState, slot.state);
    return slot.state;
  }

  async openExternal(input: unknown): Promise<{ ok: true } | { ok: false; error: string }> {
    if (typeof input !== "string") throw new TypeError("url must be a string");
    const decision = parseUserBrowserUrl(input);
    if (!decision.ok) return { ok: false, error: decision.error };
    await shell.openExternal(decision.url);
    return { ok: true };
  }

  act(host: WebContents, input: unknown): Promise<BrowserHostResult> {
    const request = readBrowserHostRequest(input);
    const previous = this.tails.get(host) ?? Promise.resolve();
    const run = previous.then(() => this.perform(host, request), () => this.perform(host, request));
    this.tails.set(host, run.then(() => undefined, () => undefined));
    return run;
  }

  disposeAll(): void {
    downloadSinks.delete(this.emitDownloads);
    for (const host of [...this.slots.keys()]) this.destroy(host);
  }

  private async perform(host: WebContents, request: BrowserHostRequest): Promise<BrowserHostResult> {
    if (host.isDestroyed()) return { ok: false, error: "invalid" };
    watchBrowserDownloads();
    try {
      await restoreBrowserExtensions();
      switch (request.action) {
        case "status":
        case "downloads":
        case "extensions":
          return this.snapshot(host);
        case "zoom": {
          const guest = this.guest(host);
          const next = stepBrowserZoom(guest.getZoomFactor(), request.direction);
          guest.setZoomFactor(next.factor);
          return this.snapshot(host);
        }
        case "device": {
          const guest = this.guest(host);
          if (request.preset === "off") guest.disableDeviceEmulation();
          else {
            const spec = BROWSER_DEVICES[request.preset];
            guest.enableDeviceEmulation({
              screenPosition: spec.mobile ? "mobile" : "desktop",
              screenSize: { width: spec.width, height: spec.height },
              viewPosition: { x: 0, y: 0 },
              deviceScaleFactor: spec.scale,
              viewSize: { width: spec.width, height: spec.height },
              scale: 1,
            });
          }
          this.device.set(host, request.preset);
          return this.snapshot(host);
        }
        case "find":
          return this.find(host, request.text, request.forward);
        case "find-stop":
          return this.stopFind(host);
        case "print": {
          const guest = this.page(host);
          guest.print({ silent: false, printBackground: true });
          return this.snapshot(host);
        }
        case "screenshot":
          return this.screenshot(host);
        case "clear": {
          const partition = browserPartition();
          await partition.clearCache();
          await partition.clearStorageData();
          await partition.clearAuthCache();
          return this.snapshot(host, { cleared: true });
        }
        case "import-cookies":
          return this.importCookies(host);
        case "show-download": {
          const row = downloadRows.find(item => item.id === request.id);
          if (!row?.openable || !row.path) return { ok: false, error: "download" };
          const failure = await shell.openPath(row.path);
          if (failure) return { ok: false, error: "download" };
          return this.snapshot(host);
        }
        case "load-extension":
          return this.loadExtension(host);
        case "remove-extension":
          return this.removeExtension(host, request.id);
        case "open-store":
          await shell.openExternal(STORE_URL);
          return this.snapshot(host, { store: true });
        default:
          return { ok: false, error: "invalid" };
      }
    } catch (error) {
      return { ok: false, error: safeHostError(error) };
    }
  }

  private async find(host: WebContents, text: string, forward: boolean): Promise<BrowserHostResult> {
    const guest = this.page(host);
    const query = text.trim();
    if (!query) return this.stopFind(host);
    const hit = await waitForFind(guest, query, forward);
    this.findHits.set(host, hit);
    return this.snapshot(host);
  }

  private stopFind(host: WebContents): BrowserHostResult {
    const guest = this.slots.get(host)?.view.webContents;
    if (guest && !guest.isDestroyed()) guest.stopFindInPage("clearSelection");
    this.findHits.set(host, null);
    return this.snapshot(host);
  }

  private async screenshot(host: WebContents): Promise<BrowserHostResult> {
    const guest = this.page(host);
    const image = await guest.capturePage();
    const win = BrowserWindow.fromWebContents(host) ?? undefined;
    const options = { defaultPath: "nofy-browser.png", filters: [{ name: "PNG", extensions: ["png"] }] };
    const picked = win ? await dialog.showSaveDialog(win, options) : await dialog.showSaveDialog(options);
    if (picked.canceled || !picked.filePath) return this.snapshot(host, { cancelled: true });
    await writeFile(picked.filePath, image.toPNG());
    return this.snapshot(host, { saved: true });
  }

  /** User-picked file only. Password records are dropped and never returned or logged. */
  private async importCookies(host: WebContents): Promise<BrowserHostResult> {
    const win = BrowserWindow.fromWebContents(host) ?? undefined;
    const options = { title: "导入 Cookie", properties: ["openFile"] as ("openFile")[], filters: [{ name: "Cookie", extensions: ["txt", "json"] }] };
    const picked = win ? await dialog.showOpenDialog(win, options) : await dialog.showOpenDialog(options);
    const filePath = picked.canceled ? "" : picked.filePaths[0] ?? "";
    if (!filePath) return this.snapshot(host, { cancelled: true });
    const info = await stat(filePath);
    if (!info.isFile() || info.size > 2_000_000) throw new Error("cookie-file");
    const plan = parseCookieImport(await readFile(filePath, "utf8"));
    const partition = browserPartition();
    let imported = 0;
    for (const cookie of plan.cookies) {
      const url = (cookie.secure ? "https://" : "http://") + cookie.domain.replace(/^\./, "") + cookie.path;
      try {
        await partition.cookies.set({
          url,
          name: cookie.name,
          value: cookie.value,
          domain: cookie.domain,
          path: cookie.path,
          secure: cookie.secure,
          httpOnly: cookie.httpOnly,
          expirationDate: cookie.expirationDate ?? undefined,
          sameSite: cookie.sameSite ?? undefined,
        });
        imported++;
      } catch { /* One bad row does not reveal the value. */ }
    }
    return this.snapshot(host, { imported, skippedPasswords: plan.skippedPasswords });
  }

  private async loadExtension(host: WebContents): Promise<BrowserHostResult> {
    const win = BrowserWindow.fromWebContents(host) ?? undefined;
    const options = { title: "加载未打包的扩展", properties: ["openDirectory"] as ("openDirectory")[] };
    const picked = win ? await dialog.showOpenDialog(win, options) : await dialog.showOpenDialog(options);
    const dir = picked.canceled ? "" : picked.filePaths[0] ?? "";
    if (!dir) return this.snapshot(host, { cancelled: true });
    const root = await unpackedExtensionRoot(dir);
    if (!root) throw new Error("extension");
    await browserPartition().extensions.loadExtension(root, { allowFileAccess: false });
    await rememberExtension(root, false);
    return this.snapshot(host);
  }

  private async removeExtension(host: WebContents, id: string): Promise<BrowserHostResult> {
    const partition = browserPartition();
    const found = partition.extensions.getAllExtensions().find(item => item.id === id);
    if (!found) return { ok: false, error: "extension" };
    partition.extensions.removeExtension(id);
    await rememberExtension(found.path, true);
    const root = await unpackedExtensionRoot(found.path);
    if (root && root !== found.path) await rememberExtension(root, true);
    return this.snapshot(host);
  }

  private guest(host: WebContents): WebContents {
    const guest = this.ensure(host).view.webContents;
    if (guest.isDestroyed()) throw new Error("invalid");
    return guest;
  }

  private page(host: WebContents): WebContents {
    const slot = this.slots.get(host);
    if (!slot?.state.url) throw new Error("empty");
    const guest = slot.view.webContents;
    if (guest.isDestroyed()) throw new Error("invalid");
    return guest;
  }

  private snapshot(host: WebContents, extra: Partial<BrowserHostResult & { ok: true }> = {}): BrowserHostResult {
    const guest = this.slots.get(host)?.view.webContents;
    const zoom = guest && !guest.isDestroyed() ? guest.getZoomFactor() : 1;
    const find = this.findHits.get(host) ?? null;
    return {
      ok: true,
      zoom,
      zoomLabel: browserZoomLabel(zoom),
      device: this.device.get(host) ?? "off",
      downloads: publicDownloads(),
      extensions: listExtensions(),
      find,
      imported: extra.imported ?? null,
      skippedPasswords: extra.skippedPasswords === true,
      cleared: extra.cleared === true,
      saved: extra.saved === true,
      cancelled: extra.cancelled === true,
      store: extra.store === true,
    };
  }

  private current(host: WebContents): UserBrowserState {
    return this.slots.get(host)?.state ?? EMPTY;
  }

  private ensure(host: WebContents): Slot {
    watchBrowserDownloads();
    const existing = this.slots.get(host);
    if (existing) return existing;
    const win = BrowserWindow.fromWebContents(host);
    if (!win || win.isDestroyed()) throw new Error("应用内浏览器只能挂在当前窗口上");
    const view = new WebContentsView({
      webPreferences: {
        partition: PARTITION,
        sandbox: true,
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: true,
        allowRunningInsecureContent: false,
        nodeIntegrationInSubFrames: false,
        spellcheck: false,
      },
    });
    view.setBackgroundColor("#00000000");
    view.setVisible(false);
    view.setBounds({ x: 0, y: 0, width: 0, height: 0 });
    this.harden(view.webContents.session);
    this.bindGuest(host, view);
    win.contentView.addChildView(view);
    const slot: Slot = { view, state: { ...EMPTY }, bounds: { ...HIDDEN }, generation: 0, home: false };
    this.slots.set(host, slot);
    host.once("destroyed", () => this.destroy(host));
    return slot;
  }

  private harden(partition: Session): void {
    if (hardened.has(partition)) return;
    hardened.add(partition);
    partition.setPermissionRequestHandler((_contents, _permission, callback) => { callback(false); });
    partition.webRequest.onBeforeRequest(REQUEST_FILTER, (details, callback) => {
      if (details.url === "about:blank" || details.url.startsWith("about:srcdoc")) {
        callback({ cancel: false });
        return;
      }
      callback({ cancel: !allowBrowserRequest(details.url) });
    });
  }

  private bindGuest(host: WebContents, view: WebContentsView): void {
    const guest = view.webContents;
    const reject = (url: string, mainFrame: boolean) => {
      if (this.slots.get(host)?.home && mainFrame && url === "about:blank") return false;
      if (allowBrowserNavigation(url, mainFrame)) return false;
      if (mainFrame) {
        const decision = parseUserBrowserUrl(url);
        this.patch(host, { loading: false, error: decision.ok ? "scheme" : decision.error });
      }
      return true;
    };
    guest.setWindowOpenHandler(({ url }) => {
      const decision = parseUserBrowserUrl(url);
      if (decision.ok) void this.navigate(host, decision.url);
      else this.patch(host, { loading: false, error: decision.error });
      return { action: "deny" };
    });
    guest.on("will-navigate", (event) => { if (reject(event.url, true)) event.preventDefault(); });
    guest.on("will-redirect", (event) => { if (reject(event.url, event.isMainFrame)) event.preventDefault(); });
    guest.on("will-frame-navigate", (event) => { if (reject(event.url, event.isMainFrame)) event.preventDefault(); });
    guest.on("did-start-loading", () => this.patch(host, { loading: true }));
    guest.on("did-stop-loading", () => this.patch(host, { loading: false }));
    guest.on("did-navigate", (_event, url) => {
      if (!allowBrowserNavigation(url, true)) return;
      this.patch(host, { url, error: null });
    });
    guest.on("did-navigate-in-page", (_event, url, isMainFrame) => {
      if (!isMainFrame || !allowBrowserNavigation(url, true)) return;
      this.patch(host, { url });
    });
    guest.on("page-title-updated", (_event, title) => this.patch(host, { title: title.slice(0, 500) }));
    guest.on("did-fail-load", (_event, code, description, _validated, isMainFrame) => {
      if (!isMainFrame || code === -3) return;
      this.patch(host, { loading: false, error: sanitizeBrowserLoadError(description) });
    });
  }

  /** Drop the open page and show the new-tab homepage. The side pane stays open. */
  private showHome(host: WebContents): UserBrowserState {
    const slot = this.slots.get(host);
    if (!slot || slot.view.webContents.isDestroyed()) return slot?.state ?? { ...EMPTY };
    const guest = slot.view.webContents;
    slot.home = true;
    slot.generation += 1;
    const generation = slot.generation;
    guest.stop();
    try { guest.stopFindInPage("clearSelection"); } catch { /* find may be idle */ }
    this.findHits.set(host, null);
    this.publishEmpty(host);
    const finish = () => {
      const live = this.slots.get(host);
      if (!live || live.generation !== generation || guest.isDestroyed()) return;
      try { guest.navigationHistory.clear(); } catch { /* history may already be empty */ }
      live.home = false;
      this.publishEmpty(host);
    };
    void guest.loadURL("about:blank").then(finish, finish);
    return { ...EMPTY };
  }

  private publishEmpty(host: WebContents): void {
    const slot = this.slots.get(host);
    if (!slot || host.isDestroyed()) return;
    slot.state = { ...EMPTY };
    this.apply(host);
    if (!host.isDestroyed()) host.send(IPC.browserState, slot.state);
  }

  private patch(host: WebContents, patch: Partial<UserBrowserState>): void {
    const slot = this.slots.get(host);
    if (!slot || host.isDestroyed() || slot.view.webContents.isDestroyed()) return;
    if (slot.home) {
      this.publishEmpty(host);
      return;
    }
    const guest = slot.view.webContents;
    const liveUrl = guest.getURL();
    slot.state = {
      url: patch.url ?? (allowBrowserNavigation(liveUrl, true) ? liveUrl : slot.state.url),
      title: (patch.title ?? guest.getTitle()).slice(0, 500),
      loading: patch.loading ?? guest.isLoading(),
      canGoBack: guest.canGoBack(),
      canGoForward: guest.canGoForward(),
      error: patch.error === undefined ? slot.state.error : patch.error,
    };
    this.apply(host);
    if (!host.isDestroyed()) host.send(IPC.browserState, slot.state);
  }

  private apply(host: WebContents): void {
    const slot = this.slots.get(host);
    if (!slot || slot.view.webContents.isDestroyed()) return;
    const show = slot.bounds.visible && slot.bounds.width >= 2 && slot.bounds.height >= 2 && slot.state.url.length > 0;
    if (!show) {
      slot.view.setVisible(false);
      slot.view.setBounds({ x: 0, y: 0, width: 0, height: 0 });
      return;
    }
    slot.view.setBounds({ x: slot.bounds.x, y: slot.bounds.y, width: slot.bounds.width, height: slot.bounds.height });
    slot.view.setVisible(true);
  }

  private destroy(host: WebContents): void {
    const slot = this.slots.get(host);
    if (!slot) return;
    this.slots.delete(host);
    this.tails.delete(host);
    const win = host.isDestroyed() ? null : BrowserWindow.fromWebContents(host);
    if (win && !win.isDestroyed()) win.contentView.removeChildView(slot.view);
    if (!slot.view.webContents.isDestroyed()) slot.view.webContents.close({ waitForBeforeUnload: false });
  }
}

function browserPartition(): Session {
  return session.fromPartition(PARTITION);
}

function publicDownloads(): BrowserDownload[] {
  return downloadRows.map(({ path: _path, ...row }) => row);
}

function watchBrowserDownloads(): void {
  if (downloadsWatched) return;
  downloadsWatched = true;
  browserPartition().on("will-download", (_event, item: DownloadItem) => {
    const row: InternalDownload = { id: randomUUID(), filename: clipName(item.getFilename()), state: "progressing", received: 0, total: finiteBytes(item.getTotalBytes()), openable: false, path: "" };
    downloadRows.unshift(row);
    if (downloadRows.length > 30) downloadRows.pop();
    const push = () => {
      row.filename = clipName(item.getFilename() || row.filename);
      row.received = finiteBytes(item.getReceivedBytes());
      row.total = finiteBytes(item.getTotalBytes());
      row.openable = row.state === "completed" && row.path.length > 0;
      const rows = publicDownloads();
      for (const sink of downloadSinks) sink(rows);
    };
    item.on("updated", push);
    item.once("done", (_done, state) => {
      row.state = state;
      row.path = item.getSavePath();
      push();
    });
    push();
  });
}

function listExtensions(): BrowserExtensionInfo[] {
  return browserPartition().extensions.getAllExtensions().slice(0, 50).flatMap(item => {
    const name = item.name.replace(/[\u0000-\u001f]/g, "").trim().slice(0, 120);
    const version = item.version.replace(/[\u0000-\u001f]/g, "").trim().slice(0, 40);
    if (!/^[a-z0-9_-]{8,128}$/i.test(item.id) || !name || !version) return [];
    return [{ id: item.id, name, version }];
  });
}

function restoreBrowserExtensions(): Promise<void> {
  if (!extensionsRestored) {
    extensionsRestored = (async () => {
      const partition = browserPartition();
      for (const dir of await readExtensionList()) {
        const root = await unpackedExtensionRoot(dir);
        if (!root) continue;
        try { await partition.extensions.loadExtension(root, { allowFileAccess: false }); } catch { /* A missing directory stays out of the list until it loads. */ }
      }
    })();
  }
  return extensionsRestored;
}

async function readExtensionList(): Promise<string[]> {
  try {
    const parsed = JSON.parse(await readFile(extensionFile(), "utf8")) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string" && item.length > 0 && item.length < 1024).slice(0, 20);
  } catch { return []; }
}

async function rememberExtension(dir: string, remove: boolean): Promise<void> {
  const current = await readExtensionList();
  const next = remove ? current.filter(item => item !== dir) : [dir, ...current.filter(item => item !== dir)].slice(0, 20);
  await mkdir(dirname(extensionFile()), { recursive: true });
  await writeFile(extensionFile(), JSON.stringify(next));
}

function extensionFile(): string {
  return join(app.getPath("userData"), "nofy-browser-extensions.json");
}

async function unpackedExtensionRoot(dir: string): Promise<string | null> {
  let root: string;
  try { root = await realpath(dir); } catch { return null; }
  const manifestPath = join(root, "manifest.json");
  try {
    const linked = await realpath(manifestPath);
    if (linked !== manifestPath) return null;
    const info = await lstat(manifestPath);
    if (!info.isFile() || info.size <= 0 || info.size > 1_000_000) return null;
    const parsed = JSON.parse(await readFile(manifestPath, "utf8")) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    const manifest = parsed as { manifest_version?: unknown; name?: unknown };
    if ((manifest.manifest_version !== 2 && manifest.manifest_version !== 3) || typeof manifest.name !== "string" || !manifest.name.trim()) return null;
  } catch { return null; }
  return root;
}

function waitForFind(guest: WebContents, text: string, forward: boolean): Promise<{ active: number; matches: number }> {
  return new Promise(resolve => {
    let settled = false;
    const finish = (value: { active: number; matches: number }) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      guest.removeListener("found-in-page", onFound);
      resolve(value);
    };
    const onFound = (_event: Event, result: Result) => {
      if (!result.finalUpdate) return;
      const active = Number.isInteger(result.activeMatchOrdinal) ? result.activeMatchOrdinal : 0;
      const matches = Number.isInteger(result.matches) ? result.matches : 0;
      finish({ active: Math.max(0, active), matches: Math.max(0, matches) });
    };
    const timer = setTimeout(() => finish({ active: 0, matches: 0 }), 2000);
    guest.on("found-in-page", onFound);
    if (guest.isDestroyed()) { finish({ active: 0, matches: 0 }); return; }
    guest.findInPage(text, { forward, findNext: true });
  });
}

function safeHostError(error: unknown): string {
  const message = error instanceof Error ? error.message : "";
  if (message === "empty" || message === "cookie-file" || message === "extension" || message === "download") return message;
  return "invalid";
}

function clipName(name: string): string {
  const cleaned = name.replace(/[\u0000-\u001f]/g, " ").trim();
  return (cleaned || "download").slice(0, 180);
}

function finiteBytes(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.min(value, 1e15);
}
