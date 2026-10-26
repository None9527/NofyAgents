/** Offline ACP probe: no credentials copied, no prompt or model request. */
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { ensureKernel, getKernel } from "../main/acp/connection.ts";
import { setKernelEnv, shutdownKernel } from "../main/kernel/supervisor.ts";
const home = await mkdtemp(join(tmpdir(), "nofy-workspace-contract-"));
const missing = join(home, "missing-project");
const valid = join(home, "valid-project");
await mkdir(valid);
const evidence: Record<string, unknown> = { generatedAt: new Date().toISOString(), scope: "Actual installed kernel, isolated empty NOFY_HOME, no prompt, credentials or model request" };
setKernelEnv({ ...process.env, NOFY_HOME: home });
try {
  const conn = await ensureKernel(15000);
  for (const [name, cwd] of [["valid", valid], ["missing", missing]] as const) {
    try {
      const response = await conn.rpc("session/new", { cwd, mcpServers: [] }, 10000);
      const value = response as { sessionId?: string };
      evidence[name] = { accepted: true, sessionIdPresent: typeof value.sessionId === "string" };
      if (name === "missing" && value.sessionId) {
        try { await conn.rpc("session/load", { sessionId: value.sessionId, cwd, mcpServers: [] }, 10000); evidence.missingLoad = { accepted: true }; }
        catch (e) { evidence.missingLoad = { accepted: false, error: e instanceof Error ? e.message : String(e) }; }
      }
    } catch (e) { evidence[name] = { accepted: false, error: e instanceof Error ? e.message : String(e) }; }
  }
  const output = resolve(import.meta.dirname, "../../../docs/architecture/backend-workspace-probe-2026-10-11.json");
  await writeFile(output, JSON.stringify(evidence, null, 2) + "\n");
  console.log(JSON.stringify(evidence, null, 2));
} finally {
  getKernel().close(); shutdownKernel(); setKernelEnv(null);
  await rm(home, { recursive: true, force: true });
}
