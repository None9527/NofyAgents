# 设置与语言 GUI 验收（2026-10-08）

使用真实 Electron 窗口、临时 HOME/NOFY_HOME/user-data-dir 与 ACP 测试内核。不会读取真实凭据，也不会修改真实模型/MCP/插件配置。脚本：`node apps/desktop/e2e/settings-acceptance.mjs`，先 `pnpm build`。

最终有效报告（2026-10-09 追加原生模型配置）：`output/playwright/2026-10-09T02-19-16.111Z-settings/report.json`。11/11 通过，renderer console errors = 0。截图：同目录 `settings-en.png`、`settings-zh.png`、`settings-light.png`、`terminal-system-dark.png`、`1024-dark-plan.png`、`1024-light-plan.png`、`provider-native-saved.png`、`provider-approval-refused.png`、`provider-stale-refused.png`。

| 场景 | 结果 |
|---|---|
| 设置 EN/ZH 即时切换，返回工作区保留含中文草稿 | 通过；静态建议、Send、标题随语言变化，草稿原文不变 |
| 系统主题 light/dark 媒体变化及固定浅色覆盖 | 通过 |
| 字号 18px 与英文选择经过 renderer reload 恢复 | 通过；之后恢复测试默认 14px/中文 |
| 已挂载 xterm 在系统主题变化后配色更新 | 通过；light foreground 与 dock 同为 oklch(0.269 0 0)，dark 同为 oklch(0.87 0 0) |
| MCP GUI 新增→停用→启用→认证→删除并读回 | 通过测试内核；真实内核写形状另见 settings-write-probe.json |
| 插件 GUI 安装→停用→启用→卸载 | 通过测试内核；真实隔离本地插件生命周期另见 settings-write-probe.json |
| 凭据表单在保存确认后清除测试输入 | 通过；只输入无效的 E2E 字符串，输出 wire 中 redact |
| 计划审批挂起时尝试原生模型保存 | 拒绝；原配置字节、内核 PID、ID/名称/密码输入都保留；返回工作区可批准原请求，随后正常保存成功 |
| 配置被外部修改后提交旧 revision | 拒绝；外部配置 SHA256 保持一致，新条目未写入，ID/名称/密码输入都保留；可取消并重新读取 |
| 原生模型配置表单→用户 JSON 保存→单内核重启→脱敏读回 | 通过；仅临时 HOME，dummy key，默认模型及共享供应商 schema 保存正确，恰好两个连续 PID，未启动并行内核 |
| 1024×768 暗/亮主题，composer 与计划批准动作可达 | 通过；确认动作滚入视图并验证 elementFromPoint 没有遮挡，真实 click 执行成功 |

本轮修复的实际 GUI 缺陷：MCP 当前启停状态读取优先使用 `session.enabled`，不再误将 configured/default enabled 当成运行态；已挂载终端监听 `<html>` 实际主题 class，响应系统主题变化并在卸载时清理；建议文字在渲染时翻译，语言切换不再保留模块初始化的旧语言。父任务修复的小窗口辅助面板宽度与 composer 菜单布局已由此脚本复验。

语言资源覆盖的是前端拥有的静态 keys：可执行资源覆盖测试确保每个 tr literal 都有英文资源。它不是对内核自由文本的翻译承诺；模型输出、计划正文、MCP schema 标题、工具结果、用户草稿保持原文。中文与 English 的语言名称也保持各自原生名称。

`pnpm typecheck` 通过；最新全桌面 Node 单测 268/268；其中原生配置适配器 5 个测试覆盖高级字段、嵌套模型覆盖、CAS、权限、秘密脱敏与格式拒绝。设置是整页路由，MCP/插件确认使用非模态 details；此脚本没有发现需要新增焦点 trap 的设置对话框。

边界：测试内核只验证 GUI 与出站契约，不证明真实服务网络连接、MCP 工具正确执行、有效供应商凭据或全系统安装/重启；字体/语言恢复这里验证的是 renderer reload。真实模型完整对话、系统级重启仍由主验收账登记。

追加安全 GUI 门（2026-10-09）：最新 11/11 报告中 pending approval 拒绝保持同一个 PID，stale revision 拒绝保持外部配置哈希。该次仅修改 E2E 脚本，产品代码冻结；源码端点覆盖定向回归另有 7/7 model-config 单测证据。
