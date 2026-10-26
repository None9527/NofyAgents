# macOS 本地包装与分发（2026-10-08）

应用与内核分开分发。包装脚本只复制已安装的 Electron runtime 与 `dist/main`、`dist/preload`、`dist/renderer`，剔除 source maps。主入口不依赖 node_modules。包不包含 nofy 二进制、用户配置、凭据、历史会话或工作区；应用名称 Nofy，bundle id `dev.nofy.desktop`，图标沿用 renderer 的 IconMark。

## 构建与启动

在 `nofy-desktop/` 执行：

```sh
pnpm package:mac
pnpm verify:package
```

产物：`release/mac-<宿主架构>/Nofy.app`、带版本/架构 zip 和 SHA-256 文件。脚本仅在 macOS 原生执行，使用系统 Swift/AppKit 生成 ICNS、codesign 修复本地 ad-hoc 签名、ditto 保存 bundle 符号链接。源码 `.gitignore` 排除 release 输出。

解压 zip 后可将 Nofy.app 放入用户选择的应用目录。当前包是本地 ad-hoc 签名，未执行 Apple Developer ID 签名、公证、公开发布或自动更新，不代表通过 Gatekeeper 下载分发验证。无需管理员权限的终端启动例：

```sh
NOFY_BIN="$HOME/.local/bin/nofy" /path/to/Nofy.app/Contents/MacOS/Nofy
```

Finder 启动不保证继承 shell 的 NOFY_BIN 环境变量。最直接的默认安装位置为 `~/.local/bin/nofy`。

## 内核安装与发现

仓库 README 当前明确没有此源码树的预编译下载，可从仓库根构建：

```sh
cargo build -p nofy-pager-bin --release
install -m 755 target/release/nofy "$HOME/.local/bin/nofy"
```

首次安装需先建立 `~/.local/bin`。本轮未重新构建 Rust 内核；实测使用已安装的 0.2.121。GUI 选择二进制入口的整合由启动/bridge 实现负责，包装脚本不偷偷下载或捆绑其他版本。

发现顺序：NOFY_BIN → 用户安装位置 → 开发期仓库 target/release/nofy。只有能找到 Cargo.toml 的源码/构建位置才启用仓库兜底，因此已移到应用目录的 bundle 不会误查 `.app/target/release/nofy`。候选必须为可执行的常规文件；缺失、目录或无执行权限都返回明确安装/路径建议。Windows 使用 `.exe` 名仅是路径兼容，尚未验证 Windows 发布。

兼容依据是握手与实际能力线路，不以版本字符串证明所有功能。模型、MCP、插件写入错误会保留现有配置；frontend 不新增或迁移第二套内核配置格式。

## 验证与平台账

`verify-package.ts` 在独立 NOFY_HOME、临时工作区连续启动交付包两次，验证窗口 PNG、进程正常退出和内核 pid 已回收。证据为 `package-macos-verification.json`，截图位于 release 目录。只证明当前 macOS arm64 的本地可执行程序启动；外部安装/下载、公证、更新、卸载及其他平台不能据此计为通过。

| 项目 | 状态 |
|---|---|
| macOS arm64 本地 .app/zip、seal 校验 | 通过 |
| 首次与二次启动、截图、正常退出、内核回收 | 通过 |
| Developer ID / notarization / 公开发布 / 自动更新 | 未执行 |
| Windows/Linux 包装、安装、核心场景 | 未实现或未验证 |
| zip 跨设备 Gatekeeper 场景 | 未验证 |

CI 配置为 `.github/workflows/nofy-desktop.yml`：无凭据 job 生成契约、类型检查、单测、夹具审计、构建；macOS job 产出本地 ad-hoc 包与短期 artifact。模型真实 E2E 不自动消耗凭据。此配置尚未在远端执行，不虚报 CI 已绿。

## 数据与回滚

删除 `.app` 本体不会删除单独安装的内核、`~/.nofy` 的配置与会话或 Electron 的 UI 偏好目录。用户数据保留是默认卸载策略；不提供自动清理凭据或历史的卸载器。回滚时退出应用并换回旧 .app，保留已安装内核与配置；若需要回滚内核，请先备份其配置和会话，并单独验证格式兼容性。

参考：[Electron 手动分发](https://www.electronjs.org/docs/latest/tutorial/application-distribution)、[Electron 签名说明](https://www.electronjs.org/docs/latest/tutorial/code-signing)。
