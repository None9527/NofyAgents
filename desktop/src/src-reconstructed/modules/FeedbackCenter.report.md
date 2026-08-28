# B5-03 批次报告 —— 反馈中心 F09（RMe 族）逐字重建

- 输入：`desktop/src/out/renderer/assets/styles-CdEGpc2x.js`（213,979 行，**未修改**，只读访问；md5 `48d71d4874b0868d61fd35a328bf6ad5` 完成后复验不变）
- 对照：`desktop/src/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx`（pretty-print 孪生）
- 产物：
  - `desktop/src/src-reconstructed/modules/FeedbackCenter.tsx`（4,334 行）
  - 本报告
- 登记来源：`COVERAGE-LEDGER.md` §a F09 行 + §c 第 9 项（行 128）；`MODULE-MAP.md` §F09（行 110–118）；`B5-FULL-DECODE-PLAN.md` 批次 #3
- 标样：`ConversationLeaves.tsx`（头注映射表 + §0 外部依赖声明 + 尾符号表）与 `Leaves.report.md`（报告格式）

## 0. 行号口径（重要修正）

任务书与旧账使用 213,695 行版 chunk 的行号。当前融合 chunk 为 213,979 行：去品牌提交 `cb2ab75` 在本区段之前净插入 **48 行**，故 **旧账行号一律 +48**：

| 旧账 | 当前 | 内容 |
|---|---|---|
| 37067 | 37115 | `Hje`（表单原语群起点，任务书口径） |
| 39107 | 39155 | `RMe` 根（旧账曾误作族起点） |
| 39155 | 39203 | — |
| 40396 | 40444 | 主范围终点 |
| 40397–41807 | 40445–41855 | StoresDeep.tsx §H（排除） |
| 41808–41892 | 41856–41940 | 尾段（见 §2 裁决 6） |

本文件与报告一律使用**当前行号**；产物头表双行号格式为 `js 行 / jsx 行`，jsx 行经逐符号核对（审计脚本全量比对，0 失配）。

## 1. 覆盖清单（混淆 → 语义 → js 行 / jsx 行 → 把握度）

展开方式：本批全部符号为**全量逐字转录**（类名/字符串常量/分支结构零改动；`// REBRAND-*` 行尾注释照录）。把握度：**高** = 逐行核对孪生与原文；**高-** = 逐字转录但依赖 declare 的跨族类型签名（签名按调用点反推）。

### 1.1 状态呈现（§1，js 37093–37138 / jsx 33890–33960）

| 混淆名 | 语义名 | js / jsx | 把握度 |
|---|---|---|---|
| `Bje` | `TICKET_STATUS_STYLES` | 37093 / 33890 | 高 |
| `Vje` | `TICKET_STATUS_I18N_KEYS`（9 个 `feedback.status.*` 键） | 37104 / 33928 | 高 |
| `Hje` | `formatTicketStatus` | 37115 / 33939 | 高 |
| `Uje` | `TicketStatusBadge` | 37118 / 33944 | 高 |
| `bC` | `FeedbackErrorBanner` | 37129 / 33956 | 高 |

### 1.2 联系方式持久化（§2，js 37139–37174）

| 混淆名 | 语义名 | js / jsx | 把握度 |
|---|---|---|---|
| `xC` | 存储键 `zcode.feedback.contact` | 37139 / — | 边界：stores-core.tsx §3 `FEEDBACK_CONTACT_KEY` |
| `SC`/`CC`/`Wje`/`wC` | `feedbackStorage`/`readFeedbackContact`/`clearFeedbackContact`/`writeFeedbackContact` | 37140–37171 | 边界：stores-core.tsx §3（declare 引用） |
| `TC` | `persistFeedbackContact` | 37172 / 33992 | 高（stores-core 未覆盖，本文件补齐） |

### 1.3 截图（§3，js 37175–37344 / jsx 33995–34065）

| 混淆名 | 语义名 | js / jsx | 把握度 |
|---|---|---|---|
| `Gje` | `ScreenshotPicker` | 37175 / 33995 | 高 |
| `Kje` | `ScreenshotGridItem` | 37294 / 34033 | 高 |
| `qje` | `readScreenshotFile` | 37320 / 34043 | 高 |
| `EC` | `screenshotDataUrl` | 37342 / 34063 | 高 |

### 1.4 表单原语（§4，js 37345–37629 / jsx 34066–34204）

| 混淆名 | 语义名 | js / jsx | 把握度 |
|---|---|---|---|
| `DC` | `FeedbackSwitch` | 37345 / 34066 | 高 |
| `OC` | `UploadProgressRow` | 37360 / 34073 | 高 |
| `Jje` | `DescriptionField` | 37394 / 34082 | 高 |
| `Yje` | `ContactField` | 37411 / 34102 | 高 |
| `Xje` | `LogsToggleRow` | 37430 / 34115 | 高 |
| `Zje` | `SubmitActionBar` | 37465 / 34127 | 高 |
| `kC` | `FormSection` | 37530 / 34138 | 高 |
| `AC` | `FormFieldBody` | 37548 / 34145 | 高 |
| `Qje` | `CharCount` | 37559 / 34151 | 高 |
| `$je` | `SCROLL_FADE_CLASSES` | 37565 / 34157 | 高 |
| `jC` | `FadeScrollArea`（scroll/resize/ResizeObserver 四态渐隐） | 37571 / 34163 | 高 |

### 1.5 模型上下文 / 错误归一（§5，js 37630–37655）

| 混淆名 | 语义名 | js / jsx | 把握度 |
|---|---|---|---|
| `eMe` | `MODEL_OPTIONS_PREVIEW_LIMIT = 12` | 37630 / 34205 | 高 |
| `tMe` | `collectModelContext` | 37631 / 34206 | 高 |
| `MC` | `extractErrorMessage` | 37651 / 34228 | 高 |

### 1.6 提交作业引擎（§6，js 37656–38051 / jsx 34231–34599）

| 混淆名 | 语义名 | js / jsx | 把握度 |
|---|---|---|---|
| `NC` | `DEFAULT_SUBMISSION_COPY`（21 条中文文案逐字） | 37656 / 34231 | 高 |
| `nMe` | `submissionJobSeq` | 37679 / — | 高 |
| `PC` | `submissionJobsById` | 37680 / — | 高 |
| `FC` | `submissionRegistryListeners` | 37681 / — | 高 |
| `IC` | `snapshotSubmissionJobs` | 37682 / 34257 | 高 |
| `LC` | `notifySubmissionRegistry` | 37685 / 34263 | 高 |
| `rMe` | `getSubmissionJobs` | 37689 / 34267 | 高 |
| `iMe` | `subscribeSubmissionJobs` | 37692 / 34270 | 高 |
| `RC` | `dismissSubmissionJob` | 37703 / 34277 | 高 |
| `aMe` | `getSubmissionJobById` | 37706 / 34280 | 高 |
| `zC` | `cancelJobBeforeTicket` | 37709 / 34283 | 高 |
| `oMe` | `createFeedbackSubmissionJob` | 37723 / 34296 | 高 |
| `sMe` | `freezeFormDraft` | 37898 / 34469 | 高 |
| `cMe` | `displaySubmissionError` | 37902 / 34480 | 高 |
| `BC` | `FeedbackSubmissionCanceledError` | 37911 / 34483 | 高 |
| `lMe` | `uploadFullLogWithResume` | 37916 / 34488 | 高 |
| `VC` | `formatBytes` | 37992 / 34549 | 高 |
| `uMe` | `mapUploadProgress` | 37999 / 34552 | 高 |
| `dMe` | `isUploadCanceledError` | 38021 / 34572 | 高 |
| `HC` | `useSubmissionCopy` | 38024 / 34575 | 高 |

### 1.7 提交表单（§7，js 38052–38399 / jsx 34600–34877）

| 混淆名 | 语义名 | js / jsx | 把握度 |
|---|---|---|---|
| `fMe` | `TITLE_MAX_LENGTH = 80` | 38052 / 34600 | 高 |
| `pMe` | `TICKET_AGENT_NAME = "Nofy Agent"`（REBRAND-014+114） | 38053 / 34601 | 高 |
| `mMe` | `deriveTicketTitle` | 38054 / 34602 | 高 |
| `hMe` | `buildFeedbackDescription`（`Agent 框架: nofy-agent` 逐字） | 38064 / 34605 | 高 |
| `gMe` | `DEVICE_AGENT_PROVIDER = "Nofy Agent"`（REBRAND-015+115） | 38089 / 34615 | 高 |
| `_Me` | `DEFAULT_SEVERITY = "P2-中"` | 38090 / 34616 | 高 |
| `vMe` | `DEFAULT_MODULE = "其它"` | 38091 / 34617 | 高 |
| `UC` | `startFeedbackSubmission` | 38092 / 34618 | 高 |
| `yMe` | `DESCRIPTION_MAX_LENGTH = 4000` | 38162 / 34703 | 高 |
| `bMe` | `CONTACT_MAX_LENGTH = 200` | 38163 / 34704 | 高 |
| `WC` | `SCREENSHOT_MAX_COUNT = 5` | 38164 / 34705 | 高 |
| `xMe` | `hasFeedbackAttachments` | 38165 / 34706 | 高 |
| `SMe` | `FeedbackSubmitForm` | 38168 / 34712 | 高 |
| `CMe` | `isTextEditingTarget` | 38389 / 34867 | 高 |
| `wMe` | `useFeedbackModelContext` | 38394 / 34872 | 高 |

### 1.8 功能请求（§8，js 38400–38689 / jsx 34878–35023）

| 混淆名 | 语义名 | js / jsx | 把握度 |
|---|---|---|---|
| `GC` | `FEATURE_FIELD_MAX = 2000` | 38400 / 34878 | 高 |
| `TMe` | `FEATURE_CONTACT_MAX = 200` | 38401 / 34879 | 高 |
| `EMe` | `FeatureRequestDialog`（memo） | 38402 / 34880 | 高 |
| `KC` | `FeatureRequestField` | 38637 / 34996 | 高 |
| `DMe` | `buildFeatureRequestDescription` | 38677 / 35015 | 高 |

### 1.9 我的工单（§9，js 38690–38951 / jsx 35024–35166）

| 混淆名 | 语义名 | js / jsx | 把握度 |
|---|---|---|---|
| `qC` | `formatRelativeTime` | 38690 / 35024 | 高 |
| `OMe` | `FeedbackTicketsView` | 38717 / 35047 | 高 |
| `kMe` | `TicketsLoadingPlaceholder` | 38827 / 35117 | 高 |
| `AMe` | `TicketList` | 38837 / 35125 | 高 |
| `jMe` | `TicketsEmptyState` | 38924 / 35152 | 高 |

### 1.10 后台提交指示（§10，js 38952–39154 / jsx 35167–35261）

| 混淆名 | 语义名 | js / jsx | 把握度 |
|---|---|---|---|
| `MMe` | `SUCCESS_CARD_TTL_MS = 5000` | 38952 / 35167 | 高 |
| `NMe` | `isJobSettledWithTicket` | 38953 / 35168 | 高 |
| `PMe` | `jobOpenTarget` | 38956 / 35171 | 高 |
| `FMe` | `FeedbackBackgroundJobHost` | 38961 / 35180 | 高 |
| `IMe` | `BackgroundJobCard` | 38980 / 35191 | 高 |
| `LMe` | `BackgroundJobIndicator` | 39014 / 35215 | 高 |

### 1.11 根（§11，js 39155–39253 / jsx 35262–35306）

| 混淆名 | 语义名 | js / jsx | 把握度 |
|---|---|---|---|
| `RMe` | `FeedbackCenter`（`React.memo` 根；提交/我的工单/功能请求三页壳） | 39155 / 35262 | 高 |

### 1.12 F07 邻接助手（§12/§13 边界，行段在 F09 包络内）

| 混淆名 | 语义名 | js / jsx | 把握度 |
|---|---|---|---|
| `zMe` | `resolveAdjacentTasks` | 39254 / 35307 | 高（WorkspaceShell.tsx 已 declare，本文件给出实现） |
| `BMe` | `collectWorkspaceTaskIds` | 39268 / 35321 | 高（同上） |
| `JMe` | `runWithWorkspaceVisibility` | 39455 / 35462 | 高（同上） |

### 1.13 常量邻接（§14，js 39459–39460）

| 混淆名 | 语义名 | js / jsx | 把握度 |
|---|---|---|---|
| `uw` | `APP_LOGO_DATA_URL`（1,917 字符 dataURI，脚本注入逐字） | 39459 / 35470 | 高 |
| `dw` | `ATTACHMENT_CHUNK_BYTES = 384 * 1024` | 39460 / 35471 | 高 |

### 1.14 附件上传协议（§15，js 39461–39581 / jsx 35472–35585）

| 混淆名 | 语义名 | js / jsx | 把握度 |
|---|---|---|---|
| `fw` | `throwIfUploadAborted` | 39461 / 35472 | 高 |
| `YMe` | `base64ToBytes` | 39466 / 35477 | 高 |
| `XMe` | `base64ByteLength` | 39472 / 35483 | 高 |
| `ZMe` | `bytesToBase64` | 39492 / 35495 | 高 |
| `QMe` | `sha256Checksum` | 39498 / 35501 | 高 |
| `$Me` | `newUploadId` | 39503 / 35506 | 高 |
| `eNe` | `measureAttachmentFrameBytes` | 39508 / 35509 | 高 |
| `pw` | `assertFrameWithinLimit` | 39512 / 35513 | 高 |
| `tNe` | `uploadAttachmentChunkedV4`（断点续传 nextChunkIndex） | 39515 / 35516 | 高 |

### 1.15 v4 会话运行时（§16，js 39582–40444 / jsx 35586–36396）

会话数据层域：`services.tsx` / `ExtendedViews.tsx` 此前仅接口级登记（`declare`），本文件为其**实现转录**。

| 混淆名 | 语义名 | js / jsx | 把握度 |
|---|---|---|---|
| `mw` | `createConversationTransport` | 39582 / 35586 | 高 |
| `nNe` | `INITIAL_SNAPSHOT_STORE_STATE` | 39781 / 35783 | 高 |
| `rNe` | `TERMINAL_COMMAND_STATUSES` | 39793 / 35795 | 高 |
| `iNe` | `frameBumpsPlanDirectory` | 39794 / 35796 | 高 |
| `aNe` | `frameBumpsTurnNavigator` | 39804 / 35804 | 高 |
| `hw` | `hasOlderRows` | 39814 / 35812 | 高 |
| `oNe` | `isFirstTurnHeaderMissing` | 39819 / 35817 | 高 |
| `gw` | `prependOlderRows` | 39824 / 35822 | 高 |
| `sNe` | `ConversationSnapshotStore`（class，约 500 行） | 39829 / 35827 | 高 |
| `cNe` | `KEEP_WARM_MS_DEFAULT = 30000` | 40329 / 36320 | 高 |
| `lNe` | `KEEP_WARM_MS_E2E = 1000` | 40330 / 36321 | 高 |
| `uNe` | `resolveKeepWarmMs` | 40331 / 36322 | 高 |
| `_w` | `ConversationDataLayer`（class） | 40334 / 36325 | 高 |
| `vw` | `dataLayerEntriesByKey` | 40390 / 36376 | 高 |
| `dNe` | `DATA_LAYER_KEEP_WARM_MS = 30000` | 40391 / 36377 | 高 |
| `fNe` | `dataLayerKey` | 40392 / 36378 | 高 |
| `yw` | `disposeDataLayerEntry` | 40396 / 36382 | 高 |
| `pNe` | `releaseDataLayerEntry` | 40400 / 36385 | 高 |
| `mNe` | `acquireConversationDataLayer` | 40411 / 36396 | 高 |

**合计：109 个符号逐字转录**（含 2 个 class、1 个 memo 根、14 个数值/字符串常量、9 个注册表/模块级状态）。

## 2. 边界裁决（含任务书修正）

1. **族起点修正（任务书要求记录）**：旧账曾把 `RMe`（旧 39107 / 今 39155）当作反馈中心起点；任务书修正为旧 37067（今 37115，`Hje`）。实测进一步前移：状态呈现 `Bje`/`Vje`（今 37093/37104，旧 37045/37056）紧跟 `yC` FeedbackStore（今 37040–37092）之后、为工单徽章专用，属本族——**真实族起点 = 今 37093**。产物已含 Bje/Vje。
2. **37040–37092（yC FeedbackStore）** → `stores-core.tsx` §3 已重建（旧 36992–37066），本批排除，按既有语义名引用。
3. **37139–37171（xC/SC/CC/Wje/wC）** → `stores-core.tsx` §3 已抽取（`FEEDBACK_CONTACT_KEY`/`feedbackStorage`/`readFeedbackContact`/`clearFeedbackContact`/`writeFeedbackContact`），本文件 declare 引用；**`TC`（37172）stores-core 未覆盖**，由本文件补齐转录。任务书范围清单中的 `SC/CC/Wje/wC` 因此只注记不转录。
4. **39299–39453（JC 起设置导航状态机）** → `Settings.tsx` §2 已抽取（`zcode-settings-section-intent` 等），本批只注记（产物 §13）。
5. **39458（lw）** → `PRODUCT_DOCS_URL` 属 TopBar 域，TopBar.tsx 已 declare；只注记。**39455（JMe）** 为 F07 可见性守卫，行段落在包络内，转录实现（WorkspaceShell.tsx 既有 declare 的消费方）。
6. **尾段 41856–41940（旧 41808–41892）定性修正**：任务书标为「RMe 块收尾导出」，实测为遥测 fact 助手 `uT/dT/fT/pT/fFe/pFe/mFe/mT`（有界去重集/网络调试状态构造/用量映射/超时归一）+ 监督体 `hT` 消费段，且 `services.tsx` 已逐字抽取（BoundedStringSet 2072 / 2115 / 2150 / 2171 / 2179 / 2193 / 2198 / 2203 / ConversationTelemetrySupervisor 2295）——按「已抽取段不重复转录」规则只注记（产物 §17）。
7. **40445–41855（旧 40397–41807）** → `StoresDeep.tsx` §H 遥测下沉 29 函数已逐行抽取，本批排除。
8. **H2/U2/N9/G4t/MEt/COt/P9** → `Modals.tsx` 已抽取（呈现层），本范围对 Dialog/DialogContent 等只做 declare 引用。
9. **39459–39460（uw/dw）**：行段属附件/品牌常量邻接区，`uw` 为 REBRAND-003+103 logo dataURI——转录至本文件 §14（脚本自源行正则注入，零转录漂移）；`lw`（39458）归 TopBar 的裁决见上。
10. **39461–40444 归属**：附件上传协议 + v4 会话运行时此前无实现转录（仅 services/ExtendedViews 接口级 declare），本文件成为其实现载体；若后续单立「会话运行时」模块，可整段平移（产物 §15/§16 自包含，仅依赖 §0 declare）。

## 3. 锚点回代对照（门禁 3，共 13 处，其中转录命中 10 处 ≥ 8）

回代规则：产物行把语义名换回混淆名后，与源行逐字比对。字符串常量内容零差异；引号风格归一（源用反引号模板、产物用双引号，系全项目既定口径，内容逐字）。

| # | 源行号 | 源文（逐字，截断显示） | 产物行号 | 产物文（对应） | 命中 |
|---|---|---|---|---|---|
| A1 | js 37115 | `function Hje(e, t) {` | 464 | `export function formatTicketStatus(status: string, formatMessage: FormatMessageFn): string {` | ✓ 签名/参数位 |
| A2 | js 37139 | `` var xC = `zcode.feedback.contact`; `` | 505–519 | §2 declare 引用 stores-core `FEEDBACK_CONTACT_KEY`；`TC` 转录 | ✓ 边界锚点 |
| A3 | js 37630 | `var eMe = 12;` | 1061 | `export const MODEL_OPTIONS_PREVIEW_LIMIT = 12;` | ✓ 值逐字 |
| A4 | js 38077 | `` `Agent 框架: nofy-agent`, `` | 1679 | `"Agent 框架: nofy-agent",` | ✓ 字符串逐字 |
| A5 | js 38089 | `` var gMe = `Nofy Agent`, // REBRAND-015+115 `` | 1692 | `const DEVICE_AGENT_PROVIDER = "Nofy Agent"; // REBRAND-015+115` | ✓ 字符串+行尾注释逐字 |
| A6 | js 39155 | `var RMe = (0, Q.memo)(function ({ feedbackService: e, platform: t }) {` | 2810 | `export const FeedbackCenter = React.memo(function FeedbackCenter({` | ✓ memo 根 |
| A7 | js 39299 | `` var JC = `zcode-settings-section-intent`, `` | 2988 | §13 边界注记（Settings.tsx 已抽取） | ✓ 边界锚点 |
| A8 | js 39513 | `` if (eNe(e, t) > bi.maxFrameBytes) throw Error(`proto.frameTooLarge`); `` | 3097 | `if (measureAttachmentFrameBytes(kind, payload) > protocolLimits.maxFrameBytes) throw Error("proto.frameTooLarge");` | ✓ 分支+错误串逐字 |
| A9 | js 39829 | `var sNe = class {` | 3633 | `export class ConversationSnapshotStore {` | ✓ class 头 |
| A10 | js 40334 | `var _w = class {` | 4148 | `export class ConversationDataLayer {` | ✓ class 头 |
| A11 | js 40348 | `` if (this.disposed) throw Error(`SessionDataLayer 已释放，不能再 acquire`); `` | 4162 | `if (this.disposed) throw Error("SessionDataLayer 已释放，不能再 acquire");` | ✓ 分支+中文错误串逐字 |
| A12 | js 41856 | `var uT = class {` | 4284 | §17 边界注记（services.tsx 已抽取） | ✓ 边界锚点 |
| A13 | jsx 35262 | `var RMe = (0, Q.memo)(function ({` | 2810 | 同 A6（jsx 孪生对照） | ✓ |

## 4. 验证记录（四项门禁）

| 门禁 | 命令 | 结果 |
|---|---|---|
| 1. esbuild 语法 | `web/node_modules/.bin/esbuild desktop/src/src-reconstructed/modules/FeedbackCenter.tsx --loader:.tsx=tsx --jsx=preserve` | **0 错 0 警告**（114.1kb，Done） |
| 2. tsc strict | `web/node_modules/.bin/tsc -p /tmp/tsconfig.FeedbackCenter.json`（strict/ES2022/lib DOM/moduleResolution Bundler/typeRoots→web/node_modules/@types/include 仅产物） | **0 错** |
| 3. 锚点回代 | §3 对照表 | **13 锚点（10 转录命中 + 3 边界）≥ 8** |
| 4. 报告完整 | 本文件（覆盖/裁决/验证/符号表/把握度/遗留） | ✓ |

附加抽验：
- 头表 109 条 js 行号全量脚本比对源 chunk：**0 失配**（修正 2 处邻接：`nMe` 37680→37679、`PC` 37681→37680；`QMe/$Me/eNe/pw/tNe` 五行按实测 39498/39503/39508/39512/39515 修正）。
- 头表全部 jsx 行号全量比对孪生：**0 失配**。
- `out/` 只读复验：`md5 desktop/src/out/renderer/assets/styles-CdEGpc2x.js` = `48d71d4874b0868d61fd35a328bf6ad5`（与开工基线一致）。

## 5. i18n 与存储键统计

- 源范围（今 37093–40444）唯一 `feedback.*` 键 **85 个**；产物直书 **84 个**，余 1 个 `feedback.contact`（即存储键 `zcode.feedback.contact`，xC）经 stores-core `FEEDBACK_CONTACT_KEY` 引用（裁决 3）。
- 任务书「feedback.* 25 处」为旧口径低估；实测以 85 为准（含 `feedback.status.*` 9 键、`feedback.featureRequest.*`、`feedback.detail.*`、`feedback.submit.*`、`feedback.tickets.*`、`feedback.background.*` 等子族）。
- 9 个状态键（`feedback.status.pendingReview/accepted/inDevelopment/completed/resolved/released/rejected/needInfo/closedByReply`）在 `Vje`（37104）中逐字保留。
- 存储键 `zcode.feedback.contact` 原键名保留（stores-core §3）。

## 6. 把握度分布

- **高（逐字核对）**：§1–§15 全部符号（109/109）。其中 `mw`/`sNe`/`_w` 三个大体量符号（合计约 1,100 源行）经分段孪生比对。
- **高-（依赖声明）**：§0 的 25 个 declare（Button/Dialog 族/Input/Textarea/toast/logger/intl/图标/服务接口），签名按调用点反推，与 Modals.tsx、services.tsx 既有声明对齐；若上游模块签名修订需同步。
- **中**：无。本批不存在接口级保留项。

## 7. 遗留问题

1. `services.tsx`/`ExtendedViews.tsx` 中对 `mw/_w/sNe/k0/u1` 的接口级 declare 与本文件实现并存；后续批次若做「声明-实现」合拢，应删除上游 declare 并改为从 FeedbackCenter（或拆分出的会话运行时模块）导入（裁决 10）。
2. `WorkspaceShell.tsx` 对 `zMe/BMe/JMe/lw/uw` 的 declare 同理：实现已在本文件 §12/§14 落地，合拢时改导入。
3. 尾段遥测域（41856–41940）归属横切 services；若 B5 计划要求反馈域自包含，可考虑把 `uT..mT` 从 services.tsx 迁出——本批按「已抽取不重复转录」不动。
4. `FadeScrollArea` 保留了源码的「useEffect 逗号表达式内联于 return」结构（逐字口径），仅补齐括号；如后续放宽逐字约束可提升为常规语句。
5. 旧账行号 +48 偏移仅在本区段之前成立；后续批次跨过 41940 之后区域需重新校验偏移是否仍为常数。
