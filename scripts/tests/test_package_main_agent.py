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


if __name__ == "__main__":
    unittest.main()
