//! Artifact-defined narrowing scopes. Policy vocabulary belongs to the artifact.
mod engine;
mod json;
mod skills;
pub use skills::DeclaredSkillsFactory;

use crate::skills::{SkillScopeCompiler, SkillToolScope};
use nofy_agent_runtime::{
    Admission, Error, Policy, RunContext, RunState, ToolCall, ToolCatalog,
    artifact::{ArtifactBundle, entry_path},
    registry::*,
    system::content_digest,
};
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use std::{
    collections::{BTreeMap, BTreeSet},
    path::{Component, Path, PathBuf},
    sync::Arc,
};

pub(crate) fn invalid(message: &str) -> Error {
    Error::Composition(message.into())
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(default, deny_unknown_fields)]
pub struct Limits {
    pub max_operations: u64,
    pub timeout_ms: u64,
    pub max_input_bytes: usize,
    pub max_output_bytes: usize,
}
impl Default for Limits {
    fn default() -> Self {
        Self {
            max_operations: 200_000,
            timeout_ms: 500,
            max_input_bytes: 2 * 1024 * 1024,
            max_output_bytes: 512 * 1024,
        }
    }
}
impl Limits {
    fn validate(&self) -> Result<(), Error> {
        if !(1..=10_000_000).contains(&self.max_operations)
            || !(1..=5000).contains(&self.timeout_ms)
            || !(256..=2 * 1024 * 1024).contains(&self.max_input_bytes)
            || !(64..=512 * 1024).contains(&self.max_output_bytes)
        {
            return Err(invalid("invalid scope program limits"));
        }
        Ok(())
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case", deny_unknown_fields)]
pub enum Operation {
    Filter { names: Vec<String> },
    Admit { call: ToolCall },
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case", deny_unknown_fields)]
pub enum Reply {
    Filter { allowed: Vec<String> },
    Admit { allowed: bool },
}

/// Fully resolved portable data for an execution boundary, not an inline factory config.
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Program {
    source: String,
    artifact_digest: String,
    cwd: PathBuf,
    parameters: Value,
    limits: Limits,
}
pub(crate) fn validate_cwd(cwd: &Path) -> Result<(), Error> {
    let text = cwd
        .to_str()
        .ok_or_else(|| invalid("scope cwd requires UTF-8"))?;
    if !cwd.is_absolute()
        || text.len() > 4096
        || text.chars().any(char::is_control)
        || cwd.components().any(|p| matches!(p, Component::ParentDir))
    {
        return Err(invalid(
            "scope cwd must be absolute, bounded and without traversal",
        ));
    }
    Ok(())
}
fn bounded(value: &impl Serialize, max: usize) -> Result<(), Error> {
    struct Count {
        bytes: usize,
        max: usize,
    }
    impl std::io::Write for Count {
        fn write(&mut self, bytes: &[u8]) -> std::io::Result<usize> {
            self.bytes = self
                .bytes
                .checked_add(bytes.len())
                .filter(|n| *n <= self.max)
                .ok_or_else(|| std::io::Error::other("scope byte limit"))?;
            Ok(bytes.len())
        }
        fn flush(&mut self) -> std::io::Result<()> {
            Ok(())
        }
    }
    serde_json::to_writer(Count { bytes: 0, max }, value)
        .map_err(|_| invalid("scope JSON exceeds byte limit or is invalid"))
}
fn validate_rules(rules: &[String]) -> Result<(), Error> {
    if rules.len() > 1024
        || rules.iter().map(String::len).sum::<usize>() > 65536
        || rules.iter().any(|r| r.is_empty())
    {
        return Err(invalid("scope rules require bounded nonempty strings"));
    }
    Ok(())
}
impl Program {
    pub fn limits(&self) -> &Limits {
        &self.limits
    }
    pub fn cwd(&self) -> &Path {
        &self.cwd
    }
    /// Validate data and the caller's binding without invoking program code.
    pub fn validate_request(
        &self,
        rules: &[String],
        operation: &Operation,
        context: &RunContext,
    ) -> Result<(), Error> {
        self.validate_context(context)?;
        self.input(rules, operation).map(|_| ())
    }
    pub fn validate(&self) -> Result<(), Error> {
        self.limits.validate()?;
        validate_cwd(&self.cwd)?;
        if self.source.is_empty() || self.source.len() > 65536 || self.artifact_digest.is_empty() {
            return Err(invalid("invalid resolved scope source"));
        }
        bounded(&self.parameters, 65536)?;
        engine::validate(self)
    }
    /// Pure SDK entry point; the caller owns process/thread isolation and reaping.
    pub fn evaluate(
        &self,
        rules: &[String],
        operation: Operation,
        context: &RunContext,
    ) -> Result<Reply, Error> {
        self.validate()?;
        self.validate_context(context)?;
        let input = self.input(rules, &operation)?;
        let value = engine::evaluate(self, input, context)?;
        bounded(&value, self.limits.max_output_bytes)?;
        let reply: Reply =
            serde_json::from_value(value).map_err(|_| invalid("invalid scope reply"))?;
        validate_reply(&operation, &reply)?;
        Ok(reply)
    }
    fn input(&self, rules: &[String], operation: &Operation) -> Result<Value, Error> {
        validate_rules(rules)?;
        validate_operation(operation)?;
        let input = json!({"cwd":self.cwd,"parameters":self.parameters,
            "rules":rules,"operation":operation});
        bounded(&input, self.limits.max_input_bytes)?;
        Ok(input)
    }
    fn validate_context(&self, context: &RunContext) -> Result<(), Error> {
        if context.cancel.is_cancelled() {
            return Err(Error::Cancelled);
        }
        if context
            .capabilities
            .get::<nofy_tool_runtime::Cwd>()
            .is_some_and(|cwd| cwd.0 != self.cwd)
        {
            return Err(invalid(
                "scope cwd conflicts with its declared matching base",
            ));
        }
        Ok(())
    }
}
fn validate_operation(operation: &Operation) -> Result<(), Error> {
    match operation {
        Operation::Filter { names } => {
            if names.len() > 1024 || names.iter().map(String::len).sum::<usize>() > 65536 {
                return Err(invalid("scope view exceeds 1024 names/64 KiB"));
            }
            let mut seen = BTreeSet::new();
            for name in names {
                nofy_tool_protocol::ToolId::new(name)
                    .map_err(|_| invalid("invalid scope tool name"))?;
                if !seen.insert(name) {
                    return Err(invalid("duplicate scope tool name"));
                }
            }
        }
        Operation::Admit { call } => {
            nofy_tool_protocol::ToolId::new(&call.name)
                .map_err(|_| invalid("invalid scope call name"))?;
            bounded(call, 65536)?;
        }
    }
    Ok(())
}
fn validate_reply(operation: &Operation, reply: &Reply) -> Result<(), Error> {
    match (operation, reply) {
        (Operation::Filter { names }, Reply::Filter { allowed }) => {
            let names: BTreeSet<_> = names.iter().collect();
            let mut seen = BTreeSet::new();
            if allowed
                .iter()
                .any(|name| !names.contains(name) || !seen.insert(name))
            {
                return Err(invalid("scope reply must be a unique subset of its input"));
            }
            Ok(())
        }
        (Operation::Admit { .. }, Reply::Admit { .. }) => Ok(()),
        _ => Err(invalid("scope reply kind differs from its operation")),
    }
}

/// Must be explicitly installed; there is no default in-process execution fallback.
#[async_trait::async_trait]
pub trait Executor: Send + Sync {
    fn identity(&self) -> &str;
    fn available(&self) -> bool;
    async fn evaluate(
        &self,
        program: &Program,
        rules: &[String],
        operation: Operation,
        context: &RunContext,
    ) -> Result<Reply, Error>;
}
pub struct Compiler {
    program: Program,
    executor: Arc<dyn Executor>,
    identity: String,
}
impl SkillScopeCompiler for Compiler {
    fn identity(&self) -> &str {
        &self.identity
    }
    fn validate_context(&self, context: &RunContext) -> Result<(), Error> {
        self.program.validate_context(context)
    }
    fn compile(&self, rules: &[String]) -> Result<Arc<dyn SkillToolScope>, Error> {
        validate_rules(rules)?;
        let identity = format!("scope:{:}", content_digest(&(&self.identity, rules))?);
        Ok(Arc::new(Scope {
            program: self.program.clone(),
            executor: self.executor.clone(),
            rules: rules.to_vec(),
            identity,
        }))
    }
}
struct Scope {
    program: Program,
    executor: Arc<dyn Executor>,
    rules: Vec<String>,
    identity: String,
}
impl Scope {
    async fn evaluate(&self, operation: Operation, context: &RunContext) -> Result<Reply, Error> {
        self.program.validate_context(context)?;
        self.program.input(&self.rules, &operation)?;
        if !self.executor.available() {
            return Err(invalid("scope executor unavailable"));
        }
        let reply = self
            .executor
            .evaluate(&self.program, &self.rules, operation.clone(), context)
            .await?;
        self.program.validate_context(context)?;
        validate_reply(&operation, &reply)?;
        bounded(&reply, self.program.limits.max_output_bytes)?;
        Ok(reply)
    }
}
#[async_trait::async_trait]
impl SkillToolScope for Scope {
    fn identity(&self) -> &str {
        &self.identity
    }
    fn permits_name(&self, _: &str) -> bool {
        false
    }
    fn validate_catalog(&self, _: &ToolCatalog) -> Result<(), Error> {
        Err(invalid("scope program requires asynchronous evaluation"))
    }
    fn validate_context(&self, context: &RunContext) -> Result<(), Error> {
        self.program.validate_context(context)
    }
    async fn filter_catalog(
        &self,
        catalog: ToolCatalog,
        context: &RunContext,
    ) -> Result<ToolCatalog, Error> {
        let Reply::Filter { allowed } = self
            .evaluate(
                Operation::Filter {
                    names: catalog.names(),
                },
                context,
            )
            .await?
        else {
            return Err(invalid("invalid scope filter reply"));
        };
        let mut result = ToolCatalog::new();
        for name in allowed {
            result.insert(
                catalog
                    .get(&name)
                    .ok_or_else(|| invalid("unknown scope result"))?
                    .clone(),
            )?;
        }
        Ok(result)
    }
}
#[async_trait::async_trait]
impl Policy for Scope {
    async fn admit(
        &self,
        call: &ToolCall,
        _: &RunState,
        context: &RunContext,
    ) -> Result<Admission, Error> {
        match self
            .evaluate(Operation::Admit { call: call.clone() }, context)
            .await?
        {
            Reply::Admit { allowed: true } => Ok(Admission::Allow),
            Reply::Admit { allowed: false } => Ok(Admission::Deny(format!(
                "tool outside programmed skill scope: {}",
                call.name
            ))),
            _ => Err(invalid("invalid scope admission reply")),
        }
    }
}

#[derive(Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case", deny_unknown_fields)]
enum Source {
    Artifact {
        entries: Vec<String>,
        #[serde(default)]
        parameters_schema: Option<String>,
    },
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Declaration {
    source: Source,
    cwd: PathBuf,
    #[serde(default)]
    parameters: Value,
    #[serde(default)]
    limits: Limits,
}
pub struct Factory {
    executor: Arc<dyn Executor>,
}
impl Factory {
    pub fn new(executor: Arc<dyn Executor>) -> Result<Self, Error> {
        let id = executor.identity();
        if id.trim().is_empty() || id.len() > 256 || id.chars().any(char::is_control) {
            return Err(invalid("invalid scope executor identity"));
        }
        Ok(Self { executor })
    }
}
impl ModuleFactory for Factory {
    fn descriptor(&self) -> ModuleDescriptor {
        ModuleDescriptor {
            factory: "resource.scope_program".into(),
            revision: format!("scope-program-v1:{}", self.executor.identity()),
            kind: ModuleKind::Resource,
            config_schema: json!({"type":"object","additionalProperties":false,"required":["source","cwd"],"properties":{
                "source":{"type":"object","additionalProperties":false,"required":["kind","entries"],"properties":{"kind":{"const":"artifact"},"entries":{"type":"array","minItems":1,"maxItems":16,"uniqueItems":true,"items":{"type":"string","minLength":1,"maxLength":256}},"parameters_schema":{"type":"string","minLength":1,"maxLength":256}}},
                "cwd":{"type":"string","minLength":1,"maxLength":4096},"parameters":{},"limits":{"type":"object","additionalProperties":false,"properties":{
                    "max_operations":{"type":"integer","minimum":1,"maximum":10000000},"timeout_ms":{"type":"integer","minimum":1,"maximum":5000},
                    "max_input_bytes":{"type":"integer","minimum":256,"maximum":2097152},"max_output_bytes":{"type":"integer","minimum":64,"maximum":524288}}}}}),
            input_schema: None,
            output_schema: None,
            required_capabilities: Default::default(),
            dependencies: BTreeMap::from([("artifact".into(), ModuleKind::Resource)]),
        }
    }
    fn build(
        &self,
        config: &Value,
        dependencies: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        nofy_agent_runtime::settings::validate_json_value(
            &self.descriptor().config_schema,
            config,
        )?;
        if !self.executor.available() {
            return Err(invalid("required scope executor unavailable"));
        }
        let config: Declaration = serde_json::from_value(config.clone())
            .map_err(|_| invalid("invalid scope declaration"))?;
        let Some(ModuleInstance::Resource(resource)) = dependencies.get("artifact") else {
            return Err(invalid("scope requires artifact resource"));
        };
        let bundle = resource
            .get::<ArtifactBundle>()
            .ok_or_else(|| invalid("scope artifact has another resource type"))?;
        bundle.validate()?;
        let Source::Artifact {
            entries,
            parameters_schema,
        } = config.source;
        let mut source = String::new();
        let mut seen = BTreeSet::new();
        for path in entries {
            entry_path(&path)?;
            if !seen.insert(path.clone()) {
                return Err(invalid("duplicate scope entry"));
            }
            let text = bundle
                .files
                .get(&path)
                .ok_or_else(|| invalid("scope entry missing from artifact"))?;
            if text.len() + 1 > 65536usize.saturating_sub(source.len()) {
                return Err(invalid("scope source exceeds 65536 bytes"));
            }
            source.push_str(text);
            source.push('\n');
        }
        if let Some(path) = parameters_schema {
            entry_path(&path)?;
            let text = bundle
                .files
                .get(&path)
                .filter(|v| v.len() <= 65536)
                .ok_or_else(|| invalid("scope parameters schema missing or oversized"))?;
            let schema: Value = serde_json::from_str(text)
                .map_err(|_| invalid("invalid scope parameters schema"))?;
            nofy_agent_runtime::settings::validate_json_value(&schema, &config.parameters)?;
        }
        let program = Program {
            source,
            artifact_digest: bundle.digest()?,
            cwd: config.cwd,
            parameters: config.parameters,
            limits: config.limits,
        };
        program.validate()?;
        let identity = format!(
            "scope-program-v1:{}",
            content_digest(&(&program, self.executor.identity()))?
        );
        let compiler = Arc::new(Compiler {
            program,
            executor: self.executor.clone(),
            identity: identity.clone(),
        });
        Ok(ModuleInstance::Resource(Arc::new(ResourceHandle::new(
            identity, compiler,
        )?)))
    }
}
