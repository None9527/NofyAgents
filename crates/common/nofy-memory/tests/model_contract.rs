use chrono::Utc;
use nofy_memory::model::{
    CaptureRollout, ContentHash, MemoryScope, Observation, ObservationId, ObservationKind,
    ObservationStatus, ObservationView, ProjectId, ProjectValidity, Provenance, Topic, TopicId,
    TopicOrigin, TopicPath,
};
use uuid::Uuid;

fn provenance() -> Provenance {
    Provenance {
        session_id: "session-1".to_string(),
        turn_id: "turn-1".to_string(),
        model: "test-model".to_string(),
        prompt_version: "memory-capture-v1".to_string(),
        source_hash: ContentHash::parse(
            "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        )
        .unwrap(),
    }
}

fn project_scope() -> MemoryScope {
    MemoryScope::Project(
        ProjectId::from_repository_fingerprint("https://example.com/acme/project.git@root-commit")
            .unwrap(),
    )
}

#[test]
fn project_id_is_stable_for_the_same_repository_fingerprint() {
    let first =
        ProjectId::from_repository_fingerprint("https://example.com/acme/repo@abc").unwrap();
    let second =
        ProjectId::from_repository_fingerprint("https://example.com/acme/repo@abc").unwrap();
    let other =
        ProjectId::from_repository_fingerprint("https://example.com/acme/repo@def").unwrap();

    assert_eq!(first, second);
    assert_ne!(first, other);
    assert!(!first.as_uuid().is_nil());
}

#[test]
fn repository_fingerprint_rejects_empty_input() {
    assert!(ProjectId::from_repository_fingerprint("  ").is_err());
}

#[test]
fn non_git_project_identity_is_stable_for_a_canonical_path() {
    let project = tempfile::tempdir().unwrap();
    let first = ProjectId::resolve(project.path()).unwrap();
    let second = ProjectId::resolve(project.path()).unwrap();
    assert_eq!(first, second);
}

#[test]
fn linked_worktree_shares_project_identity() {
    let fixture = tempfile::tempdir().unwrap();
    let repository_path = fixture.path().join("repository");
    let worktree_path = fixture.path().join("linked");
    let repository = git2::Repository::init(&repository_path).unwrap();

    std::fs::write(repository_path.join("README.md"), "fixture").unwrap();
    let mut index = repository.index().unwrap();
    index.add_path(std::path::Path::new("README.md")).unwrap();
    let tree_id = index.write_tree().unwrap();
    let tree = repository.find_tree(tree_id).unwrap();
    let signature = git2::Signature::now("Nofy Test", "test@nofy.invalid").unwrap();
    let commit_id = repository
        .commit(Some("HEAD"), &signature, &signature, "initial", &tree, &[])
        .unwrap();
    let commit = repository.find_commit(commit_id).unwrap();
    let branch = repository.branch("linked", &commit, false).unwrap();
    let reference = branch.into_reference();
    let mut options = git2::WorktreeAddOptions::new();
    options.reference(Some(&reference));
    repository
        .worktree("linked", &worktree_path, Some(&options))
        .unwrap();

    assert_eq!(
        ProjectId::resolve(&repository_path).unwrap(),
        ProjectId::resolve(&worktree_path).unwrap()
    );
}

#[test]
fn ids_reject_nil_uuid() {
    assert!(ObservationId::try_from(Uuid::nil()).is_err());
    assert!(TopicId::try_from(Uuid::nil()).is_err());
    assert!(ProjectId::try_from(Uuid::nil()).is_err());
}

#[test]
fn topic_path_accepts_normalized_relative_markdown_path() {
    let path = TopicPath::parse("preferences/editor.md").unwrap();
    assert_eq!(path.as_str(), "preferences/editor.md");
}

#[test]
fn topic_path_rejects_escape_absolute_and_non_markdown_paths() {
    assert!(TopicPath::parse("../secret.md").is_err());
    assert!(TopicPath::parse("/tmp/secret.md").is_err());
    assert!(TopicPath::parse("preferences/./editor.md").is_err());
    assert!(TopicPath::parse("preferences/editor.txt").is_err());
}

#[test]
fn correction_requires_superseded_observation() {
    let observation = Observation {
        id: ObservationId::new(),
        scope: MemoryScope::Personal,
        kind: ObservationKind::UserCorrection,
        statement: "I now live in Shanghai".to_string(),
        keywords: vec!["location".to_string()],
        aliases: vec![],
        supersedes: vec![],
        project_validity: None,
        provenance: provenance(),
        content_hash: ContentHash::parse(
            "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        )
        .unwrap(),
        created_at: Utc::now(),
    };

    assert!(observation.validate().is_err());
}

#[test]
fn superseded_observation_is_not_recallable() {
    let observation = Observation {
        id: ObservationId::new(),
        scope: MemoryScope::Personal,
        kind: ObservationKind::User,
        statement: "I live in Beijing".to_string(),
        keywords: vec!["location".to_string()],
        aliases: vec![],
        supersedes: vec![],
        project_validity: None,
        provenance: provenance(),
        content_hash: ContentHash::parse(
            "eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        )
        .unwrap(),
        created_at: Utc::now(),
    };
    observation.validate().unwrap();

    assert!(
        !ObservationView {
            observation,
            status: ObservationStatus::Superseded,
            resolved_by: Some(ObservationId::new()),
        }
        .is_recallable()
    );
}

#[test]
fn personal_objects_must_not_have_project_validity() {
    let topic = Topic {
        id: TopicId::new(),
        scope: MemoryScope::Personal,
        path: TopicPath::parse("profile/location.md").unwrap(),
        title: "Location".to_string(),
        description: "Current city".to_string(),
        body: "Shanghai".to_string(),
        origin: TopicOrigin::User,
        pinned: true,
        project_validity: Some(ProjectValidity::ProjectWide),
        revision: 1,
        content_hash: ContentHash::parse(
            "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
        )
        .unwrap(),
        evidence: vec![ObservationId::new()],
    };

    assert!(topic.validate().is_err());
}

#[test]
fn project_objects_require_explicit_validity() {
    let topic = Topic {
        id: TopicId::new(),
        scope: project_scope(),
        path: TopicPath::parse("architecture/database.md").unwrap(),
        title: "Database".to_string(),
        description: "Project database decision".to_string(),
        body: "Use SQLite for local state".to_string(),
        origin: TopicOrigin::Curator,
        pinned: false,
        project_validity: None,
        revision: 1,
        content_hash: ContentHash::parse(
            "dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd",
        )
        .unwrap(),
        evidence: vec![ObservationId::new()],
    };

    assert!(topic.validate().is_err());
}

#[test]
fn branch_local_validity_requires_ref_and_commit() {
    let invalid = ProjectValidity::BranchLocal {
        git_ref: "".to_string(),
        anchor_commit: "abc123".to_string(),
    };
    assert!(invalid.validate().is_err());

    let valid = ProjectValidity::BranchLocal {
        git_ref: "refs/heads/feature".to_string(),
        anchor_commit: "abc123".to_string(),
    };
    assert!(valid.validate().is_ok());
}

#[test]
fn serde_contract_uses_stable_snake_case_tags() {
    assert_eq!(
        serde_json::to_value(CaptureRollout::RecordOnly).unwrap(),
        serde_json::json!("record_only")
    );
    assert_eq!(
        serde_json::to_value(ObservationKind::UserCorrection).unwrap(),
        serde_json::json!("user_correction")
    );
    assert_eq!(
        serde_json::to_value(ProjectValidity::ProjectWide).unwrap(),
        serde_json::json!({ "kind": "project_wide" })
    );
}

#[test]
fn serde_rejects_invalid_domain_newtypes() {
    assert!(
        serde_json::from_str::<ObservationId>(r#""00000000-0000-0000-0000-000000000000""#).is_err()
    );
    assert!(serde_json::from_str::<ContentHash>(r#""not-a-content-hash""#).is_err());
    assert!(serde_json::from_str::<TopicPath>(r#""../escape.md""#).is_err());
}
