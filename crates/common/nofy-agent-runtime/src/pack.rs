//! Compile every model-plane pack field through explicit host bindings.
//! This module selects no filesystem, connector, service or authorization itself.
use crate::{
    Agent, AgentBuilder, Components, Error, Prompt, RunContext, Settings, StaticPrompt, ToolCatalog,
};
use nofy_packcore::Realm;
pub use nofy_packcore::{PackManifest, parse_pack};
use std::{any::Any, collections::BTreeMap, sync::Arc};

#[derive(Clone)]
pub struct McpBinding {
    pub transport: String,
    pub source: String,
}
#[derive(Clone)]
pub struct ServiceBinding {
    pub revision: String,
    pub value: Arc<dyn Any + Send + Sync>,
}
#[derive(Default)]
pub struct PackBindings {
    pub default_model: String,
    pub tool_packs: Vec<String>,
    pub required_policies: Vec<String>,
    pub context_sources: Vec<String>,
    pub settings: Settings,
    pub skills: BTreeMap<String, Arc<dyn Prompt>>,
    pub mcp: BTreeMap<String, McpBinding>,
    pub subagents: BTreeMap<(String, String), Agent>,
    pub services: BTreeMap<(String, String), ServiceBinding>,
}

#[derive(Clone)]
pub struct PackServices {
    pub realm: String,
    values: BTreeMap<String, Arc<dyn Any + Send + Sync>>,
}
impl PackServices {
    pub fn get<T: Any + Send + Sync>(&self, name: &str) -> Option<Arc<T>> {
        self.values.get(name).cloned()?.downcast().ok()
    }
}
impl crate::context::ContextBinding for PackServices {
    fn bind(&self, context: &mut RunContext) -> Result<(), Error> {
        // Child packs install their own realm, rather than inheriting the
        // parent's same-named service container through Agent-as-Tool.
        context.capabilities.insert(self.clone());
        Ok(())
    }
}

struct PackPrompt {
    persona: StaticPrompt,
    skills: Vec<Arc<dyn Prompt>>,
}
#[async_trait::async_trait]
impl Prompt for PackPrompt {
    async fn render(&self, context: &RunContext, tools: &[String]) -> Result<String, Error> {
        let mut result = self.persona.render(context, tools).await?;
        for skill in &self.skills {
            result.push_str("\n\n");
            result.push_str(&skill.render(context, tools).await?);
        }
        Ok(result)
    }
}

/// Unknown/missing bindings fail at compile, before any model/tool side effect.
/// Use packcore::parse_pack on raw input to enforce host-plane ownership first.
pub fn compile(
    pack: &PackManifest,
    components: &Components,
    bindings: &PackBindings,
) -> Result<Agent, Error> {
    if pack.id.is_empty() {
        return Err(Error::Composition("pack id is empty".into()));
    }
    if pack.services.iter().any(|s| s.realm == Realm::Root) {
        return Err(Error::Composition(
            "pack cannot bind root-realm services".into(),
        ));
    }
    nofy_packcore::compose_packs(std::slice::from_ref(pack))
        .map_err(|e| Error::Composition(format!("invalid pack realm: {e:?}")))?;
    let mut c = components.clone();
    let prompt_id = format!("pack:{}:prompt", pack.id);
    let child_id = format!("pack:{}:delegation", pack.id);
    if c.prompts.contains_key(&prompt_id) || c.tool_packs.contains_key(&child_id) {
        return Err(Error::Composition(
            "pack component id collides with existing registration".into(),
        ));
    }
    let skills = pack
        .skills
        .iter()
        .map(|id| {
            bindings
                .skills
                .get(id)
                .cloned()
                .ok_or_else(|| Error::Composition(format!("missing skill binding: {id}")))
        })
        .collect::<Result<Vec<_>, _>>()?;
    c.prompts.insert(
        prompt_id.clone(),
        Arc::new(PackPrompt {
            persona: StaticPrompt(pack.persona.clone()),
            skills,
        }),
    );
    let mut builder = AgentBuilder::new(&pack.id)
        .model(pack.model_route.as_ref().unwrap_or(&bindings.default_model))
        .prompt(prompt_id)
        .settings(bindings.settings.clone());
    for id in &bindings.tool_packs {
        builder = builder.tools(id);
    }
    for id in &bindings.context_sources {
        builder = builder.context_source(id);
    }
    for id in &bindings.required_policies {
        builder = builder.policy(id);
    }
    if !pack.tool_policy.is_empty() && !bindings.required_policies.contains(&pack.tool_policy) {
        builder = builder.policy(&pack.tool_policy);
    }
    for reference in &pack.mcp {
        let binding = bindings.mcp.get(&reference.name).ok_or_else(|| {
            Error::Composition(format!("missing MCP binding: {}", reference.name))
        })?;
        if !reference.transport.is_empty() && reference.transport != binding.transport {
            return Err(Error::Composition(format!(
                "MCP transport mismatch: {}",
                reference.name
            )));
        }
        builder = builder.tool_source(&binding.source);
    }
    if !pack.subagents.is_empty() {
        let mut tools = ToolCatalog::new();
        for child in &pack.subagents {
            let agent = bindings
                .subagents
                .get(&(child.id.clone(), child.provider.clone()))
                .ok_or_else(|| {
                    Error::Composition(format!(
                        "missing subagent binding: {} via {}",
                        child.id, child.provider
                    ))
                })?;
            tools.insert(agent.as_tool(&child.id, format!("Delegate to {}", child.id)))?;
        }
        c.tool_packs.insert(child_id.clone(), tools);
        builder = builder.tools(child_id);
    }
    let mut values = BTreeMap::new();
    let mut versions = Vec::new();
    for service in &pack.services {
        let binding = bindings
            .services
            .get(&(pack.id.clone(), service.name.clone()))
            .ok_or_else(|| {
                Error::Composition(format!(
                    "missing service binding: {}:{}",
                    pack.id, service.name
                ))
            })?;
        if binding.revision.is_empty() {
            return Err(Error::Composition("service binding has no revision".into()));
        }
        values.insert(service.name.clone(), binding.value.clone());
        versions.push((&service.name, &binding.revision));
    }
    let identity =
        serde_json::to_string(&(pack, versions)).map_err(|e| Error::Composition(e.to_string()))?;
    Ok(builder.compile(&c)?.with_binding(
        identity,
        Arc::new(PackServices {
            realm: pack.id.clone(),
            values,
        }),
    ))
}
