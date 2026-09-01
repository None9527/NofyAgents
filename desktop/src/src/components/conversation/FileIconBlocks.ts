// A1-P1-B15：文件图标域逐字重建（styles js 5064–5267，共 204 行，24 处改名）。
// 真身基准（只读）：desktop/src/out/renderer/assets/styles-CdEGpc2x.js（md5 48d71d4874b0868d61fd35a328bf6ad5）。
// 落点裁定：新叶（B14 留批第 3 项「文件图标域（zc/Vc 束 5198–5270）收割可同时解 CodeSurfaceBlocks 二 declare
//   与 PreviewCards 二 declare」+ B14 §八 3 建议）；消费面三处 declare 收敛：CodeSurfaceBlocks（Vc/zc）、
//   components/conversation/PreviewCards（Vc/zc 复制件）、ConversationToolViews（Vc/zc/Hc）。
// 逐字证明：/tmp/a1r0-p1/p15/p15-roundtrip.js（AST 逆映射还原 ≡ bundle 逐字 EXACT）+ p15-leafcheck.js（正则独立路线）。
// 函数体内局部变量保留混淆名（B5 约定）；型缝 `: any` 参数缝见 p15/seams-FileIconBlocks.json，均带〔A1-P1-B15〕。
// 区段切分墓碑：左界 kc var 链@5064（Qse 表域同段携带）；右界 Hc@5267 闭包末（Uc@5268 diffs 域 var 链邻接，F19 留批）。
// 映射表（minified → 语义名 → bundle 定义行）：
//   【真实 import】Q→React | Go→baseName（modules/MarkdownIntegration，styles 1928 既录）| Ko→isAbsolutePath（同，1941 既录）
//   【图标名表域 5064–5133】kc→DEFAULT_FILE_ICON_NAME | Xse→FILE_ICON_NAME_TABLE | Zse→FILE_ICON_EXTENSION_TABLE
//   【路径助手 5135–5139】Ac→normalizeIconPathSlashes | jc→trimTrailingSlashes
//   【图标解析 5141–5204】Qse→resolveFileIconName（5141）| Mc→FALLBACK_DOCUMENT_ICON_DATA_URL（5159）| Nc→fileIconBasePathState（5160）
//   $se→setFileIconBasePath（5161）| ece→resolveMaterialIconsBase（5164）| Pc→materialIconSrc（5167）| tce→resolveFileIconSrc（5170）
//   Fc→FOLDER_ICON_SRC（5173）| Ic→DEFAULT_FILE_ICON_SRC（5174）| Lc→resolveIconErrorFallback（5175）
//   Rc→relativizePathAgainstBase（5184）| nce→extractParentDirectory（5190）| zc→resolveFileIconMeta（5198）
//   【组件 5205–5267】Bc→FileIconWithName（5205）| Vc→FileIcon（5243）| Hc→resolvePathTitle（5263）
/* eslint-disable */
import * as $ from "react/jsx-runtime"; // 原 $（jsx-runtime-B5yMD3-t.js；A1-R15 判例：编译形 JSX 消费面）
import * as React from "react"; // 原 Q（react-BQLj9xdT.js）
import { baseName, isAbsolutePath } from '../../modules/MarkdownIntegration'; // 原 Go/Ko（styles 1928/1941 既录 canonical）

/* ── 文件图标域（styles 5064–5267） ── */
var DEFAULT_FILE_ICON_NAME = `document`,
  FILE_ICON_NAME_TABLE: Record<string, string> = {
    ".editorconfig": `editorconfig`,
    ".env": `settings`,
    ".gitattributes": `git`,
    ".gitignore": `git`,
    ".npmrc": `npm`,
    ".nvmrc": `nodejs_alt`,
    ".prettierrc": `prettier`,
    ".yarnrc": `yarn`,
    "babel.config": `babel`,
    bun: `lock`,
    "bun.lock": `lock`,
    cargo: `rust`,
    "cargo.lock": `lock`,
    dockerfile: `docker`,
    eslint: `eslint`,
    "eslint.config": `eslint`,
    gemfile: `gemfile`,
    jest: `jest`,
    "jest.config": `jest`,
    makefile: `makefile`,
    "package-lock": `lock`,
    "pnpm-lock": `lock`,
    readme: `readme`,
    tsconfig: `tsconfig`,
    vitest: `vitest`,
    "vitest.config": `vitest`,
    yarn: `yarn`,
  },
  FILE_ICON_EXTENSION_TABLE: Record<string, string> = {
    backup: `document`,
    bash: `console`,
    cjs: `javascript`,
    cts: `typescript`,
    css: `css`,
    doc: `word`,
    docx: `word`,
    go: `go`,
    html: `html`,
    java: `java`,
    jpeg: `image`,
    jpg: `image`,
    js: `javascript`,
    jsx: `react`,
    json: `json`,
    jsonl: `json`,
    mjs: `javascript`,
    md: `markdown`,
    mts: `typescript`,
    pdf: `pdf`,
    php: `php`,
    png: `image`,
    pptx: `powerpoint`,
    py: `python`,
    responses: `json`,
    rs: `rust`,
    sb: `storybook`,
    sql: `database`,
    sh: `console`,
    snap: `snapcraft`,
    svg: `svg`,
    toml: `toml`,
    ts: `typescript`,
    tsx: `react_ts`,
    txt: `document`,
    xlsx: `table`,
    yaml: `yaml`,
    yml: `yaml`,
    zsh: `console`,
  };
function normalizeIconPathSlashes(e: any) {
  return e.replace(/\\/g, `/`);
}
function trimTrailingSlashes(e: any) {
  return e.replace(/\/+$/, ``);
}
function resolveFileIconName(e: any) {
  let t = normalizeIconPathSlashes(e),
    n = t.lastIndexOf(`/`),
    r = n === -1 ? t : t.slice(n + 1),
    i = r.toLowerCase(),
    a = r.lastIndexOf(`.`),
    o = a === -1 ? i : i.slice(0, a),
    s = new Set([i, o]),
    c = o;
  for (; c.includes(`.`);) ((c = c.slice(0, c.lastIndexOf(`.`))), c && s.add(c));
  for (let e of s) {
    let t = FILE_ICON_NAME_TABLE[e];
    if (t) return t;
  }
  if (a === -1) return DEFAULT_FILE_ICON_NAME;
  let l = r.slice(a + 1).toLowerCase();
  return FILE_ICON_EXTENSION_TABLE[l] ?? l ?? `document`;
}
var FALLBACK_DOCUMENT_ICON_DATA_URL = `data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M4.5%201.5h4.586L12.5%204.914V13a1.5%201.5%200%200%201-1.5%201.5h-6A1.5%201.5%200%200%201%203.5%2013V3A1.5%201.5%200%200%201%205%201.5Z%22%20stroke%3D%22%252394A3B8%22%20stroke-width%3D%221.2%22%20stroke-linejoin%3D%22round%22%2F%3E%3Cpath%20d%3D%22M9%201.75V5h3.25%22%20stroke%3D%22%252394A3B8%22%20stroke-width%3D%221.2%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E`,
  fileIconBasePathState : any = null;
function setFileIconBasePath(e: any) {
  fileIconBasePathState = e;
}
function resolveMaterialIconsBase() {
  return `${`./`.replace(/\/?$/, `/`)}material-icons`;
}
function materialIconSrc(e: any) {
  return `${resolveMaterialIconsBase()}/${e}.svg`;
}
function resolveFileIconSrc(e: any) {
  return materialIconSrc(e);
}
var FOLDER_ICON_SRC = materialIconSrc(`folder`),
  DEFAULT_FILE_ICON_SRC = materialIconSrc(DEFAULT_FILE_ICON_NAME);
function resolveIconErrorFallback(e: any) {
  let t = DEFAULT_FILE_ICON_SRC;
  return e ===
    `data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M4.5%201.5h4.586L12.5%204.914V13a1.5%201.5%200%200%201-1.5%201.5h-6A1.5%201.5%200%200%201%203.5%2013V3A1.5%201.5%200%200%201%205%201.5Z%22%20stroke%3D%22%252394A3B8%22%20stroke-width%3D%221.2%22%20stroke-linejoin%3D%22round%22%2F%3E%3Cpath%20d%3D%22M9%201.75V5h3.25%22%20stroke%3D%22%252394A3B8%22%20stroke-width%3D%221.2%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E`
    ? null
    : e === t || e.endsWith(`/document.svg`)
      ? FALLBACK_DOCUMENT_ICON_DATA_URL
      : t;
}
function relativizePathAgainstBase(e: any, t: any) {
  if (!t) return e;
  let n = trimTrailingSlashes(normalizeIconPathSlashes(e)),
    r = trimTrailingSlashes(normalizeIconPathSlashes(t));
  return n === r ? `` : n.startsWith(`${r}/`) ? n.slice(r.length + 1) : e;
}
function extractParentDirectory(e: any, t: any) {
  let n = normalizeIconPathSlashes(e);
  if (!n || n === t) return null;
  let r = n.lastIndexOf(`/${t}`);
  if (r === -1) return null;
  let i = n.slice(0, r + 1);
  return i.length > 0 ? i : null;
}
function resolveFileIconMeta(e: any, t : any = {}) {
  let n = normalizeIconPathSlashes(e),
    r = baseName(n),
    i = extractParentDirectory(relativizePathAgainstBase(n, t.basePath ?? fileIconBasePathState ?? void 0), r),
    a = t.kind === `directory` ? `folder` : resolveFileIconName(r);
  return { fileIcon: a, fileIconSrc: resolveFileIconSrc(a), fileName: r, filePath: i, normalizedPath: n };
}
function FileIconWithName({ path: e, options: t }: any) {
  let n = resolveFileIconMeta(e, { basePath: t?.basePath, kind: t?.kind }),
    [r, i] = (0, React.useState)(n.fileIconSrc);
  return (
    (0, React.useEffect)(() => {
      i(n.fileIconSrc);
    }, [n.fileIconSrc]),
    (0, $.jsxs)(`span`, {
      className: t?.className ?? `inline-flex max-w-full items-center gap-1 `,
      children: [
        t?.showIcon === !1
          ? null
          : (0, $.jsx)(`img`, {
              src: r,
              alt: ``,
              width: t?.iconSize ?? 16,
              height: t?.iconSize ?? 16,
              className: `shrink-0`,
              "aria-hidden": `true`,
              onError: () => {
                let e = resolveIconErrorFallback(r);
                e && i(e);
              },
            }),
        (0, $.jsx)(`span`, {
          className: t?.fileNameClassName ?? `truncate text-ui-base font-medium text-foreground`,
          children: n.fileName,
        }),
        t?.showFilePath && n.filePath
          ? (0, $.jsx)(`span`, {
              className: t.filePathClassName ?? `truncate text-ui-base text-foreground-subtlest`,
              children: n.filePath,
            })
          : null,
      ],
    })
  );
}
function FileIcon({ src: e, size: t = 16, className: n }: any) {
  let [r, i] = (0, React.useState)(e);
  return (
    (0, React.useEffect)(() => {
      i(e);
    }, [e]),
    (0, $.jsx)(`img`, {
      src: r,
      alt: ``,
      width: t,
      height: t,
      className: n,
      "aria-hidden": `true`,
      onError: () => {
        let e = resolveIconErrorFallback(r);
        e && i(e);
      },
    })
  );
}
function resolvePathTitle(e: any, t: any) {
  let n = normalizeIconPathSlashes(e),
    r = relativizePathAgainstBase(n, t);
  return r ? (t || !isAbsolutePath(r) ? r : n) : baseName(n);
}

export { DEFAULT_FILE_ICON_NAME, FILE_ICON_NAME_TABLE, FILE_ICON_EXTENSION_TABLE, normalizeIconPathSlashes, trimTrailingSlashes, resolveFileIconName, FALLBACK_DOCUMENT_ICON_DATA_URL, fileIconBasePathState, setFileIconBasePath, resolveMaterialIconsBase, materialIconSrc, resolveFileIconSrc, FOLDER_ICON_SRC, DEFAULT_FILE_ICON_SRC, resolveIconErrorFallback, relativizePathAgainstBase, extractParentDirectory, resolveFileIconMeta, FileIconWithName, FileIcon, resolvePathTitle };
