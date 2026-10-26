import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, renameSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// 原子替换 config.toml（tmp+rename），等价于 nofy-config-toml.js 的 atomicWrite 语义，
// 触发 host 侧目录 watcher（inode 替换）而不仅是 in-place 写。
function atomicSave(path, transform) {
  const next = transform(readFileSync(path, 'utf8'));
  const tmp = `${path}.tmp-${process.pid}`;
  writeFileSync(tmp, next, 'utf8');
  renameSync(tmp, path);
}

test('registry observes two atomic saves and inherits provider context windows', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'nofy-registry-test-'));
  const prior = process.env.NOFY_CONFIG_TOML_PATH;
  try {
    const path = join(dir, 'config.toml');
    process.env.NOFY_CONFIG_TOML_PATH = path;
    writeFileSync(path, [
      '[model_providers.example]',
      'base_url="https://example.com/v1"',
      'context_window=262_144',
      'api_key="sk-example-secret"',
      '[model_providers.other]',
      'base_url="https://other.example.com/v1"',
      '[model.alias]',
      'model="upstream-model"',
      'model_provider="example"',
      '[model.solo]',
      'model="solo-model"',
      'model_provider="other"',
      '[model.orphan]',
      'model="orphan-model"',
      '',
    ].join('\n'));
    const { readModelsTable } = await import('../src/out/main/seam/nofy-config-toml.js');
    const { synthesizeKernelProviders, attachKernelProviderBridge } = await import('../src/out/host/seam/kernel-provider-source.js');
    assert.equal(readModelsTable().models[0].contextWindow, 262144);
    assert.equal(readModelsTable().models[0].baseURL, 'https://example.com/v1');
    let changed;
    attachKernelProviderBridge({}, () => changed?.());
    // 一段 [model_providers.*] 一个供应商条目；模型按 model_provider 归属；
    // 无供应商引用的模型进 nofy-kernel 兜底桶。
    const providers = await synthesizeKernelProviders();
    assert.deepEqual(providers.map(p => p.id), ['example', 'other', 'nofy-kernel']);
    assert.equal(providers[0].apiKey, 'sk-example-secret'); // 供应商段的 key 进条目，页面据此显示已配置
    assert.equal(providers[0].endpoints.baseURL, 'https://example.com/v1');
    // 注册表模型 id = 上游模型 id（ZCode 语义），段名只在内核边界翻译
    assert.deepEqual(providers[0].models.map(m => m.id), ['upstream-model']);
    assert.deepEqual(providers[1].models.map(m => m.id), ['solo-model']);
    assert.deepEqual(providers[2].models.map(m => m.id), ['orphan-model']);
    assert.equal(providers[0].models[0].contextWindow, 262144);
    for (const context_window of [131072, 65536]) {
      const event = new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(Error('config change event timed out')), 2000);
        changed = () => { clearTimeout(timer); resolve(); };
      });
      atomicSave(path, text => text.replace(/context_window=\d+(_\d+)*/, `context_window=${context_window}`));
      await event;
      assert.equal((await synthesizeKernelProviders())[0].models[0].contextWindow, context_window);
    }
  } finally {
    if (prior === undefined) delete process.env.NOFY_CONFIG_TOML_PATH; else process.env.NOFY_CONFIG_TOML_PATH = prior;
    rmSync(dir, { recursive: true, force: true });
  }
});
