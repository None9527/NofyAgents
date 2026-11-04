"""External coding tools. The operation is a declared argv, never model input."""
from contextlib import closing
import fnmatch
import json
import os
from pathlib import Path
import re
import stat
import sys
from workspace import Failure, Workspace, encoded, text


MANIFEST = json.loads(Path(__file__).with_name('manifest.json').read_text(encoding='utf-8'))
LIMITS = MANIFEST['limits']


def number(args, name, schema):
    value = args.get(name, schema.get('default'))
    if type(value) is not int or value < schema.get('minimum', 0) or value > schema.get('maximum', 2 ** 63 - 1):
        raise Failure('invalid_input', 'Invalid integer field: ' + name)
    return value


def boolean(args, name, default):
    value = args.get(name, default)
    if type(value) is not bool:
        raise Failure('invalid_input', 'Invalid boolean field: ' + name)
    return value


def read_file(workspace, args, schema):
    snapshot = workspace.read(args['path'])
    text(snapshot.data)
    offset = number(args, 'offset', schema['properties']['offset'])
    maximum = number(args, 'max_bytes', schema['properties']['max_bytes'])
    if offset > len(snapshot.data):
        raise Failure('invalid_range', 'Offset exceeds the file size')
    try:
        snapshot.data[:offset].decode('utf-8')
    except UnicodeError:
        raise Failure('invalid_range', 'Offset must be a UTF-8 boundary') from None
    chunk = snapshot.data[offset:offset + maximum]
    while True:
        try:
            value = chunk.decode('utf-8')
            break
        except UnicodeDecodeError as error:
            chunk = chunk[:error.start]
    return {'path': args['path'], 'sha256': snapshot.sha256, 'size': len(snapshot.data),
            'offset': offset, 'next_offset': offset + len(chunk), 'text': value,
            'truncated': offset + len(chunk) < len(snapshot.data)}


def expected(args, nullable=False):
    value = args['expected_sha256']
    if nullable and value is None:
        return None
    if type(value) is not str or re.fullmatch('[0-9a-f]{64}', value) is None:
        raise Failure('invalid_input', 'expected_sha256 must be a lowercase SHA-256')
    return value


def write_file(workspace, args, schema):
    if len(args['content']) > schema['properties']['content']['maxLength']:
        raise Failure('invalid_input', 'Content exceeds the character budget')
    data = encoded(args['content'])
    return workspace.atomic(args['path'], expected(args, nullable=True), lambda _: data)


def edit_file(workspace, args, schema):
    edits = args['edits']
    if type(edits) is not list or not 1 <= len(edits) <= 64:
        raise Failure('invalid_input', 'edits must contain 1..64 replacements')
    for edit in edits:
        if type(edit) is not dict or set(edit) - {'old_text', 'new_text', 'expected_count'} or not {'old_text', 'new_text'} <= set(edit):
            raise Failure('invalid_input', 'Invalid edit fields')
        encoded(edit['old_text'])
        encoded(edit['new_text'])
        if not edit['old_text'] or max(len(edit['old_text']), len(edit['new_text'])) > 262144:
            raise Failure('invalid_input', 'Replacement text exceeds its bounds')
        count = edit.get('expected_count', 1)
        if type(count) is not int or not 1 <= count <= 100000:
            raise Failure('invalid_input', 'Invalid expected_count')
    def transform(data):
        value = text(data)
        for edit in edits:
            count = value.count(edit['old_text'])
            if count != edit.get('expected_count', 1):
                raise Failure('replacement_count', 'Exact replacement count differs from expected_count')
            predicted = len(encoded(value)) + count * (len(encoded(edit['new_text'])) - len(encoded(edit['old_text'])))
            if predicted > LIMITS['max_file_bytes']:
                raise Failure('file_limit', 'Edited file exceeds the byte budget')
            value = value.replace(edit['old_text'], edit['new_text'])
        return encoded(value)
    return workspace.atomic(args['path'], expected(args), transform)


def walk(workspace, path, hidden, maximum_depth, stats):
    def visit(directory, relative, depth):
        with workspace.lock(directory):
            names = []
            with os.scandir(directory) as entries:
                for entry in entries:
                    stats['visited'] += 1
                    if stats['visited'] > LIMITS['max_entries']:
                        stats['truncated'].add('entry_limit')
                        break
                    names.append(entry.name)
            for name in sorted(names):
                if stats['visited'] > LIMITS['max_entries']:
                    return
                candidate = (relative + '/' if relative else '') + name
                try:
                    workspace.parts(candidate)
                except Failure:
                    stats['skipped'] += 1
                    continue
                if not hidden and name.startswith('.'):
                    stats['skipped'] += 1
                    continue
                try:
                    info = os.stat(name, dir_fd=directory, follow_symlinks=False)
                    if stat.S_ISREG(info.st_mode):
                        yield {'path': candidate, 'kind': 'file', 'size': info.st_size}
                    elif stat.S_ISDIR(info.st_mode):
                        if name in MANIFEST['ignored_directories']:
                            stats['skipped'] += 1
                            continue
                        yield {'path': candidate, 'kind': 'directory'}
                        if depth >= maximum_depth:
                            stats['truncated'].add('depth_limit')
                            continue
                        child = os.open(name, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_CLOEXEC, dir_fd=directory)
                        try:
                            yield from visit(child, candidate, depth + 1)
                        finally:
                            os.close(child)
                    else:
                        stats['skipped'] += 1
                except OSError:
                    stats['skipped'] += 1
    with workspace.directory(path) as root:
        yield from visit(root, '' if path == '.' else path, 0)


def scan_options(args, schema):
    path = args.get('path', '.')
    encoded(path)
    hidden = boolean(args, 'include_hidden', False)
    depth = number(args, 'max_depth', schema['properties']['max_depth'])
    limit = number(args, 'limit', schema['properties']['limit'])
    return path, hidden, depth, limit


def stats_new():
    return {'visited': 0, 'skipped': 0, 'truncated': set(), 'bytes_scanned': 0, 'files_scanned': 0}


def size(value):
    return len(json.dumps(value, ensure_ascii=False, separators=(',', ':')).encode('utf-8'))


def finish_scan(items, stats):
    return {'items': items, **{key: value for key, value in stats.items() if key != 'truncated'},
            'truncated': bool(stats['truncated']), 'limits_reached': sorted(stats['truncated'])}


def list_files(workspace, args, schema):
    path, hidden, depth, limit = scan_options(args, schema)
    stats = stats_new()
    items, total = [], 0
    with closing(walk(workspace, path, hidden, depth, stats)) as entries:
        for entry in entries:
            total += size(entry)
            if total > LIMITS['result_bytes'] or len(items) >= limit:
                stats['truncated'].add('output_limit' if total > LIMITS['result_bytes'] else 'result_limit')
                break
            items.append(entry)
    return finish_scan(items, stats)


def excerpt(value, start):
    begin = max(0, start - 80)
    data = value[begin:].encode('utf-8')[:512]
    clipped = data.decode('utf-8', errors='ignore')
    return clipped, begin > 0 or begin + len(clipped) < len(value)


def search_files(workspace, args, schema):
    path, hidden, depth, limit = scan_options(args, schema)
    query = args['query']
    if type(query) is not str or not query or len(query) > 512 or '\n' in query or '\r' in query:
        raise Failure('invalid_input', 'query must be bounded single-line text')
    encoded(query)
    pattern = args.get('file_glob', '*')
    if type(pattern) is not str or not pattern or len(pattern) > 256 or '/' in pattern or '\\' in pattern:
        raise Failure('invalid_input', 'file_glob must be a bounded basename glob')
    encoded(pattern)
    regex = boolean(args, 'regex', False)
    sensitive = boolean(args, 'case_sensitive', True)
    try:
        matcher = re.compile(query if regex else re.escape(query), 0 if sensitive else re.IGNORECASE)
    except re.error:
        raise Failure('invalid_regex', 'Invalid regular expression') from None
    stats = stats_new()
    items, total = [], 0
    with closing(walk(workspace, path, hidden, depth, stats)) as entries:
        for entry in entries:
            if entry['kind'] != 'file' or not fnmatch.fnmatchcase(entry['path'].rsplit('/', 1)[-1], pattern):
                continue
            remaining = LIMITS['max_scan_bytes'] - stats['bytes_scanned']
            if remaining <= 0:
                stats['truncated'].add('byte_limit')
                break
            try:
                snapshot = workspace.read(entry['path'], limit=remaining)
                value = text(snapshot.data)
            except (OSError, Failure):
                stats['skipped'] += 1
                continue
            stats['bytes_scanned'] += len(snapshot.data)
            stats['files_scanned'] += 1
            sha256 = snapshot.sha256
            for line_number, line in enumerate(value.split('\n'), 1):
                line = line.removesuffix('\r')
                match = matcher.search(line)
                if match is None:
                    continue
                snippet, clipped = excerpt(line, match.start())
                item = {'path': entry['path'], 'line': line_number, 'sha256': sha256,
                        'excerpt': snippet, 'excerpt_truncated': clipped}
                total += size(item)
                if total > LIMITS['result_bytes'] or len(items) >= limit:
                    stats['truncated'].add('output_limit' if total > LIMITS['result_bytes'] else 'result_limit')
                    return finish_scan(items, stats)
                items.append(item)
    return finish_scan(items, stats)


OPERATIONS = {'read_file': read_file, 'write_file': write_file, 'edit_file': edit_file,
              'make_directory': lambda workspace, args, _: workspace.make_directory(args['path']),
              'list_files': list_files, 'search_files': search_files}


def handle(operation, args, root):
    workspace = None
    try:
        if operation not in OPERATIONS:
            raise Failure('invalid_operation', 'Operation must be a declared tool argument')
        schema = MANIFEST['tools'][operation]['contract']['input_schema']
        if type(args) is not dict or set(args) - set(schema['properties']) or not set(schema['required']) <= set(args):
            raise Failure('invalid_input', 'Unknown or missing tool arguments')
        for key, value in args.items():
            expected_type = schema['properties'][key].get('type')
            if expected_type == 'string':
                encoded(value)
            if key == 'path':
                encoded(value)
        workspace = Workspace(root, LIMITS)
        result = {'ok': True, 'result': OPERATIONS[operation](workspace, args, schema)}
        if size(result) > LIMITS['max_output_bytes']:
            raise Failure('output_limit', 'Result exceeds the output budget')
        return result
    except (Failure, OSError) as error:
        return {'ok': False, 'error': {'code': error.code if isinstance(error, Failure) else 'filesystem_error',
            'message': str(error) if isinstance(error, Failure) else 'Filesystem operation failed (errno %s)' % error.errno,
            'effect': workspace.effect if workspace else 'none',
            **({'created': workspace.created} if workspace and workspace.created else {})}}


def pairs(items):
    result = {}
    for key, value in items:
        if key in result:
            raise Failure('invalid_input', 'Duplicate JSON key')
        result[key] = value
    return result


def main():
    try:
        data = sys.stdin.buffer.read(LIMITS['max_input_bytes'] + 1)
        if len(data) > LIMITS['max_input_bytes']:
            raise Failure('input_limit', 'Input exceeds the byte budget')
        args = json.loads(data.decode('utf-8'), object_pairs_hook=pairs,
                          parse_constant=lambda _: (_ for _ in ()).throw(Failure('invalid_input', 'Non-finite JSON number')))
        operation = sys.argv[1] if len(sys.argv) == 2 else ''
        result = handle(operation, args, os.environ.get('NOFY_DIRECTORY_WORKSPACE'))
    except (Failure, ValueError, UnicodeError):
        result = {'ok': False, 'error': {'code': 'invalid_input', 'message': 'Input must be bounded strict JSON', 'effect': 'none'}}
    sys.stdout.write(json.dumps(result, ensure_ascii=False, separators=(',', ':')) + '\n')


if __name__ == '__main__':
    main()
