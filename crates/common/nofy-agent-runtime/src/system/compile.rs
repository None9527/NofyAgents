use super::*;
use crate::{
    compile::compile_agent, event_program::compile_event, program::ProgramSnapshot,
    tool_program::compile_tools,
};
use std::collections::BTreeSet;

fn merge<T: Serialize + Clone>(
    map: &mut BTreeMap<ModuleRef, T>,
    reference: ModuleRef,
    value: T,
) -> Result<(), Error> {
    if let Some(old) = map.get(&reference) {
        if digest(old)? != digest(&value)? {
            return Err(Error::Composition(format!(
                "conflicting module version in system: {}@{}",
                reference.id, reference.version
            )));
        }
    } else {
        map.insert(reference, value);
    }
    Ok(())
}
fn snapshot_modules(snapshot: &ExecutionSnapshot) -> Vec<ResolvedModule> {
    match &snapshot.program {
        ProgramSnapshot::Agent { snapshot } => snapshot.modules.clone(),
        ProgramSnapshot::Tool { snapshot, .. } => snapshot.modules.clone(),
        ProgramSnapshot::Event { snapshot } => snapshot
            .modules
            .iter()
            .chain(&snapshot.host.modules)
            .cloned()
            .collect(),
        #[cfg(feature = "workflow")]
        ProgramSnapshot::Workflow { snapshot, .. } => snapshot.modules.clone(),
    }
}
fn prepare_program(
    definition: &ProgramDefinition,
    registry: &ModuleRegistry,
) -> Result<CompiledProgram, Error> {
    match definition {
        ProgramDefinition::Agent { definition } => {
            CompiledProgram::for_agent(&compile_agent(definition.clone(), registry)?)
        }
        ProgramDefinition::Tool { definition, call } => {
            CompiledProgram::for_tool(&compile_tools(definition.clone(), registry)?, call.clone())
        }
        ProgramDefinition::Event { definition } => {
            CompiledProgram::for_event(&compile_event(definition.clone(), registry)?)
        }
        #[cfg(feature = "workflow")]
        ProgramDefinition::Workflow { document, input } => CompiledProgram::for_workflow(
            &crate::workflow::compile::compile_workflow(document.clone(), registry)?,
            input.clone(),
        ),
    }
}
fn resolve(
    document: &SystemDocument,
    host: &ModuleRegistry,
) -> Result<
    (
        BTreeMap<String, CompiledProgram>,
        Vec<ResolvedModule>,
        ModuleRegistry,
    ),
    Error,
> {
    let mut registry = host.clone();
    for reference in &document.required_policies {
        registry.require_policy(reference.clone());
    }
    for reference in &document.required_governance {
        registry.require_governance(reference.clone());
    }
    for definition in &document.modules {
        match registry.definition(&definition.reference) {
            Some(old) if digest(old)? != digest(definition)? => {
                return Err(Error::Composition(
                    "system cannot replace an existing module version".into(),
                ));
            }
            Some(_) => {}
            None => registry.define(definition.clone())?,
        }
    }
    // Validate declared but currently unused modules too; otherwise an exported
    // system could carry invalid or unresolved definitions unnoticed.
    let declared = registry.resolve(
        &document
            .modules
            .iter()
            .map(|m| m.reference.clone())
            .collect::<Vec<_>>(),
    )?;
    let mut modules = BTreeMap::new();
    for module in declared.snapshot {
        merge(&mut modules, module.definition.reference.clone(), module)?;
    }
    let mut programs = BTreeMap::new();
    for (name, definition) in &document.programs {
        let program = prepare_program(definition, &registry)?;
        for module in snapshot_modules(&program.snapshot) {
            merge(&mut modules, module.definition.reference.clone(), module)?;
        }
        programs.insert(name.clone(), program);
    }
    Ok((programs, modules.into_values().collect(), registry))
}
/// Resolves transitive definitions into the exported document, so moving a
/// bundle does not depend on the source machine's hidden module definitions.
pub fn compile_system(
    mut document: SystemDocument,
    host: &ModuleRegistry,
) -> Result<CompiledSystem, Error> {
    bounded_name(&document.name)?;
    if document.schema_version != 1
        || document.programs.is_empty()
        || document.programs.len() > 64
        || document.modules.len() > 1024
        || serde_json::to_vec(&document).map_or(true, |v| v.len() > 8 * 1024 * 1024)
    {
        return Err(Error::Composition(
            "system requires version 1, 1..=64 programs, at most 1024 modules and 8 MiB source"
                .into(),
        ));
    }
    for name in document.programs.keys() {
        bounded_name(name)?;
    }
    let mut definitions = BTreeMap::new();
    for definition in std::mem::take(&mut document.modules) {
        merge(&mut definitions, definition.reference.clone(), definition)?;
    }
    #[cfg(feature = "workflow")]
    for program in document.programs.values_mut() {
        if let ProgramDefinition::Workflow { document, .. } = program {
            for definition in std::mem::take(&mut document.modules) {
                merge(&mut definitions, definition.reference.clone(), definition)?;
            }
        }
    }
    document.modules = definitions.into_values().collect();
    document.required_policies = document
        .required_policies
        .into_iter()
        .chain(host.required_policies().iter().cloned())
        .collect::<BTreeSet<_>>()
        .into_iter()
        .collect();
    document.required_governance = document
        .required_governance
        .into_iter()
        .chain(host.required_governance().iter().cloned())
        .collect::<BTreeSet<_>>()
        .into_iter()
        .collect();
    let (_, modules, _) = resolve(&document, host)?;
    document.modules = modules.iter().map(|m| m.definition.clone()).collect();
    if document.modules.len() > 1024 {
        return Err(Error::Composition(
            "resolved system exceeds 1024 modules".into(),
        ));
    }
    // Compile from the closed exported definitions, not from incidental host
    // declarations. This also normalizes object order for composition strings.
    document = serde_json::from_value(canonical(
        serde_json::to_value(&document).map_err(|e| Error::Composition(e.to_string()))?,
    ))
    .map_err(|e| Error::Composition(e.to_string()))?;
    if serde_json::to_vec(&document).map_or(true, |v| v.len() > 8 * 1024 * 1024) {
        return Err(Error::Composition(
            "resolved system exceeds 8 MiB source".into(),
        ));
    }
    let (programs, modules, registry) = resolve(&document, &host.without_definitions())?;
    let locked = programs
        .iter()
        .map(|(name, program)| {
            Ok((
                name.clone(),
                LockedProgram {
                    snapshot: program.snapshot.clone(),
                    composition_digest: digest_bytes(program.composition_identity().as_bytes()),
                },
            ))
        })
        .collect::<Result<BTreeMap<_, _>, Error>>()?;
    let lock = SystemLock {
        schema_version: 1,
        protocol: "nofy.runtime/v1".into(),
        modules,
        programs: locked,
    };
    let bundle = SystemBundle {
        schema_version: 1,
        digest: digest(&(&document, &lock))?,
        document,
        lock,
    };
    bundle.validate()?;
    Ok(CompiledSystem {
        bundle,
        programs,
        registry,
    })
}
