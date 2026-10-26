/** Whether the extensions button is shown on the browser toolbar. Reversible from the options menu and browser settings. */
const KEY = "nofy-desktop:browser-extensions-hidden";

export function loadExtensionsHidden(): boolean {
  try { return window.localStorage.getItem(KEY) === "1"; } catch { return false; }
}

export function saveExtensionsHidden(hidden: boolean): void {
  try { window.localStorage.setItem(KEY, hidden ? "1" : "0"); } catch { /* The toolbar can still change for this render. */ }
}
