"""Authoring boundaries on real source files; native image execution is in Host tests."""
from copy import deepcopy
import base64
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import shutil
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location('coding_build', ROOT / 'build.py')
build = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(build)


class PackagingTests(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)

    def test_strict_json_and_pointer(self):
        for source in ('{"a":1,"a":2}', '{"a":NaN}', '{"a":Infinity}', '{'):
            with self.assertRaises(build.PackagingError):
                build.decode(source)
        with self.assertRaises(build.PackagingError):
            build.encode(build.decode('{"a":1e999}'))
        with self.assertRaises(build.PackagingError):
            build.decode('{"a":1}'.encode('utf-16'))
        with self.assertRaises(build.PackagingError):
            build.decode('[' * 2000 + '0' + ']' * 2000)
        value = {'a/b': {'~': [1, {'exact': True}]}}
        self.assertEqual(build.pointer(value, '/a~1b/~0/1/exact'), True)
        for path in ('no-prefix', '/missing', '/a~2b', '/a~1b/~0/01', '/a~1b/~0/-'):
            with self.assertRaises(build.PackagingError):
                build.pointer(value, path)

    def test_include_is_fd_relative_regular_utf8_and_cached(self):
        (self.root / 'text').write_text('原文\n', encoding='utf-8')
        (self.root / 'alias').symlink_to(self.root / 'text')
        (self.root / 'link').symlink_to(self.root, target_is_directory=True)
        os.mkfifo(self.root / 'pipe')
        source = build.SourceTree(self.root, {})
        self.assertEqual(source.read('text'), '原文\n')
        (self.root / 'text').write_text('changed', encoding='utf-8')
        self.assertEqual(source.read('text'), '原文\n')
        for path in ('../text', '/text', 'a//b', './text', 'a/../text', 'a\\b', 'alias', 'link/text', 'pipe'):
            with self.assertRaises(build.PackagingError, msg=path):
                source.read(path)
        (self.root / 'bad').write_bytes(b'\xff')
        with self.assertRaises(build.PackagingError):
            source.read('bad')

    def test_packing_has_no_include_or_aggregate_byte_quota(self):
        source = build.SourceTree(self.root, {})
        for index in range(129):
            name = str(index) + '.txt'
            (self.root / name).write_text(name, encoding='utf-8')
            self.assertEqual(source.read(name), name)
        preset = self.root / 'preset'
        shutil.copytree(ROOT, preset, ignore=shutil.ignore_patterns('tests', '__pycache__'))
        text = 'explicit project source\n' * (33 * 1024 * 1024 // 24 + 1)
        (preset / 'prompt.md').write_text(text, encoding='utf-8')
        package = build.compile_preset(preset, self.settings(), self.lock())
        prompt = next(module for module in package['system']['modules'] if module['reference']['id'] == 'prompt')
        self.assertEqual(prompt['config']['fragments'][0]['content']['text'], text)
        self.assertGreater(len(build.encode(package)), 32 * 1024 * 1024)
        self.assertNotIn('runtime_images', package)

    def test_file_json_and_parameters_are_data_not_recursive_instructions(self):
        raw = {'id': 'business-record', 'version': 'preserve', '$file': '/not-a-package-file',
               'nested': {'$module': 'not-a-dependency'}}
        (self.root / 'record.json').write_text(json.dumps(raw), encoding='utf-8')
        (self.root / 'text').write_text('{"$file":"/not-read"}', encoding='utf-8')
        source = build.SourceTree(self.root, {'input': raw})
        self.assertEqual(source.expand({'$json': {'path': 'record.json'}}), raw)
        self.assertEqual(source.expand({'$parameter': '/input'}), raw)
        self.assertEqual(source.expand({'$file': 'text'}), '{"$file":"/not-read"}')
        self.assertIsInstance(source.expand({'$module': 'actual-reference'}), build.Reference)
        self.assertEqual(source.expand({'$module': 'data', 'other': True}), {'$module': 'data', 'other': True})

    def test_conditional_list_items_require_boolean_and_do_not_read_disabled_sources(self):
        source = build.SourceTree(self.root, {'enabled': False})
        conditional = {'$when': {'parameter': '/enabled', 'value': {'$file': 'absent.py'}}}
        self.assertEqual(source.expand(['kept', conditional]), ['kept'])
        (self.root / 'text').write_text('actual source', encoding='utf-8')
        source.parameters['enabled'] = True
        self.assertEqual(source.expand([{'$when': {'parameter': '/enabled',
            'value': {'$file': 'text'}}}]), ['actual source'])
        with self.assertRaises(build.PackagingError):
            source.expand(conditional)
        for malformed in ({}, {'parameter': '/enabled'}, {'parameter': '/missing', 'value': 1},
                          {'parameter': '/enabled', 'value': 1, 'unknown': True}):
            with self.assertRaises(build.PackagingError):
                source.expand([{'$when': malformed}])
        for value in (0, 1, 'true', None, {}, []):
            source.parameters['enabled'] = value
            with self.assertRaises(build.PackagingError):
                source.expand([conditional])
        raw = {'$when': {'parameter': '/missing', 'value': {'$file': '/outside'}}}
        source.parameters['raw'] = raw
        self.assertEqual(source.expand({'$parameter': '/raw'}), raw)

    def test_command_defaults_on_but_requires_explicit_tree_and_strict_boolean(self):
        schema = build.SourceTree(ROOT, {}).json('settings.schema.json')
        settings = self.settings()
        del settings['terminal_enabled']
        with self.assertRaises(build.PackagingError):
            build.validate_settings(settings, schema)
        configured = {**settings, 'process_tree': {'cgroup_root': '/sys/fs/cgroup/explicit/jobs'}}
        self.assertTrue(build.validate_settings(configured, schema)['terminal_enabled'])
        for update in ({'terminal_enabled': 1}, {'terminal_enabled': 'true'},
                       {'terminal_enabled': False}, {'process_tree': '/not-an-object'}):
            with self.assertRaises(build.PackagingError):
                build.validate_settings({**configured, **update}, schema)

    def test_python_is_compiled_for_syntax_but_never_executed(self):
        sentinel = self.root / 'must-not-exist'
        code = f'from pathlib import Path\nPath({str(sentinel)!r}).touch()\n'
        (self.root / 'code.py').write_text(code, encoding='utf-8')
        source = build.SourceTree(self.root, {})
        self.assertEqual(source.read('code.py'), code)
        self.assertFalse(sentinel.exists())
        (self.root / 'invalid.py').write_text('def invalid(', encoding='utf-8')
        with self.assertRaises(build.PackagingError):
            source.read('invalid.py')

    def document(self):
        ref = build.Reference
        return {'modules': [
            {'reference': ref('directory'), 'factory': 'resource.directory',
             'config': {'path': str(self.root), 'access': 'read_only'}},
            {'reference': ref('code'), 'factory': 'resource.artifact',
             'config': {'body': 'one', 'record': {'id': 'unrelated', 'version': 'literal', '$module': 'raw'}}},
            {'reference': ref('tool'), 'factory': 'tool.process_artifact',
             'dependencies': {'artifact': ref('code'), 'workspace': ref('directory')}}],
            'programs': {'entry': {'tools': [ref('tool')]}}}

    def test_versions_follow_typed_dependency_dag_not_whole_package_or_business_json(self):
        source = self.document()
        initial = build.resolve_modules(deepcopy(source))
        self.assertEqual(build.encode(initial), build.encode(build.resolve_modules(deepcopy(source))))
        source['modules'][1]['config']['body'] = 'two'
        changed = build.resolve_modules(source)
        self.assertEqual(initial['modules'][0], changed['modules'][0])
        for index in (1, 2):
            self.assertNotEqual(initial['modules'][index]['reference']['version'], changed['modules'][index]['reference']['version'])
        self.assertEqual(changed['modules'][1]['config']['record'],
                         {'id': 'unrelated', 'version': 'literal', '$module': 'raw'})
        self.assertEqual(changed['programs']['entry']['tools'][0], changed['modules'][2]['reference'])
        reordered = deepcopy(source)
        reordered['modules'].reverse()
        versions = {m['reference']['id']: m['reference'] for m in build.resolve_modules(reordered)['modules']}
        self.assertEqual(versions, {m['reference']['id']: m['reference'] for m in changed['modules']})

    def test_duplicate_unknown_cyclic_and_untyped_modules_are_rejected(self):
        duplicate = self.document()
        duplicate['modules'].append(deepcopy(duplicate['modules'][0]))
        unknown = self.document()
        unknown['modules'][2]['dependencies']['artifact'] = build.Reference('missing')
        cycle = self.document()
        cycle['modules'][0]['dependencies'] = {'back': build.Reference('tool')}
        untyped = self.document()
        untyped['modules'][0]['reference'] = {'id': 'directory', 'version': '1'}
        for source in (duplicate, unknown, cycle, untyped):
            with self.assertRaises(build.PackagingError):
                build.resolve_modules(source)

    def settings(self):
        return {'workspace': str(self.root), 'model': 'explicit-model',
                'terminal_enabled': False,
                'connection': {'base_url': 'https://example.invalid/v1/', 'models': ['explicit-model']}}

    def dependency(self, name='test-runtime', payload_size=100):
        manifest = {'schema_version': 1, 'id': name, 'platform': 'linux-x86_64',
            'executable': 'bin/runtime', 'library_dirs': [],
            'prefix_args': [], 'env': {}, 'files': {'bin/runtime': {
                'digest': hashlib.sha256(b'contract-input').hexdigest(),
                'size': len(b'contract-input'), 'executable': True}}}
        return {'manifest': manifest, 'source': {
            'command_id': 'obtain-' + name, 'source': 'declared-registry',
            'policy_digest': '1' * 64, 'path': name + '.json', 'attestation': {
                'manifest_digest': hashlib.sha256(build.encode(manifest)).hexdigest(),
                'payload_digest': '2' * 64, 'payload_size': payload_size,
                'key_id': 'test-key', 'signature': base64.b64encode(bytes(64)).decode('ascii')}}}

    def lock(self, **runtimes):
        return {'format': 'nofy.dependencies/v1', 'runtimes': runtimes or {'files': self.dependency()}}

    def test_package_contains_only_dependency_descriptions_and_uses_existing_loader_format(self):
        dependency = self.dependency(payload_size=8 * 1024 ** 3)
        package = build.compile_preset(ROOT, self.settings(), self.lock(files=dependency))
        self.assertEqual(package['format'], 'nofy.deployment/v2')
        self.assertEqual(set(package), {'format', 'system', 'runtime_sources'})
        self.assertEqual(package['runtime_sources'], [dependency['source']])
        self.assertNotIn('runtime_images', package)
        self.assertNotIn('blobs', build.encode(package).decode())
        small_dependency = deepcopy(dependency)
        small_dependency['source']['attestation']['payload_size'] = 100
        small_package = build.compile_preset(ROOT, self.settings(), self.lock(files=small_dependency))
        self.assertEqual(len(build.encode(package)) - len(build.encode(small_package)),
                         len(str(8 * 1024 ** 3)) - len(str(100)))
        self.assertEqual(list(package['system']['programs']), ['chat'])
        runtime = next(module for module in package['system']['modules'] if module['reference']['id'] == 'runtime')
        self.assertEqual(runtime['config']['manifest'], dependency['manifest'])

    def test_command_reuses_or_explicitly_selects_a_dependency_without_bundling_it(self):
        settings = {**self.settings(), 'terminal_enabled': True,
                    'process_tree': {'cgroup_root': '/sys/fs/cgroup/explicit/jobs'}}
        lock = self.lock()
        first = build.compile_preset(ROOT, settings, lock)
        self.assertEqual(len(first['runtime_sources']), 1)
        command = self.dependency('command-toolchain')
        second = build.compile_preset(ROOT, settings, self.lock(files=lock['runtimes']['files'], command=command))
        self.assertEqual(len(second['runtime_sources']), 2)
        self.assertEqual(second['runtime_sources'][1], command['source'])
        with self.assertRaises(build.PackagingError):
            build.compile_preset(ROOT, self.settings(), self.lock(files=lock['runtimes']['files'], command=command))
        conflict = deepcopy(lock['runtimes']['files'])
        conflict['source']['path'] = 'a-different-origin-object.json'
        with self.assertRaises(build.PackagingError):
            build.compile_preset(ROOT, settings, self.lock(files=lock['runtimes']['files'], command=conflict))

    def test_dependency_environment_and_omitted_defaults_preserve_native_identity(self):
        dependency = self.dependency()
        dependency['manifest']['env'] = {'PYTHONHOME': {'kind': 'path', 'path': '.'},
            'LANG': {'kind': 'literal', 'value': 'C.UTF-8'}}
        normalized = deepcopy(dependency['manifest'])
        dependency['source']['attestation']['manifest_digest'] = hashlib.sha256(build.encode(normalized)).hexdigest()
        dependency['manifest']['loader'] = None
        for field in ('library_dirs', 'prefix_args'):
            del dependency['manifest'][field]
        manifest, source = build.runtime_requirement(dependency)
        self.assertEqual(manifest, normalized)
        self.assertEqual(source, dependency['source'])
        package = build.compile_preset(ROOT, self.settings(), self.lock(files=dependency))
        runtime = next(module for module in package['system']['modules'] if module['reference']['id'] == 'runtime')
        self.assertEqual(runtime['config']['manifest'], normalized)

    def test_dependency_lock_rejects_embedded_bytes_unknown_fields_and_source_mismatch(self):
        original = self.lock()
        malformed = []
        payload = deepcopy(original)
        payload['runtimes']['files']['blobs'] = {'not': 'package-data'}
        malformed.append(payload)
        mismatch = deepcopy(original)
        mismatch['runtimes']['files']['manifest']['id'] = 'changed-without-relocking'
        malformed.append(mismatch)
        nested_payload = deepcopy(original)
        nested_payload['runtimes']['files']['manifest']['files']['bin/runtime']['payload'] = 'must-not-embed'
        malformed.append(nested_payload)
        for change in ({'signature': 'invalid'}, {'payload_size': True}, {'manifest_digest': 'x' * 64},
                       {'payload_digest': 'A' * 64}, {'unknown': 'not-declared'}):
            lock = deepcopy(original)
            lock['runtimes']['files']['source']['attestation'].update(change)
            malformed.append(lock)
        for lock in malformed:
            with self.assertRaises(build.PackagingError):
                build.compile_preset(ROOT, self.settings(), lock)
        for value in ({}, {'format': 'other', 'runtimes': {}},
                      {'format': 'nofy.dependencies/v1', 'runtimes': {'unused': self.dependency()}}):
            with self.assertRaises(build.PackagingError):
                build.compile_preset(ROOT, self.settings(), value)

    def test_settings_are_explicit_and_bool_is_not_a_step_count(self):
        schema = build.SourceTree(ROOT, {}).json('settings.schema.json')
        settings = self.settings()
        result = build.validate_settings(settings, schema)
        self.assertEqual(result['workspace'], str(self.root))
        self.assertEqual(result['profile'], 'chat_completions')
        for update in ({'max_steps': True}, {'max_steps': 0}, {'profile': 'guess'}, {'extra': 1},
                       {'workspace': '/'}, {'workspace': str(self.root) + '/..'}, {'workspace': 'relative'}):
            with self.assertRaises(build.PackagingError):
                build.validate_settings({**settings, **update}, schema)

    def test_connection_has_explicit_protocol_and_no_literal_authentication(self):
        profile = build.SourceTree(ROOT, {}).json('modules/models/manifest.json')['profiles']['chat_completions']
        settings = self.settings()
        self.assertEqual(build.connection(settings, profile)['header_credentials']['authorization']['reference'], 'MODEL_KEY')
        for update in ({'headers': {'Authorization': 'not-a-credential-reference'}},
                       {'query': {'api_key': 'not-a-credential-reference'}},
                       {'base_url': 'http://example.invalid/v1/'},
                       {'base_url': 'https://user:password@example.invalid/v1/'},
                       {'models': ['different-model']}, {'models': [None]}, {'headers': []},
                       {'header_credentials': {'authorization': {'reference': 1}}},
                       {'unknown': 'must-not-pass'}):
            with self.assertRaises(build.PackagingError, msg=str(update)):
                build.connection({**settings, 'connection': {**settings['connection'], **update}}, profile)
        anonymous = build.connection({**settings, 'connection': {
            **settings['connection'], 'header_credentials': {}, 'base_url': 'http://127.0.0.1:1/v1/',
            'allow_insecure_http': True}}, profile)
        self.assertEqual(anonymous['header_credentials'], {})

    def test_publish_creates_private_output_without_overwrite_or_temp_leak(self):
        target = self.root / 'deployment.json'
        build.publish(target, b'first\n')
        self.assertEqual(target.read_bytes(), b'first\n')
        self.assertEqual(target.stat().st_mode & 0o777, 0o600)
        with self.assertRaises(FileExistsError):
            build.publish(target, b'second\n')
        self.assertEqual(target.read_bytes(), b'first\n')
        self.assertEqual([p.name for p in self.root.iterdir()], ['deployment.json'])

    def test_preset_has_exactly_one_native_agent_and_external_code(self):
        source = build.SourceTree(ROOT, {}).json('preset.json')
        self.assertEqual(source['format'], 'nofy.preset/v1')
        self.assertEqual(list(source['system']['programs']), ['chat'])
        self.assertEqual(source['system']['programs']['chat']['kind'], 'agent')
        modules = source['system']['modules']
        self.assertEqual(len([m for m in modules if m.get('factory') == 'tool.process_artifact']), 6)
        self.assertNotIn('resource.process', [m.get('factory') for m in modules])
        conditional = [m['$when']['value'] for m in modules if '$when' in m]
        self.assertEqual(len([m for m in conditional if m['factory'] == 'tool.process_tree_artifact']), 1)

    def test_user_provisioned_environment_needs_no_lock_or_dependency_probe(self):
        environment = {'executable': '/usr/bin/python3', 'prefix_args': ['-B'],
            'paths': [{'path': '/usr', 'execute': True}, {'path': '/lib', 'execute': True},
                      {'path': '/lib64', 'execute': True}]}
        package = build.compile_preset(ROOT, {**self.settings(), 'environment': environment})
        self.assertEqual(package['format'], 'nofy.deployment/v2')
        self.assertEqual(package['runtime_sources'], [])
        runtime = next(m for m in package['system']['modules'] if m['reference']['id'] == 'runtime')
        self.assertEqual(runtime['factory'], 'resource.process_local')
        self.assertEqual(runtime['config'], environment)
        self.assertNotIn('runtime_images', package)
        self.assertNotIn('digest', build.encode(runtime['config']).decode())
        environment['executable'] = '/user-will-install/bin/program'
        environment['paths'] = [{'path': '/user-will-install', 'execute': True}]
        # Building a declaration is independent of local machine availability.
        build.compile_preset(ROOT, {**self.settings(), 'environment': environment})

    def test_command_can_use_a_separate_user_provisioned_environment(self):
        environment = {'executable': '/usr/bin/python3', 'paths': [{'path': '/usr', 'execute': True}]}
        command = {**deepcopy(environment), 'env': {'PATH': '/usr/bin:/bin'}}
        settings = {**self.settings(), 'environment': environment, 'terminal_enabled': True,
            'process_tree': {'cgroup_root': '/sys/fs/cgroup/explicit/jobs'}, 'command_environment': command}
        package = build.compile_preset(ROOT, settings)
        runtime = next(m for m in package['system']['modules'] if m['reference']['id'] == 'terminal-runtime')
        self.assertEqual(runtime['config'], command)
        self.assertEqual(package['runtime_sources'], [])
        del settings['command_environment']
        package = build.compile_preset(ROOT, settings)
        runtime = next(m for m in package['system']['modules'] if m['reference']['id'] == 'terminal-runtime')
        self.assertEqual(runtime['config'], environment)

    def test_environment_choices_never_silently_override_each_other(self):
        environment = {'executable': '/usr/bin/python3', 'paths': [{'path': '/usr', 'execute': True}]}
        for settings in ({**self.settings(), 'environment': environment},
                         {**self.settings(), 'command_environment': environment}):
            with self.assertRaises(build.PackagingError):
                build.compile_preset(ROOT, settings, self.lock())
        with self.assertRaises(build.PackagingError):
            build.compile_preset(ROOT, self.settings())


if __name__ == '__main__':
    unittest.main()
