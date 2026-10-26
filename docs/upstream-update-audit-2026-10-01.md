# 上游 1.0.42–1.0.45 更新审计与吸收建议

审计日期：2026-10-01。状态：批43–50原生实现进入集中验证；初审证据保留在§2–5，最新执行与差异见§7。

## 1. 基线与结论

- Nofy：`二次开发分支`，`e9401ff4dc96`。
- 已完成吸收的上游对账点：`f0e3be11`（1.0.41）。
- 本轮目标：`2bdd1d6a6369`（1.0.45），新增同步提交 `97f190f6`、`2bdd1d6a`，提交日期均为 2026-09-29 UTC。
- 两提交合计：991 文件，129,569 行新增、27,951 行删除。首提交 962 文件，第二提交 68 文件，文件集重叠。
- `crates/` 987 个变更路径，其中 Rust 861 个。按现有脚本归一 crate 名与路径，428 个路径存在、559 个不存在。
  此数字只是路径清单：包含搬迁、删除、测试和已退休实现，不是 559 个功能缺口。
- 当前可见历史没有共同 merge-base；ahead/behind 不能用于计算功能完成率。

**建议继续吸收，采用原生分批移植，不直接整段 merge/cherry-pick。** 理由是上游重构了沙箱、配置分层、
权限规则与生命周期边界，而 Nofy 已有 JSON 配置、自研子代理解析和统一记忆。直接覆盖会破坏本地合约。
本轮保留既有边界：桌面暂不实施、无 xAI 云服务或遥测回流、记忆仍只有 `MemoryService` 一套。

初审证据来自本地 Git 对象、上游区间 diff、当前 Nofy 源码和两侧已有测试源码；初审未运行行为测试，
“建议吸收”不等于“已修复”，“需复测”不等于“已确认缺陷”。
GitNexus 已重建到 `e9401ff`：218,094 nodes / 446,554 edges / 300 flows，CLI status 为 up-to-date。
query/context 复核到锁路径 helper 与 Dream 的 shell 入口；Rust 调用关系仍有空结果，不能用空图证明无调用。

## 2. 发布说明逐项审计

发布说明共 **25 项**：1.0.42 为 12 项，1.0.43 为 1 项，1.0.44 为 8 项，1.0.45 为 4 项。

| 版本 | 更新 | Nofy 当前证据 / 差距 | 建议 |
|---|---|---|---|
| 42 | Footer、`/usage` 显示 smart-auto 实际模型 | 上游依赖路由模型语义；Nofy 当前模型目录与显示以所选模型为主，未确认同等 smart-auto 服务 | 有服务契约时接入实际模型元数据，不复制 xAI 路由依赖 |
| 42 | 独立 `worktree create` 命令 | `nofy-pager/src/worktree_cmd/mod.rs` 尚无 Create 分支；底层 worktree 能力已有 | 吸收薄 CLI 入口，stdout 只输出路径，错误与策略说明到 stderr |
| 42 | Auto 显示名改为 Auto-review | 当前 UI 仍存在 Auto；这是命名变化，非新增权限机制 | 可对齐显示文案，内部 `auto` 标识与旧配置保持兼容 |
| 42 | 非剪贴板 bracketed paste 不附残留图片 | `app/effects/mod.rs` 已比较 clipboard payload，但受终端 `delivers_ime_as_bracketed_paste()` gate 限制 | 核实所有终端的覆盖范围，扩大防误附，保留已有附件寿命校验 |
| 42 | `-p` 信号退出与会话清理 | 当前 `headless.rs` 有正常退出清理，却没有上游 `headless/signals.rs` 的 deferred signal 交接 | 优先补齐 SIGINT/SIGTERM、130/143、子任务清理；属于旧对账点已存在的遗留差距 |
| 42 | 计划评论连续 Ctrl+C 取消 | 上游 plan.rs 有 `ctrl_c_cancels_empty_draft`；Nofy 未发现同一分支 | 吸收，两种评论入口均需覆盖 |
| 42 | minimal resize 后历史与底部锚定 | Nofy 有自研 minimal viewport/overlay，不宜整体覆盖 | PTY 复测后按失败行为移植；目前不宣称已存在缺陷 |
| 42 | stash 恢复光标到末尾 | Nofy `prompt_stash.rs::restore_stash_entry` 已执行 `set_cursor(text.len())` | 已有等价实现，保留；不要改通用 restore 的原光标语义 |
| 42 | WinGet 更新只打印 upgrade 命令 | Nofy 未保留上游 `xai-grok-update` crate | 无现有 WinGet 更新入口可修，暂不吸收 |
| 42 | 全重绘后重新上传终端内联图片 | Nofy 有完整重绘与自研媒体状态，需检查缓存失效与输出时序 | 跨终端重绘回归后决定最小改动 |
| 42 | fresh session 插件 hooks 即生效 | Nofy spawn.rs 构建 hooks 仅使用 discover_hooks/parent override；插件 hooks 在 reload 路径另行添加 | 优先吸收首启合并、继承父项目、reload 替换与禁用清除 |
| 42 | marketplace URL 大小写 / `.git` 后缀不影响更新识别 | Nofy installer.rs 两处仍直接比较 `source_url_or_path` | 吸收共享 source identity；本地路径的 `.git` 差异必须仍可区分 |
| 43 | minimal MCP 输入卡片、未回答提示 | Nofy minimal `Modal` 没有 Elicitation；完整 TUI 已有 elicitation | 吸收卡片显示、输入路由与未回答原因，避免用户看不见待答请求 |
| 44 | macOS `sandbox-exec` 后端 | Nofy 已通过 nono 使用 Seatbelt；上游新增 per-command policy/backend/grant/violation 与网络代理 | 单独设计评估，不能以“缺少 macOS 沙箱”为理由替换现有系统 |
| 44 | 模型多个 context windows | Nofy `ModelInfo.context_window` 为单个 `NonZeroU64` | 吸收候选列表，首值默认，继续兼容旧标量 |
| 44 | `/context-window` | Nofy 无该命令 | 吸收 session selection、持久化、restore/fork 和服务器 overflow 回退 |
| 44 | `/model` 先选窗口再选 effort | 当前只有 model/effort 路径 | 与上一项一批落地，避免只做 UI 没接入压缩预算 |
| 44 | 计划评论 hover 删除按钮 | Nofy 有键盘删除，未有上游统一 `delete_plan_comment_by_id` 行为 | 吸收鼠标/键盘共用删除，删除正在编辑的评论要恢复草稿 |
| 44 | 快捷键多词搜索及 help 文本 | Nofy filter_entries 仍以完整 query 对各字段做 contains | 吸收逐词匹配，保留分组、隐藏项与光标规则 |
| 44 | Windows clipboard 并发操作崩溃 | Nofy 有 arboard lease，但没有上游 Windows 全操作互斥层 | 吸收 Windows 专用限时互斥；Linux 不持锁跨永久阻塞读 |
| 44 | 同文件工具调用串行、异文件并发 | Nofy shell 有按原始路径字符串分组；上游对 cwd、`.`/`..`、symlink ancestor 归一，并声明 lock_path_param | 优先吸收路径归一、参数重命名和能力声明；保持异文件并发 |
| 45 | 插件/自定义 agent 可直接 spawn | Nofy `nofy-subagent-resolution` 已解析插件、project/user/CLI 定义并 gate；上游新加可选择列表与动态 schema | 部分等价，补 schema/描述；继续用现有统一解析器，不另建一套 |
| 45 | MCP bearer token file 每请求重读 | Nofy 无 `BearerTokenFile` 与 config path 定义 | 优先吸收配置→GET/POST/DELETE 全链；原子换文件、失败与重连均覆盖 |
| 45 | 模型 notice banner | Nofy 无上游 model_notice_banner 与关联模型字段 | 可吸收用户可见提示，BYOK/配置也能提供；不携带云通知服务 |
| 45 | 父回合等待 N 个子代理 | Nofy WaitingReason::Subagent 仍渲染固定 `Waiting on subagent…` | 吸收真实前台运行数，0/1/N 与取消/后台转换均需验证 |

## 3. 发布说明之外的重要代码差异

### 3.1 必须优先吸收的协议修复

`nofy-sampler/src/stream/messages.rs` 当前 `SignatureDelta` 使用赋值，且
`assistant_reasoning` 是 `Option<ReasoningItem>`。上游改成第一次 delta 替换起始种子、后续 delta 追加，
每个 thinking block 都进入 `Vec<ReasoningItem>`。这两处旧逻辑分别可能截断分段签名、丢弃前面的推理块。
建议先移植这两个修复，补多块/多 delta/带初始签名回归。上游同时加入 Narration 通道，
应单独核对 nofy 各 reducer、持久化和前端消费者；避免只加 enum 导致重复输出或漏处理。

### 3.2 Shell 工具新等待合约

上游 Bash `current` 合约新增 `block_until_ms`，0 立即后台，正值表示等待预算，到期不杀死进程；
旧 `is_background`/`timeout` 仍接受，并提供 `pre-block-until-ms` 行为版本。
建议原生吸收，但作为独立批次：schema、提示词、配置 `default_block_until_ms`、实际终端执行、
通知和 get_task_output 都必须同批贯通。不能把旧 timeout 字段直接改名，否则会改掉杀进程语义。

### 3.3 会话失败、工具输出与配置写入

- 上游 `dispatch/prompt.rs` 新增 `load_failed` 闸口，加载失败的 tab 不再把输入无限排队；Nofy 未发现该闸口。
  吸收失败状态与明确提示，仍允许 `/new`、`/resume`、exit 等本地恢复操作。
- 上游把 structuredContent helper 移入 tool-runtime。Nofy MCP client 已能追加并去重，runtime 也能提取。
  但 `use_tool::gateway_result_to_text` 在有 content 时直接返回 parts，需反查网关结构化 payload 是否被丢掉。
  这是待验证的消费端差距，不是重做已完成 helper 的理由。
- 新 grep CappedOutput 统一阻塞/流式字节与行数上限。Nofy 已有 5 MB cap、默认 head limit 和流式输出；
  需核对边界一致性，不能按缺少新文件判定缺少限制。
- ACP 新增专用 stdin 字节线程与 bounded line reader；按 Content-Length transport 的实际消费者核实后移植。
- 上游 fs_atomic 新增 user symlink 写入和落盘 inode 校验。Nofy 已有 symlink destination resolver；
  尚需核实共享可写目录的临时文件替换防御。所有实现应接入当前 JSON 配置，不恢复 TOML 主存储。

### 3.4 大规模拆 crate 不是功能待办

`cloud-config` 主要从 shell 搬走 managed/remote settings；`permission-rules` 大量文件从 workspace 搬出；
`lifecycle` 是新的共享执行边界。路径不存在并不说明行为缺失。只吸收实际语义或安全修复，
除非有独立依赖边界收益，不为追齐上游目录而重构。文件加速路由保留接口候选，尚无本地 accelerator
需求时不导入服务实现。`/compact <text>` 被上游删除，Nofy 保留用户保留重点的现有能力。

## 4. 两个独立架构评估

**沙箱：** 上游 per-command Seatbelt 支持动态 write roots/read denies、protected paths、可重试授权，
以及 proxy-only 网络/egress proxy。Nofy 当前是进程启动时应用 nono，子进程继承文件限制、Linux 已知
启动点单独处理网络。两者生命周期与权限入口不同。应先列全 bash/terminal/PTY/shell-state/static-shell/
worktree/hook 启动点，确定如何保留进程内文件操作防护，再考虑命令级机制；不能只包 Bash 就宣称沙箱完成。

**记忆：** 上游增加 Batch Dream 的预算、scope 共享 consolidation lease、claim/defer/settle、持久化
提交计划与冲突恢复，并记录 topic read 用于排名。Nofy 已有统一 consolidation 的 frozen plan、operation
lease、hash 校验、阶段恢复及用户/pinned topic 保护。因此不移植 V2 存储/第二套 runner。
值得专项核实的是“不同 operation 与普通用户写入是否共享 scope 排他边界”、中断提交与并发编辑冲突、
长期 defer 队列上限，以及读取统计是否真正影响索引排名。仅 operation lease 与写前 hash 检查不能单独证明
跨进程无竞态；该判断必须用并发/故障注入测试验证，不能在本次初审中直接宣称 Nofy 有数据丢失 bug。
改善只能进入现有 `MemoryService`/access/state/consolidation，继续保持静默无关回合、真实写入回执和可信引用。

## 5. 建议执行批次与验收

| 批次 | 内容 | 完成条件 |
|---|---|---|
| 43 | Messages 签名与多块推理 | 多 delta、多 block、起始签名、passback 顺序回归通过；确认 Narration 是否必要 |
| 44 | 同文件编辑路径与锁声明 | 相对/绝对/`..`/symlink/参数别名同锁，异文件仍并发；多文件 patch 的边界单列 |
| 45 | 插件启动 hooks、source identity、自定义 agent schema | fresh/reload/禁用/跨项目子代理继承一致；定义解析和 policy gate 无重复机制 |
| 46 | MCP token file 与输出消费者 | GET/POST/DELETE/重连读取新 token；16 KiB 上限、5s 超时、空/非法文件不泄密；网关 structuredContent 回归 |
| 47 | headless、elicitation 与加载失败闭环 | 信号退出码及清理、minimal 真实卡片与未回答提示、失败 tab 可恢复且不无限排队 |
| 48 | 模型窗口选择与显示 | scalar/list 兼容、选择持久化、restore/fork/model-switch/overflow、压缩预算及 UI 一致 |
| 49 | Bash 单等待参数合约 | 新旧行为版本均验证；等候到期转后台不杀进程；进度、取消和工具结果真实 |
| 50 | CLI/TUI 与跨平台修复 | worktree create、评论、搜索、Windows clipboard、子代理计数；PTY 判定 resize/图片是否需修 |

沙箱与统一记忆列为两个专项，需在执行前展开设计与验收用例；不计作已确定可直接移植的小批次。
工具性能/原子写入/输入读取候选在对应批次前补证据，仍未核实的应保持明确待办。

执行顺序建议 43 → 44 → 45 → 46 → 47 → 48 → 49 → 50；沙箱与记忆专项各自收口。
每批编辑符号前跑 GitNexus impact 并报告风险，提交前跑 detect_changes；索引结果有盲区时以调用方、
编译器和测试交叉确认。测试使用既有 target，避免另建全量构建目录；定向通过后做受影响 crate 的全量门，
最后 workspace all-targets check。不重复全仓格式化，不覆盖桌面已有工作区改动。

## 6. 当前收口状态

初审完成 25 条发布项分类与关键代码风险核查；随后已开始原生吸收，见下方执行记录。
**没有整体 merge 上游，也未宣称全量稳定。**
签名、路径锁、插件启动 hooks、令牌文件、MCP 卡片与模型窗口有明确吸收价值；沙箱与记忆必须保持
本地用户语义后整合。此前 1.0.41 的发布说明收口不代表所有源码路径等价：headless 信号实现已经存在于
`f0e3be11`，本轮发现 Nofy 未包含，已补入批47，后续不能只审新增文件。

### 6.1 本轮执行记录

- 批43：`stream_messages` 首个 signature delta 替换起始 seed，后续 delta 追加；
  completed response 按 stop 顺序保存所有 signed reasoning blocks（包括无文本的签名块）。
  `cargo test -p nofy-sampler --lib`：205/205，通过。新用例分别恢复旧覆盖签名、仅保留最后
  block 的行为，两次均按预期失败，恢复修复后全量通过。
  Narration 暂不移植：上游通过解码不透明签名猜测 channel；本轮只修协议数据完整性，
  显示 channel 适配仍待核实，不能将批43全部验收项记为已完成。
- 批44a：新增共享 lock path resolver，批调度一次性冻结每个调用的 normalized key，
  读写路径共同使用该 key；已有文件、新文件、相对/绝对路径与 symlink ancestor 均归一。
  比上游进一步保留 `symlink/..` 的文件系统语义（先 canonicalize 已有祖先再 lexical normalize）。
  `cargo test -p nofy-tools util::lock_path --lib`：2/2，通过。
  shell 集成编译结果另见同步台账；未做真实 dispatcher 并发端到端测试。
- 批44剩余：显式 lock path metadata、client 参数重命名，以及多文件 patch 的锁边界与真实并发验证。
  批45–50与沙箱/记忆专项仍未实施。
- GitNexus：`stream_messages` impact HIGH（18直接依赖，含17测试和1生产调用，0已识别执行流）；
  `execute_tool_calls_batch` LOW/0依赖，源码交叉确认锁路径3处消费。
  unstaged detect_changes 为 LOW、9已知符号、0执行流；不包含未索引的新 helper/test 的完整影响，
  且未暂存区含现有桌面改动，不应把该结果等同于整库无风险。
- 原 target 目录不存在，本轮选择性构建已创建单一仓库 target；未另建全量 target 或执行整库格式化。

## 7. 一次性落地与集中验收

本节取代§6.1的早期剩余清单。25条发布项实现分类为21项原生落地、1项既有等价、3项有意不引入。
minimal resize先前误判既有等价：只比对了minimal绘制顺序，遗漏底层inline terminal按旧高度resize的差异。
真实PTY揭露后已补齐底层live viewport高度、实际光标记录、width reflow偏移与保守终端策略、同步更新外autoresize；
原长历史严格断言和新增短对话内容锚定用例均通过，因此改计原生吸收，不再记作既有等价。
这不是运行时全等价或跨平台稳定性证明，最终测试结果须另列。

| 批次 | 本轮实现 | 验收重点 |
|---|---|---|
| 43 | 分段签名与多块推理完整保留；LengthPolicy统一actor和直接收集，默认完整工具调用、显式允许部分文本 | 签名/多块、策略矩阵、两入口本地HTTP回归、过滤原因不被工具调用覆盖 |
| 44 | 15种工具声明路径；client参数别名反映到锁key；真实cwd、已有祖先及symlink/父组件归一；同批读写共享锁 | 锁竞争与异文件独立；真实actor连续别名写入；多文件patch不宣称单路径保护 |
| 45 | 首启合并插件hooks、reload替换/禁用清除、父会话最新扩展快照；共享source identity；自定义agent提示列表 | reload后新子助手、跨项目快照、remote URL与local path区别、CLI fallback保持可选 |
| 46 | MCP bearer token file经配置进入GET/POST/DELETE与重连；16KiB/5s限额且取消不积累阻塞任务；网关结构化结果 | token轮转/错误无泄密；ACP stdin 64MiB；fs_atomic同步及inode校验；grep既有限额保留 |
| 47 | headless独立信号线程及deferred清理；minimal复用完整elicitation卡片；拒绝/关闭/过期可见提示；失败tab闸口 | 真实子进程130/143/129、表单绘制、草稿恢复、排队表单幂等关闭、本地恢复命令 |
| 48 | context scalar/list与notice兼容；菜单选择和服务器cap分离；ACP/预算/持久化/恢复/fork/effort全链 | 服务确认后更新UI；非菜单服务器cap跨恢复不回升；非法窗口拒绝、model变更清旧cap |
| 49 | Bash current只广告block_until_ms；旧行为版本保留；JSON默认/最大等候、concise适配 | 0/等候到期真实后台存活；旧timeout仍旧语义；运行进度与任务查询 |
| 50 | worktree create薄CLI、Auto-review文案、粘贴防残图、评论取消/共用删除、多词搜索、等待子代理计数、重绘媒体缓存 | stdout纯路径；本地mock minimal真实PTY resize；Windows互斥需Windows/Linux构建另验 |

### 7.1 记忆并发专项

只增强现有MemoryService：scope内同步事务共享同线程可重入、不可Send的OS文件锁，覆盖用户CRUD、
整理计划、观察状态、manifest、清扫和回滚；不同scope独立，锁文件不unlink，忙时5s明确失败。
锁不跨await，不声称能阻止不遵守协作锁的外部编辑器。
每次整理最多20条、256KiB、单条生成topic最多16KiB，未处理观察保持Active。
仅剩超限条目时明确提示手动缩短/拆分，不静默成功、不错误归档、不重建V2 defer runner。
回归包含两operation竞争同hash唯一胜者、回滚与用户写入、不同scope、真实进程退出释放、20+3预算。
隐式search结果不记作用户已经读过，不导入上游read-hit排名强化；保留query/pinned/对象优先级的体验设计。

### 7.2 明确不引入与边界

- 发布项3个有意差异：无对应云路由契约的smart-auto实际模型；无现有入口的WinGet updater；
  命令级沙箱/动态授权/网络代理架构。后者保留Nofy的进程级Seatbelt/Landlock边界，不是缺少macOS沙箱。
- 已核对启动点：pager-bin与shell配置应用进程沙箱；terminal标准/PTY启动点、static-shell、shell-state、
  worktree和hooks继承文件限制。Linux部分启动点单独设网络限制，不能据此声称所有入口等价于proxy-only网络。
  保留现有hook写入deny防护；独立子进程deny-path E2E验其本地实现，不证明上游动态授权能力已移植。
- Narration不猜解不透明签名头：signed reasoning完整保留，不新建不可靠显示通道。
- 自定义agent schema使用开放字符串加examples/description；统一resolver仍支持CLI定义，避免不完整enum阻断能力。
- 单文件metadata已进入本地真实dispatcher。独立tool-server的custom_capabilities wire广告不宣称已接通；
  上游区间中该字符串helper也没有生产消费者，不能把文档声明当成端到端功能。
- Responses保留Incomplete的Length/ContentFilter原因，不让工具存在掩盖截断；默认LengthPolicy仍兼容完整工具调用。
- 不引入上游遥测/登录/云通知，不恢复TOML主存储，不另建Memory v2，不改桌面现有工作区。

### 7.3 集中验证记录

集中验证已修正新增字段fixture、类型/引用错误、父扩展快照、服务器cap恢复与共享客户端预算通知，
以及`/context-window`与技能名冲突的保留名遗漏。首轮Bash失败为旧fixture仍检查已退役广告参数，
已明确固定旧版本并新增当前版本契约断言，工具库全量复验通过，没有删除失败用例。

| 验证范围 | 已取得结果 |
|---|---|
| ACP/config/config-types/MCP/MemoryService及集成测试 | 712通过；1项记忆性能测试默认ignored |
| agent/chat-state/plugin-marketplace/sampler/sampling-types | 1637通过 |
| tools全量lib | 2916通过，7 ignored |
| workspace全量lib | 1779通过 |
| pager-minimal / shared全量lib | 82 / 101通过；shared 4项真实剪贴板测试ignored |
| pager最终全量lib | 8121通过，6 ignored；共享cap/effort/default重置回归均通过 |
| ratatui-inline / pager-render | inline 54通过；render安静环境全量1055通过、2 ignored；首次并行编译下tmux临界时间超时，保留原1.5s门限复验通过 |
| shell最终全量lib | 5274通过，12 ignored；含收尾广播字段与保留名修正 |
| workspace all-targets编译 | 最终通过；实际nofy二进制构建也通过 |
| 强制沙箱E2E | REQUIRE_ENFORCEMENT=1：8通过；1个供父测试调用的child入口默认ignored，非环境软跳过 |
| minimal真实PTY | 最终--include-ignored：31通过、0失败、0忽略，85.52s；30真实PTY加1 harness辅助用例 |
| sampler独立integration入口 | --tests全量通过：206 lib与27 integration；LengthPolicy真实HTTP两入口矩阵通过，lib重复不再累计 |

真实actor参数别名连续写入、跨项目父快照、非菜单服务器cap恢复、真实子进程信号交接均在对应全量测试中通过。
这些并非所有真实provider/终端/操作系统的E2E证明。Windows剪贴板互斥及Linux网络边界仍需对应平台验证。
使用单一既有target，没有全库重新格式化；本轮尚未提交/push，桌面原有改动保持原样。

上述最终成功结果去重按crate/测试目标计21,797项，不含ignored，不累加失败首轮或重复复跑。
GitNexus `detect_changes(scope=all)`：562个已索引符号、29条流程、157个已跟踪变更文件，risk CRITICAL；
已核对会话启动/MCP配置、记忆/工具执行、通知分发、headless与取消流程，符合本轮范围。
157文件也包含现有桌面脏工作区，图中已映射的符号均属crates/docs；不得把范围检测当作功能正确性证明。
首次全量索引重建因原生Napi解析异常退出；缩小worker子批的重试已成功（839.6s，310,966 nodes、621,570 edges、300 flows）。
新图范围复查为582符号/29流程/162文件，risk仍为CRITICAL；另外映射到4个原有桌面i18n文件，不是本轮修改。
最终检测为590符号/29流程/166已跟踪文件，risk CRITICAL；范围包含原有桌面脏工作区，未提交。
底层resize收尾在此次索引采集之后，新增光标/reflow helper已以源码调用链、54项inline与1055项render回归、
30项真实PTY补查；不将图中0流程视作无影响。最终workspace all-targets再次通过（27.22s）。

相关库单独组合验收还发现Pager信号fixture隐式依赖其他crate启用Tokio `test-util`，已在Pager dev-dependencies显式声明，
生产依赖不变；原虚拟时钟/第二次信号断言保留，不通过削弱测试绕开构建失败。

minimal全组首轮两处旧fixture已修正：空文件`touch`不再触发内容写入floor，改为显式
`--permission-mode default`人工询问模式加`printf`真实内容写入，保留真实“No, reject”弹窗与左对齐；
Esc关闭菜单后另以Ctrl+C清草稿。原地模式切换不再重新启动/显示第二欢迎卡，改查同PID、旧响应仅一次、
可见反馈、草稿可编辑及切换后的实际下一回合响应。两项分别2.30s/2.44s通过，没有修改生产逻辑。

## 8. 断线与空转专项反查

按用户要求再次审查失败路径，复用上述已构建测试产物，不新增Cargo构建缓存、不改生产代码。
本次401项不同测试通过（忽略项不计），不是在21,797项基线之外新增401项用例：

| 路径 | 本次复测 |
|---|---|
| sampler空响应、重试预算、取消、三协议闲置超时、截断流 | 95通过 |
| sampler真实HTTP actor集成 | 15通过 |
| MCP真实HTTP断流恢复/健康服务器对照 | 2通过；异常SSE在4秒内5次GET，健康服务器3秒1次GET |
| MCP重连、存活检查、超时、取消、限流 | 22通过 |
| Shell断开、取消、授权重试、停滞检测、记忆、会话线程 | 228通过，1项线程panic测试默认ignored |
| 记忆capture recovery / consolidation recovery / UX契约 | 8 / 8 / 11通过 |
| dream取消、目标续跑队列相关 | 6通过 |
| 真实PTY Esc取消/菜单关闭/排队/退出/计划保留 | 6通过，0 ignored |

直接运行Shell测试首次未继承Cargo配置的`RUST_MIN_STACK=16777216`，触发debug测试线程栈溢出；
按仓库既有配置重跑228项全部通过。该首轮不能记为通过，也不能据此认定生产会话栈溢出。

### 8.1 异常事件通道关闭的命令饥饿缺口

`run_loop.rs:489-545`中的ChatState事件接收分支位于`biased` select的命令接收分支之前，
收到`None`后只忽略，不停用已关闭的receiver。此时`recv()`持续立即完成，后续取消/退出命令可能饥饿。
临时探针`/tmp/nofy-closed-channel-probe.rs`复用了相同的Tokio biased选择结构：关闭事件sender，
预先排队一条命令，限制循环100,000次；实测`closed_polls=100000 command_received=false`。
这是选择分支机制的复现，不是完整生产会话故障注入，也没有证明正常网络断线能触发此状态。
当前ChatState actor独占事件sender，会话持有actor handle；普通断网不会关闭该通道。
生产abort profile下actor panic会终止进程，而不是留下该热循环；unwind或未来actor独立关停路径仍有风险。
建议异常关闭时停用分支并进入明确的故障/退出处理，同时补真实会话级关闭通道回归。
`event_rx`和model-switch watch同样没有关闭分支保护，但当前会话保留sender，不将其算为已复现独立故障。

### 8.2 尚缺端到端证明的业务链路

`laziness_integration_tests.rs:663-668`仍明确标注TODO：成功判定stalled后注入nudge的完整链路未接入
mock sampler。现有测试覆盖门控、预算、日志和sampler失败不注入，不等同于“判定停滞→推动→恢复”的E2E。
现有nudge计数有上限，不能仅凭缺测试认定无限推动。后续应补成功推动及预算耗尽时不再续跑的会话级验证。
真实付费provider用户旅程及Windows/Linux环境仍未验证。

### 8.3 不应混同为CPU空转的恢复机制

MCP standing-SSE连接故意保持后台重试，退避上限30秒；断网期间会继续尝试，但不是无间隔忙循环。
真实HTTP故障注入已证明包装后的客户端抑制快速重连风暴。sampler请求重试与doom重采样有独立有限预算，
idle timeout、无终止事件的EOF和取消路径均有终结测试。本次未发现这些已测路径新增断链/无限重试故障。

## 9. 2026-10-09：移除厂商内置模型兜底

用户发现TUI显示“Nofy 4.5”；确认来自编译内置目录，真实ID仍为`grok-4.5`，并非服务端可用性证明。
已移除内置条目和厂商辅助模型默认值。初始化只保留`__unconfigured__`内部标记，不进入可选目录；
模型来源保持为用户配置与配置的服务端目录，不对用户显式配置或服务端返回的模型ID做品牌黑名单。
空目录的CLI显示配置提示，ACP prompt在发起推理前阻断；未指定的摘要/图片描述模型继承当前模型。
更新相关用户指南，旧测试中显式mock的模型ID不做全库替换。

验证：模型初始化库1项、模型管理/provider相关97项通过（两项新增回归包含在97项内）；
二进制最终构建通过。真实CLI分别验证独立provider、空配置与当前工作区有效配置：
独立provider只列出测试模型，空配置不列出初始化标记，当前有效目录保留4个配置模型且无内置Grok项。
已安装到`/Users/mac/.local/bin/nofy`，SHA-256与最终构建一致，version/help启动通过；
安装前二进制备份为`nofy.previous-20261009`。本轮使用无增量/无debug信息构建，缓存约7.2GB。
未跑全库测试、未提交或push；保留原有脏工作区。GitNexus范围复查包含已有改动，仍为CRITICAL，
不将其视作本次清理独立引入的范围，也不将定向通过称为全库通过。
