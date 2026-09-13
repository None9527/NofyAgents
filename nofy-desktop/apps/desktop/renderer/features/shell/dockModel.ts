/**
 * dockModel —— 终端 dock 的纯模型：tab 集合怎么随内核事实演化。
 *
 * 为什么单独一个 .ts：test/dock-model.test.ts 要在 node --test 下跑，而 node 的类型剥离
 * 不转 JSX（hotkeys-help.ts / sidebarModel.ts / diffModel.ts 同一个理由）。
 *
 * ## 三条由内核源码钉住的语义（crates/codegen/nofy-shell-terminal/src/pty_session.rs）
 *
 * 1. **process_started / process_ended 不是 shell 退出**：它们是「前台进程 idle↔busy 跳变」
 *    （:407-408、:550-551，按 BUSY_POLL_INTERVAL_MS 定时轮询，因为忙进程可能长时间不出声）。
 *    shell 退出只有 **exit** 帧（:481-506，带 exitCode/signal）。把 process_ended 当退出，
 *    会让「每条命令跑完」都把活着的终端标成已退出——这是本模型要防的头号错。
 * 2. **pty/load 会回放**：256KiB 输出环形缓冲（:54）整段作为 output 帧重发，带 isReplay:true
 *    （:801-815），源码写明的客户端义务是「reset its VTE emulator and feed all bytes from
 *    scratch」⇒ replayed 字段既是视图层「先 reset 再喂」的依据，也是「这一屏含内核缓冲里的
 *    历史」的诚实标注。
 * 3. **内核重启后 tab 会指向不存在的 pty**。terminal/list 是唯一能核对存活的读路径
 *    （实测 status 词汇：connected / exited）；核对不上就标 missing——界面继续装作能输入，
 *    比明说「这个终端已经没了」坏得多。
 *
 * ## tab 命名（活壳 CDP 实测，不是我们编的）
 *
 * 活壳两个 tab 的名字是 "nofy-build" 与 "nofy-build 2"：基名 = cwd 末段
 * （与内核默认同源，pty_session.rs:337-343「Default to cwd basename, fall back to shell
 * basename」），重名则追加 " 2"、" 3"。
 *
 * ## terminal/list 的两个内核事实（决定了「接管」怎么过滤）
 *
 * 1. **list 忽略 sessionId**：分派臂直接调全局 list_terminals()（extensions/terminal.rs:342-345），
 *    所以我们传不传 sessionId 都拿到同一份全局清单 ⇒ 切换会话后重新核对是安全的。
 * 2. **清单是 pty + 管道终端的合并**（nofy-shell-terminal/src/lib.rs:105-110：
 *    list_ptys() 之后 append list_piped_terminals()）。管道终端是 agent 跑 bash 工具时的
 *    非交互终端，interactive=false，而且 pty/load 对它会回 NotInteractive（lib.rs:73-74）。
 *    ⇒ 接管**必须**按 interactive 过滤，否则模型每调一次 bash，dock 就多一个假 tab。
 *
 * 纯函数：无 DOM、无线路名（响应形状的读法在 ui/readers.ts）。
 */
import type { TerminalFrame } from "../../core/ptybus.ts";
import type { TerminalInfo } from "../../ui/readers.ts";

export type DockTab = {
  terminalId: string;
  name: string;
  /** 只有 exit 帧（或 terminal/list 的 status="exited"）能置真 */
  exited: boolean;
  exitCode: number | null;
  signal: string | null;
  /** 有前台进程在跑（process_started/ended 跳变） */
  busy: boolean;
  /** 收到过 isReplay 回放 ⇒ 屏上含内核缓冲里的历史 */
  replayed: boolean;
  /** terminal/list 里查不到 ⇒ 内核重启过或在别处被关，不能再输入 */
  missing: boolean;
};

export function makeTab(terminalId: string, name: string): DockTab {
  return {
    terminalId,
    name,
    exited: false,
    exitCode: null,
    signal: null,
    busy: false,
    replayed: false,
    missing: false,
  };
}

/**
 * 从 terminal/list 里挑出**能接管**的：只要交互 pty（见文件头「两个内核事实」第 2 条）。
 * 已经在本 dock 里的由调用方再过滤一次（adopt 里做），本函数只管「内核给的东西哪些是终端」。
 */
export function adoptableTerminals(list: readonly TerminalInfo[]): TerminalInfo[] {
  return list.filter((t) => t.interactive);
}

/** cwd 末段。Windows 路径也认（内核跨平台，分隔符两种都可能出现）。 */
export function tabNameFromCwd(cwd: string | null): string {
  if (cwd === null) return "terminal";
  const parts = cwd.split(/[\\/]+/).filter((s) => s.length > 0);
  return parts[parts.length - 1] ?? "terminal";
}

/** 活壳口径：基名重了就在后面加 " 2"、" 3"（实测 "nofy-build" / "nofy-build 2"）。 */
export function nextTabName(tabs: readonly DockTab[], cwd: string | null): string {
  const base = tabNameFromCwd(cwd);
  const used = new Set(tabs.map((t) => t.name));
  if (!used.has(base)) return base;
  for (let n = 2; n < 1000; n++) {
    const cand = base + " " + String(n);
    if (!used.has(cand)) return cand;
  }
  return base + " " + String(tabs.length + 1); // 999 个同名 tab：不该发生，但绝不无限循环
}

export type ExitFacts = { exitCode: number | null; signal: string | null; missing: boolean };

/** 写进终端正文的那一行（也用于 tab 的 title）。文案说明**事实**，不猜原因。 */
export function exitNote(f: ExitFacts): string {
  if (f.missing) return "\r\n[终端已从内核消失：内核重启过，或在别处被关闭]\r\n";
  if (f.signal !== null) {
    return "\r\n[进程被信号 " + f.signal + " 结束" + (f.exitCode !== null ? " code=" + String(f.exitCode) : "") + "]\r\n";
  }
  if (f.exitCode !== null) return "\r\n[进程已退出 code=" + String(f.exitCode) + "]\r\n";
  return "\r\n[进程已退出]\r\n";
}

/**
 * 把一帧内核事实折进 tab 集合。
 *
 * **无变化时必须返回同一个数组引用**：output 帧一秒几十条，若每条都产生新数组，
 * React 会把整个 dock 重渲几十次（xterm 是命令式控件，重渲对它零收益）。
 * setState 收到同引用会直接 bail out，这是这里最重要的一个约定。
 */
export function applyFrame(tabs: readonly DockTab[], frame: TerminalFrame): readonly DockTab[] {
  const at = tabs.findIndex((t) => t.terminalId === frame.terminalId);
  if (at < 0) return tabs; // 不是本 dock 的 tab（别处建的 pty）⇒ 不动
  const tab = tabs[at];
  if (tab === undefined) return tabs;
  let next: DockTab | null = null;
  switch (frame.type) {
    case "output":
      if (frame.isReplay && !tab.replayed) next = { ...tab, replayed: true };
      break;
    case "exit": {
      const code = frame.exitCode ?? tab.exitCode;
      const signal = frame.signal ?? tab.signal;
      if (!tab.exited || tab.exitCode !== code || tab.signal !== signal || tab.busy) {
        next = { ...tab, exited: true, exitCode: code, signal, busy: false };
      }
      break;
    }
    case "process_started":
      if (!tab.busy && !tab.exited) next = { ...tab, busy: true };
      break;
    case "process_ended":
      if (tab.busy) next = { ...tab, busy: false }; // 忙→闲，不是退出
      break;
    default:
      break; // 未知 type：不动（内核加新词也不该让界面瞎猜语义）
  }
  if (next === null) return tabs;
  const out = tabs.slice();
  out[at] = next;
  return out;
}

/**
 * 用 terminal/list 核对 tab 的存活。列表是**当前会话名下**的 pty（实测 list{sessionId}），
 * 所以「不在列表里」有两种可能：内核重启过、或它本来就属于别的会话。两种都不能再输入，
 * 统一标 missing（文案见 exitNote）。
 */
export function reconcile(tabs: readonly DockTab[], list: readonly TerminalInfo[]): readonly DockTab[] {
  if (tabs.length === 0) return tabs;
  const byId = new Map<string, TerminalInfo>();
  for (const info of list) byId.set(info.terminalId, info);
  const out = tabs.map((tab) => {
    const info = byId.get(tab.terminalId);
    if (info === undefined) return { ...tab, missing: true, busy: false };
    const exited = tab.exited || info.status === "exited";
    return {
      ...tab,
      missing: false,
      exited,
      exitCode: exited ? (tab.exitCode ?? info.exitCode) : tab.exitCode,
      busy: exited ? false : tab.busy,
    };
  });
  const changed = out.some((t, i) => {
    const p = tabs[i];
    return p === undefined || p.missing !== t.missing || p.exited !== t.exited || p.exitCode !== t.exitCode || p.busy !== t.busy;
  });
  return changed ? out : tabs;
}

/** 关掉一个 tab 之后活动 tab 落在哪：右邻顶上，关的是最后一个则回左邻（浏览器 tab 的直觉）。 */
export function nextActiveAfterClose(
  tabs: readonly DockTab[],
  closingId: string,
  activeId: string | null,
): string | null {
  if (activeId !== closingId) return activeId;
  const rest = tabs.filter((t) => t.terminalId !== closingId);
  if (rest.length === 0) return null;
  const at = tabs.findIndex((t) => t.terminalId === closingId);
  if (at >= rest.length) return rest[rest.length - 1]?.terminalId ?? null;
  return rest[at]?.terminalId ?? null;
}
