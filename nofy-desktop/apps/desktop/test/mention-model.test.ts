/**
 * @ / $ 触发器门禁。钉内核语法：
 *  1. @token 全文任意位置有效（collect_file_references 扫全文，prompt_parser.rs:205）；
 *  2. $ 只认第 0 位（技能落成 "/name "，斜杠只在首块开头，slash_commands.rs:1479）；
 *  3. 替换是「连前缀一起覆盖到 token 末尾」，不动 token 前后的文本。
 */
import assert from "node:assert/strict";
import test from "node:test";
import {
  mentionTokenFor,
  spliceToken,
  triggerTokenOf,
} from "../renderer/features/conversation/mentionModel.ts";

test("@ 触发器：任意位置、空白收口、代码 @ 不抢键、CJK 前一字符也触发", () => {
  assert.deepEqual(triggerTokenOf("@"), { prefix: "@", start: 0, query: "" });
  assert.deepEqual(triggerTokenOf("@con"), { prefix: "@", start: 0, query: "con" });
  assert.deepEqual(triggerTokenOf("看下 @apps/x.ts 再"), null, "token 已被空白收口");
  assert.deepEqual(triggerTokenOf("看下 @app"), { prefix: "@", start: 3, query: "app" });
  assert.deepEqual(triggerTokenOf("mail@host"), null, "前一字符不是边界＝代码/邮箱 @");
  assert.deepEqual(triggerTokenOf("(@app"), { prefix: "@", start: 1, query: "app" });
  assert.deepEqual(triggerTokenOf("hi"), null);
  assert.deepEqual(triggerTokenOf("看下这个文件@readers"), { prefix: "@", start: 6, query: "readers" }, "中文不打空格必须触发");
  assert.deepEqual(triggerTokenOf("foo@bar.ts"), null, "标识符续接符不触发");
  assert.deepEqual(triggerTokenOf("a/b@c"), null, "路径续接符（/）后不触发");
  assert.deepEqual(triggerTokenOf("（@app"), { prefix: "@", start: 1, query: "app" }, "全角标点也是边界");
});

test("$ 触发器：只认第 0 位，空白收口", () => {
  assert.deepEqual(triggerTokenOf("$"), { prefix: "$", start: 0, query: "" });
  assert.deepEqual(triggerTokenOf("$ver"), { prefix: "$", start: 0, query: "ver" });
  assert.deepEqual(triggerTokenOf("$vercel x"), null);
  assert.deepEqual(triggerTokenOf("a $ver"), null, "文中 $ 不触发（落进去是死斜杠）");
});

test("@ 优先于 $：draft 以 $ 开头但后面又打 @ 时按 @ 走", () => {
  // $ 开头且无空白 ⇒ $ 触发；但 lastIndexOf("@") 存在时……实现里 $ 分支先行，
  // 故 "$x@y" 仍判 $（查询含 @）。钉住这个既定语义，防止后来者无意改序。
  assert.deepEqual(triggerTokenOf("$x@y"), { prefix: "$", start: 0, query: "x@y" });
});

test("spliceToken：连前缀覆盖到 token 末尾，前后文本不动", () => {
  assert.equal(spliceToken("看下 @app", 3, "@apps/x.ts "), "看下 @apps/x.ts ");
  assert.equal(spliceToken("$ver", 0, "/vercel-deploy "), "/vercel-deploy ");
  assert.equal(spliceToken("", 0, "@a "), "@a ");
});

test("mentionTokenFor：cwd 下剥相对，末尾空格收 token", () => {
  const item = { path: "/ws/a/b.ts", name: "b.ts", kind: "file" as const };
  assert.equal(mentionTokenFor(item, "/ws"), "@a/b.ts ");
  assert.equal(mentionTokenFor(item, null), "@/ws/a/b.ts ");
  assert.equal(mentionTokenFor(item, "/other"), "@/ws/a/b.ts ");
});
