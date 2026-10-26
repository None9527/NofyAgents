# 架构 v1.1：MCP / 插件设置写入服务

2026-10-09。承接 [架构 v1](frontend-framework-v1-2026-10-09.md)，本批完成 A1 的 MCP/插件写入隔离和 A4 对应页面的共享控件迁移。架构标签 v1.1 不改变应用包的 0.1.0 版本。

## 边界与状态所有者

- `core/settings/protocol.ts`：命令编码、业务状态与 Setup 字段解码。保持已有 MCP 的 snake_case 与 Setup 的 camelCase 两种实际契约；插件 action 与 reload 也只在适配器构造。
- `application/settings`：表单输入校验、窄领域命令、作用域互斥、连接代际、业务成功/失败、Setup 与卸载确认、插件写入后的 reload。
- `DesktopClient.settings`：页面的唯一设置写入能力入口。MCP 提供 save/toggle/remove/authenticate/setup；插件接收 install/toggle/uninstall 三种确定命令，页面不能指定 method、ServiceOperation 或任意 params。
- `useSettingsMutation`：窗口表单的 busy/notice 和生命周期保护。连接/会话身份变化后丢弃旧反馈；身份往返 A/B/A 仍用递增表单版本阻止旧完成回写，卸载后不更新表单。
- `McpSettings` / `PluginSettings`：仅保留输入、展开、确认和 Setup 选择值；提交成功触发现有 SettingsSurface 读回。输入不写入窗口偏好，未另建内核配置状态源。
- 按钮、输入、选择、标签与多行输入统一用 Btn/Field/TextInput/SelectControl/TextArea；目标页面不再使用 set__write 或自绘控件。

兼容函数 `settingsWritesModel.mcpWriteParams` 只转发到共享输入校验和 core 编码，供旧契约测试保留调用路径；没有维护第二套 MCP 校验/编码。其余 Model/Hook 等遗留辅助函数暂未删除。

## 结果与生命周期

结果为 success/setup/confirmation/error 的可判别联合；错误区分 validation、busy、stale、disconnected、unsupported、remote。RPC 被接受不等于业务写入成功，未知或失败状态不会清空输入并报告成功。

同一会话与 transportEpoch 内的 MCP/插件写入共享锁，避免跨页面同时写入。开始前确认 ready 与活跃会话；完成后复核身份。会话切换或重连会阻止插件 reload 继续发往新的作用域；已发送的服务端操作无法撤销，只丢弃过期 UI 反馈。

MCP Setup 只支持实际已接入的 select 字段。缺少 id/options、未知字段类型或重复字段身份返回 unsupported，不猜表单。插件 confirmation_required 不自动确认；用户明确选择后才发送 confirmed:true。requiresReload 会执行真实 reload 并检查其业务结果，失败报告“写入成功；重新加载失败”。

## 验证与治理

新增 9 项设置服务测试 + 1 项 AST 依赖/控件门禁。覆盖业务失败、输入校验、两套 MCP 参数契约、Setup 字段、仓库确认、reload 失败、连接/会话变化及共享写入锁。

目标页面 AST 门禁禁止原始 effect/request/dispatch、线路字段及原生按钮/输入/选择/textarea，防止后续退回散落协议与控件。

架构检查：151 个源码文件、691 条 imports、15 条精确存量例外；没有新增豁免。依赖清单仍由 `pnpm architecture:report` 更新。

设置 Electron GUI：15/15、consoleErrors 为 0，记录 `output/playwright/2026-10-09T08-09-02.278Z-settings/report.json`。模拟服务覆盖原 11 项与新增 4 项：校验拒绝、Setup、卸载确认/reload、A/B/A 迟到结果。测试使用隔离假配置与确定性 ACP 模拟器，没有真实服务认证或模型调用。

Setup 测试曾使用 getByLabel 的精确文本定位失败；截图显示表单已渲染，独立 Chromium 可访问树确认 combobox 名称正确。已改用角色与可访问名称定位，保留失败报告与通过报告供对照。

最终 `pnpm verify`：341 项单测（ACP 41、desktop 300）、架构/样式/类型/构建、53 条夹具审计、协议 7/7、PTY 8/8、恢复 11/11 通过。本地 arm64 包更新后，两次隔离启动与内核回收检查通过；ad-hoc 签名且不含内核二进制。摘要及校验见 [验收证据](frontend-settings-domain-evidence-2026-10-09.json)。

## 后续迁移

ProviderSettings/ModelSettings 宿主能力、SettingsSurface 的读取和缓存、统一 dirty-close 尚未收口；原 Runtime 仍作为组件装配参数，已有页面不再直接调用其协议动作。会话/文件架构与 Rust 内核未修改。

资源 Tab 与只读文件工作区已在 [v1.2](frontend-file-workspace-2026-10-09.md) 落地；继续完善对话读模型与虚拟化。仍需能力矩阵、性能基线及剩余 15 条依赖例外迁移，不能把本批视为 A1–A6 全部完成。
