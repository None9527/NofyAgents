# 从源码启动 CLI 与 MCP

[返回首页](../README.zh-CN.md) · [完整手册](manual/README.md) · [English](getting-started.en.md)

主要体验环境为 Linux。Rust 工具链见 [rust-toolchain.toml](../rust-toolchain.toml)。模型服务和外部业务模块的依赖自行准备。当前发布不包含前端。

## 1. 编译内核和 CLI

在仓库根目录执行：

```sh
cargo build --locked -p nofy-agent-host -p nofy-cli
./target/debug/nofy --help
```

## 2. 准备私有状态与访问令牌

以下 Bash 命令使用固定私有状态目录。输入至少 32 个非空白字符，输入不会回显。这是本地内核访问令牌，与模型 API key 分开。

```bash
umask 077
NOFY_STATE_DIR="${XDG_STATE_HOME:-$HOME/.local/state}/nofy"
mkdir -p "$NOFY_STATE_DIR"
read -rsp '内核访问令牌（至少32字符）: ' NOFY_ACCESS_TOKEN
printf '\n'
export NOFY_ACCESS_TOKEN
printf '%s' "$NOFY_ACCESS_TOKEN" > "$NOFY_STATE_DIR/access-token"
printf '%s\n' '[{"token_env":"NOFY_ACCESS_TOKEN","scopes":["read","edit","publish","resources","execute"]}]' \
  > "$NOFY_STATE_DIR/access.json"
chmod 600 "$NOFY_STATE_DIR/access-token" "$NOFY_STATE_DIR/access.json"
```

`access.json` 只保存环境变量引用；`access-token` 为私有文件。已有实例应复用自己的连接配置，不要同时打开同一状态目录或改写正在使用的令牌文件。

## 3. 启动常驻内核

继续在同一终端、仓库根目录运行：

```sh
./target/debug/nofy-agent-host \
  --state-dir "$NOFY_STATE_DIR/kernel" \
  --access-file "$NOFY_STATE_DIR/access.json" \
  --preset-dir "$PWD/presets" \
  --listen 127.0.0.1:7331
```

保持该终端运行。`Ctrl+C` 停止内核，状态仍保存在私有目录。启动本身不连接模型，也不会产生模型调用。

## 4. 使用 CLI

另开终端，在同一仓库根目录执行：

```sh
NOFY_STATE_DIR="${XDG_STATE_HOME:-$HOME/.local/state}/nofy"
./target/debug/nofy describe \
  --endpoint http://127.0.0.1:7331 \
  --token-file "$NOFY_STATE_DIR/access-token"

./target/debug/nofy agent create coder \
  --endpoint http://127.0.0.1:7331 \
  --token-file "$NOFY_STATE_DIR/access-token"
```

`coder` 是允许缺项的源码工程；空 Agent 不带虚构的模型或工具。按[模块手册](manual/modules.md)和 [CLI 手册](manual/cli.md)添加能力，再构建、校验、发布并运行。

重复使用时可以设置 [CLI profile](manual/cli.md#连接与通用选项)，只保存端点和令牌来源。

## 5. 接入 Codex MCP

已安装 Codex 时，在仓库根目录登记标准 stdio Server：

```sh
codex mcp add nofy -- "$PWD/target/debug/nofy" mcp serve \
  --transport stdio \
  --endpoint http://127.0.0.1:7331 \
  --token-file "$NOFY_STATE_DIR/access-token"
```

在重新加载 MCP 配置后的 Codex 会话中，让编程 Agent 发现工具并创建／配置 Agent。登记配置与业务验收是两个步骤；可先调用 `nofy_describe` 核对连接，再按[真实 sub 验收范围](verification/mcp-sub-agent.md)执行完整流程。

其他 MCP 客户端使用相同命令；Streamable HTTP 配置见 [MCP 手册](manual/mcp.md)。

## 6. 模型、预设和交付

- [coding 预设](../presets/coding/文件说明.md)是已登记的源码基线模板；pi 等完整复现预设尚未发布。
- 模型 API key 通过 [CLI 私有凭据入口](manual/cli.md)单独注入，声明只引用凭据名称。
- [完整系统示例](../crates/common/nofy-agent-host/examples)展示原生系统；[操作目录](manual/operations.json)提供可发现输入／输出契约。
- 源码归档只交付源码和普通依赖清单，不安装或打包 Python、GCC、库，也不设置包体配额。
- 可派生进程的终端工具需要显式 [cgroup 委派环境](architecture/process-tree-contract.md)；普通文件工具与 Bash 进程树各有运行前提。

访问作用域覆盖实例，当前没有多租户隔离。此指南使用本机监听；配置分享不包含访问令牌或模型密钥。
