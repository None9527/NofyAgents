use nofy_memory::access::MemoryAccess;
use nofy_memory::layout::UnifiedMemoryLayout;
use nofy_memory::manifest::{self, TopicManifest};

fn setup() -> (
    tempfile::TempDir,
    nofy_memory::layout::ScopeLayout,
    MemoryAccess,
) {
    let temp = tempfile::tempdir().unwrap();
    let layout = UnifiedMemoryLayout::new(temp.path());
    let scope = layout.personal_scope();
    let access = MemoryAccess::open(layout.meta_database(), scope.clone()).unwrap();
    (temp, scope, access)
}

#[test]
fn rebuild_paths_agree_for_native_nested_topics() {
    let (_temp, scope, access) = setup();
    let nested = scope
        .topics_directory()
        .join("preferences")
        .join("editor.md");
    std::fs::create_dir_all(nested.parent().unwrap()).unwrap();
    std::fs::write(&nested, "nested topic").unwrap();

    let standalone = manifest::rebuild(&scope).unwrap();
    access.rebuild_manifest().unwrap();
    let through_access: TopicManifest =
        serde_json::from_slice(&std::fs::read(scope.manifest_file()).unwrap()).unwrap();

    assert_eq!(standalone, through_access);
    assert_eq!(standalone.topics.len(), 1);
    assert!(
        standalone
            .topics
            .contains_key("topics/preferences/editor.md")
    );
}

#[cfg(unix)]
#[test]
fn rebuild_preserves_distinct_native_backslash_and_nested_names() {
    let (_temp, scope, access) = setup();
    let nested = scope.topics_directory().join("a").join("b.md");
    let literal = scope.topics_directory().join(r"a\b.md");
    std::fs::create_dir_all(nested.parent().unwrap()).unwrap();
    std::fs::write(&nested, "nested topic").unwrap();
    std::fs::write(&literal, "literal backslash topic").unwrap();

    // Both are distinct real files; the existing standalone inventory records both.
    let standalone = manifest::rebuild(&scope).unwrap();
    assert_eq!(standalone.topics.len(), 2);
    assert_ne!(
        standalone.topics["topics/a/b.md"],
        standalone.topics[r"topics/a\b.md"]
    );

    access.rebuild_manifest().unwrap();
    let through_access: TopicManifest =
        serde_json::from_slice(&std::fs::read(scope.manifest_file()).unwrap()).unwrap();
    assert_eq!(
        through_access.topics.len(),
        2,
        "an inventory must not merge two native files"
    );
    assert_eq!(standalone, through_access);
}

#[test]
fn legal_nested_topic_history_keeps_existing_keys_and_hashes() {
    use nofy_memory::model::{ContentHash, OperationId};
    use std::path::Path;

    let (_temp, scope, access) = setup();
    std::fs::create_dir_all(scope.topics_directory().join("preferences")).unwrap();
    let relative = Path::new("preferences/editor.md");
    let before = blake3::hash(b"before").to_hex().to_string();
    let after = blake3::hash(b"after").to_hex().to_string();
    access
        .create_topic(OperationId::new(), relative, "before")
        .unwrap();
    access
        .update_topic(
            OperationId::new(),
            relative,
            &ContentHash::parse(before.clone()).unwrap(),
            "after",
            None,
        )
        .unwrap();

    let db = rusqlite::Connection::open(scope.state_database()).unwrap();
    let mut statement = db
        .prepare("SELECT topic_id, previous_hash, next_hash FROM topic_changes ORDER BY id")
        .unwrap();
    let rows = statement
        .query_map([], |row| {
            Ok((
                row.get::<_, String>(0)?,
                row.get::<_, Option<String>>(1)?,
                row.get::<_, Option<String>>(2)?,
            ))
        })
        .unwrap()
        .collect::<Result<Vec<_>, _>>()
        .unwrap();
    assert_eq!(
        rows,
        [
            (
                "topics/preferences/editor.md".to_owned(),
                None,
                Some(before.clone())
            ),
            (
                "topics/preferences/editor.md".to_owned(),
                Some(before),
                Some(after)
            ),
        ]
    );
    assert_eq!(
        std::fs::read_to_string(scope.topics_directory().join(relative)).unwrap(),
        "after"
    );
}
