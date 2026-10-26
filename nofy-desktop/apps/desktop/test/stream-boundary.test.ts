import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, reduce } from '../renderer/core/project.ts';
import { normalizeNotification } from '../renderer/core/events.ts';

function replay(isReplay = false) {
  let state = reduce(initialState(), { type: 'session/created', sessionId: 'a', cwd: '/a', modelId: null });
  let seq = 0;
  return {
    emit(kind: string, text: string, streamStartMs?: number, eventId = `a-${++seq}`) {
      state = reduce(state, { type: 'kernel/event', event: normalizeNotification('session/update', {
        sessionId: 'a', update: { sessionUpdate: kind, content: { type: 'text', text } },
        _meta: { eventId, isReplay, streamStartMs },
      }) });
    },
    session: () => state.sessions.a!,
  };
}

for (const isReplay of [false, true]) test(`stream boundary separates responses without response_completed (replay=${isReplay})`, () => {
  const s = replay(isReplay);
  s.emit('user_message_chunk', 'question');
  s.emit('agent_thought_chunk', 'Think A', 100);
  s.emit('agent_message_chunk', 'Answer A', 100);
  const previous = s.session().blocks;
  s.emit('agent_thought_chunk', 'Think B', 200);
  s.emit('agent_message_chunk', 'Answer B', 200);
  assert.deepEqual(s.session().blocks.map(b => 'text' in b ? b.text : ''), ['question', 'Think A', 'Answer A', 'Think B', 'Answer B']);
  const first = s.session().blocks[2]!;
  assert.ok(first.kind === 'agent-message' && first.closed);
  assert.ok(previous[2]?.kind === 'agent-message' && !previous[2].closed, 'old snapshot remains immutable');
  assert.equal(s.session().turns[0]!.endedAt, null, 'a response boundary does not finish the user turn');
});

for (const kind of ['agent_message_chunk', 'agent_thought_chunk']) test(`same stream appends, new stream closes ${kind}`, () => {
  const s = replay(); s.emit(kind, 'Hello', 100); s.emit(kind, ' world', 100);
  assert.equal(s.session().blocks.length, 1);
  s.emit(kind, 'Next', 200);
  assert.equal(s.session().blocks.length, 2);
  const [first, second] = s.session().blocks;
  assert.ok(first && 'text' in first && first.text === 'Hello world' && 'closed' in first && first.closed);
  assert.ok(second && 'text' in second && second.text === 'Next');
});

test('duplicate old-stream replay cannot rewind stream ownership; legacy chunks still append', () => {
  const s = replay(); s.emit('agent_message_chunk', 'A', 100, 'a-1');
  s.emit('agent_message_chunk', 'B', 200, 'a-2');
  s.emit('agent_message_chunk', 'A', 100, 'a-1');
  s.emit('agent_message_chunk', 'C', 200, 'a-3');
  s.emit('agent_message_chunk', 'D', undefined, 'a-4');
  assert.deepEqual(s.session().blocks.map(b => 'text' in b ? b.text : ''), ['A', 'BCD']);
});
