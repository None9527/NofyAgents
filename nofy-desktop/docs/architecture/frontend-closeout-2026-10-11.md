# 架构收口与性能验收门

2026-10-11。此次整体收口设置命令、窗口布局/浮层/动作清单、共享控件和可复跑验收，不将阶段名等同于全部架构债务已清零。

## 落地

SettingsClient 增加 models、credentials、catalog。ProviderSettings 只提交窄配置 patch，原 native CAS、忙碌/审批保护与单内核重启不变；认证写入、认证请求、模型刷新和 bundle 单项详情移入 application/settings/operations.ts。页面不再调用 Runtime.effect、bridge 或 native 配置读写方法。

凭据流程先检查连接并共享一个事务锁。只有内核明确确认保存且连接仍属同一代际才通知表单清空；认证和刷新之间再次检查代际，旧连接不能继续串联命令。认证失败保留“凭据已保存”的事实。authInfo 清单只返回 methodId，其他字段不进入查询缓存。

模型快照类型从设置公共接口导出，移除 ProviderSettings → preload 的存量例外，精确预算 15 → 14。新增 AST 边界测试覆盖整个设置 TSX 目录，阻止直接 property access 到 effect/bridge/native 配置方法；这不是完整的数据流安全分析。

ShellLayout 接管侧栏/右栏宽度、拖拽捕获和布局插槽；OverlayHost 接管历史搜索与命令中心的呈现；windowActions 接管窗口动作定义。App 从 695 行降到 518 行，仍协调跨区域窗口状态与启动，不为了过行数线拆出重复上下文。MCP 命令中心入口改为实际打开已有分区。

ModelSettings、BundleSettings 使用共享 Btn/Field/TextInput；通用设置选择框使用 SelectControl。最后一批 set__write 使用点和兼容 CSS 选择器已删除，七个样式模块的 selector 所有权检查继续通过。

## 本机性能门

performance-budget.json 定义门限，pnpm verify:performance 构建后顺序启动三个隔离生产 Electron 样本。每个样本测试 1000/10000 块，各录制 20 次输入，既检查单次 p95，也检查各规模汇总 60 次输入的 p95。

| 门限 | 配置 | 本次观察 |
| --- | ---: | ---: |
| 输入事件到下一次 RAF p95 | ≤33.4ms | 1000 块 14.7ms；10000 块 15.1ms |
| 挂载消息块 | ≤200 | 每次 22 |
| 流式 App 渲染 | ≤8 | 每次 5 |
| 流式 Composer 渲染 | ≤8 | 全部通过 |
| 输入 longtask | <50ms | 全部通过 |
| 模拟语料加载 | ≤5000ms | 全部通过 |

同时保留历史 Markdown 输入不重解析、后台会话不绘制前台/静态设置、无渲染反馈循环等断言。指标是输入事件到下一次 RAF，不是 INP、真实屏幕呈现延迟或网络模型延迟。

门限限定本机 macOS arm64、生产构建、1440×900 和确定性 ACP 语料；本次为 Apple M4、24 GiB、Node 24.16。其他平台须先录制基线，不套用本机阈值。未测精确进程/图片峰值内存、巨型单回合或全部工具类型的性能预算。

[三次原始记录](benchmarks/2026-10-11-performance-gate.json)包含环境、独立报告路径和各次/汇总数值；失败门限会使进程返回非零。此门由专用命令执行，不混在含构建/GUI 并发负载的普通 verify 中。

## 可复跑与验收

playwright-core 1.59.1 已成为桌面包精确锁定的 devDependency，GUI 默认使用独立依赖；playwright-driver.mjs 兼容显式指定的 ESM/CJS 驱动。干净检出安装依赖后即可复跑，不依赖参照仓库的 node_modules，也不下载浏览器镜像。GUI 直接启动项目安装的 Electron。

pnpm verify 通过：395 项单测（ACP 41、desktop 354），其中新增 8 项设置操作契约和 1 项 AST 边界测试；类型、样式、架构、夹具、构建及协议 7、PTY 8、恢复 11 均通过。

独立驱动下五组 GUI 68/68，无 pageerror：设置 20、文件 17、对话/审批 11、项目/会话 11、虚拟化 9。预算三次通过。本地 macOS 包两次隔离启动通过并回收内核；ad-hoc 签名、内核不捆绑。路径和校验见 [交付证据](frontend-closeout-evidence-2026-10-11.json)。

现有 GitHub Actions 的 architecture:check、ui:check、typecheck 和 test 会覆盖新增门；没有执行远端 CI，也没有宣称远端 GUI/性能已通过。性能门目前为专用本机验收命令。

## A0–A6 状态

| 阶段 | 当前事实 | 保留边界 |
| --- | --- | --- |
| A0 | AST 模块/依赖门、精确存量预算已运行；45 → 14 | 14 条例外各有原因与迁移出口 |
| A1 | 设置命令/查询已进入公共服务，页面有 AST 守卫 | 其他旧面板与 core Runtime 的传输类型仍有存量依赖 |
| A2 | 应用用例/资源 hooks、ShellLayout、OverlayHost、动作注册已分离 | App 保留启动与跨区域协调、窗口导航历史；未宣称极小根组件 |
| A3 | 局部订阅、稳定导航/轮级模型、审批/队列独立容器已验收 | 行索引/agent source 仍有 O(n) 扫描与内核事件投影数组拷贝 |
| A4 | 目标设置页共享控件、兼容按钮删除、共享样式门有效 | 自定义主题/布局控件仍有各自呈现，静态检查不替代视觉审查 |
| A5 | 动态轮级虚拟化、查找/滚动/弹窗保留及 10000 块通过 | 单个巨大展开轮尚无轮内虚拟化，完整历史仍驻 store |
| A6 | 全量本机校验、68 GUI、三次预算门和包证据可复跑 | 远端执行、多平台、精确内存、Developer ID/notarization 未验收 |

下一步依据实际使用中的问题选择模块，不继续在已迁移入口堆叠零散功能。剩余存量边按 architecture-policy.json 的明确对象下降，不能改成目录永久豁免。
