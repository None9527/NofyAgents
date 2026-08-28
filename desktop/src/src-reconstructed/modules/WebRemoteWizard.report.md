# B5-05 批次报告 —— WebRemote 族 F17 + 远程向导 F10 逐字重建（解混淆重建）

- 输入（主口径，只读）：`desktop/src/out/renderer/assets/styles-CdEGpc2x.js`
  （**当前 213,979 行**，D5b/D5c 点状改写后现状；验证前后 md5 一致，见 §D.4）
- 对照：`desktop/src/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx`
  （170,400 行 pretty-print 版，**D5b 前快照**，仅用于 JSX 结构与 jsx 行号对照）
- 产物：
  - `desktop/src/src-reconstructed/modules/WebRemote.tsx`（2,063 行）
  - `desktop/src/src-reconstructed/modules/RemoteWizard.tsx`（1,637 行）
- 登记来源：`B5-FULL-DECODE-PLAN.md` §2 批次 5、`COVERAGE-LEDGER.md` §c 第 6/10 项、
  `MODULE-MAP.md` §F17/§F10、`Modals.report.md` §8、`TopBar.report.md`
- 标样：`ConversationLeaves.tsx`（文件头映射表 + 文件尾符号表）与 `Leaves.report.md`（报告格式）

## 0. 行号口径（双基线）

- MODULE-MAP / COVERAGE-LEDGER / 任务书的行号 = **D5b 前原始 chunk**（213,695 行），下称「原」。
- 本机 `out/` chunk 经 D5b/D5c 点状改写后为 213,979 行（+284 行，含删除云端代码后的
  桩替换与局部增行）。本批实测偏移：
  - **≤142k 段：当前 = 原 + 17**（例：BPt 原 140709 → 当前 140726；MEt 原 123942 → 当前 123959；
    REt 原 124267 → 当前 124284；fOt 原 128093 → 当前 128110）。
  - **149k+ 段：当前 = 原 + 46**（例：rRt 原 149554 → 当前 149600；oRt 原 150103 → 当前 150149）。
- 本批注释与锚点一律以**当前 out 行号**为准，括号注「原 N」换算回地图口径。
- jsx 行号 = pretty 版行号（D5b 前快照，与原始 chunk 同源同行基）。

---

## A. WebRemote 族（WebRemote.tsx，F17）

### A.1 覆盖清单（混淆 → 语义 → 当前 js 行 / jsx 行；「原」= 地图口径）

| 混淆名 | 语义名 | 当前 js 行 | 原 | jsx 行 | 展开方式 | 把握度 |
|---|---|---|---|---|---|---|
| `OPt` | `EMPTY_MOBILE_HOME_RESULT` | 140585 | 140568 | 117214 | 逐字 | 高 |
| `kPt` | `MOBILE_HOME_PREFERENCES_STORAGE_KEY`（`zcode-web-remote-control-mobile-task-home-preferences`） | 140586 | — | 117215 | 逐字 | 高 |
| `v6` | `DEFAULT_MOBILE_HOME_PREFERENCES`（organizeBy=workspace/sortBy=updated） | 140587 | — | 117216 | 逐字 | 高 |
| `APt` | `safeLocalStorage` | 140588 | — | 117223 | 逐字 | 高 |
| `jPt` | `isValidMobileHomePreferences` | 140596 | — | 117231 | 逐字 | 高 |
| `MPt` | `loadMobileHomePreferences` | 140604 | — | 117236 | 逐字 | 高 |
| `NPt` | `saveMobileHomePreferences` | 140614 | — | 117246 | 逐字 | 高 |
| `PPt` | `buildMobileHomeModel`（pinned/timeline/groups/计数） | 140619 | — | 117251 | 逐字 | 高 |
| `FPt` | `activeTaskPresentInModel` | 140648 | — | 117283 | 逐字 | 高 |
| `y6` | `taskStatusBadgeClass`（running/completed/error/idle） | 140658 | — | 117286 | 逐字 | 高 |
| `IPt` | `latestTaskUpdatedAt` | 140670 | — | 117298 | 逐字 | 高 |
| `LPt` | `MOBILE_THEME_OPTIONS`（system/zai-dark/zai-light） | 140673 | — | 117301 | 逐字 | 高 |
| `RPt` | `MobileThemeMenu`（主题下拉） | 140674 | — | 117302 | 全量逐行 | 高 |
| `b6` | `TaskStatusIcon`（spinner/circle-check/circle-alert） | 140716 | — | 117323 | 逐字 | 高 |
| `zPt` | `noopSelectTask` | 140725 | — | 117328 | 逐字 | 高 |
| `BPt` | `WebRemoteMobileTaskHome`（手机端远控任务首页；props: activeTaskId/initialResult/onNavigateHome/onNavigateToChat） | 140726–141572 | 140709–141555 | 117329–117657 | 全量逐行（偏好持久化/搜索/分组·时间线切换/任务卡/空态） | 高 |
| `VPt` | `terminalTransportState`（初值 `idle`） | 141574 | — | 117657 | 逐字 | 高 |
| `HPt` | `transportStateListeners` | 141575 | — | 117658 | 逐字 | 高 |
| `UPt` | `subscribeTransportState` | 141577 | — | 117659 | 逐字 | 高 |
| `WPt` | `getTerminalTransportState` | 141583 | — | 117664 | 逐字 | 高 |
| `GPt` | `useTerminalTransportState`（useSyncExternalStore） | 141586 | — | 117667 | 逐字 | 高 |
| `x6` | `isMobileChatHistoryState`（history.state.zcodeMobilePage===`chat`） | 141590 | — | 117670 | 逐字 | 高 |
| `KPt` | `pushMobileChatHistoryState` | 141594 | — | 117673 | 逐字 | 高 |
| `qPt` | `resolveInitialMobilePage` | 141598 | — | 117678 | 逐字 | 高 |
| `JPt` | `WebRemoteMobileShell`（home/chat 双页 + 侧 pane 覆盖 + 重连通知） | 141601–141801 | 141584–141784 | 117681–117765 | 全量逐行 | 高 |
| `JLt` | `BOT_CHANNEL_PROVIDERS`（weixin/feishu/lark/telegram） | 149473 | 149427 | 123956 | 逐字 | 高 |
| `YLt` | `statusMatchesWorkspaceTarget` | 149479 | — | 123965 | 逐字 | 高 |
| `XLt` | `isStatusLiveMobileConnected` | 149490 | — | 123980 | 逐字 | 高 |
| `ZLt` | `resolveStatusTitle`（starting/running/connecting/…） | 149495 | — | 123983 | 逐字 | 高 |
| `QLt` | `resolveStatusDetail` | 149511 | — | 124011 | 逐字 | 高 |
| `$Lt` | `statusDotClass` | 149527 | — | 124039 | 逐字 | 高 |
| `eRt` | `resolveStatusTag`（设备名/phone/ready/idle/error） | 149536 | — | 124042 | 逐字 | 高 |
| `tRt` | `isSameWebRemoteStatus`（17 字段逐比） | 149549 | — | 124053 | 逐字 | 高 |
| `nRt` | `resolveFailureMessage`（11 种 failure.reason） | 149571 | — | 124056 | 逐字 | 高 |
| `rRt` | `WebRemoteControlDialog`（memo；QR 配对 + 停止/刷新/复制 + Bot Channel 入口） | 149600–150145 | 149554–150099 | 124107–124375 | 全量逐行 | 高 |
| `iRt` | `WEB_REMOTE_CONTROL_ENABLED_DEFAULT` **（D5b 改写：jsx 124378 `!0` → 当前 `!1`，按现状转录 `false`）** | 150147 | 150101 | 124378 | 逐字 | 高 |
| `aRt` | `WebRemoteControlEnabledContext` | 150148 | 150102 | 124379 | 逐字 | 高 |
| `oRt` | `WebRemoteControlEnabledProvider` | 150149 | 150103 | 124380 | 逐字 | 高 |
| `y8` | `useWebRemoteControlEnabled` | 150152 | 150106 | 124386 | 逐字 | 高 |

范围说明：任务书 F17 主范围 = js 140669–142371 + 149554–150434（原口径）。实际纳入
140585–140714（OPt…RPt 簇，BPt 必备依赖、它批未抽取）与 149473–149599（JLt…nRt，rRt
唯一消费族）；两段均在文件头注记。141802–142388（原 141785–142371）= TopBar 族已抽取，
150155+（sRt…xRt）= Sidebar 族已抽取，均只注记（见 §A.2）。

### A.2 边界裁决（只记录，不改动它批产物）

1. **js 141802–142388（原 141785–142371）**：YPt/XPt/ZPt/QPt/$Pt/eFt/tFt/S6/C6/oFt/w6，
   与 F00 TopBar 双归属，已随 `TopBar.tsx` 全量抽取（S6/YPt/XPt/ZPt/$Pt/eFt/tFt 见
   TopBar.report）。本文件不重复抽取。
2. **js 139942–140584（QNt…DPt 段）**：f6/aPt/iPt/TPt/wPt/_Pt/gPt/vPt/DPt/EPt/_6/g6/SPt/CPt
   已随 `SidebarLeaves.tsx` mLt 列表段抽取（实测 SidebarLeaves.tsx 3537–3620 行：
   sortTaskRows/taskMatchesSearch/filterTasksBySearch/groupTasksByWorkspace/视图模型
   = g6/EPt/_6/TPt/DPt，CPt/wPt 在 3537–3557）；uPt/dPt/fPt/pPt 时间线分组已随
   `Sidebar.tsx` 抽取；QNt/$Nt/ePt/tPt/nPt 属 F03/F04 会话内查找。BPt 以接口引用（declare）。
   **任务书排除项「mLt 列表段」按此注记，不重复转录。**
3. **Sidebar.tsx 接口登记**：rRt（Sidebar.tsx 4891 行 declare）与 y8（4876 行 declare）
   为接口级登记；本文件为唯一规范实现，整合期指向本文件。
4. **js 150155–150434（sRt/cRt/lRt 触发器族 + uRt…xRt 用量族）**：已随 `Sidebar.tsx`
   抽取（含 `webRemoteControl.triggerStatus.*` 6 键与 `webRemoteControl.trigger` 4 处）。
   本文件不重复抽取。**任务书排除项按此注记。**
5. **QR 配对库体 `Qq`**：qrcode vendored（X12，VENDOR-MANIFEST 已登记），只注记不转录；
   rRt 内以 `declare` 挂接。
6. **CLt（147813，F11）**：返回 `login.oauth.regionTag.zai`/`login.oauth.regionTag.bigmodel`
   —— D5b 云端删除后的**残留 i18n 键**（chunk 147816/147818 现状仍在），按现状逐字登记于
   declare 注释，不改动（任务书纪律第 4 条）。`_8`（BotProviderAvatar）/`qLt`
   （BotsConfigDialog）属 F11（§c #8 剩余），接口级登记。
7. **OPt…RPt 簇（140585–140714）纳入本文件**：地图 F17 范围起自 140669（原），该簇为 BPt
   的模型/偏好/主题依赖且它批未抽取，依「消费面优先」裁决纳入并在此注记。
8. **JLt…nRt（149473–149599）纳入本文件**：位于 F11 地图范围尾段，但为 rRt 的唯一状态显示
   消费族，双归属按消费面纳入；F11 批（B5-04）若覆盖同段，整合期以本文件为准（本批先落地）。

---

## B. 远程向导族（RemoteWizard.tsx，F10）

### B.1 覆盖清单（混淆 → 语义 → 当前 js 行 / jsx 行；本段偏移 +17）

| 混淆名 | 语义名 | 当前 js 行 | 原 | jsx 行 | 展开方式 | 把握度 |
|---|---|---|---|---|---|---|
| `REt` | `RemoteSettingsForm`（SSH/Server/WSL/Docker 四 case 分步表单；props: kind/host/port/username/sshAuthMethod/assetInstallMode 等） | 124284–125011 | 124267–124994 | 105903–106205 | 全量逐行 | 高 |
| `G2` | `dedupeTrimmed`（建议去重） | 124260 | 124243 | 105879 | 逐字（内联 §3 助手） | 高 |
| `FEt` | `buildSshHistorySuggestions` | 124267 | 124250 | 105886 | 逐字（内联 §3 助手） | 高 |
| `K2` | `WSL_DEFAULT_DISTRO_SENTINEL`（`__default_wsl_distro__`） | 124276 | 124259 | 105895 | 逐字 | 高 |
| `IEt` | `SSH_CONFIG_ALIAS_NONE`（`__ssh_config_alias_none__`） | 124277 | 124260 | 105896 | 逐字 | 高 |
| `LEt` | `sshConfigAliasSummary` | 124278 | 124261 | 105897 | 逐字 | 高 |
| `i4` | `REMOTE_WIZARD_STEPS`（kind/settings/connecting/directory） | 127943 | 127926 | 107954 | 逐字 | 高 |
| `lOt` | `wizardStepIndex` | 127949 | 127932 | 107967 | 逐字 | 高 |
| `uOt` | `RemoteWizardStepIndicator`（移动横滚 nav + 桌面 aside 双形态） | 127952–128055 | 127935–128038 | 107970–107992 | 全量逐行 | 高 |
| `dOt` | `RemoteWizardHeader`（标题/描述 + 最小化(minus)/关闭(x)） | 128058–128108 | 128041–128091 | 107993–108011 | 全量逐行 | 高 |
| `fOt` | `RemoteWizardDialog`（触发器 + Dialog 壳 + 四步分派；最小化/关闭语义内嵌） | 128110–128541 | 128093–128524 | 108012–108384 | 全量逐行 | 高 |
| `pOt` | `RemoteWizardDialogAlias`（`var pOt = fOt`，Home.tsx 接口引用名） | 128542 | 128525 | 108385 | 逐字 | 高 |

### B.2 边界裁决（只记录，不改动它批产物）

1. **已抽取（Modals.tsx，只注记）**：MEt 目录浏览（原 123942–124126）+ OEt/kEt/AEt/jEt
   （原 123929–123941；实测 Modals.tsx 3348–3360 行）；r4 分派 + ZEt/lDt/XDt 三同步对话框
   + $Dt + preflight 助手（原 124995–127332，Modals.report §8）；`$2`
   canOpenRemoteSessionSourceCheck（原 127125，TopBar.report 亦登记，裁决归 Modals）；
   ZTt/QTt 远程目标显示（原 123239/123251，TopBar.report）。128795+ 更新窗属 F09/TopBar。
2. **账实差异注记**：COVERAGE-LEDGER §c 将原 123942–124266 记为「MEt 已抽取」，实测
   Modals.tsx 仅覆盖至原 124126（当前 124143）；子段 `NEt`（124144/105812）/`PEt`
   （124147/105817）/`W2` SuggestionInput（124152–124259/105822）实际**未抽取**。
   本文件对三者以接口级 declare 登记（W2 含 Popover+cmdk 建议面签名），不改动
   Modals.tsx；建议整合期补抽或归并本族。G2/FEt/K2/IEt/LEt 为 REt 直接依赖，已内联
   逐字实现（见 B.1）。
3. **未分配隙段（接口级登记，建议后续批）**：
   - a) 原 123518–123928（当前 123535–123945）：`fEt`（123522/105244）/`pEt`（123526/105251）/
     `mEt` useRemoteWizardState（123535/105255）/`hEt`（123747/105441）/`bEt`
     useRemoteConnectionLogs（123789/105484）/`xEt` resolveWizardStepCopy（123838/105519）/
     `SEt` validateAndBuildRemoteTarget（123868/105567）/`CEt`（123929/105674）/`wEt`
     （123932/105682）/`TEt`（123935/105685）/`EEt`（123938/105688）/`DEt`（123941/105694）。
     fOt/REt 对其全部依赖面以 declare 挂接，签名按调用点反推（把握度：签名中、体内未转录）。
   - b) 原 127340–127925（当前 127357–127942）：`rOt` RemoteConnectingStep（127357/107685）/
     `oOt` RemoteKindStep（127539/107764）/`sOt` RemoteSettingsStep（127616/107792）/`cOt`
     RemoteDirectoryStep（127782/107859，内嵌 MEt embedded + 三同步卡）。fOt 渲染的四个
     步骤组件即此隙段，本文件以 declare 挂接。
4. **mOt…bOt（原 128526–128567）**：家目录感知显示名/工作区菜单过滤，已随 `Home.tsx`
   抽取（mOt…bOt 见 Home.tsx）；Home.tsx 1192 行 `pOt = fOt` 为接口级登记，整合期指向
   本文件的 `RemoteWizardDialogAlias`。
5. **i18n**：`remote/ssh/server/wsl/docker.*` 键全部保留原键名（见 §C）。

---

## C. i18n 覆盖核对

- **webRemoteControl.\***：当前 js 140585–150434 共 88 处。本文件（WebRemote.tsx）
  转录 77 处（72 唯一键）；其余 11 处全部位于已抽取组件：`webRemoteControl.triggerStatus.*`
  6 键（150159–150183，Sidebar.tsx 实测 6 处）+ `webRemoteControl.trigger` 4 处
  （150221–150261，lRt 触发器，Sidebar.tsx）+ `webRemoteControl.openTask` 1 处
  （147179，mLt 列表段，SidebarLeaves.tsx 3728 行）。
  三件联合（WebRemote ∪ Sidebar ∪ SidebarLeaves）与 chunk 140585–150215 的键多重集
  **完全一致（0 差）**（`webRemoteControl.trigger` 4 处位于 150216+，归 Sidebar 抽取面）。
- **remote/ssh/server/wsl/docker.\***：本批两段范围（当前 124267–125011 + 127935–128568）
  共 67 处，RemoteWizard.tsx 转录 67 处，多重集 **完全一致（0 差）**。
  任务书「92 处（123825–124986 范围内部分）」的其余 15 处（123825–124266 段）位于：
  MEt/OEt 族（Modals.tsx 已抽取，3 唯一键）+ 隙段 a) 的 xEt/SEt（接口级 declare，
  13 唯一键：`remote.kindStepDescription`/`remote.settingsStepTitle/Description`/
  `remote.connectingStepTitle/Description`/`remote.selectDirectoryTitle/Description`/
  `ssh.validation.required/passwordRequired/privateKeyRequired`/
  `server.validation.urlRequired/invalidUrl` + 动态前缀 `remote.kind.*`），
  体内转录随隙段 a) 后续批落地。

---

## D. 验证记录（四项门禁）

### D.1 esbuild（门禁 1）

```
web/node_modules/.bin/esbuild desktop/src/src-reconstructed/modules/WebRemote.tsx \
  --loader:.tsx=tsx --jsx=preserve --outfile=/dev/null   → Done in 2ms，0 错
web/node_modules/.bin/esbuild desktop/src/src-reconstructed/modules/RemoteWizard.tsx \
  --loader:.tsx=tsx --jsx=preserve --outfile=/dev/null   → Done in 2ms，0 错
```

### D.2 tsc strict（门禁 2）

- 配置：`/tmp/tsconfig.webremote.json` / `/tmp/tsconfig.remotewizard.json`
  （strict、target ES2022、lib ES2022+DOM+DOM.Iterable、jsx preserve、module ESNext、
  moduleResolution Bundler、typeRoots → `web/node_modules/@types`、skipLibCheck、noEmit、
  include 仅该产物）。
- 附加裁决：`react` 模块解析经 `baseUrl`+`paths` 指向 `web/node_modules/@types/react`
  （18.3.31，与 web 工作区 react 18.3.1 配套）；否则 Bundler 解析会命中
  `desktop/src/node_modules/react`（19.2.8，无配套类型）。此为环境接线，不改产物语义。
- 类型层垫片一处：@types/react 18 未收录 `inert` 属性（React 19 类型才有），原 JSX 在
  JPt `<main>` 上原样使用（当前 js 141722），WebRemote.tsx 头部以 `declare module "react"`
  补 `HTMLAttributes.inert?: boolean`（零运行时影响，注释留痕）。
- 结果：
```
web/node_modules/.bin/tsc -p /tmp/tsconfig.webremote.json    → exit 0，0 错
web/node_modules/.bin/tsc -p /tmp/tsconfig.remotewizard.json → exit 0，0 错
```
- 修正归零记录：首轮 tsc WebRemote 16 错（react 类型解析 1 + inert 1 + 隐式 any 14，
  全部源于 react 类型未接线；接线后仅剩 inert 1 错，垫片后归零）。RemoteWizard 首轮 4 错
  （`SuggestionInput` declare 的 `onChange` 与 `InputHTMLAttributes["onChange"]` 交集冲突，
  Omit 增补 `"onChange"` 后归零——W2 真实签名即 `(v: string) => void` 值回调）。

### D.3 锚点回代（门禁 3；≥8 项，全部逐字命中）

| # | 锚点（逐字串） | 当前 js 行 | 原 | jsx 行 | 产物行 | 结果 |
|---|---|---|---|---|---|---|
| A1 | `var OPt = { workspaces: [], tasks: [] },` | 140585 | 140568 | 117214 | WebRemote 348 | ✓ |
| A2 | ``kPt = `zcode-web-remote-control-mobile-task-home-preferences` `` | 140586 | — | 117215 | WebRemote 350 | ✓ |
| A3 | ``var LPt = [`system`, `zai-dark`, `zai-light`];`` | 140673 | — | 117301 | WebRemote 476 | ✓ |
| A4 | `id: `webRemoteControl.mobileShell.chatTitle`` | 141709 | — | — | WebRemote 1358 | ✓ |
| A5 | `inert: E ? !0 : void 0,`（JPt `<main>`；产物 JSX 属性形 `inert={E ? true : void 0}`） | 141722 | 141705 | — | WebRemote 1368 | ✓ |
| A6 | `var JLt = [`（BOT_CHANNEL_PROVIDERS 四供应商） | 149473 | 149427 | 123956 | WebRemote 1441 | ✓ |
| A7 | ``J.info(`[WebRemoteControlDialog] Web 远程控制状态已同步`, {`` | 149640 | — | — | WebRemote 1635 | ✓ |
| A8 | `iRt = !1,`（**D5b**；jsx 124378 为 `!0`，按现状转录 `false`） | 150147 | 150101 | 124378 | WebRemote 2026 | ✓ |
| A9 | ``var K2 = `__default_wsl_distro__`,`` | 124276 | 124259 | 105895 | RemoteWizard 1141 | ✓ |
| A10 | ``IEt = `__ssh_config_alias_none__`;`` | 124277 | 124260 | 105896 | RemoteWizard 1143 | ✓ |
| A11 | `var i4 = [`（REMOTE_WIZARD_STEPS 四步） | 127943 | 127926 | 107954 | RemoteWizard 384 | ✓ |
| A12 | `var pOt = fOt;` | 128542 | 128525 | 108385 | RemoteWizard 1621 | ✓ |

jsx 基线符号定义行抽验（pretty 版，D5b 前快照）：BPt 117329、JPt 117681、rRt 124107、
oRt 124380、REt 105903、uOt 107970、dOt 107993、fOt 108012 —— 全部与产物头表一致。

### D.4 out/ 只读复验（md5）

```
md5(desktop/src/out/renderer/assets/styles-CdEGpc2x.js)
  = 48d71d4874b0868d61fd35a328bf6ad5   （批次开始前基线）
  = 48d71d4874b0868d61fd35a328bf6ad5   （全部产物落盘后复验，一致）
```

---

## E. 把握度分布

- **高（逐字/全量逐行）**：A.1/B.1 表列全部转录符号（39 + 12 个），含类名、字符串常量、
  分支结构、日志文案、i18n 键名零改动。
- **中（接口级 declare，签名按调用点反推）**：隙段 a) 12 符号（fEt/pEt/mEt/hEt/bEt/xEt/
  SEt/CEt/wEt/TEt/EEt/DEt）、隙段 b) 4 符号（rOt/oOt/sOt/cOt）、账实差异段 3 符号
  （NEt/PEt/W2）、跨族依赖（CLt/_8/qLt、useWebRemoteTaskSwitcher/webRemoteTaskKey/
  taskWorkspaceKey/sortTaskRows/groupTasksByWorkspace/timelineBucketLabel/
  groupTasksByTimelineBucket/formatRelativeTime/toErrorMessage、Qq、useSessionStore/
  useBaseServices/useConfirmDialog 等）。
- **低**：无。

## F. 遗留问题

1. **账实差异**（§B.2-2）：COVERAGE-LEDGER §c「MEt 已抽取（原 123942–124266）」与实测
   不符（Modals.tsx 止于原 124126）。NEt/PEt/W2 待整合期补抽或归并本族；本批仅接口级
   登记，未改动 Modals.tsx/COVERAGE-LEDGER（纪律：只记录）。
2. **隙段 a)/b) 体内实现**（§B.2-3）：共 16 符号约 1,100 行（原口径）未转录，建议列入
   后续批次（可归 B5-06 或专设补抽批）；届时替换本文件 declare。
3. **iRt D5b 语义**：特性门现状为 `!1`（默认关闭），与 jsx 快照 `!0` 相反；若整合期
   决定恢复远控入口，需同步 D5b 台账（DELETED-CLOUD-LEDGER.md）与本文件注释。
4. **login.oauth 残留键**（§A.2-6）：CLt 的 `login.oauth.regionTag.*` 两键为 D5b 后残留，
   按现状保留；若后续清理残留键，需同步 rRt Bot Channel 区的标签显示分支。
5. **JLt…nRt 双归属**（§A.2-8）：位于 F11 地图范围尾段；B5-04（PaymentDeep/Bots）若已
   覆盖同段，整合期按「消费面优先」以本文件为准裁决。
6. **tsc 环境接线**（§D.2）：`/tmp/tsconfig.*.json` 的 `paths` 指向 web 工作区
   @types/react 为本机双 node_modules 布局的既定做法，与它批（TermBrowser/GitReview
   等「临时副本于 web 环境验证」）等效。

## G. 符号表（增量，供 SYMBOL-INDEX 抽取）

### WebRemote.tsx（39 符号）

```
OPt→EMPTY_MOBILE_HOME_RESULT 140585/117214 | kPt→MOBILE_HOME_PREFERENCES_STORAGE_KEY 140586/117215
v6→DEFAULT_MOBILE_HOME_PREFERENCES 140587/117216 | APt→safeLocalStorage 140588/117223
jPt→isValidMobileHomePreferences 140596/117231 | MPt→loadMobileHomePreferences 140604/117236
NPt→saveMobileHomePreferences 140614/117246 | PPt→buildMobileHomeModel 140619/117251
FPt→activeTaskPresentInModel 140648/117283 | y6→taskStatusBadgeClass 140658/117286
IPt→latestTaskUpdatedAt 140670/117298 | LPt→MOBILE_THEME_OPTIONS 140673/117301
RPt→MobileThemeMenu 140674/117302 | b6→TaskStatusIcon 140716/117323 | zPt→noopSelectTask 140725/117328
BPt→WebRemoteMobileTaskHome 140726–141572/117329–117657
VPt→terminalTransportState 141574/117657 | HPt→transportStateListeners 141575/117658
UPt→subscribeTransportState 141577/117659 | WPt→getTerminalTransportState 141583/117664
GPt→useTerminalTransportState 141586/117667 | x6→isMobileChatHistoryState 141590/117670
KPt→pushMobileChatHistoryState 141594/117673 | qPt→resolveInitialMobilePage 141598/117678
JPt→WebRemoteMobileShell 141601–141801/117681–117765
JLt→BOT_CHANNEL_PROVIDERS 149473/123956 | YLt→statusMatchesWorkspaceTarget 149479/123965
XLt→isStatusLiveMobileConnected 149490/123980 | ZLt→resolveStatusTitle 149495/123983
QLt→resolveStatusDetail 149511/124011 | $Lt→statusDotClass 149527/124039
eRt→resolveStatusTag 149536/124042 | tRt→isSameWebRemoteStatus 149549/124053
nRt→resolveFailureMessage 149571/124056 | rRt→WebRemoteControlDialog 149600–150145/124107–124375
iRt→WEB_REMOTE_CONTROL_ENABLED_DEFAULT 150147/124378（D5b !1）| aRt→WebRemoteControlEnabledContext 150148/124379
oRt→WebRemoteControlEnabledProvider 150149/124380 | y8→useWebRemoteControlEnabled 150152/124386
```

### RemoteWizard.tsx（12 符号）

```
G2→dedupeTrimmed 124260/105879 | FEt→buildSshHistorySuggestions 124267/105886
K2→WSL_DEFAULT_DISTRO_SENTINEL 124276/105895 | IEt→SSH_CONFIG_ALIAS_NONE 124277/105896
LEt→sshConfigAliasSummary 124278/105897 | REt→RemoteSettingsForm 124284–125011/105903–106205
i4→REMOTE_WIZARD_STEPS 127943/107954 | lOt→wizardStepIndex 127949/107967
uOt→RemoteWizardStepIndicator 127952–128055/107970–107992
dOt→RemoteWizardHeader 128058–128108/107993–108011
fOt→RemoteWizardDialog 128110–128541/108012–108384 | pOt→RemoteWizardDialogAlias 128542/108385
```

（行号口径：当前 out js 行 / jsx 行；「原」换算见 §0。）
