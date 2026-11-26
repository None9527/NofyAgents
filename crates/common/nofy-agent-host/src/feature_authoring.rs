//! In-process SDK for an operator-scoped Agent release.
mod extensions;
mod http;
mod tool;
pub use extensions::FeatureExtensions;
pub use http::FeatureHttpAuthorization;
pub(crate) use tool::Factory;

use crate::{HostError, KernelHost, Result};
use nofy_agent_runtime::{
    PendingInterjection, RunOutcome,
    control::{Activation, ApplyCommand, ControlPlane},
    events::RunEvent,
    registry::ModuleRef,
    supervisor::{RunSupervisor, jobs::ManagedRunRequest},
    system::{CompiledSystem, ProgramDefinition, SystemDocument, content_digest},
};
use serde::Deserialize;
use serde_json::{Value, json};
use std::{
    collections::BTreeSet,
    sync::{Arc, OnceLock},
    time::Duration,
};

#[derive(Clone, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct FeatureCase {
    pub input: String,
    pub expected: String,
}

#[derive(Clone, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct FeatureAuthorization {
    pub author_system: String,
    pub baseline: Activation,
    pub system: String,
    pub mcp_endpoint: String,
    pub mcp_tool: String,
    pub cases: Vec<FeatureCase>,
    #[serde(default)]
    pub extensions: Option<FeatureExtensions>,
    #[serde(default)]
    pub http: Option<FeatureHttpAuthorization>,
}

#[derive(Default)]
pub(crate) struct Authoring(OnceLock<Grant>);

struct Grant {
    auth: FeatureAuthorization,
    control: ControlPlane,
    supervisor: Arc<RunSupervisor>,
    store: nofy_agent_runtime::durable::SqliteStore,
    wake: Arc<tokio::sync::Notify>,
    registry: Arc<nofy_agent_runtime::registry::ModuleRegistry>,
    draft: String,
}

impl KernelHost {
    pub fn with_feature_authoring(self, auth: FeatureAuthorization) -> Result<Self> {
        let endpoint = url::Url::parse(&auth.mcp_endpoint)
            .map_err(|_| HostError::Invalid("invalid feature MCP endpoint".into()))?;
        if !valid_name(&auth.system)
            || auth.system == auth.author_system
            || !valid_name(&auth.mcp_tool)
            || endpoint.scheme() != "http"
            || endpoint.host_str() != Some("127.0.0.1")
            || endpoint.port().is_none()
            || endpoint.query().is_some()
            || endpoint.fragment().is_some()
            || !endpoint.username().is_empty()
            || endpoint.password().is_some()
            || !(1..=4).contains(&auth.cases.len())
            || auth
                .extensions
                .as_ref()
                .is_some_and(|extension| !extension.valid())
            || auth.http.as_ref().is_some_and(|http| !http.valid())
            || (auth.http.is_some() && auth.extensions.is_some())
            || auth.cases.iter().any(|case| {
                case.input.trim().is_empty()
                    || case.input.len() > 4096
                    || case.expected.trim().is_empty()
                    || case.expected.len() > 4096
            })
        {
            return Err(HostError::Invalid("invalid scoped feature grant".into()));
        }
        self.feature_authoring
            .0
            .set(Grant {
                draft: format!(
                    "omni-feature-{}",
                    content_digest(&(&auth.system, &auth.baseline))?
                ),
                auth,
                control: self.control.clone(),
                supervisor: self.supervisor.clone(),
                store: self.store.clone(),
                wake: self.wake.clone(),
                registry: self.registry.clone(),
            })
            .map_err(|_| HostError::Invalid("feature grant is already configured".into()))?;
        Ok(self)
    }
}

fn valid_name(value: &str) -> bool {
    !value.is_empty()
        && value.len() <= 64
        && value
            .bytes()
            .all(|b| b.is_ascii_alphanumeric() || matches!(b, b'_' | b'-'))
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Design {
    prompt: String,
    skill_name: String,
    skill_description: String,
    skill_body: String,
    tool_name: String,
    tool_description: String,
    tool_input_schema: Value,
    tool_source: String,
    hook_source: String,
    mcp_tool: String,
    #[serde(default)]
    extensions: Option<extensions::Design>,
    #[serde(default)]
    http: Option<http::Design>,
}

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Revision {
    revision: u64,
}

impl Grant {
    async fn authorize(&self, run_id: &str) -> Result<()> {
        let run = self
            .store
            .managed_run(run_id)
            .await?
            .ok_or(HostError::Forbidden)?;
        let current = self
            .control
            .inspect()
            .await?
            .and_then(|view| view.data.active.get(&self.auth.author_system).cloned());
        if run.request.system != self.auth.author_system
            || run.request.release != self.auth.baseline.release
            || run.request.program != "main"
            || current.as_ref() != Some(&self.auth.baseline)
        {
            return Err(HostError::Forbidden);
        }
        Ok(())
    }

    async fn design(&self, design: Design) -> Result<Value> {
        if !valid_name(&design.skill_name)
            || !valid_name(&design.tool_name)
            || design.tool_name == "skill"
            || design.tool_name.starts_with("facts_")
            || design.mcp_tool != self.auth.mcp_tool
            || !design.tool_input_schema.is_object()
            || serde_json::to_vec(&design.tool_input_schema).map_or(true, |v| v.len() > 4096)
            || [
                &design.prompt,
                &design.skill_description,
                &design.skill_body,
                &design.tool_description,
                &design.tool_source,
                &design.hook_source,
            ]
            .into_iter()
            .any(|s| s.trim().is_empty() || s.len() > 4096)
        {
            return Err(HostError::Invalid(
                "invalid design or MCP tool outside grant".into(),
            ));
        }
        let base = self.control.export(&self.auth.baseline.release).await?;
        let Some(ProgramDefinition::Agent { definition }) = base.document.programs.get("main")
        else {
            return Err(HostError::Invalid("feature author must be an Agent".into()));
        };
        let mut seen = BTreeSet::new();
        let mut pending = vec![&definition.model];
        let mut modules = Vec::new();
        while let Some(reference) = pending.pop() {
            if !seen.insert(reference) {
                continue;
            }
            let module = base
                .document
                .modules
                .iter()
                .find(|m| &m.reference == reference)
                .ok_or_else(|| HostError::Invalid("missing inherited model module".into()))?;
            modules.push(json!(module));
            pending.extend(module.dependencies.values());
        }
        let r = |name: &str| ModuleRef::new(format!("feature-{name}"), "1");
        let mut packs = vec![r("skill"), r("tool")];
        let mut contexts = vec![r("skill-context")];
        let mut policies = vec![];
        let mut sources = vec![r("mcp-source")];
        let mut tool_names = vec![
            "skill".to_owned(),
            design.tool_name.clone(),
            format!("facts_{}", design.mcp_tool),
        ];
        match (&self.auth.http, &design.http) {
            (Some(grant), Some(http))
                if !tool_names.contains(&http.tool_name)
                    && !tool_names.contains(&grant.discovered_tool)
                    && http.tool_name != grant.discovered_tool =>
            {
                modules.extend(http.modules(grant, &r)?);
                packs.push(r("http-tool"));
                sources.push(r("http-source"));
                tool_names.extend([http.tool_name.clone(), grant.discovered_tool.clone()]);
            }
            (None, None) => {}
            _ => {
                return Err(HostError::Invalid(
                    "draft must match the granted HTTP profile".into(),
                ));
            }
        }
        match (&self.auth.extensions, &design.extensions) {
            (Some(grant), Some(extension)) => {
                modules.extend(extension.modules(grant, &design.tool_name, &r)?);
                packs.extend([r("workflow-tool"), r("memory-tools")]);
                contexts.push(r("memory-context"));
                policies.push(r("policy"));
                tool_names.extend(["feature_workflow".into(), "memory".into()]);
            }
            (None, None) => {}
            _ => {
                return Err(HostError::Invalid(
                    "extensions must be present exactly when workflow_memory_policy is granted"
                        .into(),
                ));
            }
        }
        let skills = json!({"skills":[{"name":design.skill_name,
            "description":design.skill_description,"path":"feature/SKILL.md","body":design.skill_body}]});
        let prompt = match &design.http {
            Some(http) => {
                let origin = json!({"kind":"authored","reference":self.auth.system,"version":"1"});
                json!({"reference":r("prompt"),"factory":"prompt.document","config":{
                    "fragments":[{"id":"specialist","content":{"kind":"literal","text":design.prompt},"source":origin},
                        {"id":"http-tool","content":{"kind":"template","text":"The granted direct HTTP tool is {{ direct_tool }}."},"source":origin}],
                    "variable_schema":{"type":"object","additionalProperties":false,"required":["direct_tool"],"properties":{"direct_tool":{"type":"string"}}},
                    "values":{"direct_tool":http.tool_name}}})
            }
            None => {
                json!({"reference":r("prompt"),"factory":"prompt.static","config":{"text":design.prompt}})
            }
        };
        modules.extend([
            prompt,
            json!({"reference":r("skill"),"factory":"tool.skills","config":skills}),
            json!({"reference":r("skill-context"),"factory":"context.skills","config":skills}),
            json!({"reference":r("tool"),"factory":"tool.rhai","config":{"contract":{"name":design.tool_name,
                "description":design.tool_description,"effect":"read_only","input_schema":design.tool_input_schema},
                "source":design.tool_source,"max_operations":20000}}),
            json!({"reference":r("hook-code"),"factory":"tool.rhai","config":{"contract":{"name":"feature_hook","effect":"read_only"},
                "source":design.hook_source,"max_operations":20000}}),
            json!({"reference":r("hook-handler"),"factory":"hook.executor","config":{"tool":"feature_hook"},
                "dependencies":{"executor":r("hook-code")}}),
            json!({"reference":r("hook"),"factory":"hook.subscription","config":{"event":"before_model","failure":"closed"},
                "dependencies":{"handler":r("hook-handler")}}),
            json!({"reference":r("mcp-endpoint"),"factory":"resource.mcp_http","config":{"endpoint":self.auth.mcp_endpoint}}),
            json!({"reference":r("mcp-source"),"factory":"tool_source.mcp","config":{"namespace":"facts","allowed_tools":[design.mcp_tool]},
                "dependencies":{"connection":r("mcp-endpoint")}}),
        ]);
        let document: SystemDocument = serde_json::from_value(json!({"schema_version":1,"name":self.auth.system,"modules":modules,
            "programs":{"main":{"kind":"agent","definition":{"name":self.auth.system,"model":definition.model,"prompt":r("prompt"),
                "tool_packs":packs,"context_sources":contexts,"policies":policies,"hooks":[r("hook")],"tool_sources":sources,
                "settings":{"max_steps":if design.extensions.is_some() || design.http.is_some() {14} else {7},"model":{"stream":true,"max_output_tokens":512}}}}}}))
            .map_err(|error| HostError::Invalid(error.to_string()))?;
        let compiled = self.control.prepare_async(document.clone()).await?;
        let view = self.control.inspect().await?;
        if view
            .as_ref()
            .is_some_and(|v| v.data.active.contains_key(&self.auth.system))
        {
            return Err(HostError::Invalid("feature is already active".into()));
        }
        let prior = view.as_ref().and_then(|v| v.data.drafts.get(&self.draft));
        let revision = match prior {
            Some(draft) if content_digest(&draft.document)? == content_digest(&document)? => {
                draft.revision
            }
            _ => {
                self.control
                    .save_draft(&self.draft, prior.map(|d| d.revision), document)
                    .await?
                    .revision
            }
        };
        Ok(
            json!({"revision":revision,"candidate":compiled.bundle.digest,"cases":self.auth.cases.len(),"skill_name":design.skill_name,
            "tool_names":tool_names}),
        )
    }

    async fn candidate(&self, revision: u64) -> Result<CompiledSystem> {
        let draft = self
            .control
            .inspect()
            .await?
            .and_then(|view| view.data.drafts.get(&self.draft).cloned())
            .filter(|draft| draft.revision == revision)
            .ok_or(HostError::NotFound)?;
        Ok(self.control.prepare_async(draft.document).await?)
    }

    fn check_id(&self, candidate: &CompiledSystem, revision: u64, index: usize) -> Result<String> {
        let case = &self.auth.cases[index];
        Ok(format!(
            "feature-check-{}",
            content_digest(&(
                &candidate.bundle.digest,
                revision,
                index,
                &case.input,
                &case.expected
            ))?
        ))
    }

    async fn evidence(
        &self,
        candidate: &CompiledSystem,
        revision: u64,
        index: usize,
    ) -> Result<Value> {
        let id = self.check_id(candidate, revision, index)?;
        let case = &self.auth.cases[index];
        let record = self.store.execution_record(&id).await?;
        let Some(RunOutcome::Completed { output, .. }) =
            record.as_ref().and_then(|r| r.outcome.as_ref())
        else {
            return Ok(
                json!({"run":id,"matched":false,"status":record.as_ref().map(|r| &r.status),
                "error":record.as_ref().and_then(|r| r.error.as_ref())}),
            );
        };
        let local = candidate
            .bundle
            .document
            .modules
            .iter()
            .find(|m| m.reference.id == "feature-tool")
            .and_then(|m| m.config.pointer("/contract/name"))
            .and_then(Value::as_str)
            .ok_or_else(|| HostError::Invalid("feature tool missing".into()))?;
        let mut cursor = 0;
        let mut calls = std::collections::BTreeMap::new();
        let mut passed = BTreeSet::new();
        let mut hook = false;
        let mut workflow = false;
        let mut memory = BTreeSet::new();
        let mut stored = None;
        let mut recalled = false;
        let mut approval = None;
        let mut resumed = false;
        let mut failures = Vec::new();
        for _ in 0..5 {
            let events = self.store.events(&id, cursor, 1000).await?;
            for event in &events {
                cursor = event.cursor;
                match &event.event {
                    RunEvent::ToolStarted { call } => {
                        calls.insert(call.id.clone(), call.clone());
                    }
                    RunEvent::ToolCompleted {
                        call_id,
                        is_error: false,
                        result,
                    } => {
                        if let Some(call) = calls.get(call_id) {
                            passed.insert(call.name.clone());
                            if call.name == "memory"
                                && let Some(operation) = call.arguments["operation"].as_str()
                            {
                                memory.insert(operation.to_owned());
                                if let Some(extension) = &self.auth.extensions {
                                    let value = &result["value"];
                                    if operation == "remember"
                                        && Some(call_id) == approval.as_ref()
                                        && value["summary"] == extension.approved_note
                                    {
                                        stored = value
                                            .pointer("/target/id")
                                            .and_then(Value::as_str)
                                            .map(str::to_owned);
                                    }
                                    if operation == "list" {
                                        recalled |= stored.as_ref().is_some_and(|id| {
                                            value["items"].as_array().is_some_and(|items| {
                                                items.iter().any(|item| {
                                                    item["summary"] == extension.approved_note
                                                        && item["target"]["id"] == *id
                                                })
                                            })
                                        });
                                    }
                                }
                            }
                        }
                    }
                    RunEvent::ToolCompleted {
                        call_id,
                        result,
                        is_error: true,
                    } if failures.len() < 8 => {
                        if let Some(call) = calls.get(call_id) {
                            failures.push(json!({"tool":call.name,"arguments":call.arguments,"error":result["error"]}));
                        }
                    }
                    RunEvent::Hook {
                        event_name, status, ..
                    } if event_name == "before_model" && status == "completed" => hook = true,
                    RunEvent::Workflow {
                        node_id: Some(_), ..
                    } => workflow = true,
                    RunEvent::Terminated {
                        status: nofy_agent_runtime::events::RunStatus::Paused,
                        reason: Some(reason),
                    } if event.scope.run_id == id && reason["kind"] == "approval" => {
                        if let Ok(request) = serde_json::from_value(reason["request"].clone())
                            && self
                                .auth
                                .extensions
                                .as_ref()
                                .is_some_and(|extension| extension.authorizes(&request))
                        {
                            approval = Some(request.call.id);
                        }
                    }
                    RunEvent::RunStarted { resume: true } if event.scope.run_id == id => {
                        resumed = true
                    }
                    _ => {}
                }
            }
            if events.len() < 1000 {
                break;
            }
        }
        let mcp = format!("facts_{}", self.auth.mcp_tool);
        let extended_ok = self.auth.extensions.is_none()
            || (workflow
                && approval.is_some()
                && resumed
                && recalled
                && passed.contains("feature_workflow"));
        let http_executed = self.auth.http.as_ref().map(|grant| {
            candidate
                .bundle
                .document
                .modules
                .iter()
                .find(|m| m.reference.id == "feature-http-tool")
                .and_then(|m| m.config.pointer("/contract/name"))
                .and_then(Value::as_str)
                .is_some_and(|name| {
                    passed.contains(name) && passed.contains(&grant.discovered_tool)
                })
        });
        let matched = output.trim() == case.expected
            && hook
            && passed.contains("skill")
            && passed.contains(local)
            && passed.contains(&mcp)
            && extended_ok
            && http_executed.unwrap_or(true);
        Ok(
            json!({"run":id,"matched":matched,"output":output,"tools":passed,"hook_completed":hook,
            "workflow_node_seen":workflow,"memory_operations":memory,"memory_note_recalled":recalled,
            "approval_paused":approval.is_some(),"approval_resumed":resumed,"http_executed":http_executed,"tool_failures":failures}),
        )
    }

    async fn verify(&self, revision: u64) -> Result<Value> {
        let candidate = self.candidate(revision).await?;
        let mut cases = Vec::new();
        for (index, case) in self.auth.cases.iter().enumerate() {
            let run_id = self.check_id(&candidate, revision, index)?;
            self.supervisor
                .submit_managed(
                    ManagedRunRequest {
                        approval_mode: None,
                        thread_id: run_id.clone(),
                        run_id: run_id.clone(),
                        system: self.auth.system.clone(),
                        release: candidate.bundle.digest.clone(),
                        program: "main".into(),
                        input: Some(PendingInterjection {
                            text: case.input.clone(),
                            attachments: vec![],
                        }),
                        parameters: None,
                    },
                    &candidate,
                )
                .await?;
            self.wake.notify_one();
            let run = async {
                loop {
                    let record = self.store.execution_record(&run_id).await?;
                    if record.as_ref().is_some_and(|r| r.status == "paused")
                        && let Some(extension) = &self.auth.extensions
                    {
                        let approvals = self.store.pending_approvals(&run_id).await?;
                        if approvals.is_empty() {
                            return Ok::<_, HostError>(());
                        }
                        for request in approvals {
                            let allow = extension.authorizes(&request);
                            self.store
                                .decide_scoped_and_continue(
                                    &run_id,
                                    &request,
                                    allow,
                                    nofy_agent_runtime::supervisor::ApprovalScope::Once,
                                )
                                .await?;
                        }
                        self.wake.notify_one();
                        // Wait for the persisted continuation to leave its original pause.
                        loop {
                            if self
                                .store
                                .execution_record(&run_id)
                                .await?
                                .is_none_or(|r| r.status != "paused")
                            {
                                break;
                            }
                            tokio::time::sleep(Duration::from_millis(60)).await;
                        }
                        continue;
                    }
                    if record.is_some_and(|r| r.status != "running") {
                        return Ok::<_, HostError>(());
                    }
                    tokio::time::sleep(Duration::from_millis(120)).await;
                }
            };
            tokio::time::timeout(Duration::from_secs(120), run)
                .await
                .map_err(|_| HostError::Unavailable("feature check still running".into()))??;
            cases.push(self.evidence(&candidate, revision, index).await?);
        }
        Ok(
            json!({"revision":revision,"passed":cases.iter().all(|case| case["matched"]==true),"cases":cases}),
        )
    }

    async fn publish(&self, revision: u64) -> Result<Value> {
        let candidate = self.candidate(revision).await?;
        for index in 0..self.auth.cases.len() {
            if self.evidence(&candidate, revision, index).await?["matched"] != true {
                return Err(HostError::Invalid(
                    "finish verification on this revision before publishing".into(),
                ));
            }
        }
        let publication = self.control.publish(&self.draft, revision).await?;
        let release = publication.bundle.digest;
        if release != candidate.bundle.digest {
            return Err(HostError::Unavailable(
                "verified feature identity changed".into(),
            ));
        }
        let activated = self
            .control
            .apply(ApplyCommand {
                system: self.auth.system.clone(),
                command_id: format!("feature-{release}"),
                expected_generation: None,
                release,
            })
            .await?;
        Ok(
            json!({"system":self.auth.system,"release":activated.active.release,"generation":activated.active.generation}),
        )
    }
}
