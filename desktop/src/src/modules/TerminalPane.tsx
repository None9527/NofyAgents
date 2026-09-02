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
 *   FHt  → createPendingInput          未处理 pending 输入对象 (175507)
 *   l5   → isPrintableOnly             全字符可打印且非 DEL (175510)
 *   u5   → stripControlChars           含 ESC→null，否则滤控制字符 (175516)
 *   IHt  → resolveImeCommitText        imeCommit→净化文本；text→原样校验 (175525)
 *   LHt  → recordKeydownCandidate      Enter/Process→imeCommit 候选；单键→text (175532)
 *   RHt  → consumeTrackedText          从残余串中扣除已处理片段 (175539)
 *   zHt  → appendImeCandidate          历史窗内追加候选 (175549)
 *   BHt  → appendRecentData            最近 onData 记录 (175570)
 *   VHt  → matchPendingAgainstHistory  input 事件与历史配对→handled (175586)
 *   HHt  → decideTextareaFlush         判定 shouldWrite/shouldClearTextarea (175600)
 *
 *  ANSI / PowerShell 助手（175365–175391）：
 *   d5/UHt/WHt/GHt → ESC / SGR 正则 / 光标归位正则 / 黑底提示正则 (175365)
 *   KHt  → isPowerShellPath            路径尾段 powershell|pwsh (175611)
 *   qHt  → rewriteBlackBackgroundToDefault  SGR 40→49 (175617)
 *   JHt  → fixPowerShellPromptColors   单行+光标归位+黑底→重写 (175625)
 *
 *  URL 链接检测 + xterm buffer 提取（175392–175466）：
 *   YHt/XHt/ZHt → http(s) 正则 / 尾随标点 / 闭合括号表 (175392)
 *   QHt/$Ht → countChar / trimBalancedUrl（括号配平+尾标点剥离）(175397,175402)
 *   eUt  → extractUrlMatches           (175652)
 *   tUt/nUt → appendCellText/appendLineCells（宽字符 getWidth()==0 跳过）(175419,175424)
 *   rUt/iUt → expandWrappedLineRange/buildLogicalLine（isWrapped 双向扩行）(175431,175438)
 *   aUt  → extractBufferLinks          行内 URL→ILinkProvider 链接（underline+pointer）(175691)
 *
 *  终端主题（CSS 变量驱动，175467–175541）：
 *   oUt  → readCssVar                  getPropertyValue||fallback (175711)
 *   f5/p5 → 共享 span/canvas 探针 (175472)
 *   sUt  → colorToRgba                 CSS 色→rgba()（canvas 读像素）(175480)
 *   cUt  → TERMINAL_THEME_CSS_VARS     18 槽 --color-terminal-* + 缺省值 (175736)
 *   lUt  → buildTerminalThemeFromCssVars (175760)
 *   uUt  → stripCoreColors             删 background/foreground/cursor/cursorAccent (175764)
 *   m5   → mergeTerminalTheme          CSS 变量主题 + 自定义调色（自定义仅覆盖 16 色）(175775)
 *   dUt  → TERMINAL_FONT_STACK         ui-monospace…'MesloLGS NF','Hack Nerd Font' (175780)
 *   fUt/h5/pUt/mUt → 300ms drag 节流 / 150ms IME 窗 / 40ms input 延迟 / 150ms flush (175539)
 *
 *  shell/pty 助手（175543–175559）：
 *   hUt  → normalizeWindowsPty         {backend,buildNumber?} (175785)
 *   gUt  → clampTerminalFontSize       6–72 之外→undefined (175791)
 *   _Ut  → resolveShellLabel           powershell|pwsh→PowerShell，否则 basename (175794)
 *   vUt  → isHttpUrl                   ^https?:// (175800)
 *
 *  组件：
 *   yUt  → XtermTerminalPane           xterm 宿主（单会话完整生命周期）(175803)
 *   bUt  → TerminalPanel               单会话包装（SidePanel `terminal` 标签内容）(176229)
 *   Sqt  → createTerminalSession       {id:uid,workspaceKey,services,cwd,index,shellLabel:null} (183510)
 *   Cqt  → createInitialTerminalState  首会话+工作区 (183521)
 *   wqt  → nextFreeSessionIndex        最小未占 index (183525)
 *   Tqt  → formatSessionTitle          index==1→原名，否则「原名 N」(183532)
 *   Eqt  → resolveCloseAction           none|close-panel|close-session (183535)
 *   Dqt  → removeSession               关闭会话并修 activeSessionId（左邻回退）(183544)
 *   Oqt  → removeExitedSession          末会话退出→close-panel (183565)
 *   kqt  → ensureWorkspaceSession      工作区无存活会话→补首会话 (183577)
 *   Aqt  → TerminalTabChip             标签 chip（active !bg-selected 风格，悬停显关闭）(183585)
 *   jqt  → TerminalDockPanel           多会话 dock（标题/shellLabel chip/标签行/新建/关闭）(183623)
 *   Mqt  → TerminalDock                dock 外壳（Z4 id=terminal 140px–50% + 拖拽把手 + 错误边界）(183898)
 *   Nqt/Pqt → DOCK_TRANSITION_CLASSES / 240ms (183695)
 *   Fqt  → armFlexGrowTransition       transitionend|240ms 超时卸载过渡类 (183994)
 *   Iqt  → useDockPanelController      panelRef/elementRef/isVisible + 折叠/展开/尺寸记忆 (184010)
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


/* ────────────────────────────────────────────────────────────────────────────────────────────────
 * 〔A0-S4-4c〕SHIM MODE：本文件组件全体已原样迁入 components/terminal/TerminalPane.tsx（导入方零改动）。
 * 下方再导出面与迁出前导出面逐一对应；B5 头块与尾部符号表随体迁往新文件。
 * ────────────────────────────────────────────────────────────────────────────────────────────── */

export {
  createPendingInput,
  isPrintableOnly,
  stripControlChars,
  resolveImeCommitText,
  recordKeydownCandidate,
  consumeTrackedText,
  appendImeCandidate,
  appendRecentData,
  matchPendingAgainstHistory,
  decideTextareaFlush,
  isPowerShellPath,
  rewriteBlackBackgroundToDefault,
  fixPowerShellPromptColors,
  trimBalancedUrl,
  extractUrlMatches,
  extractBufferLinks,
  colorToRgba,
  TERMINAL_THEME_CSS_VARS,
  buildTerminalThemeFromCssVars,
  stripCoreColors,
  mergeTerminalTheme,
  TERMINAL_FONT_STACK,
  normalizeWindowsPty,
  clampTerminalFontSize,
  resolveShellLabel,
  isHttpUrl,
  Osc52ClipboardAddon,
  XtermTerminalPane,
  TerminalPanel,
  createTerminalSession,
  buildTuiEditCommand,
  createInitialTerminalState,
  nextFreeSessionIndex,
  formatSessionTitle,
  resolveCloseAction,
  removeSession,
  removeExitedSession,
  ensureWorkspaceSession,
  TerminalTabChip,
  TerminalDockPanel,
  armFlexGrowTransition,
  useDockPanelController,
  TerminalDock,
} from '../components/terminal/TerminalPane';
export type {
  TerminalService,
  XtermTerminalPaneProps,
  TerminalPanelProps,
  TerminalSession,
  TerminalDockState,
  TerminalDockPanelProps,
  DockPanelController,
  TerminalDockProps,
} from '../components/terminal/TerminalPane';
