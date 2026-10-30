//! Versioned, instance-scoped configuration factories. Building a module is
//! synchronous and must be free of IO; connections are installed by the host.
mod build;
mod instances;
pub use build::ModuleBuildContext;
mod prompt;
use crate::Error;
pub use instances::{ModuleInstance, ResourceHandle};
pub use prompt::{PromptFactory, StaticPromptFactory};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::{
    collections::{BTreeMap, BTreeSet},
    sync::Arc,
};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ModuleKind {
    Resource,
    Model,
    Prompt,
    ToolPack,
    Policy,
    ToolSource,
    ContextSource,
    ContextPolicy,
    Governance,
    Stage,
    StageSource,
    Recipe,
    Middleware,
    Checkpointer,
    Binding,
    Hook,
    HookHandler,
    EventProducer,
}

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ModuleRef {
    pub id: String,
    pub version: String,
}

impl ModuleRef {
    pub fn new(id: impl Into<String>, version: impl Into<String>) -> Self {
        Self {
            id: id.into(),
            version: version.into(),
        }
    }
    pub(crate) fn key(&self) -> String {
        // A tuple encoding avoids ambiguities in IDs containing '@' or ':'.
        serde_json::to_string(self).expect("module reference contains only strings")
    }
    fn validate(&self) -> Result<(), Error> {
        if self.id.trim().is_empty() || self.version.trim().is_empty() {
            return Err(Error::Composition(
                "module id/version must not be empty".into(),
            ));
        }
        Ok(())
    }
}

/// A factory revision identifies its implementation, not just its JSON schema.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ModuleDescriptor {
    pub factory: String,
    pub revision: String,
    pub kind: ModuleKind,
    pub config_schema: Value,
    #[serde(default)]
    pub input_schema: Option<Value>,
    #[serde(default)]
    pub output_schema: Option<Value>,
    #[serde(default)]
    pub required_capabilities: BTreeSet<String>,
    #[serde(default)]
    pub dependencies: BTreeMap<String, ModuleKind>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct ModuleDefinition {
    pub reference: ModuleRef,
    pub factory: String,
    pub config: Value,
    #[serde(default)]
    pub dependencies: BTreeMap<String, ModuleRef>,
}

/// Factories may only consume the declared dependencies. Runtime credentials,
/// processes and connections belong to explicitly installed host capabilities.
pub trait ModuleFactory: Send + Sync {
    fn descriptor(&self) -> ModuleDescriptor;
    /// Pure configuration-derived dependencies, validated before any build.
    /// Fixed descriptor dependencies cannot be replaced or removed.
    fn config_dependencies(&self, _config: &Value) -> Result<BTreeMap<String, ModuleKind>, Error> {
        Ok(BTreeMap::new())
    }
    fn build(
        &self,
        config: &Value,
        dependencies: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error>;
    /// Optional pure composite compilation; existing factories keep build.
    fn build_with_context(
        &self,
        config: &Value,
        dependencies: &BTreeMap<String, ModuleInstance>,
        _context: &ModuleBuildContext<'_>,
    ) -> Result<ModuleInstance, Error> {
        self.build(config, dependencies)
    }
}

/// Hosts can expose an existing versioned implementation without a new factory
/// class. Config is strictly empty so settings are never silently ignored.
pub struct InstanceFactory {
    descriptor: ModuleDescriptor,
    instance: ModuleInstance,
}

impl InstanceFactory {
    pub fn new(
        factory: impl Into<String>,
        revision: impl Into<String>,
        instance: ModuleInstance,
    ) -> Self {
        Self {
            descriptor: ModuleDescriptor {
                factory: factory.into(),
                revision: revision.into(),
                kind: instance.kind(),
                config_schema: serde_json::json!({"type":"object","additionalProperties":false}),
                input_schema: None,
                output_schema: None,
                required_capabilities: BTreeSet::new(),
                dependencies: BTreeMap::new(),
            },
            instance,
        }
    }
}

impl ModuleFactory for InstanceFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        self.descriptor.clone()
    }
    fn build(
        &self,
        _: &Value,
        _: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        Ok(self.instance.clone())
    }
}

#[derive(Clone)]
struct FactoryEntry {
    descriptor: ModuleDescriptor,
    factory: Arc<dyn ModuleFactory>,
}

#[derive(Clone, Default)]
pub struct ModuleRegistry {
    factories: BTreeMap<String, FactoryEntry>,
    definitions: BTreeMap<ModuleRef, ModuleDefinition>,
    available_capabilities: BTreeSet<String>,
    required_policies: BTreeSet<ModuleRef>,
    required_governance: BTreeSet<ModuleRef>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResolvedModule {
    pub definition: ModuleDefinition,
    pub factory: ModuleDescriptor,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub resource_identity: Option<String>,
}

pub struct ResolvedModules {
    pub instances: BTreeMap<ModuleRef, ModuleInstance>,
    pub snapshot: Vec<ResolvedModule>,
}

impl ModuleRegistry {
    pub(crate) fn without_definitions(&self) -> Self {
        let mut copy = self.clone();
        copy.definitions.clear();
        copy
    }
    pub fn require_governance(&mut self, reference: ModuleRef) {
        self.required_governance.insert(reference);
    }
    pub fn required_governance(&self) -> &BTreeSet<ModuleRef> {
        &self.required_governance
    }
    /// Host configuration only. Client documents cannot remove this floor.
    /// Resolution and construction remain part of the pure compilation pass.
    pub fn require_policy(&mut self, reference: ModuleRef) {
        self.required_policies.insert(reference);
    }

    pub fn required_policies(&self) -> &BTreeSet<ModuleRef> {
        &self.required_policies
    }

    pub fn register_factory(&mut self, factory: Arc<dyn ModuleFactory>) -> Result<(), Error> {
        let descriptor = factory.descriptor();
        if descriptor.factory.trim().is_empty() || descriptor.revision.trim().is_empty() {
            return Err(Error::Composition(
                "factory id/revision must not be empty".into(),
            ));
        }
        crate::tools::validate_schema(&descriptor.config_schema)?;
        for schema in [&descriptor.input_schema, &descriptor.output_schema]
            .into_iter()
            .flatten()
        {
            crate::tools::validate_schema(schema)?;
        }
        if self.factories.contains_key(&descriptor.factory) {
            return Err(Error::Composition(format!(
                "duplicate factory: {}",
                descriptor.factory
            )));
        }
        self.factories.insert(
            descriptor.factory.clone(),
            FactoryEntry {
                descriptor,
                factory,
            },
        );
        Ok(())
    }

    pub fn descriptors(&self) -> Vec<ModuleDescriptor> {
        self.factories
            .values()
            .map(|entry| entry.descriptor.clone())
            .collect()
    }

    pub fn required_dependencies(
        &self,
        factory: &str,
        config: &Value,
    ) -> Result<BTreeMap<String, ModuleKind>, Error> {
        let entry = self
            .factories
            .get(factory)
            .ok_or_else(|| Error::Composition(format!("missing factory {factory}")))?;
        crate::settings::validate_json_value(&entry.descriptor.config_schema, config)?;
        let mut dependencies = entry.descriptor.dependencies.clone();
        for (name, kind) in entry.factory.config_dependencies(config)? {
            if name.trim().is_empty() || dependencies.insert(name.clone(), kind).is_some() {
                return Err(Error::Composition(format!(
                    "invalid or duplicate configuration dependency: {name}"
                )));
            }
        }
        Ok(dependencies)
    }

    pub fn definition(&self, reference: &ModuleRef) -> Option<&ModuleDefinition> {
        self.definitions.get(reference)
    }

    /// Declares an adapter installed by the host. This is not a run-time
    /// permission grant: final tool admission still runs for every invocation.
    pub fn provide_capability(&mut self, name: impl Into<String>) -> Result<(), Error> {
        let name = name.into();
        if name.trim().is_empty() {
            return Err(Error::Composition(
                "capability name must not be empty".into(),
            ));
        }
        self.available_capabilities.insert(name);
        Ok(())
    }

    pub fn define(&mut self, definition: ModuleDefinition) -> Result<(), Error> {
        definition.reference.validate()?;
        if self.definitions.contains_key(&definition.reference) {
            return Err(Error::Composition(format!(
                "module version already defined: {}",
                definition.reference.key()
            )));
        }
        self.definitions
            .insert(definition.reference.clone(), definition);
        Ok(())
    }

    /// Validate the entire reachable graph before invoking ANY factory. A bad
    /// dependency or cycle therefore cannot leave a partially built graph.
    pub fn resolve(&self, roots: &[ModuleRef]) -> Result<ResolvedModules, Error> {
        self.resolve_checked(roots, &[])
    }

    pub fn resolve_typed(
        &self,
        roots: &[(ModuleRef, ModuleKind)],
    ) -> Result<ResolvedModules, Error> {
        let references: Vec<_> = roots
            .iter()
            .map(|(reference, _)| reference.clone())
            .collect();
        self.resolve_checked(&references, roots)
    }

    fn resolve_checked(
        &self,
        roots: &[ModuleRef],
        expected: &[(ModuleRef, ModuleKind)],
    ) -> Result<ResolvedModules, Error> {
        let mut order = Vec::new();
        let mut marks = BTreeMap::new();
        for root in roots {
            self.visit(root, &mut marks, &mut order)?;
        }
        for (reference, kind) in expected {
            let actual = self.factories[&self.definitions[reference].factory]
                .descriptor
                .kind;
            if actual != *kind {
                return Err(Error::Composition(format!(
                    "agent slot expects {kind:?}, module {} is {actual:?}",
                    reference.key()
                )));
            }
        }
        let mut instances: BTreeMap<ModuleRef, ModuleInstance> = BTreeMap::new();
        let mut snapshot = Vec::new();
        for reference in order {
            let definition = &self.definitions[&reference];
            let entry = &self.factories[&definition.factory];
            let dependencies = definition
                .dependencies
                .iter()
                .map(|(name, reference)| (name.clone(), instances[reference].clone()))
                .collect();
            let instance = entry
                .factory
                .build_with_context(
                    &definition.config,
                    &dependencies,
                    &ModuleBuildContext::new(self, definition, &snapshot),
                )
                .map_err(|e| Error::Composition(format!("module {}: {e}", reference.key())))?;
            if instance.kind() != entry.descriptor.kind {
                return Err(Error::Composition(format!(
                    "factory returned wrong kind for {}",
                    reference.key()
                )));
            }
            snapshot.push(ResolvedModule {
                definition: definition.clone(),
                factory: entry.descriptor.clone(),
                resource_identity: match &instance {
                    ModuleInstance::Resource(resource) => Some(resource.identity().into()),
                    _ => None,
                },
            });
            instances.insert(reference, instance);
        }
        Ok(ResolvedModules {
            instances,
            snapshot,
        })
    }

    fn visit(
        &self,
        reference: &ModuleRef,
        marks: &mut BTreeMap<ModuleRef, bool>,
        order: &mut Vec<ModuleRef>,
    ) -> Result<(), Error> {
        reference.validate()?;
        match marks.get(reference) {
            Some(true) => return Ok(()),
            Some(false) => {
                return Err(Error::Composition(format!(
                    "module dependency cycle: {}",
                    reference.key()
                )));
            }
            None => {}
        }
        if marks.len() >= 1024 {
            return Err(Error::Composition(
                "module dependency graph exceeds 1024 modules".into(),
            ));
        }
        if marks.values().filter(|complete| !**complete).count() >= 128 {
            return Err(Error::Composition(
                "module dependency depth exceeds 128".into(),
            ));
        }
        let definition = self
            .definitions
            .get(reference)
            .ok_or_else(|| Error::Composition(format!("missing module: {}", reference.key())))?;
        let entry = self.factories.get(&definition.factory).ok_or_else(|| {
            Error::Composition(format!(
                "missing factory {} for {}",
                definition.factory,
                reference.key()
            ))
        })?;
        let validator = jsonschema::validator_for(&entry.descriptor.config_schema)
            .map_err(|e| Error::Composition(e.to_string()))?;
        let missing: Vec<_> = entry
            .descriptor
            .required_capabilities
            .difference(&self.available_capabilities)
            .collect();
        if !missing.is_empty() {
            return Err(Error::Composition(format!(
                "module {} requires uninstalled capabilities: {missing:?}",
                reference.key()
            )));
        }
        let errors: Vec<String> = validator
            .iter_errors(&definition.config)
            .map(|e| format!("{}: {e}", e.instance_path))
            .collect();
        if !errors.is_empty() {
            return Err(Error::Composition(format!(
                "module {} config: {}",
                reference.key(),
                errors.join("; ")
            )));
        }
        let dependency_kinds =
            self.required_dependencies(&definition.factory, &definition.config)?;
        if definition.dependencies.len() != dependency_kinds.len()
            || definition
                .dependencies
                .keys()
                .any(|key| !dependency_kinds.contains_key(key))
        {
            return Err(Error::Composition(format!(
                "module {} dependency names do not match factory",
                reference.key()
            )));
        }
        marks.insert(reference.clone(), false);
        for (name, dependency) in &definition.dependencies {
            self.visit(dependency, marks, order)?;
            let dep = &self.definitions[dependency];
            if self.factories[&dep.factory].descriptor.kind != dependency_kinds[name] {
                return Err(Error::Composition(format!(
                    "module {} dependency {name} has wrong kind",
                    reference.key()
                )));
            }
        }
        marks.insert(reference.clone(), true);
        order.push(reference.clone());
        Ok(())
    }
}
