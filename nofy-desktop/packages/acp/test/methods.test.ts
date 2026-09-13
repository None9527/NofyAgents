import assert from "node:assert/strict";
import test from "node:test";
import {
  AGENT_METHOD,
  EXT_EVENT,
  EXT_NOTIFY,
  EXT_REQUEST,
  EXT_SERVER_REQUEST,
  extMethodName,
} from "../src/methods.ts";

test("extMethodName is idempotent across all three input shapes", () => {
  assert.equal(extMethodName("session/info"), "_nofy/session/info");
  assert.equal(extMethodName("nofy/session/info"), "_nofy/session/info");
  assert.equal(extMethodName("_nofy/session/info"), "_nofy/session/info");
  // 幂等：再归一一次不变
  assert.equal(extMethodName(extMethodName("btw")), "_nofy/btw");
});

test("every EXT alias is already normalized (no drift)", () => {
  for (const table of [EXT_EVENT, EXT_REQUEST, EXT_NOTIFY, EXT_SERVER_REQUEST]) {
    for (const [key, name] of Object.entries(table)) {
      assert.equal(extMethodName(name), name, key + " is not in normalized wire form");
    }
  }
});

test("session/cancel is tracked as a notification-capable method name", () => {
  // 陷阱 T1 的守卫：cancel 必须走 notify()，不得走 rpc()。
  // 连接层的测试在 apps/desktop/test/connection.test.ts 覆盖行为。
  assert.equal(AGENT_METHOD.cancel, "session/cancel");
});


