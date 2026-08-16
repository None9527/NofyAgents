# P0 施工计划(批次 A 收尾 + 批次 B 常驻可靠性)

> 输入:`os-agentic-prd-final.md`(PRD-1.0)、`SANITIZATION_PLAN.md`(M1/M2 已完成)、`os-features/grok-build-integration-map.md`。
> 纪律:动任何符号前先做影响分析(workspace 规则);每批次以无 key e2e(`MockInferenceServer`)+ 编译零错误为门槛;不新增 in-proc 插件。

---

## 0. 现状校准(PRD 假设 vs 仓库实况)

| PRD 假设 | 实况 | 净影响 |
|---|---|---|
| 批次 A 从零开始 | **M1 完成**(auth 剥离、BYOK 扶正、净删 45k 行、e2e 31/31)+ **M2 完成**(改名 Nofy、env/目录/ACP 命名空间) | 批次 A 只剩收尾(A'),施工真正起点前移 |
| `rg grok/xai` 归零为验收 | 决策记录保留 provider 语义标识符+模型 ID | PRD §9 已修正 |
| Leader 器官可复用 | M1 的 S3b/c 已删 relay/leader ~13k 行;残留仅 test-support 夹具与 policy 链形状 | daemon 填位更干净,无活体冲突 |
| evals 度量回路存在 | 已删,未重建 | **B 期必补**(B0),否则崩溃恢复率无测量面 |

---

## 1. 批次 A'(脱敏收尾,≈1–2 周)

| 步 | 内容 | 触点(已核实存在) | 验收 |
|---|---|---|---|
| A'1 | 遥测 NOOP 化:删 `nofy-mixpanel`;`nofy-telemetry` 外部 OTLP/Mixpanel emission 改为 PI-F25 式"契约+NOOP 默认+opt-in adapter";保留 `redact_common` | 引用点:`nofy-pager-bin/src/main.rs`、`nofy-pager/src/{plugin_cmd,mcp_cmd}.rs`、`app/{signal_handler,mermaid_worker}.rs`、`nofy-agent/src/plugins/manifest.rs` | 默认启动零外呼(网络白名单测试);e2e 31/31 回归绿 |
| A'2 | 删归因:`nofy-sampler/src/attribution.rs`(+`lib.rs:20/36` 导出)、`nofy-pager/src/client_identity.rs` | sampler/pager | `rg attribution` 仅余文档 |
| A'3 | 删运营件:`nofy-update`、`nofy-announcements`、`nofy-config/src/campaigns.rs`、billing 残引用 | 根 Cargo.toml workspace 成员+引用点 | 编译零错误;无安装脚本回连 |
| A'4 | `EndpointsConfig` 单一来源审计:20+ 文件 `api.x.ai` 引用收敛为单一 resolver(FR7.6);默认值保留 xAI(开箱可用)但**所有消费点只经 resolver** | `nofy-env`、sampler、web_search、image_gen、memory backend、auth credential_provider | resolver 单测:换 base_url 后全消费点生效;无绕过引用 |
| A'5 | hub_auth 漏网项(M2 审计已点名 workspace 6 文件)按 B 组处置 | `nofy-workspace/src/hub_auth.rs` 等 | OIDC 残引用=0 |

**A' 出口**:PRD FR7.6/FR9.4 + §6 专有商业件条款闭合;`SANITIZATION_PLAN` 里程碑 3 记为完成。

## 2. 批次 B(常驻可靠性 FR1,≈4–6 周)

**B0(前置,1 周)**:重建度量回路——evals 脚手架(任务完成率/崩溃恢复率/压缩保留率/对账检出率),落 `nofy-test-support` + CI lane。无 B0 则 B 的验收悬空。

| 步 | FR | 落点 | 关键实现参照 |
|---|---|---|---|
| B1 | FR1.1/1.6 | 新 crate `nofy-daemon` 骨架:lock-file 单实例双锁+PID 复用防御+退出码契约;daemonize 复用 `nofy-workspace/src/daemonize.rs`(double-fork 先于 tokio) | OC-F1、HM-F4;夹具语义取 `nofy-test-support/src/leader.rs` |
| B2 | FR1.4/1.5 | watchdog 双活:环内滞后采样+环外 sd_notify;非干净死亡取证账本+cgroup 清扫 | HM-F1/F3 |
| B3 | FR1.7/1.10/1.11 | 崩溃恢复状态机+interruptedTurnClosers 移植(两码闭合+幂等重试指引)+write-behind flush barrier;持久化继承 `nofy-session-journal` 不变量 | DS-#16/#18(`repair.ts:27-134` 语义移植 Rust) |
| B4 | FR1.9 | BufferedDelta:serve/Hub 断线切缓冲+Attach(last_seq) 增量重放 | NG-F1(`buffered_delta.go`) |
| B5 | FR1.8/1.2/1.3 | 会话 LRU+cgroup 驱逐;通道健康监视器+重启预算;重启哨兵+持久投递队列 | HM-F6、OC-F2/F6 |
| B6 | FR9.5 | probe 二进制验收模板扩展为 daemon 探针(`PROBE_OK`) | MAP-§5.2 |

**B 出口验收(AC-1)**:并发双启必拒;`kill -9`→新实例 journal 对账续跑、未闭合 intent 有清单;楔死 60s 检出;DETACHED 可 resume;B0 度量面板显示崩溃恢复率 ≥99.5%。

## 3. 批次 C/D 轮廓(不展开,B 出口后细化)

- C:FR4.1/4.2 写栅栏+checkpoint fail-closed;FR4.3/4.4 全局索引+CJK FTS;FR1.15 冷启动快速路径。
- D:FR2.1-2.5 控制面(schema 载体**默认 JSON Schema**,决策项#5 如此关闭;protobuf 留优化位);FR10.1/2/7 pack 边界;**Leader 不恢复**(决策项#1 关闭,`resolve_leader_mode` policy 链形状收编为 daemon 开关)。

## 4. 施工顺序与风险

```
A'(1-2w) → B0(1w) → B1-B6(4-6w) → C → D
```

- 风险 1:A'1 引用点散布 pager 主路径——先做"NOOP 替身编译通过",再逐引用点删,避免大爆炸合并。
- 风险 2:B3 的 Rust 移植不是照抄 TS(无 deepcopy):按"快照+新运行时"重写(HM-不吸收教训)。
- 风险 3:daemon 骨架日即 god-object 风险日——B1 起对 `nofy-daemon` 挂行数棘轮(OC-F28)。

## 5. 第一个施工动作

**A'1 遥测 NOOP 化**(最小闭环、零设计争议、验证整条施工流水线:影响分析→改→无 key e2e→探针)。

### A'1 施工记录(已执行)

- 影响分析:GitNexus impact(TelemetryClient,LOW)+ grep 全枚举(nofy-mixpanel 唯一依赖方=telemetry;mixpanel 配置字段消费方=shell config mod/tests/agent-config)。
- 删除 `crates/codegen/nofy-mixpanel` crate+workspace 成员+依赖行。
- `nofy-telemetry`:client.rs 移除 Mixpanel 路由(`track` 签名不变,9 个依赖方零改动),`sync_profile` 保留签名变 no-op(调用点兼容),config.rs 移除 `mixpanel_token/mixpanel_enabled` 字段与 env 覆盖,文案去 Mixpanel 化。
- `nofy-shell`:config/mod.rs 移除两条 enforce 块;config/tests.rs 与 agent/config.rs 测试夹具/断言同步。
- 保留:events_url/events_api_key 配置化产品事件路径(默认 None=零外呼,符合"opt-in adapter"形态);OTLP 外部导出维持 `NOFY_EXTERNAL_OTEL` 门控。
- 验证:✅ `cargo check -p nofy-telemetry -p nofy-shell` 零错误;✅ `cargo test -p nofy-telemetry` 全绿;✅ `cargo test -p nofy-shell --lib -- telemetry requirements` 49 passed/0 failed(含 product_analytics 双门)。
- **A'1 闭环**。

### A'1b Sentry 移除(已执行,验证中)

- 触面核实:13 个"sentry"命中里仅 3 处真接线(main.rs init/drop/flush、signal_handler flush),其余为测试夹具任意插件名与文档示例,不动。
- 删除 `nofy-telemetry/src/sentry.rs`(427 行)+`pub mod sentry`+`sentry` crate 依赖(7 个 feature);main.rs 初始化块/drop/flush 三处与 signal_handler flush 一处移除;`shutdown_and_flush_telemetry` 保留 OTEL+debug_log flush。
- 保留:`is_error_reporting_disabled_sync`(enterprise requirements 旋钮,语义独立于 Sentry 本体)。
- 验证:✅ cargo check(telemetry/pager/pager-bin)零错误;✅ telemetry 测试 exit 0。**A'1b 闭环**。
- 顺带发现:nofy-pager 3 个 warning 为 M1 leader 删除残留(`unsupported_leader_flags` 等),记入清理清单(B 期或独立 hygiene 批)。
### A'4 EndpointsConfig 单一来源(已执行,验证中)

- 单一源:`nofy-env` 新增 `PROD_XAI_API_BASE_URL`(".../v1")+ `PROD_XAI_API_ORIGIN`(裸 host),与既有 PROD_* 端点常量同位。
- 迁移 56 处精确字面量(17 文件):shell config 的 `XAI_API_BASE_URL_DEFAULT` 改为引用单一源;voice/tools/memory/agent/shell-base/auth/remote 消费点全经常量。
- 误伤修复:toml 夹具内带引号字面量被替换后失引号(voice config 1 处、shell agent/config 12 处),已还原为 toml 文本字面量(夹具语义=用户配置文本,本就该是字符串)。
- 对抗性测试夹具(evil.example/@attacker)与派生路径断言(/models、/api-key)按纪律不动,记 hygiene 跟进。
- 依赖边:voice/agent/shell/memory 补 `nofy-env`(低层 crate,方向正确)。
- 验收:✅ cargo check 七 crate 零错误零警告;✅ 定向回归全绿(voice 69、shell-base 37、shell config+models 1004、tools web_search/image_gen 26、memory)。期间修复 JSON 夹具误伤 1 处(types.rs set_options payload)。
- 环境事件:根分区被 incremental 缓存撑到 100%,清 `target/debug/incremental`(125G)恢复至 94%;后续大编译前先看 `df`。
- **A'4 闭环。批次 A 剩 A'2/A'3。**
- **批次 A 出口**:A'1/A'1b 闭环,A'4 验证中;A'2(attribution/client_identity)、A'3(update/announcements/campaigns)排队。
