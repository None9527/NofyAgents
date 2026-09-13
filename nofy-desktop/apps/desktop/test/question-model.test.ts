/**
 * questionModel 门禁。钉内核契约（nofy-tools ask_user_question/types.rs 逐字）：
 *  1. 请求键 camelCase + multiSelect/multi_select 双别名；形状不符的题整条跳过；
 *  2. accepted 的 answers 键＝题干原文、按原序、未答省略；
 *  3. 纯自由文本＝["Other"] + annotations.notes；preview 仅单选逐字带；空 annotations 整键省略；
 *  4. 零题已答 ⇒ null（界面禁提交，不发空 accepted 混淆取消语义）。
 */
import assert from "node:assert/strict";
import test from "node:test";
import {
  acceptedPayload,
  emptySelections,
  isAnswered,
  readQuestionnaire,
} from "../renderer/features/approvals/questionModel.ts";

const PARAMS = {
  sessionId: "s1",
  toolCallId: "tc1",
  mode: "plan",
  questions: [
    {
      question: "新建的 txt 放哪里、叫什么名字？",
      options: [
        { label: "notes.txt", description: "工作区根目录创建空 notes.txt", preview: "<div>a</div>" },
        { label: "docs/new.txt", description: "docs 目录下" },
      ],
    },
    {
      question: "要写初始内容吗？",
      options: [{ label: "空文件", description: "不写" }],
      multiSelect: true,
    },
    { question: "坏题", options: "不是数组" },
  ],
};

test("readQuestionnaire：camelCase + 双别名 + 坏题跳过", () => {
  const q = readQuestionnaire(PARAMS);
  assert.equal(q.mode, "plan");
  assert.equal(q.questions.length, 2, "坏题整条跳过");
  assert.equal(q.questions[0]?.options.length, 2);
  assert.equal(q.questions[0]?.options[0]?.preview, "<div>a</div>");
  assert.equal(q.questions[1]?.multiSelect, true);
  const alias = readQuestionnaire({ questions: [{ question: "q", options: [], multi_select: true }] });
  assert.equal(alias.questions[0]?.multiSelect, true, "multi_select 别名也认");
});

test("acceptedPayload：原序、未答省略、preview 仅单选", () => {
  const q = readQuestionnaire(PARAMS);
  const sels = emptySelections(q.questions.length);
  sels[0] = { labels: ["notes.txt"], notes: "" };
  const p = acceptedPayload(q.questions, sels);
  assert.deepEqual(p, {
    outcome: "accepted",
    answers: { "新建的 txt 放哪里、叫什么名字？": ["notes.txt"] },
    annotations: { "新建的 txt 放哪里、叫什么名字？": { preview: "<div>a</div>" } },
  });
});

test("acceptedPayload：纯自由文本＝Other+notes；多选不带 preview", () => {
  const q = readQuestionnaire(PARAMS);
  const sels = emptySelections(q.questions.length);
  sels[0] = { labels: [], notes: "  叫 a.txt  " };
  sels[1] = { labels: ["空文件"], notes: "" };
  const p = acceptedPayload(q.questions, sels) as Record<string, any>;
  assert.deepEqual(p.answers, {
    "新建的 txt 放哪里、叫什么名字？": ["Other"],
    "要写初始内容吗？": ["空文件"],
  });
  assert.deepEqual(p.annotations, { "新建的 txt 放哪里、叫什么名字？": { notes: "叫 a.txt" } }, "trim 后入 notes；多选题无 preview");
});

test("acceptedPayload：零题已答 ⇒ null；isAnswered 认空白为未答", () => {
  const q = readQuestionnaire(PARAMS);
  assert.equal(acceptedPayload(q.questions, emptySelections(q.questions.length)), null);
  const sels = emptySelections(1);
  sels[0] = { labels: [], notes: "   " };
  assert.equal(isAnswered(sels[0]), false);
  assert.equal(acceptedPayload(q.questions.slice(0, 1), sels), null);
});

