# 统一内核与原生全平台重构实施计划

状态：2026-11-08 开始实施。代码基线 c958379f；开始时工作区干净。
本文是实施计划，不是已完成声明。实际验证另记 docs/verification/unified-kernel-platform-refactor.md。
当前进度：P0 已记录；P1 代码与 Linux 验证完成；P2 共享工厂目录/纯策略/缺后端拒绝切片已完成 Linux 验证。两批非 Linux 原生验收仍待执行；第三批目录声明/路径授权边界完成 Linux 原生验证，Windows 实际授权仍失败关闭。第四批共同内核契约门和第五批独立消费者路径/编码修复已完成本地验证；三端远程 CI 仍未执行。
现有专题细节继续以 cross-platform.md、sandbox-module.md、process-tree-contract.md 等文档为准；不新建平行运行时。

## 1. 目标与不可退让的约束

1. Nofy 自带完整主 Agent。主 Agent、子 Agent、workflow、工具调度共享现有 Rust 执行内核、权限判定、预算账本和持久恢复。
2. Windows、macOS、Linux 是同等目标；能编译、控制面能启动、Agent 能跑、安全能力可交付是四个不同验收层级。
3. 平台差异限于小而真实的适配边界。业务调度不认识 cgroup、Seatbelt、Job Object、盘符或 inode。
4. 不新增平行 agent/workflow/runtime；已有能力优先复用，不为将来可能的需求造空 trait 或重复 crate。
5. 隔离、权限、资源上限、进程树收尾、持久提交不能为“先跑起来”而弱化。缺能力明确拒绝；不得自动接受 partial、关闭限制或用墙钟冒充 CPU。
6. RSI 是同一治理路径中的受控改进，不是自改安全策略的旁路。候选、评估、授权、应用、回滚均有证据和边界。
7. 最终可以独立打包/嵌入内核；桌面外壳、HTTP、CLI、MCP 是接入层，不拥有第二套 Agent 状态。
8. 初始阶段仅本地修改和测试。2026-11-08 后续获准将本次改动提交至公开独立测试分支、创建草稿 PR 触发三端 CI；不改 main、不合并，不安装工具链或修改机器安全设置。

## 2. 已有基础与真实缺口

| 领域 | 已有，可复用 | 仍待完成 / 不能声称 |
|---|---|---|
| 执行内核 | nofy-agent-runtime 的 drive、composition、workflow、governance、durable；CompiledProgram 与 RunSupervisor 共用执行路径，子 Agent 仍走 Agent::invoke | 完整主 Agent 产品装配、跨入口一致验收，不能再写一个循环 |
| 权限、预算、恢复 | 既有 policy、预算 lease/ledger、parking、resume、hook recovery、source/session revisions | 在三个原生平台跑同一套生命周期、故障恢复和并发用例 |
| 装载与声明 | registry、source/locked bundle、module factories、loader、现有 coding preset | 部分工厂仅 Linux 注册；声明里泄漏 cgroup_root；声明可校验和宿主可激活尚未充分分离 |
| 隔离契约 | nofy-isolation 的 Confinement/Probe/admit/launch_plan；loader/confine 是 worker 公共入口 | LinuxLandlock 仍在 host，macOS/Windows 为 Unsupported；四类 worker 未有对应原生安全实现 |
| 进程与资源 | nofy-tty-utils 的进程持有、平台机制；Linux worker CPU 读取；process_tree 管理 | 模型池 CPU 计量写死 Linux；树级限额/PTY/IPC 与 Linux 实现紧耦合 |
| 文件/持久化 | nofy-host-path、nofy-durable-fs、nofy-private-fs、SQLite journal | Windows 打开句柄与 rename、macOS 临时目录链接、包摘要/权限位、大小写碰撞仍需原生回归 |
| 控制面 | host、CLI、client、MCP；已记录三端编译和部分控制面冒烟 | 控制面通过不代表模型/提示/作用域/代码 worker 可用，更不代表完整 Agent 可交付 |
| CI | 三端原生测量、平台焊点棘轮、依赖边界脚本 | 非 Linux workspace 与 kernel-smoke 仍可允许失败；require_capability 的 early return 会被 Cargo 计为 ok，缺 skip 独立统计 |

基线平台棘轮的 linux_gate 51、linux_only_factories 5、linux_only_tests 9 是启发式文本计数，仅用于防回退，不是功能或安全证明。

## 3. 依赖与责任边界

依赖方向：产品装配/CLI/MCP/HTTP → host 装载与接入 → 现有 agent-runtime/模型与工具契约。
平台原语由已有 nofy-tty-utils、nofy-host-path、nofy-durable-fs、nofy-private-fs 承担；隔离策略与准入继续由 nofy-isolation 承担。
Rust 内核不能反向依赖桌面产品、HTTP 服务、具体 shell 或某一 OS 后端。

- runtime：执行图、统一 Agent 生命周期、workflow、权限/预算、checkpoint、resume、组合身份。
- host：把声明绑定到已验证的模型/工具/环境/持久存储，展示发现与拒绝原因；不再把 OS 支持判断散在业务分支里。
- isolation：声明要求、探针事实、能力缺口、准入和启动凭据；不是通用 OS 工具箱。
- process adapter（先在 nofy-tty-utils 扩展）：持有真实子进程、读取 CPU 等 OS 事实、监督与收尾；计量与强制限额明确分开。
- fs adapters：路径类型/身份、仅所有者访问、提交顺序与失败语义；不把宿主路径塞进包内路径。
- product assembly：默认主 Agent 与可选能力声明；独立包与桌面共用同一入口和契约。

先沿已有边界形成真实调用者与测试，再决定是否拆 crate。首批不为“platform”新造大而空的总接口。

## 4. 必须明确建模的真实差异

| 语义 | Linux | macOS | Windows | 统一约束 |
|---|---|---|---|---|
| CPU 计量 | 子进程 CPU clock | proc_pidinfo task user+system CPU | GetProcessTimes user+kernel CPU | 累计 CPU Duration，错误不返回 0，不等同资源强制 |
| 整树持有/结束 | cgroup / pid 生命周期 | 原生进程机制，需证明逃逸与父死收尾 | Job Object，检查 breakaway 和嵌套作业 | 不能以仅 kill 根 PID 代替 TreeKill |
| 文件和执行隔离 | Landlock/namespace | Seatbelt 与受支持原语 | 受限令牌/ACL/AppContainer 等经验证组合 | 真正拒绝未授权访问，不能只清环境变量 |
| 网络/派生限制 | seccomp/network namespace | 原生 profile 能力需逐项验证 | 原生 token/network policy 能力需逐项验证 | 缺失即拒绝；不能按 OS 名宣称 enforced |
| CPU/内存/进程数强制 | rlimit/cgroup | 各自语义与硬限制缺口需验证 | Job limits 等 | 同名指标不意味着同等强制范围 |
| 路径与文件身份 | POSIX、inode | 默认大小写折叠、/var 链接 | 盘符/UNC/reparse point/文件 ID | 宿主路径与包内相对路径分开 |
| 持久化 | fsync+rename+目录 sync | 原生持久化语义 | 写穿透/句柄共享/替换语义 | 成功、未发生、结果未知三态不混淆 |
| 环境镜像 | 当前 ELF/glibc 镜像 | 不可假装能运行 ELF | 不可假装能运行 ELF | 镜像有 target/格式；本地环境走既有资源路径 |

## 5. 分阶段实施与退出条件

### P0：基线、设计与可观察性（本轮）

- 检查干净工作区，读仓库指导；修改符号前用 GitNexus impact/context。
- 记录已有与缺口、模块边界、安全准入、测试矩阵和每阶段交付物。
- 现有文档只补链接，不把规划写成已实现。
- 退出条件：计划入库；改动与验证清单可复现，未验证事项明确。

### P1：模型 worker CPU 计量的纵向去耦（本轮第一批代码）

- 在现有 nofy-tty-utils 增加窄的、真实三端 child_cpu_time 适配函数。
- 输入是仍持有的 tokio Child；Windows 使用该 child 的真实句柄，不根据 PID 重新打开可能复用的进程。
- Linux 保留现有 clock_getcpuclockid 语义；macOS 使用 proc_pidinfo；Windows 使用 GetProcessTimes。
- Worker::expired 委托适配层，保留 540 秒轮换阈值与 601 秒现有隔离 CPU 上限，保留失败退役路径。
- 不修改 launch_plan/worker confinement，不把“计量可用”冒充“隔离可用”。
- 同一个 Rust 测试子进程验证累积、CPU 活动、空闲不按墙钟收费、已回收进程错误；无需 /bin/sh、cmd.exe 或 Python。
- 新增三端必过的窄 CI 作业；现有广域测量不改成虚假的绿。
- 退出条件：WSL Linux 测试/check/clippy 与影响范围检查；非本机端明确标为 CI 待原生验证。交叉编译仅为编译证据。

### P2：目录/声明一致与安全能力准入

- 在全部平台注册相同 descriptor/config schema；纯校验不依赖当前 OS 是否能启动该工厂。
- 分离声明的语义约束与宿主绑定：process_tree_limits 表达树级限额，不要求用户把 cgroup_root 当业务配置。
- 旧 cgroup_root 配置保留显式 Linux 兼容读取；新配置选择后端及宿主绑定，拒绝不兼容配置，不能悄悄忽略。
- 所有激活经统一 capability gate；错误包含 backend、缺失 capability、所需/实际 level、原因。
- 探针不能只看 ABI/OS；启动前实际验证、启动后握手验证有效约束。探测与使用之间的变化必须再次拒绝。
- 退出条件：同一声明三端同校验/同摘要；激活可以不同但拒绝清晰；无后端时无子进程/文件副作用；目录不再随 cfg 隐藏。

### P3：四类内部 worker 原生安全执行

- 模型、prompt、scope、code 继续同一 worker_command/launch_plan 路径，逐类迁移既有 Linux 后端。
- macOS、Windows 各自落实原生隔离，不采用 Linux VM，也不以“不暴露工具”替代文件/网络隔离。
- 必须证明文件范围、网络拒绝、禁止派生、CPU/内存硬限制、父死收尾；任何必需能力未满足时保留 Unsupported/Refusal。
- 每端同一测试配置执行一次真实模型协议桩轮次、取消、超时、worker 回收、坏帧及非法输入。
- 退出条件：四类 worker 同一正向和对抗套件全过；失败信息可诊断；非 Linux Agent 首轮真实运行成功。
- 若单平台缺不可替代的原语，报告精确语义缺口并改设计，不宣称平台 parity。

### P4：工具进程树、交互进程、路径与环境

- 将 cgroup 管理、namespace/bootstrap、PTY/fd 传递留在窄 OS 后端，统一 supervisor 的生命周期/结果。
- 测试孙进程逃逸、并发、父进程被杀、取消/超时、输出背压、内存/CPU/数量限额。
- 目录授权、process_local、绝对路径检查走 host-path；镜像显式 target，旧 Linux 镜像保持可读。
- 路径语法/词法重叠不是文件身份：Windows 短名/长名、junction、UNC/共享别名、大小写和 verbatim 前缀须双向验证。既有或已退休保护根再申请目录权限，以及已有 publication/retained snapshot/local/read_root 后迁移 history 到别名/尚不存在末级，都必须拒绝且不留下新保护元数据。不能 canonicalize 失败就默认为不重叠；未证明身份时拒绝原生授权。
- 包摘要不受宿主 executable bit、mtime、inode 影响；执行需求作为声明。
- 退出条件：三端完整工具调用与树级收尾；相同输入包有相同摘要；平台特有格式被正确拒绝。

### P5：完整主 Agent 与主/子/workflow 收敛

- 复用现有 coding preset 和装配入口，补齐完整主 Agent 默认声明：模型、工具、记忆、权限、预算、恢复与人类决策。
- 主 Agent、子 Agent、workflow 统一 tracing identity、预算继承/扣减、策略收窄、取消传播和持久状态。
- 通过同一入口支持无 UI 嵌入与 HTTP 接入；不新增 host-specific 调度器。
- 退出条件：一个主任务派生子任务并执行 workflow，遇审批暂停、恢复、预算耗尽、取消、重启后不会重复副作用；三端同契约。

### P6：受控 RSI

- 先核对现有 live-source/live-policy/live-budget transitions 与发布机制，重用可持久恢复的变更路径。
- 候选产物、来源/版本、测试证据、差异、授权范围和回滚点必须可追踪。
- 评估工作在现有 Agent/workflow 中运行；不得直接覆盖运行中源码或绕过审批/预算。
- 安全策略不可由候选自行扩大；需要的权限变更仍走独立授权。
- 退出条件：受限候选→隔离评估→授权应用→回归失败回滚闭环，崩溃恢复后仍能判定唯一生效版本；三端回放一致。

### P7：独立内核交付与发布门禁

- 复用现有 independent-consumer 和 dependency boundary 脚本验证可嵌入调用，不打包平行 runtime。
- 三端原生包包含必要 helper、声明资源和版本契约；不携带用户状态/凭据/参考仓库。
- 独立嵌入、CLI、桌面接入使用同一主 Agent 装配与恢复格式。
- 逐项把已经通过的 feature suite 升为必过，不一次性隐藏历史失败或删除测试。
- 退出条件：干净机器安装、完整任务、崩溃恢复、升级/回滚、签名/供应链与卸载验证；关键安全测试无跳过。

## 6. 安全准入与验证层级

准入顺序：声明校验 → 宿主绑定解析 → 测量能力 → 要求/能力对照 → 受控创建 → 约束握手 → 执行 → 回收/记录。
不支持、准备失败、启动失败、执行失败、结果未知必须保持区分。不得自动回退到不隔离进程。

测试层级：
- L0：纯契约/状态机/预算/策略与摘要测试，三端必过。
- L1：原生适配器契约（CPU、路径、锁、持久写、私有目录），三端必过。
- L2：控制面启动、强杀后恢复、客户端与 MCP，三端必过后才能称控制面可用。
- L3：四类 worker 与工具进程的正向/对抗测试；按声明需求缺能力即 fail。
- L4：主 Agent+子 Agent+workflow+审批+预算+恢复+RSI 完整验收。
- L5：独立包、桌面产品、升级、回滚与干净安装。

三端采用同一 feature/test 清单并比较实际 --list 输出；workspace 默认 feature 会被 host/CLI 依赖统一，不能仅看 runtime 的 default=[] 推断漏测。显式纳入 all-features（含 pack），同时验证独立 consumer 的最小依赖。
每个平台记录 executed/passed/failed/skipped，而不是只引用 Cargo 的 ok。
require_capability 的 early return 必须写 NOFY_SKIP_REPORT；CI 收集报告并验证条目与允许缺口清单。
发布门禁的核心安全、恢复与完整 Agent 用例禁止跳过；测量任务的跳过必须可见、带原因且不计入通过数。
交叉编译不能替代 native tests；WSL 属于 Linux 验证，不算 Windows 原生验证。
不需要真实凭据的模型协议桩作为基本回归；真实模型测试凭据独立注入，缺失时明确未运行。

## 7. 兼容与迁移策略

- 优先内部替换，不改现有 wire error code、revision、ledger、checkpoint、包 digest。
- 首批 CPU 计量改造不改持久格式、worker ABI、预算定义、隔离阈值或默认 capability。
- 后续 schema 变化先双读/明确版本再迁移；旧 Linux 绑定仍有精确含义，绝不在其他平台忽略。
- 平台探针与运行事实不进入平台无关的内容摘要；宿主绑定单独记入执行回执。
- 状态跨平台迁移先验证路径/大小写/锁/数据库关闭条件，不能承诺复制目录即自动兼容。
- 每批改造可按文件/模块回滚；不发布半迁移的状态格式；出现结果未知优先恢复/核对，不重复副作用。

## 8. 风险与推进顺序

- 最大风险是把原生机制的名称当同等安全承诺；以负向攻击测试和能力证据为准。
- CPU 计量只是生命周期策略的一环，不能替代 OS CPU limit；相反采样错误必须继续 fail-closed。
- macOS 原生验证环境本机没有；Windows 可原生跑时须独立构建，不能拿 WSL 的绿作证据。
- 既有 CI 的宽容失败和测试跳过会制造完成错觉；新切片先设独立必过门，再逐步收紧广域套件。
- 改动装配/状态身份/恢复范围大，必须在平台原语验证后推进，不做大爆炸重写。
- RSI 与独立打包依赖 P2–P5 的稳定契约，不提前堆新框架。
- 原生安全后端是多批工作；持续按可验证切片推进，只在对应原生证据齐全后声明完成，不把目录/编译通过当作安全执行交付。
