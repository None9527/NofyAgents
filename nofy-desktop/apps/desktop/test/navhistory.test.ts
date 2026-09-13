/**
 * 视图导航历史（侧栏叠层的后退 / 前进）门禁。
 *
 * 为什么单独测：这套语义全是「浏览器历史的常识」，而常识最容易在改写时丢一条——
 * 少了「后退之后再点别的要丢掉前进分支」，前进就会跳回一条用户以为已经放弃的路径；
 * 少了截断，栈会随会话数无界长。这些走样在截图上完全看不出来。
 */
import assert from "node:assert/strict";
import test from "node:test";
import { NAV_LIMIT, navCanStep, navCurrent, navEmpty, navPush, navStep } from "../renderer/features/shell/navhistory.ts";

test("空历史：没有当前项，两个方向都不能走", () => {
  const h = navEmpty();
  assert.equal(navCurrent(h), null);
  assert.equal(navCanStep(h, -1), false);
  assert.equal(navCanStep(h, 1), false);
  assert.deepEqual(navStep(h, -1), h, "越界 step 必须原样返回（同一引用，组件据此不触发重渲）");
});

test("入栈：顺序即历史，当前项永远是最后一次访问", () => {
  let h = navEmpty();
  h = navPush(h, "a");
  h = navPush(h, "b");
  h = navPush(h, "c");
  assert.deepEqual(h.stack, ["a", "b", "c"]);
  assert.equal(h.index, 2);
  assert.equal(navCurrent(h), "c");
});

test("重复访问同一会话不产生历史（点自己不该让后退多一步）", () => {
  const h = navPush(navPush(navEmpty(), "a"), "a");
  assert.deepEqual(h.stack, ["a"]);
  assert.equal(navCanStep(h, -1), false);
});

test("空 id 被忽略（会话还没建出来时的激活不算一次访问）", () => {
  const h = navEmpty();
  assert.deepEqual(navPush(h, ""), h);
});

test("后退 / 前进移动游标，不改栈", () => {
  let h = navPush(navPush(navPush(navEmpty(), "a"), "b"), "c");
  h = navStep(h, -1);
  assert.equal(navCurrent(h), "b");
  h = navStep(h, -1);
  assert.equal(navCurrent(h), "a");
  assert.equal(navCanStep(h, -1), false, "栈底再后退就越界了");
  h = navStep(h, 1);
  assert.equal(navCurrent(h), "b");
  assert.deepEqual(h.stack, ["a", "b", "c"], "step 不该动栈");
});

test("在中间位置入栈 ⇒ 丢掉前进分支（浏览器语义）", () => {
  let h = navPush(navPush(navPush(navEmpty(), "a"), "b"), "c");
  h = navStep(h, -1); // 站在 b
  h = navPush(h, "d");
  assert.deepEqual(h.stack, ["a", "b", "d"]);
  assert.equal(navCurrent(h), "d");
  assert.equal(navCanStep(h, 1), false, "c 已经被放弃，前进不该还通着它");
});

test("超上限从头部截断，游标仍指向栈尾", () => {
  let h = navEmpty();
  for (let i = 0; i < NAV_LIMIT + 10; i++) h = navPush(h, "s" + String(i));
  assert.equal(h.stack.length, NAV_LIMIT);
  assert.equal(h.index, NAV_LIMIT - 1);
  assert.equal(navCurrent(h), "s" + String(NAV_LIMIT + 9));
  assert.equal(h.stack[0], "s10", "头部被截掉 10 条");
});
