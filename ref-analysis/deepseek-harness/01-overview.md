# deepseek-harness 项目总览

> DeepSeek Harness(`dsh`)是 DeepSeek 开源的 agent harness:一个"一切皆插件"的编码代理宿主,整个产品(模型适配器、工具注册表、会话日志、agent 循环)都是 Cordis 插件,运行时由 YAML patch 层叠组合而成。本文基于 `0.1.0-rc.5` 源码快照。

---

## 项目身份

| 属性 | 值 | 出处 |
|------|-----|------|
| 产品名 / CLI | DeepSeek Harness / `dsh` | `README.md` |
| npm 包 | `@deepseek-ai/dsh`(`apps/cli`,`bin.dsh = lib/bin.js`) | `apps/cli/package.json` |
| 版本 | `0.1.0-rc.5`(root 与全部包同版本) | `package.json:3` |
| 语言 | TypeScript(ESM,`type: module`;typescript `^6.0.3`) | `package.json:5,176` |
| 许可证 | MIT | `README.md:57-58`、`package.json:4` |
| 包管理 | pnpm `11.7.0`(`packageManager` 锁定,corepack) | `package.json:6` |
| Node 要求 | `^22.19.0 \|\| >=24.0.0`;CI 矩阵 22.19 / 24 / 26 | `package.json:8-10`、`docs/development.md:11-12` |
| 阶段 | developer preview,明示将有破坏性变更 | `README.md:9-11` |

---

## 定位

**与 Claude Code / Codex CLI 同物种**:dsh 是面向项目工作区的 LLM 编码代理宿主——有 plan mode、skills、权限分级(read-only / workspace-write / danger-full-access,`packages/bundle/base/cordis.patch.yml:193-205`)、slash 命令、子代理、hooks;甚至直接兼容竞品生态:

- `packages/hooks/hooks-claude-code`、`packages/hooks/hooks-codex` 原样桥接 Claude Code / Codex 的钩子配置(见 09 篇);
- 子代理可委托给 codex / claude-code 后端(`apps/cli/config/agent-presets/standard/agent.cordis.yml:201-219` 的 `tool-subagent-codex` / `tool-subagent-claude-code` 行)。

**差异在组合机制**:README 的第一卖点是 "everything is a plugin"(`README.md:5-6`)——底层是 vendored 的 Cordis 框架(设计见其论文 *A Programming Paradigm for Spatiotemporal Composability*),没有特权内核,模型适配器、工具注册表、会话日志、agent 循环本身全是插件,全部可从配置替换(`docs/architecture.md:11-15`)。主界面是 Web UI(默认 `http://127.0.0.1:3080`),同时提供 headless、ACP、JSON-RPC 形态(见"运行形态")。

---

## 核心能力(以出厂 base 层为据)

能力清单直接读自 `packages/bundle/base/cordis.patch.yml`(每个 profile 的第一层):

1. **模型接入** — DeepSeek 官方适配器 `llm-deepseek`(默认模型 `deepseek-v4-flash`,见 `agent-default-model` 行)+ 多 provider 孪生 `llm-pi-ai`(休眠挂载,settings 供给 profile 后活)+ `llm-retry` 重试策略;
2. **会话数据面** — append-only `SessionEvent` 日志(`dsh-session`)、JSONL 持久化(`root: !!js dshHomePath('sessions')`)、SQLite 查询(默认 `openAt: never`,全文搜索 opt-in)、投影注册表、LLM 标题生成;
3. **工具全家桶** — bash/pwsh(按平台互斥)、fs 读写与搜索、str-replace-editor、todo、goal、jobs、skill 目录、web 搜索(deepseek provider,60s 超时;fetch 刻意禁用)、workflow、ralph、subagent(spawn/fork 双 provider);
4. **安全与审批** — sandbox-local + sandbox-policy(默认 `workspace-write`,环境变量 `DSH_PERMISSION_MODE` 可调)+ user-approval(`danger-full-access` 时 `never`,否则 `ask`)+ 三档 permission presets;
5. **上下文治理** — compaction-basic 自动压缩、tool-result-pruner(8192 字符阈值,头 4096/尾 1024)、spill 溢出(50000 字节内联上限)、token-meter、checkpoint-policy;
6. **协作面** — plan mode(整段 prompt section)、goals + round driver、user-questions、commands(`/compact`、`/goal`、feedback)、ask-user;
7. **配置与凭据** — settings-file(`$DSH_HOME/settings.yaml` 热重载)、credentials-local(环境 > `.credentials.yaml`);
8. **可观测** — OTLP 会话遥测(默认 DISABLED,`DSH_TELEMETRY_MODE` 显式开启)、匿名用户 id;
9. **扩展面** — hooks 桥(Claude Code/Codex)、MCP 客户端、self-modification extensions(web-app 层挂载)、typert 类型图与 API 网关。

---

## 技术栈

| 维度 | 选型 | 出处 |
|------|------|------|
| monorepo | pnpm workspace,globs:`vendor/*`、`packages/*/*`、`native/landlock-run(+packages/*)`、`apps/*`、`website`、`examples`、`python/sdk-runtime` | `pnpm-workspace.yaml:1-22` |
| 构建 | 两段式:`tsc -b`(Project References,先出 `lib/types` JS)+ `tsdown`(按 `DSH_BUILD_FACE` 分 host/client 两趟),最后 `build:web`(vite) | `package.json:21-25`、`docs/development.md:66-76` |
| TS 工程 | 双聚合根 `tsconfig.host.json` / `tsconfig.client.json`:两侧对 cordis `Context` 接口做同键 declaration-merge,合进一个 `ts.Program` 会冲突,故必须分程序 | `docs/development.md:48-60` |
| 测试 | vitest 多配置:单元 `vitest.config.ts`、`vitest.e2e.config.ts`、`vitest.snapshot.config.ts`(`DSH_SNAPSHOT=record/refresh/replay`)、`vitest.web.config.ts`、`vitest.web.perf.config.ts`、`vitest.web-stress.config.ts`,共享 `vitest.shared.ts` | 根目录 7 个 vitest 文件 |
| Lint/卫生 | oxlint(`run-oxlint.ts`)、knip、jscpd、publint、lefthook git 钩子、`verify-*` 门禁脚本约 40 个 | `package.json:28-127` |
| 文档门禁 | doc-typecheck:docs 代码片段真实编译;`ts type-equiv` 围栏与源码逐字对齐(`scripts/type-equiv.manifest.json`) | `docs/development.md:162-170` |
| schema | vendored schemastery(zod 谱系,`vendor/schemastery`) | `vendor/README.md:16` |
| 依赖策略 | pnpm `strictDepBuilds` 白名单(`allowBuilds`:esbuild/lefthook/node-pty/koffi 放行,其余拒绝);`patchedDependencies` 打补丁 node-pty | `pnpm-workspace.yaml:39-71` |

---

## 仓库布局

```
deepseek-harness/
├── packages/        # 219 个能力包,49 个分组(packages/<group>/<pkg>)
├── apps/            # cli(@deepseek-ai/dsh,dsh bin)、web(dsh-web-frontend,vite dist)
├── vendor/          # 9 个 vendored 框架包(cordis 全家 + cosmokit + schemastery)
├── examples/        # 可运行演示:acp-agent / headless-agent / jsonrpc-agent / mcp-memory / web-cordis / web-schedule
├── scripts/         # 124 个顶层 .ts 门禁/生成脚本(run-gates、gen-*-catalog、verify-*)
├── website/         # VitePress 文档站(docs:dev / docs:build)
├── native/          # landlock-run:Landlock 启动器(独立原生构建)
├── python/          # sdk(Python 客户端)+ sdk-runtime(单可执行构建的部署根)
├── docs/            # 中英双语文档(.md + .zh.md + .i18n.yaml 配对)
└── vitest.*.config.ts × 7、tsconfig.{host,client,base*}.json、tsdown.config.ts
```

### packages/ 分组(49 组,每组一句话;完整映射见 `packages/README.md:13-59`)

| 分组 | 定位 |
|------|------|
| `core/` | 产品 API 主干:session 日志、system-prompt、tools 注册表、agent 服务与默认循环 |
| `api/` | Remote BFF 装配与 Typert RPC 网关(`api/remotes` 是唯一 Host/Client 双 tsconfig 包) |
| `typert/` | 类型图生成、产物加载、运行时注册表(Host→Client 远程投影) |
| `llm/` | LLM 能力族:抽象服务 + deepseek/pi-ai/retry/mock 适配器 |
| `session/` | 会话持久化 seam + JSONL/SQLite 后端、投影、标题、遥测 |
| `session-query/` | 会话检索:语料读取、血缘、SQLite 全文搜索 |
| `subagent/` | 子代理 provider 注册表 + 委托工具(spawn/fork/codex/claude-code/acp) |
| `fs/` | 文件系统能力族:seam、local/sandbox provider、文件工具 |
| `shell/` | Bash 执行 seam:executor、local 实现、模型侧工具 |
| `terminal/` | 持久 PTY 能力族(node-pty) |
| `subprocess/` | 子进程能力族:Service Definition + 本地进程树 provider |
| `sandbox/` | 进程隔离 seam:bwrap / Landlock / Seatbelt 后端 |
| `code-runtime/` | Code Mode 执行:worker-thread provider |
| `lsp/` | LSP 能力族:stdio provider + `lsp` 工具 |
| `compaction/` | 上下文压缩:basic provider + tool-result pruner |
| `context/` | 模型可见请求上下文:AGENTS 指令、时间、tmux 上下文 |
| `interaction/` | 人机协作面:审批、权限 preset、命令、ask-user |
| `goal/`、`plan/`、`todo/`、`schedule/`、`feedback/` | 同会话目标、计划模式、todo 工具、定时跟进、人类反馈 |
| `workflow/`、`jobs/` | 工作流引擎(worker-thread)+ 后台 job 运行时 |
| `web/` | Web 能力族:deepseek 搜索 provider + web 工具 |
| `skill/` | Skills 注册表、文件系统 provider、模型侧目录/加载器 |
| `attachment/`、`spill/`、`storage/` | 附件内容寻址存储、工具结果溢出、非会话存储 |
| `settings/`、`credentials/`、`identity/` | 用户设置 seam、凭据引用 seam、匿名身份 |
| `preset/` | 每会话 agent 组合(agent-presets)与 persona 段 |
| `guard/` | 循环卫生:重复调用提醒 + 工具执行截止 |
| `hooks/` | hook 协议 + Claude Code / Codex 钩子桥 |
| `extensions/` | 自指扩展:动态插件 runner、`tool-cordis`、UI 面板 |
| `mcp/` | 通用 MCP 客户端 |
| `e2b/` | E2B 云沙箱 provider(POC) |
| `bundle/` | 可安装的 `dsh --profile` patch 层:base / web-app / headless |
| `boot/` | app bin 共享启动胶水(app-boot、cmdline) |
| `host/` | Web 宿主半边:API 网关、HTTP server、目录选择器、前端静态服务 |
| `client/` | Web 浏览器半边:shell、wire、对象服务、slots、`ui-*` 插件(约 40 个) |
| `sdk/`、`acp/` | 进程外 JSON-RPC SDK(protocol/client/server);自动化 ACP server |
| `workspace/` | workspace 实体 |
| `examples/` | 演示 bundle(agent-spine + CLI/ACP/JSON-RPC bin) |
| `test-support/` | testkit、invariants、llm-replay、mock-server、loader-smoke |
| `util/` | 零依赖工具:Branded 类型、home-paths、timeout、retention |
| `runtime-diagnostics/` | 运行时不变式诊断 |

分组规则:包名恒为 `@deepseek-ai/dsh-<pkg>`,目录是 `packages/<group>/<pkg>/`;新包进既有组,新组须更新组 README 与总表(`packages/README.md:60`)。依赖纪律:**扩展插件只依赖 Service Definition,不依赖具体 provider**(`packages/README.md:64-66`)。

---

## 规模数据

| 指标 | 数值 | 出处 |
|------|------|------|
| `packages/*/*` 能力包 | **219**(49 个分组) | 实测 `ls packages/*/*/package.json \| wc -l` |
| workspace 成员总数 | 237(含 vendor 9、apps 2、website、examples、python/sdk-runtime、native) | `pnpm-workspace.yaml` globs 实测 |
| vendored 框架包 | 9(cordis、loader、include、group、timer、hmr、logger-console、cosmokit、schemastery);cordis 的 `package.json` 声明 `4.0.1`,vendor/README.md manifest 记的上游版本仍为 `4.0.0-rc.7`(manifest 未随本地版本更新,以 package.json 为准) | `vendor/cordis/package.json:4`、`vendor/README.md:17` |
| GitNexus 代码图 | **46,002 节点 / 100,802 边 / 1,958 clusters / 300 执行流** | `ref-analysis/deepseek-harness/00-graph-atlas.md:4` |
| 图节点构成 | Function 12,746、Const 8,512、Section 6,975、Method 4,996、File 4,433、Interface 2,589、Class 641 | 同上 §1 |
| 顶层门禁脚本 | 124 个 `.ts`(`scripts/`),`run-gates.ts` 编排 CI 泳道 | 实测、`docs/development.md:121-123` |
| 文档 | `docs/` 下 20+ 主题文档 × 中英双语 + cookbook/cordis-tutorial/subsystems 目录 | `docs/` 目录 |

---

## 文档与工程纪律

这套体系本身就是 dsh 的看点之一:

- **双语配对契约**:每份文档是三兄弟文件——`foo.md`、`foo.zh.md`、一致性记录 `foo.i18n.yaml`(存两侧最后一次确认一致时的 git blob hash);PR 不允许只落一种语言,`verify-translation-pairing` 门禁 + `dsh-translation-pairing` Git merge driver 自动合成合并记录(`docs/i18n/README.md:8-30`)。
- **文档不失真的硬手段**:doc-typecheck 把 docs 代码片段真实编译(图里 `docs → *` 约 500 条 IMPORTS 边,成为依赖汇点,`00-graph-atlas.md` §2);`ts type-equiv` 围栏与源码声明逐字对齐并经 TypeScript parser 校验(`docs/development.md:162-170`)。
- **生成式目录**:config/tool/event/persistence/module-graph/composition 全部由 `scripts/gen-*-catalog.ts` 从源码生成、CI 验新鲜(`package.json:103-122`)——如 `apps/cli/composition.md` 的 base 组合图、`docs/event-producer-consumer.md` 的事件矩阵。
- **Agent Notes**:`.agents/notes/{proposed,implemented,rejected,archived}` 按 architecture/feature/process/simplification/testing 分类,是设计决策的存档层,多处源码注释直接引用(如 fork 子代理一次性语义、hook 桥设计)。
- **本地钩子轻量、CI 全量**:lefthook pre-commit 只做配对校验/oxlint/空白错误/vendor manifest 守卫,不跑测试;`pre-push` 跑 `typecheck`;穷尽覆盖归 CI(`docs/development.md:108-123`)。
- **vendor 守卫**:`vendor/*/src` 的改动必须与 `vendor/README.md` manifest 更新同场提交;`verify-vendored-links` 保证 vendored 名只解析到 workspace link。

---

## 运行形态

`dsh` bin 只解析自己的旗标(`--profile` / `--patch` / `--dump-config` / `plugin`),其余参数原样传给被启动树里的 app 插件(`apps/cli/src/args.ts:1-14`)。四种形态:

| 形态 | 入口 | 说明 |
|------|------|------|
| **web** | `dsh web`(= `--profile web`) | bundle `dsh-base` + `dsh-web-app`:HTTP server(默认 `127.0.0.1:3080`,`packages/bundle/web-app/cordis.patch.yml:118-120`)+ 浏览器 SPA;会话按客户端请求创建 |
| **headless** | `dsh --profile headless "<task>"` | bundle `dsh-base` + `dsh-headless`:一次性任务,无 Host/HTTP/浏览器,打印结果即退出(`packages/bundle/headless/cordis.patch.yml:1-4`) |
| **acp** | `packages/acp/acp` + `examples/acp-agent` | 自动化专用 Agent Client Protocol server,JSON-RPC over stdio;stdout 专用协议帧(`packages/acp/acp/README.md`) |
| **jsonrpc** | `packages/sdk/{protocol,client,server}` + `examples/jsonrpc-agent` | 进程外 SDK:调用方提供可执行文件与 `cordis.yml`,stdio JSON-RPC 驱动;Python 客户端在 `python/sdk`(`packages/sdk/README.md`) |

补充演示(`examples/README.md`):`web-cordis`(自指:检查/修改自身插件树)、`web-schedule`(会话内定时器 overlay)、`mcp-memory`(第三方记忆 MCP overlay)。

---

## 快速上手

```sh
# 1) npm 直接跑 Web UI(默认 http://127.0.0.1:3080)
npx @deepseek-ai/dsh web

# 2) 源码运行
git clone https://github.com/deepseek-ai/deepseek-harness.git
cd deepseek-harness && pnpm install && pnpm run build
pnpm dsh web

# 3) headless 一次性任务(需 DEEPSEEK_API_KEY,环境变量或根目录 .env)
pnpm dsh --profile headless "summarize this workspace"

# 4) 自指 cordis 演示 / ACP 演示(同样需要 key)
pnpm run demo:cordis
pnpm run demo:acp

# 5) 查看本机实际启动的插件树(不启动)
dsh --profile web --dump-config

# 6) 给 profile 安装第三方插件(转发 pnpm 到 profile 目录)
dsh plugin --profile web add <package>
```

凭据:`DEEPSEEK_API_KEY` 必填,`DEEPSEEK_BASE_URL` 可选(默认官方 API);真实 API 的 e2e 在无 key 时自动跳过(`docs/development.md:91-99`)。开发者日常:`pnpm run typecheck`(先完成 Host lib 阶段再查 Client)、`pnpm run test`、`pnpm run doc-sync`(文档变更)、`pnpm run check:all`(全量本地门禁,`package.json:26-48`)。

---

## 阅读路线

- 架构与组合机制 → `02-architecture.md`(Cordis 插件模型、profile/bundle/patch、三类事件、扩展点)
- 组合与配置细节 → `09-composition-config.md`(cordis.yml 语义、DSH_HOME、preset、settings/credentials、hooks 桥、self-modification)
- 图数据基线 → `00-graph-atlas.md`(包级零 CALLS 耦合、热点错误类型、主执行流)
