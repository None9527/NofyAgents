//! Portable business-event authority. An installed factory binds the owner to
//! its definition, never to an owner supplied inside untrusted configuration.
use super::*;
use serde_json::json;
use std::collections::BTreeMap;

#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct Config {
    events: Vec<ConfiguredEvent>,
}
#[derive(Deserialize)]
#[serde(deny_unknown_fields)]
struct ConfiguredEvent {
    name: String,
    payload_schema: Value,
    #[serde(default)]
    deny: bool,
    #[serde(default)]
    pause: bool,
    #[serde(default)]
    patch: bool,
    #[serde(default)]
    stop: bool,
}
pub struct EventProducerFactory;
impl ModuleFactory for EventProducerFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        ModuleDescriptor {
            factory: "event.producer".into(),
            revision: "1".into(),
            kind: ModuleKind::EventProducer,
            config_schema: json!({"type":"object","additionalProperties":false,"required":["events"],"properties":{"events":{"type":"array","minItems":1,"maxItems":128,"items":{
                "type":"object","additionalProperties":false,"required":["name","payload_schema"],"properties":{
                    "name":{"type":"string","minLength":1,"maxLength":256},"payload_schema":{"type":["object","boolean"]},
                    "deny":{"type":"boolean"},"pause":{"type":"boolean"},"patch":{"type":"boolean"},"stop":{"type":"boolean"}
                }
            }}}}),
            input_schema: None,
            output_schema: None,
            dependencies: Default::default(),
            required_capabilities: Default::default(),
        }
    }
    fn build(
        &self,
        _: &Value,
        _: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        Err(Error::Composition(
            "event.producer requires module build context".into(),
        ))
    }
    fn build_with_context(
        &self,
        config: &Value,
        _: &BTreeMap<String, ModuleInstance>,
        context: &ModuleBuildContext<'_>,
    ) -> Result<ModuleInstance, Error> {
        let config: Config = serde_json::from_value(config.clone())
            .map_err(|e| Error::Composition(format!("event.producer: {e}")))?;
        let owner = context.definition().reference.clone();
        let runtime = EventCatalog::runtime();
        let mut events = Vec::with_capacity(config.events.len());
        for event in config.events {
            if runtime.get(&event.name).is_some() {
                return Err(Error::Composition(
                    "event.producer cannot own runtime lifecycle events".into(),
                ));
            }
            events.push(EventDeclaration {
                owner: owner.clone(),
                name: event.name,
                payload_schema: event.payload_schema,
                deny: event.deny,
                pause: event.pause,
                patch: event.patch,
                stop: event.stop,
            });
        }
        Ok(ModuleInstance::EventProducer(Arc::new(EventProducer::new(
            owner, events,
        )?)))
    }
}

pub struct OwnedHookFactory;
impl ModuleFactory for OwnedHookFactory {
    fn descriptor(&self) -> ModuleDescriptor {
        ModuleDescriptor {
            factory: "hook.owned_subscription".into(),
            revision: "1".into(),
            kind: ModuleKind::Hook,
            config_schema: json!({"type":"object","additionalProperties":false,"required":["event"],"properties":{
                "event":{"type":"string","minLength":1,"maxLength":256},"priority":{"type":"integer"},
                "timeout_ms":{"type":"integer","minimum":1,"maximum":600000},"failure":{"enum":["open","closed"]},
                "matches":{"type":["object","null"],"additionalProperties":false,"required":["pointer","equals"],"properties":{"pointer":{"type":"string"},"equals":{}}}
            }}),
            input_schema: None,
            output_schema: None,
            required_capabilities: Default::default(),
            dependencies: BTreeMap::from([
                ("handler".into(), ModuleKind::HookHandler),
                ("producer".into(), ModuleKind::EventProducer),
            ]),
        }
    }
    fn build(
        &self,
        config: &Value,
        dependencies: &BTreeMap<String, ModuleInstance>,
    ) -> Result<ModuleInstance, Error> {
        let rule: HookRule = serde_json::from_value(config.clone())
            .map_err(|e| Error::Composition(format!("hook.owned_subscription: {e}")))?;
        let Some(ModuleInstance::EventProducer(producer)) = dependencies.get("producer") else {
            return Err(Error::Composition(
                "owned hook requires an event producer".into(),
            ));
        };
        let Some(ModuleInstance::HookHandler(handler)) = dependencies.get("handler") else {
            return Err(Error::Composition("owned hook requires a handler".into()));
        };
        let declaration = producer
            .catalog()
            .get(&rule.event)
            .cloned()
            .ok_or_else(|| {
                Error::Composition("hook event is not declared by its producer dependency".into())
            })?;
        let identity = serde_json::to_string(&("owned-hook-v1", config, &declaration))
            .map_err(|e| Error::Composition(e.to_string()))?;
        Ok(ModuleInstance::Hook(Arc::new(HookRegistration::new(
            identity,
            declaration,
            rule,
            handler.clone(),
        )?)))
    }
}
