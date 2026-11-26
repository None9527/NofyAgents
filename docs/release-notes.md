# 当前发布范围

2026-11-06，开发者预览。CLI 包版本 `0.1.0`，开发协议 `nofy.kernel/v1`，契约修订 `0.7`。源码提交不表示已经发布二进制安装包或包管理器版本。

## 已可使用

- 干净的 21 包 Rust 框架工作区，统一 Loader 与执行路径。
- CLI、入站 stdio／Streamable HTTP MCP，以及同源的托管／本地源码工程编辑。
- 104 项操作、102 个 MCP 工具（`full` 工具集）、20 项 Session 操作（另含 6 项 `work.*` 统一编排操作；CLI／MCP／SDK 默认使用 `run` 工具集，共 21 项）。默认 Linux Host 发现 68 个内置工厂（启用 `feature-authoring` 时额外暴露 `tool.sdk_feature`）。
- 声明构建、校验、发布、generation 激活、事件观察、审批、取消、恢复与版本转换。
- SessionPolicy 规则／源码模块、接纳与续轮、元数据与归档、静止轮次间策略切换。
- 源码归档及普通依赖清单交付，凭据独立注入，业务依赖由使用者安装。
- 声明式源码预设注册表（`presets/index.json` 默认 `omni@0.1.0`，同时暂留 `coding@0.1.0`）、15 包模块仓库（`modules/module-repository.json`）及可选独立托管 SDK 入口（`nofy_agent_runtime::managed::run`）。

已完成的真实验收及其边界：

| 记录 | 已证明的范围 |
|---|---|
| [CLI／MCP 实现](verification/agent-development-cli-mcp.md) | 共用契约、源码操作、真实 Codex 客户端、真实模型、会话恢复及预算延续 |
| [Session 实现](verification/session-modularization.md) | 策略装载、生命周期与 HTTP／运行时回归 |
| [真实 sub 创建 Agent](verification/mcp-sub-agent.md) | sub 经标准 MCP 从空声明组合 9 模块、发布、真实模型调用工具、完成运行和源码包核验 |
| [编程模型修复项目](verification/coding-real-model-build.md) | 模型读代码、运行测试并修复真实项目 |
| [内核缺口与 MCP 自主装配](verification/kernel-gaps-2026-11-05.md) | 无 cgroup namespace 执行、会话 `fork`/`rewind`/`tree`、`steering`/`follow_up` 双队列、异步子任务、PTY／stdio MCP／网络代理与上下文压缩恢复 |

本次发布整理的集中检查由 [scripts/check-release.sh](../scripts/check-release.sh)执行，实际结果见[发布检查记录](verification/source-publication.md)。历史记录中的首轮失败和定向补验仍保留，不合并伪装为一次全量成功。

## 当前边界

- 当前预览发布不包含已发布的前端界面或 `--console-dir` 启动参数，主要通过 CLI／MCP／HTTP API 与嵌入式 SDK 使用（`nofy-agent-host` 仅提供开发态可选的 `--dev-web-dist` 静态监听；工作区本地 `web/` 属开发中未入库目录，未纳入本次预览发布）。
- pi、Codex、OpenCode 等完整行为预设尚未发布。内核已实现会话分支（`session.fork`/`rewind`/`tree`）与 `steering`/`follow_up` 双输入队列，但参考产品的完整端到端行为复现仍需独立验收。
- 所有模块的交叉组合矩阵已开始但被用户暂停，不能宣称全部组合通过。
- 派生进程工具在 Linux 上提供两种隔离后端：`resource.process_tree_limits`（需要显式 cgroup v2 委派环境，提供整树聚合配额）与 `resource.process_namespace_limits`（无需 cgroup，提供每进程限制与整树退出回收）。当前可用性不意味着任意主机的终端工具已配置。
- 主要运行验收平台是 Linux；底层持久化／路径／私有目录／隔离契约已抽象为跨平台 crate（控制面与冒烟脚本覆盖 Linux／macOS／Windows），但 macOS／Windows 的原生工作进程隔离、PTY／进程会话尚未实现，按 fail-closed 明确拒绝（见[平台矩阵](architecture/platforms.md)）。

[启动指南](getting-started.md) · [开发手册](manual/README.md) · [文件说明](../文件说明.md)
