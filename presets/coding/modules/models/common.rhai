// Pure shared protocol policy. Network authority and credentials never enter args.
fn reject(code, message) {
    fail(#{category: "protocol", message: message, status: (), retryable: false,
        retry_after_ms: (), code: code, details: ()});
}
fn try_json(text) {
    try { return #{ok: true, value: json_parse(text)}; }
    catch (error) { return #{ok: false, value: ()}; }
}
fn settings(request) { request.settings ?? #{} }
fn admit(request, backend, endpoint) {
    let s = settings(request);
    if backend != "responses" && (s.reasoning_summary != () || s.prompt_cache_key != ()) {
        reject("invalid_settings", "reasoning_summary and prompt_cache_key require the Responses protocol");
    }
    if backend != "messages" && s.cache_prompt != () { reject("invalid_settings", "cache_prompt is a Messages protocol policy"); }
    if backend == "messages" && s.temperature != () && s.temperature > 1 {
        reject("invalid_settings", "Messages temperature must be between zero and one");
    }
    if s.structured_output_retries != () && s.json_schema == () {
        reject("invalid_settings", "structured_output_retries requires json_schema");
    }
    if s.json_schema != () {
        try { json_schema_valid(s.json_schema, ()); }
        catch (error) { reject("invalid_schema", "structured output requires a valid local JSON Schema"); }
    }
    let names = [];
    for tool in request.tools {
        if names.contains(tool.function.name) { reject("duplicate_tool", "tool names must be unique"); }
        if s.json_schema != () && tool.function.name == "StructuredOutput" {
            reject("structured_tool_collision", "StructuredOutput is reserved while a final answer schema is active");
        }
        names.push(tool.function.name);
    }
    if backend == "messages" && s.json_schema != () && s.tool_choice != "none" { names.push("StructuredOutput"); }
    if type_of(s.tool_choice) == "map" && !names.contains(s.tool_choice.function) {
        reject("tool_choice", "selected tool is not available in this request");
    }
    if s.tool_choice == "required" && names.len() == 0 {
        reject("tool_choice", "required tool choice has no available tool");
    }
    let calls = if s.json_schema == () { 1 } else { 1 + (s.structured_output_retries ?? 2) };
    let output = s.max_output_tokens ?? endpoint?.max_output_tokens;
    if output == () && backend == "messages" { output = 4096; }
    #{max_requests: calls, max_output_tokens: output}
}
fn http_error(args) {
    let decoded = try_json(args.body);
    let code = "http_" + args.status.to_string();
    if decoded.ok {
        let value = if type_of(decoded.value) == "map" { decoded.value.error ?? decoded.value } else { decoded.value };
        if type_of(value) == "map" { code = (value.code ?? value.type ?? code).to_string(); }
    }
    let category = if args.status == 401 || args.status == 403 { "authentication" }
        else if args.status == 429 { "rate_limit" } else { "http" };
    fail(#{category: category, message: "provider rejected request", status: args.status,
        retryable: args.status == 429 || (args.status >= 500 && args.status <= 599),
        retry_after_ms: args.retry_after_ms, code: code, details: ()});
}
fn image_url(url) {
    if !(url.starts_with("https://") || url.starts_with("http://") || url.starts_with("data:image/")) {
        reject("image_input", "image input requires an HTTP(S) URL or image data URI");
    }
    url
}
fn text_value(value) { if type_of(value) == "string" { value } else { json_stringify(value) } }
fn tool_parts(message) {
    let content = message.content;
    let typed = type_of(content) == "map" && content.len() == 3
        && type_of(content.tool_id) == "string" && content.contains("value")
        && type_of(content.model_output) == "array";
    let payload = if typed { content.value } else { content };
    let blocks = if typed { content.model_output } else { () };
    if blocks == () && type_of(payload) == "map" { blocks = payload.content; }
    blocks = blocks ?? [];
    if type_of(blocks) != "array" { blocks = []; }
    let text = "";
    if !typed && type_of(payload) == "map" && payload.structuredContent != () {
        text = json_stringify(payload.structuredContent);
    }
    let images = [];
    for block in blocks {
        if block.type == "text" {
            if text != "" { text += "\n"; }
            text += block.text;
        } else if block.type == "image" && block.data != () {
            let mime = block.mime_type ?? block.mimeType;
            if mime == () { reject("image_input", "image tool output is missing its media type"); }
            images.push(image_url("data:" + mime + ";base64," + block.data));
        } else {
            if text != "" { text += "\n"; }
            text += json_stringify(block);
        }
    }
    if text == "" { text = text_value(payload); }
    #{text: text, images: images, is_error: message.is_error}
}
fn opaque(provider, value) { #{role: "opaque", provider: provider, value: value} }
fn check_index(index) {
    if type_of(index) != "i64" || index < 0 || index >= 1024 {
        reject("stream_index", "provider content/tool index is outside the bounded range");
    }
}
fn parsed_call(id, name, arguments) {
    if type_of(id) != "string" || id == "" || type_of(name) != "string" || name == "" {
        reject("tool_call", "provider tool call requires a nonempty id and name");
    }
    let parsed = try_json(arguments);
    if !parsed.ok { reject("tool_arguments", "provider tool arguments are not complete JSON"); }
    #{id: id, name: name, arguments: parsed.value}
}
fn token_count(usage, key, required) {
    if type_of(usage) != "map" || !usage.contains(key) {
        if required { reject("usage_unavailable", "provider completion is missing token usage"); }
        return 0;
    }
    if type_of(usage[key]) != "i64" || usage[key] < 0 {
        reject("usage_invalid", "provider token usage must be a nonnegative integer");
    }
    usage[key]
}
fn answer(state, output, calls, messages, stop, refusal, metadata, input, generated) {
    #{output: output, tool_calls: calls, messages: messages, input_tokens: input, output_tokens: generated,
      info: #{stop_reason: stop, refusal: refusal, structured_output: (),
        provider: #{native: metadata, structured_output_repairs: state.attempt}}}
}
fn finish(state, response) {
    let s = settings(state.request);
    let policy = s.length_policy ?? "complete_tool_calls";
    if response.info.stop_reason == "length" && policy != "complete_partial"
        && !(policy == "complete_tool_calls" && response.tool_calls.len() > 0) {
        reject("completion_length", "provider stopped before completing an admissible answer");
    }
    let error = "";
    if s.json_schema != () && response.info.refusal == () {
        let finals = [];
        for invocation in response.tool_calls { if invocation.name == "StructuredOutput" { finals.push(invocation); } }
        let value = ();
        let final_id = ();
        let validate = true;
        if finals.len() > 0 {
            if finals.len() != 1 || response.tool_calls.len() != 1 {
                error = "structured finalization must be the only tool call";
            } else if type_of(finals[0].arguments) != "map" || !finals[0].arguments.contains("value")
                || finals[0].arguments.len() != 1 {
                error = "structured finalization requires only its value field";
            } else { value = finals[0].arguments.value; final_id = finals[0].id; }
        } else if response.tool_calls.len() > 0 { validate = false; }
        else {
            let parsed = try_json(response.output);
            if parsed.ok { value = parsed.value; }
            else { error = "final answer is not JSON"; }
        }
        if validate && error == "" && !json_schema_valid(s.json_schema, value) { error = "final answer does not satisfy its schema"; }
        if validate && error == "" {
            response.info.structured_output = value;
            response.output = json_stringify(value);
            response.tool_calls = [];
            if final_id != () {
                response.messages.push(#{role: "tool", call_id: final_id,
                    content: #{structured_output: value}, is_error: false});
            }
        }
    }
    if error != "" {
        if state.attempt >= (s.structured_output_retries ?? 2) { reject("structured_output_invalid", error); }
        let repair = response.messages;
        for invocation in response.tool_calls {
            repair.push(#{role: "tool", call_id: invocation.id, content: "Not executed: invalid structured finalization. " + error, is_error: true});
        }
        repair.push(#{role: "user", content: "Correct the final answer to match the declared JSON Schema. " + error
            + ". No tool in an invalid finalization batch was executed."});
        state.trail += repair;
        state.request.messages += repair;
        let next = make_exchange(state.model, state.request, state.trail, state.attempt + 1, state.admission);
        return #{next: next, input_tokens: response.input_tokens, output_tokens: response.output_tokens};
    }
    response.messages = state.trail + response.messages;
    #{response: response}
}
