"""Offline distribution assembly tests; fixture executables are intentionally not runnable."""
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

SCRIPT = Path(__file__).resolve().parents[1] / "package-main-agent.py"
spec = importlib.util.spec_from_file_location("package_main_agent", SCRIPT)
pkg = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pkg)


class DistributionTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name) / "repo"
        self.root.mkdir()
        self.out = self.root.parent / "bundle"
        self.cli = self.root.parent / "cli"
        self.host = self.root.parent / "host"
        self.cli.write_bytes(b"fixture cli bytes")
        self.host.write_bytes(b"fixture host bytes")
        for name in ("LICENSE", "THIRD-PARTY-NOTICES"):
            (self.root / name).write_text("fixture notice")
        self.put("modules/module-repository.json", {"format": "nofy.module-repository/v1", "packages": ["main"]})
        self.put("modules/main/module.json", {"format": "nofy.module-package/v1", "name": "delegate", "version": "0.2.0"})
        self.put("modules/main/source-files.json", ["source-files.json", "module.json"])
        names = ["source-files.json", "project.json", "preset.json", "settings.json", "settings.schema.json"]
        for name in names:
            self.put(pkg.PRESET + "/" + name, names if name == "source-files.json" else {})
        (self.root / ".env").write_text("private")
        (self.root / "modules/main/credentials.json").write_text("private")

    def put(self, path, data):
        target = self.root / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(json.dumps(data))

    def build(self):
        return pkg.assemble(self.root, self.out, self.cli, self.host, "0.1.0-test", "linux-x86_64-gnu")

    def test_roundtrip_and_allowlist(self):
        self.build()
        self.assertEqual(pkg.verify(self.out)["version"], "0.2.0")
        self.assertFalse((self.out / ".env").exists())
        self.assertFalse((self.out / "modules/main/credentials.json").exists())
        self.assertTrue((self.out / "LICENSE").exists())

    def test_refuses_overwrite(self):
        self.build()
        with self.assertRaises(ValueError):
            self.build()

    def test_missing_binary_does_not_create_output(self):
        self.host.unlink()
        with self.assertRaises(OSError):
            self.build()
        self.assertFalse(self.out.exists())

    def test_tamper(self):
        self.build()
        (self.out / "bin/nofy").write_bytes(b"tampered")
        with self.assertRaisesRegex(ValueError, "checksum"):
            pkg.verify(self.out)

    def test_extra_file(self):
        self.build()
        (self.out / "unexpected").write_text("bad")
        with self.assertRaisesRegex(ValueError, "unexpected"):
            pkg.verify(self.out)

    def test_missing_file(self):
        self.build()
        (self.out / "bin/nofy-agent-host").unlink()
        with self.assertRaises(ValueError):
            pkg.verify(self.out)

    def test_source_escape(self):
        for escape in ("../outside", "/absolute", "C:/drive", "a\\b", "a//b", "./module.json", "credentials.json"):
            with self.subTest(escape=escape):
                self.put("modules/main/source-files.json", ["source-files.json", "module.json", escape])
                with self.assertRaises(ValueError):
                    self.build()
                self.assertFalse(self.out.exists())

    def test_symlink_input_and_output(self):
        original = self.host
        link = self.root.parent / "link"
        try:
            link.symlink_to(original)
        except OSError:
            self.skipTest("symlinks unavailable")
        self.host = link
        with self.assertRaises(ValueError):
            self.build()
        self.host = original
        self.out.symlink_to(self.root, target_is_directory=True)
        with self.assertRaises(ValueError):
            self.build()

    def test_symlink_in_bundle(self):
        self.build()
        path = self.out / "bin/nofy"
        path.unlink()
        try:
            path.symlink_to(self.cli)
        except OSError:
            self.skipTest("symlinks unavailable")
        with self.assertRaises(ValueError):
            pkg.verify(self.out)

    def test_shipped_declarations_with_fixture_binaries(self):
        self.root = SCRIPT.parents[1]
        if not (self.root / pkg.PRESET).exists():
            self.skipTest("composable preset not created yet")
        self.build()
        self.assertGreater(len(pkg.verify(self.out)["packages"]), 1)

    def test_windows_names(self):
        pkg.assemble(self.root, self.out, self.cli, self.host, "0.1.0", "windows-x86_64")
        self.assertTrue((self.out / "bin/nofy.exe").exists())
        pkg.verify(self.out)


SYNC_SCRIPT = Path(__file__).resolve().parents[1] / "verify-module-sync.py"
sync_spec = importlib.util.spec_from_file_location("verify_module_sync", SYNC_SCRIPT)
sync_mod = importlib.util.module_from_spec(sync_spec)
sync_spec.loader.exec_module(sync_mod)


class ModuleSyncGateTests(unittest.TestCase):
    def setUp(self):
        self.repo = Path(__file__).resolve().parents[2]

    def _copy_minimal_repo(self, dest: Path):
        import shutil
        for rel in ("modules", "presets/omni", "presets/main-agent-composable", "docs/manual"):
            src = self.repo / rel
            if src.exists():
                shutil.copytree(src, dest / rel, ignore=shutil.ignore_patterns("__pycache__", "*.pyc"))

    def test_shipped_repository_passes_module_sync_gate(self):
        problems, summary = sync_mod.verify_all(self.repo)
        self.assertEqual(problems, [], problems)
        self.assertEqual(summary["repository_packages"], 16)
        self.assertEqual(summary["omni_frozen_packages"], 11)

    def test_gate_detects_drift_stray_file_bare_schema_and_unsafe_int(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp) / "repo"
            self._copy_minimal_repo(root)

            # 1. Source drift between modules/ and frozen package in presets/omni.
            target = root / "modules/workspace/files/rules.md"
            target.write_text(target.read_text(encoding="utf-8") + "\ndrift\n", encoding="utf-8")
            problems, _ = sync_mod.verify_all(root)
            self.assertTrue(any("drifted" in p for p in problems), problems)

        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp) / "repo"
            self._copy_minimal_repo(root)

            # 2. Stray unlisted file in presets/omni.
            (root / "presets/omni/stray.txt").write_text("unlisted", encoding="utf-8")
            problems, _ = sync_mod.verify_all(root)
            self.assertTrue(any("unlisted in source-files.json" in p for p in problems), problems)

        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp) / "repo"
            self._copy_minimal_repo(root)

            # 3. Bare object schema and > JS_MAX_SAFE_INT budget cap.
            schema_path = root / "presets/omni/settings.schema.json"
            schema = json.loads(schema_path.read_text(encoding="utf-8"))
            schema["properties"]["process_tree"] = {"type": "object"}
            schema["properties"]["budget"]["properties"]["max_steps"]["maximum"] = 18446744073709551615
            schema_path.write_text(json.dumps(schema, indent=2) + "\n", encoding="utf-8")
            problems, _ = sync_mod.verify_all(root)
            self.assertTrue(any("process_tree" in p and "nested 'properties'" in p for p in problems), problems)
            self.assertTrue(any("JS safe integer" in p for p in problems), problems)


if __name__ == "__main__":
    unittest.main()
