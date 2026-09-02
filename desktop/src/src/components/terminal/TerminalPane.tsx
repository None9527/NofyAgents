// A0-S4-4c: 自 modules/TerminalPane.tsx 原样整体迁入（组件全族 + 私有辅助 + 局部型别 + 尾部符号表；原文件现为薄 re-export shim）。
// 仅导入路径按 components/terminal/ 深度改指（./ → ../../modules/；../components/ → ../；其余 ../ → ../../）；迁出体逐字未动。
/* eslint-disable */
/**
 * ============================================================================
 * TerminalPane.tsx — ZCode 3.7.6 终端族（xterm 宿主 / 终端面板 / 底部 dock · 解混淆重建 · D8 Stage B3 / F13 终端侧）
 * ============================================================================
 *
 * 来源文件（融合 chunk，213,695 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js
 * 对照文件（同一 chunk 的 pretty-print 版）：
 *   /home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx
 *
 * 本族 = 底部 dock 终端：xterm 宿主（IME 组合守卫 / PowerShell 提示色修正 / URL link
 * provider / CSS 变量主题 / OSC 52 剪贴板 addon / fit+resize 合流）、单会话终端面板
 * （SidePanel `terminal` 标签内容）、多会话 dock（标签页 新建/关闭/退出自动关）、
 * dock 面板控制器（react-resizable-panels 挂载/折叠/尺寸记忆）。
 * xterm 库本体原为 vendored（js 162010–175264；旧注「`nHt='3.7.8'` 起始」系误归——
 * 该版本号实属 js-base64，jsx 134112）。S3a 裁决：bundle 指纹 = xterm 5.5.0
 * （含 5.5 专有 rescaleOverlappingGlyphs/allowRescaling/isEmoji/blink_block_$，
 * 无 5.4 专有 blink_box_shadow_；documentOverride 排除 5.3），落地为 npm
 * @xterm/xterm@5.5.0 + @xterm/addon-fit@0.10.0（X14 结案）。
 *
 * ----------------------------------------------------------------------------
 * 一、混淆名 → 语义名 映射表（行号格式：融合chunk js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 *  IME 组合输入守卫（175265–175364 / jsx 142080 起）：
 *   FHt  → createPendingInput          未处理 pending 输入对象 (175265)
 *   l5   → isPrintableOnly             全字符可打印且非 DEL (175268)
 *   u5   → stripControlChars           含 ESC→null，否则滤控制字符 (175273)
 *   IHt  → resolveImeCommitText        imeCommit→净化文本；text→原样校验 (175282)
 *   LHt  → recordKeydownCandidate      Enter/Process→imeCommit 候选；单键→text (175290)
 *   RHt  → consumeTrackedText          从残余串中扣除已处理片段 (175295)
 *   zHt  → appendImeCandidate          历史窗内追加候选 (175305)
 *   BHt  → appendRecentData            最近 onData 记录 (175325)
 *   VHt  → matchPendingAgainstHistory  input 事件与历史配对→handled (175342)
 *   HHt  → decideTextareaFlush         判定 shouldWrite/shouldClearTextarea (175357)
 *
 *  ANSI / PowerShell 助手（175365–175391）：
 *   d5/UHt/WHt/GHt → ESC / SGR 正则 / 光标归位正则 / 黑底提示正则 (175365)
 *   KHt  → isPowerShellPath            路径尾段 powershell|pwsh (175369)
 *   qHt  → rewriteBlackBackgroundToDefault  SGR 40→49 (175376)
 *   JHt  → fixPowerShellPromptColors   单行+光标归位+黑底→重写 (175383)
 *
 *  URL 链接检测 + xterm buffer 提取（175392–175466）：
 *   YHt/XHt/ZHt → http(s) 正则 / 尾随标点 / 闭合括号表 (175392)
 *   QHt/$Ht → countChar / trimBalancedUrl（括号配平+尾标点剥离）(175397,175402)
 *   eUt  → extractUrlMatches           (175410)
 *   tUt/nUt → appendCellText/appendLineCells（宽字符 getWidth()==0 跳过）(175419,175424)
 *   rUt/iUt → expandWrappedLineRange/buildLogicalLine（isWrapped 双向扩行）(175431,175438)
 *   aUt  → extractBufferLinks          行内 URL→ILinkProvider 链接（underline+pointer）(175448)
 *
 *  终端主题（CSS 变量驱动，175467–175541）：
 *   oUt  → readCssVar                  getPropertyValue||fallback (175467)
 *   f5/p5 → 共享 span/canvas 探针 (175472)
 *   sUt  → colorToRgba                 CSS 色→rgba()（canvas 读像素）(175480)
 *   cUt  → TERMINAL_THEME_CSS_VARS     18 槽 --color-terminal-* + 缺省值 (175494)
 *   lUt  → buildTerminalThemeFromCssVars (175517)
 *   uUt  → stripCoreColors             删 background/foreground/cursor/cursorAccent (175522)
 *   m5   → mergeTerminalTheme          CSS 变量主题 + 自定义调色（自定义仅覆盖 16 色）(175533)
 *   dUt  → TERMINAL_FONT_STACK         ui-monospace…'MesloLGS NF','Hack Nerd Font' (175537)
 *   fUt/h5/pUt/mUt → 300ms drag 节流 / 150ms IME 窗 / 40ms input 延迟 / 150ms flush (175539)
 *
 *  shell/pty 助手（175543–175559）：
 *   hUt  → normalizeWindowsPty         {backend,buildNumber?} (175543)
 *   gUt  → clampTerminalFontSize       6–72 之外→undefined (175548)
 *   _Ut  → resolveShellLabel           powershell|pwsh→PowerShell，否则 basename (175551)
 *   vUt  → isHttpUrl                   ^https?:// (175557)
 *
 *  组件：
 *   yUt  → XtermTerminalPane           xterm 宿主（单会话完整生命周期）(175561)
 *   bUt  → TerminalPanel               单会话包装（SidePanel `terminal` 标签内容）(175976)
 *   Sqt  → createTerminalSession       {id:uid,workspaceKey,services,cwd,index,shellLabel:null} (183257)
 *   Cqt  → createInitialTerminalState  首会话+工作区 (183267)
 *   wqt  → nextFreeSessionIndex        最小未占 index (183271)
 *   Tqt  → formatSessionTitle          index==1→原名，否则「原名 N」(183278)
 *   Eqt  → resolveCloseAction           none|close-panel|close-session (183281)
 *   Dqt  → removeSession               关闭会话并修 activeSessionId（左邻回退）(183290)
 *   Oqt  → removeExitedSession          末会话退出→close-panel (183311)
 *   kqt  → ensureWorkspaceSession      工作区无存活会话→补首会话 (183323)
 *   Aqt  → TerminalTabChip             标签 chip（active !bg-selected 风格，悬停显关闭）(183331)
 *   jqt  → TerminalDockPanel           多会话 dock（标题/shellLabel chip/标签行/新建/关闭）(183364)
 *   Mqt  → TerminalDock                dock 外壳（Z4 id=terminal 140px–50% + 拖拽把手 + 错误边界）(183602)
 *   Nqt/Pqt → DOCK_TRANSITION_CLASSES / 240ms (183695)
 *   Fqt  → armFlexGrowTransition       transitionend|240ms 超时卸载过渡类 (183697)
 *   Iqt  → useDockPanelController      panelRef/elementRef/isVisible + 折叠/展开/尺寸记忆 (183711)
 *
 *  data-testid 常量（来自 src-HCld2afU.js，已反查值）：
 *   nn=`terminal`（dock section）| Cn=`terminal-close-button`（关闭 dock）
 *
 * ----------------------------------------------------------------------------
 * 二、外部依赖清单（跨 chunk 导入 / 同 chunk 他族）
 * ----------------------------------------------------------------------------
 *  1. react / jsx-runtime            react-BQLj9xdT.js、jsx-runtime-B5yMD3-t.js
 *  2. cn() 类名合并 (Z)               utils-CEEH0K_K.js
 *  3. Button (X) / 图标 (kv=plus, g=x, W_=copy, bye=clipboard-paste)
 *                                    button-laUijeDG.js / 图标块 26575–28020 / imeComposition
 *  4. useIntlContext (G) → {intl}     IntlProvider-C321H7m8.js
 *  5. logger (J)                      logger-PFDwl5Yq.js
 *  6. uid (xi)                        src-HCld2afU.js
 *  7. Tabs 封装 hC/gC/_C/vC           本 chunk 36949–36991（Radix Tabs）
 *  8. ContextMenu 封装 yk/bk/xk/Sk    本 chunk 48825–48880（Radix ContextMenu）
 *  9. react-resizable-panels 封装 Z4/Q4（131934–131960）、ScopedErrorBoundary p4（129952）
 * 10. basename (Go)                   同 chunk 路径助手
 * 11. xterm → npm @xterm/xterm@5.5.0（原 vendored PHt=Terminal，175263）+
 *     @xterm/addon-fit@0.10.0（原 NHt=FitAddon，175264）；
 *     OHt=OSC 52 剪贴板 addon（162213，应用级，本文件逐字重建）
 * ============================================================================
 */

import * as React from "react";
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from '../ui/context-menu'; // A0-S3c：vendored 原语 declare → npm/components-ui 真实 import
import { Plus as IconPlus, Copy as IconCopy, ClipboardPaste as IconClipboardPaste } from 'lucide-react'; // A0-S3b：vendored lucide 图标 → npm lucide-react@1.35.0（映射依据见 A0-S3b.report.md）
import { Terminal } from '@xterm/xterm'; // xterm 核心（原 vendored PHt；bundle 指纹 = 5.5.0，S3a 裁决）
import { FitAddon } from '@xterm/addon-fit'; // fit 插件（原 vendored NHt）
/* ── tombstone（A0-D-Misc）：原 `import { ContextMenuItem } from './LegacyDocEngineBModel'` 退回——
 *    该处 ContextMenuItem 为数据接口（interface），非组件值；本处消费面为 radix
 *    ContextMenu 条目组件（Sk，本 chunk 48825–48880），按 Lane-4 恢复 declare。 ── */
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../modules/Settings';
import { logger } from '../../modules/SkillStore';
import { ScopedErrorBoundary } from '../../modules/WorkspaceShell';
import { useTuiEditOpenRequest } from '../../modules/stores-session';
/* ── A0-D-Misc 接线：可用属主（前波成果） ── */
import { cn } from '../../modules/UtilsCn'; // 类名合并（原 Z，utils-CEEH0K_K.js）
import { useZCodeIntl as useIntlContext } from '../../modules/I18n'; // react-intl 风格 intl（原 G()，IntlProvider-C321H7m8.js）
import { Button } from '../../modules/button'; // 原 X：Button

/* ============================================================================
 * 0. 外部依赖的类型声明（真实实现位于上面清单所列 chunk；此处为重建接口）
 * ==========================================================================*/

/** 日志器（原 J） */

/* ── tombstone〔A1-R39〕：declare uid（原 xi）删除 → 改指 lib/uuid generateUuid（经尾部导入；xi 真身：styles 743 `ot as xi` ← src 9982 `cx as ot` ≡ cx 8710 ≡ lib/uuid@15 generateUuid 逐字；R38 PD@381 同链既判；SidePanel A1-P3-B1 同链先例）。
 * 消费面实测 2 处 @1277（bUt≡TerminalPanel，co ≡ bundle 176230）/ @1325（Sqt≡createTerminalSession，co ≡ bundle 183512）改名改指，调用面逐字不变。 ── */

/** 路径 basename（原 Go） */
declare function basename(path: string): string;

/** D5c：TUI 编辑打开请求信箱消费钩子（实现见 stores-session.tsx TuiEditRequestStore） */

/** lucide 风格图标（原 kv/g/W_/bye） */
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（1）：IconPlus → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */
declare const IconX: React.FC<{ className?: string }>;
/* ── tombstone（A0-S3b）：vendored lucide 图标 declare 删除（2）：IconCopy/IconClipboardPaste → npm lucide-react@1.35.0 真实 import（文件头导入块）；调用面逐字不变，映射依据见 A0-S3b.report.md。 ── */

/** Radix Tabs 封装（原 hC/gC/_C/vC，本 chunk 36949–36991） */

/** Radix ContextMenu 封装（原 yk/bk/xk/Sk，本 chunk 48825–48880） */
/* ── tombstone（A0-S3c）：ContextMenu、ContextMenuContent、ContextMenuTrigger declare 删除 → 真实 import（文件头导入块）；映射依据见 A0-S3c.report.md。 ── */


declare const ContextMenuItem: React.FC<{ onSelect?: () => void; children?: React.ReactNode }>;

/** react-resizable-panels 封装（原 Z4/Q4，131934–131960） */
interface ResizablePanelApi {
  resize(size: string): void;
  expand(): void;
  collapse(): void;
  getSize(): { asPercentage: number };
}
declare const Panel: React.FC<{
  id: string;
  panelRef?: React.Ref<ResizablePanelApi | null>;
  elementRef?: React.Ref<HTMLDivElement | null>;
  defaultSize: string;
  minSize: string;
  maxSize: string;
  collapsedSize: string;
  collapsible: boolean;
  disabled: boolean;
  className?: string;
  children: React.ReactNode;
}>;
declare const PanelResizeHandle: React.FC<{
  className?: string;
  onPointerDown?: (e: React.PointerEvent) => void;
  onPointerUp?: (e: React.PointerEvent) => void;
  onPointerCancel?: (e: React.PointerEvent) => void;
}>;

/** 作用域错误边界（原 p4，129952） */

/* ----------------------------------------------------------------------------
 * xterm 依赖接口（S3a：npm @xterm/xterm@5.5.0 + @xterm/addon-fit@0.10.0；
 * 原 vendored PHt/NHt 175263–175264）
 * -------------------------------------------------------------------------- */
interface XtermTheme {
  [slot: string]: string | undefined;
}
interface XtermWindowsPty {
  /** xterm IWindowsPty 契约：'conpty' | 'winpty' */
  backend: "conpty" | "winpty";
  buildNumber?: number;
}
interface XtermBufferCell {
  getWidth(): number;
  getChars(): string;
}
interface XtermBufferLine {
  isWrapped: boolean;
  getCell(x: number, cell?: XtermBufferCell): XtermBufferCell | undefined;
}
interface XtermBuffer {
  active: { length: number; getLine(y: number): XtermBufferLine | undefined };
}
interface XtermLinkRange {
  start: { x: number; y: number };
  end: { x: number; y: number };
}
interface XtermBufferLink {
  text: string;
  range: XtermLinkRange;
  decorations: { underline: boolean; pointerCursor: boolean };
  /** 由 registerLinkProvider 消费方补全（原 aUt 产出无 activate，yUt 映射时注入） */
  activate?(event: MouseEvent, text: string): void;
}
interface XtermLinkProvider {
  provideLinks(y: number, callback: (links: XtermBufferLink[] | undefined) => void): void;
}
interface XtermDisposable {
  dispose(): void;
}
/** xterm 实例契约 = npm @xterm/xterm@5.5.0 的 Terminal（原 vendored PHt.Terminal，X14 裁决落地）。
 *  原 declare 的三个内部句柄改走 5.5 公开 API：registerOscHandlerCompat → parser.registerOscHandler、
 *  inputCompat → input(data, false)、_core?.textarea → textarea。 */
type XtermTerminalInstance = Terminal;

/** 终端服务（services.terminalService，host 32 服务面之一） */
interface TerminalCreateResult {
  id: string;
  shell: string;
  fontFamily?: string | null;
  fontSize?: number | null;
  theme?: Record<string, string> | null;
  fontFamilySource?: string | null;
  windowsPty?: XtermWindowsPty | null;
}
/* A0-CLEANUP4：导出——服务注册表（rendererEntry js 335 terminalService: registry.terminalService）
   经 WorkspaceShell/SidePanel 透传至 TerminalPanel（原 bUt，jsx 147768 services: e 全量透传） */
export interface TerminalService {
  create(req: { cols: number; rows: number; cwd: string }): Promise<TerminalCreateResult>;
  resize(req: { id: string; cols: number; rows: number }): Promise<void>;
  write(req: { id: string; data: string }): void;
  dispose(req: { id: string }): void;
  onDynamicData(id: string): (cb: (data: string) => void) => XtermDisposable;
  onDynamicExit(id: string): (cb: (exitCode: number) => void) => XtermDisposable;
}
interface TerminalServices {
  terminalService: TerminalService;
}

/* ============================================================================
 * 1. IME 组合输入守卫（原 175265–175364 / jsx 142080–142160）
 * ==========================================================================*/

interface PendingInput {
  handled: boolean;
  text: string;
}
interface KeydownCandidate {
  eventTimeStamp: number;
  kind: "imeCommit" | "text";
  recordedAt: number;
  text: string | null;
}
interface InputHistoryEntry {
  consumed: boolean;
  data: string;
  keydownEventTimeStamp: number;
  kind: "imeCommit" | "text" | "recentData";
  recordedAt: number;
}

/** 原 FHt */
export function createPendingInput(text: string): PendingInput {
  return { handled: false, text };
}

/** 原 l5：全字符可打印（≥32 且非 DEL） */
export function isPrintableOnly(data: string): boolean {
  return Array.from(data).every((ch) => {
    const cp = ch.codePointAt(0);
    return cp !== void 0 && cp >= 32 && cp !== 127;
  });
}

/** 原 u5：含 ESC 直接 null；滤除控制字符后空串→null */
export function stripControlChars(data: string): string | null {
  if (data.includes("\x1B")) return null;
  let out = "";
  for (const ch of Array.from(data)) {
    const cp = ch.codePointAt(0);
    if (cp !== void 0 && cp >= 32 && cp !== 127) out += ch;
  }
  return out.length > 0 ? out : null;
}

/** 原 IHt */
export function resolveImeCommitText(args: { candidate: KeydownCandidate; data: string }): string | null {
  return args.candidate.kind === "imeCommit"
    ? stripControlChars(args.data)
    : !isPrintableOnly(args.data) || args.candidate.text !== args.data
      ? null
      : args.data;
}

/** 原 LHt：Enter/Process→imeCommit 候选；可打印单键→text 候选 */
export function recordKeydownCandidate(e: {
  key: string;
  eventTimeStamp: number;
  now: number;
}): KeydownCandidate | null {
  return e.key === "Enter" || e.key === "Process"
    ? { eventTimeStamp: e.eventTimeStamp, kind: "imeCommit", recordedAt: e.now, text: null }
    : e.key.length !== 1 || !isPrintableOnly(e.key)
      ? null
      : { eventTimeStamp: e.eventTimeStamp, kind: "text", recordedAt: e.now, text: e.key };
}

/** 原 RHt：把已跟踪片段从残余串中扣除并标 handled */
export function consumeTrackedText(pending: PendingInput[], data: string): void {
  const clean = isPrintableOnly(data) ? data : stripControlChars(data);
  if (!clean) return;
  let rest = clean;
  for (const entry of pending) {
    if (entry.handled || entry.text.length === 0) continue;
    const at = rest.indexOf(entry.text);
    if (at !== -1) {
      entry.handled = true;
      rest = rest.slice(0, at) + rest.slice(at + entry.text.length);
    }
  }
}

/** 原 zHt：候选未过期则入历史（usedCandidate） */
export function appendImeCandidate(args: {
  history: InputHistoryEntry[];
  candidate: KeydownCandidate | null;
  data: string;
  maxAgeMs: number;
  now: number;
}): { history: InputHistoryEntry[]; usedCandidate: boolean } {
  const history = args.history.filter((h) => args.now - h.recordedAt <= args.maxAgeMs);
  const candidate = args.candidate;
  if (!candidate || args.now - candidate.recordedAt > args.maxAgeMs) return { history, usedCandidate: false };
  const text = resolveImeCommitText({ candidate, data: args.data });
  return text
    ? {
        history: [
          ...history,
          {
            consumed: false,
            data: text,
            keydownEventTimeStamp: candidate.eventTimeStamp,
            kind: candidate.kind,
            recordedAt: args.now,
          },
        ],
        usedCandidate: true,
      }
    : { history, usedCandidate: false };
}

/** 原 BHt：最近 onData 文本入历史（recentData） */
export function appendRecentData(args: {
  history: InputHistoryEntry[];
  data: string;
  maxAgeMs: number;
  now: number;
}): InputHistoryEntry[] {
  const history = args.history.filter((h) => args.now - h.recordedAt <= args.maxAgeMs);
  const clean = isPrintableOnly(args.data) ? args.data : stripControlChars(args.data);
  return clean
    ? [
        ...history,
        { consumed: false, data: clean, keydownEventTimeStamp: args.now, kind: "recentData", recordedAt: args.now },
      ]
    : history;
}

/** 原 VHt：textarea input 事件与历史配对→pending.handled */
export function matchPendingAgainstHistory(args: {
  history: InputHistoryEntry[];
  pending: PendingInput;
  inputEventTimeStamp: number;
  maxAgeMs: number;
  maxInputDelayMs: number;
  now: number;
}): void {
  const hit = args.history.find(
    (h) =>
      !h.consumed &&
      args.now - h.recordedAt <= args.maxAgeMs &&
      args.pending.text === h.data &&
      (h.kind === "recentData"
        ? args.now - h.recordedAt <= args.maxInputDelayMs
        : args.inputEventTimeStamp >= h.keydownEventTimeStamp &&
          args.inputEventTimeStamp - h.keydownEventTimeStamp <=
            (h.kind === "imeCommit" ? args.maxAgeMs : args.maxInputDelayMs)),
  );
  if (hit) {
    hit.consumed = true;
    args.pending.handled = true;
  }
}

/** 原 HHt */
export function decideTextareaFlush(args: {
  pending: PendingInput;
  textareaValue: string;
}): { shouldClearTextarea: boolean; shouldWrite: boolean } {
  const hasValue = args.textareaValue.length > 0;
  const shouldWrite = !args.pending.handled && hasValue;
  return { shouldClearTextarea: hasValue && (args.pending.handled || shouldWrite), shouldWrite };
}

/* ============================================================================
 * 2. ANSI / PowerShell 提示色修正（原 175365–175391）
 * ==========================================================================*/

const ESC = "\x1B";
const SGR_REGEX = RegExp(`${ESC}\\[([0-9;]*)m`, "g");
const CURSOR_HOME_REGEX = RegExp(`${ESC}\\[\\d+;\\d+H`);
const BLACK_ON_BLACK_REGEX = RegExp(
  `${ESC}\\[(?:[0-9;]*;)?37(?:;[0-9;]*)?m[\\s\\S]*${ESC}\\[(?:[0-9;]*;)?40(?:[0-9;]*)?m`,
);

/** 原 KHt */
export function isPowerShellPath(shellPath: string | null | undefined): boolean {
  if (!shellPath) return false;
  const segments = shellPath.split(/[\\/]/);
  const name = segments[segments.length - 1]?.replace(/\.exe$/i, "").toLowerCase();
  return name === "powershell" || name === "pwsh";
}

/** 原 qHt：SGR 背景 40（黑）→49（默认），防黑底黑字 */
export function rewriteBlackBackgroundToDefault(data: string): string {
  return data.replace(SGR_REGEX, (match, params: string) => {
    const codes = params.length > 0 ? params.split(";") : ["0"];
    let rewrote = false;
    const next = codes.map((c) => (c === "40" ? ((rewrote = true), "49") : c));
    return rewrote ? `${ESC}[${next.join(";")}m` : match;
  });
}

/** 原 JHt：仅对 PowerShell 单行含光标归位+黑底序列的提示做重写 */
export function fixPowerShellPromptColors(data: string, shellPath: string | null | undefined): string {
  return !isPowerShellPath(shellPath) ||
    !data.includes(ESC) ||
    data.includes("\n") ||
    !CURSOR_HOME_REGEX.test(data) ||
    !BLACK_ON_BLACK_REGEX.test(data)
    ? data
    : rewriteBlackBackgroundToDefault(data);
}

/* ============================================================================
 * 3. URL 链接检测 + xterm buffer 提取（原 175392–175466）
 * ==========================================================================*/

const URL_REGEX = /\bhttps?:\/\/[^\s<>"'`]+/gi;
const TRAILING_PUNCT = /[.,;:!?]+$/;
const CLOSERS: Record<string, string> = { ")": "(", "]": "[", "}": "{" };

/** 原 QHt */
function countChar(text: string, ch: string): number {
  let n = 0;
  for (const c of text) if (c === ch) n += 1;
  return n;
}

/** 原 $Ht：尾标点剥离 + 未配平闭合括号回退 */
export function trimBalancedUrl(url: string): string {
  let text = url.replace(TRAILING_PUNCT, "");
  for (;;) {
    const last = text.at(-1);
    const opener = last ? CLOSERS[last] : void 0;
    if (!last || !opener || countChar(text, last) <= countChar(text, opener)) return text;
    text = text.slice(0, -1).replace(TRAILING_PUNCT, "");
  }
}

/** 原 eUt */
export function extractUrlMatches(text: string): Array<{ text: string; startIndex: number; endIndex: number }> {
  const out: Array<{ text: string; startIndex: number; endIndex: number }> = [];
  for (const m of text.matchAll(URL_REGEX)) {
    const raw = m[0];
    const start = m.index ?? 0;
    const trimmed = trimBalancedUrl(raw);
    if (trimmed) out.push({ text: trimmed, startIndex: start, endIndex: start + trimmed.length - 1 });
  }
  return out;
}

interface CellPosition {
  bufferLine: number;
  cellX: number;
}
interface LogicalLine {
  text: string;
  positions: CellPosition[];
}

/** 原 tUt */
function appendCellText(line: LogicalLine, chars: string | null, position: CellPosition): void {
  const sep = chars || " ";
  line.text += sep;
  for (let i = 0; i < sep.length; i += 1) line.positions.push(position);
}

/** 原 nUt：宽字符续格（getWidth()==0）跳过 */
function appendLineCells(line: LogicalLine, bufferLine: XtermBufferLine, y: number, cols: number): void {
  const probe = bufferLine.getCell(0);
  for (let x = 0; x < cols; x += 1) {
    const cell = bufferLine.getCell(x, probe);
    if (!cell || cell.getWidth() === 0) continue;
    appendCellText(line, cell.getChars(), { bufferLine: y, cellX: x });
  }
}

/** 原 rUt：isWrapped 双向扩展逻辑行范围 */
function expandWrappedLineRange(buffer: XtermBuffer["active"], y: number): { start: number; end: number } {
  let start = y - 1;
  while (start > 0 && buffer.getLine(start)?.isWrapped) --start;
  let end = y - 1;
  while (end + 1 < buffer.length && buffer.getLine(end + 1)?.isWrapped) end += 1;
  return { start, end };
}

/** 原 iUt */
function buildLogicalLine(buffer: XtermBuffer["active"], y: number, cols: number): LogicalLine | null {
  const { start, end } = expandWrappedLineRange(buffer, y);
  const line: LogicalLine = { text: "", positions: [] };
  for (let row = start; row <= end; row += 1) {
    const bufferLine = buffer.getLine(row);
    if (!bufferLine) return null;
    appendLineCells(line, bufferLine, row + 1, cols);
  }
  return line;
}

/** 原 aUt：逻辑行内 URL → xterm ILink 数组（仅覆盖当前行） */
export function extractBufferLinks(
  buffer: XtermBuffer["active"],
  y: number,
  cols: number,
): XtermBufferLink[] | undefined {
  const logical = buildLogicalLine(buffer, y, cols);
  if (!logical || !logical.text) return;
  const links: XtermBufferLink[] = [];
  for (const match of extractUrlMatches(logical.text)) {
    const startPos = logical.positions[match.startIndex];
    const endPos = logical.positions[match.endIndex];
    if (!startPos || !endPos) continue;
    const link: XtermBufferLink = {
      text: match.text,
      range: {
        start: { x: startPos.cellX + 1, y: startPos.bufferLine },
        end: { x: endPos.cellX + 1, y: endPos.bufferLine },
      },
      decorations: { underline: true, pointerCursor: true },
    };
    if (link.range.start.y <= y && link.range.end.y >= y) links.push(link);
  }
  return links.length > 0 ? links : void 0;
}

/* ============================================================================
 * 4. 终端主题（CSS 变量驱动，原 175467–175541）
 * ==========================================================================*/

/** 原 oUt */
function readCssVar(style: CSSStyleDeclaration, name: string, fallback: string): string {
  return style.getPropertyValue(name).trim() || fallback;
}

const themeProbeSpan = typeof document > "u" ? null : document.createElement("span");
const themeProbeCtx = (() => {
  if (typeof document > "u") return null;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (ctx) ctx.globalCompositeOperation = "copy";
  return ctx;
})();

/** 原 sUt：任意 CSS 色 → rgba()（span 归一 + canvas 读像素；失败回退） */
export function colorToRgba(color: string | undefined, fallback: string): string {
  if (!color || !themeProbeSpan || !themeProbeCtx || !document.body) return color || fallback;
  try {
    document.body.appendChild(themeProbeSpan);
    themeProbeSpan.style.color = "";
    themeProbeSpan.style.color = color;
    const normalized = getComputedStyle(themeProbeSpan).color;
    themeProbeCtx.fillStyle = "#000";
    themeProbeCtx.fillStyle = normalized;
    themeProbeCtx.fillRect(0, 0, 1, 1);
    const [r = 0, g = 0, b = 0, a = 255] = themeProbeCtx.getImageData(0, 0, 1, 1).data;
    return `rgba(${r}, ${g}, ${b}, ${+(a / 255).toFixed(3)})`;
  } catch {
    return fallback;
  } finally {
    themeProbeSpan.remove();
  }
}

/** 原 cUt：18 槽终端调色板 → CSS 变量名 + 缺省值 */
export const TERMINAL_THEME_CSS_VARS: Record<string, [string, string]> = {
  background: ["--color-terminal-bg", "#171717"],
  foreground: ["--color-terminal-fg", "#e5e5e5"],
  cursor: ["--color-terminal-cursor", "#e5e5e5"],
  cursorAccent: ["--color-terminal-cursor-accent", "#171717"],
  selectionBackground: ["--color-terminal-selection", "rgba(125, 125, 125, 0.3)"],
  selectionInactiveBackground: ["--color-terminal-selection-inactive", "rgba(125, 125, 125, 0.2)"],
  black: ["--color-terminal-black", "#1f2937"],
  red: ["--color-terminal-red", "#ef4444"],
  green: ["--color-terminal-green", "#22c55e"],
  yellow: ["--color-terminal-yellow", "#eab308"],
  blue: ["--color-terminal-blue", "#3b82f6"],
  magenta: ["--color-terminal-magenta", "#a855f7"],
  cyan: ["--color-terminal-cyan", "#06b6d4"],
  white: ["--color-terminal-white", "#e5e7eb"],
  brightBlack: ["--color-terminal-bright-black", "#6b7280"],
  brightRed: ["--color-terminal-bright-red", "#f87171"],
  brightGreen: ["--color-terminal-bright-green", "#4ade80"],
  brightYellow: ["--color-terminal-bright-yellow", "#facc15"],
  brightBlue: ["--color-terminal-bright-blue", "#60a5fa"],
  brightMagenta: ["--color-terminal-bright-magenta", "#c084fc"],
  brightCyan: ["--color-terminal-bright-cyan", "#22d3ee"],
  brightWhite: ["--color-terminal-bright-white", "#f9fafb"],
};

/** 原 lUt：从 documentElement 计算属性合成当前主题 */
export function buildTerminalThemeFromCssVars(): XtermTheme {
  const style = getComputedStyle(document.documentElement);
  return Object.fromEntries(
    Object.entries(TERMINAL_THEME_CSS_VARS).map(([slot, [varName, fallback]]) => [
      slot,
      colorToRgba(readCssVar(style, varName, fallback), fallback),
    ]),
  );
}

/** 原 uUt：自定义调色只允许覆盖 16 色（核心四色删除） */
export function stripCoreColors(custom: Record<string, string> | null | undefined): XtermTheme | undefined {
  if (!custom) return;
  const rest: XtermTheme = { ...custom };
  delete rest.background;
  delete rest.foreground;
  delete rest.cursor;
  delete rest.cursorAccent;
  return Object.keys(rest).length > 0 ? rest : void 0;
}

/** 原 m5 */
export function mergeTerminalTheme(custom: Record<string, string> | null | undefined): XtermTheme {
  const base = buildTerminalThemeFromCssVars();
  const overlay = stripCoreColors(custom);
  return overlay ? { ...base, ...overlay } : base;
}

/** 原 dUt：跨平台等宽链 + Nerd Font 回退 */
export const TERMINAL_FONT_STACK =
  "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, Consolas, 'Cascadia Mono', 'JetBrains Mono', 'MesloLGS NF', 'Hack Nerd Font', monospace";

/** 原 fUt：drag 期间 fit 节流 */
const DRAG_FIT_THROTTLE_MS = 300;
/** 原 h5：IME 历史窗 */
const IME_HISTORY_MAX_AGE_MS = 150;
/** 原 pUt：recentData 配对 input 延迟窗 */
const IME_INPUT_MAX_DELAY_MS = 40;
/** 原 mUt：组合输入回退 flush 延迟 */
const IME_FLUSH_DELAY_MS = 150;

/* ============================================================================
 * 5. shell / pty 助手（原 175543–175559）
 * ==========================================================================*/

/** 原 hUt */
export function normalizeWindowsPty(
  pty: XtermWindowsPty | null | undefined,
): XtermWindowsPty | undefined {
  if (!pty) return;
  return pty.buildNumber ? { backend: pty.backend, buildNumber: pty.buildNumber } : { backend: pty.backend };
}

/** 原 gUt：fontSize 钳制 6–72，非法→undefined */
export function clampTerminalFontSize(size: number | null | undefined): number | undefined {
  if (typeof size !== "number" || !Number.isFinite(size) || size < 6 || size > 72) return;
  return size;
}

/** 原 _Ut */
export function resolveShellLabel(shellPath: string | null | undefined): string | null {
  if (!shellPath) return null;
  const segments = shellPath.split(/[\\/]/);
  const name = segments[segments.length - 1]?.replace(/\.exe$/i, "").toLowerCase();
  if (!name) return shellPath;
  return name === "powershell" || name === "pwsh" ? "PowerShell" : name;
}

/** 原 vUt */
export function isHttpUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

/* ============================================================================
 * 6. OSC 52 剪贴板 addon（原 OHt，vendored xterm 段内 162213，应用级，逐字重建）
 * ==========================================================================*/

class NavigatorClipboardProvider {
  async readText(slot: string): Promise<string> {
    return slot === "c" ? navigator.clipboard.readText() : Promise.resolve("");
  }
  async writeText(slot: string, text: string): Promise<void> {
    if (slot === "c") await navigator.clipboard.writeText(text);
  }
}

class Utf8Base64 {
  private encoder = new TextEncoder();
  private decoder = new TextDecoder();
  encodeText(text: string): string {
    const bytes = this.encoder.encode(text);
    let binary = "";
    for (const b of bytes) binary += String.fromCharCode(b);
    return btoa(binary);
  }
  decodeText(encoded: string): string {
    const binary = atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return this.decoder.decode(bytes);
  }
}

/** 原 OHt：OSC 52 剪贴板读写（renderer 侧 navigator.clipboard） */
export class Osc52ClipboardAddon {
  private terminal: XtermTerminalInstance | null = null;
  private disposable: XtermDisposable | null = null;
  constructor(
    private base64: Utf8Base64 = new Utf8Base64(),
    private provider: NavigatorClipboardProvider = new NavigatorClipboardProvider(),
  ) {}
  activate(terminal: XtermTerminalInstance): void {
    this.terminal = terminal;
    this.disposable = terminal.parser.registerOscHandler(52, (data) => this.setOrReportClipboard(data));
  }
  dispose(): void {
    return this.disposable?.dispose();
  }
  private readText(slot: string, text: string): void {
    const encoded = this.base64.encodeText(text);
    this.terminal?.input(`\x1B]52;${slot};${encoded}\x07`, false);
  }
  private setOrReportClipboard(data: string): boolean | Promise<boolean> {
    const parts = data.split(";");
    if (parts.length < 2) return true;
    const slot = parts[0];
    const payload = parts[1];
    if (payload === "?") {
      const result = this.provider.readText(slot);
      return result instanceof Promise
        ? result.then((text) => (this.readText(slot, text), true))
        : (this.readText(slot, result), true);
    }
    let decoded = "";
    try {
      decoded = this.base64.decodeText(payload);
    } catch {}
    const done = this.provider.writeText(slot, decoded);
    return done instanceof Promise ? done.then(() => true) : true;
  }
}
/* ============================================================================
 * 7. XtermTerminalPane（原 yUt，js 175561 / jsx 142320）
 * ==========================================================================*/

export interface XtermTerminalPaneProps {
  sessionId: string;
  services: TerminalServices;
  cwd: string;
  isVisible: boolean;
  isPanelResizing?: boolean;
  isWindowsDesktop?: boolean;
  onShellLabelChange: (sessionId: string, label: string | null) => void;
  onExit?: (sessionId: string, exitCode: number) => void;
  onOpenBrowserUrl: (url: string) => void;
  /** D5c：pty 建立后写入的初始命令（任务编辑模式 `nofy --resume <sessionId>`）；无则不写 */
  initialCommand?: string | null;
}

/** 原 yUt：xterm 宿主 —— 单会话完整生命周期 */
export function XtermTerminalPane({
  sessionId,
  services,
  cwd,
  isVisible,
  isPanelResizing = false,
  isWindowsDesktop = false,
  onShellLabelChange,
  onExit,
  onOpenBrowserUrl,
  initialCommand = null,
}: XtermTerminalPaneProps) {
  const { intl } = useIntlContext();
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const termRef = React.useRef<XtermTerminalInstance | null>(null);
  const fitRef = React.useRef<{ fit(): void } | null>(null);
  const terminalIdRef = React.useRef<string | undefined>(void 0);
  const isVisibleRef = React.useRef(isVisible);
  const fitRafRef = React.useRef(0);
  const dragFitTimerRef = React.useRef<number | null>(null);
  const isResizingRef = React.useRef(isPanelResizing);
  const resizeStatsRef = React.useRef({ fit: 0, queued: 0, sent: 0, skipped: 0 });
  const lastQueuedRef = React.useRef<{ cols: number; rows: number } | null>(null);
  const pendingResizeRef = React.useRef<{ cols: number; rows: number } | null>(null);
  const sendingRef = React.useRef(false);
  const focusRafRef = React.useRef(0);
  const exitedMessageRef = React.useRef("");
  const onExitRef = React.useRef(onExit);
  const onOpenBrowserUrlRef = React.useRef(onOpenBrowserUrl);
  const customThemeRef = React.useRef<Record<string, string> | undefined>(void 0);
  const pendingInputsRef = React.useRef<PendingInput[]>([]);
  const keydownCandidateRef = React.useRef<KeydownCandidate | null>(null);
  const inputHistoryRef = React.useRef<InputHistoryEntry[]>([]);

  exitedMessageRef.current = intl.formatMessage({ id: "terminal.exited" });
  onExitRef.current = onExit;
  onOpenBrowserUrlRef.current = onOpenBrowserUrl;

  /** 原 A：串行发送 pending resize（in-flight 去重） */
  const sendPendingResize = React.useCallback(() => {
    if (sendingRef.current) return;
    const id = terminalIdRef.current;
    const pending = pendingResizeRef.current;
    if (!id || !pending) return;
    pendingResizeRef.current = null;
    sendingRef.current = true;
    resizeStatsRef.current.sent += 1;
    const startedAt = performance.now();
    services.terminalService
      .resize({ id, cols: pending.cols, rows: pending.rows })
      .then(() => {
        logger.debug("[Terminal] resize sent", {
          cols: pending.cols,
          durationMs: Math.round(performance.now() - startedAt),
          fitCount: resizeStatsRef.current.fit,
          queuedCount: resizeStatsRef.current.queued,
          rows: pending.rows,
          sentCount: resizeStatsRef.current.sent,
          skippedCount: resizeStatsRef.current.skipped,
          terminalId: id,
          terminalTabId: sessionId,
        });
      })
      .catch((error) => {
        logger.warn("[Terminal] resize failed:", error);
      })
      .finally(() => {
        sendingRef.current = false;
        if (pendingResizeRef.current) sendPendingResize();
      });
  }, [services.terminalService, sessionId]);

  /** 原 j：相同尺寸去重后入队 */
  const queueResize = React.useCallback(
    (size: { cols: number; rows: number }) => {
      const last = lastQueuedRef.current;
      const pending = pendingResizeRef.current;
      if ((last?.cols === size.cols && last.rows === size.rows && !pending) || (pending?.cols === size.cols && pending.rows === size.rows)) {
        resizeStatsRef.current.skipped += 1;
        return;
      }
      pendingResizeRef.current = size;
      lastQueuedRef.current = size;
      resizeStatsRef.current.queued += 1;
      sendPendingResize();
    },
    [sendPendingResize],
  );

  /** 原 M */
  const clearDragFitTimer = React.useCallback(() => {
    if (dragFitTimerRef.current) dragFitTimerRef.current = (window.clearTimeout(dragFitTimerRef.current), null);
  }, []);

  /** 原 N：rAF 合流 fit → queueResize */
  const scheduleFit = React.useCallback(
    (reason = "observer") => {
      if (fitRafRef.current) cancelAnimationFrame(fitRafRef.current);
      fitRafRef.current = requestAnimationFrame(() => {
        fitRafRef.current = 0;
        const container = containerRef.current;
        const term = termRef.current;
        const fit = fitRef.current;
        if (!isVisibleRef.current || !container || !term || !fit || container.clientWidth <= 0 || container.clientHeight <= 0)
          return;
        try {
          resizeStatsRef.current.fit += 1;
          fit.fit();
        } catch (error) {
          logger.warn("[Terminal] fit failed:", error);
          return;
        }
        logger.debug("[Terminal] fit requested resize", {
          cols: term.cols,
          reason,
          resizing: isResizingRef.current,
          rows: term.rows,
          terminalId: terminalIdRef.current,
          terminalTabId: sessionId,
        });
        queueResize({ cols: term.cols, rows: term.rows });
      });
    },
    [queueResize, sessionId],
  );

  /** 原 P：drag 期间 300ms 节流，final 立即 */
  const scheduleFitDuringDrag = React.useCallback(
    (reason = "observer") => {
      if (!isResizingRef.current || reason === "final") {
        clearDragFitTimer();
        scheduleFit(reason);
        return;
      }
      dragFitTimerRef.current ||= window.setTimeout(() => {
        dragFitTimerRef.current = null;
        scheduleFit("drag");
      }, DRAG_FIT_THROTTLE_MS);
    },
    [clearDragFitTimer, scheduleFit],
  );

  /** 原 F：rAF 合流聚焦可见终端 */
  const focusTerminal = React.useCallback(() => {
    if (focusRafRef.current) cancelAnimationFrame(focusRafRef.current);
    focusRafRef.current = requestAnimationFrame(() => {
      focusRafRef.current = 0;
      const term = termRef.current;
      if (!isVisibleRef.current || !term) return;
      term.focus();
      logger.debug("[Terminal] focused visible terminal", {
        terminalId: terminalIdRef.current,
        terminalTabId: sessionId,
      });
    });
  }, [sessionId]);

  React.useEffect(() => {
    isVisibleRef.current = isVisible;
    if (isVisible) {
      scheduleFitDuringDrag("visible");
      focusTerminal();
    }
  }, [isVisible, focusTerminal, scheduleFitDuringDrag]);

  React.useEffect(() => {
    const was = isResizingRef.current;
    isResizingRef.current = isPanelResizing;
    if (was && !isPanelResizing && isVisibleRef.current) scheduleFitDuringDrag("final");
  }, [isPanelResizing, scheduleFitDuringDrag]);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let disposed = false;
    customThemeRef.current = void 0;

    const term = new Terminal({
      fontSize: 13,
      fontFamily: TERMINAL_FONT_STACK,
      theme: mergeTerminalTheme(customThemeRef.current),
      linkHandler: {
        allowNonHttpProtocols: false,
        activate(event, uri) {
          if (!isHttpUrl(uri)) return;
          event.preventDefault();
          logger.debug("[Terminal] open OSC 8 http link", { url: uri });
          onOpenBrowserUrlRef.current(uri);
        },
      },
    });
    termRef.current = term;

    const fitAddon = new FitAddon();
    fitRef.current = fitAddon;
    term.loadAddon(fitAddon);
    term.loadAddon(new Osc52ClipboardAddon());
    term.open(container);

    let initialSize: { cols: number; rows: number } | null = null;
    if (isVisibleRef.current && container.clientWidth > 0 && container.clientHeight > 0)
      try {
        resizeStatsRef.current.fit += 1;
        fitAddon.fit();
        initialSize = { cols: term.cols, rows: term.rows };
        lastQueuedRef.current = initialSize;
        logger.debug("[Terminal] initial fit before create", {
          cols: initialSize.cols,
          rows: initialSize.rows,
          terminalTabId: sessionId,
        });
      } catch (error) {
        logger.warn("[Terminal] initial fit failed:", error);
      }

    if (isVisibleRef.current) focusTerminal();

    /* Ctrl+C 复制选区 / Ctrl+V 粘贴；其余键记录 IME 候选 */
    term.attachCustomKeyEventHandler((event) => {
      if (event.type !== "keydown") return true;
      keydownCandidateRef.current =
        event.metaKey || event.ctrlKey || event.altKey
          ? null
          : recordKeydownCandidate({ eventTimeStamp: event.timeStamp, key: event.key, now: performance.now() });
      if (!(event.metaKey || event.ctrlKey)) return true;
      const key = event.key.toLowerCase();
      if (key === "c" && term.hasSelection()) {
        navigator.clipboard.writeText(term.getSelection()).catch((error) => {
          logger.warn("[Terminal] copy via shortcut failed:", error);
        });
        return false;
      }
      if (key === "v") {
        event.preventDefault();
        event.stopPropagation();
        navigator.clipboard
          .readText()
          .then((text) => {
            logger.debug("[Terminal] paste via shortcut", { length: text.length });
            if (text) term.paste(text);
          })
          .catch((error) => logger.warn("[Terminal] paste via shortcut failed:", error));
        return false;
      }
      return true;
    });

    /* 主题随 documentElement class（dark/light）变化重算 */
    const themeObserver = new MutationObserver(() => {
      term.options.theme = mergeTerminalTheme(customThemeRef.current);
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const disposables: XtermDisposable[] = [];
    const { terminalService } = services;

    /* 纯文本 http(s) 链接 provider（buffer 行内提取） */
    disposables.push(
      term.registerLinkProvider({
        provideLinks(y, callback) {
          const links = extractBufferLinks(term.buffer.active, y, term.cols)?.map((link) => ({
            ...link,
            activate(event: MouseEvent, uri: string) {
              event.preventDefault();
              logger.debug("[Terminal] open plain http link", { url: uri });
              onOpenBrowserUrlRef.current(uri);
            },
          }));
          callback(links);
        },
      }),
    );

    const requested = initialSize ?? { cols: term.cols, rows: term.rows };
    terminalService
      .create({ cols: requested.cols, rows: requested.rows, cwd })
      .then(
        ({ id, shell, fontFamily, fontSize, theme, fontFamilySource, windowsPty }) => {
          if (disposed) {
            terminalService.dispose({ id });
            return;
          }
          terminalIdRef.current = id;
          sendPendingResize();
          term.options.windowsPty = normalizeWindowsPty(windowsPty);
          term.options.fontFamily = fontFamily || TERMINAL_FONT_STACK;
          const clamped = clampTerminalFontSize(fontSize);
          if (clamped) term.options.fontSize = clamped;
          customThemeRef.current = theme ?? void 0;
          term.options.theme = mergeTerminalTheme(customThemeRef.current);
          const shellLabel = resolveShellLabel(shell);
          logger.info("[Terminal] shell resolved:", {
            cwd,
            fontFamilySource,
            shell,
            shellLabel,
            terminalId: id,
            terminalTabId: sessionId,
          });
          onShellLabelChange(sessionId, shellLabel);
          scheduleFitDuringDrag("init");
          if (isVisibleRef.current) focusTerminal();

          disposables.push(
            terminalService.onDynamicData(id)((data) => {
              term.write(fixPowerShellPromptColors(data, shell));
            }),
          );
          disposables.push(
            terminalService.onDynamicExit(id)((exitCode) => {
              const exitHandler = onExitRef.current;
              logger.info("[Terminal] terminal session exited", {
                autoClose: !!exitHandler,
                exitCode,
                terminalId: id,
                terminalTabId: sessionId,
              });
              if (exitHandler) {
                exitHandler(sessionId, exitCode);
                return;
              }
              term.write(`\r\n${exitedMessageRef.current}\r\n`);
            }),
          );
          disposables.push(
            term.onData((data) => {
              const now = performance.now();
              const candidate = keydownCandidateRef.current;
              const withCandidate = appendImeCandidate({
                candidate,
                data,
                history: inputHistoryRef.current,
                maxAgeMs: IME_HISTORY_MAX_AGE_MS,
                now,
              });
              inputHistoryRef.current = withCandidate.usedCandidate
                ? withCandidate.history
                : appendRecentData({ data, history: withCandidate.history, maxAgeMs: IME_HISTORY_MAX_AGE_MS, now });
              if (withCandidate.usedCandidate) keydownCandidateRef.current = null;
              consumeTrackedText(pendingInputsRef.current, data);
              terminalService.write({ id, data });
            }),
          );

          /* Windows 桌面：xterm 隐藏 textarea 的组合输入回退（IME 丢字守卫；5.5 公开 API term.textarea） */
          const textarea = isWindowsDesktop ? term.textarea : void 0;
          if (textarea) {
            const onInput = (event: InputEvent) => {
              if (event.inputType !== "insertText" || !event.data || !event.composed) return;
              const text = event.data;
              const now = performance.now();
              const pending = createPendingInput(text);
              pendingInputsRef.current.push(pending);
              matchPendingAgainstHistory({
                history: inputHistoryRef.current,
                inputEventTimeStamp: event.timeStamp,
                maxAgeMs: IME_HISTORY_MAX_AGE_MS,
                maxInputDelayMs: IME_INPUT_MAX_DELAY_MS,
                now,
                pending,
              });
              setTimeout(() => {
                pendingInputsRef.current = pendingInputsRef.current.filter((p) => p !== pending);
                if (disposed) return;
                const decision = decideTextareaFlush({ pending, textareaValue: textarea.value });
                if (decision.shouldWrite) {
                  logger.debug("[Terminal] flush composed input fallback", {
                    length: text.length,
                    terminalId: id,
                    terminalTabId: sessionId,
                  });
                  terminalService.write({ id, data: text });
                }
                if (decision.shouldClearTextarea) textarea.value = "";
              }, IME_FLUSH_DELAY_MS);
            };
            textarea.addEventListener("input", onInput as EventListener, true);
            disposables.push({
              dispose: () => textarea.removeEventListener("input", onInput as EventListener, true),
            });
          }

          /* D5c：任务编辑模式——pty 已建立，写入初始命令（如 `nofy --resume <sessionId>` + 回车）。
           * pty 输入在进程读取前由内核缓冲，shell 就绪后按序消费。 */
          if (initialCommand) {
            logger.info("[Terminal] exec initial command (task edit mode)", {
              initialCommand,
              terminalId: id,
              terminalTabId: sessionId,
            });
            terminalService.write({ id, data: `${initialCommand}\r` });
          }
        },
      )
      .catch((error) => {
        if (disposed) return;
        const message = error instanceof Error ? error.message : String(error);
        logger.error("[Terminal] failed to create terminal:", error);
        term.write(`\r\n[Terminal failed to start]\r\n${message}\r\n`);
      });

    let resizeRaf = 0;
    const resizeObserver = new ResizeObserver(() => {
      if (!isVisibleRef.current) return;
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => scheduleFitDuringDrag("observer"));
    });

    resizeObserver.observe(container);
    return () => {
      disposed = true;
      themeObserver.disconnect();
      resizeObserver.disconnect();
      clearDragFitTimer();
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      if (fitRafRef.current) cancelAnimationFrame(fitRafRef.current);
      if (focusRafRef.current) cancelAnimationFrame(focusRafRef.current);
      pendingInputsRef.current = [];
      keydownCandidateRef.current = null;
      inputHistoryRef.current = [];
      pendingResizeRef.current = null;
      lastQueuedRef.current = null;
      sendingRef.current = false;
      for (const d of disposables) d.dispose();
      if (terminalIdRef.current) terminalService.dispose({ id: terminalIdRef.current });
      terminalIdRef.current = void 0;
      fitRef.current = null;
      term.dispose();
      termRef.current = null;
    };
  }, [clearDragFitTimer, cwd, initialCommand, isWindowsDesktop, onShellLabelChange, focusTerminal, scheduleFitDuringDrag, sendPendingResize, services, sessionId]);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div ref={containerRef} className="terminal-xterm-shell h-full min-h-0 w-full overflow-hidden" />
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          onSelect={() => {
            const term = termRef.current;
            if (term?.hasSelection())
              navigator.clipboard.writeText(term.getSelection()).catch((error) => {
                logger.warn("[Terminal] copy via context menu failed:", error);
              });
          }}
        >
          <IconCopy className="mr-2 h-4 w-4" />
          {intl.formatMessage({ id: "terminal.contextMenu.copy" })}
        </ContextMenuItem>
        <ContextMenuItem
          onSelect={() => {
            const term = termRef.current;
            if (term)
              navigator.clipboard
                .readText()
                .then((text) => text && term.paste(text))
                .catch((error) => logger.warn("[Terminal] paste via context menu failed:", error));
          }}
        >
          <IconClipboardPaste className="mr-2 h-4 w-4" />
          {intl.formatMessage({ id: "terminal.contextMenu.paste" })}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

/* ============================================================================
 * 8. TerminalPanel（原 bUt，js 175976 / jsx 142668）—— SidePanel `terminal` 标签内容
 * ==========================================================================*/

export interface TerminalPanelProps {
  services: TerminalServices;
  cwd: string;
  isVisible: boolean;
  isWindowsDesktop?: boolean;
  onOpenBrowserUrl: (url: string) => void;
}

/** 原 bUt：单会话终端面板（独立 uid 会话，无 shellLabel 回显） */
export function TerminalPanel({ services, cwd, isVisible, isWindowsDesktop = false, onOpenBrowserUrl }: TerminalPanelProps) {
  const [sessionId] = React.useState(() => generateUuid()); // 〔A1-R39〕原 uid（xi）改指 lib/uuid generateUuid（≡ bundle 176230）
  return (
    <section className="h-full min-h-0 overflow-hidden bg-background p-3">
      <XtermTerminalPane
        sessionId={sessionId}
        services={services}
        cwd={cwd}
        isVisible={isVisible}
        isWindowsDesktop={isWindowsDesktop}
        onShellLabelChange={React.useCallback(() => {}, [])}
        onOpenBrowserUrl={onOpenBrowserUrl}
      />
    </section>
  );
}

/* ============================================================================
 * 9. dock 会话状态机（原 Sqt…kqt，js 183257–183330）
 * ==========================================================================*/

export interface TerminalSession {
  id: string;
  workspaceKey: string;
  services: TerminalServices;
  cwd: string;
  index: number;
  shellLabel: string | null;
  /** D5c：pty 建立后要写入的初始命令（如 `nofy --resume <sessionId>` 任务编辑模式）；无则 null */
  initialCommand: string | null;
}
interface TerminalWorkspaceState {
  sessionIds: string[];
  activeSessionId: string;
}
export interface TerminalDockState {
  sessions: Record<string, TerminalSession>;
  workspaces: Record<string, TerminalWorkspaceState>;
}

/** 原 Sqt（D5c：新增可选 initialCommand 透传） */
export function createTerminalSession(args: {
  workspaceKey: string;
  services: TerminalServices;
  cwd: string;
  index: number;
  initialCommand?: string | null;
}): TerminalSession {
  return {
    id: generateUuid(), // 〔A1-R39〕原 uid（xi）改指 lib/uuid generateUuid（≡ bundle 183512）
    workspaceKey: args.workspaceKey,
    services: args.services,
    cwd: args.cwd,
    index: args.index,
    shellLabel: null,
    initialCommand: args.initialCommand ?? null,
  };
}

/** D5c：任务编辑模式的 TUI 命令。
 * 动词依据（`nofy --help` 自查）：`-r, --resume [<SESSION_ID_OR_TITLE>]` —— 按会话 ID
 * 恢复/附着进交互式 TUI（UUID 形态恒按 ID 解释），即"具体任务的编辑器"语义；
 * 配合发现-否则-启动协商（已有 kernel 则 attach，否则 standalone 启动）。
 * cwd 由 pty create 指定为任务工作区，故命令行不再重复 --cwd。 */
export function buildTuiEditCommand(sessionId: string): string {
  return `nofy --resume ${sessionId}`;
}

/** 原 Cqt */
export function createInitialTerminalState(args: {
  workspaceKey: string;
  services: TerminalServices;
  cwd: string;
}): { session: TerminalSession; workspace: TerminalWorkspaceState } {
  const session = createTerminalSession({ workspaceKey: args.workspaceKey, services: args.services, cwd: args.cwd, index: 1 });
  return { session, workspace: { sessionIds: [session.id], activeSessionId: session.id } };
}

/** 原 wqt：最小未占用 index */
export function nextFreeSessionIndex(state: TerminalDockState, workspaceKey: string): number {
  const workspace = state.workspaces[workspaceKey];
  const used = new Set(
    workspace?.sessionIds.map((id) => state.sessions[id]?.index).filter((i): i is number => typeof i === "number") ?? [],
  );
  for (let index = 1; ; index += 1) if (!used.has(index)) return index;
}

/** 原 Tqt */
export function formatSessionTitle(base: string, index: number): string {
  return index === 1 ? base : `${base} ${index}`;
}

/** 原 Eqt */
export function resolveCloseAction(state: TerminalDockState, sessionId: string): "none" | "close-panel" | "close-session" {
  const session = state.sessions[sessionId];
  const workspace = session ? state.workspaces[session.workspaceKey] : void 0;
  if (!session || !workspace?.sessionIds.includes(sessionId)) return "none";
  return workspace.sessionIds.length === 1 ? "close-panel" : "close-session";
}

/** 原 Dqt：移除会话，active 回退左邻 */
export function removeSession(state: TerminalDockState, sessionId: string): TerminalDockState {
  if (resolveCloseAction(state, sessionId) !== "close-session") return state;
  const session = state.sessions[sessionId];
  const workspace = session ? state.workspaces[session.workspaceKey] : void 0;
  if (!session || !workspace) return state;
  const at = workspace.sessionIds.indexOf(sessionId);
  const remaining = workspace.sessionIds.filter((id) => id !== sessionId);
  const fallback = remaining[Math.max(0, at - 1)] ?? remaining[0];
  if (!fallback) return state;
  const { [sessionId]: _removed, ...sessions } = state.sessions;
  return {
    sessions,
    workspaces: {
      ...state.workspaces,
      [session.workspaceKey]: {
        sessionIds: remaining,
        activeSessionId: workspace.activeSessionId === sessionId ? fallback : workspace.activeSessionId,
      },
    },
  };
}

/** 原 Oqt：会话退出后的状态转换（末会话→close-panel） */
export function removeExitedSession(
  state: TerminalDockState,
  sessionId: string,
  currentWorkspaceKey: string,
): { state: TerminalDockState; action: "none" | "close-panel" | "close-session" } {
  const session = state.sessions[sessionId];
  const workspace = session ? state.workspaces[session.workspaceKey] : void 0;
  if (!session || !workspace?.sessionIds.includes(sessionId)) return { state, action: "none" };
  if (workspace.sessionIds.length > 1) return { state: removeSession(state, sessionId), action: "close-session" };
  const { [sessionId]: _removed, ...sessions } = state.sessions;
  const { [session.workspaceKey]: _goneWorkspace, ...workspaces } = state.workspaces;
  return {
    state: { sessions, workspaces },
    action: session.workspaceKey === currentWorkspaceKey ? "close-panel" : "close-session",
  };
}

/** 原 kqt：工作区无存活会话时补首会话 */
export function ensureWorkspaceSession(
  state: TerminalDockState,
  args: { workspaceKey: string; services: TerminalServices; cwd: string },
): TerminalDockState {
  if (state.workspaces[args.workspaceKey]?.sessionIds.some((id) => state.sessions[id])) return state;
  const { session, workspace } = createInitialTerminalState(args);
  return {
    sessions: { ...state.sessions, [session.id]: session },
    workspaces: { ...state.workspaces, [args.workspaceKey]: workspace },
  };
}

/* ============================================================================
 * 10. TerminalTabChip（原 Aqt，js 183331 / jsx 147889）
 * ==========================================================================*/

/** 原 Aqt：dock 标签 chip（active=data-active !bg-selected；关闭钮悬停显现） */
export function TerminalTabChip({
  session,
  title,
  closeLabel,
  isActive,
  onClose,
}: {
  session: TerminalSession;
  title: string;
  closeLabel: string;
  isActive: boolean;
  onClose: (sessionId: string) => void;
}) {
  return (
    <TabsTrigger value={session.id} asChild /* A0-CLEANUP3 #37：Settings.TabsTrigger 已补 asChild（radix 语义） */>
      <div
        data-active={isActive ? "" : void 0}
        data-state={isActive ? "active" : "inactive"}
        className={cn(
          "group relative inline-flex !h-7 max-w-36 min-w-0 flex-none shrink-0 cursor-default items-center justify-start gap-1.5 whitespace-nowrap rounded-lg border border-transparent px-1.5 pr-1 text-ui-base font-medium text-foreground-subtle transition-all",
          "hover:border-border hover:text-foreground",
          "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring",
          "data-active:!border-border data-active:!bg-selected data-active:text-foreground",
        )}
      >
        <span className="min-w-0 flex-1 truncate">{title}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={closeLabel}
          className={cn("rounded-md", isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100")}
          onPointerDown={(e: any) => {
            e.stopPropagation();
          }}
          onClick={(e: any) => {
            e.preventDefault();
            e.stopPropagation();
            onClose(session.id);
          }}
        >
          <IconX className="size-3" />
        </Button>
      </div>
    </TabsTrigger>
  );
}

/* ============================================================================
 * 11. TerminalDockPanel（原 jqt，js 183364 / jsx 147904）
 * ==========================================================================*/

export interface TerminalDockPanelProps {
  services: TerminalServices;
  cwd: string;
  workspaceIdentity?: string | null;
  openWorkspaceKeys: string[] | null;
  isVisible: boolean;
  isPanelResizing?: boolean;
  isWindowsDesktop?: boolean;
  onClose: () => void;
  onOpenBrowserUrl: (url: string) => void;
}

/** 原 jqt：多会话终端 dock（标题 + shellLabel chip + 标签行 + 新建/关闭 + forceMount 内容） */
export function TerminalDockPanel({
  services,
  cwd,
  workspaceIdentity,
  openWorkspaceKeys,
  isVisible,
  isPanelResizing = false,
  isWindowsDesktop = false,
  onClose,
  onOpenBrowserUrl,
}: TerminalDockPanelProps) {
  const { intl } = useIntlContext();
  const workspaceKey = workspaceIdentity?.trim() || cwd || "__default__";
  const [state, setState] = React.useState<TerminalDockState>(() => {
    const { session, workspace } = createInitialTerminalState({ workspaceKey, services, cwd });
    return { sessions: { [session.id]: session }, workspaces: { [workspaceKey]: workspace } };
  });
  const pendingCloseWorkspaceRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (isVisible) setState((prev) => ensureWorkspaceSession(prev, { workspaceKey, services, cwd }));
  }, [cwd, isVisible, services, workspaceKey]);

  /* 当前工作区会话被清空 → 关 dock */
  React.useEffect(() => {
    const pending = pendingCloseWorkspaceRef.current;
    if (pending && ((pendingCloseWorkspaceRef.current = null), pending === workspaceKey)) onClose();
  }, [onClose, state, workspaceKey]);

  /* 剪除已关闭工作区的会话 */
  React.useEffect(() => {
    if (!openWorkspaceKeys) return;
    const open = new Set(openWorkspaceKeys);
    open.add(workspaceKey);
    setState((prev) => {
      const stale = Object.keys(prev.workspaces).filter((key) => !open.has(key));
      if (stale.length === 0) return prev;
      const workspaces = { ...prev.workspaces };
      const sessions = { ...prev.sessions };
      for (const key of stale) {
        const workspace = workspaces[key];
        delete workspaces[key];
        for (const id of workspace?.sessionIds ?? []) delete sessions[id];
      }
      return { sessions, workspaces };
    });
  }, [openWorkspaceKeys, workspaceKey]);

  /** 原 m：shell 解析后回写标签 */
  const handleShellLabelChange = React.useCallback((sessionId: string, label: string | null) => {
    setState((prev) => {
      const session = prev.sessions[sessionId];
      if (!session || session.shellLabel === label) return prev;
      return { ...prev, sessions: { ...prev.sessions, [sessionId]: { ...session, shellLabel: label } } };
    });
  }, []);

  /** 原 h：新建标签 */
  const createTab = React.useCallback(() => {
    setState((prev) => {
      const ensured = ensureWorkspaceSession(prev, { workspaceKey, services, cwd });
      const workspace = ensured.workspaces[workspaceKey];
      if (!workspace) return ensured;
      const session = createTerminalSession({ workspaceKey, services, cwd, index: nextFreeSessionIndex(ensured, workspaceKey) });
      logger.info("[Terminal] create terminal tab", {
        cwd,
        terminalTabId: session.id,
        workspaceKey,
      });
      return {
        sessions: { ...ensured.sessions, [session.id]: session },
        workspaces: {
          ...ensured.workspaces,
          [workspaceKey]: { sessionIds: [...workspace.sessionIds, session.id], activeSessionId: session.id },
        },
      };
    });
  }, [cwd, services, workspaceKey]);

  /** D5c：消费「在 TUI 中编辑此任务」打开请求——新建一页 exec nofy 任务编辑模式。
   * dock 的打开由 useSidePaneState 侧 peek 请求时完成；本处只负责建页并消费。 */
  const handleTuiEditOpen = React.useCallback(
    (target: { sessionId: string; cwd: string }) => {
      setState((prev) => {
        const sessionCwd = target.cwd || cwd;
        const ensured = ensureWorkspaceSession(prev, { workspaceKey, services, cwd: sessionCwd });
        const workspace = ensured.workspaces[workspaceKey];
        if (!workspace) return ensured;
        const session = createTerminalSession({
          workspaceKey,
          services,
          cwd: sessionCwd,
          index: nextFreeSessionIndex(ensured, workspaceKey),
          initialCommand: buildTuiEditCommand(target.sessionId),
        });
        logger.info("[Terminal] create terminal tab for TUI task edit", {
          cwd: sessionCwd,
          nofySessionId: target.sessionId,
          terminalTabId: session.id,
          workspaceKey,
        });
        return {
          sessions: { ...ensured.sessions, [session.id]: session },
          workspaces: {
            ...ensured.workspaces,
            [workspaceKey]: { sessionIds: [...workspace.sessionIds, session.id], activeSessionId: session.id },
          },
        };
      });
    },
    [cwd, services, workspaceKey],
  );
  useTuiEditOpenRequest(workspaceKey, handleTuiEditOpen);

  /** 原 _：关闭标签（末标签→关 dock） */
  const closeTab = React.useCallback(
    (sessionId: string) => {
      const action = resolveCloseAction(state, sessionId);
      if (action === "close-panel") {
        logger.info("[Terminal] close terminal panel from last tab", {
          terminalTabId: sessionId,
          workspaceKey,
        });
        onClose();
        return;
      }
      if (action === "close-session")
        setState((prev) => {
          const session = prev.sessions[sessionId];
          const next = removeSession(prev, sessionId);
          if (!session || next === prev) return prev;
          logger.info("[Terminal] close terminal tab", {
            terminalTabId: sessionId,
            workspaceKey: session.workspaceKey,
          });
          return next;
        });
    },
    [onClose, state, workspaceKey],
  );

  /** 原 v：会话退出自动关标签 */
  const handleExit = React.useCallback(
    (sessionId: string, exitCode: number) => {
      setState((prev) => {
        const ownerKey = prev.sessions[sessionId]?.workspaceKey;
        const result = removeExitedSession(prev, sessionId, workspaceKey);
        if (result.action === "none") return prev;
        logger.info("[Terminal] auto close exited terminal tab", {
          action: result.action,
          exitCode,
          terminalTabId: sessionId,
          workspaceKey: ownerKey,
        });
        if (result.action === "close-panel") pendingCloseWorkspaceRef.current = ownerKey ?? null;
        return result.state;
      });
    },
    [workspaceKey],
  );

  /** 原 y：选中标签 */
  const selectTab = React.useCallback((sessionId: string) => {
    setState((prev) => {
      const session = prev.sessions[sessionId];
      if (!session) return prev;
      const workspace = prev.workspaces[session.workspaceKey];
      if (!workspace || workspace.activeSessionId === sessionId) return prev;
      return {
        ...prev,
        workspaces: { ...prev.workspaces, [session.workspaceKey]: { ...workspace, activeSessionId: sessionId } },
      };
    });
  }, []);

  const currentWorkspace = state.workspaces[workspaceKey];
  const sessions = currentWorkspace?.sessionIds.map((id) => state.sessions[id]).filter((s): s is TerminalSession => !!s) ?? [];
  const activeSession = sessions.find((s) => s.id === currentWorkspace?.activeSessionId) ?? sessions[0] ?? null;
  const allSessions = Object.values(state.sessions);

  return (
    <section
      data-testid="terminal"
      className="flex h-full min-h-0 flex-col gap-2 overflow-hidden bg-background p-3 pb-2"
    >
      <Tabs value={activeSession?.id ?? ""} onValueChange={selectTab} className="h-full min-h-0 gap-2">
        <div className="flex shrink-0 items-center gap-2">
          <div className="flex min-w-0 shrink-0 items-center gap-2">
            <div className="truncate text-ui-base font-medium text-foreground">
              {intl.formatMessage({ id: "terminal.title" })}
            </div>
            {activeSession?.shellLabel ? (
              <div className="shrink-0 rounded-full bg-tag/50 px-2 py-0.5 text-ui-base text-foreground-subtle">
                {activeSession.shellLabel}
              </div>
            ) : null}
          </div>
          <div className="min-w-0 flex-1 overflow-x-auto !scrollbar-hide">
            <TabsList className="flex !h-7 w-max justify-start gap-1.5 rounded-none bg-transparent p-0">
              {sessions.map((session) => {
                const title = formatSessionTitle(
                  basename(session.cwd ?? "") || intl.formatMessage({ id: "terminal.title" }),
                  session.index,
                );
                return (
                  <TerminalTabChip
                    key={session.id}
                    session={session}
                    title={title}
                    closeLabel={intl.formatMessage({ id: "terminal.closeTab" }, { title })}
                    isActive={session.id === activeSession?.id}
                    onClose={closeTab}
                  />
                );
              })}
            </TabsList>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              size="icon-md"
              variant="ghost"
              onClick={createTab}
              title={intl.formatMessage({ id: "terminal.new" })}
              aria-label={intl.formatMessage({ id: "terminal.new" })}
            >
              <IconPlus className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon-md"
              variant="ghost"
              onClick={onClose}
              data-testid="terminal-close-button"
              title={intl.formatMessage({ id: "terminal.close" })}
              aria-label={intl.formatMessage({ id: "terminal.close" })}
            >
              <IconX className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">
          {allSessions.map((session) => (
            <TabsContent
              key={session.id}
              value={session.id}
              {...({ forceMount: true } as unknown as Partial<React.ComponentProps<typeof TabsContent>>)} /* A0-D-Misc：bundle TabsContent 为 radix 原语带 forceMount，Settings.TabsContent 缺，已登记需要的 export */
              className="h-full min-h-0 flex-1 data-[state=inactive]:hidden"
            >
              <XtermTerminalPane
                sessionId={session.id}
                services={session.services}
                cwd={session.cwd}
                isVisible={isVisible && session.workspaceKey === workspaceKey && session.id === activeSession?.id}
                isPanelResizing={isPanelResizing}
                isWindowsDesktop={isWindowsDesktop}
                onShellLabelChange={handleShellLabelChange}
                onExit={handleExit}
                onOpenBrowserUrl={onOpenBrowserUrl}
                initialCommand={session.initialCommand}
              />
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </section>
  );
}

/* ============================================================================
 * 12. TerminalDock（原 Mqt，js 183602 / jsx 148118）+ dock 面板控制器（Fqt/Iqt）
 * ==========================================================================*/

/** 原 Nqt/Pqt */
const DOCK_FLEX_TRANSITION_CLASSES = ["transition-[flex-grow]", "duration-200", "ease-out"];
const DOCK_FLEX_TRANSITION_TIMEOUT_MS = 240;

/** 原 Fqt：flex-grow 过渡期间挂过渡类，transitionend|240ms 卸载 */
export function armFlexGrowTransition(element: HTMLElement): () => void {
  element.classList.add(...DOCK_FLEX_TRANSITION_CLASSES);
  let done = false;
  let timer = 0;
  const finish = () => {
    if (done) return;
    done = true;
    element.removeEventListener("transitionend", onEnd);
    if (timer) window.clearTimeout(timer);
    element.classList.remove(...DOCK_FLEX_TRANSITION_CLASSES);
  };
  const onEnd = (event: TransitionEvent) => {
    if (event.target === element && event.propertyName === "flex-grow") finish();
  };
  element.addEventListener("transitionend", onEnd);
  timer = window.setTimeout(finish, DOCK_FLEX_TRANSITION_TIMEOUT_MS);
  return finish;
}

export interface DockPanelController {
  panelRef: React.Ref<ResizablePanelApi | null>;
  panelElementRef: React.Ref<HTMLDivElement | null>;
  isVisible: boolean;
}

/** 原 Iqt：dock 面板控制器（延迟挂载 / rAF 展开 / 折叠前记忆百分比尺寸） */
export function useDockPanelController({
  open,
  alwaysMounted = false,
  expandedSize,
  rememberExpandedSize = false,
  resizeOnInitialVisibleMount = true,
}: {
  open: boolean;
  alwaysMounted?: boolean;
  expandedSize: string;
  rememberExpandedSize?: boolean;
  resizeOnInitialVisibleMount?: boolean;
}): DockPanelController {
  const panelRef = React.useRef<ResizablePanelApi | null>(null);
  const panelElementRef = React.useRef<HTMLDivElement | null>(null);
  const expandedSizeRef = React.useRef(expandedSize);
  const didInitialResizeRef = React.useRef(false);
  const [mounted, setMounted] = React.useState(open);

  React.useEffect(() => {
    expandedSizeRef.current = expandedSize;
  }, [expandedSize]);

  React.useEffect(() => {
    if (alwaysMounted) {
      setMounted(open);
      return;
    }
    if (open) {
      const raf = window.requestAnimationFrame(() => {
        setMounted(true);
      });
      return () => {
        window.cancelAnimationFrame(raf);
      };
    }
    setMounted(false);
  }, [alwaysMounted, open]);

  React.useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const element = panelElementRef.current;
    if (!didInitialResizeRef.current && ((didInitialResizeRef.current = true), mounted && !resizeOnInitialVisibleMount)) return;
    const disarm = element ? armFlexGrowTransition(element) : void 0;
    const raf = window.requestAnimationFrame(() => {
      if (mounted) {
        const size = expandedSizeRef.current;
        if (size) {
          panel.resize(size);
          return;
        }
        panel.expand();
        return;
      }
      if (rememberExpandedSize) {
        const percentage = panel.getSize().asPercentage;
        if (Number.isFinite(percentage) && percentage > 0) expandedSizeRef.current = `${percentage}%`;
      }
      panel.collapse();
    });
    return () => {
      window.cancelAnimationFrame(raf);
      disarm?.();
    };
  }, [mounted, rememberExpandedSize, resizeOnInitialVisibleMount]);

  return { panelRef, panelElementRef, isVisible: mounted };
}

export interface TerminalDockProps {
  services: TerminalServices;
  workspaceAbsPath: string;
  workspaceIdentity?: string | null;
  openWorkspaceKeys: string[] | null;
  isVisible: boolean;
  isWindowsDesktop: boolean;
  panelRef: React.Ref<ResizablePanelApi | null>;
  panelElementRef: React.Ref<HTMLDivElement | null>;
  onClose: () => void;
  onOpenBrowserUrl: (url: string) => void;
}

/** 原 Mqt：底部 dock 外壳 —— Z4 id=terminal（140px–50%，defaultSize 0px 折叠态）+ 拖拽把手 + 错误边界 */
export function TerminalDock({
  services,
  workspaceAbsPath,
  workspaceIdentity,
  openWorkspaceKeys,
  isVisible,
  isWindowsDesktop,
  panelRef,
  panelElementRef,
  onClose,
  onOpenBrowserUrl,
}: TerminalDockProps) {
  const [mounted, setMounted] = React.useState(isVisible);
  const [isResizing, setIsResizing] = React.useState(false);
  const collapsible = !isVisible;
  const disabled = !isVisible;
  const workspaceKey = workspaceIdentity?.trim() || workspaceAbsPath;

  const stopResizing = React.useCallback(() => {
    setIsResizing(false);
  }, []);
  const startResizing = React.useCallback(
    (event: React.PointerEvent) => {
      if (!isVisible || (event.pointerType === "mouse" && event.button !== 0)) return;
      setIsResizing(true);
    },
    [isVisible],
  );

  React.useEffect(() => {
    if (isVisible) setMounted(true);
  }, [isVisible]);
  React.useEffect(() => {
    if (!isVisible) setIsResizing(false);
  }, [isVisible]);
  React.useEffect(() => {
    if (!isResizing) return;
    window.addEventListener("pointerup", stopResizing);
    window.addEventListener("pointercancel", stopResizing);
    window.addEventListener("blur", stopResizing);
    return () => {
      window.removeEventListener("pointerup", stopResizing);
      window.removeEventListener("pointercancel", stopResizing);
      window.removeEventListener("blur", stopResizing);
    };
  }, [stopResizing, isResizing]);

  return (
    <>
      {isVisible ? <PanelResizeHandle onPointerCancel={stopResizing} onPointerDown={startResizing} onPointerUp={stopResizing} /> : null}
      <Panel
        id="terminal"
        panelRef={panelRef}
        elementRef={panelElementRef}
        defaultSize="0px"
        minSize="140px"
        maxSize="50%"
        collapsedSize="0px"
        collapsible={collapsible}
        disabled={disabled}
        className={cn(
          "border-t border-border transition-opacity duration-200 ease-out",
          isVisible ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <div className="h-full">
          {mounted ? (
            <div aria-hidden={!isVisible} className="h-full">
              <ScopedErrorBoundary scope="workspace-terminal" resetKeys={[workspaceKey]} variant="panel" className="h-full">
                <TerminalDockPanel
                  services={services}
                  cwd={workspaceAbsPath}
                  workspaceIdentity={workspaceIdentity}
                  openWorkspaceKeys={openWorkspaceKeys}
                  isVisible={isVisible}
                  isPanelResizing={isResizing}
                  isWindowsDesktop={isWindowsDesktop}
                  onClose={onClose}
                  onOpenBrowserUrl={onOpenBrowserUrl}
                />
              </ScopedErrorBoundary>
            </div>
          ) : null}
        </div>
      </Panel>
    </>
  );
}

/* 〔A1-R39〕尾部导入：generateUuid（原 xi）收敛改指——lib/uuid@15 canonical（src cx@8710 逐字；styles 743 `ot as xi` ← src 9982 `cx as ot`；R38 PD@381 同链既判）。尾部导入：ES 模块提升，等价文件头，行引用零漂（R35 @10315 先例）。环安全：lib/uuid 值闭包仅 crypto，不达本文件。 */
import { generateUuid } from '../../lib/uuid';
