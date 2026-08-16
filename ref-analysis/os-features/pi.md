# pi 源码深潜:grok-build OS-level Agentic 演进可吸收特性清单

> 调研对象:`/home/none/grok-build/ref/pi`(Pi monorepo 0.84.x,earendil-works)
> 目的:为 grok-build(Rust 终端 coding agent)的 OS-level agentic 演进抽取可吸收特性。
> 方法:全部条目均回源码核实,给出路径+行号;`ref-analysis/pi.md` 仅作线索。
> 层级口径:L1 常驻 / L2 跨域 / L3 系统面 / 治理 / 模型运营 / 生态 / 工程可信。
> 成本口径:S=单人周内,M=1-3 周,L=月级或需架构立项。

## 0. 总览

pi 对 grok-build 的独特价值不在执行面(工具/沙箱 grok 更强),而在三块:

1. **纪律严明的多客户端控制面协议**(protocol/server/client 三包 ~3800 行):
   帧编解码、版本协商、快照权威、传输层认证、会话租约,全有字节级 conformance
   测试——正是 grok-build "Hub/ACP/serve 三协议收敛"(proposal 原则 3)缺的参照。
2. **harness v4 崩溃恢复设计**(docs/harness.md 2941 行 spec):三存储模型、
   durable program counter、effect sandwich、崩溃位置表——目前**只有 spec 与
   存储层实现,解释器未实现**(`agent-harness.ts` 核心方法全部
   `HarnessNotImplemented`):吸收原则而非代码,风险可控。
3. **模型运营的机械细节**:samplingParams 逃逸舱、OAuth 双检锁刷新、模型目录
   generation 缓存、faux 脚本化回放、约束采样——脱敏 P0 直接可用。

特性清单 25 条,分组:A 控制面协议与传输(F1-F8)、B 持久化运行时(F9-F12)、
C 跨域状态(F13-F15)、D 系统面与治理(F16-F18)、E 模型运营(F19-F23)、
F 表面渲染与遥测(F24-F25)。优先级汇总见 §2,不吸收清单见 §3。

---

## 1. 特性清单

### A. 控制面协议与传输(L1/L3)

#### F1. 长度前缀帧 + 增量 FrameDecoder(任意分片/合包,fail-sticky)

- **源**:`packages/protocol/src/framing.ts:1-165`、`codec.ts:25-39,88-127`
- **机制**:wire = `[uint32 BE 长度][payload]`。`FrameDecoder.push(chunk)` 是纯增量
  状态机:头 4 字节逐字节攒,正文按 64KB block 累积(`PAYLOAD_BLOCK_SIZE` L3),
  帧完成时单 block 直接交出、多 block 拼接(L124-141),避免一次性大分配;
  `maxFrameLength` 默认 16MiB(L6)超限即 fail。`end()` 检测截断帧(L146-153)。
  `fail()` 清空全部缓冲并置 `failed` 态(L155-164),之后任何 push/end 都抛错——
  **fail-sticky:解码器一旦失败永不复位**。`codec.ts` 的 `ValidatedMessageDecoder`
  把帧解码、CBOR 解码、schema 校验串成一条流水线,同样 fail-sticky(L89 `failed`
  标志,L101-102 失败后拒绝继续);`isProtocolValue`(L25-39)先拒绝循环引用与非
  plain object 再走 schema Check,防止校验器被怪异结构探测。
- **有效性**:protocol 包 33 个测试(framing 10 + protocol 17 + cbor 6);
  server conformance 用真实 socket 发 2 片 hello 验证(`server/test/conformance.test.ts:46-52`)。
- **对 grok-build 的价值**:L3/控制面。Hub WS 目前无统一帧纪律;daemon 化后
  TUI/Web/IM 桥共用一条字节协议,分片/合包/超限/中毒连接是必须处理的四个角。
- **Rust 吸收**:`xai-grok-hub-protocol` 内实现 `impl Decoder for FrameCodec`,
  或直接 `tokio_util::codec::length_delimited`(u32 BE)+ 校验层;fail-sticky 用
  codec 进入 `Poisoned` 态后对所有后续调用返回同一错误。帧上限做成连接级配置。
- **成本** S;**风险**:低(纯本地逻辑);**优先级 P0**。

#### F2. hello 版本协商 + hello 即携带全量快照(含 revision 竞态补偿)

- **源**:`packages/protocol/src/schemas.ts:3,384-389,412-418`;`packages/server/src/server.ts:35,124-131,221-250`
- **机制**:`PROTOCOL_VERSION = 1` 是整数字面量("intentionally an integer, not a
  coercible string",L384)。首帧必须是 `hello{version}`,否则 `invalid_request`
  关连接;版本不支持回 `hello_error{code:"version"}` 并以 finalChunk 关闭
  (server.ts L313-328)。握手成功时 **ServerHello 直接内嵌完整 `ServerSnapshot`**
  (serverId/protocolVersion/revision/sessions/models,L412-418)——重连拿到 hello
  即拥有全部真相,无需二次拉取。握手 5s 超时(L35)。关键细节:发完 hello 后若
  `snapshot.revision !== currentRevision`(握手期间恰好发生广播),立即补发最新
  `server_snapshot`(L242-249),消除"快照过期一帧"窗口。
- **有效性**:conformance 覆盖版本拒绝、重复 hello、非首帧 hello
  (`server/test/conformance.test.ts:54+` 起连续用例)。
- **对 grok-build 的价值**:L1/L3。grok 断线恢复目前靠 ACP `StdioReplayState`
  重放;"重连 = hello + 全量快照"使任何表面恢复都是 O(1) 往返,且天然支持
  新表面中途加入。
- **Rust 吸收**:hub 协议 v1 定义 `Hello{version: u32}` / `HelloAck{daemon_id,
  revision: u64, snapshot: DaemonSnapshot}`;revision 竞态补偿 = 发送前在
  snapshot store 上加版本号比较,不一致则追发 event。
- **成本** S;**风险**:低;**优先级 P0**。

#### F3. 快照权威 vs progress 仅为 UI hint(协议级契约)

- **源**:`packages/protocol/src/schemas.ts:203-231,241-258`;`packages/protocol/README.md:10`;`packages/client/README.md:22-24`
- **机制**:README 原文:"Session and server snapshots are authoritative. Progress
  events are transient UI hints and **must not be reduced into authoritative
  state**"。schema 上 `TranscriptProgress`(item_started/assistant_delta/
  item_updated/item_finished,L204-231)与 `SessionSnapshot`(revision/phase/
  attached/locked/transcript/queuedSteer,L241-258)地位不同;每个命令的响应
  也携带最新快照(`CommandResult` 各分支均含 `session`,L329-377),服务端每
  次操作后广播快照(`server/src/sessions.ts:171-184`)。客户端 README 明确
  "progress events do not mutate snapshot state optimistically"。
- **有效性**:client 状态层 `state.ts`(156 行)只对 snapshot/result 做 apply,
  progress 仅分发(`client/src/client.ts:294-318` #handleMessage)。
- **对 grok-build 的价值**:L3 多表面一致性的根基。TUI 要 token 级流式,IM/Web
  可以只消费快照;progress 可丢、快照不可丢,使"手机审批、回 TUI 继续"不需要
  事件级可靠投递。grok Hub 目前事件与状态边界模糊,此契约应写进协议文档第一条。
- **Rust 吸收**:协议 enum `HubMsg::Snapshot{revision}` 与 `HubMsg::Progress{..}`
  分离;客户端 reducer 只接受 Snapshot 改变状态,Progress 只进渲染通道。
- **成本** S(纪律)/ M(落地);**风险**:低;**优先级 P0**。

#### F4. 认证在传输层:Unix 0600 + 原子 bind + stale 检测(dev/ino 身份)

- **源**:`packages/server/src/transports/unix/listener.ts:11,62-99,162-196,307-309,312-341,351-377`;`packages/server/README.md:34`;`packages/protocol/README.md:10,50`
- **机制**:协议字节里**没有任何认证字段**——"Transports complete authentication
  before protocol bytes are exchanged"。Unix listener 的认证就是文件权限
  (`DEFAULT_SOCKET_MODE = 0o600`,目录 0700)。bind 防 TOCTOU:先 bind 私有路径
  `.p-<sha256(path)[:8]>`(L307-309),`lstat` 记录 dev/ino 身份,再 `link()` 到
  公开路径(L91)后 `chmod`(L92)——公开路径上从不出现未设权限的 socket。
  stale socket 处理(L312-341):必须是 socket → `isSocketLive` 探针连接
  (L351-377,ECONNREFUSED 等判死,1s 超时视为活)→ rename 到 `.s-xxx` 保留 →
  **复核 dev/ino 未变**才 unlink;路径被换掉则恢复并报错。关闭时
  `cleanupOwnedSocket`(L162-196)同样只删 dev/ino 匹配的 socket,防止删掉接管者。
- **有效性**:unix.test.ts 5 + unix-connection.test.ts 2 + listener.test.ts 2,
  另有 `test/fixtures/stale-socket-server.mjs` 专门 fixture。
- **对 grok-build 的价值**:L1 治理。per-host daemon 的 Unix socket 是最高价值
  攻击面;grok 现有 hub_auth 是 token 语义,叠加文件权限后"同机同用户即信任、
  跨用户零信任"不依赖任何密钥分发。原子 bind/dev-ino 校验直接可抄。
- **Rust 吸收**:`trait DaemonListener { fn start(accept: impl Fn(ByteConn)) }`;
  Unix 实现 bind 私有路径 + `fs::rename`(同 fs 原子)+ `fstat` 身份复核;
  WS listener 在 upgrade 阶段鉴权。
- **成本** M;**风险**:中(socket 生命周期竞态需测试覆盖);**优先级 P0**。

#### F5. 字节连接背压与优雅关闭(串行写链 + maxPendingBytes + finalChunk)

- **源**:`packages/server/src/transports/unix/listener.ts:203-302,404-434`
- **机制**:`UnixByteConnection` 用 `writeTail` promise 链串行化所有写
  (L211,L235-239);`pendingBytes` 超过 `maxPendingBytes`(默认 4×
  maxFrameLength,L416-419)直接拒绝该写(L229-231)——慢客户端不能无限吃
  服务端内存。`close(finalChunk)` 先等写链排空再 `socket.end(finalChunk)`,
  5s 优雅超时后 destroy(L244-276);`hello_error` 靠 finalChunk 保证送达。
- **有效性**:unix-connection.test.ts 覆盖背压与关闭路径。
- **对 grok-build 的价值**:L3。Hub WS 面对慢表面(弱网 IM 桥)需要同样的
  有界发送队列;否则一个卡死客户端可拖垮 daemon 内存。
- **Rust 吸收**:每个连接 `mpsc::channel(bounded_n_frames)` + sender task;
  `try_send` 失败即按协议错误断开;关闭 = 发完队尾再 close。
- **成本** S;**风险**:低;**优先级 P1**。

#### F6. SessionLease:独占/共享租约 + generation 失效 + 释放失败对账

- **源**:`packages/client/src/client.ts:39,143,151-178,209-290,321-328,364-379,381-411`;`session-handle.ts:13-33`;`client/README.md:26-33`
- **机制**:客户端对每个会话持引用计数租约,`mode: "shared" | "exclusive"`;
  独占与任何存量租约冲突、共享与独占冲突,均本地即拒(`#reserveSessionLease`
  L381-394)。每个租约闭包绑定 **generation**(L210-224):`session_removed` 或
  断线时 generation +1,旧租约静默失效为 `invalidated`(L402-411),避免僵尸
  句柄操作已死会话。释放时引用计数归零才发 `detach`(L237-252);detach 失败
  标记 `sessionCleanupRequired`,下次 acquire 前补发(`#reconcileSessionCleanup`
  L364-379)——**客户端自愈服务端残留 attach**。断线时 clearAttachments + 全量
  失效 + pending 统一 reject(L321-328)。`createSession` 返回独占租约,
  `attachSession` 是共享便捷入口(L143,151)。
- **有效性**:client 测试 36 个(connection 14/disposal 3/requests 3/
  sessions 7/state 4/unix 5),disposal 用例专门覆盖租约失效路径。
- **对 grok-build 的价值**:L2/L3 跨表面会话所有权。语义直接映射:TUI 驱动者
  持独占租约,IM/Web 观察者持共享租约;审批表面是共享租约 + 一次性授权命令。
  grok 的 `foreign_sessions` 目前只发现不管理,租约是"管理"的最小原语。
- **Rust 吸收**:hub client crate `struct SessionLease { id, mode, generation:
  Arc<AtomicU64> }`,`Drop` 触发 detach(失败记入 reconcile 队列);daemon 侧
  attach 集合已有(`LiveSession.connections` 对应物)。
- **成本** M;**风险**:中(失效语义需属性测试);**优先级 P1**。

#### F7. LiveSessionManager:多连接 attach、空闲即 dispose、冲突拒绝不排队

- **源**:`packages/server/src/sessions.ts:8-18,171-184,186-208,275-288,309-318,324-346`;`types.ts:41-60`
- **机制**:`PiSessionRuntime` 契约:"Conflicting operations must reject
  rather than queue"(L41)——忙时返回 `busy` 错误而非隐式排队,排队语义由
  客户端显式选择(协议里 steer/followUp 队列是显式的)。`acquire`(L186-208):
  已存在则复用(terminating 则 `session_locked`),正在 dispose 则 await 后
  重试,并发 open 用 `openingSessions` map 去重。同一会话可被多连接同时
  attach,progress/snapshot 广播给全体。`maybeDispose`(L324-346):仅当**无
  连接、无在飞操作、phase==idle** 才释放 runtime——持久状态不丢。
  `normalizedSnapshot`(L275-288):服务端覆写 `attached/locked/phase`,runtime
  不关心谁在看。
- **有效性**:sessions.test.ts 12 个用例,含并发 attach/detach/dispose 竞态。
- **对 grok-build 的价值**:L1/L2。Leader 上提为 per-host daemon 后,这正是
  "daemon 管理 N 个执行单元"的生命周期语义:谁在看、何时回收、忙时拒绝。
- **Rust 吸收**:daemon crate `struct LiveSession { runtime: Box<dyn
  DaemonSessionRuntime>, watchers: HashSet<ConnId>, op_count: usize }` +
  `trait DaemonSessionRuntime { fn snapshot(); fn phase(); fn subscribe(); }`。
- **成本** M;**风险**:低;**优先级 P1**。

#### F8. DTO 编译期字段清点(ExactKeys 断言,新增字段强制 review)

- **源**:`packages/server/src/protocol.ts:24-106`
- **机制**:pi-ai ↔ wire 的 DTO 桥接前,用类型级断言把每个源类型的字段
  **全量清点**:`type _AiModelFieldsAccountedFor = Assert<ExactKeys<Model<Api>,
  "id" | "name" | ... | "compat">>`。上游类型新增任何字段,此文件编译失败,
  强制开发者决定"映射过去还是有意留在服务端";注释(L32-37)列出有意不传的
  字段(replay metadata、diagnostics、sampling defaults 等)。
- **有效性**:编译期强制,无运行时成本;server 包全部 DTO 函数受其保护。
- **对 grok-build 的价值**:工程可信。grok 有 ACP/Hub/serve 三个协议面,字段
  漂移是收敛过程的最大隐患;"桥接层穷举字段"纪律可直接移植。
- **Rust 吸收**:Rust 等价物是**穷尽解构**——桥接函数写 `let Model { id, name,
  api, .. } = model;` 时不带 `..`,新增字段即编译错误;或 `#[non_exhaustive]`
  反向控制。写一个 `dto_guard!` 宏生成 match 断言亦可。
- **成本** S;**风险**:无;**优先级 P2**(协议收敛启动时升 P1)。

### B. 持久化运行时(L1 常驻)

#### F9. 三存储模型 + durable program counter + effect sandwich(harness v4 核心)

- **源**:`packages/agent/docs/harness.md:111-137`(§0.3)、`965-1037`(§3.2)、`1530-1600`(§4.1);`packages/agent/src/harness/agent-harness.ts:74-84,182-198,351`
- **机制**:一切持久态只有三种存储:**entries**(write-once 会话树)、
  **registers**(命名空间化可变单元,覆写即弃旧值)、**usage ledger**(append-only
  成本流水),"no third place"。每个操作(run/compaction/navigation)的当前状态
  **整体**存于 `op.state/{operationId}` 寄存器:每次转移覆写全量,终态事务删除
  ——"The state is total — it never depends on a previous state",恢复不回放日志、
  不推断缺失,只读这一个寄存器(故称 durable program counter)。外部副作用用
  **effect sandwich** 包裹:commit 意图("about to do X; output will use ids R
  and U",**预先铸好结果 id**)→ 执行不确定部分 → commit 结算(输出+usage+
  下一状态)。hooks 是另一契约:结果在消费它的事务里才持久化,崩溃后可重跑。
- **实现差距(重要)**:spec 2941 行,但 `agent-harness.ts` 的 prompt/compact/
  resume/abort/steer 等全部 `HarnessNotImplemented`(L74-84,L356-448),
  `create()` 遇历史记录直接拒绝恢复(L351)。已实现的只有:Session 树/storage
  抽象、reducer 腐败分类、sqlite 后端(writer lease/FTS)。
- **有效性**:设计自洽性由 §9 不变式+竞态目录支撑;存储层有 50+ 测试。
  其有效性证据是**设计完备性**(崩溃位置可穷举)而非运行记录。
- **对 grok-build 的价值**:L1 最高价值设计资产。grok 的 recovery 目前是 hunk
  级转录恢复;"daemon 崩溃不丢在飞工作"需要操作级状态机。三原则直接吸收:
  ①持久化完整当前态而非增量日志 ②副作用前预铸 id + 意图/结算两阶段提交
  ③恢复=读不是回放。
- **Rust 吸收**:不整体移植。`xai-grok-session` 增加 `trait OpStateStore {
  fn put_state(op_id, &OperationState); fn get_state(op_id) }`,OperationState
  为 serde 全量快照 enum;工具执行器包一层 `intent(effect_id) → run →
  settle(effect_id)`。
- **成本** L(全量)/ M(原则落地);**风险**:pi 自身未实现,无参照实现可
  对照,须小步验证;**优先级 P1**。

#### F10. 崩溃位置表 + 唯一不确定窗口 + 工具 replay 声明

- **源**:`packages/agent/docs/harness.md:180-205`(§0.5)、`1894-1917`(§4.5);`packages/agent/src/harness/agent-harness.ts:237`
- **机制**:原子事务无内部前缀,对任何重复敏感副作用,崩溃位置可穷举为 9 类
  (intent 前/intent 后 dispatch 前/效果中/结算后/队列应用前后/结构提交前后/
  abort 首提交后/终态提交后),每类有确定恢复动作。**全系统唯一不确定窗口 =
  intent 已持久、结算未持久**,三条策略覆盖:①生成类 effect_pending → 仅当
  **捕获的**重试策略允许才发起更晚编号 attempt,否则在预留 id 下写合成 error;
  ②工具 effect_pending → 仅当持久化声明**与**当前声明**都说 safe** 才用持久化
  参数重放,否则在预留结果 id 下写合成 "interrupted";③deferred → 等下次
  resume。工具在类型上声明 `replay?: "never" | "safe"`(agent-harness.ts L237)
  ——删文件的工具声明 never,读类声明 safe。§0.5 worked example:崩溃后"每个
  tool call 都有结果、没有任何东西跑两次"。
- **有效性**:设计论证(§4.5 表)+ reducer.ts 已实现的腐败分类
  (`agent/src/harness/reducer.ts:22-34`,12 种 RecordLogCorruptionReason)。
- **对 grok-build 的价值**:L1。grok 的 bash/write/edit 工具崩溃后重放语义目前
  隐式;"replay 声明 + 预铸结果 id + 合成 interrupted"可直接落在工具层,与
  Landlock 沙箱正交。
- **Rust 吸收**:`trait Tool { fn replay_policy(&self) -> ReplayPolicy }`,
  `enum ReplayPolicy { Never, Safe }`;执行记录带 `reserved_result_id`。
- **成本** M;**风险**:低;**优先级 P1**。

#### F11. Restore=点查 + close=受控崩溃 + fault 隔离

- **源**:`packages/agent/docs/harness.md:1805-1858`(§4.4)、`1937-1955`(§4.7)、`1956-1959`(§4.8)
- **机制**:恢复 = 每 lane **5 次寄存器点查**(lane.config/lane.state/lane.leaf
  + 有操作时的 op.meta/op.state),然后**有界水合**:只批量取状态直接命名的
  entry/register;明确禁止读历史(不存在)、折叠、扫表、从缺失推断——
  "Recovery is a read. No reducer exists to have a bug." **close 不是 abort**:
  close 不写任何东西——封准入、拉信号、等已准入提交排空、关存储;持久态停在
  effect_pending,与进程被杀同形,复用 §4.5 策略,无 close 专属恢复机制。
  fault 语义:存储提交失败 → 整个 harness fault;provider/tool/hook 失败保持
  per-lane in-band;应用侧确定性计算抛错视为应用缺陷,fault 整机。
- **有效性**:设计论证;reducer 腐败分类已实现并有 16 个测试
  (`agent/test/harness/reducer.test.ts`)。
- **对 grok-build 的价值**:L1。①daemon 优雅重启 = "受控崩溃"语义,与崩溃
  恢复共用一条路径——grok 的 restart 逻辑可因此减半;②"腐败分类 + 拒绝修复
  继续"对应 grok recovery.rs 应枚举损坏种类而非兜底重写。
- **Rust 吸收**:recovery 路径写为 `fn restore(lane) -> Result<Idle |
  Suspended<CurrentOp>, Corruption>`;fault 用 `DaemonFault` 顶层 enum 熔断。
- **成本** M;**风险**:低;**优先级 P1**。

#### F12. Entry/Record 分离 + lane 指针 + write-once 树 + 可序列化断言

- **源**:`packages/agent/src/harness/session/types.ts:14-22,67-80,203-211,290-326,361-375`;`session/session.ts:42-100`;`docs/harness.md:139-178`(§0.4)
- **机制**:会话 = **Entry 树**(write-once:message/model_change/thinking_level_
  change/active_tools_change/compaction/branch_summary/custom;`id/seq/parentId/
  timestamp` 由存储指派)+ **Record 流水**(operation_started/step_attempt/
  tool_started/queue_*/write_deferred/usage 操作记账,带 lane 维度)——对话内容
  与操作审计两条流互不污染。lane 是树的命名游标(每会话必有 main),§0.4 Slack
  线程例子:400 条历史的频道为每个线程 `createLane("slack:…", at: leaf)`,线程间
  零协调。`ProvisionedEntry`:写入前预铸 id、存储后补 placement。
  `findOpenOperations(lane, {limit: 2})`:0=idle,1=suspended,2=腐败(L313-319)。
  所有持久 payload 过 `assertJsonSerializable`(session.ts L42)。
- **有效性**:session 测试 50 个(jsonl 27 + codec 9 + storage 5 + memory 2 +
  search 4 + context 3);sqlite 后端再跑一遍 conformance。
- **对 grok-build 的价值**:L2。①grok 会话模型是线性 messages,Entry/Record
  分离让"审批事件、IM 注入、调度触发"作为 entry 落树(model-visible⟺logged
  的结构基础);②lane 是"一个会话内多表面并行"(Slack 线程=IM 渠道)的现成
  答案;③fork/branch 支持"从某条消息重开"。
- **Rust 吸收**:`enum Entry`/`enum LaneRecord` + serde;`trait SessionTree`
  带 `lane_leaf(lane)`、`append_entry(provisioned, lane)`;JSONL v3 兼容层
  保留(pi 附录 B 有 v3 兼容 spec 可参照)。
- **成本** M;**风险**:中(会话格式迁移);**优先级 P1**。

### C. 跨域状态(L2)

#### F13. SQLite fenced writer lease:单写者从约定变成强制属性

- **源**:`packages/session-backends/sqlite-node/src/sqlite/storage/writer-leases.ts:16-54`;`repo.ts:129-136,381-413`;`docs/harness.md:555-570`
- **机制**:`writer_leases(session_id, owner_id, fence, expires_at_ms)`。
  acquire = `INSERT ... ON CONFLICT DO UPDATE ... WHERE expires_at_ms <= now`,
  接管时 **fence +1**(L23-30)——只有过期租约可被抢;renew 必须匹配
  `owner_id AND fence AND expires_at_ms > now`(L41-46),失败即
  `lostWriterError` 熔断该会话写入(repo.ts L381-387);release 只删匹配
  `(owner_id, fence)` 的行(L51-54)——**过期旧主无法释放继任者的租约**。
  心跳在 append 与空闲期续租(repo.ts L395-413)。spec 原话:这使"one process
  owns one session"成为 enforced property 而非被信任遵守的 convention。
- **有效性**:writer-leases.test.ts 6 个用例覆盖抢占/续租/误释放。
- **对 grok-build 的价值**:L2 全局会话注册表的写一致性(对应 proposal 借鉴
  清单 #7 writer-run)。fencing token 比文件锁强:进程假死恢复后继续写会被
  fence 不匹配拒绝。
- **Rust 吸收**:全局 registry sqlite 原样照抄表结构(rusqlite/sqlx 均易实现);
  `BEGIN IMMEDIATE` 纪律(spec §1.7 L555-560:避免 deferred BEGIN 的
  stale-snapshot 升级失败)一并照抄。
- **成本** S;**风险**:低;**优先级 P0**。

#### F14. FTS5 trigram 会话检索:懒建表 + 触发器同步 + 一次性重建

- **源**:`packages/session-backends/sqlite-node/src/sqlite/search-backend.ts:43-47,61-89,127`
- **机制**:全文索引不在建库时创建,而是**首次搜索时** `ensureSearchSchema`:
  一个事务内 `CREATE VIRTUAL TABLE ... fts5(payload, content='entries',
  tokenize='trigram remove_diacritics 1')` + AFTER INSERT/DELETE/UPDATE 三个
  触发器(L69-86);若 entries 已存在则一次性 `rebuild`(L87)——老库无痛升级。
  之后写入靠触发器自动同步。库配置 `WAL + synchronous=FULL + busy_timeout=5000`
  (L43-47)。trigram tokenizer 不依赖空白分词,对 CJK 天然可用。
- **有效性**:search.test.ts 14 个用例。
- **对 grok-build 的价值**:L2 跨会话检索工具(proposal #6)。trigram 比
  hermes 的自研 CJK tokenizer 更省事,且 grok 已选 sqlite 一贯到底。
- **Rust 吸收**:`rusqlite` 开 `bundled` feature(含 FTS5);懒迁移逻辑照抄。
- **成本** S/M;**风险**:低(trigram 索引体积较大,会话量级下可接受);
  **优先级 P1**。

#### F15. 会话后端 conformance 套件:runner 无关、任何后端跑同一套

- **源**:`packages/agent/src/harness/session/testing/conformance.ts:92`(1016 行);`testing/types.ts:1-16`;sqlite 侧 `session-backends/sqlite-node/test/conformance.test.ts`
- **机制**:`createSessionBackendConformance(fixtureFactory)` 返回一组
  runner 无关用例(用 `node:assert` 而非 vitest,任何测试框架可宿主);
  fixture = 每个用例一个全新隔离后端实例(AsyncDisposable)。memory/JSONL/
  SQLite 三后端跑同一套语义测试:树结构、lane 移动、record 查询、fork、
  错误码契约。telemetry 包同构:`createTelemetryAdapterConformance`
  (`packages/telemetry/src/testing/conformance.ts:61`)。
- **有效性**:三个后端确实共用该套件;sqlite 包 52 个测试多数源于此。
- **对 grok-build 的价值**:工程可信。grok 的记忆/会话后端要 trait 化
  (MemoryBackend 已有雏形),conformance 套件保证 file/sqlite/未来远端后端
  语义一致——这是"执行世界可换"的存储侧配套。
- **Rust 吸收**:共享测试 crate 提供 `fn session_backend_conformance<B:
  SessionBackend>(factory: impl Fn() -> B)`,各后端 `#[test]` 调用;
  Rust 里用泛型测试函数即可,无需宏。
- **成本** M;**风险**:低;**优先级 P2**。

### D. 系统面与治理(L3/治理)

#### F16. 扩展钩子面:tool_call 阻断/终止、InputSource 表面标记、agent_settled 时机

- **源**:`packages/coding-agent/src/core/extensions/types.ts:828,831-838,1071-1081,1203-1244,723-725`;`docs/harness.md:2479-2560`(§5.6 HookMap)
- **机制**:26 个 `on(event)` 钩子(L1203-1244)覆盖会话/代理/工具/模型全周期。
  对 OS 面最有用的是四个:①`tool_call` 结果可 `block + reason`,`terminate`
  提示"本批工具全部被阻断且都要求终止时提前收轮"(L1071-1081)——跨表面审批
  的拦截点;②`InputEvent.source: "interactive" | "rpc" | "extension"`(L828)
  ——每条输入带表面来源标记,审计与路由的基础;③`agent_settled`(L723-725)
  在状态**持久化落定**后触发,区别于 streamed 事件,可做"落盘后才通知 IM";
  ④harness v4 HookMap 把 before_tool/after_tool/before_request 等 11 个钩子的
  结果持久化语义定义清楚(结果在消费事务落盘,崩溃可重跑)。另有
  `ExtensionUIContext`(L129-131:"Each mode (interactive, RPC, print) provides
  its own implementation"):select/confirm/input/notify/setWidget 等 UI 调用由
  运行模式各自实现——同一扩展代码在 TUI 与 headless RPC 下都能工作。
- **有效性**:79 个示例文件(`coding-agent/examples/extensions/`)验证 API 面;
  evals 包含 extensions.eval.ts。
- **对 grok-build 的价值**:L3 + 治理。跨表面审批 broker 可直接建在
  before_tool-block + 表面标记输入之上;grok 已有 hooks(docs/06)但缺表面
  来源标记、settled 时机、headless UI 能力抽象三件。
- **Rust 吸收**:`enum HookEvent` + `trait HookHost`;审批 = before_tool 钩子
  返回 `Decision::{Allow, Deny{reason}, Ask{surfaces}>`。
- **成本** M;**风险**:低;**优先级 P1**。

#### F17. Project trust 闸门:信任只守输入加载,决策带层级

- **源**:`packages/coding-agent/src/core/trust-manager.ts:29-37,43-58,66-84`;`extensions/types.ts:519-543`;`docs/security.md`("No Built-in Sandbox")
- **机制**:trust 只回答一个问题:**项目提供的输入是否允许加载**——
  `TRUST_REQUIRING_PROJECT_CONFIG_RESOURCES` = settings.json/extensions/skills/
  prompts/themes/SYSTEM.md/APPEND_SYSTEM.md(L29-37)。决策存 trust.json,
  查找用**最近祖先遍历**(L43-58),支持"信任父目录"(L66-84);文件写用
  proper-lockfile 防并发;扩展可注册 `project_trust` handler 参与决策(L538)。
  运行时工具调用**不做**审批——pi 把隔离推给容器/OS,与 grok 沙箱哲学一致。
- **有效性**:main.ts 启动链强制检查;非交互模式有 defaultProjectTrust 策略。
- **对 grok-build 的价值**:治理。OS agent 会加载越来越多外部输入(全局 skill、
  渠道配置、workflow 定义),grok 需要一个"输入信任层"与 Landlock"执行隔离
  层"正交并存;层级化信任(信任 ~/projects 一次)避免逐目录询问。
- **Rust 吸收**:`xai-grok-trust`:JSON 决策表 + 祖先遍历 + fs2 文件锁。
- **成本** S;**风险**:低;**优先级 P2**。

#### F18. PI_OFFLINE:单一布尔闸断所有启动网络操作

- **源**:`packages/coding-agent/src/main.ts:572-574`;消费点:`utils/version-check.ts:55`、`modes/interactive/interactive-mode.ts:1015,1106,1202`、`core/model-runtime.ts:196`、`core/package-manager.ts:44`、`utils/tools-manager.ts:16`
- **机制**:`--offline` 或 `PI_OFFLINE=1` → 置 `process.env.PI_OFFLINE="1"`,
  所有启动期网络操作(版本检查、远端目录刷新、包管理器、工具管理器)各自
  检查该标志并跳过;无中心调度,靠约定 + 文档。
- **有效性**:六个消费点全部显式检查;CI/容器场景依赖此模式。
- **对 grok-build 的价值**:治理/隐私。proposal 风险登记已列 GROK_OFFLINE;
  脱敏验收("网络出口白名单测试")在 offline 档下应是全绿的,这是最便宜的
  回归基线。
- **Rust 吸收**:`GrokConfig.offline: bool` 传入所有 egress 点;比 pi 的 env
  约定更强——Rust 里做成类型参数/依赖注入,漏检即编译错误。
- **成本** S;**风险**:无;**优先级 P1**。

### E. 模型运营

#### F19. faux provider:脚本化回放 + 请求感知工厂 + 前缀缓存 usage 模拟

- **源**:`packages/ai/src/providers/faux.ts:97-156,220-268,269-281,292-301`(708 行)
- **机制**:测试用 provider 注册进真实 Models 注册表。响应队列
  `setResponses/appendResponses`(L138-143),每步是 `AssistantMessage |
  FauxResponseFactory`(L107-112)——**工厂函数拿到真实请求 context、stream
  options 与调用状态(callCount)再决定回什么**,可表达"第二次调用时看到工具
 结果后给出 X"这类条件剧本。流式按随机 token 尺寸切块限速回放
  (`splitStringByTokenSize` L269-281)。usage 不是假的:把 context 序列化后与
  **该 sessionId 上一次 prompt 求公共前缀**(`commonPrefixLength` L220-268)拆出
  cacheRead/cacheWrite——**前缀缓存的经济行为在离线也被模拟**。deferred
  响应也能脚本化(pendingFetches/pollAfterMs,L121-124)。
- **有效性**:整个 pi 测试体系的 LLM 替身;e2e/harness 测试无 API key 运行。
- **对 grok-build 的价值**:工程可信 + 模型运营。daemon/调度/审批链路 e2e
  必须无 key(proposal #11);"请求感知剧本 + 缓存经济模拟"是参照上限,至少
  照抄剧本队列。
- **Rust 吸收**:`struct FauxProvider { steps: VecDeque<FauxStep> }` 实现
  StreamFn trait;`FauxStep::Scripted(msg) | ScriptedFn(Box<dyn Fn(&Context,
  &State) -> Message>)`。
- **成本** M;**风险**:低;**优先级 P0**(CI 地基,越早越省)。

#### F20. refreshModels 两阶段 + generation 发布链 + 条件再校验 schema

- **源**:`packages/ai/src/models.ts:350-365,367-381,384-430`;`models-store.ts:3-14`;`models.generated.ts:1-124`;`scripts/generate-models.ts`(2948 行)
- **机制**:模型目录刷新分两阶段:**阶段 1 离线恢复缓存**(allowNetwork=false,
  L410-411 "Restore cached provider state before auth resolution or network
  access")——启动永远快且断网可用;阶段 2 有凭据才联网(L417)。每 provider
  有 **generation 计数器 + AbortSignal**,发布前检查 generation 未过期(L354),
  发布经**串行 promise 链**(L350-365)——刷新中的目录永不半新半旧。
  `ModelsStoreEntry`(models-store.ts L3-14)为条件再校验预留 `lastModified`/
  `etag`(opaque,原样回送 If-None-Match)/`checkedAt`。静态目录由
  `generate-models.ts` 从 models.dev + 厂商 catalog 生成到 `models.generated.ts`
  (头两行禁止手改),`model-data.ts` 的 `assertExactModelIds`/
  `validateGeneratedModelData`(L42,127,277)在 CI 校验生成物完整性。
- **有效性**:check-model-data.ts 作为 CI 门禁;/model 选择器每次打开热重载。
- **对 grok-build 的价值**:模型运营。对应 proposal 原则 4"generation 快照":
  daemon 热加载模型路由时运行中会话从旧快照 fork,新旧不混发;两阶段刷新
  与 GROK_OFFLINE 天然配套。
- **Rust 吸收**:`ArcSwap<ModelCatalog>` + `generation: u64`;刷新任务
  持 generation token,发布前比对;生成链保留模式(脚本生成 + CI 校验),
  数据源换本地 models.json。
- **成本** M;**风险**:低;**优先级 P1**。

#### F21. CredentialStore.modify 串行 RMW + OAuth 双检锁刷新

- **源**:`packages/ai/src/auth/credential-store.ts:7,14-28,40-55`;`packages/ai/src/auth/resolve.ts:44-48,70-110,119-179`
- **机制**:`CredentialStore` 的**唯一写路径是 `modify(providerId, fn)`**
  (read-modify-write),每 provider 一条 promise 链串行化(L14-28),杜绝并发
  写覆盖。OAuth 刷新用**双检锁**(resolve.ts L122-179):乐观检查 `expiresSoon`
  (剩余 <5min,L119)→ modify 锁内重查("another process/request refreshed",
  L147)→ 刷新(15s 超时 ∧ 调用方 signal,L149-153)→ 锁内持久化旋转凭据 →
  锁外校验 minOAuthValidityMs(L166-171)。解析顺序固化(L70-110):请求级
  override > 已存凭据 > ambient env,且"stored credential owns the provider"
  ——有存储凭据时**不静默回落 env**(L44-48),防止刷新失败后偷偷用旧 key。
- **有效性**:auth 相关测试覆盖刷新竞态(ai/test 138 文件中 auth 系列)。
- **对 grok-build 的价值**:模型运营/治理。daemon 下多会话并发请求同一
  BYOK provider,双检锁防止 double-refresh 把 OAuth refresh_token 烧掉
  (许多 IdP 刷新即旋转);grok 目前单进程语义,上 daemon 前必须补。
- **Rust 吸收**:`trait CredentialStore { async fn modify(&self, provider, f) }`,
  内部 per-provider `Mutex`;解析顺序 enum 化。
- **成本** S/M;**风险**:低;**优先级 P1**。

#### F22. samplingParams 逃逸舱合并 + maxTokens 上下文钳制 + thinking 预算

- **源**:`packages/ai/src/api/simple-options.ts:15-19,27-30,61-86`;`packages/ai/src/types.ts`(StreamOptions.samplingParams 注释,L175-219 区段)
- **机制**:`samplingParams` 合并 = `{ ...model.samplingParams,
  ...options?.samplingParams }`(L27-30):模型级默认 ∪ 请求级按 key 覆盖,
  **原样注入请求体**——专为 vLLM/llama.cpp/SGLang 等后端传 pi 未建模的参数
  (top_p/min_p/repetition_penalty…),不穷举、留逃逸舱。`clampMaxTokensToContext`
  (L15-19):maxTokens 钳到 contextWindow − 估算上下文 − 4096 安全垫。
  `adjustMaxTokensForThinking`(L61-86):thinking 预算表 {minimal:1024, low:2048,
  medium:8192, high:16384} 可自定义,且保证 `MIN_ANSWER_TOKENS = 1024` 回答
  空间——预算挤压时先缩 thinking。
- **有效性**:openai-completions.ts `buildParams()` 末端 `Object.assign(params,
  samplingParams)` 落地;llama.cpp 自定义后端文档依赖此机制(docs/llama-cpp.md)。
- **对 grok-build 的价值**:模型运营,脱敏 P0 主战场。自建推理服务的参数空间
  不可预知,逃逸舱是"不重编译即可适配新后端"的关键。
- **Rust 吸收**:`sampling_extra: IndexMap<String, serde_json::Value>` 两级
  (ModelDescriptor 默认 + Request 覆盖),序列化时最后 merge;clamp 逻辑照抄。
- **成本** S;**风险**:无;**优先级 P0**。

#### F23. constrained sampling:strict JSON-schema 规范化 + Lark/regex 语法,能力位门控

- **源**:`packages/ai/src/api/constrained-sampling.ts:13-29,117-131,133-145,156-187,207-227,230-265`
- **机制**:工具可声明 `constrainedSampling`。json_schema 路径:
  `makeStrictJsonSchema`(L117-131)把普通 schema 规范化成 strict 子集
  (additionalProperties:false、required=全属性、可选非空属性包
  `anyOf [T, null]`),遇到 $ref/allOf/oneOf 等 16 个不支持键
  (L13-29)抛 `UnsupportedStrictJsonSchemaError`;
  `resolveJsonSchemaStrictSampling`(L207-227)按后端能力位
  (supportsStrictMode)**优雅降级**——不支持就当普通工具发,除非工具声明
  `strict: "require"` 才报错。grammar 路径(lark/regex,L133-145,230-265):
  要求能力位 supportsOpenAIGrammarTools,从 schema 推断唯一必填 string 属性
  作为语法输入(L189-206),流式期间把语法输出增量包装成 JSON 参数 delta
  (`appendGrammarToolInputJsonDelta` L156-187,单调性校验——只许前缀增长)。
- **有效性**:openai-completions 适配器实际消费;create-harness.ts L36
  `constrainedSampling: getExperimentalToolSampling()` 已接入内置工具。
- **对 grok-build 的价值**:模型运营。自建小模型(vLLM + grammar)做约束采样
  能显著提升工具调用成功率;grok 工具 schema 已是 JSON schema,规范化器可
  直接移植,能力位与 compat 旗标(F20 同源)联动。
- **Rust 吸收**:`fn make_strict(schema: &mut Value) -> Result<(), Unsupported>`
  + 请求构造时按 backend caps 分派 guided_json/guided_regex。
- **成本** M;**风险**:中(grammar 流式包装细节多);**优先级 P2**。

### F. 表面渲染与遥测

#### F24. TUI 差分渲染 + CSI 2026 同步输出原子提交

- **源**:`packages/tui/src/tui-main-screen.ts:212,234,294-329,380-390,417-424`
- **机制**:组件 `render(width)` 产出行数组,与 `previousLines` 逐行比较得
  `firstChanged/lastChanged`(L294-309),**只重写变化区间**(L417-424 注释:
  单行变化如 spinner 不再全刷,减闪烁);追加行走快速路径(L322 appendStart)。
  四种情况退回全量重绘:宽度变、高度变(Termux 例外,软键盘收起不重放历史)、
  内容收缩清屏、firstChanged 落到视口上方(L269-289,380-384)。所有输出——
  无论全量还是差分——包在 `\x1b[?2026h … \x1b[?2026l`(同步输出)里一次提交
  (L212,234,390),终端缓冲到结束才渲染,消除撕裂;Kitty 图片行按 id 跟踪。
- **有效性**:tui/test 39 个测试文件;交互模式日常承载。
- **对 grok-build 的价值**:L3 表面质量。grok TUI(docs/02)长会话流式渲染
  的闪烁控制;CSI 2026 被 iTerm2/kitty/wezterm/foot/contour 支持,不支持的
  终端无害忽略。
- **Rust 吸收**:渲染器提交路径加 `write("\x1b[?2026h") … write("\x1b[?2026l")`
  (crossterm 无内置,直接写转义序列);行级 diff 若 grok 尚无,照抄
  firstChanged/lastChanged 算法。
- **成本** S;**风险**:无;**优先级 P2**。

#### F25. telemetry NOOP 契约 + adapter conformance 套件

- **源**:`packages/telemetry/src/index.ts`(357 行)、`noop.ts`、`memory.ts`、`testing/conformance.ts:61`(315 行);agent 侧 schema `agent/src/harness/telemetry.ts`
- **机制**:只有契约,无 exporter、无全局 span:`startSpan(options, callback)`
  独占 span 生命周期(无公共 end()),默认注入 NOOP context——不接后端零开销;
  类型化 schema 编译期推出强类型属性。adapter 正确性由
  `createTelemetryAdapterConformance`(L61)套件验证:runner 无关(node:assert),
  覆盖错误透传、span 结算等,任何 OTel/Sentry adapter 跑一遍即自证。
- **有效性**:conformance.test.ts + telemetry.test.ts;pi-ai 请求 span 实际接入。
- **对 grok-build 的价值**:工程可信/隐私。grok 脱敏删 Mixpanel/Sentry 后,
  保留"契约 + NOOP 默认 + adapter 可选"三层,将来接 OTel 只写 adapter 并用
  conformance 套件验收——可观测性不再是隐私负债。
- **Rust 吸收**:`trait TelemetryContext { fn start_span<T>(&self, opts, f:
  impl FnOnce(&Span) -> T) -> T }` + `NoopContext`;conformance 套件 = 共享
  测试函数。
- **成本** S;**风险**:无;**优先级 P2**。

---

## 2. 优先级汇总

| 优先级 | 条目 | 主题 |
|---|---|---|
| **P0** | F1, F2, F3, F4, F13, F19, F22 | 帧纪律、hello+快照、快照权威契约、传输层认证、fenced writer lease、faux 无 key e2e、samplingParams 逃逸舱 |
| **P1** | F5, F6, F7, F9, F10, F11, F12, F14, F16, F18, F20, F21 | 背压、租约、会话生命周期、持久化运行时三原则、FTS5、钩子面、offline 档、目录 generation、OAuth 双检锁 |
| **P2** | F8, F15, F17, F23, F24, F25 | DTO 字段清点、后端 conformance、trust 闸门、约束采样、CSI 2026、遥测契约 |

吸收顺序建议:①脱敏 P0 批次做 F22/F19(模型侧地基)与 F13(注册表写一致);
②控制面协议立项时 F1→F2→F3→F4→F5 一次性设计到位(合计 ~2-3 周,拆开做会
二次返工);③F9-F12 作为 P1 架构专题,先落 F10(replay 声明)与 F12
(Entry/Record),F9 完整解释器视 daemon 崩溃率数据再决策;④其余按 P2 机会
窗口插入。

---

## 3. 不吸收清单 + 理由

| # | 不吸收项 | 理由 |
|---|---|---|
| 1 | **CBOR 编码本身** | 保留"长度前缀帧 + 校验后编码"的纪律,但 payload 用 JSON:grok 的 ACP/Hub 已是 JSON 生态,调试/工具链友好;pi 的 CBOR 子集编解码(384 行)是为零依赖手写,Rust 侧无此约束,收益(字节数)在控制面流量级别可忽略。 |
| 2 | **harness v4 完整实现** | pi 自身未实现(`HarnessNotImplemented` 占位),无经过运行验证的参照;整体移植 = 把别人的设计债背过来。只吸收 F9-F11 三原则,按 grok 自己的恢复数据(hunk/recovery)小步落地。 |
| 3 | **一 session 一 SQLite 文件** | pi 的"file = session"服务于可分享/可 unlink 的简单性;grok 全局注册表需要跨会话聚合(列表/检索/调度关联),per-file 会使全局 FTS 与列表查询需要逐文件打开。单库多表 + writer lease 更合适。 |
| 4 | **in-process TS 扩展运行时** | 语言边界不符;proposal 已定"子进程协议 + Markdown skill"。pi 的 ExtensionAPI 只作为**钩子面清单**参照(F16),不作为运行时参照。 |
| 5 | **models.dev 外部目录与 40+ 内置 provider** | 与脱敏/BYOK 方向冲突;保留生成链+条件再校验机制(F20),数据源替换为本地 models.json 与自建 catalog。 |
| 6 | **PiServer 的 9 命令 schema(list/create/attach/detach/prompt/steer/abort/set_model/set_thinking)** | 命令集太窄:无审批、无调度、无记忆、无执行世界概念,且 pi 自标 experimental。借鉴其信封纪律(hello/快照/request-response/event 四形),schema 按 grok daemon 需求自设。 |
| 7 | **RPC 模式 stdin/stdout JSON-lines 协议** | grok 已有 ACP/Hub/serve 三表面,再加第四套协议是负资产;其命令清单(rpc-types.ts 30+ 命令)仅作 Hub 命令命名参照。 |
| 8 | **install ping / opt-in analytics** | pi 自己也默认关闭(enableAnalytics default false);grok 脱敏目标是零回连,只保留 F25 的 NOOP 契约。 |
| 9 | **TUI 双渲染器全套(main-screen/alt-screen + 组件树)** | grok 已有自身 TUI 范式(docs/02),整体替换成本远超收益;只补 CSI 2026 与行 diff 细节(F24)。 |
| 10 | **PiClient "不自动重连"语义** | 这是 pi 的简化选择(README 明示 "PiClient does not reconnect automatically");grok daemon 表面必须自动重连 + 状态恢复(现有 leader_bridge 能力),只吸收其租约失效与对账语义(F6),重连策略自定。 |

---

## 附:关键源文件索引(相对 ref/pi)

| 主题 | 路径 |
|---|---|
| 帧/CBOR/校验 | `packages/protocol/src/{framing,codec,schemas}.ts`、`cbor/{encoder,decoder}.ts` |
| 服务端核心 | `packages/server/src/{server,sessions,snapshots,protocol,errors,types}.ts` |
| Unix 传输 / 一致性测试 | `packages/server/src/transports/unix/listener.ts`;`packages/server/test/conformance.test.ts` |
| 客户端/租约 | `packages/client/src/{client,session-handle,state,connection,transport,unix,errors}.ts` |
| harness v4 spec / 骨架 | `packages/agent/docs/harness.md`(2941 行);`packages/agent/src/harness/agent-harness.ts`(508 行,多为占位) |
| 会话树/存储/恢复校验 | `packages/agent/src/harness/session/{types,session,state,memory}.ts`;`harness/reducer.ts` |
| SQLite 后端 | `packages/session-backends/sqlite-node/src/sqlite/{repo,search-backend}.ts`、`storage/writer-leases.ts` |
| 后端 conformance | `packages/agent/src/harness/session/testing/conformance.ts` |
| 扩展 API / trust | `packages/coding-agent/src/core/extensions/types.ts`(1728 行);`core/trust-manager.ts` |
| faux / 模型目录 | `packages/ai/src/providers/faux.ts`(708 行);`packages/ai/src/{models,models-store,models.generated}.ts`、`scripts/generate-models.ts` |
| 凭据/采样 | `packages/ai/src/auth/{credential-store,resolve}.ts`;`packages/ai/src/api/{simple-options,constrained-sampling}.ts` |
| TUI / 遥测 | `packages/tui/src/tui-main-screen.ts`;`packages/telemetry/src/{index,testing/conformance}.ts` |
