"""Small synthetic harness fixtures, not a snapshot or replacement for real tests."""
import contextlib
import importlib.util
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

SPEC = importlib.util.spec_from_file_location(
    "shared_kernel", Path(__file__).with_name("verify-shared-kernel.py"))
GATE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(GATE)


def fixture(windows=False):
    inventory, execution = [], []
    for target in GATE.TARGETS:
        names = [f"{target}_contract"]
        if target == "program":
            names.extend(sorted(GATE.HELPERS))
        separator, suffix = ("\\", ".exe") if windows else ("/", "")
        header = f"     Running tests{separator}{target}.rs (target/debug/deps/{target}-123{suffix})"
        inventory.extend([header, *[f"{name}: test" for name in names],
                          f"{len(names)} tests, 0 benchmarks"])
        execution.extend([header, f"running {len(names)} tests",
                          *[f"test {name} ... ok" for name in names],
                          f"test result: ok. {len(names)} passed; 0 failed; 0 ignored; "
                          "0 measured; 0 filtered out; finished in 0.01s"])
    return "\n".join(inventory) + "\n", "\n".join(execution) + "\n"


class SharedKernelEvidenceTests(unittest.TestCase):
    def setUp(self):
        self.inventory, self.execution = fixture()

    def verify(self, inventory=None, execution=None, skips="", **statuses):
        return GATE.parse_shared_kernel_evidence(
            self.inventory if inventory is None else inventory,
            self.execution if execution is None else execution, skips, **statuses)

    def test_valid_evidence_counts_helpers_separately(self):
        result = self.verify()
        self.assertEqual(result["totals"]["executed"], 7)
        self.assertEqual(result["totals"]["helpers"], 2)
        self.assertEqual(result["totals"]["acceptance_checks"], 5)
        for key in ("failed", "ignored", "filtered", "reported_skips"):
            self.assertEqual(result["totals"][key], 0)

    def test_stdout_only_inventory_matches_exact_sets_without_order_assumption(self):
        groups = self.inventory.split("     Running ")[1:]
        stdout_only = "\n".join(group.split("\n", 1)[1] for group in reversed(groups))
        self.assertEqual(self.verify(stdout_only), self.verify())

    def test_windows_headers_crlf_and_ansi(self):
        inventory, execution = fixture(windows=True)
        self.verify(inventory.replace("\n", "\r\n"),
                    execution.replace("Running", "\x1b[1mRunning\x1b[0m"))

    def test_empty_and_truncated_output_rejected(self):
        for inventory, execution in (("", self.execution), (self.inventory, ""),
                                     (self.inventory.rsplit("\n", 2)[0], self.execution),
                                     (self.inventory, self.execution.rsplit("\n", 2)[0])):
            with self.subTest(inventory=bool(inventory), execution=bool(execution)):
                with self.assertRaises(ValueError):
                    self.verify(inventory, execution)

    def test_missing_or_unknown_target_rejected(self):
        for target in ("missing", "program"):
            with self.subTest(target=target), self.assertRaises(ValueError):
                self.verify(execution=self.execution.replace("tests/pack.rs", f"tests/{target}.rs"))

    def test_missing_inventory_target_rejected(self):
        with self.assertRaises(ValueError):
            self.verify(inventory=self.inventory.split("     Running tests/pack.rs")[0])

    def test_duplicate_inventory_and_execution_entries_rejected(self):
        for kind, needle in (("inventory", "pack_contract: test\n"),
                             ("execution", "test pack_contract ... ok\n")):
            text = getattr(self, kind).replace(needle, needle * 2)
            with self.subTest(kind=kind), self.assertRaises(ValueError):
                self.verify(**{kind: text})

    def test_duplicate_inventory_group_rejected(self):
        groups = self.inventory.split("     Running ")[1:]
        groups[-1] = groups[-2]
        with self.assertRaises(ValueError):
            self.verify(inventory="".join("     Running " + group for group in groups))

    def test_nonzero_failure_ignored_filtered_measured_rejected(self):
        for status in ("failed", "ignored", "filtered out", "measured"):
            with self.subTest(status=status), self.assertRaises(ValueError):
                self.verify(execution=self.execution.replace(f"0 {status}", f"1 {status}", 1))

    def test_bad_per_test_status_and_missing_executed_test_rejected(self):
        for replacement in ("test pack_contract ... ignored",
                            "test pack_contract ... FAILED", ""):
            with self.subTest(replacement=replacement), self.assertRaises(ValueError):
                self.verify(execution=self.execution.replace("test pack_contract ... ok", replacement))

    def test_skip_report_and_skip_output_rejected(self):
        for kwargs in ({"skips": "SKIPPED capability\n"},
                       {"execution": self.execution + "SKIPPED capability\n"}):
            with self.subTest(kwargs=kwargs), self.assertRaises(ValueError):
                self.verify(**kwargs)

    def test_unknown_output_and_bad_summary_rejected(self):
        for kwargs in ({"inventory": self.inventory + "unexpected output\n"},
                       {"execution": self.execution + "unexpected output\n"},
                       {"inventory": self.inventory.replace("1 tests", "0 tests", 1)},
                       {"execution": self.execution.replace("running 1 tests", "running 0 tests", 1)}):
            with self.subTest(kwargs=kwargs), self.assertRaises(ValueError):
                self.verify(**kwargs)

    def test_inventory_execution_name_mismatch_and_wrong_label_rejected(self):
        for replacement in (self.inventory.replace("pack_contract:", "other_contract:"),
                            self.inventory.replace("tests/pack.rs", "tests/program.rs")):
            with self.subTest(replacement=replacement), self.assertRaises(ValueError):
                self.verify(inventory=replacement)

    def test_missing_helpers_rejected(self):
        with self.assertRaises(ValueError):
            self.verify(self.inventory.replace("graphs::program_process_worker", "new_helper"),
                        self.execution.replace("graphs::program_process_worker", "new_helper"))

    def test_nonzero_exit_status_rejected(self):
        for status in ("list_status", "run_status"):
            with self.subTest(status=status), self.assertRaises(ValueError):
                self.verify(**{status: 1})

    def write_artifact(self, root, system):
        directory = root / system
        directory.mkdir()
        for name, content in (("test-list.txt", self.inventory),
                              ("test-run.log", self.execution), ("skips.log", "")):
            (directory / name).write_text(content, encoding="utf-8")
        (directory / "exit-codes.json").write_text(json.dumps({
            "runner": next(key for key, pair in GATE.RUNNERS.items() if pair[0] == system),
            "system": system,
            "sys_platform": next(pair[1] for pair in GATE.RUNNERS.values() if pair[0] == system),
            "list": 0, "run": 0, "command": GATE.COMMAND,
        }), encoding="utf-8")
        return directory

    def test_three_platform_comparison_and_reject_mismatch_or_missing(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            for system in sorted(GATE.SYSTEMS):
                directory = self.write_artifact(root, system)
            with contextlib.redirect_stdout(io.StringIO()):
                GATE.compare_evidence(root)
            for name in ("test-list.txt", "test-run.log"):
                path = directory / name
                path.write_text(path.read_text().replace("pack_contract", "platform_variant"))
            with self.assertRaisesRegex(ValueError, "differ"):
                GATE.compare_evidence(root)
            (directory / "exit-codes.json").unlink()
            with self.assertRaisesRegex(ValueError, "need Linux"):
                GATE.compare_evidence(root)

    def test_missing_raw_artifact_rejected(self):
        with tempfile.TemporaryDirectory() as temporary:
            directory = self.write_artifact(Path(temporary), "Linux")
            (directory / "skips.log").unlink()
            with self.assertRaises(OSError):
                GATE.load_evidence(directory)

    def test_runner_label_platform_command_and_status_metadata_rejected(self):
        changes = (
            {"runner": "windows-latest"}, {"system": "Windows"}, {"sys_platform": "win32"},
            {"runner": "unknown"}, {"command": ["cargo", "test"]}, {"run": True}, {"list": 1},
        )
        for change in changes:
            with self.subTest(change=change), tempfile.TemporaryDirectory() as temporary:
                directory = self.write_artifact(Path(temporary), "Linux")
                path = directory / "exit-codes.json"
                metadata = json.loads(path.read_text()) | change
                path.write_text(json.dumps(metadata))
                with self.assertRaises(ValueError):
                    GATE.load_evidence(directory)

    def test_duplicate_platform_artifact_rejected(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            directory = self.write_artifact(root, "Linux")
            directory.rename(root / "duplicate")
            self.write_artifact(root, "Linux")
            with self.assertRaisesRegex(ValueError, "duplicate platform"):
                GATE.compare_evidence(root)

    def test_collection_refuses_wrong_native_runner_before_running_cargo(self):
        with tempfile.TemporaryDirectory() as temporary, patch.object(
                GATE.platform, "system", return_value="Linux"), patch.object(
                GATE.sys, "platform", "linux"), patch.object(GATE.subprocess, "run") as run:
            with self.assertRaisesRegex(ValueError, "native platform"):
                GATE.collect_evidence(Path(temporary) / "evidence", "windows-latest")
            run.assert_not_called()

    def test_collection_records_exact_commands_and_failures_without_real_cargo(self):
        for return_code in (0, 1):
            with self.subTest(return_code=return_code), tempfile.TemporaryDirectory() as temporary:
                directory = Path(temporary) / "evidence"
                calls = []

                def fake_run(command, **kwargs):
                    calls.append(command)
                    self.assertEqual(kwargs["env"]["CARGO_TERM_COLOR"], "never")
                    self.assertEqual(kwargs["env"]["NOFY_SKIP_REPORT"],
                                     str((directory / "skips.log").resolve()))
                    kwargs["stdout"].write(self.inventory if "--list" in command else self.execution)
                    return type("Result", (), {"returncode": return_code})()

                with patch.object(GATE.subprocess, "run", side_effect=fake_run), patch.object(
                        GATE.platform, "system", return_value="Linux"), patch.object(
                        GATE.sys, "platform", "linux"), contextlib.redirect_stdout(io.StringIO()):
                    if return_code:
                        with self.assertRaisesRegex(ValueError, "Cargo failed"):
                            GATE.collect_evidence(directory, "ubuntu-24.04")
                    else:
                        GATE.collect_evidence(directory, "ubuntu-24.04")
                self.assertEqual(calls, [
                    GATE.COMMAND + ["--", "--list", "--color", "never"],
                    GATE.COMMAND + ["--", "--color", "never", "--test-threads=2"],
                ])
                self.assertTrue((directory / "test-list.txt").is_file())
                self.assertTrue((directory / "test-run.log").is_file())
                metadata = json.loads((directory / "exit-codes.json").read_text())
                self.assertEqual(metadata["run"], return_code)
                self.assertEqual((directory / "evidence.json").exists(), return_code == 0)


if __name__ == "__main__":
    unittest.main()
