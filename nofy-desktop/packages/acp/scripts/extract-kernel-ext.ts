/**
 * 从**内核源码**提取 _nofy/* 扩展名的方向与种类，产出 schema/kernel-ext-usage.json。
 *
 * 为什么要有这一步：ACP 的 stdlib 层有权威 JSON schema 可生成（见 gen-wire-names.ts），
 * 但 `_nofy/*` 扩展**不在 schema 内**。旧路靠 KERNEL-ACP-SURFACE.md（字面量计数）
 * 与 PORTING-PLAN §2.2（人工整理）描述它们，两者都**不区分请求与通知**，
 * 也不区分方向。实测代价：我们把 nofy/toggle_plan_mode 与 nofy/queue/* 归成了
 * 「客户端→内核请求」，而第一方 pager 发它们用的是 ExtNotification（不等响应）。
 *
 * 权威判据＝**第一方客户端怎么发**：
 *   - `acp::ExtRequest::new(name, …)`       ⇒ 请求（等响应，Ok(resp) 被解析）
 *   - `acp::ExtNotification::new(name, …)`  ⇒ 通知（fire-and-forget，失败只记日志）
 * 方向由构造点所在 crate 判定：nofy-pager 是 ACP **客户端**（TUI），
 * 其余（nofy-shell / nofy-agent / …）是 **agent 侧**。
 *
 * 跑法：NOFY_KERNEL_SRC=<crates/codegen 路径> node packages/acp/scripts/extract-kernel-ext.ts
 * 门禁：packages/acp/test/ext-usage-drift.test.ts
 */
import { readFileSync, readdirSync, writeFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(here, "..");
const OUT = join(pkgRoot, "schema", "kernel-ext-usage.json");

/** 内核源码根。默认按本仓库布局：nofy-desktop/packages/acp/scripts → 上四级 = 仓库根。 */
const KERNEL_ROOT = process.env["NOFY_KERNEL_SRC"] ?? resolve(here, "..", "..", "..", "..", "crates", "codegen");

const RE_REQUEST = /ExtRequest::new\(\s*"([a-z0-9_\/]+)"/g;
const RE_NOTIFICATION = /ExtNotification::new\(\s*"([a-z0-9_\/]+)"/g;
const RE_CONST = /&str\s*=\s*"(nofy\/[a-z0-9_\/]+)"/g;
/**
 * 枚举访问器式：`Self::ReloadModels => "nofy/internal/reload_models"`——字面量在
 * `=>` **右侧**。RE_DISPATCH_ARM 只认左侧，RE_CONST 只认 `&str =`，两者都漏这一类。
 * 实测漏掉 nofy/internal/reload_models 与 reload_models_cache（session_admin.rs:58-59）。
 */
const RE_NAME_ACCESSOR = /=>\s*"(nofy\/[a-z0-9_\/]+)"/g;

type Site = { name: string; kind: "request" | "notification"; crate: string; file: string; line: number };

/**
 * 剥离同文件内的 #[cfg(test)] 条目，**保留行号**（用等量换行填充被剥离的区间）。
 *
 * 为什么不能简单截断：nofy-pager/src/app/effects/mod.rs 在第 33、35 行就有
 * #[cfg(test)]（挂在小的 use/fn 上），截断到首个出现处会把 1127（toggle_plan_mode）、
 * 1209（queue/edit）、3333（rewind/points）这些真发送点全砍掉——实测让 distinct 名
 * 从 78 掉到 23。必须按条目粒度剥离。
 *
 * 规则：#[cfg(test)] 之后先遇到 ';' 视为无体条目（use/decl），剥到分号；
 * 先遇到 '{' 则花括号配对，剥到闭合。多个条目从后往前剥，避免索引失效。
 */
export function stripCfgTest(src: string): string {
  const marker = "#[cfg(test)]";
  const ranges: Array<[number, number]> = [];
  let from = 0;
  for (;;) {
    const i = src.indexOf(marker, from);
    if (i < 0) break;
    let j = i + marker.length;
    let end = -1;
    while (j < src.length) {
      const ch = src[j];
      if (ch === ";") {
        end = j + 1;
        break;
      }
      if (ch === "{") {
        let depth = 0;
        let k = j;
        for (; k < src.length; k++) {
          if (src[k] === "{") depth++;
          else if (src[k] === "}") {
            depth--;
            if (depth === 0) break;
          }
        }
        end = k + 1;
        break;
      }
      j++;
    }
    if (end < 0) end = src.length;
    ranges.push([i, end]);
    from = end;
  }
  if (ranges.length === 0) return src;
  let out = src;
  for (let r = ranges.length - 1; r >= 0; r--) {
    const pair = ranges[r];
    if (pair === undefined) continue;
    const [a, b] = pair;
    const removed = out.slice(a, b);
    const newlines = "\n".repeat((removed.match(/\n/g) ?? []).length);
    out = out.slice(0, a) + newlines + out.slice(b);
  }
  return out;
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    let st;
    try {
      st = statSync(p);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      if (entry === "target" || entry === "node_modules" || entry === ".git") continue;
      walk(p, out);
    } else if (entry.endsWith(".rs")) {
      out.push(p);
    }
  }
  return out;
}

let files: string[];
try {
  files = walk(KERNEL_ROOT);
} catch (e) {
  console.error("无法读取内核源码根:", KERNEL_ROOT);
  console.error("设 NOFY_KERNEL_SRC 指向 crates/codegen。原始错误:", e instanceof Error ? e.message : String(e));
  process.exit(2);
}

const sites: Site[] = [];
const consts = new Set<string>();
const nameAccessor = new Set<string>();

for (const f of files) {
  // 排除测试代码：只认第一方生产码的发送点
  const rel = relative(KERNEL_ROOT, f);
  if (/(^|\/|_)tests?(\/|_|\.)/.test(rel) || rel.includes("/tests/")) continue;
  const rawSrc = readFileSync(f, "utf8");
  // 排除**同文件内**的测试模块：很多 handler 把 #[cfg(test)] mod tests 放在生产文件尾部，
  // 只按路径过滤会把它当成生产发送点（实测 nofy/session/updates 的三个构造点全在此类块里，
  // 造成「kernelRequest」假阳性）。截断到第一个 #[cfg(test)] 即可。
  const src = stripCfgTest(rawSrc);
  const crate = rel.split("/")[0] ?? "?";
  for (const [re, kind] of [[RE_REQUEST, "request"], [RE_NOTIFICATION, "notification"]] as const) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(src)) !== null) {
      const name = m[1];
      if (name === undefined) continue;
      const line = src.slice(0, m.index).split("\n").length;
      sites.push({ name, kind, crate, file: rel, line });
    }
  }
  RE_CONST.lastIndex = 0;
  let cm: RegExpExecArray | null;
  while ((cm = RE_CONST.exec(src)) !== null) {
    if (cm[1] !== undefined) consts.add(cm[1]);
  }
  RE_NAME_ACCESSOR.lastIndex = 0;
  let am: RegExpExecArray | null;
  while ((am = RE_NAME_ACCESSOR.exec(src)) !== null) {
    if (am[1] !== undefined) nameAccessor.add(am[1]);
  }
}

/* ── 分派侧证据：内核**接受**哪些名 ──
 * 与构造侧互补：构造侧回答「第一方客户端怎么发」，分派侧回答「内核认不认」。
 * 例：nofy/session_summaries/workspace_list 有分派（handlers/session.rs:204）
 * 却找不到字面量构造点（pager 经常量/helper 发），只靠构造侧会误判为不存在。
 */
const RE_DISPATCH_ARM = /"(nofy\/[a-z0-9_\/]+)"(?:\s*\|\s*"(?:nofy\/[a-z0-9_\/]+)")*\s*=>/g;
const RE_DISPATCH_PREFIX = /starts_with\(\s*"(nofy\/[a-z0-9_\/]+)"\s*\)/g;
const dispatched = new Map<string, string[]>();
const dispatchedPrefix = new Map<string, string[]>();

/**
 * 第三类分派证据：`args.method.as_ref() == "nofy/…"` 比较式。
 *
 * 前两类只认 match 臂与 starts_with，于是漏掉了 acp_agent.rs 的
 * `async fn ext_notification`（:1240）——它是**通知**处理器，体内一串
 * `if args.method.as_ref() == "…"`，没有任何响应构造点。
 * 漏掉的后果不是少几条名字，而是**把通知误判成请求**：
 * 实测 `_nofy/terminal/pty/input` 用 rpc() 发得 -32601 Method not found，
 * 而它在 :1414 由 ext_notification 处理（同族还有 permissions/reset :1318、
 * telemetry/* :1445+）。这正是陷阱 T13 的形状。
 * ⇒ 落在 ext_notification 体内的名归 dispatchedNotify；落在别处的 EQ 名
 *   归 dispatchedEqOther 供人工复核（当前为空，非空即说明判据要细化）。
 */
const RE_DISPATCH_EQ = /==\s*"(_?nofy\/[a-z0-9_\/]+)"/g;
const RE_NOTIFY_FN = /\bfn\s+ext_notification\s*\(/g;
const dispatchedNotify = new Map<string, string[]>();
const dispatchedEqOther = new Map<string, string[]>();

/**
 * 第四类证据：内核经 emit_client_ext(method, params) **助手**推送的事件。
 * 没有 ExtNotification::new 字面量，故构造侧扫不到；实测漏掉的两条是
 * nofy/search/fuzzy/status 与 nofy/search/content/status——正是 ⌘K 文件搜索的
 * 结果通道（探针 round 3 抓到帧后回源码定位：handle.rs:2321/2348）。
 */
const RE_EMIT_CLIENT = /emit_client_ext\(\s*"(?:_)?(nofy\/[a-z0-9_\/]+)"/g;
const emittedClient = new Map<string, string[]>();

/**
 * 全字面量普查：任何 "nofy/…" 字符串都记下来，最后与各类证据对账。
 * 目的不是分类，而是**发现盲区**——内核新增一个方法名而我们没有任何桶收它时，
 * 它会落进 unclassifiedLiterals，让门禁失败并逼一次人工裁决。
 */
const RE_ANY_NAME = /"(?:_)?(nofy\/[a-z0-9_\/]+)"/g;
const allLiterals = new Map<string, string[]>();

/**
 * 已知**不是方法名**的字面量（_meta 键 / 参数键 / 测试夹具），逐条给理由。
 * 留此表是为了让「普查无盲区」成为可断言的门禁，而不是靠人记得。
 */
const LITERAL_ALLOWLIST: Record<string, string> = {
  "nofy/replayed": "_meta 键（EXT_META_KEY 已登记）：pager 客户端侧回放抑制标记",
  "nofy/hooks": "_meta 键：session/new 与 initialize 的客户端钩子注册（hooks.rs:150-192）",
  "nofy/display_cwd": "_meta 键：session/new 的展示用 cwd（session_setup.rs:781）",
  "nofy/persist": "_meta 键：session/new 持久化开关（session_setup.rs:623）",
  "nofy/skip_envrc": "_meta 键：session/new 跳过 envrc（session_setup.rs:746）",
  "nofy/facets": "参数键：unified_list 的过滤面（unified_list/mod.rs:426）",
  "nofy/limit": "参数键：unified_list 分页（unified_list/mod.rs:169）",
  "nofy/query": "参数键：unified_list 查询（unified_list/mod.rs:165）",
  "nofy/cloud_existing_workspace": "_meta 键：pager 云端工作区（effects/helpers.rs:412）",
  "nofy/cloud_server_id": "_meta 键：pager 云端服务标识（effects/helpers.rs:350）",
  "nofy/partial": "_meta 键：pager 局部更新（actions.rs:2163）",
  "nofy/restore_code": "_meta 键：pager headless 恢复（headless.rs:580）",
  "nofy/session": "_meta 键：pager 视图状态（app_view.rs:806）",
  "nofy/noop": "测试夹具名（handle.rs 的 sink 测试）",
  "nofy/other": "测试夹具名（headless ext_protocol 测试）",
  "nofy/s1": "测试夹具名（repos.rs 单测）",
  "nofy/sess": "测试夹具名（pager-pty-harness）",
  "nofy/test": "测试夹具名（nofy-acp-lib channel 单测）",
  "nofy/queue/bogus": "测试夹具名（ext_parsers 负例）",
  "nofy/leader/not_a_method": "测试夹具名（headless 负例）",
};

/** 函数体字符区间：从 `{` 起按花括号配对到匹配的 `}`（与 stripCfgTest 同法）。 */
function bodySpan(src: string, from: number): [number, number] {
  const open = src.indexOf("{", from);
  if (open === -1) return [from, from];
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    const c = src[i];
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return [open, i];
    }
  }
  return [open, src.length];
}

for (const f of files) {
  const rel = relative(KERNEL_ROOT, f);
  if (/(^|\/|_)tests?(\/|_|\.)/.test(rel) || rel.includes("/tests/")) continue;
  const rawSrc = readFileSync(f, "utf8");
  const src = stripCfgTest(rawSrc);
  const crate = rel.split("/")[0] ?? "?";
  for (const [re, target] of [[RE_DISPATCH_ARM, dispatched], [RE_DISPATCH_PREFIX, dispatchedPrefix]] as const) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(src)) !== null) {
      const name = m[1];
      if (name === undefined) continue;
      // 多名 arm（"a" | "b" =>）要把每个名都记上
      const all = [...m[0].matchAll(/"(nofy\/[a-z0-9_\/]+)"/g)].map((x) => x[1]).filter((x): x is string => typeof x === "string");
      const line = src.slice(0, m.index).split("\n").length;
      for (const n of all.length > 0 ? all : [name]) {
        const loc = crate + "/" + rel + ":" + String(line);
        const arr = target.get(n) ?? [];
        if (!arr.includes(loc)) arr.push(loc);
        target.set(n, arr);
      }
    }
  }
  // EQ 式分派：先算出本文件里 ext_notification 的体区间，再按落点分桶
  const notifyRanges: Array<[number, number]> = [];
  RE_NOTIFY_FN.lastIndex = 0;
  let nm: RegExpExecArray | null;
  while ((nm = RE_NOTIFY_FN.exec(src)) !== null) notifyRanges.push(bodySpan(src, nm.index));
  RE_DISPATCH_EQ.lastIndex = 0;
  let em: RegExpExecArray | null;
  while ((em = RE_DISPATCH_EQ.exec(src)) !== null) {
    const raw = em[1];
    if (raw === undefined) continue;
    const name = raw.replace(/^_/, "");
    const line = src.slice(0, em.index).split("\n").length;
    const loc = crate + "/" + rel + ":" + String(line);
    const inNotify = notifyRanges.some(([a, b]) => em.index >= a && em.index <= b);
    const target = inNotify ? dispatchedNotify : dispatchedEqOther;
    const arr = target.get(name) ?? [];
    if (!arr.includes(loc)) arr.push(loc);
    target.set(name, arr);
  }
  for (const [re, target] of [[RE_EMIT_CLIENT, emittedClient], [RE_ANY_NAME, allLiterals]] as const) {
    re.lastIndex = 0;
    let m2: RegExpExecArray | null;
    while ((m2 = re.exec(src)) !== null) {
      const name = m2[1];
      if (name === undefined) continue;
      const line = src.slice(0, m2.index).split("\n").length;
      const loc = crate + "/" + rel + ":" + String(line);
      const arr = target.get(name) ?? [];
      if (!arr.includes(loc)) arr.push(loc);
      target.set(name, arr);
    }
  }
}

/** nofy-pager 是 ACP 客户端（TUI）；其余 crate 属 agent 侧。 */
function isClientCrate(crate: string): boolean {
  return crate.startsWith("nofy-pager");
}

type Bucket = Record<string, string[]>;
const buckets: { clientRequest: Bucket; clientNotification: Bucket; kernelRequest: Bucket; kernelEvent: Bucket } = {
  clientRequest: {},
  clientNotification: {},
  kernelRequest: {},
  kernelEvent: {},
};

/**
 * 方向优先规则（有实测依据，见 docs/contract/kernel-ext-audit.md）：
 *   1. **内核侧构造优先**——内核发出来的才会上我们的线路。
 *      nofy/session/update 在 pager 侧也被 ExtNotification::new 构造，但那是
 *      subagent_{lifecycle,activity}.rs **本地重建**同一形状以复用处理路径，不是线路方向；
 *      内核侧 replay.rs:80/114 才是它上线的地方（turn_end.rs 称之为 persisted+replayed 轨）。
 *   2. 只有客户端侧构造时，才按客户端的种类归类。
 *   3. 两侧都构造 ⇒ 记 ambiguous，供人工复核，不静默择一。
 */
const ambiguous: string[] = [];
for (const s of sites) {
  const loc = s.crate + "/" + s.file + ":" + String(s.line);
  const kernelSide = !isClientCrate(s.crate);
  const bucket = kernelSide
    ? (s.kind === "request" ? buckets.kernelRequest : buckets.kernelEvent)
    : (s.kind === "request" ? buckets.clientRequest : buckets.clientNotification);
  const arr = bucket[s.name] ?? [];
  if (!arr.includes(loc)) arr.push(loc);
  bucket[s.name] = arr;
}
for (const name of new Set(sites.map((x) => x.name))) {
  const crates = new Set(sites.filter((x) => x.name === name).map((x) => x.crate));
  const hasClient = [...crates].some(isClientCrate);
  const hasKernel = [...crates].some((c) => !isClientCrate(c));
  if (hasClient && hasKernel) ambiguous.push(name);
}
ambiguous.sort();

const names = new Set<string>(sites.map((s) => s.name));

/**
 * 盲区对账：所有被任何一类证据收下的名 vs 全字面量普查。
 * 差集（去掉 allowlist 里的 _meta 键/参数键/测试夹具）就是**我们没分类的方法名**。
 * 门禁断言它为空——内核加了新面而我们的表没跟上时，这里会先响。
 */
const classifiedNames = new Set<string>([
  ...names,
  ...dispatched.keys(),
  ...dispatchedPrefix.keys(),
  ...dispatchedNotify.keys(),
  ...dispatchedEqOther.keys(),
  ...emittedClient.keys(),
  ...[...consts, ...nameAccessor].map((n) => n.replace(/^_/, "")),
]);
const unclassifiedLiterals = Object.fromEntries(
  [...allLiterals.entries()]
    .filter(([n]) => !classifiedNames.has(n) && LITERAL_ALLOWLIST[n] === undefined)
    .sort((a, b) => a[0].localeCompare(b[0])),
);
const payload = {
  generatedFrom: KERNEL_ROOT,
  generatedAt: new Date().toISOString(),
  rustFilesScanned: files.length,
  note:
    "方向判据：nofy-pager = ACP 客户端（TUI），其余 crate = agent 侧。" +
    "种类判据：ExtRequest::new = 请求（等响应）；ExtNotification::new = 通知（fire-and-forget）。",
  counts: {
    clientRequest: Object.keys(buckets.clientRequest).length,
    clientNotification: Object.keys(buckets.clientNotification).length,
    kernelRequest: Object.keys(buckets.kernelRequest).length,
    kernelEvent: Object.keys(buckets.kernelEvent).length,
    distinctNames: names.size,
    constDefinedNames: consts.size,
  },
  buckets,
  /** 两侧都构造的名：归类按「内核侧优先」，但需人工复核。 */
  ambiguous,
  /** 内核**接受**的名（match 臂，精确）。 */
  dispatched: Object.fromEntries([...dispatched.entries()].sort((a, b) => a[0].localeCompare(b[0]))),
  /** 内核**接受**的名（starts_with 前缀族）。 */
  dispatchedPrefix: Object.fromEntries([...dispatchedPrefix.entries()].sort((a, b) => a[0].localeCompare(b[0]))),
  /**
   * 内核在 **ext_notification 体内**以比较式接受的名 ⇒ **通知**，无响应。
   * 用 rpc() 发它们会得 -32601（实测 terminal/pty/input）。
   */
  dispatchedNotify: Object.fromEntries([...dispatchedNotify.entries()].sort((a, b) => a[0].localeCompare(b[0]))),
  /** 比较式分派但**不在** ext_notification 体内的名：需人工复核（期望为空）。 */
  dispatchedEqOther: Object.fromEntries([...dispatchedEqOther.entries()].sort((a, b) => a[0].localeCompare(b[0]))),
  /** 内核经 emit_client_ext 助手推送的事件名（内核 → 客户端，无构造点字面量）。 */
  emittedClient: Object.fromEntries([...emittedClient.entries()].sort((a, b) => a[0].localeCompare(b[0]))),
  /** 字面量普查的盲区：**没有任何桶收**且不在 allowlist（期望为空对象）。 */
  unclassifiedLiterals,
  /** 已知非方法名的字面量与理由（_meta 键 / 参数键 / 测试夹具）。 */
  literalAllowlist: LITERAL_ALLOWLIST,
  literalNamesScanned: allLiterals.size,
  /** 仅以常量定义出现、未找到构造点的名（可能经 helper 发送，或为内核内部用）。 */
  constOnly: [...consts].filter((n) => !names.has(n.replace(/^_/, "")) && !names.has(n)).sort(),
  /** 仅以枚举访问器出现的名（真实存在，但发送点经 enum→方法名间接构造）。 */
  nameAccessorOnly: [...nameAccessor]
    .filter((n) => !names.has(n) && !dispatched.has(n))
    .sort(),
  sitesSha256: createHash("sha256")
    .update(sites.map((s) => [s.name, s.kind, s.crate, s.file, s.line].join("|")).sort().join("\n"))
    .digest("hex"),
};

writeFileSync(OUT, JSON.stringify(payload, null, 2) + "\n");
console.log("generated", OUT);
console.log("  rust files scanned :", String(payload.rustFilesScanned));
console.log("  client→kernel 请求 :", String(payload.counts.clientRequest));
console.log("  client→kernel 通知 :", String(payload.counts.clientNotification));
console.log("  kernel→client 请求 :", String(payload.counts.kernelRequest), "（需客户端应答）");
console.log("  kernel→client 事件 :", String(payload.counts.kernelEvent));
console.log("  distinct 名        :", String(payload.counts.distinctNames));
console.log("  分派侧精确名       :", String(Object.keys(payload.dispatched).length));
console.log("  分派侧前缀族       :", String(Object.keys(payload.dispatchedPrefix).length));
console.log("  分派侧通知(EQ)     :", String(Object.keys(payload.dispatchedNotify).length) + (Object.keys(payload.dispatchedNotify).length > 0 ? " → " + Object.keys(payload.dispatchedNotify).join(", ") : ""));
console.log("  EQ 非通知(需复核)  :", String(Object.keys(payload.dispatchedEqOther).length) + (Object.keys(payload.dispatchedEqOther).length > 0 ? " → " + Object.keys(payload.dispatchedEqOther).join(", ") : ""));
console.log("  助手推送事件       :", String(Object.keys(payload.emittedClient).length) + (Object.keys(payload.emittedClient).length > 0 ? " → " + Object.keys(payload.emittedClient).join(", ") : ""));
console.log("  字面量普查         :", String(payload.literalNamesScanned) + " 个名，盲区 " + String(Object.keys(unclassifiedLiterals).length) + (Object.keys(unclassifiedLiterals).length > 0 ? " → " + Object.keys(unclassifiedLiterals).join(", ") : "（干净）"));
console.log("  两侧都构造(需复核) :", String(payload.ambiguous.length) + (payload.ambiguous.length > 0 ? " → " + payload.ambiguous.join(", ") : ""));
console.log("  仅枚举访问器       :", String(payload.nameAccessorOnly.length) + (payload.nameAccessorOnly.length > 0 ? " → " + payload.nameAccessorOnly.join(", ") : ""));
console.log("  仅常量定义         :", String(payload.constOnly.length));
