// A0-S4-5: 自 modules/services.tsx §A 原样迁入（事件/可释放原语 + VSBuffer/变长编解码，原 js 3551–3842；原文件现为薄 re-export shim）。
// 本单元自含，无导入；迁出体逐字未动。
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
