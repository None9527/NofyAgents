import test from 'node:test';
import assert from 'node:assert/strict';
import { summaryDelay } from '../renderer/ui/summaryTiming.ts';
import { transitionFollow, responseBudget, consumeResponseBudget } from '../renderer/ui/transcriptViewport.ts';

test('summary updates current identity immediately; new identity uses remaining dwell, completion bypasses it', () => {
  assert.equal(summaryDelay('a', 'a', 50, true), 0);
  assert.equal(summaryDelay('a', 'b', 250, true), 750);
  assert.equal(summaryDelay('a', 'c', 800, true), 200);
  assert.equal(summaryDelay('a', 'summary', 50, false), 0);
  assert.equal(summaryDelay('a', 'b', 1100, true), 0);
});
test('work watches before overflow, user reading survives phase and completion changes', () => {
  let mode = transitionFollow('user_follow', { type:'submit' });
  assert.equal(mode, 'prework_watch');
  mode = transitionFollow(mode, { type:'overflow' });
  assert.equal(mode, 'prework_follow');
  mode = transitionFollow(mode, { type:'response' });
  assert.equal(mode, 'user_follow');
  mode = transitionFollow(mode, { type:'user-scroll', distance:100 });
  assert.equal(mode, 'static');
  assert.equal(transitionFollow(mode, { type:'response' }), 'static');
  assert.equal(transitionFollow(mode, { type:'settled' }), 'static');
  assert.equal(transitionFollow(mode, { type:'bottom' }), 'user_follow');
});
test('fitting prose remains watched until overflow because final phase is unknown', () => {
  assert.equal(transitionFollow('prework_watch', { type:'response' }), 'prework_watch');
  assert.equal(transitionFollow('prework_watch', { type:'overflow' }), 'prework_follow');
  assert.equal(transitionFollow('static', { type:'overflow' }), 'static');
  assert.equal(transitionFollow('user_follow', { type:'user-scroll', distance:25 }), 'static');
});
test('answer space is bounded, consumed by growth, never recreated by shrinking content', () => {
  assert.equal(responseBudget(600), 360);
  assert.equal(responseBudget(1200), 800);
  assert.equal(responseBudget(200), 0);
  assert.equal(consumeResponseBudget(360, 90), 270);
  assert.equal(consumeResponseBudget(270, -100), 270);
  assert.equal(consumeResponseBudget(270, 600), 0);
});
