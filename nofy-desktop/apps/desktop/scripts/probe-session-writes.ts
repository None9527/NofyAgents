/** Isolated lifecycle probe; no model prompt and no real session/config writes. */
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { writeFile } from "node:fs/promises";
import { AGENT_METHOD, EXT_CLIENT_REQUEST, EXT_REQUEST } from "@nofy-desktop/acp";
import { getKernel } from "../main/acp/connection.ts";
import { createIsolatedNofyHome } from "../main/kernel/test-home.ts";
import { installReapHooks, setKernelEnv, shutdownKernel, spawnKernelChild } from "../main/kernel/supervisor.ts";
import { serviceResponse } from "../renderer/core/service-actions.ts";
installReapHooks();
const home = createIsolatedNofyHome({ copyConfig: true });
const cwd = mkdtempSync(join(tmpdir(), "nofy-m2-中文 space-"));
const report: Record<string, unknown> = {};
const conn = getKernel();
async function probe(name: string, job: () => Promise<unknown>) {
  try { const value = await job(); report[name] = { ok: true, value }; console.log(name, "PASS"); return value; }
  catch (e) { report[name] = { ok: false, error: e instanceof Error ? e.message : String(e) }; console.log(name, "FAIL"); return null; }
}
try {
  setKernelEnv({ ...process.env, NOFY_HOME: home.path });
  conn.attachChild(spawnKernelChild());
  await conn.ready(20_000);
  const created = await conn.rpc(AGENT_METHOD.newSession, { cwd, mcpServers: [] }, 30_000);
  const id = String(serviceResponse(created)["sessionId"] ?? "");
  if (!id) throw new Error("Session creation returned no identity");
  await probe("rename", () => conn.ext(EXT_REQUEST.sessionRename, { sessionId: id, cwd, title: "M2 isolated title" }, 30_000));
  await probe("rename-invalid", () => conn.ext(EXT_REQUEST.sessionRename, { sessionId: id, cwd, title: "   " }, 30_000));
  await probe("reload", async () => {
    const value = await conn.rpc(AGENT_METHOD.loadSession, { sessionId: id, cwd, mcpServers: [], _meta: { noReplay: true } }, 30_000);
    const o = serviceResponse(value); return { sessionId: o["sessionId"], meta: o["_meta"] };
  });
  await probe("search", () => conn.ext(EXT_CLIENT_REQUEST.session_search, { query: "isolated", cwd, limit: 20, offset: 0, includeContent: true, headless: "exclude" }, 30_000));
  await probe("rewind-points", () => conn.ext(EXT_REQUEST.rewindPoints, { sessionId: id }, 30_000));
  const fork = await probe("fork", () => conn.ext(EXT_REQUEST.sessionFork, { sourceSessionId: id, sourceCwd: cwd, newCwd: cwd }, 30_000));
  const forkId = serviceResponse(fork)["newSessionId"];
  if (typeof forkId === "string") await probe("fork-delete", () => conn.ext(EXT_REQUEST.sessionDelete, { sessionId: forkId, cwd }, 30_000));
  await probe("delete", () => conn.ext(EXT_REQUEST.sessionDelete, { sessionId: id, cwd }, 30_000));
  await writeFile(new URL("../../../docs/contract/session-write-probe.json", import.meta.url), JSON.stringify({ generatedAt: new Date().toISOString(), binaryVersion: conn.agentVersion, report }, null, 2) + "\n");
} finally {
  conn.close(); shutdownKernel(); setKernelEnv(null); home.cleanup(); rmSync(cwd, { recursive: true, force: true });
}
