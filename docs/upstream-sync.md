# 上游同步台账

我们与上游 xai-org/grok-build 无共同 git 历史(物理剔除 xAI 依赖 + 全量改名),
每次上游更新只能人工对照移植。本文档记录基线、流程与**有意分歧**,
让每次同步的摸底成本最小化。

## 基线

| 项 | 值 |
|---|---|
| 我们的移植基线 | 上游 1.0.4 |
| 已同步到 | 上游 1.0.8(2026-08-25,批1–批8) |
| 上游克隆 | `/tmp/grok-upstream`(丢失时 `git clone https://github.com/xai-org/grok-build`) |
| 对照工具 | `scripts/upstream_diff.sh`(命名归一后 diff;`--changed <tag>..` 列改动面) |

## 标准流程(每批)

1. `scripts/upstream_diff.sh --changed <上次同步点>..` 摸清改动面,按自包含程度分批
2. 每批:读上游 → 归一移植(`xai*` → `nofy*`,见脚本内映射表)→ 核对依赖 → `cargo check`
3. `cargo test` 相关 crate(基线:shell ~5242、pager ~8100、hooks 202+13)
4. `gitnexus_detect_changes(scope:"all")` 核对变更范围
5. 提交(中文信息)→ 并行 `npx gitnexus analyze` + `NOFY_VERSION=x.y.z cargo build --release -p nofy-pager-bin`
6. 安装 `cp target/release/nofy ~/.local/bin/nofy` + 冒烟 `nofy -p "只回复两个字:正常"`

## 有意分歧(上游有、我们不移植/简化)

摸底时先查这张表,命中即跳过,不要重复评估。

| 上游特性 | 我们的状态 | 原因 |
|---|---|---|
| remote_sync / 云同步 | 无 | 随 xAI 账号体系剔除 |
| remote_settings / requirements 特性钉选 | 简化为 `BoolFlag: env > config > default` | 远端设置拉取已剔除 |
| 计费/付费墙/账单 | 无 | 物理剔除 |
| xAI 登录流 | 无,BYOK(DashScope 等 OpenAI 兼容端点) | 物理剔除 |
| 媒体生成/网页搜索/语音工具 | 无 | 物理剔除 |
| 状态栏(status line) | 无 | 批12 待移植;上游依赖它的代码(如事件循环刷新计时)移植时裁掉 |
| feedback_manager(退出反馈上传) | 无 | 依赖云上传;相关测试引用时裁掉 |
| 遥测 activity gauges(SUBAGENTS_ACTIVE 等) | 无 | 仅遥测面,需要时整体移植 |
| turn.rs round 式 goal 循环重构(GoalRoundDecision 外的上游回合结构) | 保留现有循环 | 上游 turn.rs 大重构的一部分;我们的循环语义等价,让位/续跑门控已按上游逻辑移植 |
| session registry 标题同步 | 无 | 依赖 registry 服务 |
| 权限 Always/Never | 无 | 批9 待移植(~1400 行,安全敏感) |
| attempt_store 子代理恢复台账 | 无 | 批10 待移植(~1500 行) |
| MCP elicitation | 无 | 批11 待移植(~2640 行) |
| 双向文本(阿拉伯/波斯) | 无 | 低优先 |

## 移植时的常见适配点

- `log_prompt_cache_usage` → 我们是 `log_prompt_cache_hit`(side_call.rs)
- `AuxCall` 无 `hosted_tools` 字段
- `strum` 依赖:我们不引入,枚举改手写 `as_str` + 显式变体列表测试
- 测试字面量(SessionActor/AppView 等)新增字段时,用脚本批量补 12+ 处测试构造点
- 上游 `CancellationCategory` 在 `session::events`,我们在 `nofy_file_utils::events::types`
- 上游 grok_build 工具路径 → 我们 `nofy_build`
- 上游 `_x.ai/` wire 方法前缀 → `_nofy/`
- 队列策略移植(批8-4):上游 `trace_gcs_config`/`artifact_tracker`/`tool_overrides_update` 字段一律裁掉;`goal_tracker.lock().status()` 两侧同构可直接用;`combine_edit_holds: HashSet` → `edit_holds: HashMap<String, Instant>` + `EDIT_HOLD_TTL`(10 分钟)+ `expire_older_than` GC
- goal steering 移植(批8-5):steer 缓存是进程级静态,翻动它的三个测试要加串行锁(`STEER_CACHE_TEST_LOCK`)防竞态;e2e mock 从 prompt 反引号 `.md` token 取计划路径(`plan_path_from_prompt`),不能写死 `/plan.md`(planner 现在写暂存文件 `plan-<uuid>.md`)
- 权限 Always/Never 移植(批9):上游 `xai_grok_paths`→`nofy_paths`、`xai_grok_agent`→`nofy_agent`(state.rs 仓库根作用域);本机 `~/.claude/settings.local.json` 有真实规则,.resolution_tests 里 15 个全局层测试要补 HOME 隔离守卫(上游 CI 干净不需要);`ToolInput::from(EditInput)` 我们映射到 `Dynamic`(上游映射 `SearchReplace`),types.rs 动态测试断言随之调整;`permission_prompt` 通知钩子:管理器接线(`wire_permission_prompt_notification`)与 tool_calls 内联分发二选一,两者都留会双发;钩子事件 wire 方法是 `nofy/hooks/event`(测试里别写 `x.ai/`);`remember_tool_approvals` 默认翻转为 ON(`DEFAULT_REMEMBER_TOOL_APPROVALS`),pager 默认值测试/开关方向全部随之翻转;上游 pre_tool_use `updatedInput` 钩子改写特性未移植,其测试不纳入

## 已完成批次日志

| 批次 | 提交 | 内容 | 版本 |
|---|---|---|---|
| 批1 | 23413806 | 剥图持久化 | 0.2.134 |
| 批2 | 2882a728 | 压缩请求图片预算 | 0.2.135 |
| 批3 | 3a06e55a | 子代理 429 等待 | 0.2.136 |
| 批4 | 3a04656d | 启动/退出加固 | 0.2.137 |
| 批5 | 5a0b47d8 | 子代理生命周期去重 | 0.2.138 |
| 批6 | 428d235c | 会话加载屏障 | 0.2.139 |
| 批7 | d5ef2f8f | 回合结束钩子上报(StopCancelled+epoch 状态机) | 0.2.140 |
| 批8-1 | c0f28872 | 工作流列表+命名参数+effort | 0.2.141 |
| 批8-2 | 47a7a422 | 标题自动刷新(3/6 回合) | 0.2.141 |
| 批8-3 | e570b82b | 进程内 /minimal⇄/fullscreen | 0.2.141 |
| 批8-4 | 2077fc9b | 队列策略架构:InputPolicy/QueuePolicy 类型、queue_mutation 授权、edit_holds TTL 乐观锁、HoldEdit promote 阻塞、受保护行 | 0.2.142 |
| 批8-5 | 2da01b78 | goal steering:planner 转向循环(5 次上限+目标身份守卫+原子暂存)、队列并入活跃 goal、promote_queued_as_interjections、goal 回合让位、follow_up_behavior 配置+pager 设置 | 0.2.143 |
| 批9 | 3fe2d814 | 权限 Always/Never:manager/bash_grants 作用域持久化、state 仓库根存储+deny 集、resolution MCP URL 结构化匹配、prompter Never 行、pager 分行作用域 UI、permission_prompt 管理器接线、remember_tool_approvals 默认 ON、sessions 目录 0700 | 0.2.144 |
