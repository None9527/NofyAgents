/**
 * 线路名 codegen：schema/meta.unstable.json → src/generated/wire-names.ts
 *
 * 为什么要有这一步（PLAN.md §12.1「不得凭空造名」的结构性落地）：
 * 手写 266+ 个线路名迟早抄错。**已经错过一次**——methods.ts 初版把
 * KillTerminalCommand 这个 Rust 枚举变体名反推成线路名 "terminal/kill_command"，
 * 而权威 schema 是 "terminal/kill"。生成器第一次跑就抓到了它。
 *
 * 上游出处（务必保持可复现）：
 *   crate   : agent-client-protocol-schema 0.11.4（Apache-2.0，LICENSE 已随 schema/ 入库）
 *   被谁锁定: nofy-build/Cargo.lock:60-62；nofy 直接依赖 agent-client-protocol 0.10.4
 *             且 features=["unstable"]（Cargo.toml:112、nofy-acp-lib/Cargo.toml:8）
 *   生成命令: cargo run --bin generate --features unstable --release
 *   产物    : schema/schema.unstable.json + schema/meta.unstable.json
 *
 * 跑法：node packages/acp/scripts/gen-wire-names.ts
 * 门禁：packages/acp/test/wire-names-drift.test.ts 会校验生成物与 meta 的 sha256 一致，
 *       即「改了 meta 没重跑生成器」会让测试红。
 */
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(here, "..");
const metaPath = join(pkgRoot, "schema", "meta.unstable.json");
const outDir = join(pkgRoot, "src", "generated");
const outPath = join(outDir, "wire-names.ts");

type Meta = {
  version: number;
  agentMethods: Record<string, string>;
  clientMethods: Record<string, string>;
  protocolMethods?: Record<string, string>;
};

const raw = readFileSync(metaPath, "utf8");
const meta = JSON.parse(raw) as Meta;
const sha256 = createHash("sha256").update(raw).digest("hex");

function table(constName: string, src: Record<string, string>): string {
  const lines = Object.keys(src)
    .sort()
    .map((k) => "  " + k + ": " + JSON.stringify(src[k]) + ",");
  return "export const " + constName + " = {\n" + lines.join("\n") + "\n} as const;\n";
}

function union(typeName: string, constName: string): string {
  return "export type " + typeName + " = (typeof " + constName + ")[keyof typeof " + constName + "];\n";
}

const out = `/**
 * GENERATED FILE — DO NOT EDIT.
 *
 * 源     : packages/acp/schema/meta.unstable.json
 * 源 sha : ${sha256}
 * 生成器 : packages/acp/scripts/gen-wire-names.ts
 * 上游   : agent-client-protocol-schema 0.11.4 (Apache-2.0), features=["unstable"]
 * 命令   : cargo run --bin generate --features unstable --release
 *
 * 这些是 ACP 协议的**权威线路名**。手写常量必须引用这里的值，不得写字面量——
 * 如此任何拼错都会在类型层失败（见 methods.ts 的 satisfies 约束）。
 */

/** ACP protocolVersion（initialize 请求用）。 */
export const ACP_PROTOCOL_VERSION = ${meta.version};

/** agent 侧方法（客户端 → 内核）。${Object.keys(meta.agentMethods).length} 条。 */
${table("AGENT_WIRE", meta.agentMethods)}
/** client 侧方法（内核 → 客户端，多数需应答）。${Object.keys(meta.clientMethods).length} 条。 */
${table("CLIENT_WIRE", meta.clientMethods)}
/** 协议级方法。${Object.keys(meta.protocolMethods ?? {}).length} 条。 */
${table("PROTOCOL_WIRE", meta.protocolMethods ?? {})}
${union("AgentWireName", "AGENT_WIRE")}
${union("ClientWireName", "CLIENT_WIRE")}
${union("ProtocolWireName", "PROTOCOL_WIRE")}
/** 生成物指纹，供 drift 测试校验「改了 meta 没重跑生成器」。 */
export const META_SHA256 = ${JSON.stringify(sha256)};
`;

mkdirSync(outDir, { recursive: true });
writeFileSync(outPath, out);
console.log("generated", outPath);
console.log("  agent methods   :", Object.keys(meta.agentMethods).length);
console.log("  client methods  :", Object.keys(meta.clientMethods).length);
console.log("  protocol methods:", Object.keys(meta.protocolMethods ?? {}).length);
console.log("  meta sha256     :", sha256);

