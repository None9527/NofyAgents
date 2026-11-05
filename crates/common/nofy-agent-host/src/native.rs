use crate::Result;
use nofy_agent_runtime::credentials::CredentialProvider;
use nofy_agent_runtime::{
    hooks::{EventCatalog, HookFactory},
    policy::{OnToolsFactory, ToolAllowListFactory},
    recipe::{
        LiteralStageFactory, RecipeFactory,
        policies::{LengthStageFactory, RepeatStageFactory},
        tasks::TodoStageFactory,
    },
    registry::{ModuleFactory, ModuleRegistry, StaticPromptFactory},
};
use std::sync::Arc;
pub(crate) struct ApprovalFactory(pub nofy_agent_runtime::durable::SqliteStore);
impl ModuleFactory for ApprovalFactory {
    fn descriptor(&self) -> nofy_agent_runtime::registry::ModuleDescriptor {
        nofy_agent_runtime::registry::ModuleDescriptor {
            factory: "policy.approval".into(),
            revision: "1".into(),
            kind: nofy_agent_runtime::registry::ModuleKind::Policy,
            config_schema: serde_json::json!({"type":"object","additionalProperties":false}),
            input_schema: None,
            output_schema: None,
            required_capabilities: Default::default(),
            dependencies: Default::default(),
        }
    }
    fn build(
        &self,
        _: &serde_json::Value,
        _: &std::collections::BTreeMap<String, nofy_agent_runtime::registry::ModuleInstance>,
    ) -> std::result::Result<nofy_agent_runtime::registry::ModuleInstance, nofy_agent_runtime::Error>
    {
        Ok(nofy_agent_runtime::registry::ModuleInstance::Policy(
            Arc::new(nofy_agent_runtime::supervisor::DurableApprovalPolicy::new(
                self.0.clone(),
            )),
        ))
    }
}

/// The installed engine set is stable. New protocol resources and module
/// definitions are loaded from the same document handled by the API.
pub fn registry(credentials: Arc<dyn CredentialProvider>) -> Result<ModuleRegistry> {
    let mut registry = ModuleRegistry::default();
    let http = nofy_agent_executors::declarative::HttpResourceFactory::new(
        credentials.identity(),
        Arc::new(HttpCredentials(credentials.clone())),
    )?;
    let factories: Vec<Arc<dyn ModuleFactory>> = vec![
        Arc::new(StaticPromptFactory),
        Arc::new(nofy_agent_runtime::tools::compose::ComposeFactory),
        Arc::new(nofy_agent_runtime::session_policy::RulesFactory),
        Arc::new(nofy_agent_modules::rules::RulesFactory),
        Arc::new(nofy_agent_modules::skills::SkillsFactory::context()),
        Arc::new(
            nofy_agent_modules::skills::SkillsFactory::tools()
                .with_substitution_limits(skill_substitution_limits()),
        ),
        Arc::new(nofy_agent_modules::bindings::DeclaredCwdFactory),
        Arc::new(nofy_agent_runtime::model_journal::ModelJournalFactory),
        Arc::new(nofy_agent_models::declarative::ConnectionFactory::new(
            credentials.clone(),
        )?),
        Arc::new(nofy_agent_models::declarative::ProgrammedModelFactory::default()),
        Arc::new(nofy_agent_runtime::model::image_fallback::ImageFallbackFactory),
        Arc::new(nofy_agent_runtime::model::image_fallback::ContextFallbackFactory),
        Arc::new(http),
        Arc::new(nofy_agent_executors::declarative::ConnectedHttpToolFactory),
        Arc::new(nofy_agent_executors::declarative::HttpToolSourceFactory),
        Arc::new(nofy_agent_executors::mcp::HttpResourceFactory::new(
            credentials.identity(),
            Arc::new(HttpCredentials(credentials.clone())),
        )?),
        Arc::new(nofy_agent_executors::mcp::ToolSourceFactory),
        Arc::new(nofy_agent_executors::hooks::ExecutorHookFactory),
        Arc::new(nofy_agent_runtime::workflow::declarative::WorkflowResourceFactory),
        Arc::new(nofy_agent_runtime::workflow::declarative::ConnectedWorkflowToolFactory),
        Arc::new(nofy_agent_runtime::workflow::declarative::ConnectedWorkflowHookFactory),
        Arc::new(HookFactory::new(EventCatalog::runtime())),
        Arc::new(nofy_agent_runtime::event_program::declarative::EventProducerFactory),
        Arc::new(nofy_agent_runtime::event_program::declarative::OwnedHookFactory),
        Arc::new(ToolAllowListFactory),
        Arc::new(nofy_agent_runtime::policy::ToolRulesFactory),
        Arc::new(nofy_agent_runtime::tasks::declarative::TasksResourceFactory),
        Arc::new(nofy_agent_runtime::tasks::declarative::TasksBindingFactory),
        Arc::new(nofy_agent_runtime::tasks::declarative::TasksToolFactory),
        Arc::new(nofy_agent_runtime::tasks::declarative::MessagesToolFactory),
        Arc::new(OnToolsFactory),
        Arc::new(RecipeFactory),
        Arc::new(LiteralStageFactory),
        Arc::new(LengthStageFactory),
        Arc::new(RepeatStageFactory),
        Arc::new(TodoStageFactory),
    ];
    for factory in factories {
        registry.register_factory(factory)?;
    }
    Ok(registry)
}
pub(crate) fn skill_substitution_limits() -> nofy_agent_modules::skills::SubstitutionLimits {
    nofy_agent_modules::skills::SubstitutionLimits {
        max_input_bytes: 1024 * 1024,
        max_output_bytes: 1024 * 1024,
        max_work_bytes: 64 * 1024 * 1024,
    }
}
struct HttpCredentials(Arc<dyn CredentialProvider>);
#[async_trait::async_trait]
impl nofy_agent_executors::resources::CredentialProvider for HttpCredentials {
    async fn resolve(
        &self,
        reference: &str,
        _: &nofy_tool_runtime::ToolCallContext,
    ) -> std::result::Result<String, nofy_tool_runtime::ToolError> {
        self.0
            .resolve(reference)
            .await
            .map_err(|_| {
                nofy_tool_runtime::ToolError::custom(
                    "credential_unavailable",
                    "HTTP credential resolution failed",
                )
            })?
            .filter(|v| !v.trim().is_empty())
            .ok_or_else(|| {
                nofy_tool_runtime::ToolError::custom(
                    "credential_unavailable",
                    format!("HTTP credential reference unavailable: {reference}"),
                )
            })
    }
}
