/** Pages this window actually opened. Nothing is seeded. */
const KEY = "nofy-desktop:browser-recents";
const MAX = 8;

export type BrowserRecent = { url: string; title: string };

function hostLabel(url: string): string {
  try { return new URL(url).host.replace(/^www\./, ""); }
  catch { return url; }
}

function read(value: unknown): BrowserRecent[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const rows: BrowserRecent[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const url = "url" in item && typeof item.url === "string" ? item.url : "";
    if (!/^https?:\/\//.test(url) || seen.has(url)) continue;
    const title = "title" in item && typeof item.title === "string" ? item.title.trim() : "";
    seen.add(url);
    rows.push({ url, title: title || hostLabel(url) });
    if (rows.length === MAX) break;
  }
  return rows;
}

export function loadBrowserRecents(): BrowserRecent[] {
  try { return read(JSON.parse(window.localStorage.getItem(KEY) ?? "[]")); }
  catch { return []; }
}

export function rememberBrowserRecent(url: string, title: string): BrowserRecent[] {
  if (!/^https?:\/\//.test(url)) return loadBrowserRecents();
  const next = read([{ url, title }, ...loadBrowserRecents().filter(item => item.url !== url)]);
  window.localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function browserRecentHost(url: string): string {
  return hostLabel(url);
}

export function clearBrowserRecents(): void {
  try { window.localStorage.removeItem(KEY); } catch { /* The list is already empty if storage is unavailable. */ }
}
