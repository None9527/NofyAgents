// A0-S4-4c: 自 modules/DiffsWorker.tsx 原样整体迁入（组件全族 + 私有辅助 + 局部型别 + 尾部符号表；原文件现为薄 re-export shim）。
// 仅导入路径按 components/code-viewer/ 深度改指（./ → ../../modules/；../components/ → ../；其余 ../ → ../../）；迁出体逐字未动。
/* eslint-disable */
/**
 * ============================================================================
 * DiffsWorker.tsx — ZCode 3.7.6 diff/file 高亮 Web Worker（解混淆重建 · D8 Stage B2 / PreviewMisc 族）
 * ============================================================================
 *
 * 来源文件（10,697 行，自包含 IIFE worker bundle，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/diffs.worker-CAavpt0L.js
 * 对照文件（同一 chunk 的 pretty-print 版，10,142 行）：
 *   /home/none/grok-build/ref-ui/zcode-restored/src-reconstructed/renderer/assets/diffs.worker-CAavpt0L.jsx
 *
 * ----------------------------------------------------------------------------
 * 一、chunk 结构总览（vendor 段登记 + 自研段全量重建）
 * ----------------------------------------------------------------------------
 * 本 chunk 是 `new Worker(new URL('diffs.worker-CAavpt0L.js'), {type:'module',
 * name:'zcode-diffs-worker'})`（styles-CdEGpc2x.js js 211091 `q6t`）加载的
 * 自研 diff 消息处理器，内含 5 组 vendor 库 + 1 段自研引擎。按任务策略，
 * vendor 段仅登记（行号 + 上游 + 锚点），自研段（9172–10697）全量语义重建。
 *
 *  | # | 行范围 (js)   | 定性   | 上游模块 / 锚点符号                                        |
 *  |---|---------------|--------|--------------------------------------------------------------|
 *  | 1 | 10–~5160      | vendor | **vscode-textmate + hast 生态 + shiki 核心**（Rollup 提升交错）：|
 *  |   |               |        | TextMate Grammar（_compilePatterns 1000、tokenizeLine 1666）、|
 *  |   |               |        | property-information 属性表（2640）、HTML 实体表（3500）、    |
 *  |   |               |        | @shikijs/core token 渲染（4600）、ShikiError(11/5168)、      |
 *  |   |               |        | codeToTokens/codeToHtml(4897/5432)、createHighlighter `Vi`(5424) |
 *  | 2 | 5460–8177     | vendor | **oniguruma-to-es + @shikijs/engine-javascript**：oniguruma  |
 *  |   |               |        | 正则 AST 解析（Ki/Ji/Yi 5465+、Subroutine `Ba` 6200、         |
 *  |   |               |        | ES2024/ES2025 目标转换 7600）、JavaScriptScanner `Xs`(8115)、 |
 *  |   |               |        | createJavaScriptRegexEngine `Qs`(8178)                        |
 *  | 3 | 8194–8545     | vendor | **@shikijs/engine-oniguruma**：ShikiError `$s`(8194)、        |
 *  |   |               |        | OnigScanner/OnigString 包装（uc/lc）、createOnigurumaEngine   |
 *  |   |               |        | `xc`(8533)                                                    |
 *  | 4 | 8546–9098     | vendor | **jsdiff（npm `diff`）**：Diff 基类 `Y`(8546)、diffChars      |
 *  |   |               |        | `Sc/Cc`(8720/8721)、extendedWordChars `Nc`(8788)、            |
 *  |   |               |        | diffWordsWithSpace `Ic/Lc`(8892/8898)、diffLines 类(8900+)、  |
 *  |   |               |        | structuredPatch/createPatch（@@ -oldStart,oldLines …，9049–9081）|
 *  | 5 | 9099–9158     | vendor | **@shikijs/transformers**：transformerStyleToClass `qc`       |
 *  |   |               |        | （name='@shikijs/transformers:style-to-class'）+ cyrb53 哈希 `Jc` |
 *  | 6 | 9159–9171     | vendor*| **vscode-oniguruma wasm base64 内联**（`Yc/Xc/Zc/Qc/$c`）：   |
 *  |   |               |        | ≈1.1MB blob 与 wasm-B4ap0Fdc.js 同源；构建期定制（上游经       |
 *  |   |               |        | fetch/URL 载入，此处 atob 内联）。重建保留接口、不转录数据     |
 *  | 7 | **9172–10697**| **自研** | **ZCode diff 引擎 + 消息处理器**（本文件全量重建）            |
 *
 * ----------------------------------------------------------------------------
 * 二、自研段 混淆名 → 语义名 映射表（行号格式：js 行 / jsx 行）
 * ----------------------------------------------------------------------------
 *  基础设施：
 *   el  → initOnigurumaWasm（懒模块：强制 wasm 初始化）(9172)
 *   tl  → LINE_SPLIT_REGEX = /(?<=\n)/（保留换行的行分割）(9176)
 *   nl  → DEFAULT_DIFFS_THEMES = {dark:'pierre-dark', light:'pierre-light'}（ZCode 自研主题）(9177)
 *   （匿名）→ Object.freeze({fromStart:0,fromEnd:0}) 未引用死常量 (9178)
 *  语言/主题/扩展注册表：
 *   rl/il/al → resolvedLanguageMap / loadedLanguageNames / loadResolvedLanguages (9180–9190)
 *   ol/sl/cl → resolvedThemeMap / loadedThemeNames / loadResolvedThemes (9191–9202)
 *   Z/ll    → customExtensionMap（Map）/ customExtensionsVersion (9202 附近)
 *   ul  → EXTENSION_TO_LANGUAGE 扩展名→shiki 语言 id（343 条）(9203–9547 / 8689)
 *   dl  → resolveLanguageForFileName（自定义表→全名→复合扩展→单扩展→'text'）(9548 / 9034)
 *   fl  → setCustomExtensions（版本号单调递增才生效）(9559 / 9045)
 *  hast 工具：
 *   pl  → stripTrailingNewline (9568)      ml → hastText (9570)
 *   hl  → hastElement (9573)               gl → findCodeElement (9576)
 *   _l  → processLine（行元素→div + data-line/alt-line/line-type/line-index）(9583)
 *   vl/yl → NO_TOKEN / MULTIPLE_TOKENS 符号 (9601)
 *   bl  → groupTokensByCharPosition（data-char 归组/补包 span）(9603)
 *   xl/Sl/Cl → getCharPosition / clearCharPositions / setCharPosition (9651/9655/9661)
 *  shiki transformer 组装：
 *   wl  → createDiffTransformers（行处理 + 可选 token/样式归一）(9664 / 9163)
 *   Tl  → styleToClassTransformer = qc({classPrefix:'hl-'})（vendor §5）(9713 / 9209)
 *   El  → TOKEN_STYLE_NORMALIZER（color/bg/fontStyle→htmlStyle）(9714)
 *   Q   → cssVariablePrefix（'token'→'--diffs-token-'，其余 '--diffs-'）(9731 / 9222)
 *   Dl  → buildThemeStyles（fg/bg + 增/删/改色变量，双主题分 dark/light）(9734 / 9225)
 *   Ol  → buildThemeColorVars（gitDecoration.* → terminal.ansi* 兜底）(9756)
 *   kl  → getLineNodes（取 code 元素 children）(9770)
 *  diff 迭代器：
 *   Al  → iterateOverDiff（hunk 级窗口化迭代：context/context-expanded/change）(9779 / 9258)
 *   jl  → resolveCollapsedRange（折叠上下文展开量）(10207 / 9693 附近)
 *   Ml  → hasTrailingContext（末 hunk 后仍有未消费行）(10228)
 *   Nl  → computeChangeRanges（窗口裁剪变更区段）(10235)
 *   Pl  → buildChangeItem（单行变更项装配）(10271)
 *   Fl  → createDiffSpanDecoration（data-diff-span 装饰）(10364)
 *   Il  → appendDiffSegment（word-alt 相邻同类合并）(10374)
 *  渲染器：
 *   Ll  → DEFAULT_WINDOW_OPTIONS {forcePlainText:false} (10387)
 *   Rl  → renderDiff（diff 主渲染：按 hunk 累积→成对高亮→窗口回填）(10388 / 9669)
 *   zl  → computeLineDecorations（行内 char/word-alt diff 装饰）(10515 / 9784)
 *   Bl  → createHunkAccumulator (10555)
 *   Vl  → highlightFilePair（删/增两侧 codeToHast）(10568 / 9863)
 *   Hl  → iterateLines（行窗口迭代）(10600 / 9905)
 *   Ul  → splitLines (10622)
 *   Wl  → DEFAULT_FILE_WINDOW_OPTIONS (10624)
 *   Gl  → renderFile（单文件渲染）(10625 / 9934)
 *   Kl  → joinLineSlice (10672)
 *  消息处理器：
 *   ql/$ → highlighterSingleton / renderOptions 默认值（theme=pierre 双主题、
 *          useTokenTransformer=false、tokenizeMaxLineLength=1000、
 *          lineDiffType='word-alt'、maxLineDiffLength=1000）(10681)
 *   Jl  → handleWorkerMessage（initialize/set-render-options/file/diff 分派）(10691 / 10010)
 *   Yl  → handleInitialize (10710 / 10032)
 *   Xl  → handleSetRenderOptions (10726 / 10052)
 *   Zl  → handleFileRequest (10736 / 10065)
 *   Ql  → handleDiffRequest (10751 / 10084)
 *   $l  → getOrCreateHighlighter（shiki-wasm→oniguruma 引擎，否则 JS 正则引擎）(10761 / 10097)
 *   eu  → applyCustomExtensions（version+map 必须成对）(10771 / 10104)
 *   tu/nu/ru → postFileSuccess / postDiffSuccess / postErrorResponse (10780/10790/10800 / 10113/10123/10133)
 *
 * ----------------------------------------------------------------------------
 * 三、消息协议（与主线程 styles-CdEGpc2x.js 的 DiffsWorkerPool 对应）
 * ----------------------------------------------------------------------------
 *  请求（主线程 → worker）：
 *   {type:'initialize', id, renderOptions, preferredHighlighter,
 *    resolvedThemes, resolvedLanguages, customExtensionsVersion, customExtensionMap}
 *   {type:'set-render-options', id, renderOptions, resolvedThemes}
 *   {type:'file', id, file:{name, lang?, contents}, resolvedLanguages?,
 *    customExtensionsVersion?, customExtensionMap?}
 *   {type:'diff', id, diff:FileDiff, resolvedLanguages?, customExtensionsVersion?, customExtensionMap?}
 *  响应（worker → 主线程）：
 *   {type:'success', requestType:'initialize'|'set-render-options', id, sentAt}
 *   {type:'success', requestType:'file'|'diff', id, result, options, sentAt}
 *   {type:'error', id, error, stack?}
 *  主线程侧：worker 工厂 `q6t`（name='zcode-diffs-worker'）、池大小 `J6t`
 *  （hardwareConcurrency/2 夹取 1–4，缺省 2）、`X6t` DiffsWorkerPoolProvider
 *  （codePreviewSettings.lightTheme/darkTheme → pierre 主题对）、`XRe`
 *  useDiffsWorkerPool —— 均在 styles-CdEGpc2x.js（F14 域，另族重建）。
 * ============================================================================
 */

/* ============================================================================
 * 0. vendor 接口声明（真实实现位于 §一 登记的 vendor 段；此处为重建接口）
 * ==========================================================================*/

/** hast 文本节点（原 ml 产物） */
interface HastText {
  type: "text";
  value: string;
}

/** hast 元素节点（原 hl 产物 / shiki codeToHast 输出） */
interface HastElement {
  type: "element";
  tagName: string;
  properties: Record<string, unknown>;
  children: HastNode[];
}

type HastNode = HastText | HastElement;

/** shiki 主题（解析后；colors 为 VSCode workbench 颜色表） */
interface ResolvedShikiTheme {
  name: string;
  fg: string;
  bg: string;
  type?: "dark" | "light";
  colors?: Record<string, string>;
  [key: string]: unknown;
}

/** shiki 高亮 token（codeToHast transformers 消费面） */
interface ShikiToken {
  content: string;
  offset?: number;
  color?: string;
  bgColor?: string;
  fontStyle?: number;
  htmlStyle?: Record<string, string> | null;
  htmlAttrs?: Record<string, string>;
  /** createDiffTransformers.tokens 注入的行内字符偏移 */
  __lineChar?: number;
}

/** shiki 引擎（oniguruma / javascript-regex 的统一面） */
type ShikiEngine = unknown;

/** shiki 高亮器（原 Vi = createHighlighter 的产物） */
interface ShikiHighlighter {
  codeToHast(code: string, options: CodeToHastOptions): HastElement;
  getTheme(name: string): ResolvedShikiTheme;
  loadLanguageSync(data: unknown): void;
  loadThemeSync(theme: ResolvedShikiTheme): void;
}

/** shiki transformer（本文件用到的子集） */
interface ShikiTransformer {
  name?: string;
  preprocess?: (code: string, options: { mergeWhitespaces?: string }) => void;
  tokens?: (lines: ShikiToken[][]) => void;
  span?: (element: HastElement, line: number, lineIndex: number, tokenIndex: number, token?: ShikiToken) => HastElement;
  line?: (element: HastElement) => HastElement;
  pre?: (root: HastElement) => HastElement;
}

/** 行装饰（shiki decorations 选项；原 Fl 产物） */
interface LineDecoration {
  start: { line: number; character: number };
  end: { line: number; character: number };
  properties: Record<string, string>;
  alwaysWrap: boolean;
}

interface CodeToHastOptions {
  lang?: string;
  theme?: string;
  themes?: DiffsTheme;
  transformers?: ShikiTransformer[];
  decorations?: LineDecoration[];
  defaultColor?: boolean | string;
  cssVariablePrefix?: string;
  tokenizeMaxLineLength?: number;
  useTokenTransformer?: boolean;
  [key: string]: unknown;
}

/** 原 Vi（vendor §1，js 5424） */
declare function createHighlighter(options: { themes: unknown[]; langs: unknown[]; engine: ShikiEngine }): Promise<ShikiHighlighter>;
/** 原 xc（vendor §3，js 8533） */
declare function createOnigurumaEngine(wasm: Promise<unknown>): ShikiEngine;
/** 原 Qs（vendor §2，js 8178） */
declare function createJavaScriptRegexEngine(options?: Record<string, unknown>): ShikiEngine;
/** 原 qc（vendor §5，js 9099）：style-to-class transformer 工厂 */
declare function transformerStyleToClass(options?: { classPrefix?: string; classSuffix?: string; classReplacer?: (cls: string) => string }): ShikiTransformer & {
  getClassRegistry(): Map<string, string | Record<string, string>>;
  getCSS(): string;
  clearRegistry(): void;
};

/** jsdiff Change（vendor §4，jsdiff `diff` 包） */
interface DiffChange {
  value: string;
  added?: boolean;
  removed?: boolean;
  count?: number;
}
/** 原 Cc（js 4903）：逐字符 diff */
declare function diffChars(oldStr: string, newStr: string): DiffChange[];
/** 原 Lc（js 5175）：逐词（含空白）diff */
declare function diffWordsWithSpace(oldStr: string, newStr: string): DiffChange[];

/** worker 全局（原实现为 IIFE 内裸用 self/postMessage） */
declare const self: {
  addEventListener(type: "message", handler: (event: { data: WorkerRequest }) => void): void;
  addEventListener(type: "error", handler: (event: { error?: unknown }) => void): void;
};
declare function postMessage(message: WorkerResponse): void;

/* ============================================================================
 * 1. oniguruma wasm 内联（原 Yc/Xc/Zc/Qc/$c/el，js 9159–9173）
 * ----------------------------------------------------------------------------
 * vendor §6：vscode-oniguruma wasm 以 base64 内联（≈1.1MB，与
 * wasm-B4ap0Fdc.js 同源），经 CJS 懒模块包装。重建保留接口与惰性语义，
 * 不转录二进制数据（数据登记见报告 §3）。
 * ==========================================================================*/

/** 原 Yc/Xc：base64 解码后的 wasm 字节（登记，不转录） */
declare const ONIGURUMA_WASM_BINARY: Uint8Array;

let onigurumaWasmExports: Promise<WebAssembly.Exports> | undefined;

/** 原 Zc：wasm 实例化（emscripten 导入由 blob 自带 wasi 段满足） */
function instantiateOnigurumaWasm(): Promise<WebAssembly.Exports> {
  return (onigurumaWasmExports ??= WebAssembly.instantiate(ONIGURUMA_WASM_BINARY as unknown as BufferSource).then(
    (result) => result.instance.exports,
  ));
}

/** 原 $c：引擎消费的模块面 */
const ONIGURUMA_WASM_MODULE = {
  default: () => instantiateOnigurumaWasm(),
  getWasmInstance: () => instantiateOnigurumaWasm(),
  wasmBinary: ONIGURUMA_WASM_BINARY,
};

/** 原 el：懒初始化模块——强制（幂等）初始化两次，与原始 `(Qc(), Qc())` 一致 */
function initOnigurumaWasm(): void {
  instantiateOnigurumaWasm();
  instantiateOnigurumaWasm();
}

/* ============================================================================
 * 2. 基础常量与注册表（原 tl/nl/rl/il/al/ol/sl/cl/Z/ll，js 9176–9202）
 * ==========================================================================*/

/** 原 tl：按行分割但保留行尾换行（lookbehind）。 */
const LINE_SPLIT_REGEX = /(?<=\n)/;

/** 原 nl：ZCode 自研 shiki 主题对「pierre」（pierre-dark/pierre-light 主题
 *  资产在 out/renderer/assets/pierre-dark-ucsVBuqq.js / pierre-light-Cw0BuNhK.js，
 *  由主线程经 resolvedThemes 传入；styles chunk js 16050–16070 注册）。 */
const DEFAULT_DIFFS_THEMES: { dark: string; light: string } = { dark: "pierre-dark", light: "pierre-light" };

// 原匿名语句（js 9178）：`Object.freeze({ fromStart: 0, fromEnd: 0 })` —— 未被引用的
// 死常量（折叠展开默认值的冻结原型），保留语句以逐字对应。
Object.freeze({ fromStart: 0, fromEnd: 0 });

/** 已解析语言注册表：name → 解析结果（原 rl） */
const resolvedLanguageMap = new Map<string, ResolvedLanguage>();
/** 已载入语言名集合（原 il） */
const loadedLanguageNames = new Set<string>();

interface ResolvedLanguage {
  name: string;
  data: unknown;
}

/** 原 al：把主线程预解析的语言同步载入高亮器（去重：按 name）。 */
function loadResolvedLanguages(languages: ResolvedLanguage | ResolvedLanguage[], highlighter: ShikiHighlighter): void {
  const list = Array.isArray(languages) ? languages : [languages];
  for (const language of list) {
    if (loadedLanguageNames.has(language.name)) continue;
    let resolved = resolvedLanguageMap.get(language.name);
    if (!resolved) {
      resolved = language;
      resolvedLanguageMap.set(language.name, resolved);
    }
    loadedLanguageNames.add(resolved.name);
    highlighter.loadLanguageSync(resolved.data);
  }
}

/** 已解析主题注册表：name → 主题对象（原 ol） */
const resolvedThemeMap = new Map<string, ResolvedShikiTheme>();
/** 已载入主题名集合（原 sl） */
const loadedThemeNames = new Set<string>();

/** 原 cl：把主线程预解析的主题同步载入高亮器。字符串名必须已在注册表中
 *  （主线程先经对象形态注册），否则抛错。 */
function loadResolvedThemes(themes: Array<ResolvedShikiTheme | string> | ResolvedShikiTheme | string, highlighter: ShikiHighlighter): void {
  const list = Array.isArray(themes) ? themes : [themes];
  for (const theme of list) {
    let resolved: ResolvedShikiTheme;
    let name: string;
    if (typeof theme === "string") {
      name = theme;
      const registered = resolvedThemeMap.get(name);
      if (registered == null)
        throw Error(`loadResolvedThemes: ${name} is not resolved, you must resolve it before calling loadResolvedThemes`);
      resolved = registered;
    } else {
      resolved = theme;
      name = theme.name;
      if (!resolvedThemeMap.has(name)) resolvedThemeMap.set(name, resolved);
    }
    if (!loadedThemeNames.has(name)) {
      loadedThemeNames.add(name);
      highlighter.loadThemeSync(resolved);
    }
  }
}

/** 自定义扩展名映射（工作区级覆盖；原 Z） */
const customExtensionMap = new Map<string, string>();
/** 自定义扩展映射版本号（原 ll） */
let customExtensionsVersion = 0;

/* ============================================================================
 * 3. 扩展名 → shiki 语言 id 静态表（原 ul，js 9203–9547 / jsx 8689）
 * ----------------------------------------------------------------------------
 * 343 条，逐字转录（含全名键如 Dockerfile/CODEOWNERS/CMakeLists.txt、
 * 复合扩展键如 blade.php/component.html、以及 diff/patch→diff 等）。
 * ==========================================================================*/

const EXTENSION_TO_LANGUAGE: Record<string, string> = {
  "1c": "1c",
  "abap": "abap",
  "as": "actionscript-3",
  "ada": "ada",
  "adb": "ada",
  "ads": "ada",
  "adoc": "asciidoc",
  "asciidoc": "asciidoc",
  "component.html": "angular-html",
  "component.ts": "angular-ts",
  "conf": "nginx",
  "htaccess": "apache",
  "cls": "tex",
  "trigger": "apex",
  "apl": "apl",
  "applescript": "applescript",
  "scpt": "applescript",
  "ara": "ara",
  "asm": "asm",
  "s": "riscv",
  "astro": "astro",
  "awk": "awk",
  "bal": "ballerina",
  "sh": "zsh",
  "bash": "zsh",
  "bat": "cmd",
  "cmd": "cmd",
  "be": "berry",
  "beancount": "beancount",
  "bib": "bibtex",
  "bicep": "bicep",
  "blade.php": "blade",
  "bsl": "bsl",
  "c": "c",
  "h": "objective-cpp",
  "cs": "csharp",
  "cpp": "cpp",
  "hpp": "cpp",
  "cc": "cpp",
  "cxx": "cpp",
  "hh": "cpp",
  "cdc": "cdc",
  "cairo": "cairo",
  "clar": "clarity",
  "clj": "clojure",
  "cljs": "clojure",
  "cljc": "clojure",
  "soy": "soy",
  "cmake": "cmake",
  "CMakeLists.txt": "cmake",
  "cob": "cobol",
  "cbl": "cobol",
  "cobol": "cobol",
  "CODEOWNERS": "codeowners",
  "ql": "ql",
  "coffee": "coffeescript",
  "lisp": "lisp",
  "cl": "lisp",
  "lsp": "lisp",
  "log": "log",
  "v": "verilog",
  "cql": "cql",
  "cr": "crystal",
  "css": "css",
  "csv": "csv",
  "cue": "cue",
  "cypher": "cypher",
  "cyp": "cypher",
  "d": "d",
  "dart": "dart",
  "dax": "dax",
  "desktop": "desktop",
  "diff": "diff",
  "patch": "diff",
  "Dockerfile": "dockerfile",
  "dockerfile": "dockerfile",
  "env": "dotenv",
  "dm": "dream-maker",
  "edge": "edge",
  "el": "emacs-lisp",
  "ex": "elixir",
  "exs": "elixir",
  "elm": "elm",
  "erb": "erb",
  "erl": "erlang",
  "hrl": "erlang",
  "f": "fortran-fixed-form",
  "for": "fortran-fixed-form",
  "fs": "fsharp",
  "fsi": "fsharp",
  "fsx": "fsharp",
  "f03": "f03",
  "f08": "f08",
  "f18": "f18",
  "f77": "f77",
  "f90": "fortran-free-form",
  "f95": "fortran-free-form",
  "fnl": "fennel",
  "fish": "fish",
  "ftl": "ftl",
  "tres": "gdresource",
  "res": "gdresource",
  "gd": "gdscript",
  "gdshader": "gdshader",
  "gs": "genie",
  "feature": "gherkin",
  "COMMIT_EDITMSG": "git-commit",
  "git-rebase-todo": "git-rebase",
  "gjs": "glimmer-js",
  "gleam": "gleam",
  "gts": "glimmer-ts",
  "glsl": "glsl",
  "vert": "glsl",
  "frag": "glsl",
  "shader": "shaderlab",
  "gp": "gnuplot",
  "plt": "gnuplot",
  "gnuplot": "gnuplot",
  "go": "go",
  "graphql": "graphql",
  "gql": "graphql",
  "groovy": "groovy",
  "gvy": "groovy",
  "hack": "hack",
  "haml": "haml",
  "hbs": "handlebars",
  "handlebars": "handlebars",
  "hs": "haskell",
  "lhs": "haskell",
  "hx": "haxe",
  "hcl": "hcl",
  "hjson": "hjson",
  "hlsl": "hlsl",
  "fx": "hlsl",
  "html": "html",
  "htm": "html",
  "http": "http",
  "rest": "http",
  "hxml": "hxml",
  "hy": "hy",
  "imba": "imba",
  "ini": "ini",
  "cfg": "ini",
  "jade": "pug",
  "pug": "pug",
  "java": "java",
  "js": "javascript",
  "mjs": "javascript",
  "cjs": "javascript",
  "jinja": "jinja",
  "jinja2": "jinja",
  "j2": "jinja",
  "jison": "jison",
  "jl": "julia",
  "json": "json",
  "json5": "json5",
  "jsonc": "jsonc",
  "jsonl": "jsonl",
  "jsonnet": "jsonnet",
  "libsonnet": "jsonnet",
  "jssm": "jssm",
  "jsx": "jsx",
  "kt": "kotlin",
  "kts": "kts",
  "kql": "kusto",
  "tex": "tex",
  "ltx": "tex",
  "lean": "lean4",
  "less": "less",
  "liquid": "liquid",
  "lit": "lit",
  "ll": "llvm",
  "logo": "logo",
  "lua": "lua",
  "luau": "luau",
  "Makefile": "makefile",
  "mk": "makefile",
  "makefile": "makefile",
  "md": "markdown",
  "markdown": "markdown",
  "marko": "marko",
  "m": "wolfram",
  "mat": "matlab",
  "mdc": "mdc",
  "mdx": "mdx",
  "wiki": "wikitext",
  "mediawiki": "wikitext",
  "mmd": "mermaid",
  "mermaid": "mermaid",
  "mips": "mipsasm",
  "mojo": "mojo",
  "🔥": "mojo",
  "move": "move",
  "nar": "narrat",
  "nf": "nextflow",
  "nim": "nim",
  "nims": "nim",
  "nimble": "nim",
  "nix": "nix",
  "nu": "nushell",
  "mm": "objective-cpp",
  "ml": "ocaml",
  "mli": "ocaml",
  "mll": "ocaml",
  "mly": "ocaml",
  "pas": "pascal",
  "p": "pascal",
  "pl": "prolog",
  "pm": "perl",
  "t": "perl",
  "raku": "raku",
  "p6": "raku",
  "pl6": "raku",
  "php": "php",
  "phtml": "php",
  "pls": "plsql",
  "sql": "sql",
  "po": "po",
  "polar": "polar",
  "pcss": "postcss",
  "pot": "pot",
  "potx": "potx",
  "pq": "powerquery",
  "pqm": "powerquery",
  "ps1": "powershell",
  "psm1": "powershell",
  "psd1": "powershell",
  "prisma": "prisma",
  "pro": "prolog",
  "P": "prolog",
  "properties": "properties",
  "proto": "protobuf",
  "pp": "puppet",
  "purs": "purescript",
  "py": "python",
  "pyw": "python",
  "pyi": "python",
  "qml": "qml",
  "qmldir": "qmldir",
  "qss": "qss",
  "r": "r",
  "R": "r",
  "rkt": "racket",
  "rktl": "racket",
  "razor": "razor",
  "cshtml": "razor",
  "rb": "ruby",
  "rbw": "ruby",
  "reg": "reg",
  "regex": "regexp",
  "rel": "rel",
  "rs": "rust",
  "rst": "rst",
  "rake": "ruby",
  "gemspec": "ruby",
  "jbuilder": "ruby",
  "builder": "ruby",
  "rabl": "ruby",
  "arb": "ruby",
  "ru": "ruby",
  "podspec": "ruby",
  "Gemfile": "ruby",
  "Rakefile": "ruby",
  "Guardfile": "ruby",
  "Capfile": "ruby",
  "Berksfile": "ruby",
  "Brewfile": "ruby",
  "Vagrantfile": "ruby",
  "Thorfile": "ruby",
  "Appraisals": "ruby",
  "Dangerfile": "ruby",
  "sas": "sas",
  "sass": "sass",
  "scala": "scala",
  "sc": "scala",
  "scm": "scheme",
  "ss": "scheme",
  "sld": "scheme",
  "scss": "scss",
  "sdbl": "sdbl",
  "shadergraph": "shader",
  "st": "smalltalk",
  "sol": "solidity",
  "sparql": "sparql",
  "rq": "sparql",
  "spl": "splunk",
  "config": "ssh-config",
  "do": "stata",
  "ado": "stata",
  "dta": "stata",
  "styl": "stylus",
  "stylus": "stylus",
  "svelte": "svelte",
  "swift": "swift",
  "sv": "system-verilog",
  "svh": "system-verilog",
  "service": "systemd",
  "socket": "systemd",
  "device": "systemd",
  "timer": "systemd",
  "talon": "talonscript",
  "tasl": "tasl",
  "tcl": "tcl",
  "templ": "templ",
  "tf": "tf",
  "tfvars": "tfvars",
  "toml": "toml",
  "ts": "typescript",
  "tsp": "typespec",
  "tsv": "tsv",
  "tsx": "tsx",
  "ttl": "turtle",
  "twig": "twig",
  "typ": "typst",
  "vv": "v",
  "vala": "vala",
  "vapi": "vala",
  "vb": "vb",
  "vbs": "vb",
  "bas": "vb",
  "vh": "verilog",
  "vhd": "vhdl",
  "vhdl": "vhdl",
  "vim": "vimscript",
  "vue": "vue",
  "vine.ts": "vue-vine",
  "vy": "vyper",
  "wasm": "wasm",
  "wat": "wasm",
  "wy": "文言",
  "wgsl": "wgsl",
  "wit": "wit",
  "wl": "wolfram",
  "nb": "wolfram",
  "xml": "xml",
  "xsl": "xsl",
  "xslt": "xsl",
  "yaml": "yaml",
  "yml": "yml",
  "zs": "zenscript",
  "zig": "zig",
  "zsh": "zsh",
  "sty": "tex",
};

/* ============================================================================
 * 4. 语言解析与自定义扩展（原 dl/fl，js 9548–9567 / jsx 9034–9052）
 * ==========================================================================*/

/** 原 dl：文件名 → shiki 语言 id。优先级：
 *  自定义表(全名) → 静态表(全名) → 自定义表/静态表(复合扩展 a.b.c 取 b.c)
 *  → 自定义表/静态表(单扩展) → 'text'。 */
function resolveLanguageForFileName(fileName: string): string {
  if (customExtensionMap.has(fileName)) return customExtensionMap.get(fileName) ?? "text";
  if (EXTENSION_TO_LANGUAGE[fileName] != null) return EXTENSION_TO_LANGUAGE[fileName];
  const compoundExtension = fileName.match(/\.([^/\\]+\.[^/\\]+)$/);
  if (compoundExtension != null) {
    if (customExtensionMap.has(compoundExtension[1])) return customExtensionMap.get(compoundExtension[1]) ?? "text";
    if (EXTENSION_TO_LANGUAGE[compoundExtension[1]] != null) return EXTENSION_TO_LANGUAGE[compoundExtension[1]] ?? "text";
  }
  const simpleExtension = fileName.match(/\.([^.]+)$/)?.[1] ?? "";
  return customExtensionMap.has(simpleExtension) ? (customExtensionMap.get(simpleExtension) ?? "text") : (EXTENSION_TO_LANGUAGE[simpleExtension] ?? "text");
}

/** 原 fl：应用自定义扩展映射——版本号必须严格递增，否则整体忽略。 */
function setCustomExtensions(version: number, extensionMap: Record<string, string | null | undefined>): boolean {
  if (version <= customExtensionsVersion) return false;
  customExtensionMap.clear();
  for (const key in extensionMap) {
    const value = extensionMap[key];
    if (value != null) customExtensionMap.set(key, value);
  }
  customExtensionsVersion = version;
  return true;
}

/* ============================================================================
 * 5. hast 工具（原 pl/ml/hl/gl/_l，js 9568–9600）
 * ==========================================================================*/

/** 原 pl：去单个尾部换行（\n 或 \r\n）。 */
function stripTrailingNewline(text: string): string {
  return text.replace(/\n$|\r\n$/, "");
}

/** 原 ml */
function hastText(value: string): HastText {
  return { type: "text", value };
}

/** 原 hl */
function hastElement({ tagName, children = [], properties = {} }: { tagName: string; children?: HastNode[]; properties?: Record<string, unknown> }): HastElement {
  return { type: "element", tagName, properties, children };
}

/** 原 gl：沿首子链找 <code> 元素（找不到返回 undefined）。 */
function findCodeElement(root: HastElement): HastElement | undefined {
  let node: HastNode | null | undefined = root.children[0];
  while (node != null) {
    if (node.type === "element" && node.tagName === "code") return node;
    node = "children" in node ? node.children[0] : null;
  }
  return undefined;
}

/** 行元信息（原 state.lineInfo 项 / 函数形态返回值） */
interface LineInfo {
  type: string;
  lineNumber: number;
  altLineNumber?: number;
  lineIndex: string | number;
}

/** transformer 共享状态（原 wl 的 state） */
interface TransformerState {
  /** 数组形态（diff 渲染：按行序取）或函数形态（文件渲染：按行号算）。 */
  lineInfo: LineInfo[] | ((lineNumber: number) => LineInfo);
}

/** 原 _l：把 shiki 输出的行元素（span）改写为 div 并挂 data-line 四件套；
 *  空行补一个换行文本节点保持行高。lineInfo 缺失即抛错（附 console.error）。 */
function processLine(element: HastElement, lineNumber: number, state: TransformerState): HastElement {
  const lineInfo = typeof state.lineInfo === "function" ? state.lineInfo(lineNumber) : state.lineInfo[lineNumber - 1];
  if (lineInfo == null) {
    const message = `processLine: line ${lineNumber}, contains no state.lineInfo`;
    throw (console.error(message, { node: element, line: lineNumber, state }), Error(message));
  }
  element.tagName = "div";
  element.properties["data-line"] = lineInfo.lineNumber;
  element.properties["data-alt-line"] = lineInfo.altLineNumber;
  element.properties["data-line-type"] = lineInfo.type;
  element.properties["data-line-index"] = lineInfo.lineIndex;
  if (element.children.length === 0) element.children.push(hastText("\n"));
  return element;
}

/* ============================================================================
 * 6. data-char 归组（原 vl/yl/bl/xl/Sl/Cl，js 9601–9663）
 * ----------------------------------------------------------------------------
 * useTokenTransformer 路径专用：shiki 的 token 边界与字符位置不对齐时，
 * 按 data-char（行内字符偏移）把 token 归组——单一字符位置的 token 直接标注，
 * 跨位置的包一层 <span data-char=N>，保证后续行内 diff 装饰能按字符定位。
 * ==========================================================================*/

/** 原 vl/yl */
const NO_TOKEN = Symbol("no-token");
const MULTIPLE_TOKENS = Symbol("multiple-tokens");

/** 原 xl：读元素的 data-char（仅数字有效）。 */
function getCharPosition(element: HastElement): number | undefined {
  const value = element.properties["data-char"];
  if (typeof value === "number") return value;
  return undefined;
}

/** 原 Sl：递归清除 data-char 标注。 */
function clearCharPositions(node: HastNode): void {
  if (node.type === "element") {
    node.properties["data-char"] = undefined;
    for (const child of node.children) clearCharPositions(child);
  }
}

/** 原 Cl */
function setCharPosition(element: HastElement, position: number): void {
  element.properties["data-char"] = position;
}

/** 原 bl：递归归组。返回该子树的字符位置结论：
 *  数字 = 整棵子树同一字符位置；MULTIPLE_TOKENS = 多个位置；NO_TOKEN = 无 token。 */
function groupTokensByCharPosition(element: HastElement): number | symbol {
  const existing = getCharPosition(element);
  if (existing != null) return existing;

  let resultState: number | symbol = NO_TOKEN;
  const newChildren: HastNode[] = [];
  let pendingTokens: HastNode[] = [];
  let currentPosition: number | undefined;

  /** 冲刷待处理 token：0 个→丢弃；1 个→直接标注；多个→包 span。 */
  const flushPending = () => {
    if (pendingTokens.length === 0 || currentPosition == null) {
      pendingTokens = [];
      currentPosition = undefined;
      return;
    }
    if (pendingTokens.length === 1) {
      const single = pendingTokens[0];
      if (single?.type === "element") {
        setCharPosition(single, currentPosition);
        for (const child of single.children) clearCharPositions(child);
      } else clearCharPositions(single);
      newChildren.push(single);
      pendingTokens = [];
      currentPosition = undefined;
      return;
    }
    for (const token of pendingTokens) clearCharPositions(token);
    newChildren.push(hastElement({ tagName: "span", properties: { "data-char": currentPosition }, children: pendingTokens }));
    pendingTokens = [];
    currentPosition = undefined;
  };

  /** 收敛子树位置结论（单一→多值即降级 MULTIPLE_TOKENS）。 */
  const trackState = (position: number | symbol) => {
    if (position !== NO_TOKEN) {
      if (position === MULTIPLE_TOKENS) {
        resultState = MULTIPLE_TOKENS;
        return;
      }
      if (resultState === NO_TOKEN) {
        resultState = position;
        return;
      }
      if (resultState !== position) resultState = MULTIPLE_TOKENS;
    }
  };

  for (const child of element.children) {
    const childPosition = child.type === "element" ? groupTokensByCharPosition(child) : NO_TOKEN;
    trackState(childPosition);
    if (typeof childPosition !== "number") {
      flushPending();
      newChildren.push(child);
      continue;
    }
    if (currentPosition != null && currentPosition !== childPosition) flushPending();
    currentPosition ??= childPosition;
    pendingTokens.push(child);
  }
  flushPending();
  element.children = newChildren;
  return resultState;
}

/* ============================================================================
 * 7. transformer 组装与主题样式（原 wl/Tl/El/Q/Dl/Ol/kl，js 9664–9778）
 * ==========================================================================*/

/** 原 Tl（vendor §5）：htmlStyle → class 转换器（classPrefix 'hl-'）。
 *  注意：当前所有调用点 withClassTransformer 均缺省 false，故运行时不挂载。 */
const styleToClassTransformer = transformerStyleToClass({ classPrefix: "hl-" });

/** 原 El：token 样式归一——color/bgColor/fontStyle(1斜体/2粗体/4下划线)
 *  转成 htmlStyle（已有 htmlStyle 的 token 跳过）。 */
const TOKEN_STYLE_NORMALIZER: ShikiTransformer = {
  name: "token-style-normalizer",
  tokens(lines) {
    for (const lineTokens of lines)
      for (const token of lineTokens) {
        if (token.htmlStyle != null) continue;
        const style: Record<string, string> = {};
        if (token.color != null) style.color = token.color;
        if (token.bgColor != null) style["background-color"] = token.bgColor;
        if (token.fontStyle != null && token.fontStyle !== 0) {
          if (token.fontStyle & 1) style["font-style"] = "italic";
          if (token.fontStyle & 2) style["font-weight"] = "bold";
          if (token.fontStyle & 4) style["text-decoration"] = "underline";
        }
        if (Object.keys(style).length > 0) token.htmlStyle = style;
      }
  },
};

/** 原 wl：构造本次渲染的 transformer 链 + 共享 state。
 *  - line：行元素去 class（样式走 CSS 变量）；
 *  - pre：遍历 <code> 子行，（可选 data-char 归组）+ processLine 挂 data-line；
 *  - useTokenTransformer 时追加：tokens（行内字符偏移 __lineChar）、
 *    preprocess（mergeWhitespaces='never' 保字符对齐）、span（offset 落 data-char）；
 *  - withClassTransformer 时追加 TOKEN_STYLE_NORMALIZER + styleToClassTransformer。 */
function createDiffTransformers(useTokenTransformer = false, withClassTransformer = false): {
  state: TransformerState;
  transformers: ShikiTransformer[];
  toClass: typeof styleToClassTransformer;
} {
  const state: TransformerState = { lineInfo: [] };
  const transformers: ShikiTransformer[] = [
    {
      line(element) {
        delete element.properties.class;
        return element;
      },
      pre(root) {
        const codeElement = findCodeElement(root);
        const processed: HastNode[] = [];
        if (codeElement != null) {
          let lineNumber = 1;
          for (const child of codeElement.children)
            if (child.type === "element") {
              if (useTokenTransformer) groupTokensByCharPosition(child);
              processed.push(processLine(child, lineNumber, state));
              lineNumber++;
            }
          codeElement.children = processed;
        }
        return root;
      },
      ...(useTokenTransformer
        ? {
            tokens(lines: ShikiToken[][]) {
              for (const lineTokens of lines) {
                let charOffset = 0;
                for (const token of lineTokens) {
                  token.__lineChar ??= charOffset;
                  charOffset += token.content.length;
                }
              }
            },
            preprocess(_code: string, options: { mergeWhitespaces?: string }) {
              options.mergeWhitespaces = "never";
            },
            span(element: HastElement, _line: number, _lineIndex: number, _tokenIndex: number, token?: ShikiToken) {
              if (token?.offset != null && token.content != null) {
                const charPosition = token.__lineChar;
                if (charPosition != null) element.properties["data-char"] = charPosition;
                return element;
              }
              return element;
            },
          }
        : null),
    },
  ];
  if (withClassTransformer) transformers.push(TOKEN_STYLE_NORMALIZER, styleToClassTransformer);
  return { state, transformers, toClass: styleToClassTransformer };
}

/** 原 Q：CSS 变量前缀——token 级 '--diffs-token-'，全局级 '--diffs-'。 */
function cssVariablePrefix(kind: string): string {
  return `--${kind === "token" ? "diffs-token" : "diffs"}-`;
}

/** 主题形态：单主题名 | {dark, light} 双主题。 */
type DiffsTheme = string | { dark: string; light: string };

/** 原 Ol：从主题 colors 提取增/删/改三色变量——
 *  gitDecoration.addedResourceForeground   → terminal.ansiGreen 兜底（加行色）
 *  gitDecoration.deletedResourceForeground → terminal.ansiRed   兜底（删行色）
 *  gitDecoration.modifiedResourceForeground→ terminal.ansiBlue  兜底（改动色） */
function buildThemeColorVars(theme: ResolvedShikiTheme, prefix?: string): string {
  prefix = prefix == null ? "" : `${prefix}-`;
  let css = "";
  const additionColor = theme.colors?.["gitDecoration.addedResourceForeground"] ?? theme.colors?.["terminal.ansiGreen"];
  if (additionColor != null) css += `${cssVariablePrefix("global")}${prefix}addition-color:${additionColor};`;
  const deletionColor = theme.colors?.["gitDecoration.deletedResourceForeground"] ?? theme.colors?.["terminal.ansiRed"];
  if (deletionColor != null) css += `${cssVariablePrefix("global")}${prefix}deletion-color:${deletionColor};`;
  const modifiedColor = theme.colors?.["gitDecoration.modifiedResourceForeground"] ?? theme.colors?.["terminal.ansiBlue"];
  if (modifiedColor != null) css += `${cssVariablePrefix("global")}${prefix}modified-color:${modifiedColor};`;
  return css;
}

/** 原 Dl：生成主题样式串（主线程挂到渲染容器 style）——
 *  单主题：color/background-color + fg/bg 变量；双主题：dark:/light: 前缀变量对。 */
function buildThemeStyles({ theme = DEFAULT_DIFFS_THEMES, highlighter, prefix }: { theme?: DiffsTheme; highlighter: ShikiHighlighter; prefix?: string }): string {
  let css = "";
  if (typeof theme === "string") {
    const resolved = highlighter.getTheme(theme);
    css += `color:${resolved.fg};`;
    css += `background-color:${resolved.bg};`;
    css += `${cssVariablePrefix("global")}fg:${resolved.fg};`;
    css += `${cssVariablePrefix("global")}bg:${resolved.bg};`;
    css += buildThemeColorVars(resolved, prefix);
  } else {
    let resolved = highlighter.getTheme(theme.dark);
    css += `${cssVariablePrefix("global")}dark:${resolved.fg};`;
    css += `${cssVariablePrefix("global")}dark-bg:${resolved.bg};`;
    css += buildThemeColorVars(resolved, "dark");
    resolved = highlighter.getTheme(theme.light);
    css += `${cssVariablePrefix("global")}light:${resolved.fg};`;
    css += `${cssVariablePrefix("global")}light-bg:${resolved.bg};`;
    css += buildThemeColorVars(resolved, "light");
  }
  return css;
}

/** 原 kl：取 codeToHast 结果里 <code> 的 children（行节点数组）；缺失即抛错。 */
function getLineNodes(root: HastElement): HastNode[] {
  let node: HastNode | null | undefined = root.children[0];
  while (node != null) {
    if (node.type === "element" && node.tagName === "code") return node.children;
    node = "children" in node ? node.children[0] : null;
  }
  throw (console.error(root), Error("getLineNodes: Unable to find children"));
}

/* ============================================================================
 * 8. diff 数据模型（主线程 diff 引擎产物，经 postMessage 传入）
 * ==========================================================================*/

/** hunk 内容段：上下文段 | 变更段（原 e.type==='context' 分支） */
type DiffHunkContent = { type: "context"; lines: number } | { type?: undefined; deletions: number; additions: number };

/** diff hunk（原 r 的消费面） */
interface DiffHunk {
  /** 折叠在本 hunk 之前的上下文行数 */
  collapsedBefore: number;
  unifiedLineStart: number;
  unifiedLineCount: number;
  splitLineStart: number;
  splitLineCount: number;
  deletionStart: number;
  deletionLineIndex: number;
  deletionCount: number;
  additionStart: number;
  additionLineIndex: number;
  additionCount: number;
  noEOFCRDeletions: boolean;
  noEOFCRAdditions: boolean;
  hunkContent: DiffHunkContent[];
}

/** 文件级 diff（原 Rl/Ql 的 diff 参数） */
interface FileDiff {
  name: string;
  prevName?: string;
  lang?: string;
  isPartial?: boolean;
  hunks: DiffHunk[];
  deletionLines: string[];
  additionLines: string[];
  unifiedLineCount: number;
  splitLineCount: number;
}

/** 迭代器产出的行描述（原 deletionLine/additionLine 对象） */
interface DiffIterationLine {
  lineNumber: number;
  lineIndex: number;
  noEOFCR: boolean;
  unifiedLineIndex: number;
  splitLineIndex: number;
}

/** 迭代器产出项（原 callback 参数：context / context-expanded / change） */
interface DiffIterationItem {
  type: "context" | "context-expanded" | "change";
  hunkIndex: number;
  hunk: DiffHunk | undefined;
  collapsedBefore: number;
  collapsedAfter: number;
  deletionLine: DiffIterationLine | undefined;
  additionLine: DiffIterationLine | undefined;
}

type DiffStyle = "unified" | "split" | "both";

/** 折叠区展开指令：true=全展开 | 按 hunk 索引的 fromStart/fromEnd 展开量 */
type ExpandedHunks = boolean | Map<number, { fromStart?: number; fromEnd?: number }> | undefined;

/* ============================================================================
 * 9. iterateOverDiff —— hunk 级窗口化迭代器（原 Al，js 9779–10206 / jsx 9258）
 * ----------------------------------------------------------------------------
 * 职责：把 FileDiff 的 hunks 线性化为逐行事件流（context / context-expanded /
 * change），支持：
 *  - 三种视图口径（unified / split / both）各自独立计行；
 *  - 窗口化高亮（startingLine/totalLines）：窗口外只计数不发事件，
 *    变更段经 computeChangeRanges 裁剪；
 *  - 折叠上下文（collapsedBefore/末 hunk 尾随上下文）：按 expandedHunks 指令
 *    展开 fromStart/fromEnd，其余折叠量经 collapsedBefore/After 上报；
 *  - callback 返回 true 提前终止（标签化循环 hunkIterator）。
 * ==========================================================================*/

interface CollapsedRange {
  fromStart: number;
  fromEnd: number;
  rangeSize: number;
  collapsedLines: number;
}

/** 原 jl：解析一段折叠上下文的展开量——
 *  partial diff 或零折叠→全折叠；全展开指令或 ≤ 阈值→全展开；
 *  否则按 expandedHunks[hunkIndex] 的 fromStart/fromEnd 展开（合计超额则
 *  fromStart 优先吃满）。 */
function resolveCollapsedRange(
  isPartial: boolean | undefined,
  collapsedBefore: number,
  expandedHunks: ExpandedHunks,
  hunkIndex: number,
  collapsedContextThreshold: number,
): CollapsedRange {
  collapsedBefore = Math.max(collapsedBefore, 0);
  if (collapsedBefore === 0 || isPartial)
    return { fromStart: 0, fromEnd: 0, rangeSize: collapsedBefore, collapsedLines: Math.max(collapsedBefore, 0) };
  if (expandedHunks === true || collapsedBefore <= collapsedContextThreshold)
    return { fromStart: collapsedBefore, fromEnd: 0, rangeSize: collapsedBefore, collapsedLines: 0 };
  const expansion = typeof expandedHunks === "object" ? expandedHunks.get(hunkIndex) : undefined;
  const fromStart = Math.min(Math.max(expansion?.fromStart ?? 0, 0), collapsedBefore);
  const fromEnd = Math.min(Math.max(expansion?.fromEnd ?? 0, 0), collapsedBefore);
  const totalExpanded = fromStart + fromEnd;
  const fullyExpanded = totalExpanded >= collapsedBefore;
  return {
    fromStart: fullyExpanded ? collapsedBefore : fromStart,
    fromEnd: fullyExpanded ? 0 : fromEnd,
    rangeSize: collapsedBefore,
    collapsedLines: Math.max(collapsedBefore - totalExpanded, 0),
  };
}

/** 原 Ml：末 hunk 之后是否仍有未消费的增/删行（尾随上下文存在性）。 */
function hasTrailingContext(diff: FileDiff): boolean {
  const lastHunk = diff.hunks.at(-1);
  return lastHunk == null || diff.isPartial || diff.additionLines.length === 0 || diff.deletionLines.length === 0
    ? false
    : lastHunk.additionLineIndex + lastHunk.additionCount < diff.additionLines.length ||
        lastHunk.deletionLineIndex + lastHunk.deletionCount < diff.deletionLines.length;
}

interface DiffIteratorState {
  finalHunk: DiffHunk | undefined;
  viewportStart: number;
  viewportEnd: number;
  isWindowedHighlight: boolean;
  splitCount: number;
  unifiedCount: number;
  shouldBreak(): boolean;
  shouldSkip(unifiedLines: number, splitLines: number): boolean;
  incrementCounts(unifiedLines: number, splitLines: number): void;
  isInWindow(unifiedLines: number, splitLines: number): boolean;
  isInUnifiedWindow(unifiedLines: number): boolean;
  isInSplitWindow(splitLines: number): boolean;
  emit(item: DiffIterationItem, skipCountIncrement?: boolean): boolean;
}

/** 原 Nl：窗口化时把变更段裁剪为 [start,end) 索引区间列表——
 *  unified 口径下删除/新增前后排布（新增偏移 deletions），split 口径下
 *  删除/新增并行；裁剪结果排序后合并重叠区间。 */
function computeChangeRanges(state: DiffIteratorState, content: { deletions: number; additions: number }, diffStyle: DiffStyle): Array<[number, number]> {
  if (!state.isWindowedHighlight)
    return [[0, diffStyle === "unified" ? content.deletions + content.additions : Math.max(content.deletions, content.additions)]];
  const includeUnified = diffStyle !== "split";
  const includeSplit = diffStyle !== "unified";
  const primaryMode = diffStyle === "unified" ? "unified" : "split";
  const ranges: Array<[number, number]> = [];

  function clipRange(rangeStart: number, rangeLength: number): [number, number] | undefined {
    if (rangeStart + rangeLength <= state.viewportStart || rangeStart >= state.viewportEnd) return;
    const clippedStart = Math.max(0, state.viewportStart - rangeStart);
    const clippedEnd = Math.min(rangeLength, state.viewportEnd - rangeStart);
    return clippedEnd > clippedStart ? [clippedStart, clippedEnd] : undefined;
  }
  function adjustForMode(range: [number, number], kind: "additions" | "deletions"): [number, number] {
    return primaryMode === "split" ? range : kind === "additions" ? [range[0] + content.deletions, range[1] + content.deletions] : range;
  }
  function pushRange(range: [number, number] | undefined, kind: "additions" | "deletions") {
    if (range == null) return;
    const [start, end] = adjustForMode(range, kind);
    if (end > start) ranges.push([start, end]);
  }

  if (includeUnified) {
    pushRange(clipRange(state.unifiedCount, content.deletions), "deletions");
    pushRange(clipRange(state.unifiedCount + content.deletions, content.additions), "additions");
  }
  if (includeSplit) {
    pushRange(clipRange(state.splitCount, content.deletions), "deletions");
    pushRange(clipRange(state.splitCount, content.additions), "additions");
  }
  if (ranges.length === 0) return ranges;
  ranges.sort((a, b) => a[0] - b[0]);
  const merged: Array<[number, number]> = [ranges[0]];
  for (const [start, end] of ranges.slice(1)) {
    const last = merged[merged.length - 1];
    if (start <= last[1]) last[1] = Math.max(last[1], end);
    else merged.push([start, end]);
  }
  return merged;
}

/** 原 Pl：由变更段索引装配单个 change 事件（按 unified/split 口径分别计算
 *  删/增行的行号与行索引；缺失一侧时该侧为 undefined；两侧皆缺即抛错）。 */
function buildChangeItem({
  hunkIndex,
  hunk,
  collapsedAfter,
  collapsedBefore,
  diffStyle,
  index,
  unifiedLineIndex,
  splitLineIndex,
  additionLineIndex,
  deletionLineIndex,
  additionLineNumber,
  deletionLineNumber,
  content,
  isLastContent,
  unifiedCount,
  splitCount,
}: {
  hunkIndex: number;
  hunk: DiffHunk;
  collapsedAfter: number;
  collapsedBefore: number;
  diffStyle: DiffStyle;
  index: number;
  unifiedLineIndex: number;
  splitLineIndex: number;
  additionLineIndex: number;
  deletionLineIndex: number;
  additionLineNumber: number;
  deletionLineNumber: number;
  content: { deletions: number; additions: number };
  isLastContent: boolean;
  unifiedCount: number;
  splitCount: number;
}): DiffIterationItem {
  const deletionUnifiedIndex = index < content.deletions ? unifiedLineIndex + index : undefined;
  const additionUnifiedIndex =
    diffStyle === "unified"
      ? index >= content.deletions
        ? unifiedLineIndex + index
        : undefined
      : index < content.additions
        ? unifiedLineIndex + content.deletions + index
        : undefined;
  const sharedSplitIndex = diffStyle === "unified" ? splitLineIndex + (index < content.deletions ? index : index - content.deletions) : splitLineIndex + index;
  const deletionIndex = index < content.deletions ? deletionLineIndex + index : undefined;
  const deletionNumber = index < content.deletions ? deletionLineNumber + index : undefined;
  const additionIndex =
    diffStyle === "unified"
      ? index >= content.deletions
        ? additionLineIndex + (index - content.deletions)
        : undefined
      : index < content.additions
        ? additionLineIndex + index
        : undefined;
  const additionNumber =
    diffStyle === "unified"
      ? index >= content.deletions
        ? additionLineNumber + (index - content.deletions)
        : undefined
      : index < content.additions
        ? additionLineNumber + index
        : undefined;
  const deletionNoEOFCR =
    diffStyle === "unified" ? isLastContent && index === content.deletions - 1 && hunk.noEOFCRDeletions : isLastContent && index === splitCount - 1 && hunk.noEOFCRDeletions;
  const additionNoEOFCR =
    diffStyle === "unified" ? isLastContent && index === unifiedCount - 1 && hunk.noEOFCRAdditions : isLastContent && index === splitCount - 1 && hunk.noEOFCRAdditions;
  const deletionLine =
    deletionIndex != null && deletionNumber != null && deletionUnifiedIndex != null
      ? { lineNumber: deletionNumber, lineIndex: deletionIndex, noEOFCR: deletionNoEOFCR, unifiedLineIndex: deletionUnifiedIndex, splitLineIndex: sharedSplitIndex }
      : undefined;
  const additionLine =
    additionIndex != null && additionNumber != null && additionUnifiedIndex != null
      ? { unifiedLineIndex: additionUnifiedIndex, splitLineIndex: sharedSplitIndex, lineIndex: additionIndex, lineNumber: additionNumber, noEOFCR: additionNoEOFCR }
      : undefined;

  if (deletionLine == null && additionLine != null)
    return { type: "change", hunkIndex, hunk, collapsedAfter, collapsedBefore, deletionLine: undefined, additionLine };
  if (deletionLine != null && additionLine == null)
    return { type: "change", hunkIndex, hunk, collapsedAfter, collapsedBefore, deletionLine, additionLine: undefined };
  if (deletionLine == null || additionLine == null) throw Error("iterateOverDiff: missing change line data");
  return { type: "change", hunkIndex, hunk, collapsedAfter, collapsedBefore, deletionLine, additionLine };
}

function iterateOverDiff({
  diff,
  diffStyle,
  startingLine = 0,
  totalLines = Infinity,
  expandedHunks,
  collapsedContextThreshold = 1,
  callback,
}: {
  diff: FileDiff;
  diffStyle: DiffStyle;
  startingLine?: number;
  totalLines?: number;
  expandedHunks: ExpandedHunks;
  collapsedContextThreshold?: number;
  callback: (item: DiffIterationItem) => boolean | void;
}): void {
  const state: DiffIteratorState = {
    finalHunk: diff.hunks.at(-1),
    viewportStart: startingLine,
    viewportEnd: startingLine + totalLines,
    isWindowedHighlight: startingLine > 0 || totalLines < Infinity,
    splitCount: 0,
    unifiedCount: 0,
    shouldBreak() {
      if (!state.isWindowedHighlight) return false;
      const unifiedDone = state.unifiedCount >= startingLine + totalLines;
      const splitDone = state.splitCount >= startingLine + totalLines;
      return diffStyle === "unified" ? unifiedDone : (diffStyle === "split" || unifiedDone) && splitDone;
    },
    shouldSkip(unifiedLines, splitLines) {
      if (!state.isWindowedHighlight) return false;
      const skipUnified = state.unifiedCount + unifiedLines < startingLine;
      const skipSplit = state.splitCount + splitLines < startingLine;
      return diffStyle === "unified" ? skipUnified : (diffStyle === "split" || skipUnified) && skipSplit;
    },
    incrementCounts(unifiedLines, splitLines) {
      if (diffStyle === "unified" || diffStyle === "both") state.unifiedCount += unifiedLines;
      if (diffStyle === "split" || diffStyle === "both") state.splitCount += splitLines;
    },
    isInWindow(unifiedLines, splitLines) {
      if (!state.isWindowedHighlight) return true;
      const inUnified = state.isInUnifiedWindow(unifiedLines);
      const inSplit = state.isInSplitWindow(splitLines);
      return diffStyle === "unified" ? inUnified : diffStyle === "split" ? inSplit : inUnified || inSplit;
    },
    isInUnifiedWindow(unifiedLines) {
      return !state.isWindowedHighlight || (state.unifiedCount >= startingLine - unifiedLines && state.unifiedCount < startingLine + totalLines);
    },
    isInSplitWindow(splitLines) {
      return !state.isWindowedHighlight || (state.splitCount >= startingLine - splitLines && state.splitCount < startingLine + totalLines);
    },
    emit(item, skipCountIncrement = false) {
      if (!skipCountIncrement)
        if (diffStyle === "unified") state.incrementCounts(1, 0);
        else if (diffStyle === "split") state.incrementCounts(0, 1);
        else state.incrementCounts(1, 1);
      return callback(item) ?? false;
    },
  };

  hunkIterator: for (const [hunkIndex, hunk] of diff.hunks.entries()) {
    if (state.shouldBreak()) break;

    // hunk 之前的折叠上下文
    const leadingCollapsed = resolveCollapsedRange(diff.isPartial, hunk.collapsedBefore, expandedHunks, hunkIndex, collapsedContextThreshold);

    // 仅末 hunk：其后尾随的折叠上下文（增删剩余量必须相等，否则数据损坏）
    const trailingCollapsed = (() => {
      if (hunk !== state.finalHunk || !hasTrailingContext(diff)) return;
      const remainingAdditions = diff.additionLines.length - (hunk.additionLineIndex + hunk.additionCount);
      const remainingDeletions = diff.deletionLines.length - (hunk.deletionLineIndex + hunk.deletionCount);
      if (remainingAdditions !== remainingDeletions)
        throw Error(`iterateOverDiff: trailing context mismatch (additions=${remainingAdditions}, deletions=${remainingDeletions}) for ${diff.name}`);
      const trailingLines = Math.min(remainingAdditions, remainingDeletions);
      return resolveCollapsedRange(diff.isPartial, trailingLines, expandedHunks, diff.hunks.length, collapsedContextThreshold);
    })();
    const collapsedRangeSize = leadingCollapsed.fromStart + leadingCollapsed.fromEnd;

    /** 尾随折叠量只在 hunk 最后一行事件上随附上报。 */
    function getCollapsedAfter(unifiedLineIndex: number, splitLineIndex: number): number {
      return trailingCollapsed == null || trailingCollapsed.collapsedLines <= 0 || trailingCollapsed.fromStart + trailingCollapsed.fromEnd > 0
        ? 0
        : diffStyle === "unified"
          ? unifiedLineIndex === hunk.unifiedLineStart + hunk.unifiedLineCount - 1
            ? trailingCollapsed.collapsedLines
            : 0
          : splitLineIndex === hunk.splitLineStart + hunk.splitLineCount - 1
            ? trailingCollapsed.collapsedLines
            : 0;
    }

    /** 前导折叠量一次性消费（只挂在首个展开行事件上）。 */
    function consumeCollapsedBefore(): number {
      if (leadingCollapsed.collapsedLines === 0) return 0;
      const lines = leadingCollapsed.collapsedLines;
      leadingCollapsed.collapsedLines = 0;
      return lines;
    }

    if (state.shouldSkip(collapsedRangeSize, collapsedRangeSize)) {
      state.incrementCounts(collapsedRangeSize, collapsedRangeSize);
      consumeCollapsedBefore();
    } else {
      // 前导展开 fromStart 段：行号回退 rangeSize 逐行发 context-expanded
      let unifiedLineIndex = hunk.unifiedLineStart - leadingCollapsed.rangeSize;
      let splitLineIndex = hunk.splitLineStart - leadingCollapsed.rangeSize;
      let deletionLineIndex = hunk.deletionLineIndex - leadingCollapsed.rangeSize;
      let additionLineIndex = hunk.additionLineIndex - leadingCollapsed.rangeSize;
      let deletionLineNumber = hunk.deletionStart - leadingCollapsed.rangeSize;
      let additionLineNumber = hunk.additionStart - leadingCollapsed.rangeSize;
      let offset = 0;
      for (; offset < leadingCollapsed.fromStart; ) {
        if (state.isInWindow(0, 0)) {
          if (
            state.emit({
              hunkIndex,
              hunk,
              collapsedBefore: 0,
              collapsedAfter: 0,
              type: "context-expanded",
              deletionLine: {
                lineNumber: deletionLineNumber + offset,
                lineIndex: deletionLineIndex + offset,
                noEOFCR: false,
                unifiedLineIndex: unifiedLineIndex + offset,
                splitLineIndex: splitLineIndex + offset,
              },
              additionLine: {
                unifiedLineIndex: unifiedLineIndex + offset,
                splitLineIndex: splitLineIndex + offset,
                lineIndex: additionLineIndex + offset,
                lineNumber: additionLineNumber + offset,
                noEOFCR: false,
              },
            })
          )
            break hunkIterator;
        } else state.incrementCounts(1, 1);
        offset++;
      }
      // 前导展开 fromEnd 段：基址改为相对 fromEnd，并随首行挂折叠量
      unifiedLineIndex = hunk.unifiedLineStart - leadingCollapsed.fromEnd;
      splitLineIndex = hunk.splitLineStart - leadingCollapsed.fromEnd;
      deletionLineIndex = hunk.deletionLineIndex - leadingCollapsed.fromEnd;
      additionLineIndex = hunk.additionLineIndex - leadingCollapsed.fromEnd;
      deletionLineNumber = hunk.deletionStart - leadingCollapsed.fromEnd;
      additionLineNumber = hunk.additionStart - leadingCollapsed.fromEnd;
      offset = 0;
      for (; offset < leadingCollapsed.fromEnd; ) {
        if (state.isInWindow(0, 0)) {
          if (
            state.emit({
              hunkIndex,
              hunk,
              collapsedBefore: consumeCollapsedBefore(),
              collapsedAfter: 0,
              type: "context-expanded",
              deletionLine: {
                lineNumber: deletionLineNumber + offset,
                lineIndex: deletionLineIndex + offset,
                noEOFCR: false,
                unifiedLineIndex: unifiedLineIndex + offset,
                splitLineIndex: splitLineIndex + offset,
              },
              additionLine: {
                unifiedLineIndex: unifiedLineIndex + offset,
                splitLineIndex: splitLineIndex + offset,
                lineIndex: additionLineIndex + offset,
                lineNumber: additionLineNumber + offset,
                noEOFCR: false,
              },
            })
          )
            break hunkIterator;
        } else state.incrementCounts(1, 1);
        offset++;
      }
    }

    // hunk 内容逐段迭代
    let unifiedLineIndex = hunk.unifiedLineStart;
    let splitLineIndex = hunk.splitLineStart;
    let deletionLineIndex = hunk.deletionLineIndex;
    let additionLineIndex = hunk.additionLineIndex;
    let deletionLineNumber = hunk.deletionStart;
    let additionLineNumber = hunk.additionStart;
    const lastContent = hunk.hunkContent.at(-1);
    for (const content of hunk.hunkContent) {
      if (state.shouldBreak()) break hunkIterator;
      const isLastContent = content === lastContent;
      if (content.type === "context") {
        if (state.shouldSkip(content.lines, content.lines)) {
          state.incrementCounts(content.lines, content.lines);
          consumeCollapsedBefore();
        } else {
          let offset = 0;
          for (; offset < content.lines; ) {
            if (state.isInWindow(0, 0)) {
              const isLastLine = isLastContent && offset === content.lines - 1;
              const currentUnifiedIndex = unifiedLineIndex + offset;
              const currentSplitIndex = splitLineIndex + offset;
              if (
                state.emit({
                  hunkIndex,
                  hunk,
                  collapsedBefore: consumeCollapsedBefore(),
                  collapsedAfter: getCollapsedAfter(currentUnifiedIndex, currentSplitIndex),
                  type: "context",
                  deletionLine: {
                    lineNumber: deletionLineNumber + offset,
                    lineIndex: deletionLineIndex + offset,
                    noEOFCR: isLastLine && hunk.noEOFCRDeletions,
                    unifiedLineIndex: currentUnifiedIndex,
                    splitLineIndex: currentSplitIndex,
                  },
                  additionLine: {
                    unifiedLineIndex: currentUnifiedIndex,
                    splitLineIndex: currentSplitIndex,
                    lineIndex: additionLineIndex + offset,
                    lineNumber: additionLineNumber + offset,
                    noEOFCR: isLastLine && hunk.noEOFCRAdditions,
                  },
                })
              )
                break hunkIterator;
            } else state.incrementCounts(1, 1);
            offset++;
          }
        }
        unifiedLineIndex += content.lines;
        splitLineIndex += content.lines;
        deletionLineIndex += content.lines;
        additionLineIndex += content.lines;
        deletionLineNumber += content.lines;
        additionLineNumber += content.lines;
      } else {
        const splitLines = Math.max(content.deletions, content.additions);
        const unifiedLines = content.deletions + content.additions;
        if (!state.shouldSkip(unifiedLines, splitLines)) {
          const ranges = computeChangeRanges(state, content, diffStyle);
          for (const [rangeStart, rangeEnd] of ranges)
            for (let index = rangeStart; index < rangeEnd; index++) {
              const collapsedAfter = getCollapsedAfter(
                unifiedLineIndex + index,
                diffStyle === "unified" ? splitLineIndex + (index < content.deletions ? index : index - content.deletions) : splitLineIndex + index,
              );
              if (
                state.emit(
                  buildChangeItem({
                    hunkIndex,
                    hunk,
                    collapsedBefore: consumeCollapsedBefore(),
                    collapsedAfter,
                    diffStyle,
                    index,
                    unifiedLineIndex,
                    splitLineIndex,
                    additionLineIndex,
                    deletionLineIndex,
                    additionLineNumber,
                    deletionLineNumber,
                    content,
                    isLastContent,
                    unifiedCount: unifiedLines,
                    splitCount: splitLines,
                  }),
                  true,
                )
              )
                break hunkIterator;
            }
        }
        consumeCollapsedBefore();
        state.incrementCounts(unifiedLines, splitLines);
        unifiedLineIndex += unifiedLines;
        splitLineIndex += splitLines;
        deletionLineIndex += content.deletions;
        additionLineIndex += content.additions;
        deletionLineNumber += content.deletions;
        additionLineNumber += content.additions;
      }
    }

    // 末 hunk 尾随折叠上下文的展开段（hunkIndex 记为 hunks.length）
    if (trailingCollapsed != null) {
      const { collapsedLines, fromStart, fromEnd } = trailingCollapsed;
      const total = fromStart + fromEnd;
      let offset = 0;
      for (; offset < total; ) {
        if (state.shouldBreak()) break hunkIterator;
        if (state.isInWindow(0, 0)) {
          const isLast = offset === total - 1;
          if (
            state.emit({
              hunkIndex: diff.hunks.length,
              hunk: undefined,
              collapsedBefore: 0,
              collapsedAfter: isLast ? collapsedLines : 0,
              type: "context-expanded",
              deletionLine: {
                lineNumber: deletionLineNumber + offset,
                lineIndex: deletionLineIndex + offset,
                noEOFCR: false,
                unifiedLineIndex: unifiedLineIndex + offset,
                splitLineIndex: splitLineIndex + offset,
              },
              additionLine: {
                unifiedLineIndex: unifiedLineIndex + offset,
                splitLineIndex: splitLineIndex + offset,
                lineIndex: additionLineIndex + offset,
                lineNumber: additionLineNumber + offset,
                noEOFCR: false,
              },
            })
          )
            break hunkIterator;
        } else state.incrementCounts(1, 1);
        offset++;
      }
    }
  }
}

/* ============================================================================
 * 10. 行内 diff 装饰（原 Fl/Il/zl，js 10364–10412、10515–10554）
 * ==========================================================================*/

/** 原 Fl：行内 diff 高亮装饰（shiki decorations；data-diff-span 空值属性 +
 *  alwaysWrap 保证跨 token 边界成包）。 */
function createDiffSpanDecoration({ line, spanStart, spanLength }: { line: number; spanStart: number; spanLength: number }): LineDecoration {
  return {
    start: { line, character: spanStart },
    end: { line, character: spanStart + spanLength },
    properties: { "data-diff-span": "" },
    alwaysWrap: true,
  };
}

/** 差异片段：[是否差异(0=中性/1=差异), 文本]（原 Il 的 arr 元素） */
type DiffSegment = [number, string];

/** 原 Il：把 jsdiff 变更项顺序拼成片段数组——
 *  word-alt 口径（enableJoin）下相邻同类片段合并文本；单字符中性片段
 *  并入前一差异片段（减少碎高亮）。 */
function appendDiffSegment({
  item,
  arr,
  enableJoin,
  isNeutral = false,
  isLastItem = false,
}: {
  item: DiffChange;
  arr: DiffSegment[];
  enableJoin: boolean;
  isNeutral?: boolean;
  isLastItem?: boolean;
}): void {
  const last = arr[arr.length - 1];
  if (last == null || isLastItem || !enableJoin) {
    arr.push([+!isNeutral, item.value]);
    return;
  }
  const lastIsNeutral = last[0] === 0;
  if (isNeutral === lastIsNeutral || (isNeutral && item.value.length === 1 && !lastIsNeutral)) {
    last[1] += item.value;
    return;
  }
  arr.push([+!isNeutral, item.value]);
}

/** 原 zl：对一对增删行做行内 diff（char → diffChars；word-alt →
 *  diffWordsWithSpace），把差异区段转成两侧的行内装饰。
 *  超长行（任一侧 > maxLineDiffLength）或 none 口径跳过。 */
function computeLineDecorations({
  deletionLine,
  additionLine,
  deletionLineIndex,
  additionLineIndex,
  deletionDecorations,
  additionDecorations,
  lineDiffType,
  maxLineDiffLength,
}: {
  deletionLine: string | undefined;
  additionLine: string | undefined;
  deletionLineIndex: number;
  additionLineIndex: number;
  deletionDecorations: LineDecoration[];
  additionDecorations: LineDecoration[];
  lineDiffType: LineDiffType;
  maxLineDiffLength: number;
}): void {
  if (
    deletionLine == null ||
    additionLine == null ||
    lineDiffType === "none" ||
    ((deletionLine = stripTrailingNewline(deletionLine)),
    (additionLine = stripTrailingNewline(additionLine)),
    deletionLine.length > maxLineDiffLength || additionLine.length > maxLineDiffLength)
  )
    return;

  const changes = lineDiffType === "char" ? diffChars(deletionLine, additionLine) : diffWordsWithSpace(deletionLine, additionLine);
  const deletionSegments: DiffSegment[] = [];
  const additionSegments: DiffSegment[] = [];
  const enableJoin = lineDiffType === "word-alt";
  const lastChange = changes.at(-1);
  for (const change of changes) {
    const isLastItem = change === lastChange;
    if (!change.added && !change.removed) {
      appendDiffSegment({ item: change, arr: deletionSegments, enableJoin, isNeutral: true, isLastItem });
      appendDiffSegment({ item: change, arr: additionSegments, enableJoin, isNeutral: true, isLastItem });
    } else if (change.removed) {
      appendDiffSegment({ item: change, arr: deletionSegments, enableJoin, isLastItem });
    } else {
      appendDiffSegment({ item: change, arr: additionSegments, enableJoin, isLastItem });
    }
  }

  let offset = 0;
  for (const segment of deletionSegments) {
    if (segment[0] === 1) deletionDecorations.push(createDiffSpanDecoration({ line: deletionLineIndex, spanStart: offset, spanLength: segment[1].length }));
    offset += segment[1].length;
  }
  offset = 0;
  for (const segment of additionSegments) {
    if (segment[0] === 1) additionDecorations.push(createDiffSpanDecoration({ line: additionLineIndex, spanStart: offset, spanLength: segment[1].length }));
    offset += segment[1].length;
  }
}

/* ============================================================================
 * 11. renderDiff —— diff 主渲染器（原 Bl/Rl/Vl，js 10555–10599 / jsx 9669）
 * ==========================================================================*/

/** 行号/口径信息（原 deletionInfo/additionInfo 项；供 processLine 消费） */
interface RenderLineInfo extends LineInfo {
  altLineNumber?: number;
}

/** 内容累积器（原 Bl 的 deletionContent/additionContent） */
interface ContentAccumulator {
  push(line: string): void;
  value: string;
  length: number;
}

/** 窗口回填段（原 deletionSegments/additionSegments 项） */
interface LineSegment {
  targetIndex: number;
  originalOffset: number;
  count: number;
}

/** hunk 累积器（原 Bl）：每个 hunk（或单块模式的全局桶）一份。 */
interface HunkAccumulator {
  deletionContent: ContentAccumulator;
  additionContent: ContentAccumulator;
  deletionInfo: RenderLineInfo[];
  additionInfo: RenderLineInfo[];
  deletionDecorations: LineDecoration[];
  additionDecorations: LineDecoration[];
  deletionSegments: LineSegment[];
  additionSegments: LineSegment[];
}

function createHunkAccumulator(): HunkAccumulator {
  return {
    deletionContent: {
      push(line: string) {
        this.value += line;
        this.length++;
      },
      value: "",
      length: 0,
    },
    additionContent: {
      push(line: string) {
        this.value += line;
        this.length++;
      },
      value: "",
      length: 0,
    },
    deletionInfo: [],
    additionInfo: [],
    deletionDecorations: [],
    additionDecorations: [],
    deletionSegments: [],
    additionSegments: [],
  };
}

/** 原 Vl：把一个累积桶的删/增内容分别 codeToHast 高亮——
 *  语言取 languageOverride（纯文本模式强制 'text'）或按文件名解析；
 *  lang 先占位 'text' 再覆写（与原始逐字一致）；空内容返回空数组。 */
function highlightFilePair({
  deletionFile,
  additionFile,
  deletionInfo,
  additionInfo,
  highlighter,
  deletionDecorations,
  additionDecorations,
  languageOverride,
  options: { theme = DEFAULT_DIFFS_THEMES, ...codeToHastOptions },
}: {
  deletionFile: { name: string; contents: string };
  additionFile: { name: string; contents: string };
  deletionInfo: RenderLineInfo[];
  additionInfo: RenderLineInfo[];
  highlighter: ShikiHighlighter;
  deletionDecorations: LineDecoration[];
  additionDecorations: LineDecoration[];
  languageOverride?: string;
  options: RenderOptions;
}): { deletionLines: HastNode[]; additionLines: HastNode[] } {
  const deletionLanguage = languageOverride ?? resolveLanguageForFileName(deletionFile.name);
  const additionLanguage = languageOverride ?? resolveLanguageForFileName(additionFile.name);
  const { state, transformers } = createDiffTransformers(codeToHastOptions.useTokenTransformer);
  const hastOptions: CodeToHastOptions =
    typeof theme === "string"
      ? { ...codeToHastOptions, lang: "text", theme, transformers, decorations: undefined, defaultColor: false, cssVariablePrefix: cssVariablePrefix("token") }
      : { ...codeToHastOptions, lang: "text", themes: theme, transformers, decorations: undefined, defaultColor: false, cssVariablePrefix: cssVariablePrefix("token") };
  return {
    deletionLines:
      deletionFile.contents === ""
        ? []
        : ((hastOptions.lang = deletionLanguage),
          (state.lineInfo = deletionInfo),
          (hastOptions.decorations = deletionDecorations),
          getLineNodes(highlighter.codeToHast(stripTrailingNewline(deletionFile.contents), hastOptions))),
    additionLines:
      additionFile.contents === ""
        ? []
        : ((hastOptions.lang = additionLanguage),
          (hastOptions.decorations = additionDecorations),
          (state.lineInfo = additionInfo),
          getLineNodes(highlighter.codeToHast(stripTrailingNewline(additionFile.contents), hastOptions))),
  };
}

type LineDiffType = "char" | "word-alt" | "none";

/** 渲染选项（主线程经 initialize / set-render-options 下发；原 $） */
interface RenderOptions {
  theme: DiffsTheme;
  useTokenTransformer: boolean;
  tokenizeMaxLineLength: number;
  lineDiffType: LineDiffType;
  maxLineDiffLength: number;
}

/** 窗口渲染参数（原 Ll/Wl 默认 {forcePlainText:false}） */
interface WindowRenderOptions {
  forcePlainText: boolean;
  startingLine?: number;
  totalLines?: number;
  expandedHunks?: ExpandedHunks;
  collapsedContextThreshold?: number;
  lines?: string[];
}

const DEFAULT_WINDOW_OPTIONS: WindowRenderOptions = { forcePlainText: false };

/** 渲染结果（原 tu/nu 的 result） */
interface RenderResult {
  /** diff：{deletionLines, additionLines}（hast 行节点）；file：hast 行节点数组 */
  code: { deletionLines: HastNode[]; additionLines: HastNode[] } | HastNode[];
  themeStyles: string;
  baseThemeType?: "dark" | "light";
}

/** 原 Rl：diff 主渲染——
 *  1) iterateOverDiff（both 口径）把每个 hunk 的增删行累积进桶，
 *     change 行对顺带做行内 diff 装饰（纯文本模式跳过）；
 *  2) 每桶成对高亮（highlightFilePair）；
 *  3) 单块模式（非纯文本且非 partial）直接整体返回；窗口模式按
 *     segments 把高亮结果回填到目标行号位置。
 *  纯文本模式（forcePlainText）：行窗口生效、语言强制 text、
 *  大文件（>1000 行）禁行内 diff。 */
function renderDiff(
  diff: FileDiff,
  highlighter: ShikiHighlighter,
  options: RenderOptions,
  { forcePlainText, startingLine, totalLines, expandedHunks, collapsedContextThreshold = 1 }: WindowRenderOptions = DEFAULT_WINDOW_OPTIONS,
): RenderResult {
  if (forcePlainText) {
    startingLine ??= 0;
    totalLines ??= Infinity;
  } else {
    startingLine = 0;
    totalLines = Infinity;
  }
  const isWindowed = startingLine > 0 || totalLines < Infinity;
  const baseThemeType = typeof options.theme === "string" ? highlighter.getTheme(options.theme).type : undefined;
  const themeStyles = buildThemeStyles({ theme: options.theme, highlighter });
  const lineDiffType = forcePlainText && !isWindowed && (diff.unifiedLineCount > 1000 || diff.splitLineCount > 1000) ? "none" : options.lineDiffType;
  const code: { deletionLines: HastNode[]; additionLines: HastNode[] } = { deletionLines: [], additionLines: [] };
  const { maxLineDiffLength } = options;
  const isSingleBlock = !forcePlainText && !diff.isPartial;
  const windowedExpandedHunks = forcePlainText ? expandedHunks : undefined;
  const hunkAccumulators = new Map<number, HunkAccumulator>();

  function getAccumulator(hunkIndex: number): HunkAccumulator {
    const key = isSingleBlock ? 0 : hunkIndex;
    const accumulator = hunkAccumulators.get(key) ?? createHunkAccumulator();
    hunkAccumulators.set(key, accumulator);
    return accumulator;
  }

  /** 收行；窗口模式同时登记回填段（连续目标行号合并为一段）。 */
  function pushLine(line: string, targetIndex: number, segments: LineSegment[], content: ContentAccumulator): void {
    if (isWindowed) {
      let segment = segments.at(-1);
      if (segment == null || segment.targetIndex + segment.count !== targetIndex) {
        segment = { targetIndex, originalOffset: content.length, count: 0 };
        segments.push(segment);
      }
      segment.count++;
    }
    content.push(line);
  }

  iterateOverDiff({
    diff,
    diffStyle: "both",
    startingLine,
    totalLines,
    expandedHunks: isWindowed ? windowedExpandedHunks : true,
    collapsedContextThreshold,
    callback: ({ hunkIndex, additionLine, deletionLine, type }) => {
      const accumulator = getAccumulator(hunkIndex);
      const splitLineIndex = additionLine == null ? deletionLine!.splitLineIndex : additionLine.splitLineIndex;
      if (type === "change" && additionLine != null && deletionLine != null)
        computeLineDecorations({
          additionLine: diff.additionLines[additionLine.lineIndex],
          deletionLine: diff.deletionLines[deletionLine.lineIndex],
          deletionLineIndex: accumulator.deletionContent.length,
          additionLineIndex: accumulator.additionContent.length,
          deletionDecorations: accumulator.deletionDecorations,
          additionDecorations: accumulator.additionDecorations,
          lineDiffType,
          maxLineDiffLength,
        });
      if (deletionLine != null) {
        pushLine(diff.deletionLines[deletionLine.lineIndex], deletionLine.lineIndex, accumulator.deletionSegments, accumulator.deletionContent);
        accumulator.deletionInfo.push({
          type: type === "change" ? "change-deletion" : type,
          lineNumber: deletionLine.lineNumber,
          // 原实现直接取 additionLine.lineNumber：非 change 事件两侧行必同时存在
          altLineNumber: type === "change" ? undefined : (additionLine!.lineNumber ?? undefined),
          lineIndex: `${deletionLine.unifiedLineIndex},${splitLineIndex}`,
        });
      }
      if (additionLine != null) {
        pushLine(diff.additionLines[additionLine.lineIndex], additionLine.lineIndex, accumulator.additionSegments, accumulator.additionContent);
        accumulator.additionInfo.push({
          type: type === "change" ? "change-addition" : type,
          lineNumber: additionLine.lineNumber,
          // 原实现直接取 deletionLine.lineNumber：非 change 事件两侧行必同时存在
          altLineNumber: type === "change" ? undefined : (deletionLine!.lineNumber ?? undefined),
          lineIndex: `${additionLine.unifiedLineIndex},${splitLineIndex}`,
        });
      }
    },
  });

  for (const accumulator of hunkAccumulators.values()) {
    if (accumulator.deletionContent.length === 0 && accumulator.additionContent.length === 0) continue;
    const deletionFile = { name: diff.prevName ?? diff.name, contents: accumulator.deletionContent.value };
    const additionFile = { name: diff.name, contents: accumulator.additionContent.value };
    const { deletionLines, additionLines } = highlightFilePair({
      deletionFile,
      deletionInfo: accumulator.deletionInfo,
      deletionDecorations: accumulator.deletionDecorations,
      additionFile,
      additionInfo: accumulator.additionInfo,
      additionDecorations: accumulator.additionDecorations,
      highlighter,
      options,
      languageOverride: forcePlainText ? "text" : diff.lang,
    });
    if (isSingleBlock) {
      code.deletionLines = deletionLines;
      code.additionLines = additionLines;
      continue;
    }
    if (accumulator.deletionSegments.length > 0)
      for (const segment of accumulator.deletionSegments)
        for (let i = 0; i < segment.count; i++) code.deletionLines[segment.targetIndex + i] = deletionLines[segment.originalOffset + i];
    else code.deletionLines.push(...deletionLines);
    if (accumulator.additionSegments.length > 0)
      for (const segment of accumulator.additionSegments)
        for (let i = 0; i < segment.count; i++) code.additionLines[segment.targetIndex + i] = additionLines[segment.originalOffset + i];
    else code.additionLines.push(...additionLines);
  }
  return { code, themeStyles, baseThemeType };
}

/* ============================================================================
 * 12. renderFile —— 单文件渲染器（原 Hl/Ul/Kl/Gl，js 10600–10680 / jsx 9905）
 * ==========================================================================*/

/** 原 Hl：按行窗口迭代（末行空行尾时提前一行收尾；callback 返回 true 提前终止）。 */
function iterateLines({
  lines,
  startingLine = 0,
  totalLines = Infinity,
  callback,
}: {
  lines: string[];
  startingLine?: number;
  totalLines?: number;
  callback: (item: { lineIndex: number; lineNumber: number; content: string; isLastLine: boolean }) => boolean | void;
}): void {
  const end = Math.min(startingLine + totalLines, lines.length);
  const lastLineIndex = (() => {
    const lastLine = lines.at(-1);
    return lastLine === "" || lastLine === "\n" || lastLine === "\r\n" || lastLine === "\r" ? Math.max(0, lines.length - 2) : lines.length - 1;
  })();
  for (let lineIndex = startingLine; lineIndex < end; lineIndex++) {
    const isLastLine = lineIndex === lastLineIndex;
    if (callback({ lineIndex, lineNumber: lineIndex + 1, content: lines[lineIndex], isLastLine }) === true || isLastLine) break;
  }
}

/** 原 Ul：分行（保留行尾换行；空串→空数组）。 */
function splitLines(text: string): string[] {
  return text === "" ? [] : text.split(LINE_SPLIT_REGEX);
}

/** 原 Kl：把行数组的窗口切片拼回字符串。 */
function joinLineSlice(lines: string[], startingLine: number, totalLines: number): string {
  let joined = "";
  iterateLines({
    lines,
    startingLine,
    totalLines,
    callback({ content }) {
      joined += content;
    },
  });
  return joined;
}

/** 文件渲染请求的 file 载荷（原 Zl 的 file） */
interface FilePayload {
  name: string;
  lang?: string;
  contents: string;
}

/** 原 Gl：单文件渲染——语言取 file.lang 或按文件名解析（纯文本强制 text）；
 *  窗口模式先切片再高亮，结果前置 startingLine 个空位（稀疏数组）对齐行号；
 *  lineInfo 用函数形态按行号换算（context 类型）。 */
function renderFile(
  file: FilePayload,
  highlighter: ShikiHighlighter,
  { theme = DEFAULT_DIFFS_THEMES, tokenizeMaxLineLength, useTokenTransformer }: { theme?: DiffsTheme; tokenizeMaxLineLength?: number; useTokenTransformer?: boolean },
  { forcePlainText, startingLine, totalLines, lines }: WindowRenderOptions = DEFAULT_WINDOW_OPTIONS,
): RenderResult {
  if (forcePlainText) {
    startingLine ??= 0;
    totalLines ??= Infinity;
  } else {
    startingLine = 0;
    totalLines = Infinity;
  }
  const isWindowed = startingLine > 0 || totalLines < Infinity;
  const { state, transformers } = createDiffTransformers(useTokenTransformer);
  const language = forcePlainText ? "text" : (file.lang ?? resolveLanguageForFileName(file.name));
  const baseThemeType = typeof theme === "string" ? highlighter.getTheme(theme).type : undefined;
  const themeStyles = buildThemeStyles({ theme, highlighter });
  state.lineInfo = (lineNumber) => ({ type: "context", lineIndex: lineNumber - 1 + startingLine, lineNumber: lineNumber + startingLine });
  const hastOptions: CodeToHastOptions =
    typeof theme === "string"
      ? { lang: language, theme, transformers, defaultColor: false, cssVariablePrefix: cssVariablePrefix("token"), tokenizeMaxLineLength }
      : { lang: language, themes: theme, transformers, defaultColor: false, cssVariablePrefix: cssVariablePrefix("token"), tokenizeMaxLineLength };
  const lineNodes = getLineNodes(
    highlighter.codeToHast(isWindowed ? joinLineSlice(lines ?? splitLines(file.contents), startingLine, totalLines) : stripTrailingNewline(file.contents), hastOptions),
  );
  const paddedLines: HastNode[] = isWindowed ? Array(startingLine) : lineNodes;
  if (isWindowed) paddedLines.push(...lineNodes);
  return { code: paddedLines, themeStyles, baseThemeType };
}

/* ============================================================================
 * 13. 消息处理器（原 ql/$/Jl/Yl/Xl/Zl/Ql/$l/eu/tu/nu/ru，js 10681–10697）
 * ==========================================================================*/

type PreferredHighlighter = "shiki-js" | "shiki-wasm";

/** 高亮器单例（原 ql；createHighlighter 返回 Promise，消费前经 'then' in 判定 await） */
let highlighterSingleton: Promise<ShikiHighlighter> | ShikiHighlighter | undefined;

/** 当前渲染选项（原 $；默认值逐字保留） */
let renderOptions: RenderOptions = {
  theme: DEFAULT_DIFFS_THEMES,
  useTokenTransformer: false,
  tokenizeMaxLineLength: 1000,
  lineDiffType: "word-alt",
  maxLineDiffLength: 1000,
};

/* --- 请求/响应类型（§三 协议） --- */

interface InitializeRequest {
  type: "initialize";
  id: string;
  renderOptions: RenderOptions;
  preferredHighlighter?: PreferredHighlighter;
  resolvedThemes: Array<ResolvedShikiTheme | string> | ResolvedShikiTheme | string;
  resolvedLanguages?: ResolvedLanguage[] | null;
  customExtensionsVersion?: number | null;
  customExtensionMap?: Record<string, string> | null;
}
interface SetRenderOptionsRequest {
  type: "set-render-options";
  id: string;
  renderOptions: RenderOptions;
  resolvedThemes: Array<ResolvedShikiTheme | string> | ResolvedShikiTheme | string;
}
interface FileRequest {
  type: "file";
  id: string;
  file: FilePayload;
  resolvedLanguages?: ResolvedLanguage[] | null;
  customExtensionsVersion?: number | null;
  customExtensionMap?: Record<string, string> | null;
}
interface DiffRequest {
  type: "diff";
  id: string;
  diff: FileDiff;
  resolvedLanguages?: ResolvedLanguage[] | null;
  customExtensionsVersion?: number | null;
  customExtensionMap?: Record<string, string> | null;
}
type WorkerRequest = InitializeRequest | SetRenderOptionsRequest | FileRequest | DiffRequest;

type WorkerResponse =
  | { type: "success"; requestType: "initialize" | "set-render-options"; id: string; sentAt: number }
  | { type: "success"; requestType: "file" | "diff"; id: string; result: RenderResult; options: unknown; sentAt: number }
  | { type: "error"; id: string; error: string; stack?: string };

// 原实现（js 10686–10690）：全局错误日志 + 消息分派入口。
self.addEventListener("error", (event) => {
  console.error("[Shiki Worker] Unhandled error:", event.error);
});
self.addEventListener("message", (event) => {
  void handleWorkerMessage(event.data);
});

/** 原 Jl：请求分派；任何异常统一走 postErrorResponse。 */
async function handleWorkerMessage(request: WorkerRequest): Promise<void> {
  try {
    switch (request.type) {
      case "initialize":
        await handleInitialize(request);
        break;
      case "set-render-options":
        await handleSetRenderOptions(request);
        break;
      case "file":
        await handleFileRequest(request);
        break;
      case "diff":
        await handleDiffRequest(request);
        break;
      default:
        throw Error(`Unknown request type: ${(request as { type: string }).type}`);
    }
  } catch (error) {
    console.error("Worker error:", error);
    postErrorResponse(request.id, error);
  }
}

/** 原 Yl：初始化——建高亮器（按偏好选引擎）→ 应用自定义扩展 →
 *  载入主题/语言 → 落渲染选项 → 回 success。 */
async function handleInitialize({
  id,
  renderOptions: nextOptions,
  preferredHighlighter,
  resolvedThemes,
  resolvedLanguages,
  customExtensionsVersion: extensionsVersion,
  customExtensionMap: extensionMap,
}: InitializeRequest): Promise<void> {
  let highlighter = getOrCreateHighlighter(preferredHighlighter);
  if ("then" in highlighter) highlighter = await highlighter;
  applyCustomExtensions({ customExtensionsVersion: extensionsVersion, customExtensionMap: extensionMap });
  loadResolvedThemes(resolvedThemes, highlighter);
  if (resolvedLanguages != null) loadResolvedLanguages(resolvedLanguages, highlighter);
  renderOptions = nextOptions;
  postMessage({ type: "success", id, requestType: "initialize", sentAt: Date.now() });
}

/** 原 Xl：更新渲染选项（主题变化时随带新解析主题）。 */
async function handleSetRenderOptions({ id, renderOptions: nextOptions, resolvedThemes }: SetRenderOptionsRequest): Promise<void> {
  let highlighter = getOrCreateHighlighter();
  if ("then" in highlighter) highlighter = await highlighter;
  loadResolvedThemes(resolvedThemes, highlighter);
  renderOptions = nextOptions;
  postMessage({ type: "success", id, requestType: "set-render-options", sentAt: Date.now() });
}

/** 原 Zl：单文件渲染请求。 */
async function handleFileRequest({ id, file, resolvedLanguages, customExtensionsVersion: extensionsVersion, customExtensionMap: extensionMap }: FileRequest): Promise<void> {
  let highlighter = getOrCreateHighlighter();
  if ("then" in highlighter) highlighter = await highlighter;
  applyCustomExtensions({ customExtensionsVersion: extensionsVersion, customExtensionMap: extensionMap });
  if (resolvedLanguages != null) loadResolvedLanguages(resolvedLanguages, highlighter);
  const highlightOptions = {
    theme: renderOptions.theme,
    useTokenTransformer: renderOptions.useTokenTransformer,
    tokenizeMaxLineLength: renderOptions.tokenizeMaxLineLength,
  };
  postFileSuccess(id, renderFile(file, highlighter, highlightOptions), highlightOptions);
}

/** 原 Ql：diff 渲染请求（用全量渲染选项）。 */
async function handleDiffRequest({ id, diff, resolvedLanguages, customExtensionsVersion: extensionsVersion, customExtensionMap: extensionMap }: DiffRequest): Promise<void> {
  let highlighter = getOrCreateHighlighter();
  if ("then" in highlighter) highlighter = await highlighter;
  applyCustomExtensions({ customExtensionsVersion: extensionsVersion, customExtensionMap: extensionMap });
  if (resolvedLanguages != null) loadResolvedLanguages(resolvedLanguages, highlighter);
  postDiffSuccess(id, renderDiff(diff, highlighter, renderOptions), renderOptions);
}

/** 原 $l：高亮器单例工厂——
 *  'shiki-wasm' → oniguruma wasm 引擎（内联 blob）；否则 JS 正则引擎
 *  （createJavaScriptRegexEngine，无 wasm 依赖）。 */
function getOrCreateHighlighter(preferredHighlighter: PreferredHighlighter = "shiki-js"): Promise<ShikiHighlighter> | ShikiHighlighter {
  return (highlighterSingleton ??= createHighlighter({
    themes: [],
    langs: [],
    engine: preferredHighlighter === "shiki-wasm" ? createOnigurumaEngine(Promise.resolve().then(() => (initOnigurumaWasm(), ONIGURUMA_WASM_MODULE))) : createJavaScriptRegexEngine(),
  }));
}

/** 原 eu：自定义扩展校验——version 与 map 必须成对出现。 */
function applyCustomExtensions({ customExtensionsVersion: extensionsVersion, customExtensionMap: extensionMap }: { customExtensionsVersion?: number | null; customExtensionMap?: Record<string, string> | null }): void {
  if (!(extensionsVersion == null && extensionMap == null)) {
    if (extensionsVersion == null || extensionMap == null)
      throw Error("Worker request must include both customExtensionsVersion and customExtensionMap");
    setCustomExtensions(extensionsVersion, extensionMap);
  }
}

/** 原 tu */
function postFileSuccess(id: string, result: RenderResult, options: unknown): void {
  postMessage({ type: "success", requestType: "file", id, result, options, sentAt: Date.now() });
}

/** 原 nu */
function postDiffSuccess(id: string, result: RenderResult, options: unknown): void {
  postMessage({ type: "success", requestType: "diff", id, result, options, sentAt: Date.now() });
}

/** 原 ru：错误响应（Error 取 message+stack，其余 String 化）。 */
function postErrorResponse(id: string, error: unknown): void {
  const response: WorkerResponse = {
    type: "error",
    id,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  };
  postMessage(response);
}

export type { FileDiff, DiffHunk, RenderOptions, RenderResult, WorkerRequest, WorkerResponse };

/* ============================================================================
 * SYMBOLS: 原名(minified) -> 语义名（全部见 §二 映射表）
 * ============================================================================
 * 自研段符号 44 个全量重建：
 *   el initOnigurumaWasm | tl LINE_SPLIT_REGEX | nl DEFAULT_DIFFS_THEMES
 *   rl resolvedLanguageMap | il loadedLanguageNames | al loadResolvedLanguages
 *   ol resolvedThemeMap | sl loadedThemeNames | cl loadResolvedThemes
 *   Z customExtensionMap | ll customExtensionsVersion
 *   ul EXTENSION_TO_LANGUAGE | dl resolveLanguageForFileName | fl setCustomExtensions
 *   pl stripTrailingNewline | ml hastText | hl hastElement | gl findCodeElement
 *   _l processLine | vl NO_TOKEN | yl MULTIPLE_TOKENS | bl groupTokensByCharPosition
 *   xl getCharPosition | Sl clearCharPositions | Cl setCharPosition
 *   wl createDiffTransformers | Tl styleToClassTransformer | El TOKEN_STYLE_NORMALIZER
 *   Q cssVariablePrefix | Dl buildThemeStyles | Ol buildThemeColorVars | kl getLineNodes
 *   Al iterateOverDiff | jl resolveCollapsedRange | Ml hasTrailingContext
 *   Nl computeChangeRanges | Pl buildChangeItem | Fl createDiffSpanDecoration
 *   Il appendDiffSegment | Ll DEFAULT_WINDOW_OPTIONS | Rl renderDiff
 *   zl computeLineDecorations | Bl createHunkAccumulator | Vl highlightFilePair
 *   Hl iterateLines | Ul splitLines | Wl DEFAULT_WINDOW_OPTIONS(file)
 *   Gl renderFile | Kl joinLineSlice | ql highlighterSingleton | $ renderOptions
 *   Jl handleWorkerMessage | Yl handleInitialize | Xl handleSetRenderOptions
 *   Zl handleFileRequest | Ql handleDiffRequest | $l getOrCreateHighlighter
 *   eu applyCustomExtensions | tu postFileSuccess | nu postDiffSuccess | ru postErrorResponse
 * vendor 段登记（不转写）：§一 表 1–6 段。
 * ============================================================================ */
