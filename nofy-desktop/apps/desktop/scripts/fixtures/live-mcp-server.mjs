/** Hermetic MCP stdio fixture: actual tools and one form elicitation, no network/files/config. */
import { createInterface } from "node:readline";
const pending = new Map();
let sequence = 0;
const send = message => process.stdout.write(JSON.stringify({ jsonrpc: "2.0", ...message }) + "\n");
const tools = ["live_echo", "live_form"].map(name => ({ name, description: name === "live_form" ? "Request a region form" : "Hermetic echo", inputSchema: { type: "object", properties: {} } }));
createInterface({ input: process.stdin }).on("line", line => {
  try {
    const message = JSON.parse(line);
    if (message.method === undefined && pending.has(message.id)) {
      const toolId = pending.get(message.id);
      pending.delete(message.id);
      const accepted = message.result?.action === "accept" && message.result?.content?.region === "test";
      send({ id: toolId, result: { content: [{ type: "text", text: accepted ? "LIVE_FORM_ACCEPTED" : "LIVE_FORM_OTHER" }] } });
      return;
    }
    if (message.id === undefined) return;
    let result;
    if (message.method === "initialize") result = { protocolVersion: message.params.protocolVersion, capabilities: { tools: {} }, serverInfo: { name: "nofy-live-test", version: "1.0.0" } };
    else if (message.method === "tools/list") result = { tools };
    else if (message.method === "tools/call" && message.params.name === "live_form") {
      const id = "live-form-" + ++sequence;
      pending.set(id, message.id);
      send({ id, method: "elicitation/create", params: { mode: "form", message: "Choose the test region", requestedSchema: { type: "object", properties: { region: { type: "string", title: "Region", enum: ["test", "other"] } }, required: ["region"] } } });
      return;
    } else if (message.method === "tools/call") result = { content: [{ type: "text", text: "LIVE_MCP_OK" }] };
    else if (message.method === "ping") result = {};
    else { send({ id: message.id, error: { code: -32601, message: "unsupported" } }); return; }
    send({ id: message.id, result });
  } catch { /* Invalid protocol input is ignored; stdout contains only JSON-RPC frames. */ }
});
