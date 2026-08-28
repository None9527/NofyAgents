/* eslint-disable */
/**
 * ============================================================================
 * services.tsx — ZCode 3.7.6 横切层 · services/IPC 客户端 + 工具块（D8 Stage B）
 * ============================================================================
 *
 * 来源文件（融合 chunk，213,695 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js
 * 行号口径：融合 chunk js 行；模块地图见同目录 MODULE-MAP.md §2.2/§2.6。
 *
 * 本文件内容（混淆名 → 语义名 → js 行）：
 *  A. 事件/可释放原语（3551–3842）
 *     Os→Event 工具（None/once/toPromise/filter/map）| Koe/qoe→toDisposable/onceFn |
 *     ks→Emitter | As→VSBuffer | Yoe→BufferReader | js→BufferWriter |
 *     Ms/Ns→readVarint/writeVarint | Ps→ValueType | Rs/zs→serializeValue/deserializeValue |
 *     tse/nse→toBase64/fromBase64 | rse→isFlowControlMessage
 *  B. MessagePort 流客户端 + RPC 通道（3843–4121）
 *     ise→MessagePortStreamProtocol | Bs→ClientMessageType | Vs→ServerMessageType |
 *     Hs→ChannelState | ase→ChannelClient | Us→ServiceProxy（fromService/toService）|
 *     Ws/Gs→isEventName/isDynamicEventName | ose→bufferFirstListenerEvent
 *  C. 服务注册与钩子（2638–2660 + 4122–4308 + 4834–4960）
 *     ds/fs/ps→ServiceProvider/useServices/useServicesOptional |
 *     Zs 会话注册表（见 stores-core.tsx）+ xse/Sse/Qs/$s/Cse/ec/wse/tc/Tse 助手 |
 *     qs/lse/vse/Ys/hse/gse/_se→provider registry 同步 |
 *     xc/Sc→远端断开错误 | Use/wc→断开占位服务 | Wse/Gse/Tc/Kse→解析助手 |
 *     Ec/qse→useBaseServices | Dc→useResolvedWorkspaceServices | Oc→useWorkspaceServices |
 *     gc/_c/vc/yc/Hse/bc→远端会话解析
 *  D. 工作区文件/路径服务钩子群（24015–25006）
 *     rge→useGlobalKeyboardShortcuts | sge/fge/Dg/Og/gge/_ge/vge/yge/bge/kg→
 *       任务快照缓存（键 zcode-task-snapshot-cache:v1）| Sge/Cge/wge→
 *       useWorkspaceProviderConfigFile | Ag→useSessionService
 *  E. 工作区作用域 context（42597–42806）
 *     gT/_T/vT/_Fe/xT/vFe/yFe/bFe→遥测监督注册表 |
 *     ST/CT/xFe/wT/SFe→TelemetryScope provider/钩子（服务作用域）|
 *     TT/CFe/wFe/ET→V4Conversation provider/钩子（工作区作用域）|
 *     DT/TFe→面板作用域 provider
 *  F. 会话遥测监督（41808–42596）
 *     uT→BoundedStringSet | lT/sFe/cFe→容量常量 |
 *     dT/fT/pT/fFe/pFe/mFe/mT→fact 助手 | hT→ConversationTelemetrySupervisor
 *     （注：MODULE-MAP §2.6 称之为“权限状态机”；按实现更正为会话遥测/归因监督器，
 *      其处理 permission.lifecycle 事实仅为其中一支）
 *  G. 命令队列运行时（32246–36438）
 *     ux/dx→任务未读通知去重 | v4 会话协议 zod schema（qOe 队列项：
 *     steer/dispatch/admittedAt/provenance 等）| Yke→会话命令 schema 表 |
 *     bS→FrameAssembler（流帧装配，15 种 proto.frameAssembly* 故障码）|
 *     XAe→SessionIndexStore（v4-sessions-index 订阅/恢复状态机）|
 *     QAe→WorkspaceSubscriptionSet | VS/HS/BS→store 池
 *
 * 外部依赖：React（Q）、logger（J）、zod（K，src-HCld2afU.js）、
 *   stores-core.tsx（SessionRegistryStore）、TabStore（F04 域，声明级）。
 * ============================================================================
 */

import * as React from "react";
import {
  useSessionRegistryStore,
  getSessionById,
  serviceGeneration,
  type BaseServices,
  type RegisteredSession,
} from "./stores-core";

declare const logger: {
  debug(msg: string, meta?: unknown): void;
  info(msg: string, meta?: unknown): void;
  warn(msg: string, ...meta: unknown[]): void;
  error(msg: string, ...meta: unknown[]): void;
};

/** 原 Io：工作区键 */
declare function workspaceKey(workspacePath: string, workspaceIdentity?: string | null): string;
/** 原 Ti：provider 同步作用域键 */
declare function providerSyncScopeKey(scope: { workspacePath: string; workspaceIdentity?: string | null }): string;
/** 原 Hr：provider 未就绪错误码 */
declare const PROVIDER_NOT_READY_CODE: string;
/** 原 it：错误规范化（取 code/message） */
declare function normalizeRpcError(error: unknown): { code?: string; message: string };

/* ============================================================================
 * A. 事件/可释放原语（原 3551–3842）
 * ==========================================================================*/

export interface Disposable {
  dispose(): void;
}

/** 原 qoe：幂等一次性 dispose 包装 */
export function onceDispose(fn: () => void): () => void {
  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;
    fn();
  };
}

/** 原 Koe */
export function toDisposable(fn: () => void): Disposable {
  return { dispose: onceDispose(fn) };
}

export type EventListener<T> = (event: T) => void;
export type Event<T> = (listener: EventListener<T>) => Disposable;

/** 原 Os：Event 工具命名空间 */
export const EventUtil = {
  None: () => toDisposable(() => {}),
  /** 原 t：只触发一次的订阅 */
  once<T>(event: Event<T>): Event<T> {
    return (listener) => {
      let fired = false;
      const subscription = event((value) => {
        if (fired) return;
        fired = true;
        subscription.dispose();
        listener(value);
      });
      return subscription;
    };
  },
  /** 原 n：事件 → Promise */
  toPromise<T>(event: Event<T>): Promise<T> {
    return new Promise((resolve) => EventUtil.once(event)(resolve));
  },
  /** 原 r：过滤 */
  filter<T>(event: Event<T>, predicate: (value: T) => boolean): Event<T> {
    return (listener) =>
      event((value) => {
        if (predicate(value)) listener(value);
      });
  },
  /** 原 i：映射 */
  map<T, U>(event: Event<T>, transform: (value: T) => U): Event<U> {
    return (listener) => event((value) => listener(transform(value)));
  },
};

/** 原 Joe：空取消令牌 */
export const CancellationToken = {
  None: { isCancellationRequested: false, onCancellationRequested: EventUtil.None as Event<void> },
};

export interface EmitterOptions {
  onWillAddFirstListener?: () => void;
  onDidRemoveLastListener?: () => void;
}

/** 原 ks：Emitter（VSCode 风格事件发射器） */
export class Emitter<T> {
  private listeners = new Set<EventListener<T>>();
  private disposed = false;
  constructor(private options?: EmitterOptions) {}

  get event(): Event<T> {
    return (listener) => {
      if (this.disposed) return toDisposable(() => {});
      const isFirst = this.listeners.size === 0;
      this.listeners.add(listener);
      if (isFirst) this.options?.onWillAddFirstListener?.();
      return toDisposable(() => {
        this.listeners.delete(listener);
        if (this.listeners.size === 0) this.options?.onDidRemoveLastListener?.();
      });
    };
  }

  fire(value: T): void {
    if (this.disposed) return;
    for (const listener of [...this.listeners]) listener(value);
  }

  dispose(): void {
    this.disposed = true;
    this.listeners.clear();
  }
}

/** 原 As：VSBuffer —— Uint8Array 包装（读写大端 u32、拼接、base64 互转） */
export class VSBuffer {
  readonly byteLength: number;
  constructor(public readonly buffer: Uint8Array) {
    this.byteLength = buffer.byteLength;
  }
  static alloc(size: number): VSBuffer {
    return new VSBuffer(new Uint8Array(size));
  }
  static wrap(buffer: Uint8Array): VSBuffer {
    return new VSBuffer(buffer);
  }
  static fromString(value: string): VSBuffer {
    return new VSBuffer(new TextEncoder().encode(value));
  }
  static concat(buffers: VSBuffer[], totalByteLength?: number): VSBuffer {
    const total = totalByteLength ?? buffers.reduce((sum, item) => sum + item.byteLength, 0);
    const result = VSBuffer.alloc(total);
    let offset = 0;
    for (const item of buffers) {
      result.set(item, offset);
      offset += item.byteLength;
    }
    return result;
  }
  toString(): string {
    return new TextDecoder().decode(this.buffer);
  }
  slice(start: number, end: number): VSBuffer {
    return new VSBuffer(this.buffer.slice(start, end));
  }
  set(source: VSBuffer | Uint8Array, offset = 0): void {
    const raw = source instanceof VSBuffer ? source.buffer : source;
    this.buffer.set(raw, offset);
  }
  readUInt8(offset: number): number {
    return this.buffer[offset];
  }
  writeUInt8(value: number, offset: number): void {
    this.buffer[offset] = value;
  }
  readUInt32BE(offset: number): number {
    return ((this.buffer[offset] << 24) | (this.buffer[offset + 1] << 16) | (this.buffer[offset + 2] << 8) | this.buffer[offset + 3]) >>> 0;
  }
  writeUInt32BE(value: number, offset: number): void {
    this.buffer[offset] = (value >>> 24) & 255;
    this.buffer[offset + 1] = (value >>> 16) & 255;
    this.buffer[offset + 2] = (value >>> 8) & 255;
    this.buffer[offset + 3] = value & 255;
  }
}

/** 原 Yoe：顺序读指针 */
export class BufferReader {
  pos = 0;
  constructor(private buffer: VSBuffer) {}
  read(byteLength: number): VSBuffer {
    const slice = this.buffer.slice(this.pos, this.pos + byteLength);
    this.pos += slice.byteLength;
    return slice;
  }
}

/** 原 js：追加式缓冲写 */
export class BufferWriter {
  private buffers: VSBuffer[] = [];
  get buffer(): VSBuffer {
    return VSBuffer.concat(this.buffers);
  }
  write(buffer: VSBuffer): void {
    this.buffers.push(buffer);
  }
}

/** 原 Ms：LEB128 变长整数读 */
export function readVarint(reader: BufferReader): number {
  let value = 0;
  for (let shift = 0; ; shift += 7) {
    const byte = reader.read(1);
    value |= (byte.buffer[0] & 127) << shift;
    if (!(byte.buffer[0] & 128)) return value;
  }
}

const ZERO_VARINT = encodeVarint(0); // 原 Xoe

function encodeVarint(value: number): VSBuffer {
  if (value === 0) return ZERO_VARINT_SINGLETON();
  let size = 0;
  for (let probe = value; probe !== 0; probe >>>= 7) size++;
  const buffer = VSBuffer.alloc(size);
  for (let index = 0; value !== 0; index++) {
    buffer.buffer[index] = value & 127;
    value >>>= 7;
    if (value > 0) buffer.buffer[index] |= 128;
  }
  return buffer;
}

function ZERO_VARINT_SINGLETON(): VSBuffer {
  const buffer = VSBuffer.alloc(1);
  buffer.writeUInt8(0, 0);
  return buffer;
}

/** 原 Ps：值类型标签 */
export enum ValueType {
  Undefined = 0,
  String = 1,
  Buffer = 2,
  VSBuffer = 3,
  Array = 4,
  Object = 5,
  Int = 6,
}

function valueTypeTag(type: ValueType): VSBuffer {
  const buffer = VSBuffer.alloc(1);
  buffer.writeUInt8(type, 0);
  return buffer;
}

const VALUE_TYPE_TAGS = {
  Undefined: valueTypeTag(ValueType.Undefined),
  String: valueTypeTag(ValueType.String),
  Buffer: valueTypeTag(ValueType.Buffer),
  VSBuffer: valueTypeTag(ValueType.VSBuffer),
  Array: valueTypeTag(ValueType.Array),
  Object: valueTypeTag(ValueType.Object),
  Int: valueTypeTag(ValueType.Int),
};

const NESTED_UINT8ARRAY_MARKER = "__zcode_rpc_nested_uint8array_v1"; // 原 Zoe
const BASE64_FIELD = "base64"; // 原 Ls

/** 原 Rs：值序列化（类型标签 + 变长长度 + 载荷） */
export function serializeValue(writer: BufferWriter, value: unknown): void {
  if (value === undefined) {
    writer.write(VALUE_TYPE_TAGS.Undefined);
  } else if (typeof value === "string") {
    const encoded = VSBuffer.fromString(value);
    writer.write(VALUE_TYPE_TAGS.String);
    writer.write(encodeVarint(encoded.byteLength));
    writer.write(encoded);
  } else if (value instanceof VSBuffer) {
    writer.write(VALUE_TYPE_TAGS.VSBuffer);
    writer.write(encodeVarint(value.byteLength));
    writer.write(value);
  } else if (value instanceof Uint8Array) {
    const wrapped = VSBuffer.wrap(value);
    writer.write(VALUE_TYPE_TAGS.Buffer);
    writer.write(encodeVarint(wrapped.byteLength));
    writer.write(wrapped);
  } else if (Array.isArray(value)) {
    writer.write(VALUE_TYPE_TAGS.Array);
    writer.write(encodeVarint(value.length));
    for (const item of value) serializeValue(writer, item);
  } else if (typeof value === "number" && (value | 0) === value) {
    writer.write(VALUE_TYPE_TAGS.Int);
    writer.write(encodeVarint(value));
  } else {
    const encoded = VSBuffer.fromString(JSON.stringify(value, jsonUint8ArrayReplacer));
    writer.write(VALUE_TYPE_TAGS.Object);
    writer.write(encodeVarint(encoded.byteLength));
    writer.write(encoded);
  }
}

/** 原 zs：值反序列化 */
export function deserializeValue(reader: BufferReader): unknown {
  switch (reader.read(1).readUInt8(0)) {
    case ValueType.Undefined:
      return undefined;
    case ValueType.String:
      return reader.read(readVarint(reader)).toString();
    case ValueType.Buffer:
      return reader.read(readVarint(reader)).buffer;
    case ValueType.VSBuffer:
      return reader.read(readVarint(reader));
    case ValueType.Array: {
      const length = readVarint(reader);
      const items: unknown[] = [];
      for (let index = 0; index < length; index++) items.push(deserializeValue(reader));
      return items;
    }
    case ValueType.Object:
      return JSON.parse(reader.read(readVarint(reader)).toString(), jsonUint8ArrayReviver);
    case ValueType.Int:
      return readVarint(reader);
  }
}

function jsonUint8ArrayReplacer(_key: string, value: unknown): unknown {
  return value instanceof Uint8Array ? { [NESTED_UINT8ARRAY_MARKER]: true, [BASE64_FIELD]: toBase64(value) } : value;
}

function jsonUint8ArrayReviver(_key: string, value: unknown): unknown {
  return isBase64Uint8ArrayEnvelope(value) ? fromBase64(value[BASE64_FIELD]) : value;
}

function isBase64Uint8ArrayEnvelope(value: unknown): value is { [NESTED_UINT8ARRAY_MARKER]: true; base64: string } {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const candidate = value as Record<string, unknown>;
  return candidate[NESTED_UINT8ARRAY_MARKER] === true && typeof candidate[BASE64_FIELD] === "string" && Object.keys(candidate).length === 2;
}

/** 原 tse：Uint8Array → base64（优先 Buffer，回退 btoa 分块） */
export function toBase64(bytes: Uint8Array): string {
  const NodeBuffer = globalThis.Buffer;
  if (NodeBuffer) return NodeBuffer.from(bytes).toString("base64");
  let binary = "";
  const chunkSize = 32768;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    const chunk = bytes.subarray(offset, offset + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return globalThis.btoa(binary);
}

/** 原 nse：base64 → Uint8Array */
export function fromBase64(base64: string): Uint8Array {
  const NodeBuffer = globalThis.Buffer;
  if (NodeBuffer) return new Uint8Array(NodeBuffer.from(base64, "base64"));
  const binary = globalThis.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

/** 原 rse：流控消息判别（`__zcodeRpcControl: 'connection-flow-v1'`） */
export function isFlowControlMessage(data: unknown): data is { __zcodeRpcControl: string; state: "saturated" | "drained" } {
  if (typeof data !== "object" || data === null || Array.isArray(data)) return false;
  const candidate = data as Record<string, unknown>;
  return (
    Object.keys(candidate).length === 2 &&
    candidate.__zcodeRpcControl === "connection-flow-v1" &&
    (candidate.state === "saturated" || candidate.state === "drained")
  );
}

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

/* ============================================================================
 * C. 服务注册与钩子
 * ==========================================================================*/

/* --- C.1 ServiceProvider / useServices（原 ds/fs/ps，js 2635–2645） --- */

const ServicesContext = React.createContext<BaseServices | null>(null);

export function ServiceProvider({ services, children }: { services: BaseServices; children: React.ReactNode }) {
  return <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>;
}

/** 原 fs：useServices —— 必须在 ServiceProvider 内使用 */
export function useServices(): BaseServices {
  const services = React.useContext(ServicesContext);
  if (!services) throw new Error("useServices 必须在 ServiceProvider 内使用");
  return services;
}

/** 原 ps：useServicesOptional */
export function useServicesOptional(): BaseServices | null {
  return React.useContext(ServicesContext);
}

/* --- C.2 SessionRegistry 模块助手（原 xse/Sse/Qs/$s/Cse/ec/wse，js 4303–4378） ---
 * 注册表本体（Zs）在 stores-core.tsx；Qs 的同步状态清除在 C.3 定义后回接。 */

export function registerBaseServices(services: BaseServices): void {
  useSessionRegistryStore.getState().registerBaseServices(services);
}

export function registerRemoteSession(entry: RegisteredSession): void {
  if (entry.services.zcodeAgentService) serviceGeneration(entry.services.zcodeAgentService as object);
  useSessionRegistryStore.getState().registerSession(entry);
}

export function bindSessionWorkspacePath(path: string, sessionId: string): void {
  useSessionRegistryStore.getState().bindWorkspacePath(path, sessionId);
}

export function unbindSessionWorkspacePath(path: string): void {
  useSessionRegistryStore.getState().unbindWorkspacePath(path);
}

export function bindSessionWorkspaceIdentity(identity: string, sessionId: string): void {
  useSessionRegistryStore.getState().bindWorkspaceIdentity(identity, sessionId);
}

export function unbindSessionWorkspaceIdentity(identity: string): void {
  useSessionRegistryStore.getState().unbindWorkspaceIdentity(identity);
}

export function getSessionServicesByWorkspaceIdentity(identity: string): BaseServices | null {
  const state = useSessionRegistryStore.getState();
  const sessionId = state.sessionIdByWorkspaceIdentity[identity];
  return sessionId ? (state.sessionsById[sessionId]?.services ?? null) : null;
}

/* --- C.3 Provider registry 同步（原 4122–4308） --- */

interface ProviderRegistrySnapshot {
  revision: number;
  providers: unknown[];
}

interface ProviderSyncState {
  workspaceKey: string;
  appliedProviderRegistryRevision?: number;
  pendingProviderRegistryRevision?: number;
  remoteRuntimeIdentity?: string;
  remoteSessionId?: string;
  lastSyncError?: string;
}

export interface ProviderRegistrySyncArgs {
  workspacePath: string;
  workspaceIdentity?: string | null;
  remoteSessionId?: string;
  force?: boolean;
  includeWorkspaceState?: boolean;
  runtimePolicy?: unknown;
  remoteZCodeSessionService: {
    getWorkspaceRuntimeIdentity?(args: { workspacePath: string; workspaceIdentity?: string | null }): Promise<{ identity?: string | null }>;
    updateProviderRegistry(args: {
      workspacePath: string;
      workspaceIdentity?: string | null;
      registry: ProviderRegistrySnapshot;
      includeWorkspaceState: boolean;
      runtimePolicy?: unknown;
    }): Promise<{
      status: "applied" | "runtime-unavailable" | "failed" | string;
      appliedProviderRevision: number;
      providerCount: number;
      workspaceState?: unknown;
    }>;
  };
  localModelProviderService: { getProviderRegistrySnapshot(): Promise<ProviderRegistrySnapshot> };
}

export interface ProviderRegistrySyncResult {
  workspaceKey: string;
  providerRegistryRevision: number;
  appliedProviderRegistryRevision?: number;
  providerCount: number;
  status: "unchanged" | "applied" | "runtime-unavailable" | string;
  workspaceState?: unknown;
}

const providerSyncStates = new Map<string, ProviderSyncState>(); // 原 qs
const MAX_PROVIDER_BOOTSTRAP_RETRIES = 2; // 原 cse
const providerSyncInFlight = new Map<string, { providerRegistryRevision: number; remoteRuntimeIdentity?: string; remoteSessionId?: string; promise: Promise<ProviderRegistrySyncResult> }>(); // 原 Js

function syncStateFor(args: { workspacePath: string; workspaceIdentity?: string | null }): ProviderSyncState {
  const key = providerSyncScopeKey(args);
  const existing = providerSyncStates.get(key);
  if (existing) return existing;
  const created: ProviderSyncState = { workspaceKey: key };
  providerSyncStates.set(key, created);
  return created;
}

function syncErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function providerNotReadyError(scope: { workspaceKey: string; providerRegistryRevision: number }): Error {
  const error = new Error(`远端 Agent 在 Provider Registry 应用后仍未就绪 workspaceKey=${scope.workspaceKey} revision=${scope.providerRegistryRevision}`) as Error & { code?: string };
  error.code = PROVIDER_NOT_READY_CODE;
  return error;
}

function trimToUndefined(value?: string | null): string | undefined {
  return value?.trim() || undefined;
}

function syncRequired(args: {
  force: boolean;
  remoteSessionId?: string;
  providerRegistryRevision: number;
  state: ProviderSyncState;
}): boolean {
  return (
    args.force ||
    (args.remoteSessionId !== undefined && args.state.remoteSessionId !== args.remoteSessionId) ||
    args.state.appliedProviderRegistryRevision !== args.providerRegistryRevision ||
    args.state.pendingProviderRegistryRevision !== undefined
  );
}

/** 原 Ys：探测远端运行时身份（方法不存在 → 无需 provider 引导） */
async function probeRemoteRuntimeIdentity(args: ProviderRegistrySyncArgs): Promise<{ identity?: string; providerBootstrapRequired: boolean }> {
  if (typeof args.remoteZCodeSessionService.getWorkspaceRuntimeIdentity !== "function") return { providerBootstrapRequired: false };
  try {
    return {
      identity: trimToUndefined(
        (await args.remoteZCodeSessionService.getWorkspaceRuntimeIdentity({ workspacePath: args.workspacePath, workspaceIdentity: args.workspaceIdentity }))?.identity,
      ),
      providerBootstrapRequired: false,
    };
  } catch (error) {
    const normalized = normalizeRpcError(error);
    if (normalized.code === "ZCODE_AGENT_PROVIDER_NOT_READY") return { providerBootstrapRequired: true };
    if (normalized.message.includes("Method not found") || normalized.message.includes("not found")) return { providerBootstrapRequired: false };
    throw error;
  }
}

/** 原 hse：全部同步状态标记 pending（provider 注册表变更时） */
export function markAllProviderSyncPending(revision: number): void {
  for (const state of providerSyncStates.values()) state.pendingProviderRegistryRevision = revision;
}

/** 原 gse/_se：清除工作区的同步状态（会话注销时，见 Qs） */
export function purgeProviderSyncState(scope: { workspacePath: string; workspaceIdentity?: string | null }): void {
  const key = providerSyncScopeKey(scope);
  providerSyncStates.delete(key);
  providerSyncInFlight.delete(key);
}

export function purgeProviderSyncStates(args: { workspacePaths: string[]; workspaceIdentities: string[] }): void {
  for (const identity of args.workspaceIdentities) if (identity.trim()) purgeProviderSyncState({ workspacePath: identity, workspaceIdentity: identity });
  for (const path of args.workspacePaths) purgeProviderSyncState({ workspacePath: path });
}

/** 原 vse（4189–4308）：provider registry 同步主循环（幂等 + 并发合并 + 引导重试） */
export async function syncProviderRegistryAndReturn(rawArgs: unknown): Promise<ProviderRegistrySyncResult> {
  const args = rawArgs as ProviderRegistrySyncArgs;
  const scopeKey = providerSyncScopeKey(args);
  const remoteSessionId = trimToUndefined(args.remoteSessionId);
  for (;;) {
    const snapshot = await args.localModelProviderService.getProviderRegistrySnapshot();
    const inFlight = providerSyncInFlight.get(scopeKey);
    if (inFlight) {
      try {
        await inFlight.promise;
      } catch (error) {
        const latest = await args.localModelProviderService.getProviderRegistrySnapshot();
        const state = syncStateFor(args);
        if (syncRequired({ force: args.force === true, remoteSessionId, providerRegistryRevision: latest.revision, state })) continue;
        const probe = await probeRemoteRuntimeIdentity(args);
        if (latest.revision === inFlight.providerRegistryRevision && inFlight.remoteRuntimeIdentity === probe.identity && inFlight.remoteSessionId === remoteSessionId) {
          throw error;
        }
      }
      continue;
    }
    const state = syncStateFor(args);
    const sessionChanged = remoteSessionId !== undefined && state.remoteSessionId !== remoteSessionId;
    const required = syncRequired({ force: args.force === true, remoteSessionId, providerRegistryRevision: snapshot.revision, state });
    const probe = required ? { providerBootstrapRequired: false } : await probeRemoteRuntimeIdentity(args);
    const remoteIdentity = probe.identity;
    const bootstrapRequired = probe.providerBootstrapRequired || (remoteIdentity !== undefined && state.remoteRuntimeIdentity !== remoteIdentity);
    if (!required && !sessionChanged && !bootstrapRequired && state.appliedProviderRegistryRevision === snapshot.revision) {
      return {
        workspaceKey: scopeKey,
        providerRegistryRevision: snapshot.revision,
        appliedProviderRegistryRevision: snapshot.revision,
        providerCount: snapshot.providers.length,
        status: "unchanged",
      };
    }
    const promise = (async (): Promise<ProviderRegistrySyncResult> => {
      try {
        let attempts = 0;
        for (;;) {
          attempts += 1;
          const result = await args.remoteZCodeSessionService.updateProviderRegistry({
            workspacePath: args.workspacePath,
            workspaceIdentity: args.workspaceIdentity,
            registry: snapshot,
            includeWorkspaceState: args.includeWorkspaceState === true,
            ...(args.runtimePolicy ? { runtimePolicy: args.runtimePolicy } : {}),
          });
          if (result.status === "runtime-unavailable") {
            state.pendingProviderRegistryRevision = snapshot.revision;
            state.lastSyncError = undefined;
            return { workspaceKey: scopeKey, providerRegistryRevision: snapshot.revision, providerCount: snapshot.providers.length, status: result.status };
          }
          if (result.status === "failed") throw new Error(`provider registry 同步失败 workspaceKey=${scopeKey} revision=${snapshot.revision}`);
          const postProbe = await probeRemoteRuntimeIdentity(args);
          if (postProbe.providerBootstrapRequired) {
            if (attempts < MAX_PROVIDER_BOOTSTRAP_RETRIES) continue;
            throw providerNotReadyError({ workspaceKey: scopeKey, providerRegistryRevision: snapshot.revision });
          }
          state.appliedProviderRegistryRevision = result.appliedProviderRevision;
          state.remoteSessionId = remoteSessionId;
          state.remoteRuntimeIdentity = postProbe.identity;
          state.pendingProviderRegistryRevision = undefined;
          state.lastSyncError = undefined;
          const syncResult: ProviderRegistrySyncResult = {
            workspaceKey: scopeKey,
            providerRegistryRevision: snapshot.revision,
            appliedProviderRegistryRevision: result.appliedProviderRevision,
            providerCount: result.providerCount,
            status: result.status,
          };
          if (args.includeWorkspaceState) syncResult.workspaceState = result.workspaceState;
          return syncResult;
        }
      } catch (error) {
        state.pendingProviderRegistryRevision = snapshot.revision;
        state.lastSyncError = syncErrorMessage(error);
        throw error;
      }
    })();
    const entry = { providerRegistryRevision: snapshot.revision, remoteRuntimeIdentity: remoteIdentity, remoteSessionId, promise };
    providerSyncInFlight.set(scopeKey, entry);
    try {
      return await promise;
    } finally {
      if (providerSyncInFlight.get(scopeKey) === entry) providerSyncInFlight.delete(scopeKey);
    }
  }
}

/** 原 Qs：注销会话（清除绑定 + provider 同步状态） */
export function unregisterSessionAndPurgeSyncState(sessionId: string): void {
  const state = useSessionRegistryStore.getState();
  purgeProviderSyncStates({
    workspacePaths: Object.entries(state.sessionIdByWorkspacePath)
      .filter(([, id]) => id === sessionId)
      .map(([path]) => path),
    workspaceIdentities: Object.entries(state.sessionIdByWorkspaceIdentity)
      .filter(([, id]) => id === sessionId)
      .map(([identity]) => identity),
  });
  useSessionRegistryStore.getState().unregisterSession(sessionId);
}

/* --- C.4 远端服务解析与钩子（原 4834–4960） --- */

export const REMOTE_WORKSPACE_DISCONNECTED = "ZCODE_REMOTE_WORKSPACE_DISCONNECTED"; // 原 xc

/** 原 Sc */
export function isRemoteDisconnectedError(error: unknown): boolean {
  if (error === REMOTE_WORKSPACE_DISCONNECTED) return true;
  if (typeof error !== "object" || error === null) return false;
  const candidate = error as { code?: string; message?: string };
  return candidate.code === REMOTE_WORKSPACE_DISCONNECTED || candidate.message === REMOTE_WORKSPACE_DISCONNECTED;
}

let disconnectedServicesSingleton: BaseServices | null = null; // 原 Cc

/** 原 Use：所有调用一律 reject 的占位服务集 */
function createDisconnectedServices(): BaseServices {
  const makeError = () => {
    const error = new Error(REMOTE_WORKSPACE_DISCONNECTED) as Error & { code?: string };
    error.code = REMOTE_WORKSPACE_DISCONNECTED;
    return error;
  };
  const stub = ServiceProxy.toService<Record<string, unknown>>({
    call: () => Promise.reject(makeError()),
    listen: () => EventUtil.None,
  });
  return new Proxy(Object.create(null) as BaseServices, {
    get() {
      return stub;
    },
  });
}

/** 原 wc */
export function getDisconnectedServices(): BaseServices {
  disconnectedServicesSingleton ||= createDisconnectedServices();
  return disconnectedServicesSingleton;
}

interface ServiceResolutionInput {
  currentContextServices: BaseServices;
  resolvedRemoteSessionId: string | null;
  baseServices: BaseServices | null;
  sessionsById: Record<string, RegisteredSession>;
  isRemoteTarget: boolean;
}

/** 原 Wse：按上下文挑选服务集（远端目标无会话 → 断开占位） */
function resolveServicesForContext(input: ServiceResolutionInput): BaseServices {
  const services = input.resolvedRemoteSessionId
    ? (input.sessionsById[input.resolvedRemoteSessionId]?.services ?? null)
    : input.isRemoteTarget
      ? getDisconnectedServices()
      : input.baseServices;
  return input.isRemoteTarget && !services ? getDisconnectedServices() : (services ?? input.currentContextServices);
}

/** 原 Tc：工作区是否带远端作用域 */
function hasRemoteScope(scope: { workspaceIdentity?: string | null; remoteSessionId?: string | null; remoteTarget?: unknown }): boolean {
  return !!(scope?.workspaceIdentity?.trim() || scope?.remoteSessionId?.trim() || scope?.remoteTarget);
}

/** 原 Kse：工作区是否应按远端解析 */
function isRemoteWorkspaceTarget(args: {
  workspacePath?: string | null;
  workspaceIdentity?: string | null;
  preferredRemoteSessionId?: string | null;
  activeWorkspacePath?: string | null;
  activeWorkspaceIdentity?: string | null;
  activeTab?: WorkspaceTabLike | null;
  workspaceTabs?: WorkspaceTabLike[];
}): boolean {
  if (args.workspaceIdentity?.trim() || args.preferredRemoteSessionId?.trim()) return true;
  if (!args.workspacePath?.trim()) return false;
  if (
    args.activeWorkspacePath === args.workspacePath &&
    (args.activeWorkspaceIdentity?.trim() || (args.activeTab?.workspacePath === args.workspacePath && hasRemoteScope(args.activeTab)))
  )
    return true;
  const tabs = (args.workspaceTabs ?? []).filter((tab) => tab.workspacePath === args.workspacePath);
  return tabs.length === 1 && hasRemoteScope(tabs[0]);
}

/** 侧面板标签页的最小结构（原 oc isWorkspaceTab 的判定面） */
export interface WorkspaceTabLike {
  id: string;
  workspacePath?: string;
  workspaceIdentity?: string | null;
  remoteSessionId?: string | null;
  remoteTarget?: unknown;
  [key: string]: unknown;
}

/** TabStore（F04 域）的最小消费面；原 pc/oc/co */
declare function useTabStoreSelector<R>(selector: (state: { activeTabId: string | null; tabs: WorkspaceTabLike[]; activeWorkspacePath?: string | null; activeWorkspaceIdentity?: string | null }) => R): R;
declare function isWorkspaceTab(tab: WorkspaceTabLike | null | undefined): boolean;

/** 原 gc：按注册表解析工作区对应的远端会话 id */
function resolveSessionIdForWorkspace(
  scope: { workspacePath: string; workspaceIdentity?: string | null; remoteSessionId?: string | null; remoteTarget?: unknown },
  registry: { sessionIdByWorkspaceIdentity: Record<string, string>; sessionIdByWorkspacePath: Record<string, string>; sessionsById: Record<string, RegisteredSession> },
): string | null | undefined {
  const identity = scope.workspaceIdentity?.trim();
  return [
    scope.remoteSessionId,
    identity ? registry.sessionIdByWorkspaceIdentity[identity] : undefined,
    !identity && scope.remoteTarget ? registry.sessionIdByWorkspacePath[scope.workspacePath] : undefined,
  ].find((sessionId) => !!(sessionId && registry.sessionsById[sessionId]));
}

/** 原 Hse：综合解析远端会话 id（活动标签优先） */
function resolveRemoteSessionIdFromRegistry(args: {
  workspacePath: string;
  workspaceIdentity?: string | null;
  preferredRemoteSessionId?: string | null;
  remoteTarget?: unknown;
  activeTab?: WorkspaceTabLike | null;
  state: { sessionIdByWorkspaceIdentity: Record<string, string>; sessionIdByWorkspacePath: Record<string, string>; sessionsById: Record<string, RegisteredSession> };
}): string | null {
  if (!args.workspacePath) return null;
  const identity = args.workspaceIdentity?.trim() || undefined;
  const activeTab =
    args.activeTab && (identity ? args.activeTab.workspaceIdentity?.trim() === identity : args.activeTab.workspacePath === args.workspacePath) ? args.activeTab : null;
  const activeIdentity = activeTab?.workspaceIdentity?.trim() || undefined;
  const preferred = [args.preferredRemoteSessionId, activeTab?.remoteSessionId].find((sessionId) => !!(sessionId && args.state.sessionsById[sessionId]));
  return (
    resolveSessionIdForWorkspace(
      {
        workspacePath: args.workspacePath,
        workspaceIdentity: identity ?? activeIdentity,
        remoteSessionId: preferred,
        remoteTarget: activeTab?.remoteTarget ?? args.remoteTarget,
      },
      args.state,
    ) ?? null
  );
}

/** 原 bc：useResolvedRemoteSessionId（工作区路径+优先会话 → 注册表解析） */
export function useResolvedRemoteSessionId(
  workspacePath: string | null,
  preferredRemoteSessionId: string | null | undefined,
  workspaceIdentity?: string | null,
  remoteTarget?: unknown,
): string | null {
  const activeTab = useTabStoreSelector((state) => {
    if (!workspacePath || !state.activeTabId) return null;
    const tab = state.tabs.find((item) => item.id === state.activeTabId);
    if (!tab || !isWorkspaceTab(tab)) return null;
    if (workspaceIdentity) return tab.workspaceIdentity?.trim() === workspaceIdentity.trim() ? tab : null;
    return tab.workspacePath === workspacePath ? tab : null;
  });
  return useSessionRegistryStore((registry) =>
    resolveRemoteSessionIdFromRegistry({
      workspacePath: workspacePath ?? "",
      preferredRemoteSessionId,
      workspaceIdentity,
      remoteTarget,
      activeTab,
      state: registry,
    }),
  );
}

/** 原 Gse */
function coalesceServices<T>(fallback: T, override?: T | null): T {
  return override ?? fallback;
}

/** 原 Ec：useBaseServices（context 服务 + 注册表基础服务合流） */
export function useBaseServices(): BaseServices {
  return coalesceServices(useServices(), useSessionRegistryStore((state) => state.baseServices));
}

/** 原 qse：useBaseServicesOptional */
export function useBaseServicesOptional(): BaseServices | null {
  const contextServices = useServicesOptional();
  return useSessionRegistryStore((state) => state.baseServices) ?? contextServices;
}

export type ConnectionKind = "local-ready" | "remote-ready" | "remote-waiting";

export interface ResolvedWorkspaceServices {
  services: BaseServices;
  remoteSessionId: string | null;
  isRemoteTarget: boolean;
  connectionKind: ConnectionKind;
  rpcReady: boolean;
}

/** 原 Dc（4907–4944）：工作区服务解析（远端会话未就绪时给出等待态） */
export function useResolvedWorkspaceServices(
  workspacePath: string | null,
  preferredRemoteSessionId: string | null | undefined,
  workspaceIdentity?: string | null,
  remoteTarget?: unknown,
): ResolvedWorkspaceServices {
  const contextServices = useServices();
  const resolvedRemoteSessionId = useResolvedRemoteSessionId(workspacePath, preferredRemoteSessionId, workspaceIdentity, remoteTarget);
  const isRemoteTarget = useTabStoreSelector((state) =>
    isRemoteWorkspaceTarget({
      workspacePath,
      workspaceIdentity,
      preferredRemoteSessionId,
      activeWorkspacePath: state.activeWorkspacePath,
      activeWorkspaceIdentity: state.activeWorkspaceIdentity,
      activeTab: (() => {
        const tab = state.activeTabId ? state.tabs.find((item) => item.id === state.activeTabId) : null;
        return tab && isWorkspaceTab(tab) ? tab : null;
      })(),
      workspaceTabs: state.tabs.filter((item) => isWorkspaceTab(item)),
    }),
  );
  const services = useSessionRegistryStore((registry) =>
    resolveServicesForContext({
      currentContextServices: contextServices,
      resolvedRemoteSessionId,
      baseServices: registry.baseServices,
      sessionsById: registry.sessionsById,
      isRemoteTarget,
    }),
  );
  const connectionKind: ConnectionKind = isRemoteTarget ? (resolvedRemoteSessionId ? "remote-ready" : "remote-waiting") : "local-ready";
  return React.useMemo(
    () => ({ services, remoteSessionId: resolvedRemoteSessionId, isRemoteTarget, connectionKind, rpcReady: connectionKind !== "remote-waiting" }),
    [connectionKind, isRemoteTarget, resolvedRemoteSessionId, services],
  );
}

/** 原 Oc：useWorkspaceServices */
export function useWorkspaceServices(
  workspacePath: string | null,
  preferredRemoteSessionId: string | null | undefined,
  workspaceIdentity?: string | null,
  remoteTarget?: unknown,
): BaseServices {
  return useResolvedWorkspaceServices(workspacePath, preferredRemoteSessionId, workspaceIdentity, remoteTarget).services;
}

/* ============================================================================
 * D. 工作区文件/路径服务钩子群（原 24015–25006）
 * ==========================================================================*/

/* --- D.1 全局键盘快捷键（原 rge，js 24015–24079） --- */

declare function isModKey(event: KeyboardEvent, key: string): boolean; // 原 ta（Ctrl/Cmd）
declare function isModShiftKey(event: KeyboardEvent, key: string): boolean; // 原 Qi
declare function isModAltKey(event: KeyboardEvent, key: string): boolean; // 原 Rre

export interface GlobalShortcutHandlers {
  openQuickPick(): void;
  find(): void;
  toggleSidebar(): void;
  toggleTerminal(): void;
  toggleSidePane(): void;
  previousConversation?: () => void;
  nextConversation?: () => void;
  navBack?: () => void;
  navForward?: () => void;
}

/** 原 rge：捕获阶段全局快捷键（⌘K 面板 / ⌘F 查找 / ⌘[ ⌘] 会话切换 / ⌘B 侧栏 / ⌘J 终端 / ⌘⇧B 侧面板 / ⌘[ ⌘] 导航） */
export function useGlobalKeyboardShortcuts(handlers: GlobalShortcutHandlers): void {
  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.repeat || event.isComposing) return;
      if (isModKey(event, "k") || isModShiftKey(event, "p")) {
        event.preventDefault();
        handlers.openQuickPick();
        return;
      }
      if (isModKey(event, "f")) {
        event.preventDefault();
        handlers.find();
        return;
      }
      if (isModShiftKey(event, "[")) {
        if (!handlers.previousConversation) return;
        event.preventDefault();
        handlers.previousConversation();
        return;
      }
      if (isModShiftKey(event, "]")) {
        if (!handlers.nextConversation) return;
        event.preventDefault();
        handlers.nextConversation();
        return;
      }
      if (isModKey(event, "b")) {
        event.preventDefault();
        handlers.toggleSidebar();
        return;
      }
      if (isModKey(event, "j")) {
        event.preventDefault();
        handlers.toggleTerminal();
        return;
      }
      if (isModAltKey(event, "b")) {
        event.preventDefault();
        handlers.toggleSidePane();
        return;
      }
      if (isModKey(event, "[")) {
        if (!handlers.navBack) return;
        event.preventDefault();
        handlers.navBack();
        return;
      }
      if (isModKey(event, "]")) {
        if (!handlers.navForward) return;
        event.preventDefault();
        handlers.navForward();
      }
    }
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [handlers]);
}

/* --- D.2 任务快照缓存（原 24080–24228；持久化键 zcode-task-snapshot-cache:v1） --- */

const TASK_SNAPSHOT_CACHE_KEY = "zcode-task-snapshot-cache:v1"; // 原 sge
const TASK_SNAPSHOT_MAX_ENTRY_BYTES = 256 * 1024; // 原 cge
const TASK_SNAPSHOT_MAX_TOTAL_BYTES = 2 * 1024 * 1024; // 原 lge
const TASK_SNAPSHOT_MAX_ENTRIES = 20; // 原 uge
let taskSnapshotCacheLoaded = false; // 原 dge
const taskSnapshotCache = new Map<string, TaskSnapshotCacheEntry>(); // 原 Eg

interface TaskSnapshotCacheEntry {
  key: string;
  etag: string;
  snapshot: unknown;
  updatedAt: number;
  sizeBytes: number;
}

interface TaskSnapshotRequest {
  workspacePath: string;
  workspaceIdentity?: string | null;
  taskId: string;
  messageLimit?: number;
  byteBudget?: number;
  toolLimit?: number;
  clientMode?: string;
  resumeModelPolicy?: string;
  model?: string;
  thoughtLevel?: string;
}

/** 原 fge：快照缓存键（请求参数全量拼接） */
function taskSnapshotCacheKey(request: TaskSnapshotRequest): string {
  return [
    request.workspacePath,
    request.workspaceIdentity ?? "",
    request.taskId,
    typeof request.messageLimit === "number" ? String(request.messageLimit) : "",
    typeof request.byteBudget === "number" ? String(request.byteBudget) : "",
    typeof request.toolLimit === "number" ? String(request.toolLimit) : "",
    request.clientMode ?? "desktop-continuous",
    request.resumeModelPolicy ?? "task-index",
    request.model ?? "",
    request.thoughtLevel ?? "",
  ].join("::");
}

function snapshotStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** 原 Dg：惰性从 localStorage 载入缓存 */
function ensureTaskSnapshotCacheLoaded(): void {
  if (taskSnapshotCacheLoaded) return;
  taskSnapshotCacheLoaded = true;
  const raw = snapshotStorage()?.getItem(TASK_SNAPSHOT_CACHE_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw) as { entries?: unknown };
    const entries = Array.isArray(parsed.entries) ? parsed.entries : [];
    for (const entry of entries as Array<Partial<TaskSnapshotCacheEntry>>) {
      if (typeof entry?.key !== "string" || typeof entry?.etag !== "string" || !entry.snapshot || typeof entry.updatedAt !== "number" || typeof entry.sizeBytes !== "number") continue;
      taskSnapshotCache.set(entry.key, entry as TaskSnapshotCacheEntry);
    }
  } catch {
    /* 缓存损坏即弃 */
  }
}

/** 原 Og：缓存落盘 */
function persistTaskSnapshotCache(): void {
  const storage = snapshotStorage();
  if (!storage) return;
  try {
    storage.setItem(TASK_SNAPSHOT_CACHE_KEY, JSON.stringify({ entries: [...taskSnapshotCache.values()] }));
  } catch {
    /* 配额不足静默 */
  }
}

/** 原 gge：按更新时间保留前 N 条且总量 ≤2MB */
function pruneTaskSnapshotCache(): void {
  const sorted = [...taskSnapshotCache.values()].sort((a, b) => b.updatedAt - a.updatedAt);
  const kept: TaskSnapshotCacheEntry[] = [];
  let totalBytes = 0;
  for (const entry of sorted) {
    if (kept.length >= TASK_SNAPSHOT_MAX_ENTRIES || totalBytes + entry.sizeBytes > TASK_SNAPSHOT_MAX_TOTAL_BYTES) continue;
    kept.push(entry);
    totalBytes += entry.sizeBytes;
  }
  taskSnapshotCache.clear();
  for (const entry of kept) taskSnapshotCache.set(entry.key, entry);
}

function readSnapshotEntry(key: string): { etag: string; snapshot: unknown } | null {
  ensureTaskSnapshotCacheLoaded();
  const entry = taskSnapshotCache.get(key);
  return entry ? { etag: entry.etag, snapshot: entry.snapshot } : null;
}

function writeSnapshotEntry(key: string, etag: string, snapshot: unknown): void {
  ensureTaskSnapshotCacheLoaded();
  const serialized = JSON.stringify(snapshot);
  const sizeBytes = new TextEncoder().encode(serialized).byteLength;
  if (sizeBytes > TASK_SNAPSHOT_MAX_ENTRY_BYTES) {
    taskSnapshotCache.delete(key);
    persistTaskSnapshotCache();
    return;
  }
  taskSnapshotCache.set(key, { key, etag, snapshot, updatedAt: Date.now(), sizeBytes });
  pruneTaskSnapshotCache();
  persistTaskSnapshotCache();
}

function deleteSnapshotEntry(key: string): void {
  ensureTaskSnapshotCacheLoaded();
  taskSnapshotCache.delete(key);
  persistTaskSnapshotCache();
}

interface TaskSnapshotService {
  getTaskSnapshotWithEtag(request: TaskSnapshotRequest & { ifNoneMatch?: string }): Promise<{ notModified?: boolean; snapshot?: unknown; etag?: string }>;
  [method: string]: unknown;
}

const snapshotProxies = new WeakMap<object, TaskSnapshotService>(); // 原 ige
const snapshotInFlight = new WeakMap<object, Map<string, Promise<unknown>>>(); // 原 age
const snapshotEtagMemory = new WeakMap<object, Map<string, { etag: string; snapshot: unknown }>>(); // 原 oge

function inFlightMapFor(service: object): Map<string, Promise<unknown>> {
  let map = snapshotInFlight.get(service);
  if (!map) {
    map = new Map();
    snapshotInFlight.set(service, map);
  }
  return map;
}

function etagMemoryFor(service: object): Map<string, { etag: string; snapshot: unknown }> {
  let map = snapshotEtagMemory.get(service);
  if (!map) {
    map = new Map();
    snapshotEtagMemory.set(service, map);
  }
  return map;
}

/** 原 bge：给任务服务代理上 getTaskSnapshot（etag 协商 + 内存/磁盘两级缓存 + in-flight 合并） */
function withTaskSnapshotCache(service: TaskSnapshotService): TaskSnapshotService {
  const inFlight = inFlightMapFor(service);
  const memory = etagMemoryFor(service);
  return new Proxy(service, {
    get(target, property, receiver) {
      if (property === "getTaskSnapshot") {
        return (request: TaskSnapshotRequest) => {
          const key = taskSnapshotCacheKey(request);
          const existing = inFlight.get(key);
          if (existing) return existing;
          const cached = memory.get(key) ?? readSnapshotEntry(key);
          if (cached && !memory.has(key)) memory.set(key, cached);
          const load = (async () => {
            const result = await target.getTaskSnapshotWithEtag({ ...request, ...(cached?.etag ? { ifNoneMatch: cached.etag } : {}) });
            if (result.notModified) {
              if (cached?.snapshot) return cached.snapshot;
              const fresh = await target.getTaskSnapshotWithEtag(request);
              if (fresh.snapshot && fresh.etag) {
                const entry = { etag: fresh.etag, snapshot: fresh.snapshot };
                memory.set(key, entry);
                writeSnapshotEntry(key, fresh.etag, fresh.snapshot);
              }
              return fresh.snapshot;
            }
            if (result.snapshot && result.etag) {
              const entry = { etag: result.etag, snapshot: result.snapshot };
              memory.set(key, entry);
              writeSnapshotEntry(key, result.etag, result.snapshot);
            } else if (!result.snapshot) {
              memory.delete(key);
              deleteSnapshotEntry(key);
            }
            return result.snapshot;
          })().finally(() => {
            if (inFlight.get(key) === load) inFlight.delete(key);
          });
          inFlight.set(key, load);
          return load;
        };
      }
      return Reflect.get(target, property, receiver);
    },
  });
}

/** 原 kg：useCachedTaskService —— 按工作区解析任务服务并套快照缓存 */
export function useCachedTaskService(workspacePath?: string | null, remoteSessionId?: string | null, workspaceIdentity?: string | null): unknown {
  const services = workspacePath ? useWorkspaceServices(workspacePath, remoteSessionId, workspaceIdentity) : useServices();
  const taskService = (services as { zcodeTaskService?: TaskSnapshotService }).zcodeTaskService;
  if (!taskService || typeof taskService !== "object") return taskService;
  const known = snapshotProxies.get(taskService);
  if (known) return known;
  const proxied = withTaskSnapshotCache(taskService);
  snapshotProxies.set(taskService, proxied);
  return proxied;
}

/* --- D.3 供应商配置文件路径（原 Sge/Cge/wge，js 24230–24319） --- */

export interface PathState {
  path: string | null;
  exists: boolean;
  loading: boolean;
  error: string | null;
}

/** 原 Sge：路径状态缺省 */
export const PATH_STATE_DEFAULT: PathState = { path: null, exists: false, loading: true, error: null };

interface ZCodeFileService {
  getWorkspaceProviderConfigFile(args: { workspacePath: string; workspaceIdentity?: string; provider: string }): Promise<{ path: string | null; exists: boolean }>;
}

/** 原 Cge：按服务作用域选 zcode 文件服务（远端会话无 base 服务时返回 null=等待） */
function resolveZCodeFileService(args: {
  configuredServiceScope: "workspace" | "base";
  workspaceZCodeService: ZCodeFileService | null | undefined;
  baseZCodeService: ZCodeFileService | null | undefined;
  remoteSessionId: string | null;
}): ZCodeFileService | null {
  if (args.configuredServiceScope === "workspace") return args.workspaceZCodeService ?? null;
  if (args.baseZCodeService) return args.baseZCodeService;
  return args.remoteSessionId ? null : args.workspaceZCodeService ?? null;
}

function pathErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message || error.name || String(error);
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.length > 0) return message;
  }
  return String(error);
}

/** 原 wge：useWorkspaceProviderConfigFile —— 读供应商配置文件路径（带刷新/竞态守卫） */
export function useWorkspaceProviderConfigFile(
  workspacePath: string | null,
  provider: string,
  remoteSessionId?: string | null,
  workspaceIdentity?: string | null,
  options?: { serviceScope?: "workspace" | "base"; enabled?: boolean },
): PathState & { refresh(): void } {
  const serviceScope = options?.serviceScope ?? "workspace";
  const enabled = options?.enabled ?? true;
  const resolvedRemoteSessionId = useResolvedRemoteSessionId(workspacePath, remoteSessionId, workspaceIdentity);
  const baseTaskService = useSessionRegistryStore((state) => state.baseServices?.zcodeTaskService ?? null);
  const remoteScoped = !!(workspaceIdentity?.trim() || resolvedRemoteSessionId?.trim());
  const workspaceService = useCachedTaskService(workspacePath, remoteSessionId, workspaceIdentity) as ZCodeFileService | null;
  const fileService = resolveZCodeFileService({
    configuredServiceScope: serviceScope,
    workspaceZCodeService: workspaceService,
    baseZCodeService: baseTaskService as ZCodeFileService | null,
    remoteSessionId: resolvedRemoteSessionId,
  });
  const scopeKind = serviceScope === "base" ? "base" : resolvedRemoteSessionId && workspaceService !== baseTaskService ? "remote" : "base";
  const [pathState, setPathState] = React.useState<PathState>(PATH_STATE_DEFAULT);
  const [refreshTick, bumpRefreshTick] = React.useState(0);
  const generationRef = React.useRef(0);
  const refresh = React.useCallback(() => {
    bumpRefreshTick((tick) => tick + 1);
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    if (!workspacePath || !enabled || !remoteScoped) {
      generationRef.current += 1;
      setPathState({ path: null, exists: false, loading: false, error: null });
      return () => {
        cancelled = true;
      };
    }
    if (!fileService) {
      generationRef.current += 1;
      setPathState({ path: null, exists: false, loading: true, error: null });
      return () => {
        cancelled = true;
      };
    }
    const generation = generationRef.current + 1;
    generationRef.current = generation;
    setPathState({ path: null, exists: false, loading: true, error: null });
    logger.info(`[useWorkspaceProviderConfigFile] 开始读取 provider 配置路径 workspace=${workspacePath} provider=${provider} scope=${scopeKind} session=${resolvedRemoteSessionId ?? "none"}`);
    fileService
      .getWorkspaceProviderConfigFile({ workspacePath, ...(workspaceIdentity ? { workspaceIdentity } : {}), provider })
      .then((result) => {
        if (cancelled || generationRef.current !== generation) return;
        logger.info(
          `[useWorkspaceProviderConfigFile] 读取 provider 配置路径成功 workspace=${workspacePath} provider=${provider} scope=${scopeKind} session=${resolvedRemoteSessionId ?? "none"} exists=${result.exists} path=${result.path}`,
        );
        setPathState({ path: result.path, exists: result.exists, loading: false, error: null });
      })
      .catch((error) => {
        if (cancelled || generationRef.current !== generation) return;
        const message = pathErrorMessage(error);
        logger.warn("[useWorkspaceProviderConfigFile] 读取 provider 配置路径失败", { workspacePath, provider, scope: scopeKind, remoteSessionId: resolvedRemoteSessionId, error: message });
        setPathState({ path: null, exists: false, loading: false, error: message });
      });
    return () => {
      cancelled = true;
    };
  }, [fileService, scopeKind, enabled, provider, refreshTick, resolvedRemoteSessionId, workspaceIdentity, workspacePath, remoteScoped]);

  return React.useMemo(() => ({ ...pathState, refresh }), [refresh, pathState]);
}

/** 原 Ag：useSessionService */
export function useSessionService(workspacePath?: string | null, remoteSessionId?: string | null, workspaceIdentity?: string | null): unknown {
  const services = workspacePath ? useWorkspaceServices(workspacePath, remoteSessionId, workspaceIdentity) : useServices();
  return (services as { zcodeSessionService?: unknown }).zcodeSessionService;
}

/* ============================================================================
 * E. 工作区作用域 context（原 42597–42806）
 * ==========================================================================*/

/* --- E.1 遥测监督注册表（原 gT/_T/vT + _Fe/xT/vFe/yFe/bFe） --- */

export interface TelemetryScope {
  workspacePath: string;
  workspaceIdentity?: string;
  remoteSessionId?: string;
}

interface SupervisorEntry {
  key: string;
  logicalScopeKey: string;
  supervisor: ConversationTelemetrySupervisor;
  refCount: number;
  subscription: Disposable | null;
  stale: boolean;
  workspaceDetached: boolean;
}

const supervisorServiceIds = new WeakMap<object, number>(); // 原 gT
let nextSupervisorServiceId = 1; // 原 _T
const supervisorEntries = new Map<string, SupervisorEntry>(); // 原 vT

function supervisorServiceId(service: object): number {
  const known = supervisorServiceIds.get(service);
  if (known !== undefined) return known;
  const id = nextSupervisorServiceId;
  nextSupervisorServiceId += 1;
  supervisorServiceIds.set(service, id);
  return id;
}

/** 原 gFe：物理作用域键 = 远端会话\0工作区键\0服务代号 */
function physicalScopeKey(scope: TelemetryScope, agentService: object): string {
  const workspacePart = scope.workspaceIdentity?.trim() || scope.workspacePath;
  return [scope.remoteSessionId ?? "__base__", workspacePart, supervisorServiceId(agentService)].join("\u0000");
}

/** 原 yT：逻辑作用域键 = 远端会话\0工作区键 */
function logicalScopeKey(scope: TelemetryScope): string {
  const workspacePart = scope.workspaceIdentity?.trim() || scope.workspacePath;
  return [scope.remoteSessionId ?? "__base__", workspacePart].join("\u0000");
}

/** 原 bT：作用域等价判断 */
export function isSameTelemetryScope(a: TelemetryScope, b: TelemetryScope): boolean {
  return (
    (a.remoteSessionId ?? "__base__") === (b.remoteSessionId ?? "__base__") &&
    (a.workspaceIdentity?.trim() || a.workspacePath) === (b.workspaceIdentity?.trim() || b.workspacePath)
  );
}

/** 原 S：平台遥测服务（App 根注入；此处为消费面声明） */
declare function useTelemetryPlatform(): TelemetryPlatform | null;

/** 原 sAe：zcodeAgentService 的事件订阅面（onFact） */
declare function agentEventSurface(agentService: unknown): {
  onFact(args: { workspacePath: string; workspaceIdentity?: string }): (listener: (fact: AgentFact) => void) => Disposable;
};

/** 原 _Fe：获取（或创建）作用域监督；引用计数释放 */
function acquireSupervisor(
  scope: TelemetryScope,
  services: { zcodeAgentService: unknown },
  platform: TelemetryPlatform,
): { entry: SupervisorEntry; release(): void } {
  const logicalKey = logicalScopeKey(scope);
  const physicalKey = physicalScopeKey(scope, services.zcodeAgentService as object);
  for (const [key, entry] of supervisorEntries) {
    if (entry.logicalScopeKey !== logicalKey || key === physicalKey) continue;
    supervisorEntries.delete(key);
    entry.stale = true;
    if (entry.refCount === 0) disposeSupervisorEntry(entry);
  }
  let entry = supervisorEntries.get(physicalKey);
  if (entry) {
    entry.refCount += 1;
  } else {
    entry = {
      key: physicalKey,
      logicalScopeKey: logicalKey,
      supervisor: new ConversationTelemetrySupervisor({ platform, workspaceScopeKey: physicalKey }),
      refCount: 1,
      subscription: null,
      stale: false,
      workspaceDetached: false,
    };
    supervisorEntries.set(physicalKey, entry);
  }
  let released = false;
  return {
    entry,
    release: () => {
      if (released) return;
      released = true;
      --entry!.refCount;
      if (!(entry!.refCount > 0) && (entry!.stale || entry!.workspaceDetached)) disposeSupervisorEntry(entry!);
    },
  };
}

/** 原 xT */
function disposeSupervisorEntry(entry: SupervisorEntry): void {
  if (supervisorEntries.get(entry.key) === entry) supervisorEntries.delete(entry.key);
  entry.subscription?.dispose();
  entry.subscription = null;
  entry.supervisor.dispose();
}

/** 原 vFe：释放全部监督（应用退出） */
export function disposeAllSupervisors(): void {
  for (const entry of supervisorEntries.values()) disposeSupervisorEntry(entry);
  supervisorEntries.clear();
}

/** 原 yFe：工作区卸载时标记游离监督 */
export function detachSupervisorWorkspaces(scopes: TelemetryScope[]): void {
  const active = new Set(scopes.map(logicalScopeKey));
  for (const entry of supervisorEntries.values()) {
    entry.workspaceDetached = !active.has(entry.logicalScopeKey);
    if (entry.workspaceDetached && entry.refCount === 0) disposeSupervisorEntry(entry);
  }
}

/** 原 bFe：为监督订阅工作区事实流（幂等） */
function ensureFactSubscription(entry: SupervisorEntry, scope: TelemetryScope, services: { zcodeAgentService: unknown }): void {
  entry.subscription ||= agentEventSurface(services.zcodeAgentService).onFact({
    workspacePath: scope.workspacePath,
    ...(scope.workspaceIdentity ? { workspaceIdentity: scope.workspaceIdentity } : {}),
  })((fact) => entry.supervisor.handleFact(fact));
}

/* --- E.2 TelemetryScope provider（原 ST/CT/xFe/wT/SFe，服务作用域） --- */

interface TelemetryScopeValue {
  scope: TelemetryScope;
  supervisor: ConversationTelemetrySupervisor;
  foregroundEnabled: boolean;
}

const TelemetryScopeContext = React.createContext<TelemetryScopeValue | null>(null); // 原 ST

/** 原 CT：TelemetryScopeProvider（enabled + foregroundEnabled + 作用域） */
export function TelemetryScopeProvider({
  enabled,
  foregroundEnabled = true,
  services,
  workspacePath,
  workspaceIdentity,
  remoteSessionId,
  children,
}: {
  enabled: boolean;
  foregroundEnabled?: boolean;
  services: { zcodeAgentService: unknown };
  workspacePath: string;
  workspaceIdentity?: string;
  remoteSessionId?: string;
  children: React.ReactNode;
}) {
  const platform = useTelemetryPlatform();
  const scope = React.useMemo<TelemetryScope>(
    () => ({ workspacePath, ...(workspaceIdentity ? { workspaceIdentity } : {}), ...(remoteSessionId ? { remoteSessionId } : {}) }),
    [remoteSessionId, workspaceIdentity, workspacePath],
  );
  const lease = React.useMemo(() => {
    const agentService = services.zcodeAgentService;
    return !enabled || !platform || !agentService ? null : acquireSupervisor(scope, services, platform);
  }, [enabled, platform, scope, services]);
  const supervisor = lease?.entry.supervisor ?? null;

  React.useEffect(() => {
    if (!lease) return;
    ensureFactSubscription(lease.entry, scope, services);
    return () => {
      lease.release();
    };
  }, [lease, scope, services]);

  const value = React.useMemo<TelemetryScopeValue | null>(() => (supervisor ? { scope, supervisor, foregroundEnabled } : null), [foregroundEnabled, scope, supervisor]);
  return <TelemetryScopeContext.Provider value={value}>{children}</TelemetryScopeContext.Provider>;
}

/** 原 xFe：在既有遥测作用域下为新作用域挂子 provider（继承 enabled/foreground） */
export function InheritedTelemetryScopeProvider({ services, scope, children }: { services: { zcodeAgentService: unknown }; scope: TelemetryScope; children: React.ReactNode }) {
  const parent = React.useContext(TelemetryScopeContext);
  return (
    <TelemetryScopeProvider
      enabled={parent !== null}
      foregroundEnabled={parent?.foregroundEnabled ?? false}
      services={services}
      workspacePath={scope.workspacePath}
      workspaceIdentity={scope.workspaceIdentity}
      remoteSessionId={scope.remoteSessionId}
    >
      {children}
    </TelemetryScopeProvider>
  );
}

/** 原 wT：useTelemetrySupervisor（作用域匹配才返回） */
export function useTelemetrySupervisor(scope: TelemetryScope): ConversationTelemetrySupervisor | null {
  const value = React.useContext(TelemetryScopeContext);
  return value && isSameTelemetryScope(value.scope, scope) ? value.supervisor : null;
}

/** 原 SFe：useIsTelemetryForeground */
export function useIsTelemetryForeground(scope: TelemetryScope): boolean {
  const value = React.useContext(TelemetryScopeContext);
  return !!(value && value.foregroundEnabled && isSameTelemetryScope(value.scope, scope));
}

/* --- E.3 V4Conversation provider（原 TT/CFe/wFe/ET，工作区作用域） --- */

export interface V4ConversationApi {
  layer: unknown;
  sendCommand(command: unknown): unknown;
  fileChanges(args: unknown): unknown;
  fileRewindPreview(args: unknown): unknown;
  attachmentPut(id: string, data: unknown): unknown;
  attachmentRead(id: string): unknown;
  onRuntimeRestart(listener: () => void): Disposable;
}

const V4ConversationContext = React.createContext<V4ConversationApi | null>(null); // 原 TT

/** 原 mw/_w：会话传输与层（F03 域；此处声明） */
declare function createConversationTransport(agentService: unknown, scope: { workspacePath: string; workspaceIdentity?: string }): {
  sendCommand(command: unknown): unknown;
  fileChanges(args: unknown): unknown;
  fileRewindPreview(args: unknown): unknown;
  attachmentPut(id: string, data: unknown): unknown;
  attachmentRead(id: string): unknown;
  onRuntimeRestart(listener: () => void): Disposable;
};
declare class ConversationLayer {
  constructor(args: { transport: unknown });
  dispose(): void;
}

/** 原 CFe：V4ConversationProvider 内层（装配传输+层，卸载即释放） */
export function V4ConversationProviderInner({
  workspacePath,
  workspaceIdentity,
  children,
  services,
}: {
  workspacePath: string;
  workspaceIdentity?: string;
  children: React.ReactNode;
  services: BaseServices & { zcodeAgentService: unknown };
}) {
  const { zcodeAgentService } = services;
  const api = React.useMemo(() => {
    const transport = createConversationTransport(zcodeAgentService, { workspacePath, workspaceIdentity });
    return {
      layer: new ConversationLayer({ transport }),
      sendCommand: (command: unknown) => transport.sendCommand(command),
      fileChanges: (args: unknown) => transport.fileChanges(args),
      fileRewindPreview: (args: unknown) => transport.fileRewindPreview(args),
      attachmentPut: (id: string, data: unknown) => transport.attachmentPut(id, data),
      attachmentRead: (id: string) => transport.attachmentRead(id),
      onRuntimeRestart: (listener: () => void) => transport.onRuntimeRestart(listener),
    };
  }, [workspacePath, workspaceIdentity, zcodeAgentService]);

  React.useEffect(
    () => () => {
      api.layer.dispose();
    },
    [api],
  );

  return (
    <ServiceProvider services={services}>
      <V4ConversationContext.Provider value={api}>{children}</V4ConversationContext.Provider>
    </ServiceProvider>
  );
}

/** 原 wFe：V4ConversationProvider（rpc 就绪才渲染） */
export function V4ConversationProvider({ workspacePath, workspaceIdentity, children }: { workspacePath: string; workspaceIdentity?: string; children: React.ReactNode }) {
  const resolved = useResolvedWorkspaceServices(workspacePath, undefined, workspaceIdentity);
  if (!resolved.rpcReady) return null;
  return (
    <V4ConversationProviderInner workspacePath={workspacePath} workspaceIdentity={workspaceIdentity} services={resolved.services as BaseServices & { zcodeAgentService: unknown }}>
      {children}
    </V4ConversationProviderInner>
  );
}

/** 原 ET：useV4Conversation */
export function useV4Conversation(): V4ConversationApi {
  const api = React.useContext(V4ConversationContext);
  if (!api) throw new Error("useV4Conversation 必须在 V4ConversationProvider 内使用");
  return api;
}

/* --- E.4 面板作用域 provider（原 DT/TFe） --- */

/** 原 mNe：带租约的会话传输（面板作用域；声明） */
declare function leaseConversationTransport(
  scope: { workspacePath: string; workspaceIdentity?: string; remoteSessionId?: string },
  agentService: unknown,
): {
  layer: unknown;
  transport: {
    sendCommand(command: unknown): unknown;
    fileChanges(args: unknown): unknown;
    fileRewindPreview(args: unknown): unknown;
    attachmentPut(id: string, data: unknown): unknown;
    attachmentRead(id: string): unknown;
    onRuntimeRestart(listener: () => void): Disposable;
  };
  release(): void;
};

/** 原 DT：PanelScopeProvider（按作用域解析服务，就绪才渲染） */
export function PanelScopeProvider({ scope, children }: { scope: TelemetryScope; children: React.ReactNode }) {
  const resolved = useResolvedWorkspaceServices(scope.workspacePath, scope.remoteSessionId ?? null, scope.workspaceIdentity ?? null);
  if (!resolved.rpcReady) return null;
  return <PanelScopeProviderInner scope={scope} services={resolved.services}>{children}</PanelScopeProviderInner>;
}

/** 原 TFe */
function PanelScopeProviderInner({ scope, services, children }: { scope: TelemetryScope; services: BaseServices; children: React.ReactNode }) {
  const agentService = (services as { zcodeAgentService: unknown }).zcodeAgentService;
  const lease = React.useMemo(() => {
    const leased = leaseConversationTransport(
      { workspacePath: scope.workspacePath, ...(scope.workspaceIdentity ? { workspaceIdentity: scope.workspaceIdentity } : {}), ...(scope.remoteSessionId ? { remoteSessionId: scope.remoteSessionId } : {}) },
      agentService,
    );
    return {
      lease: leased,
      value: {
        layer: leased.layer,
        sendCommand: (command: unknown) => leased.transport.sendCommand(command),
        fileChanges: (args: unknown) => leased.transport.fileChanges(args),
        fileRewindPreview: (args: unknown) => leased.transport.fileRewindPreview(args),
        attachmentPut: (id: string, data: unknown) => leased.transport.attachmentPut(id, data),
        attachmentRead: (id: string) => leased.transport.attachmentRead(id),
        onRuntimeRestart: (listener: () => void) => leased.transport.onRuntimeRestart(listener),
      } as V4ConversationApi,
    };
  }, [agentService, scope.workspacePath, scope.workspaceIdentity, scope.remoteSessionId]);

  React.useEffect(
    () => () => {
      lease.lease.release();
    },
    [lease],
  );

  return (
    <ServiceProvider services={services}>
      <InheritedTelemetryScopeProvider services={services as { zcodeAgentService: unknown }} scope={scope}>
        <V4ConversationContext.Provider value={lease.value}>{children}</V4ConversationContext.Provider>
      </InheritedTelemetryScopeProvider>
    </ServiceProvider>
  );
}

/* ============================================================================
 * F. 会话遥测监督（原 41808–42596）
 * ----------------------------------------------------------------------------
 * MODULE-MAP §2.6 记为“权限状态机”；按实现更正：这是 v4 会话遥测/归因监督器
 * （提示词种子 → 轮次 → 模型请求/工具/子代理/压缩/终端 的事实归因与上报，
 * 含前台判定、去重、缓冲与延迟终端处理）。permission.lifecycle 事实的处理
 * （SPe/CPe 权限等待计时）是其中一支。
 * ==========================================================================*/

const BOUNDED_SET_CAPACITY = 2000; // 原 lT
const MAX_PENDING_FACTS_PER_COMMAND = 128; // 原 sFe
const MAX_PENDING_FACT_COMMANDS = 200; // 原 cFe

/** 原 uT：有界字符串去重集（FIFO 驱逐） */
export class BoundedStringSet {
  private keys = new Set<string>();
  /** 返回 true 表示首次出现（已记住） */
  remember(key: string): boolean {
    if (this.keys.has(key)) return false;
    this.keys.add(key);
    if (this.keys.size > BOUNDED_SET_CAPACITY) {
      const oldest = this.keys.values().next().value;
      if (typeof oldest === "string") this.keys.delete(oldest);
    }
    return true;
  }
  clear(): void {
    this.keys.clear();
  }
}

/* --- fact 类型与助手 --- */

export interface AgentFact {
  kind:
    | "turn.started"
    | "turn.terminal"
    | "model.request.status"
    | "stream.chunk"
    | "tool.lifecycle"
    | "permission.lifecycle"
    | "usage.delta"
    | "subagent.lifecycle"
    | "compaction.terminal"
    | string;
  eventId: string;
  sessionId: string;
  sourceCommandId?: string;
  turnId?: string;
  [key: string]: unknown;
}

export interface TelemetryPlatform {
  [method: string]: unknown;
}

/** 原 dT：model.request.status → task_network_debug_status 明细 */
function buildNetworkDebugStatus(fact: AgentFact): Record<string, unknown> {
  return {
    type: "task_network_debug_status",
    taskId: fact.sessionId,
    traceId: fact.eventId,
    ...(fact.sourceCommandId ? { inputId: fact.sourceCommandId } : {}),
    ...(fact.queryId ? { queryId: fact.queryId } : {}),
    eventKey: fact.eventId,
    eventId: fact.eventId,
    statusType: fact.status,
    requestId: fact.requestId,
    providerId: fact.providerId,
    modelId: fact.modelId,
    providerKind: fact.providerKind,
    transport: fact.transport,
    baseURL: fact.providerHostname ? `https://${fact.providerHostname}` : undefined,
    querySource: fact.querySource,
    attempt: fact.attempt,
    maxAttempts: fact.maxAttempts,
    nextAttempt: fact.nextAttempt,
    retryable: fact.retryable,
    statusCode: fact.statusCode,
    durationMs: fact.durationMs,
    delayMs: fact.delayMs,
    idleMs: fact.idleMs,
    timeoutMs: fact.timeoutMs,
    reason: fact.reason,
    requestHeaders: {},
    responseHeaders: {},
    requestHeaderCount: 0,
    responseHeaderCount: 0,
  };
}

/** 原 fT：usage.delta → 用量结构 */
function extractUsageDelta(fact: AgentFact): TokenUsage {
  return {
    inputTokens: fact.inputTokens as number,
    outputTokens: fact.outputTokens as number,
    totalTokens: fact.totalTokens as number,
    reasoningTokens: fact.reasoningTokens as number | undefined,
    cachedInputTokens: fact.cacheReadTokens as number | undefined,
    cachedWriteInputTokens: fact.cacheWriteTokens as number | undefined,
  };
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  reasoningTokens?: number;
  cachedInputTokens?: number;
  cachedWriteInputTokens?: number;
}

/** 原 pT：provider/model → 完整模型名 */
function resolveModelName(providerId?: string, modelId?: string): string {
  const provider = providerId?.trim() ?? "";
  const model = modelId?.trim() ?? "";
  if (!provider) return model;
  return model ? (model.includes("/") ? model : `${provider}/${model}`) : "";
}

/** 原 fFe：用量累加 */
function mergeTokenUsage(base: TokenUsage | null, delta: TokenUsage): TokenUsage {
  return base
    ? {
        inputTokens: base.inputTokens + delta.inputTokens,
        outputTokens: base.outputTokens + delta.outputTokens,
        totalTokens: base.totalTokens + delta.totalTokens,
        reasoningTokens: (base.reasoningTokens ?? 0) + (delta.reasoningTokens ?? 0),
        cachedInputTokens: (base.cachedInputTokens ?? 0) + (delta.cachedInputTokens ?? 0),
        cachedWriteInputTokens: (base.cachedWriteInputTokens ?? 0) + (delta.cachedWriteInputTokens ?? 0),
      }
    : { ...delta };
}

/** 原 pFe：工具超时判定 */
function isToolTimeoutFact(fact: AgentFact): boolean {
  return fact.errorCode === "tool_timeout" || (fact.performance as { timedOut?: boolean } | undefined)?.timedOut === true;
}

/** 原 mFe：终端状态归一 */
function mapTerminalStatus(status: string): "success" | "user_interrupt" | "fail" {
  return status === "success" ? "success" : status === "interrupted" ? "user_interrupt" : "fail";
}

/** 原 mT */
function finiteNumber(value: unknown): number | undefined {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/* --- 遥测下沉函数（原实现分散于 41500–41800 区；接口级声明） --- */

declare function reportTelemetry(platform: TelemetryPlatform, report: TelemetryReport, scope: string): Promise<void>; // 原 xw
declare function finalizeConversationSteps(args: {
  taskId: string;
  event: Record<string, unknown>;
  activeInputId: string;
  clientMode: string;
  toolAttribution?: Record<string, unknown>;
  now: number;
}): Array<{ eventExtraDetail: Record<string, string> }>; // 原 Zw
declare function recordComposerFocusSink(workspaceScopeKey: string, now: number): void; // 原 dPe
declare function recordComposerTextChangeSink(workspaceScopeKey: string, change: unknown, now: number): void; // 原 fPe
declare function buildPromptSeedDetail(args: { workspacePath: string; taskId: string; messageId: string; sendTime: number; extraDetail?: unknown }): Record<string, string>; // 原 pPe
declare function reportVisibleChatErrorSink(platform: TelemetryPlatform, payload: Record<string, unknown>): void; // 原 ePe
declare function recordPermissionRequested(args: { taskId: string; requestId?: string; toolCallId?: string; now: number }): void; // 原 SPe
declare function recordPermissionResolved(args: { taskId: string; requestId?: string; now: number }): void; // 原 CPe
declare function recordUsageDelta(args: { taskId: string; eventKey: string; usage: TokenUsage; requestId?: string; modelName: string; modelProvider?: string; providerName?: string }): void; // 原 xPe
declare function recordSubagentToolAttribution(args: Record<string, unknown>): void; // 原 vPe
declare function recordModelRequestStatus(taskId: string, status: Record<string, unknown>, sourceCommandId: string): void; // 原 hPe
declare function recordTurnStarted(taskId: string, sourceCommandId: string): void; // 原 mPe
declare function recordStreamChunkForeground(taskId: string, args: Record<string, unknown>): void; // 原 eFe
declare function clearConversationWaitState(taskId: string): void; // 原 cT
declare function purgeConversationTiming(taskId: string): void; // 原 EPe
declare function purgePromptSeedTiming(taskId: string, sourceCommandId: string): void; // 原 DPe
declare function buildMessageCompletionDetail(args: { taskId: string; status: string; finishedAt: number; errorType?: string; errorMsg?: string }): { eventExtraDetail: Record<string, string> } | null; // 原 wPe
declare function recordTtft(args: { ttftMs: number; model?: string; talkId: string; messageId: string }): void; // 原 XPe
declare function recordProviderTtft(platform: TelemetryPlatform, args: { providerId?: string; modelName?: string; askMode?: string; ttftMs: number }): void; // 原 FPe
declare function recordDuration(args: { durationMs: number; result: string; model?: string; talkId: string; messageId: string }): void; // 原 ZPe
declare function recordConversationResult(args: Record<string, unknown>): void; // 原 QPe
declare function recordToolPerformance(args: Record<string, unknown>): void; // 原 $Pe
declare function buildCompactionDetail(args: { timeline: Record<string, unknown>; modelName?: string; modelProvider?: string }): Record<string, string> | null; // 原 sPe
declare function resolveCompactionModelName(args: { configProvider?: string; modelName?: string }): string | undefined; // 原 aFe
declare function lastReportedMessageId(taskId: string): string | undefined; // 原 bPe
declare function currentConversationModel(taskId: string): string | undefined; // 原 yPe
declare function resolveBusinessRecoveryAction(error: unknown): string | undefined; // 原 JNe
declare function extractStepSourceDetail(extraDetail: unknown): Record<string, string>; // 原 dFe
declare function extractPromptSeedFromTurnStarted(fact: AgentFact): { sourceCommandId: string; sessionId: string; sendTime: number; extraDetail?: unknown } | null; // 原 lFe

export interface TelemetryReport {
  elementName: string;
  eventRegion: string;
  eventType: string;
  eventExtraDetail: Record<string, string>;
  talkId?: string;
  messageId?: string;
}

interface PromptLifecycle {
  sessionId: string;
  sourceCommandId: string;
  taskKey: string;
  sendTime: number;
  foregroundFirstTokenAt: number | null;
  legacyFirstTokenObserved: boolean;
  active: boolean;
  turnId?: string;
  lastErrorMessage?: string;
  startedToolCallIds: Set<string>;
  stepSourceDetail: Record<string, string>;
}

interface ForegroundSubagentUsage {
  agentId?: string;
  parentCommandId: string;
  parentToolCallId: string;
  requestIds: string[];
  requestCount: number;
  modelName: string;
  modelProvider: string;
  providerName: string;
  usage: TokenUsage | null;
  stopped: boolean;
  pendingFinalizedSteps: Array<{ step: { eventExtraDetail: Record<string, string> }; extraDetail?: Record<string, string> }>;
}

/**
 * 原 hT（js 41893–42596）：ConversationTelemetrySupervisor。
 * 按工作区作用域聚合会话事实流：
 *  - acceptPromptSeed：提示词发送（send_btn 上报 + 生命周期建档 + 积压事实排空）
 *  - attachForeground/detachForeground：前台会话引用计数
 *  - handleFact：事实分派（去重 → 子代理/压缩/轮次/归因 → 缓冲或处理）
 *  - handleTerminal：轮次终端（完成/错误上报 + 计时臂 + 生命周期清理）
 *  - enqueueReport：串行上报队列（reportTail 链）
 */
export class ConversationTelemetrySupervisor {
  private platform: TelemetryPlatform;
  private workspaceScopeKey: string;
  private now: () => number;
  private eventIds = new BoundedStringSet();
  private acceptedCommandIds = new BoundedStringSet();
  private terminalKeys = new BoundedStringSet();
  private compactionKeys = new BoundedStringSet();
  private foregroundOwnerSessions = new Map<string, string>();
  private foregroundSessionCounts = new Map<string, number>();
  private lifecyclesByCommandId = new Map<string, PromptLifecycle>();
  private activeCommandBySessionId = new Map<string, string>();
  private commandIdByTurnKey = new Map<string, string>();
  private pendingFactsByCommandId = new Map<string, Array<{ fact: AgentFact; receivedAt: number; foregroundAtReceipt: boolean }>>();
  private foregroundSubagentUsageByChildSession = new Map<string, ForegroundSubagentUsage>();
  private deferredTerminalsByCommandId = new Map<string, { lifecycle: PromptLifecycle; fact: AgentFact; receivedAt: number; foregroundAtReceipt: boolean }>();
  private reportTail: Promise<void> | null = null;
  private disposed = false;

  constructor(args: { platform: TelemetryPlatform; workspaceScopeKey: string; now?: () => number }) {
    this.platform = args.platform;
    this.workspaceScopeKey = args.workspaceScopeKey;
    this.now = args.now ?? Date.now;
  }

  recordComposerFocus(): void {
    if (!this.disposed) recordComposerFocusSink(this.workspaceScopeKey, this.now());
  }

  recordComposerTextChange(change: unknown): void {
    if (!this.disposed) recordComposerTextChangeSink(this.workspaceScopeKey, change, this.now());
  }

  acceptPromptSeed(seed: { sourceCommandId: string; sessionId: string; sendTime: number; extraDetail?: unknown }, options: { reportSendButton?: boolean } = {}): void {
    if (this.disposed || !this.acceptedCommandIds.remember(seed.sourceCommandId)) return;
    const taskKey = this.taskKey(seed.sessionId);
    const detail = buildPromptSeedDetail({
      workspacePath: this.workspaceScopeKey,
      taskId: taskKey,
      messageId: seed.sourceCommandId,
      sendTime: seed.sendTime,
      extraDetail: seed.extraDetail,
    });
    this.lifecyclesByCommandId.set(seed.sourceCommandId, {
      sessionId: seed.sessionId,
      sourceCommandId: seed.sourceCommandId,
      taskKey,
      sendTime: seed.sendTime,
      foregroundFirstTokenAt: null,
      legacyFirstTokenObserved: false,
      active: false,
      startedToolCallIds: new Set(),
      stepSourceDetail: extractStepSourceDetail(seed.extraDetail),
    });
    if (this.lifecyclesByCommandId.size > BOUNDED_SET_CAPACITY) {
      const evictable = [...this.lifecyclesByCommandId].find(([commandId, lifecycle]) => commandId !== seed.sourceCommandId && !lifecycle.active);
      if (evictable) {
        this.lifecyclesByCommandId.delete(evictable[0]);
        purgePromptSeedTiming(evictable[1].taskKey, evictable[1].sourceCommandId);
      }
    }
    if (options.reportSendButton !== false) {
      this.enqueueReport({
        elementName: "send_btn",
        eventRegion: "app",
        eventType: "ck",
        eventExtraDetail: detail,
        talkId: seed.sessionId,
        messageId: seed.sourceCommandId,
      });
    }
    this.drainPendingFacts(seed.sourceCommandId);
  }

  attachForeground(paneKey: string, sessionId: string): () => void {
    if (this.disposed) return () => undefined;
    const owner = this.foregroundOwnerSessions.get(paneKey);
    if (owner === sessionId) return () => this.detachForeground(paneKey);
    if (owner) this.decrementForeground(owner);
    this.foregroundOwnerSessions.set(paneKey, sessionId);
    this.foregroundSessionCounts.set(sessionId, (this.foregroundSessionCounts.get(sessionId) ?? 0) + 1);
    return () => this.detachForeground(paneKey);
  }

  handleFact(fact: AgentFact): void {
    const dedupeKey = `${fact.sessionId}\u0000${fact.eventId}`;
    if (this.disposed || !this.eventIds.remember(dedupeKey)) return;
    const receivedAt = this.now();
    const foreground = this.isForeground(fact.sessionId);
    if (fact.kind === "model.request.status") recordModelRequestStatus(this.taskKey(fact.sessionId), buildNetworkDebugStatus(fact), fact.sourceCommandId ?? "");
    if (fact.kind === "subagent.lifecycle") {
      this.handleSubagentLifecycle(fact);
      return;
    }
    const subagentUsage = this.foregroundSubagentUsageByChildSession.get(fact.sessionId);
    if (subagentUsage) {
      this.handleForegroundSubagentFact(subagentUsage, fact);
      return;
    }
    if (fact.kind === "compaction.terminal") {
      this.handleCompaction(fact, foreground);
      return;
    }
    if (fact.kind === "turn.started") {
      const seed = extractPromptSeedFromTurnStarted(fact);
      if (seed) this.acceptPromptSeed(seed, { reportSendButton: false });
    }
    const commandId = this.resolveCommandId(fact);
    if (!commandId) return;
    const lifecycle = this.lifecyclesByCommandId.get(commandId);
    const blockedByDeferredTerminal = lifecycle !== undefined && fact.kind === "turn.started" && this.hasDeferredTerminalForTask(lifecycle.taskKey, lifecycle.sourceCommandId);
    if (!lifecycle || blockedByDeferredTerminal || (!lifecycle.active && fact.kind !== "turn.started")) {
      this.bufferFact(commandId, { fact, receivedAt, foregroundAtReceipt: foreground });
      return;
    }
    this.processPromptFact(lifecycle, fact, receivedAt, foreground);
    if (fact.kind === "turn.started") this.drainPendingFacts(commandId);
  }

  private handleSubagentLifecycle(fact: AgentFact): void {
    if (fact.phase === "spawned") {
      if (fact.background || !fact.parentToolCallId) return;
      const commandId = this.resolveCommandId(fact);
      if (!commandId || !this.lifecyclesByCommandId.get(commandId)?.active) return;
      const usage: ForegroundSubagentUsage = {
        agentId: fact.agentId as string | undefined,
        parentCommandId: commandId,
        parentToolCallId: fact.parentToolCallId as string,
        requestIds: [],
        requestCount: 0,
        modelName: "",
        modelProvider: "",
        providerName: "",
        usage: null,
        stopped: false,
        pendingFinalizedSteps: [],
      };
      this.foregroundSubagentUsageByChildSession.set(fact.childSessionId as string, usage);
      this.syncForegroundSubagentToolAttribution(usage);
      return;
    }
    const usage = this.foregroundSubagentUsageByChildSession.get(fact.sessionId);
    if (!usage) return;
    if (fact.background) {
      usage.stopped = true;
      this.reportPendingForegroundSubagentSteps(usage, false);
      this.flushDeferredTerminal(usage.parentCommandId);
      return;
    }
    this.syncForegroundSubagentToolAttribution(usage);
    usage.stopped = true;
    this.reportPendingForegroundSubagentSteps(usage);
    this.flushDeferredTerminal(usage.parentCommandId);
  }

  private handleForegroundSubagentFact(usage: ForegroundSubagentUsage, fact: AgentFact): void {
    if (fact.kind === "model.request.status") {
      if (fact.status !== "model_request_started") return;
      usage.modelName = resolveModelName(fact.providerId as string | undefined, fact.modelId as string | undefined);
      usage.modelProvider = (fact.providerId as string) ?? "";
      usage.providerName = (fact.providerHostname as string) ?? "";
      this.syncForegroundSubagentToolAttribution(usage);
      return;
    }
    if (fact.kind === "usage.delta") {
      usage.usage = mergeTokenUsage(usage.usage, extractUsageDelta(fact));
      usage.requestCount += 1;
      if (fact.requestId && !usage.requestIds.includes(fact.requestId as string)) usage.requestIds.push(fact.requestId as string);
      if (fact.providerId || fact.modelId) {
        usage.modelName = resolveModelName(fact.providerId as string | undefined, fact.modelId as string | undefined);
        usage.modelProvider = (fact.providerId as string) ?? usage.modelProvider;
        usage.providerName = (fact.providerHostname as string) ?? usage.providerName;
      }
      this.syncForegroundSubagentToolAttribution(usage);
    }
  }

  private syncForegroundSubagentToolAttribution(usage: ForegroundSubagentUsage): void {
    const lifecycle = this.lifecyclesByCommandId.get(usage.parentCommandId);
    if (!lifecycle?.active) return;
    recordSubagentToolAttribution({
      taskId: lifecycle.taskKey,
      toolCallId: usage.parentToolCallId,
      requestIds: usage.requestIds,
      requestCount: usage.requestCount,
      modelName: usage.modelName,
      modelProvider: usage.modelProvider,
      providerName: usage.providerName,
      agentId: usage.agentId,
      ...(usage.usage ? { usage: usage.usage } : {}),
    });
  }

  private reportPendingForegroundSubagentSteps(usage: ForegroundSubagentUsage, applyAttribution = true): void {
    const lifecycle = this.lifecyclesByCommandId.get(usage.parentCommandId);
    if (!lifecycle?.active) return;
    for (const pending of usage.pendingFinalizedSteps.splice(0)) {
      if (applyAttribution) this.applyForegroundSubagentAttribution(pending.step, usage);
      this.reportFinalizedSteps(lifecycle, [pending.step], pending.extraDetail);
    }
  }

  private applyForegroundSubagentAttribution(step: { eventExtraDetail: Record<string, string> }, usage: ForegroundSubagentUsage): void {
    const detail = step.eventExtraDetail;
    detail.agent_id = usage.agentId ?? "";
    if (usage.modelName || usage.modelProvider || usage.providerName) {
      detail.model_name = usage.modelName;
      detail.model_provider = usage.modelProvider;
      detail.provider_name = usage.providerName;
    }
    if (usage.usage) {
      detail.model_request_id = usage.requestIds.length === 1 ? (usage.requestIds[0] ?? "") : "";
      detail.model_request_count = String(usage.requestCount);
      detail.token_usage_scope = "subagent_requests";
      detail.input_tokens = String(usage.usage.inputTokens);
      detail.output_tokens = String(usage.usage.outputTokens);
      detail.reasoning_tokens = String(usage.usage.reasoningTokens ?? 0);
      detail.cached_tokens = String(usage.usage.cachedInputTokens ?? 0);
      detail.cache_write_input_tokens = String(usage.usage.cachedWriteInputTokens ?? 0);
      detail.total_tokens = String(usage.usage.totalTokens);
    }
  }

  private flushDeferredTerminal(commandId: string): void {
    const deferred = this.deferredTerminalsByCommandId.get(commandId);
    if (!deferred) return;
    if ([...this.foregroundSubagentUsageByChildSession.values()].some((usage) => usage.parentCommandId === commandId && !usage.stopped)) return;
    this.deferredTerminalsByCommandId.delete(commandId);
    this.handleTerminal(deferred.lifecycle, deferred.fact, deferred.receivedAt, deferred.foregroundAtReceipt);
  }

  reportVisibleChatError(payload: Record<string, unknown> & { error?: unknown }): void {
    if (this.disposed) return;
    reportVisibleChatErrorSink(this.platform, { ...payload, providerBusinessRecoveryAction: resolveBusinessRecoveryAction(payload.error) });
  }

  getPendingCommandCountForTest(): number {
    return this.pendingFactsByCommandId.size;
  }

  async flushReportsForTest(): Promise<void> {
    await this.reportTail;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    for (const lifecycle of this.lifecyclesByCommandId.values()) {
      clearConversationWaitState(lifecycle.taskKey);
      purgeConversationTiming(lifecycle.taskKey);
    }
    this.eventIds.clear();
    this.acceptedCommandIds.clear();
    this.terminalKeys.clear();
    this.compactionKeys.clear();
    this.foregroundSubagentUsageByChildSession.clear();
    this.deferredTerminalsByCommandId.clear();
    this.foregroundOwnerSessions.clear();
    this.foregroundSessionCounts.clear();
    this.lifecyclesByCommandId.clear();
    this.activeCommandBySessionId.clear();
    this.commandIdByTurnKey.clear();
    this.pendingFactsByCommandId.clear();
  }

  private enqueueReport(report: TelemetryReport): void {
    const send = () => reportTelemetry(this.platform, report, "v4-conversation-telemetry");
    const chained = this.reportTail ? this.reportTail.then(send) : send();
    this.reportTail = chained;
    chained.then(() => {
      if (this.reportTail === chained) this.reportTail = null;
    });
  }

  private taskKey(sessionId: string): string {
    return `${this.workspaceScopeKey}\u0000${sessionId}`;
  }

  private isForeground(sessionId: string): boolean {
    return (this.foregroundSessionCounts.get(sessionId) ?? 0) > 0;
  }

  private detachForeground(paneKey: string): void {
    const owner = this.foregroundOwnerSessions.get(paneKey);
    if (!owner) return;
    this.foregroundOwnerSessions.delete(paneKey);
    this.decrementForeground(owner);
  }

  private decrementForeground(sessionId: string): void {
    const remaining = (this.foregroundSessionCounts.get(sessionId) ?? 1) - 1;
    if (remaining > 0) {
      this.foregroundSessionCounts.set(sessionId, remaining);
      return;
    }
    this.foregroundSessionCounts.delete(sessionId);
    clearConversationWaitState(this.taskKey(sessionId));
  }

  private resolveCommandId(fact: AgentFact): string | undefined {
    if (fact.sourceCommandId) return fact.sourceCommandId;
    if (fact.turnId) return this.commandIdByTurnKey.get(`${fact.sessionId}\u0000${fact.turnId}`);
    return this.activeCommandBySessionId.get(fact.sessionId);
  }

  private bufferFact(commandId: string, entry: { fact: AgentFact; receivedAt: number; foregroundAtReceipt: boolean }): void {
    const pending = this.pendingFactsByCommandId.get(commandId) ?? [];
    pending.push(entry);
    if (pending.length > MAX_PENDING_FACTS_PER_COMMAND) {
      const dropIndex = pending.findIndex((item) => item.fact.kind === "stream.chunk" && !item.fact.firstChunk);
      const fallbackIndex = dropIndex >= 0 ? dropIndex : pending.findIndex((item) => item.fact.kind !== "turn.started");
      pending.splice(fallbackIndex >= 0 ? fallbackIndex : 0, 1);
    }
    this.pendingFactsByCommandId.delete(commandId);
    this.pendingFactsByCommandId.set(commandId, pending);
    if (this.pendingFactsByCommandId.size > MAX_PENDING_FACT_COMMANDS) {
      const oldest = this.pendingFactsByCommandId.keys().next().value;
      if (typeof oldest === "string") this.pendingFactsByCommandId.delete(oldest);
    }
  }

  private drainPendingFacts(commandId: string): void {
    const lifecycle = this.lifecyclesByCommandId.get(commandId);
    const pending = this.pendingFactsByCommandId.get(commandId);
    if (!lifecycle || !pending || pending.length === 0) return;
    this.pendingFactsByCommandId.delete(commandId);
    for (const entry of pending) {
      if (!this.lifecyclesByCommandId.has(commandId)) return;
      if (entry.fact.kind === "turn.started" && this.hasDeferredTerminalForTask(lifecycle.taskKey, lifecycle.sourceCommandId)) {
        this.bufferFact(commandId, entry);
        continue;
      }
      if (!lifecycle.active && entry.fact.kind !== "turn.started") {
        this.bufferFact(commandId, entry);
        continue;
      }
      this.processPromptFact(lifecycle, entry.fact, entry.receivedAt, entry.foregroundAtReceipt);
    }
  }

  private hasDeferredTerminalForTask(taskKey: string, exceptCommandId?: string): boolean {
    return [...this.deferredTerminalsByCommandId].some(([commandId, deferred]) => commandId !== exceptCommandId && deferred.lifecycle.taskKey === taskKey);
  }

  private drainPromptBlockedByDeferredTerminal(taskKey: string): void {
    if (this.hasDeferredTerminalForTask(taskKey)) return;
    const candidate = [...this.lifecyclesByCommandId.values()]
      .filter(
        (lifecycle) =>
          lifecycle.taskKey === taskKey &&
          !lifecycle.active &&
          this.pendingFactsByCommandId.get(lifecycle.sourceCommandId)?.some((entry) => entry.fact.kind === "turn.started"),
      )
      .sort((a, b) => a.sendTime - b.sendTime)[0];
    if (candidate) this.drainPendingFacts(candidate.sourceCommandId);
  }

  private processPromptFact(lifecycle: PromptLifecycle, fact: AgentFact, receivedAt: number, foreground: boolean): void {
    switch (fact.kind) {
      case "turn.started":
        lifecycle.active = true;
        lifecycle.turnId = fact.turnId as string | undefined;
        this.activeCommandBySessionId.set(fact.sessionId, lifecycle.sourceCommandId);
        if (fact.turnId) this.commandIdByTurnKey.set(`${fact.sessionId}\u0000${fact.turnId}`, lifecycle.sourceCommandId);
        recordTurnStarted(lifecycle.taskKey, lifecycle.sourceCommandId);
        return;
      case "model.request.status": {
        const status = buildNetworkDebugStatus(fact);
        recordModelRequestStatus(lifecycle.taskKey, status, lifecycle.sourceCommandId);
        if (fact.status === "model_request_failed") lifecycle.lastErrorMessage = fact.reason as string | undefined;
        return;
      }
      case "stream.chunk": {
        lifecycle.legacyFirstTokenObserved = true;
        if (foreground && lifecycle.foregroundFirstTokenAt === null) lifecycle.foregroundFirstTokenAt = receivedAt;
        const event: Record<string, unknown> = {
          type: fact.channel === "thought" ? "agent_thought_chunk" : "agent_message_chunk",
          taskId: fact.sessionId,
          traceId: fact.eventId,
          inputId: lifecycle.sourceCommandId,
          content: "",
          ...(fact.channel === "text" && fact.assistantMessageId ? { messageId: fact.assistantMessageId } : {}),
          ...(fact.parentToolCallId ? { parentToolUseId: fact.parentToolCallId } : {}),
        };
        this.reportFinalizedSteps(
          lifecycle,
          finalizeConversationSteps({ taskId: lifecycle.taskKey, event, activeInputId: lifecycle.sourceCommandId, clientMode: "desktop-continuous", now: receivedAt }),
        );
        if (foreground) {
          recordStreamChunkForeground(lifecycle.taskKey, {
            now: receivedAt,
            talkId: fact.sessionId,
            waitingTool: false,
            model: currentConversationModel(lifecycle.taskKey),
            messageId: fact.assistantMessageId,
            chunkType: fact.channel === "thought" ? "thought" : "message",
          });
        }
        return;
      }
      case "tool.lifecycle":
        this.handleToolLifecycle(lifecycle, fact, receivedAt, foreground);
        return;
      case "permission.lifecycle": {
        const requestId = (fact.requestId ?? fact.toolCallId) as string | undefined;
        if (fact.phase === "requested") recordPermissionRequested({ taskId: lifecycle.taskKey, requestId, toolCallId: fact.toolCallId as string | undefined, now: receivedAt });
        else recordPermissionResolved({ taskId: lifecycle.taskKey, requestId, now: receivedAt });
        return;
      }
      case "usage.delta":
        recordUsageDelta({
          taskId: lifecycle.taskKey,
          eventKey: fact.eventId,
          usage: extractUsageDelta(fact),
          requestId: fact.requestId as string | undefined,
          modelName: resolveModelName(fact.providerId as string | undefined, fact.modelId as string | undefined),
          modelProvider: fact.providerId as string | undefined,
          providerName: fact.providerHostname as string | undefined,
        });
        return;
      case "turn.terminal":
        this.handleTerminal(lifecycle, fact, receivedAt, foreground);
        return;
      case "compaction.terminal":
        return;
    }
  }

  private handleToolLifecycle(lifecycle: PromptLifecycle, fact: AgentFact, receivedAt: number, foreground: boolean): void {
    lifecycle.legacyFirstTokenObserved = true;
    if (foreground && lifecycle.foregroundFirstTokenAt === null) lifecycle.foregroundFirstTokenAt = receivedAt;
    clearConversationWaitState(lifecycle.taskKey);
    const subagentUsage = fact.childSessionId === undefined ? undefined : this.foregroundSubagentUsageByChildSession.get(fact.childSessionId as string);
    const agentId = (fact.agentId as string | undefined) ?? subagentUsage?.agentId;
    const toolAttribution =
      agentId || subagentUsage
        ? {
            ...(agentId ? { agentId } : {}),
            ...(subagentUsage?.modelName ? { modelName: subagentUsage.modelName } : {}),
            ...(subagentUsage?.modelProvider ? { modelProvider: subagentUsage.modelProvider } : {}),
            ...(subagentUsage?.providerName ? { providerName: subagentUsage.providerName } : {}),
          }
        : undefined;
    const alreadyStarted = lifecycle.startedToolCallIds.has(fact.toolCallId as string);
    let event: Record<string, unknown>;
    if (!alreadyStarted && fact.phase !== "completed" && fact.phase !== "failed") {
      lifecycle.startedToolCallIds.add(fact.toolCallId as string);
      event = {
        type: "tool_call",
        taskId: fact.sessionId,
        traceId: fact.eventId,
        inputId: lifecycle.sourceCommandId,
        toolId: fact.toolCallId,
        parentToolUseId: fact.parentToolCallId,
        input: {},
        toolName: fact.toolName,
        kind: fact.toolName ?? "",
        title: "",
        raw: {},
      };
    } else {
      lifecycle.startedToolCallIds.add(fact.toolCallId as string);
      event = {
        type: "tool_call_update",
        taskId: fact.sessionId,
        traceId: fact.eventId,
        inputId: lifecycle.sourceCommandId,
        toolId: fact.toolCallId,
        parentToolUseId: fact.parentToolCallId,
        status: fact.phase === "completed" ? "completed" : fact.phase === "failed" ? "failed" : "in_progress",
        toolName: fact.toolName,
        kind: fact.toolName,
        error: fact.errorMessage,
        raw: {},
      };
    }
    const steps = finalizeConversationSteps({
      taskId: lifecycle.taskKey,
      event,
      activeInputId: lifecycle.sourceCommandId,
      clientMode: "desktop-continuous",
      ...(toolAttribution ? { toolAttribution } : {}),
      now: receivedAt,
    });
    const automationDetail = fact.automationId ? { automation_id: fact.automationId as string } : undefined;
    const terminal = fact.phase === "completed" || fact.phase === "failed";
    const owningSubagent = terminal
      ? [...this.foregroundSubagentUsageByChildSession.values()].find(
          (usage) => usage.parentCommandId === lifecycle.sourceCommandId && usage.parentToolCallId === fact.toolCallId,
        )
      : undefined;
    if (owningSubagent && !owningSubagent.stopped) {
      const timedOut = isToolTimeoutFact(fact);
      const immediate: Array<{ eventExtraDetail: Record<string, string> }> = [];
      for (const step of steps) {
        if (step.eventExtraDetail.tool_call_id === fact.toolCallId) {
          if (timedOut) {
            this.applyForegroundSubagentAttribution(step, owningSubagent);
            immediate.push(step);
          } else {
            owningSubagent.pendingFinalizedSteps.push({ step, extraDetail: automationDetail });
          }
        } else {
          immediate.push(step);
        }
      }
      this.reportFinalizedSteps(lifecycle, immediate, automationDetail);
      if (timedOut) {
        owningSubagent.stopped = true;
        this.flushDeferredTerminal(owningSubagent.parentCommandId);
      }
    } else {
      this.reportFinalizedSteps(lifecycle, steps, automationDetail);
    }
    if (fact.errorMessage) lifecycle.lastErrorMessage = fact.errorMessage as string;
    const performance = fact.performance as Record<string, unknown> | undefined;
    if (!foreground || !terminal || !performance || Object.keys(performance).length === 0) return;
    recordToolPerformance({
      toolName: fact.toolName,
      status: fact.phase === "completed" ? "completed" : "failed",
      talkId: fact.sessionId,
      messageId: lastReportedMessageId(lifecycle.taskKey),
      toolCallId: fact.toolCallId,
      parentToolCallId: fact.parentToolCallId,
      childSessionId: fact.childSessionId,
      childToolCallId: fact.childToolCallId,
      agentId: fact.agentId,
      agentType: fact.agentType,
      totalMs: performance.totalMs ?? fact.durationMs,
      permissionWaitMs: performance.permissionWaitMs,
      commandRunMs: performance.commandRunMs,
      firstOutputMs: performance.firstOutputMs,
      noOutputMs: performance.noOutputMs,
      exitCode: performance.exitCode,
      timedOut: performance.timedOut,
      outputBytes: performance.outputBytes,
      commandCategory: performance.commandCategory,
      commandName: performance.commandName,
      commandCount: performance.commandCount,
      commandStatus: performance.commandStatus,
      fsReadMs: performance.fsReadMs,
      fsWriteMs: performance.fsWriteMs,
      patchMatchMs: performance.patchMatchMs,
      fileCount: performance.fileCount,
      totalBytes: performance.totalBytes,
      maxFileBytes: performance.maxFileBytes,
      hunkCount: performance.hunkCount,
      matchAttempts: performance.matchAttempts,
      workspaceKind: performance.workspaceKind,
    });
  }

  private handleTerminal(lifecycle: PromptLifecycle, fact: AgentFact, receivedAt: number, foreground: boolean): void {
    if ([...this.foregroundSubagentUsageByChildSession.values()].some((usage) => usage.parentCommandId === lifecycle.sourceCommandId && !usage.stopped)) {
      if (this.deferredTerminalsByCommandId.has(lifecycle.sourceCommandId)) return;
      this.deferredTerminalsByCommandId.set(lifecycle.sourceCommandId, { lifecycle, fact, receivedAt, foregroundAtReceipt: foreground });
      return;
    }
    const terminalKey = `${fact.sessionId}\u0000${lifecycle.sourceCommandId}\u0000message_completion`;
    if (!this.terminalKeys.remember(terminalKey)) return;
    const status = mapTerminalStatus(fact.status as string);
    const terminalEvent: Record<string, unknown> =
      fact.status === "success" || fact.resultType !== undefined
        ? { type: "task_complete", taskId: fact.sessionId, traceId: fact.eventId, inputId: lifecycle.sourceCommandId, stopReason: fact.resultType ?? "complete" }
        : {
            type: "task_error",
            taskId: fact.sessionId,
            traceId: fact.eventId,
            inputId: lifecycle.sourceCommandId,
            error: (fact.errorMessage as string | undefined) ?? lifecycle.lastErrorMessage ?? (fact.errorCode as string | undefined) ?? "",
            code: fact.errorCode,
          };
    this.reportFinalizedSteps(
      lifecycle,
      finalizeConversationSteps({ taskId: lifecycle.taskKey, event: terminalEvent, activeInputId: lifecycle.sourceCommandId, clientMode: "desktop-continuous", now: receivedAt }),
    );
    const completion = buildMessageCompletionDetail({
      taskId: lifecycle.taskKey,
      status,
      finishedAt: receivedAt,
      errorType: fact.errorCode as string | undefined,
      errorMsg: (fact.errorMessage as string | undefined) ?? lifecycle.lastErrorMessage,
    });
    if (!completion) return;
    this.enqueueReport({
      elementName: "message_completion",
      eventRegion: "app",
      eventType: "agent_trace",
      eventExtraDetail: completion.eventExtraDetail,
      talkId: fact.sessionId,
      messageId: lifecycle.sourceCommandId,
    });
    if (foreground) {
      this.reportCompletionArms(
        fact.sessionId,
        lifecycle.sourceCommandId,
        completion.eventExtraDetail,
        lifecycle.foregroundFirstTokenAt === null ? (lifecycle.legacyFirstTokenObserved ? undefined : -1) : lifecycle.foregroundFirstTokenAt - lifecycle.sendTime,
      );
    }
    clearConversationWaitState(lifecycle.taskKey);
    this.deferredTerminalsByCommandId.delete(lifecycle.sourceCommandId);
    this.activeCommandBySessionId.delete(fact.sessionId);
    this.lifecyclesByCommandId.delete(lifecycle.sourceCommandId);
    if (lifecycle.turnId) this.commandIdByTurnKey.delete(`${fact.sessionId}\u0000${lifecycle.turnId}`);
    for (const [childSessionId, usage] of this.foregroundSubagentUsageByChildSession) {
      if (usage.parentCommandId === lifecycle.sourceCommandId) this.foregroundSubagentUsageByChildSession.delete(childSessionId);
    }
    this.drainPromptBlockedByDeferredTerminal(lifecycle.taskKey);
  }

  private reportCompletionArms(sessionId: string, sourceCommandId: string, detail: Record<string, string>, ttftMs: number | undefined): void {
    if (ttftMs !== undefined) {
      recordTtft({ ttftMs, model: detail.model_name || undefined, talkId: sessionId, messageId: sourceCommandId });
      recordProviderTtft(this.platform, { providerId: detail.model_provider, modelName: detail.model_name, askMode: detail.ask_mode, ttftMs });
    }
    const durationMs = finiteNumber(detail.duration_ms);
    if (durationMs === undefined) return;
    recordDuration({ durationMs, result: detail.status ?? "", model: detail.model_name || undefined, talkId: sessionId, messageId: sourceCommandId });
    recordConversationResult({
      durationMs,
      result: detail.status ?? "",
      model: detail.model_name || undefined,
      talkId: sessionId,
      messageId: sourceCommandId,
      ttftMs,
      waitingMs: finiteNumber(detail.waiting_ms),
      toolCallTotal: finiteNumber(detail.tool_call_total),
      toolCallFailed: finiteNumber(detail.tool_call_failed),
      agentStepCount: finiteNumber(detail.agent_step_cnt),
      retryCount: finiteNumber(detail.retry_cnt),
      fileChangeCount: finiteNumber(detail.file_change_cnt),
      generatedCodeLines: finiteNumber(detail.generated_code_lines),
    });
  }

  private reportFinalizedSteps(lifecycle: PromptLifecycle, steps: Array<{ eventExtraDetail: Record<string, string> }>, extraDetail?: Record<string, string>): void {
    for (const step of steps) {
      this.enqueueReport({
        elementName: "agent_step",
        eventRegion: "app",
        eventType: "agent_trace",
        eventExtraDetail: { ...lifecycle.stepSourceDetail, ...step.eventExtraDetail, ...extraDetail },
        talkId: lifecycle.sessionId,
        messageId: lifecycle.sourceCommandId,
      });
    }
  }

  private handleCompaction(fact: AgentFact, foreground: boolean): void {
    const compactionKey = `${fact.sessionId}\u0000${fact.operationId}\u0000context_compaction`;
    if (!this.compactionKeys.remember(compactionKey) || !foreground) return;
    const detail = buildCompactionDetail({
      timeline: {
        version: 1,
        kind: "synthetic",
        type: "context_compaction",
        operationId: fact.operationId,
        status: fact.status,
        trigger: fact.trigger,
        display: "separator",
        reason: fact.reason,
        summaryMessageId: fact.summaryMessageId,
        preCompactTokenCount: fact.preCompactTokenCount,
        postCompactTokenCount: fact.postCompactTokenCount,
        truePostCompactTokenCount: fact.truePostCompactTokenCount,
        attempt: fact.attempt,
        maxAttempts: fact.maxAttempts,
        startedAt: fact.startedAt,
        endedAt: fact.endedAt,
      },
      modelName: resolveCompactionModelName({ configProvider: fact.modelProvider as string | undefined, modelName: fact.modelName as string | undefined }),
      modelProvider: fact.modelProvider as string | undefined,
    });
    if (!detail) return;
    this.enqueueReport({
      elementName: "context_compaction",
      eventRegion: "app",
      eventType: "agent_trace",
      eventExtraDetail: detail,
      talkId: fact.sessionId,
      messageId: (fact.summaryMessageId as string | undefined) ?? (fact.operationId as string | undefined),
    });
  }
}

/* ============================================================================
 * G. 命令队列运行时（原 32246–36438）
 * ----------------------------------------------------------------------------
 * chat.queue/steer 的底层：
 *  G.1 任务未读通知去重（ux/dx）
 *  G.2 v4 会话协议 zod schema（队列项 qOe：steer/dispatch/admittedAt/provenance）
 *  G.3 会话命令 schema 表（Yke：sendText/stop/queue 操作/交互解决/模型切换…）
 *  G.4 FrameAssembler（bS：流帧分片装配，15 种故障码）
 *  G.5 SessionIndexStore（XAe：v4-sessions-index 订阅/恢复状态机）
 *  G.6 WorkspaceSubscriptionSet（QAe）+ store 池（VS/HS/BS）
 * zod 本体在 src-HCld2afU.js（K 导出）；此处以 TS 类型 + 声明常量表达 schema。
 * ==========================================================================*/

/* --- G.1 任务未读通知去重（原 ux/dx，js 32262–32306） --- */

const UNREAD_NOTIFY_DEDUPE_MS = 500; // 原 cx
const UNREAD_NOTIFY_DEDUPE_MAX = 256; // 原 uOe
const unreadNotifyDedupe = new Map<string, number>(); // 原 lx
const unreadNotifyListeners = new Set<() => void>(); // 原 ox
let unreadNotifyVersion = 0; // 原 ax

export function subscribeUnreadNotifications(listener: () => void): () => void {
  unreadNotifyListeners.add(listener);
  return () => {
    unreadNotifyListeners.delete(listener);
  };
}

export function getUnreadNotificationVersion(): number {
  return unreadNotifyVersion;
}

/** 原 ux：同一任务同状态 500ms 内只通知一次（去重表上限 256） */
export function notifyTaskUnreadChange(args: {
  workspacePath: string;
  workspaceIdentity?: string | null;
  taskId: string;
  reason: string;
  taskMeta?: { updatedAt?: number; unreadAt?: number | null } | null;
}): void {
  if (!args.taskMeta || !args.taskId) {
    unreadNotifyVersion += 1;
    for (const listener of unreadNotifyListeners) listener();
    return;
  }
  const key = [args.workspaceIdentity?.trim() || args.workspacePath, args.taskId, args.reason, args.taskMeta.updatedAt, args.taskMeta.unreadAt ?? ""].join("::");
  const now = Date.now();
  const last = unreadNotifyDedupe.get(key);
  if (last !== undefined && now - last < UNREAD_NOTIFY_DEDUPE_MS) return;
  for (const [dedupeKey, at] of unreadNotifyDedupe) if (now - at >= UNREAD_NOTIFY_DEDUPE_MS) unreadNotifyDedupe.delete(dedupeKey);
  if (unreadNotifyDedupe.size < UNREAD_NOTIFY_DEDUPE_MAX) unreadNotifyDedupe.set(key, now);
  unreadNotifyVersion += 1;
  for (const listener of unreadNotifyListeners) listener();
}

/** 原 dx：useSyncExternalStore 版订阅钩子 */
export function useUnreadNotificationVersion(): number {
  return React.useSyncExternalStore(subscribeUnreadNotifications, getUnreadNotificationVersion);
}

/* --- G.2 v4 会话协议 schema（原 32876–33178 区） --- */

/** 原 WOe：投递请求/准入 */
export interface QueueDelivery {
  requested: "auto" | "startNow" | "queue" | "guide";
  admitted: "startNow" | "queue" | "guide";
  fallbackReasonCode?: string;
}

/** 原 GOe：准入序号与队列位置 */
export interface QueueOrder {
  admissionSeq: number;
  queuePosition?: number;
}

/** 原 KOe：steer（转向）状态机 */
export interface QueueSteer {
  state: "notRequested" | "submitting" | "steering" | "guided" | "fellBack";
  reasonCode?: string;
}

/** 原 Nx：dispatch（派发）状态机 */
export interface QueueDispatch {
  state: "admitted" | "queued" | "reserved" | "promoting" | "drained";
  reservationId?: string;
}

/** 原 Mx：附件引用 */
export interface QueueAttachmentRef {
  ref: string;
  fileName: string;
  mime: string;
  bytes: number;
  previewRef?: string;
}

/** 原 qOe：队列项（命令队列的核心契约） */
export interface QueueItem {
  sourceCommandId: string;
  queueItemId: string;
  clientId: string;
  kind: "sendText" | "sendGoalCommand" | "compact";
  text: string;
  attachments: QueueAttachmentRef[];
  delivery: QueueDelivery;
  order: QueueOrder;
  steer: QueueSteer;
  dispatch: QueueDispatch;
  admittedAt: number;
  provenance?: { sourceCommandId: string; queueItemId?: string; clientId?: string };
  toolDisallowlist?: string[];
}

/** 原 Px：会话阶段 */
export type SessionPhase = "draft" | "prewarming" | "running" | "completedSuccess" | "completedInterrupted" | "error";

/** 原 Fx：控制面 */
export interface SessionControl {
  phase: SessionPhase;
  sessionEnded: boolean;
  canStop: boolean;
  stopState: "idle" | "stoppable" | "stopping";
  stopTargetKind: "assistant" | "tool" | "subagent" | "compact" | "goalVerifier" | "goalContinuation" | "turnSteer" | "mixed" | "unknown";
  activeWorks: Array<{ kind: string; foregroundExecutionId?: string; startedAt: number }>;
  lastError: { code: string; message: string; recoverable: boolean; at: number; source: string; traceId?: string; detail?: string; attribution?: Record<string, unknown> } | null;
  apiRetry: { attempt: number; maxAttempts: number; nextRetryAt: number; reasonCode: string } | null;
}

/** 原 Lx：可用性位（各操作允许/禁止+原因码） */
export type AvailabilityFlag = { allowed: true } | { allowed: false; reasonCode: string };
export interface SessionAvailability {
  fork: AvailabilityFlag;
  compact: AvailabilityFlag;
  switchModelConfig: AvailabilityFlag;
  setFollowupMode: AvailabilityFlag;
  queueEdit: AvailabilityFlag;
  sendQueuedNow: AvailabilityFlag;
  pauseGoal: AvailabilityFlag;
  resumeGoal: AvailabilityFlag;
}

/** 原 Rx：输入路由 */
export interface InputRouting {
  mode: "startNow" | "enqueue" | "guide" | "reject" | "choice";
  reasonCode?: string;
}

/** 原 Ux：队列整体 */
export interface SessionQueue {
  items: QueueItem[];
  autoDrain: boolean;
  pauseReason?: "stopped" | "manual";
}

/** 原 Gx：待决交互（权限/用户输入） */
export interface PendingInteraction {
  interactionId: string;
  kind: "permission" | "userInput";
  anchorRowId: number | null;
  createdAt: number;
  autoResolution?:
    | { state: "hiddenGrace" | "visibleCountdown"; startedAt: number; visibleAt: number; deadlineAt: number }
    | { state: "snoozed"; startedAt: number; snoozedAt: number };
  payload:
    | { kind: "permission"; toolCallId: string; toolName: string; summary: string; detail: unknown; options: Array<{ optionId: string; label: string; kind: string; response?: unknown }> }
    | { kind: "userInput"; prompt: string; freeText: boolean; [key: string]: unknown };
}

/** 原 Kx：待决命令 */
export interface PendingCommand {
  commandId: string;
  clientId: string;
  type: string;
  state: "accepted" | "executing";
  at: number;
}

/** 原 qx：后台工作 */
export interface BackgroundWork {
  workId: string;
  kind: "bash" | "subagent";
  title: string;
  status: "running" | "resultPending" | "failed" | "cancelled";
  startedAt: number;
  endedAt?: number;
  cancellable?: boolean;
  blocked?: boolean;
  anchorRowId: number | null;
  childSessionId?: string;
}

/** 原 oke：会话快照（protocolVersion=1） */
export interface SessionSnapshot {
  protocolVersion: 1;
  sessionId: string;
  logEpoch: string;
  seq: number;
  revision: number;
  control: SessionControl;
  availability: SessionAvailability;
  inputRouting: InputRouting;
  meta: { title: string; titleSource: "default" | "generated" | "custom" };
  config: { provider: string; model: string; thought: string; thoughtLevels: string[]; followupMode: "queue" | "guide"; mode: string };
  modelTransition: { eventId: string; origin: "registryFallback"; from: { provider: string; model: string }; to: { provider: string; model: string } } | null;
  usage: {
    contextWindow: { usedTokens: number; maxTokens: number; autoCompactThresholdTokens: number | null; cache?: unknown; breakdown?: unknown } | null;
    cumulative: { inputTokens: number; outputTokens: number; cacheReadTokens: number; cacheWriteTokens: number };
  };
  queue: SessionQueue;
  pendingInteractions: PendingInteraction[];
  pendingCommands: PendingCommand[];
  backgroundWorks: BackgroundWork[];
  subagents?: { revision: number; childSessionIds: string[]; running: Array<Record<string, unknown>>; endedTotal: number };
  goal: Record<string, unknown> | null;
  plan: { items: Array<{ id: string; content: string; status: string }>; updatedAt: number } | null;
  rows: { window: unknown[]; totalCount: number; firstRowId: number | null };
}

/** 原 ske：状态补丁（快照各字段可选） */
export type SessionStatePatch = Partial<Omit<SessionSnapshot, "protocolVersion" | "sessionId" | "logEpoch" | "seq" | "revision" | "rows">> & { revision?: number };

/** 原 cke：行级增量操作 */
export type SessionRowOp =
  | { op: "row.appended"; row: unknown }
  | { op: "row.upserted"; row: unknown }
  | { op: "row.removed"; fromRowId: number }
  | { op: "row.delta"; rowId: number; path: unknown; append: string }
  | { op: "state.updated"; patch: SessionStatePatch };

/** zod schema 常量（原 ji/K/Jr/Oi/Fi/Li/_t/_i/Yn/Ar/$r 组合；本体在 src chunk） */
declare const QueueItemSchema: { parse(input: unknown): QueueItem; safeParse(input: unknown): { success: boolean; data?: QueueItem } }; // 原 qOe
declare const SessionSnapshotSchema: { parse(input: unknown): SessionSnapshot }; // 原 oke
declare const SessionRowOpSchema: { parse(input: unknown): SessionRowOp }; // 原 cke

/** 原 lke：行增量应用（row.delta 按行类型分派 text/inputText/output.text/summaryText） */
export declare function applyRowDelta(row: Record<string, unknown>, path: string, append: string): Record<string, unknown>;

/* --- G.3 会话命令 schema 表（原 Yke，js 34188–34320 区） --- */

/**
 * 会话传输命令词汇（zod 校验后送入 transport.sendCommand）：
 *  createSession / createSelectionSideSession / sendText / sendGoalCommand / stop /
 *  compact / forkAssistant / applyFileRewind / editUserQuery / retryTurn /
 *  setAssistantFeedback / sendQueuedNow / editQueueItem / reorderQueueItem /
 *  deleteQueueItem / setAutoDrain / resolveInteraction /
 *  snoozeInteractionAutoResolution / switchModelConfig / switchCollaborationMode /
 *  setFollowupMode / pauseGoal / resumeGoal
 * 约束（原 superRefine）：sendText 的 automationId 与 offPeakTaskId 互斥；
 * offPeakRunType 必须伴随 offPeakTaskId。
 */
export interface SessionCommandMap {
  createSession: { workspaceId: string; firstInput?: { text: string; attachments?: QueueAttachmentRef[] }; config?: Record<string, unknown> };
  createSelectionSideSession: Record<string, never>;
  sendText: {
    text: string;
    attachments?: QueueAttachmentRef[];
    heldQueueDisposition?: "clearQueueAndSend" | "keepQueueAndSend";
    expectedHeldQueueItemIds?: string[];
    automationId?: string;
    offPeakTaskId?: string;
    offPeakRunType?: "init" | "resume";
    toolDisallowlist?: string[];
    [key: string]: unknown;
  };
  sendGoalCommand: { text: string; displayText?: string; heldQueueDisposition?: string; expectedHeldQueueItemIds?: string[] };
  stop: { expectedForegroundExecutionId?: string };
  compact: Record<string, never>;
  sendQueuedNow: { queueItemId: string };
  editQueueItem: { queueItemId: string; newText: string };
  reorderQueueItem: { queueItemId: string; beforeQueueItemId: string | null };
  deleteQueueItem: { queueItemId: string };
  setAutoDrain: { autoDrain: boolean };
  resolveInteraction: { interactionId: string; answer: { optionId?: string; freeText?: string; action?: "accept" | "decline" | "cancel"; content?: unknown } };
  snoozeInteractionAutoResolution: { interactionId: string };
  switchModelConfig: { provider: string; model: string; thought: string };
  switchCollaborationMode: { mode: "build" | "edit" | "plan" | "yolo" };
  setFollowupMode: { mode: "queue" | "guide" };
  pauseGoal: Record<string, never>;
  resumeGoal: Record<string, never>;
  [command: string]: unknown;
}

declare const SessionCommandSchemas: { [K in keyof SessionCommandMap]?: { parse(input: unknown): SessionCommandMap[K] } }; // 原 Yke

/* --- G.4 FrameAssembler（原 bS，js 33842–34180） --- */

export type FrameDeliveryKind = "initial" | "online" | "recovery";

export interface LogicalFrame {
  logicalFrameId: string;
  logicalFrameOrdinal: number;
  topic: string;
  subscriptionId: string;
  deliveryKind?: string;
  kind?: "complete" | "fragment";
  frame?: unknown;
  fragmentCount?: number;
  fragmentIndex?: number;
  logicalBytes?: number;
  checksum?: { algorithm: string; value: string };
  dataBase64?: string;
  [key: string]: unknown;
}

export type FrameAssemblyEvent<T> = { kind: "complete"; frame: T; deliveryKind: FrameDeliveryKind | null } | { kind: "fault"; fault: FrameAssemblyFault };

export interface FrameAssemblyFault {
  deliveryKind?: FrameDeliveryKind;
  reasonCode:
    | "proto.frameAssemblyMetadataMismatch"
    | "proto.frameAssemblyOrdinalConflict"
    | "proto.frameAssemblySuperseded"
    | "proto.frameEnvelopeTooLarge"
    | "proto.frameAssemblyTooLarge"
    | "proto.frameFragmentCountExceeded"
    | "proto.frameAssemblyInvalidBase64"
    | "proto.frameAssemblyConcurrentLimit"
    | "proto.frameAssemblyBudgetExceeded"
    | "proto.frameAssemblyFragmentConflict"
    | "proto.frameAssemblyLengthMismatch"
    | "proto.frameAssemblyChecksumMismatch"
    | "proto.frameAssemblyInvalidUtf8"
    | "proto.frameAssemblyInvalidJson"
    | "proto.frameAssemblyInvalidPayload"
    | "proto.frameAssemblyTimedOut";
  logicalFrameId: string;
  logicalFrameOrdinal: number;
  topic: string;
  subscriptionId: string;
}

interface FrameAssembly {
  deliveryKind: FrameDeliveryKind | null;
  logicalFrameId: string;
  logicalFrameOrdinal: number;
  topic: string;
  subscriptionId: string;
  fragmentCount: number;
  logicalBytes: number;
  checksum: { algorithm: "crc32"; value: string };
  fragments: Array<Uint8Array | undefined>;
  receivedCount: number;
  decodedBytes: number;
  firstSeenAt: number;
}

/** 协议限额（原 bi：宿主可配） */
export declare const protocolLimits: {
  logicalFrameAssemblyMaxBytes: number;
  logicalFrameAssemblyMaxFragments: number;
  logicalFrameAssemblyMaxConcurrent: number;
  logicalFrameAssemblyMaxStagedBytes: number;
  logicalFrameAssemblyTimeoutMs: number;
  maxFrameBytes: number;
};

declare function resolveBudgetLimit(value: number | undefined, fallback: number, name: string): number; // 原 yS
declare function assemblyRouteKey(topic: string, subscriptionId: string): string; // 原 _S
declare function normalizeDeliveryKind(raw: unknown): FrameDeliveryKind | null; // 原 gS
declare function frameEnvelopeMaxBytes(frame: LogicalFrame): { maxBytes: number }; // 原 pS
declare function hasCompleteFrameShape(frame: LogicalFrame, requiredFields: Set<string>): boolean; // 原 hS + Uke
declare function hasFragmentFrameShape(frame: LogicalFrame): boolean; // 原 Kke
declare function frameMetadataMatches(payload: unknown, meta: { logicalFrameId: string; logicalFrameOrdinal: number }): boolean; // 原 vS
declare function decodeFrameBase64(base64: string | undefined): Uint8Array | null; // 原 Tte
declare function bytesEqual(a: Uint8Array, b: Uint8Array): boolean; // 原 qke
declare function crc32Hex(bytes: Uint8Array): string; // 原 Ane

/**
 * 原 bS：流帧装配器。按 (topic, subscriptionId) 路由聚合分片帧：
 * 序号单调 + 代际结算（settledByRoute）+ 预算（总量/分片数/并发/暂存字节/超时）
 * + crc32 校验 + utf-8/JSON/schema 三级解析。故障一律以 fault 事件返回。
 */
export class FrameAssembler<T> {
  private assemblies = new Map<string, FrameAssembly>();
  private settledByRoute = new Map<string, { logicalFrameId: string; logicalFrameOrdinal: number }>();
  private stagedDecodedBytes = 0;
  private maxAssemblyBytes: number;
  private maxFragments: number;
  private maxConcurrentAssemblies: number;
  private maxStagedDecodedBytes: number;
  private timeoutMs: number;
  private maxPhysicalFrameBytes: number;

  constructor(
    private frameSchema: { safeParse(input: unknown): { success: boolean; data?: T } },
    options: Partial<{ maxAssemblyBytes: number; maxFragments: number; maxConcurrentAssemblies: number; maxStagedDecodedBytes: number; timeoutMs: number; maxPhysicalFrameBytes: number }> = {},
  ) {
    this.maxAssemblyBytes = resolveBudgetLimit(options.maxAssemblyBytes, protocolLimits.logicalFrameAssemblyMaxBytes, "maxAssemblyBytes");
    this.maxFragments = resolveBudgetLimit(options.maxFragments, protocolLimits.logicalFrameAssemblyMaxFragments, "maxFragments");
    this.maxConcurrentAssemblies = resolveBudgetLimit(options.maxConcurrentAssemblies, protocolLimits.logicalFrameAssemblyMaxConcurrent, "maxConcurrentAssemblies");
    this.maxStagedDecodedBytes = resolveBudgetLimit(options.maxStagedDecodedBytes, protocolLimits.logicalFrameAssemblyMaxStagedBytes, "maxStagedDecodedBytes");
    this.timeoutMs = resolveBudgetLimit(options.timeoutMs, protocolLimits.logicalFrameAssemblyTimeoutMs, "timeoutMs");
    this.maxPhysicalFrameBytes = resolveBudgetLimit(options.maxPhysicalFrameBytes, protocolLimits.maxFrameBytes, "maxPhysicalFrameBytes");
  }

  accept(frame: LogicalFrame, now: number = Date.now()): Array<FrameAssemblyEvent<T>> {
    const events: Array<FrameAssemblyEvent<T>> = this.expire(now);
    const routeKey = assemblyRouteKey(frame.topic, frame.subscriptionId);
    if (!Number.isSafeInteger(frame.logicalFrameOrdinal) || frame.logicalFrameOrdinal < 1) {
      events.push(this.fault(frame, "proto.frameAssemblyMetadataMismatch"));
      return events;
    }
    const settled = this.settledByRoute.get(routeKey);
    if (settled) {
      if (frame.logicalFrameOrdinal < settled.logicalFrameOrdinal) return events;
      if (frame.logicalFrameOrdinal === settled.logicalFrameOrdinal) {
        if (frame.logicalFrameId !== settled.logicalFrameId) events.push(this.fault(frame, "proto.frameAssemblyOrdinalConflict"));
        return events;
      }
    }
    const deliveryKind = normalizeDeliveryKind(frame.deliveryKind);
    if (deliveryKind === "recovery") {
      for (let index = events.length - 1; index >= 0; --index) {
        const event = events[index];
        if (
          event?.kind === "fault" &&
          event.fault.topic === frame.topic &&
          event.fault.subscriptionId === frame.subscriptionId &&
          event.fault.logicalFrameOrdinal < frame.logicalFrameOrdinal
        ) {
          events.splice(index, 1);
        }
      }
    }
    const existing = this.assemblies.get(routeKey);
    if (existing) {
      if (frame.logicalFrameOrdinal < existing.logicalFrameOrdinal) return events;
      if (frame.logicalFrameOrdinal === existing.logicalFrameOrdinal) {
        if (frame.logicalFrameId !== existing.logicalFrameId) {
          this.release(routeKey, existing);
          this.settle(routeKey, existing);
          events.push(this.fault(frame, "proto.frameAssemblyOrdinalConflict"));
        }
        return events;
      }
      this.release(routeKey, existing);
      this.settle(routeKey, existing);
      if (deliveryKind !== "recovery") events.push(this.fault(existing, "proto.frameAssemblySuperseded"));
    }
    if (deliveryKind === null) {
      this.releaseAndSettle(routeKey, frame);
      events.push(this.fault(frame, "proto.frameAssemblyMetadataMismatch"));
      return events;
    }
    if (frame.kind === "complete") {
      if (!hasCompleteFrameShape(frame, COMPLETE_FRAME_REQUIRED_FIELDS) || !Object.prototype.hasOwnProperty.call(frame, "frame")) {
        this.releaseAndSettle(routeKey, frame);
        events.push(this.fault(frame, "proto.frameAssemblyMetadataMismatch"));
        return events;
      }
      if (frameEnvelopeMaxBytes(frame).maxBytes > this.maxPhysicalFrameBytes) {
        this.releaseAndSettle(routeKey, frame);
        events.push(this.fault(frame, "proto.frameEnvelopeTooLarge"));
        return events;
      }
      const assembly = this.assemblies.get(routeKey);
      if (assembly) {
        this.release(routeKey, assembly);
        this.settle(routeKey, assembly);
        events.push(this.fault(assembly, "proto.frameAssemblyMetadataMismatch"));
        return events;
      }
      if (new TextEncoder().encode(JSON.stringify(frame.frame)).byteLength > this.maxAssemblyBytes) {
        this.settle(routeKey, frame);
        events.push(this.fault(frame, "proto.frameAssemblyTooLarge"));
        return events;
      }
      if (!frameMetadataMatches(frame.frame, frame)) {
        this.settle(routeKey, frame);
        events.push(this.fault(frame, "proto.frameAssemblyMetadataMismatch"));
        return events;
      }
      const parsed = this.frameSchema.safeParse(frame.frame);
      if (parsed.success) {
        this.settle(routeKey, frame);
        events.push({ kind: "complete", frame: parsed.data as T, deliveryKind });
      } else {
        this.settle(routeKey, frame);
        events.push(this.fault(frame, "proto.frameAssemblyInvalidPayload"));
      }
      return events;
    }
    if (!hasFragmentFrameShape(frame)) {
      this.releaseAndSettle(routeKey, frame);
      events.push(this.fault(frame, "proto.frameAssemblyMetadataMismatch"));
      return events;
    }
    if (frameEnvelopeMaxBytes(frame).maxBytes > this.maxPhysicalFrameBytes) {
      this.releaseAndSettle(routeKey, frame);
      events.push(this.fault(frame, "proto.frameEnvelopeTooLarge"));
      return events;
    }
    if ((frame.fragmentCount ?? 0) > this.maxFragments) {
      this.releaseAndSettle(routeKey, frame);
      events.push(this.fault(frame, "proto.frameFragmentCountExceeded"));
      return events;
    }
    if ((frame.logicalBytes ?? 0) > this.maxAssemblyBytes) {
      this.releaseAndSettle(routeKey, frame);
      events.push(this.fault(frame, "proto.frameAssemblyTooLarge"));
      return events;
    }
    if (
      !Number.isInteger(frame.fragmentCount ?? NaN) ||
      (frame.fragmentCount ?? 0) < 1 ||
      !Number.isInteger(frame.fragmentIndex ?? NaN) ||
      (frame.fragmentIndex ?? 0) < 0 ||
      (frame.fragmentIndex ?? 0) >= (frame.fragmentCount ?? 0) ||
      !Number.isInteger(frame.logicalBytes ?? NaN) ||
      (frame.logicalBytes ?? 0) < 1 ||
      (frame.fragmentCount ?? 0) > (frame.logicalBytes ?? 0) ||
      frame.checksum?.algorithm !== "crc32" ||
      !/^[0-9a-f]{8}$/u.test(frame.checksum?.value ?? "")
    ) {
      this.releaseAndSettle(routeKey, frame);
      events.push(this.fault(frame, "proto.frameAssemblyMetadataMismatch"));
      return events;
    }
    const decoded = decodeFrameBase64(frame.dataBase64);
    if (!decoded) {
      this.releaseAndSettle(routeKey, frame);
      events.push(this.fault(frame, "proto.frameAssemblyInvalidBase64"));
      return events;
    }
    let assembly = this.assemblies.get(routeKey);
    if (assembly) {
      if (
        assembly.fragmentCount !== frame.fragmentCount ||
        assembly.deliveryKind !== deliveryKind ||
        assembly.logicalBytes !== frame.logicalBytes ||
        assembly.checksum.algorithm !== frame.checksum!.algorithm ||
        assembly.checksum.value !== frame.checksum!.value
      ) {
        this.release(routeKey, assembly);
        this.settle(routeKey, assembly);
        events.push(this.fault(frame, "proto.frameAssemblyMetadataMismatch"));
        return events;
      }
    } else {
      if (this.assemblies.size >= this.maxConcurrentAssemblies) {
        this.settle(routeKey, frame);
        events.push(this.fault(frame, "proto.frameAssemblyConcurrentLimit"));
        return events;
      }
      if (this.stagedDecodedBytes + decoded.byteLength > this.maxStagedDecodedBytes) {
        this.settle(routeKey, frame);
        events.push(this.fault(frame, "proto.frameAssemblyBudgetExceeded"));
        return events;
      }
      assembly = {
        deliveryKind,
        logicalFrameId: frame.logicalFrameId,
        logicalFrameOrdinal: frame.logicalFrameOrdinal,
        topic: frame.topic,
        subscriptionId: frame.subscriptionId,
        fragmentCount: frame.fragmentCount!,
        logicalBytes: frame.logicalBytes!,
        checksum: { algorithm: "crc32", value: frame.checksum!.value },
        fragments: Array.from({ length: frame.fragmentCount! }, () => undefined),
        receivedCount: 0,
        decodedBytes: 0,
        firstSeenAt: now,
      };
      this.assemblies.set(routeKey, assembly);
    }
    const duplicate = assembly.fragments[frame.fragmentIndex!];
    if (duplicate) {
      if (!bytesEqual(duplicate, decoded)) {
        this.release(routeKey, assembly);
        this.settle(routeKey, assembly);
        events.push(this.fault(frame, "proto.frameAssemblyFragmentConflict"));
      }
      return events;
    }
    if (this.stagedDecodedBytes + decoded.byteLength > this.maxStagedDecodedBytes) {
      this.release(routeKey, assembly);
      this.settle(routeKey, assembly);
      events.push(this.fault(frame, "proto.frameAssemblyBudgetExceeded"));
      return events;
    }
    if (assembly.decodedBytes + decoded.byteLength > assembly.logicalBytes) {
      this.release(routeKey, assembly);
      this.settle(routeKey, assembly);
      events.push(this.fault(frame, "proto.frameAssemblyLengthMismatch"));
      return events;
    }
    assembly.fragments[frame.fragmentIndex!] = decoded;
    assembly.receivedCount += 1;
    assembly.decodedBytes += decoded.byteLength;
    this.stagedDecodedBytes += decoded.byteLength;
    if (assembly.receivedCount !== assembly.fragmentCount) return events;
    this.release(routeKey, assembly);
    if (assembly.decodedBytes !== assembly.logicalBytes) {
      this.settle(routeKey, assembly);
      events.push(this.fault(assembly, "proto.frameAssemblyLengthMismatch"));
      return events;
    }
    const combined = new Uint8Array(assembly.decodedBytes);
    let offset = 0;
    for (const fragment of assembly.fragments) {
      if (!fragment) {
        this.settle(routeKey, assembly);
        events.push(this.fault(assembly, "proto.frameAssemblyLengthMismatch"));
        return events;
      }
      combined.set(fragment, offset);
      offset += fragment.byteLength;
    }
    if (crc32Hex(combined) !== assembly.checksum.value) {
      this.settle(routeKey, assembly);
      events.push(this.fault(assembly, "proto.frameAssemblyChecksumMismatch"));
      return events;
    }
    let json: string;
    try {
      json = new TextDecoder("utf-8", { fatal: true }).decode(combined);
    } catch {
      this.settle(routeKey, assembly);
      events.push(this.fault(assembly, "proto.frameAssemblyInvalidUtf8"));
      return events;
    }
    let payload: unknown;
    try {
      payload = JSON.parse(json);
    } catch {
      this.settle(routeKey, assembly);
      events.push(this.fault(assembly, "proto.frameAssemblyInvalidJson"));
      return events;
    }
    if (!frameMetadataMatches(payload, assembly)) {
      this.settle(routeKey, assembly);
      events.push(this.fault(assembly, "proto.frameAssemblyMetadataMismatch"));
      return events;
    }
    const parsed = this.frameSchema.safeParse(payload);
    if (parsed.success) {
      this.settle(routeKey, assembly);
      events.push({ kind: "complete", frame: parsed.data as T, deliveryKind: assembly.deliveryKind });
    } else {
      this.settle(routeKey, assembly);
      events.push(this.fault(assembly, "proto.frameAssemblyInvalidPayload"));
    }
    return events;
  }

  /** 超时装配清算（返回 TimedOut 故障） */
  expire(now: number = Date.now()): Array<FrameAssemblyEvent<T>> {
    const faults: Array<FrameAssemblyEvent<T>> = [];
    for (const [routeKey, assembly] of this.assemblies) {
      if (now - assembly.firstSeenAt < this.timeoutMs) continue;
      this.release(routeKey, assembly);
      this.settle(routeKey, assembly);
      faults.push(this.fault(assembly, "proto.frameAssemblyTimedOut"));
    }
    return faults;
  }

  discard(topic: string, subscriptionId: string): void {
    const routeKey = assemblyRouteKey(topic, subscriptionId);
    const assembly = this.assemblies.get(routeKey);
    if (assembly) this.release(routeKey, assembly);
    this.settledByRoute.delete(routeKey);
  }

  abort(topic: string, subscriptionId: string): void {
    const routeKey = assemblyRouteKey(topic, subscriptionId);
    const assembly = this.assemblies.get(routeKey);
    if (assembly) {
      this.release(routeKey, assembly);
      this.settle(routeKey, assembly);
    }
  }

  clear(): void {
    this.assemblies.clear();
    this.settledByRoute.clear();
    this.stagedDecodedBytes = 0;
  }

  getStats(): { assemblies: number; stagedDecodedBytes: number } {
    return { assemblies: this.assemblies.size, stagedDecodedBytes: this.stagedDecodedBytes };
  }

  get nextExpiryAt(): number | null {
    let earliest: number | null = null;
    for (const assembly of this.assemblies.values()) {
      const expiry = assembly.firstSeenAt + this.timeoutMs;
      if (earliest === null || expiry < earliest) earliest = expiry;
    }
    return earliest;
  }

  private release(routeKey: string, assembly: FrameAssembly): void {
    if (this.assemblies.get(routeKey) !== assembly) return;
    this.assemblies.delete(routeKey);
    this.stagedDecodedBytes -= assembly.decodedBytes;
  }

  private settle(routeKey: string, frame: { logicalFrameId: string; logicalFrameOrdinal: number }): void {
    const known = this.settledByRoute.get(routeKey);
    if (known && known.logicalFrameOrdinal > frame.logicalFrameOrdinal) return;
    this.settledByRoute.set(routeKey, { logicalFrameId: frame.logicalFrameId, logicalFrameOrdinal: frame.logicalFrameOrdinal });
  }

  private releaseAndSettle(routeKey: string, frame: LogicalFrame): void {
    const assembly = this.assemblies.get(routeKey);
    if (assembly && assembly.logicalFrameOrdinal === frame.logicalFrameOrdinal && assembly.logicalFrameId === frame.logicalFrameId) {
      this.release(routeKey, assembly);
    }
    this.settle(routeKey, frame);
  }

  private fault(source: LogicalFrame | FrameAssembly, reasonCode: FrameAssemblyFault["reasonCode"]): FrameAssemblyEvent<T> {
    const deliveryKind = normalizeDeliveryKind(source.deliveryKind);
    return {
      kind: "fault",
      fault: {
        ...(deliveryKind === null ? {} : { deliveryKind }),
        reasonCode,
        logicalFrameId: source.logicalFrameId,
        logicalFrameOrdinal: source.logicalFrameOrdinal,
        topic: source.topic,
        subscriptionId: source.subscriptionId,
      },
    };
  }
}

const COMPLETE_FRAME_REQUIRED_FIELDS = new Set(["logicalFrameId", "logicalFrameOrdinal", "topic", "subscriptionId", "deliveryKind", "kind"]); // 原 Uke

/* --- G.5 SessionIndexStore（原 XAe，js 34981–34960 区；v4-sessions-index） --- */

export interface SessionIndexEntry {
  sessionId: string;
  lastActivityAt: number;
  [key: string]: unknown;
}

export interface SessionIndexState {
  workspaceId: string | null;
  logEpoch: string | null;
  seq: number;
  sessions: Map<string, SessionIndexEntry>;
}

export type SessionIndexStatus = "idle" | "connecting" | "live" | "dormant" | "error";

export interface SessionIndexTransport {
  subscribe(args: { base?: { logEpoch: string; seq: number } }): Promise<{ ack: { subscriptionId: string; mode: "resume" | "snapshot"; logEpoch?: string } }>;
  unsubscribe(subscriptionId: string): Promise<void> | void;
  resync(args: { subscriptionId: string; base: { logEpoch: string; seq: number } | null; forceSnapshot?: boolean }): Promise<{ ack: { subscriptionId: string; mode: "resume" | "snapshot" } }>;
  activate(subscriptionId: string): void;
  onFrame(listener: (frame: { subscriptionId: string; fromSeq: number; toSeq: number; payload: { kind: "snapshot" | "deltas"; [key: string]: unknown } }, meta?: { deliveryKind?: string }) => void): () => void;
  onAssemblyFault(listener: (fault: { subscriptionId: string; deliveryKind?: string }) => void): () => void;
  onRuntimeRestart?(listener: () => void): () => void;
  onRuntimeLifecycle?(listener: (state: "available" | "unavailable") => void): () => void;
}

interface SessionIndexRecovery {
  subscriptionId: string;
  requestInFlight: boolean;
  ackReceived: boolean;
  validFrameSeen: boolean;
  upgradePending: boolean;
  ackMode: "resume" | "snapshot" | null;
  forceSnapshot: boolean;
  postRecoveryGapPending: boolean;
  frameDeadline: ReturnType<typeof setTimeout> | null;
}

declare const INITIAL_SESSION_INDEX_STATE: SessionIndexState; // 原 FS
declare function applyFrameToIndexState(state: SessionIndexState, frame: { payload: unknown; toSeq: number }): { state: SessionIndexState; gap: boolean }; // 原 YAe
declare function unsubscribeTransport(transport: SessionIndexTransport, subscriptionId: string): void; // 原 IS
declare function isDormantSubscribeError(error: unknown): boolean; // 原 JAe
declare function isTransientSubscribeError(error: unknown): boolean; // 原 qAe
declare const SUBSCRIBE_RETRY_BACKOFF_MS: number[]; // 原 KAe
declare const RUNTIME_RESTART_RESET_MS: number; // 原 GAe
declare const RUNTIME_RESTART_BASE_DELAY_MS: number; // 原 UAe
declare const RUNTIME_RESTART_MAX_DELAY_MS: number; // 原 WAe

/**
 * 原 XAe：会话索引订阅状态机。
 * 状态：idle/connecting/live/dormant/error；帧断档 → resync 恢复
 * （resume 优先，失败升级 forceSnapshot，再失败 fail-closed 为 error）；
 * 运行时重启 → 指数退避重连（突发计数 2^min(n-1,16)，封顶）。
 */
export class SessionIndexStore {
  private state: SessionIndexState = INITIAL_SESSION_INDEX_STATE;
  private listeners = new Set<() => void>();
  private cachedList: SessionIndexEntry[] | null = null;
  private transport: SessionIndexTransport | null = null;
  private frameUnsub: (() => void) | null = null;
  private faultUnsub: (() => void) | null = null;
  private restartUnsub: (() => void) | null = null;
  private lifecycleUnsub: (() => void) | null = null;
  private subscriptionId: string | null = null;
  private awaitingInitial: { subscriptionId: string; mode: string } | null = null;
  private subscriptionHasAppliedBase = false;
  private recovery: SessionIndexRecovery | null = null;
  private status: SessionIndexStatus = "idle";
  private generation = 0;
  private closed = false;
  private runtimeRestartReconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private runtimeRestartBurstCount = 0;
  private lastRuntimeRestartAt = 0;
  private subscribeRetryTimer: ReturnType<typeof setTimeout> | null = null;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getState = (): SessionIndexState => this.state;

  getStatus(): SessionIndexStatus {
    return this.status;
  }

  async connect(transport: SessionIndexTransport, options: { forceSnapshot?: boolean; initialOverflowRetry?: boolean; subscribeRetryAttempt?: number } = {}): Promise<void> {
    if (this.runtimeRestartReconnectTimer) {
      clearTimeout(this.runtimeRestartReconnectTimer);
      this.runtimeRestartReconnectTimer = null;
    }
    this.clearSubscribeRetry();
    this.closed = false;
    this.transport = transport;
    if (!this.frameUnsub) {
      this.frameUnsub = transport.onFrame((frame, meta) => this.handleFrame(frame, meta));
      this.faultUnsub = transport.onAssemblyFault((fault) => {
        if (fault.subscriptionId === this.subscriptionId) this.handleAssemblyFault(fault.subscriptionId, fault.deliveryKind);
      });
      if (transport.onRuntimeLifecycle) {
        this.lifecycleUnsub = transport.onRuntimeLifecycle((state) => {
          if (state === "available") this.handleRuntimeAvailable();
          else this.handleRuntimeUnavailable();
        });
      } else if (transport.onRuntimeRestart) {
        this.restartUnsub = transport.onRuntimeRestart(() => this.handleRuntimeRestart());
      }
    }
    const generation = ++this.generation;
    this.discardRecovery();
    this.status = "connecting";
    this.emit();
    const base = options.forceSnapshot || this.state.logEpoch === null ? undefined : { logEpoch: this.state.logEpoch, seq: this.state.seq };
    try {
      const result = await transport.subscribe(base ? { base } : {});
      if (generation !== this.generation || this.closed) {
        unsubscribeTransport(transport, result.ack.subscriptionId);
        return;
      }
      this.discardRecovery();
      this.subscriptionId = result.ack.subscriptionId;
      this.status = "live";
      this.subscriptionHasAppliedBase = !!(base && result.ack.mode === "resume" && result.ack.logEpoch === base.logEpoch);
      this.awaitingInitial = { subscriptionId: result.ack.subscriptionId, mode: result.ack.mode };
      transport.activate(result.ack.subscriptionId);
      this.emit();
    } catch (error) {
      if (generation !== this.generation || this.closed) return;
      this.awaitingInitial = null;
      this.subscriptionHasAppliedBase = false;
      if (isDormantSubscribeError(error)) {
        this.status = "dormant";
        this.emit();
        return;
      }
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("fault.subscription.initialFrameStagingOverflow") && !options.initialOverflowRetry) {
        await this.connect(transport, { forceSnapshot: true, initialOverflowRetry: true });
        return;
      }
      const attempt = options.subscribeRetryAttempt ?? 0;
      const backoff = SUBSCRIBE_RETRY_BACKOFF_MS[attempt];
      if (isTransientSubscribeError(error) && backoff !== undefined) {
        this.status = "connecting";
        logger.warn(`[v4-sessions-index] subscribe 瞬时失败，${backoff}ms 后重试: ${message}`);
        this.subscribeRetryTimer = setTimeout(() => {
          this.subscribeRetryTimer = null;
          if (this.closed || generation !== this.generation) return;
          void this.connect(transport, { ...(options.forceSnapshot ? { forceSnapshot: true } : {}), subscribeRetryAttempt: attempt + 1 });
        }, backoff);
        this.emit();
        return;
      }
      this.status = "error";
      logger.warn(`[v4-sessions-index] subscribe 失败: ${message}`);
      this.emit();
    }
  }

  async replaceTransport(transport: SessionIndexTransport): Promise<void> {
    if (!this.closed && this.transport === transport) return;
    const generation = ++this.generation;
    const detached = this.detachTransport();
    this.status = "connecting";
    this.emit();
    if (detached.transport && detached.subscriptionId) unsubscribeTransport(detached.transport, detached.subscriptionId);
    if (generation !== this.generation || this.closed) return;
    await this.connect(transport, { forceSnapshot: true });
  }

  private handleFrame(frame: { subscriptionId: string; fromSeq: number; toSeq: number; payload: { kind: string } }, meta?: { deliveryKind?: string }): void {
    if (this.closed || this.subscriptionId === null || frame.subscriptionId !== this.subscriptionId) return;
    const initial = this.awaitingInitial?.subscriptionId === frame.subscriptionId ? this.awaitingInitial : null;
    const deliveryKind = meta?.deliveryKind ?? "online";
    if ((initial || (deliveryKind === "recovery" && this.awaitingInitial)) && (deliveryKind === "initial" || deliveryKind === "recovery")) this.awaitingInitial = null;
    if (deliveryKind === "online" && this.recovery && frame.payload.kind === "snapshot") {
      if (this.applyFrame(frame)) return;
      this.subscriptionHasAppliedBase = true;
      return;
    }
    if (deliveryKind === "online" && this.recovery) {
      if (frame.toSeq > this.state.seq) this.recovery.postRecoveryGapPending ||= this.recovery.validFrameSeen;
      return;
    }
    if (frame.payload.kind === "deltas" && !this.subscriptionHasAppliedBase) {
      this.requestRecovery(deliveryKind === "recovery");
      return;
    }
    if (this.applyFrame(frame) && this.transport) {
      logger.warn(`[v4-sessions-index] 帧断档 fromSeq=${frame.fromSeq} local=${this.state.seq}，重订阅`);
      if (initial) this.connect(this.transport, { forceSnapshot: true });
      else this.requestRecovery(deliveryKind === "recovery");
      return;
    }
    this.subscriptionHasAppliedBase = true;
    if (deliveryKind === "recovery") this.markRecoveryFrameSeen();
  }

  private handleAssemblyFault(subscriptionId: string, deliveryKind?: string): void {
    if (subscriptionId !== this.subscriptionId) return;
    if (this.awaitingInitial?.subscriptionId === subscriptionId && (deliveryKind === "initial" || deliveryKind === "recovery" || deliveryKind === undefined)) {
      this.awaitingInitial = null;
    }
    if (deliveryKind === "online" && this.recovery) {
      this.recovery.postRecoveryGapPending ||= this.recovery.validFrameSeen;
      return;
    }
    this.requestRecovery(deliveryKind === "recovery" || (deliveryKind === undefined && this.recovery !== null));
  }

  private requestRecovery(force = false): void {
    const transport = this.transport;
    const subscriptionId = this.subscriptionId;
    if (this.closed || !transport || !subscriptionId) return;
    const recovery = this.recovery;
    if (recovery) {
      if (!force) return;
      if (recovery.forceSnapshot) {
        this.failRecovery("fault.subscription.recoveryFailed");
        return;
      }
      if (recovery.requestInFlight || !recovery.ackReceived) {
        recovery.upgradePending = true;
        return;
      }
      if (recovery.ackMode === "resume") this.issueRecovery(recovery, true);
      else this.failRecovery("fault.subscription.recoveryFailed");
      return;
    }
    const created: SessionIndexRecovery = {
      subscriptionId,
      requestInFlight: false,
      ackReceived: false,
      validFrameSeen: false,
      upgradePending: false,
      ackMode: null,
      forceSnapshot: false,
      postRecoveryGapPending: false,
      frameDeadline: null,
    };
    this.recovery = created;
    this.issueRecovery(created, false);
  }

  private issueRecovery(recovery: SessionIndexRecovery, forceSnapshot: boolean): void {
    const transport = this.transport;
    if (!transport) return;
    this.clearRecoveryDeadline(recovery);
    const mustSnapshot = forceSnapshot || !this.subscriptionHasAppliedBase;
    recovery.requestInFlight = true;
    recovery.ackReceived = false;
    recovery.ackMode = null;
    recovery.validFrameSeen = false;
    recovery.upgradePending = false;
    recovery.forceSnapshot = mustSnapshot;
    recovery.postRecoveryGapPending = false;
    transport
      .resync({
        subscriptionId: recovery.subscriptionId,
        base: !this.subscriptionHasAppliedBase || this.state.logEpoch === null ? null : { logEpoch: this.state.logEpoch, seq: this.state.seq },
        ...(mustSnapshot ? { forceSnapshot: true } : {}),
      })
      .then((result) => {
        if (this.closed || this.recovery !== recovery) return;
        if (result.ack.subscriptionId !== recovery.subscriptionId) throw new Error("fault.subscription.resyncGenerationMismatch");
        recovery.requestInFlight = false;
        recovery.ackReceived = true;
        recovery.ackMode = result.ack.mode;
        this.settleRecovery(recovery);
      })
      .catch((error) => {
        if (this.closed || this.recovery !== recovery) return;
        this.clearRecoveryDeadline(recovery);
        this.recovery = null;
        const message = error instanceof Error ? error.message : String(error);
        logger.warn(`[v4-sessions-index] resync 失败: ${message}`);
        if (message.includes("fault.subscription.notOwned") && this.transport) {
          void this.connect(this.transport);
          return;
        }
        this.status = "error";
        this.emit();
      });
  }

  private markRecoveryFrameSeen(): void {
    const recovery = this.recovery;
    if (!recovery) return;
    recovery.validFrameSeen = true;
    this.settleRecovery(recovery);
  }

  private settleRecovery(recovery: SessionIndexRecovery): void {
    if (this.recovery !== recovery || !recovery.ackReceived || recovery.requestInFlight) return;
    if (recovery.upgradePending) {
      this.clearRecoveryDeadline(recovery);
      if (!recovery.forceSnapshot && recovery.ackMode === "resume") this.issueRecovery(recovery, true);
      else this.failRecovery("fault.subscription.recoveryFailed");
      return;
    }
    if (recovery.validFrameSeen) {
      this.clearRecoveryDeadline(recovery);
      if (recovery.postRecoveryGapPending) this.issueRecovery(recovery, false);
      else this.recovery = null;
      return;
    }
    recovery.frameDeadline ||= setTimeout(() => {
      recovery.frameDeadline = null;
      if (this.closed || this.recovery !== recovery || recovery.validFrameSeen) return;
      if (recovery.forceSnapshot) this.failRecovery("fault.subscription.recoveryFrameTimedOut");
      else this.issueRecovery(recovery, true);
    }, protocolLimits.logicalFrameAssemblyTimeoutMs);
  }

  private clearRecoveryDeadline(recovery: SessionIndexRecovery): void {
    if (recovery.frameDeadline) {
      clearTimeout(recovery.frameDeadline);
      recovery.frameDeadline = null;
    }
  }

  private discardRecovery(): void {
    if (this.recovery) this.clearRecoveryDeadline(this.recovery);
    this.recovery = null;
  }

  private clearSubscribeRetry(): void {
    if (this.subscribeRetryTimer) {
      clearTimeout(this.subscribeRetryTimer);
      this.subscribeRetryTimer = null;
    }
  }

  private failRecovery(reason: string): void {
    this.discardRecovery();
    this.status = "error";
    logger.warn(`[v4-sessions-index] recovery fail-closed: ${reason}`);
    this.emit();
  }

  private handleRuntimeRestart(): void {
    if (this.closed || !this.transport) return;
    const transport = this.transport;
    const now = Date.now();
    if (now - this.lastRuntimeRestartAt >= RUNTIME_RESTART_RESET_MS) this.runtimeRestartBurstCount = 0;
    this.lastRuntimeRestartAt = now;
    const delay =
      this.runtimeRestartBurstCount === 0 ? 0 : Math.min(RUNTIME_RESTART_BASE_DELAY_MS * 2 ** Math.min(this.runtimeRestartBurstCount - 1, 16), RUNTIME_RESTART_MAX_DELAY_MS);
    this.runtimeRestartBurstCount += 1;
    this.generation += 1;
    this.subscriptionId = null;
    this.awaitingInitial = null;
    this.discardRecovery();
    this.subscriptionHasAppliedBase = false;
    if (this.status !== "connecting") {
      this.status = "connecting";
      this.emit();
    }
    if (this.runtimeRestartReconnectTimer) clearTimeout(this.runtimeRestartReconnectTimer);
    this.runtimeRestartReconnectTimer = setTimeout(() => {
      this.runtimeRestartReconnectTimer = null;
      if (this.closed || this.transport !== transport) return;
      void this.connect(transport, { forceSnapshot: true });
    }, delay);
  }

  private handleRuntimeAvailable(): void {
    if (this.closed || !this.transport) return;
    this.handleRuntimeRestart();
  }

  private handleRuntimeUnavailable(): void {
    if (this.closed) return;
    this.generation += 1;
    this.subscriptionId = null;
    this.awaitingInitial = null;
    this.discardRecovery();
    this.subscriptionHasAppliedBase = false;
    this.clearSubscribeRetry();
    if (this.runtimeRestartReconnectTimer) {
      clearTimeout(this.runtimeRestartReconnectTimer);
      this.runtimeRestartReconnectTimer = null;
    }
    this.state = INITIAL_SESSION_INDEX_STATE;
    this.cachedList = null;
    this.status = "dormant";
    this.emit();
  }

  close(): void {
    this.closed = true;
    this.generation += 1;
    this.status = "idle";
    const detached = this.detachTransport();
    if (detached.subscriptionId && detached.transport) unsubscribeTransport(detached.transport, detached.subscriptionId);
  }

  private detachTransport(): { transport: SessionIndexTransport | null; subscriptionId: string | null } {
    const detached = { transport: this.transport, subscriptionId: this.subscriptionId };
    if (this.runtimeRestartReconnectTimer) {
      clearTimeout(this.runtimeRestartReconnectTimer);
      this.runtimeRestartReconnectTimer = null;
    }
    this.runtimeRestartBurstCount = 0;
    this.lastRuntimeRestartAt = 0;
    this.clearSubscribeRetry();
    this.frameUnsub?.();
    this.frameUnsub = null;
    this.faultUnsub?.();
    this.faultUnsub = null;
    this.restartUnsub?.();
    this.restartUnsub = null;
    this.lifecycleUnsub?.();
    this.lifecycleUnsub = null;
    this.transport = null;
    this.subscriptionId = null;
    this.awaitingInitial = null;
    this.discardRecovery();
    this.subscriptionHasAppliedBase = false;
    return detached;
  }

  /** 返回 true 表示帧断档 */
  private applyFrame(frame: { payload: unknown; toSeq: number }): boolean {
    const { state, gap } = applyFrameToIndexState(this.state, frame);
    if (gap) return true;
    if (state !== this.state) {
      this.state = state;
      this.cachedList = null;
      this.emit();
    }
    return false;
  }

  reset(): void {
    this.discardRecovery();
    this.subscriptionHasAppliedBase = false;
    this.state = INITIAL_SESSION_INDEX_STATE;
    this.cachedList = null;
    this.emit();
  }

  /** 按最近活动降序的会话列表（带缓存） */
  getSessions(): SessionIndexEntry[] {
    if (this.cachedList === null) {
      this.cachedList = [...this.state.sessions.values()].sort((a, b) => b.lastActivityAt - a.lastActivityAt);
    }
    return this.cachedList;
  }

  private emit(): void {
    for (const listener of this.listeners) listener();
  }
}

/* --- G.6 会话索引 store 池 + 工作区订阅集（原 35356–35478） --- */

export interface SessionIndexScope {
  workspaceKey: string;
  workspacePath: string;
  workspaceIdentity?: string;
  endpointKey?: string;
}

interface SessionIndexPoolEntry {
  key: string;
  agentService: unknown;
  agentServiceGeneration: number;
  store: SessionIndexStore;
  refCount: number;
}

const sessionIndexPool = new Map<string, SessionIndexPoolEntry>(); // 原 LS
const sessionIndexPoolReverse = new WeakMap<SessionIndexStore, SessionIndexPoolEntry>(); // 原 RS

declare function createWorkspaceSessionIndexTransport(scope: { workspacePath: string; workspaceIdentity?: string }, agentService: unknown): SessionIndexTransport; // 原 zS=oAe
declare function workspaceIdentityOf(scope: { workspacePath: string; workspaceIdentity?: string | null }): string; // 原 WS

export function sessionIndexPoolKey(scope: SessionIndexScope, agentService?: unknown): string {
  const base = `${scope.endpointKey ?? "__base__"}\u0000${scope.workspaceKey}`;
  return agentService ? `${base}\u0000service-generation:${serviceGeneration(agentService as object)}` : base;
}

/** 原 VS：获取（或创建）工作区的会话索引 store（引用计数；远端服务代际升级时热替换传输） */
export function acquireSessionIndexStore(scope: SessionIndexScope, agentService: unknown): SessionIndexStore {
  const key = sessionIndexPoolKey(scope);
  const generation = serviceGeneration(agentService as object);
  const existing = sessionIndexPool.get(key);
  if (existing && existing.agentService === agentService) {
    existing.refCount += 1;
    return existing.store;
  }
  if (existing && (scope.endpointKey ?? "__base__") !== "__base__") {
    existing.refCount += 1;
    if (generation > existing.agentServiceGeneration) {
      existing.agentService = agentService;
      existing.agentServiceGeneration = generation;
      const transport = createWorkspaceSessionIndexTransport({ workspacePath: scope.workspacePath, workspaceIdentity: scope.workspaceIdentity }, agentService);
      existing.store.replaceTransport(transport).catch((error) => {
        logger.warn("[v4-sessions-index] remote transport replacement failed", error);
      });
    }
    return existing.store;
  }
  if (existing) {
    sessionIndexPool.delete(key);
    if (existing.refCount <= 0) {
      existing.store.close();
      sessionIndexPoolReverse.delete(existing.store);
    }
  }
  const store = new SessionIndexStore();
  const transport = createWorkspaceSessionIndexTransport({ workspacePath: scope.workspacePath, workspaceIdentity: scope.workspaceIdentity }, agentService);
  void store.connect(transport, { forceSnapshot: true });
  const entry: SessionIndexPoolEntry = { key, agentService, agentServiceGeneration: generation, store, refCount: 1 };
  sessionIndexPool.set(key, entry);
  sessionIndexPoolReverse.set(store, entry);
  return store;
}

/** 原 HS：释放引用（归零即关闭） */
export function releaseSessionIndexStore(scope: SessionIndexScope, store: SessionIndexStore): void {
  const key = sessionIndexPoolKey(scope);
  const entry = sessionIndexPoolReverse.get(store);
  if (!entry || entry.key !== key) return;
  entry.refCount -= 1;
  if (entry.refCount > 0) return;
  entry.store.close();
  sessionIndexPoolReverse.delete(entry.store);
  if (sessionIndexPool.get(key) === entry) sessionIndexPool.delete(key);
}

/** 原 QAe：工作区订阅集 —— 按作用域列表对账（获取/释放/服务换代） */
export class WorkspaceSubscriptionSet {
  private active = new Map<string, { scope: SessionIndexScope; agentService: unknown; store: SessionIndexStore; unsubscribeStore: () => void }>();
  constructor(private onStoreChange: () => void) {}

  /** 返回是否有变化 */
  reconcile(desired: Array<{ scope: SessionIndexScope; agentService: unknown }>): boolean {
    const target = new Map<string, { scope: SessionIndexScope; agentService: unknown }>();
    for (const item of desired) target.set(sessionIndexPoolKey(item.scope), item);
    let changed = false;
    const releasedKeys: string[] = [];
    const acquiredKeys: string[] = [];
    for (const [key, entry] of this.active) {
      const wanted = target.get(key);
      if (wanted && entry.agentService === wanted.agentService && entry.scope.workspaceKey === wanted.scope.workspaceKey && entry.scope.workspacePath === wanted.scope.workspacePath && entry.scope.workspaceIdentity === wanted.scope.workspaceIdentity && entry.scope.endpointKey === wanted.scope.endpointKey) {
        continue;
      }
      if (wanted && entry.agentService !== wanted.agentService && (entry.scope.endpointKey ?? "__base__") !== "__base__") {
        const nextStore = acquireSessionIndexStore(wanted.scope, wanted.agentService);
        const sameStore = nextStore === entry.store;
        const unsubscribe = sameStore ? entry.unsubscribeStore : nextStore.subscribe(this.onStoreChange);
        if (sameStore) releaseSessionIndexStore(entry.scope, entry.store);
        else this.disposeEntry(entry);
        this.active.set(key, { ...wanted, store: nextStore, unsubscribeStore: unsubscribe });
        releasedKeys.push(scopeLabel(entry.scope));
        acquiredKeys.push(scopeLabel(wanted.scope));
        changed = true;
        continue;
      }
      releasedKeys.push(scopeLabel(entry.scope));
      this.disposeEntry(entry);
      this.active.delete(key);
      changed = true;
    }
    for (const [key, wanted] of target) {
      if (this.active.has(key)) continue;
      const store = acquireSessionIndexStore(wanted.scope, wanted.agentService);
      acquiredKeys.push(scopeLabel(wanted.scope));
      this.active.set(key, { ...wanted, store, unsubscribeStore: store.subscribe(this.onStoreChange) });
      changed = true;
    }
    if (changed) {
      logger.info("[v4-sessions-index] workspace subscription set reconciled", { acquiredScopeKeys: acquiredKeys, releasedScopeKeys: releasedKeys, activeCount: this.active.size });
      this.onStoreChange();
    } else {
      logger.debug("[v4-sessions-index] workspace subscription set unchanged", { activeCount: this.active.size });
    }
    return changed;
  }

  getStore(scope: SessionIndexScope): SessionIndexStore | undefined {
    return this.active.get(sessionIndexPoolKey(scope))?.store;
  }

  size(): number {
    return this.active.size;
  }

  dispose(): void {
    if (this.active.size > 0) {
      logger.info("[v4-sessions-index] workspace subscription set disposed", { releasedScopeKeys: [...this.active.values()].map((entry) => scopeLabel(entry.scope)) });
    }
    for (const entry of this.active.values()) this.disposeEntry(entry);
    this.active.clear();
  }

  private disposeEntry(entry: { scope: SessionIndexScope; store: SessionIndexStore; unsubscribeStore: () => void }): void {
    entry.unsubscribeStore();
    releaseSessionIndexStore(entry.scope, entry.store);
  }
}

function scopeLabel(scope: SessionIndexScope): string {
  return `${scope.endpointKey ?? "__base__"}:${scope.workspaceKey}`;
}
