//! Save/apply/export/import one declarative file in the same running process.
use nofy_agent_runtime::{control::*, registry::ModuleRegistry, system::*, *};
use serde_json::Value;
use std::{path::PathBuf, sync::Arc};
struct OwnedDirectory(PathBuf);
impl Drop for OwnedDirectory {
    fn drop(&mut self) {
        let _ = std::fs::remove_dir_all(&self.0);
    }
}
fn bad(error: impl std::fmt::Display) -> Error {
    Error::Composition(error.to_string())
}
pub async fn verify(registry: &ModuleRegistry) -> std::result::Result<(), Error> {
    let directory = OwnedDirectory(std::env::temp_dir().join(format!(
        "nofy-portable-{}",
        nofy_tool_protocol::ToolCallId::new_v7()
    )));
    std::fs::create_dir(&directory.0).map_err(bad)?;
    let mut document: SystemDocument =
        serde_json::from_str(include_str!("../configured-system.json")).map_err(bad)?;
    let catalog = FileCatalogStore::open(directory.0.join("catalog.json")).map_err(bad)?;
    let plane = ControlPlane::new(Arc::new(catalog), registry.clone());
    let first = plane
        .save_draft("business", None, document.clone())
        .await
        .map_err(bad)?;
    let original = plane
        .publish("business", first.revision)
        .await
        .map_err(bad)?;
    let apply = ApplyCommand {
        command_id: "activate-original".into(),
        system: document.name.clone(),
        release: original.bundle.digest.clone(),
        expected_generation: None,
    };
    plane.apply(apply.clone()).await.map_err(bad)?;
    let (_, old) = plane
        .active_program(&document.name, "chat")
        .await
        .map_err(bad)?;
    let prompt = document
        .modules
        .iter_mut()
        .find(|m| m.factory == "prompt.template")
        .expect("configured prompt");
    prompt.config["template"] = Value::String(format!(
        "{}\nlive updated",
        prompt.config["template"].as_str().unwrap()
    ));
    let edited = plane
        .save_draft("business", Some(first.revision), document.clone())
        .await
        .map_err(bad)?;
    let updated = plane
        .publish("business", edited.revision)
        .await
        .map_err(bad)?;
    plane
        .apply(ApplyCommand {
            command_id: "activate-updated".into(),
            release: updated.bundle.digest.clone(),
            expected_generation: Some(1),
            ..apply.clone()
        })
        .await
        .map_err(bad)?;
    let (_, new) = plane
        .active_program(&document.name, "chat")
        .await
        .map_err(bad)?;
    for (program, name, expected) in [(&old, "old", false), (&new, "new", true)] {
        let outcome = program
            .invoke(RunInput::new("alice"), super::context(name))
            .await?;
        let RunOutcome::Completed { state, .. } = outcome else {
            return Err(bad("declarative invocation did not complete"));
        };
        assert!(
            matches!(state.messages.first(),Some(Message::System{content}) if content.contains("live updated")==expected)
        );
    }
    let path = directory.0.join("system.json");
    std::fs::write(
        &path,
        serde_json::to_vec_pretty(&plane.export(&updated.bundle.digest).await.map_err(bad)?)
            .map_err(bad)?,
    )
    .map_err(bad)?;
    let reopened = ControlPlane::new(
        Arc::new(FileCatalogStore::open(directory.0.join("catalog.json")).map_err(bad)?),
        registry.clone(),
    );
    assert_eq!(
        reopened
            .load_active(&document.name)
            .await
            .map_err(bad)?
            .0
            .generation,
        2
    );
    let target = ControlPlane::new(
        Arc::new(FileCatalogStore::open(directory.0.join("target.json")).map_err(bad)?),
        registry.clone(),
    );
    let imported: SystemBundle =
        serde_json::from_slice(&std::fs::read(path).map_err(bad)?).map_err(bad)?;
    target.import(imported).await.map_err(bad)?;
    target
        .apply(ApplyCommand {
            command_id: "import".into(),
            release: updated.bundle.digest,
            expected_generation: None,
            ..apply
        })
        .await
        .map_err(bad)?;
    assert_eq!(
        target
            .load_active(&document.name)
            .await
            .map_err(bad)?
            .0
            .generation,
        1
    );
    Ok(())
}
