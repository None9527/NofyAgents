# 沙箱模块化：接口、后端，以及对参考项目的借用

目标：把进程隔离从 host 中解耦成可替换的模块，使每个平台的实现可以独立开发、替换，或改造自参考项目，而不动请求隔离的那一侧代码。已决定：**不采用虚拟机**，每个平台使用原生机制。

## 现状

Linux 的隔离散落在 host 的三处，并与加载器的 `Profile`、`Bootstrap` 结构紧耦合：`loader/process_tree`（命名空间、cgroup、监督器）、`loader/isolation.rs`（Landlock、seccomp、资源上限）、`loader/process_sessions`（PTY、fd 传递、网络代理）。请求隔离的代码直接知道 Landlock 和 cgroup，所以无法换成别的平台机制。

现有 Linux 设计和参考项目的做法是同一个模式，即**启动期包装**：先启动一个辅助程序，由它给自己加上约束，再 `exec` 目标程序。这正是可以抽象的接缝。

## 接口：`nofy-isolation`

新 crate，不含任何平台代码，已落地并有测试。

| 类型 | 作用 |
|---|---|
| `Confinement` | 命令必须被约束到什么：文件范围、网络、能否派生进程、资源上限、随父进程退出。只说"什么"，不说"怎么做" |
| `Capability`、`Level` | 后端能强制的事项，及其程度：`Unavailable < Partial < Enforced` |
| `Probe` | 后端对自己的如实报告，在本机测得，不看平台名 |
| `Backend` | 一个平台的实现：`probe()` 加 `confine(command, policy)` |
| `launch_plan` | 取得受限命令的唯一入口，先过准入再交给后端 |
| `Registry` | 后端注册表，按名字或按当前平台选择，没有静默回退 |
| `Unsupported` | 没有后端的平台使用，只放行"不要求任何保护"的命令 |

由测试固定的四条规则：

1. **失败关闭。** 约束要求的能力后端达不到，就拒绝，错误码 `isolation_unavailable`，信息里写明缺哪一项、需要什么级别、现有什么、后端给的原因；不会去掉该要求后继续运行。
2. **较弱的强制必须显式接受。** `Partial` 只有在声明的 `accept_partial` 里点名该能力才算满足，接受一项不会放过另一项，也永远不会放过 `Unavailable`。
3. **准入绕不过。** `launch_plan` 在调用后端之前检查；`Unsupported` 在 `confine` 里再检查一遍，直接调用也过不去。变异检验确认：去掉 `launch_plan` 里的检查，测试会失败。
4. **依据是探针，不是平台名。** macOS 或 Windows 的后端如果某项没强制，探针就报没有，准入据此拒绝。

## 参考项目里有什么

五个来源的许可证都是宽松的：codex、grok-build、Claude Code 的 `sandbox-runtime` 为 Apache-2.0，deepseek-harness 与 pi 为 MIT。下表的规模是源码行数（Rust，除非另注）。**macOS 与 Windows 的主要实现已经读过源码**，结论在下一节；codex 的 Linux 部分（`linux-sandbox` 1.3 万行）和 grok 的违规归因部分只看了目录，没有读。

| 来源 | 内容 | 规模 | 平台 |
|---|---|---|---|
| codex `sandboxing` | `manager`（命令变换）、Seatbelt 策略生成与四份 `.sbpl`、bwrap、Landlock、违规检测 | 1.2 万行 | macOS、Linux |
| codex `linux-sandbox` | Linux 辅助程序 | 1.3 万行 | Linux（未读） |
| codex `windows-sandbox-rs`、`windows-sandbox-service`、`mxc-sandbox` | 三档 Windows 沙箱，见下 | 3.0 万、0.6 万、0.2 万行 | Windows |
| grok-build `xai-grok-sandbox` | `SandboxBackend::wrap` 接口、Seatbelt 后端与配置生成、策略与授权、违规归因 | 3.1 万行（其中 Seatbelt 后端与配置生成约 1 千行） | 仅 macOS；Linux 经 `nono` 库；**没有 Windows** |
| **Claude Code `sandbox-runtime`**（`anthropic-experimental/sandbox-runtime`） | TypeScript 的 macOS／Linux 部分（1.7 千、3.9 千行）与网络代理；**Windows 助手 `srt-win` 是 Rust，2.9 万行** | 约 3.1 万行 TS + 2.9 万行 Rust | 三个平台；Windows 标为 alpha |
| deepseek-harness `packages/sandbox/*` | TypeScript：策略、`sandbox-windows-acl`（Win32 FFI）、各平台运行器选择与探针 | — | 三个平台；只作模型参照，不能直接链接 |
| pi | 没有操作系统级沙箱；只有 `codemode` 的 JS 虚拟机隔离，性质与我们的 Rhai 相同 | — | — |

## 调研结果（读过源码，2026-11-08）

### macOS：四个项目做法相同，风险低

codex、grok-build、`sandbox-runtime`、deepseek-harness 都用 `/usr/bin/sandbox-exec -p <SBPL 配置> -D K=V -- <命令>`。codex 的配置以 `(deny default)` 起步，基础策略取自 Chromium 的沙箱配置，再按需加入：

- 读、写根目录用 `(subpath (param "ROOT_n"))`，路径作为 `-D` 参数传入，不拼进配置文本。
- 网络：全禁，或只放行回环上代理的端口，域名过滤由本机代理做。
- 受保护子路径、`/dev/ptmx`、sysctl 白名单、mach-lookup 白名单（TLS、用户目录查询）按需加入。

几个反复出现的细节，是移植时最容易漏的：

- `sandbox-exec` 必须用绝对路径，因为 PATH 可能被被约束的命令自己改写。
- 所有根目录要先规范化，因为 Seatbelt 按解析后的路径匹配（`/tmp` 就是 `/private/tmp`）；grok 对根目录本身是符号链接的情况直接拒绝。
- 包装后的命令要把环境和工作目录搬过去，管道、`pre_exec` 钩子和 `kill_on_drop` 不会保留，要在包装之后重新设置；grok 还在 fork 与 exec 之间把继承的 fd 标成 close-on-exec。
- 重命名一个被允许的祖先目录，会把受保护的后代搬出路径限制，所以 codex 在最后加 `file-write-unlink` 拒绝；`fcntl` 的两个命令（`F_MAKECOMPRESSED`、`F_TRANSFEREXTENTS`）能通过只读描述符改文件，要显式拒绝。
- **`sandbox-exec` 是 Apple 已弃用但仍随系统提供的命令**（deepseek 的文档原话是"deprecated-but-shipped"，并说如果 Apple 移除它，这个运行器无法替换也无法探测那个私有策略引擎）。四个项目都依赖它，我没有在它们里找到替代方案。它们的处理是失败关闭：探针发现不可用就拒绝，不放行，我们沿用。

最适合移植的是 grok 的 `seatbelt.rs`（328 行）加 `seatbelt_profile.rs`（648 行），它的 `SandboxBackend::wrap` 语义和我们的 `Backend::confine` 一致："不会回退到不受限的启动，`Err` 就是不运行"。策略文本可参照 codex 的 `.sbpl`。

### Windows：三档，不是一档

三个参考项目殊途同归，都是同样三档，只是每个项目覆盖的档数不同：

| 档 | 机制 | 要提权安装 | 文件 | 网络 | 来源 |
|---|---|---|---|---|---|
| T1 | 写受限令牌（`WRITE_RESTRICTED`）+ 能力 SID 的 ACE + 低完整性标签 + 作业对象（`KILL_ON_JOB_CLOSE`） | 否 | **只限制写和删**；读、进程可见性都不限制 | **不强制**。codex 的 legacy 档只是把环境里的代理变量指向 `127.0.0.1:9` 并放置替身程序，靠程序自觉；deepseek 明说网络不限制 | deepseek `sandbox-windows-acl`（自己报告 `partial`）、codex `windows-sandbox-rs` 的 legacy 档（它自己的代码拒绝在这一档做"限制读"和"禁读覆盖"，要求 elevated） |
| T2 | 专用本地沙箱用户（`CreateProcessWithLogonW` 两跳启动）+ 机器级 WFP 过滤器按该用户 SID 封网（只放行回环代理端口）+ 写受限令牌 + NTFS ACE（读写都能限） + 作业对象 | **是**，一次性 UAC | 读、写都能限制 | 强制 | `srt-win`（2.9 万行，其中核心约 8 千行）、codex `windows-sandbox-rs` 的 elevated 档（该 crate 连同服务共约 3.6 万行，含 legacy 档） |
| T3 | 微软 MXC BaseContainer（`mxc-sdk`），由操作系统施加文件与网络策略 | 否，但需要带该层级的 Windows 版本 | 强制 | 强制 | `sandbox-runtime` 的 mxc 后端（**标为实验性**）、codex 的 `mxc-sandbox`（2 千行；运行时探测是否可用，注释说过渡期的 Windows 版本上符号存在但功能未启用） |

结论：

- **T1 可以不提权，但它本身不满足"禁网""限读"。** 按我们的准入规则，T1 只能让声明"只需要限制写"的模块运行，需要禁网或限制读的模块会被拒绝。这是诚实的结果，不是缺陷。
- **要和 Linux 对等，需要 T2。** T2 依赖 T1 的全部组件（令牌、ACE、作业对象），再加沙箱用户和 WFP，所以 T1 是 T2 的前半部分，不是另一条路。
- **T2 的缺口，来自 `sandbox-runtime` 自己的文档，不是我们的猜测**：Schannel 客户端在受限令牌下拿不到 TLS 凭据（系统 `curl.exe`、PowerShell 的 `Invoke-WebRequest`、.NET `HttpClient`、cargo 的内置 libcurl 都不行）；DNS 经系统解析服务，不受封网约束；线程换用匿名令牌或派生出的令牌后再建套接字，WFP 过滤器认不出；SMB 与 WSL 由系统服务代为连接，不受约束；沙箱账号是每台机器一个，不是每个用户一个；对工作目录的写授权会留在磁盘上，需要卸载时清理。
- **T3 看起来最省事，但目前不能作为基础**：`sandbox-runtime` 标为实验性，并记录了 MSYS2 程序（Git Bash）在里面直接崩溃、临时目录每条命令一份、回环行为只在一个 Windows 11 构建上实测；而且需要带该层级的 Windows 版本。可以作为以后探针发现可用时的另一个后端，不作为第一步。
- grok-build 在 Windows 上没有实现。nono 库（grok 依赖）只覆盖 Landlock 和 Seatbelt。

### 其他可借用的东西

- **探针与"强制程度"作为报告项。** deepseek 的运行器会报告每次执行是 `full` 还是 `partial`，并区分"运行器自己坏了"（固定的 stderr 签名、退出码 127）与"策略拒绝"。这与我们的 `Level` 和 `isolation_unavailable` 是同一个想法，说明接口方向没错；"运行器失败"与"策略拒绝"的区分我们还没有。
- **网络靠本机代理过滤域名。** `sandbox-runtime` 在三个平台都是这个思路：进程只能连回环上的代理端口，域名白名单由代理执行。我们 Linux 上已经有 `namespace_proxy` 和主机代理；macOS 与 Windows 沿用同一个代理即可，不必另写。
- **这三个平台的验证很可能都能放在 GitHub 托管的运行器上。** `sandbox-runtime` 的集成测试在 `macos-15`、`windows-latest`、`windows-11-arm` 上跑，包括一个 "Smoke-test srt-win install lifecycle (Windows)" 步骤，即 T2 的安装、使用、卸载整个周期。这是对方 CI 配置里写的，**我们自己还没有在托管运行器上试过**，所以只算"有先例"，不算已验证。
- 许可证：`sandbox-runtime` 与 grok-build 的 LICENSE 是 Apache-2.0；codex 已在 `THIRD-PARTY-NOTICES` 记录了做法，沿用即可。

### Linux：参考项目怎么做，和我们比

参考项目的 Linux 做法，只读了 codex 的 `linux-sandbox` 与 `sandboxing`、`sandbox-runtime` 的文档和 deepseek 的说明；grok 的 Linux 部分只看了依赖和注释。

| 来源 | 文件视图 | 系统调用 | 网络 |
|---|---|---|---|
| codex | bwrap：`--ro-bind / /`，可写根 `--bind`，受保护子路径再 `--ro-bind`，不可读的 glob 与符号链接、不存在的受保护路径用 `/dev/null` 遮盖；`--unshare-user`、`--unshare-pid`、新 `/proc` | `no_new_privs` + seccomp，**在 bwrap 建好视图之后**才装（bwrap 可能是 setuid）；始终禁 `io_uring` 与 `AF_VSOCK`（WSL2 里 vsock 可经互操作套接字启动 Windows 进程） | 受限时 `--unshare-net`；托管代理模式用 TCP→UDS→TCP 桥，并禁止新建独立的 `AF_UNIX` 套接字 |
| `sandbox-runtime` | bwrap + 绑定挂载；强制保护路径；沙箱内不得再建用户／挂载命名空间 | 预生成的 seccomp BPF；拒绝 `unshare`、`setns`、`mount`、`pivot_root`；`clone3` 返回 `ENOSYS` 让 libc 回退到 `clone` | 去掉网络命名空间，经 Unix 套接字到主机上的代理（`socat` 做桥） |
| deepseek | 运行器链 bwrap → Landlock，逐个探针，取第一个可用的；bwrap 用私有 PID 命名空间与新 `/proc` | — | — |
| grok | 进程级 Landlock（经 `nono`）；源码里有 bwrap 的环境变量标记（`__GROK_INSIDE_BWRAP`），没细读 | 子进程网络用 seccomp 限制 | — |

两个值得注意的点：

- **codex 把 Landlock 降为 legacy，并对"限制文件系统"的策略直接拒绝。** 它的 README 给的理由是：Landlock 隔离不了应用服务端的 Unix 套接字。同时，Landlock 只能"允许"，表达不了"允许 A 但 A 里面的 `.git/hooks` 不行"，这类例外需要挂载遮盖。
- codex、`sandbox-runtime`、deepseek 的 Linux 都靠 **"宿主视图 + 例外"**：整个宿主文件系统只读，再绑定可写根。没有一个像我们的进程树那样用锁定镜像造一个封闭的 guest 根。

我们的 Linux（读过代码，下面的实测在本机 WSL2、内核 6.18 上做的）：

- **单进程助手**（`loader/isolation.rs`）：Landlock ABI3（硬性要求）+ seccomp + rlimit + `PDEATHSIG` + 丢弃能力。
- **进程树**（`loader/process_tree`）：user／mount／net／ipc／pid 命名空间，一次性的 guest 根（`pivot_root`，来自锁定镜像或本地挂载），seccomp 黑名单（含 `mount`、`unshare`、`pivot_root`、`ptrace`、`bpf`、`clone3`、`io_uring` 的编号），cgroup v2 聚合配额，监督器。网络：guest 里只有回环，只允许 `AF_INET`／`AF_INET6` 的 TCP 流，出站经主机上的代理（目标白名单、连接数、字节数、空闲超时）。
- **实测**：我写了一个静态 C 程序，通过真实的单进程助手去调 `socket`、`clone`、`clone3`、`io_uring_setup`，四个都返回 `EPERM`；不经助手的对照组四个都成功（含用 `io_uring` 创建出套接字）。我先从 grep 里怀疑 `clone3` 与 `io_uring` 没拦，因为文本里没有这两个名字，实际是用数字写的；测过之后这个怀疑不成立。进程树模式的过滤器我没有实测。
- **我们更强的**：聚合的 CPU／内存／进程数配额（cgroup），封闭的 guest 根。参考项目的沙箱代码里我没有找到 cgroup 的使用。
- **参考项目有、我们没有的**：
  - **强制保护路径。** 可写根里的 `.git/hooks`、`.git/config`、shell 的 rc 文件、IDE 配置，即使在可写根之内也不允许写，因为之后会在沙箱外被执行。codex、`sandbox-runtime`、grok 都当作强制项。在 host、executors、isolation 里我 grep 不到任何对 `.git` 的处理，目录授权只有读写之分。
  - **违规归因。** 被拒绝时告诉用户或模型是哪个路径、哪一类操作，才能走审批。我们只有 Landlock 的一条执行权限提示。
  - **Landlock 门槛。** ABI3 是硬性要求，内核更旧就失败（失败关闭，所以安全，但部署面窄）；deepseek 的链是先试 bwrap 再 Landlock。

## 整体思考

读完三个平台之后，我认为有几件事需要先于任何一个后端定下来。

1. **跨平台的单位是"宿主视图"，不是"guest 根"。** macOS 的 Seatbelt 和 Windows 的 ACL 都只能表达"真实文件系统上哪些路径可读可写可执行"，造不出私有挂载。`nofy-isolation::Filesystem` 的 `read_only`／`read_write`／`executable` 恰好是这套词汇，`private_mounts` 是 Linux 独有的一项。所以：自备环境（`resource.process_local`）是天然可移植的那一条路径；锁定镜像是 Linux 专有，模块声明里要求 `private_mounts` 的，在其他平台被准入拒绝，这已经是现有行为。
2. **每个后端分成"编译策略"与"施加策略"两半。** 把 `Confinement` 编译成 Seatbelt 配置文本、Windows 的 ACL 计划、bwrap 参数，是纯函数，可以在 Linux 上做黄金文件测试。只有"施加"和对抗性验收需要真实平台。这直接缓解你说的"靠 CI 反复补丁"：策略编译的错误在本机就能抓到。
3. **有一批东西与平台无关，应该放在后端之上，不是复制进每个后端**：强制保护路径、出站代理与目标白名单、环境清洗、探针与准入、违规的统一类型。现在代理在 `process_sessions/network.rs`，用到了固定的描述符号 `FD = 199`，需要确认哪些部分可以抽出来；保护路径则完全没有。
4. **生命周期监督与约束是两件事。** 整树终止、资源上限、随父进程退出，三个平台的机制完全不同（cgroup、作业对象、进程组），而且这是各平台落差最大的地方。它们应该作为独立的一组能力，macOS 上标 `Partial` 并要求声明方显式接受，而不是藏在 `Confinement` 里假装一致。
5. **先不要重构 Linux。** 新词汇先在第 3 层（`EnvironmentGuard`）接缝处引入，Linux 后端只做一层适配，翻译成现有的 `Profile`／`Bootstrap`；验收是现有测试全部不变。等 macOS 后端立住之后，再决定是否让 Linux 路径统一走 `launch_plan`。
6. **让内核说出每个模块在本机能不能跑。** `development.capabilities` 现在除了 Landlock ABI 之外，基本是 `platform_supported: cfg!(linux)` 这样的平台名判断，违背了"依据是探针，不是平台名"。应该改为报告每项能力的探针结果，客户端和模块作者在发布前就能知道缺哪一项。

## 借用原则

- **不接入对方的协议类型。** codex 的 `SandboxManager` 依赖它自己的 `PathUri`、`PermissionProfile`、`ManagedNetworkSandboxContext` 等；直接用等于把它的整套协议拖进来，这和"灵活"相反。
- **只移植平台核心，放到接口后面。** macOS 是 Seatbelt 配置的生成与 `sandbox-exec` 启动；Windows 是受限令牌、作业对象与 ACL 的最小子集。不整块搬运（合计近 9 万行）。
- **每个移植件一个独立 crate**，如 `nofy-isolation-macos`，只实现 `Backend`。参考项目升级或被替换时，影响限制在这个 crate 内。
- **许可证合规。** Apache-2.0 的文件要保留版权与署名、标注改动，并带上原项目 NOTICE 的内容；MIT 要保留版权与许可声明。每个移植 crate 带 `THIRD_PARTY.md`，写明来源、提交、许可证与改动。

## 能力映射（预期，不是承诺）

这是按各平台机制作的判断，**每一格都必须由该平台的探针和对抗性测试证实**；证实不了的就如实标成 `Partial` 或 `Unavailable`。

| 能力 | Linux（现有） | macOS（Seatbelt） | Windows（令牌、作业对象） |
|---|---|---|---|
| 文件范围 | Landlock | 强制 | 强制，但 ACL 授权模型需要验证 |
| 执行白名单 | Landlock Execute | 强制 | 待验证 |
| 私有挂载 | 用户命名空间 | 无 | 无 |
| 全部禁网 | 网络命名空间 | 强制 | 强制 |
| 仅回环 | 网络命名空间 | 强制 | 需要验证 |
| 禁止派生进程 | seccomp | 强制 | 子进程策略 |
| 随父进程退出 | `PDEATHSIG` | 部分，需要看门狗 | 作业对象 |
| 整树终止 | cgroup | 部分，进程组可被脱离 | 作业对象 |
| CPU、内存、进程数上限 | cgroup，依赖委托 | CPU 部分，内存与进程数弱 | 作业对象 |

读过参考项目的源码之后，对这张表的修正（依据见上一节）：

- Windows 一列不是一个答案，要按档拆开。**T1（不提权）只能强制"写范围"、"随父进程退出"和"整树终止"（作业对象）**；文件读范围、禁网、仅回环都是"无"。**T2（提权安装）**才能强制读范围和禁网，代价是沙箱用户、机器级 WFP 过滤器和上面列出的缺口。
- "私有挂载"在 macOS 与 Windows 上都没有对应物，这一格保持"无"，没有变化。
- macOS 一列的"强制"是三个项目共同使用的机制所指向的结论，但**每一项仍然要由 macOS 运行器上的对抗性测试证实**，这张表不能当证据。

Linux 一列也有环境前提：私有挂载和整树隔离依赖非特权用户命名空间，cgroup 上限依赖委托。这两项在 Ubuntu 24.04 默认配置下不可用，这正是 CI 上沙箱验收失败的原因；后端的探针应当把它如实报告出来，而不是让命令在运行中才失败。

## 阶段

| 阶段 | 内容 | 验收 |
|---|---|---|
| S2a | `nofy-isolation` 接口、探针、准入、注册表 | 已完成，15 个测试，含变异检验；已增加保护路径能力、强制保护清单和“运行器失败”的固定签名 |
| S2b | Linux 适配：把 host 现有的 `Profile`、`Bootstrap` 映射到 `Confinement`，通过注册表与 `launch_plan` 启动 | 行为不变：全部现有测试与 `--probe` 输出不变。**已完成一半**：单进程助手的 `Profile`（模型、提示词、作用域、代码四类工作进程与 `process_artifact` 工具）已由 `loader/confine.rs` 映射并经 `launch_plan` 启动；进程树的 `Bootstrap` 尚未 |
| S2c | host 用条件编译隔离 Linux 模块，非 Linux 平台注册 `Unsupported` | host 在 macOS 与 Windows 上编译 |
| S4a | macOS 后端，改造自 codex 与 grok 的 Seatbelt 部分 | macOS CI 上探针与对抗性验收通过 |
| S4b | Windows 后端，改造自 codex 的 Windows 沙箱 | Windows CI 上探针与对抗性验收通过 |

## 不做什么

不用虚拟机；不引入对方的协议类型；不整块搬运参考代码；不在探针之外按平台名推断能力。
