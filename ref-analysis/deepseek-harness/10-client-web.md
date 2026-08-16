# deepseek-harness 客户端与 Web 栈深度解析

一句话概述:dsh 的 Web 前端不是一个"应用",而是一棵由 host 在启动时组装的浏览器插件树——内核只做装载与渲染缝合,会话状态由 host 折叠成整值投影推送,所有 agent 操作经 `/api` 上的双协议网关(legacy API Proxy + Typert Remote)到达 `ctx.agents`。

> 路径均相对 `ref/deepseek-harness/`。图证据引自 `ref-analysis/deepseek-harness/00-graph-atlas.md`(client 是唯一大消费者:client→todo 303 条 IMPORTS、包内自调用 6,560 条全仓第一)。

---

## 一、client 包结构:39 个子包,一个命名前缀

`packages/client/` 没有根 package.json——pnpm-workspace.yaml 的 `packages/*/*` glob 直接把每个子目录当作独立 workspace 包,统一命名 `@deepseek-ai/dsh-client-<name>`。
39 个子包按职责分四层:

| 层 | 包 | 职责 |
|---|---|---|
| 装载内核 | `web/`、`modules/`、`web-react/` | 两阶段 boot、懒加载 CJS 模块表、cordis↔React 缝合 |
| 运行时服务 | `runtime/`、`connection/`、`locale/`、`schema-form/`、`hmr/` | 会话/工作区数据层、RPC 通道、i18n、设置表单、热替换 |
| UI 基座 | `ui-slots/`、`ui-theme/`、`ui-primitives/`、`ui-layout/` | 槽位系统标准、`--dsw-*` token、共享控件、主区域布局 |
| 功能插件 | 30 个 `ui-*` | 每个 UI 领域一个包(ui-conversation、ui-tool、ui-sidebar、ui-settings-*…) |

测试基建 `test-runtime` 不在 client/ 下,而在 `packages/test-support/client-runtime/`——图里 client→test-support 是全仓唯一跨包 CALLS 边(119 条),即测试替身。

组合纪律写在 `packages/client/AGENTS.md`,核心是**槽位系统标准**:

- 插件只能通过 `ctx.slots.register({ name, children?, store?, inject? }, Component)` 组合 UI,没有第二个组合入口;
- `children` 既是声明也是授权:渲染未声明的槽位、或声明别人已声明的槽位,都在装载期失败——"冲突是设计在说话,不要绕过它";
- 槽名镜像组合路径(`<domain>.<entry>.<hole>`,如 `'tool.call.toolview'`);
- 组件 props 是四个"份额"派生类型(`PropsRuntime`/`PropsRenderSlots`/`PropsStore`/inject face),禁止手写份额已派生的成员;
- 钩子是框架制造的:`useSession`/`useSessions`/`useWorkspaces`/`useStore`/`renderSlot` 五个常设席位加 inject 绑定的 `use<Name>`,业务代码从不把钩子当 prop 传。

活数据只有三条通道:父级知道 → renderSlot 处的 owner props;只有自己知道 → 局部 state;跨入口或跨重挂载 → register 时声明的 store。
**业务组件内禁止任何订阅机制**(无 `useSyncExternalStore`、无手动 subscribe、无把外部快照镜像进局部 state)——反应式事实要么走 inject 的 `hooks` 舱位(裸 observable,渲染器绑定成 `use<Name>`,组件永远看不到源),要么走声明 store,要么走 `sessions.provide`。

导出纪律同样极端:UI 插件除了 cordis 装载所需的 `apply`/`inject`(及被类型消费的 store 工厂)外不导出任何值;新增任何值导出需要 user sign-off,"而不是一个匹配的消费者"。
跨包 import 另一个插件的符号原则上禁止,合法路线只有槽位系统与 ctx 服务;两者都不合适时"停下来上报,不要靠加导出解套"。

## 二、两阶段 boot:host 推图,浏览器不做组合决策

`apps/web/src/main.ts` 全部 10 行,只做一件事:`new AppWebEntry(el).run()`。
一切装载逻辑在 `@deepseek-ai/dsh-client-web`(`packages/client/web/`):

1. **Stage one(module face)**:解析 host 注入的 `window.__DSH_BOOT__` 入口图,并行预取 `immediately` 层;bundle 执行只注册工厂。
2. **Stage two(plugin face)**:挂载 vendored cordis Loader,每个图行建一个 loader entry,外加 shell 自有的 app-shell 伪 entry(唯一经 `registerStatic` 注册的模块);AppRoot 在 settle(loader 静止 + 全部 entry fiber ACTIVE)后**一次性**切换出完整 UI。

入口图由 host 侧的 `ctx.clientModules`(`packages/client/modules/`,子系统文档 `docs/subsystems/client-modules.md`)组装:扫描 Loader entry 中声明 `dsh.client` 的包,生成 `WebBootGraph`(每行 `{id, url: '/plugins/<id>/client.js?rev=<hash>', rev, inject?, immediately?}`),作为 `<head>` 第一个 script 注入(`<` 被转义防插件控制的字符串逃逸 script 元素)。
图是 Node 半与浏览器半之间的**唯一 wire 单一事实源**;没有合法 manifest 的页面直接抛错,无法 boot。

扫描是增量式的:每次 cordis `internal/plugin` 发射只把对应 entry 名标记 dirty,微任务 flush 对账;激活期与稳态共用一套实现但**失败姿态相反**——激活时坏包聚合成一个 `AggregateError` 让 fiber 失败,稳态时坏包只记警告、不得毒化其他包。
包元数据(包括"不是 client 包"的否定判定)按名缓存且永不过期:插件集变更在重启时生效。

两个 boot 纪律值得记录:

- **激活顺序不靠图行顺序**,靠 cordis fiber inject 对*服务*的等待;`dsh.client` manifest 里的 `inject` 依赖边只是信息性的(preflight 展示、HMR diffing);
- **内核自足是硬规则**:shell 不 value-import 任何插件包,boot 状态存储手写(`loader-status.ts`),保证插件失败时加载页仍然工作;单个 entry 失败 → 停留在加载页并逐条大声报告,**没有部分可用**(渐进渲染是另一个项目)。

`apps/web/vite.config.ts` 内置 `rejectStandaloneServe` 插件:裸 `vite serve` 直接抛错——apps/web 不是独立应用,没有 host 就没有 boot manifest。
vendor chunk 策略按精确包名维护 `VENDOR_PACKAGES`(katex、shiki、micromark/mdast 全家),且每个成员必须 React-free:rollup 会把入口与 manual chunk 共享的模块折进 manual chunk,一个 import react 的成员就会把唯一的 react 副本拖进 vendor。
编辑 shell 代码只重哈希 index chunk,回访客户端保住 vendor 缓存。

## 三、会话投影:host 是唯一计算点,client 只存整值

这是 dsh 前端最有特色的设计,分两侧。

**host 侧 seam**(`packages/session/session-projection/`,`docs/subsystems/session-projection.md`):领域插件注册一个 `ProjectionDefinition`——`init()`/`apply(state, event)`/`view(state)` 三个**纯同步**函数加 `schema`/`stateVersion` 声明。
注册表订阅一次 `session/event`,把每条已提交事件 fold 过所有 unit;领域不持有订阅,客户端从不 fold 领域事件——"框架驱动,领域计算"。
整值事件规则是承重墙:携带状态的事件携带完整变更后状态,从不发裸 delta,这让每次转移平凡便宜、每个服务值自描述(消费者 last-wins)。
`stateVersion` 是持久化缓存的失效版本:序列化状态字段或 fold 语义变化时递增,旧行被丢弃而不是前向应用成垃圾。

**client 侧存储**(`packages/client/runtime/src/client/sessions/projection-store.ts`,201 行):`ProjectionValueStore` 是 push 模型的 `key → { value, seq }` 表,唯一规则 **higher seq wins**:

```text
seed(baseline)    ← history 尾页的 projections 块(asOfSeq = 一致切面)
apply(key, v, seq) ← session/projection 推送帧
truncate(lastSeq) ← mux 换代基线(subscribed.lastSeq)
```

三个细节值得注意:

- `apply` 中 `seq <= row.seq` 直接丢弃——重放帧不能让值回退,过期基线不能覆盖新帧;
- `seed` 对基线未携带的 key 做清除,但 `row.seq > baseline.asOfSeq` 的行保留(过期基线既不能覆盖也不能清除更新值);
- `truncate` 处理重启:声称知道 host 持久基线之后状态的行"骑着重启丢失的状态",在 last-wins 下会永远压倒 host 重算的低 seq 值,所以直接丢弃,由持久回放与下一个基线重新播种。

每个 key 一个身份稳定的裸 observable face(`faceOf`,按需创建并缓存),喂给第五个框架钩子席位 `useProjection`(`undefined` 统一表示能力缺席,组件可以在 key 从未有值之前订阅);`subscribeAny`(微任务批处理的 any-key 通道)服务粗粒度消费者。

**所有权**:经 `SessionManager` 构造时 store 是 manager 拥有的(帧先路由到 manager,值比实例活得久——"title-snapshot 先例的泛化",manager.ts:126),列表行在 Session 未实例化时也能读 `title` key;裸构造得到私有 store。
manager.ts:337 处 `store.subscribeAny(() => this.notifier.markDirty())` 就是列表重建通道。
类型表 `SessionProjectionMap` 端到端贯通(host unit、wire 块、client store、React hook),且刻意只从 Service Definition 包的纯类型出口 `/types` 导入——根出口会把 host 的 `Context.sessions` 合并拖进浏览器程序,"一个程序不能同时持有两侧"。

## 四、Session 对象:事件窗口之上的派生状态机

`packages/client/runtime/src/client/sessions/session.ts`(805 行)是数据层心脏。
构造器签名注释:"client sessions are always Host-born"——客户端从不铸造会话身份。
关键结构:

- `events: SessionEvent[]` 事件窗口 + `views: (ToolEventView | undefined)[]` 按索引对齐的 wire 视图——保持平行而不合并,"让 events 保持原始日志切片(model-visible ⟺ logged)"(session.ts:69);
- `ConversationNodeAssembler` 把连续原始窗口折叠成会话节点树;`Notifier` 的 flush 回调重建唯一读 API `ConversationSnapshot`;
- 分页 `PAGE_MESSAGES = 50`,`session.history` 按 append-origin 消息边界分页,一页永远是一段连续原始事件范围(压缩的 `compaction/summary` 记录与引用它的替换同页);
- 重连语义靠 `openGeneration` 代际号:resync 使在途 doOpen 失效,"重连必须重建,绝不采纳断线前已注定失败的 open";过期 doOpen 在代际前进后丢弃全部写入;
- live 事件在 open/resync 期间进 `liveBuffer`,history 落地后按 seq 缝合;`subscribed.lastSeq` 做缺口检测,缺失时降级为 liveBuffer 去重路径;
- `actx` 是 SessionRuntime 铸造的 agent 作用域 cordis context(单次写入,二次绑定抛错),是 host Agent `loopCtx` 的客户端镜像;
- `projections` 即上节的 store;`ConversationSnapshot` 永不携带投影值——两条数据通道不混流。

输入区形态是派生状态机 `ComposerPhase = 'blank' | 'engaging' | 'active'`(conversation.ts:355):`promptAttempted` 粘性标记在 prompt() 首个 await 前同步置位且永不复位,是 blank→engaging 的相位边;首个被接受的 prompt 在其 turn 可观察前保持 engaging。
会话常驻是明写的设计("Sessions remain resident after creation so they continue consuming mux frames off-screen")。

渲染侧(`packages/client/ui-conversation/`):聊天行业务行不是封闭内置联合,而是独立注册贡献——插件 declaration-merge 一个 `ChatNodeDataMap` key、注册 `ConversationNodeDefinition`、再注册对应 key 的渲染器到 `conversation.chat.node` 槽,**不修改 Session fold,也没有中心渲染 switch**。
审批走 composer 接管链(`ApprovalPanel` 作为 selector-routed 条目),问题(ui-user-questions)同样接管 composer——"pending 等待完全离开消息流,不留展示用占位卡"。

## 五、host apiproxy:一个 `/api` 路由,两代 RPC 网关

**契约层**(`packages/host/apiproxy/src/api/`,零 Node 依赖、浏览器可 import):wire 消息是"谁发起 × 请求/响应"四象限判别联合——`ClientRequest`(POST `/api/<method>` 体)、`ServerResponse`、`ServerRequest`(下行帧)、`ClientResponse`(POST `/api/respond` 体),与物理通道解耦。
响应永远回显匹配请求的 `rpcId`,从不新铸。

`RpcMethodMap` 注册全部 **52 个方法**,按域分布:session 12、workspace 7、goal 6、agentPreset 6、settings 5、host 5、subagent 4、llm 3、credentials 3、skill 1。
参数/返回结构全部从领域接口签名(`SessionsApi` 等)经 `RequestPayload<K>`/`ResponseValue<K>` 派生——方法表之外无第二份结构声明。
Zod 锚定 `satisfies z.ZodType<Wire<T>>`,两级解析:先 envelope 再业务 payload。
业务错误走 `RpcResult` 的 error 分支(`RpcErrorDetailsMap` 封闭错误码集),HTTP 状态只表达 carrier;每个 POST 必须声明 `application/json`,否则 415——跨站"简单请求"不带 CORS preflight,永远无法盲执行副作用方法。

**网关实现**(`src/api-proxy.ts`,3,744 行):`ApiProxyService` 提供 `ctx.apiProxy`,本身不注册路由,由 carrier(webserver)包裹。
它是前端驱动 agent 的翻译层,典型如 session.create 路径(api-proxy.ts:1620-1690):

```text
session.create(sessionId, cwd, presetId?)
  ├─ ctx.agents.get(sessionId) 命中 → 直接返回 live agent
  ├─ 持久层有该 id → inspect:cwd 冲突抛 SessionCwdConflict;
  │   存储的 preset 从日志解析(不是 header)且压倒请求参数
  │   → ctx.agents.resume(存储组合)   // 换组合会重放模型已无法再调的工具
  └─ 否则 mkdir(cwd) → composeAgent(presetId) → ctx.agents.create
```

并发安全:创建在 `sessionCreations` map 里去重,异步步骤跨越期间另一条 host 入口可能已发布同一身份,catch 分支重查 live/attached 而不是盲目抛错。
网关还自带两个投影 unit:`sessionListMetadata`(缓存 blank→非 blank 单调转变与最近人类提问时间)与 `imageLimits`(把 prompt 准入执行的附件配置作为 per-boot 常量发布,客户端在提交前拒绝超限摄入)。

会话日志导出是 host-only 下载面而非 RPC:`GET /api/session.export` 流式输出 ZIP,文件是各会话**存储工件的逐字节原文**(持久化后端的 `readRaw`,不是从解析事件重建),子代理后代在 `subagents/<id>/` 下,引用图片在 `media/` 下;fflate 流式压缩(0-9 级可配,默认 6),响应队列到 64 KiB 高水位就等消费者拉取,host 永不整包驻留。

**Typert 一代**(`packages/typert/` 四件套 registry/loader/generator/protocol + `packages/api/gateway/`):业务 Service 继承 `TypertRemoteService` 并用 `@Remote`/`@RemoteScope` 装饰器标记方法;generator 从源码类型生成 `InvocationDescriptor`(本地反射,不是 wire 消息,请求只发端点 + 命名 args);host 侧 `ctx.typertGateway.invoke()` 校验命名参数、解析 lookup 身份、调用业务方法、校验结果。
strict codec 携带生成 schema,SRC codec 是开发期降级(只接受 JSON-safe 值);**撤回已观察到的 strict 定义会失败而不是放松校验**。
类型表 `TypertLookupMap`/`TypertContextMap` 靠 declaration merging 扩展:provider 卸载后 wire 声明保留——SRC 发现继续把参数归类为 lookup 并失败为 unavailable,而不是把 wire 值当普通业务对象收下。
取消是带外信号:`signal: AbortSignal` 作为最后一个 Host 参数,是描述符元数据而非 wire 参数。

两代网关共享一条 `/api` 路由:`packages/client/connection/src/rpc-host.ts` 维护每通道一个 interceptor,**Typert interceptor 先认领其 Remote 端点,未认领的落回 API Proxy fallback**(packages/api/README.md 明说 apiproxy 是"legacy……methods not yet migrated to Remote";它消费 api-remotes 的 Host resolver,两代方法保持同一 Agent/Session 身份策略)。
运行时依赖方向固定:`remotes → gateway → connection → webserver`。

**浏览器信任栅栏**(`packages/client/connection/src/api-request-trust.ts`):每个 `/api` 请求必须出示 loopback 或 `trustedHosts` 匹配的 `Host`(WHATWG 规范化双侧比较,防 DNS rebinding);刻意不为"无标记 HTTP 请求"开后门——纯 HTTP 下浏览器对图片/导航读既不附 Origin 也不附 Fetch-Metadata,而 Host 是 rebinding 无法伪造的唯一头。
`trustedHosts` 条目若不是裸的规范化 `host[:port]`(WHATWG 解析回读必须与书写完全一致),插件加载大声失败——否则解析会悄悄授权 `harness.internal/path` 里的主机名。

特权方法集(`host.pickDirectory`、`host.openPath`、整个 settings/credentials 平面、agentPreset 的 read/copy/openDocument/remove)被钉死在 loopback:组合命名了一个会话要跑的插件,读它是侦察,copy/remove 管理名册并驱动 host 桌面。
`agentPreset.list/select` 留在外面——名册只带 id 与信任度,选 preset 授予的不过是 `session.create` 自己的 `agentPreset` 参数本来就给的。
`dsh web --host 0.0.0.0` 在认证层出现前刻意不支持;栅栏是 reachability 策略,不是认证。

**下行通道**:两条只下行 WebSocket——`/api/events.mux`(会话事件流)与 `/api/events.host`(host 事件);客户端在 socket 上不发送任何应用数据。
任一 socket 断开 → 当前 connection generation 失败并重建双流;readiness 要求双 socket 均开且 `host.describe` HTTP 成功;host 拆除时终止双 socket、中止源、等待源清理后才返回。
普通 GET 这两条路径返回 426,无 SSE 降级(SSE codec 只服务同构的进程内 carrier)。

## 六、前端如何驱动 ctx.agents

浏览器从不直接触碰 `ctx.agents`——它经 RPC 网关间接驱动,路径有三类:

| 用户动作 | RPC | host 落点 |
|---|---|---|
| 新建/打开会话 | `session.create` | `ctx.agents.create/resume`(preset 从日志解析并压倒请求) |
| 发消息/转向/取消 | `session.prompt`/`updateQueue`/`cancel` | agent `send`/inbox;结果经 mux 帧回流 |
| 换 agent 组合 | `agentPreset.select` | 仅 blank 会话允许;跑过 turn 后 `agent-preset-locked` |

`ui-agent-preset`(`packages/client/ui-agent-preset/README.md`)把这个约束做成三个表面:

- General 设置行选"新会话默认 preset"——不是活开关,文案直接说明只影响之后的会话;
- 新会话屏上的 chip 是**暂存**的:屏先于会话存在,stage 在会话变为 current 且仍 blank 时兑现(覆盖 workspace connect 新建与复用 blank 两种情形),首次使用即耗尽,下一个新会话回到默认;
- 会话头只有只读标签,"在那里放控件等于承诺一个 host 直接拒绝的切换"。

preset 创作是 copy-only:浏览器不编辑任何组合文本(在 web textarea 里编 YAML 是弱表面——无补全、无高亮、无 diff),`{ from, id, name? }` 就是全部过 wire 的内容;其余在 preset 自己的文件里编辑,页面的另一个职责是把用户*带到*那些文件(copy 完成即打开新目录)。
host 无桌面 opener 时同样的动作把目录作为文本返回,而不是给一个点了没反应的按钮。

列表投影也走同一原则:`session.list` 里冷会话保持纯元数据,直到打开或 resume 才附日志;标题走通用投影对(`title` key 的基线块 + 推送帧),`session.rename` 返回规范化标题加事件 seq,让客户端在推送帧到达前就安定自己的 `title` 投影格。

## 七、styling 体系:token 两层,组件 CSS Modules

`docs/web-styling.md`(25 行,核实与源码一致)定义所有权:

- `ui-theme` 独占 `--dsw-*` 静态刻度(`src/styles/design-platform.css` 中如 `--dsw-static-amber-500`)、`--dsw-alias-*` 语义别名、排版/动效/渐变/阴影/滚动条/明暗偏好;五份样式表(base/design-platform/scrollbar/gradient-shadow-text/shiki)全部由 web shell 的 base.css 导入;
- `ui-layout` 把解析后的 `ThemeSnapshot` 应用到 document(`html { color-scheme }`、`body[data-ds-dark-theme]`、内联 alias token);ThemeRuntime 自己从不碰 DOM,只发 `theme/change` 事件;
- host 侧还有同步 bootstrap:HTTP server 组合存在时,每个 index 响应在 `<body>` 开标签后立即注入内联脚本(嵌入 `ui-theme.preference` 设置值),让暗色在 shell 加载页渲染前就位;
- 功能包只消费语义别名,不定义第二套全局主题,不写字面色值;组件样式 = 与组件同址的 CSS Modules + `clsx`;**不引入组件库,不引入 Tailwind**;
- 主题选择器不允许出现在功能组件 CSS 里;inline style 只可传组件局部 custom property 值,不可编码主题分支;源码/终端/diff 行在组件契约要求列保持时不换行。

滚动条是这套体系最较真的角落(ui-theme README):`scrollbar.css` 在 `body` 上绑定 `--dsh-scrollbar-thumb/-hover` 对,浮层表面在自己容器上重绑 l2 token,一次重绑重染引擎实际走的那条路径;标准属性路径与 `::-webkit-scrollbar` 伪元素路径用 `@supports not selector(...)` 做成构造上互斥——两条都无条件声明会让 Chromium/Safari 丢弃全部 webkit 滚动条规则,hover token 在任何地方都不渲染。

## 八、i18n:LocaleRuntime 与 ns×locale 字典注册表

`packages/client/locale/`(client 半 `src/client/index.ts` 392 行)提供 `LocaleRuntime`(图入度 33,前端 i18n 中枢):

- **偏好**:zh/en 存 `$DSH_HOME/settings.yaml` 的 `locale.preference`;Host 读在插件激活之后执行(settings 服务不可用不阻塞页面),读到前浏览器按 `navigator` 主子标签匹配临时语言(不匹配默认 zh),Host 值到达后活替换;远端浏览器只保留进程内选择,因为 settings API 是 loopback-only;切换发 `locale/change` 事件;
- **字典**:类型化的 `register(ns, {zh, en})` 对 `LocaleNamespaceMap` 做检查,`bind(ns)` 返回 `TranslateNS<ns>`;查表链 ns → common → zh → key;
- **接入**:实现槽位系统的 `LocaleFace`,经 `ctx.slots.installLocale` 安装,支撑框架注入的 `t` 标准席位(`Translate`/`TranslateNS` 类型在 ui-slots 定义,本包只为字典持有者方便而再导出);
- **已知边界**:注册期捕获的文案(如命令注册表里的 `/model` 描述)保持注册时语言直到重新注册;槽渲染路径的文案跟随切换。

产品文案中文、代码注释英文是 client AGENTS.md 的组件检查单条目;仓库层面的双语文档门禁(verify-translation-pairing)是另一套机制,见 [11-engineering-gates.md](11-engineering-gates.md)。

## 九、与 grok-build TUI 路线的差异

| 维度 | dsh Web 栈 | grok-build TUI |
|---|---|---|
| 界面宿主 | 浏览器插件树,host/client 两个程序 | 同进程 ratatui,crate 分层但同一二进制 |
| 组合机制 | cordis.yml 层叠 + `window.__DSH_BOOT__` 图 | 编译期 crate 依赖 + fn-pointer IoC 缝合 |
| 状态流 | host fold → 整值投影推送(higher-seq-wins) | Action → State → Effect,dispatch 纯同步 |
| 渲染优化 | 快照引用稳定 + uSES 绑定 + vendor chunk 缓存 | 检查点冻结 + 离线程渲染(mermaid/diff) |
| 远程能力 | 内建(loopback/trustedHosts 信任栅栏) | 无(终端本地) |
| 扩展 UI | 槽位注册,第三方插件可加视图 tab | 无插件 UI 概念 |
| 多会话 | 常驻 + 离屏消费 mux 帧 | 单会话焦点 |

两条路线的根本差异在于**谁是组合点**:dsh 把组合推到运行时配置与浏览器装载图,代价是 boot 链、代际重建、信任栅栏这类机制密度;grok-build 把组合钉在编译期,代价是任何界面变化都是代码变更。
dsh 的投影模式(host 折叠、client 存整值、seq 仲裁)对 grok-build 并非不可借鉴——TUI 的 ChatStateActor 事件广播与它在结构上同构,差的只是"整值 + 水位"这层纪律;而 grok-build 的检查点冻结渲染是 dsh 没有的 TUI 特有资产,两者互补而非替代。

---

## 核心发现

1. **client 是受纪律约束的组合点而非应用**:39 个子包、槽位授权、四份额 props、三条活数据通道、导出需 sign-off——图里 client 6,560 条包内自调用与近零跨包 CALLS 是这套纪律的投影。
2. **投影是 push 模型**:host 是唯一计算点(纯同步 init/apply/view),client 只有 `key → {value, seq}` 与 higher-seq-wins;`ProjectionValueStore` 201 行承载了基线/帧/换代三种一致性情形,store 所有权在 manager 让值比实例活得久。
3. **一个 `/api`,两代网关**:52 方法的 legacy API Proxy 是 Typert Remote 的 fallback,interceptor 认领顺序完成迁移;四象限 wire 联合 + 封闭错误码集让 HTTP 状态与业务错误彻底分离。
4. **前端驱动 agent 的每条路径都被 preset 约束钉死**:存储组合压倒请求参数、非 blank 会话拒绝换组合、创作 copy-only——历史由哪套工具产生,就必须由哪套工具继续。
5. **信任栅栏是 reachability 策略而非认证**:Host 头 + WHATWG 规范化防 rebinding,特权方法钉死 loopback,`--host 0.0.0.0` 刻意不支持——远程访问等待真正的认证层。
