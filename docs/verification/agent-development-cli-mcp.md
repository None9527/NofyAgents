# CLI/MCP 实施与验收

日期：2026-11-04。契约 `nofy.kernel/v1` / `0.3` 已实现并启用：68 项操作、66 个入站 MCP 工具、17 项 Session 控制；源码 HTTP 索引为 110 条方法/路径。当前工作区 22 个包，依赖边界检查未发现退役宿主、Workflow/Orchestra 或旧产品接口进入交付闭包。

`nofy-agent-project` 管理可缺项的源码声明、模块/插槽/依赖、纯数据模板、文件版本和源码归档；`nofy-agent-client` 提供同一操作契约、认证 HTTP 请求、精确版本与结果映射；`nofy-agent-mcp` 使用官方 rmcp 3.6.0；`nofy-cli` 提供 nofy 命令及 MCP 启动入口。它们共用现有内核，没有第二套 Agent 循环。

| 范围 | 结果 |
|---|---|
| 源码工程行为 | 8 项通过：字面数据、版本传播、源码绑定、Session 插槽、并发写入、归档字节、路径、只读模板与不校验模块语法 |
| 客户端协议 | 5 项通过：u64 精度、写请求失联不重试、重定向不转交身份、原分页游标与初始运行版本 0 |
| CLI/MCP 联合行为 | 3 项通过：离线本地工程、stdio 开发闭环、HTTP 逐请求身份/Origin/资源分块 |
| 既有编程预设 | 53 项通过；纯 Rust 构建路径不执行 build.py |
| 实际响应与契约 | 51 份真实 Codex 调用结果匹配输出 Schema，0 项不符 |
| 操作、路由、文档 | 68/66 操作目录与 110 条源码路由对应；最终文档检查另见机器记录与原始日志 |

Session 的 Runtime、Executors、Host 与失败补验见[Session 记录](session-modularization.md)。上述不表示首次全量测试全绿，也不把未重新运行的整个工作区说成再次全量通过。

## 真实 Codex 与模型

使用本机 Codex CLI 0.166.0 的实际 app-server MCP 客户端，经 stdio 调用 22 种 Nofy 工具。Codex 创建空声明、逐个添加模块、查询 Schema、构建/预览、发布/激活、启动会话、观察事件、关闭/重开、切换策略并导出源码。app-server 直接执行 MCP 客户端调用，未启动 Codex 模型轮次；接入依据为[官方 MCP 文档](https://learn.chatgpt.com/docs/extend/mcp)和[官方 app-server 文档](https://learn.chatgpt.com/docs/app-server)。用户 Codex 配置摘要前后相同，未修改永久连接配置。

业务 Agent 使用用户指定网关和请求模型 gemini-3.8-flash-high，实际调用 Rhai calculate(21)，首轮返回标记与 42。内核进程硬退出后，原 start 命令精确重放没有重新派发；闭会话边界切换策略到 policy_revision=1，重开后第二轮保留标记和第一次计算结果。

预算使用从 2 次模型/1 次工具变为 3 次模型/1 次工具；原 spec、created_at 与 deadline 完全相同。没有清零使用量或通过重置期限恢复运行。首个中断的验收尝试保留其五分钟原预算；最终新建隔离验收从创建时明确使用一小时期限，原尝试未改写。

网关两轮均回报 gemini-3.8-flash-n，与请求名不同；记录差异，未确认其内部别名映射，也未改用回报名。256k 按 262144 输入 tokens 配置，未进行满窗口压力验收。

源码归档经实际 Codex resources/read 分块收齐并验证 SHA-256，完整大小与摘要见[机器记录](agent-development-cli-mcp.json)。归档只含源码和普通依赖说明，没有密钥正文、解释器或外部库。

## 生效与恢复

本机 `/home/none/.local/bin/nofy` 已替换为新 Rust CLI。local profile 位于 `/home/none/.config/nofy/config.toml`，只保存内核地址、令牌文件引用和预设目录。常驻内核在无排队/运行任务、无状态迁移的边界更新；原 catalog、运行库逻辑身份与 generation 保持。旧可执行文件、旧状态及原始验收日志保存在工作区外恢复目录，路径见机器记录。

前端文件未改动，页面不属于本次验收。coding@0.1.0 是源码基线模板，pi 参考行为复现和最终平台的其他里程碑仍独立进行。

首轮编译、协议夹具、验收脚本缓冲及初始版本投影等失败均保留原日志；随后集中修复并只补验受影响范围。配置参数冲突、只读模板与源文件字节边界也有相应行为证据。详细批次、制品摘要、实际模型回执与未覆盖边界见[机器记录](agent-development-cli-mcp.json)。
