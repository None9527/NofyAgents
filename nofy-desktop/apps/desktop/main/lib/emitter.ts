/**
 * 极小 typed emitter。
 *
 * 不用 node:events 的 EventEmitter——它是无类型的，会让事件载荷退化成 any
 * （旧工程树 7,153 处 : any 是 PLAN.md §7.1 点名的反面教材）。
 * 零依赖、零类型断言。
 */

export type EventMap = Record<string, unknown[]>;

export class TypedEmitter<E extends EventMap> {
  private listeners: { [K in keyof E]?: Set<(...args: E[K]) => void> } = {};

  on<K extends keyof E>(event: K, fn: (...args: E[K]) => void): () => void {
    const set = this.listeners[event] ?? new Set<(...args: E[K]) => void>();
    this.listeners[event] = set;
    set.add(fn);
    return () => this.off(event, fn);
  }

  off<K extends keyof E>(event: K, fn: (...args: E[K]) => void): void {
    this.listeners[event]?.delete(fn);
  }

  emit<K extends keyof E>(event: K, ...args: E[K]): void {
    const set = this.listeners[event];
    if (!set) return;
    for (const fn of [...set]) fn(...args);
  }

  listenerCount<K extends keyof E>(event: K): number {
    return this.listeners[event]?.size ?? 0;
  }

  removeAllListeners<K extends keyof E>(event?: K): void {
    if (event === undefined) {
      this.listeners = {};
      return;
    }
    delete this.listeners[event];
  }
}

