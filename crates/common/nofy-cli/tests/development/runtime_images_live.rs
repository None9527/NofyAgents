use super::{
    omni::{checked, run_session_with_input},
    *,
};
use nofy_agent_host::loader::{
    images::RuntimeImage,
    sources::{AcquireImage, BootstrapSource, ImageAttestation, SourcePolicy},
};
use nofy_agent_runtime::{RunOutcome, events::RunEvent};
use std::{io::Read, process::Command};

#[tokio::test(flavor = "multi_thread", worker_threads = 4)]
#[ignore = "requires local NInfer and Linux process confinement"]
async fn omni_executes_tools_in_local_and_signed_locked_runtimes() {
    let endpoint = std::env::var("NOFY_LIVE_MODEL_URL").unwrap();
    let model = std::env::var("NOFY_LIVE_MODEL").unwrap();
    let state = tempfile::tempdir().unwrap();
    let fixture = tempfile::tempdir().unwrap();
    let kernel = host(state.path()).await;
    let service = serve(kernel.router()).await;
    let sdk = engine(&service.url, ADMIN);
    let mut local_paths = vec![json!({"path":"/usr","execute":true})];
    for (dir, execute) in [
        ("/lib", true),
        ("/lib64", true),
        ("/etc/ld.so.cache", false),
    ] {
        if std::path::Path::new(dir).exists() {
            local_paths.push(if execute {
                json!({"path":dir,"execute":true})
            } else {
                json!({"path":dir})
            });
        }
    }
    let local_config =
        json!({"executable":"/usr/bin/python3","prefix_args":["-s","-E"],"paths":local_paths});

    let source_file = fixture.path().join("receipt.c");
    let binary = fixture.path().join("receipt");
    std::fs::write(&source_file,"#include <stdio.h>\nint main(void) { puts(\"{\\\"receipt\\\":\\\"LOCKED-1893\\\"}\"); return 0; }\n").unwrap();
    let compiled = Command::new("/usr/bin/cc")
        .args(["-static", "-O2"])
        .arg(&source_file)
        .arg("-o")
        .arg(&binary)
        .output()
        .unwrap();
    assert!(
        compiled.status.success(),
        "{}",
        String::from_utf8_lossy(&compiled.stderr)
    );
    let image=RuntimeImage::capture(serde_json::from_value(json!({"id":"live-locked-receipt","executable":"bin/receipt","files":{"bin/receipt":binary}})).unwrap()).unwrap();
    let image_bytes = serde_json::to_vec(&image).unwrap();
    let mut seed = [0; 32];
    std::fs::File::open("/dev/urandom")
        .unwrap()
        .read_exact(&mut seed)
        .unwrap();
    let (attestation, key) =
        ImageAttestation::sign(&image_bytes, "live-publisher".into(), &seed).unwrap();
    seed.fill(0);
    let fetches = Arc::new(AtomicUsize::new(0));
    let registry = serve(axum::Router::new().route(
        "/signed/receipt.json",
        axum::routing::get({
            let fetches = fetches.clone();
            move || {
                let bytes = image_bytes.clone();
                let fetches = fetches.clone();
                async move {
                    fetches.fetch_add(1, Ordering::SeqCst);
                    bytes
                }
            }
        }),
    ))
    .await;
    let policy = SourcePolicy {
        base_url: format!("{}/signed/", registry.url),
        keys: [("live-publisher".into(), key)].into(),
        credential_ref: None,
        allow_loopback_http: true,
    };
    let original = AcquireImage {
        command_id: "acquire-live-image".into(),
        source: "live-receipts".into(),
        policy_digest: policy.digest().unwrap(),
        path: "receipt.json".into(),
        attestation,
    };
    kernel
        .loader()
        .sources
        .bootstrap(vec![BootstrapSource {
            id: "live-receipts".into(),
            expected_revision: None,
            policy,
        }])
        .unwrap();

    let source: Source = serde_json::from_value(
        checked(&sdk, "project.template", json!({})).await.data["source"].clone(),
    )
    .unwrap();
    let configured=checked(&sdk,"agent.configure",json!({"agent":"main","target":{"kind":"source","source":source,"expected_digest":source.digest().unwrap()},
        "settings":{"connection":{"base_url":endpoint,"models":[model],"allow_insecure_http":true,"timeout_ms":120000},"model":model,
            "model_settings":{"stream":true,"max_output_tokens":128},"max_steps":5,"allowed_tools":["sandbox_receipt"]}})).await;
    let built = checked(
        &sdk,
        "agent.build",
        json!({"agent":"main","target":{"kind":"source","source":configured.data["source"]}}),
    )
    .await;
    let base: Value =
        serde_json::from_str(built.data["deployment_json"].as_str().unwrap()).unwrap();
    let stop = tokio_util::sync::CancellationToken::new();
    let worker = tokio::spawn({
        let stop = stop.clone();
        let kernel = kernel.clone();
        async move { kernel.run_worker(stop, 2).await.unwrap() }
    });
    let mut cases = Vec::new();
    for (factory, run, expected, config) in [
        (
            "resource.process_local",
            "omni-local-runtime",
            "LOCAL-1284",
            local_config,
        ),
        (
            "resource.process_locked",
            "omni-locked-runtime",
            "LOCKED-1893",
            json!({"manifest":image.manifest}),
        ),
    ] {
        let mut deployment = base.clone();
        if factory == "resource.process_locked" {
            deployment = json!({"format":"nofy.deployment/v2","system":base["system"],"runtime_sources":[original]});
        }
        let r = |id: &str| json!({"id":format!("live-runtime-{id}"),"version":"1"});
        let code = "import json\nprint(json.dumps({'receipt':'LOCAL-1284'}))\n";
        deployment["system"]["modules"].as_array_mut().unwrap().extend([
            json!({"reference":r("environment"),"factory":factory,"config":config}),
            json!({"reference":r("entry"),"factory":"resource.artifact","config":{"bundle":{"schema_version":1,"files":{"fixture.py":code}}}}),
            json!({"reference":r("tool"),"factory":"tool.process_artifact","config":{"contract":{"name":"sandbox_receipt","description":"Read the sealed runtime receipt.","effect":"read_only","input_schema":{"type":"object","additionalProperties":false}},"entrypoint":"fixture.py"},
                "dependencies":{"artifact":r("entry"),"environment":r("environment")}}),
        ]);
        deployment["system"]["programs"]["main"]["definition"]["tool_packs"]
            .as_array_mut()
            .unwrap()
            .push(r("tool"));
        let published = checked(
            &sdk,
            "system.publish",
            json!({"document_json":deployment.to_string()}),
        )
        .await;
        let release = published.refs["release"].as_deref().unwrap();
        let goal = "Call sandbox_receipt once with an empty argument object. Read its receipt field. Output that exact string with no additional text.";
        run_session_with_input(&sdk, "omni", release, run, goal).await;
        let Some(RunOutcome::Completed { output, .. }) = kernel
            .store()
            .execution_record(run)
            .await
            .unwrap()
            .unwrap()
            .outcome
        else {
            unreachable!()
        };
        assert_eq!(output.trim(), expected);
        let events = kernel.store().events(run, 0, 200).await.unwrap();
        let call = events
            .iter()
            .find_map(|e| match &e.event {
                RunEvent::ToolStarted { call } if call.name == "sandbox_receipt" => Some(call),
                _ => None,
            })
            .unwrap();
        let execution=events.iter().find(|e|matches!(&e.event,RunEvent::ToolCompleted{call_id,result,is_error:false} if call_id==&call.id && result["value"]["receipt"]==expected)).expect("actual isolated runtime output");
        cases.push(json!({"factory":factory,"run":run,"release":release,"model_call":call,"execution":execution,"output":output}));
    }
    assert!(fetches.load(Ordering::SeqCst) > 0);
    if let Ok(path) = std::env::var("NOFY_LIVE_REPORT") {
        let report = json!({"model":model,"factories":["resource.process_local","resource.process_locked"],"cases":cases,"signed_source_fetches":fetches.load(Ordering::SeqCst),"image":image.manifest.digest().unwrap()});
        std::fs::write(path, serde_json::to_vec_pretty(&report).unwrap()).unwrap();
    }
    stop.cancel();
    worker.await.unwrap();
}
