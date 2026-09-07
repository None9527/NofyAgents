// P1b 观测件（probe9）：把 renderer→host 的 `nofy-agent` 通道调用序列录下来。
//
// 为什么需要它：会话面的真实合同不是猜出来的。host 的 createZCodeAgentService
// 有上百个方法，renderer 实际用到的是哪一个子集、按什么顺序、传什么参数、
// 消费返回值的哪些字段——只有把真跑起来的调用录下来才算数。
//
// 默认关闭（NOFY_OBS_AGENT 未置位时原样返回服务对象，零开销、零行为差异）。
// 开启后只读不改：每个方法调用前后各写一行 JSONL，emitter 订阅透传并记录推送。
import fs from "node:fs";
import path from "node:path";

const ENABLED = ["1", "true", "yes"].includes(String(process.env.NOFY_OBS_AGENT ?? "").toLowerCase());
const LOG_PATH = process.env.NOFY_OBS_AGENT_FILE || "/tmp/nofy-obs/agent-calls.jsonl";
const MAX_JSON = 6000;

let stream = null;
let seq = 0;
let callSeq = 0;

function ensureStream() {
  if (stream) return stream;
  try {
    fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
    stream = fs.createWriteStream(LOG_PATH, { flags: "a" });
  } catch {
    stream = null;
  }
  return stream;
}

function write(rec) {
  const s = ensureStream();
  if (!s) return;
  try {
    s.write(JSON.stringify({ seq: ++seq, t: Date.now(), ...rec }) + "\n");
  } catch {}
}

function clip(text, max = MAX_JSON) {
  const s = String(text);
  return s.length > max ? s.slice(0, max) + `…(+${s.length - max})` : s;
}

function safeJson(value) {
  const seen = new WeakSet();
  try {
    return JSON.stringify(
      value,
      (key, val) => {
        if (typeof val === "function") return `[fn ${val.name || "anonymous"}]`;
        if (val && typeof val === "object") {
          if (seen.has(val)) return "[circular]";
          seen.add(val);
        }
        return val;
      },
      0,
    );
  } catch (err) {
    return `[unserializable: ${err && err.message}]`;
  }
}

// 结构摘要：只看形状（键名/数组长度/标量类型），用于返回值的合同比对。
function shapeOf(value, depth = 0) {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  const t = typeof value;
  if (t === "string") return value.length <= 48 ? `str(${JSON.stringify(value)})` : `str#${value.length}`;
  if (t === "number" || t === "boolean") return `${t}(${value})`;
  if (t === "function") return `fn(${value.name || "anonymous"})`;
  if (depth >= 3) return t;
  if (Array.isArray(value)) {
    return value.length === 0 ? "[]" : `[${value.length}]${shapeOf(value[0], depth + 1)}`;
  }
  const keys = Object.keys(value);
  if (keys.length === 0) return "{}";
  if (keys.length > 24) return `{${keys.length} keys}`;
  return `{${keys.map((k) => `${k}:${shapeOf(value[k], depth + 1)}`).join(",")}}`;
}

function isEmitterAccessor(name) {
  return /^on[A-Z]/.test(name);
}

/**
 * 包装 host 通道服务对象，录制 renderer 的调用与推送。
 * @param {object} service 原始服务对象
 * @param {string} label 通道名（写入日志便于多通道并录）
 */
export function observeChannelService(service, label) {
  if (!ENABLED || !service || typeof service !== "object") return service;
  write({ kind: "observer-attached", channel: label, methods: Object.keys(service).sort() });
  return new Proxy(service, {
    get(target, prop) {
      const value = Reflect.get(target, prop, target);
      if (typeof prop !== "string" || typeof value !== "function") return value;
      if (prop === "then" || prop === "constructor") return value;

      if (isEmitterAccessor(prop)) {
        return (...accessorArgs) => {
          const subscribe = value.apply(target, accessorArgs);
          write({
            kind: "emitter-access",
            channel: label,
            method: prop,
            args: clip(safeJson(accessorArgs)),
            subscribeType: typeof subscribe,
          });
          if (typeof subscribe !== "function") return subscribe;
          return (listener, thisArg, disposables) =>
            subscribe(
              (payload) => {
                write({
                  kind: "emitter-push",
                  channel: label,
                  method: prop,
                  shape: shapeOf(payload),
                  payload: clip(safeJson(payload)),
                });
                return typeof listener === "function" ? listener(payload) : undefined;
              },
              thisArg,
              disposables,
            );
        };
      }

      // 不改变同步/异步语义：只在返回值确实是 thenable 时才挂接记录。
      return (...args) => {
        const callId = ++callSeq;
        write({ kind: "call", channel: label, method: prop, callId, args: clip(safeJson(args)) });
        const logError = (err) => {
          write({
            kind: "error",
            channel: label,
            method: prop,
            callId,
            message: clip(err && err.message ? err.message : String(err), 1200),
            name: err && err.name,
            code: err && (err.code ?? err?.data?.code),
          });
        };
        const logResult = (result) => {
          write({
            kind: "result",
            channel: label,
            method: prop,
            callId,
            shape: shapeOf(result),
            result: clip(safeJson(result), 3000),
          });
          return result;
        };
        try {
          const result = value.apply(target, args);
          if (result && typeof result.then === "function") return result.then(logResult, (err) => { logError(err); throw err; });
          return logResult(result);
        } catch (err) {
          logError(err);
          throw err;
        }
      };
    },
  });
}

export const agentServiceObserverEnabled = ENABLED;
