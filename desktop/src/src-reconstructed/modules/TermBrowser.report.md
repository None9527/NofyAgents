# TermBrowser 模块抽取报告（终端/浏览器/代码查看族 · D8 Stage B3 / F13+F14）

- 输入：`/home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js`（213,695 行，**未修改**，md5 `c9d0d675…`）
- 产物：
  - `src-reconstructed/modules/TerminalPane.tsx`（1,974 行）
  - `src-reconstructed/modules/BrowserPane.tsx`（3,263 行）
  - `src-reconstructed/modules/CodeViewer.tsx`（2,414 行）
- 对照：`src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx`（pretty-print 版）
- 地图：`MODULE-MAP.md` F13/F14；标样：`TopBar.tsx`；纪律对照：`/home/none/grok-build/web/docs/orca-spec.md` §12.4
- 任务对象：`bUt` 终端 pane、`_Wt/vWt` 浏览器 pane、`tHt` 代码查看器、`pqt` 挂起浏览器占位（SidePanel 已登记，互引不重复）

---

## 0. 行号口径

与 TopBar/SidePanel 试点相同：所有行号以输入 `.js` 为主口径，括注 jsx 双行号。对 30+ 个符号做
双向定位（`function X(` 在两文件各自命中后核对类名/i18n key/testid），全部一致。
MODULE-MAP 锚点 `bUt≈175976/142668`、`tHt≈161141/133444`、`_Wt≈177724/144066`、`vWt≈178191/144506` 逐字命中。

testid 常量经「styles 导入别名 → src-HCld2afU.js 导出 → 内部定义」两跳反查取值（如
`nn`←`Ii`←`Gg`=`terminal`、`Qe`←`$t`←`Tg`=`browser-address-input`、`di`←`hs`←`Mo`={min320/max3840/min320/max2160}、
`fre`←`xt`←`Fb`={WheelBoundary:`zcode:embedded-browser-wheel-boundary`}、`ete`←`dt`←`Qb`=`zcode-browser-restore://pending`），
已内联进产物。

---

## 1. 组件清单（混淆名 → 语义名 → 行号）

### 1.1 TerminalPane.tsx（F13 终端侧，完整还原）

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `FHt/l5/u5/IHt/LHt/RHt/zHt/BHt/VHt/HHt` | IME 组合输入守卫群 | 175265–175364 | 142080 起 | pending/候选/历史窗(150ms)/input 配对(40ms)/flush 判定(150ms) |
| `d5/UHt/WHt/GHt/KHt/qHt/JHt` | ANSI+PowerShell 助手 | 175365–175391 | — | ESC/SGR/光标归位/黑底正则；powershell 单行提示 SGR 40→49 |
| `YHt…aUt` | URL 链接检测+buffer 提取 | 175392–175466 | — | 尾标点剥离+括号配平；isWrapped 逻辑行；underline+pointer 链接 |
| `oUt/f5/p5/sUt/cUt/lUt/uUt/m5` | 终端主题合成 | 175467–175541 | — | 18 槽 `--color-terminal-*`；canvas 读像素→rgba；自定义仅覆盖 16 色 |
| `dUt/fUt/h5/pUt/mUt` | 常量 | 175537–175541 | — | mono 链+Nerd Font / 300ms drag 节流 / 150/40/150ms IME 窗 |
| `hUt/gUt/_Ut/vUt` | pty/font/shell/url 助手 | 175543–175559 | — | windowsPty 归一；fontSize 钳 6–72；PowerShell 标签；http 判 |
| `yUt` | `XtermTerminalPane` | 175561–175975 | 142320 | xterm 宿主全生命周期（见 §2 证据） |
| `bUt` | `TerminalPanel` | 175976–175989 | 142668 | 单会话包装（SidePanel `terminal` 标签内容），section p-3 |
| `Sqt/Cqt/wqt/Tqt/Eqt/Dqt/Oqt/kqt` | dock 会话状态机 | 183257–183330 | 147830 起 | 首会话/最小空 index/标题/close-panel\|close-session/左邻回退/补会话 |
| `Aqt` | `TerminalTabChip` | 183331–183363 | 147889 | chip 类名逐字（data-active !bg-selected；关闭钮 hover 显现） |
| `jqt` | `TerminalDockPanel` | 183364–183601 | 147904 | 多会话 dock：标题+shellLabel chip+标签行+新建/关闭+forceMount Tabs |
| `Mqt` | `TerminalDock` | 183602–183694 | 148118 | Z4 id=terminal（0px/140px/50%/折叠）+Q4 把手+`p4` scope=workspace-terminal |
| `Nqt/Pqt/Fqt/Iqt` | dock 面板控制器 | 183695–183770 | — | flex-grow 过渡类 240ms；useDockPanelController（记忆百分比尺寸） |

### 1.2 BrowserPane.tsx（F13 浏览器侧，完整还原）

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `xUt/SUt/CUt/wUt/TUt/EUt/DUt/OUt` | 网页元素选择器 | 175990–176538 | 142680 起 | 4000/6000/500 限额；注入脚本 toString 序列化；overlay+tooltip；Esc/click；上下文入聊天 |
| `kUt` | `BrowserToolbar` | 176539–176663 | 143153 | form h-12：back/forward/reload/地址/responsive/picker/⋯ |
| `g5` | `ToolbarIconButton` | 176688–176710 | 143256 | Tooltip+icon-md；active→secondary+aria-pressed |
| `AUt` | `BrowserMoreMenu` | 176611–176663 | — | ⋯→openExternal（http 门）/devtools |
| `jUt` | `BrowserEmptyState` | 176664–176687 | — | globe\|spinner + browser.title/empty |
| `MUt/NUt/PUt/FUt` | 缩放合成 | 176711–176731 | — | [fit,50…200]；fit=(canvas-32)*zf 取最小；layout/transform 双 scale |
| `IUt/LUt/RUt/zUt` | 8 向 resize 把手 | 176734–176863 | 143360 | role=separator+aria-value*；键盘 ±1/Shift±10；testid 全反查 |
| `BUt/VUt/HUt` | viewport 钳制 | 176864–176875 | — | 默认 393×852；320–3840/320–2160 |
| `UUt` | `ResponsiveViewportCanvas` | 176876–177081 | 143400 | 指针拖拽（rAF 合流）+fit 重测 RO+blur 收尾+scale 变换 |
| `WUt` | `BrowserSurface` | 177082–177168 | 143564 | resize 弱提示条+webview（compositor/layout/transform data-*；partition persist:zcode-embedded-browser；restore src `zcode-browser-restore://pending`） |
| `GUt/KUt/qUt` | 尺寸输入条 | 177169–177343 | 143620 | W×H Popover 越界报错（sr-only alert）+zoom Select |
| `JUt/YUt…QUt/$Ut` | resize 弱提示 | 177344–177455 | 143741 | 3s 提示；settle 窗 300ms/步进 100/硬上限 500；操作期门 |
| `eWt…cWt` | 截图 surface 稳定 | 177456–177591 | — | guest 对齐+viewport ±1+scale 双采样(0.001)→surfaceReady；2.5s 超时 |
| `lWt/uWt` | wheel 续接 | 177592–177616 | — | ipc-message WheelBoundary→画布 scrollBy |
| `dWt…hWt` | 桌面 zoom | 177617–177643 | — | 1.1^clamp(level,-3,5)；getDesktopZoomLevel+changed |
| `gWt` | `useResponsiveModeController` | 177644–177723 | 144000 | 模式开关；browserViewUpdateViewport 双向同步；agent 变更不触发弱提示 |
| `_Wt` | `BrowserView` | 177724–178190 | 144066 | 根：webview 事件全集（did-attach/dom-ready/start-stop-loading/did-navigate(-in-page)/page-title/did-fail-load/render-process-gone）；崩溃原位重建（可恢复原因集）；residency 上报；favicon 监听 |
| `vWt` | `BrowserUseView` | 178191–178240 | 144506 | TabsContent forceMount+inert；selected/surface-preparing/hidden 三态 |
| `yWt/bWt/xWt/SWt` | 截图请求订阅 | 178241–178296 | — | prepare/release；非本 tab 忽略；旧请求保留语义 |
| `vA/gVe/_Ve/vVe/yVe/yA/xVe/SA/MVe/TA` | URL/状态助手 | 50712–50860 | — | about:blank；可恢复崩溃集；disposed 吞错；地址归一（localhost/私网→http） |

### 1.3 CodeViewer.tsx（F14，完整还原）

| 混淆名 | 语义名 | js 行 | jsx 行 | 说明 |
|---|---|---|---|---|
| `kH/PH/FH` | 代码评论 store | 68508–68579 | 60720 | `${ws}\0${path}` 分桶；get/add/remove/removeBySource/restore/clear |
| `U8` | `MarkdownPreviewView` | 160323–160343 | — | cj 渲染 |
| `iVt` | `CodeViewDispatcher` | 160344–160392 | 132789 | 纯文本→BO，否则 MO（评论/gutter/行选择） |
| `aVt/oVt/sVt/cVt` | 图片/SVG 预览 | 160393–160430 | 132816 | 棋盘底；@Nx 缩放 |
| `lVt/uVt/dVt/fVt` | PDF/PPTX 懒加载 | 160432–160477 | — | Suspense 包装（分包登记不还原） |
| `pVt/mVt/W8/hVt/gVt/_Vt` | DiffViewer(memo) | 160478–160577 | — | unified/bars/word-alt；light+dark 双主题；vendored diff 挂接 |
| `vVt` | `PatchPreview` | 160578–160606 | — | 纯文本行优先，否则 diff 引擎 |
| `yVt/bVt/xVt/SVt/CVt/wVt/TVt` | Office 预览 | 160607–160698 | — | xlsx/docx/legacy 三分派+错误边界(resetKey)+pending/error |
| `EVt/G8` | svg 判/错误色 | 160696–160701 | — | fileMissing→subtlest |
| `DVt` | `CodeViewerContentDispatcher` | 160699–160925 | 133073 | 全型分派+加载/错误/二进制/空态文案 |
| `OVt/kVt/K8/AVt/jVt/MVt` | PPTX 残缺守卫 | 160926–160963 | — | 256KB 分块；字节数复核；尺寸漂移错误 |
| `NVt/PVt` | 渐隐遮罩/骨架 | 160966–160971 | — | none/left/right/both；12 行宽% |
| `FVt…$Vt/eHt` | 助手群 | 160973–161140 | — | md/svg 判、ENOENT 判、错误相对化、breadcrumb、更多菜单能力 |
| `UVt/WVt/GVt/KVt/qVt` | 阈值/占位 | 161032–161063 | — | 256KB/2MB/64MB；重内容延迟骨架 |
| `tHt` | `CodeViewerPanel` | 161141–162009 | 133444 | aside preview-pane；breadcrumb 右滚到底+渐隐；视图模式复位；滚动位保留；评论双写聊天附件；编辑器打开 |
| `EA/DA/OA` | 最近编辑器偏好 | 50856–50870 | — | `zcode-last-editor-id` |

### 1.4 登记不还原（vendored / 他族）

- **xterm 库本体**：js **162010–175264**（13,255 行单声明，版本标记 `nHt='3.7.8'`，X14）——以 `XtermModule/XtermFitAddonModule` 接口挂接；**OSC 52 剪贴板 addon（`OHt` 162213）为应用级，已逐字重建**（`Osc52ClipboardAddon`）。
- `pqt` `SuspendedBrowserTabPlaceholder`（182366–182388 / 147193）：已在 `SidePanel.tsx` 完整重建并登记（§1.2 表），本族互引不重复。
- shiki/diff 引擎（X08/X09）、pdf/pptx/office 懒加载分包、`MO/BO/gut/Oft/cj`（Markdown/高亮块族）、`El` gutter 控制器（6062–6881，随 `MO` 基建，接口级登记）。

---

## 2. xterm 配置项证据（对照 orca-spec §12.4 类纪律）

| orca §12.4 纪律 | ZCode 证据 | 判定 |
|---|---|---|
| fontSize 默认 14 | `yUt` 渲染端默认 **13**（175710）；服务端下发 `gUt` 钳 6–72 覆盖（175806） | **差异**（默认值不同，钳制纪律同） |
| 跨平台 mono 链 + Nerd Font | `dUt`：ui-monospace…Consolas/'Cascadia Mono'/'JetBrains Mono'/**'MesloLGS NF'/'Hack Nerd Font'**（175537） | **一致** |
| fontWeight 300 / bold 500 | Terminal 构造选项未见 fontWeight/boldFontWeight | 缺失 |
| cursorBlink block/outline | 未见 | 缺失 |
| scrollSensitivity 1.15 / fast 5 / scrollbar 7 | 未见 | 缺失 |
| kittyKeyboard | 未见 | 缺失 |
| minimumContrastRatio 亮色保护 | 未见（亮色保护走 CSS 变量主题合成） | 缺失（替代实现） |
| link provider 注册加守卫 | `registerLinkProvider`（175779，纯 http）+ `linkHandler` OSC 8（175712）；**注册处无 try/catch 守卫**（orca 为防抛异常杀渲染进程而加） | **有功能、无守卫** |
| 插件 Fit/Search/Serialize/Unicode11/WebLinks | 仅 **FitAddon** + 自研 URL provider 替代 WebLinks + **OSC 52 剪贴板 addon**；Search/Serialize/Unicode11 未见 | **部分** |
| WebGL 渲染器自动策略+诊断 | 未见（默认 canvas/dom） | 缺失 |
| 主题：每 pane 合成注入+不透明度转 rgba | `cUt` 18 槽 CSS 变量 + `sUt` canvas→rgba + `uUt` 自定义仅 16 色 + MutationObserver(class) 重算（175772） | **一致（纪律同构）** |
| CSI 2031 暗/亮同步 | 未见（暗/亮经 documentElement class 观察替代） | 缺失（替代实现） |
| Quick commands（terminal-command\|agent-prompt，scope global\|repo，40/80/4000/6000 限） | **全 chunk 无 quickCommand/quick-prompt 任何 i18n key 或 UI**；`terminal.*` 仅 15 处（toggle/title/new/close/closeTab/exited/contextMenu） | **ZCode 无此特性**（orca 独有） |
| 终端 split | **无 pane split**；对应物 = 多会话**标签**（`jqt` sessionIds/activeSessionId，`Z4 id=terminal` dock） | **形态差异（tabs≠split）** |
| TerminalSlice 核心键 | renderer 本地 `jqt` 状态 `{sessions,workspaces}` ≈ tabsByWorktree；存活判定 = `onDynamicExit`；无未读三表/suppressed/pendingSnapshot 等 | **简化版** |
| vendored patched xterm 6.1.0-beta + 契约测试 | vendored 版本标记 **`nHt='3.7.8'`**（162010），与 orca 6.1.0-beta 不同源 | **不同 fork/版本** |

**结论**：ZCode 终端栈只覆盖 orca §12.4 的「mono+Nerd Font 链、fontSize 钳制、主题合成注入、link provider、Fit 插件」五项纪律；quick commands、split、kitty、WebGL、CSI 2031、守卫式 link 注册等均为 orca 增量，ZCode 以「多标签 dock + IME 组合守卫 + PowerShell 提示色修正 + OSC 52」作为自有增量。

---

## 3. 边界判定依据

1. **函数体边界**：`yUt/bUt/kUt/_Wt/vWt/tHt/jqt/Mqt` 均以 `function X({` 起、下一顶层声明止；助手群按相邻声明定界（§1 行号）。
2. **闭包追踪**：`_Wt` 递归收集 `$Ut/gWt/UUt/WUt/qUt/OUt/cWt/uWt/hWt` 及 URL 助手段（50712–50860，浏览器域横切，随族登记）；`tHt` 收集 `DVt…U8`+PPTX 守卫+breadcrumb 助手+`FH` store。
3. **双归属登记**：`Sqt…Aqt`（183257–183363）SidePanel 报告已建议改记 F13，本次确认并完整还原；`Fqt/Iqt` dock 控制器同时被 F07 装配消费，仅登记接口；`TWt–LWt`（178297–178583）git diff 助手语义属 F04 `BWt`，**未收入本族**（地图 F13 行尾包络含此段，见 §5 勘误）。
4. **调用方确认**：`bUt` 唯一实例化在 SidePanel `terminal` 标签分派（183165）；`_Wt` 双实例化（SidePanel browser 标签 183170 + `vWt` 包装）；`Mqt/jqt` 装配在 `yJt/XJt`（F07，185128–185375）；`tHt` 被 F04 code-viewer 标签与 F03 工具卡复用。

## 4. 外部依赖清单（跨 chunk）

| # | chunk | 符号 |
|---|---|---|
| 1 | react / jsx-runtime | React(Q)、jsx($) |
| 2 | utils-CEEH0K_K.js | cn (Z) |
| 3 | button-laUijeDG.js / 图标块 | Button (X)、lucide 图标群 |
| 4 | IntlProvider-C321H7m8.js | useIntlContext (G)；`terminal.*`15/`browser.*`29/`codeViewer.*`72 key 已核对 |
| 5 | imeComposition-DEYFkwWm.js | Input (P)、toast (m) |
| 6 | usageStatsUiParts / keyboardShortcuts | Tooltip (Ia) 等 |
| 7 | logger-PFDwl5Yq.js | logger (J)；`[Terminal]`/`[browser-use]`/`[PreviewPane]` 日志文案逐字 |
| 8 | src-HCld2afU.js | testid 常量、`di` viewport 限、`fre` IPC 通道、`ete` restore URL、uid (xi) |
| 9 | skillStore-BmeKHDBI.js | zustand create (Ae) |
| — | 本 chunk vendored | xterm（X14，162010–175264，不还原）、Tabs/ContextMenu/Select/Popover/Radix 封装、react-resizable-panels 封装、ScopedErrorBoundary、diff 引擎（X09）、shiki（X08） |
| — | 懒加载分包 | pdf-viewer-m6YcRb_5 / pptx-preview-viewer-B1z6CWke / previewPaneOffice* （登记） |
| — | 他族叶子 | cj Markdown、MO/BO 高亮/纯文本块、gut/Oft diff 纯文本、SidePanel `pqt`、F04 `BWt` |

## 5. 把握度评估

| 部分 | 把握度 | 依据 |
|---|---|---|
| `yUt` xterm 宿主（resize 合流/IME 守卫/主题合成/链接/退出处理）、`jqt/Mqt` dock、`_Wt` webview 事件全集+崩溃重建、`tHt` 分派与头部 | **高（逐字转录）** | 类名/data-*/i18n id/日志文案零改动；状态机纯逻辑逐行对照 |
| 元素选择器注入脚本（`SUt`） | **高** | 纯函数 toString 注入形态保留；DOM 逻辑逐段对应 |
| 响应式视口缩放合成（NUt/PUt/FUt/UUt/WUt） | **高** | 公式与 data-* 属性逐字；testid 反查值内联 |
| TS props/服务接口 | **中高（推断）** | 由解构与调用面归纳（terminalService/browser 服务面/fileService），可能与真实接口细微出入 |
| vendored xterm 内部 API（`_core.textarea`、OSC52 parser 注册） | **中** | 以兼容接口挂接（`registerOscHandlerCompat/inputCompat`），语义对照 xterm 5.x API |
| `El` gutter / diff 引擎内部 | **中（接口级）** | 体量大且独立，接口登记 |

## 6. 验证记录

- `esbuild --loader:.tsx=tsx --jsx=preserve`：三文件均解析通过（0 错误）。
- `tsc --noEmit --strict --jsx react-jsx --target es2022 --module esnext --moduleResolution bundler --lib es2022,dom,dom.iterable --skipLibCheck --esModuleInterop`（在 `/home/none/grok-build/web` 的 @types/react 环境下，临时副本验证后已清理）：**0 错误**。
- `out/` 目录未做任何修改（只读访问）。

## 7. 对地图/规格的勘误与建议

1. **F13 行尾包络**：地图给 175265–178583，但 178297–178583（`TWt–LWt` git diff 助手）语义属 F04 `BWt`（GitChangesPanel），建议改记双归属。
2. **F13 dock 控制器** `Fqt/Iqt`（183697–183770）被 F07 壳装配消费，建议双归属。
3. **xterm 版本标记** `3.7.8`（162010）与 orca「patched 6.1.0-beta」不同源；若后续做契约测试需按 ZCode 自有 fork 口径。
4. **orca §12.4 quick commands / split 在 ZCode 无对应物**（ZCode 为多标签 dock）；规格对比时应按「特性矩阵差异」而非「实现差异」记录。
5. `OHt`（OSC 52 剪贴板 addon）虽位于 vendored 段内，实为应用级代码，建议下版地图从 X14 剥离登记。
