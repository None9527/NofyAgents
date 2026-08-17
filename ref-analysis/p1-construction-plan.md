# P1 施工计划(跨域治理:批次 E–J)

> 输入:`os-agentic-prd-final.md`(PRD-1.2,§7 路线图 P1 行 + §4 FR 表 + §11 看板)、`p0-construction-plan.md`(纪律模板)、`p0-dev-log.md`(P0 实况)。
> 纪律(承 P0):动符号前先影响分析(workspace 规则);每批次以无 key e2e(MockInferenceServer/built-binary)+编译零错误为门槛;不新增 in-proc 插件(§6);新 crate 首日挂 LOC 棘轮(OC-F28);行号引用纪律——本计划只引已核实的文件路径,不虚构行号。

---

## 0. 现状校准(§7 P1 行 vs FR 表 vs 仓库实况)

| # | 校准发现 | 处置 |
|---|---|---|
| 1 | §7 P1 行漏列 FR 表中的 P1 行:FR1.12–1.15、FR2.6–2.11、FR6.2–6.7、FR9.6–9.8、FR12.11/12.12/12.14/12.15 | **第一性原理裁定已落(见下表后裁定节)**:P1 验收命题依赖项保留(FR12.11–15/FR2.6–2.7/FR6.4–6.7/FR2.9/FR6.1/FR9.6),无依赖项推迟至 P2 前置队列;§7 已回写(PRD-1.5) |
| 2 | §7「FR5 全 / FR14 全」与 FR 表冲突(FR5.14/5.15 为 P2) | P1 = 表内 P1 行(FR5.5–5.13;FR14.1–14.6);FR5.14/5.15 仍 P2 |
| 3 | FR3.1–3.4 表内标 P0,但 P0 批次 A–D 未覆盖 | 批次 E 起点前移:E 覆盖 FR3.1–3.9 全部 |
| 4 | P0 遗留未闭环:FR4.5(三档注入)、FR5.4(/api 信任栅栏)、FR6.1(进程注册表)、FR13.1(表面迁移,P0/P1 双标)、FR2.3–2.5(幂等键/steering 检查点/ACP 桥实况待核) | E0 裁定已闭环(备忘见 `p1-dev-log.md`):FR5.4→J7、FR6.1→E10、FR2.3→G 批、FR2.4→G/F 批、FR2.5 只留回归;**FR4.5/FR13.1 经第一性原理裁定推迟 P2 前置** |
| 5 | P1 里程碑「webhook 批高危」与 FR13.3 webhook 表面/FR11.8 批审批均标 P2 冲突 | **D-1 已闭(第一性原理裁定)**:拉入,按命题定义——G11=「非 TUI 审批证明单元」,全表面仍留 P2 |
| 6 | 仓库实况:P1 触点多有存量——编排状态机+wire 调度 e2e(daemon)、`provider_host.rs`/`pack_join.rs` 缝(shell)、`mode_permissions.rs` 矩阵、DS-#8 门、`steward.rs` 逻辑闭环、`nofy-fsnotify`/`nofy-workflow`/`nofy-memory`/`nofy-hunk-tracker`/`nofy-sandbox`/`nofy-http`/`nofy-hooks` 在位 | F/I/J 是「装配+执行面」而非从零;落点均引现有件 |
| 7 | 环境约束(P0 继承):uid-1000 inotify watches 被 vscode-server 耗尽(65,536 上限);`SEARCH_INDEX_MANAGER` 进程级单例⇒搜索族测试 `--test-threads=1`;全库套件需 `RUST_MIN_STACK=16777216`;大编译前查 `df`(incremental 缓存曾撑满盘) | I2 watcher 必须带 watch 预算+降级路径;新索引族测试继承单线程纪律 |

### 第一性原理裁定(2026-08-17,D-1/D-2 闭环)

推理前提:① 里程碑是待证伪的命题,不是待交付的功能;② 条目优先级来自它被哪些 P1 验收命题依赖;③ 工期是推导值不是承诺值。

- **D-1 = 拉入,按命题定义**。里程碑「webhook 批高危」的命题是"审批路径不依赖 TUI + 批高危 fail-closed"。最小证伪单元 = 一个非 TUI 表面应答一次高危批准。G11 因此定义为「非 TUI 审批证明单元」:验收看命题,不看表面完整度;完整 webhook 表面仍为 P2(FR13.3 本分)。
- **D-2 = 两案均不取,按依赖切割**。逐条问「P1 哪条验收条款/里程碑依赖它」:
  - **保留**:FR12.11/12.12/12.14/12.15(AC-12 租约/分域/墓碑/禁区条款)、FR2.6/2.7(AC-2/AC-5)、FR6.4–6.7(FR11.4 barrier 与 FR10.5 委托的机制本体)、FR2.9(FR14.3 SDK codegen 前置)、FR6.1(FR3.7 栅栏活体判定+AC-6 首句)、FR9.6(棘轮机械化,工程闸门)。
  - **推迟 P2 前置队列**(P1 无命题依赖):FR13.1(J8 Web 本身已是控制面客户端证明;AC-13「四表面」在 P1 本就不可证——webhook/IM 均 P2)、FR4.5、FR1.12–1.15、FR2.8/2.10/2.11、FR6.2/6.3、FR9.7/9.8。
- **净结果**:P1 = §7 核心 + AC 必需收编项,估算 ≈8–9 周;对 PRD 6 周的差额 = AC-12/AC-2/AC-5/AC-14 的通过成本,非范围膨胀,如实记录。推迟项不删除,以 P2 前置队列排序进入 P2。

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
| E10 | FR6.1(HM-F15,P0 遗留) | 进程注册表:滚动缓冲+检查点恢复+watch 熔断,E7 栅栏活体判定消费之(FR6.2/6.3 经裁定推迟 P2 前置) | AC-6 首句:崩溃后登记恢复 |
| ~~E11~~ | FR1.14/1.15 | **推迟 P2 前置**(裁定:无 P1 命题依赖;AC-3 测试直接起 daemon,冷启动为卫生项) | — |
| E12 | FR9.6(OC-F28,§7 未列) | 棘轮扩展:workspace max-lines ratchet+依赖审计(knip 等价),并入 `tests/ratchet.rs` 体系 | CI lane 红绿可演示 |

**E 出口 = AC-3**:无客户端在线时 cron 照常执行;错过窗口按策略追赶且不风暴;连续失败自禁用留痕;自毁型调度被拒;fs 事件可触发任务且防抖生效。

## 2. 批次 F — 任务编排 × pack 两形态(FR11.1–11.4 + FR10.3–10.6,≈2w)

存量:daemon 编排状态机+TaskDispatch+submit 校验链、shell `provider_host.rs`/`pack_join.rs`。本批 = 装配+执行面。

| 步 | FR | 落点与参照 | 验收 |
|---|---|---|---|
| F1 | FR11.1 | `.nofy/project.toml` manifest:packs[]+orchestration+task DAG schema;daemon submit 校验链扩展 | manifest 解析/校验测试族 |
| F2 | FR11.2 + FR4.9(DS-#6/#7 同源) | 单任务执行=SpawnAgent join 单 pack+goal 验收;goal/plan logged state+pre-step 原子验收(**FR4.9 实现归此,H 批只引用**) | AC-11 核心:验收不靠模型自述(goal fold) |
| F3 | FR11.3 | workflow host 请求词汇路由到 daemon(`nofy-workflow` 在位);Journal 确定性回放(FR2.11 Hub 降级经裁定推迟 P2 前置) | 回放=同一调度序列 |
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
| ~~G10~~ | FR9.8 | **推迟 P2 前置**(裁定:AC-5 无条款依赖) | — |
| G11 | D-1(已闭:拉入) | **非 TUI 审批证明单元**:webhook 收高危审批→TUI 外应答;批审批账本逐条(按命题定义,不求表面完整;全表面仍 P2) | AC-5 首句:webhook 完成一次高危批准,fail-closed 演示 |

**G 出口 = AC-5**:审批存储损坏=拒绝;四路径收敛为单一可审计事件流;(若 D-1 拉入)webhook 批高危里程碑达成。

## 4. 批次 H — 记忆扩展(FR4.6–4.12 + P0 遗留 FR4.5,≈1.5w)

存量:`nofy-memory`、CJK trigram 索引(131 测试)、DS-#8 fail-closed 门。

| 步 | FR | 落点与参照 | 验收 |
|---|---|---|---|
| ~~H0~~ | FR4.5 | **推迟 P2 前置**(裁定:AC-4 无条款依赖;服务上下文预算卫生,不服务 P1 命题) | — |
| H1 | FR4.6(HM-F11) | 记忆冻结快照注入+promptware 扫描 | 会中记忆写入不改 prompt(AC-4 末句) |
| H2 | FR4.7(HM-F18) | Curator 硬不变量:只碰自创/只归档不删/pinned 豁免 | curator 不删任何条目(AC-4) |
| H3 | FR4.8(HM-F19) | background_review fork 隔离+缓存感知重放 | fork 隔离测试 |
| H4 | FR4.9 | 引用 F2(实现归批次 F);此步只做 pre-step 验收回归 | — |
| H5 | FR4.10(DS-#23/#24) | ProjectionValueStore:higher-seq-wins+init/apply/view | 乱序 seq 测试 |
| H6 | FR4.11(OC-F12) | 审计存储 metadata-only+假名化+retention(与 I5 共用语义) | forget 合规=0 残留(§9) |
| H7 | FR4.12(NG-F9) | 七维 compact+密度切割+深度守卫 | 压缩保留率有度量面(B0 补建) |
| H8 | FR7.7–7.9(OC-F24/HM-F24/PI-F21) | generations 原子快照+lease/retention;辅助路由链 stale-while-revalidate(本地目录);OAuth 刷新双检锁 | AC-7 补:轮换/回退序列可观测 |
| ~~H9~~ | FR2.8/2.10、FR9.7、FR1.12/1.13 | **整行推迟 P2 前置**(裁定:P1 验收条款无依赖) | — |

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
| ~~J9~~ | FR13.1 | **推迟 P2 前置**(裁定:J8 Web 已是控制面客户端证明;AC-13「四表面」P1 本就不可证) | — |
| J10 | FR14.5 | 预演区+三次法则纪律件:pack/script 验证 ≥3 场景才晋升 Rust 核心 | 纪律文档+晋升台账 |

**J 出口 = AC-14 + 里程碑**:一个 Python script pack 从编写到被召唤 <5 分钟、零 Rust 改动;pack 热重载不需要重启;脚本崩溃不拖 daemon。

---

## 7. 施工顺序与风险

```
E0(0.5d,✓) → E1(✓) → E2-E10(~1.5w) → F(2w) → G(~1.5w) → H(1w) → I(2w) → J(~1.5w)   合计 ≈8–9w
```

(裁定后净范围:E 去 E11、G 去 G10、H 去 H0/H9、J 去 J9,G11 按命题定义收窄;工期为推导值——§7 核心按 PRD 节奏,差额=AC 必需收编项的通过成本。)

跨批依赖(仅四条,其余可并行):

- E3/E8 → I2(fs-index 的真 idle 增量与事件源);
- F4 账本 → G4 治理投影;
- F2 吸收 FR4.9 → H4 只回归;
- J7 信任栅栏 → J8 Web。

风险:

1. **范围已定(D-2 经第一性原理裁定闭环)**:保留=P1 验收命题依赖项,推迟=无依赖项(见 §0 裁定节);估算 ≈8–9 周 vs PRD 6 周,差额=AC-12/AC-2/AC-5/AC-14 的通过成本,如实记录,不垫工期不砍验收。
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

**P2 前置队列**(第一性原理裁定推迟项——不删除,以队列排序进入 P2):

| 项 | 推迟理由(裁定依据) |
|---|---|
| FR13.1 表面迁移 | J8 Web 已证控制面客户端;全迁移不服务任何 P1 命题 |
| FR4.5 三档注入+spill | AC-4 无条款依赖;上下文预算卫生件 |
| FR9.8 guard 双件 | AC-5 无条款依赖 |
| FR1.12–1.15 | 持久化语义/install/冷启动,P1 无命题依赖 |
| FR2.8/2.10/2.11 | 转录恢复/谱系表/Hub 降级,P1 无命题依赖 |
| FR6.2/6.3 | 环境快照/CWD 标记,执行世界卫生件 |
| FR9.7 压缩租约 | P1 无命题依赖 |

## 9. 第一个施工动作

**E0 裁定(只读,半天)→ E1 `nofy-scheduler` event-sourced 骨架**。

理由:E1(FR3.1,DS-#1)语义明确(状态=日志纯 fold),零设计争议;新 crate 直接模板化 `nofy-daemon`(棘轮/测试夹具/built-binary e2e 模式全可复用);事件总线是 P1 最长依赖链(I2 等消费),早开工进度价值最高;不触现有热路径,回归面小。

### E0/E1 施工记录(已执行,2026-08-17)

- **E0 裁定闭环**:五区结论——FR2.3 未做(TaskSubmit 无幂等键)、FR2.4 部分(进程内 interjection 齐套,控制面 steering 协议未立)、FR2.5 已做(ACP 原生表面+47 测试文件)、FR4.5 部分(spill 仅 web_fetch 一家)、FR6.1 部分(children 登记+启动清扫在,滚动缓冲/检查点恢复/watch 熔断缺)、FR13.1 未做(表面均进程内跑 agent)、FR5.4 未做(serve 在,零 Origin/Host 检查)。证据路径全录于 `p1-dev-log.md` E0 备忘。
- **E1 闭环**:新 crate `crates/codegen/nofy-scheduler`(workspace 成员,仅依赖 serde/serde_json):`ScheduleEvent` 六变体 + `fold`/`apply` 纯函数(fork 感知在 fold 内:Forked 保留定义、清空 pending;fail-closed:无活定义不挂账;幂等:重复 arm/fire 不重复挂账)+ `parse_log` 撕尾截断 + `LogStore` 薄盘层;`tests/ratchet.rs` 日一 cap=429。
- 验证:`cargo test -p nofy-scheduler` 双跑 8+1 全绿且一致;`cargo test -p nofy-daemon` 回归 64+1 全绿;`cargo check --workspace` 零错误。零既有符号改动(纯新增),零新外呼。
- 偏离记录:GitNexus MCP 本会话不可用,影响分析按纯新增事实记录(P0 先例同款)。

### E2 施工记录(已执行,2026-08-17)

- 影响分析:grep 全库枚举 `nofy-scheduler` 外部依赖方=零;改动面=crate 内(`ScheduleEvent` 加 `Dropped` 变体+`catch_up_events`)。GitNexus MCP 不可用,按先例记录。
- 实现(FR3.2/DS-#2):`Dropped` 审计事件(陈旧过期义务不补发、丢弃留痕,fold 臂幂等+fail-closed);`catch_up_events(&state, now, rate)` 纯策略提案——每 schedule 只发最新过期义务一次、其余随 Dropped 丢弃(不风暴),`rate` 限速按固定速率排空,BTreeMap 序确定性,返回空=追赶完毕;引擎形状=提案→append→fold,追赶本身崩溃安全。
- 测试:6 新用例(积压三欠=1 发+丢弃审计、五积压 rate=2 按 2/2/1 确定性排空、未来义务不动、无过期 noop、Dropped 幂等、完整引擎循环重放同态)。
- 棘轮二次行使:429→628(附评审理由,先红后绿)。
- 验证:`cargo test -p nofy-scheduler` 双跑 14+1 全绿且一致。
- **下一步 = E3**(FR3.3 真 idle 通道:runMaintenance 第三相位+wake 闩)。
