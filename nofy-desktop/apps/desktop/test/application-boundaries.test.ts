import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import { inspectEdges } from "../scripts/architecture/graph.ts";
test("views must use public application entrances, including type imports", () => {
  const problems = inspectEdges([{ from: "renderer/features/a/view.ts", to: "renderer/application/workspace/private.ts", specifier: "../../application/workspace/private.ts", typeOnly: true, line: 1 }], { modules: [ { prefix: "renderer/features/a/", allow: ["renderer/application/"] }, { prefix: "renderer/application/", allow: ["renderer/application/"] } ], exceptions: [] });
  assert.deepEqual(problems.map(p => p.rule), ["application-private"]);
});
test("App and FilePane cannot regain raw protocol actions or projection mutation", () => {
  for (const path of ["features/shell/App.tsx", "features/aux/FilePane.tsx"]) {
    const text = readFileSync(new URL("../renderer/" + path, import.meta.url), "utf8");
    const source = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true);
    const forbidden: string[] = [];
    const visit = (node: ts.Node) => {
      if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && ["effect", "dispatch", "request", "notify", "respond"].includes(node.expression.name.text)) forbidden.push(node.expression.getText(source));
      ts.forEachChild(node, visit);
    };
    visit(source); assert.deepEqual(forbidden, [], path);
  }
});
