//! Skills select an immutable scope resource per declaration, never per registry.
use super::*;
use crate::skills::{SkillsFactory, SubstitutionLimits};

#[derive(Default)]
pub struct DeclaredSkillsFactory {
    limits: Option<SubstitutionLimits>,
}
impl DeclaredSkillsFactory {
    pub fn new() -> Self {
        Self::default()
    }
    pub fn with_substitution_limits(mut self, limits: SubstitutionLimits) -> Self {
        self.limits = Some(limits);
        self
    }
    fn base(&self) -> SkillsFactory {
        self.limits.map_or_else(SkillsFactory::tools, |limits| {
            SkillsFactory::tools().with_substitution_limits(limits)
        })
    }
    fn split(&self, config: &Value) -> Result<(Value, String), Error> {
        nofy_agent_runtime::settings::validate_json_value(
            &self.descriptor().config_schema,
            config,
        )?;
        let mut frozen = config.clone();
        let name = frozen
            .as_object_mut()
            .and_then(|fields| fields.remove("scope"))
            .and_then(|v| v.as_str().map(str::to_owned))
            .ok_or_else(|| invalid("skills require an explicit scope resource slot"))?;
        if name.is_empty() || name.len() > 128 || name.chars().any(char::is_control) {
            return Err(invalid("invalid scope resource slot"));
        }
        Ok((frozen, name))
    }
}
impl ModuleFactory for DeclaredSkillsFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        let mut descriptor = self.base().descriptor();
        descriptor.factory = "tool.skills_scoped".into();
        descriptor.revision = format!("2:artifact-scope:{}", descriptor.revision);
        descriptor.config_schema["properties"]["scope"] =
            json!({"type":"string","minLength":1,"maxLength":128});
        descriptor.config_schema["required"]
            .as_array_mut()
            .expect("skills required fields")
            .push(json!("scope"));
        descriptor
    }
    fn config_dependencies(&self, config: &Value) -> Result<BTreeMap<String, ModuleKind>, Error> {
        let (frozen, scope) = self.split(config)?;
        let mut dependencies = self.base().config_dependencies(&frozen)?;
        if dependencies
            .insert(scope, ModuleKind::Resource)
            .is_some_and(|kind| kind != ModuleKind::Resource)
        {
            return Err(invalid(
                "scope resource conflicts with another skill dependency",
            ));
        }
        Ok(dependencies)
    }
    fn build(
        &self,
        config: &Value,
        dependencies: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        let (frozen, scope) = self.split(config)?;
        let Some(ModuleInstance::Resource(resource)) = dependencies.get(&scope) else {
            return Err(invalid("skills require their declared scope resource"));
        };
        let compiler = resource
            .get::<Compiler>()
            .ok_or_else(|| invalid("skill scope resource has another type"))?;
        // The scope remains a declared registry dependency, but is compiler
        // input rather than a child execution module. Keep that ABI strict.
        let mut execution_dependencies = dependencies.clone();
        execution_dependencies.remove(&scope);
        self.base()
            .with_scope_compiler(compiler)
            .build(&frozen, &execution_dependencies)
    }
}
