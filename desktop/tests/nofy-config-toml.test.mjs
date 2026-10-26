import test from 'node:test';
import assert from 'node:assert/strict';
import { chmodSync, mkdtempSync, readFileSync, statSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// 与用户真实 ~/.nofy/config.toml 同形：连接字段集中在 [model_providers.*]，
// [model.*] 只写 model_provider 引用 + 模型自身覆盖项；[models] default 指向上游 model id。
const FIXTURE = `# nofy kernel config
[models]
default = "qwen3.8-max"
web_search = "dashscope"

[model.dashscope]
model_provider = "dashscope"
model = "qwen3.8-max"
# keep this standalone comment
name = "DashScope qwen3.8-max"
context_window = 262144
temperature = 0.5

[model."glm-5.2"]
model_provider = "dashscope"
model = "glm-5.2"

[model.independent]
model = "solo-model"
base_url = "https://independent.example.com/v1"
api_backend = "responses"
hidden = true

[model_providers.dashscope]
base_url = "https://dashscope.aliyuncs.com/compatible-mode/v1"
api_key = "sk-secret"

[ui]
compact_mode = false
`;

function withConfig(run) {
  const dir = mkdtempSync(join(tmpdir(), 'nofy-config-toml-test-'));
  const prior = process.env.NOFY_CONFIG_TOML_PATH;
  const path = join(dir, 'config.toml');
  writeFileSync(path, FIXTURE);
  process.env.NOFY_CONFIG_TOML_PATH = path;
  return Promise.resolve()
    .then(() => import('../src/out/main/seam/nofy-config-toml.js'))
    .then(mod => run(mod, path))
    .finally(() => {
      if (prior === undefined) delete process.env.NOFY_CONFIG_TOML_PATH; else process.env.NOFY_CONFIG_TOML_PATH = prior;
      rmSync(dir, { recursive: true, force: true });
    });
}

test('readModelsTable inherits provider fields and resolves default by upstream model id', () =>
  withConfig(({ readModelsTable }) => {
    const table = readModelsTable();
    assert.equal(table.models.length, 3);
    const dash = table.models.find(m => m.id === 'dashscope');
    assert.equal(dash.baseURL, 'https://dashscope.aliyuncs.com/compatible-mode/v1');
    assert.equal(dash.apiBackend, 'chat_completions');
    assert.equal(dash.contextWindow, 262144);
    assert.equal(dash.hidden, false);
    const glm = table.models.find(m => m.id === 'glm-5.2');
    assert.equal(glm.baseURL, 'https://dashscope.aliyuncs.com/compatible-mode/v1');
    assert.equal(glm.contextWindow, undefined); // 供应商未设，模型也未设
    const solo = table.models.find(m => m.id === 'independent');
    assert.equal(solo.baseURL, 'https://independent.example.com/v1');
    assert.equal(solo.apiBackend, 'responses');
    assert.equal(solo.hidden, true);
    // default="qwen3.8-max" 是上游 model id，归一到段名 dashscope（UI 编码用段名）
    assert.equal(table.defaultId, 'dashscope');
  }));

test('readModelsTable falls back to first visible section when [models] default is missing', () =>
  withConfig(({ readModelsTable }, path) => {
    writeFileSync(path, readFileSync(path, 'utf8').replace('default = "qwen3.8-max"\n', ''));
    const table = readModelsTable();
    assert.equal(table.defaultId, 'dashscope'); // 首个非 hidden 段，跳过 hidden 的 independent
  }));

test('upsertModelSection edits only the target keys, keeps comments and provider grouping', () =>
  withConfig(({ upsertModelSection }, path) => {
    upsertModelSection('dashscope', { temperature: 0.7, name: 'DashScope qwen3.8-max（改名）' });
    const text = readFileSync(path, 'utf8');
    assert.match(text, /temperature = 0\.7/);
    assert.match(text, /name = "DashScope qwen3\.8-max（改名）"/);
    assert.match(text, /# keep this standalone comment/); // 独立注释行原样保留
    assert.match(text, /\[model\.dashscope\]\nmodel_provider = "dashscope"/); // 引用行原样保留
    assert.match(text, /\[model_providers\.dashscope\]\nbase_url = "https:\/\/dashscope\.aliyuncs\.com/); // 供应商段未被误改
    assert.match(text, /\[model\.independent\]\nmodel = "solo-model"/);
  }));

test('upsertModelSection on a new id appends a quoted section and stays provider-aware', () =>
  withConfig(({ upsertModelSection, readModelsTable }, path) => {
    upsertModelSection('glm-6.1', { model_provider: 'dashscope', model: 'glm-6.1', name: 'GLM 6.1' });
    const text = readFileSync(path, 'utf8');
    assert.match(text, /\[model\."glm-6\.1"\]\nmodel_provider = "dashscope"\nmodel = "glm-6\.1"\nname = "GLM 6\.1"/);
    const table = readModelsTable();
    assert.equal(table.models.find(m => m.id === 'glm-6.1').baseURL, 'https://dashscope.aliyuncs.com/compatible-mode/v1');
  }));

test('upsertModelSection never matches the model_providers section with the same id', () =>
  withConfig(({ upsertModelSection }, path) => {
    // 同名段同时存在 [model.x] 与 [model_providers.x] 时，写模型键不得落到供应商段
    writeFileSync(path, readFileSync(path, 'utf8') + '\n[model_providers.independent]\nbase_url = "https://provider.example.com"\n');
    upsertModelSection('independent', { temperature: 0.9 });
    const text = readFileSync(path, 'utf8');
    const providerSection = text.slice(text.indexOf('[model_providers.independent]'));
    assert.ok(!providerSection.includes('temperature'));
    assert.match(text, /\[model\.independent\][\s\S]*?temperature = 0.9/);
  }));

test('provider section read/write/remove keeps the grouped structure', () =>
  withConfig(({ readProviderSection, upsertProviderSection, removeProviderSection, readModelsTable }, path) => {
    assert.equal(readProviderSection('dashscope').base_url, 'https://dashscope.aliyuncs.com/compatible-mode/v1');
    assert.equal(readProviderSection('dashscope').api_key, 'sk-secret');
    upsertProviderSection('dashscope', { base_url: 'https://dashscope.aliyuncs.com/compatible-mode/v2', api_backend: 'responses' });
    const text = readFileSync(path, 'utf8');
    assert.match(text, /\[model_providers\.dashscope\]\nbase_url = "https:\/\/dashscope\.aliyuncs\.com\/compatible-mode\/v2"\napi_key = "sk-secret"\napi_backend = "responses"/);
    assert.match(text, /\[model\.dashscope\]\nmodel_provider = "dashscope"/); // 模型段未被串写
    assert.equal(readModelsTable().models.find(m => m.id === 'dashscope').apiBackend, 'responses');
    // 仍有模型引用时由调用方（适配器）拒绝；此处只验证段删除本身
    assert.equal(removeProviderSection('dashscope'), true);
    assert.ok(!readFileSync(path, 'utf8').includes('[model_providers.dashscope]'));
    assert.equal(removeProviderSection('dashscope'), false);
  }));

test('upsertRegistryProvider writes grouped structure, preserves key, reconciles removed models', () =>
  withConfig(({ upsertRegistryProvider, readProviderSection, readModelsTable }, path) => {
    upsertRegistryProvider({
      id: 'dashscope',
      apiFormat: 'openai-chat-completions',
      endpoints: { baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1' },
      apiKey: '', // 留空不得抹掉供应商段现有 key
      models: [{ id: 'qwen3.8-max', name: 'DashScope qwen3.8-max', contextWindow: 262144 }],
    });
    const text = readFileSync(path, 'utf8');
    assert.equal(readProviderSection('dashscope').api_key, 'sk-secret');
    assert.match(text, /\[model\.dashscope\]\nmodel_provider = "dashscope"\nmodel = "qwen3\.8-max"/);
    const sec = text.slice(text.indexOf('[model.dashscope]'), text.indexOf('[model.independent]'));
    assert.ok(!sec.includes('base_url'), '模型段不得重复连接字段');
    assert.ok(!text.includes('[model."glm-5.2"]'), '载荷里缺席的同供应商模型段应被对账删除');
    assert.match(text, /\[model\.independent\]/, '无供应商引用的模型段不受对账影响');
    assert.deepEqual(readModelsTable().models.map(m => m.id).sort(), ['dashscope', 'independent']);
  }));

test('removeRegistryProvider deletes provider with its models, and lone models by upstream id', () =>
  withConfig(({ removeRegistryProvider, readModelsTable }, path) => {
    assert.equal(removeRegistryProvider('glm-5.2'), true); // 上游模型 id → 删对应模型段
    assert.equal(readModelsTable().models.length, 2);
    assert.equal(removeRegistryProvider('dashscope'), true); // 供应商段 + 旗下模型段
    const text = readFileSync(path, 'utf8');
    assert.ok(!text.includes('[model_providers.dashscope]'));
    assert.ok(!text.includes('[model.dashscope]'));
    assert.match(text, /\[model\.independent\]/);
    assert.equal(removeRegistryProvider('dashscope'), false);
  }));

test('new model section inserts grouped with its provider, not at EOF', () =>
  withConfig(({ upsertModelSection }, path) => {
    upsertModelSection('brand-new', { model_provider: 'dashscope', model: 'brand-new-upstream' });
    const text = readFileSync(path, 'utf8');
    const prov = text.indexOf('[model_providers.dashscope]');
    const mine = text.indexOf('[model.brand-new]');
    const ui = text.indexOf('[ui]');
    assert.ok(prov !== -1 && mine !== -1 && ui !== -1);
    assert.ok(mine > prov && mine < ui, '新模型段应插在同供应商分组内而非文件尾');
    assert.match(text, /\[model\.brand-new\]\nmodel_provider = "dashscope"\nmodel = "brand-new-upstream"/);
  }));

test('section name is the upstream model id when model field absent', () =>
  withConfig(({ readModelsTable, upsertRegistryProvider }, path) => {
    // 把 fixture 重构成新结构：段名=上游模型 id、无 model 行
    writeFileSync(path, readFileSync(path, 'utf8')
      .replace('[model.dashscope]', '[model."qwen3.8-max"]')
      .replace('model = "qwen3.8-max"\n', ''));
    const table = readModelsTable();
    assert.equal(table.models.find(m => m.id === 'qwen3.8-max').model, 'qwen3.8-max');
    assert.equal(table.defaultId, 'qwen3.8-max');
    upsertRegistryProvider({
      id: 'dashscope',
      apiFormat: 'openai-chat-completions',
      endpoints: { baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1' },
      models: [
        { id: 'qwen3.8-max', name: 'DashScope qwen3.8-max', contextWindow: 262144 },
        { id: 'glm-5.2', name: 'DashScope GLM-5.2', contextWindow: 1000000 },
      ],
    });
    const text = readFileSync(path, 'utf8');
    const sec = text.slice(text.indexOf('[model."qwen3.8-max"]'), text.indexOf('[model."glm-5.2"]'));
    assert.ok(!sec.includes('model ='), '段名即上游 id 时保存不得复活 model 行');
    const provSec = text.slice(text.indexOf('[model_providers.dashscope]'), text.indexOf('[ui]'));
    assert.ok(!provSec.includes('api_backend'), '默认后端不写多余行');
  }));

test('upsert into a quoted section must not create a duplicate bare section', () =>
  withConfig(({ upsertModelSection }, path) => {
    upsertModelSection('glm-5.2', { context_window: 999999 });
    const text = readFileSync(path, 'utf8');
    assert.equal((text.match(/^\[model\."?glm-5\.2"?\]$/gm) || []).length, 1, '引号/裸名是同一段');
    assert.match(text, /context_window = 999999/);
  }));

test('setDefaultModel rewrites [models] default in place', () =>
  withConfig(({ setDefaultModel }, path) => {
    setDefaultModel('glm-5.2');
    const text = readFileSync(path, 'utf8');
    assert.match(text, /\[models\]\ndefault = "glm-5.2"\nweb_search = "dashscope"/);
  }));

test('removeModelSection deletes the section and keeps the rest of the file', () =>
  withConfig(({ removeModelSection, readModelsTable }, path) => {
    assert.equal(removeModelSection('glm-5.2'), true);
    const text = readFileSync(path, 'utf8');
    assert.ok(!text.includes('[model."glm-5.2"]'));
    assert.match(text, /\[model_providers\.dashscope\]/);
    assert.equal(readModelsTable().models.length, 2);
    assert.equal(removeModelSection('glm-5.2'), false); // 幂等：不存在返回 false
  }));

test('toml: atomic save keeps the config file mode so api_key stays owner-only', () =>
  withConfig(({ upsertRegistryProvider }, path) => {
    chmodSync(path, 0o600);
    upsertRegistryProvider({
      id: 'dashscope',
      apiFormat: 'openai-chat-completions',
      endpoints: { baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1' },
      apiKey: '',
      models: [{ id: 'qwen3.8-max', name: 'DashScope qwen3.8-max', contextWindow: 262144 }],
    });
    assert.equal(statSync(path).mode & 0o777, 0o600, 'tmp+rename 不得把 600 换成 umask 默认的 644');
    assert.match(readFileSync(path, 'utf8'), /# keep this standalone comment/, '注释照旧原地保留');
  }));
