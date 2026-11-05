fn history(messages) {
    for message in messages {
        if message.role == "opaque" && (message.provider != "openai.responses/v1"
            || type_of(message.value) != "map" || type_of(message.value.type) != "string") { return false; }
    }
    true
}
fn response_input(messages) {
    if !history(messages) { reject("opaque_history", "Responses requires explicit conversion of foreign native history"); }
    let result = [];
    for message in messages {
        switch message.role {
            "opaque" => result.push(message.value),
            "system" | "user" => result.push(#{role: message.role, content: message.content}),
            "user_parts" => {
                let content = [];
                for part in message.content {
                    if part.type == "text" { content.push(#{type: "input_text", text: part.text}); }
                    else if part.type == "image" { content.push(#{type: "input_image", image_url: image_url(part.url)}); }
                    else { reject("input_part", "unsupported canonical input part"); }
                }
                result.push(#{role: "user", content: content});
            }
            "assistant" => {
                if message.content != "" { result.push(#{role: "assistant", content: message.content}); }
                for invocation in message.tool_calls {
                    result.push(#{type: "function_call", call_id: invocation.id, name: invocation.name, arguments: json_stringify(invocation.arguments)});
                }
            }
            "tool" => {
                let parts = tool_parts(message);
                let text = if parts.is_error { "Tool error: " + parts.text } else { parts.text };
                result.push(#{type: "function_call_output", call_id: message.call_id, output: text});
                if parts.images.len() > 0 {
                    let images = [];
                    for url in parts.images { images.push(#{type: "input_image", image_url: url}); }
                    result.push(#{role: "user", content: images});
                }
            }
            _ => reject("message_role", "unsupported canonical message role")
        }
    }
    result
}
fn make_exchange(model, request, trail, attempt, admission) {
    let s = settings(request);
    let streaming = s.stream ?? true;
    let body = #{model: model, input: response_input(request.messages), stream: streaming, store: false};
    let tools = [];
    for tool in request.tools {
        let mapped = #{type: "function", name: tool.function.name, parameters: tool.function.parameters};
        if tool.function.description != () { mapped.description = tool.function.description; }
        tools.push(mapped);
    }
    for tool in s.hosted_tools ?? [] { tools.push(tool); }
    if tools.len() > 0 { body.tools = tools; }
    let output = s.max_output_tokens ?? admission.max_output_tokens;
    if output != () { body.max_output_tokens = output; }
    if s.temperature != () { body.temperature = s.temperature; }
    if s.top_p != () { body.top_p = s.top_p; }
    if s.prompt_cache_key != () { body.prompt_cache_key = s.prompt_cache_key; }
    let reasoning = #{};
    if s.reasoning_effort != () { reasoning.effort = s.reasoning_effort; }
    if s.reasoning_summary != () && s.reasoning_summary != "none" { reasoning.summary = s.reasoning_summary; }
    if reasoning.len() > 0 { body.reasoning = reasoning; }
    if s.tool_choice != () {
        body.tool_choice = if type_of(s.tool_choice) == "map" { #{type: "function", name: s.tool_choice.function} } else { s.tool_choice };
    }
    if s.json_schema != () {
        body.input.push(#{role: "system", content: "Return the final answer as JSON matching its declared schema."});
        body.text = #{format: if s.json_schema == true { #{type: "json_object"} }
            else { #{type: "json_schema", name: "answer", strict: true, schema: s.json_schema} }};
    }
    #{path: "responses", body: body, mode: if streaming { "sse" } else { "json" },
        state: #{model: model, request: request, trail: trail, attempt: attempt, admission: admission,
            response: #{}, items: [], completed: [], seen: false}}
}
fn response_error(error) {
    fail(#{category: "provider", message: "Responses provider failed the completion", status: (),
        retryable: error.code == "server_error" || error.code == "rate_limit_exceeded",
        retry_after_ms: (), code: error.code ?? "response_failed", details: ()});
}
fn event(state, frame) {
    let data = json_parse(frame.data);
    if frame.event == "json" {
        if data.error != () { response_error(data.error); }
        state.response = data;
        state.seen = true;
        return #{state: state, deltas: [], finished: true};
    }
    let kind = data.type ?? frame.event;
    let deltas = [];
    if kind == "response.created" || kind == "response.in_progress" { state.response = data.response; }
    else if kind == "response.output_item.added" || kind == "response.output_item.done" {
        check_index(data.output_index);
        while state.items.len() <= data.output_index { state.items.push(()); state.completed.push(false); }
        state.items[data.output_index] = data.item;
        state.completed[data.output_index] = kind == "response.output_item.done";
        state.seen = true;
        if kind == "response.output_item.added" && data.item.type == "function_call" {
            deltas.push(#{kind: "tool_call", index: data.output_index, id: data.item.call_id,
                name: data.item.name, arguments: data.item.arguments});
        } else { deltas.push(#{kind: "status", name: kind, data: data}); }
    } else if kind == "response.output_text.delta" { deltas.push(#{kind: "text", text: data.delta}); }
    else if kind == "response.reasoning_summary_text.delta" || kind == "response.reasoning_text.delta" {
        deltas.push(#{kind: "reasoning", text: data.delta});
    } else if kind == "response.function_call_arguments.delta" {
        check_index(data.output_index);
        deltas.push(#{kind: "tool_call", index: data.output_index, id: (), name: (), arguments: data.delta});
    } else if kind == "response.completed" || kind == "response.incomplete" {
        state.response = data.response;
        if state.response.output == () {
            if state.items.len() == 0 { reject("truncated_stream", "Responses has no completed output items"); }
            for complete in state.completed { if !complete { reject("truncated_stream", "Responses left an output item incomplete"); } }
            state.response.output = state.items;
        }
        return #{state: state, deltas: deltas, finished: true};
    } else if kind == "response.failed" { response_error(data.response.error ?? #{}); }
    else if kind == "error" { response_error(data.error ?? data); }
    else if kind == "response.cancelled" { reject("response_cancelled", "Responses provider cancelled the completion"); }
    else { deltas.push(#{kind: "status", name: kind, data: data}); }
    #{state: state, deltas: deltas, finished: false}
}
fn final_response(state) {
    let response = state.response;
    if response.error != () || response.status == "failed" { response_error(response.error ?? #{}); }
    let output = "";
    let refusal = ();
    let messages = [];
    let calls = [];
    let assistant = false;
    for item in response.output ?? [] {
        messages.push(opaque("openai.responses/v1", item));
        if item.type == "message" {
            if item.role != "assistant" { reject("message_role", "Responses output message is not an assistant turn"); }
            assistant = true;
            for part in item.content {
                if part.type == "output_text" { output += part.text; }
                else if part.type == "refusal" { refusal = (refusal ?? "") + part.refusal; }
            }
        } else if item.type == "function_call" { calls.push(parsed_call(item.call_id, item.name, item.arguments)); }
    }
    if !assistant && calls.len() == 0 { reject("empty_response", "Responses has neither an assistant message nor a local tool call"); }
    if output == "" && calls.len() == 0 && refusal == () { reject("empty_response", "Responses returned no text or tool call"); }
    let stop = if response.incomplete_details?.reason == "max_output_tokens" { "length" }
        else if refusal != () || response.incomplete_details?.reason == "content_filter" { "content_filter" }
        else if calls.len() > 0 { "tool_calls" } else { "stop" };
    let usage = response.usage ?? #{};
    finish(state, answer(state, output, calls, messages, stop, refusal, response,
        token_count(usage, "input_tokens", true), token_count(usage, "output_tokens", true)))
}
switch args.phase {
    "admit" => admit(args.request, "responses", args.endpoint_limits),
    "history" => history(args.messages),
    "http_error" => http_error(args),
    "request" => make_exchange(args.model, args.request, [], 0, args.admission),
    "event" => event(args.state, args.frame),
    "finish" => final_response(args.state),
    _ => reject("phase", "unknown model protocol phase")
}
