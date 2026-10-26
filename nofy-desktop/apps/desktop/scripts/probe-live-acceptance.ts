/** Real model and MCP acceptance against temporary NOFY_HOME/workspace. Saves summaries, never credentials/raw frames. */
import { mkdtempSync, rmSync, existsSync, readFileSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { InboundFrame } from "@nofy-desktop/acp";
import { AGENT_METHOD, CLIENT_SIDE_METHOD, EXT_INDIRECT, EXT_REQUEST } from "@nofy-desktop/acp";
import { KernelConnection } from "../main/acp/connection.ts";
import { createIsolatedNofyHome } from "../main/kernel/test-home.ts";
import { installReapHooks, kernelChildCount, setKernelEnv, shutdownKernel, spawnKernelChild } from "../main/kernel/supervisor.ts";
import { serviceResponse } from "../renderer/core/service-actions.ts";
import { summarizeProviderError } from "../main/acp/provider-error.ts";
import { readQuestionnaire, acceptedPayload } from "../renderer/features/approvals/questionModel.ts";
import { mcpElicitResponse, readElicitForm, validateElicit } from "../renderer/features/approvals/elicitationModel.ts";
import { planResponse } from "../renderer/features/approvals/planModel.ts";
const only = process.argv.find(argument => argument.startsWith("--only="))?.slice(7);
const home = createIsolatedNofyHome({ copyConfig: true, configOverrides: { "ui.permission_mode": "default" } });
const workspace = mkdtempSync(join(tmpdir(), "nofy-live-acceptance-"));
const configPath = join(home.path, "config.json");
const config = JSON.parse(await readFile(configPath, "utf8")) as Record<string, unknown>;
// Preserve model config only in the temporary copy; do not connect inherited real ecosystem servers/plugins.
delete config["mcp_servers"]; delete config["plugins"]; delete config["marketplace"];
await writeFile(configPath, JSON.stringify(config), { mode: 0o600 });
installReapHooks();
setKernelEnv({ ...process.env, NOFY_HOME: home.path });
const conn = new KernelConnection();
const report: Record<string, unknown> = {};
if (only) { try { const previous = JSON.parse(await readFile(new URL("../../../docs/contract/frontend-live-acceptance.json", import.meta.url), "utf8")); Object.assign(report, previous.report); } catch {} }
const events = { question: 0, plan: 0, permission: 0, userChunks: 0, toolStarted: 0, malformed: 0, elicitation: 0 };
let questionAnswers = 0;
let planCharacters = 0;
let observedTurnTool: (() => void) | null = null;
let observedStream: (() => void) | null = null;
const toolNames = new Set<string>();
conn.on("frame", (frame: InboundFrame) => {
  if (frame.kind === "malformed") events.malformed++;
  if (frame.kind === "response" && frame.error) report["lastError"] = { code: frame.error.code, summary: summarizeProviderError(frame.error.data) };
  if (frame.kind !== "notification" || frame.method !== CLIENT_SIDE_METHOD.sessionUpdate) return;
  const params = serviceResponse(frame.params);
  const update = serviceResponse(params["update"]);
  const kind = update["sessionUpdate"];
  if (typeof update["name"] === "string") toolNames.add(update["name"]);
  if (kind === "user_message_chunk") events.userChunks++;
  if (kind === "tool_call" || (kind === "tool_call_update" && update["status"] === "in_progress")) { events.toolStarted++; observedTurnTool?.(); observedTurnTool = null; }
  if (kind === "agent_message_chunk" || kind === "agent_thought_chunk") { observedStream?.(); observedStream = null; }
});
conn.on("askUserQuestion", ({ id, params }) => {
  events.question++;
  const questionnaire = readQuestionnaire(params);
  const choices = questionnaire.questions.map(question => ({ labels: question.options[0] ? [question.options[0].label] : [], notes: "" }));
  const payload = acceptedPayload(questionnaire.questions, choices);
  if (payload) { questionAnswers += questionnaire.questions.length; conn.respond(id, payload); }
  else conn.respond(id, { outcome: "cancelled" });
});
conn.on("exitPlanMode", ({ id, params }) => {
  events.plan++;
  const content = params["planContent"];
  if (typeof content === "string" && content.trim()) { planCharacters += content.length; conn.respond(id, planResponse("approved")); }
  else conn.respond(id, planResponse("abandoned"));
});
conn.on("permission", ({ id, params }) => {
  events.permission++;
  const options = Array.isArray(params["options"]) ? params["options"] : [];
  const allowed = options.find(option => option && typeof option === "object" && (option as Record<string, unknown>)["optionId"] === "allow-once") as Record<string, unknown> | undefined;
  const sent = conn.respondPermission(id, allowed && typeof allowed["optionId"] === "string" ? { outcome: "selected", optionId: allowed["optionId"] } : { outcome: "cancelled" });
  const call = serviceResponse(params["toolCall"]);
  report["lastPermissionDecision"] = { optionId: allowed?.["optionId"] ?? null, sent, kinds: options.flatMap(option => option && typeof option === "object" ? [{ optionId: (option as Record<string, unknown>)["optionId"], kind: (option as Record<string, unknown>)["kind"] }] : []), matchesPermissionTestFile: JSON.stringify(call).includes("live-permission.txt") };
});
conn.on("elicitation", ({ id, method, params }) => {
  events.elicitation++;
  const form = readElicitForm(params);
  const validated = validateElicit(form, { region: "test" });
  const accepted = !form.error && Object.keys(validated.errors).length === 0;
  report["elicitationSchema"] = { fieldNames: form.fields.map(field => field.name), valid: accepted };
  conn.respond(id, method === EXT_INDIRECT.mcp_elicit ? mcpElicitResponse(accepted ? "accept" : "cancel", validated.content) : { action: { outcome: accepted ? "accepted" : "cancelled", ...(accepted ? { content: validated.content } : {}) } });
});
conn.on("folderTrust", ({ id }) => conn.respond(id, { outcome: "trust" }));
const delay = (ms: number) => new Promise<void>(done => setTimeout(done, ms));
async function probe(label: string, operation: () => Promise<unknown>) {
  if (only && only !== label) return;
  const before = { ...events };
  try { const evidence = await operation(); const observed = Object.fromEntries(Object.entries(events).map(([key, value]) => [key, value - before[key as keyof typeof events]])); report[label] = { passed: true, generatedAt: new Date().toISOString(), observedEvents: observed, evidence }; console.log(label, "PASS"); }
  catch (error) { const observed = Object.fromEntries(Object.entries(events).map(([key, value]) => [key, value - before[key as keyof typeof events]])); const file = join(workspace, "live-permission.txt"); report[label] = { passed: false, generatedAt: new Date().toISOString(), observedEvents: observed, error: error instanceof Error ? error.message : String(error), ...(label === "permission-allow-once" ? { fileExists: existsSync(file), fileMatches: existsSync(file) && readFileSync(file, "utf8").trim() === "LIVE_PERMISSION_OK", permissionDecision: report["lastPermissionDecision"], toolNames: [...toolNames] } : {}) }; console.log(label, "FAIL"); }
}
async function createSession() {
  const modelId = serviceResponse(conn.modelState)["currentModelId"];
  const created = serviceResponse(await conn.rpc(AGENT_METHOD.newSession, { cwd: workspace, mcpServers: [], _meta: typeof modelId === "string" ? { modelId } : {} }, 30_000));
  const sessionId = created["sessionId"];
  if (typeof sessionId !== "string") throw new Error("Missing session identity");
  return sessionId;
}
async function prompt(sessionId: string, text: string) {
  return serviceResponse(await conn.rpc(AGENT_METHOD.prompt, { sessionId, prompt: [{ type: "text", text }] }, 120_000));
}
async function waitFor(signal: "tool" | "stream", timeout = 60_000) {
  let timer: ReturnType<typeof setTimeout>;
  await new Promise<void>((done, reject) => {
    timer = setTimeout(() => reject(new Error("Expected " + signal + " event was not observed")), timeout);
    const resolve = () => { clearTimeout(timer); done(); };
    if (signal === "tool") observedTurnTool = resolve; else observedStream = resolve;
  });
}
const MCP_NAME = "live-acceptance";
async function readMcp(sessionId: string) {
  const response = serviceResponse(await conn.ext(EXT_REQUEST.mcpList, { sessionId, cache: false }, 15_000));
  const rows = Array.isArray(response["servers"]) ? response["servers"] : [];
  const server = rows.find(row => row && typeof row === "object" && (row as Record<string, unknown>)["name"] === MCP_NAME) as Record<string, unknown> | undefined;
  const state = serviceResponse(server?.["session"]);
  const tools = Array.isArray(state["tools"]) ? state["tools"].flatMap(tool => tool && typeof tool === "object" && typeof (tool as Record<string, unknown>)["name"] === "string" ? [(tool as Record<string, unknown>)["name"]] : []) : [];
  return { present: !!server, enabled: state["enabled"] === true, status: state["status"], tools };
}
try {
  conn.attachChild(spawnKernelChild()); await conn.ready(20_000);
  report["kernelVersion"] = conn.agentVersion; report["modelId"] = serviceResponse(conn.modelState)["currentModelId"];
  await probe("question-accept", async () => {
    const sessionId = await createSession(); const before = events.question;
    const result = await prompt(sessionId, "Call ask_user_question exactly once. Ask 'Choose a test value' with Alpha and Beta options. Wait for the answer, then reply only the chosen label. Do not call other tools.");
    if (events.question <= before || questionAnswers === 0) throw new Error("Model did not issue the real question server request");
    return { serverRequests: events.question - before, answeredQuestions: questionAnswers, stopReason: result["stopReason"] };
  });
  await probe("permission-allow-once", async () => {
    const sessionId = await createSession(); const before = events.permission;
    const result = await prompt(sessionId, "Use write_file to create live-permission.txt containing LIVE_PERMISSION_OK and a newline. Do not modify any other file. Finish with OK.");
    const file = join(workspace, "live-permission.txt");
    if (events.permission <= before || !existsSync(file) || readFileSync(file, "utf8").trim() !== "LIVE_PERMISSION_OK") throw new Error("No real allow-once permission followed by tool execution");
    return { serverRequests: events.permission - before, decision: "allow_once", fileMatches: true, stopReason: result["stopReason"] };
  });
  await probe("plan-approve", async () => {
    const sessionId = await createSession(); const before = events.plan;
    await conn.rpc(AGENT_METHOD.setSessionMode, { sessionId, modeId: "plan" }, 15_000);
    const result = await prompt(sessionId, "Make a tiny plan to create live-plan.txt containing LIVE_PLAN_OK and a newline. Write the plan into the designated plan file, then call exit_plan_mode to ask approval. Once approved, execute it using write_file. Do not modify any other workspace file. Finish with OK.");
    if (events.plan <= before || planCharacters === 0) throw new Error("No readable real plan approval server request");
    const file = join(workspace, "live-plan.txt");
    return { serverRequests: events.plan - before, planCharacters, stopReason: result["stopReason"], implementationFileExists: existsSync(file), implementationMatches: existsSync(file) && readFileSync(file, "utf8").trim() === "LIVE_PLAN_OK" };
  });
  await probe("mcp-stdio-lifecycle", async () => {
    const sessionId = await createSession();
    const serverPath = join(workspace, "mcp-test.mjs");
    await writeFile(serverPath, await readFile(new URL("fixtures/live-mcp-server.mjs", import.meta.url), "utf8"));
    const upsert = serviceResponse(await conn.ext(EXT_REQUEST.mcpUpsert, { session_id: sessionId, server_name: MCP_NAME, command: process.execPath, args: [serverPath] }, 30_000));
    let ready = await readMcp(sessionId);
    for (let attempt = 0; attempt < 30 && (ready.status !== "ready" || !ready.tools.includes("live_echo")); attempt++) { await delay(300); ready = await readMcp(sessionId); }
    if (upsert["ok"] !== true || ready.status !== "ready" || !ready.tools.includes("live_echo")) throw new Error("MCP did not expose a real ready tool: " + JSON.stringify(ready));
    const echo = serviceResponse(await conn.ext(EXT_INDIRECT.mcp_call, { sessionId, server: MCP_NAME, tool: "live_echo", arguments: {} }, 15_000));
    const echoContent = Array.isArray(echo["content"]) ? echo["content"] : [];
    if (!echoContent.some(item => item && typeof item === "object" && (item as Record<string, unknown>)["text"] === "LIVE_MCP_OK")) throw new Error("MCP tool did not execute");
    const beforeElicitation = events.elicitation;
    const form = serviceResponse(await conn.ext(EXT_INDIRECT.mcp_call, { sessionId, server: MCP_NAME, tool: "live_form", arguments: {} }, 15_000));
    const formContent = Array.isArray(form["content"]) ? form["content"] : [];
    if (events.elicitation <= beforeElicitation || !formContent.some(item => item && typeof item === "object" && (item as Record<string, unknown>)["text"] === "LIVE_FORM_ACCEPTED")) throw new Error("MCP form did not return a real accepted result");
    await conn.ext(EXT_REQUEST.mcpToggle, { session_id: sessionId, server_name: MCP_NAME, enabled: false }, 30_000);
    const disabled = await readMcp(sessionId);
    if (disabled.enabled) throw new Error("MCP disable was not reflected");
    await conn.ext(EXT_REQUEST.mcpToggle, { session_id: sessionId, server_name: MCP_NAME, enabled: true }, 30_000);
    let enabled = await readMcp(sessionId);
    for (let attempt = 0; attempt < 30 && (enabled.status !== "ready" || !enabled.tools.includes("live_echo")); attempt++) { await delay(300); enabled = await readMcp(sessionId); }
    if (!enabled.enabled || enabled.status !== "ready") throw new Error("MCP re-enable did not become ready");
    await conn.ext(EXT_REQUEST.mcpDelete, { session_id: sessionId, server_name: MCP_NAME }, 30_000);
    const deleted = await readMcp(sessionId);
    if (deleted.present) throw new Error("Deleted MCP is still in the catalog");
    return { ready, toolCallMatched: true, formAccepted: true, disabled, enabled, deleted };
  });
  await probe("cancel-running-tool", async () => {
    const sessionId = await createSession(); const signal = waitFor("tool");
    const pending = prompt(sessionId, "Call bash to run sleep 30 in the working directory, then reply DONE. Do not use any other tool.");
    void pending.catch(() => {});
    await signal; await delay(300);
    const sent = conn.cancel(sessionId);
    const result = await pending;
    if (!sent || result["stopReason"] !== "cancelled") throw new Error("Cancel did not end the real running turn as cancelled");
    return { stopReason: result["stopReason"], cancelSent: sent };
  });
  await probe("stream-interruption-and-history", async () => {
    const sessionId = await createSession(); const signal = waitFor("stream");
    const pending = prompt(sessionId, "Print integers from 1 to 500, one per line. Do not use tools.");
    let rejected = false; void pending.catch(() => { rejected = true; });
    await signal;
    const beforePid = conn.kernelPid;
    if (!beforePid) throw new Error("No kernel pid");
    const disconnected = new Promise<void>((done, reject) => {
      const timeout = setTimeout(() => reject(new Error("Kernel disconnect status was not observed")), 10_000);
      const listener = (status: { connected: boolean }) => { if (!status.connected) { clearTimeout(timeout); conn.off("status", listener); done(); } };
      conn.on("status", listener);
    });
    process.kill(beforePid, "SIGKILL");
    await disconnected;
    await conn.ready(25_000);
    const afterPid = conn.kernelPid;
    if (!afterPid || afterPid === beforePid || kernelChildCount() !== 1) throw new Error("Kernel failed to reconnect as exactly one child");
    const beforeChunks = events.userChunks;
    await conn.rpc(AGENT_METHOD.loadSession, { sessionId, cwd: workspace, mcpServers: [] }, 30_000);
    if (!rejected) throw new Error("Interrupted request did not reject");
    return { pendingRejected: rejected, pidChanged: afterPid !== beforePid, kernelChildren: kernelChildCount(), replayUserChunks: events.userChunks - beforeChunks, automaticPromptResend: false };
  });
} finally {
  conn.close(); shutdownKernel(); setKernelEnv(null); home.cleanup(); rmSync(workspace, { recursive: true, force: true });
  delete report["events"];
  report["eventsThisRun"] = events;
  report["runOnly"] = only ?? "all";
  report["scope"] = "Real ACP server requests and isolated MCP lifecycle; programmatic responses, not GUI E2E. No credentials/config/raw frames saved.";
  await writeFile(new URL("../../../docs/contract/frontend-live-acceptance.json", import.meta.url), JSON.stringify({ generatedAt: new Date().toISOString(), report }, null, 2) + "\n");
}
const failed = Object.values(report).some(value => value && typeof value === "object" && (value as Record<string, unknown>)["passed"] === false);
process.exitCode = failed ? 1 : 0;
