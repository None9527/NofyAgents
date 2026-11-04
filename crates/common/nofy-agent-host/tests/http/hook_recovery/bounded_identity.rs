use super::*;
use nofy_agent_runtime::{IdentityScheme, registry::ModuleRegistry};

fn declaration(url: &str, scheme: IdentityScheme, long_input: bool) -> Value {
    let mut doc = source(url, false, "before_stop", true);
    doc["programs"]["execute"]["document"]["tool_runtimes"][0]["definition"]
        .as_object_mut()
        .unwrap()
        .remove("hooks");
    let root = &mut doc["programs"]["execute"]["document"];
    if scheme == IdentityScheme::Legacy {
        root["host"]
            .as_object_mut()
            .unwrap()
            .remove("scope_identity");
        root["agents"][0]["definition"]["settings"]
            .as_object_mut()
            .unwrap()
            .remove("scope_identity");
    } else {
        root["host"]["scope_identity"] = json!(scheme);
        root["agents"][0]["definition"]["settings"]["scope_identity"] = json!(scheme);
    }
    root["agents"][0]["definition"]["hooks"] = json!([r("close-hook")]);
    if long_input {
        root["workflows"][0]["nodes"][0]["input"]["value"] = json!("界".repeat(50000));
        doc["modules"][0]["config"]["endpoint_limits"]["test-model"]["max_input_tokens"] =
            json!(300000);
    }
    doc
}
async fn start(
    host: &KernelHost,
    server: &Serving,
    url: &str,
    scheme: IdentityScheme,
    long_input: bool,
) -> (ModuleRegistry, BudgetScope) {
    let doc = declaration(url, scheme, long_input);
    let compiled = host
        .control()
        .prepare(serde_json::from_value(doc.clone()).unwrap())
        .unwrap();
    let reference = ModuleRef::new("quota", "1");
    let modules = compiled.registry().resolve(&[reference.clone()]).unwrap();
    let ModuleInstance::Governance(profile) = &modules.instances[&reference] else {
        panic!("quota")
    };
    let scope = BudgetScope {
        root_run_id: "root".into(),
        identity: profile.identity().into(),
    };
    let registry = compiled.registry().clone();
    let release = post(server, "/api/v1/import", doc).await["bundle"]["digest"].clone();
    post(server, "/api/v1/runs", json!({"run_id":"root","thread_id":"thread","system":"model-evidence","release":release,"program":"execute"})).await;
    (registry, scope)
}
async fn resolve(host: &KernelHost, server: &Serving, ticket: Value) -> Value {
    post(server, "/api/v1/actions", json!({"run_id":"root","command_id":"resolve-bounded","command":{"kind":"reconcile_hook","receipt":{"ticket":ticket,"resolution":{"kind":"decision","decision":{"decision":"continue"}}}}})).await;
    tokio::time::sleep(Duration::from_millis(2100)).await;
    let stop = CancellationToken::new();
    let stopped = stop.clone();
    let worker_host = host.clone();
    let worker = tokio::spawn(async move { worker_host.run_worker(stopped, 2).await.unwrap() });
    let result = action_result(server, "resolve-bounded").await;
    assert!(page(server).await["targets"].as_array().unwrap().is_empty());
    stop.cancel();
    worker.await.unwrap();
    assert!(result["error"].is_null(), "{result}");
    assert!(result["outcome"]["Completed"].is_object(), "{result}");
    result
}

#[tokio::test]
async fn original_large_governed_agent_hook_and_long_input_recover_without_expanding_ledger_limits()
{
    for scheme in [
        IdentityScheme::Legacy,
        IdentityScheme::HashedV1,
        IdentityScheme::HashedV2,
    ] {
        let (service, counts, gate) = fixture(true, false).await;
        let directory = tempfile::tempdir().unwrap();
        let host = host(directory.path(), Arc::new(AtomicUsize::new(0))).await;
        let server = serve(host.router()).await;
        let (registry, scope) = start(
            &host,
            &server,
            &service.url,
            scheme,
            scheme == IdentityScheme::HashedV2,
        )
        .await;
        let supervisor = nofy_agent_runtime::supervisor::RunSupervisor::new(host.store().clone())
            .with_lease_ttl(Duration::from_secs(2))
            .unwrap();
        let mut running =
            tokio::spawn(async move { supervisor.execute_submitted(&registry, "root").await });
        tokio::select! {
            () = effect_started(&service.url) => {},
            result = &mut running => panic!("original governed Agent combination stopped before Hook: {result:?}"),
        }
        running.abort();
        let _ = running.await;
        let before = host.store().children("root").await.unwrap();
        let leaf = before
            .iter()
            .find(|c| c.kind.as_deref() == Some("agent"))
            .unwrap();
        let original_input = if scheme == IdentityScheme::HashedV2 {
            "界".repeat(50000)
        } else {
            "continue".into()
        };
        assert!(
            serde_json::to_vec(&(&leaf.composition, &original_input))
                .unwrap()
                .len()
                > 65536
        );
        if scheme == IdentityScheme::HashedV2 {
            assert!(leaf.composition.starts_with("composition-hash-v2:"));
            assert_eq!(leaf.composition.len(), "composition-hash-v2:".len() + 64);
            assert!(leaf.run_id.starts_with("child-hash-v2:"));
        }
        assert_eq!(values(&counts), [1, 1, 0]);
        let reserved = host.store().inspect(&scope).await.unwrap().unwrap();
        assert_eq!(reserved.used.model_calls, 1);
        assert_eq!(reserved.used.child_calls, 0);
        assert_eq!(reserved.reserved.child_calls, 1);
        let target = page(&server).await;
        assert_eq!(
            target["targets"].as_array().unwrap().len(),
            1,
            "{scheme:?}: {target}"
        );
        resolve(&host, &server, target["targets"][0]["ticket"].clone()).await;
        assert_eq!(values(&counts), [1, 1, 1]);
        let current = host.store().children("root").await.unwrap();
        for child in before {
            let restored = current.iter().find(|c| c.run_id == child.run_id).unwrap();
            assert_eq!(restored.thread_id, child.thread_id);
            assert_eq!(restored.composition, child.composition);
            assert_eq!(restored.checkpoint_key, child.checkpoint_key);
        }
        let completed = host.store().inspect(&scope).await.unwrap().unwrap();
        assert_eq!(completed.used.model_calls, 1);
        assert_eq!(completed.used.child_calls, 1);
        assert_eq!(completed.reserved, Default::default());
        assert_eq!(completed.spec, reserved.spec);
        gate.cancel();
    }
}

#[tokio::test]
async fn bounded_child_exit_process() {
    let Ok(path) = std::env::var("NOFY_BOUNDED_IDENTITY_STATE") else {
        return;
    };
    let url = std::env::var("NOFY_BOUNDED_IDENTITY_SERVICE").unwrap();
    let host = host(std::path::Path::new(&path), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(host.router()).await;
    let (registry, _) = start(&host, &server, &url, IdentityScheme::HashedV2, true).await;
    let supervisor = nofy_agent_runtime::supervisor::RunSupervisor::new(host.store().clone())
        .with_lease_ttl(Duration::from_secs(2))
        .unwrap();
    tokio::spawn(async move {
        supervisor
            .execute_submitted(&registry, "root")
            .await
            .unwrap()
    });
    effect_started(&url).await;
    let target = page(&server).await;
    assert_eq!(target["targets"].as_array().unwrap().len(), 1, "{target}");
    std::fs::write(
        std::path::Path::new(&path).join("bounded-ticket.json"),
        serde_json::to_vec(&target["targets"][0]["ticket"]).unwrap(),
    )
    .unwrap();
    std::process::exit(75);
}

#[tokio::test]
async fn v2_snapshot_and_original_child_effect_survive_real_process_exit() {
    let (service, counts, gate) = fixture(true, false).await;
    let directory = tempfile::tempdir().unwrap();
    let path = directory.path().to_owned();
    let url = service.url.clone();
    let output = tokio::task::spawn_blocking(move || {
        std::process::Command::new(std::env::current_exe().unwrap())
            .args([
                "--exact",
                "hook_recovery::bounded_identity::bounded_child_exit_process",
                "--nocapture",
            ])
            .env("NOFY_BOUNDED_IDENTITY_STATE", path)
            .env("NOFY_BOUNDED_IDENTITY_SERVICE", url)
            .output()
            .unwrap()
    })
    .await
    .unwrap();
    assert_eq!(
        output.status.code(),
        Some(75),
        "{}{}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );
    assert_eq!(values(&counts), [1, 1, 0]);
    let host = host(directory.path(), Arc::new(AtomicUsize::new(0))).await;
    let server = serve(host.router()).await;
    let before = host.store().children("root").await.unwrap();
    let target = page(&server).await;
    let ticket = serde_json::from_slice::<Value>(
        &std::fs::read(directory.path().join("bounded-ticket.json")).unwrap(),
    )
    .unwrap();
    assert_eq!(target["targets"][0]["ticket"], ticket);
    resolve(&host, &server, ticket).await;
    assert_eq!(values(&counts), [1, 1, 1]);
    let after = host.store().children("root").await.unwrap();
    for child in before {
        let recovered = after.iter().find(|r| r.run_id == child.run_id).unwrap();
        assert_eq!(recovered.composition, child.composition);
        assert_eq!(recovered.checkpoint_key, child.checkpoint_key);
    }
    gate.cancel();
}
