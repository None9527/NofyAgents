fn estimate_tokens(messages) {
    let text = messages.to_string();
    let chars = text.len();
    let utf8_bytes = text.bytes();
    let excess = utf8_bytes - chars;
    let non_ascii = (excess + 1) / 2;
    if non_ascii > chars { non_ascii = chars; }
    let ascii = chars - non_ascii;
    // Quarter-token units: ASCII at 1/4 token per byte, non-ASCII/CJK at 1.5 (6/4) tokens per char.
    let quarters = ascii + non_ascii * 6;
    #{tokens: (quarters + 3) / 4, quarters: quarters, bytes: utf8_bytes}
}
fn has_prefix(text, prefix) {
    type_of(text) == "string" && (
        text == prefix
        || text.starts_with(prefix + " ")
        || text.starts_with(prefix + "\n")
        || text.starts_with(prefix + "\t")
    )
}
fn is_manual(input, prefix) {
    if prefix == "" || type_of(input) != "map" { return false; }
    if input.role == "user" { return has_prefix(input.content, prefix); }
    if input.role == "user_parts" && type_of(input.content) == "array" {
        for part in input.content {
            if type_of(part) == "map" && part.type == "text" {
                return has_prefix(part.text, prefix);
            }
        }
    }
    false
}
if args.phase == "plan" {
    let messages = args.state.messages;
    let turn = args.retained_turn_start;
    let before = estimate_tokens(messages);
    let threshold_quarters = args.parameters.context_window * 4 * args.parameters.threshold_percent / 100;
    let manual = false;
    if turn > 2 && turn < messages.len() {
        let captured = args.state.input_progress?.capture ?? #{};
        let input = if captured.contains(turn.to_string()) { captured[turn.to_string()] } else { messages[turn] };
        let prefix = args.parameters.manual_prefix ?? "/compact";
        manual = is_manual(input, prefix);
    }
    if turn <= 1 || turn >= messages.len() || (!manual && before.quarters <= threshold_quarters) { () }
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
        else { #{keep:keep, turn:turn, length:messages.len(), before_bytes:before.bytes, before_tokens:before.tokens, before_quarters:before.quarters, manual:manual} }
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
    let summary = response.output;
    summary.trim();
    if summary.len() == 0 || response.tool_calls.len() > 0 || response.info.refusal != () {
        throw "compaction requires a complete textual summary";
    }
    if response.info.stop_reason == "length" || response.info.stop_reason == "max_tokens" || response.info.stop_reason == "max_output_tokens" {
        throw "compaction summary was truncated";
    }
    let messages = [args.state.messages[0], #{role:"assistant",content:"[Compacted history]\n"+summary,tool_calls:[]}];
    for i in args.plan.keep..args.state.messages.len() { messages.push(args.state.messages[i]); }
    let after = estimate_tokens(messages);
    if after.quarters >= args.plan.before_quarters { throw "compaction did not reduce context; original history is retained"; }
    #{messages:messages,retained_from:args.plan.keep,retained_at:2,
      metadata:#{mode:if args.plan.manual { "manual_full_replace" } else { args.parameters.mode },manual:args.plan.manual,counter:"rhai-utf8-cjk-tiered-v2",before_bytes:args.plan.before_bytes,after_bytes:after.bytes,before_tokens:args.plan.before_tokens,after_tokens:after.tokens}}
} else { throw "unsupported compaction phase" }
