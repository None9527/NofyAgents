if args.phase == "admit" { return #{max_requests: args.max_requests}; }
if args.phase == "http_error" { return (); }
if args.phase == "history" {
    for message in args.messages {
        if message.role == "opaque" && message.provider != "wire-fixture" { return false; }
    }
    return true;
}
if args.phase == "request" {
    let mode = args.request.settings.mode ?? "sse";
    return #{path: args.request.settings.path ?? "invoke", mode: mode,
        body: #{model: args.model, request: args.request, attempt: 0},
        state: #{output: "", input_tokens: 0, output_tokens: 0, attempt: 0,
            messages: [], tool_calls: [], request: args.request, mode: mode}};
}
if args.phase == "event" {
    let wire = json_parse(args.frame.data);
    let state = args.state;
    state.output += wire.text ?? "";
    state.input_tokens += wire.input_tokens ?? 0;
    state.output_tokens += wire.output_tokens ?? 0;
    state.messages += wire.messages ?? [];
    state.tool_calls += wire.tool_calls ?? [];
    return #{state: state, deltas: wire.deltas ?? [], finished: wire.finished ?? false};
}
if args.phase == "finish" {
    let state = args.state;
    if state.request.settings.next ?? false {
        state.attempt += 1;
        state.request.settings.next = state.request.settings.repeat ?? false;
        let previous_input = state.input_tokens;
        let previous_output = state.output_tokens;
        state.input_tokens = 0;
        state.output_tokens = 0;
        return #{next: #{path: "invoke", mode: state.mode,
            body: #{model: "wire", request: state.request, attempt: state.attempt}, state: state},
            input_tokens: previous_input, output_tokens: previous_output};
    }
    return #{response: #{messages: state.messages, output: state.output,
        tool_calls: state.tool_calls, input_tokens: state.input_tokens,
        output_tokens: state.output_tokens,
        info: #{stop_reason: "done", provider: #{wire: "preserved", _model_runtime: #{calls: 9999}}}}};
}
throw "unknown phase";
