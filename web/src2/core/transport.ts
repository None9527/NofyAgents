// 传输抽象（清洗自旧 src/lib/transport.ts）：
// 渲染层只认 Transport，不认具体后端。三种实现：
//   mock（离线 UI）/ ACP WebSocket（web 开发）/ Electron IPC（桌面，经 preload）。

import type { BackendEvents } from "./types";

export type TransportKind = "mock" | "websocket" | "ipc";

type EventPayload<K extends keyof BackendEvents> = BackendEvents[K];
type EventHandler<K extends keyof BackendEvents> = (payload: EventPayload<K>) => void;

export interface Transport {
  readonly kind: TransportKind;
  request<T>(method: string, params?: unknown): Promise<T>;
  subscribe<K extends keyof BackendEvents>(event: K, handler: EventHandler<K>): () => void;
  close(): void;
}

export abstract class BaseTransport implements Transport {
  abstract readonly kind: TransportKind;
  private handlers = new Map<string, Set<EventHandler<never>>>();

  protected emit<K extends keyof BackendEvents>(event: K, payload: EventPayload<K>): void {
    const set = this.handlers.get(event);
    if (!set) return;
    for (const handler of [...set]) (handler as EventHandler<K>)(payload);
  }

  /** 线路事件的静态类型只在运行期已知时使用。 */
  protected emitRaw(event: string, payload: unknown): void {
    this.emit(event as keyof BackendEvents, payload as EventPayload<keyof BackendEvents>);
  }

  subscribe<K extends keyof BackendEvents>(event: K, handler: EventHandler<K>): () => void {
    let set = this.handlers.get(event);
    if (!set) {
      set = new Set();
      this.handlers.set(event, set);
    }
    set.add(handler as EventHandler<never>);
    return () => set.delete(handler as EventHandler<never>);
  }

  abstract request<T>(method: string, params?: unknown): Promise<T>;
  abstract close(): void;
}

// 桌面桥接：不做全局 Window 增补（旧树已有声明，双树并行期避免类型冲突），
// 统一经这两个函数读取，类型在新树内闭环。

export interface DesktopBridge {
  isElectron?: boolean;
  termExec?: (command: string, cwd?: string) => Promise<{ output: string }>;
  fsRead?: (path: string) => Promise<{ content: string | null }>;
  fsList?: (dir: string) => Promise<Array<{ name: string; isDir: boolean }>>;
  selectDirectory?: () => Promise<string | null>;
  minimize?: () => void;
  toggleMaximize?: () => void;
  close?: () => void;
}

export function getDesktop(): DesktopBridge | undefined {
  return (window as unknown as { grokDesktop?: DesktopBridge }).grokDesktop;
}

export function getIpcTransport(): Transport | undefined {
  return (window as unknown as { grok?: { transport?: Transport } }).grok?.transport;
}

export function explicitWsUrl(): string | null {
  const fromQuery = new URLSearchParams(location.search).get("ws");
  if (fromQuery) return fromQuery;
  const fromEnv = import.meta.env.VITE_WS_URL as string | undefined;
  if (fromEnv) return fromEnv;
  return null;
}
