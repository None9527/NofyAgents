// Phase 2 stub — NOT wired into any build yet.
// Preload script: exposes a Transport on window.grok so the renderer's
// createTransport() picks it up automatically (see src/lib/client.ts).
// The renderer itself never touches Node/Electron APIs.

import { contextBridge, ipcRenderer } from "electron";
import type { Transport } from "../src/lib/transport";

const transport: Transport = {
  kind: "ipc",
  request<T>(method: string, params?: unknown): Promise<T> {
    return ipcRenderer.invoke("grok:request", method, params) as Promise<T>;
  },
  subscribe(event, handler) {
    const listener = (_event: unknown, payload: unknown) => handler(payload as never);
    ipcRenderer.on(`grok:event:${event}`, listener);
    return () => ipcRenderer.removeListener(`grok:event:${event}`, listener);
  },
  close() {
    ipcRenderer.send("grok:close");
  },
};

contextBridge.exposeInMainWorld("grok", { transport });
