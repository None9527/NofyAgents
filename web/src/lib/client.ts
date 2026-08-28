// Transport selection: Electron preload (phase 2) > explicit ?ws= > env default
// (VITE_WS_URL, injected by scripts/dev.mjs) > local dev convention
// (ws://127.0.0.1:9800 with the dev secret). Mock is OFF by default and only
// used with an explicit ?mock=1 for offline UI work.

import { AcpTransport } from "./acp";
import { MockTransport } from "./mock";
import { HostClient } from "./rpc";
import { explicitWsUrl, type Transport } from "./transport";

export { HostClient };
export type { Transport };

const DEFAULT_WS_URL = "ws://127.0.0.1:9800/ws?server-key=devsecret";

export function createTransport(): Transport {
  if (window.grok?.transport) return window.grok.transport;

  const params = new URLSearchParams(location.search);
  if (params.get("mock") === "1") return new MockTransport();

  const wsUrl = explicitWsUrl() ?? DEFAULT_WS_URL;
  const cwd =
    params.get("cwd") ?? (import.meta.env.VITE_CWD as string | undefined) ?? "/";
  return new AcpTransport(wsUrl, cwd);
}
