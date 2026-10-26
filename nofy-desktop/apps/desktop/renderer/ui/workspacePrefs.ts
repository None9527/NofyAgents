/** Window-only state. Kernel settings and credentials never use this storage. */
export function readPreference(key: string): unknown {
  try { return JSON.parse(window.localStorage.getItem("nofy-desktop:" + key) ?? "null") as unknown; }
  catch { return null; }
}
export function writePreference(key: string, value: unknown): boolean {
  try { window.localStorage.setItem("nofy-desktop:" + key, JSON.stringify(value)); return true; }
  catch { return false; }
}
