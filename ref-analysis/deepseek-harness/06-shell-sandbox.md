# deepseek-harness 深度解析 06:命令执行栈(shell / subprocess / sandbox / terminal / e2b / fs)

一句话概述:dsh 把"跑一条命令"拆成四层 seam——`ctx.shell`(命令语义与默认化)、`ctx.subprocess`(进程树与输出预算)、`ctx.sandbox`(argv 包裹式文件围栏)、`ctx.sandboxPolicy`(每调用一次的策略解析)——每一层只认自己那层的词汇,换掉任何一层的 provider 都不牵动其余层。

> 路径均相对 `ref/deepseek-harness/`。文档与源码不一致处以源码为准(本篇 §4.3 有一处:landlock-run 是 C 不是 Rust)。

---

## 1. shell seam:Service Definition 与 request/spec 分离

### 1.1 Service Definition(`packages/shell/shell/`)

`shell/src/index.ts` 定义抽象类 `ShellExecutor extends Service`,注册为 `ctx.shell`(cordis 重复注册直接抛错,所以**一个 composition 只挂一个 shell provider**;win32 宿主把 POSIX 行换成 pwsh 行,`cordis.patch.yml` 里用 `disabled: !!js process.platform === 'win32'` 二选一)。抽象方法只有三个:

| 方法 | 契约 |
|---|---|
| `resolve(request: ShellExecRequest): ShellExecSpec` | 填默认、夹上限,产出"全量 spec" |
| `run(spec): Promise<ShellRunResult>` | 前台执行;非零退出/超时/中止都 **resolve**,只有基础设施故障才 reject |
| `start(spec): ShellProcess` | 后台执行,立即返回句柄;无超时;`done` 永不 reject(spawn 失败以 `killed` 落定,错误走 stderr 读路径) |

另有 `get sandboxMode(): SandboxMode | undefined`——执行器向工具层宣告"我是否围栏"的能力事实;`tool-bash` 据此决定要不要广告 `sandbox_permissions` 参数。

设置命名空间 `SHELL_SETTINGS_NAMESPACE = settingsNamespace('shell')` 由 **Definition 包持有**而非任一 provider:注释明说这是刻意的——命名空间以能力命名而非以实现命名,provider 共享一个命名空间且永不重复注册,设置文档跨平台搬运仍然解析。

### 1.2 request/spec 分离:显式默认化模式

`shell/src/types.ts` 是这套模式的范本:

- `ShellExecRequest`——模型/插件面向的形状:`workdir?`、`timeoutMs?`、`stdoutMaxBytes?`、`stdin?`、`env?`、`dshEnv?`、`sandboxPolicy?` 全部可选;
- `ShellExecSpec`——`resolve()` 之后的形状:`workdir`、`timeoutMs`、`stdoutMaxBytes` 变为必填,其余照旧可选(可选即"无此物",不是"还没填")。

契约规定 `run`/`start` **只接受 spec、永不二次默认化**。默认化被集中到一个可审计的函数里:`bash-local` 的 `resolve()` 用 `clampTimeout()` 把请求超时夹在 `config.timeoutMs`(默认 120s)与 `config.maxTimeoutMs`(默认 600s)之间,`workdir` 落回 `config.cwd ?? process.cwd()`。这个模式被下层显式继承——`subprocess/src/types.ts` 的 `SubprocessSpawnSpec` 注释写道:"This seam applies no defaults…the `dsh-shell` request/spec split is the owning template"。

`ShellRunResult` 的原因分类也值得注意:`timedOut` 与 `aborted` **互斥**——一个融合 deadline(`deadline(spec.signal, spec.timeoutMs, 'BASH_TIMEOUT')`)同时承载超时与上游取消,谁先触发谁是唯一原因,避免"超时和取消竞态时两个都为真"。

### 1.3 bash-local provider(`packages/shell/bash-local/`)

`LocalBashExecutor`(`static inject = ['subprocess']`)把命令跑成 `bash -c`,关键机制:

| 机制 | 实现 |
|---|---|
| 模型友好环境 | `ENV_OVERRIDES = { NO_COLOR: '1', TERM: 'dumb', PAGER: 'cat', GIT_PAGER: 'cat' }`,注释点名"与 Codex 硬编码同套;Claude Code 靠 TERM=dumb 达成" |
| 配置 | `static Config`:timeoutMs 120_000 / maxTimeoutMs 600_000 / maxOutputBytes 64_000 / maxSpillBytes 64MiB / graceMs 3_000(注释:对齐 OpenCode 的 3s) |
| 设置热更 | `installSettingsSection()` 把 `source` 换成活文档;每个字段在每条命令时经 getter 现读,`onChange` 为空 |
| 输出 | stdout/stderr 各自 collect 模式:内存保留尾部,超出写 spill 文件(上限 `maxSpillBytes`) |
| 后台读 | `readOutput()` 按 offset 增量,连续读不重复;stderr 以 `[stderr]` 标记段并入同一 delta;spawn 失败备注只投递一次 |
| 子类接缝 | `runArgv`/`startArgv` 为 protected,沙箱执行器只需替换 argv;`onProcessDone()` 是落定钩子 |

env 分层顺序固定在 `spawnSpec()`:`{ ...ENV_OVERRIDES, ...spec.env, ...spec.dshEnv }`——受管 `DSH_*` 快照最后合并,普通 env 永远盖不过它;凭据洗刷由 subprocess 服务独立做。

### 1.4 pwsh-local provider(`packages/shell/pwsh-local/`)

`pwsh-local/src/index.ts` 是 bash-local 的**逐调用镜像**(文件头 `jscpd:ignore-start` 注释明说是刻意复制):命令跑成 `pwsh -NoLogo -NoProfile -NonInteractive -Command <command>`,命令串作为**单个 argv 元素**交给 pwsh 自己解析——没有中间 shell 就没有引号层要转义,Win32 原生路径原样通过。`ENV_OVERRIDES` 去掉 `TERM=dumb`(POSIX 概念)。`resolve.ts` 的 `candidatePwshPaths()` 按"Program Files\PowerShell\7 → PATH"顺序探测,纯函数化以便覆盖率门禁探针共用同一解析定义。

### 1.5 tool consumer(`packages/shell/tool-bash/`)

`tool-bash/src/index.ts` 注册模型工具 `bash`(`inject = ['tools', 'shell', 'systemPrompt', 'shellEnv']`),参数:`command`、`description`(必填,5-10 词,供 UI)、`timeoutMs`、`workdir`、`run_in_background`、`sandbox_permissions`、`justification`。要点:

- **后台调用注册进 `ctx.jobs`**,返回 job id 后改用 job 取消而非工具调用 signal(消费 `job_output`/`job_kill`,见 §5 与 08 篇);
- `resolveWorkdir()` 把相对 workdir 解析到会话 workspace(策略根优先,保证 workdir 与围栏用同一身份);
- 描述文本是行为协议的一部分:非零退出报 `[exit code: N]`;沙箱拒绝报 `[sandbox: file access denied under <mode> mode]` 且"是策略不是 bug,不要换路重试";**唯一例外**是同 turn 内带 `sandbox_permissions`+`justification` 原样重试一次(升级审批,§5.2);
- 输出 schema 是 `oneOf`:background 形状(kind+jobId)与 foreground 形状(exitCode/signal/timedOut/aborted/stdout/stderr/sandbox)。

`tool-pwsh` 是 win32 对应物。另有 `tool-bash-persistent`:基于 PTY seam 的持久 bash 工具,用 `__DSH_PERSISTENT_BASH_PROMPT__` 标记 + 25ms 轮询判定命令落定,输出被 scrollback 截断时加 `LOST_PREFIX_MESSAGE` 前缀。

`shell-env`(`packages/shell/shell-env/`)是独立的 `ctx.shellEnv` 注册表:持有受管 `DSH_*` 变量(内置 `DSH_HOME` 等,插件可注册更多),由 tool-bash/tool-pwsh 以 `dshEnv` 快照注入每次执行——模型在命令里能读到当前 harness 事实,而环境里**环境性的** `DSH_*` 会被 subprocess 洗掉,杜绝陈旧值继承。

---

## 2. subprocess seam:进程树管理

### 2.1 Service Definition(`packages/subprocess/subprocess/`)

`SubprocessRuntime` 注册为 `ctx.subprocess`。`SubprocessSpawnSpec` 全显式无默认:`argv`(argv[0] 是程序,**永不经过 shell 解释**)、`cwd`、`stdio`(每流独立:stdin 为 `'ignore' | 'pipe' | { data }`;stdout/stderr 为 `'pipe' | 'inherit' | SubprocessCollect{ maxBytes, spill?{ maxBytes } }`)、`graceMs`、`signal`、`env`。

`SubprocessOutcome` 只有 `exitCode`/`signal`——**刻意不带**超时/取消分类与输出:原因分类归持有 signal 的调用方(bash 执行器),输出在落定后仍可经 `handle.collected` 读取。

凭据防线 `scrubbedParentEnv()`(`subprocess/src/index.ts`):

```
SENSITIVE_ENV_PATTERN = /KEY|PASSWORD|SECRET|TOKEN/i
```

匹配该模式或大写以 `DSH_` 开头的环境变量一律不进子进程;显式 `env` 条目在洗刷**之后**合并(字符串是刻意 opt-in,`undefined` 是墓碑删除)。该函数导出为普通函数,让 node-pty 后端、SDK 传输等无法走服务的 spawner 共享同一定义。

### 2.2 subprocess-local provider(`packages/subprocess/subprocess-local/`)

`LocalSubprocessRuntime` 的进程树语义(`spawn.ts`):

| 机制 | 实现 |
|---|---|
| 树根 | POSIX `detached: true`,子进程自成进程组;win32 用 `taskkill /PID <pid> /T /F` |
| 树级信号 | `process.kill(-pid, sig)` 发给整个组;不抛异常(投递与退出竞态) |
| 升级链 | SIGTERM → `graceMs` 定时 → SIGKILL;kill 前重探树存活(组内只剩僵尸时 `kill(0)` 仍应答,需 `/proc` 检查器 `linuxProcessGroupHasLiveMembers` 甄别) |
| 常规拆除 | `disposeManagedProcesses()`:terminate 后**等整棵树退出**(`waitForExit`),捕获 TERM 的后代也不能比 fiber 活得久;失败升级同步终杀 |
| 宿主退出 | `process.prependListener('exit')` 同步终杀所有仍持有的树与 PTY——Node 退出阶段唯一可用的手段 |

无配置是本 seam 的立场:所有预算来自 spec,部署差异留在调用方配置(bash 执行器的、LSP host 的……)。`resolveExecutable()` 提供 PATH 解析(拒绝相对路径,只认绝对或裸名)。

---

## 3. terminal seam:持久 PTY 会话

三层结构(`packages/terminal/`):

- **Definition** `terminal/src/index.ts`:`ctx.terminals` 的 `TerminalSessionService` 是**owner 作用域的 PTY 注册表**——只管 id 铸造、发布、授权与等待清理;机制归后端。错误码封闭:`DUPLICATE_BACKEND`/`DUPLICATE_NAME`/`FOREIGN_SESSION`/`NO_SESSION`/`OWNER_NOT_LIVE`/`SEND_ACTIVE` 等。
- **Backend** `terminal-bash/src/index.ts`:`inject = ['terminals', 'sandboxPolicy', 'subprocess']`,基于 subprocess 的 node-pty 原语。子进程环境注入 `PS1=CONTROLLED_PROMPT`、`PROMPT_COMMAND` 发 OSC 133;D 退出码标记(靠提示符协议切分命令边界)、`DSH_SHELL`/`DSH_SESSION_ID`/`DSH_PTY_SESSION_ID`。**沙箱模式栅栏**:监听 `session/event` 的 `sandbox/mode` 事件,若该 agent 还有活跃 PTY 会话,直接抛错拒绝换模式——持久会话的模式必须在 spawn 时固定。
- **Consumer** `tool-terminal/src/index.ts`:六个模型工具 `terminal_open` / `terminal_send` / `terminal_read` / `terminal_signal` / `terminal_close` / `terminal_list`;单次结果上限 `DEFAULT_MAX_RESULT_BYTES = 256KiB`;后台 send 注册为 `ctx.jobs` 的 `pty-send` 种类(通过 `declare module` 扩展 `JobKindMap`)。

---

## 4. sandbox seam:围栏后端与 landlock-run

### 4.1 Service Definition(`packages/sandbox/sandbox/`)

这是**同世界进程围栏** seam(共享宿主内核与文件系统;容器/microVM 属于"换掉整个执行世界",走 e2b 那条路)。核心词汇:

```
SandboxMode = 'read-only' | 'workspace-write' | 'danger-full-access'
```

`SandboxProvider.confine(policy)` 返回 `ConfinedArgv`:`argv`(runner+profile+分隔符+原 argv)、`enforcement`(`full`/`partial`)、`denialSignatures`(**该后端自己的拒绝方言**:bwrap 只读绑定产生 EROFS 文本、Landlock 产生 EACCES、Seatbelt 产生 EPERM——消费者只匹配本后端方言,不做跨后端并集)、`runnerFailureRules`(结构化的"runner 自己挂了"证据:exit 码门 + 致命签名 + 信息性行排除)。runner 失败与命令被拒是两回事:前者命令从未运行。

`roots.ts` 的 `writableRoots()` 是三方共享的规范允许表:`read-only` 空;`workspace-write` = workspace 根 + `/tmp` + `os.tmpdir()`(per-user 平台 temp,经 `canonicalPath` 规范化去重——darwin 上 `/tmp` 即 `/private/tmp`,按字面授权会匹配不到)。Seatbelt profile 与 fs 进程内围栏都从这一个函数取根,**保证 bash 与 fs 永不漂移**。围栏不可用时 `SandboxUnavailableError` **fail-closed**(错误消息直接建议 danger-full-access 是显式选择)。

### 4.2 sandbox-local provider 与后端链(`packages/sandbox/sandbox-local/`)

平台链:**Linux bwrap → Landlock;macOS Seatbelt(`sandbox-exec`);Windows windows-acl 受限令牌**。候选者先做**功能性探针**(真跑一次最小 profile,如 bwrap `--ro-bind / / … -- true`),结果缓存;缺失或不可用一律 fail-closed,绝不退回原 argv。`profiles.ts` 三个 profile 构造器把同一 `SandboxPolicy` 翻译成三种方言(bwrap 挂载参数 / landlock-run 授权参数 / SBPL 文本)。

Windows 链(`sandbox-windows-acl/`)额外持有写授权:workspace SID 按规范路径派生、ACE 每 workspace 物化一次并跨会话存续(O(1) 复用);每个活会话拿**随机**私有 temp 目录与临时 SID,dispose 时回收。自报 `partial`(WRITE_RESTRICTED 令牌需保留 Everyone、NTFS 硬链接跨路径别名同一文件对象)。

### 4.3 landlock-run(native/)——注意:是 C 不是 Rust

任务描述称 Rust addon,**源码实为纯 C11**(`native/landlock-run/packages/entry/src/main.c`,298 行,静态链接 musl,"no libraries beyond libc")。它是"自我限制然后 exec"的启动器:

```
landlock-run [--ro <path>]... [--rw <path>]... -- <argv>...
landlock-run --probe
```

`main.c` 直接走裸 syscall(`__NR_landlock_create_ruleset` 444 / `add_rule` 445 / `restrict_self` 446):先 `prctl(PR_SET_NO_NEW_PRIVS)`,装 ruleset 后 `execvp`——ruleset 跨 `execve` 继承,**整棵进程树生来就在围栏里**,而调用方进程不受影响。fail-closed:ruleset 建不成或内核不执行,退出 **125** 且不 exec(`LAUNCHER_FAILURE_EXIT = 125`);旧 ABI 的 best-effort 以 `partial` 上报。`--probe` 构建最大 ruleset 报告 `full`/`partial`/`unusable`。

TS 入口包(`entry/src/index.ts`)只暴露 `launcherPath()` / `grantArgs()` / `probe()`;二进制按 os/cpu 以 optionalDependencies 分发(`-linux-x64`/`-linux-arm64`,纯 prebuilt,**刻意没有安装期编译回退**)。CLI 契约钉在 `docs/cli-contract.md`,argv 文法、退出码、报告行是二进制边界。

### 4.4 沙箱化 bash 执行器(`packages/shell/bash-sandbox/`)

`SandboxBashExecutor extends LocalBashExecutor`:继承全部本地机制,只加围栏。`resolve()` 给缺省请求盖上 `ctx.sandboxPolicy.resolve()` 的章;`run()` 把 `bash -c` argv 交给 `ctx.sandbox.confine()` 包裹,落定后分类三件事:runner spawn 失败(`isRunnerSpawnFailure` 按 `error.path`/`error.syscall` 规则识别)→ 前台抛 `SANDBOX_UNAVAILABLE`;runner 启动后拒绝 profile → `runnerFailed`;命令被拒 → 按 `denialSignatures` 匹配 `denied`。结果盖上 `ShellSandboxInfo{ mode, denied, enforcement, runnerFailed }`。`pwsh-sandbox` 是 win32 对应物。

---

## 5. 权限策略:DSH_PERMISSION_MODE 与 approval 事件

### 5.1 策略之家(`packages/sandbox/sandbox-policy/`)

`ctx.sandboxPolicy`(`SandboxPolicyService`)是**唯一的策略解析点**,bash、fs、terminal 三个执行族读同一份:

- 配置默认 `mode: 'read-only'`(schema 层的 fail-safe 默认;想要可写 workspace 的部署显式 opt-in);
- `resolve({ session, mode })` 优先级:**显式批准的 mode > 会话最后一条 `sandbox/mode` 事件 > 部署默认**;`workspaceRoot` 取会话不可变 cwd(无会话调用落回配置根);
- 向系统提示注入 `sandbox:policy` 上下文段(order 110),按当前模式渲染三种文案——策略进模型视野靠每请求的 runtime-context 快照而非改写稳定提示词。

**`DSH_PERMISSION_MODE` 不在 TS 源码里被读,而在组合层消费**:`packages/bundle/base/cordis.patch.yml`:

```yaml
- id: sandbox-policy
  config:
    mode: !!js process.env.DSH_PERMISSION_MODE ?? 'workspace-write'
- id: approval
  config:
    policy: !!js "(process.env.DSH_PERMISSION_MODE ?? 'workspace-write') === 'danger-full-access' ? 'never' : 'ask'"
- id: permission   # dsh-permission-presets:三预设 {sandbox, approval} 的捆绑
```

即:环境变量同时决定沙箱默认模式与审批策略,danger-full-access 自动配 `never`(无人值守)。`examples/acp-agent/cordis.yml` 同构,另加 `DSH_SNAPSHOT` 时落回 danger-full-access(快照场景要 runner 无关)。`apps/cli/reference/README.md` 的表述与之一致("新会话默认 workspace-write;DSH_PERMISSION_MODE 更改进程后备值")。

### 5.2 升级审批流(`sandbox/src/escalation.ts` + `interaction/user-approval/`)

`approveEscalation()` 是两个执行族共享的 fail-closed 序列:**严格变宽检查**(对本次调用的 effective mode,`WIDER_MODES` 表;非变宽永不扰人)→ 审批通道存在性 → agent 存在性 → `approver.request()` → 结果映射(四种 outcome 里只有 `allowed-once` 返回授予的 mode,`rejected`/`cancelled`/`unavailable` 各抛不同文案的错误,工具注册表把 throw 变成 isError 结果,此时什么都没跑)。

`ctx.approval`(`packages/interaction/user-approval/src/index.ts`)是审批 seam:`approval/request` waterfall 事件由组合的 answerer 认领,无人应答落 fail-closed `unavailable`;`ApprovalPolicy = 'ask' | 'never'`,`never` 时每个 ask 确定性 `rejected` 并给模型一句固定文案("不要请求沙箱升级")。会话事件 `approval/asked` / `approval/decided`(同 id 配对,仅审计日志)/ `approval/policy`(最后一条即会话覆盖,`source: 'delegation'` 标记播种给子代理的覆盖)。

---

## 6. fs capability 与策略事件

### 6.1 fs seam(`packages/fs/fs/`)

`FileSystem extends Service` 注册为 `ctx.fs`:后端持有稳定目标身份(`resolve()` 可做 I/O——远程后端需要一次往返把路径映射成稳定 id)、文本读取、解码、二进制拒绝、原子变更;`editText` 留在后端,让版本检查、字面匹配、重写共享一个临界区。**三个策略事件**是 fs 的扩展点:

| 事件 | 模式 | 用途 |
|---|---|---|
| `fs/write-intent` | waterfall(单槽) | 下一个 `writeText` 的守卫决定;`next()` 放行裸写,第一个返回 intent 的监听者独占 |
| `fs/edit-intent` | waterfall(单槽) | 下一个 `editText` 的版本守卫 |
| `fs/observed` | emit | 记录权威的存在/缺席观察;监听者必须同步 |

provider 谱系:`fs-local`(本地机制全集)→ `fs-sandbox`(`SandboxedFileSystem extends LocalFileSystem`,只加两个变更口上的**每调用策略围栏**;读直通)→ `fs-e2b`(远程)。`fs-sandbox` 的自我定位很诚实:这是**受信代码对模型控制路径的策略检查,不是内核边界**——canonicalize-then-contain 对该表面已完备,不可信代码的内核级隔离是 `ctx.shell` 的活;残余 TOCTOU(祖先符号链接在复查与 syscall 间被换)被显式接受。拒绝抛结构化 `FS_SANDBOX_DENIED`,**无需文本推断**(进程内围栏知道自己拒了什么,不像 bash 要读内核 stderr)。

### 6.2 观察策略(`packages/fs/fs-observation-policy/`)

`fs-observation-policy` 是**纯事件插件,不注册服务**:WeakMap(owner=会话, key=`targetKey`)记录观察;单槽 intent 监听器从该状态派生守卫(写前须读过、版本须新鲜、no-clobber);provider 在原子临界区里执行检查。**不挂这个插件,工具保留裸 provider 的无条件变更行为**——策略与机制彻底分离。

### 6.3 消费工具

`tool-fs`:`read` / `write` / `edit` / `read_image`(read-image 经 `ctx.attachments` 持久化);`tool-fs-search`:`glob` / `grep`;`tool-str-replace-editor`:`str_replace_editor`。沙箱拒绝与升级重试的模型文案在工具层,与 bash 族完全同构。

---

## 7. e2b 远程沙箱 POC(`packages/e2b/`)

三个包把**一个执行世界**整体搬进 E2B Linux 沙箱:

| 包 | ctx 键 | 角色 |
|---|---|---|
| `e2b` | `ctx.e2b` | 沙箱生命周期:创建、准备目录、暴露 SDK 句柄、超时/拆除时删除 |
| `fs-e2b` | `ctx.fs` | 在 E2B Filesystem API 上实现 fs seam |
| `subprocess-e2b` | `ctx.subprocess` | 在 E2B Commands/PTY API 上实现可执行文件查找、进程组、stdio、远程 spill、终端 |

POC 的论证点在于**消费者零分叉**:`dsh-bash-local`、`dsh-terminal-bash`、`dsh-lsp-stdio` 把一切执行世界操作委托给 `ctx.fs`/`ctx.subprocess`,挂上两个 E2B 适配器,它们的可变工作就整体落进同一个沙箱。README 同时钉死边界:harness 进程、Cordis 对象、模型调用、agent/session 状态、持久化、skills **不迁移**。这正是 `docs/architecture.md` "换 provider 即换整个产品"的最小实证。

---

## 8. 小结:这一栈的设计形状

1. **默认化是显式步骤,不是隐藏行为**:request/spec 分离从 shell 一路贯穿到 subprocess(后者干脆零默认);
2. **原因分类归持有 signal 的人**:subprocess 只报退出事实,bash 执行器判 timedOut/aborted,工具层渲染 `[exit code: N]`;
3. **围栏有两种物理**:进程内策略围栏(fs-sandbox,受信代码查模型路径)与内核围栏(bash-sandbox 包 argv),词汇(`SandboxMode`/`writableRoots`)共享,强度各自诚实声明;
4. **fail-closed 贯穿**:runner 不可用不退回裸 argv、审批无人应答即拒、升级非严格变宽不扰人;
5. **策略只有一个家**:`ctx.sandboxPolicy` 每调用解析一次,三个执行族读同一份,会话模式走事件日志可回放。
