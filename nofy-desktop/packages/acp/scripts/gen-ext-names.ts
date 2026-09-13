/**
 * 扩展名 codegen：schema/kernel-ext-usage.json → src/generated/ext-names.ts
 *
 * 与 gen-wire-names.ts 同构：stdlib 层由 ACP 官方 schema 生成，扩展层由
 * **内核源码提取件**生成。共同目的：让「凭空造名」在类型层不可能。
 *
 * 证据来自 extract-kernel-ext.ts（扫 crates/codegen 全树 .rs）：
 *   种类：ExtRequest::new = 请求（等响应）/ ExtNotification::new = 通知（fire-and-forget）
 *   方向：构造点在 nofy-pager（ACP 客户端＝TUI）还是其余 crate（agent 侧）
 *   **内核侧优先**：两侧都构造的名只归内核侧（pager 有时本地重建同形状以复用处理路径）
 *   排除同文件内 #[cfg(test)] 块（花括号配对剥离、保行号）
 */
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(here, "..");
const evPath = join(pkgRoot, "schema", "kernel-ext-usage.json");
const outDir = join(pkgRoot, "src", "generated");
const outPath = join(outDir, "ext-names.ts");

type Buckets = {
  clientRequest: Record<string, string[]>;
  clientNotification: Record<string, string[]>;
  kernelRequest: Record<string, string[]>;
  kernelEvent: Record<string, string[]>;
};
type Evidence = {
  generatedFrom: string;
  ambiguous: string[];
  buckets: Buckets;
  constOnly: string[];
  nameAccessorOnly: string[];
  /** 内核**接受**的名（match 臂精确匹配）→ 定义点。 */
  dispatched: Record<string, string[]>;
  /** 内核**接受**的名（starts_with 前缀族）→ 定义点。 */
  dispatchedPrefix: Record<string, string[]>;
  /** 内核在 ext_notification 体内以比较式接受的名 → 定义点（**通知**，无响应）。 */
  dispatchedNotify?: Record<string, string[]>;
  /** 比较式分派但不在 ext_notification 体内 → 定义点（人工复核用，不生成表）。 */
  dispatchedEqOther?: Record<string, string[]>;
  /** 内核经 emit_client_ext 助手推送的事件（内核 → 客户端）→ 定义点。 */
  emittedClient?: Record<string, string[]>;
  /** 字面量普查盲区（期望空对象）：没有任何桶收、也不在 allowlist 的名。 */
  unclassifiedLiterals?: Record<string, string[]>;
  sitesSha256: string;
};

const raw = readFileSync(evPath, "utf8");
const ev = JSON.parse(raw) as Evidence;
const sha256 = createHash("sha256").update(raw).digest("hex");

/**
 * 内核侧优先去重：两侧都构造的名只归内核侧。
 * 逐点归桶会让 nofy/session/update 同时出现在 EXT_CLIENT_NOTIFICATION 与
 * EXT_KERNEL_EVENT 里——消费者读前者会以为该由我们发出去，而实际上它是内核
 * replay 轨推给我们的（pager 侧构造点是 subagent_{lifecycle,activity}.rs 本地
 * 重建同形状以复用处理路径，不是线路方向）。
 */
function applyPrecedence(b: Buckets) {
  const kernel = new Set<string>([...Object.keys(b.kernelRequest), ...Object.keys(b.kernelEvent)]);
  const drop = (x: Record<string, string[]>) =>
    Object.fromEntries(Object.entries(x).filter(([n]) => !kernel.has(n)));
  const suppressed = [
    ...new Set([
      ...Object.keys(b.clientRequest).filter((n) => kernel.has(n)),
      ...Object.keys(b.clientNotification).filter((n) => kernel.has(n)),
    ]),
  ].sort();
  return {
    clientRequest: drop(b.clientRequest),
    clientNotification: drop(b.clientNotification),
    kernelRequest: b.kernelRequest,
    kernelEvent: b.kernelEvent,
    suppressed,
  };
}

/** nofy/session_summaries/workspace_list → session_summaries_workspace_list */
function keyOf(wire: string): string {
  return wire.replace(/^_?nofy\//, "").replace(/\//g, "_");
}

function table(constName: string, names: string[], comment: string): string {
  const sorted = [...names].sort();
  const body = sorted.map((n) => "  " + keyOf(n) + ": " + JSON.stringify("_" + n.replace(/^_/, "")) + ",");
  return (
    "/** " + comment + "（" + String(sorted.length) + " 条） */\n" +
    "export const " + constName + " = {\n" + body.join("\n") + "\n} as const;\n"
  );
}

const b = applyPrecedence(ev.buckets);

/**
 * 「仅分派」类：内核 match 臂认这个精确名，但全树找不到字面量构造点
 * （第一方 pager 经常量/helper 间接发送）。这类**仍是真请求**——
 * 实测 nofy/session_summaries/workspace_list 由 handlers/session.rs:204 分派，
 * 且我们的 smoke 用 rpc() 调它拿到过真响应（5 工作区 / 82 会话）。
 * 只靠构造侧证据会把它们误判为不存在。
 */
const constructed = new Set<string>([
  ...Object.keys(ev.buckets.clientRequest),
  ...Object.keys(ev.buckets.clientNotification),
  ...Object.keys(ev.buckets.kernelRequest),
  ...Object.keys(ev.buckets.kernelEvent),
]);
const dispatchOnly = Object.keys(ev.dispatched ?? {})
  .filter((n) => !constructed.has(n))
  .sort();
/**
 * 「仅通知侧分派」类：内核在 `async fn ext_notification` 体内以
 * `args.method.as_ref() == "nofy/…"` 接受，**没有任何响应构造点**。
 * 用 rpc() 发它们会得 -32601（实测 _nofy/terminal/pty/input，
 * 探针 docs/contract/ecosystem-shapes.json）。已被构造侧证据覆盖的名
 * （toggle_plan_mode / yolo_mode_changed）不重复登记。
 */
const dispatchNotify = Object.keys(ev.dispatchedNotify ?? {})
  .filter((n) => !constructed.has(n))
  .sort();
/**
 * 「助手推送」类：内核用 emit_client_ext(method, params) 推给客户端的事件，
 * 没有 ExtNotification::new 字面量。实测两条：search/fuzzy/status 与
 * search/content/status——⌘K 的文件搜索结果就走前者（探针 round 3 抓到帧）。
 */
const emitClient = Object.keys(ev.emittedClient ?? {})
  .filter((n) => !constructed.has(n))
  .sort();
const indirect = [
  ...new Set([...ev.nameAccessorOnly, ...ev.constOnly].map((n) => n.replace(/^_/, ""))),
].sort();

const parts: string[] = [];
parts.push("/**");
parts.push(" * GENERATED FILE — DO NOT EDIT.");
parts.push(" *");
parts.push(" * 源      : packages/acp/schema/kernel-ext-usage.json");
parts.push(" * 源 sha  : " + sha256);
parts.push(" * 证据 sha: " + ev.sitesSha256);
parts.push(" * 生成器  : packages/acp/scripts/gen-ext-names.ts");
parts.push(" * 提取器  : packages/acp/scripts/extract-kernel-ext.ts（扫 " + ev.generatedFrom + "）");
parts.push(" *");
parts.push(" * 值一律带 _ 前缀（线上形）；键为去掉 nofy/ 前缀、/ 换 _ 的机械名。");
parts.push(" * 手写别名表（methods.ts）必须引用这里的值，不得写字面量。");
parts.push(" */");
parts.push("");
parts.push(table("EXT_CLIENT_REQUEST", Object.keys(b.clientRequest), "客户端 → 内核，请求（等响应）"));
parts.push(table("EXT_CLIENT_NOTIFICATION", Object.keys(b.clientNotification), "客户端 → 内核，通知（fire-and-forget，**不等响应**）"));
parts.push(table("EXT_KERNEL_REQUEST", Object.keys(b.kernelRequest), "内核 → 客户端，请求（**必须应答**，否则内核悬挂或 fail-closed）"));
parts.push(table("EXT_KERNEL_EVENT", Object.keys(b.kernelEvent), "内核 → 客户端，事件通知"));
parts.push(table("EXT_INDIRECT", indirect, "仅以枚举访问器/常量出现：真实存在，但发送点经间接构造，无字面量 ExtRequest/ExtNotification::new"));
parts.push(table("EXT_DISPATCH_ONLY", dispatchOnly, "仅分派侧有证据：内核 match 臂接受该精确名，但全树无字面量构造点（第一方经常量/helper 发）。**仍是真请求**"));
parts.push(table("EXT_DISPATCH_NOTIFY", dispatchNotify, "仅通知侧分派有证据：内核 ext_notification 体内以比较式接受，**无响应构造点 ⇒ 必须用 notify() 发**（用 rpc() 发得 -32601，实测 terminal/pty/input）"));
parts.push(table("EXT_EMIT_CLIENT", emitClient, "内核经 emit_client_ext 助手推送的事件（内核 → 客户端通知，无构造点字面量）"));
parts.push("/** 被内核侧优先规则从客户端桶移出的名（两侧都有构造点，需人工复核）。 */");
parts.push("export const EXT_SIDE_SUPPRESSED = " + JSON.stringify(b.suppressed) + " as const;");
parts.push("");
parts.push("export type ExtClientRequestName = (typeof EXT_CLIENT_REQUEST)[keyof typeof EXT_CLIENT_REQUEST];");
parts.push("export type ExtClientNotificationName = (typeof EXT_CLIENT_NOTIFICATION)[keyof typeof EXT_CLIENT_NOTIFICATION];");
parts.push("export type ExtKernelRequestName = (typeof EXT_KERNEL_REQUEST)[keyof typeof EXT_KERNEL_REQUEST];");
parts.push("export type ExtKernelEventName = (typeof EXT_KERNEL_EVENT)[keyof typeof EXT_KERNEL_EVENT];");
parts.push("export type ExtIndirectName = (typeof EXT_INDIRECT)[keyof typeof EXT_INDIRECT];");
parts.push("export type ExtDispatchOnlyName = (typeof EXT_DISPATCH_ONLY)[keyof typeof EXT_DISPATCH_ONLY];");
parts.push("export type ExtDispatchNotifyName = (typeof EXT_DISPATCH_NOTIFY)[keyof typeof EXT_DISPATCH_NOTIFY];");
parts.push("export type ExtEmitClientName = (typeof EXT_EMIT_CLIENT)[keyof typeof EXT_EMIT_CLIENT];");
parts.push("export type ExtWireName =");
parts.push(
  "  | ExtClientRequestName | ExtClientNotificationName | ExtKernelRequestName | ExtKernelEventName" +
    " | ExtIndirectName | ExtDispatchOnlyName | ExtDispatchNotifyName | ExtEmitClientName;",
);
parts.push("export const EXT_EVIDENCE_SHA256 = " + JSON.stringify(sha256) + ";");

mkdirSync(outDir, { recursive: true });
writeFileSync(outPath, parts.join("\n") + "\n");
console.log("generated", outPath);
console.log("  clientRequest      :", Object.keys(b.clientRequest).length);
console.log("  clientNotification :", Object.keys(b.clientNotification).length);
console.log("  kernelRequest      :", Object.keys(b.kernelRequest).length);
console.log("  kernelEvent        :", Object.keys(b.kernelEvent).length);
console.log("  indirect           :", indirect.length);
console.log("  dispatchOnly       :", dispatchOnly.length);
console.log("  dispatchNotify     :", dispatchNotify.length + (dispatchNotify.length > 0 ? " → " + dispatchNotify.join(", ") : ""));
console.log("  emitClient         :", emitClient.length + (emitClient.length > 0 ? " → " + emitClient.join(", ") : ""));
const blind = Object.keys(ev.unclassifiedLiterals ?? {});
console.log("  字面量盲区         :", blind.length + (blind.length > 0 ? " → " + blind.join(", ") : "（干净）"));
console.log("  内核侧优先移出     :", b.suppressed.length + (b.suppressed.length > 0 ? " → " + b.suppressed.join(", ") : ""));
console.log("  evidence sha256    :", sha256.slice(0, 16));
