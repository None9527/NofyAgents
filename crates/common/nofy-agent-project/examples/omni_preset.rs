//! Render the self-contained Omni preset from the existing Agent and Coding sources.
use nofy_agent_project::{Error, File, Result, load_directory, write_directory};
use serde_json::{Value, json};
use std::path::{Path, PathBuf};

fn conditional(parameter: &str, value: Value) -> Value {
    json!({"$when":{"parameter":parameter,"value":value}})
}

fn reference(id: &str) -> Value {
    json!({"$module":id})
}

fn main() -> Result<()> {
    let output = std::env::args_os()
        .nth(1)
        .map(PathBuf::from)
        .ok_or_else(|| Error::new("local_input", "an output directory is required"))?;
    let directory = Path::new(env!("CARGO_MANIFEST_DIR")).join("../../../presets");
    let mut source = load_directory(&directory.join("main-agent-composable"))?;
    let coding = load_directory(&directory.join("coding"))?;
    let old = coding.json("preset.json")?;
    let mut preset = source.json("preset.json")?;
    let system = &mut preset["system"];
    let modules = system["modules"].as_array_mut().unwrap();
    let workspace = [
        "rules",
        "cwd",
        "project-read",
        "project-write",
        "runtime",
        "files-code",
        "file-read",
        "file-write",
        "file-edit",
        "directory-create",
        "file-list",
        "file-search",
    ];
    for original in old["system"]["modules"].as_array().unwrap() {
        if let Some(id) = original["reference"]["$module"].as_str() {
            if workspace.contains(&id) {
                let mut entry = original.clone();
                if id == "runtime" {
                    entry["factory"] = json!("resource.process_local");
                    entry["config"] = json!({"$parameter":"/workspace_environment"});
                }
                modules.push(conditional("/workspace_enabled", entry));
            }
        } else if let Some(entry) = original["$when"].get("value") {
            let mut entry = entry.clone();
            if entry["reference"]["$module"] == "terminal-runtime" {
                entry["factory"] = json!("resource.process_local");
                entry["config"] = json!({"$parameter":"/command_environment"});
            }
            modules.push(conditional("/command_enabled", entry));
        }
    }
    modules.extend([
        json!({"reference":reference("omni-prompt"),"factory":"prompt.static","config":{"text":{"$file":"prompt.md"}}}),
        json!({"reference":reference("approval"),"factory":"policy.approval","config":{}}),
        json!({"reference":reference("effect-approval"),"factory":"policy.on_tools","config":{"tools":["write_file","edit_file","make_directory","run_command"]},"dependencies":{"policy":reference("approval")}}),
        json!({"reference":reference("sdk-tools"),"factory":"tool.sdk_authoring","config":{}}),
        json!({"reference":reference("sdk-work"),"factory":"tool.sdk_work","config":{}}),
        conditional("/evolution_enabled", json!({"reference":reference("sdk-evolution"),"factory":"tool.sdk_evolution","config":{}})),
    ]);
    let instructions = system["module_imports"]
        .as_object_mut()
        .unwrap()
        .remove("instructions")
        .unwrap();
    source.files.remove(&format!(
        ".nofy-module-packages/{}.json",
        instructions["digest"].as_str().unwrap()
    ));
    let compaction = nofy_agent_project::repository::load_package_directory(
        &directory.join("../modules/agent-foundation/context-compaction"),
    )?;
    let compaction_digest = compaction.digest()?;
    let compaction_manifest = compaction.json("module.json")?;
    source.put_json(
        &nofy_agent_project::repository::package_file(&compaction_digest)?,
        &serde_json::to_value(&compaction)?,
    )?;
    system["module_imports"]["compaction"] = json!({
        "repository":"nofy","name":compaction_manifest["name"],"version":compaction_manifest["version"],"digest":compaction_digest,
        "bindings":{"model":reference("provider.model")},
        "parameters":{"context_window":{"$parameter":"/context_window"},"threshold_percent":{"$parameter":"/compaction_threshold_percent"},
            "keep_turns":{"$parameter":"/compaction_keep_turns"}},
        "exports":{"policy":"policy","journal":"journal"},
        "factories":{"policy":"context.programmed","journal":"binding.model_journal"}
    });
    system["required_policies"]
        .as_array_mut()
        .unwrap()
        .push(reference("effect-approval"));
    let main = &mut system["programs"]["main"]["definition"];
    main["name"] = json!("omni");
    main["prompt"] = reference("omni-prompt");
    main["bindings"]
        .as_array_mut()
        .unwrap()
        .push(conditional("/workspace_enabled", reference("cwd")));
    main["bindings"]
        .as_array_mut()
        .unwrap()
        .push(reference("compaction.journal"));
    main["context_policies"] = json!([reference("compaction.policy")]);
    main["context_sources"] = json!([conditional("/workspace_enabled", reference("rules"))]);
    let packs = main["tool_packs"].as_array_mut().unwrap();
    packs.push(reference("sdk-tools"));
    packs.push(reference("sdk-work"));
    packs.push(conditional(
        "/evolution_enabled",
        reference("sdk-evolution"),
    ));
    packs.extend(
        [
            "file-read",
            "file-write",
            "file-edit",
            "directory-create",
            "file-list",
            "file-search",
        ]
        .map(|id| conditional("/workspace_enabled", reference(id))),
    );
    packs.push(conditional("/command_enabled", reference("command")));

    let mut schema = source.json("settings.schema.json")?;
    let properties = schema["properties"].as_object_mut().unwrap();
    properties.get_mut("system_name").unwrap()["default"] = json!("omni");
    properties.get_mut("allowed_tools").unwrap()["default"] = json!([
        "task",
        "agent_messages",
        "ask_user",
        "workflow_execute",
        "workflow_agent",
        "assemble",
        "read_file",
        "write_file",
        "edit_file",
        "make_directory",
        "list_files",
        "search_files",
        "run_command",
        "sdk_schema",
        "sdk_run_inspect",
        "sdk_work_list",
        "sdk_work_inspect",
        "sdk_work_targets",
        "sdk_work_attached_targets",
        "sdk_work_start",
        "sdk_work_wait",
        "sdk_work_control",
        "sdk_work_task",
        "sdk_module_template",
        "sdk_module_list",
        "sdk_propose_prompt"
    ]);
    for flag in ["workspace_enabled", "command_enabled", "evolution_enabled"] {
        properties.insert(flag.into(), json!({"type":"boolean","default":false}));
    }
    properties.insert(
        "context_window".into(),
        json!({"type":"integer","minimum":256,"maximum":10000000,"default":262144}),
    );
    properties.insert(
        "compaction_threshold_percent".into(),
        json!({"type":"integer","minimum":1,"maximum":100,"default":75}),
    );
    properties.insert(
        "compaction_keep_turns".into(),
        json!({"type":"integer","minimum":0,"maximum":64,"default":2}),
    );
    properties.insert(
        "workspace".into(),
        json!({"type":"string","minLength":1,"maxLength":4096}),
    );
    for name in [
        "workspace_environment",
        "command_environment",
        "process_tree",
    ] {
        properties.insert(name.into(), json!({"type":"object"}));
    }
    schema["allOf"] = json!([
        {"if":{"required":["workspace_enabled"],"properties":{"workspace_enabled":{"const":true}}},"then":{"required":["workspace","workspace_environment"]}},
        {"if":{"required":["command_enabled"],"properties":{"command_enabled":{"const":true}}},"then":{"required":["workspace","command_environment","process_tree"]}}
    ]);
    source.put_json("preset.json", &preset)?;
    source.put_json("settings.schema.json", &schema)?;
    for path in [
        "rules.md",
        "modules/files/files.py",
        "modules/files/workspace.py",
        "modules/files/manifest.json",
        "modules/command/command.py",
        "modules/command/manifest.json",
    ] {
        let file = coding
            .files
            .get(path)
            .ok_or_else(|| Error::new("not_found", format!("missing Coding source {path}")))?;
        source.files.insert(path.into(), file.clone());
    }
    source.files.insert(
        "prompt.md".into(),
        File::text(include_str!("../../../../docs/manual/omni-agent-prompt.md")),
    );
    source.files.insert(
        "README.md".into(),
        File::text(include_str!("../../../../docs/manual/omni-agent.md")),
    );
    source.files.insert(
        "文件说明.md".into(),
        File::text(include_str!("../../../../docs/manual/omni-agent-files.md")),
    );
    nofy_agent_project::repository::verify_package_sources(&source)?;
    source.refresh_manifest()?;
    write_directory(&std::env::current_dir()?.join(output), &source, None)
}
