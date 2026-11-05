use serde::{Deserialize, Serialize};
use serde_json::Value;

/// Validate an explicitly supplied local JSON schema without resolving remote
/// references or accessing host files.
pub fn validate_json_schema(schema: &Value) -> Result<(), crate::Error> {
    crate::schema::compiled(schema).map(|_| ())
}
pub fn validate_json_value(schema: &Value, value: &Value) -> Result<(), crate::Error> {
    crate::schema::compiled(schema)?
        .validate(value)
        .map_err(|e| crate::Error::Composition(format!("JSON value {}: {e}", e.instance_path)))
}

/// Application-supplied settings. No environment reads or implicit home paths.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(default)]
pub struct Settings {
    pub max_steps: usize,
    pub model: Value,
    #[serde(skip_serializing_if = "InputDelivery::is_default")]
    pub input_delivery: InputDelivery,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub scope_identity: Option<crate::IdentityScheme>,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            max_steps: 32,
            model: Value::Object(Default::default()),
            input_delivery: InputDelivery::default(),
            scope_identity: None,
        }
    }
}

#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum DeliveryMode {
    #[default]
    All,
    OneAtATime,
}
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(default, deny_unknown_fields)]
pub struct InputDelivery {
    pub steering: DeliveryMode,
    pub follow_up: DeliveryMode,
}
impl InputDelivery {
    pub fn is_default(&self) -> bool {
        self.steering == DeliveryMode::All && self.follow_up == DeliveryMode::All
    }
}

impl Settings {
    pub fn from_value(value: Value) -> Result<Self, crate::Error> {
        let settings: Self =
            serde_json::from_value(value).map_err(|e| crate::Error::Composition(e.to_string()))?;
        if settings.max_steps == 0 {
            return Err(crate::Error::Composition(
                "max_steps must be positive".into(),
            ));
        }
        Ok(settings)
    }
}

/// A caller-selected source; implementations may read files or remote values,
/// but the runtime never discovers or installs one implicitly.
#[async_trait::async_trait]
pub trait SettingsSource: Send + Sync {
    async fn load(&self, context: &crate::RunContext) -> Result<Value, crate::Error>;
}

pub struct StaticSettings(pub Value);
#[async_trait::async_trait]
impl SettingsSource for StaticSettings {
    async fn load(&self, _: &crate::RunContext) -> Result<Value, crate::Error> {
        Ok(self.0.clone())
    }
}

/// Ordered settings layers. Later values override earlier ones; objects merge
/// recursively, arrays/scalars/null replace. A source error aborts resolution.
/// Resolve before compile so component construction itself remains free of IO.
#[derive(Default)]
pub struct SettingsResolver {
    sources: Vec<std::sync::Arc<dyn SettingsSource>>,
}
impl SettingsResolver {
    pub fn new(sources: Vec<std::sync::Arc<dyn SettingsSource>>) -> Self {
        Self { sources }
    }
    pub async fn resolve(&self, context: &crate::RunContext) -> Result<Settings, crate::Error> {
        fn overlay(base: &mut Value, next: Value) {
            match (base, next) {
                (Value::Object(base), Value::Object(next)) => {
                    for (key, value) in next {
                        overlay(base.entry(key).or_insert(Value::Null), value);
                    }
                }
                (base, next) => *base = next,
            }
        }
        let mut values = Value::Object(Default::default());
        for source in &self.sources {
            let layer = source.load(context).await?;
            if !layer.is_object() {
                return Err(crate::Error::Composition(
                    "settings source must return an object".into(),
                ));
            }
            overlay(&mut values, layer);
        }
        Settings::from_value(values)
    }
}
