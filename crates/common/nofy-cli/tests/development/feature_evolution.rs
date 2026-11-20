use super::{
    evolution::await_phase,
    omni::{checked, publish_release, run_session_with_input, tool_call},
    *,
};
use nofy_agent_host::evolution::{Phase, Preauthorization, Probe};
use nofy_agent_runtime::{
    control::Activation,
    registry::ModuleRef,
    system::{ProgramDefinition, SystemDocument},
};
use rmcp::{
    ErrorData as McpError, RoleServer, ServerHandler,
    service::RequestContext,
    transport::streamable_http_server::{
        StreamableHttpServerConfig, StreamableHttpService, session::local::LocalSessionManager,
    },
};
use std::collections::{BTreeMap, BTreeSet};

const DESIGN: &str = "Design a support-ticket specialist. Return a complete Nofy system document with its Agent, prompt, Skill and MCP wiring, plus the MCP tool schemas and routing table. Use deployment-model@1 and bound://ticket-mcp for the supplied resources. Inspect the SDK contract first.";
const SPECIALIST: &str = "ticket-triage";
const SPECIALIST_PROMPT: &str = "Load the support-triage Skill and use the ticket routing MCP tool. Report the queue and priority from its result.";
const SKILL_BODY: &str = "Use the ticket's category to look up the queue. Preserve the queue and priority returned by the lookup.";
const TARGET: &str = "Route an account-access ticket.";
const CONTROL: &str = "What is 2 + 2?";
const BASELINE: &str = "queue=general";
const GOAL: &str = "queue=identity";
const IMPROVEMENT: &str = "You are Omni. For account-access tickets, reply exactly queue=identity. Continue to answer ordinary questions as before.";

#[derive(Clone, serde::Deserialize)]
#[serde(deny_unknown_fields)]
struct ToolDesign {
    name: String,
    description: String,
    input_schema: Map,
    output_schema: Map,
    routes: BTreeMap<String, Value>,
    fallback: Value,
}

type Map = serde_json::Map<String, Value>;

#[derive(serde::Deserialize)]
#[serde(deny_unknown_fields)]
struct FeatureDesign {
    document: SystemDocument,
    mcp: ToolDesign,
}

#[derive(Clone)]
struct RoutingServer {
    tool: ToolDesign,
    calls: Arc<AtomicUsize>,
}

impl ServerHandler for RoutingServer {
    fn get_info(&self) -> ServerConfig {
        ServerConfig::new(ServerCapabilities::builder().enable_tools().build())
            .with_protocol_version(ProtocolVersion::V_2025_11_25)
    }

    async fn list_tools(
        &self,
        _: Option<PaginatedRequestParams>,
        _: RequestContext<RoleServer>,
    ) -> Result<ListToolsResult, McpError> {
        Ok(ListToolsResult::with_all_items(vec![
            Tool::new_with_raw(
                self.tool.name.clone(),
                Some(self.tool.description.clone().into()),
                self.tool.input_schema.clone(),
            )
            .with_raw_output_schema(Arc::new(self.tool.output_schema.clone())),
        ]))
    }

    async fn call_tool(
        &self,
        request: CallToolRequestParams,
        _: RequestContext<RoleServer>,
    ) -> Result<CallToolResponse, McpError> {
        if request.name != self.tool.name {
            return Err(McpError::invalid_params("unknown routing tool", None));
        }
        let args = Value::Object(request.arguments.unwrap_or_default());
        if !jsonschema::is_valid(&Value::Object(self.tool.input_schema.clone()), &args) {
            return Err(McpError::invalid_params("invalid ticket category", None));
        }
        let category = args["category"]
            .as_str()
            .ok_or_else(|| McpError::invalid_params("category must be a string", None))?;
        let result = self
            .tool
            .routes
            .get(category)
            .unwrap_or(&self.tool.fallback);
        self.calls.fetch_add(1, Ordering::SeqCst);
        Ok(CallToolResult::structured(result.clone()).into())
    }
}

fn feature_design() -> Value {
    let r = |id: &str| json!({"id":id,"version":"1"});
    json!({
        "document": {
            "schema_version": 1, "name": SPECIALIST,
            "modules": [
                {"reference":r("feature-prompt"),"factory":"prompt.static","config":{"text":SPECIALIST_PROMPT}},
                {"reference":r("feature-skill"),"factory":"tool.skills","config":{"skills":[{
                    "name":"support-triage","description":"Route tickets by category",
                    "path":"skills/support-triage/SKILL.md","body":SKILL_BODY
                }]}},
                {"reference":r("mcp-endpoint"),"factory":"resource.mcp_http","config":{"endpoint":"bound://ticket-mcp"}},
                {"reference":r("mcp-tools"),"factory":"tool_source.mcp","config":{"namespace":"ticket","allowed_tools":["lookup_queue"]},"dependencies":{"connection":r("mcp-endpoint")}}
            ],
            "programs":{"main":{"kind":"agent","definition":{
                "name":SPECIALIST,"model":r("deployment-model"),"prompt":r("feature-prompt"),
                "tool_packs":[r("feature-skill")],"tool_sources":[r("mcp-tools")],
                "settings":{"max_steps":4,"model":{"stream":true}}
            }}}
        },
        "mcp": {
            "name": "lookup_queue",
            "description": "Resolve a support queue and priority for a category",
            "input_schema": {
                "type": "object", "additionalProperties": false,
                "required": ["category"], "properties": {"category": {"type": "string"}}
            },
            "output_schema": {
                "type": "object", "additionalProperties": false,
                "required": ["queue", "priority"], "properties": {"queue": {"type": "string"}, "priority": {"type": "string"}}
            },
            "routes": {
                "access": {"queue": "identity", "priority": "high"},
                "billing": {"queue": "finance", "priority": "normal"}
            },
            "fallback": {"queue": "general", "priority": "normal"}
        }
    })
}

fn model_frames(body: Value) -> Vec<axum::response::sse::Event> {
    let messages = body["messages"].as_array().unwrap();
    let input = messages.iter().find(|item| item["role"] == "user").unwrap()["content"]
        .as_str()
        .unwrap();
    let last = messages.last().unwrap();
    let prompt = messages
        .iter()
        .find(|item| item["role"] == "system")
        .unwrap()["content"]
        .as_str()
        .unwrap();
    let answer = if prompt == SPECIALIST_PROMPT {
        let category = input.strip_prefix("Triage category: ").unwrap();
        match last["tool_call_id"].as_str() {
            Some("load-triage") => {
                assert!(last["content"].as_str().unwrap().contains(SKILL_BODY));
                return tool_call(
                    "lookup",
                    "ticket_lookup_queue",
                    json!({"category": category}),
                );
            }
            Some("lookup") => {
                let text = last["content"].as_str().unwrap();
                let routing: Value = serde_json::from_str(text.lines().next().unwrap()).unwrap();
                assert!(routing.is_object(), "{routing}");
                routing.to_string()
            }
            _ => {
                let tools = body["tools"].as_array().unwrap();
                assert_eq!(tools.len(), 2);
                assert!(
                    tools
                        .iter()
                        .any(|tool| tool["function"]["name"] == "ticket_lookup_queue")
                );
                return tool_call("load-triage", "skill", json!({"skill": "support-triage"}));
            }
        }
    } else if input == DESIGN {
        if last["tool_call_id"] != "read-build-contract" {
            return tool_call(
                "read-build-contract",
                "sdk_schema",
                json!({"operation": "system.validate"}),
            );
        }
        assert!(
            last["content"]
                .as_str()
                .unwrap()
                .contains("system.validate")
        );
        feature_design().to_string()
    } else if input.starts_with("Evolve ticket routing using verified specialist evidence: ") {
        assert!(
            input.contains(SPECIALIST) && input.contains("identity") && input.contains("finance")
        );
        if last["tool_call_id"] != "propose-improvement" {
            return tool_call(
                "propose-improvement",
                "sdk_propose_prompt",
                json!({"prompt": IMPROVEMENT}),
            );
        }
        "submitted".into()
    } else {
        match input {
            TARGET if prompt == IMPROVEMENT => GOAL,
            TARGET => BASELINE,
            CONTROL => "4",
            other => panic!("unexpected input {other}"),
        }
        .into()
    };
    nofy_test_support::sse::chat_completion_events_exact(&answer, "test-model")
}

async fn session(sdk: &Engine, system: &str, release: &str, id: &str, text: &str) -> String {
    run_session_with_input(sdk, system, release, id, text).await["execution"]["outcome"]["Completed"]
        ["output"]
        .as_str()
        .unwrap()
        .to_owned()
}

async fn install_specialist(
    sdk: &Engine,
    kernel: &KernelHost,
    baseline: &str,
    design: &FeatureDesign,
    endpoint: &str,
) -> String {
    let base = kernel.control().export(baseline).await.unwrap();
    let ProgramDefinition::Agent { definition } = &base.document.programs["main"] else {
        panic!("expected an Omni Agent");
    };
    let mut document = design.document.clone();
    let ProgramDefinition::Agent {
        definition: authored,
    } = document.programs.get_mut("main").unwrap()
    else {
        panic!("expected an authored Agent");
    };
    assert_eq!(authored.model, ModuleRef::new("deployment-model", "1"));
    authored.model = definition.model.clone();
    let connection = document
        .modules
        .iter_mut()
        .find(|module| module.factory == "resource.mcp_http")
        .unwrap();
    assert_eq!(connection.config["endpoint"], "bound://ticket-mcp");
    connection.config["endpoint"] = json!(endpoint);
    let mut seen = BTreeSet::new();
    let mut pending = vec![&definition.model];
    while let Some(reference) = pending.pop() {
        if !seen.insert(reference) {
            continue;
        }
        let module = base
            .document
            .modules
            .iter()
            .find(|module| &module.reference == reference)
            .unwrap();
        pending.extend(module.dependencies.values());
        document.modules.push(module.clone());
    }
    let validated = checked(
        sdk,
        "system.validate",
        json!({"document_json": serde_json::to_string(&document).unwrap()}),
    )
    .await;
    let published = checked(
        sdk,
        "system.publish",
        json!({"document_json": validated.data["native_json"]}),
    )
    .await;
    assert_eq!(published.refs["release"], validated.refs["release"]);
    published.refs["release"].clone().unwrap()
}

#[tokio::test(flavor = "multi_thread", worker_threads = 3)]
async fn omni_designs_a_specialist_with_skill_and_mcp_then_evolves_toward_a_goal() {
    let provider = serve(axum::Router::new().route(
        "/v1/chat/completions",
        axum::routing::post(|axum::Json(body): axum::Json<Value>| async move {
            axum::response::Sse::new(futures::stream::iter(
                model_frames(body)
                    .into_iter()
                    .map(Ok::<_, std::convert::Infallible>),
            ))
        }),
    ))
    .await;
    let directory = tempfile::tempdir().unwrap();
    let kernel = host(directory.path()).await;
    let server = serve(kernel.router()).await;
    let sdk = engine(&server.url, ADMIN);
    let template = checked(&sdk, "project.template", json!({})).await;
    let source: Source = serde_json::from_value(template.data["source"].clone()).unwrap();
    let configured = checked(&sdk, "agent.configure", json!({"agent":"main","target":{"kind":"source","source":source,"expected_digest":source.digest().unwrap()},
        "settings":{"connection":{"base_url":format!("{}/v1/",provider.url),"models":["test-model"],"allow_insecure_http":true},
            "model":"test-model","model_settings":{"stream":true},"evolution_enabled":true}})).await;
    let release = publish_release(&sdk, &configured.data["source"]).await;
    let activation = checked(&sdk, "system.apply", json!({"system":"omni","release":release,"expected_generation":null,"command_id":"activate-feature-baseline"})).await;
    let generation = activation.refs["generation"]
        .as_deref()
        .unwrap()
        .parse()
        .unwrap();
    let kernel = kernel
        .with_evolution(Preauthorization {
            system: "omni".into(),
            baseline: Activation {
                release: release.clone(),
                generation,
            },
            evaluation: vec![Probe {
                input: TARGET.into(),
                expected: GOAL.into(),
                baseline_expected: Some(BASELINE.into()),
            }],
            observation: vec![Probe {
                input: CONTROL.into(),
                expected: "4".into(),
                baseline_expected: None,
            }],
        })
        .unwrap();
    let stop = tokio_util::sync::CancellationToken::new();
    let worker = tokio::spawn({
        let stop = stop.clone();
        let kernel = kernel.clone();
        async move { kernel.run_worker(stop, 3).await.unwrap() }
    });

    let authored = session(&sdk, "omni", &release, "author-ticket-agent", DESIGN).await;
    let design: FeatureDesign = serde_json::from_str(&authored).unwrap();
    assert_eq!(design.document.name, SPECIALIST);
    let calls = Arc::new(AtomicUsize::new(0));
    let backend = RoutingServer {
        tool: design.mcp.clone(),
        calls: calls.clone(),
    };
    let protocol = StreamableHttpService::new(
        move || Ok(backend.clone()),
        Arc::new(LocalSessionManager::default()),
        StreamableHttpServerConfig::default().with_legacy_session_mode(false),
    );
    let mcp = serve(axum::Router::new().nest_service("/mcp", protocol)).await;
    let specialist = install_specialist(
        &sdk,
        &kernel,
        &release,
        &design,
        &format!("{}/mcp", mcp.url),
    )
    .await;
    let mut evidence = BTreeMap::new();
    for (category, queue, priority) in [
        ("access", "identity", "high"),
        ("billing", "finance", "normal"),
        ("other", "general", "normal"),
    ] {
        let id = format!("ticket-{category}");
        let answer = session(
            &sdk,
            &design.document.name,
            &specialist,
            &id,
            &format!("Triage category: {category}"),
        )
        .await;
        let result: Value = serde_json::from_str(&answer).unwrap();
        assert_eq!(result, json!({"queue":queue,"priority":priority}));
        evidence.insert(id, result);
    }
    assert_eq!(calls.load(Ordering::SeqCst), 3);

    let goal = format!(
        "Evolve ticket routing using verified specialist evidence: {}",
        json!({"system":design.document.name,"release":specialist,"results":evidence,"goal":GOAL})
    );
    assert_eq!(
        session(&sdk, "omni", &release, "evolve-ticket-routing", &goal).await,
        "submitted"
    );
    let accepted = await_phase(&kernel, Phase::Accepted).await;
    assert_eq!(accepted.evidence.len(), 4);
    assert!(accepted.evidence.iter().all(|case| case.matched));
    assert_ne!(
        accepted.evidence[0].output_digest,
        accepted.evidence[2].output_digest
    );
    assert_eq!(
        accepted.evidence[1].output_digest,
        accepted.evidence[3].output_digest
    );
    let active = checked(&sdk, "system.active", json!({"system":"omni"})).await;
    let activated = accepted.activation.unwrap().active;
    assert_eq!(activated.generation, generation + 1);
    assert_eq!(
        active.refs["release"].as_deref(),
        Some(activated.release.as_str())
    );
    assert_eq!(
        session(
            &sdk,
            "omni",
            &activated.release,
            "improved-ticket-routing",
            TARGET
        )
        .await,
        GOAL
    );

    stop.cancel();
    worker.await.unwrap();
}

#[path = "feature_evolution_live.rs"]
mod live;
