use super::*;
#[tokio::test(flavor = "multi_thread", worker_threads = 3)]
async fn proxy_enforces_destinations_and_guest_cannot_bypass_isolated_network() {
    use tokio::io::{AsyncReadExt, AsyncWriteExt};
    let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
    let port = listener.local_addr().unwrap().port();
    let count = Arc::new(std::sync::atomic::AtomicUsize::new(0));
    let calls = count.clone();
    let service = tokio::spawn(async move {
        loop {
            let (mut socket, _) = listener.accept().await.unwrap();
            let calls = calls.clone();
            tokio::spawn(async move {
                let mut received = Vec::new();
                let mut buffer = [0; 1024];
                loop {
                    let n = socket.read(&mut buffer).await.unwrap();
                    if n == 0 {
                        return;
                    }
                    received.extend_from_slice(&buffer[..n]);
                    if received.windows(4).any(|v| v == b"\r\n\r\n") {
                        break;
                    }
                }
                calls.fetch_add(1, std::sync::atomic::Ordering::SeqCst);
                let body = b"real-proxy-response";
                socket
                    .write_all(
                        format!(
                            "HTTP/1.1 200 OK\r\nContent-Length: {}\r\nConnection: close\r\n\r\n",
                            body.len()
                        )
                        .as_bytes(),
                    )
                    .await
                    .unwrap();
                socket.write_all(body).await.unwrap();
            });
        }
    });
    let state = tempfile::tempdir().unwrap();
    let kernel = host(state.path()).await;
    let (url, server) = serve(&kernel).await;
    let code = format!(
        r#"import json,sys,os,socket,urllib.request,urllib.error
json.load(sys.stdin)
port={port}
with urllib.request.urlopen('http://127.0.0.1:'+str(port)+'/allowed',timeout=5) as response: allowed=response.read().decode()
try:
 urllib.request.urlopen('http://localhost:'+str(port)+'/denied',timeout=5)
 raise Exception('unlisted host bypassed proxy')
except urllib.error.HTTPError as error: denied=error.code
direct=socket.socket()
direct.settimeout(.2)
try:
 direct.connect(('127.0.0.1',port))
 raise Exception('direct network bypassed proxy')
except (ConnectionRefusedError,TimeoutError,OSError): bypass=False
try:
 socket.socket(socket.AF_UNIX,socket.SOCK_STREAM)
 raise Exception('guest created UNIX socket')
except PermissionError: unix_denied=True
tunnel=socket.create_connection(('127.0.0.1',19753),5)
tunnel.sendall(('CONNECT 127.0.0.1:'+str(port)+' HTTP/1.1\r\nHost: 127.0.0.1\r\n\r\n').encode())
head=b''
while b'\r\n\r\n' not in head: head+=tunnel.recv(1024)
assert b'200 Connection Established' in head
tunnel.sendall(b'GET /tunnel HTTP/1.1\r\nHost: allowed\r\nConnection: close\r\n\r\n')
data=b''
while True:
 part=tunnel.recv(4096)
 if not part: break
 data+=part
assert b'real-proxy-response' in data
print(json.dumps(dict(allowed=allowed,denied=denied,bypass=bypass,unix_denied=unix_denied,tunnel=True)))
"#
    );
    let mut document = source(&code, false);
    document["modules"]
        .as_array_mut()
        .unwrap()
        .iter_mut()
        .find(|m| m["reference"]["id"] == "limits")
        .unwrap()["config"]["network_proxy"] = json!({"allowed":[{"host":"127.0.0.1","ports":[port],"allow_private":true}],"idle_timeout_ms":10000});
    document["modules"].as_array_mut().unwrap().push(json!({"reference":r("probe"),"factory":"tool.process_tree_artifact","config":{"contract":{"name":"probe","timeout_ms":20000},"entrypoint":"entry.py"},"dependencies":{"environment":r("environment"),"artifact":r("artifact"),"tree":r("limits")}}));
    document["programs"]["probe"] = json!({"kind":"tool","definition":{"name":"proxy-check","tool_packs":[r("probe")]},"call":{"id":"proxy-check","name":"probe","arguments":{}}});
    let imported = post(&url, "/import", document).await;
    let release = &imported["bundle"]["digest"];
    let stop = CancellationToken::new();
    let worker_stop = stop.clone();
    let worker_host = kernel.clone();
    let worker = tokio::spawn(async move { worker_host.run_worker(worker_stop, 1).await.unwrap() });
    post(&url,"/runs",json!({"run_id":"proxy","thread_id":"proxy","system":"process-sessions","release":release,"program":"probe"})).await;
    let result = tokio::time::timeout(Duration::from_secs(30), async {
        loop {
            let (_, view) = request(&url, reqwest::Method::GET, "/runs/proxy", Value::Null).await;
            if !view["execution"].is_null() && view["execution"]["status"] != "running" {
                break view;
            }
            tokio::time::sleep(Duration::from_millis(20)).await;
        }
    })
    .await
    .unwrap();
    assert_eq!(result["execution"]["status"], "completed", "{result}");
    for needle in ["real-proxy-response", "403", "unix_denied", "tunnel"] {
        assert!(result.to_string().contains(needle), "{result}");
    }
    assert_eq!(count.load(std::sync::atomic::Ordering::SeqCst), 2);
    stop.cancel();
    worker.await.unwrap();
    service.abort();
    server.abort();
}
