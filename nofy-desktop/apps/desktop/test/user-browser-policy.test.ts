import assert from "node:assert/strict";
import test from "node:test";
import {
  USER_BROWSER_COMMANDS,
  allowBrowserNavigation,
  allowBrowserRequest,
  clampBrowserBounds,
  isUserBrowserState,
  parseCookieImport,
  parseUserBrowserUrl,
  readBrowserBounds,
  readBrowserHostRequest,
  sanitizeBrowserLoadError,
  stepBrowserZoom,
} from "../shared/user-browser-contract.ts";

test("http and https URLs are accepted and local hosts default to http", () => {
  assert.deepEqual(parseUserBrowserUrl("https://example.com/a"), { ok: true, url: "https://example.com/a" });
  assert.deepEqual(parseUserBrowserUrl("example.com/a"), { ok: true, url: "https://example.com/a" });
  assert.deepEqual(parseUserBrowserUrl("localhost:3000/a"), { ok: true, url: "http://localhost:3000/a" });
  assert.deepEqual(parseUserBrowserUrl("127.0.0.1/a"), { ok: true, url: "http://127.0.0.1/a" });
  assert.deepEqual(parseUserBrowserUrl("[::1]/a"), { ok: true, url: "http://[::1]/a" });
});

test("empty, oversized, credential, scheme and host failures stay closed", () => {
  assert.equal(parseUserBrowserUrl("  ").ok, false);
  assert.equal(parseUserBrowserUrl("x".repeat(8001)).ok, false);
  assert.deepEqual(parseUserBrowserUrl("https://user:secret@example.com"), { ok: false, error: "credentials" });
  for (const raw of ["file:///etc/passwd", "javascript:alert(1)", "data:text/html,hi", "chrome://settings"]) {
    assert.equal(parseUserBrowserUrl(raw).ok, false, raw);
  }
  assert.equal(parseUserBrowserUrl("http://").ok, false);
});

test("home sits with the navigation commands and does not replace them", () => {
  assert.deepEqual(USER_BROWSER_COMMANDS, ["back", "forward", "reload", "stop", "home"]);
});

test("subframe about documents are allowed and other schemes are not navigable", () => {
  assert.equal(allowBrowserNavigation("about:blank", false), true);
  assert.equal(allowBrowserNavigation("about:srcdoc", false), true);
  assert.equal(allowBrowserNavigation("about:blank", true), false);
  assert.equal(allowBrowserNavigation("https://example.com", true), true);
  assert.equal(allowBrowserNavigation("file:///etc/passwd", true), false);
});

test("only http, https and websocket requests pass", () => {
  assert.equal(allowBrowserRequest("https://example.com/app.js"), true);
  assert.equal(allowBrowserRequest("ws://127.0.0.1/socket"), true);
  assert.equal(allowBrowserRequest("wss://example.com/socket"), true);
  assert.equal(allowBrowserRequest("file:///etc/passwd"), false);
  assert.equal(allowBrowserRequest("about:blank"), false);
  assert.equal(allowBrowserRequest("not a url"), false);
});

test("bounds are divided by zoom and clamped inside the content view", () => {
  assert.deepEqual(clampBrowserBounds({ x: 20, y: 40, width: 200, height: 100, visible: true }, { width: 100, height: 80 }, 2), { x: 10, y: 20, width: 90, height: 50, visible: true });
  assert.deepEqual(clampBrowserBounds({ x: -5, y: 5, width: 999, height: 10, visible: false }, { width: 50, height: 40 }, 0), { x: 0, y: 5, width: 50, height: 10, visible: false });
  assert.throws(() => readBrowserBounds(null), TypeError);
  assert.throws(() => readBrowserBounds({ x: 1, y: 1, width: 1, height: 1, visible: "yes" }), TypeError);
});

test("zoom steps stay on the chrome scale", () => {
  assert.deepEqual(stepBrowserZoom(1, "in"), { factor: 1.1, label: "110%" });
  assert.deepEqual(stepBrowserZoom(1.1, "out"), { factor: 1, label: "100%" });
  assert.equal(stepBrowserZoom(2, "in").factor, 2);
  assert.equal(stepBrowserZoom(0.5, "out").factor, 0.5);
  assert.deepEqual(stepBrowserZoom(1.4, "reset"), { factor: 1, label: "100%" });
});

test("cookie import keeps http cookies and drops password records", () => {
  const netscape = parseCookieImport("# Netscape HTTP Cookie File\n.example.com\tTRUE\t/\tFALSE\t2000000000\tsession\tabc\n#HttpOnly_.example.com\tTRUE\t/\tTRUE\t2000000000\tsid\tsecret\n");
  assert.equal(netscape.cookies.length, 2);
  assert.equal(netscape.cookies[0]?.httpOnly, false);
  assert.equal(netscape.cookies[1]?.httpOnly, true);
  assert.equal(netscape.cookies[1]?.secure, true);
  const json = parseCookieImport(JSON.stringify({ cookies: [{ name: "sid", value: "abc", domain: ".example.com", path: "/", secure: true, httpOnly: false, hostOnly: false, expirationDate: 2000000000, sameSite: "lax" }] }));
  assert.equal(json.cookies.length, 1);
  assert.equal(json.cookies[0]?.sameSite, "lax");
  const passwords = parseCookieImport(JSON.stringify([{ url: "https://example.com", username: "a", password: "super-secret-password" }]));
  assert.equal(passwords.cookies.length, 0);
  assert.equal(passwords.skippedPasswords, true);
  assert.equal(JSON.stringify(passwords).includes("super-secret-password"), false);
  assert.equal(parseCookieImport("javascript:alert(1)\tFALSE\t/\tFALSE\t0\ta\tb").cookies.length, 0);
  assert.equal(parseCookieImport(JSON.stringify([{ name: "old", value: "x", domain: "example.com", expirationDate: 1 }])).cookies.length, 0);
  const many = Array.from({ length: 501 }, (_, index) => ({ name: "n" + index, value: "v", domain: "example.com", expirationDate: 2000000000 }));
  const capped = parseCookieImport(JSON.stringify(many));
  assert.equal(capped.cookies.length, 500);
  assert.ok(capped.rejected >= 1);
});

test("browser host requests cannot carry cookie or password payloads", () => {
  assert.deepEqual(readBrowserHostRequest({ action: "zoom", direction: "in" }), { action: "zoom", direction: "in" });
  assert.throws(() => readBrowserHostRequest({ action: "zoom", direction: "up" }), TypeError);
  assert.throws(() => readBrowserHostRequest({ action: "import-cookies", cookies: [{ name: "a", value: "b" }] }), TypeError);
  assert.throws(() => readBrowserHostRequest({ action: "clear", password: "secret" }), TypeError);
});

test("state and load errors are bounded before they reach the renderer", () => {
  assert.equal(isUserBrowserState({ url: "https://example.com", title: "Example", loading: false, canGoBack: true, canGoForward: false, error: null }), true);
  assert.equal(isUserBrowserState({ url: "https://example.com", title: "Example", loading: false, canGoBack: true, canGoForward: false, error: "x".repeat(301) }), false);
  assert.equal(sanitizeBrowserLoadError("ERR_FAILED\nline"), "load:ERR_FAILED line");
  assert.equal(sanitizeBrowserLoadError("   "), "load:failed");
});
