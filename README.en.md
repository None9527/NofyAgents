# Nofy — Let Agents Build Agents

**A declarative framework for composing models, tools, workflows, memory, permissions, and sessions.**

Give a coding agent a goal, let it create and test an agent through CLI or MCP, and keep the resulting source and dependency list. Specialized agents share the Rust kernel, Loader, execution path, and persistent state.

[Get started](docs/getting-started.en.md) · [CLI/MCP handbook](docs/manual/README.md) · [Release scope](docs/release-notes.md) · [简体中文](README.md)

> Usable developer preview. The Rust CLI, inbound MCP server, source projects, and modular sessions are implemented. This release contains no frontend; the UI will be rebuilt separately. Complete pi, Codex, and OpenCode behavior presets have not been released.

## Available today

- **Create and compose agents.** Configure models, prompts, tools, context, policies, budgets, and sessions. CLI and MCP edit the same source of truth.
- **Connect external implementations.** Use Rhai, standalone scripts/programs, HTTP, or external MCP tools. Ordinary business extensions do not require Rust kernel changes.
- **Build, publish, and recover.** Build complete systems, inspect differences, activate generations, and observe events, approvals, cancellation, and recovery.
- **Keep session state.** Seventeen session operations cover admission, subsequent turns, metadata, archives, and policy changes between turns.
- **Share portable source.** Archives contain declarations, module source, and ordinary dependency lists. Credentials are injected separately; users install interpreters, compilers, and external libraries.

Development protocol: `nofy.kernel/v1`, contract revision `0.3`. There are 68 operations, including 66 inbound MCP tools. Secret values use a separate private local entry point.

## Get started

Linux is the primary evaluation platform. Install the [Rust toolchain](rust-toolchain.toml), then build from the repository root:

```sh
cargo build --locked -p nofy-agent-host -p nofy-cli
./target/debug/nofy --help
```

Follow the [setup guide](docs/getting-started.en.md) to create a private access token and start the kernel. Use CLI or connect Codex through MCP; this release contains no frontend.

```sh
./target/debug/nofy describe \
  --endpoint http://127.0.0.1:7331 \
  --token-file "$NOFY_STATE_DIR/access-token"
```

The development cycle is declaration → module composition → build/validate → publish/apply → run/inspect → revise or export. Source projects may be incomplete during editing; publication requires a complete valid system. Users provide model services, credentials, and business dependencies.

## Coding preset and real acceptance runs

The [coding preset](presets/coding/文件说明.md) is a source template on the same framework. It provides file operations, optional command execution, and read-only code review. A [real-model project repair](docs/verification/coding-real-model-build.md) read code, ran tests, fixed the problem, and changed all six tests from failing to passing.

A separate [real sub-agent run](docs/verification/mcp-sub-agent.md) used standard MCP to create an agent from an empty declaration, compose nine modules, and run a real model. The model invoked a calculation tool, obtained `42`, and completed. The source archive passed byte-for-byte verification.

These records establish their stated scope. Full module cross-testing and pi reproduction remain incomplete, including pi session trees and its distinct steering/follow-up queues.

## Development checks

```sh
bash scripts/check-release.sh
```

This runs formatting, workspace compilation, CLI/MCP development tests, coding source tests, and dependency-boundary checks. See [contributing](CONTRIBUTING.md) and [verification records](docs/verification) for full runtime tests and real process-tree/model acceptance.

- [Module integration](docs/manual/modules.md): factories, slots, dependencies, and external implementations.
- [Sessions](docs/manual/sessions.md): policies and lifecycle.
- [MCP](docs/manual/mcp.md): stdio, Streamable HTTP, and Codex configuration.
- [File guide](文件说明.md): workspace packages and directory responsibilities.

Detailed technical documentation is currently primarily in Chinese.

## License

[Apache License 2.0](LICENSE). Third-party code retains its licenses and attribution; see [THIRD-PARTY-NOTICES](THIRD-PARTY-NOTICES).
