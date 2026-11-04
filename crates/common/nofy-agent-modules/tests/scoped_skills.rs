use nofy_agent_modules::skills::SkillsFactory;
use nofy_agent_runtime::{governance::*, registry::*, *};
use nofy_tool_runtime::{Tool, ToolCallContext};
use nofy_tool_types::ToolDescription;
use serde_json::{Value, json};
use std::{
    collections::BTreeMap,
    sync::{
        Arc, Mutex,
        atomic::{AtomicBool, AtomicUsize, Ordering},
    },
};

#[derive(Clone, Copy)]
enum Role {
    Parent,
    Child,
}
struct Script {
    role: Role,
    attack: bool,
    requests: Arc<Mutex<Vec<ModelRequest>>>,
}
#[async_trait::async_trait]
impl Model for Script {
    async fn complete(
        &self,
        request: ModelRequest,
        _: &RunContext,
    ) -> Result<ModelResponse, Error> {
        self.requests.lock().unwrap().push(request.clone());
        let result = request.messages.iter().rev().find_map(|message| {
            if let Message::Tool {
                call_id,
                content,
                is_error,
            } = message
            {
                Some((call_id, content, *is_error))
            } else {
                None
            }
        });
        Ok(match self.role {
            Role::Parent => {
                if let Some((_, content, _)) = result {
                    ModelResponse {
                        output: format!("parent: {content}"),
                        ..Default::default()
                    }
                } else {
                    ModelResponse {
                        tool_calls: vec![ToolCall {
                            id: "skill-call".into(),
                            name: "skill".into(),
                            arguments: json!({"skill":"research","args":"work"}),
                        }],
                        ..Default::default()
                    }
                }
            }
            Role::Child => {
                if result.is_none() && self.attack {
                    ModelResponse {
                        tool_calls: vec![ToolCall {
                            id: "forbidden".into(),
                            name: "write".into(),
                            arguments: json!({}),
                        }],
                        ..Default::default()
                    }
                } else if result.is_none() || result.is_some_and(|(id, _, _)| id == "forbidden") {
                    ModelResponse {
                        tool_calls: vec![ToolCall {
                            id: "allowed".into(),
                            name: "read".into(),
                            arguments: json!({}),
                        }],
                        ..Default::default()
                    }
                } else {
                    ModelResponse {
                        output: "scoped complete".into(),
                        ..Default::default()
                    }
                }
            }
        })
    }
}
struct Counter {
    name: &'static str,
    count: Arc<AtomicUsize>,
}
impl Tool for Counter {
    type Args = Value;
    type Output = Value;
    fn id(&self) -> nofy_tool_protocol::ToolId {
        nofy_tool_protocol::ToolId::new(self.name).unwrap()
    }
    fn description(&self, _: &nofy_tool_runtime::ListToolsContext) -> ToolDescription {
        let mut d = ToolDescription::new(self.name, self.name);
        d.arguments_schema = Some(json!({"type":"object","additionalProperties":false}));
        d
    }
    async fn run(
        &self,
        _: ToolCallContext,
        _: Value,
    ) -> Result<Value, nofy_tool_runtime::ToolError> {
        Ok(json!({"count":self.count.fetch_add(1,Ordering::SeqCst)+1}))
    }
}
struct Gate(Arc<AtomicBool>);
#[async_trait::async_trait]
impl Policy for Gate {
    async fn admit(
        &self,
        call: &ToolCall,
        _: &RunState,
        _: &RunContext,
    ) -> Result<Admission, Error> {
        Ok(if call.name == "read" && !self.0.load(Ordering::SeqCst) {
            Admission::Pause(json!({"approve":call.id}))
        } else {
            Admission::Allow
        })
    }
}
struct DenyRead;
#[async_trait::async_trait]
impl Policy for DenyRead {
    async fn admit(
        &self,
        call: &ToolCall,
        _: &RunState,
        _: &RunContext,
    ) -> Result<Admission, Error> {
        Ok(if call.name == "read" {
            Admission::Deny("host denied read".into())
        } else {
            Admission::Allow
        })
    }
}
struct Fixture {
    _root: tempfile::TempDir,
    config: Value,
    dependencies: BTreeMap<String, ModuleInstance>,
    parent: Arc<Mutex<Vec<ModelRequest>>>,
    child: Arc<Mutex<Vec<ModelRequest>>>,
    read: Arc<AtomicUsize>,
    write: Arc<AtomicUsize>,
}
impl Fixture {
    fn new(attack: bool) -> Self {
        let root = tempfile::tempdir().unwrap();
        let path = root.path().join("SKILL.md");
        std::fs::write(&path, "frozen").unwrap();
        let config = json!({"skills":[{"name":"research","description":"Scoped research","path":path,"scope":"user","body":"Research task: $ARGUMENTS","model":"fast","effort":"high","allowed_tools":["read"],"metadata":{"z":"last","a":"first","n":"middle"}}],"execution":{
            "default_model":"default","models":{"fast":"alternate"},"tool_packs":["tools"],"model_settings":{"temperature":0.2,"reasoning_effort":"low"},"max_steps":8
        }});
        let parent = Arc::new(Mutex::new(Vec::new()));
        let child = Arc::new(Mutex::new(Vec::new()));
        let read = Arc::new(AtomicUsize::new(0));
        let write = Arc::new(AtomicUsize::new(0));
        let mut tools = ToolCatalog::new();
        tools
            .insert(ToolEntry::typed(Counter {
                name: "read",
                count: read.clone(),
            }))
            .unwrap();
        tools
            .insert(ToolEntry::typed(Counter {
                name: "write",
                count: write.clone(),
            }))
            .unwrap();
        let dependencies = BTreeMap::from([
            (
                "default".into(),
                ModuleInstance::Model(Arc::new(Script {
                    role: Role::Parent,
                    attack: false,
                    requests: Arc::new(Mutex::new(Vec::new())),
                })),
            ),
            (
                "alternate".into(),
                ModuleInstance::Model(Arc::new(Script {
                    role: Role::Child,
                    attack,
                    requests: child.clone(),
                })),
            ),
            ("tools".into(), ModuleInstance::ToolPack(tools)),
        ]);
        Self {
            _root: root,
            config,
            dependencies,
            parent,
            child,
            read,
            write,
        }
    }
    fn build(&self) -> Agent {
        self.build_with_factory(SkillsFactory::tools())
    }
    fn build_with_factory(&self, factory: SkillsFactory) -> Agent {
        let ModuleInstance::ToolPack(tools) =
            factory.build(&self.config, &self.dependencies).unwrap()
        else {
            panic!("tool pack")
        };
        let mut c = Components::default();
        c.models.insert(
            "parent".into(),
            Arc::new(Script {
                role: Role::Parent,
                attack: false,
                requests: self.parent.clone(),
            }),
        );
        c.prompts.insert(
            "prompt".into(),
            Arc::new(StaticPrompt("parent prompt".into())),
        );
        c.tool_packs.insert("skills".into(), tools);
        AgentBuilder::new("parent")
            .model("parent")
            .prompt("prompt")
            .tools("skills")
            .settings(Settings {
                max_steps: 8,
                model: json!({"temperature":0.1,"reasoning_effort":"low"}),
                ..Default::default()
            })
            .compile(&c)
            .unwrap()
    }
}
fn context() -> RunContext {
    RunContext::new("root-thread", "root-run")
}

#[tokio::test]
async fn bounded_scoped_skill_fails_before_child_dispatch_then_normal_run_keeps_scope() {
    use nofy_agent_modules::skills::SubstitutionLimits;
    let limits = SubstitutionLimits {
        max_input_bytes: 1024 * 1024,
        max_output_bytes: 1024,
        max_work_bytes: 64 * 1024 * 1024,
    };
    let mut f = Fixture::new(false);
    f.config["skills"][0]["body"] = json!("$0".repeat(300));
    let outcome = f
        .build_with_factory(SkillsFactory::tools().with_substitution_limits(limits))
        .invoke(RunInput::new("go"), context())
        .await
        .unwrap();
    assert!(
        matches!(outcome, RunOutcome::Completed { output, .. } if output.contains("skill substitution output exceeds byte limit"))
    );
    assert_eq!(f.parent.lock().unwrap().len(), 2);
    assert!(f.child.lock().unwrap().is_empty());
    assert_eq!(f.read.load(Ordering::SeqCst), 0);
    assert_eq!(f.write.load(Ordering::SeqCst), 0);
    f.config["skills"][0]["body"] = json!("Research $ARGUMENTS");
    f.build_with_factory(SkillsFactory::tools().with_substitution_limits(limits))
        .invoke(
            RunInput::new("go"),
            RunContext::new("next-thread", "next-run"),
        )
        .await
        .unwrap();
    assert_eq!(f.child.lock().unwrap().len(), 2);
    assert_eq!(f.read.load(Ordering::SeqCst), 1);
    assert_eq!(f.write.load(Ordering::SeqCst), 0);
    for request in f.child.lock().unwrap().iter() {
        assert_eq!(request.settings["reasoning_effort"], "high");
        assert!(
            request
                .tools
                .iter()
                .all(|tool| tool.function.name == "read")
        );
    }
}

#[test]
fn scoped_recovery_identity_includes_only_explicitly_enabled_substitution_profile() {
    use nofy_agent_modules::skills::SubstitutionLimits;
    let f = Fixture::new(false);
    let identity = |factory: SkillsFactory| {
        let ModuleInstance::ToolPack(pack) = factory.build(&f.config, &f.dependencies).unwrap()
        else {
            panic!("pack")
        };
        pack.get("skill")
            .unwrap()
            .dispatch
            .recovery_identity()
            .unwrap()
    };
    let original = identity(SkillsFactory::tools());
    let limits = SubstitutionLimits {
        max_input_bytes: 1024 * 1024,
        max_output_bytes: 1024,
        max_work_bytes: 64 * 1024 * 1024,
    };
    let bounded = identity(SkillsFactory::tools().with_substitution_limits(limits));
    assert_ne!(original, bounded);
    assert_eq!(
        bounded,
        identity(SkillsFactory::tools().with_substitution_limits(limits))
    );
    assert_ne!(
        bounded,
        identity(
            SkillsFactory::tools().with_substitution_limits(SubstitutionLimits {
                max_output_bytes: 2048,
                ..limits
            })
        )
    );
    assert_eq!(original, identity(SkillsFactory::tools()));
}

#[tokio::test]
async fn scope_context_validation_precedes_dynamic_sources_and_child_model_dispatch() {
    use nofy_agent_modules::skills::{SkillScopeCompiler, SkillToolScope};
    struct Guard;
    impl SkillScopeCompiler for Guard {
        fn identity(&self) -> &str {
            "context-guard-test:1"
        }
        fn compile(&self, _: &[String]) -> Result<Arc<dyn SkillToolScope>, Error> {
            Ok(Arc::new(Guard))
        }
    }
    #[async_trait::async_trait]
    impl Policy for Guard {
        async fn admit(
            &self,
            _: &ToolCall,
            _: &RunState,
            _: &RunContext,
        ) -> Result<Admission, Error> {
            panic!("context mismatch must stop before tool admission")
        }
    }
    impl SkillToolScope for Guard {
        fn identity(&self) -> &str {
            "context-guard-test:1"
        }
        fn permits_name(&self, _: &str) -> bool {
            true
        }
        fn validate_catalog(&self, _: &ToolCatalog) -> Result<(), Error> {
            Ok(())
        }
        fn validate_context(&self, _: &RunContext) -> Result<(), Error> {
            Err(Error::Composition("declared context mismatch test".into()))
        }
    }
    struct Source(Arc<AtomicUsize>);
    #[async_trait::async_trait]
    impl ToolSource for Source {
        async fn snapshot(&self, _: &RunContext) -> Result<ToolSnapshot, Error> {
            self.0.fetch_add(1, Ordering::SeqCst);
            Err(Error::Composition(
                "dynamic source must not be called".into(),
            ))
        }
    }
    let mut f = Fixture::new(false);
    let calls = Arc::new(AtomicUsize::new(0));
    f.config["execution"]["tool_sources"] = json!(["dynamic"]);
    f.dependencies.insert(
        "dynamic".into(),
        ModuleInstance::ToolSource(Arc::new(Source(calls.clone()))),
    );
    let result = f
        .build_with_factory(SkillsFactory::tools().with_scope_compiler(Arc::new(Guard)))
        .invoke(RunInput::new("go"), context())
        .await
        .unwrap_err();
    assert!(
        result
            .to_string()
            .contains("declared context mismatch test")
    );
    assert_eq!(f.parent.lock().unwrap().len(), 1);
    assert_eq!(calls.load(Ordering::SeqCst), 0);
    assert!(f.child.lock().unwrap().is_empty());
    assert_eq!(f.read.load(Ordering::SeqCst), 0);
}
#[tokio::test]
async fn model_effort_and_tool_scope_apply_only_to_the_skill_child() {
    let f = Fixture::new(true);
    let outcome = f
        .build()
        .invoke(RunInput::new("go"), context())
        .await
        .unwrap();
    assert!(
        matches!(outcome,RunOutcome::Completed {output,..} if output.contains("scoped complete"))
    );
    assert_eq!(f.read.load(Ordering::SeqCst), 1);
    assert_eq!(f.write.load(Ordering::SeqCst), 0);
    assert_eq!(f.parent.lock().unwrap().len(), 2);
    for request in f.parent.lock().unwrap().iter() {
        assert_eq!(request.settings["reasoning_effort"], "low");
        assert_eq!(request.settings["temperature"], 0.1);
    }
    assert_eq!(f.child.lock().unwrap().len(), 3);
    for request in f.child.lock().unwrap().iter() {
        assert_eq!(request.settings["reasoning_effort"], "high");
        assert_eq!(request.settings["temperature"], 0.2);
        assert_eq!(
            request
                .tools
                .iter()
                .map(|tool| tool.function.name.as_str())
                .collect::<Vec<_>>(),
            vec!["read"]
        );
        assert!(
            matches!(&request.messages[0],Message::System {content} if content.contains("Research task: work"))
        );
    }
}
#[tokio::test]
async fn inherited_host_permission_can_deny_a_skill_allowed_tool() {
    let f = Fixture::new(false);
    let agent = f
        .build()
        .with_required_policy("host-1", Arc::new(DenyRead))
        .unwrap();
    assert!(matches!(
        agent.invoke(RunInput::new("go"), context()).await.unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert_eq!(f.read.load(Ordering::SeqCst), 0);
    assert_eq!(f.write.load(Ordering::SeqCst), 0);
}
#[tokio::test]
async fn permission_pause_resumes_the_same_child_without_resampling_parent_or_reexecuting_tool() {
    let f = Fixture::new(false);
    let approved = Arc::new(AtomicBool::new(false));
    let store = Arc::new(InMemoryCheckpointer::default());
    let agent = f
        .build()
        .with_required_policy("approval-1", Arc::new(Gate(approved.clone())))
        .unwrap()
        .with_checkpointer(store.clone());
    assert!(matches!(
        agent.invoke(RunInput::new("go"), context()).await.unwrap(),
        RunOutcome::Paused { .. }
    ));
    assert_eq!(f.parent.lock().unwrap().len(), 1);
    assert_eq!(f.child.lock().unwrap().len(), 1);
    assert_eq!(f.read.load(Ordering::SeqCst), 0);
    approved.store(true, Ordering::SeqCst);
    let rebuilt = f
        .build()
        .with_required_policy("approval-1", Arc::new(Gate(approved)))
        .unwrap()
        .with_checkpointer(store);
    assert!(matches!(
        rebuilt.invoke(RunInput::resume(), context()).await.unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert_eq!(f.parent.lock().unwrap().len(), 2);
    assert_eq!(f.child.lock().unwrap().len(), 2);
    assert_eq!(f.read.load(Ordering::SeqCst), 1);
}
#[tokio::test]
async fn skill_child_cannot_reset_the_root_model_budget() {
    let f = Fixture::new(false);
    let ledger = Arc::new(InMemoryBudgetStore::default());
    let profile = Arc::new(
        GovernanceProfile::new(
            Arc::new(
                InstalledBudget::install(
                    ledger.clone(),
                    BudgetLimits {
                        max_model_calls: Some(2),
                        ..Default::default()
                    },
                    "host-1",
                    1,
                )
                .unwrap(),
            ),
            BudgetLimits::default(),
            ModelRetryPolicy::default(),
        )
        .unwrap(),
    );
    let scope = BudgetScope {
        root_run_id: "root-run".into(),
        identity: profile.identity().into(),
    };
    assert!(matches!(
        f.build()
            .with_governance(profile)
            .invoke(RunInput::new("go"), context())
            .await
            .unwrap(),
        RunOutcome::BudgetExceeded { .. }
    ));
    assert_eq!(f.parent.lock().unwrap().len(), 1);
    assert_eq!(f.child.lock().unwrap().len(), 1);
    assert_eq!(
        ledger
            .inspect(&scope)
            .await
            .unwrap()
            .unwrap()
            .used
            .model_calls,
        2
    );
}
#[test]
fn bindings_are_pure_explicit_and_metadata_map_order_does_not_change_recovery_identity() {
    let f = Fixture::new(false);
    let factory = SkillsFactory::tools();
    let required = factory.config_dependencies(&f.config).unwrap();
    assert_eq!(
        required,
        BTreeMap::from([
            ("default".into(), ModuleKind::Model),
            ("alternate".into(), ModuleKind::Model),
            ("tools".into(), ModuleKind::ToolPack)
        ])
    );
    let mut identity = None;
    for _ in 0..16 {
        let ModuleInstance::ToolPack(pack) = factory.build(&f.config, &f.dependencies).unwrap()
        else {
            panic!("pack")
        };
        let actual = pack
            .get("skill")
            .unwrap()
            .dispatch
            .recovery_identity()
            .unwrap();
        if let Some(expected) = &identity {
            assert_eq!(&actual, expected);
        }
        identity = Some(actual);
    }
    let mut unknown = f.config.clone();
    unknown["skills"][0]["model"] = json!("missing");
    assert!(factory.build(&unknown, &f.dependencies).is_err());
    let mut unbound = f.config.clone();
    unbound.as_object_mut().unwrap().remove("execution");
    assert!(factory.build(&unbound, &BTreeMap::new()).is_err());
    assert_eq!(f.child.lock().unwrap().len(), 0);
}

// The parent process starts fresh test workers rather than reusing trait-object
// handles, proving that published skill metadata and child identities survive
// a real process boundary.
fn append(path: &std::path::Path, value: &str) {
    use std::io::Write;
    writeln!(
        std::fs::OpenOptions::new()
            .create(true)
            .append(true)
            .open(path)
            .unwrap(),
        "{value}"
    )
    .unwrap();
}
struct FileModel {
    role: &'static str,
    root: std::path::PathBuf,
}
#[async_trait::async_trait]
impl Model for FileModel {
    async fn complete(
        &self,
        request: ModelRequest,
        _: &RunContext,
    ) -> Result<ModelResponse, Error> {
        append(
            &self.root.join(format!("{}.log", self.role)),
            &request.settings.to_string(),
        );
        if request
            .messages
            .iter()
            .any(|message| matches!(message, Message::Tool { .. }))
        {
            return Ok(ModelResponse {
                output: "completed".into(),
                ..Default::default()
            });
        }
        Ok(ModelResponse {
            tool_calls: vec![ToolCall {
                id: "call".into(),
                name: if self.role == "parent" {
                    "skill"
                } else {
                    "read"
                }
                .into(),
                arguments: if self.role == "parent" {
                    json!({"skill":"research","args":"work"})
                } else {
                    json!({})
                },
            }],
            ..Default::default()
        })
    }
}
struct FileRead(std::path::PathBuf);
impl Tool for FileRead {
    type Args = Value;
    type Output = Value;
    fn id(&self) -> nofy_tool_protocol::ToolId {
        nofy_tool_protocol::ToolId::new("read").unwrap()
    }
    fn description(&self, _: &nofy_tool_runtime::ListToolsContext) -> ToolDescription {
        let mut d = ToolDescription::new("read", "read");
        d.arguments_schema = Some(json!({"type":"object"}));
        d
    }
    async fn run(
        &self,
        _: ToolCallContext,
        _: Value,
    ) -> Result<Value, nofy_tool_runtime::ToolError> {
        append(&self.0, "read");
        Ok(json!({"read":true}))
    }
}
#[test]
fn scoped_skill_worker() {
    let Ok(root) = std::env::var("NOFY_SCOPED_SKILL_TEST_ROOT") else {
        return;
    };
    let mode = std::env::var("NOFY_SCOPED_SKILL_TEST_MODE").unwrap();
    let root = std::path::PathBuf::from(root);
    tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()
        .unwrap()
        .block_on(async {
            let config: Value =
                serde_json::from_str(&std::fs::read_to_string(root.join("skill.json")).unwrap())
                    .unwrap();
            let mut tools = ToolCatalog::new();
            tools
                .insert(ToolEntry::typed(FileRead(root.join("effect.log"))))
                .unwrap();
            let dependencies = BTreeMap::from([
                (
                    "default".into(),
                    ModuleInstance::Model(Arc::new(FileModel {
                        role: "unused",
                        root: root.clone(),
                    })),
                ),
                (
                    "alternate".into(),
                    ModuleInstance::Model(Arc::new(FileModel {
                        role: "child",
                        root: root.clone(),
                    })),
                ),
                ("tools".into(), ModuleInstance::ToolPack(tools)),
            ]);
            let ModuleInstance::ToolPack(skills) = SkillsFactory::tools()
                .build(&config, &dependencies)
                .unwrap()
            else {
                panic!("skills")
            };
            let mut c = Components::default();
            c.models.insert(
                "parent".into(),
                Arc::new(FileModel {
                    role: "parent",
                    root: root.clone(),
                }),
            );
            c.prompts
                .insert("p".into(), Arc::new(StaticPrompt("parent".into())));
            c.tool_packs.insert("skills".into(), skills);
            let store = Arc::new(
                nofy_agent_runtime::durable::SqliteStore::open(&root.join("runtime.sqlite"))
                    .unwrap(),
            );
            let profile = Arc::new(
                GovernanceProfile::new(
                    Arc::new(
                        InstalledBudget::install(
                            store.clone(),
                            BudgetLimits {
                                max_model_calls: Some(4),
                                ..Default::default()
                            },
                            "host-1",
                            1,
                        )
                        .unwrap(),
                    ),
                    BudgetLimits::default(),
                    ModelRetryPolicy::default(),
                )
                .unwrap(),
            );
            let agent = AgentBuilder::new("parent-worker")
                .model("parent")
                .prompt("p")
                .tools("skills")
                .settings(Settings {
                    max_steps: 8,
                    model: json!({"reasoning_effort":"low"}),
                    ..Default::default()
                })
                .compile(&c)
                .unwrap()
                .with_required_policy(
                    "approval-1",
                    Arc::new(Gate(Arc::new(AtomicBool::new(mode == "resume")))),
                )
                .unwrap()
                .with_checkpointer(store)
                .with_governance(profile);
            let outcome = agent
                .invoke(
                    if mode == "resume" {
                        RunInput::resume()
                    } else {
                        RunInput::new("go")
                    },
                    context(),
                )
                .await
                .unwrap();
            assert!(if mode == "resume" {
                matches!(outcome, RunOutcome::Completed { .. })
            } else {
                matches!(outcome, RunOutcome::Paused { .. })
            });
        });
}
#[test]
fn scoped_skill_restarts_across_processes_with_sqlite_and_exact_parent_child_identity() {
    let f = Fixture::new(false);
    let root = f._root.path();
    std::fs::write(root.join("skill.json"), f.config.to_string()).unwrap();
    for mode in ["pause", "resume"] {
        let result = std::process::Command::new(std::env::current_exe().unwrap())
            .args(["--exact", "scoped_skill_worker", "--nocapture"])
            .env("NOFY_SCOPED_SKILL_TEST_ROOT", root)
            .env("NOFY_SCOPED_SKILL_TEST_MODE", mode)
            .output()
            .unwrap();
        assert!(
            result.status.success(),
            "stdout: {}\nstderr: {}",
            String::from_utf8_lossy(&result.stdout),
            String::from_utf8_lossy(&result.stderr)
        );
    }
    let parent = std::fs::read_to_string(root.join("parent.log")).unwrap();
    let child = std::fs::read_to_string(root.join("child.log")).unwrap();
    assert_eq!(parent.lines().count(), 2);
    assert_eq!(child.lines().count(), 2);
    assert_eq!(
        std::fs::read_to_string(root.join("effect.log"))
            .unwrap()
            .lines()
            .count(),
        1
    );
    assert!(!root.join("unused.log").exists());
    for line in parent.lines() {
        assert_eq!(
            serde_json::from_str::<Value>(line).unwrap()["reasoning_effort"],
            "low"
        );
    }
    for line in child.lines() {
        assert_eq!(
            serde_json::from_str::<Value>(line).unwrap()["reasoning_effort"],
            "high"
        );
    }
}

#[tokio::test]
async fn scoped_skill_is_compiled_from_public_configuration_and_restored_snapshot() {
    let f = Fixture::new(false);
    let mut registry = ModuleRegistry::default();
    registry
        .register_factory(Arc::new(SkillsFactory::tools()))
        .unwrap();
    for (id, instance) in f.dependencies.clone().into_iter().chain([
        (
            "parent".into(),
            ModuleInstance::Model(Arc::new(Script {
                role: Role::Parent,
                attack: false,
                requests: f.parent.clone(),
            })),
        ),
        (
            "prompt".into(),
            ModuleInstance::Prompt(Arc::new(StaticPrompt("parent".into()))),
        ),
    ]) {
        registry
            .register_factory(Arc::new(InstanceFactory::new(id, "1", instance)))
            .unwrap();
    }
    let mut modules: Vec<Value> = ["default", "alternate", "tools", "parent", "prompt"]
        .into_iter()
        .map(|id| json!({"reference":{"id":id,"version":"1"},"factory":id,"config":{}}))
        .collect();
    modules.push(json!({"reference":{"id":"skills","version":"1"},"factory":"tool.skills","config":f.config,"dependencies":{
        "default":{"id":"default","version":"1"},"alternate":{"id":"alternate","version":"1"},"tools":{"id":"tools","version":"1"}
    }}));
    let document = json!({"modules":modules,"agent":{"name":"configured","model":{"id":"parent","version":"1"},"prompt":{"id":"prompt","version":"1"},"tool_packs":[{"id":"skills","version":"1"}]}});
    let compiled =
        compile::compile_document(serde_json::from_value(document.clone()).unwrap(), &registry)
            .unwrap();
    let restored = compiled.snapshot.restore(&registry).unwrap();
    assert!(matches!(
        restored
            .agent
            .invoke(RunInput::new("go"), context())
            .await
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert_eq!(f.read.load(Ordering::SeqCst), 1);
    let mut missing = document.clone();
    missing["modules"][5]["dependencies"]
        .as_object_mut()
        .unwrap()
        .remove("alternate");
    assert!(
        compile::compile_document(serde_json::from_value(missing).unwrap(), &registry).is_err()
    );
    let mut wrong = document;
    wrong["modules"][5]["dependencies"]["alternate"] = json!({"id":"prompt","version":"1"});
    assert!(compile::compile_document(serde_json::from_value(wrong).unwrap(), &registry).is_err());
    assert_eq!(f.child.lock().unwrap().len(), 2);
}
struct FinishWith(CompletionInfo);
#[async_trait::async_trait]
impl Model for FinishWith {
    async fn complete(&self, _: ModelRequest, _: &RunContext) -> Result<ModelResponse, Error> {
        Ok(ModelResponse {
            output: "partial".into(),
            info: self.0.clone(),
            ..Default::default()
        })
    }
}
#[tokio::test]
async fn scoped_skill_does_not_report_refusal_or_length_as_success() {
    for info in [
        CompletionInfo {
            refusal: Some("declined".into()),
            ..Default::default()
        },
        CompletionInfo {
            stop_reason: Some("length".into()),
            ..Default::default()
        },
    ] {
        let mut f = Fixture::new(false);
        f.dependencies.insert(
            "alternate".into(),
            ModuleInstance::Model(Arc::new(FinishWith(info))),
        );
        let RunOutcome::Completed { state, .. } = f
            .build()
            .invoke(RunInput::new("go"), context())
            .await
            .unwrap()
        else {
            panic!("parent completes")
        };
        let result = state
            .messages
            .iter()
            .find_map(|message| match message {
                Message::Tool { content, .. } => Some(content.clone()),
                _ => None,
            })
            .unwrap();
        assert_eq!(result["value"]["success"], false, "{result}");
        let model_view: Value =
            serde_json::from_str(result["model_output"][0]["text"].as_str().unwrap()).unwrap();
        assert_eq!(model_view, result["value"]);
        assert_eq!(result["value"]["execution"]["output"], "partial");
    }
}
struct WaitingModel(Arc<tokio::sync::Notify>);
#[async_trait::async_trait]
impl Model for WaitingModel {
    async fn complete(&self, _: ModelRequest, _: &RunContext) -> Result<ModelResponse, Error> {
        self.0.notify_one();
        std::future::pending().await
    }
}
#[tokio::test]
async fn scoped_skill_cancellation_stays_on_the_parent_control_rail() {
    let mut f = Fixture::new(false);
    let started = Arc::new(tokio::sync::Notify::new());
    f.dependencies.insert(
        "alternate".into(),
        ModuleInstance::Model(Arc::new(WaitingModel(started.clone()))),
    );
    let context = context();
    let cancellation = context.cancel.clone();
    let agent = f.build();
    let run = agent.invoke(RunInput::new("go"), context);
    let cancel = async {
        started.notified().await;
        cancellation.cancel();
    };
    let (outcome, ()) = tokio::join!(run, cancel);
    assert!(matches!(outcome.unwrap(), RunOutcome::Cancelled { .. }));
    assert_eq!(f.read.load(Ordering::SeqCst), 0);
    assert_eq!(f.parent.lock().unwrap().len(), 1);
}

struct UserCommandParent;
#[async_trait::async_trait]
impl Model for UserCommandParent {
    async fn complete(
        &self,
        request: ModelRequest,
        _: &RunContext,
    ) -> Result<ModelResponse, Error> {
        if !request
            .messages
            .iter()
            .any(|m| matches!(m, Message::Tool { .. }))
        {
            return Err(Error::GovernancePaused(
                json!({"kind":"await_user_command"}),
            ));
        }
        Ok(ModelResponse {
            output: "manual skill finished".into(),
            ..Default::default()
        })
    }
}
fn compile_user_skill(
    f: &Fixture,
    hook: Option<Arc<hooks::HookRegistration>>,
    parent: Option<Arc<dyn Model>>,
) -> compile::CompiledAgent {
    let mut registry = ModuleRegistry::default();
    registry
        .register_factory(Arc::new(SkillsFactory::tools()))
        .unwrap();
    registry
        .register_factory(Arc::new(StaticPromptFactory))
        .unwrap();
    for (name, instance) in f.dependencies.clone().into_iter().chain([(
        "parent".into(),
        ModuleInstance::Model(parent.unwrap_or_else(|| Arc::new(UserCommandParent))),
    )]) {
        registry
            .register_factory(Arc::new(InstanceFactory::new(name, "1", instance)))
            .unwrap();
    }
    let mut modules: Vec<Value> = ["default", "alternate", "tools", "parent"]
        .into_iter()
        .map(|name| json!({"reference":{"id":name,"version":"1"},"factory":name,"config":{}}))
        .collect();
    modules.push(json!({"reference":{"id":"prompt","version":"1"},"factory":"prompt.static","config":{"text":"parent"}}));
    let dependencies = if f.config["execution"].is_null() {
        json!({})
    } else {
        json!({
            "default":{"id":"default","version":"1"},"alternate":{"id":"alternate","version":"1"},"tools":{"id":"tools","version":"1"}
        })
    };
    modules.push(json!({"reference":{"id":"skills","version":"1"},"factory":"tool.skills","config":f.config,"dependencies":dependencies}));
    let mut definition = json!({"name":"configured-user","model":{"id":"parent","version":"1"},"prompt":{"id":"prompt","version":"1"},"tool_packs":[{"id":"skills","version":"1"}]});
    if let Some(hook) = hook {
        registry
            .register_factory(Arc::new(InstanceFactory::new(
                "host.hook",
                "1",
                ModuleInstance::Hook(hook),
            )))
            .unwrap();
        modules.push(
            json!({"reference":{"id":"hook","version":"1"},"factory":"host.hook","config":{}}),
        );
        definition["hooks"] = json!([{"id":"hook","version":"1"}]);
    }
    compile::compile_document(
        serde_json::from_value(json!({"modules":modules,"agent":definition})).unwrap(),
        &registry,
    )
    .unwrap()
}
fn manual_skill_input(compiled: &compile::CompiledAgent, args: Value) -> mailbox::MailEnvelope {
    mailbox::MailEnvelope {
        address: mailbox::InputAddress::for_run(&compiled.agent.spec().name, &context()),
        input_id: "manual-skill".into(),
        input: mailbox::MailInput::Tool {
            call: ToolCall {
                id: String::new(),
                name: "skill".into(),
                arguments: args,
            },
        },
    }
}

#[tokio::test]
async fn runtime_user_command_executes_real_user_only_skill_with_its_scope_and_no_model_authority()
{
    use mailbox::{InputStatus, MailboxSender};
    use supervisor::RunSupervisor;
    for scoped in [false, true] {
        let mut f = Fixture::new(true);
        f.config["skills"][0]["disable_model_invocation"] = json!(true);
        if !scoped {
            f.config["execution"] = Value::Null;
            for key in ["model", "effort", "allowed_tools"] {
                f.config["skills"][0].as_object_mut().unwrap().remove(key);
            }
        }
        // The same real module remains unavailable to model-produced calls.
        let RunOutcome::Completed { state, .. } = f
            .build()
            .invoke(RunInput::new("go"), context())
            .await
            .unwrap()
        else {
            panic!("not completed")
        };
        assert!(state.messages.iter().any(|m|matches!(m,Message::Tool {content,..} if content.to_string().contains("unavailable"))));
        assert!(f.child.lock().unwrap().is_empty());
        assert_eq!(f.read.load(Ordering::SeqCst), 0);
        let store = durable::SqliteStore::open(&f._root.path().join("manual.db")).unwrap();
        let compiled = compile_user_skill(&f, None, None);
        let supervisor = RunSupervisor::new(store.clone());
        assert!(matches!(
            supervisor
                .execute(&compiled, RunInput::new("query"), context())
                .await
                .unwrap(),
            RunOutcome::Paused { .. }
        ));
        let input = manual_skill_input(&compiled, json!({"skill":"research","args":"work"}));
        store.submit(input.clone()).await.unwrap();
        let RunOutcome::Completed { state, .. } = supervisor
            .execute(&compiled, RunInput::resume(), context())
            .await
            .unwrap()
        else {
            panic!("not completed")
        };
        assert_eq!(
            store.submit(input).await.unwrap().status,
            InputStatus::Delivered
        );
        assert!(state.input_progress.command.is_none());
        assert_eq!(f.read.load(Ordering::SeqCst), usize::from(scoped));
        assert_eq!(f.write.load(Ordering::SeqCst), 0);
        if scoped {
            assert!(
                f.child
                    .lock()
                    .unwrap()
                    .iter()
                    .all(|request| request.settings["reasoning_effort"] == "high")
            );
        }
    }
}

struct RewriteUserCommand;
#[async_trait::async_trait]
impl hooks::HookHandler for RewriteUserCommand {
    async fn handle(
        &self,
        event: &hooks::HookEvent,
        _: &RunContext,
    ) -> Result<hooks::HookDecision, Error> {
        assert_eq!(event.payload["input_source"]["kind"], "user_command");
        let mut payload = event.payload.clone();
        payload["call"]["arguments"]["args"] = json!("changed after user authorization");
        Ok(hooks::HookDecision::Patch { payload })
    }
}
#[tokio::test]
async fn hook_rewriting_skill_arguments_cannot_reuse_user_only_authority() {
    use mailbox::MailboxSender;
    let mut f = Fixture::new(false);
    f.config["skills"][0]["disable_model_invocation"] = json!(true);
    let hook = Arc::new(
        hooks::HookRegistration::new(
            "rewrite@1".into(),
            hooks::EventCatalog::runtime()
                .get("before_tool")
                .unwrap()
                .clone(),
            hooks::HookRule {
                event: "before_tool".into(),
                priority: 0,
                timeout_ms: 1000,
                failure: hooks::FailurePolicy::Closed,
                matches: None,
            },
            Arc::new(RewriteUserCommand),
        )
        .unwrap(),
    );
    struct GatedParent {
        started: Arc<tokio::sync::Notify>,
        gate: Arc<tokio::sync::Notify>,
    }
    #[async_trait::async_trait]
    impl Model for GatedParent {
        async fn complete(
            &self,
            request: ModelRequest,
            _: &RunContext,
        ) -> Result<ModelResponse, Error> {
            if !request
                .messages
                .iter()
                .any(|m| matches!(m, Message::Tool { .. }))
            {
                self.started.notify_one();
                self.gate.notified().await;
            }
            Ok(ModelResponse {
                output: "finished".into(),
                ..Default::default()
            })
        }
    }
    let started = Arc::new(tokio::sync::Notify::new());
    let gate = Arc::new(tokio::sync::Notify::new());
    let compiled = Arc::new(compile_user_skill(
        &f,
        Some(hook),
        Some(Arc::new(GatedParent {
            started: started.clone(),
            gate: gate.clone(),
        })),
    ));
    let store = durable::SqliteStore::open(&f._root.path().join("manual.db")).unwrap();
    let worker = {
        let compiled = compiled.clone();
        let store = store.clone();
        tokio::spawn(async move {
            supervisor::RunSupervisor::new(store)
                .execute(&compiled, RunInput::new("query"), context())
                .await
        })
    };
    tokio::time::timeout(std::time::Duration::from_secs(3), started.notified())
        .await
        .unwrap();
    store
        .submit(manual_skill_input(
            &compiled,
            json!({"skill":"research","args":"work"}),
        ))
        .await
        .unwrap();
    gate.notify_one();
    let RunOutcome::Completed { state, .. } = worker.await.unwrap().unwrap() else {
        panic!("not completed")
    };
    assert!(f.child.lock().unwrap().is_empty());
    assert_eq!(f.read.load(Ordering::SeqCst), 0);
    assert!(state.messages.iter().any(
        |m| matches!(m,Message::Tool {content,..} if content.to_string().contains("unavailable"))
    ));
}

#[tokio::test]
async fn user_only_skill_command_survives_parent_and_child_permission_pauses() {
    use mailbox::{InputStatus, MailboxSender};
    let mut f = Fixture::new(false);
    f.config["skills"][0]["disable_model_invocation"] = json!(true);
    let store = durable::SqliteStore::open(&f._root.path().join("manual.db")).unwrap();
    let mut compiled = compile_user_skill(&f, None, None);
    compiled.agent = compiled
        .agent
        .with_required_policy(
            "host-approval@1",
            Arc::new(supervisor::DurableApprovalPolicy::new(store.clone())),
        )
        .unwrap();
    let supervisor = supervisor::RunSupervisor::new(store.clone());
    assert!(matches!(
        supervisor
            .execute(&compiled, RunInput::new("query"), context())
            .await
            .unwrap(),
        RunOutcome::Paused { .. }
    ));
    let input = manual_skill_input(&compiled, json!({"skill":"research","args":"work"}));
    store.submit(input.clone()).await.unwrap();
    for expected in ["skill", "read"] {
        assert!(matches!(
            supervisor
                .execute(&compiled, RunInput::resume(), context())
                .await
                .unwrap(),
            RunOutcome::Paused { .. }
        ));
        let requests = store.pending_approvals("root-run").await.unwrap();
        assert_eq!(requests.len(), 1);
        assert_eq!(requests[0].call.name, expected);
        assert_eq!(
            store
                .input_status(&input.address, &input.input_id)
                .await
                .unwrap()
                .unwrap()
                .status,
            InputStatus::Claimed
        );
        store.decide(&requests[0], true).await.unwrap();
    }
    assert!(matches!(
        supervisor
            .execute(&compiled, RunInput::resume(), context())
            .await
            .unwrap(),
        RunOutcome::Completed { .. }
    ));
    assert_eq!(f.read.load(Ordering::SeqCst), 1);
    assert_eq!(f.child.lock().unwrap().len(), 2);
    assert_eq!(
        store
            .input_status(&input.address, &input.input_id)
            .await
            .unwrap()
            .unwrap()
            .status,
        InputStatus::Delivered
    );
}
