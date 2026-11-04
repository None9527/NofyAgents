fn history(messages) {
    for message in messages {
        if message.role == "opaque" && (message.provider != "anthropic.messages/v1"
            || type_of(message.value) != "map" || message.value.role != "assistant"
            || message.value.len() != 2 || type_of(message.value.content) != "array") { return false; }
    }
    true
}
fn message_image(url) {
    image_url(url);
    if url.starts_with("data:") {
        let parts = url.split(",");
        if parts.len() != 2 || !parts[0].ends_with(";base64") || parts[1] == "" {
            reject("image_input", "Messages image data URI requires a base64 payload");
        }
        let mime = parts[0].sub_string(5).split(";")[0];
        return #{type: "image", source: #{type: "base64", media_type: mime, data: parts[1]}};
    }
    #{type: "image", source: #{type: "url", url: url}}
}
fn append_message(messages, role, content) {
    if content.len() == 0 { return messages; }
    if messages.len() > 0 && messages[messages.len() - 1].role == role { messages[messages.len() - 1].content += content; }
    else { messages.push(#{role: role, content: content}); }
    messages
}
fn cache_blocks(blocks) {
    let i = blocks.len() - 1;
    while i >= 0 {
        if ["text", "image", "tool_use", "tool_result"].contains(blocks[i].type) {
            blocks[i].cache_control = #{type: "ephemeral"}; break;
        }
        i -= 1;
    }
    blocks
}
fn make_exchange(model, request, trail, attempt, admission) {
    if !history(request.messages) { reject("opaque_history", "Messages requires explicit conversion of foreign native history"); }
    let s = settings(request);
    let thinking = s.reasoning_effort != () && s.reasoning_effort != "none" && s.reasoning_effort != "minimal";
    let system = [];
    let messages = [];
    for message in request.messages {
        let content = [];
        let role = "user";
        switch message.role {
            "system" => { system.push(#{type: "text", text: message.content}); continue; }
            "user" => content.push(#{type: "text", text: message.content}),
            "user_parts" => {
                for part in message.content {
                    if part.type == "text" { content.push(#{type: "text", text: part.text}); }
                    else if part.type == "image" { content.push(message_image(part.url)); }
                    else { reject("input_part", "unsupported canonical input part"); }
                }
            }
            "assistant" => {
                role = "assistant";
                if message.content != "" { content.push(#{type: "text", text: message.content}); }
                for invocation in message.tool_calls { content.push(#{type: "tool_use", id: invocation.id, name: invocation.name, input: invocation.arguments}); }
            }
            "opaque" => {
                role = "assistant";
                content = message.value.content;
                for block in content {
                    if !thinking && (block.type == "thinking" || block.type == "redacted_thinking") {
                        reject("thinking_history", "disabling thinking requires an explicit conversion of signed native history");
                    }
                }
            }
            "tool" => {
                let parts = tool_parts(message);
                let result = [#{type: "text", text: parts.text}];
                for url in parts.images { result.push(message_image(url)); }
                content.push(#{type: "tool_result", tool_use_id: message.call_id, content: result, is_error: parts.is_error});
            }
            _ => reject("message_role", "unsupported canonical message role")
        }
        messages = append_message(messages, role, content);
    }
    let tools = [];
    if s.tool_choice != "none" {
        for tool in request.tools {
            let mapped = #{name: tool.function.name, input_schema: tool.function.parameters};
            if tool.function.description != () { mapped.description = tool.function.description; }
            tools.push(mapped);
        }
    }
    if s.json_schema != () {
        if s.tool_choice != "none" {
            tools.push(#{name: "StructuredOutput", description: "Submit only the final structured answer in value, without other tool calls.",
                input_schema: #{type: "object", required: ["value"], additionalProperties: false,
                    properties: #{value: #{description: "The value must satisfy this JSON Schema: " + json_stringify(s.json_schema)}}}});
            system.push(#{type: "text", text: "For the final answer call StructuredOutput with {value: your_answer}. Its value must satisfy "
                + json_stringify(s.json_schema) + ". Do not combine finalization with other tools."});
        } else {
            system.push(#{type: "text", text: "Return the final answer as JSON satisfying " + json_stringify(s.json_schema)});
        }
    }
    if s.cache_prompt ?? true {
        system = cache_blocks(system);
        if messages.len() > 0 {
            messages[messages.len() - 1].content = cache_blocks(messages[messages.len() - 1].content);
            let previous = messages.len() - 2;
            while previous >= 0 && messages[previous].role != "assistant" { previous -= 1; }
            previous -= 1;
            while previous >= 0 && messages[previous].role != "user" { previous -= 1; }
            if previous >= 0 { messages[previous].content = cache_blocks(messages[previous].content); }
        }
    }
    let streaming = s.stream ?? true;
    let body = #{model: model, messages: messages, max_tokens: s.max_output_tokens ?? admission.max_output_tokens ?? 4096, stream: streaming};
    if system.len() > 0 { body.system = system; }
    if tools.len() > 0 { body.tools = tools; }
    if s.tool_choice != () && s.tool_choice != "none" {
        body.tool_choice = if type_of(s.tool_choice) == "map" { #{type: "tool", name: s.tool_choice.function} }
            else if s.tool_choice == "required" { #{type: "any"} } else { #{type: "auto"} };
    }
    if thinking {
        body.thinking = #{type: "adaptive", display: "summarized"};
        body.output_config = #{effort: if s.reasoning_effort == "xhigh" { "high" } else { s.reasoning_effort }};
    }
    if s.temperature != () { body.temperature = s.temperature; }
    if s.top_p != () { body.top_p = s.top_p; }
    #{path: "messages", body: body, mode: if streaming { "sse" } else { "json" },
        state: #{model: model, request: request, trail: trail, attempt: attempt, admission: admission,
            message: #{role: "assistant", content: []}, blocks: [], arguments: [], stopped: [], usage: #{}}}
}
fn event(state, frame) {
    let data = json_parse(frame.data);
    let kind = data.type ?? frame.event;
    let deltas = [];
    if frame.event == "json" {
        if data.error != () { reject("provider_error", "Messages provider returned an error"); }
        state.message = data;
        state.usage = data.usage ?? #{};
        return #{state: state, deltas: [], finished: true};
    }
    if kind == "message_start" {
        if data.message.role != "assistant" { reject("message_role", "Messages stream did not start an assistant turn"); }
        state.message = data.message;
        state.usage = data.message.usage ?? #{};
    } else if kind == "content_block_start" {
        check_index(data.index);
        while state.blocks.len() <= data.index { state.blocks.push(()); state.arguments.push(""); state.stopped.push(false); }
        if state.blocks[data.index] != () { reject("stream_index", "Messages repeated a content block start"); }
        state.blocks[data.index] = data.content_block;
        if data.content_block.type == "tool_use" {
            deltas.push(#{kind: "tool_call", index: data.index, id: data.content_block.id, name: data.content_block.name,
                arguments: if data.content_block.input != #{} { json_stringify(data.content_block.input) } else { () }});
        } else if data.content_block.type == "text" && data.content_block.text != "" {
            deltas.push(#{kind: "text", text: data.content_block.text});
        } else if data.content_block.type == "thinking" && data.content_block.thinking != "" {
            deltas.push(#{kind: "reasoning", text: data.content_block.thinking});
        }
    } else if kind == "content_block_delta" || kind == "content_block_stop" {
        check_index(data.index);
        if data.index >= state.blocks.len() || state.blocks[data.index] == () || state.stopped[data.index] {
            reject("stream_index", "Messages delta/stop has no open content block");
        }
        let block = state.blocks[data.index];
        if kind == "content_block_stop" {
            if block.type == "tool_use" && state.arguments[data.index] != "" {
                let parsed = try_json(state.arguments[data.index]);
                if !parsed.ok { reject("tool_arguments", "Messages tool input is not complete JSON"); }
                block.input = parsed.value;
            }
            state.stopped[data.index] = true;
        } else {
            let delta = data.delta;
            if (delta.type == "text_delta" || delta.type == "citations_delta") && block.type != "text"
                || (delta.type == "thinking_delta" || delta.type == "signature_delta") && block.type != "thinking"
                || delta.type == "input_json_delta" && block.type != "tool_use" {
                reject("content_block_type", "Messages delta does not match its open content block");
            }
            switch delta.type {
                "text_delta" => { block.text += delta.text; deltas.push(#{kind: "text", text: delta.text}); }
                "thinking_delta" => { block.thinking += delta.thinking; deltas.push(#{kind: "reasoning", text: delta.thinking}); }
                "signature_delta" => { block.signature = (block.signature ?? "") + delta.signature; }
                "input_json_delta" => {
                    state.arguments[data.index] += delta.partial_json;
                    deltas.push(#{kind: "tool_call", index: data.index, id: (), name: (), arguments: delta.partial_json});
                }
                "citations_delta" => { block.citations = (block.citations ?? []) + [delta.citation]; }
                _ => reject("unsupported_delta", "Messages needs an explicit protocol update for this native delta")
            }
        }
        state.blocks[data.index] = block;
    } else if kind == "message_delta" {
        for key in data.delta.keys() { state.message[key] = data.delta[key]; }
        let usage = data.usage ?? #{};
        for key in usage.keys() { state.usage[key] = usage[key]; }
    } else if kind == "message_stop" {
        for complete in state.stopped { if !complete { reject("truncated_stream", "Messages left a content block open"); } }
        state.message.content = state.blocks;
        return #{state: state, deltas: deltas, finished: true};
    } else if kind == "error" {
        let code = data.error.type ?? "stream_error";
        fail(#{category: "provider", message: "Messages provider stream failed", status: (),
            retryable: code == "overloaded_error" || code == "rate_limit_error", retry_after_ms: (), code: code, details: ()});
    } else if kind != "ping" { deltas.push(#{kind: "status", name: kind, data: data}); }
    #{state: state, deltas: deltas, finished: false}
}
fn final_response(state) {
    let output = "";
    let calls = [];
    for block in state.message.content {
        if block.type == "text" { output += block.text; }
        else if block.type == "tool_use" { calls.push(parsed_call(block.id, block.name, json_stringify(block.input))); }
    }
    let reason = state.message.stop_reason;
    let refusal = if reason == "refusal" { "provider refused the response" } else { () };
    if output == "" && calls.len() == 0 && refusal == () { reject("empty_response", "Messages returned no text or tool call"); }
    let stop = if reason == "max_tokens" { "length" } else if reason == "tool_use" { "tool_calls" }
        else if reason == "refusal" { "content_filter" } else { reason };
    state.message.usage = state.usage;
    let native = #{role: "assistant", content: state.message.content};
    let usage = state.usage;
    finish(state, answer(state, output, calls, [opaque("anthropic.messages/v1", native)], stop, refusal, state.message,
        token_count(usage, "input_tokens", true) + token_count(usage, "cache_creation_input_tokens", false)
            + token_count(usage, "cache_read_input_tokens", false), token_count(usage, "output_tokens", true)))
}
switch args.phase {
    "admit" => admit(args.request, "messages", args.endpoint_limits),
    "history" => history(args.messages),
    "http_error" => http_error(args),
    "request" => make_exchange(args.model, args.request, [], 0, args.admission),
    "event" => event(args.state, args.frame),
    "finish" => final_response(args.state),
    _ => reject("phase", "unknown model protocol phase")
}
