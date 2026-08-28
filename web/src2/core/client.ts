// 传输选择（清洗自旧 src/lib/client.ts）：
//   Electron preload > 显式 ?ws= > VITE_WS_URL > 本地约定 ws://127.0.0.1:9800
// mock 默认关闭，仅 ?mock=1 显式启用（离线 UI 施工用）。

import { AcpTransport } from "./acp";
import { MockTransport } from "./mock";
import { explicitWsUrl, getIpcTransport, type Transport } from "./transport";

const DEFAULT_WS_URL = "ws://127.0.0.1:9800/ws?server-key=devsecret";

export function createTransport(): Transport {
  const ipc = getIpcTransport();
  if (ipc) return ipc;

  const params = new URLSearchParams(location.search);
  if (params.get("mock") === "1") return new MockTransport();

  const wsUrl = explicitWsUrl() ?? DEFAULT_WS_URL;
  const cwd =
    params.get("cwd") ?? (import.meta.env.VITE_CWD as string | undefined) ?? "/";
  return new AcpTransport(wsUrl, cwd);
}
