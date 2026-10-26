// nofy kernel provider source — PORTING-PLAN §2.7「移植钥匙」的 host 侧实现。
//
// 背景（§2.5.4 / §2.7）：renderer 的模型门槛只读 host 的 provider 注册表快照
// （`model-provider` 服务）。ZCode 的按供应商存储（原 ~/.nofy/v2/config.json）已
// 废除（v2 目录退休，见 main/seam/nofy-v2-retire.js）⇒ 注册表只能由内核合成填充，
// 否则 providerCount=0 ⇒ 首页「当前没有可用模型」并阻塞首发。
// 内核的模型表唯一来源是 `initialize._meta.modelState`（§2.4），桌面不维护自己的
// 模型注册表。本模块把内核 modelState 合成成注册表存储形的 provider 条目，
// 使门槛自然全绿；renderer 零改动。
//
// 取数通道（两路，优先内核）：
//   1. 阶段 A 的 main↔host IPC 桥（out/main/seam/kernel-bridge.js）推送的
//      initialize._meta.modelState —— 内核视角的权威模型表。
//   2. 兜底：直读 ~/.nofy/config.toml 的 [models]/[model.*] 段（§2.4：内核没有任何
//      配置读写 RPC，模型表由内核自该文件解析；桌面此处只做**只读派生**供门槛快照，
//      不维护竞争注册表）。实测 main→host 的 utilityProcess 裸帧在真应用里不送达
//      （A1-B 六次对照实验），故门槛不得依赖该方向。
//
// 桥消息契约（与 kernel-bridge.js 对齐）：
//   main→host  { type:"nofy-kernel-channel" } + transfer[MessagePort]（parentPort 裸帧）
//              该 port 上：{ type:"nofy-kernel-result", requestId, ok, result|error }
//                          { type:"nofy-kernel-event", event, payload }
//   host→main  { type:"nofy-kernel-call", requestId, op:"state" }（parentPort 裸帧）

import { watch as fsWatch } from "node:fs";
import { homedir } from "node:os";
import { join, dirname, basename } from "node:path";
import { readFile } from "node:fs/promises";
import { configTomlPath as nativeConfigTomlPath, readModelsTable } from "../../main/seam/nofy-config-toml.js";

const KERNEL_PROVIDER_ID = "nofy-kernel";

function configTomlPath() {
  return nativeConfigTomlPath();
}

/**
 * 只读派生：config.toml 的 [model.*] 段名即内核模型 id（内核自身亦由此解析模型表）。
 * 解析失败或文件不存在返回 []。
 */
export async function readConfigTomlModelIds() {
  try {
    const text = await readFile(configTomlPath(), "utf8");
    const ids = [];
    for (const line of text.split("\n")) {
      const m = /^\[model\.("?)((?:[^"\\]|\\.)*)\1\]\s*$/.exec(line.trim());
      if (m) ids.push(m[2]);
    }
    return ids;
  } catch {
    return [];
  }
}

// D14：config.toml 的 [model.*] 段带 base_url/name —— 合成 provider 的 endpoints.baseURL
// 必须取这里的真实值（内核没有 OpenAI 兼容 HTTP 服务，crates 里 9803 零命中；
// 旧的 127.0.0.1:9803 兜底是撒谎）。
export async function readConfigTomlModels() {
  return readModelsTable().models.filter(model => !model.hidden);
}

let configWatchStarted = false;
function watchConfigToml() {
  if (configWatchStarted) return;
  try {
    let timer = null;
    // Watch the directory: every config save atomically replaces the file inode.
    const watcher = fsWatch(dirname(configTomlPath()), (_event, filename) => {
      if (filename && String(filename) !== basename(configTomlPath())) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        kernelModelState = null;
        onChange?.();
      }, 100);
      timer.unref?.();
    });
    watcher.unref?.();
    configWatchStarted = true;
  } catch {}

}

let kernelModelState = null;
let kernelBaseUrl = null;
let parentPort = null;
let kernelPort = null;
let onChange = null;
let seq = 0;

export function getKernelModelState() {
  return kernelModelState;
}

function modelsOf(modelState) {
  const list = modelState?.availableModels ?? modelState?.models ?? [];
  if (!Array.isArray(list)) return [];
  return list
    .map((m) => ({
      id: String(m?.modelId ?? m?.id ?? "").trim(),
      name: String(m?.name ?? m?.modelId ?? m?.id ?? "").trim(),
    }))
    .filter((m) => m.id.length > 0);
}

/**
 * 内核 modelState → 注册表存储形 provider 条目（readProviders 的同形对象）。
 * 无模型时返回 []（不合成，门槛保持原语义）。
 *
 * 供应商维度按 config.toml 的 [model_providers.*] 一段一个条目（id/base_url/
 * api_key/api_backend 全取供应商段），模型按 model_provider 归属；未被任何供应商段
 * 引用的模型归入 KERNEL_PROVIDER_ID 兜底条目，保证一个模型都不丢。
 */
export async function synthesizeKernelProviders() {
  watchConfigToml();
  const table = readModelsTable();
  const kernelList = modelsOf(kernelModelState);
  const visible = kernelList.length
    ? kernelList.map(
        (k) =>
          table.models.find((m) => m.id === k.id) ?? {
            id: k.id,
            name: k.name || k.id,
            providerId: "",
            baseURL: "",
            apiBackend: "chat_completions",
          },
      )
    : table.models.filter((m) => !m.hidden);
  if (visible.length === 0) return [];
  const buckets = new Map();
  const orphans = [];
  for (const m of visible) {
    const provider = table.providers.find((p) => p.id === m.providerId);
    if (!provider) {
      orphans.push(m);
      continue;
    }
    if (!buckets.has(provider.id)) buckets.set(provider.id, { ...provider, models: [] });
    buckets.get(provider.id).models.push(m);
  }
  const out = [];
  for (const bucket of buckets.values()) out.push(providerEntryOf(bucket));
  // 空供应商（刚添加、还没模型）也要出现在设置面，否则添加后刷新即「消失」。
  for (const p of table.providers) {
    if (!buckets.has(p.id)) out.push(providerEntryOf({ ...p, models: [] }));
  }
  if (orphans.length > 0) {
    out.push(
      providerEntryOf({
        id: KERNEL_PROVIDER_ID,
        name: "nofy kernel",
        baseURL: kernelBaseUrl || orphans.map((m) => m.baseURL).find((u) => u && u.trim()) || "",
        apiKey: "",
        apiBackend: orphans[0].apiBackend,
        models: orphans,
      }),
    );
  }
  return out;
}

// api_backend → 注册表 apiFormat / endpoints kind。paths 用 "/"：config 的 base_url
// 已含 /v1 尾段，再拼 "/v1" 会得到 …/v1/v1 的谎 URL（D16 同款约束）。
const API_FORMAT_BY_BACKEND = {
  chat_completions: { apiFormat: "openai-chat-completions", kind: "openai-compatible", format: "openai" },
  responses: { apiFormat: "openai-responses", kind: "openai-compatible", format: "openai" },
  messages: { apiFormat: "anthropic-messages", kind: "anthropic", format: "anthropic" },
};

function providerEntryOf(bucket) {
  const fmt = API_FORMAT_BY_BACKEND[bucket.apiBackend] ?? API_FORMAT_BY_BACKEND.chat_completions;
  const KIND = fmt.kind;
  const list = bucket.models;
  return {
    id: bucket.id,
    name: bucket.name || bucket.id,
    enabled: true,
    source: "custom",
    apiFormat: fmt.apiFormat,
    defaultKind: KIND,
    // 供应商段的 api_key 原样进条目：设置页 API Key 框据此显示已配置。
    apiKey: bucket.apiKey ?? "",
    apiKeyRequired: false,
    endpoints: { baseURL: bucket.baseURL || "http://127.0.0.1:9800", paths: { [KIND]: "/" } },
    modelSupportedFormats: Object.fromEntries(list.map((m) => [m.model || m.id, [fmt.format]])),
    // 投影层（getModelProviderModelIds）要求 models 为数组形。
    // ZCode 语义：注册表模型 id = 线上请求的上游模型 id（host 请求体 model: modelId），
    // 即 config 的 model 字段；config 段名只在内核边界翻译（适配器 session/set_model）。
    models: list.map((m) => ({
      id: m.model || m.id,
      name: m.name || m.model || m.id,
      kinds: [KIND],
      defaultKind: KIND,
      supportsTools: true,
      supportsStructuredOutput: false,
      // 配置声明的模态优先（设置面「输入类型/输出类型」）；未声明保持纯文本缺省。
      modalities: m.modalities && Array.isArray(m.modalities.input) && m.modalities.input.length
        ? {
            input: m.modalities.input,
            output: Array.isArray(m.modalities.output) && m.modalities.output.length ? m.modalities.output : ["text"],
          }
        : { input: ["text"], output: ["text"] },
      // D18：带上 config 的真 context_window，否则设置页徽标落内核默认 200K
      ...(m.contextWindow ? { contextWindow: m.contextWindow } : {}),
    })),
  };
}

function httpBaseOf(wsUrl) {
  try {
    const u = new URL(wsUrl);
    return `${u.protocol === "wss:" ? "https" : "http"}://${u.host}`;
  } catch {
    return null;
  }
}

function requestState() {
  if (!parentPort) return;
  const requestId = `kps-${process.pid}-${++seq}`;
  try {
    parentPort.postMessage({ type: "nofy-kernel-call", requestId, op: "state" });
  } catch {}
}

function acceptModelState(modelState, url) {
  if (!modelState || typeof modelState !== "object") return false;
  const before = JSON.stringify(kernelModelState ?? null);
  kernelModelState = modelState;
  if (url) {
    const base = httpBaseOf(url);
    if (base) kernelBaseUrl = base;
  }
  const changed = JSON.stringify(kernelModelState) !== before;
  if (changed && onChange) {
    try {
      onChange();
    } catch {}
  }
  return changed;
}

function handleFrame(msg) {
  if (!msg || typeof msg !== "object") return false;
  if (msg.type === "nofy-kernel-result") {
    if (msg.ok && msg.result && typeof msg.result === "object") {
      acceptModelState(msg.result.modelState ?? null, msg.result.url ?? null);
    }
    return true;
  }
  if (msg.type === "nofy-kernel-event") {
    if (msg.event === "ready") requestState();
    if (msg.event === "acp") {
      const p = msg.payload ?? {};
      // §2.3：config.toml 热重载后内核推完整 modelState
      if (p.kind === "notification" && p.method === "_nofy/models/update") {
        acceptModelState(p.params ?? null, null);
        requestState();
      }
    }
    return true;
  }
  return false;
}

/**
 * 路由 main→host 的内核桥帧；非桥帧返回 false 交还既有 host 消息分派。
 * `nofy-kernel-channel` 帧携带转移的 MessagePort，其后 result/event 走该 port。
 */
export function routeKernelProviderMessage(msg, ports) {
  if (!msg || typeof msg !== "object") return false;
  if (msg.type === "nofy-kernel-channel") {
    const port = ports?.[0];
    if (port && port !== kernelPort) {
      kernelPort = port;
      port.on("message", (ev) => {
        handleFrame(ev?.data);
      });
      try {
        port.start();
      } catch {}
      requestState();
    }
    return true;
  }
  return handleFrame(msg);
}

/**
 * 把 host 的 parentPort 接入内核桥。幂等。
 * onChange：modelState 变化时回调（宿主用它重发 provider registry 变更事件）。
 */
export function attachKernelProviderBridge(port, onChanged) {
  if (!port) return;
  onChange = onChanged ?? onChange;
  if (parentPort === port) return;
  parentPort = port;
}

export default {
  synthesizeKernelProviders,
  routeKernelProviderMessage,
  attachKernelProviderBridge,
  getKernelModelState,
};
