use nofy_agent::prompt::skills::{CompatConfig, SkillsConfig};
use nofy_agent::runtime::{skills::*, sources::*};
use nofy_agent_runtime::registry::ModuleFactory;
use nofy_agent_runtime::{memory::ContextSource, *};
use nofy_tool_runtime::{ToolCallContext, ToolDispatch, ToolStream, TypedToolOutput};
use serde_json::json;
use std::{
    path::Path,
    sync::{
        Arc, Mutex,
        atomic::{AtomicUsize, Ordering},
    },
};

fn skill(root: &Path, name: &str, extra: &str, body: &str) {
    let dir = root.join(".nofy/skills").join(name);
    std::fs::create_dir_all(&dir).unwrap();
    std::fs::write(
        dir.join("SKILL.md"),
        format!("---\nname: {name}\ndescription: Skill {name} description\n{extra}---\n{body}\n"),
    )
    .unwrap();
}
#[tokio::test]
async fn explicit_roots_preserve_project_precedence_and_do_not_import_user_scope() {
    let dir = tempfile::tempdir().unwrap();
    let repo = dir.path().join("repo");
    std::fs::create_dir_all(repo.join("nested")).unwrap();
    git2::Repository::init(&repo).unwrap();
    std::fs::write(repo.join("AGENTS.md"), "root instructions {{ untouched }}").unwrap();
    std::fs::write(repo.join("nested/AGENTS.md"), "nested instructions").unwrap();
    skill(&repo, "priority", "", "repo body");
    skill(&repo.join("nested"), "priority", "", "local body");
    let home = dir.path().join("home");
    std::fs::create_dir_all(home.join(".nofy")).unwrap();
    std::fs::write(home.join(".nofy/AGENTS.md"), "personal rule").unwrap();
    skill(&home, "private", "", "private body");
    let roots = ImportRoots {
        cwd: Some(repo.join("nested")),
        ..Default::default()
    };
    let rules = roots.rules(CompatConfig::default()).await.unwrap();
    assert_eq!(
        rules
            .files
            .iter()
            .map(|file| file.content.as_str())
            .collect::<Vec<_>>(),
        ["root instructions {{ untouched }}", "nested instructions"]
    );
    assert_eq!(rules.provenance().len(), 2);
    let imported = roots
        .skills(&SkillsConfig::default(), None, CompatConfig::default())
        .await
        .unwrap();
    assert_eq!(imported.skills.len(), 1);
    assert!(
        imported.skills[0]
            .body
            .as_deref()
            .unwrap()
            .contains("local body")
    );
    let with_home = ImportRoots {
        nofy_home: Some(home.join(".nofy")),
        ..roots
    };
    assert!(
        with_home
            .rules(CompatConfig::default())
            .await
            .unwrap()
            .files
            .iter()
            .any(|file| file.content == "personal rule")
    );
    assert!(
        with_home
            .skills(&SkillsConfig::default(), None, CompatConfig::default())
            .await
            .unwrap()
            .skills
            .iter()
            .any(|skill| skill.name == "private")
    );
    assert!(
        ImportRoots::default()
            .skills(&SkillsConfig::default(), None, CompatConfig::default())
            .await
            .unwrap()
            .skills
            .is_empty()
    );
    let home_only = ImportRoots {
        nofy_home: with_home.nofy_home.clone(),
        ..Default::default()
    };
    assert_eq!(
        home_only
            .rules(CompatConfig::default())
            .await
            .unwrap()
            .files
            .len(),
        1
    );
    assert!(
        ImportRoots::default()
            .rules(CompatConfig::default())
            .await
            .unwrap()
            .files
            .is_empty()
    );
}
#[tokio::test]
async fn frozen_skills_keep_bodies_flags_substitutions_and_package_identity() {
    let dir = tempfile::tempdir().unwrap();
    skill(
        dir.path(),
        "sample",
        "",
        "Original $ARGUMENTS ${SESSION_ID}",
    );
    skill(
        dir.path(),
        "manual",
        "disable-model-invocation: true\n",
        "manual body",
    );
    skill(dir.path(), "disabled", "", "disabled body");
    let roots = ImportRoots {
        cwd: Some(dir.path().into()),
        ..Default::default()
    };
    let mut imported = roots
        .skills(
            &SkillsConfig {
                disabled: vec!["disabled".into()],
                ..Default::default()
            },
            None,
            CompatConfig::default(),
        )
        .await
        .unwrap();
    skill(dir.path(), "sample", "", "Changed on disk");
    let ctx = RunContext::new("session-123", "run");
    let output = imported
        .invoke("sample", Some("argument"), false, &ctx)
        .unwrap();
    let body = output.skill_message.unwrap();
    assert!(body.contains("Original argument session-123") && !body.contains("Changed on disk"));
    assert!(imported.invoke("manual", None, false, &ctx).is_err());
    assert!(imported.invoke("manual", None, true, &ctx).is_ok());
    assert!(imported.invoke("disabled", None, true, &ctx).is_err());
    let mut plugin = imported
        .skills
        .iter()
        .find(|skill| skill.name == "sample")
        .unwrap()
        .clone();
    plugin.plugin_name = Some("package".into());
    plugin.plugin_version = Some("2.1".into());
    imported.skills.push(plugin);
    imported.validate().unwrap();
    assert_eq!(imported.package_modules()["package:sample"].version, "2.1");
    assert!(imported.invoke("package:sample", None, false, &ctx).is_ok());
    let roundtrip: FrozenSkills =
        serde_json::from_value(serde_json::to_value(imported).unwrap()).unwrap();
    assert!(
        roundtrip
            .invoke("sample", None, false, &ctx)
            .unwrap()
            .skill_message
            .unwrap()
            .contains("Original")
    );
    let mut invalid = serde_json::to_value(&roundtrip).unwrap();
    invalid["skills"][0]["typo_execution_flag"] = json!(true);
    assert!(
        SkillsFactory::tools()
            .build(&invalid, &Default::default())
            .is_err()
    );
}
struct Read;
#[async_trait::async_trait]
impl ToolDispatch for Read {
    async fn call(
        &self,
        id: nofy_tool_protocol::ToolId,
        _: serde_json::Value,
        _: ToolCallContext,
    ) -> ToolStream<TypedToolOutput> {
        nofy_tool_runtime::terminal_only(Ok(TypedToolOutput::from_value(id, json!({"ok":true}))))
    }
}
struct Script {
    step: AtomicUsize,
    requests: Arc<Mutex<Vec<ModelRequest>>>,
}
#[async_trait::async_trait]
impl Model for Script {
    async fn complete(
        &self,
        request: ModelRequest,
        _: &RunContext,
    ) -> Result<ModelResponse, Error> {
        self.requests.lock().unwrap().push(request);
        let call = match self.step.fetch_add(1, Ordering::SeqCst) {
            0 => Some(ToolCall {
                id: "read-1".into(),
                name: "read_file".into(),
                arguments: json!({"path":"src/main.rs"}),
            }),
            1 => Some(ToolCall {
                id: "skill-1".into(),
                name: "skill".into(),
                arguments: json!({"skill":"conditional"}),
            }),
            _ => None,
        };
        Ok(ModelResponse {
            tool_calls: call.into_iter().collect(),
            output: "done".into(),
            ..Default::default()
        })
    }
}
#[tokio::test]
async fn actual_tool_execution_activates_conditional_skill_and_loads_frozen_body() {
    let dir = tempfile::tempdir().unwrap();
    std::fs::create_dir_all(dir.path().join("src")).unwrap();
    std::fs::write(dir.path().join("src/main.rs"), "fn main() {}\n").unwrap();
    skill(
        dir.path(),
        "conditional",
        "paths: ['src/**']\n",
        "conditional body sentinel",
    );
    let roots = ImportRoots {
        cwd: Some(dir.path().into()),
        ..Default::default()
    };
    let imported = Arc::new(
        roots
            .skills(&SkillsConfig::default(), None, CompatConfig::default())
            .await
            .unwrap(),
    );
    assert!(
        imported
            .contribute(&RunState::default(), &RunContext::default())
            .await
            .unwrap()
            .is_empty()
    );
    let mut catalog = imported.tools().unwrap();
    catalog.insert(ToolEntry { definition: nofy_tool_types::ToolDefinition::function("read_file", Some("Read"), json!({"type":"object","required":["path"],"properties":{"path":{"type":"string"}}})), dispatch: Arc::new(Read) }).unwrap();
    let requests = Arc::new(Mutex::new(Vec::new()));
    let mut components = Components::default();
    components.models.insert(
        "model".into(),
        Arc::new(Script {
            step: AtomicUsize::new(0),
            requests: requests.clone(),
        }),
    );
    components.prompts.insert(
        "prompt".into(),
        Arc::new(StaticPrompt("business agent".into())),
    );
    components.tool_packs.insert("tools".into(), catalog);
    components.context_sources.insert("skills".into(), imported);
    let agent = AgentBuilder::new("conditional-agent")
        .model("model")
        .prompt("prompt")
        .tools("tools")
        .context_source("skills")
        .compile(&components)
        .unwrap();
    let RunOutcome::Completed { state, .. } = agent
        .invoke(RunInput::new("work"), RunContext::new("thread", "run"))
        .await
        .unwrap()
    else {
        panic!("expected completion")
    };
    let requests = requests.lock().unwrap();
    assert!(
        !serde_json::to_string(&requests[0])
            .unwrap()
            .contains("conditional body sentinel")
    );
    assert!(
        serde_json::to_string(&requests[1])
            .unwrap()
            .contains("conditional")
    );
    assert!(state.messages.iter().any(|message| matches!(message, Message::Tool { call_id, content, is_error: false } if call_id == "skill-1" && content.to_string().contains("conditional body sentinel"))));
}
