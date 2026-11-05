use super::*;
use nofy_agent_project::repository::PackageView;

fn slots(kind: &str) -> Value {
    let (names, cardinality) = match kind {
        "model" => (vec!["model"], "one"),
        "prompt" => (vec!["prompt"], "one"),
        "tool_pack" => (vec!["tool_packs", "tools"], "many"),
        "tool_source" => (vec!["tool_sources", "tools"], "many"),
        "context_source" => (vec!["context_sources", "context"], "many"),
        "context_policy" => (vec!["context_policies"], "many"),
        "policy" => (vec!["policies"], "many"),
        "governance" => (vec!["governance"], "many"),
        "recipe" => (vec!["recipe"], "one"),
        "middleware" => (vec!["middleware"], "many"),
        "checkpointer" => (vec!["checkpointer"], "one"),
        "binding" => (vec!["bindings"], "many"),
        "hook" => (vec!["hooks"], "many"),
        "session_policy" => (vec!["session_policy", "session"], "one"),
        _ => (vec![], "dependency_only"),
    };
    json!({"kind":kind,"names":names,"cardinality":cardinality,"resource_rule":"Resources, stages, hook handlers and event producers connect by dependency; do not attach them directly as Agent tools."})
}
pub(crate) fn factory_guide(
    descriptor: &Value,
    configured: Option<&Value>,
    capabilities: Option<&Value>,
) -> Value {
    let name = descriptor["factory"].as_str().unwrap_or("");
    let kind = descriptor["kind"].as_str().unwrap_or("");
    let mut guide = base(
        "factory",
        name,
        "Configure an installed factory, derive its named dependencies and attach the resulting kind to a compatible slot.",
    );
    guide["availability"] = json!({"status":"installed","reason":"The current kernel returned this descriptor. Resource configuration, authorization and environment readiness are separate."});
    guide["slots"] = slots(kind);
    guide["configuration"] = json!({"schema":descriptor["config_schema"],"required":descriptor["config_schema"].get("required").cloned().unwrap_or_else(||json!([])),"rule":"Use config as a structured object in agent.module.add, or explicitly serialize it as config_json. Treat literal business JSON as data."});
    guide["dependencies"] = json!({"declared":descriptor["dependencies"],"configured":configured.and_then(|d|d.get("dependencies")),"status":if configured.is_some(){"derived_for_configuration"}else{"requires_configuration_query"},"rule":"Each dependency map key is a named slot. Its value must reference a module of the exact requested kind. Different resource subtypes may have additional runtime checks."});
    guide["steps"] = json!([
        step(
            "configure",
            "schema",
            json!({"factory":name,"config_json":{"$input":"serialized_config"}}),
            "Read all configuration-dependent slots; do not guess slot names."
        ),
        step(
            "add",
            "agent.module.add",
            json!({"agent":{"$input":"agent"},"target":{"$input":"write_target"},"id":{"$input":"module_id"},"factory":name,"config":{"$input":"config"},"dependencies":{"$input":"dependency_map"}}),
            "Save a declared module. Supply a compatible slot only for attachable kinds."
        ),
        step(
            "inspect",
            "agent.inspect",
            json!({"agent":{"$input":"agent"},"target":{"$input":"read_target"}}),
            "Resolve missing requirements before build/apply."
        )
    ]);
    guide["prerequisites"] = json!([{"id":"authorization","status":"check_kernel","required_capabilities":descriptor["required_capabilities"]}]);
    guide["pitfalls"] = json!([
        "Factory presence proves implementation is installed, not that runtime paths, credentials or delegated services are ready.",
        "Do not invent executable paths, cgroup roots, credential values or model IDs.",
        "Module reference strings in editing APIs are source IDs, alias.export, or documented release URIs; frozen native ModuleRef objects are a different contract."
    ]);
    match name {
        "tool.compose" => {
            guide["summary"] = json!(
                "Combine explicit ToolPacks into one module port without wrapping their dispatchers. Duplicate tool names are rejected."
            );
            guide["examples"] = json!([{"config":{"packs":["files","messages","plan"]},"dependencies":{"files":{"$input":"file_tool_pack"},"messages":{"$input":"message_tool_pack"},"plan":{"$input":"plan_tool_pack"}},"slot":"tool_packs"}]);
        }
        "model.context_fallback" => {
            guide["examples"] = json!([{"config":{"keep_turns":2,"codes":["context_length_exceeded","max_context_length","context_window_exceeded"]},"dependencies":{"model":{"$input":"underlying_model"}},"slot":"model"}]);
            guide["recovery"] = json!([{"rule":"On a configured context-overflow code or HTTP 413 before any delivered chunk, retry once with all system messages and the most recent complete user turns. Original checkpoint history remains complete; the physical view carries an explicit omission marker. This is tail eviction, not a fabricated summary. Hosted tool requests do not retry."}]);
        }
        "model.image_fallback" => {
            guide["examples"] = json!([{"config":{"statuses":[415,422],"codes":["unsupported_image"]},"dependencies":{"model":{"$input":"underlying_model"}},"slot":"model"}]);
            guide["recovery"] = json!([{"action":"inspect_fallback_metadata","path":"completion_info.provider._image_fallback","rule":"Only one fallback before any received chunk; original history remains unchanged. Request budget reserves two model bounds; failed first attempt charges its token upper bound. Hosted tool requests do not retry by image stripping."}]);
        }
        "resource.agent_tasks" => {
            guide["summary"] = json!(
                "A resumable child ToolPack supplied to structured asynchronous tasks. All children must have immutable recovery identities."
            );
            guide["examples"] = json!([{"config":{},"dependencies":{"children":{"$input":"child_tool_pack"}},"slot":null}]);
            guide["next"] = json!([
                "Create binding.agent_tasks with dependency tasks, attach it to bindings.",
                "Create tool.agent_tasks with the same tasks dependency, attach it to tool_packs.",
                "Read the actual agent_tasks tool description for available child names and argument schemas."
            ]);
        }
        "binding.agent_tasks" | "tool.agent_tasks" => {
            guide["examples"] = json!([{"config":{},"dependencies":{"tasks":{"$input":"agent_tasks_resource"}},"slot":if kind == "binding" {"bindings"} else {"tool_packs"}}]);
            guide["lifecycle"] = json!({"ownership":"parent invocation; completion joins children before releasing root lease","operations":["spawn","poll","wait","cancel","list"],"identity":"task_id is unique within one parent invocation; changing its input is rejected","recovery":"explicit parent resume reuses original child identity, checkpoints and budget receipts; uncertain child effects still require run.recovery reconciliation","required_pair":"binding.agent_tasks and tool.agent_tasks must refer to the same resource"});
        }
        "tool.agent_messages" => {
            guide["examples"] = json!([{"config":{},"dependencies":{},"slot":"tool_packs"}]);
            guide["protocol"] = json!({"send":{"action":"send","message_id":"report-1","to":"*","body":{"progress":"finished"}},"receive":{"action":"wait","after":0,"timeout_ms":10000},"scope":"trusted root run tree; sender is the actual run_id; direct messages require the recipient run_id"});
        }
        "prompt.static" => {
            guide["summary"] = json!("A literal system prompt attached to the single prompt slot.");
            guide["examples"] = json!([{"config":{"text":"Use tools for requested effects and report actual results."},"dependencies":{},"slot":"prompt"}]);
        }
        "resource.artifact" => {
            guide["summary"] = json!(
                "Immutable UTF-8 source/data files supplied as a named artifact dependency. Files are not automatically executed."
            );
            guide["examples"] = json!([{"config":{"bundle":{"schema_version":1,"files":{"data.json":"{\"enabled\":true}"}}},"dependencies":{},"slot":null}]);
        }
        "resource.directory" => {
            guide["summary"] = json!(
                "Explicit Host directory authority. read_only/read_write/read_write_execute are distinct grants; private Host state remains excluded."
            );
            guide["examples"] = json!([{"config":{"path":{"$input":"canonical_workspace"},"access":"read_only"},"slot":null}]);
        }
        "resource.process_local" => {
            guide["summary"] = json!(
                "User-provisioned local interpreter/runtime with explicit read and execute dependency paths. It does not install or package dependencies."
            );
            guide["examples"] = json!([{"title":"Linux Python example; validate actual paths before activation","config":{"executable":"/usr/bin/python3","prefix_args":["-s","-B"],"env":{"PATH":"/usr/bin:/bin","LANG":"C.UTF-8"},"paths":[{"path":"/usr","execute":true},{"path":"/lib","execute":true},{"path":"/lib64","execute":true},{"path":"/etc/ld.so.cache"}]},"slot":null}]);
            guide["prerequisites"] = json!([{"id":"confinement","status":"requires_configuration","observed":capabilities.and_then(|v|v.get("process_isolation"))},{"id":"installed_runtime","status":"user_provisioned","rule":"Use an existing interpreter and explicit non-overlapping normalized paths, outside private Host state."}]);
        }
        "tool.process_artifact" | "tool.process_tree_artifact" => {
            guide["summary"] = json!(
                "Run a source artifact under a declared interpreter. JSON input goes to stdin; only the selected entrypoint is executed. Named directory grants are exposed to that tool."
            );
            guide["examples"] = json!([{"config":{"contract":{"name":"read_value","input_schema":{"type":"object"}},"entrypoint":"tool.py","args":[],"directories":{"WORKSPACE":"workspace"}},"dependencies":{"environment":{"$input":"runtime_module"},"artifact":{"$input":"source_artifact"},"workspace":{"$input":"workspace_directory"}},"slot":"tool_packs"}]);
            guide["prerequisites"] = json!([{"id":"confinement","status":"requires_configuration","observed":capabilities.and_then(|v|v.get("process_isolation"))},{"id":"source","status":"required","rule":"artifact must contain entrypoint and any explicitly needed companion files."}]);
            if name == "tool.process_tree_artifact" {
                guide["prerequisites"].as_array_mut().unwrap().push(json!({"id":"process_tree","status":"requires_configuration","observed":capabilities.and_then(|v|v.get("command_execution")),"rule":"Provide the tree resource and an actually supported execution backend; the original cgroup backend requires a delegated child root."}));
                guide["examples"][0]["dependencies"]["tree"] =
                    json!({"$input":"process_tree_resource"});
            }
            guide["recovery"] = json!([{"code":"process_exit","action":"Read result.details.exit_code, signal, stderr and stderr_truncated in the original tool_completed event. Exit 125 identifies helper isolation/launch failure, not a Python syntax diagnosis."}]);
        }
        "resource.process_namespace_limits" => {
            guide["summary"] = json!(
                "Execute a PID namespace tree without cgroup delegation. Limits are per-process CPU seconds and address space; no aggregate process/memory quota is claimed."
            );
            guide["examples"] = json!([{"config":{"cpu_seconds":120,"address_space_bytes":2147483648u64},"slot":null}]);
            guide["network"] = json!({"default":"denied","optional_config":{"network_proxy":{"allowed":[{"host":"api.example.com","ports":[443],"allow_private":false}]}},"enforcement":"loopback-only network namespace with a host broker that checks host, port and pinned resolved addresses; ignoring HTTP_PROXY does not create an exit","private_addresses":"require an explicit per-rule allow_private grant"});
            guide["prerequisites"] = json!([{"id":"namespaces","status":"requires_configuration","rule":"Linux must permit user, PID, mount and network namespaces. Helper failures retain stderr; never silently fall back to host execution."}]);
        }
        "resource.process_session" => {
            guide["summary"] = json!(
                "Own a declared artifact process with pipes or a real PTY, durable input receipts and retained output cursors."
            );
            guide["examples"] = json!([{"config":{"entrypoint":"terminal.py","terminal":true,"timeout_ms":600000,"directories":{"WORKSPACE":"workspace"}},"dependencies":{"environment":{"$input":"environment"},"artifact":{"$input":"artifact"},"limits":{"$input":"namespace_limits"},"workspace":{"$input":"workspace_directory"}},"slot":null}]);
            guide["protocol"] = json!({"owner":"thread for model tools; distinct operator namespace for development control","start":"stable start_id; do not restart after an uncertain result","input":"stable command_id, prepared before IO, committed after IO; uncertain never auto-replayed","output":"stdout/stderr byte cursors, data_base64, dropped_before and actual EOF","restart":"abandoned OS process; receipts/output remain readable"});
        }
        "tool.terminal" => {
            guide["summary"] = json!(
                "Expose start/poll/write/resize/close for one declared process_session under ordinary tool policy and budgets."
            );
            guide["examples"] = json!([{"config":{"name":"terminal"},"dependencies":{"session":{"$input":"process_session"}},"slot":"tool_packs"}]);
            guide["protocol"] = json!({"start":{"op":"start","start_id":"terminal-1"},"write":{"op":"write","session_id":{"$input":"session_id"},"command_id":"input-1","text":"pwd\n"},"poll":{"op":"poll","session_id":{"$input":"session_id"},"stdout_cursor":0,"stderr_cursor":0,"wait_ms":1000},"close":{"op":"close","session_id":{"$input":"session_id"}}});
        }
        "resource.mcp_stdio" => {
            guide["summary"] = json!(
                "Connect a pipe process_session to the existing MCP ToolSource. Discovery starts the server; snapshot release closes it. No PTY and no protocol logs on stdout."
            );
            guide["examples"] = json!([{"config":{},"dependencies":{"session":{"$input":"pipe_process_session"}},"slot":null}]);
            guide["protocol"] = json!({"frames":"newline-delimited UTF-8 JSON-RPC","protocol":"2025-11-25","next":"Connect this resource to tool_source.mcp.connection; configure namespace, allowed_tools and aliases there."});
        }
        "resource.process_tree_limits" => {
            guide["summary"] = json!(
                "Explicit process-tree execution backend and limits. A cgroup root must be a delegated child path; /sys/fs/cgroup itself is not a delegation."
            );
            guide["prerequisites"] = json!([{"id":"process_tree","status":"requires_configuration","observed":capabilities.and_then(|v|v.get("command_execution"))}]);
        }
        "policy.tool_rules" => {
            guide["summary"] = json!(
                "Match tools, argument schemas and conservative command prefixes, then allow/deny or delegate to an explicit approval Policy. Deny wins inside this rule set; inherited floors remain in force."
            );
            guide["examples"] = json!([{"config":{"default":"ask","unknown_command":"ask","rules":[{"id":"status","category":"command.read","tools":["run_command"],"action":"allow","command":{"pointer":"/argv","prefixes":[["git","status"]]}},{"id":"writes","category":"filesystem.write","tools":["write_file"],"action":"ask"}]},"dependencies":{"approval":{"$input":"durable_approval_policy"}},"slot":"policies"}]);
            guide["protocol"] = json!({"tools":"exact name or trailing wildcard","command":"JSON Pointer selects argv/string; every segment must satisfy an allow prefix; dynamic interpretation uses unknown_command","ask":"Original ApprovalRequest including policy_id; scope_offer describes once/root/thread/session choices","memory":"Named matching rule, or exact tool+arguments for default ask. Rule/config identity and original scope are immutable.","revoke":"permission.grants then permission.revoke with original grant_id/revision/command_id"});
            guide["steps"] = json!([
                step(
                    "analyze",
                    "command.analyze",
                    json!({"command":{"$input":"command_or_argv"}}),
                    "Inspect actual segments and unknown constructs without execution."
                ),
                step(
                    "approval",
                    "schema",
                    json!({"factory":"policy.approval"}),
                    "Bind the installed durable approval Policy when any branch can ask."
                )
            ]);
        }
        "governance.budget_connected" => {
            guide["summary"] = json!(
                "Bind a durable budget resource, execution limits and automatic model retry policy. Each actual attempt uses the original journal and budget; uncertain effects are reconciled instead of retried."
            );
            guide["examples"] = json!([{"config":{"limits":{"max_model_calls":16,"max_tool_calls":32},"retry":{"max_attempts":3,"base_delay_ms":200,"max_delay_ms":30000}},"dependencies":{"budget":{"$input":"budget_resource"}},"slot":"governance"}]);
            guide["protocol"] = json!({"retryable":"Requires a classified retryable ModelFailure; unknown delivery/effect is not permission to resend.","attempt_ceiling":"Cannot exceed the installed resource budget ceiling (kernel default maximum 5).","backoff":"Persisted attempt results and retry timestamps; bounded exponential delay and Retry-After.","provider":"Configure separate frozen model/program budget profiles for different endpoint policies."});
        }
        "stage.length" | "stage.repeat" => {
            guide["summary"] = json!(if name == "stage.length" {
                "Checkpointed truncated-text continuation and accumulated output salvage at before_stop."
            } else {
                "Checkpointed identical tool-call detection, feedback and a hard limit at after_tool."
            });
            guide["examples"] = json!([{"config":if name=="stage.length"{json!({"max_continues":2,"max_accumulated_bytes":1048576})}else{json!({"problematic_tools":["run_command"]})},"slot":null,"recipe_binding":{"name":name,"at":if name=="stage.length"{"before_stop"}else{"after_tool"},"stage":{"$input":"stage_dependency_slot"}}}]);
            guide["prerequisites"] = json!([{"id":"recipe","status":"required","rule":"Connect the Stage into runtime.recipe at the specified boundary, then attach that Recipe to the Agent recipe slot. A Stage is not a model-callable tool."}]);
        }
        "runtime.recipe" => {
            guide["summary"] = json!(
                "Compose pure Stage decisions and optional read-only observations around fixed Agent boundaries; cannot bypass model/tool validation or inherited floors."
            );
            guide["examples"] = json!([{"config":{"stages":[{"name":"length","at":"before_stop","stage":"length"},{"name":"repeat","at":"after_tool","stage":"repeat"}]},"dependencies":{"length":{"$input":"length_stage"},"repeat":{"$input":"repeat_stage"}},"slot":"recipe"}]);
        }
        "resource.model_connection" => {
            guide["summary"] = json!(
                "Model endpoint, allowed model IDs, request limits and independent credential references. This resource does not itself produce a model."
            );
            guide["examples"] = json!([{"config":{"base_url":{"$input":"model_base_url"},"models":[{"$input":"requested_model"}],"header_credentials":{"authorization":{"reference":{"$input":"credential_reference"},"prefix":"Bearer "}}},"slot":null}]);
        }
        "resource.model_protocol" => {
            guide["summary"] = json!(
                "External protocol source and schema loaded from an artifact. Reuse an installed preset/package for Chat Completions, Responses or Messages rather than inventing the wire protocol."
            );
            guide["discovery"] = json!([step(
                "preset",
                "schema",
                json!({"preset":"coding"}),
                "Choose a supplied protocol profile through its public settings interface."
            )]);
        }
        "model.programmed" => {
            guide["summary"] = json!(
                "Bind one allowed model ID to its declared connection and protocol resources. Model IDs remain user selected; record returned identities without silently substituting aliases."
            );
            guide["examples"] = json!([{"config":{"model":{"$input":"requested_model"}},"dependencies":{"connection":{"$input":"connection_module"},"protocol":{"$input":"protocol_module"}},"slot":"model"}]);
        }
        "tool.rhai" => {
            guide["summary"] = json!(
                "A bounded pure JSON tool. args contains the configured input mapping; the script returns a value matching contract.output_schema. It has no implicit filesystem, process or network authority."
            );
            guide["examples"] = json!([{"config":{"contract":{"name":"double","input_schema":{"type":"object","required":["value"],"properties":{"value":{"type":"integer"}}},"output_schema":{"type":"object","required":["result"],"properties":{"result":{"type":"integer"}}}},"source":"#{result: args.value * 2}"},"dependencies":{},"slot":"tool_packs"}]);
        }
        "context.programmed" => {
            guide["summary"] = json!(
                "External plan/prepare/finish policy for checkpointed history transformation. Optional model sampling uses persistent receipts and normal model budgets."
            );
            guide["protocol"] = json!({"plan":{"input":["phase","state","parameters","retained_turn_start"],"output":"null or serializable plan"},"prepare":{"output":"{kind:update,update:{messages,retained_from,retained_at,metadata?}} or {kind:sample,request:{messages,tools:[],settings},data?}"},"finish":{"input":["response","data","state","plan","parameters"],"output":"{messages,retained_from,retained_at,metadata?}"},"invariant":"The current turn and protected system message must be retained exactly. Sampling requires governance or binding.model_journal."});
            guide["discovery"] = json!([step(
                "packages",
                "module.list",
                json!({}),
                "Find a versioned compaction package and inspect its public parameters/ports."
            )]);
        }
        "tool.skills" | "tool.skills_scoped" => {
            guide["summary"] = json!(
                "Without execution bindings, load a skill prompt. With execution bindings, expose a resumable model-callable child Agent with explicit model/tools/policies and inherited host floors."
            );
            guide["prerequisites"] = json!([{"id":"child_budget","status":"required","rule":"Parent governance must admit child calls and depth; child tools and model are explicit dependencies."}]);
            guide["pitfalls"] = json!([
                "An execution-bound skill is already a child Agent, not merely text injection.",
                "tool.skills_scoped additionally requires a declared scope resource; query configured dependencies for every named slot.",
                "This synchronous child-result interface is different from a general asynchronous task/mailbox API."
            ]);
        }
        "resource.mcp_http" | "tool_source.mcp" => {
            guide["summary"] = json!(
                "Connect an outbound MCP ToolSource to a declared MCP transport resource. Outbound tools and inbound kernel-control MCP are different directions."
            );
        }
        "policy.approval" | "policy.on_tools" | "policy.tool_scope" => {
            guide["summary"] = json!(
                "Compose a persistent approval policy, selected-tool delegation and an allowed-tool floor. Policies run before real dispatch and on resume."
            );
        }
        "binding.model_journal" => {
            guide["summary"] = json!(
                "Bind durable model receipts for helper sampling and recovery. Attach to bindings and satisfy its actual configured dependencies."
            );
        }
        "session_policy.rules" => {
            guide["summary"] = json!(
                "Declarative session naming, admission, routing and archival suggestions. queue/reject controls session admission; Interject/NextTurn remain separate runtime inputs."
            );
        }
        _ => {}
    }
    guide
}

pub(crate) fn package_guide(package: &PackageView) -> Value {
    let mut guide = base(
        "package",
        &format!(
            "{}/{}@{}",
            package.repository, package.name, package.version
        ),
        &package.manifest.description,
    );
    guide["availability"] = json!({"status":if package.yanked {"yanked"} else {"published"},"reason":"This exact package coordinate and digest were returned by the repository. A yanked version cannot be newly selected; existing pins retain their sources."});
    guide["identity"] = json!({"repository":package.repository,"name":package.name,"version":package.version,"digest":package.digest});
    guide["parameters_schema"] = package.manifest.parameters_schema.clone();
    guide["inputs"] = json!(package.manifest.inputs);
    guide["exports"] = json!(package.manifest.exports);
    guide["factories"] = json!(package.manifest.factories().unwrap_or_default());
    let factories = package.manifest.factories().unwrap_or_default();
    guide["export_contracts"] = json!(package.manifest.exports.iter().map(|(export,module)| json!({"export":export,"module":module,"factory":factories.get(module),"next_schema_query":{"factory":factories.get(module)},"rule":"Read this factory's slots and dependencies before attaching the export."})).collect::<Vec<_>>());
    guide["steps"] = json!([
        step(
            "inspect",
            "agent.inspect",
            json!({"agent":{"$input":"agent"},"target":{"kind":"project","project_id":{"$input":"project_id"}}}),
            "Capture source_revision and discover available local modules."
        ),
        step(
            "use",
            "agent.module.use",
            json!({"target":{"kind":"project","project_id":{"$input":"project_id"},"expected_revision":{"$result":"inspect","pointer":"/refs/source_revision"}},"agent":{"$input":"agent"},"repository":package.repository,"name":package.name,"version":package.version,"alias":{"$input":"alias"},"parameters":{"$input":"parameters"},"bindings":{"$input":"port_bindings"}}),
            "Register the pinned package without copying implementation into the project."
        ),
        step(
            "export",
            "agent.module.add",
            json!({"target":{"$input":"latest_write_target"},"agent":{"$input":"agent"},"module_ref":{"$input":"alias.export"},"slot":{"$input":"compatible_slot"}}),
            "Attach a public export of a compatible kind; dependency-only resources remain unattached."
        )
    ]);
    guide["pitfalls"] = json!([
        "Versions are immutable; existing pins do not follow later publications.",
        "Port bindings can reference source IDs or another package's public alias.export.",
        "Inspect factories to choose the correct Agent slots. A package may export resources and tools of different kinds.",
        "Export collects the pinned source bytes for offline reconstruction; runtime dependencies and credentials are provisioned separately."
    ]);
    guide
}
