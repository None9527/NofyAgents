# 前端开发基线

2026-10-09。仓库 HEAD `51643aed`，当前分支“二次开发分支”；基于现有未提交改动继续开发，未回退其他 Rust/旧壳工作。

实际内核 `~/.local/bin/nofy`：`nofy 0.2.121 (e9401ff4dc96)`。Node 24，pnpm 11.7.0；依赖与实际命令以本目录 package.json/pnpm-lock.yaml 为准。

当前本机默认测试模型 `gemini-3.8-flash-high`；API 凭据只在本机用户配置，记录中不保留。JSON 模型配置入口支持安全读取和受限写入；孤立 legacy TOML 明确只读。

验收分层：真实 nofy 路线见 frontend-live-acceptance.json / turn-rewind-probe.json；Electron GUI 用确定性测试内核与隔离 HOME，原生对话框提供者替换，其余 IPC、路径校验、保存文件与本地偏好走生产代码。

Desktop 核心通过不代表原生采样器 p95、其他操作系统、签名、公网发布或远端 CI 通过；对应边界在 frontend-acceptance.md。
