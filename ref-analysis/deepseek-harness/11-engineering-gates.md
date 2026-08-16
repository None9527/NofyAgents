# deepseek-harness 工程门禁深度解析

一句话概述:dsh 用"逐文件 100% 覆盖率 + 无 key 快照回放 + 约 40 个 verify-*/gen-* 脚本 + 双语文档配对"把质量门禁做成了仓库的主要基础设施——scripts/ 自调用 1,692 次全仓第二,仅次于 client;门禁不是这个项目的配套,它本身就是这个项目最大的"产品"之一。

> 路径均相对 `ref/deepseek-harness/`。根 package.json 共 **123 个 script**;`scripts/` 下不含 spec 的 `verify-*.ts` 有 **26 个**、`gen-*.ts` 有 **11 个**;每个 gen-* 都有同名 `--check` 形态的 verify-*。

---

## 一、测试分层:四个 tier,一条"真实优先"主线

`docs/testing.md`(49 行,本身被 doc-budgets 限制在 1,150 词内)定义四个层级:

| Tier | 命令 | 内容 |
|---|---|---|
| Unit | `pnpm run test` | vitest 跑包/例子的 `tests/**` 加 `scripts/**/*.spec.ts`;测试与被测代码同域 |
| Coverage | `pnpm run test:coverage` | 门禁运行,`packages/*/*/src` 逐文件 100% |
| Real-API e2e | `pnpm run test:e2e` | 带 key 打真实 provider;每套件无 key 自跳过 |
| Snapshot | `pnpm run test:snapshot` / `test:web` | 无 key 期望输出:传输契约、呈现、持久化日志 |

单元层的范围本身就是声明:vitest include 覆盖 `packages/*/*/tests/**/*.spec.{ts,tsx}`、`apps/*/tests`、`examples/*/tests` 与 `scripts/**/*.spec.ts`——包、应用、例子、门禁脚本四类代码的测试住在各自被测代码旁边,没有中央 tests/ 目录;`.tsx` 的 client 组件 spec 用逐文件 `@vitest-environment jsdom` pragma 切环境,共享配置保持 node 环境。

贯穿四层的三条规则:

**1. 真实实现优先于 mock。** 只 mock 昂贵或不确定的边界(LLM 适配器、网络、时钟),下游全部用真的:"手搓替身证明桥能搬字节,不证明发布工具按断言工作"。
桥工具调用测试用脚本化 mock 模型 + 真实工具与执行器:`makeBridgeHarness({ withBash: true })` 插上真的 `dsh-bash-local` 和 `dsh-tool-bash` 再跑 `echo`。

**2. 验证世界,不验证自述。** e2e 断言在外部重跑命令或重读文件;"对 agent 自己输出做关键词探测会让作弊的 agent 通过"。
断言未触碰的文件字节相同。
e2e 测试自己拥有资源:测试里创建 harness,`afterEach` 里 dispose(失败/重试/超时也执行);共享 fixture 放纯 `tests/harness.ts`,绝不放另一个 `*.e2e.ts`(import spec 会重复注册 describe,真实 API 调用翻倍)。

**3. 每个注册表都有 HMR 安全测试**(dispose 贡献 fiber、断言清理);契约回归有永久测试(`packages/core/agent-loop/tests/contract-regressions.spec.ts`)。"产品可见插件要求非单元的真实组合测试":手搓 `ctx.plugin(...)` 不够,必须 boot 测试用 cordis.yml 走 Loader,断言模型可见请求/日志、持久状态或用户可见输出。

测试基建本身是一等包族(`packages/test-support/`):acp-snapshot(ACP 快照套件工厂)、agent-loop-testkit、invariants(运行时契约断言)、loader-smoke、llm-mock-server(确定性 OpenAI-compatible 故障服务器)、llm-replay(回放 faux provider)。"包获得产品契约与产品消费者时搬出 test-support/"。

四个 tier 之外还有本地检查阶梯(`packages/client/AGENTS.md` 定义):每次 GUI 代码变更跑 `pnpm run test:gui`(packages/client + packages/host 的套件,秒级,无浏览器无服务器),"像 typecheck 一样自由地跑";可能改变组装后浏览器输出的变更再加 `DSH_SNAPSHOT=replay pnpm run test:web`;PR 前用 dsh-pre-push-checks 技能按出站 diff 选最小检查集——"没有仓库级 pre-push 聚合"。Web 侧另有两条压力/性能 lane(`test:web:stress`、`test:web:perf`,后者强制 replay 模式),与功能快照分离。阶梯的设计意图明写:跑覆盖变更面的最窄一级,只在变更面要求时升级。

## 二、test:coverage——逐文件 100% 是怎么做的

`vitest.config.ts` 的 coverage 块是全部机制的中心:

```text
thresholds: { perFile: true, statements: 100, branches: 100, functions: 100, lines: 100 }
include:    packages/*/*/src/**/*.{ts,tsx}
provider:   v8
```

四个设计点:

**1. per-file 而非聚合。** 注释写得直白:"Per-file so a well-covered big file can't subsidize a bare one"(大文件的高覆盖率不能补贴裸文件)。
`docs/testing.md` 给出哲学:"未覆盖的行常常是门禁正确标记出来的死代码,该删,而不是该补一个测试";同时明确"行覆盖是必要非充分——它证明行跑过,不证明功能按发布形态工作"。
根 AGENTS.md 的口径是 "100% or it doesn't merge(excessive tests are welcome)"。

**2. 失败报告做到行级。** 内置 threshold ERROR 只报文件名,仓库自带 CJS 报告器 `scripts/coverage-uncovered-locations.cjs`,为每个未覆盖语句/分支路径/函数打印精确 `path:line:col`(istanbul-reports 用 require() 加载自定义报告器,所以必须是 CJS)。

**3. 豁免是显式、可审计、带方向的。** exclude 列表约 70 条,每条带理由注释,分四类:

| 类别 | 例子 | 机制 |
|---|---|---|
| 平台条件 | Windows-only 的 `sandbox-windows-acl`、需要 bash 的包 | 按 `process.platform` 动态生成;显式列表而非 glob,让 Service Definition 包(如 `packages/shell/shell`)继续在各平台跑 |
| 环境探测 | `pwsh-local`:无 pwsh 主机豁免 | 配置加载时真跑一次 `spawnSync(pwsh, '$true')` 探测——豁免与套件自跳过精确同条件,"更窄的探测可能在实际运行的主机上错误豁免" |
| GUI 债务 | `ui-conversation/src/client/*`、`web-react/src/*`、`web/src/*` 等 | 逐文件列名 + `TODO(gui): cover and remove as the client test lane matures`,债务是清单不是口号 |
| 结构豁免 | `types.ts`/`bin.ts`/`worker.ts`、typert generator、self-modification | 类型文件无可执行代码;bin/worker 被真实子进程测试覆盖;generator 的逐文件覆盖会让全仓编译器分析进 v8 instrumentation(覆盖率通道最长尾巴) |

**4. 重套件去 instrumentation 化。** `scripts/coverage-exempt.ts` 维护 `coverageExemptHeavySuites`:instrumented 覆盖率门设 `DSH_COVERAGE_EXEMPT_HEAVY=1` 把这些套件排除,聚合门再以普通模式并行跑它们。
成员规则写死在注释里:套件执行的每个覆盖率计量文件必须已被其他套件完全覆盖,移除它不改变任何 threshold 结果——省的是 v8 插桩税,不是正确性信号。
env 值设了但不是 '1' 直接抛错:"是配置错误,不是静默 no-op"。

测试池本身也分层:两个 project(`thread-safe` / `process-bound`),都用 `forks` 池(Node 24 的 CJS lexer 在 worker thread 里 abort 过,fork 绕开共享线程路径),process-bound 清单(8 个套件:jsonl 持久化、subprocess spawn、time-context、app-boot…)单独列管做"库存控制"。
每个 vitest 配置都挂 `scripts/test-invariants.ts` setup(运行时契约断言),`vitest.shared.ts` 提供标准装饰器预转换插件与 `--no-webstorage` execArgv(防 Node 的 Web Storage 影子掉 jsdom storage)。

## 三、test:snapshot——无 key 回放与 llm-replay faux provider

`vitest.snapshot.config.ts` 的注释是全部策略:`DSH_SNAPSHOT=replay`(默认,无 key)从录制的模型响应 boot 真实子进程路径,对组装请求、规范化协议/转录输出、持久化日志期望值做 diff;`record` 调真实 API 并更新 fixture(唯一读 `.env` 的模式);`refresh` 重放已提交脚本并更新期望输出。
replay 并行(每场景拥有自己的可变状态,并发上限 env 可调,设 1 恢复全串行),record/refresh 串行(record 花真实配额,refresh 从磁盘 fixture 收割易变值,并发写会毁掉 goldens)。

回放引擎是 `packages/test-support/llm-replay/`(faux provider),机制值得细看:

- **fixture 就是持久化会话日志**(`<scenario>/session.jsonl`):`assistant/chunk` 事件按 `(turn, step)` 分组重建每次 agent-loop `stream()` 调用的 chunk 序列;`compaction/summary` 带 `llmStreamCall: true` 时在该事件位置重建规范化成功流。
录制因此就是"跑一次真实 agent 并收割 .jsonl",插件本身不录制;
- **不可重建的失败用 sidecar 补**:纯 throw(HTTP 401 这种日志里只有 `turn/end {error}` 没有 chunk)与 cancel/hang(是时序不是内容)用 `replay.override.json` 表达——整体替换派生脚本,或按 0-based 调用索引 `patches`;`hang` 条目可写 `readyFile` 标记,让外部驱动在前缀 chunk 到达后确定性地取消;
- **动态占位符**:脚本字符串可嵌 `{{fromRequest:<regex>}}`,流式时刻对活请求解析(如随机铸造的 goal id 必须被模型回显进 `update_goal`)——静态 sidecar 无法知道的值由此注入;语料是请求消息全部字符串叶按行连接,最后一次匹配胜出;未命中/非法模式/未终止占位符大声失败;
- **嵌套 agent 按首调用顺序认领脚本**:父 `session.jsonl` + 每子 `session.N.jsonl`;活会话 id 每次运行随机,按 header `createdAt` 排序的脚本被首个发起调用的会话依次认领,各会话推进自己的游标;活会话多于录制脚本大声失败。

场景覆盖:ACP boot 真实 automation-server 例子、回放录制会话、diff 规范化 JSON-RPC 与再持久化日志;一个场景(`text-turn`)钉死完整系统提示/工具 schema 内容,其他 fixture 把它 tokenize 成 `{{system}}`/`{{tools}}`,让一次编辑只搅动一行。
Web 侧另有浏览器快照门(`test:web`,Linux PR 必过):先 build(插件 CSS),Chromium 对回放浏览器输出与 `apps/web/tests/snapshots/` 比对;CI 强制只读 `DSH_SNAPSHOT=replay`,record/refresh 留在本地且每个 diff 人工评审。

with-key 政策同样鲜明:"我们是 DeepSeek——不要配给真实 API 测试。无 key 测试证明管线,只有带 key 运行证明 agent 对真实模型工作";最高价值是 boot 真实例子、发一条 prompt、检查世界的 smoke test——它抓住"单元测试绿、产品坏"这类 mock 抓不到的问题(引用 postmortem 0001)。
e2e 独立配置(`vitest.e2e.config.ts`)就是因为"花 token",worker 数 env 可调。

fixture 格式本身也有门禁:提交的会话格式 JSONL 使用规范 packed-row 布局,无 key 快照门按 `session` header 发现每一个此类 fixture;`scripts/migrate-packed-session-fixtures.ts` 作为临时迁移器改写旧布局 fixture——连测试资产的格式演进都有显式迁移路径,而不是让旧 fixture 静默失效。

vitest 配置族共六份,各司一职:`vitest.config.ts`(单元 + 覆盖率)、`vitest.e2e.config.ts`(带 key)、`vitest.snapshot.config.ts`(无 key 回放)、`vitest.web.config.ts`(浏览器快照)、`vitest.web.perf.config.ts`(性能,replay 强制)、`vitest.web-stress.config.ts`(压力),外加 `vitest.shared.ts` 提供共享的装饰器预转换插件与 execArgv。六份配置全部指向同一个 source-plane 解析门面(tsconfig.base.json paths),平面纪律因此不依赖任何一份配置的自觉。

快照门里也嵌着平面切换:`scripts/**/*.snapshot.ts` 与 `apps/cli/tests`、`examples/*/tests` 的快照默认跑 source 模式,而组装后的 Web 快照(`apps/web/tests/**/*.snapshot.ts`)只在 `DSH_EXAMPLE_MODE=lib` 时纳入——它执行的是生成的 client bundle,"source 模式保持零构建路径,lib 模式要求先构建"。同一个门里,哪些场景测源码、哪些场景测产物,是 include 表达式里明写的决策。

## 四、scripts/ 门禁家族:gen-* 与 verify-* 的清单归类

11 个 `gen-*` 全部有对应 `verify-*`——生成器以 `--check` 模式充当校验器(如 `verify-cordis-catalog = gen-cordis-catalog.ts --check`),**生成物与源的同步不靠人记,靠同一份代码的两种运行模式**。
按对象归类:

| 家族 | 成员 | 守护什么 |
|---|---|---|
| 目录/图谱生成 | gen-cordis-catalog、gen-client-catalog、gen-tool-catalog、gen-config-catalog、gen-persistence-catalog、gen-cordis-api、gen-cordis-inspect-catalog、gen-doc-graphs、gen-module-graph、gen-scoped-events | docs/ 下的生成目录与代码真值逐字节一致 |
| 文档形式 | verify-md-wrap(一段一物理行)、verify-md-links(相对链接可解析)、verify-mermaid、verify-doc-refs、verify-doc-budgets、verify-public-repository-links、verify-doc-site-fragments | Markdown 纪律与站点投影 |
| 类型等价 | verify-type-equiv | ` ```ts type-equiv ` 围栏与源码声明(含 JSDoc)经 TS parser 比对,manifest 登记 doc/symbol/projection 1:1 |
| 包不变量 | verify-package-invariants、verify-built-package-invariants、verify-package-paths、verify-dsh-package-licenses、verify-package-readme-model-experience、verify-package-readme-limitations、verify-node-next-types、verify-runtime-closure、verify-vendored-links、verify-config-source-ownership、verify-cordis-config、verify-client-domain-graph、verify-export-jsdoc | 包结构/发布载荷/README 契约/组合配置 |
| Agent Note 治理 | verify-agent-note-classification、verify-agent-note-format、verify-archived-agent-notes | 决策记录的分类、格式;归档笔记只封不改 |
| i18n | verify-translation-pairing、verify-translation-prompt(+ gen-translation-brief) | 双语文档配对(见下节) |
| 编排 | run-gates.ts | 全部门禁的依赖图调度器 |

三个特别值得注意:

**verify-doc-budgets**:从 `scripts/doc-budgets.manifest.json` 读 9 份常驻文档的字数上限(如 `docs/architecture.md` 2,400、`docs/testing.md` 1,150、根 `AGENTS.md` 1,900、`docs/cordis-primer.md` 600),按 `wc -w` 计数。
上限**只棘轮下降且需保留至少 5% 余量**,抬高需要 docs/AGENTS.md 定义的正当性论证——文档膨胀被当成需要审批的变更。

**verify-package-readme-model-experience**:每个包 README 必须有 `## Model Experience` 与 `#### KV Cache effect` 小节,校验审计过的包分类、model/token/KV-cache 字段、包拥有的文本块与末节顺序——"这个包碰不碰模型请求"是发布级契约,不是文档习惯(client 各包 README 里那些 "None, as …" 段落就是它的产物)。
配套的 verify-package-readme-limitations 守护 `## Known Limitations and Deferred Work` 节。

**run-gates.ts**(`scripts/run-gates.ts`)是编排层:每个门禁是 `{id, command, needs?, env?, allowFailure?}` 的 Gate,`validateGateGraph` 拒绝重复 id、未知依赖、环;有界并发调度,模式包括 `ci-primary`/`ci-static`/`ci-coverage`/`ci-snapshot`/`ci-artifacts`/`ci-consumers`/`ci-windows-*`/`node-compat`/`check-all`/`doc-sync`。
`ci-primary` 的依赖图很说明问题:typert-contracts 先跑,typecheck/lint/doc-typecheck 依赖它,build 又等这三者全部完成("build 既不竞态 tsbuildinfo,也不在声明被读时替换声明")。
built-bin smoke 是独立 Gate:`DSH_EXAMPLE_MODE=lib` 下纯 node 跑 13 个 built-*.e2e.ts。

## 五、doc-sync 与双语 i18n 门禁

`doc-sync` 聚合约 28 个叶门禁(docSyncLeafGates),核心思想:**docs/ 是依赖汇点,文档失真用编译发现**。

- **doc-typecheck**(`scripts/doc-typecheck.ts`):把全部 Markdown 的 ` ```ts ` 围栏抽出来对 workspace API 真编译;`ts ignore-check` 是计入 opt-out 比例的显式豁免,`type-equiv`/catalog 围栏归各自门禁管;`.zh.md` 的字节相同副本直接复用无后缀兄弟的检查;构建协调模式消费已有声明不 emit。图证据:docs→* 约 500 条 IMPORTS 边(00-graph-atlas §2),文档代码片段真实依赖全部包;
- **verify-type-equiv**:子系统文档粘贴的源码声明与源文件的声明+JSDoc 经 parser 比对,漂移即红;`public-api` 投影保留公开成员与 JSDoc、省略方法体与私有成员;
- **verify-translation-pairing**(`docs/i18n/README.md` 定义契约):一对文档 = 三个兄弟文件(`foo.md` + `foo.zh.md` + `foo.i18n.yaml`);yaml 记录两侧上次确认一致时的**完整 git blob hash**(`git hash-object` 可算,纯内容比较,`--write` 先写入本地对象库并用内容寻址 ref 钉住防 GC);编辑任一侧不重新 `--write` 确认即红;结构签名(标题深度、围栏字节相同、表格行列数、列表形态、有序列表起点、链接目标)必须 1:1 匹配;`--write` 必须点名确认的对——"yaml diff 就是确认一致这个可评审行为"。
注册的 `dsh-translation-pairing` git merge driver 在两侧 triplet 都能文本合并且合并后仍满足结构签名时自动合成新记录,否则保持冲突(fail-closed);`resolve-translation-pairing-conflicts` 对已停下的 merge 做同样操作;
- 门禁自述其边界同样诚实:"绿门禁意味着这对内容在这个精确内容上被确认过一致,**不意味着确认本身是可靠的**——判断两侧是否真的说同一件事是评审人的另一半契约"。

Markdown 形式门禁是 doc-sync 的最底层:verify-md-wrap 要求一段一物理行(换行即分段,让 diff 粒度到句),verify-md-links 要求全部相对链接可解析,两份门禁对 `.zh.md` 无差别适用;mermaid 图经 verify-mermaid 校验可渲染。形式规则之所以能这么严,是因为它们全部机器可判——doc-sync 的整体思路就是只保留机器可判的断言,把"说得好不好"留给评审。

## 六、hygiene:knip / publint / constraints 与发布卫生

`pnpm run hygiene` 一条链:rescope-vendor:check → knip → publint → constraints → licenses → package-invariants → built-package-invariants → cordis-config → node-next-types → runtime-closure → vendored-links。

- **knip**(`knip.json`):死代码/未用依赖检测,`--treat-config-hints-as-errors`;examples workspace 逐条列 entry(fixture agent 等);vendor 与 python/sdk-runtime 整段 ignoreWorkspaces;
- **publint**(`scripts/publint-all.ts`):逐包校验发布元数据;配套 `publication-payload.ts` 审计发布载荷(禁止特定文件进包,landlock 的 `src/main.c` 在显式 allowlist 上,因为"精确字节是包审计面的一部分");
- **constraints**(`scripts/check-workspace-constraints.ts`):包管理器无关的仓库不变量——vendored 包集合、repository URL 契约、项目引用面违规收集;
- **依赖安装也是门禁**:pnpm-workspace.yaml 的 `allowBuilds` 白名单——pnpm 10+ 默认拒绝任何带 install/build 脚本的依赖,每个需要的都列名并写理由(esbuild、lefthook、node-pty、koffi 允许;`@google/genai`、protobufjs 的脚本是 no-op,**拒绝但安装仍成功**);
- **本地钩子保持快**:lefthook pre-commit 只做 staged 范围(翻译配对记录、归档笔记、oxlint --fix 带一次有界重试、第三方声明*再生成而非拒绝*、空白错误、vendor manifest 守卫),pre-push 只跑 typecheck;"CI 拥有穷尽矩阵"是明写分工。

门禁的覆盖面甚至超出代码与文档:`test:issue-management`(`node .github/issue-management/policy.test.mjs`)给 GitHub issue 处理策略跑测试,并列入 ciSharedStaticGates——仓库的流程性资产(issue 策略、翻译记录、Agent Note)与代码资产适用同一条规则:有声明就要有校验。

CI lane 结构(`.github/workflows/ci.yml`)与门禁模式一一对应:node 24 static / coverage / snapshots+artifacts 三条主 lane,node 22.19 与 26 跑兼容 smoke 矩阵(source worker、JSONL zstd、dsh source-launch、vitest jsdom 四个 smoke;Node 22 上扩展为完整 build + web build + CLI smoke),python 3.10 无 key SDK 全套,python runtime 按发布形态 Linux x64,windows 门禁在 Wine 里跑(blocking/complete/observational 三级)。
全部无 key;带 key 的 real-API workflow 独立运行,worker 数受配额约束。

发布也走门禁链:`release:dsh`/`release:vendor` 分族 bump、`release:verify`、`release:pack`、`release:verify-packed-install`(打包后安装验证)、`release:publish`;`publish:npm-baseline` 单独成脚本。发布前验证与构建产物门禁(publint、built-package-invariants、node-next-types)复用同一套 Gate 定义,不另写一份。

## 七、静态检查的其余部分:lint、重复、组合配置、变更范围

门禁家族里不生成文档的几个静态成员各有讲究:

- **lint 用 oxlint 包了一层**(`scripts/run-oxlint.ts`):固定 oxlint 二进制定位、输出捕获上限 64 MiB、区分 fix 调用形态;staged 路径用独立的 `.oxlintrc.staged.json` 配置("project-free",pre-commit 钩子不依赖仓库状态)。`scripts/lint-rule-fingerprint.spec.ts` 给 lint 规则做指纹测试——规则本身是被测试的对象;
- **duplication 用 jscpd**(`.jscpd.json`):minTokens 60/minLines 6 的 mild 模式,只查 ts/tsx,排除 tests 与 tsdown 配置,`jscpd:ignore-start/end` 显式豁免块;`pnpm run duplication` 独立于 lint 运行;
- **verify-cordis-config** 守护组合配置的语义边界:Loader 只对 entry 的 `config`(声明的注入激活后,在该插件上下文里)与 `disabled` 字段(每次 mount 决策,在 loader 上下文里)做插值,**其他元数据字段保持静态**——在那里写表达式只会是一个永远为真的数据值并悄悄改变组合;门禁用 TS parser 检查所有 cordis.yml 的字段形态;
- **change-scope**(`scripts/change-scope.ts`):报告一次变更的显式提交与工作区范围(base/head SHA + merge-base + 路径清单,FORMAT_VERSION 化的 JSON)——给 pre-push 技能(dsh-pre-push-checks)选最小覆盖检查用,"不要条件反射地跑全仓套件";
- **运行时不变量是独立包**:`packages/runtime-diagnostics/invariants/` 提供包拥有的不变量注册表(`ctx.invariants`),每个 vitest 配置经 `scripts/test-invariants.ts` setup 挂载;client 侧 tsconfig 的 references 也逐包引用它——不变量不是测试断言的散落副本,是有服务键的基础设施。

## 八、source plane vs artifact plane

`docs/testing.md` 专节 "Test resolution: source plane only":

- 每个 vitest 配置把 vite-tsconfig-paths 指向 `tsconfig.base.json`(无 include → paths 对所有 importer 生效),裸 workspace import 解析到 `src`,**永不穿过 package exports 到构建产物 lib/**——陈旧产物会加载第二份模块单例;
- 构建产物只被显式消费:`DSH_EXAMPLE_MODE=lib` 的 built-bin smoke(13 个 built-*.e2e.ts,纯 node 跑 `lib/bin.js`,暴露 tsx 掩盖的失败:settle 竞态、模块解析、被吞的加载失败)、lib-mode 子进程经共享双模启动器("不要手写 `--import tsx`");
- "测试真实入口路径"是独立小节:包 `bin` 必须在纯 node 下跑构建产物;非 index 运行时入口(worker-thread 兄弟 `lib/worker.cjs`)与跨 bundle 单例模块同样;断言"配置真缺失时非零退出";
- 唯一的例外是生成的 Host-for-Client Remote 声明:公开 typecheck/lint/doc-typecheck 命令先生成它们,内部 `*:contracts-ready` 脚本假定调用方已依赖 Typert 契约生成通道。

这个平面划分与覆盖率豁免互相印证:source plane 负责逻辑正确性(逐文件 100%),artifact plane 负责"发布形态能跑"(smoke 清单),两者都不做对方的事。

对 grok-build 的对应关系值得先说清:Rust 里 source plane 是 crate 源码测试,artifact plane 是安装态二进制——dsh 用 DSH_EXAMPLE_MODE 一个 env 切换双模启动器的做法,等价于给同一套 e2e 场景提供"cargo run"与"已安装 grok"两个 runner。

## 九、对 grok-build 的可移植性评估

| dsh 门禁 | grok-build 现状 | 可移植性 |
|---|---|---|
| 逐文件 100% 覆盖率 | 无覆盖率门 | **中**。cargo-llvm-cov 无 per-file threshold,需脚本包一层;但"未覆盖行=候选死代码"哲学与 Rust 编译器冗余警告同向,成本低收益高 |
| 快照回放(llm-replay) | Workflow Journal 已记录全部主机调用结果,确定性回放已存在 | **高**。grok-build 已有等价底座,差的只是"录制=跑一次真 agent 收割 journal"的 e2e 场景化封装与 record/refresh/replay 三态纪律 |
| doc-typecheck | Rust doctest 原生编译文档代码块 | **高(已天然具备)**。需补的是 dsh 式 opt-out 比例追踪;type-equiv 那种"粘贴声明与源比对"Rust 无对应,可用宏生成文档片段代替 |
| gen-*/verify-* 同体双模 | 无 | **高**。xtask 或 build.rs 均可,模式无关语言 |
| doc-budgets 字数棘轮 | 无 | **高且便宜**,纯脚本 |
| 双语配对门禁 | 无需求(单语) | 不移植 |
| source/artifact 平面分离 | 测试基本都在源码树 | **中**。可加"纯二进制 smoke"门:安装态 `grok` 跑最小会话并断言非零退出路径 |
| Model Experience README 契约 | 无 | **低优先**,但"每个 crate 声明自己碰不碰模型请求"对脱敏审计有直接价值(可简化为 sanitize 审计字段) |
| 真实优先 + 验证世界规则 | mock 较多 | **高**。纯纪律,零工具成本 |

一个警示:dsh 的门禁密度是有代价的——scripts 自调用 1,692 条、门禁脚本自身也要逐文件 100% 覆盖(scripts/**/*.spec.ts 在 include 里)、CI 分 7+ 条 lane、每个门禁脚本还有自己的 spec。
grok-build 若要搬,应优先搬"回放 + 逐文件覆盖率 + gen/verify 同体"这三件与规模无关的,而不是整套 doc-sync——后者的前提是 docs 体量大到需要目录生成与双语配对,grok-build 目前不在那个规模。

---

## 核心发现

1. **逐文件 100% 是死代码探测器而非测试 KPI**:per-file 防大文件补贴,未覆盖行优先解读为"该删",豁免全部列名带理由且 GUI 债务有 TODO(gui)清单;重套件去 instrumentation 化的成员规则保证省插桩税不省正确性。
2. **无 key e2e 的底座是"fixture 即持久化日志"**:llm-replay 从录制的 session.jsonl 重建模型流,override sidecar 补 throw/hang,`{{fromRequest:regex}}` 注入运行时才知道的值;record/refresh/replay 三态分离了"花 key"与"花 CI"。
3. **gen-* 与 verify-* 同体双模**:11 个生成器全部以 --check 充当校验器,生成目录与源的同步由同一份代码的两种运行模式保证,run-gates.ts 再用依赖图把它们编排成 7+ 条 CI lane。
4. **docs 是编译意义上的依赖汇点**:doc-typecheck 真编译 Markdown 围栏(图里 docs→* 约 500 条 IMPORTS),type-equiv 围栏与源声明 parser 级比对,doc-budgets 字数棘轮只降不升——文档失真用编译器发现。
5. **双语配对用 blob hash 做成可评审行为**:`.i18n.yaml` 记录两侧 git blob hash,编辑不重新 --write 即红,merge driver 只在结构签名可验证时自动合成,fail-closed 贯穿始终。
