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

import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

export function configTomlPath() {
  if (process.env.NOFY_CONFIG_TOML_PATH?.trim()) return process.env.NOFY_CONFIG_TOML_PATH.trim();
  return process.env.NOFY_HOME ? join(process.env.NOFY_HOME, "config.toml") : join(homedir(), ".nofy", "config.toml");
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
  return JSON.stringify(String(v));
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
  const p = configTomlPath();
  mkdirSync(dirname(p), { recursive: true });
  const tmp = `${p}.tmp-${process.pid}`;
  writeFileSync(tmp, lines.join("\n"), "utf8");
  renameSync(tmp, p);
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

function findModelSection(lines, id) {
  for (const s of sections(lines)) {
    if (s.name === modelSectionName(id) || s.name === `model.${id}`) return s;
  }
  return null;
}

/** 读某 [model.*] 段的键值（字符串原样返回，不做类型推断）；段不存在返回 null。 */
export function readModelSection(id) {
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
 *  upsert [model.<id>]：已有键原地换值（保留注释与键序），缺失键追加到段尾；
 * 段不存在则追加到文件尾。fields 的值按 TOML 基本类型编码（string/number/boolean）。
 */
export function upsertModelSection(id, fields) {
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
    if (lines.length > 0 && lines[lines.length - 1].trim() !== "") lines.push("");
    lines.push(`[${modelSectionName(id)}]`);
    for (const [k, v] of entries) lines.push(`${quoteKey(k)} = ${encodeValue(v)}`);
  }
  atomicWrite(lines);
}

/**
 * 读内核模型表：{ defaultId, models:[{id,name,model,contextWindow}] }。
 * 内核自身亦由该文件解析模型表（§2.4），故这是桌面侧的权威读源；
 * [models] default 缺失时回退首段。
 */
export function readModelsTable() {
  const lines = readLines();
  const table = { defaultId: "", models: [] };
  for (const s of sections(lines)) {
    const kv = {};
    for (let i = s.start + 1; i < s.end; i++) {
      const m = /^([A-Za-z0-9_"'-]+)\s*=\s*(.*)$/.exec(lines[i].trim());
      if (m) kv[unquote(m[1])] = unquote(m[2]);
    }
    if (s.name === "models") table.defaultId = String(kv.default ?? "");
    else if (s.name.startsWith("model.")) {
      const id = unquote(s.name.slice("model.".length));
      const cw = Number(kv.context_window);
      table.models.push({
        id,
        name: String(kv.name || id),
        model: String(kv.model || id),
        ...(Number.isFinite(cw) && cw > 0 ? { contextWindow: cw } : {}),
      });
    }
  }
  if (!table.defaultId && table.models.length > 0) table.defaultId = table.models[0].id;
  // D18：[models] default 既可能是段名也可能是上游 model id（本仓 config 即后者：
  // default="qwen3.8-max" 对应 [model.dashscope] 的 model 字段）。UI 编码用
  // `${providerId}/${段名}`，这里统一归一到段名，否则 current 与选项 ref 永不匹配。
  if (table.defaultId && !table.models.some((m) => m.id === table.defaultId)) {
    const byModel = table.models.find((m) => m.model === table.defaultId);
    if (byModel) table.defaultId = byModel.id;
    else table.defaultId = table.models[0]?.id ?? table.defaultId;
  }
  return table;
}

/** 删除整个 [model.<id>] 段（含表头与键行）。 */
export function removeModelSection(id) {
  const lines = readLines();
  const s = findModelSection(lines, id);
  if (!s) return false;
  lines.splice(s.start, s.end - s.start);
  while (lines.length > 0 && lines[lines.length - 1].trim() === "") lines.pop();
  if (lines.length > 0) lines.push("");
  atomicWrite(lines);
  return true;
}

/** 写 [models] default = "<id>"；[models] 段不存在则新建。 */
export function setDefaultModel(id) {
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

export default { configTomlPath, readModelSection, upsertModelSection, removeModelSection, setDefaultModel };
