# Main Agent composable repository

`main-agent@0.2.0` is a self-contained declaration assembled from immutable packages in the existing ModuleStore, not a new runtime or a remote Git repository. Runtime factories (ModuleRegistry) are trusted implementations. ModuleStore stores versioned source definitions. Registering a source repository never registers native code or grants tools.

This version adds model-specified child Agent and Workflow declarations over explicit model/tool dependencies. It is not arbitrary native code installation, recursive authority creation, persistent cross-invocation jobs or RSI.

## Configure and build

The shipped project contains the Chat Completions protocol source. Set `model` and `connection` explicitly using `nofy agent configure main --project ./assistant --offline --settings @provider.json`. `connection` must contain the provider base URL, admitted models and credential references accepted by `resource.model_connection`; inspect its actual schema with `nofy schema --factory resource.model_connection`. The base URL is a canonical HTTPS directory URL ending in `/`, such as `https://api.example.invalid/v1/`. Never store a credential value in a source file. Configure credentials separately through the private host credential API.

```sh
nofy project init ./assistant --preset-dir ./presets --preset main-agent --version 0.2.0 --agent main --offline
nofy project inspect --project ./assistant --offline
nofy agent configure main --project ./assistant --offline --settings @provider.json
nofy project build --project ./assistant --offline --output ./assistant-deployment.json
```

Build performs pure rendering. It does not prove provider connectivity or native worker isolation. Validate, plan and apply through the existing host, retain the returned release/generation, then start the `main` program. An unsupported isolation requirement remains a refusal.

## What assemble accepts

The installed tool description carries concrete admitted module references and complete Agent and Workflow examples. The input is either `{kind:"agent", document:AgentDocument, prompt:"task"}` or `{kind:"workflow", document:WorkflowDocument, input:...}`. Agent documents select model/tool packs and literal prompt modules. Workflow documents define real dependency graphs; Agent nodes receive a string prompt. Compilation validates the whole declaration before execution.

Only prebound model/prompt/tool-pack references and new pure `prompt.static` modules are accepted. The default assembly binding exposes the configured provider model and `child-tools`; it does not expose the main tool pack. It cannot install factories, publish packages, change permissions, bind arbitrary resources or modify the active root Agent. A successful response is execution output, not publication. Reuse across later runs is an explicit source/package operation through ModuleStore, not an automatic side effect of assemble.

Bounds: 512 KiB request, 32 local prompts of at most 64 KiB each, at most 16 Agent definitions, 16 tool runtimes, 8 workflows, configured total nodes (default 64, maximum 128), workflow parallelism at most 8, configured child step limit (default 32, maximum 256). Root policy and shared budget still dominate every nested operation. Workflow Agent nodes use the existing internal `workflow_agent` dispatcher, which must also be explicitly included in the root allow-list; a missing entry fails closed and is not bypassed by `assemble`. Dynamic Human and `on_error.exhausted:pause` are rejected before effects; use `ask_user` for durable Human decisions.

## Reuse and reproduce

`modules/module-repository.json` indexes the foundation, main-agent and model protocol packages. Register it as a directory/Git repository and explicitly sync. Use `schema(package)` then `agent.module.use`; do not confuse acquisition with activation. Imports pin source digests and the preset carries the frozen package sources under `.nofy-module-packages/`, so export/build needs no originating repository or network. Published package versions are immutable; edits require new versions.

The reproducible source generator uses public APIs only:

```sh
cargo run --locked -p nofy-agent-project --example main_agent_repository -- /tmp/main-agent-source
```

Its output directory must be absent. It uses a temporary ModuleStore, makes no host/network changes and does not execute a model. Compare the resulting source digest to the checked-in preset using the public source APIs.

## Current capability boundary

- Existing `task` skill children plus `assemble` declaration-driven children share the same task service, root budget, cancellation and policy floor.
- `child-tools` is an editable composition and starts with messages only. Add business tools and permissions explicitly.
- `ask_user` is a statically declared durable Human workflow; an answer is data, not approval. Dynamic Human nodes are deliberately rejected until exact recovery discovery exists.
- Duplex keeps the original invocation alive while its child tasks run. It is not conversation-owned persistent background scheduling.
- Static declarations and model protocol resources are included; model service/credentials, OS helper capabilities and actual native safety proofs remain operator/platform inputs.
- Long-term memory, full recursive assembly, autonomous reusable-package publishing and candidate/evaluate/apply/rollback RSI are not delivered by this source milestone.
