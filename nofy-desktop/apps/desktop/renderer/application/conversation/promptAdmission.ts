import type { Runtime } from "../../core/runtime.ts";
import type { TaskResult } from "../../core/effects.ts";
/** RPC completion is execution completion; persisted message / queue echo confirms admission first. */
export function observePromptAdmission(runtime: Runtime, sessionId: string, text: string, promptId: string, perform: () => Promise<TaskResult>): Promise<TaskResult> {
  const state = runtime.store.getState();
  const epoch = state.connection.transportEpoch;
  const baseline = new Set(state.sessions[sessionId]?.blocks.map(block => block.id) ?? []);
  return new Promise(resolve => {
    let settled = false;
    let off = () => {};
    const finish = (result: TaskResult) => { if (settled) return; settled = true; off(); resolve(result); };
    const inspect = () => {
      const current = runtime.store.getState();
      if (current.connection.transportEpoch !== epoch) { finish({ ok: false, effect: "session/prompt", error: "连接已变化，发送确认未完成" }); return; }
      const session = current.sessions[sessionId];
      const queued = session?.queueEntries.some(raw => raw !== null && typeof raw === "object" && (raw as { id?: unknown }).id === promptId);
      const echoed = text.length > 0 && session?.blocks.some(block => block.kind === "user-message" && !baseline.has(block.id) && block.text === text);
      if (queued || echoed) finish({ ok: true, effect: "session/prompt", value: { accepted: true, queued: queued === true } });
    };
    off = runtime.store.subscribe(inspect);
    void perform().then(finish, error => finish({ ok: false, effect: "session/prompt", error: error instanceof Error ? error.message : String(error) }));
  });
}
