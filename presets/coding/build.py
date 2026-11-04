"""Pack project sources, or explicitly materialize a native deployment."""
import argparse
import base64
from copy import deepcopy
import gzip
import hashlib
import io
import json
import os
from pathlib import Path
import re
import stat
import tarfile
import tempfile
from urllib.parse import urlsplit


class PackagingError(Exception):
    pass


class Reference:
    def __init__(self, identifier):
        if type(identifier) is not str or re.fullmatch('[A-Za-z0-9._-]{1,128}', identifier) is None:
            raise PackagingError('Invalid declared module identifier')
        self.identifier = identifier


def pairs(items):
    result = {}
    for key, value in items:
        if key in result:
            raise PackagingError('Duplicate JSON key')
        result[key] = value
    return result


def decode(data):
    try:
        if isinstance(data, bytes):
            data = data.decode('utf-8')
        value = json.loads(data, object_pairs_hook=pairs,
            parse_constant=lambda _: (_ for _ in ()).throw(PackagingError('Non-finite JSON number')))
        pending = [(value, 0)]
        while pending:
            item, depth = pending.pop()
            if depth > 128:
                raise PackagingError('JSON nesting exceeds 128 levels')
            if type(item) is dict:
                pending.extend((child, depth + 1) for child in item.values())
            elif type(item) is list:
                pending.extend((child, depth + 1) for child in item)
        return value
    except (UnicodeError, ValueError, RecursionError):
        raise PackagingError('Input must be strict UTF-8 JSON') from None


def encode(value):
    try:
        return json.dumps(value, ensure_ascii=False, sort_keys=True,
            separators=(',', ':'), allow_nan=False).encode('utf-8')
    except (UnicodeError, ValueError, TypeError, RecursionError):
        raise PackagingError('Declaration contains invalid JSON values') from None


def pointer(value, path):
    if path == '':
        return value
    if type(path) is not str or not path.startswith('/') or len(path) > 4096:
        raise PackagingError('Invalid JSON Pointer')
    try:
        for token in path[1:].split('/'):
            if re.search('~(?![01])', token):
                raise PackagingError('Invalid JSON Pointer escape')
            key = token.replace('~1', '/').replace('~0', '~')
            if type(value) is list:
                if re.fullmatch('0|[1-9][0-9]*', key) is None:
                    raise PackagingError('Invalid JSON Pointer array index')
                value = value[int(key)]
            else:
                value = value[key]
        return value
    except (KeyError, IndexError, TypeError):
        raise PackagingError('JSON Pointer does not resolve') from None


class SourceTree:
    def __init__(self, root, parameters):
        self.root = Path(root).resolve(strict=True)
        self.parameters = parameters
        self.cache = {}
        self.byte_cache = {}
        self.modes = {}

    def read_bytes(self, path):
        if (type(path) is not str or '\\' in path
                or any(ord(c) < 32 or ord(c) == 127 for c in path)
                or any(part in ('', '.', '..') for part in path.split('/'))):
            raise PackagingError('Include must be a normalized package-relative file')
        if path in self.byte_cache:
            return self.byte_cache[path]
        flags = os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_CLOEXEC
        directory = os.open(self.root, flags)
        descriptor = None
        try:
            parts = path.split('/')
            for part in parts[:-1]:
                child = os.open(part, flags, dir_fd=directory)
                os.close(directory)
                directory = child
            descriptor = os.open(parts[-1], os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK | os.O_CLOEXEC, dir_fd=directory)
            before = os.fstat(descriptor)
            if not stat.S_ISREG(before.st_mode):
                raise PackagingError('Include is not a regular file')
            with os.fdopen(descriptor, 'rb') as source:
                descriptor = None
                data = source.read()
                after = os.fstat(source.fileno())
            if (before.st_size, before.st_mtime_ns, before.st_ctime_ns) != (
                    after.st_size, after.st_mtime_ns, after.st_ctime_ns) or len(data) != after.st_size:
                raise PackagingError('Source changed while being read: ' + path)
            self.byte_cache[path] = data
            self.modes[path] = 0o755 if before.st_mode & 0o111 else 0o644
            return data
        except OSError:
            raise PackagingError('Package include is unavailable or follows a link: ' + path) from None
        finally:
            if descriptor is not None:
                os.close(descriptor)
            os.close(directory)

    def read(self, path):
        if type(path) is str and path in self.cache:
            return self.cache[path]
        try:
            content = self.read_bytes(path).decode('utf-8')
        except UnicodeError:
            raise PackagingError('Declaration files must be UTF-8') from None
        if path.endswith('.py'):
            try:
                compile(content, path, 'exec')
            except SyntaxError:
                raise PackagingError('Python artifact has invalid syntax') from None
        self.cache[path] = content
        return content

    def json(self, path):
        return decode(self.read(path))

    def expand(self, value, depth=0):
        if depth > 64:
            raise PackagingError('Template depth limit exceeded')
        if type(value) is list:
            result = []
            for item in value:
                if type(item) is dict and set(item) == {'$when'}:
                    condition = item['$when']
                    if type(condition) is not dict or set(condition) != {'parameter', 'value'}:
                        raise PackagingError('Invalid conditional list item')
                    enabled = pointer(self.parameters, condition['parameter'])
                    if type(enabled) is not bool:
                        raise PackagingError('Conditional parameter must be boolean')
                    if not enabled:
                        continue
                    item = condition['value']
                result.append(self.expand(item, depth + 1))
            return result
        if type(value) is not dict:
            return value
        if set(value) == {'$file'}:
            return self.read(value['$file'])
        if set(value) == {'$json'}:
            include = value['$json']
            if type(include) is not dict or set(include) - {'path', 'pointer'} or 'path' not in include:
                raise PackagingError('Invalid JSON include')
            # Included JSON is data, not another instruction stream.
            return deepcopy(pointer(self.json(include['path']), include.get('pointer', '')))
        if set(value) == {'$parameter'}:
            return deepcopy(pointer(self.parameters, value['$parameter']))
        if set(value) == {'$module'}:
            return Reference(value['$module'])
        if set(value) == {'$when'}:
            raise PackagingError('Conditional expressions require a template list item')
        return {key: self.expand(item, depth + 1) for key, item in value.items()}


def resolve_modules(document):
    modules = document.get('modules')
    if type(modules) is not list or not 1 <= len(modules) <= 1024:
        raise PackagingError('Expected 1..1024 declared modules')
    definitions = {}
    for module in modules:
        if type(module) is not dict or not isinstance(module.get('reference'), Reference):
            raise PackagingError('Module definitions require explicit $module references')
        identifier = module['reference'].identifier
        if identifier in definitions:
            raise PackagingError('Duplicate module identifier')
        definitions[identifier] = module
    versions, active = {}, set()
    def materialize(value):
        if isinstance(value, Reference):
            return {'id': value.identifier, 'version': version(value.identifier)}
        if type(value) is dict:
            return {key: materialize(item) for key, item in value.items()}
        if type(value) is list:
            return [materialize(item) for item in value]
        return value
    def version(identifier):
        if identifier in versions:
            return versions[identifier]
        if identifier not in definitions or identifier in active or len(active) >= 128:
            raise PackagingError('Unknown or cyclic module dependency')
        active.add(identifier)
        body = {key: materialize(value) for key, value in definitions[identifier].items() if key != 'reference'}
        body['id'] = identifier
        versions[identifier] = hashlib.sha256(encode(body)).hexdigest()
        active.remove(identifier)
        return versions[identifier]
    return materialize(document)


def validate_settings(settings, schema):
    if type(settings) is not dict or set(settings) - set(schema['properties']):
        raise PackagingError('Unknown settings fields')
    result = {key: deepcopy(value['default']) for key, value in schema['properties'].items() if 'default' in value}
    result.update(deepcopy(settings))
    if not set(schema['required']) <= set(result):
        raise PackagingError('Missing required settings')
    types = {'string': str, 'object': dict, 'integer': int, 'boolean': bool}
    for key, value in result.items():
        constraint = schema['properties'][key]
        if type(value) is not types[constraint['type']]:
            raise PackagingError('Invalid settings type: ' + key)
        if type(value) is str and (not value or len(value.encode('utf-8')) > constraint.get('maxLength', 4096)):
            raise PackagingError('Invalid settings string: ' + key)
        if type(value) is int and not constraint.get('minimum', 0) <= value <= constraint.get('maximum', 2 ** 63 - 1):
            raise PackagingError('Settings number outside its bounds: ' + key)
        if 'enum' in constraint and value not in constraint['enum']:
            raise PackagingError('Unknown settings choice: ' + key)
    path = result['workspace']
    if not path.startswith('/') or path == '/' or any(part in ('', '.', '..') for part in path[1:].split('/')) or '\\' in path or any(ord(c) < 32 for c in path):
        raise PackagingError('workspace must be an explicit canonical absolute path')
    if result['terminal_enabled'] and 'process_tree' not in result:
        raise PackagingError('Command execution requires explicit process_tree configuration')
    if not result['terminal_enabled'] and 'process_tree' in result:
        raise PackagingError('process_tree is unused while command execution is disabled')
    if not result['terminal_enabled'] and 'command_environment' in result:
        raise PackagingError('command_environment is unused while command execution is disabled')
    encode(result)
    return result


def connection(settings, profile):
    supplied = settings['connection']
    allowed = {'base_url', 'models', 'headers', 'header_credentials', 'query', 'tls',
               'proxy_url', 'allow_insecure_http', 'timeout_ms', 'idle_timeout_ms',
               'max_concurrency', 'endpoint_limits'}
    if set(supplied) - allowed:
        raise PackagingError('Unknown native connection field')
    if (type(supplied.get('models')) is not list or not 1 <= len(supplied['models']) <= 1024
            or any(type(model) is not str or not model.strip() or len(model.encode('utf-8')) > 256 for model in supplied['models'])
            or len(set(supplied['models'])) != len(supplied['models']) or settings['model'] not in supplied['models']):
        raise PackagingError('Selected model must be explicitly admitted by the connection')
    for field in ('headers', 'query', 'header_credentials'):
        value = supplied.get(field, {})
        if type(value) is not dict or any(type(name) is not str for name in value):
            raise PackagingError('Invalid connection field: ' + field)
        if field != 'header_credentials' and any(type(item) is not str for item in value.values()):
            raise PackagingError('Connection values must be strings: ' + field)
    result = deepcopy(profile['connection'])
    result.update(supplied)
    result['headers'] = {**profile['connection'].get('headers', {}), **supplied.get('headers', {})}
    sensitive = {'authorization', 'proxy-authorization', 'x-api-key', 'api-key', 'cookie'}
    if any(name.lower() in sensitive for name in result['headers']):
        raise PackagingError('Authentication headers must use credential references')
    if any(name.lower() in {'key', 'api_key', 'token', 'access_token'} for name in result.get('query', {})):
        raise PackagingError('Authentication query values must not be embedded')
    for value in result.get('header_credentials', {}).values():
        if (type(value) is not dict or set(value) - {'reference', 'prefix'}
                or type(value.get('reference')) is not str
                or re.fullmatch('[A-Za-z0-9_]{1,128}', value['reference']) is None
                or type(value.get('prefix', '')) is not str):
            raise PackagingError('Invalid credential reference')
    try:
        if type(result.get('base_url')) is not str:
            raise PackagingError('Invalid connection URL')
        endpoint = urlsplit(result['base_url'])
        if (not endpoint.hostname or endpoint.username is not None or endpoint.password is not None
                or endpoint.query or endpoint.fragment or not endpoint.path.endswith('/') or '%' in endpoint.path
                or endpoint.scheme not in ('https', 'http')
                or endpoint.scheme == 'http' and result.get('allow_insecure_http') is not True):
            raise PackagingError('Connection requires an explicit canonical HTTPS directory or HTTP opt-in')
    except (KeyError, TypeError, ValueError):
        raise PackagingError('Invalid connection URL') from None
    return result


def runtime_requirement(value):
    if type(value) is not dict or set(value) != {'manifest', 'source'}:
        raise PackagingError('Runtime dependency must contain only manifest and source, never payloads')
    manifest = deepcopy(value['manifest'])
    allowed = {'schema_version', 'id', 'platform', 'executable', 'loader', 'library_dirs',
               'prefix_args', 'env', 'files'}
    if (type(manifest) is not dict or set(manifest) - allowed
            or not {'schema_version', 'id', 'platform', 'executable', 'files'} <= set(manifest)
            or type(manifest['schema_version']) is not int or manifest['schema_version'] != 1):
        raise PackagingError('A native locked runtime manifest is required')
    for key, default in (('loader', None), ('library_dirs', []), ('prefix_args', []), ('env', {})):
        manifest.setdefault(key, default)
    identifier = lambda text: type(text) is str and re.fullmatch('[A-Za-z0-9_-]{1,128}', text) is not None
    digest = lambda text: type(text) is str and re.fullmatch('[0-9a-f]{64}', text) is not None
    def path(text, root=False):
        return (type(text) is str and (root and text == '.' or bool(text)
            and len(text.encode('utf-8')) <= 256 and '\\' not in text
            and not any(ord(c) < 32 or ord(c) == 127 for c in text)
            and not any(part in ('', '.', '..') for part in text.split('/'))))
    if (not identifier(manifest['id']) or type(manifest['platform']) is not str
            or not manifest['platform'] or not path(manifest['executable'])
            or manifest['loader'] is not None and not path(manifest['loader'])
            or type(manifest['library_dirs']) is not list or not all(path(item, True) for item in manifest['library_dirs'])
            or type(manifest['prefix_args']) is not list
            or any(type(item) is not str or '\0' in item for item in manifest['prefix_args'])):
        raise PackagingError('Runtime dependency manifest identity, paths or arguments are invalid')
    if (type(manifest['env']) is not dict
            or any(type(name) is not str or name.startswith('NOFY_DIRECTORY_') for name in manifest['env'])
            or type(manifest['files']) is not dict or not manifest['files']):
        raise PackagingError('Runtime dependency has invalid files or a reserved directory environment')
    for name, file in manifest['files'].items():
        if (not path(name) or type(file) is not dict or set(file) != {'digest', 'size', 'executable'}
                or not digest(file['digest']) or type(file['size']) is not int
                or not 0 <= file['size'] <= 18446744073709551615 or type(file['executable']) is not bool):
            raise PackagingError('Dependency files contain invalid metadata or embedded payloads')
    if any(name is not None and not manifest['files'].get(name, {}).get('executable')
           for name in (manifest['executable'], manifest['loader'])):
        raise PackagingError('Runtime dependency executable or loader is absent from its lock')
    for environment in manifest['env'].values():
        if (type(environment) is not dict or environment.get('kind') not in ('literal', 'path')
                or environment['kind'] == 'literal' and (set(environment) != {'kind', 'value'}
                    or type(environment['value']) is not str or '\0' in environment['value'])
                or environment['kind'] == 'path' and (set(environment) != {'kind', 'path'} or not path(environment['path'], True))):
            raise PackagingError('Runtime dependency environment must contain only explicit metadata')
    # Native ImageManifest omits an absent loader when computing its identity.
    if manifest['loader'] is None:
        del manifest['loader']
    source = deepcopy(value['source'])
    if type(source) is not dict or set(source) != {'command_id', 'source', 'policy_digest', 'path', 'attestation'}:
        raise PackagingError('Runtime dependency requires an explicit native acquisition lock')
    if (not identifier(source['command_id']) or not identifier(source['source'])
            or not digest(source['policy_digest']) or type(source['path']) is not str
            or re.fullmatch('[A-Za-z0-9/._-]+', source['path']) is None
            or any(part in ('', '.', '..') for part in source['path'].split('/'))):
        raise PackagingError('Runtime dependency origin, identity or normalized object path is invalid')
    attestation = source['attestation']
    if (type(attestation) is not dict
            or set(attestation) != {'manifest_digest', 'payload_digest', 'payload_size', 'key_id', 'signature'}
            or not digest(attestation['manifest_digest']) or not digest(attestation['payload_digest'])
            or not identifier(attestation['key_id']) or type(attestation['payload_size']) is not int
            or not 1 <= attestation['payload_size'] <= 18446744073709551615):
        raise PackagingError('Runtime dependency attestation is invalid')
    try:
        signature = base64.b64decode(attestation['signature'], validate=True)
        if len(signature) != 64 or base64.b64encode(signature).decode('ascii') != attestation['signature']:
            raise ValueError('Invalid signature encoding')
    except (ValueError, TypeError):
        raise PackagingError('Runtime dependency requires a canonical Ed25519 signature') from None
    if hashlib.sha256(encode(manifest)).hexdigest() != attestation['manifest_digest']:
        raise PackagingError('Runtime dependency manifest differs from its exact source lock')
    return manifest, source


def compile_preset(root, settings, dependency_lock=None):
    source = SourceTree(root, {})
    preset = source.json('preset.json')
    if preset.get('format') != 'nofy.preset/v1' or set(preset) != {'format', 'system'}:
        raise PackagingError('Unsupported preset source format')
    parameters = validate_settings(settings, source.json('settings.schema.json'))
    manifest = source.json('modules/files/manifest.json')
    profiles = source.json('modules/models/manifest.json')['profiles']
    profile = profiles[parameters['profile']]
    parameters['connection'] = connection(parameters, profile)
    parameters['protocol_config'] = deepcopy(profile['protocol'])
    sources = []
    if dependency_lock is None:
        if 'environment' not in parameters:
            raise PackagingError('Deployment requires an explicit user-provisioned environment; source packing requires no settings')
        parameters['runtime_factory'] = 'resource.process_local'
        parameters['runtime_config'] = deepcopy(parameters['environment'])
        parameters['terminal_runtime_factory'] = 'resource.process_local'
        parameters['terminal_runtime_config'] = deepcopy(parameters.get('command_environment', parameters['environment']))
    else:
        if 'environment' in parameters or 'command_environment' in parameters:
            raise PackagingError('Choose a local environment or an explicit dependency lock, not both')
        if (type(dependency_lock) is not dict or set(dependency_lock) != {'format', 'runtimes'}
                or dependency_lock['format'] != 'nofy.dependencies/v1'
                or type(dependency_lock['runtimes']) is not dict
                or not {'files'} <= set(dependency_lock['runtimes']) <= {'files', 'command'}):
            raise PackagingError('Invalid explicit dependency lock; dependency bytes are not package input')
        dependencies = dependency_lock['runtimes']
        image_manifest, image_source = runtime_requirement(dependencies['files'])
        parameters['runtime_factory'] = 'resource.process_locked'
        parameters['runtime_config'] = {'manifest': image_manifest}
        parameters['terminal_runtime_factory'] = 'resource.process_locked'
        parameters['terminal_runtime_config'] = {'manifest': deepcopy(image_manifest)}
        sources.append(image_source)
        if parameters['terminal_enabled']:
            command_manifest, command_source = runtime_requirement(dependencies.get('command', dependencies['files']))
            parameters['terminal_runtime_config'] = {'manifest': command_manifest}
            if command_manifest != image_manifest:
                sources.append(command_source)
            elif command_source != image_source:
                raise PackagingError('Identical dependency manifests have contradictory source locks')
        elif 'command' in dependencies:
            raise PackagingError('Command dependency is unused while command execution is disabled')
    tools = list(manifest['tools'].values())
    if parameters['terminal_enabled']:
        tools.append(source.json('modules/command/manifest.json')['tool'])
    parameters['read_tools'] = [tool['contract']['name'] for tool in tools if tool['contract']['effect'] == 'read_only']
    parameters['write_tools'] = [tool['contract']['name'] for tool in tools if tool['contract']['effect'] != 'read_only']
    parameters['all_tools'] = [tool['contract']['name'] for tool in tools] + ['skill']
    source.parameters = parameters
    system = resolve_modules(source.expand(preset['system']))
    return {'format': 'nofy.deployment/v2', 'system': system, 'runtime_sources': sources}


def pack_sources(root):
    """Archive declared source bytes without probing or installing dependencies."""
    source = SourceTree(root, {})
    paths = source.json('source-files.json')
    required = {'source-files.json', 'preset.json', 'build.py', 'requirements.txt',
                'settings.schema.json', 'modules/files/manifest.json', 'modules/models/manifest.json'}
    if (type(paths) is not list or any(type(path) is not str for path in paths)
            or len(set(paths)) != len(paths) or not required <= set(paths)):
        raise PackagingError('Source list must contain unique paths and the project entry files')

    def references(value):
        if type(value) is list:
            for item in value:
                references(item)
        elif type(value) is dict:
            if set(value) == {'$file'}:
                path = value['$file']
            elif set(value) == {'$json'}:
                include = value['$json']
                path = include.get('path') if type(include) is dict else None
            else:
                for item in value.values():
                    references(item)
                return
            if type(path) is not str or path not in paths:
                raise PackagingError('Template source is absent from source-files.json: ' + str(path))

    # Check all branches for missing source; do not evaluate settings or included data.
    references(source.json('preset.json'))
    output = io.BytesIO()
    with gzip.GzipFile(filename='', mode='wb', fileobj=output, mtime=0) as compressed:
        with tarfile.open(fileobj=compressed, mode='w', format=tarfile.PAX_FORMAT) as archive:
            for path in sorted(paths):
                data = source.read_bytes(path)
                info = tarfile.TarInfo('coding/' + path)
                info.size = len(data)
                info.mode = source.modes[path]
                archive.addfile(info, io.BytesIO(data))
    return output.getvalue()


def read_json(path):
    with Path(path).open('rb') as source:
        return decode(source.read())


def publish(path, data):
    target = Path(path)
    with tempfile.NamedTemporaryFile(prefix='.nofy-package-', dir=target.parent, delete=False) as temporary:
        name = temporary.name
        try:
            temporary.write(data)
            temporary.flush()
            os.fsync(temporary.fileno())
            os.link(name, target, follow_symlinks=False)
            directory = os.open(target.parent, os.O_RDONLY | os.O_DIRECTORY | os.O_CLOEXEC)
            try:
                os.fsync(directory)
            finally:
                os.close(directory)
        finally:
            os.unlink(name)


def main():
    parser = argparse.ArgumentParser(description='Pack source files; external dependencies are user-managed')
    parser.add_argument('--settings', help='Optional native deployment mode: non-secret settings JSON')
    parser.add_argument('--dependency-lock', help='Optional native deployment mode: explicit runtime source lock')
    parser.add_argument('--output', required=True, help='Create a source tar.gz (or explicit native deployment), never overwrite')
    args = parser.parse_args()
    if args.dependency_lock and not args.settings:
        parser.error('--dependency-lock requires --settings; source packing requires neither')
    try:
        root = Path(__file__).resolve().parent
        if args.settings:
            deployment = compile_preset(root, read_json(args.settings),
                read_json(args.dependency_lock) if args.dependency_lock else None)
            data = encode(deployment) + b'\n'
        else:
            data = pack_sources(root)
        publish(args.output, data)
    except (PackagingError, OSError, TypeError, KeyError, UnicodeError) as error:
        parser.exit(1, 'Packaging failed: ' + (str(error) if isinstance(error, PackagingError) else type(error).__name__) + '\n')
    print('Packed native deployment; validate and apply it with the kernel.' if args.settings else
          'Packed source archive; external dependencies are managed by the user.')


if __name__ == '__main__':
    main()
