use serde_json::{Value, json};
fn integer(min: u64, max: u64) -> Value {
    json!({"type":"integer","minimum":min,"maximum":max})
}
pub(super) fn protocol() -> Value {
    json!({"type":"object","additionalProperties":false,"required":["source","capabilities"],"properties":{
        "source":{"oneOf":[
            {"type":"object","additionalProperties":false,"required":["kind","text"],"properties":{
                "kind":{"const":"inline"},"text":{"type":"string","minLength":1,"maxLength":65536}}},
            {"type":"object","additionalProperties":false,"required":["kind","entries"],"properties":{
                "kind":{"const":"artifact"},"entries":{"type":"array","minItems":1,"maxItems":16,"uniqueItems":true,"items":{"type":"string","minLength":1,"maxLength":256}},"settings_schema":{"type":["string","null"],"minLength":1,"maxLength":256}}}
        ]},
        "capabilities":{"type":"object","additionalProperties":false,"properties":{
            "streaming":{"type":"boolean"},"image_input":{"type":"boolean"},"structured_output":{"type":"boolean"},
            "settings_schema":{"type":["object","boolean","null"]}
        }},
        "limits":{"type":"object","additionalProperties":false,"properties":{
            "max_requests":integer(1,8),"max_frames":integer(1,1000000),
            "max_input_bytes":integer(256,16*1024*1024),"max_state_bytes":integer(256,16*1024*1024),
            "max_frame_bytes":integer(256,16*1024*1024),"max_response_bytes":integer(256,256*1024*1024),
            "max_operations":integer(1,100000000),"max_step_operations":integer(1,10000000),"step_timeout_ms":integer(1,10000)
        }}
    }})
}
pub(super) fn connection() -> Value {
    let reference = json!({"type":"string","pattern":"^[A-Za-z0-9_]{1,128}$"});
    let headers = json!({"type":"object","maxProperties":64,"propertyNames":{"maxLength":256},
        "additionalProperties":{"type":"string","maxLength":8192}});
    json!({"type":"object","additionalProperties":false,"required":["base_url","models"],"properties":{
        "base_url":{"type":"string","minLength":1,"maxLength":4096},
        "models":{"type":"array","minItems":1,"maxItems":1024,"uniqueItems":true,"items":{"type":"string","minLength":1,"maxLength":256}},
        "headers":headers,"query":headers,
        "header_credentials":{"type":"object","maxProperties":64,"propertyNames":{"maxLength":256},
            "additionalProperties":{"type":"object","additionalProperties":false,"required":["reference"],"properties":{
                "reference":reference,"prefix":{"type":"string","maxLength":64}
            }}},
        "tls":{"type":"object","additionalProperties":false,"properties":{
            "system_roots":{"type":"boolean"},"roots_pem":{"type":"array","maxItems":32,"items":{"type":"string","maxLength":1048576}},
            "identity_ref":{"anyOf":[reference,{"type":"null"}]}
        }},
        "proxy_url":{"type":["string","null"],"maxLength":4096},"allow_insecure_http":{"type":"boolean"},
        "timeout_ms":integer(1,600000),"idle_timeout_ms":integer(1,600000),"max_concurrency":integer(1,32),
        "endpoint_limits":{"type":"object","maxProperties":1024,"additionalProperties":{
            "type":"object","additionalProperties":false,"required":["max_input_tokens","max_output_tokens"],"properties":{
                "max_input_tokens":integer(1,u64::MAX/8),"max_output_tokens":integer(1,u64::MAX/8)
            }
        }}
    }})
}
