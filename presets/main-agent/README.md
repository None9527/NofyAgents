# Main Agent source template

`main-agent@0.1.0` assembles a main Agent, bounded asynchronous children,
run-tree messages and a durable Human workflow using the existing Nofy Loader
and runtime. It is a source template, not another scheduler or an always-on
service. Host HTTP/CLI/MCP and embedded consumers use the same declaration.

## Current verification boundary

The deterministic runtime duplex and three preset integration tests pass.
`workflow_execute` was explicitly approved and added only to the main Agent's
default root allow-list; child tool permissions and filesystem/process/network
permissions are unchanged. Human target discovery restores the accepted managed
scope while still rejecting new host policy or governance requirements. The
Human workflow pauses durably, reopens, accepts the response and completes without
repeating its child effect. This is local integration evidence, not live-provider
or native-isolation acceptance.
See [the local verification report](../../docs/verification/main-agent-preset.md).

## Start and supply a model

The template intentionally has no model or credentials. Inspection reports
`main.model` and `module not defined: model`; build must fail until an operator
adds a module with source ID `model` and mounts it on the main Agent's model slot.
The child references that same module. Prerequisite modules can be added while
the source is incomplete. Renaming the root Agent does not rename this model ID.

From the repository root, with the built CLI on PATH:

```sh
nofy project init ./assistant --preset-dir ./presets --preset main-agent --version 0.1.0 --agent main --offline
nofy project inspect --project ./assistant --offline
```

For the resident host, reuse the existing model protocol artifacts rather than
copying a protocol implementation into this preset. The following is a
Chat Completions example. `connection.json` is operator-supplied non-secret
configuration containing an explicit base_url, models list and credential
references. `model.json` contains `{"model":"the-configured-model"}`. Put secret
values only through the host's private credential API, never in source files.

```sh
nofy agent module add main --project ./assistant --offline --id provider --factory resource.model_connection --config-json @connection.json
nofy agent module add main --project ./assistant --offline --id protocol-code --factory resource.artifact --config-json '{"bundle":{"schema_version":1,"files":{}}}' --source /bundle/files/common.rhai=presets/coding/modules/models/common.rhai --source /bundle/files/chat_completions.rhai=presets/coding/modules/models/chat_completions.rhai --source /bundle/files/parameters.schema.json=presets/coding/modules/models/parameters.schema.json
nofy agent module add main --project ./assistant --offline --id protocol --factory resource.model_protocol --config-json '{"source":{"kind":"artifact","entries":["common.rhai","chat_completions.rhai"],"settings_schema":"parameters.schema.json"},"capabilities":{"streaming":true,"image_input":true,"structured_output":true},"limits":{"max_requests":6}}' --bind artifact=protocol-code
nofy agent module add main --project ./assistant --offline --id model --factory model.programmed --config-json @model.json --bind connection=provider --bind protocol=protocol --slot model
nofy project build --project ./assistant --offline --output ./assistant-deployment.json
```

`--source` copies the selected files into this project's source set. Subsequent
source export is self-contained and does not depend on their original paths.
For Responses or Messages use the matching existing protocol file and manifest
configuration in `presets/coding/modules/models/manifest.json` instead. A trusted
embedded application may register its own Model factory and add that as `model`.
Neither option substitutes an unconfined executor for the resident host's worker
isolation. Platform refusal remains a refusal.

Build is pure source rendering. Validate/publish/apply the resulting deployment
through the existing host, then start program `main` with a prompt. These steps
retain ordinary authorization, generation checks and runtime receipts. A source
build does not prove model connectivity or native worker support.

## What is wired by default

- `main-tools` combines `agent_tasks`, `agent_messages` and `ask_user`.
- `delegate` is an execution-bound `tool.skills` catalog. Spawn using
  `{"action":"spawn","task_id":"research","tool":"task","arguments":{"skill":"delegate","args":"the bounded subtask"}}`.
  Use poll/wait to read the real outcome. `settings.input_delivery.duplex=true`
  keeps the original invocation receptive after a model reply while children
  run. A reply event is not final run termination. `Interject`/`FollowUp` inputs
  and eligible peer reports can continue the existing driver; `NextTurn` still
  waits for termination. The parent ultimately joins outstanding children.
- `child-tools` starts with messages only. Children cannot spawn more children
  or ask a Human by default, and receive no shell, filesystem or network tools.
- `tasks-resource`, `tasks-binding` and `tasks` share the same child catalog.
  Keep both the binding and the task tool installed together.
- `human-workflow` persists a question and returns an object with an `answer`
  string. The root allow-list includes `workflow_execute`, the internal dispatcher
  used by this declared workflow, as well as its public `ask_user` wrapper. Call `ask_user` with `{"input":{"question":"...","options":["..."]}}`.
  Read `run.recovery(kind=human)` and submit its exact command with the matching
  response; restarting or polling does not answer the question.
- `floor` is inherited by descendants. `quota` uses one root budget ledger.
  Defaults bound the root to 64 model calls, 128 tool calls, 8 child calls,
  4 active children and depth 4. Root/child step limits are 32/16.

A Human answer is data, not a tool approval or permission grant. A workflow
cannot widen the policy floor or create new OS authority. Unknown side effects
still require the existing reconciliation path instead of an automatic retry.

## Add business tools explicitly

Add a declared tool module, then bind it to the desired composition. For example,
if an operator has installed a tool pack with source ID `lookup` containing tool
`lookup_record`, extend only the child catalog with these source operations:

```sh
nofy agent module bind main child-tools --project ./assistant --offline --dependencies '{"business":"lookup"}'
nofy agent module set main child-tools --project ./assistant --offline --set-json '/packs=["messages","business"]'
nofy agent configure main --project ./assistant --offline --settings '{"allowed_tools":["agent_tasks","task","agent_messages","ask_user","workflow_execute","lookup_record"],"child_allowed_tools":["agent_messages","lookup_record"]}'
```

For main-only tools extend `main-tools` instead; do not give children that pack.
Updating a catalog alone grants nothing beyond the root allow-list and the
child restriction. Keep `child_allowed_tools` nonempty: the underlying generic
skill API treats an empty list as no extra restriction, so this template rejects
empty settings. Effectful tools additionally need an explicit approval policy
such as `policy.on_tools` bound to `policy.approval`; do not confuse ask_user with
that policy. Source edits create new versions, never mutate active runs in place.

## Scope of this phase

This is P5a product assembly. It does not complete native macOS/Windows worker
isolation (P3/P4), persistent knowledge-memory policy, arbitrary recursive agent
creation, model-generated workflow authoring, or the RSI candidate/evaluate/apply/
rollback loop. The baseline has durable run history through the owning host,
not an automatically configured long-term memory store. No existing stack or
consumer gate is weakened.

Run the shipped deterministic public-API integration checks with:

```sh
cargo test --locked -p nofy-agent-host --test main_agent
```

Those tests install a deterministic in-process Model adapter and exercise the
actual template, source editor, Loader/runtime, SQLite state and control API.
They do not count as a real provider call or an OS isolation test.

## Duplex increment and its boundary

The main Agent opts in to idle coordination; child Agents keep ordinary joining
behavior. Peer reports addressed to this run or `*` wake the parent after its
current model/tool work and closing hooks settle. Own sends and messages addressed
to other runs do not. Reports retain sender/cursor provenance, are synthetic peer
data, and never grant approval or become captured raw user input. Manual board
reads do not acknowledge automatic delivery.

The original invocation and root lease stay alive throughout this interval.
Foreground model output is already published through the existing event stream;
`invoke` still waits for the whole run. Hosts must consume events concurrently.
This is **not** an independent conversation-owned background job, an always-on
idle service, or a complete cross-turn task lifecycle. Once children settle and
available reports are drained, the original invocation terminates normally.

Recovery resumes the same run with its task journal, message board and transcript
cursor. Committed reports are not appended again. A lost external operation
still requires the existing reconciliation rules; restart never implies safe
replay of an effect. Budgets, policies and cancellation remain root-scoped.
See [the ownership and ordering contract](../../docs/architecture/duplex-agent-contract.md).
