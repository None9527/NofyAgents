"""Managed-mode evidence is strict; tests do not require Cargo or network."""
from contextlib import redirect_stdout
import io
import argparse
import copy
import importlib.util
import json
from pathlib import Path, PurePosixPath, PureWindowsPath
import subprocess
import tempfile
import tomllib
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[2]
SPEC = importlib.util.spec_from_file_location("managed", ROOT / "scripts/verify-agent-managed-consumer.py")
M = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(M)


class ManifestPathTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source = (ROOT / "fixtures/agent-runtime-consumer/Cargo.toml").read_text(
            encoding="utf-8"
        )
        cls.original = tomllib.loads(cls.source)

    def assert_paths_round_trip(self, root):
        generated = M.relocate_dependency_paths(self.source, root)
        # Exercise the same UTF-8 representation written to Cargo.toml by main.
        parsed = tomllib.loads(generated.encode("utf-8").decode("utf-8"))
        expected = copy.deepcopy(self.original)
        relocated = 0
        for dependency in expected["dependencies"].values():
            if isinstance(dependency, dict) and "path" in dependency:
                relative = PurePosixPath(dependency["path"])
                self.assertEqual(relative.parts[:3], ("..", "..", "crates"))
                dependency["path"] = str(root.joinpath(*relative.parts[2:]))
                relocated += 1
        self.assertGreater(relocated, 0)
        self.assertEqual(parsed, expected)
        self.assertEqual(parsed["workspace"], {})
        self.assertNotIn("sqlite", parsed["dependencies"]["nofy-agent-runtime"]["features"])
        return generated

    def test_posix_root(self):
        self.assert_paths_round_trip(PurePosixPath("/home/user/nofy-build"))

    def test_posix_root_with_spaces(self):
        self.assert_paths_round_trip(PurePosixPath("/work/check out/nofy build"))

    def test_windows_drive_root(self):
        self.assert_paths_round_trip(PureWindowsPath(r"C:\Users\user\nofy-build"))

    def test_windows_root_with_spaces(self):
        self.assert_paths_round_trip(PureWindowsPath(r"D:\Build work\nofy build"))

    def test_windows_unc_root(self):
        self.assert_paths_round_trip(PureWindowsPath(r"\\server\share\nofy-build"))

    def test_windows_unc_with_spaces(self):
        self.assert_paths_round_trip(PureWindowsPath(r"\\server\shared work\nofy build"))

    def test_windows_escape_like_components(self):
        self.assert_paths_round_trip(PureWindowsPath(r"C:\new\temp\back\form\return\u1234"))

    def test_unicode_in_both_path_flavors(self):
        for root in (
            PurePosixPath("/home/\u7528\u6237/caf\u00e9/\U0001f680-nofy"),
            PureWindowsPath("C:/\u7528\u6237/caf\u00e9/\U0001f680-nofy"),
            PureWindowsPath("//server/\u5171\u4eab/\U0001f680-nofy"),
        ):
            with self.subTest(root=root):
                self.assert_paths_round_trip(root)

    def test_posix_quotes_and_literal_backslashes(self):
        self.assert_paths_round_trip(PurePosixPath('/tmp/"quoted"/it\'s/\\new\\u1234'))

    def test_posix_toml_control_characters(self):
        # POSIX permits these filename characters; TOML requires escapes.
        for character in (chr(value) for value in range(1, 32)):
            with self.subTest(codepoint=ord(character)):
                self.assert_paths_round_trip(PurePosixPath("/tmp/before" + character + "after"))
        self.assert_paths_round_trip(PurePosixPath("/tmp/before\x7fafter"))

    def test_windows_extended_length_roots(self):
        for root in (
            PureWindowsPath(r"\\?\C:\Users\user\nofy-build"),
            PureWindowsPath(r"\\?\UNC\server\share\nofy-build"),
        ):
            with self.subTest(root=root):
                self.assert_paths_round_trip(root)

    def test_other_manifest_fields_and_unrelated_paths_are_unchanged(self):
        source = self.source + '\n[package.metadata]\npath = "../unrelated"\nnote = "keep me"\n'
        generated = M.relocate_dependency_paths(source, PureWindowsPath(r"C:\work"))
        parsed = tomllib.loads(generated)
        self.assertEqual(parsed["package"]["metadata"], {"path": "../unrelated", "note": "keep me"})
        self.assertEqual(parsed["dependencies"]["async-trait"], self.original["dependencies"]["async-trait"])

    def test_relocation_is_idempotent(self):
        for root in (PurePosixPath("/tmp/work"), PureWindowsPath(r"C:\work")):
            with self.subTest(root=root):
                generated = self.assert_paths_round_trip(root)
                self.assertEqual(M.relocate_dependency_paths(generated, root), generated)


class SourceIdentityTests(unittest.TestCase):
    def test_dirty_source_changes_identity_and_text_newlines_do_not(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            for name in ("Cargo.toml", "Cargo.lock", "rust-toolchain.toml"):
                (root / name).write_bytes(b"fixture\n")
            source = root / "crates/common/nofy-agent-runtime/src/managed.rs"
            source.parent.mkdir(parents=True)
            source.write_bytes(b"pub fn run() {}\n")
            before = M.sdk_source_hashes(root)
            source.write_bytes(b"pub fn run() {}\r\n")
            self.assertEqual(M.sdk_source_hashes(root), before)
            source.write_bytes(b"pub fn run() { panic!(); }\n")
            self.assertNotEqual(M.sdk_source_hashes(root), before)
            source.write_bytes(b"pub fn run() {}\n")
            added = source.with_name("new_module.rs")
            added.write_bytes(b"// uncommitted source\n")
            self.assertNotEqual(M.sdk_source_hashes(root), before)

class HarnessTests(unittest.TestCase):
    def setUp(self):
        self.source = (ROOT / "fixtures/agent-runtime-consumer/src/main.rs").read_text(encoding="utf-8")

    def test_only_entry_name_and_appended_wrapper_change(self):
        generated = M.generate_harness(self.source)
        self.assertEqual(generated.removesuffix(M.WRAPPER).replace(M.RENAMED, M.ENTRY), self.source)
        self.assertNotIn("#[tokio::main", generated)
        self.assertEqual(generated.count("managed_consumer_body().await"), 1)
        self.assertEqual(M.WRAPPER.count("nofy_agent_runtime::managed::run(|| async"), 1)
        self.assertIn("nofy_agent_runtime::managed::STACK_BYTES", M.WRAPPER)
        self.assertIn("impl std::process::Termination for ManagedCompletion", M.WRAPPER)
        self.assertNotIn("Runtime::", M.WRAPPER)
        self.assertNotIn("new_current_thread", M.WRAPPER)
        self.assertNotIn("std::thread::Builder", M.WRAPPER)
        self.assertNotIn(".stack_size(", M.WRAPPER)
        self.assertNotIn(".spawn(", M.WRAPPER)

    def test_missing_entry(self):
        with self.assertRaises(ValueError):
            M.generate_harness(self.source.replace(M.ENTRY, "fn changed() {"))

    def test_duplicate_entry(self):
        with self.assertRaises(ValueError):
            M.generate_harness(self.source + M.ENTRY)

    def test_changed_runtime(self):
        with self.assertRaises(ValueError):
            M.generate_harness(self.source.replace("current_thread", "multi_thread"))

    def test_preexisting_generated_symbol(self):
        with self.assertRaises(ValueError):
            M.generate_harness(self.source + "\n// managed_consumer_body")

    def test_fixture_hashes_cover_every_business_file(self):
        files = M.fixture_files(ROOT / "fixtures/agent-runtime-consumer")
        self.assertEqual(len(files), 9)
        self.assertIn("configured-system.json", files)
        self.assertIn("src/declarative_system.rs", files)


class ExecutionTests(unittest.TestCase):
    def setUp(self):
        self.report = {"status": "passed", "agents": M.AGENTS, **{field: True for field in M.FLAGS}}
        self.marker = copy.deepcopy(M.MARKER)

    def output(self):
        return json.dumps(self.report) + "\n" + json.dumps(self.marker) + "\n"

    def test_exact_business_and_completion(self):
        self.assertEqual(M.parse_execution(self.output(), ""), self.report)

    def test_missing_scenario(self):
        for field in M.FLAGS:
            with self.subTest(field=field):
                original = self.report.pop(field)
                with self.assertRaises(ValueError):
                    M.parse_execution(self.output(), "")
                self.report[field] = original

    def test_false_and_integer_booleans_rejected(self):
        for value in (False, 1, "true", None):
            self.report["recipe"] = value
            with self.subTest(value=value), self.assertRaises(ValueError):
                M.parse_execution(self.output(), "")

    def test_wrong_agents(self):
        self.report["agents"] = []
        with self.assertRaises(ValueError):
            M.parse_execution(self.output(), "")

    def test_extra_key(self):
        self.report["skipped"] = True
        with self.assertRaises(ValueError):
            M.parse_execution(self.output(), "")

    def test_missing_mode_marker(self):
        with self.assertRaises(ValueError):
            M.parse_execution(json.dumps(self.report), "")

    def test_wrong_mode(self):
        self.marker["managed_harness"] = "default"
        with self.assertRaises(ValueError):
            M.parse_execution(self.output(), "")

    def test_wrong_stack(self):
        self.marker["stack_bytes"] = 1024 * 1024
        with self.assertRaises(ValueError):
            M.parse_execution(self.output(), "")

    def test_zero_results(self):
        with self.assertRaises(ValueError):
            M.parse_execution("", "")

    def test_unknown_stdout_or_skip(self):
        with self.assertRaises(ValueError):
            M.parse_execution("SKIP workflow\n" + self.output(), "")

    def test_unexpected_stderr(self):
        with self.assertRaises(ValueError):
            M.parse_execution(self.output(), "warning: SKIPPED")

    def test_duplicate_json_key(self):
        with self.assertRaises(ValueError):
            M.strict_json('{"status":"failed","status":"passed"}')


class ProcessTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.path = Path(self.temp.name)

    def test_exit_failure_keeps_logs(self):
        stages = {}
        with patch.object(M.subprocess, "run", return_value=subprocess.CompletedProcess(
                ["consumer"], 4, "partial", "failed")), self.assertRaises(ValueError):
            M.execute(["consumer"], self.path, {}, self.path, "execution", 1, stages)
        self.assertEqual(stages["execution"]["returncode"], 4)
        self.assertEqual((self.path / "execution.stdout.log").read_text(), "partial")

    def test_timeout_keeps_partial_output_and_fails(self):
        stages = {}
        with patch.object(M.subprocess, "run", side_effect=subprocess.TimeoutExpired(
                ["consumer"], 1, output=b"partial", stderr=b"timeout")), self.assertRaises(ValueError):
            M.execute(["consumer"], self.path, {}, self.path, "execution", 1, stages)
        self.assertTrue(stages["execution"]["timeout"])
        self.assertEqual(stages["execution"]["status"], "failed")
        self.assertEqual((self.path / "execution.stdout.log").read_text(), "partial")

    def test_missing_executable_keeps_failed_stage(self):
        stages = {}
        with patch.object(M.subprocess, "run", side_effect=FileNotFoundError("missing")), self.assertRaises(OSError):
            M.execute(["consumer"], self.path, {}, self.path, "execution", 1, stages)
        self.assertEqual(stages["execution"]["status"], "failed")
        self.assertTrue((self.path / "execution.stderr.log").exists())

    def test_environment_strips_stack_and_cross_runner_settings(self):
        source = {"PATH": "/bin", "RUST_MIN_STACK": "999", "RUSTFLAGS": "flags",
                  "CARGO_BUILD_TARGET": "foreign", "CARGO_TARGET_X_RUNNER": "runner",
                  "CARGO_TARGET_X_RUSTFLAGS": "flags", "TOKEN": "never recorded"}
        with patch.dict(M.os.environ, source, clear=True):
            env, removed = M.clean_environment()
        self.assertEqual(set(removed), set(source) - {"PATH", "TOKEN"})
        self.assertEqual(env["CARGO_BUILD_JOBS"], "2")
        self.assertNotIn("never recorded", removed)

    def test_failed_collection_writes_failed_result(self):
        args = argparse.Namespace(output=self.path / "evidence", runner="windows-latest")
        with patch.object(M.platform, "system", return_value="Linux"), self.assertRaises(ValueError):
            M.collect(args)
        report = json.loads((args.output / "result.json").read_text())
        self.assertEqual(report["status"], "failed")
        self.assertEqual(report["inventory"], [])

    def test_existing_output_is_never_reused(self):
        args = argparse.Namespace(output=self.path, runner="ubuntu-24.04")
        with self.assertRaises(FileExistsError):
            M.collect(args)

    def test_empty_and_forbidden_dependency_trees(self):
        for tree in ("", "nofy-opt-in-managed-consumer v1\n",
                     "nofy-opt-in-managed-consumer v1\nnofy-agent-runtime v1\nnofy-agent-host v1"):
            with self.subTest(tree=tree), self.assertRaises(ValueError):
                M.dependency_boundary(tree)


class ArtifactTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.parent = Path(self.temp.name)
        self.path = self.parent / "linux"
        self.path.mkdir()
        self.report = self.make_artifact(self.path)

    def make_artifact(self, directory):
        source = (ROOT / "fixtures/agent-runtime-consumer/src/main.rs").read_text(encoding="utf-8")
        generated = M.generate_harness(source)
        hashes = {name: M.digest(data) for name, data in M.fixture_files(
            ROOT / "fixtures/agent-runtime-consumer").items()}
        for name in hashes:
            raw = (ROOT / "fixtures/agent-runtime-consumer" / name).read_bytes()
            saved = directory / "fixture-source" / name
            saved.parent.mkdir(parents=True, exist_ok=True)
            saved.write_bytes(raw)
        (directory / "original-main.rs").write_text(source, encoding="utf-8")
        (directory / "managed-main.rs").write_text(generated, encoding="utf-8")
        diff = "".join(M.difflib.unified_diff(source.splitlines(True), generated.splitlines(True),
                      fromfile="original/src/main.rs", tofile="managed/src/main.rs"))
        (directory / "managed-harness.diff").write_text(diff, encoding="utf-8")
        M.write_json(directory / "fixture-sha256.json", hashes)
        metadata = {"packages": [{"id": "runtime", "name": "nofy-agent-runtime", "version": "0.1.0"},
                                  {"id": "tokio", "name": "tokio", "version": "1.53.1"}],
                    "resolve": {"root": "consumer", "nodes": [{"id": "runtime", "features":
                        ["default", "pack", "workflow", "control-file"]}]}}
        business = {"status": "passed", "agents": M.AGENTS, **{name: True for name in M.FLAGS}}
        rustc = "rustc 1.94.0\nrelease: 1.94.0\nhost: x86_64-unknown-linux-gnu\n"
        report = {"schema": 1, "status": "passed", "mode": M.MODE, "runner": "ubuntu-24.04",
                  "system": "Linux", "source_root": "/source", "stack_bytes": M.STACK_BYTES, "runtime": "current_thread",
                  "inventory": M.INVENTORY, "outside_workspace": True, "dependency_boundary": "passed",
                  "fixture_sha256": hashes, "fixture_raw_sha256": {name: M.digest(
                      (ROOT / "fixtures/agent-runtime-consumer" / name).read_bytes()) for name in hashes},
                  "sdk_source_sha256": M.sdk_source_hashes(),
                  "cargo_home_configuration": "absent", "generated_sha256": M.digest(generated.encode()),
                  "business_result": business, "declared_features": ["pack", "workflow", "control-file"],
                  "resolved_runtime_features": ["control-file", "default", "pack", "workflow"],
                  "rustc": rustc, "cargo": "cargo 1.94.0", "host": "x86_64-unknown-linux-gnu",
                  "toolchain_file_sha256": M.digest((ROOT / "rust-toolchain.toml").read_bytes().replace(b"\r\n", b"\n")),
                  "stages": {}}
        for name in ("rustc", "cargo", "metadata", "dependencies", "build", "execution"):
            report["stages"][name] = {"status": "passed", "returncode": 0, "timeout": False,
                                      "command": ["test"]}
            (directory / (name + ".stdout.log")).write_text("", encoding="utf-8")
            (directory / (name + ".stderr.log")).write_text("", encoding="utf-8")
        (directory / "metadata.stdout.log").write_text(json.dumps(metadata), encoding="utf-8")
        (directory / "execution.stdout.log").write_text(
            json.dumps(business) + "\n" + json.dumps(M.MARKER) + "\n", encoding="utf-8")
        (directory / "rustc.stdout.log").write_text(rustc, encoding="utf-8")
        (directory / "dependencies.stdout.log").write_text(
            "nofy-opt-in-managed-consumer v1\nnofy-agent-runtime v1\n", encoding="utf-8")
        artifact = {"reason": "compiler-artifact", "package_id": "consumer",
                    "executable": "/temporary/target/nofy-opt-in-managed-consumer",
                    "target": {"name": M.PACKAGE, "kind": ["bin"]},
                    "profile": {"test": False}, "fresh": False}
        report["binary"] = {"sha256": "a" * 64, "artifact": artifact}
        report["stages"]["build"]["command"] = ["cargo", "build", "--offline", "--locked",
            "--target", report["host"], "--jobs", "2", "--message-format=json"]
        report["stages"]["execution"]["command"] = [artifact["executable"]]
        (directory / "build.stdout.log").write_text(json.dumps(artifact) + "\n"
            + json.dumps({"reason": "build-finished", "success": True}) + "\n", encoding="utf-8")
        (directory / "cargo.stdout.log").write_text(report["cargo"] + "\n", encoding="utf-8")
        original_manifest = (ROOT / "fixtures/agent-runtime-consumer/Cargo.toml").read_text(encoding="utf-8")
        generated_manifest = original_manifest.replace("../../crates/", "/source/crates/").replace(
            'name = "nofy-independent-consumer"', 'name = "' + M.PACKAGE + '"')
        (directory / "generated-Cargo.toml").write_text(generated_manifest, encoding="utf-8")
        (directory / "managed-manifest.diff").write_text("".join(M.difflib.unified_diff(
            original_manifest.splitlines(True), generated_manifest.splitlines(True),
            fromfile="original/Cargo.toml", tofile="managed/Cargo.toml")), encoding="utf-8")
        (directory / "Cargo.lock").write_bytes(b"test lock")
        report["lockfile_sha256"] = M.digest(b"test lock")
        report["resolved_key_versions"] = {"nofy-agent-runtime": ["0.1.0"], "tokio": ["1.53.1"]}
        M.write_json(directory / "result.json", report)
        return report

    def save(self):
        M.write_json(self.path / "result.json", self.report)

    def test_valid_artifact(self):
        self.assertEqual(M.validate_artifact(self.path)["status"], "passed")

    def test_mutated_result_fields(self):
        for field, value in (("mode", "default"), ("status", "failed"),
                             ("inventory", []), ("stack_bytes", 1),
                             ("outside_workspace", False), ("system", "Windows"),
                             ("declared_features", ["sqlite"])):
            original = self.report[field]
            with self.subTest(field=field):
                self.report[field] = value
                self.save()
                with self.assertRaises(ValueError):
                    M.validate_artifact(self.path)
                self.report[field] = original

    def test_missing_failed_timed_out_or_empty_stages(self):
        original = copy.deepcopy(self.report["stages"])
        for change in ("missing", "failed", "timeout", "empty", "integer_bool"):
            self.report["stages"] = copy.deepcopy(original)
            stage = self.report["stages"]["execution"]
            if change == "missing":
                del self.report["stages"]["execution"]
            elif change == "failed":
                stage["returncode"] = 5
            elif change == "timeout":
                stage["timeout"] = True
            elif change == "empty":
                stage["command"] = []
            else:
                stage["returncode"] = False
            self.save()
            with self.subTest(change=change), self.assertRaises(ValueError):
                M.validate_artifact(self.path)

    def test_missing_or_false_build_completion(self):
        for text in ("", '{"reason":"build-finished","success":false}'):
            (self.path / "build.stdout.log").write_text(text, encoding="utf-8")
            with self.subTest(text=text), self.assertRaises(ValueError):
                M.validate_artifact(self.path)

    def test_fresh_or_wrong_binary_or_test_artifact(self):
        original = self.report["binary"]["artifact"]
        for field, value in (("fresh", True), ("package_id", "wrong"),
                             ("profile", {"test": True}), ("target", {"name": "default", "kind": ["bin"]})):
            artifact = copy.deepcopy(original)
            artifact[field] = value
            (self.path / "build.stdout.log").write_text(json.dumps(artifact) + "\n"
                + '{"reason":"build-finished","success":true}\n', encoding="utf-8")
            with self.subTest(field=field), self.assertRaises(ValueError):
                M.validate_artifact(self.path)

    def test_execution_command_is_wrong_binary(self):
        self.report["stages"]["execution"]["command"] = ["unrelated"]
        self.save()
        with self.assertRaises(ValueError):
            M.validate_artifact(self.path)

    def test_generated_manifest_drift(self):
        with (self.path / "generated-Cargo.toml").open("a") as file:
            file.write('\n[profile.dev]\nopt-level = 3\n')
        with self.assertRaises(ValueError):
            M.validate_artifact(self.path)

    def test_raw_fixture_drift(self):
        with (self.path / "fixture-source/src/configured_event.rs").open("a") as file:
            file.write("// changed business")
        with self.assertRaises(ValueError):
            M.validate_artifact(self.path)

    def test_missing_execution_log(self):
        (self.path / "execution.stdout.log").unlink()
        with self.assertRaises((ValueError, OSError)):
            M.validate_artifact(self.path)

    def test_harness_drift(self):
        with (self.path / "managed-main.rs").open("a") as file:
            file.write("// drift")
        with self.assertRaises(ValueError):
            M.validate_artifact(self.path)

    def test_sdk_source_drift_is_rejected(self):
        self.report["sdk_source_sha256"]["crates/common/nofy-agent-runtime/src/managed.rs"] = "0" * 64
        self.save()
        with self.assertRaisesRegex(ValueError, "SDK source"):
            M.validate_artifact(self.path)

    def test_missing_sdk_source_identity_is_rejected(self):
        del self.report["sdk_source_sha256"]
        self.save()
        with self.assertRaises(KeyError):
            M.validate_artifact(self.path)

    def test_source_hash_drift(self):
        self.report["fixture_sha256"]["src/configured_event.rs"] = "wrong"
        self.save()
        with self.assertRaises(ValueError):
            M.validate_artifact(self.path)

    def test_compiler_not_native(self):
        self.report["host"] = "aarch64-apple-darwin"
        self.save()
        with self.assertRaises(ValueError):
            M.validate_artifact(self.path)

    def test_missing_platforms(self):
        with self.assertRaises(ValueError):
            M.compare(self.parent)

    def test_duplicate_platforms(self):
        import shutil
        shutil.copytree(self.path, self.parent / "second")
        shutil.copytree(self.path, self.parent / "third")
        with self.assertRaises(ValueError):
            M.compare(self.parent)

    def test_three_platform_positive_is_only_synthetic_validator_test(self):
        import shutil
        for runner, system, host in (
                ("macos-latest", "Darwin", "aarch64-apple-darwin"),
                ("windows-latest", "Windows", "x86_64-pc-windows-msvc")):
            dest = self.parent / system
            shutil.copytree(self.path, dest)
            report = copy.deepcopy(self.report)
            report.update(runner=runner, system=system, host=host)
            report["rustc"] = report["rustc"].replace("x86_64-unknown-linux-gnu", host)
            report["stages"]["build"]["command"][5] = host
            if system == "Windows":
                # Use a real Windows path spelling, with TOML escaping.
                report["source_root"] = "C:/source"
                original = (ROOT / "fixtures/agent-runtime-consumer/Cargo.toml").read_text(encoding="utf-8")
                manifest = original.replace('name = "nofy-independent-consumer"',
                                            'name = "' + M.PACKAGE + '"')
                import re
                manifest = re.sub(r'"(../../crates/[^"]+)"',
                    lambda match: json.dumps(str(M.PureWindowsPath("C:/source").joinpath(
                        *M.PurePosixPath(match[1]).parts[2:]))), manifest)
                (dest / "generated-Cargo.toml").write_text(manifest, encoding="utf-8")
                (dest / "managed-manifest.diff").write_text("".join(M.difflib.unified_diff(
                    original.splitlines(True), manifest.splitlines(True),
                    fromfile="original/Cargo.toml", tofile="managed/Cargo.toml")), encoding="utf-8")
            M.write_json(dest / "result.json", report)
            (dest / "rustc.stdout.log").write_text(report["rustc"], encoding="utf-8")
        with redirect_stdout(io.StringIO()):
            M.compare(self.parent)
        # Internally valid per-platform evidence with a different resolved Tokio
        # version must fail the cross-platform parity check, not masquerade as
        # another native execution.
        other = self.parent / "Darwin"
        report = json.loads((other / "result.json").read_text(encoding="utf-8"))
        metadata = json.loads((other / "metadata.stdout.log").read_text(encoding="utf-8"))
        metadata["packages"][1]["version"] = "1.53.2"
        report["resolved_key_versions"]["tokio"] = ["1.53.2"]
        M.write_json(other / "metadata.stdout.log", metadata)
        M.write_json(other / "result.json", report)
        with self.assertRaisesRegex(ValueError, "platform parity drift"):
            M.compare(self.parent)
        metadata["packages"][1]["version"] = "1.53.1"
        report["resolved_key_versions"]["tokio"] = ["1.53.1"]
        metadata["resolve"]["nodes"][0]["features"].append("sqlite")
        report["resolved_runtime_features"].append("sqlite")
        M.write_json(other / "metadata.stdout.log", metadata)
        M.write_json(other / "result.json", report)
        with self.assertRaisesRegex(ValueError, "runtime features"):
            M.compare(self.parent)

    def test_zero_artifacts(self):
        with tempfile.TemporaryDirectory() as empty, self.assertRaises(ValueError):
            M.compare(Path(empty))


if __name__ == "__main__":
    unittest.main()
