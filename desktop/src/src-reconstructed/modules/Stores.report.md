# Stores / Services 横切层抽取报告（D8 Stage B）

- 输入：`/home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/styles-CdEGpc2x.js`（213,695 行，**未修改**）
- 对照：`/home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/styles-CdEGpc2x.jsx`（170,400 行，同一 chunk 的 pretty-print 版）
- 地图：同目录 `MODULE-MAP.md` §2（横切层清单）
- 标样：同目录 `TopBar.tsx` / `TopBar.report.md`（格式与把握度分级方法一致）

产物（共 9,013 行）：

| 文件 | 行数 | 内容 |
|---|---|---|
| `stores-core.tsx` | 840 | Settings / SessionRegistry / Feedback / SelectionScopes / ConfirmDialog / AlertDialog（6 store） |
| `stores-session.tsx` | 1,422 | SearchResults / TrajectoryViewer / SplitLayout / SessionRouter（4 store） |
| `stores-workspace.tsx` | 1,517 | Mcp / SkillContext / CodeComments / Commands / Plugins / Hooks（6 store） |
| `stores-tasks.tsx` | 913 | OffPeakTask / Automations / PinnedTaskList / WorkspaceTaskList（4 store） |
| `services.tsx` | 4,321 | 事件原语 / MessagePort IPC 客户端 / 服务注册与解析钩子 / 工作区文件服务钩子 / 作用域 context / 会话遥测监督 / 命令队列运行时 |

---

## 1. store 清单（20/20 全部抽取；混淆名 → 语义名 → js 行）

| # | 混淆名 | 语义名 | js 行 | 字段 | 动作 | 持久化键 | 消费点（调用次数，抽样行号） |
|---|---|---|---|---|---|---|---|
| 1 | `Mie` 工厂 / `ko` 钩子 / `Nie` provider | SettingsStore | 1140–1296 | 19 | 18 | `zcode-theme` `zcode-locale` `zcode-code-preview-settings` `zcode-ui-font-size-px` `zcode-performance-mode` `zcode-notification-enabled` `zcode-notification-sound-enabled`；跨窗口广播前缀 `state:`（theme/locale/uiFontSizePx） | `ko(` 55 处（设置壳 204878、登录 205826、TopBar 族等） |
| 2 | `Vo` | SearchResultsStore | 1553–1878 | 3 | 12 | 无 | 8 处：24733、35783–35785（任务搜索）、144436–144439（任务列表域） |
| 3 | `ls` | TrajectoryViewerStore | 2610–2637 | 1 | 2 | 无 | 钩子调用 0；静态 2624–2628（`goe` 订阅）、`requestOpen` 消费 143915、151737 |
| 4 | `Zs` | SessionRegistryStore | 4309–4352 | 4 | 7 | 无（纯内存注册表） | 30 处：4834/4900/4905/4924（服务解析）、24245（配置文件钩子）、35729–35731（任务列表域） |
| 5 | `Ug` | McpStore | 25007–25349 | 10 | 38 | `zcode-mcp-deleted-preload`（24788）；服务器配置经 mcpSyncService 落盘 | 15 处：194658–194676（设置 MCP 分区）、25350（接线钩子） |
| 6 | `yC` | FeedbackStore | 36992–37044 | 6 | 7 | `zcode.feedback.contact`（37091，联系方式草稿） | 25 处：38355–38357（反馈中心壳）、38915–38916、39108–39109（RMe 根）、141806（帮助动作） |
| 7 | `UB` | SkillContextStore | 63592–63633 | 1 | 3 | 无 | 4 处：63660–63663（WB useSkillContext） |
| 8 | `yH` | SelectionScopesStore | 67554–67560 | 1 | 0（模块助手 `bH`/`aXe` 2 个） | 无 | `yH(` 仅定义 1 处；消费走 `getState/setState` 助手（F03 引用选择） |
| 9 | `FH` | CodeCommentsStore | 68514–68579 | 1 | 6 | 无 | 3 处：161208–161210（代码查看器行级评论） |
| 10 | `bX` | OffPeakTaskStore | 91368–91589 | 10 | 14 | 无 | 25 处：91597–91602（off-peak 横幅）、138859–138860（AutomationsMain） |
| 11 | `s2` | SplitLayoutStore | 121669–121703（布局模型 121368–121668） | 3 | 10 | `zcode-v4-pane-layout:v2`（仅 renderer reload 恢复；旧键 `:v1` 占位） | 10 处：122842–122849（会话编排器 PTt）、122700–122780（A2 联动） |
| 12 | `A2` | SessionRouterStore | 122619–122698（工作组模型 122284–122618） | 3 | 13 | `zcode-v4-session-workbench-groups:v1` | 8 处：122852–122858（PTt）、151243（侧栏任务行分组态） |
| 13 | `H2` | ConfirmDialogStore | 123480–123491 | 1 | 2 | 无 | 3 处：123494（U2 useConfirmDialog）、206574–206575（呈现层） |
| 14 | `T3` | AutomationsStore | 134111–134388 | 7 | 10 | 无 | 14 处：138843–138851（AutomationsMain d6） |
| 15 | `E6` | PinnedTaskListStore | 142372–142428 | 3 | 4 | 无 | 2 处：151805–151806（侧栏置顶段）；会话后刷新助手 `D6` 142430 |
| 16 | `k6` | WorkspaceTaskListStore | 142464–142556 | 5 | 4 | 无 | 4 处：152320–152323（侧栏时间线段）；会话后刷新助手 `A6` 142558 |
| 17 | `F6` | CommandsStore | 142754–142872 | 11 | 6 | 无 | 13 处：200506–200513（设置 commands 分区） |
| 18 | `B6` | PluginsStore | 142985–143135 | 14 | 13 | 无 | 37 处：194660、199959、200014–200018（设置 plugins 分区/市场） |
| 19 | `Z0t` | HooksStore | 201244–201365 | 7 | 7 | 无 | 1 处：202037（设置 hooks 分区） |
| 20 | `N9` | AlertDialogStore | 206514–206527 | 1 | 2 | 无 | 3 处：206529–206530（G4t 呈现层）、209651（useAlert 钩子） |

**合计：20 store · 111 个 state 字段 · 178 个 actions**（yH 的 2 个模块助手不计入 actions）。

### 1.1 store 创建点全量核对

`grep -E "= Ae\(\(|= Ae\("` 全 chunk 恰得 **20 处**，与地图 §2.1 逐一吻合（1145/1553/2610/4309/25007/36992/63592/67554/68514/91368/121669/122619/123480/134111/142372/142464/142754/142985/201244/206514）。
**未发现未登记的 store，无未归属项。** 跨 chunk 的 `useTaskStore`（`xe`）与 `useSkillsStore`（`Ne`）在 `skillStore-BmeKHDBI.js`，按地图约定不在本次范围。

---

## 2. services / IPC 客户端与工具块（`services.tsx`）

| 区块 | 混淆名 → 语义名 | js 行 | 说明 |
|---|---|---|---|
| A 事件原语 | `Os`→EventUtil、`ks`→Emitter、`As`→VSBuffer、`Yoe`→BufferReader、`js`→BufferWriter、`Ms/Ns`→varint、`Ps`→ValueType、`Rs/zs`→serialize/deserializeValue、`tse/nse`→base64、`rse`→isFlowControlMessage | 3551–3842 | 全量逐行还原 |
| B IPC 客户端 | `ise`→MessagePortStreamProtocol、`Bs/Vs/Hs`→消息类型/状态枚举、`ase`→ChannelClient、`Us`→ServiceProxy(fromService/toService)、`Ws/Gs`→事件名启发式、`ose`→首监听者缓冲 | 3843–4121 | 全量逐行还原（含错误透传字段 code/data/detail/details/taskId/traceId） |
| C 服务注册 | `ds/fs/ps`→ServiceProvider/useServices(+Optional)；`xse/Sse/Qs/$s/Cse/ec/wse/tc/Tse` 会话注册助手；`Xs` 服务代号 | 2635–2660、4303–4378 | 全量还原；`Qs` 与 provider 同步状态清除联动 |
| C provider 同步 | `qs/lse/vse/Ys/hse/gse/_se`→同步状态表/主循环/身份探测/清除；`cse`=2 引导重试上限 | 4122–4308 | 全量还原（幂等+并发合并+引导重试） |
| C 服务解析 | `xc/Sc` 远端断开错误、`Use/wc` 断开占位服务、`Wse/Gse/Tc/Kse` 解析助手、`Ec/qse` useBaseServices、`Dc` useResolvedWorkspaceServices（rpcReady）、`Oc` useWorkspaceServices、`gc/_c/vc/yc/Hse/bc` 远端会话解析 | 4834–4960 | 全量还原 |
| D 工作区钩子 | `rge` 全局快捷键；任务快照缓存 `sge/fge/Dg/Og/gge/_ge/vge/yge/bge/kg`（键 `zcode-task-snapshot-cache:v1`，256KB/条、2MB、20 条）；`Sge/Cge/wge` useWorkspaceProviderConfigFile；`Ag` useSessionService | 24015–25006 | 全量还原 |
| E 作用域 context | `gT/_T/vT/_Fe/xT/vFe/yFe/bFe` 遥测监督注册表；`ST/CT/xFe/wT/SFe` TelemetryScope（服务作用域）；`TT/CFe/wFe/ET` V4Conversation（工作区作用域）；`DT/TFe` 面板作用域 | 42597–42806 | 全量还原 |
| F 遥测监督 | `uT`→BoundedStringSet（容量 `lT`=2000）、`hT`→ConversationTelemetrySupervisor、fact 助手 `dT/fT/pT/fFe/pFe/mFe/mT`、缓冲常量 `sFe`=128/`cFe`=200 | 41808–42596 | 全量逐行还原（约 700 行类） |
| G 命令队列运行时 | `ux/dx` 未读通知去重；协议 schema（`qOe` 队列项：steer `KOe`/dispatch `Nx`/admittedAt `GOe`/provenance、`Fx` 控制、`Lx` 可用性、`Ux` 队列、`Gx` 交互、`oke` 快照、`cke` 行增量）；`Yke` 会话命令表（23 个命令）；`bS`→FrameAssembler（16 种故障码全录）；`XAe`→SessionIndexStore（订阅/恢复状态机）；`QAe`→WorkspaceSubscriptionSet；`VS/HS/BS` store 池 | 32246–36438 | schema 以 TS 类型 + 声明常量表达（zod 本体在 src chunk）；FrameAssembler/SessionIndexStore/订阅集全量还原 |

### 2.1 对地图的两处更正/细化

1. **`hT` 语义更正**：地图 §2.6 记为“权限状态机”。按实现（41893–42596）更正为**会话遥测/归因监督器**
   （提示词种子建档 → 轮次/模型请求/工具/子代理/压缩/终端事实归因 → 串行上报；前台引用计数、
   去重集、128/200 缓冲、延迟终端）。`permission.lifecycle` 事实的处理（权限等待计时 `SPe/CPe`）
   只是其中一支；字段表（platform/workspaceScopeKey/eventIds/acceptedCommandIds/terminalKeys）与地图一致。
2. **`ise` 的宿主面**：确认其帧处理只接受 `Uint8Array` 帧与 `__zcodeRpcControl: connection-flow-v1`
   流控对象（saturated/drained）两类消息，与地图“host 32 服务面的 renderer 侧”描述吻合。

---

## 3. 边界判定依据

1. **创建点定界**：每个 store 从 `= Ae(` 起，到下一个顶层声明前为止；闭包内私有变量
   （`P6/I6/g9` in-flight 表、`b3/x3` 序号与去重集、`yX` 单飞槽、`i` 节流计数等）一并还原为
   工厂闭包局部量，保持原语义。
2. **消费点抽样**：对每个 store 钩子做全量调用点计数（§1 表），抽样行号用于核对语义
   （如 `bX` 的 25 处集中在 off-peak 横幅与 AutomationsMain，与 F15 归属一致）。
3. **持久化键**：`grep -o "zcode-[a-z0-9:_-]+"` 全量枚举后逐键归属；本批 store 涉及 12 个键
   （§1 表），其中 7 个属 SettingsStore。`zcode-v4-last-session:v1:`（会话持久化 `M2/N2/P2/HTt`）
   属 F07 族，不在 store 层，仅在此登记避免重复归属。
4. **双归属处理**：`E6/k6`（142372–142753）同时落在 F01 族范围与 store 层，按地图 §4 记账约定
   归入 store 层抽取；F01 族后续抽取时直接引用 `stores-tasks.tsx`。

## 4. 把握度评估

| 部分 | 把握度 | 依据 |
|---|---|---|
| 20 个 store 的字段/动作/闭包语义 | **高（逐行转录）** | 直接从压缩源码逐句还原；字段名、分支条件、日志文案（`[mcpStore]`/`[off-peak]`/`[automations]`/`[plugins]` 等）未改动 |
| 持久化键与广播通道 | **高** | 字符串常量逐字核对（含 `state:` 前缀与 `Eo` 同步字段集） |
| 事件原语 / IPC 客户端 / 服务钩子 / 作用域 context | **高（逐行转录）** | 逻辑紧凑、无外部状态，全量还原 |
| `hT` 遥测监督器 | **高** | 700 行类全量转录；仅遥测下沉函数（`xw/Zw/dPe/…` 约 25 个）按接口声明（本体分散在 41500–41800 遥测工具区，非本次范围） |
| FrameAssembler / SessionIndexStore / 订阅集 | **高** | 全量还原；仅 6 个宿主配置常量（`bi` 限额、重试退避表 `KAe`、重启窗口 `GAe/UAe/WAe`）与 2 个纯函数（`YAe` 帧应用、`Tte/Ane` base64/crc32）按接口声明 |
| v4 协议 zod schema | **中高（类型级）** | 以 TS 类型 + `declare const` 表达；字段名/可选性/字面量联合与源码逐项核对，但 zod 修饰符（`.strict()/.default()/.superRefine()`）仅以注释记录 |
| 各 store 的纯函数助手（`Xie/Jie/Yie/…`、`w3/C3/S3/…`、`K0t/J0t/v9/…` 等） | **中（接口级）** | 体量大且与族层耦合，声明签名 + 行号登记，按需在族抽取时补全 |
| 跨 chunk 符号归属 | **高** | 文件头导入块（336–995）逐个别名核对（`Ae`=skillStore q、`ne`=skillStore J、`K`=src zod、`J`=logger t） |

## 5. 验证记录

- `esbuild --loader:.tsx=tsx --jsx=preserve`：5 个文件全部解析通过（**0 错误**）。
- `tsc --noEmit --strict`（tsconfig: ES2022 + DOM，@types/react/react-dom 取自
  `/home/none/grok-build/web/node_modules`，方法同 TopBar 试点）：**0 错误**。
- `out/` 目录未做任何修改（只读访问）。

## 6. 未发现/未归属项

- **store：0 个未发现、0 个未归属**（20/20 全量核对，§1.1）。
- 遗留接口级符号（非 store，登记备查）：遥测下沉函数 ×25（41500–41800 区）、协议宿主常量
  `bi`/`KAe`/`GAe`/`UAe`/`WAe`、帧纯函数 `YAe/Tte/Ane`、各 store 的排序/合并助手（§4 中档项）。
- 地图 §2.2 所列 `24015–25006` 钩子群中的模型/模式解析助手（`jg/Mg/Mge` 等，24320 之后）
  语义属 F12 供应商域，未纳入 services.tsx，行号已在源码中留存。

## 7. 后续建议

1. F07（壳/分屏）抽取时直接 `import { useSplitLayoutStore, useSessionRouterStore } from "./stores-session"`；
   F01 侧栏引用 `stores-tasks.tsx` 的 `E6/k6` 两个 store。
2. 协议 schema 若后续要可执行，可用真 zod 按 §2 G 的类型逐项落一遍 `.strict()` 校验（当前为类型级）。
3. `hT` 的遥测下沉函数（`xw` 等）建议在“遥测/ARMS”专项（F20 族）中一并抽取。
