// A1-P1-B11：ToolCallBlock shell 命令助手域逐字重建（styles js 105186–105313，共 128 行，20 处改名）。
// 真身基准（只读）：desktop/src/out/renderer/assets/styles-CdEGpc2x.js（md5 48d71d4874b0868d61fd35a328bf6ad5）。
// 落点裁定：新叶（components/conversation/ 域）。消费面 = ToolCallBlock.tsx shell 四 declare → 真实 import 收敛；
//   SHELL_TOOL_ICON 手写 const 与 CTV AgentToolView 调色板兜底链（Xft）一并改指。
// 逐字证明：/tmp/a1r0-p1/p11/p11-roundtrip.js（AST 逆映射还原 ≡ bundle 逐字 EXACT）+ p11-leafcheck.js（正则独立路线）。
// 函数体内局部变量保留混淆名（B5 约定）；型缝 `: any` 参数缝见 p11/ShellCommandBlocks.seam-log.txt，均带〔A1-P1-B11〕。
// 区段切分墓碑：Zft@105191 随段（图标真身 = Uv Sa('square-terminal')，A0-S3b 判例收敛 lucide-react SquareTerminal）；
//   ept@105314（ShellToolView 束体）未实体化，为本区右界。
//
// 映射表（minified → 语义名 → bundle 定义行 → 属主）：
//   【真实 import】
//   $→jsx-runtime | WQ→AGENT_COLOR_PALETTE（AgentToolBlocks，A1-P1-B10 卫星段 105162）
//   Uv→IconSquareTerminal（lucide-react SquareTerminal；原 styles 27866 vendored Sa('square-terminal')）
//   【shell 命令助手域 105186–105313】
//   Xft→hashToAgentPaletteColor（105186）| Zft→SHELL_TOOL_ICON（105191）| GQ→hasRawShellOutput（105192）
//   Qft→summarizeShellCommand（105195）| $ft→firstTrimmedShellField（105227）| KQ→resolveShellExecution（105235）
//   qQ→extractShellOutput（105279）
/* eslint-disable */
import * as $ from "react/jsx-runtime"; // 原 $（jsx-runtime-B5yMD3-t.js；A1-R15 判例：编译形 JSX 消费面）
import { AGENT_COLOR_PALETTE } from './AgentToolBlocks'; // 原 WQ（A1-P1-B10 卫星段 105162）
import { SquareTerminal as IconSquareTerminal } from 'lucide-react'; // 原 Uv（styles 27866 vendored Sa('square-terminal')；A0-S3b 判例）

/* ── shell 命令助手域（styles 105186–105313） ── */
function hashToAgentPaletteColor(e: any) {
  let t = 0;
  for (let n = 0; n < e.length; n += 1) t = (t * 31 + e.charCodeAt(n)) >>> 0;
  return AGENT_COLOR_PALETTE[t % AGENT_COLOR_PALETTE.length] ?? `blue`;
}
var SHELL_TOOL_ICON = (0, $.jsx)(IconSquareTerminal, { className: `size-4 shrink-0 text-foreground-subtle` });
function hasRawShellOutput(e: any) {
  return typeof e == `object` && !!e && !Array.isArray(e);
}
function summarizeShellCommand(e: any) {
  if (typeof e == `string`) {
    let t = e.trim();
    return t.length > 0 ? t : void 0;
  }
  if (Array.isArray(e) && e.every((e: any) => typeof e == `string`)) {
    let t = e.map((e: any) => e.trim()).filter(Boolean);
    if (t.length === 0) return;
    let n = t.findIndex((e: any) => e === `-lc`);
    return n >= 0 && t[n + 1] ? t[n + 1] : t.join(` `);
  }
  if (typeof e != `object` || !e) return;
  let t = e,
    n = t.parsed_cmd;
  if (Array.isArray(n))
    for (let e of n) {
      if (typeof e == `string`) {
        let t = e.trim();
        if (t.length > 0) return t;
        continue;
      }
      if (typeof e != `object` || !e) continue;
      let t = e;
      if (typeof t.cmd == `string` && t.cmd.trim().length > 0) return t.cmd.trim();
    }
  for (let e of [`command`, `cmd`, `script`, `parsed_cmd`]) {
    let n = t[e];
    if (typeof n != `string`) continue;
    let r = n.trim();
    if (r.length > 0) return r;
  }
}
function firstTrimmedShellField(e: any, t: any) {
  for (let n of t) {
    let t = e[n];
    if (typeof t != `string`) continue;
    let r = t.trim();
    if (r.length > 0) return r;
  }
}
function resolveShellExecution(e: any): any {
  if (typeof e == `string`) {
    let t = e.trim();
    if (t.length === 0) return {};
    let n = t.match(/^(?:\/bin\/)?(?<tool>zsh|bash|sh)\s+-lc\s+(?<command>[\s\S]+)$/i);
    return n?.groups
      ? { executionCommand: n.groups.command?.trim() || void 0 }
      : { executionCommand: t };
  }
  if (Array.isArray(e) && e.every((e: any) => typeof e == `string`)) {
    let t = e.map((e: any) => e.trim()).filter(Boolean);
    if (t.length === 0) return {};
    let n = t.findIndex((e: any) => e === `-lc`);
    return n >= 0
      ? { executionCommand: t[n + 1] || void 0 }
      : { executionCommand: t.slice(1).join(` `) || void 0 };
  }
  if (typeof e != `object` || !e) return {};
  let t = e;
  if (typeof t.command == `string` && t.command.trim().length > 0) return resolveShellExecution(t.command);
  if (typeof t.cmd == `string` && t.cmd.trim().length > 0) return resolveShellExecution(t.cmd);
  if (typeof t.script == `string` && t.script.trim().length > 0) return resolveShellExecution(t.script);
  let n = t.parsed_cmd;
  if (Array.isArray(n))
    for (let e of n) {
      if (typeof e == `string`) {
        let t = resolveShellExecution(e);
        if (t.executionCommand) return t;
        continue;
      }
      if (typeof e != `object` || !e) continue;
      let t = e,
        n =
          typeof t.cmd == `string` && t.cmd.trim().length > 0
            ? t.cmd.trim()
            : typeof t.command == `string` && t.command.trim().length > 0
              ? t.command.trim()
              : typeof t.script == `string` && t.script.trim().length > 0
                ? t.script.trim()
                : void 0;
      if (n) return { executionCommand: n };
    }
  return {};
}
function extractShellOutput(e: any): any {
  if (e == null) return null;
  if (typeof e == `string`) return e.trim().length > 0 ? e : null;
  if (Array.isArray(e)) {
    let t = e.map((e: any) => extractShellOutput(e)).filter((e: any) => e != null);
    return t.length > 0
      ? t.join(`
`)
      : null;
  }
  if (hasRawShellOutput(e)) {
    let t = firstTrimmedShellField(e, [`output`, `text`, `content`, `result`, `stdout`, `message`]);
    if (t) return t;
    let n = e.rawOutput;
    if (n !== void 0) {
      let e = extractShellOutput(n);
      if (e) return e;
    }
    let r = e.content;
    if (Array.isArray(r)) {
      let e = r
        .map((e: any) =>
          typeof e == `string`
            ? e.trim()
            : hasRawShellOutput(e)
              ? (firstTrimmedShellField(e, [`output`, `text`, `content`, `result`, `stdout`, `message`]) ?? ``)
              : ``,
        )
        .filter(Boolean).join(`
`);
      if (e.length > 0) return e;
    }
  }
  return typeof e == `number` || typeof e == `boolean` || typeof e == `bigint` ? String(e) : null;
}

export {
  hashToAgentPaletteColor, SHELL_TOOL_ICON, hasRawShellOutput, summarizeShellCommand, firstTrimmedShellField, resolveShellExecution,
  extractShellOutput,
};
