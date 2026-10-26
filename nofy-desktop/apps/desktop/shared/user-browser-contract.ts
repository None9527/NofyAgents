/** Host-owned in-app browser. This is not a kernel RPC and not an agent browser. */
export type UserBrowserErrorCode = "empty" | "too-long" | "invalid" | "credentials" | "scheme" | "host";
export type UserBrowserUrl = { ok: true; url: string } | { ok: false; error: UserBrowserErrorCode };
export type UserBrowserBounds = { x: number; y: number; width: number; height: number; visible: boolean };
export type UserBrowserCommand = "back" | "forward" | "reload" | "stop" | "home";
export type UserBrowserState = {
  url: string;
  title: string;
  loading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  error: string | null;
};
export type BrowserDevice = "off" | "phone" | "tablet" | "laptop";
export type BrowserDownloadState = "progressing" | "completed" | "cancelled" | "interrupted";
export type BrowserDownload = { id: string; filename: string; state: BrowserDownloadState; received: number; total: number; openable: boolean };
export type BrowserExtensionInfo = { id: string; name: string; version: string };
export type BrowserFindHit = { active: number; matches: number };
export type BrowserHostRequest =
  | { action: "status" | "find-stop" | "print" | "screenshot" | "clear" | "import-cookies" | "downloads" | "extensions" | "load-extension" | "open-store" }
  | { action: "find"; text: string; forward: boolean }
  | { action: "zoom"; direction: "in" | "out" | "reset" }
  | { action: "device"; preset: BrowserDevice }
  | { action: "show-download" | "remove-extension"; id: string };
export type BrowserHostOk = {
  ok: true;
  zoom: number;
  zoomLabel: string;
  device: BrowserDevice;
  downloads: BrowserDownload[];
  extensions: BrowserExtensionInfo[];
  find: BrowserFindHit | null;
  imported: number | null;
  skippedPasswords: boolean;
  cleared: boolean;
  saved: boolean;
  cancelled: boolean;
  store: boolean;
};
export type BrowserHostResult = BrowserHostOk | { ok: false; error: string };
export type BrowserHostEvent = { downloads: BrowserDownload[] };
export type UserBrowserAccess = {
  browserNavigate: (url: string) => Promise<UserBrowserState>;
  browserCommand: (command: UserBrowserCommand) => Promise<UserBrowserState>;
  browserSetBounds: (bounds: UserBrowserBounds) => Promise<UserBrowserState>;
  browserOpenExternal: (url: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  browserHost: (request: BrowserHostRequest) => Promise<BrowserHostResult>;
  onBrowserState: (cb: (state: UserBrowserState) => void) => () => void;
  onBrowserHostEvent: (cb: (event: BrowserHostEvent) => void) => () => void;
};

export const USER_BROWSER_COMMANDS: readonly UserBrowserCommand[] = ["back", "forward", "reload", "stop", "home"];
const MAX_URL = 8_000;

export function parseUserBrowserUrl(input: string): UserBrowserUrl {
  const raw = input.trim();
  if (!raw) return { ok: false, error: "empty" };
  if (raw.length > MAX_URL) return { ok: false, error: "too-long" };
  let url: URL;
  try { url = new URL(withScheme(raw)); } catch { return { ok: false, error: "invalid" }; }
  if (url.username || url.password) return { ok: false, error: "credentials" };
  if (url.protocol !== "http:" && url.protocol !== "https:") return { ok: false, error: "scheme" };
  if (!url.hostname) return { ok: false, error: "host" };
  return { ok: true, url: url.toString() };
}

export function allowBrowserNavigation(raw: string, mainFrame: boolean): boolean {
  if (!mainFrame && (raw === "about:blank" || raw.startsWith("about:srcdoc"))) return true;
  return parseUserBrowserUrl(raw).ok;
}

export function allowBrowserRequest(raw: string): boolean {
  try {
    const url = new URL(raw);
    return url.protocol === "http:" || url.protocol === "https:" || url.protocol === "ws:" || url.protocol === "wss:";
  } catch { return false; }
}

export function readBrowserBounds(value: unknown): UserBrowserBounds {
  if (!value || typeof value !== "object") throw new TypeError("bounds must be an object");
  const raw = value as Record<string, unknown>;
  for (const key of ["x", "y", "width", "height"] as const) {
    if (typeof raw[key] !== "number" || !Number.isFinite(raw[key])) throw new TypeError("bounds." + key);
  }
  if (typeof raw.visible !== "boolean") throw new TypeError("bounds.visible");
  return { x: raw.x as number, y: raw.y as number, width: raw.width as number, height: raw.height as number, visible: raw.visible };
}

export function clampBrowserBounds(bounds: UserBrowserBounds, content: { width: number; height: number }, zoom: number): UserBrowserBounds {
  const z = Number.isFinite(zoom) && zoom > 0 ? zoom : 1;
  const limitW = Math.max(0, Math.floor(content.width));
  const limitH = Math.max(0, Math.floor(content.height));
  const x = clamp(Math.round(bounds.x / z), 0, limitW);
  const y = clamp(Math.round(bounds.y / z), 0, limitH);
  return {
    x, y,
    width: clamp(Math.round(bounds.width / z), 0, limitW - x),
    height: clamp(Math.round(bounds.height / z), 0, limitH - y),
    visible: bounds.visible,
  };
}

export function sanitizeBrowserLoadError(message: string): string {
  const cleaned = message.replace(/[\u0000-\u001f]+/g, " ").trim().slice(0, 180);
  return "load:" + (cleaned || "failed");
}

export function isUserBrowserState(value: unknown): value is UserBrowserState {
  if (!value || typeof value !== "object") return false;
  const state = value as UserBrowserState;
  return typeof state.url === "string" && state.url.length <= MAX_URL
    && typeof state.title === "string" && state.title.length <= 500
    && typeof state.loading === "boolean"
    && typeof state.canGoBack === "boolean"
    && typeof state.canGoForward === "boolean"
    && (state.error === null || (typeof state.error === "string" && state.error.length <= 300));
}

function withScheme(raw: string): string {
  const scheme = raw.match(/^([a-zA-Z][a-zA-Z+\-.]*):(.*)$/);
  if (scheme) {
    const rest = scheme[2] ?? "";
    const port = /^\d{1,5}(?:[/?#]|$)/.test(rest);
    if (rest.startsWith("//") || !port) return raw;
  }
  const host = raw.split("/")[0]?.split("@").pop()?.replace(/:\d+$/, "").replace(/^\[|\]$/g, "") ?? "";
  if (host === "localhost" || host === "127.0.0.1" || host === "::1") return "http://" + raw;
  return "https://" + raw;
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export const BROWSER_ZOOM_STEPS = [
  { factor: 0.5, label: "50%" },
  { factor: 0.67, label: "67%" },
  { factor: 0.75, label: "75%" },
  { factor: 0.8, label: "80%" },
  { factor: 0.9, label: "90%" },
  { factor: 1, label: "100%" },
  { factor: 1.1, label: "110%" },
  { factor: 1.25, label: "125%" },
  { factor: 1.5, label: "150%" },
  { factor: 1.75, label: "175%" },
  { factor: 2, label: "200%" },
] as const;

export const BROWSER_DEVICES: Record<Exclude<BrowserDevice, "off">, { width: number; height: number; mobile: boolean; scale: number }> = {
  phone: { width: 390, height: 844, mobile: true, scale: 2 },
  tablet: { width: 820, height: 1180, mobile: true, scale: 2 },
  laptop: { width: 1280, height: 800, mobile: false, scale: 1 },
};

const COOKIE_CAP = 500;
const HOST_NAME = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;

export function stepBrowserZoom(current: number, direction: "in" | "out" | "reset"): { factor: number; label: string } {
  const base = BROWSER_ZOOM_STEPS[5] ?? { factor: 1, label: "100%" };
  if (direction === "reset" || !Number.isFinite(current)) return { factor: base.factor, label: base.label };
  if (direction === "in") {
    const next = BROWSER_ZOOM_STEPS.find(step => step.factor > current + 0.001) ?? BROWSER_ZOOM_STEPS[BROWSER_ZOOM_STEPS.length - 1] ?? base;
    return { factor: next.factor, label: next.label };
  }
  const previous = [...BROWSER_ZOOM_STEPS].reverse().find(step => step.factor < current - 0.001) ?? BROWSER_ZOOM_STEPS[0] ?? base;
  return { factor: previous.factor, label: previous.label };
}

export function browserZoomLabel(factor: number): string {
  const base = BROWSER_ZOOM_STEPS[5] ?? { factor: 1, label: "100%" };
  let best: { factor: number; label: string } = base;
  let distance = Infinity;
  for (const step of BROWSER_ZOOM_STEPS) {
    const gap = Math.abs(step.factor - factor);
    if (gap < distance) { distance = gap; best = step; }
  }
  return distance <= 0.02 ? best.label : Math.round(factor * 100) + "%";
}

export type ParsedBrowserCookie = {
  name: string;
  value: string;
  domain: string;
  path: string;
  secure: boolean;
  httpOnly: boolean;
  expirationDate: number | null;
  sameSite: "unspecified" | "no_restriction" | "lax" | "strict" | null;
};

export type CookieImportPlan = { cookies: ParsedBrowserCookie[]; skippedPasswords: boolean; rejected: number };

export function parseCookieImport(text: string): CookieImportPlan {
  const trimmed = text.trim();
  if (!trimmed) return { cookies: [], skippedPasswords: false, rejected: 0 };
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) return parseCookieJson(trimmed);
  return parseNetscapeCookies(text);
}

export function readBrowserHostRequest(value: unknown): BrowserHostRequest {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError("browser host");
  const raw = value as Record<string, unknown>;
  if ("cookies" in raw || "password" in raw || "value" in raw) throw new TypeError("browser host");
  const action = raw.action;
  if (action === "status" || action === "find-stop" || action === "print" || action === "screenshot" || action === "clear" || action === "import-cookies" || action === "downloads" || action === "extensions" || action === "load-extension" || action === "open-store") return { action };
  if (action === "find") {
    if (typeof raw.text !== "string" || raw.text.length > 200 || typeof raw.forward !== "boolean") throw new TypeError("find");
    return { action, text: raw.text, forward: raw.forward };
  }
  if (action === "zoom") {
    if (raw.direction !== "in" && raw.direction !== "out" && raw.direction !== "reset") throw new TypeError("zoom");
    return { action, direction: raw.direction };
  }
  if (action === "device") {
    if (raw.preset !== "off" && raw.preset !== "phone" && raw.preset !== "tablet" && raw.preset !== "laptop") throw new TypeError("device");
    return { action, preset: raw.preset };
  }
  if (action === "show-download") {
    if (typeof raw.id !== "string" || !/^[0-9a-f-]{36}$/i.test(raw.id)) throw new TypeError("download");
    return { action, id: raw.id };
  }
  if (action === "remove-extension") {
    if (typeof raw.id !== "string" || !/^[a-z0-9_-]{8,128}$/i.test(raw.id)) throw new TypeError("extension");
    return { action, id: raw.id };
  }
  throw new TypeError("browser host");
}

export function isBrowserHostResult(value: unknown): value is BrowserHostResult {
  if (!value || typeof value !== "object") return false;
  const row = value as BrowserHostResult;
  if (row.ok === false) return typeof row.error === "string" && row.error.length > 0 && row.error.length <= 40 && !row.error.includes(" ");
  if (row.ok !== true) return false;
  return typeof row.zoom === "number" && row.zoom >= 0.25 && row.zoom <= 5
    && typeof row.zoomLabel === "string" && row.zoomLabel.length <= 8
    && (row.device === "off" || row.device === "phone" || row.device === "tablet" || row.device === "laptop")
    && Array.isArray(row.downloads) && row.downloads.length <= 30 && row.downloads.every(isBrowserDownload)
    && Array.isArray(row.extensions) && row.extensions.length <= 50 && row.extensions.every(isBrowserExtension)
    && (row.find === null || isFindHit(row.find))
    && (row.imported === null || (typeof row.imported === "number" && Number.isInteger(row.imported) && row.imported >= 0 && row.imported <= COOKIE_CAP))
    && typeof row.skippedPasswords === "boolean"
    && typeof row.cleared === "boolean"
    && typeof row.saved === "boolean"
    && typeof row.cancelled === "boolean"
    && typeof row.store === "boolean";
}

export function isBrowserHostEvent(value: unknown): value is BrowserHostEvent {
  if (!value || typeof value !== "object") return false;
  const event = value as BrowserHostEvent;
  return Array.isArray(event.downloads) && event.downloads.length <= 30 && event.downloads.every(isBrowserDownload);
}

function isFindHit(value: unknown): value is BrowserFindHit {
  if (!value || typeof value !== "object") return false;
  const hit = value as BrowserFindHit;
  return typeof hit.active === "number" && Number.isInteger(hit.active) && hit.active >= 0 && hit.active <= 100000
    && typeof hit.matches === "number" && Number.isInteger(hit.matches) && hit.matches >= 0 && hit.matches <= 100000;
}

function isBrowserDownload(value: unknown): value is BrowserDownload {
  if (!value || typeof value !== "object") return false;
  const row = value as BrowserDownload;
  return typeof row.id === "string" && /^[0-9a-f-]{36}$/i.test(row.id)
    && typeof row.filename === "string" && row.filename.length > 0 && row.filename.length <= 180
    && (row.state === "progressing" || row.state === "completed" || row.state === "cancelled" || row.state === "interrupted")
    && typeof row.received === "number" && Number.isFinite(row.received) && row.received >= 0 && row.received <= 1e15
    && typeof row.total === "number" && Number.isFinite(row.total) && row.total >= 0 && row.total <= 1e15
    && typeof row.openable === "boolean";
}

function isBrowserExtension(value: unknown): value is BrowserExtensionInfo {
  if (!value || typeof value !== "object") return false;
  const row = value as BrowserExtensionInfo;
  return typeof row.id === "string" && /^[a-z0-9_-]{8,128}$/i.test(row.id)
    && typeof row.name === "string" && row.name.length > 0 && row.name.length <= 120
    && typeof row.version === "string" && row.version.length > 0 && row.version.length <= 40;
}

function parseCookieJson(text: string): CookieImportPlan {
  let parsed: unknown;
  try { parsed = JSON.parse(text) as unknown; } catch { return { cookies: [], skippedPasswords: false, rejected: 1 }; }
  const root = asRecord(parsed);
  const list = Array.isArray(parsed) ? parsed : root && Array.isArray(root.cookies) ? root.cookies : null;
  if (!list) {
    if (root && typeof root.password === "string") return { cookies: [], skippedPasswords: true, rejected: 0 };
    return { cookies: [], skippedPasswords: false, rejected: 1 };
  }
  const plan: CookieImportPlan = { cookies: [], skippedPasswords: false, rejected: 0 };
  for (const item of list) {
    if (plan.cookies.length >= COOKIE_CAP) { plan.rejected++; continue; }
    const record = asRecord(item);
    if (!record) { plan.rejected++; continue; }
    if (typeof record.password === "string") { plan.skippedPasswords = true; plan.rejected++; continue; }
    const cookie = cookieFromRecord(record);
    if (!cookie) { plan.rejected++; continue; }
    plan.cookies.push(cookie);
  }
  return plan;
}

function parseNetscapeCookies(text: string): CookieImportPlan {
  const plan: CookieImportPlan = { cookies: [], skippedPasswords: false, rejected: 0 };
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    let raw = line;
    let httpOnly = false;
    if (raw.startsWith("#HttpOnly_")) { httpOnly = true; raw = raw.slice("#HttpOnly_".length); }
    else if (raw.startsWith("#")) continue;
    if (plan.cookies.length >= COOKIE_CAP) { plan.rejected++; continue; }
    const parts = raw.split("\t");
    if (parts.length < 7) { plan.rejected++; continue; }
    const domainRaw = parts[0] ?? "";
    const flag = parts[1] ?? "";
    const path = parts[2] ?? "/";
    const secure = (parts[3] ?? "").toUpperCase() === "TRUE";
    const expiration = parts[4] ?? "";
    const name = parts[5] ?? "";
    const value = parts.slice(6).join("\t");
    const include = flag.toUpperCase() === "TRUE";
    let domain = domainRaw.trim().toLowerCase();
    if (include && !domain.startsWith(".")) domain = "." + domain;
    if (!include) domain = domain.replace(/^\./, "");
    const cookie = acceptCookie({ name, value, domain, path, secure, httpOnly, expirationDate: numberOrNull(expiration), sameSite: null });
    if (!cookie) { plan.rejected++; continue; }
    plan.cookies.push(cookie);
  }
  return plan;
}

function cookieFromRecord(record: Record<string, unknown>): ParsedBrowserCookie | null {
  if (typeof record.name !== "string" || typeof record.value !== "string" || typeof record.domain !== "string") return null;
  const hostOnly = record.hostOnly === true;
  let domain = record.domain.trim().toLowerCase();
  if (hostOnly) domain = domain.replace(/^\./, "");
  else if (record.hostOnly === false && !domain.startsWith(".")) domain = "." + domain;
  const path = typeof record.path === "string" ? record.path : "/";
  const expiration = typeof record.expirationDate === "number" ? record.expirationDate : typeof record.expires === "number" ? record.expires : null;
  return acceptCookie({
    name: record.name,
    value: record.value,
    domain,
    path,
    secure: record.secure === true,
    httpOnly: record.httpOnly === true,
    expirationDate: expiration,
    sameSite: sameSiteOf(record.sameSite),
  });
}

function acceptCookie(input: ParsedBrowserCookie): ParsedBrowserCookie | null {
  const name = input.name.trim();
  if (!name || name.length > 256 || /[\u0000-\u001f;=]/.test(name)) return null;
  if (input.value.length > 4096 || /[\u0000-\u001f]/.test(input.value)) return null;
  const host = input.domain.replace(/^\./, "");
  if (!host || host.length > 253 || !HOST_NAME.test(host)) return null;
  if (!input.path.startsWith("/") || input.path.length > 1024 || /[\u0000-\u001f\\]/.test(input.path)) return null;
  let expiration = input.expirationDate;
  if (expiration !== null) {
    if (!Number.isFinite(expiration) || expiration < 0) return null;
    if (expiration > 10_000_000_000) expiration = Math.floor(expiration / 1000);
    if (expiration !== 0 && expiration * 1000 < Date.now()) return null;
    if (expiration === 0) expiration = null;
  }
  return { name, value: input.value, domain: input.domain.toLowerCase(), path: input.path, secure: input.secure, httpOnly: input.httpOnly, expirationDate: expiration, sameSite: input.sameSite };
}

function sameSiteOf(value: unknown): ParsedBrowserCookie["sameSite"] {
  if (value === "lax" || value === "strict" || value === "unspecified") return value;
  if (value === "no_restriction" || value === "none") return "no_restriction";
  return null;
}

function numberOrNull(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}
