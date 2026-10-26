# 前端架构基线与第一阶段落地

日期：2026-10-09。对应架构方案 A0 的模块盘点、依赖检查部分；性能基准、能力清单和 A1–A6 尚未全部完成。

## 固定边界

Nofy 内核独立并拥有自己的 TUI。桌面是 ACP 客户端，前端不实现 agent loop、不维护第二份权威历史。renderer/core 表示客户端投影与协议适配。

## 当前模块清单

| 模块 | TS/TSX 文件数 | 当前职责 | 下一步职责归属 |
|---|---:|---|---|
| main | 15 | 内核进程、连接、IPC、配置、宿主能力 | 保留；移除从 renderer 引用端口实现 |
| preload | 3 | typed bridge、宿主配置契约 | 保留最小 IPC；共用端口类型脱离 renderer |
| renderer/core | 11 | reducer、事件投影、命令分派、宽 Runtime 类型 | 保留客户端事实与协议强制点；拆出窄契约 |
| renderer/seam | 2 | IPC 适配、Runtime 装配 | 唯一装配点，不向页面泄漏原始 bridge/port |
| renderer/ui | 23 | 控件、主题、Markdown、偏好、reader 与 hooks | 基础 UI 留存；领域 reader/偏好分别迁移 |
| features/shell | 19 | App、导航、侧栏、草稿、轮询、会话组织 | 页面只装配；客户端用例迁往 application |
| features/conversation | 21 | 输入、消息、索引、动作、查找 | 容器/行模型/视图/列表分别组织 |
| features/settings | 11 | 设置导航、模型/MCP/插件/资源表单 | 查询与写入门面独立，注册分区与 dirty-close |
| features/approvals | 8 | 权限、计划、问答、MCP 交互表单 | 展示局部草稿；协议响应通过应用接口 |
| features/aux | 3 | 文件与 Diff 预览 | 保持领域隔离，暴露稳定入口 |

另有 renderer/main.tsx 启动入口；文件数是本次快照，不作为长期性能指标。application 尚未创建空目录或占位组件，迁移时按实际用例增加。

## 状态所有者与入口

- 内核事实：bind/project → reducer store。页面可订阅投影，不能重建工具执行与权限策略。
- 出站内核动作：runEffect。现有取消/队列 notification 与审批 respond 语义保持。
- 连接/请求代际：main 连接 + renderer transportEpoch；恢复不能让旧请求应答新请求。
- 草稿、归档/置顶/分组、主题：窗口偏好，当前分散在 App 与 ui 偏好文件，A2 迁至 application/workspace。
- 模型配置：main native controller 拥有写入事务，ProviderSettings 只应获得窄模型接口；密钥不回显到偏好。
- MCP/插件读取和写入：当前设置页面仍解析响应，A1 迁至领域适配与查询状态。
- 表单、展开、查找、弹窗：页面局部状态，不强行全部全局化。

## 已实现的边界门

入口：`pnpm architecture:check`；依赖快照：`pnpm architecture:report`。

工具读取 renderer/main/preload 的源码，用 TypeScript AST 提取 import/reexport/require/import type/dynamic import，通过项目 tsconfig 解析真实目标。单引号、类型导入和别名不会绕过检查；计算式加载和未解析的本地引用会报告失败。

检查对象：层依赖、跨 feature 私有入口、core/main 的 React 引用、feature 的 ACP 包/子路径引用、运行时循环。类型依赖计入层检查，但不当作运行时循环。
现有 DOM 守卫继续保留；其 import 扫描已经复用 AST，不再使用仅匹配双引号的正则。

当前扫描 117 文件、558 导入：369 运行时，189 类型；发现 45 条存量例外，其中跨 feature 私有入口 28、跨层依赖 17；未发现扫描范围内的运行时循环。

例外位于 `architecture-policy.json`，逐条有稳定边 ID、原因、移除阶段。新增越界必失败；旧边消失也会要求删除对应例外，不能用已迁移的额度放行另一个违规。重复/无说明的例外会失败。报告不会自动扩充例外。

A0 允许 features 继续读取现有 core 模型，这是迁移期间的合法方向，不代表已完成窄领域门面；A1 将继续收紧公开入口。当前工具检查静态模块依赖，不证明对象成员访问、反射、eval 或动态运行时行为完全没有越界。

根 verify 与 CI 已接入 architecture:check。远端 CI 是否通过须由实际运行记录确认。

## 复跑与评审

```sh
pnpm architecture:check
pnpm architecture:report
pnpm --filter @nofy-desktop/app exec node --test test/architecture-policy.test.ts test/dep-guard.test.ts
pnpm verify
```

[依赖快照](frontend-dependency-baseline.json)保存源路径、线路引用、运行时/类型分类和例外；没有用户数据或凭据。

每次代码切片先运行 GitNexus symbol upstream impact；提交前 detect_changes。此次修改旧 importsOf 的分析为 LOW、1 个直接调用者（violates）、0 个受影响执行流程；新工具尚未进入 GitNexus 索引。

## 后续排序

1. A0 剩余：内核能力矩阵、固定回放的性能基准。现有 1000 块 GUI 检查不冒充独立 profiler 基线。
2. A1：优先模型/MCP/插件窄接口，移走页面协议字段与响应解码；维护单一配置写入体系。
3. A2：拆出 App 的草稿/偏好、查询轮询、导航用例；设置统一注册入口。
4. A3–A6：局部订阅、完整 UI 迁移、虚拟化与交付验收。

本轮未改变界面或内核执行行为，因此不生成新的产品安装包，也不将模块检查当作 GUI 性能验证。

## 本轮验证结果

`pnpm verify` 实际通过：架构门、样式门、类型检查、ACP 41/41 与桌面 277/277 单测、夹具审计、构建、协议 smoke 7/7、PTY smoke 8/8、恢复 smoke 11/11。
本轮无页面行为改动，不重跑 GUI 作为新的实测项；此前 33 项 GUI 的结果保留原日期与范围。远端 CI 尚未运行。
