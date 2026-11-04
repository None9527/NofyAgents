"""One bounded command inside the declared process-tree sandbox, not a shell host."""
import json
import os
from pathlib import Path
import selectors
import signal
import subprocess
import sys
import time


MANIFEST = json.loads(Path(__file__).with_name('manifest.json').read_text(encoding='utf-8'))
SCHEMA = MANIFEST['tool']['contract']['input_schema']


class InvalidInput(Exception):
    pass


def text(value, maximum):
    if type(value) is not str or '\0' in value or len(value.encode('utf-8')) > maximum:
        raise InvalidInput('Invalid string or UTF-8 byte limit exceeded')
    return value


def number(args, key):
    spec = SCHEMA['properties'][key]
    value = args.get(key, spec['default'])
    if type(value) is not int or not spec['minimum'] <= value <= spec['maximum']:
        raise InvalidInput('Integer outside declared bounds: ' + key)
    return value


def arguments(args):
    if type(args) is not dict or set(args) - set(SCHEMA['properties']) or not set(SCHEMA['required']) <= set(args):
        raise InvalidInput('Unknown or missing arguments')
    argv = args['argv']
    if type(argv) is not list or not 1 <= len(argv) <= 128:
        raise InvalidInput('argv must contain 1..128 strings')
    if sum(len(text(arg, 4096).encode('utf-8')) for arg in argv) > 65536 or not argv[0]:
        raise InvalidInput('Invalid command or combined argv byte limit exceeded')
    cwd = text(args.get('cwd', '.'), 4096)
    if cwd != '.' and (not cwd or '\\' in cwd or any(ord(c) < 32 or ord(c) == 127 for c in cwd)
            or any(part in ('', '.', '..') for part in cwd.split('/'))):
        raise InvalidInput('cwd must be a normalized project-relative directory')
    stdin = text(args.get('stdin', ''), 65536).encode('utf-8')
    return argv, cwd, stdin, number(args, 'timeout_ms'), number(args, 'max_output_bytes')


def enter(root, cwd):
    if type(root) is not str or not root.startswith('/'):
        raise InvalidInput('Declared WORKSPACE directory is missing')
    flags = os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_CLOEXEC
    directory = os.open(root, flags)
    try:
        if cwd != '.':
            for part in cwd.split('/'):
                child = os.open(part, flags, dir_fd=directory)
                os.close(directory)
                directory = child
        os.fchdir(directory)
    finally:
        os.close(directory)


def failure(code, message, effect, result=None):
    error = {'code': code, 'message': message, 'effect': effect}
    if result is not None:
        error['result'] = result
    return {'ok': False, 'error': error}


def execute(argv, cwd, stdin, timeout_ms, maximum):
    started = time.monotonic()
    deadline = started + timeout_ms / 1000
    streams = {name: {'data': bytearray(), 'observed': 0, 'eof': False}
               for name in ('stdout', 'stderr')}
    process = None
    reason = 'exited'
    sent = 0
    stage = 'spawn'
    io_error = None
    try:
        process = subprocess.Popen(argv, stdin=subprocess.PIPE if stdin else subprocess.DEVNULL,
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, close_fds=True, start_new_session=True)
        stage = 'selector'
        with selectors.DefaultSelector() as selector:
            for name in streams:
                pipe = getattr(process, name)
                stage = name + '_nonblocking'
                os.set_blocking(pipe.fileno(), False)
                stage = name + '_register'
                selector.register(pipe, selectors.EVENT_READ, name)
            if stdin:
                stage = 'stdin_nonblocking'
                os.set_blocking(process.stdin.fileno(), False)
                stage = 'stdin_register'
                selector.register(process.stdin, selectors.EVENT_WRITE, 'stdin')
            used = 0
            while selector.get_map():
                remaining = deadline - time.monotonic()
                if remaining <= 0:
                    reason = 'timed_out'
                    break
                for key, _ in selector.select(remaining):
                    stage = key.data + '_io'
                    if key.data == 'stdin':
                        try:
                            sent += os.write(key.fd, memoryview(stdin)[sent:sent + 16384])
                        except BrokenPipeError:
                            selector.unregister(key.fileobj)
                            key.fileobj.close()
                            continue
                        except BlockingIOError:
                            continue
                        if sent == len(stdin):
                            selector.unregister(key.fileobj)
                            key.fileobj.close()
                        continue
                    stream = streams[key.data]
                    try:
                        data = os.read(key.fd, min(65536, maximum - used + 1))
                    except BlockingIOError:
                        continue
                    if not data:
                        stream['eof'] = True
                        selector.unregister(key.fileobj)
                        key.fileobj.close()
                        continue
                    stream['observed'] += len(data)
                    kept = data[:maximum - used]
                    stream['data'].extend(kept)
                    used += len(kept)
                    if len(kept) < len(data):
                        reason = 'output_limit'
                        break
                if reason != 'exited':
                    break
            if reason == 'exited':
                try:
                    process.wait(timeout=max(0, deadline - time.monotonic()))
                except subprocess.TimeoutExpired:
                    reason = 'timed_out'
    except OSError as error:
        if process is None:
            return failure('spawn_failed', 'Command did not start (errno %s)' % error.errno, 'none')
        reason = 'io_error'
        io_error = {'stage': stage, 'errno': error.errno}
    finally:
        if process is not None:
            # The kernel still owns and reaps descendants that leave this group.
            if reason != 'exited':
                try:
                    os.killpg(process.pid, signal.SIGKILL)
                except ProcessLookupError:
                    pass
            for pipe in (process.stdin, process.stdout, process.stderr):
                if pipe is not None:
                    pipe.close()
            try:
                process.wait(timeout=1)
            except subprocess.TimeoutExpired:
                reason = 'reap_unconfirmed'
    code = process.returncode
    result = {'status': reason, 'exit_code': code if code is not None and code >= 0 else None,
        'signal': -code if code is not None and code < 0 else None, 'cwd': cwd,
        'stdin_bytes_written': sent, 'duration_ms': max(0, int((time.monotonic() - started) * 1000))}
    if io_error is not None:
        result['io_error'] = io_error
    for name, stream in streams.items():
        raw = bytes(stream['data'])
        result[name] = raw.decode('utf-8', errors='replace')
        result['observed_' + name + '_bytes'] = stream['observed']
        result[name + '_truncated'] = not stream['eof']
        try:
            raw.decode('utf-8')
            result[name + '_lossy'] = False
        except UnicodeError:
            result[name + '_lossy'] = True
    if reason == 'exited' and code == 0:
        return {'ok': True, 'result': result}
    error = 'command_failed' if reason == 'exited' else reason
    return failure(error, 'Command failed; inspect the observed result before any retry', 'unknown', result)


def pairs(items):
    result = {}
    for key, value in items:
        if key in result:
            raise InvalidInput('Duplicate JSON key')
        result[key] = value
    return result


def main():
    try:
        data = sys.stdin.buffer.read(MANIFEST['tool']['contract']['max_input_bytes'] + 1)
        if len(data) > MANIFEST['tool']['contract']['max_input_bytes']:
            raise InvalidInput('Input byte limit exceeded')
        args = json.loads(data.decode('utf-8'), object_pairs_hook=pairs,
            parse_constant=lambda _: (_ for _ in ()).throw(InvalidInput('Non-finite JSON number')))
        argv, cwd, stdin, timeout, maximum = arguments(args)
        enter(os.environ.get('NOFY_DIRECTORY_WORKSPACE'), cwd)
    except (InvalidInput, ValueError, UnicodeError, RecursionError):
        result = failure('invalid_input', 'Input must satisfy the declared command and directory bounds', 'none')
    except OSError as error:
        result = failure('directory_unavailable', 'Declared directory is unavailable (errno %s)' % error.errno, 'none')
    else:
        try:
            result = execute(argv, cwd, stdin, timeout, maximum)
        except (OSError, subprocess.SubprocessError):
            # Do not misclassify a post-start failure as a harmless cwd error.
            result = failure('execution_unconfirmed', 'Command execution or cleanup could not be confirmed', 'unknown')
    sys.stdout.write(json.dumps(result, ensure_ascii=False, separators=(',', ':')) + '\n')


if __name__ == '__main__':
    main()
