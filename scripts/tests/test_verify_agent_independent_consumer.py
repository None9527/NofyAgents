"""Pure Python tests; Cargo is mocked and native Windows paths are not required."""
from contextlib import redirect_stdout
import copy
import importlib.util
import io
import json
from pathlib import Path, PurePosixPath, PureWindowsPath
import subprocess
import tempfile
import tomllib
import unittest
from unittest.mock import patch


ROOT = Path(__file__).resolve().parents[2]
SPEC = importlib.util.spec_from_file_location(
    "verify_agent_independent_consumer",
    ROOT / "scripts/verify-agent-independent-consumer.py",
)
VERIFIER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(VERIFIER)


class ManifestPathTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source = (ROOT / "fixtures/agent-runtime-consumer/Cargo.toml").read_text(
            encoding="utf-8"
        )
        cls.original = tomllib.loads(cls.source)

    def assert_paths_round_trip(self, root):
        generated = VERIFIER.relocate_dependency_paths(self.source, root)
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
        generated = VERIFIER.relocate_dependency_paths(source, PureWindowsPath(r"C:\work"))
        parsed = tomllib.loads(generated)
        self.assertEqual(parsed["package"]["metadata"], {"path": "../unrelated", "note": "keep me"})
        self.assertEqual(parsed["dependencies"]["async-trait"], self.original["dependencies"]["async-trait"])

    def test_relocation_is_idempotent(self):
        for root in (PurePosixPath("/tmp/work"), PureWindowsPath(r"C:\work")):
            with self.subTest(root=root):
                generated = self.assert_paths_round_trip(root)
                self.assertEqual(VERIFIER.relocate_dependency_paths(generated, root), generated)


class MainUtf8Tests(unittest.TestCase):
    def setUp(self):
        directory = tempfile.TemporaryDirectory(prefix="nofy-consumer-python-test-")
        self.addCleanup(directory.cleanup)
        temporary = Path(directory.name).resolve()
        self.root = temporary / "\u7528\u6237 \U0001f680 repository"
        self.output = temporary / "\u62a5\u544a \U0001f680 output"
        fixture = self.root / "fixtures/agent-runtime-consumer"
        (fixture / "src").mkdir(parents=True)
        self.source = (ROOT / "fixtures/agent-runtime-consumer/Cargo.toml").read_text(
            encoding="utf-8"
        )
        (fixture / "Cargo.toml").write_text(self.source, encoding="utf-8")
        (fixture / "src/main.rs").write_text("// fixture copy sentinel\n", encoding="utf-8")
        (fixture / "target").mkdir()
        (fixture / "target/ignored").write_text("must not copy", encoding="utf-8")
        (fixture / "Cargo.lock").write_text("must not copy", encoding="utf-8")
        self.toolchain = (ROOT / "rust-toolchain.toml").read_bytes()
        (self.root / "rust-toolchain.toml").write_bytes(self.toolchain)
        self.report = {"status": "passed", "unicode_detail": "\u8def\u5f84\U0001f680"}
        for field in (
            "configuration", "recipe", "workflow", "workflow_module", "workflow_hook",
            "program", "event_program", "declarative_system", "file_catalog",
        ):
            self.report[field] = True
        self.stderr = "diagnostic \u8def\u5f84\U0001f680\n"
        self.dependencies = f"nofy-agent-runtime v0.1.0 ({self.root}/crates/common/nofy-agent-runtime)\n"
        self.calls = []
        self.writes = []
        self.printed = io.StringIO()

    def run_main(self, *, returncode=0, forbidden_dependency=False):
        self.stdout = "consumer \u8def\u5f84\U0001f680\n" + json.dumps(
            self.report, ensure_ascii=False
        ) + "\n"
        if forbidden_dependency:
            self.dependencies += "nofy-shell v0.1.0\n"

        def fake_run(command, **kwargs):
            self.calls.append(command)
            self.assertEqual(kwargs["encoding"], "utf-8")
            self.assertIs(kwargs["text"], True)
            self.assertIs(kwargs["capture_output"], True)
            manifest = Path(command[command.index("--manifest-path") + 1])
            consumer = manifest.parent.resolve()
            self.assertEqual(Path(kwargs["cwd"]).resolve(), consumer)
            self.assertFalse(consumer.is_relative_to(self.root))
            self.assertEqual(kwargs["env"]["CARGO_TARGET_DIR"], str(self.root / "target"))
            parsed = tomllib.loads(manifest.read_bytes().decode("utf-8"))
            expected = tomllib.loads(self.source)
            for dependency in expected["dependencies"].values():
                if isinstance(dependency, dict) and "path" in dependency:
                    parts = PurePosixPath(dependency["path"]).parts[2:]
                    dependency["path"] = str(self.root.joinpath(*parts))
            self.assertEqual(parsed, expected)
            self.assertEqual((consumer / "rust-toolchain.toml").read_bytes(), self.toolchain)
            self.assertTrue((consumer / "src/main.rs").is_file())
            self.assertFalse((consumer / "target").exists())
            self.assertFalse((consumer / "Cargo.lock").exists())
            if command[1] == "run":
                self.assertEqual(command, ["cargo", "run", "--offline", "--manifest-path", str(manifest)])
                return subprocess.CompletedProcess(command, returncode, self.stdout, self.stderr)
            self.assertEqual(command, ["cargo", "tree", "--offline", "--manifest-path", str(manifest),
                                       "--edges", "normal", "--prefix", "none"])
            self.assertIs(kwargs["check"], True)
            return subprocess.CompletedProcess(command, 0, self.dependencies, "")

        write_text = Path.write_text

        def utf8_write(path, data, *args, **kwargs):
            self.assertEqual(kwargs.get("encoding"), "utf-8")
            self.writes.append(path.name)
            return write_text(path, data, *args, **kwargs)

        with (
            patch.object(VERIFIER, "__file__", str(self.root / "scripts/verify-agent-independent-consumer.py")),
            patch("sys.argv", ["verify-agent-independent-consumer.py", "--output", str(self.output)]),
            patch.object(VERIFIER.subprocess, "run", side_effect=fake_run),
            patch.object(Path, "write_text", autospec=True, side_effect=utf8_write),
            redirect_stdout(self.printed),
        ):
            VERIFIER.main()

    def assert_utf8_output(self, name, expected):
        # Windows text files use CRLF; normalize only that platform newline.
        decoded = (self.output / name).read_bytes().decode("utf-8").replace("\r\n", "\n")
        self.assertEqual(decoded, expected)

    def test_main_preserves_unicode_manifest_logs_and_report(self):
        self.run_main()
        self.assertEqual(len(self.calls), 2)
        self.assertEqual(self.writes, ["Cargo.toml", "stdout.log", "stderr.log", "dependencies.txt", "result.json"])
        self.assert_utf8_output("stdout.log", self.stdout)
        self.assert_utf8_output("stderr.log", self.stderr)
        self.assert_utf8_output("dependencies.txt", self.dependencies)
        expected = dict(self.report, outside_workspace=True, dependency_boundary="passed")
        result = (self.output / "result.json").read_bytes().decode("utf-8")
        self.assertEqual(json.loads(result), expected)
        self.assertEqual(json.loads(self.printed.getvalue()), expected)

    def test_main_accepts_equivalent_temporary_path_spelling(self):
        # A real '..' alias exercises raw versus resolved names on every OS,
        # without requiring Windows 8.3 support or symlink privileges.
        with tempfile.TemporaryDirectory(prefix="nofy-consumer-path-alias-") as directory:
            directory = Path(directory)
            (directory / "existing").mkdir()
            alias = directory / "existing" / ".."
            self.assertNotEqual(alias, alias.resolve())
            with patch.object(VERIFIER.tempfile, "TemporaryDirectory") as temporary:
                temporary.return_value.__enter__.return_value = str(alias)
                self.run_main()
                temporary.assert_called_once_with(prefix="nofy-independent-consumer-")
            self.assertEqual(len(self.calls), 2)
            self.assertTrue((self.output / "result.json").is_file())

    def test_failed_consumer_preserves_unicode_logs(self):
        with self.assertRaisesRegex(SystemExit, "consumer failed; inspect"):
            self.run_main(returncode=1)
        self.assertEqual(len(self.calls), 1)
        self.assert_utf8_output("stdout.log", self.stdout)
        self.assert_utf8_output("stderr.log", self.stderr)
        self.assertFalse((self.output / "result.json").exists())

    def test_required_behavior_assertions_still_reject_failure(self):
        for field in self.report:
            if field == "unicode_detail":
                continue
            with self.subTest(field=field):
                original = self.report[field]
                self.report[field] = "failed" if field == "status" else False
                with self.assertRaises(AssertionError):
                    self.run_main()
                self.assertFalse((self.output / "result.json").exists())
                self.report[field] = original
        self.assertTrue(all(command[1] == "run" for command in self.calls))

    def test_forbidden_dependencies_still_reject_consumer(self):
        with self.assertRaisesRegex(AssertionError, "nofy-shell"):
            self.run_main(forbidden_dependency=True)
        self.assertEqual(len(self.calls), 2)
        self.assert_utf8_output("dependencies.txt", self.dependencies)
        self.assertFalse((self.output / "result.json").exists())


if __name__ == "__main__":
    unittest.main()
