/**
 * dock 模型的门。
 *
 * 钉的是**语义**而不是实现：process_ended 不是退出、无变化必须同引用（输出帧的重渲闸门）、
 * 内核重启后 missing、tab 命名照活壳口径。这几条错了界面上都表现为「看起来还活着其实不能输入」
 * 或「每条命令跑完就标死」，属于最难归因的一类回归。
 */
import assert from "node:assert/strict";
import test from "node:test";
import type { TerminalFrame } from "../renderer/core/ptybus.ts";
import {
  applyFrame,
  adoptableTerminals,
  exitNote,
  makeTab,
  nextActiveAfterClose,
  nextTabName,
  reconcile,
  tabNameFromCwd,
} from "../renderer/features/shell/dockModel.ts";
import type { TerminalInfo } from "../renderer/ui/readers.ts";

const CWD = "/Users/mac/nofy-build";

function frame(partial: Partial<TerminalFrame> & { terminalId: string }): TerminalFrame {
  return {
    type: "output",
    text: null,
    exitCode: null,
    signal: null,
    outputOffset: null,
    isReplay: false,
    ...partial,
  };
}

function info(partial: Partial<TerminalInfo> & { terminalId: string }): TerminalInfo {
  return {
    name: null,
    status: "connected",
    interactive: true,
    exitCode: null,
    cwd: null,
    ...partial,
  };
}

test("tab 命名照活壳口径：cwd 末段，重名追加 2 / 3", () => {
  assert.equal(tabNameFromCwd(CWD), "nofy-build");
  assert.equal(tabNameFromCwd("/a/b/"), "b");
  assert.equal(tabNameFromCwd("C:\\work\\demo"), "demo");
  assert.equal(tabNameFromCwd(null), "terminal");
  assert.equal(nextTabName([], CWD), "nofy-build");
  const one = [makeTab("t1", "nofy-build")];
  assert.equal(nextTabName(one, CWD), "nofy-build 2", "活壳第二个 tab 就叫 'nofy-build 2'");
  const two = [...one, makeTab("t2", "nofy-build 2")];
  assert.equal(nextTabName(two, CWD), "nofy-build 3");
});

test("接管只认交互 pty：agent 的管道终端（interactive=false）不能变成 tab", () => {
  // 内核的 terminal/list 是 list_ptys() + list_piped_terminals() 的合并
  // （nofy-shell-terminal/src/lib.rs:105-110），且 list 忽略 sessionId
  // （extensions/terminal.rs:342-345）⇒ 过滤必须在客户端做。
  const list = [
    info({ terminalId: "pty-1", interactive: true, name: "nofy-build" }),
    info({ terminalId: "piped-1", interactive: false, name: "bash", status: "exited", exitCode: 0 }),
    info({ terminalId: "pty-2", interactive: true, name: "nofy-build 2" }),
  ];
  assert.deepEqual(
    adoptableTerminals(list).map((t) => t.terminalId),
    ["pty-1", "pty-2"],
  );
});

test("exit 帧才算退出：置 exited + code，并清掉 busy", () => {
  const tabs = [{ ...makeTab("t1", "nofy-build"), busy: true }];
  const next = applyFrame(tabs, frame({ terminalId: "t1", type: "exit", exitCode: 1 }));
  assert.equal(next[0]?.exited, true);
  assert.equal(next[0]?.exitCode, 1);
  assert.equal(next[0]?.busy, false);
});

test("process_ended 是忙→闲，**不是**退出（内核源码 :550 的语义）", () => {
  const tabs = [{ ...makeTab("t1", "nofy-build"), busy: true }];
  const next = applyFrame(tabs, frame({ terminalId: "t1", type: "process_ended" }));
  assert.equal(next[0]?.busy, false);
  assert.equal(next[0]?.exited, false, "把 process_ended 当退出，每条命令跑完都会误标终端已死");
  const started = applyFrame(next, frame({ terminalId: "t1", type: "process_started" }));
  assert.equal(started[0]?.busy, true);
});

test("普通 output 帧不改 tab 状态：必须返回**同一个数组引用**（重渲闸门）", () => {
  const tabs = [makeTab("t1", "nofy-build")];
  assert.equal(applyFrame(tabs, frame({ terminalId: "t1", type: "output", text: "hi" })), tabs);
  assert.equal(applyFrame(tabs, frame({ terminalId: "别的窗口", type: "exit", exitCode: 0 })), tabs);
  assert.equal(applyFrame(tabs, frame({ terminalId: "t1", type: "以后内核新加的词" })), tabs);
});

test("isReplay 的 output 帧记下 replayed（视图据此先 reset 再喂）", () => {
  const tabs = [makeTab("t1", "nofy-build")];
  const once = applyFrame(tabs, frame({ terminalId: "t1", type: "output", text: "历史", isReplay: true }));
  assert.equal(once[0]?.replayed, true);
  assert.equal(applyFrame(once, frame({ terminalId: "t1", type: "output", text: "历史", isReplay: true })), once, "第二次回放不该再产生新引用");
});

test("reconcile：列表里没有 ⇒ missing；status=exited ⇒ 用列表的退出码；connected ⇒ 清 missing", () => {
  const tabs = [makeTab("gone", "a"), makeTab("dead", "b"), makeTab("live", "c")];
  const next = reconcile(tabs, [info({ terminalId: "dead", status: "exited", exitCode: 137 }), info({ terminalId: "live" })]);
  assert.equal(next[0]?.missing, true, "内核重启后这个 tab 指向不存在的 pty");
  assert.equal(next[0]?.busy, false);
  assert.equal(next[1]?.exited, true);
  assert.equal(next[1]?.exitCode, 137);
  assert.equal(next[2]?.missing, false);
  assert.equal(next[2]?.exited, false);
  assert.equal(reconcile(next, [info({ terminalId: "dead", status: "exited", exitCode: 137 }), info({ terminalId: "live" })]).find((t) => t.terminalId === "gone")?.missing, true);
  const none: ReturnType<typeof makeTab>[] = [];
  assert.equal(reconcile(none, []), none, "空集合原样返回（不制造新引用）");
});

test("关掉活动 tab 后：右邻顶上；关最后一个回左邻；关唯一剩 null；关非活动 tab 不变", () => {
  const tabs = [makeTab("a", "a"), makeTab("b", "b"), makeTab("c", "c")];
  assert.equal(nextActiveAfterClose(tabs, "b", "b"), "c");
  assert.equal(nextActiveAfterClose(tabs, "c", "c"), "b");
  assert.equal(nextActiveAfterClose([tabs[0]!], "a", "a"), null);
  assert.equal(nextActiveAfterClose(tabs, "a", "c"), "c", "关的不是活动 tab ⇒ 活动不变");
});

test("退出文案说的是事实：missing / 信号 / 退出码三种", () => {
  assert.match(exitNote({ exitCode: null, signal: null, missing: true }), /内核/);
  assert.match(exitNote({ exitCode: 1, signal: null, missing: false }), /code=1/);
  assert.match(exitNote({ exitCode: null, signal: "SIGTERM", missing: false }), /SIGTERM/);
  assert.equal(exitNote({ exitCode: null, signal: null, missing: false }).includes("\r\n"), true, "要能直接写进终端正文");
});
