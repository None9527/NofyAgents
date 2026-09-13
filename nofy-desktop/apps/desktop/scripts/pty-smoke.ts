/**
 * PTY 回显门（生态面 #3 终端 dock 的契约门）。
 *
 *   node apps/desktop/scripts/pty-smoke.ts            # 全部门（8 条，本机约 4s）
 *   node apps/desktop/scripts/pty-smoke.ts --fast     # 跳过 ⑧（唯一要起真用户 shell 的那条）
 *
 * ## 为什么必须有这道门
 *
 * terminal/pty/input 是**通知**：内核解析失败只 tracing::warn，线路上没有任何错误通道
 * （extensions/terminal.rs:88-91 的 PtyInputNotification 只有 {terminalId, data}，:358 做 base64 解码）。
 * 也就是说**写错了键名或用 rpc 发，界面永远收不到报错**，用户只会看到一个敲不进字的终端。
 * 探针第一轮就栽在这里：用 input 键发，帧数照样在涨（那是 shell 自己的启动输出），
 * 当时被记成了「写入成功」。唯一能证明写入生效的办法是**看回显**。
 *
 * ## 门覆盖的契约（每条都是 dock 真在用的）
 *
 *   ① pty/create ⇒ {result:{terminalId}}
 *   ② notify + data:<base64> ⇒ 输出帧里出现**命令的产物**（写入生效的唯一证据）
 *   ③ 负对照：用 input 键 ⇒ **不得**回显（把「静默丢弃」这个陷阱钉住，防止将来改回去）
 *   ④ terminal/list{sessionId} 里有它，status=connected（dock 的存活核对）
 *   ⑤ pty/load ⇒ 收到 isReplay:true 的 output 帧且含 ② 的回显
 *      —— 这是第一方设计的重挂接路径（pty_session.rs:773-815：重绑通知目标 + 回放 256KiB 环形缓冲，
 *      源码写明客户端要「reset its VTE emulator and feed all bytes from scratch」），
 *      dock 接管已有终端靠的就是它，回放不来则接管出来的 tab 是空白假壳。
 *   ⑥ terminal/kill ⇒ exit 帧（带数字 exitCode）
 *   ⑦ kill 之后 list 里不再是 connected
 *   ⑧ **默认 shell**（不传 shell ⇒ 内核走 $SHELL -l，pty_session.rs:709-718）也能起来并回显。
 *      这条量的是 dock 的真实首屏。本机 $SHELL=fish 4.7.1，实测三轮才弄明白它的等待条件：
 *        · 谁都不答         ⇒ 启动等满 10s（并打一条 DA1 超时警告），提示符处再等 10s 才读输入；
 *        · 只答启动那轮 DA1 ⇒ 93ms 出提示符，但**提示符处那轮**（OSC 11 / CPR / 再一次 DA1）没人答
 *                             ⇒ 写进去的命令 10s 后才被执行（本门第一版 ⑧ 就死在这里）；
 *        · 按 xterm 口径全答 ⇒ 首屏静默 1.1s、命令产物 101ms（现在的门，全程约 4s）。
 *      ⇒ 结论是**客户端义务**而不是 shell 毛病：终端必须持续应答能力查询。真 app 里 xterm 自动做，
 *        无头门里由下面的 startResponder 做。它失败意味着「用户的 shell 在我们的终端里起不来」。
 *
 * ## 一个量法上的坑（本门第一版就栽了）：**tty 回显 ≠ shell 执行**
 *
 * pty 的行规程默认开 ECHO：写进去的字节会**立刻**被 tty 原样回显，与 shell 有没有读到、
 * 有没有执行完全无关（实测：create 后 50ms 内发命令，72ms 就「看到回显」，而 fish 那会儿
 * 还在等终端能力查询，10 秒后才出提示符）。所以断言不能用「输入里那个标记出现了没有」，
 * 否则门量的是 tty，不是 shell。
 *
 * 办法：发的命令是 echo <小写标记> | tr a-z A-Z，断言**大写标记**出现。
 * tty 回显只能给出小写原文，大写只可能来自命令真的跑了 ⇒ 一条断言同时覆盖
 * 「字节进了 pty」「shell 读到了」「shell 执行了」「输出帧回到我们手上」四件事。
 *
 * 隔离：hermetic NOFY_HOME（不复制用户配置 ⇒ 不带真实凭据），pty 用 mkdtemp 的临时工作区。
 */
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { AGENT_METHOD, EXT_DISPATCH_ONLY, EXT_NOTIFY } from "@nofy-desktop/acp";
import { ensureKernel } from "../main/acp/connection.ts";
import type { KernelConnection } from "../main/acp/connection.ts";
import { createIsolatedNofyHome } from "../main/kernel/test-home.ts";
import { installReapHooks, kernelChildCount, setKernelEnv, shutdownKernel } from "../main/kernel/supervisor.ts";

const FAST = process.argv.includes("--fast");

const gates: Array<[string, boolean, string]> = [];
function gate(name: string, ok: boolean, detail: string): void {
  gates.push([name, ok, detail]);
  console.log((ok ? "  PASS  " : "  FAIL  ") + name + "  —  " + detail);
}
function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
/** 响应包装不统一（实测三种）；取里层。 */
function unwrap(v: unknown): Record<string, unknown> {
  if (!isObj(v)) return {};
  return isObj(v["result"]) ? v["result"] : v;
}
const wait = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
const b64 = (text: string): string => Buffer.from(text, "utf8").toString("base64");

type Frame = { kind: string; method?: string; params?: unknown };
type PtyNote = { type: string; text: string; isReplay: boolean; exitCode: number | null; at: number };

/** 挂一个 pty 通知收集器（只收 _nofy/terminal/pty/notification）。 */
function collect(conn: KernelConnection): {
  notes: PtyNote[];
  text: () => string;
  off: () => void;
} {
  const notes: PtyNote[] = [];
  const t0 = Date.now();
  const off = conn.on("frame", (f: Frame) => {
    if (f.kind !== "notification" || f.method === undefined || !f.method.includes("terminal/pty")) return;
    const p = isObj(f.params) ? f.params : {};
    const type = typeof p["type"] === "string" ? p["type"] : "?";
    let text = "";
    const d = p["data"];
    if (typeof d === "string" && d.length > 0) text = Buffer.from(d, "base64").toString("utf8");
    notes.push({
      type,
      text,
      isReplay: p["isReplay"] === true,
      exitCode: typeof p["exitCode"] === "number" ? p["exitCode"] : null,
      at: Date.now() - t0,
    });
  });
  return { notes, text: () => notes.map((n) => n.text).join(""), off };
}

/** 轮询等到谓词为真（或超时）。返回耗时 ms；超时返回 -1。 */
async function until(pred: () => boolean, budgetMs: number): Promise<number> {
  const t0 = Date.now();
  for (;;) {
    if (pred()) return Date.now() - t0;
    if (Date.now() - t0 > budgetMs) return -1;
    await wait(100);
  }
}

/* ═══════════ 无头门里的「最小终端应答器」 ═══════════
 *
 * shell 启动时、以及**每次画提示符时**都会向终端发能力查询；没人应答就等满 10 秒。
 * 实测（本机 $SHELL=fish 4.7.1）：
 *   · 启动那轮（kitty 键盘 ESC[?u、XTVERSION ESC[>0q、OSC 11、DCS+q ×2、DA1 ESC[0c）
 *     —— 只要 DA1 被答上，93ms 就出提示符（其余几种没答也不阻塞）；
 *   · 提示符那轮（OSC 11、CPR ESC[6n、再一次 DA1）—— **没人答 ⇒ 我们写进去的命令 10 秒后才被读到**。
 *     这正是本门第一版 ⑧ 的失败原因（当时只答了第一次 DA1）。
 * 真 app 里这些由 xterm 自动应答，门里没有 xterm ⇒ 自己答。回复串一律**逐字取自 xterm 6 源码**，
 * 不自己编（@xterm/xterm@6.0.0）：
 *   DA1   CSI c       → ESC[?1;2c                    common/InputHandler.ts:1672
 *   DA2   CSI > c     → ESC[>0;276;0c                common/InputHandler.ts:1711
 *   CPR   CSI 6 n     → ESC[<row>;<col>R             common/InputHandler.ts:2663（无头不知真实光标 ⇒ 回 1;1）
 *   OSC 10/11/12 ; ?  → ESC]<n>;rgb:RRRR/GGGG/BBBB ESC\
 *       （browser/CoreBrowserTerminal.ts:217 的模板 + common/input/XParseColor.ts:77 的 toRgbString，
 *        16 位每通道 ⇒ #161616 写成 1616；色值取我们暗主题的 background/foreground）
 * 不会自激：这些回复串本身不匹配任何查询模式（DA1 回复带 ?、OSC 回复带 rgb:），
 * 即便被 tty 回显回来也不会再触发一次应答。
 */
const XTERM_REPLIES: ReadonlyArray<{ name: string; re: RegExp; reply: string }> = [
  { name: "DA1", re: /\u001b\[(?:0)?c/g, reply: "\u001b[?1;2c" },
  { name: "DA2", re: /\u001b\[>0?c/g, reply: "\u001b[>0;276;0c" },
  { name: "CPR", re: /\u001b\[6n/g, reply: "\u001b[1;1R" },
  { name: "OSC10", re: /\u001b\]10;\?(?:\u001b\\|\u0007)/g, reply: "\u001b]10;rgb:e8e8/e8e8/e8e8\u001b\\" },
  { name: "OSC11", re: /\u001b\]11;\?(?:\u001b\\|\u0007)/g, reply: "\u001b]11;rgb:1616/1616/1616\u001b\\" },
  { name: "OSC12", re: /\u001b\]12;\?(?:\u001b\\|\u0007)/g, reply: "\u001b]12;rgb:e8e8/e8e8/e8e8\u001b\\" },
];

/** 每个 pty 一个应答器：轮询累积正文，把新出现的查询逐条答掉（每条只答一次）。 */
function startResponder(conn: KernelConnection, terminalId: string, getText: () => string): { stop: () => void; log: string[] } {
  const log: string[] = [];
  // 每条一份独立 lastIndex：同一个 RegExp 对象被两个 pty 共用会互相吃掉匹配位置
  const state = XTERM_REPLIES.map((q) => ({ name: q.name, re: new RegExp(q.re.source, "g"), reply: q.reply }));
  const timer = setInterval(() => {
    const text = getText();
    for (const q of state) {
      for (;;) {
        const m = q.re.exec(text);
        if (m === null) break;
        conn.notify(EXT_NOTIFY.terminalPtyInput, { terminalId, data: b64(q.reply) });
        log.push(q.name);
      }
    }
  }, 40);
  return { stop: () => clearInterval(timer), log };
}

/** 应答日志压成「DA1×12 CPR×4 …」：逐条列会淹掉门的输出（fish 每次重绘提示符都重问一遍）。 */
function summarize(log: string[]): string {
  const counts = new Map<string, number>();
  for (const name of log) counts.set(name, (counts.get(name) ?? 0) + 1);
  const parts = [...counts.entries()].map(([k, n]) => k + "×" + String(n));
  return parts.length === 0 ? "0 次" : String(log.length) + " 次（" + parts.join(" ") + "）";
}

async function main(): Promise<number> {
  installReapHooks();
  const home = createIsolatedNofyHome(); // hermetic：不复制用户配置（pty 门不需要凭据）
  setKernelEnv({ ...process.env, NOFY_HOME: home.path });
  const ws = mkdtempSync(join(tmpdir(), "nofy-pty-smoke-"));

  const conn = await ensureKernel(20_000);
  const ms = conn.modelState;
  const models = isObj(ms) && Array.isArray(ms["availableModels"]) ? ms["availableModels"] : [];
  const modelId = models.length > 1 ? String(isObj(models[1]) ? models[1]["id"] ?? "" : "") : "";

  console.log("");
  console.log("── PTY 回显门（home=" + home.path + "）──────────");
  console.log("  kernel:", conn.agentVersion, " pid:", String(conn.snapshot()["kernelPid"] ?? "?"));
  console.log("  $SHELL:", process.env["SHELL"] ?? "(unset ⇒ 内核退回 /bin/bash -l)", " fast:", FAST ? "on" : "off");

  /**
   * 会话是**可选**的：PtyCreateRequest.sessionId 是 Option（extensions/terminal.rs:47-58），
   * list 与 kill 对 pty 更是直接忽略它（terminal.rs:342-345；KillTerminalRequest 注释
   * 「session_id is required for piped terminals, ignored for PTY terminals」）。
   * 所以 hermetic home（不复制用户配置 ⇒ 无凭据）下 session/new 会回 "Authentication required"，
   * 这道门**照样跑得完**，只是少了 sessionId 这条参数路径；有凭据时走完整路径。
   * 这条设计是有意的：门不该依赖用户凭据（test-home.ts 头注的 hermetic 默认）。
   */
  let sessionId = "";
  try {
    const created = await conn.rpc(
      AGENT_METHOD.newSession,
      { cwd: ws, mcpServers: [], _meta: modelId.length > 0 ? { modelId } : {} },
      30_000,
    );
    sessionId = String(unwrap(created)["sessionId"] ?? "");
    if (sessionId.length === 0) console.log("  session/new 没给 sessionId ⇒ 无会话模式");
  } catch (e) {
    console.log("  session/new 不可用（" + (e instanceof Error ? e.message : String(e)) + "）⇒ 无会话模式");
  }
  console.log("  sessionId:", sessionId.length > 0 ? sessionId.slice(0, 12) : "(无会话模式)");
  /** 只在拿得到时带 sessionId：拿不到就不该发一个空串上去（内核会当它是一个真 id）。 */
  const sess = (o: Record<string, unknown>): Record<string, unknown> =>
    sessionId.length > 0 ? { sessionId, ...o } : o;

  // 小写标记 + tr 变换：见文件头「tty 回显 ≠ shell 执行」
  const MARK = "nofypty" + String(Math.floor(Math.random() * 1e6));
  const MARK_OUT = MARK.toUpperCase();
  const CMD = "echo " + MARK + " | tr a-z A-Z\n";
  const WRONG = "nofywrong" + String(Math.floor(Math.random() * 1e6));

  /* ── ①②③④⑤⑥⑦：显式 shell 的确定路径 ── */
  const rec = collect(conn);
  let terminalId = "";
  try {
    const res = await conn.ext(
      EXT_DISPATCH_ONLY.terminal_pty_create,
      // 显式 shell=/bin/bash：resolve_pty_shell(Some(s)) 不加 "-l"（pty_session.rs:710-712）
      // ⇒ 启动确定（实测 ~660ms 回显），门不必依赖用户 $SHELL 的配置文件。
      // dock 本身**不传** shell（走内核默认 $SHELL -l），那条路由 ⑧ 单独量。
      sess({ cwd: ws, rows: 24, cols: 80, name: "pty-smoke", shell: "/bin/bash", env: [{ name: "TERM", value: "xterm-256color" }] }),
      20_000,
    );
    terminalId = String(unwrap(res)["terminalId"] ?? "");
  } catch (e) {
    gate("① pty/create 给 terminalId", false, e instanceof Error ? e.message : String(e));
  }
  gate("① pty/create 给 terminalId", terminalId.length > 0, terminalId.slice(0, 12) || "(空)");

  if (terminalId.length > 0) {
    const resp = startResponder(conn, terminalId, () => rec.text());
    // ② 写入 = notify + data:<base64>
    const sent = conn.notify(EXT_NOTIFY.terminalPtyInput, { terminalId, data: b64(CMD) });
    const echoedMs = await until(() => rec.text().includes(MARK_OUT), 8_000);
    gate(
      "② notify+base64 ⇒ 命令真的跑了（大写产物出现）",
      sent && echoedMs >= 0,
      echoedMs >= 0
        ? "产物 @" + String(echoedMs) + "ms（tty 回显不算：断言的是 tr 之后的大写标记）"
        : "8s 内没等到 " + MARK_OUT + "；正文: " + JSON.stringify(rec.text().slice(-200)),
    );

    // ③ 负对照：input 键被静默丢弃（内核 parse 失败只 warn，没有错误通道）
    conn.notify(EXT_NOTIFY.terminalPtyInput, { terminalId, input: "echo " + WRONG + " | tr a-z A-Z\n" });
    const wrongMs = await until(
      () => rec.text().includes(WRONG) || rec.text().includes(WRONG.toUpperCase()),
      1_500,
    );
    gate(
      "③ 用 input 键发 ⇒ 什么都不出现（陷阱仍在）",
      wrongMs < 0,
      wrongMs < 0
        ? "1.5s 内连 tty 回显都没有 ⇒ 字节根本没进 pty，符合源码（parse 失败只 warn）"
        : "竟然出现了 @" + String(wrongMs) + "ms —— 须复核内核是否改了键名",
    );

    // ④ list 里有它，且 interactive=true（dock 就是按这个字段过滤的：
    //    内核的 list 是 list_ptys() + list_piped_terminals() 的合并，lib.rs:105-110）
    let listed = "";
    let status = "";
    let interactive = "";
    try {
      const res = await conn.ext(EXT_DISPATCH_ONLY.terminal_list, sess({}), 10_000);
      const arr = unwrap(res)["terminals"];
      const mine = Array.isArray(arr) ? arr.filter((x) => isObj(x) && String(x["terminalId"]) === terminalId) : [];
      const first = mine[0];
      listed = String(mine.length);
      status = isObj(first) ? String(first["status"] ?? "") : "";
      interactive = isObj(first) ? String(first["interactive"] ?? "") : "";
    } catch (e) {
      status = "list 失败: " + (e instanceof Error ? e.message : String(e));
    }
    gate(
      "④ terminal/list 里有它、connected、interactive=true",
      listed === "1" && status === "connected" && interactive === "true",
      "count=" + listed + " status=" + status + " interactive=" + interactive,
    );

    // ⑤ pty/load 回放（dock 接管已有终端的契约）
    const before = rec.notes.length;
    let loadExited = "";
    try {
      const res = await conn.ext(EXT_DISPATCH_ONLY.terminal_pty_load, { terminalId }, 10_000);
      loadExited = String(unwrap(res)["exited"] ?? "?");
    } catch (e) {
      loadExited = "load 失败: " + (e instanceof Error ? e.message : String(e));
    }
    const replayMs = await until(
      () => rec.notes.slice(before).some((n) => n.isReplay && n.type === "output" && n.text.includes(MARK_OUT)),
      4_000,
    );
    gate(
      "⑤ pty/load 回放 isReplay 且含命令产物",
      replayMs >= 0,
      replayMs >= 0
        ? "回放 @" + String(replayMs) + "ms exited=" + loadExited + "（环形缓冲连输出都在 ⇒ 接管的 tab 不是空白壳）"
        : "4s 内没收到含 " + MARK_OUT + " 的 isReplay 帧",
    );

    // ⑥ kill ⇒ exit 帧
    const beforeKill = rec.notes.length;
    let killOutcome = "";
    try {
      const res = await conn.ext(EXT_DISPATCH_ONLY.terminal_kill, sess({ terminalId }), 10_000);
      killOutcome = String(unwrap(res)["outcome"] ?? "?");
    } catch (e) {
      killOutcome = "kill 失败: " + (e instanceof Error ? e.message : String(e));
    }
    const exitMs = await until(() => rec.notes.slice(beforeKill).some((n) => n.type === "exit"), 4_000);
    const exitFrame = rec.notes.slice(beforeKill).find((n) => n.type === "exit");
    gate(
      "⑥ terminal/kill ⇒ exit 帧带数字 exitCode",
      exitMs >= 0 && exitFrame?.exitCode !== null,
      "outcome=" + killOutcome + " exit@" + String(exitFrame?.at ?? -1) + "ms code=" + String(exitFrame?.exitCode ?? "null"),
    );

    // ⑦ kill 之后不再 connected
    let after = "";
    try {
      const res = await conn.ext(EXT_DISPATCH_ONLY.terminal_list, sess({}), 10_000);
      const arr = unwrap(res)["terminals"];
      const mine = Array.isArray(arr) ? arr.filter((x) => isObj(x) && String(x["terminalId"]) === terminalId) : [];
      const first = mine[0];
      after = mine.length === 0 ? "gone" : isObj(first) ? String(first["status"] ?? "") : "?";
    } catch (e) {
      after = "list 失败: " + (e instanceof Error ? e.message : String(e));
    }
    gate("⑦ kill 之后 list 里不再 connected", after !== "connected", "status=" + after);
    resp.stop();
    console.log("  （应答器共答 " + String(resp.log.length) + " 次: " + (resp.log.join(",") || "无 —— bash 不发能力查询") + "）");
  }
  rec.off();

  /* ── ⑧ 默认 shell（dock 的真实首屏）── */
  if (!FAST) {
    const rec2 = collect(conn);
    const MARK2 = "nofydef" + String(Math.floor(Math.random() * 1e6));
    let id2 = "";
    try {
      const res = await conn.ext(
        EXT_DISPATCH_ONLY.terminal_pty_create,
        sess({ cwd: ws, rows: 24, cols: 80, name: "pty-smoke-default" }),
        20_000,
      );
      id2 = String(unwrap(res)["terminalId"] ?? "");
    } catch (e) {
      gate("⑧ 默认 shell 能起来并执行命令", false, "create 失败: " + (e instanceof Error ? e.message : String(e)));
    }
    if (id2.length > 0) {
      const resp2 = startResponder(conn, id2, () => rec2.text());
      /* **等静默再发**——这是本门第二次栽跟头换来的量法：
       * create 后 50ms 就把命令灌进去，tty 会立刻回显（看着像成功），但 shell 还在能力探测阶段，
       * fish 启动完会**丢弃**这段待处理输入 ⇒ 命令永远不执行（实测：25s 内没有产物，
       * 正文里只有 tty 回显的那一行 + Welcome to fish）。
       * 人也是等提示符出来才敲字的，门就照这个来：输出连续 800ms 不增长 ⇒ 视为就绪。
       * 顺带这把「dock 的真实首屏延迟」量出来了（quietMs），那是用户体感的第一屏。 */
      const t0 = Date.now();
      let lastLen = -1;
      let lastGrow = Date.now();
      let quietMs = -1;
      while (Date.now() - t0 < 25_000) {
        await wait(120);
        const len = rec2.text().length;
        if (len !== lastLen) {
          lastLen = len;
          lastGrow = Date.now();
        } else if (Date.now() - lastGrow >= 800) {
          quietMs = Date.now() - t0;
          break;
        }
      }
      conn.notify(EXT_NOTIFY.terminalPtyInput, { terminalId: id2, data: b64("echo " + MARK2 + " | tr a-z A-Z\n") });
      const execMs = await until(() => rec2.text().includes(MARK2.toUpperCase()), 8_000);
      resp2.stop();
      gate(
        "⑧ 默认 shell（$SHELL -l）就绪后能执行命令",
        quietMs >= 0 && execMs >= 0,
        quietMs >= 0 && execMs >= 0
          ? "首屏静默 @" + String(quietMs) + "ms，命令产物 @" + String(execMs) + "ms，应答 " + summarize(resp2.log)
          : "静默=" + String(quietMs) + "ms 产物=" + String(execMs) + "ms 应答 " + summarize(resp2.log) + "；正文: " + JSON.stringify(rec2.text().slice(0, 600)),
      );
      if (quietMs > 5_000) {
        console.log("  注意: 默认 shell 首屏 " + String(quietMs) + "ms（>5s）。本机 $SHELL=fish 4 时属预期：");
        console.log("        它启动要等终端能力查询的应答；xterm 只代答 DA1/DA2/OSC 11/光标位置，");
        console.log("        其余（XTVERSION / kitty 键盘 / DCS+q）没人答 ⇒ 等满 10s 才出提示符。");
        console.log("        这段就是 dock 的第一屏体感；要缩短得在客户端补答那几种查询（正确回复格式尚未实测）。");
      }
      await conn.ext(EXT_DISPATCH_ONLY.terminal_kill, sess({ terminalId: id2 }), 10_000).catch(() => {});
    }
    rec2.off();
  }

  conn.close();
  shutdownKernel();
  setKernelEnv(null);
  home.cleanup();
  rmSync(ws, { recursive: true, force: true });

  const failed = gates.filter((g) => !g[1]);
  console.log("");
  console.log("── 结果: " + String(gates.length - failed.length) + "/" + String(gates.length) + " PASS ──");
  for (const f of failed) console.log("   FAILED:", f[0], "—", f[2]);
  console.log("  内核子进程残留:", String(kernelChildCount()));
  return failed.length === 0 && kernelChildCount() === 0 ? 0 : 1;
}

main()
  .then((code) => {
    process.exitCode = code;
    setTimeout(() => process.exit(code), 150).unref();
  })
  .catch((e) => {
    console.error("");
    console.error("PTY SMOKE CRASHED:", e instanceof Error ? e.stack : String(e));
    shutdownKernel();
    setKernelEnv(null);
    process.exit(1);
  });
