# 前端交付与验收状态

更新：2026-10-09。以实际执行记录区分代码、GUI 与真实线路，不沿用旧施工勾选。

| 阶段 | 已交付 | 实际验证 | 边界 |
|---|---|---|---|
| M0 | 当前配置、契约、验收账与源码证据 | 全量 verify；真实接口替换验证 | 当前安装内核 0.2.121；不能仅凭版本字符串推断含所有 Rust 未提交改动 |
| M1 | 系统项目选择、最近项目、按会话隔离草稿、最新意图导航、最后会话恢复 | 项目 GUI、回放/reload GUI | 原生对话框提供者在 GUI 回归中替换为确定结果；IPC/目录验证/写文件均为生产代码 |
| M2 | 重命名、导出、fork、搜索/定位、本地归档/置顶/未读/分组、两阶段回退 | 真实会话写路径；真实 files_only/all 回退；项目 GUI | 编辑输入是复制到草稿；内核没有独立 retry，未伪造；完整导出入口不冒充已加载导出 |
| M3 | 权限与范围/附言、计划、问答、MCP 表单、停止范围、队列操作、请求失效保护 | 实际接口 6/6；模拟内核 GUI；断连与回放单测 | 实际线路程序化回答与 GUI 模拟分别记账；早期权限超时仍保留失败历史 |
| M4 | 模型/供应商/default native JSON 配置、密钥、MCP/插件写操作、hooks/内置目录、语言/字号/系统主题 | 设置 GUI 11/11，含忙碌/旧版本拒绝；真实 MCP 工具/表单/启停删除；native 写入与重启 | 旧 TOML 只读；项目 MCP 与完整 personas 写管理不是本轮已交付能力 |
| M5 | 1000 块回放合并刷新、查找、键盘/IME、两主题、1024 窄屏、xterm 跟随系统主题 | 渲染 GUI 11/11、设置 GUI、零 pageerror | 自动化输入延迟不是原生 profiler p95；高级媒体查看器仍为扩展范围 |
| M6 | 本地 macOS .app/zip、二进制发现、候选启动/退出、CI 配置 | 两次安装包运行，内核回收；本机验证命令 | 本地 ad-hoc，不代表公开发布、Gatekeeper、notarization、其他平台或远端 CI 通过 |

## 可复跑入口与证据

- `pnpm verify`：gen/ui:check/typecheck/test/audit/build/smoke/PTY/recovery。
- `e2e/renderer-acceptance.mjs`：11 项 Electron 界面操作，确定性 ACP 模拟器，无真实模型。
- `e2e/project-actions.mjs`：11 项项目、导出、会话组织、删除与持久化。
- `e2e/settings-acceptance.mjs`：11 项设置、native 模型保存/重启、忙碌/旧版本拒绝、MCP、主题/语言/布局。
- [真实线路 JSON](frontend-live-acceptance.json)：问答、权限、计划、MCP、停止、断流恢复各有 evidence 与 priorFailureNotes。
- [真实回退 JSON](turn-rewind-probe.json)：预览无文件变更、提交结果、两种范围 fresh load 的不同转录。
- [配置控制器](native-model-config-spec.md)：任务/审批 gate、受限字段、机密不回显、备份、CAS 与单内核重启。
- [本地包运行](package-macos-verification.json)：包路径、运行次数、退出码、截图、内核回收。

所有 GUI 运行的 report、截图和 wire 位于 `output/playwright/`；模拟器 wire 不是用户真实模型数据。
发布包位于忽略目录 `release/`。验收日志不能包含真实密钥、原始模型配置或敏感请求。
本次全量 `pnpm verify`：ACP 41/41、桌面 270/270，类型/夹具审计/构建及三类 smoke 通过。
GUI 渲染 11/11、项目 11/11、设置 11/11；真实线路 6/6，真实回退两种范围均通过。
远端 CI 未执行；`.github/workflows/nofy-desktop.yml` 是 GitHub Actions 配置，不能据此声称当前远端平台已有运行结果。

## 对话与设置样式

本轮参照 ZCode 收口主题令牌、共享控件和页面布局，详见 [统一样式方案](ui-style-system.md)。按钮、输入与弹窗共用实现；六个 CSS 模块同上下文重复 selector 检查已加入 verify 与 CI。

## 后续范围

继续以独立切片交付高级媒体、完整历史导出、personas 写管理、多源任务与自动化。
TOML 迁移需要格式保持与注释处理方案；外部 CLI 的共享锁与原子回退检查属于内核协作需求。
签名、其他平台与公开分发各自建验收账，不根据本机通过推断远端通过。


## 2026-10-11 架构交付

395 项单测、68 项隔离 Electron GUI、本机三次性能预算与包装验证见 [架构收口](../architecture/frontend-closeout-2026-10-11.md)。这是客户端架构迭代的新增证据，不替代此前真实线路记录；远端 CI 和其他平台未实测。
