/**
 * 对既有夹具做一次性脱敏（补救用）。新录制由 record-turn.ts 在写盘前就脱敏。
 *
 * 跑法：node apps/desktop/scripts/redact-fixture.ts <夹具路径> [--dry]
 */
import { readFileSync, writeFileSync } from "node:fs";
import { redactWhole } from "../main/lib/redact.ts";

const target = process.argv[2];
const dry = process.argv.includes("--dry");
if (target === undefined || target === "--dry") {
  console.error("用法: node apps/desktop/scripts/redact-fixture.ts <夹具路径> [--dry]");
  process.exit(2);
}

const raw = readFileSync(target, "utf8");
const { text, stats } = redactWhole(raw);
console.log("");
console.log("脱敏", target);
console.log("  bytes        :", String(raw.length), "→", String(text.length));
console.log("  密钥值       :", String(stats.secrets));
console.log("  凭据字段     :", String(stats.credFields));
console.log("  用户名路径   :", String(stats.userPaths));
console.log("  临时目录     :", String(stats.tmpPaths));
console.log("  hostname     :", String(stats.hostnames));
console.log("  UUID 替换    :", String(stats.uuids), "（distinct", String(stats.distinctUuids) + "）");
if (dry) {
  console.log("  --dry：未写盘");
} else {
  writeFileSync(target, text);
  console.log("  已写盘");
}

