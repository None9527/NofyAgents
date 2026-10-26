import { parse as parseToml } from "./toml-parser.js";
// ~/.nofy/config.toml 保注释片段编辑器 —— P4 设置写路径的落盘端。
//
// 背景：内核（nofy kernel）的模型表唯一真源是 ~/.nofy/config.toml 的 [models]/[model.*]
// 段（§0 单一配置、§2.4），且内核热重载该文件并推 _nofy/models/update。ZCode 设置面的
// 模型写操作（workspace/upsertModelProvider / setDefaultModel）原先在适配器里是空操作，
// 用户的修改永远到不了内核。本模块把写操作落成**只动目标键行、其余字节不动**的编辑，
// 注释与键序原地保留。
//
// 约束：本模块可能被 stdout=协议行的进程（acp-agent-adapter）导入，禁止写 stdout；
// 日志一律 console.error。写入用 tmp+rename 原子替换。

import { chmodSync, existsSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

export function configTomlPath() {
  if (process.env.NOFY_CONFIG_TOML_PATH?.trim()) return process.env.NOFY_CONFIG_TOML_PATH.trim();
  const home = process.env.NOFY_HOME || join(homedir(), ".nofy");
  // JSON 体系：config.json 存在即为用户配置（内核同规则），否则回退 config.toml。
  const jsonPath = join(home, "config.json");
  if (existsSync(jsonPath)) return jsonPath;
  return join(home, "config.toml");
}

function isJsonConfig() {
  return configTomlPath().endsWith(".json");
}

/* ── JSON 用户配置的读写核心（与内核 parse 规则对齐：平铺 [model.*] + 供应商嵌套 models 子表） ── */

function readJsonRoot() {
  try {
    const parsed = JSON.parse(readFileSync(configTomlPath(), "utf8"));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

// 配置里存着 api_key：tmp+rename 必须带走原权限，新建时缺省 0600（内核
// atomic_write_string 同语义）。否则设置面保存一次就把 600 的文件换成 umask
// 默认的 644，密钥变成同机其他用户可读。
function atomicWriteText(p, text) {
  // 内容没变就不落盘：否则每次 upsert 都刷新 mtime → 配置 watcher → host 重合成 →
  // renderer 再发 upsert，形成每秒上千次的写盘反馈环。
  try {
    if (readFileSync(p, "utf8") === text) return;
  } catch {}
  mkdirSync(dirname(p), { recursive: true });
  let mode = 0o600;
  try {
    mode = statSync(p).mode & 0o7777;
  } catch {}
  const tmp = `${p}.tmp-${process.pid}`;
  writeFileSync(tmp, text, { encoding: "utf8", mode });
  // writeFileSync 的 mode 会被 umask 削位，显式再设一次才算数。
  try {
    chmodSync(tmp, mode);
  } catch {}
  renameSync(tmp, p);
}

function writeJsonRoot(root) {
  atomicWriteText(configTomlPath(), `${JSON.stringify(root, null, 2)}\n`);
}

const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);
const num = (v) => Number(v);

function jsonProviderEntries(root) {
  const out = [];
  for (const [id, p] of Object.entries(root.model_providers ?? {})) {
    if (!isObj(p)) continue;
    const pcw = num(p.context_window);
    out.push({
      id,
      name: String(p.name || id),
      baseURL: String(p.base_url ?? ""),
      apiBackend: String(p.api_backend ?? "chat_completions"),
      apiKey: typeof p.api_key === "string" ? p.api_key : "",
      ...(Number.isFinite(pcw) && pcw > 0 ? { contextWindow: pcw } : {}),
    });
  }
  return out;
}

function jsonModelEntry(id, m, providerId, providers) {
  const provider = providers.find((p) => p.id === providerId) ?? {};
  const cw = num(m.context_window ?? provider.contextWindow);
  return {
    id,
    name: String(m.name || id),
    model: String(m.model || id),
    providerId: String(providerId ?? ""),
    baseURL: String(m.base_url ?? provider.baseURL ?? ""),
    apiBackend: String(m.api_backend ?? provider.apiBackend ?? "chat_completions"),
    hidden: m.hidden === true,
    ...(Number.isFinite(cw) && cw > 0 ? { contextWindow: cw } : {}),
    ...(() => { const mods = normModalities(m.modalities); return mods ? { modalities: mods } : {}; })(),
  };
}

function jsonModelEntries(root, providers) {
  const models = [];
  const seen = new Set();
  for (const [id, m] of Object.entries(root.model ?? {})) {
    if (!isObj(m)) continue;
    seen.add(id);
    models.push(jsonModelEntry(id, m, m.model_provider, providers));
  }
  // 供应商嵌套 models 子表（内核 parse_model_providers 同规则）；平铺段优先。
  for (const p of providers) {
    for (const [mid, m] of Object.entries(root.model_providers?.[p.id]?.models ?? {})) {
      if (!isObj(m) || seen.has(mid)) continue;
      models.push(jsonModelEntry(mid, m, p.id, providers));
    }
  }
  return models;
}

/** 定位模型条目容器：{ container, key } —— 平铺 root.model 或嵌套 root.model_providers.P.models。 */
function jsonLocateModel(root, id) {
  for (const [key, m] of Object.entries(root.model ?? {})) {
    if (key === id || (isObj(m) && String(m.model ?? "") === id)) return { container: root.model, key };
  }
  for (const [pid, p] of Object.entries(root.model_providers ?? {})) {
    if (!isObj(p) || !isObj(p.models)) continue;
    for (const key of Object.keys(p.models)) {
      if (key === id) return { container: p.models, key };
    }
  }
  return null;
}

const HEADER_RE = /^\[([^\]]+)\]\s*$/;

function bareKey(id) {
  return /^[A-Za-z0-9_-]+$/.test(id);
}

function quoteKey(id) {
  return bareKey(id) ? id : JSON.stringify(id);
}

function encodeValue(v) {
  if (typeof v === "string") return JSON.stringify(v);
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  // 模态等嵌套值：TOML 内联表/数组形（modalities = { input = [...], output = [...] }）
  if (Array.isArray(v)) return `[${v.map(encodeValue).join(", ")}]`;
  if (v && typeof v === "object")
    return `{ ${Object.entries(v).map(([k, val]) => `${quoteKey(k)} = ${encodeValue(val)}`).join(", ")} }`;
  return JSON.stringify(String(v));
}

/** 规整 modalities：{ input:[...], output:[...] }；缺失返回 undefined。 */
function normModalities(m) {
  if (!m || typeof m !== "object" || Array.isArray(m)) return undefined;
  const pick = (x) => (Array.isArray(x) ? x.map(String) : []);
  return { input: pick(m.input), output: pick(m.output) };
}

function unquote(s) {
  const t = s.trim();
  if (t.length >= 2 && (t[0] === '"' || t[0] === "'")) {
    try {
      if (t[0] === '"') return JSON.parse(t);
      return t.slice(1, -1);
    } catch {
      return t.slice(1, -1);
    }
  }
  return t;
}

function readLines() {
  try {
    return readFileSync(configTomlPath(), "utf8").split("\n");
  } catch {
    return [];
  }
}

function atomicWrite(lines) {
  atomicWriteText(configTomlPath(), lines.join("\n"));
}

/** 返回 [{ name, start, end }]：name 为段名原文（如 model."glm-5.2" / models），[start,end) 为行区间含表头。 */
function sections(lines) {
  const out = [];
  let cur = null;
  for (let i = 0; i < lines.length; i++) {
    const m = HEADER_RE.exec(lines[i].trim());
    if (m) {
      if (cur) cur.end = i;
      cur = { name: m[1].trim(), start: i, end: lines.length };
      out.push(cur);
    }
  }
  return out;
}

function modelSectionName(id) {
  return `model.${quoteKey(id)}`;
}

/** 段名归一：`model."x"` 与 `model.x` 是同一个段（引号只是 TOML 书写差异）。 */
function sectionModelId(name) {
  if (!name.startsWith("model.") || name.startsWith("model_providers.")) return null;
  return unquote(name.slice("model.".length));
}

function sectionProviderId(name) {
  if (!name.startsWith("model_providers.")) return null;
  return unquote(name.slice("model_providers.".length));
}

function findModelSection(lines, id) {
  for (const s of sections(lines)) {
    if (sectionModelId(s.name) === id) return s;
  }
  return null;
}

/** 读某 [model.<id>] 段的键值（字符串原样返回，不做类型推断）；段不存在返回 null。 */
export function readModelSection(id) {
  if (isJsonConfig()) {
    const loc = jsonLocateModel(readJsonRoot(), id);
    return loc ? { ...loc.container[loc.key] } : null;
  }
  const lines = readLines();
  const s = findModelSection(lines, id);
  if (!s) return null;
  const out = {};
  for (let i = s.start + 1; i < s.end; i++) {
    const kv = /^([A-Za-z0-9_"'-]+)\s*=\s*(.*)$/.exec(lines[i].trim());
    if (kv) out[unquote(kv[1])] = unquote(kv[2]);
  }
  return out;
}

/**
 * 新 [model.*] 段的插入位：紧跟同供应商最后一个段（供应商段或带 model_provider
 * 的 [model.*]）之后，使 config 视觉上按供应商分组；无锚点返回 -1（追加文件尾）。
 */
function groupedInsertIndex(lines, pid) {
  if (!pid) return -1;
  let at = -1;
  for (const s of sections(lines)) {
    const isProvider = sectionProviderId(s.name) === pid;
    let isMember = false;
    if (!isProvider && sectionModelId(s.name) !== null) {
      for (let i = s.start + 1; i < s.end; i++) {
        const kv = /^model_provider\s*=\s*(.*)$/.exec(lines[i].trim());
        if (kv && unquote(kv[1]) === pid) {
          isMember = true;
          break;
        }
      }
    }
    if (isProvider || isMember) at = s.end;
  }
  return at;
}

/**
 *  upsert [model.<id>]：已有键原地换值（保留注释与键序），缺失键追加到段尾；
 * 段不存在则按供应商分组插入（见 groupedInsertIndex），无同供应商段时追加文件尾。
 * fields 的值按 TOML 基本类型编码（string/number/boolean）。
 */
export function upsertModelSection(id, fields) {
  if (isJsonConfig()) {
    const root = readJsonRoot();
    const entries = Object.entries(fields).filter(([, v]) => v !== undefined && v !== null);
    const loc = jsonLocateModel(root, id);
    if (loc) {
      Object.assign(loc.container[loc.key], Object.fromEntries(entries));
    } else {
      const pid = String(fields.model_provider ?? "");
      if (pid && isObj(root.model_providers?.[pid])) {
        if (!isObj(root.model_providers[pid].models)) root.model_providers[pid].models = {};
        root.model_providers[pid].models[id] = Object.fromEntries(entries);
      } else {
        if (!isObj(root.model)) root.model = {};
        root.model[id] = Object.fromEntries(entries);
      }
    }
    writeJsonRoot(root);
    return;
  }
  const lines = readLines();
  const s = findModelSection(lines, id);
  const entries = Object.entries(fields).filter(([, v]) => v !== undefined && v !== null);
  if (s) {
    const remaining = new Map(entries);
    for (let i = s.start + 1; i < s.end; i++) {
      const kv = /^([A-Za-z0-9_"'-]+)\s*=\s*(.*)$/.exec(lines[i].trim());
      if (!kv) continue;
      const key = unquote(kv[1]);
      if (remaining.has(key)) {
        lines[i] = `${key} = ${encodeValue(remaining.get(key))}`;
        remaining.delete(key);
      }
    }
    if (remaining.size > 0) {
      const add = [...remaining].map(([k, v]) => `${quoteKey(k)} = ${encodeValue(v)}`);
      // 插到段内最后一个非空行之后：跨过段尾空行会视觉上脱离本段（TOML 语义虽仍属本段）
      let at = s.end;
      while (at > s.start + 1 && lines[at - 1].trim() === "") at--;
      lines.splice(at, 0, ...add);
    }
  } else {
    const body = [
      `[${modelSectionName(id)}]`,
      ...entries.map(([k, v]) => `${quoteKey(k)} = ${encodeValue(v)}`),
    ];
    const at = groupedInsertIndex(lines, String(fields.model_provider ?? ""));
    if (at === -1 || at >= lines.length) {
      if (lines.length > 0 && lines[lines.length - 1].trim() !== "") lines.push("");
      lines.push(...body);
    } else {
      lines.splice(at, 0, ...body, "");
    }
  }
  atomicWrite(lines);
}

/**
 * 读内核模型表：{ defaultId, models:[{id,name,model,contextWindow}] }。
 * 内核自身亦由该文件解析模型表（§2.4），故这是桌面侧的权威读源；
 * [models] default 缺失时回退首段。
 */
export function readModelsTable() {
  if (isJsonConfig()) {
    const root = readJsonRoot();
    const providers = jsonProviderEntries(root);
    const models = jsonModelEntries(root, providers);
    let defaultId = String(root.models?.default ?? "");
    if (!defaultId) defaultId = models.find((m) => !m.hidden)?.id ?? "";
    if (defaultId && !models.some((m) => m.id === defaultId)) {
      const byModel = models.find((m) => m.model === defaultId);
      if (byModel) defaultId = byModel.id;
    }
    return { defaultId, providers, models };
  }
  const raw = parseToml(readLines().join("\n"));
  const table = { defaultId: String(raw.models?.default ?? ""), providers: [], models: [] };
  // 供应商段 [model_providers.*] 是连接配置的真源：base_url/api_key/api_backend/
  // context_window 在此，[model.*] 只带 model_provider 引用与模型自身覆盖项。
  for (const [id, provider] of Object.entries(raw.model_providers ?? {})) {
    if (!provider || typeof provider !== "object" || Array.isArray(provider)) continue;
    const pcw = Number(provider.context_window);
    table.providers.push({
      id,
      name: String(provider.name || id),
      baseURL: String(provider.base_url ?? ""),
      apiBackend: String(provider.api_backend ?? "chat_completions"),
      apiKey: typeof provider.api_key === "string" ? provider.api_key : "",
      ...(Number.isFinite(pcw) && pcw > 0 ? { contextWindow: pcw } : {}),
    });
  }
  for (const [id, model] of Object.entries(raw.model ?? {})) {
    if (!model || typeof model !== "object" || Array.isArray(model)) continue;
    const providerId = String(model.model_provider ?? "");
    const provider = table.providers.find((p) => p.id === providerId) ?? {};
    const cw = Number(model.context_window ?? provider.contextWindow);
    table.models.push({
      id, name: String(model.name || id), model: String(model.model || id),
      providerId,
      baseURL: String(model.base_url ?? provider.baseURL ?? ""),
      apiBackend: String(model.api_backend ?? provider.apiBackend ?? "chat_completions"),
      hidden: model.hidden === true,
      ...(Number.isFinite(cw) && cw > 0 ? { contextWindow: cw } : {}),
      ...(() => { const mods = normModalities(model.modalities); return mods ? { modalities: mods } : {}; })(),
    });
  }
  if (!table.defaultId) table.defaultId = table.models.find(m => !m.hidden)?.id ?? "";
  if (table.defaultId && !table.models.some(m => m.id === table.defaultId)) {
    const byModel = table.models.find(m => m.model === table.defaultId);
    if (byModel) table.defaultId = byModel.id;
  }
  return table;
}

/** 删除整个 [model.<id>] 段（含表头与键行）。 */
export function removeModelSection(id) {
  if (isJsonConfig()) {
    const root = readJsonRoot();
    const loc = jsonLocateModel(root, id);
    if (!loc) return false;
    delete loc.container[loc.key];
    writeJsonRoot(root);
    return true;
  }
  const lines = readLines();
  const s = findModelSection(lines, id);
  if (!s) return false;
  lines.splice(s.start, s.end - s.start);
  while (lines.length > 0 && lines[lines.length - 1].trim() === "") lines.pop();
  if (lines.length > 0) lines.push("");
  atomicWrite(lines);
  return true;
}

/* ── 供应商段 [model_providers.<id>]：连接配置（base_url/api_key/api_backend）真源 ── */

function providerSectionName(id) {
  return `model_providers.${quoteKey(id)}`;
}

function findProviderSection(lines, id) {
  for (const s of sections(lines)) {
    if (sectionProviderId(s.name) === id) return s;
  }
  return null;
}

/** 读 [model_providers.<id>] 的键值；段不存在返回 null。 */
export function readProviderSection(id) {
  if (isJsonConfig()) {
    const p = readJsonRoot().model_providers?.[id];
    return isObj(p) ? { ...p } : null;
  }
  const lines = readLines();
  const s = findProviderSection(lines, id);
  if (!s) return null;
  const out = {};
  for (let i = s.start + 1; i < s.end; i++) {
    const kv = /^([A-Za-z0-9_"'-]+)\s*=\s*(.*)$/.exec(lines[i].trim());
    if (kv) out[unquote(kv[1])] = unquote(kv[2]);
  }
  return out;
}

/** upsert [model_providers.<id>]：与 upsertModelSection 同语义（保注释、只动目标键）。 */
export function upsertProviderSection(id, fields) {
  if (isJsonConfig()) {
    const root = readJsonRoot();
    if (!isObj(root.model_providers)) root.model_providers = {};
    if (!isObj(root.model_providers[id])) root.model_providers[id] = {};
    Object.assign(
      root.model_providers[id],
      Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined && v !== null)),
    );
    writeJsonRoot(root);
    return;
  }
  const lines = readLines();
  const s = findProviderSection(lines, id);
  const entries = Object.entries(fields).filter(([, v]) => v !== undefined && v !== null);
  if (s) {
    const remaining = new Map(entries);
    for (let i = s.start + 1; i < s.end; i++) {
      const kv = /^([A-Za-z0-9_"'-]+)\s*=\s*(.*)$/.exec(lines[i].trim());
      if (!kv) continue;
      const key = unquote(kv[1]);
      if (remaining.has(key)) {
        lines[i] = `${key} = ${encodeValue(remaining.get(key))}`;
        remaining.delete(key);
      }
    }
    if (remaining.size > 0) {
      const add = [...remaining].map(([k, v]) => `${quoteKey(k)} = ${encodeValue(v)}`);
      let at = s.end;
      while (at > s.start + 1 && lines[at - 1].trim() === "") at--;
      lines.splice(at, 0, ...add);
    }
  } else {
    if (lines.length > 0 && lines[lines.length - 1].trim() !== "") lines.push("");
    lines.push(`[${providerSectionName(id)}]`);
    for (const [k, v] of entries) lines.push(`${quoteKey(k)} = ${encodeValue(v)}`);
  }
  atomicWrite(lines);
}

/** 删除 [model_providers.<id>] 段；段不存在返回 false。 */
export function removeProviderSection(id) {
  if (isJsonConfig()) {
    const root = readJsonRoot();
    if (!isObj(root.model_providers?.[id])) return false;
    delete root.model_providers[id];
    writeJsonRoot(root);
    return true;
  }
  const lines = readLines();
  const s = findProviderSection(lines, id);
  if (!s) return false;
  lines.splice(s.start, s.end - s.start);
  while (lines.length > 0 && lines[lines.length - 1].trim() === "") lines.pop();
  if (lines.length > 0) lines.push("");
  atomicWrite(lines);
  return true;
}

/* ── 注册表形 provider（设置面/宿主服务所用形制）↔ config.toml 的唯一落盘入口 ── */

// 注册表 apiFormat → config.toml api_backend。
export const API_BACKEND_BY_FORMAT = {
  "openai-chat-completions": "chat_completions",
  "openai-responses": "responses",
  "anthropic-messages": "messages",
};

/**
 * 把注册表形 provider 落盘成按供应商结构：连接字段写 [model_providers.<id>]，
 * 模型写 [model.<段名>] 并带 model_provider 引用（模型段不重复连接字段）。
 * 载荷里缺席的同供应商模型段会被删除（设置面「删模型后保存」语义）。
 * api_key 留空时保留供应商段现值，防误抹。
 */
export function upsertRegistryProvider(p) {
  const pid = String(p?.id ?? "").trim();
  if (!pid) return;
  // 值未变的键不写：后台运行时同步对未改动的供应商应是 no-op，避免无谓改写用户文件。
  const existingConn = readProviderSection(pid) ?? {};
  const conn = {};
  const base = String(p?.endpoints?.baseURL ?? p?.baseURL ?? p?.base_url ?? "").trim();
  if (base && existingConn.base_url !== base) conn.base_url = base;
  const key = String(p?.apiKey ?? p?.api_key ?? "").trim();
  if (key && existingConn.api_key !== key) conn.api_key = key; // 留空/未变都不写：现有密钥行原地保留
  const backend = API_BACKEND_BY_FORMAT[String(p?.apiFormat ?? "")];
  // chat_completions 是内核默认后端：缺省即等价，不写多余行。
  if (backend && (existingConn.api_backend ?? "chat_completions") !== backend) conn.api_backend = backend;
  upsertProviderSection(pid, conn);
  const table = readModelsTable();
  // 墓碑（deleted: true）不落盘，也不进对账白名单：设置面「删模型后保存」靠它把段删掉。
  const payloadModels = (Array.isArray(p?.models) ? p.models : []).filter((m) => m?.deleted !== true);
  const payloadIds = new Set(payloadModels.map((m) => String(m?.id ?? "").trim()).filter(Boolean));
  for (const m of payloadModels) {
    const mid = String(m?.id ?? "").trim();
    if (!mid) continue;
    const sectionId = table.models.find((x) => x.model === mid || x.id === mid)?.id ?? mid;
    const existing = readModelSection(sectionId) ?? {};
    const fields = { model_provider: pid };
    // 段名即上游模型 id 时不写 model 行（内核 apply() 以段名为默认上游 id）。
    if (mid !== sectionId) fields.model = mid;
    const name = String(m?.name ?? "").trim();
    if (name) fields.name = name;
    const cw = Number(m?.contextWindow ?? m?.context_window);
    if (Number.isFinite(cw) && cw > 0) fields.context_window = cw;
    else if (existing.context_window) fields.context_window = Number(existing.context_window);
    const mods = normModalities(m?.modalities);
    // 只落用户真正动过的模态（对话框勾选带 modalitiesConfigured 标记）：
    // 启动对账/行内提交会把目录合成的模态带进来，写进用户配置是噪音；
    // 段里已声明过则照常回写，取消勾选才清得掉。
    if (mods && (m?.modalitiesConfigured === true || existing.modalities)) fields.modalities = mods;
    upsertModelSection(sectionId, fields);
  }
  // 对账：仍挂在该供应商下但已不在载荷里的模型段删除
  for (const gone of table.models.filter(
    (x) => x.providerId === pid && !payloadIds.has(x.model) && !payloadIds.has(x.id),
  )) {
    removeModelSection(gone.id);
  }
}

/**
 * 删除注册表形 provider：供应商段连同旗下模型段一起删（设置面「删除供应商」语义）；
 * 传入模型 id 时只删该模型段。返回是否删了东西。
 */
export function removeRegistryProvider(id) {
  const pid = String(id ?? "").trim();
  if (!pid) return false;
  const table = readModelsTable();
  if (table.providers.some((x) => x.id === pid)) {
    for (const m of table.models.filter((x) => x.providerId === pid)) removeModelSection(m.id);
    removeProviderSection(pid);
    return true;
  }
  const sec = table.models.find((x) => x.model === pid || x.id === pid);
  if (sec) return removeModelSection(sec.id);
  return false;
}

/** 写 [models] default = "<id>"；[models] 段不存在则新建。 */
export function setDefaultModel(id) {
  if (isJsonConfig()) {
    const root = readJsonRoot();
    if (!isObj(root.models)) root.models = {};
    root.models.default = id;
    writeJsonRoot(root);
    return;
  }
  const lines = readLines();
  const sec = sections(lines).find((s) => s.name === "models");
  if (sec) {
    let found = false;
    for (let i = sec.start + 1; i < sec.end; i++) {
      const kv = /^([A-Za-z0-9_"'-]+)\s*=\s*(.*)$/.exec(lines[i].trim());
      if (kv && unquote(kv[1]) === "default") {
        lines[i] = `default = ${encodeValue(id)}`;
        found = true;
      }
    }
    if (!found) lines.splice(sec.start + 1, 0, `default = ${encodeValue(id)}`);
  } else {
    if (lines.length > 0 && lines[lines.length - 1].trim() !== "") lines.push("");
    lines.push("[models]", `default = ${encodeValue(id)}`);
  }
  atomicWrite(lines);
}

export default {
  configTomlPath,
  readModelSection,
  upsertModelSection,
  removeModelSection,
  readProviderSection,
  upsertProviderSection,
  removeProviderSection,
  upsertRegistryProvider,
  removeRegistryProvider,
  setDefaultModel,
};
