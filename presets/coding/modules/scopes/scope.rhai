// Rule vocabulary and argument semantics are external to the kernel.
fn grants_for(input) {
    let grants = [];
    for name in input.rules {
        if !input.parameters.grants.contains(name) { throw "unknown scope grant"; }
        grants.push(input.parameters.grants[name]);
    }
    grants
}
fn tool_matches(grant, name) { grant.tools.contains(name) }
fn call_matches(grant, invocation, cwd) {
    if !tool_matches(grant, invocation.name) { return false; }
    if grant.contains("path") {
        let spec = grant.path;
        if !invocation.arguments.contains(spec.argument) { return false; }
        let relative = relative_path(cwd, invocation.arguments[spec.argument]);
        if relative == () || !glob_matches(spec.glob, relative) { return false; }
    }
    if grant.contains("argv_prefix") {
        let spec = grant.argv_prefix;
        if !invocation.arguments.contains(spec.argument) { return false; }
        let argv = invocation.arguments[spec.argument];
        if type_of(argv) != "array" || argv.len() < spec.prefix.len() { return false; }
        for index in 0..spec.prefix.len() {
            if argv[index] != spec.prefix[index] { return false; }
        }
    }
    true
}
fn scope(input) {
    let grants = grants_for(input);
    if input.operation.kind == "filter" {
        let allowed = [];
        for name in input.operation.names {
            for grant in grants {
                if tool_matches(grant, name) { allowed.push(name); break; }
            }
        }
        return #{kind: "filter", allowed: allowed};
    }
    for grant in grants {
        if call_matches(grant, input.operation["call"], input.cwd) {
            return #{kind: "admit", allowed: true};
        }
    }
    #{kind: "admit", allowed: false}
}
