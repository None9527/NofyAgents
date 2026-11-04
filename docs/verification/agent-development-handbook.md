# CLI/MCP 开发手册文档验证

记录日期：2026-11-04。对象为 [0.1-design 手册](../manual/README.md)、操作目录、设计 Schema 与已有 HTTP API 索引。本阶段只交付文档与机器可读契约，没有实现新 CLI、入站 MCP Server 或源码工程草稿能力。

## 集中检查结果

| 范围 | 结果 |
|---|---|
| 设计目录 | 56 个操作、54 个拟议 MCP 工具；凭据写入/删除不作为普通 MCP 工具开放 |
| Schema | Draft 2020-12 元校验、本地引用解析及 51 个定义检查通过 |
| 输入正反例 | 13 项通过；包括模块添加模式互斥、原生大整数传输及空工程/预设初始化 |
| 手册正文 | 6 篇 Markdown、34 个原有相对链接通过；入口与本记录的新增链接另作定向核对 |
| 示例 | 2 个 JSON、3 个 TOML 解析通过；20 个 Shell 代码块通过 bash 语法检查 |
| 原生 API | 85 个方法/路径对与当前路由源码一致；对应操作映射检查通过 |
| 源码边界 | 当前冻结范围内 Rust 源码无差异；没有运行无关 Rust 工作区测试 |

目录提取发现的 references 方法已更正为 POST；模块引用/导入与 factory 参数互斥，tool 快捷输入限定在工具插槽。集中检查通过后，仅对新增的空工程/预设 Schema 分支补验了 5 项，未重复运行已通过的整轮检查。工具参数和 Schema 的检查属于设计资料校验，没有运行拟议命令。

## 现有内核的声明校验

使用运行中的原生 Host，对[计算工具定义](../manual/modules.md)构成的完整 ToolProgram 部署执行 `POST /api/v1/validate`，获得 release digest：

```text
984c7a3bfeecdaf98f87e4f3eae603831fa42f32b70bac73f1af185908af3a84
```

该请求只编译校验声明，没有 publish、apply 或执行工具，真实模型调用为 0。它证明该原生声明能被当前内核接受，不证明新 CLI/MCP 可用。

## 保留边界

CLI help、MCP tools/list、stdio/HTTP 服务、源码工程管理及真实 Codex 客户端开发闭环仍待实现与行为验收。现有出站 MCP HTTP 工具验收另见[原记录](mcp-http-tools.md)，与本次入站管理协议设计区分。

机器结果见[JSON 记录](agent-development-handbook.json)。原始检查脚本、响应、修改前副本和文档归档保存在 `/tmp/nofy-handbook.51zx5dcu`，属于本机临时证据；仓库内本记录保存可持久阅读的结果和边界。
