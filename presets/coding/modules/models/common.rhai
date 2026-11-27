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
fn raw_excerpt(text) {
    if type_of(text) != "string" { return ""; }
    if text.len() > 2048 { text.sub_string(0, 2048) } else { text }
}
fn tool_schema_for_wire(tool, s, strict_disabled) {
    let mode = s.strict_tools ?? "off";
    if mode == "off" || strict_disabled {
        return #{parameters: tool.function.parameters, strict: false};
    }
    let strict = json_schema_make_strict(tool.function.parameters);
    if strict == () {
        if mode == "require" {
            reject("strict_tool_schema", "tool schema cannot be expressed in strict mode: " + tool.function.name);
        }
        return #{parameters: tool.function.parameters, strict: false};
    }
    #{parameters: strict, strict: true}
}
fn is_strict_tool_limit_error(status, body) {
    if status != 400 || type_of(body) != "string" { return false; }
    let lower = body.to_lower();
    lower.contains("strict")
        || (lower.contains("grammar") && (lower.contains("tool") || lower.contains("schema") || lower.contains("limit")))
        || lower.contains("maximum of 20 strict")
}
fn admit(request, backend, endpoint) {
    let s = settings(request);
    if (s.hosted_tools ?? []).len() > 0 && backend == "chat_completions" {
        reject("hosted_tools", "This Chat Completions preset has no provider-native hosted tool contract; select an explicit Responses or Messages protocol.");
    }
    for tool in s.hosted_tools ?? [] {
        if tool.type == () || tool.type == "function" || tool.type == "custom" {
            reject("hosted_tools", "hosted_tools requires provider-native server tools, not local function definitions");
        }
    }
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
        if s.strict_tools == "require" && json_schema_make_strict(tool.function.parameters) == () {
            reject("strict_tool_schema", "tool schema cannot be expressed in strict mode: " + tool.function.name);
        }
        names.push(tool.function.name);
    }
    if backend == "messages" && s.json_schema != () && s.tool_choice != "none" { names.push("StructuredOutput"); }
    if type_of(s.tool_choice) == "map" && !names.contains(s.tool_choice.function) {
        reject("tool_choice", "selected tool is not available in this request");
    }
    if s.tool_choice == "required" && names.len() == 0 && (s.hosted_tools ?? []).len() == 0 {
        reject("tool_choice", "required tool choice has no available tool");
    }
    let strict_fallback = if (s.strict_tools ?? "off") == "prefer" && request.tools.len() > 0 { 1 } else { 0 };
    let calls = (if s.json_schema == () { 1 } else { 1 + (s.structured_output_retries ?? 2) })
        + (if backend == "messages" && (s.hosted_tools ?? []).len() > 0 { s.hosted_tool_rounds ?? 2 } else { 0 })
        + strict_fallback;
    let output = s.max_output_tokens ?? endpoint?.max_output_tokens;
    if output == () && backend == "messages" { output = 4096; }
    #{max_requests: calls, max_output_tokens: output}
}
fn http_error(args) {
    if args.state != () && type_of(args.state) == "map" && args.state.request != () {
        let st = args.state;
        let s = settings(st.request);
        if (s.strict_tools ?? "off") == "prefer" && !(st.strict_tools_disabled ?? false)
            && is_strict_tool_limit_error(args.status, args.body) {
            let next = make_exchange(st.model, st.request, st.trail, st.attempt, st.admission, true);
            next.state.hosted_rounds = st.hosted_rounds ?? 0;
            return #{next: next, input_tokens: 0, output_tokens: 0};
        }
    }
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
fn parsed_call_entry(id, name, arguments, request, stop_reason) {
    if type_of(id) != "string" || id == "" || type_of(name) != "string" || name == "" {
        reject("tool_call", "provider tool call requires a nonempty id and name");
    }
    let s = settings(request);
    let repair_mode = s.tool_json_repair ?? "lexical";
    let policy = s.malformed_tool_call_policy ?? "feedback";
    let raw = if type_of(arguments) == "string" { arguments } else { json_stringify(arguments) };
    let text = raw;
    let trimmed = text;
    trimmed.trim();
    if repair_mode != "strict" && trimmed == "" {
        return #{invocation: #{id: id, name: name, arguments: #{}}, malformed: ()};
    }
    let res = json_parse_detailed(text);
    if !res.ok && repair_mode != "strict" {
        let repaired = json_repair_lexical(text);
        if repaired != text {
            res = json_parse_detailed(repaired);
        }
    }
    let err = ();
    if res.ok {
        if type_of(res.value) != "map" {
            err = #{message: "tool arguments must be a JSON object", line: (), column: (), raw_excerpt: raw_excerpt(raw)};
        }
    } else {
        if repair_mode != "strict" {
            let split = json_split_concatenated(text);
            if split.ok {
                err = #{message: "provider concatenated " + split.items.len().to_string()
                    + " JSON objects into one tool call; emit separate tool calls",
                    line: res.line, column: res.column, raw_excerpt: raw_excerpt(raw)};
            }
        }
        if err == () {
            err = #{message: res.error, line: res.line, column: res.column, raw_excerpt: raw_excerpt(raw)};
        }
    }
    if err == () {
        return #{invocation: #{id: id, name: name, arguments: res.value}, malformed: ()};
    }
    let truncated = stop_reason == "length" || stop_reason == "max_tokens" || stop_reason == "max_output_tokens";
    if truncated {
        if (s.length_policy ?? "complete_tool_calls") == "complete_partial" {
            return ();
        }
        reject("completion_length", "provider truncated tool call arguments at token limit");
    }
    if policy == "fail" {
        reject("tool_arguments", "provider tool arguments are not complete JSON: " + err.message);
    }
    #{invocation: #{id: id, name: name, arguments: #{}}, malformed: err}
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
fn answer(state, output, calls, malformed, messages, stop, refusal, metadata, input, generated) {
    let provider = #{native: metadata, structured_output_repairs: state.attempt};
    if state.strict_tools_disabled ?? false {
        provider.strict_tools_fallback = true;
    }
    let res = #{output: output, tool_calls: calls, messages: messages, input_tokens: input, output_tokens: generated,
        info: #{stop_reason: stop, refusal: refusal, structured_output: (), provider: provider}};
    if malformed.len() > 0 {
        res.malformed_tool_calls = malformed;
    }
    res
}
fn validate_structured_candidate(schema, value) {
    let check = json_schema_validate(schema, value);
    if check.ok {
        return #{ok: true, value: value, error: ""};
    }
    if type_of(value) == "string" {
        let unwrapped = json_parse_detailed(json_strip_fence(value));
        if unwrapped.ok {
            let recheck = json_schema_validate(schema, unwrapped.value);
            if recheck.ok {
                return #{ok: true, value: unwrapped.value, error: ""};
            }
            return #{ok: false, value: value, error: "final answer does not satisfy its schema: " + recheck.summary};
        }
    }
    #{ok: false, value: value, error: "final answer does not satisfy its schema: " + check.summary}
}
fn finish(state, response) {
    let s = settings(state.request);
    let policy = s.length_policy ?? "complete_tool_calls";
    let schema_complete_at_cap = false;
    if response.info.stop_reason == "length" && s.json_schema != () && response.info.refusal == ()
        && response.tool_calls.len() == 0 {
        let stripped = json_strip_fence(response.output);
        let parsed = json_parse_detailed(stripped);
        if parsed.ok {
            let checked = validate_structured_candidate(s.json_schema, parsed.value);
            if checked.ok { schema_complete_at_cap = true; }
        }
    }
    if response.info.stop_reason == "length" && !schema_complete_at_cap && policy != "complete_partial"
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
            } else if response.malformed_tool_calls != () && response.malformed_tool_calls.contains(finals[0].id) {
                error = "structured finalization arguments are not valid JSON: " + response.malformed_tool_calls[finals[0].id].message;
            } else if type_of(finals[0].arguments) != "map" || !finals[0].arguments.contains("value")
                || finals[0].arguments.len() != 1 {
                error = "structured finalization requires only its value field";
            } else { value = finals[0].arguments.value; final_id = finals[0].id; }
        } else if response.tool_calls.len() > 0 { validate = false; }
        else {
            let stripped = json_strip_fence(response.output);
            let parsed = json_parse_detailed(stripped);
            if parsed.ok { value = parsed.value; }
            else { error = "final answer is not valid JSON: " + parsed.error + " (line " + parsed.line.to_string() + ", column " + parsed.column.to_string() + ")"; }
        }
        if validate && error == "" {
            let checked = validate_structured_candidate(s.json_schema, value);
            if checked.ok { value = checked.value; }
            else { error = checked.error; }
        }
        if validate && error == "" {
            response.info.structured_output = value;
            response.output = json_stringify(value);
            response.tool_calls = [];
            if response.contains("malformed_tool_calls") { response.remove("malformed_tool_calls"); }
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
        let next = make_exchange(state.model, state.request, state.trail, state.attempt + 1, state.admission, state.strict_tools_disabled ?? false);
        next.state.hosted_rounds = state.hosted_rounds ?? 0;
        return #{next: next, input_tokens: response.input_tokens, output_tokens: response.output_tokens};
    }
    response.messages = state.trail + response.messages;
    #{response: response}
}
