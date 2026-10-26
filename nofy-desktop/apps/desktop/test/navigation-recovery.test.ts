import assert from 'node:assert/strict';
import test from 'node:test';
import { initialState, reduce } from '../renderer/core/project.ts';
import { normalizeNotification } from '../renderer/core/events.ts';

test('background load never activates over a newer navigation choice', () => {
  let state = reduce(initialState(), { type: 'session/created', sessionId: 'a', cwd: '/a', modelId: null });
  state = reduce(state, { type: 'session/created', sessionId: 'b', cwd: '/b', modelId: null });
  state = reduce(state, { type: 'session/created', sessionId: 'slow', cwd: '/slow', modelId: null, activate: false });
  assert.equal(state.activeSessionId, 'b');
  assert.equal(state.sessions.slow?.cwd, '/slow');
  state = reduce(state, { type: 'session/activated', sessionId: 'slow' });
  assert.equal(state.activeSessionId, 'slow');
});

test('disconnect discards transport-bound approvals; fresh identity is required after reconnect', () => {
  let state = reduce(initialState(), { type: 'session/created', sessionId: 'a', cwd: '/a', modelId: null });
  state = reduce(state, { type: 'kernel/server-request', id: 'old-transport', method: '_nofy/exit_plan_mode', params: { sessionId: 'a', planContent: '# Plan' } });
  state = reduce(state, { type: 'connection/status', status: 'reconnecting' });
  assert.equal(state.pendingInteractions.length, 0);
  assert.equal(state.sessions.a?.cwd, '/a');
  state = reduce(state, { type: 'connection/initialized', result: {} });
  state = reduce(state, { type: 'kernel/server-request', id: 'new-transport', method: '_nofy/exit_plan_mode', params: { sessionId: 'a', planContent: '# Plan' } });
  assert.deepEqual(state.pendingInteractions.map((p) => p.id), ['new-transport']);
  state = reduce(state, { type: 'kernel/server-request-answered', id: 'old-transport' });
  assert.deepEqual(state.pendingInteractions.map((p) => p.id), ['new-transport']);
});

test('turn completion clears only the target session approvals and replay is idempotent', () => {
  let state = reduce(initialState(), { type: 'session/created', sessionId: 'a', cwd: '/a', modelId: null });
  state = reduce(state, { type: 'kernel/server-request', id: 1, method: '_nofy/mcp/elicit', params: { sessionId: 'a' } });
  state = reduce(state, { type: 'kernel/server-request', id: 2, method: '_nofy/mcp/elicit', params: { sessionId: 'b' } });
  const event = normalizeNotification('_nofy/session/update', { sessionId: 'a', update: { sessionUpdate: 'turn_completed', stop_reason: 'end_turn' }, _meta: { eventId: 'a-10' } });
  state = reduce(state, { type: 'kernel/event', event });
  assert.deepEqual(state.pendingInteractions.map((p) => p.id), [2]);
  const replayed = reduce(state, { type: 'kernel/event', event });
  assert.deepEqual(replayed.sessions.a, state.sessions.a);
  assert.deepEqual(replayed.pendingInteractions, state.pendingInteractions);
});
