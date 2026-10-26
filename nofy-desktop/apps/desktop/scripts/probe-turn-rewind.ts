/** Real model tool writes, read-only preview and explicit rewind commits in temporary home/workspace. */
import { mkdtempSync, rmSync, existsSync, readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { InboundFrame } from "@nofy-desktop/acp";
import { AGENT_METHOD, CLIENT_SIDE_METHOD, EXT_KERNEL_EVENT, EXT_REQUEST } from "@nofy-desktop/acp";
import { getKernel } from "../main/acp/connection.ts";
import { createIsolatedNofyHome } from "../main/kernel/test-home.ts";
import { installReapHooks, setKernelEnv, shutdownKernel, spawnKernelChild } from "../main/kernel/supervisor.ts";
import { serviceResponse } from "../renderer/core/service-actions.ts";
import { summarizeProviderError } from "../main/acp/provider-error.ts";
installReapHooks();
const home = createIsolatedNofyHome({ copyConfig: true, configOverrides: { "ui.permission_mode": "always-approve" } });
const cwd = mkdtempSync(join(tmpdir(), "nofy-m2-rewind-"));
const conn = getKernel();
const report: Record<string, unknown> = {};
let replay = false;
let counts = { user: 0, marker: 0, agent: 0, tool: 0 };
conn.on("frame", (frame: InboundFrame) => {
  if (frame.kind === "response" && frame.error) report["kernelError"] = { code: frame.error.code, summary: summarizeProviderError(frame.error.data) };
  if (!replay || frame.kind !== "notification" || ![CLIENT_SIDE_METHOD.sessionUpdate, EXT_KERNEL_EVENT.session_update].includes(frame.method as never)) return;
  const update = serviceResponse(serviceResponse(frame.params)["update"]);
  if (update["sessionUpdate"] === "user_message_chunk") counts.user++;
  if (update["sessionUpdate"] === "rewind_marker") counts.marker++;
  if (update["sessionUpdate"] === "agent_message_chunk") counts.agent++;
  if (update["sessionUpdate"] === "tool_call") counts.tool++;
});
try {
  setKernelEnv({ ...process.env, NOFY_HOME: home.path }); conn.attachChild(spawnKernelChild()); await conn.ready(20_000);
  const modelId = process.env["NOFY_PROBE_MODEL"] ?? serviceResponse(conn.modelState)["currentModelId"];
  report["modelId"] = modelId;
  for (const mode of ["files_only", "all"] as const) {
    const evidence: Record<string, unknown> = {};
    report[mode] = evidence;
    const filename = `m2-rewind-${mode}.txt`;
    const file = join(cwd, filename);
    const created = serviceResponse(await conn.rpc(AGENT_METHOD.newSession, { cwd, mcpServers: [], _meta: typeof modelId === "string" ? { modelId } : {} }, 30_000));
    const id = String(created["sessionId"] ?? "");
    if (!id) throw new Error("Missing session identity");
    const turn = serviceResponse(await conn.rpc(AGENT_METHOD.prompt, { sessionId: id, prompt: [{ type: "text", text: `Use write_file to create ${filename} containing exactly M2_REWIND_OK and a newline. Do not create any other file. Then reply OK.` }] }, 120_000));
    evidence["stopReason"] = turn["stopReason"];
    evidence["fileWritten"] = existsSync(file) && readFileSync(file, "utf8").trim() === "M2_REWIND_OK";
    if (!evidence["fileWritten"]) throw new Error("Model tool write did not produce expected isolated test file");
    const points = serviceResponse(await conn.ext(EXT_REQUEST.rewindPoints, { sessionId: id }, 30_000));
    const rows = Array.isArray(points["rewind_points"]) ? points["rewind_points"] : [];
    const point = rows.find(p => p && typeof p === "object" && (p as Record<string, unknown>)["has_file_changes"] === true) as Record<string, unknown> | undefined;
    if (!point) throw new Error("No file checkpoint");
    evidence["checkpoint"] = { promptIndex: point["prompt_index"], snapshotCount: point["num_file_snapshots"], hasFileChanges: point["has_file_changes"] };
    const params = { sessionId: id, targetPromptIndex: point["prompt_index"], mode };
    const preview = serviceResponse(await conn.ext(EXT_REQUEST.rewindExecute, { ...params, force: false }, 30_000));
    evidence["preview"] = { success: preview["success"], mode: preview["mode"], cleanFiles: preview["clean_files"], conflicts: preview["conflicts"], error: preview["error"] };
    evidence["previewDidNotMutate"] = existsSync(file) && readFileSync(file, "utf8").trim() === "M2_REWIND_OK";
    if (preview["success"] !== false || preview["error"] !== null || !Array.isArray(preview["conflicts"]) || preview["conflicts"].length) throw new Error("Unsafe or invalid preview, refusing commit");
    const committed = serviceResponse(await conn.ext(EXT_REQUEST.rewindExecute, { ...params, force: true }, 30_000));
    evidence["commit"] = { success: committed["success"], mode: committed["mode"], revertedFiles: committed["reverted_files"], conflicts: committed["conflicts"], promptTextPresent: typeof committed["prompt_text"] === "string", error: committed["error"] };
    evidence["fileRemoved"] = !existsSync(file);
    if (committed["success"] !== true || existsSync(file)) throw new Error("Commit did not revert actual file");
    counts = { user: 0, marker: 0, agent: 0, tool: 0 }; replay = true;
    await conn.rpc(AGENT_METHOD.loadSession, { sessionId: id, cwd, mcpServers: [] }, 30_000);
    replay = false; evidence["freshLoadReplay"] = { ...counts };
    if (mode === "all" && counts.user !== 0) throw new Error("All rewind fresh load replayed removed user turns");
    if (mode === "files_only" && counts.user < 1) throw new Error("Files-only rewind unexpectedly removed conversation");
    evidence["passed"] = true;
    console.log(mode, "PASS");
  }
} catch (error) {
  report["failure"] = { message: error instanceof Error ? error.message : String(error) }; process.exitCode = 1;
} finally {
  replay = false; conn.close(); shutdownKernel(); setKernelEnv(null); home.cleanup(); rmSync(cwd, { recursive: true, force: true });
  await writeFile(new URL("../../../docs/contract/turn-rewind-probe.json", import.meta.url), JSON.stringify({ generatedAt: new Date().toISOString(), version: conn.agentVersion, report }, null, 2) + "\n");
  console.log(JSON.stringify(report));
}
