# 架构 v1.2：只读文件资源工作区

2026-10-09。承接 [架构 v1](frontend-framework-v1-2026-10-09.md) 的文件能力和 [v1.1](frontend-settings-domain-2026-10-09.md) 的领域入口。本批落地资源 Tab、阅读状态与正文/目录布局，不改变内核、ACP 方法或应用包版本。

## 已落地交互

- 单击文件使用唯一的临时预览槽；选择另一文件替换临时标签。双击或“固定标签”保留文件。
- 重复打开已有路径只激活，不新增重复标签；关闭当前标签选择相邻项，关闭非当前标签保持正文。
- Markdown 默认预览，支持只读源码切换；每个文件分别保存预览/源码滚动位置。
- 正文与文件树并列，统一 Header 显示相对路径、模式、固定、刷新和树开关。窄文件面板使用可收起的目录抽屉，正文使用完整宽度。
- 隐藏树或外侧面板保留资源标签、展开和阅读位置；同根不同会话仍隔离。返回近期会话恢复自己的窗口视图。
- 刷新读取根目录、已展开目录和当前文件。文件错误显示在对应正文，目录/搜索错误单独呈现，截断目录明确提示。
- 只读内容使用现有 Markdown/CodeBlock；正文节点按文件、模式与语言缓存，位置更新不重新创建正文节点。未增加 HTML 注入或第二套内容解析器。

## 所有权与生命周期

| 模块 | 职责 |
|---|---|
| application/workspace/resourceTabs.ts | 完整路径身份、临时槽、固定/激活/关闭、模式及位置 |
| application/workspace/fileResources.ts | 目录、按资源文件查询、请求版本与作用域释放；preview 是兼容派生快照 |
| application/workspace/fileWorkspaceCache.ts | 每个 DesktopClient 的受控窗口视图缓存 |
| application/workspace/useFileWorkspace.ts | React 订阅、连接/会话身份与搜索生命周期 |
| features/aux/FilePane.tsx | 文件工作区装配、Header 和标签呈现 |
| features/aux/WorkspaceExplorer.tsx | 树、过滤结果、选择与展开呈现 |
| features/aux/FileViewer.tsx | 只读正文、模式对应滚动恢复 |
| ui/workspace.css | 工作区布局与导航状态；基础控件和内容外观继续复用共享 UI |

资源身份使用内核返回的完整路径，按 root/sessionId/transportEpoch 分区；不全路径转小写、不推测符号链接的 canonical path，也不合并同名不同路径文件。

缓存最多保留 4 个近期会话/根目录工作区，每个最多 12 个文件标签。关闭文件释放对应查询结果；移除临时槽的请求版本记录也会删除，递增的全局读取版本防止 A/B/A 旧请求重新命中。目录及正文 DOM 虚拟化仍未实现，这两个数量不代表进程总内存预算。

隐藏/切换会 suspend 查询 owner、清理进行中标记并使旧请求失效，UI 阅读状态保留；恢复时重新读取可见资源。连接代际变化 dispose 旧缓存并从新作用域开始，本版不恢复重连前的文件标签或应用重启前的窗口状态。

## 验证

新增 6 项单测：临时/固定标签、同名路径、模式与位置、关闭回退、suspend/resume 迟到响应、缓存隔离/驱逐、12 标签上限、A/B/A 读取保护。

Electron 文件工作区用例共 9 项，覆盖原读取竞态/关闭/切会话/搜索错误，以及新标签、模式/滚动、隐藏恢复、会话缓存、1024 窄窗口和深浅主题。测试使用隔离确定性 ACP 文件服务，不读取真实项目、凭据或调用模型。最终报告为 `output/playwright/workspace-2026-10-09T08-43-10.726Z/report.json`，9/9、consoleErrors 为 0。

完整 `pnpm verify`：347 项单测（ACP 41、desktop 306）、架构/样式/类型/构建、56 条夹具审计、协议 7/7、PTY 8/8、恢复 11/11 全部通过。架构图统计为 155 源文件、710 imports、15 条存量例外，没有新增豁免。

macOS arm64 包更新后，两次隔离启动与内核回收检查通过。本地 ad-hoc 签名，不捆绑内核。报告、源码摘要与包校验见 [交付证据](frontend-file-workspace-evidence-2026-10-09.json)。

`pnpm ui:check` 已覆盖新增 workspace.css，共 7 个样式模块；目录/预览旧 CSS 从 styles.css 移除，未叠加重复覆盖。

## 明确保留的边界

文件视图只读；图片专用预览、文件写入、dirty-close、watch 尚未接入。外部打开/文件管理器显示与目录独立拖拽已在 [后续工具栏补齐](frontend-workspace-header-2026-10-09.md) 中实现。文件读取继续受现有 4000 行及接口大小上限约束，正文显示可能截断，不假装完整可编辑。缓存字节没有实时 watch，需恢复工作区或手动刷新读回外部变化。

外侧 files/review/agents 仍是既有功能入口，资源标签目前位于 FileWorkspace 内。通用 PanelTabRegistry、跨资源种类统一标签与窗口持久化还没有完成；没有将此阶段冒充完整 Codex 面板。

后续主线继续推进 Conversation/Sidebar 局部订阅与稳定行模型、性能基线和虚拟化；设置查询/Provider 能力和剩余依赖例外同步按原迁移计划收口。


后续更新：[文件资源模块](frontend-file-module-2026-10-10.md) 已增加图片预览、目录变化监听和视图偏好恢复。本文为 v1.2 历史交付记录，当前行为以上述更新为准。
