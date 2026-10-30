//! Pure composite scope: declared dependencies and mandatory host floors.
use super::*;
pub struct ModuleBuildContext<'a> {
    registry: &'a ModuleRegistry,
    definition: &'a ModuleDefinition,
    snapshot: &'a [ResolvedModule],
}
impl<'a> ModuleBuildContext<'a> {
    pub(crate) fn new(
        registry: &'a ModuleRegistry,
        definition: &'a ModuleDefinition,
        snapshot: &'a [ResolvedModule],
    ) -> Self {
        Self {
            registry,
            definition,
            snapshot,
        }
    }
    pub fn definition(&self) -> &ModuleDefinition {
        self.definition
    }
    fn closure(&self) -> Result<BTreeSet<ModuleRef>, Error> {
        let mut pending = self
            .definition
            .dependencies
            .values()
            .cloned()
            .chain(self.registry.required_policies.iter().cloned())
            .chain(self.registry.required_governance.iter().cloned())
            .collect::<Vec<_>>();
        let mut refs = BTreeSet::new();
        while let Some(reference) = pending.pop() {
            if reference == self.definition.reference {
                return Err(Error::Composition(
                    "composite resource and required floor form a dependency cycle".into(),
                ));
            }
            if !refs.insert(reference.clone()) {
                continue;
            }
            if refs.len() > 1024 {
                return Err(Error::Composition(
                    "composite dependency closure exceeds 1024 modules".into(),
                ));
            }
            let definition = self.registry.definitions.get(&reference).ok_or_else(|| {
                Error::Composition(format!("composite dependency missing: {}", reference.key()))
            })?;
            pending.extend(definition.dependencies.values().cloned());
        }
        Ok(refs)
    }
    /// Pure factories reconstruct their original definitions/descriptors. No
    /// live instance is disguised as a new empty-config native factory.
    pub fn dependency_registry(&self) -> Result<ModuleRegistry, Error> {
        let mut registry = ModuleRegistry {
            definitions: BTreeMap::new(),
            factories: self.registry.factories.clone(),
            available_capabilities: self.registry.available_capabilities.clone(),
            required_policies: self.registry.required_policies.clone(),
            required_governance: self.registry.required_governance.clone(),
        };
        for reference in self.closure()? {
            registry.define(self.registry.definitions[&reference].clone())?;
        }
        Ok(registry)
    }
    pub fn verify_dependencies(&self, actual: &[ResolvedModule]) -> Result<(), Error> {
        let refs = self.closure()?;
        let expected = self
            .snapshot
            .iter()
            .filter(|m| refs.contains(&m.definition.reference))
            .map(|m| (&m.definition.reference, m))
            .collect::<BTreeMap<_, _>>();
        for module in actual {
            if let Some(previous) = expected.get(&module.definition.reference)
                && crate::system::content_digest(module)?
                    != crate::system::content_digest(previous)?
            {
                return Err(Error::Composition(format!(
                    "composite dependency changed while binding: {}",
                    module.definition.reference.key()
                )));
            }
        }
        Ok(())
    }
}
