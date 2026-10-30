use super::*;

/// A narrowing scope, separate from the required host permission floor.
pub trait SkillToolScope: Policy {
    fn identity(&self) -> &str;
    fn permits_name(&self, name: &str) -> bool;
    fn validate_catalog(&self, catalog: &ToolCatalog) -> Result<(), Error>;
}
/// Host-installed rule vocabulary. Implementations must compile without IO.
pub trait SkillScopeCompiler: Send + Sync {
    fn identity(&self) -> &str;
    fn compile(&self, rules: &[String]) -> Result<Arc<dyn SkillToolScope>, Error>;
}
pub struct ExactSkillScopeCompiler;
struct ExactScope {
    names: BTreeSet<String>,
    identity: String,
}
impl SkillScopeCompiler for ExactSkillScopeCompiler {
    fn identity(&self) -> &str {
        "exact-tool-scope:1"
    }
    fn compile(&self, rules: &[String]) -> Result<Arc<dyn SkillToolScope>, Error> {
        if rules.len() > 1024 || rules.iter().map(String::len).sum::<usize>() > 65536 {
            return Err(Error::Composition(
                "skill tool scope exceeds 1024 names/64 KiB".into(),
            ));
        }
        let mut names = BTreeSet::new();
        for name in rules {
            nofy_tool_protocol::ToolId::new(name).map_err(|e|Error::Composition(format!("exact skill tool scope: {e}; install the native rule compiler for permission expressions")))?;
            if !names.insert(name.clone()) {
                return Err(Error::Composition("duplicate allowed tool in skill".into()));
            }
        }
        let identity = format!(
            "exact:{:x}",
            Sha256::digest(
                serde_json::to_vec(&names).map_err(|e| Error::Composition(e.to_string()))?
            )
        );
        Ok(Arc::new(ExactScope { names, identity }))
    }
}
#[async_trait::async_trait]
impl Policy for ExactScope {
    async fn admit(
        &self,
        call: &ToolCall,
        _: &RunState,
        _: &RunContext,
    ) -> Result<Admission, Error> {
        Ok(if self.permits_name(&call.name) {
            Admission::Allow
        } else {
            Admission::Deny(format!("tool outside skill scope: {}", call.name))
        })
    }
}
impl SkillToolScope for ExactScope {
    fn identity(&self) -> &str {
        &self.identity
    }
    fn permits_name(&self, name: &str) -> bool {
        self.names.contains(name)
    }
    fn validate_catalog(&self, catalog: &ToolCatalog) -> Result<(), Error> {
        if let Some(missing) = self.names.iter().find(|name| catalog.get(name).is_none()) {
            return Err(Error::Composition(format!(
                "skill requires unavailable tool: {missing}"
            )));
        }
        Ok(())
    }
}
