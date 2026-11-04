# README 与 GitHub 仓库检索发布说明

查阅日期：2026-11-04。本文是发布准备资料，不是产品首页；尚未修改在线仓库设置，也未验证公开仓库收录、搜索流量或排名。

产品定位以“高度模块化的 Agent 业务开发框架，让外部编程 Agent 围绕目标创建和持续迭代专项 Agent”为主线。CLI/MCP 开发入口尚未实现；定位与目标流程不能冒充现成功能。编程预设、网页管理和文件工具是运行能力示例，不取代这条核心定位。

## 查证结论

| 问题 | 查证结果 | 依据与可信度 |
|---|---|---|
| README 应先写什么 | 讲清项目用途、价值、开始方式与求助入口；技术细节可以链接到专门文档 | [GitHub README 指南](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes)，高 |
| GitHub 默认怎么搜仓库 | 未指定 in 时，仅搜索名称、简介和 Topics；搜索 README 正文使用 in:readme | [GitHub 仓库搜索](https://docs.github.com/en/search-github/searching-on-github/searching-for-repositories)，高 |
| Topics 有什么用 | 按用途、领域或语言帮助用户发现相关仓库；并非保证排名的技巧 | [GitHub Topics 指南](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/classifying-your-repository-with-topics)，高 |
| 越短或关键词越多越好吗 | 没有理想字数；应自然、清楚地表达主题，避免关键词堆砌；收录和排名不能保证 | [Google SEO 入门](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)，高 |

## 同类首页观察

| 样本 | 观察到的写法 | Nofy 采用的部分 |
|---|---|---|
| [DeepAgents](https://github.com/langchain-ai/deepagents#readme) | 定位与主要能力在前，随后提供最小使用示例及深入文档 | 先说明用户能做什么，实例紧跟能力介绍 |
| [Goose](https://github.com/block/goose#readme) | 描述使用场景，再给清楚的开始入口与帮助链接 | 本地入门单独成文，不在首页展开访问配置 |
| [uv](https://github.com/astral-sh/uv#readme) | 明确产品类别，链接具体证据，区分安装入口和详细使用 | 标题与首段说明类别，编程流程链接本项目真实验收 |

上述是阅读观察，不是转化率或 SEO 实验。不能从这些项目的知名度反推某种 README 排版必然提高排名，也不复制其性能、稳定性或开箱即用承诺。

## 可直接填写的 GitHub About

```text
Modular AI agent development framework. Goal-driven CLI/MCP workflows for coding agents to create and improve specialized agents are in development.
```

这段填写仓库首页 About 的 Description；它不会因出现在 README 或此文件中而自动应用。保持 Nofy 名称、分类与 README 首段一致，不为匹配搜索词擅自更名。

建议 Topics：

```text
ai-agent
agent-development
agent-framework
modular
declarative
mcp
rust
self-hosted
```

这些词按现有产品定位和已实现能力选择，不代表做过搜索量调查。不要用尚未兑现的产品兼容或完整热更新作为标签卖点。Topics 对私有仓库也公开，设置前应确认发布范围。

## README 的写作约定

- 产品主体是模块化与深度自定义；开发者可以是 Codex、Claude Code 等编程 Agent，交付对象是专项业务 Agent。
- 解释目标、开发、测试、反馈、持续迭代的关系，同时标明 CLI/MCP 入口的真实实施状态，不虚构已验收的自动开发闭环。
- 第一屏让读者知道：这是哪类产品、适合谁、能完成什么事。
- 中英文保留清楚的产品分类词，但用正常句子解释，不放重复词云或隐藏 SEO 文本。
- 例子说明实际动作，并链接对应证据；测试项目验收不包装成通用编程基准。
- 给一个明确的入门入口；不虚构一键安装命令、可下载版本、社区链接或维护者联系方式。
- 当前能力、开发状态与计划分开；令牌、存储内部机制和阶段日志不放在首页。
- 中英文互链是服务不同读者的选择，不宣称存在英文排名加成。

## 发布后怎么核对

先确定最终公开仓库地址、实际反馈与贡献入口，再应用 About 和 Topics。可在 GitHub 使用以下查询分别检查名称、简介、主题与正文检索：

```text
Nofy in:name
"declarative" "agent" in:description
topic:agent-framework language:Rust
Nofy in:readme
```

这些查询用于检查匹配，不证明高流量或排名提升。Google 的公开收录检查需使用最终 URL；当前没有执行上线、推广、站点提交或在线元数据修改。后续若提供官网，再单独处理网站标题、页面说明、索引与多语言配置，不把 README 当作完整网站 SEO 配置。
