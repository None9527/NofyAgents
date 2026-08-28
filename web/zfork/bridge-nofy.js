// Grok Build bridge: runs the forked ZCode renderer in a plain browser (or our
// Electron shell) with the nofy agent backend.
// Phase 1: window.zcode shim (safe defaults) + service-port capture. The port
// is terminated locally; every renderer->host message is logged for protocol
// discovery and answered with conservative defaults until the nofy adapter
// methods land.
(function () {
  "use strict";
  if (window.zcode) return;

  var direct = {
    getDeviceId: function () { return "grok-build-web"; },
    syncTelemetryContext: function () {},
    notifyRendererReady: function () {},
    getSystemLocale: function () { return Promise.resolve("zh-CN"); },
    getApplicationLocale: function () { return Promise.resolve("zh-CN"); },
    setApplicationLocale: function () { return Promise.resolve(); },
    getDesktopZoomLevel: function () { return Promise.resolve({ zoomLevel: 0 }); },
    getUpdateState: function () { return Promise.resolve({ kind: "idle", enabled: false }); },
    getWebRemoteControlStatus: function () { return Promise.resolve({ status: "idle" }); },
    canOpenCommunity: function () { return Promise.resolve(false); },
    getZCodeStdioTapDevState: function () {
      return Promise.resolve({ enabled: false, visible: false, logDir: "", statePath: "" });
    },
    loadMcpFromUserDirectory: function () { return Promise.resolve({ servers: [] }); },
    saveMcpToUserDirectory: function () { return Promise.resolve({ success: true }); },
    setTitleBarTheme: function () { return Promise.resolve(); },
    getDesktopWindowChromeState: function () {
      return Promise.resolve({ maximized: false, fullscreen: false });
    },
    openExternal: function (url) {
      try { window.open(String(url), "_blank"); } catch (e) {}
      return Promise.resolve();
    },
  };

  window.zcode = new Proxy(direct, {
    get: function (target, prop) {
      if (prop in target) return target[prop];
      var name = String(prop);
      if (/^on[A-Z]/.test(name) || name === "on" || name === "subscribe" || /^subscribe/.test(name)) {
        return function () { return function () {}; };
      }
      return function () { return Promise.resolve(undefined); };
    },
    set: function (target, prop, value) {
      target[prop] = value;
      return true;
    },
  });

  // ---- service port termination (discovery mode) -------------------------
  window.__zmsgs = [];
  // Instrument every MessagePort post (renderer -> host direction) so we can
  // see the wire traffic even before our own port is accepted.
  var origPost = MessagePort.prototype.postMessage;
  MessagePort.prototype.postMessage = function (d) {
    try {
      window.__zmsgs.push("POST " + (d instanceof Uint8Array || d instanceof ArrayBuffer ? "<bin>" : JSON.stringify(d).slice(0, 400)));
      console.log("[zfork] port.post:", window.__zmsgs[window.__zmsgs.length - 1]);
    } catch (e) {}
    return origPost.apply(this, arguments);
  };
  function describe(d) {
    try {
      if (d instanceof Uint8Array || d instanceof ArrayBuffer) return "<binary " + (d.byteLength ?? 0) + "b>";
      return JSON.stringify(d).slice(0, 400);
    } catch (e) {
      return String(d);
    }
  }

  window.addEventListener("message", function (e) {
    if (e.data !== "zcode:service-port-request") return;
  });

  // The renderer entry listens for a MessageEvent carrying the port; we watch
  // for the renderer's own listener by pushing a port pair as soon as React
  // mounts, exactly like the reference bridge.
  function startPort() {
    var channel = new MessageChannel();
    channel.port1.onmessage = function (e) {
      var d = e.data;
      window.__zmsgs.push(describe(d));
      if (window.__zmsgs.length > 500) window.__zmsgs.shift();
      console.log("[zfork] renderer->host:", describe(d));
      // Conservative default answers are added per-method once discovered.
      respond(channel.port1, d);
    };
    var attempts = 0;
    var timer = setInterval(function () {
      attempts += 1;
      var mounted =
        document.getElementById("root") && document.getElementById("root").children.length > 0;
      if (mounted || attempts > 40) {
        clearInterval(timer);
        return;
      }
      window.dispatchEvent(
        new MessageEvent("message", { data: "zcode:service-port", ports: [channel.port2] }),
      );
    }, 400);
  }

  function respond(port, d) {
    // Discovery phase: answer nothing yet; protocol samples are collected in
    // window.__zmsgs and answered by the nofy adapter once implemented.
    void port;
    void d;
  }

  startPort();
})();
