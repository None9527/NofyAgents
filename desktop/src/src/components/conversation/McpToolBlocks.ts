// A1-P1-B11：ConversationToolViews MCP 工具助手域逐字重建（styles js 107432–107519，共 88 行，20 处改名）。
// 真身基准（只读）：desktop/src/out/renderer/assets/styles-CdEGpc2x.js（md5 48d71d4874b0868d61fd35a328bf6ad5）。
// 落点裁定：新叶（components/conversation/ 域）。消费面 = ConversationToolViews.tsx MCP 六 declare → 真实 import 收敛。
// 逐字证明：/tmp/a1r0-p1/p11/p11-roundtrip.js（AST 逆映射还原 ≡ bundle 逐字 EXACT）+ p11-leafcheck.js（正则独立路线）。
// 函数体内局部变量保留混淆名（B5 约定）；型缝 `: any` 参数缝见 p11/McpToolBlocks.seam-log.txt，均带〔A1-P1-B11〕。
// 区段切分墓碑：Wmt@107520（AutomationToolView 束体）未实体化，为本区右界；Pmt 图标真身 = lbe（Sa('plug')，
//   A0 手写期误映 IconBot，本批依束真身收敛为 lucide-react Plug；A0-S3b 判例）。
//
// 映射表（minified → 语义名 → bundle 定义行 → 属主）：
//   【真实 import】
//   $→jsx-runtime | lbe→IconPlug（lucide-react Plug；原 styles 27645 vendored Sa('plug')）
//   【MCP 工具助手域 107432–107519】
//   Pmt→MCP_TOOL_ICON（107432，var 链首）| Fmt→SHORT_PLAIN_OUTPUT_LIMIT（107432 链）| Imt→MCP_CONTENT_VISIBILITY_STYLE（107432 链）
//   T$→detectOutputLanguage（107435）| Lmt→isShortPlainOutput（107444）| Rmt→extractMcpOutputText（107454）
//   zmt→isMcpToolDisplayInfo（107463）| Bmt→parseMcpToolNameIdentity（107474）| Vmt→extractMcpToolInfo（107496）
//   E$→prettifyMcpLabelSegment（107504）| Hmt→prettifyMcpServerName（107508）| Umt→prettifyMcpToolName（107515）
/* eslint-disable */
import * as $ from "react/jsx-runtime"; // 原 $（jsx-runtime-B5yMD3-t.js；A1-R15 判例：编译形 JSX 消费面）
import { Plug as IconPlug } from 'lucide-react'; // 原 lbe（styles 27645 vendored Sa('plug')；A0-S3b 判例：npm lucide-react@1.35.0）

/* ── MCP 工具助手域（styles 107432–107519） ── */
var MCP_TOOL_ICON = (0, $.jsx)(IconPlug, { className: `size-4 shrink-0 text-foreground-subtle` }),
  SHORT_PLAIN_OUTPUT_LIMIT = 160,
  MCP_CONTENT_VISIBILITY_STYLE = { containIntrinsicSize: `none`, contentVisibility: `visible` };
function detectOutputLanguage(e: any) {
  let t = e.trim();
  if (!(t.startsWith(`{`) || t.startsWith(`[`))) return !1;
  try {
    return (JSON.parse(t), !0);
  } catch {
    return !1;
  }
}
function isShortPlainOutput(e: any) {
  let t = e.trim();
  return (
    t.length > 0 &&
    t.length <= SHORT_PLAIN_OUTPUT_LIMIT &&
    !t.includes(`
`) &&
    !detectOutputLanguage(t)
  );
}
function extractMcpOutputText(e: any) {
  if (typeof e == `string`) return e;
  if (e != null)
    try {
      return JSON.stringify(e, null, 2);
    } catch {
      return String(e);
    }
}
function isMcpToolDisplayInfo(e: any) {
  if (typeof e != `object` || !e) return !1;
  let t = e;
  return (
    t.kind === `mcp_tool` &&
    typeof t.serverName == `string` &&
    t.serverName.trim().length > 0 &&
    typeof t.toolName == `string` &&
    t.toolName.trim().length > 0
  );
}
function parseMcpToolNameIdentity(e: any) {
  if (!e) return null;
  let t = e.split(`__`);
  if (t.length !== 3 || t[0] !== `mcp` || !t[1] || !t[2]) return null;
  let n = t[1],
    r = t[2],
    i = n.split(`_`).filter(Boolean),
    a = r.split(`_`).filter(Boolean),
    o = 0,
    s = Math.min(i.length, a.length);
  for (let e = s; e > 0; --e)
    if (i.slice(-e).join(`_`).toLocaleLowerCase() === a.slice(0, e).join(`_`).toLocaleLowerCase()) {
      o = e;
      break;
    }
  let c = i[0]?.toLocaleLowerCase() === `plugin`;
  return {
    kind: `mcp_tool`,
    serverName: o > 0 ? i.slice(-o).join(`_`) : c ? i.at(-1) : n,
    toolName: o > 0 && o < a.length ? a.slice(o).join(`_`) : r,
  };
}
function extractMcpToolInfo(e: any) {
  let t = e.toolCallNode.toolCall.raw;
  if (typeof t == `object` && t) {
    let e = t.display;
    if (isMcpToolDisplayInfo(e)) return e;
  }
  return parseMcpToolNameIdentity(e.toolCallNode.toolCall.toolName);
}
function prettifyMcpLabelSegment(e: any) {
  let t = e.trim().replace(/[-_]+/gu, ` `).replace(/\s+/gu, ` `);
  return t ? t[0].toLocaleUpperCase() + t.slice(1) : e;
}
function prettifyMcpServerName(e: any) {
  let t = e
    .split(`:`)
    .map((e: any) => e.trim())
    .filter(Boolean);
  return prettifyMcpLabelSegment(t[0]?.toLocaleLowerCase() === `plugin` && t.length > 1 ? t.at(-1) : e);
}
function prettifyMcpToolName(e: any, t: any) {
  let n = prettifyMcpLabelSegment(e),
    r = `${t} `;
  return n.toLocaleLowerCase().startsWith(r.toLocaleLowerCase()) ? prettifyMcpLabelSegment(n.slice(r.length)) : n;
}

export {
  MCP_TOOL_ICON, SHORT_PLAIN_OUTPUT_LIMIT, MCP_CONTENT_VISIBILITY_STYLE, detectOutputLanguage, isShortPlainOutput, extractMcpOutputText,
  isMcpToolDisplayInfo, parseMcpToolNameIdentity, extractMcpToolInfo, prettifyMcpLabelSegment, prettifyMcpServerName, prettifyMcpToolName,
};
