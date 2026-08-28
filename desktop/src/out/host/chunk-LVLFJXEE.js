var K = Object.defineProperty;
var i = (n, e) => K(n, "name", { value: e, configurable: !0 });
var be = (n, e) => {
  for (var t in e) K(n, t, { get: e[t], enumerable: !0 });
};
function toDisposable(n) {
  return { dispose: once(n) };
}
i(toDisposable, "toDisposable");
function once(n) {
  let e = !1;
  return () => {
    e || ((e = !0), n());
  };
}
i(once, "once");
var I = class {
    static {
      i(this, "DisposableStore");
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
  T;
((a) => {
  a.None = i(() => ({ dispose() {} }), "None");
  function once(o) {
    return (c) => {
      let l = !1,
        d = o((f) => {
          l || ((l = !0), d.dispose(), c(f));
        });
      return d;
    };
  }
  ((a.once = once), i(once, "once"));
  function toPromise(o) {
    return new Promise((c) => once(o)(c));
  }
  ((a.toPromise = toPromise), i(toPromise, "toPromise"));
  function filter(o, c) {
    return (l) =>
      o((d) => {
        c(d) && l(d);
      });
  }
  ((a.filter = filter), i(filter, "filter"));
  function map(o, c) {
    return (l) => o((d) => l(c(d)));
  }
  ((a.map = map), i(map, "map"));
})((T ||= {}));
var p = class {
  static {
    i(this, "Emitter");
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
      let t = this.listeners.size === 0;
      return (
        this.listeners.add(e),
        t && this.options?.onWillAddFirstListener?.(),
        toDisposable(() => {
          (this.listeners.delete(e),
            this.listeners.size === 0 && this.options?.onDidRemoveLastListener?.());
        })
      );
    };
  }
  fire(e) {
    if (!this.disposed) for (let t of [...this.listeners]) t(e);
  }
  dispose() {
    ((this.disposed = !0), this.listeners.clear());
  }
};
var L;
((e) => (e.None = { isCancellationRequested: !1, onCancellationRequested: T.None }))((L ||= {}));
var P = class {
  static {
    i(this, "CancellationTokenSource");
  }
  _token;
  emitter = new p();
  _isCancelled = !1;
  get token() {
    return (
      this._token ||
        (this._token = {
          isCancellationRequested: !1,
          onCancellationRequested: this.emitter.event,
        }),
      this._token
    );
  }
  cancel() {
    this._isCancelled || ((this._isCancelled = !0), this.emitter.fire());
  }
  dispose() {
    this.emitter.dispose();
  }
};
var h = class n {
  static {
    i(this, "VSBuffer");
  }
  buffer;
  byteLength;
  constructor(e) {
    ((this.buffer = e), (this.byteLength = e.byteLength));
  }
  static alloc(e) {
    return new n(new Uint8Array(e));
  }
  static wrap(e) {
    return new n(e);
  }
  static fromString(e) {
    let t = new TextEncoder();
    return new n(t.encode(e));
  }
  static concat(e, t) {
    let s = t ?? e.reduce((o, c) => o + c.byteLength, 0),
      r = n.alloc(s),
      a = 0;
    for (let o of e) (r.set(o, a), (a += o.byteLength));
    return r;
  }
  toString() {
    return new TextDecoder().decode(this.buffer);
  }
  slice(e, t) {
    return new n(this.buffer.slice(e, t));
  }
  set(e, t = 0) {
    let s = e instanceof n ? e.buffer : e;
    this.buffer.set(s, t);
  }
  readUInt8(e) {
    return this.buffer[e];
  }
  writeUInt8(e, t) {
    this.buffer[t] = e;
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
  writeUInt32BE(e, t) {
    ((this.buffer[t] = (e >>> 24) & 255),
      (this.buffer[t + 1] = (e >>> 16) & 255),
      (this.buffer[t + 2] = (e >>> 8) & 255),
      (this.buffer[t + 3] = e & 255));
  }
};
function isMessagePortFlowControl(n) {
  if (typeof n != "object" || n === null || Array.isArray(n)) return !1;
  let e = n;
  return (
    Object.keys(e).length === 2 &&
    e.__zcodeRpcControl === "connection-flow-v1" &&
    (e.state === "saturated" || e.state === "drained")
  );
}
i(isMessagePortFlowControl, "isMessagePortFlowControl");
var M = class {
  static {
    i(this, "ChunkStream");
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
    let t = h.alloc(e),
      s = 0;
    for (let r of this.chunks) {
      if (s >= e) break;
      let a = e - s,
        o = Math.min(r.byteLength, a);
      (t.set(o === r.byteLength ? r : r.slice(0, o), s), (s += o));
    }
    return t;
  }
  skip(e) {
    if (!this.read(e))
      throw new Error(`ChunkStream.skip(${e}) \u8D85\u51FA\u53EF\u8BFB\u8303\u56F4`);
  }
  read(e) {
    if (this.totalLength < e) return null;
    if (this.chunks[0].byteLength === e) {
      let r = this.chunks.shift();
      return ((this.totalLength -= e), r);
    }
    if (this.chunks[0].byteLength > e) {
      let r = this.chunks[0].slice(0, e);
      return ((this.chunks[0] = this.chunks[0].slice(e)), (this.totalLength -= e), r);
    }
    let t = h.alloc(e),
      s = 0;
    for (; s < e;) {
      let r = this.chunks[0],
        a = e - s;
      r.byteLength <= a
        ? (t.set(r, s), (s += r.byteLength), this.chunks.shift())
        : (t.set(r.slice(0, a), s), (this.chunks[0] = r.slice(a)), (s += a));
    }
    return ((this.totalLength -= e), t);
  }
};
var w = 13,
  D = class {
    constructor(e, t, s, r) {
      this.type = e;
      this.id = t;
      this.ack = s;
      this.data = r;
    }
    type;
    id;
    ack;
    data;
    static {
      i(this, "ProtocolMessage");
    }
    get byteLength() {
      return w + this.data.byteLength;
    }
  };
function writeProtocolMessage(n) {
  let e = h.alloc(w + n.data.byteLength);
  return (
    e.writeUInt8(n.type, 0),
    e.writeUInt32BE(n.id, 1),
    e.writeUInt32BE(n.ack, 5),
    e.writeUInt32BE(n.data.byteLength, 9),
    e.set(n.data, w),
    e
  );
}
i(writeProtocolMessage, "writeProtocolMessage");
var U = class {
  constructor(e) {
    this.socket = e;
    this.disposables.add(
      e.onData((t) => {
        (this.chunkStream.acceptChunk(t), this.readMessages());
      }),
    );
  }
  socket;
  static {
    i(this, "SocketProtocol");
  }
  _onMessage = new p();
  onMessage = this._onMessage.event;
  chunkStream = new M();
  disposables = new I();
  send(e) {
    this.writeMessage(new D(1, 0, 0, e));
  }
  writeMessage(e) {
    this.socket.write(writeProtocolMessage(e));
  }
  readMessages() {
    for (;;) {
      let e = this.chunkStream.peek(w);
      if (!e) break;
      let t = e.readUInt8(0),
        s = e.readUInt32BE(1),
        r = e.readUInt32BE(5),
        a = e.readUInt32BE(9),
        o = w + a;
      if (this.chunkStream.byteLength < o) break;
      if ((this.chunkStream.skip(w), a === 0)) {
        t === 1 && this._onMessage.fire(h.alloc(0));
        continue;
      }
      let c = this.chunkStream.read(a);
      if (!c)
        throw new Error(
          "SocketProtocol \u8BFB\u53D6\u5230\u5B8C\u6574\u5E27\u957F\u5EA6\u540E body \u4E0D\u5E94\u4E3A\u7A7A",
        );
      t === 1 && this._onMessage.fire(c);
    }
  }
  async drain() {
    return this.socket.drain();
  }
  dispose() {
    (this.disposables.dispose(), this._onMessage.dispose());
  }
};
var V = class {
  constructor(e) {
    this.port = e;
    ((this.handler = (t) => {
      if (isMessagePortFlowControl(t.data)) {
        this._onFlowState.fire(t.data.state);
        return;
      }
      t.data instanceof Uint8Array && this._onMessage.fire(h.wrap(t.data));
    }),
      this.port.addEventListener("message", this.handler),
      this.port.start());
  }
  port;
  static {
    i(this, "MessagePortProtocol");
  }
  _onMessage = new p();
  onMessage = this._onMessage.event;
  _onFlowState = new p();
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
var k = class {
    constructor(e) {
      this.buffer = e;
    }
    buffer;
    static {
      i(this, "BufferReader");
    }
    pos = 0;
    read(e) {
      let t = this.buffer.slice(this.pos, this.pos + e);
      return ((this.pos += t.byteLength), t);
    }
  },
  v = class {
    static {
      i(this, "BufferWriter");
    }
    buffers = [];
    get buffer() {
      return h.concat(this.buffers);
    }
    write(e) {
      this.buffers.push(e);
    }
  };
function readIntVQL(n) {
  let e = 0;
  for (let t = 0; ; t += 7) {
    let s = n.read(1);
    if (((e |= (s.buffer[0] & 127) << t), !(s.buffer[0] & 128))) return e;
  }
}
i(readIntVQL, "readIntVQL");
var oe = createOneByteBuffer(0);
function writeInt32VQL(n, e) {
  if (e === 0) {
    n.write(oe);
    return;
  }
  let t = 0;
  for (let r = e; r !== 0; r = r >>> 7) t++;
  let s = h.alloc(t);
  for (let r = 0; e !== 0; r++)
    ((s.buffer[r] = e & 127), (e = e >>> 7), e > 0 && (s.buffer[r] |= 128));
  n.write(s);
}
i(writeInt32VQL, "writeInt32VQL");
function createOneByteBuffer(n) {
  let e = h.alloc(1);
  return (e.writeUInt8(n, 0), e);
}
i(createOneByteBuffer, "createOneByteBuffer");
var S = {
    Undefined: createOneByteBuffer(0),
    String: createOneByteBuffer(1),
    Buffer: createOneByteBuffer(2),
    VSBuffer: createOneByteBuffer(3),
    Array: createOneByteBuffer(4),
    Object: createOneByteBuffer(5),
    Int: createOneByteBuffer(6),
  },
  G = "__zcode_rpc_nested_uint8array_v1",
  N = "base64";
function serialize(n, e) {
  if (typeof e > "u") n.write(S.Undefined);
  else if (typeof e == "string") {
    let t = h.fromString(e);
    (n.write(S.String), writeInt32VQL(n, t.byteLength), n.write(t));
  } else if (e instanceof h) (n.write(S.VSBuffer), writeInt32VQL(n, e.byteLength), n.write(e));
  else if (e instanceof Uint8Array) {
    let t = h.wrap(e);
    (n.write(S.Buffer), writeInt32VQL(n, t.byteLength), n.write(t));
  } else if (Array.isArray(e)) {
    (n.write(S.Array), writeInt32VQL(n, e.length));
    for (let t of e) serialize(n, t);
  } else if (typeof e == "number" && (e | 0) === e) (n.write(S.Int), writeInt32VQL(n, e));
  else {
    let t = h.fromString(JSON.stringify(e, encodeRpcJsonValue));
    (n.write(S.Object), writeInt32VQL(n, t.byteLength), n.write(t));
  }
}
i(serialize, "serialize");
function deserialize(n) {
  switch (n.read(1).readUInt8(0)) {
    case 0:
      return;
    case 1:
      return n.read(readIntVQL(n)).toString();
    case 2:
      return n.read(readIntVQL(n)).buffer;
    case 3:
      return n.read(readIntVQL(n));
    case 4: {
      let t = readIntVQL(n),
        s = [];
      for (let r = 0; r < t; r++) s.push(deserialize(n));
      return s;
    }
    case 5:
      return JSON.parse(n.read(readIntVQL(n)).toString(), decodeRpcJsonValue);
    case 6:
      return readIntVQL(n);
  }
}
i(deserialize, "deserialize");
function encodeRpcJsonValue(n, e) {
  return e instanceof Uint8Array ? { [G]: !0, [N]: bytesToBase64(e) } : e;
}
i(encodeRpcJsonValue, "encodeRpcJsonValue");
function decodeRpcJsonValue(n, e) {
  return isRpcEncodedUint8Array(e) ? base64ToBytes(e[N]) : e;
}
i(decodeRpcJsonValue, "decodeRpcJsonValue");
function isRpcEncodedUint8Array(n) {
  if (typeof n != "object" || n === null || Array.isArray(n)) return !1;
  let e = n;
  return e[G] === !0 && typeof e[N] == "string" && Object.keys(e).length === 2;
}
i(isRpcEncodedUint8Array, "isRpcEncodedUint8Array");
function bytesToBase64(n) {
  let e = globalThis.Buffer;
  if (e) return e.from(n).toString("base64");
  let t = "",
    s = 32768;
  for (let r = 0; r < n.length; r += s) {
    let a = n.subarray(r, r + s);
    t += String.fromCharCode(...a);
  }
  return globalThis.btoa(t);
}
i(bytesToBase64, "bytesToBase64");
function base64ToBytes(n) {
  let e = globalThis.Buffer;
  if (e) return new Uint8Array(e.from(n, "base64"));
  let t = globalThis.atob(n),
    s = new Uint8Array(t.length);
  for (let r = 0; r < t.length; r += 1) s[r] = t.charCodeAt(r);
  return s;
}
i(base64ToBytes, "base64ToBytes");
var B = class {
  constructor(e, t, s = 1e3, r = !1) {
    this.protocol = e;
    this.ctx = t;
    this.timeoutDelay = s;
    this.deferInit = r;
    ((this.protocolListener = this.protocol.onMessage((a) => this.onRawMessage(a))),
      this.deferInit || this.sendResponse({ type: 200 }));
  }
  protocol;
  ctx;
  timeoutDelay;
  deferInit;
  static {
    i(this, "ChannelServer");
  }
  channels = new Map();
  activeRequests = new Map();
  pendingRequests = new Map();
  protocolListener;
  ready() {
    this.sendResponse({ type: 200 });
  }
  registerChannel(e, t) {
    (this.channels.set(e, t), setTimeout(() => this.flushPendingRequests(e), 0));
  }
  sendResponse(e) {
    switch (e.type) {
      case 200:
        this.send([e.type]);
        return;
      case 201:
      case 202:
      case 204:
      case 203:
        this.send([e.type, e.id], e.data);
        return;
    }
  }
  send(e, t = void 0) {
    let s = new v();
    (serialize(s, e), serialize(s, t));
    try {
      this.protocol.send(s.buffer);
    } catch {}
  }
  onRawMessage(e) {
    let t = new k(e),
      s = deserialize(t),
      r = deserialize(t),
      a = s[0];
    switch (a) {
      case 100:
        this.onPromise({ type: a, id: s[1], channelName: s[2], name: s[3], arg: r });
        return;
      case 102:
        this.onEventListen({ type: a, id: s[1], channelName: s[2], name: s[3], arg: r });
        return;
      case 101:
      case 103:
        this.disposeActiveRequest(s[1]);
        return;
    }
  }
  onPromise(e) {
    let t = this.channels.get(e.channelName);
    if (!t) {
      this.collectPendingRequest(e);
      return;
    }
    let s = new P(),
      r;
    try {
      r = t.call(this.ctx, e.name, e.arg, s.token);
    } catch (o) {
      r = Promise.reject(o);
    }
    let a = toDisposable(() => s.cancel());
    (this.activeRequests.set(e.id, a),
      r
        .then(
          (o) => {
            this.sendResponse({ id: e.id, data: o, type: 201 });
          },
          (o) => {
            if (o instanceof Error) {
              let c = {
                  message: o.message,
                  name: o.name,
                  stack: o.stack
                    ? o.stack.split(`
`)
                    : void 0,
                },
                l = o,
                d = ["code", "data", "detail", "details", "taskId", "traceId"];
              for (let f of d) {
                let m = l[f];
                m !== void 0 && (c[f] = m);
              }
              this.sendResponse({ id: e.id, data: c, type: 202 });
              return;
            }
            this.sendResponse({ id: e.id, data: o, type: 203 });
          },
        )
        .finally(() => {
          (a.dispose(), this.activeRequests.delete(e.id));
        }));
  }
  onEventListen(e) {
    let t = this.channels.get(e.channelName);
    if (!t) {
      this.collectPendingRequest(e);
      return;
    }
    let s = t.listen(
      this.ctx,
      e.name,
      e.arg,
    )((r) => {
      this.sendResponse({ id: e.id, data: r, type: 204 });
    });
    this.activeRequests.set(e.id, s);
  }
  disposeActiveRequest(e) {
    let t = this.activeRequests.get(e);
    t && (t.dispose(), this.activeRequests.delete(e));
  }
  collectPendingRequest(e) {
    let t = this.pendingRequests.get(e.channelName) ?? [];
    t.length === 0 && this.pendingRequests.set(e.channelName, t);
    let s = setTimeout(() => {
      (console.error(`Unknown channel: ${e.channelName}`),
        e.type === 100 &&
          this.sendResponse({
            id: e.id,
            data: {
              name: "Unknown channel",
              message: `Channel name '${e.channelName}' timed out after ${this.timeoutDelay}ms`,
              stack: void 0,
            },
            type: 202,
          }));
    }, this.timeoutDelay);
    t.push({ request: e, timer: s });
  }
  flushPendingRequests(e) {
    let t = this.pendingRequests.get(e);
    if (t) {
      for (let { request: s, timer: r } of t)
        switch ((clearTimeout(r), s.type)) {
          case 100:
            this.onPromise(s);
            break;
          case 102:
            this.onEventListen(s);
            break;
        }
      this.pendingRequests.delete(e);
    }
  }
  dispose() {
    (this.protocolListener?.dispose(), (this.protocolListener = null));
    for (let e of this.activeRequests.values()) e.dispose();
    this.activeRequests.clear();
  }
};
var A = class {
  constructor(e) {
    this.protocol = e;
    this.protocolListener = this.protocol.onMessage((t) => this.onBuffer(t));
  }
  protocol;
  static {
    i(this, "ChannelClient");
  }
  state = 0;
  isDisposed = !1;
  activeRequests = new Set();
  handlers = new Map();
  lastRequestId = 0;
  protocolListener;
  _onDidInitialize = new p();
  onDidInitialize = this._onDidInitialize.event;
  getChannel(e) {
    return {
      call: i(
        (t, s, r) =>
          this.isDisposed
            ? Promise.reject(new Error("ChannelClient is disposed"))
            : this.requestPromise(e, t, s, r),
        "call",
      ),
      listen: i((t, s) => (this.isDisposed ? T.None : this.requestEvent(e, t, s)), "listen"),
    };
  }
  requestPromise(e, t, s, r = L.None) {
    let a = this.lastRequestId++;
    if (r.isCancellationRequested) return Promise.reject(new Error("Cancelled"));
    let o;
    return new Promise((l, d) => {
      let f = i(() => {
        let m = i((C) => {
          switch (C.type) {
            case 201:
              (this.handlers.delete(a), l(C.data));
              return;
            case 202: {
              this.handlers.delete(a);
              let _ = new Error(C.data.message);
              ((_.name = C.data.name),
                C.data.stack &&
                  (_.stack = C.data.stack.join(`
`)));
              let ne = ["code", "data", "detail", "details", "taskId", "traceId"];
              for (let W of ne) {
                let H = C.data[W];
                H !== void 0 && (_[W] = H);
              }
              d(_);
              return;
            }
            case 203:
              (this.handlers.delete(a), d(C.data));
              return;
          }
        }, "handler");
        (this.handlers.set(a, m), this.sendRequest(100, a, e, t, s));
      }, "doRequest");
      (this.state === 1 ? f() : this.whenInitialized().then(f),
        (o = r.onCancellationRequested(() => {
          (this.sendCancelOrDispose(101, a), d(new Error("Cancelled")));
        })),
        this.activeRequests.add(o));
    }).finally(() => {
      (o?.dispose(), o && this.activeRequests.delete(o));
    });
  }
  requestEvent(e, t, s) {
    let r = this.lastRequestId++,
      a = new p({
        onWillAddFirstListener: i(() => {
          let o = i(() => {
            (this.activeRequests.add(a), this.sendRequest(102, r, e, t, s));
          }, "doRequest");
          this.state === 1 ? o() : this.whenInitialized().then(o);
        }, "onWillAddFirstListener"),
        onDidRemoveLastListener: i(() => {
          (this.activeRequests.delete(a),
            this.sendCancelOrDispose(103, r),
            this.handlers.delete(r));
        }, "onDidRemoveLastListener"),
      });
    return (
      this.handlers.set(r, (o) => {
        a.fire(o.data);
      }),
      a.event
    );
  }
  sendRequest(e, t, s, r, a) {
    let o = new v();
    (serialize(o, [e, t, s, r]), serialize(o, a));
    try {
      this.protocol.send(o.buffer);
    } catch {}
  }
  sendCancelOrDispose(e, t) {
    let s = new v();
    (serialize(s, [e, t]), serialize(s, void 0));
    try {
      this.protocol.send(s.buffer);
    } catch {}
  }
  onBuffer(e) {
    let t = new k(e),
      s = deserialize(t),
      r = deserialize(t),
      a = s[0];
    switch (a) {
      case 200:
        this.onResponse({ type: 200 });
        return;
      case 201:
      case 202:
      case 204:
      case 203:
        this.onResponse({ type: a, id: s[1], data: r });
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
    return this.state === 1 ? Promise.resolve() : T.toPromise(this.onDidInitialize);
  }
  dispose() {
    ((this.isDisposed = !0), this.protocolListener?.dispose(), (this.protocolListener = null));
    for (let e of this.activeRequests) e.dispose();
    (this.activeRequests.clear(), this._onDidInitialize.dispose());
  }
};
var F = class {
    constructor(e, t, s) {
      this.inner = e;
      this.channelName = t;
      this.logger = s;
    }
    inner;
    channelName;
    logger;
    static {
      i(this, "LoggingServerChannel");
    }
    async call(e, t, s, r) {
      let a = performance.now();
      try {
        let o = await this.inner.call(e, t, s, r),
          c = (performance.now() - a).toFixed(1);
        return (this.logger(`[rpc:call] ${this.channelName}.${t} OK (${c}ms)`), o);
      } catch (o) {
        let c = (performance.now() - a).toFixed(1);
        throw (this.logger(`[rpc:call] ${this.channelName}.${t} FAIL (${c}ms)`, o), o);
      }
    }
    listen(e, t, s) {
      try {
        let r = this.inner.listen(e, t, s);
        return (this.logger(`[rpc:listen] ${this.channelName}.${t} subscribed`), r);
      } catch (r) {
        throw (this.logger(`[rpc:listen] ${this.channelName}.${t} FAIL`, r), r);
      }
    }
  },
  q = class {
    constructor(e, t) {
      this.inner = e;
      this.logger = t;
    }
    inner;
    logger;
    static {
      i(this, "LoggingChannelServer");
    }
    registerChannel(e, t) {
      (this.logger(`[rpc:register] channel "${e}"`),
        this.inner.registerChannel(e, new F(t, e, this.logger)));
    }
    ready() {
      this.inner.ready?.();
    }
  };
var Z = null;
function setNetworkTelemetrySink(n) {
  Z = n;
}
i(setNetworkTelemetrySink, "setNetworkTelemetrySink");
function emitNetworkTelemetryObservation(n) {
  Z?.(n);
}
i(emitNetworkTelemetryObservation, "emitNetworkTelemetryObservation");
function classifyErrorKind(n) {
  let e = n instanceof Error ? n.message.toLowerCase() : String(n).toLowerCase();
  return e.includes("timeout") || e.includes("timed out")
    ? "timeout"
    : e.includes("dns") || e.includes("getaddrinfo") || e.includes("enotfound")
      ? "dns_failure"
      : e.includes("econnreset") || e.includes("connection reset") || e.includes("econnrefused")
        ? "connection_reset"
        : "other";
}
i(classifyErrorKind, "classifyErrorKind");
function emitRpcObservation(n, e, t, s, r) {
  emitNetworkTelemetryObservation({
    transport: "rpc",
    interface: `${n}.${e}`,
    durationMs: Math.max(0, Math.round(t)),
    ok: s,
    errorKind: s ? void 0 : classifyErrorKind(r),
    attempt: 1,
  });
}
i(emitRpcObservation, "emitRpcObservation");
var O = class {
  constructor(e, t) {
    this.inner = e;
    this.channelName = t;
  }
  inner;
  channelName;
  static {
    i(this, "NetworkTelemetryServerChannel");
  }
  async call(e, t, s, r) {
    let a = performance.now();
    try {
      let o = await this.inner.call(e, t, s, r);
      return (emitRpcObservation(this.channelName, t, performance.now() - a, !0), o);
    } catch (o) {
      throw (emitRpcObservation(this.channelName, t, performance.now() - a, !1, o), o);
    }
  }
  listen(e, t, s) {
    return this.inner.listen(e, t, s);
  }
};
var z = class {
  constructor(e) {
    this.inner = e;
  }
  inner;
  static {
    i(this, "NetworkTelemetryChannelServer");
  }
  registerChannel(e, t) {
    this.inner.registerChannel(e, new O(t, e));
  }
  ready() {
    this.inner.ready?.();
  }
};
var te;
((t) => {
  function fromService(s, r) {
    let a = s,
      o = new Map();
    for (let c in a)
      isEvent(c) && !isDynamicEvent(c) && typeof a[c] == "function" && o.set(c, bufferEvent(a[c]));
    return {
      listen(c, l, d) {
        let f = o.get(l);
        if (f) return f;
        let m = a[l];
        if (typeof m == "function") {
          if (isDynamicEvent(l)) return m.call(a, d);
          if (isEvent(l)) return (o.set(l, bufferEvent(a[l])), o.get(l));
        }
        throw new Error(`Event not found: ${l}`);
      },
      call(c, l, d) {
        let f = a[l];
        if (typeof f == "function") {
          let m = f.apply(a, d || []);
          return (m instanceof Promise || (m = Promise.resolve(m)), m);
        }
        throw new Error(`Method not found: ${l}`);
      },
    };
  }
  ((t.fromService = fromService), i(fromService, "fromService"));
  function toService(s, r) {
    return new Proxy(
      {},
      {
        get(a, o, c) {
          return typeof o == "symbol"
            ? Reflect.get(a, o, c)
            : typeof o == "string"
              ? o === "then"
                ? void 0
                : isDynamicEvent(o)
                  ? (l) => s.listen(o, l)
                  : isEvent(o)
                    ? s.listen(o)
                    : async (...l) => {
                        let d = r?.context !== void 0 ? [r.context, ...l] : l;
                        return s.call(o, d);
                      }
              : Reflect.get(a, o, c);
        },
      },
    );
  }
  ((t.toService = toService), i(toService, "toService"));
})((te ||= {}));
function isEvent(n) {
  return (
    n.length >= 3 && n[0] === "o" && n[1] === "n" && n.charCodeAt(2) >= 65 && n.charCodeAt(2) <= 90
  );
}
i(isEvent, "isEvent");
function isDynamicEvent(n) {
  return (
    n.length >= 10 && n.startsWith("onDynamic") && n.charCodeAt(9) >= 65 && n.charCodeAt(9) <= 90
  );
}
i(isDynamicEvent, "isDynamicEvent");
function bufferEvent(n) {
  let e = [],
    t = !1,
    s,
    r = new p({
      onWillAddFirstListener: i(() => {
        s = n((o) => {
          t ? r.fire(o) : e.push(o);
        });
      }, "onWillAddFirstListener"),
      onDidRemoveLastListener: i(() => {
        (s?.dispose(), (s = void 0), (e = []));
      }, "onDidRemoveLastListener"),
    }),
    a = r.event;
  return (o) => {
    let c = a(o);
    if (!t) {
      t = !0;
      for (let l of e) r.fire(l);
      e = [];
    }
    return c;
  };
}
i(bufferEvent, "bufferEvent");
export {
  i as a,
  be as b,
  T as c,
  p as d,
  h as e,
  U as f,
  V as g,
  B as h,
  A as i,
  te as j,
  q as k,
  setNetworkTelemetrySink as l,
  emitNetworkTelemetryObservation as m,
  z as n,
};
