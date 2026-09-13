/**
 * 自写语法高亮 —— 不引 shiki 的代码块 token 化器（字符扫描器，非正则地狱）。
 *
 * 取舍（uiux-reference.md §6/§7）：活壳的代码块是 streamdown + shiki（懒加载分包、
 * 双主题、行号 CSS counter）。shiki 对我们意味着 MB 级依赖 + 异步加载态管理，
 * 而观感收益的大头是**结构**（语言条/行号/复制）与「关键字/字符串/注释分色」。
 * 故自写扫描器：每行独立 token 化（行号对齐、流式追加无需跨行状态），
 * 类别 = comment / string / number / keyword / func / type / punct。
 *
 * 颜色走 styles.css 里我们自己的语义层（--code-*，亮/暗各一套），不写死色值。
 * 认不出的语言落 generic：字符串/注释/数字仍分色，关键字不分——**朴素而非错乱**。
 */
import type { ReactNode } from "react";

export type Tok = { c: string | null; t: string };

const KW_TS = new Set(
  ("const let var function return if else for while import from export type interface class extends implements new await async try catch finally throw switch case break continue default delete in of instanceof typeof void yield static public private protected readonly enum as satisfies keyof infer never unknown any string number boolean null undefined true false this super").split(
    " ",
  ),
);
const KW_RUST = new Set(
  ("fn let mut const struct enum impl trait pub use mod crate self super match if else for while loop return break continue as in ref move async await dyn where type static unsafe true false").split(
    " ",
  ),
);
const KW_PY = new Set(
  ("def class return if elif else for while import from as with try except finally raise pass break continue lambda yield global nonlocal assert del in is not and or None True False self").split(
    " ",
  ),
);
const KW_BASH = new Set(
  ("if then else elif fi for while do done case esac function return in export local readonly shift source echo cd sudo set unset").split(
    " ",
  ),
);
const RUST_TYPES = new Set(["Some", "None", "Ok", "Err", "String", "Vec", "Option", "Result", "Box", "Self"]);

function keywordSet(lang: string): Set<string> | null {
  switch (lang) {
    case "ts":
    case "tsx":
    case "js":
    case "jsx":
      return KW_TS;
    case "rust":
      return KW_RUST;
    case "py":
      return KW_PY;
    case "bash":
      return KW_BASH;
    default:
      return null;
  }
}

function commentPrefixes(lang: string): string[] {
  switch (lang) {
    case "py":
    case "bash":
    case "toml":
    case "yaml":
      return ["#"];
    case "sql":
      return ["--"];
    case "json":
      return [];
    default:
      return ["//"];
  }
}

export function normalizeLang(raw: string | null): string {
  if (raw === null) return "text";
  const l = raw.toLowerCase();
  if (l === "typescript") return "ts";
  if (l === "javascript") return "js";
  if (l === "python") return "py";
  if (l === "rs") return "rust";
  if (l === "sh" || l === "shell" || l === "zsh" || l === "shell-session") return "bash";
  return l;
}

const IS_DIGIT = /[0-9]/;
const IS_IDENT_START = /[A-Za-z_]/;
const IS_IDENT = /[A-Za-z0-9_]/;
const IS_NUMBODY = /[0-9._xXa-fA-F]/;
const BACKSLASH = String.fromCharCode(92);

/** 单行 token 化。注释吃到行尾；字符串支持转义；其余按 ident/数字/标点分。 */
export function tokenizeLine(line: string, lang: string): Tok[] {
  const out: Tok[] = [];
  const kw = keywordSet(lang);
  const cm = commentPrefixes(lang);
  let i = 0;
  let plain = "";
  const flushPlain = (): void => {
    if (plain.length > 0) {
      out.push({ c: null, t: plain });
      plain = "";
    }
  };
  while (i < line.length) {
    const ch = line[i] as string;
    if (cm.some((p) => line.startsWith(p, i))) {
      flushPlain();
      out.push({ c: "comment", t: line.slice(i) });
      return out;
    }
    if (ch === '"' || ch === "'") {
      flushPlain();
      let j = i + 1;
      while (j < line.length) {
        const cj = line[j] as string;
        if (cj === BACKSLASH) {
          j += 2;
          continue;
        }
        if (cj === ch) {
          j++;
          break;
        }
        j++;
      }
      out.push({ c: "string", t: line.slice(i, j) });
      i = j;
      continue;
    }
    if (IS_DIGIT.test(ch)) {
      flushPlain();
      let j = i;
      while (j < line.length && IS_NUMBODY.test(line[j] as string)) j++;
      out.push({ c: "number", t: line.slice(i, j) });
      i = j;
      continue;
    }
    if (IS_IDENT_START.test(ch)) {
      flushPlain();
      let j = i;
      while (j < line.length && IS_IDENT.test(line[j] as string)) j++;
      const word = line.slice(i, j);
      const next = line[j] ?? "";
      let c: string | null = null;
      if (kw !== null && kw.has(word)) c = "keyword";
      else if (lang === "rust" && RUST_TYPES.has(word)) c = "type";
      else if (/^[A-Z]/.test(word)) c = "type";
      else if (next === "(") c = "func";
      out.push({ c, t: word });
      i = j;
      continue;
    }
    if (ch === " " || ch === "\t") {
      plain += ch;
      i++;
      continue;
    }
    flushPlain();
    out.push({ c: "punct", t: ch });
    i++;
  }
  flushPlain();
  return out;
}

export function highlightLines(code: string, rawLang: string | null): Tok[][] {
  const lang = normalizeLang(rawLang);
  return code.split("\n").map((line) => tokenizeLine(line, lang));
}

export function renderTokens(line: Tok[], keyBase: string): ReactNode[] {
  return line.map((t, i) =>
    t.c === null ? (
      t.t
    ) : (
      <span key={keyBase + ":" + String(i)} className={"tok tok--" + t.c}>
        {t.t}
      </span>
    ),
  );
}
