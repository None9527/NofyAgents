import { Be as k, Jc as D, ye as w, ze as x } from "./chunk-O5YHTQBW.js";
import { a as A, b as K, c as L, d as T } from "./chunk-LMFUAIJT.js";
import { a as s, d as F } from "./chunk-LVLFJXEE.js";
import { Client as re } from "ssh2";
import { createReadStream as B } from "fs";
import { posix as V } from "path";
function isMissingPrivateKeyPassphraseMessage(t) {
  return /encrypted .*private .*key detected, but no passphrase given/i.test(t);
}
s(isMissingPrivateKeyPassphraseMessage, "isMissingPrivateKeyPassphraseMessage");
function isInvalidPrivateKeyPassphraseMessage(t) {
  return /(bad passphrase|key integrity check failed|unable to authenticate data)/i.test(t);
}
s(isInvalidPrivateKeyPassphraseMessage, "isInvalidPrivateKeyPassphraseMessage");
function buildSSHConnectConfig(t) {
  let e = typeof t.password == "string" && t.password.length > 0,
    r = t.agent ?? (e ? void 0 : process.env.SSH_AUTH_SOCK);
  return {
    host: t.host,
    port: t.port ?? 22,
    username: t.username,
    privateKey: t.privateKey,
    passphrase: t.passphrase,
    password: e ? t.password : void 0,
    agent: r,
    readyTimeout: 6e4,
    keepaliveInterval: 15e3,
    keepaliveCountMax: 3,
    tryKeyboard: e,
  };
}
s(buildSSHConnectConfig, "buildSSHConnectConfig");
function createKeyboardInteractiveResponder(t) {
  return (e, r, n, o, i) => {
    if (!t || o.length === 0) {
      i([]);
      return;
    }
    i(o.map(() => t));
  };
}
s(createKeyboardInteractiveResponder, "createKeyboardInteractiveResponder");
function normalizeSSHConnectError(t) {
  return typeof t == "object" && t !== null && "level" in t && t.level === "client-authentication"
    ? new Error(
        "SSH \u8BA4\u8BC1\u5931\u8D25\uFF1A\u8BF7\u68C0\u67E5\u7528\u6237\u540D\u3001\u5BC6\u7801\u6216\u79C1\u94A5\u914D\u7F6E",
      )
    : typeof t == "object" && t !== null && "level" in t && t.level === "client-timeout"
      ? new Error(
          `SSH \u8FDE\u63A5\u63E1\u624B\u8D85\u65F6\uFF1A\u672A\u80FD\u5728 ${6e4 / 1e3} \u79D2\u5185\u5EFA\u7ACB SSH \u4F1A\u8BDD\uFF0C\u8BF7\u68C0\u67E5\u7F51\u7EDC\u3001\u670D\u52A1\u5668 SSH \u670D\u52A1\u6216\u7EC8\u7AEF SSH \u914D\u7F6E\u5DEE\u5F02`,
        )
      : t instanceof Error
        ? isMissingPrivateKeyPassphraseMessage(t.message)
          ? new Error(
              "SSH \u79C1\u94A5\u9700\u8981\u53E3\u4EE4\uFF1A\u68C0\u6D4B\u5230\u52A0\u5BC6\u79C1\u94A5\uFF0C\u4F46\u5F53\u524D\u672A\u63D0\u4F9B\u79C1\u94A5\u53E3\u4EE4",
            )
          : isInvalidPrivateKeyPassphraseMessage(t.message)
            ? new Error(
                "SSH \u79C1\u94A5\u53E3\u4EE4\u9519\u8BEF\uFF1A\u65E0\u6CD5\u89E3\u5BC6\u79C1\u94A5\uFF0C\u8BF7\u68C0\u67E5\u79C1\u94A5\u53E3\u4EE4\u662F\u5426\u6B63\u786E",
              )
            : t
        : typeof t == "string" && t.length > 0
          ? new Error(t)
          : new Error("SSH \u8FDE\u63A5\u5931\u8D25");
}
s(normalizeSSHConnectError, "normalizeSSHConnectError");
import { stat as q } from "fs/promises";
import { posix as Z } from "path";
var Q = 1e3,
  ee = 5,
  te = {
    0: "OK",
    1: "EOF",
    2: "NO_SUCH_FILE",
    3: "PERMISSION_DENIED",
    4: "FAILURE",
    5: "BAD_MESSAGE",
    6: "NO_CONNECTION",
    7: "CONNECTION_LOST",
    8: "OP_UNSUPPORTED",
  };
function bytesToMB(t) {
  return t / (1024 * 1024);
}
s(bytesToMB, "bytesToMB");
async function readLocalFileSize(t) {
  try {
    let e = await q(t);
    return e.isFile() ? e.size : null;
  } catch {
    return null;
  }
}
s(readLocalFileSize, "readLocalFileSize");
function formatSSHUploadLabel(t) {
  return Z.basename(t);
}
s(formatSSHUploadLabel, "formatSSHUploadLabel");
function formatSSHUploadError(t) {
  if (t instanceof Error) {
    let e = t;
    if (typeof e.code == "number") return `${te[e.code] ?? "UNKNOWN"}(code=${e.code})`;
    if (e.message) return e.message;
  }
  if (typeof t == "string" && t.trim().length > 0) return t.trim();
  try {
    return JSON.stringify(t);
  } catch {
    return String(t);
  }
}
s(formatSSHUploadError, "formatSSHUploadError");
function createSSHUploadProgressReporter(t, e, r) {
  let n = Date.now(),
    o = 0,
    i = 0,
    p = -1;
  return (l, f) => {
    let c = Date.now(),
      v = Math.max((c - n) / 1e3, 0.001),
      a = bytesToMB(l) / v,
      m = bytesToMB(l),
      S = r != null ? bytesToMB(r) : null,
      d = r != null && r > 0 ? Math.min((l / r) * 100, 100) : null,
      h = c - o >= Q,
      E = d != null && d - i >= ee,
      b = d != null && d >= 100;
    (!f && !h && !E && !b) ||
      (f && l === p && (d == null || d <= i)) ||
      (S != null && d != null
        ? console.log(
            `[ssh] upload progress [${t}] (${e}): ${d.toFixed(1)}% (${m.toFixed(1)}/${S.toFixed(1)} MB, ${a.toFixed(2)} MB/s)`,
          )
        : console.log(
            `[ssh] upload progress [${t}] (${e}): ${m.toFixed(1)} MB (total unknown, ${a.toFixed(2)} MB/s)`,
          ),
      (o = c),
      (p = l),
      d != null && (i = d));
  };
}
s(createSSHUploadProgressReporter, "createSSHUploadProgressReporter");
function normalizeUnknownError(t, e) {
  return t instanceof Error
    ? t
    : typeof t == "string" && t.length > 0
      ? new Error(t)
      : new Error(e);
}
s(normalizeUnknownError, "normalizeUnknownError");
function markSSHUploadFailure(t, e, r) {
  let n = normalizeUnknownError(t, r);
  return ((n.uploadFailureKind = e), n);
}
s(markSSHUploadFailure, "markSSHUploadFailure");
function shouldLogSSHDebugMessage(t) {
  return !/\bCHANNEL_(?:DATA|EXTENDED_DATA|WINDOW_ADJUST)\b/u.test(t);
}
s(shouldLogSSHDebugMessage, "shouldLogSSHDebugMessage");
function createUploadAbortError() {
  let t = new Error("Remote upload canceled");
  return ((t.name = "AbortError"), t);
}
s(createUploadAbortError, "createUploadAbortError");
function throwIfUploadAborted(t) {
  if (t?.aborted) throw createUploadAbortError();
}
s(throwIfUploadAborted, "throwIfUploadAborted");
var J = class {
  static {
    s(this, "SSHBackend");
  }
  client;
  connected = !1;
  config;
  homeDirPromise = null;
  execUploadOnly = !1;
  disposed = !1;
  hasEverConnected = !1;
  disconnectReported = !1;
  disconnectEmitter = new F();
  onDidDisconnect = this.disconnectEmitter.event;
  onClientError = s((e) => {
    let r = normalizeSSHConnectError(e);
    (console.error("[ssh] client error:", r), this.reportDisconnect("error", r));
  }, "onClientError");
  onClientClose = s(() => {
    this.reportDisconnect("close");
  }, "onClientClose");
  onClientEnd = s(() => {
    this.reportDisconnect("end");
  }, "onClientEnd");
  constructor(e) {
    ((this.client = new re()),
      this.client.on("error", this.onClientError),
      this.client.on("close", this.onClientClose),
      this.client.on("end", this.onClientEnd),
      (this.config = buildSSHConnectConfig({
        host: e.host,
        port: e.port,
        username: e.username,
        privateKey: e.privateKey,
        passphrase: e.privateKeyPassphrase,
        password: e.password,
        agent: e.agent,
      })),
      D(process.env) === "development" &&
        (this.config.debug = (r) => {
          shouldLogSSHDebugMessage(r) && console.debug(`[ssh2] ${r}`);
        }),
      typeof e.password == "string" &&
        e.password.length > 0 &&
        this.client.on("keyboard-interactive", createKeyboardInteractiveResponder(e.password)));
  }
  async ensureConnected() {
    if (!this.connected)
      return new Promise((e, r) => {
        let n = s(() => {
            (this.client.off("error", o),
              (this.connected = !0),
              (this.hasEverConnected = !0),
              (this.disconnectReported = !1),
              e());
          }, "handleReady"),
          o = s((i) => {
            (this.client.off("ready", n), r(normalizeSSHConnectError(i)));
          }, "handleConnectError");
        (this.client.once("ready", n),
          this.client.once("error", o),
          this.client.connect(this.config));
      });
  }
  reportDisconnect(e, r) {
    let n = !this.disposed && !this.disconnectReported && (this.connected || this.hasEverConnected);
    ((this.connected = !1),
      (this.homeDirPromise = null),
      n &&
        ((this.disconnectReported = !0),
        this.disconnectEmitter.fire(r ? { reason: e, error: r } : { reason: e })));
  }
  async detect() {
    await this.ensureConnected();
    let e = A(await this.execSimple("uname -s")),
      r = K(await this.execSimple("uname -m")),
      n = await this.readKernelOstype(),
      o = L(e, n);
    return (
      o !== e &&
        console.warn(
          `[ssh] detect: uname reported ${e}, but kernel ostype is ${n}; fallback to ${o}`,
        ),
      { platform: o, arch: r }
    );
  }
  async upload(e, r, n) {
    (throwIfUploadAborted(n?.signal), await this.ensureConnected());
    let o = await this.resolveRemotePath(r),
      i = formatSSHUploadLabel(o);
    console.log(`[ssh] upload: resolved ${i} to ${o}`);
    let p = V.dirname(o);
    if ((await this.execSimple(`mkdir -p ${w(p)}`), this.execUploadOnly)) {
      await this.uploadViaExec(e, o, n);
      return;
    }
    try {
      await this.uploadViaSftp(e, o, n);
    } catch (l) {
      if (!this.shouldFallbackToExecUpload(l)) throw l;
      ((this.execUploadOnly = !0),
        console.warn(
          `[ssh] upload: switching ${i} from sftp to exec pipe after ${this.describeUploadFailure(l)}`,
        ),
        await this.uploadViaExec(e, o, n));
    }
  }
  async exec(e) {
    return (
      await this.ensureConnected(),
      new Promise((r, n) => {
        this.client.exec(x(e), (o, i) => {
          if (o) return n(o);
          let p = T(),
            l = !1,
            f = s((c) => {
              l ||
                ((l = !0),
                c !== 0 && console.warn(`[ssh] exec channel failed: code=${c}`),
                p.fire(c ?? 0));
            }, "fireOnce");
          (i.on("exit", (c) => {
            f(c ?? 0);
          }),
            i.on("close", () => {
              f(0);
            }),
            r({ stdin: i.stdin, stdout: i, stderr: i.stderr, onClose: p.event }));
        });
      })
    );
  }
  async exists(e) {
    try {
      let r = await this.resolveRemotePath(e);
      return (await this.execSimple(`test -f ${w(r)} && printf OK`)).trim() === "OK";
    } catch {
      return !1;
    }
  }
  async readFile(e) {
    let r = await this.resolveRemotePath(e);
    return this.execSimple(`cat ${w(r)}`);
  }
  execSimple(e) {
    return new Promise((r, n) => {
      this.client.exec(x(e), (o, i) => {
        if (o) return n(o);
        let p = "",
          l = "",
          f = !1,
          c = null;
        (i.on("data", (a) => {
          p += a.toString();
        }),
          i.stderr.on("data", (a) => {
            l += a.toString();
          }));
        let v = s((a) => {
          f || ((f = !0), a !== 0 ? n(new Error(`Command failed (code ${a}): ${l || p}`)) : r(p));
        }, "finish");
        (i.on("exit", (a) => {
          c = a ?? 0;
        }),
          i.on("close", (a) => {
            v(c ?? a ?? 0);
          }));
      });
    });
  }
  async resolveHomeDir() {
    return this.homeDirPromise
      ? this.homeDirPromise
      : ((this.homeDirPromise = this.execSimple('printf %s "$HOME"').then((e) => e.trim())),
        this.homeDirPromise);
  }
  async readKernelOstype() {
    try {
      return (
        await this.execSimple(
          "if [ -r /proc/sys/kernel/ostype ]; then cat /proc/sys/kernel/ostype; fi",
        )
      ).trim();
    } catch {
      return "";
    }
  }
  shouldFallbackToExecUpload(e) {
    let r = e?.uploadFailureKind;
    return r === "sftp-session" || r === "sftp-write";
  }
  describeUploadFailure(e) {
    let r = e?.uploadFailureKind,
      n = formatSSHUploadError(e);
    return r ? `${r} failure (${n})` : n;
  }
  async uploadViaSftp(e, r, n) {
    let o = formatSSHUploadLabel(r),
      i = await readLocalFileSize(e),
      p = createSSHUploadProgressReporter("sftp", o, i),
      l = s((f, c) => {
        (p(f, c), n?.onProgress?.({ uploadedBytes: f, totalBytes: i ?? 0 }));
      }, "reportProgress");
    return new Promise((f, c) => {
      this.client.sftp((v, a) => {
        if (v) {
          c(markSSHUploadFailure(v, "sftp-session", "Failed to open SFTP session"));
          return;
        }
        console.log(`[ssh] upload: started via sftp for ${o} (${e} -> ${r})`);
        let m = B(e),
          S = a.createWriteStream(r),
          d = 0,
          h = !1,
          E = !1,
          b = s(() => {
            h ||
              ((h = !0),
              n?.signal?.removeEventListener("abort", u),
              l(d, !0),
              console.log(`[ssh] upload: completed via sftp for ${o}`),
              a.end(),
              f());
          }, "resolveOnce"),
          y = s((g, G, X) => {
            if (h) return;
            ((h = !0),
              n?.signal?.removeEventListener("abort", u),
              (E = !0),
              m.unpipe(S),
              m.destroy());
            let O = S;
            (typeof O.destroy == "function" && O.destroy(),
              a.end(),
              c(markSSHUploadFailure(g, G, X)));
          }, "rejectOnce"),
          u = s(() => {
            y(createUploadAbortError(), "aborted", "Remote upload canceled");
          }, "abortOnce");
        if (n?.signal?.aborted) {
          u();
          return;
        }
        (n?.signal?.addEventListener("abort", u, { once: !0 }),
          m.on("data", (g) => {
            h || ((d += g.length), l(d, !1));
          }),
          S.on("close", b),
          S.on("error", (g) => {
            h || E || y(g, "sftp-write", `Failed to write ${r} over SFTP`);
          }),
          m.on("error", (g) => {
            h ||
              E ||
              (console.error(
                `[ssh] upload: local read failed for ${o}: ${formatSSHUploadError(g)}`,
              ),
              y(g, "local-read", `Failed to read local file ${e}`));
          }),
          m.pipe(S));
      });
    });
  }
  async uploadViaExec(e, r, n) {
    let o = formatSSHUploadLabel(r),
      i = await readLocalFileSize(e),
      p = createSSHUploadProgressReporter("exec", o, i),
      l = s((a, m) => {
        (p(a, m), n?.onProgress?.({ uploadedBytes: a, totalBytes: i ?? 0 }));
      }, "reportProgress");
    throwIfUploadAborted(n?.signal);
    let f = V.dirname(r),
      c = `mkdir -p ${w(f)} && cat > ${w(r)}`;
    console.log(`[ssh] upload: started via exec pipe for ${o} (${e} -> ${r})`);
    let v = await this.exec(c);
    await new Promise((a, m) => {
      let S = B(e),
        d = v.stdin,
        h = 0,
        E = !1,
        b = s((u) => {
          if (E) return;
          ((E = !0), n?.signal?.removeEventListener("abort", y), S.destroy());
          let g = d;
          (typeof g.destroy == "function" ? g.destroy(u) : d.end(), m(u));
        }, "finishWithError"),
        y = s(() => b(createUploadAbortError()), "abortOnce");
      if (n?.signal?.aborted) {
        y();
        return;
      }
      (n?.signal?.addEventListener("abort", y, { once: !0 }),
        S.on("error", (u) => b(u)),
        S.on("data", (u) => {
          ((h += u.length), l(h, !1));
        }),
        d.on("error", (u) => b(u)),
        S.pipe(d),
        v.onClose((u) => {
          if (!E) {
            if (((E = !0), n?.signal?.removeEventListener("abort", y), l(h, !0), u !== 0)) {
              (console.error(`[ssh] upload: exec pipe failed for ${o}: exit code ${u}`),
                m(new Error(`SSH exec upload failed with exit code ${u}`)));
              return;
            }
            (console.log(`[ssh] upload: completed via exec pipe for ${o}`), a());
          }
        }));
    });
  }
  async resolveRemotePath(e) {
    let r = await this.resolveHomeDir();
    return k(e, r);
  }
  dispose() {
    ((this.disposed = !0),
      this.client.off("error", this.onClientError),
      this.client.off("close", this.onClientClose),
      this.client.off("end", this.onClientEnd),
      this.client.end(),
      (this.connected = !1),
      this.disconnectEmitter.dispose());
  }
};
export { J as SSHBackend };
