# B4 批次报告 —— Sidebar 族 / Conversation 族 接口级叶子展开（解混淆重建）

- 输入：`/home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js`（213,695 行，**未修改**，只读访问）
- 对照：`/home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx`（170,400 行，pretty-print 版）
- 产物：
  - `/home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/modules/SidebarLeaves.tsx`（4,271 行）
  - `/home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/modules/ConversationLeaves.tsx`（4,193 行）
- 登记来源：`Sidebar.report.md` §2「接口级（★）保留清单」、`Conversation.report.md` §5「中（接口级）」
- 标样：同目录 `TopBar.tsx`（头注映射表 + §0 外部依赖声明 + 尾符号表 的格式与口径）
- 行号口径：与 TopBar/Sidebar/Conversation 报告一致——**js 行（输入文件）/ jsx 行（对照文件）** 双行号；jsx 行经逐符号核对。

---

## A. Sidebar 族叶子（SidebarLeaves.tsx）

### A.1 叶子清单（混淆 → 语义 → js 行 / jsx 行）

| 混淆名 | 语义名 | js 行 | jsx 行 | 展开方式 | 把握度 |
|---|---|---|---|---|---|
| `VFt` | `useWorkspaceTaskGroups` | 144427 | 120229 | 全量逐行（分片抓取/乐观叠加/动态事件订阅/重试签名状态机） | 高 |
| `W6` | `workspaceLoadingFlags` | 144363 | 120160 | 逐字 | 高 |
| `FFt` | `readVisibleLimit` | 144351 | 120150 | 逐字 | 高 |
| `uzt` | `useGroupedTaskView` | 153205 | 126735 | 全量逐行（加载缓存/草稿提升落盘/创建·重命名·改色·解散·应用顺序 六操作乐观回滚） | 高 |
| `KRt` | `sortTasksByGroupOrder` | — | 126406 | 逐字 | 高 |
| `qRt` | `buildGroupedViewFromStructure` | 152903 区 | 126428 | 逐字（pinned/archived/deleted 过滤 + 成员序 + 顶层序） | 高 |
| `JRt` | `applyDraftPromotions` | — | 126470 | 逐字 | 高 |
| `YRt` | `findTaskInViewByKey` | — | 126504 | 逐字 | 高 |
| `XRt` | `isTaskFirstInGroup` | — | 126514 | 逐字 | 高 |
| `ZRt` | `normalizeWorkspaceScopes` | — | 126518 | 逐字 | 高 |
| `j8` | `collectViewWorkspaceScopes` | — | 126525 | 逐字 | 高 |
| `QRt` | `composeOptimisticOverlay` | 153040 区 | 126543 | 逐字（任务覆盖/缺失可见前置/组前置/孤儿回退顶层） | 高 |
| `$Rt` | `collectViewTaskKeys` | — | 126621 | 逐字 | 高 |
| `tzt` | `isGroupedViewReady` | — | 126635 | 逐字 | 高 |
| `nzt` | `GroupedViewLoadCache`（class） | — | 126641 | 逐字（代际+在途合并+completed 记忆+invalidate） | 高 |
| `rzt` | `prependCreatedGroup` | — | 126669 | 逐字 | 高 |
| `izt` | `resolveVisibleMissingTaskKeys` | — | 126679 | 逐字 | 高 |
| `azt`/`ozt` | `viewNodeOrderKey`/`viewNodesShallowEqual` | — | 126690/126693 | 逐字 | 高 |
| `szt` | `mergeGroupedViewPreservingIdentity` | — | 126696 | 逐字 | 高 |
| `czt` | `toTopLevelNodeRef` | — | 126714 | 逐字 | 高 |
| `lzt` | `serializeGroupedViewOrder` | — | 126721 | 逐字 | 高 |
| `Cx` | `fetchTaskIndex` | 29752 | 27072 | 接口级声明（依赖 _x/vx/gx/yx/bx/xx/Sx/xOe/bOe 横切助手群） | 中 |
| `mRt` | `useSidebarUsageState` | 150255 | 124505 | 全量逐行（域解析/团队·个人权益/升级目标/plan 徽章）；F12 域钩子（JM/xn/qq/hX/q/Uq/dr/TY/pX/Mrt/$j/rM/Oq/PCt）按接口声明 | 高（骨架）/中（F12 接线） |
| `ABt` | `BeamBorderAnimation` | 157550 | 131107 | 全量逐行（forwardRef + useId + 首子元素圆角 MutationObserver + fade-in/out 状态机 + --beam-strength） | 高 |
| `OBt` | `useSystemThemePreference` | — | 131093 | 逐字 | 高 |
| `kBt` | `resolveBeamTheme` | — | 131104 | 逐字 | 高 |
| `wBt` | `generateBeamCss`（尺寸分派） | — | 130367 | 逐字 | 高 |
| `TBt` | `generateBeamCssSm` | 156793 区 | 130373 | CSS 模板逐字（conic 行波 + 单行波内部遮罩 + hue-shift） | 高 |
| `EBt` | `generateBeamCssMd` | — | 130593 | CSS 模板逐字（内部遮罩=行波+28px 边缘渐隐；内阴影 9px） | 高 |
| `DBt` | `generateBeamCssLine` | — | 130825 | CSS 模板逐字（travel/edge-fade/breathe/spike/spike2 七动画 + bloom 独立 hue-shift） | 高 |
| `fBt`/`pBt` | `smBorderGradients`/`smInnerGradients` | — | 129454/129458 | 逐字 | 高 |
| `mBt`/`hBt` | `mdBorderGradients`/`mdInnerGradients` | — | 129462/129466 | 逐字（hBt 的 0.9 缩放 + alpha 注入逻辑保留） | 高 |
| `gBt` | `resolveSpikePalette` | — | 129475 | 逐字 | 高 |
| `H8` | `withAlpha` | — | 129920 | 逐字 | 高 |
| `vBt` | `lineStrokeGradients` | — | 129929 | 逐字 | 高 |
| `bBt` | `lineInnerGradients` | — | 130159 | 逐字 | 高 |
| `SBt` | `lineBloomGradients` | — | 130327 | 逐字（彩色 9 段尖峰串 dark/light 双变体） | 高 |
| `CBt` | `lineBloomMonoGradients` | — | 130349 | 逐字 | 高 |
| `uBt` | `BEAM_SIZE_PRESETS` | — | 128919 | 数据逐字 | 高 |
| `B8` | `BEAM_THEME_PARAMS` | — | 128935 | 数据逐字 | 高 |
| `V8` | `MD_BEAM_PALETTES` | — | 128990 | 数据逐字（4 变体×border/spike/spikeLt） | 高 |
| `dBt` | `SM_BEAM_PALETTES` | — | 129180 | 数据逐字（4 变体×border/inner） | 高 |
| `_Bt` | `LINE_STROKE_PALETTES` | — | 129479 | 数据逐字（4 变体×2 主题×9 点） | 高 |
| `yBt` | `LINE_INNER_PALETTES` | — | 129940 | 数据逐字 | 高 |
| `xBt` | `LINE_SPIKE_PALETTES` | — | 130168 | 数据逐字 | 高 |
| `lLt` | `ArchivedTasksSection` | 146823 | 122315 | 全量逐行（ZS 查询/20 条折叠/取消归档乐观 Uo/删除确认+清理/移动端活动标记） | 高 |
| `mLt` | `WebRemoteTaskListSection` | 147286 | 122543 | 全量逐行（空索引 3 次重试/订阅 onWorkspaceListUpdated/pinned+分组+timeline+archived 四视图/置顶·归档确认·删除 三动作） | 高 |
| `uLt` | `WebRemoteTaskRow` | — | 122425 | 全量逐行（悬停动作/未读点/切换中等待态） | 高 |
| `aPt` | `useWebRemoteTaskSwitcher` | — | 116882 | 逐字 | 高 |
| `iPt` | `openWebRemoteTask` | — | 116801 | 逐字（同工作区=已读+查看状态回写；跨工作区=切换+重连错误回退首页） | 高 |
| `dLt`/`fLt`/`pLt` | `WEB_REMOTE_RETRY_DELAY_MS=300`/`WEB_REMOTE_MAX_RETRIES=3`/`waitRetryDelay` | — | 122539–122541 | 逐字 | 高 |
| `DPt` | `buildWebRemoteTaskViewModel` | — | 117181 | 逐字 | 高 |
| `TPt`/`EPt`/`_6`/`g6`/`SPt` | 分组/搜索/排序助手 | — | 117117–117155 | 逐字（SPt 经 Lie 比较器接口声明） | 高 |
| `CPt`/`wPt`/`_Pt`/`gPt`/`vPt` | 成员变更/过滤/重试判定 | — | 117026–117128 | 逐字 | 高 |
| `h6`/`xPt`/`mPt`/`hPt`/`bPt` | 远控行状态族 | — | 117043–117063 | 逐字（xPt 的 sessionActivity.phase 归一保留） | 中高 |
| `f6`/`ei` | `webRemoteTaskKey`/`taskWorkspaceKey` | — | 116795 | 逐字 | 高 |
| `sLt` | `cleanupDeletedTaskState` | — | 122284 | 接口级声明（依赖 xe.getState/rae） | 中 |

### A.2 边界与依据

1. 六项叶子与 Sidebar.report.md §2 清单一一对应；uzt 的 15+ 依赖助手中，**视图合成族（KRt…lzt）本次实体化**，任务索引抓取 `Cx` 因横跨命令队列/会话水合横切块（jsx 27072 区，依赖 _x/vx/gx/yx/bx/xx/Sx/xOe/bOe）保留接口声明。
2. 光束动画族按「数据（uBt/B8/V8/dBt/_Bt/yBt/xBt）→ 渐变构建（fBt…CBt/H8）→ 尺寸生成器（TBt/EBt/DBt）→ 分派（wBt）→ 组件（ABt+OBt+kBt）」五层全量展开；CSS 模板字符串内的 conic/radial 渐变、mask-composite、@property、keyframes 百分比均逐字保留。
3. mRt 的 F12 用量域钩子（$j/TY/pX/Mrt/Oq 等）体量属 F12 族，按接口声明；钩子骨架（域过滤、权益组合、升级目标回退链 `y===zai||bigmodel ? y : v?.providerId ?? c[0]?.id ?? PCt(i)`）逐字。
4. mLt 的 `switcher` 入参形态（listWorkspaces/onWorkspaceListUpdated/markTaskRead/updateMobileViewState）由 aPt/iPt 调用面归纳，记 中高。

---

## B. Conversation 族叶子（ConversationLeaves.tsx）

### B.1 叶子清单（混淆 → 语义 → js 行 / jsx 行）

| 混淆名 | 语义名 | js 行 | jsx 行 | 展开方式 | 把握度 |
|---|---|---|---|---|---|
| `Ryt` | `distanceFromBottom` | — | 97137 | 逐字 | 高 |
| `T1` | `isNearBottom`（48px 默认） | — | 97140 | 逐字 | 高 |
| `zyt` | `isNearBottomAlias` | — | 97143 | 逐字 | 高 |
| `Byt` | `resolveFollowIntent` | — | 97146 | 逐字 | 高 |
| `Vyt` | `resolveInitialIntent` | — | 97149 | 逐字 | 高 |
| `Hyt` | `shouldSuppressTopAdjustment` | — | 97152 | 逐字 | 高 |
| `Uyt` | `scrollDeltaDirection` | — | 97155 | 逐字 | 高 |
| `Wyt` | `compareScrollDirection` | — | 97158 | 逐字 | 高 |
| `Gyt` | `keyScrollIntent` | — | 97161 | 逐字（方向键/Page/Home/End/空格+Shift） | 高 |
| `E1` | `resolveFollowAfterIntent` | — | 97164 | 逐字 | 高 |
| `Kyt` | `shouldLoadOlderOnUnfollow` | — | 97171 | 逐字 | 高 |
| `D1` | `alwaysTrue` | — | 97174 | 逐字 | 高 |
| `qyt` | `computePrependCompensation` | — | 97177 | 逐字 | 高 |
| `Jyt` | `computePrependGrowth` | — | 97180 | 逐字 | 高 |
| `Yyt` | `estimatePrependTrigger`（下限 64） | — | 97184 | 逐字 | 高 |
| `Xyt` | `shouldTriggerLoadOlder` | — | 97187 | 逐字 | 高 |
| `opt` | `FileReadToolView` | 105465 | 90659 | 逐行（ipt/apt 接口声明） | 高 |
| `Gft` | `FileWriteToolView` | 104844 | 90186 | 全量逐行（多文件分行 Kft/单文件内联 diff VQ/聚合 diff 计数翻牌） | 高 |
| `Kft` | `FileWriteChildRow` | — | 90290 | 逐行 | 高 |
| `VQ` | `EditInlineDiffContent` | — | 90046 | 逐行（bhe/rA/kft/Oft 接口声明） | 高 |
| `jft`/`Mft`/`Nft`/`Pft`/`Fft` | 降动效侦听/数字翻牌 | — | 90063–90120 | 逐行 | 高 |
| `Ift`/`Lft`/`HQ`/`Rft`/`zft`/`Bft`/`Vft`/`Hft`/`Uft`/`UQ`/`Wft` | 编辑视图共享件 | — | 90127–90183 | 逐字 | 高 |
| `Spt` | `ExploreToolView` | 105825 | 91001 | 全量逐行（mpt/ppt/hpt/gpt/$Q 命令分桶逐字） | 高 |
| `upt` | `SearchToolView` | 105569 | 90768 | 全量逐行（lpt 标签解析逐字：list_files/search/grep/glob + 9 字段回退） | 高 |
| `Mht` | `TodoToolView` | 108857 | 93007 | 逐行（Aht/jht/kht 接口声明） | 高 |
| `Pht` | `AskUserQuestionToolView` | 108963 | 93067 | 逐行（eg/$h/Ume/Wme 接口声明；autoContinued 空答判定保留） | 高 |
| `Vpt` | `AgentToolView` | 106243 | 91282 | 逐行（Ppt/Npt/Opt/l$/kpt/jpt/Mpt/Fpt/Lpt/Rpt/zpt 接口声明；色点徽章/思考/输出/子调用装配保留） | 中高 |
| `Dht` | `TaskControlToolView` | 108728 | 92920 | 逐行（stopping/failed/denied/cancelled/stopped 五态 kindLabel 链保留） | 高 |
| `Sht` | `TaskOutputToolView` | 108581 | 92812 | 全量逐行（11 级状态文案链逐字） | 高 |
| `mht` | `SkillToolView` | 108309 | 92669 | 全量逐行 | 高 |
| `eht` | `SessionContextToolView` | 107835 | 92325 | 全量逐行（Zmt/Qmt/$mt 接口声明） | 高 |
| `ght` | `SwitchModeToolView` | 108426 | 92725 | 全量逐行（plan 面板：role=button 键盘可达/复制/查看全览/30% 渐隐遮罩；qZ 接口声明） | 高 |
| `omt` | `GoalToolView` | 106753 | 91604 | 全量逐行（nmt/rmt/imt/amt 多源去重合并逐字） | 高 |
| `Nmt` | `NodeReplToolView` | 107168 | 91932 | 全量逐行（Tmt/Mmt/jmt/Amt/Emt 接口声明；browser_turn_end 早退分支保留） | 高 |
| `Wmt` | `AutomationToolView` | 107472 | 92099 | 全量逐行（Vmt/Hmt/Umt/Rmt/Lmt/T$ 接口声明；MCP 结果/描述/参数三段保留） | 高 |
| `Qpt` | `FallbackToolView` | 106609 | 91478 | 全量逐行（CUA 失败面板挂载 + 无内联预览时 JSON 全量 pre 保留） | 高 |
| `Hpt` | `CuaPermissionOnboardingPanel` | 106405 | 91360 | 全量逐行（辅助功能/屏幕录制双按钮 + 拖拽助手卡） | 高 |
| `Xpt`/`Ypt` | `isCuaAccessRequest`/`isCuaPermissionFailure` | 106604 | 91469 | 逐字（p$/f$ 递归 8 层判定逐字） | 高 |
| `A_t` | `PreviewCard`（单项） | 111233 | 94950 | 全量逐行（file:// 解析/远程感知判定/打开方式菜单/36ms 级联变量） | 高 |
| `O_t` | `useVisiblePreviewCards` | 111161 | 94877 | 全量逐行（同步 website 子集优先 + 异步 checkFilesExist 签名记忆） | 高 |
| `k_t` | `PreviewCardList` | 111193 | 94925 | 逐行 | 高 |
| `C_t`/`w_t`/`T_t`/`E_t`/`D_t`/`c1` | 卡签名/同步可见/存在性校验/预览源/可点击/路径 | — | 94833–94876/94007 | 逐字 | 高 |
| `Mvt` | `collectAutomationCards` | — | 96194 | 全量逐行（cronDelete 反向移除 + 同 id 覆盖） | 高 |
| `Nvt` | `tryParseJsonObject` | — | 96214 | 逐字 | 高 |
| `Pvt` | `extractDeletedAutomationId` | — | 96223 | 逐字 | 高 |
| `Fvt` | `AutomationCardList` | — | 96229 | 逐行 | 高 |
| `fgt` | `AutomationCard` | 107448 区 | 93676 | 全量逐行（cron 文案 rgt 接口声明；testid 常量 cr/Xe 语义化） | 高 |
| `sgt`/`cgt`/`lgt`/`ugt`/`dgt` | cron 判定/宽松解析/模型归一/多源抽取 | — | 93617–93666 | 逐字（camel/snake 双键 + scheduleRule 归一保留） | 高 |
| `ASt` | `handleAliyunSdkFail` | 117919 | 100205 | 全量逐行（终态通过/延迟交互/重复提交/通用失败 五分派） | 高 |
| `jSt` | `initAliyunCaptchaInstance` | — | 100280 | 全量逐行（配置键去重 + getInstance/success/fail/onError 四回调） | 高 |
| `MSt` | `awaitCaptchaInstance`（10s 超时） | — | 100322 | 逐字 | 高 |
| `NSt` | `waitCaptchaScriptSettle`（2s） | — | 100335 | 逐字 | 高 |
| `PSt` | `runAliyunCaptchaVerification` | — | 100344 | 全量逐行（auto/traceless/interactive + 延迟升级 + 超时跳过分支） | 高 |
| `kSt` | `loadAliyunCaptchaScript` | — | 100160 | 逐字 | 高 |
| `wSt` | `CaptchaHostContainer` | — | 100110 | 逐字（z-[2147483647] 零尺寸容器） | 高 |
| `v0`/`TSt`/`ESt`/`DSt`/`OSt` | 在途拒绝/重置/配置键/挂载校验/按钮查询 | — | 100130–100190 | 逐字 | 高 |
| `r0`/`i0`/`_St`/`vSt`/`a0`/`o0`/`ySt`/`bSt`/`s0`/`c0`/`xSt`/`SSt` | 失败载荷解析族 | — | 100045–100100 | 逐字（F008/T006 码判定逐字） | 高 |
| `FSt`/`ISt`/`LSt` | 验证头名/区域头名/头构建 | — | 100470–100478 | 逐字 | 高 |
| `RSt`/`zSt`/`BSt`/`VSt`/`HSt` | ARMS 事件名/组/注入/构建/上报 | — | 100480–100500 | 逐字 | 高 |
| `b0` | `isCaptchaProtectedProvider` | 118292 | 100548 | 逐字（zcode-plan 基址四判定） | 高 |
| `nCt`/`w0`/`T0`/`rCt`/`iCt`/`aCt` | 参数缓存/运行时头账本 | — | 100560–100590 | 逐字 | 高 |
| `E0`/`D0`/`oCt`/`sCt`/`cCt`/`lCt`/`uCt`/`dCt`/`fCt` | 配置缓存/可用性/语言/串行队列/预检/恢复 | — | 100590–100680 | 逐字（60s 配置缓存 + 串行队列 + F008 重复 certifyId 告警保留） | 高 |
| `eSt` | `useWorkspaceInteractionNotifier` | 117283 | 99619 | 全量逐行（VS/HS 登记接口声明；相位变化通知保留） | 高 |
| `tSt` | `useSnapshotInteractionNotifier` | 117346 | 99703 | 全量逐行（seenRequestIds 账本逐字） | 高 |
| `Gxt`/`Kxt`/`qxt`/`Jxt`/`Yxt`/`Xxt`/`Zxt`/`Qxt`/`$xt` | 通知构建族 | — | 99539–99616 | 逐字（Uxt/Wxt/e0 接口声明） | 高 |

### B.2 边界与依据

1. 15 个工具视图（Wht 分派中除 shell/ept 外的接口级者）全部实体化；视图内部微解析助手按「已读者逐字、未读者接口声明」处理（如 Vpt 的 Ppt/Npt/Opt、Nmt 的 Tmt/Mmt、Wmt 的 Vmt/Hmt/Umt），声明处均注原混淆名与行号。
2. 滚动意图 14 助手为纯函数群，全部逐字；与 Rbt 列表主体的接线（Fyt/ayt/Lyt 等）已在 Conversation.tsx 还原/登记，不重复。
3. captcha 部件按「常量 → 解析族 → 宿主容器 → 脚本/实例/验证三层 → 头/ARMS → provider 判定 → 缓存/预检/恢复」全链展开；模块级单例（d0/f0/p0/m0/h0）以模块 let 变量保留同构语义。
4. 交互 toast 两钩子的 VS/HS 登记接口（jsx 32468/32498）属命令队列运行时横切块，按接口声明。

---

## C. 验证记录

- `web/node_modules/.bin/esbuild SidebarLeaves.tsx ConversationLeaves.tsx --loader:.tsx=tsx --jsx=preserve`：**0 错误**（136.9kb + 127.6kb）。
- `web/node_modules/.bin/tsc -p /tmp/tsconfig.sidebarleaves.json`（strict、ES2022、jsx preserve、moduleResolution Bundler、typeRoots 指向 `web/node_modules/@types`）：**0 错误**。
- `web/node_modules/.bin/tsc -p /tmp/tsconfig.conversationleaves.json`（同配置）：**0 错误**。
- `out/` 目录全程只读，未做任何修改。

## D. 把握度分布

- **高（逐字/逐行转录）**：约 92%（CSS 模板、数据色板、纯函数、工具视图 JSX、captcha 全链、toast 全链、列表段全量）。
- **中高（调用面归纳）**：约 5%（Vpt 代理颜色/摘要接线、mRt F12 接线、h6/xPt 运行时状态、mLt switcher 入参形态）。
- **中（接口级声明）**：约 3%（Cx fetchTaskIndex、sLt、F12 域钩子、Vpt/Nmt/Wmt 微解析助手、VS/HS 登记、rgt cron 文案）。

## E. 后续建议

1. `Cx` fetchTaskIndex 与 F12 用量域可在对应横切族（命令队列/F12）抽取时接管本文声明。
2. 光束动画的 `V8/uBt/B8` 数据块与 WorkspaceShell 的 logo 色板（原 V8/uBt/B8，jsx 128919 区）同源，若做「共享层」模块可统一。
3. `ght` plan 面板的 `qZ` 与 Conversation.tsx 的 `Ovt`（buildAssistantCopyText）共享计划 markdown 抽取，建议 F19 抽取时合并。
