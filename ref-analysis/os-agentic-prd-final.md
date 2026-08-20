# Nofy OS-level Agentic 产品需求文档(PRD-1.1)

> 1.1 变更:回写施工状态(§11),需求正文不变;过程稿 v1/v2 仅作变更史。

| 项 | 值 |
|---|---|
| 版本 | PRD-1.0(终版) |
| 状态 | 待评审 |
| 证据基 | `os-features/` 六份源码级深抽(openclaw 33 / hermes 30 / pi 25 / dsh 27 / ngoagent 25 特性 + grok-build 吸收映射)+ `os-agentic-proposal-v2.md`(过程稿) |
| 命名 | crate 用脱敏真名 `nofy-*`;引用记号 OC-/HM-/PI-/DS-/NG-/MAP- 对应上述六份文档 |
| 纪律 | 所有需求带源证据;所有"宣称"以源码行号为准;不吸收清单具法律效力级约束 |

---

## 1. 产品愿景与定义

### 1.1 一句话定位

**Nofy 从"终端编程代理"演进为"运行在操作系统里的助手":常驻、跨项目、多表面、可编排;编程能力是它最强的专家,而不是它的全部。**

### 1.2 OS agentic 三层定义(交付边界)

| 层 | 定义 | 验收意象 |
|---|---|---|
| L1 常驻 | 每主机一个守护进程;任务可由 cron/事件/任意表面发起,不依赖某个终端活着 | 合盖再开,任务与投递都在 |
| L2 跨域 | 状态/记忆/调度/文件理解以主机为域;workspace 是执行单位而非边界 | 跨项目中文检索命中;会话可迁移 |
| L3 系统面 | 多表面(TUI/IDE/Web/IM/webhook)平等接入;跨表面审批;OS 感官(fs 事件/电源/浏览器);执行世界谱系 | 手机 IM 批准一次高危操作,TUI 里放行 |

### 1.3 三级面与灵活接口(用户愿景确认版)

```
系统面  常驻助手(nofy-daemon)+ 下级专家群(packs)+ 文件管家 + 自动化
项目面  workspace 内直接使用 agent(现状能力,一寸不让)
嵌入面  ACP/IDE、headless/CI、SDK
三面 = 同一控制面协议的平等客户端;会话真相单一(journal)
```

### 1.4 核心论点(为什么是我们)

1. **执行面护城河**:沙箱(Landlock/bwrap/seccomp)、30+ 工具、压缩、hunk、workflow——五个参考里与 dsh 并列最强;openclaw/hermes 的全局形态执行面弱,补不动。
2. **空位真实存在**:Leader 在脱敏构建"已删除、器官还在"(MAP-§1.1),per-host 共享宿主的位置、接口、夹具全在。
3. **项目逻辑 ⊂ 全局逻辑**:workspace 会话是全局 agent"任务落在某执行世界"的特例;控制面上提一层即可,不 fork 新产品。

---

## 2. 现状与差距

### 2.1 现状三结论(MAP-)

1. **常驻面是"删掉一半的 Leader 拓扑"**:现存常驻件仅 per-workspace `workspace_server`(沙箱场景)与 per-process serve agent;空位+器官(§4.1 填法)。
2. **协议面三套消息宇宙+一个统一缝**:ACP stdio / serve ACP-WS / Hub WS;唯一跨宇宙抽象 `WorkspaceOps::Local|Proxy`(`nofy-workspace/src/workspace_ops.rs:1307-1347`)。
3. **状态面已事件化**:`nofy-session-journal` 24 封闭事件+确定性 reducer+P0 不变量(seq 无空洞、terminal 门控、凭据永不入 payload、未闭合 intent 清单)= 新常驻件的持久化契约,不发明新存储。

### 2.2 差距矩阵(对五参考)

| 能力 | 现状 | 目标参考 |
|---|---|---|
| per-host daemon | 缺失(空位+器官) | openclaw gateway / hermes GatewayRunner(机制取、聚合不取) |
| 控制面协议 | 三套并存无 schema-first | pi 信封纪律 + openclaw codegen |
| 耐久调度 | 会话内 actor,无常驻宿主 | dsh event-sourced schedule + hermes cron |
| 跨会话检索 | memory FTS 仅记忆目录 | hermes FTS5+CJK |
| 跨表面审批 | 四条独立路径 | openclaw 审批路由 + NGO 矩阵 |
| 套件/专家 | 子代理定义+插件,无 pack 单元 | dsh preset(纪律)+ WorkBuddy(形态) |
| 任务编排 | workflow 引擎在,无项目级层 | 自研 manifest(引擎用本仓) |
| 文件理解 | 项目内 | 自研 file-steward(参考均无,差异化) |

---

## 3. 目标架构

```
表面层  TUI ─ ACP/IDE(映射桥)─ headless/CI ─ Web(serve 升级)─ IM/webhook(契约位)
        │   控制面:schema-first;词汇=journal 24 事件+ACP ContentBlock+tool-protocol+rpc 错误码
nofy-daemon  per-host 单实例(lock-file 选举);宿主 registry/scheduler/approval-broker/file-index;崩溃经 journal 对账
        │ 管理 N 执行单元(actor 族形状不变,改宿主进程)
执行层  ChatStateActor/SamplerActor/HunkTracker ─ ToolBridge ─ 沙箱 ─ workflow
```

**六条架构原则**:

1. daemon 只编排不执行(反例 hermes 28k 行;正例 dsh 包级零耦合)。
2. 词汇包先行(错误/词汇类型住自己 crate;`nofy-session-journal` 为范本)。
3. 认证在传输层,协议字节不掺认证(PI-F4)。
4. schema-first + 漂移门禁(OC-F27)。
5. model-visible ⟺ logged 为产品契约(IM 批准/插话/调度/文件引用一律落事件)。
6. 默认零外呼;脱敏先于控制面(`EndpointsConfig` 单一来源化先做)。

**五个新 crate 与依赖预算**(MAP-§4):

| crate | 职责 | 禁止依赖 |
|---|---|---|
| `nofy-channel` | 帧/握手/重连/背压,传输无关 | 会话/工具语义类型 |
| `nofy-session-registry` | 跨进程会话索引+foreign 只读源 | shell/agent/sampler |
| `nofy-scheduler` | 耐久调度,决定落 journal | tools/shell/sampler |
| `nofy-approval-broker` | 四审批路径收敛为单事件流 | 工具执行/TUI |
| `nofy-daemon` | 组装+控制面监听 | pager*/tools 实现/sampler |

**协议收敛三步**:① 定 schema(复用 journal 词汇+ACP 形状+tool-protocol+rpc 错误码,不新造);② serve 升为参考传输(认证升级控制面握手+schema 校验);③ ACP 挂双向映射桥(`--stdio` 兼容不丢),Hub 降级为工具传输。relay/gateway 专有云 WS 不收敛、随脱敏删除。

---

## 4. 需求目录(FR1–FR13)

> 每需求:描述+源证据;每组:验收标准(AC)。优先级 P0=地基必做,P1=二期,P2=三期,P3=机会。

### FR1 常驻可靠性(L1)

| 需求 | 源 | 优先级 |
|---|---|---|
| FR1.1 单实例双锁+PID 复用防御+进程身份核验 | OC-F1 | P0 |
| FR1.2 通道健康监视器:周期评估+重启预算+stale-socket 判定 | OC-F2 | P0 |
| FR1.3 崩溃恢复三件套:重启哨兵+restart-safe 准入+持久投递队列 | OC-F6 | P0 |
| FR1.4 sd_notify+事件循环滞后采样 watchdog(环内自报×环外看门狗) | HM-F1 | P0 |
| FR1.5 非干净死亡取证:生命周期账本+关闭取证+cgroup 清扫 | HM-F3 | P0 |
| FR1.6 重启退出码契约(supervisor 按码决策) | HM-F4 | P0 |
| FR1.7 崩溃恢复会话状态机(clean_shutdown/resume_pending/卡循环升级) | HM-F5 | P0 |
| FR1.8 会话缓存 LRU+cgroup 感知内存压力驱逐,DETACHED 磁盘可 resume | HM-F6 | P0 |
| FR1.9 断线增量重放:run 与连接解耦,Attach(last_seq) | NG-F1 | P0 |
| FR1.10 崩溃尾巴合成边界:interruptedTurnClosers 两码闭合+幂等重试指引 | DS-#16 | P0 |
| FR1.11 write-behind 有界批写+flush barrier | DS-#18 | P0 |
| FR1.12 持久化 runtime 三原则(lane/operation/deferred 全持久) | PI-F9~F11 | P1 |
| FR1.13 `persistence_uncertain` 作工具语义 | DS-#4 | P1 |
| FR1.14 daemon 安装子命令(launchd/systemd 单元生成) | OC-F4 | P1 |
| FR1.15 冷启动快速路径(help/version 不加载运行时) | OC-F5 | P1 |
| FR1.16 BOOT 自检会话(agent 驱动启动体检) | OC-F32 | P2 |

**AC-1**:并发启动第二个实例必失败或接管,绝不双跑;`kill -9` 后新实例经 journal 对账续跑,未闭合 intent 有清单;重启预算耗尽自禁而非风暴;环外 watchdog 60s 内检出楔死;DETACHED 会话可从磁盘 resume。

### FR2 控制面协议(L3/工程)

| 需求 | 源 | 优先级 |
|---|---|---|
| FR2.1 长度前缀帧+校验后编码+违规即拒;快照权威、progress 仅 UI hint | PI-F1~F3 | P0 |
| FR2.2 hello 版本协商+传输层认证 | PI-F4 | P0 |
| FR2.3 副作用方法幂等键+原子准入 | OC-F19 | P0 |
| FR2.4 steering 三检查点注入(循环检查点/工具批边界/转录提交等待) | OC-F17 | P0 |
| FR2.5 ACP 双向映射桥(`mvp_agent` 不动) | MAP-§3.2 | P0 |
| FR2.6 设备身份=公钥派生+challenge 签名 | OC-F14 | P1 |
| FR2.7 能力声明 caps/commands,运行时审批只能收窄 | OC-F15 | P1 |
| FR2.8 turn-interruption 可恢复转录 | OC-F18 | P1 |
| FR2.9 schema-first codegen+漂移门禁 | OC-F27 | P1 |
| FR2.10 会话谱系表(链式代际+来源标记) | OC-F29 | P1 |
| FR2.11 Hub 降级为工具传输,`workspace.*` 经 daemon 授权转发 | MAP-§3.2 | P1 |

**AC-2**:schema 漂移 CI 红;既有 ACP e2e 全绿过映射桥;幂等重放不重复执行;断线重连增量补发;认证仅存在于传输层。

### FR3 调度与事件总线(L1/L2)

| 需求 | 源 | 优先级 |
|---|---|---|
| FR3.1 event-sourced schedule:状态=日志纯 fold,fork 感知 | DS-#1 | P0 |
| FR3.2 fixed-rate latest-only 追赶(不补发积压) | DS-#2 | P0 |
| FR3.3 真 idle 通道(runMaintenance 第三相位+wake 闩) | DS-#17 | P0 |
| FR3.4 cron 引擎:catch-up/backoff/watchdog/自禁用/启动修复 | OC-F9 | P0 |
| FR3.5 cron 文法+心跳/成功双文件+跨进程 flock+HOME 投递 | HM-F10 | P1 |
| FR3.6 一次性定时器 clamped+重校墙钟 | DS-#3 | P1 |
| FR3.7 jobs session 栅栏+controller 闸门+双通道投递 | DS-#5 | P1 |
| FR3.8 fs 事件→任务绑定(防抖+预算+拒自毁) | HM-F21 | P1 |
| FR3.9 heartbeat 自检投影+scratch 便签 | OC-F10 | P1 |
| FR3.10 system-event 总线+presence+wake 路由 | OC-F13 | P2 |

**AC-3**:无客户端在线时 cron 照常执行;错过窗口按策略追赶且不风暴;连续失败自禁用留痕;自毁型调度被拒;fs 事件可触发任务且防抖生效。

### FR4 全局状态与记忆(L2)

| 需求 | 源 | 优先级 |
|---|---|---|
| FR4.1 writer-run 写栅栏(进程内 queue×跨进程 BEGIN IMMEDIATE) | OC-F8 | P0 |
| FR4.2 per-request checkpoint fail-closed(日志前缀未耐久不发起) | DS-#8 | P0 |
| FR4.3 全局会话索引(SQLite+内容寻址去重+end_reason 谱系) | HM-F8 | P0 |
| FR4.4 FTS5 多 tokenizer(含 CJK bigram) | HM-F9 | P0 |
| FR4.5 工具结果三档注入+spill | NG-F12 | P0 |
| FR4.6 记忆冻结快照注入+promptware 扫描 | HM-F11 | P1 |
| FR4.7 Curator 硬不变量(只碰自创/只归档不删/pinned 豁免) | HM-F18 | P1 |
| FR4.8 background_review fork 隔离+缓存感知重放 | HM-F19 | P1 |
| FR4.9 goal/plan logged state+pre-step 原子验收 | DS-#6/#7 | P1 |
| FR4.10 ProjectionValueStore higher-seq-wins+init/apply/view | DS-#23/#24 | P1 |
| FR4.11 审计存储 metadata-only+假名化+retention | OC-F12 | P1 |
| FR4.12 七维 compact+密度切割+深度守卫 | NG-F9 | P1 |
| FR4.13 dreaming 三相蒸馏+preimage 可回滚 | OC-F11 | P2 |

**AC-4**:被取代 run 无法提交过期转录;checkpoint 失败=请求不发起(可观测);跨项目中文 FTS 命中;curator 不删任何条目;会中记忆写入不改 prompt。

### FR5 审批与治理(治理)

| 需求 | 源 | 优先级 |
|---|---|---|
| FR5.1 跨表面审批路由(任意在线表面应答) | OC-F16 | P0 |
| FR5.2 sandbox×tool-policy×elevated 三正交+explain 诊断;收编 auto-allow 旁路 | OC-F20 | P0 |
| FR5.3 exec-approvals fail-closed 存储+本地 socket 协议 | OC-F21 | P0 |
| FR5.4 /api 浏览器信任栅栏(Host 规范化+sec-fetch-site+Origin 四层) | DS-#22 | P0 |
| FR5.5 YOLO 冻结+会话身份任务局部化 | HM-F20 | P1 |
| FR5.6 生命周期守卫(拒自毁型命令) | HM-F21 | P1 |
| FR5.7 轮次租约(同会话跨表面串行) | HM-F17 | P1 |
| FR5.8 投递义务账本(at-least-once) | HM-F16 | P1 |
| FR5.9 mode_permissions 矩阵 | NG-F5 | P1 |
| FR5.10 注入抗性帧(固定信封) | DS-#21 | P1 |
| FR5.11 permission-presets intent 事件+write-through | DS-#20 | P1 |
| FR5.12 配置写 CAS | OC-F33 | P1 |
| FR5.13 pre-auth 硬化(连接预算+洪水守卫) | OC-F22 | P1 |
| FR5.14 安全分类器三策略骨架(结构化输出,仅审批提示) | NG-F4 | P2 |
| FR5.15 self-modification per-package 人批 | DS-#19 | P2 |

**AC-5**:webhook 表面可完成一次高危操作批准(fail-closed 演示);审批存储损坏=拒绝;四路径收敛为单一可审计事件流;DNS rebinding 测试通过;危险模式不可热升级。

### FR6 执行世界与进程管理(L3)

| 需求 | 源 | 优先级 |
|---|---|---|
| FR6.1 进程注册表(滚动缓冲+检查点恢复+watch 熔断) | HM-F15 | P0 |
| FR6.2 登录 shell 环境快照(原子发布+注入安全转储) | HM-F13 | P1 |
| FR6.3 CWD 带内标记+输出限流 spill | HM-F14 | P1 |
| FR6.4 子代理 barrier+auto-wake | NG-F19 | P1 |
| FR6.5 进程外 provider 公共件(env 清洗/cwd 可进入/never-reject) | DS-#12 | P1 |
| FR6.6 SubagentCapabilities 位+委托深度只增 | DS-#9/#10 | P1 |
| FR6.7 fork 只取 completed-turn prefix | DS-#11 | P1 |
| FR6.8 workflow 宿主请求路由出会话 | MAP/DS | P2 |
| FR6.9 worker-thread scrubbed env+grace 强杀+配对账本 | DS-#13 | P2 |
| FR6.10 docker/ssh 执行世界 | HM 环境族 | P3 |

**AC-6**:后台进程崩溃后可登记恢复;barrier 齐套唤醒父 loop;fork 会话不含未闭合 turn。

### FR7 模型运营

| 需求 | 源 | 优先级 |
|---|---|---|
| FR7.1 统一错误分类学(FailoverReason×错误指纹两级)+分级退避+后台禁重试 | HM-F22+NG-F14 | P0 |
| FR7.2 凭据池状态机(OK/EXHAUSTED/DEAD)+冷却+租约 | HM-F23 | P0 |
| FR7.3 failover 阶梯:凭据轮换→模型回退两级 | OC-F30 | P0 |
| FR7.4 samplingParams 逃逸舱 | PI-F22 | P0 |
| FR7.5 compat 旗标表+baseUrl 探测+配置覆盖 | PI | P0 |
| FR7.6 BYOK:`EndpointsConfig` 单一来源+声明式 auth method | MAP/SUMMARY | P0 |
| FR7.7 generations 原子快照+lease/retention | OC-F24 | P1 |
| FR7.8 辅助路由链(stale-while-revalidate,本地目录) | HM-F24 | P1 |
| FR7.9 OAuth 刷新双检锁 | PI-F21 | P1 |
| FR7.10 厂商静态预设表(BYOK 向导种子) | NG-F15 | P2 |

**AC-7**:默认配置启动零外呼;vLLM/Ollama/LiteLLM 三自建后端全 e2e;429 时凭据轮换、轮换尽时模型回退,序列可观测。

### FR8 生态与供应链

| 需求 | 源 | 优先级 |
|---|---|---|
| FR8.1 供应链门禁(minimumReleaseAge+trust verdict,fail-closed) | OC-F23 | P1 |
| FR8.2 工具注册表 generation 失效+override 安全闸 | HM-F25 | P1 |
| FR8.3 hooks 桥:detach/drain+600s+耐久配对;永不阻塞主管线 | DS-#14+HM-F27 | P1 |
| FR8.4 插件 manifest 声明+构建产物隔离区 | OC-F25 | P2 |
| FR8.5 Docker build-arg 插件子集 | OC-F26 | P2 |
| FR8.6 channel 适配器契约(扩展位,不建 22 渠道) | HM-F12 | P2 |

**AC-8**:第三方按 manifest 零核心改动接入;钩子崩溃不拖主管线。

### FR9 工程可信

| 需求 | 源 | 优先级 |
|---|---|---|
| FR9.1 fenced writer lease | PI-F13 | P0 |
| FR9.2 无 key e2e(MockInferenceServer+override sidecar+`{{fromRequest}}`) | MAP/PI-F19/DS-#26 | P0 |
| FR9.3 WAL 降级阶梯 | HM-F28 | P0 |
| FR9.4 遥测 NOOP 契约+conformance 套件 | PI-F25 | P0 |
| FR9.5 probe 二进制验收模板(`PROBE_OK`) | MAP-§5.2 | P0 |
| FR9.6 预算棘轮(max-lines ratchet+knip) | OC-F28 | P1 |
| FR9.7 压缩跨进程租约 | HM-F29 | P1 |
| FR9.8 guard 双件(重复调用提醒+scoped 超时) | DS-#27 | P1 |
| FR9.9 密封测试+trajectory 首末保护 | HM-F30 | P2 |
| FR9.10 逐文件覆盖=死代码探测器 | DS | P2 |

**AC-9**:所有新组件有无 key e2e;daemon crate 行数棘轮只降不升。

### FR10 套件/专家包(L3/生态)

| 需求 | 源 | 优先级 |
|---|---|---|
| FR10.1 isolate 断言:服务行泄入根 realm 即 mount 拒绝(`leakedServices` 加载期检测) | DS-P2 | P0 |
| FR10.2 宿主面/代理面所有权判据(pack 不拥有沙箱/审批/持久化/模型路由) | DS-P4 | P0 |
| FR10.3 standing mount+scope join(一组合挂一次,会话父系加入) | DS-P1 | P1 |
| FR10.4 persona 行+模板变量+默认遮蔽 | DS-P3 | P1 |
| FR10.5 委托行即专家召唤(外部 ACP 专家=一行 provider) | DS-P5 | P1 |
| FR10.6 `nofy-pack` manifest(persona/skills/mcp/tool_policy/model_route/subagents),会话级与 subagent 级两编译目标 | 新 | P1 |
| FR10.7 单 agent 单 pack 纪律(叠装禁止;选择落日志 newest-wins) | DS-P7 | P0 |
| FR10.8 发现/创作/元数据三件=市场面 | DS-P6 | P2 |
| FR10.9 内置包 `file-steward`(见 FR12)与未来 `code-review` 等示范包 | 新 | P2 |

**AC-10**:pack 可被会话 join 与 subagent 召唤两形态;leaked service 加载即拒;被拒组合整体回滚创建;marketplace 可分发 pack。

### FR11 任务管理与编排(L2/L3)

| 需求 | 源 | 优先级 |
|---|---|---|
| FR11.1 `.nofy/project.toml`(packs[]+orchestration+task DAG) | 新 | P1 |
| FR11.2 单任务执行=SpawnAgent join 单 pack+goal 验收 | DS-#6/#7 | P1 |
| FR11.3 workflow host 请求词汇路由到 daemon;Journal 确定性回放 | DS/本仓 | P1 |
| FR11.4 barrier fan-in+投递账本 | NG-F19+HM-F16 | P1 |
| FR11.5 `task.*` journal 事件族(armed/claimed/settled/escalated) | 新(继承 journal 不变量) | P2 |
| FR11.6 DAG/并行/依赖边+on_fail 策略(retry/escalate/skip) | 新 | P2 |
| FR11.7 周期编排=`nofy-scheduler`×pack(自动化) | OC-F9 | P2 |
| FR11.8 批级审批(一次 Ask+逐条账本) | 新 | P2 |

**AC-11**:manifest 编译为 workflow run;验收不靠模型自述(goal fold);崩溃后 `task.*` 对账续跑;escalate 走 FR5 跨表面审批。

### FR12 文件管家 File Steward(L2/L3,差异化)

| 需求 | 源 | 优先级 |
|---|---|---|
| FR12.1 roots 空默认 opt-in;每根两档(`index-only`/`manage`);根外 escalate | 新 | P1 |
| FR12.2 fs-index v1:metadata+FTS(CJK);watcher→事件总线;真 idle 增量 | HM-F9+DS-#17 | P1 |
| FR12.3 `fs/*` 策略事件+结构化 `FS_SANDBOX_DENIED` | DS-06 | P1 |
| FR12.4 file-activity 图(journal `tool.*` 文件副作用全局化+hunk 合流) | 新 | P1 |
| FR12.5 隐私四件:本地/retention/forget/redaction/审计 metadata-only | OC-F12 | P1 |
| FR12.6 管理工具面(move/rename/tag/dedupe/cleanup)trash-over-delete+两阶段 intent+回滚快照 | 新 | P2 |
| FR12.7 内容提取管线(pdf/docx/图)+可选 embeddings(默认关) | openclaw document-extract | P2 |
| FR12.8 整理建议 DAG→FR11 编排→批级审批 | 新 | P2 |
| FR12.9 索引=提示不是事实:操作前真实文件再验证 | PI-F3 变体 | P1 |
| FR12.10 OS 集成面(Spotlight/Everything 桥)作 provider 评估 | 新 | P3 |
| FR12.11 文件租约表:活跃会话声明工作集(hunk 在追/cwd 树/opened),TTL+心跳;leased=steward 只读禁管理 | 新(writer-run/fenced-lease 文件级变体) | P1 |
| FR12.12 三区分域:项目主权/steward 主权/重叠取更严 | 新(FR2.7 收窄同款) | P1 |
| FR12.13 越界 handoff:steward 对 leased 根的操作经 steering 移交该会话,走其沙箱/审批/hunk 执行;steward 在项目地盘降级为建议者 | 新(OC-F17) | P2 |
| FR12.14 变更 manifest+转发墓碑+`undo --batch`;steward 为 file-activity 一等 actor | 新 | P1 |
| FR12.15 清理禁区(leased/gitignore/会话 N 天内触碰=不可清理,不确定必 Ask)+ 新根 dry-run 试用期+按根信任爬坡 | 新(folder-trust 同款) | P1 |

**AC-12**:未选根=零索引零外呼;`index-only` 根产不出写操作;forget 后检索不可命中;批整理可回放可撤销;**租约命中的管理操作加载期即拒;重叠区取更严;墓碑可解析陈旧引用;新根前三批强制 dry-run;steward 改动被 hunk 外部对账识别为外部编辑并可见归因**。

### FR14 敏捷与脚本面(编译边界之外)

> 背景:dsh/openclaw/pi 运行时直食 TS、hermes 直食 Python,插件迭代免编译;Rust 核心每次变动过编译边界。敏捷性置于进程外数据态层,核心只收稳定件。

| 需求 | 源 | 优先级 |
|---|---|---|
| FR14.1 script runner:受管运行时 execute_code/runbook 工具;pack 可捆绑脚本+声明依赖(python 版本/requirements,受信渠道懒安装) | dsh code-mode、hermes execute_code、HM-F26 转译 | P1 |
| FR14.2 扩展点全协议化(JSON-RPC stdio/HTTP+JSON Schema);in-proc 代码插件禁止(§6 重申) | PRD 原则 | P0 |
| FR14.3 SDK 分级:Python/TS 一等+codegen;Java/Go 协议兼容社区驱动;conformance 套件为合格标准 | PI 后端 conformance、OC-F27 | P1 |
| FR14.4 热重载 packs/skills/hooks/scripts 不重启 daemon;核心更新走 supervisor 退出码契约 | DS standing mount、HM-F4 | P1 |
| FR14.5 pack 预演区+三次法则:pack/script 验证 ≥3 场景才晋升 Rust 核心 | 新 | P1(纪律) |
| FR14.6 script 沙箱:同沙箱 profile+资源限额,fail-closed,永不 in-proc | FR5.2 | P1 |

**AC-14**:一个 Python script pack 从编写到被召唤 <5 分钟、零 Rust 改动;Java 子进程插件经通用协议过 conformance;脚本崩溃不拖 daemon;pack 热重载不需要重启。

### FR13 表面层(L3)

| 需求 | 源 | 优先级 |
|---|---|---|
| FR13.1 TUI/ACP/headless 迁控制面客户端 | MAP | P0/P1 |
| FR13.2 Web(serve 升级+信任栅栏 FR5.4) | DS-#22 | P1 |
| FR13.3 webhook 表面 | 新 | P2 |
| FR13.4 一个 IM 契约实现(Feishu 或 Telegram) | HM-F12 形状 | P2 |
| FR13.5 原生 app 不承诺 | — | 非目标 |

**AC-13**:四表面同一会话真相;IM 可批准(FR5.1)。

---

## 5. 非功能需求(NFR)

| 项 | 要求 |
|---|---|
| 隐私 | 默认零外呼;状态目录单 env 重定位(`NOFY_HOME`);落盘全可 grep;索引全本地+forget 权 |
| 安全 | fail-closed 贯穿(审批/checkpoint/供应链/信任栅栏);内核级沙箱为主边界,启发式仅提示 |
| 可靠性 | daemon 7 日存活 ≥99%;崩溃恢复 ≥99.5%;投递丢失=0 |
| 性能 | 冷启动 help/version 秒回;索引仅真 idle;daemon 内存预算+LRU 驱逐 |
| 可审计 | 审计 metadata-only+retention;全账本可回放 |
| 可测试 | 新组件 100% 无 key e2e 覆盖;conformance 套件 |

---

## 6. 非目标(不吸收,具约束力)

- god object(hermes GatewayRunner/AIAgent;openclaw gateway 聚合倾向);本仓 `handle.rs` 10k 行是拆分对象不是基座。
- 语言特有载体(hermes deepcopy/AST 发现/pip;NGO chan 模式;pi CBOR/in-proc TS 扩展;dsh Cordis 运行时树/declaration merging/`!!js`/typert)——机制可借,载体不搬。
- NGO 五条宣称未实现(ShouldApprove 升级/分类器缓存/dream job/forge 配置/Forge 验证)及营销叙事。
- 专有商业件(billing/portal/relay/gateway 云 WS/install ping/归因头)。
- 22 渠道本体、pi harness v4 整体、PiServer 9 命令 schema、原生 app(P3 前)。
- 全盘扫描器形态(FR12.1 空默认)。

---

## 7. 路线图与里程碑

| 阶段 | 周期 | 内容(批次) | 里程碑验收 |
|---|---|---|---|
| P0 地基 | 6–8w | A 脱敏(FR7.6 先行)→B 常驻(FR1)→C 状态(FR4.1-4.5,FR9.1-9.5)→D 控制面词汇(FR2.1-2.5,FR10.1/2/7 边界) | 一机一 daemon;TUI/ACP/headless 同真相;kill -9 续跑;中文 FTS 命中;零外呼+品牌归零 |
| P1 跨域治理 | 6w | FR3.1-3.9;FR4.6-4.12;FR5 全;FR7.7-7.9;FR8.1-8.3;FR10.3-10.6;FR11.1-11.4;FR12.1-12.5/12.9;FR13.2;FR14 全(script runner+协议化+热重载+预演区纪律;Python/TS SDK 一等) | 合盖任务继续;webhook 批高危;pack 两形态召唤;project manifest 单任务跑通;**Python script pack 五分钟上线零 Rust 改动** |
| P2 多表面生态 | 6w | FR13.3/13.4;FR4.13;FR3.10;FR2.9/2.10;FR8.4-8.6;FR10.8/10.9;FR11.5-11.8;FR12.6-12.8 | 第三方零核心改动接表面;任务 DAG+批审批;file-steward 上线 |
| P3 持续 | — | FR6.10;FR6.8;FR12.10;realm 隔离评估 | 执行世界谱系 |

> **P1 行结算(PRD-1.5,第一性原理裁定,详见 `p1-construction-plan.md` §0)**:FR 表漏列 P1 项按「是否被 P1 验收命题依赖」切割——**保留** FR12.11–15/FR2.6–2.7/FR6.4–6.7/FR2.9/FR6.1/FR9.6(AC-12/AC-2/AC-5/AC-14 通过成本);**推迟 P2 前置队列** FR13.1/FR4.5/FR1.12–1.15/FR2.8/2.10/2.11/FR6.2–6.3/FR9.7–9.8(P1 无命题依赖)。里程碑「webhook 批高危」按命题定义为「非 TUI 审批证明单元」(G11),全表面仍 P2。P1 估算 ≈8–9 周,差额如实记录。

---

## 8. 风险与对策

| 风险 | 对策 |
|---|---|
| daemon 滑向 god object | crate 依赖预算+禁止清单;`handle.rs` 拆分先行;棘轮对 daemon 生效 |
| 控制面固化专有端点 | 脱敏批次 A 先于 schema |
| 协议收敛返工 | FR2.1-2.5 一次性设计(2–3 周) |
| 审批统一回归 | 先事件流后策略合并 |
| 索引漂移/扫描资源/管家越权 | 操作前再验证;idle+预算;trash+批审批+回放 |
| steward×项目 agent 文件交叉破坏 | 租约表声明所有权(FR12.11);越界 handoff 不旁路(FR12.13);墓碑+批 undo(FR12.14);禁区+信任爬坡(FR12.15);外部对账兜底 |
| 文档超前于实现 | 行号引用纪律+待核实清单 |

---

## 9. 指标

- **北极星**:非 TUI 发起且跨表面闭环任务占比 ≥20%(P2+3 月)。
- 过程:FR1-AC 全过;投递丢失=0;无 key e2e 100%;**品牌串归零;provider 语义标识符(`is_xai_api_url` 类)与模型 ID 按 SANITIZATION_PLAN 决策记录保留并文档化**;pack/第三方接入斜率;forget 合规审计=0 残留。

---

## 10. 待核实清单

1. Leader 是否计划恢复(影响 FR2.5);2. `session_registry_client` 远端存否;3. convergence governor 接入点;4. evals 度量回路;5. schema 载体 JSON Schema vs protobuf;6. `nofy-memory/dream.rs` 外呼面;7. `activity.rs` 与 journal 投影重叠度。

---

## 附录 A:证据索引

`os-features/openclaw.md`(33)·`hermes.md`(30)·`pi.md`(25)·`deepseek-harness.md`(27)·`ngoagent.md`(25)·`grok-build-integration-map.md`;过程稿 `os-agentic-proposal-v2.md`;早期草图 `os-agentic-proposal.md`(v1,被本版取代)。

## 附录 B:术语

pack=收敛 subagent 的分发单元(persona+skills+mcp+policy);standing mount=一组合挂一次、会话父系加入;journal=`nofy-session-journal` 24 事件真相层;控制面=daemon 对外 schema-first 协议;执行单元=workspace runtime 内的会话 actor 族。

## 11. 施工状态与验收(PRD-1.1 回写,2026-08-16)

> 需求正文不变;本节是进度看板。细节在 `p0-dev-log.md`,证据在 `os-features/`。

| 需求组 | 状态 | 落点与验证 |
|---|---|---|
| FR7 模型运营/脱敏(批次 A) | ✅ 出口 | Mixpanel/Sentry 物理移除;updater opt-in;`EndpointsConfig` 单一来源;e2e 31/31 回归 |
| FR1 常驻可靠性(B1) | ✅ 五件 | `nofy-daemon`:双锁+退出码(3)、watchdog+sd_notify+取证(3+3)、恢复状态机(6)、BufferedDelta e2e、LRU×PSI(7) |
| FR4 状态地基(批次 C) | ✅ | C-1 CJK trigram 检索 131/131(单线程跑;两个 bootstrap 用例对进程级索引管理器有既有并行竞态);写栅栏审计已存在;**DS-#8 fail-closed 门已落**:`durable_barrier`(writer 任务屏障,任一 append 失败即 Err)+ `request_initiation_gate` 接 `run_turn_via_sampler` 发起前;故障注入 3 用例(未耐久→请求不发起/耐久→放行/未启用→零影响) |
| FR2 控制面(批次 D) | ✅ 三件 | `nofy-channel`(11)、`nofy-control-schema`(24 事件漂移门等)、pack 边界(isolate/面所有权,4) |
| FR4.3 全局索引 + B 期装配 | ✅ | `nofy-session-registry`(3)+ daemon 装配(启动权威链/UDS/每连接线程);审批 broker 跨表面(3+wire);attach 流式(盘 delta+LiveBus 扇出+心跳 hangup 探测);search provider 代理(poll/result,验证中) |
| FR10 套件/FR11 编排 | ✅ 全闭环 | 编排状态机+wire 调度 e2e;submit 校验链(DAG+DS-P4+DS-P2+覆盖);TaskDispatch 带 persona/skills;**shell 侧 join 经 `provider_host` 装配钩子落地**(pack_join→subagent-audience AgentBuilder→真推理调用,persona/skill/goal 达模型边界) |
| FR12 文件管家 | ✅ 逻辑闭环 | 内置 pack+`steward.rs`(无 Delete 构造/trash-only、root confinement fail-loud、批=单审批单元、建议批→FR11 TaskSpec verify=all-or-nothing);执行经 shell fs |
| FR1 孤儿清扫 | ✅ | `proc.rs` PID+starttime 活体判定+启动期 TERM/KILL 清扫(3 用例) |
| FR12 文件管家 | 🔶 C-1 已立 | trigram 索引在;steward pack/建议 DAG 待建 |
| FR5 审批 | ✅ 路由+矩阵 | broker 闭环;**NG-F5 矩阵转译落 shell 侧**:`mode_permissions.rs`(FORCE_PLAN/AUTO_APPROVE/SELF_REVIEW/PHASE_DETECT × 六模式)纯查表,tool 分发链在 plan-file 豁免后、权限链前消费;deny(Plan×Write)+allow 4 用例 |
| FR9 工程可信 | ✅ 部分 | 无 key e2e 两度量面;预算棘轮/逐文件覆盖待移植 |

| FR9 工程棘轮 | ✅ 控制面 | `tests/ratchet.rs`:四控制面 crate LOC 只降不升(升=刻意评审) |
|  provider 缝 | ✅ 闭环 | `provider.rs` connect/poll/report/run_loop + **search_poll_once/answer_search**;**shell `provider_host.rs` NOFY_DAEMON_SOCK 门控宿主**(默认关=零新外呼;搜索委托 `execute_search`;断线重连) |
|  app 级集成(队列②) | ✅ | `nofy daemon` 子命令(built binary);`provider_loop_e2e`(built-binary,默认 ignore):真 NOFY_HOME 播种 CJK 会话→控制面 SessionSearch 命中播种会话身份、负例零命中;TaskSubmit→装配→run settle;`EVAL provider_loop=pass` 双跑一致 |

**测试累计(全绿)**:daemon 64+ratchet 1 / channel 11 / schema 7 / registry 3 / shell pack_join 1+接线单元 23(provider_host 5、mode_permissions 4、DS-#8 3、runtime_journal 11)/ 搜索 131(单线程)/ built-binary e2e 31+2 度量面+provider_loop 1。

**施工阶段收尾**:零件层+app 级集成全部闭环;剩余 ① 逐文件 100% 覆盖=CI 政策件(llvm-cov),入设计队列。

**NOT_READY 终态**:清零。search 经 provider 代理为设计实现(非缺口)。

**队列**:① 逐文件覆盖率移植;**设计队列**:空。(DS-#8 fail-closed 门、FR5 策略矩阵转译、provider 循环宿主已落地,见 §11 表。)

**P1 施工已启动**:`ref-analysis/p1-construction-plan.md`(批次 E–J;§7 P1 行与 FR 表优先级列的差异校准、P0 遗留去向见其 §0)。**E0 裁定闭环**(P0 遗留五区逐项结论+证据,见 `p1-dev-log.md`);**E1 闭环**:新 crate `nofy-scheduler`——event-sourced schedule 纯 fold+fork 感知+撕尾容忍+日一 LOC 棘轮(FR3.1/DS-#1 状态核,未接 daemon);双跑 9/9 绿、daemon 回归 65/65 绿。**D-1/D-2 经第一性原理裁定闭环**(保留 AC 依赖项、无依赖项推迟 P2 前置队列,见计划 §0 裁定节与 §7 结算注记)。**E2–E12 闭环 ⇒ 批次 E 收口(AC-3 五句全过)**:`nofy-scheduler` 70 单测+1 棘轮——catch-up(FR3.2)、真 idle 三相+wake 闩(FR3.3)、cron 引擎 repair/watchdog/backoff/自禁用留痕(FR3.4)、cron 文法+双文件+flock+HOME 投递(FR3.5)、定时器单调锚定(FR3.6)、session 栅栏双通道(FR3.7)、fs 触发防抖+预算+拒自毁(FR3.8)、心跳投影+便签(FR3.9)、进程注册表三保证(FR6.1)、workspace 行数预算+依赖审计移除 32 未用依赖(FR9.6);棘轮六次行使 429→2579;E11 经裁定推迟。**批次 F 闭环**:新 crate `nofy-orchestra`(编排执行半,46+1 测试双跑绿)——project.toml 装载 fail-loud(F11.1)、goal 验收纯 fold 不靠自述(F11.2+F4.9)、编排日志确定性回放与真 OrchRun 逐字段等价(F11.3)、barrier fan-in+at-least-once 账本(F11.4+F5.8)、standing mount+父系 join(F10.3)、persona 默认遮蔽(F10.4)、委托行=专家召唤(F10.5)、pack 双编译目标构造级 DS-P4(F10.6)、能力位只收窄+深度只增+fork 完成前缀(F6.4–6.7)。**批次 G 闭环**:新 crate `nofy-governance`(41+1 测试双跑绿)——YOLO 冻结+身份任务局部(F5.5)、自毁命令拒(F5.6)、轮次租约跨表面串行(F5.7)、账本治理投影+死信可见(F5.8→orchestra ledger_gov)、注入抗性固定信封(F5.10)、preset intent+write-through(F5.11)、配置 CAS(F5.12)、pre-auth 预算+洪水守卫(F5.13)、Ed25519 设备身份+challenge+只收窄 caps(F2.6/2.7)、**G11 非 TUI 审批证明单元经真 ApprovalBroker 完成高危批准 fail-closed(D-1 里程碑达成)**;G10 经裁定推迟。**批次 H 闭环**:新 crate `nofy-memorycore`(35+1 测试双跑绿)——冻结快照注入+promptware 扫描(F4.6,会中写不改 prompt)、Curator 硬不变量类型级编码(F4.7)、fork 隔离+缓存重放(F4.8)、higher-seq-wins 投影存储(F4.10)、metadata-only 审计+假名化+retention(F4.11)、七维 compact+密度切割+深度守卫(F4.12)、generations 租约+stale-while-revalidate+OAuth 双检锁 8 线程恰一次刷新(F7.7-7.9);测试捕获真 bug 2 个(双检锁死锁/大写签名漏检)。**批次 I 闭环**:新 crate `nofy-stewardcore`(46+1 测试双跑绿)——roots 空默认两档(F12.1)、fs-index idle 门控+watch 预算降级(F12.2)、结构化 FS_SANDBOX_DENIED(F12.3)、file-activity 图 steward 一等 actor(F12.4)、forget/redaction(F12.5)、索引=提示操作前再验证(F12.9)、租约表 leased=只读(F12.11)、三区分域重叠取严(F12.12)、墓碑+undo --batch(F12.14)、禁区+前三批 dry-run+信任爬坡(F12.15);AC-12 九句全过。**批次 J 闭环 ⇒ P1 六批次全部闭环**:新 crate `nofy-agility`(41+1 测试双跑绿)——脚本沙箱构造级永不 in-proc(F14.6)、script pack 零 Rust 改动(F14.1)、扩展点全协议化 InProc=硬违规(F14.2)、schema-first codegen+conformance(F2.9/F14.3)、generation 热重载+退出码契约(F14.4)、供应链 fail-closed+钩子崩溃不拖管线(F8.1-8.3)、四层浏览器信任栅栏含 DNS rebinding(F5.4)、Web 先栅栏后投影同一真相(F13.2)、预演区三次法则(F14.5);AC-14/AC-8/AC-13 首句/AC-5 DNS rebinding 全过。**P1 里程碑四项达成**(合盖继续/webhook 批高危/pack 两形态/manifest 单任务/Python pack 零 Rust)。六新 crate 共 283 单测+6 棘轮双跑绿,棘轮行使 11 次,knip 移除未用依赖 40 个,真 bug 5 个测试捕获修复。推迟项入 P2 前置队列(E11/G10/H0/J9 等,裁定在案);六 crate 为纯策略核,daemon/shell 接线属 P2 集成批次。**P2 开工·批次 K 闭环**:orchestra 扩 task.* 日志族(稠密 seq+终态终结+崩溃对账,FR11.5)、per-task on_fail DAG(FR11.6)、scheduler×pack 周期桥不堆积(FR11.7)、一次 Ask 逐条账本 fail-closed(FR11.8),scheduler 扩系统事件总线+presence+wake 闩存(FR3.10);orchestra 71+1/scheduler 75+1 双跑绿,棘轮三升。**里程碑「任务 DAG+批审批」达成**。**批次 L 闭环**:新 crate `nofy-surfaces`(20+1 双跑绿)——webhook 全表面三道门(签名/信封/去重,FR13.3)、IM 契约卡片+应答解析通道无关(FR13.4)、会话谱系严格代际链(FR2.10)、表面迁移持引用不持状态+真相一致性(FR13.1,P2 前置兑现);AC-13 两句全过。**批次 M 闭环**:新 crate `nofy-marketplace`(21+1 双跑绿)——pack 元数据创作门+校验和+索引发现(FR10.8)、内置 file-steward 与示范 code-review 过第三方同一道门不特例化(FR10.9)、插件 manifest 验证+隔离区准入(FR8.4)、docker build-arg 白名单 all-or-nothing(FR8.5)、通道适配器契约拒 no-op(FR8.6)。**批次 N 闭环 ⇒ 里程碑「file-steward 上线」达成**:stewardcore 扩 mgmt(trash-over-delete 构造级+两阶段 intent+回滚快照,FR12.6)、extract(提取管线 embeddings 默认关,FR12.7)、suggestions(建议→真 orchestra DAG→批审批,FR12.8)、handoff(租约移交+项目地盘降级建议者,FR12.13);70+1 双跑绿。**批次 O 闭环 ⇒ P2 前置队列清空**:memorycore 补 injection 三档注入(FR4.5)/dreaming 三相蒸馏 preimage 可回滚(FR4.13)/compleases 跨进程压缩租约(FR9.7);governance 补 classifier 三策略骨架(FR5.14)/selfmod per-package 人批(FR5.15)/guards 双件(FR9.8);新 crate `nofy-runtimecore`(30+1 双跑绿)——persistence 三原则+uncertain 语义(FR1.12/1.13)、unitgen(FR1.14)、coldstart 快路径(FR1.15)、envsnapshot 原子发布+注入安全(FR6.2)、cwdmark(FR6.3)、workerroute 出会话路由+擦洗 env+配对账本(FR6.8/6.9)、bootcheck(FR1.16);seal 体系——trajectory 头尾保护+密封测试注册表(FR9.9)、逐文件接线审计=死码探测器(FR9.10),daemon 棘轮 3→5 测试;surfaces interruption(FR2.8)+governance hubgate 单次授权防重放(FR2.11)。**P2 收口**:三里程碑达成——任务 DAG+批审批(K)、第三方零核心改动接表面(L+M:第三方 pack/插件/适配器全走核心同一道门,零特例)、file-steward 上线(N);AC-8 两句(manifest 零核心改动接入=M 同一道门;钩子崩溃不拖管线=J6)、AC-11 四句(manifest 编译=F;goal fold=F;task.* 崩溃对账续跑=K re_dispatch_list;escalate 跨表面审批=K on_fail+batchapproval)、AC-12 九句(I+N:加载期租约拒/重叠取严/墓碑解析/新根三批 dry-run/外部对账归因)、AC-13 两句(L)全过;P2 前置队列清空;十策略核 513 单测+14 棘轮件全绿双跑,workspace 预算 1,545,571。**批次 P 闭环 ⇒ P3 收口 ⇒ PRD §7 路线图(P0–P3)全部闭环**:runtimecore execworld(docker/ssh 执行世界,default-off+能力只收窄,FR6.10)、stewardcore osbridge(Spotlight/Everything provider 评估门:只读/仅提示/default-off/本地 IPC 四条不可协商,FR12.10)、marketplace realmcheck(驱动真 compose_packs 的 realm 隔离评估);FR6.8 已于 O3 兑现;里程碑「执行世界谱系」达成;十策略核 529 单测+14 棘轮件,workspace 预算 1,546,130。**集成阶段开工(批次 Q,计划见 `integration-plan.md`)**:Q0 解环闭环——新 crate nofy-packcore(pack.rs 逐字下沉)、orchestra.rs 逐字归核、governance→daemon 降 dev 依赖,依赖 DAG 无环,daemon 控制面 3,707→2,968 只瘦不胖,测试守恒(迁出不删除);Q1 governance 接线闭环——lifeguard 自毁请求控制边界即拒(FR5.6)、broker 存信封化 summary(FR5.10)、preauth 连接预算起线程前裁决(FR5.13),daemon 54+5 双跑绿;Q2 steward 接线闭环——validate 委托 roots 分类、租约加载期门点名持有者(AC-12)、两阶段 intent+trash-only 提交+回滚快照委托 mgmt(FR12.6),daemon 57+5 双跑绿;Q3 orchestra 接线闭环——submit 编译 P2 DAG 引擎(fail-loud+per-task on_fail 映射,FR11.6)、task.* 日志上运行时(submit 即 Armed/派发 Claimed/结算 Settled/升级 Escalated,崩溃 re_dispatch 对账,FR11.5/AC-11)、escalation 裁决过批审批账本 fail-closed(FR11.8),daemon 61+5 双跑绿;Q4 scheduler 接线闭环——daemon 新增 SchedulerService:default-off 构造,文法门/catch-up/自禁用/fence 全委托 nofy-scheduler 核(FR3.2/3.4/3.5/3.7),daemon 66+5 双跑绿;Q5 闭环——daemon 表面网关:webhook 三道门→审批应答进 broker、IM 卡片出/应答解析进(FR13.3/13.4 运行时路径),daemon 72+5 双跑绿;shell 五处深接缝识别在案专项跟进(计划 §4)。**集成阶段收口**:Q0–Q5 全闭环,依赖 DAG 无环(daemon→六核→packcore),策略始终在核内,daemon 测试 52→72 双跑绿;在案:daemon 胶积累趋势、shell 深接缝专项。**批次 R 闭环(持久化层)**:orchestra TaskLogStore(task.* 落盘,撕尾截断,崩溃对账直读磁盘,AC-11 真正成立)、daemon 任务日志接线(attach+双写+启动对账)、scheduler 服务 recover(非空日志证明启用态);daemon 75+5、orchestra 80 双跑绿。**批次 S 闭环(完整 run 跨重启续跑)**:runstore 原子计划持久(tmp+sync+rename,损坏 fail-loud)+resume_run 经核 fold_orch 重建状态(FR11.3 回放复用,不重新发明)+完成即清计划;daemon 80+5 双跑绿。**批次 T 闭环(接线胶抽取)**:run 生命周期迁出 daemon.rs 入 runlife.rs、serve_connection/stream_session/socket 助手+15 走帧测试迁入 wire.rs,均 re-export shim 保路径;daemon.rs 单文件 1,820→232(只剩启动装配),胶趋势逆转到位;daemon 80+5 双跑绿。**批次 U 闭环(调度控制协议)**:schema 增 Schedule* 四方法+条目投影(附加漂移门)、wire 分派 default-off 拒绝结构化出行、run() 启动 recover(schedule.jsonl,损坏降级 default-off 出声),R3 持久化链路闭环;schema 8、daemon 82+5 双跑绿。

## 附录 C:变更史

v1(产品草图)→ v2(源码级,六深抽;纠正 Leader/协议/状态三认知;补 §3.10 套件、§3.11 任务管理、§3.12 文件管家)→ PRD-1.0(需求编号化+AC+NFR+非目标+里程碑)→ PRD-1.1(施工状态回写;search provider 代理清零 NOT_READY)→ **PRD-1.2(队列②+设计队列清零:provider 循环宿主、DS-#8 fail-closed 门、FR5 策略矩阵落地;搜索应答增 `sessions` 命中身份,棘轮二次行使)**→ **PRD-1.3(P1 施工计划立项:`p1-construction-plan.md` 批次 E–J;§0 校准 §7 行与 FR 表差异并收编漏列 P1 项;§11 加指针;需求正文未动)**→ **PRD-1.4(P1 开工:E0 裁定闭环+`nofy-scheduler` 状态核落地;§11 更新;需求正文未动)**→ **PRD-1.5(D-1/D-2 第一性原理裁定:P1 行结算——保留 AC 依赖项、推迟无依赖项至 P2 前置队列;§7 加结算注记;FR 条目优先级未动)**→ **PRD-1.6(P1 六批次全部闭环:E–J 逐批 AC 对账通过,六新 crate 落地,里程碑四项达成;§11 更新;需求正文未动)**→ **PRD-1.7(P2 五批次全部闭环:K–O 逐批落地——任务 DAG+批审批、第三方零核心改动接表面、file-steward 上线三里程碑达成;AC-8/AC-11/AC-12/AC-13 P2 条款对账通过;P2 前置队列清空;新 crate nofy-surfaces/nofy-marketplace/nofy-runtimecore 落地,策略核共十枚;§11 更新;需求正文未动)**→ **PRD-1.8(P3 批次 P 闭环:execworld/osbridge/realmcheck 三件落地,FR6.8 已于 O3 兑现;里程碑「执行世界谱系」达成;§7 路线图 P0–P3 四行全部闭环;§11 更新;需求正文未动)**。
