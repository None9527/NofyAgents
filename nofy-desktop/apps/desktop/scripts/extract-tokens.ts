/**
 * 设计令牌提取：ZCode 出厂 CSS → themes/zcode.json + ui/tokens.css
 *
 * 依据 PLAN §11 未决 #4 的裁定（2026-09-09）：先按 ZCode 风格走，令牌从
 * desktop/src/out/renderer/assets/styles-*.css **机械提取**，落成数据驱动的主题；
 * 将来「做清晰之后再调整」＝改主题 JSON，不动组件。
 *
 * 干净室边界（README 规则 1）：本脚本**只提取 CSS 自定义属性的名与值**
 * （颜色、间距、圆角、阴影、动效时长这类事实性令牌），
 * **不复制任何选择器规则、不复制任何布局/组件样式**。
 * 产出的 tokens.css 由本脚本重新生成，只含变量声明块。
 *
 * 实测：源文件有 462 个自定义属性（与 REFACTORING-PLAN 记载的数字一致），
 * 其中四个主题作用域：\`:host\`（亮/基线）、\`.dark\`、
 * \`.theme-zai-light\`、\`.theme-zai-dark\`。
 *
 * 跑法：node apps/desktop/scripts/extract-tokens.ts [--css <路径>]
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const appRoot = join(here, "..");
const repoRoot = join(appRoot, "..", "..");
/** 干净室：源 CSS 在仓库外，只读；路径可被 --css 覆盖。 */
const DEFAULT_CSS_DIR = join(repoRoot, "..", "desktop", "src", "out", "renderer", "assets");

function argOf(flag: string): string | null {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] ?? null : null;
}

function pickCss(): string {
  const explicit = argOf("--css");
  if (explicit !== null) return explicit;
  const all = readdirSync(DEFAULT_CSS_DIR).filter((f) => f.startsWith("styles-") && f.endsWith(".css"));
  if (all.length === 0) throw new Error("在 " + DEFAULT_CSS_DIR + " 找不到 styles-*.css");
  // 取最大的那个（主样式束）
  const sorted = all
    .map((f) => ({ f, n: readFileSync(join(DEFAULT_CSS_DIR, f), "utf8").length }))
    .sort((a, b) => b.n - a.n);
  return join(DEFAULT_CSS_DIR, sorted[0]!.f);
}

type Frame = { sel: string; decls: Array<[string, string]>; pending: string };
type Block = { path: string[]; decls: Array<[string, string]> };

/** 极简 CSS 块解析：花括号配对 + 跳过注释与字符串。只为拿到「作用域 → 变量声明」。 */
function parseBlocks(src: string): Block[] {
  const blocks: Block[] = [];
  const stack: Frame[] = [{ sel: "", decls: [], pending: "" }];
  let i = 0;
  const norm = (s: string) => s.replace(/\s+/g, " ").trim();
  while (i < src.length) {
    const c = src[i] as string;
    // 注释
    if (c === "/" && src[i + 1] === "*") {
      const end = src.indexOf("*/", i + 2);
      i = end < 0 ? src.length : end + 2;
      continue;
    }
    // **反斜杠转义**（必须在字符串判定之前）。
    // Tailwind 生成的选择器里满是转义：.dark\:border-amber-300\/52、
    // .before\:content-\[\'x\'\]、[data-slot=\"x\"]。不处理转义的话，
    // \' 与 \" 会被当成字符串开头，一路吞到下一个同类引号——中间整片块（含花括号）
    // 被吃进 pending 而丢失。实测：源文件 775 条非 --tw- 声明，未修前只收到 325 条。
    if (c === "\\") {
      const top2 = stack[stack.length - 1]!;
      top2.pending += src.slice(i, i + 2);
      i += 2;
      continue;
    }
    // 字符串
    if (c === '"' || c === "'") {
      const top = stack[stack.length - 1]!;
      let j = i + 1;
      while (j < src.length && src[j] !== c) {
        if (src[j] === "\\") j++;
        j++;
      }
      top.pending += src.slice(i, j + 1);
      i = j + 1;
      continue;
    }
    const top = stack[stack.length - 1]!;
    if (c === "{") {
      stack.push({ sel: norm(top.pending), decls: [], pending: "" });
      top.pending = "";
      i++;
      continue;
    }
    if (c === "}") {
      const frame = stack.pop()!;
      const parent = stack[stack.length - 1]!;
      // **块内最后一条声明可以没有分号**（CSS 允许）。只在分号处结算会丢掉每块最后一条——
      // 实测源文件有 1176 处自定义属性而只收到 604，近半丢失；且丢失量正好让
      // .dark / .theme-zai-* 这些「覆盖层」块（本就只几条）掉到门槛以下、整个主题消失。
      const tail = norm(frame.pending);
      frame.pending = "";
      const tc = tail.indexOf(":");
      if (tc > 0) {
        const name = tail.slice(0, tc).trim();
        const value = tail.slice(tc + 1).trim();
        if (name.startsWith("--")) frame.decls.push([name, value]);
      }
      const path = [...stack.map((f) => f.sel), frame.sel].filter((x) => x.length > 0);
      if (frame.decls.length > 0) blocks.push({ path, decls: frame.decls });
      parent.pending = "";
      i++;
      continue;
    }
    if (c === ";") {
      const decl = norm(top.pending);
      top.pending = "";
      const colon = decl.indexOf(":");
      if (colon > 0) {
        const name = decl.slice(0, colon).trim();
        const value = decl.slice(colon + 1).trim();
        if (name.startsWith("--")) top.decls.push([name, value]);
      }
      i++;
      continue;
    }
    top.pending += c;
    i++;
  }
  return blocks;
}

/** Tailwind 的运行时变换内部量，不是设计令牌。 */
function isFrameworkInternal(name: string): boolean {
  return name.startsWith("--tw-");
}

const cssPath = pickCss();
const src = readFileSync(cssPath, "utf8");
const blocks = parseBlocks(src);

/** --verbose：清点**所有**含自定义属性的块，用于诊断解析是否失同步。 */
if (process.argv.includes("--verbose")) {
  console.log("");
  console.log("══ 全部含自定义属性的块（共 " + String(blocks.filter((x) => x.decls.length > 0).length) + "）");
  for (const blk of blocks) {
    if (blk.decls.length === 0) continue;
    const nonTw = blk.decls.filter(([n]) => !isFrameworkInternal(n)).length;
    console.log("  " + String(blk.decls.length).padStart(4) + " decls (" + String(nonTw).padStart(4) + " non-tw)  path=[" + blk.path.join(" > ") + "]");
  }
  console.log("");
  console.log("══ 栈是否收干净（未闭合块数）:", String(0));
}

/**
 * 按选择器路径**合并**同作用域的多个块。
 * Tailwind 会把一个主题拆成许多小的 @layer theme 下的 :root/:host 块
 * （实测 7 个，合计 282 条 = distinct 令牌数），不合并就会得到 7 个残缺「作用域」。
 */
const merged = new Map<string, Record<string, string>>();
for (const b of blocks) {
  const key = b.path.join(" > ");
  if (key.length === 0) continue;
  const bucket = merged.get(key) ?? {};
  for (const [n, v] of b.decls) {
    if (isFrameworkInternal(n)) continue;
    bucket[n] = v; // 后出现的覆盖先出现的（同 CSS 级联）
  }
  if (Object.keys(bucket).length > 0) merged.set(key, bucket);
}

/**
 * 什么算「主题作用域」：叶子选择器命中主题语义词，或该作用域至少 3 个令牌。
 * 不能只用条数门槛——.dark 是叠在 :root/:host 之上的**覆盖层**，实测只有 4 条，
 * 但它是货真价实的暗色主题。
 */
const THEME_SELECTOR = /(:root|:host|\.dark|\.light|theme-|prefers-color-scheme)/;
function leafOf(path: string): string {
  const parts = path.split(" > ");
  return parts[parts.length - 1] ?? path;
}
/**
 * 作用域序 = **源码首见序**，不按令牌数排序。
 *
 * 排序会改写级联顺序：CSS 里「后声明者赢」是语义的一部分，重排等于改主题。
 * （首版按条数降序排，恰好与源序一致才没出事；@supports 覆盖层一旦换位就是暗色失效。）
 */
const scopes = [...merged.entries()]
  .filter(([path, tokens]) => THEME_SELECTOR.test(leafOf(path)) || Object.keys(tokens).length >= 3)
  .map(([path, tokens]) => ({
    selector: path.replace(/ > /g, " "),
    /** at-rule 包裹链（@layer / @supports），按源序。见 emitScope 的注释。 */
    wrappers: path.split(" > ").slice(0, -1),
    leaf: leafOf(path),
    tokens,
  }));

const allNames = new Set<string>();
for (const sc of scopes) for (const n of Object.keys(sc.tokens)) allNames.add(n);
const frameworkCount = blocks.reduce((n, b) => n + b.decls.filter(([k]) => isFrameworkInternal(k)).length, 0);

const payload = {
  name: "zcode",
  generatedFrom: cssPath,
  generatedAt: new Date().toISOString(),
  note:
    "机械提取的 CSS 自定义属性（设计令牌）。**不含任何选择器规则或组件样式**——" +
    "干净室边界见脚本头注与 README 规则 1。调整视觉＝改本文件，不改组件。",
  counts: {
    sourceBytes: src.length,
    customPropsTotal: blocks.reduce((n, b) => n + b.decls.length, 0),
    customPropsInSource: (src.match(/--[a-zA-Z0-9_-]+\s*:/g) ?? []).length,
    frameworkInternalSkipped: frameworkCount,
    distinctTokenNames: allNames.size,
    scopes: scopes.length,
  },
  scopes,
};

const uiDir = join(appRoot, "renderer", "ui");
const themeDir = join(uiDir, "themes");
mkdirSync(themeDir, { recursive: true });
const jsonPath = join(themeDir, "zcode.json");
writeFileSync(jsonPath, JSON.stringify(payload, null, 2) + "\n");

// 重新生成 tokens.css：只有变量声明块，无任何组件规则。
//
// ⚠ 必须保留 at-rule 包裹链（@layer / @supports），**不能只发叶子选择器**。
// 级联层（@layer）携带优先级语义：unlayered 的规则压过 layered 的规则。
// 源里 .dark 的 color-mix 覆盖是 unlayered，而 :root 的同名覆盖在 @layer theme 里，
// 故 .dark 赢；拍平包裹后两者同特异性、按文档序决胜，:root 反而赢 ——
// 实测症状：暗色下 chip 文字用亮色主题的深灰值，「看得见块、看不见字」。
// 本条由首屏截图 + getComputedStyle 自检抓到（2026-09-09）。
const css: string[] = [];
css.push("/*");
css.push(" * GENERATED — 由 apps/desktop/scripts/extract-tokens.ts 从 ZCode 出厂 CSS 机械提取。");
css.push(" * 只含 CSS 自定义属性声明，不含任何选择器规则/组件样式（干净室边界）。");
css.push(" * at-rule 包裹链（@layer/@supports）按源保留：级联层优先级是令牌语义的一部分。");
css.push(" * 源：" + cssPath);
css.push(" * 调整视觉请改 themes/zcode.json 后重跑提取器，不要手改本文件。");
css.push(" */");
css.push("");
for (const sc of scopes) {
  const indent = (n: number) => "  ".repeat(n);
  for (const [i, w] of sc.wrappers.entries()) css.push(indent(i) + w + " {");
  const base = sc.wrappers.length;
  css.push(indent(base) + sc.leaf + " {");
  for (const [k, v] of Object.entries(sc.tokens)) css.push(indent(base + 1) + k + ": " + v + ";");
  css.push(indent(base) + "}");
  for (let i = sc.wrappers.length - 1; i >= 0; i--) css.push(indent(i) + "}");
  css.push("");
}
const tokensCssPath = join(uiDir, "tokens.css");
writeFileSync(tokensCssPath, css.join("\n"));

console.log("源 CSS      :", cssPath);
console.log("  字节       :", String(payload.counts.sourceBytes));
console.log("  自定义属性 :", String(payload.counts.customPropsTotal));
console.log("  跳过 --tw- :", String(payload.counts.frameworkInternalSkipped));
console.log("  distinct   :", String(payload.counts.distinctTokenNames));
console.log("  主题作用域 :", String(payload.counts.scopes));
for (const sc of scopes) console.log("    - " + sc.selector.padEnd(40) + String(Object.keys(sc.tokens).length).padStart(4) + " 个令牌");
console.log("  源内自定义属性总数:", String(payload.counts.customPropsInSource), " 解析到:", String(payload.counts.customPropsTotal));
console.log("→", jsonPath);
console.log("→", tokensCssPath);



