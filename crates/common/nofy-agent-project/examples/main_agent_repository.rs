//! Rebuild the checked-in, self-contained main-agent source using public APIs.
//! Usage: cargo run -p nofy-agent-project --example main_agent_repository -- OUTPUT
//! OUTPUT must not exist. No runtime, network, credentials or host mutation.
use nofy_agent_project::{repository::*, *};
use serde_json::{Value, json};
use std::{collections::BTreeMap, path::Path};

fn main() -> Result<()> {
    let output = std::env::args()
        .nth(1)
        .ok_or_else(|| Error::new("local_input", "an output directory is required"))?;
    let root = Path::new(env!("CARGO_MANIFEST_DIR")).join("../../..");
    let output = std::env::current_dir()?.join(output);
    if output.exists() {
        return Err(Error::new(
            "conflict",
            "output already exists; choose a fresh directory",
        ));
    }
    let (sources, revision) = load_repository_directory(&root.join("modules"))?;
    let temporary = tempfile::tempdir()?;
    let store = ModuleStore::open(temporary.path())?;
    let repo = store.put(
        "nofy",
        None,
        RepositoryOrigin::Directory {
            host_path: root.join("modules").canonicalize()?,
        },
    )?;
    store.synchronize("nofy", &repo.revision, sources, revision)?;
    let mut source = TemplateRegistry::open(&root.join("presets").canonicalize()?)?.get(
        "main-agent",
        Some("0.1.0"),
        None,
    )?;
    source.files.retain(|name, _| {
        [
            "project.json",
            "settings.json",
            "settings.schema.json",
            "source-files.json",
        ]
        .contains(&name.as_str())
    });
    let schema_path = "settings.schema.json";
    let mut schema = source.json(schema_path)?;
    schema["properties"]["connection"] = json!({"type":"object","description":"Explicit provider endpoint, model allow-list and credential references. Never put credential values here."});
    schema["properties"]["model"] = json!({"type":"string","minLength":1,"description":"A model admitted by connection.models."});
    schema["properties"]["max_nodes"] =
        json!({"type":"integer","minimum":1,"maximum":128,"default":64});
    schema["properties"]["assembly_max_steps"] =
        json!({"type":"integer","minimum":1,"maximum":256,"default":32});
    schema["properties"]["allowed_tools"]["default"]
        .as_array_mut()
        .unwrap()
        .push(json!("assemble"));
    source.put_json(schema_path, &schema)?;
    source.put_json("preset.json", &json!({
        "format":"nofy.preset/v1", "system": {
            "schema_version":1, "name":{"$parameter":"/system_name"},
            "required_policies":[{"$module":"guardrails.floor"}],
            "required_governance":[{"$module":"guardrails.quota"}],
            "modules":[
                {"reference":{"$module":"child-tools"},"factory":"tool.compose","config":{"packs":["messages"]},"dependencies":{"messages":{"$module":"coordination.messages"}}},
                {"reference":{"$module":"children"},"factory":"tool.compose","config":{"packs":["delegate","assembly"]},"dependencies":{"delegate":{"$module":"delegate.delegate"},"assembly":{"$module":"assembly.tools"}}},
                {"reference":{"$module":"main-tools"},"factory":"tool.compose","config":{"packs":["tasks","messages","human","assembly"]},"dependencies":{"tasks":{"$module":"coordination.tools"},"messages":{"$module":"coordination.messages"},"human":{"$module":"human.tool"},"assembly":{"$module":"assembly.tools"}}}
            ],
            "programs":{"main":{"kind":"agent","definition":{
                "schema_version":1,"name":"main-agent",
                "prompt":{"$module":"instructions.prompt"},"model":{"$module":"provider.model"},
                "tool_packs":[{"$module":"main-tools"}],"bindings":[{"$module":"coordination.binding"}],
                "settings":{"input_delivery":{"duplex":true},"scope_identity":"hashed_v2","max_steps":{"$parameter":"/max_steps"},"model":{"$parameter":"/model_settings"}}
            }}}
        }
    }))?;
    source.refresh_manifest()?;
    let kinds: FactoryKinds = [
        ("prompt.static", "prompt"),
        ("tool.compose", "tool_pack"),
        ("tool.skills", "tool_pack"),
        ("tool.dynamic_assembly", "tool_pack"),
        ("resource.agent_tasks", "resource"),
        ("binding.agent_tasks", "binding"),
        ("tool.agent_tasks", "tool_pack"),
        ("tool.agent_messages", "tool_pack"),
        ("resource.workflow", "resource"),
        ("tool.workflow_connected", "tool_pack"),
        ("policy.tool_scope", "policy"),
        ("resource.budget", "resource"),
        ("governance.budget_connected", "governance"),
        ("resource.artifact", "resource"),
        ("resource.model_connection", "resource"),
        ("resource.model_protocol", "resource"),
        ("model.programmed", "model"),
    ]
    .into_iter()
    .map(|(name, kind)| (name.to_owned(), kind.to_owned()))
    .collect();
    let mut add = |package: &str, alias: &str, parameters: Value, bindings: Value| -> Result<()> {
        let pin = store.package("nofy", package, "0.1.0")?;
        use_package(
            &mut source,
            &pin,
            &json!({"agent":"main","alias":alias,"parameters":parameters,"bindings":bindings}),
            &kinds,
        )
    };
    add(
        "main-agent-instructions",
        "instructions",
        json!({}),
        json!({}),
    )?;
    add(
        "main-agent-guardrails",
        "guardrails",
        json!({"allowed_tools":{"$parameter":"/allowed_tools"},"budget":{"$parameter":"/budget"}}),
        json!({}),
    )?;
    add(
        "model-chat-completions",
        "provider",
        json!({"connection":{"$parameter":"/connection"},"model":{"$parameter":"/model"}}),
        json!({}),
    )?;
    add(
        "main-agent-delegate",
        "delegate",
        json!({"child_allowed_tools":{"$parameter":"/child_allowed_tools"},"child_max_steps":{"$parameter":"/child_max_steps"},"model_settings":{"$parameter":"/model_settings"}}),
        json!({"model":"provider.model","tools":"child-tools"}),
    )?;
    add(
        "dynamic-assembly",
        "assembly",
        json!({"max_steps":{"$parameter":"/assembly_max_steps"},"max_nodes":{"$parameter":"/max_nodes"}}),
        json!({"model":"provider.model","tools":"child-tools"}),
    )?;
    add(
        "agent-collaboration",
        "coordination",
        json!({}),
        json!({"children":"children"}),
    )?;
    add("ask-user", "human", json!({}), json!({}))?;
    source.files.insert(
        "README.md".into(),
        File::text(include_str!(
            "../../../../docs/manual/main-agent-repository.md"
        )),
    );
    let source = store.hydrate(&source)?;
    verify_package_sources(&source)?;
    write_directory(&output, &source, None)?;
    let pins: BTreeMap<_, _> = imports(&source)?
        .into_iter()
        .map(|(alias, pin)| (alias, pin.digest))
        .collect();
    println!(
        "{}",
        serde_json::to_string_pretty(
            &json!({"source_digest":source.digest()?,"output":output,"pins":pins})
        )?
    );
    Ok(())
}
