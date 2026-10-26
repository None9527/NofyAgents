#!/usr/bin/env node
/** Deterministic ACP emulator for GUI QA. Never loads real nofy configuration. */
import { createInterface } from 'node:readline';
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const root = process.env.NOFY_HOME;
if (!root || !process.env.NOFY_E2E_LOG) throw new Error('E2E isolation environment required');
const statePath = join(root, 'mock-state.json');
const state = existsSync(statePath) ? JSON.parse(readFileSync(statePath, 'utf8')) : { next: 1, sessions: {}, pending: null };
const waiting = new Map();
const running = new Map();
const save = () => writeFileSync(statePath, JSON.stringify(state));
if (!state.sessions['e2e-catalog-only']) {
  state.sessions['e2e-catalog-only'] = { cwd: '/e2e/catalog-project', title: 'Catalog only title', seq: 0, events: [], queue: [], catalogOnly: true };
  save();
}
const log = (value) => appendFileSync(process.env.NOFY_E2E_LOG, JSON.stringify(value) + '\n');
const send = (frame) => process.stdout.write(JSON.stringify({ jsonrpc: '2.0', ...frame }) + '\n');
const reply = (id, result) => send({ id, result });
const notify = (method, params) => send({ method, params });
function event(sid, kind, fields = {}, ext = false) {
  const s = state.sessions[sid];
  const frame = { method: ext ? '_nofy/session/update' : 'session/update', params: { sessionId: sid, update: { sessionUpdate: kind, ...fields }, _meta: { eventId: `${sid}-${++s.seq}` } } };
  s.events.push(frame); send(frame); save();
}
function complete(sid, text = 'E2E completed') {
  event(sid, 'agent_message_chunk', { content: { type: 'text', text } });
  event(sid, 'response_completed', { usage: {} }, true);
  event(sid, 'turn_completed', { prompt_id: `${sid}-turn`, stop_reason: 'end_turn', usage: {} }, true);
  if (running.has(sid)) { reply(running.get(sid), { stopReason: 'end_turn' }); running.delete(sid); }
}
function sessionResponse(sid) {
  const s = state.sessions[sid];
  return { sessionId: sid, models: { currentModelId: 'e2e-model', availableModels: [{ modelId: 'e2e-model', name: 'E2E model' }] }, _meta: { currentWorkingDirectory: s.cwd, 'nofy/sessionDetail': { sessionId: sid, title: s.title, cwd: s.cwd, kind: 'build', currentModelId: 'e2e-model' }, 'nofy/sessionConfig': { options: [{ id: 'e2e-model', category: 'model', label: 'E2E model', selected: true }] } } };
}
function serverRequest(sid, kind) {
  const id = `${process.pid}-${kind}-${Date.now()}`;
  const method = kind === 'form' ? '_nofy/mcp/elicit' : '_nofy/exit_plan_mode';
  const params = kind === 'form' ? { sessionId: sid, toolCallId: 'e2e-tool', serverName: 'E2E server', message: 'E2E provide contact', mode: 'form', requestedSchema: { type: 'object', properties: { email: { type: 'string', title: 'E2E email', format: 'email' }, count: { type: 'integer', title: 'E2E count', minimum: 1, maximum: 5, default: 2 } }, required: ['email', 'count'] } } : { sessionId: sid, toolCallId: 'e2e-plan', planContent: '# E2E plan\n\n1. Inspect files\n2. Apply changes\n3. Verify outcome' };
  waiting.set(id, { sid, kind });
  state.pending = { sid, kind }; save();
  send({ id, method, params });
}
function queueChanged(sid) { notify('_nofy/queue/changed', { sessionId: sid, entries: state.sessions[sid].queue }); save(); }
createInterface({ input: process.stdin }).on('line', (line) => {
  let f;
  try { f = JSON.parse(line); } catch { return; }
  log({ pid: process.pid, direction: 'in', frame: f });
  if (!f.method) {
    const pending = waiting.get(f.id);
    if (!pending) return;
    waiting.delete(f.id); state.pending = null; save();
    complete(pending.sid, `E2E ${pending.kind} response: ${JSON.stringify(f.result)}`);
    return;
  }
  const p = f.params ?? {};
  if (f.method === 'initialize') {
    reply(f.id, { protocolVersion: 1, agentCapabilities: { loadSession: true, promptCapabilities: { image: false, audio: false, embeddedContext: true } }, authMethods: [], _meta: { agentVersion: 'E2E mock, not real model', availableCommands: [], modelState: { currentModelId: 'e2e-model', availableModels: [{ modelId: 'e2e-model', name: 'E2E model' }] } } });
    if (state.pending) setTimeout(() => serverRequest(state.pending.sid, state.pending.kind), 250);
  } else if (f.method === 'session/new') {
    const sid = `e2e-session-${state.next++}`;
    state.sessions[sid] = { cwd: p.cwd, title: `E2E task ${state.next - 1}`, seq: 0, events: [], queue: [] }; save();
    reply(f.id, sessionResponse(sid));
  } else if (f.method === 'session/load') {
    if (!state.sessions[p.sessionId]) { send({ id: f.id, error: { code: -32602, message: 'No session' } }); return; }
    reply(f.id, sessionResponse(p.sessionId));
    for (const e of state.sessions[p.sessionId].events) send(e);
  } else if (f.method === '_nofy/sessions/list') {
    reply(f.id, { sessions: Object.entries(state.sessions).filter(([, s]) => !s.catalogOnly).map(([sid, s]) => ({ sessionId: sid, cwd: s.cwd, title: s.title, modelId: 'e2e-model', activity: 'idle', resident: true, lastChangeUnixMs: Date.now() })) });
  } else if (f.method === '_nofy/session_summaries/workspace_list') {
    const all = {};
    for (const [sid, s] of Object.entries(state.sessions)) {
      const dir = typeof s.cwd === 'string' ? s.cwd : '';
      if (!all[dir]) all[dir] = [];
      all[dir].push({ info: { id: sid, cwd: s.cwd }, session_summary: s.title, generated_title: s.title, updated_at: '2026-10-14T00:00:00.000Z' });
    }
    reply(f.id, { all_sessions: all });
  } else if (f.method === '_nofy/session/rename') {
    state.sessions[p.sessionId].title = p.title; save();
    event(p.sessionId, 'session_info_update', { title: p.title });
    reply(f.id, { success: true });
  } else if (f.method === '_nofy/session/delete') {
    delete state.sessions[p.sessionId]; save(); reply(f.id, { success: true });
  } else if (f.method === 'session/prompt') {
    const sid = p.sessionId;
    const text = (p.prompt ?? []).filter((b) => b.type === 'text').map((b) => b.text).join('\n');
    running.set(sid, f.id);
    event(sid, 'user_message_chunk', { content: { type: 'text', text }, _meta: { promptIndex: state.sessions[sid].events.filter((e) => e.params.update.sessionUpdate === 'user_message_chunk').length, modelId: 'e2e-model' } });
    if (text === 'e2e:thought') {
      event(sid, 'hook_execution', { event_name: 'user_prompt_submit' }, true);
      const chunks = ['There', ' is no', ' need to', ' invoke', ' tools.', ' I will', ' respond', ' with a', ' friendly', ' greeting.'];
      chunks.forEach((chunk, index) => setTimeout(() => event(sid, 'agent_thought_chunk', { content: { type: 'text', text: chunk } }), index * 70));
      setTimeout(() => complete(sid, 'Hi! I’m Nofy, your coding assistant. What can I help you with today?'), 1100);
    } else if (text === 'e2e:rich' || text === '请检查这两份配置，比较不同档位，并给出可复用的调用示例。') {
      event(sid, 'agent_thought_chunk', { content: { type: 'text', text: '先检查项目结构，再整理结果。' } });
      for (const path of ['src/app.ts', 'src/config.ts']) {
        event(sid, 'tool_call', { toolCallId: path, title: '读取文件', rawInput: { file_path: path } });
        event(sid, 'tool_call_update', { toolCallId: path, kind: 'read', status: 'completed', content: [{ type: 'text', text: 'export const ready = true;' }] });
      }
      const markdown = '# 验证结果\n\n已完成检查，**参数生效**，下面是可复用的配置。\n\n1. **开关** `enabled`\n   - `true`：启用处理\n   - `false`：直接返回\n2. **档位**\n\n| 档位 | 数量 |\n| --- | ---: |\n| `low` | 4,096 |\n| `high` | 29,014 |\n\n## 调用示例\n\n```json\n{\n  "enabled": true,\n  "mode": "high",\n  "path": "' + 'src/long-folder/'.repeat(18) + 'config.json"\n}\n```\n\n> 配置来自本轮实际检查。\n\n- [x] 已检查文件\n- [ ] 待人工确认\n\n注意：`mode` 可按需要调整。';
      complete(sid, markdown);
    } else if (text === 'e2e:flow') {
      event(sid, 'hook_execution', { event_name: 'start' }, true);
      event(sid, 'agent_thought_chunk', { content: { type: 'text', text: 'Check the workspace first.' } });
      event(sid, 'tool_call', { toolCallId: 'before', title: 'Inspect workspace' });
      event(sid, 'agent_message_chunk', { content: { type: 'text', text: 'Flow final answer' } });
      event(sid, 'response_completed', { usage: { input_tokens: 123, output_tokens: 7 } }, true);
      event(sid, 'tool_call', { toolCallId: 'after', title: 'Record completed result' });
      event(sid, 'tool_call_update', { toolCallId: 'after', status: 'completed', content: [{ type: 'text', text: 'Saved the result successfully.' }] });
      event(sid, 'hook_execution', { event_name: 'stop' }, true);
      event(sid, 'turn_completed', { prompt_id: `${sid}-turn`, stop_reason: 'end_turn' }, true);
      reply(f.id, { stopReason: 'end_turn' }); running.delete(sid);
    } else if (text === 'e2e:plan' || text === 'e2e:form') serverRequest(sid, text.slice(4));
    else if (text === 'e2e:disconnect') { serverRequest(sid, 'plan'); setTimeout(() => process.exit(0), 1500); }
    else if (text === 'e2e:queue') { state.sessions[sid].queue = [{ id: 'queue-1', text: 'E2E queued first', version: 0, position: 0, kind: 'prompt' }, { id: 'queue-2', text: 'E2E queued second', version: 0, position: 1, kind: 'prompt' }]; queueChanged(sid); complete(sid); }
    else if (text === 'e2e:long') {
      for (let i = 0; i < 500; i++) { if (i) event(sid, 'user_message_chunk', { content: { type: 'text', text: `E2E user ${i}` }, _meta: { promptIndex: i } }); event(sid, 'agent_message_chunk', { content: { type: 'text', text: `E2E reply ${i}` } }); event(sid, 'response_completed', { usage: {} }, true); event(sid, 'turn_completed', { prompt_id: `${sid}-long-${i}`, stop_reason: 'end_turn' }, true); }
      reply(f.id, { stopReason: 'end_turn' }); running.delete(sid);
    } else complete(sid, `E2E answer: ${text}`);
  } else if (f.method === '_nofy/queue/edit') {
    const row = state.sessions[p.sessionId].queue.find((r) => r.id === p.id);
    if (row) { row.text = p.newText; row.version++; } queueChanged(p.sessionId);
  } else if (f.method === '_nofy/queue/remove') {
    const s = state.sessions[p.sessionId]; s.queue = s.queue.filter((r) => r.id !== p.id); queueChanged(p.sessionId);
  } else if (f.method === '_nofy/queue/clear') {
    state.sessions[p.sessionId].queue = []; queueChanged(p.sessionId);
  } else if (f.method === 'session/cancel') {
    const sid = p.sessionId; state.pending = null; save();
    event(sid, 'turn_completed', { prompt_id: `${sid}-turn`, stop_reason: 'cancelled' }, true);
    if (running.has(sid)) { reply(running.get(sid), { stopReason: 'cancelled' }); running.delete(sid); }
  } else if (f.id !== undefined) reply(f.id, {});
});
