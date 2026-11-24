# Omni Agent 预设文件说明

- `project.json` 指定工程声明、派生参数（`prepare.json`）及配置入口。`preset.json` 通过 `module_imports` 装配唯一的 `main` 和它的全部可组合能力。
- `settings.schema.json` 定义模型协议、连接、工作区、受限命令隔离与预算的完整嵌套 Schema。`settings.json` 由操作者配置。默认 SDK 工具由 Host 在进程内提供。
- `prompt.md` 定义 Omni 的工作方式；工作区文件（`workspace-files`）、受限命令执行（`workspace-command`，支持 `process_tree` 与 `namespace` 两种隔离模式）与多协议模型（`chat_completions` / `responses` / `messages`）均以不可变模块包方式导入，无内联 Python 复制。
- `.nofy-module-packages/` 保存固定摘要的协作、多协议模型、工作区文件与命令、装配和上下文压缩源码。`source-files.json` 是完整源码清单。
- `README.md` 记录配置与再生成入口。预设目录由 `omni_preset` 生成，修改能力时更新生成器或其输入并重新生成。
