# deepseek-harness 架构:Cordis 插件树与层叠组合

> dsh 没有特权内核:模型适配器、工具注册表、会话日志、agent 循环本身都是 Cordis 插件;运行时是一棵由 profile/bundle/patch 层叠组合出的插件树,包与包之间只经 `ctx` 服务与类型化事件交互——这在调用图上是可验证的(包级近零 CALLS)。

---

## 1. Cordis 插件模型

Cordis 是 vendored 在 `vendor/cordis/` 的插件框架(`@deepseek-ai/cordis` 4.0.0-rc.7)。五个核心概念(`docs/cordis-primer.md:9-15`):

1. **plugin = 实现 Service 的对象**:可以是函数(带可选 `inject` 与 `apply(ctx)` 字段),也可以是 `Service` 子类,由 Cordis 把生命周期挂进当前 context。
2. **context = 服务仓库**:服务认领稳定的 `ctx.<key>`(`ctx.tools`、`ctx.llm`、`ctx.sessions`),其他插件按 key 找服务,而不是 import 具体实现。
3. **`inject` 声明依赖**:插件列出所需服务,等到服务存在才激活——加载顺序用服务需求表达,不靠手工排序。
4. **类型化事件通信**:事件名经 TypeScript declaration merging 声明,按 `emit` / `waterfall` / `parallel` / `serial` / `bail` 五种模式分发(primer 只列前四种,见 §1.3)。
5. **注册是可回滚的 effect**:prompt 段、工具 schema、适配器、provider、监听器都经 `ctx.effect()` / `ctx.on()` 安装,reload 与 teardown 可预测地回卷。

### 1.1 ctx:代理出来的服务仓库

`Context` 是一个 Proxy 类(`vendor/cordis/src/context.ts:44-87`):构造时装好四个内置服务——`events`、`logger`、`reflect`、`registry`(外加根 `fiber`,它不是服务),普通属性读走服务解析器(`reflect`),`ctx.get(name)` / `ctx.provide(name, value)` 是显式读写口。harness 各包用 declaration merging 给 `Context` 接口添键,例如:

```ts
// packages/goal/goal/src/index.ts:59-63
declare module '@deepseek-ai/cordis' {
  interface Context { goals: GoalService }
}
```

同型声明还有 `ctx.credentials`(`packages/credentials/credentials/src/index.ts:47-51`)、`ctx.commands`(`packages/interaction/commands/src/index.ts:90-92`)、`ctx.terminals`(`packages/terminal/terminal/src/index.ts:48-50`)、`ctx.sessionTitle`(`packages/session/session-title/src/index.ts:88-90`)、`ctx.dynamicCordisRunner`(`packages/extensions/cordis-host-runner/src/index.ts:82-87`)。Host 与 Client 两侧对同一批键合并不同服务,这正是 TS 工程必须拆两个聚合根的原因(`docs/development.md:55-57`)。

三个作用域原语(`context.ts:99-145`):

| 方法 | 语义 |
|------|------|
| `ctx.extend(meta)` | 子 context,原型继承父属性,不改父 |
| `ctx.isolate(name, label?)` | 给服务 `name` 开独立作用域:子树下该服务的读写解析到新 label,换实现不影响父域 |
| `ctx.intercept(name, config)` | 给子树下的插件注入服务级 config(祖先先合并,`service.ts:86-102`) |

`isolate` 是 agent preset 的地基:preset 里的服务行必须待在带 `isolate` realm 的 group 里,否则会发布进根 realm 造成进程级冲突(`apps/cli/config/agent-presets/standard/agent.cordis.yml:11-19`)。

### 1.2 注册即回滚:effect 与 Service

`Service` 子类的构造器调用 `ctx.reflect.provide(name, this, check)`,服务随所属 fiber 卸载自动注销(`vendor/cordis/src/service.ts:36-59`)。函数插件则用 `ctx.effect(setup, name)`:setup 返回 disposer,卸载时按注册逆序执行;vendored 版本对 fiber 生命周期做了本地加固(`vendor/README.md` 本地修改 #6)——setup 期间的重入卸载会等待 setup 完成并回卷已收集的清理;`UNLOADING` 状态下拒绝新建 effect,防止清理期注册逃逸出卸载快照。

harness 侧的典型用法:`packages/hooks/hooks-claude-code/src/index.ts:126` 用 `ctx.effect(() => () => detached.drain(), ...)` 保证插件卸载前 abort 活跃钩子并排空续延;`packages/boot/app-boot/src/index.ts:822-829` 的 `addHarnessSourceSection` 把 prompt 段注册在 `systemPrompt` 服务的 fiber 上,服务 HMR 重载时段随之丢弃。

### 1.3 五种分发模式;waterfall 必须 next()

| 模式 | await? | 顺序 | 有返回值? | 用途 |
|------|--------|------|-----------|------|
| `emit` | 否 | 注册序观察 | 无 | 广播事实 |
| `waterfall` | 否 | 注册序 | **有** | around 中间件 |
| `parallel` | 是 | 并行(`Promise.allSettled`,拒绝聚合为 `AggregateError`) | 无 | 扇出(如 `session/flush`) |
| `serial` | 是 | 注册序,首个 bail 值即停 | 有 | 顺序决策(如 `agent/turn-stopping`) |
| `bail` | 否(同步) | 注册序,首个 bail 值即停 | 有 | 同步短路(框架内部用,如 `internal/listener`) |

注意:docs/cordis-primer.md:19-27 只列前四种,源码的 `DispatchMode` 还有 `bail`(`vendor/cordis/src/events.ts:32`,以源码为准)。分发模式是事件的公开契约,新事件用 `@mode` JSDoc 标注,生成的目录会核对声明与分发点。

`ctx.waterfall` 是 around-middleware:监听器签名 `(...args, next)`,**调 `next()` 才把(可能被包装的)结果委托给下一个服务;不调 `next()` 直接返回即短路**(`docs/cordis-primer.md:31-37`)。单决策事件把短路当设计:策略监听器拥有决策时可以不 `next()`;只标注/观察的监听器必须委托。`prepend: true` 仅用于必须先于普通注册跑的监听器。

---

## 2. 层叠组合:profile / bundle / patch

运行中的 `dsh` 是启动时按序分层组合的插件树(`docs/architecture.md:19-31`):

- **profile** = Harness home 里的命名组合,目录 `$DSH_HOME/profiles/<name>`:列出要叠的 bundle、装树外插件、保管用户自己的 `cordis.patch.yml`(`packages/boot/app-boot/src/profile.ts:1-22` 模块注释)。`web` 与 `headless` 是出厂模板(`profile.ts:112-116`):

```ts
export const PROFILE_TEMPLATES: Record<string, readonly string[]> = {
  web: ['@deepseek-ai/dsh-base', '@deepseek-ai/dsh-web-app'],
  headless: ['@deepseek-ai/dsh-base', '@deepseek-ai/dsh-headless'],
}
```

- **bundle** = Cordis 配置行与其挂载代码的发行格式:插入的行仍可被上层 patch。bundle 在自身 `package.json` 的 `dsh.bundle.patch` 声明 patch 文件(如 `packages/bundle/base/package.json:36-40`);profile 在 `dsh.profile.bundles` 列出 bundle 顺序(`profile.ts:43-61`)。

### 2.1 层的施加顺序

对空 entry list 依次施加(`apps/cli/src/profile-boot.ts:132-171` `composeProfile`):

```
bundle 层(dsh.profile.bundles 顺序)
  → profile 的 cordis.patch.yml
  → home 级 $DSH_HOME/cordis.patch.yml(profile-boot.ts:49-51,机器级偏好,压过 per-profile 层)
  → --patch overlay(argv 顺序)
  → 派生 patch:agent-presets 出厂 root 注入、DSH_TELEMETRY_DISABLED 遥测开关
```

`docs/architecture.md:27` 的表述与源码一致,源码额外多两个派生 patch(profile-boot.ts:159-169)。bundle 解析锚点双跳:先从 dsh 安装目录解析,再从 profile 目录——保证 `dsh-base` 永远来自运行中的安装(`profile.ts:336-358`);`healProfilesModuleFallback` 在 `$DSH_HOME/profiles/node_modules` 维护一套符号链接平面(安装依赖闭包 BFS),让树外插件经 Node 父目录走查即可解析全部在箱插件(`profile.ts:203-255`)。

### 2.2 三个出厂 bundle

| bundle | 内容 | 出处 |
|--------|------|------|
| `dsh-base` | 每个 profile 的第一层,约 70 行 insert:模型适配(llm/llm-deepseek/llm-pi-ai/llm-retry)、session 日志与持久化、tools 全家桶、sandbox/approval/permission、settings、credentials、遥测、subagent/workflow | `packages/bundle/base/cordis.patch.yml` |
| `dsh-web-app` | 浏览器面:按 id 覆写 base 行(persona、关 hmr、tools mode)+ insert webserver/api-gateway/cordis-host-runner/storage/目录选择器与全部 `dsh.client` 浏览器 roster | `packages/bundle/web-app/cordis.patch.yml` |
| `dsh-headless` | 一次性 runner:覆写 persona/hmr/tools,insert code-runtime、headless-startup、headless-runner(`task: !!js ctx.headlessStartup.task`);不挂 Host/HTTP/浏览器 | `packages/bundle/headless/cordis.patch.yml` |

base 层的注释说明了分层纪律:**patch 替换整行 config 而非合并,所以按模式取值的行不住在 base**——base 只给共享身份与中性默认,模式 bundle 重述完整配置(`packages/bundle/base/cordis.patch.yml:1-12`)。行序无加载语义,激活由服务可用性驱动(同文件 12-13 行注释)。

### 2.3 boot 流程

`boot()`(`packages/boot/app-boot/src/index.ts:757-803`):

```
new Context() → ctx.baseUrl = 配置目录
→ provide('dshHomePath')        # 供 !!js 表达式引用
→ ctx.plugin(Loader) → prepare?.(ctx)   # host 准备(cmdlineArgs、环境快照)
→ mountRootInclude(ctx, configPath, patches)   # cordis:include 内置,固定 id 'include'
→ ctx.loader.await()            # 等整棵树 settle
→ assertEntriesActivated()      # 审计:失败/挂起 entry 逐个点名(含缺失服务列表)
```

失败处理:`installFailLoud`(index.ts:610-648)把晚到的 unhandled rejection 变成一条 stderr 诊断 + exit(1),退出前给终端持有者 2s 释放窗口;`assertEntriesActivated`(index.ts:694-725)把插件原始抛出栈重抛出来,挂起 entry 报告它在等的服务名。启动后审计:无 fiber 且未 disabled 的 entry 一律拒绝(index.ts:658-664)。

---

## 3. 三类事件

事件是扩展点,选对域是多数修改的第一个决策(`docs/architecture.md:53-60`):

| 域 | 性质 | 例子(模式) |
|----|------|-------------|
| **Session 事件** | 持久事实,append 进会话日志并经 `session/event`(emit)广播;必须存活过 reload 的事实用它 | `turn/*`、`step/*`、`user/message`、`assistant/*`、`tool/*`、`goal/change` |
| **Agent 事件** `agent/*` | 携带活的 `Agent`,观察/拦截进行中工作 | `agent/pre-step`(waterfall)、`agent/request`(waterfall)、`agent/request-error`(waterfall)、`agent/status`(emit)、`agent/turn-stopping`(serial)、inbox 三件(emit) |
| **Capability 事件** | 给 seam 挂策略与适配器,不 import 循环 | `fs/write-intent`、`fs/edit-intent`(waterfall)、`tools/pre-execute`、`tools/execute`、`tools/post-execute`(waterfall)、`llm/stream`(waterfall)、`approval/request`(waterfall)、`credentials/updated`、`settings/updated`(emit) |

完整生产/消费矩阵是生成文档 `docs/event-producer-consumer.md`(约 50 个 harness 事件,含声明位置、分发器、监听器)。两个有代表性的密度点:

- `session/event` 的监听器有 21 个(acp、apiproxy、agent-loop、persistence、projection、telemetry、token-meter……)——会话日志是全产品的真相源;
- `agent/pre-step` 挂 13 个监听器(agent-instructions、compaction-basic、hooks 双桥、plan-mode、repeat-tool-reminder、checkpoint-policy、time-context、tool-cordis、tool-skill……)——"模型看到什么"在这一个 waterfall 上被各方改写。

turn flow(`docs/architecture.md:63-90`):step = 一次模型请求 + 其工具调用;turn = 零或多个 step。`agent/pre-step` 决定模型所见,可改写或拒绝 claimed 消息;被拒绝或空的首次 claim 仍关闭一个没花 step 的持久 turn,日志记录尝试本身。模型历史不另存:`Session.deriveMessages()`(`packages/core/session/src/index.ts:726`)从日志投影,原始 `assistant/chunk` 保住回放与 UI 保真;输入经唯一的 inbox 到达驱动(`packages/core/agent/src/inbox.ts`,图热点入度 34),`agent.inject()` 的上下文留在 inbox 等另一条消息唤醒。**Model-visible means logged**:到达模型请求的一切必须可从日志重建,运行时不变式断言此事;新的模型可见输入必须新增 session 事件(扩展 `SessionEventMap`,如 `packages/goal/goal/src/domain.ts:61-67`)。

图数据与 turn flow 可对账(`00-graph-atlas.md` §4):工具执行管线(proc_0)为 `dispatchToolBody → resolveExecution → … → runSchemaCompiler`,守卫/审批不在调用链里而在 `tools/pre-execute` 事件上;压缩唤醒循环(proc_2)为 `compactNow → runMaintenance → wakeDriver → kick → turn → preStep → claim(Inbox)`——压缩完成经维护钩子唤醒驱动、开新 turn、从 inbox 取输入,与架构文档的 turn 图完全一致。

---

## 4. 扩展点表("Where new behavior goes" 核实)

`docs/architecture.md:107-127` 给出新行为去向表;逐条对照源码 declaration merging / bundle 行核实如下:

| 目标 | 机制 | 源码锚点 |
|------|------|----------|
| 加模型 provider | 注册适配器到 `ctx.llm` | `packages/llm/llm-deepseek`(base 行 `llm-deepseek`) |
| 加模型面能力 | 注册到 `ctx.tools`,schema 自动进 prompt 装配 | `packages/core/tools`;base 的 `tool-*` 行 |
| 给单会话不同能力集 | 组合 agent preset;服务行需 `isolate` realm | `packages/preset/agent-presets`;`standard/agent.cordis.yml:105-143` |
| 加 shell 执行 | 注册 `ctx.shell` 后端;local 经 `ctx.subprocess` 派生 | `packages/shell/*` |
| 加持久终端 | 注册 `ctx.terminals` 后端 + `dsh-tool-terminal` | `packages/terminal/terminal/src/index.ts:48-50` |
| 加人类命令 | 注册 `ctx.commands`,无模型 turn 直接分发 | `packages/interaction/commands/src/index.ts:90-92` |
| 加后台工作 | 注册 `ctx.jobs`;`job_*` 工具收集/停止 | base 行 `jobs`(`dsh-jobs-local`) |
| 加文件系统访问/策略 | 注册 `ctx.fs` provider 或监听 `fs/*` 事件 | `packages/fs/*`;`fs-observation-policy` 行 |
| 约束派生进程 | 用 `ctx.sandbox` 后端;消费者 spawn 前包装 argv | base 行 `sandbox`、`bash-sandbox`、`sandbox-policy` |
| 拦截请求/工具/turn | 用 `agent/*` 或 `tools/*` 事件;`agent/turn-stopping` 停 turn | 事件矩阵;hooks 双桥即消费者 |
| 加模型面上下文 | 调 `agent.inject()`,落入下一次被接纳的请求 | `docs/architecture.md:120` |
| 加 UI/编辑器集成 | 驱动 `ctx.agents`,从 `session/event` 渲染 | client 半边全部 |
| 加持久会话状态 | 扩展 `SessionEventMap`,从日志渲染/重放 | `packages/goal/goal/src/domain.ts:61-67` 示例 |
| 生成会话标题 | 注册唯一 `ctx.sessionTitle` provider | `packages/session/session-title/src/index.ts:88-90` |
| 管理同会话目标 | 用 `ctx.goals`,经 `agent/*` 续转 | `packages/goal/goal/src/index.ts:59-63` |
| fork 活会话 | `ctx.sessions.fork(source, boundary?, childSessionId?)` | `docs/architecture.md:125` |
| 把注册限定到一个 agent | 用该 agent 的 `agent.ctx` | `packages/core/scope`(库,无 ctx key) |

核心包与 ctx key 对照(`docs/architecture.md:41-51`):`core/session→ctx.sessions`、`core/system-prompt→ctx.systemPrompt`、`core/tools→ctx.tools`、`core/agent→ctx.agents`、`core/agent-loop→ctx.agentLoop`、`llm/llm→ctx.llm`、`core/scope` 是库没有 key。

---

## 5. 包级零耦合:图证据

GitNexus 全图聚合(`ref-analysis/deepseek-harness/00-graph-atlas.md` §2)给出最硬的架构证据:

- 全部 24,638 条 CALLS 边按包聚合,**跨包组直接调用几乎为零**——唯一一条是 `client → test-support`(119 条,测试基建)。包内自调用排名:client 6,560 > scripts 1,692 > apps 1,161 > core 1,092 > typert 1,002 > session 923 > host 851。
- 结论:包与包之间不互相调用,全部经 Cordis `ctx` 服务注册/类型化事件交互。这不是文档宣称,是图里可验证的事实;对比 hermes/openclaw 的包间 CALLS 密度远高于此。
- IMPORTS 拓扑(7,559 边)呈星型:`client` 是唯一大消费者(`client → todo 303`、`→ workspace 47`、`→ sdk 14`……),前端作为组合点直接 import 能力包;能力包之间仅零星导入且方向都是"消费方 → 核心词汇包"。
- 热点符号(§3):入度最高的是各 seam 的**错误类型与词汇类型**(`FsError` 56、`LlmError` 48、`SessionQueryError` 48、`MockAdapter` 48),而不是服务实现——实现可换、词汇稳定,正是 seam 三角色(Service Definition / Provider / Consumer)在图上的投影。
- agent 循环本身可换:`ReactLoopAgent`(core/agent-loop/src/agent.ts:63-495)上游影响面极小,仅 `AgentLoop.prepare` 装配点与测试引用——换循环实现只需换插件(§5)。

代价:大量事件/注册样板与极高的工程门禁密度(scripts 自调用 1,692,全仓第二;§7)。

---

## 6. vendor/cordis 的角色

`vendor/` 是源码级 vendored 的框架层:harness 完全拥有它(可审计、可打补丁、版本钉死),不走 npm 依赖(`vendor/README.md:3-5`)。

| 目录 | npm 名(重命名后) | 上游版本 | 角色 |
|------|--------------------|----------|------|
| `cordis/` | `@deepseek-ai/cordis` | 4.0.0-rc.7 | 框架核心:Context/Fiber/Service/Events/Registry/Reflect |
| `loader/` | `@deepseek-ai/cordis-plugin-loader` | 1.0.0-rc.5 | entry 树加载器:inject 门控、事务性更新、`!!js` 求值 |
| `include/` | `@deepseek-ai/cordis-plugin-include` | 1.0.4 | 文件背书的 include 树 + patch 算法(`applyEntryPatches`) |
| `group/`、`timer/`、`hmr/`、`logger-console/` | 同名前缀 | — | group 行、定时服务、模块/配置热重载、控制台日志 |
| `cosmokit/`、`schemastery/` | 同名 | 1.8.1 / 3.18.0 | 工具函数库、schema 库(zod 谱系) |

要点:

1. **重命名进 `@deepseek-ai` scope**:每个 harness 包都声明 cordis 为 peer,发布 harness 等于发布框架层,用上游名会抢注 registry;目录名与版本号不变,manifest 仍读作上游快照(`vendor/README.md:5`)。`pnpm-workspace.yaml#linkWorkspacePackages` + overrides 让保留的 semver range 解析到本地 link。
2. **本地修改清单是穷尽的**(`vendor/README.md:31-49`,18 条),与 dsh 组合语义直接相关的四条:
   - #8 事务性 Loader/Include 配置调和:候选 apply 失败恢复原插件/配置;settlement 复查漏依赖 fiber;
   - #11 从 include 抽出纯函数 `applyEntryPatches` 并导出 `entryListSchema`,`dsh --dump-config` 因此能与挂载**同一算法**组合打印,永不漂移;insert 的行即时入 id 索引,后序 patch 可配置/禁用前序 insert 的行;
   - #15 懒配置解析:entry 保留原始 config,声明的 inject 激活后才经 `internal/config` 解析(port of cordiverse/cordis#41)——这是 `!!js ctx.webStartup.port` 之类表达式能等 provider 就绪的原因;
   - #18 `disabled: !!js` 在每次 mount 决策对 loader context 求值,原始节点留在 options 里保证写回不丢形态。
3. **同步流程**(`vendor/README.md:53-60`):拷贝上游 `src/` → 重放本地修改 → 更新 manifest 版本与 commit → `pnpm install && pnpm run test && pnpm run build`。`verify-vendored-links` 门禁断言每个 vendored 名在 lockfile 里解析为 workspace link 且无 registry 副本并存。

版本注记:`vendor/cordis/package.json:4` 声明 `4.0.1`,而 vendor/README.md manifest 表记的上游版本仍为 `4.0.0-rc.7`——manifest 未随本地版本更新,以 package.json 为准。

---

## 7. 小结

dsh 架构的三条主线:**组合**(profile/bundle/patch 层叠出插件树,无特权核心)、**词汇**(seam 的错误类型/事件 map 是稳定接口,实现随便换)、**事件**(守卫、策略、观察挂在 waterfall/emit 上,调用链保持干净)。配置面的组合语义(cordis.yml 方言、patch 算法、DSH_HOME 层级、preset/hooks/self-modification)在 `09-composition-config.md` 展开。
