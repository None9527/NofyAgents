//! Versioned graph contracts. Validation is pure and precedes factory builds.
//! DAG scheduling is provided by the existing nofy-orchestra implementation.
use crate::{Error, registry::ModuleRef};
use nofy_orchestra::dag::{Dag, DagTask, OnFailPolicy};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::{BTreeMap, BTreeSet};

fn one() -> u32 {
    1
}
fn parallel() -> usize {
    4
}
fn any() -> Value {
    Value::Bool(true)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "from", rename_all = "snake_case", deny_unknown_fields)]
pub enum ValueBinding {
    Literal {
        value: Value,
    },
    Input {
        #[serde(default)]
        pointer: String,
    },
    Node {
        node: String,
        #[serde(default)]
        pointer: String,
    },
    Object {
        fields: BTreeMap<String, ValueBinding>,
    },
    Array {
        items: Vec<ValueBinding>,
    },
}
impl Default for ValueBinding {
    fn default() -> Self {
        Self::Input {
            pointer: String::new(),
        }
    }
}
impl ValueBinding {
    pub fn evaluate(&self, input: &Value, nodes: &BTreeMap<String, Value>) -> Result<Value, Error> {
        self.check(0, &mut 0, &mut BTreeSet::new())?;
        let result = self.eval(input, nodes)?;
        bounded_value(&result, 1024 * 1024, "binding output")?;
        Ok(result)
    }
    fn eval(&self, input: &Value, nodes: &BTreeMap<String, Value>) -> Result<Value, Error> {
        match self {
            Self::Literal { value } => Ok(value.clone()),
            Self::Input { pointer } => select(input, pointer),
            Self::Node { node, pointer } => select(
                nodes
                    .get(node)
                    .ok_or_else(|| invalid(format!("node output unavailable: {node}")))?,
                pointer,
            ),
            Self::Object { fields } => fields
                .iter()
                .map(|(k, v)| Ok((k.clone(), v.eval(input, nodes)?)))
                .collect::<Result<serde_json::Map<_, _>, Error>>()
                .map(Value::Object),
            Self::Array { items } => items
                .iter()
                .map(|v| v.eval(input, nodes))
                .collect::<Result<Vec<_>, _>>()
                .map(Value::Array),
        }
    }
    fn check(
        &self,
        depth: usize,
        count: &mut usize,
        refs: &mut BTreeSet<String>,
    ) -> Result<(), Error> {
        *count += 1;
        if depth > 32 || *count > 8192 {
            return Err(invalid("binding exceeds depth 32 or 8192 terms"));
        }
        match self {
            Self::Literal { value } => bounded_value(value, 1024 * 1024, "literal")?,
            Self::Input { pointer } => check_pointer(pointer)?,
            Self::Node { node, pointer } => {
                check_id(node)?;
                check_pointer(pointer)?;
                refs.insert(node.clone());
            }
            Self::Object { fields } => {
                for (k, v) in fields {
                    if k.len() > 4096 {
                        return Err(invalid("binding key too long"));
                    }
                    v.check(depth + 1, count, refs)?;
                }
            }
            Self::Array { items } => {
                for v in items {
                    v.check(depth + 1, count, refs)?;
                }
            }
        }
        Ok(())
    }
    fn references(&self) -> Result<BTreeSet<String>, Error> {
        let mut refs = BTreeSet::new();
        self.check(0, &mut 0, &mut refs)?;
        Ok(refs)
    }
}
fn select(input: &Value, pointer: &str) -> Result<Value, Error> {
    input
        .pointer(pointer)
        .cloned()
        .ok_or_else(|| invalid(format!("JSON pointer did not select a value: {pointer}")))
}
fn check_pointer(pointer: &str) -> Result<(), Error> {
    if pointer.len() > 4096 || (!pointer.is_empty() && !pointer.starts_with('/')) {
        return Err(invalid("invalid bounded JSON pointer"));
    }
    let mut chars = pointer.chars();
    while let Some(c) = chars.next() {
        if c == '~' && !matches!(chars.next(), Some('0' | '1')) {
            return Err(invalid("invalid JSON pointer escape"));
        }
    }
    Ok(())
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Predicate {
    pub value: ValueBinding,
    pub equals: Value,
}
impl Predicate {
    pub fn evaluate(&self, input: &Value, nodes: &BTreeMap<String, Value>) -> Result<bool, Error> {
        Ok(self.value.evaluate(input, nodes)? == self.equals)
    }
}
#[derive(Debug, Clone, Default, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum JoinMode {
    #[default]
    AllSucceeded,
    AllSettled,
}
#[derive(Debug, Clone, Default, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum FailureAction {
    #[default]
    Fail,
    Continue,
    Pause,
}
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(default, deny_unknown_fields)]
pub struct ErrorPolicy {
    pub retries: u32,
    pub exhausted: FailureAction,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case", deny_unknown_fields)]
pub enum NodeKind {
    Tool {
        runtime: ModuleRef,
        tool: String,
    },
    Agent {
        agent: ModuleRef,
    },
    Prompt {
        prompt: ModuleRef,
    },
    Transform,
    Condition {
        equals: Value,
    },
    Join {
        #[serde(default)]
        mode: JoinMode,
    },
    Human {
        response_schema: Value,
    },
    Subworkflow {
        workflow: ModuleRef,
    },
    Loop {
        workflow: ModuleRef,
        max_iterations: u32,
        until: Predicate,
    },
}
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct NodeSpec {
    pub id: String,
    #[serde(default)]
    pub needs: Vec<String>,
    #[serde(default)]
    pub input: ValueBinding,
    #[serde(default = "any")]
    pub input_schema: Value,
    #[serde(default = "any")]
    pub output_schema: Value,
    #[serde(default)]
    pub when: Option<Predicate>,
    #[serde(default)]
    pub on_error: ErrorPolicy,
    pub action: NodeKind,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct WorkflowSpec {
    #[serde(default = "one")]
    pub schema_version: u32,
    pub reference: ModuleRef,
    pub input_schema: Value,
    pub output_schema: Value,
    #[serde(default = "parallel")]
    pub parallelism: usize,
    pub nodes: Vec<NodeSpec>,
    pub output: ValueBinding,
}

#[derive(Clone)]
pub struct ValidatedWorkflow {
    pub(crate) spec: WorkflowSpec,
    pub(crate) dag: Dag,
}
impl ValidatedWorkflow {
    pub fn spec(&self) -> &WorkflowSpec {
        &self.spec
    }
    pub fn ready_batch(
        &self,
        settled: &BTreeSet<String>,
        running: &BTreeSet<String>,
    ) -> Vec<String> {
        self.dag
            .dispatch_batch(settled, &BTreeSet::new(), running, self.spec.parallelism)
    }
}
impl WorkflowSpec {
    pub fn validate(&self) -> Result<ValidatedWorkflow, Error> {
        check_reference(&self.reference)?;
        if self.schema_version != 1
            || self.nodes.is_empty()
            || self.nodes.len() > 1024
            || !(1..=32).contains(&self.parallelism)
        {
            return Err(invalid(
                "workflow requires version 1, 1..=1024 nodes, parallelism 1..=32",
            ));
        }
        bounded_value(
            &serde_json::to_value(self).map_err(|e| invalid(e.to_string()))?,
            4 * 1024 * 1024,
            "workflow specification",
        )?;
        crate::settings::validate_json_schema(&self.input_schema)?;
        crate::settings::validate_json_schema(&self.output_schema)?;
        for node in &self.nodes {
            check_id(&node.id)?;
            if node.on_error.retries > 16 {
                return Err(invalid(format!("node {} retries exceed 16", node.id)));
            }
            if node.needs.len() != node.needs.iter().collect::<BTreeSet<_>>().len() {
                return Err(invalid("duplicate dependency edge"));
            }
            crate::settings::validate_json_schema(&node.input_schema)?;
            crate::settings::validate_json_schema(&node.output_schema)?;
            node.input.references()?;
            if let Some(when) = &node.when {
                when.value.references()?;
                bounded_value(&when.equals, 1024 * 1024, "condition")?;
            }
            match &node.action {
                NodeKind::Tool { runtime, tool } => {
                    check_reference(runtime)?;
                    nofy_tool_protocol::ToolId::new(tool).map_err(|e| invalid(e.to_string()))?;
                }
                NodeKind::Agent { agent } => check_reference(agent)?,
                NodeKind::Prompt { prompt } => check_reference(prompt)?,
                NodeKind::Human { response_schema } => {
                    crate::settings::validate_json_schema(response_schema)?
                }
                NodeKind::Subworkflow { workflow } => check_reference(workflow)?,
                NodeKind::Loop {
                    workflow,
                    max_iterations,
                    until,
                } => {
                    check_reference(workflow)?;
                    if !(1..=128).contains(max_iterations) {
                        return Err(invalid("loop iterations must be 1..=128"));
                    }
                    // Loop predicates address that iteration's output as Input;
                    // outer node output references would be ambiguous on replay.
                    if !until.value.references()?.is_empty() {
                        return Err(invalid(
                            "loop predicate may only reference iteration output",
                        ));
                    }
                    bounded_value(&until.equals, 1024 * 1024, "loop predicate")?;
                }
                NodeKind::Condition { equals } => bounded_value(equals, 1024 * 1024, "condition")?,
                _ => {}
            }
        }
        let dag = Dag::build(
            self.nodes
                .iter()
                .map(|n| DagTask {
                    id: n.id.clone(),
                    needs: n.needs.clone(),
                    on_fail: OnFailPolicy::Escalate,
                })
                .collect(),
        )
        .map_err(|e| invalid(format!("invalid workflow DAG: {e:?}")))?;
        let ids = self
            .nodes
            .iter()
            .map(|n| n.id.clone())
            .collect::<BTreeSet<_>>();
        let mut ancestors: BTreeMap<String, BTreeSet<String>> = BTreeMap::new();
        while ancestors.len() < self.nodes.len() {
            for node in &self.nodes {
                if ancestors.contains_key(&node.id)
                    || !node.needs.iter().all(|id| ancestors.contains_key(id))
                {
                    continue;
                }
                let mut parents: BTreeSet<String> = node.needs.iter().cloned().collect();
                for need in &node.needs {
                    parents.extend(ancestors[need].iter().cloned());
                }
                let mut refs = node.input.references()?;
                if let Some(when) = &node.when {
                    refs.extend(when.value.references()?);
                }
                if !refs.is_subset(&parents) {
                    return Err(invalid(format!(
                        "node {} reads a non-ancestor output; add a dependency edge",
                        node.id
                    )));
                }
                ancestors.insert(node.id.clone(), parents);
            }
        }
        if !self.output.references()?.is_subset(&ids) {
            return Err(invalid("workflow output references an unknown node"));
        }
        let schemas = self
            .nodes
            .iter()
            .map(|n| (n.id.clone(), n.output_schema.clone()))
            .collect();
        for node in &self.nodes {
            check_binding_schema(
                &node.input,
                &node.input_schema,
                &self.input_schema,
                &schemas,
            )?;
            if let Some(when) = &node.when {
                check_binding_schema(
                    &when.value,
                    &Value::Bool(true),
                    &self.input_schema,
                    &schemas,
                )?;
            }
        }
        check_binding_schema(
            &self.output,
            &self.output_schema,
            &self.input_schema,
            &schemas,
        )?;
        Ok(ValidatedWorkflow {
            spec: self.clone(),
            dag,
        })
    }
}

pub(crate) fn check_reference(r: &ModuleRef) -> Result<(), Error> {
    check_id(&r.id)?;
    check_id(&r.version)
}
fn check_id(id: &str) -> Result<(), Error> {
    if id.trim().is_empty() || id.len() > 4096 || id.contains('\0') {
        return Err(invalid("nonempty identity of at most 4096 bytes required"));
    }
    Ok(())
}
pub(crate) fn invalid(message: impl Into<String>) -> Error {
    Error::Composition(message.into())
}
pub(crate) fn bounded_value(v: &Value, max: usize, what: &str) -> Result<(), Error> {
    if serde_json::to_vec(v).map_or(true, |b| b.len() > max) {
        return Err(invalid(format!("{what} exceeds {max} bytes")));
    }
    Ok(())
}

// Prove obvious port errors at compile time; arbitrary JSON Schema predicates
// are also enforced against actual node inputs/results by the executor.
pub(super) fn check_binding_schema(
    binding: &ValueBinding,
    target: &Value,
    input: &Value,
    nodes: &BTreeMap<String, Value>,
) -> Result<(), Error> {
    match binding {
        ValueBinding::Literal { value } => crate::settings::validate_json_value(target, value),
        ValueBinding::Input { pointer } => compatible(&schema_at(input, pointer)?, target),
        ValueBinding::Node { node, pointer } => {
            compatible(&schema_at(&nodes[node], pointer)?, target)
        }
        ValueBinding::Object { fields } => {
            compatible(&serde_json::json!({"type":"object"}), target)?;
            if let Some(required) = target.get("required").and_then(Value::as_array) {
                for key in required.iter().filter_map(Value::as_str) {
                    if !fields.contains_key(key) {
                        return Err(invalid(format!("binding is missing required port: {key}")));
                    }
                }
            }
            for (key, value) in fields {
                let schema = target
                    .get("properties")
                    .and_then(|p| p.get(key))
                    .or_else(|| target.get("additionalProperties"))
                    .cloned()
                    .unwrap_or(Value::Bool(true));
                check_binding_schema(value, &schema, input, nodes)?;
            }
            Ok(())
        }
        ValueBinding::Array { items } => {
            compatible(&serde_json::json!({"type":"array"}), target)?;
            if target
                .get("minItems")
                .and_then(Value::as_u64)
                .is_some_and(|n| items.len() < (n as usize))
                || target
                    .get("maxItems")
                    .and_then(Value::as_u64)
                    .is_some_and(|n| items.len() > (n as usize))
            {
                return Err(invalid("array binding violates port size"));
            }
            let schema = target.get("items").cloned().unwrap_or(Value::Bool(true));
            for item in items {
                check_binding_schema(item, &schema, input, nodes)?;
            }
            Ok(())
        }
    }
}
fn compatible(source: &Value, target: &Value) -> Result<(), Error> {
    if target == &Value::Bool(false) {
        return Err(invalid("binding targets an uninhabited schema"));
    }
    fn types(schema: &Value) -> BTreeSet<String> {
        match schema.get("type") {
            Some(Value::String(t)) => BTreeSet::from([t.clone()]),
            Some(Value::Array(ts)) => ts
                .iter()
                .filter_map(Value::as_str)
                .map(str::to_string)
                .collect(),
            _ => BTreeSet::new(),
        }
    }
    let mut source = types(source);
    let target = types(target);
    if source.contains("integer") {
        source.insert("number".into());
    }
    if !source.is_empty() && !target.is_empty() && source.is_disjoint(&target) {
        return Err(invalid("incompatible workflow port types"));
    }
    Ok(())
}
fn schema_at(schema: &Value, pointer: &str) -> Result<Value, Error> {
    let mut current = schema.clone();
    if pointer.is_empty() {
        return Ok(current);
    }
    for part in pointer[1..].split('/') {
        let part = part.replace("~1", "/").replace("~0", "~");
        if let Some(property) = current.get("properties").and_then(|p| p.get(&part)) {
            current = property.clone();
        } else if current.get("type").and_then(Value::as_str) == Some("array")
            && part.parse::<usize>().is_ok()
        {
            current = current.get("items").cloned().unwrap_or(Value::Bool(true));
        } else if current.get("additionalProperties") == Some(&Value::Bool(false)) {
            return Err(invalid(format!(
                "pointer references an unknown closed port: {pointer}"
            )));
        } else {
            current = Value::Bool(true);
        }
    }
    Ok(current)
}
