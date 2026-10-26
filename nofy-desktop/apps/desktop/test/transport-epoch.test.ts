import test from "node:test";
import assert from "node:assert/strict";
import { reduce } from "../renderer/core/project.ts";
import { initialState } from "../renderer/core/store/state.ts";
test("a reused RPC id after reconnect has a fresh UI identity within the same coalesced frame", () => {
  let state = reduce(initialState(), { type: "kernel/server-request", id: 1, method: "_nofy/exit_plan_mode", params: { sessionId: "a" } });
  const oldKey = state.connection.transportEpoch + ":" + state.pendingInteractions[0]?.id;
  state = reduce(state, { type: "connection/status", status: "reconnecting" });
  state = reduce(state, { type: "connection/initialized", result: {} });
  state = reduce(state, { type: "kernel/server-request", id: 1, method: "_nofy/exit_plan_mode", params: { sessionId: "a" } });
  const newKey = state.connection.transportEpoch + ":" + state.pendingInteractions[0]?.id;
  assert.notEqual(newKey, oldKey);
  assert.equal(state.pendingInteractions.length, 1);
});
