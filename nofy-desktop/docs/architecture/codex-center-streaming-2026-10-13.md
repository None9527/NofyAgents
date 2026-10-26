# Codex 中栏第二批：流式正文与模型响应边界

日期：2026-10-13。本批接续 [P0 呈现机制](codex-center-p0-implementation-2026-10-13.md)，落实 [Codex 安装包调研第 10 节](codex-center-system-research-2026-10-13.md#10-流式正文解析片段身份呈现节奏分开) 中的稳定片段和安全前缀机制。

## 已落地

### 正文只更新可变尾部

`renderer/ui/markdownStream.ts` 使用与现有 Markdown 一致的 remark-parse / remark-gfm 语法，将最后一个顶层语法块保留为可变尾部，其前面的块进入稳定缓存。以来源偏移作为片段 key；文本被替换时重新建立身份，避免旧流缓存串入新文本。解析器依赖与现有 ReactMarkdown 的传递依赖版本一致，显式声明为直接依赖。

`Markdown` 仍是唯一正文入口，片段继续使用共享的 CodeBlock、MarkdownTable、排版和安全规则，不增加另一套样式或展示组件。对话通过 `streaming` 启用缓存；文件和其他静态内容维持原路径。生成结束时保留片段结构，代码换行状态、表格展开状态和 DOM 均持续复用。

稳定片段由 memo 阻止重复 ReactMarkdown 解析；段落、列表、未闭合代码围栏和表格都在可变尾部正常增长。没有添加人为逐字等待或轮播队列。

引用定义、脚注及可能尚未完成的引用会影响前文，所以退回整篇解析；不能以缓存换取语义错误。这类文档仍可能重建控件。本批也没有完成 Codex 的 adaptive buffering、数学/directive、链接打开能力、媒体呈现及全部回答操作。

### 修复模型响应之间串块

内核已在 `crates/codegen/nofy-shell/src/session/acp_session_impl/updates.rs:116` 输出 `_meta.streamStartMs`；TUI 的 `tracker.rs:4744` 起已有专门边界回归测试。桌面原先丢掉该字段，导致缺少中间 `response_completed` 时出现：

```text
输入：思考 A → 回答 A → 思考 B → 回答 B
原来：思考 A → 回答 A回答 B → 思考 B
现在：思考 A → 回答 A → 思考 B → 回答 B
```

事件归一化保留有限数值的 streamStartMs，会话投影在新响应首个正文/思考帧到达时关闭旧文本块并重新建块。去重先于边界处理；旧事件重复回放不能把响应身份切回去。缺少该元数据时继续兼容现有事件。

这不是最终回答标记，也不等于用户轮次完成。`response_completed` 和 `turn_completed` 的区别继续保留，未修改内核协议、工具调用或模型请求。

## 验证与证据

- 桌面单测 436 项通过，其中新增 17 项：逐字符 CommonMark/GFM 等价校验、稳定前缀解析成本、文本替换、实时/回放边界、去重及旧协议兼容。
- 类型检查、架构边界、统一样式检查和生产构建通过。
- [增量渲染 Electron 报告](../../output/playwright/markdown-stream-2026-10-13T14-09-11.255Z/report.json)：6 场景通过。一个尾部追加只触发 1 次片段渲染；代码围栏闭合、表格继续增长及整轮结束都保留控件身份与操作状态。
- 上滚阅读后，追加及整轮结束前后 scrollTop 均为 1711；窄窗 scrollWidth/clientWidth 均为 680px。
- [工作流 Electron 回归](../../output/playwright/workflow-system-2026-10-13T14-09-02.097Z/report.json)：9 场景通过，覆盖活动摘要、手动折叠、错误保留、回答留白与滚动意图。
- [长历史 Electron 回归](../../output/playwright/virtual-2026-10-13T14-08-52.048Z/report.json)：11 场景通过。首次运行 V01 失败，采样确认回放新轮次反复重置 watch 状态；修复为只补首次提交定位，后续由 followToken 驱动。修复后额外 4 次冷启动一万块定位通过，完整三套 GUI 共 26 项再回归通过。
- `audit:fixtures` 未通过：工作区已有的 `nonmonotonic-replay-2026-10-13.jsonl` 含 2 处真实路径。本批没有新增/改写该夹具，也未修改审计规则。该项不能计入通过。
- 最新 macOS arm64 应用已重打包，2 次隔离启动、截图及内核退出回收验证通过，见 [安装包验证记录](../contract/package-macos-verification.json)。产物 `release/mac-arm64/Nofy.app`；ZIP SHA-256 为 `647d71480e4f4e856dc5dca49ee11aecdc8031c6799ecfbf7151a230912a396c`。继续使用既有外置内核分发方式。

以上 GUI 使用隔离内核模拟器，并检查实际 Electron DOM、控件和截图；不代表真实模型的网络、工具参数错误或挂起问题已经修复。参考项目完整的中栏体系仍按研究报告中的剩余模块推进。

GitNexus：Markdown、BlockView、readMeta、projectSessionUpdate 的已索引上游影响为 LOW；ThoughtActivity 与 useTranscriptScroll 未被索引，已补查源调用点；滚动控制器的唯一调用方为 Spine。未提交，保留既有工作区修改。
