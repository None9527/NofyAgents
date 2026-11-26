# Opt-in Managed Agent Consumer

Run from the repository root (see also `.github/workflows/managed-consumer.yml` for the three-platform Linux/macOS/Windows matrix and cross-platform parity check):

```sh
python3 scripts/verify-agent-managed-consumer.py collect \
  --runner ubuntu-24.04 \
  --output /tmp/nofy-opt-in-managed-evidence
```

Use `--runner macos-latest` or `--runner windows-latest` on macOS/Windows (pass `--fetch` on a cold cache), and `python3 scripts/verify-agent-managed-consumer.py compare <dir>` to verify cross-platform parity across all three native artifacts.

The script copies this separate workspace outside the repository, wraps its entrypoint with `nofy_agent_runtime::managed::run` (16 MiB dedicated current-thread Tokio runtime), carries the pinned Rust toolchain, rewrites path dependencies, and builds/runs offline. It verifies business and standalone-coding agents, delegation, parallel composition, memory, settings, policy admission and declarative workflows. Its normal dependency closure excludes product hosts and concrete coding tools. Only public library APIs are used.

The configured consumer also registers a pure stage through `stage.literal`, binds it with `runtime.recipe`, and checks the applied stage data through the public API. The document controls the placement and order; model/tool validation and policy admission remain mandatory.

The configured workflow fixture uses the public WorkflowDocument compiler and frozen restore, runs a model-free lookup Tool node, joins selected output fields, and resumes the completed graph. The workflow feature selects the runtime's private DAG implementation; it has no separate Rhai workflow engine or Orchestra product dependency. Both default and all-feature dependency boundaries are checked separately.

The published workflow library is also consumed through tool.workflow and hook.workflow factories. A configured before_model Hook invokes a workflow that returns a typed Continue decision; all handles are installed by the external host and JSON selects only published versions.

The public CompiledProgram wrapper freezes a real Tool program, restores its version 2 execution snapshot, and runs/resumes it with an explicit checkpointer. This fixture also exercises that interface without SQLite or any product host dependency.

`configured-system.json` 为声明式系统单文件源。消费程序通过相同进程中的 ControlPlane 发布、文件持久化、apply、切换 Prompt、导出及导入新 catalog；不启用 SQLite。宿主仍须安装示例声明要求的工厂和资源，当前 fixture 不是完整常驻管理宿主或运行中热更新验收。
