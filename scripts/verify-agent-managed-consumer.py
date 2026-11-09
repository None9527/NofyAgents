#!/usr/bin/env python3
"""Verify an explicitly opt-in managed consumer, never the default consumer."""
import argparse
import difflib
import hashlib
import json
import os
from pathlib import Path, PurePath, PurePosixPath, PureWindowsPath
import platform
import re
import subprocess
import sys
import tempfile
import time
import tomllib

ROOT = Path(__file__).resolve().parents[1]
MODE = "opt-in-sdk-managed-16mib-current-thread"
STACK_BYTES = 16 * 1024 * 1024
PACKAGE = "nofy-opt-in-managed-consumer"
RUNNERS = {"ubuntu-24.04": "Linux", "macos-latest": "Darwin", "windows-latest": "Windows"}
FLAGS = ("delegation", "parallel", "configuration", "recipe", "workflow",
         "workflow_module", "workflow_hook", "program", "event_program",
         "declarative_system", "file_catalog")
AGENTS = ["business", "research-pack", "standalone-coding"]
INVENTORY = sorted([*FLAGS, *["agent:" + name for name in AGENTS]])
FORBIDDEN = {"nofy-agent-host", "nofy-shell", "nofy-tools", "nofy-agent",
             "nofy-daemon", "nofy-pager", "nofy-workspace", "nofy-acp",
             "nofy-sandbox", "nofy-workflow", "nofy-orchestra"}
ENTRY = '#[tokio::main(flavor = "current_thread")]\nasync fn main() -> Result<(), Error> {'
RENAMED = 'async fn managed_consumer_body() -> Result<(), Error> {'
WRAPPER = """
// Generated opt-in harness. Business body above is otherwise byte-for-byte unchanged.
struct ManagedCompletion(Result<(), Error>);
impl std::process::Termination for ManagedCompletion {
    fn report(self) -> std::process::ExitCode {
        // The public SDK invokes report only after dropping its runtime.
        let code = std::process::Termination::report(self.0);
        if code == std::process::ExitCode::SUCCESS {
            println!("{}", serde_json::json!({
                "managed_harness": "opt-in-sdk-managed-16mib-current-thread",
                "stack_bytes": nofy_agent_runtime::managed::STACK_BYTES,
                "runtime": "current_thread",
                "runtime_dropped": true,
                "thread_name": std::thread::current().name().unwrap()
            }));
        }
        code
    }
}
fn main() -> std::process::ExitCode {
    nofy_agent_runtime::managed::run(|| async {
        ManagedCompletion(managed_consumer_body().await)
    })
}
"""
MARKER = {"managed_harness": MODE, "stack_bytes": STACK_BYTES,
          "runtime": "current_thread", "runtime_dropped": True,
          "thread_name": "nofy-sdk-main"}


def require(condition, message):
    if not condition:
        raise ValueError(message)


def digest(data):
    return hashlib.sha256(data).hexdigest()


def write_json(path, value):
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def strict_json(text):
    def unique(pairs):
        result = {}
        for key, value in pairs:
            require(key not in result, "duplicate JSON key: " + key)
            result[key] = value
        return result
    return json.loads(text, object_pairs_hook=unique)


def generate_harness(source):
    require(source.count(ENTRY) == 1, "fixture entry drift: expected exactly one fixed entry")
    require(source.count("#[tokio::main") == 1 and source.count("async fn main(") == 1,
            "ambiguous fixture entry")
    require("managed_consumer_body" not in source, "generated symbol already exists")
    return source.replace(ENTRY, RENAMED, 1) + WRAPPER


def parse_execution(stdout, stderr):
    require(not stderr.strip(), "consumer emitted unexpected stderr")
    lines = stdout.strip().splitlines()
    require(len(lines) == 2, "expected exactly business result and managed completion")
    report, marker = [strict_json(line) for line in lines]
    expected = {"status": "passed", "agents": AGENTS, **{name: True for name in FLAGS}}
    # Equality alone accepts integers as booleans.
    require(report == expected and all(report[name] is True for name in FLAGS),
            "missing, failed, unknown or inconsistent business scenario")
    require(marker == MARKER and marker.get("runtime_dropped") is True
            and type(marker.get("stack_bytes")) is int, "invalid managed completion")
    return report


def clean_environment():
    env = os.environ.copy()
    removed = {}
    for name in list(env):
        if (name in {"RUST_MIN_STACK", "RUSTFLAGS", "CARGO_ENCODED_RUSTFLAGS",
                     "CARGO_BUILD_TARGET", "CARGO_BUILD_RUSTFLAGS", "RUSTC_WRAPPER",
                     "RUSTC_WORKSPACE_WRAPPER", "RUSTC", "RUSTUP_TOOLCHAIN",
                     "CARGO_BUILD_RUSTC", "CARGO_BUILD_RUSTC_WRAPPER",
                     "CARGO_BUILD_RUSTC_WORKSPACE_WRAPPER"} or
                name.startswith("CARGO_PROFILE_") or
                name.startswith("CARGO_TARGET_") and name.endswith(("_RUSTFLAGS", "_RUNNER"))):
            removed[name] = env.pop(name)
    env["CARGO_TERM_COLOR"] = "never"
    env["CARGO_BUILD_JOBS"] = "2"
    return env, sorted(removed)


def execute(command, cwd, env, output, label, timeout, stages):
    start = time.monotonic()
    record = {"command": command, "status": "failed", "returncode": None, "timeout": False}
    stages[label] = record
    stdout, stderr = "", ""
    try:
        result = subprocess.run(command, cwd=cwd, env=env, text=True, encoding="utf-8",
                                errors="strict", capture_output=True, timeout=timeout)
        stdout, stderr = result.stdout, result.stderr
        record["returncode"] = result.returncode
        record["status"] = "passed" if result.returncode == 0 else "failed"
    except subprocess.TimeoutExpired as error:
        record["timeout"] = True
        stdout = error.stdout or ""
        stderr = error.stderr or ""
        if isinstance(stdout, bytes):
            stdout = stdout.decode("utf-8", errors="replace")
        if isinstance(stderr, bytes):
            stderr = stderr.decode("utf-8", errors="replace")
    finally:
        record["seconds"] = round(time.monotonic() - start, 3)
        (output / (label + ".stdout.log")).write_text(stdout, encoding="utf-8")
        (output / (label + ".stderr.log")).write_text(stderr, encoding="utf-8")
    require(record["status"] == "passed", label + " failed or timed out")
    return stdout


def fixture_files(fixture):
    result = {}
    for path in sorted(fixture.rglob("*")):
        relative = path.relative_to(fixture)
        if "target" in relative.parts or path.name == "Cargo.lock":
            continue
        require(not path.is_symlink(), "fixture symlink is not supported")
        if path.is_file():
            result[relative.as_posix()] = path.read_bytes().replace(b"\r\n", b"\n")
    require({"Cargo.toml", "src/main.rs", "src/configured_event.rs",
             "src/declarative_system.rs"}.issubset(result), "missing business fixture")
    require(not any(".cargo" in Path(name).parts for name in result), "fixture Cargo config")
    return result


def runtime_features(metadata, declared):
    packages = {package["id"]: package for package in metadata["packages"]}
    nodes = metadata["resolve"]["nodes"]
    runtime = [node for node in nodes if packages[node["id"]]["name"] == "nofy-agent-runtime"]
    require(len(runtime) == 1, "missing or duplicate runtime package")
    features = sorted(runtime[0]["features"])
    require(features == sorted(["default", *declared]), "unexpected runtime features")
    return features


def dependency_boundary(tree):
    names = {line.split()[0] for line in tree.splitlines() if line.strip()}
    require({PACKAGE, "nofy-agent-runtime"}.issubset(names),
            "empty or incomplete normal dependency tree")
    require(not names & FORBIDDEN, "product dependency present: " + str(names & FORBIDDEN))


def parse_build(text, root_id):
    messages = [strict_json(line) for line in text.splitlines() if line.strip()]
    require(messages and messages[-1] == {"reason": "build-finished", "success": True},
            "missing successful Cargo build completion")
    artifacts = [item for item in messages if item.get("reason") == "compiler-artifact"
                 and item.get("package_id") == root_id and item.get("executable")]
    require(len(artifacts) == 1, "missing or duplicate root consumer binary")
    artifact = artifacts[0]
    require(artifact.get("fresh") is False and artifact.get("profile", {}).get("test") is False
            and artifact["target"].get("name") == PACKAGE
            and artifact["target"].get("kind") == ["bin"], "wrong or cached root binary")
    return artifact


def relocate_dependency_paths(text: str, root: PurePath) -> str:
    """Relocate the fixture's crate dependencies without changing path contents."""
    def replace_path(match: re.Match) -> str:
        path = str(root / "crates" / match[2])
        # JSON escapes are valid in TOML basic strings. Keep Unicode scalar
        # values intact (ASCII encoding would produce invalid surrogate pairs),
        # and escape DEL, which JSON allows literally but TOML forbids.
        encoded = json.dumps(path, ensure_ascii=False).replace("\x7f", "\\u007f")
        return match[1] + encoded

    return re.sub(r'(\bpath\s*=\s*)"\.\./\.\./crates/([^"\\\r\n]+)"',
                  replace_path, text)



def sdk_source_hashes(root=ROOT):
    """Fingerprint local crate inputs, including uncommitted SDK source edits."""
    files = [root / name for name in ("Cargo.toml", "Cargo.lock", "rust-toolchain.toml")]
    for path in sorted((root / "crates").rglob("*")):
        relative = path.relative_to(root)
        if "target" in relative.parts or ".git" in relative.parts:
            continue
        require(not path.is_symlink(), "local crate source symlink is not supported")
        if path.is_file():
            files.append(path)
    result = {}
    for path in files:
        data = path.read_bytes()
        # Git's native text checkout may use CRLF. Preserve binary asset bytes.
        try:
            data.decode("utf-8")
        except UnicodeDecodeError:
            pass
        else:
            data = data.replace(b"\r\n", b"\n")
        result[path.relative_to(root).as_posix()] = digest(data)
    require("crates/common/nofy-agent-runtime/src/managed.rs" in result,
            "missing public managed SDK source")
    return result


def collect(args, root=ROOT):
    output = args.output.resolve()
    output.mkdir(parents=True, exist_ok=False)
    report = {"schema": 1, "mode": MODE, "status": "failed", "runner": args.runner,
              "system": platform.system(), "machine": platform.machine(),
              "platform_detail": platform.platform(), "source_root": str(root.resolve()),
              "python": platform.python_version(), "stages": {}, "inventory": []}
    try:
        require(report["system"] == RUNNERS[args.runner], "runner is not native for this OS")
        report["sdk_source_sha256"] = sdk_source_hashes(root)
        files = fixture_files(root / "fixtures/agent-runtime-consumer")
        raw_hashes = {}
        for name in files:
            raw = (root / "fixtures/agent-runtime-consumer" / name).read_bytes()
            raw_hashes[name] = digest(raw)
            saved = output / "fixture-source" / name
            saved.parent.mkdir(parents=True, exist_ok=True)
            saved.write_bytes(raw)
        report["fixture_raw_sha256"] = raw_hashes
        original = files["src/main.rs"].decode("utf-8")
        generated = generate_harness(original)
        manifest = files["Cargo.toml"].decode("utf-8")
        declared = tomllib.loads(manifest)["dependencies"]["nofy-agent-runtime"]["features"]
        require(declared == ["pack", "workflow", "control-file"], "feature contract drift")
        report.update({"fixture_sha256": {name: digest(data) for name, data in files.items()},
                       "fixture_hash_encoding": "UTF-8 with CRLF normalized to LF",
                       "declared_features": declared, "generated_sha256": digest(generated.encode()),
                       "stack_bytes": STACK_BYTES, "runtime": "current_thread"})
        (output / "original-main.rs").write_text(original, encoding="utf-8", newline="\n")
        (output / "managed-main.rs").write_text(generated, encoding="utf-8", newline="\n")
        (output / "managed-harness.diff").write_text("".join(difflib.unified_diff(
            original.splitlines(True), generated.splitlines(True),
            fromfile="original/src/main.rs", tofile="managed/src/main.rs")), encoding="utf-8", newline="\n")
        write_json(output / "fixture-sha256.json", report["fixture_sha256"])
        env, removed = clean_environment()
        report["removed_environment_names"] = removed
        cargo_home = Path(env.get("CARGO_HOME", Path.home() / ".cargo")).resolve()
        require(not any((cargo_home / name).exists() for name in ("config", "config.toml")),
                "global Cargo config is not supported by the controlled managed gate")
        report["cargo_home_configuration"] = "absent"
        with tempfile.TemporaryDirectory(prefix="nofy-opt-in-managed-") as directory:
            consumer = Path(directory).resolve() / "consumer"
            require(not consumer.is_relative_to(root.resolve()), "consumer remains inside workspace")
            # Cargo discovers config from the invocation cwd, not path dependencies.
            for ancestor in (consumer, *consumer.parents):
                require(not any((ancestor / ".cargo" / name).exists()
                                for name in ("config", "config.toml")),
                        "temporary consumer would inherit Cargo config")
            consumer.mkdir()
            for name, data in files.items():
                target = consumer / name
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(data)
            toolchain = (root / "rust-toolchain.toml").read_bytes()
            (consumer / "rust-toolchain.toml").write_bytes(toolchain)
            report["toolchain_file_sha256"] = digest(toolchain.replace(b"\r\n", b"\n"))
            require(manifest.count('name = "nofy-independent-consumer"') == 1,
                    "fixture package identity drift")
            managed_manifest = relocate_dependency_paths(manifest, root.resolve()).replace(
                'name = "nofy-independent-consumer"', 'name = "' + PACKAGE + '"', 1)
            (consumer / "Cargo.toml").write_text(managed_manifest, encoding="utf-8", newline="\n")
            (output / "managed-manifest.diff").write_text("".join(difflib.unified_diff(
                manifest.splitlines(True), managed_manifest.splitlines(True),
                fromfile="original/Cargo.toml", tofile="managed/Cargo.toml")), encoding="utf-8")
            (consumer / "src/main.rs").write_text(generated, encoding="utf-8", newline="\n")
            (output / "generated-Cargo.toml").write_bytes((consumer / "Cargo.toml").read_bytes())
            target = (args.target_dir or Path(directory) / "target").resolve()
            require(not target.is_relative_to(root.resolve()) and not target.is_relative_to(output),
                    "target must be outside source workspace and artifact output")
            env["CARGO_TARGET_DIR"] = str(target)
            run = lambda command, label, timeout=args.timeout: execute(
                command, consumer, env, output, label, timeout, report["stages"])
            rustc = run(["rustc", "-vV"], "rustc")
            cargo = run(["cargo", "--version"], "cargo")
            require("host: " in rustc, "missing native rustc host")
            host = next(line[6:] for line in rustc.splitlines() if line.startswith("host: "))
            require({"Linux": "-linux-", "Darwin": "-apple-darwin", "Windows": "-windows-"}[
                report["system"]] in host, "compiler host does not match native OS")
            report.update({"rustc": rustc, "cargo": cargo.strip(), "host": host,
                           "outside_workspace": True, "consumer_path": str(consumer)})
            if args.fetch:
                run(["cargo", "fetch", "--target", host], "fetch")
            metadata = strict_json(run(["cargo", "metadata", "--offline",
                "--format-version", "1", "--filter-platform", host], "metadata"))
            report["resolved_runtime_features"] = runtime_features(metadata, declared)
            tree = run(["cargo", "tree", "--offline", "--target", host,
                        "--locked", "--edges", "normal", "--prefix", "none"], "dependencies")
            dependency_boundary(tree)
            lock = (consumer / "Cargo.lock").read_bytes()
            (output / "Cargo.lock").write_bytes(lock)
            report["lockfile_sha256"] = digest(lock)
            report["resolved_key_versions"] = {
                name: sorted({package["version"] for package in metadata["packages"]
                              if package["name"] == name})
                for name in ("nofy-agent-runtime", "tokio")}
            build = run(["cargo", "build", "--offline", "--locked", "--target", host,
                         "--jobs", "2", "--message-format=json"], "build")
            artifact = parse_build(build, metadata["resolve"]["root"])
            executable = Path(artifact["executable"]).resolve()
            require(executable.is_file() and executable.is_relative_to(target),
                    "unexpected executable location")
            report["binary"] = {"sha256": digest(executable.read_bytes()), "artifact": artifact}
            stdout = run([str(executable)], "execution", args.run_timeout)
            stderr = (output / "execution.stderr.log").read_text(encoding="utf-8")
            report["business_result"] = parse_execution(stdout, stderr)
            report["inventory"] = INVENTORY
            report["dependency_boundary"] = "passed"
            report["status"] = "passed"
    except (OSError, ValueError, KeyError, TypeError, StopIteration) as error:
        report["error"] = str(error)
    finally:
        write_json(output / "result.json", report)
    require(report["status"] == "passed", report.get("error", "managed verification failed"))
    try:
        validate_artifact(output)
    except (OSError, ValueError, KeyError, TypeError, StopIteration) as error:
        report["status"] = "failed"
        report["error"] = "artifact revalidation: " + str(error)
        write_json(output / "result.json", report)
        raise
    print(json.dumps(report, indent=2))


def validate_artifact(directory):
    report = strict_json((directory / "result.json").read_text(encoding="utf-8"))
    require(report["schema"] == 1 and report["status"] == "passed"
            and report["mode"] == MODE, "failed or wrong-mode result")
    require(report["runner"] in RUNNERS and RUNNERS[report["runner"]] == report["system"],
            "non-native runner result")
    require(report["stack_bytes"] == STACK_BYTES and report["runtime"] == "current_thread",
            "wrong runtime budget")
    require(report["inventory"] == INVENTORY and len(report["inventory"]) == 14,
            "missing or different scenario inventory")
    require(report["outside_workspace"] is True and report["dependency_boundary"] == "passed",
            "consumer boundary not verified")
    required = {"rustc", "cargo", "metadata", "dependencies", "build", "execution"}
    stages = report["stages"]
    require(required.issubset(stages) and set(stages) <= required | {"fetch"},
            "missing or unknown execution stages")
    for name, stage in stages.items():
        require(stage["status"] == "passed" and type(stage["returncode"]) is int
                and stage["returncode"] == 0 and stage["timeout"] is False,
                "failed stage: " + name)
        require(stage["command"], "empty command")
        require((directory / (name + ".stdout.log")).is_file()
                and (directory / (name + ".stderr.log")).is_file(), "missing stage logs")
    source = (directory / "original-main.rs").read_text(encoding="utf-8")
    generated = (directory / "managed-main.rs").read_text(encoding="utf-8")
    require(generated == generate_harness(source), "generated harness drift")
    hashes = strict_json((directory / "fixture-sha256.json").read_text(encoding="utf-8"))
    expected_files = fixture_files(ROOT / "fixtures/agent-runtime-consumer")
    require(hashes == report["fixture_sha256"]
            == {name: digest(data) for name, data in expected_files.items()},
            "fixture sources differ from checkout")
    raw_files = {name: (directory / "fixture-source" / name).read_bytes() for name in hashes}
    require(report["fixture_raw_sha256"] == {name: digest(data) for name, data in raw_files.items()}
            and hashes == {name: digest(data.replace(b"\r\n", b"\n")) for name, data in raw_files.items()},
            "raw source evidence does not match normalized identity")
    require(report["sdk_source_sha256"] == sdk_source_hashes(),
            "SDK source differs from collected checkout")
    require(report["cargo_home_configuration"] == "absent", "uncontrolled Cargo config")
    original_manifest = expected_files["Cargo.toml"].decode("utf-8")
    generated_manifest = (directory / "generated-Cargo.toml").read_text(encoding="utf-8")
    expected_manifest = tomllib.loads(original_manifest)
    expected_manifest["package"]["name"] = PACKAGE
    path_type = PureWindowsPath if report["system"] == "Windows" else PurePosixPath
    native_root = path_type(report["source_root"])
    require(native_root.is_absolute(), "source root is not absolute")
    for dependency in expected_manifest["dependencies"].values():
        if isinstance(dependency, dict) and "path" in dependency:
            parts = PurePosixPath(dependency["path"]).parts
            require(parts[:3] == ("..", "..", "crates"), "unexpected dependency path")
            dependency["path"] = str(native_root.joinpath(*parts[2:]))
    require(tomllib.loads(generated_manifest) == expected_manifest, "generated manifest drift")
    manifest_diff = "".join(difflib.unified_diff(original_manifest.splitlines(True),
        generated_manifest.splitlines(True), fromfile="original/Cargo.toml", tofile="managed/Cargo.toml"))
    require((directory / "managed-manifest.diff").read_text(encoding="utf-8") == manifest_diff,
            "generated manifest diff drift")
    require(digest(source.encode()) == hashes["src/main.rs"]
            and digest(generated.encode()) == report["generated_sha256"], "source hash mismatch")
    expected_diff = "".join(difflib.unified_diff(source.splitlines(True), generated.splitlines(True),
        fromfile="original/src/main.rs", tofile="managed/src/main.rs"))
    require((directory / "managed-harness.diff").read_text(encoding="utf-8") == expected_diff,
            "missing or changed harness diff")
    actual = parse_execution((directory / "execution.stdout.log").read_text(encoding="utf-8"),
                             (directory / "execution.stderr.log").read_text(encoding="utf-8"))
    require(actual == report["business_result"], "execution result differs")
    metadata = strict_json((directory / "metadata.stdout.log").read_text(encoding="utf-8"))
    require(report["declared_features"] == ["pack", "workflow", "control-file"], "feature drift")
    require(runtime_features(metadata, report["declared_features"])
            == report["resolved_runtime_features"], "resolved feature drift")
    dependency_boundary((directory / "dependencies.stdout.log").read_text(encoding="utf-8"))
    require(digest((directory / "Cargo.lock").read_bytes()) == report["lockfile_sha256"],
            "missing or changed actual consumer lockfile")
    versions = {name: sorted({package["version"] for package in metadata["packages"]
                             if package["name"] == name})
                for name in ("nofy-agent-runtime", "tokio")}
    require(all(versions.values()) and versions == report["resolved_key_versions"],
            "resolved runtime version evidence mismatch")
    artifact = parse_build((directory / "build.stdout.log").read_text(encoding="utf-8"),
                           metadata["resolve"]["root"])
    require(artifact == report["binary"]["artifact"]
            and stages["execution"]["command"] == [artifact["executable"]],
            "executed binary differs from compiled root artifact")
    require(len(report["binary"]["sha256"]) == 64
            and all(char in "0123456789abcdef" for char in report["binary"]["sha256"]),
            "missing binary fingerprint")
    require(stages["build"]["command"] == ["cargo", "build", "--offline", "--locked",
            "--target", report["host"], "--jobs", "2", "--message-format=json"],
            "unexpected build mode or target")
    expected_toolchain = (ROOT / "rust-toolchain.toml").read_bytes().replace(b"\r\n", b"\n")
    require(report["toolchain_file_sha256"] == digest(expected_toolchain),
            "toolchain source drift")
    pinned = tomllib.loads(expected_toolchain.decode())["toolchain"]["channel"]
    require("release: " + pinned + "\n" in report["rustc"], "compiler differs from pinned release")
    require((directory / "cargo.stdout.log").read_text(encoding="utf-8").strip() == report["cargo"],
            "Cargo version evidence mismatch")
    require((directory / "rustc.stdout.log").read_text(encoding="utf-8") == report["rustc"]
            and report["rustc"].count("host: " + report["host"] + "\n") == 1,
            "toolchain evidence mismatch")
    require({"Linux": "-linux-", "Darwin": "-apple-darwin", "Windows": "-windows-"}[
        report["system"]] in report["host"], "host target is not native")
    return report


def compare(directory):
    artifacts = sorted(directory.glob("*/result.json"))
    require(len(artifacts) == 3, "require exactly three native managed artifacts")
    reports = [validate_artifact(path.parent) for path in artifacts]
    require({r["runner"] for r in reports} == set(RUNNERS), "missing or duplicate native platform")
    for field in ("sdk_source_sha256", "fixture_sha256", "generated_sha256", "toolchain_file_sha256",
                  "declared_features", "resolved_runtime_features", "inventory", "mode",
                  "business_result", "resolved_key_versions"):
        require(all(r[field] == reports[0][field] for r in reports), "platform parity drift: " + field)
    versions = [next(line for line in r["rustc"].splitlines() if line.startswith("release: "))
                for r in reports]
    require(len(set(versions)) == 1, "native compiler releases differ")
    print("All three native opt-in managed consumers passed the same 14 scenarios.")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    collector = commands.add_parser("collect")
    collector.add_argument("--output", type=Path, required=True)
    collector.add_argument("--runner", choices=RUNNERS, required=True)
    collector.add_argument("--target-dir", type=Path)
    collector.add_argument("--fetch", action="store_true", help="fetch before offline validation")
    collector.add_argument("--timeout", type=int, default=1800)
    collector.add_argument("--run-timeout", type=int, default=180)
    comparer = commands.add_parser("compare")
    comparer.add_argument("directory", type=Path)
    args = parser.parse_args()
    try:
        if args.command == "collect":
            require(args.timeout > 0 and args.run_timeout > 0, "timeouts must be positive")
            collect(args)
        else:
            compare(args.directory)
    except (OSError, ValueError, KeyError, TypeError, StopIteration) as error:
        print("managed consumer verification failed: " + str(error), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
