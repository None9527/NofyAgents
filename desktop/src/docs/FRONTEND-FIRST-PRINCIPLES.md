# 前端问题的第一性原理重定框（A1-B）

状态：**生效** —— 本文取代「先全量逆向 renderer 再谈移植」的工作序；PORTING-PLAN 的阶段
B–E 回到关键路径，A1 renderer 重建降级为非关键路径的只读资产。
日期：2026-09-06 · 基线 b37869f · 全部结论附实测证据，非推论。

---

## 1. 地面真相（实测，可复跑）

| # | 事实 | 证据 |
|---|---|---|
| 1 | 仓库里有两个产品：nofy Rust 内核（92 crates，原生 ACP 库 `nofy-acp-lib` 2,277 行）与 ZCode 3.7.6 去品牌 Electron 壳（`desktop/src/out/`，**已解混淆**：prettier 重排 + main/host 约 15,500 个真符号名回代；**renderer 无 keep_names，标识符永久最小化**） | `desktop/src/README.md` §2/2b；`out/host/index.js` 52,824 行、平均行长 33.5 |
| 2 | **PORTING-PLAN 阶段 A 已完工并提交**（`40e5871`，08-30 15:12）：main 内 `NofyKernelClient` 单例 + kernel-supervisor + main↔host IPC 桥 + `acp-probe5` 17/17 | `git show 40e5871 --stat` |
| 3 | 阶段 A 之后的 **276 个提交全部只改 `desktop/src/src/`**（renderer 重建影子树，456 文件）；`out/` 0 次、`crates/` 0 次 | `git diff --numstat 40e5871..HEAD` |
| 4 | PORTING-PLAN §2.6 明写：「renderer（757 个 minified chunk，无符号）← **第一阶段不动**」「renderer 是压缩产物，改它代价极高；**host 是唯一合理的手术面**」 | `docs/PORTING-PLAN.md` §2.6 |
| 5 | 出厂应用可启动、UI 完整渲染，但被**唯一硬阻塞**卡死：首页横幅「当前没有可用模型」，host 日志 `providerCount:0 ⇒ ZCode agent 保持未启动` | CDP 探针 + `electron.log`（§2.7 的 Producer A/B/C 全中） |
| 6 | `~/.nofy/v2/config.json`（provider 镜像）**不存在**；`~/.nofy/config.toml` 有 4 个模型（grok-4.5 内置 + dashscope/qwen-coder/glm-5.2） | `ls ~/.nofy/v2/`；`grep '^\[model' ~/.nofy/config.toml` |
| 7 | `nofy agent serve` **不带 `--secret` 时自动生成随机 secret**（仅 stderr 打印，无状态文件）；桌面 seam 硬连 `server-key=nofy-desktop` ⇒ 对外部启动的内核，阶段 A 单例**结构上握不上手**（`kernel client not ready (8000ms)`） | `nofy agent serve --help`；kernel banner `Secret: 57de32046e66`；probe5 FATAL |
| 8 | 带 `--secret nofy-desktop` 启动内核后 `acp-probe5` **17/17 全过**（modelState 4 模型、roster 11 条、cancel=notification 7ms 收尾、全进程 WS=1） | `node desktop/scripts/acp-probe5.mjs` |
| 9 | **main→host 的 utilityProcess 裸帧在真应用里不送达**（六次对照实验：parentPort 裸帧／带空 transfer 列表／专用 MessageChannelMain 转移端口，host 侧最早注册的监听均收不到；而 host→main 方向可达、内核侧 initialize 已被处理并回推通知） | `[kbridge] reply ok= true` 与 host 侧零收帧的对照日志；kernel `--debug-file` 轨迹 |
| 10 | 门槛快照的投影判据：`shouldIncludeModelProviderInZCodeAgentRegistry` + `convertModelProviderConfigToZCodeProviderInput` 要求 `endpoints.paths[kind]` 存在且模型条目带 `kinds`、`models` 为**数组**形 | `out/host/chunk-O5YHTQBW.js:14050/14871`；`TypeError: e.models.filter is not a function` |

## 2. 已证缺陷（登记即修，不留隐患）

- **D1（secret 契约）**：supervisor 的 attach 路径无法认证外部启动的内核（secret 不可发现）。
  08-30 的 17/17 是对带匹配 secret 的内核测的；此后内核被换成无 secret 进程，Track A 静默失效且
  「kernel ready attach-9800」日志**主动误导**（它只是端点发现，不含握手结果）。
  本批处置：运维层以 `--secret nofy-desktop` 恢复契约；代码层待办＝attach 失败时把
  WS 关闭码/401 纳入超时错误文本（见 §4 P3）。
- **D2（桥的 main→host 方向死）**：阶段 A 的 host 消费面自提交起**从未被端到端验证**
  （probe5 只测 main 侧纯 Node）。本批将传输改为每 child 一条专用 MessageChannelMain
  （与 ChannelServer 服务帧同形制）；**该方向仍未证实可达**，故门槛取数不依赖它（见 D3 兜底）。
- **D3（模型门槛）**：已修。host `model-provider` 服务在存储注册表为空时，以
  「内核 modelState（经桥，优先）→ `~/.nofy/config.toml` 的 `[model.*]` 只读派生（兜底）」
  合成一条 provider 条目（`apiKeyRequired:false`、`endpoints.paths` 与模型 `kinds` 齐备），
  门槛三 Producer 全绿，**renderer 零改动**。实测：横幅消失、快照 `providers=1 ids=nofy-kernel`、
  agent 服务越过门槛并尝试启动旧 adapter。

## 3. 修正后的工作序

1. **阶段 B（会话主流程切 ACP）＝下一切片**。门槛已绿，但首发仍走旧 adapter（其传输已报错
   `ZCode agent transport`，且 cancel=notification 等缺陷在案，§2.5）。B 完成后首发/流式/停止/
   权限应答才真正可用，并顺带消除「adapter 第二条 WS 抢单客户端槽」的 §2.3 违例。
2. **阶段 C 余量**（设置界面直读写 config.toml、拆 `v2/setting.json` 等）随 B 滚动。
3. **阶段 D/E** 按 PORTING-PLAN 原序。
4. **A1 renderer 重建＝冻结为非关键路径**。理由：§2.6 已裁定 renderer 第一阶段不动；276 提交
   对「应用能否工作」零贡献；其产物（356 文件/343,126 行、tsc+esbuild 绿）保留为只读资产与
   回归哨兵（七门继续跑），但**不再作为进度指标**；「out/ 零改动」不变量自本批起仅约束
   renderer 三束字节（byte-identity 证据），**不再约束 host/main 的移植手术**。
5. **验证开销硬规则**：任何批次的验证成本不得超过其产品码成本；被引证的判决必须读已提交之物。

## 4. 待办队列（按序）

- **P0.5 桌面拓扑＝私有 stdio 子进程：完成**（2026-09-06）。supervisor 默认派生
  `nofy agent stdio` 私有子进程（无端口/无 secret/天然单父客户端/父死子亡）；
  attach-serve 降为显式 opt-in（`NOFY_KERNEL_ATTACH=1`）。验收：`acp-probe6` **13/13**
  （stdio-child 形态、子进程 ps 实证、initialize/modelState/扩展负对照、零 TCP、
  cancel 通知 7ms、`close()` 后子进程 stdin EOF 退出）；`acp-probe5`（WS/attach 基线）
  **17/17 无回归**；真应用实证：9803 有活 serve 亦**零 attach**、门槛横幅消失、
  应用退出后子进程回收（code=143、零孤儿）。D1 在默认拓扑下**结构性消失**。
- **P1a 内核连接改由 host 自有：完成**（2026-09-06）。裁定 K（见 §5）：main→host 帧投递
  实测不可达 ⇒ §3「main 持连接、host 经桥消费」不成立；连接改归 host 进程（每 host 一个
  `nofy agent stdio` 私有子进程，直连直读）。验收：`acp-probe7` **8/8**（initialize、
  modelState、session/list、session/new、**84 流式块**、cancel 10ms `cancelled`、
  新会话入列表、子进程 EOF 回收）；真应用实证 main 零派生（disabled 模式）、门槛仍绿、
  无游离子进程。
- **P1b-0 切点定案 + 合同实测：完成**（2026-09-07）。裁定 L（见 §7）：切在 **R1**
  （renderer↔host 通道服务），不切 R2（v4 协议子进程），不另造 renderer。观测件
  `out/host/seam/agent-service-observer.js`（`NOFY_OBS_AGENT=1`，默认原样返回、零行为差）
  实录真应用的 renderer→host 调用：`nofy-agent` **93** 方法 / `zcode-session` **23** 方法，
  启动序列与失败态见 §8。会话面**整体被「agent runtime 未运行」闸住**（EPIPE ⇒ 输入器被撤）。
- **P1b-1 D6 解释器路径修复：完成**（2026-09-07，见 §9）。`/usr/bin/node` 写死 ⇒ ENOENT ⇒
  全会话面 EPIPE 闸死；改 `resolveNodeBin()` 真解析 + 解析不到不置位（保留 host 内建回退链）。
  实测：runtime 子进程零错误、`initializeWorkspace.available:true`、真 sessionId、
  v4 订阅 ack、索引/会话帧真推送、UI 输入器恢复、真发 prompt 被 accepted。
- **P1b-2 修 D7（当前工作项）**：probe10 脱离应用直驱适配器，定位「turn 4 秒 completedSuccess
  但零助手文本行、`sessionEnded:true`」；适配器 stderr 落盘。绿之前不得声称会话主流程可用。
- P1b-3 修 D8：`__home__` 伪 workspace 的索引订阅（首页「还没有对话」空态）。
- ~~P1b 阶段 B 合同重写：host `nofy-agent` 服务的会话方法改走 `kernel-client-host.js`~~
  **作废**（§9 更正）：R2 侧 v4 服务端＝树内既有 `out/main/seam/acp-agent-adapter.js`（1339 行）
  已接线并复用 host 全部 93 方法与 v4 机制；工作面改为**补齐/修正适配器**，不重写 host 服务。
- P1c preload 改线：`window.zcode.listNofyWorkspaces` 等枚举 API 由 main IPC 改走 host
  服务（renderer 零改动）；多窗口 K1 复核。
- P2 修 D2：为桥的 main→host 方向建立**入库的端到端回归探针**（host 侧收帧断言），
  在探针绿之前一切 host 取数不得依赖该方向。
- P3 修 D1 代码层：`ensureNofyKernelClient` 超时错误携带 WS 关闭码/HTTP 状态（401 ⇒ 明示 secret 不匹配）。
- P4 阶段 C：设置界面直读写 config.toml（含 JS 侧保注释编辑方案定案，PORTING-PLAN §6.1）。

---

## 5. 裁定 K：内核连接归 host 自有（P1a，2026-09-06）

**测量事实（判定性实验，真应用接线）**：main→host 方向对 seam 帧**不可达**——
① parentPort 裸帧、② 专用 MessageChannelMain 转移端口、③ 在 child-'message' 处理函数内
回包，三种形制 main 侧发送均成功（零抛错）而 host 侧（含模块导入期最早注册的监听）
**零收帧**；对照：另有约 2–3/s 的未知来源帧确实到达 host 并被既有 zod 分派拒绝
（「invalid parentPort message」），发送者未识别。⇒ 桥的消费面在当前 Electron 接线下
不成立，P2 保留但**一切 host 取数不得依赖该方向**。

**裁定**：内核连接改由 **host 进程自有**（`out/host/seam/kernel-client-host.js`，
复用传输抽象后的 `NofyKernelClient` + supervisor 的 `spawnStdioChild`）。理由：
阶段 B 的会话流与 renderer 的 ChannelServer 契约都终止于 host；TUI 的先例是「UI 与
agent 同进程」；stdio 子进程无端口/无 secret/天然单父客户端/父死子亡。
main 侧单例降为**探针/诊断专用**（`NOFY_MAIN_KERNEL=1`；attach 形态 `NOFY_KERNEL_ATTACH=1`），
应用内默认 `mode:"disabled"` 快速失败，不再派生第二个内核实例。

**K1（登记，未修）**：多窗口＝每窗口一个 host＝一个内核子进程，语义等同多个 TUI 实例；
会话存储按 (cwd, sid) 目录隔离，不同会话并发安全、同会话两端同时活跃未定义
（PORTING-PLAN §6.7）。跨窗口共享单内核的候选方案＝spawn 期 fd 传递的 socketpair，
或修好 main→host 投递；二者皆未做。

**探针矩阵**：probe5＝WS/attach 基线（17/17）；probe6＝main 侧 stdio 拓扑基线（13/13，
需 `NOFY_MAIN_KERNEL=1` 或 attach）；probe7＝**host 自有垂直路径基线（8/8）**；
probe8＝**v4 会话事件形状门禁（10/10）**——直接 import 束内 zod 联合
（chunk-O5YHTQBW 导出 `Ya`＝本地 `Bf`，discriminatedUnion 25 型）做 safeParse，
束可在纯 Node 导入实证成立。P1b 的 ACP→v4 桥产出的每个事件必须先过 probe8。

---

## 6. P1b 合同规格（v4 会话事件，probe8 样本即规格；strict schema ⇒ 键集精确）

信封（`ek`，strict）：`eventId`/`sessionId` uuid、`turnId?` uuid、`seq` int≥0、
`traceId?` uuid、`timestamp` int(ms)、`deliveryKind?` ∈ desktop-continuous|web-remote-replayable；
外加 `type` 判别量与 `payload?`。

| 事件 | 最小 payload 键 | 枚举域 |
|---|---|---|
| session.created | mode, contextWindow | mode ∈ plan\|build\|edit\|yolo\|auto |
| turn.started | turnNumber, input | — |
| part.started / part.upserted | part{partId, sessionId, messageId, type:"text", text} | part.type ∈ text\|reasoning\|file\|… |
| part.delta | messageId, partId, delta | field ∈ text\|reasoning\|input\|output |
| message.upserted | content | — |
| turn.completed | response, tokenCount, toolCallCount, duration, resultType | resultType ∈ success\|cancelled\|error_max_turns\|error_max_budget\|error_during_execution\|error_max_tool_calls |
| session.titleUpdated | previousTitle, title, source | source ∈ default\|first_input\|generated\|custom |
| permission.requested | toolCallId, toolName, riskLevel, reason, input, options[] | riskLevel ∈ low\|medium\|high\|critical；options[]{optionId, kind, name, response{decision}}；decision ∈ allow\|deny\|escalate\|modify |
| permission.resolved | toolCallId | decision 同上 |
| session.closed | （无 payload） | — |

投递链：协议客户端 `onNotification("session/event")` → `handleSessionEvent` →
`emitSessionEvent(ws, sessionId, {type:"session.event", event})` → `subscribeConversationV4`
（renderer 订阅面）；roster/索引走 `subscribeSessionsIndexV4`。替换面＝服务层的
`getClient/getReadOnlyClient` 返回的协议客户端（`.request(Me.*, params, schema)` +
`.onNotification`），以 ACP-backed shim 同形替换；未映射方法显式抛 not-migrated。

P1b 开工前的剩余微读取：`Me` 方法名字符串表、conversationV4 的推送通道名、
`initialize/resyncConversationV4` 的历史消息形（`ou` schema）。
（**已被 §7/§8 取代**：切点下移到服务方法层，v4 线路协议不再需要复刻；
方法清单与启动序列改为实测取得，不再靠微读取推断。）

---

## 7. 裁定 L：切点在 R1（host 通道服务），不在 R2、不另造 renderer（2026-09-07）

实测确认全链路只有**两个协议边界**：

| 边界 | 两端 | 协议 | 规格出处 |
|------|------|------|----------|
| **R1** | renderer ↔ host（utilityProcess，MessagePort `zcode:service-port`） | 33 通道 rpc；`nofy-agent` 93 方法 / `zcode-session` 23 方法；推送＝v4 会话事件（§6）+ conversation frame | renderer `src-HCld2afU.js:8468-8501`、host `chunk-O5YHTQBW.js:17538-17571`、§8 实测 |
| **R2** | host ↔ **agent runtime 子进程** | 「ZCode Protocol」v1/v4：topic 订阅 + `logEpoch`/`seq` 复制、resync、rowsRange 分页、connection flow、attachment、commands | `out/host/chunk-L6SVKCE4.js`（2857 行 zod：`ei`=方法表 `v4/*`，`ri`=通知 `v4/conversation/frame`、`v4/telemetry/event`） |

R2 的对端在原产品里是**本地 CLI 子进程**（provider `glm`，`resolveBundledGlmBinaryPath()`），
不是云端；本机该二进制 `<not found>` ⇒ 写 stdin 得 `write EPIPE`（§8）。
内核说的是 ACP over stdio（R2′），故必须有一侧被重写。三条候选：

- **切 R2**（造一个说 v4 的 runtime 子进程，内部驱动 `nofy agent stdio`）：host 零改动，
  但要实现完整 v4 复制协议（epoch/seq/gap/resync/rowsRange/flow/attachment），
  且 host 客户端的缺口检测与重同步逻辑必须被满足，跨进程调试。**语义负担最大。**
- **切 R1**（重写 host 服务方法体，直连 ACP）：需要产出 R1 形状的值（§6 事件、frame、rows、ack），
  但**不需要**实现 v4 传输机制（connectionId/subscriptionId/logEpoch 可退化为自洽常量，
  因为对端只有 renderer，且形状由 zod 门禁可验）。**语义负担是 R2 的真子集。**
- **另造 renderer**（本会话一度宣布的 pivot）：**撤回**。它要丢弃整套冻结 UI（会话/差异/文件/
  设置/终端/检查点），用新代码重建 93 方法对应的界面，工作量严格更大，且与「包裹 ZCode 壳」
  的既定策略相悖。

**裁定：切 R1。** 附带理由：host `index.js` 已成功动过刀（D3 模型门槛），符号名已恢复，
且可用 CDP 在真应用里端到端验收；R2 方案则要先造进程再造测试台，观测只能间接。

**登记限制 L1**：会话面不只看数据方法——`onAgentRuntimeLifecycle` / `onAgentRuntimeRestarted` /
「ZCode Agent runtime is not running.」这条**运行时生命周期**同样闸住 UI（§8：输入器被撤、
只剩「重新连接」）。生命周期不改成内核背书，数据方法全对也出不来可用界面。

**登记限制 L2**：R1 切口只覆盖 `nofy-agent`/`zcode-session` 两通道；其余 31 通道（file/terminal/
git/setting/…）按 `UI-KERNEL-GAP-MATRIX.md` 的域分类分阶段处理，本裁定不改变它们的归属。

**P1b 实施序**（每步都可独立在真应用里验收）：
1. runtime 生命周期 + `initializeWorkspace`/`readWorkspaceState`/`getWorkspaceRuntimeIdentity`
   → 验收：UI 不再显示 `write EPIPE`，输入器回来。
2. `sendConversationCommandV4(createSession)` + `subscribeConversationV4` + `onDynamicConversationFrame`
   + `onDynamicSessionEvent` → 验收：新建会话成功、会话视图可 hydration。
3. `sendText` 流式（ACP `session/prompt` → §6 事件序列）→ 验收：真发 prompt 见流式文本。
4. 停止（ACP `session/cancel` → `turn.completed{resultType:"cancelled"}`）。
5. 权限应答（`permission.requested`/`resolved` 双向）。
6. `setModel`/`setMode`/`setThoughtLevel`/`resolveRuntimeModelForV4`。
7. 历史回放：`conversationRowsRangeV4`/`readSessionMessages`/`readSessionEvents`/`resumeSession`。
8. 索引面：`subscribeSessionsIndexV4`/`listSessions`/`onDynamicSessionsIndexFrame`。
9. `queryConversationCommandsV4`（斜杠命令）+ workspace-config 订阅面。

---

## 8. R1 合同实测（probe9，2026-09-07，可复跑）

复跑方式：
```bash
cd desktop/src && rm -f /tmp/nofy-obs/agent-calls.jsonl
NOFY_OBS_AGENT=1 ./node_modules/.bin/electron . --remote-debugging-port=9400 \
  > /tmp/nofy-obs/electron19.log 2>&1 &
sleep 14 && node /tmp/nofy-obs/probe.mjs        # 看 UI 状态
python3 ../scripts/analyze-agent-calls.py        # 汇总调用序列/形状/错误
```
观测件：`out/host/seam/agent-service-observer.js`，接线点 `.register(Fn, observeChannelService(ve,"nofy-agent"))`
与 `.register(Rr, observeChannelService(Oe,"zcode-session"))`（host `index.js:50422-50423`）。
`NOFY_OBS_AGENT` 未置位时**原样返回服务对象**（同一引用、零代理、零行为差）。

**方法清单（实测，非推断）**：`nofy-agent` 93 个、`zcode-session` 23 个（后者是前者的镜像子集：
initializeWorkspace/readWorkspaceState/createSession/resumeSession/listSessions/readSession*/
closeSession/setMode/setModel/setThoughtLevel/setWorkspaceDefault*/upsert|removeModelProvider/
updateProviderRegistry/resolveRuntimeModelForV4/respondProviderRuntimeHeaders/
getWorkspaceRuntimeIdentity/promote|closeDeferredDraftSession）。
`nofy-agent` 会话相关子集（P1b 工作面）：`initialize`、`helloConversationV4`、
`initializeConversationV4`、`setConnectionFlowStateV4`、`subscribe|unsubscribe|resyncConversationV4`、
`onDynamicConversationFrame`、`onDynamicSessionEvent`、`onDynamicConversationTelemetryFact`、
`sendConversationCommandV4`、`conversationRowsRangeV4`、`conversationPlansV4`、
`conversationFileChangesV4`、`conversationFileRewindPreviewV4`、`queryConversationCommandsV4`、
`readSession|readSessionMessages|readSessionEvents`、`listSessions`、`createSession`、
`resumeSession`、`closeSession`、`compactSession`、`goalSession`、`listSessionSubagents`、
`sendPrompt`、`setMode|setModel|setThoughtLevel`、`resolveRuntimeModelForV4`、
`updateRuntimeModelConfig`、`subscribe|unsubscribe|resyncSessionsIndexV4`、
`onDynamicSessionsIndexFrame`、`subscribe|unsubscribe|resyncWorkspaceConfigV4`、
`onDynamicWorkspaceConfigFrame`、`onAgentRuntimeLifecycle|Restarted`、
`respondSessionRuntimePreferences`、`onDynamicSessionRuntimePreferencesRequest`、
`getTaskTokenUsage`、`getAppUsageStats`、`attachment*V4`。
（其余为 plugin/automation/model-provider 域，按域处置图分期。）

**启动即发生的调用序列（实测）**：

| # | 通道.方法 | 参数要点 | 结果 |
|---|-----------|----------|------|
| 1 | `zcode-session.initializeWorkspace` | `{workspacePath:"/Users/mac"}` | `{available:false, workspaceKey, protocolName:"ZCode Protocol", protocolVersion:1, reason:"write EPIPE"}` |
| 2 | `nofy-agent.syncAppRuntimePreferences` | `{askUserQuestionAutoResolutionEnabled:true}` | `undefined`（成功） |
| 3 | `nofy-agent.subscribeSessionsIndexV4` ×9 | `{workspacePath:"__home__", runtimePolicy:"existing-only", __zcodeTrustedV4Connection:{connectionId:"host-rpc-…", clientMode:"desktop-continuous"}}` | **throw** `ZCode Agent runtime is not running.` |
| 4 | emitter 订阅 | `onDynamicSessionsIndexFrame({workspacePath:"__home__"})`、`onDynamicConversationFrame({workspacePath:"/Users/mac/.nofy/workspace/default"})`、`onDynamicConversationTelemetryFact(同)`、`onAgentRuntimeLifecycle/Restarted` | 返回 subscribe 函数（前三个）/ 对象（后两个） |
| 5 | `nofy-agent.sendConversationCommandV4` | `{workspacePath, envelope:{commandId, clientId:"client-…", sessionId:null, type:"createSession", payload:{workspaceId, config:{mode:"build", followupMode:"queue"}}, issuedAt}, __zcodeTrustedV4Connection:{…}}` | **throw** `write EPIPE` |
| 6 | `zcode-session.readWorkspaceState` | `{workspacePath:"/Users/mac"}` | **throw** `write EPIPE` |
| 7 | `nofy-agent.subscribeConversationV4` | `{workspacePath:"/Users/mac", sessionId:"01a0484b-…", __zcodeTrustedV4Connection:{…}}` | **throw** `write EPIPE` |
| 8 | `nofy-agent.onDynamicProviderRuntimeHeadersRequest` | 订阅 `{workspacePath, sessionId}` | 返回 subscribe 函数 |
| 9 | `nofy-agent.disposeAllAndWait` | `[]`（退出时） | 未见返回（进程收尾） |

`onDynamicSessionsIndexFrame` 被**按 workspace 逐个订阅**（实测 5 个：`__home__`、
`~/.nofy/workspace/default`、`/Users/mac`、`/Users/mac/nofy-build`、`/Users/mac/nofy-build/web`），
即索引面是 per-workspace 多订阅，不是一个全局流。整段录像里 host **一帧都没推给 renderer**
（推送计数 0）——因为 runtime 从未起来。

**UI 后果（CDP 实测）**：会话卡出现（标题 `Greeting and Nofy assistant identity introduction`）
但正文＝`write EPIPE` + 「重新连接」按钮；**输入器（contenteditable/textarea）与「发送」按钮
从 DOM 中消失**（`composer candidates:` 空）。⇒ 会话面被 runtime 生命周期整体闸住（L1）。

**形状结论**：`__zcodeTrustedV4Connection` 由 host rpc 层注入（非 renderer 伪造），
`workspacePath` 有 `__home__`（索引面）与真实路径（会话面）两种取值；
`initializeWorkspace` 的返回是**软失败**形（`available:false` + `reason`），不抛；
`subscribeSessionsIndexV4` 的失败是**硬抛**。两者都要在内核背书后改为成功形。
（**§9 更正**：runtime 起来后两者都已是成功形，实测见 §9。）

---

## 9. 裁定 L 的事实性更正 + D6 修复实测（2026-09-07，probe9 第二轮）

**更正（重要）**：§7 把「切 R2＝要新造一个 v4 子进程」当作未做之事，**错了**。R2 侧的
v4 服务端**早已在树内且已接线**：`out/main/seam/acp-agent-adapter.js`（**1339 行**，D5c 批），
`out/main/index.js` 启动即置 `ZCODE_AGENT_SERVER_COMMAND` + `ZCODE_AGENT_SERVER_ARGS_JSON`
指向它，host `td.startClient`（`ZCodeAgentProcessManager`）按 workspace 派生
（`cwd = workspacePath`，每 workspace 一个 runtime 子进程）。因此「切 R1 还是 R2」不是待选项：
**R2 是既成事实**，且 host 的 93 个服务方法与全部 v4 机制（topic/ack/logEpoch/seq/frames/
subscription routes）都由它复用。§7 的「重写 93 方法」方案**作废**——那会丢弃 1339 行既有实现。
教训：切点判断必须先查树内既有实现（`grep ZCODE_AGENT_SERVER_COMMAND`），再谈方案。

**D6（已修）**：`out/main/index.js:8` 写死 `ZCODE_AGENT_SERVER_COMMAND = "/usr/bin/node"`，
本机不存在该文件 ⇒ `spawn /usr/bin/node ENOENT`（preflight 已明示 `commandExists:false`）⇒
host 侧一律表现为 `write EPIPE`、会话面整体闸死（§8）。更糟的是该赋值**短路了 host 自己的
回退链**：`resolveDefaultZCodeAgentCommand` 在 COMMAND 置位时直接返回、不再尝试
`resolveBundledWorkspaceZCodeAgentCommand`（bundled `zcode.cjs`）→
`resolveElectronRuntimeZCodeAgentCommand`（**Electron-as-node + `ELECTRON_RUN_AS_NODE:"1"`**，
打包态正解）→ `resolveDeployedZCodeAgentBinaryCommand`。
修法：`kernel-supervisor.js` 新增 `resolveNodeBin()`/`NODE_BIN`（`NOFY_NODE_BIN` → 非 Electron
时 `process.execPath` → `PATH` 扫描 → `/opt/homebrew/bin`、`/usr/local/bin`、`/usr/bin`，
逐个 `existsSync`+`X_OK` 校验）；main 只在解析到真解释器时置位，解析不到则**不置位**并 warn
（让 host 报「未配置」的诚实错误，而不是 ENOENT）。
**登记 L3（未修）**：打包态若机器无系统 node，须改走「注入 `zcodeAgentCommandResolver` +
`ELECTRON_RUN_AS_NODE`」——因为 COMMAND 分支返回的对象**不含 `env` 字段**，无法注入该变量；
在 host 进程环境里全局置 `ELECTRON_RUN_AS_NODE` 会污染 pty/其它子进程，已否决。

**修复后实测**（`NOFY_KERNEL_ATTACH=1 NOFY_OBS_AGENT=1`，`/tmp/nofy-obs/electron20.log`）：
- 命令解析 → `/opt/homebrew/bin/node`，preflight `commandExists:true`，**零** `ZCode agent process error`；
  内核 `kernel ready spawned ws://127.0.0.1:9800/...`（attach 形显式 opt-in，退出后 9800 归零）。
- `initializeWorkspace` → `{available:true, workspaceKey, protocolName:"ZCode Protocol", protocolVersion:1, transportKind:"stdio"}`（**软失败形转为成功形**）。
- `readWorkspaceState` → `{workspace{…}, settings{model{current,available}, thoughtLevel{enabled:false,available}, mode{current:"build"}}}`（真实数据）。
- `sendConversationCommandV4(createSession)` → `{commandId, status:"accepted", revisionAtDecision:0, result:{type:"createSession", sessionId:"01a079ec-abbb-…"}}`（**真会话**）。
- `subscribeConversationV4` → `{ack:{subscriptionId:"sub-4-16429", mode:"snapshot", logEpoch:"nofy-d5c-1"}}`。
- 推送面活了：`onDynamicSessionsIndexFrame` 多帧（`wireVersion:3, kind:"complete", deliveryKind:"initial"|"online", logicalFrameId, topic:"sessions-index//Users/mac/…"`）、
  `onDynamicConversationFrame` 3 帧（snapshot → deltas）。§8 的「推送 0 帧」已被推翻。
- UI（CDP）：健康首页恢复——问候语 + 输入器 + 「发送」回来，无 `write EPIPE`、无「重新连接」；模型门槛横幅仍无（D3 无回归）。

**真发 prompt（CDP 注入文本 + 点击发送）**：
- `sendConversationCommandV4(sendText)` → `{status:"accepted", revisionAtDecision:1, result:{type:"inputDisposition", delivery:"startNow"}}`。
- 帧 2：`row.appended` turnHeader（`state:"running"`, `turnId:"…-turn-1"`）+ 用户消息行。
- 帧 3：`row.upserted` turnHeader → **`state:"completedSuccess"`**（startedAt→endedAt 恰 4 秒）
  + `state.updated{control:{phase:"completedSuccess", sessionEnded:true, canStop:false, stopState:"idle", activeWorks:[], lastError:null}}`。
- UI：用户消息「请用一句话介绍你自己」上屏 + 「已工作 4 秒」，输入器转为后续追问占位。

**D7（新登记，未修）**：该轮**零助手文本行**——turnHeader 直接 `completedSuccess`、
`sessionEnded:true`、`lastError:null`，没有任何 agent 输出行。适配器 stderr 只进
`createAgentStderrTail()` 环形缓冲（不落主日志），故当前**无可观测证据**判定是
（a）内核未产出（prompt 未送达/模型侧失败被吞）还是（b）适配器未把 `agent_message_chunk`
映射成 `row.appended`。`sessionEnded:true` 亦可疑（单轮不应结束会话）。
下一步＝**probe10**：脱离应用直接派生适配器（`node acp-agent-adapter.js`，cwd=临时工作区），
以 v4 客户端身份发 `workspace/readState`→`session/create`→`session/send`，断言助手行到达；
同时把适配器 stderr 落盘。**在 probe10 绿之前不得声称会话主流程可用。**

**D7 已定位（2026-09-07，内核侧磁盘证据，二选一已判定）**：查
`~/.nofy/sessions/%2FUsers%2Fmac/01a079ec-abbb-…/chat_history.jsonl`（7 行）——
第 4 行是 `<user_query>请用一句话介绍你自己</user_query>`，**第 6 行是助手回复全文**
「我是 Nofy，一个运行在终端里的 AI 编程助手，可以读写你的代码、执行命令、调试和重构项目，
帮你把软件工程任务从头做到尾。」；`summary.json` 记 `num_messages:7`、
`current_model_id:"qwen3.8-max"`、`generated_title` 已生成。
⇒ **内核真的跑完了这一轮并产出了文本**（4 秒与 UI「已工作 4 秒」吻合），
故 D7 的成因**不是**「内核未产出」，而是**适配器未把 ACP `agent_message_chunk`
映射成 v4 会话行**（它只发了 turnHeader 行 + 用户行，随后 `completedSuccess`）。
另注：`updates.jsonl` 只持久化 `hook_execution` 类更新（7 行），流式 chunk 不落该文件，
故适配器侧取证要靠 probe10 的 stderr 落盘，不能靠这个文件。
修复面收敛为单文件：`out/main/seam/acp-agent-adapter.js`（1339 行）里
ACP `session/update` → v4 `row.appended/row.upserted` 的映射表。

**D8（新登记，未修）**：`subscribeSessionsIndexV4({workspacePath:"__home__", runtimePolicy:"existing-only"})`
×6 仍硬抛「ZCode Agent runtime is not running.」——`__home__` 是伪 workspace、没有 runtime 子进程；
首页「还没有对话」空态与此相关（真实 workspace 的索引帧是正常推送的）。
