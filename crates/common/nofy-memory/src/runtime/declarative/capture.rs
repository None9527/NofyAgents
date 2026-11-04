//! The ordinary turn Hook owns capture from its durable barrier through model
//! receipts and canonical writes. No independent sampler or worker is spawned.
use super::*;
use crate::capture::{CaptureQueue, EnqueueOutcome, ObservationDraft};
use nofy_agent_runtime::{
    Message, Model, ModelRequest, governance,
    hooks::{HookDecision, HookEvent, HookHandler},
    memory::DurableTurnReceipt,
    model_journal,
    system::content_digest,
};

pub struct ConnectedCaptureFactory;

#[derive(Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Config {
    instructions: String,
    write: Vec<MemoryArea>,
    #[serde(default = "settings")]
    settings: Value,
    #[serde(default = "max_items")]
    max_items: usize,
    #[serde(default)]
    consolidate: bool,
}
fn settings() -> Value {
    json!({})
}
fn max_items() -> usize {
    20
}
impl Config {
    fn module(&self) -> MemoryModuleConfig {
        MemoryModuleConfig {
            read: vec![],
            write: self.write.clone(),
            capture: true,
            consolidate: self.consolidate,
            operations: vec!["capture".into()],
            max_items: self.max_items,
            ..Default::default()
        }
    }
}
impl ModuleFactory for ConnectedCaptureFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        ModuleDescriptor {
            factory: "hook.memory_capture_connected".into(),
            revision: "1".into(),
            kind: ModuleKind::HookHandler,
            config_schema: json!({
                "type":"object","additionalProperties":false,
                "required":["instructions","write"],
                "properties":{
                    "instructions":{"type":"string","minLength":1,"maxLength":65536},
                    "write":{"type":"array","minItems":1,"maxItems":2,"uniqueItems":true,"items":{"enum":["personal","project"]}},
                    "settings":{"type":"object"},
                    "max_items":{"type":"integer","minimum":1,"maximum":20},
                    "consolidate":{"type":"boolean"}
                }
            }),
            input_schema: None,
            output_schema: None,
            dependencies: BTreeMap::from([
                ("connection".into(), ModuleKind::Resource),
                ("model".into(), ModuleKind::Model),
            ]),
            required_capabilities: Default::default(),
        }
    }
    fn build(
        &self,
        value: &Value,
        dependencies: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        nofy_agent_runtime::settings::validate_json_value(&self.descriptor().config_schema, value)?;
        if serde_json::to_vec(value)
            .map_err(|_| composition("invalid capture config"))?
            .len()
            > 65536
        {
            return Err(composition("capture config exceeds 64 KiB"));
        }
        let config: Config = serde_json::from_value(value.clone())
            .map_err(|_| composition("invalid capture config"))?;
        let Some(ModuleInstance::Resource(handle)) = dependencies.get("connection") else {
            return Err(composition("capture memory connection required"));
        };
        let resource = handle
            .get::<Connection>()
            .ok_or_else(|| composition("capture connection has another type"))?;
        validate_module(&resource.config.grants, &config.module())?;
        let Some(ModuleInstance::Model(model)) = dependencies.get("model") else {
            return Err(composition("capture model dependency required"));
        };
        model.validate_settings(&config.settings)?;
        let identity = content_digest(&("memory-capture/v1", &resource.identity, &config))?;
        Ok(ModuleInstance::HookHandler(Arc::new(Capture {
            resource,
            config,
            model: model.clone(),
            identity,
        })))
    }
}
struct Capture {
    resource: Arc<Connection>,
    config: Config,
    model: Arc<dyn Model>,
    identity: String,
}
struct Prepared {
    job: String,
    transcript: Option<String>,
    project: crate::model::ProjectId,
}
fn capture_error(error: impl std::fmt::Display) -> Error {
    Error::Tool(format!("memory capture failed: {error}"))
}
fn pending(error: Error) -> Error {
    match error {
        error @ (Error::Cancelled
        | Error::Checkpoint(_)
        | Error::GovernancePaused(_)
        | Error::BudgetExceeded) => error,
        error => Error::GovernancePaused(
            json!({"kind":"memory_capture_pending","message":error.to_string()}),
        ),
    }
}
impl Capture {
    async fn prepare(&self, context: &RunContext) -> Result<Option<Prepared>, Error> {
        let run = context.clone();
        let binding = self.resource.identity.clone();
        self.resource
            .run(self.config.module(), context, move |module| async move {
                let Some(turn) = module.durable_turn(&run, None)? else {
                    return Ok(None);
                };
                let root = module
                    .resource
                    .service
                    .runtime_capture_root()
                    .ok_or_else(|| composition("automatic memory learning is disabled"))?;
                let excluded = module.resource.excluded_categories.clone();
                let project = module.resource.service.runtime_project_id();
                tokio::task::spawn_blocking(move || {
                    let queue = CaptureQueue::open(root, excluded).map_err(capture_error)?;
                    let job = match queue
                        .enqueue_scoped(&binding, &turn, chrono::Utc::now().timestamp())
                        .map_err(capture_error)?
                    {
                        EnqueueOutcome::Queued { job_id }
                        | EnqueueOutcome::Duplicate { job_id } => job_id,
                        EnqueueOutcome::Ineligible | EnqueueOutcome::ExcludedSensitive => {
                            return Ok(None);
                        }
                    };
                    let done =
                        queue.state(&job).map_err(capture_error)?.as_deref() == Some("succeeded");
                    Ok(Some(Prepared {
                        job,
                        transcript: (!done).then_some(turn.transcript),
                        project,
                    }))
                })
                .await
                .map_err(capture_error)?
            })
            .await
    }
    async fn commit(
        &self,
        job: String,
        output: Option<String>,
        worker: String,
        context: &RunContext,
    ) -> Result<(), Error> {
        let config = self.config.clone();
        self.resource
            .run(config.module(), context, move |module| async move {
                let service = module.resource.service.clone();
                let root = service
                    .runtime_capture_root()
                    .ok_or_else(|| composition("automatic memory learning is disabled"))?;
                let excluded = module.resource.excluded_categories.clone();
                tokio::task::spawn_blocking(move || {
                    if let Some(output) = output {
                        CaptureQueue::open(root.clone(), excluded)
                            .map_err(capture_error)?
                            .process_output(
                                &job,
                                root,
                                &worker,
                                output,
                                chrono::Utc::now().timestamp(),
                            )
                            .map_err(capture_error)?;
                    }
                    // The capture receipt commits first. Reentry must still run a
                    // missing consolidation step; the canonical engine archives
                    // its evidence and makes repeated successful passes harmless.
                    if config.consolidate {
                        for area in config.write {
                            futures::executor::block_on(service.consolidate(ConsolidateRequest {
                                area,
                                mode: ConsolidationMode::Active,
                            }))
                            .map_err(capture_error)?;
                        }
                    }
                    Ok(())
                })
                .await
                .map_err(capture_error)?
            })
            .await
    }
}
#[async_trait::async_trait]
impl HookHandler for Capture {
    fn resume_identity(&self, context: &RunContext) -> Option<String> {
        let authority = governance::receipt_identity(context)
            .or_else(|| nofy_agent_runtime::hooks::primitive::recovery_identity(context))?;
        content_digest(&(&self.identity, authority)).ok()
    }
    async fn handle(&self, event: &HookEvent, context: &RunContext) -> Result<HookDecision, Error> {
        if event.name != "turn_done" {
            return Err(composition("memory capture subscribes only to turn_done"));
        }
        if context.capabilities.get::<DurableTurnReceipt>().is_none()
            && event.payload.get("info").is_some_and(|info| {
                !info.get("refusal").is_none_or(Value::is_null)
                    || matches!(
                        info.get("stop_reason").and_then(Value::as_str),
                        Some("length" | "max_tokens" | "max_output_tokens")
                    )
            })
        {
            return Ok(HookDecision::Continue);
        }
        let receipt = context
            .capabilities
            .get::<DurableTurnReceipt>()
            .filter(|receipt| {
                receipt.thread_id() == context.thread_id && receipt.run_id() == context.run_id
            })
            .ok_or_else(|| {
                composition("memory capture requires its committed durable turn receipt")
            })?;
        if !receipt.top_level() {
            return Ok(HookDecision::Continue);
        }
        let invocation = context
            .capabilities
            .get::<nofy_agent_runtime::hooks::HookInvocation>()
            .filter(|invocation| invocation.event_id == event.id)
            .ok_or_else(|| {
                Error::Checkpoint("memory capture requires its original Hook invocation".into())
            })?;
        let scope = format!(
            "memory-hook:{}",
            content_digest(&(
                &context.thread_id,
                &context.run_id,
                &invocation.event_id,
                &invocation.hook_identity,
            ))?
        );
        let scoped = governance::operation_context(context, &scope);
        let context = &scoped;
        if !governance::is_governed(context) && !model_journal::enabled(context) {
            return Err(Error::Checkpoint(
                "memory capture requires model receipts".into(),
            ));
        }
        let Some(prepared) = governance::await_resource(context, self.prepare(context))
            .await
            .map_err(pending)?
        else {
            return Ok(HookDecision::Continue);
        };
        let operation = format!(
            "memory-capture:{}",
            content_digest(&(&self.identity, &scope, &prepared.job))?
        );
        let output = if let Some(transcript) = prepared.transcript {
            let response = governance::sample_model(
                self.model.as_ref(),
                ModelRequest {
                    messages: vec![
                        Message::System {
                            content: self.config.instructions.clone(),
                        },
                        Message::User {
                            content: transcript,
                        },
                    ],
                    tools: vec![],
                    settings: self.config.settings.clone(),
                },
                context,
                &operation,
                false,
                |_| async { Ok(()) },
            )
            .await?;
            if !response.tool_calls.is_empty()
                || response.info.refusal.is_some()
                || matches!(
                    response.info.stop_reason.as_deref(),
                    Some("length" | "max_tokens" | "max_output_tokens")
                )
                || response.output.len() > 65536
            {
                return Err(composition(
                    "capture requires complete bounded JSON without tool calls",
                ));
            }
            let drafts = ObservationDraft::parse_strict(&response.output).map_err(capture_error)?;
            if drafts.len() > self.config.max_items {
                return Err(composition(
                    "capture drafts exceed declared count, size or write areas",
                ));
            }
            for draft in &drafts {
                let area = match crate::capture::resolve_scope(draft, Some(prepared.project))
                    .map_err(capture_error)?
                {
                    crate::model::MemoryScope::Personal => MemoryArea::Personal,
                    crate::model::MemoryScope::Project(_) => MemoryArea::Project,
                };
                if !self.config.write.contains(&area) || draft.statement.len() > 16384 {
                    return Err(composition(
                        "capture drafts exceed declared count, size or write areas",
                    ));
                }
            }
            Some(response.output)
        } else {
            None
        };
        governance::await_resource(
            context,
            self.commit(prepared.job, output, operation, context),
        )
        .await
        .map_err(pending)?;
        Ok(HookDecision::Continue)
    }
}
