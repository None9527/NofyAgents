//! Explicit model persistence independent of quota policy. The installed
//! checkpointer owns durability; this binding never manufactures a budget.
use crate::{Error, RunContext, context::ContextBinding, registry::*};
use serde_json::{Value, json};
use std::{
    collections::{BTreeMap, BTreeSet},
    sync::Arc,
};

#[derive(Clone)]
pub(crate) struct JournalModels;
/// Whether the caller explicitly installed model journaling. Actual sampling
/// still verifies its original recovery/checkpointer capability before IO.
pub fn enabled(context: &RunContext) -> bool {
    context.capabilities.get::<JournalModels>().is_some()
}
pub struct ModelJournalBinding;
impl ContextBinding for ModelJournalBinding {
    fn bind(&self, context: &mut RunContext) -> Result<(), Error> {
        context.capabilities.insert(JournalModels);
        Ok(())
    }
}
pub struct ModelJournalFactory;
impl ModuleFactory for ModelJournalFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        ModuleDescriptor {
            factory: "binding.model_journal".into(),
            revision: "1".into(),
            kind: ModuleKind::Binding,
            config_schema: json!({"type":"object","additionalProperties":false}),
            input_schema: None,
            output_schema: None,
            required_capabilities: BTreeSet::new(),
            dependencies: BTreeMap::new(),
        }
    }
    fn build(
        &self,
        config: &Value,
        _: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        if !config.as_object().is_some_and(|o| o.is_empty()) {
            return Err(Error::Composition(
                "model journal binding requires empty config".into(),
            ));
        }
        Ok(ModuleInstance::Binding(Arc::new(ModelJournalBinding)))
    }
}
