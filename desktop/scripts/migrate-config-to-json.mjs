// 一次性迁移：~/.nofy/config.toml（平铺 [model.*] + model_provider 引用）
// → ~/.nofy/config.json（供应商嵌套 models 子表）。原 toml 改名 .bak 保留。
// 用法：node desktop/scripts/migrate-config-to-json.mjs [--dry-run]
import { readFileSync, writeFileSync, renameSync, existsSync, chmodSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { parse } from '../src/out/main/seam/toml-parser.js';

const home = process.env.NOFY_HOME || join(homedir(), '.nofy');
const tomlPath = join(home, 'config.toml');
const jsonPath = join(home, 'config.json');
const dryRun = process.argv.includes('--dry-run');

if (!existsSync(tomlPath)) {
  console.error('no config.toml at', tomlPath);
  process.exit(1);
}
if (existsSync(jsonPath)) {
  console.error('config.json already exists; aborting');
  process.exit(1);
}

const raw = parse(readFileSync(tomlPath, 'utf8'));
const out = {};
for (const [section, value] of Object.entries(raw)) {
  if (['model', 'model_providers', 'models'].includes(section)) continue;
  out[section] = value;
}

// [models]：只保留内核消费的键（web_search 为死键，不迁移）
if (raw.models && typeof raw.models === 'object') {
  const models = {};
  for (const key of ['default', 'default_reasoning_effort', 'session_summary', 'image_description', 'prompt_suggestion', 'allowed_models', 'hidden_models', 'disabled_models', 'agent_type', 'extra_headers', 'temperature', 'top_p']) {
    if (raw.models[key] !== undefined) models[key] = raw.models[key];
  }
  if (Object.keys(models).length) out.models = models;
}

const providers = {};
const flatModels = {};
for (const [id, provider] of Object.entries(raw.model_providers ?? {})) {
  if (!provider || typeof provider !== 'object') continue;
  const entry = {};
  for (const [k, v] of Object.entries(provider)) entry[k] = v;
  entry.models = {};
  providers[id] = entry;
}
for (const [id, model] of Object.entries(raw.model ?? {})) {
  if (!model || typeof model !== 'object') continue;
  const pid = String(model.model_provider ?? '');
  const upstream = String(model.model || id);
  const entry = {};
  for (const [k, v] of Object.entries(model)) {
    if (k === 'model' || k === 'model_provider') continue;
    entry[k] = v;
  }
  if (pid && providers[pid]) {
    providers[pid].models[upstream] = entry;
  } else {
    flatModels[id] = { ...model };
  }
}
for (const [id, entry] of Object.entries(providers)) {
  if (Object.keys(entry.models).length === 0) delete entry.models;
}
if (Object.keys(providers).length) out.model_providers = providers;
if (Object.keys(flatModels).length) out.model = flatModels;

const text = `${JSON.stringify(out, null, 2)}\n`;
if (dryRun) {
  console.log(text);
  process.exit(0);
}
writeFileSync(jsonPath, text, 'utf8');
// 配置含 api_key：收紧为仅本人可读写。
chmodSync(jsonPath, 0o600);
const bak = join(home, `config.toml.bak-json-${new Date().toISOString().replace(/[:.]/g, '-')}`);
renameSync(tomlPath, bak);
console.log('migrated:', jsonPath);
console.log('backup:', bak);
