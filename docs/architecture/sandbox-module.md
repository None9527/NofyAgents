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

四个参考项目的许可证都是宽松的：codex 与 grok-build 为 Apache-2.0，deepseek-harness 与 pi 为 MIT。下面的规模是 Rust 源码行数，来自目录统计；**实现细节我还没有读**，下表的"用于"是依据目录和文件名作的判断。

| 来源 | 内容（按目录与文件名） | 规模 | 可能用于 |
|---|---|---|---|
| codex `sandboxing` | `manager`（把命令变换成受限命令）、`seatbelt*`、`bwrap`、`landlock`、`windows*`、违规检测 | 1.2 万行 | 变换模式的参照；macOS Seatbelt 部分 |
| codex `linux-sandbox` | Linux 辅助程序 | 1.3 万行 | 与我们现有 Linux 辅助程序对照 |
| codex `windows-sandbox-rs`、`windows-sandbox-service`、`mxc-sandbox` | Windows 沙箱 | 3.0 万、0.6 万、0.2 万行 | Windows 后端的主要参照 |
| grok-build `xai-grok-sandbox` | Seatbelt 后端与配置生成、策略与授权、违规归因、网络策略 | 3.1 万行 | macOS 后端；违规归因 |
| deepseek-harness `packages/sandbox/*` | TypeScript：`sandbox-policy`、`sandbox-windows-acl`、`sandbox-local` | — | 只作策略模型参照，不能直接链接 |
| pi | 目录里没有发现沙箱模块 | — | — |

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

Linux 一列也有环境前提：私有挂载和整树隔离依赖非特权用户命名空间，cgroup 上限依赖委托。这两项在 Ubuntu 24.04 默认配置下不可用，这正是 CI 上沙箱验收失败的原因；后端的探针应当把它如实报告出来，而不是让命令在运行中才失败。

## 阶段

| 阶段 | 内容 | 验收 |
|---|---|---|
| S2a | `nofy-isolation` 接口、探针、准入、注册表 | 已完成，10 个测试，含变异检验 |
| S2b | Linux 适配：把 host 现有的 `Profile`、`Bootstrap` 映射到 `Confinement`，通过注册表与 `launch_plan` 启动 | 行为不变：全部现有测试与 `--probe` 输出不变 |
| S2c | host 用条件编译隔离 Linux 模块，非 Linux 平台注册 `Unsupported` | host 在 macOS 与 Windows 上编译 |
| S4a | macOS 后端，改造自 codex 与 grok 的 Seatbelt 部分 | macOS CI 上探针与对抗性验收通过 |
| S4b | Windows 后端，改造自 codex 的 Windows 沙箱 | Windows CI 上探针与对抗性验收通过 |

## 不做什么

不用虚拟机；不引入对方的协议类型；不整块搬运参考代码；不在探针之外按平台名推断能力。
