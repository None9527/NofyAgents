use super::*;
use crate::*;
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use std::collections::{BTreeMap, BTreeSet};

#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Import {
    pub repository: String,
    pub name: String,
    pub version: String,
    pub digest: String,
    #[serde(default)]
    pub parameters: BTreeMap<String, Value>,
    #[serde(default)]
    pub bindings: BTreeMap<String, Value>,
    pub exports: BTreeMap<String, String>,
    pub factories: BTreeMap<String, String>,
}
pub(crate) fn check_digest(digest: &str) -> Result<()> {
    if digest.len() != 64
        || !digest
            .bytes()
            .all(|b| b.is_ascii_digit() || (b'a'..=b'f').contains(&b))
    {
        return Err(Error::new(
            "local_input",
            "package digest requires 64 lowercase hex characters",
        ));
    }
    Ok(())
}
pub fn package_file(digest: &str) -> Result<String> {
    check_digest(digest)?;
    Ok(format!(".nofy-module-packages/{digest}.json"))
}
fn system(doc: &Value) -> &Value {
    doc.get("system").unwrap_or(doc)
}
fn system_mut(doc: &mut Value) -> &mut Value {
    if doc.get("system").is_some() {
        &mut doc["system"]
    } else {
        doc
    }
}
fn read_imports(system: &Value) -> Result<BTreeMap<String, Import>> {
    let value = system
        .get("module_imports")
        .cloned()
        .unwrap_or_else(|| json!({}));
    let imports: BTreeMap<String, Import> = serde_json::from_value(value)?;
    for (alias, p) in &imports {
        for id in [alias, &p.repository, &p.name, &p.version] {
            safe_id(id)?;
        }
        check_digest(&p.digest)?;
        for (id, factory) in &p.factories {
            safe_id(&format!("{alias}.{id}"))?;
            if factory.is_empty() {
                return Err(Error::new("local_input", "imported factory missing"));
            }
        }
        for (export, id) in &p.exports {
            safe_id(export)?;
            if !p.factories.contains_key(id) {
                return Err(Error::new(
                    "local_input",
                    "invalid imported export metadata",
                ));
            }
        }
    }
    Ok(imports)
}
pub fn imports(source: &Source) -> Result<BTreeMap<String, Import>> {
    read_imports(system(&source.json(&source.declaration)?))
}
pub fn verify_package_sources(source: &Source) -> Result<()> {
    for imported in imports(source)?.values() {
        let path = package_file(&imported.digest)?;
        if !source.files.contains_key(&path) {
            return Err(Error::incomplete(
                "module package source is missing; resolve the source before exporting",
            ));
        }
        let package: Source = serde_json::from_value(source.json(&path)?)?;
        complete(&package)?;
        if package.digest()? != imported.digest {
            return Err(Error::new(
                "local_input",
                "module package source digest mismatch",
            ));
        }
    }
    Ok(())
}
pub fn resolve_reference(system: &Value, requested: &str) -> Result<Option<Value>> {
    for (alias, p) in read_imports(system)? {
        let Some(export) = requested.strip_prefix(&format!("{alias}.")) else {
            continue;
        };
        if let Some(id) = p.exports.get(export) {
            return Ok(Some(json!({"$module":format!("{alias}.{id}")})));
        }
        if p.exports.values().any(|id| id == export) {
            return Ok(Some(json!({"$module":requested})));
        }
    }
    Ok(None)
}
pub(crate) fn imported_factory(system: &Value, reference: &Value) -> Result<Option<String>> {
    let Some(id) = reference.get("$module").and_then(Value::as_str) else {
        return Ok(None);
    };
    for (alias, p) in read_imports(system)? {
        if let Some(id) = id.strip_prefix(&format!("{alias}."))
            && let Some(factory) = p.factories.get(id)
        {
            return Ok(Some(factory.clone()));
        }
    }
    Ok(None)
}
pub(crate) fn imported_modules(system: &Value) -> Result<Vec<Value>> {
    let mut modules = vec![];
    for (alias, p) in read_imports(system)? {
        for id in p.exports.values().collect::<BTreeSet<_>>() {
            let name = format!("{alias}.{id}");
            modules.push(json!({"id":name,"reference":{"$module":name},"factory":p.factories[id],"import_alias":alias,"package":{"repository":p.repository,"name":p.name,"version":p.version,"digest":p.digest},"exports":p.exports.iter().filter(|(_,v)|*v==id).map(|(k,_)|k).collect::<Vec<_>>()}));
        }
    }
    Ok(modules)
}
fn binding(system: &Value, value: &Value) -> Result<Value> {
    if let Some(id) = value.as_str() {
        if let Some(r) = resolve_reference(system, id)? {
            return Ok(r);
        }
        // Source projects allow forward references while being authored.
        if let Ok(r) = crate::edit::reference(system, value) {
            return Ok(r);
        }
        safe_id(id)?;
        return Ok(json!({"$module":id}));
    }
    if let Some(id) = value.get("$module").and_then(Value::as_str) {
        if value.as_object().is_none_or(|m| m.len() != 1) {
            return Err(Error::new("local_input", "invalid source module reference"));
        }
        return binding(system, &json!(id));
    }
    if value.get("id").and_then(Value::as_str).is_some()
        && value.get("version").and_then(Value::as_str).is_some()
        && value.as_object().is_some_and(|m| m.len() == 2)
    {
        return Ok(value.clone());
    }
    Err(Error::new(
        "local_input",
        "package binding requires a source ID or ModuleRef",
    ))
}
pub fn use_package(
    source: &mut Source,
    package: &PackageView,
    input: &Value,
    kinds: &FactoryKinds,
) -> Result<()> {
    if package.yanked {
        return Err(Error::new(
            "conflict",
            "package version is yanked; existing digest pins remain valid",
        ));
    }
    let alias = text(input, "alias")?;
    safe_id(alias)?;
    let mut candidate = source.clone();
    let mut doc = candidate.json(&candidate.declaration)?;
    let system = system_mut(&mut doc);
    let factories = package.manifest.factories()?;
    for id in factories.keys() {
        let name = format!("{alias}.{id}");
        safe_id(&name)?;
        if system["modules"].as_array().into_iter().flatten().any(|m| {
            let m = m.get("$when").and_then(|v| v.get("value")).unwrap_or(m);
            m["reference"]["$module"] == name || m["reference"]["id"] == name
        }) {
            return Err(Error::new(
                "conflict",
                "package namespace conflicts with a source module",
            ));
        }
    }
    let parameters: BTreeMap<String, Value> = serde_json::from_value(
        input
            .get("parameters")
            .cloned()
            .unwrap_or_else(|| json!({})),
    )?;
    let mut bindings = BTreeMap::new();
    if let Some(entries) = input.get("bindings") {
        for (name, value) in entries
            .as_object()
            .ok_or_else(|| Error::new("local_input", "bindings must be an object"))?
        {
            if !package.manifest.inputs.contains_key(name) {
                return Err(Error::new(
                    "local_input",
                    format!("undeclared package port: {name}"),
                ));
            }
            bindings.insert(name.clone(), binding(system, value)?);
        }
    }
    let imported = Import {
        repository: package.repository.clone(),
        name: package.name.clone(),
        version: package.version.clone(),
        digest: package.digest.clone(),
        parameters,
        bindings,
        exports: package.manifest.exports.clone(),
        factories,
    };
    let mut all = read_imports(system)?;
    if all.get(alias).is_some_and(|old| old != &imported) && input["replace_import"] != true {
        return Err(Error::new(
            "conflict",
            "import alias is occupied; use replace_import to change it",
        ));
    }
    all.insert(alias.into(), imported);
    system["module_imports"] = serde_json::to_value(all)?;
    // Neither: the package is only imported, for modules that need it as a
    // dependency. Either one is enough to mount it: the other is worked out.
    let export = match input.get("export") {
        Some(export) => Some(
            export
                .as_str()
                .ok_or_else(|| Error::new("local_input", "export name must be a string"))?
                .to_owned(),
        ),
        None if input.get("slot").is_some() => {
            let mut names = package.manifest.exports.keys();
            match (names.next(), names.next()) {
                (Some(only), None) => Some(only.clone()),
                _ => {
                    return Err(Error::new(
                        "local_input",
                        format!(
                            "package exports {}; name the one to mount with export",
                            package
                                .manifest
                                .exports
                                .keys()
                                .map(|name| format!("`{name}`"))
                                .collect::<Vec<_>>()
                                .join(", ")
                        ),
                    ));
                }
            }
        }
        None => None,
    };
    if let Some(export) = export {
        let id = package.manifest.exports.get(&export).ok_or_else(|| {
            Error::new(
                "not_found",
                format!(
                    "package export `{export}` not found; it exports {}",
                    package
                        .manifest
                        .exports
                        .keys()
                        .map(|name| format!("`{name}`"))
                        .collect::<Vec<_>>()
                        .join(", ")
                ),
            )
        })?;
        let factory = package.manifest.factories()?[id].clone();
        let kind = kinds.get(&factory).map(String::as_str);
        let slot = match input.get("slot") {
            Some(slot) => slot
                .as_str()
                .ok_or_else(|| Error::new("local_input", "slot must be a string"))?,
            None => kind.and_then(crate::edit::default_slot).ok_or_else(|| {
                Error::new(
                    "local_input",
                    match kind {
                        Some(kind) => format!(
                            "export `{export}` is a {kind}, which is wired to another module's port rather than mounted on an Agent slot; bind it with bindings, or name a slot"
                        ),
                        None => format!(
                            "cannot tell which slot export `{export}` belongs on: this kernel does not list factory `{factory}`; name the slot"
                        ),
                    },
                )
            })?,
        };
        crate::edit::attach(
            system,
            text(input, "agent")?,
            slot,
            json!({"$module":format!("{alias}.{id}")}),
            kind,
            input["replace_slot"] == true,
        )?;
    } else {
        crate::edit::check_agent(system, text(input, "agent")?)?;
    }
    candidate.put_json(&candidate.declaration.clone(), &doc)?;
    candidate.refresh_manifest()?;
    *source = candidate;
    Ok(())
}
pub fn unuse_package(source: &mut Source, alias: &str) -> Result<()> {
    safe_id(alias)?;
    let mut candidate = source.clone();
    let mut doc = candidate.json(&candidate.declaration)?;
    let system = system_mut(&mut doc);
    let mut all = read_imports(system)?;
    if all.remove(alias).is_none() {
        return Err(Error::new("not_found", "module import not found"));
    }
    system["module_imports"] = serde_json::to_value(all)?;
    let prefix = format!("{alias}.");
    let users: Vec<_> = crate::render::module_dependencies(system)
        .into_iter()
        .filter(|id| id.starts_with(&prefix))
        .collect();
    if !users.is_empty() {
        let mut e = Error::new(
            "conflict",
            "detach package exports and rebind their users before removing the import",
        );
        e.details = json!({"references":users});
        return Err(e);
    }
    candidate.put_json(&candidate.declaration.clone(), &doc)?;
    candidate.refresh_manifest()?;
    *source = candidate;
    Ok(())
}
pub(crate) fn expand_cached(source: &Source, kinds: &FactoryKinds) -> Result<Source> {
    let all = imports(source)?;
    let mut out = source.clone();
    let mut doc = source.json(&source.declaration)?;
    if all.is_empty() {
        if let Some(object) = system_mut(&mut doc).as_object_mut() {
            object.remove("module_imports");
        }
        out.put_json(&out.declaration.clone(), &doc)?;
        out.refresh_manifest()?;
        return Ok(out);
    }
    let root = system(&doc);
    let mut known = BTreeMap::new();
    for m in root["modules"].as_array().into_iter().flatten() {
        let m = m.get("$when").and_then(|v| v.get("value")).unwrap_or(m);
        if let Some(id) = m["reference"]["$module"]
            .as_str()
            .or_else(|| m["reference"]["id"].as_str())
            && let Some(factory) = m["factory"].as_str()
        {
            known.insert(id.to_owned(), factory.to_owned());
        }
    }
    for (alias, imported) in &all {
        for (id, factory) in &imported.factories {
            if known
                .insert(format!("{alias}.{id}"), factory.clone())
                .is_some()
            {
                return Err(Error::new(
                    "conflict",
                    "package namespace conflicts with a source module",
                ));
            }
        }
    }
    let mut generated = vec![];
    for (alias, imported) in &all {
        let path = package_file(&imported.digest)?;
        if !source.files.contains_key(&path) {
            return Err(Error::incomplete(format!(
                "module source {} / {} @ {} is not cached; synchronize or export its package",
                imported.repository, imported.name, imported.version
            )));
        }
        let package: Source = serde_json::from_value(source.json(&path)?)?;
        if package.digest()? != imported.digest {
            return Err(Error::new(
                "local_input",
                "imported package source digest mismatch",
            ));
        }
        let manifest = PackageManifest::from_source(&package)?;
        if manifest.name != imported.name
            || manifest.version != imported.version
            || manifest.factories()? != imported.factories
            || manifest.exports != imported.exports
        {
            return Err(Error::new(
                "local_input",
                "module import metadata does not match its frozen source",
            ));
        }
        for (port, value) in &imported.bindings {
            let expected = manifest
                .inputs
                .get(port)
                .ok_or_else(|| Error::new("local_input", "undeclared package input"))?;
            if let Some(id) = value.get("$module").and_then(Value::as_str)
                && let Some(kind) = known.get(id).and_then(|f| kinds.get(f))
                && kind != expected
            {
                return Err(Error::new(
                    "local_input",
                    format!("package port {alias}.{port} expects {expected}, received {kind}"),
                ));
            }
        }
        let parameters = crate::render::evaluate_parameters(
            source,
            &serde_json::to_value(&imported.parameters)?,
        )?;
        generated.extend(crate::render::package_modules(
            &package,
            &manifest,
            alias,
            parameters,
            &imported.bindings,
        )?);
    }
    let root = system_mut(&mut doc);
    root.as_object_mut()
        .ok_or_else(|| Error::new("local_input", "system must be an object"))?
        .remove("module_imports");
    root["modules"]
        .as_array_mut()
        .ok_or_else(|| Error::new("local_input", "modules must be an array"))?
        .extend(generated);
    out.put_json(&out.declaration.clone(), &doc)?;
    out.refresh_manifest()?;
    Ok(out)
}
