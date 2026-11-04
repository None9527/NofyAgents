"""FD-relative text operations; no ambient directory or agent runtime."""
from contextlib import contextmanager
from dataclasses import dataclass
import fcntl
import hashlib
import os
import stat
import uuid


class Failure(Exception):
    def __init__(self, code, message):
        super().__init__(message)
        self.code = code


def text(data):
    if b'\x00' in data:
        raise Failure('not_utf8', 'Only UTF-8 text without NUL bytes is supported')
    try:
        return data.decode('utf-8')
    except UnicodeError:
        raise Failure('not_utf8', 'Only UTF-8 text is supported') from None


def encoded(value):
    if type(value) is not str or '\x00' in value:
        raise Failure('invalid_input', 'Text must be a string without NUL bytes')
    try:
        return value.encode('utf-8')
    except UnicodeError:
        raise Failure('not_utf8', 'Text must contain valid Unicode') from None


def digest(data):
    return hashlib.sha256(data).hexdigest()


def version(info):
    return (info.st_dev, info.st_ino, info.st_size, info.st_mtime_ns,
            info.st_ctime_ns, info.st_mode, info.st_uid, info.st_gid, info.st_nlink)


@dataclass
class Snapshot:
    data: bytes
    info: object

    @property
    def sha256(self):
        return digest(self.data)


class Workspace:
    def __init__(self, root, limits):
        if not root or not os.path.isabs(root):
            raise Failure('workspace_unavailable', 'An explicit directory binding is required')
        self.root = root
        self.limits = limits
        self.effect = 'none'
        self.created = []

    def parts(self, path, directory=False):
        raw = encoded(path)
        if directory and path == '.':
            return []
        parts = path.split('/')
        if (not raw or len(raw) > self.limits['max_path_bytes'] or len(parts) > 64
                or '\\' in path or any(ord(c) < 32 or ord(c) == 127 for c in path)
                or any(part in ('', '.', '..') or len(encoded(part)) > 255 for part in parts)):
            raise Failure('path_denied', 'Use a canonical relative path without traversal')
        return parts

    @contextmanager
    def directory(self, path='.'):
        parts = self.parts(path, directory=True)
        flags = os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_CLOEXEC
        current = os.open(self.root, flags)
        try:
            for part in parts:
                child = os.open(part, flags, dir_fd=current)
                os.close(current)
                current = child
            yield current
        finally:
            os.close(current)

    @contextmanager
    def parent(self, path):
        parts = self.parts(path)
        with self.directory('/'.join(parts[:-1]) or '.') as parent:
            yield parent, parts[-1]

    @contextmanager
    def lock(self, directory, exclusive=False):
        fcntl.flock(directory, fcntl.LOCK_EX if exclusive else fcntl.LOCK_SH)
        try:
            yield
        finally:
            fcntl.flock(directory, fcntl.LOCK_UN)

    def snapshot_at(self, parent, name, missing=False, writable=False, limit=None):
        flags = os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK | os.O_CLOEXEC
        try:
            descriptor = os.open(name, flags, dir_fd=parent)
        except FileNotFoundError:
            if missing:
                return None
            raise
        try:
            before = os.fstat(descriptor)
            if not stat.S_ISREG(before.st_mode):
                raise Failure('unsupported_file', 'Only regular files are supported')
            maximum = min(self.limits['max_file_bytes'], limit) if limit is not None else self.limits['max_file_bytes']
            if before.st_size > maximum:
                raise Failure('file_limit', 'File exceeds the byte budget')
            if writable:
                if (before.st_mode & 0o7000 or before.st_nlink != 1
                        or before.st_uid != os.geteuid() or os.listxattr(descriptor)):
                    raise Failure('unsupported_metadata', 'Refusing to replace special, linked, foreign-owned or extended-attribute files')
            chunks = []
            total = 0
            while True:
                chunk = os.read(descriptor, min(65536, maximum + 1 - total))
                if not chunk:
                    break
                total += len(chunk)
                if total > maximum:
                    raise Failure('file_limit', 'File exceeds the byte budget')
                chunks.append(chunk)
            if version(before) != version(os.fstat(descriptor)):
                raise Failure('unstable_file', 'File changed while being read; retry an explicit read')
            return Snapshot(b''.join(chunks), before)
        finally:
            os.close(descriptor)

    def read(self, path, limit=None):
        with self.parent(path) as (parent, name), self.lock(parent):
            return self.snapshot_at(parent, name, limit=limit)

    @staticmethod
    def named_info(parent, name):
        try:
            return os.stat(name, dir_fd=parent, follow_symlinks=False)
        except FileNotFoundError:
            return None

    def atomic(self, path, expected, transform):
        with self.parent(path) as (parent, name), self.lock(parent, exclusive=True):
            original = self.snapshot_at(parent, name, missing=True, writable=True)
            previous = original.sha256 if original else None
            if expected != previous:
                raise Failure('conflict', 'File version does not match expected_sha256')
            if original:
                text(original.data)
            data = transform(original.data if original else None)
            if len(data) > self.limits['max_file_bytes']:
                raise Failure('file_limit', 'Resulting file exceeds the byte budget')
            result = {'path': path, 'previous_sha256': previous,
                      'sha256': digest(data), 'size': len(data), 'changed': True}
            if original and data == original.data:
                result['changed'] = False
                return result
            temporary = '.nofy-atomic-' + uuid.uuid4().hex
            descriptor = None
            owned = None
            try:
                old_mask = os.umask(0)
                try:
                    mode = stat.S_IMODE(original.info.st_mode) if original else 0o666 & ~old_mask
                    descriptor = os.open(temporary, os.O_WRONLY | os.O_CREAT | os.O_EXCL
                                         | os.O_NOFOLLOW | os.O_CLOEXEC, mode, dir_fd=parent)
                finally:
                    os.umask(old_mask)
                owned = os.fstat(descriptor)
                if original and (owned.st_uid != original.info.st_uid or owned.st_gid != original.info.st_gid
                        or stat.S_IMODE(owned.st_mode) != mode or os.listxattr(descriptor)):
                    raise Failure('unsupported_metadata', 'Replacement would change file ownership, permissions or extended attributes')
                view = memoryview(data)
                while view:
                    count = os.write(descriptor, view)
                    if count <= 0:
                        raise Failure('write_failed', 'Write did not make progress')
                    view = view[count:]
                os.fsync(descriptor)
                current = self.named_info(parent, name)
                if (original is None and current is not None) or (original is not None
                        and (current is None or version(current) != version(original.info))):
                    raise Failure('conflict', 'Target changed before publication')
                staged = self.named_info(parent, temporary)
                if staged is None or (staged.st_dev, staged.st_ino) != (owned.st_dev, owned.st_ino):
                    self.effect = 'unknown'
                    raise Failure('temporary_changed', 'Staged file identity changed')
                if original is None:
                    try:
                        os.link(temporary, name, src_dir_fd=parent, dst_dir_fd=parent, follow_symlinks=False)
                    except FileExistsError:
                        raise Failure('conflict', 'Target was created before publication') from None
                else:
                    os.replace(temporary, name, src_dir_fd=parent, dst_dir_fd=parent)
                self.effect = 'committed_unconfirmed'
                published = self.named_info(parent, name)
                if published is None or (published.st_dev, published.st_ino) != (owned.st_dev, owned.st_ino):
                    raise Failure('commit_unconfirmed', 'Published file identity changed; inspect current contents')
                os.fsync(parent)
                return result
            finally:
                if descriptor is not None:
                    os.close(descriptor)
                if owned is not None:
                    try:
                        current = self.named_info(parent, temporary)
                        if current is not None and (current.st_dev, current.st_ino) == (owned.st_dev, owned.st_ino):
                            os.unlink(temporary, dir_fd=parent)
                            os.fsync(parent)
                    except OSError:
                        if self.effect == 'none':
                            self.effect = 'partial'
                        raise Failure('cleanup_unconfirmed', 'Staged file cleanup failed; inspect the workspace') from None

    def make_directory(self, path):
        parts = self.parts(path)
        flags = os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_CLOEXEC
        current = os.open(self.root, flags)
        try:
            for index, part in enumerate(parts):
                with self.lock(current, exclusive=True):
                    try:
                        os.mkdir(part, 0o777, dir_fd=current)
                    except FileExistsError:
                        pass
                    else:
                        self.effect = 'partial'
                        self.created.append('/'.join(parts[:index + 1]))
                        os.fsync(current)
                    child = os.open(part, flags, dir_fd=current)
                os.close(current)
                current = child
            return {'path': path, 'changed': bool(self.created), 'created': self.created}
        finally:
            os.close(current)
