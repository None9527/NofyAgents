# P0 批次 A 开发调试记录

> 分支:二次开发分支。配套文档:`p0-construction-plan.md`(计划)、`os-agentic-prd-final.md`(需求)、`SANITIZATION_PLAN.md`(上游脱敏计划)。
> 纪律:动符号前影响分析(GitNexus impact + grep 全枚举);每增量独立验证(cargo check + 定向测试);夹具语义不被脚本破坏;对抗性用例保留。

---

## 2026-08-14 · 增量 A'1:Mixpanel 物理移除(闭环)

**动机**:PRD FR9.4/§6——专有分析 SaaS 客户端不保留,遥测形态改为"NOOP 默认 + opt-in adapter"。

**影响分析**:
- GitNexus impact `TelemetryClient`:LOW(索引略旧,路径仍为 xai- 前缀);
- grep 全枚举:`nofy-mixpanel` 唯一依赖方 = `nofy-telemetry`;`mixpanel_token/mixpanel_enabled` 配置字段消费方 = `nofy-shell` config mod/tests/agent-config 三处。

**改动**:
1. 删 `crates/codegen/nofy-mixpanel` crate + workspace 成员 + workspace 依赖行;
2. `nofy-telemetry/src/client.rs`:移除 `Mixpanel` import/字段/构造/Debug 行;`track()` 内 Mixpanel 路由块删除(**外部签名不变**,9 个依赖方零改动);`sync_profile()` 保留签名变 no-op(调用点兼容);`product_analytics_insert_id` 删除;`Arc` import 收敛;
3. `nofy-telemetry/src/config.rs`:删两字段、env 覆盖(`NOFY_TELEMETRY_MIXPANEL_*`)、normalize 行、`internal_defaults` 元组缩为二元、测试断言同步;
4. `nofy-shell`:config/mod.rs 删 `enforce_val!/enforce_str!` 两块;config/tests.rs 删 requirements toml 中两键与三条断言;agent/config.rs 三处夹具/断言同步;
5. 文案去 Mixpanel 化(lib.rs/session_ctx.rs/session_metrics.rs/两个 Cargo.toml description/nofy-secrets description)。

**保留**:`events_url/events_api_key` 配置化产品事件路径(默认 None = 零外呼,opt-in adapter 形态);OTLP 维持 `NOFY_EXTERNAL_OTEL` 门控;`TelemetryMode` 默认 `Disabled` + 未知值 fail-closed 现状(本就是企业默认)。

**验证**:✅ `cargo check -p nofy-telemetry -p nofy-shell` 零错误;✅ `cargo test -p nofy-telemetry` 全绿;✅ `cargo test -p nofy-shell --lib -- telemetry requirements` 49 passed/0 failed(含 `product_analytics_disabled_when_telemetry_off` / `..._enabled_..._on` 双门)。

**调试要点**:无返工。唯一注意点是 `sync_profile` 有外部调用点(shell init),故保留签名 no-op 而非删函数——**删行为不删接口**是本批次的兼容策略。

---

## 2026-08-14 · 增量 A'1b:Sentry 移除(闭环)

**影响分析**:13 个 "sentry" 命中逐一核实,真接线仅 4 处(main.rs init guard/drop/shutdown flush、signal_handler flush);其余 10 处为**测试夹具任意插件名**(plugin registry/managed_mcp/marketplace 测试用 "sentry" 当普通插件名)与 CLI 文档示例(`mcp add ... https://mcp.sentry.dev/mcp`),按纪律不动。

**改动**:
1. 删 `nofy-telemetry/src/sentry.rs`(427 行)+ `pub mod sentry` + `sentry` 依赖(7 features:panic/anyhow/tracing/backtrace/contexts/reqwest/rustls/debug-images);
2. main.rs 删 init 块(含 `disabled: is_error_reporting_disabled_sync()` 接线)、`drop(_sentry_guard)`、shutdown flush 行;signal_handler 删 flush 行;
3. 保留 `is_error_reporting_disabled_sync`(enterprise requirements 旋钮,语义独立于 Sentry 本体);保留 OTEL/debug_log flush 路径。

**验证**:✅ cargo check(telemetry/pager/pager-bin)零错误;✅ telemetry 测试 exit 0。

**顺带发现**:nofy-pager 3 个 warning 为 M1 leader 删除残留(`unsupported_leader_flags` 等未用函数),记入 hygiene 清单。

---

## 2026-08-14 · 增量 A'4:端点字面量单一来源(闭环)

**审计**:`api.x.ai` 非测试引用 91 处/19 文件;字面量形态:`https://api.x.ai/v1`×66、裸 host×3、派生路径×5、对抗夹具×2(evil.example/@attacker,负例,不动)。单一源雏形已存在但位阶错误(`nofy-shell` config 的 `XAI_API_BASE_URL_DEFAULT`,voice/tools/memory 无法不逆依赖引用)。

**设计**:常量上提 `nofy-env`(与 PROD_* 端点常量同位):`PROD_XAI_API_BASE_URL`("/v1")+ `PROD_XAI_API_ORIGIN`(裸 host);shell 常量改引用;四 crate 补 `nofy-env` 依赖边(低层 crate,方向正确)。

**改动**:56 处精确字面量脚本替换(17 文件);toml/JSON **文本夹具**内的带引号字面量被脚本误伤共 13 处(voice 1、shell agent/config 12、web_search/types JSON 1),按"夹具=用户配置/wire 文本"语义还原为字符串字面量;对抗夹具与派生路径断言保留记 hygiene。

**事故与修复(调试记录)**:
1. **toml 夹具失引号**:精确串替换不区分代码位置与 raw-string 内文本。修复:对 `^api_base = nofy_env::...$` / `base_url = nofy_env::...$` 行还原带引号 URL;全仓扫 `": nofy_env::` / `= nofy_env::` 确认清零。
2. **sed 失控**:给 4 个 Cargo.toml 插依赖时 `sed a\` 语法误用,每行后追加重复依赖行。修复:`git checkout --` 恢复四文件,改 python 在 `[dependencies]` 后精确插单行,计数校验=1。
3. **JSON 夹具破体**:`web_search/types.rs` set_options payload 是 `serde_json::from_str` 的 raw JSON 文本,替换后报 `Error("expected ident", line 4)`。修复:还原该处带引号字面量,复跑 26/26。
4. **磁盘满**:`cargo check` 报 `No space left on device`;根分区 100%,`target/debug/incremental` 125G。修复:`rm -rf target/debug/incremental` 恢复至 94%(119G)。纪律入库:大编译前 `df`。

**验证**:✅ cargo check 七 crate 零错误零警告;✅ voice 69 / shell-base 37 / shell config+models 1004 / tools web_search+image_gen 26 / memory 全绿。

**教训**:脚本化批量替换只配"精确串+事后全仓扫描误伤模式",夹具(raw string)必须逐处人工语义复核;Cargo.toml 等结构化文件禁用 sed 追加,用脚本+计数校验。

---

## 2026-08-14 · 增量 A'2:外呼收口核实(改判闭环,机制移除降级 hygiene)

**原计划**:移除 sampler attribution 机制。深查后改判。

**核实证据**:
1. 识别头外呼:`inject_url_derived_headers` 语义经测试名证实——`adds_proxy_headers_for_cli_chat_proxy_url` / `skips_proxy_headers_for_external_url`:识别头(x-nofy-*)只发托管代理,BYOK 外部后端跳过;
2. 401 归因回调(`record_401`)两个汇:本地 unified_log + OTel span `auth_401_attribution`,后者**仅 OTLP 配置后外发**(opt-in);GCS 汇随 M1 OIDC 删除已死;
3. M1 后默认配置无任何专有外呼(零外呼验收不受该机制影响)。

**改判**:机制是本地诊断+opt-in 观测,非专有回连;45 文件 woven 移除风险/收益比差。**A'2 以"外呼收口核实+文档化"闭环**;机制整体移除降级为 B 期 hygiene(若未来做"企业零诊断档"再动)。

## 2026-08-14 · 增量 A'3:运营件外呼门控(改判闭环,物理移除降级 hygiene)

**深查**:nofy-update/announcements/campaigns 三件 woven 于 pager UI(slash/welcome)、config 与 6 个 pty e2e,物理移除=多小时 UI 手术;上游 SANITIZATION_PLAN 亦注"整体删除可后置"。

**外呼面核实**:
1. **updater 默认外呼成立**:release 构建 `should_check_for_updates` 默认 true(opt-out),违反零外呼 → **翻转为 opt-in**(`NOFY_ENABLE_AUTOUPDATER`),保留 disable 开关/debug 行为/CLI flag;
2. campaigns/announcements 无独立启动拉取(remote settings 为企业注入层,配置驱动),默认零外呼;
3. 故隐私门控只需 updater 翻转。

**改动**:main.rs `should_check_for_updates` 默认 false+opt-in 注释载明。验证:✅ cargo check -p nofy-pager-bin 零错误。

**批次 A 出口判定(已达成)**:A'1/A'1b/A'4 闭环+A'2 核实闭环+A'3 门控闭环 → 脱敏收尾完成:默认零外呼、品牌串归零、provider 标识符保留并文档化。物理移除(updater/announcements/campaigns/401 归因)统一降级 B 期 hygiene。

## 2026-08-14 · B0 度量回路:崩溃恢复 e2e(首件)

**新文件**:`crates/codegen/nofy-shell/tests/crash_recovery_e2e.rs`(默认 ignore,同 built-binary 基建)。

**场景**:stdio ACP + `NOFY_RUNTIME_JOURNAL=1`;模型首响应脚本化调用 `run_terminal_command sleep 30`;tool intent 落 journal 后 `kill -9`;断言①`tool.invoked` 在盘且无 outcome(未闭合 intent);②新进程 `session/load` 同 NOFY_HOME 后 `reconciliation.completed`+`session.resumed` 落盘(撕尾对账);③恢复后会话可用(follow-up prompt 完成)。输出 `EVAL crash_recovery=pass` 作度量面。

**基建核实**:journal 词汇含 `tool.invoked/intent_id/reconciliation.completed/session.resumed`(`nofy-session-journal/src/reconcile.rs` 已实现撕尾对账——B0 是给它测量面,不是新造机制);`NofyStdioClient` 暴露 `child_pid/start_kill/load_session_with_timeout`;`TestSandbox::builder().set_env` 可复用 NOFY_HOME 供 resume。

**编译修复(调试记录)**:
1. E0382 moved-value:`session` 被 prompter `async move` 按值捕获后又在 resume 段使用 → `session_for_resume = session.clone()` 分离所有权;`eprintln` 改 `{:?}`(SessionId 无 Display 保证);
2. E0308:sse helper 的 `arguments` 参数是 `&str` 非 `&Value` → `json!(...).to_string()` 后传 `&String`。

**验证**:✅ cargo check --test crash_recovery_e2e 零错误。

**首跑失败(调试记录,测试生命周期 bug 非产品 bug)**:kill 后读 journal 为空,断言 `invoked event persisted` 红。根因:`NofyStdioClient` 拥有 `TestSandbox`(NOFY_HOME tempdir 的所有者);prompter 把 client 移走,kill 后 prompt future 解析、client drop → sandbox drop → **NOFY_HOME 被删**,journal 随之消失。修复:`take_sandbox()` 把 sandbox 提到测试作用域(`_home_guard`)保活,client 只带连接进 prompter。

**重跑 ✅**:`test crash_mid_tool_then_resume_reconciles_journal ... ok`,`EVAL crash_recovery=pass`。产品崩溃对账机制(reconcile.rs)首次真实测量通过:kill -9 中途工具→未闭合 intent 在盘→resume 落 reconciliation.completed/session.resumed→会话可用。**B0 首件闭环。**

---

## 2026-08-14 · B1 首件:nofy-daemon crate(进程权威)

**新 crate**:`crates/codegen/nofy-daemon`(依赖预算 fs2+tracing,启动最早期可用;已注册 workspace 成员)。

**内容**:
1. `SingleInstanceLock`:双锁=flock(内核随进程死亡释放,证明活体)+ inode 身份检查(防 unlink+recreate 分裂单例);payload=pid+starttime(PID 复用防御/诊断);恶意 unlink 后 takeover 可检测而非静默;
2. `exit_codes` 契约(OK/ERROR/CONFIG/RESTART_REQUESTED/ALREADY_RUNNING)= supervisor 重启策略语义(HM-F4 转译)。

**验证**:✅ `cargo test -p nofy-daemon` 3/3(二锁互斥+holder payload、drop 后继可接、unlink takeover 可检测)。

### B1 第二/三件:watchdog + sd_notify + 取证账本 + 恢复状态机(闭环)

**新模块**(同 crate):
1. `sd_notify.rs`:无 libsystemd 的最小 sd_notify(AF_UNIX datagram,`@` 抽象命名空间处理);无 socket=no-op,launchd/前台无感;
2. `health.rs`:`EventLoopHealth`(环内原子 beat)+ 环外滞后采样 watchdog(连续 miss 触发 wedge 动作);退出码新增 `WEDGE_DETECTED=12`;
3. `forensics.rs`:append-only `forensics.jsonl`(startup/clean_shutdown/unclean_death_detected);下次启动读尾分类前任;
4. `recovery.rs`:恢复决策机 Fresh/Resume/Escalate(连续 ≥3 次非干净死亡拒自动恢复,防重启风暴,OC-F2 预算思想)。

**调试记录**:
1. Rust 2024 edition 下 `env::set_var/remove_var` 为 unsafe → 测试加 unsafe 块+SAFETY 注(本 crate 无并发读 NOTIFY_SOCKET);
2. recovery 测试首跑 1 红:用例假设 `unclean` 条目紧跟死者 startup,实际语义是**检测者 startup 之后**追加(forensics append 顺序)→ 修用例对齐真实账本序,并补"clean 周期截断 streak"用例。

**验证**:✅ `cargo test -p nofy-daemon` 17/17(lock 3+sd_notify 2+health 3+forensics 3+recovery 6)。

### B1 第四件:BufferedDelta 重放——核实为既有机制,补测量面(验证中)

**深查结论**:NG-F1 模式在仓库**已实现**于 updates.jsonl 游标重放链:client `_meta.cursor`(session_setup.rs:758)→ `prepare_replay_lines`(storage/mod.rs:1768,按 `_meta.eventId` 解析游标、跳过已见、游标缺失回落全量并 warn)→ `replay_session_updates_from_offset_enqueue`(mvp_agent/mod.rs:1397,offset 后增量按"非 isReplay"转发)。单元覆盖已厚(9 个 prepare_replay_* 用例含 ACU 丢弃后游标解析)。**缺的是 ACP 层端到端测量**。

**改动**:
1. test-support `acp_client.rs`:TextCapture 增 `event_ids` 捕获(session_notification 读 `_meta.eventId`)+ `captured_event_ids()` + `load_session_with_cursor()`(`_meta.cursor` 注入);
2. 新 e2e `reconnect_delta_e2e.rs`:活连接收多 chunk→断开→cursor=倒数第二 eventId 重连断言"只放尾部"(无 alpha 有 delta);假游标断言回落全量;输出 `EVAL reconnect_delta=pass`。

**验证** ✅:`EVAL reconnect_delta=pass live=8 delta=2 full=3`。

**调试记录(三轮)**:
1. `set_response_for` 不存在 → 用 `enqueue_response`+`chat_completion_script_exact`(word deltas→SseEvent;`chat_completion_events` 返回 axum Event 不合 ScriptedResponse);
2. FS_NOT_FOUND:close client1 连带 drop sandbox 删 NOFY_HOME(B0 同款陷阱)→ `take_sandbox()` 保活+后续 client `set_env("NOFY_HOME", home)`;
3. 断言语义校准:活连接 8 事件,游标重放只转发**非 ACU** 事件(合并文本块按设计在 replay 丢弃),且 close 后有尾事件(-9)追加 → 游标须落在可重放事件上(ids[2]),断言"游标及之前不重放/之后可重放者必达/假游标回落全量超集"。

**测得语义(文档化)**:cursor 重放=updates.jsonl 游标跳过+ACU 丢弃+offset 后增量按非 isReplay 转发;游标缺失回落全量并 warn。

**hygiene 记**:NOFY_HOME 保活模式已在 crash_recovery/reconnect_delta 两 e2e 重复,test-support 收 `spawn_with_home(server, cwd, home)` helper。

### B1 第五件:LRU×内存压力驱逐(HM-F6 转译)+ spawn_with_home 收 helper(验证中)

**新模块** `eviction.rs`(nofy-daemon):`LruRegistry`(touch/coldest,Vec 序,容量外必驱);`pressure`(PSI `some avg10` 解析,host /proc/pressure/memory 与 cgroup memory.pressure 同解析器,特性缺失=无信号不报错);`EvictionPolicy.advise`(容量溢出必驱;压力超阈阈下也驱;无信号不驱;不驱到 0)。驱逐=DETACH 到盘(journal 支撑,resume 不丢),非销毁。

**helper**:`NofyStdioClient::spawn_with_home(server, cwd, home)` 收掉 reconnect 场景的 NOFY_HOME 覆样板;reconnect_delta_e2e 已切换。

**验证** ✅:nofy-daemon 24/24(lock 3+sd_notify 2+health 3+forensics 3+recovery 6+eviction 7);reconnect_delta_e2e 经 helper 重构后 1/1。

**B1 全部闭环(五件)**:①单实例双锁+退出码契约 ②watchdog+sd_notify+取证账本 ③恢复状态机 ④BufferedDelta 测量 ⑤LRU×PSI 驱逐。nofy-daemon 成为 B 期宿主装配的零件库(24 测试全绿)。

## 2026-08-14 · 批次 C 首件:CJK 会话检索(trigram 辅索引,HM-F9 转译)

**缺口核实**:会话搜索 FTS5 默认 unicode61,中文整句成单 token,子串检索必空。

**改动**(search_fts.rs):
1. SCHEMA_VERSION 4→5(升级 ratchet 自动 drop 重建,多代共享 DB 的 ping-pong 防护沿用);
2. 新增 `session_docs_fts_tri`(fts5 `tokenize='trigram remove_ascii 0'`)+ 三同步 trigger;升级 drop 批同步加新表/trigger;
3. 查询路由:`cjk_trigram_query`(含 CJK 且 ≥3 字符→双引号短语,引号转义)→ `run_match_query_on("session_docs_fts_tri", ...)`;ASCII 路径原样;
4. `run_match_query` 重构为表参数化 `run_match_query_on`(bm25/snippet/highlight 全表参数化);
5. 测试 3 例:CJK 子串命中(内容+标题)、短 CJK(<3)回落不报错、ASCII 路径不受影响。

**调试记录**:
1. 编辑时两处 SQL 笔误(`new.content` 误入列列表,原 trigger 与 tri_au 各一),静态复查即修复,未进编译;
2. 首跑全搜索套件红(连存量用例):`tokenize='trigram remove_ascii 0'` 报 "error in tokenizer constructor"——`remove_ascii` 选项在本 SQLite 构造器不受理(参数记忆错误,非环境缺陷)→ 改裸 `tokenize='trigram'`(默认大小写不敏感/去变音,对 CJK 子串无语义影响)→ CJK 用例绿。

**验证** ✅:全 search 套件 129/129。**C-1 闭环。**

## 2026-08-14 · 批次 C 审计闭环 + 批次 D 首件 nofy-channel

**C 审计结论(改判记录)**:
1. 写栅栏**已存在**:jsonl 存储 fs2 `lock_exclusive`(:466)跨进程排他;搜索索引 bootstrap claim single-flight 即索引侧写栅栏;
2. 耐久性现状=best-effort(flush 为主,局部 sync_all),DS-#8 的 per-request fail-closed 门**不存在**于 Rust 侧——属产品级延迟/耐久权衡,**入设计队列**,不静默改行为;
3. 全局会话清单已存在(`list_sessions_sync(None)`)。→ 批次 C 以"C-1 构建闭环+审计闭环"结束。

**D-1 nofy-channel crate**(11/11 绿):frame(u32 BE 长度前缀+JSON,partial-read 安全,16MiB 上限预检,torn header=错误非 EOF,validate-then-encode 契约);hello(首帧版本协商,major 不同=结构化 VersionMismatch);auth(认证在传输层:frame 不携带凭据;SharedSecretAuth 存哈希比哈希,LoopbackAuth;Principal scopes 由 daemon 收窄);backoff(封顶指数+jitter,Iterator 返 Option 修复一处签名错)。依赖预算 serde/serde_json/tracing,无语义类型(词汇留给 schema crate)。

### D-2 nofy-control-schema crate(闭环)

**收编不重造**:journal `Event`(seq/kind/session_id/at_ms/payload,serde 稳定字段序)直接作为控制面流单元 re-export;`EventKind::ALL: [EventKind; 24]` 加入 journal(纯增量,数组尺寸=编译器强制的词汇清点)。

**新增**:methods(控制面 req/res 半:session_list/session_attach(cursor=BufferedDelta)/session_search/approval 往返/ping;tagged snake_case;闭集);errors(闭集错误码表,`FS_NOT_FOUND` 等与 e2e 观测字节一致,`{code,detail}` 同 ACP 形状)。

**漂移门**:schema crate 内测试断言 24 kinds+wire 名唯一+wire 形状四字段 roundtrip+错误码 roundtrip——加事件=碰 schema crate=刻意 wire 变更。

**验证** ✅:nofy-control-schema 6/6;nofy-session-journal 50/50(ALL 常量编译校验变体数)。

### D-3 pack 边界落 nofy-daemon(闭环)

**pack.rs**:PackManifest(persona/skills/mcp/tool_policy/model_route/subagents/services);两条不变量机械化:
1. **DS-P4 面所有权**:`HOST_PLANE_KEYS`(sandbox/approval/persistence/registries)出现在 pack manifest=加载期 fail-loud(`HostPlaneLeak`),不静默到首用;
2. **DS-P2 isolate realm**:service 默认 `isolated`,声明 `root`=`RootRealmService` 拒;`compose_packs` 每 pack 独立 realm,跨包同名 OK、包内重复=`RealmCollision`(镜像 dsh provide() 抛错+leakedServices 加载期检测)。

**验证** ✅:nofy-daemon 28/28(+pack 4 用例:host-plane 拒、root realm 拒、跨包隔离组合、包内碰撞)。一处编译错(RealmMap 无 PartialEq)改 matches! 修复。

## 2026-08-16 · B 期宿主装配 v1(闭环)

**新 crate** `nofy-session-registry`(3/3):直读 `{root}/sessions/{cwd_key}/{session_id}/` 树(cwd_key 不透明、mtime 新鲜度、history 字节数),daemon 不依赖 shell 的预算落点;缺根=空非错。

**`nofy-daemon/src/daemon.rs` 装配**(31/31 含 3 装配用例):
- 启动权威链:lock(ALREADY_RUNNING 拒双跑)→ forensics record_startup → recovery decide(Escalate=拒自动恢复,exit CONFIG)→ health+watchdog(wedge→WEDGE_DETECTED)→ UDS `control.sock` 监听(非阻塞 accept+200ms tick 防 busy-spin;stale socket 清理)→ `sd_notify ready`;
- `serve_connection`:首帧必须 Hello(否则协议违例),VersionMismatch 结构化 ack 后断开;方法循环 Ping→Pong、SessionList→registry count、SessionAttach/Search/Approval→`NOT_READY`(接线留给下一件);
- 用例:handshake+ping+session_list 帧级 roundtrip、版本不匹配 ack、preflight 二实例拒。

**调试记录**:① `nofy_channel::sd_notify` 路径错(sd_notify 在 daemon 本 crate)→ `crate::sd_notify`;② UnixListener 无 set_read_timeout → 非阻塞+WouldBlock tick;③ 双 `&mut stream` 借用 → try_clone 读写分离;④ FrameError 补 `From<serde_json::Error>`+`read_frame_from` 借用助手;⑤ registry `Path` 仅测试用 → 测试内全路径。

**零件库累计**:daemon 31 / channel 11 / schema 6 / registry 3,全绿无警告。

## 2026-08-16 · 审批 broker 接线(NOT_READY #1 清零,闭环)

**approval.rs**:跨表面审批路由——provider 连接 `ApprovalRequest` 后**阻塞其连接线程**直到某表面连接 `ApprovalRespond` 或 300s 超时(fail-closed=无应答即拒);daemon 不决策只路由+守时限;重复 intent 拒注册、迟到应答不复活、settle 清理。`Arc<(Mutex<Option>,Condvar)>` 槽位。

**daemon.rs 接线**:serve_connection 增 broker 参数;ApprovalRequest→register+wait→`ApprovalResolved{decision}` 或 `APPROVAL_TIMEOUT`;ApprovalRespond→`ApprovalNoted`;run() **每连接一线程**(阻塞审批不 stall accept 循环);schema 增 `ApprovalResolved` 变体(加性)。

**wire 级用例**:两连接共享一 broker,provider 阻塞→surface 答 Deny→provider 帧收到 `approval_resolved/deny`。

**调试记录**:Slot 初稿把 Option 当 Mutex 用→改 Arc 槽位;approval.rs 漏 Arc import;测试首稿所有权绕→重写为共享 Arc 双连接。

**验证** ✅:nofy-daemon 35/35。**NOT_READY 余**:SessionAttach/Search 流式(需 provider 协议:shell 驻留运行时向 daemon 注册为 provider,daemon 路由 attach——下一件)。

### 2026-08-16 · provider 协议+SessionAttach 流式(最后 NOT_READY 清零,验证中)

**live.rs LiveBus**:per-session 有界环 1024+订阅扇出+死订阅发布时剪枝;publish 不重排。
**schema 加性**:`ProviderRegister`/`SessionEventPush` 方法、`ProviderNoted`/`SessionEvent` 响应;Event 非 Eq → 两枚举去 Eq derive。
**stream_session 两阶段**:先订阅再盘回放、seq 去重闭 gap(磁盘=真相,bus=提示通道);cursor=最后所见 seq;delta 后切 LIVE。
**SessionSearch 保留 NOT_READY 是设计**:索引在 shell 侧,daemon 经 provider 代理(下一件)。

**hang 事故(调试记录)**:attach e2e 首跑挂死——LIVE 循环只在写时感知 hangup,客户端**空闲期断开**则 streamer 永不退出。修复:timeout tick 写 Pong 心跳,写失败=断开→退订返回(客户端在 attach 流上忽略 pong)。教训:流式连接的存活检测必须与数据流解耦。重跑带外部 timeout 防再挂。

**验证** ✅:`nofy-daemon` 39/39(含 attach e2e:cursor=0 回放 seq1/2→live seq3→hangup 干净;心跳修复后 0.5s 完成)。**控制面 NOT_READY 清零(attach);search 保留为设计项(经 provider 代理)。**

**零件库终态(本轮)**:daemon 39 / channel 11 / schema 6 / registry 3,全绿。

### 2026-08-16 · search provider 代理(最后 NOT_READY 清零,闭环)+ PRD-1.1

**search_proxy.rs**:客户端 `SessionSearch` 阻塞入队;provider `SearchPoll` 长轮询拉活、`SearchResult` 应答;daemon 只持队列+槽位,**不向他人连接的写端写**(poll 设计换所有权简单);超时=`SEARCH_TIMEOUT` fail-closed 空。
**schema 加性**:`SearchPoll`/`SearchResult` 方法、`NoPending`/`SearchDispatch` 响应、`SEARCH_TIMEOUT` 码(闭集表扩一项,roundtrip 测试同步)。
**wire 用例**:client 阻塞→provider poll 得 dispatch(query 断言)→answer hits=7→client 帧 `search/hits=7`。

**验证** ✅:daemon 43/43、schema 6/6。**控制面 NOT_READY 全部清零。**

**PRD-1.1**:§11 施工状态看板回写(每组状态/落点/验证+测试累计+队列+设计队列);变更史追加。

### 2026-08-16 · 孤儿清扫 + 编排逻辑半(闭环)

**proc.rs(孤儿清扫,取证执行半)**:`proc_starttime`(/proc stat field22)+`proc_is`(PID 复用安全);`ChildrenRegistry` register/rotate/sweep_prev(TERM→500ms→KILL);preflight 启动期 rotate+清扫(单实例锁保证 prev 条目只属死 run)。3 用例:活体匹配/错 starttime 拒、sweep 杀真孤儿、死条目不扫。
**orchestra.rs(FR11 逻辑半)**:manifest toml 解析+校验(重复任务/悬空 needs/未知 pack=加载期 fail-loud;Kahn 余集=环);`topo_order` 确定性;`next_batch`(parallel 上限+依赖 settled);`transitive_skips`(失败/跳过传递闭包);OnFail 默认 Escalate(fail-closed)。4 用例。执行接线(SpawnAgent 到 shell provider)留集成件。
**调试记录**:OnFail 漏 Default→补 `#[default] Escalate`;batches 用例把 b1 当 succeeded 误断言→改为 running 语义。

**验证** ✅:nofy-daemon 50/50。

### 2026-08-16 · FR11 执行接线(闭环)

**OrchRun 状态机**(orchestra.rs):succeeded/dead/running/retries/aborted;`dispatch_next`(apply_skips+next_batch+标 running)、`settle`(ok→succeeded;失败先 retry 预算→`Retry`;耗尽按 on_fail:`Skip` 入 dead / `Escalate` 上表面)、`resolve_escalation`(allow=跳过依赖继续,deny=abort 全 run)。3 单测(retry→escalate→skip/abort、happy path)。
**wire 接线**(daemon.rs):`TaskSubmit`(manifest 校验失败=Internal 拒,加载期 fail-loud)→`ProjectAccepted{total}`;`TaskPoll`→`TaskDispatch{task_id,pack,goal}`/`NoPending`;`TaskResult`→settle;Escalate **复用跨表面审批 broker**(intent=task id;AllowOnce=skip-continue,Deny=abort)。
**wire e2e**:submit 2 任务带依赖→poll 得 t1→settle ok→poll 得 t2(依赖序)→settle→poll `no_pending`+run is_done。
**调试记录**:apply_skips 里 `dead.insert(id)` 移动后借用→换序。

**验证** ✅:nofy-daemon 54/54。

### 2026-08-16 · FR10 pack join 集成 + FR12 内置 file-steward(闭环)

**DaemonRun**:{orch, packs};`submit_run` 校验链:orchestration DAG→packs(可选,提供则)parse_pack(DS-P4)→compose_packs(DS-P2)→task.pack 覆盖检查;任一失败=submit 拒(Internal+原因)。
**TaskDispatch 增 persona/skills**:从已验证 pack 取,provider 按此 join 精确组合。
**wire 用例**:host-plane leak pack submit 被拒(code INTERNAL);clean pack 接受且 dispatch 带 persona+skills。
**FR12 内置包**:`builtin_packs()` = file-steward(persona 含"不删只入 trash、索引是提示磁盘是真相、批量受审";skills find/organize/summarize/cleanup/dedupe;tool_policy strict;services fs-index isolated)。用例:内置包走与三方包同一校验器 round-trip(无特殊化)。
**调试记录**:compose_packs 移动 parsed→clone。

**验证** ✅:nofy-daemon 56/56。shell 侧 join(provider 用 persona/skills 装配 agent)留集成件。

### 2026-08-16 · provider 客户端半 + LOC 棘轮(闭环)

**provider.rs**:ProviderClient(connect=hello+ProviderRegister 握手/poll_once/report 排干 ack 保帧对齐/run_loop=idle 250ms 退避+执行闭包注入)。shell 集成=传一个"用 persona/skills 装配 agent"的闭包,本 crate 不依赖 shell。
**hang 事故(调试记录)**:run_loop 生产语义无限循环;测试用 run_loop 且 drop JoinHandle 不停 daemon 线程→挂死 600s timeout。改手动驱动协议(poll→report→NoPending→drop client EOF→join),run_loop 留生产。教训:无限循环组件的测试必须外部可控终止。
**ratchet.rs(OC-F28 转译)**:控制面四 crate src LOC 上限=落地时刻值(daemon 3385/channel 544/schema 277/registry 132),只降不升;升上限=刻意改测试=评审钩子。

**验证** ✅:daemon 57/57 + ratchet 1/1。

### 2026-08-16 · shell 侧 pack join 闭包体(队列①完整闭环)

**pack_join.rs**(nofy-shell):`join_from_dispatch`(TaskDispatch→PackJoin,非 dispatch 帧 None)+`apply_to_builder`(persona→`with_persona_instructions` 遮蔽默认;skills 非空才 `with_skills`,空不破坏默认扫描)。纯映射与薄应用分离;apply 由 provider 接线行使(AgentBuilder::new 需活后端,不进单测)。
**验证** ✅:pack_join 1/1。

### 2026-08-16 · steward 运行时行为(队列②闭环)

**steward.rs**:Op 集合**构造上无 Delete**(Move/Dedupe/Trash,trash-over-delete);root  confinment 校验(fail-loud OutsideRoot/EmptyBatch);**批=单一审批单元**(approve-all/reject-all,部分批准不可表示);`as_task` 把建议批转 FR11 TaskSpec(pack=file-steward,verify=all-or-nothing)——steward 提案走与项目工作同一计划/审批机器。
**ratchet 实战**:steward 加入后 daemon src 3518>3385→ratchet 按设计红→**刻意**升 cap 到 3518(评审钩子行使);首改 cap 时 python 漏列 recovery/sd_notify 两文件(3290≠3518)→按 read_dir 全量语义定 3518。
**验证** ✅:daemon 60/60 + ratchet 1/1。

### 2026-08-16 · 覆盖缺口移植(队列①闭环)

**补缺口测试**:`pressure::sample_file`(temp PSI 文件→Some(3.2);缺失→None;/proc 真实路径"永不报错"由 Option 类型断言)+ `ProviderClient::connect` 真 UDS 握手(临时 socket+daemon 线程 serve_connection;空 daemon poll→NoPending)。
**ratchet 二次行使**:测试住 src 内→3565>3518 红→刻意升 cap(评审钩子按设计工作)。
**验证** ✅:daemon 63/63 + ratchet 1/1。

**施工阶段收尾判定**:控制面零件库+shell 接缝+steward+编排+清扫+棘轮全部闭环。**剩余为两类非零件工作**:① app 级集成(provider 循环宿主决策+MvpAgent 装配钩子注入,需产品决策)② CI 工具化(逐文件 100% 覆盖需 llvm-cov 政策,设计队列)。设计队列:DS-8 fail-closed 门、FR5 策略矩阵转译。

## 2026-08-16 · 队列②+设计队列清零:app 级集成 + DS-#8 门 + FR5 矩阵(闭环)

**app 级集成(provider 循环宿主,产品决策件按最小化决议=opt-in 门控)**:
- `provider_host.rs`(nofy-shell):`NOFY_DAEMON_SOCK` 未设=永不启动(默认关、零新外呼,31 e2e 基线不受影响);设置则独立线程连 daemon 控制面注册为 provider,单 runtime 跨重连存活;搜索长轮询委托 `execute_search`(FTS 栈原样,bootstrap 中空命中为假阴性→有界重试,同 ACP "bootstrapping 重查" 契约),TaskDispatch→`pack_join`→**subagent audience** AgentBuilder 装配(persona 只在 subagent 模板的 `<persona>` 块渲染,DS-P5 专家召唤语义)→真 SamplingClient 推理调用;失败 report(false)。
- `provider.rs`(nofy-daemon)增 `search_poll_once`/`answer_search`(加性,帧对齐排干 ack);搜索应答增命中身份:schema `SearchResult`/`Search` 加 `sessions`(serde 缺省空=旧对端兼容,加性漂移门用例同步)。
- `nofy daemon` 子命令落 pager-bin(state_dir=NOFY_HOME→registry 走同一会话树;控制面 UDS=`{NOFY_HOME}/daemon/control.sock`)。
- 接缝单测(无活 daemon):门 absent/set/blank、`search_answer_from_response` 约简(CJK 行→命中身份)、空根 fail-closed 零(不挂不死)。

**DS-#8 fail-closed 门(FR4.2,延迟/耐久权衡件)**:`RuntimeJournalHandle::durable_barrier`(writer 任务屏障:队列前缀全落盘应答;任一 append 失败/写者失联→Err)+ `request_initiation_gate` 接在 `run_turn_via_sampler` 发起前——未耐久则请求不发起(stream 第一个 chunk 都不产生),tracing::error+unified_log 可观测;日志未启用(NOOP handle)=直接放行,健康路径零变化。
**故障注入**(不 mock 被测件):journal 文件换成目录→真 writer append 失败→屏障 Err→发起被阻(断言 initiated=false+理由含 "not initiated");健康前缀→放行且事件在盘;noop→恒过。3 用例。

**FR5 策略矩阵(NG-F5 转译)**:`mode_permissions.rs` 声明式矩阵(PermissionMode×6 → ModeCaps:FORCE_PLAN/AUTO_APPROVE/SELF_REVIEW/PHASE_DETECT,无新依赖手写位运算)+ 纯查表 `mode_denial`(FORCE_PLAN 拒 Write;Execute/Read 不拒——plan 模式 bash 留在原权限链,沿用 plan-gate 既有语义);接入 `tool_calls.rs`:plan-file 豁免后、权限链前,拒绝落 `tool.decision deny/source=mode_permissions` + journal PermissionDenied 事件。
**测试**:deny(Plan×Write 带可观测理由)+ allow(六模式×Read、非 Plan×Write/Execute)+ 矩阵转译 + 访问类约简,4 用例。

**e2e**:`provider_loop_e2e.rs`(built-binary,默认 ignore):真 NOFY_HOME 先跑真会话播种 CJK 内容→`nofy daemon`→provider shell(NOFY_DAEMON_SOCK)→测试进程直驱控制面:SessionSearch CJK 子串=**播种会话身份命中**+负例零命中(断言内容非仅非空);TaskSubmit 带 pack(persona+真技能文件)→装配推理请求携带 persona/skill 正文/goal(模型边界内容断言)→TaskPoll=no_pending(run settle)。`EVAL provider_loop=pass` **双跑一致**(终版二进制复验再双跑)。
**调试记录**:① 首跑挂"provider 未注册"——daemon 默认 tracing 过滤=error,注册 info 日志不入 stderr→子进程 RUST_LOG 定向开;② persona 不达模型边界——主模板无 persona 占位,仅 subagent 模板渲染 `<persona>`→pack_join 加 subagent audience;③ 委托缝单测并行红——SEARCH_INDEX_MANAGER 进程级单例 tokio 任务绑定首触 runtime,`#[tokio::test]` 各自 runtime 致 bootstrap 消息投死通道/search.rs 既有文档化竞态→单测改约简纯函数+空根 fail-closed(内容路径由 e2e 证明),搜索套件 `--test-threads=1` 收录(两个 bootstrap 用例并行竞态为既有,文件未动)。

**棘轮三次行使**:daemon 3565→3707(provider 搜索缝+wire 用例)、schema 277→312(加性字段+漂移门),`tests/ratchet.rs` 刻意升 cap 并注释理由。

**验证** ✅:daemon 64+ratchet 1 / channel 11 / schema 7 / registry 3 / shell 接线单元 24(pack_join 1+provider_host 5+mode_permissions 4+DS-#8 3+runtime_journal 11)/ 搜索 131(单线程)/ built-binary e2e 31/31 回归 / crash_recovery+reconnect_delta EVAL pass / provider_loop EVAL pass×2。PRD-1.2 回写,队列②+设计队列清零。

## 待办(B 期起)

- B0 续:任务完成率/压缩保留率/对账检出率三度量件;CI lane 跑 ignored e2e。
- B1-B6 常驻可靠性(见 p0-construction-plan §2)。
- hygiene:运营件与 401 归因物理移除;nofy-pager leader 残留 warnings;派生路径断言改引用常量;对抗夹具保留确认。
