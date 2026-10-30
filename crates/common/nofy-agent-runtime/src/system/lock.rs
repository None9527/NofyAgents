use super::*;
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum SystemChangeKind {
    Module,
    Program,
    PolicyFloor,
    GovernanceFloor,
}
#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq)]
#[serde(deny_unknown_fields)]
pub struct SystemChange {
    pub kind: SystemChangeKind,
    pub name: String,
    pub before: Option<String>,
    pub after: Option<String>,
}
#[derive(Clone, Debug, Default, Serialize, Deserialize, PartialEq, Eq)]
#[serde(deny_unknown_fields)]
pub struct SystemDiff {
    pub changes: Vec<SystemChange>,
}
impl SystemBundle {
    pub fn diff(&self, previous: Option<&Self>) -> Result<SystemDiff, Error> {
        self.validate()?;
        if let Some(previous) = previous {
            previous.validate()?;
            if previous.document.name != self.document.name {
                return Err(Error::Composition(
                    "cannot diff different system names".into(),
                ));
            }
        }
        fn entries(
            bundle: &SystemBundle,
        ) -> Result<BTreeMap<String, (SystemChangeKind, String)>, Error> {
            let mut out = BTreeMap::new();
            for module in &bundle.lock.modules {
                let name = serde_json::to_string(&module.definition.reference)
                    .map_err(|e| Error::Composition(e.to_string()))?;
                out.insert(
                    format!("module:{name}"),
                    (SystemChangeKind::Module, digest(module)?),
                );
            }
            for (name, program) in &bundle.lock.programs {
                out.insert(
                    format!("program:{name}"),
                    (SystemChangeKind::Program, digest(program)?),
                );
            }
            out.insert(
                "floor:policy".into(),
                (
                    SystemChangeKind::PolicyFloor,
                    digest(&bundle.document.required_policies)?,
                ),
            );
            out.insert(
                "floor:governance".into(),
                (
                    SystemChangeKind::GovernanceFloor,
                    digest(&bundle.document.required_governance)?,
                ),
            );
            Ok(out)
        }
        let before = previous.map(entries).transpose()?.unwrap_or_default();
        let after = entries(self)?;
        let keys = before
            .keys()
            .chain(after.keys())
            .collect::<std::collections::BTreeSet<_>>();
        let mut changes = Vec::new();
        for name in keys {
            let b = before.get(name);
            let a = after.get(name);
            if b.map(|(_, h)| h) == a.map(|(_, h)| h) {
                continue;
            }
            changes.push(SystemChange {
                kind: a.or(b).expect("union entry").0.clone(),
                name: name.clone(),
                before: b.map(|(_, h)| h.clone()),
                after: a.map(|(_, h)| h.clone()),
            });
        }
        Ok(SystemDiff { changes })
    }
}
