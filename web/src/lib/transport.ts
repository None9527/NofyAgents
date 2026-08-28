// Transport abstraction: the renderer talks to a Transport, never to a
// concrete backend. Today that is a WebSocket (web dev) or an in-memory mock
// (no backend needed). In phase 2 the Electron preload script exposes an
// IPC-backed transport on window.grok and nothing in the UI changes.

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

  /** For wire-originated events whose static type is only known at runtime. */
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

// ---------------------------------------------------------------------------
// WebSocket transport — JSON frames:
//   request:  { type: "req", id, method, params }
//   response: { type: "res", id, result?, error? }
//   event:    { type: "event", event, payload }
// ---------------------------------------------------------------------------

export class WebSocketTransport extends BaseTransport {
  readonly kind = "websocket" as const;
  private ws: WebSocket | null = null;
  private nextId = 1;
  private pending = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();
  private closedByUser = false;
  private reconnectTimer: number | null = null;

  constructor(readonly url: string) {
    super();
    this.connect();
  }

  private connect(): void {
    const ws = new WebSocket(this.url);
    this.ws = ws;
    ws.onopen = () => {
      this.emitRaw("status", { connected: true });
    };
    ws.onmessage = (event) => {
      let frame: { type: string; id?: number; result?: unknown; error?: string; event?: string; payload?: unknown };
      try {
        frame = JSON.parse(String(event.data));
      } catch {
        return;
      }
      if (frame.type === "res" && frame.id != null) {
        const waiter = this.pending.get(frame.id);
        if (!waiter) return;
        this.pending.delete(frame.id);
        if (frame.error) waiter.reject(new Error(frame.error));
        else waiter.resolve(frame.result);
      } else if (frame.type === "event" && frame.event) {
        this.emitRaw(frame.event, frame.payload);
      }
    };
    ws.onclose = () => {
      this.emitRaw("status", { connected: false });
      this.failPending(new Error("connection closed"));
      if (!this.closedByUser) this.scheduleReconnect();
    };
    ws.onerror = () => ws.close();
  }

  private failPending(error: Error): void {
    for (const waiter of this.pending.values()) waiter.reject(error);
    this.pending.clear();
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer != null) return;
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      if (!this.closedByUser) this.connect();
    }, 2000);
  }

  request<T>(method: string, params?: unknown): Promise<T> {
    const ws = this.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return Promise.reject(new Error(`backend not connected (${this.url})`));
    }
    const id = this.nextId++;
    return new Promise<T>((resolve, reject) => {
      this.pending.set(id, { resolve: resolve as (v: unknown) => void, reject });
      ws.send(JSON.stringify({ type: "req", id, method, params }));
    });
  }

  close(): void {
    this.closedByUser = true;
    if (this.reconnectTimer != null) window.clearTimeout(this.reconnectTimer);
    this.failPending(new Error("transport closed"));
    this.ws?.close();
  }
}

// ---------------------------------------------------------------------------
// Selection: Electron preload (phase 2) > explicit WS url > mock.
// ---------------------------------------------------------------------------

declare global {
  interface Window {
    /** Phase 2: Electron preload exposes an IPC transport here. */
    grok?: { transport?: Transport };
  }
}

export function explicitWsUrl(): string | null {
  const fromQuery = new URLSearchParams(location.search).get("ws");
  if (fromQuery) return fromQuery;
  const fromEnv = import.meta.env.VITE_WS_URL as string | undefined;
  if (fromEnv) return fromEnv;
  return null;
}
