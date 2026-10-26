import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
test("migrated settings views use domain capabilities and shared form controls", () => {
  for (const file of ["McpSettings.tsx", "PluginSettings.tsx"]) {
    const raw = readFileSync(new URL("../renderer/features/settings/" + file, import.meta.url), "utf8");
    const source = ts.createSourceFile(file, raw, ts.ScriptTarget.Latest, true);
    const forbidden: string[] = [];
    const visit = (node: ts.Node) => {
      if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && ["effect", "request", "dispatch"].includes(node.expression.name.text)) forbidden.push(node.expression.getText(source));
      if (ts.isStringLiteral(node) && ["service/request", "server_name", "session_id", "plugin_id", "set__write"].includes(node.text)) forbidden.push(node.text);
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) if (["input", "select", "textarea", "button"].includes(node.tagName.getText(source))) forbidden.push(node.tagName.getText(source));
      ts.forEachChild(node, visit);
    };
    visit(source); assert.deepEqual(forbidden, [], file);
  }
});
