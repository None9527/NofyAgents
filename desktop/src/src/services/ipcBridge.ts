// A0-S4-5: 自 modules/services.tsx §B 原样迁入（MessagePort 流客户端 + RPC 通道 + ServiceProxy，原 js 3843–4121；原文件现为薄 re-export shim）。
// 导入按 services/ 深度改指：§A 原语 → ./eventPrimitives；createRemoteServiceProxy 的前向引用（原同文件 C.3）→ ./providerRegistrySync。
import { Emitter, VSBuffer, EventUtil, CancellationToken, toDisposable, BufferWriter, BufferReader, serializeValue, deserializeValue, isFlowControlMessage } from './eventPrimitives';
import type { Event, Disposable } from './eventPrimitives';
import { syncProviderRegistryAndReturn } from './providerRegistrySync';
/* ============================================================================
 * B. MessagePort 流客户端 + RPC 通道（原 3843–4121）
 * ==========================================================================*/

export type FlowState = "saturated" | "drained";

/**
 * 原 ise（js 3843–3876）：MessagePort 流客户端。
 * host 侧 32 个服务面的 renderer 端传输层：
 *  - 收：Uint8Array 帧 → onMessage；流控对象 → onFlowState
 *  - 发：send(VSBuffer) / sendFlowState(state)
 */
export class MessagePortStreamProtocol {
  private _onMessage = new Emitter<VSBuffer>();
  readonly onMessage: Event<VSBuffer> = this._onMessage.event;
  private _onFlowState = new Emitter<FlowState>();
  readonly onFlowState: Event<FlowState> = this._onFlowState.event;
  private handler: (event: MessageEvent) => void;

  constructor(private port: MessagePort) {
    this.handler = (event: MessageEvent) => {
      if (isFlowControlMessage(event.data)) {
        this._onFlowState.fire(event.data.state);
        return;
      }
      if (event.data instanceof Uint8Array) this._onMessage.fire(VSBuffer.wrap(event.data));
    };
    this.port.addEventListener("message", this.handler);
    this.port.start();
  }

  send(buffer: VSBuffer): void {
    this.port.postMessage(buffer.buffer);
  }

  sendFlowState(state: FlowState): void {
    this.port.postMessage({ __zcodeRpcControl: "connection-flow-v1", state });
  }

  disconnect(): void {
    this.port.removeEventListener("message", this.handler);
    this.port.close();
    this._onMessage.dispose();
    this._onFlowState.dispose();
  }
}

/** 原 Bs：客户端消息类型 */
export enum ClientMessageType {
  Promise = 100,
  PromiseCancel = 101,
  EventListen = 102,
  EventDispose = 103,
}

/** 原 Vs：服务端消息类型 */
export enum ServerMessageType {
  Initialize = 200,
  PromiseSuccess = 201,
  PromiseError = 202,
  PromiseErrorObj = 203,
  EventFire = 204,
}

/** 原 Hs：通道状态 */
export enum ChannelState {
  Uninitialized = 0,
  Idle = 1,
}

export interface CancellationTokenLike {
  isCancellationRequested: boolean;
  onCancellationRequested: Event<void>;
}

export interface Channel {
  call<T>(command: string, args?: unknown, token?: CancellationTokenLike): Promise<T>;
  listen<T>(eventName: string, arg?: unknown): Event<T>;
}

interface ServerResponse {
  type: ServerMessageType;
  id?: number;
  data?: unknown;
}

/**
 * 原 ase（js 3897–4028）：ChannelClient。
 * 请求-响应 + 事件订阅多路复用；初始化握手（Initialize）前的请求排队等待。
 * 错误透传字段：code/data/detail/details/taskId/traceId。
 */
export class ChannelClient {
  private state: ChannelState = ChannelState.Uninitialized;
  private isDisposed = false;
  private activeRequests = new Set<Disposable>();
  private handlers = new Map<number, (response: ServerResponse) => void>();
  private lastRequestId = 0;
  private protocolListener: Disposable | null;
  private _onDidInitialize = new Emitter<void>();
  readonly onDidInitialize: Event<void> = this._onDidInitialize.event;

  constructor(private protocol: MessagePortStreamProtocol) {
    this.protocolListener = this.protocol.onMessage((buffer) => this.onBuffer(buffer));
  }

  getChannel(channelName: string): Channel {
    return {
      call: (command, args, token) =>
        this.isDisposed ? Promise.reject(new Error("ChannelClient is disposed")) : this.requestPromise(channelName, command, args, token),
      listen: (eventName, arg) => (this.isDisposed ? EventUtil.None : this.requestEvent(channelName, eventName, arg)),
    };
  }

  private requestPromise<T>(channelName: string, command: string, args?: unknown, token: CancellationTokenLike = CancellationToken.None): Promise<T> {
    const requestId = this.lastRequestId++;
    if (token.isCancellationRequested) return Promise.reject(new Error("Cancelled"));
    let cancellationSubscription: Disposable | undefined;
    return new Promise<T>((resolve, reject) => {
      const send = () => {
        this.handlers.set(requestId, (response) => {
          switch (response.type) {
            case ServerMessageType.PromiseSuccess:
              this.handlers.delete(requestId);
              resolve(response.data as T);
              return;
            case ServerMessageType.PromiseError: {
              this.handlers.delete(requestId);
              const payload = response.data as { message: string; name?: string; stack?: string[]; [key: string]: unknown };
              const error = new Error(payload.message) as Error & Record<string, unknown>;
              error.name = payload.name ?? error.name;
              if (payload.stack) error.stack = payload.stack.join("\n");
              for (const field of ["code", "data", "detail", "details", "taskId", "traceId"]) {
                const value = payload[field];
                if (value !== undefined) error[field] = value;
              }
              reject(error);
              return;
            }
            case ServerMessageType.PromiseErrorObj:
              this.handlers.delete(requestId);
              reject(response.data);
              return;
          }
        });
        this.sendRequest(ClientMessageType.Promise, requestId, channelName, command, args);
      };
      if (this.state === ChannelState.Idle) send();
      else this.whenInitialized().then(send);
      cancellationSubscription = token.onCancellationRequested(() => {
        this.sendCancelOrDispose(ClientMessageType.PromiseCancel, requestId);
        reject(new Error("Cancelled"));
      });
      this.activeRequests.add(cancellationSubscription);
    }).finally(() => {
      cancellationSubscription?.dispose();
      if (cancellationSubscription) this.activeRequests.delete(cancellationSubscription);
    });
  }

  private requestEvent<T>(channelName: string, eventName: string, arg?: unknown): Event<T> {
    const requestId = this.lastRequestId++;
    const emitter = new Emitter<T>({
      onWillAddFirstListener: () => {
        const listen = () => {
          this.activeRequests.add(emitterSubscription);
          this.sendRequest(ClientMessageType.EventListen, requestId, channelName, eventName, arg);
        };
        if (this.state === ChannelState.Idle) listen();
        else this.whenInitialized().then(listen);
      },
      onDidRemoveLastListener: () => {
        this.activeRequests.delete(emitterSubscription);
        this.sendCancelOrDispose(ClientMessageType.EventDispose, requestId);
        this.handlers.delete(requestId);
      },
    });
    const emitterSubscription = toDisposable(() => {});
    this.handlers.set(requestId, (response) => {
      emitter.fire(response.data as T);
    });
    return emitter.event;
  }

  private sendRequest(type: ClientMessageType, requestId: number, channelName?: string, command?: string, args?: unknown): void {
    const writer = new BufferWriter();
    serializeValue(writer, [type, requestId, channelName, command]);
    serializeValue(writer, args);
    try {
      this.protocol.send(writer.buffer);
    } catch {
      /* 传输层静默 */
    }
  }

  private sendCancelOrDispose(type: ClientMessageType, requestId: number): void {
    const writer = new BufferWriter();
    serializeValue(writer, [type, requestId]);
    serializeValue(writer, undefined);
    try {
      this.protocol.send(writer.buffer);
    } catch {
      /* 传输层静默 */
    }
  }

  private onBuffer(buffer: VSBuffer): void {
    const reader = new BufferReader(buffer);
    const header = deserializeValue(reader) as [ServerMessageType, number?];
    const data = deserializeValue(reader);
    const type = header[0];
    switch (type) {
      case ServerMessageType.Initialize:
        this.onResponse({ type: ServerMessageType.Initialize });
        return;
      case ServerMessageType.PromiseSuccess:
      case ServerMessageType.PromiseError:
      case ServerMessageType.EventFire:
      case ServerMessageType.PromiseErrorObj:
        this.onResponse({ type, id: header[1], data });
        return;
    }
  }

  private onResponse(response: ServerResponse): void {
    if (response.type === ServerMessageType.Initialize) {
      this.state = ChannelState.Idle;
      this._onDidInitialize.fire();
      return;
    }
    if (response.id === undefined) return;
    this.handlers.get(response.id)?.(response);
  }

  private whenInitialized(): Promise<void> {
    return this.state === ChannelState.Idle ? Promise.resolve() : EventUtil.toPromise(this.onDidInitialize);
  }

  dispose(): void {
    this.isDisposed = true;
    this.protocolListener?.dispose();
    this.protocolListener = null;
    for (const request of this.activeRequests) request.dispose();
    this.activeRequests.clear();
    this._onDidInitialize.dispose();
  }
}

/** 原 Ws：事件名启发式（`on` + 大写字母开头，长度 ≥3） */
export function isEventName(name: string): boolean {
  return name.length >= 3 && name[0] === "o" && name[1] === "n" && name.charCodeAt(2) >= 65 && name.charCodeAt(2) <= 90;
}

/** 原 Gs：动态事件名（`onDynamic` + 大写字母，长度 ≥10） */
export function isDynamicEventName(name: string): boolean {
  return name.length >= 10 && name.startsWith("onDynamic") && name.charCodeAt(9) >= 65 && name.charCodeAt(9) <= 90;
}

/** 原 ose：首监听者缓冲（订阅前的事件不丢） */
function bufferFirstListenerEvent<T>(source: Event<T>): Event<T> {
  let buffered: T[] = [];
  let flushed = false;
  let sourceSubscription: Disposable | undefined;
  const emitter = new Emitter<T>({
    onWillAddFirstListener: () => {
      sourceSubscription = source((value) => {
        if (flushed) emitter.fire(value);
        else buffered.push(value);
      });
    },
    onDidRemoveLastListener: () => {
      sourceSubscription?.dispose();
      sourceSubscription = undefined;
      buffered = [];
    },
  });
  const event = emitter.event;
  return (listener) => {
    const subscription = event(listener);
    if (!flushed) {
      flushed = true;
      for (const value of buffered) emitter.fire(value);
      buffered = [];
    }
    return subscription;
  };
}

export interface ServiceChannel {
  call(method: string, args?: unknown[]): Promise<unknown>;
  listen(eventName: string, arg?: unknown): Event<unknown>;
}

/** 原 Us：服务代理工厂（fromService=宿主侧适配；toService=renderer 侧代理） */
export const ServiceProxy = {
  /** 原 t：把本地服务对象适配成通道（宿主侧用） */
  fromService(service: Record<string, unknown>): ServiceChannel {
    const target = service;
    const bufferedEvents = new Map<string, Event<unknown>>();
    return {
      listen(eventName: string, arg?: unknown) {
        const buffered = bufferedEvents.get(eventName);
        if (buffered) return buffered;
        const member = target[eventName];
        if (typeof member === "function") {
          if (isDynamicEventName(eventName)) return (member as (arg?: unknown) => Event<unknown>).call(target, arg);
          if (isEventName(eventName)) {
            bufferedEvents.set(eventName, bufferFirstListenerEvent(member as Event<unknown>));
            return bufferedEvents.get(eventName)!;
          }
        }
        throw new Error(`Event not found: ${eventName}`);
      },
      call(method: string, args?: unknown[]) {
        const member = target[method];
        if (typeof member === "function") {
          const raw = (member as (...callArgs: unknown[]) => unknown).apply(target, args || []);
          return raw instanceof Promise ? raw : Promise.resolve(raw);
        }
        throw new Error(`Method not found: ${method}`);
      },
    };
  },
  /** 原 n：把通道代理成服务对象（renderer 侧用；`then` 键屏蔽以免误当 thenable） */
  toService<T extends object>(channel: ServiceChannel, options?: { context?: unknown }): T {
    return new Proxy({} as T, {
      get(_target, property, receiver) {
        if (typeof property === "symbol") return Reflect.get(_target, property, receiver);
        if (typeof property !== "string") return Reflect.get(_target, property, receiver);
        if (property === "then") return undefined;
        if (isDynamicEventName(property)) return (arg?: unknown) => channel.listen(property, arg);
        if (isEventName(property)) return channel.listen(property);
        return async (...args: unknown[]) => {
          const callArgs = options?.context === undefined ? args : [options.context, ...args];
          return channel.call(property, callArgs);
        };
      },
    });
  },
};

/** 原 Ks/sse：服务代理创建（经 vse provider 同步后建立；此处保留两级包装） */
export async function createRemoteServiceProxy(args: unknown): Promise<unknown> {
  return await syncProviderRegistryAndReturn(args);
}
