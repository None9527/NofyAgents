import test from "node:test";
import assert from "node:assert/strict";
import { createResource } from "../renderer/application/settings/resourceCache.ts";
const deferred = <T>() => { let resolve!: (value: T) => void; let reject!: (cause: Error) => void; const promise = new Promise<T>((yes,no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
test("concurrent subscribers deduplicate the same read and warm remount does not refetch", async () => {
  let calls = 0; const wait = deferred<string>(); const query = createResource(() => { calls++; return wait.promise; });
  const first = query.load(); assert.equal(query.load(), first); await Promise.resolve(); assert.equal(calls, 1); wait.resolve("catalog"); await first;
  await query.load(); assert.equal(calls, 1); assert.equal(query.getSnapshot().data, "catalog");
});
test("explicit refresh supersedes a delayed old response", async () => {
  const a = deferred<string>(), b = deferred<string>(); let calls = 0;
  const query = createResource(() => (++calls === 1 ? a : b).promise);
  const old = query.load(); await Promise.resolve(); const fresh = query.load(true); await Promise.resolve(); b.resolve("new"); await fresh; a.resolve("old"); await old;
  assert.equal(query.getSnapshot().data, "new"); assert.equal(query.getSnapshot().refreshing, false);
});
test("failed refresh retains last known data and exposes a retryable error", async () => {
  let fail = false; const query = createResource(async () => { if (fail) throw new Error("offline"); return ["server"]; });
  await query.load(); fail = true; await query.load(true); assert.equal(query.getSnapshot().status, "error"); assert.deepEqual(query.getSnapshot().data, ["server"]); assert.equal(query.getSnapshot().error, "offline");
  fail = false; await query.load(); assert.equal(query.getSnapshot().status, "ready"); assert.equal(query.getSnapshot().error, null);
});
test("independent identities never apply another session response", async () => {
  const wait = deferred<string>(), a = createResource(() => wait.promise), b = createResource(async () => "session-b");
  const pending = a.load(); await b.load(); wait.resolve("session-a"); await pending; assert.equal(a.getSnapshot().data, "session-a"); assert.equal(b.getSnapshot().data, "session-b");
});
test("stale resources refresh without a timer or polling loop", async () => {
  let calls = 0; const query = createResource(async () => ++calls, 0); await query.load(); await query.load(); assert.equal(calls, 2);
});
test("unsubscribed views receive no late notifications", async () => {
  const wait = deferred<string>(), query = createResource(() => wait.promise); let notifications = 0;
  const unsubscribe = query.subscribe(() => notifications++); const pending = query.load(); assert.equal(notifications, 1); unsubscribe(); wait.resolve("done"); await pending; assert.equal(notifications, 1);
});

test("inactive invalidation rejects in-flight data and forces the next activation to read again", async () => {
  const old = deferred<string>(); let calls = 0;
  const query = createResource(() => ++calls === 1 ? old.promise : Promise.resolve("current"));
  const pending = query.load(); await Promise.resolve(); query.invalidate(); old.resolve("stale"); await pending;
  assert.equal(query.getSnapshot().data, null); await query.load(); assert.equal(query.getSnapshot().data, "current"); assert.equal(calls, 2);
});
