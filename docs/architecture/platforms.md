# 平台矩阵：每个平台上什么成立，凭什么成立

本文只写**有检查支撑**的结论；没有检查的写成"未验证"。计划与阶段见[全平台计划](cross-platform.md)，隔离的模块化见[沙箱模块化](sandbox-module.md)。

## 三条跨平台的不变量

1. **契约一致**：97 项操作、错误码、状态含义在任何平台相同。错误码由契约的 `error_codes` 唯一定义（见[协议](../manual/protocol.md)）。
2. **失败关闭**：做不到的保护不降级。平台强制不了的约束，内核拒绝运行，不悄悄变弱。
3. **"已提交"必须是"已落盘"**：持久化规则在一个 crate 里（`nofy-durable-fs`），见下。

## 能力矩阵

| 能力 | Linux | macOS | Windows |
|---|---|---|---|
| 控制面（项目、草稿、发布、会话、记忆、系统、运行） | 完整测试 | 内核启动，冒烟五步通过（CI） | 由 `kernel control plane` 与 `whole workspace tests` 两个任务测量 |
| 提交后重启仍在 | 冒烟含"强杀后重启" | 同一冒烟（CI） | 同一冒烟（CI） |
| 目录与文件持久化 | 见下 | 同 Unix | 见下 |
| 状态目录仅所有者可访问 | 新建 `0700`；已有的保持原样 | 同 Linux | 新建时带仅当前用户的受保护 ACL；**已有目录必须通过检查，否则拒绝启动**，不去修复 |
| 凭据文件（存放密钥） | 校验 `0600` | 同 Linux | 校验 ACL：文件和所在目录都必须通过检查，否则拒绝读和写；环境变量回退不受影响 |
| 进程隔离（Landlock、seccomp、命名空间、cgroup） | 原生，有真实验收 | 无，拒绝运行需要隔离的模块 | 无，同左 |
| 终端（PTY）、进程会话、网络代理 | 原生 | 无 | 无 |
| 用户自备环境的进程工具（`resource.process_local`） | 有 | Unix 进程组持有，**未在 macOS 验证** | 作业对象持有，**未验证** |
| 缓存清点与回收（运行时镜像、制品） | 有 | 无（需要 Linux 镜像） | 无 |
| 命令行、MCP 桥、客户端、工程引擎 | 有 | 构建与测试通过（CI） | 构建与测试通过（CI） |

"无"的含义是：内核对该能力返回明确的不可用，不会假装成功。需要隔离的执行以后用 `isolation_unavailable` 拒绝，见[沙箱模块化](sandbox-module.md)。

## 持久化的平台规则（`nofy-durable-fs`）

一个存储说"已提交"，意思必须是改动已在盘上。各平台做到这一点的方式不同，这个 crate 是唯一写下它的地方。

- **Unix**：写文件、`fsync` 文件、`rename`、再 `fsync` 目录，因为重命名记在目录项里。macOS 上按标准库的实现，`sync_all` 使用 `F_FULLFSYNC`（没有用断电实验验证）。
- **Windows**：目录不能当普通文件打开（报 `Access is denied`），标准库也没有目录刷盘。所以重命名本身写穿透：`MoveFileExW` 加 `MOVEFILE_WRITE_THROUGH`，返回时重命名已在盘上；NTFS 按顺序记录元数据，此前创建的文件或链接随它一起持久。目录刷盘此时是空操作。
- **顺序语义对三个平台相同**：替换失败意味着什么都没改；只有目录刷盘失败才留下"结果未知"，上报 `result_unconfirmed`。

边界，诚实地写：

- 创建硬链接（准入标记、放置文件）之后没有单独写穿透，靠其后某次写穿透的提交把它一起带到盘上。这个推理依赖 NTFS 的有序日志，**未验证**。
- 这个规则在 Windows 上由 `nofy-durable-fs` 的原生测试和 `kernel-smoke` 的"强杀后重启"检查，没有做过断电实验。
- 项目导出等用户要求的输出文件仍使用普通的重命名，不追求崩溃持久。

## 只有 Linux 有的东西，以及它们怎么表现

这些不是缺陷，是平台能力。内核在其他平台上的表现是**明确拒绝**：

- 进程隔离与整树监督：`loader/process_tree`、`loader/isolation`、`loader/process_sessions`。
- 需要 Landlock 的目录授权与本地环境挂载（这两处还要求以 `/` 开头的绝对路径）。
- 锁定的 glibc 运行时镜像（ELF64）。

## 访问限制（`nofy-private-fs`）

状态目录存放凭据、发布和运行历史，"只有所有者能用"在各平台的做法不同，也只写在一个 crate 里。

- **Unix**：新建目录 `0700`；凭据文件必须 `0600`。已有的状态目录不改动，所以升级前建好的 `0755` 目录仍然能用。
- **Windows**：新建目录时带一份**受保护、可继承、只授予当前用户**的访问列表，之后在里面创建的文件和子目录自动继承。已有路径**只检查、不修复**，因为改访问列表收不回别人已经持有的句柄。通过检查的条件：
  - 所有者是当前用户或 Administrators 组（提权进程创建的对象属于后者）；
  - 访问列表存在（空列表等于放行所有人）；
  - 每一条"允许"项都只指向当前用户、`SYSTEM`、Administrators 或 `CREATOR OWNER`，因为后三者本来就能取得用户的数据；"拒绝"项忽略，不认识的项类型一律不信任；
  - 路径不是联接点或符号链接。
- 通过检查的目录会被保持打开且不共享删除，所以检查之后不能被改名后换成指向别处的联接点。

这套 Windows 做法改造自 openai/codex（Apache-2.0），改动与来源见 `crates/common/nofy-private-fs/THIRD_PARTY.md`。与上游相比放宽了一处：上游只认"仅用户一条"的访问列表，我们认用户自己目录的常见列表，否则位于用户配置目录下、或由提权进程创建的状态目录会被拒绝。

## 文件名与 ID

项目、模块仓库等的 ID 会变成文件名，状态要能在平台间搬运，所以 Windows 放不下的 ID 在**所有平台**都被拒绝：保留设备名（`con`、`prn`、`aux`、`nul`、`com1`–`com9`、`lpt1`–`lpt9`，带不带扩展名都算）和以点结尾的名字。规则在 `safe_id`，有单元测试。

## 验证从哪来

| 结论 | 检查 |
|---|---|
| 整个工作区在三个平台编译 | `whole workspace on macos/windows`（`cargo check --keep-going`） |
| 内核启动并服务控制面、强杀后可恢复 | `kernel control plane on …`（`scripts/smoke-kernel.sh`） |
| 可移植的包通过自己的测试 | `client on macos/windows` |
| 持久化原语的行为 | `nofy-durable-fs` 的测试，同上任务原生运行 |
| 工作区每个测试在 macOS、Windows 上的结果 | `whole workspace tests on …`（测量，一次给出完整失败清单） |
| 错误码、HTTP 状态、退出码与契约一致 | host 映射测试、CLI 退出码测试、`verify-doc-claims.py` |

## 第一次整个工作区测试的测量（运行 `42256433388`，提交 `bd139d1`）

macOS 失败 92 项，Windows 失败 134 项；Linux 上同一套测试全部通过。按原因分，**归因依据**写在每行里，没有依据的写"未归因"，不猜。

| 现象 | macOS | Windows | 归因 |
|---|---:|---:|---|
| `parking::*`、`hook_recovery::*`（外加 `code::` 1 项）：子进程里的内核在 10 秒内没走到对模型桩服务的调用（`Elapsed`） | 38 | 38 | **未归因。** 日志没有捕获子进程输出。假设是这些测试用到只有 Linux 才有的隔离程序（`loader/models/process.rs` 在非 Linux 直接拒绝），但没有证实 |
| 运行历史迁移拒绝目标路径：“destination must use real directory components”、“ledger path escapes” | 约 10 | — | **已查到原因**：检查有意拒绝路径里的符号链接，而 macOS 的临时目录在 `/var`（指向 `/private/var`）下，测试用的是未规范化的路径。是测试夹具问题，不是产品缺陷 |
| SQLite／运行历史迁移：`Access is denied (os error 5)` | — | 约 10 | 未归因。迁移要重命名或替换仍被打开的数据库文件，Windows 不允许；需要读代码确认 |
| `nofy-memory` 的传输、迁移切换、遗忘与保留：`Access is denied` | — | 约 12 | 未归因。都是文件操作被拒；嫌疑是对只读或仍打开的文件做删除、重命名 |
| `canonical memory snapshot rejected` | 4 | 8 | 未归因，两个平台都有 |
| 用 `/bin/sh` 之类 Unix 路径的夹具：“program path must be absolute”、“scope cwd must be absolute…” | — | 17 | 夹具假设 Unix 路径；这两类功能（进程工具、作用域程序）本身是否应在 Windows 上工作，尚未决定 |
| `nofy-cli` 集成测试找不到内核辅助程序 | — | 5 | **已修**：测试拼的路径缺 `.exe` |
| 凭据存储测试：“storing credentials needs an owner-only file permission check…” | — | 4 | **已处理**：这是 ACL 之前的失败关闭，现在由真实检查取代，待下一轮确认 |
| 其他（时间断言、钩子超时、`resources` 断言） | 约 4 | — | 未归因 |

## 还没有结论的

- Windows 上访问限制检查在真实机器上的行为：代码已写，类型检查通过，原生测试由 `client on windows-latest` 运行（新建目录、继承、广泛访问列表被拒且不被修复、联接点被拒、卷根被拒、被保持时不能改名）；在那之前不算验证。
- Windows 的 `OwnedChild` 作业对象在真实工具进程上的行为。
- 大小写不敏感文件系统（macOS 默认、Windows）上，只差大小写的两个项目 ID：创建时靠文件系统自己的存在检查得到冲突，未专门测试；把一份在 Linux 上同时含 `Demo` 与 `demo` 的状态拷到这两个平台会撞名。
- 路径长度、`\\?\` 前缀与 `canonicalize` 在跨平台共享路径上的比较（Linux 专有的那几处不受影响）。
