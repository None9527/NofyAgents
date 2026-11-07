use super::*;
use sha2::{Digest, Sha256};
#[path = "loader/admission.rs"]
mod admission;
#[path = "loader/cache.rs"]
mod cache;
#[path = "loader/images.rs"]
mod images;
#[path = "loader/process.rs"]
mod process;
#[path = "loader/process_tree.rs"]
mod process_tree;
#[path = "loader/references.rs"]
mod references;
#[path = "loader/sources.rs"]
mod sources;
#[path = "loader/unload.rs"]
mod unload;

fn runtime() -> Value {
    let path = std::fs::canonicalize("/usr/bin/python3").unwrap();
    let hash = format!("{:x}", Sha256::digest(std::fs::read(&path).unwrap()));
    json!({"id":"python","path":path,"executable_digest":hash,"prefix_args":["-s","-E"]})
}
async fn setup(path: &std::path::Path) -> (KernelHost, Serving, Value) {
    let kernel = host(path, Arc::new(AtomicUsize::new(0))).await;
    let server = serve(kernel.router()).await;
    let probe = post(&server, "/api/v1/runtimes/probe", json!({})).await;
    assert_eq!(probe["enforced"], true);
    let installed = post(&server, "/api/v1/runtimes", runtime()).await;
    (kernel, server, installed)
}
fn document(runtime: &Value, artifact: Value) -> Value {
    let r = |id: &str| json!({"id":id,"version":"1"});
    json!({"schema_version":1,"name":"artifact-system","modules":[
        {"reference":r("code"),"factory":"resource.artifact","config":artifact},
        {"reference":r("environment"),"factory":"resource.process","config":{"runtime":{"id":runtime["id"],"revision":runtime["revision"]}}},
        {"reference":r("tool"),"factory":"tool.process_artifact","config":{"contract":{"name":"compute","input_schema":{"type":"object","required":["n"],"properties":{"n":{"type":"integer"}},"additionalProperties":false},"timeout_ms":20000},"entrypoint":"main.py"},"dependencies":{"environment":r("environment"),"artifact":r("code")}}
    ],"programs":{"compute":{"kind":"tool","definition":{"name":"compute","tool_packs":[r("tool")]},"call":{"id":"compute","name":"compute","arguments":{"n":1}}}}})
}
fn package(multiplier: i32) -> Value {
    json!({"schema_version":1,"files":{"main.py":"import json,sys,os\nfrom helper import compute\nvalue=json.load(sys.stdin)\nprint(json.dumps({'result':compute(value['n']),'pid':os.getpid()}))\n","helper.py":format!("def compute(n):\n    return n * {multiplier}\n")}})
}
fn run(release: &str, id: &str) -> Value {
    json!({"run_id":id,"thread_id":id,"system":"artifact-system","release":release,"program":"compute","parameters":{"n":7}})
}
fn output(value: &Value) -> Value {
    let decoded: Value = serde_json::from_str(
        value["execution"]["outcome"]["Completed"]["output"]
            .as_str()
            .unwrap(),
    )
    .unwrap();
    decoded.get("value").cloned().unwrap_or(decoded)
}

#[tokio::test]
async fn loader_rejects_invalid_packages_slots_bindings_and_tampered_metadata_without_execution() {
    let dir = tempfile::tempdir().unwrap();
    let (kernel, server, installed) = setup(dir.path()).await;
    for path in ["../outside", "/absolute", "a//b"] {
        let (status, _) = request(
            &server,
            reqwest::Method::POST,
            "/api/v1/artifacts",
            ADMIN,
            json!({"schema_version":1,"files":{path:"pass"}}),
        )
        .await;
        assert!(status >= 400, "{path}: {status}");
    }
    for slots in [
        json!(["../outside"]),
        json!(["a", "a/b"]),
        json!(["same", "same"]),
        json!((0..17).map(|i| format!("file{i}")).collect::<Vec<_>>()),
    ] {
        let mut source = document(&installed, json!({"bundle":package(2)}));
        source["modules"][2]["config"]["scratch_files"] = slots;
        assert!(
            request(
                &server,
                reqwest::Method::POST,
                "/api/v1/validate",
                ADMIN,
                source
            )
            .await
            .0 >= 400
        );
    }
    let source = document(&installed, json!({"digest":"0".repeat(64)}));
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/import",
            PUBLISH,
            source.clone()
        )
        .await
        .0,
        403
    );
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/validate",
            ADMIN,
            source
        )
        .await
        .0,
        404
    );
    let mut unknown = installed.clone();
    unknown["revision"] = json!("0".repeat(64));
    assert!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/validate",
            ADMIN,
            document(&unknown, json!({"bundle":package(2)}))
        )
        .await
        .0 >= 400
    );
    let mut wrong = runtime();
    wrong["executable_digest"] = json!("0".repeat(64));
    assert!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/runtimes",
            ADMIN,
            wrong
        )
        .await
        .0 >= 400
    );
    let mut broad = runtime();
    broad["read_roots"] = json!(["/"]);
    assert!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/runtimes",
            ADMIN,
            broad
        )
        .await
        .0 >= 400
    );
    tokio::fs::write(dir.path().join("loader/runtimes/catalog.json"), b"{}")
        .await
        .unwrap();
    assert!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/validate",
            ADMIN,
            document(&installed, json!({"bundle":package(2)}))
        )
        .await
        .0 >= 400
    );
    // An optional Loader failure must not poison unrelated legacy systems.
    post(
        &server,
        "/api/v1/validate",
        json!(super::document("http://127.0.0.1:9")),
    )
    .await;
    assert_eq!(
        request(
            &server,
            reqwest::Method::GET,
            "/api/v1/catalog",
            VIEW,
            Value::Null
        )
        .await
        .0,
        200
    );
    assert!(
        kernel
            .store()
            .execution_record("root")
            .await
            .unwrap()
            .is_none()
    );
    assert_eq!(
        std::fs::read_dir(dir.path().join("loader/artifacts/trees"))
            .unwrap()
            .count(),
        0
    );
    assert_eq!(
        std::fs::read_dir(dir.path().join("loader/scratch"))
            .unwrap()
            .count(),
        0
    );
}

#[tokio::test]
async fn artifact_process_loader_runs_versions_without_restarting_and_exports_a_self_contained_system()
 {
    let dir = tempfile::tempdir().unwrap();
    let (kernel, server, installed) = setup(dir.path()).await;
    assert!(installed.get("path").is_none());
    let bundle = package(2);
    assert_eq!(
        request(
            &server,
            reqwest::Method::POST,
            "/api/v1/artifacts",
            VIEW,
            bundle.clone()
        )
        .await
        .0,
        403
    );
    let artifact = post(&server, "/api/v1/artifacts", bundle.clone()).await;
    assert_eq!(artifact, post(&server, "/api/v1/artifacts", bundle).await);
    let source = document(&installed, json!({"digest":artifact["digest"]}));
    let prepared = post(&server, "/api/v1/validate", source.clone()).await;
    assert!(
        prepared["document"]["modules"]
            .to_string()
            .contains("from helper import compute")
    );
    assert!(
        kernel
            .store()
            .execution_record("one")
            .await
            .unwrap()
            .is_none()
    );
    assert_eq!(
        std::fs::read_dir(dir.path().join("loader/artifacts/trees"))
            .unwrap()
            .count(),
        0
    );
    let publication = post(&server, "/api/v1/import", source.clone()).await;
    let release = publication["bundle"]["digest"].as_str().unwrap();
    let mut extra = runtime();
    extra["id"] = json!("unrelated-runtime");
    post(&server, "/api/v1/runtimes", extra).await;
    assert_eq!(
        post(&server, "/api/v1/validate", source).await["digest"],
        release
    );
    let stop = CancellationToken::new();
    let shutdown = stop.clone();
    let worker_kernel = kernel.clone();
    let worker = tokio::spawn(async move { worker_kernel.run_worker(shutdown, 2).await.unwrap() });
    post(&server, "/api/v1/runs", run(release, "one")).await;
    let one = outcome(&server, "one").await;
    assert_eq!(one["execution"]["status"], "completed", "{one}");
    assert_eq!(output(&one)["result"], 14);
    post(&server, "/api/v1/runs", run(release, "one")).await;
    assert_eq!(one["execution"], outcome(&server, "one").await["execution"]);
    let changed = post(&server, "/api/v1/artifacts", package(3)).await;
    let second = post(
        &server,
        "/api/v1/import",
        document(&installed, json!({"digest":changed["digest"]})),
    )
    .await;
    post(
        &server,
        "/api/v1/runs",
        run(second["bundle"]["digest"].as_str().unwrap(), "two"),
    )
    .await;
    let two = outcome(&server, "two").await;
    assert_eq!(two["execution"]["status"], "completed", "{two}");
    assert_eq!(output(&two)["result"], 21);
    post(&server, "/api/v1/runs", run(release, "old")).await;
    assert_eq!(output(&outcome(&server, "old").await)["result"], 14);
    let target = tempfile::tempdir().unwrap();
    let (other, remote, installed_again) = setup(target.path()).await;
    assert_eq!(installed["revision"], installed_again["revision"]);
    let imported = post(&remote, "/api/v1/import", publication["bundle"].clone()).await;
    assert_eq!(imported["bundle"]["digest"], release);
    let admitted = request(
        &remote,
        reqwest::Method::GET,
        "/api/v1/artifacts",
        VIEW,
        Value::Null,
    )
    .await
    .1;
    assert_eq!(admitted.as_array().unwrap().len(), 1);
    let source_bundle: nofy_agent_runtime::artifact::ArtifactBundle =
        serde_json::from_value(package(2)).unwrap();
    assert_eq!(admitted[0]["digest"], source_bundle.digest().unwrap());
    let target_stop = CancellationToken::new();
    let signal = target_stop.clone();
    let target_worker = tokio::spawn(async move { other.run_worker(signal, 1).await.unwrap() });
    post(&remote, "/api/v1/runs", run(release, "migrated")).await;
    assert_eq!(output(&outcome(&remote, "migrated").await)["result"], 14);
    target_stop.cancel();
    target_worker.await.unwrap();
    stop.cancel();
    worker.await.unwrap();
}

#[tokio::test]
async fn actual_process_isolation_denies_kernel_files_network_process_creation_and_group_escape() {
    let dir = tempfile::tempdir().unwrap();
    let (kernel, server, installed) = setup(dir.path()).await;
    std::fs::write(
        dir.path().join("private-secret"),
        b"not available to modules",
    )
    .unwrap();
    let secret = dir
        .path()
        .join("private-secret")
        .to_str()
        .unwrap()
        .to_owned();
    let outside = dir
        .path()
        .join("outside-write")
        .to_str()
        .unwrap()
        .to_owned();
    let script = format!(
        r#"import os,socket,json,ctypes
import sys
json.load(sys.stdin)
def denied(fn):
    try:
        fn()
        return False
    except PermissionError:
        return True
lib=ctypes.CDLL(None,use_errno=True)
result={{'read':denied(lambda:open({secret:?}).read()),'write':denied(lambda:open({outside:?},'w').write('escape')),'network':denied(lambda:socket.socket()),'fork':denied(lambda:os.fork()),'group':denied(lambda:os.setsid()),'chmod':denied(lambda:os.chmod({secret:?},0o666))}}
result['pdeath_reset_denied']=(lib.prctl(1,0,0,0,0)==-1 and ctypes.get_errno()==1)
result['create_denied']=denied(lambda:open('undeclared-file','w'))
result['ipc_denied']=(lib.shmget(0,4096,0o1600)==-1 and ctypes.get_errno()==1)
result['mq_denied']=(lib.mq_open(('/nofy-loader-absent-'+str(os.getpid())).encode(),0)==-1 and ctypes.get_errno()==1)
result['keyring_denied']=(lib.syscall({keyctl},0,0,0,0,0)==-1 and ctypes.get_errno()==1)
class Header(ctypes.Structure):
    _fields_=[('version',ctypes.c_uint32),('pid',ctypes.c_int)]
class Data(ctypes.Structure):
    _fields_=[('effective',ctypes.c_uint32),('permitted',ctypes.c_uint32),('inheritable',ctypes.c_uint32)]
header=Header(0x20080522,0)
caps=(Data*2)()
result['caps_zero']=(lib.capget(ctypes.byref(header),ctypes.byref(caps))==0 and all(c.effective==c.permitted==c.inheritable==0 for c in caps))
with open('scratch-result','w') as f:
    f.write('allowed')
    lib.fallocate.argtypes=[ctypes.c_int,ctypes.c_int,ctypes.c_longlong,ctypes.c_longlong]
    result['allocate_denied']=(lib.fallocate(f.fileno(),1,0,1024*1024*1024)==-1 and ctypes.get_errno()==1)
    result['ioctl_denied']=(lib.ioctl(f.fileno(),0x40049409,0)==-1 and ctypes.get_errno()==1)
result['scratch']=open('scratch-result').read()
print(json.dumps(result))
"#,
        keyctl = libc::SYS_keyctl
    );
    let mut source = document(
        &installed,
        json!({"bundle":{"schema_version":1,"files":{"main.py":script}}}),
    );
    source["modules"][2]["config"]["scratch_files"] = json!(["scratch-result"]);
    let release = post(&server, "/api/v1/import", source).await["bundle"]["digest"]
        .as_str()
        .unwrap()
        .to_owned();
    let stop = CancellationToken::new();
    let signal = stop.clone();
    let worker = tokio::spawn(async move { kernel.run_worker(signal, 1).await.unwrap() });
    post(&server, "/api/v1/runs", run(&release, "isolation")).await;
    let value = outcome(&server, "isolation").await;
    assert_eq!(value["execution"]["status"], "completed", "{value}");
    let out = output(&value);
    for name in [
        "read",
        "write",
        "network",
        "fork",
        "group",
        "chmod",
        "pdeath_reset_denied",
        "create_denied",
        "ipc_denied",
        "mq_denied",
        "keyring_denied",
        "allocate_denied",
        "ioctl_denied",
        "caps_zero",
    ] {
        assert_eq!(out[name], true, "{name}: {out}");
    }
    assert_eq!(out["scratch"], "allowed");
    assert!(!dir.path().join("outside-write").exists());
    stop.cancel();
    worker.await.unwrap();
    assert_eq!(
        std::fs::read_dir(dir.path().join("loader/scratch"))
            .unwrap()
            .count(),
        0
    );
}
