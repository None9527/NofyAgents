# Omni Agent

With the Nofy preset registry configured, `nofy --toolset development project init PROJECT` selects Omni. For a local checkout, append `--preset-dir ./presets --offline`. Its program is `main`. Configure `connection` and `model` through the SDK development view or `nofy --toolset development agent configure main --project PROJECT --offline --settings @SETTINGS.json`. Build and publish through the development toolset, then activate through the operations toolset.

The model connection uses credential references. Select the wire protocol with `model_protocol` (`chat_completions` by default, or `responses` / `messages`). The root has coordination, bounded child assembly, and durable user questions. To enable workspace files, set `workspace_enabled`, `workspace`, and `workspace_environment` using the `resource.process_local` contract. Commands separately require `command_enabled`, `command_environment`, `workspace`, and either `process_tree` (`command_isolation: "process_tree"`, default) or `command_isolation: "namespace"` with optional `process_namespace` limits. Writes and commands use the existing approval policy.

Omni mounts `tool.sdk_authoring` by default. The model reads SDK operation contracts, generates module templates and queries the Host's module catalog in-process. A model connection is the only connection required for the authoring tools. MCP remains available to external clients.

Omni mounts `tool.sdk_work` for orchestration. An authorized deployment can set `background_targets` on the mounted module to grant specific Agent and Workflow programs in that release. `sdk_work_targets` discovers those programs. `sdk_work_start` registers independent work for the current session and returns the stable work ID. New turns can list the session's work, replay changes using a watermark, and inspect or control owned work. The CLI offers the same operations under `nofy work`, and the default MCP toolset exposes their corresponding `nofy_work_*` names. External callers select a session, root or work ID and authenticate with the operation's required scope.

`sdk_work_attached_targets` and `sdk_work_task` handle temporary work in the parent invocation. For persistent memory across sessions, mount the same authorized memory resource in each participant. Workflow Agent nodes need child memory grants, and separate projects can use separate resource namespaces.

The validation flow takes the model-authored candidate through `agent.module.add` in a separate source, `agent.build`, `system.publish` and `session.start`. Check the actual result before publishing the reusable package with `module.publish`. Attach its exact version with `agent.module.use`, publish the new release, apply it at the expected generation and start a fresh session. Use an explicitly authorized SDK client for these operations. The integration test exercises all these steps with a deterministic local model.

```sh
cargo build --locked -p nofy-agent-host
cargo test --locked -p nofy-cli --test development omni
```

The checked-in source is reproducible with `cargo run --locked -p nofy-agent-project --example omni_preset -- OUTPUT`, where `OUTPUT` is a new directory.

## Context compaction

Omni uses the configured model to summarize earlier turns and keeps the current turn intact. The automatic threshold defaults to 75% of `context_window`, which defaults to 262,144 tokens. Set `context_window` to the limit advertised by your model. The policy (`context-compaction@0.2.2`) estimates tokens using a tiered UTF-8/CJK heuristic (ASCII bytes divided by 4, non-ASCII/CJK characters at ~1.5 tokens each), and `compaction_keep_turns` controls the number of earlier user turns kept intact during automatic compaction. Enter `/compact` at the start of a new user turn (with or without attachments) to request compaction explicitly.

Successful compaction persists the summary in session history and emits a `ModelUsage` event with `provider.purpose` set to `context_compaction`. The ignored `context_compaction_live` tests exercise explicit and automatic compaction against the endpoint selected by `NOFY_LIVE_MODEL_URL` and `NOFY_LIVE_MODEL`.

## Preauthorized prompt evolution

Enable `evolution_enabled` in the Omni source settings and activate the resulting release before granting evolution. Start the Host with `--evolution-config FILE`, or call `KernelHost::with_evolution` before starting the worker. The operator's JSON grant contains `system`, `baseline` with exact `release` and `generation`, and `evaluation` and `observation` arrays. Each array contains 1–8 objects with `input` and exact `expected` text. The grant is for a single replacement of `main`'s `prompt.static` version at that baseline. The model receives `sdk_propose_prompt`, accepting only the complete replacement prompt.

The Host stages the candidate release, compares the locked modules and runs both suites on the baseline. It runs the evaluation suite on the candidate using the same model, a one-step Agent and a fixed output-token limit. The isolated probe Agent receives the specified text and its prompt. It has an empty tool catalog and no task bindings, context sources or hooks. The Host uses exact output comparison and stores the probe IDs, match results and output digests.

For a goal that changes observable behavior, set `baseline_expected` to the known current output and `expected` to the required new output. Without `baseline_expected`, the same expected output applies to both. An observation case with a shared expectation can protect behavior that the new version should retain.

When evaluation passes, the Host uses the recorded baseline generation to activate the candidate. It runs the observation suite after activation. A mismatch triggers reactivation of the previous release at the candidate generation. A newer activation supersedes the pending decision. New sessions can use the active release and existing sessions retain their bound release.

Keep the same grant and Host state directory to resume after a restart. Use `--system-file` for initial bootstrap only. That flag activates the supplied deployment whenever it differs from the active release. `omni-evolution.sqlite` holds the Host receipt, including evaluation, activation and rollback evidence. An embedded operator can read it through `KernelHost::evolution_receipt`. `nofy --toolset operations system history SYSTEM` shows the activation receipts. To authorize a further proposal, supply a grant for the current release and generation. Runtime history transfer covers managed runs and is separate from this Host journal.

The feature evolution integration test asks Omni to design a ticket-triage Agent, Skill and MCP contract. An authorized SDK client installs the design as a separate release. Fresh sessions load the Skill and use the authored lookup through Streamable HTTP MCP. Omni then receives the test evidence and submits a prompt proposal. The goal changes account-access routing to the identity queue while a control case preserves the baseline answer. Run with `cargo test --locked -p nofy-cli --test development feature_evolution` after building the Host.

## Real-model authoring

An embedding operator can mount `tool.sdk_feature` and configure `KernelHost::with_feature_authoring`. The grant pins the authoring system and baseline activation, a new specialist system name, a loopback MCP resource, one allowed remote tool and the acceptance inputs. Omni uses `sdk_feature_create`, `sdk_feature_verify` and `sdk_feature_publish` in process. The compiler binds the inherited model, authored prompt and Skill, pure Rhai tool and Hook, and granted MCP connection. The Host worker executes each check through the managed queue. Allow at least one additional worker slot for these checks during the parent authoring run.

Publishing requires matching output plus successful execution receipts for the Skill, Rhai tool, MCP tool and Hook on the exact draft revision. The new specialist system starts at generation one. Omni can then submit a separate prompt proposal using the existing evolution grant.

The optional HTTP feature grant pins a loopback service, the direct lookup path, the catalog path, the invocation path and the expected discovered tool. Omni reads the grant through `sdk_feature_catalog` and submits its declarations through `sdk_feature_create_http`. Verification requires both HTTP tool invocations on the exact draft and the expected output. The live test also checks discovery and both invocations after publication in a fresh session.

The ignored integration test uses a tool-capable real OpenAI-compatible model. It provisions the baseline, trusted MCP lookup and acceptance rules, and submits the user goal. The model authors the specialist, revises drafts if necessary, verifies and publishes through its own tools, then proposes its own prompt change. To run it, build the Host and supply the local model endpoint and its model ID.

```sh
cargo build --locked -p nofy-agent-host
NOFY_LIVE_MODEL_URL=http://127.0.0.1:18277/v1/ NOFY_LIVE_MODEL=qwen27b \
  cargo test --locked -p nofy-cli --test development omni_authors_verifies_publishes_and_evolves_on_a_real_model -- --ignored --nocapture
```

The extended grant also admits an author-designed Workflow over the local tool, a private project Memory resource, and a Policy that pauses a memory write for approval. Only the exact project note in the operator grant receives a one-time approval. The verifier checks the original pause, resumed run, memory item identity on readback, Workflow execution, and successful Tool, Skill, MCP and Hook calls before permitting publication.

Run the extended case with `omni_authors_workflow_memory_policy_and_triggers_live_rollback` in the same command. A separate legacy query is checked after activation. Its live response must regress before the Host rolls back, and a new session must use the restored version. Set `NOFY_LIVE_REPORT` to a file path to save the release receipts, tool evidence and a row for each registered factory. The report identifies factories exercised by this workload and lists those that still need a live case.

`omni_exercises_model_authored_assembly_and_durable_coordination` covers driver discovery, a model-authored Workflow with an Agent node, durable delegation, run-tree messages and exact-node lookup. Its verifier reads the task and work receipts emitted by the kernel. Set `NOFY_LIVE_COORDINATION_REPORT` to retain the evidence.
