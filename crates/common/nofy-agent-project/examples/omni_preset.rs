//! Render the self-contained Omni preset from immutable module packages.
use nofy_agent_project::{
    Error, File, Result, Source,
    repository::{PackageManifest, load_package_directory, package_file},
    write_directory,
};
use serde_json::{Value, json};
use std::{
    collections::BTreeMap,
    path::{Path, PathBuf},
};

const JS_MAX_SAFE_INT: u64 = 9_007_199_254_740_991;

fn conditional(parameter: &str, value: Value) -> Value {
    json!({"$when": {"parameter": parameter, "value": value}})
}

fn reference(id: &str) -> Value {
    json!({"$module": id})
}

fn selected_model() -> Value {
    json!({
        "$if": {
            "condition": {"$parameter": "/use_responses"},
            "then": reference("provider-responses.model"),
            "else": {
                "$if": {
                    "condition": {"$parameter": "/use_messages"},
                    "then": reference("provider-messages.model"),
                    "else": reference("provider.model")
                }
            }
        }
    })
}

fn prepare_document() -> Value {
    json!({
        "parameters": {
            "use_responses": {
                "$lookup": {
                    "value": {"chat_completions": false, "responses": true, "messages": false},
                    "key": {"$setting": "/model_protocol"}
                }
            },
            "use_messages": {
                "$lookup": {
                    "value": {"chat_completions": false, "responses": false, "messages": true},
                    "key": {"$setting": "/model_protocol"}
                }
            },
            "responses_connection": {
                "$if": {
                    "condition": {"$parameter": "/use_responses"},
                    "then": {"$setting": "/connection"},
                    "else": null
                }
            },
            "responses_model": {
                "$if": {
                    "condition": {"$parameter": "/use_responses"},
                    "then": {"$setting": "/model"},
                    "else": null
                }
            },
            "messages_connection": {
                "$if": {
                    "condition": {"$parameter": "/use_messages"},
                    "then": {"$setting": "/connection"},
                    "else": null
                }
            },
            "messages_model": {
                "$if": {
                    "condition": {"$parameter": "/use_messages"},
                    "then": {"$setting": "/model"},
                    "else": null
                }
            },
            "files_workspace": {
                "$if": {
                    "condition": {"$setting": "/workspace_enabled"},
                    "then": {"$setting": "/workspace"},
                    "else": null
                }
            },
            "files_environment": {
                "$if": {
                    "condition": {"$setting": "/workspace_enabled"},
                    "then": {"$setting": "/workspace_environment"},
                    "else": null
                }
            },
            "command_process_tree_enabled": {
                "$if": {
                    "condition": {"$setting": "/command_enabled"},
                    "then": {
                        "$lookup": {
                            "value": {"process_tree": true, "namespace": false},
                            "key": {"$setting": "/command_isolation"}
                        }
                    },
                    "else": false
                }
            },
            "command_namespace_enabled": {
                "$if": {
                    "condition": {"$setting": "/command_enabled"},
                    "then": {
                        "$lookup": {
                            "value": {"process_tree": false, "namespace": true},
                            "key": {"$setting": "/command_isolation"}
                        }
                    },
                    "else": false
                }
            },
            "command_workspace": {
                "$if": {
                    "condition": {"$setting": "/command_enabled"},
                    "then": {"$setting": "/workspace"},
                    "else": null
                }
            },
            "command_environment_resolved": {
                "$if": {
                    "condition": {"$setting": "/command_enabled"},
                    "then": {"$setting": "/command_environment"},
                    "else": null
                }
            },
            "command_process_tree": {
                "$if": {
                    "condition": {"$parameter": "/command_process_tree_enabled"},
                    "then": {"$setting": "/process_tree"},
                    "else": null
                }
            },
            "command_process_namespace": {
                "$if": {
                    "condition": {"$parameter": "/command_namespace_enabled"},
                    "then": {"$coalesce": [{"$setting": "/process_namespace"}, {}]},
                    "else": null
                }
            }
        }
    })
}

fn import_package(
    source: &mut Source,
    module_imports: &mut Value,
    modules_dir: &Path,
    relative_path: &str,
    alias: &str,
    parameters: Value,
    bindings: Value,
) -> Result<()> {
    let package = load_package_directory(&modules_dir.join(relative_path))?;
    let digest = package.digest()?;
    let manifest = PackageManifest::from_source(&package)?;
    let factories = manifest.factories()?;
    source.put_json(&package_file(&digest)?, &serde_json::to_value(&package)?)?;
    module_imports[alias] = json!({
        "repository": "nofy",
        "name": manifest.name,
        "version": manifest.version,
        "digest": digest,
        "bindings": bindings,
        "parameters": parameters,
        "exports": manifest.exports,
        "factories": factories
    });
    Ok(())
}

fn connection_schema() -> Value {
    json!({
        "type": "object",
        "additionalProperties": false,
        "description": "Explicit provider endpoint, model allow-list and credential references. Never put credential values here.",
        "required": ["base_url", "models"],
        "properties": {
            "base_url": {
                "type": "string",
                "minLength": 1,
                "maxLength": 4096,
                "description": "Canonical provider API base URL ending in '/', e.g. https://api.example.invalid/v1/."
            },
            "models": {
                "type": "array",
                "minItems": 1,
                "maxItems": 1024,
                "uniqueItems": true,
                "items": {"type": "string", "minLength": 1, "maxLength": 256},
                "description": "Explicit model IDs admitted on this connection."
            },
            "headers": {
                "type": "object",
                "maxProperties": 64,
                "propertyNames": {"maxLength": 256},
                "additionalProperties": {"type": "string", "maxLength": 8192},
                "description": "Non-secret static HTTP headers sent with each request."
            },
            "query": {
                "type": "object",
                "maxProperties": 64,
                "propertyNames": {"maxLength": 256},
                "additionalProperties": {"type": "string", "maxLength": 8192},
                "description": "Non-secret static query parameters."
            },
            "header_credentials": {
                "type": "object",
                "maxProperties": 64,
                "propertyNames": {"maxLength": 256},
                "additionalProperties": {
                    "type": "object",
                    "additionalProperties": false,
                    "required": ["reference"],
                    "properties": {
                        "reference": {
                            "type": "string",
                            "pattern": "^[A-Za-z0-9_]{1,128}$",
                            "description": "Logical credential reference resolved by the Host credential provider."
                        },
                        "prefix": {
                            "type": "string",
                            "maxLength": 64,
                            "description": "Optional header value prefix such as 'Bearer '."
                        }
                    }
                },
                "description": "Map of header name to logical credential reference (never raw secrets)."
            },
            "tls": {
                "type": "object",
                "additionalProperties": false,
                "properties": {
                    "system_roots": {"type": "boolean"},
                    "roots_pem": {
                        "type": "array",
                        "maxItems": 32,
                        "items": {"type": "string", "maxLength": 1048576}
                    },
                    "identity_ref": {
                        "anyOf": [
                            {"type": "string", "pattern": "^[A-Za-z0-9_]{1,128}$"},
                            {"type": "null"}
                        ]
                    }
                },
                "description": "Optional TLS trust roots and client identity reference."
            },
            "proxy_url": {
                "type": ["string", "null"],
                "maxLength": 4096,
                "description": "Optional HTTP/HTTPS proxy URL."
            },
            "allow_insecure_http": {
                "type": "boolean",
                "description": "Explicit opt-in for non-HTTPS endpoints (e.g. loopback local models)."
            },
            "timeout_ms": {
                "type": "integer",
                "minimum": 1,
                "maximum": 600000,
                "description": "Total HTTP request timeout in milliseconds."
            },
            "idle_timeout_ms": {
                "type": "integer",
                "minimum": 1,
                "maximum": 600000,
                "description": "Stream idle timeout in milliseconds."
            },
            "max_concurrency": {
                "type": "integer",
                "minimum": 1,
                "maximum": 32,
                "description": "Maximum concurrent requests on this connection."
            },
            "endpoint_limits": {
                "type": "object",
                "maxProperties": 1024,
                "additionalProperties": {
                    "type": "object",
                    "additionalProperties": false,
                    "required": ["max_input_tokens", "max_output_tokens"],
                    "properties": {
                        "max_input_tokens": {
                            "type": "integer",
                            "minimum": 1,
                            "maximum": JS_MAX_SAFE_INT
                        },
                        "max_output_tokens": {
                            "type": "integer",
                            "minimum": 1,
                            "maximum": JS_MAX_SAFE_INT
                        }
                    }
                },
                "description": "Optional per-model input/output token limits."
            }
        }
    })
}

fn process_local_schema(description: &str) -> Value {
    json!({
        "type": "object",
        "additionalProperties": false,
        "description": description,
        "required": ["executable", "paths"],
        "properties": {
            "executable": {
                "type": "string",
                "minLength": 1,
                "maxLength": 4096,
                "description": "Normalized absolute path to the interpreter executable (e.g. /usr/bin/python3)."
            },
            "prefix_args": {
                "type": "array",
                "maxItems": 32,
                "items": {"type": "string", "maxLength": 4096},
                "description": "Optional interpreter flags prepended before the tool entrypoint."
            },
            "env": {
                "type": "object",
                "maxProperties": 32,
                "additionalProperties": {"type": "string"},
                "description": "Explicit environment variables passed to the tool process."
            },
            "paths": {
                "type": "array",
                "minItems": 1,
                "maxItems": 32,
                "description": "Non-overlapping read-only host dependency paths; executable must reside under an execute:true path.",
                "items": {
                    "type": "object",
                    "additionalProperties": false,
                    "required": ["path"],
                    "properties": {
                        "path": {"type": "string", "minLength": 1, "maxLength": 4096},
                        "execute": {"type": "boolean"}
                    }
                }
            }
        }
    })
}

fn process_tree_schema() -> Value {
    json!({
        "type": "object",
        "additionalProperties": false,
        "description": "Delegated Linux cgroup v2 process-tree limits matching resource.process_tree_limits.",
        "required": ["cgroup_root"],
        "properties": {
            "cgroup_root": {
                "type": "string",
                "minLength": 1,
                "maxLength": 4096,
                "description": "Explicit canonical cgroup v2 delegation root path under /sys/fs/cgroup/."
            },
            "limits": {
                "type": "object",
                "additionalProperties": false,
                "description": "Aggregate cgroup quotas for the command process tree.",
                "properties": {
                    "max_processes": {"type": "integer", "minimum": 4, "maximum": 512},
                    "max_memory_bytes": {"type": "integer", "minimum": 67108864, "maximum": 8589934592u64},
                    "cpu_percent": {"type": "integer", "minimum": 1, "maximum": 800}
                }
            }
        }
    })
}

fn process_namespace_schema() -> Value {
    json!({
        "type": "object",
        "additionalProperties": false,
        "default": {},
        "description": "Per-process namespace isolation limits matching resource.process_namespace_limits (used when command_isolation is 'namespace').",
        "properties": {
            "filesystem_mode": {
                "enum": ["read_only", "workspace_write", "full_access"],
                "default": "full_access",
                "description": "Guest filesystem write visibility."
            },
            "writable_directories": {
                "type": "array",
                "maxItems": 8,
                "uniqueItems": true,
                "items": {
                    "type": "string",
                    "minLength": 1,
                    "maxLength": 32,
                    "pattern": "^[A-Z][A-Z0-9_]*$"
                },
                "description": "Directory aliases permitted for writing."
            },
            "network_proxy": {
                "anyOf": [
                    {
                        "type": "object",
                        "additionalProperties": false,
                        "required": ["allowed"],
                        "properties": {
                            "allowed": {
                                "type": "array",
                                "minItems": 1,
                                "maxItems": 64,
                                "items": {
                                    "type": "object",
                                    "additionalProperties": false,
                                    "required": ["host", "ports"],
                                    "properties": {
                                        "host": {"type": "string", "minLength": 1, "maxLength": 253},
                                        "ports": {
                                            "type": "array",
                                            "uniqueItems": true,
                                            "minItems": 1,
                                            "maxItems": 64,
                                            "items": {"type": "integer", "minimum": 1, "maximum": 65535}
                                        },
                                        "allow_private": {"type": "boolean"}
                                    }
                                }
                            },
                            "max_connections": {"type": "integer", "minimum": 1, "maximum": 32},
                            "max_bytes_per_connection": {"type": "integer", "minimum": 1024, "maximum": 1073741824},
                            "idle_timeout_ms": {"type": "integer", "minimum": 100, "maximum": 120000}
                        }
                    },
                    {"type": "null"}
                ],
                "description": "Optional allowlisted outbound HTTP/CONNECT proxy broker configuration; null denies network."
            },
            "cpu_seconds": {"type": "integer", "minimum": 1, "maximum": 600},
            "address_space_bytes": {"type": "integer", "minimum": 67108864, "maximum": 17179869184u64}
        }
    })
}

fn base_settings_schema() -> Value {
    let u32_or_null = json!({"type": ["integer", "null"], "minimum": 0, "maximum": 4294967295u64});
    let safe_int_or_null =
        json!({"type": ["integer", "null"], "minimum": 0, "maximum": JS_MAX_SAFE_INT});
    json!({
        "type": "object",
        "additionalProperties": false,
        "properties": {
            "allowed_tools": {
                "type": "array",
                "minItems": 1,
                "maxItems": 128,
                "uniqueItems": true,
                "items": {"type": "string", "minLength": 1, "maxLength": 128},
                "description": "Root allow-list inherited by descendants. Adding a tool does not automatically authorize it.",
                "default": [
                    "task",
                    "agent_messages",
                    "ask_user",
                    "workflow_execute",
                    "workflow_agent",
                    "assemble",
                    "read_file",
                    "write_file",
                    "edit_file",
                    "make_directory",
                    "list_files",
                    "search_files",
                    "run_command",
                    "sdk_schema",
                    "sdk_run_inspect",
                    "sdk_work_list",
                    "sdk_work_inspect",
                    "sdk_work_targets",
                    "sdk_work_attached_targets",
                    "sdk_work_start",
                    "sdk_work_wait",
                    "sdk_work_control",
                    "sdk_work_task",
                    "sdk_module_template",
                    "sdk_module_list",
                    "sdk_propose_prompt"
                ]
            },
            "assembly_max_steps": {"type": "integer", "minimum": 1, "maximum": 256, "default": 32},
            "budget": {
                "type": "object",
                "additionalProperties": false,
                "description": "Shared root ledger limits. The child does not receive a fresh independent budget.",
                "default": {
                    "max_active_children": 4,
                    "max_child_calls": 8,
                    "max_depth": 4,
                    "max_model_calls": 64,
                    "max_tool_calls": 128
                },
                "properties": {
                    "max_active_children": u32_or_null,
                    "max_child_calls": safe_int_or_null,
                    "max_concurrent_operations": u32_or_null,
                    "max_depth": u32_or_null,
                    "max_duration_ms": safe_int_or_null,
                    "max_input_tokens": safe_int_or_null,
                    "max_model_calls": safe_int_or_null,
                    "max_output_tokens": safe_int_or_null,
                    "max_steps": safe_int_or_null,
                    "max_tool_calls": safe_int_or_null,
                    "max_total_tokens": safe_int_or_null
                }
            },
            "child_allowed_tools": {
                "type": "array",
                "minItems": 1,
                "maxItems": 128,
                "uniqueItems": true,
                "items": {"type": "string", "minLength": 1, "maxLength": 128},
                "description": "Additional child restriction, intersected with the root floor. Nonempty by design; the underlying skill API treats an empty list as unrestricted.",
                "default": ["agent_messages"]
            },
            "child_max_steps": {"type": "integer", "minimum": 1, "maximum": 4096, "default": 16},
            "max_nodes": {"type": "integer", "minimum": 1, "maximum": 128, "default": 64},
            "max_steps": {"type": "integer", "minimum": 1, "maximum": 4096, "default": 32},
            "model": {"type": "string", "minLength": 1, "description": "A model admitted by connection.models."},
            "model_settings": {"type": "object", "default": {}},
            "system_name": {"type": "string", "minLength": 1, "default": "omni"}
        }
    })
}

fn main() -> Result<()> {
    let output = std::env::args_os()
        .nth(1)
        .map(PathBuf::from)
        .ok_or_else(|| Error::new("local_input", "an output directory is required"))?;
    let modules_dir = Path::new(env!("CARGO_MANIFEST_DIR")).join("../../../modules");
    let mut source = Source {
        files: BTreeMap::new(),
        declaration: "project.json".into(),
        settings_json: None,
    };
    source.put_json(
        "project.json",
        &json!({
            "format": "nofy.project/v1",
            "declaration": "preset.json",
            "prepare": "prepare.json",
            "settings": "settings.json",
            "settings_schema": "settings.schema.json"
        }),
    )?;
    source.put_json("settings.json", &json!({}))?;

    let model_ref = selected_model();
    let mut preset = json!({
        "format": "nofy.preset/v1",
        "system": {
            "schema_version": 1,
            "name": {"$parameter": "/system_name"},
            "required_policies": [reference("guardrails.floor"), reference("effect-approval")],
            "required_governance": [reference("guardrails.quota")],
            "module_imports": {},
            "modules": [
                {
                    "reference": reference("child-tools"),
                    "factory": "tool.compose",
                    "config": {"packs": ["messages"]},
                    "dependencies": {"messages": reference("coordination.messages")}
                },
                {
                    "reference": reference("children"),
                    "factory": "tool.compose",
                    "config": {"packs": ["delegate", "assembly"]},
                    "dependencies": {
                        "delegate": reference("delegate.delegate"),
                        "assembly": reference("assembly.tools")
                    }
                },
                {
                    "reference": reference("main-tools"),
                    "factory": "tool.compose",
                    "config": {"packs": ["messages", "human", "assembly"]},
                    "dependencies": {
                        "messages": reference("coordination.messages"),
                        "human": reference("human.tool"),
                        "assembly": reference("assembly.tools")
                    }
                },
                {
                    "reference": reference("omni-prompt"),
                    "factory": "prompt.static",
                    "config": {"text": {"$file": "prompt.md"}}
                },
                {
                    "reference": reference("approval"),
                    "factory": "policy.approval",
                    "config": {}
                },
                {
                    "reference": reference("effect-approval"),
                    "factory": "policy.on_tools",
                    "config": {"tools": ["write_file", "edit_file", "make_directory", "run_command"]},
                    "dependencies": {"policy": reference("approval")}
                },
                {
                    "reference": reference("sdk-tools"),
                    "factory": "tool.sdk_authoring",
                    "config": {}
                },
                {
                    "reference": reference("sdk-work"),
                    "factory": "tool.sdk_work",
                    "config": {}
                },
                conditional(
                    "/evolution_enabled",
                    json!({
                        "reference": reference("sdk-evolution"),
                        "factory": "tool.sdk_evolution",
                        "config": {}
                    }),
                )
            ],
            "programs": {
                "main": {
                    "kind": "agent",
                    "definition": {
                        "schema_version": 1,
                        "name": "omni",
                        "prompt": reference("omni-prompt"),
                        "model": model_ref,
                        "tool_packs": [
                            reference("main-tools"),
                            reference("sdk-tools"),
                            reference("sdk-work"),
                            conditional("/evolution_enabled", reference("sdk-evolution")),
                            conditional("/workspace_enabled", reference("files.file-read")),
                            conditional("/workspace_enabled", reference("files.file-write")),
                            conditional("/workspace_enabled", reference("files.file-edit")),
                            conditional("/workspace_enabled", reference("files.directory-create")),
                            conditional("/workspace_enabled", reference("files.file-list")),
                            conditional("/workspace_enabled", reference("files.file-search")),
                            conditional("/command_enabled", reference("command.command"))
                        ],
                        "bindings": [
                            reference("coordination.binding"),
                            conditional("/workspace_enabled", reference("files.cwd")),
                            reference("compaction.journal")
                        ],
                        "context_policies": [reference("compaction.policy")],
                        "context_sources": [
                            conditional("/workspace_enabled", reference("files.rules"))
                        ],
                        "settings": {
                            "input_delivery": {"duplex": true},
                            "scope_identity": "hashed_v2",
                            "max_steps": {"$parameter": "/max_steps"},
                            "model": {"$parameter": "/model_settings"}
                        }
                    }
                }
            }
        }
    });
    let system = &mut preset["system"];

    import_package(
        &mut source,
        &mut system["module_imports"],
        &modules_dir,
        "main-agent/guardrails",
        "guardrails",
        json!({"allowed_tools": {"$parameter": "/allowed_tools"}, "budget": {"$parameter": "/budget"}}),
        json!({}),
    )?;
    import_package(
        &mut source,
        &mut system["module_imports"],
        &modules_dir,
        "models/chat-completions",
        "provider",
        json!({"connection": {"$parameter": "/connection"}, "model": {"$parameter": "/model"}}),
        json!({}),
    )?;
    import_package(
        &mut source,
        &mut system["module_imports"],
        &modules_dir,
        "main-agent/delegate",
        "delegate",
        json!({
            "child_allowed_tools": {"$parameter": "/child_allowed_tools"},
            "child_max_steps": {"$parameter": "/child_max_steps"},
            "model_settings": {"$parameter": "/model_settings"}
        }),
        json!({"model": model_ref, "tools": reference("child-tools")}),
    )?;
    import_package(
        &mut source,
        &mut system["module_imports"],
        &modules_dir,
        "main-agent/dynamic-assembly",
        "assembly",
        json!({"max_steps": {"$parameter": "/assembly_max_steps"}, "max_nodes": {"$parameter": "/max_nodes"}}),
        json!({"model": model_ref, "tools": reference("child-tools")}),
    )?;
    import_package(
        &mut source,
        &mut system["module_imports"],
        &modules_dir,
        "agent-foundation/agent-collaboration",
        "coordination",
        json!({}),
        json!({"children": reference("children")}),
    )?;
    import_package(
        &mut source,
        &mut system["module_imports"],
        &modules_dir,
        "agent-foundation/ask-user",
        "human",
        json!({}),
        json!({}),
    )?;
    import_package(
        &mut source,
        &mut system["module_imports"],
        &modules_dir,
        "agent-foundation/context-compaction",
        "compaction",
        json!({
            "context_window": {"$parameter": "/context_window"},
            "threshold_percent": {"$parameter": "/compaction_threshold_percent"},
            "keep_turns": {"$parameter": "/compaction_keep_turns"}
        }),
        json!({"model": model_ref}),
    )?;

    for (alias, path, enabled_param, conn_param, model_param) in [
        (
            "provider-responses",
            "models/responses",
            "/use_responses",
            "/responses_connection",
            "/responses_model",
        ),
        (
            "provider-messages",
            "models/messages",
            "/use_messages",
            "/messages_connection",
            "/messages_model",
        ),
    ] {
        import_package(
            &mut source,
            &mut system["module_imports"],
            &modules_dir,
            path,
            alias,
            json!({
                "enabled": {"$parameter": enabled_param},
                "connection": {"$parameter": conn_param},
                "model": {"$parameter": model_param}
            }),
            json!({}),
        )?;
    }

    import_package(
        &mut source,
        &mut system["module_imports"],
        &modules_dir,
        "workspace/files",
        "files",
        json!({
            "enabled": {"$parameter": "/workspace_enabled"},
            "workspace": {"$parameter": "/files_workspace"},
            "environment": {"$parameter": "/files_environment"}
        }),
        json!({}),
    )?;

    import_package(
        &mut source,
        &mut system["module_imports"],
        &modules_dir,
        "workspace/command",
        "command",
        json!({
            "enabled": {"$parameter": "/command_enabled"},
            "process_tree_enabled": {"$parameter": "/command_process_tree_enabled"},
            "namespace_enabled": {"$parameter": "/command_namespace_enabled"},
            "workspace": {"$parameter": "/command_workspace"},
            "environment": {"$parameter": "/command_environment_resolved"},
            "process_tree": {"$parameter": "/command_process_tree"},
            "process_namespace": {"$parameter": "/command_process_namespace"}
        }),
        json!({}),
    )?;

    let mut schema = base_settings_schema();
    let properties = schema["properties"].as_object_mut().unwrap();
    properties.insert("connection".into(), connection_schema());
    properties.insert(
        "model_protocol".into(),
        json!({
            "enum": ["chat_completions", "responses", "messages"],
            "default": "chat_completions",
            "description": "Model wire protocol package selected for the provider."
        }),
    );
    for flag in ["workspace_enabled", "command_enabled", "evolution_enabled"] {
        properties.insert(flag.into(), json!({"type": "boolean", "default": false}));
    }
    properties.insert(
        "command_isolation".into(),
        json!({
            "enum": ["process_tree", "namespace"],
            "default": "process_tree",
            "description": "Command isolation backend when command_enabled is true: 'process_tree' (cgroup v2) or 'namespace' (user/PID/mount/net namespaces)."
        }),
    );
    properties.insert(
        "context_window".into(),
        json!({"type": "integer", "minimum": 256, "maximum": 10000000, "default": 262144}),
    );
    properties.insert(
        "compaction_threshold_percent".into(),
        json!({"type": "integer", "minimum": 1, "maximum": 100, "default": 75}),
    );
    properties.insert(
        "compaction_keep_turns".into(),
        json!({"type": "integer", "minimum": 0, "maximum": 64, "default": 2}),
    );
    properties.insert(
        "workspace".into(),
        json!({
            "type": "string",
            "minLength": 1,
            "maxLength": 4096,
            "description": "Absolute workspace root directory when workspace_enabled or command_enabled is true."
        }),
    );
    properties.insert(
        "workspace_environment".into(),
        process_local_schema(
            "User-provisioned local process runtime for workspace file tools matching resource.process_local.",
        ),
    );
    properties.insert(
        "command_environment".into(),
        process_local_schema(
            "User-provisioned local process runtime for confined command execution matching resource.process_local.",
        ),
    );
    properties.insert("process_tree".into(), process_tree_schema());
    properties.insert("process_namespace".into(), process_namespace_schema());
    schema["allOf"] = json!([
        {
            "if": {
                "required": ["workspace_enabled"],
                "properties": {"workspace_enabled": {"const": true}}
            },
            "then": {"required": ["workspace", "workspace_environment"]}
        },
        {
            "if": {
                "required": ["command_enabled"],
                "properties": {"command_enabled": {"const": true}}
            },
            "then": {
                "required": ["workspace", "command_environment"],
                "if": {
                    "required": ["command_isolation"],
                    "properties": {"command_isolation": {"const": "namespace"}}
                },
                "then": {},
                "else": {"required": ["process_tree"]}
            }
        }
    ]);

    source.put_json("prepare.json", &prepare_document())?;
    source.put_json("preset.json", &preset)?;
    source.put_json("settings.schema.json", &schema)?;
    source.files.insert(
        "prompt.md".into(),
        File::text(include_str!("../../../../docs/manual/omni-agent-prompt.md")),
    );
    source.files.insert(
        "README.md".into(),
        File::text(include_str!("../../../../docs/manual/omni-agent.md")),
    );
    source.files.insert(
        "文件说明.md".into(),
        File::text(include_str!("../../../../docs/manual/omni-agent-files.md")),
    );
    nofy_agent_project::repository::verify_package_sources(&source)?;
    source.refresh_manifest()?;
    write_directory(&std::env::current_dir()?.join(output), &source, None)
}
