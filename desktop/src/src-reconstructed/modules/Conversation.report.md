# Conversation 模块抽取报告（会话族 F03 · D8 Stage B）

- 输入：`/home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js`（213,695 行，**未修改**）
- 产物：
  - `/home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/modules/Conversation.tsx`（8,342 行）
  - `/home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/modules/ConversationOverlays.tsx`（2,149 行）
- 对照：`/home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx`（170,400 行，同一 chunk 的 pretty-print 版）
- 规格：`/home/none/grok-build/web/docs/zcode-uiux-spec.md` §6（会话视图）
- 族范围（MODULE-MAP F03）：js **94696–94966** + **99485–121668** + **122803–123121**，约 22,720 行（全图最大族）

---

## 0. 拆法说明

族体量 ~22.7k 行，按任务预案采用**两文件拆法**：

| 文件 | 内容 | 对应子族 |
|---|---|---|
| `Conversation.tsx` | 会话面板主干：R0、消息列表、Turn/ToolBlock/Markdown 渲染、轮导航、quick-find、queue/quota、编排器 PTt | Turn / ToolBlock / Markdown / Find / Composer 接线 / List / Pane |
| `ConversationOverlays.tsx` | 审批/问题内联覆盖层、通用交互对话框、captcha/provider 运行时头、订阅错误上报 | Overlays |

拆分依据：① 覆盖层（`pSt` 交互调度以下）自成闭环——输入是快照里的 `pendingInteractions[0]`，
输出是 `resolveInteraction/snoozeInteractionAutoResolution` 命令，与消息流渲染零耦合；
② 覆盖层引用工具视图族（审批卡内渲染待审批工具调用）是单向依赖，声明接口即可解耦；
③ 两文件各自可独立通过 tsc 严格检查。
单文件内部的组织：`Conversation.tsx` 按 §1 Collapsible 原语 → §2 Quota → §3 Queue → §4 ToolBlock →
§5 Turn → §6 TurnNavigator → §7 Find → §8 List → §9 Pane 九节分节，每节头部注明混淆名→语义名与 js/jsx 双行号。

行号口径与 TopBar 试点一致：所有范围以 `.js` 为准（闭区间），逐符号附 `.jsx` 对照行号；
`out/` 未做任何修改。

---

## 1. 抽取的组件清单（混淆名 → 语义名 → js 行 / jsx 行）

### 1.1 Conversation.tsx

#### [Pane] 面板与装配（§9）

| 混淆名 | 语义名 | js | jsx | 还原度 |
|---|---|---|---|---|
| `R0` | `ConversationPane` 会话面板根 | 119219–121283 | 101388–103090 | props/命令派发回调/最终 JSX 逐字；中段订阅接线归纳 |
| `PTt` | `ConversationOrchestrator` 编排器（v4 分屏装配） | 122803–123102 | 104572–104760 | 逐字（分屏 store 调用声明为接口） |
| `Ait`/`jit` | `PaneFloatingHeader` 面板浮动头 | 91755/91801 | 79344/79371 | 逐字 |
| `Ubt`/`Wbt` | `PluginIconProvider`/`PluginIconGate` | 115538/115559 | 98326/98347 | 逐字 |
| `k0` | `useSessionSnapshot`（useSyncExternalStore） | 118675 | 100929 | 逐字 |
| `TCt` | `CLOSED_SESSION_STATE` | — | 100917 | 逐字 |
| `$Ct` | `EMPTY_SUBAGENT_DIRECTORY` | — | 101340 | 逐字 |
| `$wt`/`tTt`/`s2`/`A2` | SplitPaneHost/SplitDivider/分屏 store/路由 store | F07 段 | 103806/103917/103518/104365 | 接口级（属 F07） |

#### [List] 虚拟滚动消息列表（§8）

| 混淆名 | 语义名 | js | jsx | 还原度 |
|---|---|---|---|---|
| `Rbt`/`zbt` | `ConversationMessageList`（memo） | 114627/115525 | 97662/98313 | 结构与关键逻辑逐字；滚动意图状态机按调用面归纳 |
| `Fbt` | `ScrollToBottomButton` | 114596 | 97637 | 逐字 |
| `Ibt` | `ScrollMemoryBridge`（class 组件） | 114609 | 97644 | 逐字 |
| `Lyt`/`Iyt` | `UnitSizeCache`（LRU 高度缓存，上限 4000） | 113965 | 97112 | 逐字 |
| `Lbt`/`R1`/`Nbt`/`Pbt` | 行高测量/单元键/微任务兜底/可编辑目标判定 | 114620/114624/—/— | 97655/97659/97627/97634 | 逐字 |
| `Fyt`/`ayt` | buildRenderUnits/splitVirtualizedUnits（行窗口 → 轮单元） | 113940/113620 | 97087/96770 | 接口级 |
| `Ryt`…`Xyt` | 滚动跟随助手 14 个（贴底判定/意图/补偿） | — | 97137–97185 | 接口级（纯函数群） |
| `Ebt`…`Mbt` | 列表常量（overscan 8 / 1s tick / 96px 渐隐 / 1200ms 意图窗…） | — | 97620 | 逐字 |

#### [Turn] 轮分段渲染（§5）

| 混淆名 | 语义名 | js | jsx | 还原度 |
|---|---|---|---|---|
| `Vvt`/`Hvt` | `TurnSection`（memo；`<section data-turn-id>` pt-14） | 113156/113295 | 96423/96489 | 逐字 |
| `Rvt` | `AssistantTurnBody`（工作段 + 重试槽） | 112998 | 96317 | 逐字 |
| `Bvt` | `BackgroundResultTurnBody`（后台结果轮） | 113089 | 96379 | 逐字 |
| `Lvt` | `WorkSegmentView`（历史折叠段） | 112924 | 96263 | 逐字 |
| `Ivt` | `WorkSegmentHeader`（chat.history.workingFor/workedFor/worked） | 112890 | 96238 | 逐字 |
| `C1` | `RowSegmentList` | 112817 | 96171 | 逐字 |
| `Evt`/`Dvt`/`b1` | `RowRenderer`（7 种行分派） | 112666/112711/112712 | 96043/96098/96099 | 逐字 |
| `pvt` | `UserQueryRow`（气泡 + 行内编辑 Composer + 回退文件按钮） | 112010 | 95596 | 逐字 |
| `hvt` | `AssistantMessageRow`（cj markdown + 预览卡 + 动作条） | 112357 | 95832 | 逐字 |
| `mvt` | `AssistantMessageActions`（复制/赞踩/fork/时间 + 遥测） | 112234 | 95726 | 逐字 |
| `gvt` | `ReasoningRow` | — | 95895 | 逐字 |
| `_vt` | `TurnHeaderRow`（`turn · origin · state`） | — | 95917 | 逐字 |
| `Svt`/`Cvt` | `TimelineMarker`/`TimelineMarkerView`（compact/forkNotice/modelChange/goalVerify） | 112473/112528 | 95923/95939 | 逐字 |
| `wvt` | `ToolCallRow` | 112629 | 96025 | 逐字 |
| `Tvt` | `SubagentRow` | 112654 | 96090 | 逐字 |
| `jvt` | `AgentToolCallRow` | 112799 | 96165 | 逐字 |
| `S_t` | `TurnFileChangesSummary`（chat.changeSummary.* + 回退对话框接线） | 110813 | 94679 | 逐字 |
| `b_t` | `FileRewindDialog` | 110632 | 94590 | 接口级 |
| `v_t`/`__t`/`p1`/`yg` | FileOpenWithMenu/预览源构建/打开文件变更/相对路径 | 110379/—/—/— | 94447/94426/94657/— | 接口级 |
| `k_t`/`A_t`/`O_t` | `PreviewCardList`/单卡/可见卡钩子 | 111193/111233/111161 | 94925/94950/94877 | 钩子逐字，卡片接口级 |
| `Mvt`/`Nvt`/`Pvt`/`Fvt`/`fgt` | 自动化卡收集/解析/列表 | — | 96194–96238/93676 | 接口级 |
| `Ovt` | `buildAssistantCopyText`（含 ExitPlanMode 计划合并） | — | 96114 | 逐字 |
| `kvt`/`x1` | toApiRetryViewModel/`ApiRetryLoadingSlot` | — | 96127/96138 | 逐字 |
| `Avt`/`S1` | formatWorkDuration/joinDurationUnit | — | 96155/96149 | 逐字 |
| `zvt` | resolveBackgroundResultTitle | — | 96374 | 逐字 |
| `y1` | `RowAnchor`（data-row-id 锚点） | 111857 | 95440 | 逐字 |
| `lvt` | `CopyRowButton` | 111865 | 95447 | 逐字 |
| `rvt`/`tvt`/`nvt` | `UserInputRichText`/部件视图/插件图标 | 111783/111712/111769 | 95375/95335/95366 | 逐字 |
| `G_t`/`U_t`/`W_t` | `UserInputCollapsibleText`（120px 折叠） | 111579 | 95219/95213/95216 | 逐字 |
| `fvt`/`dvt` | `AttachmentChipList`（ObjectURL 竞态防护） | 111898 | 95476/95473 | 逐字 |
| `m1`/`X_t`/`Z_t`/`$_t`/`evt`/`h1` | /goal /compact 命令解析与芯片类名 | 111673 | 95273–95332 | 逐字 |
| `K_t`/`J_t` | `PluginIconContext`/usePluginIcons | 111667/111669 | 95267/95269 | 逐字 |
| `u1` | normalizeToolCallNode | 110158 | 94198 | 接口级 |
| `m_t`/`g_t` | buildRenderSegments/SubagentGroupRow | 110278/110333 | 94334/94403 | 接口级 |
| `Wgt`/`Bgt` | isApiRetryEligible/buildAssistantPreviewCards | — | 94075/94019 | 接口级 |
| `cvt`/`uvt` | formatRowTimestamp/normalizeRowFeedback | — | 95423/95469 | 接口级 |

#### [Tool] 工具折叠块（§4）

| 混淆名 | 语义名 | js | jsx | 还原度 |
|---|---|---|---|---|
| `put`/`lQ` | `ToolLayout`（memo，displayName=`ToolLayout`） | 100214/100416 | 86470/86604 | 逐字 |
| `lut`/`sut`/`cut`/`aut` | ToolLayout 头部/前段/后段/动画文本 | 100151/100095/100122/100000 | 86444/86415/86425/86327 | 逐字（动画件归纳） |
| `cQ`/`uut`/`dut`/`fut` | 展开态内存 Map/300ms 收起延迟/内容类名 | — | 86466 | 逐字 |
| `Ght`/`K$` | `ToolCallBlock`（memo，displayName=`ToolCallBlock`） | 109105/109241 | 93180/93274 | 逐字 |
| `Wht` | resolveToolCallView（16 家族分派） | 109066 | 93141 | 逐字 |
| `G$`/`Rht`/`zht`/`Bht`/`Vht`/`Hht` | 流式入场动画缓存（800 上限/1s） | — | 93117 | 逐字 |
| `ept` | `ShellToolView`（bash：`$ 命令` + 输出；代表性全量还原） | 105266 | 90506 | 逐字 |
| 其余 15 视图 | opt/Gft/Spt/upt/Mht/Pht/Vpt/Dht/Sht/mht/eht/ght/omt/Nmt/Wmt/Qpt | 104622–109105 | 90046–93141 | 登记表（§4.6），接口级 |
| `z_t`/`B_t`/`V_t` | `Reasoning`/`ReasoningTrigger`/`ReasoningContent`（displayName 逐字） | 111329/111405/111471 | 95033/95083/95122 | 逐字 |
| `j_t`/`M_t` | ReasoningContext/useReasoning | — | 95007 | 逐字 |
| `zlt`/`nQ`/`rQ` | 状态归一/unwrapToolUseError/extractToolErrorText | 99513/—/99542 | 85879/85900/85908 | 错误提取主干逐字 |
| `iQ`/`Wlt`/`Glt` | resolveInlinePreview/显示模型规则表/resolveToolDisplayModel | 99582/99593/99696 | 85951/85968/86085 | 接口级 |
| `og`/`_g`/`qZ` | classifyToolCall/文件摘要抽取/计划 markdown | 23084/20269/98044 | 19826/—/85024 | 接口级（横切） |

#### [Nav] 轮导航（§6）

| 混淆名 | 语义名 | js | jsx | 还原度 |
|---|---|---|---|---|
| `ryt`/`iyt` | `TurnNavigator`（memo；左侧刻度条 + HoverCard 预览） | 113443/113619 | 96660/96769 | 逐字 |
| `Uvt`/`Wvt` | shouldHydrateFullHistory（≥864px）/重试退避 250ms/1s | 113296/113299 | 96490/96493 | 逐字 |
| `qvt`/`Jvt`/`Yvt`/`Xvt`/`Zvt` | 预览分段/截断/构建/导航项 | 113304–113346 | 96498–96534 | 逐字 |
| `Qvt`/`$vt`/`eyt`/`tyt`/`nyt`/`w1` | 视口定位/行定位/视觉档位/降动效侦听 | 113376–113431 | 96567–96651 | 逐字 |

#### [Find] 会话内查找与引用选择（§7）

| 混淆名 | 语义名 | js | jsx | 还原度 |
|---|---|---|---|---|
| `O1`/`k1`/`A1`/`Zyt`/`Qyt` | CSS Custom Highlight 名称与 ::highlight 样式 | — | 97188 | 逐字 |
| `$yt`/`j1`/`M1`/`ebt`/`tbt`/`nbt`/`N1` | 样式注入/注册表/Range 收集 | — | 97206–97253 | 逐字 |
| `rbt`/`ibt`/`abt`/`P1`/`F1` | applyFindHighlights/搜索结果高亮/滚入视野/清除 | — | 97259–97294 | 逐字 |
| `I1`/`obt`/`sbt`/`cbt`/`lbt`/`ubt`/`dbt`/`fbt`/`pbt`/`mbt` | 查找索引构建与匹配导航 | — | 97297–97369 | 逐字 |
| `vbt` | `useConversationFind`（{current}/{total} 回报、自动补拉、3s 搜索高亮） | — | 97388 | 逐字 |
| `Tbt` | `ConversationSelectionTooltip`（加入任务/侧栏提问） | — | 97517 | 逐字 |
| `ybt`/`bbt`/`xbt`/`Sbt`/`Cbt`/`wbt` | 选区排除/资格判定（8000 字符上限） | — | 97503–97514 | 逐字 |

#### [Queue/Quota]（§2–§3）

| 混淆名 | 语义名 | js | jsx | 还原度 |
|---|---|---|---|---|
| `ust`/`dst` | `QueuePanel`（memo；dnd-kit 排序 + 暂停横幅） | 94696/94801 | 82817/82869 | 逐字 |
| `lst` | `QueueItemRow`（drag/runNow/sendNow/edit/remove） | 94573 | 82753 | 逐字 |
| `sst` | computeQueueReorderMove | 94545 | 82736 | 逐字 |
| `fst`/`pst`/`mst`/`hst`/`gst` | quota 文案映射/格式化/`SessionQuotaBanner` | 94828 附近 | 82871–82926 | 逐字 |
| `_st` | `PendingCommandBanner` | 94897 | 82927 | 逐字 |
| `vst` | formatLongRunningElapsed | — | ~82972 | 逐字 |
| `kZ`/`AZ`/`jZ` | Collapsible 原语（Radix 封装，动画类名逐字） | — | 82955–82970 | 逐字 |

### 1.2 ConversationOverlays.tsx

#### [Permission] 审批内联覆盖层（§1）

| 混淆名 | 语义名 | js | jsx | 还原度 |
|---|---|---|---|---|
| `Hxt` | `PermissionApprovalOverlay`（1/2/3 热键 + 方向键导航） | 116960 | 99392 | 逐字 |
| `vxt`/`yxt`/`Z1`/`bxt`/`xxt`/`Sxt` | 选项 kind 同义词/分类/自定义判定/排序 | 116704–116749 | 99162–99199 | 逐字 |
| `Cxt`/`wxt`/`Txt`/`Ext`/`Dxt`/`Oxt` | 图标/160 字符截断/bash 前缀规则列表 | 116758–116781 | 99210–99231 | 逐字 |
| `kxt`/`Axt`/`jxt`/`Mxt`/`Nxt` | 选项文案 i18n（含 codex/glm 供应商映射） | 116802–116828 | 99236–99266 | 逐字 |
| `Q1`/`$1`/`Pxt`/`Fxt`/`Ixt` | 理由/工具名提取 | 116842–116860 | 99280–99298 | 逐字 |
| `Lxt`/`Rxt`/`zxt`/`Bxt`/`Vxt` | 审批卡工具预览分派（edit 收起/其余强制展开）/MCP 行 | 116863–116929 | 99301–99373 | 逐字 |
| `Xpt`/`Hpt` | 切模式请求判定/平台提示 | 106604/106405 | 91469/91360 | 接口级 |
| `nxt` | `InteractionOriginBadge`（子代理来源徽章） | 115916 | 98675 | 逐字 |
| `Vte` | buildPermissionRequestViewModel | 跨 chunk（src-HCld2afU 的 l 导出） | — | 接口级 |

#### [Elicitation] 问题内联覆盖层（§2）

| 混淆名 | 语义名 | js | jsx | 还原度 |
|---|---|---|---|---|
| `_xt` | `ElicitationDialog`（多题问卷 + plan 审批变体） | 116088 | 98841 | 逐字 |
| `gxt` | `ElicitationDialogKeyed`（按 requestId 重挂载） | 116085 | 98838 | 逐字 |
| `q1`/`J1`/`rxt`/`ixt`/`axt` | 自动结束倒计时（60s 心跳/approve 值/隐藏页暂停） | 115930–115945 | 98698–98713 | 钩子逐字 |
| `oxt` | mapElicitationKeyDown（IME 守卫） | 115972 | 98730 | 逐字 |
| `sxt`/`cxt`/`lxt` | 问题归一化/isPlainObject/isPlanApprovalRequest | 115985–116012 | 98733–98758 | 逐字 |
| `uxt`/`dxt`/`fxt`/`pxt`/`Y1`/`mxt`/`hxt`/`X1` | 草稿/焦点/答案载荷/推进 | 116016–116082 | 98762–98835 | 逐字 |

#### [Interaction] 交互调度（§3）

| 混淆名 | 语义名 | js | jsx | 还原度 |
|---|---|---|---|---|
| `pSt` | `ConversationInteractionsOverlay`（permission/问卷/通用三分派） | 117551 | 99899 | 逐字 |
| `cSt` | `GenericInteractionDialog`（fixed 遮罩兜底） | 117469 | 99855 | 逐字 |
| `rSt`/`iSt`/`aSt`/`oSt`/`sSt` | 规则字段/应答构建/三种请求模型 | 117400–117449 | 99762–99825 | 逐字 |
| `nSt` | snoozeInteractionAutoResolution | 117366 | ~99705 | 逐字 |
| `fSt`/`lSt`/`uSt`/`dSt` | snooze 账本/快照定位/覆盖/草稿键 | 117527–117536 | 99875–99884 | 逐字 |
| `eSt`/`tSt` | 交互通知 toast（工作区级/快照级） | 117283/117346 | 99619/99703 | 接口级 |

#### [Captcha] provider 运行时头（§4）

| 混淆名 | 语义名 | js | jsx | 还原度 |
|---|---|---|---|---|
| `vCt` | `RuntimeAuthHeadersController`（渲染 null，仅订阅事件） | 118608 | 100853 | 逐字 |
| `mSt`/`CSt`/`FSt`/`RSt`/`XSt` | Aliyun 脚本 URL/容器 id/头名/存储键/失败码 | 117706 | 100034–100551 | 常量逐字 |
| `ASt` | AliyunCaptchaWidget | 117919 | 100205 | 接口级 |
| `b0`/`aCt`/`fCt`/`dCt` | captcha provider 判定/恢复头/刷新/恢复钩子 | 118292–118412 | 100548–100659 | 接口级 |
| `hCt`/`gCt`/`_Ct`/`O0` | 请求键/单次处理/在途合并 | 118512–118572 | 100763–100800 | 键逐字，流程接口级 |

#### [SessionError]（§5）

| 混淆名 | 语义名 | js | jsx | 还原度 |
|---|---|---|---|---|
| `yCt`/`bCt`/`xCt`/`SCt`/`CCt` | 订阅错误面常量 + fault 键解析 | 118641–118643 | 100891–100895 | 逐字 |
| `wCt` | `useSessionSubscriptionErrorReporter`（去重上报） | 118647 | 100899 | 逐字 |

---

## 2. 边界判定依据

1. **顶层声明定界**：压缩版每语句一行，`function X(` / `var X = (0, Q.memo)` 起，至相邻顶层声明止；
   919 个顶层声明在族范围内全量索引（jsx 85900–104700）。
2. **displayName 锚点**：`lQ.displayName='ToolLayout'`（js 100417）、`K$.displayName='ToolCallBlock'`（109242）、
   `z_t/B_t/V_t.displayName='Reasoning'/'ReasoningTrigger'/'ReasoningContent'`（111569–111571）——
   三个关键组件的语义名是源码自证，非推断。
3. **i18n 包络**：`chat.toolCall.*` 165 处（jsx 86223–93274 主体）、`chat.permission.*` 19 处（jsx 99106–99504）、
   `chat.elicitation.*`（jsx 98841–99161）、`chat.queue.*` 20 处、`chat.quota.*` 16 处、
   `chat.changeSummary.*`（jsx 94679–94833）、`chat.turnNavigator.*`（jsx 96660–96769）、
   `conversationFind` 常量簇（jsx 97188）——各子族边界与 i18n 包络完全吻合。
4. **闭包追踪**：从 R0 的 JSX 出发递归收集局部符号，终点三类：本 chunk 顶层定义（继续追）/
   文件头 import 块别名（记外部依赖）/ 叶子接口（登记行号）。
5. **vendored 块排除**：族范围含 shiki 核心（js 100520–104621 / jsx 86683–90045，~4,100 行）与
   dnd-kit 库体（js 91811–94695），按 MODULE-MAP §2.7 以依赖整体替换，不逐行还原；
   应用层仅保留调用接口（useSortable/DndContext/SortableContext 声明）。
6. **F07 邻界**：jsx 103091–103517（owt…jwt，`zcode-v4-pane-layout:v2` 等分屏助手）按行范围属 F03，
   语义属 F07，本次仅以接口引用（`useSplitLayoutStore`/`flattenPaneTree` 等），留待 F07 抽取。

---

## 3. 与 zcode-uiux-spec.md §6 的交叉验证

| 规格断言 | 代码证据 | 结论 |
|---|---|---|
| §6 turn 以 **turnHeader** 分段，kinds: `userInput \| backgroundResult \| goalContinuation \| editRerun` | 行模型 `TurnHeaderRowModel.origin` 四值；`_vt` 渲染 `turn · origin · state`；行渲染器 `case 'turnHeader'`（jsx 96080）；proto schema `kind: Fi('turnHeader')`（js ~30020） | ✅ |
| §6 **每轮头部动作** schema `actions`: canFork/canEdit/canRetry/canRewindFiles，editDisposition: rewind\|fork；重试/编辑/回退文件是**轮级菜单**不是气泡按钮 | `RowActions` 四字段；`TurnSection` 内：canRewindFiles → `rewindAvailability`（noFiles/reverted/running/unavailable 四态）→ `S_t` 文件变更卡「回退」按钮；canEdit → `pvt` 行内编辑 + 「重置会话与文件」（rewind 变体）；canFork/canRetry 仅挂最新 assistant 行（`u.latest && canForkLatestAssistant`）；命令层 `forkAssistant/editUserQuery(workspaceMode: preserve\|rewind)/retryTurn`（R0 派发回调，对应 Zke 白名单 js 31547） | ✅ |
| §6 工具行：`▶ ✓ 名称: 摘要` 折叠块（bash 显示命令前缀） | `ToolLayout`：收起态 = 图标+种类标签+主/次文本+状态（`lut/sut/cut`），展开箭头悬停淡入（`group-hover/tool-summary:opacity-100`）；`ept` shell 视图 secondaryText = 命令单行截断（`Qft`），展开区 `$ {executionCommand}` + 输出；状态文案 `chat.toolCall.execute.running/ran`、失败状态可复制（`chat.toolCall.copyError*`） | ✅ |
| §6 思考/摘要折叠 | `z_t/B_t/V_t`（displayName=Reasoning*）：流式「正在思考」渐变动画字、结束「已思考 · N 秒」（`chat.reasoning.*`）、autoCollapseKey 变化自动收起、max-h-60 贴底跟随滚动区 | ✅ |
| §6 markdown 富文本（代码块带语言头+复制） | `hvt` 经 `cj` MarkdownRenderer 渲染（F19 族，接口引用），透传 streaming/theme/codePreviewSettings/onOpenCodeViewer/onOpenFileLink/onOpenExternalUrl | ✅（渲染器本体属 F19） |
| §6 底部 composer 同 home | R0 的 `jr` = `git`（hit，F02 Home 草稿头组件）挂载于底部 dock，draft 态居中、会话态贴底；接口级引用 | ✅（本体属 F02/F08） |
| §6 quick pick find（Ctrl+F 类）：scope 切换 消息/文件变更，{current}/{total} 导航 | 消息流侧完整还原：`useConversationFind` 回报 `{matchCount, activeIndex}`（查找条 {current}/{total} 数据源）、`::highlight` 双层高亮（普通 #fde68a / 激活 #facc15）、自动补拉更早行直至命中、搜索结果 3s 高亮；查找条本体与「文件变更」scope 在 WorkspaceShell 层（F07，行号见 `conversationFind` 簇 jsx 150807 附近） | ✅（消息流侧；输入条属 F07） |
| §6 右 aside 摘要面板（Flt） | R0 装配 `Ilt`（memo Flt，TopBar 族已抽取），本次仅接口引用；mini/panel/auto 三态经 `Uct/Wct` 门控 | ✅（已在 TopBar 报告细化） |

规格无冲突项。**一处细化**：§6 未提及的「轮导航刻度条」（`iyt` TurnNavigator，≥864px 显示，
悬停预览用户提问+assistant 摘要）与「选区引用浮层」（`Tbt`，加入任务/侧栏提问，8000 字符上限）
是会话视图的实有能力，建议回写规格 §6。

---

## 4. 外部依赖清单（跨 chunk）

| # | chunk | 提供的符号（原局部名） |
|---|---|---|
| 1 | `react-BQLj9xdT.js` + `jsx-runtime-B5yMD3-t.js` | React（Q）、jsx 运行时（$） |
| 2 | `react-dom-BlRPXJso.js` | ReactDOM（io；选区浮层 createPortal） |
| 3 | `utils-CEEH0K_K.js` | cn() 类名合并（Z） |
| 4 | `button-laUijeDG.js` | Button（X，forwardRef）、chevron-right（wa）、chevron-left（Ea） |
| 5 | `IntlProvider-C321H7m8.js` | useIntlContext（G）→ {intl, locale} |
| 6 | `imeComposition-DEYFkwWm.js` | toast（m=_）、Input（P=y）、spinner（M=w）、IME 组词守卫（A=t）、usePlatformService（l=M） |
| 7 | `usageStatsUiParts-CiR7YEhh.js` | Tooltip（Ia=u）、Popover root/anchor/trigger/content（Na/Oa/Ma/ka=p/d/m/f） |
| 8 | `logger-PFDwl5Yq.js` | logger（J） |
| 9 | `skillStore-BmeKHDBI.js` | useTaskStore（xe=h，elicitation 草稿持久化）、zustand create（Ae=q）、任务作用域选择器（te=I / W=V）、草稿写入群（Le=x 等） |
| 10 | `src-HCld2afU.js` | ~400 符号：qr() testid 模板（Xa）、testid 常量群、Ao 设置选择器、**Vte=buildPermissionRequestViewModel（l 导出）**、DesktopCommand、环境常量 |
| 11 | `esm-BY6T6pIH.js` | useVirtualizer（to；@tanstack/react-virtual） |
| 12 | `dist-DJJArJ7D.js` | useControllableState（fa=p；Reasoning 受控态） |
| 13 | 本 chunk vendored | dnd-kit（js 91811–94695：_Z/EZ/TZ/KX/aZ/UX/WX/DZ/BX）、Radix Collapsible/HoverCard 底层、shiki 核心（100520–104621，仅被工具展开区间接使用） |
| 14 | 本 chunk 横切 | 命令队列运行时（js 32246–36438：OS 命令工厂、Zke 命令白名单、proto 帧）、K1 待恢复命令账本（115710）、VS/HS 交互通知登记（32468/32498）、工具分类 og（23084）、Markdown 渲染器 cj（F19）、Flt 摘要栏（TopBar 族）、hit/Sit（F02）、ZV Composer（F08）、kit off-peak 横幅（F15） |

两文件头部注释按「符号 → chunk → 导出字母 → 行号」完整登记。

---

## 5. 把握度评估

| 部分 | 把握度 | 依据 |
|---|---|---|
| ToolLayout/ToolCallBlock/Reasoning/ShellToolView、QueuePanel/QueueItemRow、QuotaBanner、TurnSection 全链（含工作段/后台结果轮/文件变更卡）、RowRenderer 与 7 种行组件、UserQueryRow/AssistantMessageRow/动作条、TurnNavigator、useConversationFind/SelectionTooltip、PermissionApprovalOverlay/ElicitationDialog/GenericInteractionDialog/ConversationInteractionsOverlay、PaneFloatingHeader/RuntimeAuthHeadersController | **高（逐字转录）** | 直接从压缩源码逐行还原；类名、i18n key、data-* 属性、键盘处理、常量（800/1000/120/220/250/1200/3000/4000/864/8000…）未做改动；三个 displayName 自证 |
| R0 的 props 表、命令派发回调（fork/edit/retry/feedback/queue 六件/stop/goal 控制）、最终渲染 JSX；PTt 编排器全量 | **高** | 逐字还原；仅订阅/模型选择中段（jsx 101480–102150）以注释归纳 |
| Rbt 消息列表 | **中高** | 结构/挂载/虚拟化/查找接线/预取/目录补齐逐字；滚动意图状态机的 14 个纯函数助手按调用面声明（行为由注释说明） |
| 15 个工具视图（除 shell）、FileRewindDialog/FileOpenWithMenu、预览卡单项、自动化卡、captcha 部件、交互通知 toast | **中（接口级）** | 体量大且与主干弱耦合，保留 props 接口 + 混淆名/行号登记，可按需补全 |
| 行模型/快照/命令 ACK 的 TS 类型 | **中高（推断）** | 由解构用法与 proto 字段归纳；真实 zod schema 在命令队列运行时（js 32246–36438），字段名一致但可选性或有细微出入 |
| 跨 chunk 符号归属 | **高** | 文件头 336–966 行 import 块逐个别名核对（含 Vte 属 src-HCld2afU 的确认） |

---

## 6. 验证记录

- `esbuild Conversation.tsx ConversationOverlays.tsx --loader:.tsx=tsx --jsx=preserve`：**0 错误**
  （输出 211.1kb + 58.9kb，解析通过）。
- `tsc --noEmit`（strict，ES2022 + DOM，jsx=react-jsx，@types/react 取自
  `/home/none/grok-build/web/node_modules`，验证于临时副本 /tmp/conv-verify）：**0 错误**。
- `out/` 目录未做任何修改（只读访问）。

## 7. 后续建议

1. §5 标注「接口级」的叶子（15 个工具视图、FileRewindDialog、预览卡单项、captcha 部件）
   可作第三批抽取，方法同本次。
2. 建议回写规格 §6：轮导航刻度条（iyt）与选区引用浮层（Tbt）两项实有能力。
3. F07 抽取时接管本文件声明的分屏接口（useSplitLayoutStore/flattenPaneTree/SplitPaneHost/SplitDivider，
   jsx 103091–103517 + 103740–103975）。
4. `chat.queue.editDraftConflict` 的完整撤回编辑流程（R0 的 Nn 回调）涉及 composer 草稿恢复握手，
   建议与 F08 Composer 族抽取时合并补全。
