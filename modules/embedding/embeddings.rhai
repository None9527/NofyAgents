// Explicit embeddings wire policy over the existing Model transport.
fn reject(message) {
    fail(#{category: "protocol", message: message, status: (), retryable: false,
        retry_after_ms: (), code: "embedding_contract", details: ()});
}
if args.phase == "history" { return args.messages.len() == 0; }
if args.phase == "http_error" { return (); }
// The shared admission contract reserves a positive bound; actual usage is
// still settled as zero output tokens by finish, without changing that rail.
if args.phase == "admit" { return #{max_requests: 1, max_output_tokens: 1}; }
if args.phase == "request" {
    let request = args.request;
    if request.tools.len() != 0 || request.messages.len() != 1 || request.messages[0].role != "user" {
        reject("embedding requires one User text-array message without tools");
    }
    let input = json_parse(request.messages[0].content);
    if type_of(input) != "array" || input.len() == 0 || input.len() > 32 {
        reject("embedding input must contain 1..32 texts");
    }
    for text in input { if type_of(text) != "string" || text.len() == 0 { reject("embedding input requires nonempty texts"); } }
    let dimensions = request.settings.dimensions;
    return #{path: "embeddings", mode: "json",
        body: #{model: args.model, input: input, dimensions: dimensions},
        state: #{model: args.model, count: input.len(), dimensions: dimensions, output: (), tokens: ()}};
}
if args.phase == "event" {
    let state = args.state;
    let wire = json_parse(args.frame.data);
    if type_of(wire.data) != "array" || wire.data.len() != state.count || wire.usage.prompt_tokens == () {
        reject("embedding response requires exact vectors and prompt-token usage");
    }
    let ordered = [];
    for position in 0..state.count { ordered.push(()); }
    for item in wire.data {
        if item.index < 0 || item.index >= state.count || ordered[item.index] != ()
            || type_of(item.embedding) != "array" || item.embedding.len() != state.dimensions {
            reject("embedding response indices or dimensions changed");
        }
        let nonzero = false;
        for value in item.embedding {
            if !(value >= -3.402823466e38 && value <= 3.402823466e38) { reject("embedding response contains invalid vector values"); }
            if value != 0 { nonzero = true; }
        }
        if !nonzero { reject("embedding response contains a zero vector"); }
        ordered[item.index] = item.embedding;
    }
    state.output = json_stringify(ordered);
    state.tokens = wire.usage.prompt_tokens;
    state.reported_model = wire.model ?? state.model;
    return #{state: state, deltas: [], finished: true};
}
if args.phase == "finish" {
    let state = args.state;
    return #{response: #{messages: [], output: state.output, tool_calls: [],
        input_tokens: state.tokens, output_tokens: 0,
        info: #{stop_reason: "embeddings", provider: #{protocol: "embeddings/v1", model: state.reported_model}}}};
}
reject("unsupported embedding protocol phase");
