# Omni Agent 预设文件说明

- `project.json` 指定工程声明及配置入口。`preset.json` 装配唯一的 `main` 和它的能力。
- `settings.schema.json` 定义模型、工作区和命令的公开设置。`settings.json` 由操作者配置。默认 SDK 工具由 Host 在进程内提供。
- `prompt.md` 定义 Omni 的工作方式。`rules.md` 与 `modules/` 提供 Coding 的工作区能力。
- `.nofy-module-packages/` 保存固定摘要的协作、模型、装配和上下文压缩源码。`source-files.json` 是完整源码清单。
- `README.md` 记录配置与再生成入口。预设目录由 `omni_preset` 生成，修改能力时更新生成器或其输入并重新生成。
