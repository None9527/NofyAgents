/** Supplemental DOM/main guard; imports use the same AST reader as architecture:check.
 * Full layer policy and exact migration exceptions live in architecture-policy.json.
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { scanModuleReferences } from "../scripts/architecture/graph.ts";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (name.endsWith(".ts") || name.endsWith(".tsx")) out.push(p);
  }
  return out;
}

/** 从**源码文本**抽 import 说明符（调用方传原文，不传路径）。 */
function importsOf(src: string): string[] {
  return scanModuleReferences("guard.tsx", src).references.map(reference => reference.specifier);
}

function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:"'\\])\/\/.*$/gm, "$1");
}

function violates(file: string, rules: { forbidSpec: RegExp[]; forbidDom: boolean; forbidReact: boolean }): string[] {
  const raw = readFileSync(file, "utf8");
  // DOM/react 检查只看**代码**：注释里提到 window.nofy 是文档，不是越界。
  // （首跑抓到两处注释误报；import 扫描仍用原文。）
  const src = stripComments(raw);
  const bad: string[] = [];
  for (const spec of importsOf(raw)) {
    for (const f of rules.forbidSpec) {
      if (f.test(spec)) bad.push("import " + spec);
    }
  }
  if (rules.forbidDom && /\b(window|document)\./.test(src)) bad.push("touches window/document");
  if (rules.forbidReact && /from "react"|from "react-dom/.test(src)) bad.push("imports react");
  return bad;
}

const FEATURE_RULES = {
  forbidSpec: [/^@nofy-desktop\/acp$/, /\/main\//, /\/seam\//],
  forbidDom: true,
  forbidReact: false,
};
const CORE_RULES = { forbidSpec: [], forbidDom: true, forbidReact: false };
const MAIN_RULES = { forbidSpec: [], forbidDom: true, forbidReact: true };

test("features 不碰线路名包 / main / seam / DOM", () => {
  const files = walk(join(root, "renderer", "features"));
  assert.ok(files.length >= 7, "features 应已有若干组件，否则本门是空转");
  for (const f of files) {
    const bad = violates(f, FEATURE_RULES);
    assert.deepEqual(bad, [], f + " 违反依赖守则: " + bad.join(", "));
  }
});

test("core 与 seam 不碰 DOM（node 下可测的前提）", () => {
  for (const dir of ["core", "seam"]) {
    for (const f of walk(join(root, "renderer", dir))) {
      const bad = violates(f, CORE_RULES);
      assert.deepEqual(bad, [], f + " 违反依赖守则: " + bad.join(", "));
    }
  }
});

test("main 不碰 DOM、不 import react", () => {
  for (const f of walk(join(root, "main"))) {
    const bad = violates(f, MAIN_RULES);
    assert.deepEqual(bad, [], f + " 违反依赖守则: " + bad.join(", "));
  }
});
