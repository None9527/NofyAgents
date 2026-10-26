# 前端架构 v1：应用层与领域入口

2026-10-09。状态：已落地并完成本地验收。这是 A1/A2/A3 的第一批迁移，不代表 A0–A6 全部完成。

## 职责与入口

内核独立，拥有自己的 TUI；桌面仍通过 ACP 连接一个内核子进程。本次没有修改 Rust 内核、ACP 方法名或引入新的状态库。

```text
main / preload → seam → core 投影与 Effect 强制点
                             ↓
                    application 客户端用例
                             ↓
                  features 的 public.ts 视图入口
                             ↓
                        共享 ui 控件
```

`renderer/application/public.ts` 暴露 `createDesktopClient`。同一 Runtime 只装配一个客户端，公开 sessions、interactions、files、workspace 和只读投影订阅；不返回 port、bridge、effect 或 dispatch。内部命令继续调用现有 runtime.effect，保持请求、通知和审批应答的强制分派。

| 所有者 | 已接入职责 | 入口 |
|---|---|---|
| application/contracts | 客户端能力、附件、只读投影、结果类型 | contracts/public.ts |
| application/sessions | 创建/加载/激活、发送/取消、队列、模型/权限、审批、恢复导航 | sessions/public.ts 与 DesktopClient.sessions/interactions |
| application/workspace | 草稿、项目选择、布局/主题/时钟、会话组织、用量账本、面板标签 | workspace/public.ts |
| application/workspace 资源控制器 | Git/上下文轮询、目录/预览读取、模糊搜索生命周期 | workspace/public.ts 与 DesktopClient.files/workspace |
| application/projection | 局部选择器订阅 | projection/public.ts |
| features | 页面布局、表单交互、内容呈现 | shell/conversation/approvals/settings/aux 各自 public.ts |
| core | 权威事件的客户端投影、权限线路映射、Effect | 现有 core 模块 |
| ui | 通用控件、主题与宿主存储工具、共享帧调度 | 现有 ui 模块 |

`App.tsx` 目前 741 行，保留窗口装配、快捷键、视图读模型和布局；已移除协议 effect 调用、store.dispatch、持久化写入与资源轮询计时器。源码 AST 回归禁止 App 与 FilePane 恢复这些原始协议动作。

旧 draftModel/workspaceModel/sessionMetadataModel 文件只转发到应用层，保留既有调用与测试兼容；原 Shell hooks 和 ui/sessionMetadataPrefs 实现已迁走，不维护两份状态。

## 生命周期与竞态

- Git/上下文查询按活跃会话、连接 ready 状态和 transportEpoch 绑定；同一资源请求不重叠，身份失效或 owner 释放后迟到结果不更新界面。
- 文件读取按 root/sessionId/transportEpoch 拥有独立 controller；预览使用递增请求版本。打开 A 后打开 B，A 迟到不能覆盖 B；关闭预览使挂起读取失效。
- 目录请求按路径合并；切会话或释放 controller 后不能回填旧树。
- 搜索 open 合并，pending 时只发送最新查询；释放期间迟到的 open 会关闭。连接代际变化后不会用旧 searchId 关闭新内核的搜索。打开失败保留可呈现的错误。
- 审批按当前 pending 请求对象验证，防止重连后复用 RPC id 的旧对象应答新请求。权限模式先确认模式切换，再发权限通知；连接变化则停止后续发送。
- reducer 与 getState 仍同步；多个订阅共享 16ms 调度，选择器结果未变化时不通知其订阅者。当前只迁移文件/搜索局部订阅，不能据此宣称所有页面已隔离渲染。

## 依赖治理

AST 门禁覆盖 145 个源码文件、657 条 import 边。精确存量例外由 45 降至 15，未新增例外。删除的 30 条包括跨 feature 私有导入与 UI 对会话组织模型的反向依赖。

页面访问 application 必须经过 public.ts，类型导入同样受限；应用层不依赖 feature。新增越界与运行时循环必须失败，失效例外也必须从预算中删除。

更新后的机器清单：[frontend-dependency-baseline.json](frontend-dependency-baseline.json)。此前 [A0 架构基线](frontend-baseline-2026-10-09.md) 保留为迁移前记录，其 45 条数字是历史基线。

## 验收

最终 `pnpm verify`：ACP 41 + desktop 290 = 331 项单测通过，包含 13 项新增架构/竞态测试；架构、样式、类型、51 条夹具审计、构建、协议 smoke 7/7、PTY smoke 8/8、恢复 smoke 11/11 通过。

四组 Electron GUI 共 37/37、consoleErrors 为 0：

- 对话 11/11：`output/playwright/2026-10-09T05-55-00.451Z/report.json`。
- 项目/会话组织 11/11：`output/playwright/project-2026-10-09T05-55-26.887Z/report.json`。
- 设置 11/11：`output/playwright/2026-10-09T05-55-28.164Z-settings/report.json`。
- 文件工作区 4/4：`output/playwright/workspace-2026-10-09T06-43-03.755Z/report.json`。

GUI 使用隔离、确定性 ACP 模拟服务；文件工作区脚本可执行 `node apps/desktop/e2e/workspace-acceptance.mjs`。没有读取真实模型凭据。文件竞态通过真实 Electron、IPC 与界面操作验证；不代表真实网络模型验收。三组原 GUI 在最后搜索错误呈现修订前运行；最终文件 GUI、类型与完整 verify 覆盖该修订。

本地 macOS arm64 包已重新生成，`pnpm verify:package` 两次隔离启动通过，内核均已回收。包为 ad-hoc 签名且不含内核二进制；校验与源码摘要见 [验收证据](frontend-framework-v1-evidence-2026-10-09.json)。

## 下一批迁移

1. MCP/插件写入与响应解码已在 [v1.1](frontend-settings-domain-2026-10-09.md) 迁入领域服务。ProviderSettings 宿主能力、SettingsSurface 查询、dirty-close 注册与 Runtime 兼容口仍待收口。
2. App 仍订阅整份 AppState，并向遗留页面转发 Runtime；继续拆出 Conversation/Sidebar/Overlay 的读模型与选择器。UI/readers 中的领域解码仍待迁入 core。
3. [v1.2](frontend-file-workspace-2026-10-09.md) 已实现文件资源临时/固定标签、正文与树布局、Markdown/源码及位置恢复。外层仍为功能入口，通用 PanelTabRegistry 与跨资源类型、窗口持久化待实现。
4. A0 的完整能力矩阵与同机性能基准尚未完成；A5 的动态高度虚拟化依赖稳定行模型，不在本版宣称实现。
5. 启动保持既有不使用 StrictMode 的行为；初始化创建会话、控制器在 StrictMode effect 重放下的生命周期需要独立改造与验收，不能直接启用。
6. 15 条存量例外继续下降，不为新增代码追加目录豁免。Windows/Linux、远端 CI、公开签名与 notarization 未实测。
