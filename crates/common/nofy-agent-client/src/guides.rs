//! Machine-readable assembly instructions over the same public contracts.
//! Guides describe calls; they never authorize or execute a recipe.
mod factory;
mod operation;
mod preset;
use crate::*;
pub(crate) use factory::{factory_guide, package_guide};
pub(crate) use operation::{bootstrap, operation_guide, recovery};

/// Name the CLI command next to every MCP tool a guide mentions, so one guide
/// serves both interfaces. A call's `arguments` are also the complete JSON input
/// of that command (`--input FILE`). Applied once, to the finished guide, because
/// the calls are built in many places.
pub(crate) fn with_cli(mut value: Value) -> Value {
    fn walk(node: &mut Value) {
        match node {
            Value::Object(map) => {
                if map.contains_key("tool") && !map.contains_key("cli") {
                    let cli = map
                        .get("operation")
                        .and_then(Value::as_str)
                        .map(str::to_owned)
                        .or_else(|| {
                            let tool = map.get("tool")?.as_str()?;
                            OPERATIONS
                                .iter()
                                .find(|o| o.mcp_tool.as_deref() == Some(tool))
                                .map(|o| o.operation.clone())
                        })
                        .and_then(|name| {
                            OPERATIONS
                                .iter()
                                .find(|o| o.operation == name)
                                .map(|o| o.cli.clone())
                        });
                    if let Some(cli) = cli {
                        map.insert("cli".into(), json!(cli));
                    }
                }
                map.values_mut().for_each(walk);
            }
            Value::Array(items) => items.iter_mut().for_each(walk),
            _ => {}
        }
    }
    walk(&mut value);
    value
}
pub(crate) use preset::preset_guide;
use serde_json::{Value, json};

fn base(kind: &str, name: &str, summary: &str) -> Value {
    json!({"format":"nofy.assembly-guide/v1","subject":{"kind":kind,"name":name},"summary":summary,
        "availability":{"status":"requires_configuration","reason":"Inspect current kernel capabilities and satisfy the declared prerequisites."},
        "slots":[],"prerequisites":[],"examples":[],"steps":[],"pitfalls":[],"recovery":[]})
}
fn step(id: &str, operation: &str, arguments: Value, outcome: &str) -> Value {
    let tool = crate::operation(operation)
        .ok()
        .and_then(|o| o.mcp_tool.as_deref());
    json!({"id":id,"operation":operation,"tool":tool,"arguments":arguments,"expected_outcome":outcome})
}

impl Engine {
    pub(crate) async fn schema_result(&self, input: &Value) -> Result<Envelope> {
        if let Some(name) = input.get("operation").and_then(Value::as_str) {
            let descriptor = crate::operation(name)?;
            return Ok(Envelope::ok(
                "schema",
                json!({"operation":name,"input":schema(&descriptor.input_schema)?,"output":schema(&descriptor.output_schema)?,"guide":with_cli(operation_guide(descriptor)?)}),
            ));
        }
        if let Some(id) = input.get("preset").and_then(Value::as_str) {
            let source = self
                .template_source(&json!({"preset":id,"version":input["version"]}))
                .await?;
            return Ok(Envelope::ok("schema", with_cli(preset_guide(id, &source)?)));
        }
        if let Some(package) = input.get("package") {
            let package = self.package_view(package).await?;
            return Ok(Envelope::ok(
                "schema",
                json!({"package":package,"guide":with_cli(package_guide(&package))}),
            ));
        }
        let name = text(input, "factory")?;
        let catalog = self.client.factories().await?;
        let descriptor = catalog["factories"]
            .as_array()
            .into_iter()
            .flatten()
            .find(|f| f["factory"] == name)
            .cloned()
            .ok_or_else(|| {
                Error::new(
                    "not_found",
                    "factory is not installed; use describe to choose an installed factory",
                )
            })?;
        let configured = if let Some(config) = input.get("config_json") {
            let config: Value = serde_json::from_str(
                config
                    .as_str()
                    .ok_or_else(|| Error::new("local_input", "config_json must be JSON text"))?,
            )?;
            Some(
                self.client
                    .send(
                        "POST",
                        &["api", "v1", "modules", "dependencies"],
                        &json!({"factory":name,"config":config}),
                    )
                    .await?
                    .value()?,
            )
        } else {
            None
        };
        let guide = with_cli(factory_guide(
            &descriptor,
            configured.as_ref(),
            catalog.get("development"),
        ));
        Ok(Envelope::ok(
            "schema",
            json!({"descriptor":descriptor,"configured_dependencies":configured,"kernel_capabilities":catalog.get("development"),"guide":guide}),
        ))
    }
}
