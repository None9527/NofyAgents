use super::*;
async fn publish(plane: &ControlPlane, text: &str) -> Publication {
    let name = format!("draft-{text}");
    let d = plane.save_draft(&name, None, document(text)).await.unwrap();
    plane.publish(&name, d.revision).await.unwrap()
}
fn command(id: &str, release: &str, generation: Option<u64>) -> ApplyCommand {
    ApplyCommand {
        command_id: id.into(),
        system: "portable".into(),
        release: release.into(),
        expected_generation: generation,
    }
}
#[tokio::test]
async fn publish_apply_update_and_rollback_keep_old_program_and_exact_receipts() {
    let (registry, calls) = factories("1");
    let store = Arc::new(InMemoryCatalogStore::default());
    let plane = ControlPlane::new(store, registry);
    let a = publish(&plane, "first").await;
    assert_eq!(calls.load(Ordering::SeqCst), 0);
    let initial = plane
        .apply(command("apply-a", &a.bundle.digest, None))
        .await
        .unwrap();
    assert_eq!(initial.active.generation, 1);
    let (_, old) = plane.active_program("portable", "chat").await.unwrap();
    let b = publish(&plane, "second").await;
    let diff = plane.plan("portable", &b.bundle.digest).await.unwrap();
    assert_eq!(diff.changes.len(), 2);
    let next = plane
        .apply(command("apply-b", &b.bundle.digest, Some(1)))
        .await
        .unwrap();
    assert_eq!(next.active.generation, 2);
    let (_, new) = plane.active_program("portable", "chat").await.unwrap();
    assert_eq!(run(&old).await, "actual:first");
    assert_eq!(run(&new).await, "actual:second");
    let before = plane.inspect().await.unwrap().unwrap().revision;
    assert_eq!(plane.apply(initial.command.clone()).await.unwrap(), initial);
    assert_eq!(
        plane.inspect().await.unwrap().unwrap().revision,
        before,
        "duplicate command must not create another catalog revision"
    );
    let rollback = plane
        .apply(command("rollback", &a.bundle.digest, Some(2)))
        .await
        .unwrap();
    assert_eq!(rollback.active.generation, 3);
    assert_eq!(
        run(&plane.active_program("portable", "chat").await.unwrap().1).await,
        "actual:first"
    );
    let noop = plane
        .apply(command("unchanged", &a.bundle.digest, Some(3)))
        .await
        .unwrap();
    assert!(noop.noop);
    assert!(noop.changed.changes.is_empty());
    assert_eq!(noop.active.generation, 3);
    assert_eq!(plane.history("portable").await.unwrap().len(), 4);
    assert_eq!(calls.load(Ordering::SeqCst), 3);
    assert!(matches!(
        plane
            .apply(command("stale", &b.bundle.digest, Some(1)))
            .await,
        Err(ControlError::Conflict { .. })
    ));
    assert!(matches!(
        plane
            .apply(command("apply-a", &b.bundle.digest, Some(3)))
            .await,
        Err(ControlError::CommandConflict)
    ));
}
#[tokio::test]
async fn draft_cas_prevents_lost_updates_and_aba_after_delete() {
    let (registry, _) = factories("1");
    let plane = ControlPlane::new(Arc::new(InMemoryCatalogStore::default()), registry);
    let a = plane
        .save_draft("draft", None, document("first"))
        .await
        .unwrap();
    assert!(matches!(
        plane.save_draft("draft", None, document("bad")).await,
        Err(ControlError::Conflict { .. })
    ));
    plane.delete_draft("draft", a.revision).await.unwrap();
    let b = plane
        .save_draft("draft", None, document("second"))
        .await
        .unwrap();
    assert!(b.revision > a.revision);
    assert!(matches!(
        plane
            .save_draft("draft", Some(a.revision), document("bad"))
            .await,
        Err(ControlError::Conflict { .. })
    ));
    assert!(matches!(
        plane.publish("draft", a.revision).await,
        Err(ControlError::Conflict { .. })
    ));
    let (x, y) = tokio::join!(
        plane.save_draft("draft", Some(b.revision), document("x")),
        plane.save_draft("draft", Some(b.revision), document("y"))
    );
    assert_ne!(x.is_ok(), y.is_ok());
}
#[tokio::test]
async fn invalid_publish_import_and_activate_preserve_the_previous_system() {
    let (registry, calls) = factories("1");
    let plane = ControlPlane::new(Arc::new(InMemoryCatalogStore::default()), registry);
    let a = publish(&plane, "first").await;
    plane
        .apply(command("a", &a.bundle.digest, None))
        .await
        .unwrap();
    let mut invalid = document("broken");
    invalid.programs.get_mut("chat").map(|p| {
        if let ProgramDefinition::Agent { definition } = p {
            definition.model = r("missing")
        }
    });
    let bad = plane.save_draft("invalid", None, invalid).await.unwrap();
    assert!(plane.publish("invalid", bad.revision).await.is_err());
    let mut changed = a.bundle.clone();
    changed.document.name = "another".into();
    assert!(plane.import(changed).await.is_err());
    let mut wrong = command("wrong-system", &a.bundle.digest, None);
    wrong.system = "another".into();
    assert!(plane.apply(wrong).await.is_err());
    assert_eq!(
        plane.inspect().await.unwrap().unwrap().data.active["portable"].generation,
        1
    );
    assert_eq!(calls.load(Ordering::SeqCst), 0);
}
#[tokio::test]
async fn exported_release_imports_without_source_machine_module_definitions() {
    let (registry, _) = factories("1");
    let source = ControlPlane::new(Arc::new(InMemoryCatalogStore::default()), registry);
    let a = publish(&source, "first").await;
    let export = serde_json::to_string(&source.export(&a.bundle.digest).await.unwrap()).unwrap();
    let (registry, calls) = factories("1");
    let target = ControlPlane::new(Arc::new(InMemoryCatalogStore::default()), registry);
    let imported = target
        .import(serde_json::from_str(&export).unwrap())
        .await
        .unwrap();
    assert_eq!(imported.bundle.digest, a.bundle.digest);
    target
        .apply(command("imported", &a.bundle.digest, None))
        .await
        .unwrap();
    assert_eq!(
        run(&target.active_program("portable", "chat").await.unwrap().1).await,
        "actual:first"
    );
    assert_eq!(calls.load(Ordering::SeqCst), 1);
}
#[tokio::test]
async fn recorded_apply_can_be_read_when_its_factory_is_no_longer_installed() {
    let store = Arc::new(InMemoryCatalogStore::default());
    let (registry, _) = factories("1");
    let source = ControlPlane::new(store.clone(), registry);
    let a = publish(&source, "first").await;
    let receipt = source
        .apply(command("original", &a.bundle.digest, None))
        .await
        .unwrap();
    let empty = ControlPlane::new(store, ModuleRegistry::default());
    assert_eq!(empty.apply(receipt.command.clone()).await.unwrap(), receipt);
    assert!(empty.load_active("portable").await.is_err());
}
#[tokio::test]
async fn one_file_entry_accepts_source_or_locked_export_and_refuses_corrupt_lock_fallback() {
    let (registry, _) = factories("1");
    let plane = ControlPlane::new(Arc::new(InMemoryCatalogStore::default()), registry);
    let source = SystemFile::from_json(&serde_json::to_vec(&document("first")).unwrap()).unwrap();
    let publication = plane.install_file(source).await.unwrap();
    let locked = SystemFile::from_json(&serde_json::to_vec(&publication.bundle).unwrap()).unwrap();
    assert_eq!(
        plane.install_file(locked).await.unwrap().bundle.digest,
        publication.bundle.digest
    );
    let mut value = serde_json::to_value(&publication.bundle).unwrap();
    value["lock"]["protocol"] = json!("changed");
    let input = SystemFile::from_json(&serde_json::to_vec(&value).unwrap()).unwrap();
    assert!(plane.install_file(input).await.is_err());
    value.as_object_mut().unwrap().remove("lock");
    assert!(SystemFile::from_json(&serde_json::to_vec(&value).unwrap()).is_err());
}
