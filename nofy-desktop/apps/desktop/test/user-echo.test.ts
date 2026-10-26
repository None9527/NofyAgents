import assert from "node:assert/strict";
import test from "node:test";
import { projectEvent } from "../renderer/core/project.ts";
import { initialState, type Block, type SessionState } from "../renderer/core/store/state.ts";
import { presentUserEcho } from "../renderer/core/userEcho.ts";
import { exportLoadedConversation } from "../renderer/features/conversation/exportModel.ts";
import { findInConversation } from "../renderer/features/conversation/findModel.ts";

const MONITOR = `<system-reminder>
Monitor "01a1405f-15a1-7821-88e3-928bb4ebffc7" ended: [monitor ended: exited (code 0)].
Description: 测试监控
Use get_command_or_subagent_output("01a1405f-15a1-7821-88e3-928bb4ebffc7") for full output.
</system-reminder>`;

test("监控结束的 system-reminder 不进用户对话", () => {
  assert.equal(presentUserEcho(MONITOR, false).hidden, true);
});

test("hideFromScrollback 整段隐藏", () => {
  assert.deepEqual(presentUserEcho("普通一句", true), { text: "普通一句", hidden: true });
});

test("定时任务只留下包装后的正文", () => {
  const framed = "<system-reminder>\nThis is a scheduled task execution (task t1).\n</system-reminder>\n\n检查部署";
  assert.deepEqual(presentUserEcho(framed, false), { text: "检查部署", hidden: false });
});

test("用户自己写的话原样留下", () => {
  assert.deepEqual(presentUserEcho("读一下 README", false), { text: "读一下 README", hidden: false });
});

test("投影把带标记的回传记成隐藏块，回合仍在", () => {
  const state = projectEvent(initialState(), {
    type: "session-update",
    sessionId: "s",
    kind: "user_message_chunk",
    update: {
      sessionUpdate: "user_message_chunk",
      content: { type: "text", text: MONITOR },
      _meta: { hideFromScrollback: true, promptIndex: 2, modelId: "m" },
    },
    meta: {},
  });
  const block = state.sessions.s?.blocks[0];
  assert.equal(block?.kind, "user-message");
  if (block?.kind !== "user-message") return;
  assert.equal(block.hidden, true);
  assert.equal(block.promptIndex, 2);
  assert.equal(state.sessions.s?.turns.length, 1);
});

test("搜索和导出都不带隐藏回传", () => {
  const hidden: Block = { kind: "user-message", id: "u", text: MONITOR, promptIndex: 1, modelId: null, hidden: true };
  const answer: Block = { kind: "agent-message", id: "a", text: "监控功能测试完成", closed: true, usage: null };
  assert.equal(findInConversation([hidden, answer], "system-reminder").length, 0);
  assert.equal(findInConversation([hidden, answer], "监控功能").length, 1);
  const session = {
    id: "s",
    title: "t",
    blocks: [hidden, answer],
    turns: [{ startedAt: 1, endedAt: 2 }],
  } as SessionState;
  const exported = exportLoadedConversation(session).text;
  assert.equal(exported.includes("system-reminder"), false);
  assert.equal(exported.includes("监控功能测试完成"), true);
});
