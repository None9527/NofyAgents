"""Collector tests. Synthetic PE/build results are NOT native Windows evidence."""
import argparse
import importlib.util
import json
import os
from pathlib import Path, PureWindowsPath
import struct
import sys
import tempfile
import unittest
from unittest.mock import patch

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("diagnostic", HERE.parent / "diagnose-windows-stack.py")
d = importlib.util.module_from_spec(spec)
spec.loader.exec_module(d)
REFERENCE = HERE.parents[1]


def synthetic_pe(plus=True, reserve=1048576, commit=4096):
    data = bytearray(512)
    data[:2] = b"MZ"
    struct.pack_into("<I", data, 0x3C, 0x80)
    data[0x80:0x84] = b"PE\0\0"
    struct.pack_into("<H", data, 0x84, 0x8664 if plus else 0x14C)
    struct.pack_into("<H", data, 0x94, 240 if plus else 224)
    struct.pack_into("<H", data, 0x98, 0x20B if plus else 0x10B)
    struct.pack_into("<QQ" if plus else "<II", data, 0x98 + 72, reserve, commit)
    return bytes(data)


class DiagnosticTests(unittest.TestCase):
    def test_collector_anchors_match_reference_blobs(self):
        for path, sha in d.ANCHORS.items():
            self.assertEqual(d.blob_sha((REFERENCE / path).read_bytes().replace(b"\r\n", b"\n")), sha, path)

    def test_entire_original_body_unchanged_except_entry_name(self):
        source = (REFERENCE / d.FIXTURE / "src/main.rs").read_bytes().replace(b"\r\n", b"\n")
        generated = d.generate(source)
        self.assertEqual(generated[:-len(d.WRAPPER)].replace(d.RENAMED, d.ENTRY, 1), source)
        self.assertEqual(generated.count(b'#[tokio::main(flavor = "current_thread")]'), 1)
        self.assertEqual(d.WRAPPER.count(b".spawn(entry)"), 1)
        self.assertEqual(d.WRAPPER.count(b"let entry = ||"), 1)
        self.assertEqual(d.WRAPPER.count(b"diagnostic_consumer_body()"), 1)
        self.assertIn(b"return entry();", d.WRAPPER)
        self.assertNotIn(b"Runtime::", d.WRAPPER)
        self.assertNotIn(b"Box::", d.WRAPPER)

    def test_source_drift_rejected(self):
        for source in (b"", d.ENTRY * 2, d.ENTRY + b"diagnostic_consumer_body", d.ENTRY.replace(b"current_thread", b"multi_thread")):
            with self.subTest(source=source), self.assertRaises(ValueError):
                d.generate(source)

    def test_path_relocation_matches_existing_helper(self):
        source = (REFERENCE / d.FIXTURE / "Cargo.toml").read_text()
        # Load reference helper code without importing into/writing to its directory.
        namespace = {"__name__": "not_main"}
        exec(compile((REFERENCE / "scripts/verify-agent-independent-consumer.py").read_text(), "reference-helper", "exec"), namespace)
        for root in (Path("/tmp/a path/源"), PureWindowsPath('C:\\a path\\源')):
            self.assertEqual(d.relocate(source, root), namespace["relocate_dependency_paths"](source, root))

    def test_pe32_and_pe32_plus(self):
        for plus in (True, False):
            result = d.pe_stack(synthetic_pe(plus, 16777216, 8192))
            self.assertEqual(result["size_of_stack_reserve"], 16777216)
            self.assertEqual(result["size_of_stack_commit"], 8192)

    def test_pe_rejects_malformed_images(self):
        valid = synthetic_pe()
        for data in (b"", b"MZ", valid[:63], valid[:150], valid[:200], valid.replace(b"PE\0\0", b"NOPE", 1)):
            with self.subTest(size=len(data)), self.assertRaises(ValueError):
                d.pe_stack(data)
        data = bytearray(valid)
        struct.pack_into("<H", data, 0x98, 0x999)
        with self.assertRaises(ValueError):
            d.pe_stack(data)

    def test_environment_rejects_inherited_stack_profile_and_wrapper_overrides(self):
        inherited = {"RUST_MIN_STACK": "3", "RUSTFLAGS": "-C link-arg=/STACK:16777216",
                     "CARGO_ENCODED_RUSTFLAGS": "override", "CARGO_PROFILE_DEV_OPT_LEVEL": "3",
                     "CARGO_TARGET_X86_64_PC_WINDOWS_MSVC_RUNNER": "wine", "RUSTC_WRAPPER": "wrapper",
                     "RUSTUP_TOOLCHAIN": "nightly", "CL": "override", "PATH": "retained"}
        with patch.dict(os.environ, inherited, clear=True):
            env, removed = d.clean_environment(Path("/isolated"))
        self.assertEqual(set(removed), set(inherited) - {"PATH"})
        self.assertEqual(env["PATH"], "retained")
        self.assertEqual(env["CARGO_HOME"], str(Path("/isolated/cargo-home")))

    def test_business_json_requires_real_booleans_and_no_stderr(self):
        data = json.dumps(d.EXPECTED).encode()
        self.assertTrue(d.business_valid(data, b""))
        self.assertFalse(d.business_valid(data, b"error"))
        self.assertFalse(d.business_valid(json.dumps(dict(d.EXPECTED, workflow=1)).encode(), b""))
        self.assertFalse(d.business_valid(data + b"\nnot json", b""))

    def test_missing_execution_opt_in_or_non_windows_refused(self):
        args = argparse.Namespace(execute_windows=False)
        with self.assertRaisesRegex(ValueError, "no execution"):
            d.collect(args)
        args.execute_windows = True
        with patch.object(d.platform, "system", return_value="Linux"), self.assertRaisesRegex(ValueError, "native Windows"):
            d.collect(args)

    def test_source_pin_and_dirty_checkout_are_enforced(self):
        root = Path(tempfile.gettempdir()).resolve()
        def responses(head=d.SOURCE_SHA, status=b""):
            return [str(root).encode(), head.encode(), status]
        with patch.object(d, "git", side_effect=responses()):
            d.verify_checkout(root)
        with patch.object(d, "git", side_effect=responses(head="unexpected")):
            with self.assertRaisesRegex(ValueError, "unexpected source commit"):
                d.verify_checkout(root)
        with patch.object(d, "git", side_effect=responses(status=b" M src/lib.rs")):
            with self.assertRaisesRegex(ValueError, "source checkout not clean"):
                d.verify_checkout(root)

    def test_local_python_process_capture_failure_and_continue(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory)
            one, stdout, stderr = d.execute([sys.executable, "-c", "import sys; print('one'); sys.stderr.buffer.write(b'\\xff'); sys.exit(7)"],
                                            path, os.environ.copy(), path, "one", 10)
            two, _, _ = d.execute([sys.executable, "-c", "print('two')"], path, os.environ.copy(), path, "two", 10)
            self.assertEqual(one["returncode"], 7)
            self.assertEqual(one["exit_u32_hex"], "0x00000007")
            self.assertEqual(stderr, b"\xff")
            self.assertEqual((path / "one.stderr.bin").read_bytes(), b"\xff")
            self.assertNotEqual(one["pid"], two["pid"])
            self.assertEqual(two["returncode"], 0)

    def test_local_python_timeout_is_bounded_and_captured(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory)
            record, stdout, _ = d.execute([sys.executable, "-c", "import time; print('before timeout', flush=True); time.sleep(5)"],
                                          path, os.environ.copy(), path, "timeout", 0.2)
            self.assertTrue(record["timeout"])
            self.assertIn(b"before timeout", stdout)
            self.assertNotEqual(record["returncode"], 0)

    def test_missing_executable_is_recorded(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory)
            record, _, _ = d.execute([str(path / "absent")], path, os.environ.copy(), path, "absent", 1)
            self.assertIn("launch_error", record)
            self.assertIsNone(record["returncode"])

    def collect_synthetic(self, launch_error=False, nonzero_valid=False):
        # This exercises Python orchestration only. No Rust tool or Windows binary runs.
        with tempfile.TemporaryDirectory() as directory:
            parent = Path(directory)
            root, output = parent / "source", parent / "output"
            root.mkdir()
            fixture = REFERENCE / d.FIXTURE
            files = {d.FIXTURE + str(p.relative_to(fixture)).replace(os.sep, "/"): p.read_bytes().replace(b"\r\n", b"\n")
                     for p in fixture.rglob("*") if p.is_file()}
            objects = {d.blob_sha(data): data for data in files.values()}
            def fake_git(_root, *args):
                if args[:2] == ("ls-tree", "-rz"):
                    return b"".join((f"100644 blob {d.blob_sha(data)}\t{name}\0").encode() for name, data in files.items())
                if args[:2] == ("cat-file", "blob"):
                    return objects[args[2]]
                if args == ("rev-parse", "HEAD^{tree}"):
                    return b"synthetic-source-tree\n"
                if args == ("ls-tree", "-r", "HEAD"):
                    return b"synthetic-source-tree-listing\n"
                return (d.ANCHORS[args[1].removeprefix("HEAD:")] + "\n").encode()
            labels = []
            def fake_execute(command, cwd, env, evidence, label, timeout):
                labels.append(label)
                rc, stdout = 0, b""
                if label == "rustc":
                    stdout = ("release: 1.94.0\nhost: " + d.TARGET + "\n").encode()
                if label == "lock":
                    (cwd / "Cargo.lock").write_bytes(b"# synthetic test lock; not real dependencies\n")
                if label == "metadata":
                    stdout = json.dumps({"packages": [], "resolve": {"root": "synthetic-root"}}).encode()
                if label in ("build", "build-original"):
                    binary = output / "target/synthetic.exe"
                    binary.parent.mkdir(exist_ok=True)
                    binary.write_bytes(synthetic_pe())
                    artifact = {"reason": "compiler-artifact", "package_id": "synthetic-root", "executable": str(binary),
                                "fresh": False, "target": {"name": d.PACKAGE, "kind": ["bin"]},
                                "profile": {"test": False, "opt_level": "0", "debug_assertions": True, "debuginfo": 2}}
                    stdout = (json.dumps(artifact) + '\n{"reason":"build-finished","success":true}\n').encode()
                if label in ("run-main", "run-1mib", "run-original"):
                    rc = 0xC00000FD
                if label == "run-16mib":
                    stdout = json.dumps(d.EXPECTED).encode()
                    if nonzero_valid:
                        rc = 7
                if label == "run-main" and launch_error:
                    return {"returncode": None, "timeout": False, "launch_error": "synthetic failure"}, b"", b""
                return {"returncode": rc, "timeout": False, "command": command,
                        "exit_u32_hex": f"0x{rc & 0xffffffff:08x}"}, stdout, b""
            args = argparse.Namespace(execute_windows=True, source_root=root, output=output, build_timeout=1, run_timeout=1)
            with patch.object(d.platform, "system", return_value="Windows"), patch.object(d, "verify_checkout"), \
                 patch.object(d, "git", side_effect=fake_git), patch.object(d, "execute", side_effect=fake_execute), patch("builtins.print"):
                self.assertEqual(d.collect(args), 1 if launch_error else 0)
            report = json.loads((output / "evidence/result.json").read_text())
            self.assertEqual(labels.count("lock"), 1)
            self.assertEqual(labels.count("build"), 1)
            self.assertEqual(labels.count("build-original"), 1)
            self.assertEqual(labels[-5:], ["run-main", "run-1mib", "run-16mib", "build-original", "run-original"])
            self.assertEqual(report["status"], "incomplete" if launch_error else "collected")
            if not launch_error:
                self.assertEqual(report["runs"]["main"]["exit_u32_hex"], "0xc00000fd")
            identities = [run["identities"] for run in report["runs"].values()]
            self.assertTrue(all(item == identities[0] for item in identities))
            self.assertTrue(report["runs"]["16mib"]["business_report_valid"])
            self.assertEqual(report["runs"]["16mib"]["process_and_business_pass"], not nonzero_valid)
            self.assertEqual(report["original_fixture"]["exit_u32_hex"], "0xc00000fd")
            self.assertFalse(report["original_fixture"]["process_and_business_pass"])
            self.assertEqual(report["original_fixture"]["identities"]["lockfile_sha256"], identities[0]["lockfile_sha256"])
            self.assertEqual((output / "consumer/src/main.rs").read_bytes(), files[d.FIXTURE + "src/main.rs"])
            for mode in d.MODES:
                self.assertEqual(json.loads((output / f"evidence/run-{mode}.json").read_text()), report["runs"][mode])
            return report

    def test_synthetic_collector_one_comparison_build_three_modes_and_original(self):
        self.collect_synthetic()

    def test_launch_failure_is_not_successful_collection(self):
        self.collect_synthetic(launch_error=True)

    def test_valid_json_with_nonzero_exit_is_not_process_pass(self):
        self.collect_synthetic(nonzero_valid=True)


if __name__ == "__main__":
    unittest.main(verbosity=2)
