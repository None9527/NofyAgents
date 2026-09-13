/**
 * 夹具卫生审计——**首次提交前必须过**。
 *
 * 为什么要有：早期 smoke 是打真 ~/.nofy 录的，夹具里会带上真实工作区路径、
 * 会话标题与摘要。这些是用户数据，不该进仓库。S1b 之后夹具要当回归门用，
 * 所以「只提交隔离 home 录的夹具」必须是可机器检查的规矩，不能靠记性。
 *
 * 判据：
 *   - 文件名带 -isolated- ⇒ 允许入库
 *   - 内容含真实 home 路径（/Users/… 或 URL 编码 %2FUsers）⇒ 拒绝入库
 *   - 内容含 generated_title / session_summary / title 字段 ⇒ 拒绝入库（可能是会话标题）
 *
 * 跑法：node apps/desktop/scripts/audit-fixtures.ts [--fix]
 *   --fix：把不合规的夹具改名加 .local-only 后缀，使其不被提交。
 */
import { readdirSync, readFileSync, renameSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const FIXTURE_DIR = join(here, "..", "..", "..", "docs", "fixtures");
const FIX = process.argv.includes("--fix");
const SAFE_SUFFIX = ".local-only";

type Finding = {
  file: string;
  bytes: number;
  isolated: boolean;
  realPaths: number;
  titleFields: number;
  secrets: number;
  verdict: "ok" | "reject";
};

const files = readdirSync(FIXTURE_DIR).filter((f) => f.endsWith(".jsonl") || f.endsWith(".jsonl.invalid"));
const findings: Finding[] = [];

for (const f of files) {
  const full = join(FIXTURE_DIR, f);
  const raw = readFileSync(full, "utf8");
  const realPaths = (raw.match(/\/Users\/[A-Za-z0-9._-]+|%2FUsers%2F/g) ?? []).length;
  const titleFields = (raw.match(/generated_title|session_summary|\"title\"/g) ?? []).length;
  const isolated = f.includes("-isolated-");
  // golden-* 由 record-turn.ts 在隔离 home 里用**合成 prompt**录制：
  // 其标题/摘要派生自我们自己写的任务文本，不是用户数据，故不因 titleFields 拒绝。
  // 但密钥与真实路径**不因合成而豁免**——那两类是硬红线。
  const synthetic = f.startsWith("golden-");
  // 密钥检测：带真配置录制时，modelState / provider 信息有可能把凭据带进帧里。
  // 这一条**不看 isolated 与否**——隔离夹具里出现密钥同样拒绝入库。
  const secrets = (raw.match(/sk-[A-Za-z0-9_-]{8,}|"(api_?key|apiKey|bearer|access_?token|refresh_?token|password|secret)"\s*:/gi) ?? []).length;
  const verdict =
    secrets > 0 || (!isolated && (realPaths > 0 || (titleFields > 0 && !synthetic))) ? "reject" : "ok";
  findings.push({ file: f, bytes: statSync(full).size, isolated, realPaths, titleFields, secrets, verdict });
}

console.log("");
console.log("── 夹具卫生审计（" + FIXTURE_DIR + "）─────────────────");
for (const x of findings) {
  console.log(
    "  " + (x.verdict === "ok" ? "OK     " : "REJECT ") +
    x.file.padEnd(56) +
    String(x.bytes).padStart(8) + "B" +
    "  isolated=" + String(x.isolated).padEnd(5) +
    " realPaths=" + String(x.realPaths).padStart(3) +
    " titleFields=" + String(x.titleFields).padStart(3) +
    " secrets=" + String(x.secrets).padStart(3),
  );
}

const bad = findings.filter((x) => x.verdict === "reject");
if (bad.length === 0) {
  console.log("");
  console.log("── 结果: " + String(findings.length) + "/" + String(findings.length) + " 可入库 ──");
  process.exit(0);
}

console.log("");
console.log("── " + String(bad.length) + " 份夹具含真实用户数据，不得入库 ──");
if (FIX) {
  for (const x of bad) {
    if (x.file.endsWith(SAFE_SUFFIX)) continue;
    const from = join(FIXTURE_DIR, x.file);
    const to = from + SAFE_SUFFIX;
    renameSync(from, to);
    console.log("   renamed →", x.file + SAFE_SUFFIX);
  }
  console.log("   （" + SAFE_SUFFIX + " 已在 .gitignore 内，不会被提交）");
  process.exit(0);
}
console.log("   重跑加 --fix 可自动改名隔离。");
process.exit(1);



