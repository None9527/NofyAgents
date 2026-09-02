// A0-S4-4c: 自 modules/MarkdownCodeBlock.tsx 原样整体迁入（组件全族 + 私有辅助 + 局部型别 + 尾部符号表；原文件现为薄 re-export shim）。
// 仅导入路径按 components/markdown/ 深度改指（./ → ../../modules/；../components/ → ../；其余 ../ → ../../）；迁出体逐字未动。
/* eslint-disable */
/**
 * ============================================================================
 * MarkdownCodeBlock.tsx — ZCode 3.7.6 markdown 渲染层 · 代码块子模块
 * （解混淆重建 · D8 Stage B2）
 * ============================================================================
 *
 * 来源文件（21,756 行，未改动）：
 *   /home/none/grok-build/ref-ui/zcode-restored/out/renderer/assets/chunk-BO2N2NFS-CSNAeaxF.js
 * 对照 jsx：src-reconstructed/renderer/assets/chunk-BO2N2NFS-CSNAeaxF.jsx
 * 定性：streamdown@2.5.0 first-party 层 —— 代码块组件族。
 *
 * ----------------------------------------------------------------------------
 * 混淆名 → 语义名（js 行 / jsx 行；上游 streamdown 导出名见括注）
 * ----------------------------------------------------------------------------
 *   kv → CodeBlockBody          shiki token 渲染（导出别名 t，被
 *                               highlighted-body chunk 消费）(18522)
 *   Av → CodeBlockContainer     代码块外壳（data-streamdown=code-block）(18615)
 *   jv → CodeBlockContext       { code }（复制/下载按钮取码用）(18629)
 *   Mv → useCodeBlockContext    (18630)
 *   Nv → CodeBlockHeader        语言名条（data-streamdown=code-block-header）(18629)
 *   Pv → trimTrailingNewlines   (18650)
 *   Fv → LazyHighlightedBody    lazy(() => import('./highlighted-body-…')) (18650)
 *   Iv → CodeBlock              组装：头+动作条+正文（上游导出 CodeBlock=g）(18660)
 *   Gv → CodeBlockCopyButton    复制按钮（导出别名? 上游 i）(18983)
 *   Kv → LANGUAGE_FILE_EXTENSIONS 语言→扩展名表（~300 项）(19032)
 *   qv → CodeBlockDownloadButton 下载按钮（上游 j）(19340)
 *   Jv → CodeBlockSkeleton      mermaid/自定义块加载骨架（上游 k）(19368)
 *
 * 外部依赖：
 *   - MarkdownContext.tsx（上下文/钩子/cn/图标/文案/下载工具）
 *   - highlighted-body-OFNGDK62-RS9ZmWFH.js（懒加载的 shiki 高亮正文组件，
 *     已重建为 modules/highlightedCodeBlockBody.tsx）
 * ============================================================================
 */

import * as React from "react";
import {
  IsStreamingContext,
  StreamdownContext,
  STREAMDOWN_LINE_NUMBER_CLASS,
  useClassNames,
  useCodeHighlighter,
  useIsStreaming,
  useStreamdownIcons,
  useStreamdownTranslations,
  downloadFile,
  parseInlineStyle,
  type HighlightResult,
  type ShikiTheme,
} from "../../modules/MarkdownContext";

/* ============================================================================
 * 0. 懒加载依赖声明
 *    原 Fv（js 18650）：React.lazy(() => import('./highlighted-body-…').then(
 *    e => ({ default: e.HighlightedCodeBlockBody }))) —— shiki 高亮正文按需分包。
 * ==========================================================================*/

export interface HighlightedCodeBlockBodyProps {
  code: string;
  language: string;
  raw: HighlightResult;
  className?: string;
  startLine?: number;
  lineNumbers?: boolean;
}
declare const HighlightedCodeBlockBody: React.ComponentType<HighlightedCodeBlockBodyProps>;

/* ============================================================================
 * 1. CodeBlockBody（原 kv，js 18522-18614 / jsx 15458；上游导出名 CodeBlockBody）
 * ----------------------------------------------------------------------------
 * shiki 高亮结果的终端渲染器：
 *  - 外壳 div[data-streamdown=code-block-body][data-language]，overflow-x-auto；
 *  - pre 背景走 CSS 变量 --sdm-bg / 暗色 --shiki-dark-bg（双主题变量链）；
 *  - rootStyle 串解析进 style；
 *  - 每个 token 的颜色统一转成 --sdm-c / --sdm-tbg 变量 + text-[var(…)] 类，
 *    暗色经 --shiki-dark / --shiki-dark-bg 覆盖（shiki 双主题输出）；
 *  - 行号：CSS counter（counter-reset/counter-increment + ::before），
 *    startLine>1 时偏移 counter-reset；
 *  - memo 比较：result/language/className/startLine/lineNumbers 全等。
 * 导出别名 t —— highlighted-body chunk 的 `import { t } from chunk-BO2N2NFS`。
 * ==========================================================================*/

export interface CodeBlockBodyProps {
  children?: React.ReactNode;
  /** shiki 高亮结果 */
  result: HighlightResult;
  language: string;
  className?: string;
  /** 起始行号（>1 时 CSS counter 偏移） */
  startLine?: number;
  /** 是否显示行号（默认 true） */
  lineNumbers?: boolean;
  [prop: string]: unknown;
}

export const CodeBlockBody = React.memo(
  ({ children, result, language, className, startLine, lineNumbers = true, ...rest }: CodeBlockBodyProps) => {
    const cn = useClassNames();
    const lineNumberClass = React.useMemo(() => cn(STREAMDOWN_LINE_NUMBER_CLASS), [cn]);
    // shiki 根样式：bg/fg/rootStyle → CSS 变量（--sdm-bg/--sdm-fg + 解析后的内联样式）
    const rootStyle = React.useMemo(() => {
      const style: Record<string, string> = {};
      if (result.bg) style[`--sdm-bg`] = result.bg;
      if (result.fg) style[`--sdm-fg`] = result.fg;
      if (result.rootStyle) Object.assign(style, parseInlineStyle(result.rootStyle as string));
      return style;
    }, [result.bg, result.fg, result.rootStyle]);
    return (
      <div
        className={cn(className, `overflow-x-auto rounded-md border border-border bg-background p-4 text-sm`)}
        data-language={language}
        data-streamdown="code-block-body"
        {...rest}
      >
        <pre
          className={cn(
            className,
            `bg-[var(--sdm-bg,inherit]`,
            `dark:bg-[var(--shiki-dark-bg,var(--sdm-bg,inherit)]`,
          )}
          style={rootStyle}
        >
          <code
            className={lineNumbers ? cn(`[counter-increment:line_0] [counter-reset:line]`) : undefined}
            style={lineNumbers && startLine && startLine > 1 ? { counterReset: `line ${startLine - 1}` } : undefined}
          >
            {result.tokens.map((line, lineIndex) => (
              <span key={lineIndex} className={lineNumbers ? lineNumberClass : undefined}>
                {line.length === 0 || (line.length === 1 && line[0].content === ``)
                  ? `\n`
                  : line.map((token, tokenIndex) => {
                      const tokenStyle: Record<string, string> = {};
                      let hasBackground = !!token.bgColor;
                      if (token.color) tokenStyle[`--sdm-c`] = token.color;
                      if (token.bgColor) tokenStyle[`--sdm-tbg`] = token.bgColor;
                      if (token.htmlStyle)
                        for (const [property, value] of Object.entries(token.htmlStyle))
                          if (property === `color`) tokenStyle[`--sdm-c`] = value;
                          else if (property === `background-color`) {
                            tokenStyle[`--sdm-tbg`] = value;
                            hasBackground = true;
                          } else tokenStyle[property] = value;
                      return (
                        <span
                          key={tokenIndex}
                          className={cn(
                            `text-[var(--sdm-c,inherit)]`,
                            `dark:text-[var(--shiki-dark,var(--sdm-c,inherit))]`,
                            hasBackground && `bg-[var(--sdm-tbg)]`,
                            hasBackground && `dark:bg-[var(--shiki-dark-bg,var(--sdm-tbg))]`,
                          )}
                          style={tokenStyle}
                          {...token.htmlAttrs}
                        >
                          {token.content}
                        </span>
                      );
                    })}
              </span>
            ))}
          </code>
        </pre>
      </div>
    );
  },
  (prev, next) =>
    prev.result === next.result &&
    prev.language === next.language &&
    prev.className === next.className &&
    prev.startLine === next.startLine &&
    prev.lineNumbers === next.lineNumbers,
);
CodeBlockBody.displayName = `CodeBlockBody`;

/* ============================================================================
 * 2. CodeBlockContainer / 上下文 / Header（原 Av/jv/Mv/Nv，js 18615-18649）
 * ==========================================================================*/

/** 原 Av：代码块外壳。content-visibility:auto 降低长文档渲染成本 */
export const CodeBlockContainer: React.FC<
  React.HTMLAttributes<HTMLDivElement> & { language?: string; isIncomplete?: boolean }
> = ({ className, language, style, isIncomplete, ...rest }) => (
  <div
    className={useClassNames()(
      `my-4 flex w-full flex-col gap-2 rounded-xl border border-border bg-sidebar p-2`,
      className,
    )}
    data-incomplete={isIncomplete || undefined}
    data-language={language}
    data-streamdown="code-block"
    style={{ contentVisibility: `auto`, containIntrinsicSize: `auto 200px`, ...style }}
    {...rest}
  />
);

/** 原 jv/Mv：代码块上下文（复制/下载按钮从这里拿原始代码） */
export const CodeBlockContext = React.createContext<{ code: string }>({ code: `` });
export const useCodeBlockContext = (): { code: string } => React.useContext(CodeBlockContext);

/** 原 Nv：语言名条（左下角 mono 小写语言标签） */
export const CodeBlockHeader: React.FC<{ language?: string }> = ({ language }) => {
  const cn = useClassNames();
  return (
    <div
      className={cn(`flex h-8 items-center text-muted-foreground text-xs`)}
      data-language={language}
      data-streamdown="code-block-header"
    >
      <span className={cn(`ml-1 font-mono lowercase`)}>{language}</span>
    </div>
  );
};

/* ============================================================================
 * 3. 代码预处理 + 懒加载正文（原 Pv/Fv，js 18650-18659）
 * ==========================================================================*/

/** 原 Pv：去掉尾部连续换行（高亮输入与 raw 兜底共用） */
export const trimTrailingNewlines = (value: string): string => {
  let end = value.length;
  while (end > 0 && value[end - 1] === `\n`) end--;
  return value.slice(0, end);
};

/** 原 Fv：懒加载高亮正文（真实分包 = highlighted-body-OFNGDK62-RS9ZmWFH.js） */
const LazyHighlightedCodeBlockBody = React.lazy(async () => ({ default: HighlightedCodeBlockBody }));

/* ============================================================================
 * 4. CodeBlock（原 Iv，js 18660-18730 / jsx 15513；上游导出名 CodeBlock）
 * ----------------------------------------------------------------------------
 * 组装：CodeBlockContext.Provider → CodeBlockContainer →
 *   [CodeBlockHeader] + [sticky 动作条（children 注入复制/下载按钮）] +
 *   Suspense{ fallback=CodeBlockBody(raw 纯文本降级) ; LazyHighlightedCodeBlockBody }
 * raw 降级结果 = 每行一个 inherit 色 token（无高亮器时直接可见）。
 * ==========================================================================*/

export interface CodeBlockProps {
  code: string;
  language: string;
  className?: string;
  /** 动作按钮（复制/下载），sticky 悬浮在代码块右上 */
  children?: React.ReactNode;
  /** 流式未收尾（代码栅栏未闭合）标记 */
  isIncomplete?: boolean;
  startLine?: number;
  lineNumbers?: boolean;
  [prop: string]: unknown;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language,
  className,
  children,
  isIncomplete = false,
  startLine,
  lineNumbers,
  ...rest
}) => {
  const cn = useClassNames();
  const trimmedCode = React.useMemo(() => trimTrailingNewlines(code), [code]);
  // 无高亮时的纯文本降级结果（每行一个 inherit token）
  const rawResult = React.useMemo<HighlightResult>(
    () => ({
      bg: `transparent`,
      fg: `inherit`,
      tokens: trimmedCode
        .split(`\n`)
        .map((line) => [{ content: line, color: `inherit`, bgColor: `transparent`, htmlStyle: {}, offset: 0 }]),
    }),
    [trimmedCode],
  );
  return (
    <CodeBlockContext.Provider value={{ code }}>
      <CodeBlockContainer isIncomplete={isIncomplete} language={language}>
        <CodeBlockHeader language={language} />
        {children ? (
          <div className={cn(`pointer-events-none sticky top-2 z-10 -mt-10 flex h-8 items-center justify-end`)}>
            <div
              className={cn(
                `pointer-events-auto flex shrink-0 items-center gap-2 rounded-md border border-sidebar bg-sidebar/80 px-1.5 py-1 supports-[backdrop-filter]:bg-sidebar/70 supports-[backdrop-filter]:backdrop-blur`,
              )}
              data-streamdown="code-block-actions"
            >
              {children}
            </div>
          </div>
        ) : null}
        <React.Suspense
          fallback={<CodeBlockBody className={className} language={language} lineNumbers={lineNumbers} result={rawResult} startLine={startLine} {...rest} />}
        >
          <LazyHighlightedCodeBlockBody
            className={className}
            code={trimmedCode}
            language={language}
            lineNumbers={lineNumbers}
            raw={rawResult}
            startLine={startLine}
            {...rest}
          />
        </React.Suspense>
      </CodeBlockContainer>
    </CodeBlockContext.Provider>
  );
};

/* ============================================================================
 * 5. CodeBlockCopyButton（原 Gv，js 18983-19031 / jsx 15618）
 *    clipboard.writeText；2s 内显示 check 图标；isAnimating 时禁用
 *    （流式动画期间禁止复制，避免拿到半截内容）。
 * ==========================================================================*/

export interface CodeBlockCopyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onCopy?: () => void;
  onError?: (error: unknown) => void;
  /** 复制成功后 check 态保持时长（默认 2000ms） */
  timeout?: number;
  children?: React.ReactNode;
  className?: string;
  /** 显式代码（缺省取 CodeBlockContext 中的代码） */
  code?: string;
}

export const CodeBlockCopyButton: React.FC<CodeBlockCopyButtonProps> = ({
  onCopy,
  onError,
  timeout = 2000,
  children,
  className,
  code,
  ...rest
}) => {
  const cn = useClassNames();
  const [copied, setCopied] = React.useState(false);
  const timeoutRef = React.useRef(0);
  const { code: contextCode } = React.useContext(CodeBlockContext);
  const { isAnimating } = React.useContext(StreamdownContext);
  const translations = useStreamdownTranslations();
  const codeToCopy = code ?? contextCode;
  const handleCopy = async () => {
    if (typeof window === `undefined` || !navigator?.clipboard?.writeText) {
      onError?.(Error(`Clipboard API not available`));
      return;
    }
    try {
      if (copied) return;
      await navigator.clipboard.writeText(codeToCopy);
      setCopied(true);
      onCopy?.();
      timeoutRef.current = window.setTimeout(() => setCopied(false), timeout);
    } catch (error) {
      onError?.(error);
    }
  };
  React.useEffect(
    () => () => {
      window.clearTimeout(timeoutRef.current);
    },
    [],
  );
  const icons = useStreamdownIcons();
  const Icon = copied ? icons.CheckIcon : icons.CopyIcon;
  return (
    <button
      className={cn(
        `cursor-pointer p-1 text-muted-foreground transition-all hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50`,
        className,
      )}
      data-streamdown="code-block-copy-button"
      disabled={isAnimating}
      onClick={handleCopy}
      title={translations.copyCode}
      type="button"
      {...rest}
    >
      {children ?? <Icon size={14} />}
    </button>
  );
};

/* ============================================================================
 * 6. 语言 → 文件扩展名表（原 Kv，js 19032-19339 / jsx 15657）
 *    下载按钮用它给 `file.<ext>` 命名；~300 项逐字保留（节选注释：
 *    完整表与压缩源码一致，含 `文言: 'wy'` 等条目）。
 * ==========================================================================*/

export const LANGUAGE_FILE_EXTENSIONS: Record<string, string> = {
  "1c": `1c`,
  "1c-query": `1cq`,
  abap: `abap`,
  "actionscript-3": `as`,
  ada: `ada`,
  adoc: `adoc`,
  "angular-html": `html`,
  "angular-ts": `ts`,
  apache: `conf`,
  apex: `cls`,
  apl: `apl`,
  applescript: `applescript`,
  ara: `ara`,
  asciidoc: `adoc`,
  asm: `asm`,
  astro: `astro`,
  awk: `awk`,
  ballerina: `bal`,
  bash: `sh`,
  bat: `bat`,
  batch: `bat`,
  be: `be`,
  beancount: `beancount`,
  berry: `berry`,
  bibtex: `bib`,
  bicep: `bicep`,
  blade: `blade.php`,
  bsl: `bsl`,
  c: `c`,
  "c#": `cs`,
  "c++": `cpp`,
  cadence: `cdc`,
  cairo: `cairo`,
  cdc: `cdc`,
  clarity: `clar`,
  clj: `clj`,
  clojure: `clj`,
  "closure-templates": `soy`,
  cmake: `cmake`,
  cmd: `cmd`,
  cobol: `cob`,
  codeowners: `CODEOWNERS`,
  codeql: `ql`,
  coffee: `coffee`,
  coffeescript: `coffee`,
  "common-lisp": `lisp`,
  console: `sh`,
  coq: `v`,
  cpp: `cpp`,
  cql: `cql`,
  crystal: `cr`,
  cs: `cs`,
  csharp: `cs`,
  css: `css`,
  csv: `csv`,
  cue: `cue`,
  cypher: `cql`,
  d: `d`,
  dart: `dart`,
  dax: `dax`,
  desktop: `desktop`,
  diff: `diff`,
  docker: `dockerfile`,
  dockerfile: `dockerfile`,
  dotenv: `env`,
  "dream-maker": `dm`,
  edge: `edge`,
  elisp: `el`,
  elixir: `ex`,
  elm: `elm`,
  "emacs-lisp": `el`,
  erb: `erb`,
  erl: `erl`,
  erlang: `erl`,
  f: `f`,
  "f#": `fs`,
  f03: `f03`,
  f08: `f08`,
  f18: `f18`,
  f77: `f77`,
  f90: `f90`,
  f95: `f95`,
  fennel: `fnl`,
  fish: `fish`,
  fluent: `ftl`,
  for: `for`,
  "fortran-fixed-form": `f`,
  "fortran-free-form": `f90`,
  fs: `fs`,
  fsharp: `fs`,
  fsl: `fsl`,
  ftl: `ftl`,
  gdresource: `tres`,
  gdscript: `gd`,
  gdshader: `gdshader`,
  genie: `gs`,
  gherkin: `feature`,
  "git-commit": `gitcommit`,
  "git-rebase": `gitrebase`,
  gjs: `js`,
  gleam: `gleam`,
  "glimmer-js": `js`,
  "glimmer-ts": `ts`,
  glsl: `glsl`,
  gnuplot: `plt`,
  go: `go`,
  gql: `gql`,
  graphql: `graphql`,
  groovy: `groovy`,
  gts: `gts`,
  hack: `hack`,
  haml: `haml`,
  handlebars: `hbs`,
  haskell: `hs`,
  haxe: `hx`,
  hbs: `hbs`,
  hcl: `hcl`,
  hjson: `hjson`,
  hlsl: `hlsl`,
  hs: `hs`,
  html: `html`,
  "html-derivative": `html`,
  http: `http`,
  hxml: `hxml`,
  hy: `hy`,
  imba: `imba`,
  ini: `ini`,
  jade: `jade`,
  java: `java`,
  javascript: `js`,
  jinja: `jinja`,
  jison: `jison`,
  jl: `jl`,
  js: `js`,
  json: `json`,
  json5: `json5`,
  jsonc: `jsonc`,
  jsonl: `jsonl`,
  jsonnet: `jsonnet`,
  jssm: `jssm`,
  jsx: `jsx`,
  julia: `jl`,
  kotlin: `kt`,
  kql: `kql`,
  kt: `kt`,
  kts: `kts`,
  kusto: `kql`,
  latex: `tex`,
  lean: `lean`,
  lean4: `lean`,
  less: `less`,
  liquid: `liquid`,
  lisp: `lisp`,
  lit: `lit`,
  llvm: `ll`,
  log: `log`,
  logo: `logo`,
  lua: `lua`,
  luau: `luau`,
  make: `mak`,
  makefile: `mak`,
  markdown: `md`,
  marko: `marko`,
  matlab: `m`,
  md: `md`,
  mdc: `mdc`,
  mdx: `mdx`,
  mediawiki: `wiki`,
  mermaid: `mmd`,
  mips: `s`,
  mipsasm: `s`,
  mmd: `mmd`,
  mojo: `mojo`,
  move: `move`,
  nar: `nar`,
  narrat: `narrat`,
  nextflow: `nf`,
  nf: `nf`,
  nginx: `conf`,
  nim: `nim`,
  nix: `nix`,
  nu: `nu`,
  nushell: `nu`,
  objc: `m`,
  "objective-c": `m`,
  "objective-cpp": `mm`,
  ocaml: `ml`,
  pascal: `pas`,
  perl: `pl`,
  perl6: `p6`,
  php: `php`,
  plsql: `pls`,
  po: `po`,
  polar: `polar`,
  postcss: `pcss`,
  pot: `pot`,
  potx: `potx`,
  powerquery: `pq`,
  powershell: `ps1`,
  prisma: `prisma`,
  prolog: `pl`,
  properties: `properties`,
  proto: `proto`,
  protobuf: `proto`,
  ps: `ps`,
  ps1: `ps1`,
  pug: `pug`,
  puppet: `pp`,
  purescript: `purs`,
  py: `py`,
  python: `py`,
  ql: `ql`,
  qml: `qml`,
  qmldir: `qmldir`,
  qss: `qss`,
  r: `r`,
  racket: `rkt`,
  raku: `raku`,
  razor: `cshtml`,
  rb: `rb`,
  reg: `reg`,
  regex: `regex`,
  regexp: `regexp`,
  rel: `rel`,
  riscv: `s`,
  rs: `rs`,
  rst: `rst`,
  ruby: `rb`,
  rust: `rs`,
  sas: `sas`,
  sass: `sass`,
  scala: `scala`,
  scheme: `scm`,
  scss: `scss`,
  sdbl: `sdbl`,
  sh: `sh`,
  shader: `shader`,
  shaderlab: `shader`,
  shell: `sh`,
  shellscript: `sh`,
  shellsession: `sh`,
  smalltalk: `st`,
  solidity: `sol`,
  soy: `soy`,
  sparql: `rq`,
  spl: `spl`,
  splunk: `spl`,
  sql: `sql`,
  "ssh-config": `config`,
  stata: `do`,
  styl: `styl`,
  stylus: `styl`,
  svelte: `svelte`,
  swift: `swift`,
  "system-verilog": `sv`,
  systemd: `service`,
  talon: `talon`,
  talonscript: `talon`,
  tasl: `tasl`,
  tcl: `tcl`,
  templ: `templ`,
  terraform: `tf`,
  tex: `tex`,
  tf: `tf`,
  tfvars: `tfvars`,
  toml: `toml`,
  ts: `ts`,
  "ts-tags": `ts`,
  tsp: `tsp`,
  tsv: `tsv`,
  tsx: `tsx`,
  turtle: `ttl`,
  twig: `twig`,
  typ: `typ`,
  typescript: `ts`,
  typespec: `tsp`,
  typst: `typ`,
  v: `v`,
  vala: `vala`,
  vb: `vb`,
  verilog: `v`,
  vhdl: `vhdl`,
  vim: `vim`,
  viml: `vim`,
  vimscript: `vim`,
  vue: `vue`,
  "vue-html": `html`,
  "vue-vine": `vine`,
  vy: `vy`,
  vyper: `vy`,
  wasm: `wasm`,
  wenyan: `wy`,
  wgsl: `wgsl`,
  wiki: `wiki`,
  wikitext: `wiki`,
  wit: `wit`,
  wl: `wl`,
  wolfram: `wl`,
  xml: `xml`,
  xsl: `xsl`,
  yaml: `yaml`,
  yml: `yml`,
  zenscript: `zs`,
  zig: `zig`,
  zsh: `zsh`,
  文言: `wy`,
};

/* ============================================================================
 * 7. CodeBlockDownloadButton（原 qv，js 19340-19367 / jsx 15965）
 *    按语言扩展名下载 `file.<ext>`（未知语言 → .txt）。
 * ==========================================================================*/

export interface CodeBlockDownloadButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onDownload?: () => void;
  onError?: (error: unknown) => void;
  language?: string;
  children?: React.ReactNode;
  className?: string;
  code?: string;
}

export const CodeBlockDownloadButton: React.FC<CodeBlockDownloadButtonProps> = ({
  onDownload,
  onError,
  language,
  children,
  className,
  code,
  ...rest
}) => {
  const cn = useClassNames();
  const { code: contextCode } = React.useContext(CodeBlockContext);
  const { isAnimating } = React.useContext(StreamdownContext);
  const translations = useStreamdownTranslations();
  const icons = useStreamdownIcons();
  const codeToDownload = code ?? contextCode;
  const filename = `file.${language && language in LANGUAGE_FILE_EXTENSIONS ? LANGUAGE_FILE_EXTENSIONS[language] : `txt`}`;
  return (
    <button
      className={cn(
        `cursor-pointer p-1 text-muted-foreground transition-all hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50`,
        className,
      )}
      data-streamdown="code-block-download-button"
      disabled={isAnimating}
      onClick={() => {
        try {
          downloadFile(filename, codeToDownload, `text/plain`);
          onDownload?.();
        } catch (error) {
          onError?.(error);
        }
      }}
      title={translations.downloadFile}
      type="button"
      {...rest}
    >
      {children ?? <icons.DownloadIcon size={14} />}
    </button>
  );
};

/* ============================================================================
 * 8. CodeBlockSkeleton（原 Jv，js 19368-19381 / jsx 15993）
 *    mermaid / 自定义渲染块的 Suspense fallback（灰条 + spinner）。
 * ==========================================================================*/

export const CodeBlockSkeleton: React.FC = () => {
  const { Loader2Icon } = useStreamdownIcons();
  const cn = useClassNames();
  return (
    <div className={cn(`w-full divide-y divide-border overflow-hidden rounded-xl border border-border`)}>
      <div className={cn(`h-[46px] w-full bg-muted/80`)} />
      <div className={cn(`flex w-full items-center justify-center p-4`)}>
        <Loader2Icon className={cn(`size-4 animate-spin`)} />
      </div>
    </div>
  );
};

/* 供 MarkdownElements/MarkdownRenderer 使用的内部 re-export（保持依赖图清晰） */
export { IsStreamingContext, useIsStreaming, useCodeHighlighter };
export type { ShikiTheme };
