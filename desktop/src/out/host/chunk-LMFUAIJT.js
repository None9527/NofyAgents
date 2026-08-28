import { a as t, d as s } from "./chunk-LVLFJXEE.js";
function normalizeToken(e) {
  return e.trim().toLowerCase();
}
t(normalizeToken, "normalizeToken");
function normalizeRemotePlatform(e) {
  let r = normalizeToken(e);
  return r === "darwin" || r === "macos"
    ? "darwin"
    : r === "linux" || r === "gnu/linux"
      ? "linux"
      : r === "windows_nt" ||
          r.startsWith("mingw") ||
          r.startsWith("msys") ||
          r.startsWith("cygwin")
        ? "win32"
        : r;
}
t(normalizeRemotePlatform, "normalizeRemotePlatform");
function normalizeRemoteArch(e) {
  let r = normalizeToken(e);
  return r === "x86_64" || r === "amd64" ? "x64" : r === "aarch64" || r === "arm64e" ? "arm64" : r;
}
t(normalizeRemoteArch, "normalizeRemoteArch");
function resolveRemotePlatform(e, r) {
  let n = normalizeRemotePlatform(e),
    o = normalizeRemotePlatform(r);
  return n === "darwin" && o === "linux" ? "linux" : n;
}
t(resolveRemotePlatform, "resolveRemotePlatform");
function createCloseEventController() {
  let e = new s(),
    r = !1,
    n = 0;
  return {
    event: t(
      (i) =>
        r
          ? (queueMicrotask(() => {
              i(n);
            }),
            { dispose() {} })
          : e.event(i),
      "event",
    ),
    fire: t((i) => {
      r || ((r = !0), (n = i), e.fire(i), e.dispose());
    }, "fire"),
  };
}
t(createCloseEventController, "createCloseEventController");
export {
  normalizeRemotePlatform as a,
  normalizeRemoteArch as b,
  resolveRemotePlatform,
  createCloseEventController as d,
};
