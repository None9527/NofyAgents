#!/usr/bin/env python3
"""Collect a same-binary Windows stack comparison and a separate original fixture run.

This is an opt-in diagnostic, NOT the original consumer gate or a proposed fix.
Execution requires the explicit `collect --execute-windows` subcommand/flag.
Use only in an authorized, disposable Windows environment. A collected result is
NOT a passing consumer gate, even if the larger-stack diagnostic succeeds.
"""
import argparse
import difflib
import hashlib
import json
import os
from pathlib import Path
import platform
import re
import shutil
import struct
import subprocess
import sys
import time
import tomllib

SOURCE_SHA = "5844138f8d748ffe183c9ed1124cadcf023224d3"
TARGET = "x86_64-pc-windows-msvc"
TOOLCHAIN = "1.94.0-" + TARGET
FIXTURE = "fixtures/agent-runtime-consumer/"
PACKAGE = "nofy-independent-consumer"
ENTRY = b'#[tokio::main(flavor = "current_thread")]\nasync fn main() -> Result<(), Error> {'
RENAMED = ENTRY.replace(b"async fn main()", b"async fn diagnostic_consumer_body()")
MODES = {"main": None, "1mib": 1024 * 1024, "16mib": 16 * 1024 * 1024}
FLAGS = ("delegation", "parallel", "configuration", "recipe", "workflow",
         "workflow_module", "workflow_hook", "program", "event_program",
         "declarative_system", "file_catalog")
EXPECTED = {"status": "passed", "agents": ["business", "research-pack", "standalone-coding"],
            **{name: True for name in FLAGS}}
ANCHORS = {
    FIXTURE + "src/main.rs": "e0395ec11df4d77f0c57ea494bd7eb5a604f886a",
    FIXTURE + "Cargo.toml": "14f82df97b061f5895beb10583230bc57fa89f06",
    "scripts/verify-agent-managed-consumer.py": "651aaafbc65c40f20e9b50a3bc9a9c310cc4b205",
    "rust-toolchain.toml": "4671ac3a303f05f0af31c286b0425a7c00673cc2",
    "scripts/verify-agent-independent-consumer.py": "f97c0d9e71892f74a3757c0d1b70804ec9644763",
}
# Replace only the entry name, append the dispatcher. No boxing, custom runtime,
# extra Tokio features, inlining attributes, linker stack flags or fixture edits.
WRAPPER = b'''

// Diagnostic-only dispatcher. The fixture above is unchanged except entry name.
fn main() -> std::process::ExitCode {
    let mut args = std::env::args().skip(1);
    let mode = args.next().unwrap_or_default();
    if args.next().is_some() || !matches!(mode.as_str(), "main" | "1mib" | "16mib") {
        eprintln!("usage: nofy-independent-consumer <main|1mib|16mib>");
        return std::process::ExitCode::from(2);
    }
    // This zero-capture closure is the ONE entry path for all three modes.
    // Calling the original macro expansion here FIRST constructs the runtime
    // and root application future on the selected thread, not on the OS main
    // stack before spawning. Its runtime has dropped when the call returns.
    let entry = || std::process::Termination::report(diagnostic_consumer_body());
    if mode == "main" {
        return entry();
    }
    let stack_bytes = match mode.as_str() {
        "1mib" => 1024 * 1024,
        "16mib" => 16 * 1024 * 1024,
        _ => unreachable!(),
    };
    // Both explicit modes have the same closure type, spawn site and thread name.
    match std::thread::Builder::new()
        .name("nofy-stack-diagnostic".into())
        .stack_size(stack_bytes)
        .spawn(entry)
    {
        Ok(thread) => match thread.join() {
            Ok(code) => code,
            Err(panic) => std::panic::resume_unwind(panic),
        },
        Err(error) => std::process::Termination::report(Result::<(), _>::Err(error)),
    }
}
'''


def require(condition, message):
    if not condition:
        raise ValueError(message)


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def blob_sha(data):
    return hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest()


def save_json(path, value):
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def generate(source):
    require(source.count(ENTRY) == 1 and source.count(b"#[tokio::main") == 1
            and source.count(b"async fn main(") == 1, "fixture entry drift")
    require(b"diagnostic_consumer_body" not in source, "generated symbol collision")
    return source.replace(ENTRY, RENAMED, 1) + WRAPPER


def relocate(manifest, root):
    # Same relocation as verify-agent-independent-consumer.py, no imports into checkout.
    def replacement(match):
        value = str(root / "crates" / match[2])
        return match[1] + json.dumps(value, ensure_ascii=False).replace("\x7f", "\\u007f")
    result, count = re.subn(r'(\bpath\s*=\s*)"\.\./\.\./crates/([^"\\\r\n]+)"',
                            replacement, manifest)
    require(count == 4, "dependency path contract drift")
    original, changed = tomllib.loads(manifest), tomllib.loads(result)
    for name, dep in original["dependencies"].items():
        if isinstance(dep, dict) and "path" in dep:
            dep["path"] = changed["dependencies"][name]["path"]
    require(original == changed, "non-path manifest change")
    return result


def pe_stack(data):
    require(len(data) >= 64 and data[:2] == b"MZ", "not a DOS/PE image")
    offset = struct.unpack_from("<I", data, 0x3C)[0]
    require(offset + 24 <= len(data) and data[offset:offset + 4] == b"PE\0\0", "bad PE header")
    machine = struct.unpack_from("<H", data, offset + 4)[0]
    size = struct.unpack_from("<H", data, offset + 20)[0]
    optional = offset + 24
    require(optional + size <= len(data) and size >= 2, "truncated PE optional header")
    magic = struct.unpack_from("<H", data, optional)[0]
    require(magic in (0x10B, 0x20B), "unknown PE optional header")
    field_offset, fmt, minimum = (72, "<II", 80) if magic == 0x10B else (72, "<QQ", 88)
    require(size >= minimum, "missing PE stack fields")
    reserve, commit = struct.unpack_from(fmt, data, optional + field_offset)
    return {"machine": hex(machine), "optional_header_magic": hex(magic),
            "size_of_stack_reserve": reserve, "size_of_stack_commit": commit,
            "meaning": "PE main-thread default; not a measurement of spawned-thread effective bounds"}


def clean_environment(output):
    env = os.environ.copy()
    removed = []
    for name in list(env):
        upper = name.upper()
        if upper.startswith(("CARGO_", "RUSTC_", "RUSTDOC_")) or upper in {
                "RUST_MIN_STACK", "RUSTFLAGS", "RUSTDOCFLAGS", "RUSTC", "RUSTDOC",
                "RUSTUP_TOOLCHAIN", "CL", "_CL_", "LINK", "_LINK_"}:
            removed.append(name)
            del env[name]
    env.update(CARGO_HOME=str(output / "cargo-home"), CARGO_TARGET_DIR=str(output / "target"),
               CARGO_TERM_COLOR="never", CARGO_BUILD_JOBS="2", GIT_OPTIONAL_LOCKS="0")
    return env, sorted(removed)


def execute(command, cwd, env, evidence, label, timeout):
    record = {"command": [str(x) for x in command], "returncode": None, "exit_u32_hex": None,
              "timeout": False, "started_ns": time.time_ns()}
    stdout, stderr = b"", b""
    start = time.monotonic()
    try:
        with subprocess.Popen(command, cwd=cwd, env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE) as process:
            record["pid"] = process.pid
            try:
                stdout, stderr = process.communicate(timeout=timeout)
            except subprocess.TimeoutExpired:
                record["timeout"] = True
                process.kill()
                stdout, stderr = process.communicate()
            record.update(returncode=process.returncode, exit_u32_hex=f"0x{process.returncode & 0xFFFFFFFF:08x}")
    except OSError as error:
        record["launch_error"] = str(error)
    record["seconds"] = round(time.monotonic() - start, 3)
    for kind, data in (("stdout", stdout), ("stderr", stderr)):
        name = f"{label}.{kind}.bin"
        (evidence / name).write_bytes(data)
        (evidence / f"{label}.{kind}.txt").write_text(data.decode("utf-8", "replace"), encoding="utf-8")
        record[kind] = {"file": name, "sha256": sha256(data), "bytes": len(data)}
    save_json(evidence / (label + ".json"), record)
    return record, stdout, stderr


def business_valid(stdout, stderr):
    try:
        value = json.loads(stdout)
        return not stderr.strip() and value == EXPECTED and all(value[key] is True for key in FLAGS)
    except (ValueError, TypeError, KeyError):
        return False


def git(root, *args):
    env = dict(os.environ, GIT_OPTIONAL_LOCKS="0")
    return subprocess.check_output(["git", "-C", str(root), *args], env=env)


def verify_checkout(root):
    require(Path(git(root, "rev-parse", "--show-toplevel").decode().strip()).resolve() == root,
            "source-root must be repository top level")
    require(git(root, "rev-parse", "HEAD").decode().strip() == SOURCE_SHA, "unexpected source commit")
    require(not git(root, "status", "--porcelain", "--untracked-files=all").strip(), "source checkout not clean")


def collect(args):
    require(args.execute_windows, "no execution without --execute-windows")
    require(platform.system() == "Windows", "collection requires native Windows; no WSL/Wine/cross run")
    root, output = args.source_root.resolve(), args.output.resolve()
    require(not output.is_relative_to(root) and not root.is_relative_to(output), "output must be separate from source")
    verify_checkout(root)
    # No parent Cargo config can silently change target/profile/linker flags.
    for parent in (output, *output.parents):
        require(not any((parent / ".cargo" / name).exists() for name in ("config", "config.toml")),
                "output inherits a Cargo config")
    output.mkdir(parents=True, exist_ok=False)
    evidence, consumer = output / "evidence", output / "consumer"
    evidence.mkdir()
    consumer.mkdir()
    report = {"schema": 1, "kind": "diagnostic-only", "source_sha": SOURCE_SHA,
              "collector_sha256": sha256(Path(__file__).read_bytes()),
              "status": "incomplete", "original_gate": "unmodified; this diagnostic does not replace or revalidate the gate",
              "original_fixture": {"status": "not_run"},
              "system": platform.platform(), "python": platform.python_version(), "stages": {}, "runs": {}}
    try:
        report["source_tree"] = git(root, "rev-parse", "HEAD^{tree}").decode().strip()
        (evidence / "source-tree.txt").write_bytes(git(root, "ls-tree", "-r", "HEAD"))
        files = {}
        for record in git(root, "ls-tree", "-rz", "HEAD", "--", FIXTURE).split(b"\0"):
            if not record:
                continue
            attributes, name = record.split(b"\t", 1)
            mode, kind, object_id = attributes.decode().split()
            path = name.decode("utf-8")
            require(mode in ("100644", "100755") and kind == "blob", "fixture contains nonregular files")
            require(not any(p in Path(path).parts for p in ("target", ".cargo")) and not path.endswith("Cargo.lock"),
                    "unexpected fixture Cargo configuration, target, or lockfile")
            data = git(root, "cat-file", "blob", object_id)
            require(blob_sha(data) == object_id, "blob identity mismatch")
            relative = path.removeprefix(FIXTURE)
            for base in (consumer, evidence / "fixture-source"):
                dest = base / relative
                dest.parent.mkdir(parents=True, exist_ok=True)
                dest.write_bytes(data)
            files[relative] = {"git_blob_sha": object_id, "sha256": sha256(data)}
        for path, expected in ANCHORS.items():
            require(git(root, "rev-parse", "HEAD:" + path).decode().strip() == expected, "source anchor drift: " + path)
        report["fixture_files"] = files
        original = (consumer / "src/main.rs").read_bytes()
        generated = generate(original)
        (consumer / "src/main.rs").write_bytes(generated)
        (evidence / "generated-main.rs").write_bytes(generated)
        diff = "".join(difflib.unified_diff(original.decode().splitlines(True), generated.decode().splitlines(True),
                                            "original/src/main.rs", "diagnostic/src/main.rs"))
        (evidence / "harness.diff").write_text(diff, encoding="utf-8", newline="\n")
        manifest = relocate((consumer / "Cargo.toml").read_text(encoding="utf-8"), root)
        (consumer / "Cargo.toml").write_text(manifest, encoding="utf-8", newline="\n")
        (evidence / "Cargo.toml").write_bytes((consumer / "Cargo.toml").read_bytes())
        report["generated_source_sha256"] = sha256(generated)
        report["manifest_sha256"] = sha256((consumer / "Cargo.toml").read_bytes())
        env, report["removed_environment_names"] = clean_environment(output)
        def run(command, label):
            result, stdout, _ = execute(command, consumer, env, evidence, label, args.build_timeout)
            report["stages"][label] = result
            require(result["returncode"] == 0 and not result["timeout"], label + " failed; inspect evidence")
            return stdout
        rust = ["rustup", "run", TOOLCHAIN]
        compiler = run(rust + ["rustc", "-vV"], "rustc").decode()
        require("release: 1.94.0\n" in compiler.replace("\r\n", "\n") and "host: " + TARGET in compiler,
                "wrong compiler version or host")
        run(rust + ["cargo", "-V"], "cargo")
        cargo = rust + ["cargo"]
        run(cargo + ["generate-lockfile"], "lock")  # Exactly one consumer resolution.
        lock = (consumer / "Cargo.lock").read_bytes()
        (evidence / "Cargo.lock").write_bytes(lock)
        report["lockfile_sha256"] = sha256(lock)
        run(cargo + ["fetch", "--locked", "--target", TARGET], "fetch")
        metadata = json.loads(run(cargo + ["metadata", "--offline", "--locked", "--format-version", "1",
                                          "--filter-platform", TARGET], "metadata"))
        report["versions"] = {name: sorted({p["version"] for p in metadata["packages"] if p["name"] == name})
                              for name in ("nofy-agent-runtime", "tokio", "futures", "futures-util")}
        run(cargo + ["tree", "--offline", "--locked", "--target", TARGET, "--edges", "normal", "--prefix", "none"],
            "dependencies")
        # Exactly ONE comparison build. All three modes invoke this executable directly.
        build = run(cargo + ["build", "--offline", "--locked", "--target", TARGET, "--profile", "dev",
                             "--jobs", "2", "--message-format=json"], "build")
        messages = [json.loads(line) for line in build.splitlines() if line.strip()]
        require(messages[-1] == {"reason": "build-finished", "success": True}, "build not finished")
        artifacts = [m for m in messages if m.get("reason") == "compiler-artifact" and m.get("executable")
                     and m.get("package_id") == metadata["resolve"]["root"]]
        require(len(artifacts) == 1, "expected one root binary")
        artifact = artifacts[0]
        require(artifact["fresh"] is False and artifact["target"]["name"] == PACKAGE
                and artifact["target"]["kind"] == ["bin"] and not artifact["profile"]["test"]
                and artifact["profile"]["opt_level"] == "0" and artifact["profile"]["debug_assertions"] is True
                and artifact["profile"].get("debuginfo") in (2, "full"),
                "expected freshly built default debug consumer")
        binary = Path(artifact["executable"]).resolve()
        require(binary.is_relative_to(output / "target") and binary.is_file(), "unexpected binary path")
        binary_bytes = binary.read_bytes()
        report["binary"] = {"sha256": sha256(binary_bytes), "cargo_artifact": artifact, "pe": pe_stack(binary_bytes)}
        require(report["binary"]["pe"]["machine"] == "0x8664", "expected x64 Windows PE")
        captured_binary = evidence / "nofy-independent-consumer.exe"
        shutil.copyfile(binary, captured_binary)
        for mode, stack_bytes in MODES.items():
            # Snapshot the SAME lock, source and executable around every subprocess.
            def identities():
                return {"binary_sha256": sha256(captured_binary.read_bytes()),
                        "lockfile_sha256": sha256((consumer / "Cargo.lock").read_bytes()),
                        "generated_source_sha256": sha256((consumer / "src/main.rs").read_bytes()),
                        "manifest_sha256": sha256((consumer / "Cargo.toml").read_bytes())}
            expected = {"binary_sha256": report["binary"]["sha256"], "lockfile_sha256": sha256(lock),
                        "generated_source_sha256": sha256(generated), "manifest_sha256": report["manifest_sha256"]}
            require(identities() == expected, "identity drift before " + mode)
            result, stdout, stderr = execute([str(captured_binary), mode], consumer, env, evidence,
                                             "run-" + mode, args.run_timeout)
            result.update(mode=mode, requested_stack_bytes=stack_bytes, identities=expected,
                          business_report_valid=business_valid(stdout, stderr))
            result["process_and_business_pass"] = (
                result["returncode"] == 0 and not result["timeout"] and result["business_report_valid"])
            save_json(evidence / ("run-" + mode + ".json"), result)
            report["runs"][mode] = result
            save_json(evidence / "result.json", report)
            require(identities() == expected, "identity drift after " + mode)
            # Deliberately continue after crashes, nonzero exits and timeouts.
        # Separate original-fixture control: restore its exact entry point, build
        # a second executable with the SAME lockfile/dependency closure/profile.
        # This is not a fourth mode and is never substituted for the comparison
        # binary. Only the external disposable copy changes; repo files do not.
        (consumer / "src/main.rs").write_bytes(original)
        report["original_fixture"] = {"status": "building", "source_sha256": sha256(original),
                                      "lockfile_sha256": sha256(lock)}
        original_build = run(cargo + ["build", "--offline", "--locked", "--target", TARGET,
                                     "--profile", "dev", "--jobs", "2", "--message-format=json"],
                             "build-original")
        original_messages = [json.loads(line) for line in original_build.splitlines() if line.strip()]
        require(original_messages[-1] == {"reason": "build-finished", "success": True},
                "original fixture build not finished")
        original_artifacts = [m for m in original_messages if m.get("reason") == "compiler-artifact"
                              and m.get("executable") and m.get("package_id") == metadata["resolve"]["root"]]
        require(len(original_artifacts) == 1, "expected one original fixture binary")
        original_artifact = original_artifacts[0]
        require(not original_artifact["fresh"] and original_artifact["profile"] == artifact["profile"]
                and original_artifact["target"] == artifact["target"], "original fixture build drift")
        original_binary = Path(original_artifact["executable"]).resolve()
        require(original_binary.is_relative_to(output / "target") and original_binary.is_file(),
                "unexpected original binary path")
        original_bytes = original_binary.read_bytes()
        original_pe = pe_stack(original_bytes)
        require(original_pe["machine"] == "0x8664", "expected original x64 Windows PE")
        original_capture = evidence / "original-consumer.exe"
        shutil.copyfile(original_binary, original_capture)
        original_identities = {"binary_sha256": sha256(original_bytes), "lockfile_sha256": sha256(lock),
                               "source_sha256": sha256(original), "manifest_sha256": report["manifest_sha256"]}
        def verify_original():
            require(sha256(original_capture.read_bytes()) == original_identities["binary_sha256"]
                    and sha256((consumer / "Cargo.lock").read_bytes()) == sha256(lock)
                    and (consumer / "src/main.rs").read_bytes() == original
                    and sha256((consumer / "Cargo.toml").read_bytes()) == report["manifest_sha256"]
                    and sha256(captured_binary.read_bytes()) == report["binary"]["sha256"],
                    "original control or captured comparison identity drift")
        verify_original()
        result, stdout, stderr = execute([str(original_capture)], consumer, env, evidence,
                                         "run-original", args.run_timeout)
        result.update(status="collected", identities=original_identities, pe=original_pe,
                      cargo_artifact=original_artifact, business_report_valid=business_valid(stdout, stderr))
        result["process_and_business_pass"] = (
            result["returncode"] == 0 and not result["timeout"] and result["business_report_valid"])
        report["original_fixture"] = result
        save_json(evidence / "run-original.json", result)
        verify_original()
        # A launch failure is a collection failure, never a stack-size finding.
        require(not any("launch_error" in result for result in [*report["runs"].values(), result]),
                "a consumer process failed to launch")
        verify_checkout(root)
        report["status"] = "collected"  # NOT a consumer pass and NOT a replacement CI gate.
        report["source_checkout_unchanged"] = True
    except Exception as error:
        report["error"] = str(error)
    finally:
        save_json(evidence / "result.json", report)
    print(json.dumps({"status": report["status"], "evidence": str(evidence), "runs": report["runs"],
                      "original_fixture": report["original_fixture"]}, indent=2))
    return 0 if report["status"] == "collected" else 1


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    preview = commands.add_parser("render", help="write preview only; no compiler or consumer execution")
    preview.add_argument("--fixture-main", type=Path, required=True)
    preview.add_argument("--output", type=Path, required=True)
    collect_parser = commands.add_parser("collect", help="explicitly execute on an authorized native Windows host")
    collect_parser.add_argument("--execute-windows", action="store_true")
    collect_parser.add_argument("--source-root", type=Path, required=True)
    collect_parser.add_argument("--output", type=Path, required=True)
    collect_parser.add_argument("--build-timeout", type=int, default=1800)
    collect_parser.add_argument("--run-timeout", type=int, default=120)
    args = parser.parse_args()
    if args.command == "collect":
        return collect(args)
    original = args.fixture_main.read_bytes()
    require(blob_sha(original) == ANCHORS[FIXTURE + "src/main.rs"], "preview fixture SHA mismatch")
    generated = generate(original)
    args.output.mkdir(parents=True, exist_ok=False)
    (args.output / "main.rs").write_bytes(generated)
    (args.output / "harness.diff").write_text("".join(difflib.unified_diff(
        original.decode().splitlines(True), generated.decode().splitlines(True),
        "original/src/main.rs", "diagnostic/src/main.rs")), encoding="utf-8", newline="\n")
    save_json(args.output / "preparation.json", {"source_sha": SOURCE_SHA, "executed": False,
              "original_git_blob_sha": blob_sha(original), "generated_sha256": sha256(generated)})
    return 0


if __name__ == "__main__":
    sys.exit(main())
