fn history(messages) {
    for message in messages {
        if message.role == "opaque" && (message.provider != "openai.chat_completions/v1"
            || type_of(message.value) != "map" || message.value.role != "assistant") { return false; }
    }
    true
}
fn chat_messages(messages) {
    if !history(messages) { reject("opaque_history", "Chat Completions requires an explicit conversion of foreign native history"); }
    let result = [];
    for message in messages {
        switch message.role {
            "opaque" => result.push(message.value),
            "system" | "user" => result.push(#{role: message.role, content: message.content}),
            "user_parts" => {
                let content = [];
                for part in message.content {
                    if part.type == "text" { content.push(#{type: "text", text: part.text}); }
                    else if part.type == "image" { content.push(#{type: "image_url", image_url: #{url: image_url(part.url)}}); }
                    else { reject("input_part", "unsupported canonical input part"); }
                }
                result.push(#{role: "user", content: content});
            }
            "assistant" => {
                let item = #{role: "assistant", content: message.content};
                let calls = [];
                for invocation in message.tool_calls {
                    calls.push(#{id: invocation.id, type: "function", function: #{name: invocation.name, arguments: json_stringify(invocation.arguments)}});
                }
                if calls.len() > 0 { item.tool_calls = calls; }
                result.push(item);
            }
            "tool" => {
                let parts = tool_parts(message);
                let text = if parts.is_error { "Tool error: " + parts.text } else { parts.text };
                result.push(#{role: "tool", tool_call_id: message.call_id, content: text});
                if parts.images.len() > 0 {
                    let images = [];
                    for url in parts.images { images.push(#{type: "image_url", image_url: #{url: url}}); }
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
    let body = #{model: model, messages: chat_messages(request.messages), stream: streaming};
    if streaming { body.stream_options = #{include_usage: true}; }
    if request.tools.len() > 0 { body.tools = request.tools; }
    let output = s.max_output_tokens ?? admission.max_output_tokens;
    if output != () { body.max_completion_tokens = output; }
    if s.temperature != () { body.temperature = s.temperature; }
    if s.top_p != () { body.top_p = s.top_p; }
    if s.reasoning_effort != () { body.reasoning_effort = s.reasoning_effort; }
    if s.tool_choice != () {
        body.tool_choice = if type_of(s.tool_choice) == "map" {
            #{type: "function", function: #{name: s.tool_choice.function}}
        } else { s.tool_choice };
    }
    if s.json_schema != () {
        body.messages.push(#{role: "system", content: "Return the final answer as JSON matching its declared schema."});
        body.response_format = if s.json_schema == true { #{type: "json_object"} }
            else { #{type: "json_schema", json_schema: #{name: "answer", strict: true, schema: s.json_schema}} };
    }
    #{path: "chat/completions", body: body, mode: if streaming { "sse" } else { "json" },
        state: #{model: model, request: request, trail: trail, attempt: attempt, admission: admission,
            message: #{role: "assistant", content: ""}, calls: [], usage: #{}, metadata: #{}, stop: (), seen: false}}
}
fn event(state, frame) {
    if frame.data == "[DONE]" {
        if !state.seen { reject("empty_response", "Chat Completions stream has no assistant response"); }
        return #{state: state, deltas: [], finished: true};
    }
    let data = json_parse(frame.data);
    if data.error != () {
        fail(#{category: "provider", message: "provider stream failed", status: (), retryable: false,
            retry_after_ms: (), code: (data.error.code ?? data.error.type ?? "stream_error").to_string(), details: ()});
    }
    let deltas = [];
    for key in data.keys() {
        let value = data[key];
        if key != "choices" && key != "usage" { state.metadata[key] = value; }
    }
    if data.usage != () { state.usage = data.usage; }
    if frame.event == "json" {
        if data.choices == () || data.choices.len() != 1 || data.choices[0].message.role != "assistant" {
            reject("completion_choices", "one assistant completion is required");
        }
        state.message = data.choices[0].message;
        state.stop = data.choices[0].finish_reason;
        state.seen = true;
        return #{state: state, deltas: [], finished: true};
    }
    for choice in data.choices ?? [] {
        if choice.index != 0 { reject("completion_choices", "multiple completion choices are not admitted"); }
        let delta = choice.delta ?? #{};
        state.seen = true;
        if choice.finish_reason != () { state.stop = choice.finish_reason; }
        for key in delta.keys() {
            let value = delta[key];
            if value == () || key == "tool_calls" { continue; }
            if key == "role" {
                if value != "assistant" { reject("message_role", "provider changed the assistant role"); }
            } else if type_of(value) == "string" {
                state.message[key] = (state.message[key] ?? "") + value;
                if key == "content" { deltas.push(#{kind: "text", text: value}); }
                else if key == "reasoning_content" || key == "reasoning" { deltas.push(#{kind: "reasoning", text: value}); }
            } else { state.message[key] = value; }
        }
        for invocation in delta.tool_calls ?? [] {
            check_index(invocation.index);
            while state.calls.len() <= invocation.index { state.calls.push(()); }
            let stored = state.calls[invocation.index] ?? #{id: "", type: "function", function: #{name: "", arguments: ""}};
            let function_delta = invocation.function ?? #{};
            if invocation.id != () {
                if stored.id != "" && stored.id != invocation.id { reject("tool_identity", "provider changed a streamed tool call id"); }
                stored.id = invocation.id;
            }
            if function_delta.name != () && stored.function.name != function_delta.name { stored.function.name += function_delta.name; }
            if function_delta.arguments != () { stored.function.arguments += function_delta.arguments; }
            state.calls[invocation.index] = stored;
            deltas.push(#{kind: "tool_call", index: invocation.index, id: invocation.id,
                name: function_delta.name, arguments: function_delta.arguments});
        }
    }
    #{state: state, deltas: deltas, finished: false}
}
fn final_response(state) {
    if state.calls.len() > 0 {
        let complete = [];
        for invocation in state.calls {
            if invocation == () { reject("tool_call", "provider left a gap in tool call indices"); }
            complete.push(invocation);
        }
        state.message.tool_calls = complete;
    }
    let calls = [];
    for invocation in state.message.tool_calls ?? [] { calls.push(parsed_call(invocation.id, invocation.function.name, invocation.function.arguments)); }
    let output = state.message.content ?? "";
    if type_of(output) != "string" { reject("completion_content", "assistant content must be text or null"); }
    let stop = if state.stop == "content_filter" { "content_filter" } else { state.stop };
    let refusal = state.message.refusal;
    if refusal == () && stop == "content_filter" { refusal = "provider refused the response"; }
    if output == "" && calls.len() == 0 && refusal == () { reject("empty_response", "Chat Completions returned no text or tool call"); }
    state.metadata.usage = state.usage;
    finish(state, answer(state, output, calls, [opaque("openai.chat_completions/v1", state.message)],
        stop, refusal, state.metadata, token_count(state.usage, "prompt_tokens", true), token_count(state.usage, "completion_tokens", true)))
}
switch args.phase {
    "admit" => admit(args.request, "chat_completions", args.endpoint_limits),
    "history" => history(args.messages),
    "http_error" => http_error(args),
    "request" => make_exchange(args.model, args.request, [], 0, args.admission),
    "event" => event(args.state, args.frame),
    "finish" => final_response(args.state),
    _ => reject("phase", "unknown model protocol phase")
}
