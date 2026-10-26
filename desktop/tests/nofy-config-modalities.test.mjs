import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// 设置面「输入类型/输出类型」的落盘语义：
// modalities = { input = [...], output = [...] } 与内核 [model.<id>] 同形。
// 只有用户真正动过勾选（载荷带 modalitiesConfigured: true，对话框提交时置位）
// 或段里已声明过时才落盘；启动对账/行内提交带来的目录合成模态不得写进用户配置。
const JSON_FIXTURE = {
  models: { default: 'qwen3.8-max' },
  model_providers: {
    dashscope: {
      base_url: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
      api_key: 'sk-secret',
      models: {
        'qwen3.8-max': { name: 'DashScope qwen3.8-max', context_window: 262144 },
        'qwen-vl': {
          name: 'DashScope qwen-vl',
          context_window: 131072,
          modalities: { input: ['text', 'image'], output: ['text'] },
        },
      },
    },
  },
};

const TOML_FIXTURE = `[models]
default = "qwen3.8-max"

[model."qwen3.8-max"]
model_provider = "dashscope"
name = "DashScope qwen3.8-max"
context_window = 262144

[model."qwen-vl"]
model_provider = "dashscope"
name = "DashScope qwen-vl"
context_window = 131072
modalities = { input = ["text", "image"], output = ["text"] }

[model_providers.dashscope]
base_url = "https://dashscope.aliyuncs.com/compatible-mode/v1"
api_key = "sk-secret"
`;

function withConfig(filename, fixture, run) {
  const dir = mkdtempSync(join(tmpdir(), 'nofy-config-modalities-test-'));
  const prior = process.env.NOFY_CONFIG_TOML_PATH;
  const path = join(dir, filename);
  writeFileSync(path, typeof fixture === 'string' ? fixture : JSON.stringify(fixture, null, 2));
  process.env.NOFY_CONFIG_TOML_PATH = path;
  return Promise.resolve()
    .then(() => import('../src/out/main/seam/nofy-config-toml.js'))
    .then(mod => run(mod, path))
    .finally(() => {
      if (prior === undefined) delete process.env.NOFY_CONFIG_TOML_PATH; else process.env.NOFY_CONFIG_TOML_PATH = prior;
      rmSync(dir, { recursive: true, force: true });
    });
}

function saveProvider(mod, models) {
  mod.upsertRegistryProvider({
    id: 'dashscope',
    apiFormat: 'openai-chat-completions',
    endpoints: { baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1' },
    apiKey: '',
    models,
  });
}

/** 原文里某个模型段是否写了 modalities（JSON 看嵌套键，TOML 看段内行）。 */
function rawSectionHasModalities(path, id) {
  if (path.endsWith('.json')) {
    const root = JSON.parse(readFileSync(path, 'utf8'));
    const entry = root.model_providers?.dashscope?.models?.[id] ?? root.model?.[id];
    return entry ? 'modalities' in entry : false;
  }
  const lines = readFileSync(path, 'utf8').split('\n');
  const head = new RegExp(`^\\[model\\.("?)${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\1\\]\\s*$`);
  const start = lines.findIndex(l => head.test(l.trim()));
  if (start < 0) return false;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^\[/.test(lines[i].trim())) return false;
    if (/^modalities\s*=/.test(lines[i].trim())) return true;
  }
  return false;
}

const FORMATS = [
  ['json', run => withConfig('config.json', JSON_FIXTURE, run)],
  ['toml', run => withConfig('config.toml', TOML_FIXTURE, run)],
];

for (const [label, withCfg] of FORMATS) {
  test(`${label}: readModelsTable surfaces declared modalities`, () =>
    withCfg(({ readModelsTable }) => {
      const models = readModelsTable().models;
      assert.deepEqual(
        models.find(m => m.id === 'qwen-vl').modalities,
        { input: ['text', 'image'], output: ['text'] },
      );
      assert.equal(
        models.find(m => m.id === 'qwen3.8-max').modalities,
        undefined,
        '未声明的段不得凭空长出 modalities',
      );
    }));

  test(`${label}: dialog-configured modalities persist, reconciliation noise does not`, () =>
    withCfg((mod, path) => {
      // 对话框提交：带 modalitiesConfigured 标记
      saveProvider(mod, [
        { id: 'qwen3.8-max', name: 'DashScope qwen3.8-max', contextWindow: 262144, modalities: { input: ['text'], output: ['text'] } },
        {
          id: 'qwen-vl', name: 'DashScope qwen-vl', contextWindow: 131072,
          modalities: { input: ['text', 'image', 'pdf'], output: ['text'] }, modalitiesConfigured: true,
        },
      ]);
      let models = mod.readModelsTable().models;
      assert.deepEqual(
        models.find(m => m.id === 'qwen-vl').modalities.input,
        ['text', 'image', 'pdf'],
        '勾选的输入类型要落盘并能读回',
      );
      assert.equal(rawSectionHasModalities(path, 'qwen-vl'), true);

      // 启动对账/行内提交：无标记且段里没声明过 ⇒ 目录合成的模态不得落盘
      saveProvider(mod, [
        {
          id: 'qwen3.8-max', name: 'DashScope qwen3.8-max', contextWindow: 262144,
          modalities: { input: ['text', 'image'], output: ['text'] },
        },
        {
          id: 'qwen-vl', name: 'DashScope qwen-vl', contextWindow: 131072,
          modalities: { input: ['text', 'image', 'pdf'], output: ['text'] },
        },
      ]);
      models = mod.readModelsTable().models;
      assert.equal(
        models.find(m => m.id === 'qwen3.8-max').modalities,
        undefined,
        '无标记且未声明过的段不落盘',
      );
      assert.equal(rawSectionHasModalities(path, 'qwen3.8-max'), false);
      assert.deepEqual(
        models.find(m => m.id === 'qwen-vl').modalities.input,
        ['text', 'image', 'pdf'],
        '已声明过的段保持原值',
      );
    }));

  test(`${label}: unchecking back to text-only rewrites a previously declared section`, () =>
    withCfg((mod, path) => {
      saveProvider(mod, [
        {
          id: 'qwen-vl', name: 'DashScope qwen-vl', contextWindow: 131072,
          modalities: { input: ['text'], output: ['text'] }, modalitiesConfigured: true,
        },
      ]);
      assert.deepEqual(
        mod.readModelsTable().models.find(m => m.id === 'qwen-vl').modalities,
        { input: ['text'], output: ['text'] },
        '已声明过的段取消勾选要写回 text-only',
      );
      assert.equal(rawSectionHasModalities(path, 'qwen-vl'), true, '段里仍应留下显式声明');
    }));
}

test('json: modalities survive alongside api_key and sibling reconciliation', () =>
  withConfig('config.json', JSON_FIXTURE, (mod, path) => {
    saveProvider(mod, [
      {
        id: 'qwen-vl', name: 'DashScope qwen-vl', contextWindow: 131072,
        modalities: { input: ['text', 'video'], output: ['text'] }, modalitiesConfigured: true,
      },
    ]);
    const root = JSON.parse(readFileSync(path, 'utf8'));
    const prov = root.model_providers.dashscope;
    assert.equal(prov.api_key, 'sk-secret', '留空不得抹 key');
    assert.deepEqual(prov.models['qwen-vl'].modalities, { input: ['text', 'video'], output: ['text'] });
    assert.ok(!prov.models['qwen3.8-max'], '载荷缺席的模型照旧被对账删除');
  }));

test('toml: modalities are written as an inline table without duplicating the section', () =>
  withConfig('config.toml', TOML_FIXTURE, (mod, path) => {
    saveProvider(mod, [
      {
        id: 'qwen-vl', name: 'DashScope qwen-vl', contextWindow: 131072,
        modalities: { input: ['text', 'image'], output: ['text'] }, modalitiesConfigured: true,
      },
    ]);
    const text = readFileSync(path, 'utf8');
    assert.match(text, /modalities = \{ input = \["text", "image"\], output = \["text"\] \}/);
    assert.equal((text.match(/\[model\."qwen-vl"\]/g) ?? []).length, 1, '不得复制出重复段');
  }));
