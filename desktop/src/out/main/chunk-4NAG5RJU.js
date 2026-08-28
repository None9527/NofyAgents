import { a as i, k as b, l as x, m as y, n as P } from "./chunk-LQDBAECE.js";
import { spawn as W, execFile as R } from "child_process";
import { createReadStream as q } from "fs";
import { stat as T } from "fs/promises";
import { execFile as B } from "child_process";
import { accessSync as F, constants as L } from "fs";
import { homedir as _ } from "os";
import { posix as C, win32 as J } from "path";
var k = "docker",
  K = 8 * 1024 * 1024;
function normalizeDockerOutput(o) {
  return o.replace(/\r/g, "");
}
i(normalizeDockerOutput, "normalizeDockerOutput");
function defaultIsExecutable(o) {
  try {
    return (F(o, L.X_OK), !0);
  } catch {
    return !1;
  }
}
i(defaultIsExecutable, "defaultIsExecutable");
function getPathDelimiter(o) {
  return o === "win32" ? ";" : ":";
}
i(getPathDelimiter, "getPathDelimiter");
function joinExecutablePath(o, e, r) {
  return o === "win32" ? J.join(e, r) : C.join(e, r);
}
i(joinExecutablePath, "joinExecutablePath");
function getDockerExecutableNames(o) {
  return o === "win32" ? ["docker.exe", "docker.cmd", "docker.bat", k] : [k];
}
i(getDockerExecutableNames, "getDockerExecutableNames");
function getFallbackDockerCommands(o, e) {
  return o === "darwin"
    ? [
        "/usr/local/bin/docker",
        "/opt/homebrew/bin/docker",
        "/Applications/OrbStack.app/Contents/MacOS/xbin/docker",
        C.join(e, ".orbstack/bin/docker"),
        "/Applications/Docker.app/Contents/Resources/bin/docker",
      ]
    : o === "linux"
      ? ["/usr/local/bin/docker", "/usr/bin/docker", "/snap/bin/docker"]
      : o === "win32"
        ? [
            "C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe",
            "C:\\ProgramData\\DockerDesktop\\version-bin\\docker.exe",
          ]
        : [];
}
i(getFallbackDockerCommands, "getFallbackDockerCommands");
function resolveDockerCommand(o = {}) {
  let e = o.platform ?? process.platform,
    r = o.env ?? process.env,
    t = o.isExecutable ?? defaultIsExecutable,
    s = r.PATH ?? "",
    n = getPathDelimiter(e);
  for (let a of s.split(n)) {
    let c = a.trim();
    if (c)
      for (let m of getDockerExecutableNames(e)) {
        let l = joinExecutablePath(e, c, m);
        if (t(l)) return l;
      }
  }
  for (let a of getFallbackDockerCommands(e, o.homeDir ?? _())) if (t(a)) return a;
  return k;
}
i(resolveDockerCommand, "resolveDockerCommand");
async function execDocker(o) {
  return new Promise((e, r) => {
    B(resolveDockerCommand(), o, { encoding: "utf8", maxBuffer: K, windowsHide: !0 }, (t, s, n) => {
      if (t) {
        r(new Error(normalizeDockerOutput(n).trim() || t.message));
        return;
      }
      e(normalizeDockerOutput(s));
    });
  });
}
i(execDocker, "execDocker");
function parseDockerContainerList(o) {
  return normalizeDockerOutput(o)
    .split(
      `
`,
    )
    .map((e) => e.trim())
    .filter((e) => e.length > 0)
    .flatMap((e) => {
      try {
        let r = JSON.parse(e);
        return !r.ID || !r.Names
          ? []
          : [
              {
                id: r.ID,
                image: r.Image ?? "",
                name: r.Names,
                state: r.State ?? "",
                status: r.Status ?? "",
              },
            ];
      } catch {
        return [];
      }
    });
}
i(parseDockerContainerList, "parseDockerContainerList");
async function isDockerAvailable() {
  try {
    return (await execDocker(["version", "--format", "{{.Server.Version}}"]), !0);
  } catch {
    return !1;
  }
}
i(isDockerAvailable, "isDockerAvailable");
async function listDockerContainers(o) {
  let e = ["ps"];
  (o?.all && e.push("-a"), e.push("--format", "{{json .}}"));
  let r = await execDocker(e);
  return parseDockerContainerList(r);
}
i(listDockerContainers, "listDockerContainers");
var O = 8 * 1024 * 1024;
function quotePosixShellArg(o) {
  return `'${o.replaceAll("'", `'"'"'`)}'`;
}
i(quotePosixShellArg, "quotePosixShellArg");
function p(o) {
  return o.replace(/\r/g, "");
}
i(p, "normalizeDockerOutput");
function buildDockerExecArgs(o, e) {
  return ["exec", "-i", o, ...e];
}
i(buildDockerExecArgs, "buildDockerExecArgs");
var $ = class {
  static {
    i(this, "DockerBackend");
  }
  dockerCommand = resolveDockerCommand();
  options;
  resolvedInfoPromise = null;
  constructor(e) {
    this.options = e;
  }
  async detect() {
    await this.ensureAvailable();
    let e = b(p(await this.execSimple("uname -s"))),
      r = x(p(await this.execSimple("uname -m"))),
      t = await this.readKernelOstype(),
      s = y(e, t);
    return (
      s !== e &&
        console.warn(
          `[docker] detect: uname reported ${e}, but kernel ostype is ${t}; fallback to ${s}`,
        ),
      { platform: s, arch: r }
    );
  }
  async upload(e, r, t) {
    await this.ensureAvailable();
    let s = await this.resolveInfo(),
      n = this.resolveLinuxPath(r, s.homeDir),
      a = this.dirname(n);
    if ((await this.execSimple(`mkdir -p ${quotePosixShellArg(a)}`), t?.onProgress || t?.signal)) {
      await this.uploadViaExec(e, n, t);
      return;
    }
    await new Promise((c, m) => {
      R(
        this.dockerCommand,
        ["cp", e, `${s.containerName}:${n}`],
        { encoding: "utf8", maxBuffer: O, windowsHide: !0 },
        (l, g, u) => {
          if (l) {
            m(new Error(p(u).trim() || l.message));
            return;
          }
          c();
        },
      );
    });
  }
  async uploadViaExec(e, r, t) {
    let s = await T(e).then((a) => a.size);
    if (t.signal?.aborted) {
      let a = new Error("Remote upload canceled");
      throw ((a.name = "AbortError"), a);
    }
    let n = await this.exec(`cat > ${quotePosixShellArg(r)}`);
    await new Promise((a, c) => {
      let m = q(e),
        l = n.stdin,
        g = 0,
        u = !1,
        f = i((d) => {
          if (u) return;
          ((u = !0), t.signal?.removeEventListener("abort", v), m.destroy(), l.destroy?.(d), c(d));
        }, "finishError"),
        v = i(() => {
          let d = new Error("Remote upload canceled");
          ((d.name = "AbortError"), f(d));
        }, "abort");
      (t.signal?.addEventListener("abort", v, { once: !0 }),
        m.on("data", (d) => {
          ((g += d.length), t.onProgress?.({ uploadedBytes: g, totalBytes: s }));
        }),
        m.on("error", f),
        l.on("error", f),
        n.onClose((d) => {
          if (!u) {
            if (((u = !0), t.signal?.removeEventListener("abort", v), d !== 0)) {
              c(new Error(`Docker upload failed with exit code ${d}`));
              return;
            }
            (t.onProgress?.({ uploadedBytes: s, totalBytes: s }), a());
          }
        }),
        m.pipe(l));
    });
  }
  async exec(e) {
    await this.ensureAvailable();
    let r = await this.resolveInfo();
    return new Promise((t, s) => {
      let n = W(this.dockerCommand, buildDockerExecArgs(r.containerName, ["sh", "-lc", e]), {
        stdio: "pipe",
        windowsHide: !0,
      });
      (n.once("error", s),
        n.once("spawn", () => {
          let a = n.stdin,
            c = n.stdout,
            m = n.stderr;
          if (!a || !c || !m) {
            s(new Error("Docker exec stdio is not available"));
            return;
          }
          let l = P(),
            g = !1,
            u = i((f) => {
              g || ((g = !0), l.fire(f));
            }, "fireOnce");
          (n.on("exit", (f) => {
            u(f ?? 0);
          }),
            n.on("close", (f) => {
              u(f ?? 0);
            }),
            t({ stdin: a, stdout: c, stderr: m, onClose: l.event }));
        }));
    });
  }
  async exists(e) {
    try {
      let r = await this.resolveInfo(),
        t = this.resolveLinuxPath(e, r.homeDir);
      return (await this.execSimple(`test -f ${quotePosixShellArg(t)} && printf OK`), !0);
    } catch {
      return !1;
    }
  }
  async readFile(e) {
    let r = await this.resolveInfo(),
      t = this.resolveLinuxPath(e, r.homeDir);
    return p(await this.execSimple(`cat ${quotePosixShellArg(t)}`));
  }
  dispose() {}
  async ensureAvailable() {
    if (!(await isDockerAvailable()))
      throw new Error(
        "\u5F53\u524D\u7CFB\u7EDF\u672A\u68C0\u6D4B\u5230\u53EF\u7528\u7684 Docker \u73AF\u5883",
      );
  }
  async resolveInfo() {
    return this.resolvedInfoPromise
      ? this.resolvedInfoPromise
      : ((this.resolvedInfoPromise = (async () => {
          let e = await this.resolveContainer(),
            r = p(await this.execDirect(["sh", "-lc", "printf %s ~"])).trim();
          return { containerName: e.name, homeDir: r };
        })()),
        this.resolvedInfoPromise);
  }
  async resolveContainer() {
    let r = (await listDockerContainers({ all: !0 })).find(
      (t) =>
        t.name === this.options.container ||
        t.id === this.options.container ||
        t.id.startsWith(this.options.container),
    );
    if (!r)
      throw new Error(
        `\u672A\u627E\u5230\u540D\u4E3A ${this.options.container} \u7684 Docker \u5BB9\u5668`,
      );
    if (r.state.toLowerCase() !== "running")
      throw new Error(
        `Docker \u5BB9\u5668 ${r.name} \u5F53\u524D\u672A\u8FD0\u884C\uFF08state=${r.state || "unknown"}\uFF09`,
      );
    return r;
  }
  resolveLinuxPath(e, r) {
    return e === "~" ? r : e.startsWith("~/") ? `${r.replace(/\/$/, "")}/${e.slice(2)}` : e;
  }
  dirname(e) {
    let r = e.replace(/\/+/g, "/"),
      t = r.lastIndexOf("/");
    return t <= 0 ? "/" : r.slice(0, t);
  }
  async execSimple(e) {
    return this.execDirect(["sh", "-lc", e]);
  }
  async readKernelOstype() {
    try {
      return p(
        await this.execSimple(
          "if [ -r /proc/sys/kernel/ostype ]; then cat /proc/sys/kernel/ostype; fi",
        ),
      ).trim();
    } catch {
      return "";
    }
  }
  async execDirect(e) {
    let r = await this.resolveContainer();
    return new Promise((t, s) => {
      R(
        this.dockerCommand,
        buildDockerExecArgs(r.name, e),
        { encoding: "utf8", maxBuffer: O, windowsHide: !0 },
        (n, a, c) => {
          if (n) {
            s(new Error(p(c).trim() || n.message));
            return;
          }
          t(p(a));
        },
      );
    });
  }
};
export { parseDockerContainerList as a, isDockerAvailable as b, listDockerContainers as c, $ as d };
