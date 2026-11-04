# Build and start CLI/MCP

[Home](../README.en.md) · [Handbook](manual/README.md) · [简体中文](getting-started.md)

Linux is the primary evaluation platform. Use the [pinned Rust toolchain](../rust-toolchain.toml). Supply model services and external dependencies separately. This release contains no frontend.

## 1. Build

From the repository root:

```sh
cargo build --locked -p nofy-agent-host -p nofy-cli
./target/debug/nofy --help
```

## 2. Create private state and an access token

Use Bash. Enter at least 32 non-whitespace characters; input is hidden. This kernel access token is separate from the model API key.

```bash
umask 077
NOFY_STATE_DIR="${XDG_STATE_HOME:-$HOME/.local/state}/nofy"
mkdir -p "$NOFY_STATE_DIR"
read -rsp 'Kernel access token (at least 32 characters): ' NOFY_ACCESS_TOKEN
printf '\n'
export NOFY_ACCESS_TOKEN
printf '%s' "$NOFY_ACCESS_TOKEN" > "$NOFY_STATE_DIR/access-token"
printf '%s\n' '[{"token_env":"NOFY_ACCESS_TOKEN","scopes":["read","edit","publish","resources","execute"]}]' \
  > "$NOFY_STATE_DIR/access.json"
chmod 600 "$NOFY_STATE_DIR/access-token" "$NOFY_STATE_DIR/access.json"
```

The access configuration stores an environment reference. For an existing instance, use its connection configuration. Do not open the same state directory twice or replace a token file used by another instance.

## 3. Start the kernel

In the same terminal, from the repository root:

```sh
./target/debug/nofy-agent-host \
  --state-dir "$NOFY_STATE_DIR/kernel" \
  --access-file "$NOFY_STATE_DIR/access.json" \
  --preset-dir "$PWD/presets" \
  --listen 127.0.0.1:7331
```

Keep the terminal open. `Ctrl+C` stops the process while preserving state. Starting the kernel does not invoke a model.

## 4. Use CLI

Open another terminal in the repository root:

```sh
NOFY_STATE_DIR="${XDG_STATE_HOME:-$HOME/.local/state}/nofy"
./target/debug/nofy describe \
  --endpoint http://127.0.0.1:7331 \
  --token-file "$NOFY_STATE_DIR/access-token"

./target/debug/nofy agent create coder \
  --endpoint http://127.0.0.1:7331 \
  --token-file "$NOFY_STATE_DIR/access-token"
```

An empty project is intentionally incomplete until you configure a model, prompt, and required dependencies. See the [module guide](manual/modules.md) and [CLI reference](manual/cli.md) for composition, build, validation, publication, and execution. A [CLI profile](manual/cli.md) can retain the endpoint and token source for repeated use.

## 5. Connect Codex through MCP

If Codex is installed, register the stdio server from the repository root:

```sh
codex mcp add nofy -- "$PWD/target/debug/nofy" mcp serve \
  --transport stdio \
  --endpoint http://127.0.0.1:7331 \
  --token-file "$NOFY_STATE_DIR/access-token"
```

Reload MCP configuration in the client, then discover tools and call `nofy_describe`. A registered configuration alone does not prove business execution; see the [real sub-agent run](verification/mcp-sub-agent.md) for the acceptance scope. Other MCP clients use the same command. Streamable HTTP is documented in the [MCP reference](manual/mcp.md).

## 6. Models, presets, and source delivery

- The registered [coding preset](../presets/coding/文件说明.md) is a source baseline. Complete pi and other reference presets have not been released.
- Inject model credentials separately through the [private CLI credential interface](manual/cli.md). Declarations keep references only.
- [System examples](../crates/common/nofy-agent-host/examples) and the [operation catalog](manual/operations.json) document native declarations and input/output contracts.
- Source archives contain source and ordinary dependency lists. Users install interpreters, compilers, and libraries; archives have no package-size quota.
- Terminal tools that spawn processes require an explicit [cgroup delegation environment](architecture/process-tree-contract.md).

Access scopes cover the instance; multi-tenant isolation is not provided. This guide uses a loopback listener. Shared source must not contain kernel tokens or model keys.
