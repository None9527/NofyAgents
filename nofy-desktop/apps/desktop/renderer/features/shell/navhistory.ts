/**
 * 视图导航历史（后退 / 前进）的**纯模型**。
 *
 * ## 为什么存在
 *
 * 活壳 3.11.2 的侧栏叠层第 2、3 枚按钮是「后退」「前进」（CDP 实测 aria-label
 * 与 lucide-arrow-left/right，28×28，x=128/160）。我们的视图只有一个维度
 * （当前激活的会话），所以历史栈记的就是**会话激活序列**：每次用户主动切换会话
 * 入栈，后退/前进在栈上移动游标。
 *
 * 与 ⌘⇧[ / ⌘⇧] 的分工（两者都留着，语义不同）：
 *   - 环形切换 = 在**当前已加载会话集合**里按 id 序走一步（活壳同键位）；
 *   - 后退/前进 = 沿**我刚才看过的顺序**回溯（跨加载状态，包含已卸载/roster 会话）。
 *
 * 纯函数 + 不可变：住 features/ 但不碰 DOM（dep-guard 允许），可被 node --test 直接驱动。
 */

export type NavHistory = {
  /** 访问序列，index 指向「当前所在」。 */
  stack: string[];
  index: number;
};

/** 栈上限：够回溯一天的跳转，又不至于让内存随会话数无界增长。 */
export const NAV_LIMIT = 64;

export function navEmpty(): NavHistory {
  return { stack: [], index: -1 };
}

export function navCurrent(h: NavHistory): string | null {
  return h.stack[h.index] ?? null;
}

/**
 * 入栈一次访问。
 *
 * 三条规则（都是浏览器历史的常识，写下来是因为它们决定手感）：
 *  1. 与当前项相同 ⇒ 原样返回（点自己不该产生历史）；
 *  2. 在中间位置入栈 ⇒ **丢掉前进分支**（后退两步再点别的，前进就不该还通着旧路径）；
 *  3. 超上限 ⇒ 从头部截断，游标跟着左移。
 */
export function navPush(h: NavHistory, sessionId: string): NavHistory {
  if (sessionId.length === 0) return h;
  if (navCurrent(h) === sessionId) return h;
  const truncated = h.index >= 0 ? h.stack.slice(0, h.index + 1) : [];
  let stack = [...truncated, sessionId];
  let index = stack.length - 1;
  if (stack.length > NAV_LIMIT) {
    const drop = stack.length - NAV_LIMIT;
    stack = stack.slice(drop);
    index = stack.length - 1;
  }
  return { stack, index };
}

export function navCanStep(h: NavHistory, delta: number): boolean {
  const next = h.index + delta;
  return next >= 0 && next < h.stack.length;
}

/** 移动游标；越界则原样返回（按钮同时会 disabled，这里再守一次）。 */
export function navStep(h: NavHistory, delta: number): NavHistory {
  if (!navCanStep(h, delta)) return h;
  return { stack: h.stack, index: h.index + delta };
}
