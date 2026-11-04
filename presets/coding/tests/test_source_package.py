"""Source delivery uses real files and archives, not an installed environment."""
import importlib.util
import io
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tarfile
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location('source_build', ROOT / 'build.py')
build = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(build)


class SourcePackageTests(unittest.TestCase):
    def setUp(self):
        directory = tempfile.TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        self.directory = Path(directory.name)
        self.root = self.directory / 'project'
        shutil.copytree(ROOT, self.root, ignore=shutil.ignore_patterns('__pycache__', '*.pyc'))
        self.paths = json.loads((self.root / 'source-files.json').read_text(encoding='utf-8'))

    def manifest(self, paths):
        (self.root / 'source-files.json').write_text(json.dumps(paths, ensure_ascii=False), encoding='utf-8')

    def archive(self, data=None):
        return tarfile.open(fileobj=io.BytesIO(build.pack_sources(self.root) if data is None else data), mode='r:gz')

    def cli(self, *args):
        return subprocess.run([sys.executable, '-S', '-B', str(self.root / 'build.py'), *args],
            env={**os.environ, 'PATH': str(self.directory / 'no-external-tools')},
            capture_output=True, timeout=30, check=False)

    def test_archive_has_every_declared_source_byte_and_no_dependency_payloads(self):
        with self.archive() as archive:
            self.assertEqual(archive.getnames(), ['coding/' + path for path in sorted(self.paths)])
            for member in archive.getmembers():
                self.assertTrue(member.isfile())
                self.assertEqual((member.uid, member.gid, member.mtime), (0, 0, 0))
                self.assertEqual(archive.extractfile(member).read(),
                    (self.root / member.name.removeprefix('coding/')).read_bytes())

    def test_binary_invalid_python_and_included_json_remain_uninterpreted_bytes(self):
        files = {'binary.bin': bytes(range(256)) * 8193,
                 'invalid.py': b'def invalid(\n',
                 'uninstalled.py': b'import user_supplied_dependency\nraise RuntimeError("not executed")\n',
                 'skills/review.json': b'{"$file":"/not-an-instruction"}'}
        for path, data in files.items():
            (self.root / path).write_bytes(data)
        self.manifest(self.paths + [path for path in files if path not in self.paths])
        with self.archive() as archive:
            for path, data in files.items():
                self.assertEqual(archive.extractfile('coding/' + path).read(), data)

    def test_archives_are_reproducible_and_keep_executable_intent(self):
        script = self.root / 'entry.sh'
        script.write_bytes(b'#!/bin/sh\nexit 0\n')
        script.chmod(0o755)
        self.manifest(self.paths + ['entry.sh'])
        first = build.pack_sources(self.root)
        for path in self.paths + ['entry.sh']:
            os.utime(self.root / path, (1000000000, 1000000000))
        second = build.pack_sources(self.root)
        self.assertEqual(first, second)
        with self.archive(second) as archive:
            self.assertEqual(archive.getmember('coding/entry.sh').mode, 0o755)

    def test_missing_source_and_disabled_branch_omissions_fail(self):
        path = 'modules/command/command.py'
        self.manifest([item for item in self.paths if item != path])
        with self.assertRaisesRegex(build.PackagingError, 'absent from source-files'):
            build.pack_sources(self.root)
        self.manifest(self.paths)
        (self.root / path).unlink()
        with self.assertRaisesRegex(build.PackagingError, 'unavailable'):
            build.pack_sources(self.root)

    def test_duplicate_unsafe_linked_or_special_files_fail(self):
        (self.root / 'alias').symlink_to(self.root / 'prompt.md')
        (self.root / 'linked').symlink_to(self.root / 'modules', target_is_directory=True)
        os.mkfifo(self.root / 'pipe')
        for path in ('prompt.md', '../outside', '/outside', './prompt.md', 'modules//files/files.py',
                     'a\\b', 'alias', 'linked/files/files.py', 'pipe'):
            with self.subTest(path=path):
                self.manifest(self.paths + [path])
                with self.assertRaises(build.PackagingError):
                    build.pack_sources(self.root)
        for paths in ({}, [None], self.paths + [{}], [p for p in self.paths if p == 'preset.json']):
            self.manifest(paths)
            with self.assertRaises(build.PackagingError):
                build.pack_sources(self.root)

    def test_only_listed_source_is_packed_even_with_local_dependencies_and_output(self):
        first = build.pack_sources(self.root)
        for path in ('.venv/pyvenv.cfg', '__pycache__/local.pyc', 'build/toolchain.bin',
                     'private-settings.json', '.env'):
            target = self.root / path
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(b'local-only-data')
        build.publish(self.root / 'coding-source.tar.gz', first)
        self.assertEqual(build.pack_sources(self.root), first)

    def test_source_list_has_no_file_count_quota(self):
        paths = []
        for index in range(129):
            path = 'resource-' + str(index)
            (self.root / path).write_bytes(b'data')
            paths.append(path)
        self.manifest(self.paths + paths)
        with self.archive() as archive:
            self.assertEqual(len(archive.getmembers()), len(self.paths) + 129)

    def test_default_cli_needs_no_settings_locks_site_packages_or_external_tools(self):
        output = self.directory / 'source.tar.gz'
        result = self.cli('--output', str(output))
        self.assertEqual(result.returncode, 0, result.stderr.decode())
        self.assertEqual(output.read_bytes(), build.pack_sources(self.root))
        result = self.cli('--output', str(output))
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(output.read_bytes(), build.pack_sources(self.root))
        self.assertEqual(sorted(p.name for p in self.directory.iterdir()), ['project', 'source.tar.gz'])

    def test_incomplete_explicit_deployment_flags_and_missing_sources_publish_nothing(self):
        output = self.directory / 'not-published'
        for flag, status in (('--settings', 1), ('--dependency-lock', 2)):
            result = self.cli(flag, '/not-installed', '--output', str(output))
            self.assertEqual(result.returncode, status)
            self.assertFalse(output.exists())
        (self.root / 'prompt.md').unlink()
        result = self.cli('--output', str(output))
        self.assertEqual(result.returncode, 1)
        self.assertFalse(output.exists())


if __name__ == '__main__':
    unittest.main()
