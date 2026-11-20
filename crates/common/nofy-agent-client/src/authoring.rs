//! Transport-independent SDK operations used by an embedded Agent.
use crate::{Envelope, OperationView, Result, guides, operation, schema};
use serde_json::{Value, json};

pub fn operation_schema(view: OperationView, name: &str) -> Result<Envelope> {
    view.require(name)?;
    let descriptor = operation(name)?;
    Ok(Envelope::ok(
        "schema",
        json!({"operation":name,"input":schema(&descriptor.input_schema)?,"output":schema(&descriptor.output_schema)?,"guide":guides::with_cli(guides::operation_guide(descriptor)?)}),
    ))
}

pub fn module_template(input: &Value) -> Result<Envelope> {
    crate::validate("module.template", input)?;
    crate::module_template::module_template(input)
}
