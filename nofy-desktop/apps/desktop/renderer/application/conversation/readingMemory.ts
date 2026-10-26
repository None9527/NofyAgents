export type ReadingSnapshot = { following: boolean; top: number; anchor: string | null; offset: number };
export type ReadingMemory = { read: () => ReadingSnapshot | undefined; write: (value: ReadingSnapshot) => void };
const memories = new WeakMap<object, Map<string, ReadingSnapshot>>();
/** Bounded per-client, session-owned reading state; no DOM or protocol mutation. */
export function conversationReadingMemory(owner: object, id: string): ReadingMemory {
  let cache = memories.get(owner);
  if (!cache) { cache = new Map(); memories.set(owner, cache); }
  return {
    read: () => cache.get(id),
    write: value => { cache.delete(id); cache.set(id, value); if (cache.size > 64) cache.delete(cache.keys().next().value!); },
  };
}
