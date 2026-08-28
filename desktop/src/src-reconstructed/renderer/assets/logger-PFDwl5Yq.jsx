import { K as e } from "./src-HCld2afU.js";
function t() {
  return globalThis.__ZCODE_RENDERER_DISABLE_LOGGING__ === !0 || {
    BASE_URL: `./`,
    DEV: !1,
    MODE: `production`,
    PROD: !0,
    SSR: !1,
    VITE_ZCODE_BASE_URL: `https://zcode.z.ai`,
    VITE_ZCODE_E2E_STORE_BRIDGE: ``,
    VITE_ZCODE_ENDPOINT_ORIGIN: `https://zcode.z.ai`
  }.PROD === !0;
}
var n = {
  debug: console.debug,
  info: console.log,
  warn: console.warn,
  error: console.error
};
function r(e) {
  return !t();
}
function i(t, ...i) {
  r(t) && (n[t](e(`ui`), ...i), t !== `debug` && typeof window < `u` && window.zcode?.log?.(t, i));
}
var a = {
  debug: (...e) => i(`debug`, ...e),
  info: (...e) => i(`info`, ...e),
  warn: (...e) => i(`warn`, ...e),
  error: (...e) => i(`error`, ...e),
  trace: (e, t, ...n) => {
    i(t, `[trace:${e}]`, ...n);
  }
};
export { a as t };
