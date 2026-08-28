// Minimal ACP client for the nofy agent backend, usable from the bridge in a
// plain browser. Mirrors the proven mapping from the previous frontend:
// initialize -> session/list -> session/load (replay) -> session/prompt,
// plus session/update notifications and _nofy extensions.
(function () {
  "use strict";

  function NofyClient(url) {
    this.url = url || "ws://127.0.0.1:9800/ws?server-key=devsecret";
    this.ws = null;
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map(); // method -> [fn]
    this.readyPromise = null;
  }

  NofyClient.prototype.on = function (method, fn) {
    const arr = this.listeners.get(method) ?? [];
    arr.push(fn);
    this.listeners.set(method, arr);
  };

  NofyClient.prototype.connect = function () {
    const self = this;
    this.ws = new WebSocket(this.url);
    this.ws.onmessage = function (e) {
      let frame;
      try {
        frame = JSON.parse(e.data);
      } catch (err) {
        return;
      }
      if (frame.id != null && (frame.result !== undefined || frame.error !== undefined)) {
        const waiter = self.pending.get(frame.id);
        if (!waiter) return;
        self.pending.delete(frame.id);
        if (frame.error) waiter.reject(new Error(frame.error.message));
        else waiter.resolve(frame.result);
        return;
      }
      const fns = self.listeners.get(frame.method) ?? [];
      for (const fn of fns) {
        try {
          fn(frame.params ?? {});
        } catch (err) {
          console.warn("[nofy] listener error", frame.method, err);
        }
      }
    };
    this.ws.onclose = function () {
      setTimeout(function () {
        self.connect();
      }, 2000);
    };
  };

  NofyClient.prototype.rpc = function (method, params) {
    const self = this;
    return new Promise(function (resolve, reject) {
      const id = self.nextId++;
      self.pending.set(id, { resolve: resolve, reject: reject });
      self.ws.send(JSON.stringify({ jsonrpc: "2.0", id: id, method: method, params: params }));
    });
  };

  NofyClient.prototype.ready = function () {
    const self = this;
    if (!this.readyPromise) {
      this.readyPromise = new Promise(function (resolve) {
        const tryInit = function () {
          if (self.ws.readyState !== 1) {
            setTimeout(tryInit, 200);
            return;
          }
          self
            .rpc("initialize", {
              protocolVersion: 1,
              clientCapabilities: {
                fs: { readTextFile: false, writeTextFile: false },
                elicitation: { form: {}, url: {} },
              },
              clientInfo: { name: "grok-build-zfork", version: "0.1.0" },
            })
            .then(resolve, resolve);
        };
        tryInit();
      });
    }
    return this.readyPromise;
  };

  NofyClient.prototype.listSessions = function () {
    return this.ready().then(function () {
      return this.rpc("session/list", {});
    }.bind(this));
  };

  NofyClient.prototype.loadSession = function (sessionId, cwd) {
    return this.rpc("session/load", { sessionId: sessionId, cwd: cwd, mcpServers: [] });
  };

  NofyClient.prototype.prompt = function (sessionId, text) {
    return this.rpc("session/prompt", {
      sessionId: sessionId,
      prompt: [{ type: "text", text: text }],
    });
  };

  NofyClient.prototype.newSession = function (cwd) {
    return this.rpc("session/new", { cwd: cwd, mcpServers: [] });
  };

  NofyClient.prototype.cancel = function (sessionId) {
    return this.rpc("session/cancel", { sessionId: sessionId });
  };

  window.NofyClient = NofyClient;
})();
