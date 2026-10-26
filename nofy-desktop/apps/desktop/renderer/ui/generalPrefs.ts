const KEY = "nofy-desktop:general";

export type GeneralPrefs = {
  /** 空字符串表示交给内核：$SHELL -l。其它值原样传给 pty/create 的 shell。 */
  terminalShell: string;
  /** 空字符串使用界面默认等宽栈。 */
  terminalFont: string;
  showThoughts: boolean;
  keepAwake: boolean;
  notifyDone: boolean;
  notifySound: boolean;
  httpProxy: string;
  noProxy: string;
};

export const GENERAL_DEFAULTS: GeneralPrefs = {
  terminalShell: "",
  terminalFont: "",
  showThoughts: true,
  keepAwake: false,
  notifyDone: false,
  notifySound: false,
  httpProxy: "",
  noProxy: "",
};

const listeners = new Set<() => void>();
let snapshot: GeneralPrefs | null = null;

type Store = { getItem: (key: string) => string | null; setItem: (key: string, value: string) => void };
const storage = (): Store | null => {
  const host = globalThis as { localStorage?: Store };
  return host.localStorage ?? null;
};

function text(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length > max || /[\r\n\0]/.test(trimmed)) return null;
  return trimmed;
}

/** 只允许绝对路径。空字符串表示跟随系统登录 shell。 */
export function terminalShellParam(shell: string): string | undefined {
  const value = shell.trim();
  if (value === "") return undefined;
  if (!/^\/[\w.+@~/-]{1,240}$/.test(value)) return undefined;
  return value;
}

function readStored(): GeneralPrefs {
  try {
    const raw = storage()?.getItem(KEY);
    if (raw === undefined || raw === null) return { ...GENERAL_DEFAULTS };
    const parsed: unknown = JSON.parse(raw);
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) return { ...GENERAL_DEFAULTS };
    const row = parsed as Record<string, unknown>;
    return {
      terminalShell: terminalShellParam(text(row["terminalShell"], 240) ?? "") ?? "",
      terminalFont: text(row["terminalFont"], 240) ?? "",
      showThoughts: row["showThoughts"] !== false,
      keepAwake: row["keepAwake"] === true,
      notifyDone: row["notifyDone"] === true,
      notifySound: row["notifySound"] === true,
      httpProxy: text(row["httpProxy"], 300) ?? "",
      noProxy: text(row["noProxy"], 500) ?? "",
    };
  } catch {
    return { ...GENERAL_DEFAULTS };
  }
}

/** 同一份快照必须稳定返回，否则 useSyncExternalStore 会无限重绘并把界面打黑。 */
export function loadGeneralPrefs(): GeneralPrefs {
  if (snapshot === null) snapshot = readStored();
  return snapshot;
}

export function saveGeneralPrefs(patch: Partial<GeneralPrefs>): GeneralPrefs {
  const current = loadGeneralPrefs();
  const requestedShell = patch.terminalShell === undefined ? current.terminalShell : patch.terminalShell;
  const next: GeneralPrefs = {
    ...current,
    ...patch,
    terminalShell: requestedShell.trim() === "" ? "" : terminalShellParam(requestedShell) ?? current.terminalShell,
    terminalFont: patch.terminalFont === undefined ? current.terminalFont : text(patch.terminalFont, 240) ?? current.terminalFont,
    httpProxy: patch.httpProxy === undefined ? current.httpProxy : text(patch.httpProxy, 300) ?? current.httpProxy,
    noProxy: patch.noProxy === undefined ? current.noProxy : text(patch.noProxy, 500) ?? current.noProxy,
  };
  if (next.terminalShell === current.terminalShell && next.terminalFont === current.terminalFont && next.showThoughts === current.showThoughts && next.keepAwake === current.keepAwake && next.notifyDone === current.notifyDone && next.notifySound === current.notifySound && next.httpProxy === current.httpProxy && next.noProxy === current.noProxy) return current;
  snapshot = next;
  try { storage()?.setItem(KEY, JSON.stringify(next)); } catch { /* Preferences are optional. */ }
  for (const listener of [...listeners]) listener();
  return next;
}

export function subscribeGeneralPrefs(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
