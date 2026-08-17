# P1 施工计划(跨域治理:批次 E–J)

> 输入:`os-agentic-prd-final.md`(PRD-1.2,§7 路线图 P1 行 + §4 FR 表 + §11 看板)、`p0-construction-plan.md`(纪律模板)、`p0-dev-log.md`(P0 实况)。
> 纪律(承 P0):动符号前先影响分析(workspace 规则);每批次以无 key e2e(MockInferenceServer/built-binary)+编译零错误为门槛;不新增 in-proc 插件(§6);新 crate 首日挂 LOC 棘轮(OC-F28);行号引用纪律——本计划只引已核实的文件路径,不虚构行号。

---

## 0. 现状校准(§7 P1 行 vs FR 表 vs 仓库实况)

| # | 校准发现 | 处置 |
|---|---|---|
| 1 | §7 P1 行漏列 FR 表中的 P1 行:FR1.12–1.15、FR2.6–2.11、FR6.2–6.7、FR9.6–9.8、FR12.11/12.12/12.14/12.15 | 以 FR 表优先级列为准(PRD-1.0 编号纪律),全部收编入批次 E–J,逐行标注「§7 未列」;计划定稿后回写 §7 |
| 2 | §7「FR5 全 / FR14 全」与 FR 表冲突(FR5.14/5.15 为 P2) | P1 = 表内 P1 行(FR5.5–5.13;FR14.1–14.6);FR5.14/5.15 仍 P2 |
| 3 | FR3.1–3.4 表内标 P0,但 P0 批次 A–D 未覆盖 | 批次 E 起点前移:E 覆盖 FR3.1–3.9 全部 |
| 4 | P0 遗留未闭环:FR4.5(三档注入)、FR5.4(/api 信任栅栏)、FR6.1(进程注册表)、FR13.1(表面迁移,P0/P1 双标)、FR2.3–2.5(幂等键/steering 检查点/ACP 桥实况待核) | E0 裁定步(只读,半天)产处置备忘;已定去向:FR4.5→H0、FR5.4→J7、FR6.1→E10、FR13.1→J9、FR2.3–2.5→E0 裁定后归 G/J |
| 5 | P1 里程碑「webhook 批高危」与 FR13.3 webhook 表面/FR11.8 批审批均标 P2 冲突 | **决策项 D-1**:建议拉入「最小 webhook 审批面 + 批审批账本原型」(非全表面对等)置于 G 批尾;否则该里程碑在 P1 无落点 |
| 6 | 仓库实况:P1 触点多有存量——编排状态机+wire 调度 e2e(daemon)、`provider_host.rs`/`pack_join.rs` 缝(shell)、`mode_permissions.rs` 矩阵、DS-#8 门、`steward.rs` 逻辑闭环、`nofy-fsnotify`/`nofy-workflow`/`nofy-memory`/`nofy-hunk-tracker`/`nofy-sandbox`/`nofy-http`/`nofy-hooks` 在位 | F/I/J 是「装配+执行面」而非从零;落点均引现有件 |
| 7 | 环境约束(P0 继承):uid-1000 inotify watches 被 vscode-server 耗尽(65,536 上限);`SEARCH_INDEX_MANAGER` 进程级单例⇒搜索族测试 `--test-threads=1`;全库套件需 `RUST_MIN_STACK=16777216`;大编译前查 `df`(incremental 缓存曾撑满盘) | I2 watcher 必须带 watch 预算+降级路径;新索引族测试继承单线程纪律 |

---

## 1. 批次 E — 调度与事件总线(FR3.1–3.9,≈2w)

新 crate `crates/codegen/nofy-scheduler`(LOC 棘轮首日挂;不入 daemon 本体——§8 god-object 对策)。事件总线 = 控制面 24 事件词汇族扩展,`nofy-control-schema` 漂移门看守。

| 步 | FR | 落点与参照 | 验收 |
|---|---|---|---|
| E0 | 裁定 | 只读核实 FR2.3–2.5/FR4.5/FR6.1/FR13.1/FR5.4 实况,处置备忘追加 `p1-dev-log.md` | 逐项有「已做/部分/未做」结论+证据路径 |
| E1 | FR3.1(DS-#1) | `nofy-scheduler` 骨架:event-sourced schedule,状态=日志纯 fold,fork 感知 | fold 单测族:重放/fork/撕尾截断 |
| E2 | FR3.2(DS-#2) | fixed-rate latest-only 追赶:离线归来只发最新一次,不补发积压 | 积压注入:错过 N 次=触发 1 次 |
| E3 | FR3.3(DS-#17) | 真 idle 通道:runMaintenance 第三相位+wake 闩 | idle 判定+wake 幂等测试 |
| E4 | FR3.4(OC-F9) | cron 引擎:catch-up/backoff/watchdog/自禁用/启动修复 | AC-3 核心:无客户端照常执行;追赶不风暴;连败自禁用留痕 |
| E5 | FR3.5(HM-F10) | cron 文法+心跳/成功双文件+跨进程 flock+HOME 投递 | 双进程并发触发=单次执行(flock 仲裁) |
| E6 | FR3.6(DS-#3) | 一次性定时器 clamped+重校墙钟 | 墙钟跳变(NTP/休眠)测试 |
| E7 | FR3.7(DS-#5) | jobs session 栅栏+controller 闸门+双通道投递 | 栅栏测试:会话活跃期不误投递 |
| E8 | FR3.8(HM-F21) | fs 事件→任务绑定:防抖+预算+拒自毁(复用 `nofy-fsnotify`) | 自毁型触发被拒;防抖生效 |
| E9 | FR3.9(OC-F10) | heartbeat 自检投影+scratch 便签 | 投影一致性测试 |
| E10 | FR6.1–6.3(HM-F15/F13/F14;6.1 为 P0 遗留,6.2/6.3 §7 未列) | 进程注册表(滚动缓冲+检查点恢复+watch 熔断),E7 活体判定消费之;登录 shell 环境快照(原子发布+注入安全转储);CWD 带内标记+输出限流 spill | AC-6 首句:崩溃后登记恢复 |
| E11 | FR1.14/1.15(§7 未列) | `nofy daemon install`(systemd 单元生成);冷启动快速路径(help/version 不加载运行时) | 单元可解析;`--help` 不触运行时 |
| E12 | FR9.6(OC-F28,§7 未列) | 棘轮扩展:workspace max-lines ratchet+依赖审计(knip 等价),并入 `tests/ratchet.rs` 体系 | CI lane 红绿可演示 |

**E 出口 = AC-3**:无客户端在线时 cron 照常执行;错过窗口按策略追赶且不风暴;连续失败自禁用留痕;自毁型调度被拒;fs 事件可触发任务且防抖生效。

## 2. 批次 F — 任务编排 × pack 两形态(FR11.1–11.4 + FR10.3–10.6,≈2w)

存量:daemon 编排状态机+TaskDispatch+submit 校验链、shell `provider_host.rs`/`pack_join.rs`。本批 = 装配+执行面。

| 步 | FR | 落点与参照 | 验收 |
|---|---|---|---|
| F1 | FR11.1 | `.nofy/project.toml` manifest:packs[]+orchestration+task DAG schema;daemon submit 校验链扩展 | manifest 解析/校验测试族 |
| F2 | FR11.2 + FR4.9(DS-#6/#7 同源) | 单任务执行=SpawnAgent join 单 pack+goal 验收;goal/plan logged state+pre-step 原子验收(**FR4.9 实现归此,H 批只引用**) | AC-11 核心:验收不靠模型自述(goal fold) |
| F3 | FR11.3 + FR2.11(§7 未列) | workflow host 请求词汇路由到 daemon(`nofy-workflow` 在位);`workspace.*` 经 daemon 授权转发;Journal 确定性回放 | 回放=同一调度序列 |
| F4 | FR11.4 + FR5.8(HM-F16/NG-F19) | barrier fan-in+投递义务账本(at-least-once;**一本账本**,G4 消费其治理投影) | 崩溃后 `task.*` 对账续跑(AC-11) |
| F5 | FR10.3(DS-P1) | standing mount+scope join:一组合挂一次,会话父系加入 | join 语义测试;热重载预留点(→J5) |
| F6 | FR10.4(DS-P3) | persona 行+模板变量+默认遮蔽 | 遮蔽测试:默认不泄 |
| F7 | FR10.5(DS-P5) | 委托行即专家召唤:外部 ACP 专家=一行 provider(`provider_host` task 缝扩展) | e2e:委托行召唤 mock 专家并回收结果 |
| F8 | FR10.6 | `nofy-pack` manifest(persona/skills/mcp/tool_policy/model_route/subagents),会话级与 subagent 级两编译目标 | AC-10:两形态召唤 |
| F9 | FR6.4–6.7(§7 未列) | 子代理 barrier+auto-wake(6.4);provider 公共件按 `provider_host` 实况审计收口(6.5);SubagentCapabilities 位+委托深度只增(6.6);fork 只取 completed-turn prefix(6.7) | AC-6 后两句:barrier 齐套唤醒;fork 无未闭合 turn |

**F 出口 = AC-10 + AC-11 + 两个里程碑**:pack 可被会话 join 与 subagent 召唤两形态;manifest 编译为 workflow run;project manifest 单任务跑通。

## 3. 批次 G — 审批治理补全(FR5.5–5.13,≈1.5w)

存量:审批 broker 跨表面闭环、`mode_permissions.rs` 矩阵(FR5.9 ✅,本批只回归)。

| 步 | FR | 落点与参照 | 验收 |
|---|---|---|---|
| G1 | FR5.5(HM-F20) | YOLO 冻结+会话身份任务局部化 | 危险模式不可热升级(AC-5 末句) |
| G2 | FR5.6(HM-F21) | 生命周期守卫:拒自毁型命令(与 E8 共用自毁判定) | 拒绝测试族 |
| G3 | FR5.7(HM-F17) | 轮次租约:同会话跨表面串行 | 双表面并发=串行+租约留痕 |
| G4 | FR5.8(HM-F16) | 投递账本治理投影:审计/重放/死信(账本本体见 F4) | 投递丢失=0 可演示(§9 指标) |
| G5 | FR5.10(DS-#21) | 注入抗性帧:固定信封 | 注入测试族 |
| G6 | FR5.11(DS-#20) | permission-presets intent 事件+write-through | intent 事件入 journal 词汇(漂移门看守) |
| G7 | FR5.12(OC-F33) | 配置写 CAS | 并发写=一胜+败者重试路径 |
| G8 | FR5.13(OC-F22) | pre-auth 硬化:连接预算+洪水守卫 | 洪水测试:预算尽即拒 |
| G9 | FR2.6/2.7(§7 未列) | 设备身份=公钥派生+challenge 签名;caps 声明,运行时审批只能收窄 | AC-2:认证仅存在于传输层 |
| G10 | FR9.8(DS-#27,§7 未列) | guard 双件:重复调用提醒+scoped 超时(tool 分发层) | 分发层测试 |
| G11 | D-1(待决策) | 最小 webhook 审批面+批审批账本原型(若 D-1=拉入) | AC-5 首句:webhook 完成一次高危批准,fail-closed 演示 |

**G 出口 = AC-5**:审批存储损坏=拒绝;四路径收敛为单一可审计事件流;(若 D-1 拉入)webhook 批高危里程碑达成。

## 4. 批次 H — 记忆扩展(FR4.6–4.12 + P0 遗留 FR4.5,≈1.5w)

存量:`nofy-memory`、CJK trigram 索引(131 测试)、DS-#8 fail-closed 门。

| 步 | FR | 落点与参照 | 验收 |
|---|---|---|---|
| H0 | FR4.5(NG-F12,P0 遗留) | 工具结果三档注入+spill | 注入分档测试族 |
| H1 | FR4.6(HM-F11) | 记忆冻结快照注入+promptware 扫描 | 会中记忆写入不改 prompt(AC-4 末句) |
| H2 | FR4.7(HM-F18) | Curator 硬不变量:只碰自创/只归档不删/pinned 豁免 | curator 不删任何条目(AC-4) |
| H3 | FR4.8(HM-F19) | background_review fork 隔离+缓存感知重放 | fork 隔离测试 |
| H4 | FR4.9 | 引用 F2(实现归批次 F);此步只做 pre-step 验收回归 | — |
| H5 | FR4.10(DS-#23/#24) | ProjectionValueStore:higher-seq-wins+init/apply/view | 乱序 seq 测试 |
| H6 | FR4.11(OC-F12) | 审计存储 metadata-only+假名化+retention(与 I5 共用语义) | forget 合规=0 残留(§9) |
| H7 | FR4.12(NG-F9) | 七维 compact+密度切割+深度守卫 | 压缩保留率有度量面(B0 补建) |
| H8 | FR7.7–7.9(OC-F24/HM-F24/PI-F21) | generations 原子快照+lease/retention;辅助路由链 stale-while-revalidate(本地目录);OAuth 刷新双检锁 | AC-7 补:轮换/回退序列可观测 |
| H9 | FR2.8/2.10、FR9.7、FR1.12/1.13(§7 未列) | turn-interruption 可恢复转录;会话谱系表(链式代际);压缩跨进程租约;持久化 runtime 三原则+`persistence_uncertain` 工具语义 | AC-2/AC-9 相关条款 |

**H 出口 = AC-4**:被取代 run 无法提交过期转录(P0 已立,回归);checkpoint 失败=请求不发起(P0 已立,回归);curator 不删;会中记忆写入不改 prompt。

## 5. 批次 I — 文件管家执行面(FR12.1–12.5/12.9/12.11/12.12/12.14/12.15,≈2w)

存量:`steward.rs` 逻辑闭环(无 Delete/trash-only、root confinement、批=单审批单元)、trigram 索引。本批 = 执行面+索引面;FR12.13 handoff 为 P2 不做。

| 步 | FR | 落点与参照 | 验收 |
|---|---|---|---|
| I1 | FR12.1 | roots 空默认 opt-in;每根两档(index-only/manage);根外 escalate | 未选根=零索引零外呼(AC-12 首句) |
| I2 | FR12.2(HM-F9+DS-#17) | fs-index v1:metadata+FTS(CJK);watcher→E 批事件总线(`nofy-fsnotify`);真 idle 增量(消费 E3) | watch 预算+降级路径(校准 #7) |
| I3 | FR12.3(DS-06) | `fs/*` 策略事件+结构化 `FS_SANDBOX_DENIED`(`nofy-sandbox` 扩展) | 拒绝结构化可审计 |
| I4 | FR12.4 | file-activity 图:journal `tool.*` 文件副作用全局化+hunk 合流(`nofy-hunk-tracker`) | steward 为一等 actor(铺 FR12.14) |
| I5 | FR12.5(OC-F12) | 隐私四件:本地/retention/forget/redaction/审计 metadata-only(与 H6 共用) | forget 后检索不可命中(AC-12) |
| I6 | FR12.9(PI-F3 变体) | 索引=提示不是事实:操作前真实文件再验证 | 陈旧索引测试:再验证拦截漂移 |
| I7 | FR12.11 | 文件租约表:活跃会话声明工作集(hunk 在追/cwd 树/opened),TTL+心跳;leased=steward 只读禁管理 | 租约命中的管理操作加载期即拒(AC-12) |
| I8 | FR12.12 | 三区分域:项目主权/steward 主权/重叠取更严 | 重叠区测试取更严 |
| I9 | FR12.14 | 变更 manifest+转发墓碑+`undo --batch` | 墓碑可解析陈旧引用;批可回滚(AC-12) |
| I10 | FR12.15 | 清理禁区(leased/gitignore/N 天触碰)+新根 dry-run 试用期+按根信任爬坡 | 新根前三批强制 dry-run(AC-12) |

**I 出口 = AC-12 全句**(P2 项除外)。

## 6. 批次 J — 敏捷面 × Web(FR14 + FR13.1/13.2 + FR5.4 + FR8.1–8.3,≈2w)

| 步 | FR | 落点与参照 | 验收 |
|---|---|---|---|
| J1 | FR14.6 | script 沙箱先行:同沙箱 profile+资源限额,fail-closed,永不 in-proc(`nofy-sandbox` 扩展) | 脚本崩溃不拖 daemon(AC-14) |
| J2 | FR14.1 | script runner:受管运行时 execute_code/runbook 工具;pack 捆绑脚本+声明依赖(受信渠道懒安装,供应链门=J6) | Python script 执行并回传结构化结果 |
| J3 | FR14.2(P0 标) | 协议化审计:扩展点全 JSON-RPC stdio/HTTP+JSON Schema;in-proc 插件=0(审计+漂移门,非新建) | 审计报告+门禁红绿 |
| J4 | FR2.9 + FR14.3(OC-F27) | schema-first codegen(`nofy-control-schema` 漂移门扩展)+Python/TS 一等 SDK+conformance 套件 | Java 子进程插件经通用协议过 conformance(AC-14) |
| J5 | FR14.4 | 热重载 packs/skills/hooks/scripts 不重启 daemon;核心更新走 supervisor 退出码契约(消费 E11/F5) | 热重载 e2e 无重启 |
| J6 | FR8.1–8.3(OC-F23/HM-F25/DS-#14+HM-F27) | 供应链门禁(minimumReleaseAge+trust verdict,fail-closed);工具注册表 generation 失效+override 安全闸;hooks 桥 detach/drain+600s+耐久配对(`nofy-hooks` 在位) | AC-8:钩子崩溃不拖主管线 |
| J7 | FR5.4(DS-#22,P0 遗留) | /api 浏览器信任栅栏:Host 规范化+sec-fetch-site+Origin 四层(`nofy-http` 扩展) | DNS rebinding 测试通过(AC-5) |
| J8 | FR13.2 | Web 表面:serve 升级,建于 J7 信任栅栏之上 | 四表面同一会话真相(AC-13 首句) |
| J9 | FR13.1(MAP,P0/P1 双标) | TUI/ACP/headless 迁控制面客户端 | 迁移面清单+回归绿 |
| J10 | FR14.5 | 预演区+三次法则纪律件:pack/script 验证 ≥3 场景才晋升 Rust 核心 | 纪律文档+晋升台账 |

**J 出口 = AC-14 + 里程碑**:一个 Python script pack 从编写到被召唤 <5 分钟、零 Rust 改动;pack 热重载不需要重启;脚本崩溃不拖 daemon。

---

## 7. 施工顺序与风险

```
E0 裁定(0.5d) → E(2w) → F(2w) → G(1.5w) → H(1.5w) → I(2w) → J(2w)
```

跨批依赖(仅四条,其余可并行):

- E3/E8 → I2(fs-index 的真 idle 增量与事件源);
- F4 账本 → G4 治理投影;
- F2 吸收 FR4.9 → H4 只回归;
- J7 信任栅栏 → J8 Web。

风险:

1. **范围膨胀**:收编 §7 未列项后,P1 比 §7 行大约四成;PRD 给 6 周,本计划估算 9–11 周。**决策项 D-2**:接受延期,或把 §7 未列项(FR1.12–1.15/FR2.6–2.11/FR6.2–6.7/FR9.6–9.8)推入 P2。
2. **调度器成第二个 god object**:`nofy-scheduler` 独立 crate+首日棘轮;事件总线只扩词汇,不增私有端点。
3. **pack 两形态触 agent 装配热路径**(`provider_host`/`pack_join`):动前影响分析,`provider_loop_e2e` 回归为门槛。
4. **Web = 首个 HTTP 攻击面**:J7 必须先于 J8;DNS rebinding/洪水测试是出口条件而非加分项。
5. **脚本运行时入沙箱**:J1(沙箱)先于 J2(runner);永不 in-proc(§6 红线)。
6. **环境约束**:inotify watch 耗尽(I2 必须预算化);搜索族测试单线程纪律;大编译前查 `df`。

## 8. 承转队列(自 P0 看板,与批次并行)

| 项 | 归属 | 说明 |
|---|---|---|
| 逐文件覆盖率 llvm-cov CI | 工程政策件 | P0 队列①;E12 棘轮扩展后并入 CI lane |
| B0 度量面补建 | 工程政策件 | 压缩保留率/对账检出率等度量面仍欠;H7 为首个消费方 |
| `#[ignore]` e2e CI lane | 工程政策件 | `provider_loop_e2e` 等需定期跑 lane,而非本地偶跑 |
| hygiene 积压 | 工程政策件 | pager M1 残留 warning、对抗性夹具跟进等(见 `p0-dev-log.md`) |

## 9. 第一个施工动作

**E0 裁定(只读,半天)→ E1 `nofy-scheduler` event-sourced 骨架**。

理由:E1(FR3.1,DS-#1)语义明确(状态=日志纯 fold),零设计争议;新 crate 直接模板化 `nofy-daemon`(棘轮/测试夹具/built-binary e2e 模式全可复用);事件总线是 P1 最长依赖链(I2 等消费),早开工进度价值最高;不触现有热路径,回归面小。
