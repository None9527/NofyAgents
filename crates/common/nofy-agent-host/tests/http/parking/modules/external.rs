use super::*;
use nofy_agent_runtime::{ModelResponse, RunOutcome};
use nofy_tool_types::ToolDefinition;

fn program(sample: bool) -> String {
    let update = r#"let messages=[args.state.messages[0],#{role:"assistant",content:args.parameters.tag,tool_calls:[]}];
        for i in args.retained_turn_start..args.state.messages.len() {messages.push(args.state.messages[i]);}
        #{messages:messages,retained_from:args.retained_turn_start,retained_at:2,metadata:#{source:args.parameters.tag}}"#;
    if sample {
        r#"if args.phase == "plan" { if args.state.steps == 1 {#{compact:true}} else {()} }
        else if args.phase == "prepare" {#{kind:"sample",request:#{messages:[#{role:"user",content:"__context_summary__"}],tools:[],settings:#{max_output_tokens:16}},data:#{}}}
        else {let messages=[args.state.messages[0],#{role:"assistant",content:args.response.output,tool_calls:[]}];
          for i in args.retained_turn_start..args.state.messages.len() {messages.push(args.state.messages[i]);}
          #{messages:messages,retained_from:args.retained_turn_start,retained_at:2,metadata:#{source:"sampled"}}}"#.into()
    } else {
        format!(
            r#"if args.phase == "plan" {{if args.state.steps == 1 {{#{{compact:true}}}} else {{()}}}}
            else {{let update={{ {update} }}; #{{kind:"update",update:update}}}}"#
        )
    }
}
fn document(url: &str, tag: &str, sample: bool, deny: bool, unmetered: bool) -> Value {
    let mut doc = if unmetered {
        source(url, true)
    } else {
        base_source(url)
    };
    for module in doc["modules"].as_array_mut().unwrap() {
        if module["reference"] == r("service") {
            module["config"]["methods"] = json!(["GET", "POST"]);
        }
        if module["reference"] == r("quota") {
            module["config"]["limits"] = json!({"max_model_calls":8,"max_tool_calls":8});
        }
    }
    let mut context = json!({"reference":r("external-context"),"factory":"context.programmed","config":{"source":program(sample),"parameters":{"tag":format!("context-{tag}")},"model":sample}});
    if sample {
        context["dependencies"] = json!({"model":r("model")});
    }
    doc["modules"].as_array_mut().unwrap().extend([
        json!({"reference":r("external-source"),"factory":"tool_source.http","config":{"catalog_path":format!("{tag}/catalog"),"invoke_path":format!("{tag}/invoke")},"dependencies":{"connection":r("service")}}),context
    ]);
    let agent = &mut doc["programs"]["execute"]["definition"];
    agent["tool_packs"] = json!([]);
    agent["tool_sources"] = json!([r("external-source")]);
    agent["context_policies"] = json!([r("external-context")]);
    if deny {
        doc["modules"].as_array_mut().unwrap().push(json!({"reference":r("external-floor"),"factory":"policy.tool_scope","config":{"allowed":["remote_one","after_effect"]}}));
        doc["required_policies"] = json!([r("external-floor")]);
    }
    doc
}
#[derive(Clone)]
struct Service {
    counts: Arc<[AtomicUsize; 6]>,
    requests: Arc<Mutex<Vec<Value>>>,
    start_release: CancellationToken,
    summary_release: CancellationToken,
    crash: bool,
}
impl Service {
    fn new(crash: bool) -> Self {
        Self {
            counts: Arc::new(std::array::from_fn(|_| AtomicUsize::new(0))),
            requests: Arc::new(Mutex::new(vec![])),
            start_release: CancellationToken::new(),
            summary_release: CancellationToken::new(),
            crash,
        }
    }
}
fn definition(tag: &str) -> Value {
    json!({"revision":tag,"tools":[ToolDefinition::function(format!("remote_{tag}"), Some("Versioned external method"), json!({"type":"object","additionalProperties":false}))]})
}
async fn fixture(state: &Service) -> Serving {
    let models = state.clone();
    let counts = state.counts.clone();
    let release = state.start_release.clone();
    let one_list = state.counts.clone();
    let two_list = state.counts.clone();
    let one = state.counts.clone();
    let two = state.counts.clone();
    let hook = state.counts.clone();
    serve(Router::new()
        .route("/v1/chat/completions",route_post(move|Json(body):Json<Value>| {let state=models.clone();async move {
            state.requests.lock().unwrap().push(body.clone());
            let summary=body["messages"].as_array().unwrap().iter().any(|m| m["content"] == "__context_summary__");
            let frames=if summary {
                state.counts[5].fetch_add(1,Ordering::SeqCst);
                if state.crash {state.summary_release.cancelled().await;}
                nofy_test_support::sse::chat_completion_events_exact("__external_summary__", "test-model")
            } else {
                state.counts[0].fetch_add(1,Ordering::SeqCst);
                let tools=body["tools"].as_array().cloned().unwrap_or_default();
                let new=tools.iter().any(|t| t["function"]["name"]=="remote_two");
                let old_done=body["messages"].as_array().unwrap().iter().any(|m| m["role"]=="tool" && m["tool_call_id"]=="old-call");
                let new_done=body["messages"].as_array().unwrap().iter().any(|m| m["role"]=="tool" && m["tool_call_id"]=="new-call");
                if new_done || (!new && old_done) {nofy_test_support::sse::chat_completion_events_exact("external complete", "test-model")}
                else {
                    if !new && !state.crash {state.start_release.cancelled().await;}
                    nofy_test_support::sse::chat_completions_reasoning_then_tool_call_events("", if new {"new-call"} else {"old-call"}, if new {"remote_two"} else {"remote_one"}, "{}", "test-model").into_iter().map(|f|axum::response::sse::Event::default().data(f.data)).collect()
                }
            };
            Sse::new(futures::stream::iter(frames.into_iter().map(Ok::<_,Infallible>)))
        }}))
        .route("/one/catalog",axum::routing::get(move||{let count=one_list.clone();async move {count[1].fetch_add(1,Ordering::SeqCst);Json(definition("one"))}}))
        .route("/two/catalog",axum::routing::get(move||{let count=two_list.clone();async move {count[1].fetch_add(1,Ordering::SeqCst);Json(definition("two"))}}))
        .route("/one/invoke",route_post(move|Json(body):Json<Value>|{let count=one.clone();async move {
            assert_eq!(body["revision"],"one");assert_eq!(body["tool"],"remote_one");count[2].fetch_add(1,Ordering::SeqCst);Json(json!({"revision":"one","value":{"done":"one"}}))
        }}))
        .route("/two/invoke",route_post(move|Json(body):Json<Value>|{let count=two.clone();async move {
            assert_eq!(body["revision"],"two");assert_eq!(body["tool"],"remote_two");count[3].fetch_add(1,Ordering::SeqCst);Json(json!({"revision":"two","value":{"done":"two"}}))
        }}))
        .route("/after",route_post(move||{let count=hook.clone();async move {count[4].fetch_add(1,Ordering::SeqCst);Json(json!({"decision":"continue"}))}}))
        .route("/count",axum::routing::get(move||{let count=counts.clone();async move {Json(json!({"models":count[0].load(Ordering::SeqCst),"summaries":count[5].load(Ordering::SeqCst)}))}}))
        .route("/release-model",route_post(move||{let release=release.clone();async move {release.cancel();Json(json!({"released":true}))}}))
    ).await
}
fn update(id: &str, release: &Value, revision: u64) -> Value {
    json!({"command_id":id,"run_id":"root","command":{"kind":"update_modules","park_command_id":"park","expected_revision":revision,"release":release["bundle"]["digest"],"program":"execute","update":{"context_policies":true,"tool_sources":true}}})
}
#[path = "external/live.rs"]
mod live;
#[path = "external/sampling.rs"]
mod sampling;
