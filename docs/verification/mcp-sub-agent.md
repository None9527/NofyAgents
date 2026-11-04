# 真实 sub 经 MCP 创建并运行 Agent

2026-11-04。执行者为真实 sub `/root/mcp_agent_trial`，目标为全新 `mcp-sub-agent`。本次验证工具调用开发链路，不代表 pi 行为复刻。

sub 的继承工具表没有热加载 Nofy；它启动标准 stdio MCP Server，完成 `initialize → initialized → tools/list → tools/call`。全部 Nofy 业务经过 MCP，未绕过为业务 CLI 或 HTTP。另以新 Codex app-server 原生 MCP 连接读取了同一新运行与事件。

## 实际结果

- MCP 协议 `2025-11-25`，发现 66 个工具，28 次业务工具调用；请求及结果均通过公开 Schema 校验。
- 从空声明创建 Agent，添加 9 个模块，构建／校验／发布并激活 generation `1`；source revision `10`。
- 模型请求保持 `gemini-3.8-flash-high`，网关回报 `gemini-3.8-flash-n`。仅保留别名差异，没有替换请求模型。
- 实际执行 `double({"value":21})`，原生工具完成事件 `is_error=false`、结果 `{"result":42}`。
- 两次模型调用、一次工具调用，最终输出 `SUB-cb1d7d541db3 42`，运行状态 `completed`。
- 源码归档 7,300 字节、6 文件，SHA-256 和逐文件往返核验通过；没有将模型密钥写入源码或证据。

release：`0e93cb3d32e3bda09bc4ceaeb80216cd6c415013eaeda2167468d5bb8047f750`。

源码包 SHA-256：`ac78ce20123609f97d6a05f8e79943d618d62960ca177520be25bfa09bf2068f`。

[机器结果](mcp-sub-agent.json)保存可公开的标识与断言；原始传输、模型回执和源码包保留在执行环境的私有验收目录，未随代码库分发。

这证明最小工具 Agent 可以由外部 sub 经 MCP 创建并运行。完整编程 Agent、全部模块组合及完整 pi 能力需要各自的行为证据。
