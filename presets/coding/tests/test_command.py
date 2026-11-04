"""Real local child processes; the Host suite proves the actual OS boundary."""
import json
import os
from pathlib import Path
import signal
import subprocess
import sys
import tempfile
import unittest


MODULE = Path(__file__).resolve().parents[1] / 'modules/command/command.py'


class Commands(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)

    def raw(self, data):
        result = subprocess.run([sys.executable, '-B', str(MODULE)], input=data,
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=10,
            env={**os.environ, 'NOFY_DIRECTORY_WORKSPACE': str(self.root)})
        self.assertEqual(result.returncode, 0, result.stderr.decode(errors='replace'))
        self.assertEqual(result.stderr, b'')
        self.assertLessEqual(len(result.stdout), 2097152)
        return json.loads(result.stdout)

    def command(self, code, **options):
        return self.raw(json.dumps({'argv': [sys.executable, '-S', '-s', '-B', '-c', code], **options}).encode())

    def observed(self, reply, ok=True, code=None):
        self.assertIs(reply['ok'], ok, reply)
        if ok:
            return reply['result']
        if code is not None:
            self.assertEqual(reply['error']['code'], code, reply)
        return reply['error'].get('result')

    def test_argv_empty_argument_cwd_and_stdin_are_exact_without_implicit_shell(self):
        (self.root / 'nested').mkdir()
        args = ['', '空 格', '$(touch must-not-exist)', '; echo wrong']
        code = 'import json,os,sys;print(json.dumps([sys.argv[1:],os.path.basename(os.getcwd()),sys.stdin.read()],ensure_ascii=False))'
        reply = self.raw(json.dumps({'argv': [sys.executable, '-S', '-c', code, *args],
            'cwd': 'nested', 'stdin': '输入\n'}).encode())
        result = self.observed(reply)
        self.assertEqual(json.loads(result['stdout']), [args, 'nested', '输入\n'])
        self.assertEqual(result['stdin_bytes_written'], len('输入\n'.encode()))
        self.assertEqual(result['exit_code'], 0)
        self.assertIsNone(result['signal'])
        self.assertFalse(result['stdout_truncated'])
        self.assertFalse(result['stderr_truncated'])
        self.assertFalse((self.root / 'nested/must-not-exist').exists())

    def test_both_streams_and_large_stdin_progress_without_pipe_deadlock(self):
        code = 'import os,sys;os.write(2,b"e"*60000);data=sys.stdin.buffer.read();os.write(1,data);os.write(2,b"done")'
        result = self.observed(self.command(code, stdin='x' * 65536, max_output_bytes=131072))
        self.assertEqual(result['stdout'], 'x' * 65536)
        self.assertEqual(result['stderr'], 'e' * 60000 + 'done')
        self.assertEqual(result['observed_stdout_bytes'], 65536)
        self.assertEqual(result['stdin_bytes_written'], 65536)

    def test_exact_output_limit_succeeds_and_json_escaping_stays_within_outer_limit(self):
        for count in (1024, 262144):
            with self.subTest(count=count):
                result = self.observed(self.command(f'import os;os.write(1,b"\\0"*{count})', max_output_bytes=count))
                self.assertEqual(result['stdout'], '\0' * count)
                self.assertEqual(result['observed_stdout_bytes'], count)
                self.assertFalse(result['stdout_truncated'])

    def test_output_overflow_is_not_success_or_a_claim_to_have_observed_every_byte(self):
        reply = self.command('import os;os.write(2,b"x"*1048576)', max_output_bytes=1024)
        result = self.observed(reply, False, 'output_limit')
        self.assertEqual(reply['error']['effect'], 'unknown')
        self.assertLessEqual(len(result['stdout'].encode()) + len(result['stderr'].encode()), 1024)
        self.assertEqual(result['observed_stderr_bytes'], 1025)
        self.assertTrue(result['stderr_truncated'])
        self.assertEqual(result['status'], 'output_limit')

    def test_invalid_utf8_is_explicit_not_silently_presented_as_original_text(self):
        result = self.observed(self.command('import os;os.write(1,b"\\xffA");os.write(2,"真实".encode())'))
        self.assertEqual(result['stdout'], '\ufffdA')
        self.assertTrue(result['stdout_lossy'])
        self.assertFalse(result['stderr_lossy'])
        self.assertEqual(result['observed_stdout_bytes'], 2)

    def test_nonzero_and_signal_results_retain_real_effects_without_retry(self):
        reply = self.command('from pathlib import Path;Path("effect").write_text("once");raise SystemExit(7)')
        result = self.observed(reply, False, 'command_failed')
        self.assertEqual(result['exit_code'], 7)
        self.assertEqual(reply['error']['effect'], 'unknown')
        self.assertEqual((self.root / 'effect').read_text(), 'once')
        result = self.observed(self.command('import os,signal;os.kill(os.getpid(),signal.SIGTERM)'), False, 'command_failed')
        self.assertEqual(result['signal'], signal.SIGTERM)
        self.assertIsNone(result['exit_code'])

    def test_deadline_also_covers_a_process_that_closed_both_output_pipes(self):
        for code in ('import time;time.sleep(30)', 'import os,time;os.close(1);os.close(2);time.sleep(30)'):
            with self.subTest(code=code):
                reply = self.command(code, timeout_ms=100)
                result = self.observed(reply, False, 'timed_out')
                self.assertEqual(result['signal'], signal.SIGKILL)
                self.assertLess(result['duration_ms'], 5000)
                self.assertEqual(reply['error']['effect'], 'unknown')

    def test_invalid_input_and_missing_executable_never_report_effects(self):
        base = {'argv': [sys.executable, '-c', 'from pathlib import Path;Path("must-not-exist").touch()']}
        invalid = [{'argv': []}, {'argv': ['']}, {'argv': ['x\0']}, {'argv': ['甲' * 2000]},
            {'argv': ['x'] * 129}, {'argv': ['x', *['x' * 4096] * 16]},
            {'argv': [1]}, {'argv': 'not-an-array'}, {'timeout_ms': True}, {'timeout_ms': 0},
            {'max_output_bytes': 1023}, {'stdin': 'x' * 65537}, {'unknown': 'ignored?'},
            *[{'cwd': cwd} for cwd in ('', '/', '/tmp', '..', 'a/../b', 'a//b', './a', 'a\\b', 'a\n')]]
        for update in invalid:
            with self.subTest(update=repr(update)[:80]):
                reply = self.raw(json.dumps({**base, **update}).encode())
                self.assertFalse(reply['ok'], reply)
                self.assertEqual(reply['error']['effect'], 'none')
                self.assertNotIn('result', reply['error'])
        self.assertFalse((self.root / 'must-not-exist').exists())
        reply = self.raw(b'{"argv":["/missing-nofy-command"]}')
        self.observed(reply, False, 'spawn_failed')
        self.assertEqual(reply['error']['effect'], 'none')

    def test_cwd_symlink_and_missing_directory_fail_before_launch(self):
        with tempfile.TemporaryDirectory() as outside:
            (self.root / 'alias').symlink_to(outside, target_is_directory=True)
            for cwd in ('alias', 'missing'):
                reply = self.command('print("must-not-run")', cwd=cwd)
                self.observed(reply, False, 'directory_unavailable')
                self.assertEqual(reply['error']['effect'], 'none')

    def test_wire_input_is_strict_and_bounded(self):
        for data in (b'{"argv":[],"argv":["/bin/true"]}', b'{"argv":NaN}',
                     b'\xff', b'{}x', b'[' * 1500, b'x' * 262145,
                     b'{"argv":["x\\ud800"]}'):
            reply = self.raw(data)
            self.observed(reply, False, 'invalid_input')
            self.assertEqual(reply['error']['effect'], 'none')


if __name__ == '__main__':
    unittest.main()
