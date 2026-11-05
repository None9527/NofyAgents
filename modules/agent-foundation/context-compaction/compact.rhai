fn bytes(messages) { messages.to_string().len() }
if args.phase == "plan" {
    let messages = args.state.messages;
    let turn = args.retained_turn_start;
    let count = bytes(messages);
    let threshold = args.parameters.context_window * 4 * args.parameters.threshold_percent / 100;
    let manual = false;
    if turn > 2 && turn < messages.len() {
        let captured = args.state.input_progress?.capture ?? #{};
        let input = if captured.contains(turn.to_string()) { captured[turn.to_string()] } else { messages[turn] };
        let prefix = args.parameters.manual_prefix ?? "/compact";
        if prefix != "" && input.role == "user" { manual = input.content == prefix || input.content.starts_with(prefix + " "); }
    }
    if turn <= 1 || turn >= messages.len() || (!manual && count <= threshold) { () }
    else {
        let keep = turn;
        if !manual && args.parameters.mode == "tail_keep" {
            let turns = 0;
            let i = turn - 1;
            while i >= 1 {
                if messages[i].role == "user" || messages[i].role == "user_parts" {
                    turns += 1;
                    if turns <= args.parameters.keep_turns { keep = i; }
                }
                i -= 1;
            }
        }
        if keep <= 1 { () }
        else { #{keep:keep, turn:turn, length:messages.len(), before_bytes:count,manual:manual} }
    }
} else if args.phase == "prepare" {
    if args.state.messages.len() != args.plan.length || args.retained_turn_start != args.plan.turn {
        throw "compaction input boundary changed";
    }
    let history = [];
    for i in 1..args.plan.keep { history.push(args.state.messages[i]); }
    history.insert(0, #{role:"system",content:args.parameters.summary_prompt});
    history.push(#{role:"user",content:"Summarize the preceding conversation. Return only the factual summary."});
    #{kind:"sample",request:#{messages:history,tools:[],settings:args.parameters.model_settings},data:#{}}
} else if args.phase == "finish" {
    let response = args.response;
    if response.output.trim().len() == 0 || response.tool_calls.len() > 0 || response.info.refusal != () {
        throw "compaction requires a complete textual summary";
    }
    if response.info.stop_reason == "length" || response.info.stop_reason == "max_tokens" || response.info.stop_reason == "max_output_tokens" {
        throw "compaction summary was truncated";
    }
    let messages = [args.state.messages[0], #{role:"assistant",content:"[Compacted history]\n"+response.output,tool_calls:[]}];
    for i in args.plan.keep..args.state.messages.len() { messages.push(args.state.messages[i]); }
    let after = bytes(messages);
    if after >= args.plan.before_bytes { throw "compaction did not reduce context; original history is retained"; }
    #{messages:messages,retained_from:args.plan.keep,retained_at:2,
      metadata:#{mode:if args.plan.manual { "manual_full_replace" } else { args.parameters.mode },manual:args.plan.manual,counter:"rhai-json-view-chars/4-estimate-v1",before_bytes:args.plan.before_bytes,after_bytes:after}}
} else { throw "unsupported compaction phase" }
