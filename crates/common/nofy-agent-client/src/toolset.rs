//! Shared operation visibility for SDK discovery and its transport adapters.
use crate::{CATALOG, Error, OPERATIONS, Operation, Result, nearest};
use serde_json::{Value, json};
use std::collections::BTreeSet;

#[derive(Clone, Copy, Debug, Default, Eq, PartialEq)]
pub enum Toolset {
    #[default]
    Run,
    Development,
    Operations,
    Full,
}

impl Toolset {
    pub const NAMES: [&str; 4] = ["run", "development", "operations", "full"];

    pub fn name(self) -> &'static str {
        match self {
            Self::Run => "run",
            Self::Development => "development",
            Self::Operations => "operations",
            Self::Full => "full",
        }
    }

    pub fn sdk(self) -> OperationView {
        OperationView {
            toolset: self,
            mcp: false,
        }
    }

    pub fn mcp(self) -> OperationView {
        OperationView {
            toolset: self,
            mcp: true,
        }
    }
}

impl std::str::FromStr for Toolset {
    type Err = Error;

    fn from_str(name: &str) -> Result<Self> {
        match name {
            "run" => Ok(Self::Run),
            "development" => Ok(Self::Development),
            "operations" => Ok(Self::Operations),
            "full" => Ok(Self::Full),
            _ => Err(Error::new(
                "local_input",
                "toolset must be run, development, operations or full",
            )),
        }
    }
}

const RUN: &[&str] = &[
    "describe",
    "schema",
    "session.start",
    "session.turn",
    "session.list",
    "session.inspect",
    "run.start",
    "run.inspect",
    "work.list",
    "work.inspect",
    "work.targets",
    "work.start",
    "work.wait",
    "work.control",
    "run.events",
    "run.approvals",
    "run.decide",
    "run.cancel",
    "run.recovery",
    "run.control",
    "action.inspect",
];

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub struct OperationView {
    toolset: Toolset,
    mcp: bool,
}

impl OperationView {
    pub fn toolset(self) -> Toolset {
        self.toolset
    }

    pub fn allows(self, operation: &Operation) -> bool {
        if self.mcp && operation.mcp_tool.is_none() {
            return false;
        }
        let name = operation.operation.as_str();
        if RUN.contains(&name) {
            return true;
        }
        let group = name.split('.').next().unwrap_or_default();
        match self.toolset {
            Toolset::Run => false,
            Toolset::Development => {
                matches!(group, "agent" | "project" | "draft" | "session" | "run")
                    || matches!(
                        name,
                        "module.template"
                            | "module.publish"
                            | "module.list"
                            | "module.inspect"
                            | "module.export"
                            | "repository.list"
                            | "repository.inspect"
                            | "system.validate"
                            | "system.publish"
                            | "system.plan"
                            | "system.active"
                            | "system.export"
                            | "system.programs"
                    )
            }
            Toolset::Operations => matches!(
                group,
                "session"
                    | "run"
                    | "system"
                    | "repository"
                    | "terminal"
                    | "resource"
                    | "permission"
                    | "credential"
                    | "budget"
                    | "module"
                    | "command"
            ),
            Toolset::Full => true,
        }
    }

    pub fn operations(self) -> impl Iterator<Item = &'static Operation> {
        OPERATIONS
            .iter()
            .filter(move |operation| self.allows(operation))
    }

    pub fn require(self, name: &str) -> Result<()> {
        if self
            .operations()
            .any(|operation| operation.operation == name)
        {
            return Ok(());
        }
        let mut error = Error::new(
            "unsupported_operation",
            format!(
                "operation `{name}` is unavailable in the `{}` toolset",
                self.toolset.name()
            ),
        );
        let suggestions = nearest(
            name,
            self.operations()
                .map(|operation| operation.operation.as_str()),
        );
        error.details =
            json!({"toolset":self.toolset.name(),"operation":name,"suggestions":suggestions});
        Err(error)
    }

    pub fn catalog(self) -> Value {
        let mut catalog = CATALOG.clone();
        if let Some(entries) = catalog["operations"].as_array_mut() {
            let visible: BTreeSet<_> = self
                .operations()
                .map(|operation| operation.operation.as_str())
                .collect();
            entries.retain(|entry| {
                entry["operation"]
                    .as_str()
                    .is_some_and(|name| visible.contains(name))
            });
        }
        catalog["toolset"] = json!(self.toolset.name());
        catalog
    }
}
