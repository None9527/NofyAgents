# deepseek-harness 组合与配置:cordis.yml、profile、preset 与能力配置

> dsh 的配置即组合:cordis.yml entry 行 + patch 层叠决定插件树;`$DSH_HOME` 收纳 profile、settings、credentials;preset 提供每会话 agent 组合;hooks 桥消费 Claude Code/Codex 的钩子配置;extensions 让 agent 在运行时给自己挂插件。

---

## 1. cordis.yml 加载器语义

### 1.1 entry 行结构

cordis.yml 是顶层 YAML 数组,每行一个 `EntryOptions`(`vendor/loader/src/config/entry.ts:9-22`):

| 字段 | 含义 |
|------|------|
| `id` | 所在 entry 树内的稳定 id——patch 的寻址键、dump 的分组键、启动诊断链里的坐标 |
| `name` | 模块说明符(包名/相对路径/`cordis:` 内置),由 entry 树 import |
| `config` | 传给插件的配置(schemastery schema 校验;`!!js` 节点惰性求值) |
| `group` | 标记嵌套组:group 行的 `config` 是子行数组 |
| `disabled` | 禁用该行及其后代;可为 `!!js` |
| `inject` | 该行所需服务(或 per-service intercept 配置) |
| `isolate` / `intercept` | 行级作用域 realm / 服务 intercept 配置(见 02 篇 §1.1) |

### 1.2 `!!js` 表达式:受限的插值

- **方言**:`entryListSchema = yaml.JSON_SCHEMA.extend(JsExpr)`——JSON schema 之上只加一个自定义标量 tag `!!js`,解析成表达式节点 `{ __jsExpr: string }`(`vendor/include/src/index.ts:9-25`)。没有任意 YAML 类型、没有函数体、没有 require——`!!js` 只是"延迟求值的表达式字符串"。
- **求值器**:`new Function('ctx','expr', 'with(ctx){ return eval(expr) }')`(`vendor/loader/src/config/utils.ts:4-9`),由 Loader 在激活期执行。这不是沙箱:配置表达式拥有进程权限,信任边界在"谁能写这个文件"。
- **两处插值时机不同**(vendor 本地修改 #15/#18,`vendor/README.md:46-49`):
  - `config` 内的 `!!js`:**懒解析**——等该行声明的 inject 全部激活后,对该行**自己的插件 context** 求值。所以 `port: !!js ctx.webStartup.port ?? 3080` 能等到 `webStartup` provider 就绪(`packages/bundle/web-app/cordis.patch.yml:118-120`);树载体(Include/Group)的 config 保持字面,嵌套行的 `!!js` 属于各行自己的 fiber;
  - `disabled` 的 `!!js`:每次 mount 决策对 **loader context** 求值(`entry.ts:104-108` `disabledOf`),原始节点保留在 options 里,写回不丢 `!!js` 形态;这是唯一被插值的元数据字段。base 层大量使用:`disabled: !!js process.platform === 'win32'`(tool-bash 行)。
- `dshHomePath` 由 boot 注入 context(`packages/boot/app-boot/src/index.ts:24-29, 771`),配置里可直接写 `root: !!js dshHomePath('sessions')`(base 的 session-persistence-jsonl 行);用户 patch 层共享同一方言,也能引用 `process.env`。

### 1.3 patch:覆盖与插入

patch 文件是顶层 YAML 数组,元素为 `PatchOptions`(`vendor/include/src/index.ts:145-156`:`id`、`insert`、`name`、`config`、`disabled`、`inject`、`isolate`……)。算法 `applyEntryPatches`(include/src/index.ts:58-125),mount 与离线工具(`--dump-config`)共用同一实现:

- 输入先 `structuredClone`,结果与输入完全脱离(热重载移除旧 patch 才能真正回退);
- **无 `id` 的 `insert`**:追加到顶层列表(bundle 层就是这样把整副行插进空 profile root);
- **带 `id` 的 `insert`**:追加进该 group 行的 `config`(目标必须是 group,否则告警跳过);
- **非 insert patch**:必须有 `id`;给了 `name` 而与目标不符则告警跳过(防错打别的行);其余键**逐键赋值**——`config` 是整体替换,不是合并;
- **目标 id 不存在**:告警而非报错——一个 overlay 可以跨 surface 共享,不必匹配每棵树;但 patch 文件不可解析/不是顶层数组则 boot 硬失败(`parsePatchList`,app-boot/src/index.ts:320-338);
- insert 的行**即时入 id 索引**,同一 patch 列表里后面的 patch 可以配置/禁用前面 insert 的行(本地修改 #11:上游只建一次索引,insert 的行静默不可 patch;dsh 的空根 + 多层组合依赖此修复)。

两种 patch 形态(取自 `packages/bundle/web-app/cordis.patch.yml`):

```yaml
# 按 id 覆盖:整行 config 替换,故须重述该行拥有的全部字段
- id: system-prompt
  config:
    persona: >-
      You are a coding agent powered by the {{model}} model. ...

# 无 id 的 insert:向顶层追加整副行(web 层的 host/transport/browser roster)
- insert:
    - id: webserver
      name: '@deepseek-ai/dsh-host-webserver'
      inject: [webStartup]
      config:
        host: !!js ctx.webStartup.host ?? '127.0.0.1'
        port: !!js ctx.webStartup.port ?? 3080
```

`{{model}}` / `{{cwd}}` 是 system-prompt 插件的模板变量,不是 Loader 语法。patch **不跨 include 边界**:dsh 把空 profile root、各 bundle 层、profile/home patch、`--patch` overlay 全部作为同一 include 层的兄弟 patch 列表施加,否则 surface-only 行从用户配置不可达(`vendor/README.md` #11)。

---

## 2. profile 模板与启动组合

出厂模板(`packages/boot/app-boot/src/profile.ts:112-116`):`web = [dsh-base, dsh-web-app]`、`headless = [dsh-base, dsh-headless]`;无模板的自建 profile 初始化只有 `[dsh-base]`(`DEFAULT_PROFILE_BUNDLES`,profile.ts:125)。

profile 目录结构由 `initProfile`(profile.ts:155-167)首次使用时生成:

```
$DSH_HOME/profiles/<name>/
├── package.json        # dsh.profile.bundles + 树外插件 dependencies
├── cordis.patch.yml    # 用户自己的 patch 层(模板是带注释的空数组)
├── pnpm-workspace.yaml # hoisted linker + autoInstallPeers:false(树外插件用)
└── cordis.yml          # 空根 entry list;每次启动重写,防 Loader 写回累积行
```

`prepareProfile`(apps/cli/src/profile-boot.ts:97-103)每次启动重写 `cordis.yml` 空根:整棵组合都是 patch 层,Loader 的树写回(插件自 dispose 会持久化当前树)若不清空会把 bundle insert 烙进文件,下次启动翻倍。

施加顺序(02 篇 §2.1 已列);两个派生 patch 值得注意(profile-boot.ts:155-169):

- 组合里若有 `agent-presets` 行,launcher 自动注入出厂 preset root(`apps/cli/config/agent-presets/`,`trust: system`);
- `DSH_TELEMETRY_DISABLED` 非空(**任何值**,含 `'0'`/`'false'`)生成 `{ id: 'session-telemetry-otel', disabled: true }`——隐私开关宁可误关不可误开(profile-boot.ts:70-84)。

热重载:profile 与 home 两个 patch 文件都经 HMR 监视,编辑即事务性重放;组合里没有 hmr 服务时 launcher 补挂一个无模块 root 的 watch-only 实例(profile-boot.ts:276-291)。每代重组合都重读两个文件并 `structuredClone`——include 按引用推 insert 行,复用解析对象会把用户覆盖烙进 bundle 内存行,移除覆盖再也回不去(profile-boot.ts:228-244)。

---

## 3. DSH_HOME 与 home 级 patch

Harness home 是唯一用户数据根(`packages/util/home-paths/src/index.ts`):优先级 显式配置路径 > `$DSH_HOME` > `~/.dsh`(`resolveDshHome`,index.ts:87-92);空白 `$DSH_HOME` 视为未设,防止把 home 解析到 cwd。`dshHomePath(...segments)` 在解析后的 home 上拼接(index.ts:97-99);显示层永不暴露绝对路径(默认显示 `~/.dsh`,配置过的显示 `$DSH_HOME`,index.ts:110-112)。

home 下的已知住户:

| 路径 | 内容 |
|------|------|
| `profiles/<name>/` | profile 目录(§2) |
| `profiles/node_modules/` | launcher 维护的符号链接平面(安装依赖闭包 BFS),树外插件的兜底解析(`profile.ts:203-255`) |
| `cordis.patch.yml` | **home 级 patch 层**:对每个 profile 都施加,排在 profile 自己的层之后、`--patch` 之前(`homePatchPath`,profile-boot.ts:49-51) |
| `settings.yaml` | 用户设置文档,热重载(§5) |
| `.credentials.yaml` | 受管凭据文档,owner-only,热重载(§5) |
| `.env` | 用户环境层(低于继承环境与项目 `.env`) |
| `sessions/` · `storages/` | JSONL 会话持久化 / Web storage(base/web-app 行 `!!js dshHomePath(...)`) |
| `.agent-presets/` | 用户自建 preset 的可写 root(§6) |
| `.anonymous-user-id` | 遥测匿名身份(随机 UUID,删除重置;base patch 130-147 行注释) |

环境分层(`loadLayeredEnv`,app-boot/src/index.ts:178-198):继承环境 > 调用目录 `.env` > home `.env`;两个文件先全部解析校验、再应用(拒绝不能半应用)。**bootstrap 类变量禁止进 `.env`**:`BOOTSTRAP_NAMES`(PATH/HOME/NODE_OPTIONS/代理/CA/Git 钩子等)与 `DSH_`/`XDG_`/`DYLD_`/`BASH_FUNC_` 前缀(index.ts:93-117)——它们决定进程如何启动、从哪加载代码、如何触网,违者 boot 硬失败。

---

## 4. --dump-config:免启动查看组合结果

CLI 形态(`apps/cli/src/args.ts:33-40, 133-136`):`dsh --profile <name> --dump-config` 打印含用户层与 `--patch` 的完整组合;`--dump-default-config` 只打 bundle 层(`userLayer: false`,坏的用户层不会挡住恢复性诊断);两者互斥,且不接受任何 app 参数(dump 不运行 app 命令行 provider,显示与启动不一致会误导,args.ts:92-101)。

实现 `renderConfigDump`(`packages/boot/app-boot/src/index.ts:379-444`)的关键纪律:用 include 自己的 `applyEntryPatches` **同一次调用**组合(与 `boot()` 完全相同的参数)——工具永不与挂载漂移,连 patch 可见性角落(后层 patch 打到纯 config 替换引入的 group 子行)都一致。输出仍是可加载的 YAML(`!!js` 原样打印、不求值),每段连续行前加 `# == <来源文件>[, patched by <层>]` 注释;来源归属通过对快照序列(base、base+层1、……、全层)逐位 diff 得出;未命中的 patch 按层标签告警到 stderr,镜像 boot 时 Loader 的告警。`docs/architecture.md:29-30` 的承诺因此可自检:"Any row it prints can be replaced by a patch of your own."

配套参考:`docs/config-catalog.md` 是生成的**部署轴配置目录**(`scripts/gen-config-catalog.ts`,`pnpm run verify-config-catalog` 验新鲜):每个可加载 harness 包的 config 类型声明逐字粘贴(含 JSDoc 与引用类型),`Requires:` 行列出该插件 `inject` 的服务键;生成器还会把运行时 schemastery schema 与粘贴声明交叉核对——schema 验证的每个键必须能在声明类型上定位,粘贴藏不住 loader 可接受的字段。

---

## 5. settings 与 credentials:两个能力配置 seam

### 5.1 settings(`ctx.settings`)

Service Definition 在 `packages/settings/settings/src/index.ts`:provider 存一份**按 namespace 分节的原始文档**,插件注册 namespace schema 并读取解析值;解析分层为 **schema 默认 → 注册方的组合 base → 用户文档节**(index.ts:1-6, 35-45)。要点:

- namespace 是小写 kebab-case 品牌类型(`/^[a-z][a-z0-9-]*$/`,`settingsNamespace`,index.ts:19-31);
- `SettingsScope`:`get()` / `watch(cb)`(按提交序逐个异步调用,拒绝被包容)/ `update(patch)` / `replace(section)`(`replace({})` 全重置;非 JSON 值在任何持久化之前按路径拒绝,index.ts:100-128);
- `validate` 钩子拒绝 schema 表达不了的跨字段约束:拒绝的是产生该值的**写入**,调用方在 update 时即得知;已注册后外部改坏的文档保留最后好值并告警(index.ts:46-62);
- 描述面 `describe` 支持 `redactSecrets`:schema 声明 `role('secret')` 的字段从 value/base/user 中剥离——一切 wire 面必须传此选项(index.ts:93-99);
- provider `dsh-settings-file` 落盘 `$DSH_HOME/settings.yaml` 并热重载(base 行 `settings` 注释):`llm-deepseek:` / `llm-pi-ai:` 节可免重启覆盖适配器条目,Web Models 页写的就是它;`llm-pi-ai` 适配器休眠挂载,settings 供给 provider profile 后路由活注册、节清空后再落下——**哪些适配器存在是组合,哪些 provider 跑是用户设置**(base patch 90-97 行注释)。

### 5.2 credentials(`ctx.credentials`)

Service Definition 在 `packages/credentials/credentials/src/index.ts`:settings 与组合文件里只放**引用**(环境变量名),provider 拥有真值与存储。

- `CredentialRef` 是 POSIX 标识符品牌类型(`/^[A-Za-z_][A-Za-z0-9_]*$/`,index.ts:15-28);
- **每次操作重新解析**(`resolve`),消费者不得跨操作缓存——凭据变更免重启到达下一次操作(index.ts:66-74);
- `describe` 只暴露 configured/source/writable,不暴露值(index.ts:37-43, 76-80);
- `set`/`unset` 在被只读源遮蔽时拒绝(写入看似成功而解析仍返回遮蔽值),空值用 `unset`;seam 级规则:空存储值处处视为未配置(index.ts:55-99);
- 提交后扇出 `credentials/updated`(emit),监听器失败被包容,仅 `INVARIANT` 码失败重抛(index.ts:104-120)。

provider `dsh-credentials-local`:继承环境 > 受管 `$DSH_HOME/.credentials.yaml`,另有项目/用户 `.env` 兜底;适配器按请求解析引用,Models 页只写受管文档,**从不物化进进程环境**(base 行 `credentials` 注释)。

---

## 6. preset:每会话 agent 组合

`packages/preset/agent-presets`(`ctx.agentPresets`)把组合粒度从进程降到会话(README 与 `src/{discovery,mount,preset,session}.ts`):

- **preset = 一个目录 + 一份 `agent.cordis.yml`**(agent 平面组合)。roster 每进程挂载一次于常驻 scope,指名它的会话把 agent scope key 挂到该 mount 之下加入;mount 的工具/prompt 段/投影单元只存在一份,覆盖所有加入的 agent(插件按 Session/Agent 键控状态)。
- **服务行必须进 `isolate` realm 的 group**,否则发布进根 realm 造成进程级冲突,mount 时拒绝(standard preset 头注释,`apps/cli/config/agent-presets/standard/agent.cordis.yml:11-19`);`true` = entry-local realm。哪些行留 host 平面、哪些进 preset realm,该文件逐段注释(jobs 注册表、goal 服务、subagent 注册表留 host;compaction/workflow 入 realm)。
- 服务 API:`list()` / `resolve(id?)` / `mount(agentCtx, id?)` / `composeFrom(agentCtx, parentCtx)` / `recompose(agentCtx, id)` / `copy(from, id)` / `remove(id)`;发现不做 memo,每次重读 root,运行中编写的 preset 免重启可见;坏 preset 以 `broken` 原因列出而非跳过(id 仍被磁盘占用,跳过会让用户无处删除)。
- **创作仅复制**:`copy()` 整目录复制(拒绝非 `[a-z0-9][a-z0-9-]*` id、已占用 id、未知来源),复制后收紧权限 0600/0700、解除符号链接、抹掉源 name 与 order。
- root:配置 roots 按序 + 派生的 `<dshHome>/.agent-presets` 用户 root(Config 表:`default` 必填、`roots`、`includeUserRoot` 默认 true);出厂 root 由 launcher patch 注入(§2)。
- 子代理经 `composeFrom` 绑定父的常驻组合而非重新 mount——同步、无组合失败模式、继承同一代组合文件;切换 preset(`recompose`)仅限未产出任何内容的 agent,网关在 wire 层强制执行(`agent-preset-locked`)。
- preset 行内的包名从 **host 组合**解析(用户 preset 在 home 下,Node 向上走查够不到 harness),相对路径仍从 preset 目录解析;`preset.yml` 只放展示元数据(name/description/order),id 是目录名、trust 来自 root,均不可在此写。

出厂 preset 四枚:`standard`(全功能)、`minimal`、`code`、`cordis`(带 skills,自指演示用),位于 `apps/cli/config/agent-presets/`。

---

## 7. hooks 桥:对接 Claude Code / Codex

`packages/hooks/` 三包:hook-protocol(共享线协议库:codec、matcher、merge、runner、detached 运行跟踪)、hooks-claude-code、hooks-codex。桥接对象是**未修改的命令钩子配置**;定制行为应使用同一扩展点上的原生类型化插件(`packages/hooks/hooks-claude-code/src/index.ts:1-9`)。

claude-code 桥的配置是标准 Claude Code hooks.json(`Config.configPath`,`pluginRoot`/`projectDir`/`defaultTimeoutMs` 可选,index.ts:45-77);`inject = ['shell']`(跑钩子必须有 shell;其余扩展点用 `ctx.get` 机会式读取,缺了也能加载,index.ts:42-43);钩子进程在 agent 会话工作区运行,`CLAUDE_PROJECT_DIR` 缺省即会话 workspace 并导出为环境变量(index.ts:144-150)。事件映射(逐条对到源码):

| Claude Code 钩子 | dsh 落点 | 决策映射 | 出处 |
|------------------|----------|----------|------|
| `SessionStart` | detached 执行(emit 形态),可注入上下文 | — | index.ts:207 |
| `UserPromptSubmit` | `agent/pre-step` waterfall | PreStepDecision(拒绝/改写进入模型的消息) | index.ts:217-222 |
| `PreToolUse` | `tools/pre-execute` waterfall,matcher 主语 = 工具名 | `deny` → deny | index.ts:237-241 |
| `PostToolUse` | `tools/post-execute` waterfall | block + feedback 文本 | index.ts:246-252 |
| `Stop` | `agent/turn-stopping` serial | 停 turn | index.ts:271 |
| `SubagentStart` / `SubagentStop` | subagent 生命周期(detached);Start 可注入子上下文 | — | index.ts:279-294 |

每次钩子执行写 `hook/invoked` / `hook/result` 会话事件对(有开放 turn 时);`updatedInput` 记录告警但不采纳;卸载经 `ctx.effect` 排空所有活跃钩子(index.ts:122-127)。hooks-codex 同构,二者同时出现在事件矩阵的 `agent/pre-step`、`tools/pre-execute`、`tools/post-execute`、`agent/turn-stopping`、`agent/session-start`、`subagent/start|end` 监听器列表里(`docs/event-producer-consumer.md`)。

---

## 8. self-modification:agent 挂载自己的插件

`packages/extensions/`(组 README 定位:"Agent runtime self-modification"):

| 包 | 角色 |
|----|------|
| `cordis-host-runner` | Host 半边:`DynamicCordisRunnerService`(`ctx.dynamicCordisRunner`,src/index.ts:82-87)——不可变 package 定义、每 Plugin 至多一个活跃 run、**Client 半边激活需人类批准**、Host/Client 双侧调用;Host 代码经 `precheckCode` 预检、在 `createSandbox`/`evaluateHostCode` 的 vm 沙箱里求值(src/sandbox.ts) |
| `tool-cordis` | 模型面工具集:inspect/define/run/stop/undefine + 专用 prompt 段 |
| `cordis-client-runner` | 浏览器半边运行时(evaluator/orchestrator/guard/slot-catalog) |
| `ui-cordis` | Web 面板:CordisPanel/Define/Run/Action 行、动态端口、清单视图 |

事件面:`cordis/request-run(-resolved)`、`cordis/dynamic-package`、`cordis/dynamic-retract`、`cordis/inspect-query(-resolved)` 六个 emit 事件,apiproxy 是唯一监听器(事件矩阵)。web-app bundle 挂载 `cordis-host-runner` 行;产品入口 `pnpm run demo:cordis` 与 `examples/web-cordis`。配套细节:boot 后 `addHarnessSourceSection`(`packages/boot/app-boot/src/index.ts:805-829`)向全局 system prompt 注入 `harness:source` 段(order -99),告诉模型 harness 源码 checkout 位置并区分 checkout 与工作目录——自指工具集读写的是这个 checkout。图数据里 `DynamicCordisRunnerService.run` 出现在 proc_12-20 执行流("agent 挂载自己的插件"路径,`00-graph-atlas.md` §4)。

---

## 9. profile 之外:raw 组合与快照

examples 不走 profile,直接给叶子 `cordis.yml`(如 `examples/headless-agent/cordis.yml`:settings、credentials、llm-deepseek 等行内联,注释说明"entry configs here are the composition base, user-plane values resolve per request")。`examples/package.json` 声明所有叶子插件的 `workspace:*` 并集,任何叶子的 plain-node 启动都能经真实包 `exports→lib` 向上解析(`pnpm-workspace.yaml:14-19` 注释)。

每个叶子配有 `cordis.snapshot.yml` 孪生:`resolveConfigPath`(app-boot/src/index.ts:62-70)在 `$DSH_SNAPSHOT=replay` 时把 `cordis.yml` 换名成同目录的 `cordis.snapshot.yml`——回放用冻结组合;`record`/`refresh` 生成/更新快照(`package.json` 的 `test:snapshot*` 脚本族)。web 性能测试就在 `DSH_SNAPSHOT=replay` 下跑(`test:web:perf:built`)。

---

## 10. 小结:配置写在哪里

| 想改什么 | 写哪里 | 生效方式 |
|----------|--------|----------|
| 换/禁/加插件行,全局机器级 | `$DSH_HOME/cordis.patch.yml` | 下次启动;活进程 HMR 热重载 |
| 只改某个 profile | `$DSH_HOME/profiles/<name>/cordis.patch.yml` | 同上 |
| 一次性试验/部署覆盖 | `dsh --patch overlay.yml`(可重复) | 仅该次调用 |
| 模型路由/思考强度等 provider 参数 | `$DSH_HOME/settings.yaml` 对应 namespace 节 | 热重载,免重启 |
| API key | 环境变量或 `$DSH_HOME/.credentials.yaml` | 每次请求解析 |
| 每会话工具集/prompt 段 | preset 目录(`agent.cordis.yml`,copy-only 创作) | 新会话生效 |
| Claude Code/Codex 钩子 | hooks.json + hooks 桥插件行 | 桥插件加载时读一次 |
| 组合结果自检 | `dsh --profile <name> --dump-config` | 免启动打印 |

三条设计收敛:**id 是唯一地址**(行、patch、dump、诊断全用它)、**替换而非合并**(层序纪律简单可推理)、**表达式惰性求值**(`!!js` 在依赖就绪后于行自己的上下文解析,`disabled` 例外)。同一套原语向上支撑 profile/preset,向内支撑运行时自修改——组合机制与产品能力的边界在这里重合。
