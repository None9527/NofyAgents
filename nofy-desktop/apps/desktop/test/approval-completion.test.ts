import { test } from "node:test";
import assert from "node:assert/strict";
import { readPlan, planResponse } from "../renderer/features/approvals/planModel.ts";
import { elicitDefaults, readElicitForm, validateElicit, mcpElicitResponse } from "../renderer/features/approvals/elicitationModel.ts";
import { permissionScope, permissionResponse } from "../renderer/features/approvals/permModel.ts";

test("plan distinguishes abandonment from feedback and reads only kernel contents", () => {
  assert.equal(readPlan({ planContent: "# plan" }), "# plan");
  assert.equal(readPlan({ planPath: "/secret", planContent: " " }), null);
  assert.deepEqual(planResponse("cancelled", " revise "), { outcome: "cancelled", feedback: "revise" });
  assert.deepEqual(planResponse("approved", "ignore"), { outcome: "approved" });
  assert.deepEqual(planResponse("abandoned"), { outcome: "abandoned" });
});
test("form rejects missing requirements and unsafe integers without dropping unsupported fields", () => {
  const form = readElicitForm({ requestedSchema: { type: "object", properties: { name: { type: "string", minLength: 2 }, count: { type: "integer", minimum: 1 }, flag: { type: "boolean" } }, required: ["name"] } });
  assert.equal(validateElicit(form, elicitDefaults(form)).errors.name, "请填写必填字段");
  const result = validateElicit(form, { name: "你好", count: "2", flag: false });
  assert.deepEqual({ ...result.content }, { name: "你好", count: 2, flag: false });
  assert.equal(Object.keys(result.errors).length, 0);
  assert.ok(validateElicit(form, { name: "ok", count: "9007199254740993" }).errors.count);
  const unsupported = readElicitForm({ requestedSchema: { properties: { nested: { type: "object" } } } });
  assert.ok(validateElicit(unsupported, {}).errors.nested);
});
test("form supports titled and multiple enums and validates dates", () => {
  const form = readElicitForm({ requestedSchema: { properties: { choice: { oneOf: [{ const: "a", title: "A" }] }, tags: { type: "array", items: { enum: ["x", "y"] }, minItems: 1 }, date: { type: "string", format: "date" } } } });
  assert.equal(form.fields[0]?.options[0]?.label, "A");
  assert.equal(Object.keys(validateElicit(form, { choice: "a", tags: ["x"], date: "2026-10-08" }).errors).length, 0);
  assert.ok(validateElicit(form, { tags: ["z"], date: "2026-02-30" }).errors.date);
  assert.deepEqual(mcpElicitResponse("accept", { choice: "a" }), { outcome: "accept", content: { choice: "a" } });
  assert.deepEqual(mcpElicitResponse("cancel"), { outcome: "cancel" });
  assert.deepEqual(mcpElicitResponse("decline"), { outcome: "decline" });
});
test("permission scopes trust supplied metadata and rejection feedback uses response meta", () => {
  assert.equal(permissionScope({ options: [{ optionId: "allow-always-mcp", name: "server__tool" }] }, "allow-always-mcp"), null);
  assert.deepEqual(permissionScope({ options: [{ optionId: "allow-always-mcp", _meta: { tool_name: "s__t", server_prefix: "s" } }] }, "allow-always-mcp"), { toolName: "s__t", server: "s" });
  assert.deepEqual(permissionResponse("reject-once", { followup_message: "adjust" }), { outcome: { outcome: "selected", optionId: "reject-once" }, _meta: { followup_message: "adjust" } });
});
