import hashlib
import json
import os
from pathlib import Path
import stat
import struct
import subprocess
import sys
import tempfile
import unittest

MODULE = Path(__file__).resolve().parents[1] / 'modules/files'
sys.path.insert(0, str(MODULE))
import files


def sha(data):
    return hashlib.sha256(data).hexdigest()


class FileTools(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.root = Path(self.directory.name)

    def tearDown(self):
        self.directory.cleanup()

    def call(self, operation, **arguments):
        return files.handle(operation, arguments, str(self.root))

    def success(self, result):
        self.assertTrue(result['ok'], result)
        return result['result']

    def failure(self, result, code=None, effect='none'):
        self.assertFalse(result['ok'], result)
        if code:
            self.assertEqual(result['error']['code'], code)
        self.assertEqual(result['error']['effect'], effect)

    def test_read_preserves_crlf_unicode_digest_and_byte_boundaries(self):
        data = '甲乙\r\nline\n'.encode()
        (self.root / 'file').write_bytes(data)
        first = self.success(self.call('read_file', path='file', max_bytes=4))
        self.assertEqual(first['text'], '甲')
        self.assertEqual(first['next_offset'], 3)
        self.assertEqual(first['sha256'], sha(data))
        self.assertTrue(first['truncated'])
        full = self.success(self.call('read_file', path='file'))
        self.assertEqual(full['text'], data.decode())
        self.failure(self.call('read_file', path='file', offset=1), 'invalid_range')
        self.failure(self.call('read_file', path='file', offset=True), 'invalid_input')
        self.failure(self.call('read_file', path='file', offset=999), 'invalid_range')

    def test_create_requires_explicit_absence_and_never_overwrites_existing_data(self):
        created = self.success(self.call('write_file', path='new', content='first', expected_sha256=None))
        self.assertEqual(created['sha256'], sha(b'first'))
        self.failure(self.call('write_file', path='new', content='second', expected_sha256=None), 'conflict')
        self.failure(self.call('write_file', path='new', content='second', expected_sha256='0' * 64), 'conflict')
        self.assertEqual((self.root / 'new').read_bytes(), b'first')
        self.assertFalse(any(self.root.glob('.nofy-atomic-*')))

    def test_replacement_is_versioned_preserves_mode_and_noop_does_not_replace_inode(self):
        path = self.root / 'file'
        path.write_bytes(b'first')
        path.chmod(0o751)
        original = path.stat()
        noop = self.success(self.call('write_file', path='file', content='first', expected_sha256=sha(b'first')))
        self.assertFalse(noop['changed'])
        self.assertEqual(path.stat().st_ino, original.st_ino)
        replaced = self.success(self.call('write_file', path='file', content='second', expected_sha256=sha(b'first')))
        self.assertTrue(replaced['changed'])
        self.assertEqual(path.read_bytes(), b'second')
        self.assertEqual(stat.S_IMODE(path.stat().st_mode), 0o751)
        self.assertEqual((path.stat().st_uid, path.stat().st_gid), (original.st_uid, original.st_gid))

    def test_replacement_refuses_new_metadata_inherited_from_parent_default_acl(self):
        path = self.root / 'file'
        path.write_bytes(b'first')
        path.chmod(0o640)
        self.assertEqual(os.listxattr(path), [])
        # Linux's real POSIX ACL wire layout: a named user makes this extended
        # ACL survive inheritance even when its mode matches the old file.
        entries = [(1, 7, 0xffffffff), (2, 4, os.geteuid() + 1),
                   (4, 4, 0xffffffff), (16, 4, 0xffffffff), (32, 0, 0xffffffff)]
        acl = struct.pack('<I', 2) + b''.join(struct.pack('<HHI', *entry) for entry in entries)
        os.setxattr(self.root, 'system.posix_acl_default', acl)
        self.failure(self.call('write_file', path='file', content='second',
                     expected_sha256=sha(b'first')), 'unsupported_metadata')
        self.assertEqual(path.read_bytes(), b'first')
        self.assertEqual(os.listxattr(path), [])
        self.assertFalse(any(self.root.glob('.nofy-atomic-*')))

    def test_exact_edits_reject_ambiguous_or_stale_versions_without_partial_mutation(self):
        path = self.root / 'file'
        data = b'one one\r\n'
        path.write_bytes(data)
        self.failure(self.call('edit_file', path='file', expected_sha256=sha(data),
            edits=[{'old_text': 'one', 'new_text': 'two'}]), 'replacement_count')
        self.assertEqual(path.read_bytes(), data)
        result = self.success(self.call('edit_file', path='file', expected_sha256=sha(data),
            edits=[{'old_text': 'one', 'new_text': 'two', 'expected_count': 2},
                   {'old_text': 'two two', 'new_text': 'done'}]))
        self.assertEqual(path.read_bytes(), b'done\r\n')
        self.assertEqual(result['sha256'], sha(b'done\r\n'))
        self.failure(self.call('edit_file', path='file', expected_sha256=sha(data),
            edits=[{'old_text': 'done', 'new_text': 'again'}]), 'conflict')

    def test_edit_size_is_checked_before_expanding_many_replacements(self):
        data = b'x' * 100000
        (self.root / 'file').write_bytes(data)
        self.failure(self.call('edit_file', path='file', expected_sha256=sha(data),
            edits=[{'old_text': 'x', 'new_text': 'y' * 100000, 'expected_count': 100000}]), 'file_limit')
        self.assertEqual((self.root / 'file').read_bytes(), data)

    def test_paths_links_special_files_and_unsupported_metadata_fail_closed(self):
        with tempfile.TemporaryDirectory() as outside:
            secret = Path(outside) / 'secret'
            secret.write_bytes(b'outside')
            (self.root / 'link').symlink_to(secret)
            (self.root / 'directory-link').symlink_to(outside)
            for path in ['../secret', str(secret), 'a//b', 'a/./b', 'a\\b', '.', '']:
                self.failure(self.call('read_file', path=path))
            for path in ['link', 'directory-link/secret']:
                self.failure(self.call('write_file', path=path, content='bad', expected_sha256=sha(b'outside')))
            os.mkfifo(self.root / 'fifo')
            self.failure(self.call('read_file', path='fifo'), 'unsupported_file')
            original = self.root / 'original'
            original.write_bytes(b'original')
            os.link(original, self.root / 'hardlink')
            self.failure(self.call('write_file', path='original', content='bad', expected_sha256=sha(b'original')), 'unsupported_metadata')
            self.assertEqual((self.root / 'hardlink').read_bytes(), b'original')
            self.assertEqual(secret.read_bytes(), b'outside')

    def test_extended_attributes_are_not_silently_dropped(self):
        path = self.root / 'file'
        path.write_bytes(b'content')
        os.setxattr(path, 'user.nofy-test', b'evidence')
        self.failure(self.call('write_file', path='file', content='changed', expected_sha256=sha(b'content')), 'unsupported_metadata')
        self.assertEqual(os.getxattr(path, 'user.nofy-test'), b'evidence')
        self.assertEqual(path.read_bytes(), b'content')

    def test_explicit_directory_creation_is_idempotent_and_reports_partial_effects(self):
        result = self.success(self.call('make_directory', path='a/b'))
        self.assertEqual(result['created'], ['a', 'a/b'])
        self.assertFalse(self.success(self.call('make_directory', path='a/b'))['changed'])
        (self.root / 'block').write_text('file')
        self.failure(self.call('make_directory', path='block/child'), 'filesystem_error')
        self.failure(self.call('write_file', path='missing/file', content='no', expected_sha256=None), 'filesystem_error')
        self.assertFalse((self.root / 'missing').exists())

    def test_listing_and_search_are_bounded_and_report_omitted_entries(self):
        (self.root / 'src').mkdir()
        (self.root / 'src/main.rs').write_text('Hello world\r\nother hello\n', encoding='utf-8')
        (self.root / 'src/lib.py').write_text('no match\n', encoding='utf-8')
        (self.root / '.hidden').write_text('hello')
        (self.root / 'linked').symlink_to(self.root / 'src')
        listing = self.success(self.call('list_files', limit=1))
        self.assertTrue(listing['truncated'])
        self.assertLessEqual(len(listing['items']), 1)
        result = self.success(self.call('search_files', query='hello', case_sensitive=False, file_glob='*.rs'))
        self.assertEqual([item['line'] for item in result['items']], [1, 2])
        self.assertTrue(all(item['path'] == 'src/main.rs' for item in result['items']))
        self.assertGreater(result['skipped'], 0)
        regex = self.success(self.call('search_files', query='^other h.*o$', regex=True, file_glob='*.rs'))
        self.assertEqual(len(regex['items']), 1)
        self.failure(self.call('search_files', query='(' , regex=True), 'invalid_regex')
        self.failure(self.call('search_files', query='hello', file_glob='src/*.rs'), 'invalid_input')

    def test_binary_and_oversized_files_are_explicit_errors(self):
        (self.root / 'binary').write_bytes(b'\x00data')
        (self.root / 'large').write_bytes(b'x' * (files.LIMITS['max_file_bytes'] + 1))
        self.failure(self.call('read_file', path='binary'), 'not_utf8')
        self.failure(self.call('read_file', path='large'), 'file_limit')
        result = self.success(self.call('search_files', query='data'))
        self.assertGreaterEqual(result['skipped'], 2)

    def test_unknown_fields_missing_binding_and_malformed_json_never_mutate(self):
        self.failure(self.call('write_file', path='file', content='x'), 'invalid_input')
        self.failure(files.handle('read_file', {'path': 'file', 'operation': 'write_file'}, str(self.root)), 'invalid_input')
        self.failure(files.handle('write_file', {'path': 'file', 'content': 'x', 'expected_sha256': None}, None), 'workspace_unavailable')
        for payload in [b'{"path":"one","path":"two"}', b'NaN', b'{', '{"path":"file"}'.encode('utf-16')]:
            process = subprocess.run([sys.executable, '-B', str(MODULE / 'files.py'), 'read_file'],
                input=payload, capture_output=True, check=True)
            self.assertFalse(json.loads(process.stdout)['ok'])
        self.assertFalse((self.root / 'file').exists())

    def test_directory_failure_after_creation_reports_actual_partial_effects(self):
        script = "import files,json,resource,sys; resource.setrlimit(resource.RLIMIT_NOFILE,(4,4)); print(json.dumps(files.handle('make_directory',{'path':'created/child'},sys.argv[1])))"
        result = subprocess.run([sys.executable, '-B', '-c', script, str(self.root)],
            env=dict(os.environ, PYTHONPATH=str(MODULE)), capture_output=True, check=True)
        value = json.loads(result.stdout)
        self.failure(value, 'filesystem_error', effect='partial')
        self.assertEqual(value['error']['created'], ['created'])
        self.assertTrue((self.root / 'created').is_dir())
        self.assertFalse((self.root / 'created/child').exists())

    def test_cooperating_creates_and_overwrites_have_one_winner(self):
        for mode in ['create', 'overwrite']:
            path = self.root / mode
            expected = None
            if mode == 'overwrite':
                path.write_bytes(b'old')
                expected = sha(b'old')
            children = []
            for index in range(8):
                process = subprocess.Popen([sys.executable, '-B', str(MODULE / 'files.py'), 'write_file'],
                    stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                    env=dict(os.environ, NOFY_DIRECTORY_WORKSPACE=str(self.root)))
                payload = {'path': mode, 'content': str(index), 'expected_sha256': expected}
                process.stdin.write(json.dumps(payload).encode())
                process.stdin.close()
                children.append(process)
            results = []
            for child in children:
                result = json.loads(child.stdout.read())
                child.stdout.close()
                stderr = child.stderr.read()
                child.stderr.close()
                self.assertEqual(child.wait(timeout=10), 0, stderr)
                results.append(result)
            self.assertEqual(sum(result['ok'] for result in results), 1, results)
            self.assertTrue(all(result['ok'] or result['error']['code'] == 'conflict' for result in results))
            self.assertFalse(any(self.root.glob('.nofy-atomic-*')))


if __name__ == '__main__':
    unittest.main()
