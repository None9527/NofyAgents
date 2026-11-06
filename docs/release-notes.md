# 当前发布范围

2026-11-06，开发者预览。CLI 包版本 `0.1.0`，开发协议 `nofy.kernel/v1`，契约修订 `0.6`。源码提交不表示已经发布二进制安装包或包管理器版本。

## 已可使用

- 干净的 25 包 Rust 框架工作区，统一 Loader 与执行路径。
- CLI、入站 stdio／Streamable HTTP MCP，以及同源的托管／本地源码工程编辑。
- 97 项操作、95 个 MCP 工具、20 项 Session 操作；默认 Linux Host 发现 65 个工厂。
- 声明构建、校验、发布、generation 激活、事件观察、审批、取消、恢复与版本转换。
- SessionPolicy 规则／源码模块、接纳与续轮、元数据与归档、静止轮次间策略切换。
- 源码归档及普通依赖清单交付，凭据独立注入，业务依赖由使用者安装。
- `coding@0.1.0` 编程源码基线模板。

已完成的真实验收及其边界：

| 记录 | 已证明的范围 |
|---|---|
| [CLI／MCP 实现](verification/agent-development-cli-mcp.md) | 共用契约、源码操作、真实 Codex 客户端、真实模型、会话恢复及预算延续 |
| [Session 实现](verification/session-modularization.md) | 策略装载、生命周期与 HTTP／运行时回归 |
| [真实 sub 创建 Agent](verification/mcp-sub-agent.md) | sub 经标准 MCP 从空声明组合 9 模块、发布、真实模型调用工具、完成运行和源码包核验 |
| [编程模型修复项目](verification/coding-real-model-build.md) | 模型读代码、运行测试并修复真实项目 |

本次发布整理的集中检查由 [scripts/check-release.sh](../scripts/check-release.sh)执行，实际结果见[发布检查记录](verification/source-publication.md)。历史记录中的首轮失败和定向补验仍保留，不合并伪装为一次全量成功。

## 当前边界

- 当前发布不包含前端源码、静态页面服务或 `--console-dir` 启动参数；使用 CLI／MCP／HTTP API。
- pi 等完整行为预设尚未发布。树状会话／分支、`steer` 与 `followUp` 双队列及其他参考能力仍需独立实现与验收。
- 所有模块的交叉组合矩阵已开始但被用户暂停，不能宣称全部组合通过。
- Bash 等派生进程工具需要显式的 cgroup 委派环境。当前可用性不意味着任意主机的终端工具已配置。
- 主要运行验收平台是 Linux；其他目标的条件编译不等于实际平台验收。

[启动指南](getting-started.md) · [开发手册](manual/README.md) · [文件说明](../文件说明.md)
