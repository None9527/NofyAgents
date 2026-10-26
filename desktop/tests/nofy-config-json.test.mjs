import test from 'node:test';
import assert from 'node:assert/strict';
import { chmodSync, mkdtempSync, readFileSync, statSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// JSON 体系：config.json 与内核 parse 规则对齐（平铺 model + 供应商嵌套 models 子表）。
const FIXTURE = {
  models: { default: 'qwen3.8-max' },
  model_providers: {
    dashscope: {
      base_url: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      api_key: 'sk-secret',
      models: {
        'qwen3.8-max': { name: 'DashScope qwen3.8-max', context_window: 262144 },
        'qwen3-coder-plus': { name: 'DashScope qwen3-coder', context_window: 131072 },
      },
    },
  },
  model: {
    'glm-5.2': { model_provider: 'dashscope', name: 'DashScope GLM-5.2', context_window: 1000000 },
  },
};

function withJsonConfig(run) {
  const dir = mkdtempSync(join(tmpdir(), 'nofy-config-json-test-'));
  const prior = process.env.NOFY_CONFIG_TOML_PATH;
  const path = join(dir, 'config.json');
  writeFileSync(path, JSON.stringify(FIXTURE, null, 2));
  process.env.NOFY_CONFIG_TOML_PATH = path;
  return Promise.resolve()
    .then(() => import('../src/out/main/seam/nofy-config-toml.js'))
    .then(mod => run(mod, path))
    .finally(() => {
      if (prior === undefined) delete process.env.NOFY_CONFIG_TOML_PATH; else process.env.NOFY_CONFIG_TOML_PATH = prior;
      rmSync(dir, { recursive: true, force: true });
    });
}

test('json: readModelsTable merges flat and nested models with provider inheritance', () =>
  withJsonConfig(({ readModelsTable }) => {
    const table = readModelsTable();
    assert.deepEqual(table.providers.map(p => p.id), ['dashscope']);
    assert.equal(table.providers[0].apiKey, 'sk-secret');
    assert.equal(table.models.length, 3);
    const qwen = table.models.find(m => m.id === 'qwen3.8-max');
    assert.equal(qwen.providerId, 'dashscope');
    assert.equal(qwen.baseURL, 'https://dashscope.aliyuncs.com/compatible-mode/v1');
    assert.equal(qwen.contextWindow, 262144);
    const glm = table.models.find(m => m.id === 'glm-5.2');
    assert.equal(glm.providerId, 'dashscope');
    assert.equal(table.defaultId, 'qwen3.8-max');
  }));

test('json: upsertRegistryProvider writes nested models and keeps provider keys', () =>
  withJsonConfig(({ upsertRegistryProvider }, path) => {
    upsertRegistryProvider({
      id: 'dashscope',
      apiFormat: 'openai-chat-completions',
      endpoints: { baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1' },
      apiKey: '',
      models: [
        { id: 'qwen3.8-max', name: 'DashScope qwen3.8-max', contextWindow: 262144 },
        { id: 'glm-5.2', name: 'DashScope GLM-5.2', contextWindow: 1000000 },
        { id: 'brand-new', name: 'Brand New' },
      ],
    });
    const root = JSON.parse(readFileSync(path, 'utf8'));
    const prov = root.model_providers.dashscope;
    assert.equal(prov.api_key, 'sk-secret', '留空不得抹 key');
    assert.equal(prov.api_backend ?? 'chat_completions', 'chat_completions', '默认后端可不写显式键');
    assert.ok(prov.models['qwen3.8-max'], '嵌套模型保留');
    assert.deepEqual(prov.models['brand-new'], { model_provider: 'dashscope', name: 'Brand New' }, '新模型嵌套写入且不带冗余 model 键');
    assert.ok(!prov.models['qwen3-coder-plus'], '载荷缺席的嵌套模型被对账删除');
    assert.ok(root.model['glm-5.2'], '在载荷里的平铺模型保留');
  }));

test('json: removeRegistryProvider deletes provider with nested and flat members', () =>
  withJsonConfig(({ removeRegistryProvider }, path) => {
    assert.equal(removeRegistryProvider('glm-5.2'), true, '按模型 id 删平铺段');
    assert.equal(removeRegistryProvider('dashscope'), true);
    const root = JSON.parse(readFileSync(path, 'utf8'));
    assert.ok(!root.model_providers?.dashscope);
    assert.ok(!root.model?.['glm-5.2']);
    assert.equal(removeRegistryProvider('dashscope'), false);
  }));

test('json: setDefaultModel and upsertModelSection round-trip', () =>
  withJsonConfig(({ setDefaultModel, upsertModelSection, readModelsTable }, path) => {
    setDefaultModel('qwen3-coder-plus');
    assert.equal(JSON.parse(readFileSync(path, 'utf8')).models.default, 'qwen3-coder-plus');
    upsertModelSection('qwen3.8-max', { temperature: 0.5 });
    const root = JSON.parse(readFileSync(path, 'utf8'));
    assert.equal(root.model_providers.dashscope.models['qwen3.8-max'].temperature, 0.5, '嵌套模型原地更新');
    assert.equal(root.model_providers.dashscope.models['qwen3.8-max'].context_window, 262144, '兄弟键保留');
    assert.equal(readModelsTable().defaultId, 'qwen3-coder-plus');
  }));

test('json: upsertRegistryProvider drops tombstoned models and reconciles their sections away', () =>
  withJsonConfig(({ upsertRegistryProvider }, path) => {
    upsertRegistryProvider({
      id: 'dashscope',
      apiFormat: 'openai-chat-completions',
      endpoints: { baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1' },
      apiKey: 'sk-secret',
      models: [
        { id: 'qwen3.8-max', name: 'DashScope qwen3.8-max', contextWindow: 262144 },
        // 设置面「删模型后保存」语义：墓碑条目不落盘，且其段被对账删除（嵌套与平铺都覆盖）
        { id: 'qwen3-coder-plus', deleted: true },
        { id: 'glm-5.2', deleted: true },
      ],
    });
    const root = JSON.parse(readFileSync(path, 'utf8'));
    const nested = root.model_providers?.dashscope?.models ?? {};
    assert.deepEqual(Object.keys(nested), ['qwen3.8-max']);
    assert.equal(root.model?.['glm-5.2'], undefined);
    assert.equal(root.model_providers.dashscope.api_key, 'sk-secret');
  }));
test('json: atomic save keeps the config file mode so api_key stays owner-only', () =>
  withJsonConfig(({ upsertRegistryProvider, setDefaultModel }, path) => {
    chmodSync(path, 0o600);
    upsertRegistryProvider({
      id: 'dashscope',
      apiFormat: 'openai-chat-completions',
      endpoints: { baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1' },
      apiKey: '',
      models: [{ id: 'qwen3.8-max', name: 'DashScope qwen3.8-max', contextWindow: 262144 }],
    });
    assert.equal(statSync(path).mode & 0o777, 0o600, 'tmp+rename 不得把 600 换成 umask 默认的 644');
    setDefaultModel('qwen3.8-max');
    assert.equal(statSync(path).mode & 0o777, 0o600, '连续写也不放宽');
  }));
