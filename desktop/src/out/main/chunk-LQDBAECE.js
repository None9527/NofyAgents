var q = Object.defineProperty;
var s = (t, e) => q(t, "name", { value: e, configurable: !0 });
var ge = (t, e) => {
  for (var n in e) q(t, n, { get: e[n], enumerable: !0 });
};
var d = {
  OTEL_EXPORTER_OTLP_ENDPOINT:
    "https://proj-xtrace-7e235817c9b9381c22d8b743908d469f-cn-beijing.cn-beijing.log.aliyuncs.com/apm/trace/opentelemetry",
  OTEL_EXPORTER_OTLP_HEADERS:
    "x-arms-license-key=j2c03hoppk@8309eb6928a66ff,x-arms-project=proj-xtrace-7e235817c9b9381c22d8b743908d469f-cn-beijing,x-cms-workspace=default-cms-1936221977589032-cn-beijing",
  OTEL_SERVICE_NAME: "zcode-cli-agent",
  ZCODE_TELEMETRY_RUNTIME_DISTRIBUTION: "packaged",
};
var h = ["https://cdn-zcode.z.ai/zcode/electron/releases"];
function toDisposable(t) {
  return { dispose: once(t) };
}
s(toDisposable, "toDisposable");
function once(t) {
  let e = !1;
  return () => {
    e || ((e = !0), t());
  };
}
s(once, "once");
var k = class {
    static {
      s(this, "DisposableStore");
    }
    items = new Set();
    isDisposed = !1;
    add(e) {
      return this.isDisposed
        ? (console.warn("Adding to a disposed DisposableStore"), e.dispose(), e)
        : (this.items.add(e), e);
    }
    dispose() {
      if (!this.isDisposed) {
        this.isDisposed = !0;
        for (let e of this.items) e.dispose();
        this.items.clear();
      }
    }
  },
  I;
((i) => {
  i.None = s(() => ({ dispose() {} }), "None");
  function once(a) {
    return (l) => {
      let c = !1,
        p = a((m) => {
          c || ((c = !0), p.dispose(), l(m));
        });
      return p;
    };
  }
  ((i.once = once), s(once, "once"));
  function toPromise(a) {
    return new Promise((l) => once(a)(l));
  }
  ((i.toPromise = toPromise), s(toPromise, "toPromise"));
  function filter(a, l) {
    return (c) =>
      a((p) => {
        l(p) && c(p);
      });
  }
  ((i.filter = filter), s(filter, "filter"));
  function map(a, l) {
    return (c) => a((p) => c(l(p)));
  }
  ((i.map = map), s(map, "map"));
})((I ||= {}));
var f = class {
  static {
    s(this, "Emitter");
  }
  listeners = new Set();
  disposed = !1;
  options;
  constructor(e) {
    this.options = e;
  }
  get event() {
    return (e) => {
      if (this.disposed) return { dispose() {} };
      let n = this.listeners.size === 0;
      return (
        this.listeners.add(e),
        n && this.options?.onWillAddFirstListener?.(),
        toDisposable(() => {
          (this.listeners.delete(e),
            this.listeners.size === 0 && this.options?.onDidRemoveLastListener?.());
        })
      );
    };
  }
  fire(e) {
    if (!this.disposed) for (let n of [...this.listeners]) n(e);
  }
  dispose() {
    ((this.disposed = !0), this.listeners.clear());
  }
};
var A;
((e) => (e.None = { isCancellationRequested: !1, onCancellationRequested: I.None }))((A ||= {}));
var u = class t {
  static {
    s(this, "VSBuffer");
  }
  buffer;
  byteLength;
  constructor(e) {
    ((this.buffer = e), (this.byteLength = e.byteLength));
  }
  static alloc(e) {
    return new t(new Uint8Array(e));
  }
  static wrap(e) {
    return new t(e);
  }
  static fromString(e) {
    let n = new TextEncoder();
    return new t(n.encode(e));
  }
  static concat(e, n) {
    let r = n ?? e.reduce((a, l) => a + l.byteLength, 0),
      o = t.alloc(r),
      i = 0;
    for (let a of e) (o.set(a, i), (i += a.byteLength));
    return o;
  }
  toString() {
    return new TextDecoder().decode(this.buffer);
  }
  slice(e, n) {
    return new t(this.buffer.slice(e, n));
  }
  set(e, n = 0) {
    let r = e instanceof t ? e.buffer : e;
    this.buffer.set(r, n);
  }
  readUInt8(e) {
    return this.buffer[e];
  }
  writeUInt8(e, n) {
    this.buffer[n] = e;
  }
  readUInt32BE(e) {
    return (
      ((this.buffer[e] << 24) |
        (this.buffer[e + 1] << 16) |
        (this.buffer[e + 2] << 8) |
        this.buffer[e + 3]) >>>
      0
    );
  }
  writeUInt32BE(e, n) {
    ((this.buffer[n] = (e >>> 24) & 255),
      (this.buffer[n + 1] = (e >>> 16) & 255),
      (this.buffer[n + 2] = (e >>> 8) & 255),
      (this.buffer[n + 3] = e & 255));
  }
};
var w = class {
    constructor(e) {
      this.buffer = e;
    }
    buffer;
    static {
      s(this, "BufferReader");
    }
    pos = 0;
    read(e) {
      let n = this.buffer.slice(this.pos, this.pos + e);
      return ((this.pos += n.byteLength), n);
    }
  },
  b = class {
    static {
      s(this, "BufferWriter");
    }
    buffers = [];
    get buffer() {
      return u.concat(this.buffers);
    }
    write(e) {
      this.buffers.push(e);
    }
  };
function readIntVQL(t) {
  let e = 0;
  for (let n = 0; ; n += 7) {
    let r = t.read(1);
    if (((e |= (r.buffer[0] & 127) << n), !(r.buffer[0] & 128))) return e;
  }
}
s(readIntVQL, "readIntVQL");
var te = createOneByteBuffer(0);
function writeInt32VQL(t, e) {
  if (e === 0) {
    t.write(te);
    return;
  }
  let n = 0;
  for (let o = e; o !== 0; o = o >>> 7) n++;
  let r = u.alloc(n);
  for (let o = 0; e !== 0; o++)
    ((r.buffer[o] = e & 127), (e = e >>> 7), e > 0 && (r.buffer[o] |= 128));
  t.write(r);
}
s(writeInt32VQL, "writeInt32VQL");
function createOneByteBuffer(t) {
  let e = u.alloc(1);
  return (e.writeUInt8(t, 0), e);
}
s(createOneByteBuffer, "createOneByteBuffer");
var T = {
    Undefined: createOneByteBuffer(0),
    String: createOneByteBuffer(1),
    Buffer: createOneByteBuffer(2),
    VSBuffer: createOneByteBuffer(3),
    Array: createOneByteBuffer(4),
    Object: createOneByteBuffer(5),
    Int: createOneByteBuffer(6),
  },
  j = "__zcode_rpc_nested_uint8array_v1",
  L = "base64";
function serialize(t, e) {
  if (typeof e > "u") t.write(T.Undefined);
  else if (typeof e == "string") {
    let n = u.fromString(e);
    (t.write(T.String), writeInt32VQL(t, n.byteLength), t.write(n));
  } else if (e instanceof u) (t.write(T.VSBuffer), writeInt32VQL(t, e.byteLength), t.write(e));
  else if (e instanceof Uint8Array) {
    let n = u.wrap(e);
    (t.write(T.Buffer), writeInt32VQL(t, n.byteLength), t.write(n));
  } else if (Array.isArray(e)) {
    (t.write(T.Array), writeInt32VQL(t, e.length));
    for (let n of e) serialize(t, n);
  } else if (typeof e == "number" && (e | 0) === e) (t.write(T.Int), writeInt32VQL(t, e));
  else {
    let n = u.fromString(JSON.stringify(e, encodeRpcJsonValue));
    (t.write(T.Object), writeInt32VQL(t, n.byteLength), t.write(n));
  }
}
s(serialize, "serialize");
function deserialize(t) {
  switch (t.read(1).readUInt8(0)) {
    case 0:
      return;
    case 1:
      return t.read(readIntVQL(t)).toString();
    case 2:
      return t.read(readIntVQL(t)).buffer;
    case 3:
      return t.read(readIntVQL(t));
    case 4: {
      let n = readIntVQL(t),
        r = [];
      for (let o = 0; o < n; o++) r.push(deserialize(t));
      return r;
    }
    case 5:
      return JSON.parse(t.read(readIntVQL(t)).toString(), decodeRpcJsonValue);
    case 6:
      return readIntVQL(t);
  }
}
s(deserialize, "deserialize");
function encodeRpcJsonValue(t, e) {
  return e instanceof Uint8Array ? { [j]: !0, [L]: bytesToBase64(e) } : e;
}
s(encodeRpcJsonValue, "encodeRpcJsonValue");
function decodeRpcJsonValue(t, e) {
  return isRpcEncodedUint8Array(e) ? base64ToBytes(e[L]) : e;
}
s(decodeRpcJsonValue, "decodeRpcJsonValue");
function isRpcEncodedUint8Array(t) {
  if (typeof t != "object" || t === null || Array.isArray(t)) return !1;
  let e = t;
  return e[j] === !0 && typeof e[L] == "string" && Object.keys(e).length === 2;
}
s(isRpcEncodedUint8Array, "isRpcEncodedUint8Array");
function bytesToBase64(t) {
  let e = globalThis.Buffer;
  if (e) return e.from(t).toString("base64");
  let n = "",
    r = 32768;
  for (let o = 0; o < t.length; o += r) {
    let i = t.subarray(o, o + r);
    n += String.fromCharCode(...i);
  }
  return globalThis.btoa(n);
}
s(bytesToBase64, "bytesToBase64");
function base64ToBytes(t) {
  let e = globalThis.Buffer;
  if (e) return new Uint8Array(e.from(t, "base64"));
  let n = globalThis.atob(t),
    r = new Uint8Array(n.length);
  for (let o = 0; o < n.length; o += 1) r[o] = n.charCodeAt(o);
  return r;
}
s(base64ToBytes, "base64ToBytes");
function isMessagePortFlowControl(t) {
  if (typeof t != "object" || t === null || Array.isArray(t)) return !1;
  let e = t;
  return (
    Object.keys(e).length === 2 &&
    e.__zcodeRpcControl === "connection-flow-v1" &&
    (e.state === "saturated" || e.state === "drained")
  );
}
s(isMessagePortFlowControl, "isMessagePortFlowControl");
var P = class {
  static {
    s(this, "ChunkStream");
  }
  chunks = [];
  totalLength = 0;
  get byteLength() {
    return this.totalLength;
  }
  acceptChunk(e) {
    (this.chunks.push(e), (this.totalLength += e.byteLength));
  }
  peek(e) {
    if (this.totalLength < e) return null;
    if (this.chunks[0].byteLength >= e) return this.chunks[0].slice(0, e);
    let n = u.alloc(e),
      r = 0;
    for (let o of this.chunks) {
      if (r >= e) break;
      let i = e - r,
        a = Math.min(o.byteLength, i);
      (n.set(a === o.byteLength ? o : o.slice(0, a), r), (r += a));
    }
    return n;
  }
  skip(e) {
    if (!this.read(e))
      throw new Error(`ChunkStream.skip(${e}) \u8D85\u51FA\u53EF\u8BFB\u8303\u56F4`);
  }
  read(e) {
    if (this.totalLength < e) return null;
    if (this.chunks[0].byteLength === e) {
      let o = this.chunks.shift();
      return ((this.totalLength -= e), o);
    }
    if (this.chunks[0].byteLength > e) {
      let o = this.chunks[0].slice(0, e);
      return ((this.chunks[0] = this.chunks[0].slice(e)), (this.totalLength -= e), o);
    }
    let n = u.alloc(e),
      r = 0;
    for (; r < e;) {
      let o = this.chunks[0],
        i = e - r;
      o.byteLength <= i
        ? (n.set(o, r), (r += o.byteLength), this.chunks.shift())
        : (n.set(o.slice(0, i), r), (this.chunks[0] = o.slice(i)), (r += i));
    }
    return ((this.totalLength -= e), n);
  }
};
var S = 13,
  M = class {
    constructor(e, n, r, o) {
      this.type = e;
      this.id = n;
      this.ack = r;
      this.data = o;
    }
    type;
    id;
    ack;
    data;
    static {
      s(this, "ProtocolMessage");
    }
    get byteLength() {
      return S + this.data.byteLength;
    }
  };
function writeProtocolMessage(t) {
  let e = u.alloc(S + t.data.byteLength);
  return (
    e.writeUInt8(t.type, 0),
    e.writeUInt32BE(t.id, 1),
    e.writeUInt32BE(t.ack, 5),
    e.writeUInt32BE(t.data.byteLength, 9),
    e.set(t.data, S),
    e
  );
}
s(writeProtocolMessage, "writeProtocolMessage");
var U = class {
  constructor(e) {
    this.socket = e;
    this.disposables.add(
      e.onData((n) => {
        (this.chunkStream.acceptChunk(n), this.readMessages());
      }),
    );
  }
  socket;
  static {
    s(this, "SocketProtocol");
  }
  _onMessage = new f();
  onMessage = this._onMessage.event;
  chunkStream = new P();
  disposables = new k();
  send(e) {
    this.writeMessage(new M(1, 0, 0, e));
  }
  writeMessage(e) {
    this.socket.write(writeProtocolMessage(e));
  }
  readMessages() {
    for (;;) {
      let e = this.chunkStream.peek(S);
      if (!e) break;
      let n = e.readUInt8(0),
        r = e.readUInt32BE(1),
        o = e.readUInt32BE(5),
        i = e.readUInt32BE(9),
        a = S + i;
      if (this.chunkStream.byteLength < a) break;
      if ((this.chunkStream.skip(S), i === 0)) {
        n === 1 && this._onMessage.fire(u.alloc(0));
        continue;
      }
      let l = this.chunkStream.read(i);
      if (!l)
        throw new Error(
          "SocketProtocol \u8BFB\u53D6\u5230\u5B8C\u6574\u5E27\u957F\u5EA6\u540E body \u4E0D\u5E94\u4E3A\u7A7A",
        );
      n === 1 && this._onMessage.fire(l);
    }
  }
  async drain() {
    return this.socket.drain();
  }
  dispose() {
    (this.disposables.dispose(), this._onMessage.dispose());
  }
};
var N = class {
  constructor(e) {
    this.port = e;
    ((this.handler = (n) => {
      if (isMessagePortFlowControl(n.data)) {
        this._onFlowState.fire(n.data.state);
        return;
      }
      n.data instanceof Uint8Array && this._onMessage.fire(u.wrap(n.data));
    }),
      this.port.addEventListener("message", this.handler),
      this.port.start());
  }
  port;
  static {
    s(this, "MessagePortProtocol");
  }
  _onMessage = new f();
  onMessage = this._onMessage.event;
  _onFlowState = new f();
  onFlowState = this._onFlowState.event;
  handler;
  send(e) {
    this.port.postMessage(e.buffer);
  }
  sendFlowState(e) {
    this.port.postMessage({ __zcodeRpcControl: "connection-flow-v1", state: e });
  }
  disconnect() {
    (this.port.removeEventListener("message", this.handler),
      this.port.close(),
      this._onMessage.dispose(),
      this._onFlowState.dispose());
  }
};
var D = class {
  constructor(e) {
    this.protocol = e;
    this.protocolListener = this.protocol.onMessage((n) => this.onBuffer(n));
  }
  protocol;
  static {
    s(this, "ChannelClient");
  }
  state = 0;
  isDisposed = !1;
  activeRequests = new Set();
  handlers = new Map();
  lastRequestId = 0;
  protocolListener;
  _onDidInitialize = new f();
  onDidInitialize = this._onDidInitialize.event;
  getChannel(e) {
    return {
      call: s(
        (n, r, o) =>
          this.isDisposed
            ? Promise.reject(new Error("ChannelClient is disposed"))
            : this.requestPromise(e, n, r, o),
        "call",
      ),
      listen: s((n, r) => (this.isDisposed ? I.None : this.requestEvent(e, n, r)), "listen"),
    };
  }
  requestPromise(e, n, r, o = A.None) {
    let i = this.lastRequestId++;
    if (o.isCancellationRequested) return Promise.reject(new Error("Cancelled"));
    let a;
    return new Promise((c, p) => {
      let m = s(() => {
        let g = s((y) => {
          switch (y.type) {
            case 201:
              (this.handlers.delete(i), c(y.data));
              return;
            case 202: {
              this.handlers.delete(i);
              let _ = new Error(y.data.message);
              ((_.name = y.data.name),
                y.data.stack &&
                  (_.stack = y.data.stack.join(`
`)));
              let Q = ["code", "data", "detail", "details", "taskId", "traceId"];
              for (let F of Q) {
                let z = y.data[F];
                z !== void 0 && (_[F] = z);
              }
              p(_);
              return;
            }
            case 203:
              (this.handlers.delete(i), p(y.data));
              return;
          }
        }, "handler");
        (this.handlers.set(i, g), this.sendRequest(100, i, e, n, r));
      }, "doRequest");
      (this.state === 1 ? m() : this.whenInitialized().then(m),
        (a = o.onCancellationRequested(() => {
          (this.sendCancelOrDispose(101, i), p(new Error("Cancelled")));
        })),
        this.activeRequests.add(a));
    }).finally(() => {
      (a?.dispose(), a && this.activeRequests.delete(a));
    });
  }
  requestEvent(e, n, r) {
    let o = this.lastRequestId++,
      i = new f({
        onWillAddFirstListener: s(() => {
          let a = s(() => {
            (this.activeRequests.add(i), this.sendRequest(102, o, e, n, r));
          }, "doRequest");
          this.state === 1 ? a() : this.whenInitialized().then(a);
        }, "onWillAddFirstListener"),
        onDidRemoveLastListener: s(() => {
          (this.activeRequests.delete(i),
            this.sendCancelOrDispose(103, o),
            this.handlers.delete(o));
        }, "onDidRemoveLastListener"),
      });
    return (
      this.handlers.set(o, (a) => {
        i.fire(a.data);
      }),
      i.event
    );
  }
  sendRequest(e, n, r, o, i) {
    let a = new b();
    (serialize(a, [e, n, r, o]), serialize(a, i));
    try {
      this.protocol.send(a.buffer);
    } catch {}
  }
  sendCancelOrDispose(e, n) {
    let r = new b();
    (serialize(r, [e, n]), serialize(r, void 0));
    try {
      this.protocol.send(r.buffer);
    } catch {}
  }
  onBuffer(e) {
    let n = new w(e),
      r = deserialize(n),
      o = deserialize(n),
      i = r[0];
    switch (i) {
      case 200:
        this.onResponse({ type: 200 });
        return;
      case 201:
      case 202:
      case 204:
      case 203:
        this.onResponse({ type: i, id: r[1], data: o });
        return;
    }
  }
  onResponse(e) {
    if (e.type === 200) {
      ((this.state = 1), this._onDidInitialize.fire());
      return;
    }
    this.handlers.get(e.id)?.(e);
  }
  whenInitialized() {
    return this.state === 1 ? Promise.resolve() : I.toPromise(this.onDidInitialize);
  }
  dispose() {
    ((this.isDisposed = !0), this.protocolListener?.dispose(), (this.protocolListener = null));
    for (let e of this.activeRequests) e.dispose();
    (this.activeRequests.clear(), this._onDidInitialize.dispose());
  }
};
var Y;
((n) => {
  function fromService(r, o) {
    let i = r,
      a = new Map();
    for (let l in i)
      isEvent(l) && !isDynamicEvent(l) && typeof i[l] == "function" && a.set(l, bufferEvent(i[l]));
    return {
      listen(l, c, p) {
        let m = a.get(c);
        if (m) return m;
        let g = i[c];
        if (typeof g == "function") {
          if (isDynamicEvent(c)) return g.call(i, p);
          if (isEvent(c)) return (a.set(c, bufferEvent(i[c])), a.get(c));
        }
        throw new Error(`Event not found: ${c}`);
      },
      call(l, c, p) {
        let m = i[c];
        if (typeof m == "function") {
          let g = m.apply(i, p || []);
          return (g instanceof Promise || (g = Promise.resolve(g)), g);
        }
        throw new Error(`Method not found: ${c}`);
      },
    };
  }
  ((n.fromService = fromService), s(fromService, "fromService"));
  function toService(r, o) {
    return new Proxy(
      {},
      {
        get(i, a, l) {
          return typeof a == "symbol"
            ? Reflect.get(i, a, l)
            : typeof a == "string"
              ? a === "then"
                ? void 0
                : isDynamicEvent(a)
                  ? (c) => r.listen(a, c)
                  : isEvent(a)
                    ? r.listen(a)
                    : async (...c) => {
                        let p = o?.context !== void 0 ? [o.context, ...c] : c;
                        return r.call(a, p);
                      }
              : Reflect.get(i, a, l);
        },
      },
    );
  }
  ((n.toService = toService), s(toService, "toService"));
})((Y ||= {}));
function isEvent(t) {
  return (
    t.length >= 3 && t[0] === "o" && t[1] === "n" && t.charCodeAt(2) >= 65 && t.charCodeAt(2) <= 90
  );
}
s(isEvent, "isEvent");
function isDynamicEvent(t) {
  return (
    t.length >= 10 && t.startsWith("onDynamic") && t.charCodeAt(9) >= 65 && t.charCodeAt(9) <= 90
  );
}
s(isDynamicEvent, "isDynamicEvent");
function bufferEvent(t) {
  let e = [],
    n = !1,
    r,
    o = new f({
      onWillAddFirstListener: s(() => {
        r = t((a) => {
          n ? o.fire(a) : e.push(a);
        });
      }, "onWillAddFirstListener"),
      onDidRemoveLastListener: s(() => {
        (r?.dispose(), (r = void 0), (e = []));
      }, "onDidRemoveLastListener"),
    }),
    i = o.event;
  return (a) => {
    let l = i(a);
    if (!n) {
      n = !0;
      for (let c of e) o.fire(c);
      e = [];
    }
    return l;
  };
}
s(bufferEvent, "bufferEvent");
function normalizeToken(t) {
  return t.trim().toLowerCase();
}
s(normalizeToken, "normalizeToken");
function normalizeRemotePlatform(t) {
  let e = normalizeToken(t);
  return e === "darwin" || e === "macos"
    ? "darwin"
    : e === "linux" || e === "gnu/linux"
      ? "linux"
      : e === "windows_nt" ||
          e.startsWith("mingw") ||
          e.startsWith("msys") ||
          e.startsWith("cygwin")
        ? "win32"
        : e;
}
s(normalizeRemotePlatform, "normalizeRemotePlatform");
function normalizeRemoteArch(t) {
  let e = normalizeToken(t);
  return e === "x86_64" || e === "amd64" ? "x64" : e === "aarch64" || e === "arm64e" ? "arm64" : e;
}
s(normalizeRemoteArch, "normalizeRemoteArch");
function resolveRemotePlatform(t, e) {
  let n = normalizeRemotePlatform(t),
    r = normalizeRemotePlatform(e);
  return n === "darwin" && r === "linux" ? "linux" : n;
}
s(resolveRemotePlatform, "resolveRemotePlatform");
function createCloseEventController() {
  let t = new f(),
    e = !1,
    n = 0;
  return {
    event: s(
      (i) =>
        e
          ? (queueMicrotask(() => {
              i(n);
            }),
            { dispose() {} })
          : t.event(i),
      "event",
    ),
    fire: s((i) => {
      e || ((e = !0), (n = i), t.fire(i), t.dispose());
    }, "fire"),
  };
}
s(createCloseEventController, "createCloseEventController");
export {
  s as a,
  ge as b,
  d as c,
  h as d,
  f as e,
  u as f,
  U as g,
  N as h,
  D as i,
  Y as j,
  normalizeRemotePlatform as k,
  normalizeRemoteArch as l,
  resolveRemotePlatform as m,
  createCloseEventController as n,
};
