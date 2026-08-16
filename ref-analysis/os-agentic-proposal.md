# grok-build → OS-level Agentic 推进方案

> 输入:五份参考分析(`ref-analysis/` 下 pi / hermes-agent / openclaw / deepseek-harness 系列 / NGOAgent 对照)+ `docs/` 14 篇 grok-build 现状。
> 立场:产品经理视角,结论先行;所有"借鉴"均标注出处,所有"现状"均标注 grok-build crate。

---

## 0. 结论先行

**grok-build 是五个参考里唯一同时拥有"强项目执行能力"和"daemon 种子"的产品,推进 OS agentic 的正确路径不是另起全局产品,而是把控制面上提一层:从"每 workspace 一个 Leader"演进为"每主机一个 Host Daemon + N 个 workspace 执行单元"。** 用户洞察成立:项目逻辑天然可被全局包含——workspace 会话只是全局 agent 的"任务落在某个执行世界"的特例。openclaw/hermes 证明了全局形态的需求真实存在,但它们的执行能力(沙箱、工具深度、会话纪律)弱;grok-build 反方向补齐控制面,成本远低于它们补齐执行面。

OS agentic 在本方案里的定义(三层,缺一不可,但分阶段交付):

| 层 | 含义 | 参照 |
|---|---|---|
| L1 常驻 | 每主机一个守护进程,任务可从 cron/事件/任意表面发起,不依赖某个终端会话活着 | openclaw gateway、hermes gateway |
| L2 跨域 | 状态/记忆/调度以主机为域,workspace 是执行单位而非边界;全局会话注册表 | hermes 全局记忆+FTS5、dsh home 层 |
| L3 系统面 | agent 有 OS 级感官与手:fs 事件、浏览器、通知、多表面(TUI/IDE/IM/Web)平等接入、跨表面审批 | openclaw channels+nodes、grok 现有 computer-hub/fsnotify |

---

## 1. 调研结论:五参考的能力矩阵

| 能力 | grok-build | openclaw | hermes | pi | dsh | NGOAgent |
|---|---|---|---|---|---|---|
| 项目执行深度(工具/沙箱/压缩) | **强** | 中 | 中 | 中 | 强 | 中 |
| 常驻 daemon | **种子(Leader/Hub,per-workspace)** | **per-host** | **per-host** | 无(server 实验性) | 无 | webui 服务 |
| 多渠道 IM | 无 | **30 渠道插件** | **22 平台插件** | 无 | 无 | webhook |
| 调度 cron | 无(workflow 是任务内编排) | 有 | **有+croniter+投递任意平台** | 无 | 有(schedule 包) | 有 |
| 全局记忆 | **种子(全局+workspace 双层)** | **USER/MEMORY/每日/DREAMS** | **MEMORY/USER+curator 自改进** | 无 | 无 | 有 |
| 跨会话检索 | 记忆语义搜索 | 向量可选 | **FTS5+CJK** | 无 | FTS5 | 有 |
| 多表面客户端 | TUI+ACP+serve+headless | **WS 多端+原生 app** | CLI+3 前端 | TUI+rpc | Web+ACP+SDK | WebUI |
| 执行世界可换 | 沙箱内核级,单世界 | 沙箱/策略/提权正交 | **7 终端后端** | 无(交给容器) | provider 谱系宽 | Forge |
| 会话纪律/可回放 | 有(hunk/recovery) | writer-run 声明 | 有 | JSONL 树 | **model-visible⟺logged+llm-replay** | 状态机 |
| 隐私默认 | **需脱敏(Mixpanel/Sentry)** | 零遥测 | 零上传 | NOOP 契约 | 默认 DISABLED | 本地 |

读法:**左列(执行面)grok-build 不输任何人;右列(全局面)openclaw/hermes 有而 grok-build 缺,但缺的几乎都是"控制面组件",不是"执行面能力"。** 控制面组件的特征是:协议和契约比代码量重要,可以分阶段、按插件长出来。这正是方案可行的根据。

两个反面教材必须记住:

- hermes `gateway/run.py` 28k 行、openclaw gateway 70+ 子域——**全局 daemon 做成 god object 是这条路上最常见的死法**。
- dsh 的图证据(包级 CALLS 近零)证明:**执行核心保持零耦合,全局层只做编排,才能两头都强**。

---

## 2. grok-build 现状盘点:比想象中近

| 目标件 | 已有种子(crate/文档) | 差距 |
|---|---|---|
| Host Daemon | `Leader` 模式 + `xai-grok-workspace` 的 `daemonize.rs`、`hub_server.rs`(WS Hub、hub_auth) | Leader 语义是 per-workspace;需上提为 per-host,workspace 降为它管理的执行单元 |
| 多客户端协议 | ACP(JSON-RPC,`leader_bridge.rs` 已做断线重连+状态重放 `StdioReplayState`)、`serve` 模式 | 协议面分散(ACP/Hub/serve 三套);需收敛为一个 schema-first 控制面协议 |
| 全局会话注册 | `foreign_sessions.rs`(发现外部会话)、`recovery.rs` | 只发现不编排;需升级为全局 session registry + 路由 |
| 全局记忆 | `xai-grok-memory` 全局 `~/.grok/memory/` + workspace 双层、`MemoryBackend` trait | 缺策展/蒸馏闭环与跨会话全文检索工具 |
| 事件感官 | `xai-fsnotify`、`xai-system-power`(睡眠/唤醒/电池)、voice | 事件没有进入"可触发任务"的总线,只是工具级通知 |
| 执行世界 | `xai-grok-sandbox`(Landlock/Seatbelt/bwrap/seccomp)、`xai-fast-worktree` | 单世界;缺 remote/container 后端谱系 |
| 辅助模型路由 | 模型类别表(default/web_search/image_description/session_summary) | 概念已在,缺 fallback 链/成本闸门/compat 旗标 |
| 插话/转向 | `xai-interjection-core` | 单表面;需跨表面(IM 里批准/插话) |
| 浏览器手 | `xai-computer-hub-*` | 已具备,纳入 OS 面即可 |

**盘点结论:P0 不需要发明任何新范式,只需要"提升现有件的管辖范围 + 收敛协议"。**

---

## 3. 目标架构

```
┌────────────────────────────── 表面层(Surfaces,平等客户端)──────────────────────────────┐
│  TUI(现有)   ACP/IDE(现有)   headless/CI(现有)   Web(serve 升级)   IM channels(新)   │
└───────────────┬──────────────────────────────────────────────────────────┬──────────────┘
                │            控制面协议(schema-first, WS+JSON, 幂等键)      │
┌───────────────▼──────────────────────────────────────────────────────────▼──────────────┐
│                          Host Daemon(每主机一个,原 Leader 上提)                          │
│  会话注册表(全局)   调度器(cron/interval/fs 事件)   模型路由+generation 快照              │
│  审批 broker(跨表面,fail-closed)   记忆策展器   channel 适配器宿主   执行世界注册表        │
└───────────────┬──────────────────────────────────────────────────────────┬──────────────┘
                │                    管理 N 个执行单元                       │
┌───────────────▼──────────────────────────────────────────────────────────▼──────────────┐
│              Workspace Runtime ×N(现有 agent 核心,保持项目执行纯度,零改动范式)            │
│  agent loop / 30+ 工具 / 沙箱 / 压缩 / workflow / 子代理 / hunk / recovery                │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

六条架构原则(每条都有出处):

1. **Daemon 只编排不执行。** 循环、工具、沙箱留在 workspace runtime;daemon 崩溃不丢任何在飞工作(hermes/openclaw god-object 反例;dsh 零耦合正例)。
2. **执行单元 = 执行世界。** workspace 绑定一个"世界"(local/sandbox/container/ssh),世界可换、会话可迁(hermes `BaseEnvironment` 七后端;dsh e2b"fs+subprocess 同世界一起换")。
3. **控制面协议 schema-first。** 一份 schema 生成 TUI/Web/IM 桥的客户端类型;副作用方法带幂等键;认证在传输层(openclaw `gateway-protocol` 做法)。
4. **配置热加载用 generation 快照。** daemon 启动/重载时为每个 agent 构原子快照,运行从快照 fork,新旧永不混发(openclaw generations)。
5. **model-visible ⟺ logged 上提为产品契约。** 任何表面发起的任务,其模型可见输入必须落在会话日志;IM/审批/插话产生的上下文一律作为日志事件注入(dsh 不变式;这使"在手机 IM 里批准、回 TUI 继续"天然成立)。
6. **默认零遥测、全 BYOK。** 脱敏是 OS agent 的隐私卖点而非成本(openclaw/hermes/pi 三家一致;SUMMARY 已有脱敏计划)。

---

## 4. 借鉴清单:每个机制的出处与落点

| # | 机制 | 出处 | grok-build 落点 |
|---|---|---|---|
| 1 | 两层 provider 抽象(传输适配器×provider 目录)+ compat 旗标 + `samplingParams` 逃逸舱 | openclaw §4、pi §3 | `xai-grok-models`/`sampler`:脱敏主战场,SUMMARY 已规划 |
| 2 | 声明式 auth method 一对象驱动 CLI/向导/UI;8 级凭据解析;仅限流轮换 | openclaw §4.2、hermes §4 | `xai-grok-auth`/`secrets` |
| 3 | Channel 插件契约:静态 manifest 可不加载运行时读取;`requires_env` 进 setup 向导 | openclaw §5、hermes §7.1 | 新 crate `xai-grok-channel`(契约先行) |
| 4 | cron/interval + 投递目标(`*_HOME_CHANNEL`)+ 进程外投递 | hermes `cron/` | daemon 调度器 |
| 5 | 记忆策展不变量:只碰自创、永不删只归档、pinned 豁免、辅助模型不动主缓存 | hermes `curator.py` | `xai-grok-memory` 全局层加 curator |
| 6 | FTS5 跨会话检索(+CJK tokenizer) | hermes `native/fts5_cjk` | 全局 registry 的 `session_search` 工具 |
| 7 | writer-run 声明防并发写坏;state 目录锁 | openclaw §6 | 全局 registry 写一致性 |
| 8 | generations 配置快照 | openclaw §3 | daemon 模型路由 |
| 9 | 终端后端 ABC:每命令 spawn、登录 env 快照、CWD 带内持久 | hermes `tools/environments/base.py` | 执行世界注册表(local→docker→ssh) |
| 10 | 跨表面审批:Allow/Auto/Ask + 高风险熔断 + 任意在线表面应答,fail-closed | NGOAgent 安全钩子、openclaw approvalCapability | 审批 broker(复用 `xai-interjection-core`) |
| 11 | llm-replay 式无 key e2e + faux provider | dsh、pi `faux.ts` | CI 纪律,OS 面组件的回归底座 |
| 12 | 断线重放恢复(`StdioReplayState` 已有)+ SSE/WS 缓冲恢复 | grok 现有 + NGOAgent | 控制面协议的 resume 语义 |
| 13 | skill 自改进闭环(creation nudge + 后台 review fork) | hermes §6 | P3 生态差异化 |
| 14 | 沙箱/工具策略/提权三正交 | openclaw docs | 权限模型重写参照 |
| 15 | hooks 桥消费 CC/Codex hooks.json | dsh `hooks` | 生态兼容(已有 hooks,补映射) |

---

## 5. 分阶段路线图

### P0 — 脱敏 + Daemon 地基(4–6 周)

目标:**一台机器一个 daemon,TUI/ACP/headless/Web 四个表面连同一个 daemon,会话可断线重连。**

- 0.1 BYOK provider 层(借鉴 #1/#2):`openai-completions` 单传输 + compat 旗标 + `models.json` 式零代码自定义;删专有认证回连。验收:对 vLLM/Ollama/LiteLLM 三自建后端跑通无 key 之外的全部 e2e。
- 0.2 Leader 上提:新增 `grok daemon`(per-host),原 per-workspace Leader 降级为其子单元;`daemonize.rs` 复用;systemd/launchd 安装子命令(openclaw `onboard --install-daemon` 参照)。
- 0.3 控制面协议 v1:收敛 Hub/serve/ACP 为一套 schema-first WS 协议(#3 的协议面、#12 的 resume);`session/new|load|prompt|update` 保持 ACP 兼容,编辑器不断粮。
- 0.4 遥测清零:Mixpanel/Sentry 移除,OTel 留 opt-in adapter(pi-telemetry 契约)。
- 验收指标:daemon 崩溃后 TUI 自动重连并重放(现有 `leader_bridge` 能力变成产品级);`grok -p` 与 TUI 看到同一会话历史。

### P1 — 调度 + 全局记忆 + 事件总线(4 周)

目标:**任务可以不靠人发起。**

- 1.1 调度器:cron/interval + 投递目标(#4);`grok cron add "每天 9 点总结昨日 commit"` 形态。
- 1.2 事件触发:fsnotify/系统唤醒事件进 daemon 事件总线,可绑定任务("deps 变更跑测试");防抖与预算内置。
- 1.3 全局记忆 curator(#5)+ `session_search` FTS5(#6);冻结快照注入保护前缀缓存。
- 1.4 全局会话注册表 + writer-run(#7):跨 workspace 列出/恢复/继续会话;`foreign_sessions` 升级。
- 验收指标:合上笔记本,cron 与事件任务继续跑;醒来 TUI 看到完整转录;跨项目 `session_search` 命中。

### P2 — 多表面 + 跨表面审批(6 周)

目标:**人可以在任何表面与 agent 完成闭环,包括批准高危操作。**

- 2.1 channel 契约 v1 + 两个实现:webhook(api_server 形态)与 feishu 或 telegram(#3);DM 汇入主会话、群聊隔离、allow-from 白名单(openclaw §5 路由语义)。
- 2.2 审批 broker(#10):Ask 推送到任意在线表面,`allowed-once` 粒度,fail-closed;IM 里回"yes"即 TUI 里放行。
- 2.3 generations 快照(#8)落地模型路由热加载;fallback 链 + 辅助模型成本闸门(hermes `auxiliary`)。
- 验收指标:手机端 IM 批准一次 `rm -rf` 级操作的全链路录屏;渠道插件第三方可按契约零核心改动接入。

### P3 — 执行世界谱系 + 生态(持续)

- 3.1 执行世界注册表(#9):docker/ssh 后端 v1;workspace 可迁世界(dsh e2b 原则:fs+subprocess 同世界换)。
- 3.2 skill 开放标准兼容(agentskills.io / SKILL.md)+ 自改进闭环(#13)。
- 3.3 插件市场三层化:provider / channel / skill;信任与 override 闸门(hermes registry 安全闸)。
- 3.4 原生伴侣(app)评估:openclaw 的 Swift/Kotlin apps 是重资产,先以 Web+IM 覆盖,不承诺。

---

## 6. 明确不做(anti-scope)

1. **不做 22 个渠道。** 契约 + 2 实现;渠道是社区插件位,不是核心团队 KPI。
2. **不把 agent loop 移进 daemon。** 执行纯度是 grok-build 对 openclaw/hermes 的唯一护城河。
3. **不做运行时 in-process 插件树**(不抄 Cordis/dsh 的 TS 特有能力);插件走子进程+协议(ACP/MCP/JSON-RPC),语言中立、安全边界清晰。
4. **不做专有云依赖。** 无托管目录强回连(可关即默认关)、无计费视图、无厂商 OAuth 硬绑定(hermes 可剥离性实证)。
5. **P3 前不做原生桌面/移动 app。** 表面层先用协议换生态。
6. **不为全局层引入新存储范式。** sqlite 一贯到底(hermes/openclaw 同选择),WAL 降级逻辑抄 hermes。

---

## 7. 风险登记

| 风险 | 概率 | 影响 | 缓解 |
|---|---|---|---|
| daemon 滑向 god object | 高 | 致命 | 原则 1 写进 AGENTS.md;crate 依赖图门禁(dsh verify-* 式脚本);daemon crate 行数预算 |
| 脱敏不彻底留下回连 | 中 | 高 | 网络出口白名单测试;`GROK_OFFLINE` 档(pi `PI_OFFLINE`) |
| 三套协议收敛伤编辑器生态 | 中 | 高 | ACP 兼容层保留一个版本周期;schema 版本协商 |
| 跨表面审批 UX 碎片化 | 中 | 中 | 审批 broker 单点;所有表面渲染同一审批事件(log-only 审计) |
| Rust 插件生态冷启动 | 高 | 中 | 子进程协议+Markdown skill 双轻面;不追求 in-proc |
| IM 渠道供应链(baileys 类) | 中 | 中 | 渠道独立进程隔离;openclaw `minimumReleaseAge` 式供应链门禁 |

---

## 8. 成功指标(北极星 + 过程)

- **北极星**:非 TUI 发起且跨表面闭环的任务占比(月活任务中 ≥ 20% @ P2+3 月)——该指标直接度量"OS 化"而非"多了个 bot"。
- 过程:daemon 7 日存活率 ≥ 99%;断线重连成功率 ≥ 99.5%;审批 p95 ≤ 30s;无 key e2e 覆盖率 100%(CI 不依赖真实端点);社区 channel/skill 插件数(生态斜率);全局记忆策展后 30 日留存条目比(只增不删的归档率)。

---

## 9. 一句话总结

openclaw/hermes 用弱执行换来了全局形态,pi/dsh 用强执行守住了项目边界;**grok-build 的 OS agentic 不是二选一,而是把已有的 Leader/Hub/记忆/感官种子按"daemon 只编排不执行"的原则上提一层——控制面抄 openclaw 的协议纪律、hermes 的调度与策展、dsh 的会话契约,执行面一寸不让。** P0 六周内可见第一个产品级里程碑:一台机器、一个 daemon、四个表面、同一份会话真相。
