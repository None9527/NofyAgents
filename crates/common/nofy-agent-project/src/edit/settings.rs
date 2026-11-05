use super::*;

pub(super) fn configure(source: &mut Source, input: &Value, kinds: &FactoryKinds) -> Result<Value> {
    let mut candidate = source.clone();
    let declaration = candidate.json(&candidate.declaration)?;
    let id = text(input, "agent")?;
    agent(root(&declaration), id)?;
    let project = if candidate.files.contains_key("project.json") {
        candidate.json("project.json")?
    } else {
        json!({})
    };
    let path = project
        .get("settings")
        .and_then(Value::as_str)
        .unwrap_or("settings.json");
    safe_path(path)?;
    let mut settings: Value = if let Some(overrides) = candidate.settings_json.take() {
        serde_json::from_str(&overrides)?
    } else if candidate.files.contains_key(path) {
        candidate.json(path)?
    } else {
        json!({})
    };
    if !settings.is_object() {
        return Err(Error::new("local_input", "settings must be an object"));
    }
    fn merge(base: &mut Value, patch: &Value) {
        if let (Some(a), Some(b)) = (base.as_object_mut(), patch.as_object()) {
            for (key, value) in b {
                merge(a.entry(key.clone()).or_insert(Value::Null), value);
            }
        } else {
            *base = patch.clone();
        }
    }
    if let Some(values) = input.get("settings") {
        if !values.is_object() {
            return Err(Error::new("local_input", "settings must be an object"));
        }
        merge(&mut settings, values);
    }
    if let Some(sets) = input.get("set") {
        for (pointer, value) in sets
            .as_object()
            .ok_or_else(|| Error::new("local_input", "set must be a pointer map"))?
        {
            pointer_set(&mut settings, pointer, value.clone())?;
        }
    }
    if !settings.is_object() {
        return Err(Error::new(
            "local_input",
            "settings root must remain an object",
        ));
    }
    if let Some(unset) = input.get("unset") {
        for pointer in unset
            .as_array()
            .ok_or_else(|| Error::new("local_input", "unset must be a JSON Pointer array"))?
        {
            super::removal::pointer_remove(
                &mut settings,
                pointer
                    .as_str()
                    .ok_or_else(|| Error::new("local_input", "unset requires strings"))?,
            )?;
        }
    }
    candidate.put_json(path, &settings)?;
    candidate.refresh_manifest()?;
    let inspection = inspect(&candidate, kinds)?;
    *source = candidate;
    Ok(json!({"agent":id,"settings":settings,"inspection":inspection}))
}
