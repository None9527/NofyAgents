import assert from "node:assert/strict";
import test from "node:test";
import { loadGeneralPrefs, saveGeneralPrefs, terminalShellParam } from "../renderer/ui/generalPrefs.ts";

test("terminal shell is omitted for the login shell and kept for an absolute path", () => {
  assert.equal(terminalShellParam(""), undefined);
  assert.equal(terminalShellParam("  "), undefined);
  assert.equal(terminalShellParam("/bin/zsh"), "/bin/zsh");
  assert.equal(terminalShellParam("zsh"), undefined);
  assert.equal(terminalShellParam("/bin/zsh;rm"), undefined);
});

test("general prefs ignore an unsafe shell and keep the previous one", () => {
  const store = new Map<string, string>();
  const previous = globalThis.localStorage;
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value); },
  } });
  try {
    assert.equal(loadGeneralPrefs().showThoughts, true);
    assert.equal(saveGeneralPrefs({ terminalShell: "/bin/bash" }).terminalShell, "/bin/bash");
    assert.equal(saveGeneralPrefs({ terminalShell: "bash" }).terminalShell, "/bin/bash");
    assert.equal(saveGeneralPrefs({ terminalShell: "" }).terminalShell, "");
    assert.equal(saveGeneralPrefs({ httpProxy: "http://127.0.0.1:7890" }).httpProxy, "http://127.0.0.1:7890");
    assert.equal(saveGeneralPrefs({ httpProxy: "bad\nproxy" }).httpProxy, "http://127.0.0.1:7890");
  } finally {
    if (previous === undefined) delete (globalThis as { localStorage?: unknown }).localStorage;
    else Object.defineProperty(globalThis, "localStorage", { configurable: true, value: previous });
  }
});
