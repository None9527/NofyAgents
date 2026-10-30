#!/usr/bin/env python3
"""Exercise original headless presets against an isolated local model server.

Uses no real provider credentials or user configuration. With --baseline,
compares the observable model/tool protocol to an existing executable.
"""
import argparse
import http.server
import json
import os
import shlex
from pathlib import Path
import subprocess
import tempfile
import threading


class Server(http.server.ThreadingHTTPServer):
    daemon_threads = True


class Handler(http.server.BaseHTTPRequestHandler):
    def log_message(self, *_args):
        pass

    def send_json(self, value, status=200):
        data = json.dumps(value).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        if self.path.endswith("/models"):
            self.send_json({"object": "list", "data": [{
                "id": "test-model", "object": "model", "owned_by": "test",
                "apiBackend": "chat-completions",
            }]})
        elif self.path.endswith("/settings"):
            self.send_json({}, 404)
        else:
            self.send_json({})

    def do_POST(self):
        request = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
        messages = request.get("messages", [])
        user_text = " ".join(str(m.get("content", "")) for m in messages if m.get("role") == "user")
        # Title/summary requests can contain the same user marker and race the
        # main request. Identify the actual agent toolset, not arrival order.
        tool_names = {t.get("function", {}).get("name") for t in request.get("tools", [])}
        foreground = "PRESET_COMPAT" in user_text and bool(tool_names & {"read_file", "Read"})
        if foreground:
            self.server.requests.append(request)
        tool_results = [m for m in messages if m.get("role") == "tool"]
        read_request = "READ_FILE" in user_text or "DENY_READ" in user_text
        if foreground and "STRUCTURED" in user_text:
            structured = next((t["function"]["name"] for t in request["tools"]
                               if t["function"]["name"] == "StructuredOutput"), None)
            if structured:
                delta = {"tool_calls": [{"index": 0, "id": "compat-structured-1", "type": "function",
                            "function": {"name": structured, "arguments": json.dumps({"result": "PRESET_COMPAT_OK"})}}]}
                finish = "tool_calls"
            else:
                delta = {"content": json.dumps({"result": "PRESET_COMPAT_OK"})}
                finish = "stop"
        elif foreground and read_request and not tool_results:
            tool = next((t["function"]["name"] for t in request["tools"]
                         if t.get("function", {}).get("name") in ("read_file", "Read")), None)
            if tool is None:
                self.send_json({"error": {"message": "original read tool missing"}}, 400)
                return
            function = next(t["function"] for t in request["tools"] if t["function"]["name"] == tool)
            properties = function.get("parameters", {}).get("properties", {})
            path_key = next((key for key in ("target_file", "file_path", "path") if key in properties), "target_file")
            delta = {"tool_calls": [{"index": 0, "id": "compat-read-1", "type": "function",
                        "function": {"name": tool, "arguments": json.dumps({path_key: "fixture.txt"})}}]}
            finish = "tool_calls"
        else:
            if foreground and read_request:
                has_content = "ORIGINAL_PRESET_FILE_CONTENT" in json.dumps(tool_results)
                if "DENY_READ" in user_text and (not tool_results or has_content or
                        "denied by permission policy" not in json.dumps(tool_results).lower()):
                    self.send_json({"error": {"message": "explicit deny did not prevent file read"}}, 400)
                    return
                if "DENY_READ" not in user_text and not has_content:
                    self.send_json({"error": {"message": "tool result missing"}}, 400)
                    return
            delta = {"content": "PRESET_COMPAT_OK" if foreground else "auxiliary"}
            finish = "stop"
        if request.get("stream"):
            self.send_response(200)
            self.send_header("Content-Type", "text/event-stream")
            self.send_header("Cache-Control", "no-cache")
            self.end_headers()
            for piece in ({"role": "assistant"}, delta, {}):
                chunk = {"id": "compat", "object": "chat.completion.chunk", "created": 1,
                         "model": "test-model", "choices": [{"index": 0, "delta": piece,
                         "finish_reason": finish if not piece else None}]}
                self.wfile.write(("data: " + json.dumps(chunk) + "\n\n").encode())
            self.wfile.write(b"data: [DONE]\n\n")
        else:
            self.send_json({"id": "compat", "object": "chat.completion", "created": 1,
                            "model": "test-model", "choices": [{"index": 0,
                            "message": {"role": "assistant", **delta}, "finish_reason": finish}]})


def exercise(binary, report_dir):
    server = Server(("127.0.0.1", 0), Handler)
    server.requests = []
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        with tempfile.TemporaryDirectory(prefix="nofy-preset-compat-") as directory:
            root = Path(directory)
            home = root / "home"
            workspace = root / "workspace"
            home.mkdir()
            workspace.mkdir()
            (workspace / "fixture.txt").write_text("ORIGINAL_PRESET_FILE_CONTENT\n")
            url = f"http://127.0.0.1:{server.server_port}/v1"
            env = {key: os.environ[key] for key in ("PATH", "SYSTEMROOT") if key in os.environ}
            env.update({"HOME": str(home), "NOFY_HOME": str(home / ".nofy"), "SHELL": "/bin/sh",
                        "NOFY_API_KEY": "compat-local-key", "NO_PROXY": "127.0.0.1,localhost",
                        "NOFY_TELEMETRY_ENABLED": "false", "NOFY_INSTRUMENTATION": "disabled",
                        "OTEL_SDK_DISABLED": "true", "NOFY_DISABLE_AUTOUPDATER": "1",
                        "NOFY_PROMPT_SUGGESTIONS": "false", "NOFY_TURN_SUMMARY": "0"})
            for key in ("NOFY_API_BASE_URL", "NOFY_CLI_CHAT_PROXY_BASE_URL", "NOFY_MODELS_BASE_URL",
                        "NOFY_MANAGED_CONFIG_URL", "NOFY_CODE_WEB_URL", "NOFY_CONVERSATIONS_BASE_URL"):
                env[key] = url
            scenarios = [
                ("plain", ["-p", "PRESET_COMPAT SAY_OK"]),
                ("read", ["-p", "PRESET_COMPAT READ_FILE fixture.txt"]),
                ("resume", ["--continue", "-p", "PRESET_COMPAT SAY_OK again"]),
                ("stream", ["--output-format", "streaming-json", "-p", "PRESET_COMPAT SAY_OK stream"]),
                ("deny", ["--deny", "Read", "-p", "PRESET_COMPAT DENY_READ fixture.txt"]),
                ("structured", ["--json-schema", json.dumps({"type":"object", "properties":{"result":{"type":"string"}},
                                                            "required":["result"], "additionalProperties":False}),
                                "-p", "PRESET_COMPAT STRUCTURED"]),
                ("hook", ["-p", "PRESET_COMPAT READ_FILE fixture.txt HOOK"]),
            ]
            results = []
            for name, args in scenarios:
                hook_receipt = root / "hook-receipt.txt"
                if name == "hook":
                    hooks = home / ".nofy" / "hooks"
                    hooks.mkdir(parents=True, exist_ok=True)
                    (hooks / "compat.json").write_text(json.dumps({"hooks":{"PreToolUse":[{"hooks":[{
                        "type":"command", "command":"printf 'HOOK_EXECUTED\\n' >> " + shlex.quote(str(hook_receipt)),
                        "timeout":5}]}]}}))
                before = len(server.requests)
                command = [str(binary), "--no-memory", "--no-plan", "--no-subagents",
                           *([] if name == "deny" else ["--always-approve"]), "-m", "test-model", *args]
                run = subprocess.run(command, cwd=workspace, env=env, text=True,
                                     capture_output=True, timeout=90)
                (report_dir / f"{name}.stdout").write_text(run.stdout)
                (report_dir / f"{name}.stderr").write_text(run.stderr)
                if run.returncode or "PRESET_COMPAT_OK" not in run.stdout:
                    raise AssertionError(f"{name} failed: exit={run.returncode}\n{run.stdout[-1500:]}\n{run.stderr[-2000:]}")
                if name == "hook" and (not hook_receipt.exists() or hook_receipt.read_text().splitlines() != ["HOOK_EXECUTED"]):
                    raise AssertionError("pre-tool hook did not execute exactly once")
                requests = server.requests[before:]
                if not requests:
                    raise AssertionError(f"{name}: no foreground request reached local server")
                results.append({"scenario": name, "requests": len(requests),
                                "tools": [t["function"]["name"] for t in requests[0]["tools"]],
                                "tool_schemas": requests[0]["tools"],
                                "tool_result_ids": [m.get("tool_call_id") for request in requests
                                                    for m in request.get("messages", []) if m.get("role") == "tool"],
                                "system": [str(m.get("content")).replace(str(root.resolve()), "<sandbox>").replace(str(root), "<sandbox>") for m in requests[0]["messages"] if m.get("role") == "system"]})
            (report_dir / "requests.json").write_text(json.dumps(server.requests, indent=2))
            (report_dir / "results.json").write_text(json.dumps(results, indent=2))
            return results
    finally:
        (report_dir / "requests.json").write_text(json.dumps(server.requests, indent=2))
        server.shutdown()
        server.server_close()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--binary", type=Path, required=True)
    parser.add_argument("--baseline", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    def run(binary, name):
        folder = args.output / name
        folder.mkdir(exist_ok=True)
        return exercise(binary.resolve(), folder)
    baseline = run(args.baseline, "baseline") if args.baseline else None
    current = run(args.binary, "current")
    if baseline:
        # Paths and runtime metadata in system prompts differ across isolated
        # homes; tool names, IDs, request count and final output must match.
        normalize = lambda rows: [{key: row[key] for key in ("scenario", "requests", "tools", "tool_result_ids", "system", "tool_schemas")} for row in rows]
        if normalize(baseline) != normalize(current):
            raise AssertionError("original preset protocol changed; inspect results.json")
    print(json.dumps({"status": "passed", "scenarios": [row["scenario"] for row in current],
                      "baseline_compared": baseline is not None, "output": str(args.output)}, indent=2))


if __name__ == "__main__":
    main()
