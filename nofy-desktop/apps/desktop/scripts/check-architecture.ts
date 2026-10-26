import { readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { scanModuleReferences, inspectEdges, checkBudget } from "./architecture/graph.ts";
import { resolveReference } from "./architecture/resolution.ts";
import type { Edge, Policy, Problem } from "./architecture/graph.ts";

const app = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(app, "../..");
const policy = JSON.parse(await readFile(join(root, "architecture-policy.json"), "utf8")) as Policy;
const config = ts.readConfigFile(join(app, "tsconfig.renderer.json"), ts.sys.readFile);
if (config.error) throw new Error(ts.flattenDiagnosticMessageText(config.error.messageText, "\n"));
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, app);
if (parsed.errors.length) throw new Error(ts.formatDiagnostics(parsed.errors, { getCurrentDirectory: () => app, getCanonicalFileName: path => path, getNewLine: () => "\n" }));
const files: string[] = [];
async function walk(directory: string): Promise<void> {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (/\.tsx?$/.test(path)) files.push(path);
  }
}
for (const directory of ["renderer", "preload", "main", "shared"]) await walk(join(app, directory));
const normalize = (path: string) => relative(app, path).split("\\").join("/");
const edges: Edge[] = [];
const problems: Problem[] = [];
for (const file of files.sort()) {
  const from = normalize(file);
  const scanned = scanModuleReferences(file, await readFile(file, "utf8"));
  for (const line of scanned.computed) problems.push({ id: `computed-import|runtime|${from}|${line}`, rule: "computed-import", from, to: "<computed>", typeOnly: false, line });
  for (const reference of scanned.references) {
    if ([".css", ".svg", ".png", ".html"].includes(extname(reference.specifier))) continue;
    const resolved = resolveReference(reference.specifier, file, app, parsed.options);
    const to = resolved.target;
    if (resolved.unresolved) {
      problems.push({ id: `unresolved|${reference.typeOnly ? "type" : "runtime"}|${from}|${to}`, rule: "unresolved", from, to, typeOnly: reference.typeOnly, line: reference.line });
    }
    edges.push({ ...reference, from, to });
  }
}
problems.push(...inspectEdges(edges, policy));
const report = { source: "TypeScript AST and module resolution; desktop source only", files: files.length, edges, problems };
const reportIndex = process.argv.indexOf("--report");
if (reportIndex >= 0) {
  const path = process.argv[reportIndex + 1];
  if (!path) throw new Error("--report requires an output path");
  await writeFile(resolve(path), JSON.stringify(report, null, 2) + "\n");
}
const budget = checkBudget(problems, policy);
for (const problem of budget.unexpected) console.error(`${problem.rule}: ${problem.from}:${problem.line} → ${problem.to} (${problem.typeOnly ? "type" : "runtime"})`);
for (const id of budget.stale) console.error("Remove obsolete exception: " + id);
for (const id of budget.invalid) console.error("Duplicate or incomplete exception: " + id);
if (budget.unexpected.length || budget.stale.length || budget.invalid.length) process.exitCode = 1;
else console.log(`Architecture verified: ${files.length} source files, ${edges.length} imports, ${problems.length} explicit legacy exceptions`);
