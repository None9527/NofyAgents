//! One bounded, confined renderer for HTTP previews and actual model prompts.
use super::*;
use nofy_agent_modules::prompt::{
    DocumentPrompt, DocumentPromptFactory, FragmentContent, PromptDocument, PromptPreview,
    PromptVariables,
};
use nofy_agent_runtime::{Error, Prompt, RunContext, registry::*};
use serde::{Deserialize, Serialize};
use std::{collections::BTreeMap, io::Write};
use tokio_util::sync::CancellationToken;

mod process;
pub(super) use process::worker_render;
pub const PROTOCOL: &str = "nofy.prompt-render/v1";
const MAX_DOCUMENT: usize = 2 * 1024 * 1024;
const MAX_INPUT: usize = 4 * 1024 * 1024;
const MAX_OUTPUT: usize = 16 * 1024 * 1024;

#[derive(Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct PromptRequest {
    pub document: PromptDocument,
    #[serde(default)]
    pub variables: BTreeMap<String, serde_json::Value>,
    #[serde(default)]
    pub tools: Vec<String>,
}
#[derive(Serialize)]
pub struct PromptStatus {
    pub protocol: &'static str,
    pub slots: usize,
    pub in_flight: usize,
    pub started: u64,
    pub helper_bound: bool,
    pub stopping: bool,
}
struct Count {
    bytes: usize,
    max: usize,
}
impl Write for Count {
    fn write(&mut self, bytes: &[u8]) -> std::io::Result<usize> {
        if self.bytes.saturating_add(bytes.len()) > self.max {
            return Err(std::io::Error::other("prompt data exceeds its byte limit"));
        }
        self.bytes += bytes.len();
        Ok(bytes.len())
    }
    fn flush(&mut self) -> std::io::Result<()> {
        Ok(())
    }
}
fn bounded(value: &impl Serialize, max: usize) -> std::result::Result<(), Error> {
    serde_json::to_writer(Count { bytes: 0, max }, value)
        .map_err(|_| Error::Composition("prompt data exceeds its byte limit".into()))
}
fn validate_document(document: &PromptDocument) -> std::result::Result<(), Error> {
    bounded(document, MAX_DOCUMENT)?;
    DocumentPrompt::validate_structure(document)?;
    let mut count = 0;
    for fragment in &document.fragments {
        let FragmentContent::Template(source) = &fragment.content else {
            continue;
        };
        for token in
            minijinja::machinery::tokenize(source, false, Default::default(), Default::default())
        {
            token.map_err(|e| Error::Composition(e.to_string()))?;
            count += 1;
            if count > 4096 {
                return Err(Error::Composition(
                    "prompt templates exceed 4096 tokens".into(),
                ));
            }
        }
        // Parsing constructs the AST only. Compiling here would constant-fold
        // expressions and could allocate before the child limits take effect.
        minijinja::machinery::parse(source, "<prompt>", Default::default(), Default::default())
            .map_err(|e| Error::Composition(e.to_string()))?;
    }
    Ok(())
}
impl PromptRequest {
    fn validate(&self) -> std::result::Result<(), Error> {
        validate_document(&self.document)?;
        bounded(&self.variables, 65536)?;
        if self
            .variables
            .keys()
            .any(|name| matches!(name.as_str(), "tools" | "tool_names"))
        {
            return Err(Error::Composition(
                "runtime cannot override the tool view".into(),
            ));
        }
        let mut names = std::collections::BTreeSet::new();
        if self.tools.len() > 1024 || self.tools.iter().map(String::len).sum::<usize>() > 65536 {
            return Err(Error::Composition(
                "prompt tool view exceeds its limits".into(),
            ));
        }
        for name in &self.tools {
            nofy_tool_protocol::ToolId::new(name)
                .map_err(|_| Error::Composition("invalid prompt tool name".into()))?;
            if !names.insert(name) {
                return Err(Error::Composition("duplicate prompt tool name".into()));
            }
        }
        Ok(())
    }
}
pub(super) struct PromptFactory(pub Loader);
impl ModuleFactory for PromptFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        let mut descriptor = DocumentPromptFactory.descriptor();
        descriptor.revision = format!("{}:{PROTOCOL}", descriptor.revision);
        descriptor.config_schema["description"] = serde_json::json!(
            "Linux isolated document prompt: 2 MiB definition, 4096 template tokens, 1 MiB emitted output"
        );
        descriptor
    }
    fn build(
        &self,
        config: &serde_json::Value,
        _: &BTreeMap<String, ModuleInstance>,
    ) -> std::result::Result<ModuleInstance, Error> {
        if !cfg!(target_os = "linux") || !self.0.helper_ready() {
            return Err(Error::Composition(
                "isolated prompt rendering requires its installed Linux helper".into(),
            ));
        }
        let document: PromptDocument = serde_json::from_value(config.clone())
            .map_err(|e| Error::Composition(e.to_string()))?;
        validate_document(&document)?;
        Ok(ModuleInstance::Prompt(Arc::new(IsolatedPrompt {
            loader: self.0.clone(),
            document,
        })))
    }
}
struct IsolatedPrompt {
    loader: Loader,
    document: PromptDocument,
}
#[async_trait::async_trait]
impl Prompt for IsolatedPrompt {
    async fn render(
        &self,
        context: &RunContext,
        tools: &[String],
    ) -> std::result::Result<String, Error> {
        let variables = context
            .capabilities
            .get::<PromptVariables>()
            .map(|v| v.0.clone())
            .unwrap_or_default();
        self.loader
            .render_prompt(
                PromptRequest {
                    document: self.document.clone(),
                    variables,
                    tools: tools.to_vec(),
                },
                context.cancel.clone(),
                None,
            )
            .await
            .map(|preview| preview.text)
            .map_err(|error| match error {
                HostError::Runtime(error) => error,
                other => Error::Composition(other.to_string()),
            })
    }
}
impl Loader {
    pub fn prompt_status(&self) -> PromptStatus {
        PromptStatus {
            protocol: PROTOCOL,
            slots: 2,
            in_flight: 2 - self.prompt_work.available_permits(),
            started: self
                .prompt_started
                .load(std::sync::atomic::Ordering::Relaxed),
            helper_bound: self.helper_ready(),
            stopping: self.acquisition_stop.is_cancelled(),
        }
    }
    pub(crate) async fn render_prompt(
        &self,
        request: PromptRequest,
        cancel: CancellationToken,
        management: Option<Arc<tokio::sync::OwnedSemaphorePermit>>,
    ) -> Result<PromptPreview> {
        let permit = tokio::select! {biased;
            _=self.acquisition_stop.cancelled()=>return Err(HostError::Unavailable("prompt renderer is shutting down".into())),
            _=cancel.cancelled()=>return Err(HostError::Unavailable("prompt rendering cancelled".into())),
            permit=self.prompt_work.clone().acquire_owned()=>permit.map_err(storage::unavailable)?,
        };
        let loader = self.clone();
        // Dropping the caller must not release either permit while its actual
        // blocking preparation or child is still using resources.
        tokio::spawn(async move {
            let _admission = (permit, management);
            process::render(&loader, request, cancel).await
        })
        .await
        .map_err(storage::unavailable)?
    }
    pub(crate) async fn drain_prompt_workers(&self) -> Result<()> {
        let _idle = self
            .prompt_work
            .clone()
            .acquire_many_owned(2)
            .await
            .map_err(storage::unavailable)?;
        Ok(())
    }
}
