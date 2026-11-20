use super::*;
use crate::{auth::Authorizer, native};
use nofy_agent_runtime::credentials::EnvironmentCredentials;

#[cfg(unix)]
#[tokio::test]
async fn journal_reopens_from_the_resolved_state_directory() {
    let dir = tempfile::tempdir().unwrap();
    let parent = dir.path().join("parent");
    let alias = dir.path().join("alias");
    std::fs::create_dir(&parent).unwrap();
    std::os::unix::fs::symlink(&parent, &alias).unwrap();
    let credentials =
        Arc::new(EnvironmentCredentials::new("evolution", "NOFY_EVOLUTION_TEST_").unwrap());
    let registry = native::registry(credentials).unwrap();

    let host = KernelHost::open(
        &alias.join("state"),
        registry.clone(),
        Authorizer::development(),
    )
    .await
    .unwrap();
    let journal = &host.evolution.journal;
    journal.initialize().unwrap();
    journal
        .save("proposal", "grant", None, "receipt".into())
        .await
        .unwrap();
    drop(host);

    let host = KernelHost::open(&parent.join("state"), registry, Authorizer::development())
        .await
        .unwrap();
    assert_eq!(
        host.evolution.journal.load("proposal").await.unwrap(),
        Some((1, "grant".into(), "receipt".into()))
    );
}

async fn publish(host: &KernelHost, version: &str) -> String {
    let reference = json!({"id":"sdk","version":version});
    let doc = serde_json::from_value(json!({
        "schema_version":1,"name":"omni",
        "modules":[{"reference":reference,"factory":"tool.sdk_authoring","config":{}}],
        "programs":{"main":{"kind":"tool","definition":{"name":"inspect","tool_packs":[reference]},"call":{"id":"inspect","name":"sdk_schema","arguments":{"operation":"describe"}}}}
    })).unwrap();
    host.control
        .install_file(SystemFile::Source(doc))
        .await
        .unwrap()
        .bundle
        .digest
}

#[tokio::test]
async fn replays_a_committed_activation_and_fences_rollback_after_a_newer_release() {
    let dir = tempfile::tempdir().unwrap();
    let credentials =
        Arc::new(EnvironmentCredentials::new("evolution", "NOFY_EVOLUTION_TEST_").unwrap());
    let host = KernelHost::open(
        dir.path(),
        native::registry(credentials).unwrap(),
        Authorizer::development(),
    )
    .await
    .unwrap();
    let baseline = publish(&host, "baseline").await;
    let candidate = publish(&host, "candidate").await;
    let newer = publish(&host, "operator-update").await;
    let activation = host
        .control
        .apply(ApplyCommand {
            command_id: "original".into(),
            system: "omni".into(),
            release: baseline.clone(),
            expected_generation: None,
        })
        .await
        .unwrap();
    let case = Probe {
        input: "check".into(),
        expected: "ok".into(),
        baseline_expected: None,
    };
    let host = host
        .with_evolution(Preauthorization {
            system: "omni".into(),
            baseline: activation.active.clone(),
            evaluation: vec![case.clone()],
            observation: vec![case],
        })
        .unwrap();
    let grant = host.evolution.grant.get().unwrap();
    let ready = EvolutionReceipt {
        proposal: "proposal".into(),
        author_run: "source-run".into(),
        policy_digest: grant.digest.clone(),
        baseline: activation.active,
        candidate_release: Some(candidate),
        phase: Phase::Activate,
        evidence: vec![],
        evaluation_digest: Some(content_digest(&Vec::<Evidence>::new()).unwrap()),
        activation: None,
        rollback: None,
        failure: None,
    };
    let mut applied = ready.clone();
    host.evolution
        .apply(&host, grant, &mut applied)
        .await
        .unwrap();
    // Re-entry sees the original ready state when the host loses the journal
    // write after ControlPlane has already committed the activation.
    let mut replay = ready;
    host.evolution
        .apply(&host, grant, &mut replay)
        .await
        .unwrap();
    assert_eq!(applied.activation, replay.activation);
    assert_eq!(host.control.history("omni").await.unwrap().len(), 2);

    let intervening = host
        .control
        .apply(ApplyCommand {
            command_id: "operator-update".into(),
            system: "omni".into(),
            release: newer,
            expected_generation: Some(replay.activation.as_ref().unwrap().active.generation),
        })
        .await
        .unwrap();
    replay.phase = Phase::Rollback;
    host.evolution
        .apply(&host, grant, &mut replay)
        .await
        .unwrap();
    assert_eq!(replay.phase, Phase::Superseded);
    assert!(replay.rollback.is_none());
    assert_eq!(
        host.control.load_active("omni").await.unwrap().0,
        intervening.active
    );
    assert_eq!(host.control.history("omni").await.unwrap().len(), 3);
}
