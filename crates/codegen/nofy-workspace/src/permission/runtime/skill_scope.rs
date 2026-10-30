//! Skill narrowing over the canonical rule parser and matcher. These allow
//! matches never grant the permission actor's authorization.
use super::*;
use crate::permission::{
    policy::{CompiledPolicy, tool_filter_matches},
    rules::{parse_permission_rule, tool_name_to_filter},
    types::{PermissionConfig, PermissionRule, RuleAction},
};
use nofy_agent::runtime::skills::{SkillScopeCompiler, SkillToolScope};
use nofy_agent_runtime::ToolCatalog;
use serde_json::json;
use sha2::{Digest, Sha256};
use std::collections::BTreeSet;

pub struct NofySkillScopeCompiler {
    aliases: BTreeMap<String, String>,
    cwd: PathBuf,
    identity: String,
}
impl NofySkillScopeCompiler {
    pub fn new(
        aliases: BTreeMap<String, String>,
        cwd: PathBuf,
        revision: &str,
    ) -> Result<Self, Error> {
        if !cwd.is_absolute() || revision.trim().is_empty() {
            return Err(Error::Composition(
                "native skill scope requires a workspace and revision".into(),
            ));
        }
        let identity = format!(
            "nofy-skill-scope:{:x}",
            Sha256::digest(
                serde_json::to_vec(&(&aliases, &cwd, revision))
                    .map_err(|e| Error::Composition(e.to_string()))?
            )
        );
        Ok(Self {
            aliases,
            cwd,
            identity,
        })
    }
}
struct NativeScope {
    aliases: BTreeMap<String, String>,
    cwd: PathBuf,
    rules: Vec<PermissionRule>,
    exact: BTreeSet<String>,
    policy: CompiledPolicy,
    rule_policies: Vec<CompiledPolicy>,
    identity: String,
}
impl SkillScopeCompiler for NofySkillScopeCompiler {
    fn identity(&self) -> &str {
        &self.identity
    }
    fn compile(&self, expressions: &[String]) -> Result<Arc<dyn SkillToolScope>, Error> {
        if expressions.len() > 1024 || expressions.iter().map(String::len).sum::<usize>() > 65536 {
            return Err(Error::Composition(
                "native skill scope exceeds 1024 rules/64 KiB".into(),
            ));
        }
        let mut rules = Vec::new();
        let mut exact = BTreeSet::new();
        for expression in expressions {
            let expression = expression.trim();
            if expression.contains('(')
                || expression.starts_with("mcp__")
                || expression == "*"
                || tool_name_to_filter(expression).is_some()
            {
                rules.push(
                    parse_permission_rule(expression, RuleAction::Allow)
                        .map_err(|e| Error::Composition(format!("skill tool rule: {e}")))?,
                );
            } else {
                nofy_tool_protocol::ToolId::new(expression)
                    .map_err(|e| Error::Composition(format!("skill tool name: {e}")))?;
                exact.insert(expression.into());
            }
        }
        let identity = format!(
            "{:x}",
            Sha256::digest(
                serde_json::to_vec(&(&self.identity, expressions))
                    .map_err(|e| Error::Composition(e.to_string()))?
            )
        );
        Ok(Arc::new(NativeScope {
            aliases: self.aliases.clone(),
            cwd: self.cwd.clone(),
            policy: CompiledPolicy::new(PermissionConfig::new(rules.clone())),
            rule_policies: rules
                .iter()
                .map(|rule| CompiledPolicy::new(PermissionConfig::new(vec![rule.clone()])))
                .collect(),
            rules,
            exact,
            identity,
        }))
    }
}
impl NativeScope {
    fn name_matches(&self, index: usize, name: &str) -> bool {
        let access = self.probe(name);
        if !tool_filter_matches(&access, &self.rules[index].tool) {
            return false;
        }
        if matches!(&access, AccessKind::MCPTool { .. }) {
            matches!(
                self.rule_policies[index].evaluate_with_cwd(&access, Some(&self.cwd)),
                Some(Decision::Allow)
            )
        } else {
            true
        }
    }
    fn probe(&self, name: &str) -> AccessKind {
        classify_access(
            name,
            &json!({"command":"","file_path":"","path":"","url":"","query":""}),
            &self.aliases,
            0,
        )
    }
    fn wrapper(&self, name: &str) -> bool {
        self.aliases.get(name).map(String::as_str).unwrap_or(name) == "use_tool"
    }
    fn effective_name<'a>(
        &self,
        name: &'a str,
        args: &'a serde_json::Value,
        depth: usize,
    ) -> &'a str {
        if self.wrapper(name)
            && depth < 8
            && let (Some(target), Some(input)) = (
                args.get("tool_name").and_then(serde_json::Value::as_str),
                args.get("tool_input"),
            )
        {
            return self.effective_name(target, input, depth + 1);
        }
        name
    }
}
#[async_trait::async_trait]
impl Policy for NativeScope {
    async fn admit(
        &self,
        call: &ToolCall,
        _: &RunState,
        context: &RunContext,
    ) -> Result<Admission, Error> {
        let name = self.effective_name(&call.name, &call.arguments, 0);
        let access = classify_access(&call.name, &call.arguments, &self.aliases, 0);
        let cwd = context.capabilities.get::<nofy_tool_runtime::Cwd>();
        let cwd = cwd
            .as_ref()
            .map_or(self.cwd.as_path(), |cwd| cwd.0.as_path());
        let allowed = self.exact.contains(name)
            || matches!(
                self.policy.evaluate_with_cwd(&access, Some(cwd)),
                Some(Decision::Allow)
            );
        Ok(if allowed {
            Admission::Allow
        } else {
            Admission::Deny(format!(
                "tool outside skill permission scope: {}",
                call.name
            ))
        })
    }
}
impl SkillToolScope for NativeScope {
    fn identity(&self) -> &str {
        &self.identity
    }
    fn permits_name(&self, name: &str) -> bool {
        self.exact.contains(name)
            || self.wrapper(name) && (!self.exact.is_empty() || !self.rules.is_empty())
            || self
                .rules
                .iter()
                .enumerate()
                .any(|(index, _)| self.name_matches(index, name))
    }
    fn validate_catalog(&self, catalog: &ToolCatalog) -> Result<(), Error> {
        let names = catalog.names();
        let wrapper = names.iter().any(|name| self.wrapper(name));
        for exact in &self.exact {
            if !wrapper && catalog.get(exact).is_none() {
                return Err(Error::Composition(format!(
                    "skill requires unavailable tool: {exact}"
                )));
            }
        }
        for (index, rule) in self.rules.iter().enumerate() {
            if !wrapper && !names.iter().any(|name| self.name_matches(index, name)) {
                return Err(Error::Composition(format!(
                    "skill rule has no available tool: {:?}",
                    rule.tool
                )));
            }
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use nofy_agent_runtime::ToolEntry;
    use nofy_tool_runtime::{ToolCallContext, ToolDispatch, ToolStream, TypedToolOutput};
    struct NoIo;
    #[async_trait::async_trait]
    impl ToolDispatch for NoIo {
        async fn call(
            &self,
            _: nofy_tool_protocol::ToolId,
            _: serde_json::Value,
            _: ToolCallContext,
        ) -> ToolStream<TypedToolOutput> {
            panic!("policy tests must not dispatch")
        }
    }
    fn compiler() -> NofySkillScopeCompiler {
        NofySkillScopeCompiler::new(
            BTreeMap::from([
                ("AliasRead".into(), "read_file".into()),
                ("AliasShell".into(), "shell".into()),
            ]),
            PathBuf::from("/workspace"),
            "1",
        )
        .unwrap()
    }
    fn call(name: &str, args: serde_json::Value) -> ToolCall {
        ToolCall {
            id: "call".into(),
            name: name.into(),
            arguments: args,
        }
    }
    fn catalog(names: &[&str]) -> ToolCatalog {
        let mut catalog = ToolCatalog::new();
        for name in names {
            catalog
                .insert(ToolEntry {
                    definition: nofy_tool_types::ToolDefinition::function(
                        *name,
                        Some(*name),
                        json!({"type":"object"}),
                    ),
                    dispatch: Arc::new(NoIo),
                })
                .unwrap();
        }
        catalog
    }
    #[tokio::test]
    async fn scoped_rules_reuse_path_bash_chain_and_mcp_matching() {
        let scope = compiler()
            .compile(&[
                "Read(src/**)".into(),
                "Bash(git:*)".into(),
                "mcp__github__*".into(),
            ])
            .unwrap();
        scope
            .validate_catalog(&catalog(&[
                "AliasRead",
                "AliasShell",
                "github__issue",
                "slack__post",
            ]))
            .unwrap();
        assert!(scope.permits_name("github__issue"));
        assert!(!scope.permits_name("slack__post"));
        let context = RunContext::new("thread", "run");
        let state = RunState::default();
        for (request, allowed) in [
            (call("AliasRead", json!({"file_path":"src/lib.rs"})), true),
            (call("AliasRead", json!({"file_path":"../secret"})), false),
            (call("AliasShell", json!({"command":"git status"})), true),
            (
                call("AliasShell", json!({"command":"git status && rm secret"})),
                false,
            ),
            (
                call(
                    "use_tool",
                    json!({"tool_name":"AliasShell","tool_input":{"command":"git diff"}}),
                ),
                true,
            ),
            (call("github__issue", json!({})), true),
            (call("slack__post", json!({})), false),
        ] {
            assert_eq!(
                matches!(
                    scope.admit(&request, &state, &context).await.unwrap(),
                    Admission::Allow
                ),
                allowed,
                "{}",
                request.name
            );
        }
    }
    #[tokio::test]
    async fn custom_names_are_exact_and_never_become_bare_path_globs() {
        let scope = compiler().compile(&["lookup".into()]).unwrap();
        let context = RunContext::new("t", "r");
        let state = RunState::default();
        scope
            .validate_catalog(&catalog(&["lookup", "read_file"]))
            .unwrap();
        assert!(matches!(
            scope
                .admit(&call("lookup", json!({})), &state, &context)
                .await
                .unwrap(),
            Admission::Allow
        ));
        assert!(matches!(
            scope
                .admit(
                    &call("read_file", json!({"file_path":"lookup"})),
                    &state,
                    &context
                )
                .await
                .unwrap(),
            Admission::Deny(_)
        ));
        assert!(compiler().compile(&["Bash(unclosed".into()]).is_err());
        let missing = compiler().compile(&["mcp__github__*".into()]).unwrap();
        assert!(
            missing
                .validate_catalog(&catalog(&["slack__post"]))
                .is_err()
        );
    }
}
