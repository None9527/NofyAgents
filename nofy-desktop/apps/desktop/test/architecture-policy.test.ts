import assert from "node:assert/strict";
import test from "node:test";
import ts from "typescript";
import { scanModuleReferences, inspectEdges, checkBudget } from "../scripts/architecture/graph.ts";
import type { Edge, Policy } from "../scripts/architecture/graph.ts";
import { resolveReference } from "../scripts/architecture/resolution.ts";
const policy: Policy = { modules: [
  { prefix: "renderer/features/a/", allow: ["renderer/features/a/", "renderer/application/", "renderer/ui/"] },
  { prefix: "renderer/features/b/", allow: ["renderer/features/b/", "renderer/ui/"] },
  { prefix: "renderer/core/", allow: ["renderer/core/"] },
  { prefix: "renderer/ui/", allow: ["renderer/ui/"] },
  { prefix: "main/", allow: ["main/"] },
], exceptions: [] };
const edge = (from: string, to: string, typeOnly = false, specifier = "./target.ts"): Edge => ({ from, to, typeOnly, specifier, line: 1 });
test("AST handles quotes, reexports, side effects, mixed types and literal dynamic imports", () => {
  const result = scanModuleReferences("view.tsx", [
    "// import fake from 'ignored';", "const copy = \"import fake from 'text'\";",
    "import {foo} from 'one';", 'import "side-effect";', "export * from 'reexport';",
    "import('dynamic');", "require('common');", "import type {A} from 'types';",
    "import {type A, type B} from 'named-types';", "import {type A, B} from 'mixed';",
    "export type {A} from 'export-types';", "export {type A} from 'export-named-types';",
    "type T = import('inline-types').T;", "import C = require('equals');", "import(`template-literal`);",
  ].join("\n"));
  assert.deepEqual(result.references.map(r => [r.specifier, r.typeOnly]), [
    ["one", false], ["side-effect", false], ["reexport", false], ["dynamic", false], ["common", false],
    ["types", true], ["named-types", true], ["mixed", false], ["export-types", true],
    ["export-named-types", true], ["inline-types", true], ["equals", false], ["template-literal", false],
  ]);
  assert.deepEqual(result.computed, []);
});
test("computed loading cannot evade the inventory", () => {
  assert.deepEqual(scanModuleReferences("a.ts", "import(path);\nrequire(prefix + name);\nimport(`./${name}.ts`);").computed, [1, 2, 3]);
});
test("aliases resolve to the real layer and missing local modules fail", () => {
  const files = new Set(["/virtual/app/renderer/core/private.ts", "/virtual/app/renderer/features/a/view.ts"]);
  const host: ts.ModuleResolutionHost = { fileExists: path => files.has(path), readFile: path => files.has(path) ? "export {};" : undefined, directoryExists: () => true };
  const resolved = resolveReference("@core/private", "/virtual/app/renderer/features/a/view.ts", "/virtual/app", { moduleResolution: ts.ModuleResolutionKind.Bundler, baseUrl: "/virtual/app", paths: { "@core/*": ["/virtual/app/renderer/core/*"] } }, host);
  assert.equal(resolved.target, "renderer/core/private.ts");
  assert.equal(resolved.unresolved, false);
  assert.equal(inspectEdges([edge("renderer/features/a/view.ts", resolved.target)], policy)[0]?.rule, "layer");
  assert.equal(resolveReference("./missing.ts", "/virtual/app/renderer/features/a/view.ts", "/virtual/app", {}, host).unresolved, true);
});
test("forbidden type edges, React and ACP subpaths are rejected", () => {
  const problems = inspectEdges([edge("renderer/features/a/view.ts", "main/secret.ts", true), edge("renderer/features/a/view.ts", "@nofy-desktop/acp/schema", true, "@nofy-desktop/acp/schema"), edge("renderer/core/model.ts", "react/jsx-runtime", true, "react/jsx-runtime")], policy);
  assert.deepEqual(problems.map(p => p.rule).sort(), ["layer", "react", "wire-package"]);
});
test("cross-feature implementation imports differ from public imports", () => {
  const allowed: Policy = { ...policy, modules: [{ prefix: "renderer/features/a/", allow: ["renderer/features/b/"] }, ...policy.modules.slice(1)] };
  assert.equal(inspectEdges([edge("renderer/features/a/view.ts", "renderer/features/b/private.ts")], allowed)[0]?.rule, "feature-private");
  assert.deepEqual(inspectEdges([edge("renderer/features/a/view.ts", "renderer/features/b/public.ts")], allowed), []);
});
test("runtime cycles are detected, type-only cycles are excluded", () => {
  const a = "renderer/core/a.ts", b = "renderer/core/b.ts", c = "renderer/core/c.ts";
  assert.equal(inspectEdges([edge(a, b), edge(b, c), edge(c, a)], policy).filter(p => p.rule === "runtime-cycle").length, 3);
  assert.deepEqual(inspectEdges([edge(a, b), edge(b, a, true)], policy), []);
});
test("budgets reject new edges, stale exceptions, missing explanations and duplicates", () => {
  const problems = inspectEdges([edge("renderer/core/a.ts", "main/a.ts")], policy);
  const id = problems[0]!.id;
  const legacy: Policy = { ...policy, exceptions: [{ id, reason: "Existing adapter", removal: "Move adapter to seam" }] };
  assert.deepEqual(checkBudget(problems, legacy), { unexpected: [], stale: [], invalid: [] });
  assert.equal(checkBudget([...problems, ...inspectEdges([edge("renderer/core/b.ts", "main/a.ts")], policy)], legacy).unexpected.length, 1);
  assert.deepEqual(checkBudget([], legacy).stale, [id]);
  assert.deepEqual(checkBudget(problems, { ...legacy, exceptions: [...legacy.exceptions, { id, reason: "", removal: "" }] }).invalid, [id]);
});
