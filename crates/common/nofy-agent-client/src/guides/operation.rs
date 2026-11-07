use super::*;

pub(crate) fn recovery(code: &str, operation: &str, input: &Value, unconfirmed: bool) -> Value {
    let (message, action) = if unconfirmed {
        (
            "The request stopped waiting; accepted business work may still exist. Inspect its original IDs before retrying.",
            "inspect_original_receipt",
        )
    } else {
        match code {
            "conflict" | "runtime_conflict" => (
                "Read current revision/generation and inspect the concurrent change before creating a new write.",
                "refresh_identity",
            ),
            "forbidden" | "unauthorized" => (
                "Use an identity with the required scopes. A guide or factory definition does not grant permission.",
                "check_access",
            ),
            "unsupported_protocol" => (
                "Use matching kernel and client contracts, reconnect MCP, and rediscover tools. Do not infer missing tools from stale client metadata.",
                "rediscover",
            ),
            "not_found" => (
                "Discover the registered object or installed factory and use its exact identity. Do not substitute another model or version silently.",
                "discover_identity",
            ),
            "incomplete" => (
                "Inspect missing slots, parameters, source packages and dependencies, then satisfy each reported requirement.",
                "complete_declaration",
            ),
            "local_input" | "invalid" => (
                "Inspect issues for exact field paths and query this operation's contract and guide. NativeJson is serialized JSON text.",
                "correct_input",
            ),
            "unavailable" | "busy" => (
                "Inspect the existing receipt/resource status. Execution environments are user provisioned; do not retry side effects blindly.",
                "inspect_availability",
            ),
            // A code the contract describes explains itself; only an unknown one
            // gets the generic advice.
            _ => (
                crate::ERROR_CODES.iter().find(|entry| entry.code == code).map_or(
                    "Inspect the original run events and structured tool diagnostics before choosing a corrective action.",
                    |entry| entry.meaning.as_str(),
                ),
                "inspect_diagnostics",
            ),
        }
    };
    let mut calls = vec![step(
        "contract",
        "schema",
        json!({"operation":operation}),
        "Read the precise input contract and recovery guidance.",
    )];
    if let Some(run) = input.get("run_id") {
        calls.push(step(
            "run",
            "run.inspect",
            json!({"run_id":run}),
            "Read the original run, execution and control-tree state.",
        ));
    }
    if let Some(target) = input.get("target")
        && let Some(agent) = input.get("agent")
    {
        let read = if target["kind"] == "project" {
            json!({"kind":"project","project_id":target["project_id"]})
        } else {
            json!({"kind":"source","source":target["source"]})
        };
        // A source collection remains in the caller's request; do not copy
        // the entire implementation into every failure response.
        if read["kind"] == "project" {
            calls.push(step(
                "inspect",
                "agent.inspect",
                json!({"target":read,"agent":agent}),
                "Inspect source revision, missing requirements and the current declaration.",
            ));
        }
    }
    json!({"action":action,"message":message,"automatic_retry":false,"calls":calls})
}

pub(crate) fn bootstrap() -> Value {
    json!({"format":"nofy.assembly-bootstrap/v1",
        "goal":"Create, compose and run agents using only MCP contracts and returned guides; framework source is not needed.",
        "entry_points":[
            step("preset","schema",json!({"preset":"coding"}),"Obtain the public settings contract, required user inputs and an ordered construction recipe."),
            step("empty","schema",json!({"operation":"agent.create"}),"Create an empty declaration and add explicit factories or pinned packages."),
            step("package","schema",json!({"operation":"agent.module.use"}),"Select a repository/name/version, inspect ports, provide parameters and attach exports."),
            step("publish","schema",json!({"operation":"module.template"}),"Start a reusable module package from a minimal one that already publishes, publish it to a repository on this kernel, then pin it into any Agent.")],
        "module_workflow":["repository.add","module.template","module.publish","module.list","schema (package)","agent.module.use","agent.inspect"],
        "workflow":["describe","schema","agent.create","agent.configure","agent.module.add or agent.module.use","agent.inspect","agent.build","agent.plan","agent.apply","run.start","run.inspect","run.events"],
        "bindings":{"input":"Objects containing only $input are guide placeholders; replace them with user inputs before calling a tool.","cli":"Each call names its CLI command in `cli`. The call's `arguments` are also the complete JSON input of that command: `nofy <command> --input FILE` (or `--input -` for stdin).","result":"Objects containing $result and pointer refer to the named previous step's complete result envelope.","native_json":"When a step provides native_json_body, serialize that object into its stated NativeJson field. This is not a separate kernel operation."},
        "rules":["Use the actual tools/list contract; do not rely on client-cached parameter shapes.","Read the latest target revision before every edit; do not invent revision or generation values.","A successful build renders data; a successful activation checks actual runtime resources.","Inspect business execution status and actual tool outputs: an accepted request or completed model response does not prove an effect succeeded.","Keep model credentials as references and provision values through the private credential CLI.","Stop on an unmet execution prerequisite and report the concrete required provision; do not silently relax the boundary."]})
}
fn read_target() -> Value {
    json!({"kind":"project","project_id":{"$input":"project_id"}})
}
fn write_target() -> Value {
    json!({"kind":"project","project_id":{"$input":"project_id"},"expected_revision":{"$result":"inspect","pointer":"/refs/source_revision"}})
}

pub(crate) fn operation_guide(operation: &Operation) -> Result<Value> {
    let name = operation.operation.as_str();
    let catalog = CATALOG["operations"]
        .as_array()
        .into_iter()
        .flatten()
        .find(|o| o["operation"] == name)
        .cloned()
        .unwrap_or_default();
    let summary = catalog["summary"]
        .as_str()
        .or_else(|| catalog["mapping_note"].as_str())
        .unwrap_or("Call the operation using its exact contract and kernel-authorized identity.");
    let mut guide = base("operation", name, summary);
    guide["availability"] = json!({"status":"implemented","reason":"Registered in this client's operation catalog. Kernel-dependent operations still require a matching server and declared resources."});
    guide["prerequisites"] = json!([{"id":"access","required_scopes":operation.scope_hint,"status":"check_kernel","check":{"tool":"nofy_describe","arguments":{}}}]);
    guide["bindings"] = bootstrap()["bindings"].clone();
    guide["recovery"] = json!([{"code":"conflict","action":"Inspect current identities and concurrent changes; never blind overwrite."},{"code":"incomplete","action":"Inspect missing_slots, missing_settings (every setting still needed, listed at once) and issue, add the requested parameters or modules, then rebuild."},{"code":"result_unconfirmed","action":"Query the original command/run IDs. Request cancellation does not cancel accepted work."}]);
    let edit = name.starts_with("agent.module.")
        && !matches!(name, "agent.module.inspect" | "agent.module.list")
        || matches!(name, "agent.configure" | "agent.tool.add");
    if edit {
        guide["steps"] = json!([
            step(
                "inspect",
                "agent.inspect",
                json!({"agent":{"$input":"agent"},"target":read_target()}),
                "Capture refs.source_revision and inspect the declaration."
            ),
            json!({"id":"edit","operation":name,"tool":operation.mcp_tool,"target_template":write_target(),"expected_outcome":"Save the declaration using the captured revision; retain the returned source revision."}),
            step(
                "check",
                "agent.inspect",
                json!({"agent":{"$input":"agent"},"target":read_target()}),
                "Inspect incomplete requirements before building."
            )
        ]);
    }
    guide["pitfalls"] = json!([
        "Source targets use expected_digest; managed projects use expected_revision. Do not interchange them.",
        "NativeJson strings must contain serialized native DTO objects; ordinary structured fields remain objects."
    ]);
    match name {
        "describe" => {
            guide["summary"] = json!(
                "Discover installed factories, operation identities, presets and real kernel capabilities without copying every configuration schema into context."
            );
            guide["pitfalls"] = json!([
                "Default inventory_view=summary; query schema(factory=...) or schema(operation=...) for the selected exact contract. include_details:true returns the complete inventory."
            ]);
        }
        "run.inspect" => {
            guide["summary"] = json!(
                "Poll with default view=status. The native nofy.run-status/v1 view excludes snapshots/transcripts and labels output previews explicitly. Use view=full once when complete evidence is needed."
            );
            guide["examples"] = json!([{"arguments":{"run_id":{"$input":"run_id"},"view":"status"}},{"arguments":{"run_id":{"$input":"run_id"},"view":"full"}}]);
            guide["pitfalls"] = json!([
                "A queued run may have execution:null. Check execution.status and actual tool events before claiming success.",
                "execution.output in the status view is {preview,bytes,truncated}; it is not the full original outcome. Read full only when needed. Child status counts do not replace child invocation evidence."
            ]);
        }
        "run.control" => {
            guide["native_types"] = json!({"ManagedAction":{"run_id":"original root run ID","command_id":"unique stable command ID","command":{"kind":"resume | park | unpark | transition | human | control"}},"Human":{"kind":"human","target_run_id":"recorded workflow_human child run ID","workflow_path":"ordered native ModuleRef objects of resource.workflow modules from the root snapshot; [] only for a direct workflow program","expected_request":"exact Human node input: waiting.reason.request, not the entire waiting reason or tool arguments wrapper","value":"answer satisfying that Human node's response_schema"}});
            let action = json!({"run_id":{"$input":"root_run_id"},"command_id":{"$input":"command_id"},"command":{"kind":"human","target_run_id":{"$input":"workflow_target_run_id"},"workflow_path":[],"expected_request":{"$input":"original_waiting_request"},"value":{"answer":{"$input":"answer"}}}});
            let resume = json!({"run_id":{"$input":"root_run_id"},"command_id":{"$input":"resume_command_id"},"command":{"kind":"resume"}});
            guide["examples"] = json!([{"title":"Resume the original paused run","arguments":{"action_json":serde_json::to_string(&resume)?}},{"title":"Answer an exact Human wait","arguments":{"action_json":serde_json::to_string(&action)?},"note":"Replace placeholders before serializing. kind belongs inside command. For ask-user/execution-escalation mounted as tools, workflow_path contains the package's workflow resource reference; inspect the built declaration for its exact version. expected_request is the Human node input, not {kind:human,request:...}."}]);
            guide["steps"] = json!([
                step(
                    "inspect",
                    "run.recovery",
                    json!({"run_id":{"$input":"root_run_id"},"kind":"human"}),
                    "Select a waiting target; its command already contains the exact target, workflow_path and expected_request. Replace only command.value using its response_schema, wrap in run_id/command_id/command, and serialize."
                ),
                step(
                    "submit",
                    "run.control",
                    json!({"action_json":{"$input":"serialized_action"}}),
                    "Accept an immutable action and retain its command_id."
                ),
                step(
                    "receipt",
                    "action.inspect",
                    json!({"command_id":{"$input":"command_id"}}),
                    "Inspect the accepted action result before retrying."
                )
            ]);
            guide["model_retry"] = json!({"ticket_read":{"operation":"run.recovery","arguments":{"run_id":{"$input":"root_run_id"},"kind":"retry"}},"native_json_body":{"run_id":{"$input":"root_run_id"},"command_id":{"$input":"retry_command_id"},"command":{"kind":"control","control":{"kind":"retry_model","command":{"command_id":{"$input":"retry_command_id"},"ticket":{"$input":"complete_original_retry_ticket"}}}}},"rule":"Only a settled failure returns a retry ticket. Copy it exactly and use the same command_id at both levels. Unknown attempts require kind=model reconciliation with actual provider evidence, never fabricated results. A retry uses the original run with a fresh admitted model generation and budget charge."});
        }
        "run.recovery" => {
            guide["summary"] = json!(
                "Inspect original pending operations: root/child tools, model requests, hook receipts, waiting human questions, or a settled root model failure's retry ticket."
            );
            guide["examples"] = json!([{"arguments":{"run_id":{"$input":"root_run_id"},"kind":"human"},"expected_outcome":"data.native_json decodes to targets containing response_schema and a command template. Replace only command.value and submit via run.control with the original root and a fresh command_id."}]);
            guide["pitfalls"] = json!([
                "kind=child lists uncertain tool operations, not Human questions. Use kind=human for ask_user and execution_escalation waits.",
                "Human views are advisory; the original root lease, frozen workflow and exact waiting request are rechecked when the command executes."
            ]);
            guide["model_retry"] = json!({"kind":"retry","result":"An exact ModelRetryTicket or null for no settled failure. Query schema(operation=run.control) for the nested retry_model action. kind=model returns unknown dispatched attempts that require provider evidence first."});
        }
        "run.decide" => {
            guide["native_types"] = json!({"Decision":{"request":"exact original ApprovalRequest from run.approvals or paused reason","allow":"boolean","scope":"once (default), root, thread or session; memory requires a matching compiled rule offer"}});
            guide["protocol"] = json!({"decision_json_body":{"request":{"$input":"complete_original_approval_request_including_policy_id"},"allow":true,"scope":{"$input":"one_of_the_offered_scopes"}},"default_scope":"once","scopes":"Only those in the original pause scope_offer are available; session requires a registered original session.","resume":"After recording the decision, use the original durable resume action. Do not strip policy_id or alter tool arguments."});
            guide["pitfalls"] = json!([
                "Preserve request.run_id, thread_id, step, call and optional policy_id exactly. A changed call is not the original approval.",
                "Approval does not widen a declared tool allow-list or filesystem/network resource. After deciding a paused request, resume the original root with run.control."
            ]);
            let decision = json!({"request":{"$input":"original_approval_request"},"allow":true,"scope":"once"});
            guide["examples"] = json!([{"arguments":{"run_id":{"$input":"root_run_id"},"decision_json":serde_json::to_string(&decision)?},"note":"Read the request with run.approvals. Replace the request placeholder with that entire original object, then serialize."}]);
        }
        "run.steer" | "run.follow_up" => {
            guide["examples"] = json!([{"arguments":{"root_run_id":{"$input":"root_run_id"},"run_id":{"$input":"recipient_run_id"},"thread_id":{"$input":"recipient_thread_id"},"agent":{"$input":"recipient_agent_name"},"input_id":"message-1","text":"Apply this instruction using the current run."}}]);
            guide["delivery"] = json!({"steering":"next safe boundary after the frozen model request and paired tool results","follow_up":"after the current response closes","configuration":{"settings":{"input_delivery":{"steering":"all","follow_up":"one_at_a_time"}}},"modes":["all","one_at_a_time"],"provenance":"each message retains its exact durable input receipt; repeated input_id must retain original content"});
        }
        "project.delete" | "agent.delete" | "module.yank" | "module.gc" => {
            guide["pitfalls"] = json!([
                "Project deletion requires its latest revision and retains a tombstone. Published releases and execution records have independent lifecycles.",
                "Agent deletion removes one declaration; optional entry chooses a replacement entry program. Shared modules remain explicit.",
                "Yank prevents new selection of a version; existing digest pins and source exports keep working. Restore selection with yanked:false and the latest repository revision.",
                "GC defaults to dry_run:true. Only orphan upload blobs are reclaimed; published versions, including yanked versions, retain their source bytes."
            ]);
        }
        "agent.create" => {
            guide["summary"] = json!(
                "Create an empty declaration, instantiate an installed source preset, or upload an explicit Source. Adding an Agent to an existing target is a separate create mode."
            );
            guide["examples"] = json!([{"title":"empty managed Agent","arguments":{"agent":"coder","empty":true}},{"title":"installed preset","arguments":{"agent":"coder","preset":"coding","preset_version":{"$input":"preset_version"}}}]);
            guide["steps"] = json!([
                step(
                    "contract",
                    "schema",
                    json!({"preset":{"$input":"preset"}}),
                    "For a preset, read its required settings and actual declared defaults."
                ),
                step(
                    "create",
                    "agent.create",
                    json!({"agent":{"$input":"agent"},"empty":true}),
                    "An empty project is intentionally incomplete until model and prompt are attached."
                ),
                step(
                    "inspect",
                    "agent.inspect",
                    json!({"agent":{"$input":"agent"},"target":read_target()}),
                    "Capture its exact source revision and missing requirements."
                )
            ]);
            guide["pitfalls"] = json!([
                "Do not combine a top-level source with target. Upload source without target, or create inside an existing target without source/preset.",
                "An empty project has no implicit model, credentials or runtime."
            ]);
        }
        "agent.configure" => {
            guide["summary"] = json!(
                "Merge public preset settings or set settings by JSON Pointer. The kernel saves the actual settings file using the same project/source CAS."
            );
            guide["examples"] = json!([{"arguments":{"target":write_target(),"agent":{"$input":"agent"},"settings":{"workspace":{"$input":"workspace"},"model":{"$input":"model"},"terminal_enabled":false}}}]);
            guide["pitfalls"] = json!([
                "Query schema with preset to find its public parameter contract.",
                "settings is an object; set is a map of JSON Pointer to literal value. null stores null. unset is an array of exact non-root pointers to remove.",
                "Configure retains an incomplete source; inspect/build shows any remaining required settings."
            ]);
        }
        "agent.module.add" | "agent.tool.add" => {
            guide["summary"] = json!(
                "Add one configured factory, an explicit native module, or an existing module reference; connect dependencies by name and attach only to a compatible slot."
            );
            guide["examples"] = json!([{"title":"literal prompt","arguments":{"target":write_target(),"agent":{"$input":"agent"},"id":"prompt","factory":"prompt.static","config":{"text":"Use the provided tools and report actual results."},"slot":"prompt"}},{"title":"real arithmetic tool","arguments":{"target":write_target(),"agent":{"$input":"agent"},"id":"double","factory":"tool.rhai","slot":"tool_packs","config":{"contract":{"name":"double","description":"Return twice an integer.","input_schema":{"type":"object","required":["value"],"additionalProperties":false,"properties":{"value":{"type":"integer"}}},"output_schema":{"type":"object","required":["result"],"additionalProperties":false,"properties":{"result":{"type":"integer"}}}},"source":"#{result: args.value * 2}"}}},{"title":"package export reference","arguments":{"target":write_target(),"agent":{"$input":"agent"},"module_ref":"files.read","slot":"tool_packs"}}]);
            guide["discovery"] = json!([
                step(
                    "factory",
                    "schema",
                    json!({"factory":{"$input":"factory"}}),
                    "Read kind, configuration, static dependencies and valid slots."
                ),
                step(
                    "ports",
                    "schema",
                    json!({"factory":{"$input":"factory"},"config_json":{"$input":"serialized_config"}}),
                    "Derive all named dependencies for this exact configuration before binding."
                )
            ]);
        }
        "agent.module.use" => {
            guide["summary"] = json!(
                "Pin an immutable module package by repository/name/version and alias. Bind its declared input ports and optionally attach one public export."
            );
            guide["discovery"] = json!([step(
                "package",
                "schema",
                json!({"package":{"repository":{"$input":"repository"},"name":{"$input":"name"},"version":{"$input":"version"}}}),
                "Read the public parameters, ports, exports and exact package digest."
            )]);
            guide["pitfalls"] = json!([
                "Do not copy implementations into each managed project; use a pinned import.",
                "give export, slot or both to mount the package: the other is worked out (the slot from the export's kind, the export when the package has only one). Give neither to only import a package whose exports other modules take as dependencies.",
                "Changing an occupied alias requires replace_import. An occupied single-value slot requires replace_slot."
            ]);
        }
        "agent.module.set" => {
            guide["pitfalls"] = json!([
                "set changes rendered config, not dependency wires; use agent.module.bind for dependencies.",
                "Dependency removal uses agent.module.bind remove_dependencies or replace_dependencies, not a /dependencies pointer inside config.",
                "JSON Pointer empty string replaces the entire config. null stores null; unset:[\"/key\"] removes a key or array entry."
            ]);
        }
        "agent.module.bind" => {
            guide["pitfalls"] = json!([
                "Named dependencies must use the exact slots returned by schema(factory,config_json).",
                "Default binding merges named wires. Use replace_dependencies:true to submit the complete replacement map, or remove_dependencies:[\"old_slot\"] to remove named wires. Configuration JSON Pointer edits do not change module dependencies.",
                "Resources connect through dependencies and are not attached to Agent tool/model slots."
            ]);
        }
        "agent.build" | "project.build" => {
            guide["summary"] = json!(
                "Render complete declarations and resolve pinned source packages without executing project scripts. data.programs contains actual runnable program names."
            );
        }
        "agent.plan" => {
            guide["summary"] = json!(
                "Build and validate a candidate and compare with the active generation without publishing or activating."
            );
        }
        "agent.apply" => {
            guide["summary"] = json!(
                "Build, publish and activate with an explicit command_id and expected_generation. If activation fails, inspect completed_stages and the published release before retrying."
            );
            guide["examples"] = json!([{"arguments":{"target":read_target(),"agent":{"$input":"agent"},"system":{"$input":"system"},"command_id":{"$input":"unique_command_id"},"expected_generation":null},"note":"null asserts no active generation; inspect system.active for an existing generation."}]);
            guide["pitfalls"] = json!([
                "Default results contain the original activation DTO plus publication identity/read instruction. include_publication:true adds the complete publication_json with all implementation bytes; it is unnecessary for starting runs.",
                "On activation failure, retain error refs.release and completed_stages; publication.read can inspect the already published release. Do not start a different command blindly."
            ]);
        }
        "terminal.start" | "terminal.poll" | "terminal.write" | "terminal.resize"
        | "terminal.close" => {
            guide["prerequisites"] = json!([{"id":"resource","status":"required","rule":"Publish resource.process_session with explicit environment, artifact, namespace limits and directories. Supply its fixed release and native ModuleRef {id,version}."},{"id":"access","required_scopes":["execute","resources"],"status":"check_kernel"}]);
            guide["examples"] = json!([{"arguments":{"release":{"$input":"release"},"module_ref":{"id":{"$input":"resource_id"},"version":{"$input":"resource_version"}},"owner":{"$input":"operator_owner"},"start_id":"terminal-1"},"applies_to":"terminal.start"}]);
            guide["pitfalls"] = json!([
                "The operator owner is distinct from model thread owners. Use the same release, ModuleRef and owner for the lifetime of a session.",
                "A repeated start_id or command_id queries its original receipt. prepared/uncertain inputs must not be replayed under a fresh ID.",
                "Output text is a convenience; data_base64 and byte cursors preserve exact data. Inspect dropped_before, eof and exit_code.",
                "Closing waits for namespace process cleanup; stopping an MCP request does not close an interactive process."
            ]);
        }
        "permission.grants" | "permission.revoke" => {
            guide["summary"] = json!(
                "Inspect or revoke remembered rule approvals, preserving their original policy/scope identity and historical effects."
            );
            guide["steps"] = json!([
                step(
                    "grants",
                    "permission.grants",
                    json!({"include_revoked":false,"limit":64}),
                    "Select the original grant_id and its revision from the native result."
                ),
                step(
                    "revoke",
                    "permission.revoke",
                    json!({"grant_id":{"$input":"grant_id"},"expected_revision":{"$input":"original_grant_revision"},"command_id":{"$input":"stable_command_id"}}),
                    "An accepted exact revocation prevents future matching approval reuse; repeated same command reads the original result."
                )
            ]);
        }
        "command.analyze" => {
            guide["examples"] = json!([{"arguments":{"command":"git status && printf 'done'"}},{"arguments":{"command":["bash","--noprofile","--norc","-c","git status"]}}]);
            guide["pitfalls"] = json!([
                "Analysis performs no execution. dynamic or redirects cannot prove a static grant; inspect the configured unknown_command policy.",
                "Argument arrays carry literal words; shell strings are lexed conservatively. Tool policy and OS resource grants remain separate constraints."
            ]);
        }
        "session.fork" | "session.rewind" => {
            guide["summary"] = json!(
                "Create a new session and turn from a closed historical Agent turn. Preserve source messages and effect receipts; rewind selects a valid prefix and creates another branch."
            );
            guide["steps"] = json!([
                step(
                    "source",
                    "session.inspect",
                    json!({"session_id":{"$input":"source_session_id"}}),
                    "Capture source session revision, system and frozen origin release/program."
                ),
                step(
                    "turn",
                    "run.inspect",
                    json!({"run_id":{"$input":"source_run_id"},"view":"full"}),
                    "Require a closed, quiescent source turn. Capture live_revision and its actual live release/program, if changed."
                ),
                json!({"id":"branch","operation":name,"tool":operation.mcp_tool,"arguments":{"session_id":{"$input":"new_session_id"},"command_id":{"$input":"command_id"},"expected_session_revision":null,"source_session_id":{"$input":"source_session_id"},"expected_source_session_revision":{"$result":"source","pointer":"/refs/session_revision"},"source_run_id":{"$input":"source_run_id"},"expected_source_revision":{"$result":"turn","pointer":"/refs/live_revision"}},"native_json_field":"request_json","native_json_body":{"run_id":{"$input":"new_run_id"},"thread_id":{"$input":"new_thread_id"},"system":{"$input":"source_system"},"release":{"$input":"exact_source_release"},"program":{"$input":"exact_source_program"},"input":{"text":{"$input":"next_instruction"},"attachments":[]}},"expected_outcome":"An applied receipt creates a new root and session. For rewind, also supply through_message as the number of messages to retain."}),
                step(
                    "tree",
                    "session.tree",
                    json!({"session_id":{"$input":"new_session_id"}}),
                    "Inspect original lineage and explicitly choose the session to continue."
                )
            ]);
            guide["pitfalls"] = json!([
                "Use a new thread/run/session and the source turn's exact frozen configuration. Current active release may be different.",
                "Every operator-created branch has an independent budget root; the original ledger is unchanged. Model children must use inherited-budget child-agent tools.",
                "Rewind retains the first through_message messages, including the protected system message. Tool call/result groups must remain complete.",
                "Opaque provider-native history is preserved verbatim. A prefix containing Opaque must end at a completed user-turn boundary or retain the entire closed history; the frozen model's pure history validator must accept it.",
                "A copied tool result is history, never an instruction to execute that tool again. Filesystem and external effects are not rolled back.",
                "On a lost response inspect session.command using the original command_id; do not create a second branch under a fresh ID."
            ]);
        }
        "session.tree" => {
            guide["summary"] = json!(
                "Inspect immutable parent/source-turn/message-boundary lineage for the tree containing a selected session."
            );
            guide["examples"] = json!([{"arguments":{"session_id":{"$input":"session_id"}}}]);
        }
        "run.start" => {
            guide["summary"] = json!(
                "Submit a durable run for the exact system/release/program. Accepted or queued is not completed."
            );
            guide["examples"] = json!([{"native_json_field":"request_json","native_json_body":{"run_id":{"$input":"new_run_id"},"thread_id":{"$input":"thread_id"},"system":{"$input":"system"},"release":{"$result":"apply","pointer":"/refs/release"},"program":{"$result":"build","pointer":"/data/programs/0"},"input":{"text":{"$input":"task"},"attachments":[]}},"encoding":"Serialize native_json_body after resolving bindings, then pass it as request_json."}]);
            guide["steps"] = json!([
                step(
                    "inspect",
                    "run.inspect",
                    json!({"run_id":{"$input":"new_run_id"}}),
                    "Read data.native_json: execution may be null while queued; inspect execution.status when present."
                ),
                step(
                    "effects",
                    "run.events",
                    json!({"run_id":{"$input":"new_run_id"},"limit":256}),
                    "Check tool_completed.is_error, result.value.ok when present, and actual requested effects."
                )
            ]);
        }
        "run.input" => {
            guide["summary"] = json!(
                "Deliver a durable mailbox input: Interject steers at the next safe boundary; FollowUp continues after the current answer; NextTurn freezes a distinct new run snapshot. These are not Session busy-queue settings."
            );
            guide["native_types"] = json!({"MailEnvelope":{"address":{"root_run_id":"string","run_id":"string","thread_id":"string","agent":"string"},"input_id":"unique string","input":{"kind":"interject | follow_up | next_turn | tool"}},"note":"Operation run_id is the root ID for HTTP routing; address.run_id is the exact recipient, including a child. NextTurn additionally requires its explicit compilation snapshot."});
        }
        "module.publish" => {
            guide["summary"] = json!(
                "Publish a complete explicit Source containing module.json and its source-files.json manifest. The package is checked against this kernel before it becomes an immutable version: every module's factory must be installed, its configuration must fit the factory's schema, its dependency ports must be bound to modules of the right kind, and a module that needs nothing else must build. Problems come back together as error.details.issues, each with a JSON Pointer into module.json, and nothing is published. Same coordinate with different bytes conflicts; external dependency installation is not required. A file is executable when its executable flag is true, and the flag is part of the package digest: to keep the digest the same on every platform, list the executable files in source-executables.json (a JSON array of package paths, itself listed in source-files.json) and set the flags to match; the declaration and the flags must agree."
            );
            guide["steps"] = json!([
                step(
                    "template",
                    "module.template",
                    json!({"name":{"$input":"name"},"kind":"tool"}),
                    "Optional: get a minimal package that already publishes (data.source), edit it, and use it as package_source."
                ),
                step(
                    "publish",
                    "module.publish",
                    json!({"repository":{"$input":"repository"},"source":{"$input":"package_source"}}),
                    "Publish the package. Every problem is reported at once as error.details.issues, each with a JSON Pointer into module.json; nothing is published until there are none."
                ),
                step(
                    "inspect",
                    "module.inspect",
                    json!({"repository":{"$input":"repository"},"name":{"$input":"name"},"version":{"$input":"version"}}),
                    "Read the published inputs, exports and parameters schema: they decide how it is wired when selected."
                ),
                step(
                    "guide",
                    "schema",
                    json!({"package":{"repository":{"$input":"repository"},"name":{"$input":"name"},"version":{"$input":"version"}}}),
                    "Get the guided steps for selecting this package into an Agent: ports to bind, an export to mount, a compatible slot."
                ),
                step(
                    "use",
                    "agent.module.use",
                    json!({"agent":{"$input":"agent"},"repository":{"$input":"repository"},"name":{"$input":"name"},"version":{"$input":"version"},"alias":{"$input":"alias"},"export":{"$input":"export"},"slot":{"$input":"compatible_slot"}}),
                    "Pin it into an Agent and mount the export in one call."
                )
            ]);
            guide["package_contract"] = SCHEMAS["$defs"]["PackageManifest"].clone();
            let manifest = json!({"format":"nofy.module-package/v1","name":"double","version":"1.0.0","parameters_schema":{"type":"object"},"inputs":{},"modules":[{"reference":{"$module":"double"},"factory":"tool.rhai","config":{"contract":{"name":"double","input_schema":{"type":"object","required":["value"],"properties":{"value":{"type":"integer"}}}},"source":"#{result: args.value * 2}"}}],"exports":{"main":"double"}});
            guide["examples"] = json!([{"arguments":{"repository":{"$input":"repository"},"expected_revision":{"$result":"repository","pointer":"/refs/repository_revision"},"source":{"declaration":"module.json","files":{"module.json":{"encoding":"utf8","content":serde_json::to_string(&manifest)?},"source-files.json":{"encoding":"utf8","content":"[\"module.json\",\"source-files.json\"]"}}}}}]);
        }
        "repository.add" => {
            guide["steps"] = json!([
                step(
                    "repository",
                    "repository.add",
                    json!({"repository":{"$input":"repository"}}),
                    "Register an empty managed repository (origin and expected_revision default to managed and none)."
                ),
                step(
                    "publish",
                    "module.publish",
                    json!({"repository":{"$input":"repository"},"source":{"$input":"package_source"}}),
                    "Publish a package into it (expected_revision defaults to the repository's current one). It is checked against this kernel first; problems come back with JSON Pointers into module.json."
                ),
                step(
                    "list",
                    "module.list",
                    json!({"repository":{"$input":"repository"}}),
                    "Confirm the version and read its package digest."
                )
            ]);
            guide["examples"] = json!([{"arguments":{"repository":"local","origin":{"kind":"managed"},"expected_revision":null}}]);
            guide["pitfalls"] = json!([
                "A directory origin is an explicit canonical Host path, not a client file path. Git/directory acquisition requires resources scope.",
                "Registering an origin does not acquire source. Call repository.sync explicitly for Git/directory origins."
            ]);
        }
        name if name.starts_with("session.") => {
            guide["pitfalls"] = json!([
                "Session revision, policy revision, source checkpoint revision and runtime generation are distinct identities.",
                "Use original command IDs for receipt replay; use a new command ID for a new request.",
                "Policy reconfiguration requires the declared quiet lifecycle boundary; inspect before changing it."
            ]);
        }
        _ => {}
    }
    Ok(guide)
}
