# 对话呈现模块重做（2026-10-11）

前一轮解决了投影顺序与 hook，但消息、工作项和富文本仍是基础展示。本轮直接对照 ZCode 的 `components/ai-elements/message.tsx`、`markdown-table.tsx`、`code-block.tsx` 与 `v4/conversationAssistantWorkItems.ts` 改呈现模块。参照仓库保持只读。

## 组件及状态所有者

- `Spine` 继续拥有滚动、虚拟测量和过程折叠。用户气泡右对齐，正文列用独立 `--ui-transcript-width`，不再沿用输入框宽度。删除重复角色标题；复制/导出/用量在回答尾部，输入复制、编辑草稿、回退是消息下方真实图标动作。
- `workModel.ts` 只做可测试展示模型：相邻查阅工具合组，思考/其他操作保留顺序，不跨边界合并；只有所有工具都有文件路径时才显示真实去重文件数量，否则显示操作数量。工具行默认紧凑，点击展开参数、位置和结果。查找可展开 native details 祖先，不把匹配藏在工具组里。
- `ui/markdown.tsx` 是整个应用唯一 CommonMark/GFM 渲染入口，使用精确依赖 react-markdown 10.1.0 + remark-gfm 4.0.1，替换旧手写块/行内解析器。嵌套列表、任务列表、表格、引用、代码围栏统一来自语法树。默认 URL 清理及 skipHtml 保留，不执行原始 HTML，也不从模型 Markdown 自动加载图片。
- `markdownTable.tsx` 提供可横滚圆角表格，复制当前 DOM 单元格 TSV、CSV（BOM + 正确引号转义）原生保存与展开阅读。内容在用户手势时读取，避免流式更新后复制旧数据。
- `CodeBlock` 保持 lang/code 调用兼容，沿用既有语法 tokeniser；新增换行、保存、统一复制。Markdown 围栏不显示行号，文件源码默认保留行号与外层滚动。
- `contentActions.tsx` 是共享复制/保存控件；原生保存通过调用者的 runtime.saveText 传入，其他 UI 使用受用户手势触发的本地文本下载。没有新增 renderer → main 特殊通道或核心推理逻辑。
- 样式只在既有 content.css / conversation.css / foundations.css 中维护，7 模块样式检查无重复选择器。

## 源码与协议边界

ZCode 的工具分组基于连续同类操作，而不是把每个 chunk 做成卡片；本轮按这个模式组合现有 ACP 块，底层记录完整保留。hook 继续排除出可见对话。回退仍先预览再提交，编辑图标将原输入送回草稿，不改历史。内核目前未提供块级时间戳、逐思考耗时或点赞接口，没有编造这些数据或挂假反馈按钮。本轮不是完整 ZCode 移植，高亮也没有冒称 Shiki。

解析依据：[react-markdown 官方说明](https://github.com/remarkjs/react-markdown)、[remark-gfm 官方说明](https://github.com/remarkjs/remark-gfm)。

## 验证

410 单测、67 实际 Electron GUI 场景通过，包含输入复制/编辑、查阅合组、嵌套语义列表、表格 TSV 复制/展开/原生 CSV 保存、代码精确复制/换行/原生保存，暗/亮主题和 880/1440 宽度；回归设置、文件、审批、长对话。

共享 CodeBlock impact 为 HIGH（2 个直接调用者、3 模块）。GUI 发现并修复过一处真实退化：对话代码最大高度影响文件源码的外层滚动；最终编号源码块取消该高度限制，17 项文件工作区 GUI 重新通过，阅读位置保留。复制测试等待异步完成提示后读取系统剪贴板。

本机三轮性能门通过，10k 历史挂载 24 个消息节点，60 次输入采样合并 p95 17.3ms。主 JS 687.87kB / gzip 216.32kB，标准解析依赖增加了包体；此轮记录并验证运行性能，不宣称解决了分包边界。

[完整证据](frontend-rich-conversation-evidence-2026-10-11.json)包含源码哈希、6 份 GUI 报告和性能原始样本指针。截图均是生产 Electron 的隔离测试会话，使用不含凭据的模拟响应，不是用户真实对话截图，也未执行参考截图里的 API 请求。
