//! Declarative selection narrows the same inherited Policy boundary.
use super::*;
use crate::registry::*;
use serde_json::{Value, json};
use std::collections::{BTreeMap, BTreeSet};
#[derive(Clone, Copy, Debug, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
#[derive(Default)]
enum Action {
    Allow,
    Deny,
    #[default]
    Ask,
}
fn any() -> Value {
    Value::Bool(true)
}
#[derive(Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct CommandRule {
    pointer: String,
    prefixes: Vec<Vec<String>>,
}
#[derive(Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
struct Rule {
    id: String,
    action: Action,
    #[serde(default)]
    category: String,
    tools: Vec<String>,
    #[serde(default = "any")]
    arguments_schema: Value,
    #[serde(default)]
    command: Option<CommandRule>,
}
#[derive(Clone, Default, Serialize, Deserialize)]
#[serde(default, deny_unknown_fields)]
struct Config {
    default: Action,
    unknown_command: Action,
    rules: Vec<Rule>,
}
/// The compiled policy supplies this private hint; tool arguments cannot.
#[derive(Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub(crate) struct RuleApprovalHint {
    pub policy_id: String,
    pub rule_key: String,
    pub summary: Value,
}
pub struct ToolRulesFactory;
struct Rules {
    config: Config,
    identity: String,
    approval: Option<Arc<dyn Policy>>,
}
fn error(message: impl std::fmt::Display) -> Error {
    Error::Composition(format!("policy.tool_rules: {message}"))
}
fn parse(value: &Value) -> Result<Config, Error> {
    if serde_json::to_vec(value).map_err(error)?.len() > 262144 {
        return Err(error("configuration exceeds 256 KiB"));
    }
    let config: Config = serde_json::from_value(value.clone()).map_err(error)?;
    if config.rules.len() > 256 {
        return Err(error("more than 256 rules"));
    }
    let mut ids = BTreeSet::new();
    for rule in &config.rules {
        if rule.id.is_empty()
            || rule.id.len() > 128
            || rule.id.chars().any(char::is_control)
            || !ids.insert(&rule.id)
            || rule.category.len() > 128
            || rule.tools.is_empty()
            || rule.tools.len() > 128
        {
            return Err(error("invalid rule identity or tool selection"));
        }
        for pattern in &rule.tools {
            let prefix = pattern.strip_suffix('*').unwrap_or(pattern);
            if pattern.is_empty()
                || pattern.len() > 128
                || prefix.contains('*')
                || (!prefix.is_empty() && nofy_tool_protocol::ToolId::new(prefix).is_err())
            {
                return Err(error(
                    "tool patterns support exact names or a trailing star",
                ));
            }
        }
        crate::settings::validate_json_schema(&rule.arguments_schema)?;
        if let Some(command) = &rule.command {
            if !command.pointer.is_empty() && !command.pointer.starts_with('/') {
                return Err(error("command pointer must be JSON Pointer"));
            }
            if command.pointer.len() > 1024
                || command.prefixes.is_empty()
                || command.prefixes.len() > 128
                || command.prefixes.iter().any(|p| {
                    p.is_empty()
                        || p.len() > 128
                        || p.iter()
                            .any(|v| v.is_empty() || v.len() > 4096 || v.contains('\0'))
                })
            {
                return Err(error("invalid static command prefixes"));
            }
        }
    }
    Ok(config)
}
fn schema() -> Value {
    json!({"type":"object","additionalProperties":false,"properties":{
    "default":{"enum":["allow","deny","ask"],"default":"ask"},
    "unknown_command":{"enum":["allow","deny","ask"],"default":"ask"},
    "rules":{"type":"array","maxItems":256,"items":{"type":"object","additionalProperties":false,"required":["id","action","tools"],"properties":{
        "id":{"type":"string","minLength":1,"maxLength":128},"category":{"type":"string","maxLength":128},"action":{"enum":["allow","deny","ask"]},
        "tools":{"type":"array","minItems":1,"maxItems":128,"items":{"type":"string","minLength":1,"maxLength":128}},"arguments_schema":{"type":["object","boolean"]},
        "command":{"type":"object","additionalProperties":false,"required":["pointer","prefixes"],"properties":{"pointer":{"type":"string","maxLength":1024},"prefixes":{"type":"array","minItems":1,"maxItems":128,"items":{"type":"array","minItems":1,"maxItems":128,"items":{"type":"string","minLength":1,"maxLength":4096}}}}}
    }}}}})
}
impl ToolRulesFactory {
    fn instantiate(
        &self,
        value: &Value,
        deps: &BTreeMap<String, ModuleInstance>,
        identity: String,
    ) -> Result<ModuleInstance, Error> {
        let config = parse(value)?;
        let needs = config.default == Action::Ask
            || config.rules.iter().any(|r| r.action == Action::Ask)
            || (config.unknown_command == Action::Ask
                && config.rules.iter().any(|r| r.command.is_some()));
        let approval = match deps.get("approval") {
            Some(ModuleInstance::Policy(policy)) => Some(policy.clone()),
            None if !needs => None,
            _ => {
                return Err(error(
                    "ask requires its explicit approval Policy dependency",
                ));
            }
        };
        Ok(ModuleInstance::Policy(Arc::new(Rules {
            config,
            identity,
            approval,
        })))
    }
}
impl ModuleFactory for ToolRulesFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        ModuleDescriptor {
            factory: "policy.tool_rules".into(),
            revision: "1".into(),
            kind: ModuleKind::Policy,
            config_schema: schema(),
            input_schema: None,
            output_schema: None,
            dependencies: Default::default(),
            required_capabilities: Default::default(),
        }
    }
    fn config_dependencies(&self, value: &Value) -> Result<BTreeMap<String, ModuleKind>, Error> {
        let config = parse(value)?;
        Ok(
            if config.default == Action::Ask
                || config.rules.iter().any(|r| r.action == Action::Ask)
                || (config.unknown_command == Action::Ask
                    && config.rules.iter().any(|r| r.command.is_some()))
            {
                BTreeMap::from([("approval".into(), ModuleKind::Policy)])
            } else {
                BTreeMap::new()
            },
        )
    }
    fn build(
        &self,
        value: &Value,
        deps: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        self.instantiate(
            value,
            deps,
            crate::system::content_digest(&("tool-rules-v1", value))?,
        )
    }
    fn build_with_context(
        &self,
        value: &Value,
        deps: &BTreeMap<String, ModuleInstance>,
        context: &ModuleBuildContext<'_>,
    ) -> Result<ModuleInstance, Error> {
        self.instantiate(
            value,
            deps,
            crate::system::content_digest(&("tool-rules-v1", context.definition()))?,
        )
    }
}
impl Rule {
    fn matches(&self, call: &ToolCall) -> Result<(bool, bool), Error> {
        if !self.tools.iter().any(|pattern| {
            pattern
                .strip_suffix('*')
                .map_or(pattern == &call.name, |prefix| {
                    call.name.starts_with(prefix)
                })
        }) {
            return Ok((false, false));
        }
        if crate::settings::validate_json_value(&self.arguments_schema, &call.arguments).is_err() {
            return Ok((false, false));
        }
        if let Some(rule) = &self.command {
            let Some(value) = call.arguments.pointer(&rule.pointer) else {
                return Ok((false, true));
            };
            let analysis = super::command::analyze_command(value)?;
            let unknown = analysis.dynamic || analysis.redirects || analysis.commands.is_empty();
            let prefix = |command: &Vec<String>| {
                rule.prefixes
                    .iter()
                    .any(|prefix| command.starts_with(prefix))
            };
            if self.action == Action::Deny && analysis.commands.iter().any(prefix) {
                return Ok((true, unknown));
            }
            if unknown {
                return Ok((false, true));
            }
            if !analysis.commands.iter().all(prefix) {
                return Ok((false, false));
            }
        }
        Ok((true, false))
    }
}
#[async_trait]
impl Policy for Rules {
    async fn admit(
        &self,
        call: &ToolCall,
        state: &RunState,
        context: &RunContext,
    ) -> Result<Admission, Error> {
        let mut allow = false;
        let mut ask = None;
        let mut unknown = false;
        for rule in &self.config.rules {
            let (matched, dynamic) = rule.matches(call)?;
            unknown |= dynamic;
            if !matched {
                continue;
            }
            match rule.action {
                Action::Deny => {
                    return Ok(Admission::Deny(format!(
                        "denied by permission rule {} ({})",
                        rule.id, rule.category
                    )));
                }
                Action::Ask => {
                    if ask.is_none() {
                        ask = Some(rule);
                    }
                }
                Action::Allow => allow = true,
            }
        }
        let action = if unknown && self.config.unknown_command == Action::Deny {
            Action::Deny
        } else if ask.is_some() || (unknown && self.config.unknown_command == Action::Ask) {
            Action::Ask
        } else if allow || (unknown && self.config.unknown_command == Action::Allow) {
            Action::Allow
        } else {
            self.config.default
        };
        match action {
            Action::Allow => Ok(Admission::Allow),
            Action::Deny => Ok(Admission::Deny(
                "tool arguments are outside the declared permission rules".into(),
            )),
            Action::Ask => {
                let (rule_key, summary) = if let Some(rule) = ask {
                    (
                        crate::system::content_digest(&("matched-rule", &rule.id))?,
                        json!({"match":"declared_rule","rule":rule}),
                    )
                } else {
                    (
                        crate::system::content_digest(&(
                            "exact-tool-arguments",
                            &call.name,
                            &call.arguments,
                        ))?,
                        json!({"match":"same_tool_and_arguments","tool":call.name}),
                    )
                };
                let mut context = context.clone();
                context.capabilities.insert(RuleApprovalHint {
                    policy_id: self.identity.clone(),
                    rule_key,
                    summary,
                });
                self.approval
                    .as_ref()
                    .ok_or_else(|| error("approval Policy is unavailable"))?
                    .admit(call, state, &context)
                    .await
            }
        }
    }
}
