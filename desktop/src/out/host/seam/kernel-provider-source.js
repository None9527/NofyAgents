// nofy kernel provider source — PORTING-PLAN §2.7「移植钥匙」的 host 侧实现。
//
// 背景（§2.5.4 / §2.7）：renderer 的模型门槛只读 host 的 provider 注册表快照
// （`model-provider` 服务），而该注册表的存储文件（~/.nofy/v2/config.json）在
// nofy 化之后不存在 ⇒ providerCount=0 ⇒ 首页「当前没有可用模型」并阻塞首发。
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
import { join } from "node:path";
import { readFile } from "node:fs/promises";
import { readModelsTable } from "../../main/seam/nofy-config-toml.js";

// D18：段名→context_window 映射（设置页模型徽标用）
let cwCache = null;
function cwById() {
  if (!cwCache) {
    cwCache = new Map(readModelsTable().models.map((m) => [m.id, m.contextWindow]));
    setTimeout(() => (cwCache = null), 5000).unref?.();
  }
  return cwCache;
}

const KERNEL_PROVIDER_ID = "nofy-kernel";

function configTomlPath() {
  return process.env.NOFY_HOME ? join(process.env.NOFY_HOME, "config.toml") : join(homedir(), ".nofy", "config.toml");
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
  try {
    const text = await readFile(configTomlPath(), "utf8");
    const out = [];
    let cur = null;
    for (const raw of text.split("\n")) {
      const line = raw.trim();
      const sec = /^\[model\.("?)((?:[^"\\]|\\.)*)\1\]\s*$/.exec(line);
      if (sec) {
        cur = { id: sec[2], name: "", baseURL: "" };
        out.push(cur);
        continue;
      }
      if (!cur) continue;
      const kv = /^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*"((?:[^"\\]|\\.)*)"\s*$/.exec(line);
      if (!kv) continue;
      if (kv[1] === "base_url") cur.baseURL = kv[2];
      else if (kv[1] === "name") cur.name = kv[2];
    }
    return out;
  } catch {
    return [];
  }
}

let configWatchStarted = false;
function watchConfigToml() {
  if (configWatchStarted) return;
  configWatchStarted = true;
  try {
    let timer = null;
    fsWatch(configTomlPath(), () => {
      if (timer) return;
      timer = setTimeout(() => {
        timer = null;
        if (kernelModelState == null && onChange) {
          try {
            onChange();
          } catch {}
        }
      }, 300);
    });
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
 * 无 modelState 或无模型时返回 []（不合成，门槛保持原语义）。
 */
export async function synthesizeKernelProviders() {
  let list = modelsOf(kernelModelState);
  let cfgModels = [];
  if (list.length === 0) {
    cfgModels = await readConfigTomlModels();
    list = cfgModels.map((m) => ({ id: m.id, name: m.name || m.id }));
    watchConfigToml();
  }
  if (list.length === 0) return [];
  if (cfgModels.length === 0) cfgModels = await readConfigTomlModels();
  // 内核没有 OpenAI 兼容 HTTP 服务（crates 里 9803 零命中），会话流量走 stdio 子进程；
  // 故 baseURL 取 config.toml 里 [model.*] 的真实 base_url，界面上不再显示假端口。
  // 末位 loopback 兜底仅为让条目过 schema（endpoints.baseURL 必填），不代表可达端点。
  const baseURL =
    kernelBaseUrl || cfgModels.map((m) => m.baseURL).find((u) => u && u.trim()) || "http://127.0.0.1:9800";
  // 形制须过 host 的快照投影（shouldIncludeModelProviderInZCodeAgentRegistry +
  // convertModelProviderConfigToZCodeProviderInput）：endpoints.paths 必须含所用
  // kind（否则 runtime baseURL 解析为空 ⇒ 整条被丢），模型条目必须带 kinds。
  const KIND = "openai-compatible";
  return [
    {
      id: KERNEL_PROVIDER_ID,
      name: "nofy kernel",
      enabled: true,
      source: "custom",
      apiFormat: "openai-chat-completions",
      defaultKind: KIND,
      apiKey: "",
      apiKeyRequired: false,
      // D16 附带修正：config.toml 的 base_url 已含 /v1 尾段；paths 再给 "/v1" 会让
      // 投影层拼出 …/v1/v1 的谎 URL。paths 用 "/" 使拼接结果等于 config 原值，
      // 且 endpoints.baseURL 保持 config 原文（P4 写回依赖它不变形）。
      endpoints: { baseURL, paths: { [KIND]: "/" } },
      modelSupportedFormats: Object.fromEntries(list.map((m) => [m.id, ["openai"]])),
      // 投影层（getModelProviderModelIds）要求 models 为数组形
      models: list.map((m) => ({
        id: m.id,
        name: m.name || m.id,
        kinds: [KIND],
        defaultKind: KIND,
        supportsTools: true,
        supportsStructuredOutput: false,
        modalities: { input: ["text"], output: ["text"] },
        // D18：带上 config 的真 context_window，否则设置页徽标落内核默认 200K
        ...(cwById().get(m.id) ? { contextWindow: cwById().get(m.id) } : {}),
      })),
    },
  ];
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
