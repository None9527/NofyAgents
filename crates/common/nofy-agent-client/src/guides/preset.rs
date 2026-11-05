use super::*;
use nofy_agent_project::Source;

pub(crate) fn preset_guide(id: &str, source: &Source) -> Result<Value> {
    let project = source.json("project.json")?;
    let schema_path = project
        .get("settings_schema")
        .and_then(Value::as_str)
        .unwrap_or("settings.schema.json");
    let settings_schema = if source.files.contains_key(schema_path) {
        source.json(schema_path)?
    } else {
        json!({"type":"object"})
    };
    let settings_path = project
        .get("settings")
        .and_then(Value::as_str)
        .unwrap_or("settings.json");
    let settings = if let Some(text) = &source.settings_json {
        serde_json::from_str(text)?
    } else if source.files.contains_key(settings_path) {
        source.json(settings_path)?
    } else {
        json!({})
    };
    let mut guide = base(
        "preset",
        id,
        "Instantiate a declared preset, configure its public settings, then inspect, compose modules, build and run. No framework implementation source is needed.",
    );
    guide["availability"] = json!({"status":"installed","reason":"The current template registry supplied this source preset."});
    guide["bindings"] = bootstrap()["bindings"].clone();
    guide["required_parameters"] = settings_schema
        .get("required")
        .cloned()
        .unwrap_or_else(|| json!([]));
    guide["prerequisites"] = json!([{"id":"credentials","status":"user_provisioned","rule":"Use credential references in the connection. Inject actual values through the private credential CLI."},{"id":"runtime","status":"requires_configuration","rule":"Select actual runtime paths and execution capabilities; query factory guides. A preset default is not proof the Host can execute it."}]);
    let target = json!({"kind":"project","project_id":{"$input":"agent"}});
    guide["steps"] = json!([
        step(
            "create",
            "agent.create",
            json!({"agent":{"$input":"agent"},"preset":id,"preset_version":{"$input":"preset_version"}}),
            "Create the managed source and capture refs.source_revision."
        ),
        step(
            "configure",
            "agent.configure",
            json!({"agent":{"$input":"agent"},"target":{"kind":"project","project_id":{"$input":"agent"},"expected_revision":{"$result":"create","pointer":"/refs/source_revision"}},"settings":{"$input":"settings"}}),
            "Supply required settings and explicit environment configuration; retain returned revision."
        ),
        step(
            "inspect",
            "agent.inspect",
            json!({"agent":{"$input":"agent"},"target":target}),
            "Resolve missing slots and inspect issues. Read data.inspection.status."
        ),
        step(
            "build",
            "agent.build",
            json!({"agent":{"$input":"agent"},"target":target}),
            "Capture data.system and data.programs. deployment_json is rendered data, not proof of execution."
        ),
        step(
            "plan",
            "agent.plan",
            json!({"agent":{"$input":"agent"},"target":target}),
            "Read candidate changes and expected_generation before activation."
        ),
        step(
            "apply",
            "agent.apply",
            json!({"agent":{"$input":"agent"},"target":target,"system":{"$result":"build","pointer":"/data/system"},"expected_generation":{"$result":"plan","pointer":"/data/expected_generation"},"command_id":{"$input":"unique_command_id"}}),
            "Capture refs.release and refs.generation after all completed stages."
        ),
        json!({"id":"run","operation":"run.start","tool":"nofy_run_start","native_json_field":"request_json","native_json_body":{"run_id":{"$input":"new_run_id"},"thread_id":{"$input":"thread_id"},"system":{"$result":"build","pointer":"/data/system"},"release":{"$result":"apply","pointer":"/refs/release"},"program":{"$result":"build","pointer":"/data/programs/0"},"input":{"text":{"$input":"task"},"attachments":[]}},"expected_outcome":"Serialize the resolved native body into request_json and submit it once."}),
        step(
            "result",
            "run.inspect",
            json!({"run_id":{"$input":"new_run_id"}}),
            "While queued, execution may be null. Wait for the actual terminal execution status."
        ),
        step(
            "effects",
            "run.events",
            json!({"run_id":{"$input":"new_run_id"},"limit":256}),
            "Verify tool_completed events and actual file/output effects; save the original IDs for recovery."
        )
    ]);
    if id == "coding" {
        guide["summary"] = json!(
            "Programming baseline with selectable Chat Completions/Responses/Messages protocols, file tools, scoped skills and optional commands. Configure it entirely through public settings."
        );
        guide["examples"] = json!([{"title":"Local Linux file Agent, commands disabled explicitly","settings":{"workspace":{"$input":"canonical_workspace"},"system_name":{"$input":"agent"},"model":{"$input":"requested_model"},"profile":"chat_completions","terminal_enabled":false,"connection":{"base_url":{"$input":"model_base_url"},"models":[{"$input":"requested_model"}],"header_credentials":{"authorization":{"reference":{"$input":"credential_reference"},"prefix":"Bearer "}},"allow_insecure_http":{"$input":"allow_insecure_http"}},"environment":{"executable":"/usr/bin/python3","prefix_args":["-s","-B"],"env":{"PATH":"/usr/bin:/bin","LANG":"C.UTF-8"},"paths":[{"path":"/usr","execute":true},{"path":"/lib","execute":true},{"path":"/lib64","execute":true},{"path":"/etc/ld.so.cache"}]},"model_settings":{"stream":true,"max_output_tokens":1024}},"note":"Example runtime paths are user-provisioned Linux paths, not discovered facts. Query resource.process_local before choosing them. Enable commands only after configuring a supported process_tree resource."}]);
        guide["pitfalls"] = json!([
            "The declared terminal_enabled default may require command execution supply. Choose it explicitly for the requested task.",
            "connection, model and workspace are required. An environment must be provided for process tools.",
            "Adding a ToolPack does not change required_policies. Inspect the preset policy.tool_scope allowed names and explicitly configure new names; a child inherits the root policy floor.",
            "When paused for approval, read run.approvals, preserve its exact request in run.decide, then resume the original root using run.control. This does not grant additional filesystem or network resources.",
            "Source preset names identify behavior packages; a baseline coding preset is not proof of full pi/Codex/dsh/grok replication."
        ]);
    }
    Ok(
        json!({"preset":id,"source_digest":source.digest()?,"settings_schema":settings_schema,"settings":settings,"guide":guide}),
    )
}
